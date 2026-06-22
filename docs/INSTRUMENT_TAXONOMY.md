# Exklusive Instrument-Taxonomie

**Stand:** 2026-06-22 · **Status:** verbindlich für `exclusive_category_id` im Datenmodell.

**Regel:** Ein Instrument erhält **genau eine** Kategorie. Passt es nicht eindeutig, wird `needs_taxonomy_review = true` gesetzt und **nicht** erzwungen. Ein Territorium mit mehreren Wirkungen wird in **mehrere Instrumente** zerlegt (je Instrument eine Kategorie).

## Die 10 Kategorien

| ID | Name (DE) | Name (EN) | Umfasst (Beispiele) | Wirkungs-Flags (typisch) |
|---|---|---|---|---|
| **1** | Keine zusätzliche Sonderregelung | No additional special regulation | Nur Bundesrecht + ordentliches Bau-, Miet-, Raumplanungsrecht, ohne kantonale/kommunale Sonderregel | – |
| **2** | Angebotsausweitung über Bau-/Planungsrecht | Supply expansion through planning/building law | Um-/Auf-/Einzonung, höhere Ausnützung, Bauen im Bestand erleichtern, weniger Bauvorschriften, schnellere Bewilligung, eingeschränkte Einsprachen | `supply_expansion` |
| **3** | Angebotssteuerung auf preisgünstigen Wohnraum | Supply steering toward affordable housing | Quoten preisgünstig/Kostenmiete, Planungsauflagen, Ausnützungsbonus gegen preisgünstig, Mindestanteile in Plänen/Reglementen | `supply_expansion` |
| **4** | Direkte öffentliche/gemeinnützige Wohnraumproduktion | Direct public/non-profit housing production | Öffentlicher Bau, kommunale/kantonale Wohnbauträger, Stiftungen, Fonds, Bodenpolitik, Baurecht, Darlehen, Genossenschaftsförderung | `supply_expansion` |
| **5** | Transaktions-/Eigentumseingriffe | Transaction & ownership interventions | Vorkaufs-/Kaufs-/Eintrittsrecht, Lex-Koller-artige Beschränkungen, Verkaufs-/Erwerbsbeschränkungen, Stockwerkeigentums-Umwandlung, Transaktionsbewilligung | `transaction_control`, `ownership_control` |
| **6** | Bestandesschutz ohne Mietzinskontrolle | Stock protection without rent control | Abbruchbewilligung/-verbot, Umnutzungs-/Zweckänderungsschutz, Erhaltung Mietwohnraum, Rückkehrrecht – **ohne** behördliche Mietzinskontrolle | `stock_protection` |
| **7** | Wohnschutz mit Mietzins-/Renditekontrolle | Housing protection with rent/yield control | Mietzinsdeckel, max. Aufschläge nach Sanierung, behördliche Mietzinsprüfung, Renditebeschränkung, Kostenmiete auf Bestand, Mietzinskommissionen | `rent_control` (+ oft `stock_protection`) |
| **8** | Nutzungssteuerung des Bestands | Use steering of existing housing | Kurzzeitvermietung/Airbnb, Zweitwohnungen, Belegungsoptimierung, Mindestbelegung, Wohnungsgrössen-Beschränkung, Beschränkung spezifischer Wohnnutzungen | `use_control` |
| **9** | Nachfrageseitige Unterstützung | Demand-side support | Subjektsubventionen, Wohnkostenbeiträge, Mietbeiträge, Bürgschaften, Starthilfen, Wohneigentumsförderung – **personen-** statt objektbezogen | `demand_support` |
| **10** | Verfahrens- & Vollzugsinstrumente | Procedural & enforcement instruments | Bewilligungs-/Meldepflichten, Kontrollstellen, Wohnschutzkommissionen, Sanktionen, Dokumentationspflichten, Monitoring/Vollzug | `enforcement_process` |

> Die Wirkungs-Flags sind **zusätzliche** boolesche Merkmale (Datenmodell), nicht die Kategorie selbst. Ein Instrument der Kategorie 7 hat z. B. typischerweise `rent_control=true`, evtl. auch `stock_protection=true` — bleibt aber **eine** Kategorie (7).

## Abgrenzungs-Heuristiken

- **6 vs. 7:** Entscheidend ist die **behördliche Mietzins-/Renditekontrolle**. Abbruch-/Umnutzungsschutz allein = **6**; sobald Mieten/Renditen behördlich gedeckelt/geprüft werden = **7**.
- **3 vs. 4:** **3** = *Auflage* an Private bei Planung (Quote/Bonus); **4** = aktive *Produktion/Förderung* durch die öffentliche Hand/Gemeinnützige (Bau, Land, Fonds, Darlehen).
- **5 vs. 7:** Vorkaufs-/Eigentumseingriff = **5** (Transaktion); Mietzinskontrolle = **7**. Eine Gemeinde kann beides haben → zwei Instrumente.
- **8 (Airbnb/Zweitwohnung):** in der Regel **Nutzungssteuerung (8)**, **nicht** automatisch stärkerer Wohnschutz. Nicht mit 6/7 verwechseln.
- **9 vs. 4:** **9** personenbezogen (Subjekthilfe); **4** objekt-/trägerbezogen.
- **10:** rein prozessual (Kommission, Bewilligungs-/Kontrollapparat) **ohne** eigene materielle Schutzwirkung; die materielle Regel wird separat als 5/6/7/8 erfasst.

## Beispiele (mehrere Instrumente je Territorium)

**Basel-Stadt** (drei Instrumente):
- Abbruch-/Sanierungs-Bewilligungspflicht → **Kategorie 6** (`stock_protection`)
- Mietzinskontrolle → **Kategorie 7** (`rent_control`)
- Wohnschutzkommission → **Kategorie 10** (`enforcement_process`)

**Luzern (Stadt)** (zwei Instrumente):
- Aktive Bodenpolitik / Stiftung / Darlehen → **Kategorie 4** (`supply_expansion`)
- Kommunales Vorkaufsrecht → **Kategorie 5** (`transaction_control`)
- *(Airbnb-90-Tage-Regel wäre, falls erfasst, **Kategorie 8** — nicht stärker werten.)*

**Bund:**
- Zweitwohnungsgesetz / Lex Weber → **Kategorie 8** (`use_control`)
- Lex Koller → **Kategorie 5** (`ownership_control`)

## Zuordnungs-Disziplin

- Niemals zwei Kategorien pro Instrument. Mehr Wirkung ⇒ mehr Instrumente.
- Kein Forcieren: lieber `needs_taxonomy_review=true` + Begründung in `notes`.
- Die Kategorie ist **nicht** automatisch eine Rangordnung/Stufe. Eine spätere smzh-Zusammenfassung kann Kategorien gewichten — das ist ein **separater** Ableitungsschritt (siehe `DATA_MODEL.md`), **kein** Umbau in 0–4.
