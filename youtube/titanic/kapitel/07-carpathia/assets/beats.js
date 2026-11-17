// Chapter 7 "Die Rettung": the Carpathia's lights at 4 am, full speed through
// the ice, dawn reveals the field, 705 taken from the boats, the toll by class,
// the inquiries, the old rule: the same boats for a ship four times smaller.
import { W, END } from "./timing.js";

export const T = {
  lichter: W("Lichter"),
  rostron: W("Rostron"),
  feld: W("Feld"),
  morgengrauen: W("Morgengrauen"),
  bis: W("Bis"),
  ueber: W("Über"),
  aus: W("Aus"),
  untersuchungen: W("Untersuchungen"),
  problem: W("Problem"),
  regeln: W("Regeln"),
  fuer: W("Für"),
  viermal: W("viermal"),
  was: W("Was"),
  end: END,
};
export const CARP = [6, 0, -4];
const c = (x, y, z) => [CARP[0] + x, CARP[1] + y, CARP[2] + z];
export const RULE = [0, 0, 60]; // the two ships side by side for the rule
const ru = (x, y, z) => [RULE[0] + x, RULE[1] + y, RULE[2] + z];

export const shots = [
  { at: 0, from: c(-22, 1.2, 14), to: c(-18, 1.1, 12), look: c(0, 1.0, 0), zoom: 1 },
  { at: T.rostron, from: c(9, 2.4, 8), to: c(8, 2.2, 7), look: c(0, 1.0, 0), zoom: 1 },
  { at: T.feld, from: [-30, 9, 40], to: [-20, 8, 34], look: [6, 1, 0], zoom: 1 },
  { at: T.bis, from: c(7, 1.8, 10), to: c(6, 1.6, 9), look: c(0.5, 0.4, 2), zoom: 1 },
  { at: T.ueber, from: [-8, 2.5, 16], to: [-6, 2.2, 14], look: [0, 0.3, 4], zoom: 1 },
  {
    at: T.untersuchungen,
    from: ru(-6, 8, 26),
    to: ru(-4, 7, 23),
    look: ru(0, 1, 0),
    zoom: 1,
    whoosh: true,
  },
  { at: T.fuer, from: ru(14, 3, 16), to: ru(12, 2.8, 14), look: ru(0, 1.5, 0), zoom: 1 },
  { at: T.was, from: ru(-20, 4, 22), to: ru(-16, 3.6, 18), look: ru(2, 1.2, 0), zoom: 1 },
];

export const LABELS = [{ text: "Carpathia", at: 1.0, until: 4.5, pos: c(0, 1.4, 0), side: 1 }];

export const HIGHLIGHTS = [];

export const SFX = [
  { s: "meer", at: 0, dur: T.end, db: -22 },
  { s: "maschine", at: 0, dur: T.feld, db: -22 },
  { s: "wind", at: T.feld, dur: T.untersuchungen - T.feld, db: -24 },
];
