// Beats of #28 "Raketen-Landung": every time-keyed decision as plain data,
// read by scene.js (picture) and scripts/build-sfx.mjs (sound). No three.js
// / DOM here — node imports it too.
import { W } from "./timing.js";

// ---------------------------------------------------------------- beats
export const T = {
  rueck1: W("rückwärts", 1),
  sie: W("Sie", 1),
  auf1: W("auf", 1),
  eine: W("Eine"),
  explodiert: W("explodiert"),
  stell: W("Stell"),
  knall: W("Knall"),
  metallturm: W("Metallturm"),
  hoch: W("hoch"),
  stuerzt: W("stürzt"),
  dann: W("Dann"),
  brennt: W("brennt"),
  bremst: W("bremst"),
  folg: W("Folg"),
  aber: W("Aber"),
  oben: W("Oben"),
  klappen1: W("klappen", 1),
  gitterflossen: W("Gitterflossen"),
  zielen: W("zielen"),
  rate: W("Rate"),
  schneller: W("Schneller"),
  formel: W("Formel-1-Auto"),
  verrueckte: W("Verrückte"),
  schweben: W("schweben"),
  selbst: W("Selbst"),
  also: W("Also"),
  zuendet: W("zündet"),
  selbstmord: W("Selbstmord-Zündung"),
  frueh: W("Zu", 4),
  spaet: W("Zu", 5),
  bumm: W("Bumm"),
  vier: W("Vier"),
  landebeine: W("Landebeine"),
  darum: W("Darum"),
  null: W("null"),
  fakt: W("Übrigens"),
  mal37: W("37-mal"),
  cta: W("Würdest"),
};
// touchdown in scene time: inside the slow motion that starts on "Vier"
// (46.0 → the picture only reaches ~46.6 before the cut on "Darum")
T.landen = T.vier + 0.48;
T.ghostZuend = T.schweben + 0.05; // the hover test lights its engine

// ---------------------------------------------------------------- shots
// rel: "B" = relative to the falling booster (scene.js adds its position);
// shots without rel are in world coordinates (deck = y 0, target at origin).
export const shots = [
  // hook: booster high above the clouds, engine first, burning — fast push
  { at: 0, rel: "B", from: [6.2, 0.4, 8.4], to: [3.3, 1.6, 4.7], look: [0, 1.9, 0], tilt: 0.3 },
  // from below: the flames come towards you
  { at: T.rueck1, rel: "B", from: [2.9, -5.2, 3.2], to: [2.1, -4.0, 2.4], look: [0, 2.2, 0] },
  // wide: at the edge of space, the cloud sheet far below
  {
    at: T.sie,
    rel: "B",
    from: [12, 9, 17],
    to: [9, 6.5, 12.5],
    look: [0, 1.5, 0],
    lookTo: [0, -1.5, 0],
  },
  // reveal: the tiny ship alone in the ocean
  { at: T.auf1, from: [-17, 36, 32], to: [-9, 21, 18], look: [0, 0, -1], lookTo: [0, 0, 0] },
  // whisper: slow push over the target
  { at: T.eine, from: [3.8, 2.4, 6.8], to: [2.2, 1.5, 4.2], look: [0, 0.1, 0] },
  // what if: fireball on the deck
  { at: T.explodiert, from: [9, 4.8, 13], to: [10, 5.4, 14.5], look: [0, 1.6, 0] },
  // story: you, standing on the ship at sunrise
  { at: T.stell, from: [4.9, 0.95, 6.0], to: [4.3, 0.82, 5.2], look: [1.4, 0.55, -1.6] },
  // the bang: look up into the sky
  {
    at: T.knall,
    from: [3.4, 0.32, 3.9],
    to: [3.2, 0.3, 3.6],
    look: [2.3, 4, 0.4],
    lookTo: [1.2, 12, -1.5],
  },
  // a metal tower falls out of the clouds, straight at you
  {
    at: T.metallturm,
    from: [4.6, 0.55, 5.8],
    to: [4.3, 0.5, 5.4],
    look: [-1.5, 16.8, -1.5],
    lookTo: [-1.5, 15.5, -1.5],
  },
  // as tall as a tower block: side by side with a ghost building
  { at: T.hoch, rel: "B", from: [7.4, 2.2, 8.6], to: [6.2, 2.6, 7.4], look: [1.1, 2.5, 0] },
  // falling on you (crash zoom)
  {
    at: T.stuerzt,
    from: [4.3, 0.45, 5.3],
    to: [4.1, 0.42, 5.1],
    look: [-1, 13.2, -1],
    lookTo: [-1, 11, -1],
  },
  // money shot 2: it lights its engines and brakes with its own fire
  { at: T.dann, rel: "B", from: [5, -1.4, 6.6], to: [3.9, -0.5, 5.1], look: [0, 1.4, 0] },
  { at: T.bremst, rel: "B", from: [3.1, -3.4, 3.9], to: [2.5, -2.6, 3.1], look: [0, 0.6, 0] },
  // follow line: from above, the booster sinks towards the sea and the ship
  {
    at: T.folg,
    rel: "B",
    from: [2.8, 9.5, 4.2],
    to: [2.1, 7.4, 3.3],
    look: [0, 0.5, 0],
    lookTo: [0, -2, 0],
  },
  // how do you steer a tower? the top, fins folded
  { at: T.aber, rel: "B", from: [2.2, 4.0, 2.9], to: [1.7, 4.5, 2.2], look: [0, 4.5, 0] },
  // macro: the titanium grids fold out
  { at: T.oben, rel: "B", from: [2.0, 6.0, 2.4], to: [1.6, 5.6, 1.9], look: [0, 4.45, 0], whip: 1 },
  // the grid fins steering
  { at: T.gitterflossen, rel: "B", from: [2.2, 5.5, -0.7], to: [0.8, 5.7, 2.3], look: [0, 4.5, 0] },
  // booster camera: aiming at the ship far below
  {
    at: T.zielen,
    rel: "B",
    from: [0.78, 5.25, 0.6],
    to: [0.72, 5.15, 0.55],
    look: [0.1, -12, 0.15],
    tilt: 0,
  },
  // guess how fast: it shoots past the camera
  {
    at: T.rate,
    from: [3.8, 21, 5.2],
    to: [3.5, 19.5, 4.8],
    look: [0, 26, 0],
    lookTo: [0, 16, 0],
    whip: -1,
  },
  // faster than a Formula 1 car: the car races across the deck
  { at: T.schneller, from: [0.4, 1.3, 10.5], to: [0.2, 1.25, 9.4], look: [0, 3.6, 0] },
  // mid twist: it cannot hover — the test goes back up
  { at: T.verrueckte, from: [6.6, 3.6, 9.6], to: [5.8, 4.0, 8.4], look: [0, 8.6, 0] },
  // x-ray: even its weakest thrust beats its weight
  { at: T.selbst, from: [4.6, 5.8, 6.4], to: [3.9, 5.2, 5.5], look: [0, 6.6, 0] },
  // so it waits: silent fall, seen from the deck
  { at: T.also, rel: "B", from: [4.8, -3.8, 6.8], to: [4.2, -3.2, 6.0], look: [0, 2.2, 0] },
  // ignition just above the deck
  { at: T.zuendet, rel: "B", from: [5.2, 0.6, 6.8], to: [4.5, 1.3, 5.8], look: [0, 1.2, 0] },
  // suicide burn, low over the deck
  { at: T.selbstmord, from: [7.0, 0.7, 9.4], to: [6.0, 0.9, 8.2], look: [0, 6.4, 0] },
  // too early: it climbs again
  { at: T.frueh, from: [7.5, 3, 10.5], to: [7.4, 4.2, 10.2], look: [0, 8, 0] },
  // too late: boom
  { at: T.spaet, from: [9.5, 3.0, 13], to: [10.2, 3.4, 14], look: [0, 4.2, 0] },
  // the real landing: legs out, touchdown (slow motion)
  { at: T.vier, from: [3.9, 0.45, 5.4], to: [3.5, 0.55, 4.9], look: [0, 1.5, 0] },
  // payoff: it stands — zero at the ground
  { at: T.darum, from: [1.8, 0.24, 7.0], to: [1.3, 0.3, 6.0], look: [0, 2.7, 0], tilt: 0.4 },
  // bonus fact: around the sooty veteran
  { at: T.fakt, orbit: { c: [0, 2.5, 0], r: 7.8, y: 3.0, a0: 1.05, a1: -0.15 } },
  // CTA: you next to it, drone pull-back over the ocean at sunrise
  {
    at: T.cta,
    from: [3.4, 1.0, 5.6],
    to: [16, 11, 26.5],
    look: [0.4, 1.6, 0],
    lookTo: [0, 1, -2],
    tilt: 0.6,
  },
];

// ---------------------------------------------------------------- labels
// pos "B+" = relative to the booster (scene.js resolves it every frame)
export const LABELS = [
  {
    text: "Gitterflossen",
    at: T.gitterflossen + 0.1,
    until: T.zielen,
    pos: [0.62, 4.4, 0],
    rel: "B",
    side: 1,
  },
  { text: "Schub", at: T.selbst + 0.3, until: T.also, pos: [0.95, 6.4, 0], side: 1 },
  { text: "Gewicht", at: T.selbst + 0.9, until: T.also, pos: [-0.95, 7.4, 0], side: -1 },
  {
    text: "Selbstmord-Zündung",
    at: T.selbstmord + 0.05,
    until: T.frueh,
    pos: [0, -0.9, 0],
    rel: "B",
    side: 1,
  },
  { text: "Landebeine", at: T.landebeine, until: T.darum, pos: [1.0, 0.55, 1.0], side: 1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "shake", at: 0.02, dur: 0.6, amp: 0.7 }, // roaring engines on frame 0
  { kind: "zoom", at: T.rueck1, amount: 0.3 },
  { kind: "flash", at: T.explodiert + 0.05 },
  { kind: "shake", at: T.explodiert + 0.05, dur: 0.7, amp: 1.2 },
  { kind: "shake", at: T.knall, dur: 0.6, amp: 1.1 }, // sonic boom
  { kind: "zoom", at: T.stuerzt, dur: 0.9, amount: 0.45 },
  { kind: "flash", at: T.brennt + 0.05 },
  { kind: "slowmo", at: T.bremst, until: T.folg, speed: 0.35 },
  { kind: "shake", at: T.klappen1 + 0.25, dur: 0.35, amp: 0.5 },
  { kind: "shake", at: T.schneller + 0.35, dur: 0.4, amp: 0.6 }, // the car blasts past
  { kind: "flash", at: T.ghostZuend },
  { kind: "flash", at: T.zuendet + 0.03 },
  { kind: "shake", at: T.zuendet + 0.03, dur: 0.8, amp: 0.8 },
  { kind: "flash", at: T.bumm },
  { kind: "shake", at: T.bumm, dur: 0.9, amp: 1.4 },
  { kind: "slowmo", at: T.vier, until: T.darum, speed: 0.35 },
  { kind: "zoom", at: T.mal37, amount: 0.3 },
];

// ---------------------------------------------------------------- sound
// own sounds (scripts/sfx-extra.py): triebwerk (rocket roar), knall (sonic
// boom, double), explosion (deep boom)
export const SFX = [
  { s: "triebwerk", at: 0, dur: T.auf1 - 0.1, db: -9 },
  { s: "rauschen", at: T.auf1, dur: T.stell - T.auf1, db: -24 }, // wind + sea from above
  { s: "explosion", at: T.explodiert + 0.05, db: -8 },
  { s: "rauschen", at: T.stell, dur: T.knall - T.stell - 0.1, db: -26 }, // sea on deck
  { s: "knall", at: T.knall - 0.05, db: -6 },
  { s: "rauschen", at: T.metallturm, dur: T.dann - T.metallturm, db: -22 }, // falling air
  { s: "triebwerk", at: T.brennt + 0.05, dur: T.folg - T.brennt, db: -10 },
  { s: "rauschen", at: T.folg, dur: T.oben - T.folg, db: -24 },
  { s: "klack", at: T.klappen1 + 0.2 },
  { s: "klack", at: T.klappen1 + 0.33 },
  { s: "klack", at: T.klappen1 + 0.46 },
  { s: "klack", at: T.klappen1 + 0.59 },
  { s: "rauschen", at: T.rate, dur: T.schneller - T.rate, db: -16 }, // fly-by
  { s: "brumm", at: T.schneller + 0.05, dur: 1.2, db: -14 }, // race car engine
  { s: "triebwerk", at: T.ghostZuend, dur: T.selbst - T.ghostZuend + 0.2, db: -12 },
  { s: "triebwerk", at: T.zuendet, dur: T.frueh - T.zuendet, db: -9 },
  { s: "triebwerk", at: T.frueh, dur: T.spaet - T.frueh, db: -13 },
  { s: "explosion", at: T.bumm, db: -6 },
  { s: "triebwerk", at: T.vier, dur: T.darum - T.vier, db: -12 },
  { s: "klack", at: T.vier + 0.25 },
  { s: "klack", at: T.vier + 0.4 },
  { s: "zisch", at: T.darum, dur: 2.2, db: -20 }, // steam off the hot engines
  { s: "rauschen", at: T.cta, dur: 4.2, db: -24 },
];
