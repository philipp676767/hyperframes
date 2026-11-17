// Finale "Warum sie wirklich sank": the chain of causes (speed, no waves, low
// bulkheads, old rules, the silent radio), the epilogue (Bride on the upturned
// boat, Rostron, Millvina Dean), the wreath on 15 April, the bow below, and the
// 20-s end screen on the bow in the dark.
import { W, END } from "./timing.js";

export const T = {
  nicht: W("Nicht"),
  geschwindigkeit: W("Geschwindigkeit"),
  wellen: W("Wellen"),
  schotten: W("Schotten"),
  regeln: W("Regeln"),
  funkgeraet: W("Funkgerät"),
  kapitaen: W("Kapitän"),
  bride: W("Bride"),
  rostron: W("Rostron"),
  millvina: W("Millvina"),
  eispatrouille: W("Eispatrouille"),
  kranz: W("Kranz"),
  fast: W("Fast"),
  und: W("Und", 2),
  end: END,
};
export const DEP = [0, -320, 0];
const dep = (x, y, z) => [DEP[0] + x, DEP[1] + y, DEP[2] + z];
export const CAL = [-30, 0, -26];
export const WREATH = [4, 0, 14];

export const shots = [
  { at: 0, from: [-24, 3, 18], to: [-18, 2.6, 15], look: [2, 1.4, 0], zoom: 1 },
  { at: T.geschwindigkeit, from: [16, 0.4, 3], to: [15, 0.45, 2.6], look: [11, 0.9, 0], zoom: 1 },
  { at: T.wellen, from: [26, 0.3, 6], to: [24, 0.3, 5], look: [30, 0.8, 1], zoom: 1 },
  { at: T.schotten, from: [6, 5, 12], to: [7, 4.6, 11], look: [6, -0.3, 0], zoom: 1 },
  { at: T.regeln, from: [6.5, 2.6, 3.4], to: [5.6, 2.5, 3.1], look: [4.8, 1.95, 1.1], zoom: 1 },
  { at: T.funkgeraet, from: [-24, 1.6, -16], to: [-25, 1.5, -18], look: CAL, zoom: 1 },
  {
    at: T.kapitaen,
    from: dep(9.5, 1.6, 13.5),
    to: dep(8.0, 1.3, 12.0),
    look: dep(7.5, -0.2, 3.6),
    zoom: 1,
    whoosh: true,
  },
  {
    at: T.bride,
    from: [-6, 0.7, 26],
    to: [-5, 0.6, 24],
    look: [-8, 0.1, 20],
    zoom: 1,
    whoosh: true,
  },
  { at: T.rostron, from: [-20, 2, 34], to: [-18, 1.8, 31], look: [-26, 1, 24], zoom: 1 },
  { at: T.millvina, from: [-2, 0.5, 30], to: [-1.5, 0.45, 28.5], look: [-3.5, 0.1, 26], zoom: 1 },
  { at: T.eispatrouille, from: [10, 2.4, 22], to: [8, 1.8, 19], look: WREATH, zoom: 1 },
  {
    at: T.fast,
    from: dep(18, 4, 14),
    to: dep(16, 2.5, 12),
    look: dep(9, 0.2, 4.5),
    zoom: 1,
    whoosh: true,
  },
  { at: T.und, orbit: { c: dep(7, -0.2, 3.5), r: 13, y: DEP[1] + 1.2, a0: 1.1, a1: 0.55 } },
];

export const LABELS = [];
export const HIGHLIGHTS = [];

export const SFX = [
  { s: "meer", at: 0, dur: T.kapitaen, db: -22 },
  { s: "tauchen", at: T.kapitaen, dur: T.bride - T.kapitaen, db: -16 },
  { s: "meer", at: T.bride, dur: T.fast - T.bride, db: -22 },
  { s: "tauchen", at: T.fast, dur: T.end - T.fast, db: -16 },
];
