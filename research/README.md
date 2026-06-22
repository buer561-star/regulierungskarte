# research/ — Audit-Werkzeuge & Beweis-Artefakte

Read-only Hilfsmittel für den Erst-Audit. Verändert **keine** Produktivdaten.

- `validate.mjs` — Validierungs-Harness. Lädt Daten + reine Logik direkt aus
  `legacy/regulierungs-kataster-original.html` und prüft Konsistenz von Karte,
  Tabelle, Klassifikation und Geometrien. Start: `node research/validate.mjs`
- `validate-output.txt` — lesbarer Report des letzten Laufs
- `validate-results.json` — maschinenlesbare Ergebnisse des letzten Laufs

Inhaltlicher Research (Quellenrecherche zu einzelnen Gemeinden/Kantonen) ist hier
**noch nicht** abgelegt — in diesem Schritt wurde bewusst nicht recherchiert.
