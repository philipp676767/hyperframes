// #85 "Fußball auf dem Mond" — every time-keyed decision as plain data
// (scene.js reads it for the picture, scripts/build-sfx.mjs for the sound).
import { W } from "./timing.js";

export const T = {
  fussball: W("Fußball"),
  ball: W("Ball", 1), // "Und der Ball?"
  bein: W("Bein"),
  mond2: W("Mond", 2), // "Der Mond ist schwach"
  zieht: W("zieht"),
  steigt: W("steigt", 1),
  krater: W("Krater"),
  luft1: W("Luft", 1),
  erde2: W("Erde", 2), // "Auf der Erde bremst sie"
  hier: W("Hier"),
  rate: W("Rate"),
  minute: W("Minute"),
  zeit: W("Zeit"),
  selfie: W("Selfie"),
  bananen: W("Bananenflanke"),
  kurve: W("Kurve"),
  ohne: W("Ohne"),
  geradeaus: W("geradeaus"),
  wenig: W("Wenig"),
  felder: W("Fußballfelder"),
  fakt: W("Übrigens"),
  golf: W("Golfbälle"),
  astro: W("Astronauten"),
  cta: W("Mond", 4), // "Mond oder Stadion"
};

// the kick on frame 0 and the landing on the payoff word
export const KICK = 0.3;
export const LAND = T.felder + 0.25;

// shots: `rel: "ball"` = relative to the flying ball (scene.js resolves it),
// `rel: "golf"` = relative to the golf balls. Camera positions are absolute
// (scene.js uses zoom 1 everywhere).
export const shots = [
  // frame 0: low behind the kicking boot, the ball launches towards the Earth
  { at: 0, from: [-1.3, 0.36, 1.6], to: [-1.05, 0.4, 1.2], look: [0.05, 0.6, -1.2] },
  // ≤ 1.5 s: wide behind the astronaut, the ball rising over the goal
  { at: 1.15, from: [2.6, 1.3, 4.6], to: [2.2, 1.5, 3.9], look: [0, 3.2, -8] },
  // "Und der Ball?" — right next to the spinning ball
  { at: T.ball, rel: "ball", from: [1.1, 0.35, 1.5], to: [0.85, 0.25, 1.15], look: [0, 0, 0] },
  // "Nicht dein Bein ist stark" — the astronaut, leg still up, looking after it
  { at: T.bein, from: [1.9, 1.25, -2.6], to: [1.5, 1.4, -2.1], look: [0, 1.15, 0] },
  // "Der Mond ist schwach" — the ball with its tiny gravity arrow
  { at: T.mond2, rel: "ball", from: [-3.6, 0.9, 4.2], to: [-3.0, 0.5, 3.4], look: [0, -0.4, 0] },
  // "steigt und steigt, über die Krater" — drone over the craters
  { at: T.steigt, rel: "ball", from: [9, 5, 13], to: [6, 3.5, 9], look: [0, -4, -4], whip: 1 },
  // "Luft" — side view of the whole flight: Earth arc vs Moon arc
  { at: T.luft1, from: [58, 12, -12], to: [54, 12, -16], look: [0, 9, -24] },
  // "Rate mal" — under the ball, the Earth behind it, stopwatch running
  { at: T.rate, rel: "ball", from: [-1.2, -0.5, 1.6], to: [-1.0, -0.4, 1.3], look: [0, 0, 0] },
  // "Zeit für ein Selfie" — the phone's view: astronaut + the ball in the sky
  { at: T.zeit, from: [1.6, 2.3, 3.6], to: [1.4, 2.2, 3.1], look: [-0.3, 2.0, -6] },
  // "Bananenflanke" — low behind the astronaut along the flight line
  { at: T.bananen, from: [2.4, 2.0, 4.8], to: [2.0, 1.8, 4.0], look: [-4, 2.5, -25], whip: -1 },
  // "Ohne Luft … geradeaus" — from above: straight line vs the curve
  { at: T.ohne, from: [6, 62, 22], to: [4, 58, 16], look: [-2, 0, -38] },
  // "Wenig Schwerkraft, keine Luft" — the ball coming down
  { at: T.wenig, rel: "ball", from: [2.4, 1.6, 3.2], to: [1.7, 1.9, 2.3], look: [0, -0.6, 0] },
  // "fünf Fußballfelder" — high above: five pitches light up, the ball lands
  { at: T.felder - 0.35, from: [4, 205, 26], to: [3, 195, 18], look: [0, 0, -78] },
  // "Übrigens: Golfbälle" — macro on the golf balls in the dust
  {
    at: T.fakt,
    rel: "golf",
    from: [0.62, 0.26, 0.78],
    to: [0.5, 0.21, 0.62],
    look: [0.08, 0.03, -0.06],
  },
  // CTA: the golf balls, the lander and the Earth behind them
  { at: T.cta, rel: "golf", from: [0.9, 0.35, 1.2], to: [0.7, 0.3, 0.95], look: [0.05, 0.1, -0.4] },
];

// one tag at a time, 3–4 per video
export const LABELS = [
  { text: "Schwerkraft", at: T.zieht, until: T.steigt, pos: "gravity", side: 1 },
  { text: "Erde", at: T.erde2 + 0.9, until: T.rate, pos: "earthArc", side: -1 },
  { text: "Bananenflanke", at: T.bananen + 0.7, until: T.ohne, pos: "curve", side: -1 },
  { text: "Golfbälle", at: T.golf + 0.1, until: T.cta, pos: "golfBall", side: 1 },
];

export const HIGHLIGHTS = [
  { kind: "shake", at: KICK, dur: 0.45, amp: 1.2 }, // the kick
  { kind: "flash", at: KICK },
  { kind: "zoom", at: T.ball, amount: 0.3 },
  { kind: "slowmo", at: T.ball + 0.2, until: T.bein, speed: 0.45 }, // the ball spinning past
  { kind: "zoom", at: T.zieht, amount: 0.25 },
  { kind: "shake", at: T.erde2 + 1.05, dur: 0.35, amp: 0.6 }, // the Earth ball thuds down
  { kind: "zoom", at: T.minute, amount: 0.35 },
  { kind: "flash", at: T.selfie + 0.25 }, // the selfie flash
  { kind: "zoom", at: T.ohne + 0.9, amount: 0.25 },
  { kind: "shake", at: LAND, dur: 0.6, amp: 1 }, // landing
  { kind: "zoom", at: T.golf, amount: 0.3 },
];

// own sounds (scripts/sfx-extra.py): kick (boot on leather), tick (stopwatch), shutter (selfie)
export const SFX = [
  { s: "kick", at: KICK, db: -6 },
  { s: "rauschen", at: T.erde2 + 0.05, dur: 1.0, db: -20 }, // the Earth ball through the air
  { s: "kick", at: T.erde2 + 1.05, db: -16 },
  { s: "tick", at: T.rate + 0.2, dur: T.zeit - T.rate - 0.2, db: -14 },
  { s: "shutter", at: T.selfie + 0.22, db: -10 },
  { s: "kick", at: LAND, db: -10 },
  { s: "pop", at: T.golf + 0.05 },
];
