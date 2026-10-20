# scene.js on top of world.js + environments.js

`assets/world.js` builds the renderer and shared props on import and exports
helpers; `assets/environments.js` exports `createWorld({ env, sky })`, which
builds sky, lights and the landscape — call it first. `assets/scene.js` imports what it needs,
builds the subject, and defines `renderAt(t)` — a **pure function of time**
(no state carried between frames, no `Math.random`, no clocks). The demo
`template/assets/scene.js` is the minimal pattern; `tiktok/kuehlschrank/
assets/scene.js` is the full-size reference (pipes growing, particle flow,
bubbles, analogy sets, door opening).

## Exports

| Export                                                                              | Use                                                                                                                                                               |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `THREE`                                                                             | three.js r181                                                                                                                                                     |
| `W(word, n = 1, end = false)`                                                       | start (or end) time of the n-th spoken `word`; throws if missing                                                                                                  |
| `LAST`, `END`                                                                       | last word end; `END = LAST + 1`                                                                                                                                   |
| `clamp01 ramp(t,a,b) lerp smooth easeInOut outBack inBack`                          | timing math; `ramp` gives 0→1 between a and b                                                                                                                     |
| `pop(t, a, b, d = 0.35)`                                                            | 0 outside [a,b), springs in at a, quick fade at b — for things that appear for a beat                                                                             |
| `rng(seed)`, `rand`                                                                 | seeded random (use your own `rng(n)` for per-prop randomness)                                                                                                     |
| `V(x,y,z)`                                                                          | `new THREE.Vector3`                                                                                                                                               |
| `jitter(geom, amt, seed)`                                                           | low-poly wobble that keeps faceted meshes watertight                                                                                                              |
| `scene`, `camera`, `renderer`, `ground`                                             | the three.js objects (`ground` holds the landscape)                                                                                                               |
| `flat(color, extra)`                                                                | flat-shaded `MeshStandardMaterial`                                                                                                                                |
| `M`                                                                                 | shared materials: grass, earth, wood, woodDark, chrome, rubber, copper, alu, steel, concrete, water, steam, orange, … (`Object.assign(M, {...})` to add your own) |
| `xrayMaterial(color)` / `setXray([mats], k)` / `xrayEdges(geo)`                     | shell that fades to blue glass (k 0→1) + glowing outline                                                                                                          |
| `addFloor(size, colorA, colorB)`                                                    | checkered pad under the subject                                                                                                                                   |
| `onFrame(fn)`                                                                       | register `fn(t)` to run before every frame (animated scenery)                                                                                                     |
| `roundedRect(w, h, r)`                                                              | `THREE.Shape` for `ExtrudeGeometry` (rounded boxes, doors, panels)                                                                                                |
| `showNope(k, x, y, z, size)`                                                        | orange ✕, billboarded; k from `pop()`                                                                                                                             |
| `makeArrowSet([[from,to],…], {parent, mat, r, amp})` / `animateArrows(set, t, vis)` | wavy (amp>0) or straight (amp 0) arrows; mats `heatMat coldMat forceMat`                                                                                          |
| `showPanel(k, label, value, color)` / `LED.{red,blue,green,yellow}`                 | LED fact sign pinned to the upper third; call every frame, `showPanel(0)` hides                                                                                   |
| `shotCamera(shots, zoom = 1.7)`                                                     | returns `applyCamera(t)`; shot format below                                                                                                                       |
| `renderFrame()`                                                                     | billboards + render; last call of `renderAt`                                                                                                                      |
| `start(renderAt)`                                                                   | wire HyperFrames seeking; call once at the end                                                                                                                    |

## environments.js

| Export                      | Use                                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `createWorld({ env, sky })` | build the setting; env `insel stadt strand winter land`, sky `sonnenuntergang morgen mittag abend` (optional) |
| `ENVIRONMENTS`, `SKIES`     | the available names / sky palettes                                                                            |
| `tree(x, z, s, seed)`       | extra park tree if a shot needs framing                                                                       |

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
const T = { also: W("Also", 1), rohr: W("Rohr"), … };   // all beats here

function renderAt(t) {
  // 1. hook prop: animate its failure, showNope(pop(…)), shrink it away (inBack) on T.also
  // 2. subject: scale = outBack(ramp(t, T.also + 0.15, T.also + 0.75))
  // 3. setXray([...shellMats], smooth(ramp(…)) * (1 - ramp(t, T.schau, T.schau + 0.5)))
  // 4. per beat: reveal parts (visible / scale / setDrawRange), emissive glow, particles
  // 5. animateArrows(set, t, pop(t, a, b)) for each arrow set
  // 6. analogy sets: animate only while their shot is on screen
  // 7. one showPanel(...) branch per fact, else showPanel(0)
  // 8. outro: x-ray off, a small "it works" moment (door opens, light on, car arrives …)
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
