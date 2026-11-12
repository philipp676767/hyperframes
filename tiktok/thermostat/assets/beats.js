// #78 Heizkörper-Thermostat — every time-keyed decision as plain data
// (read by scene.js and scripts/build-sfx.mjs).
import { W } from "./timing.js";

export const T = {
  thermo: W("Thermostat", 1),
  fuenf1: W("5", 1),
  heizt: W("Heizt", 1),
  schneller1: W("schneller", 1),
  stell: W("Stell"),
  bude: W("Bude"),
  drehst: W("drehst"),
  dabei: W("Dabei"),
  strom: W("Strom"),
  batterie: W("Batterie"),
  denkt: W("denkt"),
  wachs1: W("Wachs", 1),
  drehkopf: W("Drehkopf"),
  kapsel: W("Kapsel"),
  warm1: W("warm", 1),
  dehnt: W("dehnt"),
  hefeteig: W("Hefeteig"),
  aufgeht: W("aufgeht"),
  schiebt: W("schiebt"),
  stift1: W("Stift", 1),
  rate: W("Rate"),
  drei1: W("3", 1),
  staerke: W("Stärke"),
  rund: W("Rund"),
  stift2: W("Stift", 2),
  ventil: W("Ventil"),
  zimmer: W("Zimmer"),
  offen: W("offen"),
  genauso: W("genauso"),
  fuenf2: W("5", 2),
  warm2: W("warm", 2),
  drueckt: W("drückt"),
  zu: W("zu", 1),
  payoff: W("5", 3) - 0.08,
  spaeter: W("später"),
  schwitzt: W("schwitzt"),
  fakt: W("Übrigens"),
  vorhang: W("Vorhang"),
  staut: W("staut"),
  dreht: W("dreht"),
  ab: W("ab"),
  cta: W("welcher") - 0.12,
};

// The head: axis along +z at the origin, front cap at z ≈ 1.0.
export const shots = [
  // hook: the hand cranks the head to 5 — close, fast push-in
  { at: 0, from: [1.7, 1.9, 2.8], to: [0.95, 1.3, 1.7], look: [0, 0.35, -0.3], zoom: 1.75 },
  // it doesn't heat faster: wider, cold room, frost behind
  { at: T.heizt, from: [4.2, 1.2, 6.2], to: [3.4, 0.9, 5.2], look: [-2.5, 0.6, -1], zoom: 1.2 },
  // establishing: the tiny viewer in the big cold room
  { at: T.stell, from: [10, -6, 16], to: [8, -4.5, 13], look: [-6, 3, -2], lookTo: [-6, 5, -2] },
  // you crank it up again
  {
    at: T.drehst,
    from: [2.2, 1.6, 2.6],
    to: [1.4, 1.0, 2.0],
    look: [0, 0.1, 0.2],
    zoom: 1.75,
    whip: 1,
  },
  // no power, no battery
  { at: T.dabei, from: [3.0, 0.6, 3.6], to: [2.5, 0.5, 3.2], look: [0.6, 0, 0.2], zoom: 1.8 },
  // it thinks with wax: x-ray, crash zoom on the glowing capsule
  { at: T.denkt, from: [2.6, 0.9, 2.2], to: [1.5, 0.45, 1.2], look: [0, 0, -0.2], zoom: 1.8 },
  // orbit the capsule
  { at: T.kapsel, orbit: { c: [0, 0, -0.2], r: 2.4, y: 0.8, a0: 1.2, a1: 0.5 }, zoom: 1.5 },
  // it expands
  { at: T.dehnt, from: [1.3, 0.5, 1.4], to: [1.1, 0.35, 1.1], look: [0, 0, -0.2], zoom: 1.6 },
  // like rising yeast dough
  {
    at: T.hefeteig,
    from: [9.0, -6.2, 9.8],
    to: [9.8, -6.9, 8.8],
    look: [12.5, -9.4, 3],
    zoom: 1.2,
    whip: -1,
  },
  // the pin slides toward the valve
  { at: T.schiebt, from: [2.8, 1.1, -0.2], to: [2.4, 0.9, -0.6], look: [0, 0, -0.8], zoom: 1.7 },
  // guess what the 3 means: macro on the number ring from above
  { at: T.rate, from: [0.9, 2.1, 0.6], to: [0.55, 1.6, 0.2], look: [0, 0.5, -0.5], zoom: 1.3 },
  // the pin sits on the valve: x-ray side view
  { at: T.stift2, from: [3.0, 0.8, 0.6], to: [2.6, 0.4, 0.0], look: [-0.3, -0.3, -1.3], zoom: 1.8 },
  // cold room: valve wide open, hot water rushes in
  {
    at: T.zimmer,
    from: [4.5, -1.8, 3.2],
    to: [3.8, -0.8, 2.4],
    look: [-1.8, -1.2, -1.6],
    zoom: 1.4,
  },
  // at 3 just like at 5
  { at: T.genauso, from: [1.6, 1.3, 2.0], to: [1.2, 1.0, 1.6], look: [0, 0.2, -0.2], zoom: 1.5 },
  // warm: the wax pushes the valve shut
  { at: T.warm2, from: [2.4, 0.6, 0.4], to: [2.1, 0.4, -0.1], look: [0, -0.1, -1.0], zoom: 1.8 },
  // payoff: the room glows warm, the frost melts
  { at: T.payoff, from: [6, 0.5, 9], to: [4.6, 1.2, 7.2], look: [-2.6, 1.0, -1.2], zoom: 1.3 },
  // Übrigens: the curtain sweeps across the radiator
  { at: T.fakt, from: [9, -1, 12], to: [7.5, -0.5, 10.5], look: [-1, 0, 0], zoom: 1.4, whip: 1 },
  // behind the curtain: heat trapped, the head shuts off
  { at: T.staut, from: [2.6, 1.1, -0.4], to: [2.1, 0.8, -0.1], look: [-1.4, 0.1, 1.4], zoom: 1.3 },
  // which setting is yours? the number ring turning, close
  { at: T.cta, from: [1.4, 1.5, 1.6], to: [0.9, 1.1, 1.0], look: [0, 0.35, -0.4], zoom: 1.3 },
];

export const LABELS = [
  { text: "Wachs-Kapsel", at: T.kapsel + 0.1, until: T.dehnt, pos: [0, 0.3, 0.2], side: -1 },
  { text: "Stift", at: T.stift1, until: T.rate, pos: [0, 0, -0.95], side: 1 },
  { text: "Ventil", at: T.ventil, until: T.zimmer, pos: [0, 0, -1.9], side: -1 },
];

export const HIGHLIGHTS = [
  { kind: "flash", at: T.fuenf1 },
  { kind: "zoom", at: T.fuenf1, amount: 0.3 },
  { kind: "shake", at: T.schneller1 + 0.2, dur: 0.35, amp: 0.5 },
  { kind: "shake", at: T.batterie + 0.3, dur: 0.3, amp: 0.4 },
  { kind: "zoom", at: T.wachs1, amount: 0.35 },
  { kind: "slowmo", at: T.dehnt + 0.2, until: T.hefeteig, speed: 0.4 },
  { kind: "zoom", at: T.aufgeht, amount: 0.25 },
  { kind: "flash", at: T.rund },
  { kind: "zoom", at: T.rund, amount: 0.35 },
  { kind: "zoom", at: T.offen, amount: 0.25 },
  { kind: "slowmo", at: T.drueckt, until: T.payoff, speed: 0.45 },
  { kind: "shake", at: T.zu + 0.1, dur: 0.3, amp: 0.5 },
  { kind: "zoom", at: T.spaeter, amount: 0.3 },
  { kind: "shake", at: T.ab + 0.05, dur: 0.35, amp: 0.5 },
];

export const SFX = [
  { s: "ratsche", at: 0.0, db: -6 },
  { s: "ratsche", at: T.drehst + 0.05, db: -8 },
  { s: "pop", at: T.strom + 0.1 },
  { s: "pop", at: T.batterie },
  { s: "surr", at: T.wachs1, dur: 2.2, db: -22 },
  { s: "pop", at: T.hefeteig + 0.2 },
  { s: "click", at: T.drei1 },
  { s: "rauschen", at: T.zimmer + 0.2, dur: T.drueckt - T.zimmer, db: -20 },
  { s: "gluckern", at: T.offen, db: -12 },
  { s: "ratsche", at: T.genauso + 0.1, db: -10 },
  { s: "klack", at: T.zu + 0.05 },
  { s: "rauschen", at: T.vorhang, dur: 1.4, db: -18 },
  { s: "klack", at: T.ab + 0.02, db: -6 },
  { s: "ratsche", at: T.cta + 0.2, db: -12 },
];
