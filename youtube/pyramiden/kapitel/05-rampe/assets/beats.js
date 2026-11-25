// Chapter 5 "Schlitten auf nassem Sand" (re-hook + comment question): wheels
// sink, sledges, the tomb painting, the 2014 experiment, three ramp ideas, the
// 2018 ramp, the question, the crowd.
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
  wie: P("Wie", "kommen"),
  raeder: P("Räder", "sinken"),
  statt: P("Stattdessen", "setzen"),
  grab: P("Wie", "das"),
  lange: P("Lange", "hielt"),
  mit: P("Mit", "der"),
  bleibt: P("Bleibt", "die"),
  gerade: P("gerade", "auf"),
  spirale: P("als", "Spirale"),
  innen: P("oder", "sogar"),
  y2018: P("2018", "fanden"),
  welche: P("Welche", "Rampe"),
  denn: P("Denn", "ganz"),
  end: END,
};
const p = (x, y, z) => [x + 60, y - 120, z];

export const shots = [
  // the big question: the half-built pyramid, its ramp, the teams
  { at: 0, orbit: { c: [0, 5, 0], r: 34, y: 7, a0: 0.2, a1: 0.55 }, zoom: 1 },
  // from the harbour up to the pyramid
  { at: T.wie - 0.2, from: [33, -2.6, 14], to: [31, -2.2, 12.5], look: [6, 6, 2], zoom: 1 },
  // wheels sink into the sand
  {
    at: T.raeder - 0.2,
    from: [17.45, 0.12, -5.55],
    to: [17.4, 0.1, -5.62],
    look: [17, 0.05, -6],
    zoom: 1,
    whoosh: true,
  },
  // sledges instead: the team hauling
  {
    at: T.statt - 0.2,
    follow: "sledge",
    from: [0.9, 0.4, 1.0],
    to: [0.6, 0.35, 0.8],
    look: [-0.4, 0.12, 0],
    zoom: 1,
  },
  // the tomb painting
  {
    at: T.grab - 0.2,
    from: p(3.2, 1.6, 3.2),
    to: p(2.4, 1.6, 2.6),
    look: p(-0.5, 1.5, -2),
    zoom: 1,
    whoosh: true,
  },
  {
    at: T.lange - 0.6,
    from: p(2.6, 1.3, 0.3),
    to: p(2.5, 1.25, -0.2),
    look: p(2.1, 1.0, -2),
    zoom: 1,
  },
  // the experiment: dry sand piles up, wet sand stays firm
  {
    at: T.mit - 0.2,
    from: [-29.2, 1.8, 3.6],
    to: [-29.6, 1.7, 3.2],
    look: [-31.6, 1.1, 2],
    zoom: 1,
    whoosh: true,
  },
  // what is left: the height
  {
    at: T.bleibt - 0.2,
    from: [38, 6, 30],
    to: [34, 7, 27],
    look: [0, 5, 0],
    zoom: 1,
    whoosh: true,
  },
  // the three ideas on the pyramid
  { at: T.gerade - 0.2, from: [24, 9, 46], to: [22, 10, 42], look: [0, 4, 8], zoom: 1 },
  { at: T.spirale - 0.15, from: [34, 14, 30], to: [31, 15, 28], look: [0, 5, 0], zoom: 1 },
  { at: T.innen - 0.15, from: [28, 12, 26], to: [25, 13, 23], look: [0, 5, 0], zoom: 1 },
  // 2018: the steep ramp with post holes
  {
    at: T.y2018 - 0.2,
    from: [-31.2, 2.6, -20.6],
    to: [-31.7, 2.4, -21.2],
    look: [-34, 1.6, -24],
    zoom: 1,
    whoosh: true,
  },
  // which one? the three in turn
  {
    at: T.welche - 0.2,
    orbit: { c: [0, 5, 0], r: 36, y: 9, a0: 0.9, a1: 1.3 },
    zoom: 1,
    whoosh: true,
  },
  // whatever it looked like: many people
  { at: T.denn - 0.2, from: [6, 0.9, 24], to: [5, 1.4, 21], look: [0, 1.2, 12], zoom: 1 },
];
for (let i = 1; i < shots.length; i++)
  if (shots[i].at <= shots[i - 1].at) throw new Error(`shots out of order at #${i}`);

export const LABELS = [
  { text: "Grabbild", at: T.grab + 0.6, until: T.lange - 0.8, pos: [62.2, -118.6, -2], side: 1 },
  {
    text: "nasser Sand",
    at: T.mit + 1.0,
    until: T.bleibt - 0.4,
    pos: [-31.4, 1.11, 2.45],
    side: 1,
  },
];

export const SFX = [
  { s: "baustelle", at: 0, dur: T.raeder, db: -20 },
  { s: "wind", at: T.raeder - 0.2, dur: T.statt - T.raeder, db: -22 },
  { s: "stein", at: T.raeder + 0.8, db: -18 },
  { s: "schlitten", at: T.statt - 0.2, dur: T.grab - T.statt, db: -15 },
  { s: "hoehle", at: T.grab - 0.2, dur: T.mit - T.grab, db: -20 },
  { s: "schlitten", at: T.mit - 0.2, dur: T.bleibt - T.mit, db: -16 },
  { s: "giessen", at: T.mit + 0.4, db: -14 },
  { s: "wind", at: T.bleibt - 0.2, dur: T.y2018 - T.bleibt, db: -22 },
  { s: "schlitten", at: T.y2018 - 0.2, dur: T.welche - T.y2018, db: -17 },
  { s: "wind", at: T.welche - 0.2, dur: T.denn - T.welche, db: -22 },
  { s: "baustelle", at: T.denn - 0.2, dur: T.end - T.denn, db: -18 },
];

export const HIGHLIGHTS = [];
