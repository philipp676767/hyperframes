// Chapter 3: the plant at night, the control room, the core in x-ray.
import { V } from "./world.js";
import { buildPlant, buildControlRoom, buildCore } from "./welt.js";
export const PLANT = buildPlant({ time: "nacht", state: "intakt" });
export const CR = buildControlRoom(V(0, 300, 0));
export const CORE = buildCore(V(0, -300, 0));
