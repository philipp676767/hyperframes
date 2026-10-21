---
name: bau-erklaervideo
description: Make the next video of the German TikTok series "Du hast gerade X gebaut" — a 9:16, 40–50 s explainer of how an everyday thing works (Kühlschrank, Aufzug, Toaster, Ampel …), in the house style — toy-like low-poly 3D diorama in a changing setting (island, city street, beach, snowy village, countryside), the object built up piece by piece in x-ray, one-word captions, ElevenLabs voice "Christian Plasa – Dynamic and Vibrant", structure hook → build loop → "Schau dich an. Du hast gerade X gebaut." → follow CTA. Use whenever the user names a new topic for this series or asks for "noch so ein Video", "wie funktioniert X", "mach das nächste Video".
---

# Bau-Erklärvideo (TikTok series)

One video = one topic. Voice, look, structure and CTA never change; only the
script, the 3D subject and its story beats do. The reference build is
`tiktok/kuehlschrank/` (fridge) — read its `assets/scene.js` before building
a new subject; it shows every technique at full size.

Talk to the user in German. Keep them posted in short lines while working.

## Fixed house settings

| What       | Value                                                                                                                                                                                          |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Format     | 1080×1920, 30 fps, **40–50 s** (aim ~45 s)                                                                                                                                                     |
| Voice      | ElevenLabs **Christian Plasa – Dynamic and Vibrant**, `voice_id nsFsExJHz4xV1sOX6Kdn`, model `eleven_multilingual_v2`                                                                          |
| CTA        | Spoken "Folg mir, um mehr zu lernen." (stock take in `assets/cta-christian-plasa.mp3`, reused — never regenerate) + red "+ Folgen" pill that gets tapped → "Gefolgt" (already in the template) |
| Outro line | "Schau dich an. Du hast gerade [einen/eine/ein] X gebaut."                                                                                                                                     |
| Music      | Calm stock bed `assets/bgm-ruhig.mp3` (original, license-free, from `scripts/make-bgm.py`), same in every video; ~15 dB under the voice and ducked while it speaks (`prepare-music.sh`)        |
| Setting    | **different every video**: pick `env` + `sky` (see step 1b), log it in `tiktok/serie.md`                                                                                                       |
| Look       | `references/visual-style.md`                                                                                                                                                                   |
| Script     | `references/script-formel.md`                                                                                                                                                                  |
| Scene code | `references/scene-api.md` (world.js API)                                                                                                                                                       |

## Workflow

### 1. Script → user approval (always first)

Write the German script with `references/script-formel.md`: hook, 3–4 build
beats, outro, CTA. **105–120 words before the CTA** (≈ 40–46 s video),
never more than **130** (≈ 50 s, the hard upper limit) and not fewer than
**100** (under 40 s). Count them and give the expected length
(words ÷ 2.8 + 3 s) before showing the script; if a topic needs more, cut
beats rather than squeeze. Show the user the script plus a one-line
visual idea per beat, and **wait for their OK** before spending credits or
building. Apply their edits verbatim.

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

Creates `tiktok/<slug>/` with the shared `assets/world.js` + `assets/environments.js`, captions + CTA
in `index.html`, the stock CTA voice in `assets/vo_takes/cta.mp3`, the stock
music bed in `assets/vo_takes/bgm-ruhig.mp3`, helper
scripts, and a small demo `assets/scene.js` (candle → light bulb) that
already renders. Write the approved script into `script.txt` — one beat per
line, last line exactly `Folg mir, um mehr zu lernen.` — then run
`node scripts/fake-words.mjs && node scripts/sync-html.mjs` for estimated
timings so the scene can be built before the voice exists.

### 3. Voice (ElevenLabs connector)

Generate **only the main text** (script.txt without the CTA line, joined to
one paragraph) with `creative_generate_speech`: `voice_id
nsFsExJHz4xV1sOX6Kdn`, `model_id eleven_multilingual_v2`,
**`generations_count: 1`** (the account hits 429 concurrency limits with
more; a 429 means nothing was generated or charged — retry once with 1).
Cost ≈ 1,100 credits (~0.11 $). Poll `creative_get_flow_run_status` (it can
take 1–3 min; wait with a background `sleep 40`, not a foreground sleep),
then download `content_url` right away (expires after 2 h):

```bash
curl -sS -o tiktok/<slug>/assets/vo_takes/main.mp3 "<content_url>"
```

No connector? `ELEVENLABS_API_KEY=… node scripts/tts.mjs` writes the same
file (the key must come from the environment's secrets, never the chat).

Then, in the project dir:

```bash
bash scripts/prepare-voice.sh          # tighten pauses + stock CTA + speed-up to ~44 s → assets/voiceover.mp3
python3 -I scripts/align-words.py      # Whisper word timings snapped onto script.txt → assets/words.js
bash scripts/prepare-music.sh          # calm bed cut to length, faded, ducked under the voice → assets/bgm.mp3
node scripts/sync-html.mjs             # root duration, caption length, the <audio> tags (vo + bgm)
```

`align-words.py` needs `pip install faster-whisper` (downloads the `small`
model once). If `prepare-voice.sh` stops because the video would land outside 40–50 s,
adjust the script with the user (shorter / one more short beat) and
regenerate the voice rather than stretching or squeezing the audio.
Music too loud or too
quiet for a topic? `BGM_DB=-3 bash scripts/prepare-music.sh` (default -5;
higher = louder), then rerun `sync-html.mjs`.

### 4. Build the subject (`assets/scene.js`)

Follow `references/scene-api.md`. Set the chosen setting first
(`createWorld({ env, sky })`), then rebuild the demo file around the new
subject: hook prop → subject pops in on the first "Also …" → each component
appears/animates on the word that names it → x-ray while explaining → one
analogy mini-set per 1–2 beats → LED panel facts → outro x-ray off + drone
pull-back. Anchor every beat on a spoken word with `W("Wort", n)`; never
hard-code seconds.

### 5. Check

```bash
npx hyperframes lint                    # must be 0 errors
npx hyperframes snapshot --at <t1,t2,…> --no-end --describe false -o <scratch dir>
```

Snapshot one time per shot (word start + 0.3 s) and look at the contact
sheet: subject readable and not cropped, captions not hidden, nothing
blocking the camera (trees!), panel legible, x-ray actually see-through.
Fix and re-snapshot. Expect 2–3 rounds.

### 6. Render and deliver

```bash
npx hyperframes render -o renders/<slug>.mp4      # ~15 min (software WebGL); run in background
bash scripts/finish-audio.sh renders/<slug>.mp4   # -> renders/<slug>-final.mp4 at -14 LUFS (picture untouched)
ffprobe -v error -show_entries stream=codec_type,duration -of compact renders/<slug>-final.mp4
```

The render's mixer drops voice + music to ≈ -18 LUFS; `finish-audio.sh`
brings it back to -14 LUFS. Confirm exactly one audio stream and 40–50 s, then send **`<slug>-final.mp4`** with `SendUserFile`
(display `render`). Append the episode to `tiktok/serie.md`.

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
- **Length:** measured on the finished episodes the voice runs ~2.8
  words/s; video ≈ words ÷ 2.8 + 3 s (CTA + outro tail). 105 words ≈ 40 s,
  120 ≈ 46 s, 130 ≈ 50 s. Outside 40–50 s is a reject; `prepare-voice.sh`
  refuses to build it. Kühlschrank/Airfryer (68 s) and Aufzug/Airbag
  (~50 s) predate this limit — don't copy their length.
- **Skill changes live on `main` only.** Before starting a video, `git
pull origin main`; if `git branch -r` shows `tiktok/*` branches that
  aren't merged (`git branch -r --no-merged origin/main`), look for skill
  changes there and merge them first.
- **Audio tags:** only `sync-html.mjs` writes the `<audio id="vo">` and
  `<audio id="bgm">` tags; it removes old ones first. Lint error
  `duplicate_media_id` means two of one. The render mixes both into one
  audio stream.
- **Camera:** shots are authored close and pulled back ×1.7 (`zoom`). For a
  macro close-up use `zoom: 1.0–1.4`. Scenery (trees, houses, palms) can block
  side/back shots — move the camera, not the environment's stage rules.
- **Git LFS:** mp3/mp4/png under `tiktok/` and the skill's stock CTA are LFS
  files. In a fresh clone they can be 130-byte pointers ("Invalid argument"
  from ffmpeg). Fix: `git lfs install --local && git lfs pull`.
  `new-video.sh` does this automatically for the CTA.
- **Never `pkill -f` a pattern that appears in your own command line** — it
  kills the shell running it. Use `pkill -f "render -o render[s]"` style.
- **Outro corridor:** the drone pull-back flies out towards +x/+z; any new
  environment must keep tall scenery off that line (x ≈ 0.6·z, z > 4).
- **Fresh container:** mp3s are LFS objects; a clone may hold only 130-byte
  pointers. `new-video.sh` pulls the stock CTA take itself (`git lfs pull`).
  The pre-commit hook builds the workspace, so run `bun install` once before
  the first commit (then `git checkout bun.lock` if it changed).
- **Speed:** 3D renders at 720×1280 internally (CSS-scaled); keep shadow
  casters reasonable. Don't raise the internal resolution.
