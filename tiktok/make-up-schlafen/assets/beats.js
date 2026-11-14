// #87 Mit Make-up schlafen — every time-keyed decision as plain data, read by
// scene.js (picture) and scripts/build-sfx.mjs (sound). No three.js / DOM.
import { W } from "./timing.js";

// ---------------------------------------------------------------- places
export const HEAD = [0, 1.08, 0.1]; // the sleeper's head on the pillow (lying on the side, face +z)
export const PILLOW = [-0.3, 0, 0.3]; // centre of the throw pillow (top at y 0.5)
export const SKIN = [80, 0, 0]; // giant skin cross-section (far away)
export const LIDSET = [-80, 0, 0]; // giant eye + lid cross-section (the "Übrigens")
// head-local → world while the head rests (rotation z = +90°: (x, y, z) → (−y, x, z))
const hw = (x, y, z) => [HEAD[0] - y, HEAD[1] + x, HEAD[2] + z];
export const EYE_UP = hw(0.25, 0.12, 0.66); // the upper (visible) eye
export const LASH_UP = hw(0.27, 0.2, 0.7);
export const CHEEK_UP = hw(0.36, -0.14, 0.6);
export const SKIN_V = { x: SKIN[0], y: SKIN[1], z: SKIN[2] };
export const LID_V = { x: LIDSET[0], y: LIDSET[1], z: LIDSET[2] };
const rel = (p, o) => [p[0] + o[0], p[1] + o[1], p[2] + o[2]];

// ---------------------------------------------------------------- beats
export const T = {
  faellst: W("fällst"),
  makeup: W("Make-up", 1),
  sagen: W("sagen"),
  ruiniert: W("ruiniert"),
  kissen1: W("Kissen", 1),
  drueckst: W("drückst"),
  kissen2: W("Kissen", 2),
  found1: W("Foundation", 1),
  rouge: W("Rouge"),
  lidschatten: W("Lidschatten"),
  bezug: W("Bezug"),
  doch: W("Doch"),
  repariert: W("repariert"),
  fett: W("Fett"),
  zellen: W("Zellen"),
  poren: W("Poren"),
  obendrauf: W("obendrauf"),
  puder: W("Puder"),
  rate: W("Rate"),
  found2: W("Foundation", 2),
  wimper: W("Wimperntusche"),
  trocknet: W("trocknet"),
  broeselt: W("bröselt"),
  kruemel: W("Krümel"),
  auge: W("Auge"),
  kratzen: W("kratzen"),
  morgens: W("Morgens"),
  entzuenden: W("entzünden"),
  also: W("Also"),
  harmlos: W("harmlos"),
  jede: W("Jede"),
  pickel: W("Pickel"),
  fakt: W("Übrigens"),
  frau: W("Frau"),
  jahre: W("Jahre"),
  aerzte: W("Ärzte"),
  klumpen: W("Klumpen"),
  ehrlich: W("Ehrlich"),
};

// ---------------------------------------------------------------- shots (zoom 1: positions as written)
const Z = 1;
export const shots = [
  // frame 0: the made-up face drops onto the pillow, close and low
  { at: 0, from: [0.9, 1.55, 3.4], to: [0.6, 1.35, 2.8], look: [0.1, 1.15, 0.4], zoom: Z },
  // crash in on the make-up (first cut < 1.5 s)
  {
    at: T.makeup,
    from: [0.35, 1.45, 2.25],
    to: [0.22, 1.38, 1.9],
    look: [0.02, 1.28, 0.7],
    zoom: Z,
  },
  // the room: party leftovers, dawn in the window
  { at: T.sagen, from: [7.5, 3.4, 11.5], to: [5.8, 2.7, 9.6], look: [0, 1.6, -1.5], zoom: Z },
  {
    at: T.ruiniert,
    from: [-1.3, 1.7, 2.5],
    to: [-0.85, 1.55, 2.05],
    look: [0.1, 1.22, 0.6],
    zoom: Z,
  },
  // "Dein Kissen sieht das genauso": pillow level, the pillow big in front
  { at: T.kissen1, from: [-2.5, 0.8, 2.7], to: [-2.0, 0.85, 2.2], look: [0.1, 0.8, 0.45], zoom: Z },
  // she presses half her face into it
  { at: T.drueckst, from: [1.9, 2.3, 3.3], to: [1.45, 1.95, 2.6], look: [0, 0.9, 0.45], zoom: Z },
  // top-down on the pillow: the stains appear (head lifted away)
  { at: T.found1, from: [0.15, 4.5, 1.95], to: [0.05, 3.7, 1.5], look: [-0.1, 0.5, 0.75], zoom: Z },
  // back on the face, push into the cheek
  {
    at: T.doch,
    from: [1.5, 1.9, 2.7],
    to: [0.65, 1.6, 1.65],
    look: [0.12, 1.42, 0.7],
    zoom: Z,
    whip: 1,
  },
  // the skin cross-section
  {
    at: T.repariert,
    rel: SKIN_V,
    from: [2.6, 1.6, 7.6],
    to: [1.6, 1.1, 6.3],
    look: [0, -0.9, 0],
    zoom: Z,
  },
  {
    at: T.fett,
    rel: SKIN_V,
    from: [1.6, 0.3, 4.6],
    to: [1.1, 0.1, 4.0],
    look: [0, -0.9, 1.3],
    zoom: Z,
  },
  {
    at: T.obendrauf,
    rel: SKIN_V,
    from: [0.7, 1.7, 3.3],
    to: [0.45, 1.25, 2.65],
    look: [0, 0, 1.0],
    zoom: Z,
  },
  // "Rate mal": back to the sleeper, slow orbit
  { at: T.rate, orbit: { c: [0.1, 1.2, 0.3], r: 2.6, y: 1.9, a0: 0.65, a1: 0.2 }, zoom: Z },
  // the mascara: macro on the upper eye
  { at: T.wimper, from: [-0.35, 1.55, 1.65], to: [-0.22, 1.42, 1.28], look: EYE_UP, zoom: Z },
  {
    at: T.kruemel,
    from: [0.38, 1.45, 1.3],
    to: [0.2, 1.39, 1.08],
    look: rel(EYE_UP, [0, 0, 0.02]),
    zoom: Z,
  },
  // morning: the eye opens, red, the lid swells
  {
    at: T.morgens,
    from: [0.25, 1.62, 2.25],
    to: [0.12, 1.5, 1.82],
    look: rel(EYE_UP, [0.1, -0.02, 0]),
    zoom: Z,
  },
  // payoff: the sleeper wakes, fine
  { at: T.also, from: [3.6, 2.6, 5.6], to: [2.8, 2.15, 4.6], look: [0.3, 1.15, 0.2], zoom: Z },
  // every night: pimples on the cheek
  { at: T.jede, from: [1.0, 1.9, 2.0], to: [0.62, 1.7, 1.52], look: CHEEK_UP, zoom: Z },
  // Übrigens: the giant eye + lid cross-section, lumps of old mascara
  {
    at: T.fakt,
    rel: LID_V,
    from: [4.8, 1.9, 3.4],
    to: [3.7, 1.5, 2.7],
    look: [-0.3, 0.9, 0.8],
    zoom: Z,
  },
  {
    at: T.aerzte,
    rel: LID_V,
    from: [2.7, 1.75, 2.5],
    to: [2.15, 1.5, 2.05],
    look: [-0.25, 1.25, 1.15],
    zoom: Z,
  },
  // comment question: the room once more, morning light
  { at: T.ehrlich, from: [5.2, 2.5, 7.2], to: [4.3, 2.15, 6.1], look: [0.3, 1.2, 0], zoom: Z },
];

// ---------------------------------------------------------------- labels (one at a time)
export const LABELS = [
  { text: "Foundation", at: T.found1, until: T.rouge + 0.6, pos: [0.15, 0.52, 0.7], side: 1 },
  { text: "Pore", at: T.poren, until: T.obendrauf, pos: rel(SKIN, [0.0, -0.4, 1.3]), side: -1 },
  { text: "Wimperntusche", at: T.wimper + 0.1, until: T.trocknet + 0.9, pos: LASH_UP, side: -1 },
  { text: "Klumpen", at: T.klumpen, until: T.ehrlich, pos: rel(LIDSET, [0, 1.62, 1.05]), side: -1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "shake", at: 0.4, dur: 0.35, amp: 0.7 }, // the head lands
  { kind: "zoom", at: T.makeup, amount: 0.3 },
  { kind: "zoom", at: T.ruiniert, amount: 0.25 },
  { kind: "flash", at: T.bezug }, // the lipstick kiss stamps the pillow
  { kind: "slowmo", at: T.obendrauf, until: T.rate, speed: 0.45 }, // the powder lid closes the pore
  { kind: "zoom", at: T.wimper, amount: 0.35 },
  { kind: "shake", at: T.kratzen, dur: 0.4, amp: 0.6 },
  { kind: "flash", at: T.entzuenden },
  { kind: "zoom", at: T.pickel, amount: 0.3 },
  { kind: "flash", at: T.aerzte + 0.55 }, // the tweezers grab a lump
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "plumps", at: 0.38, db: -6 }, // head on the pillow (frame 0)
  { s: "pop", at: T.found1 + 0.1, db: -14 },
  { s: "pop", at: T.rouge + 0.1, db: -14 },
  { s: "pop", at: T.lidschatten + 0.1, db: -14 },
  { s: "rauschen", at: T.fett, dur: T.obendrauf - T.fett, db: -24 }, // oil oozing up
  { s: "klack", at: T.puder + 0.15, db: -12 }, // powder lid lands
  { s: "knirsch", at: T.broeselt, db: -9 },
  { s: "knirsch", at: T.kruemel + 0.2, db: -12 },
  { s: "pop", at: T.pickel, db: -12 },
  { s: "pop", at: T.pickel + 0.18, db: -12 },
  { s: "pop", at: T.pickel + 0.36, db: -12 },
  { s: "klack", at: T.aerzte + 0.55, db: -12 }, // tweezers grab
];
