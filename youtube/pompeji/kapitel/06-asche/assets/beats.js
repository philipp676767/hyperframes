// Chapter 6 "1.700 Jahre unter Asche": fields over the town, the name
// forgotten; digging from 1748; the inscription of 1763; the snapshot —
// charred loaves, painted election notices and graffiti; Fiorelli's plaster
// in the hollows (1863, shown abstractly); ~1,500 found; a third not dug.
import { W, END } from "./timing.js";

export const T = {
  ueber: W("Über"),
  und: W("und", 1),
  erst: W("Erst", 1),
  dass: W("Dass"),
  was: W("Was"),
  in: W("Bäckerei") - 0.4,
  an: W("Wänden") - 0.3,
  fio: W("1863"),
  in2: W("erstarrten") - 0.4,
  die: W("Körper", 1) - 0.9,
  er: W("Er"),
  heraus: W("heraus"),
  rund: W("Rund"),
  drittel: W("Drittel") - 0.35,
  end: END,
};
const b = (x, y, z) => [x, y - 120, z];
const tr = (x, y, z) => [x + 60, y - 120, z];

export const shots = [
  // fields over the buried town
  { at: 0, from: [8, 1.3, 9], to: [6.5, 1.25, 8], look: [-2, 1.4, -6], zoom: 1 },
  // the name is lost: wide, the mountain quiet again
  { at: T.und - 0.15, from: [26, 9, 26], to: [22, 8.6, 23], look: [0, 4, -20], zoom: 1 },
  // 1748: workers dig the forum free
  {
    at: T.erst - 0.2,
    from: [4.6, 2.6, 7.2],
    to: [3.8, 2.4, 6.2],
    look: [0, 0.4, -1],
    zoom: 1,
    whoosh: true,
  },
  // 1763: the inscription
  {
    at: T.dass - 0.2,
    from: [0.55, 0.32, 1.6],
    to: [0.45, 0.3, 1.35],
    look: [0.0, 0.2, 0.6],
    zoom: 1,
  },
  // a moment frozen: the dug-out forum
  { at: T.was - 0.2, orbit: { c: [0, 0.4, -1], r: 7, y: 3, a0: 0.6, a1: 0.25 }, zoom: 1 },
  // the bakery: charred loaves in the oven
  {
    at: T.in - 0.2,
    from: b(1.4, 1.1, 1.8),
    to: b(1.0, 1.0, 1.2),
    look: b(0.35, 0.8, -0.5),
    zoom: 1,
    whoosh: true,
  },
  // painted notices and scratched graffiti on the wall
  {
    at: T.an - 0.2,
    from: b(-1.4, 1.6, 1.4),
    to: b(-1.8, 1.55, 1.0),
    look: b(-3.3, 1.5, 0.2),
    zoom: 1,
  },
  // 1863: Fiorelli's dig
  {
    at: T.fio - 0.25,
    from: tr(2.6, 2.6, 6.5),
    to: tr(2.0, 2.4, 5.6),
    look: tr(0, 1.3, -0.5),
    zoom: 1,
    whoosh: true,
  },
  // the hollows in the ash
  {
    at: T.in2 - 0.2,
    from: tr(1.4, 1.75, 2.6),
    to: tr(1.0, 1.7, 2.0),
    look: tr(0.2, 1.55, -0.1),
    zoom: 1,
  },
  {
    at: T.die - 0.2,
    from: tr(0.6, 1.62, 1.6),
    to: tr(0.5, 1.6, 1.3),
    look: tr(0.2, 1.55, -0.1),
    zoom: 1,
  },
  // plaster poured in
  {
    at: T.er - 0.2,
    from: tr(2.0, 2.2, 2.4),
    to: tr(1.8, 2.1, 2.1),
    look: tr(0.5, 1.6, 0),
    zoom: 1,
  },
  // the shapes come out (abstract, calm)
  {
    at: T.heraus - 0.2,
    from: tr(-1.2, 1.2, 2.6),
    to: tr(-0.9, 1.1, 2.3),
    look: tr(0.2, 0.4, 0.7),
    zoom: 1,
  },
  // ~1,500 dead found: the forum at dusk, calm
  {
    at: T.rund - 0.2,
    from: [-5, 1.6, 8],
    to: [-4, 1.5, 7],
    look: [0, 0.5, -4],
    zoom: 1,
    whoosh: true,
  },
  // a third still under the fields
  { at: T.drittel, from: [12, 16, 24], to: [10, 17, 21], look: [2, 0, 0], zoom: 1 },
];

export const LABELS = [
  {
    text: "Hohlraum",
    at: W("Hohlräume", 1),
    until: T.die - 0.3,
    pos: [60.2, -118.45, -0.1],
    side: 1,
  },
  { text: "Noch nicht ausgegraben", at: T.drittel + 0.6, until: T.end, pos: [10, 1.0, 4], side: 1 },
];

export const SFX = [
  { s: "wind", at: 0, dur: T.erst, db: -18 },
  { s: "graben", at: T.erst + 0.3, db: -10 },
  { s: "graben", at: T.erst + 2.4, db: -12 },
  { s: "wind", at: T.dass, dur: T.in - T.dass, db: -22 },
  { s: "graben", at: T.fio + 0.4, db: -12 },
  { s: "giessen", at: W("gießt") - 0.1, db: -10 },
  { s: "wind", at: T.rund - 0.2, dur: T.end - T.rund, db: -20 },
];

export const HIGHLIGHTS = [];
