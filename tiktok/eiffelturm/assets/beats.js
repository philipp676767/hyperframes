// #98 Eiffelturm — all time-keyed decisions as plain data
// (read by scene.js and scripts/build-sfx.mjs). No three.js / DOM here.
import { W } from "./timing.js";

// the café terrace (Hefeteig + Banane) stands far away at z = CZ, facing +z
export const CZ = 150;
export const C = (x, y, z) => [x, y, CZ + z];

export const T = {
  eiffel: W("Eiffelturm", 1),
  verbiegt: W("verbiegt"),
  sich: W("sich", 1),
  sommertag: W("Sommertag"),
  von: W("Von"),
  stell: W("Stell"),
  juli: W("Juli"),
  du: W("du", 1),
  oben: W("oben", 1),
  paris: W("Paris"),
  doch: W("Doch"),
  spitze: W("Spitze", 1),
  wandert: W("wandert"),
  wind: W("Wind"),
  kein2: W("kein", 2),
  erdbeben: W("Erdbeben"),
  turm: W("Turm"),
  eisen: W("Eisen", 1),
  eisen2: W("Eisen", 2),
  waerme: W("Wärme"),
  laenger: W("länger", 1),
  wie: W("Wie", 1),
  hefeteig: W("Hefeteig"),
  ofen: W("Ofen"),
  winzig: W("winzig"),
  rate: W("Rate"),
  sommer: W("Sommer"),
  ueber2: W("über", 2), // "Über zehn" (the 1st is "über Paris")
  zehn: W("zehn"),
  zentimeter: W("Zentimeter"),
  nur2: W("nur", 2), // the 1st "nur" is "nur winzig"
  groesser2: W("größer", 2),
  biegen: W("Biegen"),
  trick: W("Trick"),
  sonne: W("Sonne", 1),
  knallt: W("knallt"),
  seite: W("Seite", 1),
  heisse: W("heiße"),
  laenger2: W("länger", 2),
  schatten: W("Schattenseite"),
  wie2: W("wie", 3), // 2nd = "wie viel"
  banane: W("Banane"),
  aussen: W("außen"),
  innen: W("innen"),
  schon: W("Schon"),
  krumm: W("krumm"),
  fakt: W("Übrigens"),
  winter: W("Winter"),
  schrumpft: W("schrumpft"),
  jedes: W("Jedes"),
  hundert: W("hundert"),
  deshalb: W("Deshalb"),
  biegt: W("biegt"),
  spitze2: W("Spitze", 2),
  weg: W("weg"),
  sonne2: W("Sonne", 2),
  den: W("Den"),
  kreis: W("Kreis"),
  warst: W("Warst"),
  eiffel2: W("Eiffelturm", 2),
  schreib: W("Schreib's"),
  folge: W("Folge"),
};

// ---------------------------------------------------------------- shots
// zoom 1: positions are literal (shotCamera(shots, 1) in scene.js)
export const shots = [
  // hook: low on the Champ de Mars, fast push-in, the tower swaying hard
  { at: 0, from: [4.2, 0.45, 17.5], to: [2.6, 0.9, 12.2], look: [0, 5.6, 0] },
  // the top bending against the sun
  { at: T.sich, from: [3.6, 8.6, 6.0], to: [2.7, 9.4, 4.6], look: [0, 10.2, 0], whip: 1 },
  // the postcard from the Trocadéro: river, bridge, boat
  { at: T.von, from: [-2.4, 2.6, -25], to: [-1.6, 2.3, -21.5], look: [0, 5.4, 0] },
  // you on top: first person, the hand on the rail, Paris below
  {
    at: T.du,
    from: [0.42, 10.32, 0.5],
    to: [0.46, 10.3, 0.62],
    look: [2.6, 5.6, 9.5],
    hand: true,
    tilt: 0.3,
  },
  // the tip wanders: side view of the top, the trail draws
  { at: T.doch, from: [5.6, 10.8, 5.4], to: [4.8, 10.6, 4.6], look: [0, 10.4, 0] },
  // no wind: the flag hangs limp
  {
    at: T.wind,
    from: [1.25, 11.0, 1.55],
    to: [1.05, 10.95, 1.35],
    look: [0.3, 10.75, 0.3],
    tilt: 0.2,
  },
  // no earthquake: at the foot of a leg
  { at: T.kein2, from: [3.6, 0.25, 5.2], to: [3.1, 0.35, 4.5], look: [1.2, 1.3, 0.8], whip: -1 },
  // iron: macro on the lattice of a leg
  { at: T.turm, from: [2.75, 1.05, 3.25], to: [2.45, 1.2, 2.85], look: [1.55, 1.45, 1.65] },
  // iron grows in the heat: the lattice glows, heat rises
  { at: T.eisen2, from: [2.4, 2.6, 3.4], to: [2.1, 3.0, 2.9], look: [0.9, 3.2, 0.9] },
  // like dough in the oven — the café terrace
  { at: T.wie, from: C(0.9, 1.45, 2.3), to: C(0.55, 1.3, 1.75), look: C(-0.15, 1.0, 0) },
  // guess: the whole tower, low and wide
  { at: T.rate, from: [-2.7, 0.55, 20], to: [-2.2, 0.9, 16], look: [0, 6.2, 0] },
  // over ten centimetres: the tip passes the mark on the ruler
  { at: T.ueber2, from: [1.9, 11.6, 4.0], to: [1.6, 12.0, 3.4], look: [0.2, 12.1, 0], whip: 1 },
  // growing is not bending: front view, straight up
  { at: T.nur2, from: [0, 3.4, 22], to: [0, 4.0, 19], look: [0, 6.0, 0] },
  // the trick is the SUN: look up past the tower into the sun
  {
    at: T.trick,
    from: [-3.6, 0.6, -3.4],
    to: [-3.0, 0.8, -2.8],
    look: [6, 12, 4.8],
    whip: 1,
    tilt: 0.2,
  },
  // thermal camera: one side hot, one side cold
  { at: T.knallt, from: [0, 4.2, 21.5], to: [0, 4.6, 18.5], look: [0, 5.6, 0], thermal: true },
  { at: T.heisse, from: [1.2, 6.2, 14.5], to: [0.8, 6.4, 12.8], look: [0, 6.4, 0], thermal: true },
  // like a banana
  { at: T.wie2, from: C(0.0, 1.9, 2.0), to: C(0.0, 1.75, 1.6), look: C(0.12, 0.98, 0) },
  {
    at: T.schon,
    from: C(-0.5, 1.25, 0.9),
    to: C(-0.35, 1.2, 0.75),
    look: C(0.12, 0.98, 0),
    whip: -1,
  },
  // Übrigens: winter, snow, it shrinks
  { at: T.fakt, from: [-9, 5.5, -19], to: [-7, 5.0, -16], look: [0, 5.6, 0] },
  // every year since 1889: the tower breathes with the seasons
  { at: T.jedes, from: [8, 2.2, 17], to: [6.8, 2.6, 14.5], look: [0, 6.0, 0] },
  // payoff: time-lapse, the sun sweeps, the tip bends away from it
  { at: T.deshalb, from: [0, 3.2, 23.5], to: [0, 4.2, 20], look: [0, 6.6, 0] },
  // from above: the tip draws its circle
  { at: T.den, from: [0.6, 25, 7.5], to: [0.4, 23, 5.8], look: [0, 8, 0], tilt: 0.1 },
  // CTA: the postcard again, golden
  { at: T.warst, orbit: { c: [0, 5.4, 0], r: 17, y: 2.4, a0: 2.75, a1: 3.1 } },
  { at: T.schreib, from: [-4, 0.7, 15.5], to: [-3.2, 1.0, 12.5], look: [0, 6.0, 0] },
];

// ---------------------------------------------------------------- labels (one at a time, 3)
export const LABELS = [
  { text: "Eisen", at: T.eisen + 0.05, until: T.eisen2 - 0.1, pos: [1.62, 1.45, 1.62], side: -1 },
  {
    text: "Sonnenseite",
    at: T.heisse + 0.05,
    until: T.schatten - 0.1,
    pos: [0.75, 4.3, 0.75],
    side: 1,
  },
  {
    text: "Schattenseite",
    at: T.schatten + 0.05,
    until: T.wie2 - 0.1,
    pos: [-0.75, 4.3, 0.75],
    side: -1,
  },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "shake", at: 0.15, dur: 0.6, amp: 0.7 }, // the tower creaks and sways
  { kind: "zoom", at: T.verbiegt, amount: 0.3 },
  { kind: "flash", at: T.sommertag },
  { kind: "slowmo", at: T.spitze, until: T.wind, speed: 0.5 }, // the tip wanders
  { kind: "shake", at: T.erdbeben, dur: 0.4, amp: 0.4 },
  { kind: "zoom", at: T.laenger, amount: 0.3 },
  { kind: "shake", at: T.ofen + 0.1, dur: 0.35, amp: 0.4 }, // the dough jumps up
  { kind: "flash", at: T.zehn },
  { kind: "shake", at: T.zentimeter, dur: 0.5, amp: 0.5 },
  { kind: "flash", at: T.sonne },
  { kind: "zoom", at: T.laenger2, amount: 0.3 },
  { kind: "flash", at: T.krumm },
  { kind: "zoom", at: T.schrumpft, amount: 0.25 },
  { kind: "flash", at: T.weg },
  { kind: "shake", at: T.weg + 0.1, dur: 0.4, amp: 0.4 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "knarzen", at: 0.0, db: -5 }, // the iron giant groans on frame 0
  { s: "knarzen", at: T.wandert - 0.1, db: -9 },
  { s: "hitze", at: T.waerme - 0.1, db: -11 },
  { s: "pop", at: T.ofen + 0.05, db: -10 },
  { s: "knarzen", at: T.zehn, db: -10 },
  { s: "hitze", at: T.knallt, db: -12 },
  { s: "knarzen", at: T.laenger2 - 0.1, db: -9 },
  { s: "klack", at: T.krumm, db: -10 },
  { s: "knarzen", at: T.biegt, db: -8 },
];
