// Beats of #50 "Katze schnurrt": every time-keyed decision as plain data,
// read by scene.js (picture) and scripts/build-sfx.mjs (sound).
import { W, LAST } from "./timing.js";

// ---------------------------------------------------------------- anchors
export const T = {
  nicht: W("nicht"),
  dass: W("dass"),
  gluecklich: W("glücklich"),
  schnurren2: W("Schnurren", 2),
  laecheln: W("Lächeln"),
  motor: W("Motor"),
  hand: W("Hand"),
  kehle: W("Kehle"),
  vibriert: W("vibriert"),
  ein: W("Ein-"),
  pause: W("Pause"),
  wo: W("Wo"),
  ganz: W("Ganz"),
  kehlkopf: W("Kehlkopf", 1),
  stimmlippen: W("Stimmlippen", 1),
  rate: W("Rate"),
  mal25: W("25-mal"),
  viel: W("Viel"),
  cmt: W("Schnurrt", 1),
  kommentare: W("Kommentare"),
  verrueckt: W("Verrückte"),
  wien: W("Wien"),
  gehirn: W("Gehirn"),
  geschnurrt: W("geschnurrt"),
  polster: W("Polster"),
  millimeter: W("Millimeter"),
  gewichte: W("Gewichte"),
  saite: W("Saite", 1),
  ton: W("Ton"),
  warum: W("warum"),
  schmerzen: W("Schmerzen"),
  forscher2: W("Forscher", 2),
  beruhigt: W("beruhigt"),
  fakt: W("Übrigens"),
  loewe: W("Löwe"),
  richtig: W("richtig"),
  folge: W("Folge"),
  end: LAST,
};

// ---------------------------------------------------------------- places
// cat-local → world: the cat lies on the knitted blanket on the window seat
export const CAT = [-0.3, 1.32, -0.5];
const C = (x, y, z) => [CAT[0] + x, CAT[1] + y, CAT[2] + z];
export const HEAD = C(1.12, 1.42, 0.12);
export const THROAT = C(1.0, 1.12, 0.1);
const T3 = (x, y, z) => [THROAT[0] + x, THROAT[1] + y, THROAT[2] + z];
export const LAB = [70, 0, 70];
const L = (x, y, z) => [LAB[0] + x, LAB[1] + y, LAB[2] + z];
export const DISH = L(0, 1.45, -0.3);
export const LION = [3.7, 0, 2.75];
export const LION_S = 1.5;
// the lion faces −x (towards the cat), mirrored so its head turns to the camera
export const LION_HEAD = [LION[0] - 1.12 * LION_S, 1.42 * LION_S, LION[2] + 0.12 * LION_S];

// ---------------------------------------------------------------- shots
// all authored at true distance (shotCamera(shots, 1.0)); hard cut on each `at`
export const shots = [
  // hook: the hand strokes the purring cat, fast push-in, rings from the throat
  { at: 0, from: [3.1, 3.7, 4.3], to: [2.1, 3.2, 2.8], look: C(0.0, 0.95, 0) },
  // ≤ 1.5 s: the face, eyes shut, rings big — "glücklich?"
  { at: T.dass, from: [2.0, 2.95, 1.4], to: [1.65, 2.85, 0.95], look: HEAD },
  // "Schnurren ist kein Lächeln": wide side from the left, rain behind
  { at: T.schnurren2, from: [-3.4, 3.1, 4.7], to: [-2.6, 2.85, 3.9], look: C(0.1, 0.8, 0) },
  // "ein Motor in ihrem Hals": crash in on the throat, x-ray on
  { at: T.motor, from: [2.9, 3.0, 2.6], to: [2.2, 2.8, 1.85], look: THROAT, whip: 1 },
  // the hand goes to the throat and trembles
  { at: T.hand, from: [2.8, 2.45, 2.2], to: [2.25, 2.35, 1.6], look: C(1.05, 0.95, 0.25) },
  // "beim Ein- und Ausatmen": x-ray orbit, lungs breathing
  { at: T.ein, from: [0.2, 3.1, 4.0], to: [1.0, 2.9, 3.4], look: C(0.1, 0.8, 0) },
  // "Wo steckt der?": dive into the throat (money shot ~10 s)
  { at: T.wo, from: [2.4, 3.1, 2.6], to: [1.25, 2.6, 0.55], look: THROAT, zoom: 1.0 },
  // "Ganz tief: ihr Kehlkopf": macro on the larynx, from the front
  { at: T.ganz, from: T3(0.45, 0.55, 0.95), to: T3(0.32, 0.42, 0.7), look: THROAT },
  // "Rate mal …": closer, slow motion of the flapping folds
  { at: T.rate, from: T3(0.22, 0.4, 0.62), to: T3(0.18, 0.34, 0.52), look: THROAT },
  // "25-mal": another angle, flash
  { at: T.mal25, from: T3(-0.45, 0.45, 0.62), to: T3(-0.32, 0.38, 0.5), look: THROAT },
  // "Viel zu tief für so ein kleines Tier": wide room, small cat, big rings
  { at: T.viel, from: [5.2, 4.4, 8.6], to: [4.4, 3.9, 7.6], look: C(0.2, 0.7, 0) },
  // comment question: she lifts her head and looks into the camera
  { at: T.cmt, from: [1.75, 2.75, 3.1], to: [1.35, 2.65, 2.45], look: C(0.75, 1.0, 0.1) },
  // "Und das Verrückte: Forscher in Wien …": whip to the lab
  {
    at: T.verrueckt,
    from: L(3.6, 3.4, 4.0),
    to: L(2.5, 2.8, 2.8),
    look: L(-0.3, 1.5, -0.4),
    whip: 1,
  },
  // "ohne Gehirn": the crossed-out brain
  { at: T.gehirn, from: L(0.3, 2.7, 2.7), to: L(0.0, 2.45, 2.1), look: L(-0.7, 1.65, -0.4) },
  // "Er hat trotzdem geschnurrt": macro in the dish, rings, flash
  { at: T.geschnurrt, from: L(1.6, 2.5, 1.8), to: L(1.15, 2.25, 1.3), look: DISH },
  // "Polster": closer, the yellow pads grow
  { at: T.polster, from: L(0.55, 2.55, 1.45), to: L(0.35, 2.35, 1.05), look: DISH },
  // "Gewichte an einer Gitarrensaite": the guitar by the bookshelf
  { at: T.gewichte, from: [-3.0, 2.7, 4.6], to: [-3.7, 2.35, 3.8], look: [-5.25, 2.0, 1.85] },
  // "Schwere Saite": close on the string, slow motion
  { at: T.saite, from: [-3.7, 2.0, 3.9], to: [-4.05, 1.95, 3.35], look: [-5.25, 1.8, 1.85] },
  // "tiefer Ton": back to the cat, the deep rings roll out
  { at: T.ton, from: [2.9, 3.1, 4.3], to: [2.1, 2.75, 3.3], look: C(0.2, 0.8, 0) },
  // "Und warum schnurrt sie auch bei Schmerzen?": the bandaged paw
  { at: T.warum, from: [2.9, 2.8, 2.7], to: [2.3, 2.5, 2.0], look: C(1.0, 0.45, 0.2) },
  // "beruhigt": calm close-up, soft teal rings
  { at: T.beruhigt, from: [1.95, 2.95, 1.35], to: [1.6, 2.85, 1.0], look: HEAD },
  // "Übrigens": the lion appears next to her
  { at: T.fakt, from: [-1.6, 4.6, 12.2], to: [-1.1, 4.1, 10.6], look: [1.0, 2.1, 0.8] },
  // "ein Löwe": the lion roars — no purr rings, ✕
  { at: T.loewe, from: [-0.9, 3.0, 7.6], to: [-0.4, 2.8, 6.8], look: LION_HEAD },
  // "richtig schnurren": the cat, rings huge, until the end
  { at: T.richtig, from: [2.1, 3.0, 1.9], to: [1.6, 2.85, 1.25], look: HEAD },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Kehlkopf", at: T.kehlkopf, until: T.rate, pos: THROAT, side: -1 },
  {
    text: "Stimmlippen",
    at: T.stimmlippen + 0.1,
    until: T.rate,
    pos: [THROAT[0] + 0.04, THROAT[1], THROAT[2] + 0.06],
    side: 1,
  },
  { text: "Kehlkopf", at: T.wien + 0.15, until: T.gehirn, pos: DISH, side: 1 },
  {
    text: "Polster",
    at: T.polster + 0.1,
    until: T.gewichte,
    pos: [DISH[0] + 0.12, DISH[1] + 0.06, DISH[2] + 0.1],
    side: 1,
  },
  { text: "Gewichte", at: T.gewichte + 0.4, until: T.saite, pos: [-5.27, 2.0, 1.86], side: 1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "shake", at: 0.35, dur: 0.35, amp: 0.5 }, // the purr shakes the frame on frame 0
  { kind: "zoom", at: T.dass, amount: 0.25 },
  { kind: "zoom", at: T.motor, amount: 0.3 },
  { kind: "shake", at: T.vibriert, dur: 0.6, amp: 0.7 },
  { kind: "zoom", at: T.wo, amount: 0.35 },
  { kind: "slowmo", at: T.rate, until: T.mal25, speed: 0.3 },
  { kind: "flash", at: T.mal25 },
  { kind: "flash", at: T.geschnurrt },
  { kind: "slowmo", at: T.saite, until: T.ton, speed: 0.35 },
  { kind: "shake", at: T.ton, dur: 0.5, amp: 0.6 },
  { kind: "zoom", at: T.fakt, amount: 0.25 },
  { kind: "shake", at: T.loewe + 0.1, dur: 0.6, amp: 0.8 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "schnurren", at: 0.0, db: -9 }, // frame 0: the purr itself
  { s: "schnurren", at: T.vibriert - 0.1, db: -11 },
  { s: "brumm", at: T.rate, dur: T.mal25 - T.rate, db: -24 },
  { s: "klack", at: T.gehirn + 0.1 },
  { s: "schnurren", at: T.geschnurrt, db: -10 },
  { s: "klack", at: T.gewichte + 0.35 },
  { s: "saite", at: T.saite + 0.05, db: -9 },
  { s: "pop", at: T.warum + 0.3 },
  { s: "schnurren", at: T.beruhigt - 0.2, db: -13 },
  { s: "pop", at: T.fakt + 0.12 },
  { s: "bruellen", at: T.loewe + 0.05, db: -9 },
  { s: "schnurren", at: T.richtig, db: -10 },
];
