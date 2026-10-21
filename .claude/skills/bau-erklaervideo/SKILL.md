---
name: bau-erklaervideo
description: Make the next video of the German TikTok series "Du hast gerade X gebaut" — a 9:16, 40–50 s explainer of how an everyday thing works (Kühlschrank, Aufzug, Toaster, Ampel …), in the house style — toy-like low-poly 3D diorama in a changing setting (island, city street, beach, snowy village, countryside), the object built up piece by piece in x-ray, name tags with arrows on the parts, one-word captions with yellow punch-in keywords, sound effects on every cut and pop-in, ElevenLabs voice "Jan – Social Media Creator" (model eleven_v3), retention-first script (strong hook + on-screen hook title, open loop, re-hook, payoff) → "Schau dich an. Du hast gerade X gebaut." → "Übrigens: …" bonus fact → comment-question + follow CTA → loop bridge back into the hook (seamless loop), plus a cover image (Titelbild) for every video. Use whenever the user names a new topic for this series or asks for "noch so ein Video", "wie funktioniert X", "mach das nächste Video".
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

| What       | Value                                                                                                                                                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Format     | 1080×1920, 30 fps, **40–50 s** (aim ~45 s)                                                                                                                                                                                                                    |
| Voice      | ElevenLabs **Jan – Social Media Creator**, `voice_id keqaIOtp0ePlmN5jgQfy`, model **`eleven_v3`** (chosen 2026-10-21 after creator feedback; replaced Christian Plasa on `eleven_multilingual_v2`, episodes #1–#5)                                            |
| CTA        | Per video: a comment question tied to the topic + "– und folg mir für mehr", last line of `script.txt`, spoken in the same take. White "Kommentieren" pill pops when it starts, red "+ Folgen" pill on "folg" gets tapped → "Gefolgt" (template)              |
| Bonus fact | "Übrigens: …" right after the signature line — one surprising fact; "WUSSTEST DU?" badge + sparkle sound (automatic on the word "Übrigens")                                                                                                                   |
| Loop       | Last line `> Und merk dir:` (2–4 words) flows into the hook; picture cuts back to the opening shot so the end matches frame 0 (automatic)                                                                                                                     |
| Cover      | **Every video gets a Titelbild** (`scripts/make-cover.sh`): strongest scene moment + big curiosity title, sent with the video                                                                                                                                 |
| Outro line | "Schau dich an. Du hast gerade [einen/eine/ein] X gebaut."                                                                                                                                                                                                    |
| Music      | Calm stock bed `assets/bgm-ruhig.mp3` (original, license-free, from `scripts/make-bgm.py`), same in every video; ~15 dB under the voice and ducked while it speaks (`prepare-music.sh`)                                                                       |
| Setting    | **different every video**: pick `env` + `sky` (see step 1b), log it in `tiktok/serie.md`                                                                                                                                                                      |
| Sound FX   | Synthesized house kit (`scripts/make-sfx.py`, no samples): whoosh on every cut, hit on the hook title, punch on highlighted words, blip per label, payoff ding, CTA pops + click. Placed from `assets/beats.js` by `scripts/build-sfx.mjs` → `assets/sfx.mp3` |
| Keywords   | `*Wort*` in `script.txt` → caption yellow + bigger + pops, camera punch-in, punch sound. ~1 per sentence, 8–12 per video                                                                                                                                      |
| Labels     | Name tag + yellow arrow on a part when its term is spoken (`LABELS` in `beats.js`), every technical term + key parts                                                                                                                                          |
| Look       | `references/visual-style.md`                                                                                                                                                                                                                                  |
| Script     | `references/script-formel.md`                                                                                                                                                                                                                                 |
| Scene code | `references/scene-api.md` (world.js API)                                                                                                                                                                                                                      |

## Workflow

### 1. Script → user approval (always first)

Write the German script with `references/script-formel.md` (v2): hook
(+ on-screen hook title), 3 beats with one re-hook, payoff + signature
line + "Übrigens" bonus fact, CTA question, `> …` loop bridge. **110–122 words including all of it** (≈ 42–46 s), never
more than **128** (≈ 49 s) or fewer than **105** (≈ 40 s); expected length
= words ÷ 2.7 + 1.2 s. Run the self-check in that file. Show the user the
script, word count + length, the hook title, **two alternative hooks**, the
cover title, and a one-line visual idea per beat, and **wait for their OK** before spending
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
title into `<div id="hook-title">` in `index.html` (keyword in `<em>`).
Then run `node scripts/fake-words.mjs && node scripts/build-sfx.mjs && node scripts/sync-html.mjs`
for estimated timings so the scene can be built before the voice exists.

### 3. Voice (ElevenLabs connector)

Generate the **whole script including the CTA line** (script.txt joined to
one paragraph, **with every `*` and the leading `>` of the loop line
removed** — the marks are for the captions; the voice would read or
stress them oddly) with `creative_generate_speech`: `voice_id
keqaIOtp0ePlmN5jgQfy`, `model_id eleven_v3`,
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
switches). Rerun `node scripts/build-sfx.mjs && node scripts/sync-html.mjs` after changing beats.

### 5. Check

```bash
npx hyperframes lint                    # must be 0 errors
npx hyperframes snapshot --at <t1,t2,…> --no-end --describe false -o <scratch dir>
```

Snapshot one time per shot (word start + 0.3 s) and look at the contact
sheet: subject readable and not cropped, captions not hidden, nothing
blocking the camera (trees!), panel legible, x-ray actually see-through,
every label's arrow touching its part and the tag not covering the
subject.
Read `assets/sfx-cues.json` once: one whoosh per cut, nothing stacked
within ~0.15 s except a cut + its highlight.
Fix and re-snapshot. Expect 2–3 rounds.

### 6. Render and deliver

```bash
npx hyperframes render -o renders/<slug>.mp4      # ~15 min (software WebGL); run in background
bash scripts/finish-audio.sh renders/<slug>.mp4   # -> renders/<slug>-final.mp4 at -14 LUFS (picture untouched)
ffprobe -v error -show_entries stream=codec_type,duration -of compact renders/<slug>-final.mp4
```

The render's mixer drops voice + music to ≈ -18 LUFS; `finish-audio.sh`
brings it back to -14 LUFS. Confirm exactly one audio stream and 40–50 s, then send **`<slug>-final.mp4`** with `SendUserFile`
(display `render`) **together with the cover** (6b). Append the episode to `tiktok/serie.md`.

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

### 7. Save — always on `main`

Commit `tiktok/<slug>/` and `tiktok/serie.md` **directly on `main`**
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
  at 49.4 s — right at the edge; write 110–122.
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
- **Speed:** 3D renders at 720×1280 internally (CSS-scaled); keep shadow
  casters reasonable. Don't raise the internal resolution.
