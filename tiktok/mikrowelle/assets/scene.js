// "So funktioniert eine Mikrowelle". World, captions, camera, panel, arrows
// and labels live in world.js; this file only builds the microwave story.
import {
  THREE,
  ramp,
  lerp,
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
  roundedRect,
  makeArrowSet,
  animateArrows,
  heatMat,
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
import { T, shots, LABELS, F, MG, MS, RT, PLATE_SPEED, FREEZE, plateTime } from "./beats.js";

createWorld({ env: "insel", sky: "morgen" });
addFloor(3.4);

Object.assign(M, {
  liner: xrayMaterial(0xdfe4ea, {
    metalness: 0.35,
    roughness: 0.35,
    emissive: 0x9fd8ff,
    emissiveIntensity: 0,
  }),
  food: flat(0xd97a3a, { emissive: 0xff3d1f, emissiveIntensity: 0 }),
  cheese: flat(0xffc94a, { emissive: 0xff3d1f, emissiveIntensity: 0 }),
  plate: new THREE.MeshStandardMaterial({
    color: 0xe8f7ff,
    roughness: 0.1,
    transparent: true,
    opacity: 0.6,
  }),
  fork: new THREE.MeshStandardMaterial({
    color: 0xdfe6ee,
    metalness: 0.9,
    roughness: 0.18,
    emissive: 0xffe066,
    emissiveIntensity: 0,
  }),
  black: flat(0x1c1d22, { roughness: 0.4 }),
  knob: flat(0xd9dde3, { roughness: 0.35, metalness: 0.3 }),
  wave: new THREE.MeshBasicMaterial({ color: 0xc58bff }),
  spark: new THREE.MeshBasicMaterial({ color: 0x38b6ff }),
  sparkCore: new THREE.MeshBasicMaterial({ color: 0xfff27a }),
  mag: new THREE.MeshStandardMaterial({
    color: 0xc8743c,
    metalness: 0.6,
    roughness: 0.35,
    emissive: 0xc58bff,
    emissiveIntensity: 0,
  }),
  oxy: flat(0xe8473b, { roughness: 0.4 }),
  hyd: flat(0xffffff, { roughness: 0.4 }),
  choc: flat(0x6b3a22, { roughness: 0.5, emissive: 0x6b3a22, emissiveIntensity: 0 }),
  wrapper: flat(0xd8343a),
  router: flat(0xf4f4f6, { roughness: 0.4 }),
});

// ---------------------------------------------------------------- microwave
const W0 = 2.4;
const H0 = 1.4;
const D0 = 1.6;
const Y0 = 0.08; // body bottom (feet below)
const TH = 0.06;
const XL = -W0 / 2;
const XD = 0.36; // door | control panel split
const ZF = D0 / 2;

const mw = new THREE.Group();
scene.add(mw);
const shellMat = xrayMaterial(0xf4f1ec);
const doorMat = xrayMaterial(0x2b2d33);
const panelMat = xrayMaterial(0x2b2d33);

function box(w, h, d, mat, x, y, z, parent = mw, edges = false) {
  const g = new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(g, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  parent.add(m);
  if (edges) {
    const e = xrayEdges(g);
    e.position.copy(m.position);
    parent.add(e);
  }
  return m;
}
// outer shell (separate panels, so the cavity stays open behind the window)
box(W0, TH, D0, shellMat, 0, Y0 + H0 - TH / 2, 0, mw, true);
box(W0, TH, D0, shellMat, 0, Y0 + TH / 2, 0, mw, true);
box(W0, H0, TH, shellMat, 0, Y0 + H0 / 2, -ZF + TH / 2, mw, true);
box(TH, H0, D0, shellMat, XL + TH / 2, Y0 + H0 / 2, 0, mw, true);
box(TH, H0, D0, shellMat, W0 / 2 - TH / 2, Y0 + H0 / 2, 0, mw, true);
// control panel front
box(W0 / 2 - XD, H0, TH, panelMat, (XD + W0 / 2) / 2, Y0 + H0 / 2, ZF - TH / 2, mw, true);
for (const sx of [-1, 1])
  for (const sz of [-1, 1]) {
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, Y0, 8), M.rubber);
    foot.position.set(sx * 1.0, Y0 / 2, sz * 0.6);
    mw.add(foot);
  }

// cavity liner (metal walls the waves bounce off)
const CX0 = XL + TH + 0.02;
const CX1 = XD - 0.05;
const CY0 = Y0 + TH;
const CY1 = Y0 + H0 - TH;
const CZ0 = -ZF + TH;
const cw = CX1 - CX0;
const ch = CY1 - CY0;
const cd = ZF - CZ0;
const ccx = (CX0 + CX1) / 2;
const ccy = (CY0 + CY1) / 2;
const ccz = (CZ0 + ZF) / 2;
const LT = 0.02;
box(cw, ch, LT, M.liner, ccx, ccy, CZ0 + LT / 2);
box(LT, ch, cd, M.liner, CX0 + LT / 2, ccy, ccz);
box(LT, ch, cd, M.liner, CX1 - LT / 2, ccy, ccz);
box(cw, LT, cd, M.liner, ccx, CY1 - LT / 2, ccz);
box(cw, LT, cd, M.liner, ccx, CY0 + LT / 2, ccz);
const lamp = new THREE.PointLight(0xffd9a0, 0, 3, 1.6);
lamp.position.set(ccx, CY1 - 0.15, 0.1);
mw.add(lamp);

// door: frame with a window hole, dark glass, dotted metal grid
const DW = XD - XL;
const doorPivot = new THREE.Group();
doorPivot.position.set(XL, Y0, ZF);
mw.add(doorPivot);
const doorShape = roundedRect(DW, H0, 0.06);
const WIN = { w: 1.08, h: 0.86, x: 0.2, y: 0.27 };
const hole = new THREE.Path();
const hx = WIN.x - DW / 2; // roundedRect is centred on x
hole.moveTo(hx, WIN.y);
hole.lineTo(hx + WIN.w, WIN.y);
hole.lineTo(hx + WIN.w, WIN.y + WIN.h);
hole.lineTo(hx, WIN.y + WIN.h);
hole.lineTo(hx, WIN.y);
doorShape.holes.push(hole);
const doorGeo = new THREE.ExtrudeGeometry(doorShape, {
  depth: 0.07,
  bevelEnabled: false,
  curveSegments: 4,
});
const door = new THREE.Mesh(doorGeo, doorMat);
door.position.x = DW / 2;
door.castShadow = true;
doorPivot.add(door);
const doorEdges = xrayEdges(doorGeo);
doorEdges.position.x = DW / 2;
doorPivot.add(doorEdges);
const glassMat = new THREE.MeshStandardMaterial({
  color: 0x3a4a5a,
  roughness: 0.1,
  transparent: true,
  opacity: 0.32,
  depthWrite: false,
});
const glass = new THREE.Mesh(new THREE.PlaneGeometry(WIN.w, WIN.h), glassMat);
glass.position.set(WIN.x + WIN.w / 2, WIN.y + WIN.h / 2, 0.04);
doorPivot.add(glass);
const gridCanvas = document.createElement("canvas");
gridCanvas.width = 256;
gridCanvas.height = 200;
{
  const g = gridCanvas.getContext("2d");
  g.fillStyle = "#ffffff";
  for (let y = 3; y < 200; y += 7)
    for (let x = 3; x < 256; x += 7) {
      g.beginPath();
      g.arc(x + ((y / 7) % 2) * 3.5, y, 1.8, 0, Math.PI * 2);
      g.fill();
    }
}
const gridTex = new THREE.CanvasTexture(gridCanvas);
gridTex.colorSpace = THREE.SRGBColorSpace;
const gridMat = new THREE.MeshBasicMaterial({
  map: gridTex,
  color: 0x4a5560,
  transparent: true,
  opacity: 0.55,
  depthWrite: false,
});
const grid = new THREE.Mesh(new THREE.PlaneGeometry(WIN.w, WIN.h), gridMat);
grid.position.set(WIN.x + WIN.w / 2, WIN.y + WIN.h / 2, 0.045);
doorPivot.add(grid);
const handleMat = xrayMaterial(0xc9ced4, { metalness: 0.6, roughness: 0.25 });
const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.8, 0.05), handleMat);
handle.position.set(DW - 0.1, H0 / 2, 0.1);
doorPivot.add(handle);

// control panel: display + knobs
const dispCanvas = document.createElement("canvas");
dispCanvas.width = 256;
dispCanvas.height = 96;
const dispTex = new THREE.CanvasTexture(dispCanvas);
dispTex.colorSpace = THREE.SRGBColorSpace;
let dispKey = "";
function drawDisplay(text) {
  if (text === dispKey) return;
  dispKey = text;
  const g = dispCanvas.getContext("2d");
  g.fillStyle = "#06120c";
  g.fillRect(0, 0, 256, 96);
  g.fillStyle = "#3dff7a";
  g.font = '800 64px "Montserrat", sans-serif';
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, 128, 52);
  dispTex.needsUpdate = true;
}
const PX = (XD + W0 / 2) / 2;
const disp = new THREE.Mesh(
  new THREE.PlaneGeometry(0.6, 0.22),
  new THREE.MeshBasicMaterial({ map: dispTex }),
);
disp.position.set(PX, Y0 + H0 - 0.28, ZF + 0.005);
mw.add(disp);
const knobs = [];
for (const [ky, kr] of [
  [0.78, 0.13],
  [0.42, 0.11],
]) {
  const k = new THREE.Mesh(new THREE.CylinderGeometry(kr, kr, 0.08, 16), M.knob);
  k.rotation.x = Math.PI / 2;
  k.position.set(PX, Y0 + ky, ZF + 0.04);
  mw.add(k);
  const tick = new THREE.Mesh(new THREE.BoxGeometry(0.025, kr * 0.8, 0.02), M.black);
  tick.position.set(0, 0.045, -kr * 0.45);
  tick.rotation.x = -Math.PI / 2;
  k.add(tick);
  knobs.push(k);
}
const startBtn = box(
  0.36,
  0.1,
  0.04,
  flat(0x3dff7a, { emissive: 0x3dff7a, emissiveIntensity: 0.4 }),
  PX,
  Y0 + 0.17,
  ZF + 0.01,
);

// magnetron + waveguide (right compartment, seen in x-ray)
const magnetron = new THREE.Group();
magnetron.position.set(...MG);
mw.add(magnetron);
{
  const core = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.3, 0.34), M.mag);
  core.castShadow = true;
  magnetron.add(core);
  for (let i = 0; i < 6; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.012, 0.44), M.alu);
    fin.position.y = -0.13 + i * 0.05;
    magnetron.add(fin);
  }
  const dome = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.14, 12), M.steel);
  dome.position.y = 0.22;
  magnetron.add(dome);
  const guide = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.2), M.alu);
  guide.position.set(-0.28, 0.32, 0.05);
  magnetron.add(guide);
}

// turntable + food + fork (rotate together)
const plate = new THREE.Group();
plate.position.set(F[0], F[1], F[2]);
mw.add(plate);
{
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.6, 0.03, 32), M.plate);
  disc.position.y = -0.015;
  plate.add(disc);
}
const FR = 0.3;
const FH = 0.26;
const foodBack = new THREE.Mesh(
  new THREE.CylinderGeometry(FR, FR, FH, 24, 1, false, Math.PI / 2, Math.PI),
  M.food,
);
foodBack.position.y = FH / 2;
foodBack.castShadow = true;
plate.add(foodBack);
const foodFront = new THREE.Group();
plate.add(foodFront);
{
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(FR, FR, FH, 24, 1, false, -Math.PI / 2, Math.PI),
    M.food,
  );
  m.position.y = FH / 2;
  m.castShadow = true;
  foodFront.add(m);
}
const cheese = new THREE.Mesh(new THREE.CylinderGeometry(FR + 0.01, FR + 0.01, 0.04, 24), M.cheese);
cheese.position.y = FH + 0.01;
plate.add(cheese);
// cut face: hot rim, cold core
const cutCanvas = document.createElement("canvas");
cutCanvas.width = 256;
cutCanvas.height = 112;
const cutTex = new THREE.CanvasTexture(cutCanvas);
cutTex.colorSpace = THREE.SRGBColorSpace;
let cutKey = "";
const HOT = [255, 61, 31];
const WARM = [255, 168, 58];
const COLD = [47, 155, 255];
function mix(a, b, k) {
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(",")})`;
}
function drawCut(depth, cold) {
  const key = depth.toFixed(2) + cold.toFixed(2);
  if (key === cutKey) return;
  cutKey = key;
  const g = cutCanvas.getContext("2d");
  const N = 40;
  for (let i = 0; i < N; i++) {
    const f = i / (N - 1); // 0 = rim, 1 = centre
    const inset = f * 56;
    const k = smooth(ramp(f, depth * 0.55, depth));
    const rim = f < depth * 0.55 ? mix(HOT, WARM, f / Math.max(0.01, depth * 0.55)) : null;
    g.fillStyle = rim ?? mix(WARM, COLD, Math.min(1, k * (0.6 + 0.4 * cold) + 0.4 * cold * k));
    g.fillRect(inset * 2.2, inset, 256 - inset * 4.4, 112 - inset * 2);
  }
  cutTex.needsUpdate = true;
}
const cut = new THREE.Mesh(
  new THREE.PlaneGeometry(FR * 2, FH),
  new THREE.MeshBasicMaterial({ map: cutTex }),
);
cut.position.set(0, FH / 2, 0.001);
plate.add(cut);
// conduction arrows: rim heat creeping inward
const inward = makeArrowSet(
  [
    [V(-FR + 0.02, FH / 2, 0.02), V(-0.08, FH / 2, 0.02)],
    [V(FR - 0.02, FH / 2, 0.02), V(0.08, FH / 2, 0.02)],
  ],
  { parent: plate, r: 0.012, amp: 0.012 },
);
// frost sparkles on the cold core
const NF = 14;
const frost = new THREE.InstancedMesh(
  new THREE.OctahedronGeometry(1, 0),
  new THREE.MeshBasicMaterial({ color: 0xe8fbff }),
  NF,
);
frost.frustumCulled = false;
plate.add(frost);
const frostSeed = (() => {
  const r = rng(7);
  return Array.from({ length: NF }, () => [r(), r(), r()]);
})();

// fork, lying tangentially on the plate, tines towards +x
const forkPivot = new THREE.Group();
plate.add(forkPivot);
const fork = new THREE.Group();
fork.position.set(0, 0.03, 0.43);
fork.rotation.z = 0.08;
fork.userData.size = 1.5;
forkPivot.add(fork);
const tips = [];
{
  const handleF = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.012, 0.045), M.fork);
  handleF.position.x = -0.12;
  fork.add(handleF);
  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.012, 0.07), M.fork);
  neck.position.x = 0.055;
  fork.add(neck);
  for (let i = 0; i < 4; i++) {
    const z = -0.03 + i * 0.02;
    const tine = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.01, 0.008), M.fork);
    tine.position.set(0.14, 0.004, z);
    fork.add(tine);
    tips.push(V(0.2, 0.006, z));
  }
}
// fork faces the camera in the middle of the metal beat
const FORK_T = T.funkt + 0.2;
const FORK_PHI = -PLATE_SPEED * (plateTime(FORK_T) - FREEZE[0]);
// in the hook the fork lies at the front too (it vanishes before it would jump)
const FORK_HOOK = -(PLATE_SPEED * (plateTime(1.6) - FREEZE[0]) + FORK_PHI);
// zig-zag spark bolts from the tines (thin boxes, re-rolled 14x per second)
const NBOLT = 4;
const NSEG = 4;
const bolts = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), M.spark, NBOLT * NSEG);
bolts.frustumCulled = false;
fork.add(bolts);
// bright star at each tine tip while it sparks
const stars = new THREE.InstancedMesh(new THREE.OctahedronGeometry(1, 0), M.sparkCore, NBOLT);
stars.frustumCulled = false;
fork.add(stars);
const sparkLight = new THREE.PointLight(0x7cc8ff, 0, 1.6, 1.5);
sparkLight.position.set(0.2, 0.06, 0);
fork.add(sparkLight);
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();
const _a = V(0, 0, 0);
const _b = V(0, 0, 0);
const _d = V(0, 0, 0);
const X1 = V(1, 0, 0);
function hash(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
function drawSparks(t, on) {
  const frame = Math.floor(t * 14);
  let i = 0;
  let lit = 0;
  for (let b = 0; b < NBOLT; b++) {
    const active = on > 0 && hash(frame * 7 + b) < 0.55 + 0.35 * on;
    const tip = tips[b];
    _a.copy(tip);
    for (let s = 0; s < NSEG; s++) {
      const h = frame * 31 + b * 13 + s * 5;
      _b.set(
        _a.x + 0.02 + hash(h) * 0.03,
        _a.y + (hash(h + 1) - 0.25) * 0.045,
        _a.z + (hash(h + 2) - 0.5) * 0.05,
      );
      if (active) {
        _d.copy(_b).sub(_a);
        const len = _d.length();
        _q.setFromUnitVectors(X1, _d.normalize());
        _s.set(len, 0.01, 0.01);
        _m.compose(_a.clone().add(_b).multiplyScalar(0.5), _q, _s);
      } else {
        _m.makeScale(0, 0, 0);
      }
      bolts.setMatrixAt(i++, _m);
      _a.copy(_b);
    }
    if (active) lit++;
    const ss = active ? 0.01 + 0.008 * hash(frame * 3 + b) : 0;
    _m.compose(tip, _q.setFromAxisAngle(X1, frame + b), _s.setScalar(ss + 1e-5));
    stars.setMatrixAt(b, _m);
  }
  bolts.instanceMatrix.needsUpdate = true;
  stars.instanceMatrix.needsUpdate = true;
  sparkLight.intensity = lit * 2.5 * on;
}

// waves inside the cavity: out of the waveguide, bouncing off the walls
const waveMain = makeArrowSet(
  [
    [V(CX1 - 0.05, CY1 - 0.2, -0.2), V(CX0 + 0.12, CY1 - 0.45, 0.25)],
    [V(CX0 + 0.08, CY1 - 0.3, -0.45), V(F[0] - 0.05, F[1] + 0.32, -0.05)],
    [V(CX1 - 0.1, CY1 - 0.5, 0.5), V(F[0] + 0.15, F[1] + 0.3, 0.1)],
    [V(CX0 + 0.1, CY0 + 0.25, 0.55), V(F[0] - 0.2, F[1] + 0.15, 0.08)],
  ],
  { parent: mw, mat: M.wave, r: 0.024, amp: 0.05 },
);
const waveDoor = makeArrowSet(
  [
    [V(-0.2, 0.85, 0.05), V(-0.2, 0.85, ZF - 0.08)],
    [V(-0.55, 0.6, ZF - 0.1), V(-0.6, 0.62, 0.0)],
    [V(-0.85, 1.0, 0.1), V(-0.82, 1.0, ZF - 0.08)],
  ],
  { parent: mw, mat: M.wave, r: 0.022, amp: 0.045 },
);
const heatUp = makeArrowSet(
  [
    [V(F[0] - 0.2, F[1] + 0.32, 0.1), V(F[0] - 0.3, F[1] + 0.85, 0.2)],
    [V(F[0] + 0.15, F[1] + 0.32, 0.12), V(F[0] + 0.25, F[1] + 0.9, 0.22)],
  ],
  { parent: mw, mat: heatMat },
);

// ---------------------------------------------------------------- WLAN router set
const router = new THREE.Group();
router.position.set(...RT);
scene.add(router);
{
  box(0.9, 0.16, 0.55, M.router, 0, 0.1, 0, router);
  for (const sx of [-0.32, 0.32]) {
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.55, 8), M.black);
    ant.position.set(sx, 0.45, -0.22);
    router.add(ant);
  }
  for (let i = 0; i < 4; i++)
    box(
      0.04,
      0.03,
      0.02,
      flat(0x3dff7a, { emissive: 0x3dff7a, emissiveIntensity: 1 }),
      -0.25 + i * 0.12,
      0.12,
      0.28,
      router,
    );
}
const rings = [];
for (let i = 0; i < 3; i++) {
  const mat = new THREE.MeshBasicMaterial({
    color: 0xc58bff,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
  });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.025, 6, 40, Math.PI * 0.9), mat);
  ring.rotation.z = Math.PI * 0.05;
  ring.position.set(0, 0.6, -0.22);
  router.add(ring);
  rings.push(ring);
}

// ---------------------------------------------------------------- water molecule set
const molSet = new THREE.Group();
molSet.position.set(...MS);
scene.add(molSet);
const slabMat = flat(0xd97a3a, { emissive: 0xff3d1f, emissiveIntensity: 0 });
box(1.7, 0.3, 1.2, slabMat, 0, 0.15, 0, molSet);
const mols = [];
{
  const r = rng(21);
  const spots = [
    [-0.55, -0.25],
    [-0.1, 0.25],
    [0.4, -0.2],
    [0.6, 0.3],
    [-0.5, 0.35],
    [0.1, -0.35],
    [0.15, 0.2],
  ];
  for (const [x, z] of spots) {
    const g = new THREE.Group();
    const o = new THREE.Mesh(new THREE.IcosahedronGeometry(0.11, 1), M.oxy);
    o.castShadow = true;
    g.add(o);
    for (const s of [-1, 1]) {
      const h = new THREE.Mesh(new THREE.IcosahedronGeometry(0.065, 1), M.hyd);
      const a = (52 * Math.PI) / 180;
      h.position.set(s * Math.sin(a) * 0.14, -Math.cos(a) * 0.14, 0);
      g.add(h);
    }
    g.position.set(x, 0.55 + r() * 0.15, z);
    g.rotation.y = r() * Math.PI;
    g.userData.phase = r() * 6;
    molSet.add(g);
    mols.push(g);
  }
}
const molWaves = makeArrowSet(
  [
    [V(-1.1, 0.75, 0.0), V(1.1, 0.75, 0.0)],
    [V(-1.1, 0.45, 0.3), V(1.1, 0.5, 0.3)],
  ],
  { parent: molSet, mat: M.wave, r: 0.025, amp: 0.06 },
);
const molHeat = makeArrowSet(
  [
    [V(-0.4, 0.75, 0.1), V(-0.5, 1.4, 0.2)],
    [V(0.35, 0.75, 0.0), V(0.45, 1.45, 0.1)],
  ],
  { parent: molSet },
);

// ---------------------------------------------------------------- chocolate + radar set
const choco = new THREE.Group();
choco.position.set(...RT);
scene.add(choco);
const bar = new THREE.Group();
bar.position.set(-0.15, 0.03, 0.15);
choco.add(bar);
{
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 2; j++)
      box(0.16, 0.12, 0.16, M.choc, -0.25 + i * 0.17, 0.06, -0.085 + j * 0.17, bar);
  box(0.3, 0.1, 0.36, M.wrapper, 0.48, 0.05, 0, bar);
}
const puddleMat = flat(0x5a301c, { roughness: 0.3 });
const puddle = new THREE.Mesh(new THREE.CircleGeometry(1, 24), puddleMat);
puddle.rotation.x = -Math.PI / 2;
puddle.position.set(-0.15, 0.012, 0.3);
choco.add(puddle);
const radar = new THREE.Group();
radar.position.set(0.4, 0, -0.75);
radar.scale.setScalar(0.7);
choco.add(radar);
{
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.8, 8), M.steel);
  pole.position.y = 0.4;
  radar.add(pole);
  const dish = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.32),
    flat(0xe6e9ee, { side: THREE.DoubleSide }),
  );
  dish.rotation.x = -Math.PI * 0.4; // hollow side faces the bar
  dish.position.y = 0.95;
  radar.add(dish);
}
const chocHeat = makeArrowSet(
  [
    [V(0.6, 0.65, -0.55), V(0.0, 0.22, 0.12)],
    [V(0.55, 0.55, -0.45), V(-0.3, 0.18, 0.2)],
  ],
  { parent: choco, mat: M.wave, r: 0.022, amp: 0.05 },
);

const applyCamera = shotCamera(shots);

// ---------------------------------------------------------------- render
function renderAt(t) {
  // microwave: running in the hook, shrinks away on "Lass", pops back in as a build
  const out = inBack(ramp(t, T.lass, T.lass + 0.35));
  const back = T.lass + 0.45;
  if (t < T.lass + 0.35) mw.scale.setScalar(Math.max(0.001, 1 - out));
  else mw.scale.copy(squash(t, back));
  mw.visible = t < T.lass + 0.35 || t >= back;
  puff("mw", t, back + 0.15, 0, 0.05, 0, 1.6);

  const xray =
    smooth(ramp(t, T.roehre - 0.2, T.roehre + 0.3)) * (1 - ramp(t, T.schau, T.schau + 0.5));
  setXray([M.liner], xray * 0.55);
  setXray([handleMat], xray * 0.9);
  setXray([shellMat, doorMat, panelMat], xray);
  glassMat.opacity = lerp(0.32, 0.1, xray);

  // running: lamp on, plate turns, magnetron glows
  const running = t < T.lass || (t >= T.roehre && t < T.gerade + 0.6);
  lamp.intensity = running ? 2.2 : 0;
  M.liner.emissiveIntensity = running ? 0.06 : 0;
  plate.rotation.y = PLATE_SPEED * (plateTime(t) - FREEZE[0]);
  knobs[0].rotation.z = -0.3 * ramp(t, 0, T.gerade);
  const mOn = t >= T.roehre && t < T.gerade + 0.6;
  magnetron.visible = t >= T.roehre;
  magnetron.scale.copy(t >= T.roehre ? squash(t, T.roehre + 0.1) : V(1, 1, 1));
  M.mag.emissiveIntensity = mOn ? 0.35 + 0.25 * Math.sin(t * 20) : 0;
  startBtn.material.emissiveIntensity = running ? 0.6 + 0.3 * Math.sin(t * 6) : 0.1;
  const remain = Math.max(0, Math.floor(42 - t));
  drawDisplay(t >= T.gerade ? "FERTIG" : `0:${String(remain).padStart(2, "0")}`);

  // waves: bounce through the cavity while it explains, and in the metal beat
  animateArrows(
    waveMain,
    t,
    pop(t, T.wellen1, T.wie - 0.1) +
      pop(t, T.magnetron - 0.16, T.jedes) +
      pop(t, T.spiegelt, T.gabel),
  );
  animateArrows(waveDoor, t, pop(t, T.darum, T.deshalb));
  // walls flash where the waves bounce off
  M.liner.emissiveIntensity += 0.5 * pop(t, T.spiegelt, T.gabel) * (0.6 + 0.4 * Math.sin(t * 12));

  // door grid lights up when it's named
  const gk = pop(t, T.gitter - 0.1, T.deshalb);
  gridMat.color.setHex(0x4a5560).lerp(new THREE.Color(0xc58bff), gk);
  // keep the grid faint in close-ups, it would blur over everything
  gridMat.opacity = lerp(lerp(0.3, 0.08, xray), 0.85, gk);

  // food: cut open for the centimetre beat, rim glows on the payoff
  const cutK =
    inBack(ramp(t, T.aber + 0.3, T.aber + 0.6)) * (1 - ramp(t, FREEZE[1], FREEZE[1] + 0.3));
  foodFront.visible = cutK < 0.999;
  foodFront.scale.setScalar(Math.max(0.001, 1 - cutK));
  foodFront.position.z = 0.25 * cutK;
  const depth =
    lerp(0.18, 0.3, smooth(ramp(t, T.zenti, T.zenti + 0.8))) +
    0.12 * smooth(ramp(t, T.mitgew, T.eiskalt));
  drawCut(depth, smooth(ramp(t, T.eiskalt - 0.2, T.eiskalt + 0.4)));
  animateArrows(inward, t, pop(t, T.mitgew - 0.3, FREEZE[1]));
  const fr = pop(t, T.eiskalt - 0.1, FREEZE[1]);
  for (let i = 0; i < NF; i++) {
    const [a, b, c] = frostSeed[i];
    const tw = 0.5 + 0.5 * Math.sin(t * 7 + c * 20);
    _m.compose(
      V((a - 0.5) * 0.18, FH / 2 + (b - 0.5) * 0.09, 0.012),
      _q.identity(),
      _s.setScalar(fr * 0.012 * tw + 1e-4),
    );
    frost.setMatrixAt(i, _m);
  }
  frost.instanceMatrix.needsUpdate = true;
  const rimHot =
    0.35 * smooth(ramp(t, T.heiss1, T.heiss1 + 1)) * (t < T.lass ? 0 : 1) +
    0.45 * pop(t, T.deshalb, T.schau);
  M.food.emissiveIntensity = rimHot;
  M.cheese.emissiveIntensity = rimHot * 0.6;
  animateArrows(heatUp, t, pop(t, T.deshalb, T.schau));

  // fork: in the hook and from "Gabelspitzen" on; tines charge up, then spark
  const forkOn = t < T.lass || (t >= T.gabel && t < T.schau);
  forkPivot.rotation.y = FORK_PHI + (t < T.lass ? FORK_HOOK : 0);
  fork.visible = forkOn;
  if (t >= T.gabel) fork.scale.copy(squash(t, T.gabel + 0.1, 0.75, fork.userData.size));
  else fork.scale.setScalar(fork.userData.size);
  M.fork.emissiveIntensity = 0.8 * pop(t, T.staut, T.darum + 0.5) * (0.6 + 0.4 * Math.sin(t * 25));
  const sparkOn = (t < T.lass ? 1 : 0) + pop(t, T.funkt - 0.05, T.darum + 0.6, 0.1);
  drawSparks(t, forkOn ? Math.min(1, sparkOn) : 0);

  // WLAN router: rings ripple out
  const rk = pop(t, T.wie - 0.1, T.magnetron - 0.16);
  router.visible = rk > 0.001;
  router.scale.copy(rk > 0 ? squash(t, T.wie - 0.05).multiplyScalar(rk) : V(0.001, 0.001, 0.001));
  rings.forEach((ring, i) => {
    const c = (t * 0.9 + i / 3) % 1;
    ring.scale.setScalar(0.25 + c * 1.1);
    ring.material.opacity = 0.85 * (1 - c);
  });

  // water molecules: wiggle back and forth, the slab heats up
  const mk = pop(t, T.jedes - 0.05, T.aber);
  molSet.visible = mk > 0.001;
  molSet.scale.setScalar(Math.max(0.001, mk));
  const wig =
    smooth(ramp(t, T.wasser, T.wasser + 0.4)) *
    (1 + smooth(ramp(t, T.zweieinhalb, T.zweieinhalb + 0.3)));
  for (const g of mols) {
    const ph = g.userData.phase;
    g.rotation.z = Math.sin(t * 34 + ph) * 0.55 * wig;
  }
  slabMat.emissiveIntensity = 0.5 * smooth(ramp(t, T.heiss1 - 0.2, T.heiss1 + 0.8));
  animateArrows(molWaves, t, mk);
  animateArrows(molHeat, t, pop(t, T.heiss1, T.aber));

  // chocolate bar melts next to the radar dish
  const ck = pop(t, T.uebrigens, T.schon + 0.6);
  choco.visible = ck > 0.001;
  choco.scale.copy(
    ck > 0 ? squash(t, T.uebrigens + 0.1).multiplyScalar(ck) : V(0.001, 0.001, 0.001),
  );
  radar.rotation.y = Math.sin(t * 1.3) * 0.6;
  const melt = smooth(ramp(t, T.schoko + 0.3, T.schmolz + 0.5));
  bar.scale.set(1 + 0.12 * melt, 1 - 0.65 * melt, 1 + 0.1 * melt);
  M.choc.emissiveIntensity = 0.3 * melt;
  puddle.scale.set(0.05 + 0.5 * melt, 0.05 + 0.28 * melt, 1);
  animateArrows(chocHeat, t, pop(t, T.uebrigens + 0.4, T.schon));

  // LED panel: one fact at a time
  if (t >= T.zweieinhalb && t < T.aber) {
    showPanel(pop(t, T.zweieinhalb, T.aber), "MILLIARDEN / SEK.", "2,45", LED.yellow);
  } else if (t >= T.zenti && t < FREEZE[1]) {
    showPanel(pop(t, T.zenti, FREEZE[1]), "WELLEN REICHEN", "1–3 cm", LED.red);
  } else {
    showPanel(0);
  }

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
