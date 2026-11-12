// #81 Nicht blinzeln — every time-keyed decision as plain data (scene + sound).
import { W } from "./timing.js";

export const T = {
  jetzt: W("jetzt"),
  tag: W("Tag", 1),
  mach: W("Mach"),
  brennt: W("brennt's"),
  traenenfilm: W("Tränenfilm"),
  reisst: W("reißt"),
  pfuetze: W("Pfütze"),
  sonne: W("Sonne"),
  alarm: W("Alarm"),
  paradox: W("Paradox"),
  traenen: W("tränen", 1),
  verschwimmt: W("verschwimmt"),
  rate: W("Rate"),
  zahl: W("15000"),
  handy: W("Handy"),
  abends: W("abends"),
  warum: W("Warum"),
  hornhaut: W("Hornhaut"),
  gefaesse: W("Blutgefäße"),
  trueb: W("trüb"),
  trinkt: W("trinkt"),
  lid: W("Lid", 1),
  wischer: W("Scheibenwischer"),
  einen2: W("Einen", 2),
  unmoeglich: W("Unmöglich"),
  knallt: W("knallt"),
  fakt: W("Übrigens"),
  stunde: W("Stunde"),
  schneidet: W("schneidet's"),
  cta: W("Wie", 3),
};

// eye centre and radius (scene.js builds the eye around it)
export const E = [0, 1.5, 0.3];
export const PUDDLE = [5, 0, 6];

export const shots = [
  // frame 0: the hand holds the giant eye open — close, pushing in
  { at: 0, from: [1.7, 2.5, 6.6], to: [1.2, 2.2, 5.5], look: [0, 1.85, 1.3], zoom: 1 },
  // the reveal: a face buried in the dune, desert at noon (cut ≤ 1.5 s)
  { at: T.jetzt, from: [6.5, 3.6, 12.5], to: [5.4, 3.0, 10.6], look: [0, 1.7, 0], zoom: 1 },
  // "Augen auf!" — straight into the eye
  { at: T.mach, from: [0, 1.8, 6.0], to: [0, 1.65, 4.8], look: [0, 1.55, 1.8], zoom: 1 },
  // it burns: from the side, veins creep in
  {
    at: T.brennt,
    from: [-2.7, 2.3, 4.3],
    to: [-2.2, 2.0, 3.7],
    look: [0, 1.5, 1.6],
    zoom: 1,
    whip: 1,
  },
  // the tear film: macro over the glossy surface
  {
    at: T.traenenfilm,
    from: [0.9, 2.45, 3.5],
    to: [0.6, 2.15, 3.15],
    look: [0, 1.6, 1.8],
    zoom: 1,
  },
  // it tears open: dry spots
  { at: T.reisst, from: [-0.7, 2.0, 3.35], to: [-0.45, 1.85, 3.05], look: [0, 1.52, 1.8], zoom: 1 },
  // analogy: a puddle drying in the sun
  {
    at: T.pfuetze,
    from: [7.6, 1.5, 9.4],
    to: [6.9, 1.05, 8.5],
    look: [5, 0.05, 6],
    zoom: 1,
  },
  // alarm: the whole eye, red
  { at: T.alarm, from: [0.5, 1.9, 6.2], to: [0.25, 1.7, 5.1], look: [0, 1.5, 1.4], zoom: 1 },
  // the paradox: tears run down the cheek into the sand
  {
    at: T.paradox,
    from: [-3.4, 1.4, 4.8],
    to: [-2.8, 1.15, 4.1],
    look: [-0.7, 0.8, 1.6],
    zoom: 1,
    whip: -1,
  },
  // POV: everything blurs
  {
    at: T.verschwimmt,
    from: [0.15, 1.55, 2.2],
    to: [0.1, 1.5, 2.5],
    look: [2.2, 1.3, 12],
    zoom: 1,
    focus: 0.6,
  },
  // "Rate mal": front, the eye blinks like crazy while the counter runs
  { at: T.rate, from: [0, 1.85, 7.4], to: [0, 1.7, 6.2], look: [0, 1.6, 1.1], zoom: 1 },
  // on the phone: over the phone's shoulder at the staring eye
  {
    at: T.handy,
    from: [2.7, 2.6, 7.2],
    to: [2.2, 2.3, 6.4],
    look: [0, 1.6, 2.2],
    zoom: 1,
    whip: 1,
  },
  // the cornea in profile
  { at: T.warum, from: [3.6, 1.75, 2.7], to: [3.1, 1.65, 2.4], look: [0, 1.5, 1.75], zoom: 1 },
  // it drinks tears: high front
  { at: T.trinkt, from: [0.6, 3.0, 4.5], to: [0.45, 2.7, 4.0], look: [0, 1.5, 1.7], zoom: 1 },
  // the lid = windscreen wiper
  { at: T.lid, from: [0, 2.1, 5.4], to: [0, 1.9, 4.7], look: [0, 1.5, 1.7], zoom: 1 },
  // payoff: wide front …
  { at: T.einen2, from: [0, 2.7, 9.2], to: [0, 2.35, 8.0], look: [0, 1.45, 0], zoom: 1 },
  // … and the lid slams shut
  { at: T.knallt, from: [0.85, 1.95, 4.7], to: [0.5, 1.75, 4.0], look: [0, 1.5, 1.5], zoom: 1 },
  // Übrigens: blind half an hour a day
  { at: T.fakt, from: [-1.9, 2.35, 6.1], to: [-1.25, 2.05, 5.0], look: [0, 1.5, 1.2], zoom: 1 },
  // last picture: the wet, shining eye, open
  { at: T.schneidet, from: [0, 1.7, 4.6], to: [0, 1.62, 3.8], look: [0, 1.52, 1.8], zoom: 1 },
];

export const LABELS = [
  {
    text: "Tränenfilm",
    at: T.traenenfilm + 0.1,
    until: T.reisst + 0.6,
    pos: [-0.35, 2.1, 1.75],
    side: -1,
  },
  { text: "Hornhaut", at: T.hornhaut, until: T.trinkt, pos: [0, 1.62, 1.86], side: 1 },
  { text: "Lid", at: T.wischer, until: T.einen2, pos: [0.45, 2.55, 1.55], side: 1 },
];

export const HIGHLIGHTS = [
  { kind: "zoom", at: T.tag, amount: 0.3 },
  { kind: "zoom", at: T.mach, amount: 0.25 },
  { kind: "shake", at: T.brennt, dur: 0.5, amp: 0.6 },
  { kind: "slowmo", at: T.reisst, until: T.pfuetze, speed: 0.4 },
  { kind: "flash", at: T.alarm },
  { kind: "shake", at: T.alarm, dur: 0.5, amp: 0.7 },
  { kind: "zoom", at: T.zahl, amount: 0.3 },
  { kind: "flash", at: T.trueb },
  { kind: "zoom", at: T.wischer, amount: 0.25 },
  { kind: "flash", at: T.knallt + 0.08 },
  { kind: "shake", at: T.knallt + 0.08, dur: 0.6, amp: 1.0 },
  { kind: "zoom", at: T.stunde, amount: 0.3 },
];

export const SFX = [
  { s: "dehnen", at: 0.02, db: -8 },
  { s: "zisch", at: T.reisst, dur: T.alarm - T.reisst, db: -22 },
  { s: "piep", at: T.alarm, dur: 1.4, db: -18 },
  { s: "tropfen", at: T.traenen + 0.2, db: -11 },
  { s: "tropfen", at: T.traenen + 0.75, db: -13 },
  { s: "tropfen", at: T.traenen + 1.3, db: -12 },
  { s: "tropfen", at: T.trinkt + 0.15, db: -13 },
  { s: "tropfen", at: T.trinkt + 0.6, db: -14 },
  { s: "rauschen", at: T.wischer, dur: 0.8, db: -20 },
  { s: "klack", at: T.knallt + 0.08, db: -4 },
];
