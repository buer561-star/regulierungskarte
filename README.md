# Regulierungskarte Schweiz — wohnpolitische Instrumente

Interaktive Karte der Schweiz auf **Gemeinde-** und **Kantonsebene**, die
**wohnpolitische Regulierungs-Instrumente** nach einer **6-Kategorien-Taxonomie**
(aktive Bodenpolitik … harter Wohnschutz mit Mietzinskontrolle) einfärbt — auf
Basis echter swisstopo-Geometrie und eines recherchierten Rechts-Audits.

`index.html` ist ein **selbst-enthaltenes Single-File-Tool** (keine externen
Bibliotheken, kein Server, keine Installation).

Live ansehen (öffentliches Repo, ohne Setup):
`https://raw.githack.com/buer561-star/regulierungskarte/karte-only/index.html`

## Funktionen (7 Reiter)

1. **Karte** — Umschalter Gemeinde-/Kantonskarte; Kategorie-Chips (Mehrfachauswahl);
   jedes Gebiet wird nach der stärksten ausgewählten Kategorie eingefärbt. Hover/Klick
   öffnet ein Detailpanel mit Rechtsrahmen und Wohnungszahl. Kennzahlen darunter;
   SVG-Export. *Ebenentrennung:* Die Kantonskarte zeigt nur kantonal Geltendes, die
   Gemeindekarte nur auf Gemeindeebene Bindendes — eine Gemeinde reklassifiziert nie
   ihren Kanton.
2. **Übersicht** — alle 26 Kantone und 2115 Gemeinden mit BFS, suchbar/sortierbar.
3. **Taxonomie** — die 6 Wohnpolitik-Kategorien erläutert.
4. **Audit · Kantone** — der kantonale Rechtsrahmen-Run (Run 1) mit Quellen.
5. **Audit · Gemeinden** — die Gemeinde-Tiefenprüfung (Run 2): einzeln geprüft + Triage.
6. **Audit · Übersicht** — Abdeckungskarte + Verteilung der Wohnungen (geprüft vs. nicht).
7. **Wohnungen** — Wohnungsbestand je Kanton und Gemeinde (GWS).

Oben rechts: Sprachumschalter **DE/EN** und ein Tutorial.

## Datengrundlage

- **Geometrie:** swisstopo swissBOUNDARIES (Stand 2025, Rev. 04/2025), WGS84, in den
  SVG-Raum projiziert (voll detailliert). Nur Schweiz — **26 Kantone, 2115 Gemeinden,
  10 Seen**; Liechtenstein und ausländische Enklaven (Büsingen, Campione) entfernt,
  CH-Sondergebiete (Staatswald Galm, 2 Kommunanzen) als neutrale Flächen.
- **Rechts-Audit:** `src/data/audit-run.json` (kantonal) und
  `src/data/run2-municipal.json` (kommunal) — recherchiert und nach Taxonomie
  klassifiziert.
- **Wohnungsbestand:** `src/data/dwellings.json` (GWS, an Gemeindestand 2025
  angeglichen), CH-Total 4'840'096.

## Reproduzierbarer Build

```bash
node build/build-map-data.mjs      # GeoJSON -> build/ch-map.generated.json (kompakte SVG-Pfade)
node build/build-html.mjs          # injiziert Geometrie + Daten in das Template -> index.html
```

Bearbeitet wird die App in **`build/index.template.html`**; `index.html` wird daraus
generiert (Token-Injektion von Geometrie, Audit, Run 2 und Wohnungen).
`build/ch-map.generated.json` ist ein Build-Artefakt (gitignored) und muss vor dem
ersten `build-html.mjs` einmal erzeugt werden.

## Struktur

| Pfad | Inhalt |
|---|---|
| `index.html` | **Generiertes** Single-File-Tool (Deliverable) |
| `build/` | Build-Pipeline: `build-map-data.mjs`, `build-html.mjs`, `index.template.html` |
| `src/data/` | `audit-run.json`, `run2-municipal.json`, `dwellings.json` |
| `src/data/source/` | swisstopo-Rohdaten: `gemeinden.geojson`, `kantone.geojson` |
| `docs/` | `ARCHITECTURE.md`, `GEO_VINTAGE_POLICY.md`, `REBUILD_NOTES.md` |
| `CLAUDE.md` | Projekt-Handover für die Weiterarbeit |
