// Beats of #39 "Was passiert, wenn du im Flugzeug auf die Spültaste drückst?"
// — every time-keyed decision as plain data (scene.js + scripts/build-sfx.mjs).
import { W, END } from "./timing.js";

// ---------------------------------------------------------------- beats
export const T = {
  was: W("Was"),
  spueltaste1: W("Spültaste", 1),
  druecken: W("drückst", 2),
  bruellt: W("brüllt"),
  duesenjet: W("Düsenjet"),
  kein: W("kein"),
  hause1: W("Hause", 1),
  eimer: W("Eimer"),
  glas: W("Glas"),
  schwer: W("schwer"),
  aber: W("Aber"),
  weg: W("weg"),
  folg: W("Folg"),
  unten: W("Unten"),
  klappe: W("Klappe"),
  dahinter: W("Dahinter"),
  luft1: W("Luft", 1),
  kabinenluft: W("Kabinenluft"),
  reisst: W("reißt"),
  unterdruck: W("Unterdruck"),
  rate: W("Rate"),
  schiesst: W("schießt"),
  zahl: W("480"),
  schneller: W("Schneller"),
  formel: W("Formel-1-Auto"),
  dein1: W("Dein", 1),
  spaziergang: W("Spaziergang"),
  wer: W("wer"),
  himmel: W("Himmel"),
  draussen: W("Draußen"),
  duenn: W("dünn"),
  staubsauger: W("Riesen-Staubsauger"),
  boden: W("Boden"),
  pumpe: W("Pumpe"),
  landet: W("landet"),
  hinten: W("hinten"),
  tank: W("Tank"),
  nichts: W("Nichts"),
  landung: W("Landung"),
  fakt: W("Übrigens"),
  leitung: W("Leitung"),
  friert: W("friert"),
  blaues: W("blaues"),
  runter: W("runter"),
  ehrlich: W("Ehrlich"),
  end: END,
};

// ---------------------------------------------------------------- layout
// The airliner flies towards −x, cabin floor at y = 0, fuselage axis y = 1.1,
// radius 2.4. The lavatory sits at x = 0 on the back side (z −1.75…0.45),
// toilet bowl at (0, 0.45, −1.1), FLUSH button at (0.34, 1.0, −1.72).
// Under the floor the waste pipe runs at y ≈ −0.6 to the tank at the tail
// (x 12…14.6). Trolley with bucket + glass in the aisle at x −3; home toilet
// at x −5.6; F1 car races along the aisle; vent outlet under the belly at
// x 14.4; blue ice under the belly at x 9.
export const LAV = [0, 0.45, -1.1];
export const BUTTON = [0.34, 1.0, -1.72];
export const TANK = [13.3, -0.6, -0.9];
export const VENT = [14.4, -1.28, -0.9];
export const TROLLEY = [-3.0, 0, 0.05];
export const HOME = [-5.6, 0, 0.1];
export const ICE = [9.0, -1.3, 0.6];

// ---------------------------------------------------------------- shots
export const shots = [
  // 0: frame 0 = the act: the hand hits FLUSH, the bowl roars and sucks empty
  { at: 0, from: [-0.4, 1.3, 0.55], to: [-0.3, 1.22, 0.4], look: [0.12, 0.6, -1.2], zoom: 1.0 },
  // 1.2: where: the cut-open airliner over the moonlit clouds
  { at: 1.2, from: [-11, 6.5, 14], to: [-9, 5.5, 11.5], look: [0, 0.8, -0.5], whip: 1 },
  // the button, macro
  {
    at: T.spueltaste1 - 0.1,
    from: [-0.2, 1.4, -0.85],
    to: [-0.12, 1.35, -0.95],
    look: [0.3, 1.0, -1.72],
    zoom: 0.9,
  },
  // the roar: low inside the booth looking at the bowl
  {
    at: T.bruellt - 0.05,
    from: [-0.35, 0.75, 0.2],
    to: [-0.2, 0.7, 0.05],
    look: [0, 0.48, -1.1],
    zoom: 0.95,
  },
  // hardly any water: top-down into the bowl
  {
    at: T.kein - 0.25,
    from: [0.05, 1.45, -0.6],
    to: [0.03, 1.38, -0.72],
    look: [0, 0.3, -1.1],
    zoom: 0.9,
  },
  // Folge 1: the bucket on the trolley
  {
    at: T.hause1,
    from: [-1.6, 1.6, 0.6],
    to: [-1.9, 1.5, 0.5],
    look: [-3.0, 1.05, 0.05],
    zoom: 1.0,
  },
  {
    at: T.glas - 0.2,
    from: [-2.0, 1.35, 0.5],
    to: [-2.15, 1.3, 0.4],
    look: [-2.76, 1.1, 0.05],
    zoom: 0.9,
    whip: 1,
  },
  // too heavy: outside, the plane sags
  { at: T.schwer - 0.6, from: [-16, 3.0, 22], to: [-13, 2.0, 19], look: [0, 0.0, 0] },
  // money shot 2: the flush in slow motion, orbit around the bowl inside the booth
  { at: T.aber, orbit: { c: [0, 0.4, -1.1], r: 0.75, y: 0.95, a0: 0.5, a1: -0.5 }, zoom: 1.0 },
  // follow line: the cut-open plane, calm
  { at: T.folg, from: [-10, 5.5, 12.5], to: [-8.5, 4.8, 11], look: [1, 0.6, -0.8] },
  // Folge 2 (cut-away): down into the bowl, the flap opens
  {
    at: T.unten,
    from: [0.28, 0.98, -0.5],
    to: [0.24, 0.92, -0.6],
    look: [0, 0.22, -1.1],
    zoom: 1.0,
  },
  {
    at: T.klappe - 0.1,
    from: [0.95, 0.35, -0.45],
    to: [0.8, 0.3, -0.55],
    look: [0, 0.18, -1.1],
    zoom: 1.0,
  },
  // the pipe under the floor (camera in the hold)
  {
    at: T.dahinter,
    from: [0.6, -0.4, 1.3],
    to: [1.4, -0.42, 1.25],
    look: [1.2, -0.6, -0.9],
    zoom: 1.0,
  },
  {
    at: T.kabinenluft,
    orbit: { c: [0.1, 0.1, -1.1], r: 1.6, y: 1.1, a0: 0.55, a1: 0.05 },
    zoom: 1.0,
    whip: -1,
  },
  {
    at: T.unterdruck,
    from: [0.9, -0.35, 1.3],
    to: [0.7, -0.38, 1.2],
    look: [0.15, -0.35, -1.05],
    zoom: 1.0,
  },
  // mid twist: guess the speed — the whole pipe from below the belly
  { at: T.rate, from: [5.5, -0.55, 11], to: [6.5, -0.6, 10], look: [6.5, -0.62, -0.9] },
  // 480: tracking the paper ball along the pipe through the hold
  {
    at: T.zahl - 0.15,
    from: [1.2, -0.42, 1.2],
    to: [10.2, -0.42, 1.2],
    look: [2.6, -0.62, -0.9],
    lookTo: [11.6, -0.62, -0.9],
    zoom: 1.0,
  },
  // F1 car in the aisle, chase cam
  {
    at: T.schneller,
    from: [-2.7, 0.42, 0.3],
    to: [6.0, 0.42, 0.3],
    look: [-0.8, 0.12, -0.1],
    lookTo: [8.2, 0.05, -0.3],
    zoom: 1.0,
  },
  // the home toilet with the snail
  {
    at: T.dein1,
    from: [-4.5, 0.95, 0.45],
    to: [-4.65, 0.9, 0.4],
    look: [-5.6, 0.45, 0.1],
    zoom: 1.0,
    whip: -1,
  },
  // Folge 3: who sucks? the sky — under the belly at the tail
  {
    at: T.wer,
    from: [15.8, -1.7, 5.6],
    to: [15.4, -1.6, 4.9],
    look: [14.4, -1.35, -0.9],
    zoom: 1.0,
  },
  {
    at: T.draussen,
    from: [10.5, -0.8, 12.5],
    to: [11.2, -1.0, 11.2],
    look: [12.5, -1.6, -0.5],
    zoom: 1.0,
  },
  {
    at: T.staubsauger,
    orbit: { c: [14.2, -1.1, -0.9], r: 3.2, y: -2.2, a0: 0.4, a1: 1.2 },
    zoom: 1.0,
    whip: 1,
  },
  {
    at: T.boden - 0.2,
    from: [12.0, -0.9, 3.1],
    to: [11.8, -0.85, 2.8],
    look: [11.0, -0.75, -0.3],
    zoom: 1.0,
  },
  // payoff: the tank at the back fills (from outside, through the x-ray shell)
  {
    at: T.landet,
    from: [11.0, -1.4, 4.4],
    to: [11.6, -1.2, 3.9],
    look: [13.3, -0.6, -0.9],
    zoom: 1.0,
  },
  {
    at: T.tank,
    orbit: { c: [13.3, -0.6, -0.9], r: 4.5, y: -1.0, a0: 0.5, a1: 0.1 },
    zoom: 1.0,
    whip: -1,
  },
  { at: T.nichts, from: [12, -5.5, 7], to: [12.5, -4.8, 6], look: [12.5, -1.3, -0.4] },
  // Übrigens: blue ice grows under the belly, then drops into the clouds
  {
    at: T.fakt,
    from: [10.3, -2.0, 2.6],
    to: [10.15, -1.95, 2.4],
    look: [9.0, -1.5, 0.6],
    zoom: 1.0,
  },
  {
    at: T.blaues,
    from: [10.6, -2.3, 3.4],
    to: [10.6, -4.4, 3.6],
    look: [9.0, -1.8, 0.6],
    lookTo: [9.0, -4.6, 0.6],
    zoom: 1.0,
  },
  // CTA: drone pull-back over the night flight, the moon behind
  { at: T.ehrlich, from: [4, 12, 24], to: [16, 18, 40], look: [0, 0.8, 0], lookTo: [-6, 3, -20] },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  {
    text: "Spültaste",
    at: T.spueltaste1,
    until: T.bruellt - 0.1,
    pos: [0.34, 1.0, -1.7],
    side: -1,
  },
  { text: "Klappe", at: T.klappe, until: T.dahinter, pos: [0, 0.22, -1.08], side: 1 },
  { text: "Rohr", at: T.dahinter + 0.25, until: T.kabinenluft, pos: [0.8, -0.6, -1.0], side: -1 },
  { text: "Unterdruck", at: T.unterdruck, until: T.rate, pos: [0.3, -0.5, -1.05], side: 1 },
  { text: "Formel 1", at: T.formel, until: T.dein1, pos: "car", side: -1 },
  { text: "dünne Luft", at: T.duenn, until: T.staubsauger, pos: [11.5, -3.2, 1.2], side: 1 },
  { text: "Pumpe", at: T.pumpe, until: T.landet, pos: [11.0, -0.75, -0.3], side: -1 },
  { text: "Tank", at: T.tank + 0.1, until: T.nichts, pos: [13.3, -0.1, -0.9], side: 1 },
  { text: "blaues Eis", at: T.blaues, until: T.runter + 0.6, pos: "ice", side: -1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "flash", at: 0.35 }, // the flush fires on frame 0
  { kind: "shake", at: 0.35, dur: 0.6, amp: 0.7 },
  { kind: "zoom", at: T.bruellt, amount: 0.3 },
  { kind: "shake", at: T.duesenjet, dur: 0.5, amp: 0.6 },
  { kind: "zoom", at: T.glas, amount: 0.35 },
  { kind: "shake", at: T.schwer, dur: 0.5, amp: 0.6 },
  { kind: "slowmo", at: T.aber, until: T.folg, speed: 0.35 }, // money shot 2
  { kind: "flash", at: T.weg },
  { kind: "zoom", at: T.klappe, amount: 0.3 },
  { kind: "shake", at: T.reisst, dur: 0.45, amp: 0.6 },
  { kind: "flash", at: T.zahl },
  { kind: "zoom", at: T.zahl, amount: 0.35 },
  { kind: "zoom", at: T.himmel, amount: 0.3 },
  { kind: "shake", at: T.staubsauger + 0.2, dur: 0.5, amp: 0.5 },
  { kind: "flash", at: T.tank },
  { kind: "zoom", at: T.blaues, amount: 0.3 },
  { kind: "shake", at: T.runter, dur: 0.4, amp: 0.5 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "click", at: 0.3, db: -4 }, // FLUSH pressed on frame 0
  { s: "vakuum", at: 0.33, db: -6 },
  { s: "click", at: T.druecken + 0.1, db: -8 },
  { s: "vakuum", at: T.bruellt, db: -8 },
  { s: "pop", at: T.hause1 + 0.15 }, // bucket on the trolley
  { s: "pop", at: T.glas + 0.05 },
  { s: "klack", at: T.schwer + 0.1, db: -10 },
  { s: "vakuum", at: T.aber + 0.4, db: -9 }, // slow-motion flush
  { s: "klack", at: T.klappe + 0.1, db: -8 }, // the flap opens
  { s: "rauschen", at: T.kabinenluft, dur: 1.6, db: -14 },
  { s: "pop", at: T.dein1 + 0.1 },
  { s: "rauschen", at: T.staubsauger, dur: 1.4, db: -16 },
  { s: "brumm", at: T.pumpe, dur: 2.2, db: -16 },
  { s: "pop", at: T.blaues - 0.2, db: -10 },
  { s: "klack", at: T.runter, db: -10 }, // the ice breaks off
];
