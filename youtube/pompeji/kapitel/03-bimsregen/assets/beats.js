// Chapter 3 "Steine fallen vom Himmel": darkness at mid-afternoon, pumice
// rain, people leaving through the gate, others staying, the weight of a
// cubic metre, roofs giving way at night, the town under 3 m of pumice in
// the morning, doors buried; a man is on his way to rescue them.
import { W, END } from "./timing.js";

export const T = {
  aus: W("Aus"),
  leicht: W("leicht", 1),
  sie: W("Sie", 1),
  rund: W("rund"),
  viele: W("Viele"),
  andere: W("Andere"),
  alt: W("alt"),
  oder2: W("oder", 2),
  der: W("Steinregen") - 0.25,
  doch: W("Doch"),
  kubik: W("Kubikmeter"),
  nacht: W("Nacht"),
  ganze: W("Ganze"),
  sterben: W("sterben"),
  morgen: W("Morgen") - 0.15,
  tueren: W("Türen"),
  wer: W("Wer"),
  dreissig: W("dreißig"),
  end: END,
};

export const shots = [
  // darkness falls over the town (from the fields in the south)
  { at: 0, from: [13, 4.2, 28], to: [11, 3.9, 24.5], look: [0, 5, -8], zoom: 1 },
  // the stones start to fall: the main street
  {
    at: T.aus - 0.15,
    from: [9.2, 0.24, 2.42],
    to: [8.2, 0.24, 2.42],
    look: [-4, 0.6, 2.3],
    zoom: 1,
  },
  // light as polystyrene, small as a marble: stones on the paving, very low
  {
    at: T.leicht - 0.2,
    from: [6.5, 0.09, 2.62],
    to: [6.25, 0.08, 2.58],
    look: [5.5, 0.03, 2.35],
    zoom: 1,
  },
  // on roofs and streets
  { at: T.sie - 0.2, from: [7.5, 1.6, 6.5], to: [6.8, 1.5, 5.6], look: [4.5, 0.3, 1.5], zoom: 1 },
  // 15 cm an hour: the layer rises along a wall
  {
    at: T.rund - 0.2,
    from: [5.9, 0.12, 2.9],
    to: [5.7, 0.13, 2.8],
    look: [5.0, 0.12, 2.12],
    zoom: 1,
  },
  // many leave: through the south gate, bundles and torches
  {
    at: T.viele - 0.2,
    from: [4.2, 0.55, 17.5],
    to: [3.6, 0.5, 16.6],
    look: [1.9, 0.25, 11.5],
    zoom: 1,
    whoosh: true,
  },
  // others stay: a doorway, a lamp inside
  {
    at: T.andere - 0.2,
    from: [5.75, 0.24, 2.66],
    to: [5.6, 0.23, 2.6],
    look: [5.25, 0.14, 2.22],
    zoom: 1,
  },
  {
    at: T.alt - 0.6,
    from: [4.75, 0.2, 2.6],
    to: [4.85, 0.2, 2.55],
    look: [5.25, 0.14, 2.22],
    zoom: 1,
  },
  // the town in the dark, lightning in the cloud
  { at: T.der - 0.2, from: [-22, 9, 22], to: [-19, 8.5, 18], look: [2, 4, -12], zoom: 1 },
  // the weight: one cubic metre on a roof
  {
    at: T.doch - 0.2,
    from: [6.42, 0.14, 2.46],
    to: [6.36, 0.13, 2.45],
    look: [6.0, 0.07, 2.38],
    zoom: 1,
  },
  // the night: roofs heavy with pumice
  { at: T.nacht - 0.3, from: [9.5, 1.8, 6.5], to: [8.8, 1.7, 5.6], look: [5.5, 0.4, 1.0], zoom: 1 },
  {
    at: T.ganze - 0.2,
    from: [9.0, 1.2, 4.2],
    to: [8.7, 1.15, 3.8],
    look: [5.5, 0.4, 1.2],
    zoom: 1,
  },
  // quiet: the empty town
  { at: T.sterben - 0.3, from: [-6, 2.2, 14], to: [-5.4, 2.0, 12.4], look: [2, 0.6, 0], zoom: 1 },
  // morning: almost 3 m of pumice
  {
    at: T.morgen,
    from: [14, 6, 18],
    to: [12, 5.6, 15.5],
    look: [3, 0.2, 1],
    zoom: 1,
    whoosh: true,
  },
  // the doors are buried
  {
    at: T.tueren - 0.2,
    from: [6.6, 0.4, 2.6],
    to: [6.3, 0.38, 2.55],
    look: [5.0, 0.32, 2.12],
    zoom: 1,
  },
  // out over the roofs
  { at: T.wer - 0.2, from: [8.6, 1.0, 4.6], to: [8.2, 0.95, 4.1], look: [6.2, 0.7, 1.2], zoom: 1 },
  // thirty kilometres away: ships on the bay
  {
    at: T.dreissig - 0.2,
    from: [-52, 3.2, 40],
    to: [-48, 3.0, 36],
    look: [-40, 1, 24],
    zoom: 1,
    whoosh: true,
  },
];

export const LABELS = [
  { text: "Bimsstein", at: T.leicht + 0.2, until: T.sie - 0.4, pos: [5.6, 0.02, 2.35], side: 1 },
  {
    text: "Ein Kubikmeter",
    at: T.kubik - 0.1,
    until: T.nacht - 0.6,
    pos: [6.0, 0.16, 2.38],
    side: -1,
  },
];

export const SFX = [
  { s: "wind", at: 0, dur: T.aus, db: -18 },
  { s: "saeule", at: 0, dur: T.morgen, db: -24 },
  { s: "steinregen", at: T.aus, dur: T.viele - T.aus, db: -14 },
  { s: "steinregen", at: T.viele, dur: T.morgen - T.viele, db: -18 },
  { s: "grollen", at: T.der, db: -12 },
  { s: "einsturz", at: T.ganze - 0.1, db: -6 },
  { s: "einsturz", at: T.ganze + 1.1, db: -10 },
  { s: "wind", at: T.morgen, dur: T.dreissig - T.morgen, db: -20 },
  { s: "ruder", at: T.dreissig - 0.2, dur: T.end - T.dreissig, db: -16 },
  { s: "meer", at: T.dreissig - 0.2, dur: T.end - T.dreissig, db: -18 },
];

export const HIGHLIGHTS = [{ kind: "shake", at: T.ganze, dur: 1.2, amp: 0.5 }];
