// Kontaktlos-bezahlen beats: every time-keyed decision as plain data, so
// scene.js (picture) and scripts/build-sfx.mjs (sound) read the same numbers.
// Keep this file free of three.js / DOM: it is imported by node too.
import { W, END } from "./timing.js";

// ---------------------------------------------------------------- layout
// The payment terminal stands on a post left of centre (front = +z); the
// giant bank card floats right of it while it is explained, and flies in
// front of the terminal's screen to pay. A phone pops in for the CTA.
export const TX = -1.1; // terminal x
export const TY = 1.8; // terminal body centre (body 1.0 × 1.6 × TD, on a 1 m post)
export const TZ = 0; // terminal body centre z
export const TD = 0.3; // terminal depth
export const FACE = TZ + TD / 2; // front face z
export const SCREEN_Y = TY + 0.1; // screen in the middle, keypad below
export const READER_Y = TY + 0.6; // contactless zone + coil at the top
export const TAP = [TX, TY + 0.82, FACE + 0.14]; // card centre when it pays (screen stays visible below)
export const HOME = [0.95, 1.7, 0.35]; // card centre while it is explained
export const FAR = [TX + 0.1, TY + 0.9, FACE + 1.2]; // "nur ganz nah": pulled back
export const CHIP = [-0.4, 0.06]; // chip, card-local (x, y)

// ---------------------------------------------------------------- beats
export const T = {
  keinen: W("keinen"),
  akku: W("Akku"),
  trotzdem: W("Trotzdem"),
  computer: W("Computer"),
  gleich: W("Gleich"),
  strom1: W("Strom", 1),
  du: W("brauchst"),
  chip: W("Chip", 1),
  reiskorn: W("Reiskorn"),
  ohne: W("Ohne"),
  schlaeft: W("schläft"),
  krass: W("Krasseste"),
  plastik: W("Plastik"),
  rund: W("Rund"),
  draht1: W("Draht", 1),
  gewickelt: W("gewickelt"),
  antenne: W("Antenne"),
  allein: W("Allein"),
  nichts: W("nichts"),
  jetzt: W("Jetzt"),
  lesegeraet: W("Lesegerät"),
  magnetfeld: W("Magnetfeld"),
  dreizehn: W("13"),
  millionen: W("Millionen"),
  sekunde: W("Sekunde"),
  karte2: W("Karte", 2),
  zack: W("zack"),
  draht2: W("Draht", 2),
  chip2: W("Chip", 2),
  wacht: W("wacht"),
  funkt: W("funkt"),
  piep: W("Piep"),
  terminal: W("Terminal"),
  darum: W("darum"),
  nah: W("nah"),
  uebrigens: W("Übrigens"),
  geheimcode: W("Geheimcode"),
  karte3: W("Karte", 3),
  handy: W("Handy"),
  ab: W("Ab"),
};

// hook: the card swoops in from before frame 0 and taps the terminal
export const HOOK_TAP = 0.62;
// card trips (start, end) — positions in scene.js
export const TRIP = {
  leave: [T.gleich + 0.1, T.gleich + 0.9], // hook tap -> home
  pay: [T.karte2, T.zack + 0.02], // home -> tap
  back: [T.darum, T.nah + 0.5], // tap -> far (field too weak)
  home2: [T.karte3 - 0.1, T.karte3 + 0.4], // far -> home for the CTA
};
// x-ray of the card: from "Plastik" until the answer
export const XRAY = [T.plastik - 0.05, T.plastik + 0.35, T.terminal, T.terminal + 0.45];

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
const chipW = add(HOME, [CHIP[0], CHIP[1], 0.02]);
const MID = [(TX + HOME[0]) / 2, 1.95, 0.2];
const READER = [TX, READER_Y, FACE];

export const shots = [
  // hook: fast push-in while the card swoops onto the terminal
  shot(0, add(TAP, [0.15, -0.35, 0]), [42, 16, 4.0], [24, 8, 2.9]),
  // "keinen Akku": close on the card, empty battery + ✕ beside it
  shot(T.keinen, add(TAP, [0.55, -0.1, 0.05]), [14, 6, 3.1], [6, 6, 2.8], { whip: 1 }),
  // "Trotzdem … Computer": the chip lights up (macro)
  shot(T.trotzdem, add(TAP, [CHIP[0], CHIP[1], 0.02]), [28, 14, 0.95], [16, 10, 0.8]),
  // "Gleich weißt du …": wide, the card flies away to its home spot
  shot(T.gleich, MID, [-18, 12, 7.2], [-8, 10, 6.6], { whip: -1 }),
  // "Du brauchst einen Chip": the card alone, medium
  shot(T.du, HOME, [16, 8, 3.4], [6, 6, 3.0]),
  // "Chip, klein wie ein Reiskorn": macro, a rice grain pops next to it
  shot(T.chip, add(chipW, [0.1, -0.02, 0]), [30, 16, 0.9], [18, 12, 0.75], { whip: 1 }),
  // "Ohne Strom schläft er": quiet, dark chip
  shot(T.ohne, chipW, [-24, 22, 1.05], [-14, 18, 0.95]),
  // "das Krasseste … Plastik": card turns to glass and spins (slow motion)
  shot(T.krass, HOME, [-30, 10, 3.5], [-12, 8, 3.1], { whip: -1 }),
  // whisper: slow orbit while the wire winds round the card
  { at: T.rund, orbit: { c: HOME, r: 3.1, y: HOME[1] + 0.7, a0: 0.75, a1: 0.15 }, zoom: 1 },
  // "Das ist die Antenne"
  shot(T.antenne, add(HOME, [0.3, 0.25, 0]), [-8, 20, 1.7], [-2, 18, 1.5]),
  // "Allein bringt sie nichts": ✕
  shot(T.allein, HOME, [22, 10, 3.3], [16, 8, 3.0]),
  // "Jetzt kommt das Lesegerät": whip to the terminal
  shot(T.jetzt, [TX, TY + 0.2, TZ], [-30, 12, 3.6], [-18, 10, 3.1], { whip: -1 }),
  // "Sein Magnetfeld": rings pulse out of the screen
  shot(T.magnetfeld, add(READER, [0, -0.05, 0.5]), [40, 10, 2.9], [30, 8, 2.6]),
  // "13 Millionen Mal": front, rings come at the lens
  shot(T.dreizehn, add(READER, [0, -0.1, 0.3]), [6, 6, 3.0], [2, 4, 2.4]),
  // "Karte rein – zack": both, side view, the card flies in (x-ray)
  shot(T.karte2, add(MID, [-0.4, 0.2, 0.1]), [34, 12, 5.0], [26, 10, 4.4], { whip: 1 }),
  // "Strom im Draht!": close on the glowing wire
  shot(T.draht2, add(TAP, [0.35, 0.2, 0.05]), [40, 18, 1.6], [30, 16, 1.4]),
  // "Der Chip wacht auf": chip macro
  shot(T.chip2, add(TAP, [CHIP[0], CHIP[1], 0.02]), [36, 12, 0.95], [26, 10, 0.8], { whip: 1 }),
  // "funkt zurück": rings back to the terminal
  shot(T.funkt, add(TAP, [0, -0.15, 0.2]), [30, 10, 2.5], [20, 8, 2.2]),
  // "Piep": screen turns green
  shot(T.piep, [TX, SCREEN_Y + 0.2, FACE], [-14, 8, 2.5], [-8, 6, 2.2], { whip: -1 }),
  // "Das Terminal ist sein Akku": solid again, both, medium
  shot(T.terminal, [TX + 0.2, TY + 0.45, 0.3], [30, 10, 4.0], [22, 8, 3.6]),
  // "darum klappt's nur ganz nah": side view, the card pulls back, rings die out
  shot(T.darum, add(TAP, [0.15, -0.25, 0.55]), [52, 8, 3.9], [44, 8, 3.6]),
  // bonus fact: the chip with its code
  shot(
    T.uebrigens,
    add(FAR, [CHIP[0] + 0.15, CHIP[1] + 0.05, 0.1]),
    [-20, 12, 1.4],
    [-10, 10, 1.2],
    { whip: 1 },
  ),
  // CTA: card or phone?
  shot(T.karte3, add(HOME, [0.55, -0.1, 0.1]), [14, 10, 5.0], [6, 8, 4.7], { whip: -1 }),
  {
    at: T.ab,
    from: [2.4, 2.6, 6.0],
    to: [6.0, 6.2, 13.0],
    look: [0, 1.55, 0],
    lookTo: [0.4, 1.2, 0],
    zoom: 1,
    tilt: 1.3,
  },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Chip", at: T.chip + 0.1, until: T.ohne, pos: add(chipW, [0, 0.05, 0]), side: -1 },
  {
    text: "Reiskorn",
    at: T.reiskorn + 0.1,
    until: T.ohne,
    pos: add(chipW, [0.2, -0.1, 0.05]),
    side: 1,
  },
  { text: "Antenne", at: T.antenne, until: T.allein, pos: add(HOME, [0.62, 0.15, 0]), side: -1 },
  {
    text: "Magnetfeld",
    at: T.magnetfeld + 0.1,
    until: T.dreizehn,
    pos: add(READER, [0.5, 0.0, 0.45]),
    side: 1,
  },
  {
    text: "Lesegerät",
    at: T.lesegeraet,
    until: T.magnetfeld,
    pos: [TX + 0.45, TY - 0.3, FACE],
    side: 1,
  },
];

// ---------------------------------------------------------------- highlights
// one big moment every 5–7 s; a slowmo ends on a shot cut
export const HIGHLIGHTS = [
  { kind: "flash", at: HOOK_TAP }, // hook: the card pays
  { kind: "zoom", at: T.akku, amount: 0.3 },
  { kind: "zoom", at: T.computer, amount: 0.25 },
  { kind: "shake", at: T.reiskorn + 0.15, dur: 0.3, amp: 0.4 }, // rice lands
  { kind: "flash", at: T.plastik },
  { kind: "slowmo", at: T.plastik, until: T.rund, speed: 0.35 }, // the glass card spins
  { kind: "zoom", at: T.antenne, amount: 0.3 },
  { kind: "shake", at: T.nichts, dur: 0.35, amp: 0.5 }, // ✕
  { kind: "zoom", at: T.dreizehn, amount: 0.3 },
  { kind: "flash", at: T.zack },
  { kind: "shake", at: T.zack + 0.2, dur: 0.6, amp: 1.1 },
  { kind: "flash", at: T.piep },
  { kind: "zoom", at: T.geheimcode, amount: 0.3 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "piep", at: HOOK_TAP, dur: 0.22, db: -18 }, // hook payment beep
  { s: "pop", at: T.akku + 0.05 }, // battery
  { s: "surr", at: T.trotzdem + 0.2, dur: T.gleich - T.trotzdem - 0.3, db: -25 }, // chip thinks
  { s: "pop", at: T.reiskorn + 0.1 },
  { s: "wow", at: T.plastik + 0.05, db: -20 },
  { s: "surr", at: T.rund + 0.1, dur: T.antenne - T.rund, db: -27 }, // wire winding
  { s: "boing", at: T.nichts, db: -22 },
  { s: "rauschen", at: T.magnetfeld, dur: T.karte2 - T.magnetfeld, db: -27 }, // field
  { s: "surr", at: T.zack + 0.05, dur: T.chip2 - T.zack, db: -20 }, // current in the wire
  { s: "blip", at: T.funkt + 0.2 },
  { s: "blip", at: T.funkt + 0.45 },
  { s: "piep", at: T.piep, dur: 0.25, db: -17 },
  { s: "pop", at: T.karte3 + 0.25 }, // phone pops in
  { s: "rauschen", at: T.ab + 0.2, dur: Math.max(0.5, END - T.ab - 1.2), db: -28 },
];
