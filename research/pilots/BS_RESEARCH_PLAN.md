# Pilot-Recherche-Plan · Basel-Stadt

**Stand:** 2026-06-22 · **Status:** **PLAN.** Es werden in dieser Phase **keine** Instrumentdaten erfasst und **keine** inhaltlichen Aussagen getroffen. Alle „erwarteten" Punkte sind **Hypothesen, die zu belegen oder zu verwerfen sind**.

Verbindlich: `DATA_MODEL.md`, `INSTRUMENT_TAXONOMY.md`, `SOURCE_POLICY.md`, `WP_REFERENCE_INSTRUMENTS.md`, `GEO_VINTAGE_POLICY.md`.

## 1. Zu prüfende Territorien

| Territorium | Typ | BFS / Kt-Nr | In 2025-Geometrie |
|---|---|---|---|
| Kanton Basel-Stadt | canton | canton_number 12 | ja |
| Stadt Basel | municipality | bfs 2701 | ja |
| Riehen | municipality | bfs 2703 | ja |
| Bettingen | municipality | bfs 2702 | ja |

> Basel-Stadt ist ein Stadtkanton: viele Regeln sind **kantonal**, wirken aber faktisch (über)kommunal. Kantonale Instrumente werden als `territory_type=canton` erfasst; ihre Geltung in Basel/Riehen/Bettingen wird über **Relationen** (`territory-instruments.json`, `relation_type` = inherited/applied/aggregate) abgebildet — **nicht** als pauschale Kantonsfärbung.

## 2. Primäre Rechtsquellen (Tier 1) — zu durchsuchen
- Systematische Gesetzessammlung Basel-Stadt (kantonale Erlasse: Gesetze, Verordnungen).
- Kommunale Reglemente der Gemeinden **Riehen** und **Bettingen** (Bürgergemeinde-/Einwohnergemeinde-Erlasse, soweit vorhanden).
- Bau- und Planungsrecht des Kantons (Bau-/Planungsgesetz, Zonen-/Nutzungsplanung).
- Offizielles Abstimmungs-/Erläuterungsmaterial zu einschlägigen Vorlagen.
- Inkrafttretens-/Beschlussdokumente (Grosser Rat, Regierungsrat).

## 3. Offizielle erläuternde Quellen (Tier 2) — zu durchsuchen
- Kantonale Fachstelle(n) für Wohnen/Wohnraumschutz; zuständiges Departement (Bau/Wohnen).
- Offizielle Factsheets/FAQ zu Wohnraumschutz, Bewilligungspflichten, Mietzinskontrolle.
- Websites der Gemeinden Riehen und Bettingen (Wohnen/Bau/Planung).
- Offizielle Medienmitteilungen zu Inkrafttreten/Revisionen.

*(Tier 3/4 nur als Signal; Klassifikation braucht Tier 1/2 — siehe `SOURCE_POLICY.md`.)*

## 4. Exakte Suchbegriffe
**DE:** Wohnraumschutz · Wohnschutz · Wohnraumfördergesetz · Abbruchbewilligung · Abbruch · Umbau · Sanierung · Renovation · Zweckentfremdung · Mietzinskontrolle · Mietzinsprüfung · Mietzinsplafonierung · Wohnschutzkommission · Bewilligungspflicht · Erhaltung Mietwohnraum · Wohnungsnot · Leerstand · Stockwerkeigentum Umwandlung · Vorkaufsrecht · Kostenmiete · gemeinnütziger Wohnungsbau · Baurecht · Bodenpolitik · Kurzzeitvermietung · Airbnb · Zweitwohnung · Belegungsvorschrift · Gestaltungsplan · Arealentwicklung Anteil preisgünstig.
**WP-Anker (Suchmatrix):** v. a. WP 11, 13, 17; ergänzend 2, 7, 8, 10 (siehe `WP_REFERENCE_INSTRUMENTS.md`).
**Erlass-Hinweise (nur als Sucheinstieg, NICHT als bestätigte Fakten):** Begriffe wie „WRFG", „Wohnraumschutz-Verordnung" sind Suchziele und müssen am Primärtext verifiziert werden.

## 5. Erwartete Instrument-Familien (Hypothesen, **ohne** finale Klassifikation)
Nur Suchhypothesen — jede ist zu belegen/verwerfen und erst dann exklusiv einzuordnen:
- Bewilligungspflicht bei Abbruch/Umbau/Sanierung → *Hypothese* Kat. 6 (ohne Mietzinskontrolle) **oder** Kat. 7 (mit Mietzinskontrolle) — entscheidend ist, ob behördliche Mietzinskontrolle vorliegt.
- Mietzins-/Renditekontrolle nach Sanierung/Abbruch → *Hypothese* Kat. 7.
- Wohnschutzkommission / Vollzugsstelle → *Hypothese* Kat. 10 (separates Instrument).
- Umwandlung in Stockwerkeigentum bewilligungspflichtig → *Hypothese* Kat. 5.
- Anteil preisgünstig bei Arealentwicklungen → *Hypothese* Kat. 3.
- Förderung/Bodenpolitik/gemeinnütziger Wohnbau → *Hypothese* Kat. 4.
- Kurzzeitvermietung/Zweitwohnung → *Hypothese* Kat. 8.

→ Mehrfachwirkung wird in **mehrere** Instrumente zerlegt (eine Kategorie je Instrument). Kein Hochstufen; Airbnb bleibt Kat. 8.

## 6. Evidenzschwelle
- **Bestätigt + `map_relevant` zulässig:** mind. **eine Tier-1-Quelle** (Erlasstext/Beschluss) **und** ein bestätigender Tier-1/2-Beleg; `status=in_force` mit belegtem Inkrafttreten; `confidence=high`.
- **Erfasst, aber nicht farbbestimmend:** nur Tier-2 ODER unklarer Geltungsstand → `status=unclear|pending`, `map_relevant=false`, `confidence=medium|low`.
- **Nur Signal:** ausschliesslich Tier-3/4 → erfassen als `unclear`, `confidence=low`, `map_relevant=false`.
- Jede `bfs_number` muss in der 2025-Geometrie existieren (BS: 2701/2702/2703 ok); sonst Alias nötig.

## 7. Output-Format
Staging-Datei (in einem späteren Schritt, **nicht jetzt**): `research/pilots/BS_findings.json`
```json
{
  "pilot": "BS",
  "generated": "",
  "instruments": [ /* Objekte nach instruments.json _field_template */ ],
  "relations": [ /* Objekte nach territory-instruments.json _relation_template */ ]
}
```
- Erst nach Quellen-Audit (`source-evidence-audit-agent`) und Klassifikations-Check (`classification-consistency-agent`) werden Findings nach `src/data/instruments.json` + `territory-instruments.json` übernommen — und nur, wenn `validation/validate-data.mjs` 0 ERROR liefert.

## 8. Stop-Regeln
- **Diese Phase:** nur Plan; **keine** Recherche, **keine** Findings-Datei, **keine** Produktivdaten.
- Recherche (späterer Schritt): nur die 4 BS-Territorien; **keine** Ausweitung auf andere Kantone.
- Kein Erzwingen einer Kategorie → `needs_taxonomy_review=true`.
- Bei ausschliesslich Tier-3/4-Lage: als unbestätigt markieren, nicht als Fakt.
- Stop und Rückfrage, wenn ein Instrument weder in die Taxonomie noch sinnvoll als `needs_taxonomy_review` passt, oder wenn Geltungsstand/Inkrafttreten widersprüchlich ist.
