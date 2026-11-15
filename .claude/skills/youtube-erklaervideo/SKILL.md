---
name: youtube-erklaervideo
description: 'Make a long German YouTube explainer (10–12 min, 16:9, 1920×1080) in the style of the TikTok series "Du hast gerade X gebaut": realistic 3D diorama worlds (one main world + side scenes), name tags, 2–4-word captions with yellow keywords, sound effects, no music, ElevenLabs voice "Jan – Social Media Creator" (eleven_v3) as a calm documentary narrator (2.5 words/s) — YouTube storytelling, not a long TikTok (references/sprechstil.md). Structure: cold-open intro with a road map and a title card, 6–9 chapters as story segments with open threads, re-hook at ~55 %, answer + outlook + CTA at the end, 20-s end screen. Built and rendered chapter by chapter, joined with ffmpeg; delivers the video, 3 thumbnails, title, description with chapter marks, tags, settings and a pinned comment. Main topic type: great moments of science and technology history (first Moon landing, the atomic bomb, Titanic …) told as a thriller and explained. Claude picks the topic (references/themen.md) and runs on autopilot. Use ONLY when the prompt contains the word "YouTube" (e.g. "YouTube-Video", "neues YouTube-Video", "YouTube-Erklärvideo", "mach das nächste YouTube-Video", "YouTube-Video über X") — without "YouTube" in the prompt never use this skill. NOT for TikToks or YouTube Shorts ("Short", "Shorts", "TikTok") — those use bau-erklaervideo.'
---

# YouTube-Erklärvideo (long form, 16:9)

One video = one topic, **10–12 minutes**, in the look and voice of the
TikTok series (skill `bau-erklaervideo`, which stays untouched — this skill
reads its references where they apply). What is new: the **length** (a
retention structure for 10 min), **16:9**, **packaging** (title + 3
thumbnails + chapters) and **chapter-wise production** (each chapter its
own composition, rendered alone, joined at the end).

Talk to the user in German. Keep them posted in short lines while working.

**When this skill runs** (user's rule, 2026-11-14): only when the user's
prompt contains the word **„YouTube“** („neues YouTube-Video“, „YouTube-Video
über Mückenstiche“, „mach weiter mit dem YouTube-Video“). A prompt without
„YouTube“ („neues Video“, „langes Video“, „mach das nächste Video“) is
**not** for this skill; „YouTube Short(s)“ / „TikTok“ belong to
`bau-erklaervideo`.

## Fixed house settings

| What       | Value                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Format     | **1920×1080, 30 fps, 10–12 min** (+ the 20-s end screen inside the finale)                                                                                                                                                                                                                                                                                                                                                                  |
| Voice      | ElevenLabs **Jan – Social Media Creator**, `voice_id keqaIOtp0ePlmN5jgQfy`, model **`eleven_v3`**, `generations_count: 1` — same voice and settings for every chapter. **2.5 words/s, a calm documentary narrator** (2026-11-15; was 2.8): `prepare-voice.sh` cuts pauses to 0.3 s and sets the tempo per chapter so all chapters sound like one take. **0–2 delivery tags per chapter**, calm base tone                                    |
| Words      | **1.500–1.750** in total; intro 90–130, chapters 150–300 each, finale 120–180                                                                                                                                                                                                                                                                                                                                                               |
| Structure  | Intro 35–55 s (**cold open** in the most tense moment → why it matters → **road map** of the video → „Aber mal von vorne.“ + title card) → **6–9 chapters à 60–120 s** as story segments (context → event → the science → meaning → bridge) → re-hook at ~50–60 % → finale: answer + what it means today + CTA → 20-s end screen (`references/aufbau.md`)                                                                                   |
| Language   | **YouTube narrator, not a long TikTok** (user, 2026-11-15, after YouTube #1): flowing sentences of 12–18 words in paragraphs, few questions, signposting, historic present for stories, analogies played out, dry humour — `references/sprechstil.md`. The TikTok `script-formel.md` sentence rules do **not** apply. Kept: Du-Form when the viewer is addressed, one idea at a time, ≤ 2 terms per chapter, no filler words, facts checked |
| CTA        | **In the middle, not at the end** (user, 2026-11-15: few viewers are left at the end): one „**abonniere** den Kanal …“ at ~35–55 % right after a payoff (red „Abonnieren“ pill → „Abonniert“), one comment question + „Schreib's in die Kommentare.“ at ~50–70 %; the finale only points to the next video (end screen). Never „Folge für mehr Wissen“ (TikTok wording). No greeting, no logo, no subscribe ask in the intro                |
| Look       | TikTok look (`bau-erklaervideo/references/visual-style.md`): realistic diorama, `real.*` materials, rounded edges, depth of field, a new world per topic, name tags, sound effects, **no music**. 16:9 layout + camera: `references/bild-16-9.md`                                                                                                                                                                                           |
| Captions   | **2–4 words per line, bottom centre**, keywords `*Wort*` yellow but quiet (no pop, no camera punch, no punch sound; ≈ one every 20–30 s). No TikTok title on frame 0 — a calm title card after the intro                                                                                                                                                                                                                                    |
| Packaging  | Title ≤ 60 chars (search word first), **3 thumbnails** 1280×720 (Test & Compare), description with **chapter marks**, tags, settings, a pinned comment — fixed **before** the script (`references/verpackung.md`)                                                                                                                                                                                                                           |
| Production | `youtube/<slug>/kapitel/NN-name/` = one composition each; `render-queue.sh` renders them one after the other (detached, ~4 s/frame → ≈ 20–25 h for 12 min); `join-chapters.sh` joins without re-encoding the picture, -14 LUFS                                                                                                                                                                                                              |
| Progress   | `youtube/<slug>/fortschritt.md` — so a new chat can continue (step „Weitermachen“)                                                                                                                                                                                                                                                                                                                                                          |
| Logs       | `youtube/serie.md` (finished videos), `youtube/lernlog.md` (CTR, 30-s retention, average view duration, drop-off points → rules)                                                                                                                                                                                                                                                                                                            |
| Topics     | Main type **„Große Momente“** — real moments of science / tech history (Apollo 11, the atomic bomb, Titanic …) told as a thriller and explained; `references/themen.md` (scorecard, duplicate check, reservation)                                                                                                                                                                                                                           |

## Workflow

### Autopilot + token budget (as in the TikTok skill)

Same rules as `bau-erklaervideo` SKILL.md „Autopilot“ and „Token budget“:
pick the topic yourself, **reserve it as the very first commit**, then run
straight through to the finished video without asking; stop only when you
truly cannot go on (no ElevenLabs access / credits, a push that keeps
failing, a broken tool). Token rules: few turns, small context — read a
reference once for the step that needs it, quiet commands (`| tail -n 5`,
`-v error`), contact sheets (16:9 tiles, up to 12 per sheet), write each
file once and fix with small edits, batch independent calls, voice in one
take per chapter, and **render watching with as few wake-ups as possible**
(one Monitor on `queue.log` that prints only DONE / FAIL / QUEUE end).

A 10-min video is long work: **save progress after every chapter**
(commit + push on `main`, `fortschritt.md` updated) so a container restart
or a new chat loses nothing.

### Weitermachen — a chat that continues a video

If the user says „mach weiter“ or names a video in progress: `git pull
origin main`, read `youtube/<slug>/fortschritt.md` and `plan.md`, and
continue at the first chapter whose status is not „gerendert“ (or with the
render queue / joining / delivery). Don't redo finished chapters. Name the chat
as that video (step 0a: `YouTube #<Nr>: <Thema>`, the Nr from its row).

### 0. Topic — reserve it FIRST

`git pull origin main`. Follow `references/themen.md`: duplicate check
(`youtube/serie.md`, `youtube/*`, the Reserviert table, remote branches),
the scorecard (incl. **fact inventory ≥ 15** and **thumbnail test**),
take the best (≥ 12/16) — a strong TikTok topic as the long version is a
good choice. **Reserve it immediately**: row in Reserviert (with the chat
title of 0a), commit, push on `main` (rejected → pull, re-check that nobody
took the topic or the number meanwhile, push again). Then rename the chat
(0a) and post one short line, e.g. „Reserviert: YouTube #2 Mond-Crash. Du
kannst schon den nächsten Chat starten.“ — and go on without waiting.

### 0a. Name the chat — "YouTube #<Nr>: <Thema>"

Every video chat is named like the TikTok chats, marked as YouTube (user's
rule, 2026-11-14): **`YouTube #<Nr>: <Thema>`**, e.g. `YouTube #1:
Mond-Crash`, `YouTube #4: Taschenwärmer`.

- **Nr = the number of the YouTube video** — its own count, independent of
  the TikTok numbers: the highest `#` in `youtube/serie.md` + 1, plus one for
  every row of the **Reserviert** table in `references/themen.md` that is not
  in `serie.md` yet (parallel chats). The first long video is `#1`.
- **Thema** = the short name people search for (1–4 words, German, umlauts
  as ä/ö/ü) — not the full video title.
- Put the same title in the `Chat` column of the reservation, and use the
  same Nr in `youtube/serie.md` (`#` column) at the end.
- Rename right after the reservation, before anything else:
  - if `set_session_title` is available (ToolSearch
    `select:mcp__claude-code-remote__get_session,mcp__claude-code-remote__set_session_title`):
    `get_session` without `session_id` gives this chat's id, then
    `set_session_title` with that id and the title;
  - without that tool, the very first line of your reply is: **„Bitte
    benenne diesen Chat in „YouTube #<Nr>: <Thema>“ um.“** — exactly that
    title, so the user can copy it.
- If another chat finished first and the number changed when you log the
  video in `serie.md`, or the topic changed, rename again.
- A chat that continues a video („Weitermachen“) keeps / takes the title of
  that video (`Chat` column in `references/themen.md` or `youtube/serie.md`).

### 0b. Read the learning logs

`youtube/lernlog.md` (its "Nächstes Mal" list = rules for this video) and
the top of `tiktok/lernlog.md` down to „## Einträge“ (what works for this
audience). The delivery message names which lessons this video applies.

### 1. Facts

Research the topic (web search when available; `mcp__Tube_Alfred__*` for
what ranks on YouTube: `youtube_search_query`, `youtube_search_suggest`,
transcripts of the big videos on it — learn the angle and the questions,
never copy). Fill the **fact inventory** in `plan.md`: ≥ 15 true, showable
facts with a short source, ordered weakest → strongest. Uncertain numbers
are phrased safely.

### 2. Packaging — before the script

```bash
bash .claude/skills/youtube-erklaervideo/scripts/new-video.sh <slug> "<Titel>"
```

Creates `youtube/<slug>/` with `plan.md`, `fortschritt.md`, `welt.js`,
`kapitel/`. In `plan.md` (`references/verpackung.md`): five titles → the
best (≤ 60 chars, search word first), the **promise in one sentence**, the
**3 thumbnail ideas** (A spectacle, B close-up / hand / face, C number /
contrast — moment, camera, 2–5 words that **name the topic** so a stranger knows in one second what the video is about, layout; `verpackung.md` rule 1), the main question, the
search word. The intro's cold open shows exactly this promise in its first seconds.

### 3. Script — the whole video, then self-check

Write all chapters with `references/aufbau.md` (structure, intro) and
**`references/sprechstil.md`** (how a YouTube narrator talks — read the
before/after example first; the TikTok `script-formel.md` sentence rules do
not apply here; **`references/beispiel-skript.md`** is a whole script in
this style — read it once). Fill the chapter table + threads + re-hook + money shots
in `plan.md`. Count the words (1.500–1.750). Read every chapter aloud in
your head: does it sound like a documentary or like captions? Run the
self-checks in both files and fix every point — you are the only reviewer.
Each chapter's `script.txt`: **one paragraph (3–6 sentences) per line**,
few keywords `*Wort*`, 0–2 delivery tags; the finale's last line = the CTA
line. `sync-html.mjs` warns about TikTok rhythm (short sentences, many
questions, many tags, banned phrases).

### 4. The main world (+ side scenes)

Build `youtube/<slug>/welt.js` like a TikTok world
(`bau-erklaervideo` SKILL.md step 1b — concept, own light, layers, hero
piece, life, the 4-camera quality check, the „same as before?“ test
against the last 3 YouTube videos) — then copy it into the chapters with
`scripts/sync-kit.sh <slug>`. Side scenes: a chapter's own
`assets/set.js` (`references/bild-16-9.md` „Worlds“). Snapshot the set in
16:9 from 4 cameras (`window.__cam`) before building subjects.

### 5. Chapters — one composition each

```bash
bash .claude/skills/youtube-erklaervideo/scripts/new-chapter.sh <slug> 0 hook "<Kapiteltitel>"
bash .claude/skills/youtube-erklaervideo/scripts/new-chapter.sh <slug> 1 <name> "<Kapiteltitel>"
…
bash .claude/skills/youtube-erklaervideo/scripts/new-chapter.sh <slug> <n> finale "<Kapiteltitel>" ende
```

Per chapter, in order (and commit + push + `fortschritt.md` after each):

1. **`script.txt`** + **`assets/kapitel.js`**: `titel` (short, concrete —
   also the YouTube chapter name); chapter 0: `hookTitel` (the video title
   for the title card, keyword in `<em>`) and `titelBei` (the spoken word it
   appears on, usually „vorne“ in „Aber mal von vorne.“); `frage` /
   `antwort` optional (long form mostly leaves them empty). Then `node
scripts/fake-words.mjs && node scripts/build-sfx.mjs && node
scripts/sync-html.mjs` (estimated timings; read its warnings).
2. **Voice** (as TikTok step 3): the chapter's `script.txt` joined to one
   paragraph, every `*` removed, tags kept → `creative_generate_speech`
   (Jan, `eleven_v3`, `generations_count: 1`) → poll → `curl` to
   `assets/vo_takes/main.mp3` right away. 429 on the first try → short
   pieces (TikTok Gotchas „ElevenLabs 429“, `scripts/join-voice.sh`). Then:
   ```bash
   bash scripts/prepare-voice.sh       # pauses 0.3 s, tempo → 2.5 words/s, -14 LUFS
   python3 -I scripts/align-words.py   # Whisper timings + caption flags → assets/words.js
   node scripts/build-sfx.mjs && node scripts/sync-html.mjs
   ```
   (`pip install faster-whisper` once per container.)
3. **Scene** (`assets/scene.js` + `assets/beats.js`, TikTok `scene-api.md`):
   the subject in the realistic finish, beats anchored on spoken words
   (`W("Wort", n)`), shots for 16:9 (`bild-16-9.md` „Camera“: a change every
   8–20 s, a money shot every 2–3 min), 1–3 labels, highlights, own sounds
   only where they fit. The intro opens on its cold-open scene (moving, the
   thumbnail moment) — not TikTok's „first 3
   seconds“ rules; the finale's last shot is the calm, moving end-screen
   picture (`kapitel-template/demo-ende/` is the pattern).
4. **Check**: `npx --yes hyperframes@0.8.181 lint` (0 errors), then a
   contact sheet: `npx --yes hyperframes@0.8.181 snapshot --at <one time per
shot> --no-end --describe false -o <scratch>` — subject readable,
   captions free, tags on their parts, nothing written in the end-screen
   band of the finale's last 20 s. Intro: snapshot 0, 2, 10, 25, the road map
   and the title card (`titelBei` + 1 s) against `aufbau.md` „The intro“.
   2–3 fix rounds.

### 6. Render — the queue, detached

```bash
HYPERFRAMES_RENDER_DETACHED=1 setsid nohup bash .claude/skills/youtube-erklaervideo/scripts/render-queue.sh <slug> \
  > /dev/null 2>&1 < /dev/null & disown
```

Renders every chapter that has no up-to-date `renders/kapitel.mp4`, one
after the other, retries a failed one once, and logs START / DONE / FAIL
lines to `youtube/<slug>/renders/queue.log`. Watch it with **one**
`Monitor` (`tail -n 0 -F …/queue.log | grep --line-buffered -E
"^(DONE|FAIL|QUEUE end)"`, max timeout, re-arm silently on expiry). Tell
the user the expected time (log line: ≈ h per chapter; 12 min ≈ 20–25 h).
After a restart notice: `pgrep -f "render-queue"`; if gone, start the queue
again — finished chapters are skipped. Chapters can be rendered as soon as
they are checked (start the queue early and let it pick up more later by
starting it again after it ended).

### 7. Join, thumbnails, upload texts

```bash
bash .claude/skills/youtube-erklaervideo/scripts/join-chapters.sh <slug>
# → youtube/<slug>/renders/<slug>-final.mp4 (-14 LUFS) + kapitelmarken.txt
```

Check: one video + one audio stream, 10–12 min, the chapter seams (snapshot
± 0.2 s around each with ffmpeg: no black frame, no jump in the sound).
Watch it honestly as a stranger: contact sheet every ~30 s + the intro frames
— would I stay after 30 s? Is there a change every 8–20 s? Fix before
sending.

Thumbnails (any chapter's folder, the moments from `plan.md`):

```bash
bash scripts/make-thumbnail.sh <s> "<TEXT mit <em>Wort</em>>" <links|rechts|oben|unten> a ['{"p":[x,y,z],"l":[x,y,z]}']
```

→ copy `renders/thumb-{a,b,c}.png` to `youtube/<slug>/`, phone test at
246×138 and the **one-second test** (cover the title: „Das Video handelt
von \_\_\_“ must be the topic — `verpackung.md` rule 1). Write `youtube/<slug>/upload.txt` (`references/verpackung.md`:
title, description with the chapter marks from `kapitelmarken.txt`, tags,
pinned comment, settings).

### 8. Deliver

`SendUserFile` the final video (display `render`) and the three thumbnails,
then in the message: Titel, Beschreibung (incl. chapter marks + hashtags),
Tags, Kommentar zum Anpinnen — **each its own code block** (only the field's
text) — the settings as a short list (end screen: video left, subscribe
right), one line „Bühnenbild: …“, which learning-log lessons it applies,
and the ask for the numbers (step 9). Append the video to
`youtube/serie.md`, remove it from Reserviert, tick `fortschritt.md`,
commit + push on `main`.

### 9. Numbers → learning log

Ask the user for, after 2–7 days (YouTube Studio → Analytics): **CTR**
(Klickrate der Impressionen) per thumbnail (Test & Compare result),
**Zuschauer nach 30 s** (key moments / „Intro“ retention), **Ø
Wiedergabedauer** and %, **the drop-off points** in the retention curve
(time + what was on screen), views, subscribers gained, comments. Log them
in `youtube/lernlog.md` with **one** concrete "Nächstes Mal" item; turn
lasting lessons into rules in this skill; commit on `main`.

## Gotchas

All the TikTok skill's gotchas apply (`bau-erklaervideo` SKILL.md
„Gotchas“: render detached with `HYPERFRAMES_RENDER_DETACHED=1`, the skill
mirror, worker restarts, x-ray materials, anchors, ElevenLabs 429, LFS,
`pkill` patterns, fresh container `bun install`, quality over speed,
facets, shader colours). In addition:

- **Commit blocked by „Skill mirror out of sync“:** `.agents/skills/` is
  git-ignored but checked by the commit hook — `cp -r
.claude/skills/youtube-erklaervideo .claude/skills/bau-erklaervideo
.agents/skills/` (local only), then commit again.
- **Chapters must match for a lossless join:** all rendered with the same
  pinned CLI (`hyperframes@0.8.181`, in `render-queue.sh`) at 1920×1080 /
  30 fps; `join-chapters.sh` stops if one differs. A chapter's length is
  rounded up to 0.1 s (whole frames).
- **Kit changes go to every chapter:** after editing `welt.js` or the
  skill's `kapitel-template/` kit, run `scripts/sync-kit.sh <slug>` (it
  keeps each chapter's script, kapitel.js, beats, scene, set, voice).
  The render queue then re-renders exactly the chapters whose inputs
  changed.
- **Voice reads slowly in pieces** (TikTok #36): `prepare-voice.sh` stops
  above x1.32 — regenerate in one piece, or `BASE=1.32` and say so.
- **CTA keys on words:** the subscribe pill pops on the first word
  starting with „abonnier“, the comment pill with the sentence before
  „… Kommentare“ — in whichever chapter they are spoken. `sync-html.mjs`
  warns when „abonniere“ is in the intro or the finale, more than once, or
  when „Folge für mehr Wissen“ (TikTok) slips in.
- **Answer word per chapter:** `antwort` in `kapitel.js` must be spoken
  after 3 s and not earlier in that chapter in another sense.
- **The end screen:** the finale is `ende: true`; its length is the CTA line
  start + 20 s. Keep its last shot moving but calm and keep the middle band
  (y 260–760) free of labels, panels and HUD — the end-screen elements sit
  there.
- **Long renders and idle containers:** the container is reclaimed when the
  chat idles; the Monitor on `queue.log` keeps it alive. If a chapter
  failed twice (`FAIL … gave up`), read its `renders/render.log` tail, fix,
  start the queue again.
- **Thumbnail text** starts at 176 px uppercase and shrinks to fit (down to
  96 px, max 3 lines): 2–5 words that name the topic fit; more don't —
  shorten the words, keep the topic name.
