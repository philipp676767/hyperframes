// Chapter 1 "Ein König will ewig leben": the god-king, the mastaba, Djoser's
// six steps, the Bent Pyramid changing its angle, the Red Pyramid.
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
  in: P("In", "Ägypten"),
  stirbt: P("Stirbt", "er"),
  ersten: P("Die", "ersten"),
  dann: P("Dann", "stapelt"),
  sechs: P("sechs", "solcher"),
  und: P("und", "so"),
  glatte: P("Glatte", "Seiten"),
  vater: P("Cheops'", "Vater"),
  bei: P("Bei", "einer"),
  knicken: P("knicken", "den"),
  knick: P("Die", "Knickpyramide"),
  erst: P("Erst", "die"),
  sohn: P("Sein", "Sohn"),
  pläne: P("Und", "er"),
  end: END,
};
// the step pyramid rises step by step; the Bent Pyramid to its knee, then on
export const DJ = { from: T.sechs - 0.2, to: T.und + 0.6 };
export const BENT = { from: T.bei, knee: T.knicken - 0.3, on: T.knicken, to: T.knick + 1.5 };

export const shots = [
  // the desert at morning: all three far away
  { at: 0, from: [-4, 5, 70], to: [2, 6, 64], look: [0, 4, -6], zoom: 1 },
  // the god-king's funeral procession towards a tomb
  {
    at: T.in - 0.2,
    from: [-37, 0.7, 33],
    to: [-38.5, 0.6, 31.5],
    look: [-46, 0.4, 24],
    zoom: 1,
    whoosh: true,
  },
  // "Stirbt er …": up into the sky, the sun
  {
    at: T.stirbt - 0.2,
    from: [-38.5, 0.6, 31.5],
    to: [-39, 0.7, 31],
    look: [-46, 0.5, 24],
    lookTo: [0, 24, 110],
    zoom: 1,
  },
  // the mastaba: a flat brick tomb
  { at: T.ersten - 0.2, from: [-42, 1.8, 28], to: [-44.5, 1.4, 26], look: [-50, 0.5, 20], zoom: 1 },
  // Imhotep stacks six steps
  {
    at: T.dann - 0.2,
    from: [-21, 3, 21],
    to: [-23, 3.4, 19],
    look: [-36, 3, 6],
    zoom: 1,
    whoosh: true,
  },
  // "Glatte Seiten …": across the desert to the Bent Pyramid
  { at: T.glatte - 0.2, from: [-26, 4, 26], to: [-16, 5, 24], look: [2, 5, -22], zoom: 1 },
  // Snofru builds several
  { at: T.vater - 0.2, from: [26, 6, 32], to: [18, 6.5, 32], look: [8, 4, -16], zoom: 1 },
  // the Bent Pyramid grows, then the angle changes
  { at: T.bei - 0.2, from: [28, 5, 8], to: [26, 5.5, 6], look: [2, 4, -22], zoom: 1, whoosh: true },
  { at: T.knick - 0.2, orbit: { c: [2, 4.5, -22], r: 34, y: 4, a0: -0.2, a1: -0.8 }, zoom: 1 },
  // the Red Pyramid
  {
    at: T.erst - 0.2,
    from: [66, 3, 26],
    to: [62, 3.5, 22],
    look: [40, 5, -2],
    zoom: 1,
    whoosh: true,
  },
  // his son Cheops inherits the builders: the three in a row, then north
  { at: T.sohn - 0.2, from: [-12, 12, 66], to: [6, 13, 64], look: [0, 3, -6], zoom: 1 },
  { at: T.pläne - 0.2, from: [0, 2.5, 34], to: [4, 3.5, 28], look: [80, 8, -80], zoom: 1 },
];
for (let i = 1; i < shots.length; i++)
  if (shots[i].at <= shots[i - 1].at) throw new Error(`shots out of order at #${i}`);

export const LABELS = [
  { text: "Stufenpyramide", at: T.und + 0.4, until: T.glatte - 0.3, pos: [-36, 6.4, 6], side: 1 },
  { text: "Knickpyramide", at: T.knick + 0.4, until: T.knick + 4.5, pos: [2, 10.4, -22], side: 1 },
  { text: "Rote Pyramide", at: T.erst + 0.8, until: T.sohn - 0.3, pos: [40, 10.6, -2], side: -1 },
];

export const SFX = [
  { s: "wind", at: 0, dur: T.end, db: -21 },
  { s: "baustelle", at: DJ.from, dur: DJ.to - DJ.from + 1.5, db: -21 },
  { s: "stein", at: DJ.from + 0.6, db: -16 },
  { s: "baustelle", at: BENT.from, dur: BENT.to - BENT.from, db: -21 },
];

export const HIGHLIGHTS = [];
