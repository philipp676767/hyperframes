// Chapter 5 "Alarm 1202": the alarm, Mission Control, the radar switch,
// the kitchen analogy, the restart, Garman's cheat sheet, "Go", the boulders.
import { W } from "./timing.js";

export const T = {
  warnton: W("Warnton"),
  display: W("Display"),
  armstrong: W("Armstrong", 1),
  kontroll: W("Kontrollzentrum"),
  steve: W("Steve"),
  abbrechen: W("Abbrechen"),
  uhr: W("Uhr"),
  was2: W("Was", 2),
  ueber: W("überlastet", 1),
  radar: W("Radar-Schalter"),
  stell: W("Stell"),
  irgendwann: W("Irgendwann"),
  jetzt: W("Jetzt"),
  startet: W("startet"),
  wirft: W("wirft"),
  junger: W("junger"),
  spick: W("Spickzettel"),
  bales2: W("Bales", 2),
  go: W("Go", 1),
  alarm2: W("Alarm", 2),
  heisst: W("heißt"),
  doch: W("Doch"),
  felsen: W("Felsbrocken"),
  was3: W("Was", 3),
};
export const DUR = 62;
// places: Mission Control (MCC), the switch panel (SW), the kitchen (KIT), DSKY (0, 400, 0)
export const MCC = [0, 600, 0];
export const SW = [0, 700, 0];
export const KIT = [0, 800, 0];
const m = (x, y, z) => [MCC[0] + x, MCC[1] + y, MCC[2] + z];
const sw = (x, y, z) => [SW[0] + x, SW[1] + y, SW[2] + z];
const k = (x, y, z) => [KIT[0] + x, KIT[1] + y, KIT[2] + z];

export const shots = [
  { at: 0, from: [14, 6, 16], to: [11, 5, 13], look: [0, 3, 0], zoom: 1, rel: "lm" },
  { at: T.warnton, from: [5, 6, 9], to: [3.5, 5.4, 7], look: [0, 4.4, 1.4], zoom: 1, rel: "lm" },
  {
    at: T.display,
    from: [0.25, 400.1, 1.15],
    to: [0.05, 400.05, 0.8],
    look: [0.05, 400.08, 0],
    zoom: 1,
  },
  { at: T.armstrong, from: [-12, -3, 12], to: [-10, -2, 10], look: [0, 4, 0], zoom: 1, rel: "lm" },
  { at: T.kontroll, from: m(9, 4.5, 13), to: m(7, 4, 11), look: m(0, 1.5, -2), zoom: 1 },
  { at: T.steve, from: m(1.9, 3.7, 3.6), to: m(1.5, 3.4, 3.0), look: m(0, 1.6, 0.4), zoom: 1 },
  { at: T.uhr, from: [-30, 20, 30], to: [-24, 16, 22], look: [0, 0, 0], zoom: 1, rel: "lm" },
  { at: T.was2, from: [-0.6, 400.2, 1.6], to: [-0.3, 400.05, 1.2], look: [0, 400, 0], zoom: 1 },
  {
    at: T.radar,
    from: sw(0.9, 0.6, 1.4),
    to: sw(0.6, 0.4, 1.0),
    look: sw(0, 0.05, 0),
    zoom: 1,
    whip: 1,
  },
  { at: T.stell, from: k(2.6, 2.2, 3.4), to: k(2.0, 1.9, 2.8), look: k(0, 0.9, 0), zoom: 1 },
  { at: T.jetzt, from: [0.4, 400.2, 1.7], to: [0.2, 400.1, 1.3], look: [0, 400, 0], zoom: 1 },
  { at: T.junger, from: m(1.1, 3.0, 4.9), to: m(0.9, 2.8, 4.5), look: m(0.5, 1.53, 3.4), zoom: 1 },
  { at: T.bales2, from: m(-6, 4, 10), to: m(-4, 3.5, 8), look: m(0, 1.6, -3), zoom: 1, whip: -1 },
  { at: T.heisst, from: [16, 8, 18], to: [12, 6, 14], look: [0, 3.5, 0], zoom: 1, rel: "lm" },
  { at: T.doch, from: [6, 46, -6], to: [12, 36, -16], look: [26, 0, -42], zoom: 1 },
  { at: T.was3, from: [12, 4, 12], to: [9, 3, 9], look: [0, 3, 0], zoom: 1, rel: "lm" },
];

export const LABELS = [
  { text: "Steve Bales", at: T.steve, until: T.abbrechen, pos: m(0, 2.0, 0.65), side: 1 },
  { text: "Radar", at: T.radar + 0.3, until: T.stell - 0.2, pos: sw(0.12, 0.12, 0.06), side: 1 },
];

export const HIGHLIGHTS = [
  { kind: "flash", at: T.warnton },
  { kind: "zoom", at: T.display + 0.6, amount: 0.3 },
  { kind: "zoom", at: T.ueber, amount: 0.3 },
  { kind: "shake", at: T.irgendwann, dur: 0.8, amp: 0.5 },
  { kind: "flash", at: T.startet + 0.4 },
  { kind: "zoom", at: T.spick, amount: 0.3 },
  { kind: "flash", at: T.go },
  { kind: "zoom", at: T.felsen, amount: 0.3 },
];

export const SFX = [
  { s: "triebwerk", at: 0, dur: T.display, db: -18 },
  { s: "alarm1202", at: T.warnton, db: -9 },
  { s: "quindar", at: T.armstrong - 0.2, db: -13 },
  { s: "piep", at: T.steve, dur: 2.2, db: -26 },
  { s: "click", at: T.radar + 0.2, db: -8 },
  { s: "zisch", at: T.stell + 0.3, dur: 4, db: -20 },
  { s: "pop", at: T.irgendwann - 0.6, db: -12 },
  { s: "pop", at: T.irgendwann - 0.3, db: -12 },
  { s: "pop", at: T.irgendwann, db: -12 },
  { s: "klack", at: T.startet + 0.3, db: -10 },
  { s: "quindar", at: T.bales2 + 0.4, db: -11 },
  { s: "alarm1202", at: T.alarm2, db: -14 },
  { s: "triebwerk", at: T.heisst, dur: DUR - T.heisst, db: -18 },
];
