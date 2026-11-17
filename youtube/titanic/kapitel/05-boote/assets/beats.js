// Chapter 5 "Halb leere Boote" (re-hook): CQD / SOS from the radio room, the
// Carpathia far away turning, the Californian close enough to see the rockets,
// her operator asleep, the calm lit ship, boat 7 lowered with 28 of 65, the band,
// the comment question, the last boat gone, 1,500 still aboard.
import { W, END } from "./timing.js";

export const T = {
  kurz: W("Kurz"),
  sos: W("SOS"),
  kommt: W("Kommt"),
  naechste: W("nächste"),
  rostron: W("Rostron"),
  dabei: W("Dabei"),
  notraketen: W("Notraketen"),
  funker: W("Funker"),
  deck: W("Deck"),
  schiff2: W("Schiff", 2),
  um: W("Um", 2),
  platz: W("Platz", 1),
  darin: W("Darin"),
  frauen: W("Frauen"),
  bordkapelle: W("Bordkapelle"),
  haettest: W("Hättest"),
  denn: W("Denn"),
  end: END,
};
export const RAD = [0, 300, 0];
const rad = (x, y, z) => [RAD[0] + x, RAD[1] + y, RAD[2] + z];
export const CAL = [-34, 0, -46];
const cal = (x, y, z) => [CAL[0] + x, CAL[1] + y, CAL[2] + z];
export const CARP = [70, 0, -70];
const crp = (x, y, z) => [CARP[0] + x, CARP[1] + y, CARP[2] + z];

export const shots = [
  { at: 0, from: [30, 2.0, 20], to: [24, 1.6, 16], look: [2, 1.5, 0], zoom: 1 },
  {
    at: T.kurz,
    from: rad(0.85, 0.8, 0.15),
    to: rad(0.72, 0.74, 0.02),
    look: rad(0.12, 0.6, -0.7),
    zoom: 1,
    whoosh: true,
  },
  {
    at: T.kommt - 0.1,
    from: rad(0.5, 0.75, -0.3),
    to: rad(0.45, 0.72, -0.38),
    look: rad(0.25, 0.68, -0.7),
    zoom: 1,
  },
  {
    at: T.naechste,
    from: crp(6, 1.6, 8),
    to: crp(5, 1.4, 6.5),
    look: crp(0, 0.6, 0),
    zoom: 1,
    whoosh: true,
  },
  { at: T.rostron, from: crp(-4, 3.5, 9), to: crp(-5, 3.2, 8), look: crp(0, 0.5, 0), zoom: 1 },
  {
    at: T.dabei,
    from: cal(1.2, 1.1, 1.0),
    to: cal(1.4, 1.1, 1.3),
    look: [0, 3.5, 0],
    zoom: 1,
    whoosh: true,
  },
  {
    at: T.funker,
    from: cal(2.5, 1.0, 2.8),
    to: cal(2.0, 0.95, 2.3),
    look: cal(0.5, 0.68, 0.26),
    zoom: 1,
  },
  {
    at: T.deck,
    from: [-10, 2.6, 6.5],
    to: [-6, 2.5, 6.0],
    look: [-3, 1.9, 0],
    zoom: 1,
    whoosh: true,
  },
  { at: T.schiff2, from: [-24, 1.2, 22], to: [-20, 1.0, 19], look: [0, 1.4, 0], zoom: 1 },
  { at: T.um, from: [8.6, 1.2, 4.2], to: [8.2, 1.0, 3.9], look: [6.35, 0.8, 1.4], zoom: 1 },
  { at: T.darin, from: [7.8, 0.45, 3.2], to: [7.5, 0.4, 3.0], look: [6.3, -0.15, 1.6], zoom: 1 },
  { at: T.frauen, from: [3.0, 2.4, 2.6], to: [3.6, 2.35, 2.4], look: [4.8, 1.95, 1.0], zoom: 1 },
  {
    at: T.bordkapelle,
    from: [-1.2, 2.25, 2.2],
    to: [-1.5, 2.2, 2.0],
    look: [-2.4, 1.95, 0.6],
    zoom: 1,
  },
  { at: T.haettest, from: [12, 4.5, 9], to: [10, 4.0, 8], look: [4, 1.8, 0.8], zoom: 1 },
  { at: T.denn, from: [6.6, 2.6, 3.2], to: [5.6, 2.5, 3.0], look: [4.6, 1.9, 0.9], zoom: 1 },
];

export const LABELS = [
  { text: "Carpathia", at: T.naechste + 1.2, until: T.rostron + 0.2, pos: crp(0, 1.3, 0), side: 1 },
  { text: "Californian", at: T.funker + 0.3, until: T.deck - 0.2, pos: cal(0, 1.0, 0), side: -1 },
];

export const HIGHLIGHTS = [];

export const SFX = [
  { s: "meer", at: 0, dur: T.kurz, db: -22 },
  { s: "morse", at: T.kurz + 1.5, db: -12 },
  { s: "morse", at: T.sos - 0.3, db: -12 },
  { s: "meer", at: T.naechste, dur: T.dabei - T.naechste, db: -22 },
  { s: "maschine", at: T.rostron, dur: T.dabei - T.rostron, db: -20 },
  { s: "rakete", at: T.dabei + 1.0, db: -12 },
  { s: "rakete", at: T.notraketen, db: -12 },
  { s: "wind", at: T.deck, dur: T.end - T.deck, db: -24 },
  { s: "meer", at: T.deck, dur: T.end - T.deck, db: -22 },
  { s: "klack", at: T.um + 0.6, db: -14 },
];
