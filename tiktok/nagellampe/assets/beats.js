// #36 UV-Nagellampe — every time-keyed decision as plain data (scene.js +
// scripts/build-sfx.mjs). No three.js / DOM here.
import { W } from "./timing.js";

// places: the nail table with the lamp is the origin (studio); MICRO = the
// inside of the gel layer on the nail, a dark violet world under the floor
// with the molecules; ZAHN = the giant tooth with the dentist's blue lamp.
export const MICRO = [0, -60, 0];
export const ZAHN = [0, -120, 0];
const M = (x, y, z) => [x + MICRO[0], y + MICRO[1], z + MICRO[2]];
const Z = (x, y, z) => [x + ZAHN[0], y + ZAHN[1], z + ZAHN[2]];
// the hero photoinitiator in MICRO (local), the one with the little hand
export const I0 = [0.6, 2.0, 1.2];
const HERO = M(...I0);
// moving points the scene updates every frame (camera rel / label pos)
export const FOLLOW = { x: 0, y: 0, z: 0 }; // head of the hero chain (world)
export const NAIL = [0, 0, 0]; // index nail of your hand (world)
export const HEAD = [0, 0, 0]; // hero chain head (world), for its label
export const BEADPOS = [0, 0, 0]; // one monomer (world), for its label
export const JEDER = [0, 0, 0]; // the bead of the arms macro (world)
export const JEDER_REL = { x: 0, y: 0, z: 0 }; // same, for the camera

// ---------------------------------------------------------------- beats
export const T = {
  nie: W("nie"),
  unter: W("Unter"),
  plastik: W("Plastik"),
  brennt1: W("brennt", 1),
  obwohl: W("obwohl"),
  kaum: W("kaum"),
  stell: W("Stell"),
  eben: W("Eben"),
  gel1: W("Gel", 1),
  wie1: W("wie", 1),
  honig: W("Honig"),
  kurz: W("Kurz"),
  hart: W("hart"),
  huelle: W("Handyhülle"),
  da: W("Da"),
  nichts: W("nichts"),
  zeug: W("Zeug"),
  baut: W("baut"),
  folg: W("Folg"),
  schwimmen: W("schwimmen"),
  bausteine1: W("Bausteine", 1),
  dazwischen: W("Dazwischen"),
  zuender: W("Zünder"),
  foto: W("Fotoinitiator"),
  trifft: W("Trifft"),
  platzt: W("platzt"),
  uebrig: W("Übrig"),
  hand: W("Hand"),
  radikal1: W("Radikal", 1),
  rate: W("Rate"),
  tausende: W("Tausende"),
  schnappt1: W("schnappt", 1),
  schnappt2: W("schnappt", 2),
  kette: W("Kettenreaktion"),
  jeder: W("Jeder"),
  haende: W("Hände"),
  also: W("Also"),
  netz: W("Netz"),
  nur: W("Nur"),
  sauerstoff: W("Sauerstoff"),
  darum: W("Darum"),
  klebrig: W("klebrig"),
  kein: W("Kein"),
  chemie: W("Chemie"),
  und2: W("Und", 2),
  waerme: W("Wärme"),
  milliarden2: W("Milliarden", 2),
  brennt2: W("brennt", 2),
  fakt: W("Übrigens"),
  zahnarzt: W("Zahnarzt"),
  fuellung: W("Füllung"),
  haertet: W("härtet"),
  blauem: W("blauem"),
  cta: W("Gel-Nägel", 2),
  kommentare: W("Kommentare"),
};
// the lamp is on (studio): the hook, the cure and the payoff
export const LAMP_ON = [
  [-1, T.stell],
  [T.kurz + 0.15, T.huelle],
  [T.brennt2 - 0.6, T.fakt],
];
// slow motion while the UV rays fall onto the photoinitiators
export const SLOW = 0.4;

// ---------------------------------------------------------------- shots
export const shots = [
  // hook: your hand in the glowing lamp, nails lit — push in fast
  { at: 0, from: [3.0, 2.0, 3.8], to: [2.35, 1.65, 3.0], look: [0, 0.72, 0.5], zoom: 1.0 },
  // "Unter der Lampe": macro along the glowing nails
  {
    at: T.unter,
    from: [1.15, 0.85, 0.75],
    to: [0.9, 0.7, 0.45],
    look: [-0.15, 0.3, -0.3],
    zoom: 1.0,
  },
  // "Plastik": from the other side, the gel hardening into a gloss
  {
    at: T.plastik,
    from: [-1.3, 1.0, 0.8],
    to: [-1.0, 0.85, 0.55],
    look: [0.0, 0.3, -0.25],
    zoom: 1.0,
  },
  // "brennt dein Finger": medium, the hand jerks out
  { at: T.brennt1, from: [-2.4, 1.3, 3.6], to: [-2.0, 1.15, 3.1], look: [0, 0.6, 0.8], zoom: 1.0 },
  // "obwohl die Lampe kaum warm wird": the finger taps the lamp's roof
  { at: T.obwohl, from: [-2.0, 1.6, 2.6], to: [-1.6, 1.35, 2.1], look: [0, 0.6, 0], zoom: 1.0 },
  // "Stell dir vor … im Nagelstudio": the whole studio
  { at: T.stell, from: [6.2, 3.6, 10.2], to: [5.0, 3.0, 8.4], look: [0, 0.8, -1.2], zoom: 1.0 },
  // "Eben war das Gel flüssig": the brush on the nail
  {
    at: T.eben,
    from: [1.3, 1.1, 2.7],
    to: [1.0, 0.85, 2.35],
    look: [-0.25, 0.25, 1.55],
    zoom: 1.0,
  },
  // "wie Honig": macro on the honey thread
  {
    at: T.wie1,
    from: [-1.0, 0.65, 2.1],
    to: [-0.8, 0.6, 1.95],
    look: [-0.25, 0.4, 1.5],
    zoom: 1.0,
  },
  // "Kurz darauf": the hand slides into the lamp, light on
  {
    at: T.kurz,
    from: [2.4, 2.5, 2.6],
    to: [1.7, 1.9, 1.6],
    look: [0, 0.3, 0.1],
    zoom: 1.0,
    whip: 1,
  },
  // "hart": macro on the glowing nails
  {
    at: T.hart,
    from: [-1.2, 0.85, 0.85],
    to: [-0.95, 0.72, 0.6],
    look: [0.0, 0.3, -0.3],
    zoom: 1.0,
  },
  // "Handyhülle": the nails tap on the phone case
  {
    at: T.huelle,
    from: [4.3, 1.5, 1.5],
    to: [3.95, 1.3, 1.25],
    look: [2.4, 0.35, 0.75],
    zoom: 1.0,
  },
  // "Da verdunstet nichts": macro, steam that isn't there (✕)
  { at: T.da, from: [1.1, 1.3, 2.9], to: [0.9, 1.1, 2.6], look: [-0.2, 0.45, 1.55], zoom: 1.0 },
  // "Das Zeug baut sich selbst um": push into the nail …
  { at: T.zeug, from: [0.6, 0.9, 2.3], to: [-0.1, 0.45, 1.75], look: [-0.25, 0.3, 1.5], zoom: 1.0 },
  // … and through it: the molecule world
  { at: T.baut, from: M(0, 10, 12), to: M(0, 6, 9.5), look: M(0, 2, 0), zoom: 1.0, whip: -1 },
  // follow line: slow orbit, the gel just swims
  {
    at: T.folg,
    orbit: { c: M(0, 2, 0), r: 10, y: M(0, 5.2, 0)[1], a0: 0.45, a1: 0.05 },
    zoom: 1.0,
  },
  // "Im Gel schwimmen Milliarden winziger Bausteine": macro in the crowd
  {
    at: T.schwimmen,
    from: M(3.6, 2.9, 4.6),
    to: M(2.8, 2.6, 3.8),
    look: M(1.2, 2.0, 1.0),
    zoom: 1.0,
  },
  // "Dazwischen warten Zünder": the yellow one
  { at: T.dazwischen, from: M(2.9, 3.2, 4.0), to: M(2.3, 2.8, 3.4), look: HERO, zoom: 1.0 },
  // "der Fotoinitiator": tight
  { at: T.foto, from: M(1.9, 2.5, 3.0), to: M(1.6, 2.3, 2.6), look: HERO, zoom: 1.0 },
  // "Trifft ihn das UV-Licht" (slow motion): the rays fall in
  {
    at: T.trifft,
    from: M(-4.4, 5.2, 8.4),
    to: M(-3.8, 4.6, 7.4),
    look: M(0, 2.3, 0),
    lookTo: HERO,
    zoom: 1.0,
  },
  // "platzt er auf": macro, the burst
  { at: T.platzt, from: M(1.8, 2.4, 3.0), to: M(2.2, 2.7, 3.6), look: HERO, zoom: 1.0 },
  // "Übrig bleibt ein wildes Teilchen mit einer freien Hand"
  { at: T.uebrig, from: M(-1.5, 2.5, 3.1), to: M(-1.1, 2.3, 2.6), look: HERO, zoom: 1.0 },
  // "ein Radikal": orbit around it
  { at: T.radikal1, orbit: { c: HERO, r: 2.4, y: HERO[1] + 0.8, a0: -0.6, a1: 0.2 }, zoom: 1.0 },
  // "Rate mal …": quiet front shot, the counter asks
  { at: T.rate, from: M(0.6, 2.6, 4.6), to: M(0.6, 2.4, 3.9), look: HERO, zoom: 1.0 },
  // "Tausende": wide, the chain reaction everywhere
  {
    at: T.tausende,
    orbit: { c: M(0, 2, 0), r: 9.5, y: M(0, 5.8, 0)[1], a0: 0.75, a1: 0.25 },
    zoom: 1.0,
  },
  // "Es schnappt sich einen": follow the hero chain head
  {
    at: T.schnappt1,
    from: [1.5, 2.2, 2.6],
    to: [1.2, 1.8, 2.1],
    look: [0, 0, 0],
    rel: FOLLOW,
    zoom: 1.0,
  },
  {
    at: T.schnappt2,
    from: [-1.6, 2.3, 2.5],
    to: [-1.3, 1.9, 2.0],
    look: [0, 0, 0],
    rel: FOLLOW,
    zoom: 1.0,
  },
  // "eine Kettenreaktion": high and wide
  { at: T.kette, from: M(5, 8.5, 8.5), to: M(4, 7.2, 7.2), look: M(0, 2, 0), zoom: 1.0 },
  // "Jeder Baustein hat mehrere Hände": macro on one bead with its arms
  {
    at: T.jeder,
    from: [0.7, 0.55, 1.6],
    to: [0.55, 0.45, 1.25],
    look: [0, 0, 0],
    rel: JEDER_REL,
    zoom: 1.0,
  },
  // "Also wachsen die Ketten zu einem Netz zusammen": pull back, orbit
  { at: T.also, orbit: { c: M(0, 2, 0), r: 8, y: M(0, 4.4, 0)[1], a0: -0.5, a1: 0.25 }, zoom: 1.0 },
  // "Nur ganz oben stört der Sauerstoff": the top surface, O2 rains down
  { at: T.nur, from: M(4.4, 6.9, 5.9), to: M(3.8, 6.3, 5.1), look: M(0.5, 4.3, -0.5), zoom: 1.0 },
  // "Darum ist die oberste Schicht immer klebrig": studio, the finger pulls threads
  {
    at: T.darum,
    from: [1.2, 1.25, 2.95],
    to: [0.95, 1.05, 2.6],
    look: [-0.3, 0.4, 1.5],
    zoom: 1.0,
    whip: 1,
  },
  // "Kein Pfusch – Chemie": the pad wipes, the gloss shines
  { at: T.kein, from: [1.5, 1.4, 3.1], to: [1.2, 1.15, 2.65], look: [-0.2, 0.3, 1.5], zoom: 1.0 },
  // "Und jede neue Verbindung gibt ein bisschen Wärme ab": macro on the bonds
  { at: T.und2, from: M(2.6, 3.0, 3.4), to: M(2.0, 2.7, 2.8), look: M(0.5, 2.0, 0.6), zoom: 1.0 },
  // "Milliarden auf einmal": wide, the whole net glows hot
  { at: T.milliarden2, from: M(-6, 6.5, 9), to: M(-7, 7.5, 10.5), look: M(0, 2.2, 0), zoom: 1.0 },
  // "brennt auf deinem Nagel": back in the lamp, the jerk
  {
    at: T.brennt2,
    from: [3.0, 1.9, 4.0],
    to: [2.7, 1.7, 3.6],
    look: [0, 0.5, 0.6],
    zoom: 1.0,
    whip: 1,
  },
  // "Übrigens: Beim Zahnarzt": the giant tooth
  {
    at: T.fakt,
    from: Z(3.6, 5.2, 7.4),
    to: Z(2.8, 4.4, 6.0),
    look: Z(0, 1.9, 0),
    zoom: 1.0,
    whip: -1,
  },
  // "deine weiße Füllung härtet mit blauem Licht": macro, blue light
  { at: T.fuellung, from: Z(2.2, 4.6, 3.4), to: Z(1.8, 4.2, 2.8), look: Z(0, 2.5, 0), zoom: 1.0 },
  // CTA: your finished nails next to a bottle of classic polish
  { at: T.cta, from: [0.5, 2.6, 4.5], to: [0.3, 2.2, 3.9], look: [-0.6, 0.3, 1.2], zoom: 1.0 },
  // drone pull-back through the studio
  {
    at: T.kommentare - 0.4,
    from: [1.4, 1.9, 5.4],
    to: [4.6, 3.6, 9.2],
    look: [0.3, 0.5, 0.6],
    lookTo: [0, 1.0, -1.5],
  },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Gel", at: T.gel1 + 0.1, until: T.wie1, pos: NAIL, side: -1 },
  { text: "Baustein", at: T.bausteine1, until: T.dazwischen, pos: BEADPOS, side: 1 },
  { text: "Fotoinitiator", at: T.foto, until: T.trifft, pos: HERO, side: -1 },
  { text: "Radikal", at: T.radikal1, until: T.rate, pos: HEAD, side: 1 },
  { text: "Kettenreaktion", at: T.kette + 0.1, until: T.jeder, pos: M(0, 2.4, 0), side: 1 },
  { text: "Netz", at: T.netz, until: T.nur, pos: M(0.2, 2.0, 0.2), side: -1 },
  { text: "Sauerstoff", at: T.sauerstoff, until: T.darum, pos: M(0.8, 4.6, 0.6), side: 1 },
  { text: "klebrig", at: T.klebrig, until: T.kein, pos: NAIL, side: -1 },
  { text: "Füllung", at: T.fuellung, until: T.cta - 0.3, pos: Z(0, 2.65, 0.2), side: -1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "zoom", at: T.nie, amount: 0.3 }, // the claim before 1.5 s
  { kind: "flash", at: T.plastik + 0.1 },
  { kind: "shake", at: T.brennt1 + 0.05, dur: 0.5, amp: 0.8 },
  { kind: "zoom", at: T.honig, amount: 0.25 },
  { kind: "flash", at: T.kurz + 0.25 },
  { kind: "shake", at: T.huelle + 0.3, dur: 0.25, amp: 0.4 },
  { kind: "zoom", at: T.nichts, amount: 0.25 },
  { kind: "slowmo", at: T.trifft, until: T.platzt, speed: SLOW },
  { kind: "flash", at: T.platzt + 0.05 },
  { kind: "shake", at: T.platzt + 0.05, dur: 0.5, amp: 0.7 },
  { kind: "zoom", at: T.radikal1, amount: 0.25 },
  { kind: "flash", at: T.tausende },
  { kind: "shake", at: T.tausende, dur: 0.8, amp: 0.8 },
  { kind: "zoom", at: T.kette, amount: 0.3 },
  { kind: "zoom", at: T.netz, amount: 0.25 },
  { kind: "zoom", at: T.klebrig, amount: 0.25 },
  { kind: "flash", at: T.milliarden2 + 0.3 },
  { kind: "shake", at: T.milliarden2 + 0.3, dur: 0.7, amp: 0.6 },
  { kind: "shake", at: T.brennt2 + 0.05, dur: 0.6, amp: 1.0 },
  { kind: "flash", at: T.blauem },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "piep", at: 0.0, dur: 0.35, db: -12 }, // frame 0: the lamp beeps on
  { s: "surr", at: 0.0, dur: 3.7, db: -22 }, // its hum
  { s: "boing", at: T.brennt1 + 0.1, db: -12 }, // the hand jerks out
  { s: "klack", at: T.kaum + 0.05, db: -16 }, // finger taps the roof
  { s: "click", at: T.kurz + 0.12 },
  { s: "piep", at: T.kurz + 0.15, dur: 0.35, db: -13 },
  { s: "surr", at: T.kurz + 0.2, dur: 1.6, db: -22 },
  { s: "klack", at: T.huelle + 0.3, db: -9 }, // tap tap on the phone case
  { s: "klack", at: T.huelle + 0.58, db: -10 },
  { s: "surr", at: T.trifft, dur: 1.4, db: -20 }, // the UV rays
  { s: "pop", at: T.platzt + 0.05, db: -6 },
  { s: "pop", at: T.tausende + 0.05 },
  { s: "pop", at: T.tausende + 0.3, db: -12 },
  { s: "pop", at: T.tausende + 0.55, db: -12 },
  { s: "blip", at: T.schnappt1 + 0.15 },
  { s: "blip", at: T.schnappt2 + 0.1 },
  { s: "pop", at: T.kette - 0.4, db: -14 },
  { s: "pop", at: T.kette - 0.2, db: -14 },
  { s: "pop", at: T.also + 0.4, db: -14 },
  { s: "pop", at: T.also + 0.8, db: -14 },
  { s: "boing", at: T.klebrig - 0.3, db: -14 }, // the sticky thread snaps back
  { s: "zisch", at: T.kein + 0.1, dur: 0.5, db: -20 }, // the pad wipes
  { s: "surr", at: T.und2 + 0.5, dur: 3.6, db: -21 }, // heat
  { s: "piep", at: T.brennt2 - 0.6, dur: 0.35, db: -14 },
  { s: "surr", at: T.haertet, dur: 1.2, db: -20 }, // the dentist's blue lamp
  { s: "pop", at: T.cta + 0.1, db: -12 },
];
