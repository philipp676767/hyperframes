// Rauchmelder (v2) beats: every time-keyed decision as plain data, so
// scene.js (picture) and scripts/build-sfx.mjs (sound) read the same numbers.
// Keep this file free of three.js / DOM: it is imported by node too.
import { W, END } from "./timing.js";

// ---------------------------------------------------------------- layout
// A toy room corner at the origin: back wall, left wall, ceiling. The
// detector hangs under the ceiling (D); the ionisation chamber is built big
// in the middle of the room (C), a toaster stands on the floor left of it,
// the "Atomreaktor" garden shed waits on the plaza at S.
export const D = [0, 3.33, -0.1];
export const C = [0, 1.45, 0.2];
export const GAP = 0.5; // half distance between the plates
export const PL0 = C[1] - GAP; // lower plate (the crumb lies on it)
export const PL1 = C[1] + GAP; // upper plate
export const CHIP = [0.95, 0.42, 0.75];
export const TO = [-1.35, 0, 0.85]; // toaster
export const S = [5.2, 0, 1.6]; // shed

// ---------------------------------------------------------------- beats
export const T = {
  radioaktiv: W("radioaktiv"),
  rettet: W("rettet"),
  brauchst: W("brauchst"),
  platten: W("Metallplatten"),
  luft1: W("Luft", 1),
  kruemel: W("Krümel"),
  americium: W("Americium"),
  millionstel: W("Millionstel"),
  keine: W("Keine"),
  papier: W("Papier"),
  stoppt: W("stoppt"),
  die2: W("Die"),
  elektronen: W("Elektronen"),
  zack: W("zack"),
  strom1: W("Strom", 1),
  kammer: W("Ionisationskammer"),
  und2: W("Und", 2),
  trick: W("Trick"),
  rauch: W("Rauch", 1),
  kleben: W("kleben"),
  bricht: W("bricht"),
  chip: W("Chip"),
  alarm: W("Alarm"),
  fehlende: W("fehlende"),
  schau: W("Schau", 1),
  gerade: W("gerade"),
  uebrigens: W("Übrigens"),
  jaehriger: W("17-Jähriger"),
  reaktor: W("Atomreaktor"),
  schau2: W("Schau", 2),
  schreib: W("Schreib's"),
};

// the detector leaves on "brauchst" and comes back when the chamber flies
// up into it on "Alarm"
export const DET_OUT = T.brauchst;
export const DET_BACK = T.alarm - 0.05;
// current through the chamber: on after "Elektronen", gone on "bricht"
export const FLOW_ON = [T.elektronen + 0.4, T.zack + 0.4];
export const FLOW_OFF = [T.bricht - 0.1, T.bricht + 0.5];

// ---------------------------------------------------------------- shots
// angle + distance around a look point: yaw 0 = front (+z), positive yaw
// swings towards +x, pitch = degrees above the look point (negative: from
// below), d = distance. zoom 1: the distance is final.
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

export const shots = [
  // hook: right under the glowing detector, Geiger counter ticking
  shot(0, add(D, [0.15, -0.35, 0]), [24, -24, 3.6], [14, -28, 3.1]),
  // "rettet dich": the whole room
  shot(T.rettet, [0, 2.35, 0], [32, 2, 7.0], [22, 2, 6.5], { whip: 1 }),
  // build: plates, air
  shot(T.brauchst, C, [28, 24, 4.4], [16, 24, 4.0]),
  // macro: the crumb
  shot(T.kruemel, [0, PL0 + 0.12, C[2]], [-18, 30, 2.4], [-6, 30, 2.1]),
  // paper stops the rays (slow motion until T.die2)
  shot(T.papier, [0.18, PL0 + 0.24, C[2]], [-48, 12, 1.9], [-38, 12, 1.7]),
  // rays knock electrons out of the air
  shot(T.die2, C, [34, 16, 3.5], [22, 16, 3.2]),
  // current flows round the wire through the chip
  shot(T.strom1, [0.35, 1.05, 0.4], [24, 20, 4.7], [12, 20, 4.4]),
  // the complete chamber
  { at: T.kammer, orbit: { c: C, r: 2.9, y: C[1] + 0.9, a0: 0.85, a1: 0.1 } },
  // whispered trick: slow push-in, quiet
  shot(T.und2, C, [-6, 8, 3.8], [-2, 8, 2.9]),
  // smoke from the burnt toast rolls up into the chamber
  shot(T.rauch, [-0.55, 1.15, 0.5], [-36, 14, 5.0], [-26, 14, 4.6], { whip: -1 }),
  // macro: the charges stick to the smoke
  shot(T.kleben, C, [16, 22, 2.0], [6, 22, 1.8]),
  // the current breaks down
  shot(T.bricht, [0.45, 1.0, 0.45], [32, 22, 3.6], [24, 22, 3.3]),
  // the chip
  shot(T.chip, CHIP, [18, 30, 1.5], [8, 30, 1.3]),
  // ALARM: the chamber flies into the detector, the room flashes red
  shot(T.alarm, [0, 2.95, 0], [26, -8, 5.6], [16, -8, 5.1]),
  // close under the screaming detector
  shot(T.fehlende, add(D, [0, -0.2, 0]), [-12, -42, 2.3], [-4, -42, 2.1]),
  // outro: quiet again, drone pull-back over the plaza
  shot(T.schau, [0, 2.7, 0], [14, -4, 4.4], [6, -4, 4.0]),
  {
    at: T.gerade,
    from: [2.6, 2.6, 6.5],
    to: [6.5, 6.5, 13.5],
    look: [0, 2.0, 0],
    lookTo: [0.6, 1.4, 0],
    zoom: 1,
    tilt: 1.3,
  },
  // bonus fact: the glowing garden shed
  shot(T.uebrigens, add(S, [0, 0.85, 0]), [-14, 12, 4.4], [-4, 12, 3.9], { whip: 1 }),
  // CTA: "Schau mal hoch" — look up at the detector from the floor
  shot(T.schau2, add(D, [0, -0.1, 0]), [0, -62, 2.9], [28, -58, 2.6], { whip: -1 }),
  // wide drone over the plaza
  {
    at: T.schreib,
    from: [5.5, 5.0, 10.5],
    to: [8.5, 7.5, 15.5],
    look: [1.5, 1.6, 0],
    zoom: 1,
    tilt: 1.3,
  },
];

// ---------------------------------------------------------------- labels
const RIM = 0.82;
export const LABELS = [
  {
    text: "Metallplatten",
    at: T.platten + 0.5,
    until: T.kruemel,
    pos: [0, PL0, C[2] + RIM],
    side: -1,
  },
  { text: "Americium", at: T.americium, until: T.keine, pos: [0, PL0 + 0.1, C[2]], side: 1 },
  {
    text: "Papier",
    at: T.papier + 0.2,
    until: T.die2,
    pos: [0.36, PL0 + 0.55, C[2]],
    side: 1,
  },
  {
    text: "Elektron",
    at: T.elektronen + 0.25,
    until: T.zack,
    pos: [-0.35, C[1] + 0.1, C[2] + 0.3],
    side: -1,
  },
  {
    text: "Ionisationskammer",
    at: T.kammer + 0.1,
    until: T.und2,
    pos: [0, PL1 + 0.05, C[2]],
    side: 1,
  },
  { text: "Chip", at: T.chip + 0.1, until: T.alarm, pos: CHIP, side: 1 },
];

// ---------------------------------------------------------------- highlights
// one big moment every 5–7 s; slowmo ends on a shot cut
export const HIGHLIGHTS = [
  { kind: "zoom", at: 0.05, amount: 0.3 }, // hook: crash zoom onto the detector
  { kind: "flash", at: T.radioaktiv + 0.1 },
  { kind: "shake", at: T.platten + 0.15, dur: 0.4, amp: 0.7 }, // plates land
  { kind: "zoom", at: T.americium, amount: 0.3 },
  { kind: "slowmo", at: T.papier + 0.15, until: T.die2, speed: 0.3 },
  { kind: "flash", at: T.stoppt },
  { kind: "flash", at: T.zack },
  { kind: "shake", at: T.zack, dur: 0.5 },
  { kind: "shake", at: T.bricht + 0.05, dur: 0.35, amp: 0.6 },
  { kind: "flash", at: T.alarm },
  { kind: "shake", at: T.alarm, dur: 0.8, amp: 1.2 },
  { kind: "zoom", at: T.reaktor, amount: 0.35 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "geiger", at: 0.0, dur: T.brauchst - 0.1, db: -19 }, // hook crackle
  { s: "pop", at: T.platten + 0.1 }, // lower plate
  { s: "pop", at: T.platten + 0.25 }, // upper plate
  { s: "rauschen", at: T.luft1, dur: 1.0, db: -24 }, // air
  { s: "pop", at: T.americium + 0.12 }, // crumb
  { s: "geiger", at: T.americium + 0.2, dur: T.keine - T.americium - 0.3, db: -24 },
  { s: "surr", at: FLOW_ON[0], dur: T.trick - FLOW_ON[0] - 0.4, db: -24 }, // current
  { s: "pop", at: T.rauch - 0.2 }, // toaster
  { s: "zisch", at: T.rauch, dur: 2.2, db: -22 }, // smoke
  { s: "pop", at: T.chip + 0.05 },
  { s: "piep", at: T.alarm, dur: T.schau - T.alarm - 0.1, db: -19 },
  { s: "wow", at: T.reaktor + 0.1, db: -18 }, // shed glows
  { s: "rauschen", at: T.schreib + 0.2, dur: Math.max(0.5, END - T.schreib - 2.0), db: -26 },
];
