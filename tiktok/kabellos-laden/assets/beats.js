// #68 Kabellos laden — every time-keyed decision as plain data (scene.js +
// scripts/build-sfx.mjs). No three.js / DOM here.
//
// Places (1 unit = 5 cm), all in the car (set.js):
//   PAD (origin) — the charging tray in the centre console: rubber mat over
//     a flat copper coil; the phone lies on it (or hovers above it in the
//     exploded view), the coin lands on it.
//   CUBBY — the coin cubby right behind the tray.
//   HOB — an induction hob with a pot on the passenger seat (the analogy).
import { W } from "./timing.js";

export const HOB = [10.4, -0.75, 3.2];

export const T = {
  muenze1: W("Münze", 1),
  ladepad1: W("Ladepad", 1),
  stell: W("Stell"),
  legst: W("legst"),
  drauf: W("drauf"),
  kein: W("Kein"),
  kontakt: W("Kontakt"),
  trotzdem: W("trotzdem"),
  im1: W("Im", 1),
  kupferspule: W("Kupferspule"),
  strom1: W("Strom", 1),
  macht: W("macht"),
  feld1: W("Feld", 1),
  im2: W("Im", 2),
  spule: W("Spule"),
  schubst: W("schubst"),
  elektronen: W("Elektronen"),
  strom2: W("Strom", 2),
  akku: W("Akku"),
  induktion: W("Induktion"),
  nur: W("Nur"),
  dreht: W("dreht"),
  folge: W("Folge"),
  rate: W("Rate"),
  sekunde: W("Sekunde"),
  mal100k: W("100.000-mal"),
  spuert: W("spürt"),
  metall1: W("Metall", 1),
  deiner: W("deiner"),
  wirbelt: W("wirbelt"),
  kreis: W("Kreis"),
  wirbel: W("Wirbelströme"),
  machen: W("machen"),
  heiss: W("heiß"),
  gute: W("Gute"),
  schalten: W("schalten"),
  darum: W("Darum"),
  kocht: W("kocht"),
  herd: W("Induktionsherd"),
  topf: W("Topf"),
  fakt: W("Übrigens"),
  verbraucht: W("verbraucht"),
  p47: W("47"),
  ladepad2: W("Ladepad", 2),
  kabel: W("Kabel"),
};

// phone states: on the pad, hovering above it (exploded view), gone
export const PHONE = {
  land: T.drauf, // the hand puts it down
  up: T.im1 + 0.15, // floats up to show the coil
  down: T.folge, // back on the pad (hard cut)
  away: T.spuert, // taken away for the coin part
  back: T.fakt, // back for the last part
};
// the field: on from "macht", off on "schalten"
export const FIELD = { on: T.macht, off: T.schalten + 0.2 };
// coin #2 hops from the cubby onto the pad
export const COIN2 = { hop: T.spuert + 0.35, land: T.spuert + 0.8 };

const P = (x, y, z) => [x, y, z];
const hob = (x, y, z) => [x + HOB[0], y + HOB[1], z + HOB[2]];

export const shots = [
  // hook: macro, the coin drops onto the pad and starts to glow
  { at: 0, from: P(1.7, 2.0, 2.5), to: P(0.9, 1.15, 1.35), look: P(0, -0.12, 0.2), zoom: 1.0 },
  // wider: ✕ over the hot coin, the console around it
  { at: T.ladepad1 - 0.14, from: P(3.6, 3.9, 5.6), to: P(3.0, 3.3, 4.7), look: P(0, 0.3, 0) },
  // the hand brings the phone
  { at: T.stell, from: P(-3.6, 5.2, 6.4), to: P(-2.8, 4.4, 5.4), look: P(0, 0.4, 0.4) },
  // the empty USB-C port, a plug that isn't needed
  { at: T.kein, from: P(1.6, 1.1, 3.6), to: P(1.2, 0.9, 3.0), look: P(0, 0.35, 2.0), zoom: 1.3 },
  // screen from above: it charges
  { at: T.trotzdem, from: P(0.5, 4.2, 1.9), to: P(0.3, 3.5, 1.2), look: P(0, 0.3, 0) },
  // the phone floats up, the mat turns to glass: the coil
  { at: T.im1, from: P(2.6, 2.4, 3.4), to: P(2.0, 2.0, 2.6), look: P(0, 0.35, 0) },
  // macro on the coil: current running back and forth
  { at: T.strom1, from: P(0.9, 2.1, 1.5), to: P(0.6, 1.7, 1.0), look: P(0, 0.05, 0), zoom: 1.1 },
  // the field bursts out (money shot ~10 s)
  { at: T.macht, from: P(3.8, 1.0, 4.6), to: P(3.0, 1.5, 3.7), look: P(0, 1.0, 0), whip: 1 },
  // the hovering phone in x-ray: its own coil
  { at: T.im2, from: P(1.8, 3.0, 2.6), to: P(1.3, 2.6, 1.9), look: P(0, 1.65, 0.2) },
  { at: T.schubst, orbit: { c: P(0, 1.7, 0.2), r: 1.5, y: 1.2, a0: 0.7, a1: -0.3 } },
  // current into the battery
  {
    at: T.strom2,
    from: P(-1.6, 2.8, 1.0),
    to: P(-1.1, 2.4, 0.6),
    look: P(0, 1.7, -0.6),
    zoom: 1.1,
  },
  // the whole system: induction
  { at: T.induktion - 0.3, orbit: { c: P(0, 0.9, 0), r: 2.2, y: 1.6, a0: 1.0, a1: 0.25 } },
  // the field flips (slow motion)
  { at: T.nur, from: P(3.9, 0.9, 0.9), to: P(3.4, 1.1, 0.4), look: P(0, 0.9, 0) },
  // Folge: wide from behind, the windshield and the road ahead
  { at: T.folge, from: P(0.6, 8.6, 13.5), to: P(0.4, 7.6, 11.8), look: P(0, 0.8, -1.5), tilt: 0.3 },
  // "Rate mal": close from the driver's side
  { at: T.rate, from: P(-1.8, 2.1, 3.6), to: P(-1.2, 1.7, 2.8), look: P(0, 0.6, 0) },
  // 100.000: crash in, the field strobes
  { at: T.mal100k, from: P(2.6, 1.6, 2.6), to: P(1.7, 1.2, 1.7), look: P(0, 0.6, 0), whip: 1 },
  // the coin cubby: every metal feels it
  { at: T.spuert - 0.3, from: P(2.6, 2.9, 6.6), to: P(1.9, 2.2, 5.2), look: P(0, 0.2, 2.2) },
  // top-down macro on the coin: eddy currents
  { at: T.deiner, from: P(0.15, 1.6, 0.7), to: P(0.08, 1.1, 0.45), look: P(0, 0.3, 0), zoom: 1.0 },
  { at: T.wirbel - 0.2, orbit: { c: P(0, 0.3, 0), r: 0.8, y: 0.85, a0: -0.6, a1: 0.4 }, zoom: 1.0 },
  // low macro: the coin glows
  { at: T.machen, from: P(0.9, 0.55, 1.1), to: P(0.65, 0.48, 0.8), look: P(0, 0.32, 0), zoom: 1.0 },
  // the status LED turns red: off
  { at: T.gute, from: P(-1.9, 1.6, 4.4), to: P(-1.4, 1.3, 3.6), look: P(0, 0.25, 1.7) },
  // payoff: whip to the coin on the pad
  {
    at: T.darum,
    from: P(2.0, 2.0, 2.8),
    to: P(1.4, 1.4, 2.0),
    look: P(0, 0.3, 0),
    whip: 1,
    zoom: 1.2,
  },
  // the induction hob on the passenger seat
  { at: T.herd - 0.2, from: hob(-3.4, 3.4, 4.6), to: hob(-2.6, 2.7, 3.6), look: hob(0, 1.0, 0) },
  // Übrigens: the phone on the pad, getting warm
  { at: T.fakt, from: P(3.0, 3.2, 4.4), to: P(2.1, 2.5, 3.3), look: P(0, 0.4, 0) },
  { at: T.p47, from: P(1.5, 2.3, 2.6), to: P(1.05, 1.9, 2.0), look: P(0, 0.3, 0.2), zoom: 1.6 },
  // comment question: pad or cable?
  { at: T.ladepad2, from: P(-1.6, 5.6, 4.2), to: P(-1.2, 4.7, 3.3), look: P(0.4, 0.2, 0.5) },
];

export const LABELS = [
  { text: "Kupferspule", at: T.kupferspule, until: T.strom1 + 0.6, pos: [0.7, 0.06, 0.2], side: 1 },
  { text: "Spule im Handy", at: T.spule, until: T.schubst + 0.6, pos: [0.45, 1.6, 0.35], side: 1 },
  { text: "Akku", at: T.akku, until: T.induktion - 0.3, pos: [-0.3, 1.64, -0.85], side: -1 },
  { text: "Induktion", at: T.induktion, until: T.nur, pos: [0.15, 0.9, 0.1], side: 1 },
  { text: "Wirbelströme", at: T.wirbel, until: T.machen, pos: [0.15, 0.3, 0.05], side: 1 },
];

export const HIGHLIGHTS = [
  { kind: "flash", at: 0.15 }, // the coin hits the live pad
  { kind: "zoom", at: T.muenze1 + 0.1, amount: 0.25 },
  { kind: "shake", at: T.drauf, dur: 0.35, amp: 0.6 }, // the phone lands
  { kind: "flash", at: T.macht + 0.25 }, // the field bursts out
  { kind: "shake", at: T.macht + 0.25, dur: 0.4, amp: 0.5 },
  { kind: "zoom", at: T.induktion, amount: 0.3 },
  { kind: "slowmo", at: T.nur, until: T.folge, speed: 0.4 }, // the field flips
  { kind: "flash", at: T.mal100k },
  { kind: "shake", at: T.mal100k, dur: 0.5, amp: 0.8 },
  { kind: "zoom", at: T.wirbel, amount: 0.25 },
  { kind: "shake", at: T.heiss, dur: 0.45, amp: 0.7 }, // the coin glows
  { kind: "flash", at: T.heiss + 0.05 },
  { kind: "zoom", at: T.p47, amount: 0.3 },
];

export const SFX = [
  { s: "muenze", at: 0.13, db: -4 }, // the coin hits the pad on frame 0's push-in
  { s: "zisch", at: 0.4, dur: 1.2, db: -20 }, // it heats
  { s: "ladeton", at: T.drauf + 0.05, db: -6 }, // charging starts
  { s: "pop", at: T.kein + 0.1 }, // the plug pops in
  { s: "pop", at: T.kupferspule - 0.4, db: -8 }, // the coil appears
  { s: "surr", at: T.macht, dur: T.folge - T.macht, db: -24 }, // the field hums
  { s: "surr", at: T.mal100k, dur: 1.2, db: -18 },
  { s: "muenze", at: COIN2.land, db: -6 }, // the coin hops onto the pad
  { s: "zisch", at: T.heiss, dur: 1.4, db: -17 },
  { s: "klack", at: T.schalten + 0.2 }, // the pad switches off
  { s: "piep", at: T.schalten + 0.25, dur: 0.9, db: -18 },
  { s: "pop", at: T.herd - 0.05 }, // the hob pops in
  { s: "zisch", at: T.herd + 0.4, dur: 1.2, db: -20 }, // the pot boils
  { s: "ladeton", at: T.fakt + 0.1, db: -8 },
  { s: "pop", at: T.kabel - 0.3, db: -8 }, // the cable appears
];
