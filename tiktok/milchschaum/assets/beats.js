// #74 Milchschaum — every time-keyed decision as plain data (scene + sound).
import { W } from "./timing.js";

// ---------------------------------------------------------------- places
export const CUP = [6.5, 0, 3.0]; // the cappuccino cup (heart)
export const MAC = [0, 80, 0]; // "inside the milk" macro world (enclosed)
export const COW = [-6.9, 0, 1.2]; // milk cartons
export const OAT = [-4.3, 0, 1.9];
const add = (a, b) => a.map((v, i) => v + b[i]);
const C = (b) => add(CUP, b);
const Mc = (b) => add(MAC, b);

// ---------------------------------------------------------------- beats
export const T = {
  killt: W("killt"),
  duese: W("Düse"),
  luft: W("Luft", 1),
  keine: W("keine"),
  kaefigen: W("Käfigen"),
  wer: W("Wer"),
  eiweiss: W("Eiweiß", 1),
  faltet: W("faltet"),
  legt: W("legt"),
  haut: W("Haut"),
  tiefer: W("Tiefer"),
  strudel: W("Strudel"),
  glaenzt: W("glänzt"),
  lack: W("Lack"),
  folge: W("Folge"),
  hafer: W("Hafermilch"),
  dreimal: W("dreimal"),
  darum: W("Darum"),
  oel: W("Öl"),
  zusaetze: W("Zusätze"),
  herz: W("Herz", 1),
  leichter: W("leichter"),
  hoch: W("hoch"),
  crema: W("Crema"),
  nah: W("nah"),
  zack: W("Zack"),
  zuheiss: W("Und", 4),
  rate: W("Rate"),
  stirbt: W("stirbt"),
  siebzig: W("70"),
  hart: W("hart"),
  reissen: W("reißen"),
  fakt: W("Übrigens"),
  zweites: W("zweites"),
  verbraucht: W("verbraucht"),
  kriegst: W("Kriegst"),
};

// ---------------------------------------------------------------- shots
export const shots = [
  // hook: the jug screaming under the wand, foam collapsing — push in fast
  { at: 0, from: [3.0, 6.2, 4.6], to: [1.9, 4.9, 2.9], look: [0.1, 2.3, 0], zoom: 1.0 },
  // top-down onto the dying foam
  { at: T.killt, from: [0.7, 6.6, 1.8], to: [0.35, 5.0, 1.0], look: [0, 2.4, 0], zoom: 1.0 },
  // the bar: machine, wand, jug with cold milk
  {
    at: T.duese,
    from: [7.5, 7.2, 12.5],
    to: [5.6, 6.0, 10],
    look: [-0.5, 3.2, -2],
    zoom: 1.0,
    whip: 1,
  },
  // macro: the tip at the surface sucks air in
  { at: T.luft, from: [2.6, 3.3, 2.6], to: [1.8, 2.9, 1.8], look: [0.4, 2.35, 0.15], zoom: 1.0 },
  // inside the milk: bubbles
  { at: T.keine, from: Mc([0.5, 1.2, 10]), to: Mc([0.2, 0.6, 6.5]), look: MAC, zoom: 1.0 },
  { at: T.kaefigen, from: Mc([3.0, 1.2, 3.4]), to: Mc([1.4, 1.0, 3.9]), look: MAC, zoom: 1.0 },
  {
    at: T.eiweiss,
    from: Mc([-3.6, 3.4, 6.2]),
    to: Mc([-2.6, 2.6, 4.8]),
    look: Mc([0, 1.4, 0]),
    zoom: 1.0,
    whip: -1,
  },
  { at: T.haut, from: Mc([-2.2, 0.8, 2.8]), to: Mc([-0.6, 0.6, 3.2]), look: MAC, zoom: 1.0 },
  // x-ray jug: deeper, the whirlpool
  { at: T.tiefer, from: [4.6, 3.9, 5.2], to: [3.6, 3.4, 4.1], look: [0, 2.2, 0], zoom: 1.0 },
  {
    at: T.strudel,
    from: [0.3, 7.4, 0.9],
    to: [0.2, 5.8, 0.7],
    look: [0, 2.8, 0],
    zoom: 1.0,
    whip: 1,
  },
  // glossy microfoam, low glancing light
  { at: T.glaenzt, from: [2.6, 5.0, 1.4], to: [2.0, 4.4, 1.0], look: [0, 2.8, 0], zoom: 1.0 },
  // follow line: slow orbit around jug + hand
  { at: T.folge, orbit: { c: [0, 2.4, 0], r: 6.2, y: 4.2, a0: 0.95, a1: 0.35 }, zoom: 1.0 },
  // milk cartons
  {
    at: T.hafer,
    from: [-2.6, 4.4, 9.5],
    to: [-3.6, 3.9, 7.6],
    look: [-5.6, 2.1, 1.5],
    zoom: 1.0,
    whip: -1,
  },
  { at: T.darum, from: [-1.8, 4.8, 6.4], to: [-2.6, 4.2, 5.0], look: [-4.3, 2.6, 1.9], zoom: 1.0 },
  // the cup
  {
    at: T.herz,
    from: C([2.8, 5.4, 5.0]),
    to: C([1.9, 4.2, 3.6]),
    look: C([0, 1.2, 0]),
    zoom: 1.0,
    whip: 1,
  },
  {
    at: T.leichter,
    from: C([0.4, 1.9, 6.4]),
    to: C([0.8, 1.6, 5.2]),
    look: C([0, 1.0, 0]),
    zoom: 1.0,
  },
  {
    at: T.hoch,
    from: C([1.4, 4.6, 13]),
    to: C([0.8, 4.2, 11]),
    look: C([-0.6, 3.4, 0]),
    zoom: 1.0,
  },
  { at: T.nah, from: C([1.4, 4.4, 5.0]), to: C([0.9, 3.9, 4.0]), look: C([0, 1.3, 0]), zoom: 1.0 },
  {
    at: T.zack,
    from: C([0.25, 6.8, 1.3]),
    to: C([0.12, 5.3, 0.8]),
    look: C([0, 1.35, 0]),
    zoom: 1.0,
  },
  // too hot: back under the wand, the needle climbs
  {
    at: T.zuheiss,
    from: [-3.8, 4.3, 5.4],
    to: [-2.7, 3.6, 4.0],
    look: [0, 2.5, 0],
    zoom: 1.0,
    whip: -1,
  },
  // inside the milk: the cages turn hard and tear
  { at: T.siebzig, from: Mc([2.4, 1.2, 6.4]), to: Mc([1.6, 0.8, 4.8]), look: MAC, zoom: 1.0 },
  { at: T.reissen, from: Mc([1.4, 0.6, 3.6]), to: Mc([0.2, 0.5, 3.4]), look: MAC, zoom: 1.0 },
  // second time: the milk stays flat
  { at: T.fakt, from: [4.6, 5.8, 6.2], to: [3.6, 5.0, 4.8], look: [0, 2.6, 0], zoom: 1.0, whip: 1 },
  // the hero: the heart in the cup
  {
    at: T.kriegst,
    from: C([2.4, 4.2, 3.0]),
    to: C([1.1, 3.8, 2.7]),
    look: C([0, 1.3, 0]),
    zoom: 1.0,
  },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Dampfdüse", at: T.duese, until: T.luft, pos: [1.6, 4.4, -0.9], side: 1 },
  { text: "Eiweiß", at: T.eiweiss + 0.1, until: T.legt, pos: Mc([0, 2.25, 0]), side: 1 },
  { text: "Strudel", at: T.strudel, until: T.glaenzt, pos: [0.5, 2.9, 0.2], side: 1 },
  { text: "Kuhmilch", at: T.hafer + 0.2, until: T.darum, pos: add(COW, [0, 3.0, 0.7]), side: -1 },
  { text: "Hafermilch", at: T.hafer + 0.5, until: T.darum, pos: add(OAT, [0, 3.0, 0.7]), side: 1 },
  { text: "Barista", at: T.darum + 0.6, until: T.herz, pos: add(OAT, [0.3, 2.2, 0.75]), side: 1 },
  { text: "Crema", at: T.crema, until: T.zack, pos: C([1.1, 1.36, 0.5]), side: 1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "flash", at: T.killt },
  { kind: "shake", at: T.killt, dur: 0.45, amp: 0.8 },
  { kind: "zoom", at: T.luft, amount: 0.25 },
  { kind: "zoom", at: T.kaefigen, amount: 0.3 },
  { kind: "slowmo", at: T.faltet, until: T.haut, speed: 0.45 },
  { kind: "zoom", at: T.strudel, amount: 0.3 },
  { kind: "flash", at: T.lack },
  { kind: "zoom", at: T.oel, amount: 0.25 },
  { kind: "flash", at: T.zack },
  { kind: "zoom", at: T.zack, amount: 0.3 },
  { kind: "shake", at: T.siebzig, dur: 0.5, amp: 0.7 },
  { kind: "slowmo", at: T.reissen, until: T.fakt, speed: 0.4 },
  { kind: "zoom", at: T.verbraucht, amount: 0.25 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "zisch", at: 0, dur: T.duese - 0.1, db: -11 }, // the wand screams on frame 0
  { s: "blubb", at: 0.5, db: -10 }, // foam bubbles bursting
  { s: "blubb", at: T.killt + 0.1, db: -9 },
  { s: "zisch", at: T.duese, dur: T.tiefer - T.duese, db: -21 },
  { s: "rauschen", at: T.tiefer, dur: T.folge - T.tiefer, db: -22 }, // deep: the whirlpool roars
  { s: "pop", at: T.hafer + 0.15 },
  { s: "pop", at: T.hafer + 0.45 },
  { s: "pop", at: T.oel + 0.2, db: -12 },
  { s: "pop", at: T.herz + 0.1 },
  { s: "zisch", at: T.zuheiss, dur: T.siebzig - T.zuheiss, db: -18 },
  { s: "blubb", at: T.reissen + 0.05, db: -8 },
  { s: "zisch", at: T.fakt + 0.1, dur: T.verbraucht - T.fakt, db: -22 },
];
