// Chapter 7 "Die weiße Spitze": a block every few minutes (time-lapse), the
// last layers, the capstone, the inside in x-ray, the casing, the crystal.
import { END, WORDS } from "./timing.js";

const norm = (x) => x.toLowerCase().replace(/[^a-zäöüß0-9-]/g, "");
export function P(a, b, n = 1) {
  let c = 0;
  for (let i = 0; i + 1 < WORDS.length; i++)
    if (norm(WORDS[i].w) === norm(a) && norm(WORDS[i + 1].w) === norm(b) && ++c === n)
      return WORDS[i].start;
  throw new Error(`anchor not found: ${a} ${b}`);
}

export const T = {
  tag: P("Tag", "für"),
  je: P("Je", "höher"),
  und: P("und", "ganz"),
  spitze: P("die", "Spitze"),
  im: P("Im", "Inneren"),
  gal: P("Die", "Große"),
  koenig: P("zur", "Königskammer"),
  darueber: P("Darüber", "stapeln"),
  zum: P("Zum", "Schluss"),
  glatt: P("glatt", "geschliffen"),
  in: P("In", "der"),
  fast: P("fast", "viertausend"),
  end: END,
};
// the time-lapse: from 0.56 to the last course before the capstone
export const GROW = { t0: 0, t1: T.spitze - 0.4, k0: 0.56, k1: 0.985 };

export const shots = [
  // a block every few minutes: the site from above, a slow arc
  { at: 0, orbit: { c: [0, 5, 0], r: 38, y: 12, a0: 0.4, a1: 0.75 }, zoom: 1 },
  // day after day, twenty years: low, the sun crossing
  { at: T.tag - 0.2, from: [26, 1.4, 34], to: [24, 2.2, 31], look: [0, 6, 0], zoom: 1 },
  // the higher, the smaller each layer: up at the top platform
  {
    at: T.je - 0.2,
    from: [5, 15.5, 9],
    to: [4, 15.2, 7.5],
    look: [0, 13.6, 0],
    zoom: 1,
    whoosh: true,
  },
  // the capstone
  { at: T.spitze - 0.6, from: [2.6, 15.0, 3.2], to: [2.2, 14.9, 2.8], look: [0, 14.5, 0], zoom: 1 },
  // the inside: x-ray from the east, the passages light up
  { at: T.im - 0.2, from: [36, 5, 4], to: [33, 5, 2], look: [0, 3.5, -2], zoom: 1, whoosh: true },
  { at: T.gal - 0.2, from: [12, 4.2, 2.5], to: [10.5, 4.3, 1.8], look: [0, 3.6, -1.6], zoom: 1 },
  { at: T.darueber - 0.2, from: [9, 6.2, 4.5], to: [8, 6.4, 3.8], look: [0, 5.6, 0.9], zoom: 1 },
  // the dress: white casing from the bottom up
  { at: T.zum - 0.2, from: [34, 3, 30], to: [30, 4, 27], look: [0, 6, 0], zoom: 1, whoosh: true },
  // polished, tight joints: along the face
  { at: T.glatt - 0.2, from: [17, 0.5, 15], to: [16, 0.7, 13.6], look: [9, 3.2, 5], zoom: 1 },
  // a giant crystal in the sun
  { at: T.in - 0.2, orbit: { c: [0, 6, 0], r: 40, y: 3, a0: -0.3, a1: 0.3 }, zoom: 1 },
  // the tallest building for almost 4000 years: up the face to the tip
  {
    at: T.fast - 0.2,
    from: [20, 0.8, 26],
    to: [17, 1.0, 22],
    look: [0, 6, 0],
    lookTo: [0, 14.6, 0],
    zoom: 1,
  },
];
for (let i = 1; i < shots.length; i++)
  if (shots[i].at <= shots[i - 1].at) throw new Error(`shots out of order at #${i}`);

export const LABELS = [
  { text: "Große Galerie", at: T.gal + 0.6, until: T.koenig - 0.3, pos: [0, 3.6, -1.8], side: 1 },
  {
    text: "Königskammer",
    at: T.koenig + 0.3,
    until: T.darueber - 0.4,
    pos: [0, 4.6, 0.9],
    side: 1,
  },
  {
    text: "Entlastungskammern",
    at: T.darueber + 1.2,
    until: T.zum - 0.4,
    pos: [0, 5.7, 0.9],
    side: 1,
  },
];

export const SFX = [
  { s: "baustelle", at: 0, dur: T.spitze, db: -18 },
  { s: "wind", at: T.je - 0.2, dur: T.im - T.je, db: -20 },
  { s: "stein", at: T.spitze + 0.6, db: -12 },
  { s: "hall", at: T.im - 0.2, dur: T.zum - T.im, db: -18 },
  { s: "baustelle", at: T.zum - 0.2, dur: T.in - T.zum, db: -21 },
  { s: "wind", at: T.in - 0.2, dur: T.end - T.in, db: -20 },
];

export const HIGHLIGHTS = [];
