// #80 Katzenzunge — every time-keyed decision as plain data (scene + sound).
import { W } from "./timing.js";

// places: the cat in its basket at the origin; the micro world (fur + tongue
// cross-section) at MAC; the giant single hook at HOOK; the lion's bone at BONE
export const MAC = [120, 0, 0];
export const HOOK = [160, 0, 0];
export const BONE = [120, 0, 70];
const at = (base, p) => [base[0] + p[0], base[1] + p[1], base[2] + p[2]];
const mac = (p) => at(MAC, p);
const hk = (p) => at(HOOK, p);
const bn = (p) => at(BONE, p);

export const T = {
  haken1: W("Haken", 1),
  zunge0: W("Katzenzunge"),
  schmirgel: W("Schmirgelpapier"),
  wuergt: W("würgt"),
  haarballen: W("Haarballen"),
  kein: W("Kein"),
  kamm: W("Kamm"),
  jeder: W("Jeder"),
  finger: W("Fingernagel"),
  papillen: W("Papillen"),
  trifft: W("Trifft"),
  knoten: W("Knoten"),
  dreht: W("dreht"),
  zieht: W("zieht"),
  lose: W("Lose"),
  alle: W("Alle"),
  hinten: W("hinten", 1),
  nur: W("Nur"),
  hohl: W("hohl"),
  rate: W("Rate"),
  spucke: W("Spucke", 1),
  stroh: W("Strohhalme"),
  bringen: W("bringen"),
  haut: W("Haut"),
  dort: W("Dort"),
  kuehlt: W("kühlt"),
  katzen: W("Katzen"),
  pfoten: W("Pfoten"),
  ihre2: W("Ihre", 2),
  klima: W("Klimaanlage"),
  haare2: W("Haare", 2),
  hals: W("Hals"),
  einbahn: W("Einbahnstraße"),
  fakt: W("Übrigens"),
  loewe: W("Löwe"),
  knochen: W("Knochen"),
  cta: W("heißt"),
};

// conveyor speed of the micro tongue (units/s); it stands still while the
// knot is opened, so the phase is integrated piecewise (deterministic)
export const LICK = 1.1;
export function lickPhase(t) {
  const a = T.trifft;
  const b = T.lose;
  return LICK * (Math.min(t, a) + Math.max(0, t - b));
}

export const shots = [
  // hook: the cat licks the viewer's hand — close, pushing in
  { at: 0, from: [-1.25, 2.25, 2.9], to: [-0.6, 1.85, 1.75], look: [0.25, 1.6, 0.75], zoom: 1 },
  // the hooks scraping in macro (cross-section, low from the side)
  {
    at: T.haken1 - 0.3,
    from: mac([8, 1.0, 4]),
    to: mac([6.8, 0.9, 2.8]),
    look: mac([2.5, 1.0, -1]),
    zoom: 1,
  },
  // the tongue out, in profile
  { at: T.zunge0, from: [1.6, 1.75, 1.1], to: [1.25, 1.7, 0.95], look: [0.05, 1.6, 0.72], zoom: 1 },
  // analogy: sandpaper
  {
    at: T.schmirgel,
    from: [-2.0, 0.9, 3.2],
    to: [-2.4, 0.6, 2.7],
    look: [-3.2, 0.1, 1.8],
    zoom: 1,
  },
  // the cat retches, a hairball lands on the rug
  { at: T.wuergt, from: [2.4, 1.5, 3.8], to: [2.0, 1.2, 3.1], look: [0.35, 0.65, 0.95], zoom: 1 },
  // no washcloth
  { at: T.kein, from: [3.3, 1.2, 3.0], to: [2.8, 0.9, 2.6], look: [1.9, 0.15, 1.5], zoom: 1 },
  // a comb: the hooks rake through the fur (money shot ~10 s)
  {
    at: T.kamm,
    from: mac([10, 2.0, 6]),
    to: mac([8, 1.4, 3.5]),
    look: mac([1.5, 1.1, -1]),
    zoom: 1,
    whip: 1,
  },
  // one hook, hard and glossy like a fingernail
  {
    at: T.finger - 0.35,
    orbit: { c: mac([3.5, 1.4, 0]), r: 1.8, y: 1.1, a0: 1.9, a1: 1.3 },
    zoom: 1,
  },
  // the rows: Papillen
  {
    at: T.papillen,
    from: mac([7, 0.7, 4]),
    to: mac([6, 0.8, 2.5]),
    look: mac([2.5, 1.3, -2]),
    zoom: 1,
  },
  // a knot — the hook turns and pulls it open
  {
    at: T.trifft,
    from: mac([6.2, 1.3, 2.6]),
    to: mac([5.2, 1.1, 1.8]),
    look: mac([3, 0.9, 0]),
    zoom: 1,
  },
  // loose hairs caught
  {
    at: T.lose,
    from: mac([7, 1.4, 0]),
    to: mac([6.2, 1.3, -1.5]),
    look: mac([2.6, 1.4, -4]),
    zoom: 1,
  },
  // all hooks point backwards — side view with arrows
  {
    at: T.alle,
    from: mac([11, 1.6, 1]),
    to: mac([10, 1.5, -0.5]),
    look: mac([2, 1.5, -1.5]),
    zoom: 1,
  },
  // quiet: one giant hook
  { at: T.nur, from: hk([0, 3.4, 11]), to: hk([0, 3.3, 8.5]), look: hk([0, 3.2, 0]), zoom: 1 },
  // the tip is hollow (x-ray)
  {
    at: T.hohl,
    from: hk([4.4, 2.1, 0.4]),
    to: hk([3.4, 1.8, 0.0]),
    look: hk([0, 1.2, -1.4]),
    zoom: 1,
  },
  // spit rises in the straw
  {
    at: T.spucke,
    from: hk([2.7, 1.7, 1.3]),
    to: hk([2.2, 1.5, 0.7]),
    look: hk([0, 1.05, -1.5]),
    zoom: 1,
  },
  // pressed down to the skin, drops land
  {
    at: T.bringen,
    from: mac([6.5, 0.7, 3.2]),
    to: mac([5.6, 0.6, 2.4]),
    look: mac([2.5, 0.5, -0.5]),
    zoom: 1,
  },
  // the drops evaporate and cool
  {
    at: T.dort,
    from: mac([6.4, 0.9, 2.8]),
    to: mac([5.6, 1.4, 2.2]),
    look: mac([2.6, 0.9, 0]),
    zoom: 1,
  },
  // paw pads: the only place a cat sweats
  { at: T.katzen, from: [0.95, 1.5, 2.6], to: [0.75, 1.45, 2.2], look: [0.17, 1.4, 0.7], zoom: 1 },
  // the cat licks itself in the sunbeam — air conditioning
  { at: T.ihre2, orbit: { c: [0, 1.4, 0.3], r: 2.4, y: 1.9, a0: -0.7, a1: -0.25 }, zoom: 1 },
  // payoff: everything goes back, into the throat
  {
    at: T.haare2 - 0.24,
    from: mac([11, 2.0, -3]),
    to: mac([10, 1.8, -5]),
    look: mac([1.5, 1.6, -9]),
    zoom: 1,
    whip: -1,
  },
  // one-way street sign
  {
    at: T.einbahn - 0.4,
    from: mac([13.2, 2.2, -2.6]),
    to: mac([12.2, 2.2, -3.6]),
    look: mac([4.8, 2.2, -6]),
    zoom: 1,
  },
  // Übrigens: a lion licks meat off a bone
  {
    at: T.fakt,
    from: bn([1.6, 1.7, 6.6]),
    to: bn([1.0, 1.45, 5.3]),
    look: bn([0, 0.95, 0]),
    zoom: 1,
  },
  // CTA: your cat looks at you
  { at: T.cta - 0.12, from: [0.15, 1.95, 2.6], to: [0.1, 1.9, 2.0], look: [0, 1.8, 0.4], zoom: 1 },
];

export const LABELS = [
  { text: "Haarballen", at: T.haarballen + 0.35, until: T.kein, pos: [0.55, 0.3, 1.35], side: -1 },
  { text: "Papillen", at: T.papillen, until: T.trifft, pos: mac([3.5, 1.2, -1]), side: 1 },
  { text: "Spucke", at: T.spucke + 0.45, until: T.bringen, pos: hk([-0.05, 1.3, -1.25]), side: 1 },
];

export const HIGHLIGHTS = [
  { kind: "zoom", at: T.haken1, amount: 0.3 },
  { kind: "shake", at: T.haarballen + 0.25, dur: 0.4, amp: 0.7 },
  { kind: "flash", at: T.kamm },
  { kind: "slowmo", at: T.dreht, until: T.lose, speed: 0.45 },
  { kind: "zoom", at: T.hinten, amount: 0.25 },
  { kind: "zoom", at: T.hohl, amount: 0.4 },
  { kind: "flash", at: T.spucke },
  { kind: "shake", at: T.haut, dur: 0.3, amp: 0.4 },
  { kind: "zoom", at: T.pfoten, amount: 0.3 },
  { kind: "zoom", at: T.einbahn, amount: 0.35 },
  { kind: "flash", at: T.knochen },
];

export const SFX = [
  { s: "lecken", at: 0.0, db: -6 },
  { s: "lecken", at: 0.62, db: -8 },
  { s: "lecken", at: 1.22, db: -8 },
  { s: "boing", at: T.haarballen + 0.25, db: -10 },
  { s: "lecken", at: T.kamm + 0.3, db: -10 },
  { s: "klack", at: T.dreht + 0.1, db: -14 },
  { s: "zisch", at: T.dort, dur: 1.6, db: -20 },
  { s: "lecken", at: T.ihre2 + 0.5, db: -10 },
  { s: "lecken", at: T.fakt + 0.6, db: -9 },
  { s: "schnurren", at: T.cta - 0.1, db: -12 },
];
