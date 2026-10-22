// "So funktioniert ein Wassersprudler". World, captions, camera, panel, arrows
// and labels live in world.js; this file only builds the soda maker story.
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
  makeArrowSet,
  animateArrows,
  forceMat,
  showNope,
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
import { T, shots, LABELS, BZ, OUT, WL, CYL, VALVE, MS, RT } from "./beats.js";

createWorld({ env: "strand", sky: "mittag" });

Object.assign(M, {
  deck: flat(0xd2a46c),
  deckDark: flat(0xb98a52),
  base: flat(0x2b2d33, { roughness: 0.5 }),
  accent: flat(0x2fb8a8, { roughness: 0.45 }),
  button: flat(0x2fb8a8, { roughness: 0.35, emissive: 0x2fb8a8, emissiveIntensity: 0 }),
  brass: new THREE.MeshStandardMaterial({
    color: 0xd9a640,
    metalness: 0.6,
    roughness: 0.3,
    emissive: 0xffd23f,
    emissiveIntensity: 0,
  }),
  bottle: new THREE.MeshStandardMaterial({
    color: 0xe6f6ff,
    roughness: 0.05,
    transparent: true,
    opacity: 0.26,
    depthWrite: false,
    side: THREE.DoubleSide,
  }),
  soda: new THREE.MeshStandardMaterial({
    color: 0x7cc7f2,
    roughness: 0.05,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
  }),
  cap: flat(0x2f7fd8, { roughness: 0.4 }),
  seal: flat(0x3a3d44, { emissive: 0x3dff7a, emissiveIntensity: 0 }),
  bubble: new THREE.MeshStandardMaterial({
    color: 0xf2fbff,
    roughness: 0.1,
    emissive: 0xbfe8ff,
    emissiveIntensity: 0.35,
  }),
  gas: new THREE.MeshBasicMaterial({ color: 0xf4f8fc }),
  liquid: flat(0xcfeeff, { emissive: 0x6fc8ff, emissiveIntensity: 0.35, roughness: 0.2 }),
  carbon: flat(0x44464f, { roughness: 0.4 }),
  oxy: flat(0xe8473b, { roughness: 0.4 }),
  hyd: flat(0xffffff, { roughness: 0.4 }),
  acid: flat(0xff9a2e, { emissive: 0xff7a10, emissiveIntensity: 0 }),
  lid: new THREE.MeshStandardMaterial({
    color: 0xdff4ff,
    roughness: 0.1,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  }),
  ice: new THREE.MeshStandardMaterial({
    color: 0xeefaff,
    roughness: 0.15,
    transparent: true,
    opacity: 0.85,
    emissive: 0xbfe8ff,
    emissiveIntensity: 0.2,
  }),
  thermo: flat(0x2f9bff, { emissive: 0x2f9bff, emissiveIntensity: 0.5 }),
});

function box(w, h, d, mat, x, y, z, parent, edges = false) {
  const g = new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(g, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  if (edges) {
    const e = xrayEdges(g);
    e.position.copy(m.position);
    parent.add(e);
  }
  return m;
}
function cyl(r0, r1, h, mat, x, y, z, parent, seg = 20) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  parent.add(m);
  return m;
}

// ---------------------------------------------------------------- beach table
// A wooden deck under the machine (stays when the machine pops away).
{
  const deck = new THREE.Group();
  scene.add(deck);
  for (let i = 0; i < 6; i++)
    box(3.0, 0.05, 0.42, i % 2 ? M.deckDark : M.deck, 0, 0.02, -1.0 + i * 0.44, deck);
}

// ---------------------------------------------------------------- machine
const mach = new THREE.Group();
scene.add(mach);
const bodyMat = xrayMaterial(0xf6f3ee);
const headMat = xrayMaterial(0xf6f3ee);
box(1.5, 0.12, 1.25, M.base, 0, 0.1, -0.05, mach);
const HZ0 = -0.66;
const HZ1 = -0.04;
box(1.3, 2.1, HZ1 - HZ0, bodyMat, 0, 0.16 + 1.05, (HZ0 + HZ1) / 2, mach, true);
box(1.3, 0.42, 1.15, headMat, 0, 2.45, -0.085, mach, true);
const stripe = box(1.32, 0.07, 1.17, M.accent, 0, 2.3, -0.085, mach);
stripe.castShadow = false;
cyl(0.15, 0.15, 0.2, M.base, 0, 2.14, BZ, mach, 16); // screw-in adapter

// button on top (pivot group so it can be pressed)
const button = new THREE.Group();
button.position.set(0, 2.66, 0.18);
mach.add(button);
cyl(0.22, 0.22, 0.1, M.button, 0, 0.05, 0, button, 24);

// pressure relief valve sticking out of the head's right side
const valve = new THREE.Group();
valve.position.set(...VALVE);
mach.add(valve);
{
  const v = cyl(0.065, 0.065, 0.16, M.brass, 0, 0, 0, valve, 12);
  v.rotation.z = Math.PI / 2;
  const tip = cyl(0.035, 0.05, 0.06, M.brass, 0.1, 0, 0, valve, 10);
  tip.rotation.z = Math.PI / 2;
}

// CO2 cylinder inside the body
const cylinder = new THREE.Group();
cylinder.position.set(...CYL);
mach.add(cylinder);
const cylMat = xrayMaterial(0xa7b1bc, { metalness: 0.4, roughness: 0.35 });
const bandMat = xrayMaterial(0xff7aa8);
{
  const g = new THREE.CylinderGeometry(0.21, 0.21, 1.35, 20);
  const body = new THREE.Mesh(g, cylMat);
  body.position.y = 0.92;
  body.castShadow = true;
  cylinder.add(body);
  const e = xrayEdges(g);
  e.position.y = 0.92;
  cylinder.add(e);
  const domeG = new THREE.SphereGeometry(0.21, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const dome = new THREE.Mesh(domeG, cylMat);
  dome.position.y = 1.595;
  cylinder.add(dome);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.215, 0.215, 0.14, 20), bandMat);
  band.position.y = 1.3;
  cylinder.add(band);
  cyl(0.08, 0.09, 0.26, M.base, 0, 1.88, 0, cylinder, 12);
}
const liquid = cyl(0.185, 0.185, 0.8, M.liquid, 0, 0.66, 0, cylinder, 20);
liquid.castShadow = false;

// gas line: cylinder valve -> through the head -> dip tube (nozzle) into the bottle
const lineTop = 2.42;
const gasPts = [
  V(0, 2.01, CYL[2]),
  V(0, lineTop, CYL[2]),
  V(0, lineTop, BZ - 0.1),
  V(0, 2.3, BZ),
  V(0, 2.04, BZ),
];
const tubePts = [V(0, 2.04, BZ), V(0, 0.3, BZ)];
const lineCurve = new THREE.CurvePath();
for (let i = 0; i < gasPts.length - 1; i++)
  lineCurve.add(new THREE.LineCurve3(gasPts[i], gasPts[i + 1]));
const LSEG = 40;
const lineGeo = new THREE.TubeGeometry(lineCurve, LSEG, 0.028, 8);
const line = new THREE.Mesh(lineGeo, M.steel);
mach.add(line);
const TSEG = 30;
const tubeGeo = new THREE.TubeGeometry(new THREE.LineCurve3(...tubePts), TSEG, 0.026, 8);
const tube = new THREE.Mesh(tubeGeo, M.steel);
mach.add(tube);
const nozzle = cyl(0.045, 0.03, 0.07, M.steel, 0, 0.3, BZ, mach, 10);

// gas beads running through line + tube
const track = [];
{
  const all = [...gasPts, tubePts[1]];
  let L = 0;
  for (let i = 0; i < all.length; i++) {
    if (i > 0) L += all[i].distanceTo(all[i - 1]);
    track.push({ p: all[i], L });
  }
}
const TRACK_L = track[track.length - 1].L;
const LINE_L = track[track.length - 2].L; // where the tube starts
function trackAt(s, out) {
  for (let i = 1; i < track.length; i++)
    if (s <= track[i].L) {
      const a = track[i - 1];
      const b = track[i];
      return out.copy(a.p).lerp(b.p, (s - a.L) / Math.max(1e-6, b.L - a.L));
    }
  return out.copy(track[track.length - 1].p);
}
const NB = 26;
const beads = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), M.gas, NB);
beads.frustumCulled = false;
mach.add(beads);

// ---------------------------------------------------------------- bottle
const bottle = new THREE.Group();
scene.add(bottle);
{
  const prof = [
    [0.0, 0.15],
    [0.26, 0.15],
    [0.3, 0.2],
    [0.3, 1.55],
    [0.26, 1.75],
    [0.14, 1.9],
    [0.13, 2.06],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const glass = new THREE.Mesh(new THREE.LatheGeometry(prof, 28), M.bottle);
  glass.renderOrder = 3;
  bottle.add(glass);
  const water = new THREE.Mesh(new THREE.CylinderGeometry(0.285, 0.285, WL - 0.17, 28), M.soda);
  water.position.y = (WL + 0.17) / 2;
  water.renderOrder = 2;
  bottle.add(water);
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.155, 0.08, 20), M.cap);
  ring.position.y = 1.95;
  bottle.add(ring);
}
const seal = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.025, 8, 24), M.seal);
seal.rotation.x = Math.PI / 2;
seal.position.y = 2.06;
bottle.add(seal);

// bubbles (bottle-local): 0..NN-1 from the nozzle, the rest fizz everywhere
const NN = 30;
const NFZ = 40;
const bubbles = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), M.bubble, NN + NFZ);
bubbles.frustumCulled = false;
bottle.add(bubbles);
const bSeed = (() => {
  const r = rng(11);
  return Array.from({ length: NN + NFZ }, () => [r(), r(), r(), r()]);
})();
// gas cushion above the water + CO2 dissolved in the water
const NH = 40;
const head = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 6, 5), M.gas, NH);
head.frustumCulled = false;
bottle.add(head);
const ND = 70;
const dissolved = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), M.gas, ND);
dissolved.frustumCulled = false;
bottle.add(dissolved);
const hSeed = (() => {
  const r = rng(23);
  return Array.from({ length: NH }, () => [r(), r(), r(), r()]);
})();
const dSeed = (() => {
  const r = rng(31);
  return Array.from({ length: ND }, () => [r(), r(), r(), r()]);
})();
const pressArrows = makeArrowSet(
  [
    [V(0, 1.9, 0.02), V(0, WL + 0.04, 0.02)],
    [V(-0.17, 1.82, 0.05), V(-0.17, WL + 0.04, 0.05)],
    [V(0.17, 1.82, 0.05), V(0.17, WL + 0.04, 0.05)],
  ],
  { parent: bottle, mat: forceMat, amp: 0, r: 0.018 },
);
const escape = makeArrowSet(
  [
    [V(-0.08, WL + 0.02, 0.1), V(-0.12, 1.95, 0.12)],
    [V(0.1, WL + 0.02, 0.05), V(0.14, 1.95, 0.08)],
  ],
  { parent: bottle, mat: M.gas, r: 0.014, amp: 0.025 },
);

// ---------------------------------------------------------------- CO2 molecule set
const molSet = new THREE.Group();
molSet.position.set(...MS);
scene.add(molSet);
box(1.9, 0.2, 1.3, M.deck, 0, 0.1, 0, molSet);
{
  const w = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.95, 1.0), M.soda);
  w.position.y = 0.2 + 0.475;
  w.renderOrder = 2;
  molSet.add(w);
}
const lid = box(1.66, 0.04, 1.06, M.lid, 0, 1.17, 0, molSet);
lid.castShadow = false;
const lidArrows = makeArrowSet(
  [
    [V(-0.45, 1.75, 0.1), V(-0.45, 1.22, 0.1)],
    [V(0.0, 1.8, 0.15), V(0.0, 1.22, 0.15)],
    [V(0.45, 1.75, 0.1), V(0.45, 1.22, 0.1)],
  ],
  { parent: molSet, mat: forceMat, amp: 0, r: 0.025 },
);
const mols = [];
{
  const r = rng(41);
  const spots = [
    [0.05, 0.62, 0.25],
    [-0.5, 0.45, -0.2],
    [0.5, 0.85, -0.15],
    [-0.35, 0.95, 0.25],
    [0.55, 0.4, 0.3],
    [-0.6, 0.75, 0.05],
    [0.25, 0.35, -0.3],
    [-0.1, 0.95, -0.3],
    [0.35, 0.68, 0.1],
  ];
  for (const [x, y, z] of spots) {
    const g = new THREE.Group();
    const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.075, 1), M.carbon);
    g.add(c);
    for (const s of [-1, 1]) {
      const o = new THREE.Mesh(new THREE.IcosahedronGeometry(0.065, 1), M.oxy);
      o.position.x = s * 0.12;
      g.add(o);
    }
    g.position.set(x, y, z);
    g.rotation.set(r() * 3, r() * 3, r() * 3);
    g.userData = { base: V(x, y, z), ph: r() * 6 };
    molSet.add(g);
    mols.push(g);
  }
}
// molecule 0 turns into carbonic acid: one more O + two H, orange glow
const acidParts = new THREE.Group();
mols[0].add(acidParts);
{
  const o = new THREE.Mesh(new THREE.IcosahedronGeometry(0.065, 1), M.acid);
  o.position.set(0, 0.12, 0);
  acidParts.add(o);
  for (const [x, y] of [
    [-0.19, 0.06],
    [0.19, 0.06],
  ]) {
    const h = new THREE.Mesh(new THREE.IcosahedronGeometry(0.045, 1), M.hyd);
    h.position.set(x, y, 0);
    acidParts.add(h);
  }
}
const acidC = mols[0].children[0];

// ---------------------------------------------------------------- ice water set
const iceSet = new THREE.Group();
iceSet.position.set(...RT);
scene.add(iceSet);
box(1.4, 0.2, 1.1, M.deck, 0, 0.1, 0, iceSet);
{
  const g = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.33, 0.95, 24, 1, true), M.bottle);
  g.position.y = 0.2 + 0.475;
  g.renderOrder = 3;
  iceSet.add(g);
  const w = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.32, 0.72, 24), M.soda);
  w.position.y = 0.2 + 0.36;
  w.renderOrder = 2;
  iceSet.add(w);
}
const ices = [];
for (const [x, z, a] of [
  [-0.12, 0.05, 0.4],
  [0.13, -0.08, 1.1],
  [0.02, 0.15, 2.0],
]) {
  const c = box(0.17, 0.17, 0.17, M.ice, x, 0.9, z, iceSet);
  c.rotation.set(a, a * 0.7, a * 0.3);
  c.userData.ph = a;
  ices.push(c);
}
const thermo = new THREE.Group();
thermo.position.set(0.55, 0.2, 0.1);
iceSet.add(thermo);
cyl(0.03, 0.03, 0.75, M.bottle, 0, 0.45, 0, thermo, 10);
const thermoBulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), M.thermo);
thermoBulb.position.y = 0.07;
thermo.add(thermoBulb);
const thermoFill = cyl(0.018, 0.018, 0.6, M.thermo, 0, 0.1, 0, thermo, 8);
const NI = 34;
const iceBubbles = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), M.bubble, NI);
iceBubbles.frustumCulled = false;
iceSet.add(iceBubbles);
const iSeed = (() => {
  const r = rng(53);
  return Array.from({ length: NI }, () => [r(), r(), r()]);
})();

const applyCamera = shotCamera(shots);
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();
const _p = new THREE.Vector3();
const HIDE = new THREE.Matrix4().makeScale(0, 0, 0);
// analogy sets pop in for their beat and fade out after it
function setSet(g, t, k, at) {
  g.visible = k > 0.001;
  g.scale.copy(k > 0 ? squash(t, at).multiplyScalar(k) : V(0.001, 0.001, 0.001));
}

// ---------------------------------------------------------------- render
function renderAt(t) {
  const hook = t < T.lass; // also true for the loop tail (t < 0)

  // machine: shrinks away on "Lass", pops back in as a fresh build
  const out = inBack(ramp(t, T.lass, T.lass + 0.35));
  const back = T.lass + 0.5;
  const mScale =
    t < T.lass + 0.35 ? V(1, 1, 1).multiplyScalar(Math.max(0.001, 1 - out)) : squash(t, back);
  mach.scale.copy(mScale);
  mach.visible = t < T.lass + 0.35 || t >= back;
  puff("mach", t, back + 0.15, 0, 0.05, 0, 1.6);

  // bottle rides with the machine, then slides out on "Aufdrehen"
  const slide = smooth(ramp(t, T.auf + 0.2, T.auf + 1.1));
  bottle.visible = mach.visible || t >= T.auf;
  if (t < T.auf) bottle.scale.copy(mScale);
  else bottle.scale.set(1, 1, 1);
  bottle.position.set(0, -0.1 * slide, BZ + OUT * slide);
  bottle.rotation.y = -Math.PI * 2 * slide;

  // x-ray: body from the steel bottle on, cylinder from "flüssig", off on "Schau"
  const off = 1 - ramp(t, T.schau, T.schau + 0.5);
  const xBody = hook ? 0 : smooth(ramp(t, T.stahl - 0.2, T.stahl + 0.3)) * off;
  setXray([bodyMat, headMat], xBody);
  const xCyl = hook ? 0 : smooth(ramp(t, T.fluessig - 0.2, T.fluessig + 0.3)) * off;
  setXray([cylMat, bandMat], xCyl * 0.6);
  setXray([bodyMat, headMat], xBody); // again last: the shared edge glow follows the body
  liquid.visible = xCyl > 0.05;
  liquid.scale.y = 1 + 0.03 * Math.sin(t * 5);
  liquid.position.y = 0.66 + 0.012 * Math.sin(t * 5);
  M.liquid.emissiveIntensity = 0.35 + 0.25 * pop(t, T.fluessig, T.zylinder);

  // cylinder pops into the x-rayed body on "Stahlflasche"
  cylinder.visible = hook || t >= T.stahl;
  cylinder.scale.copy(hook ? V(1, 1, 1) : squash(t, T.stahl + 0.1));

  // button: held down in the hook, pressed on "drücken"
  const press = hook
    ? 1
    : ramp(t, T.druecken, T.druecken + 0.08) * (1 - ramp(t, T.druecken + 0.7, T.druecken + 0.85));
  button.position.y = 2.66 - 0.06 * press;
  M.button.emissiveIntensity = 0.5 * pop(t, T.knopf, T.rohr);

  // line + dip tube: always there in the hook, grow on "Rohr" after the rebuild
  const lineP = hook ? 1 : ramp(t, T.druecken + 0.1, T.druecken + 0.6);
  lineGeo.setDrawRange(0, Math.ceil(lineP * LSEG) * 8 * 6);
  line.visible = lineP > 0;
  const tubeP = hook ? 1 : smooth(ramp(t, T.rohr - 0.1, T.rohr + 0.5));
  tubeGeo.setDrawRange(0, Math.ceil(tubeP * TSEG) * 8 * 6);
  tube.visible = tubeP > 0;
  nozzle.visible = tubeP >= 1;

  // gas beads stream while the button is on
  const flowOn = hook || (t >= T.druecken + 0.2 && t < T.auf);
  const reach = hook
    ? TRACK_L
    : lerp(LINE_L * lineP, TRACK_L, tubeP) * (tubeP > 0 ? 1 : lineP > 0 ? 1 : 0);
  for (let i = 0; i < NB; i++) {
    const s = ((i / NB + t * 0.55) % 1) * TRACK_L;
    if (!flowOn || s > reach) {
      beads.setMatrixAt(i, HIDE);
      continue;
    }
    trackAt(s, _p);
    _m.compose(_p, _q.identity(), _s.setScalar(0.022));
    beads.setMatrixAt(i, _m);
  }
  beads.instanceMatrix.needsUpdate = true;

  // bubbles from the nozzle (hook + from "Wasser") and fizz (hook + after unscrewing)
  const sNoz = hook
    ? 1
    : smooth(ramp(t, T.wasser1, T.wasser1 + 0.3)) * (1 - ramp(t, T.auf, T.auf + 0.3));
  const fizzUp = smooth(ramp(t, T.weg, T.sprudelt + 0.3));
  const sFizz = hook ? 0.55 : fizzUp * lerp(1, 0.5, smooth(ramp(t, T.sprudelt + 0.8, T.gerade)));
  const boost = 1 + 0.6 * pop(t, T.blubbern, T.hier);
  for (let i = 0; i < NN + NFZ; i++) {
    const [a, b, c, d] = bSeed[i];
    let sc = 0;
    if (i < NN) {
      const k = (t * 0.85 * boost + a) % 1;
      _p.set(
        Math.sin(t * 3 + d * 10) * 0.025 + (b - 0.5) * 0.12 * k,
        0.33 + k * (WL - 0.35),
        (c - 0.5) * 0.1 * k,
      );
      sc = sNoz * (0.025 + 0.02 * k) * (k < 0.96 ? 1 : 0);
    } else {
      const k = (t * 0.55 + a) % 1;
      _p.set((b - 0.5) * 0.46, 0.2 + k * (WL - 0.22), (c - 0.5) * 0.46);
      sc = sFizz * (0.012 + 0.012 * d) * (k < 0.97 ? 1 : 0);
    }
    if (sc <= 0.0005) bubbles.setMatrixAt(i, HIDE);
    else bubbles.setMatrixAt(i, _m.compose(_p, _q.identity(), _s.setScalar(sc)));
  }
  bubbles.instanceMatrix.needsUpdate = true;
  animateArrows(escape, t, pop(t, T.blubbern + 0.2, T.hier));
  showNope(pop(t, T.reicht, T.hier), 0, 1.75, BZ + 0.15, 0.32);

  // the trick: sealed, gas cushion pushes CO2 into the water
  M.seal.emissiveIntensity = 1.2 * pop(t, T.dicht - 0.1, T.druck2 + 0.6);
  const cushion = hook
    ? 0
    : smooth(ramp(t, T.druck2, T.druck2 + 1.5)) * (1 - smooth(ramp(t, T.auf + 0.2, T.weg + 0.3)));
  for (let i = 0; i < NH; i++) {
    const [a, b, c, d] = hSeed[i];
    const ang = a * Math.PI * 2 + t * (0.6 + d);
    const r = Math.sqrt(b) * 0.2;
    _p.set(
      Math.cos(ang) * r,
      WL + 0.05 + c * 0.32 + 0.02 * Math.sin(t * 7 + d * 9),
      Math.sin(ang) * r,
    );
    const sc = cushion * 0.016 * (i / NH < cushion ? 1 : 0);
    head.setMatrixAt(i, sc > 0.0005 ? _m.compose(_p, _q.identity(), _s.setScalar(sc)) : HIDE);
  }
  head.instanceMatrix.needsUpdate = true;
  animateArrows(pressArrows, t, pop(t, T.druck2 + 0.2, T.auf + 0.2));
  const dis = hook
    ? 0.5
    : smooth(ramp(t, T.presst, T.ventil + 0.4)) *
      lerp(1, 0.45, smooth(ramp(t, T.sprudelt - 0.3, T.schau)));
  for (let i = 0; i < ND; i++) {
    const [a, b, c, d] = dSeed[i];
    const ang = a * Math.PI * 2;
    const r = Math.sqrt(b) * 0.25;
    _p.set(
      Math.cos(ang) * r + 0.008 * Math.sin(t * 6 + d * 20),
      0.22 + c * (WL - 0.28),
      Math.sin(ang) * r + 0.008 * Math.cos(t * 5 + d * 20),
    );
    const on = i / ND < dis;
    dissolved.setMatrixAt(
      i,
      on
        ? _m.compose(_p, _q.setFromAxisAngle(_s.set(0, 1, 0), d * 6 + t), _s.setScalar(0.017))
        : HIDE,
    );
  }
  dissolved.instanceMatrix.needsUpdate = true;

  // relief valve buzzes and vents little puffs
  const buzz = hook ? 0 : pop(t, T.brummen - 0.05, T.auf, 0.1);
  valve.position.set(
    VALVE[0] + Math.sin(t * 95) * 0.008 * buzz,
    VALVE[1] + Math.sin(t * 77) * 0.006 * buzz,
    VALVE[2],
  );
  M.brass.emissiveIntensity = 0.45 * pop(t, T.ventil, T.auf);
  for (const [n, dt] of [
    [1, 0.15],
    [2, 0.75],
    [3, 1.35],
  ])
    puff("vent" + n, t, T.brummen + dt, VALVE[0] + 0.14, VALVE[1], VALVE[2], 0.22);

  // CO2 molecule set: hook (caged by pressure) and the acid beat
  const mk = pop(t, T.gas1 - 0.05, T.lass) + pop(t, T.winzig - 0.05, T.schau);
  setSet(molSet, t, mk, t < T.winzig ? T.gas1 : T.winzig);
  for (const g of mols) {
    const { base, ph } = g.userData;
    g.position.set(
      base.x + 0.03 * Math.sin(t * 4 + ph),
      base.y + 0.025 * Math.sin(t * 5.3 + ph * 2),
      base.z + 0.02 * Math.cos(t * 3.7 + ph),
    );
    g.rotation.y = ph + t * 0.8;
  }
  const lidK = t < T.lass ? smooth(ramp(t, T.druck1 - 0.1, T.druck1 + 0.2)) : 0;
  lid.visible = lidK > 0.01;
  lid.position.y = 1.17 + 0.25 * (1 - lidK);
  animateArrows(lidArrows, t, t < T.lass ? pop(t, T.druck1, T.lass) : 0);
  const acid = t >= T.winzig ? smooth(ramp(t, T.saeure - 0.15, T.saeure + 0.15)) : 0;
  acidParts.visible = acid > 0.01;
  acidParts.scale.setScalar(Math.max(0.001, acid));
  acidC.material = acid > 0.5 ? M.acid : M.carbon;
  M.acid.emissiveIntensity = 0.6 * acid;
  mols[0].scale.setScalar(1 + 0.6 * acid);

  // ice water glass: bubbles cling, thermometer drops
  const ik = pop(t, T.uebrigens - 0.05, T.cta);
  setSet(iceSet, t, ik, T.uebrigens + 0.1);
  ices.forEach((c, i) => (c.position.y = 0.9 + 0.015 * Math.sin(t * 2 + c.userData.ph + i)));
  const cold = smooth(ramp(t, T.eiskalt, T.eiskalt + 0.8));
  thermoFill.scale.y = lerp(0.9, 0.25, cold);
  thermoFill.position.y = 0.1 + 0.3 * thermoFill.scale.y;
  const many = smooth(ramp(t, T.doppelt - 0.1, T.doppelt + 0.4));
  for (let i = 0; i < NI; i++) {
    const [a, b, c] = iSeed[i];
    const k = (t * 0.5 + a) % 1;
    _p.set((b - 0.5) * 0.5, 0.25 + k * 0.6, (c - 0.5) * 0.5);
    const on = i < NI * (0.5 + 0.5 * many);
    iceBubbles.setMatrixAt(
      i,
      on && k < 0.95 ? _m.compose(_p, _q.identity(), _s.setScalar(0.016)) : HIDE,
    );
  }
  iceBubbles.instanceMatrix.needsUpdate = true;

  // LED panel: one fact at a time
  if (t >= T.gepresst && t < T.knopf) {
    showPanel(pop(t, T.gepresst, T.knopf), "IM ZYLINDER CA.", "60 bar", LED.yellow);
  } else if (t >= T.winzig && t < T.schau) {
    showPanel(pop(t, T.winzig, T.schau), "WIRD ZU SÄURE", "0,2 %", LED.red);
  } else {
    showPanel(0);
  }

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
