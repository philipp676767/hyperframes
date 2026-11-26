// #97 Handy-Nacken — timing as plain data (scene.js + build-sfx.mjs).
import { W } from "./timing.js";

export const T = {
  verbiegt: W("verbiegt"),
  deinen: W("deinen", 1),
  nacken1: W("Nacken", 1),
  aerzte: W("Ärzte"),
  hn: W("Handy-Nacken"),
  abends: W("Abends"),
  scrollst: W("scrollst"),
  kopf1: W("Kopf", 1),
  bowling: W("Bowlingkugel"),
  aufrecht: W("Aufrecht"),
  wirbel: W("Wirbelsäule"),
  dann: W("Dann"),
  kippt: W("kippt"),
  jetzt: W("Jetzt"),
  kugel: W("Kugel"),
  hals: W("Hals"),
  leg: W("Leg"),
  finger: W("Finger"),
  runter: W("runter"),
  spuerst: W("Spürst"),
  muskeln: W("Muskeln"),
  rate: W("Rate"),
  anfuehlt: W("anfühlt"),
  k27: W("27"),
  kind: W("Kind"),
  schultern: W("Schultern"),
  jeden: W("Jeden"),
  jahre: W("Jahre"),
  brust: W("Brustmuskeln"),
  steif: W("steif"),
  hinten: W("Hinten"),
  nackenm: W("Nackenmuskeln"),
  schlapp: W("schlapp"),
  fakt: W("Übrigens"),
  nicken: W("Nicken"),
  verdoppelt: W("verdoppelt"),
  je: W("Je"),
  tiefer: W("tiefer"),
  schwerer: W("schwerer"),
  deshalb: W("Deshalb"),
  bleibt: W("bleibt"),
  vorne: W("vorne"),
  auch: W("Auch"),
  wie: W("Wie", 4),
  schreibs: W("Schreib's"),
};

// head = the head centre when upright ≈ (0, 2.88, -1.78); bent ≈ (0, 2.6, -1.35)
export const shots = [
  // hook: close 3/4 front on the face in the phone light, head snaps down
  { at: 0, from: [1.55, 3.0, -0.15], to: [1.0, 2.8, -0.7], look: [0, 2.6, -1.5], zoom: 1.0 },
  // side macro of the bending neck, red strain glow
  {
    at: T.deinen,
    from: [1.7, 2.75, -1.45],
    to: [1.35, 2.7, -1.55],
    look: [0, 2.55, -1.6],
    zoom: 1.0,
  },
  {
    at: T.aerzte,
    from: [3.1, 2.7, -0.5],
    to: [2.7, 2.55, -0.85],
    look: [0, 2.15, -1.35],
    zoom: 1.15,
  },
  // the room: evening in bed, scrolling
  { at: T.abends, from: [4.4, 4.1, 3.6], to: [3.7, 3.6, 2.7], look: [0, 1.9, -1.4], zoom: 1.0 },
  // the head turns into a bowling ball
  {
    at: T.bowling,
    from: [1.35, 3.05, -0.35],
    to: [1.0, 2.95, -0.7],
    look: [0, 2.85, -1.75],
    zoom: 1.0,
  },
  // x-ray side: the ball balances on the spine
  {
    at: T.aufrecht,
    from: [2.7, 2.75, -1.15],
    to: [2.45, 2.6, -1.4],
    look: [0, 2.3, -1.7],
    zoom: 1.15,
  },
  // it tips forward (slowmo)
  {
    at: T.kippt,
    from: [2.0, 2.75, -0.95],
    to: [1.75, 2.6, -1.2],
    look: [0, 2.55, -1.6],
    zoom: 1.0,
    whip: 1,
  },
  // the lever: ball in front of the neck, force arrow
  {
    at: T.jetzt,
    from: [2.5, 2.65, -1.05],
    to: [2.25, 2.55, -1.3],
    look: [0, 2.4, -1.55],
    zoom: 1.2,
  },
  // from behind/above: two fingers on the neck
  { at: T.leg, from: [1.5, 3.35, -2.65], to: [1.15, 3.2, -2.5], look: [0, 2.6, -1.75], zoom: 1.0 },
  // x-ray macro: the neck muscles pull
  {
    at: T.spuerst,
    from: [1.55, 2.8, -1.95],
    to: [1.35, 2.72, -1.85],
    look: [0, 2.6, -1.7],
    zoom: 1.0,
  },
  // "Rate mal": the scale needle runs
  { at: T.rate, from: [2.6, 3.05, 0.7], to: [2.2, 2.85, 0.25], look: [0, 2.3, -1.4], zoom: 1.0 },
  { at: T.k27, from: [1.9, 2.85, -0.85], to: [1.6, 2.72, -1.1], look: [0, 2.55, -1.45], zoom: 1.0 },
  // a child on your shoulders
  { at: T.kind, from: [1.9, 4.0, 0.3], to: [1.55, 3.75, -0.15], look: [0, 3.1, -1.75], zoom: 1.0 },
  // time-lapse: the clock races, days pass
  { at: T.jeden, from: [3.9, 3.5, 2.7], to: [3.4, 3.7, 2.0], look: [-0.6, 2.9, -2.2], zoom: 1.0 },
  // x-ray front: chest muscles short + tight
  { at: T.brust, from: [1.45, 2.65, 0.45], to: [1.2, 2.5, 0.05], look: [0, 2.2, -1.5], zoom: 1.0 },
  // x-ray back: neck muscles long + weak
  {
    at: T.hinten,
    from: [1.65, 3.45, -2.65],
    to: [1.4, 3.3, -2.55],
    look: [0, 2.45, -1.8],
    zoom: 1.0,
  },
  // Übrigens: a small nod doubles the weight
  {
    at: T.fakt,
    from: [2.35, 2.75, -0.95],
    to: [2.1, 2.65, -1.2],
    look: [0, 2.55, -1.6],
    zoom: 1.1,
  },
  {
    at: T.je,
    from: [1.9, 2.3, -0.75],
    to: [1.6, 2.35, -1.0],
    look: [0, 2.5, -1.5],
    zoom: 1.0,
    whip: -1,
  },
  // payoff: the phone drops — the head stays forward (ghost = where it belongs)
  {
    at: T.deshalb,
    from: [2.75, 2.8, -0.35],
    to: [2.45, 2.75, -0.6],
    look: [0, 2.55, -1.75],
    zoom: 1.1,
  },
  {
    at: T.auch,
    from: [1.6, 2.85, -0.25],
    to: [1.25, 2.75, -0.6],
    look: [0, 2.55, -1.45],
    zoom: 1.0,
  },
  // CTA: keep moving
  { at: T.wie, orbit: { c: [0, 2.35, -1.5], r: 2.5, y: 2.95, a0: 1.25, a1: 0.7 } },
  {
    at: T.schreibs,
    from: [2.0, 2.85, -1.15],
    to: [1.75, 2.75, -1.3],
    look: [0, 2.55, -1.5],
    zoom: 1.0,
  },
];

export const LABELS = [
  { text: "Wirbelsäule", at: T.wirbel, until: T.kippt, pos: [0, 2.05, -1.83], side: 1 },
  { text: "Nackenmuskeln", at: T.muskeln, until: T.rate, pos: [0, 2.55, -1.85], side: 1 },
  { text: "Brustmuskeln", at: T.brust, until: T.hinten, pos: [0.22, 2.15, -1.38], side: 1 },
];

export const HIGHLIGHTS = [
  { kind: "zoom", at: 0.55, amount: 0.3 }, // the neck bends (hook)
  { kind: "shake", at: 0.6, dur: 0.35, amp: 0.6 },
  { kind: "flash", at: T.bowling }, // head -> bowling ball
  { kind: "slowmo", at: T.kippt, until: T.jetzt, speed: 0.4 }, // it tips
  { kind: "zoom", at: T.k27, amount: 0.4 }, // 27 kg
  { kind: "shake", at: T.k27, dur: 0.5 },
  { kind: "shake", at: T.kind + 0.25, dur: 0.6, amp: 1.2 }, // child lands
  { kind: "flash", at: T.brust }, // x-ray chest
  { kind: "zoom", at: T.verdoppelt, amount: 0.3 },
  { kind: "shake", at: T.tiefer + 0.3, dur: 0.4, amp: 0.7 },
  { kind: "flash", at: T.vorne }, // the answer: head stays forward
  { kind: "zoom", at: T.auch, amount: 0.35 },
];

export const SFX = [
  { s: "knack", at: 0.03, db: -4 }, // frame 0: the neck cracks
  { s: "knack", at: 0.62, db: -8 },
  { s: "pop", at: T.bowling }, // the ball pops in
  { s: "klack", at: T.kippt + 0.5 }, // it tips over the edge
  { s: "piep", at: T.rate + 0.2, dur: 1.6, db: -20 }, // the scale counts
  { s: "plumps", at: T.kind + 0.25, db: -6 }, // the child lands
  { s: "click", at: T.jeden + 0.1 },
  { s: "pop", at: T.kind + 0.05, db: -10 },
  { s: "knack", at: T.nicken + 0.15, db: -10 },
  { s: "klack", at: T.deshalb + 0.55, db: -8 }, // the phone hits the duvet
];
