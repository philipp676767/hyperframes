// Chapter 5: Saturday in Prypjat → the announcement → buses → empty town →
// Forsmark's alarm → the plume drifting.
import {
  THREE,
  shotCamera,
  renderFrame,
  start,
  highlights,
  labels,
  ramp,
  smooth,
  ground,
  real,
  roundedBox,
} from "./world.js";
import { P, FO } from "./set.js";
import { walk } from "./welt.js";
import { T, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);
const applyCamera = shotCamera(shots);
// the loudspeaker: a pole with two horns on the square
const spk = new THREE.Group();
const pole = new THREE.Mesh(
  new THREE.CylinderGeometry(0.012, 0.016, 0.95, 10),
  real.metal(0x7a7e82, { roughness: 0.5 }),
);
pole.position.y = 0.475;
spk.add(pole);
for (const s of [-1, 1]) {
  const horn = new THREE.Mesh(
    new THREE.ConeGeometry(0.045, 0.1, 20, 1, true),
    real.metal(0xd8d6ce, { roughness: 0.35, side: THREE.DoubleSide }),
  );
  horn.rotation.z = (s * Math.PI) / 2;
  horn.position.set(s * 0.05, 0.92, 0);
  spk.add(horn);
}
spk.position.set(-3, 0, 3.5);
ground.add(spk);
// bags for the evacuees
P.people.forEach((p, i) => {
  if (i % 2) return;
  const bag = new THREE.Mesh(
    roundedBox(0.05, 0.035, 0.02, 0.006),
    real.fabric([0x6a4a2a, 0x3a4a6a, 0x7a2a2a][i % 3]),
  );
  bag.position.set(0, 0.06, 0.045);
  bag.visible = false;
  p.add(bag);
  p.userData.bag = bag;
});
const start0 = P.people.map((p) => p.position.clone());
function renderAt(t) {
  P.wheel.userData.update(0.0); // never turns
  const evac = smooth(ramp(t, T.menschen, T.wenigen));
  P.people.forEach((p, i) => {
    const s = start0[i];
    const wander = t < T.menschen;
    if (wander) {
      const [ph] = p.userData.walk;
      p.position.set(s.x + Math.sin(t * 0.25 + ph) * 0.4, 0, s.z + Math.cos(t * 0.2 + ph) * 0.3);
      walk(p, t * 1.6 + ph, 0.6);
    } else {
      p.position.set(s.x * (1 - evac * 0.3), 0, s.z + (9 - s.z) * evac);
      p.lookAt(p.position.x, 0, 9);
      walk(p, t * 1.8 + i, 0.8);
    }
    if (p.userData.bag) p.userData.bag.visible = t > T.menschen;
    p.visible = t < T.wenigen + 0.5;
  });
  // buses: appear for the evacuation, then roll away west
  P.buses.visible = t > T.erst && t < T.rest;
  P.buses.position.x = -smooth(ramp(t, T.ueber + 1.5, T.zurueck + 2)) * 60;
  if (P.smoke) P.smoke.userData.update(t + 30, 1, 0);
  // Forsmark: the worker walks into the portal, the alarm goes off at "Strahlenalarm"
  const wk = smooth(ramp(t, T.rest, T.alarm));
  FO.worker.position.set(0, 0, 3.4 - wk * 3.0);
  walk(FO.worker, t * 2, t < T.alarm ? 0.8 : 0);
  FO.setAlarm(t > T.alarm ? 1 : 0, t);
  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
