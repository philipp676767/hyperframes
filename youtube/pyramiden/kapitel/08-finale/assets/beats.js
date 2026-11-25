// Chapter 8 (finale) "Kein Geheimnis": the answer over today's Giza, Merer's
// logbook (Wadi al-Jarf → Cairo museum), the lost casing, the 2017 void, the
// golden evening, the end screen.
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
  nicht: P("Nicht", "mit"),
  wasser: P("mit", "Wasser"),
  organisation: P("mit", "einer"),
  von: P("Von", "Merer"),
  nach: P("Nach", "der"),
  dort: P("Dort", "bleiben"),
  heute: P("heute", "liegen"),
  die: P("Die", "weiße"),
  erdbeben: P("Nach", "einem"),
  ganz: P("Ganz", "verraten"),
  y2017: P("2017", "entdeckten"),
  was: P("Was", "darin"),
  wenn: P("Wenn", "du"),
  und: P("Und", "wie"),
  end: END,
};
const cv = (x, y, z) => [x, y - 120, z];
const mu = (x, y, z) => [x + 60, y - 160, z];

export const shots = [
  // the answer: Giza today, wide from the east, evening light
  { at: 0, from: [46, 2, 40], to: [42, 2.6, 36], look: [-14, 6, 18], zoom: 1 },
  // water, copper, wet sand, organisation: along the three pyramids
  { at: T.wasser - 0.2, from: [24, 1.2, 46], to: [18, 1.6, 48], look: [-24, 5, 24], zoom: 1 },
  { at: T.organisation - 0.2, from: [-4, 22, 70], to: [2, 24, 66], look: [-20, 0, 24], zoom: 1 },
  // Merer: the logbook in the sand at Wadi al-Jarf
  {
    at: T.von - 0.2,
    from: cv(0.6, 0.45, 0.8),
    to: cv(0.35, 0.35, 0.6),
    look: cv(0.05, 0.03, 0),
    zoom: 1,
    whoosh: true,
  },
  {
    at: T.nach - 0.2,
    from: cv(2.8, 1.4, 2.6),
    to: cv(2.3, 1.1, 2.1),
    look: cv(-0.3, 0.1, -0.6),
    zoom: 1,
  },
  // today in Cairo: a museum case
  {
    at: T.heute - 0.2,
    from: mu(1.6, 1.4, 1.8),
    to: mu(1.2, 1.2, 1.4),
    look: mu(0, 0.65, 0),
    zoom: 1,
    whoosh: true,
  },
  // the white casing is gone: the rough steps today
  {
    at: T.die - 0.2,
    from: [15, 1.2, 14.5],
    to: [14, 1.6, 13.5],
    look: [6, 4, 4],
    zoom: 1,
    whoosh: true,
  },
  // after an earthquake: only Khafre's top kept a little of it
  { at: T.erdbeben - 0.2, from: [-14, 12, 46], to: [-16, 13.5, 44], look: [-31, 13, 31], zoom: 1 },
  // the secrets: x-ray, particles from space, the void
  {
    at: T.ganz - 0.2,
    from: [36, 6, 6],
    to: [33, 6.5, 4],
    look: [0, 4.5, -1.5],
    zoom: 1,
    whoosh: true,
  },
  { at: T.y2017 - 0.2, from: [18, 6.5, 4], to: [15, 6.2, 2], look: [0, 4.8, -1.6], zoom: 1 },
  { at: T.was - 0.2, from: [10, 5.2, 1], to: [9, 5.0, 0], look: [0, 4.8, -1.75], zoom: 1 },
  // golden evening: low, the three pyramids
  {
    at: T.wenn - 0.2,
    from: [30, 0.6, 58],
    to: [24, 0.9, 54],
    look: [-18, 6, 22],
    zoom: 1,
    whoosh: true,
  },
  // end screen: a very slow, calm arc over the plateau
  { at: T.und - 0.2, orbit: { c: [-18, 4, 26], r: 74, y: 12, a0: 0.55, a1: 0.8 }, zoom: 1 },
];
for (let i = 1; i < shots.length; i++)
  if (shots[i].at <= shots[i - 1].at) throw new Error(`shots out of order at #${i}`);

export const LABELS = [
  {
    text: "Merers Logbuch",
    at: T.heute + 0.6,
    until: T.die - 0.4,
    pos: [60.2, -159.33, 0],
    side: 1,
  },
  {
    text: "Rest der Hülle",
    at: T.erdbeben + 1.2,
    until: T.ganz - 0.4,
    pos: [-31, 13.6, 31],
    side: 1,
  },
  { text: "Hohlraum", at: T.y2017 + 2.5, until: T.wenn - 0.4, pos: [0, 4.8, -1.75], side: -1 },
];

export const SFX = [
  { s: "wind", at: 0, dur: T.von, db: -20 },
  { s: "hoehle", at: T.von - 0.2, dur: T.heute - T.von, db: -20 },
  { s: "hall", at: T.heute - 0.2, dur: T.die - T.heute, db: -22 },
  { s: "wind", at: T.die - 0.2, dur: T.ganz - T.die, db: -21 },
  { s: "hall", at: T.ganz - 0.2, dur: T.wenn - T.ganz, db: -18 },
  { s: "wind", at: T.wenn - 0.2, dur: T.end - T.wenn, db: -21 },
];

export const HIGHLIGHTS = [];
