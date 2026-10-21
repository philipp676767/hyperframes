// Atomkraftwerk beats: every time-keyed decision as plain data, so scene.js
// (picture) and scripts/build-sfx.mjs (sound) read the same numbers.
// Keep this file free of three.js / DOM: it is imported by node too.
import { W } from "./timing.js";

// ---------------------------------------------------------------- layout
// Shared with scene.js (plain numbers only).
export const R = [-1.5, 0, 0.3]; // reactor building centre
export const H = [1.3, 0, 0.6]; // turbine hall centre
export const C = [1.6, 0, -2.5]; // cooling tower centre
export const PY = [3.6, 0, -0.6]; // power pylon
export const SP = [-5.0, 0, 2.2]; // sponge analogy set
export const WR = [-4.6, 0, -2.6]; // wind turbine analogy set

// ---------------------------------------------------------------- beats
export const T = {
  wasserkocher: W("Wasserkocher"),
  wolke1: W("Wolke", 1),
  rauch: W("Rauch"),
  lass: W("Lass"),
  brauchst: W("brauchst"),
  uran: W("Uran"),
  atome: W("Atome"),
  teilchen1: W("Teilchen", 1),
  kette: W("Kettenreaktion"),
  wasser1: W("Wasser", 1),
  n300: W("300"),
  reaktor: W("Reaktor"),
  wehe: W("wehe"),
  ruder: W("Ruder"),
  trick: W("Trick"),
  brennstaebe: W("Brennstäbe"),
  steuer: W("Steuerstäbe"),
  schlucken: W("schlucken"),
  schwamm: W("Schwamm"),
  rein: W("Rein"),
  langsamer: W("langsamer"),
  raus: W("Raus"),
  schneller: W("schneller"),
  heisse: W("heiße"),
  dampf: W("Dampf"),
  turbine: W("Turbine"),
  wind: W("Wind"),
  generator: W("Generator"),
  zack: W("Zack"),
  strom: W("Strom"),
  kuehlturm: W("Kühlturm"),
  wolke2: W("Wolke", 2),
  wasserdampf: W("Wasserdampf"),
  schau: W("Schau"),
  gerade: W("gerade"),
};

const rel = (p, d) => p.map((v, i) => v + d[i]);

// ---------------------------------------------------------------- shots
export const shots = [
  // hook: kettle in front, cooling tower steaming behind
  { at: 0, from: [1.0, 1.7, 5.6], to: [0.5, 1.6, 4.8], look: [-0.4, 1.4, -0.9] },
  { at: T.wolke1, from: [3.4, 2.6, 2.4], to: [3.0, 2.9, 1.9], look: [1.6, 4.0, -2.5], zoom: 1.4 },
  // build starts: reactor building pops in
  { at: T.lass, from: [3.6, 3.2, 6.4], to: [3.0, 2.8, 5.5], look: [-0.4, 1.0, -0.4] },
  {
    at: T.brauchst,
    from: rel(R, [1.6, 1.6, 2.6]),
    to: rel(R, [1.2, 1.4, 2.2]),
    look: rel(R, [0, 1.0, 0]),
    zoom: 1.25,
  },
  {
    at: T.atome,
    from: rel(R, [0.6, 1.3, 1.2]),
    to: rel(R, [0.35, 1.2, 1.0]),
    look: rel(R, [0, 0.95, 0]),
    zoom: 1.6,
  },
  { at: T.kette, orbit: { c: rel(R, [0, 1.0, 0]), r: 1.9, y: 1.7, a0: 0.7, a1: -0.3 }, zoom: 1.2 },
  {
    at: T.wasser1,
    from: rel(R, [-1.3, 1.5, 1.6]),
    to: rel(R, [-1.0, 1.35, 1.3]),
    look: rel(R, [0, 0.95, 0]),
    zoom: 1.2,
  },
  {
    at: T.reaktor,
    from: rel(R, [2.3, 2.0, 3.2]),
    to: rel(R, [1.9, 1.8, 2.7]),
    look: rel(R, [0, 1.1, 0]),
  },
  {
    at: T.wehe,
    from: rel(R, [-1.2, 0.5, 1.5]),
    to: rel(R, [-0.9, 0.6, 1.2]),
    look: rel(R, [0, 1.1, 0]),
    zoom: 1.7,
  },
  // trick: control rods
  {
    at: T.trick,
    from: rel(R, [0.6, 2.2, 1.9]),
    to: rel(R, [0.45, 2.0, 1.7]),
    look: rel(R, [0, 1.2, 0]),
    zoom: 1.7,
  },
  {
    at: T.steuer,
    orbit: { c: rel(R, [0, 1.2, 0]), r: 1.7, y: 1.9, a0: -0.5, a1: 0.3 },
    zoom: 1.15,
  },
  {
    at: T.schwamm - 0.25,
    from: rel(SP, [1.3, 1.3, 1.8]),
    to: rel(SP, [1.0, 1.1, 1.45]),
    look: rel(SP, [0, 0.4, 0]),
    zoom: 1.3,
  },
  {
    at: T.rein,
    from: rel(R, [0.7, 1.5, 1.4]),
    to: rel(R, [0.55, 1.45, 1.2]),
    look: rel(R, [0, 1.1, 0]),
    zoom: 1.5,
  },
  // steam -> turbine -> generator
  { at: T.heisse, from: [1.8, 2.8, 4.8], to: [1.2, 2.5, 4.1], look: [-0.2, 0.9, 0.2] },
  {
    at: T.turbine,
    from: rel(H, [0.5, 1.0, 1.9]),
    to: rel(H, [0.25, 0.9, 1.6]),
    look: rel(H, [-0.3, 0.55, 0]),
    zoom: 1.15,
  },
  {
    at: T.wind,
    from: rel(WR, [1.4, 1.5, 1.9]),
    to: rel(WR, [1.1, 1.4, 1.6]),
    look: rel(WR, [0, 1.3, 0]),
    zoom: 1.4,
  },
  {
    at: T.generator,
    from: rel(H, [1.3, 0.9, 1.6]),
    to: rel(H, [1.1, 0.85, 1.35]),
    look: rel(H, [0.45, 0.55, 0]),
    zoom: 1.15,
  },
  { at: T.zack, from: [5.0, 2.0, 3.0], to: [4.6, 2.3, 2.5], look: [2.9, 1.5, -0.2] },
  // cooling tower + the cloud
  {
    at: T.kuehlturm,
    from: rel(C, [-1.2, 2.6, 2.6]),
    to: rel(C, [-0.9, 2.4, 2.3]),
    look: rel(C, [0, 1.6, 0]),
    zoom: 2.1,
  },
  {
    at: T.wolke2,
    from: [3.8, 2.4, 2.4],
    to: [3.4, 2.8, 2.0],
    look: rel(C, [0, 3.6, 0]),
    zoom: 1.7,
  },
  // outro: x-ray off, drone pull-back
  { at: T.schau, from: [1.0, 2.4, 6.4], to: [0.6, 2.2, 5.5], look: [0, 1.3, -0.6] },
  {
    at: T.gerade,
    from: [3.0, 3.0, 6.5],
    to: [9.5, 8.0, 17],
    look: [0, 1.5, -0.6],
    lookTo: [0, 0.8, -0.6],
  },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Uran", at: T.uran, until: T.kette, pos: rel(R, [0.18, 1.3, 0.12]) },
  { text: "Reaktor", at: T.reaktor, until: T.ruder, pos: rel(R, [0.44, 1.2, 0.1]) },
  { text: "Steuerstäbe", at: T.steuer, until: T.schwamm - 0.25, pos: rel(R, [0.09, 1.7, 0.09]) },
  { text: "Turbine", at: T.turbine, until: T.wind, pos: rel(H, [-0.35, 0.8, 0]) },
  { text: "Generator", at: T.generator, until: T.strom, pos: rel(H, [0.5, 0.85, 0]) },
  { text: "Strom", at: T.strom, until: T.kuehlturm, pos: rel(PY, [0, 2.7, 0]), side: 1 },
  { text: "Kühlturm", at: T.kuehlturm, until: T.wolke2, pos: rel(C, [-0.55, 2.2, 0.55]) },
  { text: "Wasserdampf", at: T.wasserdampf, until: T.schau, pos: rel(C, [0, 4.3, 0]) },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "zisch", at: 0.2, dur: 2.6, db: -24 }, // kettle + tower steaming in the hook
  { s: "pop", at: T.lass + 0.25 }, // reactor building
  { s: "pop", at: T.uran + 0.25 }, // fuel rods
  { s: "surr", at: T.kette, dur: T.trick - T.kette, db: -21 }, // chain reaction
  { s: "boing", at: T.ruder, db: -16 }, // going wild
  { s: "klack", at: T.steuer + 0.3 }, // rods slide in
  { s: "klack", at: T.rein + 0.05 },
  { s: "klack", at: T.raus + 0.05 },
  { s: "pop", at: T.heisse + 0.1 }, // turbine hall
  { s: "zisch", at: T.dampf, dur: 1.6, db: -18 }, // steam
  { s: "brumm", at: T.turbine, dur: T.kuehlturm - T.turbine, db: -21 }, // turbine
  { s: "pop", at: T.generator },
  { s: "surr", at: T.zack, dur: 1.4, db: -18 }, // current
  { s: "rauschen", at: T.kuehlturm, dur: 3.0, db: -21 }, // cooling tower
];
