# Fortschritt: Pyramiden: Ein 4.500 Jahre altes Tagebuch verrät den Bau

Stand für einen neuen Chat (Skill `youtube-erklaervideo`, Schritt „Weitermachen“).
Status je Kapitel: geplant → skript → stimme → szene → geprüft → gerendert.

Credits (ElevenLabs, Budget 9 500–10 000 pro Video): verbraucht 9 542 · übrig vom Video-Budget 458 (alle Stimmen fertig)

| Nr  | Ordner        | Kapitel                   | Wörter | Sprechzeit | Status  | Notiz        |
| --- | ------------- | ------------------------- | ------ | ---------- | ------- | ------------ |
| 0   | 00-hook       | Ein Logbuch im Sand       | 189    | 75.2 s     | geprüft | Render-Queue |
| 1   | 01-koenig     | Ein König will ewig leben | 166    | 66.6 s     | geprüft | Render-Queue |
| 2   | 02-plan       | Ein Berg nach Plan        | 165    | 66.2 s     | geprüft | Render-Queue |
| 3   | 03-steinbruch | Steine aus dem Fels       | 148    | 59.3 s     | geprüft | Render-Queue |
| 4   | 04-nil        | Der Fluss als Förderband  | 152    | 67.3 s     | geprüft | Render-Queue |
| 5   | 05-rampe      | Schlitten auf nassem Sand | 182    | 72.3 s     | geprüft | Render-Queue |
| 6   | 06-arbeiter   | Die Stadt der Arbeiter    | 180    | 65.8 s     | geprüft | Render-Queue |
| 7   | 07-spitze     | Die weiße Spitze          | 153    | 61.3 s     | geprüft | Render-Queue |
| 8   | 08-finale     | Kein Geheimnis            | 189    | 75.6 s     | geprüft | Render-Queue |

## Video

- [x] Titel + Thumbnail-Ideen (plan.md)
- [x] Skript im Credit-Budget (scripts/credits.py OK: 9 655 Zeichen)
- [x] Hauptwelt (welt.js) geprüft
- [ ] Alle Kapitel gerendert
- [ ] Zusammengefügt + Lautheit (-14 LUFS)
- [ ] 3 Thumbnails
- [ ] Beschreibung mit Kapitel-Zeitmarken, Tags, Einstellungen, Kommentar (upload.txt)
- [ ] youtube/serie.md eingetragen

## Notizen

- ElevenLabs Gratis-Konto, Flow FuXnWcYxV6nlPCFtkj2N. „Free generations are busy“ kommt oft — einfach ein paar Minuten später neu versuchen (nichts wird berechnet).
- Archivstimme „Heribert deutsch“ yR6YPi6ytQSGBZ0uKFQl (eleven_flash_v2_5, 0,5 Credit/Zeichen), Filter: `highpass=f=110,lowpass=f=7000,aecho=0.8:0.55:45|80:0.22|0.12` (Logbuch, kein Funk). Rohdateien in `assets/vo_takes/raw/`.
- prepare-voice mit `PAUSE=0.45` (Johannes liest schon ruhig; mit 0.3 wäre er > 2,5 W/s).
- Wort-Anker: `P("Wort", "Folgewort")` in beats.js statt `W()` — viele Wörter (wie, das, vor, und) kommen früher schon vor. beats.js wirft, wenn die Shots nicht aufsteigen.
- Kamera-Check: `scratchpad/camcheck.py` (window.\_\_cam), Kontaktbögen mit `hyperframes snapshot`.
- Render: Queue 1 = 00–03 (gestartet 16:17 UTC), Queue 2 = 04–08 wartet per `pgrep` auf Queue 1. Nach Neustart: `pgrep -f render-queu[e]`; sonst `render-queue.sh pyramiden` neu starten (fertige Kapitel werden übersprungen).
