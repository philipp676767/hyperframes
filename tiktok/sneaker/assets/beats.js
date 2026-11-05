// #62 Sneaker-Sohle — every time-keyed decision as plain data (scene.js reads
// it for the picture, scripts/build-sfx.mjs for the sound).
import { W } from "./timing.js";

export const T = {
  sneaker1: W("Sneaker", 1),
  fenster1: W("Fenster", 1),
  sohle: W("Sohle"),
  stell: W("Stell"),
  springst: W("springst"),
  korb: W("Korb"),
  landung: W("Landung"),
  knallt: W("knallt"),
  hammer: W("Hammerschlag"),
  normale: W("Normale"),
  schaum1: W("Schaum", 1),
  millionen: W("Millionen"),
  quetschen: W("quetschen"),
  nur1: W("Nur", 1),
  schaum2: W("Schaum", 2),
  muede1: W("müde", 1),
  also: W("Also"),
  ingenieur: W("Ingenieur"),
  luftfahrt: W("Luftfahrt"),
  gas1: W("Gas", 1),
  kissen: W("Plastikkissen"),
  nie: W("nie"),
  anders: W("Anders"),
  nur2: W("Nur", 2),
  luft: W("Luft"),
  kriecht: W("kriecht"),
  raus: W("raus"),
  folge: W("Folge"),
  rate: W("Rate"),
  jahrzehnte: W("jahrzehntelang"),
  treibhaus: W("Treibhausgas"),
  mal20k: W("20000-mal"),
  co2: W("CO2"),
  seine: W("Seine"),
  dick: W("dick"),
  durchkommen: W("durchkommen"),
  erst: W("Erst"),
  n2006: W("2006"),
  stickstoff: W("Stickstoff"),
  fenster2: W("Fenster", 2),
  designer: W("Designer"),
  paris: W("Paris"),
  museum: W("Museum"),
  rohren: W("Rohren"),
  darum: W("Darum"),
  fenster3: W("Fenster", 3),
  zeigt: W("zeigt"),
  technik: W("Technik"),
  fakt: W("Übrigens"),
  n800: W("800"),
  kilometer: W("Kilometern"),
  platt: W("platt"),
  neu: W("neu"),
  welche: W("Welche"),
};

// ---------------------------------------------------------------- places
// The giant sneaker stands on the centre circle: length along x (heel at
// -x, toe at +x), its outer side with the window faces +z (the camera).
// AIR = the air cushion behind the window (world), PLAYER = where the
// player lands under the hoop, PARIS = the little museum that pops up.
export const AIR = [-1.5, 0.46, 0];
export const PLAYER = [0, 0, -12.2];
export const PARIS = [7.6, 0, 3.6];

// ---------------------------------------------------------------- shots
const lookAir = [AIR[0], AIR[1], 0.5];
export const shots = [
  // hook (cover shot): the giant sneaker slams onto the court, low on the window
  { at: 0, from: [-2.6, 1.9, 5.0], to: [-2.0, 1.3, 3.8], look: [-0.7, 0.9, 0], zoom: 1.9 },
  // macro: the window — the viewer's finger taps it
  {
    at: T.fenster1 - 0.1,
    from: [-0.2, 0.95, 2.5],
    to: [-0.6, 0.8, 2.05],
    look: lookAir,
    zoom: 1.35,
  },
  // wide: the rooftop court at sunset, the player bounces under the hoop
  {
    at: T.stell,
    from: [13, 6.5, 6],
    to: [11.5, 6.2, 4.2],
    look: [0, 4.5, -10],
    zoom: 1,
    whip: 1,
  },
  // the dunk, from the side, up at the rim
  { at: T.korb, from: [8.5, 8.0, -7.0], to: [7.6, 8.6, -8.6], look: [0, 8.2, -13.6], zoom: 1 },
  // low on the floor: the landing slams down
  { at: T.landung, from: [4.0, 1.4, -7.4], to: [3.4, 1.2, -8.2], look: [0, 1.8, -12.2], zoom: 1.8 },
  // back to the giant sneaker, the sole turns to glass: foam
  { at: T.normale, from: [4.4, 2.4, 6.0], to: [3.6, 2.1, 5.0], look: [0, 0.9, 0], zoom: 1.6 },
  // macro on the midsole: millions of bubbles squeeze
  {
    at: T.millionen,
    from: [1.4, 0.9, 2.6],
    to: [0.9, 0.75, 2.2],
    look: [0.4, 0.45, 0.3],
    zoom: 1.4,
    whip: -1,
  },
  // the foam gets tired — whole shoe sags
  { at: T.nur1, from: [-3.8, 1.6, 4.6], to: [-3.2, 1.4, 4.0], look: [0, 0.8, 0], zoom: 1.6 },
  // up: a jet over the roofs
  { at: T.also, from: [3.0, 1.6, 6.5], to: [2.6, 1.8, 6.0], look: [-8, 11, -30], zoom: 1, whip: 1 },
  // macro: the cushion pops into the heel, gas inside
  { at: T.gas1 - 0.15, from: [-0.6, 1.1, 2.4], to: [-1.0, 0.9, 1.9], look: lookAir, zoom: 1.4 },
  // the shoe stomps: never tired
  { at: T.nie, from: [4.6, 1.8, 5.8], to: [4.0, 1.6, 5.0], look: [-0.4, 1.0, 0], zoom: 1.6 },
  // the player, bent over and out of breath
  { at: T.anders, from: [7.8, 5.2, -3.6], to: [7.0, 4.8, -4.6], look: [2.2, 3.0, -10.7], zoom: 1 },
  // macro: small particles slip through the plastic, the cushion goes flat
  { at: T.nur2, from: [0.2, 1.3, 2.9], to: [-0.4, 1.1, 2.3], look: lookAir, zoom: 1.4, whip: -1 },
  // follow line: the whole shoe, hero shot (low, room for the pill under)
  { at: T.folge, from: [6.4, 3.8, 9.0], to: [5.6, 3.4, 8.0], look: [0, 1.6, 0], zoom: 1.5 },
  // rate mal (slow motion): close on the window, "?"
  { at: T.rate, from: [-0.4, 1.4, 3.0], to: [-0.9, 1.1, 2.3], look: lookAir, zoom: 1.35 },
  // the greenhouse gas: fat green molecules fill the cushion
  { at: T.treibhaus, from: [-1.2, 0.9, 1.75], to: [-1.4, 0.8, 1.45], look: lookAir, zoom: 1.5 },
  // 20.000× — wide, the city behind, smoky orange
  { at: T.mal20k, from: [-6, 2.6, 8.5], to: [-5, 2.4, 7.4], look: [0, 1.6, 0], zoom: 1.4 },
  // the fat molecules bounce off the wall (orbit)
  {
    at: T.seine,
    orbit: { c: [AIR[0], AIR[1], 0.3], r: 1.5, y: 0.95, a0: 0.75, a1: 0.05 },
    zoom: 1.4,
  },
  // since 2006: nitrogen
  { at: T.erst, from: [-2.6, 1.2, 2.2], to: [-2.2, 1.0, 1.8], look: lookAir, zoom: 1.4, whip: 1 },
  // and the window? the side of the shoe, window glowing
  {
    at: T.fenster2 - 0.3,
    from: [1.0, 1.6, 5.0],
    to: [0.4, 1.3, 4.2],
    look: [-0.6, 0.8, 0],
    zoom: 1.6,
  },
  // Paris: the little museum with its pipes outside pops up
  {
    at: T.designer,
    from: [11.5, 3.6, 10.5],
    to: [10.6, 3.2, 9.0],
    look: [PARIS[0], 1.4, PARIS[2]],
    zoom: 1.6,
    whip: 1,
  },
  // close on the pipes
  {
    at: T.rohren,
    orbit: { c: [PARIS[0], 1.3, PARIS[2]], r: 4.6, y: 2.4, a0: 0.5, a1: -0.15 },
    zoom: 1.3,
  },
  // payoff: orbit around the solid sneaker, window lights up
  { at: T.darum, orbit: { c: [0, 1.0, 0], r: 6.0, y: 2.6, a0: 0.95, a1: 0.25 }, zoom: 1.4 },
  // macro window on "zeigt"
  { at: T.zeigt, from: [-0.3, 1.0, 2.6], to: [-0.8, 0.85, 2.1], look: lookAir, zoom: 1.35 },
  // Übrigens: 800 km — the foam goes flat
  {
    at: T.fakt,
    from: [3.0, 1.4, 5.0],
    to: [2.4, 1.2, 4.2],
    look: [0.2, 0.7, 0],
    zoom: 1.6,
    whip: -1,
  },
  // close on the flattened midsole
  { at: T.platt, from: [1.2, 1.3, 6.2], to: [0.6, 1.1, 5.4], look: [0, 0.7, 0], zoom: 1.8 },
  // last line: the shoe turns, low hero
  { at: T.welche, from: [4.8, 1.2, 6.2], to: [4.0, 1.4, 5.0], look: [-0.2, 1.1, 0], zoom: 2.0 },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Schaum", at: T.schaum1, until: T.nur1, pos: [0.9, 0.38, 0.8], side: 1 },
  { text: "Luftkissen", at: T.kissen, until: T.nie, pos: [-1.3, 0.62, 0.86], side: 1 },
  { text: "Treibhausgas", at: T.treibhaus + 0.1, until: T.mal20k, pos: [-1.5, 0.6, 0.9], side: 1 },
  { text: "Stickstoff", at: T.stickstoff, until: T.fenster2 - 0.3, pos: [-1.4, 0.6, 0.9], side: 1 },
  {
    text: "Centre Pompidou",
    at: T.museum,
    until: T.rohren,
    pos: [PARIS[0], 2.5, PARIS[2] + 0.6],
    side: -1,
  },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "flash", at: 0.12 },
  { kind: "shake", at: 0.12, dur: 0.45, amp: 0.9 },
  { kind: "zoom", at: T.fenster1, amount: 0.25 },
  { kind: "slowmo", at: T.springst, until: T.landung, speed: 0.45 },
  { kind: "shake", at: T.knallt, dur: 0.5, amp: 1 },
  { kind: "flash", at: T.hammer },
  { kind: "zoom", at: T.schaum1, amount: 0.25 },
  { kind: "shake", at: T.muede1, dur: 0.35, amp: 0.4 },
  { kind: "zoom", at: T.kissen, amount: 0.3 },
  { kind: "shake", at: T.nie + 0.2, dur: 0.3, amp: 0.5 },
  { kind: "slowmo", at: T.rate, until: T.treibhaus, speed: 0.35 },
  { kind: "flash", at: T.treibhaus },
  { kind: "zoom", at: T.mal20k, amount: 0.3 },
  { kind: "flash", at: T.stickstoff },
  { kind: "zoom", at: T.rohren, amount: 0.25 },
  { kind: "flash", at: T.zeigt },
  { kind: "shake", at: T.platt, dur: 0.45, amp: 0.7 },
];

// ---------------------------------------------------------------- sound
// own sounds (scripts/sfx-extra.py): quietsch = sneaker squeak on the court,
// ball = a basketball bounce
export const SFX = [
  { s: "ball", at: 0.1, db: -5 }, // frame 0: the shoe slams down
  { s: "quietsch", at: 0.2, db: -10 },
  { s: "ball", at: T.korb + 0.5, db: -9 }, // the ball through the net bounces
  { s: "quietsch", at: T.knallt, db: -10 }, // landing
  { s: "pop", at: T.kissen + 0.05 },
  { s: "quietsch", at: T.nie + 0.2, db: -14 },
  { s: "zisch", at: T.kriecht, dur: 1.4, db: -19 },
  { s: "pop", at: T.treibhaus + 0.05 },
  { s: "pop", at: T.stickstoff + 0.05 },
  { s: "pop", at: T.designer + 0.1 },
  { s: "click", at: T.n800 },
  { s: "zisch", at: T.platt, dur: 0.6, db: -18 },
];
