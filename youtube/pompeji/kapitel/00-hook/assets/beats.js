// Chapter 0 "Der Berg reißt auf": cold open across the bay (the pine-shaped
// cloud) and the darkness in the forum, then the afternoon: forum, bakery,
// the mountain bursting open, the column, the questions, the framing line.
import { W, END } from "./timing.js";

export const T = {
  nacht: W("Es", 1),
  es: W("Es", 2),
  in: W("Pompeji", 1) - 0.1,
  liegen: W("liegen"),
  dann: W("Dann"),
  berg: W("Berg", 1),
  und: W("und", 1),
  die: W("Menschen", 1) - 0.25,
  doch: W("doch"),
  gibt: W("gibt"),
  warum: W("Warum"),
  was: W("Was"),
  wie: W("wie", 3),
  das: W("Geschichte", 1) - 1.0,
  wenn: W("abonniere") - 2.6,
  end: END,
};
export const BOOM = T.berg - 0.1;
const b = (x, y, z) => [x, y - 120, z];

export const shots = [
  // cold open: across the bay, the pine-shaped cloud over the mountain
  { at: 0, from: [-158, 12, 136], to: [-146, 13, 124], look: [0, 50, -62], zoom: 1 },
  // "Es wurde Nacht": the forum goes dark, stones begin to fall
  {
    at: T.nacht - 0.15,
    from: [0.6, 0.5, 4.4],
    to: [0.3, 0.5, 3.2],
    look: [0, 1.6, -12],
    zoom: 1,
    whoosh: true,
  },
  // a Herbsttag, shortly after noon: the forum, the temple, the calm mountain
  {
    at: T.es - 0.1,
    from: [-0.15, 0.4, 10.4],
    to: [-0.15, 0.42, 8.2],
    look: [-0.1, 3.0, -30],
    zoom: 1,
    whoosh: true,
  },
  // the city on the gulf (aerial)
  { at: T.in - 0.2, from: [-26, 13, 30], to: [-20, 11, 26], look: [1.5, 0, -1], zoom: 1 },
  // the bakery: loaves in the oven
  {
    at: T.liegen - 0.25,
    from: b(1.5, 1.15, 1.9),
    to: b(1.1, 1.05, 1.3),
    look: b(0.35, 0.8, -0.5),
    zoom: 1,
    whoosh: true,
  },
  // the forum again — the mountain bursts open
  {
    at: T.dann - 0.1,
    from: [0.2, 0.36, 3.6],
    to: [0.1, 0.38, 3.2],
    look: [0, 4.5, -30],
    zoom: 1,
    whoosh: true,
  },
  // the column climbs: wide from the fields in the south-east, tilting up
  {
    at: T.und - 0.1,
    from: [34, 2.5, 22],
    to: [30, 3, 18],
    look: [0, 18, -62],
    lookTo: [0, 55, -62],
    zoom: 1,
  },
  // the people stop and look up
  {
    at: T.die - 0.15,
    from: [0.45, 0.14, 1.6],
    to: [0.35, 0.17, 1.1],
    look: [-0.2, 1.4, -8],
    zoom: 1,
  },
  // the empty street in the strange light
  {
    at: T.doch - 0.3,
    from: [11.5, 0.22, 2.4],
    to: [9.5, 0.24, 2.4],
    look: [-6, 0.45, 2.4],
    zoom: 1,
  },
  // high above the city: the column and the umbrella
  { at: T.gibt - 0.2, from: [34, 16, 34], to: [28, 17, 36], look: [0, 22, -40], zoom: 1 },
  // questions: the people, the mountain, the whole city
  { at: T.warum - 0.2, from: [7.5, 0.2, 2.4], to: [6.0, 0.22, 2.4], look: [-6, 0.6, 2.0], zoom: 1 },
  { at: T.was - 0.15, from: [10, 18, -30], to: [6, 20, -38], look: [0, 24, -62], zoom: 1 },
  { at: T.wie - 0.15, from: [30, 34, 40], to: [26, 38, 36], look: [1.5, 0, 0], zoom: 1 },
  // "Das ist die Geschichte von Pompeji": the temple, the mountain, the column
  { at: T.das - 0.2, from: [0, 0.36, 4.6], to: [0, 0.4, 2.6], look: [0, 6.5, -30], zoom: 1 },
];

export const LABELS = [
  { text: "Pompeji", at: T.in + 0.2, until: T.liegen - 0.4, pos: [1.5, 1.2, 0], side: 1 },
  { text: "Vesuv", at: T.dann + 0.1, until: BOOM + 0.6, pos: [3, 16, -62], side: 1 },
];

export const SFX = [
  { s: "saeule", at: 0, dur: T.nacht, db: -16 },
  { s: "meer", at: 0, dur: T.nacht, db: -22 },
  { s: "steinregen", at: T.nacht + 0.8, dur: T.es - T.nacht - 0.8, db: -16 },
  { s: "saeule", at: T.nacht, dur: T.es - T.nacht, db: -24 },
  { s: "stadt", at: T.es - 0.1, dur: T.liegen - T.es, db: -20 },
  { s: "wind", at: T.in - 0.2, dur: T.liegen - T.in, db: -22 },
  { s: "ofen", at: T.liegen - 0.25, dur: T.dann - T.liegen, db: -16 },
  { s: "stadt", at: T.dann - 0.1, dur: BOOM - T.dann + 1.5, db: -21 },
  { s: "grollen", at: T.dann, db: -10 },
  { s: "ausbruch", at: BOOM, db: -4 },
  { s: "saeule", at: BOOM + 2, dur: T.end - BOOM - 2, db: -19 },
  { s: "wind", at: T.die, dur: T.end - T.die, db: -24 },
];

export const HIGHLIGHTS = [
  { kind: "shake", at: BOOM, dur: 1.4, amp: 1.2 },
  { kind: "flash", at: BOOM + 0.05 },
];
