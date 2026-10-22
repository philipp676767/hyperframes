// "So funktioniert der fliegende Tesla". World, captions, camera, panel,
// arrows and labels live in world.js; this file only builds the car story.
import {
  THREE,
  ramp,
  lerp,
  smooth,
  inBack,
  pop,
  V,
  scene,
  flat,
  M,
  xrayMaterial,
  xrayEdges,
  setXray,
  addFloor,
  makeArrowSet,
  animateArrows,
  forceMat,
  showNope,
  showPanel,
  LED,
  labels,
  squash,
  puff,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { createWorld } from "./environments.js";
import { T, shots, LABELS, MS, RT, H1, H2, HOOK_LAND, BACK } from "./beats.js";

createWorld({ env: "stadt", sky: "mittag" });
addFloor(3.8);

Object.assign(M, {
  carbon: flat(0x2e3138, { roughness: 0.5, emissive: 0x4fc3ff, emissiveIntensity: 0 }),
  valve: flat(0xffd23f, { emissive: 0xffd23f, emissiveIntensity: 0 }),
  pipe: flat(0xb9c2cc, { roughness: 0.3, emissive: 0x9fe3ff, emissiveIntensity: 0 }),
  nozzle: new THREE.MeshStandardMaterial({ color: 0x9aa3ad, metalness: 0.7, roughness: 0.3 }),
  blade: flat(0xff8a1f, { emissive: 0xff6a00, emissiveIntensity: 0.25 }),
  air: new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  }),
  airLine: new THREE.MeshBasicMaterial({ color: 0xeaf6ff }),
  balloon: flat(0xff4b6b, { roughness: 0.35 }),
  pump: flat(0x2fa35a),
  flame: flat(0xff8a1f, { emissive: 0xff6a00, emissiveIntensity: 1.2 }),
  flameCore: flat(0xffe14a, { emissive: 0xffd000, emissiveIntensity: 1.2 }),
});

// ---------------------------------------------------------------- car builder
// Low-poly roadster facing +x: wedge body (side profile extruded), dark glass
// canopy, four wheels. Origin on the ground under the car's centre.
const bodyShape = new THREE.Shape();
[
  [-1.6, 0.22],
  [1.55, 0.22],
  [1.68, 0.38],
  [1.5, 0.52],
  [0.5, 0.68],
  [-1.1, 0.72],
  [-1.6, 0.66],
  [-1.66, 0.4],
].forEach(([x, y], i) => (i ? bodyShape.lineTo(x, y) : bodyShape.moveTo(x, y)));
const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
  depth: 1.26,
  bevelEnabled: true,
  bevelSize: 0.06,
  bevelThickness: 0.06,
  bevelSegments: 1,
});
bodyGeo.translate(0, 0, -0.63);
const canopyShape = new THREE.Shape();
[
  [-0.95, 0.68],
  [0.45, 0.68],
  [-0.05, 1.0],
  [-0.7, 1.0],
].forEach(([x, y], i) => (i ? canopyShape.lineTo(x, y) : canopyShape.moveTo(x, y)));
const canopyGeo = new THREE.ExtrudeGeometry(canopyShape, {
  depth: 0.96,
  bevelEnabled: true,
  bevelSize: 0.04,
  bevelThickness: 0.04,
  bevelSegments: 1,
});
canopyGeo.translate(0, 0, -0.48);
const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.24, 14);
wheelGeo.rotateX(Math.PI / 2);
const hubGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.26, 6);
hubGeo.rotateX(Math.PI / 2);

function makeCar({ shell, glass, edges = false }) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(bodyGeo, shell);
  body.castShadow = true;
  g.add(body);
  if (edges) g.add(xrayEdges(bodyGeo));
  g.add(new THREE.Mesh(canopyGeo, glass));
  const wheels = [];
  for (const x of [-1.0, 1.0])
    for (const z of [-0.66, 0.66]) {
      const w = new THREE.Group();
      w.position.set(x, 0.3, z);
      const tyre = new THREE.Mesh(wheelGeo, M.rubber);
      tyre.castShadow = true;
      w.add(tyre);
      w.add(new THREE.Mesh(hubGeo, M.alu));
      g.add(w);
      wheels.push(w);
    }
  return { g, wheels };
}

// fan: ring + hub + 5 pitched blades, spins around y
function makeFan(r) {
  const f = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.03, 6, 24), M.alu);
  ring.rotation.x = Math.PI / 2;
  f.add(ring);
  f.add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 10), M.steel));
  for (let i = 0; i < 5; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(r * 0.9, 0.012, 0.13), M.blade);
    b.position.set(
      Math.cos((i / 5) * Math.PI * 2) * r * 0.5,
      0,
      Math.sin((i / 5) * Math.PI * 2) * r * 0.5,
    );
    b.rotation.y = -(i / 5) * Math.PI * 2;
    b.rotation.x = 0.35;
    f.add(b);
  }
  return f;
}

// air jet: a soft white cone, apex at the nozzle, pointing down (-y)
const jetGeo = new THREE.ConeGeometry(0.13, 1, 10, 1, true);
jetGeo.translate(0, -0.5, 0); // apex at the nozzle (y 0), wide end at y -1
function makeJet(parent, x, y, z, rotZ = 0) {
  const j = new THREE.Group();
  j.position.set(x, y, z);
  j.rotation.z = rotZ;
  const cone = new THREE.Mesh(jetGeo, M.air);
  j.add(cone);
  parent.add(j);
  j.visible = false;
  return j;
}
function setJet(j, k, len, t, seed) {
  j.visible = k > 0.01;
  if (!j.visible) return;
  const flick = 1 + 0.12 * Math.sin(t * 47 + seed * 3.1) + 0.08 * Math.sin(t * 83 + seed);
  j.scale.set(k * (0.9 + 0.1 * flick), Math.max(0.001, k * len * flick), k * (0.9 + 0.1 * flick));
}

// ---------------------------------------------------------------- the roadster
const shellMat = xrayMaterial(0xd8232a, { roughness: 0.35 });
const glassMat = xrayMaterial(0x1f2a36, { roughness: 0.15 });
const tesla = makeCar({ shell: shellMat, glass: glassMat, edges: true });
const car = tesla.g;
scene.add(car);

// carbon-fibre pressure tanks: two rows of three, lying along x
const tanks = [];
{
  const geo = new THREE.CapsuleGeometry(0.15, 0.55, 4, 12);
  geo.rotateZ(Math.PI / 2);
  for (const x of [0.85, -0.95])
    for (const z of [-0.36, 0, 0.36]) {
      const m = new THREE.Mesh(geo, M.carbon);
      m.position.set(x, 0.45, z);
      car.add(m);
      tanks.push(m);
    }
}
// valve block in the middle
const valve = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.18, 0.26), M.valve);
valve.position.set(0, 0.42, 0);
car.add(valve);

// nozzles: six under the floor, four at the back
const under = [];
for (const x of [-1.0, 0, 1.0]) for (const z of [-0.45, 0.45]) under.push([x, 0.17, z]);
const rear = [];
for (const y of [0.36, 0.58]) for (const z of [-0.35, 0.35]) rear.push([-1.72, y, z]);
const nozzleGeo = new THREE.CylinderGeometry(0.045, 0.085, 0.12, 10);
const jetsUnder = under.map(([x, y, z]) => {
  const n = new THREE.Mesh(nozzleGeo, M.nozzle);
  n.position.set(x, y + 0.02, z);
  car.add(n);
  return makeJet(car, x, y - 0.04, z, 0);
});
const jetsRear = rear.map(([x, y, z]) => {
  const n = new THREE.Mesh(nozzleGeo, M.nozzle);
  n.position.set(x + 0.02, y, z);
  n.rotation.z = -Math.PI / 2;
  car.add(n);
  return makeJet(car, x - 0.04, y, z, -Math.PI / 2);
});

// pipes from the tanks through the valve to every nozzle (grow in)
const pipes = [];
{
  const vp = V(0, 0.4, 0);
  const ends = [
    ...under.map(([x, y, z]) => [V(x * 0.6, 0.3, z * 0.6), V(x, y + 0.05, z)]),
    ...rear.map(([x, y, z]) => [V(-1.4, y, z * 0.7), V(x + 0.05, y, z)]),
    [V(0.5, 0.45, 0), V(0.6, 0.45, 0)],
    [V(-0.5, 0.45, 0), V(-0.6, 0.45, 0)],
  ];
  for (const [mid, end] of ends) {
    const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([vp, mid, end]), 14, 0.022, 5);
    const m = new THREE.Mesh(geo, M.pipe);
    car.add(m);
    pipes.push(m);
  }
}

// suction fans under the floor
const fans = [-0.33, 0.33].map((z) => {
  const f = makeFan(0.28);
  f.position.set(0, 0.17, z);
  car.add(f);
  return f;
});

// arrows: air out of the fans, downforce on the roof, speed lines
const suckAir = makeArrowSet(
  [
    [V(1.5, 0.1, 0.78), V(-2.4, 0.32, 0.78)],
    [V(1.5, 0.1, -0.78), V(-2.4, 0.32, -0.78)],
  ],
  { parent: car, mat: M.air, r: 0.03, amp: 0.05 },
);
const downforce = makeArrowSet(
  [
    [V(0.7, 2.4, 0), V(0.7, 1.15, 0)],
    [V(-0.6, 2.4, 0), V(-0.6, 1.15, 0)],
  ],
  { parent: car, mat: forceMat, r: 0.045, amp: 0 },
);
const speed = makeArrowSet(
  [
    [V(-1.9, 0.4, 0.55), V(-4.0, 0.4, 0.55)],
    [V(-1.9, 0.85, -0.3), V(-4.4, 0.85, -0.3)],
    [V(-1.9, 0.25, -0.65), V(-3.6, 0.25, -0.65)],
  ],
  { parent: car, mat: M.airLine, r: 0.02, amp: 0 },
);

// ---------------------------------------------------------------- hook: parked cars to jump
const parked = new THREE.Group();
scene.add(parked);
[
  [-0.55, 0x3c7be2],
  [0.55, 0xf4f4f6],
].forEach(([x, c]) => {
  const p = makeCar({ shell: flat(c, { roughness: 0.4 }), glass: flat(0x1f2a36) });
  p.g.position.x = x;
  p.g.rotation.y = Math.PI / 2;
  p.g.scale.setScalar(0.8);
  parked.add(p.g);
});

// ---------------------------------------------------------------- set: upside down under a ceiling
const ceilSet = new THREE.Group();
ceilSet.position.set(...MS);
scene.add(ceilSet);
const CEIL = 1.75;
for (const x of [-1.25, 1.25]) {
  const p = new THREE.Mesh(new THREE.BoxGeometry(0.22, CEIL, 0.9), M.concrete);
  p.position.set(x, CEIL / 2, 0);
  p.castShadow = true;
  ceilSet.add(p);
}
{
  const slab = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.16, 1.1), M.concrete);
  slab.position.y = CEIL + 0.08;
  slab.castShadow = true;
  ceilSet.add(slab);
}
const mini = makeCar({ shell: flat(0xd8232a, { roughness: 0.35 }), glass: flat(0x1f2a36) });
mini.g.scale.setScalar(0.55);
mini.g.rotation.x = Math.PI; // wheels up against the ceiling
mini.g.position.y = CEIL;
ceilSet.add(mini.g);
const miniFans = [-0.55, 0.55].map((x) => {
  const f = makeFan(0.3);
  f.position.set(x, 0.17, 0);
  mini.g.add(f);
  return f;
});
const ceilForce = makeArrowSet(
  [
    [V(-0.35, 0.55, 0.5), V(-0.35, 1.2, 0.5)],
    [V(0.35, 0.55, 0.5), V(0.35, 1.2, 0.5)],
  ],
  { parent: ceilSet, mat: forceMat, r: 0.035, amp: 0 },
);

// ---------------------------------------------------------------- set: balloon
const balloonSet = new THREE.Group();
balloonSet.position.set(...RT);
scene.add(balloonSet);
const balloon = new THREE.Group();
balloonSet.add(balloon);
{
  const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 2), M.balloon);
  b.scale.set(1, 1.2, 1);
  b.castShadow = true;
  balloon.add(b);
  const knot = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.1, 8), M.balloon);
  knot.position.y = -0.42;
  balloon.add(knot);
}
const balloonJet = makeJet(balloon, 0, -0.46, 0, 0);

// ---------------------------------------------------------------- set: fuel pump + flame
const pumpSet = new THREE.Group();
pumpSet.position.set(...RT);
scene.add(pumpSet);
{
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.15, 0.38), M.pump);
  body.position.set(0.35, 0.575, -0.1);
  body.castShadow = true;
  pumpSet.add(body);
  const screen = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.26, 0.02), flat(0xf4f4f6));
  screen.position.set(0.35, 0.85, 0.1);
  pumpSet.add(screen);
  const hose = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 6, 16, Math.PI), flat(0x1c1d22));
  hose.rotation.z = -Math.PI / 2;
  hose.position.set(0.62, 0.55, -0.1);
  pumpSet.add(hose);
}
const flame = new THREE.Group();
flame.position.set(-0.55, 0, 0.1);
pumpSet.add(flame);
const flameOuter = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.75, 8), M.flame);
flameOuter.position.y = 0.38;
flame.add(flameOuter);
const flameInner = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.45, 8), M.flameCore);
flameInner.position.set(0, 0.25, 0.06);
flame.add(flameInner);

// ---------------------------------------------------------------- hook path
// the car drives in, lifts off at -0.6 s on its jets, rolls once over the
// parked cars and lands at HOOK_LAND (pure function of t, also for t < 0)
function hookPose(t) {
  const t0 = -0.6;
  if (t < t0) return { x: -4 + 2.5 * (t - t0), y: 0, s: 0, air: 0 };
  if (t > HOOK_LAND) return { x: 4 + 2.0 * (t - HOOK_LAND), y: 0, s: 1, air: 0 };
  const s = (t - t0) / (HOOK_LAND - t0);
  return { x: -4 + 8 * s, y: 2.6 * 4 * s * (1 - s), s, air: 1 };
}

// the hook shots ride along with the car
const FOLLOW = V(0, 0, 0);
for (const s of shots) if (s.follow) s.rel = FOLLOW;
const applyCamera = shotCamera(shots);

// ---------------------------------------------------------------- render
function renderAt(t) {
  const hook = t < T.lass + 0.35;

  // ---- car pose
  let x = 0;
  let y = 0;
  let roll = 0;
  let pitch = 0;
  let wheelSpin = 0;
  let underK = 0;
  let underLen = 1.1;
  let rearK = 0;
  if (hook) {
    const h = hookPose(t);
    x = h.x;
    y = h.y;
    roll = Math.PI * 2 * smooth(ramp(h.s, 0.38, 0.62));
    pitch = h.air * 0.18 * (1 - 2 * h.s);
    wheelSpin = -(x + 4) / 0.3;
    underK = h.air * (1 - ramp(h.s, 0.92, 1));
    underLen = 1.0 + 0.6 * (1 - h.s);
    rearK = h.air * (1 - ramp(h.s, 0.25, 0.45));
    const out = inBack(ramp(t, T.lass, T.lass + 0.35));
    car.scale.setScalar(Math.max(0.001, 1 - out));
    car.visible = true;
  } else {
    car.visible = t >= BACK;
    car.scale.copy(squash(t, BACK));
    const lift1 =
      smooth(ramp(t, T.ventil + 0.1, T.unten + 0.3)) *
      (1 - smooth(ramp(t, T.verrueckt, T.boden - 0.05)));
    const lift2 =
      smooth(ramp(t, T.nur, T.nur + 0.6)) *
      (1 - smooth(ramp(t, T.uebrigens - 0.45, T.uebrigens + 0.05)));
    const lift3 = smooth(ramp(t, T.wuerdest, T.wuerdest + 0.9));
    y = H1 * lift1 + H2 * lift2 + 1.2 * lift3;
    underK =
      pop(t, T.ventil + 0.05, T.boden - 0.1, 0.15) +
      pop(t, T.nur - 0.05, T.uebrigens + 0.1, 0.15) +
      pop(t, T.wuerdest - 0.05, T.wuerdest + 60, 0.15);
    underLen = 0.9 + 0.5 * Math.max(0, 1 - y);
    rearK = pop(t, T.null - 0.05, T.wuerdest, 0.12);
    wheelSpin = t >= T.uebrigens && t < T.wuerdest ? -t * 28 : 0;
  }
  car.position.set(x, y, 0);
  car.rotation.set(roll, 0, pitch);
  for (const w of tesla.wheels) w.rotation.z = wheelSpin;
  jetsUnder.forEach((j, i) => setJet(j, Math.min(1, underK), underLen, t, i));
  jetsRear.forEach((j, i) => setJet(j, Math.min(1, rearK), 1.3, t, i + 7));
  FOLLOW.set(x * 0.75, y * 0.6 + 0.2, 0);
  puff("liftoff", t, T.ventil + 0.12, 0, 0.05, 0, 1.6);
  puff("land", t, HOOK_LAND, 4, 0.05, 0, 1.3);
  puff("back", t, BACK + 0.15, 0, 0.05, 0, 1.6);
  puff("dash", t, T.null, -2.4, 0.05, 0, 1.2);

  parked.visible = hook;
  parked.scale.setScalar(Math.max(0.001, 1 - inBack(ramp(t, T.lass, T.lass + 0.35))));

  // ---- x-ray: tanks, valve, pipes, fans
  const xray =
    smooth(ramp(t, T.kohle - 0.2, T.kohle + 0.3)) * (1 - ramp(t, T.schau, T.schau + 0.5));
  setXray([shellMat], hook ? 0 : xray);
  setXray([glassMat], hook ? 0 : xray * 0.8);
  tanks.forEach((m, i) => {
    const at = T.kohle + 0.1 + (i % 3) * 0.12 + Math.floor(i / 3) * 0.36;
    m.visible = !hook && t >= at;
    m.scale.copy(squash(t, at, 0.6));
  });
  M.carbon.emissiveIntensity =
    0.7 * smooth(ramp(t, T.druckluft, T.n600 + 0.3)) * (1 - ramp(t, T.schau, T.schau + 0.5));
  const vOn = !hook && t >= T.oeffne;
  valve.visible = vOn;
  valve.scale.copy(squash(t, T.oeffne + 0.05, 0.6));
  M.valve.emissiveIntensity = 0.9 * pop(t, T.ventil, T.luftballon);
  const pipeGrow = ramp(t, T.oeffne + 0.1, T.ventil + 0.1);
  for (const p of pipes) {
    p.visible = vOn && pipeGrow > 0;
    p.geometry.setDrawRange(0, Math.ceil(pipeGrow * 14) * 5 * 6);
  }
  M.pipe.emissiveIntensity = vOn ? 0.8 * Math.min(1, underK + rearK) : 0;
  const fanOn = t >= T.boden && t < T.kopf + 0.2;
  fans.forEach((f, i) => {
    f.visible = !hook && t >= T.boden - 0.1;
    f.scale.copy(squash(t, T.boden - 0.05, 0.6));
    f.rotation.y = fanOn ? (t - T.boden) * 22 * (i ? 1 : -1) : 0;
  });

  animateArrows(suckAir, t, pop(t, T.luefter, T.kopf - 0.1));
  animateArrows(downforce, t, pop(t, T.klebt, T.kopf - 0.1));
  animateArrows(speed, t, pop(t, T.null, T.wuerdest));

  // ---- set: upside down under the ceiling
  const ck = pop(t, T.kopf - 0.15, T.flamme);
  ceilSet.visible = ck > 0.001;
  ceilSet.scale.copy(ck > 0 ? squash(t, T.kopf - 0.1).multiplyScalar(ck) : V(1e-3, 1e-3, 1e-3));
  const dx = 0.5 * Math.sin((t - T.kopf) * 1.2);
  mini.g.position.x = dx;
  for (const w of mini.wheels) w.rotation.z = (dx / 0.3) * 1.8;
  for (const [i, f] of miniFans.entries()) f.rotation.y = t * 22 * (i ? 1 : -1);
  animateArrows(ceilForce, t, ck);

  // ---- set: balloon
  const bk = pop(t, T.luftballon - 0.1, T.duese);
  balloonSet.visible = bk > 0.001;
  balloonSet.scale.setScalar(Math.max(0.001, bk));
  const inflate = lerp(0.45, 1, smooth(ramp(t, T.luftballon, T.losl)));
  const u = ramp(t, T.losl, T.losl + 1.7);
  balloon.position.set(0.35 * Math.sin(u * 9) * u, 0.9 + 2.3 * Math.pow(u, 1.4), 0);
  balloon.rotation.z = 0.35 * Math.sin(u * 12) * u;
  balloon.scale.setScalar(inflate * (1 - 0.3 * u));
  setJet(balloonJet, u > 0 && u < 1 ? 1 : 0, 0.7, t, 3);

  // ---- set: fuel pump + flame, crossed out
  const pk = pop(t, T.flamme - 0.05, T.nur);
  pumpSet.visible = pk > 0.001;
  pumpSet.scale.copy(pk > 0 ? squash(t, T.flamme).multiplyScalar(pk) : V(1e-3, 1e-3, 1e-3));
  flameOuter.scale.set(1, 1 + 0.12 * Math.sin(t * 19), 1);
  flameInner.scale.set(1, 1 + 0.15 * Math.sin(t * 23 + 1), 1);
  showNope(pop(t, T.flamme + 0.35, T.nur), RT[0] - 0.1, 0.75, RT[2] + 0.35, 1.0);

  // ---- LED panel: one fact at a time
  if (t >= T.n600 && t < T.aber) {
    showPanel(pop(t, T.n600, T.aber), "DRUCKLUFT", "600 L", LED.blue);
  } else if (t >= T.duese + 0.3 && t < T.verrueckt) {
    showPanel(pop(t, T.duese + 0.3, T.verrueckt), "DÜSEN", "10", LED.yellow);
  } else if (t >= T.klebt && t < T.kopf + 0.5) {
    showPanel(pop(t, T.klebt, T.kopf + 0.5), "SAUGKRAFT", "4,7 t", LED.red);
  } else {
    showPanel(0);
  }

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
