// #79 Geschüttelte Cola (Format B) — every time-keyed decision as plain data.
import { W } from "./timing.js";

export const T = {
  klopfst: W("klopfst", 1),
  geschuettelt: W("geschüttelte"),
  rettet: W("Rettet"),
  alle: W("Alle"),
  doch1: W("Doch", 1),
  zischt: W("zischt"),
  schiesst1: W("schießt", 1),
  fontaene: W("Fontäne"),
  mitten: W("Mitten"),
  schuld: W("Schuld"),
  druck: W("Druck"),
  schuetteln: W("Schütteln"),
  blaeschen1: W("Bläschen", 1),
  schweben: W("schweben"),
  rate: W("Rate"),
  gas1: W("Gas", 1),
  liter: W("Liter"),
  machst: W("Machst"),
  schiesst2: W("schießt", 2),
  wachsen: W("wachsen"),
  schieben: W("schieben"),
  klopfen1: W("Klopfen", 1),
  wand: W("Wand"),
  doch2: W("Doch", 2),
  nichts: W("nichts"),
  forscher: W("Forscher"),
  unterschied: W("Unterschied"),
  was: W("Was"),
  warten: W("warten", 2),
  steigen: W("steigen"),
  fakt: W("Übrigens"),
  kalte: W("Kalte"),
  kaelte: W("Kälte"),
  klopfst2: W("klopfst", 2),
};

// the 1000 cans stand in the aisle of the wagon (floor y = -9)
export const CANS = { x: 0, y: -9, z: 20 };

// taps of the finger on the lid / the wall (picture + sound)
export const TAPS = [
  ...[0, 0.3, 0.6, 0.9, 1.2].map((d) => T.rettet - 0.15 + d),
  ...[0, 0.32, 0.64].map((d) => T.klopfen1 + 0.25 + d),
  ...[0, 0.3, 0.6].map((d) => T.klopfst2 + 0.15 + d),
];

export const shots = [
  // cold open: the fountain already spraying out of the can on the seat
  { at: 0, from: [2.6, 1.3, 5.2], to: [1.9, 1.7, 4.2], look: [0, 2.3, 0], zoom: 1 },
  // the act: your hand shakes the can, then taps the lid
  { at: T.geschuettelt, from: [1.6, 4.0, 4.4], to: [1.2, 3.7, 3.7], look: [0, 2.2, 0], zoom: 1 },
  // wide: the bench in the U-Bahn, the tunnel streaking past
  { at: T.alle, from: [7.5, 5.5, 14], to: [6.2, 5.0, 12], look: [0, 4.5, -3], zoom: 1 },
  // the tab
  { at: T.doch1, from: [-1.5, 4.0, 2.6], to: [-1.1, 3.7, 2.1], look: [0, 2.35, -0.1], zoom: 1 },
  // money shot 1: the fountain, low angle, slow motion
  { at: T.schiesst1, from: [3.6, 0.9, 5.4], to: [2.9, 1.3, 4.4], look: [0.3, 2.8, 0], zoom: 1 },
  // wide: in the middle of the train
  { at: T.mitten, from: [16, 12, 30], to: [13, 11, 25], look: [0, 8, -6], zoom: 1 },
  // cutaway: the inside of a fresh, closed can
  { at: T.schuld, from: [3.6, 2.1, 6.0], to: [3.0, 1.9, 5.2], look: [0, 1.25, 0], zoom: 1 },
  { at: T.schuetteln, from: [-2.6, 2.0, 4.6], to: [-2.1, 1.8, 4.0], look: [0, 1.3, 0], zoom: 1 },
  { at: T.schweben, orbit: { c: [0, 1.2, 0], r: 4.4, y: 1.7, a0: 0.6, a1: 0.25 }, zoom: 1 },
  // Rate mal: the gas from one can, as a bubble beside it
  { at: T.rate, from: [1.2, 3.0, 10.2], to: [1.0, 2.7, 8.8], look: [0.9, 1.6, 0.4], zoom: 1 },
  // opening in cutaway: the bubbles swell (slow motion)
  { at: T.machst, from: [2.4, 2.6, 4.4], to: [2.0, 2.4, 3.8], look: [0, 1.7, 0], zoom: 1 },
  // the tap from the side
  { at: T.klopfen1, from: [-2.6, 1.9, 5.4], to: [-2.1, 1.7, 4.7], look: [0.4, 1.25, 0], zoom: 1 },
  // payoff: tapping does nothing
  { at: T.doch2, from: [-3.0, 2.1, 5.6], to: [-2.5, 1.9, 4.9], look: [0.2, 1.4, 0], zoom: 1 },
  // the study: 1000 cans fill the aisle
  { at: T.forscher, from: [2, 30, 66], to: [1, 25, 56], look: [0, -8, 20], zoom: 1, whip: 1 },
  { at: T.unterschied, from: [6, 2, 52], to: [5, 0.5, 46], look: [0, -8, 22], zoom: 1 },
  // what helps: waiting (cutaway, stopwatch)
  { at: T.was, from: [3.2, 2.0, 5.6], to: [2.7, 1.8, 4.9], look: [0, 1.3, 0], zoom: 1 },
  { at: T.steigen, from: [1.3, 3.9, 3.2], to: [1.0, 3.6, 2.6], look: [0, 2.35, 0], zoom: 1 },
  // Übrigens: the ice-cold can, frosted, glowing blue
  { at: T.fakt, from: [3.0, 1.8, 6.0], to: [2.1, 1.6, 4.6], look: [0, 1.35, 0], zoom: 1 },
  { at: T.kaelte, orbit: { c: [0, 1.4, 0], r: 3.6, y: 2.2, a0: -0.5, a1: 0.15 }, zoom: 1 },
  // CTA: the bench, the soaked phone, your finger tapping again
  { at: T.klopfst2, from: [6.5, 5.2, 12.5], to: [5.4, 4.6, 10.8], look: [0.8, 3.2, -1], zoom: 1 },
];

export const LABELS = [
  { text: "Bläschen", at: T.blaeschen1, until: T.rate - 0.2, pos: [0.25, 0.9, 0.06], side: 1 },
  { text: "Gas", at: T.gas1, until: T.machst - 0.1, pos: [1.75, 1.3, 2.2], side: 1 },
  { text: "Wand", at: T.wand, until: T.doch2 - 0.1, pos: [-0.64, 1.0, 0.0], side: -1 },
];

export const HIGHLIGHTS = [
  { kind: "shake", at: 0.02, dur: 0.6, amp: 0.7 },
  { kind: "zoom", at: T.geschuettelt + 0.1, amount: 0.25 },
  { kind: "flash", at: T.schiesst1 },
  { kind: "slowmo", at: T.schiesst1, until: T.mitten, speed: 0.4 },
  { kind: "shake", at: T.mitten, dur: 0.4, amp: 0.5 },
  { kind: "shake", at: T.schuetteln + 0.1, dur: 0.9, amp: 0.45 },
  { kind: "flash", at: T.liter },
  { kind: "zoom", at: T.liter, amount: 0.3 },
  { kind: "slowmo", at: T.schiesst2, until: T.klopfen1, speed: 0.45 },
  { kind: "flash", at: T.nichts },
  { kind: "shake", at: T.nichts, dur: 0.4, amp: 0.5 },
  { kind: "zoom", at: T.unterschied, amount: 0.25 },
  { kind: "flash", at: T.kalte },
];

export const SFX = [
  { s: "spritz", at: 0.0, db: -8 }, // cold open: the fountain
  { s: "schuettel", at: T.geschuettelt + 0.02, db: -9 },
  ...TAPS.map((at) => ({ s: "klopf", at, db: -7 })),
  { s: "zisch", at: T.zischt - 0.1, dur: 0.7, db: -9 },
  { s: "spritz", at: T.schiesst1 - 0.05, db: -7 },
  { s: "schuettel", at: T.schuetteln + 0.05, db: -12 },
  { s: "pop", at: T.gas1 + 0.1 },
  { s: "zisch", at: T.machst + 0.35, dur: 0.6, db: -13 },
  { s: "spritz", at: T.schieben - 0.2, db: -12 },
  { s: "pop", at: T.forscher + 0.1 },
  { s: "zisch", at: T.steigen + 0.35, dur: 0.35, db: -16 },
  { s: "zisch", at: T.kaelte + 0.35, dur: 0.3, db: -18 },
];
