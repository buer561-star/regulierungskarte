/*
 * research/render-test.mjs — Headless-Render-Test der gebauten index.html
 * Benötigt jsdom (ad hoc):  npm install jsdom --no-save
 * Aufruf:                   node research/render-test.mjs
 */
import { JSDOM, VirtualConsole } from "jsdom";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const vc = new VirtualConsole(); vc.on("jsdomError", e => console.log("JSDOM-ERROR:", e.detail?.message || e.message));
const dom = new JSDOM(html, { runScripts: "dangerously", pretendToBeVisual: true, url: "https://example.org/", virtualConsole: vc });
const { window } = dom;
await new Promise(res => { if (window.document.readyState === "complete") return res(); window.addEventListener("load", res); setTimeout(res, 2000); });
const $ = s => window.document.querySelector(s), $$ = s => [...window.document.querySelectorAll(s)];
let fails = 0; const A = (c, m) => { if (!c) fails++; console.log((c ? "✓" : "✗ FAIL") + " " + m); };

A($$("#map path.area[data-bfs]").length === 2115, `Gemeindekarte: 2115 Gemeinde-Pfade`);
A($$("#map path.ktborder").length === 26, `26 Kantonsgrenzen`);
A($$("#map path.lake").length === 10, `10 Seen`);
A($$("#map text.ktlabel").length === 26, `26 Kantons-Labels`);
const zh = $('#map path[data-bfs="261"]');
A(zh && zh.getAttribute("fill").toUpperCase() === "#3B7DC4", `Zürich(261)=DEMO_A blau`);
A(/E4E7EA/i.test($('#map path[data-bfs="1"]').getAttribute("fill")), `Gemeinde ohne Instrument = neutral`);
$("#instr-none").dispatchEvent(new window.Event("click"));
A(/E4E7EA/i.test($('#map path[data-bfs="261"]').getAttribute("fill")), `nach 'keine': Zürich neutral`);
$("#instr-all").dispatchEvent(new window.Event("click"));
const cbA = $('#instr-controls input[data-id="DEMO_A"]'); cbA.checked = false; cbA.dispatchEvent(new window.Event("change"));
A(/E4E7EA/i.test($('#map path[data-bfs="351"]').getAttribute("fill")), `Bern (nur DEMO_A) nach Abwahl = neutral`);
A($('#map path[data-bfs="1061"]').getAttribute("fill").toUpperCase() === "#4F9D69", `Luzern (DEMO_B) bleibt grün`);
cbA.checked = true; cbA.dispatchEvent(new window.Event("change"));
$('.mmbtn[data-mm="kanton"]').dispatchEvent(new window.Event("click"));
A($$("#map path.area[data-kt]").length === 26, `Kantonskarte: 26 Kanton-Pfade`);
$('.mmbtn[data-mm="gem"]').dispatchEvent(new window.Event("click"));
A($$("#rtable tbody tr").length === 2115, `Tabelle: 2115 Zeilen`);
$('#filters .filterchip[data-id="DEMO_C"]').dispatchEvent(new window.Event("click"));
const rc = $$("#rtable tbody tr").length; A(rc >= 1 && rc < 2115, `Filter DEMO_C: ${rc} Zeilen (Teilmenge)`);
$('#map path[data-bfs="261"]').dispatchEvent(new window.Event("mouseenter"));
A(/Zürich/.test($("#detail").innerHTML), `Detailpanel zeigt Zürich bei Hover`);
console.log(fails ? `\n${fails} Test(s) FEHLGESCHLAGEN` : "\nAlle Tests bestanden.");
process.exit(fails ? 1 : 0);
