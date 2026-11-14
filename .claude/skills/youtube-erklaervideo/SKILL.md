---
name: youtube-erklaervideo
description: 'Make a long German YouTube explainer (10–12 min, 16:9, 1920×1080) in the style of the TikTok series "Du hast gerade X gebaut": realistic 3D diorama worlds (one main world + side scenes), name tags, 2–4-word captions with yellow keywords, sound effects, no music, ElevenLabs voice "Jan – Social Media Creator" (eleven_v3) a bit calmer (2.8 words/s). Retention-first structure: 30-s hook that proves the title/thumbnail promise, 6–9 chapters with mini-hooks and an open-loop chain, re-hook at ~55 %, answer + "Übrigens" + CTA at the end, 20-s end screen. Built and rendered chapter by chapter, joined with ffmpeg; delivers the video, 3 thumbnails, title, description with chapter marks, tags, settings and a pinned comment. Claude picks the topic (references/themen.md) and runs on autopilot. Use for "YouTube-Video", "langes Video", "langes Erklärvideo", "YouTube-Erklärvideo", "mach das nächste YouTube-Video" or a named long-form topic. NOT for 45-s TikToks / Shorts — those use bau-erklaervideo.'
---

# YouTube-Erklärvideo (long form, 16:9)

One video = one topic, **10–12 minutes**, in the look and voice of the
TikTok series (skill `bau-erklaervideo`, which stays untouched — this skill
reads its references where they apply). What is new: the **length** (a
retention structure for 10 min), **16:9**, **packaging** (title + 3
thumbnails + chapters) and **chapter-wise production** (each chapter its
own composition, rendered alone, joined at the end).

Talk to the user in German. Keep them posted in short lines while working.

## Fixed house settings

| What       | Value                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Format     | **1920×1080, 30 fps, 10–12 min** (+ the 20-s end screen inside the finale)                                                                                                                                                                                                                                                                                                                                                                     |
| Voice      | ElevenLabs **Jan – Social Media Creator**, `voice_id keqaIOtp0ePlmN5jgQfy`, model **`eleven_v3`**, `generations_count: 1` — same voice and settings for every chapter. **2.8 words/s** (2.7–2.9; calmer than TikTok's 3.1): `prepare-voice.sh` cuts pauses to 0.2 s and sets the tempo per chapter so all chapters sound like one take. Delivery tags (`[excited]`, `[curious]`, `[surprised]`, `[whispers]` …), **no whispering in the hook** |
| Words      | **1.700–1.950** in total; hook 70–85, chapters 170–330 each, finale 100–150                                                                                                                                                                                                                                                                                                                                                                    |
| Structure  | Hook 0:00–0:30 → **6–9 chapters à 60–120 s** (mini-hook question, one core idea, mini-resolution, open question into the next) → re-hook at ~50–60 % → finale: answer + „Übrigens“ + CTA → 20-s end screen (`references/aufbau.md`)                                                                                                                                                                                                            |
| Language   | Du-Form, cheeky friend, simple: one core idea per chapter, everyday comparisons, ≤ 2 terms per chapter, no filler words — TikTok `script-formel.md` sentence rules                                                                                                                                                                                                                                                                             |
| CTA        | Only at the end (finale's last line): comment question + „Schreib's in die Kommentare.“ + pointer to the next video + **„Folge für mehr Wissen.“** (quick). No intro, no greeting, no logo, no "Abonniert" at the start; no other word starting with "folg"                                                                                                                                                                                    |
| Look       | TikTok look (`bau-erklaervideo/references/visual-style.md`): realistic diorama, `real.*` materials, rounded edges, depth of field, a new world per topic, name tags, sound effects, **no music**. 16:9 layout + camera: `references/bild-16-9.md`                                                                                                                                                                                              |
| Captions   | **2–4 words per line, bottom centre**, keywords `*Wort*` yellow (≈ one every 15–20 s)                                                                                                                                                                                                                                                                                                                                                          |
| Packaging  | Title ≤ 60 chars (search word first), **3 thumbnails** 1280×720 (Test & Compare), description with **chapter marks**, tags, settings, a pinned comment — fixed **before** the script (`references/verpackung.md`)                                                                                                                                                                                                                              |
| Production | `youtube/<slug>/kapitel/NN-name/` = one composition each; `render-queue.sh` renders them one after the other (detached, ~4 s/frame → ≈ 20–25 h for 12 min); `join-chapters.sh` joins without re-encoding the picture, -14 LUFS                                                                                                                                                                                                                 |
| Progress   | `youtube/<slug>/fortschritt.md` — so a new chat can continue (step „Weitermachen“)                                                                                                                                                                                                                                                                                                                                                             |
| Logs       | `youtube/serie.md` (finished videos), `youtube/lernlog.md` (CTR, 30-s retention, average view duration, drop-off points → rules)                                                                                                                                                                                                                                                                                                               |
| Topics     | `references/themen.md` (scorecard, duplicate check, reservation)                                                                                                                                                                                                                                                                                                                                                                               |

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
render queue / joining / delivery). Don't redo finished chapters.

### 0. Topic — reserve it FIRST

`git pull origin main`. Follow `references/themen.md`: duplicate check
(`youtube/serie.md`, `youtube/*`, the Reserviert table, remote branches),
the scorecard (incl. **fact inventory ≥ 15** and **thumbnail test**),
take the best (≥ 12/16) — a strong TikTok topic as the long version is a
good choice. **Reserve it immediately**: row in Reserviert, commit, push on
`main` (rejected → pull, re-check, push). Then name the chat
**`YouTube #<Nr>: <Thema>`** (Nr = rows in `youtube/serie.md` + reserved
rows + 1; `set_session_title` via ToolSearch
`select:mcp__claude-code-remote__get_session,mcp__claude-code-remote__set_session_title`,
else ask the user to rename it in the first line) and post one line:
„Reserviert: YouTube #2 Mond-Crash. Du kannst schon den nächsten Chat
starten.“

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
contrast — moment, camera, ≤ 3 words, layout), the main question, the
search word. The hook will prove exactly this promise in 0–10 s.

### 3. Script — the whole video, then self-check

Write all chapters with `references/aufbau.md` (and the TikTok
`script-formel.md` for the sentence-level rules — hook lab, banned
phrases, keywords, delivery tags, no filler words, humour). Fill the
chapter table + loop map + re-hook + money shots in `plan.md`. Count the
words (1.700–1.950). Run the self-check in `aufbau.md` and fix every point
— you are the only reviewer. Each chapter's `script.txt`: one part per
line, keywords `*Wort*`, delivery tags inline, a normal chapter's **last
line = the open question**, the finale's last line = the CTA line.

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

1. **`script.txt`** + **`assets/kapitel.js`**: `titel` (short, curious —
   also the YouTube chapter name), `frage` (≤ 7 words, keyword in `<em>`),
   `antwort` (the word that answers it), chapter 0: `hookTitel` (2–3
   words). Then `node scripts/fake-words.mjs && node scripts/build-sfx.mjs
&& node scripts/sync-html.mjs` (estimated timings; read its warnings).
2. **Voice** (as TikTok step 3): the chapter's `script.txt` joined to one
   paragraph, every `*` removed, tags kept → `creative_generate_speech`
   (Jan, `eleven_v3`, `generations_count: 1`) → poll → `curl` to
   `assets/vo_takes/main.mp3` right away. 429 on the first try → short
   pieces (TikTok Gotchas „ElevenLabs 429“, `scripts/join-voice.sh`). Then:
   ```bash
   bash scripts/prepare-voice.sh       # pauses 0.2 s, tempo → 2.8 words/s, -14 LUFS
   python3 -I scripts/align-words.py   # Whisper timings + caption flags → assets/words.js
   node scripts/build-sfx.mjs && node scripts/sync-html.mjs
   ```
   (`pip install faster-whisper` once per container.)
3. **Scene** (`assets/scene.js` + `assets/beats.js`, TikTok `scene-api.md`):
   the subject in the realistic finish, beats anchored on spoken words
   (`W("Wort", n)`), shots for 16:9 (`bild-16-9.md` „Camera“: a change every
   8–20 s, a money shot every 2–3 min), 1–3 labels, highlights, own sounds
   only where they fit. The hook chapter follows TikTok's „first 3
   seconds“ rules; the finale's last shot is the calm, moving end-screen
   picture (`kapitel-template/demo-ende/` is the pattern).
4. **Check**: `npx --yes hyperframes@0.8.181 lint` (0 errors), then a
   contact sheet: `npx --yes hyperframes@0.8.181 snapshot --at <one time per
shot> --no-end --describe false -o <scratch>` — subject readable,
   captions free, tags on their parts, nothing written in the end-screen
   band of the finale's last 20 s. Hook chapter: snapshot 0, 0.5, 1, 1.5, 2,
   3, 10, 20, 29 s against the hook rules. 2–3 fix rounds.

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
Watch it honestly as a stranger: contact sheet every ~30 s + the hook frames
— would I stay after 30 s? Is there a change every 8–20 s? Fix before
sending.

Thumbnails (any chapter's folder, the moments from `plan.md`):

```bash
bash scripts/make-thumbnail.sh <s> "<TEXT mit <em>Wort</em>>" <links|rechts|oben|unten> a ['{"p":[x,y,z],"l":[x,y,z]}']
```

→ copy `renders/thumb-{a,b,c}.png` to `youtube/<slug>/`, phone test at
246×138. Write `youtube/<slug>/upload.txt` (`references/verpackung.md`:
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
- **Same "Folge" rule as TikTok:** the subscribe pill keys on the first
  "folg…" word of the finale's last line; `sync-html.mjs` warns about any
  other. Write „Konsequenz“, „danach“, „Schritt“ instead of „Folge“.
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
- **Thumbnail text** is uppercase 176 px at 1920 → ~117 px at 1280: more
  than 3 words or long words won't fit — shorten, never shrink.
