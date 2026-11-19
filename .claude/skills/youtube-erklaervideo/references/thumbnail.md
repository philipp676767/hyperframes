# Thumbnail — the most important picture of the video

User's rule (2026-11-19): **„Gib dir extrem viel Mühe für das Coverbild —
es muss dem Zuschauer sofort zeigen, warum er das Video sehen muss.“**
The thumbnail decides whether anyone ever sees the 10 minutes. Budget for
it like for a chapter: **at least 12 candidates, 3 finals, a competitor
test** — never one frame grabbed from the video with a word on it.

## What the big channels do (analysed 2026-11-19)

Thumbnails of tatsache, vince, Simplicissimus, Kurzgesagt and Terra X
(their most-watched videos) side by side:

| Channel        | What you see                                                                                                                                    | Text                                                                                                                                                                                                            |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| tatsache       | the **moment of disaster, painted like a film poster**: the ICE derailing with sparks, GSG-9 on the plane's wing, the crashed plane in the snow | 0–3 words: a number in a black box („200 KM/H“), a yellow pointer label („SEILBAHN“ on the rope), a newspaper cut-out („Seit 70 Tagen vermisst!“), or the concept written _with_ the material (cocaine letters) |
| vince          | **one clean 3D object on black** (Apollo 13 exploding over the Earth, a model city, a tank breaking the Wall into a crowd)                      | the name huge („APOLLO 13“, „GERMANIA“) or a before/after pair of newspaper snippets — or no text at all                                                                                                        |
| Simplicissimus | **a face** big + colour (red) — or a minimal 3D scene with a moral tension (noose + button)                                                     | „DAS PURE BÖSE“ on a red ribbon, „STUXNET“ glowing                                                                                                                                                              |
| Kurzgesagt     | bold illustration of the **impact moment** (Moon hitting the Earth)                                                                             | 1–2 words („FALSCH…“, „ALLE BOMBEN“) + a big arrow pointing at the detail                                                                                                                                       |

The common rules:

1. **The highest-stakes moment, unresolved** — the second _before_ or
   _during_ the catastrophe, never the calm before or the aftermath: the
   ship tilting, the train jumping the rails, the bow meeting the iceberg.
   That is the "why watch": the viewer sees what is at stake and wants the
   outcome.
2. **The subject is recognisable in one second and fills the frame** —
   the iconic object people picture for the name (four yellow funnels =
   Titanic, the lunar module + Earth = Apollo). ≥ ⅓ of the frame, often ½.
   Crop in hard; no empty sky.
3. **Poster light, not scene light**: the subject is lit like a film poster
   (key + cool rim), brighter than the video; the background dark or one
   strong colour. Dark-on-dark disappears in the feed.
4. **One dominant colour mood + one accent**: icy cyan/blue + yellow text,
   red + white, black + white + red. The competition for a topic usually
   shares one palette — know it (competitor test) and stand out against
   it.
5. **0–5 words, and every word adds what the picture can't**: the twist
   („NICHT NUR DER EISBERG“), the stake as a number („37 SEKUNDEN“), the
   hidden cause pointed at („KEIN FERNGLAS“ → the crow's nest). Never a
   word that only makes sense after watching (YouTube #1: „WAS IST 1202?“).
6. **Text styles that stand out in a dark feed**: yellow bars with black
   condensed letters (tatsache / „1907 GING ES GUT“), a yellow pointer label,
   white on a black box, red ribbon. Plain white letters over a dark sky
   vanish.
7. **Max 3 elements**: subject + text + (label or arrow). Busy = invisible
   at 246 px.

## Our process (step 7 of SKILL.md, ~1–2 h, worth it)

1. **Ideas (in `plan.md`)** — write 5–6 thumbnail ideas, each = _moment_ +
   _what the viewer will want to know_ + _text_. Use the archetypes:
   - **A — Katastrophen-Moment + Mythos-Bruch**: the iconic subject in its
     most dramatic second + the claim that breaks what people believe
     (`gelb` bars or `kino`).
   - **B — Das Detail, auf das keiner achtet**: a wide dramatic shot + a
     yellow **label with pointer** on the small thing that caused it
     („KEIN FERNGLAS“ → crow's nest, „SCHALTER“ → the breaker).
   - **C — Die Zahl / der Zeitdruck**: the moment + one number in a box or
     bars („37 SEKUNDEN“, „200 KM/H“, „4 KB“).
   - **D — vince-minimal**: the subject huge on black + its name, only when
     the picture itself already shows the twist (an explosion, a break).
   - **E — Vorher / Nachher**: split frame with two newspaper snippets
     (`zeitung`), for "then vs. now" topics.
     Pick 3 _different_ archetypes for Test & Compare.
2. **Hero shots (≥ 12 candidates)** — find the moments in the chapters
   (`snapshot` contact sheets), then build each shot with its own camera:
   `scripts/make-thumbnail.py --at <s> --cam '{"p":[…],"l":[…]}' --grid`.
   Low camera near the water / ground looking up makes things huge;
   diagonal subjects read as drama. Use the scene's own world coordinates
   and project points to pixels before placing a pointer (see "Pointer
   placement"). If no frame of the video works, **build a thumbnail-only
   scene** (a chapter copy that is never rendered as video: extra lights,
   exaggerated fire / sparks / water, the object closer) — `window.HF_THUMB`
   is true while a thumbnail renders, so a scene can do more then.
3. **Light + grade** — the poster rig is on by default (`--licht 1`;
   1.3–1.5 for night scenes, 0.5 when white parts blow out); `--grade eis`
   for night / ice / sea, `kino` for fire and day, `rot` for danger /
   crime; `--hell 0.04–0.08` lifts dark scenes; `--crop x,y,w` fills the
   frame (w ≥ 1280 keeps full sharpness).
4. **Lettering** — `--style gelb` (bars, split lines with `|`), `kino`,
   `block`, `banner`, `zeitung`, `gross`; `--label` + `--label-box` +
   `--label-point`; `--arrow`, `--circle`. Text never covers the subject's
   face / key part; keep it in the empty third.
5. **Checks for every final** (look at `renders/thumb-<x>-check.png`):
   - **One-second test** at 246 px: „Das Video handelt von \_\_\_“ = the topic?
   - **Why-watch test**: what does the viewer want to know after one
     second? Write it down — if the answer is "nothing", change the moment
     or the text.
   - **Greyscale test**: subject still separates from the background?
   - **Truth test**: the video shows / answers exactly this (no clickbait).
6. **Competitor test** — search the topic with Tube_Alfred
   (`youtube_search_query`, relevance), put 6–9 results into
   `youtube/<slug>/konkurrenz.txt` (`id | title | channel`), then
   `python3 -I .claude/skills/youtube-erklaervideo/scripts/thumb-vergleich.py <slug>`
   → `renders/vergleich-<x>.png`: ours among them on a YouTube-like page,
   desktop and phone. Which thumbnail do you see first? If not ours, redo.
7. **Save** `youtube/<slug>/thumb-{a,b,c}.jpg` (JPG ~95 %, well under
   YouTube's 2 MB), note the archetype, camera, text and test answers in
   `plan.md`.

## Pointer placement

Labels and arrows are drawn in the final 1920×1080 frame — **after**
`--crop`. Project the 3D point first (house camera: 30° vertical FOV, 16:9):
pixel `(x, y)` in the uncropped frame; with `--crop cx,cy,cw` the final
point is `((x − cx) · 1920 / cw, (y − cy) · 1920 / cw)`. Check once with
`--grid`.

## Lessons (Titanic, 2026-11-19 — old vs. new thumbnails)

- **Night scenes need the poster rig**: without it the hull vanished and
  only the portholes showed. With `--licht 1.3–1.4` the ship reads.
- **X-ray / cut-away views fail as thumbnails** — transparent hulls turn to
  mush at phone size. Show the solid object; point at the inside with a
  label instead.
- **Crop in**: the first versions left half the frame as empty sky; the
  competitor test showed every rival filling the frame edge to edge.
- **Yellow bars beat white letters** in a dark, blue feed (the old
  „TITANIC: DER WAHRE GRUND“ disappeared; „NICHT NUR DER | EISBERG“ is the
  first thing you see).
- **Label coordinates are post-crop** (first try pointed below the crow's
  nest).
- Thumbnails over 2 MB are refused — grainy PNGs reach 2 MB, so JPG.
