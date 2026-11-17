// Chapter 8 "3.800 Meter tief": 1914 — boats for all (a model ship on the
// desk fills up with boats), radio day and night (the clock races), the ice
// patrol (a little ship circling a berg), then down: the wreck found 1985,
// bow and stern apart, the bow in the mud, rusticles, decay.
import { W, END } from "./timing.js";

export const T = {
  jedes: W("Jedes"),
  funk: W("Funk"),
  ausserdem: W("Außerdem"),
  titanic: W("Titanic", 1),
  erst: W("Erst"),
  ballard: W("Ballard"),
  druck: W("Druck"),
  bug: W("Bug", 1),
  bug2: W("Bug", 2),
  heck2: W("Heck", 2),
  doch: W("Doch"),
  bakterien: W("Bakterien"),
  forscher: W("Forscher"),
  end: END,
};
export const RAD = [0, 300, 0];
const rad = (x, y, z) => [RAD[0] + x, RAD[1] + y, RAD[2] + z];
export const STERN = [-30, 0, 6];

export const shots = [
  { at: 0, from: rad(0.9, 0.95, 0.6), to: rad(0.8, 0.9, 0.5), look: rad(0, 0.5, -0.55), zoom: 1 },
  {
    at: T.jedes,
    from: rad(0.45, 0.7, -0.05),
    to: rad(0.38, 0.68, -0.12),
    look: rad(0, 0.5, -0.55),
    zoom: 1,
  },
  {
    at: T.funk,
    from: rad(0.65, 1.2, -0.45),
    to: rad(0.62, 1.18, -0.5),
    look: rad(0.6, 1.15, -0.89),
    zoom: 1,
  },
  {
    at: T.ausserdem,
    from: rad(-0.15, 0.62, -0.1),
    to: rad(-0.2, 0.6, -0.15),
    look: rad(-0.45, 0.47, -0.5),
    zoom: 1,
  },
  { at: T.titanic, from: [6, 6, 10], to: [5, 3, 8], look: [2, -1.5, 0], zoom: 1, whoosh: true },
  { at: T.ballard, from: [14, -0.2, 9], to: [12.5, -0.3, 8], look: [9, -0.6, 3], zoom: 1 },
  { at: T.bug, from: [-6, 6, 14], to: [-10, 6, 13], look: [-12, -1.5, 3], zoom: 1 },
  { at: T.bug2, from: [16, -0.9, 4], to: [15, -0.8, 3.6], look: [10, 0.2, 0], zoom: 1 },
  { at: T.heck2, from: [-17, 1.6, 12], to: [-18, 1.5, 11], look: [-28, -0.8, 5], zoom: 1 },
  { at: T.doch, from: [7, 0.4, 3.0], to: [6.4, 0.35, 2.7], look: [5.5, 0.2, 1.3], zoom: 1 },
  { at: T.forscher, from: [12, 1.2, 9], to: [10, 1.0, 8], look: [4, -0.2, 0], zoom: 1 },
];

export const LABELS = [
  { text: "Bug", at: T.bug2, until: T.bug2 + 2.6, pos: [11, 0.6, 0], side: 1 },
  { text: "Heck", at: T.heck2, until: T.heck2 + 2.6, pos: [-30, -0.6, 6], side: -1 },
];

export const HIGHLIGHTS = [];

export const SFX = [
  { s: "morse", at: T.funk + 0.3, db: -16 },
  { s: "pop", at: T.jedes + 0.6, db: -18 },
  { s: "tauchen", at: T.titanic, dur: T.end - T.titanic, db: -14 },
];
