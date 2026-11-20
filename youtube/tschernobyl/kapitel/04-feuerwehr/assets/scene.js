// Chapter 4: control room in dust; fires on the turbine hall roof; fire
// engines arrive; firefighters on the roofs; a dosimeter pinned at its stop.
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
import { PLANT, CR } from "./set.js";
import { makeFireTruck, makePerson, walk } from "./welt.js";
import { T, shots, LABELS, HIGHLIGHTS, TRUCK_T } from "./beats.js";

highlights(HIGHLIGHTS);
const applyCamera = shotCamera(shots);
// fire engines along the east road, then parked by block 4
const trucks = [0, 1, 2, 3].map(() => {
  const tr = makeFireTruck();
  tr.rotation.y = Math.PI;
  ground.add(tr);
  return tr;
});
// firefighters: Pravik by the trucks, others on the turbine hall roof
const pravik = makePerson({ coat: 0x2d3440, legs: 0x22262c, helmet: 0x9a8a5a });
pravik.position.set(11.4, 0, 1.2);
pravik.rotation.y = 2.4;
ground.add(pravik);
const roofMen = [];
for (let i = 0; i < 7; i++) {
  const p = makePerson({ coat: 0x2d3440, legs: 0x22262c, helmet: 0x9a8a5a });
  p.position.set(-2 + i * 1.3, 3.2, -7.2 - (i % 2) * 0.8);
  p.rotation.y = -1.2 + (i % 3) * 0.4;
  ground.add(p);
  roofMen.push(p);
}
// hoses from the trucks up to the roof
const hoseMat = real.rubber(0x6a5a3a);
for (let i = 0; i < 3; i++) {
  const pts = [
    new THREE.Vector3(12 + i * 0.6, 0.2, 2),
    new THREE.Vector3(9, 0.1, -2),
    new THREE.Vector3(7.8, 1.6, -4.5),
    new THREE.Vector3(5 - i * 2, 3.25, -7.5),
  ];
  const h = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.02, 6),
    hoseMat,
  );
  h.visible = false;
  ground.add(h);
  roofMen.push(h);
}
// the dosimeter: a small box with a dial, standing on the truck step
const dosi = new THREE.Group();
const box = new THREE.Mesh(
  roundedBox(0.16, 0.1, 0.06, 0.012),
  real.plastic(0x6a7a5a, { roughness: 0.5 }),
);
dosi.add(box);
const face = new THREE.Mesh(
  new THREE.CircleGeometry(0.035, 32),
  real.plastic(0xf2efe2, { roughness: 0.4 }),
);
face.position.set(-0.03, 0.005, 0.031);
dosi.add(face);
const needle = new THREE.Group();
const nm = new THREE.Mesh(new THREE.BoxGeometry(0.002, 0.03, 0.001), real.plastic(0xc02a1a));
nm.position.y = 0.015;
needle.add(nm);
needle.position.set(-0.03, -0.012, 0.033);
dosi.add(needle);
dosi.position.set(11.4, 0.36, 1.6);
dosi.rotation.y = 0.5;
ground.add(dosi);

function renderAt(t) {
  PLANT.setState("explodiert");
  // fires on the roofs die down towards five in the morning
  const fireK = 1 - smooth(ramp(t, T.gegen, T.schacht));
  PLANT.setRuin(t, true, 0.6 + 0.4 * fireK);
  PLANT.ruinParts.fires.forEach((f) => f.userData.update(t, fireK));
  // trucks: drive in from the east, then park
  trucks.forEach((tr, i) => {
    const u = smooth(ramp(t, TRUCK_T + i * 0.6, TRUCK_T + 4 + i * 0.6));
    tr.position.set(40 - u * (27 - i * 0.2), 0, -1.6 + (u > 0.95 ? i * 1.1 : 0) * u);
    tr.userData.update(t, 1);
    tr.visible = t > TRUCK_T - 1;
  });
  const onRoof = t > T.in - 0.3;
  roofMen.forEach((m) => (m.visible = onRoof));
  roofMen.forEach((m, i) => m.isGroup && walk(m, t * 1.3 + i, 0.4));
  // control room
  CR.setDust(t, 1 - ramp(t, 6, 11));
  CR.setAlarm(1, t);
  CR.setPower(0);
  CR.setRods(1, 1, t);
  CR.setClock(1, 24, (t * 3) % 60);
  // dosimeter: needle slams to the stop and trembles
  needle.rotation.z = 1.1 - 2.2 * smooth(ramp(t, T.messg, T.messg + 0.8)) + Math.sin(t * 40) * 0.01;
  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
