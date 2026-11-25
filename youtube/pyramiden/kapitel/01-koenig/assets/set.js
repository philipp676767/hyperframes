// Chapter 1: the early pyramids in the desert (side world): the mastaba,
// Djoser's step pyramid, Snofru's Bent and Red Pyramid, a procession.
import { scene, rng } from "./world.js";
import { buildEarly, randomPerson, EARLY } from "./welt.js";
export const E = buildEarly();
// a funeral procession walking towards the mastaba
const r = rng(14);
export const PROC = [];
for (let i = 0; i < 14; i++) {
  const p = randomPerson(r, { coat: i === 0 ? 0xf8f4ea : 0xece4d4 });
  p.userData.off = i * 0.32 + r() * 0.1;
  p.userData.side = (i % 2 ? 1 : -1) * 0.12;
  scene.add(p);
  PROC.push(p);
}
export const PROC_LINE = {
  from: [EARLY.mastaba.x + 12, EARLY.mastaba.z + 10],
  to: [EARLY.mastaba.x + 3, EARLY.mastaba.z + 3],
};
