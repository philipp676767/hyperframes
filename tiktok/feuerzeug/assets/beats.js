// Feuerzeug beats: every time-keyed decision as plain data, so scene.js
// (picture) and scripts/build-sfx.mjs (sound) read the same numbers.
// Keep this file free of three.js / DOM: it is imported by node too.
import { W, END } from "./timing.js";

// ---------------------------------------------------------------- layout
// The lighter stands at the origin, front = +z: a red see-through gas tank
// (y 0.1–1.85), the piezo unit in a black housing on the right (x ≈ 0.3),
// the button on top of it, the nozzle on the left, a copper wire from the
// crystal up to the spark tip next to the nozzle. Mousetrap (P) far left,
// quartz watch (K) far right, the flint-wheel lighter (R) left of the stage.
export const PZX = 0.3; // piezo column
export const BTN = [PZX, 2.2, 0]; // top of the button (thumb tip)
export const NOZ = [-0.2, 2.27, 0]; // top of the nozzle
export const TIP = [0.12, 2.56, 0.08]; // spark electrode tip
export const CRY = [PZX, 1.09, 0.0]; // crystal centre
export const HAM = [PZX, 1.38, 0.0]; // hammer at rest
export const P = [-5, 0, 2];
export const K = [5, 0, 2];
export const R = [-1.55, 0, 0.55];

// ---------------------------------------------------------------- beats
export const T = {
  bei: W("bei", 1),
  klick1: W("Klick", 1),
  tausende1: W("Tausende", 1),
  gleich: W("Gleich"),
  batterie: W("Batterie"),
  kraftwerk: W("Kraftwerk"),
  brauchst: W("brauchst"),
  gas1: W("Gas", 1),
  gepresst: W("gepresst"),
  fluessig: W("flüssig"),
  knopf1: W("Knopf", 1),
  ventil: W("Ventil"),
  zisch: W("zisch"),
  aber: W("Aber"),
  nichts: W("nichts"),
  unterm: W("Unterm"),
  hammer1: W("Hammer", 1),
  gespannt: W("gespannt"),
  mausefalle: W("Mausefalle"),
  darunter: W("Darunter"),
  kristall1: W("Kristall", 1),
  quetschst: W("Quetschst"),
  elektrisch: W("elektrisch"),
  piezo: W("Piezo"),
  klick2: W("Klick", 2),
  fuer: W("Für"),
  tausende2: W("Tausende", 2),
  funke: W("Funke"),
  springt: W("springt"),
  wusch: W("wusch"),
  flamme: W("Flamme"),
  strom: W("Strom"),
  daumen: W("Daumen"),
  druck: W("Druck"),
  blitz: W("Blitz"),
  uebrigens: W("Übrigens"),
  quarzuhren: W("Quarzuhren"),
  kristall2: W("Kristall", 2),
  zahl: W("32000"),
  reibrad: W("Reibrad"),
  klick3: W("Klick", 3),
  kommentare: W("Kommentare"),
};

// hook: the lighter has just been clicked on frame 0 (spark + flame)
export const H0 = -0.15;
export const REBUILD = T.brauchst + 0.25; // hook lighter out, the empty one pops in
// the strike happens inside the slow motion (klick2 → fuer at SLOW): scene
// time only reaches klick2 + SLOW · (fuer - klick2) before the cut
export const SLOW = 0.3;
export const STRIKE = T.klick2 + 0.1; // scene time
export const STRIKE_REAL = T.klick2 + 0.1 / SLOW;
export const SLOW_END = T.klick2 + (T.fuer - T.klick2) * SLOW;
export const SNAP = T.darunter - 0.22; // the mousetrap snaps shut

// ---------------------------------------------------------------- shots
// angle + distance around a look point: yaw 0 = front (+z), positive yaw
// swings towards +x, pitch = degrees above the look point, d = distance.
const D2R = Math.PI / 180;
const cam = (look, [yaw, pitch, d]) => [
  look[0] + d * Math.cos(pitch * D2R) * Math.sin(yaw * D2R),
  look[1] + d * Math.sin(pitch * D2R),
  look[2] + d * Math.cos(pitch * D2R) * Math.cos(yaw * D2R),
];
const shot = (at, look, a, b, extra = {}) => ({
  at,
  from: cam(look, a),
  to: cam(extra.lookTo ?? look, b),
  look,
  zoom: 1,
  ...extra,
});
const add = (p, d) => p.map((v, i) => v + d[i]);
const BODY = [0, 1.35, 0];
const TOP = [-0.1, 2.36, 0.02];
const THUMB = [0.42, 2.45, 0];
const PIEZO = [PZX, 1.3, 0.05];

export const shots = [
  // hook: fast push onto the spark, flame catching
  shot(0, [-0.04, 2.22, 0.04], [-22, 12, 2.4], [-9, 8, 1.55], { tilt: 0.3 }),
  // hero: the burning lighter, thumb on the button
  shot(T.bei, BODY, [-32, 12, 5.6], [-20, 10, 4.9]),
  // low angle, the flame big against the evening sky
  shot(T.gleich, [0, 1.7, 0], [34, -4, 4.4], [24, 2, 3.9], { whip: 1 }),
  // "ohne Batterie": battery ✕ next to it
  shot(T.batterie, [0.65, 1.1, 0.4], [10, 10, 5.0], [4, 9, 4.6]),
  // "Das Kraftwerk trägst du immer bei dir": the thumb
  shot(T.kraftwerk, THUMB, [42, 18, 2.4], [30, 14, 1.9], { whip: -1, tilt: 0.25 }),
  // build starts: the empty lighter pops in
  shot(T.brauchst, [0, 1.7, 0], [0, 12, 5.8], [8, 12, 5.2]),
  // gas squeezed into liquid
  shot(T.gepresst, [0, 1.95, 0], [-22, 10, 5.6], [-12, 8, 5.1]),
  // "Knopf drücken, Ventil auf"
  shot(T.knopf1, [0.05, 2.15, 0], [-26, 24, 3.2], [-16, 20, 2.7]),
  // zisch: gas jet in slow motion
  shot(T.zisch, [-0.2, 2.75, 0], [16, 4, 3.2], [8, 4, 2.8], { tilt: 0.2 }),
  // "Aber nichts brennt": ✕
  shot(T.aber, [0, 1.9, 0], [0, 8, 5.4], [5, 8, 5.0]),
  // whispered: quiet push into the piezo housing
  shot(T.unterm, PIEZO, [22, 8, 3.4], [12, 6, 2.6], { tilt: 0.2 }),
  // the hammer
  shot(T.hammer1, add(HAM, [0, 0.02, 0.05]), [32, 12, 1.8], [24, 10, 1.55], {
    whip: 1,
    tilt: 0.15,
  }),
  // mousetrap
  shot(T.mausefalle, add(P, [0, 0.3, 0]), [14, 28, 3.6], [6, 24, 3.2], { whip: -1 }),
  // "Darunter: ein Kristall"
  shot(T.darunter, add(CRY, [0, 0, 0.05]), [-26, 8, 1.8], [-16, 6, 1.55], { tilt: 0.15 }),
  // "Quetschst du ihn": orbit around the piezo unit
  {
    at: T.quetschst,
    orbit: { c: [PZX, 1.2, 0], r: 2.4, y: 1.75, a0: 0.95, a1: 0.2 },
    zoom: 1,
    tilt: 0.2,
  },
  // "Das ist Piezo": the whole lighter, x-ray
  shot(T.piezo, [0.1, 1.5, 0], [0, 8, 4.3], [7, 8, 3.9]),
  // KLICK: macro, hammer slams the crystal (slow motion)
  shot(T.klick2, add(PIEZO, [0, -0.05, 0]), [44, 6, 1.9], [36, 6, 1.7], { tilt: 0.15 }),
  // "Für einen Wimpernschlag: Tausende Volt": the spark gap
  shot(T.fuer, TOP, [-8, 6, 1.9], [-2, 4, 1.65], { whip: 1, tilt: 0.25 }),
  // "Der Funke springt ins Gas"
  shot(T.funke, add(TOP, [0, 0.15, 0]), [24, 12, 2.6], [15, 10, 2.3], { tilt: 0.25 }),
  // WUSCH: wide hero, the flame catches
  shot(T.wusch, [0, 1.9, 0], [-12, 6, 5.4], [-5, 6, 4.8]),
  // payoff: front, x-ray off
  shot(T.strom, [0.1, 1.9, 0], [16, 10, 4.8], [9, 8, 4.3]),
  // "aus deinem Daumen"
  shot(T.daumen, THUMB, [36, 18, 2.6], [24, 14, 2.1], { whip: 1, tilt: 0.25 }),
  // "Dein Druck wird zum Blitz"
  shot(T.druck, TOP, [-16, 6, 2.2], [-8, 6, 1.9], { tilt: 0.25 }),
  // bonus fact: quartz watch
  shot(T.uebrigens, add(K, [0.55, 0.95, 0.15]), [-8, 8, 5.0], [0, 6, 4.5], { whip: 1 }),
  // "32.000 Mal": the vibrating quartz fork
  shot(T.zahl, add(K, [1.15, 0.65, 0.3]), [-16, 10, 2.4], [-8, 8, 2.1], { tilt: 0.2 }),
  // CTA: flint wheel or click
  shot(T.reibrad, [-0.75, 1.3, 0.3], [10, 10, 5.8], [4, 10, 5.3], { whip: -1 }),
  {
    at: T.kommentare,
    from: [2.4, 2.8, 6.6],
    to: [6.5, 6.5, 13.5],
    look: [0, 1.5, 0],
    lookTo: [0.4, 1.2, 0],
    zoom: 1,
    tilt: 1.3,
  },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Ventil", at: T.ventil, until: T.zisch + 0.3, pos: [-0.2, 2.0, 0.06], side: -1 },
  { text: "Hammer", at: T.hammer1, until: T.mausefalle, pos: [PZX + 0.1, 1.4, 0.1], side: 1 },
  {
    text: "Kristall",
    at: T.kristall1,
    until: T.quetschst + 0.6,
    pos: [PZX + 0.08, 1.09, 0.08],
    side: 1,
  },
  { text: "Piezo", at: T.piezo, until: T.klick2, pos: [PZX + 0.08, 1.12, 0.08], side: 1 },
  { text: "Funke", at: T.funke, until: T.wusch, pos: [-0.1, 2.34, 0.03], side: 1 },
  { text: "Reibrad", at: T.reibrad, until: T.kommentare, pos: [R[0], 1.62, R[2]], side: -1 },
  { text: "Klick", at: T.klick3, until: T.kommentare, pos: [PZX, 2.15, 0.15], side: 1 },
];

// ---------------------------------------------------------------- highlights
// one big moment every 5–7 s; a slowmo ends on a shot cut
export const HIGHLIGHTS = [
  { kind: "zoom", at: 0.05, amount: 0.3 }, // hook: spark + flame
  { kind: "flash", at: T.klick1 + 0.05 },
  { kind: "shake", at: T.klick1 + 0.05, dur: 0.35, amp: 0.6 },
  { kind: "shake", at: T.batterie + 0.3, dur: 0.3, amp: 0.4 }, // ✕
  { kind: "shake", at: REBUILD + 0.15, dur: 0.35, amp: 0.5 }, // lighter lands
  { kind: "zoom", at: T.gepresst, amount: 0.25 },
  { kind: "slowmo", at: T.zisch, until: T.aber, speed: 0.3 },
  { kind: "shake", at: T.zisch + 0.05, dur: 0.5, amp: 0.6 },
  { kind: "zoom", at: T.hammer1, amount: 0.3 },
  { kind: "shake", at: SNAP, dur: 0.3, amp: 0.7 }, // mousetrap snaps
  { kind: "zoom", at: T.kristall1, amount: 0.3 },
  { kind: "flash", at: STRIKE_REAL },
  { kind: "shake", at: STRIKE_REAL, dur: 0.6, amp: 1.0 },
  { kind: "slowmo", at: T.klick2, until: T.fuer, speed: SLOW },
  { kind: "flash", at: T.wusch + 0.05 },
  { kind: "shake", at: T.wusch + 0.05, dur: 0.6, amp: 0.9 },
  { kind: "zoom", at: T.wusch + 0.05, amount: 0.35 },
  { kind: "zoom", at: T.daumen, amount: 0.3 },
  { kind: "flash", at: T.blitz + 0.05 },
  { kind: "zoom", at: T.kristall2, amount: 0.25 },
  { kind: "shake", at: T.zahl, dur: 0.4, amp: 0.4 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "piezo", at: 0.03, db: -9 }, // hook: the click on frame 0
  { s: "zuend", at: 0.18, db: -13 },
  { s: "piezo", at: T.klick1 + 0.05, db: -10 },
  { s: "pop", at: T.batterie + 0.02 },
  { s: "pop", at: REBUILD + 0.05 }, // the lighter pops in
  { s: "pop", at: T.gas1 + 0.05 }, // gas cloud
  { s: "zisch", at: T.zisch - 0.15, dur: T.aber + 0.4 - T.zisch, db: -15 },
  { s: "klack", at: SNAP, db: -6 },
  { s: "surr", at: T.quetschst + 0.3, dur: T.piezo - T.quetschst - 0.2, db: -22 },
  { s: "piezo", at: STRIKE_REAL, db: -6 },
  { s: "piezo", at: T.fuer + 0.15, db: -12 },
  { s: "piezo", at: T.tausende2 + 0.1, db: -12 },
  { s: "zisch", at: T.funke, dur: T.wusch - T.funke + 0.1, db: -21 },
  { s: "zuend", at: T.wusch + 0.03, db: -7 },
  { s: "rauschen", at: T.flamme, dur: T.uebrigens - T.flamme - 0.2, db: -28 }, // flame
  { s: "piezo", at: T.blitz + 0.03, db: -11 },
  { s: "pop", at: T.uebrigens + 0.1 },
  { s: "click", at: T.uebrigens + 1.0, db: -18 },
  { s: "click", at: T.uebrigens + 2.0, db: -18 },
  { s: "click", at: T.uebrigens + 3.0, db: -18 },
  { s: "pop", at: T.reibrad + 0.05 },
  { s: "ratsch", at: T.reibrad + 0.3, db: -11 },
  { s: "piezo", at: T.klick3 + 0.08, db: -10 },
  { s: "zuend", at: T.klick3 + 0.2, db: -14 },
  { s: "rauschen", at: T.kommentare + 0.2, dur: Math.max(0.5, END - T.kommentare - 1.2), db: -28 },
];
