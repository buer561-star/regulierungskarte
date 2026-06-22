# Validierungsplan · Daten-/Build-Konsistenz

**Stand:** 2026-06-22 · **Status:** Plan + erster Validator (`validation/validate-data.mjs`, read-only).

Der Validator **ändert keine Daten**. Er meldet ERROR/WARN/INFO und beendet mit Exit-Code ≠ 0 bei ERRORs (CI-tauglich).

```bash
node validation/validate-data.mjs
```

## Eingaben

- **Aktive Geometrie (Master = 2025):** `build/ch-map.generated.json` (Fallback: eingebettetes `mapdata` aus `index.html`). Liefert gültige BFS-Menge + Kantonsnummern.
- **Produktiv-Instrumente:** `src/data/instruments.json` (Tabelle) + `src/data/territory-instruments.json` (Relationen). **Leere Produktivdaten gelten als bestanden.**
- **Demo (nur Warnung):** inline `INSTRUMENTE`/`GEM_INSTR` aus `build/index.template.html` — Existenz erzeugt eine **WARN** (kein ERROR), bis Demo ersetzt ist.
- **Aliase:** `src/data/bfs-aliases.json` (aktive `aliases`; `_candidates_unverified` werden ignoriert).

> Stand: Der Validator läuft jetzt gegen die **Produktionsdateien** (Relationen gegen Geometrie/Instrumente) und warnt parallel über noch vorhandene Demo-Daten. Prüf-IDs im Code: `C-FIELDS, C-CAT, C-MAP, C-REL-ID, C-REL-BFS, C-REL-KT, C-REL-AGG` (Mapping zu C1–C10 unten).

## Prüfungen

| ID | Prüfung | Schwere | Gilt für |
|---|---|---|---|
| C1 | Jede Gemeinde-Instrument-Relation referenziert eine gültige BFS in der aktiven Geometrie (oder via Alias auflösbar). | ERROR | alle |
| C2 | Jede in `GEM_INSTR` referenzierte Instrument-ID existiert in der Instrument-Tabelle. | ERROR | alle |
| C3 | Jedes Instrument hat genau **eine** exklusive Kategorie — außer `needs_taxonomy_review=true`. | ERROR | real |
| C4 | Jedes echte Instrument hat einen `status`. | ERROR | real |
| C5 | Jedes echte Instrument hat `source_quality`. | ERROR | real |
| C6 | Jedes echte Instrument hat `last_checked`. | WARN | real |
| C7 | DEMO-Instrumente sind klar als Demo markiert und werden von der Produktiv-Validierung ausgenommen. | INFO/ERROR | alle |
| C8 | Kein Instrument mit Status `pending/planned/rejected/unclear/historical` ist standardmäßig `map_relevant=true`. | ERROR | real |
| C9 | Keine Gemeinde-Relation verschwindet still wegen fehlendem Polygon (BFS ohne Polygon ⇒ gemeldet). | ERROR | alle |
| C10 | Kantons-Aggregation muss als Aggregation gekennzeichnet sein, nicht als kantonales Recht. | INFO | UI-Invariante |

### Schwere-Logik
- **ERROR** blockiert (Exit ≠ 0). **WARN** sichtbar, blockiert nicht. **INFO** rein informativ.
- Im **DEMO-Modus** werden C3–C6/C8 (Felder echter Instrumente) als „skipped (demo)" geführt; C1/C2/C9 laufen trotzdem (Referenz-/Geometrie-Integrität der Demo-Zuordnungen).

## Erwarteter aktueller Befund (DEMO-Modus)

- C1/C2/C9: **OK** (alle 10 DEMO-BFS existieren in der 2025-Geometrie; alle referenzierten IDs existieren).
- C3–C6/C8: **skipped (demo)**.
- C7: **INFO** — nur DEMO-Daten vorhanden, keine Produktivdaten.
- C10: **INFO** — Aggregation ist im Code als Aggregat implementiert; UI-Kennzeichnung steht noch aus.

## Spätere Erweiterungen (mit Produktivdaten)

- C-GEO-Aliasprüfung (`bfs-aliases.json`), unbestätigte Aliase als WARN.
- `confidence`/`map_relevant`-Konsistenz gegen `SOURCE_POLICY.md` (z. B. `map_relevant=true` nur mit Tier-1/2-Beleg).
- Kategorie-IDs ∈ 1..10; `wp_reference_logic` ∈ 1..22.
- `canton_number` ∈ 1..26 und konsistent zur BFS-Geometrie.
