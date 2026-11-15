// Chapter 6 "Noch 60 Sekunden": manual flight over the boulders, the fuel
// call-outs, what an abort would mean, dust, the contact light, touchdown,
// "The Eagle has landed", and the re-hook: one engine, no spare.
import { W } from "./timing.js";

export const T = {
  fliegt: W("fliegt"),
  ziel: W("Ziel"),
  aldrin: W("Aldrin"),
  funk: W("Funkspruch"),
  s60: W("60"),
  abbruch: W("Abbruch"),
  sprengt: W("sprengt"),
  verloren: W("verloren"),
  s30: W("30"),
  staub: W("Staub"),
  sieht: W("sieht"),
  leuchtet: W("leuchtet"),
  kontakt: W("Kontakt"),
  fuehler: W("Fühler"),
  aus: W("aus", 2),
  houston3: W("Houston", 2),
  gelandet: W("gelandet"),
  zurueck: W("funkt"),
  knapp: W("knapp"),
  merkst: W("merkst"),
  einem: W("einem"),
  springt: W("Springt"),
  was: W("was"),
};
export const PANEL = [0, 500, 0];
const pn = (x, y, z) => [PANEL[0] + x, PANEL[1] + y, PANEL[2] + z];

export const shots = [
  { at: 0, from: [16, 4, 14], to: [12, 3, 10], look: [0, 3, 0], zoom: 1, rel: "lm" },
  { at: T.fliegt, from: [22, 8, -6], to: [20, 9, 5], look: [0, 2, 0], zoom: 1, rel: "lm" },
  { at: T.ziel, from: [-70, 45, 70], to: [-58, 38, 58], look: [10, 0, -20], zoom: 1 },
  {
    at: T.aldrin,
    from: [3.2, 5.4, 7.2],
    to: [2.6, 5.1, 6.2],
    look: [0, 4.6, 1.2],
    zoom: 1,
    rel: "lm",
  },
  { at: T.funk, from: [-11, -5, 13], to: [-9, -4.5, 11], look: [0, 2, 0], zoom: 1, rel: "lm" },
  { at: T.abbruch, from: [18, 6, 22], to: [16, 8, 20], look: [0, 6, 0], zoom: 1, rel: "lm" },
  { at: T.s30, from: [10, -1, 10], to: [8, -1, 8], look: [0, 3, 0], zoom: 1, rel: "lm" },
  { at: T.sieht, from: [0.6, 4.7, 2.4], to: [0.6, 4.4, 2.6], look: [0, -4, 9], zoom: 1, rel: "lm" },
  {
    at: T.leuchtet,
    from: pn(0.25, 0.25, 0.7),
    to: pn(0.12, 0.15, 0.5),
    look: pn(0, 0.02, 0),
    zoom: 1,
  },
  { at: T.fuehler, from: [5.6, 0.5, 6.0], to: [5.2, 0.45, 5.6], look: [3.25, 0.2, 3.25], zoom: 1 },
  { at: T.aus, from: [15, 3.5, 17], to: [13, 3.5, 15], look: [0, 3, 0], zoom: 1 },
  { at: T.houston3, orbit: { c: [0, 3.5, 0], r: 17, y: 4.5, a0: 0.5, a1: 1.3 }, zoom: 1 },
  { at: T.knapp, from: [-9, 1.2, 10], to: [-8, 1.4, 9], look: [0, 3, 0], zoom: 1 },
  { at: T.merkst, from: [10, 6, 12], to: [6, 5, 7.5], look: [0, 3.6, 0], zoom: 1 },
  { at: T.was, from: [3, 4.5, 6], to: [2.4, 4.3, 5], look: [0, 3.4, 0.5], zoom: 1 },
];

export const LABELS = [
  { text: "Startmotor", at: T.einem, until: T.springt + 0.8, pos: [0, 2.9, 0], side: 1 },
];

export const HIGHLIGHTS = [
  { kind: "zoom", at: T.s60, amount: 0.3 },
  { kind: "flash", at: T.sprengt + 0.3 },
  { kind: "shake", at: T.s30, dur: 3, amp: 0.6 },
  { kind: "zoom", at: T.kontakt, amount: 0.35 },
  { kind: "slowmo", at: T.fuehler, until: T.aus, speed: 0.5 },
  { kind: "flash", at: T.gelandet },
  { kind: "zoom", at: T.einem, amount: 0.3 },
];

export const SFX = [
  { s: "triebwerk", at: 0, dur: T.aus + 0.2, db: -17 },
  { s: "quindar", at: T.funk - 0.2, db: -12 },
  { s: "triebwerk", at: T.sprengt + 0.3, dur: 2, db: -12 },
  { s: "quindar", at: T.s30 - 0.25, db: -12 },
  { s: "click", at: T.kontakt - 0.1, db: -6 },
  { s: "klack", at: T.fuehler + 1.2, db: -8 },
  { s: "quindar", at: T.houston3 - 0.25, db: -12 },
  { s: "quindar", at: T.zurueck - 0.4, db: -12 },
];
