// "Wie funktioniert ein Feuerzeug?" World, captions, camera, panel, arrows
// and labels live in world.js; this file builds the story: a big click
// lighter on a meadow at blue hour. Red see-through gas tank with liquid gas,
// a black piezo housing (x-ray) with button, spring, hammer and crystal, a
// copper wire to the spark tip, a nozzle that hisses gas and catches fire.
// Side sets: a battery that isn't needed, a mousetrap, a quartz watch with
// its vibrating crystal fork, and a flint-wheel lighter for the CTA.
import {
  THREE,
  ramp,
  smooth,
  inBack,
  pop,
  V,
  scene,
  flat,
  M,
  roundedRect,
  xrayMaterial,
  xrayEdges,
  setXray,
  showNope,
  makeArrowSet,
  animateArrows,
  forceMat,
  showPanel,
  LED,
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
  PZX,
  BTN,
  NOZ,
  TIP,
  CRY,
  HAM,
  P,
  K,
  R,
  H0,
  REBUILD,
  STRIKE,
  SNAP,
} from "./beats.js";

highlights(HIGHLIGHTS);
createWorld({ env: "insel", sky: "abend" });

Object.assign(M, {
  tank: new THREE.MeshStandardMaterial({
    color: 0xff4a3a,
    roughness: 0.12,
    metalness: 0.05,
    transparent: true,
    opacity: 0.38,
    depthWrite: false,
  }),
  liquid: new THREE.MeshStandardMaterial({
    color: 0x63d8ff,
    emissive: 0x2aa8ff,
    emissiveIntensity: 0.3,
    roughness: 0.2,
    transparent: true,
    opacity: 0.8,
  }),
  hood: new THREE.MeshStandardMaterial({ color: 0xdfe5ec, metalness: 0.75, roughness: 0.22 }),
  btn: flat(0x2b2d36, { roughness: 0.45 }),
  spring: new THREE.MeshStandardMaterial({ color: 0xb8c2cc, metalness: 0.8, roughness: 0.25 }),
  hammer: new THREE.MeshStandardMaterial({
    color: 0x9aa6b4,
    metalness: 0.7,
    roughness: 0.3,
    emissive: 0xffd23f,
    emissiveIntensity: 0,
  }),
  crystal: flat(0xd65cff, { emissive: 0xb43cff, emissiveIntensity: 0.35, roughness: 0.15 }),
  wire: new THREE.MeshStandardMaterial({
    color: 0xe0823a,
    metalness: 0.6,
    roughness: 0.3,
    emissive: 0x6fc8ff,
    emissiveIntensity: 0,
  }),
  spark: new THREE.MeshBasicMaterial({ color: 0xcfeeff }),
  sparkGlow: new THREE.MeshBasicMaterial({
    color: 0x3f9dff,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }),
  bead: new THREE.MeshBasicMaterial({ color: 0xbfeaff }),
  gas: new THREE.MeshBasicMaterial({
    color: 0xd7cbff,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
  }),
  flameO: new THREE.MeshBasicMaterial({
    color: 0xff8a1f,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
  }),
  flameI: new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.95 }),
  flameB: new THREE.MeshBasicMaterial({
    color: 0x4f8dff,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  }),
  skin: flat(0xffc6a6, { roughness: 0.55 }),
  nail: flat(0xf9dcd4, { roughness: 0.3 }),
  batBody: flat(0x2b2b31, { roughness: 0.5 }),
  batTop: new THREE.MeshStandardMaterial({ color: 0xd99a2b, metalness: 0.6, roughness: 0.3 }),
  cheese: flat(0xffc83a),
  trapWire: new THREE.MeshStandardMaterial({ color: 0xcfd6dd, metalness: 0.8, roughness: 0.25 }),
  face: flat(0xfffaf0, { roughness: 0.5 }),
  strap: flat(0x7a4a2b, { roughness: 0.7 }),
  hand: flat(0x22232b),
  secHand: flat(0xff3b30),
  blue: new THREE.MeshStandardMaterial({
    color: 0x2f7dff,
    roughness: 0.12,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
  }),
  flint: flat(0xff9a2e, { emissive: 0xff7a10, emissiveIntensity: 1.2 }),
});

const TINY = V(1e-3, 1e-3, 1e-3);
function hash(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
function mesh(geo, mat, parent, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
function glassy(m, order = 2) {
  m.castShadow = false;
  m.renderOrder = order;
  m.userData.noAO = true;
  return m;
}
function setPop(group, t, a, b) {
  const k = pop(t, a, b);
  group.visible = k > 0.001;
  group.scale.copy(t >= a ? squash(t, a).multiplyScalar(k) : TINY);
}
const _m = new THREE.Matrix4();
const _s = V(1, 1, 1);
const _q = new THREE.Quaternion();
const _p = V(0, 0, 0);

// ---------------------------------------------------------------- the lighter
const lighter = new THREE.Group();
scene.add(lighter);

// gas tank: red see-through plastic
const tankGeo = new THREE.ExtrudeGeometry(roundedRect(1.0, 1.75, 0.2), {
  depth: 0.4,
  bevelEnabled: true,
  bevelThickness: 0.06,
  bevelSize: 0.05,
  bevelSegments: 3,
  curveSegments: 10,
});
tankGeo.translate(0, 0.1, -0.2);
glassy(mesh(tankGeo, M.tank, lighter), 4);

// liquid gas (left part of the tank, the piezo housing takes the right)
const LIQ_Y0 = 0.2;
const LIQ_H = 1.15;
const liqGeo = new THREE.BoxGeometry(0.58, 1, 0.44);
liqGeo.translate(0, 0.5, 0);
const liquid = glassy(mesh(liqGeo, M.liquid, lighter, -0.17, LIQ_Y0, 0), 1);
const NBUB = 26;
const bubbles = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), M.gas, NBUB);
bubbles.renderOrder = 2;
lighter.add(bubbles);

// piezo housing (black, x-ray) and the chassis on top
const xmats = [];
const housingMat = xrayMaterial(0x2a2b33);
const chassisMat = xrayMaterial(0x30323c);
xmats.push(housingMat, chassisMat);
const housingGeo = new THREE.BoxGeometry(0.32, 1.02, 0.36);
const housing = mesh(housingGeo, housingMat, lighter, PZX, 1.39, 0);
const hEdges = xrayEdges(housingGeo);
hEdges.position.copy(housing.position);
lighter.add(hEdges);
const chassisGeo = new THREE.BoxGeometry(1.06, 0.12, 0.5);
const chassis = mesh(chassisGeo, chassisMat, lighter, 0, 1.92, 0);
const cEdges = xrayEdges(chassisGeo);
cEdges.position.copy(chassis.position);
lighter.add(cEdges);

// chrome wind guard (back + sides, front open so the nozzle and spark show)
const hood = new THREE.Group();
lighter.add(hood);
mesh(new THREE.BoxGeometry(0.62, 0.62, 0.03), M.hood, hood, -0.18, 2.29, -0.22);
mesh(new THREE.BoxGeometry(0.03, 0.62, 0.46), M.hood, hood, -0.5, 2.29, 0);
mesh(new THREE.BoxGeometry(0.03, 0.62, 0.46), M.hood, hood, 0.13, 2.29, 0);
for (let i = 0; i < 3; i++) {
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.035, 10), M.btn);
  hole.position.set(-0.5 - 0.016, 2.18 + i * 0.13, -0.08 + (i % 2) * 0.12);
  hole.rotation.y = -Math.PI / 2;
  hood.add(hole);
}

// nozzle + valve stem (lifts when the valve opens)
const nozzle = new THREE.Group();
lighter.add(nozzle);
mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.28, 16), M.hood, nozzle, NOZ[0], NOZ[1] - 0.14, 0);
mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 10), M.hood, nozzle, NOZ[0], 1.68, 0);
mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 12), M.btn, nozzle, NOZ[0], NOZ[1] + 0.005, 0);
// lever from the button to the nozzle
const lever = mesh(new THREE.BoxGeometry(0.5, 0.035, 0.1), M.hood, lighter, 0.02, 2.02, 0.12);

// button
const button = new THREE.Group();
lighter.add(button);
{
  const g = new THREE.ExtrudeGeometry(roundedRect(0.36, 0.26, 0.06), {
    depth: 0.34,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.02,
    bevelSegments: 2,
  });
  g.translate(0, BTN[1] - 0.26, -0.17);
  mesh(g, M.btn, button, PZX, 0, 0);
}
const BTN_TRAVEL = 0.14;

// piezo unit inside the housing: plunger, spring, hammer, crystal, anvil
const plunger = mesh(
  new THREE.CylinderGeometry(0.035, 0.035, 0.32, 10),
  M.spring,
  lighter,
  PZX,
  1.78,
  0,
);
const springPts = [];
const SPRING_TURNS = 7;
for (let k = 0; k <= 140; k++) {
  const f = k / 140;
  const a = f * Math.PI * 2 * SPRING_TURNS;
  springPts.push(V(Math.cos(a) * 0.085, f, Math.sin(a) * 0.085));
}
const springGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(springPts), 280, 0.014, 6);
const spring = mesh(springGeo, M.spring, lighter, PZX, 0, 0);
const hammer = mesh(new THREE.BoxGeometry(0.2, 0.14, 0.2), M.hammer, lighter, ...HAM);
const crystalGeo = new THREE.BoxGeometry(0.16, 0.18, 0.16);
const crystal = mesh(crystalGeo, M.crystal, lighter, ...CRY);
mesh(new THREE.BoxGeometry(0.24, 0.04, 0.24), M.spring, lighter, PZX, CRY[1] - 0.11, 0);

// copper wire from the crystal to the spark tip
const wireCurve = new THREE.CatmullRomCurve3(
  [
    V(PZX, CRY[1] - 0.13, 0.05),
    V(PZX - 0.02, CRY[1] - 0.2, 0.22),
    V(0.06, CRY[1] - 0.2, 0.24),
    V(0.03, 1.6, 0.24),
    V(0.02, 2.05, 0.24),
    V(0.08, 2.38, 0.16),
    V(...TIP),
  ],
  false,
  "centripetal",
);
mesh(new THREE.TubeGeometry(wireCurve, 120, 0.02, 8), M.wire, lighter);
mesh(new THREE.SphereGeometry(0.035, 10, 8), M.wire, lighter, ...TIP);
const NBEAD = 12;
const beads = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), M.bead, NBEAD);
beads.userData.noAO = true;
lighter.add(beads);

// spark: four pre-built zigzag variants between the tip and the nozzle rim
const SPARK_B = V(NOZ[0] + 0.05, NOZ[1] + 0.01, 0.01);
const sparks = [];
for (let v = 0; v < 4; v++) {
  const a = V(...TIP);
  const pts = [a.clone()];
  for (let i = 1; i < 6; i++) {
    const f = i / 6;
    const p = a.clone().lerp(SPARK_B, f);
    p.y += (hash(v * 13 + i) - 0.5) * 0.14;
    p.z += (hash(v * 7 + i + 3) - 0.5) * 0.12;
    pts.push(p);
  }
  pts.push(SPARK_B.clone());
  const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.1);
  const g = new THREE.Group();
  g.add(glassy(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.02, 5), M.spark), 6));
  g.add(glassy(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.042, 6), M.sparkGlow), 5));
  // two short side branches
  for (let b = 0; b < 2; b++) {
    const s0 = pts[2 + b * 2];
    const bp = [s0.clone()];
    for (let j = 1; j <= 3; j++) {
      bp.push(
        s0
          .clone()
          .add(V((hash(v * 31 + b * 5 + j) - 0.5) * 0.12 * j, (b ? 0.06 : -0.06) * j, 0.04 * j)),
      );
    }
    const bc = new THREE.CatmullRomCurve3(bp, false, "catmullrom", 0.1);
    g.add(glassy(new THREE.Mesh(new THREE.TubeGeometry(bc, 10, 0.011, 4), M.spark), 6));
    g.add(glassy(new THREE.Mesh(new THREE.TubeGeometry(bc, 10, 0.035, 5), M.sparkGlow), 5));
  }
  g.visible = false;
  lighter.add(g);
  sparks.push(g);
}
const NBURST = 18;
const burst = new THREE.InstancedMesh(new THREE.OctahedronGeometry(1, 0), M.spark, NBURST);
burst.userData.noAO = true;
lighter.add(burst);
const sparkLight = new THREE.PointLight(0x9fdcff, 0, 4, 1.5);
sparkLight.position.set(-0.1, 2.35, 0.2);
lighter.add(sparkLight);

// tiny crackles on the crystal when it is squeezed
const crackles = [];
for (let v = 0; v < 3; v++) {
  const side = v % 2 ? 1 : -1;
  const pts = [];
  for (let i = 0; i <= 4; i++) {
    pts.push(
      V(
        PZX + side * (0.09 + (hash(v * 5 + i) - 0.5) * 0.05),
        CRY[1] - 0.09 + i * 0.045,
        0.09 + (hash(v * 3 + i + 1) - 0.5) * 0.05,
      ),
    );
  }
  const g = glassy(
    new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 0.007, 4), M.spark),
    6,
  );
  g.visible = false;
  lighter.add(g);
  crackles.push(g);
}

// gas jet out of the nozzle
const NGAS = 46;
const gasJet = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), M.gas, NGAS);
gasJet.renderOrder = 3;
gasJet.userData.noAO = true;
lighter.add(gasJet);

// flame
const flame = new THREE.Group();
flame.position.set(NOZ[0], NOZ[1] + 0.02, 0);
lighter.add(flame);
{
  const prof = [
    [0, 0],
    [0.1, 0.06],
    [0.15, 0.2],
    [0.13, 0.4],
    [0.08, 0.6],
    [0.0, 0.85],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const geo = new THREE.LatheGeometry(prof, 14);
  flame.add(glassy(new THREE.Mesh(geo, M.flameO), 7));
  const inner = glassy(new THREE.Mesh(geo, M.flameI), 8);
  inner.scale.set(0.55, 0.6, 0.55);
  inner.position.y = 0.02;
  flame.add(inner);
  const base = glassy(new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 8), M.flameB), 8);
  base.scale.set(1, 0.8, 1);
  base.position.y = 0.05;
  flame.add(base);
}
const flameLight = new THREE.PointLight(0xff9a3a, 0, 9, 1.4);
flameLight.position.set(NOZ[0], NOZ[1] + 0.5, 0.3);
lighter.add(flameLight);

// gas cloud that gets squeezed into the tank
const cloud = new THREE.Group();
lighter.add(cloud);
const puffs = [];
for (let i = 0; i < 14; i++) {
  const m = glassy(new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), M.gas), 3);
  const a = hash(i) * Math.PI * 2;
  const r = 0.2 + hash(i + 3) * 0.45;
  m.userData = {
    x: Math.cos(a) * r,
    y: (hash(i + 5) - 0.5) * 0.5,
    z: Math.sin(a) * r * 0.6,
    s: 0.16 + hash(i + 7) * 0.14,
  };
  cloud.add(m);
  puffs.push(m);
}
const CLOUD_Y = 2.85;
const squeezeArrows = makeArrowSet(
  [
    [V(-1.75, CLOUD_Y, 0.1), V(-0.85, CLOUD_Y, 0.1)],
    [V(1.75, CLOUD_Y, 0.1), V(0.85, CLOUD_Y, 0.1)],
  ],
  { parent: lighter, mat: forceMat, amp: 0, r: 0.045 },
);
const crystalArrows = makeArrowSet(
  [
    [V(PZX + 0.45, CRY[1] + 0.32, 0.3), V(PZX + 0.14, CRY[1] + 0.1, 0.22)],
    [V(PZX + 0.45, CRY[1] - 0.32, 0.3), V(PZX + 0.14, CRY[1] - 0.1, 0.22)],
  ],
  { parent: lighter, mat: forceMat, amp: 0, r: 0.022 },
);

// ---------------------------------------------------------------- thumb
// pivot = thumb tip on the button; the thumb leans in from the upper right
const thumb = new THREE.Group();
lighter.add(thumb);
const thumbArm = new THREE.Group();
thumbArm.rotation.z = -0.55;
thumb.add(thumbArm);
mesh(new THREE.CapsuleGeometry(0.19, 1.6, 6, 14), M.skin, thumbArm, 0, 1.0, 0);
{
  const nail = mesh(new THREE.BoxGeometry(0.035, 0.26, 0.24), M.nail, thumbArm, -0.17, 0.32, 0);
  nail.rotation.z = 0.06;
  const knuckle = mesh(new THREE.SphereGeometry(0.23, 14, 10), M.skin, thumbArm, 0.02, 0.95, 0);
  knuckle.scale.set(1, 1.2, 1);
}

// ---------------------------------------------------------------- battery (hook)
const battery = new THREE.Group();
battery.position.set(1.35, 0, 0.9);
scene.add(battery);
mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.5, 20), M.batBody, battery, 0, 0.25, 0);
mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.2, 20), M.batTop, battery, 0, 0.6, 0);
mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 12), M.batTop, battery, 0, 0.73, 0);

// ---------------------------------------------------------------- mousetrap
const trap = new THREE.Group();
trap.position.set(...P);
scene.add(trap);
mesh(new THREE.BoxGeometry(1.5, 0.1, 0.75), M.wood, trap, 0, 0.05, 0);
for (const z of [-0.2, 0.2]) {
  const c = mesh(new THREE.TorusGeometry(0.07, 0.02, 6, 16), M.trapWire, trap, 0, 0.15, z);
  c.rotation.y = Math.PI / 2;
}
const cheese = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.14, 3), M.cheese, trap, 0.52, 0.17, 0);
cheese.rotation.y = 0.4;
const bar = new THREE.Group();
bar.position.set(0, 0.15, 0);
trap.add(bar);
{
  const arm = new THREE.CylinderGeometry(0.018, 0.018, 0.62, 8);
  arm.rotateZ(Math.PI / 2);
  for (const z of [-0.3, 0.3]) mesh(arm, M.trapWire, bar, -0.31, 0, z);
  const cross = new THREE.CylinderGeometry(0.018, 0.018, 0.62, 8);
  cross.rotateX(Math.PI / 2);
  mesh(cross, M.trapWire, bar, -0.62, 0, 0);
}
const trapArrow = makeArrowSet([[V(0.8, 0.8, 0.35), V(0.3, 0.38, 0.35)]], {
  parent: trap,
  mat: forceMat,
  amp: 0,
  r: 0.035,
});

// ---------------------------------------------------------------- quartz watch
const watch = new THREE.Group();
watch.position.set(...K);
scene.add(watch);
const WC = 1.0; // watch face centre height
{
  mesh(new THREE.BoxGeometry(0.5, 0.8, 0.08), M.strap, watch, 0, WC + 0.95, -0.02);
  mesh(new THREE.BoxGeometry(0.5, 0.64, 0.08), M.strap, watch, 0, WC - 0.68, -0.02);
  mesh(new THREE.BoxGeometry(0.62, 0.06, 0.5), M.strap, watch, 0, 0.03, 0.12);
  const caseG = new THREE.CylinderGeometry(0.62, 0.62, 0.18, 36);
  caseG.rotateX(Math.PI / 2);
  mesh(caseG, M.hood, watch, 0, WC, 0);
  const faceG = new THREE.CylinderGeometry(0.54, 0.54, 0.02, 36);
  faceG.rotateX(Math.PI / 2);
  mesh(faceG, M.face, watch, 0, WC, 0.09);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const tk = mesh(new THREE.BoxGeometry(0.03, i % 3 ? 0.06 : 0.11, 0.01), M.hand, watch);
    tk.position.set(Math.sin(a) * 0.45, WC + Math.cos(a) * 0.45, 0.105);
    tk.rotation.z = -a;
  }
  mesh(new THREE.BoxGeometry(0.06, 0.14, 0.06), M.hood, watch, 0.66, WC, 0); // crown
}
function handMesh(len, w, mat, z) {
  const g = new THREE.BoxGeometry(w, len, 0.01);
  g.translate(0, len / 2 - 0.04, 0);
  const m = mesh(g, mat, watch, 0, WC, z);
  m.castShadow = false;
  return m;
}
const hourHand = handMesh(0.3, 0.05, M.hand, 0.11);
const minHand = handMesh(0.42, 0.035, M.hand, 0.115);
const secHand = handMesh(0.48, 0.014, M.secHand, 0.12);
hourHand.rotation.z = -2.1;
minHand.rotation.z = -0.55;
// the quartz fork, magnified, on a little stand right of the watch
const fork = new THREE.Group();
fork.position.set(K[0] + 1.15, 0, K[2] + 0.3);
scene.add(fork);
mesh(new THREE.BoxGeometry(0.5, 0.3, 0.4), M.wood, fork, 0, 0.15, 0);
mesh(new THREE.BoxGeometry(0.3, 0.12, 0.1), M.crystal, fork, 0, 0.36, 0);
const prongs = [-1, 1].map((s) => {
  const g = new THREE.BoxGeometry(0.07, 0.62, 0.08);
  g.translate(0, 0.31, 0);
  const m = mesh(g, M.crystal, fork, s * 0.11, 0.4, 0);
  m.userData.s = s;
  return m;
});

// ---------------------------------------------------------------- flint-wheel lighter (CTA)
const flintL = new THREE.Group();
flintL.position.set(...R);
scene.add(flintL);
{
  const g = new THREE.ExtrudeGeometry(roundedRect(0.62, 1.15, 0.14), {
    depth: 0.28,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.035,
    bevelSegments: 2,
  });
  g.translate(0, 0.06, -0.14);
  glassy(mesh(g, M.blue, flintL), 4);
  const lq = glassy(mesh(new THREE.BoxGeometry(0.5, 0.6, 0.26), M.liquid, flintL, 0, 0.42, 0), 1);
  lq.castShadow = false;
  mesh(new THREE.BoxGeometry(0.66, 0.08, 0.36), M.btn, flintL, 0, 1.25, 0);
  mesh(new THREE.BoxGeometry(0.03, 0.34, 0.32), M.hood, flintL, -0.3, 1.45, 0);
  mesh(new THREE.BoxGeometry(0.36, 0.34, 0.03), M.hood, flintL, -0.13, 1.45, -0.15);
  mesh(new THREE.BoxGeometry(0.2, 0.12, 0.3), M.btn, flintL, 0.2, 1.34, 0);
}
const wheel = new THREE.Group();
wheel.position.set(0.05, 1.5, 0);
flintL.add(wheel);
{
  const g = new THREE.CylinderGeometry(0.1, 0.1, 0.12, 14);
  g.rotateX(Math.PI / 2);
  mesh(g, M.spring, wheel);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const r = mesh(new THREE.BoxGeometry(0.02, 0.025, 0.13), M.hood, wheel);
    r.position.set(Math.cos(a) * 0.1, Math.sin(a) * 0.1, 0);
    r.rotation.z = a;
  }
}
const NFL = 14;
const flintSparks = new THREE.InstancedMesh(new THREE.OctahedronGeometry(1, 0), M.flint, NFL);
flintSparks.userData.noAO = true;
flintL.add(flintSparks);

const applyCamera = shotCamera(shots);

// ---------------------------------------------------------------- states
// button press 0..1 (1 = bottom, the hammer releases there)
function press(t) {
  if (t < REBUILD) {
    // hook: held down since just before frame 0, a quick re-click on "Klick"
    const dip = pop(t, T.klick1 - 0.3, T.klick1 - 0.02, 0.12);
    return smooth(ramp(t, -0.6, H0)) * (1 - 0.7 * dip);
  }
  if (t < T.unterm + 0.3) {
    return (
      0.55 *
      smooth(ramp(t, T.knopf1 + 0.1, T.knopf1 + 0.4)) *
      (1 - smooth(ramp(t, T.unterm, T.unterm + 0.3)))
    );
  }
  if (t < T.klick2) return 0.8 * smooth(ramp(t, T.gespannt, T.gespannt + 0.8));
  if (t < T.uebrigens) return 0.8 + 0.2 * smooth(ramp(t, T.klick2, STRIKE));
  return smooth(ramp(t, T.klick3 - 0.15, T.klick3 + 0.05));
}
// strikes: spark windows [at, at + d]
const STRIKES = [
  [H0, 0.35],
  [T.klick1, 0.3],
  [STRIKE + 0.12, 0.6],
  [T.fuer + 0.1, 0.35],
  [T.tausende2, 0.45],
  [T.springt, 0.3],
  [T.wusch - 0.12, 0.2],
  [T.blitz - 0.05, 0.35],
  [T.klick3 + 0.05, 0.3],
];
function sparkK(t) {
  for (const [a, d] of STRIKES) if (t >= a && t < a + d) return 1;
  return 0;
}
// time since the last strike started (for the burst), or -1
function sinceStrike(t) {
  let best = -1;
  for (const [a] of STRIKES) if (t >= a && t < a + 0.5) best = t - a;
  return best;
}
function flameK(t) {
  if (t < REBUILD) return smooth(ramp(t, H0 + 0.1, H0 + 0.45));
  if (t < T.wusch) return 0;
  return 1;
}
function gasFlow(t) {
  if (t >= T.ventil && t < T.unterm + 0.3)
    return smooth(ramp(t, T.ventil, T.zisch)) * (1 - ramp(t, T.unterm, T.unterm + 0.3));
  if (t >= STRIKE && t < T.wusch) return 0.55;
  return 0;
}
function valveOpen(t) {
  return Math.max(gasFlow(t) > 0 ? 1 : 0, flameK(t) > 0 ? 1 : 0);
}
function liquidLevel(t) {
  if (t < REBUILD) return 1;
  return smooth(ramp(t, T.gepresst, T.fluessig + 0.4));
}

// ---------------------------------------------------------------- render
function renderAt(t) {
  // ---- the lighter: hook lighter shrinks away, the empty one pops in
  if (t < REBUILD) {
    lighter.scale.setScalar(Math.max(0.001, 1 - inBack(ramp(t, T.brauchst, REBUILD))));
  } else {
    lighter.scale.copy(squash(t, REBUILD));
  }
  puff("lighter", t, REBUILD + 0.15, 0, 0.05, 0, 1.4);

  // ---- liquid gas + boiling bubbles while gas flows
  const lvl = liquidLevel(t);
  liquid.visible = lvl > 0.01;
  liquid.scale.y = Math.max(0.001, lvl * LIQ_H);
  liquid.rotation.z = Math.sin(t * 2.2) * 0.015;
  const boil = Math.max(gasFlow(t), flameK(t) * 0.6);
  for (let i = 0; i < NBUB; i++) {
    const ph = (t * (0.7 + hash(i) * 0.6) + hash(i + 9)) % 1;
    const s = boil > 0.02 && lvl > 0.5 ? (0.018 + 0.03 * ph) * boil : 0.0001;
    _p.set(
      -0.42 + hash(i + 2) * 0.5,
      LIQ_Y0 + 0.05 + ph * (lvl * LIQ_H - 0.1),
      -0.18 + hash(i + 4) * 0.36,
    );
    _s.setScalar(s);
    _m.compose(_p, _q, _s);
    bubbles.setMatrixAt(i, _m);
  }
  bubbles.instanceMatrix.needsUpdate = true;

  // ---- gas cloud squeezed into the tank
  const cIn = t >= T.gas1 && t < T.knopf1;
  cloud.visible = cIn;
  if (cIn) {
    const appear = squash(t, T.gas1 + 0.05).x;
    const sq = smooth(ramp(t, T.gepresst, T.fluessig + 0.3));
    puffs.forEach((m) => {
      const u = m.userData;
      const k = appear * (1 - sq);
      m.position.set(u.x * (1 - 0.8 * sq), CLOUD_Y + u.y - sq * 2.0, u.z * (1 - 0.8 * sq));
      m.scale.setScalar(Math.max(0.001, u.s * k * (1 + 0.06 * Math.sin(t * 3 + u.x * 9))));
    });
  }
  animateArrows(squeezeArrows, t, pop(t, T.gepresst - 0.1, T.fluessig + 0.35));

  // ---- button, thumb, spring, hammer
  const pr = press(t);
  button.position.y = -pr * BTN_TRAVEL;
  plunger.position.y = 1.78 - pr * BTN_TRAVEL;
  const springTop = 1.62 - pr * BTN_TRAVEL;
  // hammer: down after a strike while the button stays pressed
  let drop = 0;
  if (t < REBUILD) drop = t > -0.4 ? 1 : 0;
  else if (t >= STRIKE && t < T.uebrigens) drop = smooth(ramp(t, STRIKE, STRIKE + 0.03));
  else if (t >= T.klick3 + 0.05) drop = 1;
  const hamY = HAM[1] - 0.12 * drop;
  hammer.position.y = hamY;
  spring.position.y = hamY + 0.07;
  spring.scale.y = Math.max(0.05, springTop - (hamY + 0.07));
  M.hammer.emissiveIntensity =
    0.9 * pop(t, T.hammer1, T.mausefalle) * (0.5 + 0.5 * Math.sin(t * 8));
  lever.rotation.z = -0.25 * valveOpen(t);
  nozzle.position.y = 0.04 * valveOpen(t);

  const thumbOn =
    t < REBUILD ||
    (t >= T.knopf1 && t < T.unterm + 0.45) ||
    (t >= T.gespannt - 0.35 && t < T.uebrigens);
  thumb.visible = thumbOn;
  if (thumbOn) {
    let s = 1;
    if (t >= REBUILD && t < T.unterm + 0.45)
      s = squash(t, T.knopf1, 0.6).x * (1 - ramp(t, T.unterm + 0.15, T.unterm + 0.45));
    else if (t >= REBUILD) s = squash(t, T.gespannt - 0.35, 0.6).x;
    thumb.position.set(BTN[0] + 0.02, BTN[1] + 0.02 - pr * BTN_TRAVEL, 0);
    thumb.scale.setScalar(Math.max(0.001, s));
    const glow = Math.max(pop(t, T.kraftwerk, T.brauchst), pop(t, T.daumen, T.uebrigens));
    M.skin.emissive.setHex(0xffb03a);
    M.skin.emissiveIntensity = 0.35 * glow * (0.6 + 0.4 * Math.sin(t * 7));
  }

  // ---- crystal: squeezed → glows, crackles
  const squeeze = pop(t, T.quetschst, T.klick2);
  crystal.scale.set(1 + 0.08 * squeeze, 1 - 0.12 * squeeze, 1 + 0.08 * squeeze);
  const hit = pop(t, STRIKE, STRIKE + 0.35, 0.15);
  const show = pop(t, T.kristall1, T.klick2);
  M.crystal.emissiveIntensity =
    0.35 + 0.9 * show + 1.5 * squeeze * (0.6 + 0.4 * Math.sin(t * 13)) + 3 * hit;
  crackles.forEach((c, i) => {
    c.visible = t >= T.elektrisch - 0.3 && t < T.klick2 && Math.floor(t * 12 + i * 2) % 3 === 0;
  });
  animateArrows(crystalArrows, t, pop(t, T.quetschst + 0.1, T.piezo));

  // ---- current racing up the wire after a strike
  const ca = STRIKE;
  const u = ramp(t, ca, ca + 0.12);
  const run = t >= ca && t < ca + 0.2;
  M.wire.emissiveIntensity = 1.6 * (run ? 1 : 0);
  for (let i = 0; i < NBEAD; i++) {
    const f = u - i * 0.025;
    const vis = run && f > 0 && f < 1;
    if (vis) wireCurve.getPointAt(f, _p);
    _s.setScalar(vis ? 0.04 * (1 - i / NBEAD) : 0.0001);
    _m.compose(vis ? _p : V(0, 0, 0), _q, _s);
    beads.setMatrixAt(i, _m);
  }
  beads.instanceMatrix.needsUpdate = true;

  // ---- spark at the gap
  const sk = sparkK(t);
  const sv = Math.floor(t * 24) % 4;
  sparks.forEach((g, i) => (g.visible = sk > 0 && i === sv));
  sparkLight.intensity = sk * (1.5 + 0.8 * Math.sin(t * 50));
  const bs = sinceStrike(t);
  for (let i = 0; i < NBURST; i++) {
    const k = bs < 0 ? -1 : bs / (0.25 + hash(i) * 0.25);
    const vis = k >= 0 && k < 1;
    const a = hash(i + 11) * Math.PI * 2;
    const e = (hash(i + 13) - 0.3) * 1.4;
    const d = 0.55 * k * (0.6 + hash(i + 17) * 0.6);
    _p.set(
      (TIP[0] + SPARK_B.x) / 2 + Math.cos(a) * Math.cos(e) * d,
      (TIP[1] + SPARK_B.y) / 2 + Math.sin(e) * d - k * k * 0.2,
      (TIP[2] + SPARK_B.z) / 2 + Math.sin(a) * Math.cos(e) * d,
    );
    _s.setScalar(vis ? 0.022 * (1 - k) + 0.006 : 0.0001);
    _m.compose(_p, _q, _s);
    burst.setMatrixAt(i, _m);
  }
  burst.instanceMatrix.needsUpdate = true;

  // ---- gas jet
  const gf = gasFlow(t) * (1 - flameK(t));
  for (let i = 0; i < NGAS; i++) {
    const ph = (t * 1.5 + hash(i)) % 1;
    const a = hash(i + 5) * Math.PI * 2;
    const r = ph * (0.12 + hash(i + 8) * 0.28);
    _p.set(NOZ[0] + Math.cos(a) * r, NOZ[1] + 0.05 + ph * (0.3 + 0.55 * gf), Math.sin(a) * r);
    _s.setScalar(gf > 0.01 ? (0.035 + 0.11 * ph) * gf * (1 - ph * 0.5) : 0.0001);
    _m.compose(_p, _q, _s);
    gasJet.setMatrixAt(i, _m);
  }
  gasJet.instanceMatrix.needsUpdate = true;

  // ---- flame
  const fk = flameK(t);
  const ign = t >= T.wusch ? pop(t, T.wusch, T.wusch + 0.6, 0.4) : 0;
  flame.visible = fk > 0.01;
  const fl = 1 + 0.08 * Math.sin(t * 17) + 0.05 * Math.sin(t * 29 + 1);
  const fs = fk * (0.95 + 0.5 * ign);
  flame.scale.set(fs * (1 - 0.04 * Math.sin(t * 23)), Math.max(0.001, fs * fl), fs);
  flame.rotation.z = Math.sin(t * 3.1) * 0.05;
  flameLight.intensity = fk * (9 + 1.5 * Math.sin(t * 19)) + 10 * ign;

  // ---- x-ray of the piezo housing while it is explained
  const xk =
    smooth(ramp(t, T.unterm - 0.1, T.unterm + 0.4)) * (1 - ramp(t, T.strom, T.strom + 0.5));
  setXray(xmats, xk);
  M.tank.opacity = 0.38 - 0.28 * xk;

  // ---- battery: "ohne Batterie" ✕
  setPop(battery, t, T.batterie - 0.05, T.kraftwerk);
  battery.rotation.y = t * 0.8;
  if (t >= T.batterie + 0.25 && t < T.kraftwerk) {
    showNope(pop(t, T.batterie + 0.25, T.kraftwerk), 1.35, 1.2, 0.9, 0.45);
  } else if (t >= T.nichts && t < T.unterm) {
    showNope(pop(t, T.nichts, T.unterm), NOZ[0] + 0.1, 2.95, 0.3, 0.45);
  } else {
    showNope(0, 0, 0, 0);
  }

  // ---- mousetrap: armed, then it snaps
  setPop(trap, t, T.mausefalle - 0.1, T.darunter + 0.1);
  if (trap.visible) {
    const arm = smooth(ramp(t, T.mausefalle, T.mausefalle + 0.3));
    const snap = ramp(t, SNAP, SNAP + 0.06);
    bar.rotation.z =
      -Math.PI * arm * (1 - snap) +
      Math.sin(Math.max(0, t - SNAP) * 40) * 0.08 * (snap > 0 ? Math.exp(-(t - SNAP) * 8) : 0);
    animateArrows(trapArrow, t, pop(t, T.mausefalle + 0.2, SNAP));
  }

  // ---- quartz watch + vibrating fork
  setPop(watch, t, T.uebrigens + 0.05, T.reibrad);
  setPop(fork, t, T.uebrigens + 0.2, T.reibrad);
  puff("watch", t, T.uebrigens + 0.2, K[0], 0.05, K[2] + 0.4, 0.8);
  secHand.rotation.z = -Math.floor(t - T.uebrigens) * ((Math.PI * 2) / 60) - 1.2;
  const vib = smooth(ramp(t, T.quarzuhren, T.uebrigens + 2.0));
  prongs.forEach((m) => {
    m.position.x = m.userData.s * (0.11 + 0.025 * vib * Math.sin(t * 2 * Math.PI * 11));
    m.rotation.z = -m.userData.s * 0.06 * vib * Math.sin(t * 2 * Math.PI * 11);
  });

  // ---- flint-wheel lighter (CTA)
  setPop(flintL, t, T.reibrad, 1e9);
  puff("flint", t, T.reibrad + 0.15, R[0], 0.05, R[2], 1.1);
  const spin = smooth(ramp(t, T.reibrad + 0.25, T.reibrad + 0.7));
  wheel.rotation.z = -spin * Math.PI * 3;
  for (let i = 0; i < NFL; i++) {
    const a0 = T.reibrad + 0.3 + hash(i) * 0.25;
    const k = ramp(t, a0, a0 + 0.45);
    const vis = k > 0 && k < 1;
    _p.set(
      0.05 + (hash(i + 3) - 0.3) * 0.7 * k,
      1.55 + Math.sin(k * Math.PI) * 0.3 - k * 0.2,
      (hash(i + 6) - 0.5) * 0.4 * k,
    );
    _s.setScalar(vis ? 0.025 * (1 - k) + 0.008 : 0.0001);
    _m.compose(_p, _q, _s);
    flintSparks.setMatrixAt(i, _m);
  }
  flintSparks.instanceMatrix.needsUpdate = true;

  // ---- LED panel (none on the cover)
  if (window.HF_COVER_T != null) {
    showPanel(0);
  } else if (t >= T.tausende2 && t < T.funke) {
    showPanel(pop(t, T.tausende2, T.funke), "SPANNUNG IN VOLT", "1000+", LED.yellow);
  } else if (t >= T.zahl && t < T.reibrad) {
    showPanel(pop(t, T.zahl, T.reibrad), "PRO SEKUNDE", "32.768", LED.blue);
  } else {
    showPanel(0);
  }

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
