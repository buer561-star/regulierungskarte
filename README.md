# Regulierungs-Kataster Wohnungsmarkt Schweiz

Single-File-HTML-Tool, das Kantone und Gemeinden der Schweiz nach regulatorischer
Eingriffstiefe im Wohnungsmarkt (Stufen 0–4) klassifiziert: Karte, Tabelle, Filter,
Detailpanel, Methodik und eingebettete Daten.

## Repo-Status (Stand 2026-06-22)

Erster Schritt: **Sichern, analysieren, beweisen** — noch **keine** inhaltlichen
Korrekturen, kein Refactoring, kein neuer Research, **keine Datenänderung**.

## Struktur

| Pfad | Inhalt |
|---|---|
| `legacy/regulierungs-kataster-original.html` | **Unveränderte** Originalversion (Quelle der Wahrheit, md5 `4ebf25612867bfd88130c582ad7ca144`) |
| `docs/TECHNICAL_AUDIT.md` | Technischer Erst-Audit: Datenstrukturen, Färbelogik, Verdrahtung, Annahmen, Risiken |
| `docs/MAP_MATCH_AUDIT.md` | Map-Match-Audit: Geometrie↔BFS↔Klassifikation, Karte vs. Tabelle, **Luzern-Testfall** |
| `docs/VALIDATION_CHECKS.md` | Vorgeschlagene Validierungschecks + aktueller Befund |
| `research/validate.mjs` | Lauffähige, read-only Validierungs-Harness (`node research/validate.mjs`) |
| `research/validate-output.txt` · `research/validate-results.json` | Beweis-Artefakte des letzten Laufs |
| `src/`, `src/data/`, `src/styles/` | **Leer** — reserviert für eine spätere Modularisierung (noch nicht begonnen) |

## Kernbefund in einem Satz

Die Färbelogik ist sauber verdrahtet (ein Klassifikator speist Karte + Detailpanel;
pendent/abgelehnt/ausgeklammert färben nie); die realen Probleme liegen in der
**Geometrie-Datenqualität** (1 farbige Gemeinde ohne Geometrie, 3 verwaiste Geometrien,
Fusions-/Vintage-Versätze) und in zwei **missverständlichen Semantik-Brüchen**
(Kantons- vs. Gemeindekarte, Tabelle vs. Karte). **Luzern ist korrekt verdrahtet**
(3a Vorkauf) — siehe `docs/MAP_MATCH_AUDIT.md`.
