// #75 Eine Woche ohne Zucker — every time-keyed decision as plain data
// (scene.js reads it for the picture, scripts/build-sfx.mjs for the sound).
import { W } from "./timing.js";

// mini-sets far away from the living room (scene.js builds them)
export const KASSE = [30, 0, 0];
export const BODY = [60, 0, 0];
export const TONGUE = [90, 0, 0];
export const BRAIN = [60, 1.45, 0];
export const LIVER = [60.05, 0.55, 0.15];

export const T = {
  zucker: W("Zucker", 1),
  gehirn: W("Gehirn", 1),
  keine: W("Keine", 1),
  schoki: W("Schoki"),
  cola: W("Cola", 1),
  ketchup: W("Ketchup", 1),
  ketchup2: W("Ketchup", 2),
  loeffel: W("Löffel"),
  wuerfel: W("Würfelzucker", 1),
  schon: W("Schon"),
  kopf: W("Kopf"),
  gereizt: W("gereizt"),
  kasse: W("Kasse"),
  schreit: W("schreit"),
  riegel: W("Schokoriegel"),
  denn: W("Denn"),
  belohnung: W("Belohnung"),
  jeder: W("Jeder", 2),
  dopamin: W("Dopamin"),
  jetzt: W("Jetzt"),
  kick: W("Kick"),
  zurueck: W("zurück"),
  folge: W("Folge"),
  rate: W("Rate"),
  rund: W("Rund"),
  dreissig: W("30"),
  wuerfel2: W("Würfelzucker", 2),
  ab: W("Ab"),
  drei: W("drei"),
  verhungert: W("verhungert"),
  leber: W("Leber"),
  selbst: W("selbst"),
  zunge: W("auf"),
  verrueckt: W("Verrücktes"),
  zellen: W("Geschmackszellen"),
  neu: W("neu"),
  viele: W("Viele"),
  sieben: W("sieben"),
  apfel: W("Apfel"),
  suess: W("süß"),
  fakt: W("Übrigens"),
  saft: W("Orangensaft"),
  cola2: W("Cola", 2),
  frage: W("würdest"),
};

const k = KASSE[0];
const b = BODY[0];
const g = TONGUE[0];
// zoom 1 for every shot (scene.js): positions are literal metres
export const shots = [
  // hook: hand sweeps the sweets into the box, fast push-in, lid slams ~1.15 s
  { at: 0, from: [-0.02, 0.95, 1.05], to: [0.08, 0.8, 0.8], look: [0.14, 0.52, 0] },
  // the taped box shakes — the sweets want out
  { at: 1.3, from: [0.82, 0.74, 0.62], to: [0.68, 0.66, 0.5], look: [0.36, 0.52, 0.06] },
  // Schoki ✕, Cola ✕ pop out of the box
  { at: T.keine - 0.05, from: [0.35, 0.82, 0.86], to: [0.38, 0.8, 0.74], look: [0.37, 0.68, 0.06] },
  // Ketchup ✕ … Ketchup?
  {
    at: T.ketchup - 0.1,
    from: [-0.12, 0.64, 0.5],
    to: [-0.2, 0.6, 0.4],
    look: [-0.4, 0.54, -0.12],
    whip: 1,
  },
  // a spoonful = a sugar cube (money shot 1)
  {
    at: T.loeffel - 0.1,
    from: [-0.02, 0.6, 0.44],
    to: [-0.12, 0.55, 0.36],
    look: [-0.24, 0.46, 0.12],
  },
  // day 1: wide room, the lamp flickers, the head buzzes
  { at: T.schon - 0.05, from: [1.75, 1.45, 2.7], to: [1.4, 1.3, 2.25], look: [-0.4, 0.75, -1.2] },
  // checkout: every chocolate bar screams for you (money shot 2)
  {
    at: T.kasse - 0.3,
    from: [k + 1.7, 1.45, 3.4],
    to: [k + 1.1, 1.3, 2.7],
    look: [k - 0.2, 0.95, 0],
  },
  {
    at: T.riegel - 0.05,
    from: [k - 0.35, 1.2, 0.9],
    to: [k - 0.15, 1.18, 0.75],
    look: [k, 1.12, 0.15],
    whip: -1,
  },
  // the brain and its reward
  { at: T.denn - 0.05, from: [b + 1.3, 1.9, 3.9], to: [b + 0.8, 1.75, 3.2], look: [b, 1.25, 0] },
  { at: T.jeder - 0.05, orbit: { c: [b, 1.3, 0], r: 2.9, y: 1.85, a0: -0.6, a1: 0.25 } },
  { at: T.jetzt - 0.05, from: [b - 0.7, 0.9, 3.0], to: [b - 0.45, 1.05, 2.6], look: [b, 1.4, 0] },
  // Folge für mehr Wissen: back in the room, the box rattles
  { at: T.folge - 0.05, from: [1.1, 0.95, 1.55], to: [0.9, 0.85, 1.3], look: [0.15, 0.5, -0.05] },
  // Rate mal → 30 sugar cubes pile up (mid-twist money shot)
  { at: T.rate - 0.05, from: [0.05, 0.98, 1.05], to: [0.02, 0.86, 0.84], look: [0, 0.63, 0] },
  // day 3: calmer, warmer
  { at: T.ab - 0.05, from: [-1.6, 1.2, 2.4], to: [-1.3, 1.1, 2.05], look: [0.3, 0.7, -1.0] },
  // the liver makes sugar itself
  {
    at: T.verhungert - 0.55,
    from: [b + 1.1, 1.55, 3.6],
    to: [b + 0.8, 1.45, 3.1],
    look: [b, 1.2, 0],
  },
  {
    at: T.leber - 0.05,
    from: [b - 1.2, 0.8, 3.2],
    to: [b - 0.9, 0.95, 2.8],
    look: [b, 0.85, 0],
    lookTo: [b, 1.1, 0],
  },
  // on your tongue: a pink landscape
  {
    at: T.zunge - 0.05,
    from: [g - 0.8, 0.5, 2.0],
    to: [g - 0.3, 0.38, 1.3],
    look: [g, 0.06, -0.4],
  },
  {
    at: T.zellen - 0.05,
    from: [g + 0.45, 0.3, 0.66],
    to: [g + 0.3, 0.26, 0.52],
    look: [g + 0.1, 0.16, -0.12],
  },
  // day 7: the apple
  { at: T.viele - 0.05, from: [1.6, 1.25, 2.3], to: [1.2, 1.05, 1.85], look: [-0.2, 0.6, -0.6] },
  { at: T.apfel - 0.1, from: [0.6, 0.78, 0.92], to: [0.48, 0.74, 0.76], look: [0.1, 0.6, 0.15] },
  // Übrigens: orange juice vs cola, sugar cube columns
  { at: T.fakt - 0.05, from: [0.5, 0.8, 1.05], to: [0.3, 0.72, 0.88], look: [0, 0.58, 0.1] },
  // comment question: slow orbit around the table
  { at: T.frage - 0.1, orbit: { c: [0, 0.55, 0.05], r: 1.05, y: 0.95, a0: -0.55, a1: -0.15 } },
];

export const LABELS = [
  { text: "Würfelzucker", at: T.wuerfel, until: T.schon, pos: [-0.24, 0.5, 0.12], side: 1 },
  {
    text: "Belohnung",
    at: T.belohnung,
    until: T.jeder,
    pos: [BRAIN[0] - 0.1, BRAIN[1] + 0.3, 0.2],
    side: -1,
  },
  {
    text: "Dopamin",
    at: T.dopamin,
    until: T.jetzt,
    pos: [BRAIN[0] + 0.45, BRAIN[1] + 0.25, 0.15],
    side: 1,
  },
  {
    text: "Leber",
    at: T.leber,
    until: T.zunge,
    pos: [LIVER[0] - 0.3, LIVER[1] + 0.05, LIVER[2] + 0.15],
    side: -1,
  },
  {
    text: "Geschmackszellen",
    at: T.zellen,
    until: T.viele,
    pos: [TONGUE[0] + 0.1, 0.03, 0.1],
    side: -1,
  },
  { text: "Orangensaft", at: T.saft, until: T.frage, pos: [-0.13, 0.55, 0.12], side: -1 },
];

export const HIGHLIGHTS = [
  { kind: "zoom", at: 0.0, amount: 0.3 }, // sweets flying
  { kind: "flash", at: 1.12 }, // the lid slams
  { kind: "shake", at: 1.12, dur: 0.35, amp: 0.7 },
  { kind: "zoom", at: T.wuerfel, amount: 0.35 }, // the cube pops out of the ketchup
  { kind: "shake", at: T.kopf, dur: 0.8, amp: 0.5 }, // the head buzzes
  { kind: "zoom", at: T.schreit, amount: 0.35 },
  { kind: "shake", at: T.schreit + 0.1, dur: 0.5, amp: 0.6 },
  { kind: "flash", at: T.belohnung + 0.1 },
  { kind: "shake", at: T.zurueck, dur: 0.5, amp: 0.6 },
  { kind: "flash", at: T.dreissig },
  { kind: "zoom", at: T.dreissig, amount: 0.3 },
  { kind: "zoom", at: T.leber, amount: 0.3 },
  { kind: "slowmo", at: T.neu - 0.15, until: T.viele - 0.05, speed: 0.4 },
  { kind: "flash", at: T.suess },
  { kind: "zoom", at: T.suess, amount: 0.3 },
  { kind: "zoom", at: T.saft, amount: 0.25 },
];

export const SFX = [
  { s: "knister", at: 0.0, db: -8 }, // wrapper crinkle on frame 0
  { s: "pop", at: 0.38, db: -10 },
  { s: "pop", at: 0.6, db: -10 },
  { s: "pop", at: 0.82, db: -10 },
  { s: "klack", at: 1.12, db: -4 }, // the lid slams
  { s: "boing", at: T.keine + 0.15, db: -14 },
  { s: "boing", at: T.cola, db: -14 },
  { s: "pop", at: T.wuerfel, db: -8 },
  { s: "brumm", at: T.kopf, dur: 1.0, db: -15 },
  { s: "boing", at: T.schreit + 0.05, db: -11 },
  { s: "boing", at: T.schreit + 0.3, db: -13 },
  { s: "boing", at: T.riegel + 0.1, db: -12 },
  { s: "wow", at: T.belohnung + 0.1, db: -12 },
  { s: "surr", at: T.jeder, dur: T.jetzt - T.jeder, db: -22 },
  { s: "zuckerwuerfel", at: T.rate + 0.3, db: -9 },
  { s: "pop", at: T.leber, db: -9 },
  { s: "rauschen", at: T.leber + 0.4, dur: T.zunge - T.leber - 0.4, db: -24 },
  { s: "pop", at: T.neu, db: -10 },
  { s: "pop", at: T.viele + 0.2, db: -12 },
  { s: "pop", at: T.fakt + 0.15, db: -12 },
  { s: "zuckerwuerfel", at: T.saft + 0.1, db: -12 },
];
