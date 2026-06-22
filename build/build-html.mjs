/*
 * build/build-html.mjs — baut ./index.html aus build/index.template.html
 *   - injiziert die Kartengeometrie (build/ch-map.generated.json) als __MAPDATA__
 *   - injiziert die Produktiv-Instrumentdaten (src/data/*) als __INSTRDATA__
 *
 * Voraussetzung: vorher `node build/build-map-data.mjs`.
 * Aufruf:        node build/build-html.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const readJSON = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const safe = (s) => s.replace(/</g, "\\u003c"); // sicher im <script type=application/json>

const tpl = fs.readFileSync(path.join(__dirname, "index.template.html"), "utf8");

// 1) Geometrie
const mapJson = fs.readFileSync(path.join(__dirname, "ch-map.generated.json"), "utf8");

// 2) Instrument-Produktivdaten (leer-tolerant)
const dPath = path.join(root, "src", "data");
const instruments = fs.existsSync(path.join(dPath, "instruments.json")) ? (readJSON(path.join(dPath, "instruments.json")).instruments || []) : [];
const relations = fs.existsSync(path.join(dPath, "territory-instruments.json")) ? (readJSON(path.join(dPath, "territory-instruments.json")).relations || []) : [];
const aliases = fs.existsSync(path.join(dPath, "bfs-aliases.json")) ? (readJSON(path.join(dPath, "bfs-aliases.json")).aliases || []) : [];
const instrJson = JSON.stringify({ instruments, relations, aliases });

// 3) Audit-/Evidenz-Daten (read-only Anzeigeebene; veraendert NICHTS an Karte/Klassifikation)
const reports = fs.existsSync(path.join(dPath, "audit-reports.json")) ? (readJSON(path.join(dPath, "audit-reports.json")).reports || []) : [];
const auditJson = JSON.stringify({ reports });

if (!tpl.includes("__MAPDATA__") || !tpl.includes("__INSTRDATA__") || !tpl.includes("__AUDITDATA__")) throw new Error("Platzhalter __MAPDATA__/__INSTRDATA__/__AUDITDATA__ fehlt im Template");
const html = tpl
  .replace("__MAPDATA__", () => safe(mapJson))
  .replace("__INSTRDATA__", () => safe(instrJson))
  .replace("__AUDITDATA__", () => safe(auditJson));

const outFile = path.join(root, "index.html");
fs.writeFileSync(outFile, html);
const mb = (fs.statSync(outFile).size / (1024 * 1024)).toFixed(2);
console.log(`index.html geschrieben (${mb} MB) · Instrumente: ${instruments.length}, Relationen: ${relations.length}, Aliase: ${aliases.length}, Auditberichte: ${reports.length}`);
