// #34 Handy-Akku — every time-keyed decision as plain data (scene.js +
// scripts/build-sfx.mjs). No three.js / DOM here.
import { W } from "./timing.js";

// places: the phone on the dresser is the origin; the battery's inside
// (CELL) is a dark lab box under the floor; OUT = the snowy tram stop
export const CELL = [0, -60, 0];
export const OUT = [5, -4.6, -9.2];
const C = (x, y, z) => [x + CELL[0], y + CELL[1], z + CELL[2]];
const O = (x, y, z) => [x + OUT[0], y + OUT[1], z + OUT[2]];

// ---------------------------------------------------------------- beats
export const T = {
  bremst: W("bremst", 1),
  laden: W("Laden"),
  absichtlich: W("absichtlich"),
  erst: W("Erst"),
  kriecht: W("kriecht"),
  wuerde: W("Würde"),
  brennen: W("brennen"),
  stell: W("Stell"),
  leer: W("leer"),
  kabel: W("Kabel"),
  rein1: W("rein", 1),
  deinem: W("deinem"),
  schichten1: W("Schichten", 1),
  folie1: W("Folie", 1),
  duenner: W("dünner"),
  haar: W("Haar"),
  jetzt: W("Jetzt"),
  schiessen: W("schießen"),
  ionen1: W("Ionen", 1),
  folg: W("Folg"),
  drueben: W("Drüben"),
  kohlenstoff: W("Kohlenstoff"),
  parkhaus1: W("Parkhaus", 1),
  anfang: W("Anfang"),
  rein2: W("Rein", 2),
  zack: W("zack"),
  halb: W("Halb"),
  aber: W("Aber"),
  laenger: W("länger"),
  trotzdem: W("trotzdem"),
  rate: W("Rate"),
  draussen1: W("Draußen", 1),
  metall: W("Metall"),
  wachsen: W("wachsen"),
  sticht: W("Sticht"),
  kurzschluss: W("Kurzschluss"),
  darum1: W("Darum", 1),
  achtzig: W("80"),
  runter: W("runter"),
  kaelte: W("Kälte"),
  traege: W("träge"),
  montag: W("Montag"),
  darum2: W("Darum", 2),
  zwanzig: W("20"),
  aus2: W("aus", 2),
  es: W("Es"),
  parkplaetze: W("Parkplätze"),
  fakt: W("Übrigens"),
  nobel: W("Nobelpreis"),
  n97: W("97"),
  cta: W("Wie", 3),
};

// ---------------------------------------------------------------- shots
export const shots = [
  // hook: hand plugs in, the % races and slams on the brakes — push in fast
  { at: 0, from: [1.9, 1.5, 3.6], to: [1.05, 1.35, 2.35], look: [0, 1.25, 0], zoom: 1.65 },
  // macro on the screen: 80 % crawling, sparks at the port
  { at: T.laden, from: [0.55, 1.75, 1.55], to: [0.35, 1.7, 1.25], look: [0, 1.55, 0], zoom: 1.25 },
  // "absichtlich": low at the port, the current beads crawl
  {
    at: T.absichtlich,
    from: [1.3, 0.45, 1.9],
    to: [1.0, 0.55, 1.5],
    look: [0, 0.6, 0.4],
    zoom: 1.3,
  },
  // "Erst rast der Akku hoch": low side view, the meter races
  {
    at: T.erst,
    orbit: { c: [0, 1.3, 0], r: 2.6, y: 0.9, a0: -0.9, a1: -0.45 },
    zoom: 1.6,
    whip: 1,
  },
  // "dann kriecht er": quiet top-down
  { at: T.kriecht, from: [-0.4, 3.0, 1.9], to: [-0.3, 2.7, 1.6], look: [0, 1.3, 0], zoom: 1.5 },
  // "Würde er weiterrasen": the phone overheats
  { at: T.wuerde, from: [2.0, 1.1, 2.7], to: [1.3, 1.25, 2.1], look: [0, 1.35, 0], zoom: 1.7 },
  // story: the hallway at 7:41, the tram passes the window
  { at: T.stell, from: [7.5, 4.6, 11.5], to: [6.2, 3.9, 9.6], look: [0, 1.6, -2.5] },
  { at: T.leer, from: [0.5, 1.6, 1.85], to: [0.35, 1.55, 1.55], look: [0, 1.45, 0], zoom: 1.35 },
  // "Kabel rein": the hand plugs it in
  { at: T.kabel, from: [2.3, 1.5, 3.2], to: [1.9, 1.2, 2.7], look: [0.1, 0.7, 0.3], zoom: 1.6 },
  // x-ray: the battery inside the phone
  { at: T.deinem, orbit: { c: [0, 1.4, 0], r: 3.0, y: 1.9, a0: -0.55, a1: 0.15 }, zoom: 1.6 },
  // whip into the battery's inside — seen from the front, the film edge-on
  {
    at: T.schichten1,
    from: C(4.2, 6.6, 13),
    to: C(3.2, 5.6, 11),
    look: C(0, 1.8, 0),
    zoom: 1.0,
    whip: 1,
  },
  // the film (a thin line) next to a hair
  {
    at: T.folie1,
    from: C(-0.7, 2.7, 5.6),
    to: C(-0.45, 2.45, 4.6),
    look: C(-0.35, 2.1, 0.8),
    zoom: 1.0,
  },
  // money shot: the ions shoot through the film (slow motion)
  { at: T.jetzt, from: C(-0.9, 1.4, 6.4), to: C(0.2, 1.65, 5.4), look: C(0, 1.9, 0), zoom: 1.0 },
  {
    at: T.ionen1,
    orbit: { c: C(0.4, 1.9, 0), r: 9.5, y: C(0, 4.6, 0)[1], a0: 0.45, a1: -0.05 },
    zoom: 1.0,
  },
  // the far side: the carbon layers
  { at: T.drueben, from: C(5.6, 3.7, 7.8), to: C(4.9, 3.3, 6.8), look: C(3.0, 1.9, 0), zoom: 1.0 },
  // "wie Autos in einem Parkhaus": whip to the garage front
  {
    at: T.parkhaus1,
    from: C(3.0, 2.3, 8.8),
    to: C(3.0, 2.15, 7.4),
    look: C(3.0, 2.0, 0),
    zoom: 1.0,
    whip: -1,
  },
  // "Am Anfang ist alles frei": the empty top deck
  { at: T.anfang, from: C(3.5, 6.2, 5.8), to: C(3.3, 5.7, 4.8), look: C(3.0, 3.0, 0), zoom: 1.0 },
  // "Rein, zack, geparkt": macro on one slot
  { at: T.rein2, from: C(1.4, 2.1, 3.8), to: C(1.7, 1.9, 3.1), look: C(1.95, 1.4, 0.9), zoom: 1.0 },
  // "Halb voll in einer halben Stunde"
  { at: T.halb, from: C(7.2, 4.6, 9.2), to: C(6.3, 4.1, 8.2), look: C(2.0, 1.8, 0), zoom: 1.0 },
  // [whispers] the garage fills, cars circle: slow, quiet
  { at: T.aber, from: C(2.4, 6.2, 9.6), to: C(2.2, 5.6, 8.5), look: C(1.6, 2.2, 0), zoom: 1.0 },
  // "trotzdem reinquetschst": push in on the jam
  {
    at: T.trotzdem,
    from: C(0.4, 2.5, 6.2),
    to: C(0.6, 2.25, 4.7),
    look: C(0.8, 2.0, 0),
    zoom: 1.0,
  },
  // "Rate mal": hold on the gap between film and garage
  { at: T.rate, from: C(0.3, 2.7, 7.2), to: C(0.3, 2.55, 6.5), look: C(0.5, 2.1, 0), zoom: 1.0 },
  // "Draußen. Als Metall."
  {
    at: T.draussen1,
    from: C(-0.2, 2.6, 5.4),
    to: C(0.1, 2.45, 4.6),
    look: C(0.8, 2.2, 0.2),
    zoom: 1.0,
  },
  // "Daraus wachsen Nadeln" (slow motion)
  {
    at: T.wachsen,
    from: C(0.4, 2.35, 4.6),
    to: C(0.45, 2.22, 3.8),
    look: C(0.5, 2.1, 0.3),
    zoom: 1.0,
  },
  // "Sticht eine durch die Folie"
  {
    at: T.sticht,
    from: C(0.15, 2.3, 2.3),
    to: C(0.1, 2.2, 1.8),
    look: C(0.0, 2.0, 0.4),
    zoom: 1.0,
  },
  // KURZSCHLUSS
  {
    at: T.kurzschluss,
    from: C(1.4, 3.4, 8.0),
    to: C(1.8, 3.9, 9.6),
    look: C(0, 1.9, 0),
    zoom: 1.0,
  },
  // back on the dresser: 80 %, the current goes down
  { at: T.darum1, from: [2.8, 2.3, 3.9], to: [2.2, 1.95, 3.1], look: [0, 1.3, 0], zoom: 1.5 },
  // "bei Kälte": whip outside to the snowy tram stop
  {
    at: T.kaelte,
    from: O(1.6, 3.0, 2.6),
    to: O(1.2, 2.8, 2.1),
    look: O(0, 2.5, 0),
    zoom: 1.5,
    whip: 1,
  },
  // inside the cold battery: the ions crawl
  { at: T.traege, from: C(5.2, 3.7, 8.2), to: C(4.8, 3.3, 7.2), look: C(1.6, 1.9, 0), zoom: 1.0 },
  // outside: 20 % … and black
  { at: T.darum2, from: O(0.7, 2.85, 1.7), to: O(0.5, 2.75, 1.4), look: O(0, 2.6, 0), zoom: 1.3 },
  // payoff: the full garage, every slot green
  {
    at: T.es,
    orbit: { c: C(1.2, 1.9, 0), r: 9.5, y: C(0, 4.8, 0)[1], a0: 0.6, a1: 0.1 },
    zoom: 1.0,
  },
  // Übrigens: the medal on the dresser
  { at: T.fakt, from: [2.6, 1.7, 3.8], to: [2.0, 1.5, 3.1], look: [0.8, 1.0, 0.6], zoom: 1.5 },
  // CTA: the phone, 100 %, then pull back through the hallway
  {
    at: T.cta,
    from: [0.9, 1.7, 3.6],
    to: [6.5, 4.8, 12.5],
    look: [0, 1.4, 0],
    lookTo: [0, 1.6, -2],
  },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Akku", at: T.deinem + 0.3, until: T.schichten1, pos: [0, 1.35, 0.02], side: 1 },
  { text: "Folie", at: T.folie1, until: T.jetzt, pos: C(0, 3.8, 1.8), side: 1 },
  { text: "Haar", at: T.haar - 0.2, until: T.jetzt, pos: C(-0.9, 3.4, 2.3), side: -1 },
  { text: "Ionen", at: T.ionen1, until: T.folg, pos: C(-0.6, 2.0, 0.5), side: -1 },
  { text: "Kohlenstoff", at: T.kohlenstoff, until: T.parkhaus1, pos: C(2.2, 2.1, 2.3), side: 1 },
  { text: "Metall", at: T.metall, until: T.wachsen, pos: C(1.0, 2.0, 0.4), side: 1 },
  { text: "Nadel", at: T.wachsen + 0.6, until: T.sticht, pos: C(0.3, 2.0, 0.4), side: -1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "zoom", at: T.bremst, amount: 0.3 },
  { kind: "shake", at: 0.75, dur: 0.45, amp: 0.9 }, // the hard brake
  { kind: "shake", at: T.brennen, dur: 0.6, amp: 1.1 },
  { kind: "zoom", at: T.rein1, amount: 0.25 },
  { kind: "flash", at: T.schiessen },
  { kind: "slowmo", at: T.schiessen + 0.1, until: T.ionen1, speed: 0.35 },
  { kind: "zoom", at: T.zack, amount: 0.3 },
  { kind: "shake", at: T.trotzdem, dur: 0.5, amp: 0.5 },
  { kind: "slowmo", at: T.wachsen, until: T.sticht, speed: 0.4 },
  { kind: "flash", at: T.kurzschluss },
  { kind: "shake", at: T.kurzschluss, dur: 0.7, amp: 1.2 },
  { kind: "zoom", at: T.zwanzig, amount: 0.25 },
  { kind: "zoom", at: T.n97, amount: 0.3 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "ladezap", at: 0.0 }, // frame 0: the charger bites
  { s: "quietsch", at: 0.72, db: -9 }, // the % slams on the brakes
  { s: "funken", at: 0.74, db: -12 },
  { s: "zisch", at: T.brennen - 0.2, dur: 0.9, db: -14 },
  { s: "click", at: T.rein1 + 0.05 },
  { s: "ladezap", at: T.rein1 + 0.1, db: -8 },
  { s: "pop", at: T.schichten1 + 0.15 },
  { s: "pop", at: T.folie1 + 0.1 },
  { s: "pop", at: T.haar - 0.1 },
  { s: "surr", at: T.schiessen, dur: T.ionen1 - T.schiessen, db: -19 },
  { s: "klack", at: T.zack + 0.05 },
  { s: "brumm", at: T.trotzdem, dur: 1.6, db: -18 },
  { s: "klack", at: T.metall + 0.05, db: -10 },
  { s: "funken", at: T.kurzschluss, db: -4 },
  { s: "rauschen", at: T.kaelte, dur: 1.6, db: -20 },
  { s: "rauschen", at: T.darum2, dur: 2.8, db: -22 },
  { s: "klack", at: T.aus2, db: -8 }, // the cold phone dies
  { s: "pop", at: T.fakt + 0.15 },
];
