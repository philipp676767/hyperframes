# Visual style

The world (sky, island, trees, lighting, captions, CTA) is fixed in
`world.js` / `index.html` — don't restyle it per video. What each video
designs is the **subject**, its **build-up**, and the **shots**.

## World (fixed)

- Floating low-poly island (radius 9, grass top at y = 0), brown earth cone
  with hanging roots, pink haze below.
- Sunset sky: purple top → pink → orange horizon, low sun glow behind the
  subject (sun direction −z), soft pink low-poly clouds.
- Faceted trees around the edge, rocks, bushes; optional checkered floor pad
  under the subject (`addFloor`) for indoor things (kitchen, workshop).
- Toy-like, saturated, soft shadows. No realism, no textures beyond flat
  colors and the floor checker.

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
- **Analogy mini-sets** (sweat on skin, bike pump …) stand on the island
  at about x = ±5, z = 2 and get their own close shot when the comparison
  is spoken.
- **LED panel** (`showPanel`) for every number: short label + big value,
  red = hot/off/danger, blue = cold, green = on/ok, yellow = force/weight.
  Max one at a time.
- **Orange ✕** (`showNope`) when the hook's primitive version fails, or
  any "das klappt nicht" moment.

## Camera

- Hard cut on a word every 2–4 s; never a static frame — each shot drifts
  (dolly, slow orbit, crane).
- Mix: establishing wide (subject + island), medium 3/4, macro close-ups of
  the part being named (`zoom` 1.0–1.4), one big x-ray orbit when "alles im
  Kreis läuft" / the system is complete.
- Outro: front shot, then a drone pull-back that reveals the whole floating
  island under the CTA.
- Keep the vertical centre band (y ≈ 900–1020 px) readable: that's where the
  one-word captions sit, the subject may pass behind them but not a bright
  white surface for long.

## Captions / CTA (fixed in index.html)

One word at a time, Montserrat ExtraBold 78 px, white with a soft dark
stroke/shadow, hard swap, centred at ~50 % height. CTA pill (TikTok red
`#fe2c55`, "+ Folgen") pops in at y ≈ 560 px on "Folg", is tapped one second
later and flips to grey "Gefolgt".
