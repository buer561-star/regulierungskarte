# CLAUDE.md — Projekt-Handover (Branch `karte-only`)

> Diese Datei wird zu Beginn **jeder** Session automatisch geladen. Sie ist die
> Orientierung: was das Tool ist, wie man es baut, die zentralen Invarianten und
> die verbindlichen Arbeitsvorgaben. Die **vollständige, zeilengenaue
> Architektur-Referenz** steht in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) —
> dort nachschlagen, sobald am Code gearbeitet wird.

---

## 0. Was ist das?

Ein **einzelnes, selbst-enthaltenes `index.html`** (~1,7 MB, committet) — eine
interaktive Karte der Schweiz, die **wohnpolitische Regulierungs-Instrumente** je
Kanton und Gemeinde nach einer **6-Kategorien-Taxonomie** einfärbt. Keine
Server, keine npm-Abhängigkeiten, kein `package.json`. Build-Skripte laufen
direkt mit `node`.

`index.html` wird **generiert** aus `build/index.template.html` (Quelle der
Wahrheit) durch Token-Injektion der Geometrie + dreier Datendateien. **Niemals
`index.html` direkt editieren** — immer `build/index.template.html` ändern und neu
bauen.

**Die 7 Reiter** (Sidebar links): 01 Karte · 02 Übersicht · 03 Taxonomie ·
04 Audit·Kantone · 05 Audit·Gemeinden · 06 Audit·Übersicht (Abdeckung) ·
07 Wohnungen. Oben rechts: DE/EN-Umschalter + Tutorial-Knopf.

Reiter 01 enthält zusätzlich unten eine **Kanton-Detailkarte** (`#kdmap`,
`#kd-select`): wählt man einen Kanton, zoomt die Karte per `getBBox` auf dessen
Gemeinden (nur dieser Kanton, Gemeindeebene, gefärbt via `kdGemCat` =
`strongestSelIn(gemCatSet, kdSelectedCats)`), und rechts zeigt
`cantonPanelHtml(nr)` den kantonalen Rahmen als Text; Klick auf eine Gemeinde
füllt `#kd-gemdetail` via `gemPanelHtml(bfs)`. Die Detailkarte hat ihre **eigene
Kategorie-Auswahl** `kdSelectedCats` (Chips `#kd-catchips`, alle/keine,
unabhängig von `selectedCats` der Hauptkarte) → `kdRepaint`/`renderKdLegend`.
Bau/Zoom in `buildKtDetailMap` (nur bei Kantonswechsel), Texte/Chips/Legende in
`renderKtDetailText` (auch in `applyI18n`, ohne Pfad-Neubau).
**Beschlossene (noch nicht in Kraft) Instrumente werden HIER gezeigt** (im
Gegensatz zur Hauptkarte, deren Invariant unverändert bleibt): Toggle
`#kd-incl-adopted` (`kdInclAdopted`, Default an). `kdGemColorState(bfs)` mischt
`gemCatSet` (in-force, solid) mit `gemAdoptedSet(bfs)` (aus `munAdoptedByBfs` —
deckt auch `found===false`-Gemeinden wie Stäfa/Dübendorf ab); ist die stärkste
gewählte Kategorie nur beschlossen → **schraffierter** Fill `url(#kdh{cat})`
(SVG-Pattern aus `kdHatchDefs`), sonst Vollfarbe. Legende trennt solid vs.
„(beschlossen)" (`.dot-hatch`).

---

## 1. Standing-Vorgaben des Nutzers (VERBINDLICH)

1. **Immer bauen + committen + pushen — ohne Rückfrage.** Eine Aufgabe gilt erst
   als erledigt, wenn gebaut, committet und auf `karte-only` gepusht. Am Schluss
   Commit-Hash + Push-Status nennen. Nur zurückhalten bei ausdrücklichem „nicht
   pushen".
2. **NIE Rückfragen stellen** — der Nutzer ist häufig abwesend. Kein
   `AskUserQuestion`. Bei Trade-offs selbst die sinnvollste Option wählen und im
   Ergebnis kurz nennen.
3. **Feine Klassifikations-Edge-Cases selbst entscheiden**, nicht eskalieren.
   Nur material Relevantes melden (Kantonsfarbe, Kennzahlen, Methodik-/
   Regeländerung).
4. **EINZIGE Ausnahme von „keine Fragen":** Wenn das **Wochenlimit des Abos**
   erreicht ist (gehäufte API-Limit-Fehler / abgebrochener Run) → kurz
   **PAUSIEREN und fragen**, wie fortzufahren. Vereinzelte Einzelfehler (~1/25)
   sind NICHT das Limit → per Einzel-Re-Run nachziehen.
5. **Commit-Messages auf Deutsch**, mit Trailer:
   `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
6. **Ultracode ist AN** — auf exhaustive Korrektheit optimieren, Workflows bei
   substantiellen Aufgaben nutzen, Token-Kosten sind kein Kriterium.

---

## 2. Build-Pipeline

Zwei Schritte, Reihenfolge **zwingend**:

```bash
node build/build-map-data.mjs      # Schritt 1: GeoJSON → build/ch-map.generated.json
node build/build-html.mjs          # Schritt 2: Template + Daten → index.html
```

- **Schritt 1** ist nur nötig, wenn die **Geometrie/Quell-GeoJSON** sich ändert.
  Erzeugt `build/ch-map.generated.json` (SVG-Pfade) — diese Datei ist
  **gitignored**, fehlt also im frischen Clone → vor dem ersten `build-html.mjs`
  zwingend einmal laufen lassen.
- **Schritt 2** ersetzt im Template **genau 4 Tokens** und schreibt `index.html`:

  | Token | Quelle |
  |---|---|
  | `__MAPDATA__` | `build/ch-map.generated.json` (Geometrie) |
  | `__AUDITDATA__` | `src/data/audit-run.json` (Run 1, Kantone) |
  | `__RUN2DATA__` | `src/data/run2-municipal.json` (Run 2, Gemeinden) |
  | `__DWELLINGDATA__` | `src/data/dwellings.json` (Wohnungsbestand) |

  Jeder JSON-String wird via `safe()` escaped (`<` → `<`) und in
  `<script type="application/json">`-Blöcke injiziert. Fehlt ein Token im
  Template, wirft das Skript einen Fehler.

**Committet:** `index.html`, alle `build/*.mjs` (ohne `_`), `build/index.template.html`,
`src/data/*.json`, `src/data/source/*.geojson`, `docs/`, diese `CLAUDE.md`.
**Gitignored:** `build/ch-map.generated.json` und **alle** `build/_*.mjs`
(lokale Helfer-/Diagnose-Skripte, nicht versioniert).

**Live-URL** (raw.githack): `https://raw.githack.com/buer561-star/regulierungskarte/karte-only/index.html`

---

## 3. Datenmodell (Kurzfassung — Details in ARCHITECTURE.md §2)

Drei committete, handgepflegte JSON-Dateien in `src/data/`:

- **`audit-run.json`** — Run 1, kantonaler Rechtsrahmen. `cantons[]` (26), je
  Kanton `cantonal_instruments_found[]` mit `taxonomy_category`,
  `municipal_option_exists`, `bindingness` (Freitext), `excluded`. **Alleinige
  Quelle der Kantonsfarbe.**
- **`run2-municipal.json`** — Run 2, Gemeindeebene. `cantons[]` (26), je Kanton
  `checked[]` (344 einzeln geprüfte) + `triaged[]` (1787 per Schwelle
  übersprungene). Geprüfte mit Fund tragen `instruments[]` mit `taxonomy_category`,
  `legal_status`, `excluded`, `bindingness` (hier Enum `binding`). **Jeder
  `checked`/`triaged`-Eintrag trägt sein eigenes `units`-Feld.**
- **`dwellings.json`** — Wohnungsbestand GWS. `total=4'840'096`, `count=2115`,
  `gemeinden[]` mit `{bfs, name, kt, units}`. **`kt` ist hier die
  Kanton-ABKÜRZUNG (String!)** — in der Geometrie ist `kt` die Kanton-NUMMER.
  Diese Doppeldeutigkeit beim Join beachten.

**Join-Key** überall: `bfs` (numerisch). Geometrie-Linkage (Pfad↔Name↔BFS↔Kanton)
ist **by construction korrekt**, weil alle vier aus DEMSELBEN swisstopo-Feature
stammen (`build/build-map-data.mjs`). Nur JOINS zu den anderen Dateien können
verrutschen — deshalb gibt es das Diagnose-Skript `build/_audit_links.mjs`.

---

## 4. DAS ZENTRALE INVARIANT — Karten-Färbung & Ebenentrennung

Dies ist der wichtigste fachliche Punkt des Tools (vom Nutzer explizit geprüft).
Voll dokumentiert in ARCHITECTURE.md §3.

1. **Die Kantonsfarbe (`ktCat`) stammt AUSSCHLIESSLICH aus**
   `auditByKt[nr].cantonal_instruments_found`. Gemeindedaten (`munByBfs`/RUN2)
   fließen **NIE** in die Kantonsfarbe ein. → Nur weil eine Gemeinde etwas hat,
   wird ihr Kanton **nicht** so klassifiziert.
2. **Kantonskarte** (`mapMode==="kanton"`) färbt **inkl. Ermächtigungen**
   (`inclOptions=true`): bindende Kantonsinstrumente + reine Gemeindeoptionen,
   die der Kanton ermöglicht.
3. **Gemeindekarte** (`mapMode==="gem"`) färbt
   `gemCatSet(bfs) = cantonBindingCatSet(kt) ∪ municipalCatSet(bfs)`: den
   **bindenden** Kantonsrahmen (ohne noch nicht aktivierte Ermächtigungen) plus
   die **in-force, nicht-excluded** kommunalen Instrumente dieser konkreten
   Gemeinde.
4. **Kommunale Instrumente färben nur, wenn `munInForce(i)`** = nicht excluded,
   Kategorie vorhanden, `legal_status` fehlt oder `==="in_force"`. (Angenommen-
   aber-noch-nicht-in-Kraft / pendent färbt NICHT.) Und nur für Gemeinden in
   `munByBfs` — das enthält **nur** Run-2-Gemeinden mit `found===true`.
   - **„Beschlossen"-Markierung (färbt NICHT, nur Audit-Reiter 05/07):** Instrumente
     mit `legal_status==="adopted_not_yet_in_force"` werden in `gemCard` als
     amber-Pill **„Beschlossen · Kat n"** ausgewiesen (statt fälschlich „nichts
     gefunden"). Helfer `munAdopted(i)` + `futCat(i)`. Kategorie kommt aus
     `taxonomy_category` (nicht-excluded) bzw. dem neuen Feld **`future_category`**
     (timing-bedingt excludierte; gesetzt nur dort, wo das Instrument bei
     Inkraftsetzung wirklich Kat 1–6 wäre — NICHT bei substanziell ausgeschlossenen
     wie Mehrwertabgaben). Karten-Färbung bleibt unverändert (Invariant: beschlossen
     ≠ in Kraft). Dedup: bereits in-force gefärbte Kategorien erzeugen keinen
     zusätzlichen Beschlossen-Badge.
5. **Stärke-Ordnung:** `MAP_CAT_PRIORITY=[6,5,4,3,2,1]` — höhere Nummer gewinnt.
   `selectedCats`-Chips filtern auf beiden Ebenen über `strongestSel`.

Färbe-Palette: `TAX_COLORS={1:#4F9D69,2:#8FBCE8,3:#3B7DC4,4:#7E8AC4,5:#E8883A,6:#C5322B}`,
neutral `LANDFILL=#E4E7EA`.

---

## 5. i18n & Render-Architektur (Kurzfassung — Details in ARCHITECTURE.md §4)

- Globales `let LANG` (aus `localStorage['rk-lang']`, Default `de`); `STR={de,en}`
  (Strings + Interpolations-Funktionen); aktives `let T=STR[LANG]`.
- Taxonomie doppelt: `TAX/TAX_TITLE/TAX_SCALE/TAX_RULES/TAX_EXCLUDED` als
  reassignbare `let`-Bindings auf `*_DE`/`*_EN`.
- Statische Texte über Attribute `data-i18n` / `-html` / `-ph` / `-title` →
  `applyStatic()`.
- **`applyI18n()`** setzt `T` + alle TAX-Bindings neu und ruft **nur die
  Text-Render-Funktionen** auf — **NICHT** `buildMap`/`buildCovMap`/`repaint`
  (Polygonfarben sind sprachunabhängig). Sprachwechsel zeichnet die Karte also
  nicht neu.
- **Render vs. Wire:** Listener werden **1× in `wire*`-Funktionen** aus `init()`
  gesetzt; `render*`-Funktionen sind idempotent (overwrite via `innerHTML`) und
  setzen **keine** Listener. Neuen String hinzufügen: Key in `STR.de` **und**
  `STR.en`, dann entweder `data-i18n`-Attribut (statisch) oder `T.key` im Render
  (dynamisch). Nie Listener im Render.

---

## 6. Gotchas / Lektionen

- **(a) Workflow-Index-Bug:** Bei Fan-out NIE Agenten den Eintrag per
  `gemeinden[i]`-Index aus einer Datei ziehen lassen — das ging einmal massiv
  schief (80/145 Agenten recherchierten die falsche Nachbargemeinde).
  **Gemeinde-Daten (bfs/name/kt) inline in den Prompt einbetten und bfs hart
  pinnen.**
- **(b) Workflow `agentType`-Limitation:** Mid-session in `.claude/agents/*.md`
  erstellte Agenten sind im Workflow NICHT als `agentType` verfügbar (Registry
  wird bei Session-Start gesnapshottet). Workaround: als `general-purpose`
  starten und die Rolle zur Laufzeit per Read einlesen lassen.
- **(c) PowerShell + `git push`:** wickelt push-stderr rot als
  `NativeCommandError` — **der Push gelingt trotzdem.** stderr nicht als Fehler
  werten; für git ggf. die Bash-Tool nutzen.
- **(d) git committer** ist auto-konfiguriert (`Burak Er <be@smzh.ch>`) — die
  Identitäts-Warnung bei jedem Commit ist harmlos. CRLF-Warnung auf `index.html`
  ebenso.
- **(e) `preview_screenshot`** läuft bei der großen Seite (~MB) in Timeout →
  stattdessen numerische `preview_eval`-DOM-Checks nutzen. Nach Edit an
  `index.html` Preview neu laden (`location.reload()`).
- **(f) Workflow-`args`** erreichte ältere Skripte nicht zuverlässig → Listen
  notfalls direkt im Skript hardcoden. Bei großen Runs scheitert gelegentlich
  1 Agent an „API Error: Connection closed" → Einzel-Re-Run + Merge.
- **(g) Daten-Hygiene:** In `run2-municipal.json` sind `found:true` (100),
  `checked` mit ≥1 Instrument (123) und `run_meta.with_instrument_count` (101)
  nicht deckungsgleich — bei Übernahme neu berechnen statt blind vertrauen.

---

## 7. Taxonomie & Projekt-Agenten

**6 Kategorien**, von **Kat 1 = aktive Bodenpolitik** … über **Kat 5 =
Wohnraumschutz / Erhaltung (Verfahren)** — Schutz des GESAMTEN Mietbestands vor
Abbruch/Umnutzung/Zweckentfremdung über Bewilligungspflichten, OHNE
Mietzinskontrolle (NICHT „Bestandesschutz" i.S.v. Besitzstand/Grandfathering —
bewusst umbenannt; z. B. Stadt Bern Art. 16a BO) — bis **Kat 6 = harter
Wohnschutz / Mietzinskontrolle auf dem FREIEN Bestand** (nur BS/VD/GE).
Schlüssel-Ausschlüsse: **Mehrwertabgabe = Steuer → ausgeschlossen** (nicht Kat 3);
Kostenmiete geförderter/gemeinnütziger Wohnungen → Kat 3/1; Formularpflicht
Anfangsmietzins → Kat 5 (nicht Kat 6);
**Zweitwohnungs-/Erstwohnungsanteils-Steuerung (Lex Weber): EWA/EWAP-Anteile,
Zweitwohnungsbeschränkung, Lenkungsabgaben, touristische Bewirtschaftungs-/
Umnutzungssteuerung → ausgeschlossen, NICHT Kat 5** (raumplanerische Tourismus-
politik, kein Wohnschutz des bezahlbaren Bestands). **Abgrenzung:** genuiner
Zweckentfremdungs-/Wohnschutz inkl. Airbnb-/Kurzzeitvermietungs-Beschränkungen
(LDTR GE, VD, „Lex Airbnb") **bleibt Kat 5** (Erhalt von Wohnraum in der
Wohnnutzung). Umgesetzt 2026-06-30 (6 kantonale + 11 kommunale Instrumente
ausgeschlossen; Kantonsfarbe: BE/UR 5→1, GR/JU 5→4). Reiter 03 zeigt die
Taxonomie im Tool.

Zwei Projekt-Agenten in `.claude/agents/`:
- **`wohnpolitik-taxonom`** — klassifiziert Instrumente in die 6 Kategorien;
  enthält die verbindlichen Regeln + Ausschlüsse (Sektion „Ausschlüsse").
- **`quellen-agent`** — recherchiert + validiert Rechtsquellen (Tier-1) für
  konkrete Instrumente/Territorien.

---

## 8. Aktueller Stand (Stand 2026-06-27)

- **Run 1** (kantonaler Rechtsrahmen, 26 Kantone) — abgeschlossen + bereinigt.
- **Run 2** (Gemeinde-Recherche + Triage) — abgeschlossen: 344 einzeln geprüft
  (0 offen), 101 mit kommunalem Instrument, 1787 triagiert. Abdeckung
  62,8 % der CH-Wohnungen geprüft.
- **Zweisprachig DE/EN** — fertig (Umschalter + 7-Schritte-Tutorial).
- **Karten-Joins verifiziert + Dwellings an Gemeindestand 2025 angeglichen** —
  19 fusionierte Alt-BFS in Nachfolger summiert (Total unverändert
  4'840'096), `dwellings.count=2115`, Gemeindeabdeckung 100 %. Details:
  [docs/GEO_VINTAGE_POLICY.md](docs/GEO_VINTAGE_POLICY.md).

Letzte relevante Commits: `41e7586` (Joins + Vintage), `736b4b3` (DE/EN),
`3291fb8` (Run 2 komplett).

---

## 9. Weiterführende Dokumente

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — **vollständige, zeilengenaue**
  Referenz: alle Lookups, Färbe-Funktionen, i18n-Engine, Render/Wire, init,
  Datenschemata, Container-ids.
- [docs/GEO_VINTAGE_POLICY.md](docs/GEO_VINTAGE_POLICY.md) — 2024-IDs ↔
  2025-Geometrie, Fusions-Mapping, jetzt umgesetzt.
- [docs/REBUILD_NOTES.md](docs/REBUILD_NOTES.md) — historische Umbau-Doku
  (beschreibt das frühere Platzhalter-Instrument-Modell; teils überholt).
- [README.md](README.md) — öffentliche Projektbeschreibung.
