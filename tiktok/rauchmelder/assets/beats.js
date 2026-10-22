// Rauchmelder beats: every time-keyed decision as plain data, so scene.js
// (picture) and scripts/build-sfx.mjs (sound) read the same numbers.
// Keep this file free of three.js / DOM: it is imported by node too.
import { W } from "./timing.js";

// ---------------------------------------------------------------- layout
// Shared with scene.js (plain numbers only).
export const D = [0, 2.62, 0]; // detector centre (hangs under the ceiling)
export const C = [-0.3, 2.62, 0]; // ionisation chamber centre (between the plates)
export const PS = [-5.0, 0, 2.0]; // americium crumb set: paper + snowman, later the hourglass
export const TO = [0.95, 0, 0.75]; // toaster on the floor

// ---------------------------------------------------------------- beats
export const T = {
  radioaktiv: W("radioaktiv"),
  lass: W("Lass"),
  platten: W("Metallplatten"),
  kruemel: W("Krümel"),
  americium1: W("Americium", 1),
  millionstel: W("Millionstel"),
  keine: W("Keine"),
  papier: W("Papier"),
  strahlung2: W("Strahlung", 2),
  elektronen: W("Elektronen"),
  strom1: W("Strom", 1),
  kammer: W("Ionisationskammer"),
  trick: W("Trick"),
  rauch1: W("Rauch", 1),
  kleben: W("kleben"),
  strom2: W("Strom", 2),
  bricht: W("bricht"),
  chip: W("Chip"),
  alarm: W("Alarm"),
  nicht: W("Nicht"),
  fehlende: W("fehlende"),
  schau: W("Schau", 1),
  gerade: W("gerade"),
  uebrigens: W("Übrigens"),
  zahl: W("432"),
  schau2: W("Schau", 2),
};

const rel = (p, d) => p.map((v, i) => v + d[i]);

// current through the chamber: on with "Strom", collapses on "bricht ein"
export const FLOW_ON = [T.strom1 - 0.3, T.strom1 + 0.3];
export const FLOW_OFF = [T.bricht, T.bricht + 0.6];

// ---------------------------------------------------------------- shots
export const shots = [
  // hook: low angle up at the detector, radiation sticker blinking
  { at: 0, from: [1.0, 1.65, 2.6], to: [0.7, 1.75, 2.25], look: [0, 2.45, 0], zoom: 1.6 },
  {
    at: T.radioaktiv,
    from: [0.35, 1.75, 1.05],
    to: [0.25, 1.8, 0.85],
    look: [0, 2.3, 0],
    zoom: 1.2,
  },
  // build: the room corner, the detector pops back in
  { at: T.lass, from: [2.6, 2.1, 5.0], to: [2.2, 2.0, 4.3], look: [0, 1.7, 0] },
  // plates in x-ray
  {
    at: T.platten,
    from: rel(C, [0.9, -0.3, 1.45]),
    to: rel(C, [0.7, -0.25, 1.2]),
    look: rel(C, [0, -0.02, 0]),
    zoom: 1.3,
  },
  // the crumb on the lower plate
  {
    at: T.kruemel,
    from: rel(C, [0.35, 0.1, 1.15]),
    to: rel(C, [0.25, 0.08, 1.0]),
    look: rel(C, [0, -0.12, 0]),
    zoom: 1.15,
  },
  // paper stops the rays, the snowman stays safe
  {
    at: T.keine,
    from: rel(PS, [1.3, 1.05, 2.7]),
    to: rel(PS, [1.1, 0.95, 2.4]),
    look: rel(PS, [0.7, 0.55, 0]),
    zoom: 1.3,
  },
  // rays knock electrons out of the air
  { at: T.strahlung2, orbit: { c: C, r: 1.45, y: 2.75, a0: 0.65, a1: 0.25 }, zoom: 1.15 },
  // current flows
  {
    at: T.strom1,
    from: rel(C, [-0.85, -0.15, 1.35]),
    to: rel(C, [-0.65, -0.1, 1.15]),
    look: C,
    zoom: 1.3,
  },
  // the whole chamber named
  {
    at: T.kammer,
    from: rel(D, [1.25, -0.85, 1.85]),
    to: rel(D, [1.0, -0.75, 1.55]),
    look: rel(D, [0, -0.05, 0]),
    zoom: 1.35,
  },
  // toast burns, smoke rises to the ceiling
  { at: T.trick, from: [1.9, 1.0, 3.5], to: [1.6, 1.1, 3.0], look: [0.35, 1.45, 0.35], zoom: 1.45 },
  // ions stick to the smoke
  {
    at: T.kleben,
    from: rel(C, [0.5, 0.12, 1.2]),
    to: rel(C, [0.4, 0.1, 1.02]),
    look: C,
    zoom: 1.15,
  },
  // current breaks down, the chip sees it
  {
    at: T.strom2,
    from: rel(D, [0.95, -0.6, 1.55]),
    to: rel(D, [0.75, -0.5, 1.25]),
    look: rel(D, [0.2, -0.1, 0]),
    zoom: 1.3,
  },
  // alarm: LED flashes, sound rings
  { at: T.alarm, from: [0.85, 1.0, 2.7], to: [0.6, 1.2, 2.3], look: [0, 2.3, 0], zoom: 1.45 },
  // payoff: the missing current
  {
    at: T.fehlende,
    from: rel(C, [-0.5, 0.05, 1.25]),
    to: rel(C, [-0.4, 0.04, 1.05]),
    look: C,
    zoom: 1.15,
  },
  // outro: x-ray off, drone pull-back
  { at: T.schau, from: [0.9, 1.6, 3.7], to: [0.6, 1.6, 3.2], look: [0, 2.0, 0] },
  {
    at: T.gerade,
    from: [2.8, 2.7, 5.2],
    to: [5.5, 4.8, 9.5],
    look: [0, 1.7, 0],
    lookTo: [0, 1.2, 0],
  },
  // bonus fact: the crumb next to an hourglass
  {
    at: T.uebrigens,
    from: rel(PS, [0.9, 1.05, 2.4]),
    to: rel(PS, [0.7, 0.95, 2.1]),
    look: rel(PS, [0.4, 0.5, 0]),
    zoom: 1.3,
  },
  // CTA: wide drone shot of the snowy village
  {
    at: T.schau2,
    from: [4.5, 3.9, 8.5],
    to: [9.5, 8.0, 17],
    look: [0, 1.5, 0],
    lookTo: [0, 0.9, 0],
  },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  {
    text: "Metallplatten",
    at: T.platten,
    until: T.kruemel,
    pos: rel(C, [0.3, 0.13, 0.25]),
    side: 1,
  },
  {
    text: "Americium",
    at: T.americium1,
    until: T.keine,
    pos: rel(C, [0.02, -0.11, 0.03]),
    side: -1,
  },
  { text: "Papier", at: T.papier, until: T.strahlung2, pos: rel(PS, [0.7, 1.15, 0.2]), side: 1 },
  {
    text: "Elektronen",
    at: T.elektronen,
    until: T.strom1,
    pos: rel(C, [0.15, -0.06, 0.15]),
    side: 1,
  },
  {
    text: "Ionisationskammer",
    at: T.kammer,
    until: T.trick,
    pos: rel(C, [0, 0.14, 0.38]),
    side: -1,
  },
  { text: "432 Jahre", at: T.zahl, until: T.schau2, pos: rel(PS, [0.75, 0.9, 0.15]), side: 1 },
  { text: "Chip", at: T.chip, until: T.nicht, pos: rel(D, [0.6, -0.13, 0.18]), side: 1 },
];

// ---------------------------------------------------------------- sound
// Geiger counter ticks in the hook (seeded, uneven like the real thing)
function ticks(a, b, seed, db) {
  const out = [];
  let x = seed;
  let t = a;
  while (t < b) {
    out.push({ s: "click", at: +t.toFixed(3), db });
    x = (x * 9301 + 49297) % 233280;
    t += 0.12 + (x / 233280) * 0.38;
  }
  return out;
}

export const SFX = [
  ...ticks(0.15, T.lass - 0.1, 7, -20),
  { s: "pop", at: T.lass + 0.45 }, // detector pops back in
  { s: "pop", at: T.platten + 0.1 },
  { s: "pop", at: T.platten + 0.22 },
  { s: "pop", at: T.americium1 + 0.2 },
  ...ticks(T.keine + 0.1, T.papier, 3, -23),
  { s: "klack", at: T.papier + 0.2 }, // paper slaps in
  { s: "surr", at: T.strahlung2, dur: T.trick - T.strahlung2, db: -24 }, // current hum
  { s: "pop", at: T.trick + 0.25 }, // toaster
  { s: "rauschen", at: T.trick + 0.3, dur: T.strom2 - T.trick, db: -24 }, // smoke
  { s: "pop", at: T.chip + 0.05 },
  ...Array.from({ length: 10 }, (_, i) => ({
    s: "blip",
    at: +(T.alarm + i * 0.3).toFixed(3),
    db: -13,
  })),
  { s: "pop", at: T.uebrigens + 0.35 }, // hourglass
  { s: "rauschen", at: T.uebrigens + 0.6, dur: T.schau2 - T.uebrigens - 0.8, db: -28 }, // sand
];
