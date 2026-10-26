// #35 Fettbrand — every time-keyed decision as plain data (scene.js +
// scripts/build-sfx.mjs). No three.js / DOM here.
import { W } from "./timing.js";

// places: the pan on the hob is the origin (kitchen); CUT = the giant
// cross-section of the pan in a dark lab box under the floor; TUBS = the
// litre bottle and the ten bathtubs, another dark box
export const CUT = [0, -60, 0];
export const TUBS = [0, -140, 0];
const C = (x, y, z) => [x + CUT[0], y + CUT[1], z + CUT[2]];
const U = (x, y, z) => [x + TUBS[0], y + TUBS[1], z + TUBS[2]];

// ---------------------------------------------------------------- beats
export const T = {
  wasser1: W("Wasser", 1),
  fett1: W("Fett", 1),
  vorweg: W("Vorweg"),
  niemals: W("niemals"),
  die1: W("Die", 1),
  greifst: W("greifst"),
  glas: W("Glas"),
  und1: W("und", 1),
  dabei: W("Dabei"),
  schluck1: W("Schluck", 1),
  abends: W("Abends"),
  pommes: W("Pommes"),
  schaust: W("schaust"),
  das2: W("Das", 2),
  bis1: W("bis", 1),
  feuer1: W("Feuer", 1),
  der1: W("Der", 2),
  schwimmt: W("schwimmt"),
  sinkt: W("sinkt"),
  folg: W("Folg"),
  wasser2: W("Wasser", 2),
  oel2: W("Öl", 2),
  rutscht: W("rutscht"),
  brennendes2: W("Brennendes", 2),
  n300: W("300"),
  wasser3: W("Wasser", 3),
  n100: W("100"),
  es4: W("Es", 4),
  rate: W("Rate"),
  dampf1: W("Dampf", 1),
  n1700: W("1.700"),
  so: W("So"),
  zehn: W("zehn"),
  badewannen: W("Badewannen"),
  alles: W("Alles"),
  der2: W("Der", 3),
  zerplatzt: W("zerplatzt"),
  jeder: W("Jeder"),
  das4: W("Das", 4),
  fettexplosion: W("Fettexplosion"),
  das5: W("Das", 5),
  feuerball: W("Feuerball"),
  bis2: W("bis", 2),
  darum: W("Darum"),
  herd: W("Herd"),
  deckel: W("Deckel"),
  pfanne3: W("Pfanne", 3),
  fakt: W("Übrigens"),
  loescher: W("Löscher"),
  f: W("F"),
  cta: W("Was", 2),
};
// scene times inside the two slow-motion windows (speed 0.35): the throw
// happens in [der1, der1 + 0.45], the steam blast in [alles, alles + 0.5]
export const SLOW = 0.35;
// real time at which the drop bursts into steam (scene time alles + 0.07)
export const BURST = T.alles + 0.07 / SLOW;

// ---------------------------------------------------------------- shots
export const shots = [
  // hook: the burning pan, your hand with the glass above it — push in fast
  { at: 0, from: [2.4, 2.1, 3.9], to: [1.6, 1.6, 2.7], look: [0.4, 1.15, 0], zoom: 1.4 },
  // "Wasser": macro on the tilted glass over the flames
  { at: T.wasser1, from: [3.0, 2.5, 2.6], to: [2.6, 2.3, 2.1], look: [1.3, 1.6, 0.4], zoom: 1.15 },
  // "Fett": low into the flames
  { at: T.fett1, from: [0.4, 0.6, 2.6], to: [0.25, 0.55, 2.15], look: [0, 1.05, 0], zoom: 1.3 },
  // "Vorweg: Mach das niemals nach." — front, the ✕ over the glass
  { at: T.vorweg, from: [0.4, 2.4, 4.6], to: [0.3, 2.1, 3.9], look: [0.5, 1.3, 0], zoom: 1.5 },
  // "Die Pfanne brennt": the whole kitchen at night
  { at: T.die1, from: [6.4, 4.8, 11.5], to: [5.3, 4.1, 9.8], look: [-1, 1.9, -2], zoom: 1.0 },
  // "du greifst zum Glas"
  { at: T.greifst, from: [4.6, 1.9, 4.4], to: [4.0, 1.6, 3.7], look: [2.5, 0.6, 1.5], zoom: 1.25 },
  // "und dann?": over the shoulder, the glass above the fire
  { at: T.und1, from: [3.4, 3.2, 2.8], to: [3.0, 2.9, 2.3], look: [0, 0.8, 0], zoom: 1.35 },
  // "Dabei ist es nur ein Schluck": macro on the little water in the glass
  { at: T.dabei, from: [2.9, 2.3, 2.6], to: [2.6, 2.15, 2.2], look: [1.55, 1.45, 0.55], zoom: 1.0 },
  // story: "Abends, Pommes in der Pfanne" — warm and calm
  { at: T.abends, from: [2.2, 3.5, 4.0], to: [1.6, 3.0, 3.2], look: [0, 0.3, 0], zoom: 1.3 },
  { at: T.pommes, from: [-0.5, 1.3, 2.2], to: [0.0, 1.1, 1.7], look: [0, 0.3, 0], zoom: 1.0 },
  // "du schaust kurz aufs Handy": the phone lights up, the pan smokes behind
  { at: T.schaust, from: [5.2, 1.7, 3.4], to: [4.7, 1.4, 2.9], look: [3.3, 0.1, 1.0], zoom: 1.15 },
  // "Das Öl wird heißer": low, smoke rising
  { at: T.das2, from: [-2.6, 1.1, 2.4], to: [-2.0, 0.95, 1.9], look: [0, 0.6, 0], zoom: 1.3 },
  // "bis es von selbst …": macro on the smoking oil
  { at: T.bis1, from: [0.9, 0.95, 1.6], to: [0.65, 0.8, 1.2], look: [0, 0.35, 0], zoom: 1.0 },
  // "Feuer fängt": the flames burst up, pull back
  { at: T.feuer1, from: [1.7, 1.6, 3.8], to: [2.3, 2.3, 4.9], look: [0, 1.3, 0], zoom: 1.5 },
  // "Der Schluck fliegt rein" (slow motion): side view of the throw
  { at: T.der1, from: [3.4, 1.9, 2.0], to: [3.2, 1.8, 1.8], look: [0.7, 1.0, 0.2], zoom: 1.45 },
  // whip into the cross-section: the drop at the surface
  {
    at: T.schwimmt,
    from: C(6.5, 5.5, 15),
    to: C(5.4, 4.6, 13),
    look: C(0, 1.6, 0),
    zoom: 1.0,
    whip: 1,
  },
  // "Er sinkt": macro, the drop going down through the oil
  { at: T.sinkt, from: C(2.0, 2.6, 6.6), to: C(1.5, 1.6, 5.6), look: C(0, 1.3, 0), zoom: 1.0 },
  // follow line: slow orbit, nothing new
  {
    at: T.folg,
    orbit: { c: C(0, 1.6, 0), r: 11, y: C(0, 4.0, 0)[1], a0: -0.35, a1: 0.05 },
    zoom: 1.0,
  },
  // "Wasser ist schwerer als Öl": front-on, the two layers
  { at: T.wasser2, from: C(0, 2.3, 10.5), to: C(0, 2.1, 9.2), look: C(0, 1.4, 0), zoom: 1.0 },
  // "Es rutscht nach unten, mitten in die Hitze": the hot bottom
  { at: T.rutscht, from: C(2.2, 1.0, 5.2), to: C(1.6, 0.85, 4.3), look: C(0, 0.7, 0), zoom: 1.0 },
  // "Brennendes Öl hat über 300 Grad": the burning top
  {
    at: T.brennendes2,
    from: C(-3.4, 4.8, 8.4),
    to: C(-2.8, 4.2, 7.2),
    look: C(0, 2.6, 0),
    zoom: 1.0,
  },
  // "Wasser kocht schon bei 100": macro on the drop
  {
    at: T.wasser3,
    from: C(-1.6, 1.3, 4.8),
    to: C(-1.2, 1.05, 4.0),
    look: C(0, 0.75, 0),
    zoom: 1.0,
  },
  // "Es hat keine Chance": tight, the drop trembles — the quiet before
  { at: T.es4, from: C(1.0, 0.95, 3.2), to: C(0.8, 0.85, 2.6), look: C(0, 0.7, 0), zoom: 1.0 },
  // "Rate mal": the litre bottle on its own stage
  {
    at: T.rate,
    from: U(2.6, 2.4, 5.4),
    to: U(2.0, 2.0, 4.4),
    look: U(0, 1.0, 0),
    zoom: 1.0,
    whip: -1,
  },
  // "Rund 1.700 Liter": the bottle bursts into a steam cloud, pull back
  { at: T.n1700, from: U(3.4, 3.4, 9.0), to: U(4.6, 4.8, 12.5), look: U(0, 2.4, 0), zoom: 1.0 },
  // "So viel wie zehn volle Badewannen": the tubs pop in, crane back
  { at: T.so, from: U(-1.0, 5.0, 12.0), to: U(1.0, 9.0, 19.0), look: U(0, 1.0, -4.5), zoom: 1.0 },
  // "Alles in einem Wimpernschlag" (slow motion): the drop bursts into steam
  { at: T.alles, from: C(1.8, 1.5, 6.4), to: C(2.0, 1.7, 6.9), look: C(0, 1.1, 0), zoom: 1.0 },
  // "Der Dampf schießt nach oben": crane up with the column
  {
    at: T.der2,
    from: C(4.5, 2.8, 13),
    to: C(4.5, 5.5, 14.5),
    look: C(0, 2.6, 0),
    lookTo: C(0, 5.5, 0),
    zoom: 1.0,
  },
  // "Es zerplatzt in Millionen winzige Tropfen": orbit in the spray
  {
    at: T.zerplatzt,
    orbit: { c: C(0, 8.5, 0), r: 13, y: C(0, 10, 0)[1], a0: 0.55, a1: -0.15 },
    zoom: 1.0,
  },
  // "Jeder hat plötzlich Luft zum Brennen": macro, droplets ignite
  {
    at: T.jeder,
    from: C(6.5, 12.5, 15.5),
    to: C(5.8, 12.0, 13.8),
    look: C(0.5, 8.8, 0),
    zoom: 1.0,
  },
  // "Das ist die Fettexplosion": wide, the burning cloud
  { at: T.das4, from: C(0, 5.5, 19), to: C(0, 6.5, 23), look: C(0, 5.5, 0), zoom: 1.0 },
  // back in the kitchen: "Das Feuer geht nicht aus" — the flames boil up
  { at: T.das5, from: [3.4, 2.3, 5.6], to: [3.0, 2.1, 4.9], look: [0, 1.7, 0], zoom: 1.5, whip: 1 },
  // "Feuerball": wide and low, the ball rolls up to the ceiling
  {
    at: T.feuerball,
    from: [6.5, 1.6, 12.5],
    to: [7.5, 1.2, 14.5],
    look: [0, 4.4, -1.5],
    zoom: 1.0,
  },
  // "bis unter die Decke": look up at the ceiling on fire
  { at: T.bis2, from: [8.0, 0.6, 15.0], to: [7.4, 0.5, 13.8], look: [0, 7.4, -1.5], zoom: 1.0 },
  // "Darum: Herd aus": calm, the pan burns normally, the knob in view
  { at: T.darum, from: [2.6, 2.8, 4.8], to: [2.2, 2.5, 4.2], look: [0.1, 0.7, 0.8], zoom: 1.4 },
  { at: T.herd, from: [2.9, 1.0, 6.2], to: [2.6, 1.0, 5.6], look: [0.4, -0.1, 1.8], zoom: 1.25 },
  // "Deckel drauf": the lid comes down
  { at: T.deckel, from: [2.7, 2.5, 3.8], to: [2.3, 2.2, 3.2], look: [0, 0.7, 0], zoom: 1.3 },
  // "Pfanne stehen lassen": the lid on, the fire out
  { at: T.pfanne3, from: [-2.0, 1.9, 3.4], to: [-1.6, 1.7, 2.9], look: [0, 0.5, 0], zoom: 1.3 },
  // Übrigens: the fat-fire extinguisher with the big F
  { at: T.fakt, from: [6.2, 2.4, 4.4], to: [5.4, 2.0, 3.6], look: [3.4, 1.3, -1.0], zoom: 1.15 },
  // CTA: pull back through the kitchen, rain on the window
  {
    at: T.cta,
    from: [2.2, 2.3, 5.2],
    to: [8.0, 6.0, 16.0],
    look: [0, 1.2, 0],
    lookTo: [-3.5, 2.8, -3.0],
  },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Pfanne", at: T.die1 + 0.1, until: T.greifst, pos: [-0.9, 0.45, 0.9], side: -1 },
  { text: "Glas", at: T.glas, until: T.und1, pos: [2.55, 0.9, 1.7], side: 1 },
  { text: "Wasser", at: T.schwimmt + 0.2, until: T.folg, pos: C(0, 2.0, 0.4), side: 1 },
  { text: "Wasser", at: T.wasser2, until: T.brennendes2, pos: C(0.3, 0.75, 0.4), side: 1 },
  { text: "Öl", at: T.oel2, until: T.brennendes2, pos: C(-2.6, 1.7, 0.1), side: -1 },
  { text: "Dampf", at: T.der2 + 0.2, until: T.zerplatzt, pos: C(0.4, 4.0, 0.6), side: 1 },
  { text: "Fettexplosion", at: T.fettexplosion, until: T.das5, pos: C(0, 6.0, 0.5), side: 1 },
  { text: "Herd aus", at: T.herd + 0.1, until: T.deckel, pos: [0.6, -0.42, 3.2], side: -1 },
  { text: "Fettbrand-Löscher", at: T.loescher, until: T.cta, pos: [3.4, 1.9, -0.7], side: -1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "zoom", at: 0.85, amount: 0.3 }, // the claim before 1.5 s
  { kind: "shake", at: T.fett1, dur: 0.45, amp: 0.6 },
  { kind: "zoom", at: T.die1, amount: 0.25 },
  { kind: "zoom", at: T.schluck1, amount: 0.25 },
  { kind: "shake", at: T.feuer1 + 0.05, dur: 0.6, amp: 1.0 },
  { kind: "flash", at: T.feuer1 + 0.05 },
  { kind: "slowmo", at: T.der1, until: T.schwimmt, speed: SLOW },
  { kind: "zoom", at: T.sinkt, amount: 0.25 },
  { kind: "zoom", at: T.n300, amount: 0.3 },
  { kind: "shake", at: T.es4 + 0.3, dur: 1.0, amp: 0.25 },
  { kind: "flash", at: T.n1700 + 0.1 },
  { kind: "zoom", at: T.badewannen, amount: 0.25 },
  { kind: "slowmo", at: T.alles, until: T.der2, speed: SLOW },
  { kind: "flash", at: BURST },
  { kind: "shake", at: BURST, dur: 0.8, amp: 0.8 },
  { kind: "shake", at: T.der2, dur: 0.6, amp: 0.7 },
  { kind: "zoom", at: T.zerplatzt, amount: 0.3 },
  { kind: "flash", at: T.fettexplosion },
  { kind: "shake", at: T.fettexplosion, dur: 0.9, amp: 1.3 },
  { kind: "flash", at: T.feuerball },
  { kind: "shake", at: T.feuerball, dur: 1.1, amp: 1.4 },
  { kind: "zoom", at: T.deckel + 0.35, amount: 0.25 },
  { kind: "zoom", at: T.f, amount: 0.3 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "brutzeln", at: 0.0, db: -9 }, // frame 0: the burning pan crackles
  { s: "rauschen", at: 0.0, dur: 3.2, db: -21 }, // the fire's roar under it
  { s: "klack", at: T.greifst + 0.35, db: -14 }, // the glass is picked up
  { s: "brutzeln", at: T.abends + 0.2, db: -14 }, // fries in the oil
  { s: "brutzeln", at: T.bis1, db: -12 },
  { s: "wumm", at: T.feuer1 + 0.05, db: -10 }, // the oil catches fire
  { s: "zisch", at: T.schwimmt + 0.05, dur: 0.5, db: -18 },
  { s: "surr", at: T.rutscht, dur: 2.0, db: -21 }, // the hot bottom
  { s: "brutzeln", at: T.es4 + 0.2, db: -13 }, // the drop trembles
  { s: "zisch", at: T.n1700 + 0.1, dur: 1.4, db: -13 },
  { s: "pop", at: T.zehn },
  { s: "pop", at: T.zehn + 0.25 },
  { s: "pop", at: T.zehn + 0.5 },
  { s: "wumm", at: BURST, db: -6 }, // the steam blast
  { s: "zisch", at: BURST, dur: 1.2, db: -12 },
  { s: "rauschen", at: T.der2, dur: 2.8, db: -17 },
  { s: "wumm", at: T.fettexplosion, db: -3 },
  { s: "wumm", at: T.feuerball, db: -2 },
  { s: "rauschen", at: T.feuerball, dur: 2.0, db: -14 },
  { s: "click", at: T.herd + 0.3 },
  { s: "klack", at: T.deckel + 0.35, db: -8 },
  { s: "zisch", at: T.deckel + 0.4, dur: 0.8, db: -18 },
  { s: "pop", at: T.fakt + 0.15 },
];
