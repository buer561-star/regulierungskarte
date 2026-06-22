# Datenmodell · Instrument-zentriert

**Stand:** 2026-06-22 · **Status:** Modell definiert; noch **keine** echten Daten erfasst, **keine** UI gebaut.

## Kernprinzip

Klassifiziert wird über **Instrumente**, nicht über Karten-Stufen. Ein Territorium (Bund, Kanton, Gemeinde, Sondergebiet) kann **mehrere** Instrumente haben. **Jedes Instrument** ist deklariert, beschrieben, rechtlich begründet, belegt und genau **einer** exklusiven Kategorie zugeordnet.

## Speicherort (geplant)

| Datei | Inhalt |
|---|---|
| `src/data/instruments.json` | **Kanonische** Instrument-Tabelle (ein Eintrag = ein Instrument; territoriale Geltung separat) |
| `src/data/territory-instruments.json` | **Relationen** Instrument↔Territorium (`relation_type`: own/inherited/applied/activated/aggregate); Quelle der Karten-Ableitung |
| `src/data/bfs-aliases.json` | Alt→aktuell BFS-Auflösung (siehe `GEO_VINTAGE_POLICY.md`) |
| `src/data/demo/instruments.demo.json` *(optional)* | Demo-Instrumente, falls aus dem Tool ausgelagert (Phase 8) |
| Build-Ableitung | `INSTRUMENTE` (Legende/Filter) + `GEM_INSTR` (bfs→[instrument_id]) werden **generiert**, nicht von Hand gepflegt |

Format:
```json
{ "schema_version": 1, "as_of_geometry": "2025", "instruments": [ /* Instrument-Objekte */ ] }
```

## Instrument-Schema

```json
{
  "instrument_id": "",
  "territory_name": "",
  "territory_type": "canton | municipality | federal | special_area",
  "canton": "",
  "bfs_number": null,
  "canton_number": null,
  "instrument_name": "",
  "declared_description": "",
  "exclusive_category_id": null,
  "exclusive_category_name": "",
  "wp_reference_logic": [],
  "legal_basis": "",
  "legal_article": "",
  "government_level": "Bund | Kanton | Gemeinde",
  "spatial_scope": "schweizweit | kantonal | kommunal | teilräumlich | projektbezogen",
  "object_scope": "",
  "exemptions": "",
  "status": "in_force | pending | planned | rejected | unclear | historical",
  "binding_effect": "binding | permit_required | subsidy | voluntary | political_target | theoretical_only | unclear",
  "rent_control": false,
  "stock_protection": false,
  "transaction_control": false,
  "ownership_control": false,
  "use_control": false,
  "supply_expansion": false,
  "demand_support": false,
  "enforcement_process": false,
  "map_relevant": false,
  "primary_source_url": "",
  "secondary_source_url": "",
  "source_quality": "primary_legal | official_explanatory | professional_secondary | media_signal | interest_group_signal | unknown",
  "last_checked": "",
  "confidence": "high | medium | low",
  "needs_taxonomy_review": false,
  "notes": ""
}
```

### Feld-Semantik (Auszug)

- **`instrument_id`** — stabil, eindeutig. Konvention: `<scope>-<bfs|kt|ch>-<kurzslug>`, z. B. `mu-2701-abbruchbewilligung`, `kt-GE-ldtr`, `ch-zwg`.
- **`territory_type` / `bfs_number` / `canton_number`** — Verknüpfung zur Geometrie: `municipality` → `bfs_number` (Pflicht), `canton` → `canton_number` (1–26), `federal`/`special_area` → beide null.
- **`exclusive_category_id`** — genau **eine** Kategorie 1–10 (siehe `INSTRUMENT_TAXONOMY.md`). Ausnahme: `needs_taxonomy_review=true` ⇒ darf (vorübergehend) null sein.
- **`wp_reference_logic`** — Array der zutreffenden WP-Suchlogiken 1–22 (siehe `WP_SEARCH_MATRIX.md`); rein dokumentarisch, **nicht** kartenbestimmend.
- **`status`** — Rechts-/Verfahrensstand. **Nicht** dasselbe wie Kartenrelevanz.
- **`binding_effect`** — Verbindlichkeit (bindend / bewilligungspflichtig / Subvention / freiwillig / politisches Ziel / nur theoretisch möglich / unklar).
- **Wirkungs-Flags** (`rent_control`, `stock_protection`, `transaction_control`, `ownership_control`, `use_control`, `supply_expansion`, `demand_support`, `enforcement_process`) — boolesche Wirkungsmerkmale; erlauben spätere Quervergleiche **unabhängig** von der exklusiven Kategorie.
- **`map_relevant`** — steuert, ob das Instrument die **Standard**-Kartenfärbung beeinflussen darf. **≠ `status`.**
- **`source_quality` / `confidence` / `last_checked`** — Belegqualität (siehe `SOURCE_POLICY.md`).
- **`needs_taxonomy_review`** — wenn kein eindeutiger Kategorie-Fit (Taxonomie nie erzwingen).

## `map_relevant` ≠ `in_force` (zentrale Regel)

- **`map_relevant=true`** nur, wenn das Instrument tatsächlich gelten/wirken soll und kartografisch zählen darf. Default-Empfehlung: `map_relevant = (status==="in_force" && binding_effect ∈ {binding, permit_required})` — aber als **explizites Feld**, das pro Instrument überschreibbar ist.
- **`pending | planned | rejected | unclear | historical`** dürfen in **Tabellen** erscheinen, aber **nie** die Standard-Kartenfärbung bestimmen — außer der Nutzer wählt sie **explizit** als Filter (Status-Filter-Modus).

## Karte: vier vorgesehene Anzeige-Modi (später)

1. **Ausgewählte Instrumente** — färbt Gebiete mit dem/den gewählten Instrument(en).
2. **Ausgewählte Kategorien** — färbt nach exklusiver Kategorie 1–10.
3. **Status-gefiltert** — zeigt z. B. nur `in_force` oder bewusst nur `pending`.
4. **Abgeleitetes smzh-Summary-Level** — *später*; **keine** Rückkehr zur 0–4-Logik in dieser Phase.

> UI wird jetzt **nicht** gebaut. Dieser Abschnitt definiert nur, was die spätere Implementierung können muss.

## Ableitung für die Karte (Build)

```
territory-instruments.json (relations, territory_type=municipality, map_relevant)
  + instruments.json (Definition: exclusive_category_id, status, color/category)
  + bfs-aliases.json (alt→aktuell)
  → GEM_INSTR_MAP: bfs_number → [ {instrument_id, exclusive_category_id, color?} ]
  → INSTRUMENTE: eindeutige Instrument-/Kategorie-Liste für Legende & Filter
```
- Mehrere Instrumente je Gemeinde sind normal; die Karte muss mit **Mehrfachzuordnung** umgehen (heute zeigt der DEMO-Stand nur das erste — als bekannter Punkt vermerkt).
- **Kantons-Aggregation** (ein Kanton wirkt eingefärbt, weil eine Gemeinde ein Instrument hat) ist **explizit als Aggregation zu kennzeichnen**, nicht als kantonales Recht (Validierung V-MAP-10).

## Was der Code später brauchen wird (Checkliste)

- [ ] Loader für `src/data/instruments.json` + `territory-instruments.json` + `bfs-aliases.json` (statt inline-Konstanten).
- [ ] Build-Ableitung `INSTRUMENTE`/`GEM_INSTR` aus Relationen + Instrumenten.
- [ ] Kartenmodi 1–3 (Instrument/Kategorie/Status), Mehrfachzuordnung-Darstellung.
- [ ] Trennung „Standardfärbung" (`map_relevant`) vs. „explizit gefiltert".
- [ ] Aggregations-Kennzeichnung in der Kantonsansicht.
- [ ] Validierung als Build-Gate (`validation/validate-data.mjs`).
