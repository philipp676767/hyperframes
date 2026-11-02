// #48 "Cent vom Wolkenkratzer" (Format B) — every time-keyed decision as
// plain data. Read by scene.js (picture) and scripts/build-sfx.mjs (sound).
// Shots with `follow: "coin" | "walker" | "rider"` are relative to that moving
// thing (scene.js turns the tag into a live `rel` vector).
import { W } from "./timing.js";

export const T = {
  // hook
  cent1: W("Cent", 1),
  wolkenkratzer: W("Wolkenkratzer"),
  // Folge 1
  unten1: W("Unten", 1),
  alle: W("Alle"),
  durchschlaegt: W("durchschlägt"),
  schaedel: W("Schädel"),
  er1: W("Er", 1),
  eiffel: W("Eiffelturm"),
  jede: W("Jede"),
  ohne: W("Ohne", 1),
  ice: W("ICE"),
  // Folge 2
  doch: W("Doch"),
  taumelt: W("taumelt"),
  blatt: W("Blatt"),
  ab: W("Ab"),
  schneller2: W("schneller", 2),
  // comment question
  was: W("Was"),
  passant: W("Passant"),
  // Rate mal
  rate: W("Rate"),
  rund: W("Rund"),
  vierzig: W("40"),
  wie4: W("Wie", 5),
  radfahrer: W("Radfahrer"),
  // Folge 3
  der3: W("Der", 3),
  flach: W("flach"),
  fallschirm: W("Mini-Fallschirm"),
  die3: W("Die", 2),
  luft2: W("Luft", 2),
  erde: W("Erde"),
  darum: W("Darum"),
  minute: W("Minute"),
  // payoff
  und: W("Und"),
  es: W("Es"),
  kurz: W("kurz"),
  schnipser: W("Schnipser"),
  voellig: W("Völlig"),
  harmlos: W("harmlos"),
  nur: W("Nur"),
  kuli: W("Kuli"),
  voran: W("voran"),
  den: W("den"),
  fakt: W("Übrigens"),
  regentropfen: W("Regentropfen"),
  fuenfhundert: W("500"),
  einschlagen: W("einschlagen"),
  folge: W("Folge"),
};
// the moment the coin hits the passer-by's head
T.impact = T.kurz;

// ---------------------------------------------------------------- shots
export const shots = [
  // 0: frame 0 = the cover: over the shoulder at the railing, the hand has just
  // let go, the coin tumbles away, the street far below
  {
    at: 0,
    from: [1.75, 37.75, -2.05],
    to: [1.4, 37.3, -2.5],
    look: [0.6, 35.4, -3.75],
    lookTo: [0.6, 34.8, -3.75],
    zoom: 1.0,
    tilt: 0.35,
  },
  // the whole skyscraper, the coin a glint sliding down its face
  {
    at: T.wolkenkratzer,
    from: [19, 15, 27],
    to: [16, 16.5, 23],
    look: [0, 18.5, -5],
    lookTo: [0, 16.5, -5],
    zoom: 1.0,
    tilt: 0.3,
  },
  // down on the sidewalk: someone walks along, phone in hand
  {
    at: T.unten1,
    follow: "walker",
    from: [2.8, 1.1, 2.6],
    to: [2.2, 1.0, 2.0],
    look: [0, 1.2, 0],
    zoom: 1.0,
  },
  // low angle past the passer-by up to the coin high above
  {
    at: T.alle,
    from: [-9.4, 0.55, -1.2],
    to: [-9.2, 0.6, -1.35],
    look: [0.6, 24, -3.7],
    lookTo: [0.6, 22, -3.7],
    zoom: 1.0,
    tilt: 0.25,
  },
  // crash in on the head: "durchschlägt einen Schädel"
  {
    at: T.durchschlaegt,
    follow: "walker",
    from: [1.5, 1.95, 1.5],
    to: [1.05, 1.8, 1.05],
    look: [0, 1.6, 0],
    zoom: 1.0,
  },
  // the Eiffel Tower rises next to the skyscraper: same height
  {
    at: T.er1,
    from: [-13, 17, 27],
    to: [-10.5, 17.5, 24],
    look: [7, 16.5, -6],
    zoom: 1.0,
    tilt: 0.3,
  },
  // close on the falling coin, streaks rush past: faster every second
  {
    at: T.jede,
    follow: "coin",
    from: [1.3, 0.55, 1.5],
    to: [0.85, 0.35, 1.05],
    look: [0, 0, 0],
    zoom: 1.0,
  },
  // money shot 2: the ICE races past the camera, a golden coin keeps up with its nose
  {
    at: T.ohne,
    from: [24, 1.3, 28.5],
    to: [23, 1.5, 27.5],
    look: [10, 1.9, 21.5],
    lookTo: [14, 1.9, 21.5],
    zoom: 1.0,
    whip: 1,
    tilt: 0.3,
  },
  // slow motion macro: the coin starts to tumble like an autumn leaf
  {
    at: T.doch,
    follow: "coin",
    from: [0.95, 0.3, 1.0],
    to: [0.7, 0.18, 0.78],
    look: [0.15, 0, 0],
    zoom: 1.0,
  },
  // air pushes up from below: it stops getting faster
  {
    at: T.ab,
    follow: "coin",
    from: [1.9, -0.25, 2.3],
    to: [1.6, -0.15, 2.0],
    look: [0, -0.35, 0],
    zoom: 1.0,
  },
  // comment question: next to the passer-by, the coin glints right above him
  {
    at: T.was,
    follow: "walker",
    from: [2.5, 1.2, 3.4],
    to: [2.15, 1.25, 2.95],
    look: [0, 2.15, -0.3],
    zoom: 1.0,
    tilt: 0.3,
  },
  // Rate mal: the coin against the glass facade, the speedometer climbs
  {
    at: T.rate,
    follow: "coin",
    from: [-1.6, 0.35, 1.9],
    to: [-1.25, 0.25, 1.5],
    look: [0, 0, 0],
    zoom: 1.0,
  },
  // 40 km/h: close, LED panel + flash
  {
    at: T.rund,
    follow: "coin",
    from: [1.25, -0.2, 1.45],
    to: [1.0, -0.15, 1.2],
    look: [0, 0.55, 0],
    zoom: 1.0,
  },
  // like a cyclist going downhill: track along the rider
  {
    at: T.wie4,
    follow: "rider",
    from: [3.2, 1.4, 3.4],
    to: [2.4, 1.2, 2.7],
    look: [0.3, 1.0, 0],
    zoom: 1.0,
    whip: -1,
  },
  // flat like a mini parachute: from below, the canopy pops open
  {
    at: T.der3,
    follow: "coin",
    from: [1.5, -0.7, 1.6],
    to: [1.2, -0.5, 1.3],
    look: [0, 0.4, 0],
    zoom: 1.0,
  },
  // the forces: air pushes up exactly as hard as the Earth pulls down
  {
    at: T.die3,
    follow: "coin",
    from: [1.75, 0.1, 1.7],
    to: [1.45, 0.05, 1.4],
    look: [0, 0, 0],
    zoom: 1.0,
  },
  // almost half a minute: the whole tower, the golden trail of the fall
  {
    at: T.darum,
    from: [-17, 13, 6.5],
    to: [-15, 14, 5.5],
    look: [0, 16, -4],
    lookTo: [0, 14, -4],
    zoom: 1.0,
    whip: 1,
    tilt: 0.3,
  },
  // "Und unten?": slow motion, looking up past the head at the coin coming in
  {
    at: T.und,
    follow: "walker",
    from: [1.0, 0.95, 1.7],
    to: [0.85, 1.05, 1.45],
    look: [0, 3.2, -0.1],
    zoom: 1.0,
  },
  // impact: tink, ouch, the coin bounces off
  {
    at: T.es,
    follow: "walker",
    from: [1.55, 2.05, 1.45],
    to: [1.3, 1.9, 1.2],
    look: [0.1, 1.6, 0],
    zoom: 1.0,
  },
  // harmless: he rubs his head, the coin lies on the pavement
  {
    at: T.voellig,
    follow: "walker",
    from: [0.7, 1.5, 3.9],
    to: [0.45, 1.35, 3.3],
    look: [0.4, 1.0, 0],
    zoom: 1.0,
  },
  // but a pen falls tip first — never throw one
  {
    at: T.nur,
    from: [-2.3, 1.15, -0.35],
    to: [-2.55, 1.05, -0.7],
    look: [-4.0, 4.5, -3.75],
    lookTo: [-4.0, 1.0, -3.75],
    zoom: 1.0,
  },
  // Übrigens: it starts to rain, the umbrella pops open
  { at: T.fakt, from: [6.2, 1.5, 5.8], to: [5.0, 1.8, 4.6], look: [0.5, 2.0, -2.4], zoom: 1.0 },
  // macro: drops splash on the pavement
  {
    at: T.regentropfen,
    from: [2.1, 0.45, -0.5],
    to: [1.8, 0.4, -0.8],
    look: [0.8, 0.15, -2.2],
    zoom: 1.0,
  },
  // 500 km/h: looking up into the rain coming straight at you
  {
    at: T.fuenfhundert,
    from: [1.6, 0.5, -0.9],
    to: [1.5, 0.6, -1.1],
    look: [0.4, 9, -3.6],
    lookTo: [0.3, 11, -3.8],
    zoom: 1.0,
    tilt: 0.25,
  },
];

// ---------------------------------------------------------------- labels
// pos: [x, y, z] or a tag scene.js resolves ("head", "eiffel", "air", "up", "down", "walker")
export const LABELS = [
  { text: "Schädel?", at: T.schaedel, until: T.er1, pos: "head", side: -1 },
  { text: "Eiffelturm", at: T.eiffel + 0.3, until: T.jede, pos: "eiffel", side: 1 },
  { text: "Luftwiderstand", at: T.ab + 0.1, until: T.was, pos: "air", side: -1 },
  { text: "Passant", at: T.passant, until: T.rate, pos: "walkerTop", side: 1 },
  { text: "Luft", at: T.luft2 + 0.1, until: T.darum, pos: "up", side: 1 },
  { text: "Schwerkraft", at: T.erde, until: T.darum, pos: "down", side: -1 },
  { text: "Kuli", at: T.kuli, until: T.den, pos: "pen", side: 1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "zoom", at: 0.35, amount: 0.3 }, // the coin leaves the fingers
  { kind: "zoom", at: T.schaedel, amount: 0.35 },
  { kind: "shake", at: T.eiffel + 0.25, dur: 0.5, amp: 0.7 }, // the tower lands
  { kind: "flash", at: T.ice - 0.05 },
  { kind: "shake", at: T.ice, dur: 0.6, amp: 0.8 }, // the ICE thunders past
  { kind: "slowmo", at: T.doch, until: T.ab, speed: 0.4 }, // the coin tumbles
  { kind: "flash", at: T.vierzig },
  { kind: "zoom", at: T.fallschirm, amount: 0.3 },
  { kind: "slowmo", at: T.und, until: T.es, speed: 0.35 }, // the coin comes in
  { kind: "shake", at: T.impact, dur: 0.45, amp: 0.6 }, // tink
  { kind: "shake", at: T.voran, dur: 0.4, amp: 0.6 }, // the pen hits
  { kind: "flash", at: T.fuenfhundert },
  { kind: "shake", at: T.einschlagen, dur: 0.6, amp: 0.7 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "kling", at: 0.0, db: -4 }, // frame 0: the flicked coin rings
  { s: "rauschen", at: 0.2, dur: 2.0, db: -20 }, // wind up on the roof
  { s: "pop", at: T.eiffel + 0.05, db: -8 },
  { s: "rauschen", at: T.jede, dur: 1.0, db: -17 }, // air rushing past
  { s: "rauschen", at: T.ice - 1.0, dur: 2.2, db: -10 }, // the ICE roars past
  { s: "klack", at: T.ice + 0.25, db: -14 },
  { s: "rauschen", at: T.ab, dur: 1.4, db: -18 },
  { s: "pop", at: T.fallschirm + 0.05, db: -9 }, // the parachute opens
  { s: "click", at: T.darum + 0.1, db: -10 }, // stopwatch starts
  { s: "tink", at: T.impact, db: -4 }, // the coin bounces off the head
  { s: "boing", at: T.impact + 0.12, db: -16 },
  { s: "tink", at: T.impact + 0.85, db: -12 }, // … and lands on the pavement
  { s: "klack", at: T.voran, db: -8 }, // the pen hits the soil
  { s: "pop", at: T.fakt + 0.5, db: -10 }, // the umbrella opens
  { s: "rauschen", at: T.fakt, dur: 6.4, db: -15 }, // the rain
];
