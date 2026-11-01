// #44 Smartwatch-Puls — every time-keyed decision as plain data (scene.js +
// scripts/build-sfx.mjs). No three.js / DOM here.
import { W } from "./timing.js";

// places: STUDIO (origin) = your forearm resting on a stone pillar of the
// Donaukanal balustrade, the watch on the wrist. JOG = the promenade in
// front (a little jogger runs by). HAUT = a cut through your wrist under the
// watch, a dark red world under the floor: the giant watch on the skin
// roof, green LEDs + the light sensor, the artery pumping, ink of a tattoo,
// a big heart further right.
export const HAUT = [0, -60, 0];
export const H = (x, y, z) => [x + HAUT[0], y + HAUT[1], z + HAUT[2]];
export const AY = 1.45; // arm axis height
export const WRIST = [0.95, 1.78, 0]; // watch centre on the wrist (world)
export const HEART = [13, 2.6, 0]; // the heart (HAUT local)
export const JOG = { x: 0, y: 0, z: 0 }; // the jogger (world, updated per frame)
export const LEDPOS = [0.95, 2.2, 0]; // a green LED on the flipped watch (world, updated per frame)

// ---------------------------------------------------------------- beats
export const T = {
  smart: W("Smartwatch"),
  blitzt: W("blitzt"),
  licht1: W("Licht", 1),
  blut1: W("Blut", 1),
  dreh: W("Dreh"),
  blinkt1: W("blinkt", 1),
  gruen1: W("grün", 1),
  nicht1: W("Nicht", 1),
  rot1: W("rot", 1),
  weiss: W("weiß"),
  gruen2: W("grün", 2),
  merkt: W("merkt"),
  herz1: W("Herz", 1),
  stolpert: W("stolpert"),
  stell: W("Stell"),
  joggst: W("joggst"),
  kanal: W("Kanal"),
  herzschlag: W("Herzschlag"),
  schwall: W("Schwall"),
  handgelenk: W("Handgelenk"),
  mehr: W("Mehr"),
  weniger: W("weniger"),
  zurueck: W("zurück"),
  winzig: W("winziger"),
  sensor: W("Lichtsensor"),
  flackern: W("Flackern"),
  puls: W("Puls"),
  rate: W("Rate"),
  lampe: W("Lampe"),
  hunderte: W("Hunderte"),
  sekunde: W("Sekunde"),
  nur: W("Nur"),
  tattoos: W("Tattoos"),
  luegt: W("lügt"),
  dunkle: W("Dunkle"),
  frisst: W("frisst"),
  erreicht: W("erreicht"),
  uhr: W("Uhr"),
  raet2: W("rät", 2),
  schlecht: W("schlecht"),
  darum: W("Darum"),
  gruen3: W("grün", 3),
  rot2: W("rot", 2),
  weil: W("weil"),
  gruenes: W("grünes"),
  schluckt: W("schluckt"),
  schlag: W("Schlag"),
  fakt: W("Übrigens"),
  herz2: W("Herz", 2),
  milliarden: W("Milliarden"),
  was: W("Was"),
  ruhepuls: W("Ruhepuls"),
  screenshot: W("Screenshot"),
  folge: W("Folge"),
};

// ---------------------------------------------------------------- shots
const [wx, wy] = WRIST;
export const shots = [
  // hook: the watch lifted off your wrist, green beams shooting into the
  // skin — fast push-in, dark water behind
  {
    at: 0,
    from: [wx + 0.75, wy + 0.55, 1.5],
    to: [wx + 0.4, wy + 0.3, 0.9],
    look: [wx, wy + 0.05, 0],
    zoom: 1.0,
  },
  // macro: beams hitting the skin, it glows green
  {
    at: T.blitzt,
    from: [wx - 0.55, wy + 0.25, 0.75],
    to: [wx - 0.35, wy + 0.18, 0.55],
    look: [wx + 0.05, wy - 0.12, 0],
    zoom: 1.0,
  },
  // inside: the green light reaches the blood
  { at: T.licht1, from: H(2.2, 3.6, 6.2), to: H(1.4, 3.1, 5.0), look: H(0, 2.4, 0), zoom: 1.0 },
  // "Dreh sie mal um": the watch flips, its belly towards you
  {
    at: T.dreh,
    from: [wx + 0.1, wy + 0.45, 1.25],
    to: [wx + 0.05, wy + 0.35, 0.95],
    look: [wx, wy + 0.42, 0],
    zoom: 1.0,
    whip: 1,
  },
  // nicht rot, nicht weiß … grün (sensor macro)
  {
    at: T.nicht1,
    from: [wx - 0.12, wy + 0.5, 0.78],
    to: [wx - 0.05, wy + 0.47, 0.66],
    look: [wx, wy + 0.44, 0],
    zoom: 1.0,
  },
  // back on the wrist: the screen, heart stumbles
  {
    at: T.merkt,
    from: [wx + 0.3, wy + 1.0, 0.75],
    to: [wx + 0.15, wy + 0.8, 0.5],
    look: [wx, wy + 0.05, 0],
    zoom: 1.0,
  },
  // story: you jog along the canal in the morning (tracking the jogger)
  {
    at: T.stell,
    rel: JOG,
    from: [2.4, 1.6, 3.4],
    to: [1.2, 1.3, 2.6],
    look: [0, 1.0, 0],
    zoom: 1.0,
  },
  {
    at: T.kanal,
    rel: JOG,
    from: [-3.6, 2.6, 5.4],
    to: [-4.8, 2.9, 5.8],
    look: [-0.6, 1.0, -3],
    zoom: 1.0,
  },
  // dive into the wrist: the artery bulges with every beat (slowmo)
  {
    at: T.herzschlag,
    from: H(-3.2, 3.2, 6.6),
    to: H(-2.2, 2.6, 5.2),
    look: H(0, 1.9, 0),
    zoom: 1.0,
    whip: -1,
  },
  // more blood, less light back: the side view of the light paths
  { at: T.mehr, from: H(2.6, 3.0, 7.6), to: H(2.0, 2.9, 6.6), look: H(0, 2.9, 0.5), zoom: 1.0 },
  // the light sensor (macro under the watch)
  {
    at: T.winzig,
    from: H(-1.0, 4.0, 4.6),
    to: H(-0.6, 3.98, 3.8),
    look: H(0, 4.12, 0.95),
    zoom: 1.0,
  },
  // the pulse: back out, the curve on the watch
  {
    at: T.puls,
    from: [wx + 0.25, wy + 1.0, 0.85],
    to: [wx + 0.15, wy + 0.85, 0.6],
    look: [wx, wy + 0.05, 0],
    zoom: 1.0,
  },
  // rate mal: the LED stroboscope (macro, slow)
  {
    at: T.rate,
    from: H(1.3, 4.0, 3.9),
    to: H(1.1, 3.98, 3.3),
    look: H(0.8, 4.18, 0.95),
    zoom: 1.0,
  },
  // Hunderte: crash out, the whole underside flashing
  {
    at: T.hunderte,
    from: H(0.6, 3.9, 6.4),
    to: H(0.4, 3.85, 5.4),
    look: H(0, 3.5, 0.5),
    zoom: 1.0,
  },
  // the tattoo under the watch
  {
    at: T.nur,
    from: [wx + 0.9, wy + 1.4, 1.6],
    to: [wx + 0.5, wy + 0.9, 1.1],
    look: [wx - 0.1, wy - 0.15, 0],
    zoom: 1.0,
  },
  // the ink eats the light
  { at: T.dunkle, from: H(-2.6, 3.4, 6.0), to: H(-1.8, 3.2, 5.0), look: H(0, 2.7, 0), zoom: 1.0 },
  // the watch guesses: 194?!
  {
    at: T.uhr,
    from: [wx + 0.35, wy + 0.95, 0.7],
    to: [wx + 0.15, wy + 0.75, 0.45],
    look: [wx, wy + 0.05, 0],
    zoom: 1.0,
    whip: 1,
  },
  // payoff: blood swallows green, red bounces back (macro on the cells)
  { at: T.darum, from: H(2.2, 2.4, 4.4), to: H(1.5, 2.2, 3.6), look: H(0, 1.95, 0), zoom: 1.0 },
  { at: T.weil, from: H(-1.2, 2.2, 2.6), to: H(-0.8, 2.05, 2.0), look: H(0, 1.9, 0), zoom: 1.0 },
  // every beat stands out: wide orbit over the whole cut
  { at: T.schlag - 0.6, orbit: { c: H(0, 2.6, 0), r: 6.5, y: 4.4 - 60, a0: 0.55, a1: -0.25 } },
  // Übrigens: the heart, three billion beats
  {
    at: T.fakt,
    from: H(HEART[0] + 2.4, 3.6, 6.0),
    to: H(HEART[0] + 1.4, 3.1, 4.6),
    look: H(HEART[0], 2.6, 0),
    zoom: 1.0,
  },
  // CTA: your watch, resting pulse, then the drone pull-back over the canal
  {
    at: T.was,
    from: [wx + 0.35, wy + 1.0, 0.8],
    to: [wx + 0.2, wy + 0.85, 0.55],
    look: [wx, wy + 0.05, 0],
    zoom: 1.0,
  },
  {
    at: T.screenshot + 0.3,
    from: [3.2, 3.4, 5.4],
    to: [11, 9.5, 19],
    look: [0, 1.4, -1],
    lookTo: [-2, 0.5, -8],
  },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Grüne LED", at: T.gruen2 + 0.2, until: T.merkt - 0.05, pos: LEDPOS, side: 1 },
  {
    text: "Schlagader",
    at: T.schwall + 0.2,
    until: T.mehr - 0.05,
    pos: H(-1.6, 1.75, 0.6),
    side: -1,
  },
  { text: "Lichtsensor", at: T.sensor, until: T.puls - 0.05, pos: H(0, 4.18, 1.15), side: -1 },
  {
    text: "Tattoo",
    at: T.tattoos + 0.1,
    until: T.dunkle - 0.05,
    pos: [wx - 0.35, AY + 0.26, 0.18],
    side: -1,
  },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "flash", at: 0.55 }, // the LEDs fire
  { kind: "zoom", at: T.blut1, amount: 0.3 },
  { kind: "shake", at: T.dreh + 0.35, dur: 0.4, amp: 0.5 },
  { kind: "flash", at: T.gruen2 },
  { kind: "shake", at: T.stolpert, dur: 0.5, amp: 0.7 },
  { kind: "zoom", at: T.kanal, amount: 0.2 },
  { kind: "slowmo", at: T.schwall - 0.4, until: T.mehr, speed: 0.4 },
  { kind: "zoom", at: T.sensor, amount: 0.25 },
  { kind: "flash", at: T.hunderte },
  { kind: "zoom", at: T.tattoos, amount: 0.3 },
  { kind: "shake", at: T.schlecht, dur: 0.5, amp: 0.6 },
  { kind: "flash", at: T.schluckt },
  { kind: "zoom", at: T.milliarden, amount: 0.3 },
];

// ---------------------------------------------------------------- sound
// own sound (scripts/sfx-extra.py): "herzschlag" = a soft lub-dub
export const SFX = [
  { s: "surr", at: 0.0, dur: 1.6, db: -16 }, // the LEDs fire on frame 0
  { s: "click", at: 0.55, db: -8 },
  { s: "whoosh", at: T.dreh + 0.05, db: -10 },
  { s: "klack", at: T.dreh + 0.45, db: -12 },
  { s: "piep", at: T.stolpert + 0.1, dur: 0.6, db: -20 },
  { s: "herzschlag", at: T.herzschlag - 0.1, db: -10 },
  { s: "herzschlag", at: T.schwall - 0.05, db: -8 },
  { s: "herzschlag", at: T.puls, db: -11 },
  { s: "surr", at: T.hunderte - 0.1, dur: 1.2, db: -15 },
  { s: "piep", at: T.raet2, dur: 1.0, db: -22 },
  { s: "herzschlag", at: T.schlag, db: -9 },
  { s: "herzschlag", at: T.fakt + 0.3, db: -10 },
  { s: "herzschlag", at: T.herz2 + 0.4, db: -10 },
  { s: "wow", at: T.milliarden, db: -9 },
];
