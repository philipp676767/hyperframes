// "So funktioniert ein Wassersprudler". World, captions, camera, panel, arrows
// and labels live in world.js; this file only builds the soda-maker story.
import {
  THREE,
  ramp,
  smooth,
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
  addFloor,
  showNope,
  makeArrowSet,
  animateArrows,
  forceMat,
  showPanel,
  showLabel,
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
  TIRES,
  GLASSES,
  BOT,
  GAUGE,
  VALVE,
  WATER_Y,
} from "./beats.js";

highlights(HIGHLIGHTS);
createWorld({ env: "insel", sky: "abend" });
addFloor(2.8, "#f6f1ea", "#cfe3ea");

Object.assign(M, {
  base: flat(0x2b2f36, { roughness: 0.5 }),
  cyl: flat(0x2f6fd0, { roughness: 0.35, metalness: 0.3 }),
  cylTop: flat(0xf3f3f3, { roughness: 0.4 }),
  brass: new THREE.MeshStandardMaterial({ color: 0xd9a63a, metalness: 0.7, roughness: 0.3 }),
  button: flat(0xffffff, { roughness: 0.3 }),
  needle: flat(0xe8283a, { emissive: 0xe8283a, emissiveIntensity: 0.3 }),
  pet: new THREE.MeshStandardMaterial({
    color: 0xd8f1ff,
    roughness: 0.08,
    transparent: true,
    opacity: 0.26,
    depthWrite: false,
    side: THREE.DoubleSide,
  }),
  soda: new THREE.MeshStandardMaterial({
    color: 0x3fa8f5,
    roughness: 0.05,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
  }),
  seal: flat(0x2f6fd0, { emissive: 0x3dff7a, emissiveIntensity: 0 }),
  bubble: flat(0xffffff, { roughness: 0.2, emissive: 0xcfeeff, emissiveIntensity: 0.35 }),
  gas: new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
  ring: new THREE.MeshBasicMaterial({ color: 0xffd23f, transparent: true, depthWrite: false }),
  board: flat(0xfff6e0),
  ice: new THREE.MeshStandardMaterial({
    color: 0xe6f8ff,
    roughness: 0.1,
    transparent: true,
    opacity: 0.8,
  }),
  icy: new THREE.MeshStandardMaterial({
    color: 0x6cc8ff,
    roughness: 0.05,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
  }),
  warm: new THREE.MeshStandardMaterial({
    color: 0xffb36b,
    roughness: 0.05,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  }),
});
M.gas.color.setRGB(1.3, 1.8, 2.4);

const box = (w, h, d, x, y, z, mat, parent) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};
const cylinder = (r0, r1, h, x, y, z, mat, parent, seg = 20) => {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  parent.add(m);
  return m;
};
const wrap = (u) => ((u % 1) + 1) % 1;
function canvasTex(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  draw(g);
  // redraw once Montserrat is there
  document.fonts.load('800 100px "Montserrat"').then(() => {
    draw(g);
    tex.needsUpdate = true;
  });
  return tex;
}

// ---------------------------------------------------------------- the machine
// Front = +z. Tower at the back holds the CO2 cylinder, the head overhangs
// the bottle, the button sits on top, the overpressure valve on the left.
const mach = new THREE.Group();
scene.add(mach);
const housing = new THREE.Group();
mach.add(housing);
const shellMat = xrayMaterial(0xf0603a, { roughness: 0.3 });
const headMat = xrayMaterial(0xf4f1ea, { roughness: 0.35 });
box(1.3, 0.12, 1.2, 0, 0.06, -0.03, M.base, housing);
const TOWER = { w: 1.2, h: 1.95, d: 0.5, y: 0.12 + 1.95 / 2, z: -0.36 };
box(TOWER.w, TOWER.h, TOWER.d, 0, TOWER.y, TOWER.z, shellMat, housing);
{
  const e = xrayEdges(new THREE.BoxGeometry(TOWER.w, TOWER.h, TOWER.d));
  e.position.set(0, TOWER.y, TOWER.z);
  housing.add(e);
}
const HEAD = { w: 1.1, h: 0.42, d: 1.05, y: 2.28, z: -0.085 };
box(HEAD.w, HEAD.h, HEAD.d, 0, HEAD.y, HEAD.z, headMat, housing);
{
  const e = xrayEdges(new THREE.BoxGeometry(HEAD.w, HEAD.h, HEAD.d));
  e.position.set(0, HEAD.y, HEAD.z);
  housing.add(e);
}
// big button on top
const button = new THREE.Group();
button.position.set(0, HEAD.y + HEAD.h / 2, 0.15);
housing.add(button);
cylinder(0.22, 0.24, 0.1, 0, 0.05, 0, M.button, button, 28);
cylinder(0.16, 0.16, 0.02, 0, 0.105, 0, M.cylTop, button, 28);
// overpressure valve, sticking out of the head on the left
const valve = new THREE.Group();
valve.position.set(...VALVE);
housing.add(valve);
{
  const v = cylinder(0.07, 0.07, 0.16, -0.02, 0, 0, M.brass, valve, 14);
  v.rotation.z = Math.PI / 2;
  const cap = cylinder(0.095, 0.095, 0.05, -0.12, 0, 0, M.brass, valve, 14);
  cap.rotation.z = Math.PI / 2;
}
// sound rings off the valve while it buzzes
const rings = [0, 1, 2].map(() => {
  const m = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.01, 6, 28), M.ring);
  m.rotation.y = Math.PI / 2;
  m.userData.noAO = true;
  scene.add(m);
  return m;
});

// CO2 cylinder (its own group: it pops in first, alone)
const CYL = { x: 0, z: -0.34, y0: 0.14, h: 1.5, r: 0.2 };
const cyl = new THREE.Group();
mach.add(cyl);
function buildCylinder(parent, withGauge) {
  cylinder(CYL.r, CYL.r, CYL.h, 0, CYL.y0 + CYL.h / 2, 0, M.cyl, parent, 24);
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(CYL.r, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    M.cylTop,
  );
  dome.position.y = CYL.y0 + CYL.h;
  parent.add(dome);
  cylinder(0.06, 0.06, 0.2, 0, CYL.y0 + CYL.h + 0.25, 0, M.brass, parent, 12);
  // white label band
  cylinder(CYL.r + 0.004, CYL.r + 0.004, 0.3, 0, CYL.y0 + CYL.h * 0.62, 0, M.cylTop, parent, 24);
  if (!withGauge) return null;
  // pipe to the gauge on the right of the tower
  const p = cylinder(0.025, 0.025, GAUGE[0] - 0.02, GAUGE[0] / 2, GAUGE[1], 0, M.brass, parent, 8);
  p.rotation.z = Math.PI / 2;
  const g = new THREE.Group();
  g.position.set(GAUGE[0], GAUGE[1], 0);
  parent.add(g);
  const rim = cylinder(0.17, 0.17, 0.06, 0, 0, 0, M.chrome, g, 28);
  rim.rotation.z = Math.PI / 2;
  const face = new THREE.Mesh(
    new THREE.CircleGeometry(0.15, 40),
    new THREE.MeshBasicMaterial({
      map: canvasTex(256, 256, (c) => {
        c.fillStyle = "#ffffff";
        c.fillRect(0, 0, 256, 256);
        c.lineCap = "round";
        for (let v = 0; v <= 80; v += 5) {
          const a = ((-135 + (v / 80) * 270) * Math.PI) / 180;
          const big = v % 20 === 0;
          c.strokeStyle = v >= 60 ? "#e8283a" : "#1c1c22";
          c.lineWidth = big ? 9 : 4;
          const r0 = big ? 88 : 98;
          c.beginPath();
          c.moveTo(128 + Math.sin(a) * r0, 128 - Math.cos(a) * r0);
          c.lineTo(128 + Math.sin(a) * 114, 128 - Math.cos(a) * 114);
          c.stroke();
          if (big) {
            c.fillStyle = "#1c1c22";
            c.font = '800 30px "Montserrat", sans-serif';
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillText(String(v), 128 + Math.sin(a) * 62, 128 - Math.cos(a) * 62);
          }
        }
        c.font = '800 28px "Montserrat", sans-serif';
        c.fillText("bar", 128, 200);
      }),
    }),
  );
  face.rotation.y = Math.PI / 2;
  face.position.x = 0.032;
  g.add(face);
  const needle = new THREE.Group();
  needle.position.x = 0.04;
  g.add(needle);
  const n = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.12, 0.018), M.needle);
  n.position.y = 0.05;
  needle.add(n);
  return needle;
}
cyl.position.set(CYL.x, 0, CYL.z);
const needle = buildCylinder(cyl, true);
// gauge sits at GAUGE (world); the cylinder group is shifted by CYL.z already
const needleAngle = (bar) => -((-135 + (bar / 80) * 270) * Math.PI) / 180;

// gas pipe: valve -> up into the head -> forward -> down through the neck to the nozzle
const pipePts = [
  V(0, CYL.y0 + CYL.h + 0.33, CYL.z),
  V(0, 2.2, CYL.z),
  V(0, 2.2, BOT[2]),
  V(0, 1.95, BOT[2]),
  V(0, 0.3, BOT[2]),
];
const pipePath = new THREE.CurvePath();
for (let i = 0; i < pipePts.length - 1; i++)
  pipePath.add(new THREE.LineCurve3(pipePts[i], pipePts[i + 1]));
{
  const upper = new THREE.CurvePath();
  for (let i = 0; i < 3; i++) upper.add(new THREE.LineCurve3(pipePts[i], pipePts[i + 1]));
  housing.add(new THREE.Mesh(new THREE.TubeGeometry(upper, 60, 0.032, 8), M.steel));
}
// the nozzle: chrome tube down into the bottle
cylinder(0.04, 0.03, 1.65, 0, 0.3 + 1.65 / 2, BOT[2], M.chrome, housing, 12);
// gas beads racing along the pipe
const GAS_N = 46;
const gasBeads = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.03, 1), M.gas, GAS_N);
gasBeads.userData.noAO = true;
scene.add(gasBeads);
const dummy = new THREE.Object3D();
const tmp = V(0, 0, 0);

// bottle (own group: it pops in with the housing and slides out for the payoff)
const bottle = new THREE.Group();
bottle.position.set(BOT[0], 0, BOT[2]);
mach.add(bottle);
{
  const prof = [
    [0.0, 0.14],
    [0.25, 0.14],
    [0.29, 0.18],
    [0.29, 1.58],
    [0.24, 1.72],
    [0.13, 1.84],
    [0.12, 2.02],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const pet = new THREE.Mesh(new THREE.LatheGeometry(prof, 32), M.pet);
  pet.renderOrder = 3;
  bottle.add(pet);
  const water = new THREE.Mesh(
    new THREE.CylinderGeometry(0.275, 0.275, WATER_Y - 0.16, 32),
    M.soda,
  );
  water.position.y = 0.16 + (WATER_Y - 0.16) / 2;
  water.renderOrder = 2;
  bottle.add(water);
}
const seal = cylinder(0.145, 0.145, 0.12, 0, 1.95, 0, M.seal, bottle, 24);
// pressure arrows in the head space above the water
const pressArrows = makeArrowSet(
  [
    [V(-0.13, 1.82, 0.02), V(-0.13, WATER_Y + 0.02, 0.02)],
    [V(0.13, 1.82, 0.02), V(0.13, WATER_Y + 0.02, 0.02)],
    [V(0, 1.86, -0.08), V(0, WATER_Y + 0.02, -0.08)],
  ],
  { parent: bottle, mat: forceMat, r: 0.02, amp: 0 },
);

// bubbles: jet from the nozzle, fine fizz everywhere, pearls out of the open neck
function bubbleSet(parent, n, seed, r0, r1) {
  const r = rng(seed);
  const mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), M.bubble, n);
  mesh.userData.noAO = true;
  mesh.userData.b = Array.from({ length: n }, () => ({
    a: r() * Math.PI * 2,
    d: r(),
    ph: r(),
    sp: 0.6 + r() * 0.8,
    s: r0 + r() * (r1 - r0),
    w: r() * 6,
  }));
  parent.add(mesh);
  return mesh;
}
const jet = bubbleSet(bottle, 70, 11, 0.022, 0.05);
const fizz = bubbleSet(bottle, 130, 12, 0.008, 0.02);
const pearls = bubbleSet(bottle, 90, 13, 0.012, 0.03);
const pops = bubbleSet(bottle, 10, 14, 0.04, 0.06); // bursting at the surface (rings)

// k 0..1 visible share, dis 0..1 bubbles dissolve on the way up
function animJet(t, k, dis) {
  jet.userData.b.forEach((b, i) => {
    const on = i < k * jet.count;
    const u = wrap(t * 0.9 * b.sp + b.ph);
    const spread = 0.04 + u * 0.2 * b.d;
    const y = 0.3 + u * (WATER_Y - 0.33);
    const s = on ? b.s * (0.6 + 0.6 * u) * (1 - dis * smooth(Math.min(1, u * 2.2))) : 0;
    dummy.position.set(
      Math.cos(b.a) * spread + Math.sin(t * 7 + b.w) * 0.01,
      y,
      Math.sin(b.a) * spread,
    );
    dummy.scale.setScalar(Math.max(0.0001, s));
    dummy.updateMatrix();
    jet.setMatrixAt(i, dummy.matrix);
  });
  jet.instanceMatrix.needsUpdate = true;
}
function animFizz(t, k) {
  fizz.userData.b.forEach((b, i) => {
    const on = i < k * fizz.count;
    const u = wrap(t * 0.3 * b.sp + b.ph);
    const rr = Math.sqrt(b.d) * 0.25;
    dummy.position.set(
      Math.cos(b.a) * rr + Math.sin(t * 3 + b.w) * 0.01,
      0.18 + u * (WATER_Y - 0.22),
      Math.sin(b.a) * rr,
    );
    dummy.scale.setScalar(on ? b.s * (0.7 + 0.5 * u) : 0.0001);
    dummy.updateMatrix();
    fizz.setMatrixAt(i, dummy.matrix);
  });
  fizz.instanceMatrix.needsUpdate = true;
}
function animPearls(t, k) {
  pearls.userData.b.forEach((b, i) => {
    const on = i < k * pearls.count;
    const u = wrap(t * 0.7 * b.sp + b.ph);
    const spread = 0.05 + u * 0.35 * b.d;
    const y = 1.95 + u * 1.0 + Math.sin(u * Math.PI) * 0.15;
    dummy.position.set(Math.cos(b.a) * spread, y, Math.sin(b.a) * spread);
    dummy.scale.setScalar(on ? b.s * (1 - u * 0.7) * k : 0.0001);
    dummy.updateMatrix();
    pearls.setMatrixAt(i, dummy.matrix);
  });
  pearls.instanceMatrix.needsUpdate = true;
}
function animPops(t, k) {
  pops.userData.b.forEach((b, i) => {
    const u = wrap(t * 1.6 * b.sp + b.ph);
    const rr = 0.18 * b.d;
    dummy.position.set(Math.cos(b.a) * rr, WATER_Y + 0.02 + u * 0.06, Math.sin(b.a) * rr);
    dummy.scale.set(1, 0.4, 1).multiplyScalar(k > 0 ? b.s * (0.4 + u) * (1 - u) * 2 : 0.0001);
    dummy.updateMatrix();
    pops.setMatrixAt(i, dummy.matrix);
  });
  pops.instanceMatrix.needsUpdate = true;
}

// hook sign: "SÄURE" gets crossed out
const sign = new THREE.Group();
sign.position.set(-0.95, 0, 0.75);
sign.rotation.y = 0.35;
mach.add(sign);
{
  box(0.06, 1.15, 0.06, 0, 0.6, 0, M.woodDark, sign);
  const board = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 0.36),
    new THREE.MeshBasicMaterial({
      map: canvasTex(512, 230, (g) => {
        g.fillStyle = "#fff6e0";
        g.fillRect(0, 0, 512, 230);
        g.strokeStyle = "#ffd23f";
        g.lineWidth = 22;
        g.strokeRect(11, 11, 490, 208);
        g.fillStyle = "#1c1c22";
        g.font = '800 120px "Montserrat", sans-serif';
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText("SÄURE", 256, 122);
      }),
    }),
  );
  board.position.set(0, 1.2, 0.035);
  sign.add(board);
  box(0.84, 0.4, 0.05, 0, 1.2, 0, M.woodDark, sign);
}

// ---------------------------------------------------------------- set: 30 car tyres
const tireSet = new THREE.Group();
tireSet.position.set(...TIRES);
scene.add(tireSet);
{
  const big = new THREE.Group();
  big.position.set(-0.85, 0, 0);
  big.scale.setScalar(1.15);
  tireSet.add(big);
  buildCylinder(big, false);
}
const TIRE_N = 30;
const tires = new THREE.InstancedMesh(
  new THREE.TorusGeometry(0.22, 0.09, 10, 22),
  M.rubber,
  TIRE_N,
);
const hubs = new THREE.InstancedMesh(
  new THREE.CylinderGeometry(0.14, 0.14, 0.1, 16),
  M.steel,
  TIRE_N,
);
tires.castShadow = hubs.castShadow = true;
tireSet.add(tires, hubs);
const tireAt = (i) => T.dreissig + 0.1 + i * 0.045;

// ---------------------------------------------------------------- set: ice-cold vs. warm glass
const glassSet = new THREE.Group();
glassSet.position.set(...GLASSES);
scene.add(glassSet);
const GL = [
  { x: -0.45, mat: M.icy, n: 64 },
  { x: 0.45, mat: M.warm, n: 30 },
];
const glassBubbles = [];
{
  box(1.9, 0.56, 1.0, 0, 0.28, 0, M.wood, glassSet);
  for (const g of GL) {
    const grp = new THREE.Group();
    grp.position.set(g.x, 0.56, 0);
    glassSet.add(grp);
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.22, 0.8, 28, 1, true), M.pet);
    glass.position.y = 0.4;
    glass.renderOrder = 3;
    grp.add(glass);
    const bottom = cylinder(0.22, 0.22, 0.03, 0, 0.015, 0, M.pet, grp, 28);
    bottom.renderOrder = 3;
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.255, 0.215, 0.62, 28), g.mat);
    w.position.y = 0.34;
    w.renderOrder = 2;
    grp.add(w);
    const b = bubbleSet(grp, g.n, 20 + g.n, 0.012, 0.028);
    glassBubbles.push(b);
  }
  // ice cubes in the cold glass
  const r = rng(77);
  for (let i = 0; i < 3; i++) {
    const c = box(
      0.13,
      0.13,
      0.13,
      GL[0].x - 0.08 + i * 0.08,
      0.56 + 0.62 + (i % 2) * 0.03,
      (r() - 0.5) * 0.12,
      M.ice,
      glassSet,
    );
    c.rotation.set(r(), r(), r());
  }
}
const twoSign = new THREE.Group();
twoSign.position.set(0, 0.3, 0.51);
glassSet.add(twoSign);
{
  const board = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.3),
    new THREE.MeshBasicMaterial({
      map: canvasTex(320, 192, (g) => {
        g.fillStyle = "#ffd23f";
        g.fillRect(0, 0, 320, 192);
        g.fillStyle = "#1c1c22";
        g.font = '800 130px "Montserrat", sans-serif';
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText("2×", 160, 104);
      }),
    }),
  );
  twoSign.add(board);
}
function animGlass(mesh, t, k) {
  mesh.userData.b.forEach((b, i) => {
    const u = wrap(t * 0.35 * b.sp + b.ph);
    const rr = Math.sqrt(b.d) * 0.2;
    dummy.position.set(Math.cos(b.a) * rr, 0.06 + u * 0.58, Math.sin(b.a) * rr);
    dummy.scale.setScalar(k > 0 ? b.s * k * (0.7 + 0.5 * u) : 0.0001);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
}

const applyCamera = shotCamera(shots);
const setPop = (set, k, at, t) => {
  set.visible = k > 0.001;
  if (k > 0) set.scale.copy(squash(t, at - 0.05)).multiplyScalar(k);
  else set.scale.setScalar(1e-3);
};

// ---------------------------------------------------------------- render
function renderAt(t) {
  const hook = t < T.du + 0.35;
  const cta = t >= T.wie;
  const housingAt = T.zylinder - 0.4;
  const bottleAt = T.zylinder - 0.25;

  // ---- the machine: shrinks away after the hook, rebuilt piece by piece
  mach.scale.setScalar(hook ? Math.max(0.001, 1 - inBack(ramp(t, T.du, T.du + 0.35))) : 1);
  sign.visible = t < T.warum;
  if (hook) {
    cyl.scale.set(1, 1, 1);
    housing.scale.set(1, 1, 1);
    bottle.scale.set(1, 1, 1);
  } else {
    cyl.scale.copy(squash(t, T.stahl + 0.1));
    housing.scale.copy(squash(t, housingAt));
    bottle.scale.copy(squash(t, bottleAt, 0.6));
  }
  cyl.visible = hook || t >= T.stahl + 0.1;
  housing.visible = hook || t >= housingAt;
  bottle.visible = hook || t >= bottleAt;
  puff("cyl", t, T.stahl + 0.3, 0, 0.05, CYL.z, 0.9);
  puff("housing", t, housingAt + 0.15, 0, 0.05, 0, 1.4);

  // gauge: 55 bar while running, swings 0 -> 60 on "60"
  let bar = 58;
  if (!hook)
    bar =
      t < T.sechzig
        ? 0
        : 60 * Math.min(1.08, smooth(ramp(t, T.sechzig, T.sechzig + 0.5)) * 1.08) -
          4.8 * smooth(ramp(t, T.sechzig + 0.5, T.sechzig + 0.9));
  needle.rotation.x = needleAngle(bar + Math.sin(t * 40) * 0.6);

  // x-ray while the inside is explained
  const xray =
    t >= housingAt && t < T.aufdrehen
      ? smooth(ramp(t, housingAt, housingAt + 0.3)) *
        (1 - smooth(ramp(t, T.aufdrehen - 0.3, T.aufdrehen)))
      : 0;
  setXray([shellMat, headMat], xray);

  // ---- running: button down, gas through the pipe, bubbles from the nozzle
  const gasOn = hook || (t >= T.zack && t < T.dicht) || (t >= T.druck && t < T.voll) || cta;
  const pressed = hook || (t >= T.druecken + 0.1 && t < T.aufdrehen) || cta;
  button.position.y = HEAD.y + HEAD.h / 2 - (pressed ? 0.06 : 0);
  gasBeads.visible = gasOn && (xray > 0.3 || bottle.visible);
  if (gasBeads.visible) {
    for (let i = 0; i < GAS_N; i++) {
      const u = wrap(i / GAS_N + t * 0.8);
      pipePath.getPointAt(u, tmp);
      // only the part inside the bottle shows when the shell is solid
      const show = xray > 0.3 || tmp.y < 1.9;
      dummy.position.copy(tmp);
      dummy.scale.setScalar(show ? 0.8 + 0.3 * Math.sin(i * 2.3 + t * 9) : 0.0001);
      dummy.updateMatrix();
      gasBeads.setMatrixAt(i, dummy.matrix);
    }
    gasBeads.instanceMatrix.needsUpdate = true;
  }
  const jetK =
    hook || cta ? 1 : t >= T.zack && t < T.aufdrehen ? smooth(ramp(t, T.zack, T.zack + 0.3)) : 0;
  const dis =
    t >= T.quetscht && t < T.aufdrehen ? smooth(ramp(t, T.quetscht, T.quetscht + 0.6)) : 0;
  animJet(t, jetK, dis);
  // dissolved gas: fine fizz in the hook, building up during the trick
  const fizzK =
    hook || cta
      ? 0.8
      : t >= T.quetscht && t < T.aufdrehen
        ? 0.9 * smooth(ramp(t, T.quetscht, T.voll))
        : t >= T.aufdrehen
          ? 1
          : 0;
  animFizz(t, fizzK);
  animPops(t, t >= T.blubbern && t < T.jetzt ? 1 : 0);
  showNope(pop(t, T.reicht - 0.1, T.jetzt), 0, WATER_Y + 0.42, BOT[2] + 0.2, 0.28);

  // the trick: seal locks, pressure arrows push down
  M.seal.emissiveIntensity =
    t >= T.dicht && t < T.aufdrehen ? 0.9 * (0.75 + 0.25 * Math.sin(t * 10)) : 0;
  animateArrows(pressArrows, t, pop(t, T.druck, T.undB));

  // overpressure valve: buzzes in the hook, on "voll", in the CTA
  const buzz = (t > T.warum && t < T.du) || (t >= T.ventil - 0.2 && t < T.aufdrehen) || cta;
  valve.position.set(VALVE[0] + (buzz ? Math.sin(t * 95) * 0.012 : 0), VALVE[1], VALVE[2]);
  mach.updateMatrixWorld(true);
  rings.forEach((m, i) => {
    const u = wrap(t * 1.4 + i / 3);
    m.visible = buzz && housing.visible;
    m.position.set(VALVE[0] - 0.18 - u * 0.4, VALVE[1], VALVE[2]).multiplyScalar(mach.scale.x);
    m.scale.setScalar(Math.max(0.001, (0.5 + u * 1.2) * mach.scale.x));
  });
  puff("voll", t, T.voll, VALVE[0] - 0.2, VALVE[1] - 0.1, VALVE[2], 0.35);
  puff("brummt", t, T.brummt, VALVE[0] - 0.2, VALVE[1] - 0.1, VALVE[2], 0.3);

  // ---- payoff: bottle slides out, pearls fountain from the open neck
  const out =
    t >= T.aufdrehen && t < T.schau ? smooth(ramp(t, T.aufdrehen, T.aufdrehen + 0.45)) : 0;
  bottle.position.set(BOT[0], -0.12 * out + Math.sin(Math.PI * out) * 0.3, BOT[2] + 1.0 * out);
  seal.visible = out < 0.5;
  animPearls(
    t,
    out > 0
      ? smooth(ramp(t, T.aufdrehen + 0.15, T.aufdrehen + 0.6))
      : t >= T.gebaut && t < T.uebrigens
        ? 0.4
        : 0,
  );

  // ---- set: 30 tyres stack up next to a cylinder
  const tk = pop(t, T.dreissig - 0.05, T.zylinder - 0.5);
  setPop(tireSet, tk, T.dreissig, t);
  for (let i = 0; i < TIRE_N; i++) {
    const s = i % 3;
    const lvl = Math.floor(i / 3);
    const at = tireAt(i);
    const fall = 1 - smooth(ramp(t, at, at + 0.22));
    dummy.position.set(-0.05 + s * 0.6, 0.09 + lvl * 0.18 + fall * 1.4, 0);
    dummy.rotation.set(Math.PI / 2, 0, 0);
    dummy.scale.setScalar(t >= at ? 1 : 0.0001);
    dummy.updateMatrix();
    tires.setMatrixAt(i, dummy.matrix);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    hubs.setMatrixAt(i, dummy.matrix);
  }
  tires.instanceMatrix.needsUpdate = true;
  hubs.instanceMatrix.needsUpdate = true;

  // ---- set: ice-cold glass holds twice the gas
  const gk = pop(t, T.uebrigens - 0.05, T.wie);
  setPop(glassSet, gk, T.uebrigens, t);
  animGlass(glassBubbles[0], t, 1);
  animGlass(glassBubbles[1], t, 1);
  twoSign.visible = t >= T.doppelt;
  twoSign.scale.copy(squash(t, T.doppelt));
  const gw = V(...GLASSES);
  showLabel(
    "eiskalt",
    pop(t, T.eiskalt + 0.1, T.wie),
    "eiskalt",
    gw.clone().add(V(-0.45, 0.95, 0.2)),
    -1,
  );
  showLabel("warm", pop(t, T.warmes, T.wie), "warm", gw.clone().add(V(0.45, 0.95, 0.2)), 1);

  // ---- LED panel: one fact at a time
  if (t >= T.sechzig && t < T.dreissig) {
    showPanel(pop(t, T.sechzig, T.dreissig), "DRUCK IM ZYLINDER", "60 bar", LED.yellow);
  } else if (t >= T.dreissig && t < T.zylinder - 0.5) {
    showPanel(pop(t, T.dreissig, T.zylinder - 0.5), "SO VIEL WIE AUTOREIFEN", "30×", LED.yellow);
  } else if (t >= T.voll && t < T.aufdrehen) {
    showPanel(pop(t, T.voll, T.aufdrehen), "FLASCHE", "VOLL", LED.green);
  } else if (t >= T.prozent - 0.1 && t < T.schau) {
    showPanel(pop(t, T.prozent - 0.1, T.schau), "ECHTE SÄURE", "< 1 %", LED.red);
  } else {
    showPanel(0);
  }

  // hook: "SÄURE" crossed out
  if (hook) {
    const sp = V(-0.95, 1.2, 0.78).multiplyScalar(mach.scale.x);
    showNope(pop(t, T.saeure1 + 0.05, T.warum), sp.x, sp.y, sp.z, 0.5 * mach.scale.x);
  }

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
