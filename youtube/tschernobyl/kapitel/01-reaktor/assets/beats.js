// Chapter 1 "Ein Reaktor wie kein anderer": the place (forest, pond, four
// blocks, Prypjat), then the core: a kettle, the chain reaction, the rods.
import { W, END } from "./timing.js";

export const T = {
  das: W("Das", 1),
  zwischen: W("zwischen"),
  vier: W("Vier"),
  block: W("Block"),
  drei: W("Drei"),
  grunde: W("Grunde"),
  kanaelen: W("Kanälen"),
  wird: W("Wird"),
  kette: W("Kettenreaktion", 1),
  sie: W("Sie", 1),
  turbinen: W("Turbinen"),
  damit: W("Damit"),
  schlucken: W("schlucken"),
  tiefer: W("tiefer"),
  bremse: W("Bremse"),
  doch: W("Doch"),
  end: END,
};
const k = (x, y, z) => [x, -300 + y, z];

export const shots = [
  // over the pine forest towards the plant at sunset
  { at: 0, from: [70, 14, 70], to: [52, 11, 56], look: [-6, 4, -2], zoom: 1 },
  { at: T.zwischen - 0.2, from: [40, 2.2, 60], to: [30, 2.0, 52], look: [-4, 4, -2], zoom: 1 },
  // four blocks side by side: a long lateral dolly along the turbine hall
  { at: T.vier - 0.2, from: [-62, 6, 30], to: [-30, 6, 28], look: [-30, 3, -2], zoom: 1 },
  // block 4, the newest
  { at: T.block - 0.1, from: [18, 4, 18], to: [15, 4.5, 15], look: [3, 5, 0], zoom: 1 },
  // Prypjat on the horizon
  { at: T.drei - 0.2, from: [-4, 3.5, 14], to: [-8, 3.6, 13], look: [-120, 3, -95], zoom: 1 },
  // into the core: the kettle
  {
    at: T.grunde - 0.3,
    from: k(-3, 7, 20),
    to: k(0, 6, 17),
    look: k(0, 4.2, -2),
    zoom: 1,
    whoosh: true,
  },
  { at: T.kanaelen - 0.2, from: k(4, 2.2, 6), to: k(3, 3.2, 5), look: k(0, 3.5, -2), zoom: 1 },
  // fission: close on a few channels, neutrons flying
  {
    at: T.wird - 0.2,
    from: k(1.6, 3.6, 2.6),
    to: k(0.6, 3.4, 2.2),
    look: k(0.4, 3.4, -1.5),
    zoom: 1,
  },
  // heat → steam → turbine
  { at: T.sie - 0.2, from: k(2, 8, 14), to: k(6, 9, 13), look: k(8, 7, -1), zoom: 1 },
  // the rods coming in from above
  { at: T.damit - 0.2, from: k(-4, 10, 12), to: k(-2, 9, 11), look: k(0, 6, -2), zoom: 1 },
  {
    at: T.schlucken - 0.1,
    from: k(1.5, 6.2, 3.2),
    to: k(1.0, 5.6, 2.8),
    look: k(0.5, 5, -1.2),
    zoom: 1,
  },
  { at: T.tiefer - 0.2, from: k(0, 4.5, 16), to: k(0, 4.2, 15), look: k(0, 3.6, -2), zoom: 1 },
  // but: back outside, night falls on block 4
  {
    at: T.doch - 0.2,
    from: [12, 2.0, 16],
    to: [9, 2.6, 13],
    look: [3, 6, 0],
    zoom: 1,
    whoosh: true,
  },
];

export const LABELS = [
  { text: "Kühlteich", at: T.zwischen + 0.9, until: T.vier - 0.4, pos: [20, 0.2, 40], side: 1 },
  { text: "Block 4", at: T.block + 0.3, until: T.drei - 0.4, pos: [5, 7.2, 1], side: 1 },
  { text: "Prypjat", at: T.drei + 0.6, until: T.grunde - 0.5, pos: [-120, 4, -95], side: 1 },
  {
    text: "Brennstab",
    at: T.kanaelen + 0.6,
    until: T.wird - 0.4,
    pos: k(0.43, 4.2, -0.3),
    side: 1,
  },
  { text: "Turbine", at: T.turbinen, until: T.damit - 0.4, pos: k(12, 9, -1), side: -1 },
  {
    text: "Steuerstab",
    at: T.schlucken - 1.2,
    until: T.tiefer - 0.3,
    pos: k(0.85, 6, -0.3),
    side: 1,
  },
];

export const HIGHLIGHTS = [];

export const SFX = [
  { s: "morgen", at: 0, dur: T.grunde, db: -22 },
  { s: "wind", at: 0, dur: T.grunde, db: -22 },
  { s: "halle", at: T.grunde - 0.3, dur: T.doch - T.grunde, db: -16 },
  { s: "geiger", at: T.wird, dur: T.sie - T.wird, db: -22 },
  { s: "zisch", at: T.sie + 1.2, db: -18 },
  { s: "brumm", at: T.turbinen, dur: 2.5, db: -20 },
  { s: "surr", at: T.damit + 1.8, db: -18 },
  { s: "nacht", at: T.doch - 0.2, dur: T.end - T.doch, db: -16 },
];
