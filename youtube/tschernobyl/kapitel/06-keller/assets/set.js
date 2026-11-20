// Chapter 6: the ruin on a smoky day (helicopters), the core in x-ray with the
// melt and the pool below, and the flooded basement.
import { V } from "./world.js";
import { buildPlant, buildCore, buildBasement } from "./welt.js";
export const PLANT = buildPlant({ time: "rauch", state: "explodiert" });
export const CORE = buildCore(V(0, -300, 0));
export const BASE = buildBasement(V(60, -300, 0));
