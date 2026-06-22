# Gemeinde-Kataster Schweiz

Interaktive Karte der Schweizer Kantone und Gemeinden. Die Klassifikation erfolgt
ausschließlich über **Instrumente** (später zu definieren) — **keine** Stufen-Hierarchie,
**kein** Status (in Kraft / pendent / abgelehnt / unklar), **keine** eingebetteten Regelinhalte.

> Hervorgegangen aus dem früheren „Regulierungs-Kataster Wohnungsmarkt". Dessen
> Originalversion und der vollständige Audit liegen unter `legacy/` bzw. `docs/`.

## Das aktuelle Tool

`index.html` — **selbst-enthaltenes Single-File-Tool** (keine externen Bibliotheken).
Drei Ansichten:
- **Karte:** Gemeinde- oder Kantonskarte; rechts wählbar, **welche Instrumente** eingefärbt werden; Hover/Klick zeigt Details; **SVG-Export**.
- **Tabelle & Filter:** alle Gemeinden mit BFS-Nummer, Kanton und Instrumenten; nach Instrument/Kanton/Suche filterbar.
- **Daten & Info:** Kennzahlen und Datenherkunft.

Live ansehen (öffentliches Repo, ohne Setup):
`https://raw.githack.com/buer561-star/regulierungskarte/<branch>/index.html`

## Datengrundlage

- **Geometrie:** swisstopo swissBOUNDARIES (Stand 2025, Rev. 04/2025), WGS84, in den SVG-Raum projiziert (voll detailliert).
- **Umfang:** nur Schweiz — **26 Kantone, 2115 Gemeinden, 10 Seen**. Liechtenstein und ausländische Enklaven (Büsingen, Campione) entfernt; CH-Sondergebiete (Staatswald Galm, 2 Kommunanzen) als neutrale Flächen.
- **Amtliche ID-Liste:** „Politische Gemeinden 01.01.2024" (2131 BFS) als Referenz in `src/data/source/gemeinde-id-2024.json`.
- ⚠ **Stichtags-Versatz:** ID-Liste = 2024, Geometrie = 2025 → 19 zwischenzeitlich fusionierte Gemeinden haben kein Polygon (Details in `docs/REBUILD_NOTES.md`).
- **Instrumente:** aktuell **Platzhalter (DEMO)** inkl. Beispiel-Zuordnungen, damit Karten- und Tabellenfilter testbar sind — im Quelltext unter `INSTRUMENTE` / `GEM_INSTR` markiert.

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
| `src/data/source/` | Quelldaten: `gemeinden.geojson`, `kantone.geojson`, `gemeinde-id-2024.json` |
| `research/` | Audit-/Test-Werkzeuge (`validate.mjs` für Legacy, `render-test.mjs` für neue App) |
| `docs/` | `REBUILD_NOTES.md` (neu) + Legacy-Audits (`TECHNICAL_AUDIT.md`, `MAP_MATCH_AUDIT.md`, `VALIDATION_CHECKS.md`) |
| `legacy/` | Unveränderte Originalversion des alten Tools |

## Nächster Schritt

Echte **Instrumente definieren** (`INSTRUMENTE`) und Gemeinde-Zuordnungen befüllen
(`GEM_INSTR`); danach Demo-Daten entfernen.
