// Chapter 2: the empty plateau, the ghost of the planned pyramid, seven
// football pitches, levelling water, the first level course, the axes, the
// stars turning in the night, dawn.
import {
  shotCamera,
  renderFrame,
  start,
  highlights,
  labels,
  ramp,
  smooth,
  setXray,
  pop,
} from "./world.js";
import { walk } from "./welt.js";
import { G, STARS, PITCHES, TRENCH, WORKERS, AXES } from "./set.js";
import { T, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);
const applyCamera = shotCamera(shots);
const P = G.g1;

function renderAt(t) {
  // the ghost: the planned pyramid in glass, only while it is talked about
  const ghost = pop(t, T.geplant + 0.3, T.deren - 0.3, 0.8);
  // the first course after "Das Ergebnis …"
  const first = t >= T.ergebnis - 0.2 && t < T.genauso - 0.2;
  if (ghost > 0.001) {
    P.build(1);
    P.casing(0);
    setXray(P.mats, 1);
    for (const m of P.mats) m.opacity = 0.32 * ghost;
  } else {
    setXray(P.mats, 0);
    P.build(first ? 0.012 : 0);
    P.casing(0);
  }
  // pitches fade in one by one
  const kp = ramp(t, T.deren + 0.3, T.deren + 2.4);
  PITCHES.visible = t >= T.deren - 0.3 && t < T.bevor - 0.2;
  PITCHES.children.forEach((m, i) => (m.visible = kp * 7 > i));
  // trenches: visible from "Bevor", water rises from "Gießt"
  TRENCH.visible = t >= T.bevor - 0.2 && t < T.ergebnis - 0.2;
  const kw = smooth(ramp(t, T.giesst + 0.4, T.giesst + 4));
  for (const w of TRENCH.userData.waters) {
    w.scale.y = Math.max(0.02, kw);
    w.position.y = 0.03 * kw;
  }
  for (const p of WORKERS) {
    p.visible = TRENCH.visible;
    walk(p, t * 1.3 + p.userData.ph, 0.3);
  }
  // axes from "Genauso" until the night
  AXES.visible = t >= T.genauso - 0.2 && t < T.ohne - 0.2;
  AXES.userData.mat.opacity = smooth(ramp(t, T.vier, T.vier + 1.5));
  // night: from "und das ohne Kompass" to "Damit", then dawn
  const night =
    smooth(ramp(t, T.ohne - 0.2, T.ohne + 1.6)) * (1 - smooth(ramp(t, T.damit - 0.4, T.damit + 3)));
  G.mood("nacht", night);
  STARS.userData.update(t - T.ohne, night, 0.06);
  G.boatsAt(t);
  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
