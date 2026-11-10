// #71 "Alle springen gleichzeitig" — every time-keyed decision as plain data
// (read by scene.js and scripts/build-sfx.mjs). No three.js / DOM here.
import { W } from "./timing.js";

export const T = {
  springen: W("springen", 1),
  kommando: W("Kommando"),
  erde1: W("Erde", 1),
  tritt1: W("Tritt", 1),
  jeder: W("Jeder"),
  absprung: W("Absprung"),
  druckt: W("drückt"),
  ueberall: W("überall"),
  wien: W("Wien"),
  rio: W("Rio"),
  tokio: W("Tokio"),
  unddann: W("Und", 2),
  haengt: W("hängt"),
  luft: W("Luft"),
  eine: W("Eine"),
  fuss: W("Fuß"),
  dann: W("Dann"),
  landen: W("landen"),
  folge: W("Folge"),
  rate: W("Rate"),
  rund: W("Rund"),
  vierhundert: W("400"),
  aber: W("Aber"),
  erde2: W("Erde", 2),
  fuenfzehn: W("15"),
  und3: W("Und", 3),
  australien: W("Australien"),
  tritt2: W("Tritt", 2),
  payoff: W("rutscht") - 0.3,
  tausendstel: W("Tausendstel"),
  atom: W("Atom"),
  federt: W("federt"),
  fakt: W("Übrigens"),
  fans: W("Fans"),
  ein3: W("Messgeräte"),
  erdbeben: W("Mini-Erdbeben"),
  cta: W("welchem"),
};
T.land = T.landen + 0.22; // the moment every foot hits the ground

// ---------------------------------------------------------------- globe
export const GC = [0, 120, -180]; // globe centre, high above the stadium
export const RG = 5; // globe radius
const D2R = Math.PI / 180;
export const dir = (lat, lon) => [
  Math.cos(lat * D2R) * Math.sin(lon * D2R),
  Math.sin(lat * D2R),
  Math.cos(lat * D2R) * Math.cos(lon * D2R),
];
export const CITY = {
  wien: [48.2, 16.4],
  rio: [-22.9, -43.2],
  tokio: [35.7, 139.7],
  au: [-25, 134],
};
const sc = (v, k) => v.map((x) => x * k);
const plus = (...vs) => vs.reduce((a, b) => a.map((x, i) => x + b[i]));
const norm = (v) => sc(v, 1 / Math.hypot(...v));
export const onGlobe = (lat, lon, h = 0) => plus(GC, sc(dir(lat, lon), RG + h));
const dEU = dir(48, 12);
const dAU = dir(...CITY.au);
const nSide = norm(plus(dEU, dAU));
const cityShot = (c, at) => {
  const d = dir(...CITY[c]);
  const side = norm([d[2], 0, -d[0]]);
  return {
    at,
    rel: GC,
    from: plus(sc(d, RG + 4.4), sc(side, 1.2), [0, 0.6, 0]),
    to: plus(sc(d, RG + 3.3), sc(side, 0.6), [0, 0.4, 0]),
    look: sc(d, RG * 0.92),
  };
};
export const ATOM_POS = plus(GC, sc(dEU, RG + 6.0), [2.6, -2.2, 0]);
export const SPECK_POS = plus(GC, [5.6, 2.4, 3.2]);

// ---------------------------------------------------------------- shots
export const shots = [
  // frame 0: your hand slams the button, the whole crowd is in the air
  { at: 0, from: [0.45, 2.45, 15.3], to: [0.3, 2.2, 14.6], look: [0, 0.7, 10] },
  { at: T.springen, from: [15, 27, 31], to: [11.5, 22, 25], look: [0, 1, -12] },
  { at: T.kommando, from: [2.6, 1.4, 10.4], to: [1.6, 1.55, 8.2], look: [-1, 2.3, -2] },
  // the Earth gets a kick
  {
    at: T.erde1,
    rel: GC,
    from: plus(sc(dEU, 19), [1.5, 2.5, 0]),
    to: plus(sc(dEU, 16), [0.6, 1.5, 0]),
    look: [0, 0.4, 0],
  },
  // feet pushing off
  { at: T.jeder, from: [2.3, 0.36, 10.8], to: [1.5, 0.3, 9.7], look: [0, 0.4, 6] },
  // everywhere at once
  {
    at: T.ueberall,
    orbit: { c: GC, r: 16, y: GC[1] + 3.5, a0: 0.75, a1: -0.15 },
  },
  cityShot("wien", T.wien - 0.12),
  cityShot("rio", T.rio - 0.08),
  cityShot("tokio", T.tokio - 0.06),
  // the whole of humanity hangs in the air
  { at: T.unddann, from: [0, 9.5, 27], to: [0, 7.4, 22], look: [0, 2.2, -6] },
  { at: T.eine, from: [-6, 0.22, 11.4], to: [-3, 0.2, 10.6], look: [0, 0.5, -10], focus: 10 },
  // everyone lands
  { at: T.dann, from: [8.5, 3.4, 14.5], to: [7, 2.9, 12.3], look: [0, 1.0, 0] },
  { at: T.folge, from: [3, 3.8, 4.5], to: [2, 3.4, 1.5], look: [0, 6, -40] },
  // how heavy are we all?
  { at: T.rate, from: [0, 36, -3], to: [0, 30, -6], look: [0, 0, -13] },
  { at: T.rund, from: [-3.6, 2.4, 9.8], to: [-2.6, 2.0, 8.7], look: [0, 1.6, 3] },
  // … and the Earth is far heavier
  { at: T.aber, rel: GC, from: [7, 1.5, 17], to: [5.6, 1.2, 14.5], look: [2.2, 0.6, 0] },
  // Australia pushes the other way
  {
    at: T.und3,
    rel: GC,
    from: plus(sc(nSide, 23), [0, 1, 0]),
    to: plus(sc(nSide, 21), [0, 0.5, 0]),
    look: [0, 0, 0],
  },
  // payoff: less than a thousandth of an atom
  {
    at: T.payoff,
    rel: GC,
    from: plus(sc(dEU, 17), [3.2, 1.2, 0]),
    to: plus(sc(dEU, 15), [2.4, 1.0, 0]),
    look: plus(sc(dEU, 2.5), [1.4, 0.7, 0]),
  },
  // Übrigens: a concert crowd made a mini-earthquake
  { at: T.fakt, from: [-14, 24, 29], to: [-10.5, 19, 23], look: [0, 1.2, -10] },
  { at: T.fans - 0.1, from: [-2, 1.5, 9.8], to: [-1, 1.7, 8.0], look: [1, 2.4, 0] },
  { at: T.ein3, from: [12, 5, 16], to: [16, 13, 24], look: [0, 2, -8] },
  { at: T.cta - 0.1, from: [0, 5, 19], to: [0, 5.8, 14], look: [0, 6, -38] },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Wien", at: T.wien, until: T.rio - 0.08, pos: onGlobe(...CITY.wien, 0.15), side: 1 },
  { text: "Rio", at: T.rio, until: T.tokio - 0.06, pos: onGlobe(...CITY.rio, 0.15), side: 1 },
  { text: "Tokio", at: T.tokio, until: T.unddann, pos: onGlobe(...CITY.tokio, 0.15), side: -1 },
  { text: "alle Menschen", at: T.aber + 0.2, until: T.fuenfzehn - 0.05, pos: SPECK_POS, side: 1 },
  {
    text: "Australien",
    at: T.australien,
    until: T.payoff,
    pos: onGlobe(...CITY.au, 0.15),
    side: 1,
  },
  { text: "Atom", at: T.atom, until: T.fakt, pos: ATOM_POS, side: -1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "flash", at: 0.02 },
  { kind: "zoom", at: 0.25, amount: 0.3 },
  { kind: "shake", at: T.springen, dur: 0.45, amp: 0.8 },
  { kind: "flash", at: T.tritt1 },
  { kind: "shake", at: T.tritt1, dur: 0.5, amp: 1 },
  { kind: "zoom", at: T.druckt, amount: 0.25 },
  { kind: "slowmo", at: T.haengt, until: T.eine, speed: 0.4 },
  { kind: "zoom", at: T.fuss, amount: 0.25 },
  { kind: "flash", at: T.land },
  { kind: "shake", at: T.land, dur: 0.7, amp: 1.3 },
  { kind: "zoom", at: T.vierhundert, amount: 0.3 },
  { kind: "zoom", at: T.fuenfzehn, amount: 0.25 },
  { kind: "flash", at: T.tritt2 },
  { kind: "zoom", at: T.atom, amount: 0.35 },
  { kind: "shake", at: T.fakt + 0.2, dur: 0.4, amp: 0.6 },
  { kind: "shake", at: T.erdbeben, dur: 1.4, amp: 1.2 },
];

// ---------------------------------------------------------------- sound
// own sounds (scripts/sfx-extra.py): wumms = thousands of feet landing,
// jubel = stadium crowd roar
export const SFX = [
  { s: "klack", at: 0.0 },
  { s: "jubel", at: 0.0, db: -15 },
  { s: "wumms", at: 0.225, db: -11 },
  { s: "wumms", at: 1.125, db: -14 },
  { s: "wumms", at: 2.025, db: -14 },
  { s: "wumms", at: T.tritt1, db: -10 },
  { s: "wumms", at: T.land, db: -5 },
  { s: "jubel", at: T.land + 0.3, db: -17 },
  { s: "pop", at: T.atom },
  { s: "jubel", at: T.fakt, db: -14 },
  { s: "wumms", at: T.erdbeben + 0.1, db: -9 },
];
