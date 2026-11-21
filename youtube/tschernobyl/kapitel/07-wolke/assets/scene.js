// Chapter 7: rain in Bavaria, caesium specks gathering in the truffle, the
// boar digging; liquidators on the roof; the sarcophagus; the arch rolling
// in on rails; horses and wolves in the zone.
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
  rng,
  real,
  roundedBox,
} from "./world.js";
import { PLANT, FOREST } from "./set.js";
import { makePerson, makeHorse, makeWolf, walk, shadowAll } from "./welt.js";
import { T, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);
const applyCamera = shotCamera(shots);
const r = rng(12);
// caesium specks in the soil around the truffle (forest scale: metres)
const NS = 160;
const specks = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.012, 0),
  new THREE.MeshBasicMaterial({ color: 0x6ff0ff, toneMapped: false }),
  NS,
);
specks.userData.noAO = true;
const sp = Array.from({ length: NS }, () => [(r() - 0.5) * 2.4, (r() - 0.5) * 2.4, r()]);
FOREST.group.add(specks);
const d0 = new THREE.Object3D();
// liquidators on the roof of block 3, shovelling
const liq = [];
for (let i = 0; i < 9; i++) {
  const p = makePerson({ coat: 0x5a6a4a, legs: 0x3a4430, helmet: 0x5a6a4a });
  p.position.set(-8.3 + i * 0.55, 7.12, -1.2 + (i % 3) * 1.3);
  p.rotation.y = 0.3 * (i % 3);
  ground.add(p);
  liq.push(p);
}
// debris from the core on block 3's roof
PLANT.ruinParts.chunks
  .slice(0, 20)
  .forEach((c, i) =>
    c.position.set(-8.6 + (i % 10) * 0.55, 7.25, -1.6 + Math.floor(i / 10) * 2.4 + (i % 3) * 0.3),
  );
// abandoned houses + animals in the zone
const houses = [];
for (let i = 0; i < 4; i++) {
  const h = new THREE.Group();
  const wall = new THREE.Mesh(
    roundedBox(0.8, 0.4, 0.6, 0.02),
    real.wood(0x7a6a52, { roughness: 0.95 }),
  );
  wall.position.y = 0.2;
  h.add(wall);
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(0.62, 0.35, 4),
    real.plastic(0x5a5a58, { roughness: 0.9 }),
  );
  roof.position.y = 0.57;
  roof.rotation.y = Math.PI / 4;
  h.add(roof);
  shadowAll(h);
  h.position.set(26 + i * 2.2, 0, -31 - (i % 2) * 2);
  h.rotation.y = r() * 0.6;
  ground.add(h);
  houses.push(h);
}
const horses = [0, 1, 2, 3].map((i) => {
  const h = makeHorse(1.1);
  h.position.set(29 + i * 1.1, 0, -26.5 - (i % 2) * 0.8);
  h.rotation.y = 0.6 + i * 0.3;
  ground.add(h);
  return h;
});
const wolves = [0, 1].map((i) => {
  const w = makeWolf(1.1);
  w.position.set(35 + i * 0.6, 0, -29 + i * 0.5);
  w.rotation.y = 2.4;
  ground.add(w);
  return w;
});
function renderAt(t) {
  // the plant: ruin (liquidators) → sarcophagus → arch
  const st = t < T.in ? "explodiert" : t < T.er ? "sarkophag" : "nsc";
  PLANT.setState(st);
  if (st === "explodiert") PLANT.setRuin(t, true, 0.25);
  PLANT.ruinParts.fires.forEach((f) => f.userData.update(t, 0));
  PLANT.nsc.position.x = 3.2 - (1 - smooth(ramp(t, T.er + 2, T.rund))) * 28;
  liq.forEach((p, i) => {
    p.visible = st === "explodiert";
    walk(p, t * 1.5 + i, 0.5);
  });
  // caesium: specks drift towards the truffle once it is named
  const gather = smooth(ramp(t, T.ein + 2.5, T.wild));
  const half = t > T.nach + 1 ? 0.5 : 1;
  sp.forEach(([x, z, ph], i) => {
    const show = i / NS < half || gather > 0;
    const px = x + (0.9 - x) * gather;
    const pz = z + (0.6 - z) * gather;
    d0.position.set(px, FOREST.fh(px, pz) + 0.03 + Math.sin(t * 2 + ph * 6) * 0.01, pz);
    d0.scale.setScalar(show && t > T.was ? 1 : 0);
    d0.updateMatrix();
    specks.setMatrixAt(i, d0.matrix);
  });
  specks.instanceMatrix.needsUpdate = true;
  // the boar walks to the truffle and roots
  const bw = smooth(ramp(t, T.wild - 0.5, T.wild + 2));
  FOREST.boar.position.set(-1.6 + bw * 1.1, FOREST.fh(-0.5, 0.3), 0.6 - bw * 0.2);
  FOREST.boar.userData.update(
    t,
    t > T.wild - 0.5 && t < T.wild + 2 ? 1 : 0,
    6,
    t > T.wild + 2 ? 1 : 0,
  );
  FOREST.truffle.visible = t < T.deshalb + 3;
  horses.forEach((h, i) => h.userData.update(t, 0.2, 2 + i));
  wolves.forEach((w, i) => {
    w.position.x = 35 + i * 0.6 - smooth(ramp(t, T.woelfe, T.die)) * 3;
    w.userData.update(t, t > T.woelfe && t < T.die ? 1 : 0, 7);
  });
  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
