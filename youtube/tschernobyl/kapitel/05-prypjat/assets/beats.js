// Chapter 5 "Prypjat wird leer": an ordinary Saturday, the Ferris wheel, the
// plume 3 km away, the announcement, the buses, the empty town, Forsmark.
import { W, END } from "./timing.js";

export const T = {
  kinder: W("Kinder"),
  im: W("Vergnügungspark") - 0.4,
  nur: W("Nur"),
  erst: W("Erst", 1),
  achtung: W("Achtung", 1),
  menschen: W("Menschen"),
  ueber: W("Über", 1),
  wenigen: W("wenigen"),
  zurueck: W("Zurück"),
  rest: W("Rest") - 0.3,
  alarm: W("Strahlenalarm"),
  schuhen: W("Schuhen"),
  schweden: W("Schweden"),
  wind: W("Wind") - 0.5,
  abend: W("Erst", 2),
  end: END,
};
const f = (x, y, z) => [x, 300 + y, z];

export const shots = [
  // Saturday morning over Prypjat
  { at: 0, from: [-34, 16, 40], to: [-26, 13, 34], look: [0, 1, -4], zoom: 1 },
  // children on the park paths
  { at: T.kinder - 0.2, from: [5, 0.5, 8], to: [3.5, 0.5, 7.5], look: [0, 0.4, 1], zoom: 1 },
  // the yellow Ferris wheel
  { at: T.im, from: [-4, 0.5, 6], to: [-3, 0.6, 5], look: [0, 1.6, -1], zoom: 1 },
  // three kilometres away: the plume
  { at: T.nur - 0.2, from: [-2, 1.2, 9], to: [-1, 1.3, 8], look: [70, 10, -110], zoom: 1 },
  // the loudspeaker on the square
  {
    at: T.erst - 0.2,
    from: [-1.6, 1.0, 5.4],
    to: [-1.9, 1.0, 5.2],
    look: [-3, 0.95, 3.5],
    zoom: 1,
    whoosh: true,
  },
  { at: T.achtung - 0.1, from: [-8, 3, 16], to: [-6, 2.6, 14], look: [-2, 0.6, 3], zoom: 1 },
  // people with bags walking to the road
  { at: T.menschen - 0.2, from: [6, 0.7, 13], to: [4, 0.7, 12.5], look: [0, 0.4, 6], zoom: 1 },
  // the bus column
  { at: T.ueber - 0.2, from: [-50, 2.2, 15], to: [-20, 2.2, 14], look: [-10, 0.4, 9], zoom: 1 },
  // the town empty
  { at: T.wenigen - 0.2, from: [12, 5, 16], to: [9, 4.4, 13], look: [0, 1, -2], zoom: 1 },
  { at: T.zurueck - 0.2, from: [3.5, 0.3, 4], to: [3, 0.35, 3.2], look: [0, 1.9, -1], zoom: 1 },
  // Forsmark, Sweden, Monday morning
  {
    at: T.rest,
    from: f(4.5, 1.7, 7),
    to: f(3.5, 1.6, 6),
    look: f(0, 1.2, 0),
    zoom: 1,
    whoosh: true,
  },
  {
    at: T.alarm - 0.3,
    from: f(2.6, 1.0, 2.6),
    to: f(2.3, 0.9, 2.3),
    look: f(0, 0.45, 0.3),
    zoom: 1,
  },
  { at: T.schweden - 0.2, from: f(-5, 2.4, 6), to: f(-4, 2.3, 5), look: f(0, 1.2, -1), zoom: 1 },
  // the wind: the plume drifting west over the forest
  {
    at: T.wind,
    from: [40, 22, -20],
    to: [30, 24, -10],
    look: [76, 30, -108],
    zoom: 1,
    whoosh: true,
  },
  { at: T.abend - 0.2, orbit: { c: [76, 20, -108], r: 90, y: 16, a0: -1.2, a1: -1.0 } },
];

export const LABELS = [
  { text: "Riesenrad", at: T.im + 1.2, until: T.nur - 0.3, pos: [0, 1.8, -1], side: 1 },
  { text: "Block 4", at: T.nur + 1.6, until: T.erst - 0.3, pos: [76, 6, -108], side: -1 },
  {
    text: "Schuhe",
    at: T.schuhen - 0.3,
    until: T.schweden - 0.3,
    pos: f(0.05, 0.06, 0.45),
    side: 1,
  },
];

export const HIGHLIGHTS = [];

export const SFX = [
  { s: "morgen", at: 0, dur: T.erst, db: -16 },
  { s: "wind", at: T.erst - 0.2, dur: T.ueber - T.erst, db: -22 },
  { s: "bus", at: T.ueber - 0.2, dur: T.wenigen - T.ueber + 2, db: -16 },
  { s: "wind", at: T.wenigen, dur: T.rest - T.wenigen, db: -18 },
  { s: "halle", at: T.rest, dur: T.wind - T.rest, db: -24 },
  { s: "piep", at: T.alarm, db: -10 },
  { s: "piep", at: T.alarm + 0.5, db: -10 },
  { s: "piep", at: T.alarm + 1.0, db: -10 },
  { s: "wind", at: T.wind, dur: T.end - T.wind, db: -16 },
];
