// Chapter 1: the god-king, the mastaba, the step pyramid rising, the Bent
// Pyramid changing its angle halfway, the Red Pyramid.
import { shotCamera, renderFrame, start, highlights, labels, ramp, smooth } from "./world.js";
import { walk } from "./welt.js";
import { E, PROC, PROC_LINE } from "./set.js";
import { shots, LABELS, HIGHLIGHTS, DJ, BENT } from "./beats.js";

highlights(HIGHLIGHTS);
const applyCamera = shotCamera(shots);
const knee = 4.7 / E.bent.h;

function renderAt(t) {
  // Djoser: the six steps appear one after the other
  const d = ramp(t, DJ.from, DJ.to);
  const sh = E.djoser.h / 6;
  E.djoser.courses.forEach((c, i) => {
    const k = smooth(ramp(d, i / 6, (i + 0.8) / 6));
    c.visible = k > 0.001;
    c.scale.y = Math.max(0.001, k);
    c.position.y = sh * i + sh * 0.5 * k;
  });
  // Bent pyramid: up to the knee, a pause, then the flatter top
  let kb = 1;
  if (t < BENT.to) {
    if (t < BENT.from) kb = 0.12;
    else if (t < BENT.knee) kb = 0.12 + (knee - 0.12) * smooth(ramp(t, BENT.from, BENT.knee));
    else if (t < BENT.on) kb = knee;
    else kb = knee + (1 - knee) * smooth(ramp(t, BENT.on, BENT.to));
  }
  E.bent.build(kb);
  E.bent.casing(Math.max(0, kb - 0.02));
  for (const p of E.people) walk(p, t * 1.4 + p.userData.ph, 0.6);
  // the procession walks slowly towards the tomb
  const [fx, fz] = PROC_LINE.from;
  const [tx, tz] = PROC_LINE.to;
  const len = Math.hypot(tx - fx, tz - fz);
  for (const p of PROC) {
    const u = Math.max(0, Math.min(1, (t * 0.05 - p.userData.off * 0.6) / len + 0.25));
    p.position.set(fx + (tx - fx) * u + p.userData.side, 0, fz + (tz - fz) * u + p.userData.side);
    p.rotation.y = Math.atan2(-(tz - fz), -(tx - fx));
    walk(p, t * 1.2 + p.userData.off, 0.7);
  }
  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
