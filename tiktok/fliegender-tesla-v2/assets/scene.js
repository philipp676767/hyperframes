// "So funktioniert der fliegende Tesla" (v2). World, captions, camera, panel,
// arrows and labels live in world.js; this file builds the car story.
// Every time-keyed decision is in beats.js.
import {
  THREE,
  ramp,
  lerp,
  smooth,
  pop,
  V,
  scene,
  flat,
  M,
  xrayMaterial,
  xrayEdges,
  setXray,
  makeArrowSet,
  animateArrows,
  forceMat,
  coldMat,
  showNope,
  showLabel,
  labels,
  squash,
  puff,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { createWorld } from "./environments.js";
import {
  T,
  shots,
  LABELS,
  HIGHLIGHTS,
  DIVE,
  BAL,
  VAC,
  ROCK,
  HOVER,
  TR,
  LAND,
  FIRE,
  LIFT,
  TUN,
  UP,
  TOP,
  DASH,
  RISE,
  tunnelX,
  dashX,
} from "./beats.js";

highlights(HIGHLIGHTS);
createWorld({ env: "stadt", sky: "abend" });

Object.assign(M, {
  carbon: flat(0x2e3138, { roughness: 0.5, emissive: 0x4fc3ff, emissiveIntensity: 0 }),
  valve: flat(0xffd23f, { emissive: 0xffd23f, emissiveIntensity: 0 }),
  pipe: flat(0xb9c2cc, { roughness: 0.3, emissive: 0x9fe3ff, emissiveIntensity: 0 }),
  nozzle: new THREE.MeshStandardMaterial({ color: 0x9aa3ad, metalness: 0.7, roughness: 0.3 }),
  blade: flat(0xff8a1f, { emissive: 0xff6a00, emissiveIntensity: 0.35 }),
  air: new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
  }),
  airCore: new THREE.MeshBasicMaterial({
    color: 0xdff4ff,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  }),
  airLine: new THREE.MeshBasicMaterial({ color: 0xeaf6ff }),
  head: flat(0xfff6dc, { emissive: 0xfff1c2, emissiveIntensity: 1.4 }),
  tail: flat(0xff3040, { emissive: 0xff1a2a, emissiveIntensity: 1.3 }),
  balloon: flat(0xff4b6b, { roughness: 0.35 }),
  scuba: flat(0xffc21f, { roughness: 0.35 }),
  rug: flat(0xc8463a),
  rugLight: flat(0xf2c230),
  vac: flat(0x7a4fd6, { roughness: 0.4 }),
  rocket: flat(0xf4f4f6, { roughness: 0.4 }),
  rocketRed: flat(0xe2453c),
  flame: flat(0xff8a1f, { emissive: 0xff6a00, emissiveIntensity: 1.3 }),
  flameCore: flat(0xffe14a, { emissive: 0xffd000, emissiveIntensity: 1.3 }),
  tunnel: new THREE.MeshStandardMaterial({
    color: 0xcfc6bd,
    roughness: 0.9,
    flatShading: true,
    side: THREE.DoubleSide,
  }),
  tunnelLamp: flat(0xfff1c2, { emissive: 0xffd27a, emissiveIntensity: 1.4 }),
  porthole: flat(0x4fc3ff, { emissive: 0x2f9bff, emissiveIntensity: 0.4 }),
});

// ---------------------------------------------------------------- car builder
// Low-poly roadster facing +x: wedge body (side profile extruded), dark glass
// canopy, four wheels, head- and taillights. Origin on the ground under the
// car's centre.
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
  for (const z of [-0.42, 0.42]) {
    const h = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.07, 0.34), M.head);
    h.position.set(1.66, 0.42, z);
    g.add(h);
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.07, 0.4), M.tail);
    l.position.set(-1.71, 0.56, z);
    g.add(l);
  }
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

// air jet: a soft white cone with a brighter core, apex at the nozzle,
// pointing down (-y) in the jet's own frame
const jetGeo = new THREE.ConeGeometry(0.16, 1, 10, 1, true);
jetGeo.translate(0, -0.5, 0);
const coreGeo = new THREE.ConeGeometry(0.07, 1, 8, 1, true);
coreGeo.translate(0, -0.5, 0);
function makeJet(parent, x, y, z, rotZ = 0) {
  const j = new THREE.Group();
  j.position.set(x, y, z);
  j.rotation.z = rotZ;
  j.add(new THREE.Mesh(jetGeo, M.air));
  const core = new THREE.Mesh(coreGeo, M.airCore);
  core.scale.y = 0.6;
  j.add(core);
  parent.add(j);
  j.visible = false;
  return j;
}
function setJet(j, k, len, t, seed) {
  j.visible = k > 0.01;
  if (!j.visible) return;
  const flick = 1 + 0.12 * Math.sin(t * 47 + seed * 3.1) + 0.08 * Math.sin(t * 83 + seed);
  const w = k * (0.95 + 0.12 * flick);
  j.scale.set(w, Math.max(0.001, k * len * flick), w);
}

// ---------------------------------------------------------------- the roadster
const shellMat = xrayMaterial(0xd8232a, { roughness: 0.3 });
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
const valve = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.18, 0.26), M.valve);
valve.position.set(0, 0.42, 0);
car.add(valve);

// nozzles: six under the floor, four at the back
const under = [];
for (const x of [-1.0, 0, 1.0]) for (const z of [-0.45, 0.45]) under.push([x, 0.17, z]);
const rear = [];
for (const y of [0.36, 0.58]) for (const z of [-0.35, 0.35]) rear.push([-1.72, y, z]);
const nozzleGeo = new THREE.CylinderGeometry(0.05, 0.095, 0.13, 10);
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

// pipes from the valve to every nozzle and both tank rows (grow in)
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
    const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([vp, mid, end]), 14, 0.026, 5);
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

// arrows (car space): air sucked from under the floor out the back,
// suction pressing the car onto the road / ceiling, speed lines
const suckAir = makeArrowSet(
  [
    [V(1.3, 0.12, 0.33), V(-2.6, 0.3, 0.33)],
    [V(1.3, 0.12, -0.33), V(-2.6, 0.3, -0.33)],
  ],
  { parent: car, mat: coldMat, r: 0.035, amp: 0.05 },
);
const downforce = makeArrowSet(
  [
    [V(0.7, 2.0, 0), V(0.7, 1.12, 0)],
    [V(-0.6, 2.0, 0), V(-0.6, 1.12, 0)],
  ],
  { parent: car, mat: forceMat, r: 0.05, amp: 0 },
);
const speed = makeArrowSet(
  [
    [V(-1.9, 0.4, 0.55), V(-4.2, 0.4, 0.55)],
    [V(-1.9, 0.85, -0.3), V(-4.6, 0.85, -0.3)],
    [V(-1.9, 0.25, -0.65), V(-3.8, 0.25, -0.65)],
    [V(-1.9, 1.05, 0.25), V(-3.4, 1.05, 0.25)],
  ],
  { parent: car, mat: M.airLine, r: 0.022, amp: 0 },
);

// ---------------------------------------------------------------- set: tunnel
// A round tube along x with the front (+z, mid height) cut away so the
// camera looks in. The car drives on its floor and up the back wall.
const tunnel = new THREE.Group();
scene.add(tunnel);
{
  const OPEN = 0.95; // half-angle of the cut-away
  const L = 9;
  const geo = new THREE.CylinderGeometry(
    TR + 0.05,
    TR + 0.05,
    L,
    44,
    6,
    true,
    OPEN,
    Math.PI * 2 - OPEN * 2,
  );
  geo.rotateZ(Math.PI / 2);
  const tube = new THREE.Mesh(geo, M.tunnel);
  tube.position.y = TR;
  tube.receiveShadow = true;
  tube.userData.noAO = true;
  tunnel.add(tube);
  // portal rings + lamp strips along the upper walls
  for (const x of [-L / 2, L / 2]) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(TR + 0.2, 0.12, 6, 40, Math.PI * 2 - OPEN * 2),
      flat(0x9a9088),
    );
    ring.rotation.set(0, Math.PI / 2, Math.PI + OPEN); // gap faces the camera (+z)
    ring.position.set(x, TR, 0);
    tunnel.add(ring);
  }
  for (let x = -4; x <= 4; x += 1.0)
    for (const a of [Math.PI * 0.62, -Math.PI * 0.62]) {
      // angle from the bottom; negative = back wall
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.12), M.tunnelLamp);
      lamp.position.set(x, TR - (TR + 0.05) * Math.cos(a), (TR + 0.05) * Math.sin(a));
      lamp.rotation.x = -a;
      if (a > 0) continue; // the front lamps would sit in the cut-away
      tunnel.add(lamp);
    }
  // yellow dashed centre line on the floor
  for (let x = -4; x <= 4; x += 1.0) {
    const d = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.09), flat(0xf2c230));
    d.position.set(x, 0.05, 0);
    tunnel.add(d);
  }
}

// ---------------------------------------------------------------- set: scuba tank
const diveSet = new THREE.Group();
diveSet.position.set(...DIVE);
scene.add(diveSet);
{
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.1, 18), M.scuba);
  body.position.y = 0.6;
  body.castShadow = true;
  diveSet.add(body);
  const top = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    M.scuba,
  );
  top.position.y = 1.15;
  diveSet.add(top);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.2, 10), M.chrome);
  neck.position.y = 1.5;
  diveSet.add(neck);
  const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 12), flat(0x1c1d22));
  knob.position.y = 1.62;
  diveSet.add(knob);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.305, 0.305, 0.12, 18), flat(0x1c1d22));
  band.position.y = 0.95;
  diveSet.add(band);
}

// ---------------------------------------------------------------- set: balloon
const balloonSet = new THREE.Group();
balloonSet.position.set(...BAL);
scene.add(balloonSet);
const balloon = new THREE.Group();
balloonSet.add(balloon);
{
  const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.36, 2), M.balloon);
  b.scale.set(1, 1.2, 1);
  b.castShadow = true;
  balloon.add(b);
  const knot = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.1, 8), M.balloon);
  knot.position.y = -0.47;
  balloon.add(knot);
}
const balloonJet = makeJet(balloon, 0, -0.5, 0, 0);

// ---------------------------------------------------------------- set: vacuum on a rug
const vacSet = new THREE.Group();
vacSet.position.set(...VAC);
scene.add(vacSet);
const dust = [];
{
  const rug = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.04, 1.2), M.rug);
  rug.position.y = 0.02;
  rug.receiveShadow = true;
  vacSet.add(rug);
  for (const z of [-0.45, 0.45]) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.045, 0.1), M.rugLight);
    s.position.set(0, 0.022, z);
    vacSet.add(s);
  }
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.1, 0.26), M.vac);
  head.position.set(0, 0.09, 0.1);
  head.castShadow = true;
  vacSet.add(head);
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.4, 8), M.steel);
  stick.position.set(0, 0.8, -0.18);
  stick.rotation.x = -0.25;
  vacSet.add(stick);
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.5, 0.24), M.vac);
  body.position.set(0, 0.75, -0.2);
  body.rotation.x = -0.25;
  body.castShadow = true;
  vacSet.add(body);
  const grip = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.03, 6, 12), flat(0x1c1d22));
  grip.position.set(0, 1.5, -0.36);
  vacSet.add(grip);
  const dg = new THREE.IcosahedronGeometry(0.03, 0);
  for (let i = 0; i < 14; i++) {
    const d = new THREE.Mesh(dg, flat(0xfff3dc));
    vacSet.add(d);
    dust.push(d);
  }
}

// ---------------------------------------------------------------- set: toy rocket
const rocketSet = new THREE.Group();
rocketSet.position.set(...ROCK);
scene.add(rocketSet);
const rFlame = new THREE.Group();
{
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.2, 16), M.rocket);
  body.position.y = 0.95;
  body.castShadow = true;
  rocketSet.add(body);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.55, 16), M.rocketRed);
  nose.position.y = 1.82;
  nose.castShadow = true;
  rocketSet.add(nose);
  const win = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.05, 14), M.porthole);
  win.rotation.x = Math.PI / 2;
  win.position.set(0, 1.15, 0.29);
  rocketSet.add(win);
  for (let i = 0; i < 3; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.45, 0.32), M.rocketRed);
    const a = (i / 3) * Math.PI * 2 + 0.5;
    fin.position.set(Math.sin(a) * 0.36, 0.5, Math.cos(a) * 0.36);
    fin.rotation.y = a;
    rocketSet.add(fin);
  }
  rFlame.position.y = 0.35;
  rocketSet.add(rFlame);
  const fo = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.6, 8), M.flame);
  fo.rotation.x = Math.PI;
  fo.position.y = -0.2;
  rFlame.add(fo);
  const fi = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.38, 8), M.flameCore);
  fi.rotation.x = Math.PI;
  fi.position.y = -0.12;
  rFlame.add(fi);
}

// ---------------------------------------------------------------- car pose
// Pure function of t. Also valid for t < 0 (the loop tail): the hover.
const hoverY = (t) => HOVER + 0.07 * Math.sin(t * 2.1);
function carPose(t) {
  const p = { x: 0, y: 0, z: 0, rx: 0, pitch: 0, under: 0, len: 1, rear: 0, spin: 0 };
  if (t < LAND) {
    p.y = hoverY(t);
    p.pitch = 0.03 * Math.sin(t * 1.3);
    p.under = 1;
  } else if (t < FIRE) {
    const u = ramp(t, LAND, LAND + 0.35);
    p.y = hoverY(LAND) * (1 - u * u);
    p.under = 1 - u;
  } else if (t < LIFT) {
    p.y = 0.8 * smooth(ramp(t, FIRE, FIRE + 0.9)) + 0.03 * Math.sin(t * 3.3);
    p.under = Math.min(1, (t - FIRE) * 8);
  } else if (t < TUN) {
    const u = t - LIFT;
    p.y = 0.8 + 0.03 * Math.sin(LIFT * 3.3) + 6.5 * u * u;
    p.pitch = 0.12 * Math.min(1, u * 3);
    p.under = 1;
  } else if (t < T.nur) {
    // in the tunnel: along the floor, then up the back wall onto the ceiling
    const th = -Math.PI * smooth(ramp(t, UP, TOP));
    const r = TR - 0.06;
    p.x = tunnelX(t);
    p.y = TR - r * Math.cos(th);
    p.z = r * Math.sin(th);
    p.rx = -th;
    p.spin = -(p.x + 3) / 0.3;
  } else if (t < T.uebrigens) {
    p.y =
      1.1 + 0.4 * smooth(ramp(t, T.nur, T.schau)) + 0.5 * smooth(ramp(t, T.gerade, T.gebaut + 0.4));
    p.y += 0.05 * Math.sin(t * 2.1);
    p.under = 1;
  } else if (t < RISE) {
    const u = ramp(t, T.uebrigens, T.uebrigens + 0.35);
    p.x = dashX(t);
    p.y = 0.9 * (1 - u * u);
    p.under = 1 - u;
    p.rear = t >= DASH ? Math.min(1, (t - DASH) * 6) * (1 - ramp(t, DASH + 2.6, DASH + 3.1)) : 0;
    p.pitch = t >= DASH ? -0.05 * Math.exp(-(t - DASH) * 2.5) : 0;
    p.spin = -(p.x + 4) / 0.3;
  } else {
    p.y = hoverY(t) * smooth(ramp(t, RISE, RISE + 1.4));
    p.under = Math.min(1, (t - RISE) * 6);
  }
  p.len = p.y + 0.35; // jets reach the ground (and spread a little)
  return p;
}

// the tunnel / sprint shots ride along with the car
const FOLLOW = V(0, 0, 0);
const DASHV = V(0, 0, 0);
const DASHV1 = V(0, 0, 0);
for (const s of shots) {
  if (s.follow) s.rel = FOLLOW;
  if (s.dash) s.rel = s.dashK ? DASHV1 : DASHV;
}
const applyCamera = shotCamera(shots);

// ground puffs while hovering: one every 0.45 s under the jets
const HOOK_PUFFS = [];
for (let a = -6; a < LAND; a += 0.45) HOOK_PUFFS.push(a);
const CTA_PUFFS = [];
for (let a = RISE + 0.2; a < RISE + 6; a += 0.45) CTA_PUFFS.push(a);

// ---------------------------------------------------------------- render
function renderAt(t) {
  const p = carPose(t);
  car.position.set(p.x, p.y, p.z);
  car.rotation.set(p.rx, 0, p.pitch);
  for (const w of tesla.wheels) w.rotation.z = p.spin;
  jetsUnder.forEach((j, i) => setJet(j, Math.min(1, p.under), p.len, t, i));
  jetsRear.forEach((j, i) => setJet(j, Math.min(1, p.rear), 1.8, t, i + 7));
  FOLLOW.set(tunnelX(t), 0, 0);
  DASHV.set(dashX(t) * 0.85, 0, 0);
  DASHV1.set(dashX(t), 0, 0);

  // dust where the jets hit the ground
  for (const a of HOOK_PUFFS)
    puff(`h${a.toFixed(2)}`, t, a, ((a * 7.3) % 1.4) - 0.7, 0.05, ((a * 3.1) % 0.8) - 0.4, 0.9);
  for (const a of CTA_PUFFS)
    puff(`c${a.toFixed(2)}`, t, a, ((a * 7.3) % 1.4) - 0.7, 0.05, ((a * 3.1) % 0.8) - 0.4, 0.9);
  puff("land", t, LAND + 0.35, 0, 0.05, 0, 1.5);
  puff("fire1", t, FIRE + 0.05, 0.9, 0.05, 0.4, 1.3);
  puff("fire2", t, FIRE + 0.1, -0.9, 0.05, -0.4, 1.3);
  puff("lift", t, LIFT + 0.05, 0, 0.05, 0, 2.2);
  puff("dashLand", t, T.uebrigens + 0.35, -4, 0.05, 0, 1.3);
  puff("dash", t, DASH + 0.05, -5.6, 0.3, 0, 1.6);
  puff("rise", t, RISE + 0.1, 0, 0.05, 0, 1.6);

  // ---- x-ray: only while the inside is explained
  const xr = Math.min(
    1,
    smooth(ramp(t, T.kohle - 0.2, T.kohle + 0.2)) *
      (1 - smooth(ramp(t, T.aber - 0.1, T.aber + 0.25))) +
      smooth(ramp(t, T.ventil - 0.25, T.ventil + 0.1)) *
        (1 - smooth(ramp(t, T.und1 - 0.1, T.und1 + 0.15))) +
      smooth(ramp(t, T.unter - 0.1, T.unter + 0.25)) *
        (1 - smooth(ramp(t, T.wie5 - 0.05, T.wie5 + 0.1))),
  );
  setXray([shellMat], xr);
  setXray([glassMat], xr * 0.8);
  const built = t >= T.kohle;
  tanks.forEach((m, i) => {
    const at = T.kohle + 0.1 + (i % 3) * 0.12 + Math.floor(i / 3) * 0.35;
    m.visible = built && t >= at;
    m.scale.copy(squash(t, at, 0.6));
  });
  M.carbon.emissiveIntensity = 0.3 * xr + 0.7 * pop(t, T.drucktank, T.aber + 0.3);
  valve.visible = t >= T.ventil;
  valve.scale.copy(squash(t, T.ventil + 0.05, 0.6));
  M.valve.emissiveIntensity = 0.9 * pop(t, T.ventil + 0.1, T.wie4);
  const grow = ramp(t, T.ventil + 0.15, FIRE);
  for (const m of pipes) {
    m.visible = grow > 0;
    m.geometry.setDrawRange(0, Math.ceil(grow * 14) * 5 * 6);
  }
  M.pipe.emissiveIntensity = t >= FIRE ? 0.9 * Math.min(1, p.under + p.rear) : 0;
  fans.forEach((f, i) => {
    f.visible = t >= T.unter + 0.15;
    f.scale.copy(squash(t, T.unter + 0.2, 0.6));
    f.rotation.y = (t - T.unter) * 24 * (i ? 1 : -1);
  });
  animateArrows(suckAir, t, pop(t, T.luefter, T.wie5) + pop(t, TOP - 0.4, T.nur));
  animateArrows(downforce, t, pop(t, TOP - 0.3, T.nur));
  animateArrows(speed, t, pop(t, DASH + 0.1, RISE));
  showLabel("luefter", pop(t, T.luefter, T.wie5), "Lüfter", V(tunnelX(t), 0.2, 0.33), 1);

  // ---- tunnel
  tunnel.visible = t >= TUN - 0.02 && t < T.nur;
  tunnel.scale.copy(squash(t, TUN - 0.02, 0.5));

  // ---- scuba tank
  const dk = pop(t, T.wie2 - 0.05, T.das1 + 0.05, 0.2);
  diveSet.visible = dk > 0.001;
  diveSet.scale.copy(squash(t, T.wie2 + 0.05, 0.6)).multiplyScalar(Math.max(0.001, dk));

  // ---- balloon: blown up, then let go
  const bk = pop(t, T.wie4 - 0.1, T.das2, 0.2);
  balloonSet.visible = bk > 0.001;
  balloonSet.scale.setScalar(Math.max(0.001, bk));
  const u = ramp(t, T.luftballon, T.luftballon + 1.0);
  balloon.position.set(0.35 * Math.sin(u * 9) * u, 1.1 + 2.6 * Math.pow(u, 1.3), 0);
  balloon.rotation.z = 0.35 * Math.sin(u * 12) * u;
  balloon.scale.setScalar(lerp(0.55, 1, smooth(ramp(t, T.wie4, T.luftballon))) * (1 - 0.3 * u));
  setJet(balloonJet, u > 0 && u < 1 ? 1 : 0, 0.8, t, 3);

  // ---- vacuum: dust flies into the nozzle, the rug edge lifts
  const vk = pop(t, T.wie5 - 0.05, T.theo, 0.2);
  vacSet.visible = vk > 0.001;
  vacSet.scale.copy(squash(t, T.wie5 + 0.05, 0.6)).multiplyScalar(Math.max(0.001, vk));
  dust.forEach((d, i) => {
    const ph = (t * 1.3 + i * 0.137) % 1;
    const a = i * 2.4;
    const r0 = 0.7 * (1 - ph);
    d.position.set(Math.cos(a) * r0, 0.06 + 0.05 * ph, 0.1 + Math.sin(a) * r0 * 0.6);
    d.scale.setScalar(1 - ph * 0.7);
  });

  // ---- toy rocket: flame, then crossed out
  const rk = pop(t, T.nur - 0.05, T.schau, 0.2);
  rocketSet.visible = rk > 0.001;
  rocketSet.scale.copy(squash(t, T.nur + 0.05, 0.6)).multiplyScalar(Math.max(0.001, rk));
  rFlame.scale.set(1, 1 + 0.18 * Math.sin(t * 21), 1);
  showNope(pop(t, T.rakete2, T.schau), ROCK[0], 1.1, ROCK[2] + 0.45, 1.1);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
