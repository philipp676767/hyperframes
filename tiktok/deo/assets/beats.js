// #58 Deo — every time-keyed decision as plain data (scene.js reads it for
// the picture, scripts/build-sfx.mjs for the sound).
import { W } from "./timing.js";

export const T = {
  deo1: W("Deo", 1),
  falschen: W("falschen"),
  stell: W("Stell"),
  date: W("Date"),
  shirt: W("Shirt"),
  kurz: W("Kurz"),
  nasse: W("nasse"),
  flecken: W("Flecken"),
  deo2: W("Deo", 2),
  trocknet: W("trocknet"),
  verstopft: W("verstopft"),
  achsel: W("Achsel"),
  poren: W("Poren"),
  deo3: W("Deo", 3),
  alu: W("Aluminiumsalz"),
  schweiss1: W("Schweiß", 1),
  gel: W("Gel"),
  plopp: W("Plopp"),
  pfropfen: W("Pfropfen"),
  nur: W("Nur"),
  kaum1: W("kaum", 1),
  folge: W("Folge"),
  rate: W("Rate"),
  stinkt: W("stinkt"),
  nicht2: W("Nicht", 2),
  bakterien: W("Bakterien"),
  fressen: W("fressen"),
  riechst: W("riechst"),
  abgas: W("Abgas"),
  kein1: W("Kein", 1),
  futter: W("Futter"),
  gestank: W("Gestank"),
  aber: W("Aber"),
  warme: W("warme"),
  dusche1: W("Dusche", 1),
  stress: W("Stress"),
  bus: W("Bus"),
  spuelt: W("spült"),
  salz: W("Salz"),
  dicht: W("dicht"),
  nachts: W("Nachts"),
  schlafen: W("schlafen"),
  druesen: W("Drüsen"),
  also: W("Also"),
  deo4: W("Deo", 4),
  abends: W("abends"),
  dusche2: W("Dusche", 2),
  morgen: W("Morgen"),
  fakt: W("Übrigens"),
  korea: W("Korea"),
  achselgeruch: W("Achselgeruch"),
  schuld: W("schuld"),
  gen: W("Gen"),
  spray: W("Spray"),
  roller: W("Roller"),
  stick: W("Stick"),
};
T.das2 = T.spuelt - 0.36; // "Das spült …"
T.das3 = T.dusche2 - 0.66; // "Das hält sogar …"

// ---------------------------------------------------------------- places
// hero pore on the slab top near the cut; the duct runs straight down
// behind the x-ray window (set.js) to the coiled gland.
export const PORE = [0, 0, 1.2];
export const CAN = [-2.9, 0, -2.4];
export const BAC = [4.2, 0, -3.4]; // the bacteria's sweat bead
export const DATE = [0, -120, 0]; // the date: a restaurant corner far below

// ---------------------------------------------------------------- shots
export const shots = [
  // hook: the giant can, a hand pressing, spray pouring over the skin — sweat shoots up anyway
  { at: 0, from: [-6.4, 3.6, 7.2], to: [-4.9, 3.1, 5.5], look: [-1.5, 3.7, -1.2], zoom: 1.35 },
  // low macro: sweat squirting out of the pores through the mist
  {
    at: T.falschen,
    from: [-2.3, 0.8, 3.7],
    to: [-1.75, 0.62, 3.0],
    look: [0.2, 0.45, 0.9],
    zoom: 1.15,
    whip: 1,
  },
  // the date: white shirt, candle light
  {
    at: T.stell,
    rel: DATE,
    from: [2.4, 1.9, 4.6],
    to: [1.7, 1.75, 3.5],
    look: [0, 1.45, 0],
    zoom: 1.2,
  },
  // close on the armpit: the stain grows
  {
    at: T.kurz,
    rel: DATE,
    from: [-1.3, 1.15, 2.1],
    to: [-1.0, 1.25, 1.65],
    look: [-0.42, 1.5, 0],
    zoom: 1.0,
  },
  // back on the skin: the can sprays, wide
  {
    at: T.deo2,
    from: [-8.5, 3.6, 9.2],
    to: [-6.8, 3.0, 7.6],
    look: [-0.8, 2.0, -1.8],
    zoom: 1.3,
    whip: -1,
  },
  // crash zoom into the hero pore
  { at: T.verstopft, from: [1.0, 2.6, 3.6], to: [0.35, 1.3, 2.1], look: [0, 0, 1.2], zoom: 1.0 },
  // the armpit landscape, low and wide
  {
    at: T.achsel - 0.3,
    from: [7.2, 1.5, 6.4],
    to: [5.4, 1.3, 5.2],
    look: [-2.5, 1.8, -8],
    zoom: 1.4,
  },
  // pores from above
  { at: T.poren, from: [1.4, 3.4, 4.2], to: [0.9, 2.9, 3.4], look: [0, 0, 0.7], zoom: 1.0 },
  // x-ray: salt crystals falling into the duct
  {
    at: T.deo3 - 0.12,
    from: [1.7, 0.5, 6.4],
    to: [1.1, 0.25, 5.3],
    look: [0, -0.9, 1.2],
    zoom: 1.0,
  },
  // x-ray lower: sweat rising from the gland
  {
    at: T.schweiss1 - 0.14,
    from: [-1.9, -1.5, 7.4],
    to: [-1.4, -1.1, 6.3],
    look: [0, -2.2, 1.2],
    zoom: 1.3,
  },
  // macro on the plug: PLOPP (slow motion until the cut)
  { at: T.plopp, from: [1.0, -0.3, 4.1], to: [0.7, -0.45, 3.5], look: [0, -0.75, 1.2], zoom: 0.9 },
  // the morning sun over the hair forest
  { at: T.nur, from: [2.8, 1.25, 0.6], to: [2.3, 1.35, -0.2], look: [-6, 3.4, -14], zoom: 1.0 },
  // follow line: the whole landscape from above
  { at: T.folge, from: [9.5, 6.8, 13.5], to: [7.8, 5.8, 11.2], look: [0, 1.0, -3], zoom: 1.4 },
  // rate mal: the bacteria colony around a sweat bead
  {
    at: T.rate,
    rel: BAC,
    from: [1.5, 2.1, 2.5],
    to: [1.1, 1.7, 1.9],
    look: [0, 0.3, 0],
    zoom: 1.1,
  },
  // macro on the clear sweat bead: it smells of nothing
  {
    at: T.nicht2,
    rel: BAC,
    from: [-0.7, 0.75, 1.5],
    to: [-0.5, 0.62, 1.15],
    look: [0, 0.3, 0],
    zoom: 0.95,
    whip: -1,
  },
  // bacteria munching, orbit
  { at: T.bakterien, rel: BAC, orbit: { c: [0, 0.35, 0], r: 2.4, y: 2.0, a0: 0.9, a1: 0.25 } },
  // stink clouds rising, camera low looking up
  {
    at: T.riechst - 0.12,
    rel: BAC,
    from: [1.9, 0.45, 2.6],
    to: [1.6, 0.55, 2.1],
    look: [0, 1.5, 0],
    zoom: 1.2,
  },
  // no sweat, no food: sad bacteria by a plugged pore
  {
    at: T.kein1,
    rel: BAC,
    from: [-1.6, 1.3, 2.2],
    to: [-1.2, 1.1, 1.8],
    look: [0.1, 0.3, 0],
    zoom: 1.1,
  },
  // morning: the clock, the skin
  { at: T.aber, from: [4.2, 2.7, 6.2], to: [3.3, 2.25, 5.0], look: [0, 0.8, 0], zoom: 1.3 },
  // the warm shower rains on the pores
  {
    at: T.warme - 0.1,
    from: [2.1, 0.65, 3.9],
    to: [1.6, 0.52, 3.1],
    look: [0, 0.6, 0.6],
    zoom: 1.1,
    whip: 1,
  },
  // x-ray: the sweat flushes the salt out before it seals
  { at: T.das2, from: [1.5, 0.0, 5.8], to: [1.0, -0.25, 4.9], look: [0, -0.9, 1.2], zoom: 1.0 },
  // night falls: the moon over the hair forest
  { at: T.nachts, from: [1.5, 1.3, 0.8], to: [1.2, 1.45, 0.1], look: [-9, 8, -31], zoom: 1.0 },
  // x-ray at night: the glands sleep, the plug forms in peace
  {
    at: T.schlafen - 0.1,
    from: [-1.3, -0.6, 6.2],
    to: [-0.95, -0.8, 5.3],
    look: [0, -1.6, 1.2],
    zoom: 1.15,
  },
  // payoff: the can sprays in the evening
  {
    at: T.also,
    from: [-7.2, 3.4, 6.8],
    to: [-5.6, 2.9, 5.3],
    look: [-0.9, 2.7, -0.9],
    zoom: 1.3,
    whip: 1,
  },
  // the morning shower can't wash the plug out
  { at: T.das3, from: [1.9, 0.9, 5.6], to: [1.35, 0.6, 4.6], look: [0, -0.35, 1.2], zoom: 1.0 },
  // Übrigens: the bacteria have nothing to eat
  { at: T.fakt, rel: BAC, orbit: { c: [0, 0.4, 0], r: 2.7, y: 1.3, a0: -0.7, a1: -0.1 } },
  // one single gene: the DNA helix
  {
    at: T.schuld - 0.1,
    rel: BAC,
    from: [0.3, 1.9, 3.0],
    to: [0.2, 1.8, 2.3],
    look: [0, 1.75, 0],
    zoom: 1.15,
    whip: 1,
  },
  // comment question: spray, roller, stick
  {
    at: T.spray - 0.08,
    from: [0.3, 1.9, 5.4],
    to: [0.1, 1.65, 4.7],
    look: [0, 0.8, 0.15],
    zoom: 1.35,
  },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Pore", at: T.poren, until: T.deo3 - 0.12, pos: [0.25, 0.05, 1.2], side: 1 },
  {
    text: "Aluminiumsalz",
    at: T.alu,
    until: T.schweiss1 - 0.14,
    pos: [0.08, -0.55, 1.35],
    side: 1,
  },
  { text: "Pfropfen", at: T.pfropfen, until: T.nur, pos: [0.2, -0.75, 1.3], side: 1 },
  {
    text: "Bakterien",
    at: T.bakterien + 0.05,
    until: T.riechst - 0.12,
    pos: [4.75, 0.45, -2.9],
    side: 1,
  },
  { text: "Schweißdrüse", at: T.druesen, until: T.also, pos: [0.3, -4.2, 1.2], side: 1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "zoom", at: 0.3, amount: 0.25 },
  { kind: "shake", at: T.falschen + 0.05, dur: 0.4, amp: 0.7 },
  { kind: "zoom", at: T.flecken, amount: 0.3 },
  { kind: "zoom", at: T.verstopft, amount: 0.35 },
  { kind: "flash", at: T.alu },
  { kind: "slowmo", at: T.plopp, until: T.nur, speed: 0.4 },
  { kind: "shake", at: T.plopp + 0.12, dur: 0.4, amp: 0.8 },
  { kind: "zoom", at: T.stinkt, amount: 0.25 },
  { kind: "shake", at: T.abgas, dur: 0.5, amp: 0.9 },
  { kind: "zoom", at: T.warme, amount: 0.2 },
  { kind: "flash", at: T.dicht },
  { kind: "shake", at: T.dicht, dur: 0.4, amp: 0.6 },
  { kind: "zoom", at: T.abends, amount: 0.3 },
  { kind: "flash", at: T.korea },
  { kind: "zoom", at: T.gen, amount: 0.3 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "spruehen", at: 0.0, db: -8 }, // frame 0: the can hisses
  { s: "spruehen", at: T.deo2 + 0.05, db: -12 },
  { s: "pop", at: T.flecken - 0.1, db: -6 },
  { s: "pop", at: T.plopp + 0.05 },
  { s: "boing", at: T.abgas + 0.05, db: -9 },
  { s: "rauschen", at: T.warme - 0.05, dur: T.das2 - T.warme + 0.3, db: -15 },
  { s: "zisch", at: T.spuelt, dur: 1.0, db: -15 },
  { s: "spruehen", at: T.deo4, db: -12 },
  { s: "rauschen", at: T.das3, dur: T.fakt - T.das3, db: -16 },
  { s: "pop", at: T.schuld + 0.05 },
  { s: "pop", at: T.spray + 0.05 },
  { s: "pop", at: T.roller + 0.05 },
  { s: "pop", at: T.stick + 0.05 },
];
