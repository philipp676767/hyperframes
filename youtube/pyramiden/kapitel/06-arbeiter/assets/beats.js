// Chapter 6 "Die Stadt der Arbeiter": the slave myth, Herodotus, the 1990
// find, the cemetery, a healed bone, the town (bread, beer, meat), 20 000
// people, the gangs' names in the relieving chambers, the football joke.
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
  der: P("Der", "Grieche"),
  funde: P("Die", "Funde"),
  im: P("Im", "Jahr"),
  stolpert: P("ein", "Pferd"),
  darunter: P("Darunter", "liegt"),
  ihre: P("Ihre", "Skelette"),
  nicht: P("Nicht", "weit"),
  hier: P("Hier", "entstehen"),
  knochen: P("die", "vielen"),
  heute: P("Heute", "schätzt"),
  namen: P("Ihre", "Mannschaften"),
  in: P("In", "Hohlräumen"),
  freunde: P("die", "Freunde"),
  ein: P("Ein", "bisschen"),
  end: END,
};
const c = (x, y, z) => [x, y - 160, z];

export const shots = [
  // the old picture: masses of people hauling at the pyramid
  { at: 0, from: [9, 1.1, 26], to: [7.5, 1.3, 24], look: [0, 1.5, 13], zoom: 1 },
  // a hundred thousand men, said Herodotus: high and wide
  { at: T.der - 0.2, from: [-26, 12, 40], to: [-22, 13, 37], look: [0, 1, 12], zoom: 1 },
  // what the finds say: towards the slope south of the pyramids
  {
    at: T.funde - 0.2,
    from: [2, 2.6, 60],
    to: [3.5, 2.4, 58],
    look: [10, 0.2, 49],
    zoom: 1,
    whoosh: true,
  },
  // 1990: a horse stumbles over a mudbrick wall
  {
    at: T.stolpert - 0.4,
    follow: "horse",
    from: [0.45, 0.16, -0.55],
    to: [0.38, 0.15, -0.5],
    look: [-0.05, 0.1, 0],
    zoom: 1,
  },
  // the cemetery of the workers, near their king
  { at: T.darunter - 0.2, from: [14, 1.2, 56], to: [12.5, 1.4, 55], look: [4, 2, 30], zoom: 1 },
  // a healed fracture
  {
    at: T.ihre - 0.2,
    follow: "bone",
    from: [0.18, 0.22, 0.3],
    to: [0.12, 0.17, 0.22],
    look: [0.01, 0.01, 0],
    zoom: 1,
    whoosh: true,
  },
  // a whole town: galleries, houses, smoke
  {
    at: T.nicht - 0.2,
    from: [12, 4, 62],
    to: [14, 4.4, 59],
    look: [24, -3, 46],
    zoom: 1,
    whoosh: true,
  },
  // bread and beer
  {
    at: T.hier - 0.2,
    from: [21.9, -2.55, 53.9],
    to: [21.75, -2.6, 53.7],
    look: [21, -3.05, 53],
    zoom: 1,
  },
  // cattle, sheep, goats: there was meat
  {
    at: T.knochen - 0.2,
    from: [30.4, -2.6, 52.4],
    to: [30.8, -2.65, 52.0],
    look: [32, -3.0, 50],
    zoom: 1,
  },
  // twenty thousand at the same time: the whole site
  { at: T.heute - 0.2, from: [34, 16, 52], to: [30, 18, 48], look: [4, 0, 16], zoom: 1 },
  // the gangs had names: up into the relieving chambers
  { at: T.namen - 0.2, from: [24, 4, 26], to: [16, 8, 18], look: [0, 6, 1], zoom: 1 },
  {
    at: T.in - 0.15,
    from: c(1.6, 0.6, 1.0),
    to: c(1.0, 0.55, 0.6),
    look: c(0, 0.5, -1.29),
    zoom: 1,
    whoosh: true,
  },
  // "die Freunde des Cheops": the red marks, close
  {
    at: T.freunde - 0.2,
    from: c(-0.6, 0.55, 0.1),
    to: c(-0.7, 0.52, -0.1),
    look: c(-0.9, 0.5, -1.29),
    zoom: 1,
  },
  // like a football team: the gang posing in front of their pyramid
  {
    at: T.ein - 0.2,
    from: [1.6, 0.25, 16.6],
    to: [1.4, 0.24, 16.4],
    look: [-0.4, 0.2, 15.4],
    zoom: 1,
    whoosh: true,
  },
];
for (let i = 1; i < shots.length; i++)
  if (shots[i].at <= shots[i - 1].at) throw new Error(`shots out of order at #${i}`);

export const BONE_LABEL = { text: "verheilter Bruch", at: T.ihre + 2.5, until: T.nicht - 0.4 };
export const LABELS = [
  {
    text: "Arbeiterfriedhof",
    at: T.darunter + 0.8,
    until: T.ihre - 0.4,
    pos: [10, 0.6, 50],
    side: 1,
  },
  {
    text: "Freunde des Cheops",
    at: T.freunde + 0.2,
    until: T.ein - 0.4,
    pos: [-0.9, -159.5, -1.29],
    side: 1,
  },
];

export const SFX = [
  { s: "baustelle", at: 0, dur: T.funde, db: -17 },
  { s: "wind", at: T.funde - 0.2, dur: T.nicht - T.funde, db: -22 },
  { s: "stein", at: T.stolpert + 0.4, db: -20 },
  { s: "baustelle", at: T.nicht - 0.2, dur: T.hier - T.nicht, db: -23 },
  { s: "feuer", at: T.hier - 0.2, dur: T.knochen - T.hier, db: -16 },
  { s: "wind", at: T.knochen - 0.2, dur: T.namen - T.knochen, db: -22 },
  { s: "baustelle", at: T.heute - 0.2, dur: T.in - T.heute, db: -20 },
  { s: "hall", at: T.in - 0.15, dur: T.ein - T.in, db: -18 },
  { s: "baustelle", at: T.ein - 0.2, dur: T.end - T.ein, db: -22 },
];

export const HIGHLIGHTS = [];
