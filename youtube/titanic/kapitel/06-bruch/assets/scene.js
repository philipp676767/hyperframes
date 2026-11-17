// Chapter 6 "Das Schiff bricht": the trim grows, the stern lifts its
// propellers out of the sea, a ruler bends over a table edge, the load on the
// middle glows, the lights die, the hull tears, the stern stands up and goes.
import {
  THREE,
  V,
  scene,
  ground,
  real,
  roundedBox,
  makeArrowSet,
  animateArrows,
  forceMat,
  pop,
  ramp,
  smooth,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import "./set.js";
import {
  makeTitanic,
  makeSmoke,
  makeLifeboat,
  makePerson,
  shipLights,
  BREAK_X,
  LIGHT,
} from "./welt.js";
import { T, TABLE, shots, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);
const ship = makeTitanic();
ground.add(ship.group);
const smoke = makeSmoke(ship);
// a red band where the stress gathers (between funnels 3 and 4)
const stress = new THREE.Mesh(
  new THREE.CylinderGeometry(1.5, 1.5, 0.35, 32, 1, true),
  new THREE.MeshBasicMaterial({
    color: 0xff4b2b,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    toneMapped: false,
    depthWrite: false,
  }),
);
stress.rotation.z = Math.PI / 2;
stress.scale.set(1, 1, 0.9);
stress.position.set(BREAK_X, 0.4, 0);
ship.stern.add(stress);
const weight = makeArrowSet(
  [
    [V(-9, 3.4, 0), V(-9, 1.6, 0)],
    [V(-6, 3.4, 0), V(-6, 1.8, 0)],
  ],
  { parent: ship.stern, mat: forceMat, amp: 0, r: 0.12 },
);
// lifeboats on the water + the one that comes back
const boats = [];
for (let i = 0; i < 6; i++) {
  const b = makeLifeboat({ cover: false });
  b.position.set(6 + i * 3.2, 0.03, 9 + (i % 2) * 3);
  b.rotation.y = i * 0.7;
  ground.add(b);
  boats.push(b);
}
const lantern = new THREE.PointLight(0xffc77a, 0.8, 4, 1.5);
lantern.position.set(0, 0.25, 0);
boats[1].add(lantern);
for (let i = 0; i < 5; i++) {
  const p = makePerson({ coat: 0x1a1f2b, cap: false, scale: 0.7 });
  p.position.set(-0.25 + i * 0.12, 0.02, 0);
  boats[1].add(p);
}
// the ruler over a table edge
const table = new THREE.Group();
table.position.set(...TABLE);
scene.add(table);
{
  const top = new THREE.Mesh(roundedBox(1.4, 0.08, 1.0, 0.02), real.wood(0x8a5a32));
  top.position.set(-0.7, -0.04, 0);
  table.add(top);
  const light = new THREE.PointLight(0xfff0dc, 4, 6, 1.4);
  light.position.set(0.6, 1.2, 0.8);
  table.add(light);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), real.plastic(0x1c1a18));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.9;
  table.add(floor);
}
const rulerMat = real.plastic(0xf1d36a, { roughness: 0.4 });
const inner = new THREE.Mesh(roundedBox(0.6, 0.012, 0.06, 0.004), rulerMat);
const hinge = new THREE.Group();
const outer = new THREE.Mesh(roundedBox(0.6, 0.012, 0.06, 0.004), rulerMat);
outer.position.x = 0.3;
hinge.add(outer);
table.add(inner, hinge);
const P = V(BREAK_X, 0, 0);
const tmp = V(0, 0, 0);
// place a half rotated by angle a (bow down = positive a) about the moving pivot q
function pose(obj, a, q) {
  obj.rotation.set(0, 0, -a);
  tmp.copy(P).applyAxisAngle(V(0, 0, 1), -a);
  obj.position.set(q.x - tmp.x, q.y - tmp.y, 0);
}

const applyCamera = shotCamera(shots);
function renderAt(t) {
  smoke.userData.update(t, 0.2 * (1 - ramp(t, T.um, T.krachen)));
  // before the break: one trim for both halves
  const a0 = 0.12 + 0.2 * smooth(ramp(t, 0, T.krachen));
  const broken = t >= T.krachen + 0.2;
  if (!broken) {
    pose(ship.bow, a0, V(BREAK_X, -0.15 - 0.5 * ramp(t, 0, T.krachen), 0));
    pose(ship.stern, a0, V(BREAK_X, -0.15 - 0.5 * ramp(t, 0, T.krachen), 0));
  } else {
    const k = ramp(t, T.krachen + 0.2, T.bug + 2);
    pose(ship.bow, a0 + 0.5 * smooth(k), V(BREAK_X + 2 * k, -0.65 - 14 * k * k, 0));
    // the stern falls back a little, then stands up and goes straight down
    const up = smooth(ramp(t, T.bug, T.senkrecht + 1));
    const down = ramp(t, T.senkrecht + 1, T.verschwindet + 0.5);
    const as = a0 - 0.18 * smooth(ramp(t, T.krachen + 0.2, T.bug)) + (1.45 - a0 + 0.18) * up;
    pose(ship.stern, as, V(BREAK_X, -0.6 - 4.5 * up - 14 * down * down, 0));
  }
  ship.bow.visible = !broken || t < T.bug + 3;
  ship.stern.visible = t < T.verschwindet + 0.6;
  // the lights: on, flicker, out
  const fl = t >= T.um && t < T.aus + 0.3 ? (Math.sin(t * 37) > 0.2 ? 1 : 0.2) : 1;
  shipLights(t < T.aus + 0.3 ? fl : 0);
  // stress + weight
  stress.material.opacity = 0.6 * pop(t, T.last - 0.3, T.krachen + 0.4);
  animateArrows(weight, t, pop(t, T.bei, T.um));
  // the ruler slides out, bends, gives
  const out = 0.05 + 0.5 * smooth(ramp(t, T.lineal, T.je + 1.5));
  inner.position.set(-0.3, 0.006, 0);
  hinge.position.set(0, 0.006, 0);
  outer.scale.x = out / 0.6;
  outer.position.x = out / 2;
  const bend =
    Math.pow(out, 2) * 0.9 +
    (t >= T.nachgibt ? 1.2 * smooth(ramp(t, T.nachgibt, T.nachgibt + 0.3)) : 0);
  hinge.rotation.z = -bend;
  // the boats: the last one rows back towards the spot
  boats[1].position.x = 9.2 - 4 * smooth(ramp(t, T.nur, T.end));
  void LIGHT;
  applyCamera(t);
  renderFrame();
}
start(renderAt);
