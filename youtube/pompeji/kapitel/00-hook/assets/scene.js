// Chapter 0: cold open (the cloud across the bay, darkness in the forum),
// then the afternoon until the mountain bursts open.
import { shotCamera, renderFrame, start, highlights, labels, ramp, smooth, V } from "./world.js";
import { makePumice } from "./welt.js";
import { P, BK } from "./set.js";
import { T, shots, LABELS, HIGHLIGHTS, BOOM } from "./beats.js";
import { scene } from "./world.js";

highlights(HIGHLIGHTS);
const applyCamera = shotCamera(shots);
const near = makePumice({ n: 1800, size: 5, top: 3.5, scale: 1.1, seed: 3 });
scene.add(near);
const forum = V(0.3, 0, 2.5);

function renderAt(t) {
  const cold = t < T.es - 0.1;
  // the column: full in the cold open, then born at BOOM
  const grow = cold
    ? 1
    : Math.min(0.92, smooth(ramp(t, BOOM, BOOM + 9)) * 0.62 + ramp(t, BOOM + 9, BOOM + 30) * 0.3);
  P.column.userData.update(cold ? t + 60 : t - BOOM + 2, {
    grow: cold ? 1 : Math.max(0.0001, grow),
    k: cold || t > BOOM ? 1 : 0,
    drift: cold ? 1 : smooth(ramp(t, BOOM + 12, BOOM + 40)) * 0.6,
    glow: 0,
  });
  // darkness only in the second quote
  const dark = t >= T.nacht - 0.15 && t < T.es - 0.1 ? smooth(ramp(t, T.nacht, T.nacht + 3.5)) : 0;
  const haze = t > BOOM ? smooth(ramp(t, BOOM + 8, T.end)) * 0.22 : 0;
  P.mood("dunkel", Math.max(dark * 0.92, haze));
  P.lightning.userData.update(t * 2, dark);
  P.pumice.userData.update(t, dark * 0.6, forum);
  near.userData.update(t, dark, V(0.3, 0, 2.6));
  P.dust(dark * 0.4);
  P.setPumice(dark ? dark * 0.03 : 0);
  // people: walk in the afternoon; after the blast they stop and look north
  if (t < BOOM + 0.8) P.peopleAt(t, 1);
  else {
    P.peopleAt(BOOM + 0.8, 1);
    for (const p of P.people) {
      p.rotation.y = Math.PI / 2 + (p.position.x - 0.5) * 0.05;
      for (const o of p.children) if (o.name) o.rotation.z = 0;
    }
  }
  if (t >= T.doch - 0.3 && t < T.gibt - 0.2) for (const p of P.people) p.visible = false;
  BK.userData.update(t, { fire: 1, charred: 0 });
  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
