// Beats of #55 "Fingerknacken": every time-keyed decision as plain data, read
// by scene.js (picture) and scripts/build-sfx.mjs (sound). No three.js here.
// Scale: 1 unit ≈ 25 cm. You sit at +z of your desk and look at the glass
// front (-z). The macro of your finger joint lives in the pocket JOINT.
import { W, END } from "./timing.js";

// ---------------------------------------------------------------- places (plain numbers)
export const DESK_Y = 3; // desk top
export const SEAT_Y = 2.2; // chair seat top
export const HANDS = [0, 3.55, 0.75]; // your hands over the keyboard
export const CHEF = [4.6, 0, -5.2]; // your boss, standing between the desks
export const JOINT = [0, -150, 480]; // macro pocket: the joint inside your finger

// ---------------------------------------------------------------- beats
export const T = {
  fingern: W("Fingern"),
  arthrose1: W("Arthrose", 1),
  oma: W("Oma"),
  chef: W("Chef"),
  trotzdem: W("Trotzdem"),
  millionen: W("Millionen"),
  dabei: W("Dabei"),
  bricht: W("bricht"),
  knacken1: W("Knacken", 2),
  blase1: W("Blase", 1),
  gelenk: W("Gelenk"),
  aber: W("Aber"),
  fingergelenk: W("Fingergelenk"),
  beutel: W("Beutel"),
  schmiere: W("Schmiere"),
  ziehst: W("Ziehst"),
  platz: W("Platz"),
  knackst2: W("Knackst", 2),
  kommentare: W("Kommentare"),
  rate: W("Rate"),
  derselbe: W("derselbe"),
  erst: W("Erst"),
  zwanzig: W("20"),
  minuten: W("Minuten"),
  lange: W("lange"),
  blase2: W("Blase", 2),
  gelenkschmiere: W("Gelenkschmiere"),
  gas: W("Gas"),
  cola: W("Cola"),
  faellt: W("Fällt"),
  druck: W("Druck"),
  ploppt: W("ploppt"),
  knack: W("Knack"),
  arthrose2: W("Arthrose", 2),
  studien: W("Studien"),
  knacken2: W("Knacken", 4),
  harmlos: W("harmlos"),
  wehtut: W("wehtut"),
  arzt1: W("Arzt", 1),
  fakt: W("Übrigens"),
  arzt2: W("Arzt", 2),
  sechzig: W("60"),
  linke: W("linke"),
  beide: W("Beide"),
  gesund: W("gesund"),
  folge: W("Folge"),
};
// crack moments of YOUR hands in the office (scene time). The first one is
// already bursting on frame 0.
T.cracks = [-0.12, T.fingern + 0.15, T.knackst2 + 0.15, T.harmlos + 0.1];
// the failed try during "Rate mal" (no crack, an ✕)
T.tryFail = T.derselbe + 0.2;
// the colleagues crack all at once
T.crowd = T.millionen + 0.05;
// the big bubble in the joint
T.bubble1 = T.blase1 + 0.05; // it lights up (first visit)
T.pop = T.knack - 0.05; // the gas pops out (inside the slow motion)
T.cap = T.cola + 0.15; // the cola cap flies off
// the old doctor's left hand cracks again and again
T.drKnacks = [0, 0.45, 0.9, 1.35, 1.8].map((d) => T.sechzig + 0.1 + d);

// ---------------------------------------------------------------- shots
const at = (p, d) => [p[0] + d[0], p[1] + d[1], p[2] + d[2]];
export const shots = [
  // 0: cold open — your hand balls into a fist and cracks, seen from the front
  {
    at: 0,
    from: at(HANDS, [-2.3, 1.55, -2.0]),
    to: at(HANDS, [-1.55, 1.1, -1.45]),
    look: at(HANDS, [0.15, 0.05, -0.05]),
    zoom: 1,
  },
  // the next finger, low from the side
  {
    at: T.fingern,
    from: at(HANDS, [3.8, 0.75, 0.5]),
    to: at(HANDS, [3.0, 0.6, 0.45]),
    look: at(HANDS, [0, 0.1, 0.15]),
    zoom: 1,
  },
  // "Arthrose": from above, the knuckles glow red
  {
    at: T.arthrose1,
    from: at(HANDS, [0.5, 3.0, -0.4]),
    to: at(HANDS, [0.35, 2.4, -0.05]),
    look: at(HANDS, [0.1, 0, 0.1]),
    zoom: 1,
    whip: 1,
  },
  // grandma's message on the phone
  { at: T.oma, from: [2.6, 5.2, 0.6], to: [2.4, 4.6, 0.1], look: [2.2, 3.0, -0.9], zoom: 1 },
  // your boss behind the monitors pulls a face
  {
    at: T.chef,
    from: [0.9, 5.4, 2.0],
    to: [1.6, 5.6, 1.2],
    look: [CHEF[0], 5.6, CHEF[2]],
    zoom: 1,
  },
  // the whole office, everyone cracks
  { at: T.trotzdem, from: [-12.5, 10.4, 10.6], to: [-10.5, 9.6, 8.6], look: [2, 3, -3.5], zoom: 1 },
  // x-ray: inside your finger — bones intact
  {
    at: T.dabei,
    from: at(JOINT, [3, 2.5, 26]),
    to: at(JOINT, [2, 1.5, 21]),
    look: at(JOINT, [0, 0, 0]),
    zoom: 1,
  },
  // the bubble lights up — crash zoom
  {
    at: T.blase1,
    from: at(JOINT, [1.5, 1.2, 11]),
    to: at(JOINT, [0.8, 0.8, 8.5]),
    look: at(JOINT, [0, 0, 0]),
    zoom: 1,
  },
  // where does it come from — orbit
  {
    at: T.aber,
    orbit: { c: at(JOINT, [0, 0, 0]), r: 15, y: JOINT[1] + 4, a0: 0.7, a1: 0.2 },
    zoom: 1,
  },
  // the bag full of grease
  {
    at: T.beutel,
    from: at(JOINT, [-4, 3, 13]),
    to: at(JOINT, [-2.5, 2.2, 10.5]),
    look: at(JOINT, [0, 0, 0]),
    zoom: 1,
  },
  // you pull: the gap opens (slow motion)
  {
    at: T.ziehst,
    from: at(JOINT, [0, 6, 16]),
    to: at(JOINT, [0, 4.5, 13]),
    look: at(JOINT, [0, 0, 0]),
    zoom: 1,
    whip: -1,
  },
  // comment question: your hands crack again, the colleague looks over
  {
    at: T.knackst2,
    from: at(HANDS, [2.8, 1.5, -1.3]),
    to: at(HANDS, [2.1, 1.2, -0.95]),
    look: at(HANDS, [0.05, 0.05, 0.3]),
    zoom: 1,
  },
  // rate mal: the same finger again — nothing
  {
    at: T.rate,
    from: at(HANDS, [-2.4, 1.4, -1.7]),
    to: at(HANDS, [-1.8, 1.1, -1.3]),
    look: at(HANDS, [0.1, 0.05, 0.25]),
    zoom: 1,
  },
  // 20 minutes: the wall clock races
  {
    at: T.erst,
    from: [-5.4, 7.4, -5.2],
    to: [-6.1, 7.5, -6.6],
    look: [-7.5, 7.6, -9.4],
    zoom: 1,
    whip: 1,
  },
  // the bubble hangs in the joint, slowly dissolving
  {
    at: T.lange,
    from: at(JOINT, [5, 2.5, 12]),
    to: at(JOINT, [3.5, 1.8, 10]),
    look: at(JOINT, [0, 0, 0]),
    zoom: 1,
  },
  // gas dissolved in the grease
  {
    at: T.gelenkschmiere,
    from: at(JOINT, [-2, 1, 8.5]),
    to: at(JOINT, [-1.2, 0.6, 7]),
    look: at(JOINT, [0, 0, 0]),
    zoom: 1,
  },
  // like in a cola: the cap flies, the fizz shoots up
  { at: T.cola, from: [-6.0, 5.8, 2.6], to: [-5.4, 5.7, 2.1], look: [-3.0, 5.2, -1.15], zoom: 1 },
  // pressure drops — the gas pops out: KNACK (slow motion into the cut)
  {
    at: T.faellt,
    from: at(JOINT, [2.5, 1.5, 12]),
    to: at(JOINT, [1.2, 0.8, 8]),
    look: at(JOINT, [0, 0, 0]),
    zoom: 1,
  },
  // and the arthritis? the studies
  {
    at: T.arthrose2,
    from: at(HANDS, [0.4, 2.6, -2.0]),
    to: at(HANDS, [0.3, 2.15, -1.55]),
    look: at(HANDS, [0.05, 0, 0.35]),
    zoom: 1,
  },
  // payoff: harmless — your hands crack happily
  {
    at: T.knacken2,
    from: at(HANDS, [2.4, 1.55, -1.9]),
    to: at(HANDS, [1.65, 1.12, -1.4]),
    look: at(HANDS, [0.1, 0.05, 0.0]),
    zoom: 1,
    whip: 1,
  },
  // Übrigens: the doctor's two hands side by side
  {
    at: T.fakt,
    from: at(HANDS, [0, 4.6, 1.0]),
    to: at(HANDS, [0, 3.9, 0.85]),
    look: at(HANDS, [0, -0.1, 0.15]),
    zoom: 1,
  },
  // both healthy
  {
    at: T.beide,
    from: at(HANDS, [0.1, 4.6, 1.2]),
    to: at(HANDS, [0.05, 4.1, 1.05]),
    look: at(HANDS, [0, -0.1, 0.15]),
    zoom: 1,
  },
];

// ---------------------------------------------------------------- labels (static points)
export const JOINT_GAP = at(JOINT, [0, 0, 0]);
export const LABELS = [
  {
    text: "Knochen ✓",
    at: T.bricht + 0.1,
    until: T.blase1,
    pos: at(JOINT, [-3.6, 1.0, 1]),
    side: -1,
  },
  { text: "Gelenk", at: T.gelenk, until: T.aber, pos: at(JOINT, [0, 1.6, 1.4]), side: 1 },
  { text: "Gelenkkapsel", at: T.beutel, until: T.ziehst, pos: at(JOINT, [0.4, 2.3, 1.2]), side: 1 },
  {
    text: "Gelenkschmiere",
    at: T.gelenkschmiere,
    until: T.cola,
    pos: at(JOINT, [-1.5, -0.8, 1.6]),
    side: -1,
  },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "shake", at: 0, dur: 0.35, amp: 0.8 }, // the crack on frame 0
  { kind: "zoom", at: T.cracks[1], amount: 0.3 },
  { kind: "flash", at: T.chef + 0.3 },
  { kind: "zoom", at: T.crowd, amount: 0.25 },
  { kind: "zoom", at: T.bubble1, amount: 0.4 }, // second money shot
  { kind: "slowmo", at: T.ziehst, until: T.knackst2, speed: 0.45 },
  { kind: "shake", at: T.cracks[2], dur: 0.35, amp: 0.6 },
  { kind: "flash", at: T.zwanzig },
  { kind: "zoom", at: T.cap, amount: 0.3 },
  { kind: "slowmo", at: T.pop, until: T.arthrose2, speed: 0.4 },
  { kind: "flash", at: T.pop },
  { kind: "shake", at: T.pop, dur: 0.6, amp: 1.0 },
  { kind: "zoom", at: T.harmlos, amount: 0.3 },
  { kind: "zoom", at: T.gesund, amount: 0.3 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "knack", at: 0.0, db: -3 },
  { s: "knack", at: T.cracks[1], db: -5 },
  { s: "pop", at: T.oma + 0.15, db: -8 }, // message arrives
  { s: "knack", at: T.crowd, db: -9 },
  { s: "knack", at: T.crowd + 0.18, db: -11 },
  { s: "knack", at: T.crowd + 0.34, db: -10 },
  { s: "knack", at: T.crowd + 0.55, db: -12 },
  { s: "pop", at: T.bubble1, db: -6 },
  { s: "rauschen", at: T.ziehst, dur: 1.6, db: -24 },
  { s: "knack", at: T.cracks[2], db: -5 },
  { s: "klack", at: T.tryFail, db: -10 },
  { s: "zisch", at: T.cap, dur: 1.2, db: -14 },
  { s: "pop", at: T.cap - 0.05, db: -6 },
  { s: "knack", at: T.pop, db: -2 },
  { s: "knack", at: T.cracks[3], db: -6 },
  ...T.drKnacks.map((a, i) => ({ s: "knack", at: a, db: -11 - (i % 2) * 2 })),
];
export { END };
