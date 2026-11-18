// Chapter 6 "Das Schiff bricht": bow under, stern rising, props in the air,
// the ruler over the table edge, the load on the middle, lights out at 2:17,
// the break, the stern upright, gone at 2:20, the cold water, one boat returns.
import { W, END } from "./timing.js";

export const T = {
  heck: W("Heck", 1),
  schrauben: W("Schiffsschrauben"),
  lineal: W("Lineal"),
  je: W("Je"),
  nachgibt: W("nachgibt"),
  bei: W("Bei"),
  last: W("Last"),
  um: W("Um", 1),
  aus: W("aus", 2),
  krachen: W("Krachen"),
  bug: W("Bug", 2),
  senkrecht: W("senkrecht"),
  verschwindet: W("verschwindet"),
  viele: W("Viele"),
  wrack: W("Wrack"),
  wasser2: W("Wasser", 2),
  wer: W("Wer"),
  nur: W("Nur"),
  still: W("still"),
  end: END,
};
export const TABLE = [0, 150, 0];
const tb = (x, y, z) => [TABLE[0] + x, TABLE[1] + y, TABLE[2] + z];

export const shots = [
  { at: 0, from: [22, 0.6, 14], to: [19, 0.7, 12], look: [6, 0.4, 0], zoom: 1 },
  { at: T.heck, from: [-26, 1.0, 16], to: [-23, 1.2, 14], look: [-8, 2.5, 0], zoom: 1 },
  { at: T.schrauben, from: [-19, 1.2, 5], to: [-18, 1.4, 4.4], look: [-12.5, 2.4, 0], zoom: 1 },
  {
    at: T.lineal,
    from: tb(0.9, 0.55, 1.1),
    to: tb(0.8, 0.5, 0.95),
    look: tb(0.1, 0.0, 0),
    zoom: 1,
    whoosh: true,
  },
  { at: T.bei, from: [-4, 4, 24], to: [-2, 3.6, 22], look: [-2, 2.0, 0], zoom: 1, whoosh: true },
  { at: T.um, from: [6, 1.4, 16], to: [4.5, 1.3, 14.5], look: [-1, 2.2, 0], zoom: 1 },
  { at: T.krachen, from: [3, 1.2, 15], to: [2, 1.0, 13.5], look: [-2, 2.0, 0], zoom: 1 },
  { at: T.bug, from: [-16, 3, 22], to: [-15, 2.6, 20], look: [-6, 4, 0], zoom: 1 },
  {
    at: T.verschwindet - 1.0,
    from: [-12, 0.8, 18],
    to: [-11, 0.7, 16],
    look: [-4, 1.0, 0],
    zoom: 1,
  },
  { at: T.viele, from: [10, 2.4, 22], to: [8, 2.2, 20], look: [-2, 0, 0], zoom: 1 },
  { at: T.wasser2, from: [-6, 0.25, 6], to: [-5, 0.2, 5], look: [0, 0.05, 0], zoom: 1 },
  { at: T.nur, from: [12, 1.6, 12], to: [9, 1.4, 10], look: [2, 0.2, 3], zoom: 1 },
];

export const LABELS = [];

export const HIGHLIGHTS = [
  { kind: "shake", at: T.krachen, dur: 1.4, amp: 0.6 },
  { kind: "flash", at: T.aus + 0.1 },
];

export const SFX = [
  { s: "meer", at: 0, dur: T.lineal, db: -20 },
  { s: "wind", at: T.heck, dur: T.lineal - T.heck, db: -22 },
  { s: "klack", at: T.nachgibt, db: -8 },
  { s: "meer", at: T.bei, dur: T.end - T.bei, db: -20 },
  { s: "bruch", at: T.krachen - 0.1, db: -4 },
  { s: "rauschen", at: T.bug, dur: T.verschwindet + 1 - T.bug, db: -16 },
  { s: "wind", at: T.viele, dur: T.end - T.viele, db: -24 },
];
