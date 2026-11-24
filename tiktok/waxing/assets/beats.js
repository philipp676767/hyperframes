// #95 Waxing — every time-keyed decision as plain data (scene + sound).
// Keep this file free of three.js / DOM: it is imported by node too.
import { W } from "./timing.js";

// SKIN world origin (set.js SKIN_POS) — the macro cut-away of the skin
export const SK = [200, 0, 0];
const sk = (x, y, z) => [SK[0] + x, SK[1] + y, SK[2] + z];
// carrot bed (analogy) inside the skin world's backdrop
export const BEET = [SK[0] - 30, 0, SK[2] + 8];
const be = (x, y, z) => [BEET[0] + x, BEET[1] + y, BEET[2] + z];
// spinal cord + gate in the skin world
export const CORD = [SK[0] + 24, -1, 0];
const co = (x, y, z) => [CORD[0] + x, CORD[1] + y, CORD[2] + z];

// ---------------------------------------------------------------- beats
export const T = {
  waxing: W("Waxing", 1),
  sofort: W("sofort", 1),
  warmes: W("Warmes"),
  auf: W("auf", 1),
  umklammert: W("umklammert"),
  faust: W("Faust"),
  ratsch: W("ratsch"),
  haar: W("Haar"),
  wurzel: W("Wurzel", 1),
  moehre: W("Möhre"),
  darum: W("Darum"),
  rasieren: W("Rasieren"),
  sticht: W("sticht"),
  rate: W("Rate"),
  hunderte: W("Hunderte"),
  jede: W("Jede"),
  nerv: W("Nerv"),
  alle: W("alle"),
  daumen: W("Daumen"),
  drauf: W("drauf"),
  rast: W("rast"),
  druck: W("Druck"),
  signal2: W("Druck-Signal"),
  schneller: W("schneller"),
  rueckenmark: W("Rückenmark", 1),
  uebrigens: W("Übrigens"),
  knie: W("Knie"),
  im: W("Im", 2),
  tor: W("Tor"),
  schmerz2: W("Schmerz", 2),
  prallt: W("prallt"),
  team: W("Team", 1),
  schreib: W("Schreib's"),
};
// the rip: the wax + strip are yanked within the slow-mo (scene time)
T.rip = T.ratsch + 0.02;
T.ripEnd = T.ratsch + 0.3;
// red pain pulses start on "alle" and crawl; the lead one hits the gate
T.painGo = T.alle + 0.1;
T.painHit = T.schmerz2 + 0.2; // inside the final slow-mo (scene time)
// blue pressure pulse: from the pressed skin to the cord, fast
T.pressGo = T.rast + 0.1;
T.pressHit = T.rueckenmark - 0.2;
// gate closes on "Tor"
T.gate = T.tor - 0.05;

// ---------------------------------------------------------------- shots
export const shots = [
  // HOOK: the strip is being ripped off the shin by your hand (frame 0)
  { at: 0, from: [1.6, 3.5, 3.0], to: [1.1, 3.0, 2.0], look: [0.65, 2.3, 0.3], zoom: 1.0 },
  // the leg on the bed, the red patch, your hand comes to press
  { at: T.sofort, from: [-0.9, 3.4, 3.4], to: [-0.5, 3.1, 2.8], look: [0.2, 2.1, 0.2], zoom: 1.0 },
  // the wax heater: honey wax dripping from the spatula
  {
    at: T.warmes,
    from: [3.8, 3.3, 0.1],
    to: [3.2, 3.05, -0.4],
    look: [2.35, 2.3, -1.6],
    zoom: 1.0,
  },
  // spreading the wax on the shin
  { at: T.auf, from: [0.9, 2.9, 2.0], to: [0.5, 2.7, 1.6], look: [0, 2.0, 0.3], zoom: 1.0 },
  // MACRO: the skin landscape, wax flows around the hairs
  { at: T.umklammert, from: sk(6, 3.2, 9), to: sk(4.5, 2.4, 7.2), look: sk(0, 0.2, 0), zoom: 1.0 },
  // fist: the strip comes down
  { at: T.faust, from: sk(4.2, 2.4, 7.8), to: sk(3.6, 2.0, 6.8), look: sk(0, 0.4, 1.0), zoom: 1.0 },
  // RATSCH — side view, slow motion
  { at: T.ratsch, from: sk(2.5, 1.2, 10.5), to: sk(2.2, 1.5, 9.8), look: sk(0, 0.8, 0), zoom: 1.0 },
  // the hair comes out with its root (cut face, low)
  {
    at: T.haar,
    from: sk(2.6, -0.2, 7.4),
    to: sk(1.6, 0.2, 6.0),
    look: sk(0.6, -0.3, 2.2),
    zoom: 1.0,
  },
  // carrot from the bed
  { at: T.moehre, from: be(4.6, 2.6, 8.2), to: be(4.0, 2.9, 7.2), look: be(0, 1.9, 0), zoom: 1.0 },
  // smooth leg in the studio, hand strokes along it
  { at: T.darum, from: [-2.0, 2.7, 2.2], to: [-1.3, 2.6, 1.9], look: [0.2, 2.0, 0.3], zoom: 1.0 },
  // shaving: the blade cuts the hairs at the surface
  {
    at: T.rasieren,
    from: sk(-3.8, 1.6, 6.5),
    to: sk(-3.0, 1.2, 5.4),
    look: sk(-0.6, 0.3, 0.8),
    zoom: 1.0,
  },
  // guess: the underside of the strip, full of hairs
  { at: T.rate, from: sk(1.2, 4.6, 8.5), to: sk(0.6, 4.0, 7.0), look: sk(0, 2.6, 0), zoom: 1.0 },
  // x-ray cut: every root hangs on a nerve
  { at: T.jede, from: sk(7.5, 1.5, 9.5), to: sk(6.2, 0.8, 8.0), look: sk(0, -1.8, 0), zoom: 1.0 },
  // all scream: pulses run down, wide along the nerve
  {
    at: T.alle,
    from: sk(1.5, -0.6, 8.5),
    to: sk(3.0, -1.0, 8.0),
    look: sk(0.8, -2.2, 2.5),
    zoom: 1.0,
  },
  // your hand presses on the red patch (studio)
  { at: T.daumen, from: [1.0, 2.9, 2.0], to: [0.75, 2.7, 1.6], look: [0.1, 2.05, 0.3], zoom: 1.0 },
  // macro: the giant hand presses the skin, a blue signal starts
  {
    at: T.rast,
    from: sk(-5.5, 2.5, 8.5),
    to: sk(-4.5, 1.6, 7.3),
    look: sk(-0.5, -1.0, 0),
    zoom: 1.0,
  },
  // the race along the nerve (camera tracks)
  {
    at: T.signal2,
    from: sk(5, -1.5, 7.5),
    to: sk(14, -0.8, 6.5),
    look: sk(4, -3.3, 2.0),
    lookTo: sk(14, -2.4, 0.8),
    zoom: 1.0,
    whip: 1,
  },
  // the spinal cord
  { at: T.rueckenmark, from: co(-5, 2.5, 9), to: co(-4, 2.0, 8), look: co(0.3, 0, 0), zoom: 1.0 },
  // ÜBRIGENS: your hand rubs the knee
  {
    at: T.uebrigens,
    from: [-0.4, 3.2, 2.9],
    to: [-0.9, 2.9, 2.4],
    look: [-1.5, 2.05, 0.3],
    zoom: 1.0,
  },
  // the gate (payoff)
  { at: T.im, from: co(-3.6, 1.6, 5.2), to: co(-2.6, 1.0, 4.2), look: co(-1.3, 0, 0), zoom: 1.0 },
  // the pain bounces off (slow-mo)
  {
    at: T.schmerz2,
    from: co(-4.2, 0.6, 2.6),
    to: co(-3.6, 0.5, 2.1),
    look: co(-1.5, 0, 0),
    zoom: 1.0,
  },
  // CTA: the studio, your hand on the leg, the window
  { at: T.team, from: [1.8, 3.1, 2.7], to: [1.5, 2.9, 2.3], look: [-0.2, 2.1, 0.2], zoom: 1.0 },
  { at: T.schreib, from: [-1.6, 3.0, 3.4], to: [-1.0, 2.8, 2.8], look: [0.1, 2.0, 0.2], zoom: 1.0 },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Wurzel", at: T.wurzel, until: T.moehre, pos: sk(0.55, 1.0, 2.0), side: 1 },
  { text: "Nerv", at: T.nerv, until: T.alle + 0.6, pos: sk(0.25, -2.5, 2.55), side: -1 },
  { text: "Rückenmark", at: T.rueckenmark, until: T.uebrigens, pos: co(0, 2.2, 0.6), side: 1 },
  { text: "Tor", at: T.tor, until: T.schmerz2, pos: co(-1.3, 0.6, 0), side: -1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "zoom", at: T.waxing, amount: 0.3 },
  { kind: "shake", at: 0.15, dur: 0.35, amp: 0.6 },
  { kind: "slowmo", at: T.ratsch, until: T.haar, speed: 0.35 },
  { kind: "flash", at: T.ratsch },
  { kind: "shake", at: T.ratsch + 0.05, dur: 0.6, amp: 1 },
  { kind: "zoom", at: T.wurzel, amount: 0.3 },
  { kind: "zoom", at: T.sticht, amount: 0.25 },
  { kind: "flash", at: T.hunderte },
  { kind: "shake", at: T.alle + 0.1, dur: 0.7, amp: 0.8 },
  { kind: "zoom", at: T.druck, amount: 0.3 },
  { kind: "flash", at: T.tor },
  { kind: "slowmo", at: T.schmerz2, until: T.team, speed: 0.5 },
  { kind: "shake", at: T.prallt, dur: 0.5, amp: 0.7 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "ratsch", at: 0.02, db: -8 }, // frame 0: the strip tears off
  { s: "ratsch", at: T.ratsch, db: -6 },
  { s: "blubb", at: T.warmes, db: -12 }, // the wax bubbles in the heater
  { s: "pop", at: T.hunderte - 0.05, db: -10 },
  { s: "surr", at: T.alle, dur: 1.2, db: -20 },
  { s: "rauschen", at: T.signal2, dur: 1.6, db: -20 },
  { s: "klack", at: T.gate + 0.1 },
  { s: "boing", at: T.prallt, db: -10 },
];
