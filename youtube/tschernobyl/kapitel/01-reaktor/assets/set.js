// Chapter 1: the plant on the evening before (main world, golden light),
// Prypjat's blocks on the horizon, and the reactor core in x-ray.
import { V } from "./world.js";
import { buildPlant, buildCore } from "./welt.js";
export const PLANT = buildPlant({ time: "abend", state: "intakt" });
export const CORE = buildCore(V(0, -300, 0));
