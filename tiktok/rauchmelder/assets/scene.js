// "So funktioniert ein Rauchmelder" (Ionisationsrauchmelder). World, captions,
// camera, panel, arrows and labels live in world.js; this file only builds
// the smoke detector story.
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
import { T, shots, LABELS, D, C, PS, TO, FLOW_ON, FLOW_OFF } from "./beats.js";

createWorld({ env: "winter", sky: "abend" });
addFloor(3.4, "#e8d2b0", "#d4b896");

Object.assign(M, {
  wall: flat(0xf6cfa8, { roughness: 0.9 }),
  ceiling: flat(0xc89a6a, { roughness: 0.8 }),
  plate: new THREE.MeshStandardMaterial({
    color: 0xc9d1da,
    metalness: 0.75,
    roughness: 0.25,
    emissive: 0x4fc3ff,
    emissiveIntensity: 0,
  }),
  am: flat(0x7dff6a, { emissive: 0x5cff4a, emissiveIntensity: 1.2 }),
  pcb: flat(0x1f8a4c, { roughness: 0.5 }),
  chip: flat(0x1c1d22, { emissive: 0xff2a1a, emissiveIntensity: 0 }),
  wire: flat(0xd9824a, { metalness: 0.4, emissive: 0xffd23f, emissiveIntensity: 0 }),
  led: flat(0x5a1010, { emissive: 0xff2a1a, emissiveIntensity: 0 }),
  ion: new THREE.MeshBasicMaterial({ color: 0x4fc3ff }),
  electron: new THREE.MeshBasicMaterial({ color: 0xffe066 }),
  ray: new THREE.MeshBasicMaterial({ color: 0xc6ff4a }),
  smoke: new THREE.MeshStandardMaterial({
    color: 0x8a8d96,
    roughness: 1,
    flatShading: true,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
  }),
  smokeIn: flat(0x6f727b, { roughness: 1 }),
  stone: flat(0x9aa0a8, { roughness: 0.9 }),
  paper: flat(0xfbfbf7, { side: THREE.DoubleSide }),
  snow: flat(0xffffff, { roughness: 0.7 }),
  carrot: flat(0xff8a2a),
  toaster: new THREE.MeshStandardMaterial({ color: 0xdfe4ea, metalness: 0.8, roughness: 0.2 }),
  toast: flat(0x3a2518, { emissive: 0xff5a1a, emissiveIntensity: 0 }),
  glass: new THREE.MeshStandardMaterial({
    color: 0xdff4ff,
    roughness: 0.1,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
  }),
  sand: flat(0xf1c56a),
});

function hash(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
function box(w, h, d, mat, x, y, z, parent = scene) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = V(1, 1, 1);
const _p = V(0, 0, 0);
const Y1 = V(0, 1, 0);

// ---------------------------------------------------------------- room corner
// back wall + ceiling: the detector hangs where it belongs
box(3.8, 3.16, 0.15, M.wall, 0, 1.58, -1.8);
box(3.8, 0.16, 3.3, M.ceiling, 0, 3.08, -0.3);
const roomLight = new THREE.PointLight(0xffe2b0, 7, 8, 1.3);
roomLight.position.set(0.9, 1.6, 1.6);
scene.add(roomLight);

// ---------------------------------------------------------------- smoke detector
const det = new THREE.Group();
det.position.set(...D);
scene.add(det);
const HR = 1.1; // housing radius (top)
const HH = 0.6;
const shellMat = xrayMaterial(0xf4f1ec);
const ventMat = xrayMaterial(0x7a808a, { emissive: 0x5cff4a, emissiveIntensity: 0 });
{
  const geo = new THREE.CylinderGeometry(HR, HR - 0.1, HH, 40, 1, true);
  const shell = new THREE.Mesh(geo, shellMat);
  shell.castShadow = true;
  det.add(shell);
  det.add(xrayEdges(geo));
  const mount = new THREE.Mesh(new THREE.CylinderGeometry(HR + 0.03, HR + 0.03, 0.08, 40), M.alu);
  mount.position.y = HH / 2 + 0.04;
  det.add(mount);
  // vent slots around the side
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const v = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.03), ventMat);
    v.position.set(Math.sin(a) * (HR - 0.04), -0.02, Math.cos(a) * (HR - 0.04));
    v.rotation.y = a;
    det.add(v);
  }
}
// bottom face: vent ring + yellow radiation sticker (canvas texture)
const faceCanvas = document.createElement("canvas");
faceCanvas.width = 512;
faceCanvas.height = 512;
{
  const g = faceCanvas.getContext("2d");
  g.fillStyle = "#f4f1ec";
  g.fillRect(0, 0, 512, 512);
  g.strokeStyle = "#c9c4bb";
  g.lineWidth = 10;
  for (const r of [235, 200]) {
    g.beginPath();
    g.arc(256, 256, r, 0, Math.PI * 2);
    g.stroke();
  }
  g.fillStyle = "#ffd23f";
  g.beginPath();
  g.arc(256, 256, 130, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "#1c1c22";
  g.lineWidth = 8;
  g.stroke();
  g.fillStyle = "#1c1c22";
  for (let k = 0; k < 3; k++) {
    const a = (k * 2 * Math.PI) / 3 - Math.PI / 2;
    g.beginPath();
    g.arc(256, 256, 108, a - Math.PI / 6, a + Math.PI / 6);
    g.arc(256, 256, 34, a + Math.PI / 6, a - Math.PI / 6, true);
    g.closePath();
    g.fill();
  }
  g.beginPath();
  g.arc(256, 256, 22, 0, Math.PI * 2);
  g.fill();
}
const faceTex = new THREE.CanvasTexture(faceCanvas);
faceTex.colorSpace = THREE.SRGBColorSpace;
const faceMat = new THREE.MeshStandardMaterial({
  map: faceTex,
  roughness: 0.6,
  emissive: 0xffd23f,
  emissiveMap: faceTex,
  emissiveIntensity: 0,
  transparent: true,
  opacity: 1,
});
const face = new THREE.Mesh(new THREE.CircleGeometry(HR - 0.1, 40), faceMat);
face.rotation.x = Math.PI / 2;
face.position.y = -HH / 2 - 0.002;
det.add(face);
const led = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), M.led);
led.position.set(0.62, -HH / 2 - 0.01, 0.42);
det.add(led);
const ledLight = new THREE.PointLight(0xff2a1a, 0, 3, 1.5);
ledLight.position.set(0.62, -HH / 2 - 0.2, 0.42);
det.add(ledLight);

// chamber: two plates, the americium crumb on the lower one
const cx = C[0] - D[0];
const PY0 = -0.14; // lower plate
const PY1 = 0.12; // upper plate
const PR = 0.4;
const plates = [PY0, PY1].map((y) => {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(PR, PR, 0.025, 32), M.plate);
  m.position.set(cx, y, 0);
  m.castShadow = true;
  det.add(m);
  return m;
});
const source = new THREE.Group();
source.position.set(cx, PY0 + 0.015, 0);
det.add(source);
{
  const holder = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.02, 16), M.alu);
  source.add(holder);
  const crumb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.035, 0), M.am);
  crumb.position.y = 0.025;
  source.add(crumb);
}
const amLight = new THREE.PointLight(0x5cff4a, 0, 0.6, 2);
amLight.position.set(cx, PY0 + 0.1, 0);
det.add(amLight);

// electronics: board, battery, chip
box(0.45, 0.03, 0.75, M.pcb, 0.62, -0.2, 0.05, det);
box(0.28, 0.16, 0.32, flat(0x2b2d33), 0.62, -0.1, -0.5, det);
box(0.28, 0.02, 0.32, flat(0xe8473b), 0.62, -0.01, -0.5, det);
const chip = box(0.2, 0.06, 0.2, M.chip, 0.6, -0.16, 0.18, det);
for (const [a, b] of [
  [V(cx + 0.38, PY1, 0.05), V(0.42, -0.18, 0.0)],
  [V(cx + 0.38, PY0, 0.12), V(0.42, -0.18, 0.2)],
]) {
  const mid = a
    .clone()
    .lerp(b, 0.5)
    .add(V(0, 0.05, 0.08));
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a, mid, b]), 16, 0.012, 6),
    M.wire,
  );
  det.add(tube);
}

// alpha rays: short bright streaks fanning out from the crumb
const NR = 12;
const rays = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), M.ray, NR);
rays.frustumCulled = false;
det.add(rays);
const RAY_O = V(cx, PY0 + 0.04, 0);
const _dir = V(0, 0, 0);
function drawRays(t, k) {
  for (let i = 0; i < NR; i++) {
    const u = t * 2.4 + hash(i * 3.1);
    const cyc = Math.floor(u);
    const f = u - cyc;
    const a = hash(cyc * 17 + i) * Math.PI * 2;
    const up = 0.05 + hash(cyc * 5 + i) * 0.5;
    _dir.set(Math.cos(a), up, Math.sin(a)).normalize();
    const d = 0.04 + f * 0.3;
    _p.copy(RAY_O).addScaledVector(_dir, d);
    _q.setFromUnitVectors(Y1, _dir);
    const s = k * (1 - f * 0.6);
    _s.set(0.012 * s + 1e-4, 0.08 * s + 1e-4, 0.012 * s + 1e-4);
    _m.compose(_p, _q, _s);
    rays.setMatrixAt(i, _m);
  }
  rays.instanceMatrix.needsUpdate = true;
}

// smoke specks inside the chamber + ions (blue) and electrons (yellow)
const NS = 7;
const smokeIn = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), M.smokeIn, NS);
smokeIn.frustumCulled = false;
det.add(smokeIn);
const smokeSeed = (() => {
  const r = rng(31);
  return Array.from({ length: NS }, () => {
    const a = r() * Math.PI * 2;
    const rr = 0.08 + r() * 0.22;
    return { x: cx + Math.cos(a) * rr, z: Math.sin(a) * rr, y: -0.07 + r() * 0.12, a, ph: r() * 6 };
  });
})();
const smokePos = smokeSeed.map(() => V(0, 0, 0));
function placeSmoke(t, k) {
  smokeSeed.forEach((s, i) => {
    const enter = smooth(ramp(t, T.rauch1 + i * 0.09, T.rauch1 + 0.9 + i * 0.09));
    const ex = cx + Math.cos(s.a) * 1.05;
    const ez = Math.sin(s.a) * 1.05;
    smokePos[i].set(
      lerp(ex, s.x + Math.sin(t * 0.7 + s.ph) * 0.02, enter),
      s.y + Math.sin(t * 0.9 + s.ph) * 0.012,
      lerp(ez, s.z + Math.cos(t * 0.6 + s.ph) * 0.02, enter),
    );
    _m.compose(
      smokePos[i],
      _q.setFromAxisAngle(Y1, t * 0.5 + s.ph),
      _s.setScalar(k * enter * (0.04 + 0.015 * Math.sin(s.ph)) + 1e-4),
    );
    smokeIn.setMatrixAt(i, _m);
  });
  smokeIn.instanceMatrix.needsUpdate = true;
}
const NI = 22;
const ions = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), M.ion, NI);
const elecs = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), M.electron, NI);
ions.frustumCulled = false;
elecs.frustumCulled = false;
det.add(ions, elecs);
const ionSeed = (() => {
  const r = rng(11);
  return Array.from({ length: NI }, () => {
    const a = r() * Math.PI * 2;
    const rr = 0.06 + Math.sqrt(r()) * 0.3;
    return {
      x: cx + Math.cos(a) * rr,
      z: Math.sin(a) * rr,
      ph: r(),
      o: [r() - 0.5, r() - 0.5, r() - 0.5],
    };
  });
})();
// distance travelled by the drift: integral of the flow (deterministic table)
const STEP = 1 / 60;
const flowAt = (t) => smooth(ramp(t, ...FLOW_ON)) * (1 - smooth(ramp(t, ...FLOW_OFF)));
const drift = [0];
for (let i = 1; i < 60 * 70; i++) drift.push(drift[i - 1] + flowAt(i * STEP) * STEP);
const driftAt = (t) => drift[Math.max(0, Math.min(drift.length - 1, Math.round(t / STEP)))];
const GAP0 = PY0 + 0.02;
const GAP1 = PY1 - 0.02;
const MID = (GAP0 + GAP1) / 2;
function placeIons(t, k, stick) {
  const d = driftAt(t) * 0.9 + t * 0.04;
  ionSeed.forEach((s, i) => {
    const f = (d + s.ph) % 1;
    const sm = smokePos[i % NS];
    const st = smooth(clamp(stick - (i % 5) * 0.08));
    // ion drifts up, its electron down; both get caught by a smoke speck
    _p.set(s.x, lerp(MID, GAP1, f), s.z);
    _p.lerp(V(sm.x + s.o[0] * 0.08, sm.y + 0.03 + s.o[1] * 0.04, sm.z + s.o[2] * 0.08), st);
    _m.compose(_p, _q.identity(), _s.setScalar(k * 0.022 + 1e-4));
    ions.setMatrixAt(i, _m);
    _p.set(s.x + 0.03, lerp(MID, GAP0, (f + 0.5) % 1), s.z - 0.02);
    _p.lerp(V(sm.x - s.o[0] * 0.08, sm.y - 0.03 - s.o[1] * 0.04, sm.z - s.o[2] * 0.08), st);
    _m.compose(_p, _q, _s.setScalar(k * 0.014 + 1e-4));
    elecs.setMatrixAt(i, _m);
  });
  ions.instanceMatrix.needsUpdate = true;
  elecs.instanceMatrix.needsUpdate = true;
}
const clamp = (x) => Math.min(1, Math.max(0, x));

// alarm: sound rings below the detector
const rings = [0, 1, 2].map(() => {
  const mat = new THREE.MeshBasicMaterial({
    color: 0xff4b2b,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.03, 6, 48), mat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -HH / 2 - 0.15;
  det.add(ring);
  return ring;
});

// ---------------------------------------------------------------- toaster + smoke
const toaster = new THREE.Group();
toaster.position.set(...TO);
toaster.rotation.y = -0.4;
scene.add(toaster);
{
  box(0.7, 0.42, 0.42, M.toaster, 0, 0.23, 0, toaster);
  box(0.04, 0.08, 0.06, M.ceiling, 0.37, 0.3, 0, toaster);
  for (const z of [-0.09, 0.09]) box(0.5, 0.3, 0.05, M.toast, 0, 0.5, z, toaster);
}
const NP = 18;
const smoke = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), M.smoke, NP);
smoke.frustumCulled = false;
scene.add(smoke);
const SM_FROM = V(TO[0], 0.65, TO[2]);
const SM_TO = V(D[0] + 0.25, D[1] - HH / 2 - 0.1, D[2] + 0.2);
function drawSmoke(t, k) {
  for (let i = 0; i < NP; i++) {
    const f = (t * 0.32 + hash(i * 7.7)) % 1;
    _p.lerpVectors(SM_FROM, SM_TO, f);
    _p.x += Math.sin(f * 7 + i) * 0.18 * f;
    _p.z += Math.cos(f * 5 + i * 2) * 0.18 * f;
    // spread out under the ceiling
    const spread = smooth(ramp(f, 0.8, 1));
    _p.x += Math.cos(i * 2.4) * 0.6 * spread;
    _p.z += Math.sin(i * 2.4) * 0.6 * spread;
    const sz = (0.07 + 0.2 * f) * Math.sin(Math.PI * Math.min(1, f * 1.15)) * k;
    _m.compose(_p, _q.setFromAxisAngle(Y1, i + t * 0.3), _s.setScalar(Math.max(1e-4, sz)));
    smoke.setMatrixAt(i, _m);
  }
  smoke.instanceMatrix.needsUpdate = true;
}

// ---------------------------------------------------------------- crumb set: paper, snowman, hourglass
const ps = new THREE.Group();
ps.position.set(...PS);
scene.add(ps);
{
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3, 0), M.stone);
  rock.position.y = 0.22;
  rock.scale.set(1, 0.75, 1);
  rock.castShadow = true;
  ps.add(rock);
}
const bigCrumb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.11, 0), M.am);
bigCrumb.position.y = 0.55;
ps.add(bigCrumb);
const psLight = new THREE.PointLight(0x5cff4a, 0, 2.5, 1.5);
psLight.position.y = 0.7;
ps.add(psLight);
const paper = new THREE.Group();
paper.position.set(0.75, 0.62, 0.05);
ps.add(paper);
{
  const sheet = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.95, 0.75), M.paper);
  sheet.rotation.y = -0.75;
  sheet.castShadow = true;
  paper.add(sheet);
}
const snowman = new THREE.Group();
snowman.position.set(1.45, 0, 0.05);
ps.add(snowman);
{
  for (const [r, y] of [
    [0.28, 0.25],
    [0.2, 0.68],
    [0.14, 0.98],
  ]) {
    const s = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), M.snow);
    s.position.y = y;
    s.castShadow = true;
    snowman.add(s);
  }
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.16, 6), M.carrot);
  nose.rotation.z = Math.PI / 2;
  nose.position.set(-0.2, 0.98, 0);
  snowman.add(nose);
  for (const z of [-0.05, 0.05]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 4), flat(0x1c1d22));
    eye.position.set(-0.12, 1.03, z);
    snowman.add(eye);
  }
}
const NA = 12;
const alphas = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), M.ray, NA);
alphas.frustumCulled = false;
ps.add(alphas);
function drawAlphas(t, k, wall) {
  for (let i = 0; i < NA; i++) {
    const f = (t * 0.9 + hash(i * 4.3)) % 1;
    const cyc = Math.floor(t * 0.9 + hash(i * 4.3));
    const ay = (hash(cyc * 13 + i) - 0.5) * 0.7;
    const az = (hash(cyc * 29 + i) - 0.5) * 0.8;
    _dir.set(Math.cos(ay) * Math.cos(az), Math.sin(ay), Math.sin(az)).normalize();
    const stop = wall > 0.5 ? 0.62 / _dir.x : 1.9;
    const dd = Math.min(f * 1.9, stop);
    const stuck = f * 1.9 > stop;
    _p.set(0, 0.55, 0).addScaledVector(_dir, 0.1 + dd);
    const sz = (stuck ? 0.045 * Math.max(0, 1 - (f * 1.9 - stop) * 3) : 0.03) * k;
    _m.compose(_p, _q.identity(), _s.setScalar(Math.max(1e-4, sz)));
    alphas.setMatrixAt(i, _m);
  }
  alphas.instanceMatrix.needsUpdate = true;
}
const hourglass = new THREE.Group();
hourglass.position.set(0.75, 0, 0.15);
ps.add(hourglass);
const sandTop = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.22, 12), M.sand);
const sandBot = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.2, 12), M.sand);
{
  for (const y of [0.04, 0.86]) {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.07, 12), M.ceiling);
    cap.position.y = y;
    cap.castShadow = true;
    hourglass.add(cap);
  }
  const top = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.38, 12), M.glass);
  top.rotation.x = Math.PI;
  top.position.y = 0.64;
  const bot = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.38, 12), M.glass);
  bot.position.y = 0.26;
  sandTop.rotation.x = Math.PI;
  sandTop.position.y = 0.6;
  sandBot.position.y = 0.18;
  hourglass.add(sandTop, sandBot, top, bot);
}

const applyCamera = shotCamera(shots);

// ---------------------------------------------------------------- render
function renderAt(t) {
  // detector: glowing in the hook, shrinks on "Lass", pops back in as a build
  const out = inBack(ramp(t, T.lass, T.lass + 0.35));
  const back = T.lass + 0.45;
  if (t < T.lass + 0.35) det.scale.setScalar(Math.max(0.001, 1 - out));
  else det.scale.copy(squash(t, back));
  det.visible = t < T.lass + 0.35 || t >= back;
  puff("det", t, back + 0.1, D[0], D[1] - 0.45, D[2], 1.3);

  const xray =
    smooth(ramp(t, T.platten - 0.2, T.platten + 0.3)) * (1 - ramp(t, T.schau, T.schau + 0.5));
  setXray([shellMat, ventMat], xray);
  faceMat.opacity = 1 - 0.88 * xray;

  // hook: sticker pulses, green glow from the vents
  const hook = t < T.lass ? 1 : 0;
  const pulse = 0.5 + 0.5 * Math.sin(t * 7);
  faceMat.emissiveIntensity = hook * 0.45 * pulse;
  ventMat.emissiveIntensity = hook * 0.7 * pulse;

  // chamber parts: plates, then the crumb
  const ONE = V(1, 1, 1);
  const built = t < T.lass; // the hook shows the finished detector
  plates[0].scale.copy(built ? ONE : squash(t, T.platten + 0.1));
  plates[1].scale.copy(built ? ONE : squash(t, T.platten + 0.22));
  const amOn = t < T.lass || t >= T.americium1;
  source.visible = t < T.lass || t >= T.americium1 + 0.15;
  source.scale.copy(t < T.lass ? V(1, 1, 1) : squash(t, T.americium1 + 0.15, 0.75, 1.3));
  M.am.emissiveIntensity = 1 + 0.5 * Math.sin(t * 9);
  amLight.intensity = amOn ? (0.35 + 0.1 * Math.sin(t * 9)) * xray : 0;

  // rays from "Strahlung", ions + electrons from "Elektronen"
  drawRays(t, pop(t, T.strahlung2, T.schau));
  const flow = flowAt(t);
  M.plate.emissiveIntensity = 0.35 * flow * (0.6 + 0.4 * Math.sin(t * 10));
  M.wire.emissiveIntensity = 0.8 * flow * (0.6 + 0.4 * Math.sin(t * 10 + 1));
  placeSmoke(t, pop(t, T.rauch1, T.schau));
  placeIons(t, pop(t, T.elektronen, T.schau), ramp(t, T.kleben, T.kleben + 1.0) * 1.4);

  // chip: pops in, goes red on the alarm; LED flashes, rings ripple
  chip.scale.copy(built ? ONE : squash(t, T.chip));
  const alarmOn = t >= T.alarm && t < T.schau ? 1 : 0;
  const blink = alarmOn * (Math.floor((t - T.alarm) / 0.15) % 2 === 0 ? 1 : 0);
  M.chip.emissiveIntensity = 0.9 * alarmOn * (0.6 + 0.4 * Math.sin(t * 20));
  M.led.emissiveIntensity = blink * 3 + (t < T.lass ? 0.8 * (Math.sin(t * 3) > 0.9 ? 1 : 0) : 0);
  ledLight.intensity = blink * 4;
  rings.forEach((r, i) => {
    const c = ((t - T.alarm) * 1.3 + i / 3) % 1;
    r.scale.setScalar(0.4 + c * 1.6);
    r.material.opacity = alarmOn * 0.85 * (1 - c);
  });

  // toaster: pops in on "Trick", toast glows, smoke rises to the detector
  const tk = pop(t, T.trick, T.schau + 0.5);
  toaster.visible = tk > 0.001;
  toaster.scale.copy(t >= T.trick ? squash(t, T.trick + 0.05) : V(0.001, 0.001, 0.001));
  if (t >= T.schau) toaster.scale.multiplyScalar(Math.max(0.001, tk));
  M.toast.emissiveIntensity = 0.5 + 0.3 * Math.sin(t * 6);
  drawSmoke(t, pop(t, T.trick + 0.2, T.schau));

  // crumb set: paper stops the rays; later the hourglass
  const psk = Math.max(pop(t, T.keine - 0.05, T.strahlung2), pop(t, T.uebrigens - 0.05, T.schau2));
  ps.visible = psk > 0.001;
  ps.scale.setScalar(Math.max(0.001, psk));
  psLight.intensity = 2 + Math.sin(t * 9);
  bigCrumb.rotation.y = t * 0.8;
  const paperOn = t < T.uebrigens && t >= T.papier;
  paper.visible = paperOn;
  if (paperOn) paper.scale.copy(squash(t, T.papier));
  drawAlphas(t, pop(t, T.keine, T.strahlung2), paperOn ? 1 : 0);
  snowman.rotation.y = 0.3 + Math.sin(t * 2) * 0.05;
  const hgOn = t >= T.uebrigens + 0.3;
  hourglass.visible = hgOn;
  if (hgOn) hourglass.scale.copy(squash(t, T.uebrigens + 0.3));
  const sand = smooth(ramp(t, T.uebrigens + 0.6, T.schau2));
  const half = Math.max(0.001, 1 - sand * 0.5);
  sandTop.scale.set(half, half, half);
  sandBot.scale.setScalar(Math.max(0.001, 0.5 + sand * 0.5));

  // LED panel: one fact at a time
  if (t >= T.millionstel - 0.3 && t < T.keine) {
    showPanel(pop(t, T.millionstel - 0.3, T.keine), "WENIGER ALS", "1 µg", LED.yellow);
  } else if (t >= T.strom1 && t < T.trick) {
    showPanel(pop(t, T.strom1, T.trick), "STROM", "AN", LED.green);
  } else if (t >= T.bricht && t < T.schau) {
    showPanel(pop(t, T.bricht, T.schau), "STROM", "AUS", LED.red);
  } else {
    showPanel(0);
  }

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
