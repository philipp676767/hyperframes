// #41 Handy ins Wasser — every time-keyed decision as plain data (scene.js +
// scripts/build-sfx.mjs). No three.js / DOM here.
import { W } from "./timing.js";

// places: the bathroom (tub at the origin, rim top y = 0) and MAC = the
// macro lab far below the floor: a giant cut of the phone's bottom edge with
// the charging port (front face at z = 0, port centred at x = 0, y = 0.8)
export const MAC = [0, -80, 0];
const M = (x, y, z) => [x + MAC[0], y + MAC[1], z + MAC[2]];

// ---------------------------------------------------------------- beats
export const T = {
  platsch: W("Platsch"),
  badewanne: W("Badewanne", 1),
  und1: W("Und", 1),
  reis1: W("Reis", 1),
  der1: W("Der", 1),
  geld: W("Geld"),
  erst: W("Erst"),
  nichts: W("nichts"),
  dein2: W("Dein", 2),
  abgedichtet: W("abgedichtet"),
  aber: W("Aber"),
  sauberes: W("sauberes"),
  seifenwasser: W("Seifenwasser"),
  ritze: W("Ritze"),
  ladebuchse: W("Ladebuchse"),
  folge: W("Folge"),
  nur2: W("Nur", 2),
  kabel1: W("Kabel", 1),
  zack: W("zack"),
  strom: W("Strom"),
  kontakte: W("Kontakte"),
  wie: W("Wie", 1),
  rost: W("Rost"),
  zeitraffer: W("Zeitraffer"),
  rate: W("Rate"),
  lebt: W("lebt"),
  manchmal: W("Manchmal"),
  tage: W("Tage"),
  dann1: W("Dann", 1),
  aus: W("aus"),
  und3: W("Und", 3),
  reis2: W("Reis", 2),
  zieht: W("zieht"),
  dafuer: W("Dafür"),
  reisstaub: W("Reisstaub"),
  sogar: W("Sogar"),
  apple: W("Apple"),
  finger: W("Finger"),
  also: W("Also"),
  kabel2: W("Kabel", 2),
  buchse2: W("Buchse", 2),
  einen: W("einen"),
  warten: W("warten"),
  dann2: W("Dann", 2),
  ueberlebt: W("überlebt"),
  fakt: W("Übrigens"),
  streifen: W("Streifen"),
  rot: W("rot"),
  klo: W("Klo"),
};

// slow motions (speed 0.35 / 0.4): scene time runs slower inside them.
// The first fall hits the water at scene time HIT1 (in the first slowmo),
// the replay on "Platsch" at HIT2, the drop into the rice at HIT3.
export const SLOW1 = { at: 0.2, until: 1.3, speed: 0.35 };
export const SLOW2 = { at: T.platsch, until: T.und1, speed: 0.35 };
export const SLOW3 = { at: T.und3, until: T.zieht, speed: 0.4 };
export const HIT1 = 0.42;
export const HIT2 = T.platsch + 0.16;
export const HIT3 = T.und3 + 0.15;
const real = (s, scene) => s.at + (scene - s.at) / s.speed;
export const PLUG_IN = T.kabel1 + 0.45; // the plug slides home ("Kabel rein – zack")

// ---------------------------------------------------------------- shots
export const shots = [
  // hook: the phone slips out of your hand over the foam — push in fast
  { at: 0, from: [3.2, 3.9, 6.2], to: [2.5, 2.7, 4.5], look: [0.8, 0.5, 0.0] },
  // it sinks: looking down through the water, bubbles rising
  { at: SLOW1.until, from: [1.6, 2.9, 2.4], to: [1.25, 2.3, 1.75], look: [0.8, -1.8, 0.2] },
  // "Platsch": replay at water level, slow motion
  { at: T.platsch, from: [3.3, 1.25, 3.4], to: [2.9, 1.05, 2.9], look: [0.8, -0.2, 0.2] },
  // "Und du greifst zum Reis?": your hand goes for the rice bowl
  { at: T.und1, from: [3.0, 2.3, 5.8], to: [3.5, 1.9, 5.0], look: [6.1, -0.1, 0.8], whip: 1 },
  // "Der kann dich Geld kosten": close on the rice
  { at: T.der1, from: [7.0, 1.3, 3.1], to: [6.8, 1.0, 2.6], look: [6.3, -0.3, 0.9] },
  // "Erst mal: nichts." — the phone lies on the tub floor, screen still on (quiet)
  { at: T.erst, from: [1.05, 3.6, 1.9], to: [0.95, 3.0, 1.35], look: [0.8, -2.3, 0.15] },
  // "Dein Handy ist abgedichtet": whip into the macro lab, the giant edge
  { at: T.dein2, from: M(4.6, 2.0, 8.0), to: M(3.4, 1.6, 6.4), look: M(0, 0.7, 0), whip: 1 },
  // "Aber nur gegen sauberes, stilles Wasser": along the gasket seam
  { at: T.aber, from: M(-5.6, 1.6, 4.6), to: M(-4.6, 1.3, 3.8), look: M(-2.2, 0.8, 0) },
  // "Seifenwasser kriecht durch jede Ritze": low, the water creeping along
  {
    at: T.seifenwasser,
    from: M(5.2, 0.9, 4.8),
    to: M(4.0, 0.7, 3.8),
    look: M(1.2, 0.5, 0.1),
    whip: -1,
  },
  // "bis in die Ladebuchse": crash in towards the port
  { at: T.ladebuchse, from: M(1.6, 2.8, 8.4), to: M(0.8, 2.0, 5.6), look: M(0, 0.75, -0.8) },
  // follow line: slow orbit in front of the flooded port
  { at: T.folge, orbit: { c: M(0, 0.7, -0.6), r: 6.2, y: M(0, 2.1, 0)[1], a0: 0.55, a1: -0.15 } },
  // "Nur kurz testen, ob's noch lädt?": the wet phone on the towel, plug in hand
  { at: T.nur2, from: [-3.4, 1.9, 4.4], to: [-4.0, 1.5, 3.7], look: [-6.0, -0.45, 0.6] },
  // "Kabel rein – zack": macro on the port as the plug goes in
  { at: T.kabel1, from: [-3.9, 0.65, 2.7], to: [-4.25, 0.45, 2.25], look: [-5.5, -0.4, 0.6] },
  // "Strom und Wasser": inside the port, sparks in the water
  { at: T.strom, from: M(1.1, 1.75, 3.2), to: M(0.7, 1.45, 2.3), look: M(0, 0.72, -1.3), whip: 1 },
  // "fressen die Kontakte auf": tight on the pins
  { at: T.kontakte, from: M(-0.8, 1.6, 2.2), to: M(-0.5, 1.4, 1.6), look: M(0, 0.75, -1.4) },
  // "Wie Rost im Zeitraffer": the green crust grows, slow orbit
  { at: T.wie, from: M(0.9, 1.5, 2.0), to: M(0.4, 1.4, 1.5), look: M(0, 0.78, -1.4) },
  // "Rate mal, wie lange es danach noch lebt" — quiet push-in on the towel
  { at: T.rate, from: [-4.6, 1.9, 3.6], to: [-5.2, 1.35, 2.7], look: [-6.3, -0.45, 0.6] },
  // "Manchmal noch ein paar Tage": the lock screen counts the days
  { at: T.manchmal, from: [-6.0, 1.6, 2.15], to: [-6.15, 1.3, 1.8], look: [-6.3, -0.45, 0.62] },
  // "Dann: aus." — the screen dies
  { at: T.dann1, from: [-4.9, 2.2, 2.7], to: [-5.2, 1.85, 2.3], look: [-6.3, -0.45, 0.6] },
  // "Und der Reis?": into the rice bowl, slow motion
  { at: T.und3, from: [3.4, 2.8, 6.4], to: [3.9, 2.3, 5.4], look: [5.7, 0.9, 1.0], whip: -1 },
  // "Der zieht kaum Wasser raus": the phone stuck in the rice
  { at: T.zieht, from: [7.9, 1.25, 2.8], to: [7.5, 1.0, 2.35], look: [6.3, -0.15, 0.9] },
  // "Dafür kriecht Reisstaub in die Buchse": macro, dust drifts into the port
  { at: T.dafuer, from: M(-2.8, 1.7, 4.8), to: M(-1.8, 1.25, 3.6), look: M(0, 0.6, -0.4) },
  // "Sogar Apple sagt: Finger weg." — the bowl gets its ✕
  { at: T.sogar, from: [3.2, 3.0, 6.6], to: [3.7, 2.6, 5.6], look: [6.2, 0.4, 0.9] },
  // "Also: Kabel weg": back at the towel, the hand pulls the plug
  { at: T.also, from: [-3.7, 1.5, 3.5], to: [-4.1, 1.25, 3.0], look: [-6.0, -0.25, 0.6] },
  // "Buchse nach unten": the phone stands up, water drips out of the port
  { at: T.buchse2, from: [-4.2, 0.7, 3.8], to: [-4.5, 0.5, 3.1], look: [-6.3, -0.1, 0.62] },
  // "einen Tag warten": the room, the window runs through a night (time-lapse)
  { at: T.einen, from: [1.6, 3.0, 9.6], to: [1.0, 3.0, 8.6], look: [-1.6, 4.0, -2.0] },
  // "Dann überlebt es meistens": front-on, the screen lights up
  { at: T.dann2, from: [-4.5, 1.1, 4.0], to: [-4.9, 0.9, 3.3], look: [-6.3, 0.35, 0.62] },
  // Übrigens: macro on the water indicator inside the phone
  { at: T.fakt, from: M(5.0, 3.4, 0.9), to: M(4.3, 2.7, 0.2), look: M(3.4, 1.6, -2.2), whip: 1 },
  // "… der bei Wasser rot wird": tight, it turns red
  { at: T.rot, from: M(4.0, 2.25, -0.9), to: M(3.8, 2.0, -1.2), look: M(3.4, 1.6, -2.2) },
  // CTA: pull back over the bathroom, foam, duck and the phone on the towel
  {
    at: T.klo,
    from: [-3.4, 2.4, 5.6],
    to: [-1.6, 6.6, 13.5],
    look: [-5.6, 0.0, 0.5],
    lookTo: [-4.2, 0.4, -0.4],
  },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Dichtung", at: T.abgedichtet, until: T.sauberes, pos: M(-3.6, 1.36, 0.06), side: -1 },
  { text: "Ladebuchse", at: T.ladebuchse, until: T.folge + 0.6, pos: M(1.45, 1.25, 0.05), side: 1 },
  { text: "Kontakte", at: T.kontakte, until: T.wie, pos: M(0.25, 0.87, -1.3), side: 1 },
  { text: "Reisstaub", at: T.reisstaub, until: T.sogar, pos: M(-0.7, 1.0, 0.7), side: -1 },
  { text: "Wasser-Indikator", at: T.streifen, until: T.klo, pos: M(3.4, 1.63, -2.25), side: -1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "slowmo", ...SLOW1 }, // the phone hits the water
  { kind: "shake", at: real(SLOW1, HIT1), dur: 0.5, amp: 0.9 },
  { kind: "zoom", at: real(SLOW1, HIT1) + 0.02, amount: 0.25 },
  { kind: "slowmo", ...SLOW2 }, // "Platsch" replay
  { kind: "zoom", at: real(SLOW2, HIT2), amount: 0.3 },
  { kind: "zoom", at: T.ladebuchse, amount: 0.3 }, // crash into the port
  { kind: "flash", at: PLUG_IN + 0.25 }, // "zack"
  { kind: "shake", at: PLUG_IN + 0.25, dur: 0.45, amp: 0.8 },
  { kind: "shake", at: T.aus, dur: 0.5, amp: 0.7 }, // the screen dies
  { kind: "zoom", at: T.aus, amount: 0.22 },
  { kind: "slowmo", ...SLOW3 }, // into the rice
  { kind: "shake", at: real(SLOW3, HIT3), dur: 0.35, amp: 0.5 },
  { kind: "zoom", at: T.apple, amount: 0.25 },
  { kind: "flash", at: T.ueberlebt + 0.05 }, // the screen comes back
  { kind: "flash", at: T.rot + 0.1 }, // the strip turns red
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "whoosh", at: 0.0, db: -8 }, // frame 0: the phone slips
  { s: "platsch", at: real(SLOW1, HIT1) - 0.02 }, // own: the phone hits the water
  { s: "rauschen", at: SLOW1.until, dur: T.platsch - SLOW1.until, db: -22 }, // bubbles under water
  { s: "platsch", at: real(SLOW2, HIT2) - 0.02, db: -10 }, // replay
  { s: "rauschen", at: T.erst, dur: T.dein2 - T.erst, db: -26 }, // quiet bubbles on the tub floor
  { s: "click", at: PLUG_IN }, // the plug clicks home
  { s: "zisch", at: PLUG_IN + 0.25, dur: 0.6, db: -14 }, // spark
  { s: "surr", at: T.strom, dur: T.rate - T.strom - 0.2, db: -22 }, // current in the water
  { s: "aus", at: T.aus }, // own: the phone powers down
  { s: "reis", at: real(SLOW3, HIT3) - 0.03 }, // own: the phone lands in the rice
  { s: "klack", at: T.kabel2 + 0.3 }, // the plug is pulled
  { s: "pop", at: T.buchse2 + 0.35 }, // the phone stands up
];
