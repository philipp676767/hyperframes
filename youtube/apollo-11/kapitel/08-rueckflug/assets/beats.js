// Chapter 8 "Der Feuerball": lift-off, rendezvous, docking, the way home,
// re-entry (the angle, the compressed air, the heat shield), parachutes,
// splashdown, quarantine.
import { W } from "./timing.js";

export const T = {
  stift: W("Stift"),
  zuendet: W("zündet"),
  kabine: W("Kabine", 1),
  landestufe: W("Landestufe"),
  flagge: W("Flagge"),
  jetzt: W("Jetzt"),
  schiffe: W("Schiffe"),
  collins: W("Collins"),
  docken: W("docken"),
  bleibt: W("bleibt", 2),
  heimweg: W("Heimweg"),
  wieder: W("Wiedereintritt"),
  winkel: W("Winkel"),
  stein: W("Stein"),
  steil: W("steil"),
  flach: W("flach"),
  trifft: W("trifft"),
  vor: W("Vor"),
  pumpe: W("Fahrradpumpe"),
  grad: W("2.500"),
  schild: W("Hitzeschild"),
  funk: W("Minutenlang"),
  schirme: W("Fallschirme"),
  platsch: W("Platsch"),
  raus: W("rausdürfen"),
  quar: W("Quarantäne"),
  wie: W("überlebt"),
};
// places: moon (origin), rendezvous (RDV), re-entry (RE), skipping stone (ST), bike pump (PU), sea (SEA)
export const RDV = [0, 1500, 0];
export const RE = [0, 3000, 0];
export const ST = [0, 4000, 0];
export const PU = [0, 5000, 0];
export const SEA = [0, 6000, 0];
const a = (o, x, y, z) => [o[0] + x, o[1] + y, o[2] + z];

export const shots = [
  { at: 0, from: [5, 4.4, 9], to: [4, 4.3, 7.5], look: [0, 4, 0.8], zoom: 1 },
  {
    at: T.zuendet,
    from: [14, 3, 16],
    to: [14, 5, 16],
    look: [0, 4, 0],
    lookTo: [0, 12, 0],
    zoom: 1,
  },
  { at: T.landestufe, from: [8, 2, 11], to: [7, 2.4, 10], look: [-1, 2, 1], zoom: 1 },
  {
    at: T.jetzt,
    from: a(RDV, 40, -20, 50),
    to: a(RDV, 34, -14, 42),
    look: a(RDV, 0, 0, 0),
    zoom: 1,
  },
  {
    at: T.collins,
    from: a(RDV, 3, 4, 7),
    to: a(RDV, 2.6, 3.4, 6),
    look: a(RDV, 0, 2.6, 0),
    zoom: 1,
  },
  { at: T.docken, from: a(RDV, 18, 2, 22), to: a(RDV, 16, 3, 19), look: a(RDV, 0, 0, 0), zoom: 1 },
  {
    at: T.heimweg,
    from: a(RDV, 6, 4, 26),
    to: a(RDV, 4, 3, 20),
    look: a(RDV, 0, 0, -300),
    zoom: 1,
    focus: 30,
  },
  { at: T.wieder, from: a(RE, 12, 4, 14), to: a(RE, 10, 3, 11), look: a(RE, 0, 0, 0), zoom: 1 },
  {
    at: T.winkel,
    from: a(RE, -40, 50, 140),
    to: a(RE, -30, 45, 125),
    look: a(RE, 0, -20, 0),
    zoom: 1,
  },
  {
    at: T.stein,
    from: a(ST, 3, 1.2, 4),
    to: a(ST, 2, 1.0, 3.2),
    look: a(ST, -0.5, 0, 0),
    zoom: 1,
    whip: 1,
  },
  {
    at: T.steil,
    from: a(RE, -40, 50, 140),
    to: a(RE, -34, 46, 128),
    look: a(RE, 0, -20, 0),
    zoom: 1,
  },
  { at: T.trifft, from: a(RE, 7, 2, 9), to: a(RE, 6, 1.5, 7.5), look: a(RE, 0, 0, 0), zoom: 1 },
  {
    at: T.pumpe,
    from: a(PU, 0.5, 0.7, 1.4),
    to: a(PU, 0.4, 0.6, 1.1),
    look: a(PU, 0, 0.35, 0),
    zoom: 1,
    whip: -1,
  },
  { at: T.grad, from: a(RE, -5, -1, 6), to: a(RE, -4, -1.5, 5), look: a(RE, 0, -0.6, 0), zoom: 1 },
  { at: T.funk, from: a(RE, 30, 10, 40), to: a(RE, 26, 8, 34), look: a(RE, 0, 0, 0), zoom: 1 },
  {
    at: T.schirme,
    from: a(SEA, 42, 22, 52),
    to: a(SEA, 36, 20, 46),
    look: a(SEA, 0, 30, 0),
    lookTo: a(SEA, 0, 12, 0),
    zoom: 1,
  },
  {
    at: T.platsch,
    from: a(SEA, 14, 3, 18),
    to: a(SEA, 12, 3, 15),
    look: a(SEA, 0, 0.5, 0),
    zoom: 1,
  },
  {
    at: T.raus,
    from: a(SEA, 66, 6, 18),
    to: a(SEA, 64, 5.5, 14),
    look: a(SEA, 60, 3.5, 0),
    zoom: 1,
  },
];

export const LABELS = [
  { text: "Hitzeschild", at: T.schild, until: T.funk - 0.2, pos: [0, RE[1] - 0.9, 0], side: 1 },
];

export const HIGHLIGHTS = [
  { kind: "flash", at: T.zuendet + 0.1 },
  { kind: "shake", at: T.zuendet + 0.1, dur: 1.2, amp: 0.8 },
  { kind: "zoom", at: T.docken + 0.2, amount: 0.25 },
  { kind: "zoom", at: T.wieder, amount: 0.3 },
  { kind: "shake", at: T.trifft, dur: 3.5, amp: 0.7 },
  { kind: "flash", at: T.grad - 0.7 },
  { kind: "zoom", at: T.schild, amount: 0.25 },
  { kind: "flash", at: T.platsch + 0.1 },
];

export const SFX = [
  { s: "triebwerk", at: T.zuendet, dur: 4, db: -12 },
  { s: "klack", at: T.docken + 0.25, db: -8 },
  { s: "triebwerk", at: T.heimweg, dur: 2.5, db: -18 },
  { s: "klack", at: T.wieder + 0.3, db: -10 },
  { s: "pop", at: T.stein + 0.5, db: -14 },
  { s: "pop", at: T.stein + 1.0, db: -15 },
  { s: "pop", at: T.stein + 1.4, db: -16 },
  { s: "rauschen", at: T.trifft, dur: T.schirme - T.trifft, db: -16 },
  { s: "zisch", at: T.pumpe + 0.2, dur: 1.5, db: -16 },
  { s: "pop", at: T.schirme + 0.3, db: -10 },
  { s: "hit", at: T.platsch + 0.1, db: -8 },
  { s: "quindar", at: T.raus - 0.3, db: -13 },
];
