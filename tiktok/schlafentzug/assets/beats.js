// #43 Schlafentzug — every time-keyed decision as plain data (scene + sound).
import { W } from "./timing.js";

export const T = {
  durch: W("durch"),
  hirn1: W("Hirn", 1),
  vier: W("Vier", 1),
  fuehlst: W("fühlst"),
  topfit: W("topfit"),
  aber: W("Aber"),
  kopf: W("Kopf"),
  stoff: W("Stoff"),
  drink: W("Energydrink"),
  haelt: W("hält"),
  tuer: W("Tür"),
  morgen: W("Morgen"),
  gereizt: W("gereizt"),
  wort: W("Wort"),
  heulst: W("heulst"),
  rastest: W("rastest"),
  gefuehl: W("Gefühlszentrum"),
  studie: W("Studie"),
  sechzig: W("60"),
  rate: W("Rate"),
  stunden: W("Stunden"),
  nullfuenf: W("05"),
  promille: W("Promille"),
  vier2: W("vier", 2),
  denn: W("Denn"),
  knipsen: W("knipsen"),
  nerven: W("Nervenzellen"),
  augen: W("Augen"),
  merkst: W("merkst"),
  steuer: W("Steuer"),
  toedlich: W("tödlich"),
  hirn3: W("Hirn", 2),
  schlaf: W("Schlaf", 1),
  sekunden: W("Sekundenschlaf"),
  fakt: W("Übrigens"),
  elf: W("elf"),
  hallu: W("Halluzinationen"),
  cta: W("lange"),
  folge: W("Folge"),
};

// head centre (world) — the person sits on the sofa at the origin
export const HEAD = [0, 3.86, 0.02];
export const DOOR = [-5.6, 0, 2.6]; // analogy set: the door the drink holds shut
export const STREET = [0, -15, 13]; // the street far below (car shot)

const H = HEAD;
const vec = ([x, y, z]) => ({ x, y, z }); // shotCamera adds rel as a vector
export const shots = [
  // frame 0: close on face + can, fast push-in; the can bursts open
  { at: 0, from: [1.5, 4.25, 2.9], to: [0.75, 3.95, 1.75], look: [0.15, 3.6, 0.2], zoom: 1.0 },
  // the eyelids slam shut — macro on the eyes
  { at: T.durch, from: [0.55, 4.02, 2.0], to: [0.3, 3.96, 1.6], look: [0, 3.92, 0.35], zoom: 1.0 },
  // "Dein Hirn nicht." — medium: the person on the sofa, the party around
  { at: T.hirn1 - 0.15, from: [3.2, 3.4, 6.2], to: [2.5, 3.1, 5.0], look: [0, 2.6, 0], zoom: 1.0 },
  // "Vier Uhr früh, die Party läuft." — wide over the terrace + city
  { at: T.vier, from: [-6.5, 5.2, 9.5], to: [-4.6, 4.4, 7.6], look: [0, 2.6, -3], zoom: 1.0 },
  // "Du fühlst dich topfit." — front, the can raised
  {
    at: T.fuehlst - 0.15,
    from: [1.9, 3.4, 5.0],
    to: [1.3, 3.45, 4.2],
    look: [0.35, 3.4, 0],
    zoom: 1.0,
  },
  // "Aber in deinem Kopf …" — crash zoom into the head, x-ray
  { at: T.aber, from: [0.1, 4.1, 3.4], to: [0.05, 3.95, 2.1], look: [0, 3.86, 0], zoom: 1.0 },
  // the tiredness stuff piles up — orbit around the glass head
  { at: T.stoff - 0.2, orbit: { c: H, r: 1.95, y: 4.15, a0: 0.75, a1: -0.25 }, zoom: 1.0 },
  // the energy drink holds the door shut (analogy set)
  {
    at: T.drink - 0.12,
    rel: vec(DOOR),
    from: [1.5, 3.3, 4.6],
    to: [1.1, 2.9, 3.8],
    look: [-0.3, 0.6, 0],
    zoom: 1.0,
    whip: 1,
  },
  // "Am Morgen bist du gereizt." — front medium, red flash
  { at: T.morgen - 0.12, from: [2.4, 3.4, 5.2], to: [1.7, 3.3, 4.2], look: [0, 3.1, 0], zoom: 1.0 },
  // tears + steam — close on the face from the other side
  {
    at: T.wort - 0.1,
    from: [-1.3, 4.05, 2.5],
    to: [-0.85, 3.95, 1.95],
    look: [0, 3.8, 0],
    zoom: 1.0,
    whip: -1,
  },
  // the emotion centre glows red — side x-ray
  {
    at: T.gefuehl - 0.18,
    from: [2.4, 4.05, 1.35],
    to: [1.85, 3.95, 1.05],
    look: [0, 3.8, 0],
    zoom: 1.0,
  },
  // "Rate mal …" — quiet wide, the gauge appears (stillness before the reveal)
  { at: T.rate - 0.1, from: [4.4, 3.0, 7.4], to: [4.0, 2.95, 6.8], look: [0, 2.7, 0], zoom: 1.0 },
  // "Wie mit 0,5 Promille." — low angle, the person sways
  {
    at: T.nullfuenf - 0.3,
    from: [-2.6, 1.7, 4.0],
    to: [-2.0, 2.0, 3.3],
    look: [0, 3.1, 0],
    zoom: 1.0,
  },
  // "Um vier warst du längst drüber." — high top-down
  { at: T.vier2 - 0.1, from: [0.6, 8.0, 5.0], to: [0.4, 7.0, 4.0], look: [0, 2.6, 0], zoom: 1.0 },
  // single neurons switch off — orbit the glass head (slowmo)
  { at: T.denn - 0.1, orbit: { c: H, r: 1.85, y: 4.2, a0: -0.7, a1: 0.45 }, zoom: 1.0 },
  // "Deine Augen bleiben offen" — macro, wide open eyes
  {
    at: T.augen - 0.45,
    from: [0.0, 4.0, 2.1],
    to: [0.0, 3.95, 1.7],
    look: [0, 3.92, 0.35],
    zoom: 1.0,
  },
  // "Am Steuer" — whip down to the street: a car at night
  {
    at: T.steuer - 0.15,
    rel: vec(STREET),
    from: [7.5, 1.5, 3.0],
    to: [5.5, 1.2, 2.4],
    look: [-1, 0.6, 0.8],
    zoom: 1.0,
    whip: 1,
  },
  // back up: the brain dims, the eyes close — Sekundenschlaf
  {
    at: T.hirn3 - 0.12,
    from: [1.25, 4.15, 2.45],
    to: [0.75, 4.0, 1.8],
    look: [0, 3.86, 0.1],
    zoom: 1.0,
  },
  // "Übrigens: elf Tage" — medium, counter ticks, hallucinations swirl
  { at: T.fakt - 0.1, from: [2.9, 3.7, 6.0], to: [2.1, 3.5, 4.8], look: [0, 3.3, 0], zoom: 1.0 },
  // CTA: drone pull-back over the roof terrace into the dawn
  {
    at: T.cta - 0.16,
    from: [3.0, 4.2, 7.2],
    to: [13, 11, 23],
    look: [0, 2.8, 0],
    lookTo: [0, 0, -6],
    zoom: 1.0,
    tilt: 0.7,
  },
];

export const LABELS = [
  { text: "Adenosin", at: T.stoff + 0.1, until: T.drink - 0.15, pos: [0.35, 4.2, 0.1], side: 1 },
  { text: "Koffein", at: T.haelt, until: T.morgen - 0.15, pos: [-5.0, 0.62, 2.7], side: 1 },
  {
    text: "Gefühlszentrum",
    at: T.gefuehl + 0.05,
    until: T.rate - 0.15,
    pos: [0.0, 3.68, 0.08],
    side: -1,
  },
  { text: "Nervenzellen", at: T.nerven, until: T.augen - 0.5, pos: [0.2, 4.08, 0.12], side: 1 },
];

export const HIGHLIGHTS = [
  { kind: "flash", at: 0.05 }, // the can bursts open on frame 0
  { kind: "shake", at: T.durch + 0.1, dur: 0.35, amp: 0.6 }, // lids slam shut
  { kind: "zoom", at: T.aber, amount: 0.35 }, // crash zoom into the head
  { kind: "flash", at: T.tuer }, // the door slams
  { kind: "shake", at: T.tuer, dur: 0.5, amp: 0.9 },
  { kind: "flash", at: T.gereizt },
  { kind: "zoom", at: T.gefuehl, amount: 0.3 },
  { kind: "slowmo", at: T.rate + 0.2, until: T.nullfuenf - 0.3, speed: 0.4 }, // stillness before the reveal
  { kind: "flash", at: T.nullfuenf },
  { kind: "slowmo", at: T.knipsen, until: T.augen - 0.45, speed: 0.35 },
  { kind: "shake", at: T.toedlich, dur: 0.5, amp: 1.0 },
  { kind: "zoom", at: T.sekunden, amount: 0.3 },
  { kind: "flash", at: T.hallu },
];

export const SFX = [
  { s: "dose", at: 0.0, db: -6 }, // can cracks + fizzes on frame 0
  { s: "pop", at: T.drink + 0.05 }, // the door set pops in
  { s: "klack", at: T.tuer, db: -6 }, // door slammed shut
  { s: "zisch", at: T.rastest + 0.1, dur: 0.9, db: -14 }, // steam from the ears
  { s: "brumm", at: T.steuer - 0.1, dur: 1.6, db: -16 }, // the car engine
  { s: "wow", at: T.hallu + 0.1, db: -12 },
];
