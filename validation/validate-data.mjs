/*
 * validation/validate-data.mjs — Daten-/Build-Konsistenzprüfung (READ-ONLY)
 * --------------------------------------------------------------------------
 * Aendert NICHTS. Meldet ERROR/WARN/INFO und beendet mit Exit-Code != 0 bei ERRORs.
 * Aufruf:  node validation/validate-data.mjs
 *
 * Eingaben:
 *  - Aktive Geometrie (Master 2025): build/ch-map.generated.json
 *      Fallback: eingebettetes mapdata-JSON aus index.html
 *  - Instrumente: src/data/instruments.json (Produktiv)  ODER
 *      DEMO-Konstanten INSTRUMENTE/GEM_INSTR aus build/index.template.html (Modus DEMO)
 *  - Optional: src/data/bfs-aliases.json
 *
 * Prüfungen C1..C10 siehe validation/VALIDATION_PLAN.md
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const P = (...p) => path.join(root, ...p);
const exists = (p) => fs.existsSync(p);
const STATUS_NON_MAP = new Set(["pending", "planned", "rejected", "unclear", "historical"]);

let errors = 0, warns = 0;
const log = (lvl, id, msg) => { if (lvl === "ERROR") errors++; if (lvl === "WARN") warns++; console.log(`  [${lvl}] ${id}: ${msg}`); };
const head = (t) => console.log("\n" + t);

/* ---------- 1. Aktive Geometrie laden ---------- */
function loadGeometry() {
  if (exists(P("build", "ch-map.generated.json"))) {
    const d = JSON.parse(fs.readFileSync(P("build", "ch-map.generated.json"), "utf8"));
    return { src: "build/ch-map.generated.json", bfs: new Set(d.gemeinden.map((g) => g.bfs)), kt: new Set(d.cantons.map((c) => c.nr)) };
  }
  if (exists(P("index.html"))) {
    const m = fs.readFileSync(P("index.html"), "utf8").match(/<script id="mapdata" type="application\/json">([\s\S]*?)<\/script>/);
    if (m) { const d = JSON.parse(m[1]); return { src: "index.html (mapdata)", bfs: new Set(d.gemeinden.map((g) => g.bfs)), kt: new Set(d.cantons.map((c) => c.nr)) }; }
  }
  return null;
}

/* ---------- 2. Instrument-Daten laden (real oder demo) ---------- */
function loadInstruments() {
  if (exists(P("src", "data", "instruments.json"))) {
    const d = JSON.parse(fs.readFileSync(P("src", "data", "instruments.json"), "utf8"));
    const instr = d.instruments || [];
    const gem = {};
    instr.filter((i) => i.territory_type === "municipality" && i.bfs_number != null && i.map_relevant)
      .forEach((i) => { (gem[i.bfs_number] ||= []).push(i.instrument_id); });
    return { mode: "PROD", src: "src/data/instruments.json", instruments: instr, gemInstr: gem, ids: new Set(instr.map((i) => i.instrument_id)) };
  }
  // Fallback: DEMO aus Template extrahieren
  const tpl = fs.readFileSync(P("build", "index.template.html"), "utf8");
  const im = tpl.match(/const INSTRUMENTE\s*=\s*(\[[\s\S]*?\]);/);
  const gm = tpl.match(/const GEM_INSTR\s*=\s*(\{[\s\S]*?\});/);
  if (!im || !gm) throw new Error("DEMO-Konstanten im Template nicht gefunden");
  const INSTRUMENTE = new Function("return (" + im[1] + ")")();
  const GEM_INSTR = new Function("return (" + gm[1] + ")")();
  return {
    mode: "DEMO", src: "build/index.template.html (inline DEMO)",
    instruments: INSTRUMENTE.map((i) => ({ instrument_id: i.id, demo: !!i.demo })),
    gemInstr: GEM_INSTR, ids: new Set(INSTRUMENTE.map((i) => i.id)),
  };
}

/* ---------- 3. Aliase (optional) ---------- */
function loadAliases() {
  if (!exists(P("src", "data", "bfs-aliases.json"))) return { map: new Map(), present: false };
  const d = JSON.parse(fs.readFileSync(P("src", "data", "bfs-aliases.json"), "utf8"));
  const map = new Map((d.aliases || []).map((a) => [a.old_bfs, a]));
  return { map, present: true };
}

/* ================= Lauf ================= */
console.log("=".repeat(74) + "\nVALIDATE-DATA · read-only\n" + "=".repeat(74));
const geo = loadGeometry();
if (!geo) { console.log("[ERROR] Keine aktive Geometrie gefunden (build/ch-map.generated.json oder index.html)."); process.exit(2); }
const data = loadInstruments();
const ali = loadAliases();
const isDemo = data.mode === "DEMO";
console.log(`Geometrie: ${geo.src}  (${geo.bfs.size} Gemeinden, ${geo.kt.size} Kantone)`);
console.log(`Instrumente: ${data.src}  → Modus ${data.mode} (${data.instruments.length} Instrumente, ${Object.keys(data.gemInstr).length} Gemeinde-Zuordnungen)`);
console.log(`Aliase: ${ali.present ? "src/data/bfs-aliases.json" : "keine"}`);

const resolveBfs = (b) => geo.bfs.has(b) ? b : (ali.map.has(b) ? ali.map.get(b).valid_bfs : null);

/* C1 + C9: Gemeinde-Zuordnungen referenzieren gültige BFS / kein stilles Verschwinden */
head("C1/C9 · Gemeinde-BFS gegen aktive Geometrie");
let c1 = 0;
for (const b of Object.keys(data.gemInstr).map(Number)) {
  const r = resolveBfs(b);
  if (r == null) { log("ERROR", "C1/C9", `BFS ${b} hat kein Polygon in der aktiven Geometrie und keinen Alias → Zuordnung würde unsichtbar verschwinden`); c1++; }
  else if (r !== b) { log("WARN", "C1", `BFS ${b} via Alias → ${r} aufgelöst`); }
}
if (!c1) log("OK", "C1/C9", `alle ${Object.keys(data.gemInstr).length} Gemeinde-Zuordnungen haben ein Polygon`);

/* C2: referenzierte Instrument-IDs existieren */
head("C2 · GEM_INSTR-IDs existieren in der Instrument-Tabelle");
let c2 = 0;
for (const [b, ids] of Object.entries(data.gemInstr)) for (const id of ids) if (!data.ids.has(id)) { log("ERROR", "C2", `BFS ${b} referenziert unbekannte Instrument-ID "${id}"`); c2++; }
if (!c2) log("OK", "C2", "alle referenzierten Instrument-IDs existieren");

/* C3..C6, C8: Felder echter Instrumente */
head("C3–C6/C8 · Pflichtfelder echter Instrumente");
if (isDemo) {
  log("INFO", "C3–C6/C8", "übersprungen (DEMO-Modus, keine Produktivdaten)");
} else {
  for (const i of data.instruments) {
    if (i.demo) continue;
    const cat = i.exclusive_category_id;
    if (!(i.needs_taxonomy_review === true) && !(Number.isInteger(cat) && cat >= 1 && cat <= 10)) log("ERROR", "C3", `${i.instrument_id}: keine gültige exklusive Kategorie (1..10) und needs_taxonomy_review≠true`);
    if (!i.status) log("ERROR", "C4", `${i.instrument_id}: status fehlt`);
    if (!i.source_quality) log("ERROR", "C5", `${i.instrument_id}: source_quality fehlt`);
    if (!i.last_checked) log("WARN", "C6", `${i.instrument_id}: last_checked fehlt`);
    if (i.map_relevant === true && STATUS_NON_MAP.has(i.status)) log("ERROR", "C8", `${i.instrument_id}: status="${i.status}" darf nicht map_relevant sein`);
  }
  if (!errors) log("OK", "C3–C6/C8", "Pflichtfelder/Map-Regeln erfüllt");
}

/* C7: DEMO-Kennzeichnung */
head("C7 · DEMO-Daten-Kennzeichnung");
if (isDemo) {
  const unmarked = data.instruments.filter((i) => !i.demo);
  if (unmarked.length) log("ERROR", "C7", `${unmarked.length} Instrument(e) im DEMO-Modus ohne demo-Markierung`);
  else log("INFO", "C7", "nur DEMO-Daten vorhanden; alle als demo markiert; keine Produktivdaten");
} else {
  const stray = data.instruments.filter((i) => i.demo);
  if (stray.length) log("WARN", "C7", `${stray.length} als demo markierte Instrument(e) in Produktivdaten`);
  else log("OK", "C7", "keine Demo-Instrumente in Produktivdaten");
}

/* C10: Aggregations-Kennzeichnung (UI-Invariante) */
head("C10 · Kantons-Aggregation");
log("INFO", "C10", "Kantonsfärbung ist Aggregat über Gemeinde-Instrumente, NICHT kantonales Recht — in der UI explizit zu kennzeichnen (noch offen).");

/* ---------- Summary ---------- */
console.log("\n" + "=".repeat(74));
console.log(`ERGEBNIS: ${errors} ERROR, ${warns} WARN  ·  Modus ${data.mode}`);
console.log("=".repeat(74));
process.exit(errors ? 1 : 0);
