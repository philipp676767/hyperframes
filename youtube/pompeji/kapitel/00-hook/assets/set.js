// Chapter 0: Pompeii on its last afternoon (main world) + the bakery for a
// short cut-away.
import { V } from "./world.js";
import { buildPompeji, buildBakery } from "./welt.js";
export const P = buildPompeji({ time: "tag", state: "79" });
export const BK = buildBakery(V(0, -120, 0));
