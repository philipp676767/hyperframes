// Beats of #93 "Handy gegen Klobrille" (format D, Duell): every time-keyed
// decision as plain data — read by scene.js (picture) and build-sfx.mjs (sound).
import { W } from "./timing.js";

export const T = {
  klobrille1: W("Klobrille", 1),
  was: W("Was"),
  klar: W("Klar"),
  sitzt: W("sitzt"),
  hintern: W("Hintern"),
  beim: W("Beim"),
  spruet: W("sprüht"),
  wolke: W("Wolke"),
  aber: W("Aber"),
  handy2: W("Handy", 2),
  in1: W("In", 1),
  halte: W("Haltestange"),
  neben: W("Neben"),
  haehnchen: W("Hähnchen"),
  jetzt: W("Jetzt"),
  klo1: W("Klo", 1),
  danach: W("Danach"),
  gesicht: W("Gesicht"),
  rate: W("Rate"),
  ueber: W("Über"),
  zahl: W("2600"),
  mal2: W("Mal", 2),
  unterschied: W("Unterschied"),
  klobrille3: W("Klobrille", 3),
  geputzt1: W("geputzt", 1),
  glatt: W("Glatt"),
  bakterien: W("Bakterien"),
  handy3: W("Handy", 3),
  warm: W("warm"),
  akku: W("Akku"),
  hautfett: W("Hautfett"),
  buffet: W("Buffet"),
  geputzt2: W("Geputzt", 2),
  nie1: W("nie", 1),
  uebrigens: W("Übrigens"),
  smartphone: W("Smartphone"),
  kot: W("Kot"),
  licht: W("Licht"),
  leuchtet: W("leuchtet"),
  klobrille4: W("Klobrille", 4),
  handy4: W("Handy", 4),
  ekliger: W("ekliger", 2),
  handy5: W("Handy", 5),
  nimmst: W("Nimmst"),
  folge: W("Folge"),
};

// ---------------------------------------------------------------- shots
// The phone lies on the ledge of the pre-wall at about [0.78, 3.69, -1.48];
// the seat centre is [0, 1.35, 0.27]. Mini-sets: U-Bahn at x = 70, kitchen
// at x = -70 (the `rel` offsets keep the numbers small).
const UB = { x: 70, y: 0, z: 0 };
const KU = { x: -70, y: 0, z: 0 };
export const shots = [
  // hook: your hand with the phone right over the seat, fast push-in
  { at: 0, from: [1.15, 2.6, 1.7], to: [0.8, 2.35, 1.25], look: [0.25, 1.7, 0.1], zoom: 1.0 },
  // "Klobrille": the seat, germs on it
  {
    at: T.klobrille1,
    from: [-0.8, 2.4, 1.4],
    to: [-0.5, 2.15, 1.0],
    look: [0, 1.35, -0.1],
    zoom: 1.0,
    whip: 1,
  },
  // "Was ist ekliger?": orbit around both rivals
  { at: T.was, orbit: { c: [0.15, 1.75, 0.1], r: 1.5, y: 2.5, a0: -0.7, a1: 0.5 }, zoom: 1.0 },
  // "Klar, die Klobrille": the whole toilet in its room, low and wide
  { at: T.klar, from: [2.8, 2.1, 6.2], to: [2.2, 2.3, 5.4], look: [0.2, 2.2, -0.4], zoom: 1.0 },
  // "sitzt … nackter Hintern": straight down onto the seat
  { at: T.sitzt, from: [0.15, 3.9, 0.9], to: [0.1, 3.6, 0.6], look: [0, 1.3, -0.12], zoom: 1.0 },
  // "Beim Spülen": your finger on the flush plate
  { at: T.beim, from: [1.5, 3.5, 1.3], to: [1.15, 3.3, 0.9], look: [0.05, 3.0, -1.1], zoom: 1.0 },
  // "sprüht eine Wolke": the plume, low side view (slowmo)
  { at: T.spruet, from: [2.6, 1.5, 3.4], to: [2.1, 1.7, 2.8], look: [0, 2.0, -0.2], zoom: 1.0 },
  // "Aber schau, wo dein Handy …": the phone on the ledge, plume drops on it
  {
    at: T.aber,
    from: [1.9, 4.3, 0.2],
    to: [1.4, 4.1, -0.3],
    look: [0.78, 3.7, -1.45],
    zoom: 1.0,
    whip: -1,
  },
  // U-Bahn
  {
    at: T.in1,
    rel: UB,
    from: [1.6, 4.0, 2.2],
    to: [1.1, 3.8, 1.6],
    look: [0.1, 3.5, 0.2],
    zoom: 1.0,
    whip: 1,
  },
  // kitchen
  {
    at: T.neben,
    rel: KU,
    from: [-1.0, 3.55, 2.1],
    to: [-0.75, 3.35, 1.8],
    look: [-0.25, 2.8, 0.45],
    zoom: 1.0,
    whip: -1,
  },
  // "Jetzt: mit dir auf dem Klo": your view down from the seat onto the phone
  {
    at: T.jetzt,
    from: [0.95, 2.85, 2.35],
    to: [0.7, 2.7, 2.0],
    look: [0.05, 1.9, 0.75],
    zoom: 1.0,
  },
  // "Danach an dein Gesicht": the phone comes at your face
  {
    at: T.danach,
    from: [0.75, 2.85, 2.35],
    to: [0.55, 3.05, 2.55],
    look: [0.05, 2.35, 1.3],
    zoom: 1.0,
  },
  // "Rate mal": phone in hand, the tap counter starts
  {
    at: T.rate,
    from: [1.5, 4.6, -0.35],
    to: [1.35, 4.45, -0.55],
    look: [0.8, 3.72, -1.42],
    zoom: 1.0,
  },
  // "Über 2600 Mal": crash in on the tapping finger
  {
    at: T.ueber,
    from: [1.1, 4.25, -0.85],
    to: [1.02, 4.15, -0.97],
    look: [0.8, 3.72, -1.42],
    zoom: 1.0,
  },
  // "Der Unterschied": both rivals in one frame (phone back on the ledge)
  {
    at: T.unterschied - 0.1,
    from: [2.6, 4.4, 3.4],
    to: [2.2, 4.2, 2.9],
    look: [0.4, 2.6, -0.6],
    zoom: 1.0,
  },
  // "Die Klobrille wird ständig geputzt": the wipe
  {
    at: T.klobrille3,
    from: [1.1, 2.4, 1.5],
    to: [0.8, 2.2, 1.2],
    look: [0, 1.35, -0.1],
    zoom: 1.0,
  },
  // "Glatt, kühl, trocken": low glossy slide along the clean seat
  { at: T.glatt, from: [-1.3, 1.65, 1.2], to: [-0.7, 1.6, 1.45], look: [0, 1.35, -0.1], zoom: 1.0 },
  // "Dein Handy ist warm vom Akku": x-ray of the phone on the ledge
  {
    at: T.handy3 - 0.2,
    orbit: { c: [0.78, 3.7, -1.45], r: 0.75, y: 4.25, a0: 0.6, a1: -0.2 },
    zoom: 1.0,
    whip: 1,
  },
  // "voller Hautfett": macro over the smeared screen
  {
    at: T.hautfett,
    from: [1.05, 3.95, -1.05],
    to: [0.92, 3.88, -1.2],
    look: [0.78, 3.7, -1.45],
    zoom: 1.0,
  },
  // "Ein Buffet": the germs multiply
  {
    at: T.buffet - 0.15,
    from: [1.4, 4.2, -0.6],
    to: [1.2, 4.05, -0.85],
    look: [0.78, 3.7, -1.45],
    zoom: 1.0,
  },
  // "Geputzt wird es fast nie": the cloth goes by — not for the phone
  {
    at: T.geputzt2,
    from: [2.3, 4.6, 0.5],
    to: [2.05, 4.45, 0.25],
    look: [0.85, 3.75, -1.35],
    zoom: 1.0,
  },
  // "Übrigens …": microscope dive into the screen
  {
    at: T.uebrigens,
    from: [0.86, 3.86, -1.33],
    to: [0.81, 3.78, -1.4],
    look: [0.77, 3.705, -1.45],
    zoom: 1.0,
    focus: 0.12,
  },
  // "Licht an – und es leuchtet": UV torch, both rivals (slowmo)
  {
    at: T.licht,
    from: [1.6, 4.6, 0.1],
    to: [1.35, 4.4, -0.3],
    look: [0.75, 3.72, -1.45],
    zoom: 1.0,
  },
  // "Die Klobrille wird geputzt": the seat under UV — almost clean
  {
    at: T.klobrille4,
    from: [1.1, 2.5, 1.6],
    to: [0.85, 2.3, 1.3],
    look: [0, 1.35, -0.1],
    zoom: 1.0,
  },
  // "dein Handy nie": the phone glows
  {
    at: T.handy4 - 0.15,
    from: [1.45, 3.9, -0.85],
    to: [1.3, 3.84, -1.0],
    look: [0.75, 3.72, -1.45],
    zoom: 1.0,
    whip: 1,
  },
  // "Ekliger ist dein Handy": crash in
  {
    at: T.ekliger,
    from: [1.05, 4.05, -1.0],
    to: [0.95, 3.95, -1.15],
    look: [0.78, 3.7, -1.45],
    zoom: 1.0,
  },
  // CTA: slow orbit over the glowing phone and the seat below
  {
    at: T.nimmst,
    orbit: { c: [0.75, 3.72, -1.45], r: 1.05, y: 4.55, a0: 1.0, a1: 0.3 },
    zoom: 1.0,
  },
];

// ---------------------------------------------------------------- labels (3, one at a time)
export const LABELS = [
  { text: "Akku", at: T.akku, until: T.hautfett - 0.1, pos: [0.78, 3.7, -1.42], side: -1 },
  {
    text: "Hautfett",
    at: T.hautfett + 0.1,
    until: T.buffet - 0.2,
    pos: [0.74, 3.71, -1.4],
    side: 1,
  },
  { text: "Darmbakterien", at: T.kot, until: T.licht - 0.05, pos: [0.775, 3.706, -1.45], side: -1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "zoom", at: 0.45, amount: 0.25 },
  { kind: "flash", at: T.klobrille1 },
  { kind: "shake", at: T.hintern, dur: 0.35, amp: 0.5 },
  { kind: "flash", at: T.spruet + 0.05 },
  { kind: "slowmo", at: T.spruet + 0.1, until: T.aber, speed: 0.35 },
  { kind: "shake", at: T.mal2, dur: 0.45, amp: 0.8 },
  { kind: "zoom", at: T.ueber, amount: 0.3 },
  { kind: "flash", at: T.geputzt1 },
  { kind: "zoom", at: T.buffet, amount: 0.35 },
  { kind: "flash", at: T.licht + 0.1 },
  { kind: "slowmo", at: T.licht + 0.15, until: T.klobrille4, speed: 0.4 },
  { kind: "zoom", at: T.ekliger, amount: 0.35 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "spuelung", at: 0.0, db: -16 }, // frame 0: a toilet flush rushing (sfx-extra.py)
  { s: "click", at: T.beim + 0.18 },
  { s: "spuelung", at: T.beim + 0.25, db: -9 },
  { s: "rauschen", at: T.spruet, dur: 1.8, db: -18 },
  { s: "zisch", at: T.klobrille3 + 0.1, dur: 0.6, db: -14 }, // cleaning spray
  { s: "surr", at: T.warm, dur: 1.4, db: -22 }, // warm battery hum
  { s: "click", at: T.licht + 0.05 },
  { s: "surr", at: T.licht + 0.1, dur: 2.2, db: -24 }, // UV lamp buzz
];
