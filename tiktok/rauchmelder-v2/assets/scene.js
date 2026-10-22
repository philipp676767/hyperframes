// "So funktioniert ein Rauchmelder" (v2, Ionisationsrauchmelder). World,
// captions, camera, panel, arrows and labels live in world.js; this file only
// builds the smoke detector story: a glowing detector under the ceiling of a
// toy room, then its ionisation chamber built big in the middle of the room,
// smoke from a burnt toast, the alarm, and the "Atomreaktor" garden shed.
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
  addFloor,
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
  D,
  C,
  GAP,
  CHIP,
  TO,
  S,
  DET_OUT,
  DET_BACK,
  FLOW_ON,
  FLOW_OFF,
} from "./beats.js";

highlights(HIGHLIGHTS);
createWorld({ env: "stadt", sky: "morgen" });
addFloor(4.6, "#e6c9a2", "#cfae84");

Object.assign(M, {
  wall: flat(0xf7d7b5, { roughness: 0.9 }),
  wall2: flat(0xb8d8cf, { roughness: 0.9 }),
  ceiling: flat(0x8fa9cf, { roughness: 0.8 }),
  housing: flat(0xfbfaf6, { roughness: 0.35 }),
  vent: flat(0x3a3f48, { emissive: 0x5cff4a, emissiveIntensity: 0 }),
  plate: new THREE.MeshStandardMaterial({
    color: 0xc9d1da,
    metalness: 0.75,
    roughness: 0.25,
    emissive: 0x4fc3ff,
    emissiveIntensity: 0,
  }),
  post: flat(0xf4f1ec),
  gold: new THREE.MeshStandardMaterial({ color: 0xe8b84a, metalness: 0.8, roughness: 0.3 }),
  am: flat(0x7dff6a, { emissive: 0x5cff4a, emissiveIntensity: 1.2 }),
  ray: new THREE.MeshBasicMaterial({ color: 0xb6ff3a }),
  spark: new THREE.MeshBasicMaterial({ color: 0xffffff }),
  air: flat(0x4f8dff, { emissive: 0x2f6bff, emissiveIntensity: 0.35 }),
  electron: flat(0xffd23f, { emissive: 0xffc400, emissiveIntensity: 0.9 }),
  bead: flat(0xffe14a, { emissive: 0xffd000, emissiveIntensity: 1.4 }),
  wire: flat(0xd9824a, { metalness: 0.4, emissive: 0xffd23f, emissiveIntensity: 0 }),
  pcb: flat(0x1f8a4c, { roughness: 0.5 }),
  chip: flat(0x1c1d22, { emissive: 0xff2a1a, emissiveIntensity: 0 }),
  led: flat(0x5a1010, { emissive: 0xff2a1a, emissiveIntensity: 0 }),
  paper: flat(0xfffdf6, { side: THREE.DoubleSide }),
  smoke: flat(0x8d9099, { roughness: 1 }),
  toaster: new THREE.MeshStandardMaterial({ color: 0xe4e9ef, metalness: 0.35, roughness: 0.25 }),
  toast: flat(0x3a2518, { emissive: 0xff5a1a, emissiveIntensity: 0 }),
  geiger: flat(0xffc21f, { roughness: 0.45 }),
  dial: flat(0xfbfbf7),
  shedGlow: flat(0x9dff6a, { emissive: 0x5cff4a, emissiveIntensity: 1.2 }),
  lawn: flat(0x7cc35a),
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
const clamp = (x) => Math.min(1, Math.max(0, x));
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = V(1, 1, 1);
const _p = V(0, 0, 0);
const _dir = V(0, 0, 0);
const Y1 = V(0, 1, 0);
const TINY = V(1e-3, 1e-3, 1e-3);

// ---------------------------------------------------------------- room corner
box(4.76, 3.66, 0.16, M.wall, -0.08, 1.83, -1.78);
box(0.16, 3.66, 3.2, M.wall2, -2.38, 1.83, -0.2);
box(4.92, 0.16, 3.36, M.ceiling, -0.08, 3.58, -0.2);
box(4.76, 0.14, 0.04, M.post, -0.08, 0.07, -1.68); // skirting board
// a framed picture on the back wall
box(1.0, 0.72, 0.05, M.woodDark, -1.0, 2.2, -1.68);
box(0.86, 0.58, 0.02, flat(0x9ad0f0), -1.0, 2.2, -1.65);
box(0.5, 0.26, 0.02, flat(0x6fbf6a), -1.08, 2.02, -1.635);
const roomLight = new THREE.PointLight(0xffe2b0, 6, 9, 1.3);
roomLight.position.set(0.9, 2.5, 1.6);
scene.add(roomLight);
const alarmLight = new THREE.PointLight(0xff2a1a, 0, 9, 1.2);
alarmLight.position.set(0, 2.7, 0.6);
scene.add(alarmLight);

// ---------------------------------------------------------------- the detector
const det = new THREE.Group();
det.position.set(...D);
scene.add(det);
const HR = 0.78;
const HH = 0.3;
{
  const shell = new THREE.Mesh(new THREE.CylinderGeometry(HR, HR - 0.06, HH, 40), M.housing);
  shell.castShadow = true;
  det.add(shell);
  // vent slots round the side, glowing green in the hook
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    const v = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.13, 0.03), M.vent);
    v.position.set(Math.sin(a) * (HR - 0.04), -0.02, Math.cos(a) * (HR - 0.04));
    v.rotation.y = a;
    det.add(v);
  }
}
// bottom face: ring + yellow radiation sticker (canvas texture)
const faceCanvas = document.createElement("canvas");
faceCanvas.width = faceCanvas.height = 512;
{
  const g = faceCanvas.getContext("2d");
  g.fillStyle = "#fbfaf6";
  g.fillRect(0, 0, 512, 512);
  g.strokeStyle = "#cfcac0";
  g.lineWidth = 12;
  for (const r of [238, 205]) {
    g.beginPath();
    g.arc(256, 256, r, 0, Math.PI * 2);
    g.stroke();
  }
  g.fillStyle = "#ffd23f";
  g.beginPath();
  g.arc(256, 256, 150, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "#1c1c22";
  g.lineWidth = 10;
  g.stroke();
  g.fillStyle = "#1c1c22";
  for (let k = 0; k < 3; k++) {
    const a = (k * 2 * Math.PI) / 3 - Math.PI / 2;
    g.beginPath();
    g.arc(256, 256, 126, a - Math.PI / 6, a + Math.PI / 6);
    g.arc(256, 256, 38, a + Math.PI / 6, a - Math.PI / 6, true);
    g.closePath();
    g.fill();
  }
  g.beginPath();
  g.arc(256, 256, 25, 0, Math.PI * 2);
  g.fill();
}
const faceTex = new THREE.CanvasTexture(faceCanvas);
faceTex.colorSpace = THREE.SRGBColorSpace;
const faceMat = new THREE.MeshStandardMaterial({
  map: faceTex,
  roughness: 0.6,
  emissive: 0xffffff,
  emissiveMap: faceTex,
  emissiveIntensity: 0,
});
{
  const face = new THREE.Mesh(new THREE.CircleGeometry(HR - 0.06, 40), faceMat);
  face.rotation.x = Math.PI / 2;
  face.position.y = -HH / 2 - 0.003;
  det.add(face);
}
const led = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8), M.led);
led.position.set(0.5, -HH / 2 - 0.01, 0.3);
det.add(led);
const glow = new THREE.PointLight(0x5cff4a, 0, 4, 1.5);
glow.position.set(0, -0.6, 0.2);
det.add(glow);
// alarm: red sound rings below the detector
const rings = [0, 1, 2].map(() => {
  const mat = new THREE.MeshBasicMaterial({
    color: 0xff4b2b,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.035, 6, 48), mat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -HH / 2 - 0.12;
  det.add(ring);
  return ring;
});
// green sparkles drifting down from the vents in the hook
const NG = 26;
const motes = new THREE.InstancedMesh(new THREE.OctahedronGeometry(1, 0), M.am, NG);
motes.frustumCulled = false;
det.add(motes);
function drawMotes(t, k) {
  for (let i = 0; i < NG; i++) {
    const f = (t * 0.45 + hash(i * 3.7)) % 1;
    const a = hash(i * 9.1) * Math.PI * 2 + f * 0.8;
    const r = HR + 0.02 + f * 0.35;
    _p.set(Math.sin(a) * r, -0.05 - f * 1.1, Math.cos(a) * r);
    const sz = k * 0.03 * Math.sin(Math.PI * f) + 1e-4;
    _m.compose(_p, _q.setFromAxisAngle(Y1, t * 2 + i), _s.setScalar(sz));
    motes.setMatrixAt(i, _m);
  }
  motes.instanceMatrix.needsUpdate = true;
}

// ---------------------------------------------------------------- Geiger counter (hook)
const geiger = new THREE.Group();
geiger.position.set(0.95, 2.55, 0.5);
geiger.rotation.y = -0.35;
scene.add(geiger);
box(0.55, 0.36, 0.24, M.geiger, 0, 0, 0, geiger);
box(0.2, 0.06, 0.06, M.rubber, 0, 0.21, 0, geiger); // handle
{
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 24), M.dial);
  dial.rotation.x = Math.PI / 2;
  dial.position.set(-0.1, 0.02, 0.125);
  geiger.add(dial);
  box(0.12, 0.08, 0.02, flat(0x1c1d22), 0.15, 0.02, 0.125, geiger);
}
const needle = new THREE.Group();
needle.position.set(-0.1, -0.05, 0.14);
geiger.add(needle);
box(0.012, 0.16, 0.01, flat(0xe8473b), 0, 0.08, 0, needle);
// wand on a cable, pointing up at the detector
const wand = new THREE.Group();
wand.position.set(-0.45, 0.25, 0);
wand.rotation.z = 0.5;
geiger.add(wand);
{
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.42, 12), M.alu);
  tube.position.y = 0.21;
  wand.add(tube);
  const cable = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([V(-0.27, 0.05, 0), V(-0.4, -0.15, 0.05), V(-0.45, 0.25, 0)]),
      12,
      0.015,
      5,
    ),
    M.rubber,
  );
  geiger.add(cable);
}

// ---------------------------------------------------------------- the ionisation chamber
const chamber = new THREE.Group();
chamber.position.set(...C);
scene.add(chamber);
const PR = 0.82;
const plateGeo = new THREE.CylinderGeometry(PR, PR, 0.05, 40);
const plates = [-GAP, GAP].map((y) => {
  const m = new THREE.Mesh(plateGeo, M.plate);
  m.position.y = y;
  m.castShadow = true;
  chamber.add(m);
  return m;
});
// three thin posts hold the upper plate
const posts = new THREE.Group();
chamber.add(posts);
for (let i = 0; i < 3; i++) {
  const a = Math.PI * (0.68 + i * 0.32); // all three at the back
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, GAP * 2, 8), M.post);
  p.position.set(Math.sin(a) * (PR - 0.06), 0, Math.cos(a) * (PR - 0.06));
  posts.add(p);
}
// the americium crumb on a little gold foil on the lower plate
const source = new THREE.Group();
source.position.y = -GAP + 0.025;
chamber.add(source);
{
  const foil = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.02, 20), M.gold);
  foil.position.y = 0.01;
  source.add(foil);
}
const crumb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.055, 0), M.am);
crumb.position.y = 0.06;
source.add(crumb);
const amLight = new THREE.PointLight(0x5cff4a, 0, 1.6, 1.6);
amLight.position.y = 0.18;
source.add(amLight);
const RAY_O = V(0, -GAP + 0.09, 0);

// alpha rays: bright green streaks; in the paper moment they all fly towards
// +x and stop at the sheet
const NR = 16;
const rays = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), M.ray, NR);
rays.frustumCulled = false;
chamber.add(rays);
const sparks = new THREE.InstancedMesh(new THREE.OctahedronGeometry(1, 0), M.spark, NR);
sparks.frustumCulled = false;
chamber.add(sparks);
const PAPER_X = 0.36;
function drawRays(t, k, paper) {
  for (let i = 0; i < NR; i++) {
    const u = t * 2.2 + hash(i * 3.1);
    const cyc = Math.floor(u);
    const f = u - cyc;
    let hit = 99;
    if (paper > 0.5) {
      const a = (hash(cyc * 17 + i) - 0.5) * 1.3;
      const up = 0.15 + hash(cyc * 5 + i) * 0.9;
      _dir.set(Math.cos(a), up, Math.sin(a)).normalize();
      hit = (PAPER_X - 0.02) / _dir.x;
    } else {
      const a = hash(cyc * 17 + i) * Math.PI * 2;
      const up = 0.2 + hash(cyc * 5 + i) * 1.4;
      _dir.set(Math.cos(a), up, Math.sin(a)).normalize();
      hit = (GAP * 2 - 0.12) / _dir.y; // the upper plate
    }
    const travel = 0.05 + f * 1.1;
    const d = Math.min(travel, hit);
    _p.copy(RAY_O).addScaledVector(_dir, d - 0.06);
    _q.setFromUnitVectors(Y1, _dir);
    const stuck = travel >= hit;
    const s = k * (stuck ? 0 : 1);
    _s.set(0.02 * s + 1e-4, 0.14 * s + 1e-4, 0.02 * s + 1e-4);
    _m.compose(_p, _q, _s);
    rays.setMatrixAt(i, _m);
    // spark where a ray hits the paper
    const sk = paper > 0.5 && stuck ? k * Math.max(0, 1 - (travel - hit) * 5) : 0;
    _p.copy(RAY_O).addScaledVector(_dir, hit);
    _m.compose(_p, _q.setFromAxisAngle(Y1, i + t * 6), _s.setScalar(0.045 * sk + 1e-4));
    sparks.setMatrixAt(i, _m);
  }
  rays.instanceMatrix.needsUpdate = true;
  sparks.instanceMatrix.needsUpdate = true;
}

// the sheet of paper
const paper = new THREE.Group();
paper.position.set(PAPER_X + 0.01, -GAP + 0.36, 0);
chamber.add(paper);
{
  const sheet = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.64, 0.78), M.paper);
  sheet.castShadow = true;
  paper.add(sheet);
}

// air molecules (blue) between the plates; the rays knock electrons
// (yellow) out of them, then both drift to the plates = the current
const NA = 26;
const airSeed = (() => {
  const r = rng(11);
  return Array.from({ length: NA }, () => {
    const a = r() * Math.PI * 2;
    const rr = 0.12 + Math.sqrt(r()) * 0.58;
    return {
      x: Math.cos(a) * rr,
      z: Math.sin(a) * rr,
      y: (r() - 0.5) * (GAP * 2 - 0.25),
      ph: r(),
      o: [r() - 0.5, r() - 0.5, r() - 0.5],
    };
  });
})();
const airMol = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), M.air, NA);
const elecs = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), M.electron, NA);
airMol.frustumCulled = false;
elecs.frustumCulled = false;
chamber.add(airMol, elecs);
// distance travelled by the drift: integral of the flow (deterministic table)
const STEP = 1 / 60;
const flowAt = (t) => smooth(ramp(t, ...FLOW_ON)) * (1 - smooth(ramp(t, ...FLOW_OFF)));
const drift = [0];
for (let i = 1; i < 60 * 70; i++) drift.push(drift[i - 1] + flowAt(i * STEP) * STEP);
const driftAt = (t) => drift[Math.max(0, Math.min(drift.length - 1, Math.round(t / STEP)))];
const TOP = GAP - 0.07;
const BOT = -GAP + 0.07;

// smoke chunks that settle between the plates
const NS = 9;
const smokeSeed = (() => {
  const r = rng(31);
  return Array.from({ length: NS }, () => {
    const a = r() * Math.PI * 2;
    const rr = 0.1 + r() * 0.5;
    return { x: Math.cos(a) * rr, z: Math.sin(a) * rr, y: (r() - 0.5) * 0.5, ph: r() * 6 };
  });
})();
const smokeIn = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), M.smoke, NS);
smokeIn.frustumCulled = false;
chamber.add(smokeIn);
const smokePos = smokeSeed.map(() => V(0, 0, 0));
const ENTRY = V(-PR - 0.4, -GAP - 0.25, 0.25); // where the smoke comes in (left, low)
function placeSmoke(t, k) {
  smokeSeed.forEach((s, i) => {
    const at = T.rauch + 0.25 + i * 0.12;
    const enter = smooth(ramp(t, at, at + 0.9));
    smokePos[i].set(
      lerp(ENTRY.x, s.x + Math.sin(t * 0.7 + s.ph) * 0.03, enter),
      lerp(ENTRY.y, s.y + Math.sin(t * 0.9 + s.ph) * 0.02, enter),
      lerp(ENTRY.z, s.z + Math.cos(t * 0.6 + s.ph) * 0.03, enter),
    );
    const sz = k * smooth(ramp(t, at - 0.1, at + 0.3)) * (0.085 + 0.03 * Math.sin(s.ph));
    _m.compose(smokePos[i], _q.setFromAxisAngle(Y1, t * 0.5 + s.ph), _s.setScalar(sz + 1e-4));
    smokeIn.setMatrixAt(i, _m);
  });
  smokeIn.instanceMatrix.needsUpdate = true;
}

function placeAir(t, kAir, kEl, stick) {
  const d = driftAt(t) * 0.55;
  airSeed.forEach((s, i) => {
    const at = T.luft1 + (i % 9) * 0.05;
    const ka = kAir * smooth(ramp(t, at, at + 0.25));
    const sm = smokePos[i % NS];
    const st = smooth(clamp(stick - (i % 5) * 0.08));
    // with current: the ion drifts down, its electron up
    const flowing = driftAt(t) > 0;
    const f = (d + s.ph) % 1;
    const yIon = flowing ? lerp(TOP, BOT, f) : s.y;
    _p.set(s.x, yIon, s.z);
    _p.lerp(V(sm.x + s.o[0] * 0.14, sm.y + 0.06 + s.o[1] * 0.06, sm.z + s.o[2] * 0.14), st);
    _m.compose(_p, _q.identity(), _s.setScalar(ka * 0.045 + 1e-4));
    airMol.setMatrixAt(i, _m);
    // electron: bursts out of its molecule when a ray hits it
    const burst = T.elektronen + hash(i * 5.3) * (T.zack - T.elektronen + 0.1);
    const out = smooth(ramp(t, burst, burst + 0.25));
    const g = (d + s.ph + 0.5) % 1;
    const yEl = flowing ? lerp(BOT, TOP, g) : s.y;
    _p.set(
      s.x + s.o[0] * 0.12 * out,
      lerp(s.y, yEl, out) + s.o[1] * 0.08 * out,
      s.z + s.o[2] * 0.12 * out,
    );
    _p.lerp(V(sm.x - s.o[0] * 0.14, sm.y - 0.06 - s.o[1] * 0.06, sm.z - s.o[2] * 0.14), st);
    _m.compose(_p, _q, _s.setScalar(kEl * out * 0.03 + 1e-4));
    elecs.setMatrixAt(i, _m);
  });
  airMol.instanceMatrix.needsUpdate = true;
  elecs.instanceMatrix.needsUpdate = true;
}

// wires: upper plate -> chip -> lower plate, with yellow beads for the current
const chipLocal = V(CHIP[0] - C[0], CHIP[1] - C[1], CHIP[2] - C[2]);
const wirePts = [
  V(0.62, GAP, 0.52),
  V(0.95, GAP - 0.1, 0.62),
  V(1.08, -0.2, 0.62),
  chipLocal.clone().add(V(0.02, 0.05, -0.08)),
  V(0.62, -0.75, 0.62),
  V(0.55, -GAP - 0.02, 0.5),
];
const wireCurve = new THREE.CatmullRomCurve3(wirePts);
const WSEG = 64;
const wireGeo = new THREE.TubeGeometry(wireCurve, WSEG, 0.018, 6);
const wire = new THREE.Mesh(wireGeo, M.wire);
chamber.add(wire);
const NB = 18;
const beads = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), M.bead, NB);
beads.frustumCulled = false;
chamber.add(beads);
function drawBeads(t, k) {
  const d = driftAt(t) * 0.35;
  for (let i = 0; i < NB; i++) {
    const f = (i / NB + d) % 1;
    wireCurve.getPointAt(f, _p);
    _m.compose(_p, _q.identity(), _s.setScalar(k * 0.035 + 1e-4));
    beads.setMatrixAt(i, _m);
  }
  beads.instanceMatrix.needsUpdate = true;
}
// stand + board + chip
const board = new THREE.Group();
board.position.copy(chipLocal);
chamber.add(board);
box(0.14, CHIP[1] - 0.03, 0.14, M.woodDark, 0, -(CHIP[1] - 0.03) / 2 - 0.02, 0, board);
box(0.6, 0.04, 0.46, M.pcb, 0, 0, 0, board);
const chip = box(0.24, 0.07, 0.24, M.chip, 0, 0.055, 0, board);
for (let i = 0; i < 4; i++)
  for (const sx of [-1, 1])
    box(0.025, 0.02, 0.04, M.alu, sx * 0.135, 0.03, -0.09 + i * 0.06, chip.parent);

// ---------------------------------------------------------------- toaster + smoke
const toaster = new THREE.Group();
toaster.position.set(...TO);
toaster.rotation.y = 0.5;
scene.add(toaster);
{
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.44, 0.44), M.toaster);
  body.position.y = 0.24;
  body.castShadow = true;
  toaster.add(body);
  box(0.05, 0.1, 0.07, M.rubber, 0.38, 0.32, 0, toaster);
}
const toasts = [-0.09, 0.09].map((z) => box(0.48, 0.3, 0.06, M.toast, 0, 0.52, z, toaster));
const NP = 34;
const smoke = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), M.smoke, NP);
smoke.frustumCulled = false;
scene.add(smoke);
const SM_FROM = V(TO[0], 0.75, TO[2]);
const SM_TO = V(C[0] + ENTRY.x + 0.2, C[1] + ENTRY.y + 0.1, C[2] + ENTRY.z);
function drawSmoke(t, k) {
  for (let i = 0; i < NP; i++) {
    const f = (t * 0.42 + hash(i * 7.7)) % 1;
    _p.lerpVectors(SM_FROM, SM_TO, f);
    _p.x += Math.sin(f * 7 + i) * 0.38 * f;
    _p.z += Math.cos(f * 5 + i * 2) * 0.38 * f;
    _p.y += Math.sin(f * Math.PI) * 0.25;
    const sz = (0.07 + 0.16 * f) * Math.sin(Math.PI * Math.min(1, f * 1.1)) * k;
    _m.compose(_p, _q.setFromAxisAngle(Y1, i + t * 0.3), _s.setScalar(Math.max(1e-4, sz)));
    smoke.setMatrixAt(i, _m);
  }
  smoke.instanceMatrix.needsUpdate = true;
}

// ---------------------------------------------------------------- the "Atomreaktor" shed
const shed = new THREE.Group();
shed.position.set(...S);
scene.add(shed);
{
  const lawn = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.06, 10), M.lawn);
  lawn.position.y = 0.03;
  lawn.receiveShadow = true;
  shed.add(lawn);
  box(1.3, 1.05, 1.1, M.wood, 0, 0.6, -0.1, shed);
  // gable (triangular prism) + two roof slabs meeting at the ridge
  const gGeo = new THREE.CylinderGeometry(0.75, 0.75, 1.1, 3);
  gGeo.rotateX(-Math.PI / 2);
  gGeo.scale(1, 0.6, 1);
  const gable = new THREE.Mesh(gGeo, M.wood);
  gable.position.set(0, 1.35, -0.1);
  gable.castShadow = true;
  shed.add(gable);
  for (const s of [-1, 1]) {
    const roof = box(1.08, 0.07, 1.3, M.woodDark, s * 0.33, 1.5, -0.1, shed);
    roof.rotation.z = -s * 0.805;
  }
  box(0.42, 0.72, 0.03, M.woodDark, -0.25, 0.45, 0.46, shed); // door
  box(0.34, 0.26, 0.03, M.shedGlow, 0.33, 0.72, 0.46, shed); // window
  box(0.04, 0.72, 0.03, M.shedGlow, -0.03, 0.45, 0.47, shed); // light through the door gap
  const sign = new THREE.Mesh(
    new THREE.CircleGeometry(0.13, 24),
    new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.6 }),
  );
  sign.position.set(-0.25, 0.62, 0.48);
  shed.add(sign);
}
const shedLight = new THREE.PointLight(0x5cff4a, 0, 4, 1.4);
shedLight.position.set(0.1, 0.8, 0.9);
shed.add(shedLight);
const NM = 18;
const shedMotes = new THREE.InstancedMesh(new THREE.OctahedronGeometry(1, 0), M.am, NM);
shedMotes.frustumCulled = false;
shed.add(shedMotes);
function drawShedMotes(t, k) {
  for (let i = 0; i < NM; i++) {
    const f = (t * 0.35 + hash(i * 2.3)) % 1;
    const a = hash(i * 7.9) * Math.PI * 2;
    _p.set(Math.cos(a) * 0.75 * (0.6 + f * 0.6), 0.3 + f * 2.0, Math.sin(a) * 0.6 + 0.1);
    _m.compose(
      _p,
      _q.setFromAxisAngle(Y1, t * 3 + i),
      _s.setScalar(k * 0.045 * Math.sin(Math.PI * f) + 1e-4),
    );
    shedMotes.setMatrixAt(i, _m);
  }
  shedMotes.instanceMatrix.needsUpdate = true;
}

const applyCamera = shotCamera(shots);

// ---------------------------------------------------------------- render
function renderAt(t) {
  const hook = t < DET_OUT;
  const pulse = 0.5 + 0.5 * Math.sin(t * 7);

  // ---- detector: glowing in the hook, gone during the build, back on "Alarm"
  if (t < DET_BACK) {
    const out = inBack(ramp(t, DET_OUT, DET_OUT + 0.35));
    det.visible = out < 1;
    det.scale.setScalar(Math.max(0.001, 1 - out));
  } else {
    det.visible = true;
    det.scale.copy(squash(t, DET_BACK, 0.6));
  }
  const hk = hook ? 1 : 0;
  faceMat.emissiveIntensity = hk * (0.25 + 0.35 * pulse);
  M.vent.emissiveIntensity = hk * (0.6 + 0.8 * pulse);
  glow.intensity = hk * (3 + 2.5 * pulse);
  drawMotes(t, hk);

  // ---- Geiger counter: needle swings wildly, shrinks away with the detector
  const gOut = inBack(ramp(t, DET_OUT, DET_OUT + 0.35));
  geiger.visible = gOut < 1;
  geiger.scale.setScalar(Math.max(0.001, 0.8 * (1 - gOut)));
  needle.rotation.z =
    -0.2 - 0.9 * (0.5 + 0.5 * Math.sin(t * 13)) * (0.7 + 0.3 * Math.sin(t * 31 + 1));

  // ---- chamber: built from "brauchst" on, flies into the detector on "Alarm"
  const fly = smooth(ramp(t, T.alarm - 0.05, T.alarm + 0.4));
  const built = t >= T.brauchst && fly < 1;
  chamber.visible = built;
  chamber.position.set(lerp(C[0], D[0], fly), lerp(C[1], D[1], fly), lerp(C[2], D[2], fly));
  chamber.scale.setScalar(Math.max(0.001, 1 - 0.85 * fly));
  plates[0].scale.copy(squash(t, T.platten + 0.1));
  plates[1].scale.copy(squash(t, T.platten + 0.25));
  posts.visible = t >= T.platten + 0.25;
  posts.scale.copy(squash(t, T.platten + 0.25));
  puff("plate", t, T.platten + 0.12, C[0], C[1] - GAP, C[2], 1.3);
  source.visible = t >= T.americium + 0.1;
  source.scale.copy(squash(t, T.americium + 0.1, 0.75, 1.0));
  M.am.emissiveIntensity = 1.1 + 0.5 * Math.sin(t * 9);
  amLight.intensity = source.visible ? 1.6 + 0.6 * Math.sin(t * 9) : 0;
  crumb.rotation.y = t * 0.9;

  // ---- rays (from the crumb on), paper stops them
  const paperOn = t >= T.papier && t < T.die2 + 0.3;
  const pIn = smooth(ramp(t, T.papier, T.papier + 0.3));
  const pOut = smooth(ramp(t, T.die2, T.die2 + 0.3));
  paper.visible = paperOn;
  paper.position.y = -GAP + 0.36 + 1.4 * (1 - pIn) + 1.4 * pOut;
  drawRays(t, pop(t, T.americium + 0.35, T.schau), paperOn && pIn > 0.6 && pOut < 0.3 ? 1 : 0);

  // ---- air, electrons, current, smoke
  const flow = flowAt(t);
  placeSmoke(t, pop(t, T.rauch, T.schau));
  placeAir(
    t,
    pop(t, T.luft1, T.schau),
    pop(t, T.elektronen - 0.05, T.schau),
    ramp(t, T.kleben, T.kleben + 1.1) * 1.4,
  );
  const wk = pop(t, T.strom1 - 0.1, T.schau);
  wire.visible = wk > 0.01;
  wireGeo.setDrawRange(
    0,
    Math.ceil(smooth(ramp(t, T.strom1 - 0.1, T.strom1 + 0.5)) * WSEG) * 6 * 6,
  );
  board.visible = t >= T.strom1;
  board.scale.copy(squash(t, T.strom1 + 0.05, 0.6));
  chip.visible = t >= T.chip;
  chip.scale.copy(squash(t, T.chip, 0.6, 1.25));
  drawBeads(t, wk * flow);
  M.plate.emissiveIntensity = 0.45 * flow * (0.6 + 0.4 * Math.sin(t * 10));
  M.wire.emissiveIntensity = 0.7 * flow;

  // ---- toaster pops in, burnt toast smokes
  const tk = pop(t, T.rauch - 0.25, T.schau);
  toaster.visible = tk > 0.001;
  toaster.scale.copy(t >= T.rauch - 0.25 ? squash(t, T.rauch - 0.25).multiplyScalar(tk) : TINY);
  M.toast.emissiveIntensity = 0.5 + 0.3 * Math.sin(t * 6);
  for (const [i, s] of toasts.entries()) s.position.y = 0.52 + 0.02 * Math.sin(t * 9 + i);
  drawSmoke(t, pop(t, T.rauch - 0.1, T.alarm + 0.6));

  // ---- alarm: chip red, LED blinks, rings, red strobe in the room
  const alarmOn = t >= T.alarm && t < T.schau ? 1 : 0;
  const blink = alarmOn * (Math.floor((t - T.alarm) / 0.16) % 2 === 0 ? 1 : 0);
  M.chip.emissiveIntensity = 1.2 * alarmOn + (t >= T.chip ? 0.25 : 0);
  M.led.emissiveIntensity = blink * 3 + (hook ? (Math.sin(t * 3) > 0.9 ? 1 : 0) : 0);
  alarmLight.intensity = blink * 9;
  rings.forEach((r, i) => {
    const c = ((t - T.alarm) * 1.4 + i / 3) % 1;
    r.scale.setScalar(0.5 + c * 1.8);
    r.material.opacity = alarmOn * 0.9 * (1 - c);
  });

  // ---- shed: glows green, sparkles rise
  const sk = pop(t, T.uebrigens + 0.05, T.schau2);
  shed.visible = sk > 0.001;
  shed.scale.copy(
    t >= T.uebrigens + 0.05 ? squash(t, T.uebrigens + 0.05).multiplyScalar(sk) : TINY,
  );
  const boost = 1 + 1.5 * smooth(ramp(t, T.reaktor, T.reaktor + 0.4));
  M.shedGlow.emissiveIntensity = (1.0 + 0.4 * Math.sin(t * 8)) * boost;
  shedLight.intensity = (2.5 + Math.sin(t * 8)) * boost;
  drawShedMotes(t, sk * Math.min(1.6, boost));
  puff("shed", t, T.uebrigens + 0.2, S[0], 0.05, S[2], 1.5);

  // ---- LED panel: one fact at a time
  if (t >= T.millionstel && t < T.keine) {
    showPanel(pop(t, T.millionstel, T.keine), "WENIGER ALS", "1 µg", LED.yellow);
  } else if (t >= T.strom1 && t < T.und2) {
    showPanel(pop(t, T.strom1, T.und2), "STROM", "AN", LED.green);
  } else if (t >= T.bricht && t < T.alarm) {
    showPanel(pop(t, T.bricht, T.alarm), "STROM", "AUS", LED.red);
  } else if (t >= T.alarm + 0.4 && t < T.schau) {
    showPanel(pop(t, T.alarm + 0.4, T.schau), "ALARM", "85 dB", LED.red);
  } else {
    showPanel(0);
  }

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
