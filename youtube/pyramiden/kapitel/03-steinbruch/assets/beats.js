// Chapter 3 "Steine aus dem Fels": the quarry, the copper chisel, the smiths,
// copper from Sinai, a block against two cars, granite from Aswan.
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
  nur: P("Nur", "wenige"),
  ihr: P("Ihr", "Werkzeug"),
  meissel: P("die", "Meißel"),
  auf: P("Auf", "der"),
  kupfer: P("Das", "Kupfer"),
  ein: P("Ein", "gewöhnlicher"),
  ungefaehr: P("ungefähr", "so"),
  fuer: P("Für", "die"),
  assuan: P("erst", "in"),
  manche: P("Manche", "der"),
  das: P("Das", "eigentliche"),
  end: END,
};
// a chisel strike every 0.48 s while the cutter works
export const STRIKE = 0.48;

export const shots = [
  // the quarry from its rim: terraces, blocks, workers
  { at: 0, from: [12.5, 1.2, 36.5], to: [11.5, 1.0, 35.5], look: [2, -2.2, 28], zoom: 1 },
  // a few hundred metres south of the building site: pyramid and pit together
  { at: T.nur - 0.2, from: [18, 9, 52], to: [14, 10, 48], look: [2, 0, 16], zoom: 1 },
  // the copper chisel at work
  {
    at: T.ihr - 0.2,
    from: [-1.05, -1.95, 30.55],
    to: [-1.15, -1.98, 30.45],
    look: [-1.38, -2.06, 30.05],
    zoom: 1,
    whoosh: true,
  },
  // the tip goes blunt: macro
  {
    at: T.meissel - 0.2,
    from: [-1.3, -1.96, 30.21],
    to: [-1.32, -1.965, 30.18],
    look: [-1.4, -1.985, 30.06],
    zoom: 1,
  },
  // the smiths at their fire
  {
    at: T.auf - 0.2,
    from: [15.1, 0.45, 28.2],
    to: [14.9, 0.4, 28.0],
    look: [14, 0.05, 27],
    zoom: 1,
    whoosh: true,
  },
  // copper bars from Sinai, then east across the valley
  {
    at: T.kupfer - 0.2,
    from: [14.9, 0.2, 27.25],
    to: [14.8, 0.22, 27.2],
    look: [14.56, 0.03, 26.98],
    lookTo: [80, 4, 0],
    zoom: 1,
  },
  // the balance: a block against two small cars
  {
    at: T.ein - 0.2,
    from: [-35.2, 2.0, 7.6],
    to: [-35.0, 1.95, 7.3],
    look: [-36, 1.75, 6],
    zoom: 1,
    whoosh: true,
  },
  {
    at: T.ungefaehr - 0.2,
    from: [-36.9, 1.9, 7.1],
    to: [-37.1, 1.85, 6.8],
    look: [-36, 1.7, 6],
    zoom: 1,
  },
  // granite: a boat on the flood with a red beam
  {
    at: T.fuer - 0.2,
    follow: "gboat",
    from: [3.0, 1.2, 2.4],
    to: [2.6, 1.0, 2.0],
    look: [0, 0.3, 0],
    zoom: 1,
    whoosh: true,
  },
  // from Aswan, far to the south: the valley from the air
  { at: T.assuan - 0.2, from: [40, 12, -10], to: [44, 13, -4], look: [70, -2, 120], zoom: 1 },
  // fifty tonnes: close on the beam and its crew
  {
    at: T.manche - 0.2,
    follow: "gboat",
    from: [-1.1, 1.0, 1.1],
    to: [-0.9, 0.9, 0.95],
    look: [0.1, 0.22, 0],
    zoom: 1,
  },
  // the real problem: moving them (quarry, blocks, the pyramid behind)
  { at: T.das - 0.2, from: [-4, 0.9, 38], to: [-3.4, 1.1, 36.5], look: [2, 0, 12], zoom: 1 },
];
for (let i = 1; i < shots.length; i++)
  if (shots[i].at <= shots[i - 1].at) throw new Error(`shots out of order at #${i}`);

export const LABELS = [
  {
    text: "Kupfer",
    at: T.kupfer + 0.3,
    until: T.kupfer + 3.4,
    pos: [14.56, 0.04, 26.98],
    side: -1,
  },
  { text: "Granit", at: T.fuer + 3.2, until: T.assuan - 0.4, pos: null, follow: "gboat", side: 1 },
];

export const SFX = [
  { s: "baustelle", at: 0, dur: T.ihr, db: -20 },
  { s: "meissel", at: T.ihr - 0.2, dur: T.auf - T.ihr, db: -12 },
  { s: "feuer", at: T.auf - 0.2, dur: T.ein - T.auf, db: -16 },
  { s: "wind", at: T.ein - 0.2, dur: T.fuer - T.ein, db: -22 },
  { s: "stein", at: T.ein + 0.5, db: -16 },
  { s: "wasser", at: T.fuer - 0.2, dur: T.das - T.fuer, db: -19 },
  { s: "segel", at: T.fuer - 0.2, dur: T.das - T.fuer, db: -23 },
  { s: "baustelle", at: T.das - 0.2, dur: T.end - T.das, db: -20 },
];

export const HIGHLIGHTS = [];
