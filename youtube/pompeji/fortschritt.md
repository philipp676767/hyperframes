# Fortschritt: Pompeji: Warum so viele Menschen nicht geflohen sind

Stand für einen neuen Chat (Skill `youtube-erklaervideo`, Schritt „Weitermachen“).
Status je Kapitel: geplant → skript → stimme → szene → geprüft → gerendert.

| Nr  | Ordner        | Kapitel                  | Wörter | Sprechzeit | Status  | Notiz        |
| --- | ------------- | ------------------------ | ------ | ---------- | ------- | ------------ |
| 0   | 00-hook       | Der Berg reißt auf       | 162    | 65.1 s     | geprüft | Render läuft |
| 1   | 01-stadt      | Eine Stadt am Berg       | 153    | 61.5 s     | geprüft | Render-Queue |
| 2   | 02-vulkan     | Was im Berg passiert     | 179    | 71.9 s     | geprüft | Render-Queue |
| 3   | 03-bimsregen  | Steine fallen vom Himmel | 180    | 70.7 s     | geprüft | Render-Queue |
| 4   | 04-rettung    | Die Rettungsfahrt        | 186    | 75.4 s     | geprüft | Render-Queue |
| 5   | 05-glutlawine | Die Glutlawine           | 189    | 78.7 s     | geprüft | Render-Queue |
| 6   | 06-asche      | 1.700 Jahre unter Asche  | 161    | 64.7 s     | geprüft | Render-Queue |
| 7   | 07-finale     | Warum sie blieben        | 188    | 75.5 s     | geprüft | Render-Queue |

## Video

- [ ] Titel + 3 Thumbnail-Ideen (plan.md)
- [x] Hauptwelt (welt.js) geprüft
- [ ] Alle Kapitel gerendert
- [ ] Zusammengefügt + Lautheit (-14 LUFS)
- [ ] 3 Thumbnails
- [ ] Beschreibung mit Kapitel-Zeitmarken, Tags, Einstellungen, Kommentar (upload.txt)
- [ ] youtube/serie.md eingetragen

## Notizen

- ElevenLabs Gratis-Konto, Flow prGgZQWyOCQkO3t6Ax4l; alle Stimmen fertig (~9.000 Zeichen verbraucht, Reset ~20.12.). Archivstimme „Heribert deutsch“ yR6YPi6ytQSGBZ0uKFQl (eleven_flash_v2_5) mit leichtem Hall statt Funkfilter (Briefe).
- prepare-voice: Kap. 3, 4, 5 schneller gelesen → PAUSE 0.5/0.55 + BASE 0.97.
- Wortzeiten der Zitate von Hand gesetzt (00-hook, 04-rettung) nach silencedetect.
- W() ist kleinschreibungs-normalisiert („Was“ = „was“): immer n prüfen, Schnitte müssen aufsteigen.
- welt.js-Änderungen nur noch in nicht gerenderte Kapitel kopieren.
- Thumbnail-Kandidaten (in kapitel/\*/renders/, nicht versioniert): a6 (00-hook, --at 2, Vesuv+Säule über der Bucht, „POMPEJI: KEINE LAVA“), c3 (03-bimsregen, --at 33, Stadt bei Nacht, „POMPEJI: 18 STUNDEN ZEIT“). Noch offen: B = Glutlawine hinter dem Tempel (05-glutlawine --at 33, cam p [0,0.3,4.2] l [0,4.5,-30]) mit Label — erst nach dem Rendern (CPU).
- upload.txt + konkurrenz.txt Entwurf fertig; Kapitelmarken nach join-chapters.sh prüfen.
