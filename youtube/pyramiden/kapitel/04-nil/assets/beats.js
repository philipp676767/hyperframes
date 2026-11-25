// Chapter 4 "Der Fluss als Förderband": Tura, the logbook, Merer's crossing,
// the flood rising, the harbour, the buried branch, the arrival.
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
  sein: P("Sein", "Logbuch"),
  seine: P("Seine", "Mannschaft"),
  fuer: P("für", "die"),
  q: P("Tag", "siebenundzwanzig"),
  moeglich: P("Möglich", "macht"),
  jeden: P("Jeden", "Sommer"),
  ueber: P("Über", "Kanäle"),
  was: P("Was", "an"),
  wie: P("Wie", "wichtig"),
  auf: P("Auf", "Radarbildern"),
  laut: P("Laut", "Logbuch"),
  doch: P("Doch", "am"),
  end: END,
};
// Merer's crossing: from Tura to the harbour (x, z on the flood)
export const CROSS = { t0: T.q - 1, t1: T.doch + 4, from: [93.5, -6], to: [31, 13] };
const b = (x, y, z) => [x, y - 120, z];

export const shots = [
  // Merer's boat at the Tura quay, loading
  { at: 0, from: [86, -2.4, 2], to: [87, -2.6, 0.5], look: [94, -3.2, -6], zoom: 1 },
  // the logbook: what it describes
  {
    at: T.sein - 0.2,
    from: b(0.7, 0.5, 0.95),
    to: b(0.4, 0.4, 0.7),
    look: b(0.05, 0.03, 0),
    zoom: 1,
    whoosh: true,
  },
  // the white cliffs of Tura, men and blocks on the quay
  {
    at: T.seine - 0.2,
    from: [88, -1.6, 10],
    to: [89, -1.9, 7],
    look: [97, -1.6, -8],
    zoom: 1,
    whoosh: true,
  },
  // for the casing: the white lower part of the pyramid
  {
    at: T.fuer - 0.2,
    from: [22, 2.0, 22],
    to: [20.5, 2.3, 20.5],
    look: [3, 3.2, 4],
    zoom: 1,
    whoosh: true,
  },
  // the logbook entry: the boat crossing the flood
  {
    at: T.q - 0.15,
    follow: "boat",
    from: [2.6, 0.7, -2.8],
    to: [2.2, 0.75, -3.2],
    look: [-0.5, 0.4, 0],
    zoom: 1,
    whoosh: true,
  },
  // the river's calendar: high over the flood
  { at: T.moeglich - 0.2, from: [80, 22, 60], to: [72, 24, 52], look: [40, -3, 0], zoom: 1 },
  // every summer the Nile rises (villages become islands)
  { at: T.jeden - 0.2, from: [62, -2.6, 30], to: [58, -2.4, 27], look: [52, -3.4, -18], zoom: 1 },
  // canals and the harbour basin below the plateau
  {
    at: T.ueber - 0.2,
    from: [44, 0.5, 26],
    to: [41, 0.8, 23],
    look: [29, -3.6, 12],
    zoom: 1,
    whoosh: true,
  },
  // what hundreds of men would have to drag, one boat carries
  {
    at: T.was - 0.2,
    follow: "boat",
    from: [-2.2, 0.55, 1.6],
    to: [-1.8, 0.5, 1.4],
    look: [0, 0.3, 0],
    zoom: 1,
  },
  // 2024: a satellite's view, the buried branch lights up
  {
    at: T.wie - 0.2,
    from: [30, 120, 30],
    to: [30, 140, 30.1],
    look: [30, 0, 0],
    zoom: 1,
    whoosh: true,
  },
  { at: T.auf - 0.2, from: [24, 160, 10], to: [24, 200, 10.1], look: [24, 0, 0], zoom: 1 },
  // week after week: the fleet shuttling
  { at: T.laut - 0.2, from: [70, 3, 30], to: [64, 3.4, 28], look: [50, -3.5, 4], zoom: 1 },
  // at the harbour the water ends: from the quay up to the building site
  { at: T.doch - 0.2, from: [36, 1.2, 24], to: [33, 1.8, 21], look: [14, 3.5, 5], zoom: 1 },
];
for (let i = 1; i < shots.length; i++)
  if (shots[i].at <= shots[i - 1].at) throw new Error(`shots out of order at #${i}`);

export const LABELS = [
  { text: "Tura", at: T.seine + 1.0, until: T.fuer - 0.4, pos: [100, 0.2, -8], side: -1 },
  { text: "Hafen", at: T.ueber + 1.2, until: T.was - 0.4, pos: [31, -3.4, 12], side: 1 },
];

export const SFX = [
  { s: "wasser", at: 0, dur: T.sein, db: -20 },
  { s: "baustelle", at: 0, dur: T.sein, db: -26 },
  { s: "hoehle", at: T.sein - 0.2, dur: T.seine - T.sein, db: -21 },
  { s: "baustelle", at: T.seine - 0.2, dur: T.q - T.seine, db: -22 },
  { s: "segel", at: T.q - 0.15, dur: T.moeglich - T.q, db: -21 },
  { s: "wasser", at: T.q - 0.15, dur: T.wie - T.q, db: -20 },
  { s: "wind", at: T.wie - 0.2, dur: T.laut - T.wie, db: -22 },
  { s: "wasser", at: T.laut - 0.2, dur: T.end - T.laut, db: -20 },
  { s: "baustelle", at: T.doch - 0.2, dur: T.end - T.doch, db: -22 },
];

export const HIGHLIGHTS = [];
