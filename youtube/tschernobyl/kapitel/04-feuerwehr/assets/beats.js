// Chapter 4 "Die Nacht der Feuerwehr": disbelief in the control room, the
// burning roofs, the firefighters, the dosimeter at its limit, the shaft.
import { W, END } from "./timing.js";

export const T = {
  djatlow: W("Djatlow"),
  draussen: W("Draußen"),
  gluehende: W("glühende"),
  minuten: W("Minuten"),
  angef: W("angeführt"),
  in: W("Uniformen") - 0.9,
  niemand: W("Niemand", 2),
  denn: W("Gefährlichste") - 0.4,
  aus: W("strömt") - 1.4,
  messg: W("Messgeräte"),
  sie: W("Anschlag") - 0.7,
  gegen: W("Gegen"),
  schacht: W("Schacht"),
  end: END,
};
const c = (x, y, z) => [x, 300 + y, z];
export const TRUCK_T = T.minuten - 0.4;

export const shots = [
  // dust from the ceiling, alarm
  { at: 0, from: c(-3.0, 1.8, 4.6), to: c(-2.2, 1.75, 3.8), look: c(0, 1.6, -3), zoom: 1 },
  {
    at: T.djatlow - 0.2,
    from: c(-2.6, 1.7, 2.8),
    to: c(-2.3, 1.68, 2.4),
    look: c(-1.2, 1.6, 0.6),
    zoom: 1,
  },
  // outside: the turbine hall roof burning
  {
    at: T.draussen - 0.2,
    from: [14, 4.5, -18],
    to: [10, 4.6, -16],
    look: [0, 3.5, -8],
    zoom: 1,
    whoosh: true,
  },
  // glowing graphite on the yard
  { at: T.gluehende - 0.1, from: [9, 0.6, 15], to: [7, 0.55, 13.5], look: [3, 0.1, 9], zoom: 1 },
  // the fire engines racing in
  {
    at: TRUCK_T,
    from: [15.5, 0.28, 0.8],
    to: [15.2, 0.28, 0.6],
    look: [26, 0.2, -1.6],
    zoom: 1,
    whoosh: true,
  },
  // Pravik
  {
    at: T.angef - 0.2,
    from: [12.0, 0.22, 1.8],
    to: [11.85, 0.21, 1.65],
    look: [11.4, 0.13, 1.2],
    zoom: 1,
  },
  // up on the roofs, in their normal uniforms
  {
    at: T.in - 0.2,
    from: [1.5, 3.45, -6.4],
    to: [1.35, 3.44, -6.5],
    look: [0.5, 3.32, -7.3],
    zoom: 1,
  },
  {
    at: T.niemand - 0.2,
    from: [-1.7, 3.45, -6.7],
    to: [-1.55, 3.44, -6.8],
    look: [-0.7, 3.32, -8.0],
    zoom: 1,
  },
  // the invisible danger: the open shaft, the blue glow
  { at: T.denn - 0.2, orbit: { c: [3, 5, -0.8], r: 18, y: 14, a0: 0.4, a1: -0.1 } },
  { at: T.aus - 0.2, from: [6, 10, 3], to: [5, 9.4, 2], look: [3, 4.4, -0.8], zoom: 1 },
  // the dosimeter at its stop
  {
    at: T.messg - 0.3,
    from: [11.65, 0.42, 2.05],
    to: [11.62, 0.41, 1.95],
    look: [11.4, 0.36, 1.6],
    zoom: 1,
  },
  // calm report to Moscow: the plant from afar, smoke rising
  { at: T.sie - 0.2, from: [-50, 2.5, 60], to: [-44, 2.6, 54], look: [0, 6, -2], zoom: 1 },
  // five in the morning: roofs out, the shaft still glowing
  { at: T.gegen - 0.2, from: [-8, 6, -20], to: [-6, 6.5, -18], look: [2, 3.5, -6], zoom: 1 },
  { at: T.schacht - 0.6, from: [3.5, 14, 2], to: [3.2, 12, 1], look: [3, 4.3, -0.8], zoom: 1 },
];

export const LABELS = [
  { text: "Graphit", at: T.gluehende + 0.8, until: TRUCK_T - 0.4, pos: [3.4, 0.25, 9.6], side: 1 },
  {
    text: "Leutnant Wladimir Prawik",
    at: T.angef + 0.6,
    until: T.in - 0.4,
    pos: [11.4, 0.2, 1.2],
    side: -1,
  },
  { text: "Strahlung", at: T.aus + 0.6, until: T.messg - 0.6, pos: [3, 6.5, -0.8], side: 1 },
];

export const HIGHLIGHTS = [{ kind: "shake", at: 0.2, dur: 1.2, amp: 0.15 }];

export const SFX = [
  { s: "alarm", at: 0, dur: T.draussen, db: -18 },
  { s: "feuer", at: T.draussen - 0.2, dur: T.denn - T.draussen, db: -12 },
  { s: "sirene", at: TRUCK_T - 1, db: -14 },
  { s: "sirene", at: TRUCK_T + 4.5, db: -18 },
  { s: "wind", at: T.denn - 0.2, dur: T.end - T.denn, db: -20 },
  { s: "geiger", at: T.aus, dur: T.sie - T.aus, db: -12 },
  { s: "feuer", at: T.sie, dur: T.end - T.sie, db: -20 },
];
