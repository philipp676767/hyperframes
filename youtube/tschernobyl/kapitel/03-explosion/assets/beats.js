// Chapter 3 "1:23 Uhr": the test starts, steam bubbles, the design flaw (car
// analogy), AZ-5 at 1:23:40, the graphite tips, the power surge, the blast,
// the lid.
import { W, END } from "./timing.js";

export const T = {
  pumpen: W("Pumpen"),
  kanaelen: W("Kanälen"),
  und: W("hier") - 0.25,
  in: W("In", 2),
  wird: W("Wird"),
  es: W("Auto") - 0.7,
  um2: W("Um", 2),
  drueckt: W("drückt"),
  notaus: W("Not-Aus"),
  alle: W("Alle"),
  spitze: W("Spitze"),
  graphit: W("Graphit"),
  fuer: W("Moment") - 0.4,
  nach: W("Nach"),
  brenn: W("Brennstäbe"),
  zwei: W("zwei"),
  deckel: W("Deckel"),
  end: END,
};
export const BOOM = T.zwei - 0.4;
const c = (x, y, z) => [x, 300 + y, z];
const k = (x, y, z) => [x, -300 + y, z];

export const shots = [
  // 1:23 — the clock in the control room
  { at: 0, from: c(2.4, 2.9, -1.4), to: c(2.6, 3.0, -1.9), look: c(3.0, 3.3, -3.8), zoom: 1 },
  // the core: less water, more bubbles
  {
    at: T.pumpen - 0.2,
    from: k(-1, 5, 17),
    to: k(1, 4.6, 15),
    look: k(0, 3.6, -2),
    zoom: 1,
    whoosh: true,
  },
  {
    at: T.kanaelen - 0.2,
    from: k(1.4, 5.6, 2.4),
    to: k(0.9, 5.2, 2.1),
    look: k(0.4, 5, -1.5),
    zoom: 1,
  },
  // the flaw: wide
  { at: T.und - 0.2, orbit: { c: [0, -296.5, -2], r: 10, y: -293.8, a0: -0.5, a1: 0.3 }, zoom: 1 },
  {
    at: T.in - 0.2,
    from: k(2.2, 2.6, 2.8),
    to: k(1.5, 2.6, 2.4),
    look: k(0.4, 2.6, -1.5),
    zoom: 1,
  },
  { at: T.wird - 0.2, from: k(0, 6.5, 12), to: k(0, 5.5, 10), look: k(0, 4.5, -2), zoom: 1 },
  // the car that gets faster the hotter its engine
  {
    at: T.es - 0.2,
    from: [31, 0.26, -0.5],
    to: [31.2, 0.25, -0.55],
    look: [31.2, 0.12, -1.6],
    zoom: 1,
    whoosh: true,
  },
  // 1:23:40 — the button
  {
    at: T.um2 - 0.2,
    from: c(1.15, 1.32, -0.95),
    to: c(1.0, 1.25, -1.1),
    look: c(0.62, 0.96, -1.85),
    zoom: 1,
    whoosh: true,
  },
  // all rods start to move (rod display + core)
  {
    at: T.alle - 0.2,
    from: k(-4, 11, 11),
    to: k(-3, 10, 10),
    look: k(0, 6.5, -2),
    zoom: 1,
    whoosh: true,
  },
  // the graphite tip, close
  {
    at: T.spitze - 0.4,
    from: k(1.5, 1.6, 2.0),
    to: k(1.1, 1.8, 1.7),
    look: k(0.5, 2.0, -1.3),
    zoom: 1,
  },
  // gas instead of brake: the bottom of the core flares up
  { at: T.fuer - 0.2, from: k(0, 2.5, 15), to: k(0, 2.0, 13), look: k(0, 1.6, -2), zoom: 1 },
  // the power display explodes
  {
    at: T.nach - 0.2,
    from: c(-1.2, 2.7, -1.6),
    to: c(-1.4, 2.8, -2.4),
    look: c(-2.3, 2.9, -3.8),
    zoom: 1,
    whoosh: true,
  },
  // the core bursts
  { at: T.brenn - 0.2, from: k(0, 6, 18), to: k(0, 6.5, 20), look: k(0, 4, -2), zoom: 1 },
  // outside: two explosions
  {
    at: BOOM - 0.8,
    from: [24, 3.5, 26],
    to: [23, 3.6, 25],
    look: [3, 6, 0],
    zoom: 1,
    whoosh: true,
  },
  // the lid falls back askew
  { at: T.deckel - 0.2, from: [12, 13, 12], to: [10, 12.5, 10], look: [3, 5, -0.8], zoom: 1 },
];

export const LABELS = [
  {
    text: "Dampfblasen",
    at: T.kanaelen + 0.8,
    until: T.und - 0.3,
    pos: k(0.43, 5.6, -0.3),
    side: 1,
  },
  {
    text: "Steuerstäbe",
    at: T.alle + 0.6,
    until: T.spitze - 0.6,
    pos: k(-0.4, 8.6, -0.5),
    side: -1,
  },
  {
    text: "Graphitspitze",
    at: T.graphit - 0.2,
    until: T.fuer - 0.4,
    pos: k(0.85, 2.0, -0.3),
    side: 1,
  },
  {
    text: "Deckel, 1.000 Tonnen",
    at: T.deckel + 1.2,
    until: T.end - 0.5,
    pos: [2.7, 5.1, -0.6],
    side: 1,
  },
];

export const HIGHLIGHTS = [
  { kind: "shake", at: T.nach + 1.5, dur: 2.5, amp: 0.25 },
  { kind: "flash", at: T.brenn + 0.6 },
  { kind: "flash", at: BOOM },
  { kind: "shake", at: BOOM, dur: 1.4, amp: 0.5 },
  { kind: "shake", at: BOOM + 2.2, dur: 0.8, amp: 0.35 },
];

export const SFX = [
  { s: "halle", at: 0, dur: T.es, db: -18 },
  { s: "geiger", at: T.wird, dur: T.es - T.wird, db: -20 },
  { s: "bus", at: T.es - 0.2, dur: T.um2 - T.es, db: -22 },
  { s: "halle", at: T.um2 - 0.2, dur: BOOM - T.um2, db: -18 },
  { s: "knopf", at: T.notaus - 0.15, db: -8 },
  { s: "alarm", at: T.notaus + 0.3, dur: T.nach - T.notaus, db: -20 },
  { s: "surr", at: T.alle + 0.3, db: -16 },
  { s: "geiger", at: T.fuer, dur: T.nach - T.fuer, db: -14 },
  { s: "alarm", at: T.nach, dur: T.brenn - T.nach, db: -14 },
  { s: "rumpeln", at: T.nach + 1.0, db: -8 },
  { s: "explosion", at: BOOM, db: -4 },
  { s: "feuer", at: BOOM + 2, dur: T.end - BOOM - 2, db: -16 },
];
