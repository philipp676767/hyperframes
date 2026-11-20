// Chapter 0: the plant at night (main world) + the control room, the core in
// x-ray and the Bavarian forest for short cut-aways.
import { V } from "./world.js";
import { buildPlant, buildControlRoom, buildCore, buildForest } from "./welt.js";
export const PLANT = buildPlant({ time: "nacht", state: "intakt" });
export const CR = buildControlRoom(V(0, 300, 0));
export const CORE = buildCore(V(0, -300, 0));
export const FOREST = buildForest(V(0, 600, 0));
