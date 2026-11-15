// Finale "Die Antwort": everyone knew what mattered; what is left on the Moon
// today; the laser mirror (Übrigens); the CTA; the 20-s end-screen shot.
import { W } from "./timing.js";

export const T = {
  weil: W("Weil"),
  computer: W("Computer"),
  armstrong: W("Armstrong"),
  ausweg: W("Ausweg"),
  filz: W("Filzstift"),
  nach: W("Nach"),
  handy: W("Handy"),
  fakt: W("Übrigens"),
  laser: W("Laser"),
  mond2: W("Mond", 2),
  naegel: W("Fingernägel"),
  cta: W("Hättest"),
  folge: W("Folge"),
};
export const HAND = [0, 450, 0];
const h = (x, y, z) => [HAND[0] + x, HAND[1] + y, HAND[2] + z];

export const shots = [
  { at: 0, from: [17, 5, 19], to: [13, 4.5, 15], look: [0, 3, 0], zoom: 1 },
  {
    at: T.computer,
    from: [0.3, 400.15, 1.3],
    to: [0.1, 400.08, 0.95],
    look: [0.05, 400.05, 0],
    zoom: 1,
  },
  { at: T.armstrong, from: [-9, 1.2, 10], to: [-8, 1.6, 9], look: [0, 3.5, 0], zoom: 1 },
  { at: T.ausweg, orbit: { c: [0, 3, 0], r: 15, y: 4, a0: -0.6, a1: 0.2 }, zoom: 1 },
  {
    at: T.filz,
    from: [0.55, 400.05, 0.6],
    to: [0.45, 400.02, 0.45],
    look: [0.3, 400, 0.12],
    zoom: 1,
    whip: 1,
  },
  { at: T.nach, from: [11, 3, 15], to: [9, 2.6, 12.5], look: [0, 1.5, 2], zoom: 1 },
  {
    at: T.handy,
    from: [0.95, 400.0, 0.75],
    to: [0.85, 399.98, 0.6],
    look: [0.75, 399.98, 0.15],
    zoom: 1,
  },
  { at: T.fakt, from: [-1, 2.6, 13], to: [-2.2, 2.2, 11.4], look: [-5, 0.6, 7], zoom: 1 },
  {
    at: T.laser,
    from: [-3.6, 0.8, 9.6],
    to: [-3.9, 0.9, 9.2],
    look: [-70, 95, -230],
    zoom: 1,
    focus: 6,
  },
  { at: T.mond2, from: [-2.2, 2.2, 11.4], to: [-3, 1.8, 10.2], look: [-5, 0.6, 7], zoom: 1 },
  {
    at: T.naegel,
    from: h(0.35, 0.18, 0.4),
    to: h(0.28, 0.14, 0.32),
    look: h(0, 0.02, 0.05),
    zoom: 1,
  },
  { at: T.cta, orbit: { c: [0, 6.5, 1], r: 24, y: 3.5, a0: 0.95, a1: 0.25 }, zoom: 1 },
];

export const LABELS = [
  { text: "Spiegel", at: T.fakt + 1.0, until: T.laser - 0.2, pos: [-5, 0.7, 7], side: 1 },
];

export const HIGHLIGHTS = [
  { kind: "zoom", at: T.weil + 2, amount: 0.25 },
  { kind: "zoom", at: T.filz, amount: 0.3 },
  { kind: "flash", at: T.laser + 0.2 },
  { kind: "zoom", at: T.naegel, amount: 0.25 },
];

export const SFX = [
  { s: "click", at: T.computer + 0.4, db: -12 },
  { s: "surr", at: T.laser + 0.2, dur: 3, db: -20 },
];
