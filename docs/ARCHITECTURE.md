# Architektur-Referenz — `regulierungskarte`

> Vollständige, zeilengenaue Referenz für die Arbeit am Code. Orientierung +
> Konventionen stehen in der Repo-Root-[CLAUDE.md](../CLAUDE.md); hier die Tiefe.
> Zeilennummern beziehen sich auf `build/index.template.html` (Quelle der App,
> ~1275 Zeilen, gesamte Logik in einem einzigen `<script>`) — bei größeren Edits
> verschieben sie sich; dann per Grep auf den Funktionsnamen neu verorten.

---

## 1. Build-Pipeline & Repo-Layout

```
regulierungskarte/
├── index.html                       Generiertes Single-File-Tool (committet, ~1,7 MB)
├── CLAUDE.md                        Auto-geladener Session-Handover
├── README.md                        Öffentliche Projektbeschreibung
├── build/
│   ├── index.template.html          QUELLE der App (committet) — hier editieren
│   ├── build-map-data.mjs           GeoJSON → ch-map.generated.json (SVG-Pfade)
│   ├── build-html.mjs               Template + Daten → index.html (Token-Injektion)
│   ├── ch-map.generated.json        Build-Artefakt Geometrie        ── GITIGNORED
│   └── _*.mjs                        lokale Helfer/Diagnose          ── GITIGNORED (build/_*)
├── src/data/
│   ├── audit-run.json               Run 1, Kantone   → Token __AUDITDATA__
│   ├── run2-municipal.json          Run 2, Gemeinden → Token __RUN2DATA__
│   ├── dwellings.json               Wohnungsbestand  → Token __DWELLINGDATA__
│   └── source/
│       ├── gemeinden.geojson        swisstopo-Rohgeometrie Gemeinden/Seen/Sonder
│       └── kantone.geojson          swisstopo-Rohgeometrie Kantone
└── docs/
    ├── ARCHITECTURE.md              (diese Datei)
    ├── GEO_VINTAGE_POLICY.md        2024-IDs ↔ 2025-Geometrie, Fusions-Mapping
    └── REBUILD_NOTES.md             historische Umbau-Doku (teils überholt)
```

### `build-map-data.mjs` (Schritt 1)
Liest `src/data/source/{gemeinden,kantone}.geojson`, filtert, projiziert, schreibt
`build/ch-map.generated.json` mit `{cantons[], gemeinden[], sonder[], lakes[], meta}`.
Optionale Argumente: `[viewBoxWidth=2000] [decimals=1]`.

- **Filter:** Gemeinde = `objektart==="Gemeindegebiet" && icc==="CH"` (**2115**);
  See = `objektart==="Kantonsgebiet" && bfs_nummer>=9000` (**10**); Sonder =
  CH und keines der beiden (**3**, z. B. Galm/Kommunanzen); Kantone = alle
  Features aus `kantone.geojson` (**26**). Ausgeschlossen: `icc!="CH"`
  (Liechtenstein, Büsingen/DE, Campione/IT).
- **Geometrie-Join-Integrität (wichtig):** je Gemeinde stammen `{bfs, name, kt, d}`
  alle aus DEMSELBEN GeoJSON-Feature (`p.bfs_nummer`, `p.name`, `p.kantonsnummer`,
  `geomToPath(f.geometry)`) → Pfad↔Name↔BFS↔Kanton ist **by construction**
  korrekt. Sortierung nach `bfs`.
- **Projektion:** Equirectangular mit cos(lat0)-Korrektur. Pass 1 scannt globale
  bbox, `lat0=(minLat+maxLat)/2 ≈46.81`, `k=cos(lat0)≈0.6844`; `pX=lon*k`,
  `pY=lat`, linear auf `W=2000` skaliert mit Y-Flip → `viewBox 0 0 2000 ~1282.3`.
  Gemeinsamer Maßstab für Kantone/Gemeinden/Seen (exakte Überlagerung),
  Koordinaten auf 1 Nachkommastelle, alle Vertices erhalten, Löcher/Multipolygone
  als Subpfade mit `fill-rule:evenodd`.

### `build-html.mjs` (Schritt 2)
Liest Template + generierte Geometrie + 3 leer-tolerante `src/data/`-Dateien,
ersetzt 4 Tokens (siehe CLAUDE.md §2), `safe()`-Escaping (`<`→`<`), schreibt
`index.html`. Fehlt ein Token im Template → `Error("Platzhalter … fehlt")`.
Fallbacks bei fehlender Datendatei: Audit/Run2 `{run_meta:{},cantons:[]}`,
Dwellings `{total:0,gemeinden:[]}` (MAPDATA ist Pflicht).

### Helfer `build/_*.mjs` (gitignored, lokal)
- **`_audit_links.mjs`** — verifiziert alle Daten-Joins (Geometrie ↔ dwellings ↔
  audit ↔ run2): Bestände, Nr↔Abkürzung↔Name, BFS-Matching, Kanton-Konsistenz,
  KPI-Abdeckung. Reines Diagnose-Tool.
- **`_remap_dwellings.mjs`** — gleicht GWS-Wohnungsdaten an die 2025-Geometrie an:
  summiert 19 fusionierte Alt-BFS (Tabelle `TO`) in ihre Nachfolger, je innerhalb
  desselben Kantons → Kantons-/CH-Totale konstant. Bereits angewandt (siehe
  GEO_VINTAGE_POLICY.md).
- **`_merge_run2.mjs`** — mergt geprüfte Gemeinde-Ergebnisse aus einer
  Harvest-Datei in-place in `run2-municipal.json`, sanitisiert je Instrument die
  Felder.
- **`_harvest_run2rest.mjs`** — erntet StructuredOutput aus den `agent-*.jsonl`
  eines Workflow-Laufs. **Achtung: hartkodierter Session-Pfad + liest
  `build/_run2_pending.json` (selbst gitignored)** → außerhalb der Ursprungs-
  session nicht ohne Anpassung lauffähig.

---

## 2. Datenmodell (`src/data/*.json`)

> Konvention: In **`dwellings.json` ist `kt` die Kanton-ABKÜRZUNG (String)**, in
> der Geometrie (`RAW.gemeinden[].kt`) und im Audit/Run2 ist es die **Nummer**.

### `audit-run.json` — Run 1 (kantonaler Rechtsrahmen)
`run_meta` + `cantons[]` (26).
**`cantons[]`:** `canton`, `canton_abbr`, `canton_nr` (1–26), `tier_1_sources_found[]`,
`cantonal_instruments_found[]`, `municipal_option_exists`, `municipal_followup_required`,
`municipal_followup_reason`, `municipal_research_scope_later`, `confidence`,
`open_questions[]`.
**`cantonal_instruments_found[]`:** `name`, `taxonomy_category` (number|null),
`taxonomy_title`, `bindingness` (**Freitext** hier), `municipal_option_exists`
(bool), `note`, `excluded` (bool), `excluded_reason` (optional). **Kein
`legal_status` am Instrument** (das steckt in den Quellen).
**`tier_1_sources_found[]`:** `source_id`, `title`, `url`, `form`, `article`,
`legal_status`, `validation_decision` (accepted|rejected|unclear),
`evidence_quote_short`.

### `run2-municipal.json` — Run 2 (Gemeindeebene, Triage) — größte Datei (~1,16 MB)
`run_meta` (`checked_count`=344, `pending_count`=0, `triaged_count`=1787,
`with_instrument_count`=101, `status`="komplett") + `cantons[]` (26).
**`cantons[]`:** `canton_abbr`, `canton_nr`, `total_gemeinden`, `triage_threshold`
(Wohnungs-Schwelle für Einzelprüfung, variiert je Kanton), `checked[]`, `triaged[]`.
*Kein* voller `canton`-Name auf dieser Ebene (ggf. aus audit-run.json joinen).
**`checked[]`** (344): `bfs`, `name`, `units` (eigenes Feld, 344/344 vorhanden),
`status`="checked", `found` (bool), `instruments[]`, `note?`, `confidence?`.
*Kein* `kt`-Feld — Kanton über das umschließende `cantons[]`-Element.
**`checked[].instruments[]`:** `name`, `taxonomy_category` (number|null), `excluded`,
`excluded_reason?`, `bindingness` (**Enum** `binding` … hier), `legal_status`
(`in_force` …), `source_title`, `source_form`, `source_url`, `evidence_quote_short`.
**`triaged[]`** (1787): `bfs`, `name`, `units` (1787/1787), `reason`. *Kein* `kt`,
`status`, `instruments`.
**Daten-Hygiene:** `found:true`=100, `checked` mit ≥1 Instrument=123 (manche
`found:false` führen ausgeschlossene Instrumente), `with_instrument_count`=101 —
diese drei stimmen nicht überein; bei Übernahme neu berechnen.

### `dwellings.json` — Wohnungsbestand (single-line JSON, ~116 KB)
Top-level: `source`, `total`=**4'840'096**, `count`=**2115**, `gemeinden[]`,
`gemeindestand`="swissBOUNDARIES 04/2025 (Fusionen … in Nachfolger summiert)".
**`gemeinden[]`:** `bfs`, `name`, `kt` (**Abkürzung!**), `units`.

**Mengen-Quervergleich:** Run-2-Listen = 344+1787 = **2131** Einträge vs.
Geometrie/Dwellings = **2115** → 16 Run-2-Einträge mehr (bewusst belassene
fusionierte Alt-BFS, alle `found=false`, nicht auf der Karte; siehe
GEO_VINTAGE_POLICY.md). Beim Join über `bfs` darauf gefasst sein.

---

## 3. Karten-Färbelogik & Lookups

### Eingebettete JSON-Blöcke (`<script type="application/json">`)
`#mapdata`→`RAW` (Z. 423) · `#auditdata`→`AUDIT` · `#run2data`→`RUN2` (Z. 927) ·
`#dwellingdata`→`DWELL` (Z. 1190).

### Lookups
| Lookup | Zeile | Key → Wert | Hinweis |
|---|---|---|---|
| `RAW` | 423 | — | `.cantons/.gemeinden/.sonder/.lakes/.meta` |
| `KT_ABBR` | 425 | Nr → Abk | hartcodiert `{1:"ZH",…,26:"JU"}` |
| `ktNameByNr` | 426 | Nr → Name | aus `RAW.cantons` |
| `gemByBfs` | 427 | bfs → Gemeinde | **alle** Geometrie-Gemeinden |
| `gemCountByKt` | 428 | Nr → Anzahl | `g.kt` = Nr (RAW-Konvention) |
| `mapMode` | 688 | — | `let`, `"gem"` (Default) \| `"kanton"` |
| `selectedCats` | 689 | — | `Set([1..6])`, Kategorie-Chips |
| `TAX_COLORS` | 817 | Kat → Hex | einzige Kartenpalette |
| `LANDFILL` | 937 | — | `"#E4E7EA"` neutral |
| `MAP_CAT_PRIORITY` | 938 | — | `[6,5,4,3,2,1]` (höher = stärker) |
| `auditByKt` | 939 | canton_nr → Audit | **Quelle der Kantonsfarbe** |
| `munByBfs` | 928/929 | bfs → Run2-Gem | **NUR `found===true`** (Z. 929) |
| `run2StatusByBfs` | 928/929 | bfs → checked\|pending\|triaged | nur Texte, nicht Färbung |
| `run2ByKt` | 1082 | canton_nr → Run2-Kanton | Abdeckungs-Reiter |
| `dwellByBfs` | 1191/2 | bfs → units | KPI/Abdeckung, nicht färbend |
| `dwellByKt` | 1191/2 | **Abk** → Σ units | **Keying-Falle: Abkürzung!** Zugriff `dwellByKt[KT_ABBR[c.nr]]` |
| `dwellGemCountByKt` | 1191/2 | Abk → Anzahl | |
| `dwellTotal` | 1193 | — | `DWELL.total` |

### Färbe-Funktionen (exakte Semantik)
```
cantonCatSet(nr, inclOptions)   // 940-941  liest NUR auditByKt[nr].cantonal_instruments_found;
                                //           überspringt municipal_option_exists wenn !inclOptions
cantonBindingCatSet(nr)         // 942      = cantonCatSet(nr, false)
strongest(set)                  // 943      erste Kat aus MAP_CAT_PRIORITY im Set, sonst null
strongestSel(set)               // 944      erste Kat im Set, die AUCH in selectedCats ist
levelSet(nr)                    // 946      = cantonCatSet(nr, mapMode==="kanton")   ← Ebenen-Schalter
cantonTopCat(nr)                // 947      strongest(cantonBindingCatSet(nr))  (Detail)
cantonTopCatAll(nr)             // 948      strongest(cantonCatSet(nr,true))    (Detail)
ktCat(nr)                       // 949      strongestSel(levelSet(nr))          ← KARTENFARBE Kanton
ktFill(nr)                      // 950      TAX_COLORS[ktCat] || LANDFILL
munInForce(i)                   // 953      !excluded && taxonomy_category && (!legal_status||=="in_force")
municipalCatSet(bfs)            // 954      Kategorien aus munByBfs[bfs].instruments, gefiltert munInForce
gemCatSet(bfs)                  // 955      cantonBindingCatSet(g.kt) ∪ municipalCatSet(bfs)
gemCat(bfs)                     // 956      strongestSel(gemCatSet(bfs))        ← KARTENFARBE Gemeinde
gemFill(bfs)                    // 957      TAX_COLORS[gemCat] || LANDFILL
renderMapLegend()               // 958      sammelt real verwendete Kategorien je Modus
```

### DAS INVARIANT (siehe auch CLAUDE.md §4)
1. Kantonsfarbe **ausschließlich** aus `auditByKt[nr].cantonal_instruments_found`;
   Gemeindedaten fließen nie ein.
2. Kantonskarte = inkl. Ermächtigungen (`inclOptions=true`).
3. Gemeindekarte = bindender Kantonsrahmen ∪ kommunale in-force-Instrumente.
4. Kommunal färbt nur `munInForce`-Instrumente von `found`-Gemeinden.
5. `MAP_CAT_PRIORITY=[6,5,4,3,2,1]`; `selectedCats` filtert via `strongestSel`.

**Färbe-Änderung:** Farben → nur `TAX_COLORS`/`LANDFILL`. Logik (was färbt) →
`cantonCatSet`/`levelSet` (Kanton), `gemCatSet`/`munInForce`/`municipalCatSet`
(Gemeinde), `MAP_CAT_PRIORITY`. Danach `repaint()` (Farben) bzw. `buildMap()`
(Struktur) + `renderMapLegend()`.

### Orchestrierung & Detail
`buildMap()` (695) zeichnet Pfade neu (gem: `gemFill`+Klick→`detailGemeinde`;
kanton: `ktFill`+Klick→`detailKanton`), cacht Refs in `els`. `repaint()` (718)
färbt nur `style.fill` ohne Neubau. `afterSelect()` (974) =
`renderCatChips`+`repaint`+`renderMapLegend`+`renderKpi`. `markSel` (722),
`detailGemeinde` (746), `detailKanton` (754), `rahmenRow` (723), `munRow` (730),
`detailSonder` (769), `downloadSVG` (774).

---

## 4. i18n-Engine & Render-/Wire-Architektur

### Bausteine
- `let LANG` (431): IIFE liest `localStorage['rk-lang']`, akzeptiert nur de/en,
  Fallback `de`.
- `const STR={de,en}` (432): Strings **und** Interpolations-Funktionen
  (`foot_karte(g,c)`, `kpi_head(…)`, `dwell_chip(n)`, `cov_foot(…)` …).
- `let T=STR[LANG]` (614): aktive Binding, in `applyI18n()` (668) neu gesetzt.
- Taxonomie-`let`-Bindings (auf `*_DE`/`*_EN`): `TAX` (905), `TAX_EXCLUDED` (906),
  `TAX_SCALE` (907), `TAX_RULES` (908), `TAX_TITLE` (933) — in `applyI18n()`
  (669-670) neu zugewiesen.
- `const TUT={de,en}` (615): `{eb,title,intro,steps:[{t,d}],foot}` →
  `renderTutorial()` (657).

### Schlüssel-Funktionen
- **`applyStatic()`** (641-646): `[data-i18n]`→textContent, `[data-i18n-html]`→
  innerHTML, `[data-i18n-ph]`→placeholder, `[data-i18n-title]`→title.
- **`fillDynamicSpans()`** (650-655): befüllt eingebettete Zähler-Spans
  (`ov-total`, `dw-source`, `dw-total`, `dw-count`) neu, nachdem `innerHTML`-
  Ersetzung sie überschrieben hat.
- **`setLang(l)`** (666): validiert → `LANG=l` → `localStorage` → `applyI18n()`.
- **`applyI18n()`** (667-682): setzt `T`+TAX-Bindings, `documentElement.lang`,
  `document.title`, ruft `applyStatic`/`updateLangButtons`/`fillDynamicSpans`/
  `resetDetailPanels` + **alle Text-Render-Funktionen** (674-681):
  `renderCatChips, renderMapLegend, renderKarteFoot, renderKpi, buildKtSelect,
  renderOvTable, renderTaxonomy, renderAuditBanner, renderAuditList,
  renderRun2Overview, renderCovKpi, renderCovLegend, renderCovFoot, renderCovDist,
  buildDwSelect, renderDwKtTable, renderDwTable, renderTutorial`.
  **Ruft `buildMap`/`buildCovMap`/`repaint` NICHT auf** — Polygonfarben sind
  sprachunabhängig.

### Zahlenformat
- `fmtN(n)` (1194): `Math.round().toLocaleString("de-CH")` — **immer** de-CH
  (Apostroph-Tausender), beide Sprachen.
- `pctStr(v,total)` (1195): `toFixed(1)`, DE→Komma / EN→Punkt, Suffix `" %"`.
  Einzige sprachabhängige Zahlenformatierung.

### Render vs. Wire (Prinzip)
Listener werden **1× in `wire*`** aus `init()` gesetzt; `render*` sind idempotent
und setzen **keine** Listener (kein Leak bei Re-Render).
Wire: `wireOverview()` (810), `wireAudit()` (1021), `wireDwellings()` (1244).

**`init()`** (1251-1272), Reihenfolge: `buildMap` (1252) + `buildCovMap` (1253) →
`wireOverview/wireAudit/wireDwellings` (1254-1256) → Tab-Wiring (1257),
`[data-mm]` (1258), `[data-cm-mode]` (1259), SVG-Downloads/Cat-All-None
(1260-1263) → Sprach-/Tutorial-Wiring (1264-1269) → **`applyI18n()` zuletzt**
(1271). Bootstrap (1273): sofort wenn DOM bereit, sonst auf `DOMContentLoaded`.

### Neuen übersetzbaren String hinzufügen
1. Key in `STR.de` **und** `STR.en` (gleicher Key, sonst `undefined`).
2. **Statisch:** Element im Markup mit `data-i18n` (bzw. `-html`/`-ph`/`-title`)
   versehen → `applyStatic` füllt es. **Dynamisch:** als String oder Funktion
   anlegen und in der idempotenten `render*`-Funktion via `T.key` / `T.fn(x)`
   ausgeben. **Nie** Listener im Render — die gehören in `wire*`.

---

## 5. HTML-Struktur, Reiter & Container-ids

`<body>` → `.app` (Flex) → `.sidebar` (Navigation `nav.tabs#tabs`, Buttons mit
`data-view`) + `.content`. Aktiver Reiter: `<section class="view active"
id="v-{data-view}">`. Tutorial-Modal `#tut-ov` liegt außerhalb `.app`.

| # | Label (DE) | `data-view` | Section-id |
|---|---|---|---|
| 01 | Karte | `karte` | `#v-karte` |
| 02 | Übersicht Kantone & Gemeinden | `uebersicht` | `#v-uebersicht` |
| 03 | Taxonomie | `taxonomie` | `#v-taxonomie` |
| 04 | Audit · Kantone | `audit-kt` | `#v-audit-kt` |
| 05 | Audit · Gemeinden | `audit-gem` | `#v-audit-gem` |
| 06 | Audit · Übersicht (Abdeckung) | `audit-cov` | `#v-audit-cov` |
| 07 | Wohnungen | `wohnungen` | `#v-wohnungen` |

**Topbar** (`.topbar`, sticky): Sprachumschalter `#langsw` mit
`button.lsbtn[data-lang]` (aktiv `.on`, via `updateLangButtons()` 656),
Tutorial-Knopf `#tutbtn`. Modal: `#tut-ov.open`, `#tut-title`, `#tut-steps`,
`#tut-x`.

**Wichtige Container-ids:**
- **Karte:** `#catselect`/`#catchips`, `#cat-all`/`#cat-none`,
  Modus `button.mmbtn[data-mm="gem|kanton"]` (aktiv `.won`), `#dlsvg`,
  `svg#map.chmap`, `#map-legend`, `#karte-foot`, KPI `#kpi`/`#kpi-cards`,
  Detail `#detail`.
- **Übersicht:** `#ov-q`, `#ov-kt`, `#ov-count`, `#ovtable` (th `data-k`),
  `<b id="ov-total">`.
- **Taxonomie:** `#tax-scale`, `#tax-cats`, `#tax-rules`, `.taxnote`.
- **Audit·Kantone:** `#audit-banner`, `#audit-filters` (`#au-q`, `#au-followup`),
  `#audit-count`, `#audit-list`.
- **Audit·Gemeinden:** `#run2-overview`.
- **Audit·Übersicht:** `#cov-kpi`, Modus `button[data-cm-mode]` (**eigenes
  Attribut, nicht `data-mm`**), `#cov-dlsvg`, `svg#covmap.chmap`, `#cov-legend`,
  `#cov-foot`, `#cov-detail`, `#cov-dist`.
- **Wohnungen:** `#dwkttable`, `#dw-q`, `#dw-kt`, `#dw-gcount`, `#dwtable`,
  `#dw-source`/`#dw-total`/`#dw-count`.

**CSS-Variablen** (`:root` 6-14): `--ink:#07314C`, `--brand:#0FA9BD`,
`--land:#E4E7EA`, `--water:#C5DCEE` u. a. **TAX-Farben sind KEINE CSS-Variablen**,
sondern das JS-Objekt `TAX_COLORS` (817). Coverage-Palette `COV_COL` (1081):
`checked:#2E9E5B`, `pending:#E8883A`, `none:#FFFFFF`. SVG-Klassen: `.land`,
`.land.sel`, `.ktborder`, `.lake`, `path.area` (`fill-rule:evenodd`),
`text.ktlabel`. Beim SVG-Export werden die Stile als eingebetteter `<style>`
mitgeschrieben (779 für `#map`, 1136 für `#covmap`).

---

## 6. Verifikation nach Edits

1. Build: `node build/build-html.mjs` (bzw. vorher `build-map-data.mjs` bei
   Geometrie-Änderung).
2. Preview neu laden (`location.reload()`), dann numerische `preview_eval`-Checks
   (kein `preview_screenshot` — Timeout auf der großen Seite).
3. Optional Join-Diagnose: `node build/_audit_links.mjs`.
4. Committen (Deutsch + Co-Authored-By-Trailer) + push `karte-only`.
