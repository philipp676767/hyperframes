// Chapter 5 "Halb leere Boote": spark gap CQD/SOS, the Carpathia far off
// turning hard, white rockets seen from the Californian, her dark radio cabin,
// the calm lit ship, boat 7 lowered with 28 of 65, the band, empty davits.
import {
  THREE,
  scene,
  ground,
  real,
  ramp,
  smooth,
  rng,
  labels,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { RADIO_ROOM, NIGHT } from "./set.js";
import {
  makeTitanic,
  makeWake,
  makeSmoke,
  makePerson,
  makeSmallShip,
  makeFlare,
  makeIceberg,
} from "./welt.js";
import { T, CAL, CARP, shots, LABELS } from "./beats.js";

const ship = makeTitanic();
ground.add(ship.group);
const wake = makeWake(ship);
const smoke = makeSmoke(ship);
// the Carpathia (Cunard: red funnel, black top), far away, turning towards us
const carp = makeSmallShip({ funnel: 0xc8462a, band: 0x151515 });
carp.position.set(...CARP);
ground.add(carp);
// the Californian's radio cabin: dark (the operator is asleep)
const cal = NIGHT.californian;
for (let i = 0; i < 6; i++) {
  const b = makeIceberg({ seed: 40 + i, size: 0.4 + (i % 3) * 0.3, len: 1 + (i % 2) });
  const a = i * 1.1;
  b.position.set(CAL[0] + Math.cos(a) * (5 + i), 0, CAL[2] + Math.sin(a) * (4 + i * 0.8));
  ground.add(b);
}
const dark = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.02), real.plastic(0x101418));
dark.position.set(0.5, 0.68, 0.26);
cal.add(dark);
const watchman = makePerson({ coat: 0x1a1f2b });
watchman.position.set(0.9, 0.82, 0.1);
watchman.rotation.y = 2.4;
cal.add(watchman);
// white distress rockets fired from the Titanic's boat deck
const flares = [0, 1, 2].map(() => {
  const f = makeFlare();
  f.position.set(7.0, 2.0, 0);
  ground.add(f);
  return f;
});
// boat 7 (forward starboard): lowered with 28 people in seats for 65
const boat = ship.boats[0];
const r = rng(28);
const seats = new THREE.InstancedMesh(
  new THREE.CapsuleGeometry(0.012, 0.025, 3, 6),
  real.fabric(0x2b2f3a),
  28,
);
{
  const d = new THREE.Object3D();
  for (let i = 0; i < 28; i++) {
    d.position.set(-0.3 + (i % 10) * 0.065 + r() * 0.01, 0.07, -0.06 + Math.floor(i / 10) * 0.06);
    d.updateMatrix();
    seats.setMatrixAt(i, d.matrix);
  }
  boat.add(seats);
}
const boat0 = boat.position.clone();
// crowd at the rail by the boats + the band aft
const crowd = new THREE.InstancedMesh(
  new THREE.CapsuleGeometry(0.02, 0.05, 3, 6),
  real.fabric(0x2b2f3a),
  260,
);
{
  const d = new THREE.Object3D();
  for (let i = 0; i < 260; i++) {
    d.position.set(3.4 + r() * 3.4, 1.86, (r() < 0.5 ? -1 : 1) * (0.65 + r() * 0.5));
    d.updateMatrix();
    crowd.setMatrixAt(i, d.matrix);
  }
  ship.bow.add(crowd);
}
const band = [];
for (let i = 0; i < 5; i++) {
  const p = makePerson({ coat: 0x111318, cap: false });
  p.position.set(-2.4 + (i % 3) * 0.08, 1.82, 0.5 + i * 0.07);
  p.rotation.y = -0.3 + i * 0.15;
  ship.bow.add(p);
  const inst = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.012, 0.01), real.wood(0x8a4f22));
  inst.position.set(-2.4 + (i % 3) * 0.08 + 0.02, 1.95, 0.5 + i * 0.07);
  ship.bow.add(inst);
  band.push(inst);
}
void scene;

const applyCamera = shotCamera(shots);
function renderAt(t) {
  wake.userData.update(t, 0.15);
  smoke.userData.update(t, 0.4);
  // the bow is slowly settling
  ship.group.rotation.z = -0.03 - 0.05 * smooth(ramp(t, 0, T.end));
  ship.group.position.y = ship.group.rotation.z * 4;
  // spark gap: CQD ... SOS
  const sending = t >= T.kurz && t < T.naechste;
  const on = sending && Math.sin(t * 21) > 0.15 && Math.sin(t * 2.7) > -0.5;
  RADIO_ROOM.sparkMat.opacity = on ? 1 : 0;
  RADIO_ROOM.sparkLight.intensity = on ? 3 : 0;
  RADIO_ROOM.keyArm.rotation.z = on ? -0.08 : 0;
  RADIO_ROOM.setClock(0.25);
  RADIO_ROOM.ops.forEach((o) => (o.visible = false));
  // Carpathia turns hard to port and comes on
  carp.rotation.y = 2.2 + 1.2 * smooth(ramp(t, T.rostron, T.rostron + 4));
  // rockets: one at "Dabei", one at "Notraketen", one later over the deck shots
  [T.dabei + 1.0, T.notraketen, T.deck + 3].forEach((at, i) =>
    flares[i].userData.set(ramp(t, at, at + 4.5), 5.5),
  );
  // boat 7: swung out and lowered from "Um 0:45" on
  const low = smooth(ramp(t, T.um + 0.6, T.darin + 0.4));
  boat.position.set(boat0.x, boat0.y - 1.75 * low, boat0.z + 0.42 * Math.min(1, low * 4));
  boat.visible = t < T.denn;
  ship.boats.forEach((b, i) => {
    if (i > 0) b.visible = t < T.denn - 0.2;
  });
  band.forEach((b, i) => (b.rotation.z = Math.sin(t * 8 + i) * 0.3));
  crowd.visible = t >= T.deck;
  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
