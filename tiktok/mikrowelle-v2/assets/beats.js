// Mikrowelle beats: every time-keyed decision as plain data, so scene.js
// (picture) and scripts/build-sfx.mjs (sound) read the same numbers.
// Keep this file free of three.js / DOM: it is imported by node too.
import { W, END } from "./timing.js";

// ---------------------------------------------------------------- layout
export const MOL = [-5.0, 0, 2.0]; // water-molecule bowl, later the chocolate set
export const KN = [5.0, 0, 2.0]; // the cut-open dumpling (1–2 cm deep)
export const MY = 0.86; // counter top = microwave bottom

// ---------------------------------------------------------------- beats
export const T = {
  warum: W("warum"),
  blitze1: W("Blitze", 1),
  du: W("brauchst"),
  kiste: W("Metallkiste"),
  magnetron: W("Magnetron"),
  feuert: W("feuert"),
  wellen1: W("Wellen", 1),
  ueberall: W("überall"),
  trick: W("Trick"),
  wellen2: W("Wellen", 2),
  wasser: W("Wassermolekül"),
  milliarden: W("Milliarden"),
  reibung: W("Reibung"),
  hitze: W("Hitze"),
  aber: W("Aber"),
  zwei: W("zwei"),
  kern: W("Kern"),
  heiss: W("heiß"),
  eiskalt: W("eiskalt"),
  metall: W("Metall"),
  spiegelt: W("spiegelt"),
  zinken: W("Zinken"),
  staut: W("staut"),
  ladung: W("Ladung"),
  zack: W("Zack"),
  blitze2: W("Blitze", 2),
  schau: W("Schau"),
  gerade: W("gerade"),
  gebaut: W("gebaut"),
  uebrigens: W("Übrigens"),
  erfunden: W("Erfunden"),
  schoko: W("Schokoriegel"),
  schmolz: W("schmolz"),
  schon: W("Schon"),
  funken: W("Funken"),
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

const FORK = [-0.22, MY + 0.17, -0.02]; // fork on the turntable
const MW = [0, MY + 0.7, 0]; // microwave centre

export const shots = [
  // hook: through the window right at the sparking fork
  shot(0, rel(FORK, [0, 0.06, 0]), [10, 16, 1.75], [3, 13, 1.5]),
  // pull back: the whole microwave flashing
  shot(T.warum, rel(MW, [0, -0.1, 0]), [32, 10, 6.4], [22, 12, 5.6]),
  // build: it shrinks away, the empty box pops back
  shot(T.du, rel(MW, [0, -0.25, 0]), [35, 18, 7.4], [27, 16, 6.8]),
  // magnetron in x-ray, from the right
  shot(T.magnetron, [0.7, MY + 0.65, 0], [58, 18, 4.4], [46, 16, 4.0]),
  // waves bouncing inside, from above the front
  shot(T.wellen1, [-0.3, MY + 0.55, 0], [12, 38, 4.8], [0, 32, 4.3], { whip: 1 }),
  // the trick: dolly into the bowl
  shot(T.trick, [-0.35, MY + 0.3, 0], [6, 34, 3.3], [0, 42, 2.0]),
  // giant water molecules on the soup
  shot(T.wasser, rel(MOL, [0, 1.25, 0]), [16, 16, 3.6], [6, 19, 3.2]),
  shot(T.reibung, rel(MOL, [0, 1.25, 0]), [-22, 26, 2.8], [-32, 22, 2.5]),
  // the cut-open dumpling
  shot(T.aber, rel(KN, [0, 1.15, 0]), [-6, 9, 3.6], [0, 9, 3.2], { whip: -1 }),
  shot(T.kern, rel(KN, [0, 1.15, 0]), [-12, 4, 2.6], [-5, 4, 2.3]),
  shot(T.heiss, rel(KN, [0, 1.2, 0]), [24, 22, 3.2], [14, 20, 2.9]),
  // metal: back at the microwave, solid, through the window
  shot(T.metall, rel(FORK, [0, 0.25, 0]), [-14, 14, 3.0], [-6, 14, 2.7]),
  // macro on the tines
  shot(T.zinken, rel(FORK, [0.2, 0.03, -0.05]), [8, 24, 1.3], [2, 22, 1.15], { whip: 1 }),
  // ZACK: the money shot
  shot(T.zack, rel(FORK, [0.05, 0.18, 0]), [-6, 12, 2.1], [-14, 12, 2.6]),
  // outro: front, then drone pull-back while the door opens
  shot(T.schau, rel(MW, [0, -0.1, 0]), [0, 10, 6.0], [8, 10, 5.6]),
  {
    at: T.gerade,
    from: [2.6, 2.7, 6.2],
    to: [6.0, 4.8, 11.0],
    look: [0, MY + 0.6, 0],
    lookTo: [0, MY + 0.2, 0],
    zoom: 1,
  },
  // bonus fact: the melting chocolate bar
  shot(T.uebrigens, rel(MOL, [0, 1.0, 0]), [22, 16, 3.6], [12, 16, 3.2], { whip: -1 }),
  shot(T.schoko, rel(MOL, [0.25, 0.95, 0]), [-14, 26, 2.4], [-4, 26, 2.2]),
  // CTA: wide drone shot of the snowy village, the fork sparking again
  {
    at: T.schon,
    from: [3.4, 3.0, 7.2],
    to: [9.0, 7.5, 16.0],
    look: [0, MY + 0.6, 0],
    lookTo: [0, MY, 0],
    zoom: 1,
  },
];

// ---------------------------------------------------------------- labels
// (the "Zinken" tag follows the turning fork and lives in scene.js)
export const LABELS = [
  { text: "Magnetron", at: T.magnetron, until: T.wellen1, pos: [0.85, MY + 0.62, 0.1], side: 1 },
  {
    text: "Wassermolekül",
    at: T.wasser,
    until: T.milliarden + 1.2,
    pos: rel(MOL, [0.05, 1.32, 0.35]),
    side: -1,
  },
  { text: "Kern", at: T.kern, until: T.heiss, pos: rel(KN, [0, 1.15, 0.05]), side: 1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "shake", at: 0.05, dur: 0.5, amp: 0.7 }, // sparks from frame 1
  { kind: "flash", at: T.blitze1 }, // "… Blitze schlägt"
  { kind: "shake", at: T.blitze1, dur: 0.5, amp: 0.9 },
  { kind: "shake", at: T.kiste + 0.25, dur: 0.4, amp: 0.7 }, // the box lands
  { kind: "zoom", at: T.trick, amount: 0.35 },
  { kind: "slowmo", at: T.wellen2, until: T.wasser, speed: 0.35 }, // waves into the soup
  { kind: "shake", at: T.reibung, dur: 0.6, amp: 0.5 }, // molecules rub hot
  { kind: "zoom", at: T.eiskalt, amount: 0.3 },
  { kind: "slowmo", at: T.staut, until: T.zack, speed: 0.4 }, // charge builds up
  { kind: "flash", at: T.zack },
  { kind: "shake", at: T.zack, dur: 0.8, amp: 1.2 },
  { kind: "zoom", at: T.zack, amount: 0.3 },
  { kind: "flash", at: T.blitze2 },
  { kind: "flash", at: T.funken },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "brumm", at: 0.02, dur: T.du - 0.1, db: -24 }, // running in the hook
  { s: "zisch", at: 0.3, dur: 0.6, db: -20 }, // crackle
  { s: "zisch", at: T.blitze1, dur: 0.8, db: -17 },
  { s: "pop", at: T.kiste + 0.1 }, // the box
  { s: "pop", at: T.magnetron + 0.1 }, // magnetron
  { s: "brumm", at: T.feuert, dur: T.trick - T.feuert - 0.1, db: -20 },
  { s: "pop", at: T.wasser + 0.1 }, // molecules
  { s: "surr", at: T.milliarden, dur: T.aber - T.milliarden - 0.1, db: -21 },
  { s: "pop", at: T.zwei + 0.1 }, // hot ring
  { s: "zisch", at: T.heiss, dur: 1.0, db: -21 }, // steam
  { s: "brumm", at: T.metall + 0.1, dur: T.zack - T.metall - 0.2, db: -22 },
  { s: "blip", at: T.zinken + 0.05 }, // Zinken tag (scene.js)
  { s: "surr", at: T.ladung, dur: T.zack - T.ladung - 0.1, db: -20 }, // charge
  { s: "zisch", at: T.zack, dur: 1.2, db: -14 }, // arcs
  { s: "zisch", at: T.blitze2, dur: 0.5, db: -15 },
  { s: "klack", at: T.gebaut + 0.3, db: -15 }, // door opens
  { s: "surr", at: T.erfunden + 0.2, dur: T.schmolz - T.erfunden, db: -23 },
  { s: "zisch", at: T.funken, dur: 0.6, db: -19 },
  { s: "brumm", at: T.schon + 0.2, dur: Math.max(0.5, END - T.schon - 1.5), db: -26 },
];
