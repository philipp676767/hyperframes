# Fortschritt: Titanic: Warum das unsinkbare Schiff wirklich sank

Stand für einen neuen Chat (Skill `youtube-erklaervideo`, Schritt „Weitermachen“).
Status je Kapitel: geplant → skript → stimme → szene → geprüft → gerendert.

| Nr  | Ordner | Kapitel | Wörter | Sprechzeit | Status | Notiz |
| --- | ------ | ------- | ------ | ---------- | ------ | ----- |

## Video

- [x] Titel + 3 Thumbnail-Ideen (plan.md)
- [ ] Hauptwelt (welt.js) geprüft
- [ ] Alle Kapitel gerendert
- [ ] Zusammengefügt + Lautheit (-14 LUFS)
- [ ] 3 Thumbnails
- [ ] Beschreibung mit Kapitel-Zeitmarken, Tags, Einstellungen, Kommentar (upload.txt)
- [ ] youtube/serie.md eingetragen

## Notizen

- ElevenLabs: Flow yQ8DZfkE7Q1UwZCTQnJ4 (Gratis-Konto). Lange Stücke (> ~200 Zeichen) und mehrere gleichzeitig werden abgelehnt; seit 2026-11-17 ~17:30 ist das Gratis-Konto ganz gesperrt („Free Tier access has been disabled“) → bezahltes Abo oder API-Key nötig für Kap. 3 (Rest) bis 9.
- Stimme stückweise: `assets/vo_takes/parts/pNN.mp3` (Zahlen ausgeschrieben im Prompt), O-Töne roh in `assets/vo_takes/raw/`, gefiltert mit `radio.sh` (Hook: funk, Kap. 2: telefon). Archivstimme: „Volker – Professionelle warm Voice“ `76ZsWRKclBS6MNPWxaLc`.
- Eigene Sounds: `youtube/titanic/sfx-extra.py` → in jedes Kapitel `scripts/sfx-extra.py` kopieren (glocke, morse, meer, maschine, kratzen, bruch, rakete, wind, tauchen).
- welt.js: 1 Einheit = 10 m, Bug +x. buildNight / buildShipyard / buildRadioRoom (RADIO = y 300) / buildDawn / buildDeep / makeDeepVignette (DEEP = y −320); makeTitanic({xray}) mit bow/stern (Bruch bei BREAK_X), setWater, shipLights.
