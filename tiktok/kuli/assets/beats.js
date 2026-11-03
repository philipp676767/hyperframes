// Beats of #52 "Kuli-Deckel": every time-keyed decision as plain data, read
// by scene.js (picture) and scripts/build-sfx.mjs (sound). No three.js here.
import { W, END } from "./timing.js";

// ---------------------------------------------------------------- places (plain numbers)
// the throat tunnel pocket (below the gym floor), the throat entrance next to it
export const TUN = [0, -90, 0];
export const TUN2 = [0, -90, 34];
// the windpipe stands upright: its local axis z (towards the mouth) is world +y,
// so tunnel-local (x, y, z) → world (x, z, -y)
const tun = (x, y, z) => [TUN[0] + x, TUN[1] + z, TUN[2] - y];
const tun2 = (x, y, z) => [TUN2[0] + x, TUN2[1] + y, TUN2[2] + z];

// the pen lying on the exam sheet: pivot at the tip, body along local -x
export const PEN = { yaw: -0.9, y: 0.2, center: [0.1, 0, 0.1] };
const dir = [Math.cos(PEN.yaw), 0, -Math.sin(PEN.yaw)]; // local +x in the world
const along = (d, y = PEN.y) => [PEN.center[0] + dir[0] * d, y, PEN.center[2] + dir[2] * d];
export const PEN_TIP = along(1.78);
export const PEN_HOLE = along(0.06, PEN.y + 0.17); // the small hole on top of the barrel
export const PEN_INK = along(-0.5); // back end of the ink column
// things that pop up on the desk at the end
export const CAP_UP = [-2.0, 0, 3.0];
export const SNORKEL = [-0.95, 0, 3.3];
export const HEAD = [0.9, 0, 3.4];
export const NORM = [1.8, 0.07, -1.7];

// ---------------------------------------------------------------- beats
export const T = {
  loch1: W("Loch", 1),
  kann: W("kann"),
  stell: W("Stell"),
  pruefung: W("Prüfung"),
  kaust: W("kaust"),
  atmest: W("atmest", 1),
  zack: W("zack"),
  steckt1: W("steckt", 1),
  luftroehre: W("Luftröhre"),
  jetzt: W("Jetzt"),
  loch2: W("Loch", 2),
  schau: W("Schau"),
  schaft: W("Schaft"),
  loch3: W("Loch", 3),
  ohne: W("Ohne"),
  unterdruck: W("Unterdruck"),
  tinte: W("Tinte"),
  dein2: W("dein", 2),
  streikt: W("streikt"),
  kaust2: W("Kaust", 2),
  zurueck: W("Zurück"),
  deckel2: W("Deckel", 2),
  korken: W("Korken"),
  rate: W("Rate"),
  mindestens: W("Mindestens"),
  acht: W("acht"),
  etwa: W("etwa"),
  sitzen: W("Sitzen"),
  schreibt: W("schreibt"),
  norm: W("Norm"),
  deckel3: W("Deckel", 3),
  gross: W("groß"),
  passen: W("passen"),
  das3: W("Das", 3),
  schnorchel: W("Schnorchel"),
  fakt: W("Übrigens"),
  lego: W("Lego-Köpfe"),
  oben: W("oben"),
  grund: W("Grund"),
};
// pop-in / motion moments derived from the words
T.capFly = T.atmest + 0.05; // (scene time inside the slow motion)
T.capLand = T.zack + 0.45;
T.tape = T.ohne + 0.25;
T.normLand = T.schreibt + 0.15;
T.giantLand = T.gross + 0.05;
T.snorkelPop = T.schnorchel - 0.05;
T.headPop = T.fakt + 0.35;

// ---------------------------------------------------------------- shots
const rel = (p, d) => [p[0] + d[0], p[1] + d[1], p[2] + d[2]];
export const shots = [
  // 0: cold open — the cap stuck in the windpipe, air whistling through its hole
  // (hook: the windpipe as a cut-away seen from the side, so the whole cap reads)
  { at: 0, from: tun(5.6, 1.5, 0.2), to: tun(4.3, 1.1, -0.5), look: tun(0, 0, -1.0) },
  { at: T.kann, from: tun(1.75, 0.55, -2.1), to: tun(1.35, 0.4, -1.95), look: tun(0, 0, -1.7) },
  // the exam hall
  { at: T.stell, from: [17, 9, 22], to: [8.5, 4.6, 10.5], look: [0, 0.5, -0.5] },
  { at: T.pruefung, from: [5.4, 3.3, 6.8], to: [4.0, 2.5, 5.2], look: [0.4, 0.4, 0.2] },
  // POV from inside the mouth (teeth on the camera), slow motion as the cap slips off
  { at: T.kaust, from: [0.3, 7.2, 9.6], to: [0.2, 6.95, 9.1], look: [0, 4.6, -3] },
  // zack — in the windpipe
  { at: T.zack, from: tun(0.28, 0.2, -4.3), to: tun(0.2, 0.14, -3.3), look: tun(0, 0, 1.0) },
  {
    at: T.luftroehre,
    from: tun(-0.42, -0.26, -3.4),
    to: tun(-0.3, -0.2, -2.5),
    look: tun(0.15, 0.08, 0),
  },
  { at: T.jetzt, from: tun(0.32, 0.22, -3.1), to: tun(0.07, 0.05, -1.72), look: tun(0, 0, -1.3) },
  // back on the desk: the pen without its cap, x-ray, the barrel hole
  { at: T.schau, from: [3.4, 2.6, 4.9], to: [2.5, 1.9, 3.8], look: [0.2, 0.25, 0.2] },
  {
    at: T.schaft,
    from: rel(PEN_HOLE, [1.0, 1.35, -0.35]),
    to: rel(PEN_HOLE, [0.72, 1.0, -0.25]),
    look: PEN_HOLE,
    whip: 1,
  },
  {
    at: T.ohne,
    from: rel(PEN_HOLE, [-0.85, 0.75, 1.1]),
    to: rel(PEN_HOLE, [-0.6, 0.55, 0.8]),
    look: PEN_HOLE,
  },
  {
    at: T.unterdruck,
    from: rel(PEN_INK, [1.05, 1.3, -0.3]),
    to: rel(PEN_INK, [0.78, 0.98, -0.22]),
    look: PEN_INK,
  },
  { at: T.dein2, from: [2.6, 2.6, 4.4], to: [2.0, 2.0, 3.4], look: [0.5, 0.5, 0.7] },
  // comment question: the whole exam hall
  { at: T.kaust2, from: [-26, 17, 42], to: [-17, 11, 29], look: [0, 1, -24] },
  // back in the throat
  {
    at: T.zurueck,
    from: tun(0.38, 0.26, 4.4),
    to: tun(0.25, 0.16, 3.1),
    look: tun(0, 0, 0.8),
    whip: -1,
  },
  { at: T.deckel2, from: tun(-0.42, -0.26, 4.0), to: tun(-0.32, -0.2, 3.1), look: tun(0, 0, 0.6) },
  { at: T.rate, from: tun(0.42, 0.26, -3.7), to: tun(0.3, 0.2, -3.0), look: tun(0, 0, -1.0) },
  {
    at: T.mindestens,
    from: tun(0.4, 0.24, -2.9),
    to: tun(0.36, 0.2, -2.35),
    look: tun(0, 0, -1.5),
  },
  // like breathing while you sit: the desk + chair from the side
  { at: T.etwa, from: [18, 0.5, 22], to: [14, -0.6, 17], look: [0, -3.5, 6] },
  // the norm lands on the desk
  { at: T.schreibt, from: rel(NORM, [0.6, 6.4, 4.6]), to: rel(NORM, [0.4, 5.2, 3.4]), look: NORM },
  // a cap without a hole is too big for the throat
  { at: T.deckel3, from: tun2(5.2, 5.4, 7.6), to: tun2(3.8, 4.2, 5.6), look: tun2(0, 0.9, 0) },
  // payoff: the hole is your snorkel
  { at: T.das3, from: [-1.0, 2.1, 8.0], to: [-1.25, 1.75, 7.0], look: [-1.35, 1.1, 3.1] },
  // Übrigens: the toy head with the same hole
  { at: T.fakt, orbit: { c: [0.7, 0.8, 3.3], r: 3.6, y: 2.0, a0: 0.4, a1: -0.3 }, whip: 1 },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Luftröhre", at: T.luftroehre + 0.1, until: T.jetzt, pos: tun(0.6, 0.12, -1.6), side: 1 },
  { text: "Loch", at: T.loch2, until: T.schau, pos: tun(0, 0, -1.32), side: -1 },
  { text: "Schaft-Loch", at: T.loch3, until: T.ohne + 0.6, pos: PEN_HOLE, side: -1 },
  { text: "Unterdruck", at: T.unterdruck + 0.05, until: T.dein2, pos: PEN_INK, side: 1 },
  {
    text: "Schnorchel",
    at: T.schnorchel + 0.05,
    until: T.fakt,
    pos: [SNORKEL[0] + 0.25, 2.55, SNORKEL[2]],
    side: 1,
  },
  { text: "Lego-Kopf", at: T.lego, until: T.grund + 0.4, pos: [HEAD[0], 1.4, HEAD[2]], side: 1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "zoom", at: T.loch1, amount: 0.3 },
  { kind: "slowmo", at: T.atmest, until: T.zack, speed: 0.35 },
  { kind: "flash", at: T.zack },
  { kind: "shake", at: T.capLand, dur: 0.5, amp: 1.0 },
  { kind: "zoom", at: T.loch2, amount: 0.3 },
  { kind: "shake", at: T.streikt, dur: 0.4, amp: 0.6 },
  { kind: "shake", at: T.korken, dur: 0.5, amp: 0.9 },
  { kind: "flash", at: T.acht },
  { kind: "shake", at: T.giantLand, dur: 0.5, amp: 1.0 },
  { kind: "zoom", at: T.schnorchel, amount: 0.3 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "pfeifen", at: 0.0, db: -8 },
  { s: "pfeifen", at: T.kann + 0.2, db: -12 },
  { s: "knacken", at: T.kaust + 0.05, db: -9 },
  { s: "knacken", at: T.kaust + 0.55, db: -11 },
  { s: "rauschen", at: T.atmest, dur: 1.0, db: -15 },
  { s: "pfeifen", at: T.steckt1 + 0.2, db: -11 },
  { s: "pfeifen", at: T.jetzt + 0.6, db: -10 },
  { s: "klack", at: T.tape },
  { s: "pfeifen", at: T.deckel2 + 0.3, db: -14 },
  { s: "pfeifen", at: T.mindestens, db: -8 },
  { s: "rauschen", at: T.mindestens, dur: 1.8, db: -19 },
  { s: "pfeifen", at: T.acht + 0.9, db: -11 },
  { s: "klack", at: T.normLand + 0.35 },
  { s: "klack", at: T.norm, db: -6 },
  { s: "boing", at: T.giantLand, db: -9 },
  { s: "pop", at: T.snorkelPop },
  { s: "pop", at: T.headPop },
  { s: "pfeifen", at: T.oben + 0.1, db: -14 },
];
export { END };
