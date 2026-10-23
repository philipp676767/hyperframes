---
name: bau-erklaervideo
description: 'Make the next video of the German TikTok series "Du hast gerade X gebaut" — a 9:16, 40–50 s explainer of how an everyday thing works (Kühlschrank, Aufzug, Toaster, Ampel …), in the house style — toy-like low-poly 3D diorama in a changing setting (island, city street, beach, snowy village, countryside), the object built up piece by piece in x-ray, name tags with arrows on the parts, one-word captions with yellow punch-in keywords, sound effects on every cut and pop-in, ElevenLabs voice "Jan – Social Media Creator" (model eleven_v3), retention-first script (strong hook + on-screen hook title, open loop, re-hook, payoff) → payoff that answers the hook question → "Übrigens: …" bonus fact → comment-question + follow CTA → loop bridge back into the hook (seamless loop), plus a cover image (Titelbild) and a posting description (Beschreibung + hashtags) for every video. Claude picks the topic itself (references/themen.md, never one already done). Use whenever the user names a new topic for this series or asks for "noch so ein Video", "neues Video", "wie funktioniert X", "mach das nächste Video".'
---

# Bau-Erklärvideo (TikTok series)

One video = one topic. Voice, look and structure stay; the script (incl.
hook title and a topic-specific CTA question), the 3D subject and its story
beats change every time. The script is what makes people stay — write it
with `references/script-formel.md` (v2) and treat its self-check as a gate. The reference build is
`tiktok/kuehlschrank/` (fridge) — read its `assets/scene.js` before building
a new subject; it shows every technique at full size.

Talk to the user in German. Keep them posted in short lines while working.

## Fixed house settings

| What         | Value                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Format       | 1080×1920, 30 fps, **40–50 s** (aim ~45 s)                                                                                                                                                                                                                                                                                                                                                                                |
| Voice        | ElevenLabs **Jan – Social Media Creator**, `voice_id keqaIOtp0ePlmN5jgQfy`, model **`eleven_v3`** — the house voice; **always use Jan** (user's decision 2026-10-22 after trying Stephan on #7: back to Jan for #7 and every episode after). Don't switch voices unless the user asks. History: Christian Plasa (#1–#5), Jan (#6 →), Stephan – Warm and Friendly `IWm8DnJ4NGjFI7QAM5lM` tried once on #7, replaced by Jan |
| CTA          | **Never cut, shortened or moved** (user's rule). Per video: a comment question tied to the topic + "– und folg mir für mehr", last line of `script.txt`, spoken in the same take. White "Kommentieren" pill pops when it starts, red "+ Folgen" pill on "folg" gets tapped → "Gefolgt" (template)                                                                                                                         |
| Bonus fact   | "Übrigens: …" right after the payoff — one surprising fact; "WUSSTEST DU?" badge + sparkle sound (automatic on the word "Übrigens")                                                                                                                                                                                                                                                                                       |
| Loop         | Last line `> Und merk dir:` (2–4 words) flows into the hook; picture cuts back to the opening shot so the end matches frame 0 (automatic)                                                                                                                                                                                                                                                                                 |
| Cover        | **Every video gets a Titelbild** (`scripts/make-cover.sh`): strongest scene moment + big curiosity title, sent with the video                                                                                                                                                                                                                                                                                             |
| Beschreibung | **Every video gets a TikTok description** (step 6c): curiosity first line, comment question, **max. 5 hashtags**; saved as `tiktok/<slug>/beschreibung.txt`, sent with the video                                                                                                                                                                                                                                          |
| Payoff       | The hook's question answered in one punchy line (banner ticks green). **No "Schau dich an. Du hast gerade X gebaut."** — dropped by the user 2026-10-23, never use it again                                                                                                                                                                                                                                               |
| Music        | Calm stock bed `assets/bgm-ruhig.mp3` (original, license-free, from `scripts/make-bgm.py`), same in every video; ~15 dB under the voice and ducked while it speaks (`prepare-music.sh`)                                                                                                                                                                                                                                   |
| Setting      | **different every video**: pick `env` + `sky` (see step 1b), log it in `tiktok/serie.md`                                                                                                                                                                                                                                                                                                                                  |
| Sound FX     | Synthesized house kit (`scripts/make-sfx.py`, no samples): whoosh on every cut, hit on the hook title, punch on highlighted words, blip per label, payoff ding, CTA pops + click. Placed from `assets/beats.js` by `scripts/build-sfx.mjs` → `assets/sfx.mp3`                                                                                                                                                             |
| Keywords     | `*Wort*` in `script.txt` → caption yellow + bigger + pops, camera punch-in, punch sound. ~1 per sentence, 8–12 per video                                                                                                                                                                                                                                                                                                  |
| Labels       | Name tag + yellow arrow on a part when its term is spoken (`LABELS` in `beats.js`), every technical term + key parts                                                                                                                                                                                                                                                                                                      |
| Highlights   | Every 5–7 s a big moment (`HIGHLIGHTS`: slowmo, shake, flash, crash zoom, whip pan) + 2–3 money shots that **show** the spectacular claims; voice with 3–6 delivery tags (`[excited]`, `[whispers]` …)                                                                                                                                                                                                                    |
| Learning log | `tiktok/lernlog.md`: read before every video, update after the user reports numbers / feedback                                                                                                                                                                                                                                                                                                                            |
| Look         | `references/visual-style.md`                                                                                                                                                                                                                                                                                                                                                                                              |
| Script       | `references/script-formel.md`                                                                                                                                                                                                                                                                                                                                                                                             |
| Scene code   | `references/scene-api.md` (world.js API)                                                                                                                                                                                                                                                                                                                                                                                  |

## Workflow

### 0. Pick the topic — you choose it

The user leaves the topic to you (2026-10-23). Follow
`references/themen.md`: **duplicate check first** (`tiktok/serie.md`,
every folder in `tiktok/`, the reserved list, remote branches), then pick
the best open topic by the five criteria and propose it with its hook
idea, money shot and two alternatives. On "ok": reserve it in
`themen.md`, commit + push on `main` right away (parallel chats!), then
go on. If the user names a topic, take theirs — but still run the check
and say so if it was done before.

### 0a. Name the chat — "Video: <Thema>"

The user wants every video chat named the same way (Einheit): **`Video:
<Thema in einem Wort>`**, e.g. `Video: Kühlschrank`, `Video: Mikrowelle`,
`Video: Tesla` (for "Fliegender Tesla" pick the one word people search
for). German noun, capitalised, umlauts written out as ä/ö/ü. As soon as
the topic is known — before the script — rename the chat:

- If `set_session_title` is available (claude-code-remote tools; check
  with ToolSearch `select:mcp__claude-code-remote__get_session,mcp__claude-code-remote__set_session_title`):
  `get_session` without `session_id` gives this chat's id, then
  `set_session_title` with that id and the title.
- Most video chats **don't** have that tool. Then the very first line of
  your first reply is: **„Bitte benenne diesen Chat in „Video: <Thema>“
  um.“** — exactly that title, so the user can copy it.

If the topic changes, rename again.

### 0b. Read the learning log first

Open `tiktok/lernlog.md` before writing anything. Every entry under
"Nächstes Mal" that isn't ticked off is a rule for this video, and the
approval message says which one(s) this video improves. The series gets
better one concrete step per video.

### 1. Script → user approval (always first)

Write the German script with `references/script-formel.md` (v2): hook
(+ on-screen hook title), 3 beats with one re-hook, payoff (answers the
hook) + "Übrigens" bonus fact, CTA question, `> …` loop bridge. **110–122 words including all of it** (≈ 42–46 s), never
more than **128** (≈ 49 s) or fewer than **105** (≈ 40 s); expected length
= words ÷ 2.7 + 1.2 s (Jan). Run the self-check in that file. Show the user the
script, word count + length, the hook title, **two alternative hooks**, the
cover title, and a one-line visual idea per beat **incl. the highlight of each beat**
(money shots, slowmo, flash …), and **wait for their OK** before spending
credits or building. Apply their edits verbatim.

### 1b. Pick the setting (never the same as the last video)

Read `tiktok/serie.md`. Choose an environment that suits the topic **and**
differs from the previous video's; vary the sky too. Mention the choice in
the approval message so the user can veto it.

| `env`    | Place                                                        | Default `sky`     | Fits e.g.                                   |
| -------- | ------------------------------------------------------------ | ----------------- | ------------------------------------------- |
| `insel`  | floating island, park trees                                  | `sonnenuntergang` | anything small, kitchen things              |
| `stadt`  | plaza, road with markings, pastel houses, street lamps, cars | `abend`           | Aufzug, Ampel, Auto, Rolltreppe, Bus        |
| `strand` | sand, turquoise sea, palms, boat                             | `mittag`          | Kühlbox, Sonnencreme, Boot, Solarzelle      |
| `winter` | snow, snowy pines, mountains, cabin, falling snow            | `morgen`          | Heizung, Thermoskanne, Seilbahn, Wärmepumpe |
| `land`   | meadow, dirt road, fields, red barn, silo, hay bales         | `sonnenuntergang` | Traktor, Windrad, Mähdrescher, Brunnen      |

Skies: `sonnenuntergang`, `morgen`, `mittag`, `abend` (blue hour, windows
and lamps glow). Every env can take any sky:
`createWorld({ env: "stadt", sky: "mittag" })`. After the video is done,
append a line to `tiktok/serie.md`. If a topic needs a place that doesn't
exist yet (Küche innen, Fabrikhalle, Weltraum …), add a builder to
`template/assets/environments.js` following the stage-clearance rules at
its top, and copy the file into the project.

### 2. Scaffold the project

```bash
bash .claude/skills/bau-erklaervideo/scripts/new-video.sh <slug> "So funktioniert <X>"
```

Creates `tiktok/<slug>/` with the shared `assets/world.js` + `assets/environments.js`, captions, hook title and CTA buttons in `index.html`,
the stock music bed in `assets/vo_takes/bgm-ruhig.mp3`, the sound-effect
kit (`assets/sfx/`, git-ignored, regenerated on demand), helper scripts, and a small demo
(`assets/scene.js` + `assets/beats.js`, candle → light bulb) that already
renders with labels and sound. Write the approved script into
`script.txt` — one part per line, **the CTA on its own line** (it must
contain "folg"), then **the loop bridge as the last line, starting with
`> `**, **keywords marked `*Wort*`** — and put the hook
title into `<div id="hook-title">` in `index.html` (keyword in `<em>`),
and fill the `hf-config` block next to it: `question` (the hook's open
question, ≤ 6 words), `answer` (the spoken word that answers it, in the
payoff) and `steps` (one spoken word per build step) — they drive the
question banner and the progress bar.
Then run `node scripts/fake-words.mjs && node scripts/build-sfx.mjs && node scripts/sync-html.mjs`
for estimated timings so the scene can be built before the voice exists.

### 3. Voice (ElevenLabs connector)

Generate the **whole script including the CTA line** (script.txt joined to
one paragraph, **with every `*` and the leading `>` of the loop line
removed** — the marks are for the captions; the voice would read or
stress them oddly; the `[excited]` / `[whispers]` delivery tags **stay**,
eleven_v3 performs them) with `creative_generate_speech`: `voice_id
keqaIOtp0ePlmN5jgQfy` (Jan), `model_id eleven_v3`,
**`generations_count: 1`** (the account hits 429 concurrency limits with
more; a 429 means nothing was generated or charged — retry once with 1).
Cost ≈ 800 credits (~0.08 $). Poll `creative_get_flow_run_status` (it can
take 1–3 min; wait with a background `sleep 40`, not a foreground sleep),
then download `content_url` right away (expires after 2 h):

```bash
curl -sS -o tiktok/<slug>/assets/vo_takes/main.mp3 "<content_url>"
```

No connector? `ELEVENLABS_API_KEY=… node scripts/tts.mjs` writes the same
file (the key must come from the environment's secrets, never the chat).

Then, in the project dir:

```bash
bash scripts/prepare-voice.sh          # tighten pauses + speed-up to ~44 s → assets/voiceover.mp3
python3 -I scripts/align-words.py      # Whisper word timings snapped onto script.txt → assets/words.js
bash scripts/prepare-music.sh          # calm bed cut to length, faded, ducked under the voice → assets/bgm.mp3
node scripts/build-sfx.mjs             # all sound effects on one track from beats.js → assets/sfx.mp3
node scripts/sync-html.mjs             # root duration, caption length, the <audio> tags (vo + bgm + sfx)
```

`align-words.py` needs `pip install faster-whisper` (downloads the `small`
model once). If `prepare-voice.sh` stops because the video would land outside 40–50 s,
adjust the script with the user (shorter / one more short beat) and
regenerate the voice rather than stretching or squeezing the audio.
Music too loud or too
quiet for a topic? `BGM_DB=-3 bash scripts/prepare-music.sh` (default -5;
higher = louder), then rerun `sync-html.mjs`. Effects too loud / quiet:
`SFX_DB=-3 node scripts/build-sfx.mjs` (shifts all), or `db:` on one cue.

### 4. Build the subject (`assets/scene.js` + `assets/beats.js`)

Follow `references/scene-api.md`. Set the chosen setting first
(`createWorld({ env, sky })`), then rebuild the demo file around the new
subject: hook visual (the strange thing the hook names — mid-action from
frame 1, or the primitive version that fails) → subject pops in when the
build starts → each component
appears/animates on the word that names it → x-ray while explaining → one
analogy mini-set per 1–2 beats → LED panel facts → outro x-ray off + drone
pull-back. Anchor every beat on a spoken word with `W("Wort", n)`; never
hard-code seconds.

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
On top, **every video may get 1–3 sounds of its own** that belong to its
topic and make its money shots audible: popcorn popping, a smoke alarm
shrieking, coins rattling in an ATM, a lighter's spark click, ice
cracking, a car engine roaring. Plan them with the visual plan (name them
in the approval message) and put them where the picture shows the thing.
Two ways, both land in `assets/sfx-extra/<name>.wav` and are used in
`SFX` like any kit sound (`{ s: "popcorn", at: T.platzt, db: -10 }`):

1. **Realistic, from ElevenLabs** (best for real-world sounds): one
   `creative_generate_in_flow` call per sound — `node_type: "sfx"`,
   `model_id: "eleven_text_to_sound_v2"`, **`generations_count: 1`**, an
   English prompt that says what and how long ("single corn kernel popping,
   sharp crisp pop, dry, close-up, 1 second" / "smoke detector alarm, three
   piercing beeps, 3 seconds"). Poll `creative_get_flow_run_status`, then
   `bash scripts/add-sfx.sh <name> "<content_url>"` (trims, mono, peak
   −3 dBFS like the kit, max 5 s). Costs a few credits — keep it to the
   sounds that matter.
2. **Synthesized, free:** write it in `scripts/sfx-extra.py` with the kit's
   own helpers (`t_of noise sine svf env write rng np`, see the example in
   the file); `build-sfx.mjs` runs it every time. Good for clicks, beeps,
   hums, crackles, rhythmic patterns.

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
npx hyperframes render -o renders/<slug>.mp4      # ~30–40 min for 45 s (full 1080p + AO, software WebGL); always in background
bash scripts/finish-audio.sh renders/<slug>.mp4   # -> renders/<slug>-final.mp4 at -14 LUFS (picture untouched)
ffprobe -v error -show_entries stream=codec_type,duration -of compact renders/<slug>-final.mp4
```

The render's mixer drops voice + music to ≈ -18 LUFS; `finish-audio.sh`
brings it back to -14 LUFS. Confirm exactly one audio stream and 40–50 s, then send **`<slug>-final.mp4`** with `SendUserFile`
(display `render`) **together with the cover** (6b) **and the description** (6c).
Before sending, watch it honestly as a stranger would (contact sheet every
3 s + the hook frames): Would I stop scrolling in the first 2 s? Is there
a highlight every 5–7 s? Is anything smeared, tiny or monotone? Fix
before sending, not after. Append the episode to `tiktok/serie.md`.

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

Write the post text for every video, save it as
`tiktok/<slug>/beschreibung.txt` and put it **in the delivery message as
a copy-paste block** (with the video and the cover). German, Du-Form,
emoji sparingly (1–3). Shape:

1. **First line = a second hook** (only ~1 line shows before "mehr"):
   curiosity, not a summary, different from the spoken hook and the cover
   title — e.g. "Dein Kühlschrank ist eigentlich eine Wärmepumpe 🤯".
2. **1–2 short sentences** with what you learn / a teaser of the bonus
   fact, without spoiling it fully.
3. **The comment question from the CTA**, worded a bit differently, so
   the comments answer it ("Ist deiner hinten warm? 👇").
4. **3–5 hashtags, never more than 5** (the user's rule): 1–2 broad
   discovery tags (`#lernenmittiktok`, `#wissen`), 1–2 topic tags
   (`#kühlschrank`, `#physik`), the series tag `#duhastgeradegebaut`. No `#fyp` / `#viral` spam, no
   English filler tags.

Total ≤ 300 characters. Keywords the viewer would search for ("wie
funktioniert ein Kühlschrank") belong in the text in natural words —
TikTok search reads the description.

Example:

```text
Dein Kühlschrank macht keine Kälte – er klaut sie 🤯
Bau ihn mit mir nach und versteh endlich, wie ein Kühlschrank funktioniert.
Fass mal hinten dran: Ist deiner warm? 👇
#lernenmittiktok #wissen #kühlschrank #physik #duhastgeradegebaut
```

### 6d. Ask for the numbers — learning log

In the delivery message ask the user to tell you, 1–2 days after posting:
views, average watch time / % watched to the end, likes, comments, and
any feedback they got. When they do, add the episode to
`tiktok/lernlog.md` (numbers, what worked, what didn't, and **one**
concrete "Nächstes Mal" item), turn lasting lessons into rules in this
skill, and commit both on `main`.

### 7. Save — always on `main`

Commit `tiktok/<slug>/` (incl. `cover.png` and `beschreibung.txt`) and `tiktok/serie.md` **directly on `main`**
(`git pull origin main` first) and push. Same for any change to this
skill. Other chats start on `main`: an episode or skill change left on a
side branch is invisible to them (the music bed once sat on a branch for
a whole episode and the next video shipped without it). Renders are
git-ignored; mp3/png go through LFS via `.gitattributes`.

## Gotchas (all learned the hard way)

- **X-ray glass:** use `xrayMaterial()` + `setXray()`. Never toggle
  `material.transparent` at runtime — three.js keeps the opaque shader and
  the shell stays solid in sequential renders.
- **Anchors:** `W()` matches whole words case-insensitively and counts
  occurrences; common words ("an", "die", "das") collide across sentences.
  Prefer nouns/verbs that appear once, or pass the occurrence number.
- **Voice speed (Jan, measured on #6 Atomkraftwerk):** Jan on `eleven_v3`
  reads slowly with ~0.5 s breaths between phrases (130 words = 64.6 s raw).
  His noise floor sits above -35 dB, so `prepare-voice.sh` now cuts every
  pause found at -30 dB down to 0.12 s (`scripts/tighten-pauses.py`,
  `PAUSE=0.15` for a little more air) before the max +10 % speed-up. After
  that he lands at ~2.7 words/s: video ≈ words (incl. CTA) ÷ 2.7 + 1.2 s
  (with the loop line the tail is only 0.25 s, so ~1 s shorter).
  105 words ≈ 40 s, 118 ≈ 45 s, 128 ≈ 49 s. #6 had 130 words and came out
  at 49.4 s — right at the edge; write 110–122. (Stephan, tried once on
  #7, read slower: 122 words → 48.6 s.)
- **Length:** outside 40–50 s is a reject; `prepare-voice.sh` refuses to
  build it. Kühlschrank/Airfryer (68 s) and Aufzug/Airbag (~50 s) predate
  this limit — don't copy their length.
- **Skill changes live on `main` only.** Before starting a video, `git
pull origin main`; if `git branch -r` shows `tiktok/*` branches that
  aren't merged (`git branch -r --no-merged origin/main`), look for skill
  changes there and merge them first.
- **CTA timing:** `fake-words.mjs` / `align-words.py` write
  `window.HF_CTA_START` (index of the first word of the last script line);
  the buttons key on it and on the first word starting with "folg". A CTA
  without "folg" still works (Folgen pops 1.2 s after the CTA starts).
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
- **Git LFS:** mp3/mp4/png under `tiktok/` and the skill's music bed are LFS
  files. In a fresh clone they can be 130-byte pointers ("Invalid argument"
  from ffmpeg). Fix: `git lfs install --local && git lfs pull`.
  `new-video.sh` does this automatically for the music bed.
- **Never `pkill -f` a pattern that appears in your own command line** — it
  kills the shell running it. Use `pkill -f "render -o render[s]"` style.
- **Outro corridor:** the drone pull-back flies out towards +x/+z; any new
  environment must keep tall scenery off that line (x ≈ 0.6·z, z > 4).
- **Fresh container:** mp3s are LFS objects; a clone may hold only 130-byte
  pointers. `new-video.sh` pulls the music bed itself (`git lfs pull`).
  The pre-commit hook builds the workspace, so run `bun install` once before
  the first commit (then `git checkout bun.lock` if it changed).
- **Quality over speed (user's choice 2026-10-22):** the 3D renders at the
  full 1080×1920 with 4096² shadows, ambient occlusion (an extra
  normal/depth pass), tilt-shift, glow and facet tinting — ~1–1.5 s per
  frame in software GL, so a 45 s video takes ~30–40 min to render. That's
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
