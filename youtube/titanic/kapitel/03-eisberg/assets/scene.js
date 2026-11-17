// Chapter 3 "37 Sekunden": lookout without binoculars, the locked cupboard,
// a berg with and without its white seam of surf, the bell, Murdoch, the
// top view of the slow turn, bicycle vs freight train, the scrape, a tremor.
import {
  THREE,
  scene,
  ground,
  real,
  roundedBox,
  squash,
  pop,
  ramp,
  smooth,
  rng,
  highlights,
  labels,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import "./set.js";
import { bike } from "./props.js";
import { makeTitanic, makeWake, makeSmoke, makePerson, makeIceberg, topY, MAT } from "./welt.js";
import { T, RAD, RAIL, DEMO, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);
const ship = makeTitanic();
ground.add(ship.group);
const wake = makeWake(ship);
const smoke = makeSmoke(ship);
for (const [z, c] of [
  [0.02, 0x1a1f2b],
  [-0.06, 0x232a38],
]) {
  const p = makePerson({ coat: c });
  p.position.set(9.82, 2.84, z);
  p.rotation.y = Math.PI / 2;
  ship.bow.add(p);
}
const murdoch = makePerson({ coat: 0x0f1320 });
murdoch.position.set(7.42, 1.82, 1.15);
murdoch.rotation.y = Math.PI / 2;
ship.bow.add(murdoch);
// the binocular cupboard on the bridge wing, locked
{
  const box = new THREE.Mesh(roundedBox(0.05, 0.07, 0.035, 0.006), real.wood(0x6a4226));
  box.position.set(7.55, 1.855, 1.33);
  ship.bow.add(box);
  const hole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.004, 16),
    real.metal(0xc9a75a, { roughness: 0.25 }),
  );
  hole.rotation.x = Math.PI / 2;
  hole.position.set(7.55, 1.86, 1.349);
  ship.bow.add(hole);
}
const bell = ship.nest.children[2];
// the berg: ahead, then sliding along the starboard side
const berg = makeIceberg({ seed: 5, size: 2.4, len: 3.4 });
ground.add(berg);
// ice that falls onto the forward well deck
const iceBits = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.035, 0), MAT.ice, 26);
{
  const r = rng(9);
  const d = new THREE.Object3D();
  for (let i = 0; i < 26; i++) {
    const x = 8.7 + r() * 0.7;
    d.position.set(x, topY(x) + 0.02, 0.3 + r() * 0.9);
    d.rotation.set(r() * 3, r() * 3, 0);
    d.scale.setScalar(0.6 + r());
    d.updateMatrix();
    iceBits.setMatrixAt(i, d.matrix);
  }
  ship.bow.add(iceBits);
}
// the demonstration berg with a white seam of breaking waves
const demo = makeIceberg({ seed: 11, size: 1.6, len: 2.6 });
demo.position.set(...DEMO);
ground.add(demo);
const surfMat = new THREE.MeshBasicMaterial({
  color: 0xeef4ff,
  transparent: true,
  opacity: 0,
  depthWrite: false,
  toneMapped: false,
});
const surf = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.75, 48, 2), surfMat);
surf.rotation.x = -Math.PI / 2;
surf.scale.set(1.25, 0.95, 1);
surf.position.set(DEMO[0], 0.03, DEMO[2]);
scene.add(surf);
// bicycle vs freight train on a dark stage
const rail = new THREE.Group();
rail.position.set(...RAIL);
scene.add(rail);
{
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 30),
    real.plastic(0x2a2622, { roughness: 0.95 }),
  );
  floor.rotation.x = -Math.PI / 2;
  rail.add(floor);
  const steel = real.metal(0x9aa0a8, { roughness: 0.3 });
  for (const z of [-1.0, -1.4]) {
    const r = new THREE.Mesh(new THREE.BoxGeometry(60, 0.04, 0.04), steel);
    r.position.set(0, 0.06, z);
    rail.add(r);
  }
  for (let x = -30; x < 30; x += 0.45) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.7), real.wood(0x4a3424));
    s.position.set(x, 0.02, -1.2);
    rail.add(s);
  }
  const key = new THREE.PointLight(0xfff0dc, 140, 40, 1.2);
  key.position.set(0, 6, 4);
  rail.add(key);
}
const train = new THREE.Group();
{
  const colors = [0x2b2b2e, 0x6b3a26, 0x5a4a36, 0x6b3a26, 0x3e4a3a];
  colors.forEach((c, i) => {
    const car = new THREE.Mesh(
      roundedBox(1.5, 0.7, 0.62, 0.05),
      real.plastic(c, { roughness: 0.6 }),
    );
    car.position.set(-i * 1.62, 0.5, 0);
    train.add(car);
    for (const dx of [-0.5, 0.5])
      for (const dz of [-0.2, 0.2]) {
        const w = new THREE.Mesh(
          new THREE.CylinderGeometry(0.11, 0.11, 0.05, 20),
          real.metal(0x333333),
        );
        w.rotation.x = Math.PI / 2;
        w.position.set(-i * 1.62 + dx, 0.12, dz);
        train.add(w);
      }
  });
  const chimney = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 0.3, 16),
    real.plastic(0x1a1a1a),
  );
  chimney.position.set(0.5, 1.0, 0);
  train.add(chimney);
  train.position.set(0, 0, -1.2);
  rail.add(train);
}
const bk = bike(0xc0392b);
bk.scale.setScalar(0.5);
rail.add(bk);
// the glass of water on the radio desk
const glass = new THREE.Mesh(
  new THREE.CylinderGeometry(0.035, 0.03, 0.1, 32, 1, true),
  real.glass(),
);
glass.position.set(RAD[0] + 0.3, RAD[1] + 0.5, RAD[2] - 0.45);
scene.add(glass);
const waterTop = new THREE.Mesh(
  new THREE.CircleGeometry(0.033, 32),
  new THREE.MeshPhysicalMaterial({
    color: 0x9fd0e8,
    roughness: 0.05,
    transparent: true,
    opacity: 0.7,
  }),
);
waterTop.rotation.x = -Math.PI / 2;
waterTop.position.set(RAD[0] + 0.3, RAD[1] + 0.525, RAD[2] - 0.45);
scene.add(waterTop);

const applyCamera = shotCamera(shots);
function renderAt(t) {
  wake.userData.update(t, 1 - 0.5 * smooth(ramp(t, T.ruder, T.verfehlt)));
  smoke.userData.update(t, 1);
  bell.rotation.z =
    t > T.glocke - 0.1 && t < T.glocke + 1.6 ? Math.sin((t - T.glocke) * 18) * 0.35 : 0;
  // the turn: bow swings to port, far too slowly
  ship.group.rotation.y = 0.11 * smooth(ramp(t, T.ruder + 0.5, T.meisten));
  // the berg: dead ahead, then passing down the starboard side
  const k = ramp(t, T.dann, T.meisten + 2);
  berg.position.set(30 - k * 48, 0, 2.55 - 0.9 * smooth(ramp(t, T.dann, T.verfehlt)) * 0);
  iceBits.visible = t >= T.schrammt + 0.4;
  // the white seam: there on a normal night, gone on this one
  surfMat.opacity = 0.75 * pop(t, T.normal + 0.6, T.doch + 0.3) * (0.75 + 0.25 * Math.sin(t * 5));
  surf.scale.set(1.25 + 0.04 * Math.sin(t * 3), 0.95, 1);
  // bicycle turns on the spot; the train needs the whole stage to change course
  const b = ramp(t, T.fahrrad + 0.2, T.fahrrad + 1.6);
  bk.position.set(-3 + Math.sin(b * Math.PI) * 0.6, 0, 1.0 - b * 0.8);
  bk.rotation.y = b * Math.PI;
  train.position.x = -4 + 9 * ramp(t, T.zug - 0.5, T.zug2);
  // the tremor in the glass
  const tr = pop(t, T.meisten + 0.4, T.end + 1);
  waterTop.position.y = RAD[1] + 0.525 + Math.sin(t * 40) * 0.002 * tr;
  waterTop.scale.setScalar(1 + Math.sin(t * 33) * 0.03 * tr);
  void squash;
  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
