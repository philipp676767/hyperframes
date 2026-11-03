// Beats of #54 "Parfum": every time-keyed decision as plain data, read by
// scene.js (picture) and scripts/build-sfx.mjs (sound). No three.js here.
// Scale: 1 unit ≈ 25 cm. The wagon runs along x, the window side (sun) is -z.
import { W, END } from "./timing.js";

// ---------------------------------------------------------------- places (plain numbers)
export const SEAT_H = 1.8; // seat cushion top
export const YOU = [-3.3, SEAT_H, -2.4]; // your hips (bay 0, bench facing +x, aisle seat)
export const YOU_HEAD = [-3.25, 4.85, -2.4];
export const PA = [11.7, SEAT_H, -2.4]; // passenger A, next bay, facing you (-x)
export const PA_HEAD = [11.65, 4.85, -2.4];
export const PB = [5.2, 0, 0.5]; // passenger B standing in the aisle
export const TABLE = [0, 3.0, -5.1]; // window table of bay 0 (top surface)
export const SKIN = [0, -140, 0]; // macro pocket: the skin of your wrist
export const NOSE = [0, -140, 170]; // pocket: the nose in a cut-away
export const WHALE_Z = -34; // the whale swims past outside the windows

// ---------------------------------------------------------------- beats
export const T = {
  nicht1: W("nicht", 1),
  zwei: W("Zwei"),
  sprueh: W("Sprühstöße"),
  bahn: W("Bahn"),
  mittags: W("Mittags"),
  sprueht: W("sprühst"),
  leute: W("Leute"),
  drei: W("drei"),
  dich1: W("dich", 1),
  dabei: W("Dabei"),
  verwandelt: W("verwandelt"),
  flakon: W("Flakon"),
  alkohol: W("Alkohol"),
  auf: W("Auf"),
  haut: W("Haut"),
  zuerst: W("Zuerst"),
  frische: W("Frische"),
  kopfnote: W("Kopfnote"),
  welches: W("Welches"),
  kommentare: W("Kommentare"),
  rate: W("Rate"),
  luxus: W("Luxus-Duft"),
  aus2: W("Aus"),
  darm: W("Darm"),
  ambra: W("Ambra"),
  heute: W("heute"),
  labor: W("Labor"),
  sie1: W("Sie", 1),
  basisnote: W("Basisnote"),
  stundenlang: W("stundenlang"),
  nase: W("Nase"),
  meldet: W("meldet"),
  neu: W("neu"),
  bleibt: W("bleibt"),
  stumm: W("stumm"),
  darum1: W("Darum", 1),
  anderen: W("anderen"),
  fakt: W("Übrigens"),
  gefuehl: W("Gefühlszentrum"),
  darum2: W("Darum", 2),
  erinnerungen: W("Erinnerungen"),
  folge: W("Folge"),
};
// spray moments (scene time): the hook burst is already under way on frame 0
T.spray = [-0.25, T.sprueh + 0.05, T.sprueh + 0.62, T.sprueht + 0.12];
T.drop = T.auf + 0.35; // the drop lands on the skin (scene time, inside the slow motion)
T.bottles = T.welches + 0.1;
T.whaleIn = T.aus2 - 0.25;
T.flask = T.heute + 0.12;
T.bubble = T.darum2 + 0.1;

// ---------------------------------------------------------------- shots
const at = (p, d) => [p[0] + d[0], p[1] + d[1], p[2] + d[2]];
// the flask of your hand in the close shots
export const FLAKON = [-1.55, 3.45, -2.05];
export const shots = [
  // 0: cold open — your hand presses the atomizer, the golden mist bursts at the lens
  { at: 0, from: [0.9, 4.75, -0.35], to: [0.35, 4.55, -0.8], look: [-2.0, 4.0, -2.2], zoom: 1 },
  // the mist rolls past your face
  { at: T.nicht1, from: [0.9, 4.9, -1.2], to: [0.4, 4.75, -1.6], look: [-2.6, 4.4, -2.5], zoom: 1 },
  // over your shoulder: two pumps, the wagon, the sun outside
  { at: T.zwei, from: [-6.6, 7.7, 0.7], to: [-5.9, 7.4, 0.35], look: [2, 3.7, -3], zoom: 1 },
  // midday: you sniff your wrist — nothing
  {
    at: T.mittags,
    from: [-0.6, 5.0, -0.9],
    to: [-1.0, 4.95, -1.3],
    look: [-3.1, 4.75, -2.4],
    zoom: 1,
  },
  // and spray again — whip in
  {
    at: T.sprueht,
    from: [0.3, 4.3, 0.0],
    to: [-0.2, 4.15, -0.5],
    look: [-1.6, 3.6, -2.05],
    zoom: 1,
    whip: 1,
  },
  // three seats further: she smells you
  { at: T.leute, from: [5.4, 5.9, -0.8], to: [6.3, 5.7, -1.1], look: [11.6, 4.7, -2.4], zoom: 1 },
  { at: T.dich1, from: [7.8, 5.2, -0.9], to: [8.4, 5.05, -1.3], look: [11.6, 4.75, -2.4], zoom: 1 },
  // your cloud around you
  {
    at: T.dabei,
    orbit: { c: [-2.2, 4.5, -2.4], r: 4.6, y: 5.6, a0: 2.2, a1: 1.5 },
    zoom: 1,
  },
  // verwandelt: the cloud splits into its colours
  {
    at: T.verwandelt,
    from: [1.6, 4.4, 1.6],
    to: [1.0, 4.4, 1.0],
    look: [-2.0, 4.3, -2.4],
    zoom: 1,
  },
  // the flask in x-ray: almost only alcohol
  {
    at: T.flakon,
    from: at(FLAKON, [1.25, 0.45, 0.9]),
    to: at(FLAKON, [0.85, 0.3, 0.62]),
    look: at(FLAKON, [0, -0.05, 0]),
    zoom: 1,
  },
  // macro on the skin: the drop lands (slow motion)
  {
    at: T.auf,
    from: at(SKIN, [9, 6.5, 13]),
    to: at(SKIN, [7, 4.6, 10]),
    look: at(SKIN, [0, 1.2, 0]),
    zoom: 1,
  },
  // first the fresh stuff flies off — the camera follows it up
  {
    at: T.zuerst,
    from: at(SKIN, [-8, 2.2, 9]),
    to: at(SKIN, [-6.5, 3.2, 7.5]),
    look: at(SKIN, [0, 3.5, 0]),
    lookTo: at(SKIN, [0, 8.5, 0]),
    zoom: 1,
    whip: -1,
  },
  // comment question: the bottles on the window table
  {
    at: T.welches,
    from: at(TABLE, [0.25, 1.95, 2.9]),
    to: at(TABLE, [0.15, 1.7, 2.4]),
    look: at(TABLE, [0, 0.35, 0.1]),
    zoom: 1,
  },
  // rate mal: you look out of the window
  { at: T.rate, from: [2.4, 5.6, -0.2], to: [1.8, 5.4, -0.7], look: [-2.4, 5.6, -6], zoom: 1 },
  // a sperm whale glides past the windows (x-ray: its gut)
  {
    at: T.aus2,
    from: [1.0, 5.0, 5.2],
    to: [0.4, 5.4, 4.0],
    look: [8, 8.2, WHALE_Z],
    lookTo: [1, 8.4, WHALE_Z],
    zoom: 1,
  },
  {
    at: T.ambra,
    from: [1.5, 7.2, WHALE_Z + 12],
    to: [0.5, 7.5, WHALE_Z + 9.5],
    look: [3.0, 7.7, WHALE_Z],
    lookTo: [-1.0, 7.7, WHALE_Z],
    zoom: 1,
  },
  // today: the lab flask on the window table
  {
    at: T.heute,
    from: at(TABLE, [1.7, 1.5, 2.6]),
    to: at(TABLE, [1.25, 1.2, 2.0]),
    look: at(TABLE, [0.4, 0.65, 0.3]),
    zoom: 1,
  },
  // back on the skin: the heavy base note sticks for hours
  {
    at: T.sie1,
    from: at(SKIN, [5.5, 2.8, 7.5]),
    to: at(SKIN, [4.4, 2.2, 6.0]),
    look: at(SKIN, [0, 0.6, 0]),
    zoom: 1,
  },
  // the nose in a cut-away
  {
    at: T.nase,
    from: at(NOSE, [1.5, 1.2, 17]),
    to: at(NOSE, [1.2, 1.0, 14.5]),
    look: at(NOSE, [0.2, 0.6, 0]),
    zoom: 1,
  },
  {
    at: T.meldet,
    from: at(NOSE, [-0.2, 4.6, 6.6]),
    to: at(NOSE, [-0.5, 4.1, 5.4]),
    look: at(NOSE, [-0.4, 2.6, 0]),
    zoom: 1,
  },
  {
    at: T.bleibt,
    from: at(NOSE, [2.4, 3.4, 8.6]),
    to: at(NOSE, [1.6, 3.0, 7.2]),
    look: at(NOSE, [-0.4, 2.5, 0]),
    zoom: 1,
  },
  // payoff: the whole bay full of your cloud
  { at: T.darum1, from: [-6.2, 8.6, 0.3], to: [-4.9, 8.3, 0.1], look: [5, 3.8, -2.4], zoom: 1 },
  { at: T.anderen, from: [6.6, 5.4, 1.6], to: [7.4, 5.2, 1.0], look: [10.4, 4.6, -1.2], zoom: 1 },
  // Übrigens: her face, the smell hits her feelings first
  {
    at: T.fakt,
    orbit: { c: [11.6, 5.0, -2.4], r: 3.8, y: 5.6, a0: -1.0, a1: -1.6 },
    zoom: 1,
    whip: 1,
  },
  // … and brings a memory back: a summer beach in a bubble
  {
    at: T.darum2,
    from: [7.0, 6.0, 2.0],
    to: [7.7, 6.5, 1.4],
    look: [10.8, 7.2, -1.2],
    zoom: 1,
  },
];

// ---------------------------------------------------------------- labels (static points)
export const LABELS = [
  { text: "Alkohol", at: T.alkohol, until: T.auf, pos: at(FLAKON, [0, -0.12, 0]), side: -1 },
  {
    text: "Basisnote",
    at: T.basisnote,
    until: T.nase - 0.2,
    pos: at(SKIN, [0.6, 0.9, 0.8]),
    side: 1,
  },
  {
    text: "Riechzellen",
    at: T.meldet + 0.1,
    until: T.bleibt,
    pos: at(NOSE, [-0.5, 2.75, 0]),
    side: 1,
  },
  {
    text: "Gefühlszentrum",
    at: T.gefuehl,
    until: T.darum2,
    pos: [PA_HEAD[0], PA_HEAD[1] + 0.25, PA_HEAD[2]],
    side: -1,
  },
];

// ---------------------------------------------------------------- highlights
export const HIGHLIGHTS = [
  { kind: "slowmo", at: 0, until: T.nicht1, speed: 0.45 }, // the burst in slow motion
  { kind: "zoom", at: T.nicht1 + 0.05, amount: 0.25 },
  { kind: "shake", at: T.sprueht + 0.12, dur: 0.45, amp: 0.7 },
  { kind: "zoom", at: T.drei, amount: 0.35 },
  { kind: "flash", at: T.verwandelt },
  { kind: "slowmo", at: T.auf, until: T.zuerst, speed: 0.4 }, // the drop lands
  { kind: "shake", at: T.darm, dur: 0.6, amp: 1.0 },
  { kind: "zoom", at: T.flask + 0.1, amount: 0.25 },
  { kind: "flash", at: T.neu },
  { kind: "zoom", at: T.stumm, amount: 0.35 },
  { kind: "shake", at: T.anderen + 0.1, dur: 0.5, amp: 0.8 },
  { kind: "zoom", at: T.bubble + 0.15, amount: 0.3 },
];

// ---------------------------------------------------------------- sound
export const SFX = [
  { s: "spruehen", at: 0.0, db: -4 },
  { s: "spruehen", at: T.spray[1], db: -8 },
  { s: "spruehen", at: T.spray[2], db: -8 },
  { s: "rauschen", at: T.zwei, dur: 1.9, db: -24 },
  { s: "spruehen", at: T.spray[3], db: -4 },
  { s: "pop", at: T.auf + 0.85, db: -8 }, // the drop splashes (real time in the slowmo)
  { s: "zisch", at: T.auf + 1.1, dur: 1.2, db: -22 },
  { s: "pop", at: T.bottles },
  { s: "pop", at: T.bottles + 0.12 },
  { s: "pop", at: T.bottles + 0.24 },
  { s: "pop", at: T.bottles + 0.36 },
  { s: "pop", at: T.bottles + 0.48 },
  { s: "wow", at: T.whaleIn + 0.2, db: -10 },
  { s: "pop", at: T.flask },
  { s: "zisch", at: T.flask + 0.3, dur: 1.0, db: -22 },
  { s: "click", at: T.bleibt + 0.35 },
  { s: "click", at: T.bleibt + 0.75 },
  { s: "click", at: T.bleibt + 1.15 },
  { s: "click", at: T.stumm - 0.05 },
  { s: "pop", at: T.bubble },
];
export { END };
