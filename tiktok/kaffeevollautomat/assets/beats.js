// #56 Kaffeevollautomat — every time-keyed decision as plain data (scene.js
// reads it for the picture, scripts/build-sfx.mjs for the sound).
import { W } from "./timing.js";

export const T = {
  gekocht: W("gekocht"),
  er: W("Er"),
  gepresst: W("gepresst", 1),
  stell: W("Stell"),
  drueckst: W("drückst"),
  auf: W("auf"),
  knopf: W("Knopf"),
  sofort: W("Sofort"),
  kracht: W("kracht"),
  mahlwerk: W("Mahlwerk"),
  bohnen1: W("Bohnen", 1),
  staub: W("Staub"),
  doch: W("Doch"),
  wasser1: W("Wasser", 1),
  gibt: W("Gibt"),
  also: W("Also"),
  quetscht: W("quetscht"),
  kolben: W("Kolben"),
  puck: W("Puck"),
  dann1: W("Dann", 1),
  pumpe: W("Pumpe"),
  kochendes: W("kochendes"),
  neun: W("neun"),
  espresso1: W("Espresso", 1),
  cappuccino: W("Cappuccino"),
  hafer: W("Hafer-Latte"),
  kommentare: W("Kommentare"),
  rate: W("rate"),
  tauchen: W("tauchen"),
  neunzig: W("Neunzig"),
  grund: W("Grund"),
  gas: W("Gas"),
  kohlendioxid: W("Kohlendioxid"),
  druck2: W("Druck", 2),
  oelen: W("Ölen"),
  schlaegt: W("schlägt"),
  kein: W("Kein"),
  alt: W("alt"),
  genau: W("Genau"),
  gepresst2: W("gepresst", 2),
  crema: W("Crema"),
  fakt: W("Übrigens"),
  koffein: W("Koffein"),
  filter: W("Filterkaffee"),
  folge: W("Folge"),
};
T.der1 = T.grund - 0.36; // "Der Grund …"
T.der2 = T.druck2 - 0.08; // "Der Druck reißt …"

// ---------------------------------------------------------------- shots
// machine at the origin (front +z, 2.5 tall); SPOT_A = (-4.4, 0, 0.9),
// SPOT_B = (4.4, 0, 0.9) on the worktop; the dive set far below.
export const SPOT_A = [-4.4, 0, 0.9];
export const SPOT_B = [4.4, 0, 0.9];
export const DIVE = [0, -120, 0];
export const shots = [
  // hook: the whole machine, espresso already shooting, the hand on the button
  { at: 0, from: [1.9, 1.7, 3.3], to: [1.35, 1.45, 2.5], look: [0, 1.2, 0.4], zoom: 1.95 },
  // macro of the cup: golden stream, crema swirling
  { at: T.er, from: [0.8, 0.75, 1.85], to: [0.6, 0.68, 1.55], look: [0, 0.55, 0.78], zoom: 1.35 },
  // wide establishing: the tea kitchen in the morning sun
  { at: T.stell, from: [-4.2, 3.1, 7.4], to: [-3.3, 2.6, 6.2], look: [0.9, 1.4, 0], zoom: 1.5 },
  // close on the panel: the hand presses the button
  { at: T.auf, from: [1.3, 2.2, 2.9], to: [1.0, 2.05, 2.45], look: [0.15, 1.85, 1.0], zoom: 1.25 },
  // x-ray, top: beans into the grinder
  {
    at: T.sofort,
    from: [1.5, 3.1, 1.9],
    to: [1.15, 2.85, 1.45],
    look: [-0.3, 1.9, -0.3],
    zoom: 1.5,
    whip: 1,
  },
  // macro: the grinder spits powder
  {
    at: T.bohnen1,
    from: [-1.2, 2.0, 1.25],
    to: [-1.0, 1.9, 1.05],
    look: [-0.15, 1.5, -0.1],
    zoom: 1.55,
  },
  // analogy: just pour water over it → brown broth
  {
    at: T.doch,
    rel: SPOT_B,
    from: [-1.55, 1.25, 2.1],
    to: [-1.2, 1.05, 1.7],
    look: [0, 0.45, 0],
    zoom: 1.35,
    whip: -1,
  },
  // x-ray: the piston slams the powder
  {
    at: T.also,
    from: [1.25, 1.55, 1.75],
    to: [1.05, 1.45, 1.45],
    look: [0, 1.25, 0.05],
    zoom: 1.35,
  },
  // macro: the puck
  { at: T.puck, from: [-0.95, 1.3, 1.2], to: [-0.8, 1.24, 1.0], look: [0, 1.12, 0.05], zoom: 1.45 },
  // x-ray from the right: tank, pump, heater
  {
    at: T.dann1,
    from: [2.5, 1.75, 1.2],
    to: [2.1, 1.5, 0.8],
    look: [0.2, 0.95, -0.35],
    zoom: 1.45,
  },
  // pressure on the puck + the gauge
  {
    at: T.neun - 0.16,
    from: [1.05, 1.55, 1.35],
    to: [0.85, 1.42, 1.08],
    look: [0, 1.25, 0.05],
    zoom: 1.3,
  },
  // comment question: three cups
  {
    at: T.espresso1,
    rel: SPOT_A,
    from: [0.6, 1.45, 3.0],
    to: [0.45, 1.25, 2.6],
    look: [0.15, 0.3, 0],
    zoom: 1.85,
  },
  // rate mal: a diver sinking (camera follows him)
  {
    at: T.rate - 0.12,
    rel: "diver",
    from: [2.6, 1.2, 3.8],
    to: [2.0, 0.6, 3.0],
    look: [0, 0, 0],
    zoom: 1.3,
  },
  // 90 m: the sea floor — with an espresso cup
  {
    at: T.neunzig,
    rel: DIVE,
    from: [-5.5, -8.6, 9.0],
    to: [-4.4, -9.4, 7.2],
    look: [1.0, -10.2, -1.2],
    zoom: 1.2,
  },
  // the bean, quiet push-in
  {
    at: T.der1,
    rel: SPOT_B,
    from: [-1.75, 1.05, 2.2],
    to: [-1.3, 0.85, 1.6],
    look: [0, 0.5, 0],
    zoom: 1.55,
  },
  // x-ray macro: gas + oil torn out of the puck
  { at: T.der2, from: [1.0, 1.3, 1.35], to: [0.85, 1.2, 1.15], look: [0, 1.1, 0.05], zoom: 1.35 },
  // the cup: millions of bubbles (slow motion)
  {
    at: T.schlaegt,
    from: [0.42, 1.1, 1.35],
    to: [0.3, 0.98, 1.15],
    look: [0, 0.38, 0.8],
    zoom: 1.1,
  },
  // old vs fresh beans
  {
    at: T.kein,
    rel: SPOT_A,
    from: [0.15, 1.6, 2.3],
    to: [0.05, 1.42, 1.95],
    look: [-0.15, 0.35, 0],
    zoom: 2.05,
    whip: 1,
  },
  // payoff: hero shot, golden crema
  { at: T.genau, from: [1.3, 1.45, 2.4], to: [0.85, 1.2, 1.8], look: [0, 0.6, 0.75], zoom: 1.45 },
  // Übrigens: espresso vs filter mug
  { at: T.fakt, rel: SPOT_B, orbit: { c: [0, 0.5, 0], r: 2.9, y: 1.5, a0: -0.45, a1: 0.25 } },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Mahlwerk", at: T.mahlwerk, until: T.bohnen1, pos: [-0.35, 1.86, -0.1], side: -1 },
  { text: "Kolben", at: T.kolben, until: T.puck - 0.1, pos: [0.0, 1.5, 0.05], side: 1 },
  { text: "Puck", at: T.puck + 0.05, until: T.dann1, pos: [0.22, 1.1, 0.12], side: 1 },
  { text: "Pumpe", at: T.pumpe, until: T.neun - 0.2, pos: [0.3, 0.35, -0.55], side: -1 },
  { text: "Kohlendioxid", at: T.gas, until: T.der2, pos: [4.6, 0.95, 1.0], side: 1 },
  { text: "Crema", at: T.crema - 0.05, until: T.fakt, pos: [0.1, 0.44, 0.84], side: 1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "zoom", at: 0.35, amount: 0.25 },
  { kind: "flash", at: T.gepresst },
  { kind: "shake", at: T.gepresst, dur: 0.45, amp: 0.8 },
  { kind: "shake", at: T.kracht, dur: 0.6, amp: 0.7 },
  { kind: "zoom", at: T.staub, amount: 0.3 },
  { kind: "shake", at: T.quetscht + 0.25, dur: 0.45, amp: 1 },
  { kind: "zoom", at: T.puck, amount: 0.3 },
  { kind: "zoom", at: T.neun, amount: 0.3 },
  { kind: "flash", at: T.neunzig },
  { kind: "slowmo", at: T.schlaegt + 0.05, until: T.kein, speed: 0.35 },
  { kind: "flash", at: T.crema },
  { kind: "zoom", at: T.koffein, amount: 0.25 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "plaetschern", at: 0.0, db: -9 }, // frame 0: espresso running
  { s: "zisch", at: T.gepresst, dur: 0.7, db: -14 },
  { s: "click", at: T.knopf },
  { s: "mahlwerk", at: T.sofort + 0.05, db: -10 },
  { s: "rauschen", at: T.wasser1 - 0.1, dur: 1.2, db: -18 }, // kettle pours
  { s: "boing", at: T.gibt + 0.15, db: -12 },
  { s: "klack", at: T.quetscht + 0.25 },
  { s: "brumm", at: T.pumpe - 0.2, dur: T.espresso1 - T.pumpe, db: -17 },
  { s: "pop", at: T.espresso1 + 0.05 },
  { s: "pop", at: T.cappuccino + 0.05 },
  { s: "pop", at: T.hafer + 0.05 },
  { s: "rauschen", at: T.rate - 0.1, dur: 2.8, db: -20 }, // under water
  { s: "brumm", at: T.der2, dur: 2.0, db: -19 },
  { s: "plaetschern", at: T.schlaegt + 0.1, db: -12 },
  { s: "pop", at: T.kein + 0.05 },
  { s: "plaetschern", at: T.genau + 0.1, db: -10 },
  { s: "pop", at: T.fakt + 0.1 },
];
