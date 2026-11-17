// Chapter 1 "Das größte Schiff der Welt" (Belfast yard): hull under the
// gantry → the finished ship afloat beside 3 football pitches → the dummy
// funnel → buoyancy arrows → bowl in the sink → x-ray with 15 bulkheads →
// one room floods, she floats on → the lifeboats → 2,224 people, half a seat.
import {
  THREE,
  V,
  scene,
  ground,
  real,
  roundedBox,
  setXray,
  makeArrowSet,
  animateArrows,
  coldMat,
  forceMat,
  pop,
  ramp,
  smooth,
  squash,
  labels,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { YARD } from "./set.js";
import { makeTitanic, setWater, shipLights, makePerson } from "./welt.js";
import { T, SHIP, SINK, shots, LABELS } from "./beats.js";

// the hull on the slipway (plating done, nothing on top yet) + scaffolding
const build = makeTitanic({ hullOnly: true });
ground.add(build.group);
{
  const pole = new THREE.CylinderGeometry(0.018, 0.018, 2.6, 6);
  const mat = real.wood(0x8a6a48);
  const im = new THREE.InstancedMesh(pole, mat, 120);
  build.group.add(im);
  const d = new THREE.Object3D();
  let i = 0;
  for (let x = -12.5; x <= 12.5 && i < 120; x += 0.45)
    for (const s of [1, -1]) {
      d.position.set(x, 0.0, s * 1.7);
      d.updateMatrix();
      im.setMatrixAt(i++, d.matrix);
    }
  im.count = i;
}
// the finished ship afloat, solid and x-ray versions at the same spot
const done = makeTitanic();
done.group.position.set(...SHIP);
ground.add(done.group);
const xr = makeTitanic({ xray: true });
xr.group.position.set(...SHIP);
ground.add(xr.group);
// three football pitches (105 m each) beside her
const pitches = [];
for (let i = 0; i < 3; i++) {
  const g = new THREE.Group();
  const grass = new THREE.Mesh(
    roundedBox(10.5, 0.05, 6.8, 0.04),
    real.plastic(0x3f8f3a, { roughness: 0.9 }),
  );
  g.add(grass);
  const line = real.plastic(0xf4f4f0, { roughness: 0.6 });
  for (const [w, d, x, z] of [
    [10.3, 0.06, 0, 3.3],
    [10.3, 0.06, 0, -3.3],
    [0.06, 6.6, 5.12, 0],
    [0.06, 6.6, -5.12, 0],
    [0.06, 6.6, 0, 0],
  ]) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(w, 0.02, d), line);
    l.position.set(x, 0.035, z);
    g.add(l);
  }
  const c = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.03, 6, 40), line);
  c.rotation.x = Math.PI / 2;
  c.position.y = 0.035;
  g.add(c);
  g.position.set(SHIP[0] - 10.6 + i * 10.6, SHIP[1] + 0.03, SHIP[2] + 5.3);
  ground.add(g);
  pitches.push(g);
}
// buoyancy: water pushed aside (blue), pushing back up (yellow) — in the ship's frame
const aside = makeArrowSet(
  [
    [V(0, -0.5, 1.6), V(0, -0.5, 3.2)],
    [V(0, -0.5, -1.6), V(0, -0.5, -3.2)],
    [V(0, -0.95, 1.2), V(0, -1.4, 2.8)],
    [V(0, -0.95, -1.2), V(0, -1.4, -2.8)],
  ],
  { parent: done.group, mat: coldMat, amp: 0.07, r: 0.08 },
);
const up = makeArrowSet(
  [
    [V(0, -2.6, 0), V(0, -1.2, 0)],
    [V(0, -2.5, 0.8), V(0, -1.15, 0.8)],
    [V(0, -2.5, -0.8), V(0, -1.15, -0.8)],
  ],
  { parent: done.group, mat: forceMat, amp: 0, r: 0.09 },
);
// the bowl in the sink
const sink = new THREE.Group();
sink.position.set(...SINK);
scene.add(sink);
const steel = real.metal(0xc4c9cf, { roughness: 0.28 });
{
  const base = new THREE.Mesh(roundedBox(1.6, 0.06, 1.2, 0.02), steel);
  base.position.y = -0.32;
  sink.add(base);
  for (const [w, d, x, z] of [
    [1.6, 0.06, 0, 0.6],
    [1.6, 0.06, 0, -0.6],
    [0.06, 1.2, 0.8, 0],
    [0.06, 1.2, -0.8, 0],
  ]) {
    const wall = new THREE.Mesh(roundedBox(w, 0.42, d, 0.02), steel);
    wall.position.set(x, -0.1, z);
    sink.add(wall);
  }
  const counter = real.ceramic(0xe9e4da);
  for (const [w, d, x, z] of [
    [2.6, 0.4, 0, 0.8],
    [2.6, 0.4, 0, -0.8],
    [0.5, 1.2, 1.05, 0],
    [0.5, 1.2, -1.05, 0],
  ]) {
    const c = new THREE.Mesh(roundedBox(w, 0.06, d, 0.02), counter);
    c.position.set(x, 0.13, z);
    sink.add(c);
  }
  const tap = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.035, 12, 32, Math.PI), steel);
  tap.position.set(-0.55, 0.38, -0.62);
  tap.rotation.y = Math.PI / 2;
  sink.add(tap);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.26, 16), steel);
  stem.position.set(-0.55, 0.26, -0.84);
  sink.add(stem);
}
const sinkWater = new THREE.Mesh(
  new THREE.BoxGeometry(1.54, 0.2, 1.14),
  new THREE.MeshPhysicalMaterial({
    color: 0x8fc9e6,
    roughness: 0.05,
    transparent: true,
    opacity: 0.45,
  }),
);
sinkWater.position.y = -0.18;
sink.add(sinkWater);
const bowl = new THREE.Group();
{
  const pts = [];
  for (let i = 0; i <= 24; i++) {
    const a = (i / 24) * (Math.PI / 2);
    pts.push(new THREE.Vector2(Math.sin(a) * 0.32 + 0.0001, -Math.cos(a) * 0.17));
  }
  const geo = new THREE.LatheGeometry(pts, 64);
  const m = new THREE.Mesh(geo, real.ceramic(0xf4f1ea, { side: THREE.DoubleSide }));
  bowl.add(m);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.012, 10, 64), real.ceramic(0x2f6fb5));
  rim.rotation.x = Math.PI / 2;
  bowl.add(rim);
}
sink.add(bowl);
const inBowl = new THREE.Mesh(
  new THREE.CylinderGeometry(0.29, 0.2, 0.1, 40),
  new THREE.MeshPhysicalMaterial({
    color: 0x8fc9e6,
    roughness: 0.05,
    transparent: true,
    opacity: 0.55,
  }),
);
bowl.add(inBowl);
const stream = new THREE.Mesh(
  new THREE.CylinderGeometry(0.025, 0.03, 1, 12),
  new THREE.MeshPhysicalMaterial({
    color: 0xbfe3f2,
    roughness: 0.05,
    transparent: true,
    opacity: 0.6,
  }),
);
sink.add(stream);
const sinkLight = new THREE.PointLight(0xfff2dd, 2.5, 6, 1.4);
sinkLight.position.set(0.6, 1.4, 0.8);
sink.add(sinkLight);
// 2,224 people on the slipway; the 1,178 who have a seat light up
const crowdGeo = new THREE.CapsuleGeometry(0.022, 0.05, 3, 8);
const seatMat = real.plastic(0x8a90a0, { roughness: 0.6, emissive: 0x000000 });
const noSeatMat = real.plastic(0x8a90a0, { roughness: 0.6 });
const seat = new THREE.InstancedMesh(crowdGeo, seatMat, 1178);
const noSeat = new THREE.InstancedMesh(crowdGeo, noSeatMat, 2224 - 1178);
{
  const d = new THREE.Object3D();
  let a = 0;
  let b = 0;
  for (let i = 0; i < 2224; i++) {
    const cx = i % 76;
    const cz = Math.floor(i / 76);
    d.position.set(-4.2 + cx * 0.112, -1.02, -1.6 + cz * 0.112);
    d.updateMatrix();
    if (cx < 40) seat.setMatrixAt(a++, d.matrix);
    else noSeat.setMatrixAt(b++, d.matrix);
  }
  ground.add(seat, noSeat);
}
const boatsRow = [];
for (let i = 0; i < 20; i++) {
  const b = makePerson({ coat: 0x000000 });
  b.visible = false;
  boatsRow.push(b);
}
void boatsRow;

const applyCamera = shotCamera(shots);
function renderAt(t) {
  const built = t >= T.am;
  build.group.visible = !built;
  seat.visible = noSeat.visible = t >= T.boote - 0.3;
  // finished ship: solid, except the x-ray stretch
  const xk = smooth(ramp(t, T.damit, T.damit + 0.8)) * (1 - smooth(ramp(t, T.fach - 0.6, T.fach)));
  done.group.visible = built && xk < 0.98;
  xr.group.visible = built && xk > 0.02;
  setXray(xr.mats, xk);
  shipLights(0.35);
  // bulkheads pop in one after another, then one room floods
  xr.inside.bulkheads.forEach((b, i) => {
    const at = T.quer + i * 0.11;
    b.visible = t >= at;
    b.scale.copy(squash(t, at, 0.5));
  });
  for (let i = 0; i < xr.inside.water.length; i++) setWater(xr, i, 0);
  setWater(xr, 7, smooth(ramp(t, T.laeuft + 0.2, T.rest)) * 0.85);
  // three pitches pop in
  pitches.forEach((p, i) => {
    const at = T.drei + 0.3 + i * 0.15;
    p.visible = t >= at && t < T.vier;
    p.scale.copy(squash(t, at, 0.6));
  });
  // the dummy funnel glows a little while it is named
  const fk = pop(t, T.attrappe - 0.4, T.dass - 0.2);
  for (const half of [done.bow, done.stern])
    for (const o of half.children)
      if (o.userData.index === 3)
        o.children[0].material.emissive?.setHex(fk > 0 ? 0x553300 : 0x000000);
  // see-through harbour while the forces under the waterline are shown
  const wk = pop(t, T.ein - 0.3, T.kennst - 0.3);
  YARD.harbour.material.transparent = true;
  YARD.harbour.material.opacity = 1 - 0.45 * wk;
  YARD.harbour.material.depthWrite = wk < 0.01;
  animateArrows(aside, t, pop(t, T.seite - 0.3, T.kennst - 0.3));
  animateArrows(up, t, pop(t, T.zurueck - 0.3, T.kennst - 0.3));
  // bowl: floats, water pours in, it sinks
  const fill = smooth(ramp(t, T.hinein, T.geht + 0.2));
  const sinkK = smooth(ramp(t, T.geht, T.geht + 1.4));
  bowl.position.set(0.05, -0.08 + Math.sin(t * 1.4) * 0.006 - fill * 0.05 - sinkK * 0.14, 0.05);
  bowl.rotation.z = sinkK * 0.35;
  inBowl.visible = fill > 0.01;
  inBowl.scale.set(1, Math.max(0.01, fill * 1.4), 1);
  inBowl.position.y = -0.12 + fill * 0.05;
  stream.visible = t >= T.hinein - 0.2 && t < T.damit - 0.5;
  stream.scale.y = 0.55;
  stream.position.set(-0.55 + 0.2, 0.18, -0.62 + 0.0);
  // the seats: half the crowd lights up warm
  const hk = smooth(ramp(t, T.haelfte - 0.2, T.haelfte + 0.5));
  seatMat.color.setRGB(0.54 + hk * 0.46, 0.56 + hk * 0.24, 0.63 - hk * 0.4);
  seatMat.emissive.setRGB(hk * 0.35, hk * 0.18, 0);
  noSeatMat.color.setRGB(0.54 - hk * 0.2, 0.56 - hk * 0.18, 0.63 - hk * 0.1);
  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
