// MRT (#26): every time-keyed decision of the video as plain data, so
// scene.js (picture) and scripts/build-sfx.mjs (sound) read the same numbers.
// Keep this file free of three.js / DOM: it is imported by node too.
import { W } from "./timing.js";

// ---------------------------------------------------------------- beats
export const T = {
  foto: W("fotografiert"),
  wasser: W("Wasser"),
  trotzdem: W("Trotzdem"),
  haemmert: W("hämmert"),
  baustelle: W("Baustelle"),
  warum: W("Warum"),
  indir: W("In", 1),
  kompass: W("Kompassnadeln"),
  tunnel: W("Im", 1),
  zack: W("zack"),
  das2: W("Das", 2),
  magnet: W("Magnet", 1),
  zahl: W("bis"),
  folg: W("Folg"),
  dann: W("Dann"),
  funk: W("Funkimpuls"),
  alle2: W("alle", 2),
  zurueck: W("Zurückschnappen"),
  funken: W("funken"),
  ein2: W("ein", 2),
  aber: W("Aber"),
  spulen: W("Spulen", 1),
  blitz: W("blitzschnell"),
  jede: W("Jede"),
  und1: W("Und", 1),
  zittern: W("zittern"),
  daher: W("Daher"),
  fakt: W("Übrigens"),
  flasche: W("Sauerstoffflasche"),
  quer: W("quer"),
  fliegen: W("fliegen"),
  warst: W("Warst"),
};
// the bottle hits the magnet just before "fliegen" ends
T.klonk = T.fliegen - 0.12;

// ---------------------------------------------------------------- places
// (world coordinates, shared with scene.js)
export const DROP = [5.0, 2.05, 1.0]; // the water drop with the compass needles
export const MON = [-4.6, 1.0, 0.55]; // monitor: x, z, yaw (screen centre y = 2.3)
// screen centre and its normal, for the camera
const MC = [MON[0] + Math.sin(MON[2]) * 0.06, 2.3, MON[1] + Math.cos(MON[2]) * 0.06];
const mcam = (d, dy = 0, side = 0) => [
  MC[0] + Math.sin(MON[2] + side) * d,
  MC[1] + dy,
  MC[2] + Math.cos(MON[2] + side) * d,
];
export const BOTTLE = [-5.6, 3.4]; // oxygen bottle on its cart (x, z)

// ---------------------------------------------------------------- shots
// zoom 1 everywhere: from / to are the real camera positions.
const G = [0, 1.45, 0]; // bore centre
export const shots = [
  // hook: your hand starts the scan, the magnet knocks — fast push-in
  { at: 0, from: [3.9, 2.5, 6.6], to: [2.7, 2.15, 4.7], look: [0.35, 1.45, 1.0] },
  // the picture made of water: the monitor
  { at: T.foto, from: mcam(3.7, 0.1), to: mcam(3.0, 0.0), look: MC },
  // … out of water: close on the screen, the water dots glint
  { at: T.wasser, from: mcam(1.9, 0.15), to: mcam(1.55, 0.2), look: [MC[0], 2.45, MC[2]] },
  // … and it hammers like a building site: low, shaking
  { at: T.trotzdem, from: [-2.6, 0.75, 5.6], to: [-1.9, 0.9, 4.6], look: [0, 1.6, 0.4] },
  // inside you: the water drop with the tumbling compass needles
  { at: T.indir, from: [DROP[0] + 0.3, 2.5, 7.9], to: [DROP[0], 2.2, 6.9], look: DROP, whip: 1 },
  // into the tunnel
  { at: T.tunnel, from: [6.6, 2.7, 3.4], to: [5.8, 2.4, 2.9], look: [0, 1.3, 1.0] },
  // zack — all needles snap into line (slow motion)
  { at: T.zack, from: [DROP[0] - 0.4, 2.3, 6.6], to: [DROP[0] - 0.2, 2.15, 6.2], look: DROP },
  // the magnet: x-ray, the big coil glows
  { at: T.das2, from: [-3.6, 2.9, 5.6], to: [-2.9, 2.6, 4.9], look: [0, 1.5, 0.1] },
  // follow line: a calm orbit while the field lines grow
  { at: T.folg, orbit: { c: [0, 1.6, 0.2], r: 7.4, y: 3.4, a0: 0.55, a1: 1.05 } },
  // the radio pulse: close on the bore
  { at: T.dann, from: [2.6, 2.5, 4.9], to: [2.1, 2.25, 4.1], look: G },
  // the needles tip over and snap back
  { at: T.alle2, from: [DROP[0] + 0.5, 2.4, 6.7], to: [DROP[0] + 0.2, 2.2, 6.1], look: DROP },
  // the echo becomes a picture: slice by slice on the monitor
  { at: T.ein2, from: mcam(2.9, -0.25, 0.25), to: mcam(2.5, -0.1, 0.18), look: MC },
  // but where does each echo come from?
  { at: T.aber, from: [-1.6, 2.9, 6.4], to: [-1.2, 2.6, 5.4], look: [0, 1.45, 0.6] },
  // the coils: crash zoom, side x-ray
  { at: T.spulen, from: [3.4, 2.3, 2.5], to: [2.8, 2.0, 2.0], look: G },
  // every spot its own tone: from above, rainbow slices
  { at: T.jede, from: [3.6, 4.4, 1.6], to: [3.0, 3.9, 1.1], look: [0, 1.35, 0], whip: -1 },
  // payoff: the coils shake
  { at: T.und1, from: [-3.1, 2.5, 4.7], to: [-2.6, 2.25, 4.0], look: G },
  // … that's the noise: solid, low, the whole machine shudders
  { at: T.daher, from: [3.7, 1.0, 6.4], to: [3.1, 1.1, 5.5], look: [0, 1.5, 0.5] },
  // the magnet is never off: the whole room, the bottle on its cart
  { at: T.fakt, from: [7.6, 4.6, 10.8], to: [6.6, 4.1, 9.3], look: [-1.6, 1.4, 0.6] },
  // the bottle — from behind it, towards the magnet
  {
    at: T.flasche,
    from: [-8.3, 2.3, 5.4],
    to: [-7.7, 2.1, 4.9],
    look: [-2.2, 1.5, 1.2],
    whip: -1,
  },
  // CTA: drone pull-back over the whole room
  {
    at: T.warst,
    from: [2.4, 2.5, 6.2],
    to: [10.5, 8.2, 16.5],
    look: [0, 1.4, 0.3],
    lookTo: [0, 0.8, 0],
  },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Magnet", at: T.magnet, until: T.zahl + 0.35, pos: [0.9, 2.45, 0.5], side: 1 },
  { text: "Funkimpuls", at: T.funk, until: T.alle2 - 0.05, pos: [-0.55, 2.05, 0.6], side: -1 },
  { text: "Spulen", at: T.spulen, until: T.jede - 0.1, pos: [0.3, 2.37, -0.55], side: 1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "flash", at: 0.42 }, // the scan starts
  { kind: "zoom", at: 0.5, amount: 0.22 },
  { kind: "shake", at: T.haemmert, dur: 0.55, amp: 0.8 },
  { kind: "shake", at: T.baustelle, dur: 0.5, amp: 0.6 },
  { kind: "flash", at: T.zack },
  { kind: "slowmo", at: T.zack, until: T.das2, speed: 0.3 }, // needles snap into line
  { kind: "zoom", at: T.magnet, amount: 0.3 },
  { kind: "flash", at: T.funk },
  { kind: "shake", at: T.zurueck, dur: 0.4, amp: 0.5 },
  { kind: "zoom", at: T.ein2, amount: 0.28 },
  { kind: "zoom", at: T.spulen, amount: 0.4 },
  { kind: "shake", at: T.zittern, dur: 1.2, amp: 1.0 },
  { kind: "shake", at: T.daher, dur: 0.6, amp: 0.7 },
  { kind: "shake", at: T.klonk, dur: 0.6, amp: 1.0 },
];

// ---------------------------------------------------------------- sound
// Own sounds (scripts/sfx-extra.py): mrtklopf = the MRT's knocking (gradient
// coils switching), klonk = the oxygen bottle hitting the magnet.
export const SFX = [
  { s: "mrtklopf", at: 0, dur: T.trotzdem - 0.1, db: -13 }, // frame 0: the scan knocks
  { s: "click", at: 0.42 }, // your finger on the start button
  { s: "mrtklopf", at: T.trotzdem, dur: T.indir - T.trotzdem + 0.1, db: -9 },
  { s: "pop", at: T.indir + 0.05 }, // the drop pops in
  { s: "klack", at: T.zack + 0.02, db: -10 }, // needles snap into line
  { s: "surr", at: T.funk, dur: 0.8, db: -17 }, // radio pulse
  { s: "surr", at: T.ein2, dur: 1.4, db: -21 }, // the picture builds
  { s: "mrtklopf", at: T.spulen, dur: T.jede - T.spulen, db: -19 },
  { s: "mrtklopf", at: T.zittern, dur: T.fakt - T.zittern, db: -9 }, // the noise, loud
  { s: "whoosh", at: T.quer + 0.1, db: -8 }, // the bottle flies
  { s: "klonk", at: T.klonk, db: -6 },
];
