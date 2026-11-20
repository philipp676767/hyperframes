// Chapter 7: a Bavarian forest in the rain (side scene) + the plant on a grey
// day: ruin → sarcophagus → the New Safe Confinement; animals in the zone.
import { V } from "./world.js";
import { buildPlant, buildForest } from "./welt.js";
export const PLANT = buildPlant({ time: "grau", state: "explodiert" });
export const FOREST = buildForest(V(0, 300, 0));
