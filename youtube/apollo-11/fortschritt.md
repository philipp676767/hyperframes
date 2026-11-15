# Fortschritt: Apollo 11: Die Mondlandung wäre fast gescheitert

Stand für einen neuen Chat (Skill `youtube-erklaervideo`, Schritt „Weitermachen“).
Status je Kapitel: geplant → skript → stimme → szene → geprüft → gerendert.

| Nr  | Ordner       | Kapitel             | Wörter | Sprechzeit    | Status    | Notiz                                                      |
| --- | ------------ | ------------------- | ------ | ------------- | --------- | ---------------------------------------------------------- |
| 0   | 00-hook      | Alarm über dem Mond | 76     | 26,4 s        | gerendert | Eagle im Sinkflug, DSKY 1202, Handy, Filzstift             |
| 1   | 01-rakete    | Das Monster         | 188    | 67,3 s        | gerendert | Startrampe, Freiheitsstatue, Ballon, Start, Stufen         |
| 2   | 02-flugbahn  | Zielen ins Leere    | 209    | 74,1 s        | gerendert | Diagramm Erde–Mond, Pass, Acht, Andocken                   |
| 3   | 03-computer  | Ein Hirn aus Draht  | 182    | 65,1 s        | gerendert | Dunkle Bühne, DSKY, Kernspeicher, Rangliste                |
| 4   | 04-trennung  | Allein hinterm Mond | 184    | 65,8 s        | gerendert | Mondorbit, Funkloch, Papier, Collins-Foto                  |
| 5   | 05-alarm     | Alarm 1202          | 172    | 61,3 s        | gerendert | Abstieg, Kontrollzentrum, Schalter, Koch, Spickzettel      |
| 6   | 06-landung   | Noch 60 Sekunden    | 182    | 65,1 s        | gerendert | Handflug, Geister-Abbruch, Kontaktlampe, Re-Hook           |
| 7   | 07-mond      | Der Filzstift       | 188    | 67,1 s        | gerendert | Luke, TV 1969, Schritt, Staub, Spiegel, Schalter, Stift    |
| 8   | 08-rueckflug | Der Feuerball       | 183    | 65,5 s        | gerendert | Start, Rendezvous, Wiedereintritt, Fallschirme, Quarantäne |
| 9   | 09-finale    | Die Antwort         | 128    | 45,9 s + 20 s | gerendert | Antwort, Laser auf Spiegel, Endscreen mit Erde             |

## Video

- [x] Titel + 3 Thumbnail-Ideen (plan.md)
- [x] Hauptwelt (welt.js) geprüft
- [x] Alle Kapitel gerendert
- [x] Zusammengefügt + Lautheit (-14 LUFS)
- [x] 3 Thumbnails
- [x] Beschreibung mit Kapitel-Zeitmarken, Tags, Einstellungen, Kommentar (upload.txt)
- [x] youtube/serie.md eingetragen

## Notizen

- ElevenLabs: Takes 0–7 im Flow b2YTLZARMvSoEhRdZ4aW (altes Konto), 8 + 9 auf dem neuen Gratis-Konto (Flows s5s9MEpfo2uOpTGy98vT, sjQFdfy1baurAohg3tow).
- Render: scripts/render-queue.sh apollo-11 (00–07 zuerst, dann 08 09 nachgereiht).
- welt.js = Baukasten ohne Seiteneffekte: buildMoon / buildSpace / buildPad + makeLM / makeCSM / makeSaturnV / makeAstronaut / makeDSKY / makePhone / makePen / makeDust / makeFlame. Jedes Kapitel ruft in set.js seinen Ort auf.
- Eigene Sounds (scripts/sfx-extra.py, in jedem Kapitel gleich): alarm1202, quindar, triebwerk, startdonner.
- Achtung (gelernt): nach einem Commit/Pull können MP3s im Arbeitsbaum zu LFS-Zeigern werden (132 Byte) → Render scheitert an der Audiospur. Vor dem Rendern `git lfs pull --include="youtube/<slug>/**"`.
