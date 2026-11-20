// Chapter 0 "Der Knopf für den Notfall": the archive announcement over the
// burning ruin, then Saturday 1:23 — the control room, the AZ-5 button, the
// blast; the three questions; the framing sentence + subscribe.
import { W, END } from "./timing.js";

export const T = {
  es: W("Es"),
  im: W("Im", 2),
  schicht: W("Schichtleiter"),
  leistung: W("Leistung"),
  drueckt: W("drückt"),
  notaus: W("Not-Aus", 1),
  er: W("Er"),
  statt: W("Stattdessen"),
  expl: W("explodiert"),
  wie: W("Wie", 2),
  warum: W("Warum"),
  wild: W("Wildschweine"),
  das: W("Das"),
  wenn: W("Wenn"),
  end: END,
};
const c = (x, y, z) => [x, 300 + y, z];
const k = (x, y, z) => [x, -300 + y, z];
const f = (x, y, z) => [x, 600 + y, z];
export const BOOM = T.expl + 0.25;

export const shots = [
  // cold open: the burning ruin at night, slow push
  { at: 0, from: [30, 7, 34], to: [22, 6.2, 26], look: [3, 5, 0], zoom: 1 },
  // Saturday, half past one: the intact plant, long and calm
  {
    at: T.es - 0.2,
    from: [-46, 3.2, 40],
    to: [-34, 3.0, 34],
    look: [-10, 4, -2],
    zoom: 1,
    whoosh: true,
  },
  // the control room
  {
    at: T.im - 0.1,
    from: c(-2.8, 1.75, 5.2),
    to: c(-1.2, 1.7, 4.4),
    look: c(0, 1.7, -3),
    zoom: 1,
    whoosh: true,
  },
  // Akimov at the desk
  {
    at: T.schicht,
    from: c(3.6, 1.75, 1.6),
    to: c(3.1, 1.7, 1.1),
    look: c(0.8, 1.35, -1.5),
    zoom: 1,
  },
  // the power display climbing, the rod field
  {
    at: T.leistung - 0.2,
    from: c(-1.4, 2.3, -0.6),
    to: c(-1.6, 2.35, -0.9),
    look: c(-1.3, 2.6, -4),
    zoom: 1,
  },
  // the button
  {
    at: T.drueckt - 0.3,
    from: c(1.15, 1.32, -0.95),
    to: c(1.0, 1.25, -1.1),
    look: c(0.62, 0.96, -1.85),
    zoom: 1,
  },
  // the rods start to fall (x-ray)
  {
    at: T.er - 0.1,
    from: k(-2, 6, 17),
    to: k(0, 5, 15),
    look: k(0, 3.6, -2),
    zoom: 1,
    whoosh: true,
  },
  // outside: block 4 — and the blast
  {
    at: T.statt - 0.2,
    from: [24, 3.5, 26],
    to: [23, 3.6, 25],
    look: [3, 6, 0],
    zoom: 1,
    whoosh: true,
  },
  // the questions over the burning ruin
  { at: T.wie, orbit: { c: [3, 5, -0.5], r: 15, y: 9, a0: 0.9, a1: 0.45 } },
  { at: T.warum, from: [-60, 4, 52], to: [-52, 4, 46], look: [-10, 5, -10], zoom: 1 },
  // Bavaria: a wild boar in the forest
  {
    at: T.wild - 0.3,
    from: f(2.6, 1.0, 3.6),
    to: f(2.2, 0.9, 3.1),
    look: f(0, 0.55, 0.3),
    zoom: 1,
    whoosh: true,
  },
  // the story of Tschernobyl: the ruin, the blue glow, pulling back
  {
    at: T.das - 0.2,
    from: [10, 9, 14],
    to: [20, 11, 24],
    look: [3, 6, -0.5],
    zoom: 1,
    whoosh: true,
  },
];

export const LABELS = [
  { text: "Block 4", at: T.statt + 0.1, until: BOOM - 0.1, pos: [5, 7.2, 1], side: -1 },
  {
    text: "Alexander Akimow",
    at: T.schicht + 0.6,
    until: T.schicht + 3.4,
    pos: c(1.2, 1.7, -0.9),
    side: 1,
  },
  { text: "Not-Aus", at: T.notaus - 0.5, until: T.er - 0.2, pos: c(0.62, 0.99, -1.85), side: -1 },
];

export const HIGHLIGHTS = [
  { kind: "flash", at: BOOM },
  { kind: "shake", at: BOOM, dur: 1.4, amp: 0.5 },
  { kind: "shake", at: BOOM + 2.2, dur: 0.8, amp: 0.35 },
];

export const SFX = [
  { s: "feuer", at: 0, dur: T.es, db: -18 },
  { s: "nacht", at: T.es - 0.2, dur: T.im - T.es, db: -16 },
  { s: "halle", at: T.im - 0.1, dur: T.er - T.im, db: -18 },
  { s: "knopf", at: T.notaus - 0.15, db: -8 },
  { s: "alarm", at: T.notaus + 0.3, dur: 3.5, db: -18 },
  { s: "rumpeln", at: T.statt - 0.3, db: -10 },
  { s: "explosion", at: BOOM, db: -4 },
  { s: "feuer", at: T.wie, dur: T.wild - T.wie, db: -16 },
  { s: "regen", at: T.wild - 0.3, dur: T.das - T.wild, db: -16 },
  { s: "feuer", at: T.das - 0.2, dur: T.end - T.das, db: -18 },
  { s: "wind", at: T.das - 0.2, dur: T.end - T.das, db: -20 },
];
