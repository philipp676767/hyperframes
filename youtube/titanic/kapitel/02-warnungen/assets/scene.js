// Chapter 2 "Sechs Warnungen": the ship at sea, Captain Smith on the bridge
// wing, radio waves coming in, six warning slips, the operators, the
// Californian stopped in the ice — her radio light goes out — 22 knots on.
import {
  THREE,
  ground,
  scene,
  real,
  squash,
  pop,
  ramp,
  smooth,
  labels,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { RADIO_ROOM, NIGHT } from "./set.js";
import { makeTitanic, makeWake, makeSmoke, makePerson, makeIceberg, LIGHT } from "./welt.js";
import { T, RAD, CAL, shots, LABELS } from "./beats.js";

const ship = makeTitanic();
ground.add(ship.group);
const wake = makeWake(ship);
const smoke = makeSmoke(ship);
// Captain Smith on the starboard bridge wing (white cap)
const smith = makePerson({ coat: 0x0f1320 });
smith.position.set(7.42, 1.82, 1.25);
smith.rotation.y = Math.PI / 2;
ship.bow.add(smith);
{
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.026, 0.026, 0.012, 20),
    real.fabric(0xf2f2ee),
  );
  cap.position.set(7.42, 1.82 + 0.18, 1.25);
  ship.bow.add(cap);
}
// radio waves: rings converging on the aerial between the masts
const ringMat = new THREE.MeshBasicMaterial({
  color: 0x7fc8ff,
  transparent: true,
  opacity: 0,
  toneMapped: false,
  depthWrite: false,
});
const rings = [];
for (let i = 0; i < 4; i++) {
  const r = new THREE.Mesh(new THREE.TorusGeometry(1, 0.03, 8, 96), ringMat);
  r.rotation.x = Math.PI / 2;
  scene.add(r);
  rings.push(r);
}
// six warning slips on the radio desk (pop in one after another)
const slips = [];
for (let i = 0; i < 6; i++) {
  const s = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.003, 0.2), real.fabric(0xffe7b8));
  s.position.set(
    RAD[0] - 0.12 + (i % 3) * 0.13,
    RAD[1] + 0.449 + Math.floor(i / 3) * 0.004,
    RAD[2] - 0.55 + Math.floor(i / 3) * 0.17,
  );
  s.rotation.y = (i - 2.5) * 0.08;
  scene.add(s);
  slips.push(s);
}
// the Californian stopped in an ice field; her radio cabin's light
const cal = NIGHT.californian;
for (let i = 0; i < 7; i++) {
  const b = makeIceberg({ seed: 40 + i, size: 0.4 + (i % 3) * 0.3, len: 1 + (i % 2) });
  const a = i * 0.9;
  b.position.set(CAL[0] + Math.cos(a) * (5 + i), 0, CAL[2] + Math.sin(a) * (4 + i * 0.8));
  ground.add(b);
}
const radioWin = new THREE.Mesh(
  new THREE.BoxGeometry(0.12, 0.08, 0.02),
  new THREE.MeshBasicMaterial({ color: 0xffd79a, toneMapped: false }),
);
radioWin.position.set(0.5, 0.68, 0.26);
cal.add(radioWin);
void LIGHT;

const applyCamera = shotCamera(shots);
function renderAt(t) {
  wake.userData.update(t, t >= T.titanic2 ? 1.4 : 1);
  smoke.userData.update(t, 1);
  // incoming waves
  const wk = pop(t, T.funk - 0.6, T.vor);
  ringMat.opacity = 0.7 * wk;
  rings.forEach((r, i) => {
    const u = (t * 0.35 + i / 4) % 1;
    const rr = 14 * (1 - u) + 0.4;
    r.scale.setScalar(rr);
    r.position.set(-0.2, 5.0, 0);
    r.visible = wk > 0;
  });
  slips.forEach((s, i) => {
    const at = T.sechs + i * 0.12;
    s.visible = t >= at;
    s.scale.copy(squash(t, at, 0.5));
  });
  // the spark gap works the passengers' telegrams
  const sending = (t >= T.ihr && t < T.am2) || (t >= T.ruhe && t < T.um);
  const on = sending && Math.sin(t * 23) > 0.2 && Math.sin(t * 3.1) > -0.4;
  RADIO_ROOM.sparkMat.opacity = on ? 1 : 0;
  RADIO_ROOM.sparkLight.intensity = on ? 3 : 0;
  RADIO_ROOM.keyArm.rotation.z = on ? -0.08 : 0;
  RADIO_ROOM.setClock(23.48 + smooth(ramp(t, T.um, T.funker3)) * 0.02);
  radioWin.visible = t < T.ab + 0.15;
  RADIO_ROOM.ops.forEach((o) => (o.visible = t >= T.dort && t < T.ihr));
  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
