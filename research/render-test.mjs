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
const fill = sel => { const e = $(sel); return e ? (e.getAttribute("fill") || "").toUpperCase() : null; };

// Geometrie
A($$("#map path.area[data-bfs]").length === 2115, `Gemeindekarte: 2115 Gemeinde-Pfade`);
A($$("#map path.ktborder").length === 26, `26 Kantonsgrenzen`);
A($$("#map path.lake").length === 10, `10 Seen`);
A($$("#map text.ktlabel").length === 26, `26 Kantons-Labels`);

// Basel-Stadt: Kat 5/6/7 farbbestimmend -> staerkste = 7 (rot #C5322B)
A(fill('#map path[data-bfs="2701"]') === "#C5322B", `Basel (2701) = Kat 7 rot (ist ${fill('#map path[data-bfs="2701"]')})`);
A(fill('#map path[data-bfs="2703"]') === "#C5322B", `Riehen (2703) = Kat 7 rot`);
A(fill('#map path[data-bfs="2702"]') === "#C5322B", `Bettingen (2702) = Kat 7 rot`);
A(/E4E7EA/i.test(fill('#map path[data-bfs="261"]')), `Zürich (261) ohne Instrument = neutral`);
A(fill('#map path[data-bfs="1061"]') === "#F2C53D", `Luzern (1061) = Kat 8 gelb (Kurzzeitvermietung) (ist ${fill('#map path[data-bfs="1061"]')})`);
A(/E4E7EA/i.test(fill('#map path[data-bfs="2762"]')), `Allschwil (BL 2762) neutral (BL nur Förderung, nicht farbbestimmend)`);
A(/E4E7EA/i.test(fill('#map path[data-bfs="1058"]')), `Horw (LU 1058) neutral (Förderung, nicht farbbestimmend)`);
A(/E4E7EA/i.test(fill('#map path[data-bfs="1059"]')), `Kriens (LU 1059) neutral (Wohnbaureglement planned, nicht farbbestimmend)`);
A(fill('#map path[data-bfs="6458"]') === "#7E8AC4", `Neuchâtel (6458) = Kat 5 violett (LVAL) (ist ${fill('#map path[data-bfs="6458"]')})`);
A(/E4E7EA/i.test(fill('#map path[data-bfs="6421"]')), `La Chaux-de-Fonds (6421) neutral (nicht LVAL)`);

// Kategorie 7 abwaehlen -> Basel faellt auf Kat 6 (orange #E8883A)
const cb7 = $('#cat-controls input[data-cat="7"]'); cb7.checked = false; cb7.dispatchEvent(new window.Event("change"));
A(fill('#map path[data-bfs="2701"]') === "#E8883A", `nach Abwahl Kat 7: Basel = Kat 6 orange (ist ${fill('#map path[data-bfs="2701"]')})`);
cb7.checked = true; cb7.dispatchEvent(new window.Event("change"));
A(fill('#map path[data-bfs="2701"]') === "#C5322B", `nach Wiederwahl Kat 7: Basel wieder rot`);

// alle/keine
$("#cat-none").dispatchEvent(new window.Event("click"));
A(/E4E7EA/i.test(fill('#map path[data-bfs="2701"]')), `'keine': Basel neutral`);
$("#cat-all").dispatchEvent(new window.Event("click"));
A(fill('#map path[data-bfs="2701"]') === "#C5322B", `'alle': Basel wieder rot`);

// Kantonskarte: BS (12) eingefaerbt (Aggregat) rot
$('.mmbtn[data-mm="kanton"]').dispatchEvent(new window.Event("click"));
A($$("#map path.area[data-kt]").length === 26, `Kantonskarte: 26 Kanton-Pfade`);
A(fill('#map path[data-kt="12"]') === "#C5322B", `Kanton BS (12) = rot (Aggregat)`);
$('.mmbtn[data-mm="gem"]').dispatchEvent(new window.Event("click"));

// Tabelle: 5 Instrumente
A($$("#rtable tbody tr").length === 18, `Tabelle: 18 Instrument-Zeilen (ist ${$$("#rtable tbody tr").length})`);
$('#filters .filterchip[data-cat="6"]').dispatchEvent(new window.Event("click"));
const rc = $$("#rtable tbody tr").length; A(rc === 1, `Filter Kat 6: ${rc} Zeile (Bewilligungspflicht)`);
$('#filters .filterchip[data-cat="6"]').dispatchEvent(new window.Event("click"));

// Detail: Basel hover zeigt Instrumente
$('#map path[data-bfs="2701"]').dispatchEvent(new window.Event("mouseenter"));
A(/Bewilligungspflicht|Mietzinskontrolle/.test($("#detail").innerHTML), `Detailpanel Basel zeigt Instrumente`);
A(!!$('#detail .auditbtn[data-audit="audit-BS"]'), `Instrument-Detail enthält Audit-Link`);
A(/Karte:/.test($("#detail").innerHTML), `Instrument-Detail zeigt map_relevant-Begründung`);
A(/Tier 1/.test($("#detail").innerHTML), `Instrument-Detail zeigt Belegstufe`);

// Daten-/Pilot-Banner statt Demo-Banner
const db = $("#databanner");
A(db && /Pilot/.test(db.innerHTML), `Daten-Banner zeigt Pilot-Hinweis`);
A($("#demobanner") === null, `kein DEMO-Banner mehr`);

// Audit & Quellen (Navigation 04)
A(!!$('.navitem[data-view="audit"]'), `Audit-Navigation existiert`);
$('.navitem[data-view="audit"]').dispatchEvent(new window.Event("click"));
A($("#v-audit").classList.contains("active"), `Audit-Ansicht aktiv`);
A($$("#audit-wrap .acard").length >= 4, `Audit-Liste zeigt >=4 Berichte (BS, LU, BL, NE)`);
A(/Basel-Stadt/.test($("#audit-wrap").innerHTML) && /Luzern/.test($("#audit-wrap").innerHTML) && /Basel-Landschaft/.test($("#audit-wrap").innerHTML) && /Neuenburg/.test($("#audit-wrap").innerHTML), `Auditberichte BS + LU + BL + NE in Liste`);
A(!!$('#audit-wrap .acard[data-audit="audit-LU"]') && !!$('#audit-wrap .acard[data-audit="audit-BL"]') && !!$('#audit-wrap .acard[data-audit="audit-NE"]'), `LU-, BL- und NE-Auditbericht vorhanden`);
$('#audit-wrap .acard[data-audit="audit-BS"]').dispatchEvent(new window.Event("click"));
const ad = $("#audit-detail");
A(ad && ad.style.display !== "none", `Audit-Detail geöffnet`);
A(/Basel/.test(ad.innerHTML) && /Bettingen/.test(ad.innerHTML) && /Riehen/.test(ad.innerHTML), `Bericht zeigt Basel, Bettingen, Riehen`);
A(/gesetzessammlung\.bs\.ch/.test(ad.innerHTML), `Bericht zeigt Quellen (Tier-1-Link)`);

// Instrumente erklärt (Navigation 05)
A(!!$('.navitem[data-view="erklaert"]'), `Navigation '05 Instrumente erklärt' existiert`);
$('.navitem[data-view="erklaert"]').dispatchEvent(new window.Event("click"));
A($("#v-erklaert").classList.contains("active"), `Erklär-Ansicht aktiv`);
A($$("#gloss-cats .gcat").length === 10, `10 Kategorie-Erklärungen (ist ${$$("#gloss-cats .gcat").length})`);
A($$("#gloss-instr .grp").length >= 1, `Instrumente nach Kategorie gruppiert`);
A(/Kurzzeitvermietung/.test($("#gloss-instr").innerHTML), `Übersicht listet Luzern-Instrument`);

console.log(fails ? `\n${fails} Test(s) FEHLGESCHLAGEN` : "\nAlle Tests bestanden.");
process.exit(fails ? 1 : 0);
