# Pilot-Befundbericht · Basel-Stadt

**Stand:** 2026-06-22 · **Status:** STAGING (in `research/pilots/BS_findings.json`), **noch nicht** in `src/data/` übernommen.
**Validierung:** `node validation/validate-data.mjs --findings research/pilots/BS_findings.json` → **0 ERROR, 1 WARN** (Warnung = Demo-Daten noch in der App).

## Geltungsmodell (zentral)
Basel-Stadt ist ein **Stadtkanton**. Der Wohnschutz beruht auf **kantonalem Recht** (WRFG SG 861.500 + WRSchV SG 861.540) und gilt **kantonsweit** für Basel, Riehen und Bettingen. Er greift nur bei **Wohnungsnot** = kantonale Leerwohnungsquote **≤ 1,5 %** (jährlich per 1. Juni festgestellt, gilt fürs Folgejahr; § 4 Abs. 4 WRFG, § 3 WRSchV). **2025: 0,9 %** → Wohnungsnot festgestellt, Regime **aktiv**. Grundregime **in Kraft seit 28.5.2022**; WRSchV-Teilrevision **per 1.11.2025**.

## Erfasste Instrumente (5) — exklusiv kategorisiert

| ID | Instrument | Kat. | §§ | Status | map_relevant | Conf. |
|---|---|---|---|---|---|---|
| bs-12-bewilligungspflicht-bestand | Bewilligungspflicht Abbruch/Umbau/Sanierung | **6** Bestandesschutz o. Mietzinskontrolle | §7, §8a WRFG; §20 WRSchV | in_force | **ja** | high |
| bs-12-mietzinskontrolle | 5-jährige Mietzinskontrolle nach Eingriffen | **7** Wohnschutz m. Mietzinskontrolle | §8b WRFG; §24/§26 WRSchV; §8c–8e WRFG | in_force | **ja** | high |
| bs-12-stockwerkeigentum-umwandlung | Bewilligungspflicht Begründung Stockwerkeigentum (≥4 Whg) | **5** Transaktion/Eigentum | §8 Abs.5 WRFG; §19 WRSchV | in_force | **ja** | high |
| bs-12-wohnschutzkommission | Wohnschutzkommission / Staatl. Stelle Wohnraumschutz | **10** Verfahren/Vollzug | §3a WRFG; §§14 ff. WRSchV | in_force | nein | high |
| bs-12-wohnraumfoerderung | Wohnraumförderung (Zweck WRFG) | **4** öff./gemeinnützige Produktion | §1 WRFG | in_force | nein | **low** |

**Wirkungs-Flags:** Kat.6 `stock_protection`; Kat.7 `rent_control`+`stock_protection`; Kat.5 `ownership_control`; Kat.10 `enforcement_process`; Kat.4 `supply_expansion`.

**Mehrfachwirkung sauber getrennt:** Das eine Basler „Wohnschutz"-Paket ist in **fünf** Instrumente zerlegt (eine Kategorie je Instrument) — exakt das Lehrbuchbeispiel aus `INSTRUMENT_TAXONOMY.md` (6/7/10 + zusätzlich 5 und 4).

## Karten-Wirkung (über Relationen)
- 20 Relationen: je Instrument 1× Kanton (`own`, nicht farbbestimmend) + 3× Gemeinde (`inherited`, BFS 2701/2702/2703).
- **Farbbestimmend** (map_relevant) sind nur die materiellen, bindenden Instrumente **Kat. 5/6/7** → Basel, Riehen, Bettingen würden über diese eingefärbt.
- **Nicht** farbbestimmend: Vollzug (Kat. 10) und Förderung (Kat. 4) — erscheinen in Tabelle/Detail, nicht als Hauptfarbe.
- Kantons-Aggregation (BS auf der Kantonskarte) entsteht ausschliesslich aus den Gemeinde-Relationen, **nicht** als pauschale Kantonsbehauptung (Relation `own` = map_relevant false).

## Quellenlage (Tiers)
- **Tier 1 (primär-rechtlich):** Gesetzessammlung BS — WRFG `861.500`, WRSchV `861.540`.
- **Tier 2 (amtlich erläuternd):** bs.ch Wohnschutz; Staatliche Stelle für Wohnraumschutz; Medienmitteilungen (Inkrafttreten 28.5.2022; Leerstand 2025 = 0,9 %).
- **Tier 3 (fachlich):** MLL (Paragraphen-Übersicht) — nur zur Bestätigung der §§, nicht alleinige Grundlage.
- Alle farbbestimmenden Instrumente: `confidence=high` (Tier 1 + Tier 2). Förderung: `confidence=low` (nur Zweckartikel belegt).

## Bewusste Abgrenzungen / „zählt NICHT als"
- **Keine** Hochstufung: Abbruch-/Umbau-Bewilligung bleibt **Kat. 6**; erst die **Mietzinskontrolle** ist **Kat. 7** (getrennt erfasst).
- **Stockwerkeigentum-Umwandlung** = Eigentumseingriff **Kat. 5**, nicht Mietzinskontrolle.
- **Kein** Airbnb-/Kurzzeit-Instrument (Kat. 8) in den BS-Quellen gefunden → **nichts erfunden**.
- **Keine** preisgünstig-Quote behauptet: in WRFG/WRSchV-Quellen **nicht** bestätigt → als offene Frage geführt, **nicht** als Instrument erfasst.

## Offene Fragen (für späteren Schritt)
1. Konkrete Förderinstrumente des WRFG (aktive Bodenpolitik, Darlehen, Fonds) einzeln belegen → ggf. Kat. 4 verfeinern/aufteilen.
2. Verbindliche preisgünstig-Quote (z. B. bei Arealentwicklungen) prüfen (evtl. Bau-/Planungsrecht statt WRFG) → ggf. Kat. 3.
3. Eigene kommunale Reglemente in **Riehen/Bettingen** über das kantonale Recht hinaus? In den Quellen keine gefunden (Annahme: keine).

## Empfehlung
Findings sind validiert und quellenfest. **Nächster Schritt (auf Freigabe):** Übernahme nach `src/data/instruments.json` + `territory-instruments.json`, erneute Validierung im Produktivmodus (Ziel 0 ERROR). Optional danach: Loader bauen, damit Basel-Stadt real auf der Karte erscheint (parallel Demo abschalten → Warnbanner verschwindet automatisch).
