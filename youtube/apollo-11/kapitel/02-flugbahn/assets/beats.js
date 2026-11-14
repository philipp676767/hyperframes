// Chapter 2 "Zielen ins Leere": aim where the Moon will be, the trans-lunar
// burn, the barbecue roll, the figure-eight free-return path, docking.
import { W } from "./timing.js";

export const T = {
  km: W("384.000"),
  rast: W("rast"),
  zielst: W("Zielst"),
  kennst: W("Kennst"),
  pass: W("Pass"),
  apollo: W("Apollo"),
  dritte: W("dritte"),
  tempo: W("40.000"),
  dann: W("Dann"),
  drei: W("Drei"),
  dabei: W("Dabei"),
  sonst: W("Sonst"),
  schrumpft: W("schrumpft"),
  geniale: W("geniale"),
  acht: W("Acht"),
  faellt: W("Fällt"),
  ohne: W("Ohne"),
  ticket: W("Rückfahrticket"),
  unterwegs2: W("Unterwegs", 2),
  drehen2: W("drehen", 2),
  docken: W("docken"),
  ziehen: W("ziehen"),
  eagle: W("Eagle"),
  columbia: W("Columbia"),
  triffst: W("triffst"),
  aber: W("Aber"),
};

// places: diagram (Earth at 0), close-up set (CLOSE), football pitch (FOOT)
export const CLOSE = [0, 0, 3000];
export const FOOT = [0, 0, -3000];
const c = (x, y, z) => [CLOSE[0] + x, CLOSE[1] + y, CLOSE[2] + z];
const f = (x, y, z) => [FOOT[0] + x, FOOT[1] + y, FOOT[2] + z];

export const shots = [
  { at: 0, from: [-14, 30, 70], to: [-4, 34, 58], look: [20, 0, -10], zoom: 1 },
  { at: T.zielst, from: [10, 60, 40], to: [14, 62, 34], look: [18, 0, -14], zoom: 1 },
  { at: T.kennst, from: f(14, 8, 16), to: f(11, 7, 13), look: f(1, 0, 0), zoom: 1, whip: 1 },
  { at: T.apollo, from: [24, 52, 50], to: [30, 50, 44], look: [28, 0, -4], zoom: 1 },
  { at: T.dritte, from: c(64, 6, 88), to: c(52, 12, 74), look: c(0, -3, 0), zoom: 1 },
  { at: T.dann, from: [-6, 28, 58], to: [6, 30, 52], look: [24, 0, 0], zoom: 1 },
  { at: T.dabei, orbit: { c: c(0, -2, 0), r: 78, y: CLOSE[1] + 14, a0: 0.4, a1: 1.1 }, zoom: 1 },
  { at: T.schrumpft, from: [17, 3.5, 8], to: [44, 8, 15], look: [0, 0, 0], zoom: 1 },
  { at: T.geniale, from: [25, 70, 40], to: [25, 62, 34], look: [25, 0, 0], zoom: 1 },
  {
    at: T.faellt,
    from: [40, 22, 22],
    to: [52, 18, 14],
    look: [46, 0, 0],
    lookTo: [40, 0, 0],
    zoom: 1,
  },
  { at: T.ohne, from: [25, 62, 34], to: [25, 58, 30], look: [25, 0, 0], zoom: 1 },
  { at: T.unterwegs2, from: c(62, 22, 72), to: c(54, 26, 62), look: c(0, 6, 0), zoom: 1, whip: -1 },
  { at: T.docken, from: c(46, 18, 50), to: c(42, 20, 46), look: c(0, 10, 0), zoom: 1 },
  { at: T.eagle, from: c(34, 18, 38), to: c(30, 20, 34), look: c(0, 16, 0), zoom: 1 },
  { at: T.triffst, from: [10, 64, 46], to: [18, 60, 40], look: [25, 0, 0], zoom: 1 },
];

export const LABELS = [
  { text: "Eagle", at: T.eagle, until: T.columbia - 0.1, pos: c(0, 11.2, 0), side: -1 },
  { text: "Columbia", at: T.columbia, until: T.triffst - 0.2, pos: c(0, 21, 1.95), side: 1 },
];

export const HIGHLIGHTS = [
  { kind: "zoom", at: T.km, amount: 0.2 },
  { kind: "zoom", at: T.apollo + 1.4, amount: 0.25 },
  { kind: "flash", at: T.dritte + 0.8 },
  { kind: "shake", at: T.dritte + 0.8, dur: 1.2, amp: 0.6 },
  { kind: "zoom", at: T.acht, amount: 0.3 },
  { kind: "slowmo", at: T.faellt, until: T.ohne, speed: 0.6 },
  { kind: "zoom", at: T.eagle, amount: 0.25 },
];

export const SFX = [
  { s: "triebwerk", at: T.dritte + 0.8, dur: T.dann - T.dritte - 0.6, db: -15 },
  { s: "klack", at: T.dann + 0.6, db: -12 },
  { s: "pop", at: T.pass + 0.1, db: -10 },
  { s: "zisch", at: T.unterwegs2 + 0.6, dur: 1.2, db: -18 },
  { s: "klack", at: T.docken + 0.9, db: -8 },
  { s: "quindar", at: T.aber - 0.3, db: -14 },
];
