// #48 Touchscreen — every time-keyed decision as plain data (scene.js reads
// the picture from it, scripts/build-sfx.mjs the sound). No three.js / DOM.
import { W } from "./timing.js";

export const T = {
  handschuh: W("Handschuh", 1),
  dein1: W("Dein", 1),
  eine1: W("Eine", 1),
  wurst1: W("Wurst", 1),
  winter: W("Winter"),
  tippst: W("tippst"),
  wuerstchen: W("Würstchen"),
  klappt: W("klappt"),
  ja: W("Ja"),
  dein2: W("Dein", 2),
  es1: W("Es", 2),
  etwas: W("etwas"),
  lass: W("Lass"),
  bauen: W("bauen"),
  glas: W("Glas"),
  gitter: W("Gitter"),
  unsichtbar: W("unsichtbar"),
  sensorgitter: W("Sensorgitter"),
  kreuzung1: W("Kreuzung", 1),
  feld1: W("Feld", 1),
  zeig: W("Zeig"),
  spinnennetz: W("Spinnennetz"),
  bild: W("Bild"),
  rate: W("Rate"),
  sekunde: W("Sekunde"),
  ueber: W("Über"),
  mal100: W("100-mal"),
  chip1: W("Chip", 1),
  reihe: W("Reihe", 1),
  kommt: W("Kommt"),
  klaut: W("klaut"),
  ladung: W("Ladung"),
  genau: W("Genau"),
  tipp: W("Tipp"),
  salzwasser: W("Salzwasser"),
  leitet: W("leitet"),
  handschuh2: W("Handschuh", 2),
  eine2: W("Eine", 2),
  wurst2: W("Wurst", 2),
  uebrigens: W("Übrigens"),
  keime: W("Keime"),
  klobrille: W("Klobrille"),
  folge: W("Folge"),
};

// taps of the hook (scene time): the glove jabs three times, the sausage once
export const TAPS_GLOVE = [0.04, 0.75, 1.5];
export const TAP_WURST = T.eine1 + 0.28;
// slow motion: the sausage closes in on the send button (scene time runs
// 0.3× from T.tippst, so the press must land before T.tippst + 0.42)
export const TAP_SEND = T.tippst + 0.36;
export const TAP_FINGER = T.kommt + 0.3; // fingertip arrives (slowmo, scene time)
export const TAP_GLOVE2 = T.handschuh2 + 0.3;
export const TAP_WURST2 = T.wurst2 + 0.22;

// the mini-set inside your fingertip (payoff), left of the phone
export const FS = [-5, 1.5, 1.6];

export const shots = [
  // frame 0: the whole phone, the gloved hand jabbing — fast push-in
  { at: 0, from: [-1.3, 2.2, 2.8], to: [-0.75, 1.95, 2.15], look: [0, 1.6, 0] },
  // macro: glove on the glass, the ✕
  {
    at: T.dein1,
    from: [-0.95, 1.85, 1.5],
    to: [-0.65, 1.75, 1.15],
    look: [0.1, 1.55, 0.2],
    zoom: 1.25,
  },
  // the sausage taps — and it works
  { at: T.eine1, from: [-1.25, 1.6, 2.3], to: [-0.7, 1.65, 1.75], look: [0, 1.5, 0], whip: -1 },
  // wide: the tram stop in the snow, the tram glides through
  { at: T.winter, from: [3.3, 2.4, 5.6], to: [2.5, 1.95, 4.5], look: [0, 1.6, -3] },
  // macro slowmo: sausage closes in on the send button
  {
    at: T.tippst,
    from: [-0.95, 1.55, 1.3],
    to: [-0.72, 1.42, 1.0],
    look: [0.35, 1.25, 0.1],
    zoom: 1.05,
  },
  // sent!
  { at: T.klappt, from: [0, 1.8, 2.5], to: [0, 1.75, 2.1], look: [0, 1.7, 0], zoom: 1.45 },
  // low wide with the Würstelstand behind
  { at: T.ja, from: [-3.6, 1.1, 4.8], to: [-3.1, 1.25, 4.2], look: [1.4, 1.9, -6] },
  // the bare finger hovers in front of the glass
  { at: T.dein2, from: [-1.9, 2.2, 2.6], to: [-1.45, 2.0, 2.05], look: [0.1, 1.7, 0] },
  // something inside you glows
  { at: T.es1, from: [0.7, 2.7, 2.5], to: [0.55, 2.4, 2.05], look: [0.5, 1.75, 0.45], zoom: 1.25 },
  // the phone comes apart (x-ray build)
  { at: T.lass, orbit: { c: [0, 1.65, 0.4], r: 3.4, y: 2.4, a0: 0.62, a1: 0.32 } },
  // the grid grows
  {
    at: T.gitter,
    from: [-1.5, 2.3, 2.3],
    to: [-1.05, 2.0, 1.85],
    look: [0, 1.7, 0.5],
    zoom: 1.3,
    whip: -1,
  },
  { at: T.sensorgitter, orbit: { c: [0, 1.65, 0.35], r: 3.3, y: 2.0, a0: -0.95, a1: -0.5 } },
  // macro on the crossings: tiny fields
  {
    at: T.kreuzung1,
    from: [0.55, 1.95, 1.95],
    to: [0.32, 1.88, 1.55],
    look: [0.05, 1.8, 0.62],
    zoom: 1.0,
  },
  // back together, high in the frame (the comment pill sits low)
  { at: T.zeig, from: [0.45, 1.5, 3.2], to: [0.3, 1.4, 2.85], look: [0, 1.0, 0] },
  // crack!
  { at: T.spinnennetz, from: [0.15, 1.6, 3.0], to: [0.1, 1.55, 2.8], look: [0, 1.05, 0] },
  // rate mal: scan lines race over the grid
  { at: T.rate, orbit: { c: [0, 1.65, 0.35], r: 3.5, y: 2.3, a0: 0.65, a1: -0.15 } },
  { at: T.mal100, from: [0, 1.75, 2.7], to: [0, 1.72, 2.35], look: [0, 1.65, 0.4], zoom: 1.6 },
  // the chip
  {
    at: T.chip1,
    from: [1.05, 0.95, 1.9],
    to: [0.75, 1.0, 1.5],
    look: [0, 0.78, 0.3],
    zoom: 1.1,
    whip: 1,
  },
  // row by row
  { at: T.reihe, from: [-1.7, 2.6, 2.4], to: [-1.35, 2.3, 2.0], look: [0, 1.65, 0.4], zoom: 1.4 },
  // slowmo: the finger closes in on one crossing
  {
    at: T.kommt,
    from: [-1.3, 2.1, 1.85],
    to: [-1.0, 2.0, 1.5],
    look: [0.15, 1.87, 0.7],
    zoom: 1.0,
  },
  // charge flows into the finger
  { at: T.klaut, from: [0.2, 2.75, 1.75], to: [0.15, 2.5, 1.5], look: [0.2, 1.87, 0.7], zoom: 1.0 },
  // TIPP
  { at: T.genau, from: [0.6, 1.95, 2.7], to: [0.4, 1.85, 2.3], look: [0, 1.75, 0.4], zoom: 1.5 },
  // inside your fingertip: salt water
  {
    at: T.salzwasser,
    rel: { x: FS[0], y: FS[1], z: FS[2], isVector3: true },
    from: [1.7, 0.35, 3.5],
    to: [1.35, 0.3, 2.9],
    look: [0.55, 0.05, 0],
    zoom: 1.15,
    whip: -1,
  },
  // the glove: nothing
  {
    at: T.handschuh2,
    from: [-1.25, 1.9, 2.4],
    to: [-0.9, 1.8, 2.0],
    look: [0.1, 1.6, 0.3],
    whip: -1,
  },
  // the sausage: yes
  { at: T.wurst2, from: [0.15, 2.4, 2.4], to: [0.1, 2.2, 2.0], look: [0.1, 1.55, 0.2], zoom: 1.3 },
  // Übrigens: germs on your display
  { at: T.uebrigens, from: [0.6, 1.9, 2.6], to: [0.3, 1.85, 2.2], look: [0, 1.7, 0], zoom: 1.4 },
  { at: T.keime, from: [0.45, 1.95, 1.35], to: [0.28, 1.9, 1.05], look: [0, 1.85, 0.1], zoom: 1.0 },
  // … more than on a toilet seat
  { at: T.klobrille, from: [1.9, 2.0, 4.4], to: [1.6, 1.85, 3.8], look: [1.0, 1.1, 0.3] },
];

export const LABELS = [
  { text: "Glas", at: T.glas + 0.1, until: T.gitter, pos: [0.45, 2.4, 1.05], side: 1 },
  {
    text: "Sensorgitter",
    at: T.sensorgitter,
    until: T.kreuzung1,
    pos: [-0.52, 2.3, 0.6],
    side: -1,
  },
  { text: "Feld", at: T.feld1, until: T.zeig, pos: [0.104, 1.87, 0.65], side: 1 },
  { text: "Chip", at: T.chip1 + 0.1, until: T.reihe, pos: [0, 0.7, 0.35], side: 1 },
  {
    text: "Salzwasser",
    at: T.salzwasser + 0.1,
    until: T.handschuh2,
    pos: [FS[0] + 0.2, FS[1] + 0.05, FS[2] + 0.3],
    side: 1,
  },
  { text: "Keime", at: T.keime + 0.1, until: T.klobrille, pos: [0.15, 1.95, 0.12], side: 1 },
];

export const HIGHLIGHTS = [
  { kind: "shake", at: TAPS_GLOVE[0], dur: 0.25, amp: 0.4 },
  { kind: "shake", at: TAPS_GLOVE[2], dur: 0.35, amp: 0.7 },
  { kind: "flash", at: TAP_WURST },
  { kind: "zoom", at: TAP_WURST + 0.05, amount: 0.3 },
  { kind: "slowmo", at: T.tippst, until: T.klappt, speed: 0.3 },
  { kind: "zoom", at: T.klappt + 0.05, amount: 0.3 },
  { kind: "flash", at: T.etwas },
  { kind: "shake", at: T.bauen, dur: 0.45, amp: 0.8 },
  { kind: "zoom", at: T.sensorgitter, amount: 0.25 },
  { kind: "flash", at: T.spinnennetz + 0.1 },
  { kind: "shake", at: T.spinnennetz + 0.1, dur: 0.5, amp: 1 },
  { kind: "zoom", at: T.mal100, amount: 0.35 },
  { kind: "slowmo", at: T.kommt, until: T.klaut, speed: 0.3 },
  { kind: "flash", at: T.tipp },
  { kind: "shake", at: T.tipp, dur: 0.4, amp: 0.6 },
  { kind: "shake", at: TAP_GLOVE2, dur: 0.3, amp: 0.5 },
  { kind: "flash", at: TAP_WURST2 },
  { kind: "zoom", at: T.keime, amount: 0.3 },
];

// Own sounds (scripts/sfx-extra.py): "tock" = fingertip / sausage on glass,
// "knack" = the display cracking.
export const SFX = [
  ...TAPS_GLOVE.map((at) => ({ s: "tock", at, db: -9 })),
  { s: "boing", at: TAPS_GLOVE[2] + 0.1, db: -16 },
  { s: "tock", at: TAP_WURST, db: -8 },
  { s: "ding", at: TAP_WURST + 0.05, db: -12 },
  { s: "ding", at: T.klappt + 0.02, db: -10 },
  { s: "surr", at: T.es1, dur: T.lass - T.es1, db: -22 },
  { s: "pop", at: T.lass + 0.1 },
  { s: "pop", at: T.glas + 0.05, db: -12 },
  { s: "surr", at: T.gitter, dur: 1.4, db: -22 },
  { s: "knack", at: T.spinnennetz + 0.1, db: -6 },
  { s: "surr", at: T.rate + 0.4, dur: T.mal100 - T.rate - 0.4, db: -20 },
  { s: "pop", at: T.chip1 + 0.05 },
  { s: "click", at: T.reihe, db: -14 },
  { s: "click", at: T.reihe + 0.3, db: -16 },
  { s: "surr", at: T.klaut, dur: T.genau - T.klaut, db: -19 },
  { s: "tock", at: T.tipp, db: -8 },
  { s: "rauschen", at: T.salzwasser, dur: 2.2, db: -22 },
  { s: "tock", at: TAP_GLOVE2, db: -9 },
  { s: "boing", at: TAP_GLOVE2 + 0.1, db: -16 },
  { s: "tock", at: TAP_WURST2, db: -8 },
  { s: "ding", at: TAP_WURST2 + 0.04, db: -12 },
  { s: "pop", at: T.klobrille + 0.05 },
];
