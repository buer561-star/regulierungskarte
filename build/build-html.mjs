/*
 * build/build-html.mjs — injiziert build/ch-map.generated.json in das Template
 * und schreibt das fertige Single-File-Tool nach ./index.html
 *
 * Voraussetzung: vorher `node build/build-map-data.mjs` ausführen.
 * Aufruf:        node build/build-html.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const tpl = fs.readFileSync(path.join(__dirname, "index.template.html"), "utf8");
let json = fs.readFileSync(path.join(__dirname, "ch-map.generated.json"), "utf8");

// sicher in <script type="application/json"> einbetten (verhindert vorzeitiges </script>)
json = json.replace(/</g, "\\u003c");

if (!tpl.includes("__MAPDATA__")) throw new Error("Platzhalter __MAPDATA__ fehlt im Template");
const html = tpl.replace("__MAPDATA__", () => json);

const outFile = path.join(root, "index.html");
fs.writeFileSync(outFile, html);
const mb = (fs.statSync(outFile).size / (1024 * 1024)).toFixed(2);
console.log(`index.html geschrieben (${mb} MB)`);
