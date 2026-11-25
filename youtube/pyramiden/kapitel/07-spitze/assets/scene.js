// Chapter 7: time-lapse to the top, the capstone, the inside in x-ray, the
// casing rising, the white pyramid.
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
import { G } from "./set.js";
import { T, shots, LABELS, HIGHLIGHTS, GROW } from "./beats.js";

highlights(HIGHLIGHTS);
const applyCamera = shotCamera(shots);
const P = G.g1;
const parts = G.inside.userData.parts;

function renderAt(t) {
  // the pyramid grows, the casing follows a little below
  const kg = GROW.k0 + (GROW.k1 - GROW.k0) * smooth(ramp(t, GROW.t0, GROW.t1));
  const capDown = smooth(ramp(t, T.spitze - 0.2, T.spitze + 1.0));
  const done = t >= T.spitze + 1.0;
  P.build(done ? 1 : kg);
  if (P.capstone) {
    P.capstone.visible = t >= T.spitze - 0.6;
    P.capstone.position.y = P.h - 0.27 + (1 - capDown) * 1.2;
  }
  // casing: 40 % until "Zum Schluss", then up to the top
  const kc =
    t < T.zum ? Math.min(0.4, kg * 0.45) : 0.4 + 0.6 * smooth(ramp(t, T.zum + 0.3, T.glatt - 0.3));
  P.casing(kc);
  // ramps disappear with the casing
  const inX = t >= T.im - 0.2 && t < T.zum - 0.2;
  G.setRamp("spirale", inX ? 0 : t < T.zum ? 1 : 1 - smooth(ramp(t, T.zum, T.zum + 2.5)));
  G.sledgesAt(t, 1.4);
  if (t >= T.im - 0.2) for (const s of G.sledges) s.visible = false;
  G.peopleAt(t);
  G.boatsAt(t);
  for (const s of G.smokes) s.userData.update(t);
  // x-ray inside
  const xr = t >= T.im - 0.2 && t < T.zum - 0.2 ? smooth(ramp(t, T.im, T.im + 1.2)) : 0;
  setXray(P.mats, xr * 0.9);
  G.inside.visible = xr > 0.01;
  parts.void.visible = false;
  parts.gallery.material.opacity = 0.35 + 0.65 * (t >= T.gal ? 1 : 0.3);
  parts.king.visible = t >= T.koenig - 0.2 || t < T.gal;
  for (const r of parts.relief) r.visible = t >= T.darueber + 0.2;
  // the sun: a little warmer for the crystal
  G.mood("abend", t >= T.in - 0.2 ? smooth(ramp(t, T.in, T.end)) * 0.35 : 0);
  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
