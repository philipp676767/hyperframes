// Chapter 6: the crowd, the horse, the cemetery, the bone, the bakery, the
// herd, the relieving chamber, the posing gang.
import {
  shotCamera,
  renderFrame,
  start,
  highlights,
  labels,
  showLabel,
  pop,
  ramp,
  smooth,
} from "./world.js";
import { walk, pull } from "./welt.js";
import { G, CROWD, HORSE, BAKERY, HERD, TEAM, BONE, BONE_TIP } from "./set.js";
import { T, shots, LABELS, HIGHLIGHTS, BONE_LABEL } from "./beats.js";

highlights(HIGHLIGHTS);
for (const s of shots) {
  if (s.follow === "horse") s.rel = HORSE.userData.base;
  if (s.follow === "bone") s.rel = BONE;
}
const applyCamera = shotCamera(shots);

function renderAt(t) {
  G.peopleAt(t);
  G.sledgesAt(t, 0.6);
  G.boatsAt(t);
  for (const s of G.smokes) s.userData.update(t);
  for (const p of CROWD) pull(p, t * 2 + p.userData.ph, 0.8);
  // the horse walks, stumbles at the wall and kneels
  const st = smooth(ramp(t, T.stolpert + 0.3, T.stolpert + 1.2));
  const wk = ramp(t, T.stolpert - 2, T.stolpert + 0.3);
  HORSE.position.x = HORSE.userData.base.x - wk * 0.15;
  HORSE.rotation.z = st * 0.35;
  HORSE.position.y = HORSE.userData.base.y - st * 0.03;
  HORSE.userData.legs.forEach(
    (l, i) =>
      (l.rotation.z = st ? -st * (i < 2 ? 1.1 : 0.2) : Math.sin(t * 6 + i * 1.6) * 0.3 * wk),
  );
  // bakery fire
  BAKERY.userData.light.intensity = 2.2 + Math.sin(t * 11) * 0.4;
  BAKERY.userData.smoke.userData.update(t);
  BAKERY.userData.bakers.forEach((p, i) => walk(p, t * 0.9 + i, 0.2));
  HERD.forEach((a, i) => (a.rotation.y += Math.sin(t * 0.3 + i) * 0.002));
  // the gang cheering: arms up on "Fußballmannschaft"
  const cheer = smooth(ramp(t, T.ein + 1.0, T.ein + 1.6));
  TEAM.forEach((p, i) => {
    for (const o of p.children)
      if (o.name === "armL" || o.name === "armR")
        o.rotation.x = (o.name === "armL" ? -1 : 1) * cheer * (2.6 + Math.sin(t * 8 + i) * 0.2);
    p.position.y = cheer * Math.abs(Math.sin(t * 6 + i)) * 0.01;
  });
  if (window.HF_THUMB) for (const k of Object.keys(G.ramps)) G.ramps[k].visible = false;
  labels(t, LABELS);
  const kb = pop(t, BONE_LABEL.at, BONE_LABEL.until);
  if (kb > 0) showLabel("bone", kb, BONE_LABEL.text, BONE_TIP, -1);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
