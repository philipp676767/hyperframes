// #96 Eiswürfel angeln — every time-keyed decision as plain data (scene.js +
// scripts/build-sfx.mjs read the same numbers). No three.js / DOM here.
import { W, END } from "./timing.js";

export const T = {
  hier: W("Hier"),
  faden0: W("Faden", 1),
  stell: W("Stell"),
  eiswuerfel: W("Eiswürfel", 1),
  faden: W("Faden", 2),
  ziehen: W("ziehen"),
  nichts: W("nichts"),
  jetzt: W("Jetzt"),
  salz: W("Salz", 2),
  kurz: W("Kurz"),
  haengt: W("hängt"),
  dabei: W("Dabei"),
  taut: W("taut", 2),
  strasse: W("Straße"),
  unter: W("Unter"),
  schmilzt: W("schmilzt"),
  schicht: W("Schicht", 1),
  warum: W("Warum"),
  verrueckt: W("Verrückte"),
  waerme: W("Wärme"),
  rate: W("Rate"),
  aus: W("Aus"),
  null: W("null"),
  gleich: W("Gleichzeitig"),
  zu: W("Zu"),
  eiskalte: W("eiskalte"),
  gefrieren: W("gefrieren"),
  mit: W("Mit"),
  fakt: W("Übrigens"),
  zwanzig: W("20"),
  payoff: W("Salz", 6), // "Salz taut kurz …"
  zurueck: W("zurück"),
  angelst: W("angelst"),
  probierst: W("Probierst"),
  schreib: W("Schreib's"),
  end: END,
};

// cube lifted out of the cola (hook, after the salt, payoff)
export const LIFTS = [
  { at: -0.45, top: 1.25 },
  { at: T.haengt - 0.35, top: 1.25 },
  { at: T.angelst - 0.05, top: 1.45 },
];

// ---------------------------------------------------------------- shots
export const shots = [
  // hook: the cube rips out of the cola on the thread, hand above — fast push-in
  { at: 0, from: [2.0, 4.2, 3.6], to: [1.1, 4.0, 2.2], look: [0, 3.55, 0], zoom: 1.3 },
  // the thread frozen into the top
  { at: T.hier, from: [-0.9, 4.6, 1.5], to: [-0.65, 4.4, 1.1], look: [0, 3.9, 0], zoom: 1.7 },
  // the place: hut terrace, the glass on the table, peaks behind
  { at: T.stell, from: [4.6, 4.6, 8.8], to: [3.4, 3.6, 7.0], look: [0, 2.0, -1], zoom: 1.0 },
  { at: T.eiswuerfel, from: [1.9, 3.7, 2.8], to: [1.4, 3.4, 2.1], look: [0, 2.6, 0], zoom: 1.15 },
  // thread on, pull — nothing
  { at: T.faden, from: [-1.9, 3.9, 2.6], to: [-1.4, 3.6, 2.0], look: [0, 2.8, 0], zoom: 1.15 },
  {
    at: T.nichts,
    from: [0.9, 3.5, 1.8],
    to: [0.7, 3.4, 1.4],
    look: [0, 3.0, 0],
    zoom: 1.5,
    whip: 1,
  },
  // a pinch of salt (slow motion)
  { at: T.jetzt, from: [2.0, 4.0, 2.4], to: [1.5, 3.7, 1.9], look: [-0.15, 3.2, 0], zoom: 1.15 },
  // wait — and lift
  {
    at: T.kurz,
    from: [2.6, 3.4, 4.0],
    to: [2.0, 3.9, 3.2],
    look: [0, 3.0, 0],
    lookTo: [0, 3.75, 0],
    zoom: 1.1,
  },
  // road salt: the icy terrace steps down by the railing
  {
    at: T.dabei,
    from: [16.6, -12.6, 8.8],
    to: [15.9, -13.1, 8.0],
    look: [14, -14.9, 6],
    zoom: 1.0,
  },
  // macro: a thin water layer under the thread
  { at: T.unter, from: [1.25, 3.55, 1.6], to: [0.85, 3.35, 1.2], look: [0, 2.86, 0], zoom: 1.0 },
  { at: T.warum, orbit: { c: [0, 2.85, 0], r: 1.15, y: 3.35, a0: 0.9, a1: 0.35 }, zoom: 1.0 },
  // mid twist: melting costs heat
  {
    at: T.verrueckt,
    from: [-1.05, 2.98, 1.3],
    to: [-0.75, 2.96, 0.95],
    look: [0, 2.8, 0],
    zoom: 1.0,
  },
  {
    at: T.waerme,
    from: [0.95, 3.45, 1.55],
    to: [0.65, 3.3, 1.15],
    look: [0, 2.72, 0],
    zoom: 1.0,
    whip: -1,
  },
  { at: T.aus, from: [0, 3.25, 1.9], to: [0, 3.05, 1.3], look: [0, 2.6, 0], zoom: 1.05 },
  // salt diluted, layer refreezes around the thread
  { at: T.gleich, from: [0.35, 4.1, 0.95], to: [0.25, 3.85, 0.7], look: [0, 2.86, 0], zoom: 1.0 },
  { at: T.zu, from: [-1.3, 3.1, 1.05], to: [-1.0, 3.02, 0.8], look: [0, 2.86, 0], zoom: 1.0 },
  { at: T.eiskalte, orbit: { c: [0, 2.86, 0], r: 1.05, y: 3.3, a0: -0.7, a1: 0.35 }, zoom: 1.0 },
  { at: T.mit, from: [0.62, 3.1, 0.95], to: [0.45, 3.02, 0.72], look: [0, 2.87, 0], zoom: 1.75 },
  // Übrigens: the ice bowl with salt frosts over
  { at: T.fakt, from: [5.0, 2.4, 1.6], to: [4.4, 1.9, 0.9], look: [2.9, 0.7, -1.9], zoom: 1.0 },
  {
    at: T.zwanzig,
    from: [1.6, 2.0, 0.0],
    to: [1.9, 1.7, -0.5],
    look: [2.9, 0.55, -1.9],
    zoom: 1.7,
  },
  // payoff: hand reaches in — slowmo on the frozen layer — the cube flies out
  { at: T.payoff, from: [1.7, 3.6, 2.9], to: [1.25, 3.4, 2.3], look: [0, 2.9, 0], zoom: 1.1 },
  {
    at: T.zurueck,
    from: [0.55, 3.12, 0.95],
    to: [0.42, 3.04, 0.75],
    look: [0, 2.87, 0],
    zoom: 1.75,
  },
  { at: T.angelst, from: [1.9, 2.5, 2.7], to: [1.4, 3.1, 2.1], look: [0, 3.45, 0], zoom: 1.3 },
  // CTA: the swinging catch, still cutting
  { at: T.probierst, from: [2.8, 4.9, 4.4], to: [2.1, 4.5, 3.5], look: [0, 3.85, 0], zoom: 1.2 },
  { at: T.schreib, from: [0.6, 4.5, 2.9], to: [0.2, 4.3, 2.4], look: [0, 3.9, 0], zoom: 1.4 },
];

// ---------------------------------------------------------------- labels (one at a time)
export const LABELS = [
  { text: "Faden", at: T.faden + 0.15, until: T.nichts, pos: [-0.55, 2.86, 0], side: -1 },
  { text: "Salz", at: T.salz, until: T.kurz, pos: [0.15, 2.88, 0.1], side: 1 },
  { text: "Wasserschicht", at: T.schicht, until: T.warum, pos: [0.2, 2.9, 0.05], side: 1 },
  { text: "Eiskristalle", at: T.gefrieren, until: T.mit, pos: [0.15, 2.93, 0.06], side: -1 },
];

// ---------------------------------------------------------------- highlights (every 3–6 s)
export const HIGHLIGHTS = [
  { kind: "zoom", at: 0.78, amount: 0.3 },
  { kind: "shake", at: T.nichts, dur: 0.35, amp: 0.5 },
  { kind: "slowmo", at: T.jetzt + 0.2, until: T.kurz, speed: 0.4 },
  { kind: "zoom", at: T.haengt, amount: 0.3 },
  { kind: "slowmo", at: T.schmilzt, until: T.warum, speed: 0.45 },
  { kind: "flash", at: T.waerme },
  { kind: "zoom", at: T.aus, amount: 0.35 },
  { kind: "shake", at: T.aus, dur: 0.4, amp: 0.5 },
  { kind: "flash", at: T.gefrieren },
  { kind: "zoom", at: T.zwanzig, amount: 0.3 },
  { kind: "slowmo", at: T.zurueck - 0.1, until: T.angelst, speed: 0.4 },
  { kind: "shake", at: T.angelst + 0.1, dur: 0.45, amp: 0.7 },
  { kind: "flash", at: T.angelst + 0.05 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "platsch", at: 0.0, db: -9 }, // frame 0: the cube rips out of the cola
  { s: "klirr", at: T.eiswuerfel + 0.1, db: -12 },
  { s: "klack", at: T.nichts, db: -14 }, // cube bobs back
  { s: "rauschen", at: T.salz - 0.25, dur: 0.7, db: -19 },
  { s: "platsch", at: T.haengt - 0.3, db: -13 },
  { s: "rauschen", at: T.taut, dur: 0.6, db: -21 },
  { s: "zisch", at: T.schmilzt, dur: 1.4, db: -22 },
  { s: "surr", at: T.waerme, dur: 2.0, db: -22 },
  { s: "knister", at: T.eiskalte + 0.3, db: -11 },
  { s: "knister", at: T.fakt + 0.6, db: -14 },
  { s: "platsch", at: T.angelst, db: -8 },
  { s: "klirr", at: T.probierst + 0.4, db: -15 },
];
