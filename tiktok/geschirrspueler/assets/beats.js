// Geschirrspüler beats: every time-keyed decision as plain data, so scene.js
// (picture) and scripts/build-sfx.mjs (sound) read the same numbers.
// Keep this file free of three.js / DOM: it is imported by node too.
import { W } from "./timing.js";

// ---------------------------------------------------------------- layout
// Shared with scene.js (plain numbers only).
export const P = [0.45, 0.16, 0.15]; // circulation pump (under the tub floor)
export const ARM_LO = [0, 0.38, 0]; // lower spray arm hub
export const ARM_UP = [0, 1.22, 0]; // upper spray arm hub
export const SK = [5.0, 0, 2.0]; // kitchen sink set (bonus fact)

// ---------------------------------------------------------------- beats
export const T = {
  zehn: W("zehn"),
  lass: W("Lass"),
  kiste: W("Kiste"),
  koerben: W("Körben"),
  mulde: W("Mulde"),
  drei: W("drei"),
  heiss: W("heiß"),
  reicht: W("Reicht"),
  trick: W("Trick"),
  pumpe: W("Pumpe"),
  drueckt: W("drückt"),
  drehende: W("drehende"),
  arme: W("Arme"),
  teller: W("Teller"),
  sprueharm: W("Sprüharm"),
  tropft: W("tropft"),
  sieb: W("Sieb"),
  hoch: W("hoch"),
  hoer: W("Hör"),
  rauschen: W("Rauschen"),
  dasselbe: W("dasselbe"),
  umwaelz: W("Umwälzpumpe"),
  ende: W("Ende"),
  frisch: W("frisch"),
  schau: W("Schau"),
  gerade: W("gerade"),
  uebrigens: W("Übrigens"),
  hand: W("Hand", 1),
  fuenfzig: W("50"),
  spuelst: W("Spülst"),
};

const rel = (p, d) => p.map((v, i) => v + d[i]);

// ---------------------------------------------------------------- shots
export const shots = [
  // hook: the running machine in x-ray, jets everywhere
  { at: 0, from: [1.25, 1.45, 2.5], to: [0.95, 1.3, 2.15], look: [0, 0.85, 0], zoom: 1.5 },
  {
    at: T.zehn - 0.1,
    from: [-0.75, 0.75, 1.25],
    to: [-0.6, 0.7, 1.05],
    look: [0, 0.5, 0.05],
    zoom: 1.35,
  },
  // build: it shrinks away and pops back as a fresh build
  { at: T.lass, from: [2.6, 2.0, 4.6], to: [2.2, 1.8, 4.0], look: [0, 0.85, 0] },
  { at: T.koerben, from: [-1.5, 1.7, 2.4], to: [-1.25, 1.55, 2.05], look: [0, 0.85, 0] },
  // the sump fills, the heater glows
  { at: T.mulde, from: [0.55, 0.42, 1.25], to: [0.4, 0.4, 1.05], look: [0, 0.22, 0], zoom: 1.3 },
  { at: T.heiss, from: [-0.65, 0.45, 1.05], to: [-0.5, 0.42, 0.9], look: [0, 0.24, 0], zoom: 1.3 },
  { at: T.reicht, from: [1.7, 1.4, 2.9], to: [1.4, 1.25, 2.5], look: [0, 0.6, 0] },
  // the trick: pump, pipes, spinning arms
  {
    at: T.trick,
    from: rel(P, [0.7, 0.3, 1.05]),
    to: rel(P, [0.55, 0.25, 0.9]),
    look: P,
    zoom: 1.3,
  },
  { at: T.drueckt, from: [2.0, 1.3, 1.5], to: [1.75, 1.2, 1.3], look: [0, 0.72, -0.2], zoom: 1.5 },
  {
    at: T.drehende,
    from: [0.55, 0.62, 1.05],
    to: [0.4, 0.58, 0.9],
    look: [0, 0.4, 0],
    zoom: 1.25,
  },
  { at: T.teller, from: [-0.8, 0.9, 1.05], to: [-0.6, 0.85, 0.9], look: [0, 0.68, 0], zoom: 1.3 },
  { at: T.sprueharm, orbit: { c: [0, 0.6, 0], r: 2.3, y: 1.3, a0: 0.6, a1: -0.25 }, zoom: 1.2 },
  // the water comes back down, the filter, round and round
  { at: T.tropft, from: [0.65, 0.8, 1.2], to: [0.5, 0.75, 1.0], look: [0, 0.45, 0], zoom: 1.3 },
  { at: T.sieb, from: [0.3, 0.55, 0.9], to: [0.22, 0.5, 0.78], look: [0, 0.3, 0], zoom: 1.25 },
  { at: T.hoch, from: [1.9, 1.25, 2.1], to: [1.6, 1.15, 1.8], look: [0, 0.7, 0], zoom: 1.5 },
  {
    at: T.hoer,
    from: rel(P, [-0.55, 0.3, 1.0]),
    to: rel(P, [-0.4, 0.25, 0.85]),
    look: P,
    zoom: 1.3,
  },
  { at: T.dasselbe, from: [0.9, 1.3, 2.8], to: [0.7, 1.2, 2.4], look: [0, 0.8, 0] },
  {
    at: T.umwaelz,
    from: rel(P, [0.7, 0.25, 0.9]),
    to: rel(P, [0.55, 0.22, 0.8]),
    look: P,
    zoom: 1.3,
  },
  // drain, fresh rinse
  { at: T.ende, from: [1.9, 0.75, 1.3], to: [1.7, 0.7, 1.1], look: [0.75, 0.22, -0.1], zoom: 1.3 },
  { at: T.frisch, from: [0.65, 1.15, 1.4], to: [0.5, 1.05, 1.2], look: [0, 0.8, 0], zoom: 1.35 },
  // outro: x-ray off, door opens, drone pull-back
  { at: T.schau, from: [0.9, 1.45, 3.5], to: [0.6, 1.35, 3.0], look: [0, 0.85, 0] },
  {
    at: T.gerade,
    from: [2.8, 2.4, 5.2],
    to: [5.5, 4.4, 9.5],
    look: [0, 0.8, 0],
    lookTo: [0, 0.6, 0],
  },
  // bonus fact: the overflowing sink
  {
    at: T.uebrigens,
    from: rel(SK, [0.55, 1.75, 1.5]),
    to: rel(SK, [0.4, 1.6, 1.3]),
    look: rel(SK, [-0.05, 0.92, 0]),
    zoom: 1.3,
  },
  {
    at: T.fuenfzig,
    from: rel(SK, [-0.9, 1.35, 1.7]),
    to: rel(SK, [-0.75, 1.25, 1.5]),
    look: rel(SK, [-0.1, 0.6, 0.4]),
    zoom: 1.3,
  },
  // CTA: wide drone shot over the plaza
  {
    at: T.spuelst,
    from: [4.5, 3.8, 8.5],
    to: [9.5, 8.0, 17],
    look: [0, 0.9, 0],
    lookTo: [0, 0.5, 0],
  },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Korb", at: T.koerben + 0.2, until: T.mulde, pos: [0.62, 0.72, 0.45], side: 1 },
  { text: "Mulde", at: T.mulde, until: T.heiss, pos: [0, 0.2, 0.3], side: -1 },
  { text: "Heizstab", at: T.heiss, until: T.reicht, pos: [0.45, 0.33, 0.2], side: 1 },
  { text: "Pumpe", at: T.pumpe + 0.35, until: T.drueckt + 0.6, pos: rel(P, [0, 0.12, 0]), side: 1 },
  { text: "Sprüharm", at: T.sprueharm, until: T.tropft, pos: [0.28, 0.39, 0.1], side: 1 },
  { text: "Sieb", at: T.sieb + 0.4, until: T.hoch, pos: [0, 0.32, 0.22], side: -1 },
  { text: "Umwälzpumpe", at: T.umwaelz, until: T.ende, pos: rel(P, [0, 0.12, 0]), side: 1 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "rauschen", at: 0.05, dur: T.lass - 0.1, db: -22 }, // running in the hook
  { s: "pop", at: T.lass + 0.45 }, // machine pops back in
  { s: "pop", at: T.koerben }, // baskets
  { s: "pop", at: T.mulde + 0.05 }, // sump
  { s: "rauschen", at: T.drei, dur: 0.9, db: -20 }, // sump fills
  { s: "surr", at: T.heiss, dur: T.reicht - T.heiss, db: -22 }, // heater
  { s: "zisch", at: T.heiss + 0.2, dur: 0.6, db: -24 }, // steam
  { s: "klack", at: T.reicht + 0.05 }, // nope
  { s: "pop", at: T.pumpe + 0.05 }, // pump
  { s: "brumm", at: T.pumpe + 0.6, dur: T.ende - T.pumpe - 0.4, db: -26 },
  { s: "pop", at: T.drehende + 0.05 }, // spray arms
  { s: "rauschen", at: T.arme, dur: T.hoer - T.arme, db: -23 },
  { s: "rauschen", at: T.hoer, dur: T.umwaelz - T.hoer, db: -17 }, // "Hör mal hin"
  { s: "pop", at: T.sieb + 0.1 }, // filter
  { s: "rauschen", at: T.ende + 0.1, dur: 0.8, db: -20 }, // drain
  { s: "rauschen", at: T.frisch, dur: T.schau - T.frisch, db: -22 }, // fresh rinse
  { s: "klack", at: T.schau + 0.2 }, // door opens
  { s: "pop", at: T.uebrigens + 0.1 }, // sink set
  { s: "rauschen", at: T.uebrigens + 0.3, dur: T.spuelst - T.uebrigens - 0.3, db: -20 }, // tap
  { s: "boing", at: T.fuenfzig + 0.1, db: -18 }, // overflow
];
