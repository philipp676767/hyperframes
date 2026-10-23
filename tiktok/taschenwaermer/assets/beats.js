// Taschenwärmer beats: every time-keyed decision as plain data, so scene.js
// (picture) and scripts/build-sfx.mjs (sound) read the same numbers.
// Keep this file free of three.js / DOM: it is imported by node too.
import { W, END } from "./timing.js";

// ---------------------------------------------------------------- layout
// The pad stands upright at the origin on a little wooden foot, front = +z.
// Its outline is roundedRect(PW, PH) with the bottom edge at y = PY0; the
// click disc sits low right inside. The thermometer stands right of it,
// the boiling pot (K) far right, the chips bag (P) far left.
export const PW = 1.7;
export const PH = 2.3;
export const PY0 = 0.32;
export const PC = [0, PY0 + PH / 2, 0]; // pad centre
export const DISC = [0.4, PY0 + 0.62, 0.165]; // click disc (world)
export const THERMO = [1.45, 0, 0.35];
export const K = [5, 0, 2];
export const P = [-5, 0, 2];

// ---------------------------------------------------------------- beats
export const T = {
  batterie: W("Batterie"),
  knick: W("Knick"),
  fuenfzig: W("50"),
  brauchst: W("brauchst"),
  salz1: W("Salz", 1),
  unter: W("Unter"),
  f58: W("58"),
  fest: W("fest"),
  tut: W("tut"),
  nicht: W("nicht"),
  es3: W("Es", 3),
  unterkuehlt: W("unterkühlt"),
  hier: W("Und", 3),
  trick: W("Trick"),
  metall: W("Metallplättchen"),
  knickst: W("Knickst"),
  entsteht: W("entsteht"),
  kristall1: W("Kristall", 1),
  zack: W("zack"),
  beutel2: W("Beutel", 2),
  beim: W("Beim"),
  gibt: W("gibt"),
  waerme1: W("Wärme", 1),
  kwaerme: W("Kristallisationswärme"),
  die: W("Die"),
  kochendem: W("kochendem"),
  schau: W("Schau"),
  gerade: W("gerade"),
  uebrigens: W("Übrigens"),
  salz3: W("Salz", 3),
  chips: W("Salt-and-Vinegar-Chips"),
  hast: W("Hast", 2), // #1 is "Du hast gerade"
  schreib: W("Schreib's"),
};

// hook: the disc clicks on frame 1 and the crystals race through the pad
export const HOOK_CLICK = 0.25;
export const HOOK_FULL = 2.8;
// build: the wave starts on "zack" in slow motion (scene time only reaches
// zack + 0.3 · (beutel2 - zack) before the cut), then finishes in real time
export const SLOW = 0.3;
export const SLOW_END = T.zack + (T.beutel2 - T.zack) * SLOW;
export const CLICK = T.knickst + 0.38; // the disc snaps

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
const PAD = [0, 1.45, 0];

export const shots = [
  // hook: the disc has just clicked, crystals shoot through the pad
  shot(0, [0.1, 1.4, 0], [24, 10, 5.4], [14, 8, 4.9]),
  // "Ein Knick": close on the disc, the pad flares up hot
  shot(T.knick, add(DISC, [-0.2, 0.25, 0]), [-22, 14, 2.6], [-12, 12, 2.3], { whip: 1 }),
  // "über 50 Grad": hero view, heat arrows, panel
  shot(T.fuenfzig - 0.15, PAD, [32, 14, 5.6], [20, 12, 5.1]),
  // build starts: an empty bag pops in
  shot(T.brauchst, PAD, [0, 10, 5.4], [8, 10, 4.9]),
  // the salt pours in
  shot(T.salz1 - 0.1, [0, 1.25, 0], [-34, 16, 3.9], [-24, 14, 3.5], { whip: -1 }),
  // "Unter 58 Grad": pad + thermometer
  shot(T.unter, [0.75, 1.3, 0.2], [22, 8, 5.0], [12, 8, 4.6]),
  // "müsste es fest werden – tut es aber nicht": ice tries to form on top
  shot(T.fest, [0, 2.1, 0.1], [12, 26, 3.6], [4, 24, 3.2]),
  // "Es ist unterkühlt – und wartet": slow orbit, cold blue pulse
  { at: T.es3, orbit: { c: [0, 1.45, 0], r: 4.6, y: 2.0, a0: -0.7, a1: 0.05 }, zoom: 1 },
  // whispered trick: quiet slow push onto the disc
  shot(T.hier, DISC, [8, 10, 2.8], [4, 8, 2.1], { tilt: 0.2 }),
  // "Knickst du es": macro from the side, the disc snaps
  shot(T.knickst, DISC, [40, 14, 2.1], [30, 12, 1.85], { whip: 1, tilt: 0.2 }),
  // "ein winziger Kristall": extreme macro, quiet before the bang
  shot(T.entsteht, add(DISC, [-0.12, 0.08, 0]), [-6, 16, 1.25], [0, 14, 1.05], { tilt: 0.2 }),
  // ZACK: wide front, the wave races through the pad (slow motion)
  shot(T.zack, PAD, [-10, 8, 5.0], [-4, 8, 4.8]),
  // the wave reaches the corners
  shot(T.beutel2, PAD, [28, 14, 4.3], [18, 12, 3.9]),
  // "gibt das Salz Wärme ab": low hero, glowing
  shot(T.gibt, PAD, [-28, 4, 5.0], [-16, 6, 4.6]),
  // "Kristallisationswärme": big orbit around the glowing pad
  { at: T.kwaerme, orbit: { c: [0, 1.45, 0], r: 5.0, y: 2.3, a0: 0.9, a1: -0.15 }, zoom: 1 },
  // "Die Wärme war schon drin"
  shot(T.die, PAD, [6, 6, 4.6], [2, 6, 4.2]),
  // boiling pot: a small pad turns clear again
  shot(T.kochendem, add(K, [0, 0.75, 0]), [-14, 26, 4.0], [-6, 24, 3.6], { whip: 1 }),
  // outro: front
  shot(T.schau, PAD, [10, 6, 4.8], [4, 6, 4.4]),
  {
    at: T.gerade,
    from: [2.4, 2.6, 6.2],
    to: [6.5, 6.5, 13.5],
    look: [0, 1.5, 0],
    lookTo: [0.6, 1.1, 0],
    zoom: 1,
    tilt: 1.3,
  },
  // bonus fact: the chips bag
  shot(T.uebrigens, add(P, [0, 0.75, 0]), [-2, 9, 3.6], [-2, 8, 3.2], { whip: -1 }),
  // CTA: the warm pad
  shot(T.hast, PAD, [-20, 8, 4.8], [-10, 8, 4.4], { whip: 1 }),
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
  { text: "Natriumacetat", at: T.salz1, until: T.fest, pos: [-0.35, 1.1, 0.18], side: -1 },
  { text: "unterkühlt", at: T.unterkuehlt, until: T.hier, pos: [-0.4, 1.9, 0.2], side: -1 },
  { text: "Metallplättchen", at: T.metall, until: T.knickst, pos: DISC, side: -1 },
  {
    text: "Kristall-Keim",
    at: T.kristall1,
    until: T.zack,
    pos: add(DISC, [-0.17, 0.12, 0.03]),
    side: -1,
  },
  {
    text: "Kristallisationswärme",
    at: T.kwaerme,
    until: T.die,
    pos: [0, 2.0, 0.2],
    side: 1,
  },
  { text: "Natriumacetat", at: T.salz3, until: T.hast, pos: add(P, [0.3, 1.0, 0.2]), side: 1 },
];

// ---------------------------------------------------------------- highlights
// one big moment every 5–7 s; a slowmo ends on a shot cut
export const HIGHLIGHTS = [
  { kind: "zoom", at: 0.05, amount: 0.3 }, // hook
  { kind: "flash", at: T.knick + 0.05 }, // the pad flares up
  { kind: "shake", at: T.fuenfzig, dur: 0.45, amp: 0.7 },
  { kind: "shake", at: T.brauchst + 0.3, dur: 0.35, amp: 0.5 }, // bag lands
  { kind: "zoom", at: T.f58, amount: 0.25 },
  { kind: "shake", at: T.nicht + 0.1, dur: 0.35, amp: 0.5 }, // ✕
  { kind: "zoom", at: T.unterkuehlt, amount: 0.3 },
  { kind: "shake", at: CLICK, dur: 0.3, amp: 0.45 }, // the disc snaps
  { kind: "zoom", at: T.kristall1, amount: 0.3 },
  { kind: "flash", at: T.zack },
  { kind: "shake", at: T.zack + 0.05, dur: 0.6, amp: 1.0 },
  { kind: "slowmo", at: T.zack, until: T.beutel2, speed: SLOW },
  { kind: "zoom", at: T.kwaerme, amount: 0.3 },
  { kind: "zoom", at: T.chips, amount: 0.3 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "klack", at: HOOK_CLICK }, // hook: the disc clicks
  { s: "surr", at: HOOK_CLICK + 0.1, dur: HOOK_FULL - HOOK_CLICK, db: -24 }, // crystals crackle
  { s: "pop", at: T.batterie + 0.05 },
  { s: "pop", at: T.brauchst + 0.25 }, // the bag pops in
  { s: "rauschen", at: T.salz1 + 0.05, dur: 0.8, db: -22 }, // salt pours in
  { s: "pop", at: T.unter + 0.05 }, // thermometer
  { s: "klack", at: CLICK },
  { s: "surr", at: T.zack + 0.05, dur: T.beim - T.zack, db: -20 }, // the wave
  { s: "rauschen", at: T.kochendem + 0.2, dur: T.schau - T.kochendem - 0.3, db: -20 }, // boiling
  { s: "zisch", at: T.kochendem + 0.5, dur: 1.4, db: -24 }, // steam
  { s: "pop", at: T.uebrigens + 0.1 },
  { s: "rauschen", at: T.schreib + 0.2, dur: Math.max(0.5, END - T.schreib - 1.2), db: -27 },
];
