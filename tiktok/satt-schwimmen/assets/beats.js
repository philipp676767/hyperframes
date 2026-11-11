// #73 "Mit vollem Magen schwimmen" — every time-keyed decision as plain data
// (read by scene.js and scripts/build-sfx.mjs). No three.js / DOM here.
import { W } from "./timing.js";

export const T = {
  pizza: W("Pizza", 1),
  gehst: W("gehst", 1),
  schwimmen: W("schwimmen"),
  oma: W("Oma"),
  schreit: W("schreit"),
  stunde: W("Stunde"),
  ertrinkst: W("ertrinkst"),
  im: W("Im"),
  bau: W("Großbaustelle"),
  magen: W("Magen", 1),
  knetet: W("knetet"),
  blut: W("Blut", 1),
  mythos: W("Mythos"),
  fehlt: W("fehlt"),
  beinen: W("Beinen"),
  das: W("das", 1),
  problem: W("Problem"),
  kraulst: W("kraulst"),
  beine: W("Beine"),
  schwer: W("schwer"),
  sticht: W("sticht"),
  kommt: W("Kommt"),
  krampf: W("Krampf"),
  folge: W("Folge"),
  rate: W("Rate"),
  keinen: W("keinen"),
  koerper: W("Körper"),
  beides: W("beides"),
  magen2: W("Magen", 2),
  muskeln: W("Muskeln"),
  kraempfe: W("Krämpfe"),
  erschoepfung: W("Erschöpfung"),
  nicht2: W("nicht", 1),
  pizza3: W("Pizza", 3),
  du3: W("gehst", 2),
  unter: W("unter"),
  traege: W("träge"),
  wirklich: W("Wirklich"),
  bier: W("Bier"),
  fakt: W("Übrigens"),
  stammt: W("stammt"),
  jahr: W("1908"),
  lange: W("lange"),
};
// derived moments
export const K = {
  jump: 0, // you are already in the air on frame 0
  splash: 1.25, // you hit the water (before the first cut)
  xrayOn: T.bau - 0.35,
  xrayOff: T.problem - 0.5,
  sink: T.schwer - 0.2, // legs start to sink
  cramp: T.kommt, // the calf starts to burn
  float: T.du3 - 0.05, // you lie back on the water
  xray2On: T.koerper - 0.25,
  xray2Off: T.pizza3 - 0.35,
  bookOpen: T.fakt + 0.35,
};

// ---------------------------------------------------------------- shots (zoom 1: positions are the camera)
const P0 = [0.9, 0, 0.3]; // where you tread water first
const P1 = [4.4, 0, 0.3]; // after the crawl
export const POS = { P0, P1 };
const at = (p, dx, dy, dz) => [p[0] + dx, p[1] + dy, p[2] + dz];
export const shots = [
  // cold open: cannonball with the last slice in your hand — low, at the water line
  {
    at: 0,
    from: [1.9, 0.32, 2.3],
    to: [1.75, 0.3, 1.95],
    look: [-0.6, 1.3, -0.7],
    lookTo: [0.4, 0.45, -0.5],
  },
  // you come up again in the foam
  { at: T.gehst, from: [1.75, 0.45, 1.75], to: [1.5, 0.38, 1.45], look: [0.6, 0.0, -0.45] },
  // Oma jumps up in her deck chair
  { at: T.oma, from: [-2.7, 1.25, 0.95], to: [-3.0, 1.2, 0.75], look: [-4.6, 1.62, -0.9], whip: 1 },
  // you treading water, close — x-ray on
  { at: T.im, from: at(P0, 0.9, 0.5, 2.2), to: at(P0, 0.6, 0.35, 1.7), look: at(P0, 0, 0.0, 0) },
  // the stomach at work (just under the surface)
  {
    at: T.magen,
    from: at(P0, 0.65, 0.02, 1.05),
    to: at(P0, 0.5, -0.05, 0.85),
    look: at(P0, 0, -0.35, 0.05),
  },
  // under water: blood runs from the legs to the stomach
  {
    at: T.blut,
    from: at(P0, 1.7, -0.75, 2.1),
    to: at(P0, 1.4, -0.8, 1.8),
    look: at(P0, 0, -0.85, 0),
  },
  // the legs go pale
  {
    at: T.fehlt,
    from: at(P0, -1.2, -1.05, 1.5),
    to: at(P0, -1.0, -1.1, 1.25),
    look: at(P0, 0, -1.2, 0),
    whip: -1,
  },
  // your face: worried
  {
    at: T.das,
    from: at(P0, 0.35, 0.28, 1.05),
    to: at(P0, 0.2, 0.25, 0.8),
    look: at(P0, 0, 0.22, 0),
  },
  // the crawl from above-side
  {
    at: T.kraulst,
    from: [0.1, 1.5, 2.3],
    to: [1.4, 1.4, 2.3],
    look: [1.0, -0.1, 0.3],
    lookTo: [1.5, -0.1, 0.3],
  },
  // the legs sink (slowmo, low side view from under the surface)
  {
    at: T.beine,
    from: [2.4, -0.55, 1.9],
    to: [2.5, -0.6, 1.7],
    look: [1.35, -0.45, 0.3],
    lookTo: [1.9, -0.5, 0.3],
  },
  // stab in the stomach — x-ray flash
  { at: T.sticht, from: [3.0, 0.4, 1.95], to: [2.8, 0.32, 1.7], look: [2.0, -0.25, 0.3] },
  // the calf: cramp?
  { at: T.kommt, from: [1.55, -0.85, 1.55], to: [1.75, -0.9, 1.3], look: [2.36, -0.95, 0.3] },
  // wide: the whole lake, you in the middle (follow pill)
  { at: T.folge, from: [10.5, 3.6, 10], to: [9.2, 3.1, 8.6], look: [2.5, 0.6, -5] },
  // Rate mal: you, looking at the counter
  { at: T.rate, from: at(P1, 1.3, 0.75, 2.4), to: at(P1, 1.0, 0.6, 2.0), look: at(P1, 0, 0.15, 0) },
  // praktisch keinen
  {
    at: T.keinen,
    from: at(P1, 0.5, 0.45, 1.45),
    to: at(P1, 0.4, 0.4, 1.25),
    look: at(P1, 0, 0.12, 0),
  },
  // x-ray: enough blood for both
  {
    at: T.koerper,
    from: at(P1, 1.6, -0.45, 2.2),
    to: at(P1, 1.3, -0.5, 1.9),
    look: at(P1, 0, -0.6, 0),
  },
  { at: T.magen2, orbit: { c: at(P1, 0, -0.6, 0), r: 2.0, y: -0.55, a0: -0.7, a1: 0.1 } },
  // exhaustion, not pizza
  {
    at: T.kraempfe,
    from: at(P1, -1.5, -0.75, 1.6),
    to: at(P1, -1.3, -0.8, 1.35),
    look: at(P1, 0, -0.95, 0),
  },
  // the pizza box on the jetty gets the ✕
  { at: T.nicht2, from: [-2.05, 1.2, 0.55], to: [-2.2, 1.12, 0.35], look: [-2.95, 0.55, -0.75] },
  // payoff: you float on your back, lazy and happy
  { at: T.du3, from: at(P1, 1.4, 1.35, 1.7), to: at(P1, 0.95, 1.05, 1.25), look: at(P1, 0, 0, 0) },
  // the beer
  {
    at: T.wirklich,
    from: [-1.75, 0.88, -0.6],
    to: [-1.85, 0.82, -0.75],
    look: [-2.35, 0.72, -1.55],
  },
  // Übrigens: the old scout book opens
  {
    at: T.fakt,
    from: [-3.35, 1.05, 0.15],
    to: [-3.5, 0.9, -0.08],
    look: [-3.75, 0.52, -0.5],
    whip: 1,
  },
  // last picture: Oma taps her watch, you wave from the water
  { at: T.lange, from: [-1.1, 1.25, 2.9], to: [-1.35, 1.15, 2.55], look: [-4.0, 0.75, -0.5] },
];

// ---------------------------------------------------------------- labels (pos = world point)
const YT = -0.42; // your navel height while treading water
export const LABELS = [
  {
    text: "Magen",
    at: T.magen + 0.1,
    until: T.blut - 0.1,
    pos: [P0[0] + 0.03, YT + 0.05, P0[2] + 0.1],
    side: 1,
  },
  {
    text: "Blut",
    at: T.blut + 0.1,
    until: T.fehlt - 0.1,
    pos: [P0[0] + 0.09, YT - 0.45, P0[2] + 0.03],
    side: 1,
  },
  { text: "Wade", at: T.kommt + 0.3, until: T.folge - 0.05, pos: [2.37, -1.0, 0.36], side: 1 },
  {
    text: "Muskeln",
    at: T.muskeln,
    until: T.kraempfe - 0.1,
    pos: [P1[0] + 0.09, YT - 0.5, P1[2] + 0.03],
    side: 1,
  },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "flash", at: K.splash },
  { kind: "shake", at: K.splash, dur: 0.5, amp: 1 },
  { kind: "zoom", at: T.ertrinkst, amount: 0.35 },
  { kind: "shake", at: T.ertrinkst + 0.05, dur: 0.35, amp: 0.6 },
  { kind: "zoom", at: T.bau, amount: 0.3 },
  { kind: "zoom", at: T.blut, amount: 0.25 },
  { kind: "slowmo", at: T.schwer, until: T.sticht, speed: 0.4 },
  { kind: "flash", at: T.sticht },
  { kind: "shake", at: T.krampf, dur: 0.35, amp: 0.8 },
  { kind: "zoom", at: T.keinen, amount: 0.35 },
  { kind: "flash", at: T.keinen + 0.05 },
  { kind: "zoom", at: T.muskeln, amount: 0.25 },
  { kind: "zoom", at: T.traege, amount: 0.3 },
  { kind: "zoom", at: T.bier, amount: 0.35 },
  { kind: "zoom", at: T.jahr, amount: 0.3 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "platsch", at: K.splash, db: -6 },
  { s: "whoosh", at: 0.02, db: -8 }, // falling air on frame 0
  { s: "rauschen", at: T.kraulst, dur: T.sticht - T.kraulst, db: -20 },
  { s: "klack", at: T.oma + 0.25, db: -10 }, // the deck chair creaks as Oma sits up
  { s: "click", at: T.rate + 0.4, db: -14 },
  { s: "click", at: T.rate + 1.4, db: -14 },
  { s: "click", at: T.rate + 2.4, db: -14 },
  { s: "click", at: T.rate + 3.3, db: -14 },
  { s: "pop", at: T.nicht2 + 0.15, db: -10 },
  { s: "plaetschern", at: T.du3, db: -14 },
  { s: "klack", at: T.bier - 0.1, db: -12 },
  { s: "pop", at: K.bookOpen, db: -10 },
];
