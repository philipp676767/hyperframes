// Chapter 7 "Warum sie blieben" (end chapter): the answer, the epilogue
// (Pliny the Younger's letters), the Vesuvius since, the red zone, visitors,
// the same paving, the calm mountain; the pointer to the next video and the
// 20-s end screen (calm, moving, middle band free).
import { W, END } from "./timing.js";

export const T = {
  weil: W("Weil"),
  die: W("Glutlawine") - 0.2,
  meisten: W("meisten") - 0.2,
  plinius: W("Plinius"),
  eine: W("plinianische") - 0.4,
  der: W("Vesuv") - 0.25,
  heute: W("Heute", 2),
  ueb: W("Übrigens"),
  wer: W("Wer"),
  und: W("Berg", 2) - 2.2,
  wie: W("Schiff") - 0.5,
  end: END,
};

export const shots = [
  // the answer: today's ruins under the calm mountain
  { at: 0, from: [0.2, 0.5, 6.6], to: [0.1, 0.55, 5.2], look: [0, 3.2, -30], zoom: 1 },
  {
    at: T.weil - 0.2,
    from: [5.6, 0.36, 2.45],
    to: [4.6, 0.36, 2.44],
    look: [-4, 0.5, 2.3],
    zoom: 1,
  },
  { at: T.die - 0.15, from: [-6, 2.4, 10], to: [-5, 2.2, 8.6], look: [1, 0.4, 0], zoom: 1 },
  // most fled: the road out of the south gate
  {
    at: T.meisten - 0.1,
    from: [3.6, 0.6, 18],
    to: [3.2, 0.55, 16.8],
    look: [1.9, 0.3, 10],
    zoom: 1,
  },
  // Pliny the Younger writes his letters (Misenum)
  {
    at: T.plinius - 0.2,
    from: [-85.4, 4.15, 50.9],
    to: [-85.6, 4.1, 50.6],
    look: [-86.7, 3.95, 49.9],
    zoom: 1,
    whoosh: true,
  },
  { at: T.eine, from: [-90, 5.6, 54], to: [-88, 5.6, 52], look: [0, 18, -62], zoom: 1 },
  // the Vesuvius since: last eruption 1944
  {
    at: T.der - 0.15,
    from: [10, 30, -40],
    to: [6, 30, -45],
    look: [0, 22, -62],
    zoom: 1,
    whoosh: true,
  },
  // the red zone: towns on the slopes
  { at: T.heute - 0.2, from: [30, 18, 6], to: [26, 17, 2], look: [0, 4, -40], zoom: 1 },
  // visitors in the forum
  {
    at: T.ueb - 0.2,
    from: [-1.4, 0.4, 3.6],
    to: [-0.9, 0.4, 2.8],
    look: [0.4, 0.4, -4],
    zoom: 1,
    whoosh: true,
  },
  // the same paving stones
  {
    at: T.wer - 0.2,
    from: [7.0, 0.08, 2.45],
    to: [5.6, 0.08, 2.44],
    look: [-4, 0.12, 2.4],
    zoom: 1,
  },
  // the mountain, green and calm
  { at: T.und, from: [0, 0.45, 8.6], to: [0, 0.5, 6.4], look: [0, 4.5, -30], zoom: 1 },
  // end screen: a slow, calm drift over the forum towards the mountain
  { at: T.wie - 0.2, from: [-9, 5, 14], to: [-3, 5.6, 10], look: [0, 6, -30], zoom: 1 },
];

export const LABELS = [
  {
    text: "Plinius der Jüngere",
    at: T.plinius + 0.2,
    until: T.eine - 0.4,
    pos: [-86.74, 3.98, 49.83],
    side: -1,
  },
  { text: "Rote Zone", at: W("roten") - 0.2, until: T.ueb - 0.6, pos: [8, 3, -34], side: 1 },
];

export const SFX = [
  { s: "zikaden", at: 0, dur: T.plinius, db: -22 },
  { s: "wind", at: 0, dur: T.end, db: -26 },
  { s: "meer", at: T.plinius - 0.2, dur: T.der - T.plinius, db: -20 },
  { s: "zikaden", at: T.heute, dur: T.end - T.heute, db: -24 },
  { s: "stadt", at: T.ueb - 0.2, dur: T.und - T.ueb, db: -22 },
];

export const HIGHLIGHTS = [];
