// Chapter 1 "Das größte Schiff der Welt": the hull under the gantry, the
// finished ship (3 football pitches long), the dummy funnel, buoyancy, the
// bowl in the sink, the 16 compartments, "practically unsinkable", the boats.
import { W, END } from "./timing.js";

export const T = {
  geruest: W("Gerüst"),
  am: W("Am"),
  drei: W("drei"),
  vier: W("vier"),
  attrappe: W("Attrappe"),
  dass: W("Dass"),
  ein: W("drückt", 1),
  seite: W("Seite"),
  zurueck: W("zurück"),
  kennst: W("kennst"),
  hinein: W("hineinläuft"),
  geht: W("geht"),
  damit: W("Damit"),
  quer: W("Querwänden"),
  schotten: W("Schotten"),
  laeuft: W("Läuft"),
  rest: W("Rest"),
  fach: W("Fachzeitschrift"),
  dabei: W("Dabei"),
  boote: W("Rettungsboote"),
  haelfte: W("Hälfte"),
  end: END,
};
export const SHIP = [0, -1.15, 12]; // the finished ship afloat in the harbour
export const SINK = [0, 150, 0];
const sh = (x, y, z) => [SHIP[0] + x, SHIP[1] + y, SHIP[2] + z];
const sk = (x, y, z) => [SINK[0] + x, SINK[1] + y, SINK[2] + z];

export const shots = [
  { at: 0, from: [-21, -0.4, 17], to: [-15, -0.5, 14], look: [0, 1.6, 0], zoom: 1 },
  { at: T.geruest, from: [6.2, -0.85, 5.6], to: [5.2, -0.9, 5.0], look: [2.2, 5.6, 1.4], zoom: 1 },
  {
    at: T.am,
    from: sh(-16, 1.4, 12),
    to: sh(-5, 1.5, 11),
    look: sh(-1, 0.8, 0),
    zoom: 1,
    whoosh: true,
  },
  { at: T.drei, from: sh(0, 23, 21), to: sh(0, 25, 18), look: sh(0, 0, 3.6), zoom: 1 },
  { at: T.vier, from: sh(-6.5, 4.4, 8.5), to: sh(-4.8, 4.3, 8.0), look: sh(-2.0, 3.6, 0), zoom: 1 },
  { at: T.dass, from: sh(10.5, 0.25, 3.8), to: sh(8.5, 0.3, 3.4), look: sh(0, 0.6, 0), zoom: 1 },
  { at: T.ein, from: sh(13, -0.3, 4.2), to: sh(12, -0.35, 3.9), look: sh(0, -1.0, 0), zoom: 1 },
  {
    at: T.kennst - 0.3,
    from: sk(1.05, 0.8, 1.0),
    to: sk(0.9, 0.7, 0.86),
    look: sk(0, -0.14, 0),
    zoom: 1,
    whoosh: true,
  },
  {
    at: T.damit,
    from: sh(-5, 5.2, 14),
    to: sh(1.5, 4.6, 13),
    look: sh(0, 0.2, 0),
    zoom: 1,
    whoosh: true,
  },
  { at: T.laeuft, from: sh(3.4, 2.4, 7.2), to: sh(2.6, 2.2, 6.4), look: sh(0.6, 0.0, 0), zoom: 1 },
  { at: T.fach, from: sh(22, 0.5, 10), to: sh(17.5, 0.7, 8.4), look: sh(2, 2.2, 0), zoom: 1 },
  {
    at: T.dabei,
    from: sh(7.6, 2.45, 2.7),
    to: sh(6.9, 2.4, 2.5),
    look: sh(4.8, 1.95, 1.18),
    zoom: 1,
  },
  { at: T.boote - 0.2, from: [0.5, 5.2, 9.5], to: [0.3, 6.2, 10.5], look: [0, -1.1, 0.2], zoom: 1 },
];

export const LABELS = [
  { text: "Attrappe", at: T.attrappe - 0.4, until: T.dass - 0.2, pos: sh(-3.25, 4.6, 0), side: 1 },
  { text: "Schotten", at: T.schotten, until: T.laeuft - 0.2, pos: sh(3.95, -0.2, 0.9), side: 1 },
];

export const HIGHLIGHTS = [];

export const SFX = [
  { s: "nieten", at: 0, dur: T.am, db: -20 },
  { s: "wind", at: 0, dur: T.am, db: -26 },
  { s: "meer", at: T.am, dur: T.kennst - T.am, db: -24 },
  { s: "pop", at: T.drei + 0.3, db: -16 },
  { s: "pop", at: T.drei + 0.45, db: -16 },
  { s: "pop", at: T.drei + 0.6, db: -16 },
  { s: "rauschen", at: T.hinein, dur: T.damit - T.hinein, db: -20 },
  { s: "klack", at: T.quer + 0.1, db: -16 },
  { s: "klack", at: T.quer + 0.6, db: -18 },
  { s: "rauschen", at: T.laeuft + 0.3, dur: 2.2, db: -22 },
  { s: "meer", at: T.fach, dur: T.end - T.fach, db: -24 },
];
