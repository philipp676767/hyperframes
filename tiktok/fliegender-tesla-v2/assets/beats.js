// Fliegender Tesla (v2) beats: every time-keyed decision as plain data, so
// scene.js (picture) and scripts/build-sfx.mjs (sound) read the same numbers.
// Keep this file free of three.js / DOM: it is imported by node too.
import { W, END } from "./timing.js";

// ---------------------------------------------------------------- layout
export const DIVE = [-5.0, 0, 2.0]; // scuba tank (Taucherflasche)
export const BAL = [5.0, 0, 2.0]; // balloon
export const VAC = [6.2, 0, 2.6]; // vacuum cleaner on a rug (beside the tunnel)
export const ROCK = [-3.3, 0, 2.6]; // toy rocket, crossed out
export const HOVER = 1.6; // hover height in the hook and the CTA
export const TR = 2.1; // tunnel radius

// ---------------------------------------------------------------- beats
export const T = {
  luft1: W("Luft", 1),
  in: W("in", 1),
  brauchst: W("brauchst"),
  kohle: W("Kohlefaser-Flaschen"),
  druckluft: W("Druckluft"),
  wie2: W("wie", 2),
  taucher: W("Taucherflaschen"),
  das1: W("Das", 1),
  drucktank: W("Drucktank"),
  aber: W("Aber"),
  auto: W("Auto"),
  jetzt: W("Jetzt"),
  trick: W("Trick"),
  ventil: W("Ventil"),
  luft3: W("Luft", 3),
  wie4: W("wie", 4),
  luftballon: W("Luftballon"),
  das2: W("Das", 2),
  duese: W("Kaltgas-Düse"),
  und1: W("Und", 1),
  ab: W("ab"),
  und2: W("Und", 2),
  kopf: W("kopfüber"),
  unter: W("Unter"),
  luefter: W("Lüfter"),
  wie5: W("wie", 5),
  staubsauger: W("Staubsauger"),
  teppich: W("Teppich"),
  theo: W("Theoretisch"),
  klebt: W("klebt"),
  decke: W("Tunneldecke"),
  nur: W("Nur"),
  rakete2: W("Rakete", 2),
  schau: W("Schau"),
  gerade: W("gerade"),
  gebaut: W("gebaut"),
  uebrigens: W("Übrigens"),
  laut: W("Laut"),
  einer: W("einer"),
  hundert: W("hundert"),
  wuerdest: W("Würdest"),
};

// car moments
export const LAND = T.brauchst; // lands after the hook (0.35 s drop)
export const FIRE = T.luft3; // jets fire for the first time
export const LIFT = T.ab - 0.4; // shoots up
export const TUN = T.und2; // tunnel scene starts (car on its floor)
export const UP = T.theo + 0.2; // drives up the wall …
export const TOP = T.decke - 0.05; // … reaches the ceiling
export const DASH = T.laut; // rear thrusters fire, sprint along +x
export const RISE = T.wuerdest; // rises back into the hover for the loop

// car x inside the tunnel / during the dash (pure in t, shared with the camera)
export const tunnelX = (t) => -2.3 + 0.6 * Math.max(0, Math.min(t, T.nur) - TUN);
export const dashX = (t) => {
  const u = Math.max(0, t - DASH);
  if (u < 1.2) return -4 + 3 * u * u; // hard launch …
  const s = Math.min(u - 1.2, 3); // … then it rolls out before the houses
  return -4 + 4.32 + 7.2 * s - 1.2 * s * s;
};

const rel = (p, d) => p.map((v, i) => v + d[i]);

// ---------------------------------------------------------------- shots
// Angle + distance around a look point: yaw 0 = front of the stage (+z),
// yaw 90 = the car's nose (+x), pitch = degrees above, d = distance.
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

const HV = [0, HOVER + 0.45, 0]; // hovering car body

export const shots = [
  // hook: from below, the red car hovering on four white jets
  shot(0, HV, [36, -4, 7.6], [24, -1, 7.0]),
  // the promise: wide, blue-hour street, lamps, houses
  shot(T.in, [0, HOVER, 0], [58, 9, 11.5], [46, 11, 10.5]),
  // build: it drops onto the plaza, turns to glass, tanks pop in
  shot(T.brauchst, [0, 0.6, 0], [42, 22, 7.4], [30, 24, 6.8]),
  shot(T.druckluft, [0, 0.45, 0], [-24, 40, 6.2], [-14, 36, 5.6]),
  // "wie Taucherflaschen": the scuba tank
  shot(T.wie2, rel(DIVE, [0, 0.85, 0]), [18, 12, 3.4], [6, 12, 3.0], { whip: -1 }),
  // the tanks glow: Drucktank
  shot(T.das1, [0.2, 0.45, 0], [24, 34, 5.4], [34, 30, 4.9]),
  // quiet beat before the trick: low, nose-on, solid
  shot(T.aber, [0, 0.6, 0], [70, 5, 4.8], [60, 7, 4.4]),
  // the trick: crash zoom under the car, ground level
  shot(T.jetzt, [0.3, 0.25, 0.3], [62, 2, 3.8], [54, 3, 3.2]),
  // valve pops, pipes grow (x-ray from above)
  shot(T.ventil, [0, 0.45, 0], [22, 46, 4.6], [12, 50, 4.1]),
  // jets fire – slow motion
  shot(T.luft3, [0, 0.7, 0], [24, 12, 5.0], [16, 14, 4.6]),
  // like a balloon you let go
  shot(T.wie4, rel(BAL, [0, 1.3, 0]), [-14, 6, 4.2], [-6, 2, 4.4], {
    lookTo: rel(BAL, [0, 2.7, 0]),
    whip: 1,
  }),
  // macro on a nozzle: Kaltgas-Düse
  shot(T.das2, [0, 0.85, 0.45], [24, -5, 2.6], [14, -3, 2.3]),
  // money shot 1: it lifts off past the street lamps
  shot(T.und1, [0, 1.2, 0], [70, -10, 7.4], [76, -4, 7.8], { lookTo: [0, 4.2, 0], whip: -1 }),
  // the tunnel: wide through the cut-away front
  { ...shot(T.und2, [0.4, 1.4, 0], [16, 6, 7.4], [26, 6, 6.6], { tilt: 0.5 }), follow: true },
  // fans under the floor (x-ray), riding along
  { ...shot(T.unter, [0, 0.4, 0], [18, 10, 3.9], [8, 12, 3.4]), follow: true },
  // like your vacuum cleaner on the rug
  shot(T.wie5, rel(VAC, [0, 0.6, 0]), [24, 18, 3.6], [12, 18, 3.2], { whip: 1 }),
  // money shot 2: up the wall onto the ceiling
  { ...shot(T.theo, [0, TR, 0], [6, 4, 6.4], [0, 8, 5.8], { whip: -1, tilt: 0.5 }), follow: true },
  // from below: it hangs on the ceiling
  {
    ...shot(T.decke, [0, 2.5, 0], [88, 4, 9.0], [82, 2, 8.2], { tilt: 0.4 }),
    follow: true,
  },
  // no rocket: car hovering, toy rocket crossed out
  shot(T.nur, [-1.2, 1.3, 1.2], [16, 8, 12.5], [8, 10, 11.5]),
  // outro: nose-on, then the drone pull-back over the street
  shot(T.schau, [0, 1.5, 0], [76, 6, 6.0], [66, 8, 5.4]),
  {
    at: T.gerade,
    from: cam([0, 1.6, 0], [58, 14, 6.4]),
    to: [9.0, 7.5, 15.0],
    look: [0, 1.6, 0],
    lookTo: [0, 1.6, 0],
    zoom: 1,
  },
  // bonus fact: the sprint, camera riding along
  { ...shot(T.uebrigens, [0.6, 0.6, 0], [26, 9, 6.2], [14, 8, 5.6], { whip: 1 }), dash: true },
  { ...shot(T.einer, [0.8, 0.6, 0], [12, 6, 9.0], [4, 6, 9.6]), dash: true, dashK: 1 },
  // CTA: wide drone, it rises back into the hover
  {
    at: T.wuerdest,
    from: [5.0, 3.2, 9.5],
    to: [8.5, 5.5, 14.5],
    look: [0, 1.4, 0],
    lookTo: [0, 1.8, 0],
    zoom: 1,
  },
];

// ---------------------------------------------------------------- labels
// (Lüfter rides along with the car in the tunnel and lives in scene.js)
export const LABELS = [
  { text: "Drucktank", at: T.drucktank, until: T.aber + 0.6, pos: [0.85, 0.62, 0.36], side: 1 },
  { text: "Ventil", at: T.ventil + 0.1, until: T.luft3, pos: [0, 0.55, 0], side: -1 },
  { text: "Kaltgas-Düse", at: T.duese, until: T.und1, pos: [0, 0.92, 0.45], side: 1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "shake", at: 0.05, dur: 0.6, amp: 0.6 }, // jets roaring from frame 1
  { kind: "flash", at: T.luft1 },
  { kind: "zoom", at: T.luft1, amount: 0.3 },
  { kind: "shake", at: LAND + 0.35, dur: 0.45, amp: 0.9 }, // it lands
  { kind: "shake", at: T.drucktank, dur: 0.5, amp: 0.5 }, // pressure
  { kind: "zoom", at: T.trick, amount: 0.35 },
  { kind: "flash", at: FIRE },
  { kind: "slowmo", at: FIRE + 0.05, until: T.wie4, speed: 0.35 }, // jets in slow motion
  { kind: "shake", at: LIFT + 0.1, dur: 0.8, amp: 1.2 }, // lift-off
  { kind: "flash", at: T.ab },
  { kind: "zoom", at: T.staubsauger, amount: 0.25 },
  { kind: "shake", at: TOP + 0.1, dur: 0.6, amp: 0.9 }, // wheels hit the ceiling
  { kind: "zoom", at: TOP + 0.1, amount: 0.3 },
  { kind: "flash", at: DASH + 0.05 }, // rear thrusters
  { kind: "shake", at: DASH + 0.05, dur: 0.7, amp: 1.0 },
  { kind: "zoom", at: T.einer, amount: 0.35 },
  { kind: "shake", at: RISE + 0.1, dur: 0.5, amp: 0.5 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "zisch", at: 0.02, dur: LAND - 0.1, db: -21 }, // hovering jets in the hook
  { s: "klack", at: LAND + 0.35, db: -12 }, // lands
  { s: "pop", at: T.kohle + 0.1 },
  { s: "pop", at: T.kohle + 0.45, db: -13 },
  { s: "pop", at: T.wie2 + 0.1 }, // scuba tank
  { s: "zisch", at: T.drucktank, dur: 0.6, db: -20 }, // pressure hiss
  { s: "klack", at: T.ventil + 0.15, db: -10 }, // valve
  { s: "pop", at: T.ventil + 0.1, db: -13 },
  { s: "zisch", at: FIRE, dur: T.wie4 - FIRE - 0.05, db: -14 }, // jets
  { s: "pop", at: T.wie4 + 0.1 }, // balloon
  { s: "zisch", at: T.luftballon + 0.1, dur: 0.7, db: -18 },
  { s: "zisch", at: T.das2, dur: T.und1 - T.das2, db: -20 },
  { s: "rauschen", at: LIFT, dur: TUN - LIFT - 0.05, db: -13 }, // lift-off blast
  { s: "pop", at: TUN + 0.05 }, // tunnel
  { s: "brumm", at: TUN + 0.1, dur: T.wie5 - TUN - 0.2, db: -22 }, // driving
  { s: "pop", at: T.unter + 0.2, db: -13 }, // fans
  { s: "blip", at: T.luefter + 0.05 }, // Lüfter tag (scene.js)
  { s: "surr", at: T.luefter, dur: T.wie5 - T.luefter - 0.05, db: -20 },
  { s: "pop", at: T.wie5 + 0.1 }, // vacuum
  { s: "rauschen", at: T.staubsauger, dur: T.theo - T.staubsauger - 0.05, db: -20 },
  { s: "brumm", at: T.theo, dur: T.nur - T.theo - 0.1, db: -19 }, // up the wall
  { s: "klack", at: TOP + 0.1, db: -10 },
  { s: "pop", at: T.nur + 0.1 }, // rocket
  { s: "zisch", at: T.nur, dur: T.schau - T.nur - 0.1, db: -22 },
  { s: "klack", at: T.uebrigens + 0.35, db: -14 }, // lands for the sprint
  { s: "rauschen", at: DASH, dur: T.wuerdest - DASH - 0.1, db: -13 }, // rear thrusters
  { s: "zisch", at: RISE, dur: Math.max(0.5, END - RISE - 0.6), db: -21 },
];
