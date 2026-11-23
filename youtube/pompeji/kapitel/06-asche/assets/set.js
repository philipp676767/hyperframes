// Chapter 6: the plain over the buried town with the forum dug out (main
// world, state "grabung"), the bakery and the 1863 trench (side sets).
import { V } from "./world.js";
import { buildPompeji, buildBakery, buildTrench } from "./welt.js";
export const P = buildPompeji({ time: "felder", state: "grabung" });
export const BK = buildBakery(V(0, -120, 0));
export const TR = buildTrench(V(60, -120, 0));
