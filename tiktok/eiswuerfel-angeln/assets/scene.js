// #96 Eiswürfel angeln — a red thread, a pinch of salt, and the ice cube hangs.
// Scale: 1 unit ≈ 5 cm. Glass at the origin on the hut table (top y = 0),
// cola surface y = 2.3, cube centre y ≈ 2.44 (top ≈ 2.8).
import {
  THREE,
  ramp,
  smooth,
  clamp01,
  lerp,
  pop,
  V,
  scene,
  real,
  roundedBox,
  rng,
  showNope,
  makeArrowSet,
  animateArrows,
  showPanel,
  LED,
  labels,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import "./set.js";
import { createHand } from "./hand.js";
import { T, shots, LABELS, HIGHLIGHTS, LIFTS } from "./beats.js";

highlights(HIGHLIGHTS);
const R = rng(9601);
const easeOut = (x) => 1 - Math.pow(1 - clamp01(x), 3);
const inWin = (t, a, b) => t >= a && t < b;

// ---------------------------------------------------------------- the glass of cola
const COLA_Y = 2.3;
const glassGrp = new THREE.Group();
scene.add(glassGrp);
{
  // tumbler wall (lathe), slightly flared, thick base
  const prof = [];
  for (let i = 0; i <= 12; i++)
    prof.push(new THREE.Vector2(0.86 + (i / 12) * 0.1, 0.0 + (i / 12) * 3.1));
  const wall = new THREE.Mesh(
    new THREE.LatheGeometry(prof, 96),
    real.glass(0xe8f4fa, { side: THREE.DoubleSide, opacity: 0.22 }),
  );
  wall.userData.noAO = true;
  glassGrp.add(wall);
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.96, 0.025, 10, 96),
    real.glass(0xffffff, { opacity: 0.55 }),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 3.1;
  glassGrp.add(rim);
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.86, 0.86, 0.26, 96),
    real.glass(0xd8eef6, { opacity: 0.5 }),
  );
  base.position.y = 0.13;
  glassGrp.add(base);
  // cola: deep red-brown, glossy
  const colaMat = new THREE.MeshPhysicalMaterial({
    color: 0x3a1305,
    roughness: 0.08,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    transparent: true,
    opacity: 0.93,
    emissive: 0x3a0e02,
    emissiveIntensity: 0.25,
  });
  const cola = new THREE.Mesh(new THREE.CylinderGeometry(0.935, 0.85, COLA_Y - 0.27, 96), colaMat);
  cola.position.y = 0.27 + (COLA_Y - 0.27) / 2;
  glassGrp.add(cola);
  // coaster (Bierdeckel)
  const coaster = new THREE.Mesh(
    new THREE.CylinderGeometry(1.55, 1.55, 0.06, 96),
    real.plastic(0xf3ede2, { roughness: 0.85, clearcoat: 0 }),
  );
  coaster.position.y = 0.03;
  coaster.receiveShadow = true;
  scene.add(coaster);
  const print = new THREE.Mesh(
    new THREE.RingGeometry(1.1, 1.38, 96),
    real.plastic(0xc8322a, { roughness: 0.8 }),
  );
  print.rotation.x = -Math.PI / 2;
  print.position.y = 0.065;
  scene.add(print);
  // condensation droplets on the outside, below the cola line
  const dropMat = real.glass(0xffffff, { opacity: 0.6, roughness: 0.02 });
  const n = 170;
  const im = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), dropMat, n);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < n; i++) {
    const a = R() * Math.PI * 2;
    const y = 0.35 + R() * 1.9;
    const rr = 0.86 + (y / 3.1) * 0.1 + 0.012;
    const s = 0.012 + R() * R() * 0.035;
    m4.compose(
      V(Math.cos(a) * rr, y, Math.sin(a) * rr),
      new THREE.Quaternion(),
      V(s * 0.8, s, s * 0.5),
    );
    // face outwards
    const q = new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), V(Math.cos(a), 0, Math.sin(a)));
    m4.compose(V(Math.cos(a) * rr, y, Math.sin(a) * rr), q, V(s * 0.8, s, s * 0.5));
    im.setMatrixAt(i, m4);
  }
  im.userData.noAO = true;
  glassGrp.add(im);
}
glassGrp.traverse((o) => o.isMesh && (o.castShadow = true));

// fizz: tiny bubbles popping on the cola surface
const fizz = new THREE.InstancedMesh(
  new THREE.SphereGeometry(1, 10, 8),
  real.glass(0xffe8d0, { opacity: 0.7 }),
  46,
);
fizz.userData.noAO = true;
scene.add(fizz);
const fizzSeeds = Array.from({ length: 46 }, () => [
  R() * Math.PI * 2,
  0.45 + R() * 0.45,
  R(),
  0.6 + R(),
]);

// ---------------------------------------------------------------- the ice cube
const cube = new THREE.Group();
scene.add(cube);
const iceMat = new THREE.MeshPhysicalMaterial({
  color: 0xe4f5ff,
  roughness: 0.06,
  clearcoat: 1,
  clearcoatRoughness: 0.04,
  transparent: true,
  opacity: 0.66,
  envMapIntensity: 1.7,
  emissive: 0x2f9bff,
  emissiveIntensity: 0.06,
});
{
  const shell = new THREE.Mesh(roundedBox(0.72, 0.72, 0.72, 0.1, 5), iceMat);
  shell.castShadow = true;
  cube.add(shell);
  // cloudy core + trapped air bubbles: what real ice looks like inside
  const core = new THREE.Mesh(
    roundedBox(0.36, 0.4, 0.34, 0.12, 4),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.5,
      transparent: true,
      opacity: 0.45,
    }),
  );
  core.position.y = -0.04;
  cube.add(core);
  const bub = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.2,
    transparent: true,
    opacity: 0.7,
  });
  for (let i = 0; i < 9; i++) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.012 + R() * 0.02, 10, 8), bub);
    b.position.set((R() - 0.5) * 0.45, (R() - 0.5) * 0.45, (R() - 0.5) * 0.45);
    cube.add(b);
  }
}
const TOP = 0.36;

// thread frozen across the top + its tail (child of the cube)
const threadMat = real.fabric(0xd5302a);
const tailCurve = new THREE.CatmullRomCurve3([
  V(-0.42, TOP + 0.025, -0.02),
  V(-0.2, TOP + 0.03, 0),
  V(0.2, TOP + 0.03, 0.01),
  V(0.39, TOP + 0.02, 0.02),
  V(0.43, TOP - 0.12, 0.04),
  V(0.44, TOP - 0.42, 0.07),
]);
const cubeThread = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 60, 0.022, 8), threadMat);
cubeThread.castShadow = true;
cube.add(cubeThread);

// the thin water layer under the thread (melts, then refreezes)
const layerMat = new THREE.MeshPhysicalMaterial({
  color: 0x5bb8ff,
  roughness: 0.04,
  clearcoat: 1,
  transparent: true,
  opacity: 0.85,
  emissive: 0x1f7bff,
  emissiveIntensity: 0.5,
});
const layer = new THREE.Mesh(roundedBox(0.7, 0.035, 0.22, 0.015, 3), layerMat);
layer.position.y = TOP + 0.012;
layer.userData.noAO = true;
cube.add(layer);
const cWater = new THREE.Color(0x5bb8ff);
const cIce = new THREE.Color(0xf4fbff);

// salt grains on the top (fall from the shaker, later dissolve)
const NS = 48;
const salt = new THREE.InstancedMesh(
  roundedBox(1, 1, 1, 0.15, 1),
  real.plastic(0xffffff, { roughness: 0.35, clearcoat: 0.6 }),
  NS,
);
salt.userData.noAO = true;
cube.add(salt);
const saltSpots = Array.from({ length: NS }, (_v, i) => ({
  p: V((R() - 0.5) * 0.62, TOP + 0.018, (R() - 0.5) * 0.3),
  rot: new THREE.Euler(R() * 3, R() * 3, R() * 3),
  s: 0.024 + R() * 0.014,
  d: (i / NS) * 0.55,
}));

// ice crystals growing along the thread when the layer refreezes
const NC = 70;
const crystals = new THREE.InstancedMesh(
  new THREE.ConeGeometry(0.01, 0.07, 6),
  new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.1,
    clearcoat: 1,
    emissive: 0xbfe6ff,
    emissiveIntensity: 0.35,
    transparent: true,
    opacity: 0.92,
  }),
  NC,
);
crystals.userData.noAO = true;
cube.add(crystals);
const crys = Array.from({ length: NC }, () => ({
  p: V((R() - 0.5) * 0.7, TOP + 0.02, (R() - 0.5) * 0.2),
  q: new THREE.Quaternion().setFromEuler(
    new THREE.Euler((R() - 0.5) * 2.4, R() * 6, (R() - 0.5) * 2.4),
  ),
  s: 0.6 + R() * 0.9,
  d: R() * 0.6,
}));

// heat leaves the cube's own inside and goes into the layer
const heatUp = makeArrowSet(
  [
    [V(-0.22, -0.18, 0.05), V(-0.22, TOP - 0.02, 0.05)],
    [V(0.0, -0.22, 0.12), V(0.0, TOP - 0.02, 0.12)],
    [V(0.22, -0.18, 0.05), V(0.22, TOP - 0.02, 0.05)],
  ],
  { parent: cube, r: 0.028, amp: 0.04 },
);

// ---------------------------------------------------------------- live thread (hand → cube)
const live = new THREE.Mesh(new THREE.BufferGeometry(), threadMat);
live.castShadow = true;
scene.add(live);
function setLive(a, b, sag = 0.04) {
  live.geometry.dispose();
  const mid = a
    .clone()
    .lerp(b, 0.5)
    .add(V(0.03, -sag, 0.02));
  live.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a, mid, b]), 40, 0.022, 8);
  live.visible = true;
}

// ---------------------------------------------------------------- salt shaker
const shaker = new THREE.Group();
shaker.scale.setScalar(0.8);
scene.add(shaker);
{
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.46, 1.5, 64),
    real.glass(0xeef6fa, { opacity: 0.32 }),
  );
  body.position.y = 0.75;
  shaker.add(body);
  const fill = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.42, 0.95, 48),
    real.plastic(0xf6f6f2, { roughness: 0.7 }),
  );
  fill.position.y = 0.52;
  shaker.add(fill);
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.43, 0.42, 64),
    real.metal(0xd7dce2, { roughness: 0.22 }),
  );
  cap.position.y = 1.7;
  shaker.add(cap);
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    real.metal(0xd7dce2, { roughness: 0.22 }),
  );
  dome.scale.y = 0.35;
  dome.position.y = 1.91;
  shaker.add(dome);
  const holeMat = real.rubber(0x1a1a1e);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const h = new THREE.Mesh(new THREE.CircleGeometry(0.035, 12), holeMat);
    const rr = i === 0 ? 0 : 0.2;
    h.position.set(Math.cos(a) * rr, 2.05, Math.sin(a) * rr);
    h.rotation.x = -Math.PI / 2;
    shaker.add(h);
  }
  shaker.traverse((o) => o.isMesh && (o.castShadow = true));
}
const SHAKER_REST = { p: V(-2.4, 0, -0.7), r: [0, 0, 0] };
const SHAKER_POUR = { p: V(-1.15, 4.9, -0.25), r: [0, 0, -2.45] };
// grains in the air between the spout and the cube
const NF = 40;
const fallSalt = new THREE.InstancedMesh(
  roundedBox(1, 1, 1, 0.15, 1),
  real.plastic(0xffffff, { roughness: 0.35 }),
  NF,
);
fallSalt.userData.noAO = true;
scene.add(fallSalt);

// ---------------------------------------------------------------- table props
{
  // spool of the red thread
  const spool = new THREE.Group();
  const wood = real.wood(0xc9a374, { roughness: 0.55 });
  for (const y of [0.04, 0.86]) {
    const f = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.08, 48), wood);
    f.position.y = y;
    spool.add(f);
  }
  const wrap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.33, 0.33, 0.74, 48),
    real.fabric(0xd5302a),
  );
  wrap.position.y = 0.45;
  spool.add(wrap);
  spool.position.set(-2.3, 0, 1.4);
  spool.traverse((o) => o.isMesh && (o.castShadow = true));
  scene.add(spool);
  // loose thread end from the spool across the table
  const c = new THREE.CatmullRomCurve3([
    V(-2.0, 0.5, 1.5),
    V(-1.7, 0.03, 1.8),
    V(-1.2, 0.03, 2.3),
    V(-0.6, 0.03, 2.2),
  ]);
  const end = new THREE.Mesh(new THREE.TubeGeometry(c, 30, 0.022, 6), real.fabric(0xd5302a));
  scene.add(end);

  // beer mug in the back
  const mug = new THREE.Group();
  const mugGlass = new THREE.Mesh(
    new THREE.CylinderGeometry(1.15, 1.1, 3.6, 64, 1, true),
    real.glass(0xf6eed8, { side: THREE.DoubleSide, opacity: 0.3 }),
  );
  mugGlass.position.y = 1.8;
  mug.add(mugGlass);
  const beer = new THREE.Mesh(
    new THREE.CylinderGeometry(1.08, 1.04, 2.9, 64),
    new THREE.MeshPhysicalMaterial({
      color: 0xe8a028,
      roughness: 0.1,
      transparent: true,
      opacity: 0.85,
      emissive: 0x7a4400,
      emissiveIntensity: 0.25,
    }),
  );
  beer.position.y = 1.55;
  mug.add(beer);
  const foam = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 1.08, 0.55, 64),
    real.plastic(0xfffaf0, { roughness: 0.9, clearcoat: 0 }),
  );
  foam.position.y = 3.25;
  mug.add(foam);
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.7, 0.14, 12, 32, Math.PI),
    real.glass(0xf6eed8, { opacity: 0.4 }),
  );
  handle.rotation.z = -Math.PI / 2;
  handle.position.set(1.15, 1.9, 0);
  mug.add(handle);
  mug.position.set(-3.9, 0, -3.6);
  mug.traverse((o) => o.isMesh && (o.castShadow = true));
  scene.add(mug);

  // ski goggles lying on the table (orange mirror lens)
  const gog = new THREE.Group();
  const frame = new THREE.Mesh(roundedBox(1.9, 0.85, 0.35, 0.3, 4), real.plastic(0x222428));
  gog.add(frame);
  const lens = new THREE.Mesh(
    roundedBox(1.75, 0.72, 0.1, 0.28, 4),
    real.gloss(0xff8a2a, { metalness: 0.6, roughness: 0.08 }),
  );
  lens.position.z = 0.17;
  gog.add(lens);
  const strap = new THREE.Mesh(
    new THREE.TorusGeometry(1.25, 0.09, 8, 48, Math.PI),
    real.fabric(0x2a62c8),
  );
  strap.rotation.x = Math.PI / 2;
  strap.position.z = -0.1;
  strap.scale.set(1, 1.6, 1);
  gog.add(strap);
  gog.rotation.x = -Math.PI / 2 + 0.25;
  gog.rotation.z = 0.5;
  gog.position.set(4.1, 0.3, 1.7);
  gog.traverse((o) => o.isMesh && (o.castShadow = true));
  scene.add(gog);
}

// ---------------------------------------------------------------- "Übrigens": the ice bowl with salt frosts over
const BOWL = V(2.9, 0, -1.9);
const frostMat = new THREE.MeshPhysicalMaterial({
  color: 0xf6fbff,
  roughness: 0.75,
  transparent: true,
  opacity: 0,
  emissive: 0xcfe8ff,
  emissiveIntensity: 0.15,
  depthWrite: false,
});
const frostFlakes = new THREE.InstancedMesh(
  new THREE.CircleGeometry(1, 6),
  new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.3,
    emissive: 0xdff2ff,
    emissiveIntensity: 0.4,
    side: THREE.DoubleSide,
  }),
  260,
);
const flakeSeeds = [];
{
  const g = new THREE.Group();
  const prof = [];
  for (let i = 0; i <= 16; i++) {
    const k = i / 16;
    prof.push(new THREE.Vector2(0.45 + Math.sin(k * Math.PI * 0.5) * 0.75, k * 1.0));
  }
  const bowl = new THREE.Mesh(
    new THREE.LatheGeometry(prof, 96),
    real.ceramic(0x2f4f6e, { side: THREE.DoubleSide }),
  );
  g.add(bowl);
  const frost = new THREE.Mesh(
    new THREE.LatheGeometry(
      prof.map((v) => new THREE.Vector2(v.x + 0.025, v.y)),
      96,
    ),
    frostMat,
  );
  frost.userData.noAO = true;
  g.add(frost);
  // ice cubes heaped inside + a white salt crust
  for (let i = 0; i < 7; i++) {
    const c = new THREE.Mesh(roundedBox(0.5, 0.5, 0.5, 0.08, 3), iceMat);
    const a = (i / 7) * Math.PI * 2;
    c.position.set(
      Math.cos(a) * 0.55 * (i % 2 ? 1 : 0.5),
      0.75 + (i % 3) * 0.12,
      Math.sin(a) * 0.55 * (i % 2 ? 1 : 0.5),
    );
    c.rotation.set(R() * 2, R() * 2, R() * 2);
    g.add(c);
  }
  const crust = new THREE.InstancedMesh(
    roundedBox(1, 1, 1, 0.15, 1),
    real.plastic(0xffffff, { roughness: 0.4 }),
    90,
  );
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 90; i++) {
    const a = R() * Math.PI * 2;
    const rr = Math.sqrt(R()) * 0.8;
    m4.compose(
      V(Math.cos(a) * rr, 1.02 + R() * 0.12, Math.sin(a) * rr),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(R() * 3, R() * 3, 0)),
      V(0.04, 0.04, 0.04),
    );
    crust.setMatrixAt(i, m4);
  }
  g.add(crust);
  g.add(frostFlakes);
  frostFlakes.userData.noAO = true;
  for (let i = 0; i < 260; i++) {
    const k = R();
    const a = R() * Math.PI * 2;
    const rr = 0.45 + Math.sin(k * Math.PI * 0.5) * 0.75 + 0.035;
    const n = V(Math.cos(a), 0.25, Math.sin(a)).normalize();
    flakeSeeds.push({
      p: V(Math.cos(a) * rr, k * 1.0, Math.sin(a) * rr),
      q: new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), n),
      s: 0.012 + R() * 0.02,
      d: R(),
    });
  }
  g.position.copy(BOWL);
  g.traverse((o) => o.isMesh && (o.castShadow = true));
  scene.add(g);
}

// ---------------------------------------------------------------- road salt on the icy terrace floor (analogy)
const ICE_POS = V(14, -15, 6);
const roadSalt = new THREE.InstancedMesh(
  roundedBox(1, 1, 1, 0.15, 1),
  real.plastic(0xffffff, { roughness: 0.4 }),
  34,
);
const wetSpots = new THREE.InstancedMesh(
  new THREE.CylinderGeometry(1, 1, 0.02, 24),
  new THREE.MeshPhysicalMaterial({ color: 0x2f3e4c, roughness: 0.05, clearcoat: 1 }),
  34,
);
const roadSeeds = Array.from({ length: 34 }, () => ({
  x: (R() - 0.5) * 3.0,
  z: (R() - 0.5) * 2.0,
  d: R() * 0.4,
  s: 0.06 + R() * 0.04,
}));
{
  const g = new THREE.Group();
  const sheet = new THREE.Mesh(
    roundedBox(3.8, 0.12, 2.8, 0.05, 3),
    new THREE.MeshPhysicalMaterial({
      color: 0xcfe6f2,
      roughness: 0.08,
      clearcoat: 1,
      transparent: true,
      opacity: 0.9,
    }),
  );
  sheet.position.y = 0.06;
  g.add(sheet);
  // a snow heap + the salt bag
  const heap = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 32, 16),
    real.plastic(0xf6f9ff, { roughness: 0.9, clearcoat: 0 }),
  );
  heap.scale.set(1.3, 0.45, 1);
  heap.position.set(-2.6, 0, -1.2);
  g.add(heap);
  const bag = new THREE.Mesh(
    roundedBox(1.6, 0.5, 1.0, 0.2, 4),
    real.plastic(0x2f62b8, { roughness: 0.6 }),
  );
  bag.position.set(2.5, 0.25, -1.0);
  bag.rotation.y = 0.4;
  g.add(bag);
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.9, 0.3),
    real.plastic(0xffffff, { roughness: 0.6 }),
  );
  label.position.set(2.5 + 0.12, 0.505, -1.0 + 0.2);
  label.rotation.set(-Math.PI / 2, 0, 0.4);
  g.add(label);
  roadSalt.userData.noAO = true;
  g.add(roadSalt);
  g.add(wetSpots);
  g.position.copy(ICE_POS);
  g.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  scene.add(g);
}

// ---------------------------------------------------------------- splash + drips
const NSP = 46;
const splash = new THREE.InstancedMesh(
  new THREE.SphereGeometry(1, 12, 10),
  new THREE.MeshPhysicalMaterial({
    color: 0x5a2410,
    roughness: 0.05,
    clearcoat: 1,
    transparent: true,
    opacity: 0.9,
  }),
  NSP,
);
splash.userData.noAO = true;
splash.frustumCulled = false;
scene.add(splash);
const spSeeds = Array.from({ length: NSP }, () => ({
  a: R() * Math.PI * 2,
  v: 2.2 + R() * 3.2,
  o: 0.4 + R() * 1.4,
  s: 0.02 + R() * 0.035,
  d: R() * 0.12,
}));
const NDR = 6;
const drips = new THREE.InstancedMesh(
  new THREE.SphereGeometry(1, 10, 8),
  real.glass(0xe8f6ff, { opacity: 0.75 }),
  NDR,
);
drips.userData.noAO = true;
drips.frustumCulled = false;
scene.add(drips);
const ring = new THREE.Mesh(
  new THREE.TorusGeometry(1, 0.02, 8, 64),
  new THREE.MeshBasicMaterial({ color: 0xffd9c0, transparent: true, opacity: 0.6 }),
);
ring.rotation.x = Math.PI / 2;
ring.userData.noAO = true;
scene.add(ring);

// ---------------------------------------------------------------- the viewer's hand
const hand = createHand({ skin: 0xe9b48f, sleeve: 0x2b2f3a, scale: 4 });
const HAND_ROT = [0.28, -1.9, 0.0];
// offset from the pinch point (thumb + index) to the hand origin
const HAND_OFF = V(2.15, 0.55, 0.72);

const applyCamera = shotCamera(shots);
const m4 = new THREE.Matrix4();
const qI = new THREE.Quaternion();
const hide = (im, n) => {
  for (let i = 0; i < n; i++) {
    m4.makeScale(0, 0, 0);
    im.setMatrixAt(i, m4);
  }
  im.instanceMatrix.needsUpdate = true;
};

const P_REST = V(0, 4.1, 0);
const L = 1.3; // thread from the pinch to the top of the cube when hanging

function activeLift(t) {
  if (t < T.stell) return LIFTS[0];
  if (inWin(t, T.kurz, T.dabei)) return LIFTS[1];
  if (t >= T.payoff) return LIFTS[2];
  return null;
}

// ---------------------------------------------------------------- render
function renderAt(t) {
  const lift = activeLift(t);
  const liftK = lift ? easeOut(ramp(t, lift.at, lift.at + 0.75)) : 0;
  const frozen = lift ? 1 : smooth(ramp(t, T.eiskalte + 0.2, T.gefrieren + 0.5));

  // ---- pinch point P + cube pose
  let P = null;
  let handOn = false;
  let pose = "grab";
  let swing = 0;
  if (lift) {
    const dt = t - lift.at;
    P = P_REST.clone().add(V(0.05 * Math.sin(t * 1.3), lift.top * liftK, 0));
    swing =
      liftK *
      (0.26 * Math.sin(dt * 4.6) * Math.exp(-Math.max(0, dt) * 0.7) + 0.05 * Math.sin(t * 2.1));
    handOn = true;
    if (lift === LIFTS[2]) {
      // payoff: the hand comes in from above before the lift
      const inK = easeOut(ramp(t, T.payoff, T.payoff + 0.7));
      P.add(V(0.6 * (1 - inK), 2.0 * (1 - inK), 0.3 * (1 - inK)));
      pose = t < T.payoff + 0.55 ? "open" : "grab";
    }
  } else if (inWin(t, T.faden - 0.45, T.jetzt)) {
    handOn = true;
    const inK = easeOut(ramp(t, T.faden - 0.45, T.faden + 0.35));
    const pullK = smooth(ramp(t, T.ziehen + 0.05, T.nichts));
    P = V(lerp(0.5, 0.0, inK), lerp(5.2, 3.75, inK) + pullK * 0.9, lerp(0.3, 0.0, inK));
  }
  if (P) {
    const swingQ = new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), swing);
    const hang = V(0, -(L + TOP), 0).applyQuaternion(swingQ);
    if (lift) {
      cube.position.copy(P).add(hang);
      cube.quaternion.copy(swingQ);
      cube.rotateY(0.25 * Math.sin(t * 0.8));
    }
  }
  if (!lift) {
    // floating, bobbing; the failed pull lifts it a touch, it drops back
    const bob = 0.015 * Math.sin(t * 1.7);
    const kick = inWin(t, T.ziehen, T.jetzt)
      ? 0.1 * Math.sin(clamp01((t - T.ziehen) / 0.5) * Math.PI) * (t < T.nichts ? 1 : 0) +
        0.05 *
          Math.sin((t - T.nichts) * 12) *
          Math.exp(-Math.max(0, t - T.nichts) * 5) *
          (t >= T.nichts ? 1 : 0)
      : 0;
    cube.position.set(0.02, COLA_Y + 0.14 + bob + kick, 0.04);
    cube.rotation.set(0.03 * Math.sin(t * 1.1), 0.18, 0.025 * Math.sin(t * 1.4 + 1));
  }
  cube.updateMatrixWorld(true);
  const top = cube.localToWorld(V(0, TOP + 0.03, 0));

  // ---- hand
  if (handOn && P) {
    hand.track(t, [{ t: -1e9, pos: P.clone().add(HAND_OFF).toArray(), rot: HAND_ROT, pose }]);
  } else hand.track(t, []);

  // ---- threads
  const onCube =
    t < T.stell ||
    inWin(t, T.faden + 0.35, T.ziehen + 0.1) ||
    inWin(t, T.jetzt, T.dabei) ||
    t >= T.unter;
  cubeThread.visible = onCube;
  cubeThread.position.y = -0.028 * frozen;
  live.visible = false;
  if (lift) setLive(P, top, 0.02);
  else if (inWin(t, T.faden - 0.45, T.jetzt)) {
    const layK = smooth(ramp(t, T.faden - 0.1, T.faden + 0.35));
    const pullK = smooth(ramp(t, T.ziehen + 0.1, T.nichts));
    const free = P.clone().add(V(0.05, -1.0, 0.03));
    const end = free.clone().lerp(top, layK * (1 - pullK));
    setLive(P, end, 0.05);
  } else if (inWin(t, T.jetzt, T.kurz) || t >= T.unter) {
    // the thread runs up out of frame to the (unseen) hand
    setLive(V(-0.25, 7.5, 0.15), top, 0.0);
  }

  // ---- water layer: melts under the thread, then freezes white
  const melt = lift ? 1 : smooth(ramp(t, T.schmilzt - 0.2, T.schicht + 0.25));
  layer.visible = (lift || t >= T.unter) && melt > 0.01;
  layer.scale.set(Math.max(0.01, melt), 1, Math.max(0.01, melt));
  layerMat.color.copy(cWater).lerp(cIce, frozen);
  layerMat.emissiveIntensity = 0.55 * (1 - frozen) + 0.08;
  layerMat.opacity = 0.85 + 0.1 * frozen;

  // ---- salt on the cube (falls in, later dissolves)
  const saltVis = inWin(t, T.jetzt, T.dabei) || inWin(t, T.unter, T.eiskalte);
  if (saltVis) {
    const dissolve = 1 - smooth(ramp(t, T.gleich + 0.2, T.zu + 0.6));
    const g = V();
    saltSpots.forEach((s, i) => {
      const land = T.salz - 0.15 + s.d;
      const k = t >= T.unter ? 1 : ramp(t, land - 0.35, land);
      // grains land via the falling stream; once landed they sit on the top
      const sc = k >= 1 ? s.s * dissolve : 0;
      g.copy(s.p);
      m4.compose(g, new THREE.Quaternion().setFromEuler(s.rot), V(sc, sc, sc));
      salt.setMatrixAt(i, m4);
    });
    salt.instanceMatrix.needsUpdate = true;
  } else hide(salt, NS);

  // falling grains from the spout
  if (inWin(t, T.jetzt, T.kurz)) {
    const spout = V(-0.55, 3.9, -0.2);
    for (let i = 0; i < NF; i++) {
      const ph = (t * 1.6 + i / NF) % 1;
      const on = t > T.salz - 0.5 && t < T.salz + 0.7;
      const target = cube.localToWorld(saltSpots[i % NS].p.clone());
      const p = spout.clone().lerp(target, ph);
      p.y += Math.sin(ph * Math.PI) * 0.15;
      const sc = on ? 0.04 : 0;
      m4.compose(
        p,
        new THREE.Quaternion().setFromEuler(new THREE.Euler(i, t * 3 + i, 0)),
        V(sc, sc, sc),
      );
      fallSalt.setMatrixAt(i, m4);
    }
    fallSalt.instanceMatrix.needsUpdate = true;
  } else hide(fallSalt, NF);

  // shaker: rest on the table, swings in to pour
  {
    const k =
      smooth(ramp(t, T.jetzt - 0.1, T.jetzt + 0.35)) * (1 - smooth(ramp(t, T.kurz, T.kurz + 0.3)));
    shaker.position.copy(SHAKER_REST.p).lerp(SHAKER_POUR.p, k);
    shaker.rotation.set(
      0,
      0,
      lerp(0, SHAKER_POUR.r[2], k) + (k > 0.9 ? 0.08 * Math.sin(t * 22) : 0),
    );
  }

  // ---- crystals grow along the thread
  const grow = lift ? 1 : smooth(ramp(t, T.eiskalte + 0.15, T.gefrieren + 0.6));
  if (grow > 0.001 && (lift || t >= T.eiskalte)) {
    crys.forEach((c, i) => {
      const k = clamp01((grow - c.d * 0.5) / 0.5);
      const sc = c.s * k;
      m4.compose(c.p, c.q, V(sc, sc, sc));
      crystals.setMatrixAt(i, m4);
    });
    crystals.instanceMatrix.needsUpdate = true;
  } else hide(crystals, NC);

  // ---- heat from inside the cube, the cube gets colder than 0 °C
  animateArrows(heatUp, t, pop(t, T.waerme, T.gleich));
  const cool = smooth(ramp(t, T.aus, T.null + 0.4)) * (1 - 0.6 * smooth(ramp(t, T.gleich, T.mit)));
  iceMat.emissiveIntensity = 0.06 + 0.55 * (lift ? 0 : cool);

  // ---- fizz on the cola surface
  fizzSeeds.forEach(([a, rr, ph, sp], i) => {
    const k = (t * sp + ph) % 1;
    const sc = 0.018 * Math.sin(k * Math.PI);
    m4.compose(
      V(Math.cos(a) * rr * 0.9, COLA_Y + 0.005, Math.sin(a) * rr * 0.9),
      qI,
      V(sc, sc * 0.7, sc),
    );
    fizz.setMatrixAt(i, m4);
  });
  fizz.instanceMatrix.needsUpdate = true;

  // ---- splash, ring and drips on every lift
  if (lift && t - lift.at < 1.4) {
    const dt0 = t - lift.at - 0.15;
    spSeeds.forEach((s, i) => {
      const dt = dt0 - s.d;
      if (dt < 0) return (m4.makeScale(0, 0, 0), splash.setMatrixAt(i, m4));
      const x = Math.cos(s.a) * (0.3 + s.o * dt);
      const z = Math.sin(s.a) * (0.3 + s.o * dt);
      const y = COLA_Y + s.v * dt - 0.5 * 22 * dt * dt;
      const sc = y > COLA_Y - 0.05 ? s.s : 0;
      m4.compose(V(x, y, z), qI, V(sc, sc * 1.3, sc));
      splash.setMatrixAt(i, m4);
    });
    splash.instanceMatrix.needsUpdate = true;
    const rk = ramp(t, lift.at + 0.1, lift.at + 1.2);
    ring.visible = rk > 0 && rk < 1;
    ring.scale.setScalar(0.4 + rk * 0.5);
    ring.position.set(0, COLA_Y + 0.01, 0);
    ring.material.opacity = 0.6 * (1 - rk);
  } else {
    hide(splash, NSP);
    ring.visible = false;
  }
  if (lift && liftK > 0.6) {
    const bottom = cube.localToWorld(V(0.05, -TOP - 0.02, 0.03));
    for (let i = 0; i < NDR; i++) {
      const ph = (t * 0.9 + i / NDR) % 1;
      const y = bottom.y - ph * ph * 2.2;
      const sc = y > COLA_Y ? 0.035 * (ph < 0.08 ? ph / 0.08 : 1) : 0;
      m4.compose(
        V(bottom.x + 0.08 * Math.sin(i * 2.1), y, bottom.z + 0.05 * Math.cos(i * 1.7)),
        qI,
        V(sc * 0.85, sc * 1.25, sc * 0.85),
      );
      drips.setMatrixAt(i, m4);
    }
    drips.instanceMatrix.needsUpdate = true;
  } else hide(drips, NDR);

  // ---- road salt melts holes into the ice on the terrace floor
  if (inWin(t, T.dabei, T.unter)) {
    roadSeeds.forEach((s, i) => {
      const fall = ramp(t, T.taut + s.d - 0.25, T.taut + s.d);
      const y = 0.14 + (1 - fall) * 2.5;
      const sc = fall > 0 ? s.s : 0;
      m4.compose(
        V(s.x, y, s.z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(i, i * 2, 0)),
        V(sc, sc, sc),
      );
      roadSalt.setMatrixAt(i, m4);
      const wet = smooth(ramp(t, T.taut + s.d + 0.2, T.strasse + 0.6 + s.d));
      const r2 = 0.03 + wet * 0.2;
      m4.compose(V(s.x, 0.125, s.z), qI, V(wet > 0 ? r2 : 0, 1, wet > 0 ? r2 : 0));
      wetSpots.setMatrixAt(i, m4);
    });
    roadSalt.instanceMatrix.needsUpdate = true;
    wetSpots.instanceMatrix.needsUpdate = true;
  } else {
    hide(roadSalt, 34);
    hide(wetSpots, 34);
  }

  // ---- the bowl frosts over (Übrigens)
  const fr = t >= T.fakt ? smooth(ramp(t, T.fakt + 0.2, T.zwanzig + 0.9)) : 0;
  frostMat.opacity = 0.75 * fr;
  flakeSeeds.forEach((s, i) => {
    const k = clamp01((fr - s.d * 0.6) / 0.4);
    const sc = s.s * k;
    m4.compose(s.p, s.q, V(sc, sc, sc));
    frostFlakes.setMatrixAt(i, m4);
  });
  frostFlakes.instanceMatrix.needsUpdate = true;

  // ---- ✕ when the plain pull fails
  showNope(pop(t, T.nichts, T.jetzt), 0.02, 3.35, 0.2, 0.45);

  // ---- LED facts (one at a time)
  if (inWin(t, T.aus, T.gleich)) showPanel(pop(t, T.aus, T.gleich), "KÄLTER ALS", "0 °C", LED.blue);
  else if (inWin(t, T.zwanzig, T.payoff))
    showPanel(pop(t, T.zwanzig, T.payoff), "EIS + SALZ", "−20 °C", LED.blue);
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
