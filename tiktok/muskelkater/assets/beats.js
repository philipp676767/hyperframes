// #47 "Muskelkater" — every time-keyed decision as plain data, read by
// scene.js (picture) and scripts/build-sfx.mjs (sound). No three.js / DOM.
import { W } from "./timing.js";

export const T = {
  kater1: W("Muskelkater", 1),
  bergauf: W("bergauf"),
  stell: W("Stell"),
  berg: W("Berg"),
  dienstag: W("Dienstag"),
  rueck: W("rückwärts"),
  keine: W("keine"),
  milch1: W("Milchsäure", 1),
  dein1: W("Dein", 1),
  kaputt: W("kaputt"),
  faser: W("Muskelfaser"),
  kette: W("Kette"),
  sport: W("Sport"),
  reissen: W("reißen"),
  risse: W("Mikrorisse"),
  und1: W("Und", 1),
  rate: W("Rate"),
  stunde: W("Stunde"),
  wo: W("Wo"),
  das3: W("Das", 3),
  verrueckt: W("Verrückte"),
  bergab2: W("Bergab", 2),
  weniger: W("weniger"),
  dein2: W("Dein", 2),
  er: W("Er", 1),
  gedehnt: W("gedehnt"),
  zieht: W("zieht"),
  dabei: W("Dabei"),
  reisst: W("reißt"),
  risse2: W("Risse"),
  reparatur: W("Reparatur"),
  der: W("Der"),
  schwillt: W("schwillt"),
  drueckt: W("drückt"),
  nerven: W("Nerven"),
  bergab3: W("Bergab", 3),
  bremse: W("Bremse"),
  bremsen: W("Bremsen"),
  uebrigens: W("Übrigens"),
  schuetzt: W("schützt"),
  wochen: W("Wochen"),
  folge: W("Folge"),
};

// inside the muscle: its own little world deep under the meadow
export const MAC = [0, -60, 0];
const mac = (x, y, z) => [MAC[0] + x, MAC[1] + y, MAC[2] + z];
// the brake comparison stands on the meadow left of the stairs
export const BR = [-4.4, 0, 2.4];
const br = (x, y, z) => [BR[0] + x, BR[1] + y, BR[2] + z];
// tear sites in the muscle fibre (x along the fibre)
export const TEAR1 = 0.35;
export const TEAR2 = -1.75;

// ---------------------------------------------------------------- shots
// rel: "hiker" = relative to the hiker's pelvis (scene.js swaps in a live
// vector); the others are world positions.
const H = "hiker";
export const shots = [
  // hook: front-low push-in on the hiker stepping down, thighs glowing red
  { at: 0, rel: H, from: [1.4, -0.1, 5.4], to: [0.8, -0.3, 3.6], look: [0, 0.3, 0], zoom: 1 },
  {
    at: T.kater1,
    rel: H,
    from: [0.95, -0.3, 1.7],
    to: [0.6, -0.35, 1.25],
    look: [0, -0.4, 0],
    zoom: 1,
  },
  {
    at: T.bergauf,
    rel: H,
    from: [3.4, 0.5, 1.3],
    to: [3.0, 0.35, 0.5],
    look: [0, -0.3, 0],
    zoom: 1,
  },
  // Sunday: the wide establishing shot, hut and summit behind
  { at: T.stell, from: [6.4, 4.2, 10], to: [5.0, 3.0, 7.6], look: [0, 1.7, -3], zoom: 1 },
  { at: T.berg, rel: H, from: [-1.6, 0.2, 3.5], to: [-1.0, 0.05, 3.0], look: [0, 0, 0], zoom: 1 },
  // Tuesday: backwards down the stairs
  {
    at: T.dienstag,
    rel: H,
    from: [4.6, 0.6, 0.9],
    to: [3.9, 0.4, 0.3],
    look: [0, -0.1, 0],
    zoom: 1,
    whip: 1,
  },
  {
    at: T.rueck,
    rel: H,
    from: [-2.0, -0.4, 1.4],
    to: [-1.6, -0.5, 1.0],
    look: [0, -0.4, 0],
    zoom: 1,
  },
  {
    at: T.keine,
    rel: H,
    from: [0.7, 0.25, 3.3],
    to: [0.45, 0.1, 2.8],
    look: [0, -0.15, 0],
    zoom: 1,
  },
  // x-ray: the muscle is broken
  {
    at: T.dein1,
    rel: H,
    from: [1.5, -0.2, 2.0],
    to: [1.05, -0.3, 1.55],
    look: [0, -0.4, 0],
    zoom: 1,
  },
  // inside the muscle
  {
    at: T.faser,
    from: mac(-3.2, 1.4, 3.8),
    to: mac(-1.6, 0.9, 2.8),
    look: mac(0, 0, 0),
    zoom: 1,
    whip: 1,
  },
  {
    at: T.sport,
    from: mac(1.7, 0.95, 3.0),
    to: mac(1.15, 0.65, 2.4),
    look: mac(TEAR1, 0, 0),
    zoom: 1,
  },
  {
    at: T.risse,
    orbit: { c: mac(TEAR1, 0, 0), r: 2.3, y: MAC[1] + 0.7, a0: 0.7, a1: -0.25 },
    zoom: 1,
  },
  // back on the trail: the lactic acid leaves within the hour
  {
    at: T.und1,
    rel: H,
    from: [1.7, -0.1, 2.5],
    to: [1.25, -0.2, 2.05],
    look: [0, -0.35, 0],
    zoom: 1,
  },
  {
    at: T.stunde,
    rel: H,
    from: [-1.2, 0.1, 2.6],
    to: [-0.95, 0.0, 2.3],
    look: [0, -0.3, 0],
    zoom: 1,
  },
  // comment question: hiker high in the frame, the pill sits low
  { at: T.wo, rel: H, from: [0.3, 0.9, 6.6], to: [0.15, 0.7, 5.8], look: [0, -0.55, 0], zoom: 1 },
  // mid twist: low from the meadow, then down the stairs from behind
  {
    at: T.das3,
    rel: H,
    from: [-3.6, -1.0, 2.6],
    to: [-2.7, -0.9, 2.1],
    look: [0, 0.1, 0],
    zoom: 1,
  },
  {
    at: T.bergab2,
    rel: H,
    from: [0.5, 2.3, -2.8],
    to: [0.35, 1.9, -2.1],
    look: [0, -0.7, 1.2],
    zoom: 1,
  },
  // the thigh catches every step: x-ray side view, then closer + slow
  {
    at: T.dein2,
    rel: H,
    from: [2.8, -0.3, 0.5],
    to: [2.3, -0.35, 0.25],
    look: [0, -0.45, 0.15],
    zoom: 1,
  },
  {
    at: T.er,
    rel: H,
    from: [1.65, -0.45, 0.35],
    to: [1.4, -0.5, 0.25],
    look: [0, -0.5, 0.15],
    zoom: 1,
  },
  // inside again: snap, repair crew, swelling, nerves
  {
    at: T.dabei,
    from: mac(TEAR2 - 0.7, 0.95, 3.1),
    to: mac(TEAR2 - 0.2, 0.7, 2.5),
    look: mac(TEAR2, 0, 0),
    zoom: 1,
  },
  {
    at: T.risse2,
    from: mac(2.6, 1.5, 3.8),
    to: mac(1.7, 1.0, 3.1),
    look: mac(-0.4, 0, 0),
    zoom: 1,
  },
  {
    at: T.der,
    from: mac(-1.8, -0.7, 3.3),
    to: mac(-1.0, -0.45, 2.7),
    look: mac(-0.2, 0, 0.5),
    zoom: 1,
  },
  {
    at: T.nerven,
    from: mac(0.9, 0.25, 2.3),
    to: mac(0.6, 0.15, 1.95),
    look: mac(TEAR1, 0, 0.8),
    zoom: 1,
  },
  // payoff: the muscle is the brake
  {
    at: T.bergab3,
    rel: H,
    from: [1.9, 0.0, 2.7],
    to: [1.45, -0.1, 2.25],
    look: [0, -0.35, 0],
    zoom: 1,
  },
  { at: T.bremse, from: br(1.8, 1.5, 2.7), to: br(1.25, 1.3, 2.1), look: br(0, 1.05, 0), zoom: 1 },
  {
    at: T.bremsen,
    from: br(0.85, 2.0, 1.1),
    to: br(0.6, 1.95, 0.85),
    look: br(0, 1.85, 0),
    zoom: 1,
  },
  // Übrigens: protected for weeks — happy descent with a golden shield
  {
    at: T.uebrigens,
    rel: H,
    from: [-2.5, 0.4, 4.6],
    to: [-1.8, 0.2, 3.8],
    look: [0, 0.05, 0],
    zoom: 1,
  },
  {
    at: T.schuetzt,
    rel: H,
    orbit: { c: [0, -0.1, 0], r: 3.4, y: 0.3, a0: 0.95, a1: 0.25 },
    zoom: 1,
  },
  {
    at: T.folge,
    rel: H,
    from: [0.7, 0.1, 4.0],
    to: [0.45, 0.0, 3.3],
    look: [0, -0.05, 0],
    zoom: 1,
  },
];

// ---------------------------------------------------------------- labels
// "thigh" = the hiker's right thigh (scene.js swaps in a live point)
export const LABELS = [
  { text: "Milchsäure?", at: T.milch1, until: T.dein1, pos: "thigh", side: 1 },
  { text: "Muskelfaser", at: T.faser + 0.2, until: T.sport, pos: mac(-2.4, 0.42, 0.1), side: -1 },
  { text: "Mikrorisse", at: T.risse, until: T.und1, pos: mac(TEAR1, 0.3, 0.3), side: 1 },
  { text: "Oberschenkel", at: T.dein2 + 0.15, until: T.gedehnt, pos: "thigh", side: 1 },
  { text: "Reparatur", at: T.reparatur, until: T.der, pos: "cell", side: 1 },
  { text: "Nerven", at: T.nerven, until: T.bergab3, pos: mac(TEAR1 + 0.3, -0.05, 0.95), side: -1 },
  { text: "Bremse", at: T.bremse + 0.1, until: T.bremsen, pos: br(0, 1.86, 0), side: 1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "flash", at: 0.3 },
  { kind: "shake", at: 0.3, dur: 0.45, amp: 0.8 },
  { kind: "zoom", at: T.kater1, amount: 0.3 },
  { kind: "shake", at: T.rueck + 0.3, dur: 0.6, amp: 0.7 },
  { kind: "zoom", at: T.kaputt, amount: 0.3 },
  { kind: "flash", at: T.kaputt },
  { kind: "slowmo", at: T.reissen, until: T.risse, speed: 0.35 },
  { kind: "flash", at: T.reissen + 0.35 },
  { kind: "zoom", at: T.stunde, amount: 0.3 },
  { kind: "zoom", at: T.verrueckt, amount: 0.35 },
  { kind: "slowmo", at: T.gedehnt, until: T.dabei, speed: 0.45 },
  { kind: "flash", at: T.reisst + 0.05 },
  { kind: "shake", at: T.reisst + 0.05, dur: 0.5, amp: 0.9 },
  { kind: "shake", at: T.nerven, dur: 0.55, amp: 0.8 },
  { kind: "flash", at: T.bremse + 0.1 },
  { kind: "zoom", at: T.uebrigens, amount: 0.3 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "kuhglocke", at: 0.02, db: -9 }, // the alpine pasture on frame 0
  { s: "kuhglocke", at: T.stell + 0.2, db: -16 },
  { s: "hit", at: T.reissen + 0.35, db: -8 }, // fibres snap
  { s: "hit", at: T.reisst + 0.05, db: -8 },
  { s: "pop", at: T.reparatur - 0.2, db: -12 }, // the repair crew arrives
  { s: "surr", at: T.drueckt, dur: T.bergab3 - T.drueckt, db: -17 }, // nerve signal
  { s: "piep", at: T.stunde, dur: 0.45, db: -16 }, // stopwatch done
  { s: "klack", at: T.bremse + 0.1, db: -10 }, // brake grabs
  { s: "zisch", at: T.bremse + 0.15, dur: T.uebrigens - T.bremse - 0.2, db: -19 }, // sparks
];
