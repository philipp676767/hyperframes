// Chapter 0 "Ein Logbuch im Sand": the logbook (archive voice) → the boat on
// the flood → Merer → the pyramid → the people → the logbook in the sand →
// the questions → the framing line.
import { W, END, WORDS } from "./timing.js";

// start of word a where the next word is b (anchors that stay unique)
const norm = (x) => x.toLowerCase().replace(/[^a-zäöüß0-9-]/g, "");
export function P(a, b, n = 1) {
  let c = 0;
  for (let i = 0; i + 1 < WORDS.length; i++)
    if (norm(WORDS[i].w) === norm(a) && norm(WORDS[i + 1].w) === norm(b) && ++c === n)
      return WORDS[i].start;
  throw new Error(`anchor not found: ${a} ${b}`);
}

export const T = {
  q2: P("Tag", "sechsundzwanzig"),
  es: P("Es", "ist"),
  der: P("Der", "Nil"),
  gleitet: W("gleitet"),
  an: P("An", "Bord"),
  vor: P("Vor", "ihm"),
  gebaut: P("gebaut", "von"),
  merers: P("Merers", "Logbuch"),
  bis: P("bis", "Archäologen"),
  kaum: P("Kaum", "ein"),
  wie: P("Wie", "hebt"),
  wer: P("Wer", "waren"),
  und: P("Und", "was", 2),
  das: P("Das", "ist"),
  wenn: P("Wenn", "du"),
  end: END,
};
// the hero boat: from far out on the flood to the harbour
export const BOAT_PATH = { t0: 0, t1: 64, from: [66, -4], to: [33, 11.5] };
const b = (x, y, z) => [x, y - 120, z];

export const shots = [
  // the logbook in the lamp light (archive voice reads)
  {
    at: 0,
    from: b(0.9, 0.55, 1.1),
    to: b(0.45, 0.38, 0.7),
    look: b(0.05, 0.03, 0),
    zoom: 1,
    tilt: 1.2,
  },
  // second entry: out on the flood, the boat with white blocks
  {
    at: T.q2 - 0.15,
    follow: "boat",
    from: [-3.6, 0.7, 3.4],
    to: [-3.9, 0.8, 2.4],
    look: [0, 0.55, 0],
    zoom: 1,
    whoosh: true,
  },
  // "Es ist ein Sommer …": wide over the flood, the building site on its cliff
  { at: T.es - 0.15, from: [78, 5, 30], to: [70, 6.5, 22], look: [4, 3, 2], zoom: 1, whoosh: true },
  // "Der Nil ist über die Ufer getreten": low over the water, villages, palms
  { at: T.der - 0.15, from: [66, -3.1, 30], to: [58, -3.0, 26], look: [52, -2.6, -18], zoom: 1 },
  // "gleitet ein Holzboot": alongside the boat
  {
    at: T.gleitet - 0.2,
    follow: "boat",
    from: [0.6, 0.5, 2.6],
    to: [-0.8, 0.45, 2.4],
    look: [-0.3, 0.3, 0],
    zoom: 1,
  },
  // "An Bord … Merer": on deck, the overseer at the bow
  {
    at: T.an - 0.2,
    follow: "boat",
    from: [-1.5, 0.62, 1.35],
    to: [-1.25, 0.55, 1.05],
    look: [-0.57, 0.2, 0.27],
    zoom: 1,
  },
  // "Vor ihm wächst die Cheops-Pyramide": over his shoulder to the pyramid
  {
    at: T.vor - 0.2,
    follow: "boat",
    from: [0.2, 0.45, -0.25],
    to: [-0.4, 0.42, -0.2],
    look: [-30, 5, -8],
    lookTo: [-30, 9, -10],
    zoom: 1,
  },
  // "gebaut von Menschen": the spiral ramp, sledges and teams
  {
    at: T.gebaut - 0.15,
    follow: "sledge",
    from: [1.5, 0.5, 1.4],
    to: [1.1, 0.42, 1.1],
    look: [-0.5, 0.12, 0],
    zoom: 1,
  },
  // "Merers Logbuch verschwindet": the sand, the jars, the rolls
  {
    at: T.merers - 0.2,
    from: b(2.6, 1.3, 2.6),
    to: b(2.2, 1.05, 2.1),
    look: b(0, 0.1, 0),
    zoom: 1,
    whoosh: true,
  },
  // "bis Archäologen es 2013 wiederfinden": closer on the sheet
  {
    at: T.bis - 0.1,
    from: b(-0.2, 0.75, 0.9),
    to: b(0.1, 0.55, 0.62),
    look: b(0.15, 0.03, 0),
    zoom: 1,
  },
  // "Kaum ein Bauwerk …": slow orbit around the site
  {
    at: T.kaum - 0.2,
    orbit: { c: [0, 5, 0], r: 36, y: 10, a0: 0.55, a1: 0.95 },
    zoom: 1,
    whoosh: true,
  },
  // "Wie hebt man Blöcke …": a sledge team on the ramp, close
  {
    at: T.wie - 0.15,
    follow: "sledge",
    from: [0.55, 0.32, 0.55],
    to: [0.35, 0.3, 0.42],
    look: [-0.05, 0.13, 0],
    zoom: 1,
  },
  // "Wer waren die Menschen": workers at the foot of the pyramid
  {
    at: T.wer - 0.15,
    follow: "sledge",
    from: [-1.6, 0.22, 0.55],
    to: [-1.25, 0.22, 0.5],
    look: [-0.7, 0.13, 0],
    zoom: 1,
  },
  // "Und was verrät uns dieses Logbuch?": the boat again, sail full
  {
    at: T.und - 0.15,
    follow: "boat",
    from: [1.8, 0.9, -2.4],
    to: [1.2, 0.8, -2.8],
    look: [-0.4, 0.6, 0],
    zoom: 1,
  },
  // "Das ist die Geschichte der Pyramiden …": the grand view, rising
  { at: T.das - 0.15, from: [52, -1.5, 46], to: [46, 4.5, 40], look: [0, 6, 0], zoom: 1 },
];

for (let i = 1; i < shots.length; i++)
  if (shots[i].at <= shots[i - 1].at) throw new Error(`shots out of order at #${i}`);

export const LABELS = [
  { text: "Gizeh", at: T.es + 1.0, until: T.der - 0.4, pos: [0, 11, 0], side: -1 },
  { text: "Cheops-Pyramide", at: T.vor + 0.6, until: T.gebaut - 0.5, pos: [0, 10.4, 0], side: -1 },
];

export const SFX = [
  { s: "hoehle", at: 0, dur: T.q2, db: -20 },
  { s: "wasser", at: T.q2 - 0.15, dur: T.merers - T.q2, db: -19 },
  { s: "wind", at: T.es - 0.15, dur: T.der - T.es, db: -22 },
  { s: "segel", at: T.gleitet - 0.2, dur: T.vor - T.gleitet, db: -22 },
  { s: "baustelle", at: T.vor, dur: T.merers - T.vor, db: -21 },
  { s: "hoehle", at: T.merers - 0.2, dur: T.kaum - T.merers, db: -19 },
  { s: "wind", at: T.kaum - 0.2, dur: T.wie - T.kaum, db: -22 },
  { s: "baustelle", at: T.wie - 0.15, dur: T.und - T.wie, db: -20 },
  { s: "wasser", at: T.und - 0.15, dur: T.das - T.und, db: -20 },
  { s: "wind", at: T.das - 0.15, dur: T.end - T.das, db: -21 },
];

export const HIGHLIGHTS = [];
