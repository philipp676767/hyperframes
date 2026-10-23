// TEMPLATE beats: every time-keyed decision of the video as plain data, so
// scene.js (picture) and scripts/build-sfx.mjs (sound) read the same numbers.
// Keep this file free of three.js / DOM: it is imported by node too.
import { W } from "./timing.js";

// ---------------------------------------------------------------- beats
// Word anchors: W("word", n) = start of the n-th time that word is spoken.
// Pick distinctive words; common ones ("an", "der") collide.
export const T = {
  kerze: W("Kerze"),
  lampe1: W("Lampe", 1),
  aber: W("Aber"),
  aus: W("aus"),
  also: W("Also"),
  draht1: W("Draht", 1),
  heiss: W("heiß"),
  gluet: W("glüht"),
  gluehfaden: W("Glühfaden"),
  payoff: W("weil"), // the line that answers the hook question
  fakt: W("Übrigens"),
};

// ---------------------------------------------------------------- shots
// One shot per beat, hard cut every ~2-4 s, always slowly moving. Every cut
// gets a whoosh automatically; add `sfx: false` to a shot to keep it silent.
export const shots = [
  // opening: fast push-in from frame 0, first cut ≤ 1.5 s (visual-style.md "first 3 seconds")
  { at: 0, from: [1.5, 1.2, 2.1], to: [0.75, 0.75, 1.05], look: [0, 0.45, 0] },
  { at: T.lampe1, from: [3.2, 2.6, 5.4], to: [2.6, 2.2, 4.5], look: [0, 0.5, 0] },
  { at: T.aber, from: [-1.1, 0.9, 1.4], to: [-0.8, 0.8, 1.1], look: [0, 0.5, 0] },
  { at: T.also, from: [2.2, 2.4, 3.4], to: [1.8, 2.1, 2.9], look: [0, 1.5, 0] },
  { at: T.draht1, from: [0.9, 2.3, 1.7], to: [0.6, 2.15, 1.4], look: [0, 1.95, 0], whip: 1 },
  { at: T.gluehfaden, orbit: { c: [0, 1.7, 0], r: 3.2, y: 2.4, a0: 0.8, a1: -0.6 } },
  { at: T.payoff, from: [1.0, 2.0, 3.6], to: [0.6, 1.9, 3.0], look: [0, 1.5, 0] },
  { at: T.fakt, from: [3, 2.5, 5], to: [9.5, 7.5, 15], look: [0, 1.4, 0], lookTo: [0, 0.4, 0] },
];

// ---------------------------------------------------------------- labels
// Tag + arrow on a part, from the word that names it, ~2.5 s. pos = world
// point the arrow touches; side -1 / 1 (optional) = tag left / right of it.
export const LABELS = [
  { text: "Draht", at: T.draht1, until: T.heiss, pos: [0.3, 1.95, 0] },
  { text: "Glühfaden", at: T.gluehfaden, until: T.payoff, pos: [0.2, 1.95, 0], side: 1 },
];

// ---------------------------------------------------------------- highlights
// The video's big moments (world.js highlights()): at least one every
// 5–7 s, the biggest spectacle also in the first 2 s. A slowmo must end on
// a shot cut (here T.gluehfaden).
export const HIGHLIGHTS = [
  { kind: "zoom", at: T.lampe1, amount: 0.3 }, // hook claim lands before 1.5 s
  { kind: "shake", at: T.also + 0.3, dur: 0.4, amp: 0.8 }, // the bulb lands
  { kind: "slowmo", at: T.heiss, until: T.gluehfaden, speed: 0.35 }, // the wire heats up
  { kind: "flash", at: T.gluet }, // … and glows
  { kind: "zoom", at: T.gluehfaden, amount: 0.3 },
];

// ---------------------------------------------------------------- sound
// Extra sound effects for things that happen in the scene. Automatic (no
// entry needed): whoosh on every cut, hit on the hook title, punch on each
// *highlighted* word, blip per label, the payoff ding, the CTA pops +
// click. Kit: pop blip click klack ding boing wow hit punch whoosh (one-shots), zisch brumm surr rauschen piep geiger (loops: give `dur`).
//   { s: "zisch", at: T.x, dur: 2.0, db: -16 }   db = level, optional
export const SFX = [
  { s: "pop", at: T.also + 0.15 }, // the bulb pops in
  { s: "surr", at: T.heiss, dur: T.payoff - T.heiss, db: -21 }, // the hot wire buzzes
];
