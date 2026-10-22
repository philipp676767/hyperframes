// Fliegender Tesla beats: every time-keyed decision as plain data, so
// scene.js (picture) and scripts/build-sfx.mjs (sound) read the same numbers.
// Keep this file free of three.js / DOM: it is imported by node too.
import { W, END } from "./timing.js";

// ---------------------------------------------------------------- layout
export const MS = [-5.0, 0, 1.5]; // "kopfüber" set: mini car under a ceiling
export const RT = [5.0, 0, 1.5]; // balloon set, later the fuel pump
export const H1 = 1.0; // hover height while the nozzles are explained
export const H2 = 0.9; // hover height in the outro

// ---------------------------------------------------------------- beats
export const T = {
  luft1: W("Luft", 1),
  lass: W("Lass"),
  kohle: W("Kohlefaser-Flaschen"),
  druckluft: W("Druckluft"),
  n600: W("600"),
  drucktank: W("Drucktank"),
  aber: W("Aber"),
  oeffne: W("Öffne"),
  ventil: W("Ventil"),
  unten: W("unten"),
  luftballon: W("Luftballon"),
  losl: W("loslässt"),
  duese: W("Kaltgas-Düse"),
  verrueckt: W("verrückt"),
  boden: W("Boden"),
  luefter: W("Lüfter"),
  klebt: W("klebt"),
  kopf: W("kopfüber"),
  flamme: W("Flamme"),
  nur: W("nur"),
  schau: W("Schau"),
  gerade: W("gerade"),
  uebrigens: W("Übrigens"),
  null: W("null"),
  wuerdest: W("Würdest"),
};

// hook: the car leaves the ground at -0.6 s, flies over two parked cars and
// lands at HOOK_LAND (frame 0 is mid-air)
export const HOOK_LAND = Math.min(T.lass - 0.5, 4.2);
export const BACK = T.lass + 0.45; // the car pops back in as a fresh build

const rel = (p, d) => p.map((v, i) => v + d[i]);

// ---------------------------------------------------------------- shots
// The portrait frame is narrow and the car is long, so most shots are written
// as angle + distance around a look point: yaw 0 = the car's side (+z),
// positive yaw swings towards its nose (+x), pitch = degrees above the look
// point, d = distance. zoom 1: the distance is already final.
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

// shots with follow: true ride along with the car in the hook (scene.js)
export const shots = [
  // hook: side view riding along with the jump
  shot(0, [0, 0.2, 0], [0, 8, 9], [8, 8, 8.5], { follow: true }),
  // low: the air jets under the car
  shot(T.luft1, [0, 0.3, 0], [35, 0, 5.5], [30, 2, 5], { follow: true }),
  // build: it shrinks away and pops back
  shot(T.lass, [0, 0.6, 0], [50, 15, 7.5], [42, 15, 7]),
  // tanks in x-ray, from above
  shot(T.kohle, [0, 0.45, 0], [30, 32, 5.5], [22, 32, 5]),
  shot(T.drucktank, [0.6, 0.45, 0], [55, 25, 3.6], [48, 25, 3.3]),
  // "wie hebt Luft ein Auto?"
  shot(T.aber, [0, 0.6, 0], [70, 6, 7], [62, 6, 6.5]),
  // valve opens, the car lifts off
  shot(T.oeffne, [0, 0.5, 0], [25, 15, 6], [35, 18, 7], { lookTo: [0, 1.3, 0] }),
  // balloon analogy
  shot(T.luftballon, rel(RT, [0, 1.1, 0]), [15, 10, 4], [5, 10, 4.5], {
    lookTo: rel(RT, [0, 2.0, 0]),
  }),
  // hovering on its nozzles, from behind
  shot(T.duese, [-1.1, H1 + 0.25, 0], [-60, 8, 4.2], [-50, 8, 3.8]),
  // it lands
  shot(T.verrueckt, [0, 0.6, 0], [40, 18, 7.5], [30, 18, 7]),
  // fans under the floor, seen through the glass
  shot(T.boden, [0, 0.2, 0], [20, 48, 4.5], [10, 48, 4.2]),
  // pressed onto the road
  shot(T.klebt, [0, 0.8, 0], [35, 20, 7.5], [28, 20, 7]),
  // upside down under a ceiling
  shot(T.kopf - 0.1, rel(MS, [0, 1.0, 0]), [20, 4, 6.5], [12, 8, 6]),
  // no flame, no fuel
  shot(T.flamme, rel(RT, [-0.1, 0.6, 0]), [12, 12, 4.2], [6, 12, 3.9]),
  // "nur Luft": it hovers again
  shot(T.nur, [0, H2 + 0.3, 0], [30, 6, 8], [22, 6, 7.5]),
  // outro: x-ray off, drone pull-back
  shot(T.schau, [0, H2 + 0.3, 0], [15, 12, 8], [8, 12, 7.5]),
  {
    at: T.gerade,
    from: [2.8, 2.6, 5.2],
    to: [5.5, 4.6, 9.5],
    look: [0, H2 + 0.2, 0],
    lookTo: [0, 0.8, 0],
  },
  // bonus fact: rear thrusters fire, speed lines
  shot(T.uebrigens, [-0.8, 0.5, 0], [55, 8, 7.5], [48, 8, 7]),
  // CTA: wide drone shot of the plaza
  {
    at: T.wuerdest,
    from: [4.5, 3.8, 8.5],
    to: [9.5, 8.0, 17],
    look: [0, 1.0, 0],
    lookTo: [0, 0.6, 0],
  },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Drucktank", at: T.drucktank, until: T.aber, pos: [0.85, 0.6, 0.36], side: 1 },
  {
    text: "Kaltgas-Düse",
    at: T.duese,
    until: T.verrueckt,
    pos: [-1.74, H1 + 0.4, 0.35],
    side: -1,
  },
  { text: "Lüfter", at: T.luefter, until: T.klebt, pos: [0.1, 0.17, 0.42], side: 1 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "rauschen", at: 0.02, dur: HOOK_LAND - 0.1, db: -20 }, // jets in the hook
  { s: "klack", at: HOOK_LAND, db: -16 }, // landing
  { s: "pop", at: BACK }, // car pops back in
  { s: "pop", at: T.kohle + 0.1 }, // tanks
  { s: "pop", at: T.kohle + 0.46 },
  { s: "zisch", at: T.druckluft, dur: 0.9, db: -21 }, // filling up
  { s: "klack", at: T.ventil, db: -15 }, // valve
  { s: "rauschen", at: T.ventil + 0.15, dur: T.luftballon - T.ventil - 0.2, db: -18 },
  { s: "pop", at: T.luftballon + 0.25 }, // balloon
  { s: "zisch", at: T.losl, dur: 1.3, db: -17 },
  { s: "rauschen", at: T.duese + 0.1, dur: T.verrueckt - T.duese, db: -21 },
  { s: "surr", at: T.boden + 0.1, dur: T.kopf - T.boden - 0.3, db: -21 }, // fans
  { s: "pop", at: T.kopf + 0.22 }, // ceiling set
  { s: "pop", at: T.flamme + 0.05 }, // fuel pump
  { s: "rauschen", at: T.nur + 0.1, dur: T.gerade - T.nur, db: -21 },
  { s: "zisch", at: T.null, dur: 1.4, db: -17 }, // rear thrusters
  { s: "rauschen", at: T.wuerdest + 0.2, dur: Math.max(0.5, END - T.wuerdest - 2.2), db: -25 },
];
