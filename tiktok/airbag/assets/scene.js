// "So funktioniert ein Airbag": a toy car on a snowy mountain road at noon.
// Hook: a pillow tied to the steering wheel (you can't see). Build: nylon bag
// folded into the wheel hub, crash sensor (mass on a spring) in the nose with a
// bus analogy, control unit that ignores a pothole, crash into a barrier →
// propellant tablet → nitrogen inflates the bag in 30 ms, vent holes let the
// head sink in softly.
import {
  THREE,
  W,
  END,
  ramp,
  lerp,
  smooth,
  outBack,
  inBack,
  pop,
  rng,
  V,
  scene,
  flat,
  M,
  xrayMaterial,
  xrayEdges,
  setXray,
  showNope,
  makeArrowSet,
  animateArrows,
  forceMat,
  showPanel,
  LED,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { createWorld } from "./environments.js";

createWorld({ env: "winter", sky: "mittag" });

// ---------------------------------------------------------------- beats
const T = {
  airbag1: W("Airbag", 1),
  aber1: W("Aber", 1),
  nichts: W("nichts"),
  also1: W("Also", 1),
  faltest: W("faltest"),
  nylonsack: W("Nylonsack"),
  lenkrad2: W("Lenkrad", 2),
  kracht: W("kracht"),
  chip: W("Chip"),
  feder: W("Feder"),
  stoppt: W("Stoppt"),
  schwingt: W("schwingt"),
  bus: W("Bus"),
  bremst: W("bremst"),
  crashsensor: W("Crashsensor"),
  computer: W("Computer"),
  prueft: W("prüft"),
  schlagloch: W("Schlagloch"),
  steuergeraet: W("Steuergerät"),
  bei: W("Bei"),
  crash: W("Crash"),
  zuendet: W("zündet"),
  tablette: W("Tablette"),
  blitzschnell: W("blitzschnell"),
  stickstoff: W("Stickstoff"),
  millisekunden: W("Millisekunden"),
  prall: W("prall"),
  gasgenerator: W("Gasgenerator"),
  aber2: W("Aber", 2),
  wand: W("Wand"),
  also2: W("Also", 2),
  loecher: W("Löcher"),
  taucht: W("Taucht"),
  entweicht: W("entweicht"),
  weich: W("weich"),
  schau: W("Schau"),
  gerade: W("gerade"),
};

// helpers ---------------------------------------------------------
const UP = V(0, 1, 0);
const _a = V(0, 0, 0);
// stretch a unit-height cylinder between two points
function segment(mesh, a, b) {
  _a.copy(b).sub(a);
  const len = Math.max(1e-4, _a.length());
  mesh.position.copy(a).addScaledVector(_a, 0.5);
  mesh.quaternion.setFromUnitVectors(UP, _a.normalize());
  mesh.scale.set(mesh.userData.r, len, mesh.userData.r);
}
const unitCyl = new THREE.CylinderGeometry(1, 1, 1, 8);
function limb(r, mat) {
  const m = new THREE.Mesh(unitCyl, mat);
  m.userData.r = r;
  m.castShadow = true;
  return m;
}
// damped swing that starts at t0 (0 before), first lobe positive
const swing = (t, t0, w = 10, d = 3.2) =>
  t < t0 ? 0 : Math.exp(-d * (t - t0)) * Math.sin(w * (t - t0));
const show = (obj, k) => {
  obj.visible = k > 0.001;
  obj.scale.setScalar(Math.max(0.001, k));
};

// ---------------------------------------------------------------- drive schedule
// Speed (units/s) as a pure function of t; distance S(t) from a fixed table so
// the road, pothole and barrier stay deterministic under seeking.
const V0 = 5;
function speed(t) {
  if (t < T.also1 + 0.6) return 0;
  if (t < T.stoppt) return V0 * smooth(ramp(t, T.also1 + 0.6, T.also1 + 1.6));
  if (t < T.computer) return V0 * (1 - ramp(t, T.stoppt, T.stoppt + 0.3));
  if (t < T.crash) return V0 * smooth(ramp(t, T.computer, T.computer + 1.0));
  return 0;
}
const DT = 1 / 240;
const STAB = [0];
for (let i = 1; i * DT < END + 2; i++) STAB.push(STAB[i - 1] + speed((i - 0.5) * DT) * DT);
function S(t) {
  const f = Math.max(0, t) / DT;
  const i = Math.min(STAB.length - 2, Math.floor(f));
  return lerp(STAB[i], STAB[i + 1], f - i);
}
const S_CRASH = S(T.crash);
const S_HOLE = S(T.schlagloch + 0.15);

// ---------------------------------------------------------------- road (scrolls under the car)
const road = new THREE.Group();
scene.add(road);
{
  const asphalt = new THREE.Mesh(new THREE.PlaneGeometry(90, 2.8), flat(0x5d6577));
  asphalt.rotation.x = -Math.PI / 2;
  asphalt.position.y = 0.015;
  asphalt.receiveShadow = true;
  road.add(asphalt);
  for (const s of [-1, 1]) {
    const berm = new THREE.Mesh(new THREE.BoxGeometry(90, 0.16, 0.4), flat(0xf7faff));
    berm.position.set(0, 0.06, s * 1.6);
    berm.receiveShadow = true;
    road.add(berm);
  }
}
const DASH_N = 30;
const DASH_GAP = 3;
const dashes = [];
for (let i = 0; i < DASH_N; i++) {
  const d = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.012, 0.09), flat(0xf4f1e6));
  d.position.y = 0.025;
  road.add(d);
  dashes.push(d);
}
// pothole
const hole = new THREE.Mesh(new THREE.CircleGeometry(0.34, 12), flat(0x2c2f3a));
hole.rotation.x = -Math.PI / 2;
hole.scale.set(1.2, 1, 1);
hole.position.set(0, 0.03, 0.6);
road.add(hole);
// crash barrier (red / white striped)
const barrier = new THREE.Group();
{
  const shape = new THREE.Shape();
  shape.moveTo(-0.32, 0);
  shape.lineTo(0.32, 0);
  shape.lineTo(0.14, 0.3);
  shape.lineTo(0.12, 0.85);
  shape.lineTo(-0.12, 0.85);
  shape.lineTo(-0.14, 0.3);
  shape.lineTo(-0.32, 0);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 2.6, bevelEnabled: false });
  geo.translate(0, 0, -1.3);
  const block = new THREE.Mesh(geo, M.concrete);
  block.castShadow = true;
  barrier.add(block);
  for (let i = 0; i < 5; i++) {
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.3, 0.26),
      flat(i % 2 ? 0xffffff : 0xe8322b),
    );
    stripe.position.set(-0.13, 0.62, -1.04 + i * 0.52);
    barrier.add(stripe);
  }
  const cap = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 2.64), flat(0xf7faff));
  cap.position.y = 0.88;
  barrier.add(cap);
}
road.add(barrier);

// ---------------------------------------------------------------- car rig
const rig = new THREE.Group(); // bumps + crash pitch (shell + cockpit)
scene.add(rig);
const cockpit = new THREE.Group(); // seat, dummy, wheel: already there in the hook
rig.add(cockpit);
const carBody = new THREE.Group(); // pops in on "Also"
rig.add(carBody);

// shell: one extruded side profile, front = +x
const shellMat = xrayMaterial(0xe8433a);
const glassMat = xrayMaterial(0xbfe6ff);
const shellMats = [shellMat, glassMat];
{
  const p = new THREE.Shape();
  p.moveTo(-2.05, 0.35);
  p.lineTo(2.05, 0.35);
  p.lineTo(2.12, 0.82);
  p.lineTo(1.95, 1.12);
  p.lineTo(0.78, 1.24);
  p.lineTo(0.1, 1.9);
  p.lineTo(-1.15, 1.9);
  p.lineTo(-1.82, 1.3);
  p.lineTo(-2.1, 1.2);
  p.lineTo(-2.12, 0.45);
  p.lineTo(-2.05, 0.35);
  const geo = new THREE.ExtrudeGeometry(p, {
    depth: 1.6,
    bevelEnabled: true,
    bevelSize: 0.06,
    bevelThickness: 0.06,
    bevelSegments: 2,
  });
  geo.translate(0, 0, -0.8);
  const shell = new THREE.Mesh(geo, shellMat);
  shell.castShadow = true;
  carBody.add(shell);
  carBody.add(xrayEdges(geo));
  // side windows
  const w = new THREE.Shape();
  w.moveTo(0.66, 1.3);
  w.lineTo(0.08, 1.82);
  w.lineTo(-1.1, 1.82);
  w.lineTo(-1.66, 1.32);
  w.lineTo(0.66, 1.3);
  const wGeo = new THREE.ExtrudeGeometry(w, { depth: 0.02, bevelEnabled: false });
  for (const s of [-1, 1]) {
    const pane = new THREE.Mesh(wGeo, glassMat);
    pane.position.z = s * 0.87 - 0.01;
    carBody.add(pane);
  }
  // lights + bumpers (stay solid)
  const head = flat(0xfff2b0, { emissive: 0xffe27a, emissiveIntensity: 0.9 });
  const tail = flat(0xff5a4a, { emissive: 0xff2a1a, emissiveIntensity: 0.6 });
  for (const s of [-1, 1]) {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.3), head);
    hl.position.set(2.14, 0.95, s * 0.55);
    carBody.add(hl);
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.26), tail);
    tl.position.set(-2.16, 1.0, s * 0.58);
    carBody.add(tl);
  }
  for (const s of [-1, 1]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 1.74), M.rubber);
    b.position.set(s * 2.16, 0.48, 0);
    carBody.add(b);
  }
}
const wheels = [];
for (const sx of [-1.35, 1.35])
  for (const sz of [-0.86, 0.86]) {
    const g = new THREE.Group();
    const tyre = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.26, 14), M.rubber);
    tyre.rotation.x = Math.PI / 2;
    tyre.castShadow = true;
    g.add(tyre);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.28, 6), M.chrome);
    rim.rotation.x = Math.PI / 2;
    g.add(rim);
    g.position.set(sx, 0.36, sz);
    carBody.add(g);
    wheels.push(g);
  }

// cockpit: floor, dashboard, seat
{
  const floor = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.06, 1.5), flat(0x3a3f4d));
  floor.position.set(-0.2, 0.4, 0);
  floor.receiveShadow = true;
  cockpit.add(floor);
  const dash = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.3, 1.5), flat(0x2f3340));
  dash.position.set(0.95, 1.08, 0);
  dash.castShadow = true;
  cockpit.add(dash);
  const seatMat = flat(0x3d5a99);
  const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.16, 0.56), seatMat);
  cushion.position.set(-0.55, 0.66, 0);
  cushion.castShadow = true;
  cockpit.add(cushion);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.85, 0.56), seatMat);
  back.position.set(-0.86, 1.08, 0);
  back.rotation.z = 0.14;
  back.castShadow = true;
  cockpit.add(back);
  const rest = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 0.3), seatMat);
  rest.position.set(-0.96, 1.62, 0);
  rest.rotation.z = 0.14;
  cockpit.add(rest);
  const legs = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.26, 0.5), seatMat);
  legs.position.set(-0.55, 0.5, 0);
  cockpit.add(legs);
}

// steering wheel + column
const HUB = V(0.32, 1.36, 0);
const wheelGrp = new THREE.Group();
wheelGrp.position.copy(HUB);
wheelGrp.rotation.z = -0.42; // top leans towards the driver
cockpit.add(wheelGrp);
const hubMat = flat(0x2b2b33);
{
  const rimMesh = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 8, 24), hubMat);
  rimMesh.rotation.y = Math.PI / 2;
  wheelGrp.add(rimMesh);
  const hubMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.07, 14, 1, true), hubMat);
  hubMesh.rotation.z = Math.PI / 2;
  wheelGrp.add(hubMesh);
  for (const a of [0, 2.1, 4.2]) {
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.13, 0.03), hubMat);
    spoke.position.set(0, Math.cos(a) * 0.16, Math.sin(a) * 0.16);
    spoke.rotation.x = -a;
    wheelGrp.add(spoke);
  }
  const col = limb(0.035, hubMat);
  segment(col, V(0.36, 1.33, 0), V(0.78, 1.02, 0));
  cockpit.add(col);
}
// gas generator tablet (inside the hub, behind the folded bag)
const tabletMat = flat(0xc9a46b, { emissive: 0xff6a10, emissiveIntensity: 0 });
const tablet = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.035, 14), tabletMat);
tablet.rotation.z = Math.PI / 2;
tablet.position.x = 0.03;
wheelGrp.add(tablet);
const flash = new THREE.PointLight(0xff8a2a, 0, 3, 1.5);
wheelGrp.add(flash);
// folded nylon bag (block in the hub) + the sheet that folds into it
const nylonMat = flat(0xf4f1ea, { roughness: 0.6 });
const folded = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.15, 0.15), nylonMat);
folded.position.x = -0.04;
wheelGrp.add(folded);
const sheet = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1, 4, 4),
  flat(0xf4f1ea, { side: THREE.DoubleSide, roughness: 0.6 }),
);
cockpit.add(sheet);

// the airbag itself (unit sphere, scaled per frame)
const bagMat = flat(0xf6f3ec, { roughness: 0.55 });
const bag = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), bagMat);
bag.castShadow = true;
cockpit.add(bag);
const ventMat = flat(0x2c2f3a, { emissive: 0xff7a2f, emissiveIntensity: 0 });
const vents = [];
for (const [y, z] of [
  [0.25, 0.96],
  [-0.3, 0.95],
  [0.25, -0.96],
  [-0.3, -0.95],
]) {
  const v = new THREE.Mesh(new THREE.CircleGeometry(0.15, 10), ventMat);
  v.position.set(0, y, z);
  v.rotation.y = z > 0 ? 0 : Math.PI;
  bag.add(v);
  vents.push(v);
}
const BAG_C = V(0.05, 1.45, 0);
const BAG_R = V(0.31, 0.34, 0.36);

// crash-test dummy: pivot at the hip
const dummyMat = flat(0xf5c518);
const darkMat = flat(0x2b2b33);
const upper = new THREE.Group();
upper.position.set(-0.58, 0.76, 0);
cockpit.add(upper);
const headGrp = new THREE.Group();
{
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.34, 4, 10), dummyMat);
  torso.position.set(0.02, 0.32, 0);
  torso.castShadow = true;
  upper.add(torso);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 8), darkMat);
  neck.position.set(0.05, 0.74, 0);
  upper.add(neck);
  headGrp.position.set(0.08, 0.9, 0);
  upper.add(headGrp);
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 1), dummyMat);
  head.castShadow = true;
  headGrp.add(head);
  for (const s of [-1, 1]) {
    const dot = new THREE.Mesh(new THREE.CircleGeometry(0.05, 12), darkMat);
    dot.position.set(0, 0.02, s * 0.158);
    dot.rotation.y = s > 0 ? 0 : Math.PI;
    headGrp.add(dot);
  }
  const eyes = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, 0.16), darkMat);
  eyes.position.set(0.155, 0.03, 0);
  headGrp.add(eyes);
  // belt
  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.05, 0.03), darkMat);
  belt.position.set(0.03, 0.4, 0.17);
  belt.rotation.z = -0.9;
  upper.add(belt);
  // arms to the wheel rim
  for (const s of [-1, 1]) {
    const arm = limb(0.05, dummyMat);
    segment(arm, V(0.06, 0.6, s * 0.21), V(0.82, 0.62, s * 0.17));
    upper.add(arm);
  }
}
// legs (static)
for (const s of [-1, 1]) {
  const thigh = limb(0.07, dummyMat);
  segment(thigh, V(-0.55, 0.8, s * 0.12), V(0.05, 0.86, s * 0.13));
  cockpit.add(thigh);
  const shin = limb(0.06, dummyMat);
  segment(shin, V(0.05, 0.86, s * 0.13), V(0.22, 0.46, s * 0.13));
  cockpit.add(shin);
}

// hook pillow, tied to the wheel
const pillow = new THREE.Group();
cockpit.add(pillow);
{
  const p = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), flat(0xff9fc2));
  p.scale.set(0.16, 0.42, 0.5);
  p.castShadow = true;
  pillow.add(p);
  for (const y of [-0.16, 0.16]) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(1, 0.1, 6, 20), flat(0xc9a46b));
    band.rotation.x = Math.PI / 2;
    band.scale.set(0.17, 0.5, 0.35);
    band.position.y = y;
    pillow.add(band);
  }
  pillow.position.set(0.12, 1.56, 0);
  pillow.rotation.z = -0.3;
}

// crash sensor: housing in the nose, mass on a spring
const SENS = V(1.72, 0.66, 0);
const sensor = new THREE.Group();
sensor.position.copy(SENS);
cockpit.add(sensor);
const pcbMat = flat(0x1f8a4c, { emissive: 0x3dff7a, emissiveIntensity: 0 });
const massMat = flat(0xff7a2f, { emissive: 0xff5a10, emissiveIntensity: 0.3 });
const mass = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.11, 0.11), massMat);
const spring = new THREE.Group();
{
  const pcb = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.34), pcbMat);
  pcb.position.y = -0.11;
  sensor.add(pcb);
  const housing = new THREE.Mesh(
    new THREE.BoxGeometry(0.46, 0.2, 0.3),
    new THREE.MeshStandardMaterial({
      color: 0xdff4ff,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
    }),
  );
  sensor.add(housing);
  const wallBack = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.2, 0.3), darkMat);
  wallBack.position.x = -0.22;
  sensor.add(wallBack);
  const pts = [];
  for (let k = 0; k <= 120; k++) {
    const f = k / 120;
    const a = f * Math.PI * 2 * 7;
    pts.push(V(f, Math.sin(a) * 0.035, Math.cos(a) * 0.035));
  }
  const coil = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.007, 5),
    M.chrome,
  );
  spring.add(coil);
  spring.position.x = -0.205;
  sensor.add(spring);
  sensor.add(mass);
}
const forceArrow = makeArrowSet([[V(-0.05, 0.22, 0), V(0.25, 0.22, 0)]], {
  parent: sensor,
  mat: forceMat,
  amp: 0,
  r: 0.018,
});

// control unit (ECU) under the dashboard + wires
const ECU = V(0.98, 0.62, 0);
const ecu = new THREE.Group();
ecu.position.copy(ECU);
cockpit.add(ecu);
const ledMat = flat(0x3dff7a, { emissive: 0x3dff7a, emissiveIntensity: 0.8 });
{
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.17, 0.3), flat(0x30363f));
  box.castShadow = true;
  ecu.add(box);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.012, 0.24), flat(0x1f8a4c));
  lid.position.y = 0.09;
  ecu.add(lid);
  for (let i = 0; i < 3; i++) {
    const ic = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.06), darkMat);
    ic.position.set(-0.09 + i * 0.08, 0.1, -0.04);
    ecu.add(ic);
  }
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), ledMat);
  led.position.set(0.1, 0.11, 0.07);
  ecu.add(led);
}
const wireMat = flat(0x2f9bff, { emissive: 0x2f9bff, emissiveIntensity: 0.4 });
function wire(points) {
  const curve = new THREE.CatmullRomCurve3(points);
  const geo = new THREE.TubeGeometry(curve, 60, 0.014, 6);
  const mesh = new THREE.Mesh(geo, wireMat);
  mesh.userData.curve = curve;
  cockpit.add(mesh);
  return mesh;
}
const wireA = wire([V(1.48, 0.6, 0.05), V(1.3, 0.52, 0.12), V(1.16, 0.6, 0.06)]);
const wireB = wire([
  V(0.8, 0.64, 0.06),
  V(0.7, 0.85, 0.06),
  V(0.6, 1.12, 0.04),
  V(0.4, 1.32, 0.02),
]);
const grow = (mesh, k) => {
  mesh.visible = k > 0.01;
  mesh.geometry.setDrawRange(0, Math.ceil(k * 60) * 6 * 6);
};
const PULSE_N = 4;
const pulseMat = new THREE.MeshBasicMaterial({ color: 0xbfe8ff });
const pulses = [];
for (let i = 0; i < PULSE_N * 2; i++) {
  const p = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), pulseMat);
  cockpit.add(p);
  pulses.push(p);
}

// gas particles (nitrogen fill + venting) and snow burst at the crash
const GN = 70;
const gas = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(1, 0),
  new THREE.MeshBasicMaterial({ color: 0x7cc7ff, transparent: true, opacity: 0.8 }),
  GN,
);
gas.frustumCulled = false;
cockpit.add(gas);
const SN = 50;
const snowBurst = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), flat(0xffffff), SN);
snowBurst.frustumCulled = false;
scene.add(snowBurst);
const gr = rng(11);
const gasSeed = Array.from({ length: GN }, () => [gr() * 2 - 1, gr() * 2 - 1, gr() * 2 - 1, gr()]);
const snSeed = Array.from({ length: SN }, () => [gr(), gr() * 2 - 1, gr(), gr()]);

// ---------------------------------------------------------------- bus analogy
const BS = V(-5, 0, 2.7);
const busSet = new THREE.Group();
busSet.position.copy(BS);
busSet.rotation.y = 0.25;
scene.add(busSet);
const bus = new THREE.Group();
busSet.add(bus);
const rider = new THREE.Group();
{
  const yellow = flat(0xffc928);
  const floor = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.08, 0.8), flat(0x6b7280));
  floor.position.y = 0.3;
  bus.add(floor);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.08, 0.8), yellow);
  roof.position.y = 1.2;
  roof.castShadow = true;
  bus.add(roof);
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.9, 0.05), yellow);
  backWall.position.set(0, 0.75, -0.38);
  bus.add(backWall);
  const win = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.3, 0.02), flat(0xbfe6ff));
  win.position.set(0, 0.92, -0.35);
  bus.add(win);
  for (const s of [-1, 1]) {
    const end = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.9, 0.8), yellow);
    end.position.set(s * 0.95, 0.75, 0);
    bus.add(end);
  }
  const skirt = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.18, 0.05), yellow);
  skirt.position.set(0, 0.38, 0.38);
  bus.add(skirt);
  for (const sx of [-0.6, 0.6])
    for (const sz of [-0.4, 0.4]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.1, 12), M.rubber);
      w.rotation.x = Math.PI / 2;
      w.position.set(sx, 0.17, sz);
      bus.add(w);
    }
  const pole = limb(0.02, M.chrome);
  segment(pole, V(0.2, 0.34, 0.05), V(0.2, 1.16, 0.05));
  bus.add(pole);
  // you, standing
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.3, 4, 8), flat(0xff7a5c));
  body.position.y = 0.42;
  body.castShadow = true;
  rider.add(body);
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 1), flat(0xf0b08a));
  head.position.y = 0.72;
  rider.add(head);
  for (const s of [-1, 1]) {
    const leg = limb(0.04, flat(0x3c5a99));
    segment(leg, V(0, 0.25, s * 0.06), V(0, 0.0, s * 0.06));
    rider.add(leg);
  }
  rider.position.set(-0.15, 0.34, 0.05);
  bus.add(rider);
}

// ---------------------------------------------------------------- shots
const shots = [
  { at: 0, from: [1.3, 1.7, 2.0], to: [1.0, 1.6, 1.7], look: [-0.1, 1.2, 0] },
  { at: T.airbag1, from: [2.6, 2.0, 3.4], to: [2.2, 1.8, 3.0], look: [-0.1, 1.0, 0] },
  {
    at: T.aber1,
    from: [-1.5, 1.95, 0.55],
    to: [-1.35, 1.9, 0.45],
    look: [0.6, 1.45, 0],
    zoom: 1.15,
  },
  { at: T.also1, from: [3.4, 2.5, 5.4], to: [2.9, 2.2, 4.7], look: [0, 1.0, 0] },
  {
    at: T.nylonsack,
    from: [0.6, 1.85, 1.45],
    to: [0.45, 1.75, 1.25],
    look: [0.25, 1.4, 0],
    zoom: 1.25,
  },
  { at: T.kracht, from: [1.0, 1.4, 4.4], to: [0.3, 1.3, 4.0], look: [0.2, 0.9, 0] },
  { at: T.chip, from: [2.0, 1.05, 1.3], to: [1.9, 0.98, 1.15], look: [1.72, 0.66, 0], zoom: 1.2 },
  { at: T.stoppt, from: [1.6, 1.4, 5.0], to: [1.0, 1.3, 4.6], look: [0.4, 0.8, 0] },
  {
    at: T.schwingt,
    from: [1.55, 0.98, 1.2],
    to: [1.6, 0.94, 1.08],
    look: [1.72, 0.66, 0],
    zoom: 1.2,
  },
  { at: T.bus, from: [1.5, 1.2, 2.6], to: [1.2, 1.1, 2.2], look: [0, 0.6, 0], rel: BS },
  { at: T.crashsensor, orbit: { c: [1.72, 0.7, 0], r: 1.5, y: 1.3, a0: 0.45, a1: -0.05 } },
  {
    at: T.computer,
    from: [1.6, 1.15, 1.6],
    to: [1.45, 1.05, 1.4],
    look: [0.98, 0.66, 0],
    zoom: 1.3,
  },
  { at: T.schlagloch, from: [1.6, 0.6, 3.6], to: [0.8, 0.55, 3.3], look: [0.6, 0.45, 0] },
  { at: T.steuergeraet, orbit: { c: [0.9, 0.9, 0], r: 2.2, y: 1.6, a0: 0.9, a1: 0.3 } },
  { at: T.bei, from: [4.8, 2.1, 3.8], to: [4.3, 1.9, 3.3], look: [1.2, 0.9, 0] },
  {
    at: T.tablette,
    from: [0.55, 1.65, 0.95],
    to: [0.5, 1.6, 0.85],
    look: [0.3, 1.38, 0],
    zoom: 1.2,
  },
  {
    at: T.blitzschnell,
    from: [0.3, 1.75, 2.2],
    to: [0.2, 1.7, 2.0],
    look: [0, 1.45, 0],
    zoom: 1.35,
  },
  { at: T.gasgenerator, orbit: { c: [0, 1.35, 0], r: 2.6, y: 2.0, a0: 0.8, a1: 0.1 } },
  { at: T.wand, from: [-0.1, 1.65, 2.2], to: [-0.1, 1.62, 2.0], look: [-0.1, 1.5, 0], zoom: 1.3 },
  {
    at: T.loecher,
    from: [0.55, 1.85, 1.5],
    to: [0.45, 1.8, 1.35],
    look: [0.05, 1.45, 0.2],
    zoom: 1.2,
  },
  { at: T.taucht, from: [0.6, 1.8, 2.9], to: [0.3, 1.7, 2.6], look: [-0.1, 1.4, 0] },
  { at: T.schau, from: [2.4, 2.2, 4.4], to: [1.9, 2.0, 3.8], look: [0, 1.2, 0] },
  {
    at: T.gerade,
    from: [3.2, 2.6, 5.2],
    to: [9.5, 7.8, 15],
    look: [0, 1.2, 0],
    lookTo: [0, 0.6, 0],
  },
];
const applyCamera = shotCamera(shots);

// ---------------------------------------------------------------- render
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = V(1, 1, 1);
const _v = V(0, 0, 0);
const bump = (d) => Math.max(0, 1 - Math.abs(d) / 0.4);

function renderAt(t) {
  const s = S(t);

  // road scroll ---------------------------------------------------
  const span = DASH_N * DASH_GAP;
  dashes.forEach((d, i) => {
    const x = (((i * DASH_GAP - s) % span) + span) % span;
    d.position.x = x - span / 2;
  });
  const holeX = 1.35 + (S_HOLE - s);
  hole.position.x = holeX;
  hole.visible = holeX < 30 && holeX > -30;
  const barX = 2.5 + (S_CRASH - s);
  barrier.position.x = barX;
  barrier.visible = barX < 30;

  // rig: pothole bumps + crash pitch
  const bumpF = bump(holeX - 1.35);
  const bumpR = bump(holeX + 1.35);
  rig.position.y = 0.07 * Math.sin(Math.PI * (bumpF + bumpR)) * (bumpF + bumpR > 0 ? 1 : 0);
  rig.rotation.z = 0.03 * (bumpF - bumpR) - 0.05 * Math.max(0, swing(t, T.crash, 9, 4));
  rig.position.x = 0.12 * Math.max(0, swing(t, T.crash, 9, 4));
  wheels.forEach((w) => (w.rotation.z = -s / 0.36));

  // hook: pillow, then shrink away -------------------------------
  const pOut = inBack(ramp(t, T.also1, T.also1 + 0.35));
  show(pillow, 1 - pOut);

  // car body pops in, x-ray while explaining
  show(carBody, outBack(ramp(t, T.also1 + 0.15, T.also1 + 0.75)));
  setXray(
    shellMats,
    smooth(ramp(t, T.also1 + 0.6, T.nylonsack)) * (1 - smooth(ramp(t, T.schau, T.schau + 0.5))),
  );

  // nylon sheet folds into the hub
  const fold = smooth(ramp(t, T.nylonsack - 0.1, T.lenkrad2 + 0.2));
  sheet.visible = t >= T.faltest && fold < 0.98;
  if (sheet.visible) {
    const sIn = outBack(ramp(t, T.faltest, T.faltest + 0.4));
    sheet.position.set(lerp(-0.05, 0.27, fold), lerp(1.75, 1.37, fold), lerp(0.35, 0, fold));
    sheet.rotation.set(0, Math.PI / 2 - 0.2 + fold * 0.2, lerp(0.3, -0.42, fold));
    const sc = Math.max(0.001, sIn * lerp(0.75, 0.12, fold));
    sheet.scale.set(sc, sc * lerp(1, 0.6, fold), 1);
  }
  const inflate = smooth(ramp(t, T.blitzschnell, T.prall + 0.1));
  folded.visible = fold > 0.9 && inflate < 0.05;
  nylonMat.emissive.setHex(0x9fdcff);
  nylonMat.emissiveIntensity = 0.6 * pop(t, T.lenkrad2, T.kracht + 0.6);

  // crash sensor --------------------------------------------------
  show(sensor, outBack(ramp(t, T.chip, T.chip + 0.4)));
  pcbMat.emissiveIntensity = 1.2 * pop(t, T.chip, T.computer);
  const dx =
    0.08 * swing(t, T.stoppt + 0.05, 11, 2.6) +
    0.1 * swing(t, T.crash, 12, 2.6) +
    0.02 * Math.sin(t * 40) * pop(t, T.schlagloch, T.steuergeraet) * bumpF;
  mass.position.x = 0.06 + dx;
  spring.scale.x = Math.max(0.05, mass.position.x - 0.055 + 0.205);
  massMat.emissiveIntensity = 0.3 + 1.2 * pop(t, T.feder, T.stoppt, 0.2);
  animateArrows(
    forceArrow,
    t,
    Math.max(pop(t, T.stoppt + 0.05, T.bus, 0.2), pop(t, T.crash, T.zuendet, 0.2)),
  );

  // control unit + wires -----------------------------------------
  show(ecu, outBack(ramp(t, T.computer, T.computer + 0.4)));
  grow(wireA, smooth(ramp(t, T.computer + 0.2, T.prueft + 0.3)));
  grow(wireB, smooth(ramp(t, T.steuergeraet, T.steuergeraet + 0.6)));
  const alarm = t >= T.crash && t < T.prall + 0.5;
  ledMat.color.setHex(alarm ? 0xff3b2f : 0x3dff7a);
  ledMat.emissive.setHex(alarm ? 0xff3b2f : 0x3dff7a);
  ledMat.emissiveIntensity = alarm ? 1.4 * (0.6 + 0.4 * Math.sin(t * 30)) : 0.8;
  wireMat.emissiveIntensity = 0.4 + 1.4 * pop(t, T.crash, T.blitzschnell, 0.2);
  // signal pulses: sensor → ECU while checking, ECU → hub on the crash
  const pa = pop(t, T.prueft, T.steuergeraet, 0.1);
  const pb = pop(t, T.crash, T.blitzschnell, 0.1);
  pulses.forEach((p, i) => {
    const onA = i < PULSE_N;
    const k = onA ? pa : pb;
    p.visible = k > 0.05;
    if (!p.visible) return;
    const f = (((t * (onA ? 1.2 : 2.4) + (i % PULSE_N) / PULSE_N) % 1) + 1) % 1;
    p.position.copy((onA ? wireA : wireB).userData.curve.getPointAt(f));
    p.scale.setScalar(k);
  });

  // ignition: tablet glows, flash ---------------------------------
  const ign = ramp(t, T.zuendet, T.zuendet + 0.15);
  const burn = pop(t, T.zuendet, T.prall + 0.4, 0.2);
  tabletMat.emissiveIntensity = 2.5 * ign * burn * (0.8 + 0.2 * Math.sin(t * 25));
  tablet.scale.setScalar(t < T.tablette ? 1 : 1 + 0.35 * pop(t, T.tablette, T.blitzschnell, 0.2));
  flash.intensity = 5 * burn * ign;

  // dummy lean ------------------------------------------------------
  let lean = 0.06 * Math.max(0, swing(t, T.crash, 10, 5));
  const hard = t >= T.wand ? Math.max(0, swing(t, T.wand + 0.1, 13, 6)) : 0;
  lean += 0.09 * hard;
  const sink = smooth(ramp(t, T.taucht, T.entweicht + 0.3));
  const settle = smooth(ramp(t, T.weich, T.schau + 0.3));
  lean += 0.25 * sink * (1 - 0.6 * settle);
  upper.rotation.z = -lean;
  headGrp.rotation.y = -0.6 * smooth(ramp(t, T.gerade - 0.3, T.gerade + 0.5));

  // airbag ----------------------------------------------------------
  bag.visible = inflate > 0.001;
  if (bag.visible) {
    const f = outBack(inflate);
    const headFront = -0.58 + 0.08 * Math.cos(lean) + 0.9 * Math.sin(lean) + 0.16;
    const deflate = smooth(ramp(t, T.entweicht, T.schau + 0.5));
    const rx = Math.min(BAG_R.x, BAG_C.x - headFront + 0.01);
    const jig = 0.04 * hard;
    bag.scale.set(
      Math.max(0.001, f * rx),
      Math.max(0.001, f * BAG_R.y * (1 - 0.25 * deflate) * (1 + jig)),
      Math.max(0.001, f * BAG_R.z * (1 - 0.2 * deflate) * (1 + jig)),
    );
    bag.position.set(lerp(HUB.x - 0.05, BAG_C.x, f), lerp(HUB.y, BAG_C.y - 0.06 * deflate, f), 0);
  }
  const ventK = outBack(ramp(t, T.loecher, T.loecher + 0.4));
  vents.forEach((v) => v.scale.setScalar(Math.max(0.001, ventK)));
  vents.forEach((v) => (v.visible = ventK > 0.01));
  ventMat.emissiveIntensity = 1.0 * pop(t, T.loecher, T.taucht + 0.3, 0.2);
  showNope(pop(t, T.nichts, T.also1), 0.2, 2.15, 0.2, 0.45);

  // gas: fill from the hub, later out of the vents
  const fillAge = ramp(t, T.stickstoff - 0.3, T.prall + 0.3);
  const fillOn = t > T.stickstoff - 0.3 && t < T.prall + 0.3;
  const ventOn = t > T.taucht && t < T.weich + 1.0;
  for (let i = 0; i < GN; i++) {
    const [a, b, c, d] = gasSeed[i];
    let size = 0;
    if (fillOn) {
      const k = (t * 1.6 + d) % 1;
      const r = 0.05 + k * 0.28 * Math.min(1, inflate + 0.2);
      _v.set(lerp(HUB.x - 0.05, BAG_C.x + a * 0.6 * r, k), HUB.y + b * r, c * r);
      size = 0.025 * (1 - k * 0.5) * (fillAge < 1 ? 1 : 0);
    } else if (ventOn) {
      const k = (t * 0.9 + d) % 1;
      const side = c < 0 ? -1 : 1;
      const vy = b < 0 ? -0.3 : 0.25;
      _v.set(
        bag.position.x + a * 0.08,
        bag.position.y + vy * bag.scale.y + k * 0.15,
        side * (bag.scale.z + k * 0.55),
      );
      size = 0.028 * (1 - k) * pop(t, T.taucht, T.weich + 1.0, 0.3);
    }
    _s.setScalar(Math.max(1e-4, size));
    _m.compose(_v, _q.identity(), _s);
    gas.setMatrixAt(i, _m);
  }
  gas.instanceMatrix.needsUpdate = true;

  // snow burst at the impact
  const age = t - T.crash;
  for (let i = 0; i < SN; i++) {
    const [a, b, c, d] = snSeed[i];
    let size = 0;
    if (age > 0 && age < 1.2) {
      const k = age / 1.2;
      _v.set(2.3 + a * 1.4 * k, 0.5 + c * 2.0 * k - 2.4 * k * k, b * 1.4 * k);
      size = 0.06 * (1 - k) * (0.5 + d);
    }
    _s.setScalar(Math.max(1e-4, size));
    _m.compose(_v, _q.identity(), _s);
    snowBurst.setMatrixAt(i, _m);
  }
  snowBurst.instanceMatrix.needsUpdate = true;

  // bus analogy: rolls in, brakes, you tip forward
  const busOn = t > T.bus - 0.5 && t < T.crashsensor + 0.5;
  busSet.visible = t > T.also1;
  if (busOn) {
    const roll = 1 - Math.pow(1 - ramp(t, T.bus - 0.3, T.bremst), 2);
    bus.position.x = lerp(-1.2, 0, roll);
    rider.rotation.z = -0.5 * Math.max(0, swing(t, T.bremst, 7, 2.2));
  }

  // LED facts
  if (t >= T.schlagloch + 0.2 && t < T.steuergeraet) {
    showPanel(pop(t, T.schlagloch + 0.2, T.steuergeraet), "SCHLAGLOCH", "OK", LED.green);
  } else if (t >= T.crash && t < T.tablette) {
    showPanel(pop(t, T.crash, T.tablette), "CRASH ERKANNT", "JA", LED.red);
  } else if (t >= T.millisekunden && t < T.aber2) {
    showPanel(pop(t, T.millisekunden, T.aber2), "AUFGEBLASEN IN", "30 MS", LED.yellow);
  } else if (t >= T.wand && t < T.also2) {
    showPanel(pop(t, T.wand, T.also2), "PRALLER SACK", "HART", LED.red);
  } else if (t >= T.weich && t < T.schau) {
    showPanel(pop(t, T.weich, T.schau), "AUFPRALL", "WEICH", LED.green);
  } else {
    showPanel(0);
  }

  applyCamera(t);
  renderFrame();
}

start(renderAt);
