// Popcorn beats: every time-keyed decision as plain data, so scene.js
// (picture) and scripts/build-sfx.mjs (sound) read the same numbers.
// Keep this file free of three.js / DOM: it is imported by node too.
import { W, END } from "./timing.js";

// ---------------------------------------------------------------- layout
// A red pot on a camping stove at the origin; the giant kernel stands in it
// on its tip. PB = the pot's inner floor. Analogy sets left / right.
export const PB = 0.5;
export const KH = 1.62; // kernel height
export const KC = [0, PB + 0.85, 0]; // kernel centre
export const POP_C = [0, PB + 0.95, 0]; // popcorn centre after the burst
export const TIRE = [-5, 0, 2];
export const CAN = [5, 0, 2];
export const PERU = [-5, 0, 2];

// ---------------------------------------------------------------- beats
export const T = {
  sprengt: W("sprengt"),
  gleich1: W("Gleich", 1),
  dabei: W("dabei"),
  hochspringt: W("hochspringt"),
  brauchst: W("brauchst"),
  maiskorn: W("Maiskorn"),
  schale1: W("Schale", 1),
  panzer: W("Panzer"),
  darin: W("Darin"),
  tropfen: W("Tropfen"),
  wasser1: W("Wasser", 1),
  gleich2: W("Gleich", 2),
  bombe: W("Bombe"),
  wasser2: W("Wasser", 2),
  kann: W("kann"),
  dampf: W("Dampf"),
  druck: W("Druck"),
  neun: W("neun"),
  autoreifen: W("Autoreifen"),
  bei: W("Bei"),
  grad: W("Grad"),
  platzt: W("platzt"),
  zack: W("Zack"),
  staerke: W("Stärke"),
  sofort: W("sofort"),
  bauschaum: W("Bauschaum"),
  springen: W("Springen"),
  schaum: W("Schaum"),
  bein: W("Bein"),
  topf: W("Topf"),
  hopp: W("hopp"),
  uebrigens: W("Übrigens"),
  popcorn2: W("Popcorn", 2),
  jahre: W("6000"),
  peru: W("Peru"),
  suess: W("Süß"),
  kommentare: W("Kommentare"),
};

// hook: the kernel is already bursting on frame 0, the popcorn hops on
// "hochspringt"; build: a fresh kernel pops in on "brauchst"
export const HOOK_BURST = -0.35;
export const REBUILD = T.brauchst + 0.25;
export const SLOW = 0.3;
export const BURST = T.zack + 0.05;
export const HOP = T.hopp + 0.05;

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

export const shots = [
  // hook: close on the kernel bursting open, fast push-in
  shot(0, add(KC, [0, 0.2, 0]), [28, 12, 6.4], [16, 8, 4.6]),
  // wide: the pot erupts, popcorn flying everywhere
  shot(1.3, [0, 1.3, 0], [-30, 22, 8.4], [-20, 18, 7.6], { whip: -1 }),
  // "Gleich weißt du": low macro on the big popcorn, trembling
  shot(T.gleich1, POP_C, [14, 6, 5.4], [6, 8, 4.9]),
  // "… hochspringt": low front, it hops out of frame and back
  shot(T.dabei, [0, 1.8, 0], [-8, 4, 7.6], [-4, 6, 7.2]),
  // build: a fresh kernel pops into the pot
  shot(T.brauchst, KC, [0, 14, 5.0], [8, 12, 4.4]),
  // "Schale": 3/4 close
  shot(T.schale1, KC, [-30, 10, 5.0], [-20, 8, 4.6]),
  // "Panzer": macro, the shell glints
  shot(T.panzer, add(KC, [0.05, 0.2, 0.1]), [22, 14, 4.8], [14, 12, 4.4], { whip: 1 }),
  // "Darin versteckt": x-ray, the drop inside
  shot(T.darin, KC, [0, 10, 4.8], [6, 10, 4.3]),
  // "Gleich wird's zur Bombe": low wide, fuse + the stove ignites
  shot(T.gleich2, [0, 1.4, 0], [-18, 14, 5.2], [-10, 14, 4.7]),
  // whispered: quiet slow push onto the trapped drop
  shot(T.wasser2, add(KC, [0, 0.05, 0]), [10, 10, 4.6], [4, 10, 3.9], { tilt: 0.2 }),
  // "Es wird Dampf": slow x-ray orbit, steam swirls
  { at: T.dampf, orbit: { c: KC, r: 4.6, y: 2.2, a0: -0.8, a1: -0.1 }, zoom: 1 },
  // "neun Bar": hero view, swelling, force arrows
  shot(T.neun, add(KC, [0, -0.15, 0]), [26, 8, 5.4], [18, 8, 5.0]),
  // "Autoreifen": the tire set
  shot(T.autoreifen, add(TIRE, [0, 0.8, 0]), [-14, 6, 6.2], [-6, 6, 5.7], { whip: -1 }),
  // "Bei 180 Grad": back, red-hot, quiet slow push before the bang
  shot(T.bei, add(KC, [0, -0.1, 0]), [-6, 8, 5.4], [-2, 8, 4.8], { whip: 1 }),
  // ZACK: wide front, burst in slow motion
  shot(T.zack, [0, 1.35, 0], [12, 10, 6.4], [6, 10, 6.0]),
  // "Stärke": orbit around the white foam
  { at: T.staerke, orbit: { c: POP_C, r: 5.4, y: 2.4, a0: 0.8, a1: 0.1 }, zoom: 1 },
  // "Bauschaum": the foam can
  shot(T.bauschaum, add(CAN, [0.05, 0.6, 0.2]), [12, 12, 5.4], [6, 10, 5.0], { whip: 1 }),
  // "Und das Springen?": low side, the popcorn in the pot
  shot(T.springen, [0, 1.1, 0], [-40, 8, 6.0], [-30, 8, 5.6], { whip: -1 }),
  // "wie ein Bein": macro low on the leg pushing on the pot floor
  shot(T.bein, [0.1, 1.15, 0.1], [20, 26, 6.4], [14, 24, 6.0]),
  // "hopp!": low front, it shoots up
  shot(HOP - 0.05, [0, 2.4, 0], [6, -4, 7.5], [2, 4, 8.5], { lookTo: [0, 3.6, 0] }),
  // bonus fact: the Peru set
  shot(T.popcorn2, add(PERU, [-0.2, 0.8, -0.3]), [-4, 10, 5.6], [4, 9, 5.1], { whip: -1 }),
  // CTA: the popcorn back in the pot, popcorn raining
  shot(T.suess, [0, 1.3, 0], [-18, 10, 6.0], [-8, 10, 5.4], { whip: 1 }),
  {
    at: T.kommentare,
    from: [4.5, 4.2, 9.0],
    to: [7.5, 6.8, 14.0],
    look: [0, 1.3, 0],
    zoom: 1,
    tilt: 1.3,
  },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Schale", at: T.schale1, until: T.darin, pos: [0.5, KC[1] + 0.2, 0.25], side: 1 },
  { text: "Wasser", at: T.wasser1, until: T.gleich2, pos: [0.05, KC[1], 0.1], side: -1 },
  { text: "Dampf", at: T.dampf, until: T.neun, pos: [0.15, KC[1] + 0.15, 0.1], side: 1 },
  { text: "Stärke", at: T.staerke, until: T.bauschaum, pos: [0.9, POP_C[1] + 0.4, 0.4], side: 1 },
  { text: "Bein", at: T.bein, until: HOP, pos: [0.05, PB + 0.2, 0.3], side: -1 },
];

// ---------------------------------------------------------------- highlights
// one big moment every 5–7 s; a slowmo ends on a shot cut
export const HIGHLIGHTS = [
  { kind: "shake", at: 0, dur: 0.5, amp: 0.8 }, // hook burst
  { kind: "zoom", at: 0.05, amount: 0.3 },
  { kind: "zoom", at: T.hochspringt, amount: 0.25 },
  { kind: "shake", at: T.brauchst + 0.35, dur: 0.35, amp: 0.5 }, // kernel lands
  { kind: "zoom", at: T.panzer, amount: 0.3 },
  { kind: "flash", at: T.bombe + 0.1 }, // the stove ignites
  { kind: "shake", at: T.bombe + 0.12, dur: 0.5, amp: 0.8 },
  { kind: "shake", at: T.kann + 0.1, dur: 0.3, amp: 0.4 }, // the drop bumps the wall
  { kind: "shake", at: T.druck, dur: 1.2, amp: 0.35 }, // pressure trembles
  { kind: "zoom", at: T.neun, amount: 0.3 },
  { kind: "flash", at: BURST },
  { kind: "shake", at: BURST, dur: 0.7, amp: 1.1 },
  { kind: "slowmo", at: T.zack, until: T.staerke, speed: SLOW },
  { kind: "zoom", at: T.bein, amount: 0.3 },
  { kind: "shake", at: HOP, dur: 0.5, amp: 0.9 },
  { kind: "zoom", at: T.jahre, amount: 0.3 },
];

// ---------------------------------------------------------------- sound
// popping kernels in the hook and the CTA (pop is the kit's one-shot)
const pops = (a, b, step, db) => {
  const out = [];
  for (let x = a, i = 0; x < b; x += step * (0.7 + ((i * 37) % 10) / 16), i++)
    out.push({ s: "pop", at: x, db });
  return out;
};
export const SFX = [
  { s: "pop", at: 0.02 }, // hook burst
  ...pops(0.45, T.brauchst - 0.2, 0.42, -22), // the pot keeps popping
  { s: "boing", at: T.hochspringt + 0.05 },
  { s: "pop", at: REBUILD },
  { s: "klack", at: T.panzer + 0.1 },
  { s: "pop", at: T.wasser1 + 0.05 }, // the drop lights up
  { s: "zisch", at: T.bombe, dur: 1.2, db: -24 }, // fuse
  { s: "rauschen", at: T.bombe + 0.1, dur: T.zack - T.bombe - 0.2, db: -27 }, // gas flame
  { s: "zisch", at: T.dampf, dur: 1.6, db: -25 }, // steam inside
  { s: "surr", at: T.druck, dur: T.autoreifen - T.druck, db: -24 }, // pressure
  { s: "pop", at: T.autoreifen + 0.1 },
  { s: "surr", at: T.bei, dur: T.zack - T.bei, db: -22 },
  { s: "pop", at: BURST },
  { s: "zisch", at: BURST + 0.05, dur: 0.9, db: -20 }, // steam escapes
  { s: "rauschen", at: T.bauschaum + 0.1, dur: 1.2, db: -22 }, // foam can
  { s: "boing", at: HOP },
  { s: "pop", at: T.popcorn2 + 0.1 },
  ...pops(T.suess + 0.2, END - 0.6, 0.45, -24),
];
