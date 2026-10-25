// #32 Flugzeugfenster — every time-keyed decision as plain data, read by
// scene.js (picture) and scripts/build-sfx.mjs (sound). No three.js / DOM.
import { W, END } from "./timing.js";

// ---------------------------------------------------------------- places
// (world coordinates, also used for relative shots)
export const FLY = [40, 38, 110]; // the plane in the night sky (hook, beat 1)
export const MOD = [5.6, 0, 7.2]; // the big window panel on its stand
export const CLIP = [-3.4, 0, 8.6]; // the paperclip in the vice
export const PUMP = [-8.4, 0, 3.6]; // the test pump next to the tank

// ---------------------------------------------------------------- beats
export const T = {
  flug1: W("Flugzeuge"),
  zwei: W("Zwei"),
  mitten: W("mitten"),
  ausein: W("auseinandergebrochen"),
  denn: W("Denn"),
  gefaehr: W("gefährlichste"),
  stell: W("Stell"),
  steigt: W("steigt"),
  draussen: W("Draußen"),
  pumpt: W("pumpt"),
  blaest: W("bläst"),
  ballon: W("Ballon"),
  jeden: W("Jeden"),
  folg: W("Folg"),
  rate: W("Rate"),
  fast: W("Fast"),
  tonne: W("Tonne"),
  kraft1: W("Kraft", 1),
  stein: W("Stein"),
  nur: W("nur"),
  ecke1: W("Ecke", 1),
  trotzdem: W("Trotzdem"),
  hundert: W("hundertsten"),
  ingenieure: W("Ingenieure"),
  becken: W("Wasserbecken"),
  immer: W("Immer"),
  nach: W("Nach"),
  n3000: W("3000"),
  zack: W("zack"),
  riss: W("Riss"),
  ermuedung: W("Materialermüdung"),
  klammer: W("Büroklammer"),
  biegst: W("biegst"),
  bricht: W("bricht"),
  ohne: W("Ohne"),
  drumherum: W("drumherum"),
  darum: W("Darum"),
  rund: W("rund"),
  fakt: W("Übrigens"),
  loch1: W("Loch", 1),
  scheiben: W("Scheiben"),
  cta: W("Schon"),
  end: END,
};

const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const F = (o) => add(FLY, o);
const Mo = (o) => add(MOD, o);
const Cl = (o) => add(CLIP, o);

// ---------------------------------------------------------------- shots
// shotCamera(shots, 1): from / to are real camera positions.
export const shots = [
  // HOOK — frame 0: the whole silver jet against the moonlit night, a crack
  // already glowing at a window corner; fast push-in
  { at: 0, from: F([-10.5, -2.2, 5.6]), to: F([-8.0, -1.5, 4.4]), look: F([-0.4, 0.4, 0]) },
  // the window corner, macro: the crack races up over the roof
  {
    at: T.flug1,
    from: F([-0.6, 0.55, 2.4]),
    to: F([-0.9, 0.5, 1.9]),
    look: F([-1.5, 0.32, 0.45]),
    whip: 1,
  },
  // wide from below: the plane tears apart (slowmo)
  { at: T.zwei, from: F([1.6, -2.2, 11.5]), to: F([1.0, -2.0, 10.2]), look: F([-0.9, -0.8, 0]) },
  // the hangar: the same jet parked, a window glows red
  { at: T.denn, from: [-8.5, 2.2, 9.5], to: [-7.2, 2.0, 8.0], look: [0, 1.6, 0] },
  {
    at: T.gefaehr,
    from: [-2.0, 2.4, 3.0],
    to: [-1.6, 2.1, 2.3],
    look: [-1.0, 1.75, 0.5],
    whip: -1,
  },
  // BEAT 1 — flying, a passenger at the lit window
  { at: T.stell, from: F([-2.5, 0.8, 5.5]), to: F([-0.6, 0.6, 4.2]), look: F([-1.0, 0.25, 0]) },
  { at: T.steigt, from: F([6, -3.5, 12]), to: F([4, -2.5, 10]), look: F([0, 0.5, 0]) },
  { at: T.draussen, from: F([2.5, 3.0, 8.0]), to: F([1.5, 2.4, 7.0]), look: F([0, 0, 0]) },
  // x-ray: air pumped in
  { at: T.pumpt, from: F([-3.5, 2.6, 7.0]), to: F([-2.5, 2.0, 6.0]), look: F([0, 0, 0]) },
  // the balloon moment
  {
    at: T.blaest,
    from: F([-4.6, 0.6, 5.4]),
    to: F([-3.4, 0.4, 4.2]),
    look: F([-0.4, 0.1, 0]),
    whip: 1,
  },
  { at: T.jeden, from: F([0.5, 1.0, 9]), to: F([0.5, 0.6, 7.5]), look: F([0, 0, 0]) },
  // follow line: the jet sweeps past in the night
  {
    at: T.folg,
    from: F([-9, 0.8, 10]),
    to: F([-11, 0.4, 9.5]),
    look: F([-2, 0, 0]),
    lookTo: F([-20, -0.5, 0]),
  },
  // BEAT 2 — the window panel on its stand in the hangar
  { at: T.rate, from: Mo([3.0, 2.3, 2.4]), to: Mo([2.4, 2.0, 1.9]), look: Mo([0, 1.6, 0.25]) },
  { at: T.fast, from: Mo([-2.2, 1.9, 1.6]), to: Mo([-1.8, 1.8, 1.3]), look: Mo([0, 1.6, 0.25]) },
  { at: T.kraft1, from: Mo([-1.4, 1.8, 3.4]), to: Mo([-0.6, 1.7, 3.0]), look: Mo([0, 1.6, 0]) },
  // the corner: crash zoom
  {
    at: T.nur,
    from: Mo([0.9, 2.5, 1.5]),
    to: Mo([0.75, 2.25, 1.1]),
    look: Mo([0.38, 2.05, 0]),
    whip: 1,
  },
  // mid twist: quiet, slow push on the pulsing panel
  { at: T.trotzdem, from: Mo([-1.8, 2.6, 4.2]), to: Mo([-1.1, 2.1, 3.0]), look: Mo([0, 1.6, 0]) },
  // BEAT 3 — the water tank rises around the jet
  { at: T.ingenieure, from: [9.5, 6.5, 13], to: [8.0, 5.4, 11], look: [0, 1.3, 0] },
  {
    at: T.immer,
    from: add(PUMP, [3.4, 2.4, 4.4]),
    to: add(PUMP, [2.9, 2.1, 3.8]),
    look: add(PUMP, [0.8, 1.0, -0.4]),
  },
  { at: T.nach, from: [-4.5, 3.2, 6.8], to: [-3.6, 2.8, 5.6], look: [-0.8, 1.6, 0] },
  // zack: the burst
  { at: T.zack, from: [-4.2, 2.4, 6.2], to: [-3.8, 2.7, 5.6], look: [-0.9, 3.0, 0] },
  // the crack at the window corner, macro
  {
    at: T.riss,
    from: Mo([1.0, 2.6, 1.6]),
    to: Mo([0.8, 2.4, 1.2]),
    look: Mo([0.45, 2.15, 0]),
    whip: -1,
  },
  // the paperclip
  { at: T.klammer, from: Cl([-1.3, 2.1, 2.3]), to: Cl([-1.0, 1.95, 1.8]), look: Cl([0, 1.75, 0]) },
  // PAYOFF — the window turns round, the force glides around it
  { at: T.ohne, from: Mo([1.4, 2.0, 3.2]), to: Mo([0.5, 1.8, 2.6]), look: Mo([0, 1.6, 0]) },
  { at: T.darum, from: [-6.5, 2.4, 7.5], to: [-5.0, 2.1, 6.2], look: [0, 1.7, 0] },
  // FACT — the cabin side of the window: three panes, the tiny hole
  {
    at: T.fakt,
    from: Mo([-1.25, 1.9, -1.9]),
    to: Mo([-0.9, 1.75, -1.5]),
    look: Mo([0, 1.45, -0.1]),
  },
  // CTA — the jet in the hangar, then the drone pulls out into the night
  {
    at: T.cta,
    from: [5.5, 3.0, 10],
    to: [14, 9, 24],
    look: [0, 1.6, 0],
    lookTo: [0, 2.2, -4],
    tilt: 0.7,
  },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  {
    text: "Ecke",
    at: T.ecke1,
    until: T.trotzdem,
    pos: [MOD[0] + 0.4, 2.06, MOD[2] + 0.05],
    side: -1,
  },
  { text: "Wasserbecken", at: T.becken, until: T.immer, pos: [3.5, 2.6, 1.7], side: -1 },
  {
    text: "Materialermüdung",
    at: T.ermuedung,
    until: T.klammer,
    pos: [MOD[0] + 0.6, 2.35, MOD[2] + 0.05],
    side: -1,
  },
  { text: "Loch", at: T.loch1, until: T.cta, pos: [MOD[0], 1.18, MOD[2] - 0.06], side: 1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "zoom", at: 0.85, amount: 0.3 }, // the crack flares before 1.5 s
  { kind: "flash", at: T.flug1 },
  { kind: "slowmo", at: T.mitten, until: T.denn, speed: 0.4 }, // the jet tears apart
  { kind: "shake", at: T.mitten + 0.15, dur: 0.7, amp: 1.2 },
  { kind: "zoom", at: T.gefaehr, amount: 0.3 },
  { kind: "shake", at: T.ballon, dur: 0.5, amp: 0.7 },
  { kind: "zoom", at: T.ballon, amount: 0.3 },
  { kind: "flash", at: T.tonne },
  { kind: "shake", at: T.tonne, dur: 0.5, amp: 0.9 },
  { kind: "zoom", at: T.ecke1, amount: 0.3 },
  { kind: "zoom", at: T.hundert, amount: 0.2 },
  { kind: "shake", at: T.ingenieure + 0.5, dur: 0.4, amp: 0.6 },
  { kind: "flash", at: T.zack },
  { kind: "shake", at: T.zack, dur: 0.8, amp: 1.3 },
  { kind: "slowmo", at: T.zack + 0.05, until: T.riss, speed: 0.4 },
  { kind: "flash", at: T.bricht + 0.2 },
  { kind: "zoom", at: T.rund, amount: 0.25 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "reissen", at: 0.02, db: -9 }, // frame 0: metal groans and cracks
  { s: "reissen", at: T.mitten + 0.1, db: -7 },
  { s: "rauschen", at: T.stell, dur: T.folg - T.stell, db: -24 }, // wind at altitude
  { s: "zisch", at: T.pumpt, dur: 1.6, db: -19 }, // air pumped in
  { s: "boing", at: T.ballon, db: -14 },
  { s: "klack", at: T.tonne, db: -10 },
  { s: "pop", at: T.ingenieure + 0.15 },
  { s: "pop", at: T.ingenieure + 0.3 },
  { s: "pop", at: T.ingenieure + 0.45 },
  { s: "rauschen", at: T.ingenieure + 0.5, dur: 1.4, db: -20 }, // water fills
  { s: "pumpe", at: T.immer, dur: T.zack - T.immer, db: -14 },
  { s: "reissen", at: T.zack, db: -6 },
  { s: "klack", at: T.biegst, db: -14 },
  { s: "klack", at: T.biegst + 0.45, db: -14 },
  { s: "reissen", at: T.bricht + 0.2, db: -12 },
  { s: "zisch", at: T.loch1, dur: 1.2, db: -22 }, // air through the tiny hole
];
