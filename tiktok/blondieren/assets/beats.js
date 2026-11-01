// #46 Blondieren — every time-keyed decision as plain data (scene.js +
// scripts/build-sfx.mjs). No three.js / DOM here.
import { W } from "./timing.js";

// places: SALON (origin) = the viewer in the styling chair, head full of
// foils. HAAR = one giant hair lying along x, far under the floor (cuticle
// scales, cortex, keratin fibres with bridges, pigment granules). GRAU = a
// cut through the scalp with a hair follicle, even deeper.
export const HAAR = [0, -60, 0];
export const H = (x, y, z) => [x + HAAR[0], y + HAAR[1], z + HAAR[2]];
export const GRAU = [0, -120, 0];
export const G = (x, y, z) => [x + GRAU[0], y + GRAU[1], z + GRAU[2]];
export const HEAD = [0, 2.85, 0.05]; // head centre of the viewer (world)
// hero points in the hair (HAAR local)
export const HB = [0.75, 0.25, 0.7]; // hero brown granule
export const HR = [-0.85, -0.1, 0.75]; // hero red granule
export const HRUNG = [1.45, 0.35, 0.0]; // a bridge in front (local x, y offset, z) — scene snaps it

// ---------------------------------------------------------------- beats
export const T = {
  blond: W("Blondieren"),
  haar1: W("Haar", 1),
  orange1: W("orange"),
  da: W("Da"),
  und1: W("Und", 1),
  wartet: W("wartet"),
  haare1: W("Haare", 1),
  kaugummi: W("Kaugummi"),
  stell: W("Stell"),
  friseur: W("Friseur"),
  paste: W("Paste"),
  kribbelt: W("kribbelt"),
  erst: W("Erst", 2),
  knackt1: W("knackt", 1),
  schuppen: W("Schuppen"),
  dachziegel: W("Dachziegel"),
  dann: W("Dann"),
  h2o2a: W("Wasserstoffperoxid", 1),
  dasselbe: W("Dasselbe"),
  wunden: W("Wunden"),
  welche: W("Welche"),
  haarfarbe: W("Haarfarbe"),
  zeig: W("Zeig's"),
  nur: W("Nur"),
  zerstoert: W("zerstört"),
  du2: W("Du", 3),
  pigmente: W("Pigmente"),
  dunkle: W("dunkle"),
  braun: W("Braun"),
  zerplatzt: W("zerplatzt"),
  das4: W("Das", 3),
  rotgelb: W("rot-gelbe"),
  zaeh: W("zäh"),
  bleibt1: W("Bleibt"),
  knackt2: W("knackt", 2),
  bruecken: W("Brücken"),
  nass: W("Nass"),
  gummi: W("Gummi"),
  rate: W("Rate"),
  rot: W("Rot"),
  gelb1: W("Gelb", 1),
  orange2: W("Orange", 2),
  darum: W("Darum"),
  lila1: W("lila", 1),
  lila2: W("Lila", 2),
  schluckt: W("schluckt"),
  fakt: W("Übrigens"),
  graue: W("Graue"),
  h2o2b: W("Wasserstoffperoxid", 2),
  koerper: W("Körper"),
  bleicht: W("bleicht"),
  folge: W("Folge"),
};

// ---------------------------------------------------------------- shots
export const shots = [
  // hook: face + the opened foil with the glowing orange strand, fast push-in
  { at: 0, from: [1.3, 3.35, 4.1], to: [0.85, 3.05, 2.9], look: [0.45, 2.68, 0.3], zoom: 1 },
  // macro: dark hair turns orange like a wave
  { at: T.haar1, from: H(-5.8, 1.2, 7.4), to: H(-4.3, 0.9, 5.8), look: H(1.6, -0.9, 0), zoom: 1 },
  // the viewer in the chair, head full of foils
  { at: T.da, from: [3.4, 4.0, 5.6], to: [2.6, 3.5, 4.5], look: [0, 2.3, 0], zoom: 1 },
  // a wet strand stretches like chewing gum
  { at: T.und1, from: [-2.7, 3.0, 3.8], to: [-2.2, 2.7, 3.1], look: [-0.6, 2.05, 0.3], zoom: 1 },
  // wide: the salon on a sunny afternoon
  { at: T.stell, from: [6.2, 4.6, 9.2], to: [5.0, 4.0, 7.8], look: [0, 2.0, -1.2], zoom: 1 },
  // paste on the strand, it fizzes
  { at: T.paste, from: [1.7, 3.2, 2.1], to: [1.35, 3.0, 1.65], look: [0.5, 2.6, 0.4], zoom: 1 },
  // dive: the hair from outside, scales closed → crack open
  { at: T.erst, from: H(6.2, 3.6, 8.2), to: H(4.6, 2.8, 6.6), look: H(0, 0, 0), zoom: 1 },
  // the scales stand up like roof tiles (orbit)
  {
    at: T.schuppen,
    orbit: { c: H(0.4, 0.4, 0), r: 4.8, y: HAAR[1] + 2.6, a0: 0.65, a1: -0.1 },
    zoom: 1,
  },
  // peroxide streams in from above
  { at: T.dann, from: H(-2.8, 4.6, 5.8), to: H(-1.8, 3.5, 4.7), look: H(0, 0.9, 0), zoom: 1 },
  // salon: the bottle on the trolley — the same stuff as for wounds
  { at: T.dasselbe, from: [2.9, 2.5, 3.9], to: [2.4, 2.3, 3.1], look: [1.5, 1.9, 1.3], zoom: 1 },
  // comment question: the colour fan opens in front of the viewer
  { at: T.welche, from: [0.3, 2.5, 4.3], to: [0.15, 2.45, 3.55], look: [0, 2.25, 0.8], zoom: 1 },
  // inside the hair (cut-away), whisper
  { at: T.nur, from: H(-3.8, 0.7, 4.4), to: H(-2.8, 0.45, 3.5), look: H(0, 0, 0), zoom: 1 },
  // it destroys the colour: granules crack
  {
    at: T.zerstoert,
    from: H(1.6, 0.8, 3.0),
    to: H(1.1, 0.55, 2.3),
    look: H(0.6, 0.1, 0.4),
    zoom: 1,
    whip: 1,
  },
  // two pigments: orbit
  {
    at: T.du2,
    orbit: { c: H(0, 0, 0.3), r: 3.1, y: HAAR[1] + 1.0, a0: -0.55, a1: 0.25 },
    zoom: 1,
  },
  // brown bursts (slowmo)
  { at: T.dunkle, from: H(1.9, 0.7, 2.9), to: H(1.45, 0.5, 2.3), look: H(0.8, 0.2, 0.6), zoom: 1 },
  // red-yellow is tough
  { at: T.das4, from: H(-1.7, 0.6, 2.7), to: H(-1.3, 0.45, 2.15), look: H(-0.8, 0, 0.6), zoom: 1 },
  // too long: the bridges snap
  { at: T.bleibt1, from: H(3.0, 1.1, 3.9), to: H(2.4, 0.75, 3.1), look: H(1.4, 0.1, 0), zoom: 1 },
  // wet, it stretches like rubber
  { at: T.nass, from: H(0, 0.4, 6.4), to: H(0, 0.3, 5.6), look: H(0, 0, 0), zoom: 1 },
  // rate mal: stillness, only red + yellow left
  { at: T.rate, from: H(-1.4, 0.35, 3.4), to: H(-1.0, 0.25, 2.9), look: H(-0.3, 0, 0.3), zoom: 1 },
  // Rot … Gelb …
  { at: T.rot, from: H(0.8, 0.55, 2.6), to: H(0.5, 0.4, 2.1), look: H(0.1, 0, 0.4), zoom: 1 },
  // ORANGE: back in the salon, the foils fly off
  { at: T.orange2, from: [1.1, 3.4, 3.3], to: [0.7, 3.15, 2.5], look: [0, 2.85, 0.1], zoom: 1 },
  // purple shampoo
  { at: T.darum, from: [-1.3, 3.7, 2.9], to: [-0.9, 3.45, 2.35], look: [0, 3.1, 0], zoom: 1 },
  // purple swallows yellow → platinum
  { at: T.lila2, from: [0.8, 3.15, 2.4], to: [0.5, 3.05, 1.95], look: [0, 2.95, 0], zoom: 1 },
  // fact: a cut through the scalp, a hair growing out grey
  { at: T.fakt, from: G(4.8, 1.2, 10.5), to: G(3.6, 0.5, 8.8), look: G(0, -1.3, 0), zoom: 1 },
  // peroxide bubbles in the root
  { at: T.h2o2b, from: G(2.6, -2.0, 7.2), to: G(2.0, -2.4, 6.0), look: G(0, -3.6, 1.0), zoom: 1 },
  // your body bleaches you: the hair turns silver
  { at: T.koerper, from: G(-3.6, 0.3, 7.6), to: G(-2.7, 0.7, 6.0), look: G(0, 1.4, 1.8), zoom: 1 },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  {
    text: "Schuppenschicht",
    at: T.schuppen + 0.1,
    until: T.dann - 0.05,
    pos: H(0.9, 1.55, 0.5),
    side: -1,
  },
  {
    text: "Wasserstoffperoxid",
    at: T.h2o2a,
    until: T.dasselbe - 0.05,
    pos: H(-0.3, 2.3, 0.9),
    side: 1,
  },
  { text: "dunkles Pigment", at: T.pigmente, until: T.zerplatzt + 0.1, pos: H(...HB), side: 1 },
  { text: "rot-gelbes Pigment", at: T.rotgelb, until: T.bleibt1 - 0.05, pos: H(...HR), side: -1 },
  { text: "Brücken", at: T.bruecken, until: T.nass - 0.05, pos: H(1.45, 0.35, 0.35), side: 1 },
  {
    text: "Wasserstoffperoxid",
    at: T.h2o2b + 0.1,
    until: T.koerper - 0.05,
    pos: G(0.15, -3.0, 0.4),
    side: 1,
  },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "zoom", at: T.blond, amount: 0.3 }, // the claim
  { kind: "flash", at: T.orange1 }, // the wave reaches orange
  { kind: "slowmo", at: T.haare1, until: T.stell, speed: 0.4 }, // chewing gum
  { kind: "shake", at: T.kaugummi, dur: 0.5, amp: 0.6 },
  { kind: "zoom", at: T.knackt1 + 0.1, amount: 0.3 }, // scales crack open
  { kind: "shake", at: T.knackt1 + 0.1, dur: 0.4, amp: 0.5 },
  { kind: "zoom", at: T.dachziegel, amount: 0.25 },
  { kind: "flash", at: T.h2o2a }, // peroxide rushes in
  { kind: "zoom", at: T.wunden, amount: 0.2 },
  { kind: "zoom", at: T.haarfarbe, amount: 0.2 }, // fan opens
  { kind: "zoom", at: T.zerstoert, amount: 0.3 },
  { kind: "flash", at: T.zerstoert + 0.25 },
  { kind: "slowmo", at: T.braun, until: T.das4, speed: 0.4 }, // brown bursts
  { kind: "flash", at: T.zerplatzt + 0.1 },
  { kind: "zoom", at: T.zaeh, amount: 0.25 },
  { kind: "shake", at: T.knackt2, dur: 0.5, amp: 0.6 }, // bridges snap
  { kind: "flash", at: T.bruecken },
  { kind: "zoom", at: T.gummi, amount: 0.25 },
  { kind: "zoom", at: T.gelb1, amount: 0.2 },
  { kind: "flash", at: T.orange2 }, // ORANGE
  { kind: "shake", at: T.orange2, dur: 0.5, amp: 0.7 },
  { kind: "zoom", at: T.schluckt, amount: 0.25 },
  { kind: "flash", at: T.schluckt + 0.3 },
  { kind: "zoom", at: T.bleicht, amount: 0.25 },
];

// ---------------------------------------------------------------- sound
// own sound (scripts/sfx-extra.py): "folie" = aluminium foil crinkling
export const SFX = [
  { s: "folie", at: 0.0, db: -8 },
  { s: "boing", at: T.kaugummi, db: -10 },
  { s: "folie", at: T.paste - 0.1, db: -12 },
  { s: "zisch", at: T.kribbelt, dur: 1.0, db: -20 },
  { s: "klack", at: T.knackt1 + 0.1, db: -10 },
  { s: "zisch", at: T.dann + 0.1, dur: 1.8, db: -22 },
  { s: "pop", at: T.dasselbe + 0.1 },
  { s: "pop", at: T.zerstoert + 0.25, db: -6 },
  { s: "pop", at: T.zerstoert + 0.45, db: -8 },
  { s: "pop", at: T.zerplatzt + 0.1 },
  { s: "pop", at: T.zerplatzt + 0.35, db: -4 },
  { s: "pop", at: T.zerplatzt + 0.6, db: -6 },
  { s: "boing", at: T.zaeh, db: -12 },
  { s: "klack", at: T.knackt2, db: -8 },
  { s: "klack", at: T.knackt2 + 0.22, db: -10 },
  { s: "klack", at: T.bruecken, db: -9 },
  { s: "boing", at: T.gummi - 0.3, db: -10 },
  { s: "folie", at: T.orange2 - 0.05, db: -9 },
  { s: "pop", at: T.lila1 + 0.15, db: -6 },
  { s: "rauschen", at: T.fakt, dur: T.folge - T.fakt, db: -26 },
];
