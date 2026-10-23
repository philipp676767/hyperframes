// Geldautomat beats: every time-keyed decision as plain data, so scene.js
// (picture) and scripts/build-sfx.mjs (sound) read the same numbers.
// Keep this file free of three.js / DOM: it is imported by node too.
import { W, END } from "./timing.js";

// ---------------------------------------------------------------- layout
// The ATM stands at the origin, front = +z. A note runs through it at
// height PY from the slot (front) to the back; the checking stations sit
// along that path. The test bench (P) with two big notes stands left of the
// stage, the cassette recorder / cotton set (K) right of it.
export const PY = 1.35;
export const FRONT = 0.65; // front face of the body
export const ZR = 0.42; // rollers
export const ZU = 0.16; // UV lamp
export const ZI = -0.08; // infrared sensor
export const ZM = -0.3; // magnetic head
export const BIN = [0, 0.62, -0.32]; // reject box (inside, bottom back)
export const P = [-4.6, 0, 1.4];
export const K = [4.6, 0, 1.4];

// ---------------------------------------------------------------- beats
export const T = {
  durch: W("durchleuchtet"),
  sekunden: W("Sekunden"),
  zwei: W("Zwei"),
  rollen: W("Rollen"),
  darueber: W("Darüber"),
  uv: W("UV-Lampe"),
  billiges: W("Billiges"),
  blau: W("blau"),
  echtes: W("Echtes"),
  dunkel: W("dunkel"),
  aber: W("Aber"),
  jetzt: W("Jetzt"),
  trick: W("Trick"),
  ir: W("Infrarot-Licht"),
  verschwindet: W("verschwindet"),
  farbe: W("Farbe"),
  beim2: W("Beim", 2),
  alles: W("alles"),
  sensor: W("Infrarot-Sensor"),
  dann: W("Dann"),
  magnet: W("Magnetkopf"),
  kassette: W("Kassettenrekorder"),
  spuert: W("spürt"),
  tinte: W("Magnet-Tinte"),
  fehlt: W("Fehlt"),
  zack: W("Zack"),
  behaelt: W("behält"),
  sieht: W("sieht"),
  schau: W("Schau"),
  gerade: W("gerade"),
  uebrigens: W("Übrigens"),
  baumwolle: W("Baumwolle"),
  hattest: W("Hattest"),
  schreib: W("Schreib's"),
};

// the note's trip through the machine (z of its centre): in the slot in the
// hook, past the rollers to the UV lamp, on to the IR sensor, the magnetic
// head, then it drops into the reject box on "Zack"
export const NOTE_PATH = [
  [0, 0.86],
  [T.durch, 0.74],
  [T.zwei + 0.1, 0.68],
  [T.uv + 0.2, ZU],
  [T.ir, ZU],
  [T.ir + 0.8, ZI],
  [T.dann, ZI],
  [T.magnet + 0.4, ZM],
];
export const DROP = [T.zack - 0.02, T.zack + 0.35];
// x-ray: on at "durchleuchtet", off again at "Schau dich an"
export const XRAY = [T.durch - 0.05, T.durch + 0.35, T.schau, T.schau + 0.45];

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
const FAKE = add(P, [-0.6, 0.95, 0]); // the fake note on the bench
const REAL = add(P, [0.6, 0.95, 0]); // the real one
const BENCH = add(P, [0, 0.95, 0]);

export const shots = [
  // hook: the note sticks out of the slot and is being pulled in
  shot(0, [0.05, PY + 0.15, FRONT + 0.2], [26, 12, 3.2], [16, 8, 2.8]),
  // "durchleuchtet": the machine turns to glass, scan light inside
  shot(T.durch, [0, PY - 0.15, 0.1], [38, 20, 4.2], [26, 18, 3.8], { whip: 1 }),
  // rollers pull the note in (macro)
  shot(T.zwei, [0, PY, ZR + 0.05], [52, 26, 1.75], [40, 24, 1.55]),
  // the UV lamp above the path
  shot(T.darueber, [0, PY + 0.12, ZU], [-40, 22, 1.9], [-28, 20, 1.65]),
  // the test bench: the fake glows blue …
  shot(T.billiges, FAKE, [-8, 10, 2.7], [2, 8, 2.4], { whip: -1 }),
  // … the real one stays dark
  shot(T.echtes, REAL, [10, 8, 2.7], [2, 8, 2.4]),
  // "Aber Fälscher wissen das": both notes, the fake stops glowing, ✕
  shot(T.aber, BENCH, [0, 14, 4.6], [0, 12, 4.2]),
  // whispered trick: quiet slow push into the glass machine
  shot(T.jetzt, [0, PY - 0.1, 0], [-14, 12, 4.6], [-8, 10, 3.6]),
  // infrared: the real note loses half its colour (slow motion)
  shot(T.ir, REAL, [-6, 8, 2.7], [4, 8, 2.4]),
  // … the fake keeps everything
  shot(T.beim2, FAKE, [8, 8, 2.7], [0, 8, 2.4], { whip: -1 }),
  // the sensor inside the machine
  shot(T.sensor - 0.2, [0, PY + 0.05, ZI], [46, 18, 1.8], [34, 16, 1.6]),
  // the magnetic head
  shot(T.dann, [0, PY + 0.08, ZM], [-50, 22, 1.7], [-38, 20, 1.5]),
  // like in a cassette recorder
  shot(T.kassette, add(K, [0, 0.5, 0]), [-16, 10, 3.9], [-6, 8, 3.5], { whip: 1 }),
  // the head feels the magnetic ink spots
  shot(W("Er", 2), [0, PY, ZM + 0.12], [22, 30, 1.35], [10, 30, 1.2]),
  // "Fehlt eine?": the empty spot (quiet before the bang)
  shot(T.fehlt, [0.18, PY, ZM + 0.12], [12, 32, 1.0], [6, 32, 0.9]),
  // ZACK: alarm, the note drops into the reject box
  shot(T.zack, [0, 1.35, 0], [34, 10, 4.9], [24, 10, 4.6]),
  // "Er sieht, was du nicht siehst": the whole glass machine
  { at: W("Er", 3), orbit: { c: [0, 1.25, 0], r: 4.1, y: 2.1, a0: -0.9, a1: -0.1 }, zoom: 1 },
  // outro: solid again, front
  shot(T.schau, [0, 1.35, 0.3], [10, 6, 4.0], [4, 6, 3.7]),
  {
    at: T.gerade,
    from: [2.4, 2.4, 6.0],
    to: [6.5, 6.5, 13.5],
    look: [0, 1.5, 0],
    lookTo: [0.6, 1.1, 0],
    zoom: 1,
    tilt: 1.3,
  },
  // bonus fact: cotton plant next to a big note
  shot(T.uebrigens, add(K, [0.15, 0.85, 0]), [-12, 10, 4.2], [-4, 10, 3.8], { whip: 1 }),
  // CTA: front of the machine, red light still on the reject box
  shot(T.hattest, [0, 1.4, 0.4], [-20, 8, 3.6], [-10, 8, 3.3], { whip: -1 }),
  {
    at: T.schreib,
    from: [5.0, 4.6, 9.5],
    to: [8.0, 7.0, 14.5],
    look: [0, 1.3, 0],
    zoom: 1,
    tilt: 1.3,
  },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Rollen", at: T.rollen, until: T.darueber, pos: [0.3, PY + 0.08, ZR], side: 1 },
  { text: "UV-Lampe", at: T.uv, until: T.billiges, pos: [-0.25, PY + 0.3, ZU], side: -1 },
  { text: "Infrarot-Sensor", at: T.sensor, until: T.dann, pos: [0.2, PY + 0.3, ZI], side: 1 },
  { text: "Magnetkopf", at: T.magnet, until: T.kassette, pos: [-0.1, PY + 0.2, ZM], side: -1 },
  {
    text: "Kassettenrekorder",
    at: T.kassette + 0.2,
    until: W("Er", 2),
    pos: add(K, [0.3, 1.0, 0.2]),
    side: 1,
  },
  {
    text: "Magnet-Tinte",
    at: T.tinte,
    until: T.fehlt,
    pos: [-0.07, PY + 0.01, ZM + 0.12],
    side: -1,
  },
  { text: "Baumwolle", at: T.baumwolle, until: T.hattest, pos: add(K, [0.75, 1.3, 0]), side: 1 },
];

// ---------------------------------------------------------------- highlights
// one big moment every 5–7 s; a slowmo ends on a shot cut
export const HIGHLIGHTS = [
  { kind: "zoom", at: 0.05, amount: 0.3 }, // hook
  { kind: "flash", at: T.durch },
  { kind: "shake", at: T.rollen + 0.1, dur: 0.35, amp: 0.5 }, // rollers land
  { kind: "zoom", at: T.uv, amount: 0.3 },
  { kind: "flash", at: T.blau },
  { kind: "shake", at: T.aber + 0.6, dur: 0.4, amp: 0.6 }, // ✕
  { kind: "slowmo", at: T.verschwindet, until: T.beim2, speed: 0.4 },
  { kind: "zoom", at: T.sensor, amount: 0.3 },
  { kind: "flash", at: T.zack },
  { kind: "shake", at: T.zack + 0.3, dur: 0.7, amp: 1.2 },
  { kind: "zoom", at: T.baumwolle, amount: 0.3 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "brumm", at: 0, dur: T.durch + 0.3, db: -24 }, // motor pulls the note in
  { s: "pop", at: T.rollen + 0.2 },
  { s: "brumm", at: T.rollen + 0.2, dur: T.uv + 0.2 - T.rollen, db: -23 },
  { s: "surr", at: T.uv + 0.15, dur: T.aber - T.uv, db: -22 }, // UV lamp hums
  { s: "click", at: T.aber + 0.5 },
  { s: "click", at: T.ir },
  { s: "surr", at: T.ir + 0.1, dur: T.dann - T.ir - 0.2, db: -25 },
  { s: "klack", at: T.kassette + 0.4 },
  { s: "brumm", at: T.kassette + 0.4, dur: W("Er", 2) - T.kassette - 0.4, db: -26 },
  { s: "blip", at: T.tinte + 0.45 },
  { s: "blip", at: T.tinte + 0.8 },
  { s: "klack", at: T.zack + 0.33 }, // the note lands in the box
  { s: "piep", at: T.zack + 0.05, dur: W("Er", 3) - T.zack - 0.1, db: -20 },
  { s: "ding", at: T.schau + 0.3, db: -20 }, // screen turns green
  { s: "pop", at: T.uebrigens + 0.1 },
  { s: "rauschen", at: T.schreib + 0.2, dur: Math.max(0.5, END - T.schreib - 1.2), db: -27 },
];
