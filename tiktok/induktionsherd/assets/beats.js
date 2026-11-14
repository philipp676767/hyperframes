// #82 Induktionsherd — every time-keyed decision as plain data (scene + sfx).
import { W } from "./timing.js";

export const T = {
  heiss: W("heiß"),
  leg: W("Leg"),
  kuehles: W("kühles"),
  sprudelt: W("sprudelt"),
  papier: W("Küchenpapier"),
  feuer: W("Feuer"),
  unter: W("Unter"),
  heizdraht: W("Heizdraht"),
  spule: W("Spule"),
  schnecke: W("Schnecke"),
  strom: W("Strom"),
  richtung: W("Richtung"),
  rate: W("Rate"),
  ueber: W("Über"),
  sekunde: W("Sekunde"),
  magnetfeld: W("Magnetfeld"),
  verrueckt: W("Verrückte"),
  luft: W("Luft"),
  eisen: W("Eisen"),
  zerrt: W("zerrt"),
  reiben: W("reiben"),
  gar: W("gar"),
  selbst: W("selbst"),
  darum: W("Darum"),
  fakt: W("Übrigens"),
  pfeift: W("pfeift"),
  hund: W("Hund"),
  haelt: W("Hält"),
  folge: W("Folge"),
};

// the hands-rubbing mini set floats in front of the window
export const RUB = [-7.2, 3.6, 0.6];
export const DOG = [2.6, 0, 2.15];

export const shots = [
  // 0–1.4 s: cover shot — boiling pot, the hand flat on the glass beside it, fast push-in
  { at: 0, from: [2.2, 1.7, 2.7], to: [1.35, 1.05, 1.75], look: [0.55, 0.3, 0.25] },
  // low across the glass: fingertips in front, the pot rolling behind
  {
    at: T.heiss,
    from: [-1.5, 0.75, 1.7],
    to: [-1.2, 0.6, 1.4],
    look: [0.5, 0.25, 0.3],
    zoom: 1.35,
  },
  // hand on the glass, from above
  { at: T.leg, from: [1.9, 2.1, 2.2], to: [1.5, 1.8, 1.8], look: [0.9, 0.1, 0.3] },
  // into the pot: rolling boil
  {
    at: T.sprudelt,
    from: [0.25, 1.25, 1.0],
    to: [0.12, 1.05, 0.75],
    look: [0, 0.45, 0.25],
    zoom: 1.3,
  },
  // side: the pot lifts, the paper slides under
  { at: T.papier, from: [-1.6, 0.9, 2.3], to: [-1.25, 0.75, 1.9], look: [0.1, 0.35, 0.25] },
  // low close on the paper edge — no fire
  { at: T.feuer, from: [1.2, 0.6, 1.5], to: [1.0, 0.48, 1.25], look: [0.1, 0.12, 0.35], zoom: 1.3 },
  // high angle, glass turns to x-ray: a ghost heating wire — nope
  { at: T.unter, from: [1.4, 2.6, 2.6], to: [1.2, 2.3, 2.2], look: [0.4, -0.1, 0.0] },
  // closer on the coil growing
  { at: T.spule, from: [0.9, 1.4, 1.6], to: [0.6, 1.2, 1.3], look: [0, -0.08, 0.25], zoom: 1.4 },
  // orbit low over the coil: current racing
  { at: T.strom, orbit: { c: [0, -0.05, 0.25], r: 1.2, y: 0.9, a0: 0.9, a1: 0.2 }, zoom: 1.4 },
  // wide: guess
  { at: T.rate, from: [2.2, 2.2, 3.0], to: [1.9, 1.9, 2.6], look: [0.4, 0.1, 0.1] },
  // crash in on the coil: 20,000 a second
  { at: T.ueber, from: [0.7, 0.9, 1.2], to: [0.45, 0.7, 0.95], look: [0, -0.05, 0.25], zoom: 1.3 },
  // side: field loops springing up and down
  {
    at: T.magnetfeld,
    from: [-1.9, 0.5, 1.6],
    to: [-1.6, 0.45, 1.3],
    look: [0, 0.05, 0.25],
    whip: 1,
  },
  // through the glass like air
  {
    at: T.verrueckt,
    from: [1.3, 0.25, 1.5],
    to: [1.05, 0.2, 1.2],
    look: [0, 0.05, 0.25],
    zoom: 1.35,
  },
  // the iron bottom catches it
  { at: T.eisen, from: [1.35, 0.5, 1.7], to: [1.15, 0.42, 1.45], look: [0, 0.15, 0.25], zoom: 1.5 },
  // x-ray pot from above: eddy currents swirling in the bottom
  { at: T.zerrt, from: [0.35, 1.5, 1.2], to: [0.2, 1.25, 0.95], look: [0, 0.08, 0.2], zoom: 1.25 },
  // analogy: hands rubbing in winter
  {
    at: T.reiben,
    rel: RUB,
    from: [0.9, 0.5, 2.2],
    to: [0.6, 0.35, 1.7],
    look: [0, 0, 0],
    zoom: 1.2,
  },
  // payoff: the pot heats itself — glowing bottom, steam
  { at: T.gar, orbit: { c: [0.2, 0.35, 0.25], r: 2.0, y: 1.1, a0: -0.5, a1: 0.3 } },
  // the hand back on the cool glass
  { at: T.darum, from: [2.0, 1.2, 2.0], to: [1.8, 1.0, 1.75], look: [0.8, 0.15, 0.3] },
  // Übrigens: the hob whines, the dog's ears go up
  { at: T.fakt, from: [3.4, 1.7, 4.4], to: [3.1, 1.5, 4.0], look: [1.4, 0.6, 1.0] },
  { at: T.hund, from: [3.4, 1.15, 3.6], to: [3.2, 1.05, 3.35], look: [2.4, 0.7, 2.0], zoom: 1.7 },
  // CTA: a magnet clacks onto the pot
  { at: T.haelt, from: [0.9, 0.7, 2.4], to: [0.6, 0.55, 2.0], look: [0, 0.35, 0.6], zoom: 1.3 },
];

export const LABELS = [
  { text: "Spule", at: T.spule + 0.2, until: T.strom, pos: [0.3, -0.07, 0.4], side: 1 },
  {
    text: "Magnetfeld",
    at: T.magnetfeld + 0.2,
    until: T.verrueckt,
    pos: [0.45, 0.22, 0.25],
    side: -1,
  },
  { text: "Eisen", at: T.eisen + 0.1, until: T.zerrt, pos: [0.3, 0.05, 0.62], side: 1 },
];

export const HIGHLIGHTS = [
  { kind: "zoom", at: 0.5, amount: 0.3 },
  { kind: "shake", at: T.papier + 1.05, dur: 0.35, amp: 0.6 },
  { kind: "zoom", at: T.feuer, amount: 0.25 },
  { kind: "flash", at: T.spule },
  { kind: "slowmo", at: T.richtung - 0.1, until: T.rate, speed: 0.4 },
  { kind: "flash", at: T.sekunde },
  { kind: "shake", at: T.sekunde, dur: 0.4, amp: 0.7 },
  { kind: "zoom", at: T.eisen, amount: 0.3 },
  { kind: "flash", at: T.selbst },
  { kind: "zoom", at: T.hund, amount: 0.3 },
  { kind: "shake", at: T.haelt + 0.45, dur: 0.3, amp: 0.5 },
];

export const SFX = [
  { s: "blubbern", at: 0, dur: T.unter, db: -14 }, // rolling boil from frame 0
  { s: "klack", at: T.papier + 1.05, db: -8 }, // pot lands on the paper
  { s: "surr", at: T.strom, dur: T.eisen - T.strom, db: -22 }, // current in the coil
  { s: "blubbern", at: T.gar, dur: T.fakt - T.gar, db: -16 },
  { s: "pfeifen", at: T.pfeift, dur: 2.2, db: -22 }, // the hob's high whine
  { s: "klack", at: T.haelt + 0.45, db: -6 }, // magnet clacks onto the pot
];
