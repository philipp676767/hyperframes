// Beats of "Was passiert eigentlich, wenn du im Flugzeug die Tür aufmachst?"
// (#25, format B): every time-keyed decision as plain data, read by scene.js
// (picture) and scripts/build-sfx.mjs (sound). No three.js / DOM here.
import { W } from "./timing.js";

// ---------------------------------------------------------------- layout
// The airliner flies along +x (nose at +x) with its axis at y = AX.y; the
// front left door (1L) faces the camera (+z) at x = 0. 1 unit ≈ 1 m.
// SEC is the cross-section diorama of the plug door (Folge 3), far off to
// the side so it only shows in its own shots.
export const AX = { y: 2.0, R: 2.0 };
export const DOOR = [0, 1.9, 1.86]; // inner face of the door, at the lever
export const SEC = [-40, 2, 40];
const S = (x, y, z) => [SEC[0] + x, SEC[1] + y, SEC[2] + z];

// ---------------------------------------------------------------- beats
export const T = {
  grab: 0.15, // the hand closes round the lever on frame 0
  wenn: W("wenn"),
  tuer: W("Tür"),
  du: W("Du", 2), // "Du packst" (the 1st is "wenn du")
  griff: W("Griff"),
  ziehst: W("ziehst"),
  kraft: W("Kraft"),
  gleich: W("Gleich"),
  pilot: W("Pilot"),
  ruhig: W("ruhig"),
  fliegst: W("fliegst") - 0.1,
  everest: W("Everest"),
  draussen: W("Draußen"),
  duenn: W("dünn"),
  ohnmaechtig: W("ohnmächtig"),
  drinnen: W("Drinnen"),
  pumpt: W("pumpt"),
  genau: W("genau") - 0.1,
  luft3: W("Luft", 3), // "diese Luft"
  presst: W("presst"),
  tonnen: W("Tonnen"),
  tuer3: W("Tür", 3) - 0.16, // "Und die Tür ist größer …"
  loch: W("Loch"),
  stoepsel: W("Stöpsel"),
  zuerst: W("zuerst"),
  innen: W("innen"),
  gegen: W("gegen"),
  druck: W("Druck"),
  darum: W("Darum"),
  zu: W("zu"),
  selbst: W("selbst"),
  zehn: W("zehn"),
  ziehen: W("ziehen"),
  fakt: W("Übrigens"),
  kaelter: W("kälter"),
  minus: W("minus"),
  cta: W("sollen") - 0.16,
};

// ---------------------------------------------------------------- shots
export const shots = [
  // hook: inside the cabin, fast push-in on your hand at the door lever
  { at: 0, from: [-3.5, 2.6, -1.35], to: [-1.7, 2.3, -0.25], look: [0.0, 1.95, 1.6], zoom: 1 },
  // outside: the airliner races over the clouds
  { at: T.wenn, from: [13, 0.6, 11], to: [6.5, 2.3, 8.8], look: [1.5, 2.2, 0], zoom: 1, whip: 1 },
  // the door from outside, shuddering
  { at: T.tuer, from: [2.4, 2.5, 6.2], to: [1.4, 2.2, 4.9], look: [0, 2.0, 1.9], zoom: 1 },
  // macro: the hand grabs the lever
  {
    at: T.du,
    from: [-0.75, 2.35, 0.55],
    to: [-0.5, 2.15, 0.88],
    look: [0.05, 1.9, 1.62],
    zoom: 1,
    whip: -1,
  },
  // pulling with all your might, side view
  { at: T.ziehst, from: [1.9, 2.5, 0.0], to: [1.45, 2.3, 0.35], look: [0, 1.85, 1.55], zoom: 1 },
  // the pilot sips his coffee, totally calm
  {
    at: T.gleich,
    from: [14.6, 3.1, 1.9],
    to: [13.0, 2.95, 1.3],
    look: [7.7, 2.45, 0.35],
    zoom: 1,
    whip: 1,
  },
  // Folge 1: higher than Everest — wide, the peak below the plane
  {
    at: T.fliegst,
    from: [13, -1.5, 17.5],
    to: [11, -1.1, 15],
    look: [-1.8, 1.0, -14],
    lookTo: [-1.8, 0.6, -14],
    zoom: 1,
    whip: -1,
  },
  // x-ray: thin air outside (few particles), the cabin full
  { at: T.draussen, from: [6.4, 5.4, 9.6], to: [5.0, 4.6, 8.0], look: [0.3, 2.0, 0], zoom: 1 },
  // the engine pumps air into the cabin
  { at: T.drinnen, from: [3.8, 1.6, 12.5], to: [2.2, 2.1, 10.6], look: [-2.6, 1.3, 3.0], zoom: 1 },
  // Folge 2 (whisper): inside, the air presses on the door
  { at: T.genau, from: [-2.9, 2.4, -0.9], to: [-2.4, 2.3, -0.5], look: [0, 1.95, 1.6], zoom: 1 },
  // "mehrere Tonnen": outside on the door, arrows everywhere
  {
    at: T.tonnen,
    from: [3.4, 3.4, 6.6],
    to: [2.6, 3.0, 5.6],
    look: [0, 2.0, 1.4],
    zoom: 1,
    whip: 1,
  },
  // Folge 3: the cross-section — the door is bigger than the hole
  {
    at: T.tuer3,
    from: S(0.4, 6.6, 3.0),
    to: S(0.2, 5.8, 2.4),
    look: S(0, 1.0, -0.1),
    zoom: 1,
    whip: -1,
  },
  // the plug
  { at: T.stoepsel, from: S(2.6, 4.2, 3.6), to: S(2.1, 3.8, 3.1), look: S(0, 1.1, 0), zoom: 1 },
  // it would have to open inwards — against the pressure
  { at: T.zuerst, from: S(-2.6, 3.9, 3.8), to: S(-2.1, 3.5, 3.3), look: S(0, 1.1, 0.3), zoom: 1 },
  // payoff: you pull — nothing
  {
    at: T.darum,
    from: [-1.5, 2.1, -0.7],
    to: [-1.15, 2.05, -0.35],
    look: [0.05, 1.9, 1.65],
    zoom: 1,
  },
  // ten people in the aisle, a rope, the door doesn't budge
  { at: T.selbst, from: [6.1, 2.8, -1.25], to: [5.6, 2.7, -1.1], look: [-2.0, 1.5, 1.0], zoom: 1 },
  // Übrigens: frost on the windows outside
  {
    at: T.fakt,
    from: [0.9, 3.0, 6.0],
    to: [0.2, 2.75, 5.0],
    look: [-2.0, 2.3, 1.9],
    zoom: 1,
    whip: 1,
  },
  // CTA: drone pull-back from the airliner over the cloud sea
  {
    at: T.cta,
    from: [7, 4.2, 11],
    to: [22, 13, 30],
    look: [-1, 2.0, 0],
    lookTo: [-2, 1.0, 0],
    zoom: 1,
  },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Griff", at: T.griff, until: T.ziehst + 0.6, pos: [0.08, 1.92, 1.62], side: -1 },
  { text: "Pilot", at: T.pilot, until: T.fliegst, pos: [7.45, 2.75, 0.45], side: 1 },
  { text: "Mount Everest", at: T.everest, until: T.draussen, pos: [0, -0.4, -30], side: 1 },
  { text: "dünne Luft", at: T.duenn, until: T.drinnen, pos: [2.2, 4.4, 3.4], side: 1 },
  { text: "Kabine", at: T.tuer3 + 0.2, until: T.stoepsel, pos: S(-1.2, 1.3, 1.1), side: -1 },
  { text: "Draußen", at: T.tuer3 + 0.35, until: T.stoepsel, pos: S(1.2, 1.3, -1.1), side: 1 },
  { text: "Stöpsel", at: T.stoepsel, until: T.zuerst + 0.3, pos: S(0, 2.2, 0), side: 1 },
  { text: "innen", at: T.innen, until: T.darum, pos: S(0.25, 1.6, 0.9), side: 1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "shake", at: T.grab, dur: 0.45, amp: 0.7 },
  { kind: "zoom", at: 0.35, amount: 0.3 },
  { kind: "flash", at: T.wenn + 0.02 },
  { kind: "shake", at: T.tuer + 0.1, dur: 0.6, amp: 0.8 }, // the door shudders
  { kind: "shake", at: T.kraft, dur: 0.5, amp: 0.9 },
  { kind: "zoom", at: T.pilot, amount: 0.3 },
  { kind: "shake", at: T.everest + 0.15, dur: 0.6, amp: 0.8 }, // the peak bursts through
  { kind: "zoom", at: T.ohnmaechtig, amount: 0.25 },
  { kind: "slowmo", at: T.luft3, until: T.tonnen, speed: 0.35 },
  { kind: "flash", at: T.tonnen },
  { kind: "shake", at: T.tonnen, dur: 0.9, amp: 1.1 },
  { kind: "zoom", at: T.stoepsel + 0.1, amount: 0.3 },
  { kind: "shake", at: T.druck, dur: 0.6, amp: 1.0 }, // the door slams back
  { kind: "flash", at: T.zu },
  { kind: "shake", at: T.ziehen, dur: 0.6, amp: 0.8 },
  { kind: "zoom", at: T.minus + 0.3, amount: 0.3 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "gong", at: 0.0, db: -6 }, // the seatbelt chime, frame 0 (sfx-extra.py)
  { s: "klack", at: T.grab, db: -7 }, // hand on the lever
  { s: "rauschen", at: T.wenn, dur: T.tuer - T.wenn + 0.3, db: -14 }, // the plane roars past
  { s: "klack", at: T.tuer + 0.1, db: -10 },
  { s: "klack", at: T.kraft, db: -9 },
  { s: "pop", at: T.everest + 0.1, db: -8 },
  { s: "rauschen", at: T.pumpt, dur: 2.2, db: -18 }, // air pumped in
  { s: "brumm", at: T.luft3, dur: T.tonnen - T.luft3, db: -20 }, // pressure building
  { s: "klack", at: T.innen + 0.2, db: -11 },
  { s: "klack", at: T.druck, db: -5 }, // slammed back into the frame
  { s: "pop", at: T.selbst + 0.1, db: -11 },
  { s: "eis", at: T.kaelter - 0.4, db: -11 }, // frost crackles over the window
];
