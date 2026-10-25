// Beats of #33 "Weltall" (format B): what happens if you go out into space
// without a spacesuit? Plain data — read by scene.js (picture) and
// build-sfx.mjs (sound).
import { W } from "./timing.js";

// ---------------------------------------------------------------- beats
export const T = {
  weltall: W("Weltall"),
  ziehst: W("ziehst"),
  luke: W("Luke"),
  dann: W("dann"),
  spucke: W("Spucke", 1),
  kochen: W("kochen"),
  hitze: W("Hitze"),
  luft: W("Luft"),
  nichts: W("Nichts"),
  lunge: W("Lunge"),
  halt: W("Halt"),
  platzt: W("platzt"),
  tickt: W("tickt"),
  uhr: W("Uhr"),
  folg: W("Folg"),
  luftdruck: W("Luftdruck"),
  dampf: W("Dampf"),
  schwillst: W("schwillst"),
  doppelte: W("Doppelte"),
  haut: W("Haut"),
  rate: W("Rate"),
  wach: W("wach"),
  fuenfzehn: W("15"),
  schwarz: W("schwarz"),
  blut: W("Blut"),
  herz: W("Herz"),
  druck: W("Druck"),
  erfrieren: W("erfrieren"),
  laenger: W("länger"),
  vakuum: W("Vakuum"),
  thermoskanne: W("Thermoskanne"),
  stueck: W("Stück"),
  reingeholt: W("reingeholt"),
  ueberleben: W("überleben"),
  uebrigens: W("Übrigens"),
  nasa: W("NASA-Tester"),
  zuletzt: W("Zuletzt"),
  spucke2: W("Spucke", 2),
  sollen: W("sollen"),
};

// world anchors (scene.js builds things there)
export const YOU = [0, 1.2, 0.4]; // where you float after the blast (body centre)
export const THERMOS = [-18, 1.2, 6]; // analogy: the thermos flask in space
export const CHAMBER = [-34, 0, 9]; // 1966: the NASA vacuum chamber

// ---------------------------------------------------------------- shots
const me = { rel: YOU, zoom: 1 };
const th = { rel: THERMOS, zoom: 1 };
const ch = { rel: CHAMBER, zoom: 1 };
export const shots = [
  // 0: you, blasted out of the hatch in the white cloud, the door flying open
  { at: 0, from: [-2.5, 1.7, 1.5], to: [-2.1, 1.55, 1.4], look: [0, 1.15, -1.2], zoom: 1 },
  // 1.2: wide from below — you tumble towards the camera, station + Earth
  { at: 1.2, from: [2.7, 0.35, 4.6], to: [2.1, 0.6, 3.8], look: [0, 1.3, -0.6], zoom: 1 },
  // the hatch door tumbles away, you spin
  {
    at: T.ziehst,
    from: [-3.2, 2.1, 2.6],
    to: [-2.6, 1.8, 2.2],
    look: [0, 1.2, 0.1],
    zoom: 1,
    whip: 1,
  },
  // your face: the spit bubbles on your tongue
  { at: T.spucke, ...me, from: [0.42, 0.6, 0.95], to: [0.3, 0.53, 0.74], look: [0, 0.44, 0] },
  // the last air races past you
  {
    at: T.luft,
    from: [2.6, 1.7, 1.6],
    to: [2.2, 1.5, 1.3],
    look: [0, 1.15, 0.0],
    zoom: 1,
    whip: -1,
  },
  // x-ray: the lungs
  { at: T.lunge, ...me, from: [0.75, 0.4, 1.95], to: [0.55, 0.32, 1.6], look: [0, 0.15, 0] },
  // hold it and they burst: crash in
  { at: T.platzt, ...me, from: [0.4, 0.3, 1.25], to: [0.3, 0.26, 1.02], look: [0, 0.18, 0] },
  // the clock starts: high, you alone over the Earth
  { at: T.tickt, from: [1.9, 3.5, 3.5], to: [1.5, 3.0, 2.8], look: [0, 0.7, -0.4], zoom: 1 },
  // follow line: a calm orbit
  { at: T.folg, orbit: { c: [0, 1.2, 0.4], r: 3.3, y: 1.7, a0: 0.75, a1: 0.2 }, zoom: 1 },
  // steam rising off your skin
  { at: T.luftdruck, ...me, from: [-1.2, 0.55, 1.9], to: [-0.95, 0.45, 1.55], look: [0, 0.1, 0] },
  // you swell (slow motion)
  { at: T.schwillst, from: [1.9, 1.5, 3.4], to: [1.5, 1.35, 2.8], look: [0, 1.2, 0.4], zoom: 1 },
  // twice the size — low angle, black space
  { at: T.doppelte, from: [0.6, 0.2, 3.4], to: [0.45, 0.35, 3.0], look: [0, 1.3, 0.4], zoom: 1 },
  // the skin holds you together: close on the arm
  { at: T.haut, ...me, from: [1.1, 0.55, 2.6], to: [0.9, 0.45, 2.2], look: [0.15, 0.05, 0] },
  // Rate mal: the stopwatch, you in the middle
  { at: T.rate, from: [0, 1.65, 4.3], to: [0, 1.5, 3.7], look: [0, 1.3, 0.3], zoom: 1 },
  // 15 seconds — crash in on your face
  { at: T.fuenfzehn, ...me, from: [0.25, 0.55, 1.6], to: [0.15, 0.5, 1.3], look: [0, 0.38, 0] },
  // then it goes black: slow pull-back
  { at: T.schwarz, from: [1.2, 1.8, 2.6], to: [2.4, 2.6, 4.7], look: [0, 1.2, 0.4], zoom: 1 },
  // x-ray: the blood keeps flowing
  { at: T.blut, ...me, from: [0.9, 0.45, 2.3], to: [0.7, 0.38, 1.9], look: [0, 0.05, 0], whip: 1 },
  // the heart
  { at: T.herz, ...me, from: [0.38, 0.32, 1.1], to: [0.28, 0.28, 0.88], look: [0.03, 0.18, 0.03] },
  // the pressure holds it liquid: orbit round the chest
  { at: T.druck, ...me, orbit: { c: [0, 0.15, 0], r: 1.5, y: 0.45, a0: -0.6, a1: 0.2 } },
  // freezing? from below, the body still warm
  { at: T.erfrieren, from: [-2.6, 0.4, 2.5], to: [-2.2, 0.6, 2.05], look: [0, 1.3, 0.4], zoom: 1 },
  // the thermos flask floating next to the station
  { at: T.vakuum, ...th, from: [1.7, 1.0, 3.1], to: [1.25, 0.9, 2.45], look: [0, 0.55, 0] },
  {
    at: T.thermoskanne,
    ...th,
    from: [1.2, 1.1, 2.2],
    to: [0.95, 0.95, 1.85],
    look: [0, 0.65, 0],
    whip: -1,
  },
  // payoff: the robot arm catches you — in one piece
  { at: T.stueck, from: [3.6, 2.5, 4.2], to: [3.1, 2.3, 3.6], look: [0.4, 1.5, -0.2], zoom: 1 },
  // it pulls you back to the hatch
  { at: T.reingeholt, from: [-3.7, 2.2, 2.3], to: [-3.1, 2.0, 1.7], look: [0, 1.3, -1.4], zoom: 1 },
  // the hatch slams shut, air rushes back in
  { at: T.ueberleben, from: [2.6, 2.3, 3.6], to: [2.2, 2.0, 3.0], look: [0, 1.2, -2.2], zoom: 1 },
  // Übrigens: 1966, the NASA vacuum chamber
  { at: T.uebrigens, ...ch, from: [1.4, 1.7, 5.0], to: [1.0, 1.5, 4.2], look: [0, 1.3, 0] },
  // through the porthole: the bubbling spit
  { at: T.zuletzt, ...ch, from: [0.34, 1.62, 2.55], to: [0.24, 1.56, 2.2], look: [0, 1.5, 0.8] },
  // CTA: drone pull-back over the station and the Earth
  {
    at: T.sollen,
    from: [2.6, 2.4, 4.8],
    to: [11, 8, 17],
    look: [0, 1.2, -2],
    lookTo: [0, 0, -6],
    zoom: 1,
    tilt: 0.6,
  },
];

// ---------------------------------------------------------------- labels
const at = (p, d) => [YOU[0] + p[0], YOU[1] + p[1], YOU[2] + p[2] + (d ?? 0)];
export const LABELS = [
  { text: "Lunge", at: T.lunge + 0.1, until: T.platzt, pos: at([0.09, 0.2, 0.06]), side: 1 },
  { text: "Haut", at: T.haut + 0.1, until: T.rate, pos: at([0.3, -0.02, 0.05]), side: 1 },
  { text: "Herz", at: T.herz + 0.1, until: T.erfrieren, pos: at([0.04, 0.2, 0.08]), side: -1 },
  {
    text: "Vakuum",
    at: T.vakuum + 0.2,
    until: T.stueck,
    pos: [THERMOS[0] + 0.33, THERMOS[1] + 0.65, THERMOS[2] + 0.1],
    side: 1,
  },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "shake", at: 0, dur: 0.6, amp: 0.8 }, // the hatch blasts open
  { kind: "zoom", at: 0.25, amount: 0.3 },
  { kind: "shake", at: 1.25, dur: 0.4, amp: 0.6 }, // you shoot out
  { kind: "zoom", at: T.luke, amount: 0.25 },
  { kind: "slowmo", at: T.spucke - 0.1, until: T.luft, speed: 0.45 }, // bubbling spit
  { kind: "zoom", at: T.lunge, amount: 0.3 },
  { kind: "flash", at: T.platzt },
  { kind: "shake", at: T.platzt, dur: 0.45, amp: 0.8 },
  { kind: "slowmo", at: T.schwillst - 0.1, until: T.doppelte, speed: 0.4 }, // swelling
  { kind: "zoom", at: T.doppelte, amount: 0.35 },
  { kind: "zoom", at: T.haut, amount: 0.2 },
  { kind: "flash", at: T.fuenfzehn },
  { kind: "zoom", at: T.fuenfzehn, amount: 0.35 },
  { kind: "zoom", at: T.herz, amount: 0.3 },
  { kind: "zoom", at: T.thermoskanne, amount: 0.25 },
  { kind: "shake", at: T.stueck + 0.1, dur: 0.4, amp: 0.6 }, // the arm grabs you
  { kind: "shake", at: T.ueberleben + 0.45, dur: 0.4, amp: 0.7 }, // hatch slams
  { kind: "zoom", at: T.zuletzt, amount: 0.25 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "rauschen", at: 0, dur: 3.2, db: -6 }, // the air blasts out
  { s: "klack", at: 0.02, db: -6 }, // hatch lock bangs open
  { s: "piep", at: 0.45, db: -18 }, // alarm
  { s: "pop", at: T.spucke + 0.35, db: -15 }, // spit bubbles
  { s: "pop", at: T.spucke + 0.75, db: -17 },
  { s: "rauschen", at: T.luft, dur: 2.2, db: -15 },
  { s: "pop", at: T.platzt, db: -8 },
  { s: "click", at: T.uhr, db: -10 }, // stopwatch starts
  { s: "zisch", at: T.dampf - 0.2, dur: 2, db: -18 },
  { s: "surr", at: T.schwillst, dur: 2.4, db: -20 },
  { s: "piep", at: T.fuenfzehn, db: -13 },
  { s: "herzschlag", at: T.herz - 0.1, db: -7 },
  { s: "klack", at: T.stueck + 0.1, db: -8 }, // the arm grabs you
  { s: "brumm", at: T.stueck + 0.2, dur: 2.4, db: -18 }, // arm motors
  { s: "klack", at: T.ueberleben + 0.45, db: -4 }, // hatch slams
  { s: "rauschen", at: T.ueberleben + 0.55, dur: 1.5, db: -16 }, // air back in
  { s: "pop", at: T.zuletzt + 0.4, db: -15 },
];
