// Chapter 8 (finale): Giza today (the three pyramids, green fields, evening),
// the logbook at Wadi al-Jarf and in a museum case in Cairo, cosmic
// particles revealing the void (x-ray).
import { THREE, scene, rng, V } from "./world.js";
import { buildGiza, buildPapyrus, G1, noAO } from "./welt.js";
export const G = buildGiza({ time: "heute", state: "heute" });
export const CAVE = buildPapyrus(V(0, -120, 0));
export const MUSEUM = buildPapyrus(V(60, -160, 0), { museum: true });
// muons: short bright streaks raining down through the pyramid
export const MUONS = (() => {
  const n = 260;
  const r = rng(17);
  const pos = new Float32Array(n * 6);
  const seeds = [];
  for (let i = 0; i < n; i++) seeds.push([(r() - 0.5) * 30, (r() - 0.5) * 30, r()]);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.LineBasicMaterial({
    color: 0xb8e8ff,
    transparent: true,
    opacity: 0.9,
    toneMapped: false,
  });
  const lines = noAO(new THREE.LineSegments(geo, mat));
  lines.frustumCulled = false;
  scene.add(lines);
  lines.userData.update = (t, k) => {
    lines.visible = k > 0.01;
    mat.opacity = 0.9 * k;
    for (let i = 0; i < n; i++) {
      const [x, z, ph] = seeds[i];
      const y = 24 - ((t * 0.9 + ph) % 1) * 30;
      pos.set([x, y, z, x + 0.15, y + 1.2, z], i * 6);
    }
    geo.attributes.position.needsUpdate = true;
  };
  return lines;
})();
export { G1 };
