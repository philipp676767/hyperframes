// #84 Föhn — every time-keyed decision as plain data (read by scene.js and
// scripts/build-sfx.mjs). Dryer at the origin, nozzle along +x, towel at x 3.6.
import { W } from "./timing.js";

export const PUSH = 2.25; // how far the dryer moves into the towel

export const T = {
  aus1: W("aus", 1),
  feuer: W("Feuer"),
  stell: W("Stell"),
  foehnst: W("föhnst"),
  ploetzlich: W("Plötzlich", 1),
  kaputt: W("Kaputt"),
  nein: W("Nein"),
  gerettet: W("gerettet"),
  hinter: W("Hinter"),
  gitter: W("Gitter"),
  aufgewickelt: W("aufgewickelter"),
  draht1: W("Draht", 1),
  ventilator: W("Ventilator"),
  wind1: W("Wind", 1),
  rate: W("Rate"),
  ueber: W("Über"),
  pizza: W("Pizzaofen"),
  kuehlt: W("kühlt"),
  aber: W("Aber"),
  handtuch: W("Handtuch"),
  staut: W("staut"),
  heizt: W("heizt"),
  bis: W("Bis"),
  brennt: W("brennt"),
  darum1: W("Darum", 1),
  streifen1: W("Streifen", 1),
  metallen: W("Metallen"),
  heiss2: W("heiß", 2),
  biegt1: W("biegt", 1),
  reisst: W("reißt"),
  klack: W("Klack"),
  bimetall: W("Bimetall"),
  hitze: W("Hitze"),
  der2: W("Strom", 2) - 0.08,
  weg: W("weg"),
  darum2: W("Darum", 2),
  fakt: W("Übrigens"),
  marke: W("Markenname"),
  wind2: W("Wind", 2),
  alpen: W("Alpen"),
  cta: W("Team", 1) - 0.1,
  folge: W("Folge"),
};

const B = [PUSH + 0.6, 0.45, 0]; // the bimetal strip while pushed into the towel

export const shots = [
  // hook: pressed into the towel, glowing, smoke — then klack, off
  { at: 0, from: [1.3, 1.1, 5.2], to: [1.9, 0.6, 4.0], look: [3.0, -0.1, 0.2], zoom: 1.2 },
  // macro on the contact point: the glow dies, smoke curls
  { at: T.feuer, from: [2.3, 1.3, 3.1], to: [2.75, 0.85, 2.45], look: [3.65, 0.15, 0], zoom: 1.0 },
  // establishing: the chalet bathroom, you blow-drying in the morning
  {
    at: T.stell,
    from: [-4.5, 3.4, 11.5],
    to: [-3.4, 2.7, 9.6],
    look: [-0.5, 0.8, -2.5],
    zoom: 1.0,
  },
  // close side: warm air
  { at: T.foehnst, from: [0.2, 0.7, 3.8], to: [0.3, 0.45, 3.2], look: [0.6, -0.35, 0], zoom: 1.2 },
  // suddenly silence: crash on the nozzle, glow fades
  { at: T.ploetzlich, from: [3.4, 0.45, 1.7], to: [3.0, 0.3, 1.3], look: [1.3, 0, 0], zoom: 1.1 },
  // broken? ✕
  { at: T.kaputt, from: [-3.0, 1.3, 3.8], to: [-2.6, 1.0, 3.1], look: [0, -0.5, 0], zoom: 1.2 },
  // behind the grill: the coil glows (straight into the nozzle)
  { at: T.hinter, from: [3.7, 0.3, 0.55], to: [2.85, 0.15, 0.35], look: [1.1, 0, 0], zoom: 1.0 },
  // x-ray side view: the coil
  { at: T.draht1, from: [0.1, 0.55, 3.4], to: [0.25, 0.4, 2.85], look: [0, 0, 0], zoom: 1.2 },
  // x-ray rear 3/4: the fan pushes air through the coil
  {
    at: T.ventilator,
    from: [-3.1, 0.9, 2.7],
    to: [-2.6, 0.65, 2.2],
    look: [-0.6, 0, 0],
    zoom: 1.1,
  },
  // solid: the warm wind blasts out and moves the towel
  {
    at: T.wind1,
    from: [5.6, 1.3, 4.6],
    to: [4.7, 1.0, 3.8],
    look: [1.6, 0, -0.4],
    zoom: 1.2,
    whip: 1,
  },
  // guess how hot: slow push into the glowing nozzle
  { at: T.rate, from: [3.1, 0.65, 1.3], to: [2.45, 0.35, 0.8], look: [1.3, 0, 0], zoom: 1.0 },
  // hotter than a pizza oven: the mini-set by the window
  {
    at: T.pizza,
    from: [8.2, -0.3, 3.4],
    to: [8.8, -0.7, 2.5],
    look: [9.6, -2.1, -2.6],
    zoom: 1.0,
    whip: -1,
  },
  // the air cools it: cold air into the rear
  { at: T.kuehlt, from: [-2.5, 0.9, 3.5], to: [-2.0, 0.7, 3.0], look: [-1.3, 0, 0], zoom: 1.3 },
  // but into the towel: wide 3/4, the dryer moves in
  { at: T.aber, from: [-1.6, 1.7, 6.8], to: [-0.9, 1.25, 5.8], look: [2.0, -0.3, 0], zoom: 1.2 },
  // x-ray: the air jams
  {
    at: T.staut,
    from: [2.0, 0.65, 3.1],
    to: [2.15, 0.5, 2.7],
    look: [PUSH + 0.2, 0, 0],
    zoom: 1.2,
  },
  // the wire heats on — until it burns
  {
    at: T.heizt,
    from: [2.9, 0.75, 2.0],
    to: [2.75, 0.55, 1.6],
    look: [PUSH + 0.6, 0, 0],
    zoom: 1.05,
  },
  // the strip of two metals
  { at: T.bis, from: [2.3, 1.1, 3.4], to: [2.6, 0.85, 2.8], look: [3.55, 0.25, 0], zoom: 1.1 },
  { at: T.darum1, from: [B[0] - 0.4, 1.05, 1.5], to: [B[0] - 0.25, 0.85, 1.2], look: B, zoom: 0.9 },
  // it heats up and bends (slowmo)
  {
    at: T.heiss2,
    from: [B[0] + 0.4, 0.95, 1.05],
    to: [B[0] + 0.25, 0.8, 0.85],
    look: B,
    zoom: 0.8,
  },
  // KLACK: power cut, the coil goes dark
  {
    at: T.klack,
    from: [1.2, 1.05, 2.7],
    to: [1.45, 0.85, 2.25],
    look: [PUSH + 0.2, 0.15, 0],
    zoom: 1.1,
  },
  // orbit the bimetal
  { at: T.bimetall, orbit: { c: B, r: 1.25, y: 0.45, a0: 0.7, a1: -0.15 }, zoom: 1.0 },
  // payoff: pulled back, quiet, the towel only smoking a little
  { at: T.hitze, from: [-1.1, 1.45, 5.6], to: [-0.5, 1.15, 4.9], look: [1.5, -0.2, 0], zoom: 1.2 },
  { at: T.darum2, from: [3.7, 0.85, 3.3], to: [3.1, 0.6, 2.85], look: [1.0, -0.4, 0], zoom: 1.2 },
  // Übrigens: whip to the window — the Alps
  {
    at: T.fakt,
    from: [7.6, 1.4, 3.5],
    to: [9.0, 2.4, -0.5],
    look: [11, 30, -260],
    zoom: 1.0,
    whip: 1,
  },
  // the warm wind from the Alps
  { at: T.wind2, from: [10.2, 3.2, -1.5], to: [10.8, 4.0, -3.4], look: [11, 50, -260], zoom: 1.0 },
  // CTA: back to the running dryer in your hand
  { at: T.cta, from: [2.7, 0.85, 3.5], to: [2.1, 0.55, 2.9], look: [0.6, -0.4, 0], zoom: 1.2 },
  { at: T.folge, from: [-0.7, 0.55, 3.1], to: [-0.4, 0.35, 2.6], look: [0.3, -0.3, 0], zoom: 1.25 },
];

export const LABELS = [
  { text: "Heizdraht", at: T.aufgewickelt, until: T.ventilator, pos: [0.6, 0, 0], side: -1 },
  { text: "Ventilator", at: T.ventilator + 0.1, until: T.wind1, pos: [-1.12, 0.2, 0], side: 1 },
  { text: "Bimetall", at: T.bimetall, until: T.hitze, pos: [B[0] + 0.1, B[1] + 0.05, 0], side: 1 },
];

export const HIGHLIGHTS = [
  { kind: "zoom", at: T.aus1, amount: 0.3 },
  { kind: "shake", at: T.aus1 + 0.05, dur: 0.3, amp: 0.45 },
  { kind: "zoom", at: T.ploetzlich, amount: 0.3 },
  { kind: "zoom", at: T.gerettet, amount: 0.25 },
  { kind: "zoom", at: T.draht1, amount: 0.3 },
  { kind: "flash", at: T.ueber },
  { kind: "zoom", at: T.ueber, amount: 0.35 },
  { kind: "slowmo", at: T.staut, until: T.heizt, speed: 0.45 },
  { kind: "flash", at: T.brennt },
  { kind: "shake", at: T.brennt, dur: 0.45, amp: 0.6 },
  { kind: "slowmo", at: T.biegt1, until: T.klack, speed: 0.4 },
  { kind: "flash", at: T.klack },
  { kind: "shake", at: T.klack + 0.02, dur: 0.35, amp: 0.5 },
  { kind: "zoom", at: T.weg, amount: 0.3 },
  { kind: "zoom", at: T.alpen, amount: 0.3 },
];

export const SFX = [
  { s: "foehn", at: 0, dur: T.aus1 + 0.08, db: -8 },
  { s: "knistern", at: 0, dur: 1.4, db: -16 },
  { s: "klack", at: T.aus1 + 0.06, db: -5 },
  { s: "foehn", at: T.stell, dur: T.ploetzlich - T.stell, db: -13 },
  { s: "pop", at: T.kaputt + 0.05 },
  { s: "foehn", at: T.hinter, dur: T.rate - T.hinter, db: -15 },
  { s: "pop", at: T.pizza + 0.1 },
  { s: "rauschen", at: T.kuehlt, dur: 0.9, db: -20 },
  { s: "foehn", at: T.handtuch, dur: T.klack - T.handtuch, db: -18 },
  { s: "surr", at: T.heizt, dur: 1.2, db: -20 },
  { s: "knistern", at: T.bis, dur: 0.85, db: -9 },
  { s: "klack", at: T.klack + 0.02, db: -3 },
  { s: "rauschen", at: T.wind2, dur: 1.0, db: -16 },
  { s: "foehn", at: T.cta, dur: 45 - T.cta, db: -19 },
];
