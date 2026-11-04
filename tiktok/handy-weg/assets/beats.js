// Beats of #57 "Woche ohne Handy": every time-keyed decision as plain data,
// read by scene.js (picture) and scripts/build-sfx.mjs (sound). No three.js.
// Scale: 1 unit ≈ 25 cm. The jetty runs along z, you sit at its end (+z).
import { W } from "./timing.js";

// ---------------------------------------------------------------- places
export const YOU = [-1.0, 0, 2.15]; // your hips, sitting on the jetty edge, facing +z (the lake)
export const HEAD = [-1.0, 2.95, 2.05];
export const BOX = [1.75, 0, 1.75]; // the crate on the planks (bottom centre)
export const POCKET = [-1.55, 0.55, 2.75]; // front pocket of your right jeans leg
export const BRAIN = [0, -150, 0]; // pocket: the brain in the scanner (MRT look)
export const ROW_Z = -3.5; // the ten people of the study, standing on the jetty (front row)

const at = (p, d) => [p[0] + d[0], p[1] + d[1], p[2] + d[2]];

// ---------------------------------------------------------------- beats
export const T = {
  woche: W("Woche", 1),
  gehirn1: W("Gehirn", 1),
  streiche: W("Streiche"),
  tag1: W("Tag", 1),
  greift: W("greift"),
  hosentasche: W("Hosentasche"),
  leere: W("Leere"),
  bzzz: W("bzzz"),
  vibriert: W("vibriert"),
  nur: W("Nur"),
  kiste: W("Kiste"),
  phantom: W("Phantom-Vibrieren"),
  wartet: W("wartet"),
  summen: W("Summen"),
  studie: W("Studie"),
  neun: W("neun"),
  wie: W("Wie", 2),
  bildschirmzeit: W("Bildschirmzeit"),
  kommentare: W("Kommentare"),
  rate: W("Rate"),
  ganzen: W("ganzen"),
  tag2: W("Tag", 2),
  tag3: W("Tag", 3),
  forscher: W("Forscher"),
  nach: W("Nach"),
  h72: W("72"),
  belohnung: W("Belohnungszentrum"),
  merkten: W("merkten"),
  nichts: W("nichts"),
  stellt: W("stellt"),
  um: W("um"),
  fakt: W("Übrigens"),
  sieben: W("sieben"),
  folge: W("Folge"),
};
// scene moments
T.drop = Math.min(0.28, T.woche * 0.2); // the phone leaves your hand
T.slam = Math.min(0.85, T.woche - 0.25); // the lid slams shut
T.lock = T.woche + 0.35; // the padlock snaps
T.buzz = T.bzzz + 0.05; // the phantom buzz in your pocket

// ---------------------------------------------------------------- shots
export const shots = [
  // 0: cold open — your hand drops the glowing phone into the crate, the lid slams
  {
    at: 0,
    from: at(BOX, [1.9, 2.9, 3.1]),
    to: at(BOX, [1.0, 2.2, 2.1]),
    look: at(BOX, [0, 0.45, 0]),
    zoom: 1,
  },
  // the padlock snaps — low across the planks
  {
    at: T.woche,
    from: at(BOX, [1.2, 0.75, 2.6]),
    to: at(BOX, [0.75, 0.68, 1.95]),
    look: at(BOX, [0, 0.55, 0.55]),
    zoom: 1,
    whip: 1,
  },
  // wide from the lake: you, the crate, the misty jetty, the cabin
  { at: T.gehirn1, from: [5.5, 2.6, 16], to: [4.0, 2.2, 12.5], look: [0.1, 1.5, 1.2], zoom: 1 },
  // your head goes x-ray: the brain sparks with mischief
  {
    at: T.streiche,
    from: at(HEAD, [1.0, 0.45, 2.6]),
    to: at(HEAD, [0.6, 0.3, 1.9]),
    look: at(HEAD, [0, 0.15, 0]),
    zoom: 1,
  },
  // day one: you at the end of the jetty
  { at: T.tag1, from: [-7.5, 3.6, 9.5], to: [-6.2, 3.2, 8.2], look: [-0.4, 1.6, 1.2], zoom: 1 },
  // POV: your hand goes for the pocket (slow motion)
  {
    at: T.greift,
    from: at(POCKET, [-3.6, 2.7, 5.4]),
    to: at(POCKET, [-2.9, 2.3, 4.4]),
    look: at(POCKET, [0.2, 0.7, -0.2]),
    zoom: 1,
  },
  // … into nothing
  {
    at: T.leere,
    from: at(POCKET, [-2.9, 2.5, 4.4]),
    to: at(POCKET, [-2.3, 2.2, 3.6]),
    look: at(POCKET, [-0.1, 0.8, 0.2]),
    zoom: 1,
  },
  // bzzz — the pocket vibrates
  {
    at: T.bzzz,
    from: at(POCKET, [-2.6, 2.6, 3.4]),
    to: at(POCKET, [-1.9, 2.0, 2.5]),
    look: at(POCKET, [0.1, 0.3, 0]),
    zoom: 1,
  },
  // but the phone is in the crate (whip, the crate turns to glass)
  {
    at: T.nur,
    from: at(BOX, [1.5, 2.9, 2.6]),
    to: at(BOX, [1.05, 2.4, 1.9]),
    look: at(BOX, [0, 0.25, 0]),
    zoom: 1,
    whip: -1,
  },
  // phantom vibration: brain → pocket
  {
    at: T.phantom,
    from: [-3.4, 2.6, 8.4],
    to: [-2.8, 2.35, 7.0],
    look: [-1.1, 1.75, 2.3],
    zoom: 1,
  },
  { at: T.summen, orbit: { c: [-1.0, 1.6, 2.2], r: 6.8, y: 3.3, a0: -0.55, a1: 0.2 }, zoom: 1 },
  // the study: ten people on the shore, nine pockets buzz
  { at: T.studie, from: [0.4, 12.5, 10.5], to: [0.2, 11.2, 8.0], look: [0, 2.2, -7.0], zoom: 1 },
  // guess: drone shot over the lake, the stopwatch races
  { at: T.rate, from: [12, 11, 24], to: [17, 16, 31], look: [0, 0.5, -4], zoom: 1 },
  // day three: into the scanner
  {
    at: T.tag3,
    from: at(BRAIN, [11, 4.5, 15]),
    to: at(BRAIN, [8.5, 3.2, 11.5]),
    look: at(BRAIN, [0, 0.3, 0]),
    zoom: 1,
    whip: 1,
  },
  // the reward centre lights up
  {
    at: T.belohnung,
    from: at(BRAIN, [5.6, 2.3, 8.2]),
    to: at(BRAIN, [4.2, 1.7, 6.2]),
    look: at(BRAIN, [0.15, 0.1, 0.5]),
    zoom: 1,
  },
  // and you? notice nothing — shrug
  { at: T.merkten, from: [1.6, 3.4, 7.8], to: [1.0, 3.2, 6.6], look: [-0.9, 2.6, 2.1], zoom: 1 },
  // payoff: the brain rewires itself
  {
    at: T.stellt,
    orbit: {
      c: [BRAIN[0], BRAIN[1] + 0.4, BRAIN[2]],
      r: 10.5,
      y: BRAIN[1] + 3.0,
      a0: -0.7,
      a1: 0.25,
    },
    zoom: 1,
  },
  // Übrigens: low over the water, the sun breaks through
  { at: T.fakt, from: [-7.5, 0.4, 13], to: [-5.5, 1.4, 10.5], look: [0, 2.2, 0], zoom: 1, whip: 1 },
  // seven years — close on you and the crate
  { at: T.sieben, from: [2.8, 3.0, 8.2], to: [2.2, 2.6, 6.9], look: [-0.1, 1.6, 1.9], zoom: 1 },
  // last line, the comment question: the screen-time hologram over the crate
  {
    at: T.wie,
    from: at(BOX, [2.6, 2.0, 5.2]),
    to: at(BOX, [1.9, 1.7, 4.2]),
    look: at(BOX, [0, 1.7, 0]),
    zoom: 1,
  },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Hosentasche", at: T.hosentasche, until: T.leere, pos: POCKET, side: -1 },
  {
    text: "Phantom-Vibrieren",
    at: T.phantom + 0.1,
    until: T.summen,
    pos: [-1.0, 3.0, 2.05],
    side: -1,
  },
  {
    text: "Belohnungszentrum",
    at: T.belohnung + 0.1,
    until: T.merkten,
    pos: at(BRAIN, [0.15, -0.35, 0.5]),
    side: 1,
  },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "zoom", at: 0.12, amount: 0.3 },
  { kind: "shake", at: T.slam, dur: 0.45, amp: 0.9 },
  { kind: "flash", at: T.streiche },
  { kind: "slowmo", at: T.greift + 0.1, until: T.leere, speed: 0.4 },
  { kind: "zoom", at: T.leere, amount: 0.35 },
  { kind: "flash", at: T.buzz },
  { kind: "shake", at: T.buzz, dur: 0.7, amp: 0.7 },
  { kind: "zoom", at: T.phantom, amount: 0.3 },
  { kind: "flash", at: T.neun },
  { kind: "zoom", at: T.bildschirmzeit, amount: 0.25 },
  { kind: "flash", at: T.ganzen },
  { kind: "shake", at: T.ganzen, dur: 0.4, amp: 0.5 },
  { kind: "zoom", at: T.belohnung, amount: 0.35 },
  { kind: "flash", at: T.um },
  { kind: "shake", at: T.sieben, dur: 0.4, amp: 0.6 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "vibe", at: 0.0, db: -9 }, // frame 0: the phone buzzes in your hand
  { s: "klack", at: T.slam, db: -4 }, // lid slams
  { s: "klack", at: T.lock, db: -8 }, // padlock
  { s: "vibe", at: T.buzz, db: -6 }, // the phantom buzz
  { s: "vibe", at: T.phantom + 0.4, db: -18 },
  { s: "pop", at: T.studie + 0.1 },
  { s: "vibe", at: T.neun - 0.6, db: -16 },
  { s: "pop", at: T.wie + 0.1 },
  { s: "surr", at: T.tag3, dur: T.merkten - T.tag3, db: -22 }, // the scanner hums
  { s: "surr", at: T.stellt, dur: T.fakt - T.stellt, db: -24 },
];
