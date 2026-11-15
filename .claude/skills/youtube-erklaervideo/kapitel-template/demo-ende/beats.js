// TEMPLATE beats of the END chapter (demo): payoff + Übrigens, then the CTA line;
// the last shot is the calm, moving end-screen picture (a slow orbit, no text).
import { W } from "./timing.js";
export const T = { draht: W("Draht"), fakt: W("Übrigens"), led: W("LED") };
export const shots = [
  { at: 0, from: [1.4, 2.2, 3.2], to: [1.0, 2.0, 2.6], look: [0, 1.6, 0] },
  { at: T.fakt, from: [3, 2.5, 5], to: [6, 4, 9], look: [0, 1.4, 0] },
  { at: T.led, orbit: { c: [0, 1.4, 0], r: 9, y: 4, a0: 0.6, a1: -0.9 } },
];
export const LABELS = [];
export const HIGHLIGHTS = [];
export const SFX = [];
