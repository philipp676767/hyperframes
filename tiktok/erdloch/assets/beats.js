// Beats of #31 "Erdloch" (format B): you jump into a hole straight through
// the Earth. Plain data — read by scene.js (picture) and build-sfx.mjs (sound).
import { W } from "./timing.js";

// ---------------------------------------------------------------- beats
export const T = {
  loch: W("Loch", 1),
  erde: W("Erde"),
  anlauf: W("Anlauf"),
  springst: W("springst", 2),
  faellst1: W("fällst", 1),
  faellst2: W("fällst", 2),
  unten: W("unten"),
  gluehendes: W("Glühendes"),
  keine: W("Keine"),
  immer: W("immer", 1),
  bald: W("bald"),
  flugzeug: W("Flugzeug"),
  seltsame: W("Seltsame"),
  gewicht: W("Gewicht"),
  schwebst: W("schwebst"),
  folg: W("Folg"),
  nach1: W("Nach", 1),
  rast: W("rast"),
  ueber: W("über"),
  dreissig: W("30.000"),
  um: W("Um"),
  erdkern: W("Erdkern"),
  heiss: W("heiß"),
  sonne: W("Sonne"),
  rate: W("Rate"),
  australien: W("Australien"),
  falsch: W("Falsch"),
  mitten: W("Mitten"),
  pazifik: W("Pazifik"),
  neuseeland: W("Neuseeland"),
  ab: W("Ab"),
  schwerkraft: W("Schwerkraft"),
  bremst: W("bremst", 2),
  nach2: W("Nach", 2),
  drueben: W("drüben"),
  genau: W("genau"),
  still: W("still"),
  haeltst: W("Hältst"),
  fest: W("fest"),
  faellst3: W("fällst", 3),
  zurueck: W("zurück"),
  fuer: W("Für", 2),
  uebrigens: W("Übrigens"),
  tiefste: W("tiefste"),
  zwoelf: W("12"),
  was2: W("Was", 2),
};

// world anchors (scene.js builds them there)
export const FALL = [-150, -60, 0]; // the endless shaft: you stay here, the walls race past
export const ISLAND = [0, 0, 180]; // the exit: a tiny island in the Pacific
export const GLOBE = [0, -420, 0]; // the halved Earth, in a space bubble far below
export const GLOBE2 = [36, -420, -6]; // the whole Earth (where do you come out?)

// ---------------------------------------------------------------- shots
const tun = { rel: FALL, zoom: 1, tilt: 0.25 };
const gl = { rel: GLOBE, zoom: 1, tilt: 0.2 };
const gl2 = { rel: GLOBE2, zoom: 1, tilt: 0.2 };
export const shots = [
  // 0: POV over the rim, your hand on the edge, the shaft glows far below
  { at: 0, from: [0.2, 4.4, 2.6], to: [0.12, 3.3, 1.9], look: [0, -4, -0.2], zoom: 1, tilt: 0.3 },
  // 1.2: the garden — you at the rim, the gnome peering in
  { at: 1.2, from: [6.4, 3.6, 8.2], to: [4.6, 2.6, 6.2], look: [-0.4, 0.4, 0] },
  // your face over the abyss
  {
    at: T.erde,
    from: [1.5, 1.45, 1.1],
    to: [1.15, 1.25, 0.85],
    look: [-1.6, 0.75, 0.3],
    zoom: 1.2,
  },
  // run-up, side view
  { at: T.anlauf, from: [-2.6, 1.3, 5.2], to: [-1.6, 1.1, 4.4], look: [-2.2, 0.6, 0.2] },
  // straight down as you dive in (crash zoom)
  {
    at: T.springst,
    from: [0.15, 6.5, 0.9],
    to: [0.1, 4.2, 0.6],
    look: [0, -4, 0],
    zoom: 1,
    tilt: 0.2,
  },
  // in the shaft: above you, looking down past your feet
  { at: T.faellst1, ...tun, from: [0.9, 2.6, 1.1], to: [0.6, 2.0, 0.8], look: [0, -1.5, 0] },
  // below you, looking up at the shrinking daylight
  {
    at: T.faellst2,
    ...tun,
    from: [0.9, -2.8, 1.0],
    to: [0.7, -2.2, 0.8],
    look: [0, 0.9, 0],
    whip: 1,
  },
  // straight down: something glowing far below
  { at: T.unten, ...tun, from: [0.5, 2.2, 0.6], to: [0.35, 1.6, 0.45], look: [0, -14, 0] },
  // close, from the side: no wind, nothing slows you
  { at: T.keine, ...tun, orbit: { c: [0, 0.6, 0], r: 1.9, y: 1.0, a0: 0.9, a1: -0.3 } },
  // below-side: faster and faster
  { at: T.immer, ...tun, from: [1.3, -1.6, 1.1], to: [1.1, -1.2, 1.0], look: [0, 0.5, 0] },
  // the plane: you overtake it
  { at: T.bald, ...tun, from: [2.1, -0.1, 0.6], to: [2.0, 0.2, 0.55], look: [0, 0.3, 0], whip: -1 },
  // weightless: hood strings and your phone float (slow motion)
  { at: T.seltsame, ...tun, orbit: { c: [0, 0.85, 0], r: 1.3, y: 1.1, a0: -0.5, a1: 0.6 } },
  // follow line: a calm look down the shaft
  { at: T.folg, ...tun, from: [0.9, 2.4, 1.0], to: [0.7, 2.0, 0.8], look: [0, -2, 0] },
  // 19 minutes: the halved Earth, you are a dot racing to the centre
  { at: T.nach1, ...gl, from: [3.4, 2.4, 11.5], to: [2.2, 1.6, 9.2], look: [0, 0, 0] },
  // over 30,000 km/h — close on the dot at the centre
  { at: T.ueber, ...gl, from: [1.6, 0.9, 4.2], to: [0.9, 0.5, 3.1], look: [0, 0, 0] },
  // money shot: the white-hot core rushing past
  { at: T.um, ...tun, from: [1.2, 2.3, 1.0], to: [0.9, 1.8, 0.8], look: [0, -3, 0] },
  // as hot as the surface of the sun: macro on the glowing core
  { at: T.heiss, ...gl, from: [-1.3, 0.7, 3.4], to: [-0.8, 0.4, 2.5], look: [0, 0, 0] },
  // Rate mal: the whole Earth, your pin on Austria
  { at: T.rate, ...gl2, from: [0.4, 0.8, 12.5], to: [0.2, 0.6, 10.8], look: [0, 0, 0] },
  // Australien? — the Earth spins
  {
    at: T.australien,
    ...gl2,
    from: [-1.2, -0.6, 10.2],
    to: [-0.8, -0.8, 9.6],
    look: [0, -0.4, 0],
    whip: 1,
  },
  // Mitten im Pazifik — crash in on the open ocean
  { at: T.mitten, ...gl2, from: [0.6, -0.4, 8.8], to: [0.4, -0.8, 7.4], look: [0.2, -1.2, 0] },
  // from the middle on gravity pulls you back
  { at: T.ab, ...gl, from: [5.4, 3.2, 9.6], to: [4.4, 2.4, 8.4], look: [0.6, -0.4, 0] },
  // it brakes you: rising in the exit shaft towards the light
  {
    at: T.bremst,
    rel: [0, 0, 180],
    zoom: 1,
    tilt: 0.25,
    from: [0.32, -2.1, 0.1],
    to: [0.28, -1.7, 0.2],
    look: [0, 6, 0.4],
    follow: true,
  },
  // the other side: a tiny island in the Pacific, you rise out of the hole
  {
    at: T.genau,
    rel: [0, 0, 180],
    zoom: 1,
    tilt: 0.35,
    from: [2.7, 1.5, 4.3],
    to: [2.0, 1.1, 3.3],
    look: [0, 0.55, 0.3],
  },
  // close: you grab for the rim … and miss
  {
    at: T.haeltst,
    rel: [0, 0, 180],
    zoom: 1,
    tilt: 0.3,
    from: [1.4, 1.7, 2.7],
    to: [1.1, 1.4, 2.2],
    look: [0, 0.25, 0.5],
  },
  // you drop back into the dark (top-down)
  {
    at: T.zurueck,
    rel: [0, 0, 180],
    zoom: 1,
    tilt: 0.2,
    from: [0.2, 4.6, 0.9],
    to: [0.15, 3.4, 0.7],
    look: [0, -4, 0.4],
  },
  // forever back and forth: the dot swings through the Earth
  { at: T.fuer, ...gl, from: [-4.2, 3.0, 10.6], to: [-3.2, 2.4, 9.4], look: [0, 0, 0] },
  // Übrigens: the deepest hole ever drilled — a scratch on the north pole
  { at: T.uebrigens, ...gl, from: [0.5, 4.55, 1.05], to: [0.3, 4.35, 0.75], look: [0, 4.02, 0] },
  {
    at: T.tiefste,
    ...gl,
    from: [0.9, 4.9, 2.2],
    to: [3.4, 6.4, 9.5],
    look: [0, 3.95, 0],
    lookTo: [0, 0.6, 0],
  },
  // CTA: back in the garden, drone pull-back, the gnome still peering in
  {
    at: T.was2,
    from: [2.6, 2.2, 4.4],
    to: [9.5, 7.8, 15.5],
    look: [0, 0.4, 0],
    lookTo: [0, 0, -2],
    tilt: 0.7,
  },
];

// ---------------------------------------------------------------- labels
// (moving things — the pins, the gravity arrows — get their tags in scene.js)
export const LABELS = [
  {
    text: "Erdkern",
    at: T.erdkern,
    until: T.heiss,
    pos: [FALL[0] + 1.7, FALL[1] - 4, FALL[2] + 0.9],
  },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "zoom", at: 0.45, amount: 0.3 }, // your hand slaps the rim, dirt crumbles in
  { kind: "zoom", at: T.springst + 0.05, amount: 0.35 }, // the dive
  { kind: "shake", at: T.faellst1, dur: 0.35, amp: 0.6 },
  { kind: "flash", at: T.gluehendes },
  { kind: "zoom", at: T.gluehendes, amount: 0.3 },
  { kind: "shake", at: T.flugzeug, dur: 0.45, amp: 0.8 }, // you blast past the plane
  { kind: "slowmo", at: T.gewicht - 0.6, until: T.folg, speed: 0.35 }, // weightless
  { kind: "flash", at: T.dreissig },
  { kind: "shake", at: T.erdkern, dur: 0.6, amp: 1 },
  { kind: "flash", at: T.erdkern },
  { kind: "shake", at: T.falsch, dur: 0.4, amp: 0.8 },
  { kind: "zoom", at: T.mitten, amount: 0.35 },
  { kind: "slowmo", at: T.still, until: T.haeltst, speed: 0.35 }, // the moment of standstill
  { kind: "zoom", at: T.zurueck, amount: 0.3 },
  { kind: "zoom", at: T.zwoelf, amount: 0.25 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "klack", at: 0.42, db: -10 }, // your hand slaps the rim
  { s: "pop", at: 0.5, db: -16 }, // dirt crumbles
  { s: "boing", at: T.springst - 0.12, db: -14 }, // the jump
  { s: "surr", at: T.gluehendes - 0.2, dur: 1.2, db: -22 },
  { s: "whoosh", at: T.flugzeug - 0.15, db: -10 }, // past the plane
  { s: "click", at: T.nach1 + 0.1, db: -12 }, // stopwatch
  { s: "brumm", at: T.um, dur: T.heiss - T.um, db: -18 }, // the core roars past
  { s: "zisch", at: T.erdkern, dur: 1.6, db: -20 },
  { s: "pop", at: T.rate + 0.35, db: -14 }, // pin on Austria
  { s: "pop", at: T.mitten + 0.3, db: -14 }, // pin in the Pacific
  { s: "click", at: T.bremst + 0.1, db: -14 },
  { s: "klack", at: T.fest + 0.05, db: -12 }, // the hand closes on nothing
  { s: "click", at: T.fuer + 0.2, db: -14 },
  { s: "pop", at: T.zwoelf - 0.05, db: -14 },
];
