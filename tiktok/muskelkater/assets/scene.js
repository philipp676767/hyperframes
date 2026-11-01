// #47 "Muskelkater" (Format A) — a hiker walks down timber-edged steps on an
// alpine trail. Frame 0: mid-step, both thighs glowing red with cracks of
// pain. Sunday: the easy descent (wide, hut + summit). Tuesday: backwards
// down the steps, wobbling. "Keine Milchsäure" ✕, then x-ray: the muscle is
// broken. Inside the muscle: a fibre = a chain of links; in slow motion
// links snap apart (Mikrorisse). Back outside: lactic acid bubbles leave
// within the hour (stopwatch). Mid twist: effort gauges (uphill high, downhill
// low). X-ray side view: the thigh is stretched while it pulls (arrows).
// Inside again: a second snap, a repair crew of cells, swelling, the nerve
// zaps. Payoff: the muscle is the brake — a bike brake sparks and wears.
// Übrigens: happy descent inside a golden shield, "bis 6 Wochen".
import {
  THREE,
  ramp,
  smooth,
  easeInOut,
  pop,
  lerp,
  clamp01,
  V,
  rng,
  scene,
  flat,
  jitter,
  facet,
  facetMat,
  xrayMaterial,
  xrayEdges,
  setXray,
  showNope,
  showPanel,
  LED,
  labels,
  makeArrowSet,
  animateArrows,
  forceMat,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { stepY, stepZ } from "./set.js";
import { readout, stopwatch, gauge } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS, MAC, BR, TEAR1, TEAR2 } from "./beats.js";

highlights(HIGHLIGHTS);

const mesh = (geo, mat, x, y, z, parent = scene, shadow = true) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};
const glowMat = (c, e = 0.6, extra = {}) =>
  flat(c, { emissive: c, emissiveIntensity: e, roughness: 0.45, ...extra });
const additive = (c) =>
  new THREE.MeshBasicMaterial({
    color: c,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

// ---------------------------------------------------------------- the hiker
const SKIN = 0xf1c09a;
const L1 = 0.62; // thigh
const L2 = 0.6; // shin
const ANK = 0.1; // ankle above the step
const HIP = 1.2; // pelvis above the stance step
const HIPX = 0.2;
const person = new THREE.Group();
scene.add(person);

const shirtMat = flat(0x23a08f, { roughness: 0.75 });
const shortsMat = xrayMaterial(0x2b3a67, { flatShading: true, roughness: 0.8 });
const skinXray = xrayMaterial(SKIN, { flatShading: true, roughness: 0.7 });
const skinMat = flat(SKIN, { roughness: 0.7 });
const bootMat = flat(0x6b3f22, { roughness: 0.8 });
const sockMat = flat(0xe0453a);
const packMat = flat(0xf39a1e, { roughness: 0.7 });
const xrayMats = [shortsMat, skinXray];

// pelvis + torso
mesh(new THREE.BoxGeometry(0.58, 0.32, 0.34), shortsMat, 0, 0.04, 0, person);
const torso = mesh(
  jitter(new THREE.CylinderGeometry(0.31, 0.29, 0.82, 12, 2), 0.01, 3),
  shirtMat,
  0,
  0.58,
  0,
  person,
);
torso.scale.z = 0.72;
const shoulders = mesh(
  new THREE.SphereGeometry(0.32, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2),
  shirtMat,
  0,
  0.97,
  0,
  person,
);
shoulders.scale.set(1.12, 0.4, 0.75);
mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.18, 8), skinMat, 0, 1.08, 0, person);
// backpack with a rolled mat
mesh(new THREE.BoxGeometry(0.5, 0.62, 0.26), packMat, 0, 0.62, -0.32, person);
mesh(new THREE.BoxGeometry(0.44, 0.2, 0.08), flat(0xd27a10), 0, 0.5, -0.47, person);
{
  const mat = mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 0.56, 10),
    flat(0x2f6fd6),
    0,
    0.98,
    -0.32,
    person,
  );
  mat.rotation.z = Math.PI / 2;
  for (const sx of [-1, 1]) {
    const strap = mesh(
      new THREE.BoxGeometry(0.06, 0.55, 0.04),
      flat(0x3a3a44),
      sx * 0.17,
      0.72,
      0.23,
      person,
      false,
    );
    strap.rotation.x = -0.08;
  }
}
// head with cap
const head = new THREE.Group();
head.position.set(0, 1.33, 0.02);
person.add(head);
const brows = [];
const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), flat(0x5a1a18));
{
  const skull = mesh(
    jitter(new THREE.SphereGeometry(0.24, 14, 11), 0.008, 5),
    skinMat,
    0,
    0,
    0,
    head,
  );
  skull.scale.set(0.92, 1.05, 0.95);
  const nose = mesh(new THREE.ConeGeometry(0.04, 0.1, 5), skinMat, 0, -0.01, 0.24, head);
  nose.rotation.x = Math.PI / 2;
  for (const sx of [-1, 1]) {
    mesh(
      new THREE.SphereGeometry(0.035, 8, 6),
      flat(0x1c120e, { roughness: 0.2 }),
      sx * 0.085,
      0.04,
      0.205,
      head,
      false,
    );
    const b = mesh(
      new THREE.BoxGeometry(0.08, 0.018, 0.02),
      flat(0x4a2a18),
      sx * 0.085,
      0.11,
      0.21,
      head,
      false,
    );
    brows.push(b);
    const ear = mesh(new THREE.SphereGeometry(0.05, 7, 6), skinMat, sx * 0.22, 0, -0.01, head);
    ear.scale.set(0.5, 1, 0.8);
    mesh(
      new THREE.SphereGeometry(0.035, 8, 6),
      flat(0xff9a8a),
      sx * 0.13,
      -0.05,
      0.19,
      head,
      false,
    );
  }
  mouth.position.set(0, -0.1, 0.215);
  mouth.scale.set(1.4, 0.5, 0.5);
  head.add(mouth);
  // cap + brim + ponytail
  const cap = mesh(
    new THREE.SphereGeometry(0.25, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    flat(0xe8343a),
    0,
    0.06,
    0,
    head,
  );
  cap.scale.set(0.96, 0.8, 1.0);
  const brim = mesh(
    new THREE.CylinderGeometry(0.17, 0.17, 0.025, 14),
    flat(0xc4262c),
    0,
    0.07,
    0.2,
    head,
  );
  brim.scale.z = 0.8;
  const tail = mesh(new THREE.ConeGeometry(0.07, 0.3, 7), flat(0x6a3a1c), 0, -0.04, -0.24, head);
  tail.rotation.x = -2.6;
}

// arms: shoulder → upper arm → elbow → forearm + hand
const arms = [];
for (const sx of [-1, 1]) {
  const arm = new THREE.Group();
  arm.position.set(sx * 0.36, 0.93, 0);
  person.add(arm);
  mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.4, 8), shirtMat, 0, -0.19, 0, arm);
  const elbow = new THREE.Group();
  elbow.position.y = -0.38;
  arm.add(elbow);
  mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.36, 8), skinMat, 0, -0.18, 0, elbow);
  mesh(new THREE.SphereGeometry(0.065, 8, 6), skinMat, 0, -0.39, 0.01, elbow);
  arms.push({ arm, elbow, sx });
}

// legs: hip → thigh (skin, x-ray) with the quadriceps inside → knee → shin → boot
const legs = [];
const thighGeo = new THREE.CylinderGeometry(0.16, 0.12, L1, 12, 3);
for (const sx of [-1, 1]) {
  const hip = new THREE.Group();
  hip.position.set(sx * HIPX, -0.05, 0);
  person.add(hip);
  const thigh = mesh(thighGeo, skinXray, 0, -L1 / 2, 0, hip);
  const edges = xrayEdges(thighGeo);
  edges.position.copy(thigh.position);
  hip.add(edges);
  mesh(new THREE.CylinderGeometry(0.175, 0.17, 0.22, 12), shortsMat, 0, -0.09, 0, hip);
  // the quadriceps: a red spindle on the front of the bone, faint fibre lines
  const quad = new THREE.Group();
  quad.position.set(0, -0.33, 0.035);
  hip.add(quad);
  const quadMat = flat(0xd8333c, { emissive: 0xff2a1a, emissiveIntensity: 0, roughness: 0.5 });
  const qm = mesh(new THREE.SphereGeometry(1, 14, 10), quadMat, 0, 0, 0, quad, false);
  qm.scale.set(0.105, 0.27, 0.085);
  for (let k = 0; k < 5; k++) {
    const line = mesh(
      new THREE.CylinderGeometry(0.006, 0.006, 0.42, 4),
      flat(0xff8f8a),
      (k - 2) * 0.035,
      0,
      0.078 - Math.abs(k - 2) * 0.012,
      quad,
      false,
    );
    line.rotation.x = 0.06;
  }
  mesh(
    new THREE.CylinderGeometry(0.035, 0.035, L1 * 0.9, 8),
    flat(0xf4efe2),
    0,
    -L1 / 2,
    -0.03,
    hip,
    false,
  );
  // pain glow (frame-0 hook) + crack lines on the front of the thigh
  const glow = new THREE.Mesh(thighGeo, additive(0xff2a10));
  glow.position.copy(thigh.position);
  glow.scale.setScalar(1.12);
  hip.add(glow);
  const cracks = [];
  const crackMat = new THREE.MeshBasicMaterial({ color: 0xfff0a8 });
  const r = rng(sx > 0 ? 5 : 9);
  for (let c = 0; c < 3; c++) {
    const pts = [];
    let y = -0.12 - c * 0.12;
    let a = (r() - 0.5) * 0.9;
    for (let k = 0; k < 6; k++) {
      const rad = 0.165 - (-y / L1) * 0.04;
      pts.push(V(Math.sin(a) * rad, y, Math.cos(a) * rad));
      y -= 0.04 + r() * 0.03;
      a += (r() - 0.5) * 0.7;
    }
    const cr = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0), 24, 0.011, 4),
      crackMat,
    );
    hip.add(cr);
    cracks.push(cr);
  }
  // force arrows along the front (the thigh pulls while it is stretched)
  const pull = makeArrowSet(
    [
      [V(0, -L1 + 0.05, 0.22), V(0, -0.18, 0.22)],
      [V(sx * 0.07, -L1 + 0.12, 0.2), V(sx * 0.07, -0.25, 0.2)],
    ],
    { parent: hip, mat: forceMat, amp: 0, r: 0.022 },
  );
  // front point for labels
  const front = new THREE.Object3D();
  front.position.set(0, -0.3, 0.17);
  hip.add(front);
  const knee = new THREE.Group();
  knee.position.y = -L1;
  hip.add(knee);
  mesh(new THREE.SphereGeometry(0.12, 10, 8), skinMat, 0, 0, 0.01, knee);
  mesh(new THREE.CylinderGeometry(0.115, 0.085, L2, 10), skinMat, 0, -L2 / 2, 0, knee);
  mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.14, 10), sockMat, 0, -L2 + 0.1, 0, knee);
  const ankle = new THREE.Group();
  ankle.position.y = -L2;
  knee.add(ankle);
  mesh(new THREE.BoxGeometry(0.2, 0.13, 0.34), bootMat, 0, -0.04, 0.06, ankle);
  mesh(new THREE.BoxGeometry(0.21, 0.035, 0.36), flat(0x2e2a2c), 0, -0.11, 0.06, ankle);
  legs.push({ sx, hip, knee, ankle, quad, qm, quadMat, glow, cracks, pull, front, edges });
}

// IK in the hiker's own frame: hip joint at (sx·HIPX, -0.05, 0)
function legIK(leg, target) {
  // target: ankle point in person-local coordinates
  const dy = target.y - leg.hip.position.y;
  const dz = target.z;
  let d = Math.hypot(dy, dz);
  d = Math.min(Math.max(d, 0.35), L1 + L2 - 0.002);
  const a = Math.atan2(dz, -dy);
  const c1 = (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d);
  const th = a + Math.acos(Math.min(1, Math.max(-1, c1)));
  const cK = (L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2);
  const bend = Math.PI - Math.acos(Math.min(1, Math.max(-1, cK)));
  leg.hip.rotation.x = -th;
  leg.knee.rotation.x = bend;
  leg.ankle.rotation.x = th - bend;
  return bend;
}

// gait on the stairs: s = steps walked (continuous). Foot f lands on step j
// at s = j (j ≡ f mod 2), swinging from step j-2 during s ∈ [j-1, j].
const footW = [V(0, 0, 0), V(0, 0, 0)];
const pelvis = V(0, 0, 0);
const mod2 = (j) => ((j % 2) + 2) % 2;
function gait(s, back, lift = 0.2) {
  for (let f = 0; f < 2; f++) {
    let j = Math.ceil(s);
    if (mod2(j) !== f) j += 1;
    const prev = j - 2;
    let u = clamp01(s - (j - 1));
    const sideX = (back ? -1 : 1) * (f === 0 ? -HIPX : HIPX);
    const e = easeInOut(u);
    const z = lerp(stepZ(prev), stepZ(j), e);
    const y = lerp(stepY(prev), stepY(j), e) + ANK + Math.sin(Math.PI * u) * lift;
    footW[f].set(sideX, y, z);
  }
  const bob = 0.04 * Math.sin(Math.PI * (s - Math.floor(s)));
  pelvis.set(0, stepY(s - 0.5) + HIP + bob, stepZ(s - 0.5));
}

// where the hiker is (s) and how, as a pure function of t
function walk(t) {
  if (t < T.stell) return { s: 1.6 + t * 1.7, back: false, pain: 1 };
  if (t < T.dienstag) return { s: -1.2 + (t - T.stell) * 1.6, back: false, pain: 0 };
  if (t < T.keine) {
    const u = t - T.dienstag;
    // backwards: halting steps, a stop on each one
    const s = 1 + Math.floor(u / 0.95) + smooth(clamp01((u % 0.95) / 0.6));
    return { s, back: true, pain: 1, wobble: 1 };
  }
  if (t < T.das3) return { s: 4, back: false, pain: t < T.faser ? 1 : 0, stand: true };
  if (t < T.dein2) return { s: -0.4 + (t - T.das3) * 1.8, back: false, pain: 0 };
  if (t < T.dabei) return { s: 1.4 + (t - T.dein2) * 1.0, back: false, pain: 0 };
  if (t < T.uebrigens) return { s: 2 + (t - T.bergab3) * 1.6, back: false, pain: 0.6 };
  return { s: -0.6 + (t - T.uebrigens) * 1.5, back: false, pain: 0, happy: true };
}

// ---------------------------------------------------------------- lactic acid bubbles
const lactate = [];
{
  const mat = new THREE.MeshStandardMaterial({
    color: 0xd8f05a,
    emissive: 0xb8e030,
    emissiveIntensity: 0.6,
    roughness: 0.2,
    transparent: true,
    opacity: 0.9,
  });
  const r = rng(21);
  for (let i = 0; i < 22; i++) {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.025 + r() * 0.025, 1), mat);
    scene.add(m);
    lactate.push({
      m,
      leg: i % 2,
      y: -0.12 - r() * 0.4,
      a: (r() - 0.5) * 2.4,
      ph: r(),
      sp: 0.5 + r() * 0.6,
    });
  }
}

// ---------------------------------------------------------------- golden shield (Übrigens)
const shield = new THREE.Group();
person.add(shield);
const shieldMat = additive(0xffc93a);
{
  const g = new THREE.IcosahedronGeometry(1, 2);
  const s = new THREE.Mesh(g, shieldMat);
  shield.add(s);
  const e = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.01, 1)),
    new THREE.LineBasicMaterial({ color: 0xffe28a, transparent: true, opacity: 0 }),
  );
  shield.add(e);
  shield.position.set(0, -0.42, 0.04);
  shield.scale.set(0.52, 0.5, 0.36);
}

// ---------------------------------------------------------------- inside the muscle
const MP = V(...MAC);
const macro = new THREE.Group();
macro.position.copy(MP);
scene.add(macro);
{
  const wall = new THREE.Mesh(
    facet(new THREE.CylinderGeometry(4.6, 4.6, 28, 28, 8, true), 0.08, 3),
    facetMat(
      flat(0x8a1a28, {
        side: THREE.BackSide,
        emissive: 0x4a0812,
        emissiveIntensity: 0.6,
        roughness: 0.9,
      }),
    ),
  );
  wall.rotation.z = Math.PI / 2;
  macro.add(wall);
  const l1 = new THREE.PointLight(0xffe0d0, 40, 16, 1.4);
  l1.position.set(1.5, 3, 4);
  macro.add(l1);
  const l2 = new THREE.PointLight(0xff7a6a, 16, 14, 1.5);
  l2.position.set(-3, -2, 2.5);
  macro.add(l2);
  const l3 = new THREE.PointLight(0xffc0a0, 12, 12, 1.5);
  l3.position.set(3, 1, -2);
  macro.add(l3);
}
const SEG = 0.7;
const NSEG = 20;
const segX = (i) => -((NSEG - 1) * SEG) / 2 + i * SEG;
const boundaryX = (b) => segX(b) - SEG / 2;
// fibres: [y, z, r]; fibre 0 = the hero fibre in front
const FIBRES = [
  [0, 0, 0.42],
  [1.0, -0.35, 0.4],
  [-0.98, -0.3, 0.41],
  [0.48, -1.25, 0.38],
  [-0.55, -1.3, 0.4],
  [1.55, -1.6, 0.36],
  [-1.6, -1.55, 0.38],
  [0.0, -2.3, 0.44],
  [1.4, 0.75, 0.3],
  [-1.5, 0.7, 0.32],
];
// tears: fibre, boundary index, time
const TEARS = [
  { f: 0, b: Math.round((TEAR1 + ((NSEG - 1) * SEG) / 2 + SEG / 2) / SEG), at: T.reissen + 0.3 },
  { f: 1, b: 7, at: T.reissen + 0.45 },
  { f: 2, b: 13, at: T.reissen + 0.55 },
  { f: 0, b: Math.round((TEAR2 + ((NSEG - 1) * SEG) / 2 + SEG / 2) / SEG), at: T.reisst },
  { f: 3, b: 11, at: T.reisst + 0.15 },
];
const tearX = (tr) => boundaryX(tr.b);
const nInst = FIBRES.length * NSEG;
const bodyMat = flat(0xe0575f, { roughness: 0.45, emissive: 0x5a0a14, emissiveIntensity: 0.35 });
const bandMat = flat(0x9a1f30, { roughness: 0.5 });
const ringMat = flat(0xffc2c0, { roughness: 0.4, emissive: 0x6a2030, emissiveIntensity: 0.3 });
const segBody = new THREE.InstancedMesh(
  new THREE.CylinderGeometry(1, 1, SEG * 0.84, 16, 1),
  bodyMat,
  nInst,
);
const segBand = new THREE.InstancedMesh(
  new THREE.CylinderGeometry(1.04, 1.04, 0.1, 16, 1),
  bandMat,
  nInst,
);
const segRing = new THREE.InstancedMesh(new THREE.TorusGeometry(1.0, 0.11, 6, 18), ringMat, nInst);
for (const im of [segBody, segBand, segRing]) {
  im.castShadow = false;
  im.receiveShadow = false;
  macro.add(im);
}
// frayed filaments at each tear (both sides) + sparks at the snap
const frayMat = flat(0xff9a9a, { emissive: 0xff5a5a, emissiveIntensity: 0.5 });
const sparkMat = new THREE.MeshBasicMaterial({ color: 0xfff2b0 });
const frays = [];
const sparks = [];
TEARS.forEach((tr, ti) => {
  const r = rng(40 + ti);
  const list = [];
  for (let k = 0; k < 14; k++) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.012, 1, 4), frayMat);
    macro.add(m);
    list.push({
      m,
      a: r() * Math.PI * 2,
      rr: r() * 0.8,
      side: k % 2 ? 1 : -1,
      len: 0.5 + r() * 0.6,
    });
  }
  frays.push(list);
  const sp = [];
  for (let k = 0; k < 18; k++) {
    const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.035, 0), sparkMat);
    macro.add(m);
    sp.push({ m, dir: V(r() - 0.5, r() - 0.5, r() - 0.5).normalize(), v: 1.2 + r() * 1.6 });
  }
  sparks.push(sp);
});
// fluid (swelling) blobs
const fluidMat = new THREE.MeshStandardMaterial({
  color: 0xffe08a,
  emissive: 0xffb040,
  emissiveIntensity: 0.25,
  roughness: 0.1,
  transparent: true,
  opacity: 0.0,
  depthWrite: false,
});
const fluids = [];
{
  const r = rng(77);
  for (let i = 0; i < 14; i++) {
    const tr = TEARS[i % TEARS.length];
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 2), fluidMat);
    macro.add(m);
    fluids.push({
      m,
      tr,
      off: V((r() - 0.5) * 0.9, (r() - 0.5) * 0.9, 0.2 + r() * 0.5),
      s: 0.12 + r() * 0.15,
    });
  }
}
// repair crew: little glowing cells with eyes
const cells = [];
const cellPos = V(0, 0, 0);
{
  const mat = glowMat(0xd8fbff, 0.7, { roughness: 0.25 });
  const eye = flat(0x1a1a26);
  const r = rng(91);
  for (let i = 0; i < 16; i++) {
    const g = new THREE.Group();
    const b = new THREE.Mesh(jitter(new THREE.IcosahedronGeometry(0.13, 1), 0.012, i), mat);
    g.add(b);
    for (const sx of [-1, 1]) {
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 4), eye);
      e.position.set(sx * 0.045, 0.03, 0.115);
      g.add(e);
    }
    macro.add(g);
    const tr = TEARS[[0, 0, 0, 3, 3, 1, 2, 4][i % 8]];
    const fib = FIBRES[tr.f];
    cells.push({
      g,
      from: V(4 + r() * 3, 2.5 + r() * 1.5, 2 + r() * 2),
      to: V(
        tearX(tr) + (r() - 0.5) * 0.5,
        fib[0] + (r() - 0.5) * 0.7,
        fib[1] + fib[2] + 0.12 + r() * 0.15,
      ),
      d: i * 0.06,
      ph: r() * 6,
    });
  }
}
// the nerve: a yellow cord winding in front of the fibres, with signal pulses
const nervePts = [
  V(-6, -0.9, 1.0),
  V(-3, -0.6, 0.85),
  V(-0.5, -0.15, 0.62),
  V(TEAR1 + 0.3, 0.0, 0.58),
  V(2.5, 0.5, 0.75),
  V(6, 0.9, 1.0),
];
const nerveCurve = new THREE.CatmullRomCurve3(nervePts);
const nerveMat = glowMat(0xffd23f, 0.25, { roughness: 0.4 });
const nerve = new THREE.Mesh(new THREE.TubeGeometry(nerveCurve, 120, 0.075, 8), nerveMat);
macro.add(nerve);
const pulses = [];
{
  const m = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (let i = 0; i < 10; i++) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), m);
    macro.add(p);
    pulses.push(p);
  }
}
// lightning zaps from the nerve (three precomputed variants)
const zaps = [];
{
  const mat = new THREE.MeshBasicMaterial({ color: 0xfff6a0 });
  for (let v = 0; v < 3; v++) {
    const g = new THREE.Group();
    const r = rng(300 + v);
    for (let b = 0; b < 4; b++) {
      const pts = [];
      const p0 = nerveCurve.getPointAt(0.5 + (b - 1.5) * 0.04);
      let p = p0.clone();
      const dir = V(r() - 0.5, r() * 0.8 + 0.2, r() * 0.6).normalize();
      for (let k = 0; k < 6; k++) {
        pts.push(p.clone());
        p.addScaledVector(dir, 0.13).add(
          V((r() - 0.5) * 0.12, (r() - 0.5) * 0.12, (r() - 0.5) * 0.1),
        );
      }
      g.add(
        new THREE.Mesh(
          new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0),
            20,
            0.014,
            4,
          ),
          mat,
        ),
      );
    }
    g.visible = false;
    macro.add(g);
    zaps.push(g);
  }
}
const mtx = new THREE.Matrix4();
const q = new THREE.Quaternion();
const qx = new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), Math.PI / 2); // cylinder y → x
const qr = new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), Math.PI / 2); // torus faces x
const sc = V(1, 1, 1);
const pos = V(0, 0, 0);
function renderMacro(t) {
  macro.visible = true;
  const swell = 1 + 0.26 * smooth(ramp(t, T.schwillt, T.schwillt + 1.2));
  let i = 0;
  FIBRES.forEach(([fy, fz, fr], f) => {
    for (let s = 0; s < NSEG; s++, i++) {
      let off = 0;
      let tilt = 0;
      for (const tr of TEARS) {
        if (tr.f !== f) continue;
        const g = 0.6 * smooth(ramp(t, tr.at, tr.at + 0.45));
        off += s >= tr.b ? g / 2 : -g / 2;
        if (s === tr.b || s === tr.b - 1) tilt += (s >= tr.b ? 1 : -1) * g * 0.25;
      }
      const near = Math.abs(segX(s) - TEAR1) < 2.2 && f === 0 ? 1 : 0.6;
      const r = fr * (1 + (swell - 1) * near);
      pos.set(segX(s) + off, fy + Math.sin(s * 1.3 + f) * 0.02, fz);
      q.setFromAxisAngle(V(0, 0, 1), tilt).multiply(qx);
      sc.set(r, 1, r);
      segBody.setMatrixAt(i, mtx.compose(pos, q, sc));
      segBand.setMatrixAt(i, mtx.compose(pos, q, sc));
      // ring at the left end of each segment
      pos.x -= SEG / 2;
      sc.set(r * 1.02, r * 1.02, r * 1.02);
      segRing.setMatrixAt(i, mtx.compose(pos, qr, sc));
    }
  });
  segBody.instanceMatrix.needsUpdate = true;
  segBand.instanceMatrix.needsUpdate = true;
  segRing.instanceMatrix.needsUpdate = true;
  bodyMat.emissiveIntensity = 0.35 + 0.35 * smooth(ramp(t, T.schwillt, T.schwillt + 1.2));

  TEARS.forEach((tr, ti) => {
    const [fy, fz, fr] = FIBRES[tr.f];
    const g = smooth(ramp(t, tr.at, tr.at + 0.45));
    const x0 = tearX(tr);
    for (const fl of frays[ti]) {
      fl.m.visible = g > 0.02;
      if (!fl.m.visible) continue;
      const len = fl.len * 0.5 * g;
      const rr = fr * fl.rr;
      fl.m.scale.set(1, Math.max(0.001, len), 1);
      fl.m.position.set(
        x0 + fl.side * (0.3 * g - len / 2 + 0.02),
        fy + Math.sin(fl.a) * rr,
        fz + Math.cos(fl.a) * rr,
      );
      fl.m.rotation.set(0, 0, Math.PI / 2 + Math.sin(fl.a + t * 2) * 0.3);
    }
    const u = t - tr.at;
    sparks[ti].forEach((sp) => {
      sp.m.visible = u > 0 && u < 0.7;
      if (!sp.m.visible) return;
      const d = sp.v * u * (1 - u * 0.5);
      sp.m.position.set(
        x0 + sp.dir.x * d,
        fy + sp.dir.y * d - u * u * 0.6,
        fz + fr * 0.5 + Math.abs(sp.dir.z) * d,
      );
      sp.m.scale.setScalar(1 - u / 0.7);
    });
  });
  // fluid blobs swell in with the swelling
  const fk = smooth(ramp(t, T.schwillt, T.schwillt + 1.0));
  fluidMat.opacity = 0.55 * fk;
  fluids.forEach((fl) => {
    fl.m.visible = fk > 0.01;
    const [fy, fz] = FIBRES[fl.tr.f];
    fl.m.position.set(tearX(fl.tr) + fl.off.x, fy + fl.off.y, fz + fl.off.z);
    fl.m.scale.setScalar(Math.max(0.001, fl.s * fk * (1 + 0.08 * Math.sin(t * 3 + fl.s * 20))));
  });
  // repair crew
  const vis = t > T.reparatur - 0.6;
  cells.forEach((c, k) => {
    c.g.visible = vis;
    if (!vis) return;
    const u = smooth(ramp(t, T.reparatur - 0.6 + c.d, T.reparatur + 0.5 + c.d));
    c.g.position.lerpVectors(c.from, c.to, u);
    c.g.position.y += Math.sin(t * 4 + c.ph) * 0.03 * u;
    c.g.scale.setScalar(1 + 0.12 * Math.sin(t * 7 + c.ph) * u);
    c.g.lookAt(c.g.position.x + 0.3, c.g.position.y, c.g.position.z + 2);
    if (k === 0) cellPos.copy(c.g.position).add(MP);
  });
  // nerve: glows and fires once the swelling presses on it
  const nk = ramp(t, T.drueckt, T.drueckt + 0.3);
  nerveMat.emissiveIntensity = 0.25 + 0.9 * nk + 0.6 * nk * Math.abs(Math.sin(t * 18));
  pulses.forEach((p, k) => {
    p.visible = nk > 0;
    const f = (t * 0.55 + k / pulses.length) % 1;
    p.position.copy(nerveCurve.getPointAt(f));
    p.scale.setScalar(0.6 + 0.4 * Math.sin(t * 20 + k));
  });
  const zv = Math.floor(t * 14) % 3;
  zaps.forEach((z, k) => (z.visible = nk > 0.5 && k === zv && Math.sin(t * 31) > -0.3));
}

// ---------------------------------------------------------------- the brake (payoff)
const brake = new THREE.Group();
brake.position.set(...BR);
brake.rotation.y = -0.98;
scene.add(brake);
const wheel = new THREE.Group();
wheel.position.y = 1.0;
brake.add(wheel);
const padMat = flat(0x2a2a30, { emissive: 0xff6a10, emissiveIntensity: 0, roughness: 0.6 });
const pads = [];
const brakeSparks = [];
{
  // wheel in the y-z plane, axle along x
  const tire = new THREE.Mesh(
    new THREE.TorusGeometry(0.9, 0.075, 8, 40),
    flat(0x2e2a2c, { roughness: 0.9 }),
  );
  tire.rotation.y = Math.PI / 2;
  wheel.add(tire);
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.82, 0.035, 6, 40),
    new THREE.MeshStandardMaterial({ color: 0xdfe6ee, metalness: 0.85, roughness: 0.22 }),
  );
  rim.rotation.y = Math.PI / 2;
  wheel.add(rim);
  for (let k = 0; k < 18; k++) {
    const a = (k / 18) * Math.PI * 2;
    const sp = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.8, 4),
      flat(0xcfd6de, { metalness: 0.6, roughness: 0.3 }),
    );
    sp.position.set(k % 2 ? 0.03 : -0.03, Math.cos(a) * 0.4, Math.sin(a) * 0.4);
    sp.rotation.x = a;
    wheel.add(sp);
  }
  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.16, 10),
    flat(0x8a96a3, { metalness: 0.5 }),
  );
  hub.rotation.z = Math.PI / 2;
  wheel.add(hub);
  // fork + crown + bar stub, in red
  const red = flat(0xe0242c, { roughness: 0.35 });
  for (const sx of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.032, 1.15, 8), red);
    leg.position.set(sx * 0.11, 1.55, -0.02);
    leg.rotation.x = 0.08;
    brake.add(leg);
  }
  const crown = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.12), red);
  crown.position.set(0, 2.12, -0.05);
  brake.add(crown);
  const steer = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.5, 8), red);
  steer.position.set(0, 2.38, -0.07);
  brake.add(steer);
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.9, 8), flat(0x2e2a2c));
  bar.rotation.z = Math.PI / 2;
  bar.position.set(0, 2.62, -0.08);
  brake.add(bar);
  // caliper arms + pads at the top of the rim
  const arm = flat(0xb9c2cc, { metalness: 0.6, roughness: 0.3 });
  for (const sx of [-1, 1]) {
    const a = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.3, 0.06), arm);
    a.position.set(sx * 0.1, 1.98, 0);
    brake.add(a);
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.07, 0.2), padMat);
    p.position.set(sx * 0.075, 1.83, 0);
    brake.add(p);
    pads.push({ p, sx });
  }
  // a stand so it doesn't float: two wooden legs + base
  const wood = flat(0x8a5a30);
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 1.5), wood);
  base.position.set(0, 0.05, 0);
  brake.add(base);
  for (const z of [-0.5, 0.5]) {
    const st = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.0, 0.08), wood);
    st.position.set(0.16, 0.55, z * 0.2);
    st.rotation.x = z * 0.6;
    brake.add(st);
  }
  brake.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  const m = new THREE.MeshBasicMaterial({ color: 0xffc14a });
  const r = rng(55);
  for (let k = 0; k < 26; k++) {
    const s = new THREE.Mesh(new THREE.OctahedronGeometry(0.022, 0), m);
    brake.add(s);
    brakeSparks.push({ s, ph: r(), v: 1.5 + r() * 1.5, side: (r() - 0.5) * 0.3 });
  }
}
function renderBrake(t, on) {
  brake.visible = on;
  if (!on) return;
  const grip = smooth(ramp(t, T.bremse + 0.05, T.bremse + 0.3));
  // spins fast, slows while braked
  const ang = t * 9 - grip * (t - T.bremse) * 4;
  wheel.rotation.x = -ang;
  const wear = smooth(ramp(t, T.bremsen, T.bremsen + 1.1));
  pads.forEach(({ p, sx }) => {
    p.position.x = sx * lerp(0.1, 0.06, grip);
    p.scale.y = 1 - 0.55 * wear;
    p.position.y = 1.83 + 0.035 * 0.55 * wear;
  });
  padMat.emissiveIntensity = 1.6 * grip * (0.8 + 0.2 * Math.sin(t * 40));
  brakeSparks.forEach((b) => {
    const u = (t * 1.8 + b.ph) % 1;
    b.s.visible = grip > 0.2;
    // fly off backwards along the rim, then fall
    b.s.position.set(b.side, 1.82 - u * 0.5 - u * u * 0.6, -0.12 - u * b.v * 0.45);
    b.s.scale.setScalar(1 - u);
  });
}

// ---------------------------------------------------------------- camera
const HIKER = V(0, 0, 0);
const cam = shotCamera(shots.map((s) => (s.rel === "hiker" ? { ...s, rel: HIKER } : s)));
const thighP = V(0, 0, 0);
const LAB = LABELS.map((l) => ({
  ...l,
  pos: l.pos === "thigh" ? thighP : l.pos === "cell" ? cellPos : l.pos,
}));

// which world is on screen (macro / brake) — by shot window
const inMacro = (t) => (t >= T.faser && t < T.und1) || (t >= T.dabei && t < T.bergab3);
const inBrake = (t) => t >= T.bremse && t < T.uebrigens;

// ---------------------------------------------------------------- render
const local = V(0, 0, 0);
function renderAt(t) {
  const w = walk(t);
  gait(w.s, w.back, w.back ? 0.12 : 0.2);
  person.rotation.y = w.back ? Math.PI : 0;
  person.position.copy(pelvis);
  // Tuesday: unsteady, hunched; standing: weight shift
  person.rotation.z = w.wobble ? Math.sin(t * 5.3) * 0.06 : 0;
  person.rotation.x = w.wobble ? 0.12 : 0;
  if (w.stand) person.position.y -= 0.02;
  person.updateMatrixWorld(true);
  legs.forEach((leg, f) => {
    // world foot → person-local
    local.copy(footW[f]).sub(person.position);
    local.applyAxisAngle(V(0, 1, 0), -person.rotation.y);
    const bend = legIK(leg, local);
    // the quadriceps stretches as the knee bends
    leg.quad.scale.set(1, 1 + 0.18 * clamp01(bend / 1.2), 1);
  });
  // arms swing against the legs; Tuesday: out for balance; comment: rub the thigh
  const ph = Math.PI * w.s;
  arms.forEach(({ arm, elbow, sx }, k) => {
    const sw = Math.sin(ph + (k ? 0 : Math.PI)) * 0.35;
    if (w.wobble) {
      arm.rotation.set(-0.3, 0, sx * (0.9 + Math.sin(t * 6 + k) * 0.15));
      elbow.rotation.x = -0.5;
    } else if (w.stand && t >= T.wo && k === 1) {
      // right hand rubs the right thigh
      arm.rotation.set(-0.35 + Math.sin(t * 9) * 0.08, 0, -0.12);
      elbow.rotation.x = -0.9;
    } else if (w.happy) {
      arm.rotation.set(sw, 0, sx * 0.12);
      elbow.rotation.x = -0.25;
    } else {
      arm.rotation.set(w.stand ? 0.05 : sw, 0, sx * 0.1);
      elbow.rotation.x = -0.2 - (w.stand ? 0 : Math.max(0, sw) * 0.4);
    }
  });
  // face: pain brows + mouth
  const pain = w.pain;
  brows.forEach((b, k) => (b.rotation.z = (k ? -1 : 1) * 0.35 * pain));
  mouth.scale.set(1.4 - 0.5 * pain, 0.5 + 0.9 * pain, 0.5);
  if (w.happy) mouth.scale.set(1.8, 0.45, 0.5);
  head.rotation.x = w.wobble ? 0.25 : 0.08;

  // pain glow on the thighs: hook + Tuesday, pulsing on each landing
  const land = Math.pow(1 - (w.s - Math.floor(w.s)), 3);
  const glowK = pain * (0.75 + 0.25 * land) * (t < T.dein1 ? 1 : 0);
  // x-ray windows
  const xr = Math.max(
    pop(t, T.dein1, T.faser, 0.25),
    pop(t, T.und1, T.wo, 0.25),
    pop(t, T.dein2, T.dabei, 0.25),
    pop(t, T.bergab3, T.bremse, 0.2),
  );
  setXray(xrayMats, xr);
  skinXray.emissive.setHex(0xff1a00);
  skinXray.emissiveIntensity = 0.55 * glowK * (1 - xr);
  const broken = pop(t, T.kaputt - 0.1, T.faser, 0.15);
  const brakeGlow = pop(t, T.bergab3, T.bremse, 0.2);
  legs.forEach((leg) => {
    leg.glow.material.opacity = 0.9 * glowK * (1 - xr);
    leg.glow.visible = glowK > 0.01 && xr < 0.9;
    const flick = Math.sin(t * 23 + leg.sx) > -0.2 ? 1 : 0;
    const crackOn = (glowK > 0.3 && flick) || broken > 0.2;
    leg.cracks.forEach((c) => (c.visible = crackOn));
    leg.quadMat.emissiveIntensity = 1.4 * broken + 2.4 * brakeGlow + 0.25 * xr;
    leg.quadMat.emissive.setHex(brakeGlow > 0.1 ? 0xff7a10 : 0xff2a1a);
    leg.qm.visible = xr > 0.05;
    leg.edges.visible = xr > 0.05;
    animateArrows(leg.pull, t, pop(t, T.gedehnt, T.dabei, 0.25));
  });
  legs[1].front.getWorldPosition(thighP);

  // lactic acid leaves within the hour
  const lk = pop(t, T.und1, T.wo, 0.2);
  const gone = ramp(t, T.rate + 0.2, T.stunde);
  lactate.forEach((b) => {
    const u = (t * 0.35 * b.sp + b.ph) % 1;
    b.m.visible = lk > 0.05 && b.ph >= gone;
    if (!b.m.visible) return;
    const leg = legs[b.leg];
    const p = V(Math.sin(b.a) * (0.1 + u * 0.4), b.y + u * 0.5, Math.cos(b.a) * (0.1 + u * 0.4));
    leg.hip.localToWorld(p);
    b.m.position.copy(p);
    b.m.scale.setScalar(lk * (1 - u * 0.7));
  });

  // golden shield (Übrigens)
  const sk = smooth(ramp(t, T.uebrigens + 0.2, T.uebrigens + 0.7));
  shield.visible = sk > 0.01;
  shieldMat.opacity = sk * (0.22 + 0.08 * Math.sin(t * 5));
  shield.children[1].material.opacity = sk * 0.85;
  shield.rotation.y = t * 0.6;

  // worlds on screen
  person.visible = !inMacro(t) && !inBrake(t);
  if (inMacro(t)) renderMacro(t);
  else macro.visible = false;
  renderBrake(t, inBrake(t));

  // nope on the lactic-acid myth
  showNope(
    pop(t, T.milch1 + 0.25, T.dein1, 0.2),
    thighP.x - 0.35,
    thighP.y + 0.35,
    thighP.z + 0.25,
    0.35,
  );

  // HUD
  readout("sun", pop(t, T.stell + 0.15, T.dienstag, 0.2), {
    label: "Sonntag",
    value: "Abstieg",
    x: 60,
    y: 420,
    color: "#3dff7a",
  });
  readout("tue", pop(t, T.dienstag + 0.15, T.keine, 0.2), {
    label: "Dienstag",
    value: "Au!",
    x: 60,
    y: 420,
    color: "#ff4b2b",
  });
  stopwatch("sw", pop(t, T.rate, T.wo, 0.25), {
    seconds: 3600 * smooth(ramp(t, T.rate + 0.15, T.stunde)),
    max: 3600,
    label: "Milchsäure",
    x: 60,
    y: 1110,
    color: t >= T.stunde ? "#3dff7a" : "#ffd23f",
  });
  const gk = pop(t, T.das3 + 0.1, T.dein2, 0.25);
  const gv = smooth(ramp(t, T.bergab2 - 0.4, T.weniger + 0.3));
  gauge("auf", gk, {
    label: "Bergauf",
    value: Math.round(92 * smooth(ramp(t, T.das3 + 0.1, T.bergab2))),
    max: 100,
    unit: "%",
    x: 60,
    y: 430,
    color: "#ff4b2b",
  });
  gauge("ab", gk, {
    label: "Bergab",
    value: Math.round(lerp(92, 38, gv) * smooth(ramp(t, T.das3 + 0.1, T.bergab2))),
    max: 100,
    unit: "%",
    x: 560,
    y: 430,
    color: "#3dff7a",
  });

  // LED facts
  if (t >= T.stunde && t < T.wo)
    showPanel(pop(t, T.stunde, T.wo), "MILCHSÄURE WEG", "nach 1 h", LED.green);
  else if (t >= T.wochen - 0.2 && t < T.folge)
    showPanel(pop(t, T.wochen - 0.2, T.folge), "SCHUTZ BIS", "6 Wochen", LED.green);
  else showPanel(0);

  labels(t, LAB);
  HIKER.copy(person.position);
  cam(t);
  renderFrame();
}

start(renderAt);
