// #38 Knicklicht — every time-keyed decision as plain data (scene.js +
// scripts/build-sfx.mjs). No three.js / DOM here.
import { W } from "./timing.js";

// places: the Halloween yard with the glow stick is the origin; MICRO = the
// inside of the liquid, a dark world under the yard with the molecules.
export const MICRO = [0, -60, 0];
export const M = (x, y, z) => [x + MICRO[0], y + MICRO[1], z + MICRO[2]];
// the stick floats upright at the origin, pivot (bend point) at y = 1.4
export const PIVOT = 1.4;
// side props in the yard: the cola glass, the light bulb, the fridge, the firefly
export const COLA = [-4.6, 0, 2.2];
export const BULB = [4.6, 0, 2.2];
export const FRIDGE = [-4.8, 0, -2.6];
export const FLY = [1.7, 2.35, 1.0];
// moving points the scene updates every frame (label positions)
export const HP0 = [0, 0, 0]; // the hero H2O2 molecule
export const OIL0 = [0, 0, 0]; // the hero oil molecule
export const CO2A = [0, 0, 0]; // one CO2 after the burst
export const DYE = M(0, 2.2, 0); // the green dye molecule

// ---------------------------------------------------------------- beats
export const T = {
  glas1: W("Glas", 1),
  zerbrichst: W("zerbrichst"),
  und1: W("und", 1),
  leuchtet1: W("leuchtet", 1),
  ohne1: W("Ohne", 1),
  ohne2: W("Ohne", 2),
  stell: W("Stell"),
  stockdunkel: W("stockdunkel"),
  biegst: W("biegst"),
  knackt: W("knackt"),
  da: W("Da"),
  roehrchen: W("Glasröhrchen"),
  jetzt: W("jetzt"),
  kaputt: W("kaputt"),
  zwei: W("Zwei"),
  laufen: W("laufen"),
  zack: W("Zack"),
  neon: W("Neon"),
  folg: W("Folg"),
  im: W("Im", 1),
  peroxid: W("Wasserstoffperoxid"),
  zeug: W("Zeug"),
  haare: W("Haare-Blondieren"),
  draussen: W("Draußen"),
  oel: W("Öl"),
  zusammen: W("Zusammen"),
  molekuel1: W("Molekül", 1),
  vollgepackt: W("vollgepackt"),
  feder: W("Feder"),
  nur: W("Nur"),
  lebt: W("lebt"),
  wimpern: W("Wimpernschlag"),
  platzt: W("platzt"),
  kohlendioxid: W("Kohlendioxid"),
  gas1: W("Gas", 1),
  cola: W("Cola"),
  aber: W("Aber"),
  wo: W("Wo"),
  hin: W("hin"),
  rate: W("Rate"),
  heiss: W("heiß"),
  gar: W("Gar"),
  das2: W("Das", 4),
  kaltes: W("kaltes"),
  eine: W("Eine", 2),
  gluehbirne: W("Glühbirne"),
  hitze: W("Hitze"),
  und2: W("Und", 2),
  gefrierfach: W("Gefrierfach"),
  reaktion: W("Reaktion"),
  schlaeft: W("schläft"),
  leuchtet3: W("leuchtet", 3),
  das3: W("Das", 5),
  farbstoff1: W("Farbstoff", 1),
  energie3: W("Energie", 3),
  springt: W("springt"),
  spuckt: W("spuckt"),
  welcher: W("Welcher"),
  bestimmt: W("bestimmt"),
  farbe: W("Farbe"),
  fakt: W("Übrigens"),
  fly: W("Glühwürmchen"),
  mit: W("mit", 2),
  hintern: W("Hintern"),
  gruen: W("Grün"),
  pink: W("Pink"),
  blau: W("Blau"),
  welche: W("welche"),
  kommentare: W("Kommentare"),
};
// the spark (the energy) hits the dye
export const HIT = T.springt + 0.3;

// ---------------------------------------------------------------- shots
const Y = PIVOT;
export const shots = [
  // hook: both hands snap the stick, neon floods out — fast push-in
  { at: 0, from: [1.25, 1.85, 3.7], to: [0.7, 1.65, 2.6], look: [0, 1.45, 0], zoom: 1.0 },
  // "Glas": macro on the break, shards drifting (slow motion)
  { at: T.glas1, from: [0.5, 1.55, 0.8], to: [0.34, 1.46, 0.58], look: [0, Y, 0], zoom: 1.0 },
  // "Du zerbrichst es jedes Mal": low side angle, the hands snap again
  { at: T.zerbrichst, from: [-1.5, 0.9, 2.1], to: [-1.1, 1.05, 1.7], look: [0, 1.5, 0], zoom: 1.0 },
  // "und genau davon leuchtet es": the whole yard turns green
  { at: T.und1, from: [3.6, 2.7, 7.6], to: [2.7, 2.2, 5.9], look: [0, 1.3, 0], zoom: 1.0 },
  // "Ohne Batterie"
  { at: T.ohne1, from: [1.5, 1.6, 2.7], to: [1.15, 1.45, 2.25], look: [0.45, 1.3, 0.2], zoom: 1.0 },
  // "Ohne Strom"
  {
    at: T.ohne2,
    from: [-1.5, 1.6, 2.7],
    to: [-1.15, 1.45, 2.25],
    look: [-0.45, 1.3, 0.2],
    zoom: 1.0,
  },
  // "Stell dir vor: Halloween-Party": the yard, the house, the lights
  { at: T.stell, from: [9.5, 6.2, 17], to: [7.4, 4.9, 13.4], look: [0, 1.6, -6], zoom: 1.0 },
  // "stockdunkel": the lights go out, the stick still dark
  { at: T.stockdunkel, from: [2.4, 2.1, 4.4], to: [1.9, 1.85, 3.6], look: [0, 1.4, 0], zoom: 1.0 },
  // "Du biegst den Stab": the hands, close
  { at: T.biegst, from: [0.5, 2.0, 2.5], to: [0.35, 1.75, 2.0], look: [0, 1.5, 0], zoom: 1.0 },
  // "es knackt": crash zoom on the break
  { at: T.knackt, from: [0.62, 1.48, 1.05], to: [0.46, 1.44, 0.82], look: [0, Y, 0], zoom: 1.0 },
  // "Da drin steckt ein winziges Glasröhrchen": x-ray, the whole stick
  { at: T.da, from: [1.2, 1.7, 2.6], to: [0.95, 1.55, 2.1], look: [0, Y, 0], zoom: 1.0 },
  // "jetzt kaputt": macro, shards in slow motion
  { at: T.jetzt, from: [0.38, 1.62, 0.66], to: [0.27, 1.46, 0.52], look: [0, Y, 0], zoom: 1.0 },
  // "Zwei Flüssigkeiten … laufen ineinander": orbit close around the mix
  { at: T.zwei, orbit: { c: [0, Y, 0], r: 0.85, y: 1.55, a0: 0.7, a1: -0.4 }, zoom: 1.0 },
  {
    at: T.laufen,
    from: [-1.3, 1.9, 2.7],
    to: [-1.0, 1.65, 2.2],
    look: [0, Y, 0],
    zoom: 1.0,
    whip: 1,
  },
  // "Zack: Neon": pull back, the yard bathes in green
  { at: T.zack, from: [2.4, 1.6, 4.2], to: [3.4, 2.5, 6.8], look: [0, 1.5, 0], zoom: 1.0 },
  // follow line: slow orbit around the glowing stick
  { at: T.folg, orbit: { c: [0, 1.45, 0], r: 3.4, y: 2.1, a0: 0.9, a1: 0.25 }, zoom: 1.0 },
  // MICRO: dive into the liquid, H2O2 molecules
  {
    at: T.im,
    from: M(0.6, 4.2, 9.5),
    to: M(-0.8, 3.1, 6.4),
    look: M(-2.0, 2.3, 0),
    zoom: 1.0,
    whip: -1,
  },
  // "das Zeug zum Haare-Blondieren": the ponytail gag
  {
    at: T.zeug,
    from: M(-4.6, 2.9, 4.0),
    to: M(-5.2, 2.6, 3.2),
    look: M(-6.5, 2.2, 0.5),
    zoom: 1.0,
  },
  // "Draußen wartet ein Öl"
  { at: T.draussen, from: M(3.2, 3.3, 7.6), to: M(2.8, 3.0, 6.4), look: M(2.5, 2.4, 0), zoom: 1.0 },
  // "Zusammen bauen sie ein winziges Molekül"
  { at: T.zusammen, from: M(0, 3.4, 8.6), to: M(0, 2.9, 6.6), look: M(0, 2.2, 0.4), zoom: 1.0 },
  // "vollgepackt mit Energie wie eine gespannte Feder": macro on the spring
  {
    at: T.vollgepackt,
    from: M(1.0, 2.7, 2.3),
    to: M(0.65, 2.45, 1.75),
    look: M(0, 2.2, 0.5),
    zoom: 1.0,
  },
  // "Nur: Das Molekül lebt kürzer als ein Wimpernschlag": quiet, the eye behind
  { at: T.nur, from: M(0, 3.1, 9.4), to: M(0, 2.9, 8.2), look: M(0, 2.5, -2), zoom: 1.0 },
  // "Es platzt": burst, pull back
  {
    at: T.platzt - 0.1,
    from: M(1.2, 2.7, 4.6),
    to: M(1.8, 3.1, 7.4),
    look: M(0, 2.3, 0.4),
    zoom: 1.0,
  },
  // "das Gas aus deiner Cola": the cola glass in the yard
  {
    at: T.gas1,
    from: [-3.75, 1.75, 3.9],
    to: [-4.1, 1.5, 3.35],
    look: [COLA[0], 1.25, COLA[2]],
    zoom: 1.0,
  },
  // "Aber Gas leuchtet nicht": the dark CO2, ✕
  { at: T.aber, from: M(0.4, 2.9, 7.0), to: M(0.2, 2.7, 6.0), look: M(0, 2.3, 0.5), zoom: 1.0 },
  // "Wo ist die Energie hin?": the spark — and away
  {
    at: T.wo,
    from: M(-0.6, 2.9, 5.4),
    to: M(-0.4, 2.8, 4.7),
    look: M(0, 2.5, 1.1),
    lookTo: M(0.9, 2.6, 1.1),
    zoom: 1.0,
  },
  // "Rate mal, wie heiß dein Knicklicht wird": front, the gauge
  { at: T.rate, from: [0.2, 1.75, 3.6], to: [0.1, 1.6, 3.0], look: [0, 1.4, 0], zoom: 1.0 },
  // "Das ist kaltes Licht": the hand holds it, macro
  { at: T.das2, from: [0.9, 1.7, 1.6], to: [0.65, 1.55, 1.25], look: [0, 1.45, 0], zoom: 1.0 },
  // "Eine Glühbirne macht fast nur Hitze"
  {
    at: T.eine,
    from: [BULB[0] - 1.0, 1.9, BULB[2] + 2.0],
    to: [BULB[0] - 0.7, 1.75, BULB[2] + 1.45],
    look: [BULB[0], 1.35, BULB[2]],
    zoom: 1.0,
  },
  // "Und nach der Party ab ins Gefrierfach": the fridge
  {
    at: T.und2,
    from: [FRIDGE[0] + 2.6, 2.5, FRIDGE[2] + 6.4],
    to: [FRIDGE[0] + 2.0, 2.3, FRIDGE[2] + 5.4],
    look: [FRIDGE[0], 1.7, FRIDGE[2]],
    zoom: 1.0,
  },
  // "Die Reaktion schläft fast ein": inside the freezer
  {
    at: T.reaktion,
    from: [FRIDGE[0] + 1.25, 2.55, FRIDGE[2] + 2.9],
    to: [FRIDGE[0] + 1.0, 2.45, FRIDGE[2] + 2.35],
    look: [FRIDGE[0], 2.12, FRIDGE[2]],
    zoom: 1.0,
  },
  // "es leuchtet viel länger": pull back, the faint glow in the dark
  {
    at: T.leuchtet3,
    from: [FRIDGE[0] + 1.6, 2.1, FRIDGE[2] + 3.6],
    to: [FRIDGE[0] + 2.4, 2.4, FRIDGE[2] + 5.0],
    look: [FRIDGE[0], 1.9, FRIDGE[2]],
    zoom: 1.0,
  },
  // MICRO payoff: "Das Licht kommt aus dem Farbstoff"
  { at: T.das3, from: M(-1.8, 2.9, 4.4), to: M(-1.2, 2.6, 3.4), look: M(0, 2.2, 0), zoom: 1.0 },
  // "Die Energie springt hinein": the spark flies in
  {
    at: T.energie3,
    from: M(-2.6, 2.7, 2.4),
    to: M(-1.4, 2.5, 2.0),
    look: M(-1.2, 2.25, 0),
    lookTo: M(0, 2.2, 0),
    zoom: 1.0,
  },
  // "er spuckt sie als Licht aus": burst of light, pull back
  { at: T.spuckt, from: M(0, 2.4, 2.1), to: M(0, 2.9, 4.6), look: M(0, 2.2, 0), zoom: 1.0 },
  // "Welcher Farbstoff drin ist, bestimmt die Farbe": three dyes
  { at: T.welcher, from: M(0, 2.6, 9.4), to: M(0, 2.4, 8.2), look: M(0, 2.2, -0.3), zoom: 1.0 },
  // "Übrigens": the yard, fireflies everywhere
  { at: T.fakt, from: [3.4, 2.3, 5.6], to: [2.7, 2.15, 4.6], look: [0.8, 1.8, 0], zoom: 1.0 },
  // "Glühwürmchen machen fast dasselbe": macro on the firefly
  {
    at: T.fly,
    from: [FLY[0] + 0.6, FLY[1] + 0.25, FLY[2] + 3.5],
    to: [FLY[0] + 0.4, FLY[1] + 0.15, FLY[2] + 2.9],
    look: [FLY[0], FLY[1] - 0.3, FLY[2]],
    zoom: 1.0,
  },
  // "mit Chemie im Hintern": its glowing behind
  {
    at: T.mit,
    from: [FLY[0] - 2.6, FLY[1] + 0.5, FLY[2] + 3.0],
    to: [FLY[0] - 2.2, FLY[1] + 0.4, FLY[2] + 2.6],
    look: [FLY[0] - 0.4, FLY[1] - 0.25, FLY[2] + 0.2],
    zoom: 1.0,
  },
  // "Grün, Pink oder Blau": the three sticks
  { at: T.gruen, from: [0, 1.9, 4.8], to: [0, 1.75, 4.1], look: [0, 1.45, -0.2], zoom: 1.0 },
  // CTA: drone pull-back over the yard
  {
    at: T.welche,
    from: [1.6, 2.6, 6.4],
    to: [10, 8.5, 20],
    look: [0, 1.4, 0],
    lookTo: [0, 1.4, -5],
    zoom: 1.0,
    tilt: 0.7,
  },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Glasröhrchen", at: T.roehrchen, until: T.kaputt + 0.3, pos: [0, 1.95, 0], side: 1 },
  { text: "Wasserstoffperoxid", at: T.peroxid, until: T.zeug, pos: HP0, side: 1 },
  { text: "Öl", at: T.oel, until: T.zusammen + 0.4, pos: OIL0, side: 1 },
  { text: "Kohlendioxid", at: T.kohlendioxid, until: T.gas1, pos: CO2A, side: 1 },
  { text: "Zzz …", at: T.schlaeft, until: T.leuchtet3, pos: [FRIDGE[0], 2.18, FRIDGE[2]], side: 1 },
  { text: "Farbstoff", at: T.farbstoff1, until: T.energie3, pos: DYE, side: 1 },
  {
    text: "Hintern",
    at: T.hintern,
    until: T.gruen + 0.1,
    pos: [FLY[0] - 0.6, FLY[1] - 0.05, FLY[2] + 0.3],
    side: 1,
  },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "flash", at: 0.12 }, // the snap on frame 0
  { kind: "shake", at: 0.12, dur: 0.45, amp: 0.8 },
  { kind: "slowmo", at: T.glas1, until: T.zerbrichst, speed: 0.35 }, // shards drift
  { kind: "zoom", at: T.leuchtet1, amount: 0.3 },
  { kind: "zoom", at: T.knackt, amount: 0.4 },
  { kind: "shake", at: T.knackt, dur: 0.4, amp: 0.6 },
  { kind: "slowmo", at: T.jetzt, until: T.zwei, speed: 0.35 },
  { kind: "flash", at: T.zack },
  { kind: "shake", at: T.zack, dur: 0.5, amp: 0.7 },
  { kind: "zoom", at: T.feder, amount: 0.25 },
  { kind: "flash", at: T.platzt },
  { kind: "shake", at: T.platzt, dur: 0.55, amp: 0.9 },
  { kind: "zoom", at: T.gar, amount: 0.3 },
  { kind: "flash", at: T.gluehbirne + 0.1 },
  { kind: "flash", at: HIT },
  { kind: "zoom", at: T.spuckt, amount: 0.3 },
  { kind: "zoom", at: T.hintern, amount: 0.35 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "knack", at: 0.02 }, // frame 0: the snap
  { s: "knack", at: T.zerbrichst + 0.35, db: -6 },
  { s: "pop", at: T.ohne1 + 0.05 },
  { s: "pop", at: T.ohne2 + 0.05 },
  { s: "click", at: T.stockdunkel + 0.1 }, // lights out
  { s: "knack", at: T.knackt - 0.06 },
  { s: "rauschen", at: T.zwei, dur: T.zack - T.zwei, db: -22 }, // the liquids run
  { s: "pop", at: T.zusammen + 0.55 },
  { s: "surr", at: T.vollgepackt, dur: T.nur - T.vollgepackt, db: -22 }, // the tense spring
  { s: "zisch", at: T.gas1, dur: 0.9, db: -18 }, // cola fizz
  { s: "whoosh", at: T.hin - 0.05, db: -8 }, // the spark zips away
  { s: "surr", at: T.gluehbirne, dur: T.und2 - T.gluehbirne, db: -21 }, // hot bulb
  { s: "klack", at: T.gefrierfach + 0.1 }, // freezer door
  { s: "pop", at: T.welcher + 0.3 },
  { s: "pop", at: T.bestimmt },
  { s: "pop", at: T.farbe },
  { s: "pop", at: T.pink },
  { s: "pop", at: T.blau },
];
