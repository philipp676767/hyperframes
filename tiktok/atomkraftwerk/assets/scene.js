// "So funktioniert ein Atomkraftwerk". Beach at blue hour; the plant is built
// left to right: reactor (fuel rods, control rods, chain reaction) -> steam
// pipe -> turbine hall (turbine + generator) -> power line, with the cooling
// tower and its cloud behind. Timing data lives in beats.js.
import {
  THREE,
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
  coldMat,
  animateArrows,
  showPanel,
  LED,
  labels,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { createWorld } from "./environments.js";
import { T, shots, LABELS, R, H, C, PY, SP, WR } from "./beats.js";

createWorld({ env: "strand", sky: "abend" });

Object.assign(M, {
  fuel: flat(0x8fe04a, { emissive: 0x7dff3a, emissiveIntensity: 0 }),
  rod: flat(0x2c3036, { roughness: 0.4, metalness: 0.4 }),
  core: new THREE.MeshStandardMaterial({
    color: 0x3fa6ff,
    roughness: 0.1,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    emissive: 0x2f9bff,
    emissiveIntensity: 0.3,
  }),
  vessel: new THREE.MeshStandardMaterial({
    color: 0xb8c4d0,
    metalness: 0.5,
    roughness: 0.3,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
  }),
  tower: flat(0xebe5db, { side: THREE.DoubleSide }),
  towerBand: flat(0xff6b5b, { side: THREE.DoubleSide }),
  rotor: flat(0x9aa7b4, { roughness: 0.35, metalness: 0.5 }),
  gen: flat(0x2fae6b, { emissive: 0xffd23f, emissiveIntensity: 0 }),
  kettle: flat(0xff6b6b, { roughness: 0.35 }),
  sponge: flat(0xffd34d),
  pore: flat(0xc79a1e),
  wire: flat(0x2a2a30, { emissive: 0xffd23f, emissiveIntensity: 0 }),
});

const P = (a, d = [0, 0, 0]) => V(a[0] + d[0], a[1] + d[1], a[2] + d[2]);
const hash = (a, b) => {
  const x = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
// integral of ramp(t, a, b): an angle that spins up smoothly and stays deterministic
const rampInt = (t, a, b) =>
  t < a ? 0 : t < b ? ((t - a) * (t - a)) / (2 * (b - a)) : (b - a) / 2 + (t - b);

function popIn(obj, t, a, d = 0.5) {
  const k = outBack(ramp(t, a, a + d));
  obj.visible = k > 0;
  obj.scale.setScalar(Math.max(0.001, k));
  return k;
}

// beads running along a path (steam, cooling water, current)
function beadFlow(points, n, r, color, parent = scene) {
  const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.2);
  const mesh = new THREE.InstancedMesh(
    new THREE.SphereGeometry(1, 8, 6),
    new THREE.MeshBasicMaterial({ color }),
    n,
  );
  mesh.frustumCulled = false;
  parent.add(mesh);
  return { curve, mesh, n, r };
}
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = V(1, 1, 1);
const _v = V(0, 0, 0);
function animateFlow(f, t, vis, speed, reveal = 1) {
  f.mesh.visible = vis > 0;
  if (!f.mesh.visible) return;
  for (let i = 0; i < f.n; i++) {
    const u = (i / f.n + t * speed) % 1;
    f.curve.getPointAt(u, _v);
    _s.setScalar(u <= reveal ? Math.max(1e-4, f.r * vis) : 1e-4);
    _m.compose(_v, _q, _s);
    f.mesh.setMatrixAt(i, _m);
  }
  f.mesh.instanceMatrix.needsUpdate = true;
}
function growTube(points, r, mat, parent = scene) {
  const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.2);
  const segs = 64;
  const geo = new THREE.TubeGeometry(curve, segs, r, 8, false);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  parent.add(mesh);
  return { mesh, segs };
}
function showTube(tube, k) {
  tube.mesh.visible = k > 0;
  tube.mesh.geometry.setDrawRange(0, Math.ceil(k * tube.segs) * 8 * 6);
}

// puffs of steam (kettle spout, cooling tower)
function puffs(n, seed) {
  const r = rng(seed);
  return Array.from({ length: n }, () => {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), M.steam.clone());
    scene.add(m);
    return { m, a: r(), b: r(), c: r() };
  });
}

// ---------------------------------------------------------------- hook: kettle
const kettle = new THREE.Group();
kettle.position.copy(P(R, [0, 0, 0.2]));
scene.add(kettle);
const SPOUT = P(R, [0.95, 1.25, 0.2]);
{
  const prof = [
    [0, 0],
    [0.62, 0],
    [0.66, 0.06],
    [0.62, 0.9],
    [0.5, 1.15],
    [0.32, 1.25],
    [0, 1.25],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const body = new THREE.Mesh(new THREE.LatheGeometry(prof, 16), M.kettle);
  body.position.y = 0.1;
  body.castShadow = true;
  kettle.add(body);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.76, 0.12, 16), M.rubber);
  base.position.y = 0.06;
  kettle.add(base);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), M.rubber);
  knob.position.y = 1.4;
  kettle.add(knob);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.07, 8, 16, Math.PI), M.rubber);
  handle.rotation.z = Math.PI / 2;
  handle.position.set(-0.62, 0.72, 0);
  kettle.add(handle);
  const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.16, 0.6, 10), M.kettle);
  spout.position.set(0.78, 1.0, 0);
  spout.rotation.z = -0.9;
  kettle.add(spout);
  const sw = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.08, 0.2),
    flat(0x3dff7a, { emissive: 0x3dff7a, emissiveIntensity: 0.8 }),
  );
  sw.position.set(-0.5, 0.25, 0.35);
  kettle.add(sw);
}
const kettleSteam = puffs(14, 11);

// ---------------------------------------------------------------- reactor building
const plant = new THREE.Group();
scene.add(plant);
const reactor = new THREE.Group();
reactor.position.copy(P(R));
plant.add(reactor);
const shellMat = xrayMaterial(0xe6e0d4);
{
  const prof = [V(0, 0, 0), V(1.0, 0, 0), V(1.0, 1.6, 0)];
  for (let k = 1; k <= 8; k++) {
    const a = (k / 8) * (Math.PI / 2);
    prof.push(V(Math.cos(a) * 1.0, 1.6 + Math.sin(a) * 1.0, 0));
  }
  const geo = new THREE.LatheGeometry(
    prof.map((p) => new THREE.Vector2(p.x, p.y)),
    24,
  );
  const shell = new THREE.Mesh(geo, shellMat);
  shell.castShadow = true;
  reactor.add(shell);
  reactor.add(xrayEdges(geo));
}
// inside: pressure vessel with glowing water
const inside = new THREE.Group();
reactor.add(inside);
const vessel = new THREE.Mesh(new THREE.CapsuleGeometry(0.46, 0.85, 6, 16), M.vessel);
vessel.position.y = 1.0;
vessel.renderOrder = 3;
inside.add(vessel);
const core = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.05, 16), M.core);
core.position.y = 0.93;
core.renderOrder = 2;
inside.add(core);
const coreLight = new THREE.PointLight(0x7dff3a, 0, 3.5, 1.5);
coreLight.position.y = 1.0;
inside.add(coreLight);
// 3 x 3 fuel rods
const FUEL = [];
for (let i = -1; i <= 1; i++)
  for (let j = -1; j <= 1; j++) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.8, 8), M.fuel);
    m.position.set(i * 0.2, 0.93, j * 0.2);
    inside.add(m);
    FUEL.push(m);
  }
// 4 control rods between them, hung from a yoke
const ctrl = new THREE.Group();
inside.add(ctrl);
for (const [x, z] of [
  [-0.1, -0.1],
  [0.1, -0.1],
  [-0.1, 0.1],
  [0.1, 0.1],
]) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.85, 8), M.rod);
  m.position.set(x, 0, z);
  ctrl.add(m);
}
{
  const yoke = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.05, 0.32), M.rod);
  yoke.position.y = 0.45;
  ctrl.add(yoke);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 6), M.steel);
  stem.position.y = 0.9;
  ctrl.add(stem);
}
const CTRL_IN = 0.93;
const CTRL_OUT = 0.93 + 0.85;
// neutrons hopping rod to rod
const NN = 80;
const neutrons = new THREE.InstancedMesh(
  new THREE.SphereGeometry(1, 8, 6),
  new THREE.MeshBasicMaterial({ color: 0x9ff3ff, depthTest: false }),
  NN,
);
neutrons.frustumCulled = false;
neutrons.renderOrder = 4;
inside.add(neutrons);

// ---------------------------------------------------------------- turbine hall
const hall = new THREE.Group();
hall.position.copy(P(H));
plant.add(hall);
const hallMat = xrayMaterial(0xd5dde6);
{
  const geo = new THREE.BoxGeometry(2.0, 1.2, 1.1);
  geo.translate(0, 0.6, 0);
  const box = new THREE.Mesh(geo, hallMat);
  box.castShadow = true;
  hall.add(box);
  hall.add(xrayEdges(geo));
}
const hallInside = new THREE.Group();
hall.add(hallInside);
const turbine = new THREE.Group();
turbine.position.set(-0.4, 0.55, 0);
hallInside.add(turbine);
const rotor = new THREE.Group();
turbine.add(rotor);
{
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.4, 8), M.steel);
  shaft.rotation.z = Math.PI / 2;
  shaft.position.x = 0.45;
  turbine.add(shaft);
  [
    [-0.25, 0.26],
    [-0.05, 0.32],
    [0.15, 0.38],
  ].forEach(([x, r]) => {
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 10), M.rotor);
    hub.rotation.z = Math.PI / 2;
    hub.position.x = x;
    rotor.add(hub);
    for (let k = 0; k < 10; k++) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.04, r, 0.08), M.rotor);
      const a = (k / 10) * Math.PI * 2;
      b.position.set(x, Math.cos(a) * (r / 2 + 0.05), Math.sin(a) * (r / 2 + 0.05));
      b.rotation.x = -a;
      b.rotateY(0.5);
      rotor.add(b);
    }
  });
}
const generator = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.55, 16), M.gen);
generator.rotation.z = Math.PI / 2;
generator.position.set(0.5, 0.55, 0);
hallInside.add(generator);
const genRing = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.03, 6, 20), M.steel);
genRing.rotation.y = Math.PI / 2;
genRing.position.set(0.5, 0.55, 0);
hallInside.add(genRing);

// steam pipe reactor -> turbine, cooling pipe hall -> tower, power line
const steamPts = [
  P(R, [0.15, 1.75, 0]),
  P(R, [0.6, 1.8, 0.1]),
  P(R, [1.1, 1.55, 0.2]),
  P(H, [-1.15, 0.75, -0.1]),
  P(H, [-0.75, 0.6, 0]),
];
const steamPipe = growTube(steamPts, 0.06, M.steel);
const steamFlow = beadFlow(steamPts, 26, 0.05, 0xffffff);
const coolPts = [
  P(H, [0.4, 0.15, -0.5]),
  P(H, [0.4, 0.15, -0.9]),
  P(C, [-0.2, 0.15, 1.3]),
  P(C, [-0.2, 0.15, 0.9]),
];
const coolPipe = growTube(coolPts, 0.07, M.alu);
const coolFlow = beadFlow(coolPts, 22, 0.06, 0x46b8ff);
const wirePts = [
  P(H, [0.5, 0.85, 0]),
  P(H, [0.65, 1.35, 0]),
  P(PY, [-0.9, 2.2, 0.05]),
  P(PY, [-0.45, 2.45, 0]),
];
const wire = growTube(wirePts, 0.025, M.wire);
const wire2Pts = [P(PY, [0.45, 2.45, 0]), P(PY, [1.6, 2.0, -0.6]), P(PY, [3.4, 2.2, -1.6])];
const wire2 = growTube(wire2Pts, 0.025, M.wire);
const sparks = beadFlow(wirePts.concat(wire2Pts), 30, 0.05, 0xffe14d);

// pylon
const pylon = new THREE.Group();
pylon.position.copy(P(PY));
scene.add(pylon);
{
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.3, 2.7, 4, 1, true), M.steel);
  mast.position.y = 1.35;
  mast.castShadow = true;
  pylon.add(mast);
  const lattice = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.CylinderGeometry(0.06, 0.3, 2.7, 4, 6)),
    new THREE.LineBasicMaterial({ color: 0x5b6670 }),
  );
  lattice.position.y = 1.35;
  pylon.add(lattice);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.06, 0.06), M.steel);
  arm.position.y = 2.45;
  pylon.add(arm);
}

// ---------------------------------------------------------------- cooling tower
const tower = new THREE.Group();
tower.position.copy(P(C));
scene.add(tower);
const TOWER_H = 3.5;
{
  const prof = [];
  for (let k = 0; k <= 14; k++) {
    const y = (k / 14) * TOWER_H;
    const r = 0.72 + 0.5 * Math.pow((y - 2.4) / 2.4, 2);
    prof.push(new THREE.Vector2(r, y));
  }
  const shell = new THREE.Mesh(new THREE.LatheGeometry(prof, 24), M.tower);
  shell.castShadow = true;
  tower.add(shell);
  const band = new THREE.Mesh(
    new THREE.CylinderGeometry(0.78, 0.76, 0.18, 24, 1, true),
    M.towerBand,
  );
  band.position.y = TOWER_H - 0.25;
  tower.add(band);
}
const towerSteam = puffs(22, 23);

// ---------------------------------------------------------------- analogy: sponge
const sponge = new THREE.Group();
sponge.position.copy(P(SP));
scene.add(sponge);
{
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.5, 0.75), M.sponge);
  body.position.y = 0.25;
  body.castShadow = true;
  sponge.add(body);
  const r = rng(5);
  for (let i = 0; i < 22; i++) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.035 + r() * 0.03, 6, 4), M.pore);
    const face = i % 2;
    p.position.set(
      (r() - 0.5) * 1.0,
      face ? 0.5 : 0.1 + r() * 0.35,
      face ? (r() - 0.5) * 0.65 : 0.375,
    );
    sponge.add(p);
  }
}
const SN = 18;
const spongeN = new THREE.InstancedMesh(
  new THREE.SphereGeometry(1, 8, 6),
  new THREE.MeshBasicMaterial({ color: 0xd8fbff }),
  SN,
);
spongeN.frustumCulled = false;
scene.add(spongeN);

// ---------------------------------------------------------------- analogy: small wind turbine
const windrad = new THREE.Group();
windrad.position.copy(P(WR));
scene.add(windrad);
const blades = new THREE.Group();
{
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.09, 1.9, 8), flat(0xf4f4f4));
  mast.position.y = 0.95;
  mast.castShadow = true;
  windrad.add(mast);
  const nac = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.22, 4, 8), flat(0xf4f4f4));
  nac.rotation.x = Math.PI / 2;
  nac.position.set(0, 1.95, 0);
  windrad.add(nac);
  blades.position.set(0, 1.95, 0.18);
  windrad.add(blades);
  for (let k = 0; k < 3; k++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.85, 0.03), flat(0xffffff));
    b.geometry.translate(0, 0.43, 0);
    b.rotation.z = (k / 3) * Math.PI * 2;
    blades.add(b);
  }
}
const windArrows = makeArrowSet(
  [
    [P(WR, [-0.3, 2.2, 1.6]), P(WR, [-0.1, 2.1, 0.4])],
    [P(WR, [0.3, 1.7, 1.6]), P(WR, [0.15, 1.8, 0.4])],
    [P(WR, [0.0, 2.6, 1.5]), P(WR, [0.0, 2.35, 0.4])],
  ],
  { mat: coldMat, r: 0.022, amp: 0.05 },
);
const hallSteamArrows = makeArrowSet(
  [
    [P(H, [-0.95, 0.75, 0.25]), P(H, [-0.55, 0.65, 0.25])],
    [P(H, [-0.95, 0.45, -0.25]), P(H, [-0.55, 0.5, -0.25])],
  ],
  { mat: coldMat, r: 0.02, amp: 0.04 },
);

const applyCamera = shotCamera(shots);

// ---------------------------------------------------------------- reactor physics (pure functions of t)
// how far the control rods are pushed in (0 = out, 1 = fully in)
function rodsIn(t) {
  if (t < T.steuer) return 0;
  let d = 0.55 * smooth(ramp(t, T.steuer + 0.1, T.steuer + 0.9));
  d = lerp(d, 1, smooth(ramp(t, T.rein, T.rein + 0.4)));
  d = lerp(d, 0.12, smooth(ramp(t, T.raus, T.raus + 0.4)));
  d = lerp(d, 0.45, smooth(ramp(t, T.heisse, T.heisse + 1.0)));
  return d;
}
function power(t) {
  const raw =
    0.5 * smooth(ramp(t, T.atome, T.kette)) +
    0.5 * smooth(ramp(t, T.kette, T.kette + 0.8)) +
    0.6 * smooth(ramp(t, T.wehe, T.ruder + 0.4));
  return raw * (1 - 0.72 * rodsIn(t));
}

const _c = new THREE.Color();
const BLUE = new THREE.Color(0x3fa6ff);
const HOT = new THREE.Color(0xff8a2a);
const DANGER = new THREE.Color(0xff2a1a);

// ---------------------------------------------------------------- render
function renderAt(t) {
  // hook: kettle steaming, swapped for the plant on "Lass"
  const kOut = inBack(ramp(t, T.lass, T.lass + 0.35));
  kettle.visible = kOut < 1;
  kettle.scale.setScalar(Math.max(0.001, 1 - kOut));
  kettleSteam.forEach(({ m, a, b, c }) => {
    const cyc = (t * 0.7 + a) % 1;
    m.position.set(
      SPOUT.x + 0.15 + cyc * 0.5 + (b - 0.5) * 0.2,
      SPOUT.y + cyc * 1.1,
      SPOUT.z + (c - 0.5) * 0.25,
    );
    m.scale.setScalar(0.06 + cyc * 0.2);
    m.material.opacity = 0.7 * Math.sin(cyc * Math.PI) * (1 - kOut);
    m.visible = kOut < 1;
  });

  // cooling tower cloud: on in the hook, off while building, back with the tower line
  const cloud = Math.max(
    1 - ramp(t, T.lass, T.lass + 0.6),
    smooth(ramp(t, T.kuehlturm + 0.2, T.kuehlturm + 1.4)),
  );
  const big = 1 + 0.35 * smooth(ramp(t, T.wolke2, T.wolke2 + 1));
  towerSteam.forEach(({ m, a, b, c }) => {
    const cyc = (t * 0.22 + a) % 1;
    const ang = b * Math.PI * 2;
    const rad = 0.25 + cyc * 0.7 * big;
    m.position.set(
      C[0] + Math.cos(ang) * rad + cyc * 0.6,
      TOWER_H + 0.1 + cyc * 2.2 * big,
      C[2] + Math.sin(ang) * rad * 0.7,
    );
    m.scale.setScalar((0.35 + cyc * 0.75 + c * 0.15) * big);
    m.material.opacity =
      0.7 * Math.sin(Math.min(1, cyc * 1.6) * Math.PI * 0.5 + 0.0) * (1 - cyc * 0.6) * cloud;
    m.visible = cloud > 0.01;
  });
  showNope(pop(t, T.rauch, T.lass, 0.3), C[0], TOWER_H + 1.6, C[2] + 0.6, 0.9);

  // reactor pops in, x-ray while it is explained
  popIn(reactor, t, T.lass + 0.25);
  const xr =
    smooth(ramp(t, T.brauchst - 0.1, T.brauchst + 0.4)) *
    (1 - smooth(ramp(t, T.schau, T.schau + 0.5)));
  setXray([shellMat, hallMat], xr);
  inside.visible = xr > 0.02;
  hallInside.visible = xr > 0.02 && t >= T.turbine - 0.1;

  FUEL.forEach((m, i) => {
    const k = outBack(ramp(t, T.uran + i * 0.05, T.uran + i * 0.05 + 0.35));
    m.visible = k > 0;
    m.scale.set(Math.max(0.001, k), Math.max(0.001, k), Math.max(0.001, k));
  });
  const pw = power(t);
  const danger =
    smooth(ramp(t, T.wehe + 0.3, T.ruder + 0.3)) * (1 - smooth(ramp(t, T.steuer, T.steuer + 0.8)));
  M.fuel.emissiveIntensity = 0.25 + 0.9 * pw;
  const heat = smooth(ramp(t, T.wasser1, T.n300 + 0.5));
  _c.copy(BLUE).lerp(HOT, heat).lerp(DANGER, danger);
  M.core.color.copy(_c);
  M.core.emissive.copy(_c);
  M.core.emissiveIntensity =
    0.3 + 0.5 * heat * Math.min(1.4, pw) + danger * 0.6 * (0.6 + 0.4 * Math.sin(t * 22));
  coreLight.color.copy(_c);
  coreLight.intensity = 3 * Math.min(1.6, pw);
  const shake = danger * 0.02 * Math.sin(t * 61);
  inside.position.x = shake;

  // control rods: drop in from above on "Steuerstäbe", move with rein / raus
  const ctrlK = ramp(t, T.steuer - 0.15, T.steuer + 0.2);
  ctrl.visible = ctrlK > 0;
  ctrl.position.y = lerp(CTRL_OUT + 0.6 * (1 - ctrlK), CTRL_IN, rodsIn(t));

  // neutrons: each hops from rod to rod, more of them when the power is up
  for (let i = 0; i < NN; i++) {
    const u = t * 1.7 + hash(i, 0.5) * 9;
    const k = Math.floor(u);
    const f = u - k;
    const a = FUEL[Math.floor(hash(i, k) * 9)].position;
    const b = FUEL[Math.floor(hash(i, k + 1) * 9)].position;
    const ya = 0.6 + hash(i + 3, k) * 0.65;
    const yb = 0.6 + hash(i + 3, k + 1) * 0.65;
    _v.set(
      lerp(a.x, b.x, f),
      lerp(ya, yb, f) + Math.sin(f * Math.PI) * 0.06,
      lerp(a.z, b.z, f) + 0.02,
    );
    const on = i / NN < pw * 0.62 && t >= T.atome;
    _s.setScalar(on ? 0.038 : 1e-4);
    _m.compose(_v, _q, _s);
    neutrons.setMatrixAt(i, _m);
  }
  neutrons.instanceMatrix.needsUpdate = true;

  // sponge analogy: particles fly in and vanish
  const spK = outBack(pop(t, T.schlucken - 0.3, T.rein + 0.2, 0.3));
  sponge.visible = spK > 0;
  sponge.scale.setScalar(Math.max(0.001, spK));
  const sk = pop(t, T.schlucken - 0.2, T.rein, 0.25);
  for (let i = 0; i < SN; i++) {
    const cyc = (t * 0.9 + hash(i, 1)) % 1;
    const sx = SP[0] - 1.6 + hash(i, 2) * 0.3;
    _v.set(
      lerp(sx, SP[0] + (hash(i, 3) - 0.5) * 0.7, cyc),
      lerp(0.9 + hash(i, 4) * 0.6, 0.45, cyc),
      SP[2] + (hash(i, 5) - 0.5) * 0.5,
    );
    _s.setScalar(sk > 0 ? Math.max(1e-4, 0.045 * (1 - smooth(ramp(cyc, 0.75, 1)))) : 1e-4);
    _m.compose(_v, _q, _s);
    spongeN.setMatrixAt(i, _m);
  }
  spongeN.visible = sk > 0;
  spongeN.instanceMatrix.needsUpdate = true;

  // turbine hall + steam
  popIn(hall, t, T.heisse + 0.1);
  showTube(steamPipe, smooth(ramp(t, T.heisse + 0.3, T.dampf + 0.3)));
  animateFlow(steamFlow, t, ramp(t, T.dampf, T.dampf + 0.3), 0.45);
  animateArrows(hallSteamArrows, t, pop(t, T.dampf + 0.4, T.wind));
  const tk = outBack(ramp(t, T.turbine, T.turbine + 0.4));
  turbine.visible = tk > 0;
  turbine.scale.setScalar(Math.max(0.001, tk));
  const spin = 9 * rampInt(t, T.turbine + 0.1, T.turbine + 1.6);
  rotor.rotation.x = spin;
  const gk = outBack(ramp(t, T.generator, T.generator + 0.4));
  generator.visible = gk > 0;
  genRing.visible = gk > 0;
  generator.scale.setScalar(Math.max(0.001, gk));
  generator.rotation.x = spin;
  M.gen.emissiveIntensity =
    0.5 * smooth(ramp(t, T.zack, T.zack + 0.4)) * (0.7 + 0.3 * Math.sin(t * 14));

  // wind turbine analogy
  const wdK = outBack(pop(t, T.wind - 0.3, T.generator + 0.1, 0.3));
  windrad.visible = wdK > 0;
  windrad.scale.setScalar(Math.max(0.001, wdK));
  blades.rotation.z = -6 * rampInt(t, T.wind - 0.1, T.wind + 0.8);
  animateArrows(windArrows, t, pop(t, T.wind - 0.1, T.generator));

  // power line
  const pk = popIn(pylon, t, T.generator + 0.3);
  pylon.visible = pk > 0;
  const wk = smooth(ramp(t, T.zack, T.zack + 0.5));
  showTube(wire, wk);
  showTube(wire2, smooth(ramp(t, T.zack + 0.3, T.strom + 0.4)));
  M.wire.emissiveIntensity = 0.9 * smooth(ramp(t, T.strom, T.strom + 0.3));
  animateFlow(sparks, t, ramp(t, T.strom, T.strom + 0.2), 0.6);

  // cooling water back to the tower
  showTube(coolPipe, smooth(ramp(t, T.kuehlturm, T.kuehlturm + 0.6)));
  animateFlow(coolFlow, t, ramp(t, T.kuehlturm + 0.3, T.kuehlturm + 0.6), 0.35);

  // LED panel, one fact at a time
  if (t >= T.n300 && t < T.wehe) {
    showPanel(pop(t, T.n300, T.wehe), "WASSER", "300°C", LED.red);
  } else if (t >= T.ruder && t < T.trick) {
    showPanel(pop(t, T.ruder, T.trick), "REAKTOR", "HEISS!", LED.red);
  } else if (t >= T.strom && t < T.kuehlturm) {
    showPanel(pop(t, T.strom, T.kuehlturm), "STROM", "AN", LED.green);
  } else {
    showPanel(0);
  }

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
