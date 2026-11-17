// Chapter 7 "Die Rettung": the Carpathia arrives at dawn among icebergs,
// lifeboats come alongside, survivors climb up; then the rule: the Titanic
// beside a ship four times smaller — both with the same 16 lifeboats.
import {
  THREE,
  ground,
  real,
  ramp,
  smooth,
  pop,
  rng,
  squash,
  labels,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import "./set.js";
import { makeSmallShip, makeLifeboat, makePerson, makeTitanic, shipLights } from "./welt.js";
import { T, CARP, RULE, shots, LABELS } from "./beats.js";

const carp = makeSmallShip({ funnel: 0xc8462a, band: 0x151515 });
carp.scale.setScalar(1.5);
carp.position.set(...CARP);
carp.rotation.y = 0.3;
ground.add(carp);
// lifeboats rowing in, with people
const r = rng(7);
const boats = [];
for (let i = 0; i < 9; i++) {
  const b = makeLifeboat({ cover: false });
  const people = new THREE.InstancedMesh(
    new THREE.CapsuleGeometry(0.012, 0.025, 3, 6),
    real.fabric([0x2b2f3a, 0x5a3a2a, 0x3a3f4a][i % 3]),
    30,
  );
  const d = new THREE.Object3D();
  for (let k = 0; k < 30; k++) {
    d.position.set(-0.3 + (k % 10) * 0.065, 0.07, -0.06 + Math.floor(k / 10) * 0.06);
    d.updateMatrix();
    people.setMatrixAt(k, d.matrix);
  }
  b.add(people);
  b.userData = { a: r() * 6.28, d0: 6 + r() * 10, ph: r() };
  ground.add(b);
  boats.push(b);
}
// people climbing the ladder on the Carpathia's side
const climbers = [0, 1, 2].map(() => {
  const p = makePerson({ coat: 0x2b2f3a, scale: 0.8 });
  carp.add(p);
  return p;
});
// the rule: Titanic vs. a ship of 10,000 tons, both with 16 boats
const big = makeTitanic();
big.group.position.set(RULE[0], 0, RULE[2]);
ground.add(big.group);
const small = makeTitanic();
small.group.scale.set(0.62, 0.62, 0.62);
small.group.position.set(RULE[0] - 4, 0, RULE[2] + 6);
ground.add(small.group);
const glow = new THREE.MeshBasicMaterial({
  color: 0xffd23f,
  transparent: true,
  opacity: 0,
  toneMapped: false,
  depthWrite: false,
});
const rings = [];
for (const s of [big, small])
  for (const b of s.boats) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.03, 6, 24), glow);
    ring.rotation.x = Math.PI / 2;
    ring.scale.set(1, 0.4, 1);
    b.add(ring);
    rings.push(ring);
  }

const applyCamera = shotCamera(shots);
function renderAt(t) {
  shipLights(t < T.untersuchungen ? 0.6 : 0.25);
  carp.position.x = CARP[0] + 3 * (1 - smooth(ramp(t, 0, T.feld)));
  boats.forEach((b, i) => {
    const { a, d0, ph } = b.userData;
    const k = smooth(ramp(t, T.morgengrauen + i * 0.6, T.untersuchungen));
    const d = d0 * (1 - 0.75 * k);
    b.position.set(
      CARP[0] + Math.cos(a) * d,
      0.02 + Math.sin(t * 1.3 + ph * 6) * 0.01,
      CARP[2] + 2.5 + Math.sin(a) * d * 0.6,
    );
    b.rotation.y = -a + Math.PI / 2 + Math.sin(t * 0.6 + ph) * 0.05;
    b.visible = t < T.untersuchungen;
  });
  climbers.forEach((p, i) => {
    const u = (t * 0.25 + i / 3) % 1;
    p.position.set(0.3 + i * 0.3, -0.05 + u * 0.55, 0.36);
    p.visible = t >= T.bis && t < T.untersuchungen;
  });
  // the rule: the same boats on both — they glow on "gleich viele Boote"
  glow.opacity = 0.9 * pop(t, T.fuer + 1.5, T.was);
  big.group.visible = small.group.visible = t >= T.untersuchungen - 0.5;
  small.group.scale.copy(squash(t, T.fuer, 0.6)).multiplyScalar(0.62);
  void labels;
  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
