// #64 Blitzer — every time-keyed decision as plain data (scene.js reads it
// for the picture, scripts/build-sfx.mjs for the sound). No three.js here.
import { W } from "./timing.js";

export const T = {
  blitzer1: W("Blitzer", 1),
  bremsen: W("bremsen"),
  rettet: W("rettet"),
  stell: W("Stell"),
  landstrasse: W("Landstraße"),
  kasten1: W("Kasten", 1),
  eisen: W("Eisen"),
  trotzdem: W("trotzdem"),
  blitz: W("Blitz"),
  manche: W("manche"),
  aufleuchten: W("aufleuchten"),
  kasten2: W("Kasten", 2),
  radar: W("Radar"),
  feuert: W("feuert"),
  auto: W("Auto"),
  weil: W("Weil"),
  gestaucht1: W("gestaucht", 1),
  sirene: W("Sirene"),
  hoeher: W("höher"),
  je: W("Je"),
  schneller: W("schneller"),
  folge: W("Folge"),
  rate: W("Rate"),
  kuerzer: W("Kürzer"),
  wimpern: W("Wimpernschlag"),
  neuere: W("Neuere"),
  laser: W("Laser"),
  hunderte: W("hunderte"),
  lange: W("lange", 2),
  erst: W("Erst"),
  kamera: W("Kamera"),
  foto: W("Foto"),
  infrarot: W("Infrarot"),
  schwarzblitz: W("Schwarzblitz"),
  merkst: W("merkst"),
  bremst: W("bremst"),
  laengst: W("längst"),
  fakt: W("Übrigens"),
  schweiz: W("Schweiz"),
  app: W("Blitzer-App"),
  verboten: W("verboten"),
  oft: W("oft"),
  geblitzt: W("geblitzt"),
  kommentare: W("Kommentare"),
};

// ---------------------------------------------------------------- places
// The speed camera column stands at the origin on the right verge of the
// viewer's lane, turned towards the oncoming car (which drives towards -x in
// the near lane, z = 2.55). Its front windows: radar / laser on top, camera
// lens in the middle, the flash below. AMB = the ambulance analogy, far left
// on the road. GHOST = where the car was really measured (payoff).
export const BOX_YAW = 0.6;
const fx = Math.sin(BOX_YAW) * 0.33;
const fz = Math.cos(BOX_YAW) * 0.33;
export const RADAR = [fx, 2.5, fz];
export const LENS = [fx, 1.95, fz];
export const FLASH = [fx, 1.38, fz];
export const LANE = 2.55;
export const AMB_X = -46;
export const GHOST_X = 27;

// The flashes: red (visible) and infrared (invisible, drawn faint violet).
export const FLASHES = [
  { at: -0.04, ir: false },
  { at: T.blitz, ir: false },
  { at: T.aufleuchten + 0.15, ir: true },
  { at: T.foto + 0.35, ir: true },
  { at: T.schwarzblitz + 0.15, ir: true },
  { at: T.geblitzt + 0.05, ir: false },
];

// ---------------------------------------------------------------- shots
// `car: true` = the shot rides along with the viewer's car (positions are
// relative to the car's centre on the road; scene.js fills in `rel`).
export const shots = [
  // HOOK (cover shot): low on the wet road in front of the box, the car
  // brakes hard into frame, the red flash fires on frame 0
  {
    at: 0,
    from: [LENS[0] + 0.5, 1.95, LENS[2] + 0.35],
    to: [LENS[0] + 0.4, 1.9, LENS[2] + 0.3],
    look: [8, 0.9, 2.55],
    zoom: 1.0,
    tilt: 0,
  },
  // outside, wide: the box, the car braking past it, the flash still glowing
  {
    at: T.bremsen + 0.2,
    from: [10.5, 3.0, 11.8],
    to: [9.2, 2.5, 10.4],
    look: [1.2, 1.2, 1.4],
    zoom: 1.0,
  },
  // macro: the flash still glowing red, the lens above it
  {
    at: T.rettet + 0.5,
    from: [1.5, 1.6, 1.9],
    to: [1.1, 1.65, 1.4],
    look: [FLASH[0], 1.6, FLASH[2]],
    zoom: 1.0,
  },
  // BEAT 1 — "Stell dir vor": high, following the car down the dark road
  {
    at: T.stell,
    car: true,
    from: [9, 7, 9],
    to: [7, 5.5, 7],
    look: [-6, 0.6, 0],
    zoom: 1.2,
    whip: 1,
  },
  // over the bonnet: the grey box appears in the headlights ahead
  {
    at: T.kasten1 - 0.1,
    car: true,
    from: [0.3, 1.4, 0.3],
    to: [0.1, 1.38, 0.3],
    look: [-20, 0.7, -0.7],
    zoom: 1.0,
    tilt: 0,
  },
  // low at the front wheel: in die Eisen, the nose dips
  {
    at: T.eisen - 0.25,
    car: true,
    from: [-3.6, 0.45, 2.6],
    to: [-3.1, 0.5, 2.2],
    look: [-0.9, 0.5, 0.7],
    zoom: 1.1,
  },
  // BLITZ — from behind the box, the car flashed red
  {
    at: T.blitz - 0.12,
    from: [6.0, 4.8, 9.0],
    to: [5.2, 4.2, 8.0],
    look: [0.6, 1.0, 1.3],
    zoom: 1.0,
    whip: -1,
  },
  // manche leuchten nie auf: wide, dark, a car passes — nothing to see
  { at: T.manche, from: [-9, 3.4, 12], to: [-7.5, 3.0, 10.5], look: [0, 1.2, 1.5], zoom: 1.0 },
  // BEAT 2 — the box turns to glass: the radar inside
  { at: T.kasten2, orbit: { c: [0, 2.1, 0], r: 2.6, y: 2.6, a0: 1.3, a1: 0.7 }, zoom: 1.2 },
  // behind the box along the beam: blue waves fly out to the car
  { at: T.feuert, from: [5, 8.4, 28], to: [5.6, 7.8, 26], look: [6, 0.9, 1.6], zoom: 1.0 },
  // side wide: red waves come back, squeezed together (slow motion)
  {
    at: T.weil,
    from: [6.6, 4.4, 12.2],
    to: [7.2, 3.9, 11.2],
    look: [8.2, 0.9, 2.0],
    zoom: 1.0,
    whip: 1,
  },
  // analogy: the ambulance — its siren rings bunch up in front
  {
    at: T.sirene - 0.1,
    from: [AMB_X - 1, 17, 16],
    to: [AMB_X + 2, 16, 15],
    look: [AMB_X + 2, 0.5, 5.8],
    zoom: 1.0,
    whip: -1,
  },
  // je stärker gestaucht: the car's nose, waves slamming into it, faster
  {
    at: T.je,
    car: true,
    from: [-6.0, 1.6, 2.8],
    to: [-5.0, 1.4, 2.4],
    look: [0, 0.9, 0],
    zoom: 1.0,
  },
  // FOLGE: hero shot of the box, low (room under it for the pill)
  { at: T.folge, from: [3.4, 0.9, 5.4], to: [2.8, 0.85, 4.6], look: [0, 2.0, 0], zoom: 1.15 },
  // RATE MAL: close on the radar window, slow motion, stopwatch
  {
    at: T.rate,
    from: [2.0, 2.9, 2.8],
    to: [1.6, 2.75, 2.2],
    look: [RADAR[0], 2.3, RADAR[2]],
    zoom: 1.0,
  },
  // kürzer als ein Wimpernschlag: the car frozen in the beam
  {
    at: T.kuerzer,
    from: [3.2, 3.6, -2.2],
    to: [3.6, 3.2, -1.4],
    look: [18, 0.8, 2.6],
    zoom: 1.0,
    whip: 1,
  },
  // BEAT 3 — laser: the unit pops into the glass column
  {
    at: T.neuere,
    orbit: { c: [0, 2.3, 0], r: 2.4, y: 2.9, a0: -0.2, a1: 0.5 },
    zoom: 1.2,
    whip: -1,
  },
  // behind the box: hundreds of laser pulses race up the road
  { at: T.hunderte, from: [-9, 4.0, 0.8], to: [-8, 3.7, 1.1], look: [30, 1.0, 2.0], zoom: 1.0 },
  // high side view: the pulses reach the car far away
  { at: T.lange, from: [62, 9, 10], to: [60, 8, 9], look: [22, 0.8, 2.4], zoom: 1.0 },
  // the camera lens, macro
  {
    at: T.erst,
    from: [0.9, 2.1, 1.3],
    to: [0.6, 2.0, 0.95],
    look: [LENS[0], 1.95, LENS[2]],
    zoom: 1.0,
  },
  // through the lens: the car's front, viewfinder — click
  {
    at: T.foto - 0.1,
    from: [LENS[0] + 0.3, 1.95, LENS[2] + 0.2],
    to: [LENS[0] + 0.3, 1.9, LENS[2] + 0.2],
    look: [12, 0.9, 2.6],
    zoom: 1.0,
    tilt: 0,
  },
  // BEAT 3 end — Schwarzblitz: the car passes, the flash glows violet (IR)
  {
    at: T.schwarzblitz - 0.15,
    from: [4.4, 3.4, 8.8],
    to: [3.8, 3.1, 8.0],
    look: [0.2, 1.4, 0.5],
    zoom: 1.0,
  },
  // du merkst nichts: in the car, the box slides past outside
  {
    at: T.merkst,
    car: true,
    from: [0.35, 1.3, 0.38],
    to: [0.15, 1.28, 0.38],
    look: [-8, 0.9, -1.6],
    zoom: 1.0,
    tilt: 0,
  },
  // PAYOFF — high: the car brakes at the box, the ghost far back = measured
  {
    at: T.bremst,
    from: [GHOST_X + 13, 6.5, 7.5],
    to: [GHOST_X + 12, 6, 7],
    look: [13, 0.5, 2.4],
    zoom: 1.0,
  },
  // längst: down at the ghost where the measurement happened
  {
    at: T.laengst,
    from: [GHOST_X - 7, 2.4, 6.9],
    to: [GHOST_X - 6, 2.1, 6.4],
    look: [GHOST_X, 0.8, 2.55],
    zoom: 1.0,
    whip: 1,
  },
  // ÜBRIGENS: in the car, the phone in its holder — the warning app
  {
    at: T.fakt,
    car: true,
    from: [0.0, 1.27, 0.34],
    to: [-0.12, 1.24, 0.28],
    look: [-0.6, 1.24, 0.04],
    zoom: 1.0,
    tilt: 0,
  },
  // verboten: the X over the app
  {
    at: T.verboten - 0.1,
    car: true,
    from: [-0.22, 1.2, 0.2],
    to: [-0.28, 1.19, 0.16],
    look: [-0.6, 1.15, 0.04],
    zoom: 1.0,
    tilt: 0,
  },
  // LAST LINE: low hero, the box flashes the next car
  {
    at: T.oft - 0.1,
    from: [10, 2.8, 11.5],
    to: [9, 2.5, 10.5],
    look: [1.6, 1.2, 1.5],
    zoom: 1.0,
    whip: -1,
  },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Radar", at: T.radar, until: T.feuert, pos: RADAR, side: 1 },
  { text: "Laser", at: T.laser, until: T.hunderte, pos: RADAR, side: 1 },
  { text: "Kamera", at: T.kamera, until: T.foto - 0.1, pos: LENS, side: -1 },
  { text: "Schwarzblitz", at: T.schwarzblitz, until: T.merkst, pos: FLASH, side: -1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "shake", at: 0.0, dur: 0.55, amp: 0.9 },
  { kind: "zoom", at: T.blitzer1, amount: 0.25 },
  { kind: "shake", at: T.eisen, dur: 0.45, amp: 0.7 },
  { kind: "flash", at: T.blitz },
  { kind: "zoom", at: T.blitz, amount: 0.3 },
  { kind: "zoom", at: T.radar, amount: 0.25 },
  { kind: "slowmo", at: T.weil, until: T.sirene - 0.1, speed: 0.4 },
  { kind: "zoom", at: T.gestaucht1, amount: 0.3 },
  { kind: "shake", at: T.je + 0.2, dur: 0.35, amp: 0.4 },
  { kind: "slowmo", at: T.rate, until: T.kuerzer, speed: 0.35 },
  { kind: "flash", at: T.wimpern },
  { kind: "zoom", at: T.laser, amount: 0.3 },
  { kind: "zoom", at: T.lange, amount: 0.2 },
  { kind: "flash", at: T.foto + 0.35 },
  { kind: "zoom", at: T.laengst, amount: 0.3 },
  { kind: "shake", at: T.verboten, dur: 0.35, amp: 0.5 },
  { kind: "flash", at: T.geblitzt + 0.05 },
  { kind: "shake", at: T.geblitzt + 0.05, dur: 0.4, amp: 0.6 },
];

// ---------------------------------------------------------------- sound
// own sounds (scripts/sfx-extra.py): blitz = a speed camera's flash (charge
// whine + snap), reifen = tyres squealing under hard braking, sirene = a
// German two-tone siren passing by (pitch drops as it passes — Doppler)
export const SFX = [
  { s: "reifen", at: 0.0, db: -11 }, // frame 0: hard braking
  { s: "blitz", at: 0.0, db: -6 },
  { s: "rauschen", at: T.stell, dur: 2.2, db: -22 }, // driving at night
  { s: "reifen", at: T.eisen, db: -10 },
  { s: "blitz", at: T.blitz - 0.02, db: -6 },
  { s: "rauschen", at: T.manche, dur: 1.6, db: -22 },
  { s: "pop", at: T.radar },
  { s: "surr", at: T.feuert, dur: T.sirene - T.feuert - 0.2, db: -24 }, // the radar hums
  { s: "sirene", at: T.sirene - 0.1, db: -12 },
  { s: "pop", at: T.laser },
  { s: "surr", at: T.hunderte, dur: T.erst - T.hunderte, db: -23 },
  { s: "click", at: T.foto + 0.3 },
  { s: "blitz", at: T.geblitzt, db: -7 },
];
