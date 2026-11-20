// Chapter 4: the ruin at night (main world) + the control room.
import { V } from "./world.js";
import { buildPlant, buildControlRoom } from "./welt.js";
export const PLANT = buildPlant({ time: "nacht", state: "explodiert" });
export const CR = buildControlRoom(V(0, 300, 0));
