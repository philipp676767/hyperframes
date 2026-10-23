// "Wie funktioniert Popcorn?" World, captions, camera, panel, arrows and
// labels live in world.js; this file builds the story: a giant corn kernel
// in a red pot on a camping stove at the beach. Inside its golden shell a
// drop of water turns to steam, the pressure swells the kernel, the shell
// bursts open and the white starch foams up into popcorn — which then
// pushes a foam "leg" against the pot and catapults itself up. Analogy
// sets: a car tyre (2.5 bar), a can of expanding foam, an old clay pot
// from Peru.
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
  jitter,
  facet,
  facetMat,
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
  PB,
  KH,
  TIRE,
  CAN,
  PERU,
  HOOK_BURST,
  REBUILD,
  BURST,
  HOP,
} from "./beats.js";

highlights(HIGHLIGHTS);
createWorld({ env: "strand", sky: "mittag" });

Object.assign(M, {
  potRed: new THREE.MeshStandardMaterial({ color: 0xe0402f, roughness: 0.3, metalness: 0.1 }),
  potIn: flat(0xb8bfc8, { roughness: 0.4, metalness: 0.3, side: THREE.BackSide }),
  potFloor: flat(0xa9b1bb, { roughness: 0.4, metalness: 0.3 }),
  rim: flat(0xf4f1ec),
  stove: flat(0x30343c, { roughness: 0.6 }),
  flame: flat(0x3d8bff, { emissive: 0x2f7bff, emissiveIntensity: 2.2 }),
  kernelSmall: flat(0xf0a51f, { roughness: 0.35 }),
  starch: new THREE.MeshStandardMaterial({
    color: 0xfff0c4,
    roughness: 0.6,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  }),
  drop: flat(0x2f9bff, { emissive: 0x2f8bff, emissiveIntensity: 0.9, roughness: 0.1 }),
  steamIn: flat(0xffffff, { emissive: 0xe8f6ff, emissiveIntensity: 0.8 }),
  fuse: flat(0x3a2a1e),
  spark: flat(0xffe26a, { emissive: 0xffc21a, emissiveIntensity: 3 }),
  can: new THREE.MeshStandardMaterial({ color: 0xf6f6f2, roughness: 0.3, metalness: 0.2 }),
  canBand: flat(0xff7a2f),
  clay: flat(0xc4632f),
  clayDark: flat(0x8f4220),
  stone: flat(0xd9c49a),
  cactus: flat(0x4f9d54),
});

const clamp = (x) => Math.min(1, Math.max(0, x));
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
function setPop(group, t, a, b) {
  const k = pop(t, a, b);
  group.visible = k > 0.001;
  group.scale.copy(t >= a ? squash(t, a).multiplyScalar(k) : TINY);
}
const _m = new THREE.Matrix4();
const _s = V(1, 1, 1);
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();

// kernel outline (radius, height): pointed tip at the bottom, round crown
const PROFILE = [
  [0.0, 0.0],
  [0.1, 0.02],
  [0.2, 0.12],
  [0.36, 0.36],
  [0.5, 0.66],
  [0.58, 0.95],
  [0.59, 1.18],
  [0.52, 1.4],
  [0.36, 1.56],
  [0.0, KH],
].map(([r, y]) => new THREE.Vector2(r, y));

// small popcorn piece / kernel shapes for the pot, the flying popcorn, Peru
const flakeGeo = (() => {
  const g = jitter(new THREE.IcosahedronGeometry(0.15, 1), 0.035, 7);
  return facet(g, 0.06, 3);
})();
const smallKernelGeo = (() => {
  const g = new THREE.LatheGeometry(PROFILE, 8);
  g.scale(0.11, 0.11, 0.08);
  return g;
})();

// ---------------------------------------------------------------- pot + stove
const potSet = new THREE.Group();
scene.add(potSet);
const POT_R = 1.4;
const WALL = 0.36;
{
  mesh(new THREE.BoxGeometry(1.9, 0.2, 1.9), M.stove, potSet, 0, 0.1, 0);
  mesh(new THREE.BoxGeometry(2.05, 0.04, 2.05), M.stove, potSet, 0, 0.21, 0);
  for (const [x, z] of [
    [0.75, 0],
    [-0.75, 0],
    [0, 0.75],
    [0, -0.75],
  ])
    mesh(new THREE.BoxGeometry(0.12, 0.22, 0.12), M.steel, potSet, x, 0.32, z);
  const knob = mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 12), M.rubber, potSet, 0.55, 0.1, 1);
  knob.rotation.x = Math.PI / 2;
  // pot: red outside, steel inside
  const outer = mesh(
    new THREE.CylinderGeometry(POT_R, POT_R - 0.12, WALL + 0.08, 48, 1, true),
    M.potRed,
    potSet,
    0,
    PB + WALL / 2 - 0.04,
    0,
  );
  outer.material.side = THREE.DoubleSide;
  mesh(
    new THREE.CylinderGeometry(POT_R - 0.05, POT_R - 0.15, WALL + 0.06, 48, 1, true),
    M.potIn,
    potSet,
    0,
    PB + WALL / 2 - 0.03,
    0,
  );
  mesh(
    new THREE.CylinderGeometry(POT_R - 0.12, POT_R - 0.14, 0.08, 48),
    M.potFloor,
    potSet,
    0,
    PB - 0.04,
    0,
  );
  const rim = mesh(
    new THREE.TorusGeometry(POT_R - 0.02, 0.05, 6, 48),
    M.rim,
    potSet,
    0,
    PB + WALL,
    0,
  );
  rim.rotation.x = Math.PI / 2;
  for (const s of [-1, 1]) {
    mesh(
      new THREE.BoxGeometry(0.5, 0.1, 0.24),
      M.rubber,
      potSet,
      s * (POT_R + 0.22),
      PB + WALL - 0.08,
      0,
    );
  }
  // a few unpopped kernels on the floor of the pot
  for (let i = 0; i < 16; i++) {
    const a = hash(i + 40) * Math.PI * 2;
    const r = 0.75 + hash(i + 50) * 0.4;
    const k = mesh(
      smallKernelGeo,
      M.kernelSmall,
      potSet,
      Math.cos(a) * r,
      PB + 0.05,
      Math.sin(a) * r,
    );
    k.rotation.set(Math.PI / 2 + (hash(i) - 0.5) * 0.6, hash(i + 3) * 6, hash(i + 5) * 6);
  }
}
// gas flames between stove and pot
const flames = [];
for (let i = 0; i < 18; i++) {
  const a = (i / 18) * Math.PI * 2;
  const f = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 6), M.flame);
  f.position.set(Math.cos(a) * 0.55, 0.33, Math.sin(a) * 0.55);
  f.userData.noAO = true;
  potSet.add(f);
  flames.push(f);
}
const flameLight = new THREE.PointLight(0x5a9bff, 0, 4, 1.5);
flameLight.position.set(0, 0.35, 0.8);
potSet.add(flameLight);

// ---------------------------------------------------------------- the popcorn
// pc = everything that hops; kern = the kernel (flattened in z); foam = the
// popcorn cloud that grows out of it.
const pc = new THREE.Group();
pc.position.set(0, PB, 0);
scene.add(pc);
// body spins around the popcorn's centre when it hops
const body = new THREE.Group();
body.position.y = 0.95;
pc.add(body);
const kern = new THREE.Group();
kern.position.y = -0.95;
kern.scale.set(1, 1, 0.72);
body.add(kern);

const shellMat = xrayMaterial(0xf0a01e);
const tipMat = xrayMaterial(0xead39c);
const germMat = xrayMaterial(0xf8e28a);
const NP = 6;
const HINGE_Y = 0.16;
const petals = [];
for (let i = 0; i < NP; i++) {
  const d = (Math.PI * 2) / NP;
  const phi0 = (i - 0.5) * d;
  const geo = new THREE.LatheGeometry(PROFILE, 6, phi0, d);
  const phim = phi0 + d / 2;
  const dir = V(Math.sin(phim), 0, Math.cos(phim));
  const pivot = new THREE.Group();
  pivot.position.set(dir.x * 0.17, HINGE_Y, dir.z * 0.17);
  kern.add(pivot);
  const m = new THREE.Mesh(geo, shellMat);
  m.position.set(-pivot.position.x, -HINGE_Y, -pivot.position.z);
  m.castShadow = true;
  m.renderOrder = 3;
  pivot.add(m);
  const e = xrayEdges(geo);
  e.position.copy(m.position);
  pivot.add(e);
  petals.push({ pivot, axis: V(dir.z, 0, -dir.x) });
}
const tip = mesh(new THREE.ConeGeometry(0.13, 0.2, 10), tipMat, kern, 0, 0.09, 0);
tip.rotation.x = Math.PI;
tip.renderOrder = 3;
const germ = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), germMat);
germ.scale.set(0.17, 0.3, 0.06);
germ.position.set(0, 0.62, 0.48);
germ.renderOrder = 3;
kern.add(germ);

// inside: soft starch, the water drop, steam
const starch = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), M.starch);
starch.scale.set(0.44, 0.52, 0.4);
starch.position.set(0, 0.95, 0);
starch.renderOrder = 2;
starch.userData.noAO = true;
kern.add(starch);
const drop = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), M.drop);
drop.renderOrder = 1;
kern.add(drop);
const NSP = 40;
const steamIn = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), M.steamIn, NSP);
steamIn.renderOrder = 1;
kern.add(steamIn);
const kernLight = new THREE.PointLight(0xff8a2a, 0, 4, 1.5);
kernLight.position.set(0, 1.0, 0.9);
pc.add(kernLight);

// fuse on top ("Gleich wird's zur Bombe")
const fuse = new THREE.Group();
fuse.position.set(0, KH - 0.02, 0);
kern.add(fuse);
{
  const curve = new THREE.CatmullRomCurve3([
    V(0, 0, 0),
    V(0.05, 0.18, 0),
    V(0.2, 0.3, 0),
    V(0.32, 0.34, 0),
  ]);
  mesh(new THREE.TubeGeometry(curve, 12, 0.035, 6), M.fuse, fuse);
}
const spark = mesh(new THREE.OctahedronGeometry(0.09, 0), M.spark, fuse, 0.34, 0.35, 0);
spark.castShadow = false;
const sparkLight = new THREE.PointLight(0xffc23a, 0, 3, 1.5);
sparkLight.position.set(0.34, 0.4, 0.2);
fuse.add(sparkLight);

// the popcorn foam: blobs ordered from the centre out
const foamMat = facetMat(flat(0xfffdf4, { roughness: 0.3 }));
const FOAM = [];
{
  const r = rngLocal(11);
  FOAM.push({ p: V(0, 0.95, 0), s: 0.44 });
  let n = 0;
  while (FOAM.length < 27 && n < 400) {
    n++;
    const a = r() * Math.PI * 2;
    const u = r() * 2 - 1;
    const rr = 0.32 + r() * 0.36;
    const p = V(
      Math.cos(a) * Math.sqrt(1 - u * u) * rr * 1.05,
      u * rr * 0.75,
      Math.sin(a) * Math.sqrt(1 - u * u) * rr * 0.9,
    );
    if (p.y < -0.34) continue;
    p.y += 0.95;
    FOAM.push({ p, s: 0.2 + r() * 0.2 });
  }
  FOAM.forEach((b, i) => {
    b.d = b.p.distanceTo(V(0, 0.95, 0));
    b.g = facet(jitter(new THREE.IcosahedronGeometry(1, 1), 0.12, i + 3), 0.07, i + 1);
  });
}
function rngLocal(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
const foam = new THREE.Group();
foam.position.y = -0.95;
body.add(foam);
const foamMeshes = FOAM.map((b) => {
  const m = new THREE.Mesh(b.g, foamMat);
  m.castShadow = true;
  m.receiveShadow = true;
  m.rotation.set(hash(b.s * 50) * 6, hash(b.s * 70) * 6, 0);
  foam.add(m);
  return m;
});
// the "leg" that pushes against the pot floor
const leg = new THREE.Mesh(
  facet(jitter(new THREE.IcosahedronGeometry(1, 1), 0.1, 77), 0.07, 5),
  foamMat,
);
leg.castShadow = true;
scene.add(leg);
const legArrows = makeArrowSet(
  [
    [V(0.5, PB + 0.75, 0.45), V(0.5, PB + 0.08, 0.45)],
    [V(-0.2, PB + 2.3, 0.5), V(-0.2, PB + 3.2, 0.5)],
  ],
  { mat: forceMat, amp: 0, r: 0.045 },
);
// pressure arrows from the inside out
const KC_W = V(0, PB + 0.95, 0);
const pressArrows = makeArrowSet(
  [
    [V(0.12, 0, 0), V(0.5, 0, 0)],
    [V(-0.12, 0, 0), V(-0.5, 0, 0)],
    [V(0, 0.15, 0), V(0, 0.6, 0)],
    [V(0.09, 0.09, 0.05), V(0.36, 0.42, 0.2)],
    [V(-0.09, 0.09, 0.05), V(-0.36, 0.42, 0.2)],
    [V(0.09, -0.12, 0.05), V(0.32, -0.42, 0.2)],
    [V(-0.09, -0.12, 0.05), V(-0.32, -0.42, 0.2)],
  ].map(([a, b]) => [a.add(KC_W), b.add(KC_W)]),
  { mat: forceMat, amp: 0, r: 0.03 },
);

// flying popcorn (hook + CTA)
const NF = 34;
const flakeMat = facetMat(
  flat(0xfffaee, { roughness: 0.6, emissive: 0xfff0c8, emissiveIntensity: 0.28 }),
);
const flakes = new THREE.InstancedMesh(flakeGeo, flakeMat, NF);
flakes.castShadow = true;
scene.add(flakes);
const FL = Array.from({ length: NF }, (_, i) => ({
  per: 1.1 + hash(i + 1) * 0.7,
  ph: hash(i + 2),
  a: hash(i + 3) * Math.PI * 2,
  r0: 0.5 + hash(i + 4) * 1.0,
  vy: 4.2 + hash(i + 5) * 2.2,
  vh: 0.9 + hash(i + 6) * 1.6,
  s: 0.8 + hash(i + 7) * 0.6,
}));
function updateFlakes(t, on) {
  for (let i = 0; i < NF; i++) {
    const f = FL[i];
    const u = (((t / f.per + f.ph) % 1) + 1) % 1;
    const tt = u * f.per;
    const y = PB + 0.2 + f.vy * tt - 4.9 * tt * tt;
    const r = f.r0 + f.vh * tt;
    const k = on * clamp(tt / 0.08) * (y > 0.05 ? 1 : 0);
    _s.setScalar(Math.max(1e-4, k * f.s));
    _e.set(tt * 6 + i, tt * 4, i);
    _q.setFromEuler(_e);
    _m.compose(V(Math.cos(f.a) * r, y, Math.sin(f.a) * r), _q, _s);
    flakes.setMatrixAt(i, _m);
  }
  flakes.instanceMatrix.needsUpdate = true;
}

// ---------------------------------------------------------------- tyre set
const tire = new THREE.Group();
tire.position.set(...TIRE);
scene.add(tire);
{
  mesh(new THREE.TorusGeometry(0.7, 0.3, 12, 28), M.rubber, tire, 0, 1.02, 0);
  const rimG = new THREE.CylinderGeometry(0.46, 0.46, 0.26, 20);
  rimG.rotateX(Math.PI / 2);
  mesh(rimG, M.alu, tire, 0, 1.02, 0);
  for (let i = 0; i < 5; i++) {
    const s = mesh(new THREE.BoxGeometry(0.08, 0.36, 0.05), M.steel, tire, 0, 1.02, 0.15);
    s.rotation.z = (i / 5) * Math.PI * 2;
    s.translateY(0.2);
  }
  const valve = mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 0.16, 8),
    M.rubber,
    tire,
    0,
    1.02 - 0.5,
    0.12,
  );
  valve.rotation.z = 0.2;
}

// ---------------------------------------------------------------- foam can set
const canSet = new THREE.Group();
canSet.position.set(...CAN);
scene.add(canSet);
const CAN_FOAM = [];
{
  mesh(new THREE.CylinderGeometry(0.32, 0.32, 1.1, 20), M.can, canSet, -0.5, 0.55, 0);
  mesh(new THREE.CylinderGeometry(0.325, 0.325, 0.3, 20), M.canBand, canSet, -0.5, 0.6, 0);
  mesh(new THREE.CylinderGeometry(0.22, 0.32, 0.14, 20), M.can, canSet, -0.5, 1.17, 0);
  mesh(new THREE.BoxGeometry(0.16, 0.12, 0.2), M.rubber, canSet, -0.5, 1.29, 0);
  const curve = new THREE.CatmullRomCurve3([
    V(-0.5, 1.3, 0.05),
    V(-0.3, 1.36, 0.25),
    V(-0.05, 1.2, 0.45),
  ]);
  mesh(new THREE.TubeGeometry(curve, 10, 0.03, 6), M.rubber, canSet);
  // foam string from the nozzle down onto the sand, growing fat
  for (let i = 0; i < 11; i++) {
    const k = i / 10;
    const p = V(0.0 + k * 0.85, 1.15 - Math.sin(k * 1.6) * 1.0, 0.5 + k * 0.1);
    const m = mesh(
      facet(jitter(new THREE.IcosahedronGeometry(1, 1), 0.12, i + 20), 0.07, i),
      foamMat,
      canSet,
      p.x,
      p.y,
      p.z,
    );
    m.userData.s = 0.14 + k * 0.16;
    CAN_FOAM.push(m);
  }
}

// ---------------------------------------------------------------- Peru set
const peru = new THREE.Group();
peru.position.set(...PERU);
scene.add(peru);
{
  const pot = new THREE.LatheGeometry(
    [
      [0.0, 0.0],
      [0.32, 0.02],
      [0.5, 0.25],
      [0.52, 0.5],
      [0.38, 0.75],
      [0.34, 0.86],
      [0.42, 0.92],
    ].map(([r, y]) => new THREE.Vector2(r, y)),
    18,
  );
  const p = mesh(pot, M.clay, peru, 0.2, 0, 0.2);
  p.material.side = THREE.DoubleSide;
  const band = mesh(new THREE.TorusGeometry(0.515, 0.025, 4, 24), M.clayDark, peru, 0.2, 0.45, 0.2);
  band.rotation.x = Math.PI / 2;
  for (let i = 0; i < 9; i++) {
    const a = i * 2.2;
    const f = mesh(
      flakeGeo,
      flakeMat,
      peru,
      0.2 + Math.cos(a) * 0.2 * (i % 3),
      0.95 + (i % 3) * 0.08,
      0.2 + Math.sin(a) * 0.2 * (i % 3),
    );
    f.scale.setScalar(1.1);
    f.rotation.set(i, i * 2, 0);
  }
  // stepped pyramid behind
  for (let s = 0; s < 4; s++) {
    const w = 2.2 - s * 0.5;
    mesh(new THREE.BoxGeometry(w, 0.34, w), M.stone, peru, -1.3, 0.17 + s * 0.34, -1.6);
  }
  // cactus
  mesh(new THREE.CylinderGeometry(0.13, 0.15, 1.0, 8), M.cactus, peru, 1.25, 0.5, -0.4);
  const arm = mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.4, 8),
    M.cactus,
    peru,
    1.43,
    0.68,
    -0.4,
  );
  arm.rotation.z = -0.9;
  mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.3, 8), M.cactus, peru, 1.57, 0.88, -0.4);
}

const applyCamera = shotCamera(shots);

// ---------------------------------------------------------------- states
const jump = (t, at, h, dur) => {
  const x = (t - at) / dur;
  if (x < 0 || x > 1) return 0;
  return h * 4 * x * (1 - x);
};
function tremble(t, k) {
  return { x: Math.sin(t * 71) * 0.018 * k, rz: Math.sin(t * 53) * 0.03 * k };
}

// ---------------------------------------------------------------- render
function renderAt(t) {
  const hook = t < REBUILD;
  const burstAt = hook ? HOOK_BURST : BURST;

  // ---- whole popcorn: the hook one leaves on "brauchst", a fresh kernel pops in
  if (hook) pc.scale.setScalar(Math.max(0.001, 1 - inBack(ramp(t, T.brauchst, REBUILD))));
  else pc.scale.copy(squash(t, REBUILD));
  puff("kernel", t, REBUILD + 0.15, 0, PB + 0.05, 0, 1.3);

  // ---- burst: petals peel back, foam grows from the centre
  const open = smooth(ramp(t, burstAt, burstAt + 0.28));
  const crack = hook ? 0 : smooth(ramp(t, T.platzt, T.platzt + 0.3)) * (1 - open);
  const f = ramp(t, burstAt + 0.02, burstAt + 0.9);
  petals.forEach((p, i) => {
    const wob = 0.06 * Math.sin(t * 40 + i) * crack;
    p.pivot.quaternion.setFromAxisAngle(p.axis, open * (1.95 + hash(i) * 0.3) + crack * 0.07 + wob);
    p.pivot.scale.setScalar(1 - open * 0.7);
  });
  tip.visible = true;
  germ.visible = open < 0.05;
  starch.visible = open < 0.05;
  FOAM.forEach((b, i) => {
    const g = smooth(clamp((f - b.d * 0.5) / 0.45));
    const m = foamMeshes[i];
    m.visible = g > 0.001;
    m.position
      .copy(b.p)
      .sub(V(0, 0.95, 0))
      .multiplyScalar(0.25 + 0.75 * g)
      .add(V(0, 0.7 + 0.25 * g, 0));
    m.scale.setScalar(Math.max(0.001, b.s * g * (1 + 0.15 * Math.sin(Math.min(1, g) * Math.PI))));
  });
  // wet glossy foam that sets matte on "sofort"
  const set = hook
    ? smooth(ramp(t, burstAt + 0.8, burstAt + 1.4))
    : smooth(ramp(t, T.sofort, T.sofort + 0.6));
  foamMat.roughness = 0.25 + 0.6 * set;
  foamMat.color.setHex(0xffffff).lerp(new THREE.Color(0xfff5dc), set);
  foamMat.emissive.setHex(0xfff2c0);
  foamMat.emissiveIntensity = 0.12 + 0.2 * (1 - set);

  // ---- swelling + tremble under pressure, red-hot before the bang
  const pressure = hook
    ? 1 - ramp(t, burstAt, burstAt + 0.1)
    : smooth(ramp(t, T.druck, T.neun + 0.6)) * 0.7 + 0.3 * ramp(t, T.bei, BURST);
  const shake = hook ? pressure : pressure * (t < BURST ? 1 : 0);
  const tr = tremble(t, shake * (hook ? 1 : 0.5 + 0.5 * ramp(t, T.bei, BURST)));
  const swell = 1 + 0.08 * shake;
  kern.scale.set(swell, swell * (1 + 0.03 * shake), 0.72 * swell);
  kern.position.x = tr.x;
  kern.rotation.z = 0.1 + tr.rz;
  const hot = hook
    ? clamp(1 - ramp(t, burstAt + 0.1, burstAt + 0.5))
    : smooth(ramp(t, T.bei, T.platzt)) * (1 - open);
  shellMat.emissive.setHex(0xff4a10);
  shellMat.emissiveIntensity = 0.55 * hot;
  shellMat.userData.base.setHex(0xf0a01e).lerp(new THREE.Color(0xb4651a), open);
  kernLight.intensity = 6 * hot + 14 * crack + 10 * pop(t, burstAt, burstAt + 0.5, 0.2);

  // ---- x-ray while the inside is explained
  const xk = hook
    ? 0
    : smooth(ramp(t, T.darin, T.darin + 0.5)) * (1 - smooth(ramp(t, T.bei, T.bei + 0.4)));
  setXray([shellMat, tipMat, germMat], xk);
  // keep the glass kernel golden so it reads against the bright sky
  shellMat.color.lerp(new THREE.Color(0xffb22e), 0.7 * xk);
  shellMat.opacity = Math.max(shellMat.opacity, 0.3 + 0.7 * (1 - xk) + 0.2 * xk);
  M.starch.opacity = 0.35 * xk;
  starch.visible = starch.visible && xk > 0.02;

  // ---- the drop: glows on "Wasser", bounces at the wall, turns to steam
  const steamK = smooth(ramp(t, T.dampf, T.dampf + 1.2));
  const bounce = t >= T.wasser2 && t < T.dampf ? Math.abs(Math.sin((t - T.wasser2) * 4.2)) : 0;
  drop.visible = !hook && xk > 0.02 && steamK < 0.98;
  drop.position.set(0.28 * bounce, 0.95 + 0.05 * Math.sin(t * 3), 0.05);
  drop.scale.setScalar(
    Math.max(0.001, (1 - steamK) * (1 + 0.25 * pop(t, T.wasser1, T.wasser1 + 0.5, 0.2))),
  );
  M.drop.emissiveIntensity = 0.6 + 1.2 * pop(t, T.wasser1, T.gleich2, 0.3);
  const sv = !hook && t < BURST && xk > 0.02 ? steamK : 0;
  steamIn.visible = sv > 0;
  if (steamIn.visible) {
    const speed = 2 + 3 * pressure;
    for (let i = 0; i < NSP; i++) {
      const on = clamp(sv * 1.4 - i / NSP);
      const a = hash(i) * 6.3 + t * speed * (0.6 + hash(i + 1) * 0.6);
      const rr = 0.14 + hash(i + 2) * 0.24;
      const y = 0.95 + (hash(i + 3) - 0.5) * 0.7 + Math.sin(t * 2 + i) * 0.04;
      _s.setScalar(Math.max(1e-4, (0.03 + hash(i + 4) * 0.035) * on));
      _m.compose(V(Math.cos(a) * rr, y, Math.sin(a) * rr * 0.8), _q.identity(), _s);
      steamIn.setMatrixAt(i, _m);
    }
    steamIn.instanceMatrix.needsUpdate = true;
  }
  animateArrows(pressArrows, t, hook ? 0 : pop(t, T.druck + 0.1, T.bei));

  // ---- fuse
  const fk = hook ? 0 : pop(t, T.bombe - 0.1, T.wasser2);
  fuse.visible = fk > 0.001;
  fuse.scale.setScalar(Math.max(0.001, fk));
  spark.scale.setScalar(1 + 0.5 * Math.abs(Math.sin(t * 23)));
  spark.rotation.set(t * 9, t * 7, 0);
  sparkLight.intensity = 3 * fk * (0.7 + 0.3 * Math.sin(t * 31));

  // ---- flames: on in the hook and from "Bombe" on
  const flameK = hook ? 1 : smooth(ramp(t, T.bombe + 0.05, T.bombe + 0.3));
  flames.forEach((fl, i) => {
    fl.visible = flameK > 0.01;
    const s = flameK * (0.8 + 0.3 * Math.sin(t * 17 + i * 1.7));
    fl.scale.set(Math.max(0.001, flameK), Math.max(0.001, s), Math.max(0.001, flameK));
  });
  flameLight.intensity = 3 * flameK;

  // ---- the leg + the hop
  let lift = 0;
  let tilt = 0;
  let spin = 0;
  if (hook) {
    lift = jump(t, T.hochspringt, 1.8, 0.85);
    spin = Math.PI * 2 * smooth(ramp(t, T.hochspringt, T.hochspringt + 0.85));
  } else {
    const lk = smooth(ramp(t, T.bein, T.bein + 0.6)) * (1 - ramp(t, HOP, HOP + 0.12));
    lift = 0.42 * lk + jump(t, HOP, 3.2, 1.0);
    tilt = 0.18 * lk;
    spin = Math.PI * 2 * smooth(ramp(t, HOP, HOP + 1.0));
    const legK = smooth(ramp(t, T.bein, T.bein + 0.6)) * (1 - smooth(ramp(t, HOP, HOP + 0.15)));
    leg.visible = legK > 0.01;
    leg.position.set(0.05, PB + 0.06 + 0.25 * legK, 0.3);
    leg.scale.set(0.24, Math.max(0.001, 0.36 * legK), 0.24);
    animateArrows(legArrows, t, pop(t, T.bein + 0.2, HOP));
  }
  if (hook) {
    leg.visible = false;
    animateArrows(legArrows, t, 0);
  }
  pc.position.set(0, PB + lift, 0);
  pc.rotation.set(0, 0, -tilt);
  body.rotation.set(spin * 0.15, 0, spin);
  puff("land", t, T.hochspringt + 0.85, 0, PB + 0.05, 0, 1.2);
  puff("land2", t, HOP + 1.0, 0, PB + 0.05, 0, 1.4);

  // ---- flying popcorn in the hook and under the CTA
  const flyK = t < T.brauchst ? 1 : smooth(ramp(t, T.suess, T.suess + 0.4));
  flakes.visible = flyK > 0;
  if (flakes.visible) updateFlakes(t, flyK);

  // ---- ✕: the drop can't get out
  if (!hook && t >= T.kann && t < T.dampf)
    showNope(pop(t, T.kann, T.dampf), 0.75, PB + 1.05, 0.3, 0.35);
  else showNope(0, 0, 0, 0);

  // ---- analogy sets
  setPop(tire, t, T.autoreifen - 0.1, T.bei);
  tire.rotation.y = 0.35 + Math.sin(t * 0.8) * 0.15;
  setPop(canSet, t, T.bauschaum - 0.1, T.springen);
  CAN_FOAM.forEach((m, i) => {
    const g = smooth(ramp(t, T.bauschaum + 0.15 + i * 0.07, T.bauschaum + 0.55 + i * 0.07));
    const fat = 1 + 0.6 * smooth(ramp(t, T.bauschaum + 0.8, T.bauschaum + 1.6));
    m.visible = g > 0.001;
    m.scale.setScalar(Math.max(0.001, m.userData.s * g * fat));
  });
  setPop(peru, t, T.popcorn2 - 0.05, T.suess);

  // ---- LED panel (none on the cover)
  if (window.HF_COVER_T != null) {
    showPanel(0);
  } else if (t >= T.neun && t < T.autoreifen) {
    showPanel(pop(t, T.neun, T.autoreifen), "DRUCK IM KORN", "9 BAR", LED.red);
  } else if (t >= T.autoreifen && t < T.bei) {
    showPanel(pop(t, T.autoreifen, T.bei), "AUTOREIFEN · BAR", "2,5", LED.yellow);
  } else if (t >= T.bei + 0.1 && t < T.zack) {
    showPanel(pop(t, T.bei + 0.1, T.zack), "ES PLATZT BEI", "180 °C", LED.red);
  } else if (t >= T.jahre && t < T.suess) {
    showPanel(pop(t, T.jahre, T.suess), "POPCORN SEIT JAHREN", "6000", LED.yellow);
  } else {
    showPanel(0);
  }

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
