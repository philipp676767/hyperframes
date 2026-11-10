// Beats of #70 "Hundenase": every time-keyed decision as plain data (read by
// scene.js and scripts/build-sfx.mjs). No three.js / DOM here.
import { W } from "./timing.js";

export const T = {
  hundes: W("Hundes"),
  ist: W("ist"),
  finger: W("Fingerabdruck"),
  jedes: W("Jedes"),
  muster: W("Muster"),
  aber: W("Aber"),
  nass: W("nass"),
  stell: W("Stell"),
  gassi: W("Gassi"),
  schnueffelt: W("schnüffelt"),
  denn: W("Denn"),
  seitlich: W("seitlich"),
  schlitze: W("Schlitze"),
  wirbelt: W("wirbelt"),
  gerueche: W("Gerüche"),
  drinnen: W("Drinnen"),
  labyrinth: W("Labyrinth"),
  roellchen: W("Knochen-Röllchen"),
  darauf: W("Darauf"),
  schleimhaut: W("Riechschleimhaut"),
  rate: W("Rate"),
  folge: W("Folge"),
  bis: W("Bis"),
  mio: W("300"),
  hast: W("hast"),
  sechs: W("sechs"),
  verrueckt: W("Verrückte"),
  nasenloch: W("Nasenloch"),
  einzeln: W("einzeln"),
  stereo: W("Stereo"),
  so: W("so", 2),
  spur: W("Spur"),
  naesse: W("Nässe"),
  schleimfilm: W("Schleimfilm"),
  klebeband: W("Klebeband"),
  leckt: W("leckt"),
  kalt: W("kalt"),
  waerme: W("Wärme"),
  fakt: W("Übrigens"),
  teeloeffel: W("Teelöffel"),
  zucker: W("Zucker"),
  becken: W("Schwimmbecken"),
  wie: W("wie", 3),
};

// analogy sets, far from the stage (scene.js builds them there)
export const CELLS = [16, 0.3, 16];
export const POOL = [-16, 0.2, 18];

// level head: nose front ≈ (0, 1.75, 2.2); nose down: ≈ (0, 0.45, 1.5)
export const shots = [
  // 0: the dog's face, nose huge and glowing, the hand boops it
  { at: 0, from: [0.25, 2.3, 3.55], to: [0.05, 2.02, 2.95], look: [0, 1.82, 1.9] },
  // the pattern lights up — macro of the leather
  { at: T.ist, from: [0.42, 1.86, 2.78], to: [0.18, 1.78, 2.55], look: [0, 1.74, 2.14] },
  // three nose prints, three patterns
  { at: T.jedes, from: [0.0, 2.3, 6.8], to: [0.0, 2.25, 6.4], look: [0, 2.15, 3.2] },
  // wet: a drop runs down the side
  { at: T.aber, from: [-0.62, 1.9, 2.85], to: [-0.42, 1.82, 2.62], look: [0, 1.72, 2.1] },
  // Gassi: the forest path, the dog trots in, nose down
  { at: T.stell, from: [2.6, 1.9, 6.4], to: [1.9, 1.55, 5.2], look: [0, 0.8, 0] },
  // low, close: sniffing the leaves
  { at: T.schnueffelt, from: [1.7, 0.75, 3.1], to: [1.25, 0.62, 2.65], look: [0, 0.45, 1.45] },
  // slowmo macro from the side: air shoots out of the side slits
  { at: T.denn, from: [1.0, 0.6, 1.95], to: [0.78, 0.52, 1.78], look: [0, 0.44, 1.45], whip: 1 },
  // ground level from the front: leaves whirl up, smells get pulled in
  { at: T.wirbelt, from: [0.35, 0.22, 3.1], to: [0.2, 0.28, 2.6], look: [0, 0.42, 1.4] },
  // x-ray side view of the head
  { at: T.drinnen, from: [3.1, 1.95, 1.75], to: [2.65, 1.9, 1.7], look: [0, 1.8, 1.55], whip: -1 },
  // orbit around the scroll bones
  { at: T.roellchen, orbit: { c: [0, 1.76, 1.62], r: 1.6, y: 2.05, a0: 1.3, a1: 0.6 } },
  // Rate mal: front 3/4, x-ray, "?"
  { at: T.rate, from: [-1.7, 2.15, 3.4], to: [-1.4, 2.05, 3.1], look: [0, 1.76, 1.6] },
  // into the receptor carpet (cells set)
  { at: T.bis, from: [0.3, 1.9, 2.6], to: [0.1, 1.15, 1.5], look: [0, 0, 0], rel: CELLS },
  // pull back: almost all go dark — "Du hast sechs."
  { at: T.hast, from: [-0.4, 2.4, 2.9], to: [-0.6, 3.1, 3.6], look: [0, 0, 0], rel: CELLS },
  // whisper: straight into the two nostrils
  { at: T.verrueckt, from: [0, 1.8, 2.85], to: [0, 1.76, 2.52], look: [0, 1.73, 2.14], whip: 1 },
  // top view: two streams, left and right
  { at: T.stereo, from: [0, 3.5, 3.4], to: [0, 3.05, 2.9], look: [0, 1.5, 1.7] },
  // the trail: high from behind, the glowing track runs ahead along the path
  { at: T.so, from: [-2.9, 4.7, -3.6], to: [-2.2, 4.0, -2.4], look: [0.2, 0, 4.2] },
  // wet film: macro, a light sweeps over the shine
  { at: T.naesse, from: [0.5, 1.98, 2.8], to: [0.28, 1.86, 2.56], look: [0, 1.74, 2.13] },
  // the lick (side macro)
  { at: T.leckt, from: [1.15, 1.82, 2.4], to: [0.98, 1.8, 2.22], look: [0, 1.7, 2.02] },
  // thermal: the hand comes close, the cold nose feels it
  { at: T.kalt, from: [-0.95, 1.7, 3.7], to: [-0.72, 1.72, 3.25], look: [0.15, 1.72, 2.2] },
  // two Olympic pools from above, one teaspoon of sugar
  { at: T.fakt, from: [0, 7.4, 7.0], to: [0, 5.9, 5.5], look: [0, 0, 0.3], rel: POOL },
  { at: T.zucker, from: [-2.0, 1.2, 3.1], to: [-1.4, 1.0, 2.5], look: [-1.3, 0, 0], rel: POOL },
  // comment question: the dog looks into the camera, head tilted
  { at: T.wie, from: [0.9, 1.95, 4.7], to: [0.5, 1.88, 4.0], look: [0, 1.75, 1.6], whip: -1 },
];

// label positions are filled in by scene.js (posed world points)
export const LABELS = [
  {
    id: "slitz",
    text: "Seitenschlitz",
    at: T.schlitze + 0.05,
    until: T.wirbelt,
    pos: [0, 0, 0],
    side: 1,
  },
  {
    id: "roell",
    text: "Knochen-Röllchen",
    at: T.roellchen + 0.05,
    until: T.darauf,
    pos: [0, 0, 0],
    side: -1,
  },
  {
    id: "rsh",
    text: "Riechschleimhaut",
    at: T.schleimhaut + 0.05,
    until: T.rate,
    pos: [0, 0, 0],
    side: 1,
  },
  {
    id: "film",
    text: "Schleimfilm",
    at: T.schleimfilm + 0.05,
    until: T.klebeband + 0.6,
    pos: [0, 0, 0],
    side: -1,
  },
];

export const HIGHLIGHTS = [
  { kind: "zoom", at: T.finger, amount: 0.3 },
  { kind: "flash", at: T.muster },
  { kind: "slowmo", at: T.denn, until: T.wirbelt, speed: 0.4 },
  { kind: "zoom", at: T.schleimhaut, amount: 0.22 },
  { kind: "flash", at: T.mio },
  { kind: "zoom", at: T.stereo, amount: 0.3 },
  { kind: "slowmo", at: T.schleimfilm, until: T.leckt, speed: 0.45 },
  { kind: "shake", at: T.leckt + 0.15, dur: 0.35, amp: 0.5 },
  { kind: "zoom", at: T.waerme, amount: 0.25 },
  { kind: "flash", at: T.zucker },
];

export const SFX = [
  { s: "schnueffel", at: 0.0, db: -8 }, // frame 0: the dog sniffs
  { s: "pop", at: T.muster + 0.05 },
  { s: "pop", at: T.muster + 0.17, db: -4 },
  { s: "pop", at: T.muster + 0.29, db: -6 },
  { s: "schnueffel", at: T.schnueffelt, db: -10 },
  { s: "zisch", at: T.seitlich, dur: 2.2, db: -17 }, // exhaled air out of the slits
  { s: "rauschen", at: T.wirbelt, dur: 1.4, db: -18 }, // leaves whirl
  { s: "blip", at: T.mio + 0.1, db: -8 },
  { s: "schnueffel", at: T.nasenloch, db: -12 },
  { s: "schlabber", at: T.leckt + 0.12, db: -7 },
  { s: "surr", at: T.kalt + 0.2, dur: 1.9, db: -21 }, // thermal camera hum
  { s: "pop", at: T.teeloeffel + 0.3, db: -6 },
];
