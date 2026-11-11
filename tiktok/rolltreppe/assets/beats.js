// #72 Rolltreppe — every time-keyed decision as plain data (read by scene.js
// and scripts/build-sfx.mjs). No three.js / DOM in here.
import { W } from "./timing.js";

export const H = 3.464; // rise of the escalator

export const T = {
  putzen: W("putzen"),
  keine: W("keine"),
  du: W("Du"),
  genau: W("Genau"),
  kosten: W("kosten"),
  denn: W("Denn"),
  oben: W("Oben"),
  kamm: W("Metallkamm"),
  dann: W("Dann"),
  kopf: W("kopfüber"),
  endlose: W("endlose"),
  kette: W("Kette"),
  folge: W("Folge"),
  rate: W("Rate"),
  stufe: W("Stufe"),
  handlauf1: W("Handlauf", 1),
  handlauf2: W("Handlauf", 2),
  waere: W("Wäre"),
  hinten: W("hinten"),
  jetzt: W("Jetzt"),
  zwischen: W("Zwischen"),
  spalt: W("Spalt", 1),
  vier: W("vier"),
  aber: W("Aber"),
  wand: W("Wand", 2),
  weiche: W("Weiche"),
  zack: W("zack"),
  darum: W("Darum"),
  spuerst: W("Spürst"),
  zuckt: W("zuckt"),
  weg: W("weg"),
  fakt: W("Übrigens"),
  stolperst: W("stolperst"),
  gehirn: W("Gehirn"),
  stehst: W("Stehst"),
  rechts: W("rechts"),
  links: W("links"),
};

// rel: "foot" = relative to the rider's right foot (the camera rides along)
export const shots = [
  // hook: the sneaker scrubbing the brush, fast push-in
  {
    at: 0,
    rel: "foot",
    from: [-0.46, 0.28, 0.33],
    to: [-0.38, 0.23, 0.28],
    look: [0.13, 0.09, -0.03],
  },
  {
    at: T.putzen,
    rel: "foot",
    from: [-0.08, 0.66, -0.22],
    to: [-0.02, 0.5, -0.15],
    look: [0.12, 0.05, 0],
  },
  { at: T.du, from: [-1.0, 1.25, 7.0], to: [-0.7, 1.45, 5.7], look: [0.2, 1.9, -1] },
  {
    at: T.genau,
    rel: "foot",
    from: [0.02, 0.46, 0.44],
    to: [0.05, 0.33, 0.32],
    look: [0.08, 0.02, -0.04],
  },
  // x-ray: the loop of steps
  { at: T.denn, from: [-5.2, 1.5, 8.2], to: [-4.3, 1.3, 7.2], look: [0, 1.7, -0.8] },
  { at: T.oben, from: [-0.3, H + 1.5, -1.9], to: [-0.2, H + 0.95, -2.8], look: [0.05, H, -3.9] },
  {
    at: T.kamm,
    from: [0.5, H + 0.34, -3.4],
    to: [0.34, H + 0.22, -3.56],
    look: [0, H + 0.02, -3.88],
  },
  { at: T.dann, from: [-3.3, 2.85, -2.5], to: [-2.7, 3.0, -3.2], look: [0, H - 0.42, -4.55] },
  {
    at: T.kopf,
    from: [-2.4, 1.0, 0.6],
    to: [-2.0, 1.0, -0.2],
    look: [0, 1.75, -1.6],
    whip: 1,
  },
  { at: T.endlose, from: [-5.0, 1.7, 6.6], to: [-4.2, 1.45, 5.8], look: [0, 1.6, -0.6] },
  { at: T.folge, from: [-0.5, 1.2, 7.3], to: [-0.3, 1.5, 6.3], look: [0.1, 2.5, -1] },
  // "Rate mal": hand on the rail + foot on the step, seen through the glass
  {
    at: T.rate,
    rel: "foot",
    from: [-0.6, 2.05, 1.75],
    to: [-0.5, 1.85, 1.5],
    look: [0.18, 0.62, -0.15],
  },
  {
    at: T.handlauf2,
    rel: "foot",
    from: [0.58, 1.75, 0.9],
    to: [0.52, 1.6, 0.65],
    look: [0.22, 1.05, -0.25],
  },
  {
    at: T.waere,
    rel: "foot",
    from: [2.1, 1.5, 0.9],
    to: [1.9, 1.45, 0.6],
    look: [0.15, 1.0, 0.05],
  },
  // the gap
  {
    at: T.jetzt,
    rel: "foot",
    from: [-0.55, 0.95, 0.32],
    to: [-0.2, 0.36, 0.12],
    look: [0.14, 0.0, -0.02],
  },
  {
    at: T.zwischen,
    rel: "foot",
    from: [0.08, 0.2, 0.55],
    to: [0.1, 0.13, 0.36],
    look: [0.15, 0.02, -0.1],
  },
  {
    at: T.aber,
    from: [-0.3, H - 0.05, -0.8],
    to: [-0.22, H - 0.12, -1.05],
    look: [0.5, 2.92, -1.9],
  },
  {
    at: T.weiche,
    rel: "foot",
    from: [0.0, 0.5, 0.46],
    to: [0.04, 0.34, 0.32],
    look: [0.08, 0.02, -0.04],
  },
  // payoff: the brush warns the foot
  {
    at: T.darum,
    rel: "foot",
    from: [-0.3, 0.34, -0.3],
    to: [-0.17, 0.25, -0.24],
    look: [0.14, 0.1, -0.1],
  },
  {
    at: T.spuerst,
    rel: "foot",
    from: [-0.6, 0.55, 0.5],
    to: [-0.42, 0.42, 0.38],
    look: [0.08, 0.07, -0.03],
  },
  // Übrigens: the standing escalator
  { at: T.fakt, from: [-1.3, 0.9, 8.8], to: [-1.0, 0.9, 8.0], look: [0.3, 0.9, 4.6] },
  { at: T.stolperst, from: [-0.36, 1.05, 6.0], to: [-0.3, 0.95, 5.6], look: [0.26, 0.8, 3.5] },
  { at: T.stehst, from: [0, 1.3, 7.6], to: [0, 1.6, 6.4], look: [0, 2.4, -1] },
];

// positions are filled in by scene.js (most of them ride along)
export const LABELS = [
  { text: "Kammplatte", at: T.kamm, until: T.dann, pos: [0, 0, 0], side: 1 },
  { text: "Kette", at: T.kette, until: T.folge, pos: [0, 0, 0], side: -1 },
  { text: "Stufe", at: T.stufe, until: T.handlauf2, pos: [0, 0, 0], side: -1 },
  { text: "Handlauf", at: T.handlauf1, until: T.handlauf2, pos: [0, 0, 0], side: -1 },
  { text: "Spalt", at: T.spalt, until: T.aber, pos: [0, 0, 0], side: -1 },
  { text: "Wand", at: T.wand, until: T.weiche, pos: [0, 0, 0], side: 1 },
  { text: "Bürste", at: T.darum, until: T.spuerst, pos: [0, 0, 0], side: -1 },
  { text: "stehen", at: T.rechts, until: 99, pos: [0, 0, 0], side: 1 },
  { text: "gehen", at: T.links, until: 99, pos: [0, 0, 0], side: -1 },
];

export const HIGHLIGHTS = [
  { kind: "zoom", at: T.keine, amount: 0.3 },
  { kind: "shake", at: T.kosten, dur: 0.5, amp: 1.2 },
  { kind: "flash", at: T.denn },
  { kind: "zoom", at: T.kamm, amount: 0.3 },
  { kind: "zoom", at: T.handlauf2, amount: 0.3 },
  { kind: "shake", at: T.hinten, dur: 0.45 },
  { kind: "zoom", at: T.vier, amount: 0.3 },
  { kind: "flash", at: T.zack },
  { kind: "shake", at: T.zack, dur: 0.6, amp: 1.4 },
  { kind: "slowmo", at: T.zack + 0.25, until: T.darum, speed: 0.35 },
  { kind: "zoom", at: T.zuckt, amount: 0.3 },
  { kind: "shake", at: T.stolperst + 0.1, dur: 0.5 },
];

export const SFX = [
  { s: "schrubb", at: 0.02, db: -7 }, // the sneaker scrubs the brush (own sound)
  { s: "klack", at: T.kosten },
  { s: "brumm", at: T.denn, dur: 3.2, db: -19 },
  { s: "klack", at: T.kamm, db: -8 },
  { s: "surr", at: T.kopf, dur: 1.6, db: -22 },
  { s: "pop", at: T.handlauf2 },
  { s: "boing", at: T.hinten, db: -10 },
  { s: "ratsch", at: T.zack, db: -6 }, // the lace is ripped into the gap (own sound)
  { s: "piep", at: T.zack + 0.25, dur: 0.8, db: -14 },
  { s: "boing", at: T.zuckt, db: -9 },
  { s: "klack", at: T.fakt + 0.15, db: -8 },
  { s: "pop", at: T.stolperst + 0.1 },
];
