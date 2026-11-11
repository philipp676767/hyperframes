// #76 Selbstbräuner — every time-keyed decision as plain data (scene.js +
// scripts/build-sfx.mjs). No three.js / DOM here.
import { W } from "./timing.js";

// ---------------------------------------------------------------- places
// (world units, 1 unit ≈ 30 cm) — shared with scene.js
export const KNEE = [0, 2.3, 0.36]; // top of the bent knee
export const SLAB = [0, 18, 24]; // the skin cut-away, floating above the deck
export const CART = [4.0, 0, 1.7]; // breakfast trolley
export const TOP = 2.36; // its top shelf
export const TOASTER = [4.35, TOP, 1.7];
export const BOTTLE = [3.35, TOP, 1.85]; // base centre of the self-tanner
export const SLAB_V = { x: SLAB[0], y: SLAB[1], z: SLAB[2] };
const add = (a, b) => a.map((v, i) => v + b[i]);
const S = (v) => add(SLAB, v);
const Tt = (v) => add(TOASTER, v);
const B = (v) => add(BOTTLE, v);

// ---------------------------------------------------------------- beats
export const T = {
  knie: W("Knie"),
  schuld: W("Schuld"),
  zucker1: W("Zucker", 1),
  du: W("Du"),
  nichts: W("Nichts"),
  stunden: W("Stunden"),
  braun1: W("braun", 1),
  ohne1: W("ohne", 1),
  sbr2: W("Selbstbräuner", 2),
  er: W("Er"),
  tot: W("tot"),
  ganz1: W("Ganz", 1),
  schicht: W("Schicht"),
  nur: W("Nur"),
  braun2: W("braun", 2),
  aber: W("Aber"),
  folge: W("Folge"),
  rate: W("Rate"),
  im1: W("Im", 2),
  toaster: W("Toaster"),
  im2: W("Im", 3),
  zucker2: W("Zucker", 2),
  der: W("Der"),
  eiweiss: W("Eiweiß"),
  dabei: W("Dabei"),
  braun3: W("Braun", 3),
  wie2: W("wie", 3),
  kruste1: W("Kruste", 1),
  toast: W("Toast"),
  deine: W("Deine", 2),
  gebacken: W("gebacken"),
  hitze: W("Hitze"),
  an: W("An"),
  liegt: W("liegt", 2),
  meisten: W("meisten"),
  mehr: W("Mehr", 2),
  kruste2: W("Kruste", 2),
  darum: W("Darum"),
  orange: W("orange", 2),
  creme: W("Creme"),
  uebrigens: W("Übrigens"),
  woche: W("Woche"),
  dusch: W("abgeduscht"),
  ehrlich: W("Ehrlich"),
  schon: W("Schon", 2),
};

// ---------------------------------------------------------------- shots
export const shots = [
  // hook: the orange knee, the viewer's hand rubbing it — fast push-in
  { at: 0, from: [0.7, 3.4, 3.6], to: [0.35, 2.95, 2.15], look: [0.1, 2.2, 0.4], zoom: 1.2 },
  // "Schuld ist ein Zucker im Selbstbräuner": the bottle, crystals burst out
  {
    at: T.schuld,
    from: B([1.0, 0.75, 1.7]),
    to: B([0.55, 0.5, 1.05]),
    look: B([0, 0.36, 0]),
    zoom: 1.0,
  },
  // "Du cremst dich abends ein": pale shin, hand spreading the lotion
  { at: T.du, from: [2.4, 2.9, 4.2], to: [1.8, 2.5, 3.3], look: [0.5, 1.55, 0.36] },
  // "Nichts passiert": low, still, close
  { at: T.nichts, from: [0.1, 1.55, 2.4], to: [0.25, 1.6, 1.9], look: [0.55, 1.7, 0.4], zoom: 1.2 },
  // "Stunden später …": wide, night falls, the skin tans (time-lapse)
  { at: T.stunden, from: [7.5, 5.2, 10.5], to: [6.2, 4.4, 8.8], look: [-0.6, 1.3, -0.8] },
  // "ohne einen Sonnenstrahl": low past the leg up into the night sky
  { at: T.ohne1, from: [1.9, 1.4, 3.0], to: [1.6, 1.35, 2.6], look: [3.0, 4.4, -8], focus: 8 },
  // "Selbstbräuner färbt gar nicht deine Haut": macro on the tanned shin
  {
    at: T.sbr2,
    from: [1.35, 2.1, 1.55],
    to: [1.0, 1.95, 1.2],
    look: [0.55, 1.72, 0.48],
    zoom: 1.0,
  },
  // "Er färbt das, was davon schon tot ist": whip into the skin cut-away
  { at: T.er, from: S([3.6, 3.3, 5.6]), to: S([2.5, 2.7, 4.3]), look: S([0, 1.5, 0]), whip: 1 },
  // "Ganz oben … toter Zellen, wie Dachziegel": orbit, tag on the tiles
  { at: T.ganz1, rel: SLAB_V, orbit: { c: [0, 1.7, 0], r: 4.0, y: 3.1, a0: 0.75, a1: -0.15 } },
  // "Nur die wird braun": close top-front, the tiles brown
  {
    at: T.nur,
    from: S([-1.3, 3.7, 2.5]),
    to: S([-0.9, 3.3, 2.0]),
    look: S([0, 2.0, 0]),
    zoom: 1.2,
  },
  // "Aber wie – ohne Sonne?": the lounger at night, from the pool side
  { at: T.aber, from: [-6.5, 3.7, 6.2], to: [-5.4, 3.3, 5.2], look: [0, 1.6, 0] },
  // "Folge für mehr Wissen.": the breakfast trolley by the lounger
  { at: T.folge, from: [7.0, 3.8, 6.4], to: [6.3, 3.5, 5.5], look: [3.5, 2.3, 1.4] },
  // "Rate mal, wo du das jeden Morgen siehst": push in on the toaster
  {
    at: T.rate,
    from: Tt([1.5, 0.95, 2.3]),
    to: Tt([0.85, 0.75, 1.45]),
    look: Tt([0, 0.42, 0]),
    zoom: 1.0,
  },
  // "Im Toaster.": the toast pops — low macro
  {
    at: T.im1,
    from: Tt([1.1, 0.75, 2.3]),
    to: Tt([0.85, 0.85, 1.85]),
    look: Tt([0, 0.75, 0]),
    zoom: 1.0,
  },
  // "Im Selbstbräuner steckt ein Zucker": the bottle in x-ray
  {
    at: T.im2,
    from: B([0.95, 0.65, 1.5]),
    to: B([0.65, 0.5, 1.05]),
    look: B([0, 0.34, 0]),
    zoom: 1.0,
  },
  // "Der verklebt mit dem Eiweiß …": sugar rains onto the tiles
  { at: T.der, from: S([2.3, 3.5, 3.3]), to: S([1.7, 3.0, 2.6]), look: S([0, 2.0, 0]) },
  // "Dabei entsteht Braun": slow orbit while the tiles brown
  { at: T.dabei, rel: SLAB_V, orbit: { c: [0, 1.9, 0], r: 3.3, y: 2.9, a0: -0.55, a1: 0.25 } },
  // "wie die Kruste am Toast": the toast macro
  {
    at: T.wie2,
    from: Tt([-1.2, 1.5, 1.9]),
    to: Tt([-0.9, 1.35, 1.5]),
    look: Tt([0, 0.85, 0]),
    zoom: 1.0,
  },
  // "Deine Haut wird gebacken. Ganz ohne Hitze.": slab front, flame ✕
  { at: T.deine, from: S([0.5, 2.3, 4.6]), to: S([0.25, 2.15, 3.7]), look: S([0.4, 1.7, 0]) },
  // "An Knien und Ellbogen": the knee
  { at: T.an, from: [-1.6, 3.3, 3.5], to: [-1.05, 3.05, 2.85], look: [0, 2.1, 0.3] },
  // "liegt am meisten tote Haut": the tile stack grows thick
  { at: T.liegt, rel: SLAB_V, orbit: { c: [0, 2.2, 0], r: 3.7, y: 3.3, a0: 0.55, a1: 0.1 } },
  // "Mehr Haut, mehr Kruste": close on the thick stack turning dark
  {
    at: T.mehr,
    from: S([1.05, 3.5, 3.1]),
    to: S([0.75, 3.25, 2.45]),
    look: S([0, 2.55, 0.5]),
    zoom: 1.2,
  },
  // "Darum werden sie orange.": the knee — payoff
  {
    at: T.darum,
    from: [0.95, 2.85, 3.0],
    to: [0.6, 2.6, 2.05],
    look: [0.05, 2.12, 0.36],
    zoom: 1.2,
  },
  // "Creme sie vorher ein.": the hand dabs cream on the knee
  { at: T.creme, from: [-0.95, 3.05, 2.3], to: [-0.7, 2.9, 1.85], look: [0, 2.2, 0.36], zoom: 1.2 },
  // "Übrigens: … eine Woche": a shower over the skin
  { at: T.uebrigens, from: S([2.9, 3.9, 4.3]), to: S([2.2, 3.5, 3.4]), look: S([0, 2.0, 0]) },
  // "abgeduscht": the brown tiles fly off — slowmo
  {
    at: T.dusch,
    from: S([-1.5, 2.9, 2.7]),
    to: S([-1.15, 2.65, 2.25]),
    look: S([0.5, 2.2, 0.3]),
    zoom: 1.2,
  },
  // comment question: the lounger at night, orbit
  { at: T.ehrlich, orbit: { c: [0, 1.8, 0.2], r: 4.6, y: 3.0, a0: 0.95, a1: 0.55 } },
  {
    at: T.schon + 0.5,
    from: [1.1, 3.0, 2.4],
    to: [0.8, 2.75, 1.9],
    look: [0.05, 2.1, 0.36],
    zoom: 1.2,
  },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Tote Zellen", at: T.schicht, until: T.nur - 0.1, pos: S([0.9, 2.08, 0.7]), side: 1 },
  { text: "Zucker", at: T.zucker2, until: T.der - 0.05, pos: B([0, 0.3, 0]), side: -1 },
  { text: "Eiweiß", at: T.eiweiss, until: T.dabei - 0.1, pos: S([-0.6, 2.08, 0.6]), side: -1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "zoom", at: T.knie, amount: 0.3 },
  { kind: "flash", at: T.zucker1 },
  { kind: "flash", at: T.braun1 },
  { kind: "zoom", at: T.tot, amount: 0.3 },
  { kind: "flash", at: T.braun2 },
  { kind: "flash", at: T.toaster + 0.05 },
  { kind: "shake", at: T.toaster + 0.05, dur: 0.45, amp: 0.7 },
  { kind: "slowmo", at: T.dabei, until: T.wie2, speed: 0.4 },
  { kind: "zoom", at: T.gebacken, amount: 0.25 },
  { kind: "shake", at: T.meisten, dur: 0.4, amp: 0.5 },
  { kind: "flash", at: T.orange },
  { kind: "slowmo", at: T.dusch, until: T.ehrlich, speed: 0.4 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "reiben", at: 0.0, db: -8 }, // frame 0: lotion rubbed on the knee
  { s: "reiben", at: T.du + 0.1, db: -12 },
  { s: "zisch", at: T.zucker1 - 0.05, dur: 0.5, db: -16 }, // the pump sprays
  { s: "rauschen", at: T.stunden, dur: 1.2, db: -20 }, // time-lapse wind
  { s: "pop", at: T.er + 0.25 },
  { s: "klack", at: T.rate + 0.3, db: -10 }, // toaster lever down
  { s: "surr", at: T.rate + 0.35, dur: T.toaster - T.rate - 0.3, db: -24 },
  { s: "toaster", at: T.toaster + 0.02, db: -6 },
  { s: "pop", at: T.liegt + 0.2, db: -12 },
  { s: "rauschen", at: T.uebrigens, dur: T.ehrlich - T.uebrigens, db: -15 }, // the shower
];
