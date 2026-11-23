// Chapter 3: the pumice rain on Pompeii.
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
  scene,
} from "./world.js";
import { makePumice, makePerson, walk, addBundle, addTorch, makeShip } from "./welt.js";
import { P } from "./set.js";
import { T, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);
const applyCamera = shotCamera(shots);
for (const p of P.people) p.visible = false;
const near = makePumice({ n: 2400, size: 6, top: 3, scale: 0.6, seed: 4 });
scene.add(near);

// people leaving through the south gate
const flee = [];
for (let i = 0; i < 14; i++) {
  const p = makePerson({ coat: [0xe9e0cc, 0xc9a46a, 0x6f7f8c, 0x8c5a3a, 0xa8432f][i % 5] });
  addBundle(p);
  if (i % 3 === 0) p.userData.torch = addTorch(p);
  p.userData.ph = i * 0.73;
  scene.add(p);
  flee.push(p);
}
const torchL = new THREE.PointLight(0xffa050, 0, 6, 1.6);
scene.add(torchL);
// someone stays: a figure in a doorway, an oil lamp inside
const stay = makePerson({ coat: 0x8a7a5a, skin: 0xc99a74 });
stay.position.set(5.25, 0.05, 2.22);
stay.rotation.y = -Math.PI / 2;
scene.add(stay);
const lamp = new THREE.PointLight(0xffb060, 0, 2.5, 1.5);
lamp.position.set(5.32, 0.2, 2.3);
scene.add(lamp);
const climber = makePerson({ coat: 0x6f7f8c });
scene.add(climber);
// one cubic metre of pumice on a roof (stones in a 0.1 cube)
const cube = new THREE.Group();
{
  const g = new THREE.DodecahedronGeometry(0.009, 0);
  const m = new THREE.MeshStandardMaterial({ color: 0xd2c8b4, roughness: 1, flatShading: true });
  const im = new THREE.InstancedMesh(g, m, 700);
  const m4 = new THREE.Matrix4();
  let k = 0;
  for (let a = 0; a < 9; a++)
    for (let b = 0; b < 9; b++)
      for (let c = 0; c < 9 && k < 700; c++) {
        m4.makeTranslation(
          a * 0.0115 - 0.046 + ((b + c) % 2) * 0.003,
          c * 0.0115 + 0.006,
          b * 0.0115 - 0.046,
        );
        im.setMatrixAt(k++, m4);
      }
  cube.add(im);
  cube.position.set(6.0, 0.012, 2.38);
  const man = makePerson({ coat: 0x8c5a3a });
  man.position.set(0.09, 0.0, 0.05);
  man.rotation.y = Math.PI;
  cube.add(man);
  scene.add(cube);
}
// ships for the last shot
const ships = [0, 1, 2].map((i) => {
  const s = makeShip();
  s.position.set(-44 + i * 5, -0.12, 27 - i * 3.5);
  s.rotation.y = 0.5;
  scene.add(s);
  return s;
});

// stones lying on the paving of the main street (more as the layer grows)
const lying = (() => {
  const g = new THREE.DodecahedronGeometry(1, 0);
  const m = new THREE.MeshStandardMaterial({ color: 0xd8ccb4, roughness: 1, flatShading: true });
  const im = new THREE.InstancedMesh(g, m, 1500);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 1500; i++) {
    const sz = 0.004 + rnd() * rnd() * 0.012;
    q.setFromEuler(new THREE.Euler(rnd() * 6, rnd() * 6, 0));
    m4.compose(V(2.5 + rnd() * 8, 0.012 + sz * 0.6, 2.14 + rnd() * 0.52), q, V(sz, sz * 0.8, sz));
    im.setMatrixAt(i, m4);
  }
  scene.add(im);
  return im;
})();

function renderAt(t) {
  const morning = t >= T.morgen;
  const dark = morning ? 0 : smooth(ramp(t, 0, 4.5));
  P.mood(morning ? "morgen" : "dunkel", morning ? 1 : dark * 0.95);
  P.column.userData.update(t + 200, { grow: 1, k: 1, drift: 1.2 });
  P.lightning.userData.update(t * 1.5, morning ? 0 : dark);
  // pumice: falling until morning; the layer grows 0 → 0.12 by night, 0.28 in the morning
  const fall = morning ? 0.25 : dark;
  const camCenter = t < T.viele ? V(6, 0, 2.4) : t < T.der ? V(4, 0, 6) : V(6, 0, 2.5);
  P.pumice.userData.update(t, fall * 0.8, camCenter);
  near.userData.update(
    t,
    fall,
    t < T.viele ? V(6.2, 0, 2.4) : t < T.morgen ? V(6.8, 0, 2.6) : V(6.3, 0, 2.6),
    0,
  );
  const level = morning
    ? 0.28
    : t < T.rund
      ? 0.004 * smooth(ramp(t, T.aus, T.rund))
      : t < T.viele
        ? lerpL(t)
        : 0.025 + smooth(ramp(t, T.viele, T.ganze)) * 0.1;
  P.setPumice(level);
  lying.count = Math.floor(1500 * Math.min(1, t < T.aus ? 0 : (t - T.aus) / 8));
  lying.visible = !morning;
  P.dust(Math.min(1, 0.2 + level * 6));
  // roofs collapse in the night (around the shot's houses)
  P.collapse(t, T.ganze - 0.1, T.ganze + 2.6, V(5.5, 0, 1.2), 4.5, 0.55);
  // the fleeing people walk south out of the gate
  flee.forEach((p, i) => {
    const u = ((t - T.viele) * 0.09 + p.userData.ph * 0.25) % 1;
    p.visible = t >= T.viele - 0.2 && t < T.andere - 0.2;
    p.position.set(1.85 + ((i % 3) - 1) * 0.12, 0.05, 10.2 + u * 6 + Math.floor(i / 3) * 0.05);
    p.rotation.y = -Math.PI / 2;
    walk(p, t * 2.2 + i, 1);
    if (p.userData.torch)
      p.userData.torch.userData.flame.scale.y = 1.6 + Math.sin(t * 17 + i) * 0.3;
  });
  torchL.position.set(1.85, 0.4, 12.5 + ((t * 0.5) % 2));
  torchL.intensity = t >= T.viele - 0.2 && t < T.andere - 0.2 ? 3 : 0;
  stay.visible = t >= T.andere - 0.2 && t < T.der - 0.2;
  lamp.intensity = stay.visible ? 2.2 + Math.sin(t * 9) * 0.2 : 0;
  // climbing out over the roofs in the morning
  climber.visible = t >= T.wer - 0.2 && t < T.dreissig - 0.2;
  climber.position.set(6.4 + (t - T.wer) * 0.03, 0.78, 1.0);
  climber.rotation.y = 0;
  walk(climber, t * 1.5, 0.7);
  cube.visible = t >= T.doch - 0.2 && t < T.nacht - 0.3;
  ships.forEach((s, i) => {
    s.position.x = -44 + i * 5 + (t - T.dreissig) * 0.6;
    s.userData.row(t + i, 1);
  });
  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
function lerpL(t) {
  return 0.004 + smooth(ramp(t, T.rund, T.viele)) * 0.021;
}
start(renderAt);
