// #40 Pfandautomat — every time-keyed decision as plain data (scene.js +
// scripts/build-sfx.mjs). No three.js / DOM here.
import { W } from "./timing.js";

// ---------------------------------------------------------------- places
// The machine stands at the origin, front face at z = 0.2, built into the
// wall behind it. The bottle lies along z on two rails at y = 1.5 and is
// pushed bottom-first through the stations inside:
export const AXIS_Y = 1.5;
export const OPEN_Z = 0.2; // the insert opening (front face)
export const RING_Z = -0.55; // ring of cameras + barcode laser + interrogation lamp
export const CHECK_Z = -0.95; // logo light + scale
export const PRESS_Z = -1.42; // the press, the bin below it
// where the label (barcode + logo) sits when the bottle rests at the ring
export const LABEL_Z = RING_Z + 0.12;
// analogy corner (printer, ink can) right in front of the machine wall
export const SIDE = [4.4, 0, 2.3];
// the shoppers' three bags of empties
export const BAGS = [1.9, 0, 1.5];
const S = (a) => a.map((v, i) => v + SIDE[i]); // point relative to the analogy corner

// ---------------------------------------------------------------- beats
export const T = {
  pfandflasche: W("Pfandflasche"),
  automat1: W("Automat", 1),
  er1: W("Er", 1),
  betrueger1: W("Betrüger", 1),
  stell: W("Stell"),
  supermarkt: W("Supermarkt"),
  drei: W("drei"),
  saecke1: W("Säcke", 1),
  hinter: W("Hinter"),
  schlange: W("Schlange"),
  automat2: W("Automat", 2),
  muelleimer: W("Mülleimer"),
  er2: W("Er", 2),
  detektiv: W("Detektiv"),
  und1: W("und", 1),
  verhoert: W("verhört"),
  folg: W("Folg"),
  erste: W("Erste"),
  wer: W("Wer"),
  ring: W("Ring"),
  kameras: W("Kameras"),
  form1: W("Form", 1),
  farbe: W("Farbe"),
  groesse: W("Größe"),
  dann1: W("Dann", 1),
  strichcode1: W("Strichcode", 1),
  cola: W("Cola"),
  cent: W("Cent"),
  sicher: W("Sicher"),
  noe: W("Nö"),
  einen: W("Einen", 2),
  ausdrucken: W("ausdrucken"),
  genau: W("Genau"),
  kassiert: W("kassiert"),
  rate: W("Rate"),
  an: W("An"),
  logo: W("Logo"),
  es: W("Es"),
  spezialfarbe: W("Spezialfarbe"),
  die: W("die", 2),
  druckereien: W("Druckereien"),
  automat3: W("Automat", 3),
  licht: W("Licht"),
  eine: W("eine"),
  kopie: W("Kopie"),
  fliegt: W("fliegt"),
  dann2: W("Dann", 2),
  wiegt: W("wiegt"),
  saft: W("Saft"),
  erst: W("Erst"),
  passt: W("passt"),
  zack: W("zack"),
  presse: W("Presse"),
  verrueckte: W("Verrückte"),
  zerquetscht: W("zerquetscht"),
  nur: W("Nur", 2),
  erkennen: W("erkennen"),
  und3: W("und", 3),
  form2: W("Form", 2),
  fakt: W("Übrigens"),
  deutschland: W("Deutschland"),
  zahl: W("98"),
  wie: W("Wie"),
  saecke2: W("Säcke", 2),
  kommentare: W("Kommentare"),
};

// scene-time moments of the press (inside the slow motion from T.zack:
// scene time runs at 0.3 × there, see HIGHLIGHTS)
export const SLOW = 0.3;
export const PRESS = {
  move: T.zack + 0.02, // bottle slides from the scale into the press
  slam: T.zack + 0.12, // plate comes down
  flat: T.zack + 0.2, // fully crushed
  drop: T.verrueckte + 0.15, // trap door opens (after the slow motion)
};

// ---------------------------------------------------------------- shots
// inside the machine the camera stays within x ±0.9, z −1.7…0.15
export const shots = [
  // hook: the whole machine, the crushed bottle shooting back out at you
  { at: 0, from: [1.25, 1.85, 4.3], to: [0.75, 1.72, 3.1], look: [0, 1.62, 0.2], zoom: 1.0 },
  // "Pfandflasche": the bottle flies right at you
  {
    at: T.pfandflasche,
    from: [-0.75, 1.8, 3.4],
    to: [-0.55, 1.85, 3.05],
    look: [0.35, 1.8, 1.9],
    zoom: 1.0,
  },
  // slow motion: the bottle tumbles to the floor, ring red behind it
  {
    at: T.automat1,
    from: [-0.9, 0.75, 4.1],
    to: [-0.75, 0.7, 3.8],
    look: [0.7, 0.75, 2.6],
    zoom: 1.0,
  },
  // "Er hält dich nämlich für einen Betrüger": the screen squints at you
  { at: T.er1, from: [0.42, 2.5, 2.05], to: [0.24, 2.47, 1.7], look: [0, 2.45, 0.2], zoom: 1.0 },
  // "Stell dir vor: Supermarkt": the whole empties corner
  {
    at: T.stell,
    from: [5.4, 3.6, 9.6],
    to: [4.0, 3.0, 7.7],
    look: [-1.2, 1.7, -0.6],
    zoom: 1.0,
    whip: 1,
  },
  // "drei Säcke Leergut": by the bags
  { at: T.drei, from: [3.9, 1.5, 5.2], to: [3.5, 1.4, 4.6], look: [1.3, 0.9, 0.9], zoom: 1.0 },
  // "Hinter dir wird die Schlange länger"
  {
    at: T.hinter,
    from: [-0.6, 1.9, 7.2],
    to: [-1.3, 1.85, 6.3],
    look: [-5.6, 1.4, 3.1],
    zoom: 1.0,
  },
  // "Der Automat ist kein Mülleimer"
  {
    at: T.automat2,
    from: [0.7, 1.9, 5.9],
    to: [0.35, 1.8, 5.1],
    look: [-0.85, 1.2, 0.6],
    zoom: 1.0,
  },
  // "Er ist ein Detektiv": the hat lands on the machine
  { at: T.er2, from: [1.5, 3.55, 3.9], to: [1.15, 3.4, 3.2], look: [0, 3.05, -0.6], zoom: 1.0 },
  // "… und deine Flasche wird verhört": x-ray, the bottle slides into the ring
  { at: T.und1, from: [2.7, 2.2, 2.7], to: [2.15, 2.0, 2.05], look: [0, 1.45, -0.45], zoom: 1.0 },
  // follow line: the open side — all the stations in the dark chamber
  {
    at: T.folg,
    from: [1.95, 1.9, 0.25],
    to: [1.75, 1.82, -0.1],
    look: [0, 1.5, -0.6],
    zoom: 1.0,
    inside: true,
  },
  // "Erste Frage: Wer bist du?" — the interrogation lamp
  {
    at: T.erste,
    from: [1.3, 2.45, -0.05],
    to: [1.15, 2.3, -0.18],
    look: [0, 1.75, RING_Z],
    zoom: 1.0,
    inside: true,
  },
  // "Ein Ring aus Kameras": from behind the ring, looking out
  {
    at: T.ring,
    from: [0.32, 1.7, -1.3],
    to: [0.24, 1.64, -1.12],
    look: [0, AXIS_Y, RING_Z],
    zoom: 1.0,
    inside: true,
  },
  // "Form, Farbe, Größe"
  {
    at: T.form1,
    from: [1.25, 1.25, 0.12],
    to: [1.08, 1.32, -0.02],
    look: [0, AXIS_Y, RING_Z],
    zoom: 1.0,
    inside: true,
  },
  // "Dann liest er den Strichcode": the red laser sweeps
  {
    at: T.dann1,
    from: [1.0, 1.58, LABEL_Z + 0.1],
    to: [0.84, 1.55, LABEL_Z + 0.04],
    look: [0.1, AXIS_Y, LABEL_Z],
    zoom: 1.0,
    whip: 1,
    inside: true,
  },
  // "Cola, ein Liter, 25 Cent Pfand"
  {
    at: T.cola,
    from: [1.65, 1.95, 0.25],
    to: [1.45, 1.85, 0.08],
    look: [0, AXIS_Y, -0.4],
    zoom: 1.0,
    inside: true,
  },
  // "Sicher? Nö." — outside, the screen: ✓ … ✕
  { at: T.sicher, from: [0.95, 2.2, 3.1], to: [0.72, 2.1, 2.55], look: [0, 1.95, 0.2], zoom: 1.0 },
  // "Einen Strichcode kann jeder ausdrucken": the printer at home
  {
    at: T.einen,
    from: S([1.75, 1.75, 2.3]),
    to: S([1.3, 1.6, 1.8]),
    look: S([-0.3, 1.0, 0]),
    zoom: 1.0,
  },
  // "Genau so haben Betrüger früher kassiert": fake in, receipt comes out … and out
  { at: T.genau, from: [1.5, 1.45, 2.75], to: [1.15, 1.35, 2.2], look: [0, 1.15, 0.2], zoom: 1.0 },
  // "Rate mal, woran sie heute scheitern": crash zoom onto the logo
  {
    at: T.rate,
    from: [1.3, 2.0, LABEL_Z + 0.3],
    to: [0.75, 1.8, LABEL_Z + 0.2],
    look: [0.1, 1.6, LABEL_Z],
    zoom: 1.0,
    inside: true,
  },
  // "An diesem kleinen Logo"
  {
    at: T.an,
    from: [0.62, 1.95, LABEL_Z + 0.18],
    to: [0.52, 1.88, LABEL_Z + 0.1],
    look: [0.08, 1.62, LABEL_Z - 0.03],
    zoom: 1.0,
    inside: true,
  },
  // "Es ist mit einer Spezialfarbe gedruckt": the logo light, logo glows green
  {
    at: T.es,
    from: [1.5, 2.15, -0.45],
    to: [1.3, 1.98, -0.62],
    look: [0, 1.62, CHECK_Z],
    zoom: 1.0,
    inside: true,
  },
  // "die nur wenige Druckereien bekommen": the locked ink can
  {
    at: T.die,
    from: S([-1.5, 1.5, 1.9]),
    to: S([-1.15, 1.35, 1.45]),
    look: S([0.1, 0.95, 0]),
    zoom: 1.0,
  },
  // "Der Automat prüft sie mit Licht"
  {
    at: T.automat3,
    from: [1.25, 1.75, -1.35],
    to: [1.08, 1.68, -1.2],
    look: [0, 1.6, CHECK_Z],
    zoom: 1.0,
    inside: true,
  },
  // "eine Kopie": the fake under the light — stays dark
  {
    at: T.eine,
    from: [1.3, 1.82, -0.55],
    to: [1.15, 1.74, -0.7],
    look: [0, 1.58, CHECK_Z],
    zoom: 1.0,
    inside: true,
  },
  // "fliegt raus": outside, the fake shoots out
  {
    at: T.fliegt,
    from: [-0.95, 1.6, 3.1],
    to: [-0.72, 1.58, 2.6],
    look: [0.2, 1.5, 0.6],
    zoom: 1.0,
    whip: -1,
  },
  // "Dann wiegt er sie sogar": low by the scale
  {
    at: T.dann2,
    from: [1.3, 1.22, -0.48],
    to: [1.15, 1.28, -0.62],
    look: [0, 1.38, CHECK_Z],
    zoom: 1.0,
    inside: true,
  },
  // "Erst wenn alles passt": a calm beat before the press
  {
    at: T.erst,
    from: [1.95, 2.3, 0.05],
    to: [1.78, 2.2, -0.12],
    look: [0, 1.5, -1.0],
    zoom: 1.0,
    inside: true,
  },
  // "zack, ab in die Presse": the press, slow motion
  {
    at: T.zack,
    from: [1.45, 1.66, -0.95],
    to: [1.34, 1.63, -1.05],
    look: [0, 1.62, PRESS_Z],
    zoom: 1.0,
    inside: true,
  },
  // "Und das Verrückte: Drinnen zerquetscht er sie dann selbst": x-ray, the bin full of crushed bottles
  {
    at: T.verrueckte,
    from: [1.7, 2.3, 3.5],
    to: [1.4, 2.05, 2.95],
    look: [0, 1.1, -1.1],
    zoom: 1.0,
  },
  // "Nur vorher muss er sie erkennen": a whole bottle → ring green
  {
    at: T.nur,
    from: [1.95, 2.35, 2.7],
    to: [1.62, 2.12, 2.15],
    look: [0, AXIS_Y, -0.3],
    zoom: 1.0,
    whip: 1,
  },
  // "und ohne ihre Form geht das nicht": a crushed one → ring red
  {
    at: T.und3,
    from: [-1.95, 2.35, 2.7],
    to: [-1.62, 2.12, 2.15],
    look: [0, AXIS_Y, -0.3],
    zoom: 1.0,
  },
  // "Übrigens …": the drone pulls back over the whole empties corner
  {
    at: T.fakt,
    from: [2.0, 2.6, 4.6],
    to: [6.6, 5.4, 12.6],
    look: [0, 1.8, -0.5],
    lookTo: [-1.2, 1.5, -2.2],
    zoom: 1.0,
  },
  // comment question: the machine with its hat, the bags, the queue
  { at: T.wie, from: [2.7, 2.05, 6.2], to: [2.05, 1.9, 5.1], look: [0.2, 1.6, 0.3], zoom: 1.0 },
];

// ---------------------------------------------------------------- labels
const Y = AXIS_Y;
export const LABELS = [
  { text: "Kameras", at: T.kameras, until: T.form1, pos: [0.24, Y + 0.24, RING_Z], side: 1 },
  { text: "Strichcode", at: T.strichcode1, until: T.cola, pos: [0.15, Y, LABEL_Z + 0.04], side: 1 },
  { text: "Pfand-Logo", at: T.logo, until: T.es, pos: [0.1, Y + 0.1, LABEL_Z - 0.06], side: 1 },
  {
    text: "Spezialfarbe",
    at: T.spezialfarbe,
    until: T.die,
    pos: [0.1, Y + 0.1, CHECK_Z - 0.06],
    side: 1,
  },
  { text: "Waage", at: T.wiegt, until: T.erst, pos: [0.25, 1.22, CHECK_Z], side: 1 },
  { text: "Presse", at: T.verrueckte + 0.1, until: T.nur, pos: [0.2, 2.38, PRESS_Z], side: 1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "shake", at: 0.12, dur: 0.45, amp: 0.9 }, // the bottle is spat out
  { kind: "zoom", at: 0.95, amount: 0.22 },
  { kind: "slowmo", at: T.automat1, until: T.er1, speed: 0.3 }, // the bottle tumbles
  { kind: "zoom", at: T.betrueger1, amount: 0.3 },
  { kind: "shake", at: T.detektiv + 0.28, dur: 0.4, amp: 0.7 }, // the hat lands
  { kind: "flash", at: T.verhoert }, // the cameras fire
  { kind: "zoom", at: T.kameras + 0.1, amount: 0.25 },
  { kind: "shake", at: T.noe, dur: 0.35, amp: 0.5 },
  { kind: "zoom", at: T.ausdrucken, amount: 0.25 },
  { kind: "flash", at: T.kassiert },
  { kind: "zoom", at: T.rate, amount: 0.4 },
  { kind: "flash", at: T.spezialfarbe + 0.1 },
  { kind: "zoom", at: T.wiegt, amount: 0.2 },
  { kind: "slowmo", at: T.zack, until: T.verrueckte, speed: SLOW }, // the press
  { kind: "flash", at: T.zack + 0.4 },
  { kind: "shake", at: T.zack + 0.4, dur: 0.6, amp: 1.0 },
  { kind: "shake", at: T.form2, dur: 0.35, amp: 0.5 },
  { kind: "zoom", at: T.zahl, amount: 0.2 },
];

// ---------------------------------------------------------------- sound
// real-time seconds (the press inside the slow motion: T.zack + 0.4 real)
export const SFX = [
  { s: "piep", at: 0.02, dur: 0.75, db: -9 }, // frame 0: the machine refuses
  { s: "klack", at: 0.08, db: -8 },
  { s: "pop", at: T.saecke1 + 0.02 },
  { s: "pop", at: T.saecke1 + 0.14 },
  { s: "pop", at: T.saecke1 + 0.26 },
  { s: "pop", at: T.muelleimer - 0.15 },
  { s: "boing", at: T.detektiv + 0.26, db: -10 },
  { s: "rauschen", at: T.und1 + 0.1, dur: 0.6, db: -20 }, // the bottle slides in
  { s: "click", at: T.verhoert },
  { s: "click", at: T.kameras + 0.05 },
  { s: "click", at: T.kameras + 0.25 },
  { s: "click", at: T.kameras + 0.45 },
  { s: "blip", at: T.form1 + 0.2 },
  { s: "blip", at: T.farbe + 0.2 },
  { s: "blip", at: T.groesse + 0.2 },
  { s: "surr", at: T.strichcode1, dur: 1.2, db: -22 }, // the laser
  { s: "piep", at: T.noe + 0.05, dur: 0.45, db: -14 },
  { s: "drucker", at: T.einen + 0.2 }, // the home printer
  { s: "pop", at: T.ausdrucken + 0.2 },
  { s: "drucker", at: T.kassiert - 0.6, db: -14 }, // the receipt keeps coming
  { s: "surr", at: T.spezialfarbe, dur: 2.0, db: -24 }, // the logo light hums
  { s: "piep", at: T.kopie + 0.2, dur: 0.5, db: -12 },
  { s: "klack", at: T.wiegt + 0.15 },
  { s: "click", at: T.passt + 0.1 },
  { s: "knirsch", at: T.zack + 0.4 }, // PET bottle crushed
  { s: "klack", at: T.verrueckte + 0.2, db: -12 }, // trap door
  { s: "blip", at: T.nur + 0.9 },
  { s: "piep", at: T.form2 - 0.2, dur: 0.5, db: -12 },
];
