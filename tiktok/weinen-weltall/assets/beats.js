// #69 Weinen im Weltall — every time-keyed decision as plain data (scene + sfx).
import { W } from "./timing.js";

export const T = {
  wirst: W("wirst"),
  blind1: W("blind", 1),
  klingt: W("Klingt"),
  astronauten: W("Astronauten", 1),
  raumstation: W("Raumstation"),
  seife: W("Seife"),
  visier: W("Visier"),
  auge1: W("Auge", 1),
  brennt: W("brennt"),
  traenen: W("Tränen"),
  fallen: W("fallen"),
  runter: W("runter"),
  ohne: W("Ohne"),
  traene: W("Träne", 1),
  wasserkugel: W("Wasserkugel"),
  verschwimmt: W("verschwimmt"),
  folge: W("Folge"),
  wegwischen: W("Wegwischen"),
  helm1: W("Helm", 1),
  rate: W("Rate"),
  nase: W("Nase"),
  andere: W("andere"),
  schuld: W("Schuld"),
  oberfl: W("Oberflächenspannung"),
  jetzt2: W("Jetzt", 2),
  blind2: W("blind", 2),
  denn: W("Denn"),
  nirgendwohin: W("nirgendwohin"),
  waechst: W("wächst", 2),
  uebrigens: W("Übrigens"),
  helm2: W("Helm", 2),
  ertrunken: W("ertrunken"),
  bei: W("Bei"),
};

// face / eye in world space (scene.js HEAD + EYES)

export const shots = [
  // 0 — the cover shot: face in the helmet, the water ball already on the eye, glove knocks
  { at: 0, from: [0.3, 1.78, 0.85], to: [0.07, 1.71, 0.43], look: [-0.02, 1.64, 0.1], zoom: 1 },
  // 1 — 3/4 side: the glove can't get in
  { at: 1.3, from: [-0.55, 1.62, 0.62], to: [-0.4, 1.66, 0.48], look: [0, 1.62, 0.12], zoom: 1 },
  // 2 — wide: the astronaut on the robot arm, the Earth below
  { at: T.klingt, from: [2.3, 2.3, 4.0], to: [1.7, 1.95, 3.1], look: [0, 1.0, -1], zoom: 1 },
  // 3 — reveal: the whole station
  {
    at: T.raumstation,
    from: [5, 3.5, 8.5],
    to: [8, 4.8, 13],
    look: [-3, 1.5, -10],
    zoom: 1,
    whip: 1,
  },
  // 4 — inside the visor: soap drifts to the eye
  {
    at: T.seife,
    from: [0.33, 1.74, 0.42],
    to: [0.22, 1.71, 0.32],
    look: [-0.03, 1.645, 0.12],
    zoom: 1,
  },
  // 5 — it stings: front close-up
  {
    at: T.brennt,
    from: [-0.02, 1.7, 0.48],
    to: [-0.02, 1.69, 0.38],
    look: [-0.025, 1.64, 0.1],
    zoom: 1,
  },
  // 6 — the tears don't fall (slowmo)
  {
    at: T.fallen,
    from: [0.16, 1.6, 0.6],
    to: [0.12, 1.58, 0.52],
    look: [-0.03, 1.55, 0.12],
    zoom: 1,
  },
  // 7 — no up, no down: orbit round the astronaut, Earth swinging past
  { at: T.ohne, orbit: { c: [0, 1.0, 0], r: 3.3, y: 2.1, a0: -1.1, a1: 0.15 }, zoom: 1, whip: -1 },
  // 8 — macro: the tear grows into a ball
  {
    at: T.traene,
    from: [-0.13, 1.71, 0.33],
    to: [-0.13, 1.71, 0.37],
    look: [-0.035, 1.66, 0.105],
    zoom: 1,
  },
  // 9 — POV: everything blurs
  {
    at: T.verschwimmt,
    from: [0, 1.69, 0.12],
    to: [0, 1.69, 0.13],
    look: [0.6, 1.0, 0.8],
    lookTo: [0.75, 0.9, 0.6],
    zoom: 1,
    focus: 0.04,
  },
  // 10 — follow line: medium shot, Earth behind
  { at: T.folge, from: [-1.7, 1.45, 2.5], to: [-1.25, 1.6, 2.0], look: [0, 1.35, 0], zoom: 1 },
  // 11 — wipe it away? the glove hits the helmet
  {
    at: T.wegwischen,
    from: [-0.75, 1.78, 0.95],
    to: [-0.55, 1.74, 0.75],
    look: [0.05, 1.62, 0.1],
    zoom: 1,
  },
  // 12 — guess where it goes: front, both eyes
  { at: T.rate, from: [0.0, 1.71, 0.56], to: [0.0, 1.7, 0.44], look: [0, 1.65, 0.1], zoom: 1 },
  // 13 — over the nose into the other eye (slowmo)
  { at: T.nase, from: [0.06, 1.73, 0.36], to: [0.0, 1.705, 0.3], look: [0, 1.655, 0.1], zoom: 1 },
  // 14 — surface tension: the molecule net
  {
    at: T.schuld,
    orbit: { c: [-0.0, 1.655, 0.12], r: 0.23, y: 1.69, a0: 0.7, a1: -0.25 },
    zoom: 1,
  },
  // 15 — POV: blind on both eyes
  {
    at: T.jetzt2,
    from: [0, 1.69, 0.12],
    to: [0, 1.69, 0.125],
    look: [0.6, 1.0, 0.8],
    lookTo: [0.4, 0.8, 0.9],
    zoom: 1,
    focus: 0.025,
  },
  // 16 — payoff: pull out from the face to the whole scene
  {
    at: T.denn,
    from: [0.05, 1.71, 0.55],
    to: [2.4, 2.5, 4.6],
    look: [0, 1.6, 0.05],
    lookTo: [0, 1.2, -0.5],
    zoom: 1,
  },
  // 17 — Übrigens: water in the helmet
  {
    at: T.uebrigens,
    from: [0.48, 1.76, 0.62],
    to: [0.34, 1.72, 0.48],
    look: [0, 1.63, 0.03],
    zoom: 1,
  },
  // 18 — comment question: wide, Earth turning
  { at: T.bei, from: [-2.4, 2.3, 3.4], to: [-3.3, 2.9, 4.7], look: [0, 1.2, -1], zoom: 1 },
];

export const LABELS = [
  { text: "Raumstation", at: T.raumstation + 0.2, until: T.seife, pos: [-7, 0.8, -11], side: -1 },
  { text: "Visier", at: T.visier, until: T.brennt, pos: [0.08, 1.78, 0.215], side: 1 },
  {
    text: "Wasserkugel",
    at: T.wasserkugel,
    until: T.verschwimmt,
    pos: [-0.035, 1.71, 0.13],
    side: -1,
  },
  { text: "Helm", at: T.helm1, until: T.rate, pos: [0.12, 1.85, 0.12], side: 1 },
  { text: "Oberflächenspannung", at: T.oberfl, until: T.jetzt2, pos: [0, 1.72, 0.14], side: 1 },
];

export const HIGHLIGHTS = [
  { kind: "zoom", at: 0.35, amount: 0.25 }, // glove knock on frame ~10
  { kind: "zoom", at: T.blind1, amount: 0.3 },
  { kind: "flash", at: T.brennt },
  { kind: "shake", at: T.brennt, dur: 0.5, amp: 0.7 },
  { kind: "slowmo", at: T.fallen, until: T.ohne, speed: 0.4 },
  { kind: "zoom", at: T.wasserkugel, amount: 0.35 },
  { kind: "shake", at: T.helm1, dur: 0.4, amp: 0.6 },
  { kind: "slowmo", at: T.nase, until: T.schuld, speed: 0.45 },
  { kind: "flash", at: T.blind2 },
  { kind: "zoom", at: T.nirgendwohin, amount: 0.3 },
  { kind: "shake", at: T.ertrunken, dur: 0.5, amp: 0.6 },
];

export const SFX = [
  { s: "quindar", at: 0.0, db: -14 }, // space radio beep on frame 0
  { s: "atmen", at: 0.05, db: -13 }, // breathing inside the helmet
  { s: "klack", at: 0.35, db: -10 }, // glove knocks on the visor
  { s: "klack", at: 0.95, db: -12 },
  { s: "zisch", at: T.brennt, dur: 0.6, db: -20 },
  { s: "atmen", at: T.ohne + 0.1, db: -16 },
  { s: "klack", at: T.helm1, db: -9 },
  { s: "quindar", at: T.rate + 0.2, db: -17 },
  { s: "atmen", at: T.jetzt2, db: -14 },
  { s: "rauschen", at: T.uebrigens + 0.2, dur: T.bei - T.uebrigens - 0.2, db: -22 },
];
