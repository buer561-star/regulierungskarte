/*
 * validation/validate-data.mjs — Daten-/Build-Konsistenzprüfung (READ-ONLY)
 * --------------------------------------------------------------------------
 * Aendert NICHTS. Meldet ERROR/WARN/INFO und beendet mit Exit-Code != 0 bei ERRORs.
 * Aufruf:  node validation/validate-data.mjs
 *
 * Eingaben:
 *  - Aktive Geometrie (Master 2025): build/ch-map.generated.json (Fallback: index.html mapdata)
 *  - Produktiv:  src/data/instruments.json  (Instrument-Tabelle)
 *                src/data/territory-instruments.json  (Relationen)
 *                src/data/bfs-aliases.json  (aktive Aliase)
 *  - Demo (nur Warnung): inline INSTRUMENTE/GEM_INSTR aus build/index.template.html
 *
 * Prüfungen siehe validation/VALIDATION_PLAN.md.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const P = (...p) => path.join(root, ...p);
const exists = (p) => fs.existsSync(p);
const readJSON = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const STATUS_NON_MAP = new Set(["pending", "planned", "rejected", "unclear", "historical"]);
const REQUIRED = ["instrument_id", "instrument_name", "territory_type", "status", "source_quality", "legal_basis", "primary_source_url"];

let errors = 0, warns = 0;
const log = (lvl, id, msg) => { if (lvl === "ERROR") errors++; if (lvl === "WARN") warns++; console.log(`  [${lvl}] ${id}: ${msg}`); };
const head = (t) => console.log("\n" + t);

/* ---------- Geometrie ---------- */
function loadGeometry() {
  if (exists(P("build", "ch-map.generated.json"))) {
    const d = readJSON(P("build", "ch-map.generated.json"));
    return { src: "build/ch-map.generated.json", bfs: new Set(d.gemeinden.map((g) => g.bfs)), kt: new Set(d.cantons.map((c) => c.nr)) };
  }
  if (exists(P("index.html"))) {
    const m = fs.readFileSync(P("index.html"), "utf8").match(/<script id="mapdata" type="application\/json">([\s\S]*?)<\/script>/);
    if (m) { const d = JSON.parse(m[1]); return { src: "index.html (mapdata)", bfs: new Set(d.gemeinden.map((g) => g.bfs)), kt: new Set(d.cantons.map((c) => c.nr)) }; }
  }
  return null;
}

/* ---------- Demo aus Template (nur Warnung) ---------- */
function loadDemo() {
  if (!exists(P("build", "index.template.html"))) return null;
  const tpl = fs.readFileSync(P("build", "index.template.html"), "utf8");
  const im = tpl.match(/const INSTRUMENTE\s*=\s*(\[[\s\S]*?\]);/);
  const gm = tpl.match(/const GEM_INSTR\s*=\s*(\{[\s\S]*?\});/);
  if (!im || !gm) return null;
  const INSTRUMENTE = new Function("return (" + im[1] + ")")();
  const GEM_INSTR = new Function("return (" + gm[1] + ")")();
  return { instruments: INSTRUMENTE, gemInstr: GEM_INSTR, demoCount: INSTRUMENTE.filter((i) => i.demo).length };
}

/* ================= Lauf ================= */
console.log("=".repeat(74) + "\nVALIDATE-DATA · read-only\n" + "=".repeat(74));
const geo = loadGeometry();
if (!geo) { console.log("[ERROR] Keine aktive Geometrie gefunden."); process.exit(2); }

// Optionaler Staging-Modus: node validate-data.mjs --findings <pfad-zu-findings.json>
const _fi = process.argv.indexOf("--findings");
const findingsPath = _fi >= 0 ? process.argv[_fi + 1] : null;
let instruments, relations, prodLabel;
if (findingsPath) {
  const fp = path.isAbsolute(findingsPath) ? findingsPath : path.join(process.cwd(), findingsPath);
  const d = readJSON(fp);
  instruments = d.instruments || []; relations = d.relations || []; prodLabel = `--findings ${findingsPath}`;
} else {
  instruments = exists(P("src", "data", "instruments.json")) ? (readJSON(P("src", "data", "instruments.json")).instruments || []) : null;
  relations = exists(P("src", "data", "territory-instruments.json")) ? (readJSON(P("src", "data", "territory-instruments.json")).relations || []) : null;
  prodLabel = "src/data/ (Produktiv)";
}
const aliasDoc = exists(P("src", "data", "bfs-aliases.json")) ? readJSON(P("src", "data", "bfs-aliases.json")) : { aliases: [] };
const aliasMap = new Map((aliasDoc.aliases || []).map((a) => [a.old_bfs, a]));
const demo = loadDemo();

console.log(`Geometrie: ${geo.src}  (${geo.bfs.size} Gemeinden, ${geo.kt.size} Kantone)`);
console.log(`Quelle [${prodLabel}]: instrumente=${instruments ? instruments.length : "FEHLT"}  ·  relationen=${relations ? relations.length : "FEHLT"}  ·  aktive Aliase=${aliasMap.size}`);
console.log(`Demo (Template): ${demo ? demo.demoCount + " Demo-Instrumente, " + Object.keys(demo.gemInstr).length + " Zuordnungen" : "keine"}`);

if (instruments === null || relations === null) {
  log("ERROR", "FILES", "Produktionsdateien fehlen (src/data/instruments.json und/oder territory-instruments.json).");
}
const instr = instruments || [];
const rel = relations || [];
const instrIds = new Set(instr.map((i) => i.instrument_id));
const realInstr = instr.filter((i) => i.demo !== true);
const resolveBfs = (b) => geo.bfs.has(b) ? b : (aliasMap.has(b) ? aliasMap.get(b).valid_bfs : null);

/* C-EMPTY: leere Produktivdaten = bestanden */
head("Produktivdaten-Status");
if (!instr.length && !rel.length) log("INFO", "EMPTY", "Produktivdaten leer → bestanden (keine echten Instrumente zu prüfen).");
else log("INFO", "PROD", `${realInstr.length} echte Instrumente, ${rel.length} Relationen werden geprüft.`);

/* C-DEMO: Demo vorhanden → Warnung */
head("Demo-Daten");
if (demo && demo.demoCount > 0) log("WARN", "DEMO", `App nutzt noch ${demo.demoCount} DEMO-Instrumente (build/index.template.html). Vor Produktivnutzung ersetzen.`);
else log("INFO", "DEMO", "keine Demo-Instrumente.");
// optionale Demo-BFS-Plausibilität (kein Fehler)
if (demo) for (const b of Object.keys(demo.gemInstr).map(Number)) if (resolveBfs(b) == null) log("WARN", "DEMO-GEO", `Demo-BFS ${b} ohne Polygon/Alias.`);

/* C3/C4/C5/C6/C8: echte Instrumente */
head("Echte Instrumente · Pflichtfelder / Kategorie / Map-Regel");
let fieldErr = 0;
for (const i of realInstr) {
  const idn = i.instrument_id || "(ohne id)";
  for (const f of REQUIRED) if (i[f] === undefined || i[f] === null || i[f] === "") { log("ERROR", "C-FIELDS", `${idn}: Pflichtfeld "${f}" fehlt`); fieldErr++; }
  const cat = i.exclusive_category_id;
  if (i.needs_taxonomy_review !== true && !(Number.isInteger(cat) && cat >= 1 && cat <= 10)) { log("ERROR", "C-CAT", `${idn}: keine gültige exklusive Kategorie (1..10) und needs_taxonomy_review≠true`); fieldErr++; }
  if (i.map_relevant === true && STATUS_NON_MAP.has(i.status)) { log("ERROR", "C-MAP", `${idn}: status="${i.status}" darf nicht map_relevant=true sein`); fieldErr++; }
  if (!i.last_checked) log("WARN", "C-CHK", `${idn}: last_checked fehlt`);
  if (!i.confidence) log("WARN", "C-CONF", `${idn}: confidence fehlt`);
}
if (realInstr.length && !fieldErr) log("OK", "INSTR", "alle echten Instrumente erfüllen Pflichtfelder/Kategorie/Map-Regel.");
if (!realInstr.length) log("INFO", "INSTR", "keine echten Instrumente vorhanden.");

/* C-REL: Relationen gegen Geometrie + Instrument-IDs */
head("Relationen · BFS/Kanton gültig, Instrument vorhanden");
let relErr = 0;
for (const r of rel) {
  const tag = r.instrument_id || "(ohne id)";
  if (!instrIds.has(r.instrument_id)) { log("ERROR", "C-REL-ID", `Relation referenziert unbekannte instrument_id "${r.instrument_id}"`); relErr++; }
  if (r.territory_type === "municipality") {
    const res = resolveBfs(r.bfs_number);
    if (res == null) { log("ERROR", "C-REL-BFS", `${tag}: bfs ${r.bfs_number} ohne Polygon/Alias → würde unsichtbar verschwinden`); relErr++; }
    else if (res !== r.bfs_number) log("WARN", "C-REL-ALIAS", `${tag}: bfs ${r.bfs_number} via Alias → ${res}`);
  } else if (r.territory_type === "canton") {
    if (!(Number.isInteger(r.canton_number) && r.canton_number >= 1 && r.canton_number <= 26)) { log("ERROR", "C-REL-KT", `${tag}: ungültige canton_number ${r.canton_number}`); relErr++; }
    if (r.map_relevant === true && r.relation_type !== "aggregate") log("WARN", "C-REL-AGG", `${tag}: kantonale map_relevant-Relation sollte relation_type="aggregate" tragen (Aggregation ≠ kantonales Recht).`);
  }
}
if (rel.length && !relErr) log("OK", "REL", "alle Relationen referenzieren gültige BFS/Kantone und existierende Instrumente.");
if (!rel.length) log("INFO", "REL", "keine Relationen vorhanden.");

/* ---------- Summary ---------- */
console.log("\n" + "=".repeat(74));
console.log(`ERGEBNIS: ${errors} ERROR, ${warns} WARN`);
console.log("=".repeat(74));
process.exit(errors ? 1 : 0);
