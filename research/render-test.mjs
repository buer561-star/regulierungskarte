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
A(fill('#map path[data-bfs="3851"]') === "#F2C53D", `Davos (3851) = Kat 8 gelb (Erstwohnungsanteil) (ist ${fill('#map path[data-bfs="3851"]')})`);
A(/E4E7EA/i.test(fill('#map path[data-bfs="3901"]')), `Chur (3901) neutral (Initiative abgelehnt)`);
A(/E4E7EA/i.test(fill('#map path[data-bfs="3955"]')), `Landquart (3955) neutral (kein eigenes Instrument)`);
// GE: LDTR/LGZD -> Agglomerationsgemeinden rot (Kat 7)
A(fill('#map path[data-bfs="6621"]') === "#C5322B", `Genève (6621) = Kat 7 rot (LDTR) (ist ${fill('#map path[data-bfs="6621"]')})`);
A(fill('#map path[data-bfs="6643"]') === "#C5322B", `Vernier (6643) = Kat 7 rot (LDTR)`);
// TI: Lugano/Bellinzona Quote (Kat 3 blau), Locarno/Mendrisio Kurzzeit (Kat 8 gelb)
A(fill('#map path[data-bfs="5192"]') === "#3B7DC4", `Lugano (5192) = Kat 3 blau (Quote) (ist ${fill('#map path[data-bfs="5192"]')})`);
A(fill('#map path[data-bfs="5113"]') === "#F2C53D", `Locarno (5113) = Kat 8 gelb (Kurzzeit) (ist ${fill('#map path[data-bfs="5113"]')})`);
// VS: Crans-Montana / Val de Bagnes Kat 8 gelb; Sion neutral
A(fill('#map path[data-bfs="6253"]') === "#F2C53D", `Crans-Montana (6253) = Kat 8 gelb (Erstwohnungsanteil)`);
A(fill('#map path[data-bfs="6037"]') === "#F2C53D", `Val de Bagnes (6037) = Kat 8 gelb`);
A(/E4E7EA/i.test(fill('#map path[data-bfs="6266"]')), `Sion (6266) neutral`);
// BE: Bern Kat 6 orange; Köniz/Burgdorf Kat 3 blau; Thun neutral (sistiert)
A(fill('#map path[data-bfs="351"]') === "#E8883A", `Bern (351) = Kat 6 orange (Wohnraumschutz) (ist ${fill('#map path[data-bfs="351"]')})`);
A(fill('#map path[data-bfs="355"]') === "#3B7DC4", `Köniz (355) = Kat 3 blau (Quote)`);
A(fill('#map path[data-bfs="404"]') === "#3B7DC4", `Burgdorf (404) = Kat 3 blau (Quote)`);
A(/E4E7EA/i.test(fill('#map path[data-bfs="942"]')), `Thun (942) neutral (Quote sistiert)`);
// ZG: Zug/Baar/Steinhausen Kat 3 blau; Cham neutral (Beschwerde)
A(fill('#map path[data-bfs="1711"]') === "#3B7DC4", `Zug (1711) = Kat 3 blau (50%-Zone)`);
A(fill('#map path[data-bfs="1701"]') === "#3B7DC4", `Baar (1701) = Kat 3 blau`);
A(/E4E7EA/i.test(fill('#map path[data-bfs="1702"]')), `Cham (1702) neutral (Quote unter Beschwerde)`);
// ZH: Stadt Zürich neutral (75%-Quote noch nicht in Kraft)
A(/E4E7EA/i.test(fill('#map path[data-bfs="261"]')), `Zürich (261) neutral (Quote pending, Fonds=Förderung)`);
// VD: LPPPL -> Pénurie-Gemeinden rot (Kat 7); Aigle neutral (kein Pénurie-Bezirk)
A(fill('#map path[data-bfs="5586"]') === "#C5322B", `Lausanne (5586) = Kat 7 rot (LPPPL) (ist ${fill('#map path[data-bfs="5586"]')})`);
A(fill('#map path[data-bfs="5890"]') === "#C5322B", `Vevey (5890) = Kat 7 rot (LPPPL)`);
A(/E4E7EA/i.test(fill('#map path[data-bfs="5401"]')), `Aigle (5401) neutral (Bezirk nicht in Pénurie)`);
// Kleinkantone: vereinzelte Kat-3-Quoten (blau); sonst neutral
A(fill('#map path[data-bfs="1322"]') === "#3B7DC4", `Freienbach (1322, SZ) = Kat 3 blau (Quote) (ist ${fill('#map path[data-bfs="1322"]')})`);
A(fill('#map path[data-bfs="1509"]') === "#3B7DC4", `Stans (1509, NW) = Kat 3 blau (soziales Wohnen)`);
A(fill('#map path[data-bfs="6711"]') === "#3B7DC4", `Delémont (6711, JU) = Kat 3 blau (10%-Quote)`);
A(/E4E7EA/i.test(fill('#map path[data-bfs="3203"]')), `St. Gallen (3203) neutral (nur Förderung)`);
A(/E4E7EA/i.test(fill('#map path[data-bfs="1201"]')), `Altdorf (1201, UR) neutral`);
A(/E4E7EA/i.test(fill('#map path[data-bfs="4021"]')), `Baden (4021, AG) neutral`);
A(/E4E7EA/i.test(fill('#map path[data-bfs="2581"]')), `Olten (2581, SO) neutral`);
A(/E4E7EA/i.test(fill('#map path[data-bfs="2939"]')), `Schaffhausen (2939) neutral`);
A(/E4E7EA/i.test(fill('#map path[data-bfs="4566"]')), `Frauenfeld (4566, TG) neutral`);

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

// Karte interaktiv: alle 10 Instrument-Typen waehlbar + Basis-Umschalter
A($$("#cat-controls label").length === 10, `Kategorie-Steuerung: alle 10 Typen (ist ${$$("#cat-controls label").length})`);
A(!!$("#basis-map") && !!$("#basis-all"), `Basis-Umschalter (farbbestimmend / alle Instrumente) vorhanden`);
// nur Kat 8 anzeigen -> Luzern gelb, Basel neutral (hat kein Kat 8)
$("#cat-none").dispatchEvent(new window.Event("click"));
const cb8=$('#cat-controls input[data-cat="8"]'); cb8.checked=true; cb8.dispatchEvent(new window.Event("change"));
A(fill('#map path[data-bfs="1061"]') === "#F2C53D", `nur Kat 8: Luzern gelb`);
A(/E4E7EA/i.test(fill('#map path[data-bfs="2701"]')), `nur Kat 8: Basel neutral`);
$("#cat-all").dispatchEvent(new window.Event("click"));

// Kantonskarte: BS (12) eingefaerbt (Aggregat) rot
$('.mmbtn[data-mm="kanton"]').dispatchEvent(new window.Event("click"));
A($$("#map path.area[data-kt]").length === 26, `Kantonskarte: 26 Kanton-Pfade`);
A(fill('#map path[data-kt="12"]') === "#C5322B", `Kanton BS (12) = rot (Aggregat)`);
// Basis "alle Instrumente": Förder-Kanton BL zeigt Kat 4 (grün), unter 'farbbestimmend' neutral
A(/E4E7EA/i.test(fill('#map path[data-kt="13"]')), `BL (13) neutral unter 'farbbestimmend'`);
$("#basis-all").dispatchEvent(new window.Event("click"));
A(fill('#map path[data-kt="13"]') === "#4F9D69", `BL (13) = Kat 4 grün unter 'alle Instrumente' (ist ${fill('#map path[data-kt="13"]')})`);
$("#basis-map").dispatchEvent(new window.Event("click"));
A(/E4E7EA/i.test(fill('#map path[data-kt="13"]')), `zurück auf 'farbbestimmend': BL (13) wieder neutral`);
$('.mmbtn[data-mm="gem"]').dispatchEvent(new window.Event("click"));

// Tabelle: 5 Instrumente
A($$("#rtable tbody tr").length === 83, `Tabelle: 83 Instrument-Zeilen (ist ${$$("#rtable tbody tr").length})`);
$('#filters .filterchip[data-cat="6"]').dispatchEvent(new window.Event("click"));
const rc = $$("#rtable tbody tr").length; A(rc === 4, `Filter Kat 6: ${rc} Zeilen (BS + GE + Bern + VD)`);
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
A($$("#audit-wrap .acard").length >= 26, `Audit-Liste: alle 26 Kantone (ist ${$$("#audit-wrap .acard").length})`);
A(/Genf/.test($("#audit-wrap").innerHTML) && /Bern/.test($("#audit-wrap").innerHTML) && /Wallis/.test($("#audit-wrap").innerHTML) && /Zug/.test($("#audit-wrap").innerHTML), `Auditberichte GE + BE + VS + ZG in Liste`);
A(/Basel-Stadt/.test($("#audit-wrap").innerHTML) && /Luzern/.test($("#audit-wrap").innerHTML) && /Basel-Landschaft/.test($("#audit-wrap").innerHTML) && /Neuenburg/.test($("#audit-wrap").innerHTML) && /Graubünden/.test($("#audit-wrap").innerHTML), `Auditberichte BS + LU + BL + NE + GR in Liste`);
A(!!$('#audit-wrap .acard[data-audit="audit-LU"]') && !!$('#audit-wrap .acard[data-audit="audit-BL"]') && !!$('#audit-wrap .acard[data-audit="audit-NE"]') && !!$('#audit-wrap .acard[data-audit="audit-GR"]'), `LU-, BL-, NE- und GR-Auditbericht vorhanden`);
$('#audit-wrap .acard[data-audit="audit-BS"]').dispatchEvent(new window.Event("click"));
const ad = $("#audit-detail");
A(ad && ad.style.display !== "none", `Audit-Detail geöffnet`);
A(/Basel/.test(ad.innerHTML) && /Bettingen/.test(ad.innerHTML) && /Riehen/.test(ad.innerHTML), `Bericht zeigt Basel, Bettingen, Riehen`);
A(/gesetzessammlung\.bs\.ch/.test(ad.innerHTML), `Bericht zeigt Quellen (Tier-1-Link)`);

// Audit & Quellen: zwei Übersichtskarten (kantonal + Gemeinde)
A($$("#amap-gem path.area[data-bfs]").length === 2115, `Audit-Gemeindekarte: 2115 Gemeinde-Pfade`);
A($$("#amap-kanton path.area[data-kt]").length === 26, `Audit-Kantonskarte: 26 Kanton-Pfade`);
A(fill('#amap-kanton path[data-kt="12"]') === "#C5322B", `Audit-Kantonskarte: BS rot`);
A(fill('#amap-gem path[data-bfs="2701"]') === "#C5322B", `Audit-Gemeindekarte: Basel rot`);
A(fill('#amap-gem path[data-bfs="5586"]') === "#C5322B", `Audit-Gemeindekarte: Lausanne rot (LPPPL)`);

// Instrumente erklärt (Navigation 05)
A(!!$('.navitem[data-view="erklaert"]'), `Navigation '05 Instrumente erklärt' existiert`);
$('.navitem[data-view="erklaert"]').dispatchEvent(new window.Event("click"));
A($("#v-erklaert").classList.contains("active"), `Erklär-Ansicht aktiv`);
A($$("#gloss-cats .gcat").length === 10, `10 Kategorie-Erklärungen (ist ${$$("#gloss-cats .gcat").length})`);
A($$("#gloss-instr .grp").length >= 1, `Instrumente nach Kategorie gruppiert`);
A(/Kurzzeitvermietung/.test($("#gloss-instr").innerHTML), `Übersicht listet Luzern-Instrument`);

console.log(fails ? `\n${fails} Test(s) FEHLGESCHLAGEN` : "\nAlle Tests bestanden.");
process.exit(fails ? 1 : 0);
