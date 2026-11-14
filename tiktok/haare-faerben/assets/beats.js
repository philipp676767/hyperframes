// #86 Haare färben — every time-keyed decision as plain data (scene.js + build-sfx.mjs).
import { W } from "./timing.js";

export const T = {
  haar1: W("Haar", 1),
  bricht: W("bricht"),
  stell: W("Stell"),
  tannenzapfen: W("Tannenzapfen"),
  schuppen1: W("Schuppen", 1),
  keine: W("keine"),
  stinkt: W("stinkt"),
  ammoniak: W("Ammoniak"),
  aufquellen: W("aufquellen"),
  klappen: W("klappen"),
  verrueckte: W("Verrückte"),
  farblos: W("farblos"),
  winzige: W("Winzige"),
  innere: W("Innere"),
  rate: W("Rate"),
  peroxid: W("Peroxid"),
  hakt: W("hakt"),
  ketten: W("Ketten"),
  erst: W("Erst"),
  braun: W("braun"),
  rot: W("rot"),
  pink: W("pink"),
  klein: W("Klein"),
  gefangen: W("gefangen"),
  schiff: W("Schiff"),
  uebrigens: W("Übrigens"),
  heute: W("Heute", 2),
  welche: W("Welche"),
};

export const shots = [
  // hook: the brush slaps dye onto the giant hair — fast push-in from frame 0
  { at: 0, from: [2.3, 2.6, 3.3], to: [1.3, 2.1, 1.9], look: [0.1, 1.9, 0], zoom: 1.15 },
  // the dye beads off the scales
  { at: T.haar1, from: [1.3, 1.3, 1.5], to: [1.05, 1.55, 1.15], look: [0.35, 1.7, 0.3], zoom: 1.0 },
  // "Sie bricht ein": low, whip in, scales flick
  {
    at: T.bricht,
    from: [-1.9, 1.0, 2.3],
    to: [-1.3, 1.4, 1.8],
    look: [0, 1.9, 0],
    whip: 1,
    zoom: 1.1,
  },
  // establishing: the scalp forest at night, the bottle overhead
  { at: T.stell, from: [6.5, 4.2, 10.5], to: [4.6, 3.4, 8.2], look: [0, 3.2, -3] },
  // the pine cone next to the hair
  {
    at: T.tannenzapfen,
    from: [4.2, 2.0, 6.6],
    to: [3.5, 1.7, 5.6],
    look: [2.4, 1.2, 1.3],
    zoom: 1.2,
  },
  // macro: the closed scales
  { at: T.schuppen1, from: [1.0, 2.3, 1.4], to: [0.75, 2.05, 1.1], look: [0, 2.0, 0.2], zoom: 1.0 },
  // dye drops bounce off (slowmo)
  { at: T.keine, from: [1.6, 1.3, 1.8], to: [1.3, 1.5, 1.45], look: [0.2, 1.8, 0.3], zoom: 1.1 },
  // ammonia rolls in
  { at: T.stinkt, from: [3.8, 1.7, 5.2], to: [2.9, 1.6, 4.2], look: [0.3, 1.3, 0], zoom: 1.3 },
  // the hair swells
  { at: T.aufquellen, from: [0, 1.2, 3.6], to: [0, 1.6, 2.9], look: [0, 2.0, 0], zoom: 1.2 },
  // scales open — hair and pine cone together
  { at: T.klappen, from: [3.4, 2.8, 5.8], to: [2.8, 2.4, 4.9], look: [2.0, 1.4, 1.1], zoom: 1.25 },
  // x-ray on: orbit
  { at: T.verrueckte, orbit: { c: [0, 2.0, 0], r: 2.7, y: 2.5, a0: 0.95, a1: 0.25 } },
  // colourless particles slip in
  { at: T.farblos, from: [1.25, 2.25, 1.5], to: [0.9, 2.1, 1.1], look: [0, 2.0, 0], zoom: 1.0 },
  { at: T.winzige, from: [-1.2, 1.6, 1.5], to: [-0.95, 1.85, 1.15], look: [0, 2.0, 0], zoom: 1.0 },
  // into the inside, from above
  { at: T.innere, from: [0.5, 3.8, 1.5], to: [0.35, 3.3, 1.05], look: [0, 2.2, 0], zoom: 1.0 },
  // quiet moment before the reveal
  { at: T.rate, from: [1.9, 2.2, 2.3], to: [1.6, 2.1, 2.0], look: [0, 2.0, 0], zoom: 1.0 },
  // peroxide fizz
  {
    at: T.peroxid,
    from: [-1.4, 2.5, 1.6],
    to: [-1.05, 2.25, 1.25],
    look: [0, 2.0, 0],
    zoom: 1.0,
    whip: -1,
  },
  // chains snap together (slowmo)
  { at: T.hakt, from: [0.75, 2.35, 0.95], to: [0.55, 2.2, 0.78], look: [0, 2.1, 0], zoom: 1.0 },
  // colours: orbit
  { at: T.erst, orbit: { c: [0, 2.1, 0], r: 1.25, y: 2.5, a0: -0.7, a1: 0.5 } },
  // scales close: trapped
  { at: T.klein, from: [1.6, 2.0, 2.7], to: [1.25, 2.0, 2.2], look: [0, 2.0, 0], zoom: 1.1 },
  // ship in a bottle
  {
    at: T.schiff,
    from: [-3.3, 1.4, 4.6],
    to: [-3.8, 1.1, 4.0],
    look: [-4.8, 0.65, 2.6],
    zoom: 1.0,
    whip: -1,
  },
  // Übrigens: the colour wave runs through the forest
  { at: T.uebrigens, from: [4.6, 1.6, 7.5], to: [-2.5, 2.4, 8.4], look: [0, 3.4, -5] },
  { at: T.heute, from: [-5.5, 3.0, 6.5], to: [-4.2, 2.6, 5.0], look: [0, 2.8, -2] },
  // CTA: the freshly coloured hair, glossy
  { at: T.welche, from: [1.3, 2.7, 1.9], to: [0.95, 2.45, 1.45], look: [0, 2.4, 0], zoom: 1.0 },
];

export const LABELS = [
  { text: "Schuppen", at: T.schuppen1, until: T.keine, pos: [0.42, 2.05, 0.36], side: 1 },
  { text: "Ammoniak", at: T.ammoniak, until: T.aufquellen, pos: [1.5, 0.75, 1.3], side: 1 },
  { text: "Peroxid", at: T.peroxid, until: T.hakt, pos: [-0.15, 2.0, 0.25], side: -1 },
];

export const HIGHLIGHTS = [
  { kind: "shake", at: 0.32, dur: 0.35, amp: 0.7 }, // the brush slaps
  { kind: "zoom", at: T.haar1, amount: 0.25 },
  { kind: "flash", at: T.bricht },
  { kind: "slowmo", at: T.keine, until: T.stinkt, speed: 0.4 }, // drops bounce off
  { kind: "zoom", at: T.aufquellen, amount: 0.3 },
  { kind: "shake", at: T.klappen + 0.1, dur: 0.4, amp: 0.6 },
  { kind: "flash", at: T.peroxid },
  { kind: "slowmo", at: T.hakt, until: T.erst, speed: 0.45 }, // chains snap together
  { kind: "zoom", at: T.gefangen, amount: 0.3 },
  { kind: "flash", at: T.uebrigens },
];

export const SFX = [
  { s: "splat", at: 0.28, db: -6 },
  { s: "splat", at: 0.55, db: -12 },
  { s: "splat", at: T.keine - 0.05, db: -10 },
  { s: "zisch", at: T.stinkt, dur: 1.6, db: -19 },
  { s: "klack", at: T.klappen + 0.1, db: -10 },
  { s: "zisch", at: T.peroxid, dur: 1.8, db: -18 },
  { s: "click", at: T.hakt + 0.3, db: -12 },
  { s: "click", at: T.hakt + 0.6, db: -14 },
  { s: "klack", at: T.gefangen, db: -9 },
  { s: "pop", at: T.schiff + 0.25 },
];
