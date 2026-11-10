---
name: bau-erklaervideo
description: 'Make the next video of the German TikTok series "Du hast gerade X gebaut" (9:16, exactly 45 s) in two formats that always take turns: A = how an everyday thing works, built up piece by piece in x-ray; B = "Was passiert, wenn …?", a scenario people always wondered about played out as a chain of consequences (references/format-was-passiert.md). House style: toy-like low-poly 3D diorama in a new world built for every topic, name tags with arrows, one-word captions with yellow punch-in keywords, sound effects, ElevenLabs voice "Jan – Social Media Creator" (eleven_v3), retention-first script (hook + on-screen title, open loop, payoff, "Übrigens" bonus fact, comment + follow CTA, no loop), plus a cover image and a keyword description with 3–5 fitting hashtags. Claude picks the format and the topic itself (references/themen.md, never one already done). Use whenever the user asks for "noch so ein Video", "neues Video", "wie funktioniert X", "was passiert, wenn …", "mach das nächste Video" or names a topic.'
---

# Bau-Erklärvideo (TikTok series)

One video = one topic, in one of **two formats that always alternate**
(step 0): **A „Bauen“** — the thing is built up piece by piece (this
file, `references/script-formel.md`) — and **B „Was passiert, wenn …?“**
— a scenario played out with its consequences
(`references/format-was-passiert.md`, which lists only what differs from
A; the hook starts straight with the act — „Was passiert, wenn …?“ is
the idea, never spoken since 2026-10-29). Voice, look and structure stay; the script (incl.
hook title and a topic-specific CTA question), the 3D subject and its story
beats change every time. The script is what makes people stay — write it
with `references/script-formel.md` (v2) and treat its self-check as a gate. The reference build is
`tiktok/kuehlschrank/` (fridge) — read its `assets/scene.js` before building
a new subject; it shows every technique at full size.

Talk to the user in German. Keep them posted in short lines while working.

## Fixed house settings

| What         | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Format       | 1080×1920, 30 fps, **exactly 45.0 s** (user's rule, 2026-10-28; 60 s from 2026-10-24 to -27) — `prepare-voice.sh` fits the speech, the composition is fixed at 45 s (`LENGTH` in timing.js)                                                                                                                                                                                                                                                                                                                                                          |
| Voice        | ElevenLabs **Jan – Social Media Creator**, `voice_id keqaIOtp0ePlmN5jgQfy`, model **`eleven_v3`** — the house voice; **always use Jan**, always **3.1 words/s** — ~15 % faster than he reads (`prepare-voice.sh` `BASE=1.15`, pitch kept — user's wish 2026-10-26) (user's decision 2026-10-22 after trying Stephan on #7: back to Jan for #7 and every episode after). Don't switch voices unless the user asks. History: Christian Plasa (#1–#5), Jan (#6 →), Stephan – Warm and Friendly `IWm8DnJ4NGjFI7QAM5lM` tried once on #7, replaced by Jan |
| CTA          | **Never dropped or shortened** (user's rule), **split** (since 2026-11-01): **„Folge für mehr Wissen.“ is its own line in the middle (~19–23 s)** — red "+ Folgen" pill low on screen, tapped → "Gefolgt"; **the last line is the comment question**, new for every video, tied to the topic, + „Schreib's in die Kommentare.“ — white "Kommentieren" pill (user's swap, 2026-11-04; 2026-11-01 to -03 it was the other way round) (script-formel.md §4)                                                                                             |
| Bonus fact   | "Übrigens: …" right after the payoff — one surprising fact; "WUSSTEST DU?" badge + sparkle sound (automatic on the word "Übrigens")                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Ending       | **No loop** (2026-10-24), **no outro** (2026-11-01): the video ends ~0.7 s after the comment question — no calm drone pull-back, no `> …` line, no cut back to frame 0                                                                                                                                                                                                                                                                                                                                                                               |
| Cover        | **Every video gets a Titelbild** (`scripts/make-cover.sh`): strongest scene moment + big curiosity title, sent with the video                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Beschreibung | **Every video gets a TikTok description** (step 6c): a keyword line **≤ 60 characters, strongest search words first, one emoji at the end, no dash** + **3–5 hashtags that fit the topic and are really watched** (topic tag first; never `#fyp`, `#viral`, `#lernenmittiktok`); saved as `tiktok/<slug>/beschreibung.txt`, sent with the video                                                                                                                                                                                                      |
| YouTube      | **Every video is also posted as a YouTube Short** (2026-11-05, step 6d): `tiktok/<slug>/youtube.txt` with title (40–60 characters, keywords first, always ending in `#shorts`), description (+ „Folge für mehr Wissen.“ + 3–5 hashtags incl. `#shorts`), tags, and the upload settings (TikTok cover, not for kids, synthetic content: yes, category Bildung …; no playlist), sent with the video like the TikTok description                                                                                                                        |
| Serienformat | **Always alternating A „Bauen“ ↔ B „Was passiert, wenn …?“** (user's rule, 2026-10-23) — step 0; logged in the `Format` column of `tiktok/serie.md`                                                                                                                                                                                                                                                                                                                                                                                                  |
| Audience     | 77 % aged 18–34, half women, > 93 % AT/CH/DE, mostly random scrollers (TikTok data 2026-10-23): topics from _their_ day (`references/themen.md` ★), cheeky-friend tone, frame 0 for people with no tech interest — sound on frame 0, 2–3 huge words, the viewer's hand doing the thing                                                                                                                                                                                                                                                               |
| Payoff       | The hook's question answered in one punchy line (the on-screen question fades out). **No "Schau dich an. Du hast gerade X gebaut."** — dropped by the user 2026-10-23, never use it again                                                                                                                                                                                                                                                                                                                                                            |
| Music        | **No music** (user's rule, 2026-10-26): voice + sound effects only. Don't run `prepare-music.sh`, no `assets/bgm.mp3` (sync-html only adds a music tag if that file exists). The old calm bed stays in `assets/` for old episodes                                                                                                                                                                                                                                                                                                                    |
| Setting      | **No fixed environments — a new, high-quality world for every video** (step 1b): own place, light, props, hero piece, life in `assets/set.js`; log it in `tiktok/serie.md`                                                                                                                                                                                                                                                                                                                                                                           |
| Sound FX     | Synthesized house kit (`scripts/make-sfx.py`, no samples): whoosh on every cut, hit on the hook title, punch on highlighted words, blip per label, payoff ding, CTA pops + click. Placed from `assets/beats.js` by `scripts/build-sfx.mjs` → `assets/sfx.mp3`                                                                                                                                                                                                                                                                                        |
| Keywords     | `*Wort*` in `script.txt` → caption yellow + bigger + pops, camera punch-in, punch sound. ~1 per sentence, 8–12 per video                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Labels       | Name tag + yellow arrow on a part when its term is spoken (`LABELS` in `beats.js`), every technical term + key parts                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Highlights   | Every 5–7 s a big moment (`HIGHLIGHTS`: slowmo, shake, flash, crash zoom, whip pan) + 2–3 money shots that **show** the spectacular claims; voice with 3–6 delivery tags (`[excited]`, `[whispers]` …)                                                                                                                                                                                                                                                                                                                                               |
| Learning log | `tiktok/lernlog.md`: read before every video, update after the user reports numbers / feedback                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Look         | `references/visual-style.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Script       | `references/script-formel.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Scene code   | `references/scene-api.md` (world.js API)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

## Workflow

### Autopilot — no questions, no waiting (user's rule, 2026-11-10)

The user starts a video chat and wants the finished video back **without
confirming anything**. So the whole workflow below runs straight through:
pick format and topic yourself, **reserve the topic as the very first
thing** (so the user can open the next chat right away), write and
self-check the script, voice, world, scene, render, cover, descriptions,
save — and only then talk to the user, with the delivery message. Never
end a turn with a question or "Soll ich …?"; where the steps below once
said "show the user" or "wait for OK", decide with the skill's rules and
go on. Short status lines while working are fine (what you picked, what
you are building), but they never wait for an answer.

Stop and ask only when you truly cannot go on: no ElevenLabs access or no
credits, a push that keeps failing, a broken tool you cannot work around.
If the user names a topic or gives an instruction, take it.

### 0. Pick the format — always alternating — then the topic — reserve it FIRST

**Format first** (user's rule, 2026-10-23: "Immer abwechselnd"). After
`git pull origin main`, look at the newest episode: the last row of
`tiktok/serie.md` **and** the **Reserviert** table in
`references/themen.md` (a parallel chat may already have taken the next
slot) — the newest of them by number / date decides. The new video takes
the **other** format: after A „Bauen“ comes B „Was passiert, wenn …?“,
after B comes A. A row without a `Format` value counts as A (#1–#23 are
all A). Say it in the reservation line ("Diesmal Format B: Was passiert,
wenn …?"). If the user explicitly asks for a format or names a topic
that only fits one, take theirs — the next video goes on alternating
from it.

**Then the topic** — the user leaves it to you (2026-10-23). **Topical
when it fits** (2026-10-26): run the Trend-Check in `themen.md` 2b — a
real trend of this week gives a bonus (a season does not), at most one of
the three candidates you compare is topical, the three come from different categories,
and never a weak topic just to be current. Follow
`references/themen.md`: **duplicate check first** (`tiktok/serie.md`,
every folder in `tiktok/`, the reserved list, remote branches), then pick
**yourself** the best open topic **of that format's list** by its criteria (format A
also takes **Detail-Rätsel** — one small odd detail everyone has seen —
and **Dein Look & dein Hobby** — the science behind what viewers show
off, `themen.md`). The scorecard rates the **sweet spot** (one concrete
thing of a huge group — not too broad, not too niche) and the
**Zeig-Faktor** (can viewers post a photo of their own?) — take the
highest score, no proposal, no alternatives to choose from.

**Reserve it immediately — the first commit of the chat**, before the
learning log, the script or anything else (the user opens the next video
chat as soon as this one has reserved, 2026-11-10): add the row to the
**Reserviert** table in `themen.md` (with the chat title of 0a), commit

- push on `main` right away (parallel chats! on a rejected push: pull,
  re-check that nobody took the topic or the number meanwhile, push
  again). Then rename the chat (0a) and post one short line, e.g.
  „Reserviert: TikTok #63 Sneaker (Format A). Du kannst schon den nächsten
  Chat starten.“ — and go on without waiting. If the user names a topic,
  take theirs — still run the duplicate check and mention it in that line
  if it was done before.

### 0a. Name the chat — "TikTok #<Nr>: <Thema>"

The user wants every video chat named the same way (2026-11-05):
**`TikTok #<Nr>: <Thema>`**, e.g. `TikTok #48: Touchscreen`,
`TikTok #24: Erde hört auf, sich zu drehen`. Thema = the short name
people search for (1–4 words, German, umlauts as ä/ö/ü). **Nr** = the
episode number: the highest `#` in `tiktok/serie.md` + 1, plus one for
every older row of the **Reserviert** table in `themen.md` that is not in
`serie.md` yet (parallel chats). Put the same title in the `Chat` column
of your reservation. As soon as the topic is reserved — before the
script — rename the chat:

- If `set_session_title` is available (claude-code-remote tools; check
  with ToolSearch `select:mcp__claude-code-remote__get_session,mcp__claude-code-remote__set_session_title`):
  `get_session` without `session_id` gives this chat's id, then
  `set_session_title` with that id and the title.
- Without that tool, the very first line of your reply is: **„Bitte
  benenne diesen Chat in „TikTok #<Nr>: <Thema>“ um.“** — exactly that
  title, so the user can copy it.

When you append the episode to `serie.md` at the end and its number
turned out different (another chat finished first), rename again. If the
topic changes, rename again.

### 0b. Read the learning log first

Open `tiktok/lernlog.md` before writing anything. Every entry under
"Nächstes Mal" that isn't ticked off is a rule for this video, and the
delivery message says which one(s) this video improves. The series gets
better one concrete step per video.

### 1. Script → self-check (no approval round any more)

Format B: write it with `references/format-was-passiert.md` (question
hook, 3 Folgen, outcome as payoff) on top of script-formel.md — same
length, same checks. Format A:
write the German script with `references/script-formel.md` (v2): hook
(+ on-screen hook title), 3 beats with one re-hook, payoff (answers the
hook) + "Übrigens" bonus fact, **„Folge für mehr Wissen.“ as its own line in the middle (~19–23 s)** and the **comment question as the last line** (no loop) — in the **45-second shape** (script-formel.md "Shape": open-loop chain, follow line → mid twist at ~23 s, a "Rate mal" moment). **130–142 words including all of it** (Jan at 3.1 words/s → ~45 s), never more than **148** or fewer than **124**
(`prepare-voice.sh` fits that range to exactly 45 s). **The hook is line 1 of the script, ≤ 9 words / ≤ 3 s** (2026-10-29) — within it the viewer must know why to watch to the end; `sync-html.mjs` warns if the spoken hook runs longer. Run the hook lab and the self-check in that file and fix every point that
fails **before** spending credits — you are the only reviewer now. Plan
for yourself (no need to show it): word count, the **loop map** (which
question is open when), the hook title with its score, the cover title,
and a one-line visual idea per beat **incl. the highlight of each beat**
(money shots, slowmo, flash …). Then go straight on to the world and the
voice. (Until 2026-11-09 the user approved every script; since 2026-11-10
everything runs automatically.)

### 1b. Build the world — a new one for every video

The user's rule (2026-10-24): **there are no fixed environments.** Every
video gets a **new, high-quality world designed for its topic**, in the
same style (low-poly far away, realistic up close — visual-style.md "Realism"), written in the project's `assets/set.js`. The
template's `set.js` is a demo (a town park at blue hour for "Licht aus
Draht") — replace it completely.

1. **Concept — the place.** Where does this thing live, or where does the
   scenario happen, in its most vivid version? Kaffeevollautomat → a
   Viennese café terrace on a sunny morning; Flugzeugtür → the cabin by the
   emergency exit, the window over a sea of clouds; Geldautomat → a narrow
   old-town lane at dusk, wet cobbles; Neutronenstern → a moon base under a
   black sky; Glätteisen → a bathroom shelf with a big mirror. One line,
   specific (place + time of day + 2–3 details). **Never the place of one
   of the last 3 videos** (`tiktok/serie.md`, column `Set`), and no
   generic "park" / "island" when the topic has its own place.
   **Vary the kind of place, not just its name** (user, 2026-11-02: #48
   at a snowy tram stop still looked "like the old environment" —
   grey paving, a row of lit town-house facades, the subject on a
   plinth in the middle, like the videos before). Of the last 3 videos
   at most one may be a street / square / town-house backdrop (Vienna
   included); pick from other kinds: an interior up close (bathroom, car
   inside, cinema seat, gym, kids' room), nature (forest, lake, mountain,
   beach, field), an extreme place (cockpit, deep sea, desert, glacier,
   space), a giant-scale world (inside a pocket, a desk seen as a
   landscape). Also a different ground colour, time of day and camera
   height than the last video.
   **No stage, no plinth.** The subject never stands on a pedestal,
   podium, plinth or round floor pad in the middle of an empty area —
   that is the old look. It sits where it really lives in that place
   (the phone in a gloved hand at the bench, the hair dryer on the
   shelf, the can in the cinema seat's cup holder), scaled up if needed
   but built into the scene, with world objects in front of it
   (foreground layer) and behind it in most shots.
2. **Light + palette.** An own sky (`setSky({ ...SKIES.morgen, top: … })`
   or a fully own palette, `sunDir`, `keyPos`, `fog`), a time of day that
   carries the mood, and one accent colour the subject stands out from.
   **Or a dark stage** (learned from successful videos, 2026-10-24):
   `setSky(SKIES.studio)` + `darkStage({ accent })` — near-black, a warm
   spotlight on the subject, a neon rim, a glossy floor, dust in the light;
   one subject and two or three objects instead of a full world. Fits
   technical, mysterious, night and "invisible" topics (Blitzer, Face ID,
   Strahlung, Tiefsee). Alternate it with bright worlds; the quality bar
   of step 4 still applies (light, depth, life).
3. **Build it in layers** (all in `set.js`):
   - **Ground** — `terrain()` with its own relief and patches, or an own
     floor (tiles, planks, deck, worktop); `pathStrip`, `pond`, `sea`
     where they fit.
   - **Near ring** (r ≈ 6–14) — 5–12 props that tell the topic at a
     glance (`props.js`, or built in the same style: faceted `F()`,
     `flat()` colours, rounded by facets not by smooth spheres).
   - **One hero piece** behind the stage (z < −8) — the big thing the
     place is recognised by (the café's awning front, the airport tower,
     the launch pad, the shipwreck, the ski lift).
   - **Far layer** — skyline, hills, mountains, tree line, the Earth … so
     the horizon is never empty.
   - **Life** — at least 2 things that move: sway, smoke, water, birds,
     fireflies, a passing tram, steam, snow, drifting particles.
   - `finishSet({ ground })` last (the sky light).
4. **Quality bar — check before building the subject.** Snapshot the set
   from 4 cameras (`window.__cam = { p: [x, y, z], l: [x, y, z] }` overrides
   the shot camera — wide `[10, 6.5, 15]→[0, 1.2, -2]`, low
   `[4.5, 1.6, 7]→[0, 1.4, -4]`, top `[0, 22, 20]→[0, 0, -4]`, and the hook
   shot) and fix until: no big empty flat area, facets + colour patches on
   every large surface, ≥ 3 depth layers, light and palette fit the mood,
   nothing on the stage (`place()` warns) or tall on the outro line
   (x ≈ 0.6·z in front), and it reads as _that_ place in one glance.
   **Then the "same as before?" test:** put one wide frame of this set
   next to one of each of the last 3 videos (snapshot their folders) — if
   ground, backdrop and layout look alike, change the kind of place, not
   only details.
5. **Reuse, don't repeat.** The kit (`environments.js`: `setSky`,
   `SKIES`, `terrain`, `discGeo`, `pathStrip`, `pond`, `sea`, `meadow`,
   `tree`, `pine`, `rocks`, `car`, `cloudPuffs`, `birds`, `lightString`,
   `fireflies`, `darkStage`, `F`, `add`, `finishSet`) and `props.js` are the building
   blocks. `references/set-beispiele.js` holds nine complete earlier sets
   (floating island, town square with shops, beach with moving sea, snowy
   village with chimney smoke, farm, moon rock with the Earth, deep sea,
   cloud sea, kitchen worktop) — a cookbook to copy techniques and pieces
   from, **never a whole set unchanged**.
6. **Log.** The delivery message gets one line "Bühnenbild:
   …" (place, light, hero piece, 2–3 props). After the video, log the
   set in `tiktok/serie.md` (`Set` = 2–4 words, `Licht` = time of day).

If a piece will be useful again (a tram, a café front, a rocket), add it
to `props.js` or the kit in the skill's template — in the same quality.

### 2. Scaffold the project

```bash
bash .claude/skills/bau-erklaervideo/scripts/new-video.sh <slug> "So funktioniert <X>"
```

Creates `tiktok/<slug>/` with the shared `assets/world.js` + the set kit (`assets/environments.js`, `assets/props.js`) + a demo `assets/set.js` (to be replaced, step 1b), captions, hook title and CTA buttons in `index.html`,
the sound-effect
kit (`assets/sfx/`, git-ignored, regenerated on demand), helper scripts, and a small demo
(`assets/scene.js` + `assets/beats.js`, candle → light bulb) that already
renders with labels and sound. Write the approved script into
`script.txt` — one part per line, **„Folge für mehr Wissen.“ on its own
line in the middle**, **the last line = the comment question** (no `> …`
loop line),
**keywords marked `*Wort*`** — and put the hook
title (**2–3 words**) into `<div id="hook-title">` in `index.html` (keyword in `<em>`),
and fill the `hf-config` block next to it: `question` (the hook's open
question, ≤ 6 words) and `answer` (the spoken word that answers it, in the
payoff) — they drive the question text at the top. \*\*No progress bar, no
`steps`\*\* (it looked like an ad, 2026-10-23).
Then run `node scripts/fake-words.mjs && node scripts/build-sfx.mjs && node scripts/sync-html.mjs`
for estimated timings so the scene can be built before the voice exists.

### 3. Voice (ElevenLabs connector)

Generate the **whole script including the CTA line** (script.txt joined to
one paragraph, **with every `*` removed** (and a leading `>` in old
scripts) — the marks are for the captions; the voice would read or
stress them oddly; the `[excited]` / `[whispers]` delivery tags **stay**,
eleven_v3 performs them) with `creative_generate_speech`: `voice_id
keqaIOtp0ePlmN5jgQfy` (Jan), `model_id eleven_v3`,
**`generations_count: 1`** (the account hits 429 concurrency limits with
more; a 429 means nothing was generated or charged — retry once with 1).
Cost ≈ 800 credits (~0.08 $). Refused with 429 on the first try → short pieces, see Gotchas. Poll `creative_get_flow_run_status` (it can
take 1–3 min; wait with a background `sleep 40`, not a foreground sleep),
then download `content_url` right away (expires after 2 h):

```bash
curl -sS -o tiktok/<slug>/assets/vo_takes/main.mp3 "<content_url>"
```

No connector? `ELEVENLABS_API_KEY=… node scripts/tts.mjs` writes the same
file (the key must come from the environment's secrets, never the chat).

Then, in the project dir:

```bash
bash scripts/prepare-voice.sh          # tighten pauses, Jan +15 % (3.1 words/s), fit to exactly 45 s → assets/voiceover.mp3
python3 -I scripts/align-words.py      # Whisper word timings snapped onto script.txt → assets/words.js
node scripts/build-sfx.mjs             # all sound effects on one track from beats.js → assets/sfx.mp3
node scripts/sync-html.mjs             # root duration, caption length, the <audio> tags (vo + sfx; no music)
```

`align-words.py` needs `pip install faster-whisper` (downloads the `small`
model once). `prepare-voice.sh` speeds Jan up by a fixed 15 % (pitch
kept, 3.1 words/s) and fits the take to exactly 45 s (speech ends at
44.3 s, ~0.7 s before the end: ≤ 6 % more speed or pauses stretched to ≤ 0.45 s). If it
stops, it says how many words to cut or add — adjust the script with the
user (cut a weak sentence / add a "Rate mal" moment or one more strange
fact) and regenerate the voice; never pad with silence or music.
**No music** (2026-10-26) — don't run `prepare-music.sh`. Effects too loud / quiet:
`SFX_DB=-3 node scripts/build-sfx.mjs` (shifts all), or `db:` on one cue.

### 4. Build the subject (`assets/scene.js` + `assets/beats.js`)

**Realistic finish** (user, 2026-11-06): the subject and everything near
the camera are built with `real.*` materials, `roundedBox()` and smooth
geometry, real colours, true scale and 3–6 small surface details —
`references/visual-style.md` "Realism". The low-poly facets stay for the
far world only.

Format B has no build-up from parts: the scenario plays out in one
diorama, the viewer's hand does the act from frame 0, every Folge is a
visible change (`references/format-was-passiert.md` "Picture"). Format A:
follow `references/scene-api.md`. Build the world first (step 1b,
`assets/set.js`), then rebuild the demo file around the new
subject: hook visual (the strange thing the hook names — mid-action from
frame 1, or the primitive version that fails) → subject pops in when the
build starts → each component
appears/animates on the word that names it → x-ray while explaining → one
analogy mini-set per 1–2 beats → LED panel facts → outro x-ray off + drone
pull-back. Anchor every beat on a spoken word with `W("Wort", n)`; never
hard-code seconds.

**Device-style displays** (`assets/hud.js`, learned from successful
videos 2026-10-24): when the topic has a "screen" of its own, show the
information the way the machine would — `viewfinder` (camera frame,
"CAM A · INFRARED"), `gauge` (speedometer / pressure), `stopwatch`,
`counter` (a number that ticks up: "Paletten 33"), `readout`, `meter`.
Max 2 at once, called every frame from `renderAt` with a `pop()`
visibility, placed clear of captions and the question text. The LED panel
stays for single facts without a device.

All timing data lives in `assets/beats.js` (plain data, read by the scene
**and** by `build-sfx.mjs`): `T` (anchors), `shots`, `LABELS` (a tag +
arrow for every technical term and key part, from the word that names it,
~2.5 s) and `SFX` (the scene's
own sounds: `pop` when the subject or a part pops in, `zisch` for gas /
steam, `brumm` for motors / compressors, `surr` for current / heat,
`rauschen` for air / water, `klack` for latches / brakes, `click` for
switches, `piep` for an alarm beep (T3 pattern), `geiger` for a Geiger-counter
crackle / anything radioactive). Rerun `node scripts/build-sfx.mjs && node scripts/sync-html.mjs` after changing beats.

#### The video's own sounds (freedom per topic)

The house kit stays in every video (whooshes, pops, dings, CTA clicks …).
On top, a video **may** get 1–3 sounds of its own — **only where it really fits**: the topic has a characteristic, recognisable sound and the picture shows the thing making it right then. **None is fine and often right**; never invent a sound for something silent or just to have one. Examples of a good fit: popcorn popping, a smoke alarm
shrieking, coins rattling in an ATM, a lighter's spark click, ice
cracking, a car engine roaring. Plan them with the visual plan (name them
in your plan, or "keine eigenen Sounds" when nothing fits) and put them where the picture shows the thing.
They are **synthesized, free — like the house kit** (user's decision
2026-10-23: no ElevenLabs sound effects): write them in
`scripts/sfx-extra.py` with the kit's own helpers (`t_of noise sine svf
env write rng np`, see the example in the file). `build-sfx.mjs` runs it
every time; each `write("popcorn", …)` becomes
`assets/sfx-extra/popcorn.wav`, used in `SFX` like any kit sound
(`{ s: "popcorn", at: T.platzt, db: -10 }`). Build them from the physics
of the real sound: a pop = short noise burst + falling pitch, an alarm =
a gated high sine in its real pattern, coins = several bright metallic
partials with fast decay, an engine = low saw/harmonics with a pitch
that follows the speed. Only if the user hands over a sound file
themselves: `bash scripts/add-sfx.sh <name> <file>` (trims, mono, peak
−3 dBFS like the kit).

Rules: names must differ from the house sounds (build-sfx stops on a
clash), own sounds default to −12 dB (set `db` per cue), max ~1 own sound
every 3 s so they stay special, and they never cover the voice. A
self-made sound that turns out generally useful (like `piep` and `geiger`
from the Rauchmelder episode) can be promoted into the house kit
(`template/scripts/make-sfx.py`) in the skill chat.

### 5. Check

```bash
npx hyperframes lint                    # must be 0 errors
npx hyperframes snapshot --at <t1,t2,…> --no-end --describe false -o <scratch dir>
```

**First the opening:** snapshot 0, 0.5, 1, 1.5, 2, 3 s and check it
against "The first 3 seconds" in `references/visual-style.md` (title on
frame 0, motion, spectacle within 1 s, first cut ≤ 1.5 s, no x-ray, every
image different). Fix that before anything else — most viewers decide
there. Then snapshot one time per shot (word start + 0.3 s) and look at the contact
sheet: subject readable and not cropped, captions not hidden, nothing
blocking the camera (trees!), panel legible, x-ray actually see-through,
every label's arrow touching its part and the tag not covering the
subject.
Read `assets/sfx-cues.json` once: one whoosh per cut, nothing stacked
within ~0.15 s except a cut + its highlight.
Fix and re-snapshot. Expect 2–3 rounds.

### 6. Render and deliver

```bash
# ~1.5 h for 45 s (full 1080p + AO, software WebGL, ~4 s/frame) — ALWAYS detached (see Gotchas "Render detached"):
HYPERFRAMES_RENDER_DETACHED=1 setsid nohup npx hyperframes render -o renders/<slug>.mp4 > /tmp/render.log 2>&1 < /dev/null & disown
tail --pid=$(pgrep -f "hyperframes render -o renders/<slug>.mp4" | head -1) -f /dev/null   # run_in_background: notifies when done
bash scripts/finish-audio.sh renders/<slug>.mp4   # -> renders/<slug>-final.mp4 at -14 LUFS (picture untouched)
ffprobe -v error -show_entries stream=codec_type,duration -of compact renders/<slug>-final.mp4
```

The render's mixer drops voice + music to ≈ -18 LUFS; `finish-audio.sh`
brings it back to -14 LUFS. Confirm exactly one audio stream and **45.0 s**, then send **`<slug>-final.mp4`** with `SendUserFile`
(display `render`) **together with the cover** (6b) **and the description** (6c).
Before sending, watch it honestly as a stranger would (contact sheet every
3 s + the hook frames): Would I stop scrolling in the first 2 s? Is there
a highlight every 5–7 s? Is anything smeared, tiny or monotone? Fix
before sending, not after. Append the episode to `tiktok/serie.md` (with its `Format`, A or B, its `Set` and `Licht`).

### 6b. Titelbild (cover) — every video

Always make a cover and send it with the video. Pick the strongest
moment of the scene (subject big, in x-ray / glowing / mid-action, the
shot well framed — snapshot a few candidates) and a **cover title**:
2–5 words, curiosity not explanation, one keyword in `<em>` (yellow),
different wording from the hook title (e.g. hook title "Dein Kühlschrank
<em>lügt</em>" → cover "Er <em>klaut</em> Wärme!?"). Then:

```bash
bash scripts/make-cover.sh <seconds> "Er <em>klaut</em> Wärme!?"   # -> renders/<slug>-cover.png
```

Look at it before sending: title readable on a phone thumbnail, the
title and subject inside the middle 3:4 (TikTok crops the profile grid
to y ≈ 240–1680), subject not hidden by the title. Send
`renders/<slug>-cover.png` with the video and tell the user to pick it
as the Titelbild when posting. Commit it (`tiktok/**/*.png` is LFS;
`renders/` is git-ignored, so copy it to `tiktok/<slug>/cover.png`).

### 6c. Beschreibung (TikTok description) — every video

**A short keyword line with one emoji at the end + 3–5 good hashtags**
(user's rules 2026-10-23, 2026-10-27; hashtags back since 2026-10-27).
TikTok sorts videos by what is said, shown and written — the description
hands it the **exact words people search for**, the hashtags put the video
into the feeds of people who follow that topic. Save it as
`tiktok/<slug>/beschreibung.txt` and put it **in the delivery message as
a copy-paste block** (with the video and the cover).

**Line 1 — the keyword line**

- **≤ 60 characters** including the emoji — one short line, no full
  sentence needed.
- **2–3 strong keywords, the strongest first:** the thing's most-searched
  name + what people type about it ("Flugzeugtür öffnen", "Kühlschrank
  Funktion", "Falschgeld erkennen", "Blitzer Abschnittskontrolle").
  Plain nouns and verbs, no filler ("So", "Wusstest du", "krass").
- **Exactly one emoji, at the very end of the line**, that fits the topic
  (✈️ 🧊 💶 ⚡).
- **No dash**: no Gedankenstrich „–“ / „—“ and no „ - “ — use a colon or
  just the words.
- Not a copy of the spoken hook or the cover title. No "Folg mir", no
  question list.

**Line 2 — 3–5 hashtags that fit this topic and are really watched**

1. **1–2 topic tags first** — the thing itself, spelled the way people
   type it, umlauts included: `#taschenwärmer`, `#kühlschrank`,
   `#faceid`, `#flugzeug`, `#blitzer`.
2. **1 field tag with a big German-speaking audience** that matches:
   `#physik`, `#technik`, `#chemie`, `#wissenschaft`, `#handy`, `#auto`,
   `#weltall`, `#küche`.
3. **Optional 1 broad knowledge tag:** `#wissen` or `#wusstestdu`
   (alternate them).
4. **Check that they are watched:** when web search is available, look up
   the tags (TikTok tag page / search: views or post count) and swap a
   tag with few views for a bigger fitting one; prefer the German tag
   over the English one when our viewers would type it.
5. **Never:** `#fyp`, `#foryou`, `#viral`, `#fy` and other empty reach
   tags; `#lernenmittiktok` (pulls a school audience — dropped
   2026-10-23); our own series tag (nobody searches it); tags that don't
   match the video (TikTok then shows it to the wrong people — the 0.1 s
   swipes).

Examples:

```text
Flugzeugtür im Flug öffnen: geht das? ✈️
#flugzeug #fliegen #physik #wissen
```

```text
Taschenwärmer: flüssiges Salz wird heiß 🔥
#taschenwärmer #winter #chemie #wusstestdu
```

```text
Geldautomat erkennt Falschgeld in 1 Sekunde 💶
#geldautomat #falschgeld #technik #wissen
```

### 6d. YouTube Shorts — upload details, every video

The user also posts every video as a **YouTube Short** (2026-11-05). So
every finished video gets, next to `beschreibung.txt`, a
**`tiktok/<slug>/youtube.txt`** with all the fields YouTube asks for,
and it goes **into the delivery message as one code block per field** (see below), right
after the TikTok description. The same video file and `cover.png` are
used (9:16, 45 s, so YouTube files it as a Short on its own).

Fields, in the order YouTube asks for them:

1. **Titel** (required, max 100 characters; **aim for 40–60 before the
   tag**, phones cut it off around 50): the most-searched words first,
   then the hook as a curiosity gap, German, max one emoji, no clickbait
   the video doesn't answer, and **always ` #shorts` at the very end**
   (user's rule, 2026-11-10 — the only hashtag in the title). Unlike
   TikTok, YouTube search leans hard on the title, so it must name the
   thing exactly ("Warum Flugzeugtüren im Flug nicht aufgehen ✈️ #shorts",
   "Taschenwärmer: Warum flüssiges Salz heiß wird #shorts").
2. **Beschreibung** (max 5,000 characters; only the first ~100 show
   before "mehr"):
   - Line 1–2: one or two plain sentences with the main keywords and what
     the video answers (no spoiler of the payoff).
   - Line 3: „Folge für mehr Wissen.“ (the channel's ask, same wording).
   - Last line: **3–5 hashtags**, the topic tags of `beschreibung.txt`
     plus `#shorts` (YouTube shows the first 3 above the title; more
     than 15 makes YouTube ignore all of them). Same never-list as TikTok
     (no `#fyp`, `#viral` …).
3. **Tags** (optional, max 500 characters in total): 6–10 comma-separated
   search words: the thing's names and spellings, common misspellings
   and English names when people search them ("taschenwärmer,
   taschenwaermer, handwärmer, natriumacetat, hand warmer"). YouTube
   says tags matter little — keep them quick.
4. **Titelbild**: the TikTok `cover.png` — no extra thumbnail for
   YouTube (user, 2026-11-05).
5. **Zielgruppe**: „Nein, nicht speziell für Kinder“ (required question —
   our videos are for 18–34; "made for kids" would switch off comments).
6. **Altersbeschränkung**: nein.
7. **Bezahlte Werbung**: nein (tick only if a brand paid for it).
8. **Veränderte oder synthetische Inhalte**: **ja** — the voice is
   AI-generated (ElevenLabs) and narrates like a real person; for
   animated, clearly unreal pictures YouTube only shows the note in the
   expanded description, so it costs nothing and keeps the channel safe.
9. **Sprache**: Deutsch (video language and title/description language).
10. **Kategorie**: Bildung.
11. **Kommentare**: an, sorted by „Top“; **Remixen**: erlauben.
12. **Sichtbarkeit**: Öffentlich (or a time if the user wants to post later).

Format of `youtube.txt` (the file keeps the headings):

```text
TITEL
Warum Flugzeugtüren im Flug nicht aufgehen ✈️ #shorts

BESCHREIBUNG
Kann man die Flugzeugtür mitten im Flug öffnen? Hier siehst du, welche Kraft sie in 10 km Höhe zuhält.
Folge für mehr Wissen.
#flugzeug #fliegen #physik #wissen #shorts

TAGS
flugzeugtür, flugzeug tür öffnen, notausgang flugzeug, kabinendruck, plug door, airplane door

EINSTELLUNGEN
Titelbild: cover.png (das von TikTok) · Nicht für Kinder · Altersbeschränkung: nein · Bezahlte Werbung: nein · Synthetische Inhalte: ja · Sprache: Deutsch · Kategorie: Bildung · Kommentare: an · Remixen: erlauben · Öffentlich
```

**In the delivery message every field is its own code block** (user,
2026-11-10: one tap = one field, nothing to cut apart): a bold label
line, then a code block holding **only the text that goes into that
field** — no heading, no label, no empty lines inside the block. Three
blocks: **Titel**, **Beschreibung** (its 2–3 lines incl. hashtags), **Tags**.
The settings are not copied, so they come as a short bullet list after
the blocks. The TikTok description works the same way: its own block
right before them. Like this:

**TikTok-Beschreibung**

```text
Flugzeugtür im Flug öffnen: geht das? ✈️
#flugzeug #fliegen #physik #wissen
```

**YouTube-Titel**

```text
Warum Flugzeugtüren im Flug nicht aufgehen ✈️ #shorts
```

**YouTube-Beschreibung**

```text
Kann man die Flugzeugtür mitten im Flug öffnen? Hier siehst du, welche Kraft sie in 10 km Höhe zuhält.
Folge für mehr Wissen.
#flugzeug #fliegen #physik #wissen #shorts
```

**YouTube-Tags**

```text
flugzeugtür, flugzeug tür öffnen, notausgang flugzeug, kabinendruck, plug door, airplane door
```

**YouTube-Einstellungen:** Titelbild = TikTok-Cover · nicht für Kinder · Altersbeschränkung nein · bezahlte Werbung nein · synthetische Inhalte ja · Deutsch · Bildung · Kommentare an · Remixen erlauben · öffentlich

### 6e. Ask for the numbers — learning log

In the delivery message ask the user to tell you, 1–2 days after posting:
views, average watch time / % watched to the end, likes, comments, and
any feedback they got — for TikTok and, when posted, for YouTube Shorts. When they do, add the episode to
`tiktok/lernlog.md` (numbers, what worked, what didn't, and **one**
concrete "Nächstes Mal" item), turn lasting lessons into rules in this
skill, and commit both on `main`.

### 7. Save — always on `main`

Commit `tiktok/<slug>/` (incl. `cover.png`, `beschreibung.txt` and `youtube.txt`) and `tiktok/serie.md` **directly on `main`**
(`git pull origin main` first) and push. Same for any change to this
skill. Other chats start on `main`: an episode or skill change left on a
side branch is invisible to them (the music bed once sat on a branch for
a whole episode and the next video shipped without it). Renders are
git-ignored; mp3/png go through LFS via `.gitattributes`.

## Gotchas (all learned the hard way)

- **Render detached — never as a background task** (user's rule,
  2026-10-26, #34 Akku): a `run_in_background` command is killed after
  2 hours, and a 60-s render took ~2 h (~4 s/frame on 4 cores; 45 s ≈ 1.5 h). #34 was
  killed at frame 1716/1800 and the half file was unusable (the mp4 is
  only finalised at the end). Always start the render with `setsid nohup
… & disown` (step 6) so it runs in its own session, and watch it with a
  **`HYPERFRAMES_RENDER_DETACHED=1` is required** (#35 Fettbrand,
  2026-10-26): without it the CLI watches its parent processes and cancels
  with `render_cancelled_parent_exited` ~30 s in, as soon as the shell that
  started it ends — `setsid nohup` alone is not enough. Watch the `node …
  hyperframes render` pid (not the npx wrapper) with a
  separate `tail --pid=<pid> -f /dev/null` in the background (that one
  may time out harmlessly; re-arm it). Splitting into parts doesn't help:
  one render already uses all 4 cores. Tell the user ~1.5 h for 45 s, not 40–60 min.

- **Commit blocked by "Skill mirror out of sync"** (#37 Kaugummi,
  2026-10-26): the repo's commit hook runs `bun run lint`, which checks that
  `.claude/skills/` and `.agents/skills/` match. `.agents/skills/bau-erklaervideo`
  is git-ignored, so a fresh container doesn't have it and every commit is
  refused. Fix: `cp -r .claude/skills/bau-erklaervideo .agents/skills/`
  (local only, nothing to commit), then commit again.
- **A worker restart kills the render too** (#37): even a detached render
  dies when the session's worker restarts. Check `pgrep -f "node.*hyperframes
render"` after any restart notice and start it again (clear
  `renders/work-*` and `renders/.<slug>.hf-transaction-*` first). The
  container is also reclaimed when the chat sits idle for a while (#37
  lost a render at 53 % overnight): keep the turn alive while rendering
  with a `Monitor` that prints progress every 10 % and re-arm it on expiry,
  instead of ending the turn and waiting for a notification.
- **X-ray glass:** use `xrayMaterial()` + `setXray()`. Never toggle
  `material.transparent` at runtime — three.js keeps the opaque shader and
  the shell stays solid in sequential renders.
- **Anchors:** `W()` matches whole words case-insensitively and counts
  occurrences; common words ("an", "die", "das") collide across sentences.
  Prefer nouns/verbs that appear once, or pass the occurrence number.
- **ElevenLabs 429 — split right away** (user's rule, 2026-10-25): if the
  full take is refused on the **first try**, don't wait it out — generate
  the script in **short pieces**, always: one or two sentences each
  (**≤ ~90 characters**, delivery tags kept), one at a time. Measured on
  #33 Weltall: whole script, 2 halves and 4 quarters were refused for over
  an hour, while single sentences went through. A 429 on a short piece is
  random load: **retry the same piece right away** (it usually passes on
  the 2nd–3rd try); after ~4 refusals in a row wait 1–2 min, and if a
  piece keeps failing split it again. Poll each piece until `completed`,
  `curl` it to `assets/vo_takes/parts/pNN.mp3` (names sort in script
  order: `p03a`, `p03b` …), commit the parts as you go (container
  restarts), then `bash scripts/join-voice.sh` (→ `assets/vo_takes/main.mp3`,
  0.35 s between pieces) and `prepare-voice.sh` as usual —
  `tighten-pauses.py` evens out the joins. Cost is the same (credits =
  characters).
  **Pieces read slower** (#36 Nagellampe, 2026-10-26): Jan read the
  19 pieces at ≈ 2.4 words/s (80.6 s for 190 words), so `prepare-voice.sh`
  stopped. Starting the next piece without polling in between avoids most
  429s. Fix used: cut 2 weak sentences from the finished take (no new
  credits) and `BASE=1.28 bash scripts/prepare-voice.sh` (≈ 3.0 words/s
  after the cut) — decide it yourself (autopilot), mention it in the
  delivery message. A piece that comes back `failed`
  ("Free Tier access disabled") is not charged-for audio: regenerate it.
- **Voice speed (Jan):** on `eleven_v3` he reads slowly with ~0.5 s
  breaths (≈ 2.7 words/s after the pauses are cut to 0.12 s by
  `scripts/tighten-pauses.py`). Since 2026-10-26 `prepare-voice.sh`
  always speeds him up by 15 % (`BASE=1.15`, pitch kept) → **3.1 words/s** (the user's choice): **130–142 words ≈ 45 s**. Tested on old
  takes: Face ID and Zapfpistole (~135 words) fit exactly. If a take sounds rushed, `BASE=1.11` for that video is
  the fallback — say so to the user. (Stephan, tried once on #7, read
  slower.)
- **Length:** exactly 45.0 s since 2026-10-28 (60 s from 2026-10-24 to
  -27, 40–50 s before). `prepare-voice.sh` fits the speech,
  `timing.js` / `sync-html.mjs` fix the composition at `LENGTH = 45`
  once the speech ends between 42 and 44.6 s (the take is fitted to
  44.3 s — no silent tail, 2026-11-01).
- **Skill changes live on `main` only.** Before starting a video, `git
pull origin main`; if `git branch -r` shows `tiktok/*` branches that
  aren't merged (`git branch -r --no-merged origin/main`), look for skill
  changes there and merge them first.
- **CTA timing:** `fake-words.mjs` / `align-words.py` write
  `window.HF_CTA_START` (first word of the last line = the comment
  question): the Kommentieren pill pops there and stays to the end. The
  Folgen pill pops on the first word starting with "folg" — the follow
  line in the middle — low (y ≈ 1230 px, under the captions), is tapped
  after 1.0 s and leaves 1.4 s later. So **no other word starting with
  "folg"** (folgt, Folgen …) before the follow line. `sync-html.mjs` warns
  if the follow line is missing or outside ~12–30 s. (`HF_CMT_START` is
  only set by the 2026-11-01 to -03 layout, comment line in the middle.)
- **Old episodes** (≤ #5) used a stock CTA take (`assets/vo_takes/cta.mp3`);
  `prepare-voice.sh` still appends it when that file exists. New episodes
  have no such file.
- **Audio tags:** only `sync-html.mjs` writes the `<audio id="vo">`,
  `<audio id="bgm">` and `<audio id="sfx">` tags; it removes old ones
  first. Lint error `duplicate_media_id` means two of one. The render mixes
  them into one audio stream.
- **Sound effects follow the words:** `sfx.mp3` is baked from the current
  `words.js` + `beats.js`. After `align-words.py` or any beat/shot change,
  rerun `build-sfx.mjs` (then `sync-html.mjs`), or the whooshes land on the
  old cuts.
- **`*` marks:** only around single words (`*Kompressor*.`); never send
  them to ElevenLabs (`tts.mjs` strips them). `W("Kompressor")` works
  without the stars.
- **Labels are DOM, not 3D:** `showLabel` / `labels()` project a world
  point every frame; a label whose point is off screen or behind the
  camera is skipped. Keep tags off the caption band (handled) and pick
  `side` so the tag doesn't sit on the subject.
- **No mascot in the videos.** The Erklärbär is only the profile
  picture; the user decided against it in the videos (2026-10-21).
- **Old episodes** (≤ #5, Windrad) were built before labels, highlights,
  and sound effects; their `world.js` copies don't have them.
- **Camera:** shots are authored close and pulled back ×1.7 (`zoom`). For a
  macro close-up use `zoom: 1.0–1.4`. Scenery (trees, houses, palms) can block
  side/back shots — move the camera, not the environment's stage rules.
- **Git LFS:** mp3/mp4/png under `tiktok/` are LFS files. In a fresh
  clone they can be 130-byte pointers ("Invalid argument" from ffmpeg).
  Fix: `git lfs install --local && git lfs pull`.
- **Never `pkill -f` a pattern that appears in your own command line** — it
  kills the shell running it. Use `pkill -f "render -o render[s]"` style.
- **Outro corridor:** the drone pull-back flies out towards +x/+z; any new
  environment must keep tall scenery off that line (x ≈ 0.6·z, z > 4).
- **Fresh container:** the pre-commit hook builds the workspace, so run `bun install` once before
  the first commit (then `git checkout bun.lock` if it changed).
- **Quality over speed (user's choice 2026-10-22):** the 3D renders at the
  full 1080×1920 with 4096² shadows, ambient occlusion (an extra
  normal/depth pass), tilt-shift, glow, facet tinting, sky light (PMREM)
  and the grade — ~1–2 s per frame in software GL (a big moving sea,
  `sea()`, is the slowest, ~2 s), so a 45 s video takes ~1.5 h (render it detached, see above). That's
  accepted; never lower resolution or switch effects off to save time.
  Still keep it efficient: the scene is drawn into the antialiased canvas
  and copied (a multisampled render target is ~2× slower in software GL),
  scatter many small things with `InstancedMesh`, not separate meshes.
- **Facets:** new scenery meshes get the hand-painted facet tint —
  `new THREE.Mesh(facet(geo, 0.08, seed), facetMat(material))` (world.js).
  Big flat areas need evenly sized triangles (`discGeo` in
  environments.js), never a cylinder cap / `CircleGeometry` fan: tinted
  slivers from the centre read as pie slices.
- **Shader colours:** a custom `ShaderMaterial` that outputs colour must
  end with `#include <colorspace_fragment>` on a linear colour (see the
  sky in environments.js), or it looks wrong through the camera look.
