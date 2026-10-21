# Visual style

The look (toy low-poly, flat colours, soft shadows, pastel light, captions,
CTA) is fixed. The **setting changes every video** — pick one of the
environments in `environments.js` and a sky; never repeat the previous
video's (log: `tiktok/serie.md`). What each video designs is the
**subject**, its **build-up**, and the **shots**.

## Settings (environments.js)

All share: faceted low-poly shapes, flat saturated-pastel colours, soft
shadows, gradient sky with a low sun glow behind the subject (−z), puffy
low-poly clouds, gentle fog into the distance. The subject always stands at
the origin on a clear stage.

- `insel` — floating island (radius 9) with earth cone and hanging roots,
  park trees, rocks; pink haze below. The original look.
- `stadt` — light plaza, asphalt road behind the stage with white dashes,
  double yellow centre line and a zebra crossing, pastel houses with
  window grids (glowing at `abend`), street lamps, parked cars.
- `strand` — sand with wavy shoreline and moving foam, turquoise sea,
  palms with coconuts, umbrella + towel, a rocking sailboat.
- `winter` — snow ground with drifts, snowy pines, lavender mountains with
  snow caps, a cabin with a lit window, falling snow.
- `land` — meadow, dirt road with a wooden fence, striped fields, red barn,
  silo, hay bales, trees.

Skies: `sonnenuntergang` (purple → pink → orange), `morgen` (light blue →
rose → peach), `mittag` (clear blue), `abend` (deep blue-violet, warm
horizon, lit windows/lamps).

Optional checkered floor pad under the subject (`addFloor`) for indoor
things (kitchen tiles, workshop floor) — skip it outdoors.

## Subject

- Built from simple primitives (boxes, extrusions of `roundedRect`,
  cylinders, lathes, tubes), flat-shaded, clean bright colors; the main body
  slightly glossy. ~2–3 units tall, standing at the origin, front = +z.
- Readable silhouette first; detail only where the script points at it.
- **Build-up:** the subject pops in (outBack) on the first "Also …". Every
  component the script names appears exactly on its word: tubes grow
  (`setDrawRange`), parts pop in, things light up.
- **X-ray:** the shell turns to light-blue glass with glowing edges while the
  inside is explained, solid again for the outro.
- **Flow / energy:** particles streaming along paths (cold = blue
  `#2f9bff`, hot = red/orange `#ff3d1f`/`#ffa83a`), wavy arrows for heat/air
  (`heatMat`, `coldMat`), straight yellow arrows for forces (`forceMat`,
  `amp: 0`), bubbles, sparkles, sound rings.
- **Analogy mini-sets** (sweat on skin, bike pump …) stand on the stage
  at about x = ±5, z = 2 and get their own close shot when the comparison
  is spoken.
- **LED panel** (`showPanel`) for every number: short label + big value,
  red = hot/off/danger, blue = cold, green = on/ok, yellow = force/weight.
  Max one at a time.
- **Orange ✕** (`showNope`) when a primitive version fails, or any "das
  klappt nicht" moment.
- **Name tags** (`LABELS` in beats.js → `labels()`): white pill with a
  yellow border, Montserrat 52 px, and a yellow arrow (dark outline) that
  grows from the tag to the part. On the word that names the part, ~2.5 s,
  max 2 at once. Every technical term gets one; also a key part the voice
  points at ("das Seil", "die Pumpe"). Tag goes away from the frame centre
  by default; set `side` so it never sits on the subject.
- **Hook visual:** frame 1 already shows what the hook talks about, in
  motion (the warm back of the fridge glowing, the car dropping, the
  airbag bursting) — the camera may then pull out to the build. Never
  open on an empty stage.

## Erklärbär (mascot)

The channel's low-poly bear (brown, yellow hard hat, round glasses — same
model as the profile picture) lives in a HUD layer glued to the
**lower-left** of the frame (head ≈ y 1330–1450 px), drawn over the world,
never part of the 3D set. Exactly three moments, so it stays special:

- `peek` (hook, ~0.3–2.9 s): leans in half-hidden from the left edge,
  head tilting — "what's this?"
- `wow` (the re-hook / "Trick" word, ~2.2 s): pops up, eyes wide, "O"
  mouth, arms up, hops, yellow sparkles.
- `wave` (from "Schau dich an" to the end): slides in and waves through
  the payoff and CTA.
- optional `nod` (≤ 1×): slides in and nods on a "genau so" moment.

Never during a close-up whose subject sits lower-left — shift the shot
instead of the bear.

## Camera

- Hard cut on a word every 2–4 s; never a static frame — each shot drifts
  (dolly, slow orbit, crane).
- Mix: establishing wide (subject + surroundings), medium 3/4, macro close-ups of
  the part being named (`zoom` 1.0–1.4), one big x-ray orbit when "alles im
  Kreis läuft" / the system is complete.
- Outro: front shot, then a drone pull-back that reveals the whole setting
  under the CTA.
- Keep the vertical centre band (y ≈ 900–1020 px) readable: that's where the
  one-word captions sit, the subject may pass behind them but not a bright
  white surface for long.
- **Punch-ins:** every `*keyword*` snaps the lens ~10 % tighter and eases
  back over ~0.5 s (automatic, `punch()` in world.js) — the "zoom hit" of
  edited TikToks. Don't fake extra ones with shots.

## Captions, hook title, CTA (index.html)

One word at a time, Montserrat ExtraBold 78 px, white with a soft dark
stroke/shadow, hard swap, centred at ~50 % height. Words marked `*Wort*`
in `script.txt` are **yellow `#ffd23f`, 100 px**, and pop in from 145 %.

**Hook title** (`#hook-title`): 3–6 words, 92 px, white with a dark stroke,
keyword in `<em>` (yellow `#ffd23f`), top third (y ≈ 250 px); pops in on
the first frame, out at 2.8 s.

**CTA:** when the last script line starts, a white "Kommentieren" pill
with a red speech bubble pops in at y ≈ 400 px and pulses; on the word
"folg…" the red "+ Folgen" pill pops in below it (y ≈ 560 px), is tapped
one second later and flips to grey "Gefolgt".

## Sound effects

Every video has a third audio track (`assets/sfx.mp3`) from a synthesized
house kit, so the cuts and pop-ins _feel_ edited. Automatic: whoosh on each
cut (peak on the cut), hit when the hook title lands, punch under each
keyword, blip per name tag, boing / wow when the bear appears, ding on
"… gebaut.", pop + pop + click + ding on the CTA buttons. Per scene
(`SFX` in beats.js): pop for every part that pops in, zisch (gas, steam,
air out), brumm (motor, compressor), surr (current, hot wire), rauschen
(wind, water), klack (latch, brake, door), click (switch, button). Effects
sit well under the voice; long loops (zisch/brumm/surr/rauschen) quieter
still and never for more than one beat.
