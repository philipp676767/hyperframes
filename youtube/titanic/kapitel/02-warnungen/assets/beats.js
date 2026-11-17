// Chapter 2 "Sechs Warnungen": the voyage, first class and steerage, Captain
// Smith, warnings coming in over the air, the radio room, the Californian
// stopped in the ice, "Ruhe!", her operator goes to bed, 22 knots on.
import { W, END } from "./timing.js";

export const T = {
  an: W("An"),
  auswanderer: W("Auswandererfamilien"),
  kommando: W("Kommando"),
  smith: W("Smith"),
  vierten: W("vierten"),
  funk: W("Funk"),
  vor: W("Vor"),
  insgesamt: W("Insgesamt"),
  sechs: W("sechs"),
  einige: W("Einige"),
  doch: W("doch"),
  dort: W("Dort"),
  jack: W("Jack"),
  harold: W("Harold"),
  ihr: W("Ihr"),
  am2: W("Am", 3),
  californian: W("Californian", 1),
  wir: W("Wir"),
  ruhe: W("Ruhe"),
  steckt: W("steckt"),
  um: W("Um"),
  funker3: W("Funker", 3),
  ab: W("ab", 2),
  titanic2: W("Titanic", 2),
  gut: W("gut"),
  end: END,
};
export const RAD = [0, 300, 0];
const rad = (x, y, z) => [RAD[0] + x, RAD[1] + y, RAD[2] + z];
export const CAL = [-34, 0, -46];
const cal = (x, y, z) => [CAL[0] + x, CAL[1] + y, CAL[2] + z];

export const shots = [
  { at: 0, from: [-30, 4.5, 26], to: [-20, 4.0, 24], look: [2, 1.6, 0], zoom: 1 },
  { at: T.an, from: [-6, 1.5, 4.3], to: [1, 1.45, 4.1], look: [-2, 1.35, 0], zoom: 1 },
  {
    at: T.auswanderer,
    from: [-11.5, 0.45, 3.6],
    to: [-8.5, 0.5, 3.4],
    look: [-9, 0.55, 0],
    zoom: 1,
  },
  {
    at: T.kommando,
    from: [9.6, 2.25, 3.4],
    to: [9.2, 2.2, 3.1],
    look: [7.42, 1.95, 1.25],
    zoom: 1,
  },
  { at: T.vierten, from: [3, 0.8, 16], to: [1, 0.9, 15], look: [0, 4.2, 0], zoom: 1 },
  { at: T.vor, from: [12.0, 2.2, 0.0], to: [12.6, 2.1, 0.0], look: [30, -0.3, 1.5], zoom: 1 },
  {
    at: T.insgesamt,
    from: rad(0.5, 0.95, -0.05),
    to: rad(0.42, 0.9, -0.12),
    look: rad(0.05, 0.45, -0.5),
    zoom: 1,
    whoosh: true,
  },
  {
    at: T.einige,
    from: [8.6, 2.5, 2.6],
    to: [8.2, 2.4, 2.3],
    look: [7.2, 1.95, 0],
    zoom: 1,
    whoosh: true,
  },
  {
    at: T.doch,
    from: rad(-0.75, 0.78, -0.2),
    to: rad(-0.68, 0.74, -0.26),
    look: rad(-0.25, 0.45, -0.42),
    zoom: 1,
    whoosh: true,
  },
  {
    at: T.dort,
    from: rad(1.25, 1.05, 0.9),
    to: rad(1.1, 1.0, 0.75),
    look: rad(0.15, 0.6, -0.4),
    zoom: 1,
  },
  {
    at: T.ihr,
    from: rad(1.15, 0.88, 0.4),
    to: rad(1.05, 0.82, 0.3),
    look: rad(0.45, 0.5, -0.55),
    zoom: 1,
  },
  {
    at: T.am2,
    from: cal(7, 1.6, 7),
    to: cal(5.5, 1.4, 5.8),
    look: cal(0, 0.6, 0),
    zoom: 1,
    whoosh: true,
  },
  {
    at: T.wir - 0.1,
    from: rad(-0.35, 0.62, -0.2),
    to: rad(-0.4, 0.6, -0.26),
    look: rad(-0.55, 0.47, -0.45),
    zoom: 1,
    whoosh: true,
  },
  {
    at: T.ruhe - 0.1,
    from: rad(0.55, 0.68, -0.18),
    to: rad(0.48, 0.65, -0.24),
    look: rad(0.1, 0.5, -0.5),
    zoom: 1,
  },
  {
    at: T.steckt,
    from: rad(1.05, 0.72, -0.42),
    to: rad(0.98, 0.68, -0.46),
    look: rad(0.48, 0.47, -0.5),
    zoom: 1,
  },
  {
    at: T.um,
    from: rad(0.6, 1.16, -0.45),
    to: rad(0.6, 1.15, -0.52),
    look: rad(0.6, 1.15, -0.89),
    zoom: 1,
  },
  {
    at: T.funker3 - 0.3,
    from: cal(5, 1.2, 6.5),
    to: cal(4.4, 1.15, 5.8),
    look: cal(0.2, 0.7, 0),
    zoom: 1,
    whoosh: true,
  },
  {
    at: T.titanic2,
    from: [16, 0.4, 2.9],
    to: [15.0, 0.45, 2.5],
    look: [11, 0.9, 0],
    zoom: 1,
    whoosh: true,
  },
  { at: T.gut, from: [6, 1.2, 16], to: [-6, 1.2, 16], look: [0, 1.2, 0], zoom: 1 },
];

export const LABELS = [
  {
    text: "Kapitän Smith",
    at: T.smith - 0.3,
    until: T.vierten - 0.3,
    pos: [7.42, 2.0, 1.25],
    side: 1,
  },
  {
    text: "Jack Phillips",
    at: T.jack,
    until: T.harold - 0.2,
    pos: rad(0.62, 0.92, -0.18),
    side: 1,
  },
  {
    text: "Harold Bride",
    at: T.harold,
    until: T.ihr - 0.1,
    pos: rad(-0.25, 0.92, -0.18),
    side: -1,
  },
  { text: "Californian", at: T.am2 + 0.8, until: T.wir - 0.2, pos: cal(0, 1.0, 0), side: 1 },
];

export const HIGHLIGHTS = [];

export const SFX = [
  { s: "meer", at: 0, dur: T.insgesamt, db: -22 },
  { s: "maschine", at: 0, dur: T.insgesamt, db: -26 },
  { s: "morse", at: T.funk, db: -16 },
  { s: "morse", at: T.funk + 2.4, db: -18 },
  { s: "pop", at: T.sechs, db: -18 },
  { s: "pop", at: T.sechs + 0.12, db: -18 },
  { s: "pop", at: T.sechs + 0.24, db: -18 },
  { s: "pop", at: T.sechs + 0.36, db: -18 },
  { s: "pop", at: T.sechs + 0.48, db: -18 },
  { s: "pop", at: T.sechs + 0.6, db: -18 },
  { s: "wind", at: T.einige, dur: T.doch - T.einige, db: -22 },
  { s: "morse", at: T.ihr + 0.3, db: -14 },
  { s: "wind", at: T.am2, dur: T.wir - T.am2, db: -22 },
  { s: "morse", at: T.ruhe + 1.8, db: -14 },
  { s: "click", at: T.ab, db: -10 },
  { s: "meer", at: T.titanic2, dur: T.end - T.titanic2, db: -20 },
  { s: "maschine", at: T.titanic2, dur: T.end - T.titanic2, db: -22 },
];
