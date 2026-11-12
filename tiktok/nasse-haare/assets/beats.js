// #77 Nasse Haare — every time-keyed decision as plain data (scene.js +
// scripts/build-sfx.mjs read the same numbers). No three.js / DOM here.
import { W } from "./timing.js";

export const T = {
  raus: W("raus"),
  mama: W("Mama"),
  erst: W("Erst"),
  gefrieren: W("gefrieren"),
  straehne: W("Strähne"),
  biegst: W("Biegst"),
  brechen: W("brechen"),
  dein: W("Dein"),
  trotzdem: W("Trotzdem"),
  erkaelt: W("Erkältungen"),
  viren: W("Viren", 1),
  warum: W("Warum"),
  rate: W("Rate"),
  waerme: W("Wärme"),
  nur: W("Nur", 2),
  zehntel: W("Zehntel"),
  der: W("Schwachpunkt") - 0.1,
  nase: W("Nase", 1),
  dort: W("Dort"),
  waechter: W("Wächter"),
  ab: W("ab", 1),
  kuehlt: W("Kühlt"),
  fuenf: W("fünf"),
  haelfte: W("Hälfte"),
  die: W("spazieren") - 0.3,
  payoff: W("unschuldig") - 0.6, // the line that answers the hook question
  unschuldig: W("unschuldig"),
  kalte: W("kalte"),
  schal: W("Schal"),
  fakt: W("Übrigens"),
  antarktis: W("Antarktis"),
  bis: W("bis"),
  flugzeug: W("Flugzeug"),
  foehnen: W("Föhnen"),
  komm: W("Kommentare") - 0.5,
};

// places (plain arrays; scene.js turns them into vectors)
export const NOSE = [0, -40, 0]; // inside the nose (closed tunnel under the world)
export const ANT = [170, 0, 0]; // Antarctic station (set.js)
const rel = (p) => ({ x: p[0], y: p[1], z: p[2] });

// distances are real (scene.js uses shotCamera(shots, 1))
export const shots = [
  // hook: you run out of the door straight at the camera
  { at: 0, from: [0.9, 2.9, 2.6], to: [0.4, 2.75, 2.3], look: [0, 2.3, -2], lookTo: [0, 2.6, 0] },
  { at: T.raus, from: [1.9, 2.9, 1.5], to: [1.6, 2.8, 1.2], look: [0, 2.6, 0] },
  { at: T.mama, from: [-1.6, 2.3, -2.6], to: [-1.2, 2.3, -3.4], look: [0.6, 2.2, -7.2] },
  { at: T.erst, from: [-1.6, 2.6, 3.6], to: [-1.2, 2.6, 3.0], look: [0, 2.4, 0] },
  { at: T.gefrieren - 0.12, from: [1.5, 3.0, 1.9], to: [1.1, 2.9, 1.5], look: [0.1, 2.5, 0] },
  { at: T.straehne, orbit: { c: [0, 2.4, 0], r: 2.6, y: 2.9, a0: 1.9, a1: 2.7 } },
  { at: T.biegst, from: [1.85, 2.3, 1.75], to: [1.55, 2.25, 1.5], look: [0.5, 2.1, 0.35] },
  { at: T.dein, from: [0.8, 2.3, 4.8], to: [0.4, 2.3, 4.2], look: [0, 2.2, 0], whip: 1 },
  { at: T.trotzdem, from: [-2.2, 2.9, 3.4], to: [-1.8, 2.8, 3.0], look: [0, 2.6, 0.2] },
  { at: T.erkaelt, from: [2.0, 2.6, 2.9], to: [1.6, 2.6, 2.5], look: [0.2, 2.6, 0.6] },
  { at: T.warum, orbit: { c: [0, 2, 0], r: 7, y: 3.2, a0: -0.7, a1: 0.1 } },
  { at: T.rate, from: [0, 2.9, 4.2], to: [0, 3.0, 3.6], look: [0, 2.8, 0] },
  { at: T.nur, from: [-1.3, 3.3, 2.8], to: [-1.0, 3.2, 2.4], look: [0, 2.9, 0] },
  // the weak spot: slow push-in on the face
  { at: T.der, from: [0.7, 2.6, 3.2], to: [0.2, 2.56, 1.6], look: [0, 2.55, 0.3] },
  // inside the nose
  { at: T.dort, from: [0.9, 0.35, 4.6], to: [0.6, 0.25, 3.9], look: [0, 0, 0], rel: rel(NOSE) },
  {
    at: T.kuehlt,
    from: [-1.0, 0.4, 4.4],
    to: [-0.7, 0.3, 3.8],
    look: [0, 0, -0.2],
    rel: rel(NOSE),
  },
  {
    at: T.die,
    from: [0.4, -0.3, 4.4],
    to: [0.2, -0.1, 2.9],
    look: [0, 0, -2.5],
    rel: rel(NOSE),
    whip: -1,
  },
  // payoff
  { at: T.payoff, from: [-1.1, 3.0, 3.2], to: [-0.8, 3.0, 2.7], look: [0, 2.8, 0] },
  { at: T.kalte, from: [1.3, 2.55, 2.2], to: [0.9, 2.55, 1.8], look: [0, 2.5, 0.4] },
  // Übrigens: Antarctica
  { at: T.fakt, from: [5, 2.6, 9.5], to: [3.5, 2.3, 8], look: [-1.6, 1.9, -1.5], rel: rel(ANT) },
  {
    at: T.bis,
    from: [-6, 1.8, 8],
    to: [-4.5, 2.2, 7],
    look: [3, 3, -1],
    lookTo: [2.2, 1.4, 1],
    rel: rel(ANT),
  },
  // CTA: hair dryer or air?
  { at: T.foehnen, from: [1.7, 2.8, 3.2], to: [1.3, 2.8, 2.8], look: [0.55, 2.65, 0] },
  { at: T.komm, from: [0.7, 2.85, 3.7], to: [0.55, 2.8, 3.2], look: [0.5, 2.6, 0] },
];

// one tag at a time, 3 in total
export const LABELS = [
  { text: "Viren", at: T.viren, until: T.warum, pos: [0.45, 2.62, 1.0], side: 1 },
  { text: "Nase", at: T.nase, until: T.dort, pos: [0, 2.56, 0.5], side: -1 },
  { text: "Wächter", at: T.waechter, until: T.kuehlt, pos: [-0.75, -40 + 0.55, 0.6], side: -1 },
];

export const HIGHLIGHTS = [
  { kind: "zoom", at: W("nassen"), amount: 0.3 },
  { kind: "flash", at: T.gefrieren },
  { kind: "shake", at: T.brechen, dur: 0.4, amp: 0.8 },
  { kind: "zoom", at: T.viren, amount: 0.3 },
  { kind: "flash", at: T.zehntel },
  { kind: "zoom", at: T.nase, amount: 0.4 },
  { kind: "shake", at: T.haelfte, dur: 0.4, amp: 0.6 },
  { kind: "flash", at: T.unschuldig },
  { kind: "zoom", at: T.schal, amount: 0.25 },
  { kind: "shake", at: T.flugzeug + 0.9, dur: 0.5, amp: 0.8 },
];

export const SFX = [
  { s: "klack", at: 0.02 }, // the door flies open on frame 0
  { s: "rauschen", at: 0.02, dur: 2.4, db: -19 }, // icy wind
  { s: "eisknistern", at: T.gefrieren - 0.05, db: -8 }, // own sound: the hair freezes
  { s: "knack", at: T.brechen, db: -6 }, // own sound: the frozen strand snaps
  { s: "pop", at: T.viren },
  { s: "pop", at: T.waechter + 0.1 },
  { s: "pop", at: T.ab + 0.05, db: -10 },
  { s: "zisch", at: T.kuehlt, dur: 1.0, db: -20 }, // the cold creeps into the nose
  { s: "boing", at: T.schal + 0.1, db: -10 }, // viruses bounce off the scarf
  { s: "brumm", at: T.bis, dur: T.foehnen - T.bis, db: -17 }, // the plane
  { s: "rauschen", at: T.foehnen + 0.15, dur: 2.2, db: -17 }, // hair dryer
];
