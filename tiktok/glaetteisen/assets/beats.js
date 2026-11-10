// #66 Glätteisen — every time-keyed decision as plain data (scene.js +
// scripts/build-sfx.mjs). No three.js / DOM here.
//
// Places (1 unit = 10 cm):
//   VANITY (origin) — a vanity table with a Hollywood mirror on a rainy
//     winter morning; a wet strand hangs from above (your head is just out
//     of frame), your hand clamps the flat iron on it.
//   LEITER — one keratin "rope ladder": two chains + yellow bridges, in a
//     warm dark space; it waves, cracks, gets pressed straight, re-snaps.
//   HAAR — one giant hair cut open: scales outside, water beads inside that
//     boil into steam bubbles; it snaps.
//   OFEN — an oven on full blast (the comparison).
import { W } from "./timing.js";

export const LEITER = [0, -80, 0];
export const HAAR = [0, -160, 0];
export const OFEN = [0, -240, 0];
export const L = (x, y, z) => [x + LEITER[0], y + LEITER[1], z + LEITER[2]];
export const H = (x, y, z) => [x + HAAR[0], y + HAAR[1], z + HAAR[2]];
export const O = (x, y, z) => [x + OFEN[0], y + OFEN[1], z + OFEN[2]];
// the strand hangs at x = 0, z = 0 from y = 22 down to STRAND_END
export const STRAND_END = 3.2;
export const BAR = [-7.5, 0, 1.5]; // the chocolate bar on one hair (x, -, z)
export const CURLY = -2.6; // x of the curly strand for "Team Locken"

// ---------------------------------------------------------------- beats
export const T = {
  zischt: W("Zischt"),
  dann: W("Dann"),
  kocht1: W("kocht", 1),
  und: W("Und", 1),
  stell: W("Stell"),
  spaet: W("spät"),
  haare: W("Haare"),
  feucht: W("feucht"),
  klemmen: W("Klemmen"),
  ziehen: W("ziehen"),
  pfff: W("Pfff"),
  dampf1: W("Dampf", 1),
  jedes: W("Jedes"),
  leiter: W("Strickleiter"),
  ketten: W("Ketten"),
  dazwischen: W("dazwischen"),
  bruecken: W("Brücken"),
  die: W("Die", 1),
  wellen: W("Wellen"),
  hitze: W("Hitze"),
  knackt1: W("knackt", 1),
  platten1: W("Platten", 1),
  pressen: W("pressen"),
  abgekuehlt: W("abgekühlt"),
  rasten: W("rasten"),
  nur: W("Nur"),
  wasser1: W("Wasser", 1),
  knackt2: W("knackt", 2),
  darum: W("Darum"),
  regen: W("Regen"),
  folge: W("Folge"),
  rate: W("Rate"),
  platten2: W("Platten", 2),
  bis: W("Bis", 1),
  grad230: W("230"),
  fast: W("Fast"),
  backofen: W("Backofen"),
  dein2: W("Dein", 5),
  feuchtes: W("feuchtes"),
  schwamm: W("Schwamm"),
  das: W("Das", 1),
  kocht2: W("kocht", 2),
  grad100: W("100", 1),
  mitten: W("Mitten"),
  dampf2: W("Dampf", 2),
  ausgang: W("Ausgang"),
  blaeht: W("bläht"),
  loecher: W("Löcher"),
  zischen: W("Zischen"),
  blasen: W("Blasen"),
  danach: W("Danach"),
  bricht: W("bricht"),
  fakt: W("Übrigens"),
  einziges: W("einziges"),
  haelt: W("hält"),
  gramm: W("Gramm"),
  team: W("Team", 1),
  locken: W("Locken"),
};

// iron path on the strand (y of the plate centre): parked at 12.5 in the
// hook, clamps on "Klemmen", slides down on "ziehen" → the end
export const IRON = {
  park: 12.0,
  slideFrom: 12.6,
  slideTo: 4.2,
};

// ---------------------------------------------------------------- shots
export const shots = [
  // hook: macro on the clamped iron, steam bursting out, fast push-in
  { at: 0, from: [-4.4, 15.6, 6.4], to: [-2.6, 14.2, 4.2], look: [0.6, 11.6, 0], zoom: 1 },
  // closer: the steam jets out between the plates
  { at: T.dann, from: [-2.4, 12.9, 3.3], to: [-1.6, 12.4, 2.5], look: [0, 12.0, 0], zoom: 1 },
  // "von innen": inside one hair, the water starts to boil (teaser)
  {
    at: T.und,
    from: H(-8.5, 2.2, 12.5),
    to: H(-6.8, 1.6, 10.4),
    look: H(0.5, 0, 0),
    zoom: 1,
    whip: 1,
  },
  // wide: the vanity, the mirror, the phone alarm, the rainy window
  { at: T.stell, from: [8.0, 10.5, 22], to: [5.6, 9.6, 18.4], look: [0, 8.2, -1], zoom: 1 },
  // the wet strand, drops running down
  { at: T.haare, from: [2.2, 8.6, 5.4], to: [1.6, 8.0, 4.2], look: [0, 7.6, 0], zoom: 1 },
  // the iron closes and slides
  {
    at: T.klemmen,
    from: [4.8, 14.8, 7.6],
    to: [4.2, 11.0, 7.4],
    look: [0, 12.0, 0],
    lookTo: [0, 7.6, 0],
    zoom: 1,
  },
  // Pfff: steam explosion
  {
    at: T.pfff,
    from: [-3.6, 10.2, 6.2],
    to: [-3.0, 6.6, 5.2],
    look: [0.4, 9.6, 0],
    lookTo: [0.4, 6.0, 0],
    zoom: 1,
  },
  // the keratin rope ladder (orbit)
  {
    at: T.jedes,
    orbit: { c: L(0, 0, 0), r: 12.5, y: LEITER[1] + 3.2, a0: 0.75, a1: 0.25 },
    zoom: 1,
  },
  // close on the bridges
  { at: T.dazwischen, from: L(1.6, 1.2, 5.6), to: L(0.8, 0.8, 4.4), look: L(0.6, 0, 0), zoom: 1 },
  // the bridges hold the waves (wide)
  { at: T.die, from: L(-3.5, 2.0, 13.5), to: L(-2.4, 1.6, 12.2), look: L(0, 0, 0), zoom: 1 },
  // heat cracks them
  {
    at: T.hitze,
    from: L(2.8, 1.6, 7.4),
    to: L(2.0, 1.1, 6.2),
    look: L(0.6, 0, 0),
    zoom: 1,
    whip: -1,
  },
  // the plates press everything straight
  { at: T.platten1, from: L(-1.5, 1.2, 14.5), to: L(-0.8, 0.8, 13.0), look: L(0, 0, 0), zoom: 1 },
  // cooled: they snap in, straight
  {
    at: T.abgekuehlt,
    orbit: { c: L(0, 0, 0), r: 9.5, y: LEITER[1] + 2.4, a0: -0.55, a1: -0.15 },
    zoom: 1,
  },
  // water breaks them again
  { at: T.nur, from: L(3.4, 2.4, 9.0), to: L(2.4, 1.6, 7.6), look: L(0.4, 0, 0), zoom: 1, whip: 1 },
  // rain on the window, the strand frizzes back
  { at: T.darum, from: [-5.6, 10.4, 9.8], to: [-4.6, 9.6, 8.4], look: [5.5, 8.6, -3.5], zoom: 1 },
  // follow: the iron resting on its mat, high in the frame
  { at: T.folge, from: [0.4, 7.4, 12.8], to: [0.2, 6.6, 11.2], look: [2.2, -0.9, 3.8], zoom: 1 },
  // Rate mal: the display climbs, plates start to glow
  { at: T.rate, from: [4.6, 3.6, 6.4], to: [3.8, 3.0, 5.2], look: [1.6, 0.7, 2.4], zoom: 1 },
  // 230 °C: plates red hot
  { at: T.bis, from: [-0.8, 3.6, 5.8], to: [-0.4, 3.0, 4.6], look: [0.6, 0.6, 2.4], zoom: 1 },
  // the oven on full blast
  { at: T.fast, from: O(4.2, 4.2, 12.4), to: O(2.8, 3.5, 10.2), look: O(0, 2.6, 0), zoom: 1 },
  // inside the wet hair: full of water like a sponge
  {
    at: T.dein2,
    from: H(-6.8, 2.0, 9.8),
    to: H(-5.2, 1.4, 8.0),
    look: H(0, 0, 0),
    zoom: 1,
    whip: -1,
  },
  // the hot plates clamp the hair from outside
  { at: T.das, from: H(5.8, 3.6, 14.5), to: H(4.6, 2.8, 12.6), look: H(0, 0, 0), zoom: 1 },
  // mitten im Haar: the water boils
  { at: T.mitten, from: H(2.6, 0.9, 7.4), to: H(1.8, 0.6, 6.0), look: H(0.4, 0, 0), zoom: 1 },
  // the bubbles grow, the hair bulges (slowmo)
  {
    at: T.dampf2,
    orbit: { c: H(0, 0, 0), r: 9.0, y: HAAR[1] + 2.2, a0: 0.55, a1: -0.15 },
    zoom: 1,
  },
  // answer: bubbles in your hair
  { at: T.zischen, from: H(-3.4, 1.2, 8.4), to: H(-2.6, 0.8, 7.0), look: H(-0.4, 0, 0), zoom: 1 },
  // it snaps
  { at: T.danach, from: H(3.2, 2.6, 13.0), to: H(2.2, 2.0, 11.0), look: H(0, 0, 0), zoom: 1 },
  // one hair holds a 100 g bar of chocolate
  {
    at: T.fakt,
    from: [BAR[0] + 3.2, 6.6, BAR[2] + 8.2],
    to: [BAR[0] + 2.2, 6.0, BAR[2] + 6.6],
    look: [BAR[0], 6.0, BAR[2]],
    lookTo: [BAR[0], 4.0, BAR[2]],
    zoom: 1,
  },
  {
    at: T.haelt,
    from: [BAR[0] - 1.8, 4.6, BAR[2] + 4.6],
    to: [BAR[0] - 1.2, 4.3, BAR[2] + 3.6],
    look: [BAR[0], 4.9, BAR[2]],
    zoom: 1,
  },
  // Team glatt oder Team Locken: the two strands side by side
  { at: T.team, from: [-0.6, 11.8, 14.2], to: [-0.9, 11.0, 12.4], look: [-1.3, 10.4, 0], zoom: 1 },
];

// ---------------------------------------------------------------- labels
export const LABELS = [
  { text: "Glätteisen", at: T.stell + 0.3, until: T.haare, pos: [1.3, 12.6, 0.3], side: 1 },
  { text: "Brücken", at: T.bruecken, until: T.die + 0.4, pos: L(0.6, 0, 0.1), side: 1 },
  { text: "Platten", at: T.platten1 + 0.2, until: T.abgekuehlt, pos: L(-3.0, 3.1, 0.6), side: -1 },
  { text: "Wasser", at: T.wasser1 + 0.2, until: T.darum, pos: L(1.6, 1.4, 0.8), side: 1 },
  { text: "Schwamm", at: T.schwamm, until: T.das, pos: H(-1.0, -0.6, 1.4), side: -1 },
  { text: "Dampfblasen", at: T.blasen, until: T.danach, pos: H(0.4, 0.2, 1.3), side: 1 },
  { text: "Team glatt", at: T.team, until: 99, pos: [0, 8.4, 0.2], side: 1 },
  { text: "Team Locken", at: T.locken - 0.3, until: 99, pos: [CURLY, 7.2, 0.2], side: -1 },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "flash", at: 0.25 },
  { kind: "shake", at: 0.3, dur: 0.45, amp: 0.7 },
  { kind: "zoom", at: T.dann, amount: 0.3 },
  { kind: "flash", at: T.pfff + 0.1 },
  { kind: "shake", at: T.pfff + 0.1, dur: 0.5, amp: 0.8 },
  { kind: "flash", at: T.knackt1 + 0.1 },
  { kind: "shake", at: T.pressen, dur: 0.4, amp: 0.6 },
  { kind: "zoom", at: T.rasten, amount: 0.25 },
  { kind: "zoom", at: T.regen, amount: 0.3 },
  { kind: "flash", at: T.grad230 },
  { kind: "zoom", at: T.grad230, amount: 0.35 },
  { kind: "zoom", at: T.schwamm, amount: 0.25 },
  { kind: "slowmo", at: T.dampf2 + 0.2, until: T.zischen, speed: 0.35 },
  { kind: "shake", at: T.bricht, dur: 0.5, amp: 0.9 },
  { kind: "flash", at: T.bricht },
  { kind: "zoom", at: T.gramm, amount: 0.3 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "brutzeln", at: 0.0, db: -9 }, // frame 0: wet hair sizzling on the hot plates
  { s: "zisch", at: 0.05, dur: 1.4, db: -15 },
  { s: "zisch", at: T.dann, dur: 1.2, db: -18 },
  { s: "blubbern", at: T.und, db: -14 },
  { s: "piep", at: T.spaet - 0.2, dur: 1.0, db: -20 },
  { s: "klack", at: T.klemmen + 0.15, db: -10 },
  { s: "brutzeln", at: T.pfff - 0.05, db: -8 },
  { s: "zisch", at: T.pfff, dur: 1.0, db: -13 },
  { s: "pop", at: T.jedes + 0.1 },
  { s: "knacken", at: T.knackt1 + 0.08, db: -10 },
  { s: "klack", at: T.pressen + 0.02, db: -9 },
  { s: "pop", at: T.rasten + 0.05 },
  { s: "pop", at: T.rasten + 0.2 },
  { s: "knacken", at: T.knackt2 + 0.05, db: -12 },
  { s: "rauschen", at: T.darum, dur: T.folge - T.darum - 0.1, db: -22 },
  { s: "surr", at: T.rate + 0.2, dur: T.fast - T.rate - 0.2, db: -22 },
  { s: "piep", at: T.grad230 + 0.15, dur: 0.6, db: -18 },
  { s: "blubbern", at: T.mitten, db: -13 },
  { s: "zisch", at: T.dampf2, dur: 2.6, db: -19 },
  { s: "knacken", at: T.bricht, db: -8 },
  { s: "boing", at: T.einziges + 0.1, db: -14 },
];
