// Mikrowelle beats: every time-keyed decision as plain data, so scene.js
// (picture) and scripts/build-sfx.mjs (sound) read the same numbers.
// Keep this file free of three.js / DOM: it is imported by node too.
import { W } from "./timing.js";

// ---------------------------------------------------------------- layout
// Shared with scene.js (plain numbers only).
export const F = [-0.42, 0.22, 0]; // food centre on the turntable (x, plate top, z)
export const MG = [0.78, 0.78, -0.25]; // magnetron
export const MS = [-5.0, 0, 2.0]; // water molecule set
export const RT = [5.0, 0, 2.0]; // WLAN router set, later the chocolate bar

// ---------------------------------------------------------------- beats
export const T = {
  metall1: W("Metall", 1),
  lass: W("Lass"),
  roehre: W("Röhre"),
  wellen1: W("Wellen", 1),
  wie: W("wie"),
  wlan: W("WLAN"),
  magnetron: W("Magnetron"),
  jedes: W("Jedes"),
  wasser: W("Wasserteilchen"),
  heiss1: W("heiß", 1),
  zweieinhalb: W("zweieinhalb"),
  aber: W("Aber"),
  zenti: W("Zentimeter"),
  mitte: W("Mitte"),
  mitgew: W("mitgewärmt"),
  eiskalt: W("eiskalt"),
  metall2: W("Metall", 2),
  spiegelt: W("Spiegelt"),
  gabel: W("Gabelspitzen"),
  staut: W("staut"),
  funkt: W("funkt"),
  darum: W("Darum"),
  gitter: W("Metallgitter"),
  deshalb: W("Deshalb"),
  schau: W("Schau"),
  gerade: W("gerade"),
  uebrigens: W("Übrigens"),
  schoko: W("Schokoriegel"),
  schmolz: W("schmolz"),
  schon: W("Schon"),
};

// turntable: turns slowly, stands still while the cut face is shown
export const PLATE_SPEED = 0.3;
export const FREEZE = [T.aber, T.metall2 - 0.12];
export function plateTime(t) {
  const [a, b] = FREEZE;
  return t < a ? t : t < b ? a : t - (b - a);
}

const rel = (p, d) => p.map((v, i) => v + d[i]);
const food = (d) => rel([F[0], F[1] + 0.14, F[2]], d);

// ---------------------------------------------------------------- shots
export const shots = [
  // hook: running microwave, the fork sparks behind the door window
  { at: 0, from: [0.15, 1.25, 2.3], to: [-0.1, 1.15, 2.0], look: [-0.4, 0.42, 0.2], zoom: 1.55 },
  {
    at: T.metall1,
    from: food([0.3, 0.5, 1.2]),
    to: food([0.25, 0.45, 1.05]),
    look: food([0.3, -0.1, 0.4]),
    zoom: 1.4,
  },
  // build: it shrinks away and pops back as a fresh build
  { at: T.lass, from: [2.6, 2.1, 4.6], to: [2.2, 1.9, 4.0], look: [0, 0.7, 0] },
  // magnetron in x-ray
  {
    at: T.roehre,
    from: rel(MG, [1.0, 0.55, 1.6]),
    to: rel(MG, [0.8, 0.5, 1.35]),
    look: MG,
    zoom: 1.35,
  },
  // WLAN router analogy
  {
    at: T.wie - 0.1,
    from: rel(RT, [1.0, 0.9, 1.6]),
    to: rel(RT, [0.75, 0.8, 1.3]),
    look: rel(RT, [0, 0.35, 0]),
    zoom: 1.3,
  },
  // waves bouncing around the cavity
  {
    at: T.magnetron - 0.16,
    orbit: { c: [-0.35, 0.7, 0], r: 2.3, y: 1.75, a0: -0.4, a1: 0.1 },
    zoom: 1.25,
  },
  // water molecules wiggling
  {
    at: T.jedes,
    from: rel(MS, [0.9, 1.0, 1.5]),
    to: rel(MS, [0.65, 0.9, 1.2]),
    look: rel(MS, [0, 0.45, 0]),
    zoom: 1.3,
  },
  {
    at: T.zweieinhalb,
    from: rel(MS, [-0.75, 0.8, 1.0]),
    to: rel(MS, [-0.55, 0.7, 0.8]),
    look: rel(MS, [0, 0.5, 0]),
    zoom: 1.3,
  },
  // only a few centimetres: the cut face
  {
    at: T.aber,
    from: food([0.6, 0.6, 1.3]),
    to: food([0.45, 0.5, 1.1]),
    look: food([0, 0, 0]),
    zoom: 1.45,
  },
  {
    at: T.zenti,
    from: food([0.2, 0.25, 0.85]),
    to: food([0.1, 0.2, 0.75]),
    look: food([0, 0, 0]),
    zoom: 1.25,
  },
  {
    at: T.eiskalt,
    from: food([-0.45, 0.35, 0.8]),
    to: food([-0.35, 0.3, 0.7]),
    look: food([0, 0, 0]),
    zoom: 1.25,
  },
  // metal: waves reflect, fork sparks, door grid
  { at: T.metall2 - 0.12, from: [1.3, 1.5, 3.1], to: [1.0, 1.35, 2.7], look: [-0.25, 0.7, 0] },
  {
    at: T.gabel,
    from: food([0.5, 0.3, 1.1]),
    to: food([0.4, 0.25, 0.95]),
    look: food([-0.05, -0.1, 0.42]),
    zoom: 1.3,
  },
  {
    at: T.funkt - 0.05,
    from: food([0.0, 0.3, 1.0]),
    to: food([0.1, 0.25, 0.9]),
    look: food([0.25, -0.1, 0.43]),
    zoom: 1.6,
  },
  {
    at: T.darum,
    from: [-1.6, 1.35, 2.3],
    to: [-1.25, 1.25, 2.0],
    look: [-0.42, 0.72, 0.8],
    zoom: 1.3,
  },
  // payoff: food hot from the outside
  {
    at: T.deshalb,
    from: food([0.7, 0.75, 1.5]),
    to: food([0.5, 0.6, 1.25]),
    look: food([0, 0, 0]),
    zoom: 1.3,
  },
  // outro: x-ray off, drone pull-back
  { at: T.schau, from: [0.9, 1.3, 3.6], to: [0.6, 1.2, 3.1], look: [0, 0.75, 0] },
  {
    at: T.gerade,
    from: [2.8, 2.4, 5.2],
    to: [5.5, 4.4, 9.5],
    look: [0, 0.8, 0],
    lookTo: [0, 0.6, 0],
  },
  // bonus fact: the chocolate bar next to a radar dish
  {
    at: T.uebrigens,
    from: rel(RT, [0.6, 1.3, 2.0]),
    to: rel(RT, [0.4, 1.15, 1.7]),
    look: rel(RT, [0.1, 0.3, -0.1]),
    zoom: 1.3,
  },
  // CTA: wide drone shot of the whole island
  {
    at: T.schon,
    from: [4.5, 3.8, 8.5],
    to: [9.5, 8.0, 17],
    look: [0, 0.9, 0],
    lookTo: [0, 0.5, 0],
  },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Magnetron", at: T.magnetron, until: T.jedes, pos: rel(MG, [0, 0.22, 0.1]), side: 1 },
  {
    text: "Wasserteilchen",
    at: T.wasser,
    until: T.zweieinhalb,
    pos: rel(MS, [0.15, 0.62, 0.2]),
    side: 1,
  },
  { text: "Mitte", at: T.mitte, until: T.eiskalt + 0.6, pos: food([0, 0, 0.01]), side: -1 },
  {
    text: "Gabel",
    at: T.gabel,
    until: T.funkt - 0.05,
    pos: [F[0] + 0.02, F[1] + 0.03, F[2] + 0.52],
    side: 1,
  },
  { text: "Metallgitter", at: T.gitter, until: T.deshalb, pos: [-0.42, 0.75, 0.86], side: 1 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "brumm", at: 0.05, dur: T.lass - 0.1, db: -24 }, // the microwave hums in the hook
  { s: "zisch", at: 0.4, dur: 0.6, db: -20 }, // sparks
  { s: "zisch", at: 2.1, dur: 0.7, db: -19 },
  { s: "pop", at: T.lass + 0.45 }, // microwave pops back in
  { s: "pop", at: T.roehre + 0.1 }, // magnetron
  { s: "surr", at: T.wellen1, dur: T.wie - T.wellen1, db: -22 },
  { s: "pop", at: T.wie }, // router
  { s: "brumm", at: T.magnetron, dur: T.jedes - T.magnetron, db: -24 },
  { s: "surr", at: T.jedes + 0.2, dur: T.aber - T.jedes - 0.4, db: -23 }, // wiggling molecules
  { s: "pop", at: T.aber + 0.3 }, // food cut open
  { s: "pop", at: T.gabel + 0.3 }, // fork
  { s: "surr", at: T.staut, dur: T.funkt - T.staut, db: -22 },
  { s: "zisch", at: T.funkt, dur: 0.9, db: -17 },
  { s: "pop", at: T.uebrigens + 0.3 }, // chocolate set
  { s: "boing", at: T.schmolz, db: -18 },
];
