# WP-Referenzinstrumente (Recherche-Definitionen)

**Stand:** 2026-06-22 · **Status:** Such-/Erfassungshilfe. **Keine** finale Taxonomie.

Die 22 Wüest-Partner-Logiken sind eine **Suchmatrix**, kein Klassifikationsraster. Jeder reale Befund wird über die **exklusive Taxonomie 1–10** (`INSTRUMENT_TAXONOMY.md`) eingestuft; die WP-Nummer(n) wandern dokumentarisch in `wp_reference_logic`. Findet Basel-Stadt (oder ein anderes Gebiet) ein Instrument **ausserhalb** dieser 22, wird es **trotzdem** erfasst und exklusiv eingeordnet.

**Karten-Relevanz** unten ist nur die *typische* Erwartung. Maßgeblich bleibt pro Instrument: `map_relevant` = nur bei `status=in_force` **und** verbindlicher Wirkung (siehe `DATA_MODEL.md`). „eher nein" heißt: oft nur ermächtigend/fördernd/freiwillig → selten standard-farbbestimmend.

Legende Kategorie-IDs: 2 Angebotsausweitung · 3 Angebotssteuerung preisgünstig · 4 öff./gemeinnützige Produktion · 5 Transaktion/Eigentum · 7 Wohnschutz m. Mietzinskontrolle · 8 Nutzungssteuerung · 9 Nachfrageförderung.

---

### WP 1 · Ausnützungsziffer erhöhen
- **Definition:** Höhere zulässige Dichte/Ausnützung (AZ/Geschossfläche) zur Angebotsausweitung.
- **Typische Rechtsform:** BZO/Nutzungsplan, Zonenreglement, Gestaltungsplan.
- **Kandidat-Kategorie:** **2**.
- **Suchen nach:** „Ausnützungsziffer", „Ausnützungsbonus", „Geschossflächenziffer", „Verdichtung", „Aufzonung".
- **Zählt NICHT als:** Bonus *gegen* Kostenmiete-Auflage (→ WP 2 / Kat. 3); reine Einzonung (→ WP 5).
- **Karten-relevant:** eher nein (ermöglichend).

### WP 2 · Ausnützungsziffer erhöhen, falls Anteil Kostenmiete
- **Definition:** Dichtebonus **bedingt** an einen preisgünstigen/Kostenmiete-Anteil.
- **Typische Rechtsform:** BZO/Sondernutzungsplan mit Auflage, Reglement preisgünstiger Wohnraum.
- **Kandidat-Kategorie:** **3**.
- **Suchen nach:** „Bonus … preisgünstig/Kostenmiete", „Mehrausnützung gegen Anteil", „§49b-artige Auflage".
- **Zählt NICHT als:** bedingungsloser Bonus (→ WP 1); reine Förderung ohne Planauflage (→ Kat. 4).
- **Karten-relevant:** ja, wenn verbindliche Auflage in Kraft.

### WP 3 · Baubewilligungsverfahren verkürzen
- **Definition:** Schnellere/vereinfachte Bewilligung.
- **Typische Rechtsform:** Baugesetz/Verfahrensrecht, Fristenregelung, digitales Verfahren.
- **Kandidat-Kategorie:** **2**.
- **Suchen nach:** „Verfahrensbeschleunigung", „Bewilligungsfristen", „vereinfachtes Verfahren".
- **Zählt NICHT als:** Einsprache-Einschränkung (→ WP 6).
- **Karten-relevant:** eher nein (prozessuale Erleichterung).

### WP 4 · Bauen im Bestand erleichtern
- **Definition:** Erleichterungen für Um-/Aufbau, Ausbau im Bestand.
- **Typische Rechtsform:** Bau-/Zonenrecht, Bestandesregeln, Aufstockungsregeln.
- **Kandidat-Kategorie:** **2**.
- **Suchen nach:** „Bestandesgarantie", „Aufstockung", „Dachausbau", „Erleichterung Umbau".
- **Zählt NICHT als:** Bestandes**schutz** gegen Abbruch (→ Kat. 6, gegenteilige Stossrichtung).
- **Karten-relevant:** eher nein.

### WP 5 · Bauland einzonen
- **Definition:** Neue Bauzonen schaffen (Angebotsausweitung).
- **Typische Rechtsform:** Richt-/Nutzungsplan, Einzonungsbeschluss.
- **Kandidat-Kategorie:** **2**.
- **Suchen nach:** „Einzonung", „Bauzonenerweiterung", „Richtplananpassung".
- **Zählt NICHT als:** Einzonung **mit** preisgünstig-Auflage (→ Kat. 3).
- **Karten-relevant:** eher nein.

### WP 6 · Einsprachemöglichkeiten einschränken
- **Definition:** Beschränkung von Einsprache-/Beschwerderechten.
- **Typische Rechtsform:** Bau-/Verfahrens-/Verbandsbeschwerderecht.
- **Kandidat-Kategorie:** **2**.
- **Suchen nach:** „Einsprache", „Beschwerdelegitimation", „Verbandsbeschwerderecht".
- **Zählt NICHT als:** allgemeine Verfahrensbeschleunigung (→ WP 3).
- **Karten-relevant:** eher nein.

### WP 7 · Gemeinnützigen Wohnraum fördern, Anlagekosten verringern
- **Definition:** Förderung über tiefere Anlagekosten (Land, Baurecht, Darlehen, Beiträge).
- **Typische Rechtsform:** Wohnraumförderungsgesetz, Baurechtsverträge, Fonds.
- **Kandidat-Kategorie:** **4**.
- **Suchen nach:** „Baurecht", „zinsgünstige Darlehen", „à-fonds-perdu", „Wohnbaufonds", „aktive Bodenpolitik".
- **Zählt NICHT als:** personenbezogene Subjekthilfe (→ WP 15/Kat. 9).
- **Karten-relevant:** eher nein (Förderung, selten bindende Flächenwirkung); ja bei verbindlicher Zonenbindung.

### WP 8 · Gemeinnützigen Wohnraum fördern, Anteil Kostenmiete
- **Definition:** Förderung mit Kostenmiete-Bindung der geförderten Objekte.
- **Typische Rechtsform:** Förderreglement, Sonderzone Kostenmiete.
- **Kandidat-Kategorie:** **4** *(als Planungsauflage an Private → 3)*.
- **Suchen nach:** „Kostenmiete", „gemeinnützig", „Belegungsvorschriften", „Sonderzone".
- **Zählt NICHT als:** marktweiter Mietzinsdeckel (→ Kat. 7).
- **Karten-relevant:** ja, wenn als verbindliche Zonen-/Planauflage in Kraft.

### WP 9 · Gemeinnützigen Wohnraum fördern, kantonale Regelung
- **Definition:** Kantonaler Förderrahmen für gemeinnützigen Wohnbau.
- **Typische Rechtsform:** Kantonales WFG/WBFG.
- **Kandidat-Kategorie:** **4**.
- **Suchen nach:** „kantonales Wohnraumförderungsgesetz", „Förderprogramm", „Beiträge an Träger".
- **Zählt NICHT als:** kommunaler Bau (→ WP 10); reine Absichtserklärung (→ status pending/planned).
- **Karten-relevant:** eher nein auf Gemeindeebene, **außer** Gemeinden wenden es aktiv an (Relation `applied`/`activated`).

### WP 10 · Gemeinnützigen Wohnraum fördern, staatlicher Bau
- **Definition:** Öffentliche Hand baut/besitzt Wohnraum selbst (Wohnbauträger, Stiftung).
- **Typische Rechtsform:** Gründungsbeschluss Wohnbauträger/Stiftung, Bodenpolitik.
- **Kandidat-Kategorie:** **4**.
- **Suchen nach:** „kommunale/kantonale Wohnbaugesellschaft", „Stiftung … Wohnraum", „Liegenschaftsstrategie".
- **Zählt NICHT als:** Auflage an Private (→ Kat. 3).
- **Karten-relevant:** eher nein (Produktion, keine Gebietsbindung); dokumentarisch erfassen.

### WP 11 · Kurzzeitvermietungen einschränken
- **Definition:** Begrenzung von Airbnb/Kurzzeitvermietung (z. B. 90-Tage-Regel).
- **Typische Rechtsform:** Zweckänderungs-/Nutzungsvorschrift, kommunales Reglement.
- **Kandidat-Kategorie:** **8**.
- **Suchen nach:** „Kurzzeitvermietung", „Airbnb", „90 Tage", „Zweckentfremdung touristisch".
- **Zählt NICHT als:** Bestandesschutz gegen Abbruch (→ Kat. 6); nicht automatisch „stärkerer Wohnschutz".
- **Karten-relevant:** ja, wenn bindend in Kraft — aber **eigene** Kategorie (8), nicht hochstufen.

### WP 12 · Lex Koller verschärfen
- **Definition:** Strengere Beschränkung des Erwerbs durch Personen im Ausland.
- **Typische Rechtsform:** Bundesgesetz (BewG/Lex Koller) bzw. Verschärfungsvorlage.
- **Kandidat-Kategorie:** **5**.
- **Suchen nach:** „Lex Koller", „Erwerb durch Personen im Ausland", „Bewilligungspflicht Erwerb".
- **Zählt NICHT als:** kommunales Vorkaufsrecht (→ WP 17).
- **Karten-relevant:** meist Bund (`federal`), nicht gebietsfärbend; dokumentieren.

### WP 13 · Mietpreisdeckel
- **Definition:** Behördliche Begrenzung/Kontrolle der Mietzinse (Bestand/nach Sanierung).
- **Typische Rechtsform:** Wohnraumschutzgesetz/-verordnung mit Mietzinskontrolle.
- **Kandidat-Kategorie:** **7**.
- **Suchen nach:** „Mietzinskontrolle", „Mietzinsdeckel", „max. Aufschlag nach Sanierung", „Mietzinsprüfung".
- **Zählt NICHT als:** OR-Mietrecht (Bundesstandard, kein Sonderinstrument); reiner Abbruchschutz (→ Kat. 6).
- **Karten-relevant:** **ja** (stärkster Bestandseingriff), wenn in Kraft.

### WP 14 · Renditeverbot
- **Definition:** Begrenzung zulässiger Rendite/Gewinne aus Vermietung.
- **Typische Rechtsform:** Wohnschutz-/Mietzinsrecht, Renditebeschränkung.
- **Kandidat-Kategorie:** **7**.
- **Suchen nach:** „Renditebeschränkung", „zulässige Rendite", „Überrendite".
- **Zählt NICHT als:** reine Förderbedingung (Kostenmiete in geförderten Objekten → Kat. 4).
- **Karten-relevant:** ja, wenn in Kraft.

### WP 15 · Subjektförderung bezüglich Wohnkosten
- **Definition:** Personenbezogene Beiträge an Wohnkosten/Miete.
- **Typische Rechtsform:** Subjekthilfe-Reglement, Mietbeiträge.
- **Kandidat-Kategorie:** **9**.
- **Suchen nach:** „Mietzinsbeitrag", „Subjekthilfe", „Wohnkostenzuschuss".
- **Zählt NICHT als:** Objektförderung (→ Kat. 4).
- **Karten-relevant:** eher nein.

### WP 16 · Umzüge fördern, Belegung optimieren
- **Definition:** Anreize/Regeln zur besseren Belegung (Unterbelegung reduzieren).
- **Typische Rechtsform:** Belegungsvorschriften (v. a. in gemeinnützigem Bestand), Umzugsförderung.
- **Kandidat-Kategorie:** **8**.
- **Suchen nach:** „Belegungsvorschrift", „Mindestbelegung", „Umzugsprämie", „Unterbelegung".
- **Zählt NICHT als:** allgemeine Förderung (→ Kat. 4/9).
- **Karten-relevant:** eher nein.

### WP 17 · Vorkaufsrecht Gemeinden gewähren
- **Definition:** Gemeinden/Kanton erhalten ein wohnpolitisches Vorkaufs-/Kaufsrecht.
- **Typische Rechtsform:** Kantonsgesetz (Ermächtigung) + kommunales Reglement (Aktivierung).
- **Kandidat-Kategorie:** **5**.
- **Suchen nach:** „Vorkaufsrecht", „Kaufrecht", „Eintrittsrecht", „droit de préemption", „LPPPL".
- **Zählt NICHT als:** Mietzinskontrolle (→ Kat. 7); Lex Koller (→ WP 12).
- **Karten-relevant:** ja, **wo aktiv eingeführt/angewandt** (Relation `activated`/`applied`), nicht bei bloßer Ermächtigung.

### WP 18 · Weniger Bauvorschriften bezüglich Lärm
- **Definition:** Gelockerte Lärmschutz-Anforderungen zur Baufreigabe.
- **Typische Rechtsform:** USG/LSV-Vollzug, kantonale Praxis, Lüftungsfensterpraxis.
- **Kandidat-Kategorie:** **2**.
- **Suchen nach:** „Lärmschutz Ausnahme", „Lüftungsfenster", „Art. 31 LSV".
- **Zählt NICHT als:** ESG-Lockerung (→ WP 19).
- **Karten-relevant:** nein.

### WP 19 · Weniger Bauvorschriften bezüglich ESG
- **Definition:** Gelockerte energetische/ökologische Bauauflagen.
- **Typische Rechtsform:** Energie-/Baugesetz, MuKEn-Vollzug.
- **Kandidat-Kategorie:** **2**.
- **Suchen nach:** „energetische Vorschriften", „MuKEn", „Sanierungspflicht", „ESG-Auflagen".
- **Zählt NICHT als:** Lärm (→ WP 18).
- **Karten-relevant:** nein.

### WP 20 · Wohneigentum fördern, Bürgschaften für Junge
- **Definition:** Erwerbsförderung über Bürgschaften/Garantien.
- **Typische Rechtsform:** Förder-/Bürgschaftsreglement.
- **Kandidat-Kategorie:** **9**.
- **Suchen nach:** „Bürgschaft Wohneigentum", „Ersterwerb", „Eigentumsförderung".
- **Zählt NICHT als:** Mietwohnungsförderung (→ Kat. 4).
- **Karten-relevant:** nein.

### WP 21 · Wohneigentum fördern, Eigentumsanteil bei Neubauten
- **Definition:** Vorgabe/Anreiz für einen Wohneigentumsanteil im Neubau.
- **Typische Rechtsform:** Planauflage/Reglement.
- **Kandidat-Kategorie:** **9** *(als verbindliche Planauflage ggf. 3-analog → needs_taxonomy_review)*.
- **Suchen nach:** „Eigentumsquote Neubau", „Wohneigentumsanteil".
- **Zählt NICHT als:** preisgünstig-Mietquote (→ Kat. 3).
- **Karten-relevant:** selten; nur bei verbindlicher Auflage.

### WP 22 · Wohnungsgrössen in Gestaltungsplänen limitieren
- **Definition:** Vorgaben zu Wohnungsgrössen/-mix in Plänen.
- **Typische Rechtsform:** Gestaltungs-/Sondernutzungsplan, Reglement Wohnungsmix.
- **Kandidat-Kategorie:** **8**.
- **Suchen nach:** „Wohnungsmix", „Mindest-/Maximalgrösse", „Wohnungsgrössen Gestaltungsplan".
- **Zählt NICHT als:** preisgünstig-Quote (→ Kat. 3).
- **Karten-relevant:** selten; nur bei verbindlicher Auflage.

---

## Anwendung auf den Pilot
Bei Basel-Stadt dienen v. a. WP 11, 13, 17 als Suchanker (Kurzzeitvermietung, Mietzinskontrolle, Vorkauf), ergänzt um **nicht** in der WP-Liste stehende Instrumente (z. B. Abbruch-/Umbau-Bewilligungspflicht → Kat. 6, Wohnschutzkommission → Kat. 10). Erfassung immer exklusiv (eine Kategorie je Instrument); Mehrfachwirkung ⇒ mehrere Instrumente.
