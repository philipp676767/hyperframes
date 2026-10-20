// "So funktioniert ein Airfryer". The shared world, captions anchoring,
// camera shots, LED panel and arrows live in world.js; this file only builds
// the air fryer story.
import {
  THREE,
  W,
  clamp01,
  ramp,
  lerp,
  smooth,
  easeInOut,
  outBack,
  inBack,
  pop,
  rng,
  V,
  jitter,
  scene,
  flat,
  M,
  xrayMaterial,
  xrayEdges,
  setXray,
  roundedRect,
  showNope,
  makeArrowSet,
  animateArrows,
  coldMat,
  showPanel,
  LED,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { createWorld } from "./environments.js";

Object.assign(M, {
  coil: new THREE.MeshStandardMaterial({
    color: 0x5a5a60,
    metalness: 0.6,
    roughness: 0.4,
    emissive: 0xff3a10,
    emissiveIntensity: 0,
  }),
  basket: flat(0x3a3f46, { metalness: 0.4, roughness: 0.5 }),
  bowl: flat(0x59626d, { metalness: 0.3, roughness: 0.5, side: THREE.DoubleSide }),
  waveFloor: flat(0x8a96a3, { metalness: 0.5, roughness: 0.4, side: THREE.DoubleSide }),
  fan: flat(0x2c3036, { metalness: 0.3, roughness: 0.5 }),
  fry: flat(0xffffff, { roughness: 0.7 }),
  plate: flat(0xfbf8f2, { roughness: 0.4 }),
  dryer: flat(0xff8fb1, { roughness: 0.45 }),
  bread: flat(0xe6b56a),
  toastWire: flat(0x3a3a3a, { emissive: 0xff3a10, emissiveIntensity: 0 }),
  snow: flat(0xf7fbff, { roughness: 0.6 }),
  scarf: flat(0xe0362f),
  hat: flat(0x2b2b30),
  carrot: flat(0xff7a2f),
  twister: flat(0xd8dde6),
  oil: new THREE.MeshStandardMaterial({
    color: 0xe7c93a,
    roughness: 0.15,
    transparent: true,
    opacity: 0.85,
    emissive: 0x806a10,
    emissiveIntensity: 0.15,
  }),
  display: flat(0x16181c, { emissive: 0xff6a1a, emissiveIntensity: 0 }),
  probe: new THREE.MeshStandardMaterial({
    color: 0xc8743c,
    metalness: 0.6,
    roughness: 0.35,
    emissive: 0x4fd8ff,
    emissiveIntensity: 0,
  }),
  heatGlow: new THREE.MeshBasicMaterial({
    color: 0xff6a2a,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  }),
});

// meadow, barn and fields in soft morning light
createWorld({ env: "land", sky: "morgen" });

const PALE = new THREE.Color(0xf6e7a6);
const GOLD = new THREE.Color(0xd58a2a);

// ---------------------------------------------------------------- hook: plate of fries + hair dryer
const hook = new THREE.Group();
scene.add(hook);
const HOOK_N = 14;
const hookFries = new THREE.InstancedMesh(new THREE.BoxGeometry(0.07, 0.07, 0.46), M.fry, HOOK_N);
hookFries.castShadow = true;
const hookSeed = [];
const dryer = new THREE.Group();
let dryerArrows;
{
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.5, 0.08, 24), M.plate);
  plate.position.set(0.25, 0.04, 0);
  plate.castShadow = true;
  plate.receiveShadow = true;
  hook.add(plate);
  const r = rng(41);
  for (let i = 0; i < HOOK_N; i++) {
    hookSeed.push({
      x: 0.25 + (r() - 0.5) * 0.6,
      y: 0.12 + (i % 3) * 0.06,
      z: (r() - 0.5) * 0.5,
      yaw: r() * Math.PI,
      tilt: (r() - 0.5) * 0.5,
    });
    hookFries.setColorAt(i, PALE);
  }
  hook.add(hookFries);

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.19, 0.62, 16), M.dryer);
  body.rotation.z = Math.PI / 2;
  body.castShadow = true;
  dryer.add(body);
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 0.2, 14), M.rubber);
  nozzle.rotation.z = -Math.PI / 2;
  nozzle.position.x = 0.4;
  dryer.add(nozzle);
  const grille = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.03, 14), M.rubber);
  grille.rotation.z = Math.PI / 2;
  grille.position.x = -0.32;
  dryer.add(grille);
  const grip = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.42, 0.13), M.dryer);
  grip.position.set(-0.08, -0.3, 0);
  grip.rotation.z = -0.25;
  dryer.add(grip);
  dryer.position.set(-1.05, 0.62, 0);
  dryer.rotation.z = -0.35;
  hook.add(dryer);
  dryerArrows = makeArrowSet(
    [
      [V(-0.6, 0.52, 0), V(0.05, 0.22, 0)],
      [V(-0.6, 0.58, 0.14), V(0.1, 0.3, 0.25)],
      [V(-0.6, 0.48, -0.14), V(0.1, 0.24, -0.25)],
    ],
    { parent: hook, r: 0.018 },
  );
}

// ---------------------------------------------------------------- air fryer shell
const FW = 1.8;
const FH = 2.25;
const FD = 1.7;
const FY = 0.08;
const fryer = new THREE.Group();
scene.add(fryer);

const shellMat = xrayMaterial(0x9ad7c4);
const drawerMat = xrayMaterial(0x9ad7c4);
const bodyGeo = new THREE.ExtrudeGeometry(roundedRect(FW, FH, 0.78), {
  depth: FD,
  bevelEnabled: true,
  bevelThickness: 0.05,
  bevelSize: 0.05,
  bevelSegments: 2,
  curveSegments: 8,
});
const body = new THREE.Mesh(bodyGeo, shellMat);
body.position.set(0, FY, -FD / 2);
body.castShadow = true;
fryer.add(body);
const bodyEdges = xrayEdges(bodyGeo);
bodyEdges.position.copy(body.position);
fryer.add(bodyEdges);
for (const sx of [-1, 1])
  for (const sz of [-1, 1]) {
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, FY, 8), M.rubber);
    foot.position.set(sx * 0.6, FY / 2, sz * 0.55);
    fryer.add(foot);
  }
// control panel on the upper front: small screen + round dial
const display = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.16, 0.05), M.display);
display.position.set(-0.2, FY + 1.62, FD / 2 + 0.05);
fryer.add(display);
const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.08, 20), M.rubber);
dial.rotation.x = Math.PI / 2;
dial.position.set(0.32, FY + 1.62, FD / 2 + 0.07);
fryer.add(dial);
const dialMark = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.1, 0.02), M.chrome);
dialMark.position.set(0.32, FY + 1.67, FD / 2 + 0.12);
fryer.add(dialMark);
const hardware = [display, dial, dialMark];

// drawer: front panel + handle + everything that slides out in the outro
const drawer = new THREE.Group();
fryer.add(drawer);
const frontGeo = new THREE.ExtrudeGeometry(roundedRect(1.56, 1.05, 0.22), {
  depth: 0.1,
  bevelEnabled: true,
  bevelThickness: 0.03,
  bevelSize: 0.03,
  bevelSegments: 2,
  curveSegments: 6,
});
const front = new THREE.Mesh(frontGeo, drawerMat);
front.position.set(0, FY + 0.16, FD / 2 + 0.02);
front.castShadow = true;
drawer.add(front);
const frontEdges = xrayEdges(frontGeo);
frontEdges.position.copy(front.position);
drawer.add(frontEdges);
const handle = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.5, 4, 10), M.rubber);
handle.rotation.z = Math.PI / 2;
handle.position.set(0, FY + 0.72, FD / 2 + 0.36);
handle.castShadow = true;
drawer.add(handle);
hardware.push(handle);
for (const sx of [-0.22, 0.22]) {
  const stalk = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.24), M.rubber);
  stalk.position.set(sx, FY + 0.72, FD / 2 + 0.22);
  drawer.add(stalk);
  hardware.push(stalk);
}

// ---------------------------------------------------------------- interior (seen in x-ray)
const interior = new THREE.Group();
fryer.add(interior);

// heating coil: flat spiral under the lid
const COIL_Y = 1.62;
const COIL_SEGS = 320;
const COIL_RAD = 6;
const coilPts = [];
for (let k = 0; k <= 200; k++) {
  const f = k / 200;
  const a = f * Math.PI * 2 * 4;
  const r = 0.1 + f * 0.5;
  coilPts.push(V(Math.cos(a) * r, COIL_Y + Math.sin(a * 6) * 0.012, Math.sin(a) * r));
}
const coilGeo = new THREE.TubeGeometry(
  new THREE.CatmullRomCurve3(coilPts),
  COIL_SEGS,
  0.022,
  COIL_RAD,
);
const coil = new THREE.Mesh(coilGeo, M.coil);
interior.add(coil);
const coilLight = new THREE.PointLight(0xff7a3a, 0, 3, 1.5);
coilLight.position.set(0, COIL_Y - 0.1, 0);
interior.add(coilLight);

// fan above the coil
const fan = new THREE.Group();
{
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.08, 12), M.fan);
  fan.add(hub);
  for (let i = 0; i < 6; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.02, 0.14), M.fan);
    blade.position.set(
      Math.cos((i / 6) * Math.PI * 2) * 0.27,
      0,
      Math.sin((i / 6) * Math.PI * 2) * 0.27,
    );
    blade.rotation.y = -(i / 6) * Math.PI * 2;
    blade.rotation.x = 0.35;
    fan.add(blade);
  }
  const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.18, 12), M.steel);
  motor.position.y = 0.15;
  fan.add(motor);
  fan.position.set(0, 1.88, 0);
}
interior.add(fan);

// trapped heat under the lid (before the fan exists)
const heatBlobs = [];
{
  const r = rng(7);
  for (let i = 0; i < 12; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), M.heatGlow);
    const a = r() * Math.PI * 2;
    const rad = r() * 0.5;
    m.position.set(Math.cos(a) * rad, 1.72 + r() * 0.2, Math.sin(a) * rad);
    m.userData.s = 0.16 + r() * 0.12;
    m.userData.ph = r() * 6;
    interior.add(m);
    heatBlobs.push(m);
  }
}

// thermostat probe next to the coil
const probe = new THREE.Group();
{
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.5, 6), M.steel);
  rod.position.y = 0.25;
  probe.add(rod);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), M.probe);
  probe.add(tip);
  probe.position.set(0.66, 1.42, 0.3);
}
interior.add(probe);

// solid bowl (fails) and perforated basket (works), both in the drawer
const BASKET_R = 0.58;
const B0 = 0.38;
const B1 = 1.0;
const bowl = new THREE.Group();
{
  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(BASKET_R, BASKET_R - 0.03, B1 - B0, 24, 1, true),
    M.bowl,
  );
  wall.position.y = (B0 + B1) / 2;
  bowl.add(wall);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(BASKET_R - 0.03, 24), M.bowl);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = B0;
  bowl.add(floor);
}
drawer.add(bowl);
const basket = new THREE.Group();
{
  for (let i = 0; i <= 5; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(BASKET_R, 0.014, 5, 32), M.basket);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = B0 + (i / 5) * (B1 - B0);
    basket.add(ring);
  }
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, B1 - B0, 4), M.basket);
    bar.position.set(Math.cos(a) * BASKET_R, (B0 + B1) / 2, Math.sin(a) * BASKET_R);
    basket.add(bar);
  }
  for (let i = -4; i <= 4; i++) {
    const len = 2 * Math.sqrt(Math.max(0, BASKET_R * BASKET_R - (i * 0.13) ** 2));
    for (const rot of [0, Math.PI / 2]) {
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, len, 4), M.basket);
      bar.rotation.set(Math.PI / 2, 0, rot);
      bar.position.set(rot ? 0 : i * 0.13, B0, rot ? i * 0.13 : 0);
      if (rot) bar.rotation.set(0, 0, Math.PI / 2);
      basket.add(bar);
    }
  }
}
drawer.add(basket);

// wavy floor under the basket ("Seestern" profile)
const waveGeo = new THREE.RingGeometry(0.04, 0.76, 96, 6);
{
  const p = waveGeo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const r = Math.hypot(x, y);
    const a = Math.atan2(y, x);
    p.setZ(i, 0.07 * Math.sin(a * 8) * (r / 0.76) + 0.06 * (1 - r / 0.76));
  }
  waveGeo.computeVertexNormals();
}
const waveFloor = new THREE.Mesh(waveGeo, M.waveFloor);
waveFloor.rotation.x = -Math.PI / 2;
waveFloor.position.y = 0.24;
drawer.add(waveFloor);

// fries in the basket
const FRY_N = 34;
const fries = new THREE.InstancedMesh(new THREE.BoxGeometry(0.075, 0.075, 0.44), M.fry, FRY_N);
fries.castShadow = true;
const frySeed = [];
{
  const r = rng(12);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  for (let i = 0; i < FRY_N; i++) {
    const a = r() * Math.PI * 2;
    const rad = Math.sqrt(r()) * 0.3;
    const y = B0 + 0.05 + (i / FRY_N) * 0.36;
    q.setFromEuler(new THREE.Euler((r() - 0.5) * 0.6, r() * Math.PI, (r() - 0.5) * 0.6));
    m.compose(V(Math.cos(a) * rad, y, Math.sin(a) * rad), q, V(1, 1, 1));
    fries.setMatrixAt(i, m);
    frySeed.push({ low: y < B0 + 0.16, d: r() * 0.3 });
    fries.setColorAt(i, PALE);
  }
}
drawer.add(fries);

// steam from the finished fries (outro)
const steam = [];
{
  const r = rng(55);
  for (let i = 0; i < 14; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), M.steam.clone());
    m.userData.seed = [r(), r(), r()];
    drawer.add(m);
    steam.push(m);
  }
}

// ---------------------------------------------------------------- hot-air circulation
// Path in the (radius, height) plane: out along the fan, down the wall, in
// under the basket, up through the fries, back to the fan. Each particle runs
// it in its own vertical plane; the swirl rotates the planes (tornado).
const AIR = [
  [0.22, 1.86],
  [0.7, 1.8],
  [0.74, 1.5],
  [0.74, 0.45],
  [0.6, 0.3],
  [0.2, 0.28],
  [0.1, 0.4],
  [0.1, 1.0],
  [0.12, 1.55],
  [0.22, 1.86],
];
const airLen = [0];
for (let i = 1; i < AIR.length; i++)
  airLen.push(airLen[i - 1] + Math.hypot(AIR[i][0] - AIR[i - 1][0], AIR[i][1] - AIR[i - 1][1]));
const AIR_L = airLen[airLen.length - 1];
const WALL_END = airLen[4] / AIR_L;
function airAt(f) {
  const s = f * AIR_L;
  let i = 1;
  while (i < airLen.length - 1 && airLen[i] < s) i++;
  const k = (s - airLen[i - 1]) / Math.max(1e-6, airLen[i] - airLen[i - 1]);
  return [lerp(AIR[i - 1][0], AIR[i][0], k), lerp(AIR[i - 1][1], AIR[i][1], k)];
}
const NA = 260;
const air = new THREE.InstancedMesh(
  new THREE.SphereGeometry(1, 8, 6),
  new THREE.MeshBasicMaterial({ color: 0xffffff }),
  NA,
);
air.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
air.frustumCulled = false;
interior.add(air);
const airSeed = [];
{
  const r = rng(3);
  for (let i = 0; i < NA; i++) airSeed.push([r() * Math.PI * 2, r(), r()]);
}
const C_HOT = new THREE.Color(0xff3d1f);
const C_WARM = new THREE.Color(0xffa83a);

// ---------------------------------------------------------------- analogy: toaster
const TS = V(-5.0, 0, 2.0);
const toaster = new THREE.Group();
toaster.position.copy(TS);
toaster.rotation.y = 0.5;
scene.add(toaster);
const toasts = [];
{
  const bGeo = new THREE.ExtrudeGeometry(roundedRect(1.0, 0.7, 0.18), {
    depth: 0.56,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 2,
  });
  const tb = new THREE.Mesh(bGeo, M.alu);
  tb.position.z = -0.28;
  tb.castShadow = true;
  toaster.add(tb);
  for (const sz of [-0.12, 0.12]) {
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.02, 0.09), M.rubber);
    slot.position.set(0, 0.735, sz);
    toaster.add(slot);
    for (const dz of [-0.03, 0.03]) {
      const wire = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.012, 0.012), M.toastWire);
      wire.position.set(0, 0.745, sz + dz);
      toaster.add(wire);
    }
    const toast = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.48, 0.05), M.bread);
    toast.position.set(0, 0.5, sz);
    toast.castShadow = true;
    toaster.add(toast);
    toasts.push(toast);
  }
  const lever = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.16), M.rubber);
  lever.position.set(0.55, 0.45, 0);
  toaster.add(lever);
}

// ---------------------------------------------------------------- analogy: snowman in the wind
const SM = V(5.0, 0, 1.8);
const snowman = new THREE.Group();
snowman.position.copy(SM);
scene.add(snowman);
const scarfTail = new THREE.Group();
let windArrows;
{
  const patch = new THREE.Mesh(new THREE.CircleGeometry(1.0, 20), M.snow);
  patch.rotation.x = -Math.PI / 2;
  patch.position.y = 0.02;
  patch.receiveShadow = true;
  snowman.add(patch);
  [
    [0.42, 0.4],
    [0.3, 0.98],
    [0.21, 1.38],
  ].forEach(([r, y], i) => {
    const s = new THREE.Mesh(jitter(new THREE.IcosahedronGeometry(r, 1), 0.015, 30 + i), M.snow);
    s.position.y = y;
    s.castShadow = true;
    snowman.add(s);
  });
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.2, 8), M.carrot);
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 1.38, 0.28);
  snowman.add(nose);
  for (const sx of [-0.07, 0.07]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 4), M.hat);
    eye.position.set(sx, 1.45, 0.19);
    snowman.add(eye);
  }
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.03, 14), M.hat);
  brim.position.y = 1.56;
  snowman.add(brim);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.24, 14), M.hat);
  top.position.y = 1.69;
  snowman.add(top);
  const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.045, 6, 16), M.scarf);
  scarf.rotation.x = Math.PI / 2;
  scarf.position.y = 1.2;
  snowman.add(scarf);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.08, 0.02), M.scarf);
  tail.position.x = -0.17;
  scarfTail.add(tail);
  scarfTail.position.set(-0.15, 1.18, 0.12);
  snowman.add(scarfTail);
  windArrows = makeArrowSet(
    [0.5, 0.95, 1.4].flatMap((y, i) => [
      [V(1.7, y, 0.15 - i * 0.08), V(0.45, y + 0.05, 0.15 - i * 0.08)],
      [V(1.9, y + 0.2, -0.25), V(0.6, y + 0.2, -0.2)],
    ]),
    { parent: snowman, mat: coldMat, r: 0.02, amp: 0.06 },
  );
}

// ---------------------------------------------------------------- analogy: tornado
const TN = V(-4.8, 0, -1.6);
const NT = 150;
const twister = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), M.twister, NT);
twister.frustumCulled = false;
twister.position.copy(TN);
scene.add(twister);
const twSeed = [];
{
  const r = rng(91);
  for (let i = 0; i < NT; i++) twSeed.push([r(), r(), r()]);
}

// ---------------------------------------------------------------- analogy: spoon vs. oil canister
const OS = V(4.8, 0, -1.6);
const oilSet = new THREE.Group();
oilSet.position.copy(OS);
oilSet.rotation.y = -0.4;
scene.add(oilSet);
const spoon = new THREE.Group();
{
  const can = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.0, 0.36), M.oil);
  can.position.set(0.45, 0.5, 0);
  can.castShadow = true;
  oilSet.add(can);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.12, 10), M.scarf);
  cap.position.set(0.3, 1.06, 0);
  oilSet.add(cap);
  const grip = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 6, 12, Math.PI), M.oil);
  grip.position.set(0.6, 1.0, 0);
  oilSet.add(grip);
  const stem = new THREE.Mesh(new THREE.CapsuleGeometry(0.025, 0.55, 4, 8), M.chrome);
  stem.rotation.z = Math.PI / 2;
  stem.position.set(0.2, 0, 0);
  spoon.add(stem);
  const cup = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), M.chrome);
  cup.scale.set(1, 0.35, 0.75);
  spoon.add(cup);
  const drop = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 6), M.oil);
  drop.scale.set(1, 0.25, 0.7);
  drop.position.y = 0.035;
  spoon.add(drop);
  spoon.position.set(-0.55, 0.08, 0.15);
  oilSet.add(spoon);
}

// ---------------------------------------------------------------- beats (word anchors)
const T = {
  foehn: W("Föhn"),
  airfryer1: W("Airfryer", 1),
  aber1: W("Aber", 1),
  stunde: W("Stunde"),
  blass: W("blass"),
  labbrig: W("labbrig"),
  also1: W("Also", 1),
  spirale: W("Drahtspirale"),
  deckelEnd: W("Deckel", 1, true),
  strom: W("Strom"),
  glueht: W("glüht"),
  grad1: W("200"),
  wie1: W("wie", 1),
  toaster: W("Toaster"),
  heizelement: W("Heizelement"),
  aber2: W("Aber", 2),
  haengen: W("hängen"),
  ventilator: W("Ventilator"),
  bewegte: W("Bewegte"),
  wie2: W("wie", 2),
  wind: W("Wind"),
  frieren: W("frieren"),
  geblaese: W("Gebläse"),
  jetzt: W("Jetzt"),
  pommes2: W("Pommes", 2),
  schale: W("Schale"),
  weich: W("weich"),
  also3: W("Also", 3),
  korb: W("Korb"),
  loecher: W("Löcher"),
  gitterkorb: W("Gitterkorb"),
  gewellter: W("gewellter"),
  wie3: W("wie", 3),
  tornado: W("Tornado"),
  umluft: W("Umluft"),
  warum: W("warum"),
  grad140: W("140"),
  braun: W("braun"),
  maillard: W("Maillard-Reaktion"),
  darum: W("Darum"),
  loeffel: W("Löffel"),
  liter: W("Liter"),
  damit: W("damit"),
  fuehler: W("Fühler"),
  an: W("an", 1),
  aus: W("aus", 1),
  thermostat: W("Thermostat"),
  schau: W("Schau"),
  gerade: W("gerade"),
};

// ---------------------------------------------------------------- shots
const shots = [
  { at: 0, from: [1.7, 1.2, 2.3], to: [1.3, 1.0, 1.9], look: [0, 0.3, 0] },
  { at: T.foehn, from: [-0.2, 1.0, 1.8], to: [-0.4, 0.9, 1.5], look: [-0.6, 0.45, 0], zoom: 1.6 },
  { at: T.airfryer1, from: [2.4, 1.9, 3.9], to: [2.0, 1.6, 3.3], look: [0, 0.4, 0] },
  { at: T.aber1, from: [1.9, 0.75, 1.6], to: [1.5, 0.7, 1.3], look: [0.2, 0.2, 0], zoom: 1.3 },
  { at: T.also1, from: [3.0, 2.4, 4.9], to: [2.4, 2.1, 4.1], look: [0, 1.2, 0] },
  { at: T.spirale, from: [1.3, 2.9, 2.0], to: [1.0, 2.75, 1.65], look: [0, 1.6, 0], zoom: 1.6 },
  { at: T.glueht, from: [-1.3, 2.05, 1.6], to: [-1.0, 1.95, 1.3], look: [0, 1.6, 0], zoom: 1.4 },
  { at: T.wie1, from: [1.1, 1.7, 1.4], to: [0.8, 1.5, 1.1], look: [0, 0.6, 0], rel: TS, zoom: 1.3 },
  { at: T.heizelement, orbit: { c: [0, 1.4, 0], r: 3.1, y: 2.5, a0: 0.75, a1: 0.2 } },
  { at: T.aber2, from: [1.8, 2.7, 2.2], to: [1.5, 2.5, 1.9], look: [0, 1.75, 0], zoom: 1.4 },
  { at: T.ventilator, from: [-1.3, 2.5, 1.5], to: [-1.0, 2.4, 1.2], look: [0, 1.85, 0], zoom: 1.3 },
  { at: T.bewegte, from: [0.5, 1.7, 3.0], to: [0.25, 1.5, 2.6], look: [0, 1.1, 0] },
  {
    at: T.wie2,
    from: [-1.6, 1.3, 1.8],
    to: [-1.3, 1.15, 1.5],
    look: [0, 0.8, 0],
    rel: SM,
    zoom: 1.3,
  },
  { at: T.geblaese, orbit: { c: [0, 1.3, 0], r: 3.2, y: 2.2, a0: -0.6, a1: 0.1 } },
  { at: T.jetzt, from: [1.4, 1.6, 1.9], to: [1.1, 1.4, 1.6], look: [0, 0.65, 0], zoom: 1.3 },
  { at: T.weich, from: [1.3, 0.9, 1.9], to: [1.05, 0.8, 1.6], look: [0, 0.55, 0], zoom: 1.6 },
  { at: T.korb, from: [-1.5, 1.8, 1.9], to: [-1.2, 1.6, 1.6], look: [0, 0.7, 0], zoom: 1.3 },
  { at: T.gitterkorb, from: [2.2, 1.8, 3.2], to: [1.8, 1.6, 2.7], look: [0, 0.9, 0] },
  { at: T.gewellter, from: [1.3, 0.55, 1.4], to: [1.0, 0.5, 1.15], look: [0, 0.3, 0], zoom: 1.25 },
  { at: T.wie3, from: [1.6, 1.4, 2.0], to: [1.2, 1.2, 1.7], look: [0, 1.0, 0], rel: TN },
  { at: T.umluft, orbit: { c: [0, 1.2, 0], r: 3.4, y: 2.3, a0: 0.9, a1: -0.9 } },
  { at: T.warum, from: [0.8, 1.75, 1.5], to: [0.6, 1.6, 1.2], look: [0, 0.7, 0], zoom: 1.2 },
  { at: T.braun, from: [-0.8, 1.35, 1.05], to: [-0.6, 1.25, 0.85], look: [0, 0.7, 0], zoom: 1.3 },
  { at: T.maillard, from: [2.4, 2.0, 3.4], to: [1.9, 1.8, 2.8], look: [0, 1.0, 0] },
  {
    at: T.darum,
    from: [-1.2, 1.3, 1.9],
    to: [-0.95, 1.15, 1.55],
    look: [0, 0.5, 0],
    rel: OS,
    zoom: 1.3,
  },
  { at: T.damit, from: [1.4, 2.25, 1.6], to: [1.15, 2.1, 1.3], look: [0.35, 1.55, 0.2], zoom: 1.3 },
  { at: T.thermostat, from: [3.2, 2.2, 2.3], to: [2.8, 2.0, 1.8], look: [0, 1.2, 0] },
  { at: T.schau, from: [0.9, 1.7, 3.8], to: [0.55, 1.6, 3.1], look: [0, 0.9, 0.4] },
  {
    at: T.gerade,
    from: [3.2, 2.5, 5.2],
    to: [9.5, 7.5, 15],
    look: [0, 1.2, 0],
    lookTo: [0, 0.4, 0],
  },
];
const applyCamera = shotCamera(shots);

// ---------------------------------------------------------------- helpers
// fan phase: linear spin-up over 0.6 s, then constant speed
const FAN_SPEED = 1;
function fanPhase(t) {
  const d = t - T.ventilator;
  if (d <= 0) return 0;
  return d < 0.6 ? (FAN_SPEED * d * d) / 1.2 : FAN_SPEED * (d - 0.3);
}
// tornado swirl of the circulation, starting at the wavy floor
function swirlPhase(t) {
  const d = t - T.gewellter;
  if (d <= 0) return 0;
  return d < 1 ? (d * d) / 2 : d - 0.5;
}
// thermostat: coil switches on/off from "schaltet" until the term is spoken
function coilOn(t) {
  if (t < T.an) return 1;
  if (t < T.aus) return 1;
  if (t < T.thermostat + 0.8) return Math.floor((t - T.aus) / 0.6) % 2 === 0 ? 0 : 1;
  return 1;
}

// ---------------------------------------------------------------- render
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = V(1, 1, 1);
const _v = V(0, 0, 0);
const _c = new THREE.Color();
const _e = new THREE.Euler();

function renderAt(t) {
  // hook: dryer blows, fries stay pale and go limp, then X
  const limp = smooth(ramp(t, T.aber1, T.labbrig + 0.5));
  hookSeed.forEach((f, i) => {
    _e.set(f.tilt * (1 - limp), f.yaw, 0);
    _q.setFromEuler(_e);
    _v.set(f.x, lerp(f.y, 0.1 + (i % 3) * 0.02, limp), f.z);
    _s.set(1 + limp * 0.25, 1 - limp * 0.45, 1 - limp * 0.08);
    _m.compose(_v, _q, _s);
    hookFries.setMatrixAt(i, _m);
  });
  hookFries.instanceMatrix.needsUpdate = true;
  dryer.position.y = 0.62 + Math.sin(t * 40) * 0.004;
  animateArrows(dryerArrows, t, pop(t, T.foehn - 0.2, T.also1));
  showNope(pop(t, T.labbrig, T.also1), 0.25, 1.15, 0.2);
  const hookOut = inBack(ramp(t, T.also1, T.also1 + 0.35));
  hook.visible = hookOut < 1;
  hook.scale.setScalar(Math.max(0.001, 1 - hookOut));

  // fryer pops in, x-ray while explaining
  const fIn = outBack(ramp(t, T.also1 + 0.15, T.also1 + 0.75));
  fryer.visible = fIn > 0;
  fryer.scale.setScalar(Math.max(0.001, fIn));
  const xr =
    smooth(ramp(t, T.spirale - 0.25, T.spirale + 0.3)) *
    (1 - smooth(ramp(t, T.schau, T.schau + 0.5)));
  setXray([shellMat, drawerMat], xr);
  hardware.forEach((h) => (h.visible = xr < 0.5));
  const open = easeInOut(ramp(t, T.schau + 0.3, T.schau + 1.5));
  drawer.position.z = 0.95 * open;
  interior.visible = xr > 0.02;
  const innerParts = xr > 0.02 || open > 0.02;
  bowl.visible = basket.visible = fries.visible = waveFloor.visible = innerParts;

  // coil grows, then glows
  const coilR = ramp(t, T.spirale, T.deckelEnd + 0.3);
  coil.visible = coilR > 0;
  coilGeo.setDrawRange(0, Math.ceil(coilR * COIL_SEGS) * COIL_RAD * 6);
  const heat =
    smooth(ramp(t, T.strom, T.glueht + 0.4)) *
    coilOn(t) *
    (1 - smooth(ramp(t, T.schau, T.schau + 0.6)));
  M.coil.emissiveIntensity = 2.2 * heat;
  coilLight.intensity = 5 * heat;
  M.display.emissiveIntensity = 1.2 * ramp(t, T.strom, T.strom + 0.3);

  // trapped heat under the lid until the fan pushes it down
  const trapped = pop(t, T.aber2 - 0.1, T.bewegte + 0.3, 0.5);
  M.heatGlow.opacity = 0.32 * trapped;
  heatBlobs.forEach((b) => {
    b.visible = trapped > 0;
    b.scale.setScalar(
      Math.max(0.001, b.userData.s * (0.85 + 0.15 * Math.sin(t * 3 + b.userData.ph))),
    );
  });

  // fan
  const fanIn = outBack(ramp(t, T.ventilator, T.ventilator + 0.45));
  fan.visible = fanIn > 0;
  fan.scale.setScalar(Math.max(0.001, fanIn));
  fan.rotation.y = -fanPhase(t) * 14;

  // hot-air particles
  const reveal =
    t < T.ventilator
      ? 0
      : t < T.loecher
        ? WALL_END * ramp(t, T.ventilator + 0.2, T.bewegte + 0.4)
        : lerp(WALL_END, 1, ramp(t, T.loecher, T.gitterkorb + 0.2));
  const airVis =
    ramp(t, T.ventilator + 0.2, T.ventilator + 0.6) * (1 - ramp(t, T.schau, T.schau + 0.4));
  const fp = fanPhase(t) * 0.32;
  const sw = swirlPhase(t) * 1.6;
  for (let i = 0; i < NA; i++) {
    const [a0, ph, sr] = airSeed[i];
    const f = (ph + fp) % 1;
    const [r0, y] = airAt(f);
    const r = r0 + sr * 0.25 * (1 - r0 / 0.74);
    const a = a0 + sw * (1.2 - r);
    _v.set(Math.cos(a) * r, y, Math.sin(a) * r);
    const shown = f <= reveal ? 1 : 0;
    _s.setScalar(Math.max(1e-4, 0.019 * shown * airVis));
    _m.compose(_v, _q.identity(), _s);
    air.setMatrixAt(i, _m);
    air.setColorAt(i, _c.copy(C_HOT).lerp(C_WARM, Math.sin(f * Math.PI)));
  }
  air.instanceMatrix.needsUpdate = true;
  if (air.instanceColor) air.instanceColor.needsUpdate = true;

  // bowl -> basket, wavy floor
  const friesIn = outBack(ramp(t, T.pommes2, T.pommes2 + 0.45));
  const bowlK =
    outBack(ramp(t, T.jetzt, T.jetzt + 0.45)) * (1 - inBack(ramp(t, T.korb - 0.1, T.korb + 0.25)));
  bowl.visible = bowl.visible && bowlK > 0.001;
  bowl.scale.setScalar(Math.max(0.001, bowlK));
  const basketK = outBack(ramp(t, T.korb + 0.1, T.korb + 0.55));
  basket.visible = basket.visible && basketK > 0.001;
  basket.scale.set(Math.max(0.001, basketK), 1, Math.max(0.001, basketK));
  const waveK = outBack(ramp(t, T.gewellter, T.gewellter + 0.5));
  waveFloor.visible = waveFloor.visible && waveK > 0.001;
  waveFloor.scale.setScalar(Math.max(0.001, waveK));
  showNope(t >= T.weich && t < T.also3 ? pop(t, T.weich, T.also3) : 0, 0, 1.35, 0.6, 0.45);
  if (t >= T.labbrig && t < T.also1) showNope(pop(t, T.labbrig, T.also1), 0.25, 1.15, 0.2);

  // fries: scale in, brown during Maillard
  fries.visible = fries.visible && friesIn > 0.001;
  fries.scale.setScalar(Math.max(0.001, friesIn));
  const brown = smooth(ramp(t, T.grad140, T.maillard + 0.4));
  frySeed.forEach((f, i) => {
    const k = clamp01(brown * 1.25 - f.d);
    // the bottom layer looks soggy while it sits in the closed bowl
    const soggy = f.low ? pop(t, T.weich - 0.2, T.korb + 0.3) : 0;
    fries.setColorAt(
      i,
      _c
        .copy(PALE)
        .lerp(GOLD, k)
        .lerp(new THREE.Color(0xe9e0b8), soggy * 0.7),
    );
  });
  if (fries.instanceColor) fries.instanceColor.needsUpdate = true;

  // steam over the finished fries
  steam.forEach((m) => {
    const [a, b, c2] = m.userData.seed;
    const cyc = (t * 0.5 + a) % 1;
    m.visible = open > 0.3;
    m.position.set((b - 0.5) * 0.6 + (c2 - 0.5) * 0.2 * cyc, B1 + cyc * 1.0, (c2 - 0.5) * 0.5);
    m.scale.setScalar(0.06 + cyc * 0.14);
    m.material.opacity = 0.5 * Math.sin(cyc * Math.PI) * ramp(t, T.schau + 1.0, T.schau + 1.6);
  });

  // thermostat probe
  const probeIn = outBack(ramp(t, T.fuehler, T.fuehler + 0.45));
  probe.visible = probeIn > 0;
  probe.scale.setScalar(Math.max(0.001, probeIn));
  M.probe.emissiveIntensity = 1.2 * pop(t, T.fuehler, T.schau) * (0.6 + 0.4 * Math.sin(t * 8));

  // toaster: wires glow, toast pops up
  M.toastWire.emissiveIntensity = 2 * pop(t, T.wie1, T.heizelement + 0.5);
  const toastUp = outBack(ramp(t, T.toaster + 0.25, T.toaster + 0.6));
  toasts.forEach((tt) => (tt.position.y = 0.5 + 0.28 * toastUp));
  _c.copy(new THREE.Color(0xe6b56a)).lerp(
    new THREE.Color(0xa8642a),
    ramp(t, T.wie1, T.toaster + 0.3),
  );
  M.bread.color.copy(_c);

  // snowman: wind + shiver
  const windy = pop(t, T.wie2 - 0.1, T.geblaese + 0.3);
  animateArrows(windArrows, t, windy);
  scarfTail.rotation.y = windy * (0.9 + Math.sin(t * 14) * 0.35);
  snowman.position.x =
    SM.x + (t >= T.frieren && t < T.geblaese + 0.3 ? Math.sin(t * 70) * 0.012 : 0);

  // tornado
  const tw = pop(t, T.wie3 - 0.1, T.umluft + 0.3);
  twister.visible = tw > 0;
  if (tw > 0) {
    for (let i = 0; i < NT; i++) {
      const [a, b, c2] = twSeed[i];
      const h = (a + t * 0.25) % 1;
      const ang = b * Math.PI * 2 + t * (7 - 3 * h);
      const rad = (0.08 + 0.6 * h * h) * (0.8 + 0.4 * c2);
      _v.set(Math.cos(ang) * rad, h * 2.0, Math.sin(ang) * rad);
      _s.setScalar(tw * (0.03 + 0.04 * c2));
      _q.setFromEuler(_e.set(t + a * 6, t * 1.3 + b * 6, 0));
      _m.compose(_v, _q, _s);
      twister.setMatrixAt(i, _m);
    }
    twister.instanceMatrix.needsUpdate = true;
  }

  // spoon vs. canister
  spoon.rotation.z = Math.sin(t * 3) * 0.04;
  if (t >= T.liter && t < T.damit) showNope(pop(t, T.liter, T.damit), OS.x + 0.2, 1.5, OS.z, 0.55);

  // LED panel
  if (t >= T.stunde && t < T.also1) {
    showPanel(pop(t, T.stunde, T.also1), "NACH", "60 MIN", LED.yellow);
  } else if (t >= T.grad1 && t < T.heizelement) {
    showPanel(pop(t, T.grad1, T.heizelement), "SPIRALE", "200°C", LED.red);
  } else if (t >= T.grad140 && t < T.maillard) {
    showPanel(pop(t, T.grad140, T.maillard), "BRAUN AB", "140°C", LED.yellow);
  } else if (t >= T.loeffel && t < T.damit) {
    showPanel(pop(t, T.loeffel, T.damit), "STATT 3 LITER", "1 EL", LED.green);
  } else if (t >= T.an && t < T.schau) {
    const on = coilOn(t) > 0;
    showPanel(pop(t, T.an, T.schau), "HEIZUNG", on ? "AN" : "AUS", on ? LED.green : LED.red);
  } else {
    showPanel(0);
  }

  applyCamera(t);
  renderFrame();
}

start(renderAt);
