// #59 Kontaktlinsen (Format B) — every time-keyed decision as plain data,
// read by scene.js (picture) and scripts/build-sfx.mjs (sound).
import { W } from "./timing.js";

// ---------------------------------------------------------------- anchors
export const T = {
  linsen: W("Linsen", 1),
  ein: W("ein"),
  erstickt: W("erstickt"),
  klingt: W("Klingt"),
  hornhaut: W("Hornhaut", 1),
  keine: W("keine"),
  ader: W("Ader"),
  atmet: W("atmet"),
  luft: W("Luft"),
  augenzu: W("Augen", 1),
  zu: W("zu", 1),
  weniger: W("weniger"),
  und1: W("Und", 1),
  plastik: W("Plastik"),
  quillt: W("quillt"),
  brennen: W("brennen"),
  knallrot: W("knallrot"),
  linse: W("Linse"),
  fest: W("fest"),
  abwehr: W("Abwehr"),
  schlaeft: W("Schläft"),
  folge: W("Folge"),
  rate: W("Rate"),
  infektion: W("Infektion"),
  bis: W("Bis"),
  achtmal: W("achtmal"),
  keime: W("Keime"),
  keratitis: W("Keratitis"),
  amoeben: W("Amöben"),
  fressen: W("fressen"),
  meistens: W("Meistens"),
  gluecksspiel: W("Glücksspiel"),
  also: W("Also"),
  raus: W("raus"),
  einpennst: W("einpennst"),
  fakt: W("Übrigens"),
  zahl: W("27"),
  lid: W("Lid"),
  ehrlich: W("Ehrlich"),
};
// the hand clicks the lamp off in the second shot
T.click = T.ein + 0.42;

// ---------------------------------------------------------------- places
// HEAD = centre of the sleeper's head (lying on the right cheek, face +z);
// EYE = the upper (left) eye; CUT = the giant eye cross-section stage.
export const HEAD = [-0.55, 2.92, 0.1];
// local eye (−0.145, 0.07, 0.345) turned face-up → (−0.07, 0.345, 0.145)
export const EYE = [HEAD[0] - 0.07, HEAD[1] + 0.345, HEAD[2] + 0.145];
export const CUT = [0, 0, 70];
export const LAMP = [-1.25, 2.3, -4.15];
export const CASE = [-0.15, 2.3, -3.55];
const c = (x, y, z) => [CUT[0] + x, CUT[1] + y, CUT[2] + z];
const e = (x, y, z) => [EYE[0] + x, EYE[1] + y, EYE[2] + z];

// ---------------------------------------------------------------- shots
// shotCamera(shots, 1): from / to are real camera positions (no pull-back)
export const shots = [
  // 0 frame 0: the sleeper's face, eye half shut, red, lens glinting
  {
    at: 0,
    from: e(0.42, 0.62, 0.08),
    to: e(0.22, 0.36, 0.04),
    look: e(-0.02, 0, 0),
    lookTo: e(-0.03, 0, 0),
  },
  // 1 the hand switches the bedside lamp off
  { at: T.ein, from: [1.9, 4.3, 0.2], to: [1.5, 4.0, -0.6], look: [-0.9, 2.9, -3.0], sfx: false },
  // 2 cross-section: the shut eye with a lens — oxygen bounces off
  { at: T.erstickt, from: c(4.6, 4.2, 7.5), to: c(3.4, 3.2, 5.6), look: c(0, 0.9, 0) },
  // 3 Folge 1 — eye open, it breathes
  { at: T.klingt, orbit: { c: c(0, 0.8, 0), r: 8.5, y: 4.4, a0: -0.6, a1: -0.2 } },
  // 4 "Hornhaut" — close on the clear dome
  { at: T.hornhaut, from: c(-3.4, 3.8, 6.4), to: c(-2.7, 3.1, 5.4), look: c(0, 0.8, 0), whip: 1 },
  // 5 "keine einzige Ader" — the vessels stop at the edge
  { at: T.keine, from: c(4.2, 2.2, 4.6), to: c(3.6, 1.7, 3.9), look: c(2.3, 0.2, 1.2) },
  // 6 "atmet direkt aus der Luft" — from above, oxygen rains in
  { at: T.atmet, from: c(0.4, 9.5, 5.0), to: c(0.2, 8.0, 3.6), look: c(0, 0.6, 0) },
  // 7 "Augen zu?" — the lid slides over (slow motion)
  { at: T.augenzu, from: c(-6.8, 3.2, 6.0), to: c(-5.6, 2.8, 5.0), look: c(0, 1.0, 0) },
  // 8 "Und jetzt liegt auch noch Plastik drauf" — lid turns to glass, the lens
  { at: T.und1, from: c(5.6, 6.4, 8.8), to: c(4.3, 5.0, 7.0), look: c(0, 0.9, 0) },
  // 9 "Deine Hornhaut quillt auf"
  { at: T.quillt - 0.62, from: c(0, 2.4, 5.6), to: c(0, 2.0, 4.6), look: c(0, 1.0, 0) },
  // 10 bedroom: the eye opens, knallrot
  {
    at: T.brennen - 0.26,
    from: e(0.5, 0.75, 0.1),
    to: e(0.24, 0.42, 0.05),
    look: e(-0.02, 0, 0),
    whip: -1,
  },
  // 11 "die Linse klebt fest"
  { at: T.linse - 0.08, from: c(5.4, 3.2, 5.6), to: c(4.6, 2.6, 4.8), look: c(1.8, 0.4, 0.9) },
  // 12 "Und deine Abwehr? Schläft gleich mit."
  {
    at: T.abwehr - 0.28,
    from: c(-1.2, 1.4, 6.4),
    to: c(-0.8, 1.15, 5.5),
    look: c(-0.2, 0.15, 3.3),
  },
  // 13 Folge für mehr Wissen — the dark bedroom, moon in the window
  { at: T.folge, from: [5.5, 4.6, 7.4], to: [4.2, 4.0, 6.4], look: [1.2, 3.2, -2.5] },
  // 14 Rate mal — germs multiply on the lens
  { at: T.rate, orbit: { c: c(0, 1.0, 0), r: 7.0, y: 4.2, a0: 0.5, a1: 0.05 } },
  // 15 "Bis zu achtmal" — crash in
  { at: T.bis, from: c(1.4, 3.0, 4.4), to: c(1.0, 2.6, 3.7), look: c(0, 1.0, 0) },
  // 16 "Keime kriechen in die geschwächte Hornhaut"
  { at: T.keime, from: c(-4.0, 3.4, 5.6), to: c(-3.2, 2.8, 4.6), look: c(-0.4, 0.9, 0.4) },
  // 17 "Keratitis" — whip to the clouded cornea
  {
    at: T.keratitis - 0.16,
    from: c(2.6, 4.8, 5.4),
    to: c(1.9, 4.0, 4.5),
    look: c(0, 0.9, 0),
    whip: 1,
  },
  // 18 "Amöben" — the amoeba eats (slow motion)
  { at: T.amoeben - 0.14, from: c(1.2, 4.4, 6.2), to: c(1.0, 3.7, 5.1), look: c(1.0, 1.0, 0.7) },
  // 19 "Meistens geht's gut" — the sleeper, calm
  { at: T.meistens, from: [1.5, 4.6, 1.6], to: [1.0, 4.2, 1.2], look: [-0.6, 3.1, 0.1] },
  // 20 "Glücksspiel" — dice tumble over the duvet
  { at: T.gluecksspiel - 0.1, from: [3.6, 4.7, 3.6], to: [3.1, 4.3, 3.0], look: [1.4, 3.0, 0.8] },
  // 21 "Also: raus damit" — the lens goes into its case
  {
    at: T.also,
    from: [0.9, 3.4, -1.3],
    to: [0.55, 3.15, -1.85],
    look: [CASE[0], CASE[1] + 0.1, CASE[2]],
  },
  // 22 "Übrigens" — 27 lenses slide out from under the lid
  { at: T.fakt, from: c(-1.6, 4.6, 10.4), to: c(-1.0, 4.0, 9.0), look: c(2.8, 2.3, 1.5) },
  // 23 comment question — the sleeper, eyes clear, lamp case shut
  { at: T.ehrlich, from: [1.2, 4.0, 0.9], to: [0.8, 3.75, 0.6], look: [-0.6, 3.2, 0.1] },
];

// ---------------------------------------------------------------- labels
const R = 4.2; // cornea outer radius (scene.js)
const CY = -3.16; // centre of the cornea sphere (scene.js)
const onDome = (a, phi, lift = 0) => {
  const rr = R + lift;
  return c(
    Math.sin(a) * Math.cos(phi) * rr,
    CY + Math.cos(a) * rr,
    Math.sin(a) * Math.sin(phi) * rr,
  );
};
export const LABELS = [
  { text: "Hornhaut", at: T.hornhaut, until: T.keine - 0.05, pos: onDome(0.2, 0.8), side: 1 },
  { text: "Linse", at: T.plastik, until: T.quillt - 0.62, pos: onDome(0.5, 1.2, 0.12), side: 1 },
  { text: "klebt fest", at: T.fest, until: T.abwehr - 0.28, pos: onDome(0.74, 0.7, 0.1), side: -1 },
  { text: "Abwehrzellen", at: T.abwehr, until: T.folge, pos: c(-0.2, 0.35, 3.3), side: 1 },
  {
    text: "Keime",
    at: T.keime + 0.1,
    until: T.keratitis - 0.16,
    pos: onDome(0.35, 2.2, 0.15),
    side: -1,
  },
  { text: "Keratitis", at: T.keratitis, until: T.amoeben - 0.14, pos: onDome(0.15, 1.0), side: 1 },
  {
    text: "Amöbe",
    at: T.amoeben + 0.05,
    until: T.meistens,
    pos: onDome(0.3, 0.75, 0.25),
    side: -1,
  },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "zoom", at: 0.35, amount: 0.25 }, // the red eye pushes in
  { kind: "flash", at: T.erstickt }, // "erstickt"
  { kind: "shake", at: T.erstickt + 0.05, dur: 0.5, amp: 0.8 },
  { kind: "zoom", at: T.hornhaut, amount: 0.3 },
  { kind: "slowmo", at: T.augenzu, until: T.und1, speed: 0.4 }, // the lid closes
  { kind: "zoom", at: T.plastik, amount: 0.35 }, // money shot: the lens
  { kind: "flash", at: T.plastik + 0.05 },
  { kind: "shake", at: T.quillt, dur: 0.7, amp: 0.7 },
  { kind: "flash", at: T.knallrot },
  { kind: "zoom", at: T.achtmal, amount: 0.35 },
  { kind: "flash", at: T.achtmal + 0.05 },
  { kind: "slowmo", at: T.amoeben - 0.14, until: T.meistens, speed: 0.45 },
  { kind: "flash", at: T.gluecksspiel + 0.35 },
  { kind: "shake", at: T.gluecksspiel + 0.35, dur: 0.4, amp: 0.6 },
  { kind: "zoom", at: T.zahl, amount: 0.3 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "rauschen", at: 0, dur: 2.0, db: -24 }, // night air, frame 0 not silent
  { s: "click", at: T.click }, // the lamp switch
  { s: "rauschen", at: T.atmet, dur: T.augenzu - T.atmet, db: -22 }, // oxygen streaming in
  { s: "pop", at: T.plastik + 0.05 }, // the lens lands
  { s: "boing", at: T.quillt + 0.05, db: -12 }, // the cornea swells
  { s: "pop", at: T.schlaeft + 0.1, db: -14 },
  { s: "blip", at: T.rate + 0.6, db: -16 },
  { s: "klack", at: T.gluecksspiel + 0.35 }, // dice land
  { s: "klack", at: T.gluecksspiel + 0.6, db: -8 },
  { s: "klack", at: T.raus + 0.85 }, // the lens case snaps shut
];
