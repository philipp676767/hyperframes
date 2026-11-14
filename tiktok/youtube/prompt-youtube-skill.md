Erstelle einen zweiten Skill `youtube-erklaervideo` (in `.claude/skills/youtube-erklaervideo/`) für lange YouTube-Erklärvideos (10–12 Minuten, 16:9) im selben Stil wie meine TikTok-Serie. Der TikTok-Skill `.claude/skills/bau-erklaervideo` darf NICHT verändert werden — lies ihn komplett (SKILL.md, references/, template/, tiktok/lernlog.md) und übernimm daraus alles, was passt. Arbeite direkt auf `main` (vorher `git pull`), committe und pushe. Frag mich nur, wenn es wirklich nicht anders geht.

## Was gleich bleibt wie bei TikTok

- Look: realistische 3D-Dioramen (three.js, `real.*`-Materialien, runde Kanten, Tiefenschärfe), für jedes Thema eine neue Welt, Namensschilder, gelbe Schlüsselwörter in den Untertiteln, Soundeffekte, keine Musik.
- Stimme: ElevenLabs „Jan – Social Media Creator“ (eleven_v3), Regieanweisungen wie [excited], kein Flüstern im Hook.
- Sprache: Du-Form, frech-freundlich, einfach (eine Kernidee pro Kapitel, Alltagsvergleiche, keine Füllwörter, max. 2 Fachbegriffe pro Kapitel).
- Autopilot: Thema selbst wählen, als Allererstes reservieren und pushen, dann alles ohne Rückfrage bis zum fertigen Video.
- Token-Regeln aus dem TikTok-Skill („Token budget“) gelten genauso.

## Format

- 1920×1080, 30 fps, 10–12 min. Jan etwas ruhiger als bei TikTok: ca. 2,7–2,9 Wörter/s → 1.700–1.950 Wörter.
- Vorlage: kopiere das TikTok-Template und stelle es auf Querformat um (Kamera, Untertitel-Position, Schilder, Titel, sichere Ränder). Untertitel: Ein-Wort-Stil ist für 16:9 zu hektisch → 2–4 Wörter pro Einblendung, unten Mitte.

## Aufbau (recherchiert: YouTube-Retention 2026)

1. **Hook 0:00–0:30 (das Wichtigste — YouTube misst, wie viele nach 30 s noch da sind; Ziel ≥ 70 %):**
   - 0–10 s: Das Versprechen aus Titel + Thumbnail sofort mit einem echten Beispiel beweisen (Spektakel in Bild 0, wie bei TikTok).
   - 10–20 s: Warum es DICH betrifft (Nutzen / Gefahr).
   - 20–30 s: In einem Satz sagen, was gleich kommt (ohne „Gleich erfährst du …“-Floskel, konkret).
   - Kein Intro, kein Logo, keine Begrüßung, kein „Abonniert“ am Anfang.
2. **6–9 Kapitel à 60–120 s**, jedes mit eigenem Mini-Hook (Frage), Erklärung und Mini-Auflösung. Jedes Kapitel endet mit einer offenen Frage, die ins nächste zieht (Open-Loop-Kette, nie alle Fragen gleichzeitig zu).
3. **Abwechslung:** alle 8–20 s ändert sich etwas im Bild (Schnitt, Kamerafahrt, neues Objekt, Zeitlupe, Anzeige); alle 2–3 min ein großer Money-Shot.
4. **Mitte (~50–60 %): Re-Hook** mit der überraschendsten Wendung des Videos, gegen den typischen Absprung in der Mitte.
5. **Auflösung** der Hauptfrage erst kurz vor Schluss, dann ein „Übrigens“-Bonusfakt.
6. **Ende (letzte ~20 s):** Kommentar-Frage + „Folge für mehr Wissen.“ und ein Verweis auf ein passendes nächstes Video (für den YouTube-Endbildschirm Platz lassen: 20 s ruhiges, aber bewegtes Bild ohne Text in den Endscreen-Bereichen).
7. Kapitel als Zeitmarken in die Beschreibung (YouTube-Kapitel), Kapiteltitel kurz und neugierig.

## Themen (recherchiert: was bei langen Erklärvideos gut läuft, z. B. „Dinge Erklärt – Kurzgesagt“ DE)

- **„Was passiert, wenn …?“-Katastrophen/Szenarien:** z. B. „Was passiert, wenn der Mond in die Erde kracht?“ (5,1 Mio.), „… alle Atombomben gleichzeitig zünden?“ (8,6 Mio.), „… ein Supervulkan ausbricht?“ (2,2 Mio.).
- **Extreme Orte:** „Was verbirgt sich am tiefsten Punkt des Ozeans?“ (5,8 Mio.), „… im tiefsten Loch der Welt?“, „Der furchtbarste Ort im Universum“.
- **Dein Körper:** „Dein Gehirn ist Wahnsinn!“, „Das Immunsystem erklärt“, Tattoos im Immunsystem, Mückenstich (1,2 Mio.).
- **„Wie funktioniert X wirklich?“ bei Alltagstechnik:** „So funktioniert das Internet wirklich!“ (1,3 Mio.), „Kupplung, wie funktioniert sie?“ (4,8 Mio.), Waschprogramme (264 K in 6 Monaten).
- **„Minute für Minute“-Zeitleisten** und **„Die Wahrheit über …“** mit provokantem Titel („Alkohol ist GROSSARTIG“, „Die unbequeme Wahrheit über Ozempic“).
- Unsere stärksten TikTok-Themen (siehe `tiktok/lernlog.md`, `tiktok/serie.md`: Taschenwärmer, Face ID, Nagellampe …) eignen sich als lange Version; die TikTok/Shorts dienen dann als Trailer mit Link zum langen Video („Ähnliches Video“-Verknüpfung bei Shorts).
- Eigene Themenliste `references/themen.md` mit Bewertung (Suchinteresse, „Was?!“-Faktor, trägt 10 min = mind. 15 echte Fakten, Thumbnail-tauglich), Duplikat-Check, Reservierung wie bei TikTok.

## Verpackung (entscheidet bei YouTube über die Klicks)

- **Titel** ≤ 60 Zeichen, Suchwort vorn, Neugier ohne Clickbait.
- **Thumbnail** 1280×720 aus der 3D-Szene: ein Objekt/Gesicht groß, starker Kontrast, max. 3 Wörter, auf dem Handy lesbar. Immer **3 Varianten** erstellen (für YouTubes „Test & Compare“).
- Titel + Thumbnail VOR dem Skript festlegen; der Hook muss genau dieses Versprechen sofort einlösen.
- Beschreibung: 2 Sätze mit Suchwörtern, Kapitel-Zeitmarken, „Folge für mehr Wissen.“, 3–5 Hashtags; dazu Tags und Upload-Einstellungen wie im TikTok-Skill (Schritt 6d), jedes Feld ein eigener Kopier-Block; ein Kommentar zum Anpinnen.

## Produktion

- **Kapitelweise bauen und rendern:** jedes Kapitel eine eigene Komposition (eigene `script`-Zeilen, Stimme, Szene), einzeln rendern (Render immer losgelöst wie im TikTok-Skill, ~4 s pro Bild → 12 min ≈ 20–25 h insgesamt) und am Ende mit ffmpeg verlustfrei zusammenfügen. So kostet ein Abbruch nur ein Kapitel. Fortschritt in einer Datei festhalten, damit ein neuer Chat weitermachen kann.
- Stimme pro Kapitel erzeugen (gleiche Einstellungen), Tempo und Lautstärke angleichen (−14 LUFS).
- Welten: eine Hauptwelt fürs Video + kleine Nebenschauplätze pro Kapitel; Kits aus dem TikTok-Template wiederverwenden.
- Ordner: `youtube/<slug>/`, Logbücher `youtube/serie.md` und `youtube/lernlog.md` (Zahlen: Klickrate, 30-s-Wert, Ø Wiedergabedauer, Absprungstellen).

## Am Ende liefern

Fertiges Video, 3 Thumbnails, Titel, Beschreibung mit Kapiteln, Tags, Einstellungen, Kommentar zum Anpinnen — jeweils zum Kopieren.

## Auslösen

Die `description` des neuen Skills muss klar sagen: Verwenden bei „neues YouTube-Video“, „YouTube-Video“, „langes Video“, „YouTube-Folge“ — NICHT bei „TikTok“ / „neues Video“ ohne YouTube (das bleibt beim TikTok-Skill `bau-erklaervideo`, dessen description schon entsprechend abgrenzt). Aufruf direkt mit `/youtube-erklaervideo`.

Baue den Skill, teste die Querformat-Vorlage mit einem kurzen Demo-Kapitel (Standbilder prüfen) und zeig mir zum Schluss eine Übersicht, was der Skill macht.
