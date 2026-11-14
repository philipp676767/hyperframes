// Chapter 4 "Allein hinterm Mond": braking behind the Moon, the radio
// blackout, Collins alone, the paper-thin Eagle, two stages, standing crew,
// undocking, Collins' photo, the descent, a number lights up.
import { W } from "./timing.js";

export const T = {
  bremsen: W("bremsen"),
  houston: W("Houston"),
  dann: W("Dann", 1),
  kreisen: W("kreisen"),
  steigen: W("steigen"),
  collins: W("Collins", 1),
  allein: W("Allein"),
  runde: W("Runde"),
  zeitungen: W("Zeitungen"),
  eagle2: W("Eagle", 2),
  papier: W("Papier"),
  schrauben: W("Schraubenzieher"),
  teile: W("Teile"),
  landestufe: W("Landestufe"),
  kabine: W("Kabine"),
  sitze: W("Sitze"),
  trennen: W("trennen"),
  foto: W("fotografiert"),
  bild: W("Bild"),
  sinkt: W("sinkt"),
  zahl: W("Zahl"),
  was: W("Was"),
};

// places: orbit (stack at the origin, the Moon below), radio diagram (DIAG),
// paper macro (PAPER), DSKY (0, 400, 0)
export const DIAG = [0, 2000, 0];
export const PAPER = [0, 3000, 0];
const d = (x, y, z) => [DIAG[0] + x, DIAG[1] + y, DIAG[2] + z];
const p = (x, y, z) => [PAPER[0] + x, PAPER[1] + y, PAPER[2] + z];

export const shots = [
  { at: 0, from: [34, 6, 30], to: [28, 4, 24], look: [0, 0, 0], zoom: 1 },
  { at: T.houston, from: d(-14, 30, 34), to: d(-12, 26, 30), look: d(-18, 0, 0), zoom: 1 },
  { at: T.steigen, from: [16, 6, 18], to: [12, 5, 14], look: [0, 1, 0], zoom: 1 },
  { at: T.allein, from: [70, 20, 60], to: [90, 26, 80], look: [0, -6, 0], zoom: 1 },
  { at: T.zeitungen, from: [-40, 8, 30], to: [-30, 6, 22], look: [0, 0, 0], zoom: 1 },
  {
    at: T.eagle2,
    from: p(0.9, 0.5, 1.4),
    to: p(0.6, 0.35, 1.0),
    look: p(0, 0.05, 0),
    zoom: 1,
    whip: 1,
  },
  { at: T.teile, from: [-5, -1, 21], to: [-3, -1.5, 18], look: [0, -3.2, 0], zoom: 1 },
  { at: T.sitze, from: [2.6, -0.8, 7.5], to: [1.8, -1.0, 6.4], look: [0, -1.6, 0.4], zoom: 1 },
  { at: T.trennen, from: [26, 4, 26], to: [30, 2, 30], look: [0, -8, 0], zoom: 1 },
  { at: T.foto, from: [3, 1.5, 7], to: [3, 1.5, 7], look: [-60, -190, -2600], zoom: 1, focus: 30 },
  { at: T.sinkt, from: [14, 7, 18], to: [11, 5, 14], look: [0, 1.5, 0], zoom: 1, rel: "lm" },
  {
    at: T.zahl,
    from: [0.25, 400.1, 1.3],
    to: [0.08, 400.06, 0.85],
    look: [0.05, 400.08, 0],
    zoom: 1,
  },
];

export const LABELS = [
  { text: "Collins", at: T.collins, until: T.allein, pos: [0, 2.75, 1.3], side: 1 },
  { text: "Landestufe", at: T.landestufe, until: T.kabine - 0.2, pos: [0, -3.7, 2.2], side: -1 },
  { text: "Kabine", at: T.kabine, until: T.sitze - 0.1, pos: [0, -1.4, 1.7], side: 1 },
];

export const HIGHLIGHTS = [
  { kind: "flash", at: T.bremsen + 0.2 },
  { kind: "zoom", at: T.kreisen, amount: 0.25 },
  { kind: "zoom", at: T.papier, amount: 0.3 },
  { kind: "shake", at: T.trennen + 0.3, dur: 0.5, amp: 0.4 },
  { kind: "flash", at: T.foto + 0.5 },
  { kind: "zoom", at: T.was + 0.4, amount: 0.3 },
];

export const SFX = [
  { s: "triebwerk", at: T.bremsen, dur: T.houston - T.bremsen, db: -16 },
  { s: "piep", at: T.houston + 0.4, dur: 3, db: -26 },
  { s: "quindar", at: T.dann + 0.6, db: -12 },
  { s: "klack", at: T.trennen + 0.3, db: -10 },
  { s: "click", at: T.foto + 0.5, db: -6 },
  { s: "triebwerk", at: T.sinkt, dur: 2, db: -20 },
  { s: "alarm1202", at: T.was + 0.3, db: -12 },
];
