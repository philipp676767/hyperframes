// #90 Protein-Shake — every time-keyed decision as plain data (scene.js +
// scripts/build-sfx.mjs read the same numbers). No three.js / DOM here.
import { W, END } from "./timing.js";

// ---------------------------------------------------------------- beats
export const T = {
  abfall: W("Abfall"),
  kaeserei: W("Käserei"),
  pinkelst: W("pinkelst"),
  kessel: W("Riesenkessel"),
  kaese: W("Käse"),
  molke: W("Molke"),
  schweine: W("Schweine"),
  pulver: W("Pulver"),
  nur1: W("Nur", 1),
  muskel1: W("Muskel", 1),
  eiweiss: W("Eiweiß"),
  perlenkette: W("Perlenkette"),
  zerschneidet: W("zerschneidet"),
  blut: W("Blut"),
  rate: W("Rate"),
  zwanzig: W("20"),
  training: W("Training"),
  risse: W("Risse"),
  flicken: W("Flicken", 1),
  dicker: W("dicker"),
  nimmt: W("nimmt"),
  rest: W("Rest"),
  klo: W("Klo"),
  fakt: W("Übrigens"),
  gramm: W("Gramm"),
  schoko: W("Schoko"),
  vanille: W("Vanille"),
  end: END,
};

// ---------------------------------------------------------------- places
// shaker at the origin (2.6 tall), muscle model to the right, kettle and
// hut behind, pig pen right-back, outhouse left.
const MUS = [4.6, 1.3, 1.6];
const KET = [-5.2, 1.85, -7.4];

// ---------------------------------------------------------------- shots
export const shots = [
  // 0: the hand shakes the shaker — big, close, fast push-in
  { at: 0, from: [1.9, 2.3, 3.4], to: [0.95, 1.75, 2.15], look: [0, 1.35, 0] },
  // 0b: macro: the spout splashing, the WHEY label (cut ≤ 1.5 s)
  { at: T.abfall, from: [1.5, 2.9, 2.2], to: [1.1, 2.6, 1.7], look: [0.2, 2.2, 0], zoom: 1.4 },
  // 1: wide: shaker on the Alm, the cheese kettle steaming behind (≤ 1.5 s)
  { at: T.kaeserei, from: [3.6, 3.1, 5.6], to: [2.8, 2.7, 4.7], look: [-2.4, 1.4, -3.6], whip: 1 },
  // 2: coins pour out of the shaker
  { at: T.pinkelst, from: [-1.6, 1.3, 2.9], to: [-1.0, 1.1, 2.3], look: [1.0, 0.8, 0.4] },
  // 3: the copper kettle over the fire
  { at: T.kessel, from: [-2.6, 3.4, -2.6], to: [-3.3, 3.2, -3.6], look: KET },
  // 4: curds form, the rest turns yellow
  { at: T.kaese, from: [-3.9, 3.3, -5.0], to: [-4.4, 3.1, -5.7], look: KET, zoom: 1.15 },
  // 5: the pig drinks the whey
  {
    at: T.schweine,
    from: [9.4, 1.4, -1.6],
    to: [8.6, 1.15, -2.3],
    look: [7.2, 0.65, -4.2],
    whip: -1,
  },
  // 6: powder into the shaker
  { at: T.pulver, from: [1.9, 3.4, 2.7], to: [1.3, 3.1, 2.0], look: [0, 2.4, 0] },
  // 7: the muscle can't use it
  { at: T.nur1, from: [3.6, 2.6, 6.2], to: [3.2, 2.3, 5.4], look: [2.6, 1.5, 0.9], zoom: 2.0 },
  // 8: the protein chain rises out of the shaker
  { at: T.eiweiss, from: [0.9, 4.3, 4.6], to: [0.4, 4.0, 3.7], look: [0, 3.5, 0] },
  // 9: snip — the chain falls apart
  { at: T.zerschneidet, orbit: { c: [0, 3.55, 0], r: 2.3, y: 3.9, a0: -0.5, a1: 0.35 }, zoom: 1.5 },
  // 10: the beads ride the blood to the muscle
  { at: T.blut, from: [1.0, 3.6, 8.0], to: [1.8, 3.2, 6.9], look: [2.3, 2.6, 0.8] },
  // 11: guess: how many kinds?
  { at: T.rate, from: [0, 3.5, 5.6], to: [0, 3.5, 4.5], look: [0, 3.4, 0] },
  // 12: training — dumbbell reps, tiny tears glow
  { at: T.training, from: [6.6, 2.5, 4.9], to: [5.9, 2.1, 3.9], look: MUS, zoom: 1.35 },
  // 13: repair: beads fill the tears, the fibre gets thicker
  { at: T.flicken, orbit: { c: MUS, r: 3.2, y: 2.4, a0: 0.7, a1: 0.1 }, zoom: 1.6 },
  // 14: payoff: the muscle only takes what it needs
  { at: T.nimmt, from: [2.0, 3.1, 7.4], to: [2.6, 2.8, 6.4], look: [3.2, 2.0, 0.8] },
  // 15: the rest flies into the outhouse
  { at: T.rest, from: [-3.6, 2.8, 4.2], to: [-4.5, 2.4, 3.0], look: [-7.8, 1.3, -2.0], whip: -1 },
  // 16: Übrigens — powder overflowing out of the shaker
  { at: T.fakt, from: [2.4, 1.0, 3.6], to: [1.7, 1.4, 2.7], look: [0, 2.3, 0], whip: 1 },
  // 17: the heap keeps growing — wider, the Alm behind
  { at: T.gramm, orbit: { c: [0, 2.2, 0], r: 3.6, y: 3.0, a0: 0.6, a1: -0.3 } },
  // 18: CTA — the hand shakes again: Schoko or Vanille?
  { at: T.schoko, from: [-1.4, 2.0, 3.0], to: [-0.8, 1.7, 2.3], look: [0, 1.4, 0] },
];

// ---------------------------------------------------------------- labels (3, one at a time)
export const LABELS = [
  { text: "Molke", at: T.molke, until: T.schweine, pos: [-5.0, 1.88, -7.2], side: 1 },
  {
    text: "Eiweiß",
    at: T.eiweiss + 0.4,
    until: T.perlenkette + 0.6,
    pos: [-1.1, 3.6, 0.1],
    side: -1,
  },
  { text: "Muskelfaser", at: T.risse, until: T.flicken, pos: [4.2, 1.55, 1.9], side: -1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "zoom", at: 0.55, amount: 0.3 },
  { kind: "shake", at: 0.0, dur: 0.5, amp: 0.5 },
  { kind: "shake", at: T.pinkelst + 0.3, dur: 0.4, amp: 0.5 },
  { kind: "zoom", at: T.molke, amount: 0.25 },
  { kind: "zoom", at: T.schweine + 0.3, amount: 0.3 },
  { kind: "flash", at: T.zerschneidet + 0.1 },
  { kind: "slowmo", at: T.zerschneidet + 0.05, until: T.blut, speed: 0.4 },
  { kind: "flash", at: T.zwanzig },
  { kind: "shake", at: T.risse, dur: 0.45, amp: 0.7 },
  { kind: "flash", at: T.dicker },
  { kind: "zoom", at: T.dicker, amount: 0.3 },
  { kind: "shake", at: T.klo + 0.25, dur: 0.5, amp: 0.8 },
  { kind: "zoom", at: T.fakt + 0.2, amount: 0.3 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "shaker", at: 0.0, db: -6 }, // frame 0: the topic's own sound
  { s: "muenzen", at: T.pinkelst + 0.15, db: -10 },
  { s: "zisch", at: T.kessel, dur: 1.6, db: -20 }, // the kettle steams
  { s: "pop", at: T.kaese + 0.1 },
  { s: "boing", at: T.schweine + 0.35, db: -12 },
  { s: "rauschen", at: T.pulver - 0.1, dur: 1.0, db: -20 }, // powder pouring
  { s: "pop", at: T.nur1 + 0.1 },
  { s: "klack", at: T.zerschneidet + 0.08, db: -6 }, // scissors snap
  { s: "rauschen", at: T.blut, dur: 1.4, db: -22 },
  { s: "klack", at: T.training + 0.45, db: -10 }, // dumbbell rep
  { s: "klack", at: T.training + 1.25, db: -10 },
  { s: "klack", at: T.klo + 0.25, db: -4 }, // the door slams
  { s: "spuelung", at: T.klo + 0.35, db: -9 },
  { s: "rauschen", at: T.fakt + 0.1, dur: 1.4, db: -20 }, // powder overflowing
  { s: "shaker", at: T.schoko, db: -10 },
];
