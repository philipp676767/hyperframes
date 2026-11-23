// Chapter 2: the mountain cut open (x-ray side set) + the main world after
// the eruption began (column, the view from Misenum).
import { V } from "./world.js";
import { buildPompeji, buildVolcanoXray } from "./welt.js";
export const P = buildPompeji({ time: "tag", state: "79" });
export const XR = buildVolcanoXray(V(0, -200, 0));
