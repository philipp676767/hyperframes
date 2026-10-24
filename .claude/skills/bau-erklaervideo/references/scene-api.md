# scene.js + set.js on top of world.js, environments.js and props.js

`assets/world.js` builds the renderer and shared props on import and exports
helpers. **`assets/set.js` builds this video's own world** (SKILL.md 1b)
from the set kit `assets/environments.js` and the props in
`assets/props.js`; `scene.js` imports it first (`import "./set.js"`). `assets/timing.js`
holds the word anchors (no three.js, also used in node).
`assets/beats.js` is the video's timing as plain data — `T`, `shots`,
`LABELS`, `SFX` — read by the scene and by `scripts/build-sfx.mjs`
(so keep three.js and the DOM out of it). `assets/scene.js` imports what it needs,
builds the subject, and defines `renderAt(t)` — a **pure function of time**
(no state carried between frames, no `Math.random`, no clocks). The demo
`template/assets/scene.js` is the minimal pattern; `tiktok/kuehlschrank/
assets/scene.js` is the full-size reference (pipes growing, particle flow,
bubbles, analogy sets, door opening).

## Exports

| Export                                                                              | Use                                                                                                                                                                                                                                        |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `THREE`                                                                             | three.js r181                                                                                                                                                                                                                              |
| `W(word, n = 1, end = false)`                                                       | start (or end) time of the n-th spoken `word`; throws if missing                                                                                                                                                                           |
| `LAST`, `END`                                                                       | last word end; `END = LAST + 1`                                                                                                                                                                                                            |
| `HL`, `punch(t)`                                                                    | start times of the `*highlighted*` words; 0..1 punch envelope (shotCamera applies it to the lens automatically)                                                                                                                            |
| `labels(t, LABELS)` / `showLabel(id, k, text, pos, side?)`                          | name tag + arrow on a world point; `labels` pops each `{ text, at, until, pos, side }` in its window. Projected in `renderFrame()`                                                                                                         |
| `clamp01 ramp(t,a,b) lerp smooth easeInOut outBack inBack`                          | timing math; `ramp` gives 0→1 between a and b                                                                                                                                                                                              |
| `pop(t, a, b, d = 0.35)`                                                            | 0 outside [a,b), springs in at a, quick fade at b — for things that appear for a beat                                                                                                                                                      |
| `rng(seed)`, `rand`                                                                 | seeded random (use your own `rng(n)` for per-prop randomness)                                                                                                                                                                              |
| `V(x,y,z)`                                                                          | `new THREE.Vector3`                                                                                                                                                                                                                        |
| `jitter(geom, amt, seed)`                                                           | low-poly wobble that keeps faceted meshes watertight                                                                                                                                                                                       |
| `scene`, `camera`, `renderer`, `ground`                                             | the three.js objects (`ground` holds the landscape)                                                                                                                                                                                        |
| `flat(color, extra)`                                                                | flat-shaded `MeshStandardMaterial`                                                                                                                                                                                                         |
| `M`                                                                                 | shared materials: grass, earth, wood, woodDark, chrome, rubber, copper, alu, steel, concrete, water, steam, orange, … (`Object.assign(M, {...})` to add your own)                                                                          |
| `xrayMaterial(color)` / `setXray([mats], k)` / `xrayEdges(geo)`                     | shell that fades to blue glass (k 0→1) + glowing outline                                                                                                                                                                                   |
| `addFloor(size, colorA, colorB)`                                                    | checkered pad under the subject                                                                                                                                                                                                            |
| `onFrame(fn)`                                                                       | register `fn(t)` to run before every frame (animated scenery)                                                                                                                                                                              |
| `roundedRect(w, h, r)`                                                              | `THREE.Shape` for `ExtrudeGeometry` (rounded boxes, doors, panels)                                                                                                                                                                         |
| `squash(t, at, d = 0.75, base = 1)`                                                 | scale vector for a pop-in: overshoot + squash-and-stretch that settles; `obj.scale.copy(squash(t, at))`                                                                                                                                    |
| `puff(id, t, at, x, y, z, size = 1)`                                                | white dust puff bursting outward for 0.8 s from `at` (call every frame)                                                                                                                                                                    |
| `facet(geo, amt, seed)` / `facetMat(mat)`                                           | per-facet colour tint for a geometry + the vertex-colour twin of a material: `new THREE.Mesh(facet(g, 0.08, 3), facetMat(M.wood))`                                                                                                         |
| `patches(geo, { amt, scale, seed, warm, fn })` / `noise2(x, z, seed)`               | large colour patches over a `facet()` geometry (worn grass, wet sand, shaded snow); `fn(x, z)` adds its own offset. `noise2` = smooth deterministic noise 0..1                                                                             |
| `highlights(HIGHLIGHTS)`                                                            | register the video's big moments (call once in scene.js): `slowmo`, `shake`, `flash`, `zoom`; shots take `whip: ±1`                                                                                                                        |
| `LOOK`                                                                              | camera look settings (post.js): `tilt`, `focus`, `band`, `glow`, `glowFrom`, `vignette`, `ao`, `aoRadius`, `clarity`, `contrast`, `saturation`, `split` (mesh `userData.noAO = true` keeps one out of the AO); shots take `tilt: 0..1` too |
| `showNope(k, x, y, z, size)`                                                        | orange ✕, billboarded; k from `pop()`                                                                                                                                                                                                      |
| `makeArrowSet([[from,to],…], {parent, mat, r, amp})` / `animateArrows(set, t, vis)` | wavy (amp>0) or straight (amp 0) arrows; mats `heatMat coldMat forceMat`                                                                                                                                                                   |
| `showPanel(k, label, value, color)` / `LED.{red,blue,green,yellow}`                 | LED fact sign pinned to the upper third; call every frame, `showPanel(0)` hides                                                                                                                                                            |
| `shotCamera(shots, zoom = 1.7)`                                                     | returns `applyCamera(t)`; shot format below                                                                                                                                                                                                |
| `renderFrame()`                                                                     | billboards + render; last call of `renderAt`                                                                                                                                                                                               |
| `start(renderAt)`                                                                   | wire HyperFrames seeking; call once at the end                                                                                                                                                                                             |

## hand.js — the viewer's hand

| Export                                                   | Use                                                                                                                                                                             |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createHand({ skin, sleeve, left, scale })`              | low-poly right hand (palm down, fingers along +z) with a hoodie sleeve; returns `{ group, pose, track }`                                                                        |
| `hand.track(t, keys)`                                    | call every frame; keys `{ t, pos:[x,y,z], rot:[x,y,z], pose, out? }` are eased; hidden before the first key and after a key with `out: true`. Poses: open point press grab fist |
| `hand.pose(name or {index, middle, ring, pinky, thumb})` | set finger curls directly                                                                                                                                                       |

## timing.js (also in node)

`W`, `LAST`, `END`, `DURATION` (exactly `LENGTH` = 60 s once the voice is
fitted), `HL`, `WORDS`, `LOOP` (old episodes only: start of a `> …` loop
line; null for every new video), `ctaTimes()` (comment / follow / tap / flip moments,
mirrors index.html), `payoffTime()` (legacy: end of "… gebaut." in old episodes; new
scripts have no such line),
`factTime()` (the "Übrigens" word).

**Cover in `start()`** (and, for old episodes with a loop line: from `LOOP` on, `renderAt` receives
`t - DURATION` (negative: the moments before frame 0) and `shotCamera`
glides into the first shot's start pose, so the last frame flows into the
first. Keep effects keyed to anchors ≥ 0 and anything continuous (flames,
snow, rotation) as a function of `t`.)
`window.HF_COVER_T` (set by `make-cover.sh`) freezes the scene at that
time.

## beats.js

```js
import { W, END } from "./timing.js";
export const T = { also: W("Also"), rohr: W("Rohr"), trick: W("Trick"), schau: W("Schau"), … };
export const shots = [ … ];                                   // whoosh on every cut unless { sfx: false }
export const LABELS = [{ text: "Verdampfer", at: T.verdampfer, until: T.jetzt, pos: [0, 1.2, -0.5], side: -1 }];
export const SFX = [{ s: "pop", at: T.also + 0.15 }, { s: "brumm", at: T.pumpe, dur: 3, db: -17 }];
export const HIGHLIGHTS = [
  { kind: "flash", at: T.zack }, { kind: "shake", at: T.zack, dur: 0.5 },
  { kind: "slowmo", at: T.ventil, until: T.duese, speed: 0.3 },  // until = a shot cut
  { kind: "zoom", at: T.kompressor, amount: 0.35 },
];
```

## environments.js — the set kit

No fixed environments: `set.js` composes a new world from these.

| Export                                                                                                              | Use                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `setSky(palette)` / `SKIES`                                                                                         | sky dome, fog, clouds, birds, sun / fill / rim lights — call first. `SKIES.{sonnenuntergang,morgen,mittag,abend,nacht,weltall,tiefsee,hoch}` are starting palettes: spread one and change it (`{ ...SKIES.morgen, top: [r,g,b], sunDir, keyPos, fog: [near, far], clouds: 8, birds: false, stars: 0.4, nightWindows: true }`) |
| `terrain(color, { r, step, flatR, hills, height, seed, amt, scale, warm, fn })`                                     | faceted ground disc with relief + colour patches; `height(x, z, d)` = own relief (may go negative, keep 0 for d < 6)                                                                                                                                                                                                          |
| `discGeo(r, step, seed, height)`                                                                                    | even-triangle disc geometry for any round surface (island tops, ponds, plazas)                                                                                                                                                                                                                                                |
| `pathStrip([[x, z], …], { width, color, lift, seed })`                                                              | path / road / stream bed as a faceted ribbon                                                                                                                                                                                                                                                                                  |
| `pond(x, z, { rx, rz, color })`                                                                                     | glossy, gently rippling pond with a pebble rim                                                                                                                                                                                                                                                                                |
| `sea({ zFrom, depth, width, y, amp })`                                                                              | faceted moving sea (shallow → deep), reflects the sky; the slowest piece to render                                                                                                                                                                                                                                            |
| `meadow({ n, rMin, rMax, seed, keep, flowers, tint })`                                                              | instanced grass tufts + flowers, never on the stage                                                                                                                                                                                                                                                                           |
| `tree(x, z, s, seed)` / `pine(x, z, s, seed, snowy)` / `rocks(n, rMin, rMax, seed, mat)` / `car(x, z, color, rotY)` | vegetation and scenery that sways / sits in the world                                                                                                                                                                                                                                                                         |
| `cloudPuffs(group, n, size, mat, seed)` / `birds(n)`                                                                | an extra cumulus anywhere (cloud sea, steam cloud) / circling birds                                                                                                                                                                                                                                                           |
| `lightString(a, b, { n, sag, colors, glow })`                                                                       | fairy lights / bulbs on a sagging wire between two points                                                                                                                                                                                                                                                                     |
| `fireflies(n, { area, color, seed, size })`                                                                         | glowing drifting motes: fireflies, sparks, dust in a sunbeam, plankton                                                                                                                                                                                                                                                        |
| `F(geo, mat, amt, seed)` / `add(mesh, x, y, z, shadow)`                                                             | faceted mesh / add to the world with shadows                                                                                                                                                                                                                                                                                  |
| `finishSet({ ground })`                                                                                             | last call: image-based light from the sky + the ground colour                                                                                                                                                                                                                                                                 |

The sky light makes glossy materials (`M.chrome`, glass, paint with
`roughness` ≤ 0.3) mirror the sky automatically — give shiny parts of the
subject low roughness so they catch it.

`references/set-beispiele.js` = nine complete earlier sets as a cookbook
(`insel stadt strand winter land weltall tiefsee wolken kueche`, each
`name({ light, seed, palette })`): the town houses with framed windows and
shop awnings, the sloping beach, chimney smoke, crater relief, the faceted
Earth, corals + kelp + light shafts, the cloud sea, the kitchen worktop.
Copy pieces into `set.js` and adapt them; never use a set unchanged.

Dark stage: `setSky(SKIES.studio)` + `darkStage({ floor, accent, spot,
r, horizon, dust })` — glossy floor fading into the dark, warm spotlight
on the origin, neon rim light, thin glowing horizon ring, fine dust.

## hud.js — device-style displays

Call every frame from `renderAt` with `k` (visibility 0..1, from `pop()`);
anything not called is hidden. Positions in frame px (1080 × 1920).

| Function                                                            | Shows                                                          |
| ------------------------------------------------------------------- | -------------------------------------------------------------- |
| `viewfinder(k, { label, time, color })`                             | full-frame camera: corner brackets, REC dot + label, time code |
| `readout(id, k, { label, value, unit, note, x, y, color, digits })` | small panel "TEMPO · 59 km/h · Bremse an"                      |
| `gauge(id, k, { label, value, max, unit, x, y, color, digits })`    | speedometer / pressure gauge with needle                       |
| `stopwatch(id, k, { seconds, max, label, x, y, color })`            | ring + m:ss,s                                                  |
| `counter(id, k, { label, value, x, y, color })`                     | big number ("Paletten 33") — animate `value` with `t`          |
| `meter(id, k, { label, value 0..1, x, y, width, color, text })`     | horizontal bar (Akku, Füllstand, Signal)                       |

## props.js — set dressing (SKILL.md 1b)

`place(obj, x, z, rotY, s, y)` puts a prop in the world (warns when it
lands on the stage); `scatter(make, n, { rMin, rMax, seed, keep, s })`
spreads copies in a ring; `inStage(x, z)`; `sway(group, seed, amp)` makes
anything leafy move. Builders (all return a group on y = 0, front +z):

| Group   | Props                                                                                                                                                 |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nature  | `bush(seed, color)`, `flowerBed(seed, colors)`, `rock(seed, size)`, `palm(seed, lean)`                                                                |
| Street  | `bench()`, `bin()`, `lamp({ on })`, `planter()`, `bike(color)`, `cone()`, `hydrant()`, `sign(color)`, `mailbox()`, `busStop()`, `trafficLight(state)` |
| Shops   | `awning(w, colors)`, `stall(colors, goods)`, `cafeTable(color)`, `parasol(color)`, `crate()`, `barrel()`                                              |
| Country | `fence(len, color)`, `cow(seed)`, `sheep(seed)`, `snowman(scarf)`                                                                                     |

```js
import { place, scatter, cafeTable, bike, bush } from "./props.js";
place(cafeTable(0x2f9e6a), -7.5, -2.5);
place(cafeTable(0x2f9e6a), 7.8, -3.2, 0.6);
place(bike(0xffd23f), 9.5, 1.5, 2.2);
scatter((i) => bush(i), 6, { rMin: 9, rMax: 16, seed: 24 });
```

A new environment is one builder function in `ENV_BUILDERS` plus a
`DEFAULT_SKY` entry. Rules: big ground (radius ~75) or a closed shape,
nothing on the stage (|x| < 6.5, -5 < z < 4.5), nothing tall on the outro
line (x ≈ 0.6·z in front), seeded randomness only (`rng(n)`), animated
details through `onFrame`.

## Shots

```js
const shots = [
  { at: 0, from: [x,y,z], to: [x,y,z], look: [x,y,z] },              // drift from→to
  { at: T.foo, from: …, to: …, look: …, lookTo: […], zoom: 1.2 },      // tilt + tighter
  { at: T.bar, from: …, to: …, look: …, rel: SET_POS },                // relative to an analogy set
  { at: T.baz, orbit: { c: [x,y,z], r: 3, y: 2.4, a0: 0.9, a1: -0.9 } } // a = angle, 0 = front (+z)
];
const applyCamera = shotCamera(shots);
```

A shot lasts until the next `at` (hard cut) and eases from→to over its
length. Positions are pulled back ×`zoom` (default 1.7) from `look`.

## renderAt skeleton

```js
import { T, shots, LABELS } from "./beats.js"; // all beats live there

function renderAt(t) {
  // 1. hook prop: animate its failure, showNope(pop(…)), shrink it away (inBack) on T.also
  // 2. subject: obj.scale.copy(squash(t, T.also + 0.15)); puff("subj", t, T.also + 0.3, 0, 0.05, 0, 1.3)
  // 3. setXray([...shellMats], smooth(ramp(…)) * (1 - ramp(t, T.payoff, T.payoff + 0.5)))
  // 4. per beat: reveal parts (visible / scale / setDrawRange), emissive glow, particles
  // 5. animateArrows(set, t, pop(t, a, b)) for each arrow set
  // 6. analogy sets: animate only while their shot is on screen
  // 7. one showPanel(...) branch per fact, else showPanel(0)
  // 8. outro: x-ray off, a small "it works" moment (door opens, light on, car arrives …)
  // 9. labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
```

## Patterns from the fridge

- **Growing pipe:** `TubeGeometry(curve, segs, r, 8)`; reveal with
  `geo.setDrawRange(0, Math.ceil(p * segs) * 8 * 6)`.
- **Flow along a path:** concatenate dense points into one track with
  cumulative lengths, place `InstancedMesh` beads at `(i/N·L + phase) % L`,
  color by segment; integrate speed into a precomputed phase table so
  stopping/starting stays deterministic.
- **Door / lid:** pivot `Group` at the hinge edge, rotate the group.
- **Pump stroke / vibration:** `Math.abs(Math.sin(...))` and a tiny
  `Math.sin(t * 90) * 0.008` jitter while "on".
- **Steam / bubbles / sparkles:** seeded per-particle phases, position and
  scale as functions of `(t * speed + seed) % 1`.
