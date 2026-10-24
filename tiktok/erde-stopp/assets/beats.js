// Beats of "Was passiert eigentlich, wenn du die Erde anhältst?" (#24, format B):
// every time-keyed decision as plain data, read by scene.js (picture) and
// scripts/build-sfx.mjs (sound). No three.js / DOM here: node imports it too.
import { W } from "./timing.js";

// ---------------------------------------------------------------- globe
// The toy Earth floats above the moon-rock stage. Its axis leans towards
// the camera (TILT about x) so Europe faces the front once it has stopped.
// geo(lat, lon, h) = world point on the globe (lat/lon in degrees in the
// tilted, *stopped* frame: lon 0 = facing the camera, east = +lon).
export const G = { C: [0, 2.9, 0], R: 2.3, TILT: 0.36, EU: [47.5, -6] };
export function geo(lat, lon, h = 0) {
  const la = (lat * Math.PI) / 180;
  const lo = (lon * Math.PI) / 180;
  const r = G.R + h;
  const x = r * Math.cos(la) * Math.sin(lo);
  const y = r * Math.sin(la);
  const z = r * Math.cos(la) * Math.cos(lo);
  const c = Math.cos(G.TILT);
  const s = Math.sin(G.TILT);
  return [x + G.C[0], y * c - z * s + G.C[1], y * s + z * c + G.C[2]];
}
const EU = (h = 0, dLat = 0, dLon = 0) => geo(G.EU[0] + dLat, G.EU[1] + dLon, h);
const add = (a, b) => a.map((v, i) => v + b[i]);
// "you": where you stand (geo lat/lon, Europe = 14° geo ↔ G.EU[1] in front)
// and your flight after the stop — straight on along the old direction of
// travel (east), so you leave the curved surface. scene.js flies the figure
// with the same numbers; the tracking shots follow it.
export const YOU = { lat: 47.5, lon: 14.0, v: 0.36, lift: 0.05 };
export function youAt(u) {
  const lonT = YOU.lon - 14 + G.EU[1];
  const p = geo(YOU.lat, lonT);
  const q = geo(YOU.lat, lonT + 0.5);
  const e = q.map((v, i) => v - p[i]);
  const el = Math.hypot(...e);
  const n = p.map((v, i) => (v - G.C[i]) / G.R);
  return p.map((v, i) => v + (e[i] / el) * YOU.v * u + n[i] * (YOU.lift * u + 0.012 * u * u));
}

// ---------------------------------------------------------------- beats
export const T = {
  press: 0.12, // the hand slams the STOPP button on frame 0
  erde: W("Erde"),
  du: W("Du", 2), // "Du drückst" (the 1st "du" is "wenn du")
  stopp: W("Stopp"),
  gleich: W("Gleich"),
  karte: W("Karte"),
  erde2: W("Erde", 2),
  aber: W("aber"),
  du2: W("Du", 5), // "Du fliegst"
  osten: W("Osten"),
  flugzeug: W("Flugzeug"),
  haeuser: W("Häuser"),
  baeume: W("Bäume"),
  kuehe: W("Kühe"),
  hinterher: W("hinterher"),
  luft: W("Luft"),
  sturm: W("Sturm"),
  hurrikan: W("Hurrikan"),
  meere: W("Meere"),
  land: W("Land"),
  heute: W("Heute"),
  aequator: W("Äquator"),
  steht2: W("Steht", 2),
  fliesst: W("fließt"),
  polen: W("Polen"),
  ende: W("Ende"),
  superkontinent: W("Superkontinent"),
  aequator2: W("Äquator", 2),
  europa: W("Europa"),
  wasser: W("Wasser"),
  fakt: W("Übrigens"),
  jahr: W("Jahr"),
  cta: W("sollen") - 0.1,
};

// ---------------------------------------------------------------- shots
const C = G.C;
export const shots = [
  // hook: the hand on the button in front, the spinning globe behind it, fast push-in
  { at: 0, from: [4.6, 2.3, 8.4], to: [3.5, 2.0, 6.6], look: [0.9, 2.3, 1.6], zoom: 1 },
  // the town on the globe shudders
  { at: W("wenn"), from: EU(0.42, -18, -10), to: EU(0.32, -14, -6), look: EU(0.04, 0, 1), zoom: 1 },
  // macro: the pressed button glows
  {
    at: T.du,
    from: [3.9, 2.1, 5.3],
    to: [3.4, 1.85, 4.7],
    look: [2.0, 1.2, 2.8],
    zoom: 1,
    whip: 1,
  },
  // the stopped Earth, wide, slowly circling
  { at: T.gleich, orbit: { c: C, r: 9.6, y: 4.4, a0: 0.55, a1: 0.25 } },
  // the map card that will never be right again
  { at: T.karte, from: [-1.6, 2.4, 6.9], to: [-1.9, 2.3, 6.1], look: [-2.7, 2.1, 3.0], zoom: 1 },
  // Folge 1: you on the globe — the Earth stands, you don't
  { at: T.erde2, from: EU(0.75, -14, -8), to: EU(0.6, -12, -4), look: EU(0.08), zoom: 1 },
  // tracking you east across the globe
  {
    at: T.du2,
    from: add(youAt(T.du2 - T.aber), [-0.05, -0.5, 0.42]),
    to: add(youAt(T.flugzeug - T.aber), [0.05, -0.55, 0.45]),
    look: youAt(T.du2 - T.aber),
    lookTo: youAt(T.flugzeug - T.aber),
    zoom: 1,
    whip: 1,
  },
  // you overtake an airliner
  {
    at: T.flugzeug,
    from: add(youAt(T.flugzeug - T.aber), [0.05, -0.6, 0.5]),
    to: add(youAt(T.haeuser - T.aber), [0.15, -0.56, 0.48]),
    look: add(youAt(T.flugzeug - T.aber), [-0.06, 0.0, -0.01]),
    lookTo: add(youAt(T.haeuser - T.aber), [-0.1, 0.0, -0.01]),
    zoom: 1,
  },
  // houses, trees, cows rip off
  { at: T.haeuser, from: EU(0.85, -15, -14), to: EU(0.7, -13, -9), look: EU(0.08, 0, 1), zoom: 1 },
  // wide: everything streams off to the east
  { at: T.hinterher, from: [-1.2, 5.8, 9.6], to: [0.4, 5.4, 8.8], look: [0.8, 3.9, 1.6], zoom: 1 },
  // Folge 2: the storm
  { at: T.luft, from: EU(1.2, -18, -22), to: EU(1.0, -14, -12), look: EU(0.1), zoom: 1 },
  { at: T.sturm, from: EU(1.9, -24, 10), to: EU(1.6, -20, 4), look: EU(0.15), zoom: 1, whip: -1 },
  // the sea sloshes over the land
  { at: T.meere, from: EU(2.9, -8, -14), to: EU(2.5, -6, -7), look: EU(0, 0, 2), zoom: 1, whip: 1 },
  // Folge 3: today the spin flings the sea to the equator
  { at: T.heute, from: [0.6, 3.0, 10.4], to: [0.3, 2.8, 9.2], look: [0, 2.6, 0], zoom: 1, whip: 1 },
  // it stops, the water flows back to the poles
  { at: T.steht2, from: [-3.4, 4.4, 9.0], to: [-2.4, 5.4, 8.4], look: [0, 3.0, 0], zoom: 1 },
  // payoff: one supercontinent around the equator
  { at: T.ende, orbit: { c: [0, 2.8, 0], r: 7.2, y: 2.5, a0: -0.6, a1: 0.45 } },
  // Europe under water
  { at: W("Und", 3), from: EU(2.6, -14, -14), to: EU(2.1, -11, -8), look: EU(0.0, 0, 2), zoom: 1 },
  // Übrigens: one side lies in the dark for half a year
  {
    at: T.fakt,
    from: [9.6, 3.4, -1.0],
    to: [8.6, 3.2, 1.2],
    look: [0, 2.9, -1.0],
    zoom: 1,
    whip: 1,
  },
  // CTA: drone pull-back over the whole set
  {
    at: T.cta,
    from: [3.4, 4.2, 9.8],
    to: [9.5, 9.5, 22.0],
    look: [0, 2.9, 0],
    lookTo: [0, 2.4, 0],
    zoom: 1,
  },
];

// ---------------------------------------------------------------- labels
// Static ones; "Du" rides along with the flying figure (scene.js).
export const LABELS = [
  {
    text: "Osten →",
    at: T.osten,
    until: T.flugzeug,
    pos: add(youAt(T.osten - T.aber + 1.2), [0, 0.03, 0]),
    side: 1,
  },
  { text: "Äquator", at: T.aequator, until: T.steht2 + 0.6, pos: geo(0, 18, 0.06), side: 1 },
  { text: "Nordpol", at: T.polen, until: T.ende, pos: geo(90, 0, 0.12), side: -1 },
  { text: "Superkontinent", at: T.superkontinent, until: W("Und", 3), pos: geo(4, 6, 0.05) },
  { text: "Europa", at: T.europa, until: T.fakt, pos: EU(0.02), side: 1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "flash", at: T.press + 0.06 }, // the Earth is stopped
  { kind: "shake", at: T.press + 0.06, dur: 0.9, amp: 1.2 },
  { kind: "zoom", at: T.erde, amount: 0.3 },
  { kind: "shake", at: T.karte, dur: 0.35, amp: 0.5 },
  { kind: "slowmo", at: T.aber, until: T.du2, speed: 0.4 }, // you lift off
  { kind: "zoom", at: T.flugzeug + 0.1, amount: 0.3 },
  { kind: "shake", at: T.haeuser, dur: 0.6, amp: 0.9 },
  { kind: "slowmo", at: T.kuehe, until: T.hinterher, speed: 0.35 }, // the cow tumbles
  { kind: "flash", at: T.sturm },
  { kind: "shake", at: T.sturm, dur: 1.2, amp: 0.8 },
  { kind: "shake", at: T.land - 0.25, dur: 0.8, amp: 1.1 }, // the wave hits
  { kind: "zoom", at: T.land - 0.25, amount: 0.25 },
  { kind: "shake", at: T.steht2, dur: 0.4, amp: 0.6 },
  { kind: "flash", at: T.superkontinent },
  { kind: "zoom", at: T.europa, amount: 0.25 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "klack", at: T.press, db: -6 }, // the button, frame 0
  { s: "grollen", at: T.press + 0.04, db: -4 }, // the Earth grinds to a halt
  { s: "pop", at: T.karte + 0.05 },
  { s: "whoosh", at: T.aber + 0.05, db: -8 }, // you lift off
  { s: "klack", at: T.haeuser + 0.05, db: -10 },
  { s: "pop", at: T.baeume + 0.05, db: -10 },
  { s: "boing", at: T.kuehe + 0.08, db: -9 },
  { s: "rauschen", at: T.luft, dur: T.meere - T.luft + 0.4, db: -13 }, // the storm
  { s: "welle", at: T.land - 0.7, db: -6 }, // the wave breaks (crash peak ~0.45 s in)
  { s: "klack", at: T.steht2, db: -10 },
  { s: "rauschen", at: T.fliesst, dur: 2.2, db: -19 }, // the sea flowing to the poles
  { s: "wow", at: T.superkontinent - 0.05, db: -10 },
];
