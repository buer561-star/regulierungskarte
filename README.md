# Gemeinde-Kataster Schweiz

Interaktive Karte der Schweizer Kantone und Gemeinden. Die Klassifikation erfolgt
ausschließlich über **Instrumente** (später zu definieren) — **keine** Stufen-Hierarchie,
**kein** Status (in Kraft / pendent / abgelehnt / unklar), **keine** eingebetteten Regelinhalte.

> Hervorgegangen aus dem früheren „Regulierungs-Kataster Wohnungsmarkt". Dessen
> Originalversion und der vollständige Audit liegen unter `legacy/` bzw. `docs/`.

## Das aktuelle Tool

`index.html` — **selbst-enthaltenes Single-File-Tool** (keine externen Bibliotheken).
Drei Ansichten:
- **Karte:** Gemeinde- oder Kantonskarte, eingefärbt nach **exklusiver Kategorie (1–10)** der farbbestimmenden Instrumente; rechts wählbar, welche Kategorien angezeigt werden; Hover/Klick zeigt Instrumente mit Quelle; **SVG-Export**.
- **Instrumente & Filter:** Katalog aller Instrumente mit Territorium, Kategorie, Status, Rechtsgrundlage, Quelle; nach Kategorie/Status/Kanton/Suche filterbar.
- **Daten & Info:** Kennzahlen, Kategorien-Legende und Datenherkunft.
- **Audit & Quellen:** Auditberichte je Gebiet (Recherche, geprüfte Quellen nach Tier, gefundene/verworfene Instrumente, Klassifikations- und Kartenrelevanz-Logik, offene Fragen); Read-only-Ebene, verändert Karte/Klassifikation nicht.
- **Instrumente erklärt:** Übersicht der 10 exklusiven Kategorien (Erklärung + Anzahl) und aller erfassten Instrumente, nach Kategorie gruppiert.

Live ansehen (öffentliches Repo, ohne Setup):
`https://raw.githack.com/buer561-star/regulierungskarte/<branch>/index.html`

## Datengrundlage

- **Geometrie:** swisstopo swissBOUNDARIES (Stand 2025, Rev. 04/2025), WGS84, in den SVG-Raum projiziert (voll detailliert).
- **Umfang:** nur Schweiz — **26 Kantone, 2115 Gemeinden, 10 Seen**. Liechtenstein und ausländische Enklaven (Büsingen, Campione) entfernt; CH-Sondergebiete (Staatswald Galm, 2 Kommunanzen) als neutrale Flächen.
- **Amtliche ID-Liste:** „Politische Gemeinden 01.01.2024" (2131 BFS) als Referenz in `src/data/source/gemeinde-id-2024.json`.
- ⚠ **Stichtags-Versatz:** ID-Liste = 2024, Geometrie = 2025 → 19 zwischenzeitlich fusionierte Gemeinden haben kein Polygon (Details in `docs/REBUILD_NOTES.md`).
- **Instrumente:** Produktivdaten aus `src/data/instruments.json` + `territory-instruments.json` (beim Build in `index.html` injiziert). **Stand: Basel-Stadt + Luzern + Basel-Landschaft** (14 Instrumente, Tier-1/2-Quellen; Audit je Gebiet in `src/data/audit-reports.json`). Abdeckung wird kantonsweise erweitert. **Keine Demo-Daten.** Beispiele: Basel/Riehen/Bettingen = Kat 7 (rot); Stadt Luzern = Kat 8 (gelb, Kurzzeitvermietung), Vorkauf (Kat 5) `planned` ab 2027; Basel-Landschaft = nur Förderung (WBFG) → neutral.

## Reproduzierbarer Build

```bash
node build/build-map-data.mjs      # GeoJSON -> build/ch-map.generated.json (kompakte SVG-Pfade)
node build/build-html.mjs          # injiziert Daten in build/index.template.html -> index.html

# optionaler Render-Test (benötigt jsdom):
npm install jsdom --no-save && node research/render-test.mjs
```

Bearbeitet wird die App in **`build/index.template.html`**; `index.html` wird daraus generiert.

## Struktur

| Pfad | Inhalt |
|---|---|
| `index.html` | **Generiertes** Single-File-Tool (Deliverable) |
| `build/` | Build-Pipeline: `build-map-data.mjs`, `build-html.mjs`, `index.template.html` |
| `src/data/` | Produktivdaten: `instruments.json`, `territory-instruments.json`, `bfs-aliases.json`, `audit-reports.json` (+ `source/` Rohdaten) |
| `validation/` | `validate-data.mjs` (read-only) + `VALIDATION_PLAN.md` |
| `research/` | Werkzeuge (`render-test.mjs`, Legacy `validate.mjs`) + `pilots/` (BS-Plan, Findings, Bericht) + `AGENT_PLAN.md` |
| `docs/` | Architektur: Datenmodell, Taxonomie, Quellen-/Vintage-Policy, WP-Matrix, Coverage + Legacy-Audits |
| `legacy/` | Unveränderte Originalversion des alten Tools |

## Nächster Schritt

Weitere Kantone als Instrumente erfassen (nach `docs/RESEARCH_COVERAGE.md`), je Befund
quellenbelegt (`docs/SOURCE_POLICY.md`) und exklusiv kategorisiert
(`docs/INSTRUMENT_TAXONOMY.md`); vor Übernahme stets `node validation/validate-data.mjs`
(0 ERROR). Basel-Stadt, Luzern und Basel-Landschaft sind eingebaut.
