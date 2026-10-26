// Beats of #37 "Was passiert, wenn du einen Kaugummi verschluckst?" — every
// time-keyed decision as plain data (scene.js + scripts/build-sfx.mjs).
import { W, END } from "./timing.js";

// ---------------------------------------------------------------- beats
export const T = {
  was: W("Was"),
  kaugummi1: W("Kaugummi", 1),
  lachst: W("lachst"),
  schluck: W("schluck"),
  weg: W("weg"),
  sieben1: W("sieben", 1),
  fest: W("fest"),
  rutscht: W("rutscht"),
  plumpst: W("plumpst"),
  saeure: W("Säure"),
  zitrone: W("Zitronensaft"),
  zerlegt: W("zerlegt"),
  schnitzel: W("Schnitzel"),
  kaugummi2: W("Kaugummi", 2),
  zaehne: W("Zähne"),
  folg: W("Folg"),
  zucker: W("Zucker"),
  minze: W("Minze"),
  uebrig: W("Übrig"),
  kern1: W("Kern", 1),
  unzer: W("unzerstörbar"),
  kreist: W("kreist"),
  essen: W("Essen"),
  ernicht: W("nicht", 1),
  rate: W("Rate"),
  kunststoff: W("Kunststoff"),
  holzleim: W("Holzleim"),
  appetit: W("Appetit"),
  doch: W("Doch"),
  mahlzeiten: W("Mahlzeiten"),
  putzwelle: W("Putzwelle"),
  schiebt: W("schiebt"),
  nichts: W("Nichts"),
  wandert: W("wandert"),
  darm: W("Darm"),
  staendig: W("ständig"),
  kinder: W("Kinder"),
  verstopfen: W("verstopfen"),
  darum: W("Darum"),
  sieben2: W("sieben", 2),
  tagen: W("Tagen"),
  normal: W("normal"),
  klo: W("Klo"),
  fakt: W("Übrigens"),
  erbgut: W("Erbgut"),
  hast: W("Hast"),
  end: END,
};

// ---------------------------------------------------------------- shots
// Person on the bench at the origin, facing +z. Head ≈ y 3.75, mouth ≈ y 3.55,
// stomach ≈ (0.28, 2.05), gut y 1.0–1.8. Analogy spots on the bench: glue
// bottle left (x −1.35), calendar right (x 1.35); Steinzeit-Kaugummi at
// (−4.6, 2.2); WC booth at (8.4, −6.2).
export const shots = [
  // 0: frame 0 = the act, big: laughing face, hand pushes the pink gum in
  { at: 0, from: [0.9, 3.85, 2.4], to: [0.55, 3.75, 1.95], look: [0, 3.62, 0.3], zoom: 1.0 },
  // 1.25: the gulp — face + throat, 3/4 front
  {
    at: 1.25,
    from: [1.3, 3.45, 2.5],
    to: [1.05, 3.35, 2.1],
    look: [0, 3.3, 0.2],
    zoom: 1.0,
    whip: 1,
  },
  // 2.6: who it is — person on the bench in the Prater, wheel behind
  { at: 2.6, from: [3.4, 2.6, 7.6], to: [2.6, 2.4, 6.2], look: [0, 2.3, 0] },
  { at: T.lachst, from: [-1.0, 3.9, 2.5], to: [-0.75, 3.8, 2.0], look: [0, 3.6, 0.2], zoom: 1.0 },
  { at: T.schluck, from: [0.5, 3.6, 2.5], to: [0.4, 3.5, 2.15], look: [0, 3.4, 0.2], zoom: 1.0 },
  // calendar "7 JAHRE?"
  { at: T.sieben1, from: [2.9, 1.9, 3.0], to: [2.4, 1.7, 2.4], look: [1.35, 1.35, 0.2], zoom: 1.1 },
  // x-ray: the gum slides down
  { at: T.rutscht, from: [0.3, 3.0, 2.6], to: [0.3, 2.8, 2.2], look: [0.05, 2.5, 0.1] },
  { at: T.plumpst, from: [0.9, 2.3, 1.6], to: [0.75, 2.2, 1.35], look: [0.3, 1.94, 0.1], whip: -1 },
  { at: T.zitrone, from: [1.6, 2.6, 2.0], to: [1.4, 2.5, 1.7], look: [0.7, 2.15, 0.4], zoom: 1.5 },
  {
    at: T.schnitzel,
    from: [-0.4, 2.2, 1.6],
    to: [-0.25, 2.1, 1.35],
    look: [0.3, 1.9, 0.1],
    zoom: 1.5,
  },
  // money shot 2: the acid bounces off
  {
    at: T.zaehne - 0.4,
    orbit: { c: [0.3, 1.9, 0.1], r: 1.5, y: 2.2, a0: 0.9, a1: -0.4 },
    zoom: 1.0,
  },
  // follow line: medium wide, calm
  { at: T.folg, from: [-3.2, 2.9, 6.4], to: [-2.6, 2.7, 5.4], look: [0, 2.2, 0] },
  // sugar + mint fly out (macro)
  {
    at: T.zucker,
    from: [0.75, 2.1, 1.55],
    to: [0.65, 2.05, 1.35],
    look: [0.35, 1.88, 0.15],
    zoom: 1.0,
  },
  { at: T.kern1, orbit: { c: [0.3, 1.9, 0.12], r: 1.35, y: 2.1, a0: -0.6, a1: 0.5 }, zoom: 1.0 },
  {
    at: T.essen,
    from: [0.25, 2.35, 2.5],
    to: [0.15, 2.25, 2.15],
    look: [0.0, 1.8, 0.1],
    zoom: 1.2,
  },
  {
    at: T.ernicht,
    from: [0.85, 2.1, 1.95],
    to: [0.7, 2.05, 1.7],
    look: [0.3, 1.88, 0.12],
    zoom: 1.0,
  },
  // mid twist: guess — wide, then the glue bottle on the bench
  { at: T.rate, from: [-4.4, 3.4, 7.4], to: [-3.4, 3.0, 6.0], look: [-0.2, 2.0, 0] },
  {
    at: T.kunststoff,
    from: [-2.6, 1.8, 2.8],
    to: [-2.2, 1.65, 2.3],
    look: [-1.1, 1.4, 0.2],
    zoom: 1.1,
    whip: 1,
  },
  // the cleaning wave
  { at: T.doch, from: [0.0, 2.4, 2.4], to: [0.1, 2.3, 2.1], look: [0.1, 1.85, 0.1] },
  {
    at: T.putzwelle,
    orbit: { c: [0.15, 1.85, 0.1], r: 1.6, y: 2.15, a0: 0.7, a1: -0.3 },
    zoom: 1.0,
    whip: -1,
  },
  {
    at: T.nichts,
    from: [-0.6, 1.9, 1.45],
    to: [-0.5, 1.85, 1.25],
    look: [-0.15, 1.72, 0.15],
    zoom: 1.0,
  },
  // money shot 3: the slide through the gut
  {
    at: T.wandert,
    from: [0.5, 2.55, 2.9],
    to: [-0.25, 2.45, 2.55],
    look: [0, 1.5, 0.1],
    zoom: 1.0,
  },
  // warning: too many
  { at: T.staendig, from: [0.3, 2.5, 2.2], to: [0.2, 2.35, 1.9], look: [0.2, 1.85, 0.1] },
  // payoff: the calendar flips, x-ray off
  { at: T.darum, from: [3.0, 2.0, 3.4], to: [2.6, 1.8, 2.8], look: [1.1, 1.5, 0.2], zoom: 1.2 },
  {
    at: T.normal,
    from: [6.6, 2.0, -1.4],
    to: [6.9, 1.8, -2.2],
    look: [8.4, 1.3, -6.2],
    zoom: 1.0,
    whip: 1,
  },
  // Übrigens: the Stone-Age gum with its DNA
  { at: T.fakt, from: [-3.2, 2.9, 4.6], to: [-3.7, 2.7, 3.9], look: [-4.6, 2.3, 1.8], zoom: 1.1 },
  // CTA: drone pull-back over the Prater, the wheel behind
  {
    at: T.hast,
    from: [2.4, 3.2, 6.5],
    to: [9.5, 8.5, 18],
    look: [0, 2.4, 0],
    lookTo: [-3, 5, -10],
  },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Speiseröhre", at: T.rutscht + 0.2, until: T.plumpst, pos: [0.02, 2.75, 0.06], side: -1 },
  { text: "Magen", at: T.plumpst + 0.25, until: T.zitrone, pos: [0.55, 2.1, 0.1], side: 1 },
  { text: "Magensäure", at: T.saeure, until: T.zitrone, pos: [0.15, 1.9, 0.2], side: -1 },
  { text: "Kern", at: T.kern1 + 0.1, until: T.kreist + 0.4, pos: "gum", side: 1 },
  { text: "Holzleim", at: T.holzleim, until: T.appetit + 0.6, pos: [-1.35, 1.55, 0.2], side: -1 },
  { text: "Putzwelle", at: T.putzwelle + 0.15, until: T.nichts, pos: "wave", side: -1 },
  { text: "Darm", at: T.darm, until: T.staendig, pos: [-0.3, 1.45, 0.2], side: -1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "flash", at: 0.32 }, // the bubble bursts on frame 0
  { kind: "zoom", at: 0.9, amount: 0.3 }, // gulp
  { kind: "shake", at: T.schluck + 0.1, dur: 0.35, amp: 0.5 },
  { kind: "shake", at: T.plumpst + 0.25, dur: 0.45, amp: 0.8 }, // plop into the stomach
  { kind: "slowmo", at: T.zaehne - 0.4, until: T.folg, speed: 0.35 }, // acid bounces off
  { kind: "flash", at: T.zaehne },
  { kind: "zoom", at: T.ernicht, amount: 0.35 },
  { kind: "zoom", at: T.kunststoff, amount: 0.3 },
  { kind: "shake", at: T.putzwelle + 0.2, dur: 0.5, amp: 0.6 },
  { kind: "slowmo", at: T.wandert, until: T.staendig, speed: 0.55 },
  { kind: "flash", at: T.tagen },
  { kind: "zoom", at: T.klo, amount: 0.25 },
  { kind: "flash", at: T.erbgut },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "pop", at: 0.32, db: -6 }, // bubble bursts
  { s: "schluck", at: 0.9, db: -6 }, // gulp on frame 0's act
  { s: "schluck", at: T.schluck + 0.05, db: -8 },
  { s: "pop", at: T.sieben1 + 0.1 }, // calendar pops in
  { s: "platsch", at: T.plumpst + 0.2, db: -8 },
  { s: "pop", at: T.zitrone + 0.1 },
  { s: "boing", at: T.zaehne + 0.05, db: -10 },
  { s: "wow", at: T.zucker + 0.1, db: -14 },
  { s: "pop", at: T.kunststoff + 0.1 },
  { s: "rauschen", at: T.putzwelle, dur: 1.6, db: -16 },
  { s: "whoosh", at: T.wandert + 0.3, db: -12 },
  { s: "piep", at: T.staendig + 0.6, dur: 1.2, db: -20 },
  { s: "klack", at: T.normal + 0.35, db: -10 }, // WC door shuts
  { s: "spuelung", at: T.klo + 0.2, db: -10 },
  { s: "pop", at: T.fakt + 0.15 },
];
