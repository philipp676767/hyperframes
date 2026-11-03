// #53 "Treibsand" (Format B) — timing as plain data (scene.js + build-sfx.mjs).
import { W } from "./timing.js";

export const T = {
  treibsand: W("Treibsand", 1),
  strampel: W("Strampel"),
  film: W("Film"),
  hut: W("Hut"),
  trittst: W("trittst"),
  ploetzlich: W("plötzlich"),
  fluessig: W("flüssig"),
  also: W("Also"),
  fehler: W("Fehler"),
  bewegung: W("Bewegung"),
  tiefer: W("tiefer"),
  dann: W("Dann"),
  packt: W("packt"),
  beton: W("Beton"),
  strampeln: W("Strampeln"),
  schreib: W("Schreib's"),
  rate: W("Rate"),
  fuss: W("Fuß"),
  so: W("So"),
  kleinwagen: W("Kleinwagen"),
  aber: W("Aber"),
  treibsand2: W("Treibsand", 2),
  dicht: W("dicht"),
  treibst: W("treibst"),
  salzwasser: W("Salzwasser"),
  leg: W("Leg"),
  beine: W("Beine"),
  frei: W("frei"),
  darum: W("Darum"),
  huefte: W("Hüfte"),
  uebrigens: W("Übrigens"),
  watt: W("Watt"),
  gefaehrlich: W("gefährlich"),
  flut: W("Flut"),
  folge: W("Folge"),
};

// analogy set: the balance scale (far behind the camera side of the stage)
export const SCALE = [0, 0, 30];

// shots: positions are absolute (zoom 1 in scene.js); cut every ~2–3 s
export const shots = [
  // frame 0: you, sunk to the knees, arms flailing — fast push-in, jungle behind
  { at: 0, from: [1.6, 1.9, 5.6], to: [0.9, 1.55, 3.6], look: [0, 1.2, 0] },
  // "Treibsand": first cut ≤ 1.5 s — from the other side, closer
  { at: T.treibsand, from: [-1.7, 1.5, 3.2], to: [-1.2, 1.35, 2.6], look: [0, 1.15, 0] },
  // "Strampel bloß nicht": low on the sand, legs churning
  { at: T.strampel, from: [2.4, 0.9, 3.6], to: [1.9, 0.8, 3.0], look: [0, 0.75, 0], whip: 1 },
  // "Im Film …": only the hat is left (viewfinder)
  { at: T.film, from: [0.3, 1.3, 3.0], to: [0.1, 0.7, 1.7], look: [0, 0.12, 0], whip: -1 },
  // "Du trittst am Fluss auf festen Sand": wide, you walk in from the backpack
  { at: T.trittst, from: [7.5, 3.4, 9.5], to: [6.2, 2.8, 8.0], look: [1.6, 0.8, 0] },
  // "… und plötzlich wird er flüssig": medium, the ground gives way
  { at: T.ploetzlich, from: [3.6, 1.9, 5.0], to: [2.9, 1.6, 4.0], look: [0.2, 0.8, 0] },
  // "Also zappelst du. Großer Fehler.": orbit around the flailing
  { at: T.also, orbit: { c: [0, 0.8, 0], r: 3.4, y: 1.7, a0: -0.7, a1: 0.35 } },
  // x-ray cross-section: every move shakes the grains loose (slowmo)
  { at: T.bewegung, from: [0.4, 0.2, 6.6], to: [0.1, -0.1, 5.4], look: [0, -0.6, 0] },
  // "Dann setzt sich der Sand – und packt dich wie Beton"
  { at: T.dann, from: [0.9, -0.4, 4.0], to: [0.6, -0.6, 3.2], look: [0.1, -0.85, 0] },
  // comment question: wide, high, you stuck in the middle of the sandbank
  { at: T.strampeln, from: [6.5, 4.6, 9.5], to: [5.0, 3.6, 7.4], look: [0, 0.5, -1] },
  { at: T.schreib, from: [-3.8, 1.1, 3.2], to: [-3.0, 0.95, 2.6], look: [0, 0.6, 0] },
  // "Rate mal …": x-ray close on the stuck foot, the gauge climbs
  { at: T.rate, from: [1.2, -0.5, 3.8], to: [0.9, -0.7, 3.0], look: [0.15, -0.95, 0] },
  // "So viel wie für einen Kleinwagen": pull back, a car hangs on your foot
  { at: T.so, from: [0.4, -0.6, 5.8], to: [0.8, -0.8, 6.8], look: [0.1, -1.3, 0] },
  // "Aber jetzt das Gute": the balance scale (you vs. quicksand)
  {
    at: T.aber,
    from: [0.4, 1.6, 6.9],
    to: [0.1, 1.4, 6.1],
    look: [0, 1.0, 0],
    rel: "scale",
    whip: 1,
  },
  // "Du treibst darin wie im Salzwasser": side view, you lean back and float
  { at: T.treibst, from: [4.8, 1.7, 2.6], to: [4.0, 1.5, 2.1], look: [0, 0.6, 0] },
  // "Leg dich zurück": from above-front
  { at: T.leg, from: [1.8, 3.0, 4.6], to: [1.3, 2.4, 3.6], look: [0, 0.2, -0.2] },
  // "… und wackel die Beine langsam frei": slowmo close on the legs
  { at: T.beine, from: [3.6, 1.5, 1.6], to: [3.0, 1.25, 1.2], look: [0, 0.25, 0.2] },
  // payoff: x-ray cutaway, upright, stopped at the hip
  { at: T.darum, from: [0.3, 0.9, 7.2], to: [0.1, 0.6, 6.0], look: [0, -0.1, 0] },
  // Übrigens: the flood comes in around the sandbank (wide, high)
  { at: T.uebrigens, from: [8.5, 5.2, 11.5], to: [6.8, 4.1, 9.2], look: [0, 0.4, -2] },
  // "… wenn die Flut kommt": closer, the water rises around you
  { at: T.gefaehrlich, from: [2.9, 1.5, 4.0], to: [2.2, 1.25, 3.1], look: [0, 0.7, 0] },
];

// name tags + arrows
export const LABELS = [
  { text: "flüssig", at: T.fluessig, until: T.also, pos: [1.6, 0.03, 0.9], side: 1 },
  { text: "Wasser", at: T.bewegung + 0.6, until: T.dann, pos: [1.25, -1.2, 0.35], side: 1 },
  { text: "wie Beton", at: T.beton, until: T.strampeln, pos: [-0.9, -1.0, 0.3], side: -1 },
  { text: "Treibsand", at: T.treibsand2, until: T.treibst, pos: "sandCube", side: 1 },
  { text: "Du", at: T.dicht + 0.3, until: T.treibst, pos: "youCube", side: -1 },
  { text: "Hüfte", at: T.huefte, until: T.uebrigens, pos: "hip", side: 1 },
];

export const HIGHLIGHTS = [
  { kind: "zoom", at: 0.25, amount: 0.25 }, // hook lands
  { kind: "shake", at: T.strampel, dur: 0.5, amp: 0.8 },
  { kind: "flash", at: T.fluessig },
  { kind: "shake", at: T.fluessig, dur: 0.45, amp: 1 },
  { kind: "zoom", at: T.fehler, amount: 0.3 },
  { kind: "slowmo", at: T.bewegung, until: T.dann, speed: 0.4 },
  { kind: "flash", at: T.beton },
  { kind: "zoom", at: T.beton, amount: 0.35 },
  { kind: "zoom", at: T.rate, amount: 0.25 },
  { kind: "shake", at: T.kleinwagen, dur: 0.6, amp: 1.2 },
  { kind: "flash", at: T.kleinwagen },
  { kind: "zoom", at: T.dicht, amount: 0.3 },
  { kind: "slowmo", at: T.beine, until: T.darum, speed: 0.45 },
  { kind: "zoom", at: T.huefte, amount: 0.3 },
  { kind: "flash", at: T.flut - 0.1 },
  { kind: "shake", at: T.flut, dur: 0.6, amp: 1 },
];

// own sound: the quicksand slurp (scripts/sfx-extra.py)
export const SFX = [
  { s: "schmatz", at: 0.02, db: -6 },
  { s: "schmatz", at: T.strampel + 0.1, db: -9 },
  { s: "schmatz", at: T.fluessig, db: -6 },
  { s: "schmatz", at: T.fehler, db: -10 },
  { s: "rauschen", at: T.bewegung, dur: T.dann - T.bewegung, db: -22 },
  { s: "klack", at: T.beton + 0.05, db: -8 },
  { s: "pop", at: T.kleinwagen },
  { s: "klack", at: T.dicht + 0.2, db: -10 },
  { s: "schmatz", at: T.frei - 0.1, db: -9 },
  { s: "rauschen", at: T.uebrigens + 0.3, dur: 4.2, db: -16 },
];
