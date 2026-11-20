// Chapter 2 "Ein Test in der Nacht": the test, Kiev wants the power, the night
// shift, Dyatlov + Toptunov, the power falls (xenon), the rods come out.
import { W, END } from "./timing.js";

export const T = {
  wenn: W("Wenn"),
  koennen: W("Können"),
  mehrere: W("Mehrere"),
  doch: W("Doch"),
  die: W("Leitung", 1) - 0.4,
  djatlow: W("Djatlow"),
  am: W("Am", 1),
  toptunow: W("Toptunow"),
  kurz: W("Kurz"),
  schuld: W("Schuld"),
  xenon: W("Xenon"),
  um: W("Um"),
  ziehen: W("ziehen"),
  ende: W("Ende"),
  acht: W("acht"),
  der: W("läuft") - 0.9,
  genau: W("Genau"),
  end: END,
};
const c = (x, y, z) => [x, 300 + y, z];
const k = (x, y, z) => [x, -300 + y, z];

export const shots = [
  // the plant at night, the turbine hall glowing
  { at: 0, from: [-70, 4, 26], to: [-56, 4, 24], look: [-30, 2, -6], zoom: 1 },
  // power lines leaving the plant
  { at: T.wenn - 0.2, from: [-16, 3.0, -18], to: [-19, 3.2, -21], look: [-28, 3.6, -56], zoom: 1 },
  // the turbine (x-ray) running down
  {
    at: T.koennen - 0.2,
    from: k(15, 10.5, 6),
    to: k(14.2, 10.2, 5.2),
    look: k(12, 9, -1),
    zoom: 1,
    whoosh: true,
  },
  {
    at: T.mehrere - 0.2,
    from: [20, 2.5, 22],
    to: [16, 2.8, 19],
    look: [2, 5, -2],
    zoom: 1,
    whoosh: true,
  },
  // Kiev wants the power: the lines into the night
  { at: T.doch - 0.2, orbit: { c: [-30, 3, -50], r: 22, y: 6, a0: 2.2, a1: 1.6 } },
  // the control room: Dyatlov
  {
    at: T.die - 0.2,
    from: c(-3.4, 1.8, 3.6),
    to: c(-2.9, 1.75, 3.0),
    look: c(-1.2, 1.5, 0.4),
    zoom: 1,
    whoosh: true,
  },
  // Toptunov at the desk
  {
    at: T.am - 0.2,
    from: c(2.0, 1.7, 0.6),
    to: c(1.7, 1.65, 0.3),
    look: c(0.25, 1.4, -0.75),
    zoom: 1,
  },
  // the power display falling, the clock past midnight
  {
    at: T.kurz - 0.2,
    from: c(-1.0, 2.5, -1.2),
    to: c(-1.3, 2.6, -1.8),
    look: c(-2.0, 2.9, -3.8),
    zoom: 1,
  },
  // xenon in the core
  {
    at: T.schuld - 0.2,
    from: k(0, 4.5, 16),
    to: k(0, 4.2, 14),
    look: k(0, 3.6, -2),
    zoom: 1,
    whoosh: true,
  },
  {
    at: T.xenon - 0.2,
    from: k(1.6, 3.2, 2.4),
    to: k(1.0, 3.0, 2.0),
    look: k(0.4, 3.0, -1.5),
    zoom: 1,
  },
  // rods being pulled: lamps of the rod display going dark
  {
    at: T.um - 0.2,
    from: c(0.6, 2.2, -0.6),
    to: c(0.3, 2.15, -1.0),
    look: c(0, 2.05, -4),
    zoom: 1,
    whoosh: true,
  },
  { at: T.ziehen + 0.8, from: k(-5, 11, 10), to: k(-3, 10, 9), look: k(0, 7, -2), zoom: 1 },
  // only about eight left
  { at: T.ende - 0.2, from: c(0, 2.05, -1.2), to: c(0, 2.05, -1.6), look: c(0, 2.05, -4), zoom: 1 },
  // the weak reactor, brake almost off
  { at: T.der - 0.2, from: k(-2, 5, 18), to: k(2, 4.6, 16), look: k(0, 3.6, -2), zoom: 1 },
  // block 4 in the dark, waiting
  {
    at: T.genau - 0.2,
    from: [16, 1.6, 20],
    to: [13, 2.2, 17],
    look: [3, 6, 0],
    zoom: 1,
    whoosh: true,
  },
];

export const LABELS = [
  { text: "Turbine", at: T.koennen + 0.6, until: T.mehrere - 0.4, pos: k(12, 9.8, -1), side: -1 },
  { text: "nach Kiew", at: T.doch + 1.4, until: T.die - 0.6, pos: [-22.5, 3.9, -104], side: 1 },
  {
    text: "Anatoli Djatlow",
    at: T.djatlow - 0.2,
    until: T.am - 0.4,
    pos: c(-1.2, 1.9, 0.6),
    side: 1,
  },
  {
    text: "Leonid Toptunow",
    at: T.toptunow - 0.2,
    until: T.kurz - 0.6,
    pos: c(0.25, 1.8, -0.75),
    side: 1,
  },
  { text: "Xenon", at: T.xenon, until: T.um - 0.4, pos: k(0.2, 3.0, -0.8), side: 1 },
];

export const HIGHLIGHTS = [];

export const SFX = [
  { s: "nacht", at: 0, dur: T.koennen, db: -16 },
  { s: "halle", at: 0, dur: T.die, db: -22 },
  { s: "brumm", at: T.koennen, dur: 3, db: -18 },
  { s: "nacht", at: T.mehrere - 0.2, dur: T.die - T.mehrere, db: -18 },
  { s: "halle", at: T.die - 0.2, dur: T.end - T.die, db: -20 },
  { s: "piep", at: T.kurz + 1.2, db: -20 },
  { s: "klack", at: T.ziehen + 0.2, db: -16 },
  { s: "klack", at: T.ziehen + 0.9, db: -18 },
  { s: "klack", at: T.ziehen + 1.6, db: -18 },
  { s: "klack", at: T.ziehen + 2.3, db: -20 },
  { s: "nacht", at: T.genau - 0.2, dur: T.end - T.genau, db: -16 },
];
