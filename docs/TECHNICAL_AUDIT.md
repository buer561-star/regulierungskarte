# Technischer Erst-Audit · Regulierungs-Kataster Wohnungsmarkt Schweiz

**Geprüfte Datei:** `legacy/regulierungs-kataster-original.html` (= unveränderte Originalkopie, 551 KB, 837 Zeilen, md5 `4ebf25612867bfd88130c582ad7ca144`)
**Stand der Prüfung:** 2026-06-22
**Methode:** Statische Code-Analyse + lauffähige Validierungs-Harness (`research/validate.mjs`), die Daten und reine Logik direkt aus der Legacy-HTML lädt und auswertet. **Es wurden keine Daten, Texte, Klassifikationen oder Geometrien verändert.**

---

## 1. Aufbau der Datei

Single-File-HTML, drei Blöcke:

| Zeilen | Inhalt |
|---|---|
| 1–181 | `<head>` + komplettes CSS (inkl. Farbvariablen `--l0…--l4`) |
| 181–280 | HTML-Body: Sidebar/Nav, 4 Views (Übersicht, Karte, Tabelle, Methodik), 3 leere `<svg>` (`#cmap`, `#mixmap`, `#gmap`) |
| 281–838 | `<script>`: eingebettete Daten + gesamte Logik |

Die drei SVGs sind im HTML leer und werden zur Laufzeit per JS befüllt (`buildCantonMap`, `buildMischMap`, `buildGemMap`). Es gibt **keine** externen Daten- oder Kartenquellen; alles ist eingebettet.

---

## 2. Datenstrukturen (alle im `<script>`)

### 2.1 Geometrien & Stammdaten (die „grossen" Blobs)

| Konstante | Zeile | Größe | Form | Schlüssel | Bedeutung |
|---|---|---|---|---|---|
| `COMMUNES` | 282 | 88 KB | `[[bfs,name,kt,oldkey,dw], …]` | – | Gemeinde-Stammliste, **2131** Einträge |
| `MAP` | 283 | 72 KB | `{viewBox, paths:{ZH:{d,cx,cy}, …}}` | **Kantonskürzel** | 26 Kanton-Polygone (Kantonskarte), viewBox `1000×633.3` |
| `KTNAME` | 284 | – | `{ZH:"Zürich", …}` | Kantonskürzel | Klarnamen aller 26 Kantone |
| `MMAP` | 285 | 265 KB | `{viewBox, paths:{ "1061":"M…Z", … }}` | **BFS-Nr.** | **2115** Gemeinde-Polygone (Gemeindekarte), viewBox `2000×1267` |
| `LAKES` | 286 | 44 KB | `{c:[…], g:[…]}` | – | Seen-Polygone, getrennt für Kanton-(`c`) und Gemeinde-Maßstab (`g`) |
| `CITIES` | 287 | 6 KB | `{ "230":{d}, … }` | **BFS-Nr.** | **8** Stadt-Polygone für die Mischansicht |
| `STARTS` | 288 | – | `[[1,"ZH"],[301,"BE"], …]` | – | BFS-Startnummer → Kanton (Fallback-Mapping) |
| `CANTON_ORDER` | 289 | – | `["ZH","BE", …]` | – | Reihenfolge/Vollständigkeit der 26 Kantone |

**Wichtig – Format `COMMUNES`:** `[bfs, name, kanton, oldkey, dwellings]`. Das 4. Feld (`oldkey`) ist bei fast allen Gemeinden `"base"`; nur 9 „Städte" tragen einen Spezialschlüssel `kom_*` (siehe Map-Match-Audit). Dieses Feld wird in der **aktuellen Logik nirgends verwendet** (Beleg unten).

### 2.2 Klassifikations-Stammdaten (Stufen, Tags)

| Konstante | Zeile | Bedeutung |
|---|---|---|
| `LVL` | 292 | Stufen 0–4: `{label, name, c (Farbe), t (Textfarbe)}` |
| `SUB3C` | 299 | Untertyp-Farben für Stufe 3 (`vorkauf`=gelb 3a, `bestand`/`both`=orange 3b) |
| `DLV` | 301 | „Ladder"-Definition (0,1,2,3a,3b,4) für Übersicht/Legende |
| `DESC`, `EXM` | 309, 317 | Beschreibungs- und Beispieltexte je Stufe |
| `TAGORDER`, `TAGNAME` | 325, 326 | Instrument-Tags (Foerderung, Quote, Bonus, Vorkauf, Bestand, Mietzins) |

### 2.3 Regel-Datensätze (das eigentliche Inhaltsmodell)

| Konstante | Zeile | Schlüssel | Anzahl | Rolle für die Karte |
|---|---|---|---|---|
| `CANTONAL` | 336 | Kantonskürzel | **10** (GE, VD, BS, ZH, GR, ZG, NE, NW, SZ, OW) | Kantonsweite Regimes; färben Kantonskarte; Gemeinden **erben nur bei `inheritable:true`** |
| `MUNI` | 393 | **BFS-Nr.** | **18** | Kommunale Eigeninstrumente; färben einzelne Gemeinden – **nur wenn `status==="in_kraft"`** |
| `PENDABG` | 481 | – (Array) | **12** | Pendent/abgelehnt/unklar – **nur Tabelle, nie Kartenfärbung** |
| `APPLIED` | 521 | `{bfs,name,note}` | **7** | VD-Gemeinden, die LPPPL aktiv anwenden (Doku; färben via Vererbung ohnehin) |
| `EXCLUDED` | 532 | – (Array) | **4** | Bewusst ausgeklammerte Sonderregeln (TI Airbnb, LU Airbnb, ZH Airbnb, Lex Weber) – **nur Methodik-Text** |
| `PROJEKT` | 571 | `{bfs,…}` | **1** | Projektbezogene Auflage (Brunnen Nord) – **nur Tabelle, Fläche bewusst nicht gefärbt** |
| `NELVAL` | 549 | `Set` von BFS | **10** | NE-Mangelgemeinden 2026, die das LVAL-Regime (Stufe 3b) anwenden |

**Felder eines Regelobjekts** (CANTONAL/MUNI): `level (0–4)`, `subtype (vorkauf|bestand|both|null)`, `tags[]`, `short`, `legal`, `status`, `url`, `source`, `scope (kantonal|kommunal|projektbezogen|national)`, optional `rentnote`, `inheritable`/`inheritance`, `notes`.

> **Wo liegt was?**
> – **Kantone:** `CANTON_ORDER`, `KTNAME`, `MAP.paths` (Geometrie), `CANTONAL` (Regeln).
> – **Gemeinden:** `COMMUNES` (Stamm), `MMAP.paths`/`CITIES` (Geometrie), `MUNI` (Regeln).
> – **Regeln/Stufen/Tags/Status/Quellen:** in den Regelobjekten (`level`, `tags`, `status`, `source`/`url`).
> – **Geometrien:** `MAP` (Kanton), `MMAP` (Gemeinde), `CITIES` (Städte Mischansicht), `LAKES` (Seen).

---

## 3. Wie wird die Farbe bestimmt?

Kette: **`classify(bfs)` → `colorOf(level, subtype)` → SVG-`fill`**.

### 3.1 `colorOf(level, sub)` (Z. 300)
Liefert `{c,t}`. Für `level===3` entscheidet der Untertyp: `vorkauf`→gelb (3a), `bestand`/`both`→orange (3b). Sonst die Stufenfarbe aus `LVL`.

### 3.2 `classify(bfs)` (Z. 550–558) — Herzstück der Gemeinde-Einfärbung
Reihenfolge (erste zutreffende gewinnt):
1. `MUNI[bfs]` vorhanden **und** `status==="in_kraft"` → kommunale Stufe (`inherited:false`).
2. sonst `CANTONAL[kt]` mit `level≥1` **und** `inheritable===true` **und** `status==="in_kraft"` → geerbte Kantonsstufe (`inherited:true`).
3. sonst `NELVAL.has(bfs)` **und** NE in Kraft → NE-LVAL-Stufe 3b (`inherited:true`).
4. sonst **Baseline** (Stufe 0).

### 3.3 `cantonLevel(kt)` (Z. 548) — Kantonskarte
`CANTONAL[kt].status==="in_kraft" ? level : 0`. **Hängt nicht von kommunalen Regeln ab** → eine Gemeinderegel kann den Kanton nicht einfärben.

### 3.4 Drei Karten, drei Färbe-Pfade
| Karte | Funktion | Färbung |
|---|---|---|
| Kantonskarte (`#cmap`) | `buildCantonMap` (627) | je Kanton `colorOf(cantonLevel(kt), CANTONAL[kt]?.subtype)` |
| Mischansicht (`#mixmap`) | `buildMischMap` (641) | Kanton-Basis = `cantonLevel`; darüber `CITIES` + `instrumentCommunes()` je `classify(bfs)` |
| Gemeindekarte (`#gmap`) | `buildGemMap` (661) | **jede** `MMAP.paths`-Gemeinde einzeln `classify(bfs)` |

---

## 4. Verbindung Karte ↔ Tabelle ↔ Filter ↔ Detailpanel

- **Detailpanel** (`renderDetail`, 607): zeigt einen „Display-Record". Für Kantone `cantonDisplayRecord(kt)` (basiert auf `CANTONAL`/Baseline), für Gemeinden `communeDisplayRecord(bfs)` (basiert auf **`classify(bfs)`**). → **Karte und Detailpanel nutzen exakt dieselbe Klassifikation.** ✔
- **Tabelle/Filter** (`AREAS`, 577–588): eine **regelzentrierte** Liste (48 Zeilen), zusammengesetzt aus 10 Kanton-Records + **allen** `MUNI` (roh, inkl. `unklar`) + `APPLIED` + `PENDABG` + `PROJEKT`. Gefiltert/ sortiert via `passes`/`applyFilters` (760–794). **Die Tabelle zeigt die nominelle Stufe der jeweiligen Regel inkl. Status – nicht die effektive `classify`-Stufe der Fläche.**
- **Init** (`init`, 823): baut alle drei Karten + Übersicht + Methodik + Legenden + Tabelle.

> **Kernpunkt:** Karte und Detailpanel sprechen „flächenzentriert" (`classify`). Tabelle/Filter sprechen „regelzentriert" (`AREAS`, Rohstufe + Status). Das ist beabsichtigt, erzeugt aber systematische Stufen-Differenzen für dieselbe BFS (siehe Map-Match-Audit, Check 4).

---

## 5. Hart codierte Annahmen

1. **`NELVAL`-Set** (Z. 549): 10 NE-BFS sind fest verdrahtet als LVAL-Mangelgemeinden 2026. Jede LVAL-Änderung muss hier von Hand nachgezogen werden.
2. **`CANTONAL`-Schlüsselmenge** (10 von 26): alle übrigen 16 Kantone fallen implizit auf Baseline. LU ist **bewusst nicht** enthalten.
3. **`STARTS`-Ranges** (Z. 288): Fallback-Kantonszuordnung über BFS-Bereiche; greift nur, wenn eine BFS nicht in `COMMUNES` steht (z. B. verwaiste Geometrien).
4. **`AREAS`-Kantonsliste** (Z. 578): nur diese 10 Kantone erzeugen eine Tabellenzeile; die übrigen 16 erscheinen in der Tabelle gar nicht (nur auf der Karte als Baseline).
5. **Status-Härtung als String** `"in_kraft"`: An ~4 Stellen identisch geprüft (`classify`, `cantonLevel`, `instrumentCommunes`, `muniCntByKt`). Ein Tippfehler/abweichender Status-String würde stillschweigend zu Baseline führen.
6. **Mischansicht-Skalierung `scale(0.5)`** (Z. 656): `MMAP` (2000-breit) wird in den Kanton-Maßstab (1000-breit) halbiert; `CITIES` sind bereits im 1000er-Raum. Diese Maßstabsannahme ist implizit.
7. **Luzern-Zeitpunkt:** `MUNI[1061].status="in_kraft"`, obwohl der `legal`-Text „in Kraft ab 09/2026" sagt (heute 2026-06-22). Die Stufe 3a wird also bereits vor dem genannten Inkrafttreten gefärbt (siehe Map-Match-Audit).
8. **Gemeindestand/Vintage:** `COMMUNES`, `MMAP`/`CITIES` und `NELVAL` stammen offenbar aus unterschiedlichen Gemeindeständen (Fusions-/Vintage-Konflikte, siehe Map-Match-Audit).

---

## 6. Risikobereiche für falsche Matches / falsche Einfärbung

| # | Risiko | Schweregrad | Beleg |
|---|---|---|---|
| R1 | **Gefärbte Gemeinde ohne Geometrie** → unsichtbar (Hauterive NE 6454, Stufe 3b) | hoch | Harness Check 2a |
| R2 | **Verwaiste Geometrien** ohne Datensatz (2239 FR, 5395 TI, 6513 NE) → Phantom-Polygone | mittel | Check 3 |
| R3 | **19 Gemeinden ohne Geometrie** → weiße Lücken in der Gemeindekarte | niedrig (alle Baseline außer R1) | Check 3 |
| R4 | **Kantonskarte ≠ Gemeindekarte** für nicht-vererbbare Förder-Kantone (GR, NW, ZG: Kanton grün, Gemeinden grau) | mittel (Verständnis) | Check 7/8 |
| R5 | **Tabelle ≠ Karte** je BFS (Rohstufe vs. effektiv), inkl. doppelter Luzern-Zeile (St4 pendent) | mittel (Verständnis) | Check 4 |
| R6 | **Status-String-Härtung**: stille Baseline bei abweichendem Status | latent | Code Z. 548/553/555 |
| R7 | **`oldkey`/`kom_*` Legacy-Feld** ungenutzt, aber als Falle vorhanden, falls je wieder name-/key-basiert gematcht wird | latent | Beleg unten |
| R8 | **Luzern-Zeitpunkt** (in_kraft vs. „ab 09/2026") | Datenfrage | Check 6/Luzern |

### Beleg: `oldkey`/`kom_*` ist ungenutzt
Das Wort `oldkey` kommt nur im Kommentar (Z. 545) vor. Die beiden `[3]`-Indexzugriffe (Z. 719, 809) betreffen Legenden-/Tabellen-Arrays, nicht `COMMUNES`. `classify` liest aus `COMMUNES` nur `c[0]` (bfs), `c[2]` (kt), `c[4]` (dw) — **nie `c[3]`**. Das Matching läuft durchgehend über die **BFS-Nummer**.

---

## 7. Gesamtbild

Die **Architektur ist sauber und konsistent verdrahtet**: ein einziger Klassifikator (`classify`) speist Gemeindekarte, Mischansicht und Detailpanel; die Kantonskarte nutzt den davon entkoppelten `cantonLevel`. Pendent/abgelehnt/ausgeklammert sind logisch korrekt von der Färbung getrennt. Die realen Probleme liegen **nicht** in der Färbelogik, sondern in **Geometrie-Datenqualität/-Vintage** (R1–R3) und in **zwei bewussten, aber missverständlichen Semantik-Brüchen** (R4 Kanton- vs. Gemeindekarte, R5 Tabelle vs. Karte). Details und Beweise im `MAP_MATCH_AUDIT.md`.
