// Chapter 4 "Das Eiswürfel-Problem": Andrews and Smith go below, the long thin
// gash, water pouring in, 6 of 16 rooms, bulkheads ending at E deck, the ice-
// cube tray in the sink, the bow going down room by room, 1–1.5 hours, boats.
import { W, END } from "./timing.js";

export const T = {
  andrews: W("Andrews", 1),
  was: W("Was"),
  aufgeschlitzt: W("aufgeschlitzt"),
  durch: W("Durch"),
  zehn: W("zehn"),
  betroffen: W("Betroffen"),
  sechs: W("sechs"),
  vier: W("vier"),
  grund: W("Grund"),
  enden: W("enden"),
  stell: W("Stell"),
  faecher: W("Fächer"),
  schwappt: W("schwappt"),
  uebernaechste: W("übernächste"),
  genau: W("Genau"),
  andrews2: W("Andrews", 2),
  anderthalb: W("anderthalb"),
  bord: W("Bord"),
  end: END,
};
export const SINK = [0, 150, 0];
const sk = (x, y, z) => [SINK[0] + x, SINK[1] + y, SINK[2] + z];

export const shots = [
  { at: 0, from: [11.5, 2.4, 3.2], to: [10.5, 2.3, 3.0], look: [7.4, 1.9, 0.6], zoom: 1 },
  { at: T.andrews + 1.2, from: [12, 1.2, 6], to: [10, 1.0, 5.5], look: [9, 0.2, 0], zoom: 1 },
  { at: T.was, from: [10, -0.2, 4.2], to: [8, -0.25, 4.0], look: [8.5, -0.4, 1.2], zoom: 1 },
  { at: T.durch, from: [11, 0.6, 3.6], to: [10.4, 0.5, 3.3], look: [9, -0.5, 0.6], zoom: 1 },
  { at: T.betroffen, from: [6, 6, 13], to: [7, 5.5, 12], look: [6, -0.3, 0], zoom: 1 },
  { at: T.grund, from: [8.2, 0.9, 3.6], to: [7.6, 0.8, 3.3], look: [7.2, 0.2, 0], zoom: 1 },
  {
    at: T.stell,
    from: sk(1.4, 1.1, 1.6),
    to: sk(1.2, 0.95, 1.4),
    look: sk(0, -0.05, 0),
    zoom: 1,
    whoosh: true,
  },
  { at: T.genau, from: [2, 2.4, 13], to: [4, 2.2, 12], look: [6, -0.2, 0], zoom: 1, whoosh: true },
  { at: T.andrews2, from: [-6, 3.5, 22], to: [-3, 3.2, 20], look: [2, 1.2, 0], zoom: 1 },
  {
    at: T.bord - 0.6,
    from: [5.6, 2.4, 3.0],
    to: [5.0, 2.35, 2.8],
    look: [4.4, 1.95, 1.18],
    zoom: 1,
  },
];

export const LABELS = [
  { text: "Thomas Andrews", at: T.andrews, until: T.andrews + 3, pos: [7.3, 2.0, 0.7], side: -1 },
  { text: "Schotten", at: T.enden - 0.5, until: T.stell - 0.2, pos: [7.2, 0.4, 0.9], side: 1 },
];

export const HIGHLIGHTS = [];

export const SFX = [
  { s: "meer", at: 0, dur: T.stell, db: -22 },
  { s: "rauschen", at: T.durch, dur: T.stell - T.durch, db: -18 },
  { s: "rauschen", at: T.faecher, dur: T.genau - T.faecher, db: -20 },
  { s: "meer", at: T.genau, dur: T.end - T.genau, db: -22 },
  { s: "rauschen", at: T.genau, dur: T.andrews2 - T.genau, db: -22 },
];
