# Quellen-Policy

**Stand:** 2026-06-22 · **Status:** verbindlich für `source_quality` und `confidence`.

Jedes Instrument trägt eine Belegqualität (`source_quality`) und eine Sicherheitsstufe (`confidence`). Maßgeblich ist die **beste** verfügbare Quelle plus Gegenbeleg.

## Quellen-Tiers

### Tier 1 — Primäre Rechtsquellen → `source_quality: primary_legal`
- Kantonale Gesetzessammlungen
- Kommunale Reglemente, Verordnungen
- Bau- und Zonenordnungen
- Offizielles Abstimmungsmaterial
- Beschlüsse von Regierung, Stadt-/Gemeinderat, Parlament
- Offizielle Inkrafttretens-Dokumente

### Tier 2 — Offizielle erläuternde Quellen → `source_quality: official_explanatory`
- Kantons- und Gemeinde-Websites
- Offizielle Factsheets, FAQ
- Umsetzungs-/Vollzugsstellen, Wohnschutzämter
- Planungsberichte
- Offizielle Medienmitteilungen

### Tier 3 — Fachliche Sekundärquellen → `source_quality: professional_secondary`
- Wüest Partner, UBS
- JLL, CBRE, PwC, ZKB, Credit Suisse (soweit relevant)
- Bär & Karrer, Walder Wyss, CMS, MLL, VISCHER und andere juristische/fachliche Publikationen

### Tier 4 — Medien- & Interessengruppen-Signale → `source_quality: media_signal | interest_group_signal`
- NZZ, SRF, Tages-Anzeiger, Lokalmedien (`media_signal`)
- HEV, Mieterverband, Kampagnenseiten, Parteien (`interest_group_signal`)

*(Ohne brauchbare Quelle: `unknown`.)*

## Regeln

1. **Tier 4 ist nur ein Signal.** Es kann **nicht** alleinige Grundlage einer Klassifikation sein.
2. **Ein bestätigtes Instrument braucht Tier-1- oder Tier-2-Belege.**
3. Existiert nur Tier 3 oder Tier 4: Befund als **unbestätigt** kennzeichnen → `confidence: low`, und i. d. R. `status: unclear`, `map_relevant: false`.
4. **`map_relevant=true` nur**, wenn ein Tier-1/Tier-2-Beleg vorhanden ist (Rechtsgrundlage + Geltung belegt).
5. **Zwei-Quellen-Prinzip** für `confidence: high`: mindestens eine primäre Rechtsquelle (Tier 1) **und** ein bestätigender Beleg (Tier 1/2).

## Ableitung `confidence` (Richtwert)

| Beleglage | confidence |
|---|---|
| Tier 1 + bestätigender Tier 1/2 | high |
| genau eine Tier-1/2-Quelle | medium |
| nur Tier 3/4 | low |
| keine brauchbare Quelle | low + `status: unclear` |

## Pflichtfelder pro „echtem" Instrument
`primary_source_url` (Tier 1/2 bevorzugt), `source_quality`, `last_checked` (ISO-Datum), `confidence`. Fehlt eines → Validierungs-Warnung/-Fehler (siehe `VALIDATION_PLAN.md`).
