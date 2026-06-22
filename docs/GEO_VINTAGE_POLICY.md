# Geografische Vintage-Policy

**Stand:** 2026-06-22 · verbindlich für alle Gemeinde-/Kantons-Zuordnungen
**Status:** Policy festgelegt; Geometriedaten in dieser Phase **nicht** verändert.

## Problem

| Quelle | Stichtag | Umfang |
|---|---|---|
| Geometrie (`src/data/source/gemeinden.geojson`, swisstopo) | **2025** (Rev. 04/2025) | 2115 CH-Gemeinden |
| Amtliche ID-Liste (`src/data/source/gemeinde-id-2024.json`, BFS) | **01.01.2024** | 2131 Gemeinden |

Durch Fusionen/Aufhebungen zwischen 2024 und 2025 haben **19 BFS-Nummern aus der 2024-Liste kein Polygon** in der 2025-Geometrie. Ein Instrument, das auf eine solche BFS verweist, würde **stillschweigend von der Karte verschwinden**. Genau das soll diese Policy verhindern.

## Aktuelle Mismatch-Zusammenfassung

- 2024-Liste: **2131** · 2025-Geometrie: **2115** · saubere Schnittmenge: **2112** · Namensabweichungen bei gleicher BFS: **0**.
- **19 BFS nur in der 2024-Liste** (kein 2025-Polygon → fusioniert/aufgehoben).
- **3 neue BFS nur in der 2025-Geometrie** (Fusionsprodukte). Die übrigen 16 der 19 wurden in **bestehende** Nachbargemeinden eingemeindet (BFS des Nachfolgers existierte bereits 2024).

### Betroffene BFS (2024 ohne 2025-Polygon)

| BFS | Name (2024) | Kanton | Nachfolger-Kandidat (zu verifizieren, **keine Recherche in dieser Phase**) |
|---|---|---|---|
| 1057 | Honau | LU | offen |
| 2061 | Auboranges | FR | offen (Glâne) |
| 2066 | Chapelle (Glâne) | FR | offen (Glâne) |
| 2072 | Ecublens (FR) | FR | offen (Glâne) |
| 2089 | Montet (Glâne) | FR | offen (Glâne) |
| 2200 | Grolley | FR | **2239 Grolley-Ponthaux** (neu) |
| 2217 | Ponthaux | FR | **2239 Grolley-Ponthaux** (neu) |
| 3932 | Tschiertschen-Praden | GR | offen |
| 5064 | Bodio | TI | offen (Leventina) |
| 5078 | Prato (Leventina) | TI | offen (Leventina) |
| 5146 | Astano | TI | **5395 Lema** (neu) |
| 5149 | Bedigliora | TI | **5395 Lema** (neu) |
| 5181 | Curio | TI | **5395 Lema** (neu) |
| 5200 | Miglieglia | TI | **5395 Lema** (neu) |
| 5207 | Novaggio | TI | **5395 Lema** (neu) |
| 6453 | Enges | NE | **6513 Laténa** (neu) |
| 6454 | Hauterive (NE) | NE | **6513 Laténa** (neu) |
| 6459 | Saint-Blaise | NE | **6513 Laténa** (neu) |
| 6461 | La Tène | NE | **6513 Laténa** (neu) |

Neue 2025-BFS (Fusionsprodukte): **2239 Grolley-Ponthaux**, **5395 Lema**, **6513 Laténa**.

> Die Nachfolger-Kandidaten sind aus den Daten/Namen **abgeleitet**, nicht recherchiert. Vor Verwendung müssen sie bestätigt werden (offizielle Gemeindemutationsliste BFS). Die mit „offen" markierten Fälle wurden in bestehende Gemeinden eingemeindet; deren Ziel-BFS ist hier noch nicht zugeordnet.

## Empfohlene Policy

1. **Master = swisstopo 2025-Geometrie.** Die zeichenbaren Flächen (gültige BFS) ergeben sich ausschließlich aus der 2025-Geometrie.
2. **Jedes Gemeinde-Instrument muss eine BFS referenzieren, die in der 2025-Geometrie existiert** (primärer Kartenschlüssel = aktuelle BFS).
3. **Historische/fusionierte BFS nur als Alias**, nie als primärer Kartenschlüssel. Aliase werden in einer separaten Tabelle geführt (siehe unten).
4. **Instrument einer ehemaligen Gemeinde** wird auf das **aktuelle Nachfolge-Territorium (gültige BFS)** abgebildet, mit explizitem Vermerk (`notes`) zur Herkunft (z. B. „galt für Gemeinde 6454 Hauterive, heute Teil von 6513 Laténa").
5. **Kein Instrument darf unsichtbar verschwinden:** Verweist ein Instrument auf eine BFS ohne Polygon und ohne Alias, ist das ein **Validierungsfehler** (kein stilles Ignorieren).

## Alias-Handling (Logik)

Geplante Datei: `src/data/bfs-aliases.json`
```json
{
  "as_of_geometry": "2025",
  "aliases": [
    { "old_bfs": 6454, "old_name": "Hauterive (NE)", "valid_bfs": 6513, "valid_name": "Laténa", "mutation": "fusion", "year": 2025, "verified": false, "note": "Kandidat – offiziell zu bestätigen" }
  ]
}
```
- **Auflösungsregel:** Beim Build/Validieren wird jede Instrument-BFS zuerst gegen die 2025-Geometrie geprüft; fehlt sie, wird `bfs-aliases.json` konsultiert und auf `valid_bfs` umgelenkt (mit Warnung, solange `verified=false`).
- Alias ist **nur** Auflösung alt→aktuell; die Karte nutzt immer die aktuelle BFS.

## Benötigte Validierungsregeln (siehe `validation/VALIDATION_PLAN.md`)

- **V-GEO-1:** Jede `bfs_number` eines Gemeinde-Instruments ∈ 2025-Geometrie **oder** über `bfs-aliases.json` auflösbar.
- **V-GEO-2:** Jeder Alias hat eine gültige `valid_bfs` ∈ 2025-Geometrie.
- **V-GEO-3:** Kein Instrument verweist auf eine BFS ohne Polygon und ohne Alias (Fehler, nicht Warnung).
- **V-GEO-4:** Unbestätigte Aliase (`verified=false`) erzeugen eine Warnung, bis offiziell geprüft.
- **V-GEO-5:** `canton_number` ∈ {1..26}; Konsistenz `bfs_number` ↔ `canton_number` (BFS-Range/Geometrie-Kanton).

## Nicht in dieser Phase geändert

Es wurden **keine** Geometriedaten verändert. Die Angleichung (Aliasliste füllen, Stichtag final fixieren) ist ein eigener, dokumentierter Folgeschritt. Trivial und sofort umsetzbar wäre lediglich das Anlegen einer leeren `bfs-aliases.json` mit den drei eindeutigen Kandidaten — auch das ist hier bewusst **noch nicht** erfolgt (Wunsch: erst Modell/Validierung stabilisieren).
