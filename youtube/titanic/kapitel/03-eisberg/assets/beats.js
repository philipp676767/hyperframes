// Chapter 3 "37 Sekunden": no binoculars (the locked cupboard), a sea without
// waves, the bell, Murdoch's order, 52,000 tonnes (bicycle vs freight train),
// the slow turn, the berg scraping along the starboard side, a tremor.
import { W, END } from "./timing.js";

export const T = {
  schluessel: W("Schlüssel"),
  ob: W("Ob"),
  dazu: W("Dazu"),
  normal: W("Normalerweise"),
  doch: W("doch", 1),
  ohne: W("Ohne"),
  um: W("Um"),
  glocke: W("Glocke"),
  der2: W("Erste"),
  murdoch: W("Murdoch"),
  ruder: W("Ruder"),
  dann: W("Dann"),
  jetzt: W("jetzt"),
  wiegt: W("wiegt"),
  fahrrad: W("Fahrrad"),
  zug: W("Güterzug", 1),
  zug2: W("Güterzug", 2),
  bug: W("Bug"),
  verfehlt: W("verfehlt"),
  schrammt: W("schrammt"),
  wasserlinie: W("Wasserlinie"),
  meisten: W("meisten"),
  end: END,
};
export const RAD = [0, 300, 0];
export const RAIL = [0, 150, 0];
const rad = (x, y, z) => [RAD[0] + x, RAD[1] + y, RAD[2] + z];
const rl = (x, y, z) => [RAIL[0] + x, RAIL[1] + y, RAIL[2] + z];
// a separate berg for the "white seam" demonstration, far off to port
export const DEMO = [0, 0, -60];
const dm = (x, y, z) => [DEMO[0] + x, DEMO[1] + y, DEMO[2] + z];

export const shots = [
  { at: 0, from: [10.6, 3.15, 0.55], to: [10.4, 3.08, 0.42], look: [9.82, 2.92, 0], zoom: 1 },
  {
    at: T.schluessel,
    from: [8.0, 2.12, 1.62],
    to: [7.86, 2.08, 1.52],
    look: [7.62, 1.97, 1.3],
    zoom: 1,
  },
  { at: T.ob, from: [9.3, 3.25, -0.6], to: [9.45, 3.2, -0.5], look: [24, 0.4, 1], zoom: 1 },
  {
    at: T.dazu,
    from: dm(9, 1.2, 9),
    to: dm(7, 1.0, 7.5),
    look: dm(0, 0.6, 0),
    zoom: 1,
    whoosh: true,
  },
  { at: T.ohne, from: dm(4.5, 0.12, 4.5), to: dm(3.8, 0.12, 3.8), look: dm(0, 1.6, 0), zoom: 1 },
  {
    at: T.um,
    from: [10.25, 3.0, 0.32],
    to: [10.15, 2.98, 0.26],
    look: [9.94, 2.98, 0.04],
    zoom: 1,
    whoosh: true,
  },
  { at: T.der2, from: [8.3, 2.25, 2.3], to: [8.0, 2.2, 2.0], look: [7.42, 1.95, 1.25], zoom: 1 },
  { at: T.dann, from: [4, 46, 10], to: [6, 43, 9], look: [10, 0, 1.5], zoom: 1 },
  { at: T.wiegt, from: [-26, 3, 20], to: [-22, 2.6, 17], look: [0, 1.2, 0], zoom: 1 },
  {
    at: T.fahrrad,
    from: rl(-3, 1.6, 7),
    to: rl(-2, 1.4, 6),
    look: rl(-2.5, 0.3, 0.5),
    zoom: 1,
    whoosh: true,
  },
  { at: T.zug, from: rl(4, 1.3, 6), to: rl(2.5, 1.2, 5.5), look: rl(2, 0.4, -1.2), zoom: 1 },
  { at: T.zug2, from: [5, 44, 10], to: [6, 42, 9], look: [10, 0, 1.5], zoom: 1, whoosh: true },
  { at: T.verfehlt, from: [17, 1.0, 6.5], to: [14, 0.9, 6.0], look: [8, 0.4, 1.5], zoom: 1 },
  { at: T.wasserlinie, from: [5, 0.5, 5.5], to: [2, 0.45, 5.2], look: [4, 0.0, 1.5], zoom: 1 },
  {
    at: T.meisten,
    from: rad(0.5, 0.62, -0.25),
    to: rad(0.46, 0.6, -0.3),
    look: rad(0.3, 0.5, -0.45),
    zoom: 1,
    whoosh: true,
  },
];

export const LABELS = [
  { text: "Krähennest", at: 0.6, until: 3.8, pos: [9.82, 2.95, 0], side: -1 },
  {
    text: "William Murdoch",
    at: T.murdoch - 0.2,
    until: T.dann - 0.3,
    pos: [7.42, 2.0, 1.25],
    side: 1,
  },
];

export const HIGHLIGHTS = [{ kind: "shake", at: T.schrammt + 0.2, dur: 1.6, amp: 0.35 }];

export const SFX = [
  { s: "wind", at: 0, dur: T.dazu, db: -20 },
  { s: "meer", at: T.dazu, dur: T.um - T.dazu, db: -22 },
  { s: "glocke", at: T.glocke - 0.1, db: -8 },
  { s: "meer", at: T.um, dur: T.fahrrad - T.um, db: -22 },
  { s: "maschine", at: T.um, dur: T.ruder + 0.8 - T.um, db: -22 },
  { s: "klack", at: T.ruder + 0.4, db: -12 },
  { s: "pop", at: T.fahrrad + 0.2, db: -18 },
  { s: "brumm", at: T.zug, dur: T.zug2 - T.zug, db: -22 },
  { s: "meer", at: T.zug2, dur: T.end - T.zug2, db: -22 },
  { s: "kratzen", at: T.schrammt, db: -6 },
];
