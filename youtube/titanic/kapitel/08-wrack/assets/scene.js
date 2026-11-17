// Chapter 8 "3.800 Meter tief": a model of the ship on the desk gets boats for
// all, the clock races (radio day and night), a tiny patrol circles a berg;
// then the deep: a submersible's lights find the bow, the stern far off.
import {
  THREE,
  scene,
  ground,
  real,
  squash,
  ramp,
  smooth,
  labels,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { RADIO_ROOM } from "./set.js";
import {
  makeTitanic,
  makeLifeboat,
  makeIceberg,
  makeSmallShip,
  makeSub,
  rustify,
  BREAK_X,
} from "./welt.js";
import { T, RAD, STERN, shots, LABELS } from "./beats.js";

// the model ship on the desk (1:300 of our scale)
const model = makeTitanic();
model.group.scale.setScalar(0.03);
model.group.position.set(RAD[0], RAD[1] + 0.47, RAD[2] - 0.55);
scene.add(model.group);
const extra = [];
for (let i = 0; i < 24; i++) {
  const b = makeLifeboat();
  const x = -9 + (i % 12) * 1.55;
  if (Math.abs(x - 4.15) < 0.6 || Math.abs(x - 1.7) < 0.6) continue;
  b.position.set(x, 1.93, (i < 12 ? 1 : -1) * 1.18);
  model.group.add(b);
  extra.push(b);
}
// the patrol: a tiny ship circling a tiny berg on the desk
const berg = makeIceberg({ seed: 3, size: 0.025, len: 0.05 });
berg.children.slice(-2).forEach((c) => (c.visible = false));
berg.position.set(RAD[0] - 0.45, RAD[1] + 0.45, RAD[2] - 0.45);
scene.add(berg);
const patrol = makeSmallShip({ funnel: 0xe8e8e8, band: 0xc8462a });
patrol.scale.setScalar(0.02);
scene.add(patrol);
// the deep: bow upright in the mud, stern a wreck far off, a submersible
const wreck = makeTitanic({ seed: 31 });
wreck.group.remove(wreck.stern);
rustify(wreck.bow, { x0: BREAK_X, x1: 12 });
wreck.bow.children
  .filter((o) => o.userData.index !== undefined)
  .forEach((o) => (o.visible = false));
wreck.boats.forEach((b) => (b.visible = false));
wreck.group.position.y = -0.75;
wreck.group.rotation.set(0.04, 0, -0.05);
ground.add(wreck.group);
const sternW = makeTitanic({ seed: 32 });
sternW.group.remove(sternW.bow);
rustify(sternW.stern, { x0: -12, x1: BREAK_X });
sternW.stern.children
  .filter((o) => o.userData.index !== undefined)
  .forEach((o) => (o.visible = false));
sternW.boats.forEach((b) => (b.visible = false));
sternW.group.scale.set(1, 0.45, 1.15);
sternW.group.position.set(STERN[0] + 8, -1.1, STERN[2]);
sternW.group.rotation.set(0.15, 0.6, 0.12);
ground.add(sternW.group);
const sub = makeSub();
ground.add(sub.group);
const lamp = new THREE.PointLight(0x9fd6ff, 30, 16, 1.2);
sub.spots.forEach((sp) => (sp.intensity = 160));
const fillW = new THREE.PointLight(0x5f9fcf, 18, 40, 1.1);
fillW.position.set(4, 6, 10);
ground.add(fillW);
const fillS = new THREE.PointLight(0x5f9fcf, 30, 30, 1.1);
fillS.position.set(-26, 5, 14);
ground.add(fillS);
sub.group.add(lamp);
void real;

const applyCamera = shotCamera(shots);
function renderAt(t) {
  extra.forEach((b, i) => {
    const at = T.jedes + 0.5 + i * 0.06;
    b.visible = t >= at;
    b.scale.copy(squash(t, at, 0.4));
  });
  RADIO_ROOM.ops.forEach((o) => (o.visible = false));
  RADIO_ROOM.setClock(12 + 24 * smooth(ramp(t, T.funk, T.ausserdem)));
  const a = t * 0.6;
  patrol.position.set(
    RAD[0] - 0.45 + Math.cos(a) * 0.12,
    RAD[1] + 0.45,
    RAD[2] - 0.45 + Math.sin(a) * 0.12,
  );
  patrol.rotation.y = -a - Math.PI / 2;
  // the sub: comes down onto the bow, then glides along it
  const d = smooth(ramp(t, T.titanic, T.ballard + 2));
  const g = smooth(ramp(t, T.bug, T.end));
  sub.group.position.set(16 - 18 * g, 4 - 3.2 * d, 4 + 1.5 * g);
  sub.group.rotation.y = Math.PI;
  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
