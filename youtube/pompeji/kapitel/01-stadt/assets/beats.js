// Chapter 1 "Eine Stadt am Berg": the rich town, its streets, the
// amphitheatre, a snack bar; the green mountain; Spartacus in the crater;
// the earthquake of 62 and the scaffolding of 79; small tremors; the hint.
import { W, END } from "./timing.js";

export const T = {
  rund: W("Rund", 1),
  amphi: W("einem", 1),
  dutz: W("Dutzenden"),
  ueber: W("Über"),
  dass: W("Dass"),
  rund2: W("Rund", 3),
  krater: W("Krater"),
  dabei: W("Dabei"),
  erschuettert: W("erschüttert"),
  haeuser: W("Häuser"),
  siebzehn: W("Siebzehn"),
  kleine: W("Kleine"),
  beben: W("Beben"),
  was: W("Was"),
  tief: W("Tief"),
  end: END,
};

export const shots = [
  // a rich town: low over the roofs
  { at: 0, from: [-15, 5.5, 15], to: [-11, 4.6, 11], look: [2, 0, -1], zoom: 1 },
  // people in the main street
  {
    at: T.rund - 0.2,
    from: [9.5, 0.2, 2.42],
    to: [7.6, 0.21, 2.42],
    look: [-6, 0.45, 2.3],
    zoom: 1,
  },
  // the amphitheatre, full
  {
    at: T.amphi - 0.15,
    orbit: { c: [12.4, 0.3, 6.2], r: 6.5, y: 3.2, a0: 0.9, a1: 0.45 },
    zoom: 1,
  },
  // a snack bar at the corner
  {
    at: T.dutz - 0.2,
    from: [-2.4, 0.42, 7.6],
    to: [-2.7, 0.36, 7.3],
    look: [-3.55, 0.15, 6.15],
    zoom: 1,
  },
  // the green mountain above the town
  {
    at: T.ueber - 0.2,
    from: [1.5, 1.1, -11.4],
    to: [1.5, 1.7, -14.5],
    look: [0, 10, -62],
    zoom: 1,
  },
  // up towards the quiet summit
  { at: T.dass - 0.2, from: [6, 26, -24], to: [3, 25, -33], look: [0, 21, -62], zoom: 1 },
  // Spartacus' men climbing down on the vines
  {
    at: T.rund2 - 0.2,
    from: [2.2, 22.4, -54.3],
    to: [1.9, 22.3, -54.9],
    look: [0, 21.6, -55.8],
    zoom: 1,
  },
  {
    at: T.krater - 0.3,
    from: [3, 26.5, -52.5],
    to: [2.2, 26, -54.5],
    look: [0, 21.4, -61.5],
    zoom: 1,
  },
  // warnings: the earthquake of 62
  {
    at: T.dabei - 0.2,
    from: [8.8, 0.26, 2.42],
    to: [8.1, 0.27, 2.42],
    look: [-6, 0.6, 2.3],
    zoom: 1,
    whoosh: true,
  },
  {
    at: T.haeuser - 0.2,
    from: [7.6, 1.4, 5.6],
    to: [7.2, 1.3, 5.0],
    look: [5.6, 0.4, 2.0],
    zoom: 1,
  },
  // 17 years later: still scaffolding
  {
    at: T.siebzehn - 0.2,
    from: [3.0, 0.3, 2.52],
    to: [3.8, 0.3, 2.48],
    look: [7.5, 0.35, 2.0],
    zoom: 1,
    whoosh: true,
  },
  // small tremors, everyday life goes on in the forum
  {
    at: T.kleine - 0.2,
    from: [0.6, 0.3, 4.5],
    to: [0.35, 0.32, 3.7],
    look: [-0.2, 0.6, -4],
    zoom: 1,
  },
  // what nobody knows: towards the foot of the mountain, low and slow
  { at: T.was - 0.2, from: [10, 8.5, -24], to: [6, 8.2, -30], look: [0, 10, -62], zoom: 1 },
];

export const LABELS = [
  { text: "Amphitheater", at: T.amphi + 0.3, until: T.dutz - 0.4, pos: [12.4, 0.9, 4.0], side: 1 },
  { text: "Krater", at: T.krater, until: T.dabei - 0.5, pos: [0, 21.8, -61], side: 1 },
];

export const SFX = [
  { s: "stadt", at: 0, dur: T.ueber, db: -19 },
  { s: "wind", at: T.ueber - 0.2, dur: T.dabei - T.ueber, db: -20 },
  { s: "stadt", at: T.dabei - 0.2, dur: T.erschuettert - T.dabei + 0.2, db: -20 },
  { s: "beben", at: T.erschuettert, db: -6 },
  { s: "grollen", at: T.erschuettert - 0.3, db: -8 },
  { s: "einsturz", at: T.haeuser + 0.1, db: -6 },
  { s: "stadt", at: T.siebzehn - 0.2, dur: T.was - T.siebzehn, db: -20 },
  { s: "beben", at: T.beben, db: -16 },
  { s: "wind", at: T.was - 0.2, dur: T.end - T.was, db: -22 },
  { s: "grollen", at: T.tief + 0.4, db: -10 },
];

export const HIGHLIGHTS = [
  { kind: "shake", at: T.erschuettert, dur: 2.6, amp: 1.0 },
  { kind: "shake", at: T.beben, dur: 1.0, amp: 0.25 },
];
