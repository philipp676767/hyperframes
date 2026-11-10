// Scene of #70 "Hundenase": a yellow Labrador on a foggy autumn forest path.
// Hook: the nose huge, its cobble pattern glowing like a fingerprint, the
// viewer's finger boops it → three ink nose prints → a drop runs down →
// Gassi: sniffing the leaves, air shoots out of the side slits (slowmo) →
// x-ray: scroll bones + olfactory mucosa → receptor carpet, counter to 300
// Mio, then almost all go dark ("Du hast sechs") → stereo nostrils → the
// glowing trail → wet film catches smells like tape → the lick → thermal:
// the cold nose feels the warm hand → two Olympic pools + one teaspoon.
import {
  THREE,
  V,
  ramp,
  smooth,
  pop,
  lerp,
  clamp01,
  real,
  flat,
  scene,
  rng,
  setXray,
  showPanel,
  LED,
  labels,
  squash,
  highlights,
  shotCamera,
  makeArrowSet,
  animateArrows,
  renderFrame,
  start,
  roundedBox,
} from "./world.js";
import { pathX, leafMat } from "./set.js";
import { createHand } from "./hand.js";
import { counter, viewfinder } from "./hud.js";
import { makeDog, printTexture } from "./dog.js";
import { T, shots, LABELS, HIGHLIGHTS, CELLS, POOL } from "./beats.js";

highlights(HIGHLIGHTS);
for (const s of shots) if (Array.isArray(s.rel)) s.rel = new THREE.Vector3(...s.rel);
const applyCamera = shotCamera(shots, 1.0);
const between = (t, a, b) => t >= a && t < b;

// ---------------------------------------------------------------- the dog
const dog = makeDog({ seed: 7 });
scene.add(dog.group);

function poseAt(t) {
  if (t < T.stell) return { head: 0.12, sniff: 1, wag: 0.6, ear: 0.2 };
  if (t < T.drinnen) {
    const k = ramp(t, T.stell, T.schnueffelt);
    return {
      pos: [lerp(0.25, 0, k), 0, lerp(-1.8, 0, smooth(k))],
      head: 1.25,
      turn: Math.sin(t * 1.3) * 0.12,
      walk: 1 - ramp(t, T.schnueffelt - 0.4, T.schnueffelt + 0.2),
      sniff: 1,
      wag: 0.7,
    };
  }
  if (t < T.verrueckt) return { head: 0.1, sniff: 0.25, wag: 0.4 };
  if (t < T.so) return { head: 0.1, sniff: t > T.nasenloch ? 1 : 0.3, wag: 0.4 };
  if (t < T.naesse) {
    const k = ramp(t, T.so, T.naesse);
    return {
      pos: [pathX(lerp(0, 1.3, k)) * 0.6, 0, lerp(0, 1.3, k)],
      head: 1.2,
      turn: Math.sin(k * 5) * 0.25,
      walk: 0.8,
      sniff: 1,
      wag: 0.8,
    };
  }
  if (t < T.wie) {
    const lick = between(t, T.leckt, T.leckt + 0.9) ? (t - T.leckt) / 0.9 : -1;
    return { head: 0.1, sniff: between(t, T.kalt, T.fakt) ? 0.8 : 0, lick, wag: 0.5 };
  }
  return { head: -0.06, tilt: 0.28 * smooth(ramp(t, T.wie + 0.2, T.wie + 0.8)), wag: 1, ear: 1 };
}

// label anchor points from the posed dog at each label's time
{
  const at = (id) => LABELS.find((l) => l.id === id);
  const set = (id, fn) => {
    const l = at(id);
    dog.pose(l.at + 0.3, poseAt(l.at + 0.3));
    l.pos = fn().toArray();
  };
  set("slitz", () => dog.slitWorld(1));
  set("roell", () => dog.head.localToWorld(V(0.06, 0.42, 0.85)));
  set("rsh", () => dog.head.localToWorld(V(0.0, 0.47, 0.7)));
  set("film", () => dog.nose.localToWorld(V(-0.08, 0.05, 0.1)));
}

// ---------------------------------------------------------------- the hand (boop + thermal)
const hand = createHand({ scale: 0.55, sleeve: 0x2f5d8a });
const handMats = [];
hand.group.traverse((o) => {
  if (o.isMesh && o.material && !handMats.includes(o.material)) handMats.push(o.material);
});

// ---------------------------------------------------------------- print cards
const cards = new THREE.Group();
scene.add(cards);
const cardList = [11, 23, 37].map((s, i) => {
  const g = new THREE.Group();
  const card = new THREE.Mesh(roundedBox(0.62, 0.78, 0.012, 0.03), [real.plastic(0xf7f3ea)][0]);
  g.add(card);
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(0.58, 0.725),
    new THREE.MeshStandardMaterial({ map: printTexture(s + i), roughness: 0.8 }),
  );
  face.position.z = 0.008;
  g.add(face);
  g.position.set((i - 1) * 0.5, 2.35, 3.2);
  g.scale.setScalar(0.72);
  g.rotation.y = (1 - i) * 0.12;
  cards.add(g);
  return g;
});
// "≠" signs between the cards
const neqMat = new THREE.MeshBasicMaterial({ color: 0xffd23f });
const neqs = [-0.25, 0.25].map((x) => {
  const g = new THREE.Group();
  for (const y of [0.04, -0.04]) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.02), neqMat);
    bar.position.y = y;
    g.add(bar);
  }
  const slash = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.2, 0.02), neqMat);
  slash.rotation.z = -0.5;
  g.add(slash);
  g.position.set(x, 2.35, 3.32);
  cards.add(g);
  return g;
});

// ---------------------------------------------------------------- drop
const dropMat = new THREE.MeshPhysicalMaterial({
  color: 0xe8f6ff,
  roughness: 0.02,
  transmission: 0,
  transparent: true,
  opacity: 0.55,
  clearcoat: 1,
  clearcoatRoughness: 0,
});
const drop = new THREE.Mesh(new THREE.SphereGeometry(0.022, 24, 16), dropMat);
dog.nose.add(drop);

// sheen light for the "wet" macro
const sheen = new THREE.PointLight(0xffffff, 0, 1.6, 2);
scene.add(sheen);

// ---------------------------------------------------------------- particles
const sphereGeo = new THREE.SphereGeometry(1, 10, 8);
// exhaled air: white puffs out of both side slits
const AIR_N = 90;
const airMat = new THREE.MeshBasicMaterial({
  color: 0xeaf6ff,
  transparent: true,
  opacity: 0.45,
  depthWrite: false,
});
const airInst = new THREE.InstancedMesh(sphereGeo, airMat, AIR_N);
airInst.frustumCulled = false;
scene.add(airInst);
// whirling leaves near the nose
const SW_N = 46;
const swGeo = new THREE.CircleGeometry(0.06, 7);
swGeo.scale(1, 0.62, 1);
const swInst = new THREE.InstancedMesh(swGeo, leafMat, SW_N);
swInst.frustumCulled = false;
{
  const c = new THREE.Color();
  const cols = [0xd9772b, 0xc4521f, 0xe8a63a, 0x9a3f1c];
  for (let i = 0; i < SW_N; i++) swInst.setColorAt(i, c.setHex(cols[i % 4]));
}
scene.add(swInst);
// smell molecules: glowing motes in three colours
const MOTE_N = 150;
const moteMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });
const moteInst = new THREE.InstancedMesh(sphereGeo, moteMat, MOTE_N);
moteInst.frustumCulled = false;
const MOTE_COLS = [0xb98cff, 0x7dff9a, 0xffe066];
{
  const c = new THREE.Color();
  for (let i = 0; i < MOTE_N; i++) moteInst.setColorAt(i, c.setHex(MOTE_COLS[i % 3]));
}
scene.add(moteInst);
const R = rng(707);
const P = Array.from({ length: Math.max(AIR_N, SW_N, MOTE_N) }, () => [R(), R(), R(), R(), R()]);
const m4 = new THREE.Matrix4();
const q4 = new THREE.Quaternion();
const e4 = new THREE.Euler();
const v1 = new THREE.Vector3();
const v2 = new THREE.Vector3();
const v3 = new THREE.Vector3();
const sc = new THREE.Vector3();
const hide = (inst, i) => {
  m4.makeScale(0, 0, 0);
  inst.setMatrixAt(i, m4);
};

function airAt(t, k) {
  for (let i = 0; i < AIR_N; i++) {
    if (k <= 0) {
      hide(airInst, i);
      continue;
    }
    const [a, b, c] = P[i];
    const sx = i % 2 ? 1 : -1;
    const f = (a + t * 1.6) % 1;
    dog.slitWorld(sx, v1);
    // out sideways, back and down
    v2.set(sx * 0.9, -0.45, -0.35).normalize();
    v1.addScaledVector(v2, f * 0.55);
    v1.x += (b - 0.5) * f * 0.25;
    v1.y += (c - 0.5) * f * 0.2;
    const s = (0.012 + f * 0.05) * k * (1 - f * 0.6);
    m4.compose(v1, q4.identity(), sc.set(s, s, s));
    airInst.setMatrixAt(i, m4);
  }
  airInst.instanceMatrix.needsUpdate = true;
}

function swirlAt(t, k) {
  dog.noseWorld(v3);
  for (let i = 0; i < SW_N; i++) {
    if (k <= 0) {
      hide(swInst, i);
      continue;
    }
    const [a, b, c, d] = P[i];
    const sx = i % 2 ? 1 : -1;
    const f = (a + t * 0.55) % 1;
    const ang = f * 7 + b * 6;
    const r = 0.18 + f * 0.45;
    v1.set(
      v3.x + sx * (0.25 + Math.cos(ang) * r),
      0.03 + Math.sin(f * Math.PI) * (0.35 + c * 0.4),
      v3.z - 0.15 + Math.sin(ang) * r * 0.8,
    );
    e4.set(t * 4 + d * 6, t * 3 + a * 6, t * 5);
    q4.setFromEuler(e4);
    const s = k * (0.8 + d * 0.6);
    m4.compose(v1, q4, sc.set(s, s, s));
    swInst.setMatrixAt(i, m4);
  }
  swInst.instanceMatrix.needsUpdate = true;
}

// mode: "in" (pulled into both nostrils), "stereo" (left blue / right orange),
// "stick" (fly at the nose and stay on the wet film)
function motesAt(t, k, mode, t0 = 0) {
  const c = new THREE.Color();
  for (let i = 0; i < MOTE_N; i++) {
    if (k <= 0) {
      hide(moteInst, i);
      continue;
    }
    const [a, b, cc, d, e] = P[i];
    const sx = i % 2 ? 1 : -1;
    let s = 0.012 * k;
    if (mode === "in" || mode === "stereo") {
      const f = (a + t * 0.45) % 1;
      dog.nostrilWorld(sx, v2);
      const spread = mode === "stereo" ? 1.0 : 0.5;
      v1.set(
        v2.x + sx * (0.25 + b * 0.7) * spread,
        v2.y - 0.15 + (cc - 0.4) * 0.6,
        v2.z + 0.35 + d * 0.9,
      );
      const ef = f * f;
      v1.lerp(v2, ef);
      v1.x += Math.sin(f * 9 + e * 6) * 0.04 * (1 - f);
      v1.y += Math.cos(f * 7 + e * 6) * 0.04 * (1 - f);
      s *= 1 - ef * 0.7;
      if (mode === "stereo") c.setHex(sx < 0 ? 0x4fc3ff : 0xffa83a);
      else c.setHex(MOTE_COLS[i % 3]);
    } else {
      // stick: fly in once (staggered), then stay on the surface
      const f = smooth(clamp01((t - t0 - a * 1.4) / 0.5));
      // target: a point on the front of the nose
      const th = (b - 0.5) * 1.6;
      const ph = (cc - 0.5) * 1.0;
      dog.nose.localToWorld(
        v2.set(Math.sin(th) * 0.19, Math.sin(ph) * 0.13, Math.cos(th) * Math.cos(ph) * 0.105),
      );
      v1.set(v2.x + (b - 0.5) * 1.6, v2.y + (cc - 0.5) * 1.0, v2.z + 0.6 + d * 0.6);
      v1.lerp(v2, f);
      if (f <= 0) s = 0;
      c.setHex(MOTE_COLS[i % 3]);
    }
    moteInst.setColorAt(i, c);
    m4.compose(v1, q4.identity(), sc.set(s, s, s));
    moteInst.setMatrixAt(i, m4);
  }
  moteInst.instanceMatrix.needsUpdate = true;
  if (moteInst.instanceColor) moteInst.instanceColor.needsUpdate = true;
}

// ---------------------------------------------------------------- the trail
const TRAIL_N = 46;
const trailMat = new THREE.MeshBasicMaterial({ color: 0xffd23f, transparent: true, opacity: 0.9 });
const trail = new THREE.InstancedMesh(sphereGeo, trailMat, TRAIL_N);
trail.frustumCulled = false;
scene.add(trail);
const trailPts = Array.from({ length: TRAIL_N }, (_, i) => {
  const z = 0.9 + i * 0.32;
  const x = pathX(z) * 0.6 + Math.sin(i * 0.9) * 0.35;
  return V(x, 0.06, z);
});
function trailAt(t, k) {
  for (let i = 0; i < TRAIL_N; i++) {
    const on = k * clamp01((t - T.so - i * 0.03) / 0.25);
    const pulse = 1 + 0.35 * Math.sin(t * 6 - i * 0.6);
    const s = 0.07 * on * pulse;
    m4.compose(trailPts[i], q4.identity(), sc.set(s, s * 0.5, s));
    trail.setMatrixAt(i, m4);
  }
  trail.instanceMatrix.needsUpdate = true;
}

// ---------------------------------------------------------------- receptor carpet (cells set)
const cellsSet = new THREE.Group();
cellsSet.position.set(...CELLS);
scene.add(cellsSet);
const membraneGeo = new THREE.PlaneGeometry(7, 7, 120, 120);
membraneGeo.rotateX(-Math.PI / 2);
const wave = (x, z) => Math.sin(x * 2.1) * 0.12 + Math.cos(z * 1.7 + x * 0.6) * 0.1;
{
  const p = membraneGeo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setY(i, wave(p.getX(i), p.getZ(i)));
  membraneGeo.computeVertexNormals();
}
const membrane = new THREE.Mesh(
  membraneGeo,
  real.skin(0xe98a9a, { roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.15 }),
);
membrane.receiveShadow = true;
cellsSet.add(membrane);
const CELL_N = 3000;
const cellMat = new THREE.MeshBasicMaterial({ color: 0xffe066 });
const cellInst = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), cellMat, CELL_N);
{
  const r = rng(300);
  for (let i = 0; i < CELL_N; i++) {
    const x = (r() - 0.5) * 6.6;
    const z = (r() - 0.5) * 6.6;
    m4.compose(V(x, wave(x, z) + 0.012, z), q4.identity(), sc.set(0.022, 0.022, 0.022));
    cellInst.setMatrixAt(i, m4);
  }
}
cellsSet.add(cellInst);
const cellLight = new THREE.PointLight(0xffd9b0, 6, 8, 1.6);
cellLight.position.set(0.5, 2.5, 1.5);
cellsSet.add(cellLight);

// ---------------------------------------------------------------- pools set
const poolSet = new THREE.Group();
poolSet.position.set(...POOL);
scene.add(poolSet);
const waterMat = real.gloss(0x2a9fd8, {
  roughness: 0.08,
  clearcoat: 1,
  transparent: true,
  opacity: 0.92,
});
for (const px of [-1.35, 1.35]) {
  const deck = new THREE.Mesh(roundedBox(2.4, 0.16, 5.0, 0.04), real.ceramic(0xf2efe8));
  deck.position.set(px, 0.08, 0);
  deck.receiveShadow = true;
  poolSet.add(deck);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 4.6), waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.set(px, 0.17, 0);
  poolSet.add(water);
  for (let l = 1; l < 8; l++) {
    const lane = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.005, 4.4), flat(0x0f5f8f));
    lane.position.set(px - 1.05 + l * 0.2625, 0.175, 0);
    poolSet.add(lane);
    const rope = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 4.5, 6),
      flat(l % 2 ? 0xe23b3b : 0xffffff),
    );
    rope.rotation.x = Math.PI / 2;
    rope.position.set(px - 1.05 + l * 0.2625 - 0.13, 0.19, 0);
    if (l < 7) poolSet.add(rope);
  }
}
// the teaspoon
const spoon = new THREE.Group();
{
  const metal = real.metal(0xd9dde3, { roughness: 0.18 });
  const bowl = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    metal,
  );
  bowl.scale.set(0.8, 0.4, 1.1);
  spoon.add(bowl);
  const handle = new THREE.Mesh(roundedBox(0.04, 0.012, 0.5, 0.005), metal);
  handle.position.set(0, 0.03, -0.32);
  handle.rotation.x = -0.12;
  spoon.add(handle);
  const sugar = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 16, 10),
    real.plastic(0xffffff, { roughness: 0.9 }),
  );
  sugar.scale.set(1, 0.4, 1.3);
  sugar.position.y = 0.0;
  sugar.name = "sugar";
  spoon.add(sugar);
}
poolSet.add(spoon);
const SUG_N = 60;
const sugInst = new THREE.InstancedMesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0xffffff }),
  SUG_N,
);
sugInst.frustumCulled = false;
poolSet.add(sugInst);
const ripple = new THREE.Mesh(
  new THREE.RingGeometry(0.9, 1, 48),
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
  }),
);
ripple.rotation.x = -Math.PI / 2;
ripple.position.set(-1.35, 0.18, 0);
poolSet.add(ripple);

// ---------------------------------------------------------------- heat arrows (thermal)
const heat = makeArrowSet(
  [
    [V(0.55, 1.72, 2.75), V(0.12, 1.74, 2.28)],
    [V(0.58, 1.6, 2.7), V(0.15, 1.66, 2.26)],
    [V(0.52, 1.84, 2.72), V(0.1, 1.8, 2.27)],
  ],
  { amp: 0.04 },
);

// ---------------------------------------------------------------- render
const COLD = new THREE.Color(0x4fc3ff);
const GOLD = new THREE.Color(0xffd23f);
function renderAt(t) {
  dog.pose(t, poseAt(t));

  // ---- the hand: boop at frame 0, warm hand near the nose for the thermal shot
  hand.track(t, [
    { t: -0.6, pos: [0.9, 1.95, 3.0], rot: [0.1, -2.4, 0.2], pose: "point" },
    { t: 0, pos: [0.65, 1.86, 2.7], rot: [0.1, -2.45, 0.2], pose: "point" },
    { t: 0.42, pos: [0.42, 1.78, 2.5], rot: [0.12, -2.5, 0.2], pose: "point" },
    { t: 0.62, pos: [0.47, 1.8, 2.55], rot: [0.12, -2.5, 0.2], pose: "point" },
    { t: T.ist, pos: [1.2, 2.1, 3.2], rot: [0.1, -2.4, 0.2], pose: "open", out: true },
    { t: T.kalt - 0.3, pos: [1.4, 1.75, 3.6], rot: [0.1, -2.3, 0], pose: "open" },
    { t: T.kalt + 0.5, pos: [0.8, 1.72, 3.0], rot: [0.1, -2.3, 0], pose: "open" },
    { t: T.fakt, pos: [0.72, 1.72, 2.92], rot: [0.1, -2.3, 0], pose: "open", out: true },
  ]);
  // boop squish
  const boop = Math.max(0, Math.sin(clamp01((t - 0.36) / 0.3) * Math.PI));
  dog.nose.scale.set(0.88 * (1 + boop * 0.05), 0.88 * (1 - boop * 0.03), 0.88 * (1 - boop * 0.12));

  // ---- fingerprint glow (on from frame 0, big on "Fingerabdruck")
  const glow =
    t < T.aber ? 0.55 + 0.35 * Math.sin(t * 7) * 0.5 + 1.4 * pop(t, T.finger, T.aber, 0.2) : 0;
  const thermal = pop(t, T.kalt, T.fakt, 0.25);
  dog.noseMat.emissive.copy(thermal > 0 ? COLD : GOLD);
  dog.noseMat.emissiveIntensity = Math.max(glow, thermal * 1.6);

  // ---- print cards
  const cardK = pop(t, T.jedes, T.aber, 0.25);
  cards.visible = cardK > 0;
  cardList.forEach((g, i) => {
    g.scale.copy(squash(t, T.muster + 0.05 + i * 0.12, 0.6)).multiplyScalar(cardK * 0.72);
    g.rotation.z = Math.sin(t * 1.5 + i) * 0.03;
  });
  neqs.forEach((g, i) => g.scale.setScalar(pop(t, T.muster + 0.5 + i * 0.12, T.aber, 0.2)));

  // ---- the drop runs down
  const dk = ramp(t, T.aber + 0.2, T.stell - 0.2);
  drop.visible = between(t, T.aber, T.stell);
  drop.position.set(-0.13 + dk * 0.02, 0.07 - smooth(dk) * 0.17, 0.08);
  drop.scale.set(1, 1 + dk * 0.4, 1);

  // ---- sniff: exhale + whirling leaves + smells pulled in
  const sniffK = pop(t, T.denn, T.drinnen, 0.3);
  airAt(t, sniffK);
  swirlAt(t, pop(t, T.seitlich, T.drinnen, 0.3) + pop(t, T.schnueffelt, T.denn, 0.3) * 0.5);
  if (between(t, T.gerueche - 0.3, T.drinnen))
    motesAt(t, pop(t, T.gerueche - 0.3, T.drinnen), "in");
  else if (between(t, T.nasenloch, T.so)) motesAt(t, pop(t, T.nasenloch, T.so), "stereo");
  else if (between(t, T.schleimfilm, T.leckt + 0.4))
    motesAt(t, pop(t, T.schleimfilm, T.leckt + 0.4), "stick", T.schleimfilm);
  else motesAt(t, 0);
  // nostril colours for the stereo beat
  const st = pop(t, T.nasenloch, T.so, 0.25);
  dog.nostrilGlow.forEach((m) => (m.opacity = st * 0.85));

  // ---- x-ray: inside the muzzle
  const xr = smooth(ramp(t, T.drinnen - 0.1, T.drinnen + 0.5)) * (1 - ramp(t, T.bis - 0.1, T.bis));
  setXray(dog.shellMats, xr);
  dog.inside.visible = xr > 0.01;
  dog.turbMat.emissiveIntensity = 0.3 + 1.4 * pop(t, T.schleimhaut, T.bis, 0.3);
  dog.bulbMat.emissiveIntensity = 2 * pop(t, T.rate, T.bis, 0.3);

  // ---- receptor carpet: lights up, then almost all go dark
  const lit = between(t, T.bis, T.verrueckt)
    ? t < T.hast
      ? smooth(ramp(t, T.bis, T.mio + 0.9))
      : lerp(1, 6 / 300, smooth(ramp(t, T.sechs - 0.1, T.sechs + 0.4)))
    : 0;
  cellInst.count = Math.max(1, Math.round(CELL_N * lit));
  cellsSet.visible = between(t, T.bis, T.verrueckt);

  // ---- trail
  trail.visible = between(t, T.so, T.naesse);
  if (trail.visible) trailAt(t, pop(t, T.so, T.naesse, 0.2));

  // ---- wet sheen sweep
  sheen.intensity = 3 * pop(t, T.naesse, T.leckt, 0.2);
  if (sheen.intensity > 0) {
    dog.noseWorld(v1);
    const k = ramp(t, T.naesse, T.klebeband);
    sheen.position.set(v1.x - 0.5 + k * 1.0, v1.y + 0.35, v1.z + 0.35);
  }

  // ---- thermal: warm hand, heat arrows
  for (const m of handMats) {
    if (!m.emissive) continue;
    m.emissive.setHex(0xff5a1f);
    m.emissiveIntensity = thermal * 0.9;
  }
  animateArrows(heat, t, thermal * ramp(t, T.kalt + 0.4, T.kalt + 0.8));
  viewfinder(thermal, { label: "WÄRMEBILD", time: "NASE 21°C", color: "#ff7a2f" });

  // ---- pools + teaspoon
  poolSet.visible = t >= T.fakt - 0.1 && t < T.wie;
  if (poolSet.visible) {
    const tip = smooth(ramp(t, T.teeloeffel, T.teeloeffel + 0.5));
    spoon.position.set(-1.35, 1.6 - tip * 0.4, 0.2);
    spoon.rotation.set(0, 0.4, tip * 1.2);
    spoon.getObjectByName("sugar").visible = tip < 0.6;
    for (let i = 0; i < SUG_N; i++) {
      const [a, b, c] = P[i];
      const f = clamp01((t - T.teeloeffel - 0.35 - a * 0.4) / 0.55);
      if (f <= 0 || f >= 1) {
        hide(sugInst, i);
        continue;
      }
      v1.set(-1.35 + (b - 0.5) * 0.12, 1.25 - f * f * 1.1, 0.2 + (c - 0.5) * 0.12);
      const s = 0.012 + c * 0.01;
      e4.set(t * 5 + a * 6, t * 4, 0);
      q4.setFromEuler(e4);
      m4.compose(v1, q4, sc.set(s, s, s));
      sugInst.setMatrixAt(i, m4);
    }
    sugInst.instanceMatrix.needsUpdate = true;
    const rk = ramp(t, T.zucker, T.becken + 0.6);
    ripple.scale.setScalar(0.05 + rk * 1.1);
    ripple.material.opacity = 0.7 * (1 - rk) * (rk > 0 ? 1 : 0);
  }

  // ---- panels / counters (one at a time)
  if (between(t, T.rate, T.bis)) showPanel(pop(t, T.rate, T.bis), "RIECHZELLEN", "?", LED.yellow);
  else if (between(t, T.hast, T.verrueckt))
    showPanel(pop(t, T.hast, T.verrueckt), "DU", "6 MIO", LED.blue);
  else if (between(t, T.teeloeffel, T.wie))
    showPanel(pop(t, T.teeloeffel, T.wie), "2 BECKEN", "5 MIO LITER", LED.yellow);
  else showPanel(0);
  const cnt = pop(t, T.bis, T.hast, 0.2);
  counter("rz", cnt, {
    label: "RIECHZELLEN · MILLIONEN",
    value: Math.round(300 * smooth(ramp(t, T.bis, T.mio + 0.5))),
    x: 80,
    y: 430,
    color: "#ffd23f",
  });

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
