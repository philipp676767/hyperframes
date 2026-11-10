// #65 "10-Meter-Turm" (Format B) — timing as plain data (scene.js + build-sfx.mjs).
// Shots are absolute (shotCamera zoom 1 in scene.js); `rel: "you"` / "pro"
// follow the falling body (resolved in scene.js).
import { W } from "./timing.js";

export const T = {
  faellst: W("fällst"),
  turm: W("10-Meter-Turm"),
  bauch: W("Bauch", 1),
  wasser: W("Wasser", 1),
  heute: W("Heute"),
  wand: W("Wand"),
  hallenbad: W("Hallenbad"),
  schauen: W("schauen"),
  verschaetzt: W("verschätzt"),
  kippst: W("kippst"),
  nichts: W("Nichts"),
  rast: W("rast"),
  unten: W("Unten"),
  auto: W("Auto"),
  k50: W("50"),
  ganzer: W("ganzer"),
  klatscht: W("klatscht"),
  folge: W("Folge"),
  rate: W("Rate"),
  platz: W("Platz"),
  weniger: W("Weniger"),
  wimpern: W("Wimpernschlag"),
  drueckt: W("drückt"),
  wucht: W("Wucht"),
  haut: W("Haut"),
  knallrot: W("knallrot"),
  luft: W("Luft", 1),
  profis: W("Profis"),
  schlagen: W("schlagen"),
  hand: W("Hand"),
  loch: W("Loch"),
  denn: W("Denn"),
  hart: W("hart"),
  traege: W("träge"),
  zeit: W("Zeit"),
  uebrigens: W("Übrigens"),
  training: W("Training"),
  sprudelt: W("sprudelt"),
  becken: W("Becken"),
  weicher: W("weicher"),
  hoechster: W("höchster"),
  schreib: W("Schreib's"),
};

// key moments of the story (derived). Times inside a slowmo window are
// scene times (world.js warp): the picture there runs slower than the voice.
const SLOW_HIT = 0.35; // slowmo speed over "Dein ganzer Bauch klatscht …"
const SLOW_HAND = 0.4; // slowmo speed over "flachen Hand"
const hitIn = Math.min(0.45, (T.folge - T.ganzer) * SLOW_HIT * 0.6);
const handIn = (T.loch - T.hand) * SLOW_HAND;
export const K = {
  hookHit: T.bauch + 0.05, // cold open: belly hits the water
  tip: T.kippst, // you tip over the edge
  fallFrom: T.kippst + 0.55, // free fall starts
  hit: T.ganzer + hitIn, // the big belly flop (scene time)
  hitReal: T.ganzer + hitIn / SLOW_HIT, // … when it is heard
  proFrom: T.profis + 0.15, // the pro leaves the platform
  handSlow: T.hand, // hands 0.8 m above the water, slowmo starts
  proHit: T.hand + handIn - 0.02, // flat hands punch the hole (scene time)
  proHitReal: T.loch - 0.05,
  softHit: T.weicher + 0.1, // landing in the bubbles
  slowHit: SLOW_HIT,
  slowHand: SLOW_HAND,
};

export const shots = [
  // frame 0: you, flat in the air just above the water, low camera, tower behind
  { at: 0, from: [2.6, 0.35, 5.2], to: [1.7, 0.5, 3.9], look: [0, 1.6, 0.4], focus: 4 },
  // first cut: side view at water level, the belly about to slap
  {
    at: T.turm,
    from: [3.4, -0.25, 0.3],
    to: [2.9, -0.1, 0.2],
    look: [0, 0.05, 0],
    rel: "you",
    whip: 1,
  },
  // impact from the front, low, splash in the face
  { at: T.bauch, from: [0.6, 0.6, 4.6], to: [0.4, 0.8, 3.8], look: [0, 0.4, 0.5] },
  // "Wasser ist doch weich?": macro over the calm water (ripples, caustics)
  { at: T.wasser, from: [1.6, 0.55, 5.6], to: [1.0, 0.45, 4.8], look: [0, 0.0, 2.2], focus: 3 },
  // "Heute wird es zur Wand": the water turns to concrete — crash zoom low
  { at: T.heute, from: [0.0, 0.5, 6.5], to: [0.0, 0.4, 5.6], look: [0, 0.2, 0], whip: -1 },
  // "Hallenbad": wide establishing from the far pool end, you on the 10 m platform
  { at: T.hallenbad, from: [6.5, 3.0, 17], to: [5.2, 3.6, 15], look: [0, 6.5, -2] },
  // "alle schauen hoch": over the spectators' shoulders up to the tower
  { at: T.schauen, from: [-11.5, 2.2, 4.8], to: [-11, 2.4, 4.0], look: [0, 9.5, -1.5] },
  // "Du verschätzt dich": close on you at the edge, arms windmilling
  {
    at: T.verschaetzt,
    from: [2.6, 10.8, 1.8],
    to: [2.0, 10.9, 1.2],
    look: [0, 10.9, -1.2],
    whip: 1,
  },
  // "kippst nach vorn": side view, you tip over the edge
  { at: T.kippst, from: [5.0, 10.4, -0.4], to: [4.6, 9.8, -0.2], look: [0, 9.6, -0.4] },
  // "Nichts bremst dich": tracking alongside the fall
  { at: T.nichts, from: [3.0, 0.4, 0.4], to: [2.8, 0.6, 0.6], look: [0, -0.2, 0], rel: "you" },
  // "das Wasser rast auf dich zu": over your back, looking down at the water
  { at: T.rast, from: [0.35, 1.3, 1.3], to: [0.3, 1.1, 1.1], look: [0, -4, 2.2], rel: "you" },
  // "Unten bist du so schnell …": low at the water, looking up at you coming
  { at: T.unten, from: [2.0, -2.8, 2.8], to: [1.6, -2.3, 2.3], look: [0, -0.4, 0], rel: "you" },
  // "wie ein Auto in der Stadt": close side, speed lines
  { at: T.auto, from: [-2.4, 0.6, 0.8], to: [-2.2, 0.5, 0.7], look: [0, 0.2, 0], rel: "you" },
  // "50 km/h": low front, gauge maxed
  { at: T.k50, from: [1.3, -1.7, 3.4], to: [1.0, -1.3, 2.8], look: [0, -0.3, 0], rel: "you" },
  // "Dein ganzer Bauch klatscht gleichzeitig auf": water level side, slowmo impact
  { at: T.ganzer, from: [3.6, 0.15, 1.6], to: [3.0, 0.22, 1.3], look: [0, 0.25, 0.6] },
  // "Folge für mehr Wissen": from the platform straight down at you floating
  { at: T.folge, from: [0.6, 9.0, 1.6], to: [0.4, 7.5, 1.4], look: [0, 0, 0.6], tilt: 0.4 },
  // "Rate mal …": underwater, the moment of impact replayed, water beads
  { at: T.rate, from: [2.6, -0.75, 2.2], to: [2.1, -0.7, 1.8], look: [0, -0.1, 0.5], focus: 2.6 },
  // "Weniger als ein Wimpernschlag": tighter, the beads squirt sideways
  { at: T.weniger, from: [1.7, -0.5, 2.7], to: [1.4, -0.42, 2.3], look: [0, -0.1, 0.5], whip: -1 },
  // "Es drückt mit voller Wucht zurück": force arrows push up into the belly
  { at: T.drueckt, from: [2.2, -0.5, 2.6], to: [1.8, -0.4, 2.2], look: [0, 0.1, 0.5] },
  // "Deine Haut brennt knallrot": you roll over, the belly glows red (from above)
  { at: T.haut, from: [1.0, 2.4, 3.0], to: [0.7, 2.0, 2.4], look: [0, 0.0, 0.5] },
  // "dir bleibt die Luft weg": close on the face, gasping
  {
    at: T.luft,
    from: [-0.75, 0.6, 1.5],
    to: [-0.6, 0.48, 1.3],
    look: [0, 0.05, 0.62],
    rel: "you",
    focus: 0.9,
  },
  // "Profis machen's anders": wide, the pro dives straight, arms overhead
  { at: T.profis, from: [6.5, 8.0, 9.5], to: [5.6, 7.4, 8.2], look: [0.9, 8.2, -0.6] },
  // "Sie schlagen …": tracking the straight dive
  { at: T.schlagen, from: [2.4, 0.6, 1.8], to: [2.2, 0.4, 1.6], look: [0, -0.2, 0], rel: "pro" },
  // "flachen Hand": macro at the surface, flat hands about to hit
  { at: T.hand, from: [2.1, 0.35, 1.9], to: [1.8, 0.3, 1.6], look: [0.9, 0.1, 0.3], focus: 1.8 },
  // "ein Loch ins Wasser": underwater, the cavity opens, the body slides through
  { at: T.loch, from: [3.0, -1.0, 2.2], to: [2.6, -0.9, 1.9], look: [0.9, -0.6, 0.3], whip: 1 },
  // payoff "Denn Wasser ist nicht hart – nur träge": underwater, beads parting slowly
  { at: T.denn, from: [2.2, -0.9, 2.7], to: [1.7, -0.8, 2.2], look: [0.9, -0.5, 0.3] },
  // "Es braucht Zeit": surface level, the clean entry's tiny splash
  { at: T.zeit, from: [-1.6, -0.8, 2.8], to: [-1.2, -0.7, 2.3], look: [0.9, -0.7, 0.3] },
  // Übrigens: underwater, the bubble nozzles on the pool floor
  { at: T.uebrigens, from: [4.2, -3.6, 5.0], to: [3.4, -3.0, 4.2], look: [0, -2.4, 0.6] },
  // "sprudelt unten Luft ins Becken": bubbles race up past the camera
  { at: T.sprudelt, from: [1.8, -1.6, 3.4], to: [1.4, -0.9, 2.9], look: [0, 0.2, 0.6], whip: -1 },
  // "macht das Wasser weicher": you land softly in the foam
  { at: T.becken, from: [3.4, 1.2, 4.6], to: [2.8, 1.0, 3.9], look: [0, 0.8, 0.5] },
  // comment question: wide, high, the foaming pool under the tower
  { at: T.hoechster, from: [8.5, 4.8, 12.5], to: [7.4, 5.4, 11.0], look: [0, 4.2, -0.5] },
];

// name tags + arrows ("you" / "pro" / "beads" points are resolved in scene.js)
export const LABELS = [
  { text: "Bauch", at: T.ganzer, until: T.klatscht + 0.6, pos: "belly", side: 1 },
  { text: "Wasser", at: T.platz, until: T.weniger, pos: [0.9, -0.35, 0.9], side: 1 },
  { text: "flache Hand", at: T.hand, until: T.loch, pos: "proHand", side: -1 },
  { text: "Loch", at: T.loch + 0.2, until: T.denn, pos: [0.9, -0.5, 0.3], side: 1 },
  { text: "träge", at: T.traege, until: T.uebrigens, pos: [1.6, -0.6, 0.5], side: 1 },
  { text: "Luftblasen", at: T.sprudelt, until: T.becken, pos: [0.0, -1.0, 0.4], side: 1 },
];

export const HIGHLIGHTS = [
  { kind: "zoom", at: 0.2, amount: 0.25 }, // hook lands
  { kind: "flash", at: K.hookHit },
  { kind: "shake", at: K.hookHit, dur: 0.6, amp: 1.2 },
  { kind: "flash", at: T.wand },
  { kind: "shake", at: T.wand, dur: 0.4, amp: 0.8 },
  { kind: "slowmo", at: T.verschaetzt, until: T.kippst, speed: 0.6 },
  { kind: "zoom", at: T.rast, amount: 0.35 },
  { kind: "zoom", at: T.k50, amount: 0.3 },
  { kind: "slowmo", at: T.ganzer, until: T.folge, speed: K.slowHit },
  { kind: "flash", at: K.hitReal },
  { kind: "shake", at: K.hitReal, dur: 0.7, amp: 1.4 },
  { kind: "zoom", at: T.wimpern, amount: 0.3 },
  { kind: "shake", at: T.wucht, dur: 0.5, amp: 1 },
  { kind: "flash", at: T.knallrot },
  { kind: "slowmo", at: T.hand, until: T.loch, speed: K.slowHand },
  { kind: "zoom", at: T.traege, amount: 0.3 },
  { kind: "flash", at: T.sprudelt },
  { kind: "zoom", at: T.weicher, amount: 0.25 },
];

// own sounds (scripts/sfx-extra.py): klatsch = belly slap, rip = clean
// hands-first entry, blubber = bubbles
export const SFX = [
  { s: "rauschen", at: 0, dur: T.bauch, db: -18 }, // wind of the fall on frame 0
  { s: "klatsch", at: K.hookHit, db: -4 },
  { s: "klack", at: T.wand + 0.02, db: -6 },
  { s: "rauschen", at: K.fallFrom, dur: K.hitReal - K.fallFrom, db: -20 },
  { s: "klatsch", at: K.hitReal, db: -3 },
  { s: "blubber", at: T.luft + 0.1, db: -12 },
  { s: "rip", at: K.proHitReal, db: -8 },
  { s: "blubber", at: T.sprudelt - 0.3, db: -10 },
  { s: "blubber", at: T.becken, db: -12 },
  { s: "rip", at: K.softHit, db: -12 },
];
