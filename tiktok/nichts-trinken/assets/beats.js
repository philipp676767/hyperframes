// #67 „Einen Tag nichts trinken“ — every time-keyed decision as plain data
// (read by scene.js and scripts/build-sfx.mjs). No three.js / DOM here.
import { W } from "./timing.js";

export const T = {
  schluck: W("Schluck"),
  kaffee: W("Kaffee"),
  harmlos: W("harmlos"),
  koerper: W("Körper"),
  schwitzen: W("Schwitzen"),
  klo: W("Klo"),
  atemzug: W("Atemzug"),
  mittag: W("Mittag"),
  pipi: W("Pipi"),
  dunkel: W("dunkel"),
  nachmittag: W("Nachmittag"),
  blut: W("Blut"),
  herz: W("Herz"),
  gehirn: W("Gehirn"),
  schrumpft: W("schrumpft"),
  haemmert: W("hämmert"),
  folge: W("Folge"),
  rate: W("Rate"),
  atmen: W("Atmen"),
  glas: W("Glas"),
  nieren: W("Nieren"),
  tropfen: W("Tropfen"),
  kopf2: W("Kopf", 2),
  prozent: W("Prozent"),
  konzentration: W("Konzentration"),
  forscher: W("Forscher"),
  sim: W("Fahrsimulator"),
  doppelt: W("Doppelt"),
  fehler: W("Fehler"),
  faehrst: W("fährst"),
  betrunken: W("betrunken"),
  fakt: W("Übrigens"),
  mengen: W("Mengen"),
  wie: W("wie", 3),
};

// world positions of the pieces (scene.js uses the same numbers)
export const BODY = [0, 0, 0]; // you, standing at the camping table
export const TABLE = [1.55, 0, 1.0]; // table top at y 1.5
export const GLASS = [1.35, 1.5, 1.1];
export const CUP = [1.85, 1.5, 0.85];
export const SIM = [7.4, 0, 1.6]; // the driving simulator (mini set)
export const DIXI = [-6.8, 0, -8.2];

// ---------------------------------------------------------------- shots
export const shots = [
  // frame 0: the hand flicks the full glass — water flies, fast push-in
  { at: 0, from: [0.25, 1.95, 2.35], to: [0.7, 1.78, 1.85], look: [1.25, 1.62, 1.05], zoom: 1.0 },
  // the coffee is shoved away too
  {
    at: T.schluck + 0.25,
    from: [1.2, 2.15, 2.3],
    to: [1.45, 2.0, 2.0],
    look: [1.95, 1.65, 0.75],
    zoom: 1.25,
    whip: 1,
  },
  // wide: you on the festival campsite in the blazing sun
  { at: T.harmlos, from: [4.2, 2.8, 7.5], to: [3.4, 2.5, 6.4], look: [0.3, 1.9, -1], zoom: 1.3 },
  // the body turns x-ray: water inside
  { at: T.koerper, orbit: { c: [0, 1.9, 0], r: 3.4, y: 2.2, a0: 0.5, a1: 0.15 }, zoom: 1.2 },
  // sweat runs down the forehead
  { at: T.schwitzen, from: [0.9, 3.25, 1.5], to: [0.7, 3.2, 1.2], look: [0, 3.1, 0.1], zoom: 1.0 },
  // whip to the Dixi row
  {
    at: T.klo,
    from: [-3.6, 2.2, -3.6],
    to: [-4.4, 2.0, -4.6],
    look: [-6.8, 1.3, -8.2],
    zoom: 1.3,
    whip: -1,
  },
  // breath leaves the mouth (side view)
  { at: T.atemzug, from: [1.4, 3.1, 0.6], to: [1.2, 3.05, 0.95], look: [0, 3.0, 0.4], zoom: 1.0 },
  // noon: dry lips, the colour scale slides to dark (2nd money shot)
  { at: T.mittag, from: [-2.2, 2.6, 3.4], to: [-1.8, 2.4, 2.9], look: [-0.9, 2.0, 0.3], zoom: 1.2 },
  // afternoon: blood thickens (x-ray chest)
  { at: T.nachmittag, from: [1.5, 2.6, 2.6], to: [1.2, 2.5, 2.2], look: [0.05, 2.2, 0], zoom: 1.1 },
  // the heart races
  { at: T.herz, from: [-1.0, 2.6, 2.1], to: [-0.8, 2.5, 1.8], look: [0.1, 2.4, 0], zoom: 1.0 },
  // the brain shrinks (slowmo)
  { at: T.gehirn, orbit: { c: [0, 3.1, 0], r: 1.25, y: 3.35, a0: 0.9, a1: 0.35 }, zoom: 1.0 },
  // the head pounds
  { at: T.haemmert, from: [0, 3.1, 2.4], to: [0, 3.1, 1.7], look: [0, 3.0, 0], zoom: 1.1 },
  // follow line: medium, body above the pill
  { at: T.folge, from: [2.6, 3.0, 4.6], to: [2.2, 2.9, 4.0], look: [0.4, 2.3, 0], zoom: 1.2 },
  // guess: breath streams into a big glass
  { at: T.rate, from: [2.6, 3.0, 3.0], to: [2.2, 2.85, 2.6], look: [0.65, 2.55, 0.75], zoom: 1.0 },
  { at: T.glas, from: [2.4, 2.2, 2.9], to: [2.15, 2.35, 2.5], look: [1.15, 2.3, 1.25], zoom: 1.0 },
  // kidneys from behind (x-ray)
  {
    at: T.nieren,
    from: [-1.5, 1.7, -2.4],
    to: [-1.2, 1.65, -1.9],
    look: [0, 1.45, -0.1],
    zoom: 1.0,
  },
  // brain dims — concentration drops
  { at: T.kopf2, orbit: { c: [0, 3.1, 0], r: 1.35, y: 3.35, a0: -0.5, a1: 0.1 }, zoom: 1.0 },
  // whip to the driving simulator
  {
    at: T.forscher,
    from: [SIM[0] - 3.4, 2.6, SIM[2] + 4.4],
    to: [SIM[0] - 2.6, 2.3, SIM[2] + 3.6],
    look: [SIM[0], 1.5, SIM[2] - 0.4],
    zoom: 1.3,
    whip: 1,
  },
  // errors pile up: over the shoulder onto the screen
  {
    at: T.doppelt,
    from: [SIM[0] + 0.9, 2.35, SIM[2] + 1.7],
    to: [SIM[0] + 0.7, 2.25, SIM[2] + 1.35],
    look: [SIM[0], 1.8, SIM[2] - 1.2],
    zoom: 1.0,
  },
  // drunk: crash zoom onto the wobbling screen
  {
    at: T.faehrst,
    from: [SIM[0] - 0.75, 2.1, SIM[2] + 0.55],
    to: [SIM[0] - 0.55, 2.05, SIM[2] + 0.2],
    look: [SIM[0] + 0.1, 1.85, SIM[2] - 1.25],
    zoom: 1.0,
  },
  // Übrigens: coffee counts — steaming cup, green check
  { at: T.fakt, from: [2.55, 2.0, 1.65], to: [2.4, 1.9, 1.4], look: [2.0, 1.72, 0.6], zoom: 1.0 },
  // comment question: slow orbit around you + the coffee
  { at: T.wie, orbit: { c: [1.0, 2.0, 0.5], r: 3.0, y: 2.6, a0: 0.9, a1: 0.45 }, zoom: 1.2 },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Schweiß", at: T.schwitzen + 0.2, until: T.klo, pos: [0.12, 3.18, 0.36], side: -1 },
  { text: "Herz", at: T.herz, until: T.gehirn, pos: [0.15, 2.42, 0.05], side: 1 },
  { text: "Gehirn", at: T.gehirn + 0.1, until: T.haemmert, pos: [0, 3.2, 0.05], side: 1 },
  { text: "Nieren", at: T.nieren, until: T.kopf2, pos: [0.22, 1.85, -0.12], side: -1 },
  { text: "Fahrsimulator", at: T.sim, until: T.doppelt, pos: [SIM[0], 2.2, SIM[2] - 1.2], side: 1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "slowmo", at: 0.25, until: T.schluck + 0.25, speed: 0.45 }, // the splash
  { kind: "zoom", at: T.kaffee, amount: 0.3 },
  { kind: "flash", at: T.harmlos }, // sun glare
  { kind: "zoom", at: T.klo + 0.3, amount: 0.25 },
  { kind: "zoom", at: T.dunkel, amount: 0.35 },
  { kind: "shake", at: T.herz + 0.4, dur: 0.6, amp: 0.5 },
  { kind: "slowmo", at: T.schrumpft, until: T.haemmert, speed: 0.5 },
  { kind: "shake", at: T.haemmert + 0.2, dur: 0.9, amp: 0.8 },
  { kind: "zoom", at: T.glas, amount: 0.35 },
  { kind: "flash", at: T.konzentration + 0.3 },
  { kind: "shake", at: T.fehler, dur: 0.6, amp: 0.7 },
  { kind: "zoom", at: T.betrunken, amount: 0.4 },
  { kind: "flash", at: T.fakt },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "splash", at: 0.15, db: -8 }, // the glass tips, water flies (own sound)
  { s: "klack", at: 0.12, db: -12 },
  { s: "klack", at: T.schluck + 0.55, db: -14 }, // the cup slides away
  { s: "klack", at: T.klo + 0.25, db: -12 }, // Dixi door
  { s: "rauschen", at: T.atemzug, dur: 1.0, db: -22 }, // breath
  { s: "heartbeat", at: T.herz, dur: T.gehirn - T.herz, db: -9 }, // own sound
  { s: "heartbeat", at: T.haemmert, dur: 1.8, db: -9 },
  { s: "rauschen", at: T.atmen, dur: 1.4, db: -22 },
  { s: "pop", at: T.glas + 0.1 },
  { s: "piep", at: T.fehler, dur: 1.2, db: -18 }, // simulator error beeps
  { s: "zisch", at: T.fakt + 0.2, dur: 1.5, db: -24 }, // coffee steam
];
