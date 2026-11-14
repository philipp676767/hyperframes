// Chapter 2 "Zielen ins Leere": the Earth–Moon diagram (aim ahead, the
// figure-eight free-return path), the football pass, the trans-lunar burn,
// the barbecue roll, the Earth shrinking, transposition + docking.
import {
  THREE,
  V,
  scene,
  camera,
  ramp,
  smooth,
  pop,
  lerp,
  squash,
  real,
  showNope,
  showPanel,
  LED,
  labels,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import "./set.js";
import { makeEarth, makeMoonGlobe, makeCSM, makeLM, makeFlame, MAT } from "./welt.js";
import { readout } from "./hud.js";
import { T, CLOSE, FOOT, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);
camera.far = 6000;
camera.updateProjectionMatrix();

// ---------------------------------------------------------------- diagram: Earth, Moon, orbit, paths
const earth = makeEarth(6, { spin: 0.08 });
scene.add(earth);
const moon = makeMoonGlobe(1.7);
scene.add(moon);
const ORB = 46;
const moonAngle = (t) => Math.min(0, -1.2 + 0.048 * t);
const moonPos = (a) => V(Math.cos(a) * ORB, 0, Math.sin(a) * ORB);
const glow = (color, op = 0.9) =>
  new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: op,
    depthWrite: false,
    fog: false,
  });
// the Moon's orbit as a faint ring
{
  const pts = [];
  for (let i = 0; i <= 256; i++) {
    const a = (i / 256) * Math.PI * 2;
    pts.push(V(Math.cos(a) * ORB, 0, Math.sin(a) * ORB));
  }
  const ring = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 256, 0.08, 6, true),
    glow(0x8fa6d8, 0.35),
  );
  ring.userData.noAO = true;
  scene.add(ring);
}
// the craft as a glowing dot
const dot = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 16), glow(0xffd23f, 1));
dot.userData.noAO = true;
scene.add(dot);
// the straight (wrong) shot
const aimLine = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1, 8), glow(0xff5a4a, 0.8));
aimLine.userData.noAO = true;
scene.add(aimLine);
// the lead point: an empty ring where the Moon WILL be
const lead = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.14, 12, 64), glow(0xffd23f, 0.95));
lead.rotation.x = Math.PI / 2;
lead.position.copy(moonPos(0));
lead.userData.noAO = true;
scene.add(lead);
// the figure eight (free return)
const eightPts = [
  [6.5, -2.5],
  [14, -4.5],
  [25, 0],
  [37, 4],
  [45, 4.6],
  [49.6, 2.2],
  [50.2, -1.4],
  [46.6, -3.9],
  [38, -4],
  [25, 0],
  [13, 4.5],
  [6.5, 2.6],
].map(([x, z]) => V(x, 0, z));
const eightCurve = new THREE.CatmullRomCurve3(eightPts, false, "catmullrom", 0.4);
const SEG = 400;
const eightGeo = new THREE.TubeGeometry(eightCurve, SEG, 0.22, 8, false);
const eight = new THREE.Mesh(eightGeo, glow(0xffd23f, 0.95));
eight.userData.noAO = true;
scene.add(eight);

// ---------------------------------------------------------------- football pitch analogy
const FP = V(...FOOT);
const pitch = new THREE.Group();
pitch.position.copy(FP);
{
  const grass = new THREE.Mesh(new THREE.CylinderGeometry(16, 16, 0.4, 64), real.fabric(0x3f8a3a));
  grass.position.y = -0.2;
  grass.receiveShadow = true;
  pitch.add(grass);
  for (let i = -3; i <= 3; i++) {
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 30), real.fabric(0x4a9a43));
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(i * 4.4, 0.01, 0);
    if (Math.abs(i * 4.4) < 15) pitch.add(stripe);
  }
  const line = new THREE.Mesh(new THREE.TorusGeometry(5, 0.08, 8, 64), real.plastic(0xffffff));
  line.rotation.x = Math.PI / 2;
  line.position.y = 0.03;
  pitch.add(line);
}
const mkPlayer = (color) => {
  const g = new THREE.Group();
  const shirt = real.fabric(color);
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.7, 8, 20), shirt);
  body.position.y = 1.25;
  g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 16), real.skin());
  head.position.y = 2.05;
  g.add(head);
  for (const s of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.6, 6, 12), real.fabric(0x1d1f26));
    leg.position.set(s * 0.15, 0.45, 0);
    leg.userData.leg = s;
    g.add(leg);
  }
  g.traverse((o) => o.isMesh && (o.castShadow = true));
  pitch.add(g);
  return g;
};
const pA = mkPlayer(0xd23a32);
const pB = mkPlayer(0xd23a32);
const ball = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 20), real.plastic(0xf5f5f0));
ball.castShadow = true;
pitch.add(ball);
const runTarget = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.06, 8, 40), glow(0xffd23f, 0.9));
runTarget.rotation.x = Math.PI / 2;
runTarget.position.set(6, 0.05, 4);
pitch.add(runTarget);
scene.add(pitch);

// ---------------------------------------------------------------- close-up set: S-IVB + SLA + LM + CSM, big Earth
const CP = V(...CLOSE);
const stack = new THREE.Group();
stack.position.copy(CP);
scene.add(stack);
const s4 = new THREE.Group();
{
  const body = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.3, 14, 64), MAT.white);
  body.position.y = -11;
  s4.add(body);
  const aft = new THREE.Mesh(new THREE.CylinderGeometry(3.32, 3.32, 3, 64), MAT.black);
  aft.position.y = -16.5;
  s4.add(aft);
  const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.0, 2.2, 32, 1, true), MAT.bellDark);
  bell.material.side = THREE.DoubleSide;
  bell.position.y = -19;
  s4.add(bell);
  const iu = new THREE.Mesh(new THREE.CylinderGeometry(3.32, 3.32, 1, 64), MAT.lmPanel);
  iu.position.y = -3.5;
  s4.add(iu);
}
const s4Flame = makeFlame({ r: 1.0, len: 12, color: 0xbfd7ff, core: 0xffffff });
s4Flame.position.y = -20;
s4.add(s4Flame);
// SLA: four panels around the LM (CSM sits on top), thrown off on "Unterwegs"
const sla = [];
for (let i = 0; i < 4; i++) {
  const pv = new THREE.Group();
  const panel = new THREE.Mesh(
    new THREE.CylinderGeometry(2.0, 3.3, 9.2, 32, 1, true, (i * Math.PI) / 2, Math.PI / 2),
    MAT.alu,
  );
  panel.material = MAT.alu.clone();
  panel.material.side = THREE.DoubleSide;
  panel.position.y = 1.6;
  pv.add(panel);
  pv.userData.a = (i * Math.PI) / 2 + Math.PI / 4;
  s4.add(pv);
  sla.push(pv);
}
stack.add(s4);
const lm = makeLM();
lm.group.scale.setScalar(0.72);
lm.group.position.y = -2.6;
stack.add(lm.group);
const csm = makeCSM();
stack.add(csm.group);
const bigEarth = makeEarth(900, { spin: 0.003 });
bigEarth.position.copy(CP).add(V(260, -1100, -1500));
scene.add(bigEarth);
// barbecue roll: a hot glow on the sun side, a cold one on the shade side
const hot = new THREE.PointLight(0xff8a3a, 0, 30, 1.5);
const cold = new THREE.PointLight(0x7fb8ff, 0, 30, 1.5);
scene.add(hot, cold);
// fill light for the close-ups (metal in black space reflects nothing)
const fill = new THREE.DirectionalLight(0xfff4e6, 2.2);
fill.position.copy(CP).add(V(40, 30, 60));
fill.target = stack;
scene.add(fill);
const fill2 = new THREE.DirectionalLight(0x9fb4ff, 0.9);
fill2.position.copy(CP).add(V(-50, 10, 20));
fill2.target = stack;
scene.add(fill2);

const applyCamera = shotCamera(shots, 1);

function renderAt(t) {
  // ---- diagram
  const ma = moonAngle(t);
  moon.position.copy(moonPos(ma));
  moon.rotation.y = t * 0.05;
  // direct (wrong) shot: from the Earth to where the Moon WAS at T.zielst
  const aimTo = moonPos(moonAngle(T.zielst));
  const from = V(4, 0, -4.5);
  const da = smooth(ramp(t, T.zielst + 0.2, T.zielst + 2.2));
  const aimOn = t >= T.zielst && t < T.kennst;
  aimLine.visible = aimOn;
  const cur = from.clone().lerp(aimTo, da);
  aimLine.position.copy(from).add(cur).multiplyScalar(0.5);
  aimLine.scale.set(1, Math.max(0.01, from.distanceTo(cur)), 1);
  aimLine.quaternion.setFromUnitVectors(V(0, 1, 0), aimTo.clone().sub(from).normalize());
  showNope(pop(t, T.zielst + 2.3, T.kennst), aimTo.x, 2, aimTo.z, 5);
  lead.visible = t >= T.apollo && t < T.dritte;
  lead.scale.copy(squash(t, T.apollo + 1.3));
  // the figure eight grows, then the dot runs it
  const grow = smooth(ramp(t, T.acht - 1.2, T.acht + 1.5));
  const runK = ramp(t, T.faellt, T.ohne + 0.2);
  eight.visible = t >= T.geniale && t < T.unterwegs2;
  eightGeo.setDrawRange(0, Math.ceil(Math.max(grow, runK) * SEG) * 8 * 6);
  let dotPos = null;
  if (aimOn) dotPos = cur;
  else if (t >= T.dann && t < T.dabei)
    dotPos = eightCurve.getPoint(ramp(t, T.dann, T.dabei) * 0.35);
  else if (t >= T.faellt && t < T.unterwegs2) dotPos = eightCurve.getPoint(Math.min(1, runK));
  else if (t >= T.triffst)
    dotPos = eightCurve.getPoint(0.15 + ramp(t, T.triffst, T.triffst + 8) * 0.4);
  dot.visible = !!dotPos;
  if (dotPos) dot.position.copy(dotPos).setY(0.4);
  if (t >= T.triffst) {
    eight.visible = true;
    eightGeo.setDrawRange(0, SEG * 8 * 6);
  }

  // ---- football: A passes into B's run
  const kick = T.pass;
  const arrive = T.pass + 2.6;
  pA.position.set(-6, 0, -1);
  pA.rotation.y = 1.0;
  const run = smooth(ramp(t, T.kennst, arrive));
  pB.position.set(lerp(1, 6, run), 0, lerp(-6, 4, run));
  pB.rotation.y = 0.5;
  pB.children.forEach(
    (m) =>
      m.userData.leg &&
      (m.rotation.x = Math.sin(t * 12) * 0.6 * m.userData.leg * (run < 1 ? 1 : 0)),
  );
  const bk = smooth(ramp(t, kick, arrive));
  ball.position.set(lerp(-5.4, 6, bk), 0.2 + Math.sin(bk * Math.PI) * 1.2, lerp(-0.6, 4.2, bk));
  ball.rotation.x = t * 8;
  runTarget.visible = t > kick - 0.4 && t < arrive + 0.6;

  // ---- close-up stack: burn → coast + roll → separation, turn, dock, extract
  stack.position.copy(CP).add(V(0, 0, 0));
  const burnK = t >= T.dritte + 0.8 && t < T.dann + 0.6 ? 1 : 0;
  s4Flame.userData.set(burnK, t);
  const roll = t >= T.dabei && t < T.schrumpft ? (t - T.dabei) * 0.35 : 0;
  stack.rotation.y = roll;
  hot.intensity = t >= T.sonst && t < T.schrumpft ? 60 : 0;
  cold.intensity = t >= T.sonst && t < T.schrumpft ? 40 : 0;
  hot.position.copy(CP).add(V(14, 6, 6));
  cold.position.copy(CP).add(V(-14, 6, -6));
  // SLA petals open on "Unterwegs"
  // SLA panels fly off
  const off = Math.max(0, t - (T.unterwegs2 + 0.3));
  sla.forEach((p) => {
    const a = p.userData.a;
    p.position.set(Math.sin(a) * off * 6, -off * 1.5, Math.cos(a) * off * 6);
    p.rotation.set(Math.cos(a) * off * 0.5, 0, -Math.sin(a) * off * 0.5);
    p.visible = off < 6;
  });
  // CSM: sits on top (y 6) → up (y 22) → flips → down onto the LM → pulls it out
  const sep = smooth(ramp(t, T.unterwegs2 + 0.3, T.drehen2));
  const flip = smooth(ramp(t, T.drehen2, T.docken));
  const dock = smooth(ramp(t, T.docken, T.docken + 0.9));
  const pull = smooth(ramp(t, T.ziehen, T.eagle + 0.6));
  const lmTop = -2.6 + 5.75 * 0.72;
  const csmFlipY = lmTop + 14.1;
  let cy = lerp(6.2, 24, sep);
  if (flip > 0) cy = lerp(24, 30, Math.sin(flip * Math.PI) * 0.3 + flip * 0) + 0;
  if (flip >= 1) cy = lerp(24, csmFlipY, dock);
  csm.group.position.y = cy + pull * 12;
  csm.group.rotation.x = flip * Math.PI;
  lm.group.position.y = -2.6 + pull * 12;
  csm.spsFlame.userData.set(0, t);

  // ---- displays
  readout("dist", pop(t, T.km, T.rast - 0.1), {
    label: "Entfernung",
    value: "384.000",
    unit: "km",
    x: 110,
    y: 190,
  });
  readout("moon", pop(t, T.rast, T.zielst - 0.1), {
    label: "Mond-Tempo",
    value: "3.600",
    unit: "km/h",
    x: 110,
    y: 190,
  });
  readout("tli", pop(t, T.tempo - 0.2, T.dann), {
    label: "Tempo",
    value: "40.000",
    unit: "km/h",
    x: 110,
    y: 190,
  });
  if (t >= T.dabei + 0.8 && t < T.sonst)
    showPanel(pop(t, T.dabei + 0.8, T.sonst), "1 DREHUNG", "20 MIN", LED.yellow);
  else if (t >= T.ohne && t < T.unterwegs2)
    showPanel(pop(t, T.ohne, T.unterwegs2), "TREIBSTOFF", "0 LITER", LED.green);
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
