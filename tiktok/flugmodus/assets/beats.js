// #91 Flugmodus — every time-keyed decision as plain data (scene + sound).
import { W } from "./timing.js";

export const T = {
  vergisst: W("vergisst"),
  flugmodus: W("Flugmodus", 1),
  alle: W("Alle"),
  stuerzt: W("stürzt"),
  und1: W("Und", 1),
  kaempft: W("Kämpft"),
  du2: W("Du", 2),
  everest: W("Everest"),
  die: W("Die", 1),
  funkmasten: W("Funkmasten"),
  nicht: W("nicht"),
  findet: W("Dein", 2),
  also: W("Also"),
  schreit: W("schreit"),
  rast: W("Und", 2),
  tausend: W("tausend"),
  kaum: W("Kaum"),
  mast: W("Mast"),
  weg: W("weg"),
  alles: W("Alles"),
  akku: W("Dein", 3),
  schmilzt: W("schmilzt"),
  rate: W("Rate"),
  pilot: W("Der", 3),
  funkt: W("Dein", 5),
  nah: W("Nah"),
  summen: W("Summen"),
  kopfhoerer: W("Kopfhörer"),
  wie: W("wie"),
  muecke: W("Mücke"),
  ausgerechnet: W("Ausgerechnet"),
  landen: W("Landen"),
  abstuerzen: W("Abstürzen"),
  er2: W("Er", 2),
  sicher: W("sicher"),
  nur: W("nur"),
  leer: W("leer"),
  fakt: W("Übrigens"),
  bord: W("Bord"),
  dann: W("Dann"),
  telefonieren: W("telefonieren"),
  schon: W("Schon"),
  flugmodus2: W("Flugmodus", 2),
  folge: W("Folge"),
};

// where each shot plays: "cab" = window seat, "ckp" = cockpit, "ext" = outside
// rel: "plane" = offsets relative to the plane's centre (set in scene.js)
export const shots = [
  // 0 hook: your hand, your phone, the window at sunset — fast push-in
  { at: 0, where: "cab", from: [1.0, 1.25, 1.6], to: [0.52, 1.06, 0.92], look: [-0.25, 1.0, 0.25] },
  // 1.18 macro: the Flugmodus tile is OFF
  {
    at: T.flugmodus,
    where: "cab",
    from: [0.32, 1.1, 1.0],
    to: [0.22, 1.06, 0.82],
    look: [-0.2, 0.98, 0.25],
  },
  // 2.18 "stürzt er ab": the plane noses down
  {
    at: T.alle,
    where: "ext",
    rel: "plane",
    from: [4.2, -0.6, 3.4],
    to: [3.0, -0.4, 2.4],
    look: [0, 0, 0],
  },
  // 4.02 your phone fights for its life
  {
    at: T.und1,
    where: "cab",
    from: [0.55, 1.3, 1.25],
    to: [0.4, 1.18, 1.0],
    look: [-0.25, 0.98, 0.25],
    whip: -1,
  },
  // 6.02 higher than Everest: from the peak's shoulder up to the plane
  {
    at: T.du2,
    where: "ext",
    from: [-5.0, 6.6, -8.2],
    to: [-5.8, 7.0, -9.2],
    look: [-10.2, 10.0, -15],
    lookTo: [-8.4, 10.6, -15],
  },
  // 7.78 the cell towers beam across the land
  { at: T.die, where: "ext", from: [-1.2, 3.4, 7.8], to: [-2.0, 3.0, 6.9], look: [-4.5, 2.3, 3.2] },
  // 9.92 … not upwards: from the tower's foot up to the plane far above
  {
    at: T.nicht,
    where: "ext",
    from: [-3.2, 0.6, 5.6],
    to: [-3.6, 0.5, 5.0],
    look: [-4.2, 4.5, 3.6],
    lookTo: [-4.2, 7.5, 3.4],
  },
  // 10.90 no network
  {
    at: T.findet,
    where: "cab",
    from: [0.62, 1.05, 1.15],
    to: [0.48, 1.02, 0.98],
    look: [-0.25, 0.98, 0.25],
  },
  // 12.28 it SCREAMS: rings blast out of the plane
  {
    at: T.also,
    where: "ext",
    rel: "plane",
    from: [2.4, -2.8, 5.2],
    to: [1.6, -2.2, 4.0],
    look: [0, -0.3, 0],
  },
  // 14.46 racing over the land at ~1000 km/h
  {
    at: T.rast,
    where: "ext",
    rel: "plane",
    from: [-3.4, 1.0, 2.6],
    to: [-2.2, 0.8, 2.0],
    look: [1.0, -0.6, 0],
    whip: 1,
  },
  // 16.90 grabs a tower … gone … again
  {
    at: T.kaum,
    where: "ext",
    rel: "plane",
    from: [-4.2, 5.2, 4.2],
    to: [-3.4, 5.0, 3.8],
    look: [3, -6, 0],
  },
  // 19.58 the battery melts
  {
    at: T.akku,
    where: "cab",
    from: [0.5, 1.2, 1.2],
    to: [0.36, 1.12, 0.98],
    look: [-0.25, 0.98, 0.25],
  },
  // 20.54 guess who hears it: dolly along the fuselage to the cockpit
  {
    at: T.rate,
    where: "ext",
    rel: "plane",
    from: [-1.6, 0.35, 1.5],
    to: [1.2, 0.2, 0.95],
    look: [0.4, 0.05, 0],
    lookTo: [1.8, 0.08, 0],
    whip: -1,
  },
  // 22.52 THE PILOT — crash zoom
  {
    at: T.pilot,
    where: "ckp",
    from: [-2.1, 2.2, -1.6],
    to: [-1.6, 2.05, -1.15],
    look: [0, 1.75, 0.05],
  },
  // 23.42 x-ray: short bursts travel from your seat to the cockpit
  {
    at: T.funkt,
    where: "ext",
    rel: "plane",
    from: [0.1, 0.4, 2.1],
    to: [0.7, 0.32, 1.75],
    look: [0.6, 0, 0],
  },
  // 25.26 the headset hums
  {
    at: T.nah,
    where: "ckp",
    from: [-0.75, 2.02, -1.6],
    to: [-0.52, 1.96, -1.32],
    look: [0.02, 1.84, -0.52],
  },
  // 28.24 like a mosquito in your ear (slow motion)
  {
    at: T.wie,
    where: "ckp",
    from: [-0.9, 2.1, -1.65],
    to: [-0.68, 2.02, -1.42],
    look: [-0.02, 1.88, -0.55],
  },
  // 29.34 of all times: on approach, landing lights on
  {
    at: T.ausgerechnet,
    where: "ext",
    rel: "plane",
    from: [2.6, -0.3, 1.8],
    to: [2.0, -0.25, 1.4],
    look: [0, 0, 0],
  },
  // 32.22 crash? no — the flare over the threshold
  {
    at: T.abstuerzen,
    where: "ext",
    rel: "plane",
    from: [0.6, -0.15, 2.8],
    to: [-0.4, -0.1, 2.4],
    look: [0, 0, 0],
  },
  // 33.44 touchdown, smoke from the tyres
  {
    at: T.er2,
    where: "ext",
    from: [24.8, 0.32, 15.2],
    to: [25.6, 0.36, 15.0],
    look: [23.6, 0.45, 13],
  },
  // 34.32 … only your phone screamed itself empty
  {
    at: T.nur,
    where: "cab",
    from: [0.6, 1.15, 1.2],
    to: [0.42, 1.08, 1.0],
    look: [-0.25, 0.98, 0.25],
  },
  // 36.08 Übrigens: the mini cell tower in the cabin ceiling
  {
    at: T.fakt,
    where: "cab",
    from: [1.0, 1.35, 1.45],
    to: [0.9, 1.5, 1.15],
    look: [0.8, 3.3, -0.8],
  },
  // 39.10 then you may even make calls
  {
    at: T.dann,
    where: "cab",
    from: [0.55, 1.2, 1.15],
    to: [0.38, 1.1, 0.95],
    look: [-0.25, 0.98, 0.25],
  },
  // 40.68 CTA: thumb finally switches Flugmodus on
  {
    at: T.schon,
    where: "cab",
    from: [1.3, 1.45, 2.1],
    to: [1.05, 1.3, 1.75],
    look: [-0.35, 1.0, 0.1],
  },
  // 43.44 the plane rolls out into the sunset
  {
    at: T.folge,
    where: "ext",
    from: [29.6, 0.7, 16.0],
    to: [30.6, 0.65, 15.6],
    look: [34, 0.6, 13],
  },
];

export const LABELS = [
  { text: "Funkmast", at: T.funkmasten, until: T.nicht, pos: [-4.5, 2.5, 3.2], side: 1 },
  { text: "Kopfhörer", at: T.kopfhoerer, until: T.wie, pos: "ear", side: 1 },
  { text: "Mini-Funkmast", at: T.bord - 0.9, until: T.dann, pos: "pico", side: -1 },
];

export const HIGHLIGHTS = [
  { kind: "zoom", at: 0.15, amount: 0.3 },
  { kind: "shake", at: T.stuerzt, dur: 0.6, amp: 0.8 },
  { kind: "zoom", at: T.everest, amount: 0.25 },
  { kind: "flash", at: T.schreit },
  { kind: "shake", at: T.schreit, dur: 0.5, amp: 0.9 },
  { kind: "zoom", at: T.mast, amount: 0.3 },
  { kind: "flash", at: T.pilot + 0.1 },
  { kind: "zoom", at: T.pilot + 0.1, amount: 0.35 },
  { kind: "slowmo", at: T.wie, until: T.ausgerechnet, speed: 0.5 },
  { kind: "flash", at: T.sicher },
  { kind: "shake", at: T.sicher, dur: 0.45, amp: 0.7 },
  { kind: "zoom", at: T.telefonieren, amount: 0.3 },
];

export const SFX = [
  { s: "gsm", at: 0.0, db: -11 }, // frame 0: the phone hunting for a network
  { s: "click", at: T.flugmodus + 0.1 },
  { s: "jet", at: T.alle, db: -14 },
  { s: "gsm", at: T.kaempft, db: -15 },
  { s: "surr", at: T.also, dur: 2.0, db: -18 },
  { s: "jet", at: T.rast, db: -13 },
  { s: "rauschen", at: T.rast, dur: 2.4, db: -20 },
  { s: "blip", at: T.mast - 0.2, db: -10 },
  { s: "klack", at: T.weg, db: -12 },
  { s: "blip", at: T.alles + 0.3, db: -10 },
  { s: "gsmlang", at: T.summen, db: -9 },
  { s: "muecke", at: T.wie + 0.05, db: -8 },
  { s: "reifen", at: T.sicher, db: -8 },
  { s: "piep", at: T.nur + 0.3, dur: 0.6, db: -16 },
  { s: "pop", at: T.bord - 0.9, db: -10 },
  { s: "click", at: T.flugmodus2 + 0.15 },
];
