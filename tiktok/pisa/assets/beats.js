// #92 Schiefer Turm von Pisa — all time-keyed decisions as plain data
// (read by scene.js and scripts/build-sfx.mjs). No three.js / DOM here.
import { W } from "./timing.js";

// the ground cut-away model stands at world z = 150, turned 180° so its
// front faces the camera looking +z. CUT(x, y, z) = world point of a point
// in the model's own frame (front = +z, the tower leans to +x like the real one).
export const CUT_Z = 150;
export const CUT = (x, y, z) => [-x, y, CUT_Z - z];

export const T = {
  turm: W("Turm"),
  pisa: W("Pisa"),
  du: W("Du"),
  foto: W("Foto"),
  stuetzt: W("stützt"),
  er: W("Er", 1),
  noetig: W("nötig"),
  unter: W("Unter"),
  matsch: W("Matsch", 1),
  sand: W("Sand"),
  schon: W("Schon"),
  sackt: W("sackt", 1),
  kippt: W("kippt"),
  er2: W("Er", 3), // "Er fällt erst" ("er" also in "sackt er ein")
  schwer: W("Schwerpunkt", 1),
  kante: W("Kante", 1),
  wie2: W("wie", 2),
  stuhl: W("Stuhl"),
  dann: W("Dann"),
  knapp: W("knapp"),
  spitze: W("Spitze"),
  vier: W("vier"),
  rate: W("Rate"),
  man: W("Man", 2), // the 1st "man" is in "wie man ihn rettet"
  bohrt: W("bohrt"),
  hohe: W("hohe", 1),
  erde: W("Erde"),
  stueck: W("Stück", 1),
  die5: W("hohe", 2), // "Die hohe Seite sackt nach"
  sackt2: W("sackt", 2),
  richtet: W("richtet"),
  darum2: W("Darum", 2),
  zurueck: W("zurück"),
  weg: W("weg"),
  fakt: W("Übrigens"),
  erdbeben: W("Erdbeben"),
  kissen: W("Kissen"),
  hast: W("Hast"),
  schreib: W("Schreib's"),
  folge: W("Folge"),
};
// the shot before "Die hohe Seite" starts on "Die" (just before the 2nd "hohe")
T.die = T.die5 - 0.12;
// the tower is rebuilt storey by storey on "Schon beim Bau … mit jedem Stock mehr"
export const STOREY_AT = Array.from(
  { length: 8 },
  (_, i) => T.schon + 0.12 + i * ((T.er2 - T.schon - 0.5) / 7),
);
// the straightening plays inside the slowmo (0.5x) that runs T.die → T.darum2
export const STRAIGHT = [T.die + 0.15, T.die + (T.darum2 - T.die) * 0.5 - 0.05];

// ---------------------------------------------------------------- shots
// zoom 1: positions are literal (shotCamera(shots, 1) in scene.js)
const L = (x, y, z) => [x, y, z];
export const shots = [
  // hook: you "hold" the tower — first person, fast push-in, hand attached to the lens
  { at: 0, from: L(1.3, 0.9, 14.2), to: L(0.8, 1.1, 10.4), look: L(0.6, 3.4, 0), hand: true },
  // the postcard: wide and low across the lawn, cathedral behind
  { at: T.pisa, from: L(-13, 0.8, 16), to: L(-10.5, 1.3, 13), look: L(-1.5, 3.2, -1), whip: 1 },
  // the bells at the top, crane up
  { at: T.du, from: L(4.6, 5.2, 5.4), to: L(3.4, 6.9, 4.3), look: L(0.7, 6.0, 0) },
  // THE photo: through a phone viewfinder, a tourist "holding" the tower
  {
    at: T.foto,
    from: L(3.6, 0.035, 10.3),
    to: L(3.58, 0.04, 10.24),
    look: L(1.0, 2.5, 0),
    photo: true,
    focus: 4,
  },
  // under the leaning side, the tower looms
  { at: T.er, from: L(4.8, 0.25, 5.8), to: L(4.1, 0.3, 4.9), look: L(1.0, 4.0, 0) },
  // cut-away: what is under it
  { at: T.unter, from: CUT(1.8, 0.9, 11.5), to: CUT(1.2, 0.1, 9.6), look: CUT(0, -1.3, 0) },
  { at: T.matsch, from: CUT(-2.0, -0.9, 4.8), to: CUT(-1.5, -1.05, 4.0), look: CUT(-0.4, -1.4, 0) },
  // built storey by storey, it sinks and tips
  { at: T.schon, from: CUT(3.8, 2.4, 10.5), to: CUT(2.8, 3.2, 9.0), look: CUT(0, 2.5, 0) },
  // centre of gravity (x-ray)
  { at: T.er2, from: CUT(2.6, 2.0, 7.4), to: CUT(2.1, 2.3, 6.5), look: CUT(0.5, 1.8, 0) },
  // the edge: the ghost tower tips over it
  {
    at: T.kante,
    from: CUT(4.4, 1.5, 10.2),
    to: CUT(3.8, 1.7, 9.0),
    look: CUT(1.6, 1.9, 0),
    whip: 1,
  },
  // like tipping back on a chair
  { at: T.wie2, from: CUT(12.6, 1.5, 4.6), to: CUT(12.0, 1.3, 3.9), look: CUT(10, 0.95, 0) },
  // mid twist: eerie slow push, the tower leans worse than ever
  { at: T.dann, from: L(-4.8, 0.9, 10), to: L(-3.9, 1.1, 8.4), look: L(0.6, 3.6, 0) },
  // the top: 4 m out
  { at: T.spitze, from: L(0.3, 5.0, 12.5), to: L(0.3, 5.3, 11.0), look: L(0.4, 5.7, 0) },
  // guess: from the high side, low
  { at: T.rate, from: L(-3.4, 0.25, 4.4), to: L(-2.7, 0.32, 3.7), look: L(0.6, 4.5, 0), whip: -1 },
  // the rescue: drills under the high side
  { at: T.man, from: CUT(-0.6, 1.2, 9.6), to: CUT(-1.6, 0.7, 7.6), look: CUT(-2.4, -0.4, 0.9) },
  { at: T.erde, from: CUT(-2.4, -0.4, 4.4), to: CUT(-1.9, -0.55, 3.7), look: CUT(-1.4, -0.6, 0.9) },
  { at: T.stueck, from: CUT(-7.0, 1.1, 4.8), to: CUT(-6.3, 0.95, 4.1), look: CUT(-4.8, 0.2, 1.0) },
  // the high side sinks back — slowmo
  { at: T.die, from: CUT(0.6, 2.4, 12.2), to: CUT(0.3, 2.8, 10.6), look: CUT(0, 2.2, 0) },
  // payoff: the centre of gravity moves back
  { at: T.darum2, from: CUT(1.9, 2.5, 6.0), to: CUT(1.4, 2.7, 5.2), look: CUT(0.3, 2.1, 0) },
  // solid again, back on the piazza
  { at: T.weg, from: L(6.0, 1.4, 12.5), to: L(4.8, 2.1, 10.4), look: L(0.5, 3.4, 0) },
  // Übrigens: golden wide
  { at: T.fakt, from: L(-9, 3.0, 19), to: L(-6.8, 2.4, 15.8), look: L(-1, 3, -2) },
  // earthquake at ground level
  { at: T.erdbeben, from: L(2.9, 0.22, 7.8), to: L(2.3, 0.3, 6.8), look: L(0.5, 2.8, 0) },
  // the mud as a cushion
  { at: T.kissen, from: CUT(0.9, -0.7, 7.2), to: CUT(0.6, -0.95, 6.2), look: CUT(0, -1.4, 0) },
  // your hand again — "Hast du ihn auch schon gestützt?"
  {
    at: T.hast,
    from: L(-1.4, 0.9, 13.0),
    to: L(-0.8, 1.05, 10.8),
    look: L(0.6, 3.4, 0),
    hand: true,
  },
  { at: T.schreib, from: L(10, 4.6, 15), to: L(7.8, 4.0, 12.6), look: L(0, 3.2, -2) },
];

// ---------------------------------------------------------------- labels (one at a time, 4)
export const LABELS = [
  { text: "Matsch", at: T.matsch, until: T.schon, pos: CUT(-0.9, -1.3, 0.05), side: -1 },
  { text: "Schwerpunkt", at: T.schwer, until: T.kante - 0.05, pos: CUT(0.36, 2.75, 0), side: 1 },
  { text: "Kante", at: T.kante + 0.1, until: T.wie2, pos: CUT(0.98, 0.02, 0.4), side: 1 },
  { text: "Bohrer", at: T.bohrt, until: T.erde, pos: CUT(-2.6, -0.2, 0.95), side: -1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "shake", at: 0.25, dur: 0.5, amp: 0.7 }, // the tower creaks, you push
  { kind: "zoom", at: T.turm, amount: 0.3 },
  { kind: "flash", at: T.stuetzt }, // the photo flash
  { kind: "shake", at: T.noetig, dur: 0.5, amp: 0.6 },
  { kind: "shake", at: T.sackt + 0.1, dur: 0.4, amp: 0.5 },
  { kind: "zoom", at: T.kippt, amount: 0.3 },
  { kind: "flash", at: T.kante + 0.35 },
  { kind: "shake", at: T.kante + 0.5, dur: 0.4, amp: 0.6 },
  { kind: "shake", at: T.stuhl + 0.25, dur: 0.4, amp: 0.6 }, // the chair falls
  { kind: "zoom", at: T.vier, amount: 0.3 },
  { kind: "zoom", at: T.hohe, amount: 0.25 },
  { kind: "slowmo", at: T.die, until: T.darum2, speed: 0.5 },
  { kind: "flash", at: T.zurueck + 0.05 },
  { kind: "shake", at: T.erdbeben, dur: 1.2, amp: 1.2 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "knarzen", at: 0.0, db: -6 }, // the stone tower groans on frame 0
  { s: "click", at: T.stuetzt, db: -6 }, // shutter
  { s: "knarzen", at: T.noetig - 0.1, db: -9 },
  { s: "matsch", at: T.matsch + 0.05, db: -9 },
  ...[0, 2, 4, 6].map((i) => ({ s: "pop", at: STOREY_AT[i], db: -15 })),
  { s: "klack", at: T.stuhl + 0.25, db: -7 },
  { s: "knarzen", at: T.knapp, db: -10 },
  { s: "bohren", at: T.bohrt, dur: T.die - T.bohrt, db: -15 },
  { s: "knarzen", at: T.die + 0.2, db: -11 },
  { s: "beben", at: T.erdbeben, db: -7 },
  { s: "matsch", at: T.kissen + 0.05, db: -12 },
];
