# Fortschritt: Titanic: Warum das unsinkbare Schiff wirklich sank

Stand für einen neuen Chat (Skill `youtube-erklaervideo`, Schritt „Weitermachen“).
Status je Kapitel: geplant → skript → stimme → szene → geprüft → gerendert.

| Nr  | Ordner       | Kapitel                    | Wörter | Sprechzeit | Status           | Notiz                                           |
| --- | ------------ | -------------------------- | ------ | ---------- | ---------------- | ----------------------------------------------- |
| 0   | 00-hook      | Eisberg voraus             | 166    | 66,8 s     | gerendert        | O-Töne Volker (radio funk)                      |
| 1   | 01-schiff    | Das größte Schiff der Welt | 175    | 70,5 s     | geprüft, rendert | Werft Belfast, Fußballfelder, Schüssel, Röntgen |
| 2   | 02-warnungen | Sechs Warnungen            | 182    | 73,3 s     | geprüft, Queue   | Funkraum, Uhr 23:30, Californian                |
| 3   | 03-eisberg   | 37 Sekunden                | 189    | 75,9 s     | geprüft, Queue   |                                                 |
| 4   | 04-schotten  | Das Eiswürfel-Problem      | 188    | 75,5 s     | geprüft, Queue   |                                                 |
| 5   | 05-boote     | Halb leere Boote           | 192    | 77,1 s     | geprüft, Queue   | O-Ton p03 = Hook raw/p02                        |
| 6   | 06-bruch     | Das Schiff bricht          | 202    | 81,1 s     | geprüft          |                                                 |
| 7   | 07-carpathia | Die Rettung                | 156    | –          | skript           |                                                 |
| 8   | 08-wrack     | 3.800 Meter tief           | 165    | –          | skript           |                                                 |
| 9   | 09-finale    | Warum sie wirklich sank    | 155    | –          | skript           | + 20 s Endscreen                                |

## Video

- [x] Titel + 3 Thumbnail-Ideen (plan.md)
- [x] Hauptwelt (welt.js) geprüft
- [ ] Alle Kapitel gerendert
- [ ] Zusammengefügt + Lautheit (-14 LUFS)
- [ ] 3 Thumbnails
- [ ] Beschreibung mit Kapitel-Zeitmarken, Tags, Einstellungen, Kommentar (upload.txt)
- [ ] youtube/serie.md eingetragen

## Notizen

- ElevenLabs: Flow yQ8DZfkE7Q1UwZCTQnJ4 (Gratis-Konto). Lange Stücke (> ~200 Zeichen) und mehrere gleichzeitig werden abgelehnt; seit 2026-11-17 ~17:30 ist das Gratis-Konto ganz gesperrt („Free Tier access has been disabled“) Neues Gratis-Konto (Flow vLLR5UZWqp1Ntb4O1GsV): je EIN Stück, dann ~90 s Pause — geht. Kap. 6: PAUSE=0.42 für prepare-voice.
- Stimme stückweise: `assets/vo_takes/parts/pNN.mp3` (Zahlen ausgeschrieben im Prompt), O-Töne roh in `assets/vo_takes/raw/`, gefiltert mit `radio.sh` (Hook: funk, Kap. 2: telefon). Archivstimme: „Volker – Professionelle warm Voice“ `76ZsWRKclBS6MNPWxaLc`.
- Eigene Sounds: `youtube/titanic/sfx-extra.py` → in jedes Kapitel `scripts/sfx-extra.py` kopieren (glocke, morse, meer, maschine, kratzen, bruch, rakete, wind, tauchen).
- welt.js: 1 Einheit = 10 m, Bug +x. buildNight / buildShipyard / buildRadioRoom (RADIO = y 300) / buildDawn / buildDeep / makeDeepVignette (DEEP = y −320); makeTitanic({xray}) mit bow/stern (Bruch bei BREAK_X), setWater, shipLights.
