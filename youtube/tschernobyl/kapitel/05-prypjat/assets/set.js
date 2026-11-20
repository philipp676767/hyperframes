// Chapter 5: Prypjat on Saturday morning (side world as the main place of
// this chapter) + the Forsmark staff entrance in Sweden.
import { V } from "./world.js";
import { buildPripyat, buildForsmark } from "./welt.js";
export const P = buildPripyat({ time: "morgen", plume: true });
export const FO = buildForsmark(V(0, 300, 0));
