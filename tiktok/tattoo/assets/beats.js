// #42 Tattoo — every time-keyed decision as plain data (scene.js +
// scripts/build-sfx.mjs). No three.js / DOM here.
import { W } from "./timing.js";

// places: the arm rest with your tattooed forearm is the origin (studio);
// HAUT = a cut through the skin under the tattoo, a dark red world under the
// floor: epidermis roof, dermis "aquarium" with ink + scavenger cells, fat
// floor, a lymph vessel to a lymph node on the right.
export const HAUT = [0, -60, 0];
export const H = (x, y, z) => [x + HAUT[0], y + HAUT[1], z + HAUT[2]];
export const ARM = [0.1, 1.42, 0]; // tattoo centre on the arm (world)
export const NODE = [10.5, 1.4, 0.4]; // lymph node (HAUT local)
export const B0 = [0.6, 2.2, 1.0]; // hero ink blob (HAUT local)
// moving points the scene updates every frame (camera rel / label pos)
export const CELL0 = [0, 0, 0]; // hero scavenger (world)
export const CELL_REL = { x: 0, y: 0, z: 0 };

// ---------------------------------------------------------------- beats
export const T = {
  tattoo1: W("Tattoo", 1),
  auffressen: W("auffressen"),
  jeden: W("Jeden"),
  trotzdem: W("Trotzdem"),
  leben: W("Leben"),
  nadel1: W("Nadel", 1),
  hammer: W("Presslufthammer"),
  aber: W("Aber"),
  haut: W("Haut"),
  oberste: W("oberste"),
  tauschst: W("tauschst"),
  vier: W("vier"),
  dort: W("Dort"),
  weg: W("weg"),
  also1: W("Also", 1),
  tiefer: W("tiefer"),
  lederhaut: W("Lederhaut"),
  nur: W("Nur"),
  farbe1: W("Farbe", 1),
  eindring: W("Eindringling"),
  schickt: W("schickt"),
  putz: W("Putztruppe"),
  fress: W("Fresszellen"),
  rate: W("Rate"),
  schluckt: W("schluckt"),
  kriegt: W("kriegt"),
  verdaut: W("verdaut"),
  bleibt2: W("bleibt", 2),
  bauch: W("Bauch"),
  stirbt: W("Stirbt"),
  schnappt: W("schnappt"),
  farbe3: W("Farbe", 3),
  zelle1: W("Zelle", 1),
  weiter: W("weitergereicht"),
  verblassen: W("Verblassen"),
  sonne: W("Sonne"),
  also2: W("Also", 2),
  creme: W("Creme"),
  fakt: W("Übrigens"),
  wandert: W("wandert"),
  lymph: W("Lymphknoten"),
  bunt: W("bunt"),
  wie: W("Wie", 2),
  zeig: W("Zeig"),
  folge: W("Folge"),
};
// the needle's strokes into the dermis (12.8 → Lederhaut)
export const STROKES = [0, 1, 2, 3].map(
  (i) => T.tiefer - 0.25 + i * ((T.lederhaut + 0.3 - T.tiefer) / 3.2),
);

// ---------------------------------------------------------------- shots
export const shots = [
  // hook: tattoo macro, the little scavengers nibble at it — fast push-in
  { at: 0, from: [0.9, 3.0, 2.1], to: [0.35, 2.35, 1.05], look: [0.0, 1.62, 0.12], zoom: 1.0 },
  // inside: one scavenger gulps a blob of ink
  {
    at: T.auffressen,
    from: H(1.0, 2.9, 4.6),
    to: H(0.5, 2.55, 3.4),
    look: H(-0.05, 2.2, 0.9),
    zoom: 1.2,
  },
  // … and still: the tattoo, whole and shiny, a life long
  { at: T.trotzdem, from: [2.2, 3.4, 3.4], to: [1.5, 2.8, 2.5], look: [0, 1.45, 0.1] },
  // the needle hammers (slowmo)
  {
    at: T.nadel1,
    from: [1.2, 2.0, 1.5],
    to: [0.85, 1.75, 1.0],
    look: [0.15, 1.75, 0.1],
    zoom: 1.05,
  },
  // dive: from the skin surface down into the cut
  {
    at: T.aber,
    from: H(0.5, 9.5, 6.5),
    to: H(0.4, 5.2, 8.6),
    look: H(0, 3.2, 0),
    lookTo: H(0, 2.4, 0),
  },
  // the top layer: cells pushing up and flaking off
  {
    at: T.oberste,
    from: H(-1.6, 4.7, 7.4),
    to: H(-1.1, 4.4, 6.4),
    look: H(0, 3.5, 1.6),
    zoom: 1.0,
  },
  { at: T.dort, from: H(1.8, 4.6, 5.6), to: H(1.3, 4.4, 4.8), look: H(0.1, 3.7, 1.6), zoom: 1.0 },
  // the needle goes deeper
  { at: T.also1, from: H(2.4, 3.1, 6.4), to: H(1.8, 2.9, 5.4), look: H(0.3, 2.7, 0.9), zoom: 1.1 },
  // alarm: the body spots the ink
  {
    at: T.nur,
    from: H(-1.2, 2.45, 4.6),
    to: H(-0.6, 2.35, 3.8),
    look: H(0.4, 2.3, 0.7),
    zoom: 1.15,
  },
  // the cleaning crew swarms in (whip)
  {
    at: T.schickt,
    from: H(-3.2, 2.7, 5.8),
    to: H(-1.4, 2.6, 5.0),
    look: H(-0.5, 2.1, 0.6),
    whip: 1,
    zoom: 1.2,
  },
  // rate mal: the hero cell closes in on the blob
  {
    at: T.rate,
    rel: CELL_REL,
    from: [1.2, 0.45, 3.0],
    to: [0.9, 0.35, 2.4],
    look: [0.5, 0, 0],
    zoom: 1.0,
  },
  // gulp — it can't digest it
  {
    at: T.kriegt,
    from: H(-0.3, 2.6, 5.2),
    to: H(-0.1, 2.5, 4.5),
    look: H(0.25, 2.2, 1.0),
    zoom: 1.0,
  },
  // stuck, your tattoo in its belly (cover)
  {
    at: T.bleibt2,
    orbit: { c: H(-0.12, 2.2, 1.0), r: 2.9, y: 2.55 - 60, a0: -0.45, a1: 0.3 },
    zoom: 1.0,
  },
  // it dies, the next one grabs the ink
  {
    at: T.stirbt,
    from: H(-0.4, 2.6, 5.3),
    to: H(-0.2, 2.5, 4.6),
    look: H(0.25, 2.2, 1.0),
    zoom: 1.0,
  },
  // payoff: passed on from cell to cell — wide orbit over the relay
  { at: T.zelle1, orbit: { c: H(2.4, 2.1, 0.4), r: 3.4, y: 2.35 - 60, a0: 0.6, a1: -0.35 } },
  // the sun breaks the ink
  {
    at: T.verblassen,
    from: H(-4.6, 6.8, 8.4),
    to: H(-3.8, 6.0, 7.6),
    look: H(-0.6, 3.6, 0),
    lookTo: H(0, 3.0, 0),
  },
  // cream on: the rays bounce off
  { at: T.also2, from: H(3.4, 5.6, 6.0), to: H(2.6, 5.0, 5.2), look: H(0, 3.6, 0), zoom: 1.65 },
  // fact: ink drifts down the lymph vessel to the node
  {
    at: T.fakt,
    from: H(4.4, 3.8, 5.0),
    to: H(6.6, 3.2, 4.6),
    look: H(5.6, 1.6, 0.5),
    lookTo: H(8.6, 1.4, 0.4),
  },
  {
    at: T.lymph,
    from: H(13.4, 3.6, 6.4),
    to: H(12.8, 3.2, 5.6),
    look: H(10.5, 1.4, 0.4),
    zoom: 1.0,
  },
  // CTA: back to your arm, then the drone pulls back over the studio
  { at: T.wie, from: [2.2, 2.6, 3.0], to: [1.6, 2.3, 2.3], look: [0.1, 1.4, 0], zoom: 1.2 },
  {
    at: T.zeig + 0.4,
    from: [3.0, 3.2, 5.0],
    to: [10.5, 8.6, 17.0],
    look: [0, 1.6, -1],
    lookTo: [0, 1.0, -2],
  },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Oberhaut", at: T.oberste, until: T.vier + 0.6, pos: H(-0.6, 3.75, 2.6), side: -1 },
  { text: "Lederhaut", at: T.lederhaut, until: T.nur - 0.05, pos: H(-1.2, 1.4, 2.0), side: -1 },
  { text: "Fresszelle", at: T.fress, until: T.rate + 0.9, pos: CELL0, side: -1 },
  { text: "Lymphknoten", at: T.lymph, until: T.wie - 0.05, pos: H(10.3, 0.9, 1.3), side: 1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "zoom", at: T.tattoo1, amount: 0.3 }, // the claim
  { kind: "zoom", at: T.auffressen + 0.25, amount: 0.25 }, // gulp
  { kind: "slowmo", at: T.hammer - 0.3, until: T.aber, speed: 0.35 }, // needle
  { kind: "shake", at: T.hammer, dur: 0.6, amp: 0.6 },
  { kind: "flash", at: T.lederhaut }, // the ink lands deep
  { kind: "shake", at: T.nur + 0.1, dur: 0.5, amp: 0.7 }, // alarm
  { kind: "zoom", at: T.eindring, amount: 0.25 },
  { kind: "zoom", at: T.verdaut, amount: 0.3 },
  { kind: "flash", at: T.stirbt + 0.45 }, // the cell bursts
  { kind: "zoom", at: T.schnappt + 0.3, amount: 0.3 },
  { kind: "flash", at: T.weiter },
  { kind: "zoom", at: T.creme, amount: 0.25 },
  { kind: "zoom", at: T.bunt, amount: 0.3 },
];

// ---------------------------------------------------------------- sound
// own sounds (scripts/sfx-extra.py): "tattoo" = the machine's buzz, "mampf" = a cell's gulp
export const SFX = [
  { s: "mampf", at: 0.05, db: -12 },
  { s: "mampf", at: 0.75, db: -14 },
  { s: "mampf", at: T.auffressen + 0.2, db: -9 },
  { s: "tattoo", at: T.nadel1 - 0.05, dur: T.aber - T.nadel1, db: -13 },
  { s: "tattoo", at: T.tiefer - 0.3, dur: T.lederhaut + 0.5 - T.tiefer, db: -15 },
  { s: "piep", at: T.nur + 0.05, dur: 1.2, db: -22 },
  { s: "pop", at: T.putz + 0.1 },
  { s: "pop", at: T.putz + 0.45, db: -4 },
  { s: "mampf", at: T.kriegt - 0.15, db: -9 },
  { s: "boing", at: T.stirbt + 0.45, db: -10 },
  { s: "mampf", at: T.schnappt + 0.3, db: -9 },
  { s: "surr", at: T.sonne - 0.3, dur: 1.6, db: -22 },
  { s: "klack", at: T.creme, db: -12 },
  { s: "rauschen", at: T.fakt, dur: T.bunt - T.fakt, db: -24 },
  { s: "wow", at: T.bunt, db: -8 },
];
