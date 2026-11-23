// Chapter 1: an ordinary day in Pompeii, the crater, the quake of 62.
import {
  THREE,
  shotCamera,
  renderFrame,
  start,
  highlights,
  labels,
  ramp,
  smooth,
  V,
  real,
  puff,
  scene,
} from "./world.js";
import { makePerson, walk, heightAt } from "./welt.js";
import { P } from "./set.js";
import { T, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);
const applyCamera = shotCamera(shots);
P.crowd.visible = true;

// Spartacus' men: a vine rope down the outer wall of the crater, figures on it
const rope = [];
for (let i = 0; i <= 14; i++) {
  const z = -56.9 + i * 0.32;
  rope.push(V(0.05 * Math.sin(i), heightAt(0, z) + 0.03, z));
}
const ropeM = new THREE.Mesh(
  new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rope), 60, 0.012, 6),
  real.fabric(0x4a6a2a),
);
scene.add(ropeM);
for (let i = 0; i < 26; i++) {
  const p = rope[Math.floor(i / 2)];
  const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), real.fabric(0x5a7a32));
  leaf.position.copy(p).add(V((i % 2 ? 1 : -1) * 0.025, 0.01, 0));
  leaf.scale.set(1, 0.5, 1.4);
  scene.add(leaf);
}
const climbers = [];
for (let i = 0; i < 5; i++) {
  const c = makePerson({ coat: [0x8c5a3a, 0x6f6a5a, 0x7a4a32, 0x5e5a4e, 0x8a7a5a][i] });
  c.userData.k = i;
  scene.add(c);
  climbers.push(c);
}

// the quake of 62: three houses on the main street lose walls and roofs
const near = P.houses.filter((h) => Math.abs(h.z - 0.9) < 1.6 && h.x > 4 && h.x < 9).slice(0, 3);
const wallH = near.map((h) => h.wall.scale.y);

function renderAt(t) {
  P.peopleAt(t, 1);
  // climbers move slowly down the vine rope
  climbers.forEach((c, i) => {
    const u = Math.min(1, 0.05 + i * 0.16 + Math.max(0, t - T.rund2) * 0.012);
    const k = Math.floor(u * (rope.length - 1));
    const p = rope[Math.min(rope.length - 1, k)];
    c.position.copy(p);
    c.rotation.y = -Math.PI / 2;
    c.rotation.z = -0.5;
    walk(c, t * 1.2 + i, 0.6);
    c.visible = t > T.dass && t < T.dabei;
  });
  // quake: houses crumble on "Häuser", repaired in the 79 shots
  const in62 = t >= T.dabei - 0.2 && t < T.siebzehn - 0.2;
  near.forEach((h, i) => {
    const k = in62 ? smooth(ramp(t, T.haeuser + i * 0.35, T.haeuser + i * 0.35 + 0.7)) : 0;
    h.wall.scale.y = wallH[i] * (1 - k * 0.55);
    h.wall.position.y = 0.05 + (h.h * (1 - k * 0.55)) / 2;
    if (h.roof) {
      h.roof.position.y = h.roof.userData.y0 - k * h.h * 0.8;
      h.roof.rotation.z = k * 0.5 * (i % 2 ? 1 : -1);
    }
    puff("q" + i, t, in62 ? T.haeuser + i * 0.35 + 0.3 : -9, h.x, 0.2, h.z, 1.2);
  });
  P.mood("dunkel", t > T.was ? smooth(ramp(t, T.was, T.end)) * 0.18 : 0);
  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
