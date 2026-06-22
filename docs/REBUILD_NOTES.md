# Rebuild-Notizen · Umbau auf Instrument-Modell

**Stand:** 2026-06-22 · Branch `claude/peaceful-mccarthy-b5qewb`

Dokumentiert den Umbau vom „Regulierungs-Kataster Wohnungsmarkt" (Legacy) zum
**Gemeinde-Kataster mit Instrument-Logik** auf Basis echter swisstopo-Geometrie.

## Auftrag (Nutzervorgaben)

1. Karte prüfen, echte Geometrie + amtliche BFS-Liste verwenden.
2. Alle inhaltlichen Regelinformationen löschen.
3. Status löschen (in Kraft / pendent / geplant / abgelehnt / unklar).
4. Stufenlogik (0–4) löschen.
5. Klassifikation nur noch über **Instrumente** (werden später definiert).
6. Karte: auswählbar, welche Instrumente angezeigt werden.

### Entschiedene Vorgaben
- **Technik:** selbst-enthaltenes SVG, kein Zoom, mit **SVG-Download**.
- **Detail:** volle Geometrie-Auflösung (für SVG-Generierung).
- **Inhalt:** nur Schweiz — Kantone, Gemeinden, Seen.

## Karten-Check (Excel-ID-Liste ↔ GeoJSON)

| Quelle | Stand | Umfang |
|---|---|---|
| Excel `Gemeinde_ID.xlsx` | Politische Gemeinden **01.01.2024** | 2131 BFS |
| `gemeinden.geojson` (swisstopo) | **2025**, Rev. 04/2025 | 2141 Features |

- **2112** BFS matchen sauber, **0** Namensabweichungen.
- **19** Gemeinden nur in der Excel-Liste (2024) → 2025 fusioniert, daher kein Polygon. Beispiele: Enges, Hauterive (NE), Saint-Blaise, La Tène → **Laténa**; Grolley + Ponthaux → **Grolley-Ponthaux**; mehrere TI-/Glâne-Fusionen.
- **29** Features nur im GeoJSON: 11× Liechtenstein, 2× Auslandenklaven (Büsingen/Campione), 10× Seen, einige neue Fusionsgemeinden + Sondergebiete.

→ **Empfehlung:** ID-Liste und Geometrie auf **denselben Stichtag** bringen. Bis dahin ist die Geometrie (2025) die Quelle der Wahrheit für zeichenbare Flächen.

## Datenfilter (in `build/build-map-data.mjs`)

| Kategorie | Filter | Anzahl | Verwendung |
|---|---|---|---|
| Gemeinden | `objektart=="Gemeindegebiet" && icc=="CH"` | **2115** | Landflächen, instrumentfähig |
| Seen | `objektart=="Kantonsgebiet" && bfs>=9000` | **10** | Wasser-Layer |
| Sondergebiete | CH, sonst keine der obigen (Galm, 2 Kommunanzen) | **3** | neutrale Flächen, keine Gemeinden |
| Kantone | alle Features aus `kantone.geojson` | **26** | Kantonskarte + Grenzen/Labels |
| Ausgeschlossen | `icc!="CH"` (LI/DE/IT) | 13 | entfernt |

## Projektion

- Eingang: WGS84/CRS84 (lon/lat).
- Equirectangular mit cos(lat0)-Korrektur, `lat0≈46.81`, `k≈0.6844` (für die CH-Ausdehnung praktisch verzerrungsfrei; Seitenverhältnis 1.56 ≈ reale CH).
- Gemeinsamer Maßstab für Kantone/Gemeinden/Seen → exakte Überlagerung.
- viewBox `0 0 2000 1282.3`, Koordinaten auf 1 Nachkommastelle, **alle Vertices erhalten** (volle Auflösung). Ausgabegröße: `index.html` ≈ 1.7 MB.
- Löcher/Enklaven: alle Ringe (außen + innen) als Subpfade, `fill-rule:evenodd`.

## Instrument-Modell (Platzhalter)

```js
const INSTRUMENTE = [{id, name, color, demo:true}, ...];   // Registry
const GEM_INSTR   = { <bfs>: ["<instrumentId>", ...], ... }; // Zuordnung je Gemeinde
```
- Karte Gemeinde: Gemeinde wird in der Farbe des ersten ausgewählten Instruments eingefärbt, das sie besitzt; sonst neutral.
- Karte Kanton: Kanton wird eingefärbt, wenn mind. eine seiner Gemeinden ein ausgewähltes Instrument hat (Aggregat).
- Tabelle/Filter: Mehrfachauswahl von Instrumenten (UND-Verknüpfung), Kanton, Freitext.
- **DEMO-Daten:** 3 Platzhalter-Instrumente + 10 Beispiel-Zuordnungen (Zürich, Bern, Luzern, Basel, Genève, Lausanne, St. Gallen, Zug, Winterthur, Thun) — nur zur Funktionsdemonstration; vor Produktivnutzung ersetzen.

## Verifikation

`research/render-test.mjs` (jsdom) prüft die gebaute `index.html` headless:
2115 Gemeinde-Pfade, 26 Grenzen, 10 Seen, 26 Labels; Instrument-Färbung + Toggle;
Kantons-Aggregat; 2115 Tabellenzeilen + Filter; Detailpanel. **Alle 15 Checks bestanden.**

## Bewusst entfernt

`CANTONAL`, `MUNI`, `PENDABG`, `APPLIED`, `EXCLUDED`, `PROJEKT`, `NELVAL`,
`LVL`/`SUB3C`/`colorOf`/`classify`/`cantonLevel`, Status- und Stufen-UI,
Übersicht-„Ladder", Methodik-Stufen/Tags. (Vollständig erhalten in `legacy/`.)
