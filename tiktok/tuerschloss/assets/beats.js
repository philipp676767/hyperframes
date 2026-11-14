// #88 Türschloss — every time-keyed decision as plain data (scene + sfx).
// Units: 1 = 1 cm, lock cylinder axis = z, its face at z = 1, door front z = 0.
import { W } from "./timing.js";

export const T = {
  zacken: W("Zacken", 1),
  schluessel1: W("Schlüssel", 1),
  job: W("Job", 1),
  stell: W("Stell"),
  einkaeufe: W("Einkäufe"),
  nur: W("Nur"),
  dreht1: W("dreht", 1),
  tuerschloss: W("Türschloss"),
  nachbarn1: W("Nachbarn", 1),
  stecken: W("stecken"),
  warum: W("Warum"),
  walze1: W("Walze", 1),
  zylinder: W("Zylinder"),
  fuenf: W("fünf"),
  stifte: W("Stifte"),
  federn: W("Federn"),
  stift1: W("Stift", 1),
  geteilt: W("geteilt"),
  rate: W("Rate"),
  zehn: W("Zehntausende"),
  dein: W("Dein", 2),
  hebt: W("hebt"),
  trenn: W("Trennstellen"),
  linie1: W("Linie", 1),
  frei: W("frei"),
  zack: W("Zack"),
  nachbarn2: W("Nachbarn", 2),
  hoch2: W("hoch", 2),
  payoff: W("Zacken", 2),
  linie2: W("Linie", 2),
  genau: W("genau"),
  heben: W("heben"),
  fakt: W("Übrigens"),
  aegypter: W("Ägypter"),
  holz: W("Holz"),
  cta: W("Wie", 2),
  kommentare: W("Kommentare"),
};

// egyptian wooden lock on the doormat (scene.js EG)
const E = [-40, -100.6, 28];
const e = (x, y, z) => [E[0] + x, E[1] + y, E[2] + z];

export const shots = [
  // hook: hand pushes the key into the lock, macro on the teeth
  { at: 0, from: [-9, 3.4, 13], to: [-5, 1.8, 8], look: [0, 0.2, 3] },
  { at: T.schluessel1, from: [9, 9, 26], to: [6, 7, 20], look: [-1, 4, 0], whip: 1 },
  { at: T.job, from: [3.4, -6.5, 11], to: [2.4, -4.6, 8.4], look: [0, 0.5, 2] },
  // story: the door at night, the shopping bag
  { at: T.stell, from: [70, -20, 190], to: [52, -28, 150], look: [-30, -30, 0] },
  { at: T.einkaeufe, from: [-30, -66, 130], to: [-14, -74, 108], look: [30, -80, 36] },
  // only your key turns
  { at: T.nur, from: [8, 4, 13], to: [6, 2.8, 10], look: [0, 0.3, 1.2] },
  // the neighbour's key goes in … and sticks
  { at: T.nachbarn1, from: [-10, 3.5, 14], to: [-7.5, 2.4, 10.5], look: [0, 0, 3] },
  { at: T.stecken, from: [5, 3.2, 10], to: [4, 2.6, 8], look: [0, 0, 2] },
  { at: T.warum, from: [0.9, 0.5, 6.5], to: [0.25, 0.15, 2.6], look: [0, 0, 1] },
  // the cylinder: face first (solid), then x-ray from the hinge side
  { at: T.walze1, from: [-3, 2.2, 6], to: [-2.2, 1.6, 4.6], look: [0, 0.2, 0.8] },
  { at: T.zylinder, from: [-9.5, 3.4, 5.5], to: [-7.6, 2.6, 3.8], look: [0, 0.8, -0.5] },
  { at: T.fuenf, from: [-6.2, 2.6, 2.6], to: [-5.2, 2.2, 1.6], look: [0, 1.0, -0.5] },
  { at: T.federn, from: [-4.2, 4.2, 1.4], to: [-3.6, 3.7, 0.6], look: [0, 1.7, -0.5] },
  { at: T.stift1, from: [-3.2, 0.9, 1.2], to: [-2.6, 0.8, 0.5], look: [0, 0.65, 0] },
  // mid twist: tens of thousands of keys rain down
  { at: T.rate, from: [16, 10, 70], to: [12, 7, 56], look: [0, 4, 0] },
  { at: T.zehn, from: [0, 6, 46], to: [0, 3, 36], look: [0, 1, 0], whip: -1 },
  // your key lifts each pin
  { at: T.dein, from: [-8.8, 2.6, 5], to: [-7.2, 2.1, 3.2], look: [0, 0.6, -0.4] },
  { at: T.trenn, from: [-3.6, 0.95, 2.2], to: [-2.8, 0.8, 1.2], look: [0, 0.6, -0.5] },
  { at: T.frei, from: [-8, 5, 15], to: [-6.5, 4, 12.5], look: [0, 0, 2] },
  { at: T.nachbarn2, from: [-7.6, 2.4, 3.6], to: [-6.4, 2.1, 2.6], look: [0, 0.7, -0.5] },
  // payoff: the key turns, the door opens onto the warm hallway
  { at: T.payoff, from: [6, 5, 16], to: [4.5, 3.6, 12], look: [0, 1, 1] },
  { at: T.genau, from: [-120, 12, 160], to: [-96, 2, 128], look: [-20, -10, -20], whip: 1 },
  // Übrigens: the egyptian wooden pin lock on the doormat
  { at: T.fakt, from: e(44, 34, 86), to: e(32, 26, 68), look: e(-4, 10, 0) },
  { at: T.aegypter, from: e(-24, 24, 74), to: e(-16, 19, 60), look: e(-12, 8, 0) },
  { at: T.cta, orbit: { c: e(4, 10, 0), r: 62, y: E[1] + 34, a0: 0.8, a1: 0.35 } },
  { at: T.kommentare, from: e(18, 20, 52), to: e(12, 16, 42), look: e(2, 10, 0), whip: -1 },
];

export const LABELS = [
  { text: "Türschloss", at: T.tuerschloss, until: T.nachbarn1, pos: [-1.6, 4.5, 0.85], side: -1 },
  { text: "Zylinder", at: T.zylinder, until: T.fuenf, pos: [0, -0.6, 0.2], side: -1 },
  { text: "Stift", at: T.stifte, until: T.federn, pos: [0, 0.9, -0.5], side: 1 },
  { text: "Trennstelle", at: T.geteilt, until: T.rate, pos: [0, 0.6, 0], side: 1 },
];

export const HIGHLIGHTS = [
  { kind: "zoom", at: T.zacken, amount: 0.3 },
  { kind: "shake", at: 1.75, dur: 0.35, amp: 0.6 }, // key clicks home
  { kind: "zoom", at: T.dreht1 + 0.1, amount: 0.25 },
  { kind: "shake", at: T.stecken, dur: 0.6, amp: 1 },
  { kind: "zoom", at: T.warum, amount: 0.45 },
  { kind: "flash", at: T.zylinder },
  { kind: "slowmo", at: T.geteilt, until: T.rate, speed: 0.4 },
  { kind: "flash", at: T.zehn },
  { kind: "shake", at: T.zehn, dur: 0.5, amp: 0.8 },
  { kind: "zoom", at: T.linie1, amount: 0.3 },
  { kind: "flash", at: T.zack },
  { kind: "shake", at: T.zack, dur: 0.45, amp: 0.8 },
  { kind: "shake", at: T.hoch2, dur: 0.4, amp: 0.6 },
  { kind: "zoom", at: T.heben, amount: 0.25 },
  { kind: "zoom", at: T.holz, amount: 0.3 },
];

export const SFX = [
  { s: "schluessel", at: 0.0, db: -8 }, // frame 0: key scraping over the pins
  { s: "klack", at: 1.75, db: -10 },
  { s: "klack", at: T.dreht1 + 0.15, db: -9 },
  { s: "schluessel", at: T.nachbarn1 + 0.15, db: -11 },
  { s: "klack", at: T.stecken + 0.05, db: -12 },
  { s: "klack", at: T.stecken + 0.3, db: -14 },
  ...[0, 1, 2, 3, 4].map((i) => ({ s: "pop", at: T.fuenf + 0.05 + i * 0.16, db: -15 })),
  { s: "klimpern", at: T.rate + 0.3, db: -12 },
  { s: "schluessel", at: T.dein + 0.2, db: -9 },
  { s: "klack", at: T.zack, db: -7 },
  { s: "klack", at: T.hoch2 + 0.05, db: -12 },
  { s: "klack", at: T.payoff + 0.35, db: -10 },
  { s: "klack", at: T.aegypter + 1.2, db: -12 },
];
