// #45 "Mentos + Cola" (Format B) — every time-keyed decision as plain data.
// Read by scene.js (picture) and scripts/build-sfx.mjs (sound).
import { W } from "./timing.js";

export const T = {
  // hook
  hinterher: W("hinterher"),
  magen1: W("Magen", 1),
  // Folge 1
  schulhof: W("Schulhof"),
  gestorben: W("gestorben"),
  mentos2: W("Mentos", 2),
  flasche1: W("Flasche", 1),
  schiesst: W("schießt"),
  meterhoch: W("meterhoch"),
  schwappt: W("schwappt"),
  bauch: W("Bauch"),
  // Folge 2
  denn: W("Denn"),
  fussball: W("Fußball"),
  passt: W("passt"),
  startschuss: W("Startschuss"),
  geschluckt: W("geschluckt"),
  // mid twist
  rate: W("Rate"),
  chemie: W("Chemie"),
  falsch: W("Falsch"),
  millionen: W("Millionen"),
  krater: W("Krater"),
  // Folge 3
  rau: W("rau"),
  mondlandschaft: W("Mondlandschaft"),
  loch: W("Loch"),
  blaeschen: W("Bläschen"),
  bei: W("Bei"),
  light: W("light"),
  heftigsten: W("heftigsten"),
  // payoff
  dir: W("dir"),
  maerchen: W("Märchen"),
  trinken: W("Trinken"),
  zischt: W("zischt"),
  dehnt: W("dehnt"),
  ruelpst: W("rülpst"),
  heil: W("heil"),
  fakt: W("Übrigens"),
  weltrekord: W("Weltrekord"),
  hast: W("Hast", 2),
  folge: W("Folge"),
};

// ---------------------------------------------------------------- shots
// table + bottle stand at x ≈ 2.3; the person sits at the origin (head y ≈ 4);
// ball set at x = -5; giant Mentos (macro) at x = 6.5, y = 2.4, z = 2.6.
export const TABLE = [2.35, 0, 0.55];
export const BALL = [-5.0, 0, 2.2];
export const MAC = [6.8, -40, 2.8]; // deep under the plaza: inside its own cola world
const mac = (x, y, z) => [MAC[0] + x, MAC[1] + y, MAC[2] + z];
export const shots = [
  // 0: frame 0 = the cover: low angle, the jet shoots past the person into the night sky
  {
    at: 0,
    from: [3.4, 0.9, 6.6],
    to: [2.9, 1.1, 5.4],
    look: [1.4, 3.2, 0.3],
    lookTo: [1.5, 3.6, 0.3],
    zoom: 1.0,
    tilt: 0.25,
  },
  // the person drinks
  { at: T.hinterher, from: [3.0, 4.1, 2.2], to: [2.6, 4.0, 1.9], look: [0.2, 3.8, 0.5], zoom: 1.0 },
  // "Magen?" — belly bulges
  { at: T.magen1, from: [-3.4, 2.9, 4.2], to: [-2.9, 2.7, 3.6], look: [0, 2.5, 0.3], zoom: 1.0 },
  // the schoolyard myth: wide over the forecourt
  { at: T.schulhof, from: [-6.5, 5.5, 11], to: [-5.2, 4.6, 9.4], look: [0.6, 2.2, -1.5] },
  // a Mentos drops into the bottle
  { at: T.mentos2, from: [3.6, 3.2, 2.6], to: [3.2, 3.0, 2.2], look: [2.35, 2.5, 0.55], zoom: 1.0 },
  // money shot 2: slow-motion fountain from the ground
  {
    at: T.schiesst,
    from: [4.4, 0.6, 4.4],
    to: [3.8, 0.8, 3.6],
    look: [2.35, 4.2, 0.55],
    lookTo: [2.35, 5.6, 0.55],
    zoom: 1.0,
    tilt: 0.2,
    whip: 1,
  },
  // x-ray: cola sloshes in the stomach
  { at: T.schwappt, from: [1.8, 2.8, 4.0], to: [1.3, 2.6, 3.4], look: [0.2, 2.1, 0.1], zoom: 1.0 },
  // ball set: more gas than fits into a football
  { at: T.denn, from: [-3.6, 2.3, 7.8], to: [-3.9, 2.1, 7.0], look: [-4.9, 1.2, 2.2], zoom: 1.0 },
  // Startschuss: close on the throat, the Mentos goes down
  {
    at: T.startschuss,
    from: [0.9, 4.0, 2.4],
    to: [0.7, 3.6, 2.1],
    look: [0, 3.4, 0.1],
    lookTo: [0.15, 2.4, 0.1],
    zoom: 1.0,
  },
  // Rate mal: front x-ray of the whole torso
  { at: T.rate, from: [0, 2.8, 4.6], to: [0, 2.7, 4.0], look: [0, 2.4, 0], zoom: 1.0 },
  // crash into the giant Mentos (whip)
  {
    at: T.millionen,
    from: mac(0, 1.0, 7.4),
    to: mac(0, 0.4, 5.0),
    look: mac(0, 0, 0),
    zoom: 1.0,
    whip: -1,
  },
  // Mondlandschaft: skim low over the craters
  { at: T.rau, orbit: { c: mac(0, 0, 0), r: 3.4, y: MAC[1] + 1.6, a0: 0.8, a1: 0.1 }, zoom: 1.0 },
  // Bläschen: bubbles out of every crater, a bit wider
  { at: T.loch, from: mac(1.8, 0.8, 4.6), to: mac(1.2, 0.6, 4.0), look: mac(0, 0.3, 0), zoom: 1.0 },
  // the duel: light vs. normal
  {
    at: T.bei,
    from: [4.8, 1.2, 6.2],
    to: [4.4, 1.3, 5.4],
    look: [2.6, 3.6, 0.55],
    lookTo: [2.6, 4.6, 0.55],
    zoom: 1.0,
    tilt: 0.2,
  },
  // payoff: x-ray again
  { at: T.dir, from: [-1.6, 3.0, 4.2], to: [-1.2, 2.8, 3.6], look: [0, 2.4, 0], zoom: 1.0 },
  // drinking: gas fizzes out at the mouth
  { at: T.trinken, from: [3.0, 4.3, 1.4], to: [2.7, 4.1, 1.7], look: [0.2, 3.85, 0.5], zoom: 1.0 },
  // the stomach stretches, the burp goes up
  { at: T.dehnt, from: [0.4, 3.1, 4.4], to: [0.3, 3.2, 3.8], look: [0.1, 2.9, 0.1], zoom: 1.0 },
  // heil: solid front, a grin
  { at: T.heil, from: [1.2, 3.2, 6.4], to: [0.8, 3.0, 5.6], look: [0.5, 2.4, 0] },
  // Übrigens: drone up over a forecourt full of fountains
  {
    at: T.fakt,
    from: [3, 4, 9],
    to: [10, 15, 26],
    look: [0, 2, -1],
    lookTo: [0, 1, -3],
    tilt: 0.6,
  },
  // CTA: the bottle and the person, one last jet
  { at: T.hast, from: [4.6, 2.2, 7.6], to: [4.0, 2.4, 6.6], look: [1.2, 2.6, 0.2] },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Cola light", at: T.mentos2 + 0.1, until: T.schiesst, pos: [2.35, 2.1, 0.75], side: 1 },
  { text: "Magen", at: T.schwappt + 0.2, until: T.denn, pos: [0.3, 2.0, 0.3], side: -1 },
  { text: "Fußball", at: T.fussball, until: T.startschuss, pos: [-4.35, 0.75, 2.4], side: 1 },
  { text: "Krater", at: T.krater, until: T.rau, pos: "crater", side: -1 },
  { text: "normale Cola", at: T.light + 0.3, until: T.dir, pos: [3.05, 2.5, 0.55], side: 1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "shake", at: 0.3, dur: 0.5, amp: 0.8 }, // the jet on frame 0
  { kind: "zoom", at: T.magen1, amount: 0.35 }, // the belly
  { kind: "slowmo", at: T.schiesst + 0.1, until: T.schwappt, speed: 0.35 }, // money shot 2
  { kind: "shake", at: T.geschluckt + 0.9, dur: 0.4, amp: 0.6 }, // the Mentos lands in the cola
  { kind: "zoom", at: T.millionen, amount: 0.4 }, // crash into the Mentos
  { kind: "flash", at: T.blaeschen + 0.1 }, // all craters fire at once
  { kind: "flash", at: T.light + 0.15 }, // the duel
  { kind: "shake", at: T.ruelpst + 0.15, dur: 0.45, amp: 0.7 }, // the burp
  { kind: "zoom", at: T.heil, amount: 0.25 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "zisch", at: 0, dur: 1.6, db: -10 }, // frame 0: the fountain roars
  { s: "pfft", at: T.hinterher - 0.15, db: -9 }, // the small bottle opens
  { s: "prickeln", at: T.hinterher + 0.1, db: -14 },
  { s: "boing", at: T.magen1 + 0.05, db: -12 }, // the belly bulges
  { s: "klack", at: T.mentos2 + 0.55, db: -12 }, // Mentos hits the bottle neck
  { s: "zisch", at: T.schiesst, dur: 2.2, db: -11 },
  { s: "prickeln", at: T.schwappt + 0.2, db: -16 },
  { s: "pfft", at: T.passt - 0.2, db: -10 }, // the cap pops, the gas cloud grows
  { s: "pop", at: T.geschluckt + 0.9, db: -8 }, // plop into the stomach
  { s: "prickeln", at: T.blaeschen, db: -11 },
  { s: "zisch", at: T.light, dur: 2.0, db: -10 },
  { s: "prickeln", at: T.zischt - 0.1, db: -13 },
  { s: "ruelps", at: T.ruelpst + 0.1, db: -6 },
  { s: "zisch", at: T.fakt + 0.4, dur: 2.6, db: -14 }, // the forecourt fountains
  { s: "zisch", at: T.hast + 0.5, dur: 1.6, db: -16 },
];
