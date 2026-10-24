// Beats of #29 "Blitz ins Auto" (format B): every time-keyed decision as
// plain data, read by scene.js (picture) and scripts/build-sfx.mjs (sound).
// No three.js / DOM here — node imports it too.
import { W } from "./timing.js";

// ---------------------------------------------------------------- beats
export const T = {
  wenn1: W("wenn", 1),
  blitz1: W("Blitz", 1),
  haeltst: W("hältst"),
  es: W("es"),
  knallt: W("knallt"),
  alle: W("Alle"),
  reifen1: W("Reifen", 1),
  stell: W("Stell"),
  landstrasse: W("Landstraße"),
  gewitter: W("Gewitter"),
  allein: W("allein"),
  ploetzlich: W("Plötzlich"),
  weiss: W("weiß"),
  der2: W("Blitz", 2) - 0.12,
  heisser: W("heißer"),
  sonne: W("Sonne"),
  und1: W("Und", 3),
  trifft: W("trifft"),
  dach1: W("Dach", 1),
  folg: W("Folg"),
  jetzt: W("Jetzt"),
  strom: W("Strom"),
  boden: W("Boden"),
  dazwischen: W("dazwischen"),
  radio: W("Radio"),
  knackt: W("knackt"),
  dein2: W("Armaturenbrett") - 0.16,
  schwarz: W("schwarz"),
  glaubst: W("Was", 2),
  spannung: W("Spannung"),
  hunderte: W("Hunderte"),
  millionen: W("Millionen"),
  reifen2: W("Reifen", 2),
  dagegen: W("Dagegen"),
  witz: W("Witz"),
  kilometerweit: W("kilometerweit"),
  gerast: W("gerast"),
  bisschen: W("bisschen"),
  gummi: W("Gummi"),
  fliesst: W("fließt"),
  metall: W("Metall"),
  faraday: W("Faradaysche"),
  kaefig: W("Käfig"),
  nur: W("Nur", 2),
  cabrio: W("Cabrio"),
  pech: W("Pech"),
  nicht: W("Nicht"),
  retten3: W("retten", 2),
  blech: W("Blech"),
  fakt: W("Übrigens"),
  flugzeug: W("Verkehrsflugzeug"),
  einmal: W("einmal"),
  cta: W("Was", 3),
};
T.du1 = T.haeltst - 0.1;
T.reifenCut = T.reifen1 - 0.12;
T.dachStrike = T.trifft + 0.2; // scene time of the roof strike inside the slowmo
// real time of that strike: slowmo from T.trifft at 0.35×
T.dachReal = T.trifft + 0.2 / 0.35;

// ---------------------------------------------------------------- strikes
// [time, which bolt] — scene.js lights the bolt, the world flashes, a
// thunder sound plays (sound times are real times; inside the slowmo the
// roof strike is mapped with T.dachReal)
export const STRIKES = [
  { at: -0.03, bolt: "roof" },
  { at: 0.62, bolt: "roof", sound: false },
  { at: T.wenn1 + 0.12, bolt: "roof" },
  { at: T.blitz1 + 0.02, bolt: "roof", sound: false },
  { at: T.knallt - 0.04, bolt: "roof" },
  { at: T.weiss - 0.05, bolt: "oak" },
  { at: T.dachStrike, real: T.dachReal, bolt: "roof" },
  { at: T.hunderte + 0.02, bolt: "roof" },
  { at: T.kilometerweit + 0.15, bolt: "roof" },
  { at: T.cabrio + 0.9, bolt: "cabrio" },
  { at: T.flugzeug + 0.1, bolt: "plane" },
  { at: T.einmal + 0.02, bolt: "plane", sound: false },
  { at: T.cta + 1.4, bolt: "far1", soft: true },
  { at: T.cta + 3.4, bolt: "far2", soft: true },
];
// the roof bolt is "frozen" (held, flickering) while the current is explained
export const HOLDS = [
  [T.jetzt, T.radio],
  [T.glaubst, T.reifen2],
  [T.kilometerweit + 0.5, T.nur],
];

// ---------------------------------------------------------------- shots
// CAB = the convertible set, PL = the plane above the clouds (scene.js)
export const shots = [
  // hook: inside, your hand on the wheel, the bolt slams down in front
  { at: 0, from: [6.8, 1.0, 7.8], to: [5.5, 1.1, 6.3], look: [0.2, 1.6, 0], zoom: 1, tilt: 0.4 },
  // outside: the bolt on your roof
  {
    at: T.wenn1,
    from: [2.2, 2.0, -9.2],
    to: [1.5, 1.85, -7.8],
    look: [0, 1.4, 0],
    zoom: 1,
    tilt: 0.4,
  },
  // crash in on the strike point
  { at: T.blitz1, from: [2.5, 2.7, 2.6], to: [1.9, 2.35, 2.0], look: [0, 1.5, 0], zoom: 1 },
  // over your shoulder: the hand on the wheel, flashes outside
  {
    at: T.du1,
    from: [-0.42, 1.3, -0.4],
    to: [-0.34, 1.28, -0.39],
    look: [1.6, 0.98, -0.3],
    zoom: 1,
    tilt: 0.3,
  },
  // it bangs: wide, the whole car lit white
  { at: T.es, from: [8.5, 3.2, 9.5], to: [7.2, 2.6, 8.0], look: [0, 1.2, 0], zoom: 1 },
  // low by the front wheel
  { at: T.alle, from: [2.9, 0.38, 3.4], to: [2.3, 0.42, 2.7], look: [1.3, 0.45, 0.8], zoom: 1 },
  // the tyres (crash zoom)
  {
    at: T.reifenCut,
    from: [2.1, 0.48, 2.1],
    to: [1.85, 0.44, 1.8],
    look: [1.3, 0.36, 0.86],
    zoom: 1,
  },
  // story: drone over the stormy valley towards the lone car
  { at: T.stell, from: [-24, 13, 24], to: [-13, 7.5, 14], look: [0, 0.6, -2], zoom: 1 },
  // along the wet road, posts flying by
  { at: T.landstrasse, from: [-14, 1.0, -1.7], to: [-9, 0.9, -1.4], look: [0, 0.8, -0.4], zoom: 1 },
  // up into the storm clouds
  {
    at: T.gewitter,
    from: [3.2, 1.6, 8.5],
    to: [3.0, 1.7, 8.2],
    look: [-2, 14, -18],
    lookTo: [-6, 16, -20],
    zoom: 1,
    tilt: 0.3,
  },
  // you, alone: the car small under the street lamp
  { at: T.allein, from: [15, 5.5, 17], to: [12.5, 4.6, 14], look: [0, 0.8, 0], zoom: 1 },
  // suddenly: the driver through the side window
  {
    at: T.ploetzlich,
    from: [0.9, 1.55, -5.2],
    to: [0.5, 1.5, -4.3],
    look: [-0.3, 1.25, -0.4],
    zoom: 1,
  },
  // white: the oak in the field is hit
  {
    at: T.weiss,
    from: [5.5, 1.6, 4.5],
    to: [5.0, 1.8, 3.6],
    look: [10, 5, -9],
    zoom: 1,
    tilt: 0.3,
  },
  // hotter than the sun: the bolt next to the sun (rel "VS")
  {
    at: T.der2,
    rel: "VS",
    from: [0.5, 0.4, 13],
    to: [0.2, 0.3, 11],
    look: [0, 0, 0],
    zoom: 1,
    tilt: 0,
  },
  // and it hits your roof: low, slow motion
  { at: T.und1, from: [6.2, 0.9, 6.6], to: [5.0, 1.1, 5.4], look: [0, 1.7, 0], zoom: 1, tilt: 0.4 },
  // follow line: calm front view, headlights in the rain
  { at: T.folg, from: [7.6, 1.5, 1.8], to: [6.6, 1.35, 1.5], look: [0, 0.9, -0.1], zoom: 1 },
  // the current wants into the ground: 3/4, bolt frozen
  { at: T.jetzt, from: [5.4, 2.6, 6.8], to: [4.6, 2.2, 5.8], look: [0, 1.0, 0], zoom: 1 },
  // down to the road
  {
    at: T.boden - 0.38,
    from: [3.0, 0.5, 4.0],
    to: [2.6, 0.4, 3.4],
    look: [0, 0.3, 0],
    zoom: 1,
    tilt: 0.4,
  },
  // and you sit in between (side window, the arrow through you)
  {
    at: T.dazwischen - 0.18,
    from: [-0.6, 1.5, -3.8],
    to: [-0.45, 1.42, -3.1],
    look: [-0.3, 1.0, -0.4],
    zoom: 1,
  },
  // the radio crackles
  {
    at: T.radio - 0.08,
    from: [-0.05, 1.27, 0.32],
    to: [0.12, 1.22, 0.24],
    look: [0.78, 1.0, 0.0],
    zoom: 1,
    tilt: 0,
  },
  // the dashboard goes black
  {
    at: T.dein2,
    from: [-0.62, 1.36, 0.05],
    to: [-0.5, 1.32, -0.02],
    look: [0.75, 1.0, -0.1],
    zoom: 1,
    tilt: 0.2,
  },
  // guess: under the bolt, looking up
  {
    at: T.glaubst,
    from: [6.4, 0.6, 7.8],
    to: [5.6, 0.7, 6.8],
    look: [1.8, 9, -1.5],
    lookTo: [0.4, 4, -0.2],
    zoom: 1,
    tilt: 0.3,
  },
  // hundreds of millions of volts
  { at: T.hunderte, from: [3.8, 2.3, 3.8], to: [3.0, 1.9, 3.0], look: [0, 1.5, 0], zoom: 1 },
  // and your tyres?
  {
    at: T.reifen2 - 0.18,
    from: [3.6, 0.9, 3.9],
    to: [3.1, 0.75, 3.3],
    look: [1.3, 0.45, 0.85],
    zoom: 1,
  },
  // a joke (macro)
  { at: T.dagegen, from: [2.7, 0.6, 2.7], to: [2.45, 0.55, 2.4], look: [1.3, 0.4, 0.9], zoom: 1 },
  // it raced kilometres through the air: tilt from the car up the bolt
  {
    at: T.kilometerweit - 0.12,
    from: [16, 2.6, 21],
    to: [20, 3.6, 26],
    look: [0, 2, 0],
    lookTo: [3, 15, -5],
    zoom: 1,
    tilt: 0.2,
  },
  // a bit of rubber: the arc jumps the tyre
  {
    at: T.bisschen - 0.2,
    from: [3.0, 0.4, 2.9],
    to: [2.55, 0.35, 2.4],
    look: [1.35, 0.25, 1.0],
    zoom: 1,
    tilt: 0.3,
  },
  // it flows around you over the metal (x-ray)
  { at: T.fliesst - 0.08, from: [4.8, 2.7, 5.9], to: [3.9, 2.3, 4.8], look: [0, 0.95, 0], zoom: 1 },
  // the Faraday cage: orbit
  { at: T.faraday - 0.52, orbit: { c: [0, 0.95, 0], r: 5.4, y: 2.5, a0: 0.95, a1: -0.25 } },
  // only in a convertible without a roof (rel "CAB")
  { at: T.nur, rel: "CAB", from: [4.6, 2.3, 5.4], to: [3.6, 1.9, 4.3], look: [0, 0.8, 0], zoom: 1 },
  // payoff: the car stands, lights back on
  {
    at: T.nicht,
    from: [5.0, 0.62, 4.3],
    to: [4.0, 0.72, 3.5],
    look: [0, 1.0, 0],
    zoom: 1,
    tilt: 0.4,
  },
  // the sheet metal all around
  { at: T.blech - 0.14, from: [3.2, 3.0, 3.4], to: [2.7, 2.6, 2.9], look: [-0.4, 1.2, 0], zoom: 1 },
  // bonus fact: the plane above the clouds (rel "PL")
  { at: T.fakt, rel: "PL", orbit: { c: [0, 0, 0], r: 7.5, y: 1.6, a0: 0.75, a1: -0.15 } },
  // CTA: drone pull-back over the stormy valley
  {
    at: T.cta,
    from: [4.6, 1.5, 5.6],
    to: [19, 11, 28],
    look: [0, 1.0, 0],
    lookTo: [0, 3, -8],
    zoom: 1,
    tilt: 0.6,
  },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Reifen?", at: T.reifen1, until: T.stell, pos: [1.3, 0.4, 0.98], side: -1 },
  { text: "Boden", at: T.boden, until: T.dazwischen - 0.18, pos: [0.4, 0.05, 1.3], side: 1 },
  { text: "Du", at: T.dazwischen + 0.2, until: T.radio - 0.08, pos: [-0.3, 1.3, -0.4], side: 1 },
  { text: "Gummi", at: T.gummi, until: T.fliesst - 0.08, pos: [1.3, 0.12, 1.0], side: -1 },
  { text: "Metall", at: T.metall, until: T.faraday - 0.52, pos: [-0.5, 1.56, 0.4], side: -1 },
  { text: "Faradayscher Käfig", at: T.faraday, until: T.nur, pos: [-0.2, 1.5, 0.6], side: 1 },
  { text: "Kein Dach", at: T.cabrio, until: T.nicht, pos: [0, 0.9, 0], rel: "CAB", side: 1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "shake", at: 0.0, dur: 0.6, amp: 1.0 },
  { kind: "flash", at: 0.63 },
  { kind: "shake", at: 0.63, dur: 0.5, amp: 0.8 },
  { kind: "shake", at: T.wenn1 + 0.13, dur: 0.4, amp: 0.6 },
  { kind: "flash", at: T.knallt - 0.03 },
  { kind: "shake", at: T.knallt - 0.03, dur: 0.6, amp: 1.0 },
  { kind: "zoom", at: T.reifen1, amount: 0.35 },
  { kind: "flash", at: T.weiss - 0.04 },
  { kind: "shake", at: T.weiss - 0.04, dur: 0.5, amp: 0.8 },
  { kind: "slowmo", at: T.trifft, until: T.folg, speed: 0.35 },
  { kind: "flash", at: T.dachReal },
  { kind: "shake", at: T.dachReal, dur: 0.7, amp: 1.2 },
  { kind: "zoom", at: T.schwarz, amount: 0.3 },
  { kind: "flash", at: T.hunderte + 0.03 },
  { kind: "shake", at: T.hunderte + 0.03, dur: 0.7, amp: 1.0 },
  { kind: "shake", at: T.witz, dur: 0.4, amp: 0.5 },
  { kind: "flash", at: T.kilometerweit + 0.16 },
  { kind: "shake", at: T.gummi + 0.1, dur: 0.4, amp: 0.6 },
  { kind: "flash", at: T.cabrio + 0.91 },
  { kind: "shake", at: T.cabrio + 0.91, dur: 0.5, amp: 0.8 },
  { kind: "zoom", at: T.blech, amount: 0.35 },
  { kind: "flash", at: T.flugzeug + 0.11 },
];

// ---------------------------------------------------------------- sound
// own sounds (scripts/sfx-extra.py): donner (close strike), grollen (far
// thunder), radioknacken, regen (rain bed), funken (electric arc)
const rainSpans = [
  [0, T.der2],
  [T.und1, T.nur],
  [T.nur, T.fakt],
  [T.cta, 60],
];
export const SFX = [
  ...rainSpans.flatMap(([a, b]) => {
    const out = [];
    for (let x = a; x < b - 0.2; x += 3.9)
      out.push({ s: "regen", at: x, dur: Math.min(4, b - x), db: -20 });
    return out;
  }),
  ...STRIKES.filter((s) => s.sound !== false).map((s) => ({
    s: s.soft ? "grollen" : "donner",
    at: Math.max(0, (s.real ?? s.at) - 0.02),
    db: s.soft ? -12 : s.bolt === "plane" ? -12 : -7,
  })),
  { s: "grollen", at: T.gewitter + 0.2, db: -11 },
  { s: "surr", at: T.strom, dur: T.radio - T.strom, db: -22 },
  { s: "radioknacken", at: T.knackt - 0.05, db: -9 },
  { s: "funken", at: T.knackt + 0.1, db: -15 },
  { s: "boing", at: T.witz + 0.02, db: -8 },
  { s: "funken", at: T.gummi - 0.05, db: -10 },
  { s: "surr", at: T.fliesst, dur: T.nur - T.fliesst, db: -20 },
  { s: "click", at: T.retten3 + 0.1 },
];
