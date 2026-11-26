// #99 Airbag gegen Gurt — every time-keyed decision as plain data (scene +
// build-sfx read the same numbers). No three.js / DOM here.
import { W } from "./timing.js";

export const T = {
  was: W("was"),
  rettet: W("rettet"),
  stell: W("Stell"),
  peng: W("Peng"),
  auto: W("Auto"),
  fliegst1: W("fliegst", 1),
  sturz: W("Sturz"),
  stock: W("Stock"),
  zwei: W("Zwei"),
  links: W("Links", 1),
  rechts: W("Rechts", 1),
  klingt: W("klingt"),
  kissen1: W("Kissen", 1),
  rate: W("Rate"),
  mit: W("Mit"),
  k300: W("300"),
  gurtQ: W("Gurt", 3),
  aber: W("Aber"),
  haken: W("Haken"),
  ohne: W("Ohne"),
  faust: W("Faustschlag"),
  faengt: W("fängt"),
  becken: W("Becken"),
  brust: W("Brust"),
  haelt: W("hält"),
  fakt: W("Übrigens"),
  srs: W("SRS"),
  duell2: W("Duell", 2),
  knallt: W("knallt"),
  links2: W("Links", 2),
  gewinnt: W("gewinnt"),
  cta: W("Schnallst"),
};

// ---------------------------------------------------------------- crash plan
// What the two sleds do in each stretch (scene time). imp = moment of
// impact (null = parked, upright), D = how long the crash takes on screen
// (big D = slow motion), V = approach speed before the impact.
// sled 0 = belt only (left lane, z < 0), sled 1 = airbag only (right lane).
const hookD = 3.6;
const c2D = Math.max(4, (T.faust - T.ohne + 0.1) / 0.26);
export const CRASH = [
  { from: -99, imp: [-0.75, -0.75], D: [hookD, hookD], V: 5 },
  { from: T.stell, imp: [T.peng, T.peng], D: [2.4, 2.4], V: 5 },
  { from: T.zwei, imp: [null, null] },
  { from: T.ohne, imp: [null, T.ohne - 0.1], D: [1, c2D], V: 0 },
  { from: T.faengt, imp: [T.faengt - 0.15, -50], D: [4.5, 1], V: 0 },
  { from: T.fakt, imp: [null, null] },
  { from: T.duell2, imp: [T.knallt - 0.05, T.knallt - 0.05], D: [2.0, 2.0], V: 6 },
];
// static airbag tests (sled parked): { at, D, until }
export const BAG_TESTS = [
  { at: T.kissen1 - 0.05, D: 1.2, until: T.rate },
  { at: T.rate + 0.25, D: 7, until: T.gurtQ },
];

// ---------------------------------------------------------------- shots
// shotCamera(shots, 1): positions are real camera positions (no pull-back)
export const shots = [
  // hook: the bag bursts into the dummy's face, then both sleds mid-crash
  { at: 0, from: [-1.35, 1.78, 2.45], to: [-0.95, 1.66, 1.9], look: [-0.05, 1.45, 1.05] },
  { at: T.was, from: [-4.8, 2.5, 3.8], to: [-3.9, 2.15, 2.9], look: [0, 1.1, 0] },
  // the drive: sleds rush toward the crash block
  {
    at: T.stell,
    from: [-2.6, 1.05, 4.3],
    to: [-2.3, 1.0, 3.9],
    look: [5, 1.0, 0],
    lookTo: [0.4, 1.0, 0],
  },
  { at: T.peng, from: [0.4, 1.35, 5.4], to: [0.1, 1.3, 4.7], look: [-0.2, 1.2, 0] },
  { at: T.auto, from: [0.7, 1.5, 3.7], to: [0.25, 1.45, 3.25], look: [-0.15, 1.3, 1.05] },
  // the drop tower: a fall from the third floor
  { at: T.fliegst1, from: [2.4, 1.2, -3.6], to: [2.9, 1.4, -4.5], look: [4.5, 9, -7.4], focus: 5 },
  // the duel: front view, belt left, airbag right
  { at: T.zwei, from: [-5.0, 1.95, 0], to: [-4.2, 1.8, 0], look: [0, 1.0, 0], whip: 1 },
  { at: T.klingt, from: [0.15, 2.0, 1.8], to: [0.0, 1.9, 1.6], look: [-0.62, 1.15, 1.05] },
  // POV: the bag comes at your face
  {
    at: T.rate,
    from: [0.12, 1.56, 1.05],
    to: [0.02, 1.54, 1.05],
    look: [-1, 1.4, 1.05],
    focus: 0.6,
  },
  {
    at: T.mit,
    from: [-0.5, 1.45, 2.75],
    to: [-0.35, 1.4, 2.35],
    look: [-0.4, 1.3, 1.05],
    whip: -1,
  },
  // the belt: just a strap of fabric
  { at: T.gurtQ, from: [-1.0, 1.5, -2.0], to: [-0.8, 1.45, -1.75], look: [0.05, 1.25, -1.05] },
  // quiet before the hit: slow push-in on the airbag dummy's face
  { at: T.aber, from: [-1.3, 1.66, 1.05], to: [-0.9, 1.63, 1.05], look: [0.2, 1.57, 1.05] },
  // without a belt you fly into the bag while it is still opening
  { at: T.ohne, from: [0.25, 1.5, 3.25], to: [-0.05, 1.5, 2.95], look: [-0.1, 1.35, 1.05] },
  {
    at: T.faust,
    from: [-0.15, 1.62, 2.25],
    to: [-0.22, 1.6, 2.1],
    look: [-0.05, 1.5, 1.05],
    whip: 1,
  },
  // the belt catches you early, at pelvis and chest
  { at: T.faengt, from: [0.35, 1.4, -3.45], to: [0.1, 1.35, -3.0], look: [-0.05, 1.2, -1.05] },
  { at: T.haelt, from: [-1.9, 1.7, -2.5], to: [-1.55, 1.6, -2.05], look: [0, 1.3, -1.05] },
  // "SRS" on the airbag cover
  {
    at: T.fakt,
    from: [-0.22, 1.52, 1.05],
    to: [-0.34, 1.36, 1.05],
    look: [-0.64, 1.12, 1.05],
    focus: 0.4,
  },
  // the final duel
  {
    at: T.duell2,
    from: [-5.0, 3.1, 3.3],
    to: [-4.3, 2.65, 2.7],
    look: [3, 1.1, 0],
    lookTo: [0, 1.1, 0],
  },
  { at: T.knallt, from: [0.45, 1.5, 3.45], to: [0.12, 1.5, 3.05], look: [-0.2, 1.3, 1.05] },
  { at: T.links2, from: [-1.95, 1.62, -2.65], to: [-1.6, 1.55, -2.25], look: [0, 1.3, -1.05] },
  { at: T.gewinnt, from: [-7.6, 2.3, 0.1], to: [-6.8, 2.1, 0.05], look: [0, 1.1, 0] },
  { at: T.cta, orbit: { c: [0, 1.15, 0], r: 4.3, y: 2.3, a0: -0.95, a1: -1.45 } },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Gurt", at: T.links + 0.05, until: T.rechts, pos: [-0.12, 1.28, -1.02], side: -1 },
  { text: "Airbag", at: T.rechts + 0.05, until: T.klingt, pos: [-0.66, 1.13, 1.05], side: 1 },
  { text: "Stoffband", at: T.gurtQ + 0.3, until: T.aber, pos: [-0.1, 1.3, -1.0], side: -1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "flash", at: 0.02 },
  { kind: "shake", at: 0.02, dur: 0.45, amp: 0.9 },
  { kind: "zoom", at: T.rettet, amount: 0.3 },
  { kind: "flash", at: T.peng },
  { kind: "shake", at: T.peng, dur: 0.6, amp: 1.3 },
  { kind: "slowmo", at: T.auto, until: T.fliegst1, speed: 0.3 },
  { kind: "shake", at: T.stock + 0.15, dur: 0.45, amp: 1 },
  { kind: "flash", at: T.kissen1 },
  { kind: "zoom", at: T.k300, amount: 0.35 },
  { kind: "flash", at: T.faust },
  { kind: "shake", at: T.faust, dur: 0.5, amp: 1.2 },
  { kind: "zoom", at: T.brust, amount: 0.25 },
  { kind: "zoom", at: T.srs, amount: 0.3 },
  { kind: "slowmo", at: T.knallt, until: T.links2, speed: 0.3 },
  { kind: "shake", at: T.knallt + 0.12, dur: 0.5, amp: 1.1 },
  { kind: "zoom", at: T.gewinnt, amount: 0.3 },
];

// ---------------------------------------------------------------- sound
// own sounds (scripts/sfx-extra.py): airbagknall = pyro bang + gas hiss,
// crash = sled hitting the block (metal crunch + thump)
export const SFX = [
  { s: "airbagknall", at: 0.0, db: -6 },
  { s: "crash", at: T.peng, db: -6 },
  { s: "rauschen", at: T.stell + 0.3, dur: T.peng - T.stell - 0.3, db: -16 },
  { s: "crash", at: T.stock + 0.15, db: -10 },
  { s: "airbagknall", at: T.kissen1, db: -7 },
  { s: "surr", at: T.mit, dur: T.k300 - T.mit + 0.3, db: -20 },
  { s: "klack", at: T.gurtQ + 0.25, db: -8 },
  { s: "airbagknall", at: T.ohne + 0.15, db: -9 },
  { s: "rauschen", at: T.duell2 + 0.1, dur: T.knallt - T.duell2 - 0.1, db: -16 },
  { s: "crash", at: T.knallt, db: -6 },
];
