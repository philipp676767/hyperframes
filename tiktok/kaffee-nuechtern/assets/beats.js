// #83 Kaffee auf leeren Magen (Format B) — every time-keyed decision as
// plain data, read by scene.js (picture) and scripts/build-sfx.mjs (sound).
import { W } from "./timing.js";

// ---------------------------------------------------------------- places
// MUG: your hand with the mug above the gullet · the stomach cave is at the
// origin · GUT: the coiled gut in its own small cave · SLAB: the cut through
// the stomach wall (mucus layer) in another small cave
export const MUG = [0, 22, 0];
export const GUT = [46, 0, 0];
export const SLAB = [80, 0, 0];
export const POOL = [-1.6, 0, -5.6]; // the acid pool with the steak
export const PORE = [-8.6, 3.4, 2.9]; // acid jets out of the wall here

// ---------------------------------------------------------------- beats
export const T = {
  kaffee: W("Kaffee", 1),
  auf: W("auf", 1),
  zerfrisst: W("Zerfrisst"),
  schluck: W("Schluck"),
  schreckt: W("schreckt"),
  fruehstueck: W("Frühstück", 1),
  also: W("Also"),
  saeure1: W("Säure", 1),
  sauer: W("Sauer"),
  zerlegen: W("zerlegen"),
  nur: W("Nur"),
  kein: W("kein"),
  magenwand1: W("Magenwand", 1),
  manchen: W("manchen"),
  hals: W("Hals"),
  brennt: W("brennt"),
  sodbrennen: W("Sodbrennen"),
  rate: W("Rate"),
  darm: W("Darm"),
  dritten: W("Dritten"),
  klo1: W("Klo", 1),
  warum: W("Warum"),
  schleim: W("Schleimschicht"),
  regenmantel1: W("Regenmantel", 1),
  neu: W("neu"),
  meisten: W("meisten"),
  harmlos: W("harmlos"),
  regenmantel2: W("Regenmantel", 2),
  fakt: W("Übrigens"),
  entkoff: W("entkoffeinierter"),
  klo2: W("Klo", 2),
  koffein: W("Koffein"),
  cta: W("vor"),
};

const P = (o, x, y, z) => [o[0] + x, o[1] + y, o[2] + z];

// ---------------------------------------------------------------- shots
// zoom 1.0 for the whole video (scene.js): positions are the real camera
// positions. Every cut gets a whoosh; `sfx: false` keeps one silent.
export const shots = [
  // 0 · frame 0: your hand tips the mug, the coffee falls — fast push-in
  { at: 0, from: P(MUG, 3.0, 0.4, 4.8), to: P(MUG, 1.8, 0.1, 3.0), look: P(MUG, 0.3, 0.2, 0) },
  // 1 · the coffee falls into the cave like a waterfall (crash in)
  { at: T.auf, from: [3.4, 1.6, 6.4], to: [2.6, 2.3, 4.9], look: [0, 8.5, 0], whip: 1 },
  // 2 · it hits the floor, the brown lake spreads
  { at: T.zerfrisst, from: [3.8, 1.5, 4.6], to: [3.0, 1.15, 3.6], look: [0, 0.5, 0] },
  // 3 · down the gullet with the gulp
  { at: T.schluck, from: [0.75, 19.5, 0.3], to: [0.6, 16.5, 0.25], look: [0, 10, 0] },
  // 4 · the whole cave, the stomach flinches
  { at: T.schreckt, from: [7.2, 6.2, 6.4], to: [6.2, 5.2, 5.6], look: [0, 3, 0] },
  // 5 · it thinks breakfast is coming: the empty floor, steam over the coffee
  { at: T.fruehstueck, from: [-2.5, 2.4, 6.8], to: [-1.6, 2.0, 5.8], look: [0.5, 0.6, 0] },
  // 6 · acid jets out of the wall
  {
    at: T.also,
    from: P(PORE, 3.6, 0.9, 2.6),
    to: P(PORE, 2.6, 0.5, 1.8),
    look: P(PORE, 0.5, 0, 0),
  },
  // 7 · strong enough for meat: the steak fizzes in the acid pool (slowmo)
  {
    at: T.sauer,
    from: P(POOL, 1.4, 3.2, 3.4),
    to: P(POOL, 1.0, 2.6, 2.6),
    look: P(POOL, 0, 0.6, 0),
  },
  // 8 · no meat: the empty pool, ✕
  {
    at: T.kein,
    from: P(POOL, -1.8, 1.9, 3.2),
    to: P(POOL, -1.3, 1.6, 2.5),
    look: P(POOL, 0, 0.6, 0),
  },
  // 9 · only your stomach wall: acid drops sizzle on the floor
  { at: T.magenwand1, from: [-2.0, 1.6, 5.6], to: [-2.7, 1.2, 4.7], look: [-5.2, 0.5, 2.6] },
  // 10 · heartburn: under the gullet, the acid climbs up
  { at: T.manchen, from: [1.6, 8.6, 2.4], to: [0.9, 9.8, 1.4], look: [0, 16, 0] },
  // 11 · the gullet from outside, glowing red
  { at: T.brennt, from: [7.4, 14.2, 8.4], to: [5.8, 15.2, 6.6], look: [0, 16.6, 0] },
  // 12 · mid twist: the gut, asleep
  {
    at: T.rate,
    from: P(GUT, 4.2, 3.8, 4.6),
    to: P(GUT, 3.4, 3.3, 3.8),
    look: P(GUT, 0, 1.2, -0.5),
  },
  // 13 · it wakes up (crash zoom)
  {
    at: T.darm,
    orbit: { c: P(GUT, 0, 1.0, -0.5), r: 5.8, y: P(GUT, 0, 3.8, 0)[1], a0: -0.5, a1: 0.25 },
  },
  // 14 · ab aufs Klo: the toilet roll rolls in
  {
    at: T.klo1,
    from: P(GUT, 4.8, 1.5, 3.6),
    to: P(GUT, 4.2, 1.2, 3.4),
    look: P(GUT, 0.5, 0.5, 3.4),
  },
  // 15 · why does the wall take it? acid drops on the wall
  { at: T.warum, from: P(PORE, 3.6, 1.3, 1.4), to: P(PORE, 2.8, 1.0, 0.9), look: P(PORE, 0, 0, 0) },
  // 16 · the cut through the wall: the mucus layer
  {
    at: T.schleim,
    from: P(SLAB, 4.6, 2.6, 6.0),
    to: P(SLAB, 3.4, 2.1, 4.6),
    look: P(SLAB, 0, 0.9, 0),
  },
  // 17 · like a raincoat: drops bounce off (slowmo)
  {
    at: T.regenmantel1,
    from: P(SLAB, -1.6, 1.7, 3.2),
    to: P(SLAB, -1.0, 1.55, 2.5),
    look: P(SLAB, 0.4, 1.4, 0),
  },
  // 18 · it builds the layer anew
  { at: T.neu, from: P(SLAB, 2.4, 3.2, 3.6), to: P(SLAB, 1.6, 2.8, 3.0), look: P(SLAB, 0, 1.2, 0) },
  // 19 · payoff: the whole cave under its shining coat
  { at: T.meisten, from: [5.0, 4.2, 5.6], to: [4.2, 3.6, 4.8], look: [0, 2.6, 0] },
  // 20 · harmless: the coffee lake, calm
  { at: T.harmlos, from: [-4.4, 2.2, 5.6], to: [-3.4, 1.8, 4.6], look: [0, 0.6, 0] },
  // 21 · Übrigens: the decaf mug pours
  {
    at: T.fakt,
    from: P(MUG, -2.6, 0.6, 5.0),
    to: P(MUG, -1.8, 0.3, 3.6),
    look: P(MUG, 0.3, 0.2, 0),
    whip: -1,
  },
  // 22 · … still off to the loo: the gut wriggles, the roll comes back
  {
    at: T.klo2,
    from: P(GUT, 4.8, 3.4, 4.0),
    to: P(GUT, 4.2, 3.0, 3.4),
    look: P(GUT, 0.3, 0.9, 1.5),
  },
  // 23 · last picture: the waterfall in the cave, still moving
  { at: T.cta, from: [-3.2, 1.4, 6.2], to: [-2.2, 2.0, 5.0], look: [0, 7, 0] },
];

// ---------------------------------------------------------------- labels
// one at a time, ~2.5 s, 4 in the video
export const LABELS = [
  { text: "Magenwand", at: T.magenwand1 + 0.1, until: T.manchen, pos: [-5.2, 0.55, 2.6], side: 1 },
  { text: "Sodbrennen", at: T.sodbrennen, until: T.rate, pos: [0.95, 16.6, 0.4], side: 1 },
  { text: "Darm", at: T.darm + 0.1, until: T.dritten, pos: P(GUT, 0.6, 1.2, 0.6), side: 1 },
  {
    text: "Schleimschicht",
    at: T.schleim + 0.1,
    until: T.regenmantel1,
    pos: P(SLAB, -0.6, 1.62, 1.1),
    side: 1,
  },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "zoom", at: T.auf, amount: 0.3 }, // the waterfall, before 1.5 s
  { kind: "shake", at: T.schreckt, dur: 0.45, amp: 0.8 }, // the stomach flinches
  { kind: "slowmo", at: T.sauer + 0.1, until: T.kein, speed: 0.4 }, // the steak dissolves
  { kind: "flash", at: T.brennt }, // heartburn
  { kind: "zoom", at: T.darm, amount: 0.35 },
  { kind: "shake", at: T.darm + 0.1, dur: 0.4, amp: 0.6 },
  { kind: "slowmo", at: T.regenmantel1 + 0.1, until: T.neu, speed: 0.45 }, // drops bounce off
  { kind: "zoom", at: T.harmlos, amount: 0.25 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "gluckern", at: 0.0, db: -6 }, // frame 0: the coffee pours
  { s: "rauschen", at: T.auf, dur: 1.6, db: -15 }, // the waterfall
  { s: "rauschen", at: T.schluck, dur: 1.1, db: -14 },
  { s: "zisch", at: T.also + 0.25, dur: 1.4, db: -16 }, // acid jets
  { s: "blubbern", at: T.sauer + 0.15, db: -9 }, // acid on the steak
  { s: "zisch", at: T.magenwand1 + 0.2, dur: 1.0, db: -19 }, // drops sizzle on the floor
  { s: "knurren", at: T.darm, db: -6 }, // the gut wakes up
  { s: "pop", at: T.klo1 + 0.1 }, // the toilet roll
  { s: "gluckern", at: T.fakt + 0.05, db: -9 }, // the decaf pours
  { s: "knurren", at: T.klo2, db: -9 },
];
