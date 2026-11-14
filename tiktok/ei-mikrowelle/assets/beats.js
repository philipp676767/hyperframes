// #89 Ei in der Mikrowelle — every time-keyed decision as plain data, read by
// scene.js (picture) and scripts/build-sfx.mjs (sound). No three.js / DOM.
import { W } from "./timing.js";

export const T = {
  mw1: W("Mikrowelle", 1),
  erst: W("Erst"),
  nichts: W("nichts"),
  piept: W("piept"),
  trotzdem: W("Trotzdem"),
  bombe: W("Bombe"),
  heizt: W("heizt"),
  wasser1: W("Wasser", 1),
  grossteil: W("Großteil"),
  tief: W("Tief"),
  heisser: W("heißer"),
  doch: W("Doch"),
  eigelb1: W("Eigelb", 1),
  taschen: W("Taschen"),
  warten: W("warten"),
  rate: W("Rate"),
  knallt1: W("knallt", 1),
  meistens: W("Meistens"),
  stichst: W("stichst"),
  reisst: W("reißt"),
  dampf: W("Dampf"),
  tausendmal: W("tausendmal"),
  knallt2: W("knallt", 2),
  gabel: W("Gabel"),
  gesicht: W("Gesicht"),
  also: W("Also"),
  schneiden: W("schneiden"),
  fakt: W("Übrigens"),
  labor: W("Labor"),
  press: W("Presslufthammer"),
  schon: W("Schon"),
};
// derived moments
export const SLAM = 1.0; // door shuts, microwave starts
export const GRAB = T.knallt1 + 0.1; // the hand lifts the egg off the turntable
export const BOOM = T.gabel + 0.08; // the egg bursts under the fork
export const BOOM2 = T.press + 0.05; // the lab egg bursts

// plate (set.js PLATE) and board (set.js BOARD) positions, repeated as data
const P = [9.2, -0.59, 1.4];
const B = [-8.2, -0.5, 2.4];
const A = [13.6, -0.75, 1.6];

// ---------------------------------------------------------------- shots
// look = point the lens aims at; from/to are pulled back ×zoom from it
export const shots = [
  // hook: into the open microwave, the hand sets the egg down, the door shuts
  { at: 0, from: [2.0, 2.3, 3.4], to: [1.6, 2.0, 3.0], look: [0, 0.6, 0], zoom: 2.0 },
  // the microwave from the front, glowing, display counting down
  { at: SLAM + 0.15, from: [3.4, 2.8, 9.5], to: [2.6, 2.5, 8.4], look: [0.9, 1.5, 0], zoom: 1.5 },
  // through the dotted window: nothing happens
  { at: T.erst, from: [-1.3, 1.05, 1.7], to: [-1.0, 0.95, 1.45], look: [0, 0.45, 0], zoom: 1.5 },
  // the display: 0:00, beep
  { at: T.piept, from: [5.6, 3.8, 5.6], to: [5.3, 3.6, 5.0], look: [4.6, 3.3, 3.5], zoom: 1.2 },
  // low close-up inside: the egg glows from within — a bomb
  {
    at: T.trotzdem,
    from: [1.25, 0.75, 1.75],
    to: [0.95, 0.72, 1.4],
    look: [0, 0.62, 0],
    zoom: 1.55,
  },
  // x-ray: microwaves from the walls, the water inside jiggles
  { at: T.heizt, from: [1.7, 1.5, 1.6], to: [1.2, 1.2, 1.4], look: [0, 0.6, 0], zoom: 1.45 },
  // macro on the yolk: hotter than boiling
  { at: T.tief, from: [0.55, 0.85, 0.75], to: [0.4, 0.75, 0.62], look: [0, 0.58, 0], zoom: 1.35 },
  // the firm yolk locks it in
  {
    at: T.doch,
    from: [-0.75, 0.95, 0.7],
    to: [-0.55, 0.85, 0.58],
    look: [0, 0.56, 0],
    zoom: 1.3,
    whip: -1,
  },
  // the pockets of pressure
  { at: T.taschen, from: [0.32, 0.72, 0.5], to: [0.24, 0.68, 0.4], look: [0, 0.56, 0], zoom: 1.25 },
  // wide outside: door pops open, the hand takes the egg out — "Meistens nicht"
  { at: T.rate, from: [3.4, 2.6, 8.4], to: [2.7, 2.3, 7.4], look: [0.6, 1.2, 0], zoom: 1.55 },
  // the plate: the fork comes down
  {
    at: T.stichst,
    from: [P[0] + 1.3, 0.75, P[2] + 2.6],
    to: [P[0] + 1.0, 0.6, P[2] + 2.2],
    look: [P[0], -0.05, P[2]],
    zoom: 1.45,
  },
  // x-ray macro: the yolk tears, the pockets burst
  {
    at: T.reisst,
    from: [P[0] + 0.55, 0.3, P[2] + 0.75],
    to: [P[0] + 0.45, 0.25, P[2] + 0.62],
    look: [P[0], -0.03, P[2]],
    zoom: 1.3,
  },
  // steam blows up inside
  {
    at: T.dampf,
    from: [P[0] - 0.6, 0.35, P[2] + 0.75],
    to: [P[0] - 0.75, 0.4, P[2] + 0.9],
    look: [P[0], -0.03, P[2]],
    zoom: 1.35,
    whip: 1,
  },
  // analogy: one drop of water vs. its steam
  {
    at: T.tausendmal,
    from: [A[0] - 0.6, 0.9, A[2] + 3.4],
    to: [A[0] - 0.4, 0.8, A[2] + 3.0],
    look: [A[0] - 0.15, 0.35, A[2]],
    zoom: 1.4,
  },
  // payoff: your view over the plate — it goes off at the fork, into your face
  {
    at: T.knallt2,
    from: [P[0] + 0.2, 2.1, P[2] + 3.2],
    to: [P[0] + 0.1, 1.5, P[2] + 2.4],
    look: [P[0], -0.2, P[2]],
    zoom: 1.25,
  },
  // the safe way: cut into pieces, steam escapes harmlessly
  {
    at: T.also,
    from: [P[0] + 0.9, 2.4, P[2] + 2.1],
    to: [P[0] + 0.6, 2.1, P[2] + 1.8],
    look: [P[0], -0.45, P[2]],
    zoom: 1.4,
  },
  // Übrigens: the lab egg on the board, sound rings — louder than a jackhammer
  {
    at: T.fakt,
    from: [B[0] + 1.9, 1.0, B[2] + 3.6],
    to: [B[0] + 1.4, 0.8, B[2] + 3.0],
    look: [B[0], 0.3, B[2]],
    zoom: 1.5,
  },
  {
    at: T.press,
    from: [B[0] - 1.2, 1.4, B[2] + 3.0],
    to: [B[0] - 1.6, 1.6, B[2] + 3.6],
    look: [B[0], 0.4, B[2]],
    zoom: 1.55,
  },
];

// ---------------------------------------------------------------- labels (one at a time)
export const LABELS = [
  { text: "Wasser", at: T.wasser1 + 0.1, until: T.tief, pos: [0.3, 0.86, 0.18], side: 1 },
  { text: "Eigelb", at: T.eigelb1, until: T.taschen, pos: [-0.12, 0.6, 0.18], side: -1 },
  { text: "Druck", at: T.taschen + 0.2, until: T.rate, pos: [0.05, 0.6, 0.14], side: -1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "shake", at: SLAM, dur: 0.35, amp: 0.6 }, // the door slams
  { kind: "zoom", at: T.bombe, amount: 0.3 },
  { kind: "zoom", at: T.wasser1, amount: 0.25 },
  { kind: "slowmo", at: T.heisser, until: T.doch, speed: 0.5 },
  { kind: "shake", at: T.taschen + 0.2, dur: 0.4, amp: 0.3 },
  { kind: "zoom", at: T.meistens, amount: 0.3 },
  { kind: "slowmo", at: T.reisst, until: T.dampf, speed: 0.4 },
  { kind: "flash", at: T.dampf },
  { kind: "shake", at: T.dampf, dur: 0.5, amp: 0.7 },
  { kind: "zoom", at: T.tausendmal, amount: 0.3 },
  { kind: "flash", at: BOOM },
  { kind: "shake", at: BOOM, dur: 0.7, amp: 1.2 },
  { kind: "flash", at: BOOM2 },
  { kind: "shake", at: BOOM2, dur: 0.6, amp: 1.0 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "klack", at: 0.2, db: -8 }, // the egg is set down on the glass plate
  { s: "klack", at: SLAM - 0.02, db: -4 }, // the door shuts
  { s: "brumm", at: SLAM + 0.05, dur: T.piept - SLAM - 0.1, db: -17 },
  { s: "piep", at: T.piept, dur: 1.0, db: -12 },
  { s: "brumm", at: T.heizt, dur: T.rate - T.heizt - 0.1, db: -20 },
  { s: "klack", at: T.rate + 0.25, db: -7 }, // the door pops open
  { s: "zisch", at: T.dampf, dur: 1.2, db: -14 },
  { s: "eiknall", at: BOOM, db: -3 },
  { s: "zisch", at: T.also + 0.3, dur: 1.4, db: -22 }, // harmless steam from the pieces
  { s: "eiknall", at: BOOM2, db: -3 },
];
