# Fortschritt: Tschernobyl: Warum der Not-Aus den Reaktor sprengte

Stand für einen neuen Chat (Skill `youtube-erklaervideo`, Schritt „Weitermachen“).
Status je Kapitel: geplant → skript → stimme → szene → geprüft → gerendert.

| Nr  | Ordner       | Kapitel                       | Wörter | Sprechzeit | Status    | Notiz |
| --- | ------------ | ----------------------------- | ------ | ---------- | --------- | ----- |
| 0   | 00-hook      | Der Knopf für den Notfall     | 134    | 53.9 s     | gerendert |       |
| 1   | 01-reaktor   | Ein Reaktor wie kein anderer  | 164    | 65.9 s     | gerendert |       |
| 2   | 02-test      | Ein Test in der Nacht         | 165    | 66.3 s     | gerendert |       |
| 3   | 03-explosion | 1:23 Uhr                      | 172    | 69.1 s     | gerendert |       |
| 4   | 04-feuerwehr | Die Nacht der Feuerwehr       | 146    | 58.7 s     | gerendert |       |
| 5   | 05-prypjat   | Prypjat wird leer             | 147    | 59.1 s     | gerendert |       |
| 6   | 06-keller    | Drei Männer im Keller         | 167    | 67.1 s     | gerendert |       |
| 7   | 07-wolke     | Die Wolke und der Sarg        | 249    | 99.9 s     | gerendert |       |
| 8   | 08-finale    | Warum der Reaktor explodierte | 128    | 51.5 s     | gerendert |       |

## Video

- [ ] Titel + 3 Thumbnail-Ideen (plan.md)
- [x] Hauptwelt (welt.js) geprüft
- [x] Alle Kapitel gerendert
- [x] Zusammengefügt + Lautheit (-14 LUFS): 10:09
- [x] 3 Thumbnails
- [x] Beschreibung mit Kapitel-Zeitmarken, Tags, Einstellungen, Kommentar (upload.txt)
- [x] youtube/serie.md eingetragen

## Notizen

- ElevenLabs: Gratis-Konto, Flow O22WbkAgicJPnim2zILc, ganze Kapitel in einem Stück gingen durch (2026-11-20). Verbraucht ~9.500 von 10.000 Zeichen — **kein Neu-Generieren mehr möglich bis zum Reset (~20.12.)**.
- Erzähler Johannes `r8MyP4qUsq5WFFSkPdfV`; Archivstimme „Nexa – The System“ `HkESLncErpfXT5IWi6vH` (Durchsage Prypjat, `radio.sh funk`, raw in 00-hook/assets/vo_takes/raw/q-evak.mp3, in Kap. 5 wiederverwendet).
- prepare-voice: Kap. 1 und Finale mit PAUSE=0.4 (Take schon schnell), Rest 0.3.
- Wortzeiten: Whisper verschluckt Datum/Zahlen — `/tmp`-Fixer verteilt zusammengeschobene Wörter gleichmäßig (00-hook Datum, 03 „Nach Schätzungen…“ von Hand nach silencedetect).
- Anker-Falle: W() ist klein geschrieben-normalisiert („Im“ = „im“) — immer mit n oder einem eindeutigen Wort ankern.
- welt.js-Änderungen NUR in noch nicht gerenderte Kapitel kopieren (sync-kit macht alle Renders ungültig).
