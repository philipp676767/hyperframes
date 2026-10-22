// Noise-Cancelling-Kopfhörer: every time-keyed decision of the video as plain
// data, so scene.js (picture) and scripts/build-sfx.mjs (sound) read the same
// numbers. Keep this file free of three.js / DOM: it is imported by node too.
import { W } from "./timing.js";

// ---------------------------------------------------------------- beats
export const T = {
  extra: W("extra"),
  still1: W("still", 1),
  bauen: W("bauen"),
  welle: W("Welle", 1),
  aussen: W("Außen"),
  mikrofon: W("Mikrofon"),
  krach: W("Krach"),
  trick: W("Trick"),
  chip: W("Chip"),
  aefft: W("äfft"),
  spiegel: W("spiegelverkehrt"),
  berg1: W("Berg", 1),
  antischall: W("Antischall"),
  lautsprecher: W("Lautsprecher"),
  berg2: W("Berg", 2),
  nul: W("null"),
  zack: W("Zack"),
  aber: W("Aber"),
  flugzeug: W("Flugzeug"),
  stimmen: W("Stimmen", 1),
  polster: W("Polster"),
  laerm4: W("Lärm", 4),
  schau: W("Schau"),
  gerade: W("gerade"),
  uebrigens: W("Übrigens"),
  piloten: W("Piloten"),
};

// ---------------------------------------------------------------- shots
// Head (mannequin) at the origin facing +z, right ear cup at x ≈ 0.9,
// y ≈ 1.75. Oscilloscope screen at x = -4.4, z = 1.2. Bus on the road behind.
export const SCREEN = [-4.4, 2.3, 1.2];
export const shots = [
  // hook: the red street noise runs into the right ear cup and goes flat
  { at: 0, from: [2.6, 2.3, 2.4], to: [2.1, 2.0, 2.0], look: [0.6, 1.7, -0.6] },
  { at: T.extra, from: [4.7, 2.4, 1.0], to: [4.3, 2.3, 1.2], look: [0.9, 1.8, -0.6], zoom: 1.35 },
  { at: T.bauen, from: [2.6, 2.6, 3.4], to: [2.2, 2.3, 2.9], look: [0.4, 1.6, -0.8] },
  // the wave from the bus
  { at: T.welle, from: [6.2, 2.4, -1.4], to: [5.8, 2.2, -0.9], look: [2.6, 1.7, -3.0], zoom: 1.0 },
  { at: T.aussen, from: [2.2, 2.3, 2.6], to: [1.8, 2.1, 2.3], look: [0.3, 1.8, 0] },
  {
    at: T.mikrofon,
    from: [1.75, 2.05, 0.75],
    to: [1.55, 2.0, 0.6],
    look: [1.05, 1.9, 0.12],
    zoom: 1.6,
  },
  { at: T.krach, from: [4.0, 2.2, 0.8], to: [3.7, 2.1, 1.1], look: [1.4, 1.85, -0.5], zoom: 1.0 },
  // inside: chip, then the oscilloscope
  { at: T.trick, from: [1.8, 2.0, 1.4], to: [1.55, 1.85, 1.15], look: [0.9, 1.7, 0], zoom: 1.6 },
  { at: T.aefft, from: [-3.0, 2.5, 4.6], to: [-3.4, 2.4, 4.1], look: SCREEN },
  { at: T.berg1, from: [-3.6, 2.4, 3.9], to: [-4.0, 2.35, 3.8], look: SCREEN, zoom: 1.6 },
  { at: T.antischall, from: [-2.7, 2.0, 3.8], to: [-3.1, 2.2, 3.9], look: SCREEN },
  // the speaker plays it, sum = 0
  {
    at: T.lautsprecher,
    from: [1.7, 1.6, 1.3],
    to: [1.45, 1.7, 1.05],
    look: [0.8, 1.7, 0],
    zoom: 1.5,
  },
  { at: T.berg2, from: [-4.8, 2.3, 4.2], to: [-4.2, 2.3, 3.9], look: SCREEN },
  { at: T.zack, from: [4.5, 2.5, 1.4], to: [4.1, 2.3, 1.5], look: [0.9, 1.8, -0.5], zoom: 1.35 },
  // low hum (plane) vs. voices (cushion)
  {
    at: T.aber,
    from: [2.6, 1.5, 4.6],
    to: [2.4, 1.6, 4.3],
    look: [0.4, 3.4, -2.0],
    lookTo: [1.0, 3.6, -2.0],
    zoom: 1.0,
  },
  { at: T.stimmen, from: [1.4, 2.0, 1.9], to: [1.2, 1.9, 1.6], look: [0.75, 1.75, 0.2], zoom: 1.9 },
  // whole system x-ray orbit, then outro
  { at: T.laerm4, orbit: { c: [0, 1.7, 0], r: 2.4, y: 2.3, a0: 0.9, a1: -0.4 } },
  { at: T.schau, from: [0.6, 2.0, 3.2], to: [0.3, 1.9, 2.8], look: [0, 1.6, 0] },
  {
    at: T.gerade,
    from: [2.5, 2.6, 4.8],
    to: [8.5, 7.8, 14],
    look: [0, 1.5, 0],
    lookTo: [0, 1.0, 0],
  },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Mikrofon", at: T.mikrofon, until: T.trick - 0.2, pos: [1.07, 1.92, 0.14], side: 1 },
  { text: "Chip", at: T.chip, until: T.aefft, pos: [0.92, 1.58, 0.1], side: 1 },
  { text: "Antischall", at: T.antischall, until: T.lautsprecher, pos: [-3.91, 2.2, 1.08], side: 1 },
  { text: "Lautsprecher", at: T.lautsprecher, until: T.berg2, pos: [0.76, 1.6, 0.18], side: 1 },
  { text: "Polster", at: T.polster, until: T.laerm4, pos: [0.66, 1.5, 0.3], side: 1 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "brumm", at: 0, dur: T.welle + 2, db: -24 }, // the bus idles behind the stage
  { s: "pop", at: T.aussen + 0.1 }, // headphones pop onto the head
  { s: "click", at: T.chip + 0.3 },
  { s: "surr", at: T.aefft, dur: T.antischall - T.aefft + 0.4, db: -24 }, // chip computing
  { s: "boing", at: T.spiegel + 0.2, db: -16 }, // the wave flips
  { s: "rauschen", at: T.aber - 0.3, dur: 2.8, db: -20 }, // the plane passes
  { s: "pop", at: T.stimmen + 0.6, db: -18 },
  { s: "pop", at: T.stimmen + 1.45, db: -18 },
];
