// Chapter 2 "Was im Berg passiert": into the mountain — the magma chamber,
// gas dissolved like in soda, the bottle opened, the same in the Vesuvius,
// pumice, the column 30 km high (airliner for scale), the pine crown, the
// young Pliny watching from Misenum, the wind pushing the cloud over Pompeii.
import { W, END } from "./timing.js";

export const T = {
  berg: W("Berg"),
  mehrere: W("Mehrere"),
  kammer: W("Kammer"),
  in: W("In", 2),
  so: W("so", 1),
  solange: W("Solange"),
  wenn: W("Wenn"),
  oeffnest: W("öffnest"),
  genau: W("Genau"),
  heraus: W("Heraus", 2),
  saeule: W("Säule"),
  bims: W("Bimsstein"),
  sie: W("Sie"),
  flug: W("Flugzeuge"),
  krone: W("oben", 2) - 0.1,
  von: W("Von"),
  plinius: W("Plinius"),
  was: W("Was", 2),
  end: END,
};
const x = (a, y, z) => [a, y - 200, z];

export const shots = [
  // on the mountain's flank, about to look inside
  { at: 0, from: [0.5, 3.2, -14], to: [0.4, 3.6, -18], look: [0, 16, -62], zoom: 1 },
  // the mountain cut open
  {
    at: T.berg - 0.1,
    from: x(0, 7, 58),
    to: x(0, 5.5, 50),
    look: x(0, -1, 0),
    zoom: 1,
    whoosh: true,
  },
  // down to the magma chamber
  { at: T.mehrere - 0.2, from: x(9, -2, 30), to: x(5, -5, 22), look: x(0, -8.5, 0), zoom: 1 },
  // gas in the magma: bubbles
  { at: T.in - 0.2, from: x(3, -6.8, 10), to: x(1.6, -7.2, 7.8), look: x(0, -8.5, 0.6), zoom: 1 },
  // the soda bottle
  {
    at: T.so - 0.2,
    from: x(32, 7.5, 15),
    to: x(30, 7, 13),
    look: x(26, 5, 4),
    zoom: 1,
    whoosh: true,
  },
  { at: T.wenn - 0.2, from: x(29.5, 6.2, 11), to: x(29, 6.4, 10.4), look: x(26, 6.5, 4), zoom: 1 },
  // the same in the mountain: the conduit, bubbles tearing the magma apart
  {
    at: T.genau - 0.2,
    from: x(7, 4, 22),
    to: x(4.5, 6, 17),
    look: x(0, 4, 0),
    zoom: 1,
    whoosh: true,
  },
  // no lava river but a column
  { at: T.heraus - 0.2, from: x(0, 16, 80), to: x(0, 20, 70), look: x(0, 18, 0), zoom: 1 },
  // pumice: a single stone, close
  {
    at: T.bims - 0.3,
    from: x(-23.6, 4.6, 9.6),
    to: x(-24.0, 4.55, 9.2),
    look: x(-25, 4.4, 8),
    zoom: 1,
  },
  // 30 km — three times as high as airliners fly
  {
    at: T.sie - 0.2,
    from: [70, 12, 70],
    to: [62, 14, 64],
    look: [0, 50, -62],
    zoom: 1,
    whoosh: true,
  },
  // the crown of a tree: a stone pine in front of the column
  { at: T.krone, from: [-20, 1.4, 10], to: [-19.4, 1.4, 9.2], look: [0, 45, -62], zoom: 1 },
  // the young Pliny at Misenum, across the bay
  {
    at: T.von - 0.2,
    from: [-88.9, 4.25, 51.9],
    to: [-88.5, 4.2, 51.4],
    look: [0, 14, -62],
    zoom: 1,
    whoosh: true,
  },
  // the wind pushes the umbrella over Pompeii
  { at: T.was - 0.2, from: [-84, 30, 98], to: [-76, 32, 94], look: [8, 58, -30], zoom: 1 },
];

export const LABELS = [
  { text: "Magmakammer", at: T.kammer, until: T.in - 0.3, pos: [-3.5, -208.5, 1.2], side: -1 },
  { text: "Bimsstein", at: T.bims, until: T.sie - 0.4, pos: [-25, -195.6, 8], side: 1 },
  { text: "Flughöhe", at: T.flug - 0.2, until: T.krone - 0.3, pos: [18, 33, -40], side: 1 },
  { text: "Plinius", at: T.plinius - 0.1, until: T.was - 0.4, pos: [-86.74, 3.95, 49.83], side: 1 },
];

export const SFX = [
  { s: "wind", at: 0, dur: T.berg, db: -20 },
  { s: "grollen", at: T.mehrere, db: -12 },
  { s: "grollen", at: T.in, db: -14 },
  { s: "ausbruch", at: T.oeffnest - 0.05, db: -14 },
  { s: "grollen", at: T.genau, db: -8 },
  { s: "ausbruch", at: T.saeule - 0.5, db: -8 },
  { s: "saeule", at: T.sie, dur: T.end - T.sie, db: -18 },
  { s: "meer", at: T.von, dur: T.was - T.von, db: -20 },
  { s: "wind", at: T.was, dur: T.end - T.was, db: -18 },
];

export const HIGHLIGHTS = [{ kind: "shake", at: T.saeule - 0.4, dur: 0.8, amp: 0.5 }];
