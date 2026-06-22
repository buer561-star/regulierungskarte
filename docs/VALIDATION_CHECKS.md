# Validierungschecks (Vorschlag) · Regulierungs-Kataster

**Zweck:** automatisch prüfbar machen, ob Karte und Daten sauber zusammenpassen.
**Status:** vorbereitet, **nicht produktiv eingebunden**. Lauffähige Referenz-Implementierung: `research/validate.mjs` (read-only; liest die gesicherte Legacy-HTML, verändert nichts).

```bash
node research/validate.mjs        # druckt Report, schreibt research/validate-output.txt + validate-results.json
```

Die Harness ist bewusst von der Produktivdatei entkoppelt: Sie extrahiert Daten + reine Logik (Zeilen 282–835 des `<script>`) und wertet sie ohne DOM aus. Wenn das Tool später nach `src/` modularisiert wird, sollten die Checks gegen die ausgelagerten Datenmodule laufen (dann ohne HTML-Slicing).

---

## Geforderte Checks → Umsetzung & aktueller Befund

| # | Geforderter Check | Harness | Aktueller Befund |
|---|---|---|---|
| C1 | Jede Gemeinde im Regeldatensatz hat eine BFS-Nummer | Check 1 | ✅ bestanden (alle `MUNI`-Keys numerisch) |
| C2 | Jede Gemeinde im Regeldatensatz existiert in der Gemeindeliste | Check 1 | ✅ bestanden (alle Regel-BFS in `COMMUNES`) |
| C3 | Jede farbige Gemeinde hat eine Geometrie | Check 2 | ❌ **1 Verstoß: Hauterive (NE 6454), St3b, ohne Geometrie** |
| C4 | Jede Geometrie ist eindeutig einer BFS zugeordnet | Check 3 | ❌ **3 verwaiste Geometrien (2239, 5395, 6513)** |
| C5 | Karte und Tabelle zeigen für dieselbe BFS dieselbe Stufe | Check 4 | ⚠ 8 Differenzen — **alle durch Status/Scope erklärbar**, kein Färbe-Bug; Semantik dokumentieren |
| C6 | Pendent/abgelehnt/unklar bestimmen nie die Hauptfarbe | Check 5 | ✅ bestanden (0 Verstöße) |
| C7 | Ausgeschlossene Kategorien bestimmen nie die Hauptfarbe | Check 6 | ✅ bestanden (TI 0 gefärbt; LU = Vorkauf) |
| C8 | Kommunale Regeln färben nie den ganzen Kanton | Check 7 | ✅ bestanden (LU 1/80; nur vererbbare Kantone vollflächig) |
| C9 | Kantonale Regeln färben Gemeinden nur, wenn vererbbar/aktiv angewandt | Check 8 | ✅ bestanden (NELVAL ist gewollter Sonderpfad, kein Verstoß) |

---

## Detail je Check (Definition, Soll, Datenquelle)

**C1 — BFS-Pflicht.** Für jeden `MUNI`-Key gilt: `Number.isFinite(+key)`. Soll: keine Ausnahme.

**C2 — Referenzielle Integrität Regel→Stamm.** Jede in `MUNI`/`PENDABG.bfs`/`APPLIED.bfs`/`NELVAL`/`PROJEKT.bfs` referenzierte BFS muss in `commByBfs` existieren. Soll: leere Fehlerliste.

**C3 — Farbe braucht Geometrie.** Für jede Gemeinde mit `classify(bfs).level ≥ 1` muss `MMAP.paths[bfs]` existieren (für die Mischansicht zusätzlich `CITIES[bfs]` **oder** `MMAP.paths[bfs]`). **Aktuell verletzt durch Hauterive (6454).**

**C4 — Geometrie braucht Datensatz.** Jeder `MMAP.paths`-Key muss in `commByBfs` existieren; jeder `CITIES`-Key zusätzlich in `MMAP`. **Aktuell verletzt durch 2239/5395/6513.** (Zusätzlich ausgewiesen: 19 Gemeinden ganz ohne Geometrie — Abdeckungsmetrik.)

**C5 — Karte ↔ Tabelle.** Pro `AREAS`-Municipality-Zeile: `row.level === classify(row.bfs).level`. Da die Tabelle bewusst regelzentriert ist, ist die **operationalisierbare** Soll-Regel:
> Differenz ist nur erlaubt, wenn `row.status !== "in_kraft"` **oder** `row.scope === "projektbezogen"`.
Jede Differenz mit `status==="in_kraft"` **und** `scope!=="projektbezogen"` ist ein echter Bug. Aktuell: 0 solcher Fälle (Brunnen Nord ist projektbezogen).

**C6 — Status-Gate.** Für jede gefärbte Gemeinde muss die färbende Regel `status==="in_kraft"` haben. Soll: 0 gefärbte Gemeinden mit anderem Status.

**C7 — Ausschluss-Gate.** `EXCLUDED` darf in `classify` nicht referenziert werden; Belegtest: alle TI-Gemeinden `level===0`; `classify(1061).subtype==="vorkauf"`.

**C8 — Kein Kanton-Bleed.** `cantonLevel(kt)` darf nicht von `MUNI` abhängen; Anzahl gefärbter Gemeinden je nicht-vererbbarem Kanton < Gesamtzahl. Soll: kein Kanton ohne `inheritable`-Regel ist vollflächig gefärbt.

**C9 — Vererbung nur wenn erlaubt.** Für `CANTONAL[kt].inheritable===false` darf keine Gemeinde mit `classify(bfs).inherited===true` gefärbt sein — **Ausnahme: dokumentierter `NELVAL`-Pfad für NE.** Der generische Check sollte den NELVAL-Set als Whitelist führen (sonst Falsch-Positiv, wie aktuell für NE).

---

## Empfohlene Ergänzungs-Checks (über die 9 hinaus)

- **C10 — Vintage-Konsistenz:** `COMMUNES`, `MMAP`, `CITIES`, `NELVAL` sollten denselben offiziellen Gemeindestand (BFS-Stichtag) referenzieren; Report über symmetrische Differenz der BFS-Mengen (deckt die NE-/TI-Fusionsversätze auf).
- **C11 — Zeitliche Status-Plausibilität:** Wenn `legal`/`short` ein künftiges Inkrafttreten nennt („in Kraft ab …", Datum > heute), sollte `status` nicht ungeprüft `in_kraft` sein (deckt den Luzern-Fall R8 auf).
- **C12 — CITIES-Vollständigkeit:** Jede `kom_*`-Stadt sollte konsistent behandelt werden (entweder `CITIES`-Geometrie **oder** bewusst über `instrumentCommunes`); aktuell fehlt Neuenburg (6458) in `CITIES`.
- **C13 — Kantons-/Gemeindekarten-Kohärenz:** Report der Kantone, bei denen Kantonskarte gefärbt, Gemeindekarte aber leer ist (GR, NW), damit die Divergenz bewusst kommuniziert wird.
