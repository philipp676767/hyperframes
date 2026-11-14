// Chapter 1 "Das Monster": the Saturn V at dawn, its size, the balloon
// analogy, countdown, ignition, lift-off, staging, orbit.
import { W } from "./timing.js";

export const T = {
  datum: W("16"),
  maenner: W("Männer"),
  saturn: W("Saturn", 1),
  unter: W("Unter"),
  statue: W("Freiheitsstatue"),
  fast: W("Fast"),
  wie: W("hebt"),
  ballon: W("Luftballon"),
  rueck: W("Rückstoß"),
  saturn2: W("Saturn", 2),
  kontroll: W("Kontrollzentrum"),
  null: W("null"),
  bis: W("bis"),
  jetzt: W("Jetzt"),
  wannen: W("Badewannen"),
  noch: W("kilometerweit"),
  trick: W("Trick"),
  stufe: W("Stufe", 1),
  nach: W("knapp"),
  erde: W("kreisen"),
  so: W("kommst"),
  aber: W("Aber"),
};
// liftoff = when the clamps let go
export const LIFT = T.bis + 0.6;

// shots with rel: "rocket" follow the rocket (scene.js fills the vector)
export const shots = [
  { at: 0, from: [-190, 22, 170], to: [-150, 26, 130], look: [0, 55, 0], zoom: 1 },
  {
    at: T.datum,
    from: [70, 8, 95],
    to: [62, 10, 85],
    look: [0, 25, 0],
    lookTo: [0, 92, 0],
    zoom: 1,
  },
  { at: T.maenner, from: [16, 108, 26], to: [12, 106, 22], look: [0, 102, 0], zoom: 1 },
  {
    at: T.unter,
    from: [40, 100, 70],
    to: [120, 60, 160],
    look: [0, 100, 0],
    lookTo: [-30, 50, 0],
    zoom: 1,
  },
  { at: T.fast, orbit: { c: [0, 50, 0], r: 190, y: 40, a0: 0.9, a1: 0.4 }, zoom: 1 },
  {
    at: T.ballon,
    from: [47.5, 9.4, 63.5],
    to: [46.5, 9.2, 62],
    look: [42, 8.8, 58],
    zoom: 1,
    whip: 1,
  },
  { at: T.saturn2, from: [26, 4, 30], to: [22, 5, 26], look: [0, 6, 0], zoom: 1 },
  { at: T.kontroll, from: [130, 30, 120], to: [110, 30, 100], look: [0, 40, 0], zoom: 1 },
  { at: T.null, from: [34, 12, 30], to: [30, 12, 27], look: [0, 8, 0], zoom: 1 },
  {
    at: T.bis,
    from: [150, 20, 150],
    to: [150, 20, 150],
    look: [0, 40, 0],
    lookTo: [0, 120, 0],
    zoom: 1,
  },
  { at: T.jetzt, from: [26, -12, 20], to: [28, -8, 22], look: [0, 0, 0], zoom: 1, rel: "rocket" },
  {
    at: T.noch,
    from: [190, 12, 170],
    to: [190, 12, 170],
    look: [0, 90, 0],
    lookTo: [0, 150, 0],
    zoom: 1,
  },
  {
    at: T.trick,
    from: [140, 70, 170],
    to: [120, 60, 150],
    look: [0, 50, 0],
    zoom: 1,
    rel: "rocket",
  },
  {
    at: T.nach,
    from: [140, 30, 160],
    to: [130, 0, 150],
    look: [0, 20, 0],
    lookTo: [0, -50, 0],
    zoom: 1,
    rel: "rocket",
  },
  { at: T.erde, from: [80, 95, 95], to: [65, 98, 80], look: [0, 90, 0], zoom: 1, rel: "rocket" },
  { at: T.so, from: [-90, 110, 40], to: [-75, 104, 35], look: [0, 90, 0], zoom: 1, rel: "rocket" },
];

export const LABELS = [
  { text: "Saturn V", at: T.saturn + 0.1, until: T.unter - 0.2, pos: [0, 95, 3.4], side: 1 },
  { text: "Stufe", at: T.stufe, until: T.stufe + 2.6, pos: [0, 20, 5], side: 1 },
];

export const HIGHLIGHTS = [
  { kind: "zoom", at: T.statue, amount: 0.25 },
  { kind: "zoom", at: T.rueck, amount: 0.3 },
  { kind: "flash", at: T.null + 0.1 },
  { kind: "shake", at: T.null + 0.1, dur: 4.5, amp: 1.0 },
  { kind: "slowmo", at: T.bis, until: T.jetzt, speed: 0.5 },
  { kind: "shake", at: T.noch, dur: 2.0, amp: 0.8 },
  { kind: "flash", at: T.stufe + 0.3 },
  { kind: "zoom", at: T.erde, amount: 0.2 },
];

export const SFX = [
  { s: "pop", at: T.ballon + 0.1 },
  { s: "zisch", at: T.ballon + 0.6, dur: 3.2, db: -18 },
  { s: "piep", at: T.kontroll + 0.3, dur: 2.6, db: -22 },
  { s: "startdonner", at: T.null + 0.05, db: -8 },
  { s: "triebwerk", at: T.null + 6, dur: T.trick - T.null - 6, db: -14 },
  { s: "klack", at: T.stufe + 0.3, db: -8 },
  { s: "triebwerk", at: T.stufe + 0.5, dur: T.erde - T.stufe - 0.5, db: -20 },
];
