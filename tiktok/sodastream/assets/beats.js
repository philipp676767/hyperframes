// Wassersprudler beats: every time-keyed decision as plain data, so scene.js
// (picture) and scripts/build-sfx.mjs (sound) read the same numbers.
// Keep this file free of three.js / DOM: it is imported by node too.
import { W } from "./timing.js";

// ---------------------------------------------------------------- layout
// Shared with scene.js (plain numbers only).
export const BZ = 0.2; // bottle axis z (x = 0) while screwed in
export const OUT = 0.85; // how far the bottle slides forward when unscrewed
export const WL = 1.45; // water level in the bottle (bottle-local y)
export const CYL = [0, 0, -0.35]; // CO2 cylinder axis
export const VALVE = [0.72, 2.42, 0.25]; // pressure relief valve on the head
export const MS = [-5.0, 0, 2.0]; // CO2-in-water molecule set
export const RT = [5.0, 0, 2.0]; // ice water glass set

// ---------------------------------------------------------------- beats
export const T = {
  kohlen: W("Kohlensäure"),
  gas1: W("Gas", 1),
  druck1: W("Druck", 1),
  lass: W("Lass"),
  sprudler: W("Sprudler"),
  stahl: W("Stahlflasche"),
  dioxid: W("Kohlendioxid"),
  gepresst: W("gepresst"),
  fluessig: W("flüssig"),
  zylinder: W("Zylinder"),
  knopf: W("Knopf"),
  druecken: W("drücken"),
  rohr: W("Rohr"),
  wasser1: W("Wasser", 1),
  duese: W("Düse"),
  blubbern: W("Blubbern"),
  reicht: W("Reicht"),
  hier: W("Hier"),
  trick: W("Trick"),
  dicht: W("dicht"),
  druck2: W("Druck", 2),
  presst: W("presst"),
  hoer: W("Hör"),
  brummen: W("Brummen"),
  ventil: W("Überdruckventil"),
  auf: W("Aufdrehen"),
  weg: W("weg"),
  sprudelt: W("sprudelt"),
  winzig: W("winziger"),
  saeure: W("Säure"),
  schau: W("Schau"),
  gerade: W("gerade"),
  uebrigens: W("Übrigens"),
  eiskalt: W("Eiskaltes"),
  doppelt: W("doppelt"),
  oft: W("oft"),
};
T.cta = T.oft - 0.1; // "Wie oft …" ("wie" is also spoken in the fact)

const rel = (p, d) => p.map((v, i) => v + d[i]);

// ---------------------------------------------------------------- shots
export const shots = [
  // hook: the bottle mid-fizz
  { at: 0, from: [0.7, 1.55, 1.9], to: [0.5, 1.45, 1.65], look: [0, 1.15, BZ], zoom: 1.9 },
  {
    at: T.kohlen,
    from: [-0.5, 1.05, 1.2],
    to: [-0.38, 1.0, 1.05],
    look: [0, 0.95, BZ],
    zoom: 1.6,
  },
  // "Nur Gas, mit Druck eingesperrt": CO2 molecules held in the water
  {
    at: T.gas1,
    from: rel(MS, [0.9, 1.25, 1.75]),
    to: rel(MS, [0.7, 1.15, 1.45]),
    look: rel(MS, [0, 0.75, 0]),
    zoom: 1.85,
  },
  // build: the machine shrinks away and pops back
  { at: T.lass, from: [2.0, 2.2, 4.3], to: [1.7, 2.0, 3.7], look: [0, 1.3, 0] },
  // cylinder in x-ray, from the side
  { at: T.stahl, from: [1.7, 1.35, 0.5], to: [1.45, 1.3, 0.35], look: [0, 1.0, -0.35], zoom: 1.75 },
  {
    at: T.gepresst,
    from: [-1.35, 1.1, 0.0],
    to: [-1.15, 1.05, -0.1],
    look: [0, 0.95, -0.35],
    zoom: 2.0,
  },
  // button on top
  { at: T.knopf, from: [0.8, 3.3, 1.6], to: [0.65, 3.2, 1.4], look: [0, 2.45, 0.1], zoom: 1.8 },
  // gas runs down the tube into the water
  { at: T.rohr, from: [0.45, 1.55, 2.1], to: [0.35, 1.4, 1.85], look: [0, 1.2, BZ], zoom: 1.55 },
  { at: T.duese, from: [0.45, 0.55, 1.0], to: [0.35, 0.5, 0.88], look: [0, 0.35, BZ], zoom: 1.25 },
  // bubbles just leave again
  {
    at: T.blubbern,
    from: [0.5, 1.8, 1.05],
    to: [0.4, 1.72, 0.92],
    look: [0, 1.55, BZ],
    zoom: 1.3,
  },
  // the trick: sealed bottle, pressure rises
  { at: T.hier, from: [-0.8, 2.0, 2.3], to: [-0.6, 1.9, 2.0], look: [0, 1.6, 0.1], zoom: 1.5 },
  {
    at: T.druck2,
    from: [0.6, 1.85, 1.3],
    to: [0.5, 1.8, 1.15],
    look: [0, 1.55, BZ],
    zoom: 1.75,
  },
  { at: T.presst, from: [-0.55, 1.25, 1.3], to: [-0.45, 1.2, 1.15], look: [0, 1.1, BZ], zoom: 1.8 },
  // listen: the relief valve buzzes
  {
    at: T.hoer,
    from: rel(VALVE, [0.75, 0.1, 0.8]),
    to: rel(VALVE, [0.6, 0.05, 0.68]),
    look: rel(VALVE, [-0.1, -0.3, 0]),
    zoom: 1.5,
  },
  // unscrew: the bottle slides out, pressure gone, it fizzes
  { at: T.auf, from: [1.7, 1.6, 3.1], to: [1.45, 1.5, 2.8], look: [0, 1.0, 0.6] },
  {
    at: T.sprudelt,
    from: [0.5, 1.3, BZ + OUT + 1.0],
    to: [0.4, 1.2, BZ + OUT + 0.85],
    look: [0, 1.0, BZ + OUT],
    zoom: 1.9,
  },
  // only a tiny part turns into real acid
  {
    at: T.winzig,
    from: rel(MS, [-0.8, 1.05, 1.45]),
    to: rel(MS, [-0.6, 0.95, 1.2]),
    look: rel(MS, [0, 0.75, 0]),
    zoom: 1.8,
  },
  // outro: x-ray off, drone pull-back
  { at: T.schau, from: [0.9, 1.6, 3.7], to: [0.6, 1.5, 3.2], look: [0, 1.2, 0.35] },
  {
    at: T.gerade,
    from: [2.8, 2.4, 5.3],
    to: [5.5, 4.4, 9.6],
    look: [0, 1.2, 0],
    lookTo: [0, 0.8, 0],
  },
  // bonus fact: ice water glass
  {
    at: T.uebrigens,
    from: rel(RT, [0.6, 1.2, 1.75]),
    to: rel(RT, [0.45, 1.1, 1.5]),
    look: rel(RT, [0.1, 0.55, 0]),
    zoom: 1.75,
  },
  // CTA: wide drone shot of the beach
  {
    at: T.cta,
    from: [4.5, 3.8, 8.5],
    to: [9.5, 8.0, 17],
    look: [0, 1.2, 0],
    lookTo: [0, 0.6, 0],
  },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "CO₂", at: T.gas1 + 0.1, until: T.lass, pos: rel(MS, [0.05, 0.72, 0.25]), side: 1 },
  { text: "CO₂", at: T.dioxid, until: T.gepresst, pos: [0.2, 1.1, CYL[2]], side: 1 },
  { text: "Zylinder", at: T.zylinder, until: T.knopf, pos: [-0.21, 1.2, CYL[2]], side: -1 },
  { text: "Düse", at: T.duese, until: T.blubbern, pos: [0.03, 0.32, BZ], side: 1 },
  { text: "Überdruckventil", at: T.ventil, until: T.auf, pos: rel(VALVE, [0.06, 0, 0]), side: -1 },
  {
    text: "Eiskalt",
    at: T.eiskalt + 0.2,
    until: T.doppelt,
    pos: rel(RT, [0.55, 0.3, 0.1]),
    side: 1,
  },
  { text: "×2 Gas", at: T.doppelt, until: T.cta, pos: rel(RT, [0.1, 0.55, 0.3]), side: 1 },
  { text: "Säure", at: T.saeure, until: T.schau, pos: rel(MS, [0.0, 0.62, 0.3]), side: 1 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "rauschen", at: 0.05, dur: T.lass - 0.15, db: -24 }, // fizzing bottle in the hook
  { s: "pop", at: T.lass + 0.5 }, // machine pops back in
  { s: "pop", at: T.stahl + 0.1 }, // cylinder
  { s: "click", at: T.druecken }, // button
  { s: "zisch", at: T.druecken + 0.25, dur: 1.6, db: -20 }, // gas leaves the cylinder
  { s: "pop", at: T.rohr }, // tube grows
  { s: "rauschen", at: T.wasser1, dur: T.hier - T.wasser1, db: -22 }, // bubbling
  { s: "klack", at: T.dicht, db: -18 }, // sealed
  { s: "surr", at: T.druck2, dur: T.brummen - T.druck2, db: -24 }, // pressure building
  { s: "brumm", at: T.brummen, dur: T.auf - T.brummen, db: -15 }, // the buzz
  { s: "zisch", at: T.ventil + 0.4, dur: 0.6, db: -19 },
  { s: "zisch", at: T.auf + 0.25, dur: 1.0, db: -16 }, // pressure gone
  { s: "rauschen", at: T.sprudelt, dur: T.winzig - T.sprudelt, db: -19 },
  { s: "pop", at: T.uebrigens + 0.3 }, // ice glass
  { s: "rauschen", at: T.eiskalt, dur: T.cta - T.eiskalt - 0.2, db: -25 },
];
