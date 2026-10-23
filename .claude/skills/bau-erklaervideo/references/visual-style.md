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

**Alive, not static** (automatic in every env): trees and pines sway
gently, clouds drift, a few low-poly birds circle far out; `insel`,
`land` and `strand` get instanced grass tufts with little flowers (beach
grass on the dunes), always kept off the subject's footprint and the
analogy spots.

**Hand-painted facets** (automatic for the scenery): every triangle of the
ground, island, tree crowns, pines, rocks and mountains is tinted a few
percent lighter / darker / warmer / cooler than its neighbours — the
look of hand-made low-poly art instead of flat plastic. The ground is a
disc of evenly sized facets that rises into soft low hills past r ≈ 36.
Rendered at the full 1080×1920 with 4096² shadow maps, so facet edges and
shadows stay crisp.

**Camera look** (`assets/post.js`, automatic): **ambient occlusion** —
soft contact shadows where surfaces meet (under parts, in corners, at tree
and rock bases), **tilt-shift** — the top
and bottom of the frame melt into a soft blur while the band around the
subject stays sharp (the miniature-photo look that makes the diorama read
as a toy set), a **soft glow** on emissive / very bright things (glowing
wire, LEDs, sun, hot arrows), a light **vignette**, dithering against sky
banding. The LED panel is drawn after it, always sharp. Tweak with `LOOK`
(`LOOK.tilt = 0.6` for a whole video) or per shot (`{ …, tilt: 0 }` for a
shot that must be sharp edge to edge, e.g. a tall subject filling the
frame). The camera has a tiny hand-held drift on top of every shot.

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
- **Build-up:** the subject pops in on the first "Also …". Every
  component the script names appears exactly on its word: tubes grow
  (`setDrawRange`), parts pop in, things light up.
- **Pop-ins are rubbery:** use `obj.scale.copy(squash(t, at))` (overshoot +
  squash-and-stretch that settles) instead of a plain scale, and a dust
  `puff(id, t, at + 0.15, x, y, z, size)` where something big lands on the
  ground. Parts that pop in one after another get staggered by
  0.08–0.15 s, never all on one frame.
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

## The first 3 seconds — where most viewers leave

Data (2026-10-23): on every posted video **< 10 % watched to the end, and
most viewers leave in the first seconds.** A look at #13–#17 showed why:
frame 0 had no title, the first ~3 s were one still camera with only the
voice talking, the spectacle came at ~3 s or later, and an x-ray turned
the picture almost white. Rules for 0–3 s:

- **Frame 0 = a finished thumbnail:** hook title fully visible (template
  does this), the subject big, and the strange thing _already happening_
  (bill being scanned by a blue light, bottle erupting, car shooting up,
  fridge back glowing red) — never a calm object standing there.
- **Motion from frame 0:** the opening shot moves fast (a big push-in or
  orbit, `from` far → `to` close within the shot), never a slow drift.
- **First cut ≤ 1.5 s, a second one ≤ 3 s** (hook shots can be short):
  0–1.5 s the claim in action, 1.5–3 s a closer look / the twist.
- **The spectacle within the first second**, plus a highlight
  (`flash`, `shake` or `zoom`) before 1.5 s.
- **No x-ray in the first 3 s**, and never x-ray a shell that fills the
  frame (the whole picture turns pale) — x-ray only in medium shots.
- **One text at a time on top:** hook title **2–3 huge words** (the
  template sets them in capitals at 140 px and shrinks anything longer to
  two lines), not on top of signs or labels in the scene (move the camera
  so they don't clash).
- **A sound on frame 0:** the topic's own characteristic sound at `at: 0`
  (popcorn pop, alarm, card beep — `SFX` in beats.js, see SKILL.md own
  sounds); if nothing fits, a strong kit sound (`hit`, `zisch`, `klack`).
  Never a silent first frame.
- **The viewer's hand** (`createHand()` from `assets/hand.js`) whenever a
  person would touch the thing: it reaches into frame 0 and does the
  action — presses the button, taps the card, touches the plate. Hands
  stop the scroll and make it "you". Start its keys slightly before 0
  (e.g. `t: -0.6`) so the loop tail already shows it reaching in; keep
  the subject visible next to it.

**Audience (2026-10-23):** 77 % of viewers are 18–34, half women, mostly
random scrollers. Design frame 0 for someone with no interest in
technology: bold, everyday, a bit cheeky — never "school film".

Check: snapshot 0, 0.5, 1, 1.5, 2, 3 s — every image must look different,
frame 0 must make you curious without sound.

## Question banner + progress bar (index.html, automatic)

Viewers left at ~13 s once the hook question felt answered. From 2.9 s
(right after the hook title) the open question stays on screen as a dark
pill with a yellow "?" (`hf-config.question`, ≤ 6 words, keyword in
`<em>`); on the answer word it flips to a green check (+ ding) and leaves.
Below it a progress bar with one segment per build step
(`hf-config.steps`) fills while that part is built and pops "1/3 · 2/3 ·
3/3" (+ blip). Both clear the top before the "WUSSTEST DU?" badge and the
CTA. The LED panel sits lower (≈ y 520–770 px) so it never collides.

## 10–15 s — the second money shot

The drop-off point. Never part names over a calm object here: put the
second big visual moment of the video in this window (slowmo, explosion,
the thing failing, the inside revealed in motion).

## Highlights — never monotone

Feedback on #10: _"wirkt etwas langweilig und monoton, setze ein paar
Highlights"_ and the most spectacular claims were only told, never shown
("sogar kopfüber" over an x-ray car standing on the floor). Rules:

- **Show the claim.** Every spectacular statement gets its own money shot
  in the solid look: the car really drives on the ceiling, the rocket
  really lifts off, the airbag really bursts. 2–3 per video; the
  strongest one is also frame 1 (hook).
- **A highlight every 5–7 s** (`HIGHLIGHTS` in beats.js, world.js):
  `slowmo` (the picture runs at 0.3× while the voice goes on; must end on
  a shot cut), `shake` (impact), `flash` (explosion / ignition / "zack"),
  `zoom` (crash zoom), and shots with `whip: 1` (whip pan in). Sounds are
  added automatically. Mix them, don't repeat one kind back to back.
- **Vary scale and distance:** wide → macro → wide, never three similar
  3/4 views in a row. Use the comparison mini-sets and a "what if it
  fails" moment (the part breaks, the car falls, ✕).
- **Pace changes:** a slow, quiet moment right before the biggest
  highlight makes it hit harder.

## Clarity — nothing may look smeared

Feedback: _"Qualität noch besser, nicht so ineinander verschwimmen."_

- The subject fills **≥ 40 % of the frame height** in most shots; the
  checkered floor pad is optional and small — never half the frame.
- **X-ray at most ~⅓ of the runtime**, only while the inside is
  explained; the money shots and the outro are solid. Inner parts are
  saturated, opaque colours so they read through the glass.
- Tilt-shift stays gentle (`LOOK.tilt` 0.45 default) — raise it only for
  the wide drone outro.
- Strong colour contrast between subject and background (red car on
  green meadow, not light-blue glass on white sky).

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

**Bonus fact badge** (`#fact`): yellow pill "! WUSSTEST DU?" tilted
-3°, top third (y ≈ 300 px), pops in on the word "Übrigens", out when the
CTA starts. Show the fact in the scene too (LED panel with the number, or
a quick close-up) — never an empty shot under it.

**Loop ending:** on the first word of the `> …` line the picture hard-cuts
to the opening shot and plays the moments _before_ frame 0 (world.js maps
t ≥ LOOP to t − DURATION), the buttons clear, the video stops 0.25 s after
the last word. Nothing to build per video — but the hook state at frame 0
must be what the scene shows for t < 0 (it is, if every effect is keyed
with `ramp`/`pop` on anchors ≥ 0).

**Cover (Titelbild):** the scene frozen at one strong moment, no
captions / buttons / labels, dark gradient at the top, title Montserrat
132 px white with a thick dark stroke, keyword yellow, tilted -2°,
y ≈ 300 px (`scripts/make-cover.sh`).

**CTA:** when the CTA line starts, a white "Kommentieren" pill
with a red speech bubble pops in at y ≈ 400 px and pulses; on the word
"folg…" the red "+ Folgen" pill pops in below it (y ≈ 560 px), is tapped
one second later and flips to grey "Gefolgt".

## Sound effects

Every video has a third audio track (`assets/sfx.mp3`) from a synthesized
house kit, so the cuts and pop-ins _feel_ edited. Automatic: whoosh on each
cut (peak on the cut), hit when the hook title lands, punch under each
keyword, blip per name tag, blip per finished build step, ding when the
hook's question is answered (banner ticks green), pop + pop + click + ding on the CTA buttons. Per scene
(`SFX` in beats.js): pop for every part that pops in, zisch (gas, steam,
air out), brumm (motor, compressor), surr (current, hot wire), rauschen
(wind, water), klack (latch, brake, door), click (switch, button), piep
(alarm), geiger (radioactive crackle). **Plus 1–3 sounds of the video's
own** (`assets/sfx-extra/`, synthesized in `scripts/sfx-extra.py` — see
SKILL.md step 4): popcorn popping, an alarm shrieking, coins rattling.
They carry the money shots: the spectacle the picture shows should also
be heard. Effects
sit well under the voice; long loops (zisch/brumm/surr/rauschen) quieter
still and never for more than one beat.
