// Chapter 4 "Die Rettungsfahrt": Pliny the Elder at Misenum, the call for
// help, the warships into the stone rain, "Den Tapferen hilft das Glück",
// Stabiae, the sleep; the re-hook: the column collapses at midnight, the
// first flow runs down to Herculaneum, the boat houses; the comment question.
import { W, END } from "./timing.js";

export const T = {
  kurz: W("Kurz"),
  er: W("Er", 1),
  als: W("Als"),
  den: W("Tapferen") - 0.3,
  kueste: W("Küste"),
  dort: W("Dort", 1),
  jetzt: W("Jetzt"),
  gegen: W("Gegen"),
  zusammen: W("zusammenfällt"),
  was: W("Was"),
  herc: W("Herculaneum"),
  dort2: W("Dort", 2),
  haettest: W("Hättest"),
  denn: W("Denn"),
  end: END,
};
export const COLLAPSE = T.zusammen;

export const shots = [
  // Misenum: the fleet in the harbour, the cloud across the bay
  { at: 0, from: [-66, 1.8, 50], to: [-65, 1.7, 48.6], look: [-30, 12, -20], zoom: 1 },
  {
    at: W("Befehlshaber") - 0.2,
    from: [-70.3, 0.55, 43.6],
    to: [-70.6, 0.5, 43.3],
    look: [-72.2, 0.33, 42.1],
    zoom: 1,
  },
  // the call for help: a villa at the foot of the mountain
  {
    at: T.kurz - 0.2,
    from: [-42, 3, 2],
    to: [-40, 3.2, -1],
    look: [-8, 16, -55],
    zoom: 1,
    whoosh: true,
  },
  // the ships row into the stone rain
  {
    at: T.er - 0.2,
    from: [-37.5, 1.3, 27.5],
    to: [-37.8, 1.2, 26.6],
    look: [-41, 0.7, 21.5],
    zoom: 1,
    whoosh: true,
  },
  // the stern: the helmsman wants to turn back
  {
    at: T.als - 0.2,
    from: [-36.4, 0.8, 22.6],
    to: [-36.6, 0.78, 22.3],
    look: [-38.4, 0.45, 21.0],
    zoom: 1,
  },
  // the coast is blocked: on to Stabiae
  {
    at: T.kueste - 0.2,
    from: [36, 2.5, 30],
    to: [34, 2.2, 27],
    look: [28, 0.4, 19],
    zoom: 1,
    whoosh: true,
  },
  // the villa at night: he sleeps
  {
    at: T.dort - 0.2,
    from: [33.6, 0.9, 20.2],
    to: [33.0, 0.85, 19.5],
    look: [31, 0.35, 16.5],
    zoom: 1,
  },
  // re-hook: towards the column in the dark
  {
    at: T.jetzt - 0.2,
    from: [-34, 5, 24],
    to: [-31, 5.5, 19],
    look: [0, 26, -62],
    zoom: 1,
    whoosh: true,
  },
  // midnight: the column collapses
  { at: T.gegen - 0.2, from: [-70, 22, 40], to: [-66, 23, 36], look: [0, 40, -62], zoom: 1 },
  // the flow runs down to Herculaneum
  { at: T.was - 0.2, from: [-62, 12, 4], to: [-60, 11.5, 0], look: [-24, 8, -38], zoom: 1 },
  { at: T.herc - 0.3, from: [-50, 4, -4], to: [-49, 3.6, -6], look: [-43, 0.8, -15], zoom: 1 },
  // the boat houses on the beach
  {
    at: T.dort2 - 0.2,
    from: [-40.6, 0.45, -8.4],
    to: [-40.8, 0.42, -9.0],
    look: [-42.6, 0.4, -14.4],
    zoom: 1,
  },
  // comment question: the bay in the dark
  { at: T.haettest - 0.2, from: [-60, 10, 30], to: [-56, 10, 26], look: [-30, 6, -30], zoom: 1 },
  // Pompeii next
  { at: T.denn - 0.2, from: [14, 8, 16], to: [11, 7, 12], look: [0, 1, -2], zoom: 1, whoosh: true },
];

export const LABELS = [
  { text: "Herculaneum", at: T.herc, until: T.dort2 - 0.4, pos: [-43, 1, -15.5], side: 1 },
  {
    text: "Bootshäuser",
    at: T.dort2 + 1.2,
    until: T.haettest - 0.4,
    pos: [-42.4, 0.5, -13.9],
    side: 1,
  },
];

export const SFX = [
  { s: "meer", at: 0, dur: T.kurz, db: -18 },
  { s: "saeule", at: 0, dur: T.end, db: -24 },
  { s: "wind", at: T.kurz - 0.2, dur: T.er - T.kurz, db: -20 },
  { s: "ruder", at: T.er - 0.2, dur: T.kueste - T.er, db: -14 },
  { s: "steinregen", at: T.er, dur: T.kueste - T.er, db: -18 },
  { s: "meer", at: T.kueste - 0.2, dur: T.jetzt - T.kueste, db: -16 },
  { s: "grollen", at: T.gegen, db: -8 },
  { s: "glut", at: COLLAPSE + 0.5, dur: T.haettest - COLLAPSE, db: -10 },
  { s: "meer", at: T.dort2, dur: T.denn - T.dort2, db: -20 },
  { s: "steinregen", at: T.denn, dur: T.end - T.denn, db: -18 },
];

export const HIGHLIGHTS = [{ kind: "shake", at: COLLAPSE, dur: 1.4, amp: 0.6 }];
