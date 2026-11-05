// #61 Niesen (Format B: „Was passiert, wenn du mit offenen Augen niest?“) —
// every time-keyed decision as plain data, read by scene.js (picture) and
// scripts/build-sfx.mjs (sound). No three.js / DOM here.
import { W } from "./timing.js";

// ---------------------------------------------------------------- anchors
export const T = {
  dabei: W("dabei"),
  augen1: W("Augen", 1),
  angeblich: W("Angeblich"),
  raus1: W("raus", 1),
  finger: W("Finger"),
  lider1: W("Lider", 1),
  brust: W("Brustkorb"),
  dann: W("dann"),
  hatschi: W("Hatschi"),
  wolke: W("Wolke"),
  quer: W("quer"),
  zimmer: W("Zimmer"),
  lider2: W("Lider", 2),
  zu: W("zu", 1),
  reflex: W("Reflex"),
  gef: W("Gefährlich"),
  festhaeltst: W("festhältst"),
  folge: W("Folge"),
  nase: W("Nase"),
  mund: W("Mund"),
  druck: W("Druck"),
  hals1: W("Hals", 1),
  mann: W("Mann"),
  steuer: W("Steuer"),
  rate: W("Rate"),
  loch: W("Loch"),
  luft: W("Luftröhre"),
  zwei: W("Zwei"),
  anderer: W("anderer"),
  woche: W("Woche"),
  schlucken: W("schlucken"),
  augen2: W("Augen", 2),
  drin: W("drin"),
  gefahr: W("Gefahr"),
  lass: W("Lass"),
  armbeuge: W("Armbeuge"),
  fakt: W("Übrigens"),
  vierte: W("Vierte"),
  sonne: W("Sonne"),
  gehoerst: W("Gehörst"),
};
// derived moments
T.stifle = T.mund + 0.55; // the trapped sneeze (mouth + nose shut)
T.carMpf = T.steuer + 0.45; // the driver stifles his sneeze
T.elbow = T.armbeuge + 0.15; // the sneeze into the elbow
T.sunSneeze = T.sonne + 0.3; // the photic sneeze

// ---------------------------------------------------------------- places
// The person sits on the blanket at the origin, facing +z.
export const HEAD = [0, 2.95, 0.05];
export const EYE = [0.27, 3.08, 0.62]; // the person's left eye (+x side)
export const MOUTH = [0, 2.65, 0.74];
// the Scottish country road (set.js) and the giant windpipe section (a closed
// dome high above the meadow, scene.js)
export const SCOT = [26, 0, 18];
export const CUT = [0, 42, 60];
export const HOLE = [0, 0.6, 1.42]; // relative to CUT, on the windpipe's front
const e = (x, y, z) => [EYE[0] + x, EYE[1] + y, EYE[2] + z];
const s = (x, y, z) => [SCOT[0] + x, SCOT[1] + y, SCOT[2] + z];
const c = (x, y, z) => [CUT[0] + x, CUT[1] + y, CUT[2] + z];
const hole = (x = 0, y = 0, z = 0) => c(HOLE[0] + x, HOLE[1] + y, HOLE[2] + z);
// the sun (set.js sunDir, normalised) — the head turns to it in the "Übrigens"
export const SUN = [0.69, 0.16, 0.7];

// ---------------------------------------------------------------- shots
// shotCamera(shots, 1): from / to are real camera positions (no pull-back)
export const shots = [
  // 0 frame 0: the face, fingers pulling the lids wide open, "ah…"
  { at: 0, from: [0.75, 3.3, 2.5], to: [0.38, 3.12, 1.62], look: [0.05, 3.0, 0.6] },
  // 1 who and where: you on the blanket in the meadow
  { at: T.dabei, from: [-2.4, 3.1, 6.6], to: [-1.8, 2.85, 5.6], look: [0, 2.3, 0] },
  // 2 "Angeblich …" — macro on the stretched-open eye
  { at: T.angeblich, from: e(0.62, 0.22, 0.85), to: e(0.34, 0.1, 0.5), look: e(0, 0, 0) },
  // 3 "… fliegen sie dir jetzt raus" — the myth: eyes on springs
  { at: T.raus1 - 0.3, from: [0.2, 3.15, 3.1], to: [0.1, 3.05, 2.35], look: [0, 3.0, 0.9] },
  // 4 "Deine Finger halten die Lider fest"
  { at: T.finger, from: [2.0, 3.35, 2.0], to: [1.55, 3.18, 1.62], look: [0.12, 3.0, 0.5] },
  // 5 "Dein Brustkorb spannt sich" — low, slow: the calm before
  { at: T.brust, from: [3.7, 1.5, 4.4], to: [3.1, 1.85, 3.6], look: [0, 2.3, 0.3] },
  // 6 HATSCHI — profile, the cloud bursts to screen right (slow motion)
  { at: T.hatschi - 0.12, from: [-3.1, 3.0, 1.95], to: [-2.55, 2.9, 2.0], look: [0, 2.78, 1.05] },
  // 7 "Eine Wolke aus Spucke …" — from above, chasing the cloud over the meadow
  {
    at: T.wolke,
    from: [-3.2, 5.6, -2.2],
    to: [-3.6, 4.2, 4.6],
    look: [0, 1.6, 6.5],
    lookTo: [0, 1.2, 12],
  },
  // 8 "quer durchs halbe Zimmer" — low in the grass far out, the cloud comes at you
  {
    at: T.quer - 0.08,
    from: [1.6, 1.15, 17],
    to: [1.3, 1.0, 15],
    look: [0, 1.7, 4],
    whip: 1,
  },
  // 9 "Und deine Lider? Wollen trotzdem zu." — the lids fight the fingers
  { at: T.lider2 - 0.25, from: e(0.12, 0.06, 0.95), to: e(0.08, 0.04, 0.62), look: e(0, 0, 0) },
  // 10 "Ein Reflex" — extreme macro
  { at: T.reflex - 0.05, from: e(-0.34, 0.2, 0.6), to: e(-0.22, 0.12, 0.4), look: e(0, 0, 0) },
  // 11 "Gefährlich wird's erst …" — front, slow push, the hands move
  { at: T.gef, from: [0, 3.45, 4.3], to: [0, 3.2, 3.4], look: [0, 2.8, 0.4] },
  // 12 Folge für mehr Wissen — wide, golden meadow, hill and oak
  { at: T.folge, from: [-6.2, 3.6, 9.2], to: [-5.0, 3.2, 8.0], look: [0, 2.4, -2] },
  // 13 "Nase zu, Mund zu" — close: pinched nose, hand over the mouth, cheeks puff
  { at: T.nase, from: [0.75, 3.2, 2.7], to: [0.45, 3.08, 2.05], look: [0, 2.85, 0.6] },
  // 14 "der Druck bleibt in deinem Hals" — x-ray, the windpipe swells
  { at: T.druck - 0.1, from: [-3.7, 2.45, 0.7], to: [-3.05, 2.35, 0.55], look: [0, 2.2, 0.1] },
  // 15 "Ein Mann in Schottland …" — the highland road, the car comes
  {
    at: T.mann,
    from: s(-10, 4.2, 3.5),
    to: s(-8, 3.4, 4.5),
    look: s(-3.5, 0.8, -2.2),
    lookTo: s(-1, 0.8, -0.5),
  },
  // 16 "… hat das am Steuer gemacht" — close on the driver (right-hand drive)
  { at: T.steuer - 0.15, from: s(-4.4, 2.3, 4.8), to: s(-3.7, 2.05, 4.2), look: s(0.9, 1.1, 0.7) },
  // 17 "Rate mal" — inside: the giant windpipe, pressure builds
  { at: T.rate, orbit: { c: c(0, 0.9, 0), r: 9.5, y: CUT[1] + 3.0, a0: 0.55, a1: 0.1 } },
  // 18 "Ein Loch in seiner Luftröhre" — crash in on the tear
  { at: T.loch - 0.06, from: hole(1.5, 0.5, 3.4), to: hole(0.9, 0.25, 2.3), look: hole(0, 0, 0) },
  // 19 "Zwei Millimeter" — macro of the tear
  { at: T.zwei, from: hole(-0.5, 0.35, 1.7), to: hole(-0.35, 0.25, 1.3), look: hole(0, 0, 0) },
  // 20 "Ein anderer konnte eine Woche kaum schlucken" — x-ray body, throat red
  { at: T.anderer, from: [1.4, 3.1, 4.8], to: [1.0, 2.85, 3.9], look: [0, 2.35, 0.2] },
  // 21 payoff "Deine Augen bleiben drin" — solid again, eyes wide and fine
  { at: T.augen2, from: [0.1, 3.18, 2.7], to: [0.05, 3.08, 1.95], look: [0, 3.0, 0.6] },
  // 22 "Lass das Niesen raus, in die Armbeuge"
  { at: T.lass, from: [2.7, 3.1, 3.5], to: [2.15, 2.95, 2.85], look: [0.1, 2.75, 0.5], whip: -1 },
  // 23 "Übrigens: jeder Vierte … in die Sonne" — behind the head, into the sun
  { at: T.fakt, from: [-4.4, 2.0, -3.4], to: [-3.9, 2.15, -2.9], look: [6.9, 7.6, 7.05] },
  // 24 comment question — wide, golden, rising
  { at: T.gehoerst, from: [4.6, 3.2, 8.6], to: [6.4, 5.2, 11.6], look: [0, 2.2, -1] },
];

// ---------------------------------------------------------------- labels
export const ELBOW_AT = [0.12, 2.62, 1.08]; // the elbow crook in front of the mouth (scene.js pose)
export const LABELS = [
  { text: "Augenlid", at: T.lider1, until: T.brust, pos: e(0.0, 0.17, 0.08), side: 1 },
  { text: "Reflex", at: T.reflex, until: T.gef, pos: e(0.0, 0.1, 0.12), side: -1 },
  { text: "Druck", at: T.druck + 0.15, until: T.mann, pos: [0, 2.28, 0.12], side: 1 },
  { text: "Luftröhre", at: T.luft, until: T.zwei, pos: hole(-0.9, 0.9, -0.35), side: -1 },
  { text: "Armbeuge", at: T.armbeuge, until: T.fakt, pos: ELBOW_AT, side: 1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "zoom", at: 0.3, amount: 0.25 }, // the face pushes in
  { kind: "shake", at: 0.95, dur: 0.3, amp: 0.4 }, // "ah—" twitch
  { kind: "zoom", at: T.raus1, amount: 0.3 }, // the eyes shoot out (myth)
  { kind: "flash", at: T.raus1 + 0.05 },
  { kind: "slowmo", at: T.hatschi - 0.12, until: T.wolke, speed: 0.35 }, // money shot
  { kind: "flash", at: T.hatschi },
  { kind: "shake", at: T.hatschi, dur: 0.6, amp: 1.0 },
  { kind: "zoom", at: T.reflex, amount: 0.3 },
  { kind: "shake", at: T.druck + 0.1, dur: 0.8, amp: 0.7 },
  { kind: "shake", at: T.carMpf, dur: 0.5, amp: 0.6 },
  { kind: "zoom", at: T.loch, amount: 0.35 },
  { kind: "flash", at: T.loch + 0.05 },
  { kind: "flash", at: T.drin },
  { kind: "zoom", at: T.vierte, amount: 0.3 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "einatmen", at: 0, db: -5 }, // frame 0: "ah … aah"
  { s: "boing", at: T.raus1 + 0.05, db: -10 }, // eyes on springs
  { s: "einatmen", at: T.brust - 0.1, db: -5 },
  { s: "hatschi", at: T.hatschi - 0.03 },
  { s: "rauschen", at: T.wolke, dur: 2.6, db: -22 }, // the cloud flies
  { s: "mpf", at: T.stifle }, // trapped sneeze
  { s: "rauschen", at: T.druck, dur: 1.8, db: -24 }, // pressure
  { s: "brumm", at: T.mann, dur: T.rate - T.mann - 0.1, db: -21 }, // the car engine
  { s: "mpf", at: T.carMpf, db: -2 },
  { s: "blip", at: T.rate + 0.6, db: -16 },
  { s: "zisch", at: T.loch + 0.1, dur: 1.3, db: -15 }, // air through the tear
  { s: "hatschi", at: T.elbow - 0.03, db: -12 }, // into the elbow, muffled
  { s: "hatschi", at: T.sunSneeze - 0.03, db: -7 },
];
