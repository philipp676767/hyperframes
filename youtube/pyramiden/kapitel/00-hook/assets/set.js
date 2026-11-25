// Chapter 0: Giza during the flood, the pyramid three quarters built (main
// world), the logbook in the sand at Wadi al-Jarf (side scene below).
import { V } from "./world.js";
import { buildGiza, buildPapyrus, makeBoat, makePerson, makeSledge } from "./welt.js";
export const G = buildGiza({ time: "tag", state: "bau" });
export const PAP = buildPapyrus(V(0, -120, 0));
// Merer's boat: the hero of the cold open, sailing to the harbour
export const BOAT = makeBoat({ cargo: "kalk", seed: 77, crew: 7, scale: 0.55 });
export const MERER = makePerson({ shirt: true, coat: 0xf6f0e2, skin: 0x8f6040, scale: 1 / 0.55 });
MERER.position.set(-1.15, 0.21, 0);
MERER.rotation.y = Math.PI;
BOAT.add(MERER);
G.boats.push(BOAT);
import { scene } from "./world.js";
scene.add(BOAT);
// a sledge team hauling a block across the plateau towards the pyramid (east side)
export const HS = makeSledge({ team: 16, seed: 91 });
HS.position.set(19, 0.01, 4.2);
scene.add(HS);
