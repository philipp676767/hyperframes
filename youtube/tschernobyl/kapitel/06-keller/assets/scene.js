// Chapter 6: helicopters over the ruin; the melt sinking towards the pool;
// three men wading through the basement to the valves.
import {
  shotCamera,
  renderFrame,
  start,
  highlights,
  labels,
  ramp,
  smooth,
  ground,
} from "./world.js";
import { PLANT, CORE, BASE } from "./set.js";
import { makeHelicopter, walk } from "./welt.js";
import { T, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);
const applyCamera = shotCamera(shots);
const helis = [0, 1].map(() => {
  const h = makeHelicopter();
  ground.add(h);
  return h;
});
const men0 = BASE.men.map((m) => m.position.clone());
function renderAt(t) {
  PLANT.setState("explodiert");
  PLANT.setRuin(t, true, 0.7);
  // helicopters cross over the shaft; the first drops its load at "Blei"
  helis.forEach((h, i) => {
    const u = ((t + i * 9) % 18) / 18;
    h.position.set(-30 + u * 60, 13.5 + i * 1.5, CORE_Z + (i ? 4 : 0));
    h.rotation.z = -0.08;
    h.userData.update(t);
    const drop = i === 0 && t > T.hub + 2 && t < T.hub + 6 ? t - T.hub - 2 : 0;
    h.userData.load.position.y = -drop * drop * 4.9 * 0.1;
    h.userData.load.visible = drop < 2.5;
  });
  // the melt: sinks from the core towards the pool
  CORE.corium.visible = t > T.kern - 0.5;
  CORE.corium.position.y = 1.5 - smooth(ramp(t, T.die, T.jemand)) * 6.5;
  CORE.corium.children.forEach((m, i) => (m.scale.y = 0.5 + 0.08 * Math.sin(t * 2 + i)));
  CORE.setCore(t, { power: 0.4, ins: 1, voidK: 0.9, turbineSpeed: 0, lidLift: 1 });
  // the three men wade down the corridor, stop at the valves
  const w = smooth(ramp(t, T.mit - 0.5, T.finden));
  BASE.men.forEach((m, i) => {
    m.position.set(men0[i].x * (1 - w * 0.4), 0, men0[i].z - w * 20);
    walk(m, t * 1.1 + i, t > T.mit - 0.5 && t < T.finden ? 0.5 : 0.05);
  });
  const turn = smooth(ramp(t, T.finden + 0.8, T.oft));
  BASE.valves.forEach((v, i) => (v.wheel.rotation.x = turn * (4 + i)));
  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
const CORE_Z = -0.8;
start(renderAt);
