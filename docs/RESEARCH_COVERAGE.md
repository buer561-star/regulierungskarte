# Recherche-Abdeckung

**Stand:** 2026-06-22 · **Status:** Abdeckungslogik definiert; **noch keine** Recherche durchgeführt.

## 1. Alle 26 Kantone (einzeln)

Für **jeden** Kanton prüfen:
- kantonale Sonderregelung (ja/nein)
- kantonale Wohnbauförderung
- Wohnschutz / Wohnraumschutz
- Vorkaufs-/Kaufsrechte
- Zweckentfremdungs-/Umnutzungsbeschränkungen
- Mietzins-/Rendite-/Kostenmiete-Kontrolle
- Kurzzeitvermietung (Airbnb)
- Zweitwohnungsregelung
- kommunale Delegations-/Aktivierungsrechte
- Listen von Gemeinden mit Wohnungsnot / besonderer Anwendbarkeit
- pendente oder abgelehnte Vorlagen (klar als **nicht aktiv** markiert)

Erfassung je Befund als Instrument nach `DATA_MODEL.md` (Kategorie nach `INSTRUMENT_TAXONOMY.md`, Beleg nach `SOURCE_POLICY.md`).

## 2. Grösste Gemeinden — PRO KANTON (einzeln, wegen Gemeindeautonomie)

**Grundsatz (Gemeindeautonomie):** Gemeinden können **eigenständig** Instrumente beschliessen (z. B. Stadt Zürich Quote/Fonds, Stadt Luzern Airbnb-Reglement) — **unabhängig** davon, ob der Kanton delegiert. Die kommunale Recherche erfolgt deshalb **pro Kanton**, nicht über eine einzelne nationale Top-50-Liste (die kleine Kantone und Hauptorte übergeht).

**Verbindliche Worklist:** `research/coverage/largest-municipalities-by-canton.json` (+ `.md`). Regel je Kanton: **alle Gemeinden ≥ 10'000 Einw. ∪ Top-3 ∪ Kantonshauptort**. Aktuell **193 Gemeinden** über alle 26 Kantone. Jede Worklist-Gemeinde wird im Audit **explizit** als geprüft (oder „nichts gefunden") markiert — keine stillen Lücken. Ergänzend gilt §3 (Trigger-Listen, grössenunabhängig).

**Quelle:** offizielle swisstopo-Einwohnerzahl (`src/data/source/gemeinden.geojson`, 2025). **Nicht geraten.** Vor finaler Verwendung gegen **BFS STATPOP / amtliches Gemeindeverzeichnis** gegenprüfen (Stichtag fixieren).

Die folgende nationale **Top-50-Tabelle** ist nur eine **Schnellreferenz** der absolut grössten Gemeinden; **maßgeblich ist die pro-Kanton-Worklist** oben.

| # | Gemeinde | Kt | BFS | Einw. | # | Gemeinde | Kt | BFS | Einw. |
|--:|---|---|--:|--:|--:|---|---|--:|--:|
| 1 | Zürich | ZH | 261 | 433'989 | 26 | Yverdon-les-Bains | VD | 5938 | 30'202 |
| 2 | Genève | GE | 6621 | 206'635 | 27 | Kriens | LU | 1059 | 29'632 |
| 3 | Basel | BS | 2701 | 176'329 | 28 | Rapperswil-Jona | SG | 3340 | 28'640 |
| 4 | Lausanne | VD | 5586 | 144'160 | 29 | Dietikon | ZH | 243 | 28'201 |
| 5 | Bern | BE | 351 | 136'988 | 30 | Meyrin | GE | 6630 | 26'882 |
| 6 | Winterthur | ZH | 230 | 119'315 | 31 | Montreux | VD | 5886 | 26'828 |
| 7 | Luzern | LU | 1061 | 85'534 | 32 | Bulle | FR | 2125 | 26'749 |
| 8 | St. Gallen | SG | 3203 | 78'213 | 33 | Frauenfeld | TG | 4566 | 26'747 |
| 9 | Lugano | TI | 5192 | 63'495 | 34 | Wetzikon (ZH) | ZH | 121 | 26'462 |
| 10 | Biel/Bienne | BE | 371 | 55'932 | 35 | Wädenswil | ZH | 293 | 25'753 |
| 11 | Neuchâtel | NE | 6458 | 44'898 | 36 | Wil (SG) | SG | 3427 | 24'980 |
| 12 | Bellinzona | TI | 5002 | 44'743 | 37 | Baar | ZG | 1701 | 24'973 |
| 13 | Thun | BE | 942 | 43'905 | 38 | Bülach | ZH | 53 | 24'186 |
| 14 | Köniz | BE | 355 | 42'958 | 39 | Horgen | ZH | 295 | 23'709 |
| 15 | Chur | GR | 3901 | 39'242 | 40 | Baden | AG | 4021 | 23'587 |
| 16 | Schaffhausen | SH | 2939 | 38'666 | 41 | Kreuzlingen | TG | 4671 | 23'241 |
| 17 | Fribourg | FR | 2196 | 38'660 | 42 | Nyon | VD | 5724 | 23'016 |
| 18 | Vernier | GE | 6643 | 37'460 | 43 | Riehen | BS | 2703 | 22'408 |
| 19 | La Chaux-de-Fonds | NE | 6421 | 37'233 | 44 | Carouge (GE) | GE | 6608 | 22'311 |
| 20 | Sion | VS | 6266 | 36'624 | 45 | Aarau | AG | 4001 | 22'290 |
| 21 | Uster | ZH | 198 | 36'352 | 46 | Allschwil | BL | 2762 | 22'110 |
| 22 | Lancy | GE | 6628 | 36'229 | 47 | Martigny | VS | 6136 | 21'759 |
| 23 | Emmen | LU | 1024 | 32'380 | 48 | Opfikon | ZH | 66 | 21'553 |
| 24 | Zug | ZG | 1711 | 31'995 | 49 | Wettingen | AG | 4045 | 21'479 |
| 25 | Dübendorf | ZH | 191 | 31'506 | 50 | Renens (VD) | VD | 5591 | 21'408 |

Für **jede Gemeinde der pro-Kanton-Worklist** prüfen: offizielle Website · Bau- und Zonenordnung · Nutzungsplanung · Wohnstrategie · preisgünstig-Reglemente/Quoten · Baurecht · Genossenschaftsförderung · aktive Bodenpolitik · Vorkaufsrecht · Zweckänderungsbeschränkungen · Kurzzeitvermietung/Airbnb · Wohnschutz · relevantes Abstimmungsmaterial · pendente Vorlagen (mit klarem Status). Befund je Gemeinde festhalten — auch „geprüft, nichts gefunden".

## 3. Bedingte Gemeinde-Recherche

Schafft ein Kanton einen Rahmen, den Gemeinden **lokal aktivieren/anwenden/ausgestalten** können, sind **zusätzliche** Gemeinden zu recherchieren. Auslöser u. a.:
- kommunales Vorkaufsrecht
- kommunaler Wohnschutz
- kommunale Zweckänderungsbeschränkungen
- kommunale preisgünstig-Quoten / Kostenmiete-Planungsauflagen
- Listen von Mangelgemeinden / besonderer Anwendbarkeit
- jedes Instrument, das **nur durch kommunale Aktivierung** wirkt

Für solche Fälle bestimmen: welche Gemeinden es **eingeführt** haben · welche **abgelehnt** · welche **pendent** · welche es nur **könnten, aber nicht** getan haben.

## Regel

**Nicht** blind alle 2'000+ Gemeinden recherchieren. **Aber** Gemeinden immer dann recherchieren, wenn kantonales Recht lokale Aktivierung/Anwendbarkeit erzeugt. Jeder erfasste Befund folgt Datenmodell, Taxonomie und Quellen-Policy.
