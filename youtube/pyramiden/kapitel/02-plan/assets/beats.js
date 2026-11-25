// Chapter 2 "Ein Berg nach Plan": the plateau above the flood, the planned
// pyramid, seven football pitches, water in trenches, the cardinal
// directions, the stars.
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
  hoch: P("hoch", "genug"),
  nah: P("nah", "genug"),
  geplant: P("Geplant", "ist"),
  deren: P("deren", "Grundfläche"),
  bevor: P("Bevor", "auch"),
  giesst: P("Gießt", "man"),
  ganz: P("ganz", "gleich"),
  ergebnis: P("Das", "Ergebnis"),
  genauso: P("Genauso", "präzise"),
  vier: P("Die", "vier"),
  ohne: P("und", "das"),
  sterne: P("Vermutlich", "halfen"),
  damit: P("Damit", "steht"),
  was: P("Was", "jetzt"),
  end: END,
};

export const shots = [
  // the empty plateau above the flood, from the air
  { at: 0, from: [46, 14, 44], to: [40, 15, 38], look: [2, 0, 4], zoom: 1 },
  // high enough: low over the flood water up to the cliff
  {
    at: T.hoch - 0.2,
    from: [54, -3.1, 6],
    to: [49, -3.0, 4],
    look: [16, 0.5, 0],
    lookTo: [10, 1.6, 0],
    zoom: 1,
  },
  // close enough to the river: the harbour, boats
  { at: T.nah - 0.2, from: [44, -1.5, 24], to: [42, -1.2, 21], look: [28, -3.4, 12], zoom: 1 },
  // the planned pyramid as a glass ghost
  {
    at: T.geplant - 0.2,
    from: [30, 5, 34],
    to: [27, 7, 30],
    look: [0, 6, 0],
    zoom: 1,
    whoosh: true,
  },
  // seven football pitches on its footprint (top view)
  { at: T.deren - 0.2, from: [0.5, 40, 14], to: [0.3, 36, 10], look: [0, 0, 0], zoom: 1 },
  // the rock must be level
  { at: T.bevor - 0.2, from: [14, 1.2, 14], to: [12.5, 1.0, 12.5], look: [4, 0, 4], zoom: 1 },
  // water in a long trench
  {
    at: T.giesst - 0.2,
    from: [-6.6, 0.45, 10.2],
    to: [-6.8, 0.38, 8.8],
    look: [-5.75, 0.02, 0],
    zoom: 1,
  },
  // low along the water line
  {
    at: T.ganz - 0.2,
    from: [-5.75, 0.12, 12],
    to: [-5.75, 0.1, 11.2],
    look: [-5.75, 0.05, -8],
    zoom: 1,
  },
  // the first course: a level base 230 m long
  {
    at: T.ergebnis - 0.2,
    from: [13.6, 0.26, 12.6],
    to: [12.9, 0.24, 12.3],
    look: [-11.5, 0.1, 11.4],
    zoom: 1,
    whoosh: true,
  },
  // the four sides point to the four directions (top view, axes)
  { at: T.genauso - 0.2, from: [0, 44, 0.6], to: [0, 40, 0.5], look: [0, 0, 0], zoom: 1 },
  // without a compass: night falls, the stars turn around the pole
  {
    at: T.ohne - 0.2,
    from: [8, 1.0, 22],
    to: [7, 1.2, 20],
    look: [0, 6, -40],
    lookTo: [0, 30, -60],
    zoom: 1,
  },
  // "Damit steht der Plan": dawn over the prepared site
  { at: T.damit - 0.2, from: [-14, 8, 30], to: [-10, 9, 27], look: [2, 0, 6], zoom: 1 },
  // millions of stones: towards the quarry
  { at: T.was - 0.2, from: [-12, 4, 44], to: [-10, 4.5, 40], look: [3, -0.8, 27], zoom: 1 },
];
for (let i = 1; i < shots.length; i++)
  if (shots[i].at <= shots[i - 1].at) throw new Error(`shots out of order at #${i}`);

export const LABELS = [
  { text: "Gizeh", at: 1.0, until: T.hoch - 0.3, pos: [0, 0.4, 0], side: -1 },
  { text: "Norden", at: T.vier + 0.6, until: T.ohne - 0.4, pos: [0, 0.2, -16], side: 1 },
];

export const SFX = [
  { s: "wind", at: 0, dur: T.geplant, db: -21 },
  { s: "wasser", at: T.hoch - 0.2, dur: T.geplant - T.hoch, db: -20 },
  { s: "wind", at: T.geplant - 0.2, dur: T.bevor - T.geplant, db: -22 },
  { s: "baustelle", at: T.bevor - 0.2, dur: T.giesst - T.bevor, db: -23 },
  { s: "giessen", at: T.giesst + 0.4, db: -14 },
  { s: "wasser", at: T.giesst, dur: T.ergebnis - T.giesst, db: -24 },
  { s: "wind", at: T.ergebnis - 0.2, dur: T.ohne - T.ergebnis, db: -22 },
  { s: "nacht", at: T.ohne - 0.2, dur: T.damit - T.ohne + 1, db: -18 },
  { s: "wind", at: T.damit, dur: T.end - T.damit, db: -22 },
];

export const HIGHLIGHTS = [];
