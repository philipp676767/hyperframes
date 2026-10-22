// Wassersprudler beats: every time-keyed decision as plain data, so scene.js
// (picture) and scripts/build-sfx.mjs (sound) read the same numbers.
// Keep this file free of three.js / DOM: it is imported by node too.
import { W, END } from "./timing.js";

// ---------------------------------------------------------------- layout
export const TIRES = [5.0, 0, 2.0]; // giant cylinder next to a tower of 30 car tyres
export const GLASSES = [-5.0, 0, 2.0]; // ice-cold vs. warm glass (bonus fact)
export const BOT = [0, 0, 0.22]; // bottle axis (x, -, z)
export const GAUGE = [0.68, 1.78, -0.32]; // pressure gauge on the right of the tower
export const VALVE = [-0.56, 2.22, 0.05]; // overpressure valve on the left of the head
export const NOZZLE = [0, 0.32, 0.22]; // nozzle tip at the bottom of the bottle
export const WATER_Y = 1.42; // water line in the bottle

// ---------------------------------------------------------------- beats
export const T = {
  saeure1: W("Säure", 1),
  sekunden: W("Sekunden"),
  warum: W("warum"),
  brummt: W("brummt"),
  du: W("brauchst"),
  stahl: W("Stahlflasche"),
  sechzig: W("60"),
  bar: W("Bar"),
  dreissig: W("Dreißigmal"),
  zylinder: W("Zylinder"),
  knopf: W("Knopf"),
  druecken: W("drücken"),
  zack: W("zack"),
  rohr: W("Rohr"),
  duese: W("Düse"),
  blubbern: W("Blubbern"),
  reicht: W("reicht"),
  jetzt: W("Jetzt"),
  trick: W("Trick"),
  dicht: W("dicht"),
  druck: W("Druck"),
  quetscht: W("quetscht"),
  brummen: W("Brummen"),
  undB: W("Und", 1),
  ventil: W("Überdruckventil"),
  voll: W("voll"),
  aufdrehen: W("Aufdrehen"),
  perlt: W("perlt"),
  doch2: W("Doch", 2),
  prozent: W("Prozent"),
  saeure2: W("Säure", 2),
  schau: W("Schau"),
  gerade: W("gerade"),
  gebaut: W("gebaut"),
  uebrigens: W("Übrigens"),
  eiskalt: W("Eiskaltes"),
  doppelt: W("doppelt"),
  warmes: W("warmes"),
  wie: W("Wie", 2),
};

const rel = (p, d) => p.map((v, i) => v + d[i]);

// ---------------------------------------------------------------- shots
// Written as angle + distance around a look point: yaw 0 = front (+z),
// positive yaw swings to the right (+x), pitch = degrees above, d = distance.
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

const MACH = [0, 1.25, 0]; // machine centre
const BOTC = [BOT[0], 0.95, BOT[2]]; // bottle centre

export const shots = [
  // hook: macro on the fizzing bottle, the "SÄURE" sign beside it
  shot(0, rel(BOTC, [-0.35, 0.4, 0]), [14, 8, 4.0], [8, 8, 3.6]),
  // the whole machine running
  shot(T.sekunden, MACH, [-28, 10, 5.6], [-18, 12, 5.0]),
  // the valve buzzing on "brummt"
  shot(T.warum, rel(VALVE, [0.25, -0.25, 0]), [-42, 14, 3.2], [-32, 14, 2.8]),
  // build: it shrinks away, the steel cylinder pops in on the empty stage
  shot(T.du, [0, 1.0, -0.3], [30, 14, 5.6], [22, 13, 5.0]),
  // crash zoom on the gauge: needle to 60 bar
  shot(T.sechzig, rel(GAUGE, [0, 0.22, 0]), [78, 6, 1.5], [88, 4, 1.2]),
  // 30 car tyres stack up next to a cylinder
  shot(T.dreissig, rel(TIRES, [0, 1.15, 0]), [-14, 12, 5.4], [-4, 12, 4.7], { whip: 1 }),
  // the housing pops around the cylinder (x-ray)
  shot(T.zylinder - 0.5, MACH, [38, 12, 5.4], [28, 12, 5.0]),
  // the button on top
  shot(T.knopf, [0, 2.35, 0.15], [20, 42, 2.6], [10, 36, 2.2]),
  // ZACK: gas through the pipe, bubbles burst from the nozzle
  shot(T.zack, rel(BOTC, [0, -0.1, 0]), [24, 6, 3.0], [14, 6, 2.6]),
  // the bubbles just rise and pop at the surface: ✕
  shot(T.blubbern, [0, WATER_Y + 0.1, BOT[2]], [-22, 26, 2.0], [-12, 22, 1.7], { whip: -1 }),
  // the trick: the seal at the neck clicks shut
  shot(T.jetzt, [0, 1.95, BOT[2]], [-32, 8, 2.1], [-20, 8, 1.8]),
  // pressure squeezes the gas into the water (slow motion)
  shot(T.druck, rel(BOTC, [0, 0.25, 0]), [10, 8, 3.0], [0, 8, 2.6]),
  // the overpressure valve: buzz + puff, "voll!"
  shot(T.undB, rel(VALVE, [0.2, -0.3, 0]), [-50, 12, 2.6], [-38, 14, 2.2], { whip: -1 }),
  // money shot: bottle out, pearls fountain up
  shot(T.aufdrehen, [0, 1.6, 0.9], [-66, 8, 4.4], [-56, 8, 3.8]),
  // macro on the pearls
  shot(T.doch2, [0, 2.15, 1.22], [-72, 8, 2.6], [-62, 8, 2.2]),
  // outro: front, then drone pull-back
  shot(T.schau, rel(MACH, [0, -0.05, 0]), [0, 10, 6.0], [8, 10, 5.6]),
  {
    at: T.gerade,
    from: [2.4, 2.4, 5.8],
    to: [6.0, 4.6, 11.0],
    look: [0, 1.3, 0],
    lookTo: [0, 0.9, 0],
    zoom: 1,
  },
  // bonus fact: ice-cold glass full of bubbles, warm glass almost flat
  shot(T.uebrigens, rel(GLASSES, [0, 1.15, 0]), [-30, 18, 4.0], [-20, 18, 3.6], { whip: -1 }),
  shot(T.doppelt, rel(GLASSES, [-0.1, 1.0, 0]), [-8, 10, 3.4], [0, 10, 3.0]),
  // CTA: wide drone shot of the island, the machine buzzing again
  {
    at: T.wie,
    from: [3.2, 2.8, 7.0],
    to: [9.0, 7.2, 15.5],
    look: [0, 1.3, 0],
    lookTo: [0, 0.8, 0],
    zoom: 1,
  },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Zylinder", at: T.zylinder, until: T.knopf, pos: [0.3, 1.2, -0.3], side: 1 },
  { text: "Düse", at: T.duese, until: T.blubbern, pos: rel(NOZZLE, [0.03, 0.05, 0]), side: 1 },
  {
    text: "Überdruckventil",
    at: T.ventil,
    until: T.aufdrehen,
    pos: rel(VALVE, [-0.08, 0, 0]),
    side: -1,
  },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "shake", at: 0.05, dur: 0.6, amp: 0.4 }, // the machine buzzes from frame 1
  { kind: "shake", at: T.brummt, dur: 0.6, amp: 0.8 },
  { kind: "shake", at: T.stahl + 0.25, dur: 0.4, amp: 0.7 }, // the cylinder lands
  { kind: "zoom", at: T.sechzig + 0.1, amount: 0.4 }, // crash zoom on the gauge
  { kind: "shake", at: T.dreissig + 0.4, dur: 0.6, amp: 0.6 }, // tyres stack up
  { kind: "flash", at: T.zack },
  { kind: "shake", at: T.zack, dur: 0.7, amp: 1.0 },
  { kind: "zoom", at: T.trick, amount: 0.3 },
  { kind: "slowmo", at: T.quetscht, until: T.undB, speed: 0.35 }, // bubbles dissolve
  { kind: "shake", at: T.voll, dur: 0.7, amp: 1.0 },
  { kind: "flash", at: T.aufdrehen + 0.15 },
  { kind: "zoom", at: T.perlt, amount: 0.3 },
];

// ---------------------------------------------------------------- sound
const tyrePops = [0, 1, 2, 3, 4, 5].map((i) => ({
  s: "pop",
  at: T.dreissig + 0.1 + i * 0.13,
  db: -18,
}));
export const SFX = [
  { s: "brumm", at: 0.02, dur: T.du - 0.1, db: -23 }, // running in the hook
  { s: "rauschen", at: 0.02, dur: T.warum - 0.1, db: -27 }, // fizz
  { s: "brumm", at: T.brummt - 0.05, dur: 0.6, db: -16 },
  { s: "pop", at: T.stahl + 0.1 }, // cylinder
  { s: "klack", at: T.stahl + 0.3, db: -16 },
  { s: "surr", at: T.sechzig, dur: 0.8, db: -19 }, // needle swings up
  ...tyrePops,
  { s: "pop", at: T.zylinder - 0.35 }, // housing
  { s: "pop", at: T.zylinder - 0.2, db: -18 }, // bottle
  { s: "click", at: T.druecken + 0.1 },
  { s: "zisch", at: T.zack, dur: T.blubbern - T.zack + 0.4, db: -17 }, // gas jet
  { s: "rauschen", at: T.zack + 0.2, dur: T.reicht - T.zack, db: -22 }, // bubbling
  { s: "klack", at: T.dicht, db: -14 }, // seal locks
  { s: "zisch", at: T.quetscht, dur: T.undB - T.quetscht, db: -22 },
  { s: "brumm", at: T.ventil - 0.2, dur: T.aufdrehen - T.ventil, db: -16 }, // valve buzz
  { s: "zisch", at: T.voll, dur: 0.6, db: -17 },
  { s: "klack", at: T.aufdrehen + 0.1, db: -16 },
  { s: "rauschen", at: T.aufdrehen + 0.15, dur: T.schau - T.aufdrehen, db: -19 }, // pearls
  { s: "pop", at: T.uebrigens + 0.05 }, // glasses
  { s: "rauschen", at: T.eiskalt, dur: T.wie - T.eiskalt - 0.1, db: -24 },
  { s: "brumm", at: T.wie + 0.2, dur: Math.max(0.5, END - T.wie - 1.2), db: -26 },
];
