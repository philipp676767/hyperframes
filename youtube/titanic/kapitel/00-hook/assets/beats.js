// Chapter 0 "Eisberg voraus": the two archive voices (lookout, radio), then
// Sunday 14 April 1912 at sea, the shadow ahead, the wreck, the questions.
import { W, END } from "./timing.js";

export const T = {
  kommt: W("Kommt"),
  es: W("Es", 1),
  mitten: W("Mitten"),
  nacht: W("Nacht", 1),
  meer: W("Meer", 1),
  um: W("Um"),
  fleet: W("Fleet"),
  direkt: W("direkt", 2),
  an: W("An"),
  keine: W("Keine"),
  es2: W("Es", 2),
  warum: W("Warum", 1),
  wieso: W("Wieso"),
  hilfe: W("warum", 2),
  geschichte: W("Geschichte"),
  end: END,
};
export const RAD = [0, 300, 0];
export const DEP = [0, -320, 0];
const rad = (x, y, z) => [RAD[0] + x, RAD[1] + y, RAD[2] + z];
const dep = (x, y, z) => [DEP[0] + x, DEP[1] + y, DEP[2] + z];
export const CAL = [-34, 1.0, -46];

export const shots = [
  // the lookout from behind: the bow below, the dark berg ahead
  { at: 0, from: [9.62, 3.16, -0.13], to: [9.68, 3.15, -0.1], look: [20, -0.6, 0.8], zoom: 1 },
  // the Marconi room: the spark gap crackles
  {
    at: T.kommt - 0.15,
    from: rad(0.85, 0.78, 0.15),
    to: rad(0.72, 0.74, 0.02),
    look: rad(0.12, 0.6, -0.7),
    zoom: 1,
    whoosh: true,
  },
  // Sunday, 14 April 1912: the whole ship gliding through the night
  {
    at: T.es - 0.2,
    from: [-25, 5.5, 27],
    to: [-17, 4.2, 23],
    look: [0, 1.5, 0],
    zoom: 1,
    whoosh: true,
  },
  { at: T.mitten, from: [17, 0.4, 4.6], to: [10, 0.35, 4.3], look: [0, 0.9, 0], zoom: 1 },
  { at: T.nacht, from: [-17, 7.5, -3.5], to: [-15, 6.8, -2.5], look: [6, 2, 0], zoom: 1 },
  { at: T.meer, from: [8, 0.12, 24], to: [5, 0.12, 21], look: [0, 1.4, 0], zoom: 1 },
  // 23:39 — the lookout
  { at: T.um, from: [10.75, 3.08, 0.55], to: [10.5, 3.04, 0.42], look: [9.82, 2.94, 0], zoom: 1 },
  // the shadow ahead grows
  { at: T.direkt, from: [11.2, 2.15, 0.05], to: [12.3, 2.0, 0.05], look: [24, -0.4, 0.7], zoom: 1 },
  // 2,200 people: the lit windows
  { at: T.an, from: [-5, 1.45, 4.2], to: [1.5, 1.4, 4.0], look: [-1.5, 1.3, 0], zoom: 1 },
  // less than three hours later: the bottom of the Atlantic
  {
    at: T.keine,
    from: dep(9.5, 1.6, 13.5),
    to: dep(8.0, 1.3, 12.0),
    look: dep(7.5, -0.2, 3.6),
    zoom: 1,
    whoosh: true,
  },
  // back up: the ship from high above
  { at: T.es2, orbit: { c: [0, 1, 0], r: 36, y: 15, a0: 2.3, a1: 1.7 }, whoosh: true },
  { at: T.warum, from: [16, 0.45, 2.8], to: [15.2, 0.5, 2.4], look: [12, 0.9, 0], zoom: 1 },
  { at: T.wieso, from: [3.2, 2.1, 6.8], to: [-0.6, 2.1, 6.8], look: [0.5, 3.4, 0], zoom: 1 },
  // help so close: the Californian's lights on the horizon
  { at: T.hilfe, from: [-4.0, 2.06, -1.42], to: [-4.4, 2.08, -1.5], look: CAL, zoom: 1 },
  // the story of the Titanic: hero shot
  { at: T.geschichte, from: [21, 0.6, 9.5], to: [16.5, 0.9, 7.5], look: [4, 2.0, 0], zoom: 1 },
];

export const LABELS = [
  { text: "Frederick Fleet", at: T.um + 0.4, until: T.um + 3.2, pos: [9.82, 3.0, 0], side: -1 },
  { text: "Californian", at: T.hilfe + 0.6, until: T.hilfe + 3.6, pos: CAL, side: 1 },
];

export const HIGHLIGHTS = [{ kind: "shake", at: T.direkt + 3.2, dur: 0.6, amp: 0.25 }];

export const SFX = [
  { s: "wind", at: 0, dur: T.kommt, db: -20 },
  { s: "glocke", at: 0.1, db: -8 },
  { s: "morse", at: T.kommt, db: -12 },
  { s: "meer", at: T.es - 0.2, dur: T.keine - T.es, db: -20 },
  { s: "maschine", at: T.es - 0.2, dur: T.keine - T.es, db: -26 },
  { s: "wind", at: T.um, dur: T.an - T.um, db: -22 },
  { s: "tauchen", at: T.keine, dur: T.es2 - T.keine, db: -16 },
  { s: "meer", at: T.es2, dur: T.end - T.es2, db: -20 },
  { s: "maschine", at: T.es2, dur: T.end - T.es2, db: -26 },
];
