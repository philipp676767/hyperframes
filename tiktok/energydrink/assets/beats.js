// #51 Energydrinks (Format B) — every time-keyed decision as plain data, so
// scene.js (picture) and scripts/build-sfx.mjs (sound) read the same numbers.
import { W } from "./timing.js";

export const T = {
  energy: W("Energydrinks"),
  wirst: W("Wirst"),
  mach: W("Mach"),
  herz1: W("Herz", 1),
  dose1: W("Dose", 1),
  zischt: W("zischt"),
  viertel: W("Viertelstunde"),
  kribbelt: W("kribbelt's"),
  superheld: W("Superheld"),
  nur: W("Nur"),
  keine: W("keine"),
  versteckt: W("versteckt"),
  schlaf: W("Schlaf-Signal"),
  dose5: W("Dose", 2),
  experten: W("Experten"),
  haende: W("Hände"),
  zittern: W("zittern"),
  herz2: W("Herz", 2),
  haemmert: W("hämmert"),
  welcher: W("Welcher"),
  foto: W("Dosen-Foto"),
  rate: W("Rate"),
  taurin: W("Taurin"),
  stier: W("Stierhoden"),
  falsch: W("Falsch"),
  labor: W("Labor"),
  wach: W("Wach"),
  koffein: W("Koffein", 1),
  blockiert: W("blockiert"),
  adenosin: W("Adenosin"),
  sammelt: W("sammelt"),
  post: W("Post"),
  briefkasten: W("Briefkasten"),
  dose10: W("Dose", 3),
  nachts: W("Nachts"),
  quillt: W("quillt"),
  alles: W("Alles"),
  kracht: W("kracht"),
  du: W("bist") - 0.08,
  mueder: W("müder"),
  herzrasen: W("Herzrasen"),
  fakt: W("Übrigens"),
  insekt: W("Insektengift"),
  pflanzen: W("Pflanzen"),
  kaefer: W("Käfer"),
  folge: W("Folge"),
};

// scene anchors (world positions) shared with scene.js
export const CAN = [0, 1.35, 0];
export const MAILBOX = [-5.2, 0, 1.4];
export const BULL = [5.2, 0, 1.2];
export const PYR = [3.9, 0, -3.3];
export const CLOCK = [2.9, 0, 2.3];
export const PLANT_LEAF = [9.2, 2.55, -4.3];

// ---------------------------------------------------------------- shots
export const shots = [
  // hook: close on the can as the hand rips the tab, fast push-in
  { at: 0, from: [1.9, 3.5, 4.6], to: [1.1, 3.1, 3.2], look: [0.2, 2.1, 0], zoom: 1.25 },
  // first cut ≤ 1.5 s: wide — the pyramid of ten, monitor glow, the night
  { at: T.energy, from: [4.5, 4.2, 9.5], to: [3.6, 3.6, 8.2], look: [1.6, 1.6, -1.6], whip: 1 },
  // the question: low close, the fizz at the opening
  { at: T.wirst, from: [-1.5, 3.9, 2.4], to: [-1.1, 3.6, 2.0], look: [0, 2.9, 0], zoom: 1.2 },
  // warning: the heart pops above the can
  { at: T.mach, from: [2.2, 2.6, 4.6], to: [1.6, 2.5, 3.9], look: [-0.3, 2.4, 0] },
  // Dose eins: the hand lifts the can and drinks (side view)
  { at: T.dose1, from: [5.2, 2.6, 4.2], to: [4.4, 2.8, 3.6], look: [0, 2.0, 0] },
  // kribbeln: sparks around the can, orbit
  { at: T.viertel, orbit: { c: [0, 1.6, 0], r: 3.4, y: 2.0, a0: 0.9, a1: 0.1 } },
  // Superheld: cape, low heroic angle
  {
    at: T.superheld,
    from: [-3.0, 1.5, 1.0],
    to: [-2.6, 1.6, 1.6],
    look: [0, 1.8, -0.3],
    zoom: 1.5,
  },
  // Nur: keine Energie — straight front, the ✕
  { at: T.nur, from: [0, 1.9, 4.6], to: [0, 1.8, 3.8], look: [0, 1.5, 0] },
  // versteckt: the mailbox, letters fly in, tape slaps on (slowmo)
  {
    at: T.versteckt,
    from: [-2.4, 2.4, 5.4],
    to: [-3.2, 2.0, 4.8],
    look: [MAILBOX[0], 1.2, MAILBOX[2]],
    whip: -1,
  },
  // Dose fünf: wide desk, pyramid half gone, empties
  { at: T.dose5, from: [6.5, 5.5, 9], to: [5.5, 4.8, 8], look: [0, 1.2, -1.2] },
  // Hände zittern: close on the shaking hand
  { at: T.haende, from: [1.8, 2.6, 3.2], to: [1.4, 2.3, 2.7], look: [0.2, 1.9, 0], zoom: 1.4 },
  // Herz hämmert: the heart big, pulsing
  { at: T.herz2, from: [-0.2, 3.3, 4.2], to: [-0.5, 3.2, 3.6], look: [-1.0, 2.6, 0.2], zoom: 1.5 },
  // comment question: track along the pyramid's colourful cans
  {
    at: T.welcher,
    from: [6.4, 2.0, 2.2],
    to: [1.8, 2.0, 1.8],
    look: [PYR[0], 1.0, PYR[2]],
    lookTo: [PYR[0] - 1.2, 1.0, PYR[2]],
  },
  // Rate mal: the bull set (right), the bull pops on Stierhoden
  { at: T.rate, from: [3.2, 2.2, 5.4], to: [3.7, 1.9, 4.8], look: [BULL[0], 1.1, BULL[2]] },
  // Falsch: ✕ crash zoom
  {
    at: T.falsch,
    from: [4.8, 1.5, 3.9],
    to: [4.9, 1.4, 3.5],
    look: [BULL[0], 1.1, BULL[2]],
    zoom: 1.3,
  },
  // Labor: whip to the flask
  {
    at: T.labor,
    from: [7.4, 1.8, 4.2],
    to: [6.8, 1.7, 3.8],
    look: [BULL[0], 1.1, BULL[2]],
    whip: 1,
    zoom: 1.4,
  },
  // Koffein: x-ray can, yellow molecules
  { at: T.wach, from: [2.6, 2.4, 4.8], to: [1.9, 2.1, 4.2], look: [0, 1.4, 0] },
  // blockiert … Adenosin: mailbox, tape, letters piling up
  {
    at: T.blockiert,
    from: [-2.6, 2.2, 5.6],
    to: [-3.4, 2.0, 5.2],
    look: [MAILBOX[0], 1.1, MAILBOX[2]],
  },
  // sammelt sich … Briefkasten: the pile grows, slow push
  {
    at: T.sammelt,
    from: [-7.6, 2.8, 5.6],
    to: [-6.9, 2.4, 4.8],
    look: [MAILBOX[0], 1.1, MAILBOX[2]],
  },
  // Dose zehn: wide, pyramid empty, empties everywhere
  { at: T.dose10, from: [-5, 5.8, 9.5], to: [-4, 5.0, 8.5], look: [0, 1.0, -1] },
  // Nachts um vier: the clock close (calm before the burst)
  {
    at: T.nachts,
    from: [3.4, 1.4, 4.4],
    to: [3.3, 1.3, 4.0],
    look: [CLOCK[0], 0.55, CLOCK[2]],
    zoom: 1.1,
  },
  // quillt über: mailbox bursts (slowmo, flash)
  {
    at: T.quillt,
    from: [-3.4, 2.8, 6.4],
    to: [-3.6, 2.6, 6.0],
    look: [MAILBOX[0], 1.3, MAILBOX[2]],
    zoom: 1.5,
  },
  // payoff: hand slumped next to the tipped can, letters around
  { at: T.du, from: [2.2, 2.4, 5.0], to: [1.8, 2.1, 4.4], look: [0.2, 0.6, 0.9], zoom: 1.9 },
  // Übrigens: the coffee plant by the window, the beetle
  {
    at: T.fakt,
    from: [7.4, 3.4, -1.8],
    to: [8.0, 3.2, -2.6],
    look: PLANT_LEAF,
    zoom: 1.2,
    whip: 1,
  },
  { at: T.kaefer, from: [8.0, 3.9, -2.8], to: [8.4, 3.7, -3.2], look: PLANT_LEAF, zoom: 1.6 },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Herz", at: T.herz1 + 0.1, until: T.dose1, pos: [-1.5, 3.4, 0.3], side: -1 },
  {
    text: "Schlaf-Signal",
    at: T.schlaf,
    until: T.dose5,
    pos: [MAILBOX[0] + 0.6, 0.35, MAILBOX[2] + 0.9],
    side: 1,
  },
  { text: "Taurin", at: T.labor, until: T.wach, pos: [BULL[0], 1.0, BULL[2]], side: -1 },
  { text: "Koffein", at: T.koffein, until: T.blockiert, pos: [0.35, 1.3, 0.3], side: 1 },
  {
    text: "Adenosin",
    at: T.adenosin,
    until: T.sammelt + 0.6,
    pos: [MAILBOX[0] + 0.5, 0.5, MAILBOX[2] + 1.0],
    side: 1,
  },
  {
    text: "Koffein",
    at: T.adenosin,
    until: T.sammelt + 0.6,
    pos: [MAILBOX[0], 1.45, MAILBOX[2] + 0.55],
    side: -1,
  },
  {
    text: "Kaffeepflanze",
    at: T.fakt + 0.3,
    until: T.kaefer,
    pos: [PLANT_LEAF[0] + 0.5, PLANT_LEAF[1] + 0.4, PLANT_LEAF[2]],
    side: -1,
  },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "flash", at: 0.22 }, // the tab cracks, spray
  { kind: "zoom", at: T.energy, amount: 0.3 },
  { kind: "zoom", at: T.herz1, amount: 0.25 },
  { kind: "flash", at: T.superheld },
  { kind: "slowmo", at: T.versteckt + 0.1, until: T.dose5, speed: 0.4 },
  { kind: "shake", at: T.zittern, dur: 0.6, amp: 0.7 },
  { kind: "zoom", at: T.haemmert, amount: 0.3 },
  { kind: "zoom", at: T.stier, amount: 0.3 },
  { kind: "shake", at: T.falsch, dur: 0.4, amp: 0.8 },
  { kind: "zoom", at: T.adenosin, amount: 0.25 },
  { kind: "flash", at: T.quillt + 0.05 },
  { kind: "shake", at: T.quillt + 0.05, dur: 0.6, amp: 1.0 },
  { kind: "slowmo", at: T.quillt + 0.1, until: T.alles, speed: 0.35 },
  { kind: "zoom", at: T.mueder, amount: 0.3 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "dosenauf", at: 0.12, db: -6 }, // frame 0: the can cracks open
  { s: "herzschlag", at: T.herz1 + 0.05, db: -8 },
  { s: "herzschlag", at: T.herz1 + 0.75, db: -10 },
  { s: "dosenauf", at: T.zischt - 0.05, db: -9 },
  { s: "surr", at: T.kribbelt, dur: 1.3, db: -20 }, // sparks crackle
  { s: "klack", at: T.versteckt + 0.3, db: -10 }, // tape slaps on
  { s: "klack", at: T.versteckt + 0.75, db: -13 },
  ...[0, 0.42, 0.84, 1.26].map((d, i) => ({ s: "herzschlag", at: T.herz2 + d, db: -7 - i })),
  { s: "pop", at: T.stier + 0.05 }, // bull pops in
  { s: "pop", at: T.labor + 0.05 }, // flask pops in
  { s: "zisch", at: T.labor + 0.2, dur: 0.9, db: -20 }, // flask bubbling
  { s: "piep", at: T.nachts + 0.2, dur: 0.6, db: -16 }, // the 04:00 alarm
  { s: "rauschen", at: T.quillt + 0.05, dur: 1.6, db: -14 }, // paper avalanche
  ...[0, 0.36, 0.72].map((d) => ({ s: "herzschlag", at: T.herzrasen - 0.1 + d, db: -12 })),
];
