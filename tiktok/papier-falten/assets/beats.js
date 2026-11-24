// #94 Papier 42-mal falten — every time-keyed decision as plain data
// (read by scene.js and scripts/build-sfx.mjs). No three.js / DOM here.
import { W } from "./timing.js";

export const T = {
  mal42: W("42-mal"),
  wie: W("Wie", 1),
  probier: W("Probier's"),
  siebten: W("siebten"),
  schluss: W("Schluss"),
  hart: W("hart"),
  brett: W("Brett"),
  hier: W("Hier"),
  grenze: W("Grenze"),
  jeder: W("Jeder"),
  knick1: W("Knick", 1),
  verdoppelt: W("verdoppelt"),
  stapel1: W("Stapel", 1),
  am: W("Am"),
  duenn: W("dünn"),
  haar: W("Haar"),
  zehn: W("Zehn"),
  tasse: W("Kaffeetasse"),
  noch1: W("Noch", 1),
  gross: W("groß"),
  noch2: W("Noch", 2),
  hoeher: W("höher"),
  haus: W("Haus"),
  rate: W("Rate"),
  wieOft: W("oft", 1) - 0.14,
  flugzeug: W("Flugzeug"),
  nur: W("Nur"),
  ab: W("Ab"),
  absurd: W("absurd"),
  knick2: W("Knick", 2),
  doppelt1: W("doppelt", 1),
  noch3: W("Noch", 4),
  doppelt2: W("doppelt", 2),
  stapel2: W("Stapel", 2),
  durchsticht: W("durchsticht"),
  weltall: W("Weltall"),
  fakt: W("Übrigens"),
  weltrekord: W("Weltrekord"),
  einer: W("einer", 2),
  klopapier: W("Klopapierrolle"),
  knick3: W("Knick", 3),
  zettel2: W("Zettel", 2),
  knallt: W("knallt"),
  mond: W("Mond"),
  einziges: W("einziges"),
  cta: W("oft", 2) - 0.14,
};

// ---------------------------------------------------------------- folds (by hand, before "ohne Grenze")
// fold k (1..7) starts at FOLDS[k-1][0] and lasts FOLDS[k-1][1] s; fold 8 fails
export const FOLDS = [
  [-0.35, 0.5],
  [T.mal42, 0.45],
  [T.probier, 0.3],
  [T.probier + 0.32, 0.28],
  [T.probier + 0.62, 0.26],
  [T.probier + 0.9, 0.24],
  [T.siebten, 0.3],
];
export const FAIL = [T.siebten + 0.45, T.schluss + 0.25]; // fold 8: lifts, strains, falls back

// ---------------------------------------------------------------- stack growth (folds n over time)
// [time, n] keys, linear in n (= exponential in height)
export const GROW = [
  [T.zehn, 3],
  [T.zehn + 0.55, 10],
  [T.noch1, 10],
  [T.noch1 + 0.7, 14],
  [T.noch2, 14],
  [T.noch2 + 0.95, 17],
  [T.nur, 17],
  [T.nur + 0.8, 27],
  [T.doppelt1, 27],
  [T.doppelt1 + 0.35, 28],
  [T.doppelt2, 28],
  [T.doppelt2 + 0.35, 29],
  [T.durchsticht, 29],
  [T.weltall, 29.8],
  [T.weltall + 0.01, 30],
  [T.knick3 + 0.2, 30],
  [T.mond, 42],
];
export function foldsAt(t) {
  if (t <= GROW[0][0]) return GROW[0][1];
  for (let i = 1; i < GROW.length; i++) {
    const [t1, n1] = GROW[i];
    const [t0, n0] = GROW[i - 1];
    if (t < t1) return n0 + ((n1 - n0) * (t - t0)) / (t1 - t0);
  }
  return GROW[GROW.length - 1][1];
}
// the ceiling breaks when the stack (2 units = 1 m, 0.1 mm per layer) reaches 6.5 − 1.5 = 5 units
const N_CEIL = Math.log2(5 / 0.0002);
export const T_CRASH = T.noch2 + ((N_CEIL - 14) / 3) * 0.95;
// the column passes the airliner (y = 16 in the air world)
const N_PLANE = Math.log2(((16 / 2 + 2) * 1000) / 0.0001);
export const T_PASS = T.nur + ((N_PLANE - 17) / 10) * 0.8;

// ---------------------------------------------------------------- worlds
export function worldAt(t) {
  if (t < T.haus) return "room";
  if (t < T.wieOft) return "ext";
  if (t < T.weltall) return "air";
  if (t < T.weltrekord) return "space";
  if (t < T.knick3) return "tp";
  return "space";
}

// ---------------------------------------------------------------- shots (zoom 1: absolute positions)
const Z = { zoom: 1 };
export const shots = [
  // hook: the hand folds, frame 0 mid-fold, close
  { at: 0, from: [-0.58, 2.2, 1.0], to: [-0.32, 1.9, 0.62], look: [0.04, 1.52, 0], ...Z },
  { at: T.mal42, from: [-1.0, 2.35, 1.4], to: [-0.7, 2.05, 1.0], look: [0, 1.55, -0.1], ...Z },
  // "Wie hoch?" — low on the desk, looking up to the ceiling
  { at: T.wie, from: [0.55, 1.62, 1.0], to: [0.45, 1.6, 0.8], look: [0, 3.6, -1.2], ...Z },
  // beat 1: rapid folds, then the block that won't fold
  { at: T.probier, from: [-0.2, 2.0, 0.85], to: [-0.12, 1.8, 0.55], look: [0.02, 1.53, 0], ...Z },
  { at: T.schluss, from: [-0.1, 1.68, 0.4], to: [-0.06, 1.64, 0.3], look: [0.01, 1.55, 0], ...Z },
  { at: T.hart, from: [-0.3, 1.6, 0.18], to: [-0.24, 1.585, 0.14], look: [0.02, 1.55, 0], ...Z },
  { at: T.hier, orbit: { c: [0, 1.6, 0], r: 1.05, y: 2.05, a0: 0.7, a1: -0.25 }, ...Z },
  // beat 2: doubling, hair macro, cup, "so groß wie du", ceiling crash
  { at: T.jeder, from: [0.38, 2.02, 0.78], to: [0.3, 1.86, 0.6], look: [0, 1.56, 0], ...Z },
  { at: T.am, from: [0.17, 1.54, 0.58], to: [0.14, 1.525, 0.545], look: [0.05, 1.503, 0.46], ...Z },
  { at: T.zehn, from: [0.08, 1.85, 1.0], to: [0.12, 1.72, 0.72], look: [0.12, 1.6, 0.03], ...Z },
  { at: T.noch1, from: [2.6, 2.4, 5.6], to: [2.2, 3.0, 4.9], look: [0, 2.9, 0], ...Z },
  { at: T.gross, from: [1.4, 4.75, 2.6], to: [1.0, 4.8, 2.0], look: [0, 4.75, 0], ...Z },
  { at: T.noch2, from: [2.6, 0.5, 3.4], to: [2.3, 0.8, 2.9], look: [0, 5.6, 0], ...Z },
  // outside: the column sticks out of the roof
  { at: T.haus, from: [44, 16, 46], to: [36, 19, 38], look: [0, 21, 0], ...Z },
  // the air: airliner cruising, then the column bursts through the clouds
  { at: T.wieOft, from: [-16, 18.5, 26], to: [-10, 18.5, 21], look: [-7, 16, -6], ...Z },
  { at: T.nur, from: [9, 11, 30], to: [12, 21, 34], look: [0, 18, -2], ...Z, whip: 1 },
  { at: T.ab, from: [8, 12, 11], to: [6.5, 13.5, 9], look: [0, 21, 0], ...Z },
  { at: T.knick2, from: [42, 18, 72], to: [40, 24, 68], look: [0, 28, 0], ...Z },
  { at: T.noch3, from: [36, 34, 66], to: [34, 55, 62], look: [0, 55, 0], lookTo: [0, 95, 0], ...Z },
  {
    at: T.stapel2,
    from: [130, 30, 170],
    to: [118, 70, 156],
    look: [0, 50, 0],
    lookTo: [0, 110, 0],
    ...Z,
  },
  // space: the column pokes out of the atmosphere
  { at: T.weltall, from: [9, 2.5, 13], to: [7.5, 4, 10.5], look: [0, 2.2, 0], ...Z },
  // the world record: toilet paper across the schoolyard
  { at: T.weltrekord, from: [-35, 4.2, 20.5], to: [-33, 3.4, 22.5], look: [10, 0, 46], ...Z },
  { at: T.einer, from: [-40, 10, 20], to: [-46, 34, 12], look: [40, 0, 62], ...Z },
  {
    at: T.klopapier,
    from: [-23.5, 4.2, 34.5],
    to: [-24.8, 3.6, 33],
    look: [-31.5, 1.3, 28.6],
    ...Z,
  },
  // payoff: the column races to the Moon
  { at: T.knick3, from: [7, 1.6, 12], to: [6, 3, 10], look: [0, 8, 0], lookTo: [0, 30, 0], ...Z },
  { at: T.zettel2, from: [15, 45, 26], to: [12, 53, 21], look: [0, 58, -1], ...Z },
  { at: T.mond, from: [9, 60.5, 14], to: [10.5, 61.5, 16], look: [0, 61, -1.5], ...Z },
  { at: T.einziges, from: [0, 28, 96], to: [9, 31, 90], look: [0, 30, 0], ...Z },
  { at: T.cta, orbit: { c: [0, 31, 0], r: 88, y: 36, a0: 0.15, a1: 0.36 }, ...Z },
];

// ---------------------------------------------------------------- labels (one at a time)
export const HAIR_POS = [0.05, 1.503, 0.46];
export const LABELS = [
  { text: "Haar", at: T.duenn, until: T.zehn, pos: [0.05, 1.505, 0.478], side: -1 },
  { text: "Klopapier", at: T.klopapier, until: T.knick3, pos: [-30, 2.4, 28], side: 1 },
  { text: "Mond", at: T.mond + 0.3, until: T.cta + 1.2, pos: [-3.5, 66, -2], side: -1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "zoom", at: T.mal42, amount: 0.3 },
  { kind: "shake", at: T.schluss, dur: 0.4, amp: 0.7 },
  { kind: "flash", at: T.grenze },
  { kind: "zoom", at: T.verdoppelt, amount: 0.25 },
  { kind: "shake", at: T_CRASH, dur: 0.6, amp: 1.2 },
  { kind: "flash", at: T_PASS },
  { kind: "zoom", at: T.doppelt1 + 0.1, amount: 0.3 },
  { kind: "zoom", at: T.doppelt2 + 0.1, amount: 0.3 },
  { kind: "flash", at: T.weltall },
  { kind: "slowmo", at: T.knallt, until: T.mond, speed: 0.5 },
  { kind: "flash", at: T.mond },
  { kind: "shake", at: T.mond, dur: 0.8, amp: 1.4 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  ...FOLDS.map(([at], i) => ({ s: "falten", at: Math.max(0, at + 0.05), db: i < 2 ? -6 : -10 })),
  { s: "knarz", at: FAIL[0] + 0.1, db: -10 },
  { s: "klack", at: T.hart + 0.12, db: -8 },
  { s: "klack", at: T.hart + 0.42, db: -8 },
  { s: "wow", at: T.grenze, db: -10 },
  { s: "pop", at: T.knick1, db: -10 },
  { s: "pop", at: T.verdoppelt, db: -10 },
  { s: "pop", at: T.stapel1, db: -10 },
  { s: "surr", at: T.zehn, dur: 0.6, db: -18 },
  { s: "surr", at: T.noch1, dur: 0.75, db: -18 },
  { s: "krach", at: T_CRASH, db: -4 },
  { s: "rauschen", at: T.wieOft, dur: T.ab - T.wieOft, db: -17 },
  { s: "krach", at: T.mond, db: -3 },
];
