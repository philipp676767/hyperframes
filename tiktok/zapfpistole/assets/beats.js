// Zapfpistole beats: every time-keyed decision as plain data, so scene.js
// (picture) and scripts/build-sfx.mjs (sound) read the same numbers.
// Keep this file free of three.js / DOM: it is imported by node too.
import { W, END } from "./timing.js";

// ---------------------------------------------------------------- layout
// A red car stands left of the origin, long axis along z, its fuel flap on
// the +x side at FLAP. The nozzle sticks in the flap, its spout pointing -x
// into the filler neck; the pump column stands behind it on the right.
export const FLAP = [-0.6, 1.0, 0.85];
export const HOVER = [0.55, 1.75, 1.45]; // where the nozzle floats in beat 1
export const PUMP = [2.3, 0, -1.9];
export const DIESEL = [5.2, 0, 2]; // the diesel-vs-petrol set

// ---------------------------------------------------------------- beats
export const T = {
  loch0: W("Loch", 1),
  tankstelle: W("Tankstelle"),
  ueberlaufen: W("überlaufen"),
  gleich: W("Gleich"),
  warum: W("warum"),
  ganz: W("Ganz"),
  ruessel: W("Rüssel"),
  winziges: W("winziges"),
  loch1: W("Loch", 2),
  du: W("Du", 2),
  tausendmal: W("tausendmal"),
  und1: W("Und", 1),
  atmet: W("atmet"),
  fliesst: W("Fließt"),
  benzin: W("Benzin"),
  saugt: W("saugt"),
  durch: W("durch"),
  roehrchen: W("Röhrchen"),
  solange: W("Solange"),
  offen: W("offen"),
  doch: W("Doch"),
  steigt: W("steigt"),
  sprit: W("Sprit"),
  verschliesst: W("verschließt"),
  griff: W("Griff"),
  unterdruck: W("Unterdruck"),
  zieht: W("zieht"),
  gummihaut: W("Gummihaut"),
  membran: W("Membran"),
  klack: W("Klack", 1),
  hebel: W("Hebel"),
  ventil: W("Ventil"),
  knallt: W("knallt"),
  sie: W("Sie"),
  nichts: W("nichts"),
  luft3: W("Luft", 3),
  uebrigens: W("Übrigens"),
  diesel: W("Diesel-Rüssel"),
  dicker: W("dicker"),
  viele: W("viele"),
  passt: W("passt"),
  nicht: W("nicht"),
  hoerst: W("Hörst"),
  klack2: W("Klack", 2),
  oder: W("oder"),
  drueckst: W("drückst"),
  kommentare: W("Kommentare"),
};

// mechanical states
export const HOOK_STOP = T.warum + 0.1; // the hook's auto-stop
export const SPILL_END = T.gleich; // the "what if" overflow runs until here
export const LIFT = T.ganz; // nozzle leaves the tank …
export const PLUNGE = T.fliesst + 0.05; // … and goes back in
export const FLOW_ON = T.benzin; // fuel runs again
export const COVER = T.verschliesst + 0.25; // fuel closes the hole
export const STOP = T.klack + 0.02; // the explained auto-stop
// flow intervals (pump running): hook (from before frame 0), the explained
// run, the CTA "bis zum Klack" + two "nachdrücken" squirts
export const FLOWS = [
  [-30, HOOK_STOP],
  [FLOW_ON, STOP],
  [T.hoerst + 0.1, T.klack2 + 0.02],
  [T.drueckst + 0.05, T.drueckst + 0.35],
  [T.drueckst + 0.6, T.drueckst + 0.85],
];

// ---------------------------------------------------------------- shots
// angle + distance around a look point: yaw 0 = front (+z), positive yaw
// swings towards +x, pitch = degrees above the look point, d = distance.
const D2R = Math.PI / 180;
const cam = (look, [yaw, pitch, d]) => [
  look[0] + d * Math.cos(pitch * D2R) * Math.sin(yaw * D2R),
  look[1] + d * Math.sin(pitch * D2R),
  look[2] + d * Math.cos(pitch * D2R) * Math.cos(yaw * D2R),
];
const shot = (at, look, a, b, extra = {}) => ({
  at,
  from: cam(look, a),
  to: cam(extra.lookTo ?? look, b),
  look,
  zoom: 1,
  ...extra,
});
const add = (p, d) => p.map((v, i) => v + d[i]);

// world points of the nozzle (see scene.js: nozzle frame at FLAP, spout -x)
const HEAD = add(FLAP, [0.35, 0.12, 0]); // valve head
const TIP = add(FLAP, [-0.62, -0.2, 0]); // spout tip inside the neck
const LEVER = add(FLAP, [0.7, -0.12, 0]);
const NOZ = add(FLAP, [0.35, 0.0, 0]);

export const shots = [
  // hook: fast push-in, fuel gushes out of the flap — the "what if"
  shot(0, add(FLAP, [0.35, -0.3, 0]), [40, 18, 5.2], [24, 12, 3.6]),
  // "Loch": low close on the flap, fuel spilling out
  shot(T.loch0, add(FLAP, [0.35, -0.4, 0.1]), [38, 6, 2.6], [46, 8, 2.2]),
  // "Tankstelle": wide, car + pump + the growing puddle
  shot(T.tankstelle, [0.2, 0.7, 0.6], [36, 16, 7.4], [28, 14, 6.8]),
  // "überlaufen": low on the puddle, fuel splashing
  shot(T.ueberlaufen, add(FLAP, [0.45, -0.5, 0.15]), [30, 8, 3.2], [22, 12, 2.8]),
  // "Gleich weißt du, warum": clean again, close on the lever → KLACK
  shot(T.gleich, add(LEVER, [-0.1, 0.05, 0]), [22, 6, 2.4], [32, 10, 2.1], { whip: -1 }),
  // "Ganz vorne am Rüssel": the nozzle lifts out and floats, front view
  shot(T.ganz, add(HOVER, [0.25, 0, 0]), [8, 6, 4.6], [18, 8, 4.1], { whip: -1 }),
  // "winziges Loch": macro on the spout tip
  shot(T.winziges, add(HOVER, [-0.72, -0.24, 0]), [40, -8, 1.6], [25, -4, 1.25]),
  // "tausendmal übersehen": medium, the nozzle turns slowly
  shot(T.du, add(HOVER, [0.2, 0, 0]), [-20, 10, 4.2], [-5, 12, 3.8], { whip: 1 }),
  // "Und es atmet": macro under the hole, air sucked in (slow motion)
  shot(T.und1, add(HOVER, [-0.7, -0.26, 0]), [20, -18, 1.5], [12, -12, 1.15]),
  // "Fließt Benzin": it plunges back into the car
  shot(T.fliesst, [0, 1.0, 0], [48, 12, 5.8], [40, 10, 5.0], { whip: -1 }),
  // "saugt es Luft mit": x-ray side view, air streams into the hole
  shot(T.saugt, add(FLAP, [-0.25, -0.05, 0]), [14, 8, 2.7], [4, 8, 2.4]),
  // "Röhrchen": along the nozzle, the tube glows
  shot(T.roehrchen, add(FLAP, [-0.05, 0.0, 0]), [16, 18, 2.6], [26, 14, 2.3], { whip: 1 }),
  // "Solange Luft nachkommt": x-ray orbit around car + nozzle
  {
    at: T.solange,
    orbit: { c: add(FLAP, [-0.4, -0.2, 0]), r: 4.0, y: 1.9, a0: -0.15, a1: 0.5 },
    zoom: 1,
  },
  // whispered "Doch jetzt steigt der Sprit": quiet slow push onto the neck
  shot(T.doch, add(TIP, [-0.2, -0.1, 0]), [-2, 8, 3.4], [2, 8, 2.6], { tilt: 0.2 }),
  // "verschließt das Loch": macro on the tip as the fuel covers it (slowmo)
  shot(T.verschliesst - 0.15, add(TIP, [0.05, 0, 0]), [16, 4, 1.5], [8, 4, 1.2]),
  // "Im Griff": the head chamber
  shot(T.griff, HEAD, [30, 18, 2.4], [18, 14, 2.0], { whip: 1 }),
  // "Unterdruck": closer, pulsing
  shot(T.unterdruck, add(HEAD, [0, 0.05, 0]), [-10, 24, 1.9], [-2, 22, 1.6]),
  // "zieht an einer Gummihaut, der Membran": macro on the membrane
  shot(T.zieht, add(HEAD, [0, 0.12, 0]), [24, 40, 1.4], [14, 36, 1.15]),
  // KLACK: medium front, flash + shake
  shot(T.klack - 0.06, NOZ, [30, 10, 3.6], [24, 8, 3.2]),
  // "Der Hebel springt": low close on the lever
  shot(T.hebel, LEVER, [-30, -10, 1.9], [-40, -6, 1.7], { whip: -1 }),
  // "das Ventil knallt zu": the head
  shot(T.ventil, HEAD, [60, 14, 2.0], [50, 12, 1.8]),
  // payoff "Sie weiß also nichts": front medium, brain ✕ again
  shot(T.sie, add(NOZ, [0, 0.3, 0]), [20, 8, 3.9], [10, 8, 3.4], { whip: 1 }),
  // bonus fact: the diesel set
  shot(T.uebrigens, add(DIESEL, [0, 1.3, 0]), [-8, 8, 3.9], [6, 8, 3.5], { whip: 1 }),
  // "dicker": macro on both spouts
  shot(T.dicker, add(DIESEL, [0.15, 1.05, 0]), [10, 4, 2.9], [2, 4, 2.5]),
  // "in viele Benziner passt er nicht": side, the thick one bounces off
  shot(T.viele, add(DIESEL, [0, 1.05, 0]), [-24, 14, 3.0], [-14, 12, 2.7], { whip: -1 }),
  // CTA: back at the car, Klack — or keep pressing?
  shot(T.hoerst, NOZ, [45, 12, 3.8], [35, 10, 3.4], { whip: 1 }),
  // drone pull-back over the station
  {
    at: T.kommentare,
    from: [4.0, 3.6, 7.6],
    to: [8.0, 7.0, 14.0],
    look: [0, 1.0, -0.5],
    zoom: 1,
    tilt: 1.3,
  },
];

// ---------------------------------------------------------------- labels
const HV = (d) => add(HOVER, d);
export const LABELS = [
  { text: "Rüssel", at: T.ruessel, until: T.winziges, pos: HV([-0.45, -0.1, 0]), side: -1 },
  { text: "Loch", at: T.loch1, until: T.und1, pos: HV([-0.66, -0.26, 0.05]), side: -1 },
  {
    text: "Röhrchen",
    at: T.roehrchen,
    until: T.solange + 1.2,
    pos: add(FLAP, [-0.15, 0.03, 0]),
    side: -1,
  },
  { text: "Unterdruck", at: T.unterdruck, until: T.zieht, pos: add(HEAD, [0, 0.12, 0]), side: -1 },
  { text: "Membran", at: T.membran, until: T.klack, pos: add(HEAD, [0, 0.21, 0]), side: 1 },
  { text: "Hebel", at: T.hebel, until: T.ventil, pos: add(LEVER, [0, -0.04, 0.05]), side: 1 },
  { text: "Ventil", at: T.ventil, until: T.sie, pos: add(HEAD, [-0.12, 0.0, 0.05]), side: -1 },
  { text: "Benzin", at: T.diesel, until: T.viele, pos: add(DIESEL, [-0.31, 1.0, 0]), side: -1 },
  { text: "Diesel", at: T.diesel + 0.3, until: T.viele, pos: add(DIESEL, [0.6, 1.0, 0]), side: 1 },
];

// ---------------------------------------------------------------- highlights
// one big moment every 5–7 s; a slowmo ends on a shot cut
export const HIGHLIGHTS = [
  { kind: "shake", at: 0, dur: 0.45, amp: 0.6 }, // fuel gushing out
  { kind: "zoom", at: 0.05, amount: 0.3 },
  { kind: "flash", at: T.ueberlaufen }, // the overflow + ✕
  { kind: "shake", at: T.ueberlaufen, dur: 0.5, amp: 0.9 },
  { kind: "shake", at: HOOK_STOP, dur: 0.5, amp: 0.9 }, // the hook's KLACK
  { kind: "zoom", at: T.loch1, amount: 0.3 },
  { kind: "slowmo", at: T.atmet, until: T.fliesst, speed: 0.4 }, // the hole breathes
  { kind: "shake", at: PLUNGE + 0.25, dur: 0.4, amp: 0.7 }, // back in the tank
  { kind: "zoom", at: T.roehrchen, amount: 0.25 },
  { kind: "slowmo", at: T.verschliesst, until: T.griff, speed: 0.35 }, // fuel covers the hole
  { kind: "shake", at: T.unterdruck, dur: 1.0, amp: 0.3 }, // suction trembles
  { kind: "flash", at: STOP }, // KLACK
  { kind: "shake", at: STOP, dur: 0.6, amp: 1.1 },
  { kind: "shake", at: T.knallt, dur: 0.35, amp: 0.6 },
  { kind: "zoom", at: T.nichts, amount: 0.3 },
  { kind: "shake", at: T.passt + 0.25, dur: 0.4, amp: 0.7 }, // diesel bounces off
  { kind: "shake", at: T.klack2 + 0.02, dur: 0.35, amp: 0.5 },
];

// ---------------------------------------------------------------- sound
// own sound: gluckern (scripts/sfx-extra.py) while fuel runs
const flowSfx = FLOWS.filter(([a, b]) => b - a > 0.2).map(([a, b]) => ({
  s: "gluckern",
  at: Math.max(0, a),
  dur: b - Math.max(0, a),
  db: -15,
}));
export const SFX = [
  ...flowSfx,
  { s: "klack", at: HOOK_STOP, db: -8 },
  { s: "rauschen", at: 0, dur: SPILL_END, db: -22 }, // fuel gushing out
  { s: "boing", at: T.ueberlaufen + 0.3 }, // ✕
  { s: "zisch", at: LIFT + 0.05, dur: 0.5, db: -24 }, // nozzle pulled out
  { s: "zisch", at: T.atmet, dur: T.fliesst - T.atmet, db: -22 }, // air sucked in
  { s: "klack", at: PLUNGE + 0.25, db: -14 }, // back in the neck
  { s: "zisch", at: T.saugt, dur: T.verschliesst - T.saugt, db: -30 }, // air in the tube
  { s: "surr", at: T.unterdruck, dur: T.klack - T.unterdruck, db: -24 }, // suction builds
  { s: "klack", at: STOP, db: -6 },
  { s: "klack", at: T.knallt + 0.05, db: -12 }, // valve slams
  { s: "pop", at: T.nichts + 0.05 }, // brain again
  { s: "boing", at: T.nichts + 0.35 },
  { s: "pop", at: T.uebrigens + 0.1 }, // the diesel set
  { s: "klack", at: T.passt + 0.25, db: -12 }, // bounces off the neck
  { s: "boing", at: T.passt + 0.3 },
  { s: "klack", at: T.klack2 + 0.02, db: -9 },
  { s: "rauschen", at: T.kommentare, dur: END - T.kommentare - 0.3, db: -30 }, // wind up high
];
