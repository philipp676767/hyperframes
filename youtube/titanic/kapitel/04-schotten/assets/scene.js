// Chapter 4 "Das Eiswürfel-Problem": x-ray bow, the long thin gash, jets of
// water, rooms 1–6 filling, the bulkhead tops, the ice-cube tray tipping in a
// sink, the bow settling room by room, boats on the deck.
import {
  THREE,
  V,
  scene,
  ground,
  real,
  roundedBox,
  setXray,
  pop,
  ramp,
  smooth,
  rng,
  labels,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { NIGHT } from "./set.js";
import { makeTitanic, setWater, makePerson, secZ } from "./welt.js";
import { T, SINK, shots, LABELS } from "./beats.js";

const solid = makeTitanic();
ground.add(solid.group);
const xr = makeTitanic({ xray: true });
ground.add(xr.group);
// Smith + Andrews on the bridge wing, then below
const andrews = makePerson({ coat: 0x3a2f28 });
andrews.position.set(7.25, 1.82, 0.7);
andrews.rotation.y = Math.PI / 2;
solid.bow.add(andrews);
const smith = makePerson({ coat: 0x0f1320 });
smith.position.set(7.35, 1.82, 0.95);
smith.rotation.y = Math.PI / 2;
solid.bow.add(smith);
// the gash: a broken line of opened seams on the starboard side, x 4.3–13.3
const gash = new THREE.Group();
const r = rng(4);
for (let x = 4.3; x < 13.2; x += 0.35 + r() * 0.3) {
  const y = -0.45 + (r() - 0.5) * 0.2;
  const len = 0.15 + r() * 0.3;
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(len, 0.018, 0.01),
    new THREE.MeshBasicMaterial({ color: 0xff4b2b, toneMapped: false }),
  );
  m.position.set(x, y, secZ(x, y) + 0.01);
  m.rotation.z = (r() - 0.5) * 0.3;
  gash.add(m);
}
xr.bow.add(gash);
// jets of water through the seams
const jetGeo = new THREE.SphereGeometry(0.025, 8, 6);
const jetMat = new THREE.MeshBasicMaterial({
  color: 0x7fd0ff,
  transparent: true,
  opacity: 0.85,
  toneMapped: false,
});
const jets = new THREE.InstancedMesh(jetGeo, jetMat, 240);
xr.bow.add(jets);
const jetSeeds = Array.from({ length: 240 }, () => [
  4.4 + r() * 8.8,
  -0.45 + (r() - 0.5) * 0.2,
  r(),
]);
const d = new THREE.Object3D();
// the ice-cube tray in a sink
const sink = new THREE.Group();
sink.position.set(...SINK);
scene.add(sink);
{
  const steel = real.metal(0xc4c9cf, { roughness: 0.28 });
  const base = new THREE.Mesh(roundedBox(2.4, 0.06, 1.6, 0.02), steel);
  base.position.y = -0.4;
  sink.add(base);
  for (const [w, dd, x, z] of [
    [2.4, 0.06, 0, 0.8],
    [2.4, 0.06, 0, -0.8],
    [0.06, 1.6, 1.2, 0],
    [0.06, 1.6, -1.2, 0],
  ]) {
    const wall = new THREE.Mesh(roundedBox(w, 0.6, dd, 0.02), steel);
    wall.position.set(x, -0.12, z);
    sink.add(wall);
  }
  const water = new THREE.Mesh(
    new THREE.BoxGeometry(2.34, 0.22, 1.54),
    new THREE.MeshPhysicalMaterial({
      color: 0x8fc9e6,
      roughness: 0.05,
      transparent: true,
      opacity: 0.45,
    }),
  );
  water.position.y = -0.27;
  sink.add(water);
  const lamp = new THREE.PointLight(0xfff2dd, 3, 7, 1.4);
  lamp.position.set(0.8, 1.6, 1.0);
  sink.add(lamp);
}
const tray = new THREE.Group();
sink.add(tray);
const cells = [];
{
  const blue = real.plastic(0x5aa7d6, { roughness: 0.35, transparent: true, opacity: 0.55 });
  const floor = new THREE.Mesh(roundedBox(1.6, 0.03, 0.5, 0.01), blue);
  tray.add(floor);
  for (let i = 0; i <= 8; i++) {
    const w = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.14, 0.5), blue);
    w.position.set(-0.8 + i * 0.2, 0.07, 0);
    tray.add(w);
  }
  for (const z of [-0.25, 0, 0.25]) {
    const w = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.14, 0.02), blue);
    w.position.set(0, 0.07, z);
    tray.add(w);
  }
  const wm = new THREE.MeshPhysicalMaterial({
    color: 0x2f9bff,
    emissive: 0x0b3f80,
    roughness: 0.1,
    transparent: true,
    opacity: 0.8,
  });
  for (let i = 0; i < 8; i++) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.12, 0.47), wm);
    c.position.set(0.7 - i * 0.2, 0.075, 0);
    tray.add(c);
    cells.push(c);
  }
}
// crowd on the boat deck
const crowd = new THREE.InstancedMesh(
  new THREE.CapsuleGeometry(0.02, 0.05, 3, 6),
  real.fabric(0x2b2f3a),
  300,
);
{
  const rr = rng(8);
  for (let i = 0; i < 300; i++) {
    d.position.set(3.4 + rr() * 3.4, 1.86, (rr() < 0.5 ? -1 : 1) * (0.7 + rr() * 0.45));
    d.updateMatrix();
    crowd.setMatrixAt(i, d.matrix);
  }
  solid.bow.add(crowd);
}

// light inside the x-ray hull so rooms and water read at night
const inner = new THREE.PointLight(0xbfe6ff, 0, 14, 1.2);
inner.position.set(8, 0.2, 2.2);
scene.add(inner);
const seaMats = [NIGHT.water.material];
const applyCamera = shotCamera(shots);
function renderAt(t) {
  // x-ray from "Was sie dort sehen" until the tray, and again for the bow settling
  const xk = Math.max(pop(t, T.was - 0.4, T.stell, 0.6), pop(t, T.genau - 0.3, T.andrews2, 0.6));
  setXray(xr.mats, Math.min(1, xk * 1.2));
  xr.group.visible = xk > 0.02;
  inner.intensity = 14 * xk;
  for (const m of seaMats) {
    m.transparent = true;
    m.opacity = 1 - 0.7 * xk;
    m.depthWrite = xk < 0.01;
  }
  solid.group.visible = xk < 0.98;
  // the bow settles a little through the chapter
  const trim = -0.05 * smooth(ramp(t, T.durch, T.end));
  for (const s of [solid, xr]) {
    s.group.rotation.z = trim;
    s.group.position.y = trim * 4;
  }
  // rooms 1–6 fill, later 7 and 8 over the tops
  for (let i = 0; i < xr.inside.water.length; i++) {
    let k = 0;
    if (i < 6)
      k =
        smooth(ramp(t, T.durch + i * 0.5, T.betroffen + 1 + i * 0.6)) *
        (0.55 + 0.45 * smooth(ramp(t, T.genau, T.andrews2)));
    if (i === 6) k = smooth(ramp(t, T.genau + 1, T.andrews2)) * 0.8;
    if (i === 7) k = smooth(ramp(t, T.genau + 3, T.andrews2 + 1)) * 0.4;
    setWater(xr, i, k);
  }
  // the six flooded rooms' bulkheads glow red while counted; the first four amber
  xr.inside.bulkheads.forEach((b, i) => {
    const on = pop(t, T.sechs, T.grund);
    b.material.emissive.setRGB(on * (i < 6 ? 0.6 : 0.1), on * (i < 4 ? 0.3 : 0.05), 0);
  });
  gash.visible = t >= T.aufgeschlitzt - 0.3;
  const jk = pop(t, T.durch, T.stell);
  jets.visible = jk > 0;
  jetSeeds.forEach(([x, y, ph], i) => {
    const u = (ph + t * 1.6) % 1;
    d.position.set(x - u * 0.05, y - u * u * 0.15, secZ(x, y) - u * 0.9);
    d.scale.setScalar(jk * (1 - u * 0.5));
    d.updateMatrix();
    jets.setMatrixAt(i, d.matrix);
  });
  jets.instanceMatrix.needsUpdate = true;
  // the tray: dipped at one end, cells fill one after another and spill over
  const tilt = smooth(ramp(t, T.stell + 0.5, T.faecher + 1));
  tray.rotation.z = -0.18 * tilt - 0.1 * smooth(ramp(t, T.schwappt, T.genau));
  tray.position.set(0, -0.2 - 0.05 * tilt, 0);
  cells.forEach((c, i) => {
    const at = T.faecher + i * ((T.genau - T.faecher) / 9);
    const k = smooth(ramp(t, at, at + 1));
    c.visible = k > 0.02;
    c.scale.y = Math.max(0.02, k);
    c.position.y = 0.015 + 0.06 * k;
  });
  crowd.visible = t >= T.bord - 0.7;
  andrews.visible = smith.visible = t < T.was;
  void V;
  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
