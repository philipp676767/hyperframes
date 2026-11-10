// #63 Cola im Gefrierfach — every time-keyed decision as plain data (read by
// scene.js and scripts/build-sfx.mjs). No three.js / DOM here.
import { W } from "./timing.js";

// mini-sets far away from the freezer drawer (world units)
export const CAN2 = [-1.9, 0, 1.7]; // the "what if you open it now" can
export const MAG = [-40, 0, 0]; // magnified can wall next to a hair
export const FELS = [40, 0, 0]; // frost splits a rock and a road

export const T = {
  du: W("Du"),
  cola: W("Cola"),
  gefrierfach: W("Gefrierfach"),
  dose1: W("Dose", 1),
  zeitbombe: W("Zeitbombe"),
  schuld: W("Schuld"),
  blaeschen1: W("Bläschen", 1),
  erst: W("Erst"),
  kaelter: W("kälter"),
  fluessig: W("flüssig"),
  oeffnest: W("Öffnest"),
  jetzt1: W("jetzt", 1),
  sekunden: W("Sekunden"),
  slush: W("Slush"),
  laesst: W("lässt"),
  kristall: W("Kristall"),
  waechst: W("wächst"),
  innen: W("innen"),
  boden: W("Boden"),
  beult: W("beult"),
  folge: W("Folge"),
  rate: W("Rate"),
  zehntel: W("Zehntel"),
  haar: W("Haar"),
  dagegen: W("dagegen"),
  neun: W("neun"),
  platz: W("Platz"),
  kohlen: W("Kohlensäure"),
  drueckt2: W("drückt", 2),
  dose3: W("Dose", 3),
  reisst: W("reißt"),
  bruehe: W("Brühe"),
  viel: W("Viel"),
  putzen: W("Putzen"),
  sprengen: W("sprengen"),
  wasser: W("Wasser"),
  fakt: W("Übrigens"),
  frost: W("Frost"),
  felsen: W("Felsen"),
  strassen: W("Straßen"),
  was: W("Was"),
};

// ---------------------------------------------------------------- shots
// can at the origin (2.44 tall); `rel` = an offset (mini-sets), converted to
// a Vector3 in scene.js
export const shots = [
  // cold open: the can is bursting right now, close, from the front right
  { at: 0, from: [2.3, 2.1, 3.3], to: [1.75, 1.9, 2.55], look: [0.5, 1.5, 0], zoom: 1.4 },
  // the act: your hand puts the can into the freezer drawer
  { at: T.gefrierfach, from: [2.4, 3.6, 6.2], to: [1.7, 2.9, 4.9], look: [0, 1.3, -0.6] },
  // time-lapse: the can sits there, frost creeps up
  {
    at: T.dose1,
    from: [-1.3, 1.1, 2.3],
    to: [-0.9, 1.35, 1.7],
    look: [0, 1.3, 0],
    whip: 1,
    zoom: 1.55,
  },
  // cutaway: the bubbles are not to blame
  { at: T.schuld, from: [0.1, 1.35, 2.7], to: [0, 1.25, 2.2], look: [0, 1.2, 0] },
  // colder than ice, still liquid
  { at: T.erst, from: [0.9, 1.6, 2.95], to: [0.55, 1.5, 2.65], look: [0, 1.2, 0] },
  // what if: open it now -> slush (second money shot)
  {
    at: T.oeffnest,
    from: [1.0, 2.9, 1.9],
    to: [0.65, 2.6, 1.35],
    look: [0, 2.15, 0],
    rel: CAN2,
    zoom: 1.5,
  },
  // you leave it in: back to the drawer, wide
  { at: T.laesst, from: [-3.2, 3.3, 5.6], to: [-2.5, 2.8, 4.7], look: [0, 1.2, -0.6] },
  // one crystal at the wall (macro)
  {
    at: T.kristall,
    from: [0.95, 1.45, 1.1],
    to: [0.8, 1.38, 0.88],
    look: [0.5, 1.3, 0],
    zoom: 1.2,
  },
  // the ice grows inward (cutaway, whole can)
  { at: T.waechst, from: [-0.15, 1.3, 2.6], to: [0, 1.25, 2.15], look: [0, 1.2, 0] },
  // the bottom bulges (low)
  { at: T.boden, from: [1.95, 1.15, 2.65], to: [1.65, 1.0, 2.35], look: [0, 0.6, 0] },
  // follow line: slow orbit around the frosted can
  { at: T.folge, orbit: { c: [0, 1.25, 0], r: 2.5, y: 1.9, a0: -0.9, a1: -0.25 } },
  // guess: how thin is the wall? (magnified wall)
  {
    at: T.rate,
    from: [1.4, 1.7, 3.2],
    to: [0.9, 1.5, 2.5],
    look: [0, 1.2, 0],
    rel: MAG,
    whip: -1,
  },
  // … as thin as a hair
  { at: T.haar, from: [-1.2, 1.9, 3.4], to: [-0.8, 1.7, 2.8], look: [0.4, 1.3, 0], rel: MAG },
  // the ice pushes against the wall (cutaway + force arrows)
  { at: T.dagegen, from: [0, 1.35, 2.85], to: [0, 1.25, 2.3], look: [0, 1.2, 0] },
  // the carbon dioxide is squeezed out and pushes too
  { at: T.kohlen, from: [0.45, 2.3, 1.5], to: [0.25, 2.15, 1.15], look: [0, 1.85, 0] },
  // money shot: the can tears open (slow motion)
  { at: T.dose3, from: [1.75, 1.95, 2.5], to: [1.25, 1.8, 1.85], look: [0.2, 1.65, 0] },
  // the mess
  { at: T.viel, from: [-2.6, 3.5, 5.3], to: [-2.0, 3.0, 4.4], look: [2.0, 1.4, -1.2] },
  // payoff: the water, not the bubbles (cutaway of the burst can)
  { at: T.sprengen, from: [0.15, 1.35, 2.7], to: [0, 1.3, 2.1], look: [0, 1.2, 0] },
  // Übrigens: frost splits a rock
  { at: T.fakt, from: [3.0, 2.3, 5.4], to: [2.2, 1.8, 4.1], look: [0, 1.2, 0], rel: FELS },
  // … and roads
  {
    at: T.strassen,
    from: [-1.3, 2.7, 6.8],
    to: [-0.9, 2.3, 6.0],
    look: [0.2, 0.25, 2.9],
    rel: FELS,
  },
  // last line: the mess, wide, pushing in
  { at: T.was, from: [2.6, 3.6, 6.0], to: [1.9, 3.0, 4.9], look: [0.3, 1.4, -1.0] },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Slush", at: T.slush + 0.1, until: T.laesst, pos: [CAN2[0], 2.75, CAN2[2]], side: 1 },
  { text: "Eiskristall", at: T.kristall + 0.15, until: T.waechst, pos: [0.6, 1.3, 0.03], side: -1 },
  {
    text: "Dosenwand",
    at: T.rate + 0.6,
    until: T.haar,
    pos: [MAG[0], 1.1, MAG[2] + 0.4],
    side: -1,
  },
  { text: "Haar", at: T.haar + 0.1, until: T.dagegen, pos: [MAG[0] + 0.85, 2.0, MAG[2]], side: 1 },
  { text: "Wasser → Eis", at: T.wasser, until: T.fakt, pos: [0.25, 1.0, 0.05], side: 1 },
  { text: "Kohlensäure", at: T.kohlen + 0.1, until: T.dose3, pos: [0.05, 2.12, 0.05], side: 1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "shake", at: 0.08, dur: 0.6, amp: 1.0 }, // the can tears in frame 0
  { kind: "flash", at: 0.3 },
  { kind: "zoom", at: T.zeitbombe, amount: 0.3 },
  { kind: "flash", at: T.slush },
  { kind: "zoom", at: T.kristall + 0.15, amount: 0.25 },
  { kind: "shake", at: T.beult + 0.15, dur: 0.45, amp: 0.7 },
  { kind: "zoom", at: T.zehntel, amount: 0.35 },
  { kind: "zoom", at: T.neun, amount: 0.25 },
  { kind: "flash", at: T.reisst },
  { kind: "shake", at: T.reisst + 0.02, dur: 0.7, amp: 1.1 },
  { kind: "slowmo", at: T.reisst, until: T.viel, speed: 0.35 },
  { kind: "zoom", at: T.wasser, amount: 0.3 },
  { kind: "flash", at: T.felsen },
  { kind: "shake", at: T.felsen + 0.03, dur: 0.5, amp: 0.8 },
];

// ---------------------------------------------------------------- sound
// own sounds (scripts/sfx-extra.py): "dosenknall" = the can tearing (thump
// + metal rip + spray), "knistern" = ice crystals crackling, "psst" = the
// tab popping, "felsknack" = stone cracking
export const SFX = [
  { s: "dosenknall", at: 0.02, db: -6 }, // frame 0: the can bursts
  { s: "klack", at: T.gefrierfach + 0.65, db: -12 }, // the can lands in the drawer
  { s: "brumm", at: T.dose1, dur: T.folge - T.dose1, db: -25 }, // the freezer hums
  { s: "pop", at: T.oeffnest + 0.05 }, // the what-if can pops in
  { s: "psst", at: T.jetzt1 + 0.1, db: -8 }, // tab opens
  { s: "knistern", at: T.sekunden, dur: 1.4, db: -10 }, // slush shoots through
  { s: "knistern", at: T.kristall + 0.1, dur: 3.0, db: -12 }, // the ice grows
  { s: "klack", at: T.beult + 0.15, db: -8 }, // the bottom pops out
  { s: "knistern", at: T.dagegen + 0.3, dur: 2.5, db: -14 },
  { s: "dosenknall", at: T.reisst + 0.02, db: -5 },
  { s: "felsknack", at: T.felsen - 0.05, db: -7 },
];
