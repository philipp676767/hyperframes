// Finale "Warum der Reaktor explodierte": the answer in the core (steam, rods
// out, graphite tips); the epilogue in empty Prypjat at dusk (a memorial);
// the Ferris wheel that never carried anyone; the end screen.
import { W, END } from "./timing.js";

export const T = {
  weil: W("Weil"),
  der: W("instabil") - 0.8,
  seine: W("seine"),
  und: W("Graphitspitzen") - 0.4,
  fach: W("Fachleute"),
  akimow: W("Akimow"),
  djatlow: W("Djatlow"),
  das: W("gelbe") - 0.2,
  es: W("Fahrgast") - 1.3,
  cta: W("angeblich") - 0.6,
  end: END,
};
const k = (x, y, z) => [x, -300 + y, z];

export const shots = [
  // the answer: the core
  { at: 0, from: k(-3, 5, 19), to: k(0, 4.6, 16), look: k(0, 3.6, -2), zoom: 1 },
  {
    at: T.weil - 0.2,
    orbit: { c: [0, -296.4, -2], r: 10, y: -294.5, a0: -0.7, a1: -0.2 },
    zoom: 1,
  },
  { at: T.der - 0.2, from: k(1.5, 5.6, 2.6), to: k(1.0, 5.3, 2.2), look: k(0.4, 5, -1.5), zoom: 1 },
  { at: T.seine - 0.2, from: k(-4, 11, 11), to: k(-3, 10.5, 10), look: k(0, 7, -2), zoom: 1 },
  { at: T.und - 0.2, from: k(0, 2.4, 14), to: k(0, 2.0, 12), look: k(0, 1.4, -2), zoom: 1 },
  { at: T.fach - 0.2, from: k(0, 6, 22), to: k(0, 7, 26), look: k(0, 3.6, -2), zoom: 1 },
  // epilogue: Prypjat at dusk, a memorial with carnations
  {
    at: T.akimow - 0.2,
    from: [3.3, 0.3, 6.1],
    to: [3.1, 0.28, 5.85],
    look: [2.5, 0.22, 5],
    zoom: 1,
    whoosh: true,
  },
  { at: T.djatlow - 0.2, from: [-26, 3.5, 26], to: [-22, 3.3, 22], look: [-6, 2, -12], zoom: 1 },
  // the yellow Ferris wheel
  { at: T.das - 0.2, from: [-5, 0.6, 7], to: [-4, 0.7, 6], look: [0, 1.7, -1], zoom: 1 },
  { at: T.es, from: [2, 0.25, 3.2], to: [1.6, 0.25, 2.8], look: [0, 1.9, -1], zoom: 1 },
  // end screen: calm, slow orbit (no tags in the middle band)
  { at: T.cta - 0.2, orbit: { c: [0, 1.4, -1], r: 5.6, y: 0.9, a0: 0.35, a1: 0.85 } },
];

export const LABELS = [
  {
    text: "Graphitspitzen",
    at: T.und + 0.4,
    until: T.fach - 0.4,
    pos: k(0.85, 1.2, -0.3),
    side: 1,
  },
];

export const HIGHLIGHTS = [];

export const SFX = [
  { s: "halle", at: 0, dur: T.akimow, db: -20 },
  { s: "wind", at: T.akimow - 0.2, dur: T.end - T.akimow, db: -18 },
  { s: "morgen", at: T.das, dur: T.end - T.das, db: -26 },
];
