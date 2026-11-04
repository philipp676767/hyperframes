// #60 Bluetooth-Kopfhörer — every time-keyed decision as plain data (scene.js
// reads it for the picture, scripts/build-sfx.mjs for the sound).
import { W } from "./timing.js";

export const T = {
  nie: W("nie", 1),
  fremde1: W("fremde", 1),
  musik1: W("Musik", 1),
  stell: W("Stell"),
  gym: W("Gym"),
  alle1: W("alle", 1),
  funken1: W("funken", 1),
  trotzdem: W("Trotzdem"),
  song: W("Song"),
  handy1: W("Handy", 1),
  es: W("Es"),
  zerhackt: W("zerhackt"),
  in: W("In"),
  pakete1: W("Pakete", 1),
  jedes1: W("Jedes", 1),
  n79: W("79"),
  funkkanaelen: W("Funkkanälen"),
  genau: W("Genau"),
  wlan: W("WLAN"),
  mikro1: W("Mikrowelle", 1),
  wie1: W("Wie", 1),
  folge: W("Folge"),
  rate: W("Rate"),
  springt1: W("springt", 1),
  mal1600: W("1600-mal"),
  handy2: W("Handy", 2),
  beide: W("Beide"),
  reihenfolge: W("Reihenfolge"),
  fremde2: W("Fremde", 2),
  verpassen: W("verpassen"),
  ist: W("Ist"),
  belegt: W("belegt"),
  streichen: W("streichen"),
  nur: W("Nur"),
  mikro2: W("Mikrowelle", 2),
  wirds: W("wird's"),
  eng: W("eng"),
  darum: W("Darum"),
  takt: W("Takt"),
  fakt: W("Übrigens"),
  wikinger: W("Wikingerkönig"),
  harald: W("Harald"),
  blauzahn: W("Blauzahn"),
  logo: W("Logo"),
  runen: W("Runen"),
  airpods: W("AirPods"),
  verloren: W("verloren"),
};

// ---------------------------------------------------------------- places
// athlete on the bench at the origin (facing +z); his left earbud ≈ (0.6, 4.6, -0.1),
// the phone lies on the bench at PHONE; the channel fan spans the gap and
// bulges to the right (+x). The viking set pops in front left (VIK).
export const PHONE = [2.5, 1.86, 0.35];
export const FAN_C = [1.75, 3.3, 0.1];
export const VIK = [-8.2, 0, 5.2];
export const ROUTER = [15.2, 3.9, -3.0];
export const MICRO = [18.6, 3.9, -3.2];

// ---------------------------------------------------------------- shots
export const shots = [
  // hook (cover shot): the earbud big, the viewer's finger taps it, rings burst
  { at: 0, from: [3.0, 5.3, 3.7], to: [2.2, 5.0, 2.65], look: [0.45, 4.5, -0.1], zoom: 1 },
  // a pink note from the woman on the box flies at his ear — bounces off
  { at: T.nie, from: [3.6, 5.6, 6.2], to: [3.1, 5.4, 5.4], look: [-1.6, 4.6, -3.0], zoom: 1 },
  // wide: the basement gym, Monday evening
  { at: T.stell, from: [10, 8.6, 17], to: [8.4, 7.8, 14.6], look: [-1.5, 3.6, -5], zoom: 1 },
  // high over the crowd: everybody radiates
  { at: T.alle1, from: [7, 10.5, 15], to: [4, 10, 13.5], look: [-7, 3.5, -5], zoom: 1, whip: 1 },
  // athlete + phone: his own song (yellow notes) flows to his ear
  { at: T.trotzdem, from: [3.2, 4.0, 8.6], to: [2.6, 3.8, 7.4], look: [1.2, 3.2, 0], zoom: 1 },
  // macro: the phone on the bench, a big note rises out of it
  { at: T.handy1, from: [4.4, 3.6, 2.8], to: [3.9, 3.3, 2.2], look: [2.4, 2.4, 0.3], zoom: 1 },
  // the note in the air — zerhackt
  { at: T.es, from: [3.3, 3.9, 4.6], to: [3.0, 3.75, 4.0], look: [1.6, 3.3, 0.1], zoom: 1 },
  // packets: a stream from the phone to the ear
  {
    at: T.in,
    from: [4.0, 3.4, 5.2],
    to: [3.4, 3.4, 4.8],
    look: [1.5, 3.3, 0.1],
    zoom: 1,
    whip: -1,
  },
  // the 79 channels grow — front view on the whole fan
  { at: T.jedes1, from: [1.6, 3.6, 8.6], to: [1.6, 3.5, 7.6], look: [1.45, 3.35, 0], zoom: 1 },
  // the counter: router + microwave start sending too
  {
    at: T.genau,
    from: [12.4, 6.8, 6.5],
    to: [13.2, 6.3, 5.2],
    look: [17.0, 4.6, -3.0],
    zoom: 1,
    whip: 1,
  },
  // back to the fan: red noise everywhere
  { at: T.wie1, from: [3.6, 4.2, 6.0], to: [3.0, 4.0, 5.4], look: [1.6, 3.3, 0], zoom: 1 },
  // follow line: the whole athlete, wide
  { at: T.folge, from: [6.5, 7.0, 13], to: [5.5, 6.6, 11.5], look: [0.8, 3.6, 0], zoom: 1 },
  // rate mal (slow motion): earbud + top of the fan, counter runs up
  { at: T.rate, from: [2.6, 5.2, 4.4], to: [2.2, 5.0, 3.6], look: [1.0, 4.3, 0], zoom: 1 },
  // 1.600-mal: the whole fan, packets hopping like mad
  { at: T.mal1600, from: [2.4, 3.5, 6.4], to: [2.0, 3.4, 6.0], look: [1.7, 3.3, 0], zoom: 1 },
  // phone and earbud blink in sync
  {
    at: T.handy2,
    from: [-0.6, 3.6, 6.0],
    to: [-0.2, 3.5, 5.4],
    look: [1.5, 3.2, 0],
    zoom: 1,
    whip: -1,
  },
  // the secret order: the yellow path draws through the fan
  { at: T.beide, from: [3.4, 2.4, 3.6], to: [3.0, 2.9, 3.3], look: [2.0, 2.9, 0.1], zoom: 1 },
  // strangers hop differently (orbit)
  { at: T.fremde2, orbit: { c: [1.7, 3.3, 0], r: 5.6, y: 3.9, a0: 0.55, a1: -0.15 }, zoom: 1 },
  // a channel is busy → crossed out
  { at: T.ist, from: [3.2, 3.6, 3.9], to: [2.9, 3.5, 3.4], look: [2.1, 3.4, 0.1], zoom: 1 },
  // the running microwave
  {
    at: T.nur,
    from: [16.0, 5.6, 3.4],
    to: [16.7, 5.2, 2.4],
    look: [18.4, 4.6, -3.2],
    zoom: 1,
    whip: 1,
  },
  // … and the fan stutters
  { at: T.wirds, from: [2.6, 3.4, 5.6], to: [2.4, 3.4, 5.0], look: [1.7, 3.3, 0], zoom: 1 },
  // payoff: everybody in their own rhythm
  { at: T.darum, from: [5, 10.5, 18], to: [3.5, 10, 16], look: [-6, 3.6, -5], zoom: 1 },
  // Übrigens: the runestone pops up
  {
    at: T.fakt,
    from: [-4.6, 5.0, 14.5],
    to: [-5.4, 4.6, 12.6],
    look: [-8.6, 3.4, 5.2],
    zoom: 1,
    whip: -1,
  },
  // close on the king: the blue tooth
  {
    at: T.harald,
    from: [-8.2, 5.4, 11.4],
    to: [-8.8, 5.3, 10.6],
    look: [-10.6, 4.9, 6.0],
    zoom: 1,
  },
  // the logo: runes melt into the Bluetooth sign
  { at: T.logo, from: [-5.8, 4.2, 11.8], to: [-6.5, 4.0, 10.8], look: [-8.2, 3.2, 5.2], zoom: 1 },
  // last line: his earbud drops and rolls under the bench
  { at: T.airpods, from: [4.2, 2.8, 7.6], to: [3.6, 2.4, 6.6], look: [0.8, 2.2, 0], zoom: 1 },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Pakete", at: T.pakete1 + 0.05, until: T.jedes1 + 0.6, pos: [2.0, 3.0, 0.2], side: 1 },
  { text: "Funkkanal", at: T.funkkanaelen, until: T.genau, pos: [3.05, 3.85, 0.0], side: 1 },
  { text: "WLAN", at: T.wlan, until: T.wie1, pos: [15.2, 4.6, -3.0], side: -1 },
  { text: "Mikrowelle", at: T.mikro1, until: T.wie1, pos: [18.3, 5.4, -3.0], side: 1 },
  { text: "Reihenfolge", at: T.reihenfolge, until: T.fremde2, pos: [2.2, 3.45, 0.1], side: 1 },
  { text: "Harald Blauzahn", at: T.blauzahn, until: T.logo, pos: [-10.9, 5.9, 5.0], side: 1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "flash", at: 0.32 },
  { kind: "zoom", at: 0.35, amount: 0.25 },
  { kind: "shake", at: T.musik1, dur: 0.35, amp: 0.6 },
  { kind: "flash", at: T.funken1 },
  { kind: "flash", at: T.zerhackt },
  { kind: "shake", at: T.zerhackt, dur: 0.5, amp: 0.9 },
  { kind: "zoom", at: T.n79, amount: 0.3 },
  { kind: "shake", at: T.mikro1, dur: 0.4, amp: 0.6 },
  { kind: "slowmo", at: T.rate, until: T.mal1600, speed: 0.3 },
  { kind: "flash", at: T.mal1600 },
  { kind: "zoom", at: T.mal1600, amount: 0.35 },
  { kind: "zoom", at: T.reihenfolge, amount: 0.25 },
  { kind: "flash", at: T.streichen },
  { kind: "shake", at: T.eng, dur: 0.5, amp: 0.9 },
  { kind: "flash", at: T.takt },
  { kind: "zoom", at: T.blauzahn, amount: 0.3 },
  { kind: "flash", at: T.logo + 0.35 },
  { kind: "shake", at: T.airpods + 0.62, dur: 0.3, amp: 0.5 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "funk", at: 0.3, db: -9 }, // frame 0: the tap, the signal bursts out
  { s: "boing", at: T.musik1, db: -12 }, // the stranger's note bounces off
  { s: "funk", at: T.funken1, db: -13 },
  { s: "pop", at: T.handy1 + 0.4 },
  { s: "funk", at: T.jedes1 + 0.2, db: -12 },
  { s: "surr", at: T.jedes1, dur: 2.4, db: -22 },
  { s: "mikro", at: T.mikro1, db: -12 },
  { s: "rauschen", at: T.wie1, dur: 0.9, db: -18 },
  { s: "funk", at: T.mal1600, db: -9 },
  { s: "piep", at: T.handy2 + 0.1, dur: 1.0, db: -20 },
  { s: "click", at: T.streichen + 0.05 },
  { s: "mikro", at: T.nur, db: -12 },
  { s: "pop", at: T.fakt + 0.1 },
  { s: "pop", at: T.wikinger + 0.05 },
  { s: "klack", at: T.airpods + 0.62 },
  { s: "boing", at: T.airpods + 0.9, db: -14 },
];
