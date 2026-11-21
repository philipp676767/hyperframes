// Chapter 7 "Die Wolke und der Sarg": rain over Bavaria, caesium in the soil,
// the deer truffle, the boar; liquidators, the sarcophagus, the new arch
// rolling in, the zone with wolves and wild horses.
import { W, END } from "./timing.js";

export const T = {
  wo: W("Wo"),
  eltern: W("Eltern"),
  was: W("Was"),
  nach: W("Nach"),
  ein: W("Teil", 1) - 0.3,
  wild: W("Wildschweine"),
  deshalb: W("Deshalb", 1),
  teil2: W("Teil", 2) - 0.3,
  und: W("Hunderttausende") - 1.3,
  auf: W("Dach") - 0.4,
  schaufeln: W("schaufeln"),
  in: W("206") - 0.2,
  er: W("Er"),
  deshalb2: W("Deshalb", 2),
  m108: W("108"),
  sie: W("rollt") - 0.3,
  rund: W("Sperrzone") - 2.1,
  ohne: W("Ohne"),
  woelfe: W("Wölfe"),
  die: W("verschwunden") - 1.0,
  end: END,
};
const f = (x, y, z) => [x, 300 + y, z];

export const shots = [
  // rain over the forest canopy, sinking down
  { at: 0, from: f(-6, 14, 16), to: f(-3, 6, 10), look: f(0, 1, -4), zoom: 1 },
  { at: T.wo - 0.2, from: f(5, 1.2, 8), to: f(3, 1.0, 6.5), look: f(0, 0.4, -2), zoom: 1 },
  // the empty sandbox
  { at: T.eltern - 0.2, from: f(10.5, 1.4, 6.5), to: f(10, 1.2, 5.8), look: f(8, 0.2, 3), zoom: 1 },
  // caesium in the soil
  {
    at: T.was - 0.2,
    from: f(2.2, 0.8, 2.6),
    to: f(1.8, 0.6, 2.2),
    look: f(0.6, 0.0, 0.4),
    zoom: 1,
  },
  {
    at: T.ein - 0.2,
    from: f(1.6, 0.45, 1.6),
    to: f(1.4, 0.4, 1.4),
    look: f(0.9, 0.05, 0.6),
    zoom: 1,
  },
  // the boar digs it up
  {
    at: T.wild - 0.2,
    from: f(3.2, 0.9, 2.6),
    to: f(2.7, 0.8, 2.1),
    look: f(0.4, 0.4, 0.4),
    zoom: 1,
  },
  {
    at: T.deshalb - 0.2,
    from: f(-1.5, 0.7, 3.4),
    to: f(-1.2, 0.65, 3.0),
    look: f(0.3, 0.5, 0.4),
    zoom: 1,
  },
  { at: T.teil2, from: f(-6, 3, 10), to: f(-4, 2.6, 9), look: f(0, 1, 0), zoom: 1 },
  // Chernobyl: liquidators on the roof next to the ruin
  { at: T.und, from: [30, 16, 34], to: [24, 14, 28], look: [0, 4, 0], zoom: 1, whoosh: true },
  {
    at: T.auf - 0.2,
    from: [-1.2, 9.0, 7.5],
    to: [-1.6, 8.8, 6.8],
    look: [-5.8, 7.1, 0.6],
    zoom: 1,
  },
  // the sarcophagus
  { at: T.in, from: [26, 5, 26], to: [21, 5.5, 22], look: [3, 5, 0], zoom: 1 },
  // the new arch rolls in on its rails
  { at: T.er - 0.2, from: [-10, 10, 42], to: [-4, 10, 38], look: [-8, 5, 0], zoom: 1 },
  { at: T.m108 - 0.2, from: [14, 0.8, 18], to: [12, 0.9, 16], look: [3, 8, 0], zoom: 1 },
  { at: T.sie, from: [-34, 0.45, 13.6], to: [-29, 0.45, 13.4], look: [-8, 1.0, 12.4], zoom: 1 },
  // the zone, 30 km around
  { at: T.rund - 0.2, from: [-60, 40, 90], to: [-50, 44, 80], look: [0, 0, -10], zoom: 1 },
  // wolves and wild horses by the abandoned houses
  {
    at: T.ohne - 0.2,
    from: [35.5, 0.38, -22.5],
    to: [34.8, 0.36, -23.0],
    look: [31, 0.22, -27.5],
    zoom: 1,
  },
  { at: T.die, from: [36, 0.4, -16], to: [34, 0.5, -15], look: [5, 6, 0], zoom: 1 },
];

export const LABELS = [
  { text: "Cäsium-137", at: T.was + 1.4, until: T.ein - 0.3, pos: f(0.4, 0.04, 0.9), side: -1 },
  { text: "Hirschtrüffel", at: T.ein + 3.3, until: T.wild - 0.3, pos: f(0.9, 0.08, 0.6), side: 1 },
  { text: "Liquidatoren", at: T.auf + 0.8, until: T.in - 0.4, pos: [-6, 7.35, 1.0], side: 1 },
  { text: "Sarkophag", at: T.in + 3.6, until: T.er - 0.4, pos: [3, 7.8, 0.8], side: 1 },
  {
    text: "Przewalski-Pferde",
    at: T.woelfe + 1.5,
    until: T.die - 0.3,
    pos: [30, 0.3, -27],
    side: -1,
  },
];

export const HIGHLIGHTS = [];

export const SFX = [
  { s: "regen", at: 0, dur: T.und, db: -14 },
  { s: "geiger", at: T.was + 1.0, dur: T.wild - T.was, db: -22 },
  { s: "wind", at: T.und, dur: T.end - T.und, db: -18 },
  { s: "klack", at: T.schaufeln + 0.3, db: -18 },
  { s: "klack", at: T.schaufeln + 1.3, db: -18 },
  { s: "rollen", at: T.er, dur: T.rund - T.er, db: -14 },
  { s: "morgen", at: T.ohne, dur: T.end - T.ohne, db: -20 },
];
