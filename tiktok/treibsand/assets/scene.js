// #53 "Treibsand" (Format B) — you are stuck in quicksand on a jungle
// sandbank. Frame 0: sunk to the knees, arms flailing, the sand slurping.
// Film myth: only the hat is left. Then you walk in, the firm sand turns
// liquid, you thrash and sink deeper (x-ray: grains shaken loose in water),
// the sand settles and grips like concrete (grains pack, turn grey). Rate
// mal: a gauge climbs, then a whole small car hangs from your foot in the
// x-ray. The balance scale: quicksand is twice as dense as you. You lean
// back and float, the legs come free. Payoff: upright in the x-ray, stopped
// at the hip. Übrigens: the flood comes in around the sandbank.
import {
  THREE,
  ramp,
  smooth,
  easeInOut,
  pop,
  lerp,
  clamp01,
  outBack,
  V,
  rng,
  scene,
  renderer,
  flat,
  jitter,
  M,
  xrayMaterial,
  xrayEdges,
  setXray,
  showNope,
  showPanel,
  LED,
  labels,
  puff,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { PIT_R, water } from "./set.js";
import { facet, facetMat } from "./world.js";
import { F } from "./environments.js";
import { viewfinder, gauge, readout } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS, SCALE } from "./beats.js";

highlights(HIGHLIGHTS);

const mesh = (geo, mat, x, y, z, parent = scene, shadow = true) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};

// ---------------------------------------------------------------- the quicksand pool
// a sand-filled cylinder over the pit: matte firm sand → glossy wet slurry,
// see-through in the x-ray cross-sections
const POOL_D = 3.0;
const poolMat = xrayMaterial(0xc9a66a, { flatShading: true, roughness: 0.95 });
const poolGeo = jitter(new THREE.CylinderGeometry(PIT_R, PIT_R * 0.92, POOL_D, 28, 3), 0.03, 4);
const pool = mesh(poolGeo, poolMat, 0, 0.025 - POOL_D / 2, 0, scene, false);
const poolEdges = xrayEdges(poolGeo);
poolEdges.position.copy(pool.position);
scene.add(poolEdges);
const firm = new THREE.Color(0xd6b67a);
const wet = new THREE.Color(0x9c7a48);
// ripple rings on the surface
const rippleMat = new THREE.MeshBasicMaterial({
  color: 0xf4e2b8,
  transparent: true,
  opacity: 0,
  depthWrite: false,
});
const ripples = [0, 1, 2].map(() => {
  const r = new THREE.Mesh(new THREE.TorusGeometry(1, 0.025, 4, 40), rippleMat.clone());
  r.rotation.x = Math.PI / 2;
  r.position.y = 0.04;
  r.userData.noAO = true;
  scene.add(r);
  return r;
});

// ---------------------------------------------------------------- cutaway
// x-ray windows cut the world open in front of you (global clip plane at
// z = 0.55) and show a soil wall behind the grain slab: a clean cross-section
const cutPlane = new THREE.Plane(V(0, 0, -1), 1e4);
renderer.clippingPlanes = [cutPlane];
const soil = new THREE.Group();
scene.add(soil);
{
  const wall = new THREE.Mesh(
    facet(new THREE.PlaneGeometry(26, 4.8, 26, 7), 0.1, 11),
    facetMat(flat(0x6e4a2c, { roughness: 1 })),
  );
  wall.position.set(0, -2.4, -0.6);
  soil.add(wall);
  // layers: a pale wet-sand band on top, darker clay further down
  const band = (y, h, c) => {
    const b = new THREE.Mesh(new THREE.PlaneGeometry(26, h), flat(c, { roughness: 1 }));
    b.position.set(0, y, -0.58);
    soil.add(b);
  };
  band(-0.25, 0.5, 0xb88e58);
  band(-2.9, 0.6, 0x4f3420);
  // the cut edge of the ground: a thin lip along the front
  const lip = new THREE.Mesh(new THREE.BoxGeometry(26, 0.12, 0.06), flat(0xc9a66a));
  lip.position.set(0, -0.03, 0.52);
  soil.add(lip);
}

// ---------------------------------------------------------------- sand splashes
const SPL = 26;
const splash = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(1, 0),
  flat(0xa8834e, { roughness: 0.4 }),
  SPL,
);
splash.frustumCulled = false;
splash.castShadow = true;
scene.add(splash);
const SP = Array.from({ length: SPL }, (_, i) => {
  const r = rng(300 + i);
  return { a: r() * 6.28, v: 1.2 + r() * 1.6, up: 2.2 + r() * 2.2, ph: r(), s: 0.04 + r() * 0.05 };
});

// ---------------------------------------------------------------- grains (x-ray only)
// a cross-section slab of sand grains around your legs
const GR = [];
{
  const r = rng(53);
  for (let x = -3.0; x <= 3.0; x += 0.2)
    for (let y = -2.75; y <= -0.08; y += 0.19)
      for (let z = -0.45; z <= 0.46; z += 0.22)
        GR.push({
          x: x + (r() - 0.5) * 0.08,
          y: y + (r() - 0.5) * 0.06,
          z: z + (r() - 0.5) * 0.08,
          ph: r() * 6.28,
          s: 0.065 + r() * 0.03,
        });
}
const grainMat = flat(0xffffff, { roughness: 0.6 });
const grains = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), grainMat, GR.length);
grains.frustumCulled = false;
grains.userData.noAO = true;
scene.add(grains);
const gSand = new THREE.Color(0xe7c88e);
const gGrey = new THREE.Color(0x9da3a8);
const gTmp = new THREE.Color();
// the water between the grains (shows when it is liquid)
const slabWaterMat = new THREE.MeshBasicMaterial({
  color: 0x4fb4ff,
  transparent: true,
  opacity: 0,
  depthWrite: false,
});
const slabWater = mesh(
  new THREE.BoxGeometry(6.2, 2.75, 1.0),
  slabWaterMat,
  0,
  -1.42,
  0,
  scene,
  false,
);
slabWater.userData.noAO = true;

// ---------------------------------------------------------------- you
const SKIN = 0xf1c09a;
const L1 = 0.62;
const L2 = 0.6;
const HIP = 1.27; // pelvis above the sand when standing
const person = new THREE.Group();
scene.add(person);
const shirtMat = flat(0xff5a36, { roughness: 0.7 });
const shortsMat = xrayMaterial(0x2b3a67, { flatShading: true, roughness: 0.8 });
const skinXray = xrayMaterial(SKIN, { flatShading: true, roughness: 0.7 });
const skinMat = flat(SKIN, { roughness: 0.7 });
const bootMat = flat(0x6b3f22, { roughness: 0.8 });
const xrayMats = [shortsMat, skinXray];

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
// head: wide eyes, brows, mouth, a red bandana
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
      new THREE.SphereGeometry(0.05, 8, 6),
      flat(0xffffff, { roughness: 0.3 }),
      sx * 0.085,
      0.04,
      0.2,
      head,
      false,
    );
    mesh(
      new THREE.SphereGeometry(0.03, 8, 6),
      flat(0x1c120e, { roughness: 0.2 }),
      sx * 0.085,
      0.04,
      0.24,
      head,
      false,
    );
    const b = mesh(
      new THREE.BoxGeometry(0.08, 0.018, 0.02),
      flat(0x4a2a18),
      sx * 0.085,
      0.13,
      0.21,
      head,
      false,
    );
    brows.push(b);
    const ear = mesh(new THREE.SphereGeometry(0.05, 7, 6), skinMat, sx * 0.22, 0, -0.01, head);
    ear.scale.set(0.5, 1, 0.8);
  }
  mouth.position.set(0, -0.11, 0.215);
  head.add(mouth);
  const hair = mesh(
    new THREE.SphereGeometry(0.25, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    flat(0x4a2a18),
    0,
    0.04,
    -0.01,
    head,
  );
  hair.scale.set(0.98, 0.85, 1.0);
  const band = mesh(new THREE.TorusGeometry(0.235, 0.03, 6, 20), flat(0xe8343a), 0, 0.07, 0, head);
  band.rotation.x = Math.PI / 2 - 0.15;
}
// arms
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
// legs (FK): hip → thigh → knee → shin → boot
const legs = [];
const thighGeo = new THREE.CylinderGeometry(0.16, 0.12, L1, 12, 3);
for (const sx of [-1, 1]) {
  const hip = new THREE.Group();
  hip.position.set(sx * 0.17, -0.05, 0);
  person.add(hip);
  mesh(thighGeo, skinXray, 0, -L1 / 2, 0, hip);
  const edges = xrayEdges(thighGeo);
  edges.position.set(0, -L1 / 2, 0);
  hip.add(edges);
  mesh(new THREE.CylinderGeometry(0.175, 0.17, 0.22, 12), shortsMat, 0, -0.09, 0, hip);
  const knee = new THREE.Group();
  knee.position.y = -L1;
  hip.add(knee);
  mesh(new THREE.SphereGeometry(0.12, 10, 8), skinMat, 0, 0, 0.01, knee);
  mesh(new THREE.CylinderGeometry(0.115, 0.085, L2, 10), skinMat, 0, -L2 / 2, 0, knee);
  const ankle = new THREE.Group();
  ankle.position.y = -L2;
  knee.add(ankle);
  mesh(new THREE.BoxGeometry(0.2, 0.13, 0.34), bootMat, 0, -0.04, 0.06, ankle);
  mesh(new THREE.BoxGeometry(0.21, 0.035, 0.36), flat(0x2e2a2c), 0, -0.11, 0.06, ankle);
  legs.push({ sx, hip, knee, ankle });
}
const hipPoint = new THREE.Object3D();
hipPoint.position.set(0.32, 0.02, 0.12);
person.add(hipPoint);

// ---------------------------------------------------------------- the film hat
const hat = new THREE.Group();
scene.add(hat);
{
  const hm = flat(0xb08a52, { roughness: 0.85 });
  mesh(new THREE.CylinderGeometry(0.42, 0.44, 0.04, 20), hm, 0, 0, 0, hat);
  mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.26, 16), hm, 0, 0.14, 0, hat);
  mesh(new THREE.CylinderGeometry(0.262, 0.262, 0.06, 16), flat(0x3a2414), 0, 0.05, 0, hat);
}
// bubbles rising where you went down
const bubbleMat = flat(0xd9c08a, { roughness: 0.2 });
const bubbles = [0, 1, 2, 3].map(() =>
  mesh(new THREE.SphereGeometry(0.06, 8, 6), bubbleMat, 0, 0, 0, scene, false),
);

// ---------------------------------------------------------------- the car on your foot
const carG = new THREE.Group();
scene.add(carG);
{
  const body = mesh(
    new THREE.BoxGeometry(2.2, 0.55, 1.0),
    flat(0x2f7fe0, { roughness: 0.35 }),
    0,
    0.45,
    0,
    carG,
  );
  body.castShadow = false;
  mesh(
    new THREE.BoxGeometry(1.2, 0.44, 0.92),
    flat(0xcfe6ff, { roughness: 0.2 }),
    -0.1,
    0.92,
    0,
    carG,
    false,
  );
  for (const wx of [-0.7, 0.7])
    for (const wz of [-0.5, 0.5]) {
      const w = mesh(
        new THREE.CylinderGeometry(0.24, 0.24, 0.18, 12),
        M.rubber,
        wx,
        0.22,
        wz,
        carG,
        false,
      );
      w.rotation.x = Math.PI / 2;
    }
  mesh(
    new THREE.BoxGeometry(0.12, 0.1, 0.9),
    flat(0xfff3a0, { emissive: 0xfff3a0, emissiveIntensity: 0.8 }),
    1.1,
    0.5,
    0,
    carG,
    false,
  );
}
const ropeMat = flat(0xf5d23a, { emissive: 0xffb800, emissiveIntensity: 0.4 });
const rope = mesh(new THREE.CylinderGeometry(0.025, 0.025, 1, 6), ropeMat, 0, 0, 0, scene, false);

// ---------------------------------------------------------------- the balance scale (analogy)
const SC = V(...SCALE);
const scaleG = new THREE.Group();
scaleG.position.copy(SC);
scaleG.scale.setScalar(0.65);
scene.add(scaleG);
const beam = new THREE.Group();
const pans = [];
const sandCubeP = V(0, 0, 0);
const youCubeP = V(0, 0, 0);
{
  const brass = new THREE.MeshStandardMaterial({ color: 0xd9a441, metalness: 0.7, roughness: 0.3 });
  mesh(new THREE.CylinderGeometry(0.7, 0.9, 0.25, 10), flat(0x6b4a33), 0, 0.12, 0, scaleG);
  mesh(new THREE.CylinderGeometry(0.07, 0.1, 2.0, 8), brass, 0, 1.2, 0, scaleG);
  beam.position.y = 2.2;
  scaleG.add(beam);
  mesh(new THREE.BoxGeometry(3.2, 0.08, 0.12), brass, 0, 0, 0, beam);
  mesh(new THREE.ConeGeometry(0.12, 0.25, 4), brass, 0, 0.18, 0, beam);
  for (const sx of [-1, 1]) {
    const hang = new THREE.Group();
    hang.position.x = sx * 1.5;
    beam.add(hang);
    mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.9, 4), brass, 0, -0.45, 0, hang, false);
    mesh(new THREE.CylinderGeometry(0.55, 0.45, 0.06, 16), brass, 0, -0.92, 0, hang);
    pans.push(hang);
  }
  // left: you (a skin-coloured block with the shirt band), right: quicksand
  const you = new THREE.Group();
  you.position.y = -0.62;
  pans[0].add(you);
  mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), skinMat, 0, 0, 0, you);
  mesh(new THREE.BoxGeometry(0.57, 0.18, 0.57), shirtMat, 0, 0.1, 0, you);
  you.name = "you";
  you.scale.setScalar(1.45);
  you.position.y = -0.5;
  const sand = F(
    jitter(new THREE.BoxGeometry(0.55, 0.55, 0.55, 2, 2, 2), 0.02, 7),
    flat(0xb8925a),
    0.1,
    7,
  );
  sand.position.y = -0.5;
  sand.scale.setScalar(1.45);
  sand.castShadow = true;
  pans[1].add(sand);
}

// ---------------------------------------------------------------- your pose over time
// sink = how far the pelvis is below standing height; lean = lying back
function pose(t) {
  // hook: knees deep, flailing
  if (t < T.film) return { sink: 0.8 + 0.06 * ramp(t, 0, T.film), flail: 1, x: 0 };
  // film myth: you are gone, only the hat
  if (t < T.trittst) return { gone: true };
  // walking in from the backpack onto the firm sand
  if (t < T.fluessig) {
    const u = ramp(t, T.trittst - 0.3, T.fluessig - 0.2);
    return { sink: 0, walk: t * 2.6, x: lerp(3.2, 0, easeInOut(u)), facing: -0.9 * (1 - u) };
  }
  // the ground gives way
  if (t < T.also)
    return { sink: 0.6 * outBack(ramp(t, T.fluessig, T.fluessig + 0.5)), flail: 0.5, x: 0 };
  // thrashing: deeper and deeper
  if (t < T.dann)
    return { sink: lerp(0.6, 0.98, smooth(ramp(t, T.also, T.tiefer + 0.4))), flail: 1, x: 0 };
  // gripped: stuck mid-thigh, pushing in vain
  if (t < T.aber) return { sink: 0.98, flail: 0.25, push: 1, x: 0 };
  // floating: lean back, legs come free
  if (t < T.darum) {
    const lean =
      smooth(ramp(t, T.leg - 0.2, T.leg + 1.3)) * 1.3 + 0.25 * smooth(ramp(t, T.treibst, T.leg));
    const free = smooth(ramp(t, T.beine, T.frei + 0.4));
    return {
      sink: lerp(0.98, 1.17, smooth(ramp(t, T.treibst, T.leg + 1.0))),
      lean,
      free,
      x: 0,
      calm: 1,
    };
  }
  // payoff + Übrigens: upright, stopped at the hip
  return { sink: 1.18, x: 0, calm: t < T.uebrigens ? 1 : 0, flail: t >= T.flut ? 0.6 : 0 };
}

// ---------------------------------------------------------------- camera
const applyCamera = shotCamera(
  shots.map((s) => (s.rel === "scale" ? { ...s, rel: SC } : s)),
  1,
);
const hipP = V(0, 0, 0);
const LAB = LABELS.map((l) => ({
  ...l,
  pos:
    l.pos === "hip"
      ? hipP
      : l.pos === "sandCube"
        ? sandCubeP
        : l.pos === "youCube"
          ? youCubeP
          : l.pos,
}));

const m4 = new THREE.Matrix4();
const q0 = new THREE.Quaternion();
const vv = V(0, 0, 0);
const sv = V(1, 1, 1);
const ankleW = V(0, 0, 0);

// ---------------------------------------------------------------- render
function renderAt(t) {
  const p = pose(t);
  // windows
  const xr = Math.max(
    pop(t, T.bewegung, T.strampeln, 0.25),
    pop(t, T.rate, T.aber, 0.25),
    pop(t, T.darum, T.uebrigens, 0.25),
  );
  const liquid = Math.max(
    smooth(ramp(t, T.fluessig - 0.1, T.fluessig + 0.3)) * (1 - smooth(ramp(t, T.dann, T.beton))),
    t < T.film ? 1 : 0,
    t >= T.treibst ? 0.7 : 0,
  );
  const packed = smooth(ramp(t, T.dann + 0.2, T.beton + 0.2)) * (t < T.treibst ? 1 : 0);

  // ---- you
  person.visible = !p.gone;
  if (!p.gone) {
    const lean = p.lean ?? 0;
    person.position.set(p.x, HIP - p.sink + Math.sin(lean) * 0.1, lean * 0.35);
    person.rotation.set(-lean, p.facing ?? 0, (p.flail ?? 0) * Math.sin(t * 7.3) * 0.07);
    const f = p.flail ?? 0;
    legs.forEach((leg, k) => {
      const sgn = k ? 1 : -1;
      if (p.walk != null) {
        const sw = Math.sin(p.walk * Math.PI + (k ? 0 : Math.PI));
        leg.hip.rotation.x = sw * 0.45;
        leg.knee.rotation.x = Math.max(0, -sw) * 0.7 + 0.1;
      } else if (p.free != null) {
        // floating: legs swing forward to the surface, a slow wiggle
        const wig = Math.sin(t * 3.2 + k * 2) * 0.12 * p.free;
        leg.hip.rotation.x = -0.15 - (1.15 - lean * 0.6) * p.free + wig;
        leg.knee.rotation.x = 0.25 * (1 - p.free) + 0.1;
      } else {
        leg.hip.rotation.x = f * Math.sin(t * 9 + k * Math.PI) * 0.4 - 0.05;
        leg.knee.rotation.x = 0.15 + f * (0.5 + 0.4 * Math.sin(t * 9 + k * Math.PI + 1));
      }
      leg.hip.rotation.z = sgn * 0.04;
    });
    arms.forEach(({ arm, elbow, sx }, k) => {
      if (p.calm && !f) {
        // arms out wide to spread your weight (lying back) / calm at the side
        arm.rotation.set(0.2, 0, sx * (0.5 + 0.9 * (p.free ?? 0.3)));
        elbow.rotation.x = -0.15;
      } else if (p.push) {
        // pushing down on the sand in vain
        arm.rotation.set(-0.5 + Math.sin(t * 6 + k) * 0.1, 0, sx * 0.35);
        elbow.rotation.x = -0.6;
      } else if (p.walk != null) {
        arm.rotation.set(Math.sin(p.walk * Math.PI + (k ? Math.PI : 0)) * 0.35, 0, sx * 0.1);
        elbow.rotation.x = -0.3;
      } else {
        // flailing overhead
        arm.rotation.set(
          -1.5 + Math.sin(t * 8 + k * 2.1) * 0.6 * f,
          0,
          sx * (1.6 + Math.sin(t * 6.5 + k) * 0.5 * f),
        );
        elbow.rotation.x = -0.4 - Math.max(0, Math.sin(t * 8 + k)) * 0.6 * f;
      }
    });
    const panic = p.calm ? 0 : 1;
    brows.forEach((b, k) => (b.rotation.z = (k ? 1 : -1) * 0.35 * panic));
    mouth.scale.set(1.2 - 0.3 * panic, 0.5 + 1.1 * panic, 0.6);
    head.rotation.x = p.lean ? -0.4 * Math.min(1, p.lean) + 0.5 * p.lean : 0.05;
  }
  person.updateMatrixWorld(true);
  hipPoint.getWorldPosition(hipP);

  const carK = t >= T.kleinwagen - 0.05 && t < T.aber ? 1 : 0;
  // ---- cutaway
  const cut = xr > 0.02;
  cutPlane.constant = cut ? 0.55 : 1e4;
  soil.visible = cut;
  water.visible = !cut;
  pool.visible = !cut;
  // ---- splashes while you thrash in the liquid sand
  const spK = !p.gone && !cut ? clamp01(((p.flail ?? 0) - 0.4) * 2) * liquid : 0;
  SP.forEach((s, i) => {
    const u = (t * 1.3 + s.ph) % 1;
    const d = s.v * u * 0.7;
    vv.set(
      (p.x ?? 0) + Math.cos(s.a) * (0.35 + d),
      0.05 + s.up * u - 4.9 * u * u * 0.9,
      Math.sin(s.a) * (0.35 + d) * 0.8,
    );
    const k = spK * (vv.y > 0 ? 1 : 0) * s.s * (1 - u * 0.5);
    sv.set(k, k * 0.8, k);
    m4.compose(vv, q0, sv);
    splash.setMatrixAt(i, m4);
  });
  splash.instanceMatrix.needsUpdate = true;
  // ---- pool surface
  setXray([poolMat], xr);
  setXray(xrayMats, 0);
  poolEdges.visible = xr > 0.05;
  poolMat.color.copy(firm).lerp(wet, liquid);
  poolMat.roughness = lerp(0.95, 0.62, liquid);
  const moving = !p.gone && (p.flail ?? 0) > 0.2 ? 1 : 0;
  ripples.forEach((r, i) => {
    const u = (t * 0.9 + i / 3) % 1;
    r.position.x = p.x ?? 0;
    r.scale.setScalar(0.5 + u * 2.4);
    r.material.opacity = 0.7 * (1 - u) * moving * liquid * (1 - xr);
  });

  // ---- the car hanging from your foot (x-ray)
  carG.visible = carK > 0;
  rope.visible = carK > 0;
  if (carK) {
    legs[1].ankle.getWorldPosition(ankleW);
    const sw = Math.sin((t - T.kleinwagen) * 3) * 0.12 * Math.exp(-(t - T.kleinwagen) * 0.8);
    const s = 0.48 * outBack(ramp(t, T.kleinwagen - 0.05, T.kleinwagen + 0.35));
    carG.scale.setScalar(Math.max(0.001, s));
    const cy = ankleW.y - 0.75 - 0.55;
    carG.position.set(ankleW.x + sw, cy, 0.05);
    carG.rotation.set(0, 0.25, sw * 0.6);
    const top = cy + 1.15 * s;
    rope.position.set(ankleW.x + sw * 0.5, (ankleW.y - 0.1 + top) / 2, 0.05);
    rope.scale.set(1, Math.max(0.01, ankleW.y - 0.1 - top), 1);
  }
  // ---- grains (x-ray)
  grains.visible = xr > 0.02;
  if (grains.visible) {
    const shake = smooth(ramp(t, T.bewegung, T.bewegung + 0.8)) * (1 - packed);
    const pelvisY = person.position.y;
    gTmp.copy(gSand).lerp(gGrey, packed);
    grainMat.color.copy(gTmp);
    grainMat.emissive?.setHex(0x000000);
    GR.forEach((g, i) => {
      // keep the legs free in the slab
      const legZone =
        (Math.abs(g.x - person.position.x) < 0.5 && g.y > pelvisY - 1.42) ||
        (carK &&
          Math.abs(g.x - carG.position.x) < 0.75 &&
          g.y < carG.position.y + 0.6 &&
          g.y > carG.position.y - 0.1) ||
        (carK && Math.abs(g.x - rope.position.x) < 0.12 && g.y < pelvisY - 1.2);
      const j = shake * 0.06;
      vv.set(
        g.x * (1 + 0.06 * shake - 0.04 * packed) + Math.sin(t * 17 + g.ph) * j,
        g.y + Math.cos(t * 15 + g.ph * 1.3) * j - 0.05 * packed * (g.y + 2.8) * 0.3,
        g.z + Math.sin(t * 13 + g.ph * 0.7) * j,
      );
      const s = legZone ? 0 : g.s * (1 - 0.15 * shake + 0.3 * packed) * xr;
      sv.set(s, s, s);
      m4.compose(vv, q0, sv);
      grains.setMatrixAt(i, m4);
    });
    grains.instanceMatrix.needsUpdate = true;
  }
  slabWaterMat.opacity = xr * 0.28 * Math.max(liquid, 0.2) * (1 - packed * 0.8);

  // ---- the film hat + bubbles
  const filmK = t >= T.film && t < T.trittst ? 1 : 0;
  hat.visible = filmK > 0;
  hat.position.set(0, 0.06 - 0.03 * ramp(t, T.film, T.trittst), 0);
  hat.rotation.set(Math.sin(t * 2) * 0.05, t * 0.2, Math.cos(t * 1.7) * 0.05);
  bubbles.forEach((b, i) => {
    const u = (t * 0.8 + i * 0.27) % 1;
    b.visible = filmK > 0 && u < 0.6;
    b.position.set(0.55 + i * 0.12, 0.03, 0.25 - i * 0.2);
    b.scale.setScalar(Math.sin((u / 0.6) * Math.PI) * (0.7 + i * 0.2) + 0.001);
  });

  puff("car", t, T.kleinwagen, 0.2, -1.9, 0.4, 0.8);

  // ---- the balance scale
  const scK = t >= T.aber - 0.2 && t < T.treibst + 0.2;
  scaleG.visible = scK;
  if (scK) {
    const tip = 0.32 * outBack(ramp(t, T.dicht - 0.2, T.dicht + 0.45));
    beam.rotation.z = -tip + Math.sin(t * 2.4) * 0.015;
    pans.forEach((h) => (h.rotation.z = tip - Math.sin(t * 2.4) * 0.015));
    pans[1].children[2].getWorldPosition(sandCubeP);
    pans[0].children[2].getWorldPosition(youCubeP);
  }

  // ---- the flood (Übrigens): the river rises around the sandbank
  const flood = smooth(ramp(t, T.uebrigens + 0.2, T.flut + 0.8));
  water.position.y = -0.42 + 0.9 * flood;
  pool.visible = true;

  // ---- nope on thrashing
  showNope(pop(t, T.fehler, T.bewegung, 0.2), 0.75, 1.6, 0.3, 0.45);

  // ---- HUD
  viewfinder(pop(t, T.film + 0.05, T.trittst, 0.15), { label: "KINO · MYTHOS", color: "#ffd23f" });
  readout("tiefe", pop(t, T.also + 0.1, T.bewegung, 0.2), {
    label: "Tiefe",
    value: t < T.fehler ? "Knie" : "Oberschenkel",
    x: 60,
    y: 430,
    color: "#ff4b2b",
  });
  const gk = pop(t, T.rate + 0.2, T.aber, 0.25);
  const gv =
    t < T.kleinwagen
      ? 1000 * smooth(ramp(t, T.rate + 0.4, T.kleinwagen)) * (0.6 + 0.4 * Math.abs(Math.sin(t * 3)))
      : 1000;
  gauge("kraft", gk, {
    label: "Kraft am Fuß",
    value: Math.round(gv),
    max: 1000,
    unit: "kg",
    x: 60,
    y: 430,
    color: t >= T.kleinwagen ? "#ff4b2b" : "#ffd23f",
  });

  // ---- LED facts
  if (t >= T.kleinwagen && t < T.aber)
    showPanel(pop(t, T.kleinwagen, T.aber), "KRAFT", "≈ 1 TONNE", LED.red);
  else if (t >= T.dicht && t < T.treibst)
    showPanel(pop(t, T.dicht, T.treibst), "TREIBSAND", "2× SO DICHT", LED.yellow);
  else if (t >= T.huefte && t < T.uebrigens)
    showPanel(pop(t, T.huefte, T.uebrigens), "ENDSTATION", "HÜFTE", LED.green);
  else if (t >= T.flut - 0.2) showPanel(pop(t, T.flut - 0.2, 99), "GEFAHR", "FLUT", LED.red);
  else showPanel(0);

  labels(t, LAB);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
