# Agent-Plan (nur Spezifikation)

**Stand:** 2026-06-22 · **Status:** **nur Spezifikation.** Es werden **keine** `.claude/agents/` angelegt, bis Datenmodell + Validierung stabil sind. Alle Agenten sind zunächst **read-only**; einzige Ausnahme später: `data-update-agent` (vorerst **deaktiviert**).

Gemeinsame Regeln für alle Agenten:
- **Read-only by default.** Kein Schreiben in Repo/Daten ohne ausdrückliche, separate Freigabe.
- Verbindlich: `DATA_MODEL.md`, `INSTRUMENT_TAXONOMY.md`, `SOURCE_POLICY.md`, `GEO_VINTAGE_POLICY.md`, `RESEARCH_COVERAGE.md`, `WP_SEARCH_MATRIX.md`.
- Bei Unsicherheit: kein Erzwingen — `needs_taxonomy_review=true` bzw. `confidence: low` / `status: unclear`.
- Niemals DEMO-Daten als Forschung behandeln.

---

## 1. architecture-map-match-agent
- **Mission:** Technische Konsistenz von Geometrie ↔ BFS ↔ Instrument-Zuordnung ↔ Karte/Tabelle/Detail prüfen.
- **Allowed:** Repo lesen; `validation/validate-data.mjs` und `research/render-test.mjs` ausführen; Reports schreiben **nur** nach `research/` oder `docs/`.
- **Forbidden:** Daten/Geometrie/Instrumente ändern; UI ändern; Quellen recherchieren.
- **Input:** `build/ch-map.generated.json`, `index.html`, `src/data/*`.
- **Output:** Konsistenzreport (BFS ohne Polygon, verwaiste Geometrien, Karte/Tabelle-Divergenz, Aggregations-Kennzeichnung).
- **Stop rules:** Stop nach Report; Stop bei nötiger Datenänderung (nur melden, nicht ausführen).

## 2. cantonal-legal-research-agent
- **Mission:** Pro Kanton (alle 26) Instrumente gemäß `RESEARCH_COVERAGE.md §1` erheben und nach Schema/Taxonomie strukturieren.
- **Allowed:** Web-Recherche (Tier-1/2 bevorzugt); Vorschlags-JSON nach `research/findings/<KT>.json` schreiben (Staging, **nicht** Produktiv `src/data/`).
- **Forbidden:** `src/data/instruments.json` direkt schreiben; Kategorien erzwingen; Tier-4-only als bestätigt markieren; Karte/UI ändern.
- **Input:** Kantonskürzel, Policies.
- **Output:** Instrument-Objekte (Schema) mit Quelle, `source_quality`, `confidence`, `status`, `map_relevant`, Begründung.
- **Stop rules:** Ein Kanton pro Lauf; Stop, wenn nur Tier-3/4 vorhanden (als `unclear`/`low` markieren); kein Self-Merge in Produktivdaten.

## 3. municipal-legal-research-agent
- **Mission:** Top-50-Gemeinden (`§2`) und **bedingte** Gemeinden (`§3`, lokale Aktivierung) erheben.
- **Allowed:** Web-Recherche; Schreiben nach `research/findings/mun/<BFS>.json` (Staging).
- **Forbidden:** Blind alle 2'000+ Gemeinden; Produktivdaten schreiben; Taxonomie erzwingen.
- **Input:** BFS-Liste (aus Top-50 + kantonalen Aktivierungs-Triggern), Policies.
- **Output:** wie Agent 2, je Gemeinde; inkl. „könnte, aber nicht eingeführt"-Fälle.
- **Stop rules:** Nur recherchieren, wenn Trigger (kantonaler Rahmen) vorliegt; ein definiertes Batch pro Lauf.

## 4. source-evidence-audit-agent
- **Mission:** Belegqualität bestehender/erhobener Instrumente gegen `SOURCE_POLICY.md` prüfen.
- **Allowed:** Repo + Staging lesen; URLs verifizieren; Audit-Report nach `research/` schreiben.
- **Forbidden:** Klassifikation/Status ändern; Daten schreiben.
- **Input:** Instrument-Objekte (Staging/Produktiv).
- **Output:** Pro Instrument: Tier-Einstufung, fehlende Belege, Vorschlag `confidence`/`map_relevant`, Flags für Tier-4-only.
- **Stop rules:** Stop nach Audit; keine inhaltliche Korrektur, nur Befund.

## 5. classification-consistency-agent
- **Mission:** Exklusivität & Korrektheit der Kategorien (1–10) prüfen; Mehrfachwirkung korrekt in mehrere Instrumente getrennt?
- **Allowed:** Repo + Staging lesen; Konsistenzreport schreiben.
- **Forbidden:** Kategorien selbst ändern; Daten schreiben; Taxonomie erweitern.
- **Input:** Instrument-Objekte, Taxonomie.
- **Output:** Liste von Verstößen (zwei Kategorien, fehlende Trennung, falsche 6-vs-7/3-vs-4/Airbnb-Einstufung), Vorschläge + `needs_taxonomy_review`-Empfehlung.
- **Stop rules:** Stop nach Report.

## 6. data-update-agent  *(DEAKTIVIERT bis später)*
- **Mission:** Geprüfte Staging-Findings nach `src/data/instruments.json` übernehmen und Build/Validierung auslösen.
- **Allowed (erst nach Freigabe):** Produktivdaten schreiben; `node build/*` und `node validation/validate-data.mjs` ausführen.
- **Forbidden (jetzt):** **alles** — Agent ist deaktiviert, bis Datenmodell + Validierung + Quellen-Audit stabil sind und ausdrücklich freigegeben.
- **Input:** auditierte Findings (Agenten 2–5 bestätigt).
- **Output:** Diff + Validierungsergebnis (muss 0 ERROR sein).
- **Stop rules:** Nur auf ausdrückliche Freigabe; Abbruch bei jedem Validierungs-ERROR; nie unbestätigte (Tier-4-only) Findings übernehmen.

---

## Aktivierungsreihenfolge (empfohlen)
1. Datenmodell + Validierung stabil (dieser Schritt) → 2. `architecture-map-match-agent` (read-only Check) → 3. **Pilotkanton** mit `cantonal-legal-research-agent` (z. B. BS oder LU) → 4. `source-evidence-audit-agent` + `classification-consistency-agent` auf Pilot → 5. erst danach Skalierung; `data-update-agent` zuletzt und nur freigegeben.
