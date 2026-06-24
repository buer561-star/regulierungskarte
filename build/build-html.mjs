/*
 * build/build-html.mjs — baut ./index.html aus build/index.template.html
 *   - injiziert die Kartengeometrie (build/ch-map.generated.json) als __MAPDATA__
 *
 * Voraussetzung: vorher `node build/build-map-data.mjs`.
 * Aufruf:        node build/build-html.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const safe = (s) => s.replace(/</g, "\\u003c"); // sicher im <script type=application/json>

const tpl = fs.readFileSync(path.join(__dirname, "index.template.html"), "utf8");

// 1) Geometrie
const mapJson = fs.readFileSync(path.join(__dirname, "ch-map.generated.json"), "utf8");

// 2) Audit-Run (kantonaler Rechtsrahmen-Run; leer-tolerant)
const auditPath = path.join(root, "src", "data", "audit-run.json");
const auditJson = fs.existsSync(auditPath) ? fs.readFileSync(auditPath, "utf8") : JSON.stringify({ run_meta: {}, cantons: [] });

// 3) Wohnungsbestand je Gemeinde (GWS; leer-tolerant)
const dwellPath = path.join(root, "src", "data", "dwellings.json");
const dwellJson = fs.existsSync(dwellPath) ? fs.readFileSync(dwellPath, "utf8") : JSON.stringify({ total: 0, gemeinden: [] });

if (!tpl.includes("__MAPDATA__") || !tpl.includes("__AUDITDATA__") || !tpl.includes("__DWELLINGDATA__")) throw new Error("Platzhalter __MAPDATA__/__AUDITDATA__/__DWELLINGDATA__ fehlt im Template");
const html = tpl
  .replace("__MAPDATA__", () => safe(mapJson))
  .replace("__AUDITDATA__", () => safe(auditJson))
  .replace("__DWELLINGDATA__", () => safe(dwellJson));

const outFile = path.join(root, "index.html");
fs.writeFileSync(outFile, html);
const map = JSON.parse(mapJson);
const audit = JSON.parse(auditJson);
const dwell = JSON.parse(dwellJson);
const mb = (fs.statSync(outFile).size / (1024 * 1024)).toFixed(2);
console.log(`index.html geschrieben (${mb} MB) · Gemeinden: ${map.meta.counts.gemeinden}, Kantone: ${map.meta.counts.cantons}, Audit-Kantone: ${(audit.cantons || []).length}, Wohnungen-Gemeinden: ${(dwell.gemeinden || []).length}`);
