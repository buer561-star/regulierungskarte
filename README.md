# Gemeinde- & Kantonskarte Schweiz

Interaktive Karte der Schweiz auf **Gemeinde-** und **Kantonsebene** — reine
Geometrie, ohne weitere Klassifikation.

> Abgespeckte Variante des früheren „Gemeinde-Kataster Schweiz". Der gesamte
> Instrumente-/Recherche-/Audit-Teil wurde in dieser Version entfernt; er liegt
> weiterhin auf dem ursprünglichen Branch.

## Das Tool

`index.html` — **selbst-enthaltenes Single-File-Tool** (keine externen Bibliotheken).
Eine Ansicht:

- **Karte:** Umschalter **Gemeindekarte ↔ Kantonskarte**. Hover/Klick markiert das
  Gebiet und zeigt rechts Name, BFS-Nummer und Kanton (bzw. Kantonsnummer und
  Gemeindezahl in der Kantonsansicht). Die aktuelle Ansicht lässt sich als **SVG**
  exportieren.

Live ansehen (öffentliches Repo, ohne Setup):
`https://raw.githack.com/buer561-star/regulierungskarte/<branch>/index.html`

## Datengrundlage

- **Geometrie:** swisstopo swissBOUNDARIES (Stand 2025, Rev. 04/2025), WGS84, in den
  SVG-Raum projiziert (voll detailliert).
- **Umfang:** nur Schweiz — **26 Kantone, 2115 Gemeinden, 10 Seen**. Liechtenstein und
  ausländische Enklaven (Büsingen, Campione) entfernt; CH-Sondergebiete (Staatswald
  Galm, 2 Kommunanzen) als neutrale Flächen.

## Reproduzierbarer Build

```bash
node build/build-map-data.mjs      # GeoJSON -> build/ch-map.generated.json (kompakte SVG-Pfade)
node build/build-html.mjs          # injiziert Geometrie in build/index.template.html -> index.html
```

Bearbeitet wird die App in **`build/index.template.html`**; `index.html` wird daraus generiert.

## Struktur

| Pfad | Inhalt |
|---|---|
| `index.html` | **Generiertes** Single-File-Tool (Deliverable) |
| `build/` | Build-Pipeline: `build-map-data.mjs`, `build-html.mjs`, `index.template.html` |
| `src/data/source/` | swisstopo-Rohdaten: `gemeinden.geojson`, `kantone.geojson` |
| `docs/` | Geometrie-Notizen: Vintage-Policy, Rebuild-Notes |
