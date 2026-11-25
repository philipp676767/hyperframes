// Chapter 8 (finale): today's Giza in the evening, the logbook, the museum,
// the lost casing, the void, the end screen.
import {
  shotCamera,
  renderFrame,
  start,
  highlights,
  labels,
  ramp,
  smooth,
  setXray,
} from "./world.js";
import { G, MUONS } from "./set.js";
import { T, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);
const applyCamera = shotCamera(shots);
const P = G.g1;
const parts = G.inside.userData.parts;

function renderAt(t) {
  // evening light, getting warmer towards the end
  G.mood("abend", 0.45 + 0.55 * smooth(ramp(t, T.wenn - 1, T.wenn + 4)));
  // the void: x-ray only for the secret
  const xr = t >= T.ganz - 0.2 && t < T.wenn - 0.2 ? smooth(ramp(t, T.ganz, T.ganz + 1.5)) : 0;
  setXray(P.mats, xr * 0.88);
  G.inside.visible = xr > 0.01;
  for (const k of Object.keys(parts)) {
    const v = parts[k];
    if (Array.isArray(v)) v.forEach((m) => (m.material.opacity = 0.5));
  }
  parts.void.visible = t >= T.y2017 + 1.5;
  parts.void.material.opacity = 0.35 + 0.35 * (0.5 + 0.5 * Math.sin(t * 3));
  MUONS.userData.update(
    t,
    t >= T.y2017 - 0.2 && t < T.wenn - 0.2 ? smooth(ramp(t, T.y2017, T.y2017 + 1)) : 0,
  );
  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
