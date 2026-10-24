// #27 "Was passiert eigentlich, wenn du zum tiefsten Punkt im Meer tauchst?"
// Every time-keyed decision of the video as plain data, so scene.js
// (picture), set.js (the descent) and scripts/build-sfx.mjs (sound) read the
// same numbers. No three.js / DOM here: node imports it too.
import { W } from "./timing.js";

// ---------------------------------------------------------------- beats
export const T = {
  wenn: W("wenn", 1),
  meer: W("Meer"),
  coladose: W("Coladose"),
  hebel: W("Hebel"),
  everest: W("Everest") - 0.08, // cut on "Der"
  verschwinden: W("verschwinden"),
  erst: W("Erst"),
  blau: W("blau"),
  schwarz: W("schwarz"),
  kein: W("Kein", 1),
  sonnenstrahl: W("Sonnenstrahl"),
  draussen: W("Draußen"),
  fische: W("Fische"),
  leuchten: W("leuchten"),
  dann3: W("dann", 3),
  knack: W("Knack"),
  deine: W("Deine"),
  platt: W("platt"),
  folg: W("Folg"),
  schuld: W("Schuld"),
  wasserdruck: W("Wasserdruck"),
  wasser1: W("Wasser", 1),
  seiten: W("Seiten"),
  kiste: W("Kiste"),
  zerknuellen: W("zerknüllen"),
  dein: W("Dein"),
  boot2: W("Boot", 2),
  titankugel: W("Titankugel"),
  rate: W("Was", 2),
  fahrt: W("Fahrt"),
  rund: W("Rund"),
  vier: W("vier"),
  dann4: W("dann", 4),
  elf: W("elf"),
  ab: W("Ab"),
  acht: W("acht"),
  fisch: W("Fisch"),
  trotzdem: W("trotzdem"),
  krabbelt: W("krabbelt"),
  winzige: W("winzige"),
  flohkrebse: W("Flohkrebse"),
  ganz2: W("ganz", 2),
  fingernaegel: W("Fingernägel"),
  ein: W("ein"),
  auto: W("Auto"),
  fakt: W("Übrigens"),
  forscher: W("Forscher"),
  tuete: W("Plastiktüte"),
  cta: W("Was", 4), // #3 is "noch was"
};

// ---------------------------------------------------------------- the descent
// The sub stays put (after the drop it hangs at y = -D0); the whole water
// column (`ground`: surface + ship on top, trench + seabed at the bottom)
// rises past it. off(t) = how far the column has moved up (world units).
export const D0 = 3.4; // the sub's centre below its crane position after the drop
export const SURF = 300; // surface height above the seabed in the column
export const OFF_LAND = SURF - 2.9; // the sub sits on the seabed
export const DROP = { at: 0.42, end: 0.95 }; // the crane lets go, the sub falls
export const SPLASH = 0.62; // the sub's belly hits the water
const OFF_KEYS = [
  [0.95, 0],
  [1.4, 0.9],
  [T.erst, 13],
  [T.sonnenstrahl, 22],
  [T.schuld, 52],
  [T.rate, 120],
  [T.rund, 136],
  [T.dann4, 215], // "vier Stunden": time-lapse rush
  [T.fisch - 0.6, 262],
  [T.trotzdem - 0.25, OFF_LAND - 0.5],
  [T.trotzdem + 0.1, OFF_LAND],
];
export function off(t) {
  if (t <= OFF_KEYS[0][0]) return 0;
  for (let i = 1; i < OFF_KEYS.length; i++) {
    const [t1, o1] = OFF_KEYS[i];
    if (t < t1) {
      const [t0, o0] = OFF_KEYS[i - 1];
      return o0 + ((o1 - o0) * (t - t0)) / (t1 - t0);
    }
  }
  return OFF_LAND;
}
const sm = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
// 0 = sunlit turquoise, 1 = pitch black (from "blau" to "Sonnenstrahl")
export const dark = (t) =>
  0.55 * sm((t - T.blau) / (T.schwarz + 0.2 - T.blau)) +
  0.45 * sm((t - T.schwarz - 0.2) / (T.sonnenstrahl + 0.4 - T.schwarz - 0.2));
// the sub's headlights switch on with "Kein Sonnenstrahl"
export const LIGHTS_ON = T.kein + 0.15;

// ---------------------------------------------------------------- shots
// Hook shots are in world coordinates (the sub hangs at the crane, y = 0);
// from the second shot on, every shot is relative to the sub (rel: SUB).
export const SUB = [0, -D0, 0];
export const EV = [90, -D0, 0]; // the Everest tank, far off to the side
export const shots = [
  // 0: the hand on the release lever on the ship's stern, the sub on the crane
  { at: 0, from: [2.3, 2.1, -4.9], to: [1.9, 1.8, -4.3], look: [0.5, 0.75, -1.6], zoom: 1.0 },
  // … the hook lets go: wide, the sub drops and splashes (spectacle in the first second)
  {
    at: DROP.at - 0.04,
    from: [4.8, 2.0, 4.8],
    to: [4.3, 1.4, 4.3],
    look: [0.2, -0.7, -0.4],
    zoom: 1.0,
  },
  // under water: the sub sinks out of its own splash, the surface glitters above
  {
    at: T.wenn,
    from: [2.2, -2.4, 3.0],
    to: [1.7, -1.9, 2.5],
    look: [0, 0.3, 0],
    rel: SUB,
    whip: 1,
  },
  // wide: ship above, light shafts, the sub small below it
  { at: T.meer, from: [5.6, -1.2, 7.4], to: [4.8, -0.6, 6.2], look: [0, 1.6, -1.5], rel: SUB },
  // the can strapped to the sub's arm
  {
    at: T.coladose,
    from: [3.0, 0.3, 3.2],
    to: [2.6, 0.0, 2.8],
    look: [0.7, -0.5, 1.0],
    rel: SUB,
    zoom: 1.6,
  },
  // ballast vents blow, the sub tips its nose down
  { at: T.hebel, from: [-2.6, 1.6, 3.0], to: [-2.0, 1.2, 2.5], look: [0, 0.1, 0], rel: SUB },
  // Everest goes under in the tank
  { at: T.everest, from: [0, 4.2, 15], to: [0, 5.4, 12.5], look: [0, 5.6, 0], rel: EV, zoom: 1.0 },
  // blue turns black
  { at: T.erst, from: [3.4, 0.6, 2.4], to: [2.8, 0.2, 3.0], look: [0, 0, 0], rel: SUB },
  // looking up: the last light fades, the headlights snap on
  { at: T.kein, from: [-1.6, -2.6, 2.4], to: [-1.3, -2.2, 2.1], look: [0, 0.6, 0.4], rel: SUB },
  // the glowing fish + the anglerfish with its lamp
  {
    at: T.draussen,
    from: [-1.2, 0.5, 3.8],
    to: [-1.6, 0.3, 3.1],
    look: [-2.2, 0.0, 1.2],
    rel: SUB,
    whip: -1,
  },
  // the can: crunch (slowmo until "Deine")
  {
    at: T.dann3,
    from: [1.75, -0.25, 2.3],
    to: [1.6, -0.35, 2.0],
    look: [0.9, -0.55, 1.1],
    rel: SUB,
    zoom: 1.0,
  },
  {
    at: T.deine,
    from: [0.3, -0.2, 2.0],
    to: [0.55, -0.3, 2.0],
    look: [0.9, -0.55, 1.1],
    rel: SUB,
    zoom: 1.0,
  },
  // follow line: calm wide, the sub sinking through the snow
  { at: T.folg, from: [4.2, 1.0, 5.6], to: [3.8, 1.6, 5.0], look: [0, 0.2, 0], rel: SUB },
  // the water presses from all sides
  { at: T.schuld, from: [2.6, 1.2, 4.4], to: [2.0, 0.8, 3.6], look: [0, 0.1, 0], rel: SUB },
  // look up the dark column above the sub
  { at: T.wasser1, from: [1.4, -2.6, 2.6], to: [1.0, -2.2, 2.2], look: [0, 1.6, 0], rel: SUB },
  // the box next to the sub crumples
  {
    at: T.kiste,
    from: [-3.6, 0.7, 2.8],
    to: [-3.3, 0.5, 2.4],
    look: [-2.3, 0.1, 0.5],
    rel: SUB,
    zoom: 1.4,
  },
  // x-ray: the titanium sphere inside
  // (orbit shots are in world coordinates: rel does not apply)
  { at: T.dein, orbit: { c: SUB, r: 3.2, y: SUB[1] + 0.9, a0: 0.9, a1: -0.5 } },
  // Rate mal: far out, a tiny light in endless black
  { at: T.rate, from: [3.4, 1.8, 6.2], to: [4.6, 2.6, 8.6], look: [0, -0.4, 0], rel: SUB },
  // "vier Stunden": crash back in, the snow streaks past
  { at: T.rund, from: [2.4, 0.4, 3.6], to: [2.1, 0.3, 3.1], look: [0, 0.1, 0], rel: SUB },
  // eleven kilometres above you: look up past the sub
  { at: T.dann4, from: [-1.4, -2.6, 2.6], to: [-1.1, -2.3, 2.2], look: [0, 1.8, 0], rel: SUB },
  // the last fish turns around
  { at: T.ab, from: [2.8, 0.6, 3.4], to: [2.3, 0.5, 2.8], look: [1.6, 0.2, 0.4], rel: SUB },
  // touchdown on the seabed in the trench
  {
    at: T.trotzdem - 0.12,
    from: [4.6, 0.4, 5.2],
    to: [3.8, -0.2, 4.6],
    look: [0, -0.6, 0],
    rel: SUB,
  },
  // amphipods crawling in the headlight
  {
    at: T.winzige,
    from: [1.2, -0.5, 3.4],
    to: [0.9, -0.65, 3.0],
    look: [0.4, -1.05, 2.4],
    rel: SUB,
    zoom: 1.7,
  },
  // payoff: your hand on the seabed
  { at: T.ganz2, from: [-2.4, 0.4, 5.2], to: [-2.0, 0.1, 4.6], look: [-0.6, -0.8, 3.0], rel: SUB },
  // the fingernail, a car hovering above it (slowmo)
  {
    at: T.fingernaegel,
    from: [0.6, -0.1, 4.9],
    to: [0.45, -0.25, 4.6],
    look: [-0.45, -0.55, 3.45],
    rel: SUB,
    zoom: 1.45,
  },
  // … it lands
  {
    at: T.auto,
    from: [-1.0, -0.2, 5.0],
    to: [-0.9, -0.3, 4.7],
    look: [-0.45, -0.6, 3.45],
    rel: SUB,
    zoom: 1.0,
  },
  // Übrigens: the headlight finds something on the seabed
  { at: T.fakt, from: [-1.2, 0.2, 2.0], to: [-1.0, 0.1, 2.4], look: [1.4, -0.9, 3.8], rel: SUB },
  {
    at: T.tuete,
    from: [2.6, -0.3, 5.6],
    to: [2.3, -0.45, 5.2],
    look: [1.6, -1.0, 4.0],
    rel: SUB,
    zoom: 1.5,
  },
  // CTA: drone pull-back over the trench floor, the sub's lights below
  {
    at: T.cta,
    from: [2.4, 0.8, 4.2],
    to: [4.0, 3.0, 7.2],
    look: [0, -0.6, 0],
    lookTo: [0, -0.9, -0.5],
    rel: SUB,
    tilt: 0.7,
  },
];

// ---------------------------------------------------------------- labels
const S = (x, y, z) => [x + SUB[0], y + SUB[1], z + SUB[2]];
export const LABELS = [
  {
    text: "Wasserdruck",
    at: T.wasserdruck,
    until: T.seiten + 0.5,
    pos: S(-1.9, -0.35, 0.9),
    side: -1,
  },
  { text: "Titankugel", at: T.titankugel, until: T.rate - 0.1, pos: S(0, 0.55, 0.2) },
  {
    text: "Flohkrebse",
    at: T.flohkrebse,
    until: T.ganz2 - 0.1,
    pos: S(0.55, -1.08, 2.35),
    side: -1,
  },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "flash", at: SPLASH }, // the splash in the first second
  { kind: "shake", at: SPLASH, dur: 0.5, amp: 0.9 },
  { kind: "zoom", at: T.verschwinden, amount: 0.3 }, // Everest goes under
  { kind: "flash", at: LIGHTS_ON }, // headlights on
  { kind: "slowmo", at: T.knack - 0.1, until: T.deine, speed: 0.3 }, // the can crunches
  { kind: "shake", at: T.knack + 0.05, dur: 0.5, amp: 0.8 },
  { kind: "zoom", at: T.wasserdruck, amount: 0.25 },
  { kind: "shake", at: T.zerknuellen, dur: 0.45, amp: 0.7 },
  { kind: "zoom", at: T.vier, amount: 0.35 }, // "vier Stunden"
  { kind: "flash", at: T.vier },
  { kind: "shake", at: T.trotzdem, dur: 0.6, amp: 0.9 }, // touchdown
  { kind: "slowmo", at: T.ein, until: T.auto, speed: 0.3 }, // the car falls
  { kind: "shake", at: T.auto + 0.02, dur: 0.6, amp: 1 },
  { kind: "flash", at: T.auto + 0.02 },
  { kind: "zoom", at: T.tuete, amount: 0.3 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "klack", at: 0.08 }, // frame 0: the lever
  { s: "klack", at: DROP.at, db: -8 }, // the hook lets go
  { s: "platsch", at: SPLASH - 0.03, db: -6 },
  { s: "rauschen", at: 1.3, dur: 4.2, db: -20 }, // bubbles around the sinking sub
  { s: "zisch", at: T.hebel + 0.1, dur: 1.4, db: -16 }, // ballast vents
  { s: "sonar", at: T.erst - 0.05, db: -12 },
  { s: "click", at: LIGHTS_ON },
  { s: "knack", at: T.knack, db: -6 },
  { s: "sonar", at: T.folg + 0.4, db: -15 },
  { s: "knack", at: T.zerknuellen, db: -10 }, // the box
  { s: "sonar", at: T.rate + 0.3, db: -13 },
  { s: "rauschen", at: T.rund + 0.3, dur: 1.2, db: -16 }, // time-lapse rush
  { s: "brumm", at: T.ab - 0.4, dur: 3.2, db: -22 }, // thrusters near the bottom
  { s: "pop", at: T.ganz2 + 0.2 }, // the hand
  { s: "klack", at: T.auto, db: -6 }, // the car lands
];
