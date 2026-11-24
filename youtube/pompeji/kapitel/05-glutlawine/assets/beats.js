// Chapter 5 "Die Glutlawine": the pyroclastic flow explained (column
// collapse, the fountain analogy), running down the mountain, into the
// streets; the morning flow at the walls; the end in the streets (no people
// shown dying); Stabiae: pillows, a wild sea, Pliny the Elder; more flows
// until Pompeii disappears; silence.
import { W, END } from "./timing.js";

export const T = {
  sie: W("Sie", 1),
  man: W("Man"),
  druck: W("Druck"),
  schiesst: W("schießt"),
  weil: W("Weil"),
  mit: W("mit", 1),
  weg: W("Weglaufen"),
  am: W("Am"),
  erreicht: W("erreicht"),
  wer: W("Wer"),
  fuer: W("Für"),
  stabiae: W("Stabiae") - 0.35,
  dort: W("Dort"),
  weitere: W("Weitere"),
  danach: W("Danach"),
  end: END,
};
const f = (x, y, z) => [x, y - 120, z];

export const shots = [
  // the glowing avalanche runs down the mountain
  { at: 0, from: [26, 9, -10], to: [23, 9, -13], look: [0, 9, -44], zoom: 1 },
  // the column can no longer carry its weight
  { at: T.sie - 0.2, from: [40, 18, 40], to: [36, 19, 36], look: [0, 40, -62], zoom: 1 },
  // like a fountain without pressure
  {
    at: T.man - 0.2,
    from: f(2.6, 1.6, 3.4),
    to: f(2.2, 1.5, 3.0),
    look: f(0, 0.9, 0),
    zoom: 1,
    whoosh: true,
  },
  {
    at: T.schiesst - 0.3,
    from: f(0.2, 2.6, 3.6),
    to: f(0.1, 2.4, 3.2),
    look: f(0, 0.1, 0),
    zoom: 1,
  },
  // heavier than air: it flows down like water
  {
    at: T.weil - 0.2,
    from: [-26, 10, -14],
    to: [-22, 10, -17],
    look: [0, 7, -40],
    zoom: 1,
    whoosh: true,
  },
  { at: T.mit - 0.2, from: [-4, 4.2, -26], to: [-3, 4, -24], look: [1.5, 3, -36], zoom: 1 },
  // no running away; it gets through every door
  {
    at: T.weg - 0.2,
    from: [-2.6, 0.45, 2.42],
    to: [-1.6, 0.45, 2.42],
    look: [14, 0.6, 2.4],
    zoom: 1,
  },
  // the grey morning: the town under pumice, the mountain flank
  {
    at: T.am - 0.2,
    from: [24, 7, 20],
    to: [21, 6.6, 17],
    look: [0, 4, -18],
    zoom: 1,
    whoosh: true,
  },
  // the first flow reaches the walls
  {
    at: T.erreicht - 0.2,
    from: [3.2, 1.25, -10.4],
    to: [3.0, 1.25, -10.9],
    look: [0.5, 3, -22],
    zoom: 1,
  },
  // over in moments: the cloud covers the town (wide, no people)
  { at: T.fuer - 0.2, from: [30, 10, -4], to: [28, 10, -7], look: [0, 4, -20], zoom: 1 },
  // Stabiae: pillows on their heads, a wild sea
  {
    at: T.stabiae,
    from: [36.5, 0.6, 21.5],
    to: [35.6, 0.55, 21.0],
    look: [31.5, 0.3, 18.4],
    zoom: 1,
    whoosh: true,
  },
  // Pliny the Elder on the beach
  {
    at: T.dort - 0.2,
    from: [30.6, 0.32, 18.6],
    to: [30.9, 0.9, 19.6],
    look: [32.2, 0.1, 17.0],
    zoom: 1,
  },
  // more flows: Pompeii disappears
  {
    at: T.weitere - 0.2,
    from: [18, 14, 22],
    to: [15, 15, 19],
    look: [1.5, 0, 0],
    zoom: 1,
    whoosh: true,
  },
  // silence
  { at: T.danach - 0.2, from: [-6, 2.2, 16], to: [-5.5, 2.3, 15], look: [0, 5, -30], zoom: 1 },
];

export const LABELS = [
  {
    text: "Pyroklastischer Strom",
    at: W("Glutlawine") - 0.1,
    until: T.sie - 0.4,
    pos: [0.6, 15.5, -50],
    side: 1,
  },
];

export const SFX = [
  { s: "glut", at: 0, dur: T.man, db: -10 },
  { s: "saeule", at: T.sie, dur: T.man - T.sie, db: -16 },
  { s: "glut", at: T.weil - 0.2, dur: T.am - T.weil, db: -9 },
  { s: "wind", at: T.am - 0.2, dur: T.erreicht - T.am, db: -18 },
  { s: "glut", at: T.erreicht - 0.2, dur: T.wer - T.erreicht + 1, db: -8 },
  { s: "wind", at: T.wer, dur: T.fuer - T.wer, db: -20 },
  { s: "glut", at: T.fuer, dur: T.stabiae - T.fuer, db: -14 },
  { s: "meer", at: T.stabiae, dur: T.weitere - T.stabiae, db: -10 },
  { s: "wind", at: T.stabiae, dur: T.weitere - T.stabiae, db: -16 },
  { s: "glut", at: T.weitere - 0.2, dur: T.danach - T.weitere, db: -14 },
  { s: "wind", at: T.danach, dur: T.end - T.danach, db: -26 },
];

export const HIGHLIGHTS = [{ kind: "shake", at: T.erreicht + 0.6, dur: 1.4, amp: 0.4 }];
