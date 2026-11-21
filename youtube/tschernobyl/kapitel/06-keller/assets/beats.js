// Chapter 6 "Drei Männer im Keller" (re-hook): helicopters drop sand, the core
// melts towards the water pool, three volunteers open the valves.
import { W, END } from "./timing.js";

export const T = {
  hub: W("Hubschrauber"),
  um: W("um", 1),
  doch: W("Doch"),
  kern: W("Kern"),
  uran: W("Uran"),
  die: W("langsam") - 0.3,
  und: W("genau") - 0.2,
  trifft: W("Trifft"),
  jemand: W("Jemand"),
  drei: W("Drei"),
  ana: W("Ananenko"),
  bes: W("Bespalow"),
  bar: W("Baranow"),
  mit: W("Mit"),
  finden: W("finden"),
  oft: W("Oft"),
  haettest: W("Hättest"),
  denn: W("Denn"),
  end: END,
};
const k = (x, y, z) => [x, -300 + y, z];
const b = (x, y, z) => [60 + x, -300 + y, z];

export const shots = [
  // the smoking ruin by day, helicopters coming in
  { at: 0, from: [40, 14, 46], to: [32, 13, 38], look: [3, 6, -1], zoom: 1 },
  // a helicopter over the shaft, the load falls
  { at: T.hub - 0.2, from: [12, 12, 10], to: [10, 12.5, 8], look: [3, 10, -1], zoom: 1 },
  { at: T.um - 0.2, from: [-12, 8, 22], to: [-8, 9, 20], look: [3, 8, -1], zoom: 1 },
  // below: the core melting
  {
    at: T.doch - 0.2,
    from: k(-2, 4, 18),
    to: k(0, 3, 16),
    look: k(0, 1.5, -2),
    zoom: 1,
    whoosh: true,
  },
  { at: T.uran - 0.2, from: k(3.5, 1.2, 6), to: k(2.6, 0.6, 5), look: k(0, -0.5, -1.5), zoom: 1 },
  // it eats its way down
  { at: T.die - 0.2, from: k(0, -2, 17), to: k(0, -4, 16), look: k(0, -4.5, -2), zoom: 1 },
  // the pool beneath
  { at: T.und - 0.2, from: k(-8, -6.5, 14), to: k(-5, -7, 12), look: k(0, -10, -2), zoom: 1 },
  { at: T.trifft - 0.2, from: k(0, -8.2, 11), to: k(0, -8.5, 9), look: k(0, -5, -2), zoom: 1 },
  // the flooded basement
  {
    at: T.jemand - 0.2,
    from: b(0.4, 1.6, 4),
    to: b(0.2, 1.5, 2.5),
    look: b(0, 1.0, -12),
    zoom: 1,
    whoosh: true,
  },
  // three volunteers
  {
    at: T.drei - 0.2,
    from: b(1.2, 1.5, -4.5),
    to: b(1.0, 1.45, -4.0),
    look: b(0, 1.4, 0),
    zoom: 1,
  },
  // wading with their lamps (camera ahead of them, backing away)
  {
    at: T.mit - 0.2,
    from: b(0.45, 1.35, -19.5),
    to: b(0.4, 1.35, -19.0),
    look: b(0, 1.2, -6),
    zoom: 1,
  },
  // the valves
  {
    at: T.finden - 0.2,
    from: b(0.4, 1.5, -21.5),
    to: b(0.3, 1.45, -22.2),
    look: b(-1.25, 1.3, -22),
    zoom: 1,
  },
  { at: T.oft - 0.2, from: b(1.0, 1.7, -14), to: b(0.8, 1.7, -15), look: b(0, 1.3, -22), zoom: 1 },
  // would you have volunteered?
  {
    at: T.haettest - 0.2,
    from: b(0.6, 1.5, -26),
    to: b(0.5, 1.5, -25.4),
    look: b(0, 1.4, -20),
    zoom: 1,
  },
  // meanwhile the cloud drifts west
  {
    at: T.denn - 0.2,
    from: [30, 30, 50],
    to: [20, 34, 44],
    look: [-20, 20, -10],
    zoom: 1,
    whoosh: true,
  },
];

export const LABELS = [
  { text: "Kernschmelze", at: T.uran + 0.4, until: T.die - 0.4, pos: k(0, 1.5, -1.5), side: 1 },
  { text: "Wasserbecken", at: T.und + 1.0, until: T.trifft - 0.3, pos: k(-4, -9.5, -2), side: -1 },
  { text: "Alexei Ananenko", at: T.ana - 0.2, until: T.bes - 0.2, pos: b(-0.7, 1.75, 0), side: -1 },
  { text: "Waleri Bespalow", at: T.bes - 0.2, until: T.bar - 0.4, pos: b(0, 1.75, -0.8), side: 1 },
  { text: "Boris Baranow", at: T.bar - 0.2, until: T.mit - 0.3, pos: b(0.7, 1.75, -1.6), side: 1 },
];

export const HIGHLIGHTS = [];

export const SFX = [
  { s: "hubschrauber", at: 0, dur: T.doch, db: -14 },
  { s: "feuer", at: 0, dur: T.doch, db: -22 },
  { s: "rumpeln", at: T.kern, db: -14 },
  { s: "feuer", at: T.uran, dur: T.jemand - T.uran, db: -20 },
  { s: "tropfen", at: T.jemand - 0.2, dur: T.denn - T.jemand, db: -16 },
  { s: "waten", at: T.mit - 0.2, dur: T.finden - T.mit, db: -12 },
  { s: "ventil", at: T.finden + 1.0, db: -10 },
  { s: "ventil", at: T.finden + 2.4, db: -12 },
  { s: "wind", at: T.denn - 0.2, dur: T.end - T.denn, db: -16 },
];
