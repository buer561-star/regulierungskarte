# Map-Match-Audit · Stimmen Karte und Daten zusammen?

**Geprüfte Datei:** `legacy/regulierungs-kataster-original.html` (unverändert)
**Beweis-Harness:** `research/validate.mjs` → Rohausgabe in `research/validate-output.txt`, JSON in `research/validate-results.json`
**Stand:** 2026-06-22 · **Es wurden keine Daten verändert.**

> Ziel dieses Dokuments: belegen, **wo** Geometrien, BFS-Nummern, Klassifikation, Karte, Tabelle und Detailpanel zusammenpassen — und wo nicht. Luzern wird als Testfall vollständig durchgeprüft.

---

## 1. Wie werden Geometrien mit Kantonen/Gemeinden verbunden?

| Ebene | Geometrie-Quelle | Schlüssel-Typ | Verknüpfung zum Datensatz |
|---|---|---|---|
| Kanton (`#cmap`) | `MAP.paths` | **Kantonskürzel** (`"ZH"`) | direkt über `CANTON_ORDER` → `CANTONAL[kt]` |
| Gemeinde (`#gmap`) | `MMAP.paths` | **BFS-Nummer** (`"1061"`) | `classify(bfs)` → `commByBfs[bfs]`, `MUNI[bfs]` |
| Stadt (Mischansicht, `#mixmap`) | `CITIES` | **BFS-Nummer** | `classify(bfs)` |

**Das Matching ist durchgehend BFS-basiert** (Gemeinden) bzw. kürzel-basiert (Kantone). Es gibt **keine** Name-basierte oder `kom_*`-basierte Verknüpfung in der aktiven Logik.

### 1.1 Erfolgt das Matching über BFS, Name oder `kom_luz`?
**Antwort: ausschließlich über die BFS-Nummer.**
- `MUNI`, `MMAP.paths`, `CITIES`, `NELVAL`, `APPLIED`, `PROJEKT` sind alle nach BFS gekeyt.
- Der Spezialschlüssel `kom_*` (z. B. `kom_luz`) ist das 4. Feld (`oldkey`) in `COMMUNES` und kommt bei genau 9 Städten vor:

| BFS | Name | oldkey |
|---|---|---|
| 230 | Winterthur | `kom_win` |
| 261 | Zürich | `kom_zh` |
| 351 | Bern | `kom_be` |
| 371 | Biel | `kom_biel` |
| 942 | Thun | `kom_thun` |
| **1061** | **Luzern** | **`kom_luz`** |
| 1711 | Zug | `kom_zug` |
| 3340 | Rapperswil-Jona | `kom_rj` |
| 6458 | Neuenburg | `kom_ne` |

**`kom_luz` & Co. werden von keiner Funktion gelesen** (Beleg: `oldkey` nur im Kommentar Z. 545; `classify` nutzt `c[0]/c[2]/c[4]`, nie `c[3]`). Es ist ein **Legacy-Feld** — funktional folgenlos, aber eine latente Falle für künftige Matching-Änderungen (Risiko R7).

---

## 2. Gemeinden ohne Geometrie (Datensatz → keine Karte)

`COMMUNES` enthält **2131** Gemeinden, `MMAP.paths` aber nur **2115** Geometrien. Abdeckung: **2112/2131** (19 Gemeinden ohne Geometrie).

**19 Gemeinden ohne MMAP-Geometrie:**
`1057 Honau (LU)` · `2061 Auboranges (FR)` · `2066 Chapelle (Glâne) (FR)` · `2072 Ecublens (FR)` · `2089 Montet (Glâne) (FR)` · `2200 Grolley (FR)` · `2217 Ponthaux (FR)` · `3932 Tschiertschen-Praden (GR)` · `5064 Bodio (TI)` · `5078 Prato (Leventina) (TI)` · `5146 Astano (TI)` · `5149 Bedigliora (TI)` · `5181 Curio (TI)` · `5200 Miglieglia (TI)` · `5207 Novaggio (TI)` · `6453 Enges (NE)` · `6454 Hauterive (NE)` · `6459 Saint-Blaise (NE)` · `6461 La Tène (NE)`

→ Diese Gemeinden erscheinen als **weiße Lücken** in der Gemeindekarte. 18 davon sind Baseline (kosmetisch). **Eine ist farbtragend → echter Defekt:**

### ⚠ R1 — Hauterive (NE, BFS 6454): gefärbt, aber unsichtbar
`6454` ist im `NELVAL`-Set → `classify(6454)` = **Stufe 3b (Bestandesschutz, geerbt)**. Es gibt aber **keine** `MMAP`- und keine `CITIES`-Geometrie. Folge: Diese Gemeinde müsste auf der Gemeindekarte orange (3b) und in der Mischansicht als Polygon erscheinen — **sie fehlt vollständig**. (Harness Check 2a/2b.)

---

## 3. Geometrien ohne Datensatz (Karte → kein Datensatz)

**3 verwaiste `MMAP`-Geometrien** ohne zugehörigen `COMMUNES`-Eintrag:

| Geometrie-Key | Liegt im BFS-Range von | `classify` (über `ktFromBfs`) |
|---|---|---|
| `2239` | FR | Baseline (FR hat kein `CANTONAL`) |
| `5395` | TI | Baseline |
| `6513` | NE | Baseline (nicht in `NELVAL`) |

→ Diese Polygone werden in der Gemeindekarte gezeichnet, klassifizieren mangels `commByBfs`-Eintrag über den Range-Fallback `ktFromBfs` zu **Baseline**, und zeigen beim Hover „BFS 2239" o. Ä. ohne Namen. Optisch grau (unauffällig), aber **inhaltlich tote Polygone** (Risiko R2). Wahrscheinliche Ursache: zwischenzeitliche Gemeindefusionen → Geometrie-Vintage ≠ `COMMUNES`-Vintage.

---

## 4. Alte Gemeindegrenzen / Fusionen / Namensprobleme

Die Daten stammen erkennbar aus **unterschiedlichen Gemeindeständen**:

- **NE-Cluster (Neuenburg-Agglomeration):** `6453 Enges`, `6454 Hauterive`, `6459 Saint-Blaise`, `6461 La Tène` stehen in `COMMUNES`, fehlen aber in `MMAP`; gleichzeitig existiert eine verwaiste Geometrie `6513`. Das ist das klassische Muster eines **Fusions-/Vintage-Versatzes** (mehrere Gemeinden am See wurden real fusioniert; Stamm- und Geometriedaten sind nicht synchron).
- **`CITIES` (8) ≠ `kom_*`-Städte (9):** Für **Neuenburg (6458)** existiert ein `kom_ne`-Schlüssel, aber **keine** `CITIES`-Stadtgeometrie. Neuenburg wird in der Mischansicht stattdessen über den `instrumentCommunes`-Pfad (NELVAL → `MMAP`) gezeichnet — funktioniert, ist aber eine **Inkonsistenz im „Stadt"-Konzept**.
- **TI-Cluster:** 7 Tessiner Gemeinden ohne Geometrie + 1 verwaiste TI-Geometrie (5395) → ebenfalls Vintage-Versatz, hier aber durchweg Baseline (folgenlos für die Farbe).
- **Namens-/Disambiguierung:** `COMMUNES` führt Klarnamen teils mit Kantonszusatz (`"Biel (BE)"`, `"Ecublens (FR)"`); da das Matching rein über BFS läuft, sind Namensvarianten **unkritisch** für die Verknüpfung (nur Anzeige).

---

## 5. Nutzen Karte, Tabelle, Detailpanel und Filter dieselbe Klassifikation?

| Komponente | Datenbasis | Stufe stammt aus |
|---|---|---|
| Gemeindekarte / Mischansicht | `classify(bfs)` | **effektive** Stufe (nur `in_kraft`/Vererbung/NELVAL) |
| Detailpanel (Gemeinde) | `communeDisplayRecord` → `classify(bfs)` | **identisch zur Karte** ✔ |
| Detailpanel (Kanton) / Kantonskarte | `cantonLevel` / `CANTONAL` | kantonsweite Stufe |
| **Tabelle & Filter** | `AREAS` (regelzentriert) | **nominelle Stufe der jeweiligen Regel + Status** (roh) |

→ **Karte und Detailpanel sind deckungsgleich.** Die **Tabelle weicht systematisch ab**, weil sie pro *Regel* eine Zeile zeigt (inkl. pendent/abgelehnt/unklar/projektbezogen), während die Karte pro *Fläche* eine effektive Farbe zeigt.

### Check 4 — Tabelle vs. Karte je BFS (8 Differenzen, alle erklärbar)

| Zeile (Tabelle) | BFS | Tabelle | Karte | Status | Erklärung |
|---|---|---|---|---|---|
| Dietikon | 243 | 2 | 0 | unklar | unklar färbt nicht ✔ |
| Wädenswil | 293 | 2 | 0 | unklar | unklar färbt nicht ✔ |
| Stadt Bern – Mietzinskontrolle | 351 | 4 | 3 | pendent | pendent färbt nicht ✔ (Karte zeigt das geltende 3b) |
| **Stadt Luzern – Wohnschutz (GEW)** | **1061** | **4** | **3** | **pendent** | **pendent färbt nicht ✔ (Karte zeigt das geltende 3a)** |
| Schaffhausen – Wohninitiative | 2939 | 2 | 0 | abgelehnt | abgelehnt färbt nicht ✔ |
| Wetzikon – Wohn-Initiative | 121 | 2 | 0 | abgelehnt | abgelehnt färbt nicht ✔ |
| Adliswil | 131 | 2 | 0 | pendent | pendent färbt nicht ✔ |
| Brunnen Nord (Ingenbohl) | 1364 | 2 | 0 | **in_kraft** | **scope=projektbezogen** → bewusst nur Tabelle ✔ |

→ **Keine echte Fehlfärbung.** Alle Differenzen folgen der dokumentierten Regel „nur `in_kraft` (und nicht projektbezogen) färbt". Der Fall Brunnen Nord ist der einzige mit `status=in_kraft` und wird **korrekt** durch `scope=projektbezogen` von der Färbung ausgenommen (Datensatz nur in `PROJEKT`, nicht in `MUNI`).

### Doppelzeilen je BFS (Quelle möglicher Verwirrung)
Zwei Flächen erscheinen **zweimal** in der Tabelle:
- **Bern (351):** `mu-351` = Stufe 3b *in Kraft* **und** `pa-1` = Stufe 4 *pendent* → Karte zeigt 3b.
- **Luzern (1061):** `mu-1061` = Stufe 3a *in Kraft* **und** `pa-2` = Stufe 4 *pendent* → Karte zeigt 3a.

→ Wer die Tabelle nach „Luzern" filtert, sieht eine **Stufe-4-Zeile (pendent)** neben der Stufe-3a-Zeile. Das ist die **wahrscheinlichste Ursache des Eindrucks „Karte und Tabelle stimmen bei Luzern nicht überein"** — tatsächlich ist beides korrekt, nur unterschiedlich gemeint (Regel- vs. Flächensicht).

---

## 6. Pendent / abgelehnt / unklar — nie farbbestimmend?

**Bestätigt (Check 5):** Gefärbte Gemeinden mit Status ≠ `in_kraft`: **0**.
- `classify` gibt `MUNI` nur bei `status==="in_kraft"` zurück; `PENDABG` wird von `classify` nie gelesen.
- Belegte effektive Kartenstufen der PENDABG-Gemeinden:
  - Bern (pendent St4) → Karte **St3** (eigenes geltendes 3b)
  - Luzern (pendent St4) → Karte **St3** (eigenes geltendes 3a)
  - Schaffhausen (abgelehnt St2) → Karte **St0**
  - Wetzikon (abgelehnt St2) → Karte **St0**
  - Adliswil (pendent St2) → Karte **St0**
- `unklar`-MUNI (Wädenswil 293, Dietikon 243) → Karte **St0** ✔

---

## 7. Ausgeklammerte Sonderregeln (Airbnb / Zweitwohnungen) — nie farbbestimmend?

**Bestätigt (Check 6):** `EXCLUDED` wird von `classify` **nirgends** referenziert.
- **Tessin (Lex Airbnb):** 106 Gemeinden, davon gefärbt: **0** → ganz TI = Baseline ✔
- **Stadt Luzern (Airbnb-90-Tage-Regel):** ausgeklammert; Luzern ist 3a **wegen des Vorkaufsrechts**, nicht wegen Airbnb ✔
- **Zürich Airbnb / Lex Weber:** nur Methodik-Text, keine Färbung ✔

---

## 8. Kann eine kommunale Spezialregel den ganzen Kanton einfärben?

**Nein (Check 7).**
- Die Kantonskarte nutzt `cantonLevel(kt)`, das **ausschließlich** `CANTONAL` auswertet. Kein Pfad von `MUNI` zur Kantonsfarbe.
- Gefärbte Gemeinden je Kanton in der Gemeindekarte (Auszug): **LU 1/80**, ZH 3/160, BE 7/335, ZG 3/11, SG 2/75 — also punktuell, **nicht** flächendeckend.
- Vollflächig gefärbt sind nur die **vererbbaren** Kantone: **GE 45/45, VD 300/300, BS 3/3** — das ist korrekt (kantonsweites Regime, `inheritable:true`).

### Nebenbefund R4 — Kantonskarte vs. Gemeindekarte divergieren (nicht-vererbbare Förder-Kantone)
| Kanton | Kantonskarte | Gemeindekarte | Grund |
|---|---|---|---|
| GR | Stufe 1 (grün) | **0/101 gefärbt** | `CANTONAL.GR.inheritable=false` |
| NW | Stufe 1 (grün) | **0/11 gefärbt** | `inheritable=false`, keine eigenen MUNI |
| ZG | Stufe 1 (grün) | 3/11 (nur eigene MUNI) | `inheritable=false` |

→ Für GR/NW erscheint der Kanton auf Kantons-/Mischkarte **grün**, auf der Gemeindekarte aber **vollständig grau**. Laut Methodik beabsichtigt („Kantonskarte = kantonsweite Regelung; Gemeindekarte = effektive Stufe je Gemeinde"), aber für Betrachtende **widersprüchlich** und prüfenswert.

---

## 9. Kantonale Regeln — nur bei Vererbbarkeit/aktiver Anwendung?

**Bestätigt (Check 8):**
- `inheritable:true` (GE, VD, BS) → alle Gemeinden geerbt gefärbt (45/300/3) ✔
- `inheritable:false` (ZH, GR, ZG, NW, SZ, OW) → **0 geerbte** Gemeinden; nur eigene `MUNI` färben (ZH 3, ZG 3) ✔
- **NE-Sonderpfad:** `CANTONAL.NE.inheritable=false`, dennoch 10 Gemeinden „geerbt" — das ist der **beabsichtigte `NELVAL`-Mechanismus** (eigener Zweig in `classify`, Z. 556), kein Defekt. (Die Harness markiert dies als ⚠, weil der generische Check den NELVAL-Sonderpfad nicht kennt — siehe `VALIDATION_CHECKS.md`.)

---

## 10. LUZERN — vollständiger Testfall

| Prüfpunkt | Befund | Status |
|---|---|---|
| `COMMUNES`-Eintrag | `[1061, "Luzern", "LU", "kom_luz", 48120]` | – |
| Match-Key `kom_luz` | = `oldkey`, **in der Logik nicht verwendet**; Matching über BFS 1061 | ✔ |
| `classify(1061)` | **Stufe 3 / Untertyp `vorkauf` (3a) / inherited=false / status=in_kraft** | ✔ |
| Quelle / Grundlage | „Stadt Luzern" / „Vorkaufsrecht-Reglement … + Bodenpolitik" | ✔ |
| `cantonLevel("LU")` | **0** → Kanton Luzern = Baseline; **Gemeinderegel färbt den Kanton nicht** | ✔ |
| MMAP-Geometrie 1061 | vorhanden | ✔ |
| CITIES-Geometrie 1061 | vorhanden | ✔ |
| Gefärbte LU-Gemeinden (Gemeindekarte) | **1/80 — nur die Stadt Luzern** | ✔ |
| Geometrie-Größe | Stadt-bbox = **5,3 %** der Kanton-bbox → plausibel klein, keine Übergröße | ✔ |
| Pendente Wohnschutzregel (GEW, St4) | nur `PENDABG`/Tabelle; **wirkt nicht auf `classify(1061)`** | ✔ |
| Airbnb-90-Tage-Regel | nur `EXCLUDED`/Methodik; **wird von `classify` nie gelesen** | ✔ |
| Karte ↔ Detailpanel | beide via `classify` → **3a Vorkauf**, deckungsgleich | ✔ |
| Karte ↔ Tabelle | Karte 3a; Tabelle zeigt zusätzlich eine **pendente St4-Zeile** (korrekt gelabelt) | ⚠ Verständnis |

### Luzern-Fazit
**Die Verdrahtung für Luzern ist sauber.** Karte, Detailpanel und Klassifikation stimmen exakt überein: Stadt Luzern = **3a (Vorkauf)**, der Kanton bleibt Baseline, nur die Stadtfläche ist gefärbt, und weder die **pendente Wohnschutzregel** noch die **Airbnb-Regel** sind farbbestimmend. Der einzige berechtigte Einwand ist **keine Verdrahtungs-, sondern eine Daten-/Zeitfrage**:

> ⚠ **R8 — Zeitpunkt:** `MUNI[1061].status="in_kraft"`, obwohl die Rechtsgrundlage „Volksabstimmung 14.6.2026, **in Kraft ab 09/2026**" lautet. Heute (2026-06-22) ist das Vorkaufsrecht **angenommen, aber formal noch nicht in Kraft**. Die Karte färbt Luzern also bereits 3a, bevor der genannte Inkrafttretens-Termin erreicht ist. Das ist eine inhaltliche Status-Entscheidung (angenommen = wird gefärbt vs. erst ab Inkrafttreten), die geklärt werden sollte — **nicht** ein Match-/Karten-Bug.

Der wahrscheinliche Grund für das Misstrauen („Luzern stimmt nicht überein"): die **Doppelzeile in der Tabelle** (3a in Kraft **+** 4 pendent) erweckt beim Filtern den Eindruck, Luzern sei „eigentlich Stufe 4". Karte (3a) und Tabelle (3a + pendent 4) sind aber beide korrekt.

---

## 11. Beweis-Übersicht (maschinell, `research/validate-results.json`)

```json
{
  "communes": 2131,
  "mmapGeoms": 2115,
  "geomCoverageMissing": 19,
  "orphanGeoms": 3,
  "citiesIssues": 0,
  "coloredNotInForce": 0,
  "tableMapDiff_total": 8,
  "tableMapDiff_critical_inforce": 1,   // = Brunnen Nord, durch scope=projektbezogen erklärt
  "oversizeGeoms": 2,                    // Glarus Süd, Basel – beide real grossflächig, kein Bug
  "tiColored": 0,
  "luzern_level": 3,
  "luzern_subtype": "vorkauf",
  "luzern_cantonLevel": 0,
  "luzern_coloredCommunesInCanton": 1
}
```

**Hinweis zu `oversizeGeoms`:** Glarus Süd (65 % der GL-bbox) und Basel (49 % der BS-bbox) sind **real** sehr grosse bzw. kantonsdominierende Gemeinden — die bbox-Heuristik schlägt korrekt an, es ist aber **keine** Fehlgeometrie. Wichtig war der Gegentest für Luzern: dort nur **5,3 %** → keine Übergröße.
