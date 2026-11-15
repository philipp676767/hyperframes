// Chapter 7 "Der Filzstift": the hatch opens, the world watches at 4 a.m.,
// the first step, one sixth gravity, the dust, the footprint, the mirror,
// the flag rod, the broken breaker, the speech, the felt-tip pen.
import { W } from "./timing.js";

export const T = {
  luke: W("Luke"),
  deutschland: W("Deutschland"),
  mio: W("600"),
  grosseltern: W("Großeltern"),
  satz: W("Satz"),
  schritt: W("Schritt"),
  sprung: W("Sprung"),
  sechstel: W("Sechstel"),
  anzug: W("Raumanzug"),
  ranzen: W("Schulranzen"),
  huepfen: W("hüpfen"),
  staub: W("Staub"),
  glas: W("Glassplitter"),
  fuss: W("Fußabdruck"),
  spiegel: W("Spiegel"),
  flagge: W("Flagge"),
  klettern: W("klettern"),
  sieht: W("sieht"),
  schalter: W("Schalter"),
  rucksack: W("Rucksack"),
  washington: W("Washington"),
  aldrin3: W("Aldrin", 2),
  steckt: W("steckt"),
  drueckt: W("drückt"),
  haelt: W("Hält"),
};
// places: living room 1969 (LIV), dust macro (DUST), cabin breaker panel (CAB), desk (DESK)
export const LIV = [0, 500, 0];
export const DUST = [0, 600, 0];
export const CAB = [0, 700, 0];
export const DESK = [0, 800, 0];
const a = (o, x, y, z) => [o[0] + x, o[1] + y, o[2] + z];

export const shots = [
  { at: 0, from: [6, 4.2, 12], to: [4.5, 4.0, 9.5], look: [0, 3.3, 1.5], zoom: 1 },
  {
    at: T.deutschland,
    from: a(LIV, 1.6, 1.4, 2.6),
    to: a(LIV, 1.2, 1.2, 2.0),
    look: a(LIV, 0, 0.9, 0),
    zoom: 1,
  },
  { at: T.satz, from: [3.0, 1.5, 8.0], to: [2.6, 1.6, 7.4], look: [0.5, 1.3, 4.2], zoom: 1 },
  { at: T.sprung, from: [7, 2.2, 13], to: [6, 2.0, 11], look: [0.5, 1.4, 4.5], zoom: 1 },
  { at: T.sechstel, from: [-6, 1.6, 12], to: [-5, 1.6, 10.5], look: [0, 1.6, 6.5], zoom: 1 },
  { at: T.huepfen, from: [14, 3, 18], to: [12, 3, 16], look: [0, 1.4, 7], zoom: 1, whip: 1 },
  {
    at: T.staub,
    from: a(DUST, 0.35, 0.25, 0.5),
    to: a(DUST, 0.2, 0.15, 0.32),
    look: a(DUST, 0, 0.02, 0),
    zoom: 1,
  },
  { at: T.fuss, from: [3.2, 1.6, 9.2], to: [2.9, 1.2, 8.7], look: [2.4, 0, 7.6], zoom: 1 },
  { at: T.spiegel, from: [-2.5, 1.8, 11], to: [-3.2, 1.6, 10], look: [-5, 0.5, 7], zoom: 1 },
  { at: T.flagge, from: [-2.4, 2.0, 4.8], to: [-3.0, 2.2, 4.0], look: [-5.4, 1.8, -1.2], zoom: 1 },
  { at: T.klettern, orbit: { c: [0, 3, 0], r: 15, y: 3.5, a0: 1.0, a1: 0.5 }, zoom: 1 },
  {
    at: T.sieht,
    from: a(CAB, 0.4, 0.4, 1.2),
    to: a(CAB, 0.2, 0.3, 0.9),
    look: a(CAB, 0, 0.05, 0),
    zoom: 1,
  },
  {
    at: T.washington,
    from: a(DESK, 0.5, 0.9, 0.7),
    to: a(DESK, 0.3, 0.75, 0.5),
    look: a(DESK, 0, 0.0, 0),
    zoom: 1,
    whip: 1,
  },
  {
    at: T.aldrin3,
    from: a(CAB, 0.5, 0.25, 0.9),
    to: a(CAB, 0.35, 0.18, 0.65),
    look: a(CAB, 0.08, 0.02, 0),
    zoom: 1,
  },
];

export const LABELS = [
  { text: "Spiegel", at: T.spiegel + 0.2, until: T.flagge - 0.2, pos: [-5, 0.7, 7], side: 1 },
  { text: "Schalter", at: T.schalter, until: T.rucksack, pos: [0.08, 700.02, 0.1], side: 1 },
];

export const HIGHLIGHTS = [
  { kind: "zoom", at: T.mio, amount: 0.25 },
  { kind: "slowmo", at: T.satz, until: T.sprung, speed: 0.5 },
  { kind: "zoom", at: T.sechstel, amount: 0.3 },
  { kind: "zoom", at: T.fuss, amount: 0.25 },
  { kind: "zoom", at: T.schalter, amount: 0.35 },
  { kind: "zoom", at: T.drueckt, amount: 0.3 },
];

export const SFX = [
  { s: "klack", at: T.luke - 0.3, db: -10 },
  { s: "quindar", at: T.satz - 0.3, db: -12 },
  { s: "pop", at: T.schritt + 0.3, db: -16 },
  { s: "pop", at: T.huepfen + 0.4, db: -18 },
  { s: "pop", at: T.huepfen + 1.3, db: -18 },
  { s: "klack", at: T.sieht + 0.3, db: -12 },
  { s: "click", at: T.drueckt + 0.2, db: -4 },
];
