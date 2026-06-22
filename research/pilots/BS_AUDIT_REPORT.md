# Auditbericht · Basel-Stadt (Pilot)

**audit_id:** `audit-BS` · **Stand:** 2026-06-22 · **research_status:** integrated · **confidence:** high
**Maschinenlesbar:** `src/data/audit-reports.json` (wird ins Tool injiziert, Ansicht „04 Audit & Quellen").

## 1. Kanton Basel-Stadt
Stadtkanton (canton_number 12). Wohnschutz = **kantonales Recht** (WRFG SG 861.500 + WRSchV SG 861.540), gilt **kantonsweit** und greift bei **Wohnungsnot** = kantonale Leerwohnungsquote **≤ 1,5 %** (jährlich per 1.6. festgestellt, § 3 WRSchV / § 4 Abs. 4 WRFG). 2025: **0,9 %** → Wohnungsnot, Regime **aktiv**. In Kraft seit **28.5.2022**; WRSchV-Teilrevision **per 1.11.2025**.

## 2. Geprüfte Gemeinden
Basel **2701**, Bettingen **2702**, Riehen **2703** — alle in der 2025-Geometrie vorhanden.

## 3. Eingebaute Instrumente (5)
| Instrument-ID | Instrument | Kat. | §§ | map_relevant |
|---|---|---|---|---|
| `bs-12-bewilligungspflicht-bestand` | Bewilligungspflicht Abbruch/Umbau/Sanierung | 6 | §7, §8a WRFG; §20 WRSchV | ja |
| `bs-12-mietzinskontrolle` | 5-jährige Mietzinskontrolle | 7 | §8b WRFG; §24/§26 WRSchV | ja |
| `bs-12-stockwerkeigentum-umwandlung` | Stockwerkeigentum-Begründung bewilligungspflichtig | 5 | §8 Abs.5 WRFG; §19 WRSchV | ja |
| `bs-12-wohnschutzkommission` | Wohnschutzkommission / Staatl. Stelle | 10 | §3a WRFG; §§14 ff. WRSchV | nein |
| `bs-12-wohnraumfoerderung` | Wohnraumförderung (Zweck) | 4 | §1 WRFG | nein |

## 4. Alle 20 Relationen
Je Instrument: **1 Kanton-Relation** (`own`, canton_number 12, nicht farbbestimmend) + **3 Gemeinde-Relationen** (`inherited`, BFS 2701/2702/2703). 5 × 4 = **20**. Farbbestimmend sind die 3 Gemeinde-Relationen der Instrumente Kat 5/6/7 (= 9 Relationen mit `map_relevant=true`); die übrigen 11 sind `map_relevant=false`.

## 5. Warum alle drei Gemeinden gleich behandelt werden
Basel-Stadt ist ein **Stadtkanton**: Der Wohnschutz ist **kantonales** Recht und gilt **kantonsweit** für Basel, Riehen und Bettingen. Trigger ist die **kantonale** Leerwohnungsquote (eine Zahl für den ganzen Kanton), nicht eine per-Gemeinde-Quote. Folglich erben alle drei Gemeinden dieselben Instrumente (`relation_type=inherited`). Eigene, darüber hinausgehende kommunale Reglemente in Riehen/Bettingen wurden nicht gefunden.

## 6. Warum Kategorie 7 die Kartenfarbe bestimmt
Jede Gemeinde trägt die farbbestimmenden Kategorien **{5, 6, 7}**. Bei Mehrfachzuordnung gilt der **stärkste Eingriff** (Anzeigepriorität 7 > 6 > 5 > 3 > 8 > 4 > 9 > 2 > 10 > 1). Kategorie **7 (Wohnschutz mit Mietzinskontrolle)** ist der stärkste → Basel/Riehen/Bettingen erscheinen **rot**. Wird Kat 7 im Filter abgewählt, fällt die Farbe auf Kat 6 (orange).

## 7. Welche Instrumente nicht farbbestimmend sind
- **Kat 10 – Wohnschutzkommission/Staatl. Stelle:** rein prozessual/Vollzug → `map_relevant=false`.
- **Kat 4 – Wohnraumförderung:** Förderzweck, keine bindende Flächenwirkung; `confidence=low` → `map_relevant=false`.
Beide erscheinen in Detailpanel und Tabelle, färben aber die Karte nicht.

## 8. Verwendete Tier-1- und Tier-2-Quellen
- **Tier 1 (primär-rechtlich):** WRFG **SG 861.500**, WRSchV **SG 861.540** (gesetzessammlung.bs.ch).
- **Tier 2 (amtlich):** bs.ch *Wohnschutz*; *Staatliche Stelle für Wohnraumschutz*; Medienmitteilung *Leerstand 2025 = 0,9 %*; Inkrafttretens-Mitteilung 28.5.2022.
- **Tier 3 (ergänzend):** MLL (Paragraphen-Bestätigung) — nicht alleinige Grundlage.
Alle farbbestimmenden Instrumente: `source_quality=primary_legal`, `confidence=high`.

## 9. Offene Punkte
1. Konkrete WRFG-Förderinstrumente (Bodenpolitik, Darlehen, Fonds) einzeln belegen.
2. Verbindliche preisgünstig-Quote prüfen (evtl. Bau-/Planungsrecht → Kat 3).
3. Jährliche Wohnungsnot-Geltung (Leerstandsziffer) automatisiert nachführen.

## 10. Später zu verfeinern
- **Kat 4** in konkrete Förderinstrumente aufschlüsseln (statt eines Sammel-Instruments).
- Prüfen, ob eine **Kat-3-Quote** existiert; falls ja, als eigenes Instrument ergänzen.
- Geltungs-/Status-Logik um den jährlichen Leerstands-Trigger erweitern (heute als Notiz, nicht datengetrieben).

## Bewusst NICHT erfasst (nichts erfunden)
Airbnb/Kurzzeitvermietung (Kat 8) und eine preisgünstig-Quote (Kat 3) sind in den geprüften BS-Quellen **nicht** belegt und daher **nicht** als Instrument aufgenommen — nur als offene/abgelehnte Punkte dokumentiert.
