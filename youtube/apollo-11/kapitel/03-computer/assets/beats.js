// Chapter 3 "Ein Hirn aus Draht": the guidance computer + DSKY, 4 KB vs the
// phone, core rope memory (wire through a ring = 1, past it = 0), woven by
// hand, Hamilton's priority list.
import { W } from "./timing.js";

export const T = {
  bord: W("Apollo-Bordcomputer"),
  koffer: W("Aktenkoffer"),
  speicher: W("Arbeitsspeicher"),
  kb: W("Kilobyte"),
  bildschirm: W("Bildschirm"),
  befehle: W("Befehle"),
  handy: W("Handy"),
  foto: W("Handyfoto"),
  rate: W("Rate"),
  chip: W("Chip"),
  gewebt: W("gewebt"),
  ringe: W("Eisenringe"),
  eins: W("Eins"),
  null: W("Null"),
  monate: W("Monatelang"),
  fehler: W("Fehler"),
  software: W("Software"),
  rang: W("Rangliste", 1),
  wichtig: W("wichtig"),
  viel: W("Wird"),
  wirft: W("wirft"),
  klingt: W("Klingt"),
  so: W("rechnet", 2),
  doch: W("Doch"),
};

// the rig is scaled x4 (scene.js): 1 m real = 4 units
export const shots = [
  { at: 0, from: [3.5, 2.6, 6.5], to: [2.2, 2.2, 5.0], look: [-0.4, 1.0, 0], zoom: 1 },
  { at: T.speicher, from: [-3.6, 2.0, 3.4], to: [-3.0, 1.8, 2.8], look: [-2.2, 0.5, 0], zoom: 1 },
  { at: T.bildschirm, from: [1.4, 1.7, 4.6], to: [1.0, 1.5, 4.0], look: [0.6, 1.35, 0], zoom: 1 },
  {
    at: T.handy,
    from: [3.6, 1.3, 3.6],
    to: [3.3, 1.2, 3.2],
    look: [2.2, 0.55, 0.5],
    zoom: 1,
    whip: 1,
  },
  { at: T.rate, from: [0, 3.2, 6.2], to: [0, 2.6, 5.4], look: [0, 0.4, 2.4], zoom: 1 },
  { at: T.ringe, from: [-0.4, 1.0, 4.3], to: [0.3, 0.9, 3.9], look: [0, 0.48, 2.4], zoom: 1 },
  { at: T.monate, from: [1.8, 1.4, 4.4], to: [1.2, 1.2, 4.0], look: [0.4, 0.5, 2.4], zoom: 1 },
  {
    at: T.software,
    from: [6.6, 2.4, 6.6],
    to: [6.0, 2.2, 6.0],
    look: [3.6, 0.8, 2.4],
    zoom: 1,
    whip: -1,
  },
  { at: T.viel, from: [6.8, 2.4, 7.2], to: [6.4, 2.3, 6.8], look: [3.6, 1.1, 2.4], zoom: 1 },
  { at: T.klingt, from: [3.4, 2.4, 6.4], to: [2.0, 2.2, 5.6], look: [0.6, 1.2, 0], zoom: 1 },
  { at: T.doch, from: [0, 2.0, 7.5], to: [0, 2.6, 6.0], look: [0, 3.5, -10], zoom: 1 },
];

export const LABELS = [
  {
    text: "Bordcomputer",
    at: T.bord + 0.1,
    until: T.speicher - 0.2,
    pos: [-2.2, 0.7, 0.2],
    side: -1,
  },
  { text: "1", at: T.eins - 0.1, until: T.null - 0.3, pos: [-0.6, 0.48, 2.4], side: -1 },
  { text: "0", at: T.null - 0.1, until: T.monate - 0.1, pos: [0.6, 0.48, 2.4], side: 1 },
];

export const HIGHLIGHTS = [
  { kind: "zoom", at: T.kb, amount: 0.3 },
  { kind: "zoom", at: T.handy + 1.0, amount: 0.3 },
  { kind: "flash", at: T.gewebt },
  { kind: "zoom", at: T.rang, amount: 0.3 },
  { kind: "shake", at: T.viel + 0.3, dur: 0.6, amp: 0.6 },
];

export const SFX = [
  { s: "click", at: T.befehle + 0.4, db: -12 },
  { s: "click", at: T.befehle + 0.8, db: -12 },
  { s: "click", at: T.befehle + 1.2, db: -12 },
  { s: "pop", at: T.handy - 0.1 },
  { s: "surr", at: T.gewebt, dur: 7, db: -24 },
  { s: "klack", at: T.viel + 0.3, db: -10 },
  { s: "whoosh", at: T.wirft + 0.3, db: -12 },
  { s: "quindar", at: T.doch - 0.3, db: -14 },
];
