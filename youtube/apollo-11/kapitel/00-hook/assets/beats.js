// Hook (0:00–0:27): the Eagle sinks toward the boulder field, the 1202 alarm
// screams, the fuel runs out — then the DSKY, the viewer's phone, the felt-tip pen.
import { W } from "./timing.js";

export const T = {
  kurz: W("kurz"),
  alarm: W("Alarm"),
  code: W("Code"),
  den: W("Den"),
  treib: W("Treibstoff"),
  computer: W("Computer"),
  speicher: W("Speicher"),
  foto: W("Foto"),
  handy: W("Handy", 1),
  trotzdem: W("Trotzdem"),
  handy2: W("Handy", 2),
  wir: W("Wir"),
  landung: W("Landung"),
  filz: W("Filzstift"),
  warum: W("Warum"),
};

// world points (set by the moon world): the Eagle's flight, the DSKY far above
export const DSKY = [0, 400, 0];
export const shots = [
  // frame 0: low and close under the Eagle, fast push-in, flame + alarm glow
  { at: 0, from: [21, 31, 3], to: [15, 29, -6], look: [6, 26.5, -18], zoom: 1 },
  // 1.3 s: from below-front, the Earth behind the cabin
  { at: T.kurz, from: [17, 21, -1], to: [14.5, 22.5, -5], look: [6.2, 26.5, -18.4], zoom: 1 },
  // the DSKY: 1202 blinking
  {
    at: T.code,
    from: [0.25, 400.1, 1.15],
    to: [0.05, 400.05, 0.8],
    look: [0.05, 400.08, 0],
    zoom: 1,
    sfx: false,
  },
  // wide: the Eagle over the boulder field
  { at: T.den, from: [-6, 25, 8], to: [-3, 25, 4], look: [10, 22, -24], zoom: 1, whip: 1 },
  // the flame + dust, fuel running out
  { at: T.treib, orbit: { c: [7.1, 22.5, -19], r: 18, y: 25, a0: 0.5, a1: 1.2 }, zoom: 1 },
  // the computer: slow move across the keys
  {
    at: T.computer,
    from: [-0.5, 400.15, 1.2],
    to: [-0.3, 400.05, 1.0],
    look: [0, 400, 0],
    zoom: 1,
  },
  // the phone next to the DSKY
  {
    at: T.foto,
    from: [0.75, 400.0, 0.9],
    to: [0.6, 399.98, 0.75],
    look: [0.48, 399.97, 0.15],
    zoom: 1,
  },
  // up to the Earth: the road from launch to splashdown
  {
    at: T.wir,
    from: [2, 6, 12],
    to: [2, 9, 12],
    look: [-70, 95, -230],
    lookTo: [-70, 95, -230],
    zoom: 1,
    focus: 250,
  },
  // the pen spins in front of the Eagle
  {
    at: T.filz,
    from: [0.25, 400.0, 0.5],
    to: [0.18, 400.0, 0.38],
    look: [0, 400, 0.12],
    zoom: 1,
    whip: -1,
  },
  // the question: the Eagle sinks into its own dust
  { at: T.warum, from: [24, 4, 4], to: [20, 5, -2], look: [11, 9, -25], zoom: 1 },
];

export const LABELS = [];

export const HIGHLIGHTS = [
  { kind: "flash", at: 0.05 },
  { kind: "shake", at: 0.05, dur: 1.0, amp: 0.9 },
  { kind: "zoom", at: T.alarm, amount: 0.3 },
  { kind: "zoom", at: T.code + 0.3, amount: 0.25 },
  { kind: "shake", at: T.treib, dur: 0.8, amp: 0.5 },
  { kind: "zoom", at: T.handy, amount: 0.3 },
  { kind: "zoom", at: T.filz, amount: 0.3 },
  { kind: "shake", at: T.warum, dur: 1.2, amp: 0.6 },
];

export const SFX = [
  { s: "alarm1202", at: 0.02, db: -10 },
  { s: "triebwerk", at: 0, dur: T.code, db: -18 },
  { s: "alarm1202", at: T.code + 0.1, db: -14 },
  { s: "triebwerk", at: T.den, dur: T.computer - T.den, db: -17 },
  { s: "alarm1202", at: T.treib + 0.2, db: -16 },
  { s: "quindar", at: T.wir - 0.25, db: -14 },
  { s: "triebwerk", at: T.warum, dur: 3, db: -15 },
];
