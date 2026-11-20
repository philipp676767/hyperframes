// Finale: the reactor core in x-ray (the answer) + Prypjat at dusk today,
// empty, the yellow Ferris wheel (epilogue + end screen).
import { V } from "./world.js";
import { buildPripyat, buildCore } from "./welt.js";
export const P = buildPripyat({ time: "abend", plume: false });
export const CORE = buildCore(V(0, -300, 0));
