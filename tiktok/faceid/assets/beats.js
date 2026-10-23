// Face-ID beats: every time-keyed decision as plain data, so scene.js
// (picture) and scripts/build-sfx.mjs (sound) read the same numbers.
// Keep this file free of three.js / DOM: it is imported by node too.
import { W } from "./timing.js";

// ---------------------------------------------------------------- layout
// A giant low-poly bust ("you") stands left of centre on the beach and looks
// along DIR at a giant phone, held up by your hand. The phone's top island
// (IR camera, flood, dot projector) faces the face.
export const YAW = 0.75; // the face looks along DIR
export const DIR = [Math.sin(YAW), 0, Math.cos(YAW)];
export const PERP = [Math.cos(YAW), 0, -Math.sin(YAW)]; // DIR turned right (seen from the face)
export const HEAD = [-0.85, 2.0, -0.1]; // head centre
const add = (p, d, s = 1) => p.map((v, i) => v + d[i] * s);
export const PHONE = add(add(HEAD, DIR, 1.55), [0, -0.62, 0]); // phone centre
export const PH_W = 0.95;
export const PH_H = 1.9;
export const PH_D = 0.09;
export const ISLAND_Y = 0.8; // phone-local y of the top island
// phone-local x of the three modules (screen side, mirrored in world: the
// phone faces -DIR)
export const MOD = { cam: -0.2, flood: -0.06, proj: 0.16 };
const toWorld = (lx, ly) => add(add(add(PHONE, PERP, -lx), [0, ly, 0]), DIR, -PH_D / 2 - 0.02);
export const CAM_W = toWorld(MOD.cam, ISLAND_Y);
export const FLOOD_W = toWorld(MOD.flood, ISLAND_Y);
export const PROJ_W = toWorld(MOD.proj, ISLAND_Y);
export const ISLAND_W = toWorld(0, ISLAND_Y);
export const SCREEN_W = toWorld(0, 0.05);
export const PHOTO = add(HEAD, DIR, 0.66); // the printed photo floats here, facing the phone
export const NOSE = add(add(HEAD, DIR, 0.5), [0, -0.03, 0]);
export const CHEEK = add(add(add(HEAD, DIR, 0.3), PERP, 0.22), [0, -0.1, 0]);
export const TWIN = add(add(HEAD, PERP, -1.05), DIR, 0.2);
export const MID = add(HEAD, DIR, 0.8);

// ---------------------------------------------------------------- beats
export const T = {
  handy: W("Handy", 1),
  beschiesst: W("beschießt"),
  dein1: W("dein", 2),
  gesicht1: W("Gesicht", 1),
  tausenden: W("Tausenden"),
  du1: W("Du", 1),
  keinen: W("keinen"),
  foto1: W("Foto", 1),
  faellt1: W("Fällt", 1),
  gleich1: W("Gleich", 1),
  unsichtbarer: W("unsichtbarer"),
  blitz: W("Blitz"),
  sucht: W("sucht"),
  sogar: W("sogar"),
  dunkeln: W("Dunkeln"),
  aber: W("Aber"),
  foto2: W("Foto", 2),
  bestanden: W("bestanden"),
  dann: W("Dann"),
  feuert: W("feuert"),
  punktprojektor: W("Punktprojektor"),
  ueber: W("über"),
  zahl: W("30.000"),
  konfetti: W("Konfetti"),
  auf: W("Auf"),
  nase: W("Nase"),
  wange: W("Wange"),
  eine: W("Eine"),
  kamera: W("Infrarot-Kamera"),
  liest: W("liest"),
  baut: W("baut"),
  karte: W("3D-Karte"),
  passt: W("Passt"),
  zack: W("Zack"),
  offen: W("offen"),
  foto3: W("Foto", 3),
  flach: W("flach"),
  darum: W("Darum"),
  faellt2: W("fällt", 2),
  uebrigens: W("Übrigens"),
  fremder: W("Fremder"),
  million: W("Million"),
  zwilling: W("Zwilling"),
  vielleicht: W("vielleicht"),
  face: W("Face"),
  finger: W("Fingerabdruck"),
  ab: W("Ab"),
};

// dot bursts: [start, spread of the launches]; the hook burst already runs
// before frame 0 so the loop tail and frame 0 show dots in flight
export const BURST = {
  hook: [-0.9, 1.5],
  main: [T.feuert + 0.15, 2.4],
};
// "sogar im Dunkeln": the world goes dark, the IR flood lights the face
export const DARK = [T.sogar - 0.1, T.dunkeln + 0.1, T.aber + 0.6, T.bestanden + 0.2];
// the 3D map: head turns to glass, dots coloured by depth
export const XRAY = [T.karte - 0.1, T.karte + 0.35, T.passt + 0.1, T.passt + 0.5];
// photo visits (in, out)
export const PHOTO_IN = [
  [T.foto1 - 0.1, T.gleich1 + 0.35],
  [T.aber + 0.15, T.dann],
  [T.foto3 - 0.1, T.uebrigens + 0.1],
];

// ---------------------------------------------------------------- shots
// angle + distance around a look point: yaw 0 = front (+z), positive yaw
// swings towards +x, pitch = degrees above the look point, d = distance.
const D2R = Math.PI / 180;
const cam = (look, [yaw, pitch, d]) => [
  look[0] + d * Math.cos(pitch * D2R) * Math.sin(yaw * D2R),
  look[1] + d * Math.sin(pitch * D2R),
  look[2] + d * Math.cos(pitch * D2R) * Math.cos(yaw * D2R),
];
const shot = (at, look, a, b, extra = {}) => ({
  at,
  from: cam(look, a),
  to: cam(extra.lookTo ?? look, b),
  look,
  zoom: 1,
  ...extra,
});
const FY = (YAW * 180) / Math.PI; // the face's own yaw in degrees (43°)
const SY = FY + 180; // looking at the phone screen from the face side

export const shots = [
  // hook: fast push-in from the side, the dot spray already hitting the face
  shot(0, add(MID, [0, -0.05, 0]), [FY - 72, 12, 3.9], [FY - 56, 6, 2.7]),
  // "… dein Gesicht": macro on the face, dots raining onto it
  shot(T.dein1, add(add(HEAD, DIR, 0.3), [0, -0.05, 0]), [FY - 40, 6, 1.75], [FY - 30, 4, 1.4], {
    whip: 1,
  }),
  // "mit Tausenden Punkten": from behind the head into the firing island
  shot(T.tausenden, add(ISLAND_W, [0, -0.1, 0]), [SY - 40, 10, 1.9], [SY - 30, 6, 1.5], {
    whip: -1,
  }),
  // "Du siehst keinen": your view, the dots vanish
  shot(T.du1, add(MID, [0, -0.15, 0]), [FY - 95, 6, 3.6], [FY - 85, 6, 3.3]),
  // "Ein Foto von dir? Fällt durch.": a photo flies in, red ✕
  shot(T.foto1, add(PHOTO, [0, -0.05, 0]), [FY + 50, 6, 2.4], [FY + 38, 4, 2.0], { whip: 1 }),
  // "Gleich weißt du, warum": wide over the beach
  shot(T.gleich1, add(MID, [0, -0.45, 0]), [FY - 75, 14, 7.2], [FY - 62, 10, 6.4], { whip: -1 }),
  // "Ein unsichtbarer Blitz": macro on the phone's island
  shot(T.unsichtbarer, ISLAND_W, [SY - 32, 8, 1.05], [SY - 22, 4, 0.85], { whip: 1 }),
  // "sucht dein Gesicht – sogar im Dunkeln": the face glows violet in the dark
  shot(T.sucht, add(HEAD, DIR, 0.25), [FY - 30, 6, 2.3], [FY - 22, 4, 2.0]),
  // "Aber auch ein Foto …": the photo slams in and glows too
  shot(T.aber, add(PHOTO, [0, -0.05, 0]), [FY + 62, 8, 2.3], [FY + 48, 6, 2.0], { whip: 1 }),
  // whisper "Dann feuert der Punktprojektor": side view, beams fly (slow motion)
  shot(T.dann, add(MID, [0, 0.05, 0]), [FY - 88, 8, 4.5], [FY - 80, 5, 4.0], { whip: -1 }),
  // "über 30.000 Lichtpunkte, wie Konfetti": face front, covered in dots
  shot(T.ueber, add(add(HEAD, DIR, 0.3), [0, -0.05, 0]), [FY - 34, 8, 1.9], [FY - 26, 6, 1.6]),
  // "Auf deiner Nase … als auf der Wange": macro, nose then cheek
  shot(T.auf, NOSE, [FY - 70, 4, 1.4], [FY - 52, 2, 1.25], { lookTo: CHEEK, whip: 1 }),
  // "Eine Infrarot-Kamera liest jeden Punkt": the island again, rays come back
  shot(T.eine, add(ISLAND_W, [0, -0.05, 0]), [SY + 30, 10, 1.4], [SY + 20, 6, 1.15], { whip: -1 }),
  // "baut daraus eine 3D-Karte": orbit round the glass head
  {
    at: T.baut,
    orbit: { c: add(HEAD, [0, -0.1, 0]), r: 2.3, y: HEAD[1] + 0.35, a0: -0.25, a1: 0.32 },
    zoom: 1,
  },
  // "Passt sie? Zack, offen.": the phone screen, lock opens
  shot(T.passt, add(SCREEN_W, [0, 0.1, 0]), [SY - 26, 6, 2.2], [SY - 16, 4, 1.85], { whip: 1 }),
  // payoff "Ein Foto ist flach": the photo gets a flat grid of dots
  shot(T.foto3, add(PHOTO, [0, -0.05, 0]), [FY + 46, 6, 2.2], [FY + 36, 4, 1.9], { whip: -1 }),
  // "alle Punkte liegen gleich": side by side with the face, from the side
  shot(
    T.flach + 0.35,
    add(add(HEAD, DIR, 0.45), [0, -0.05, 0]),
    [FY - 80, 8, 2.0],
    [FY - 72, 6, 1.8],
  ),
  // "Darum fällt es durch": front of the photo, ✕
  shot(T.darum, add(PHOTO, [0, -0.05, 0]), [FY + 60, 6, 2.1], [FY + 50, 4, 1.85], { whip: 1 }),
  // bonus fact: a stranger, then the twin
  shot(
    T.uebrigens,
    add(add(HEAD, PERP, -0.45), [0, 0.25, 0.1]),
    [FY - 40, 12, 4.4],
    [FY - 30, 8, 3.9],
    {
      whip: -1,
    },
  ),
  // CTA "Face ID oder Fingerabdruck": the phone screen
  shot(T.face, add(SCREEN_W, [0, 0.05, 0]), [SY + 24, 6, 2.1], [SY + 14, 4, 1.8], { whip: 1 }),
  // drone pull-back over the beach
  {
    at: T.ab,
    from: [1.6, 2.6, 5.4],
    to: [5.6, 6.0, 12.6],
    look: [-0.4, 1.6, 0.3],
    lookTo: [-0.2, 1.2, 0],
    zoom: 1,
    tilt: 1.3,
  },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Infrarot-Blitz", at: T.blitz + 0.05, until: T.sogar, pos: FLOOD_W, side: -1 },
  {
    text: "Punktprojektor",
    at: T.punktprojektor,
    until: T.ueber,
    pos: PROJ_W,
    side: 1,
  },
  { text: "Infrarot-Kamera", at: T.kamera, until: T.baut, pos: CAM_W, side: -1 },
  {
    text: "3D-Karte",
    at: T.karte + 0.1,
    until: T.passt,
    pos: add(add(HEAD, DIR, 0.25), [0, -0.25, 0]),
    side: -1,
  },
];

// ---------------------------------------------------------------- highlights
// one big moment every 5–7 s; a slowmo ends on a shot cut
export const HIGHLIGHTS = [
  { kind: "zoom", at: 0.35, amount: 0.3 }, // hook: the dots hit
  { kind: "flash", at: T.dein1 },
  { kind: "shake", at: T.faellt1, dur: 0.45, amp: 0.7 }, // photo fails
  { kind: "flash", at: T.blitz }, // IR flood
  { kind: "shake", at: T.aber + 0.4, dur: 0.35, amp: 0.5 }, // photo slams in
  { kind: "slowmo", at: T.feuert + 0.1, until: T.ueber, speed: 0.35 }, // the dot burst
  { kind: "flash", at: T.konfetti },
  { kind: "zoom", at: T.nase, amount: 0.25 },
  { kind: "zoom", at: T.karte, amount: 0.3 },
  { kind: "flash", at: T.zack },
  { kind: "shake", at: T.zack + 0.05, dur: 0.35, amp: 0.5 },
  { kind: "shake", at: T.faellt2, dur: 0.45, amp: 0.7 }, // photo fails again
  { kind: "zoom", at: T.million, amount: 0.25 },
  { kind: "shake", at: T.zwilling + 0.2, dur: 0.3, amp: 0.4 }, // twin lands
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "zisch", at: 0, dur: 1.1, db: -14 }, // frame 0: the dot spray hisses
  { s: "pop", at: T.foto1 }, // photo flies in
  { s: "piep", at: T.faellt1, dur: 0.5, db: -16 }, // denied
  { s: "surr", at: T.blitz, dur: T.aber - T.blitz, db: -22 }, // IR flood hum
  { s: "pop", at: T.aber + 0.2 },
  { s: "zisch", at: T.feuert + 0.15, dur: 1.6, db: -15 }, // the dot burst
  { s: "surr", at: T.liest, dur: 1.0, db: -22 }, // the camera reads
  { s: "klack", at: T.zack + 0.05 }, // lock opens
  { s: "pop", at: T.foto3 },
  { s: "piep", at: T.faellt2, dur: 0.5, db: -16 },
  { s: "pop", at: T.fremder },
  { s: "piep", at: T.million, dur: 0.5, db: -17 },
  { s: "pop", at: T.zwilling + 0.05 },
  { s: "click", at: T.vielleicht + 0.1 },
];
