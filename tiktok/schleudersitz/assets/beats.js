// Beats of #29 "Schleudersitz": every time-keyed decision as plain data,
// read by scene.js (picture) and scripts/build-sfx.mjs (sound). No three.js
// / DOM here — node imports it too.
import { W } from "./timing.js";

// ---------------------------------------------------------------- beats
export const T = {
  geschlossenes: W("geschlossenes"),
  unter1: W("Unter", 1),
  rakete1: W("Rakete", 1),
  und: W("Und", 1),
  stell: W("Stell"),
  knall1: W("Knall"),
  triebwerk: W("Triebwerk"),
  ziehst: W("ziehst"),
  griff: W("Griff"),
  kein: W("Kein"),
  notausgang: W("Notausgang"),
  im1: W("Im", 2),
  zuendet2: W("zündet", 2),
  sprengschnur: W("Sprengschnur"),
  die1: W("Die", 1),
  zerplatzt: W("zerplatzt"),
  bevor: W("bevor"),
  folg: W("Folg"),
  unter2: W("Unter", 2),
  ladung: W("Ladung"),
  feuert: W("feuert"),
  rakete2: W("Rakete", 2),
  rate: W("Rate"),
  ueber: W("Über", 2),
  tonne: W("Tonne"),
  zack: W("Zack"),
  verrueckte: W("Verrückte"),
  klappt: W("klappt"),
  boden: W("Boden"),
  ein2: W("Ein", 2),
  mini: W("Mini-Schirm"),
  dann2: W("dann", 2),
  los: W("los"),
  dein3: W("Dein", 3),
  fallschirm: W("Fallschirm"),
  knallt2: W("knallt", 2),
  im2: W("Im", 3),
  zweisitzer: W("Zweisitzer"),
  fliegt: W("fliegt"),
  zuerst: W("zuerst"),
  sonst: W("sonst"),
  so: W("So"),
  zieht: W("zieht"),
  den2: W("Den", 2),
  allein: W("allein"),
  drei: W("drei"),
  fakt: W("Übrigens"),
  zentimeter: W("Zentimeter"),
  cta: W("Würdest"),
};
// moments of the action in scene time
T.shatter = T.zerplatzt - 0.05; // the canopy bursts (story)
T.eject = T.shatter + 0.12; // the seat starts to move
T.cat = T.ladung + 0.02; // x-ray replay: catapult charge
T.groundEject = T.klappt; // zero-zero test on the runway
T.drogue = T.mini + 0.1;
T.release = T.los - 0.05;
T.chute = T.fallschirm + 0.25;
T.rear = T.fliegt - 0.05; // twin seat: rear seat first …
T.front = T.zuerst + 0.2; // … then the front seat
T.wrong = T.sonst + 0.05; // the wrong order (what if)

// ---------------------------------------------------------------- shots
// rel "J" = relative to the jet, "S" = the seat / pilot, "K" = the twin jet;
// no rel = world (the valley floor, runway along x through the origin).
export const shots = [
  // hook: the seat bursts out of the canopy, glass flying — fast push, close
  { at: 0, rel: "J", from: [4.0, 2.0, 4.2], to: [2.9, 1.8, 2.8], look: [1.7, 1.5, 0], tilt: 0.3 },
  // from below the shards: the headbox breaks through the glass
  {
    at: T.geschlossenes,
    rel: "J",
    from: [3.2, 0.9, 2.2],
    to: [2.9, 0.95, 1.9],
    look: [1.6, 2.2, 0],
  },
  // a rocket under him: under the seat, the flame
  { at: T.unter1, rel: "S", from: [1.7, -1.0, 2.1], to: [1.3, -0.6, 1.6], look: [0, -0.2, 0] },
  // whisper: wide, the seat high above the jet, the Alps far below
  {
    at: T.und,
    rel: "S",
    from: [5.5, 1.6, 9.5],
    to: [6.6, 2.4, 11.5],
    look: [0, -2.4, 0],
    lookTo: [0, -3.2, 0],
  },
  // story: you in the cockpit, over the nose into the mountains
  { at: T.stell, rel: "J", from: [4.4, 1.35, 2.4], to: [3.7, 1.2, 1.9], look: [1.85, 0.9, 0] },
  // bang: the engine bursts into flames
  {
    at: T.knall1,
    rel: "J",
    from: [-7.5, 2.4, 5.2],
    to: [-6.6, 2.1, 4.4],
    look: [-3.0, 0.2, 0],
    tilt: 0.3,
  },
  // the yellow handle between your legs: your hand pulls it
  { at: T.ziehst, rel: "J", from: [2.6, 1.75, 1.0], to: [2.45, 1.65, 0.85], look: [1.95, 0.55, 0] },
  // no accident — your emergency exit: slow orbit around the cockpit
  { at: T.kein, rel: "J", orbit: { c: [1.6, 0.6, 0], r: 3.6, y: 1.9, a0: 1.15, a1: 0.55 } },
  // the cord in the glass above you lights up
  { at: T.im1, rel: "J", from: [2.4, 2.6, 1.9], to: [2.1, 2.4, 1.5], look: [1.7, 0.75, 0] },
  // the canopy bursts (slow motion)
  { at: T.die1, rel: "J", from: [4.4, 1.9, 4.2], to: [4.0, 1.9, 3.7], look: [1.6, 1.1, 0] },
  // before your head hits it: the seat rises into the gap
  { at: T.bevor, rel: "J", from: [2.7, 1.3, 2.3], to: [2.6, 1.6, 2.2], look: [1.6, 1.6, 0] },
  // follow line: the seat hangs above the jet, upper half of the frame
  { at: T.folg, rel: "S", from: [3.4, -1.6, 5.6], to: [3.1, -1.4, 5.1], look: [0, -0.7, 0] },
  // x-ray replay: the charge under the seat
  { at: T.unter2, rel: "J", from: [3.6, 1.0, 3.4], to: [3.2, 1.1, 3.0], look: [1.5, 0.6, 0] },
  // the rocket fires (crash zoom)
  {
    at: T.feuert,
    rel: "S",
    from: [2.6, 1.0, 2.6],
    to: [2.3, 0.9, 2.3],
    look: [0, 0.1, 0],
  },
  // guess how heavy: the seat rising, pressed into the seat
  { at: T.rate, rel: "S", from: [2.0, 1.4, 2.3], to: [1.7, 1.3, 2.0], look: [0, 0.8, 0] },
  // over a tonne: a car on your lap
  { at: T.ueber, rel: "S", from: [2.7, 1.6, 3.4], to: [2.4, 1.5, 3.0], look: [0, 1.2, 0] },
  // zack — out: the jet falls away below you
  {
    at: T.zack,
    rel: "S",
    from: [3.4, 2.6, 5.2],
    to: [4.4, 4.2, 6.8],
    look: [0, -1.0, 0],
    lookTo: [0, -3.5, 0],
    whip: 1,
  },
  // mid twist: the jet stands on the runway in the valley
  {
    at: T.verrueckte,
    from: [9.5, 1.7, 9.5],
    to: [8.2, 1.6, 8.2],
    look: [0.8, 1.2, 0],
  },
  // zero-zero: the seat shoots up from the parked jet
  {
    at: T.klappt,
    from: [8.5, 1.2, 11.5],
    to: [9.5, 1.0, 13],
    look: [1.6, 2.4, 0],
    lookTo: [0.9, 7.5, 0],
  },
  // high enough for the chute
  { at: T.boden, from: [8, 4, 14], to: [8.5, 5.2, 14.5], look: [1.0, 8.4, 0] },
  // mini chute: back in the air, the drogue pops out of the headbox
  { at: T.ein2, rel: "S", from: [2.6, 2.2, 3.4], to: [2.3, 2.3, 3.0], look: [0, 1.5, 0] },
  // the seat lets you go and falls away
  { at: T.dann2, rel: "S", from: [3.8, 0.6, 4.8], to: [3.6, 0.2, 4.6], look: [0, -0.4, 0] },
  // money shot: the main chute bangs open, seen from below
  {
    at: T.dein3,
    rel: "S",
    from: [2.4, -2.6, 4.4],
    to: [3.4, -3.6, 6.4],
    look: [0, 2.2, 0],
    lookTo: [0, 2.8, 0],
  },
  // two-seater: side view
  { at: T.im2, rel: "K", from: [1.0, 2.4, 11], to: [1.2, 2.8, 10.2], look: [0.6, 1.6, 0] },
  // rear seat first, then the front one
  { at: T.fliegt, rel: "K", from: [1.2, 3.2, 15], to: [1.0, 3.8, 15.5], look: [0.6, 3.6, 0] },
  // what if the front went first: the rear pilot gets grilled
  { at: T.sonst, rel: "K", from: [-0.2, 3.0, 7.2], to: [0.0, 3.1, 6.6], look: [0.9, 2.2, 0] },
  // payoff: you under the chute over the valley at sunset
  { at: T.so, rel: "S", orbit: { c: [0, 1.2, 0], r: 7.5, y: 2.2, a0: 0.95, a1: 0.35 } },
  // he only pulls once: the handle in his hand
  { at: T.zieht, rel: "S", from: [3.4, 0.2, 4.4], to: [3.0, 0.3, 3.9], look: [0, 0.8, 0] },
  // the seat did the rest alone: wide over the valley
  {
    at: T.den2,
    rel: "S",
    from: [6.5, 3.8, 11],
    to: [5.8, 3.2, 9.8],
    look: [0, 1.6, 0],
    tilt: 0.5,
  },
  // bonus fact: landed on the meadow, next to a measuring stick
  { at: T.fakt, from: [3.0, 1.2, 9.6], to: [2.5, 1.1, 8.8], look: [0.5, 0.75, 5.4] },
  // CTA: drone pull-back over the Alpine valley
  {
    at: T.cta,
    from: [2.6, 1.1, 8.8],
    to: [13, 8, 25],
    look: [0.4, 0.75, 5.4],
    lookTo: [0, 6, -24],
    tilt: 0.6,
  },
];

// ---------------------------------------------------------------- labels
// rel "J" / "S" / "K" positions are resolved in scene.js every frame
export const LABELS = [
  {
    text: "Notausgang",
    at: T.notausgang + 0.05,
    until: T.im1,
    pos: [1.55, 1.25, 0],
    rel: "J",
    side: -1,
  },
  {
    text: "Sprengschnur",
    at: T.sprengschnur,
    until: T.die1,
    pos: [2.0, 0.85, 0.2],
    rel: "J",
    side: 1,
  },
  { text: "Ladung", at: T.ladung, until: T.feuert, pos: [-0.38, 0.1, 0], rel: "S", side: -1 },
  { text: "Rakete", at: T.rakete2, until: T.rate, pos: [0, -0.5, 0.1], rel: "S", side: 1 },
  {
    text: "Mini-Schirm",
    at: T.mini + 0.3,
    until: T.dann2,
    pos: [-0.4, 2.0, 0],
    rel: "D",
    side: -1,
  },
  { text: "Fallschirm", at: T.fallschirm + 0.4, until: T.im2, pos: [0, 4.6, 0], rel: "S", side: 1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "shake", at: 0.02, dur: 0.7, amp: 0.9 }, // glass bursts on frame 0
  { kind: "zoom", at: T.unter1 + 0.1, amount: 0.3 },
  { kind: "shake", at: T.knall1, dur: 0.7, amp: 1.2 },
  { kind: "flash", at: T.knall1 },
  { kind: "zoom", at: T.griff, amount: 0.25 },
  { kind: "flash", at: T.shatter },
  { kind: "shake", at: T.shatter, dur: 0.6, amp: 0.9 },
  { kind: "flash", at: T.cat },
  { kind: "shake", at: T.cat, dur: 0.4, amp: 0.6 },
  { kind: "flash", at: T.feuert + 0.1 },
  { kind: "zoom", at: T.feuert + 0.1, amount: 0.35 },
  { kind: "shake", at: T.tonne, dur: 0.5, amp: 0.8 },
  { kind: "shake", at: T.groundEject + 0.05, dur: 0.6, amp: 0.8 },
  { kind: "flash", at: T.groundEject + 0.05 },
  { kind: "shake", at: T.chute, dur: 0.6, amp: 1.0 },
  { kind: "zoom", at: T.chute, amount: 0.25 },
  { kind: "flash", at: T.rear },
  { kind: "flash", at: T.wrong },
  { kind: "shake", at: T.wrong, dur: 0.5, amp: 0.8 },
  { kind: "zoom", at: T.zentimeter, amount: 0.3 },
];

// ---------------------------------------------------------------- sound
// own sounds (scripts/sfx-extra.py): rakete (seat rocket roar), sprengschnur
// (crackling cord + glass bursting), explosion (engine fire bang)
export const SFX = [
  { s: "sprengschnur", at: 0, db: -7 },
  { s: "rakete", at: 0.05, dur: T.und - 0.1, db: -10 },
  { s: "rauschen", at: T.und, dur: T.stell - T.und, db: -22 }, // wind up high
  { s: "rauschen", at: T.stell, dur: T.knall1 - T.stell, db: -24 }, // the jet's hiss
  { s: "explosion", at: T.knall1 - 0.03, db: -7 },
  { s: "rauschen", at: T.knall1 + 0.6, dur: T.ziehst - T.knall1, db: -22 },
  { s: "piep", at: T.triebwerk, db: -18 }, // fire warning
  { s: "klack", at: T.griff + 0.2 },
  { s: "zisch", at: T.zuendet2 + 0.1, dur: 1.3, db: -20 }, // the cord burning
  { s: "sprengschnur", at: T.shatter, db: -6 },
  { s: "rakete", at: T.eject + 0.3, dur: T.unter2 - T.eject - 0.3, db: -14 },
  { s: "rakete", at: T.feuert + 0.1, dur: T.zack - T.feuert, db: -10 },
  { s: "rauschen", at: T.zack, dur: T.verrueckte - T.zack, db: -18 },
  { s: "sprengschnur", at: T.groundEject, db: -9 },
  { s: "rakete", at: T.groundEject + 0.15, dur: 0.9, db: -12 },
  { s: "rauschen", at: T.ein2, dur: T.dein3 - T.ein2, db: -22 },
  { s: "pop", at: T.drogue },
  { s: "klack", at: T.release },
  { s: "pop", at: T.chute, db: -4 },
  { s: "rakete", at: T.rear + 0.05, dur: 0.7, db: -14 },
  { s: "rakete", at: T.front + 0.05, dur: 0.7, db: -14 },
  { s: "rakete", at: T.wrong, dur: 1.1, db: -12 },
  { s: "rauschen", at: T.so, dur: T.fakt - T.so, db: -26 },
  { s: "rauschen", at: T.cta, dur: 4.4, db: -24 },
];
