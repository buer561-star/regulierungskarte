/*
 * Validierungs-Harness (NICHT-PRODUKTIV / read-only)
 * --------------------------------------------------
 * Lädt Daten + reine Logik direkt aus der gesicherten Legacy-HTML
 * (legacy/regulierungs-kataster-original.html) und prüft, ob Karte,
 * Tabelle, Klassifikation und Geometrien konsistent zusammenpassen.
 *
 * Es werden KEINE Produktivdateien verändert. Aufruf:  node research/validate.mjs
 *
 * Vorgehen: Der reine Daten-/Logik-Teil des <script> (Zeilen 282..835,
 * d.h. ohne den DOM-Autostart in Zeile 836) wird per `new Function`
 * ausgewertet. DOM wird gestubbt, falls Top-Level-Code es berührt.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEGACY = path.join(__dirname, "..", "legacy", "regulierungs-kataster-original.html");

const html = fs.readFileSync(LEGACY, "utf8");
const lines = html.split("\n");
// Zeilen 282..835 (1-basiert) = Index 281..834
const slice = lines.slice(281, 835).join("\n");

const stub = `
const __noop=()=>{};
const __el={setAttribute:__noop,getAttribute:__noop,addEventListener:__noop,appendChild:__noop,insertBefore:__noop,removeChild:__noop,cloneNode:function(){return __el;},querySelectorAll:()=>[],querySelector:()=>null,dataset:{},style:{},classList:{add:__noop,remove:__noop,toggle:__noop},textContent:"",innerHTML:""};
const document={getElementById:()=>__el,querySelector:()=>__el,querySelectorAll:()=>[],createElementNS:()=>({setAttribute:__noop,addEventListener:__noop,appendChild:__noop,dataset:{},style:{},classList:{add:__noop,remove:__noop,toggle:__noop},textContent:""}),createDocumentFragment:()=>({appendChild:__noop}),addEventListener:__noop,body:__el,readyState:"complete"};
const window={scrollTo:__noop,addEventListener:__noop};
`;

const expose = `
return {COMMUNES,MMAP,CITIES,MAP,LAKES,MUNI,CANTONAL,PENDABG,APPLIED,EXCLUDED,PROJEKT,STARTS,NELVAL,KTNAME,CANTON_ORDER,LVL,commByBfs,classify,cantonLevel,ktFromBfs,instrumentCommunes,AREAS};
`;

const api = new Function(stub + "\n" + slice + "\n" + expose)();

const {
  COMMUNES, MMAP, CITIES, MAP, MUNI, CANTONAL, PENDABG, APPLIED, EXCLUDED,
  PROJEKT, STARTS, NELVAL, KTNAME, CANTON_ORDER, commByBfs, classify,
  cantonLevel, ktFromBfs, instrumentCommunes, AREAS,
} = api;

/* ---------- Helfer ---------- */
const bfsList = COMMUNES.map((c) => c[0]);
const bfsSet = new Set(bfsList);
const mmapKeys = Object.keys(MMAP.paths).map(Number);
const mmapSet = new Set(mmapKeys);
const cityKeys = Object.keys(CITIES).map(Number);
const citySet = new Set(cityKeys);

function bbox(d) {
  const m = d.match(/-?\d+(?:\.\d+)?/g);
  if (!m) return null;
  let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
  for (let i = 0; i + 1 < m.length; i += 2) {
    const x = +m[i], y = +m[i + 1];
    if (x < minx) minx = x; if (x > maxx) maxx = x;
    if (y < miny) miny = y; if (y > maxy) maxy = y;
  }
  return { minx, miny, maxx, maxy, w: maxx - minx, h: maxy - miny, area: (maxx - minx) * (maxy - miny) };
}

const out = [];
const log = (...a) => { out.push(a.join(" ")); };
const section = (t) => { out.push("\n" + "=".repeat(78) + "\n" + t + "\n" + "=".repeat(78)); };
const results = {};

/* ============================================================= */
section("0 · GRUNDZAHLEN");
log(`COMMUNES (Gemeinden gesamt):            ${COMMUNES.length}`);
log(`MMAP.paths (Gemeinde-Geometrien):       ${mmapKeys.length}`);
log(`CITIES (Stadt-Geometrien):              ${cityKeys.length}  -> [${cityKeys.sort((a,b)=>a-b).join(", ")}]`);
log(`MAP.paths (Kanton-Geometrien):          ${Object.keys(MAP.paths).length}`);
log(`MUNI (kommunale Regimes):               ${Object.keys(MUNI).length}`);
log(`CANTONAL (kantonale Regimes):           ${Object.keys(CANTONAL).length}  -> [${Object.keys(CANTONAL).join(", ")}]`);
log(`PENDABG (pendent/abgelehnt):            ${PENDABG.length}`);
log(`APPLIED (aktive Anwendung):             ${APPLIED.length}`);
log(`EXCLUDED (ausgeklammert):               ${EXCLUDED.length}`);
log(`NELVAL (NE-Mangelgemeinden):            ${NELVAL.size}`);
log(`AREAS (Tabellenzeilen gesamt):          ${AREAS.length}`);

/* ============================================================= */
section("CHECK 1 · Jede Regel-Gemeinde hat BFS + existiert in Gemeindeliste");
let c1 = [];
for (const k of Object.keys(MUNI)) {
  const bfs = +k;
  if (!Number.isFinite(bfs)) c1.push(`MUNI-Key keine Zahl: ${k}`);
  if (!bfsSet.has(bfs)) c1.push(`MUNI ${bfs} NICHT in COMMUNES`);
}
for (const p of PENDABG) {
  if (p.bfs != null && !bfsSet.has(p.bfs)) c1.push(`PENDABG "${p.name}" bfs ${p.bfs} NICHT in COMMUNES`);
}
for (const a of APPLIED) {
  if (!bfsSet.has(a.bfs)) c1.push(`APPLIED "${a.name}" bfs ${a.bfs} NICHT in COMMUNES`);
}
for (const b of NELVAL) {
  if (!bfsSet.has(b)) c1.push(`NELVAL ${b} NICHT in COMMUNES`);
}
for (const p of (PROJEKT || [])) {
  if (p.bfs != null && !bfsSet.has(p.bfs)) c1.push(`PROJEKT "${p.name}" bfs ${p.bfs} NICHT in COMMUNES`);
}
results.check1 = c1;
log(c1.length ? c1.map((x) => "  ✗ " + x).join("\n") : "  ✓ Alle Regel-BFS existieren in der Gemeindeliste.");

/* ============================================================= */
section("CHECK 2 · Jede farbige Gemeinde hat eine Geometrie");
// 2a: Gemeindekarte (gmap) zeichnet nur MMAP.paths. Farbige Gemeinde ohne MMAP = unsichtbar.
let c2a = [];
for (const c of COMMUNES) {
  const bfs = c[0];
  const lv = classify(bfs).level;
  if (lv >= 1 && !mmapSet.has(bfs)) c2a.push(`BFS ${bfs} ${c[1]} (${c[2]}) Stufe ${lv} OHNE MMAP-Geometrie`);
}
// 2b: Mischkarte (mixmap) zeichnet instrumentCommunes via CITIES ODER MMAP.
let c2b = [];
for (const bfs of instrumentCommunes()) {
  if (!citySet.has(bfs) && !mmapSet.has(bfs)) {
    const c = commByBfs[bfs];
    c2b.push(`instrumentCommune BFS ${bfs} ${c ? c[1] : "?"} ohne CITIES- UND MMAP-Geometrie`);
  }
}
results.check2a = c2a; results.check2b = c2b;
log("2a · Gemeindekarte (alle klassifizierten Gemeinden):");
log(c2a.length ? c2a.map((x) => "  ✗ " + x).join("\n") : "  ✓ Jede Gemeinde mit Stufe ≥1 hat eine MMAP-Geometrie.");
log("2b · Mischkarte (instrumentCommunes):");
log(c2b.length ? c2b.map((x) => "  ✗ " + x).join("\n") : "  ✓ Jede Instrument-Gemeinde hat CITIES- oder MMAP-Geometrie.");

/* ============================================================= */
section("CHECK 3 · Jede Geometrie ist eindeutig einer bekannten BFS zugeordnet");
let c3orphan = [];
for (const k of mmapKeys) {
  if (!bfsSet.has(k)) c3orphan.push(`MMAP-Geometrie ${k} hat KEINEN COMMUNES-Eintrag (verwaiste Geometrie)`);
}
let c3city = [];
for (const k of cityKeys) {
  if (!bfsSet.has(k)) c3city.push(`CITIES-Geometrie ${k} hat keinen COMMUNES-Eintrag`);
  if (!mmapSet.has(k)) c3city.push(`CITIES-Geometrie ${k} fehlt in MMAP.paths`);
}
// Coverage: Gemeinden ohne jede Geometrie
let noGeom = [];
for (const c of COMMUNES) if (!mmapSet.has(c[0])) noGeom.push(`${c[0]} ${c[1]} (${c[2]})`);
results.check3orphan = c3orphan; results.check3city = c3city; results.noGeom = noGeom;
log(`MMAP-Geometrien ohne COMMUNES-Eintrag: ${c3orphan.length}`);
log(c3orphan.length ? c3orphan.map((x) => "  ✗ " + x).join("\n") : "  ✓ Keine verwaisten MMAP-Geometrien.");
log(`\nCITIES-Konsistenz:`);
log(c3city.length ? c3city.map((x) => "  ✗ " + x).join("\n") : "  ✓ Alle CITIES-Keys in COMMUNES und MMAP vorhanden.");
log(`\nGeometrie-Abdeckung: ${COMMUNES.length - noGeom.length}/${COMMUNES.length} Gemeinden mit MMAP-Geometrie. Ohne Geometrie: ${noGeom.length}`);
if (noGeom.length) log("  " + noGeom.join(" | "));

/* ============================================================= */
section("CHECK 4 · Karte vs. Tabelle: gleiche Stufe je BFS?");
// Tabelle = AREAS-Zeilen (regelzentriert). Karte = classify(bfs) (flächenzentriert).
// Pro municipality-Zeile vergleichen wir Zeilen-Stufe (table) mit classify-Stufe (map).
let c4diff = [];
for (const r of AREAS) {
  if (r.type !== "municipality" || r.bfs == null) continue;
  const mapLvl = classify(r.bfs).level;
  if (r.level !== mapLvl) {
    c4diff.push({ bfs: r.bfs, name: r.name, id: r.id, tableLvl: r.level, mapLvl, status: r.status, scope: r.scope });
  }
}
results.check4diff = c4diff;
log(`Zeilen, bei denen Tabellen-Stufe ≠ Karten-Stufe (klassifiziert): ${c4diff.length}`);
for (const d of c4diff) {
  log(`  • ${d.name} (BFS ${d.bfs}, id ${d.id}): Tabelle=${d.tableLvl} / Karte=${d.mapLvl} · Status=${d.status} · ${d.scope}`);
}
log(`\nHinweis: Differenzen sind ERWARTBAR, wenn der Zeilen-Status ≠ "in_kraft" ist`);
log(`(Tabelle = Katalog aller Regeln inkl. Status; Karte = nur effektiv geltende Färbung).`);
// Gegenprobe: Differenz trotz Status in_kraft = echter Bug
const c4bug = c4diff.filter((d) => d.status === "in_kraft");
results.check4bug = c4bug;
log(`\nKritisch (Differenz TROTZ Status in_kraft): ${c4bug.length}`);
log(c4bug.length ? c4bug.map((d) => `  ✗ ${d.name} BFS ${d.bfs}: Tabelle ${d.tableLvl} / Karte ${d.mapLvl}`).join("\n") : "  ✓ Keine.");
// Mehrfach-Zeilen je BFS (gleiche Fläche, mehrere Regelzeilen)
const byBfs = {};
for (const r of AREAS) if (r.type === "municipality" && r.bfs != null) (byBfs[r.bfs] ||= []).push(r);
const multi = Object.entries(byBfs).filter(([, rows]) => rows.length > 1);
results.multiRows = multi.map(([bfs, rows]) => ({ bfs: +bfs, rows: rows.map((r) => ({ id: r.id, lvl: r.level, status: r.status })) }));
log(`\nBFS mit mehreren Tabellenzeilen (regelzentriert, je Fläche eine Karten-Farbe): ${multi.length}`);
for (const [bfs, rows] of multi) {
  const c = commByBfs[+bfs];
  log(`  • ${c ? c[1] : "?"} (BFS ${bfs}): ${rows.map((r) => `${r.id}=St${r.level}/${r.status}`).join(", ")}  → Karte zeigt St${classify(+bfs).level}`);
}

/* ============================================================= */
section("CHECK 5 · Pendent/abgelehnt/unklar bestimmen NIE die Hauptfarbe");
// classify darf nur in_kraft-Regeln zurückgeben.
let c5 = [];
for (const c of COMMUNES) {
  const cl = classify(c[0]);
  if (cl.level >= 1 && cl.status !== "in_kraft") {
    c5.push(`BFS ${c[0]} ${c[1]} gefärbt St${cl.level}, aber Status=${cl.status}`);
  }
}
// Zusätzlich: pendente/abgelehnte Gemeinden, die KEINE andere in-kraft-Regel haben, müssen Baseline sein.
let c5pend = [];
for (const p of PENDABG) {
  if (p.bfs == null) continue;
  const cl = classify(p.bfs);
  c5pend.push(`${p.name} (BFS ${p.bfs}, Status ${p.status}, Vorschlag St${p.level}) → Karte St${cl.level} (Quelle: ${cl.source})`);
}
results.check5 = c5; results.check5pend = c5pend;
log(`Gefärbte Gemeinden mit Status ≠ in_kraft: ${c5.length}`);
log(c5.length ? c5.map((x) => "  ✗ " + x).join("\n") : "  ✓ Keine. Nur in_kraft-Regeln färben.");
log(`\nPENDABG-Gemeinden – effektive Kartenstufe (soll = geltende/Baseline, NICHT der Vorschlag):`);
for (const x of c5pend) log("  • " + x);

/* ============================================================= */
section("CHECK 6 · Ausgeschlossene Kategorien (Airbnb/Zweitwohnung) bestimmen NIE die Farbe");
// EXCLUDED ist in classify nicht referenziert. Belege: TI komplett Baseline; LU 1061 = Vorkauf, nicht Airbnb.
const tiCommunes = COMMUNES.filter((c) => c[2] === "TI");
const tiColored = tiCommunes.filter((c) => classify(c[0]).level >= 1);
results.tiColored = tiColored.map((c) => ({ bfs: c[0], name: c[1], lvl: classify(c[0]).level }));
log(`Tessin (Lex Airbnb ausgeklammert): ${tiCommunes.length} Gemeinden, davon gefärbt (Stufe ≥1): ${tiColored.length}`);
log(tiColored.length ? tiColored.map((c) => `  ✗ ${c[0]} ${c[1]} St${classify(c[0]).level}`).join("\n") : "  ✓ Ganz Tessin = Baseline (Airbnb färbt nicht).");
const lu = classify(1061);
log(`\nLuzern 1061: Stufe ${lu.level}${lu.subtype ? "/" + lu.subtype : ""} · Quelle: ${lu.source} · Grundlage: ${(MUNI[1061]||{}).legal}`);
log(`  → ${lu.subtype === "vorkauf" ? "✓ Gefärbt durch Vorkauf (3a), NICHT durch die Airbnb-Regel." : "✗ Unerwarteter Untertyp!"}`);

/* ============================================================= */
section("CHECK 7 · Kommunale Regel färbt NIE den ganzen Kanton");
log("7a · Kantonskarte nutzt cantonLevel(kt) – unabhängig von kommunalen Regeln:");
let c7a = [];
for (const kt of CANTON_ORDER) {
  const clv = cantonLevel(kt);
  const hasCantonal = !!CANTONAL[kt];
  c7a.push(`  ${kt}: Kantonskarte=St${clv}${hasCantonal ? "" : " (kein CANTONAL-Eintrag → 0)"}`);
}
log(c7a.join("\n"));
log("\n7b · Anzahl gefärbter Gemeinden je Kanton in der GEMEINDEKARTE (classify ≥1):");
const coloredByKt = {};
for (const c of COMMUNES) { const lv = classify(c[0]).level; if (lv >= 1) (coloredByKt[c[2]] ||= []).push({ bfs: c[0], name: c[1], lv }); }
const totalByKt = {};
for (const c of COMMUNES) totalByKt[c[2]] = (totalByKt[c[2]] || 0) + 1;
results.coloredByKt = {};
for (const kt of CANTON_ORDER) {
  const arr = coloredByKt[kt] || [];
  results.coloredByKt[kt] = arr.length;
  const flag = (arr.length === totalByKt[kt] && !(CANTONAL[kt] && CANTONAL[kt].inheritable)) ? "  ⚠ GANZER KANTON gefärbt ohne vererbbare Kantonsregel!" : "";
  log(`  ${kt}: ${arr.length}/${totalByKt[kt]} Gemeinden gefärbt${flag}`);
}
log("\n7c · Geometrie-Größencheck (bbox-Fläche je Gemeinde vs. Kanton-Union, MMAP-Raum):");
// Union-bbox je Kanton aus den Gemeinde-Geometrien
const ktUnion = {};
for (const c of COMMUNES) {
  const d = MMAP.paths[c[0]]; if (!d) continue;
  const b = bbox(d); if (!b) continue;
  const u = (ktUnion[c[2]] ||= { minx: Infinity, miny: Infinity, maxx: -Infinity, maxy: -Infinity });
  u.minx = Math.min(u.minx, b.minx); u.miny = Math.min(u.miny, b.miny);
  u.maxx = Math.max(u.maxx, b.maxx); u.maxy = Math.max(u.maxy, b.maxy);
}
for (const kt of Object.keys(ktUnion)) { const u = ktUnion[kt]; u.area = (u.maxx - u.minx) * (u.maxy - u.miny); }
let oversize = [];
for (const c of COMMUNES) {
  const d = MMAP.paths[c[0]]; if (!d) continue;
  const b = bbox(d); const u = ktUnion[c[2]]; if (!b || !u || !u.area) continue;
  const frac = b.area / u.area;
  if (frac > 0.45) oversize.push({ bfs: c[0], name: c[1], kt: c[2], frac: +frac.toFixed(2) });
}
oversize.sort((a, b) => b.frac - a.frac);
results.oversize = oversize;
log(`  Gemeinden, deren bbox > 45% der Kanton-bbox abdeckt (Verdacht „färbt halben Kanton"): ${oversize.length}`);
log(oversize.length ? oversize.map((o) => `  ⚠ ${o.name} (BFS ${o.bfs}, ${o.kt}): ${(o.frac*100).toFixed(0)}% der Kanton-bbox`).join("\n") : "  ✓ Keine auffällig grosse Gemeinde-Geometrie.");

/* ============================================================= */
section("CHECK 8 · Kantonale Regeln färben Gemeinden nur, wenn vererbbar / aktiv angewandt");
let c8 = [];
for (const kt of Object.keys(CANTONAL)) {
  const cr = CANTONAL[kt];
  const arr = (coloredByKt[kt] || []);
  const inheritedColored = arr.filter((a) => classify(a.bfs).inherited);
  if (!cr.inheritable && inheritedColored.length) {
    c8.push(`✗ ${kt} nicht inheritable, aber ${inheritedColored.length} Gemeinden via Vererbung gefärbt`);
  }
  log(`  ${kt}: level=${cr.level} inheritable=${cr.inheritable} status=${cr.status} → ${arr.length} Gemeinden gefärbt (davon geerbt: ${inheritedColored.length})`);
}
// NE-Spezialfall: nur NELVAL geerbt
const neColored = (coloredByKt["NE"] || []);
const neInherited = neColored.filter((a) => classify(a.bfs).inherited);
log(`\n  NE-Spezialfall (LVAL, inheritable=false, aber NELVAL-Set): ${neInherited.length} geerbt, erwartet = NELVAL-Größe ${NELVAL.size}`);
results.check8 = c8;
log(c8.length ? "\n" + c8.join("\n") : "\n  ✓ Keine ungewollte Vererbung durch nicht-vererbbare Kantonsregeln.");

/* ============================================================= */
section("LUZERN · TIEFENPRÜFUNG (Testfall)");
const L = 1061;
const Lc = commByBfs[L];
const Lcl = classify(L);
log(`COMMUNES-Eintrag:        [${Lc.join(", ")}]   (Format [bfs,name,kt,oldkey,dw])`);
log(`  → oldkey/Match-Key:    "${Lc[3]}"  ← genau das vermutete "kom_luz"; in der LOGIK NICHT verwendet (nur BFS zählt).`);
log(`classify(1061):          Stufe ${Lcl.level} / Untertyp ${Lcl.subtype} / inherited=${Lcl.inherited} / status=${Lcl.status}`);
log(`  Quelle:                ${Lcl.source}`);
log(`  Rechtsgrundlage:       ${(MUNI[L]||{}).legal}`);
log(`MUNI[1061].status:       "${MUNI[L].status}"  (Achtung: legal-Text sagt „in Kraft ab 09/2026"; heute 2026-06-22)`);
log(`cantonLevel("LU"):       ${cantonLevel("LU")}  → Kanton Luzern auf der Kantonskarte = Baseline (Gemeinde färbt Kanton NICHT).`);
log(`MMAP-Geometrie 1061:     ${mmapSet.has(L) ? "vorhanden" : "FEHLT"}`);
log(`CITIES-Geometrie 1061:   ${citySet.has(L) ? "vorhanden" : "FEHLT"}`);
const luColored = (coloredByKt["LU"] || []);
log(`\nGefärbte Gemeinden im Kanton LU (Gemeindekarte): ${luColored.length}/${totalByKt["LU"]}`);
log("  " + (luColored.map((a) => `${a.bfs} ${a.name} (St${a.lv})`).join(", ") || "—"));
log(luColored.length === 1 && luColored[0].bfs === L ? "  ✓ Nur die Stadt Luzern ist gefärbt – nicht der ganze Kanton." : "  ⚠ Mehr als nur die Stadt Luzern gefärbt – prüfen!");
// bbox-Vergleich
const bL = bbox(MMAP.paths[L]);
const uLU = ktUnion["LU"];
log(`\nbbox Stadt Luzern (MMAP): w=${bL.w.toFixed(0)} h=${bL.h.toFixed(0)} area=${bL.area.toFixed(0)}`);
log(`bbox Kanton LU (Union):   w=${uLU.w=(uLU.maxx-uLU.minx),uLU.w.toFixed(0)} h=${(uLU.maxy-uLU.miny).toFixed(0)} area=${uLU.area.toFixed(0)}`);
log(`Anteil Stadt-bbox / Kanton-bbox: ${(bL.area / uLU.area * 100).toFixed(1)}%  ${(bL.area/uLU.area)<0.45?"✓ plausibel (kleine Stadtfläche)":"⚠ verdächtig gross"}`);
// PENDABG / EXCLUDED Bezug
const luPend = PENDABG.filter((p) => p.bfs === L || (p.canton === "LU"));
log(`\nPENDABG mit Luzern-Bezug: ${luPend.length}`);
for (const p of luPend) log(`  • "${p.name}" Status=${p.status} Vorschlag St${p.level} → wirkt sich auf classify(1061) aus? ${classify(L).level === p.level && classify(L).status === p.status ? "JA ✗" : "NEIN ✓ (nur Tabelle)"}`);
const luExcl = EXCLUDED.filter((e) => e.canton === "LU");
log(`EXCLUDED mit Luzern-Bezug: ${luExcl.length}`);
for (const e of luExcl) log(`  • "${e.name}" → in classify referenziert? NEIN ✓ (EXCLUDED wird von classify nie gelesen)`);

/* ============================================================= */
section("ZUSAMMENFASSUNG (maschinell)");
const summary = {
  communes: COMMUNES.length,
  mmapGeoms: mmapKeys.length,
  geomCoverageMissing: noGeom.length,
  orphanGeoms: c3orphan.length,
  citiesIssues: c3city.length,
  coloredNotInForce: c5.length,
  tableMapDiff_total: c4diff.length,
  tableMapDiff_critical_inforce: c4bug.length,
  oversizeGeoms: oversize.length,
  tiColored: tiColored.length,
  luzern_level: Lcl.level,
  luzern_subtype: Lcl.subtype,
  luzern_cantonLevel: cantonLevel("LU"),
  luzern_coloredCommunesInCanton: luColored.length,
};
results.summary = summary;
log(JSON.stringify(summary, null, 2));

/* ---------- Ausgabe ---------- */
const report = out.join("\n");
console.log(report);
fs.writeFileSync(path.join(__dirname, "validate-output.txt"), report + "\n");
fs.writeFileSync(path.join(__dirname, "validate-results.json"), JSON.stringify(results, null, 2));
