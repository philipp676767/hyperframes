// Chapter 2: inside the mountain, the bottle, the column, Misenum.
import {
  THREE,
  shotCamera,
  renderFrame,
  start,
  highlights,
  labels,
  ramp,
  smooth,
  real,
  scene,
  facet,
  facetMat,
  flat,
  jitter,
} from "./world.js";
import { P, XR } from "./set.js";
import { stonePine } from "./welt.js";
import { T, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);
const applyCamera = shotCamera(shots);

// a single pumice stone, close up (pale, porous)
const stone = new THREE.Group();
{
  const g = facet(jitter(new THREE.IcosahedronGeometry(0.9, 2), 0.12, 4), 0.06, 4);
  stone.add(new THREE.Mesh(g, facetMat(flat(0xd8d0c0, { roughness: 1 }))));
  const pm = new THREE.MeshStandardMaterial({ color: 0x5a5448, roughness: 1 });
  for (let i = 0; i < 60; i++) {
    const a = i * 2.39996;
    const y = 1 - (i / 59) * 2;
    const r = Math.sqrt(1 - y * y);
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.05 + (i % 5) * 0.02, 10, 8), pm);
    h.position.set(Math.cos(a) * r * 0.86, y * 0.86, Math.sin(a) * r * 0.86);
    h.scale.set(1, 1, 0.4);
    h.lookAt(0, 0, 0);
    stone.add(h);
  }
  stone.position.set(-25, -195.6, 8);
  stone.scale.setScalar(0.9);
  scene.add(stone);
  const l = new THREE.PointLight(0xfff0dc, 30, 12, 1.6);
  l.position.set(-22, -193, 11);
  scene.add(l);
}
// an airliner for scale (≈ 10 km = 1/3 of the column)
const plane = new THREE.Group();
{
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 3.2, 6, 16), real.plastic(0xf2f2f2));
  body.rotation.z = Math.PI / 2;
  plane.add(body);
  const wing = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.06, 4.2), real.plastic(0xe0e0e4));
  plane.add(wing);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.9, 0.06), real.plastic(0xe0e0e4));
  tail.position.set(1.6, 0.5, 0);
  plane.add(tail);
  plane.scale.setScalar(1.3);
  scene.add(plane);
}

// a stone pine framing the column ("die Krone eines Baumes")
{
  const pine = stonePine(1.5, 5);
  pine.position.set(-18.2, 0, 2.6);
  scene.add(pine);
}

function renderAt(t) {
  // x-ray: pressure, then the release
  const erupt = t >= T.genau - 0.2 ? smooth(ramp(t, T.genau, T.heraus)) : 0;
  const bottle =
    t >= T.oeffnest - 0.1 && t < T.genau ? ramp(t, T.oeffnest - 0.1, T.oeffnest + 2.5) : 0;
  const colGrow = t >= T.heraus - 0.2 ? smooth(ramp(t, T.saeule - 0.4, T.sie)) : 0;
  XR.userData.update(t, {
    press: 1,
    erupt: Math.max(erupt, t > T.in && t < T.so ? 0.15 : 0),
    bottle,
    colGrow,
  });
  stone.rotation.set(t * 0.15, t * 0.3, 0);
  // main world: the column at full height, the umbrella drifting south-east
  const drift = t >= T.was ? 0.6 + smooth(ramp(t, T.was, T.end)) * 0.6 : 0.6;
  P.column.userData.update(t + 120, { grow: 1, k: 1, drift, glow: 0 });
  plane.position.set(18 + (t - T.sie) * 1.2, 31, -40);
  plane.visible = t >= T.sie - 0.3 && t < T.krone;
  P.mood("morgen", smooth(ramp(t, T.was, T.end)) * 0.35);
  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
