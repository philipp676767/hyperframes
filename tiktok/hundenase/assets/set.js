// Set of #70 "Hundenase": a beech forest path on a foggy autumn morning.
// Low golden sun through the trunks, orange leaf litter, fly agarics, a
// mossy fallen log, a wooden hunter's stand (Hochstand) as the hero piece,
// a pine line in the fog behind. Life: falling leaves, drifting fog banks,
// sun shafts, birds. The dog walks the path through the middle.
import { THREE, flat, ground, onFrame, real, rng, M } from "./world.js";
import { SKIES, setSky, finishSet, terrain, pathStrip, pine, birds, F } from "./environments.js";
import { place, scatter, bush, rock } from "./props.js";

const SEED = 70;
const R = rng(SEED);

// ---------------------------------------------------------------- light
const sky = setSky({
  ...SKIES.morgen,
  top: [0.52, 0.64, 0.8],
  mid: [0.95, 0.8, 0.64],
  hor: [1.0, 0.82, 0.58],
  below: [0.62, 0.48, 0.36],
  sun: [1.0, 0.82, 0.55],
  sunDir: [-0.55, 0.12, -1],
  keyPos: [-6, 7, -10],
  key: [0xffd2a0, 3.0],
  hemi: [0xffe8cc, 0x5a4030, 1.35],
  rim: [0xffc890, 1.1],
  fog: [16, 62],
  clouds: 3,
  birds: false,
});

// ---------------------------------------------------------------- ground
// leaf litter: rust, ochre and dark-brown patches
terrain(0x9c5f2c, {
  seed: SEED,
  amt: 0.16,
  scale: 0.1,
  warm: 0.7,
  hills: 9,
  flatR: 26,
  fn: (x, z) => (Math.sin(x * 0.7 + z * 0.4) > 0.6 ? 0.05 : 0),
});
// the forest path (packed earth) running from the camera into the fog
export const PATH = [
  [0.4, 14],
  [0, 6],
  [-0.2, 0],
  [0.6, -6],
  [2.6, -12],
  [3.2, -18],
  [1.2, -26],
  [-2.5, -36],
];
pathStrip(PATH, { width: 2.6, color: 0x7a5a3e, seed: SEED });
pathStrip(
  PATH.map(([x, z]) => [x + 0.55, z]),
  { width: 0.55, color: 0x5e452f, seed: SEED + 1, lift: 0.03 },
);

// ---------------------------------------------------------------- leaf litter (instanced)
const LEAF_COLS = [0xd9772b, 0xc4521f, 0xe8a63a, 0x9a3f1c, 0xb98a3a];
const leafGeo = new THREE.CircleGeometry(0.11, 7);
leafGeo.scale(1, 0.62, 1);
leafGeo.rotateX(-Math.PI / 2);
export const leafMat = new THREE.MeshStandardMaterial({
  roughness: 0.8,
  side: THREE.DoubleSide,
});
{
  const n = 2600;
  const inst = new THREE.InstancedMesh(leafGeo, leafMat, n);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const c = new THREE.Color();
  let k = 0;
  while (k < n) {
    const a = R() * Math.PI * 2;
    const r = 0.6 + Math.pow(R(), 0.8) * 24;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r - 4;
    // fewer on the path itself
    const onPath = Math.abs(x - pathX(z)) < 1.2;
    if (onPath && R() < 0.75) continue;
    e.set((R() - 0.5) * 0.4, R() * 6.3, (R() - 0.5) * 0.4);
    q.setFromEuler(e);
    const s = 0.7 + R() * 0.9;
    m.compose(new THREE.Vector3(x, 0.03 + R() * 0.03, z), q, new THREE.Vector3(s, s, s));
    inst.setMatrixAt(k, m);
    inst.setColorAt(k, c.setHex(LEAF_COLS[k % LEAF_COLS.length]).multiplyScalar(0.8 + R() * 0.3));
    k++;
  }
  inst.receiveShadow = true;
  ground.add(inst);
}
function pathX(z) {
  for (let i = 0; i < PATH.length - 1; i++) {
    const [x0, z0] = PATH[i];
    const [x1, z1] = PATH[i + 1];
    if (z <= z0 && z >= z1) return x0 + ((z - z0) / (z1 - z0)) * (x1 - x0);
  }
  return 99;
}
export { pathX };

// ---------------------------------------------------------------- beech trunks
// smooth grey-green bark close to the camera, a golden crown high above
const bark = real.wood(0x8f8a7c, { roughness: 0.85 });
const barkDark = real.wood(0x6f6a5e, { roughness: 0.9 });
const crownMats = [flat(0xe0952f), flat(0xc9661f), flat(0xf0b84a), flat(0xa9541c)];
function beech(x, z, s = 1, seed = 0) {
  const g = new THREE.Group();
  const r = rng(seed * 31 + 5);
  const h = 13 + r() * 5;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28 * s, 0.42 * s, h, 28, 6),
    r() > 0.5 ? bark : barkDark,
  );
  trunk.position.y = h / 2;
  trunk.castShadow = trunk.receiveShadow = true;
  g.add(trunk);
  // root flare
  const flare = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42 * s, 0.75 * s, 0.6, 28),
    trunk.material,
  );
  flare.position.y = 0.3;
  flare.receiveShadow = true;
  g.add(flare);
  // a few moss patches on the shady side
  for (let k = 0; k < 3; k++) {
    const moss = new THREE.Mesh(new THREE.SphereGeometry(0.2 * s, 16, 10), real.fabric(0x5d7a2e));
    moss.scale.set(1.3, 0.5 + r() * 0.8, 0.5);
    moss.position.set(-0.2 * s, 0.3 + r() * 1.4, -0.3 * s);
    g.add(moss);
  }
  for (let k = 0; k < 4; k++) {
    const blob = F(
      new THREE.IcosahedronGeometry(2.2 + r() * 1.3, 1),
      crownMats[(seed + k) % crownMats.length],
      0.12,
      seed * 7 + k,
    );
    blob.position.set((r() - 0.5) * 3, h - 0.5 + r() * 2.5, (r() - 0.5) * 3);
    blob.castShadow = true;
    g.add(blob);
  }
  g.position.set(x, 0, z);
  ground.add(g);
  return g;
}
[
  [-4.2, -3.2, 1.0],
  [5.0, -6.5, 1.1],
  [-6.5, 3.5, 1.2],
  [7.5, 2.2, 0.95],
  [-3.6, -11, 1.0],
  [6.5, -14, 1.2],
  [-8.5, -6.5, 1.05],
  [10, -9, 1.0],
  [-11, 1, 1.1],
  [-2.5, -19, 1.0],
  [8, -22, 1.1],
  [-7, -16, 0.9],
  [12.5, -2, 1.0],
  [-13, -12, 1.1],
  [4.2, 9.5, 1.0],
  [-5, 11, 1.0],
  [14, -16, 1.0],
  [-15, -22, 1.2],
].forEach(([x, z, s], i) => beech(x, z, s, SEED + i));

// far pine line in the fog
for (let i = 0; i < 26; i++) {
  const a = -Math.PI * 0.95 + (i / 25) * Math.PI * 0.9;
  const r = 30 + R() * 10;
  pine(Math.cos(a) * r, Math.sin(a) * r - 6, 3.2 + R() * 1.4, SEED + 40 + i);
}

// ---------------------------------------------------------------- near props
// fly agarics: red caps with white dots, the accent colour of the forest floor
const capMat = real.gloss(0xd0261c, { roughness: 0.35, clearcoat: 0.6 });
const dotMat = real.plastic(0xfff6ea);
const stemMat = real.plastic(0xf2ead8, { roughness: 0.7 });
function agaric(seed, s = 1) {
  const g = new THREE.Group();
  const r = rng(seed);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.32, 20), stemMat);
  stem.position.y = 0.16;
  g.add(stem);
  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(0.17, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
    capMat,
  );
  cap.scale.set(1, 0.6, 1);
  cap.position.y = 0.3;
  cap.castShadow = true;
  g.add(cap);
  for (let k = 0; k < 9; k++) {
    const a = r() * 6.3;
    const el = 0.25 + r() * 0.9;
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), dotMat);
    d.position.set(
      Math.cos(a) * Math.sin(el) * 0.17,
      0.3 + Math.cos(el) * 0.1,
      Math.sin(a) * Math.sin(el) * 0.17,
    );
    g.add(d);
  }
  g.scale.setScalar(s);
  return g;
}
for (const [x, z, s] of [
  [-2.2, 1.6, 1.4],
  [-2.6, 1.9, 1.0],
  [2.4, -1.4, 1.2],
  [2.8, -1.0, 0.8],
  [-1.9, -3.8, 1.1],
  [3.6, 4.6, 1.3],
  [-3.2, 6.0, 1.0],
]) {
  const a = agaric(Math.round(x * 13 + z * 7), s);
  a.position.set(x, 0, z);
  ground.add(a);
}

// mossy fallen log beside the path
{
  const g = new THREE.Group();
  const log = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 6.5, 32, 4), barkDark);
  log.rotation.z = Math.PI / 2;
  log.position.y = 0.4;
  log.castShadow = log.receiveShadow = true;
  g.add(log);
  const cut = new THREE.Mesh(new THREE.CircleGeometry(0.47, 32), real.wood(0xc8a172));
  cut.rotation.y = Math.PI / 2;
  cut.position.set(3.26, 0.4, 0);
  g.add(cut);
  for (let k = 0; k < 7; k++) {
    const moss = new THREE.Mesh(new THREE.SphereGeometry(0.4, 18, 10), real.fabric(0x6a8a34));
    moss.scale.set(1.4, 0.35, 0.9);
    moss.position.set(-2.8 + k * 0.85, 0.78, (k % 2) * 0.1);
    g.add(moss);
  }
  g.position.set(-4.5, 0, -1.2);
  g.rotation.y = 0.5;
  ground.add(g);
}

// ferns: low faceted fans in rust and faded green
const fernMats = [flat(0xb5702c), flat(0x8a8a3a), flat(0xc98a3a)];
function fern(seed) {
  const g = new THREE.Group();
  const r = rng(seed);
  for (let k = 0; k < 7; k++) {
    const blade = F(new THREE.ConeGeometry(0.09, 1.1, 4), fernMats[k % 3], 0.1, seed + k);
    blade.position.y = 0.4;
    blade.rotation.set(0.9 + r() * 0.3, (k / 7) * Math.PI * 2, 0);
    blade.position.x = Math.sin((k / 7) * Math.PI * 2) * 0.3;
    blade.position.z = Math.cos((k / 7) * Math.PI * 2) * 0.3;
    g.add(blade);
  }
  return g;
}
scatter((i) => fern(SEED + i * 3), 22, {
  rMin: 7,
  rMax: 18,
  seed: SEED + 5,
  keep: (x, z) => Math.abs(x - pathX(z)) > 2,
});
scatter((i) => bush(SEED + i, i % 2 ? 0x8a6a2a : 0x6f7a2c), 10, {
  rMin: 9,
  rMax: 20,
  seed: SEED + 9,
  keep: (x, z) => Math.abs(x - pathX(z)) > 2.5,
});
place(rock(SEED, 0.7), 6.8, -2.0);
place(rock(SEED + 1, 0.5), -7.2, 0.5);

// ---------------------------------------------------------------- hero piece: Hochstand
{
  const g = new THREE.Group();
  const wood = real.wood(0x7a5634, { roughness: 0.8 });
  const woodL = real.wood(0x9a7048, { roughness: 0.8 });
  const post = (x, z) => {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 5.2, 12), wood);
    p.position.set(x, 2.6, z);
    p.rotation.z = x * -0.04;
    p.castShadow = true;
    g.add(p);
  };
  post(-1.1, -0.9);
  post(1.1, -0.9);
  post(-1.1, 0.9);
  post(1.1, 0.9);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.6, 2.1), woodL);
  cabin.position.y = 5.8;
  cabin.castShadow = true;
  g.add(cabin);
  const win = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 0.05), flat(0x241a12));
  win.position.set(0, 6.15, 1.06);
  g.add(win);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.14, 2.6), wood);
  roof.position.y = 6.75;
  roof.rotation.x = -0.16;
  g.add(roof);
  for (let k = 0; k < 9; k++) {
    const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 8), woodL);
    rung.rotation.z = Math.PI / 2;
    rung.position.set(0, 0.5 + k * 0.55, 1.6 - k * 0.07);
    g.add(rung);
  }
  for (const x of [-0.45, 0.45]) {
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 5.2, 8), wood);
    rail.position.set(x, 2.6, 1.32);
    rail.rotation.x = 0.13;
    g.add(rail);
  }
  g.position.set(-6.5, 0, -13.5);
  g.rotation.y = 0.45;
  ground.add(g);
}

// ---------------------------------------------------------------- life
// falling leaves, drifting through the frame
export const FALL = (() => {
  const n = 120;
  const inst = new THREE.InstancedMesh(leafGeo, leafMat, n);
  const r = rng(SEED + 77);
  const seeds = Array.from({ length: n }, () => [
    (r() - 0.5) * 22,
    (r() - 0.5) * 22 - 3,
    r(),
    0.6 + r() * 0.8,
    r() * 6.3,
  ]);
  const c = new THREE.Color();
  for (let i = 0; i < n; i++) inst.setColorAt(i, c.setHex(LEAF_COLS[i % LEAF_COLS.length]));
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const p = new THREE.Vector3();
  const s = new THREE.Vector3(1.2, 1.2, 1.2);
  onFrame((t) => {
    for (let i = 0; i < n; i++) {
      const [x, z, ph, sp, rot] = seeds[i];
      const f = (ph + t * 0.05 * sp) % 1;
      p.set(x + Math.sin(t * 0.9 * sp + rot) * 0.8, 9 * (1 - f), z + Math.cos(t * 0.7 + rot) * 0.5);
      e.set(t * 1.3 * sp + rot, rot, Math.sin(t * 2 * sp + rot) * 0.9);
      q.setFromEuler(e);
      m.compose(p, q, s);
      inst.setMatrixAt(i, m);
    }
    inst.instanceMatrix.needsUpdate = true;
  });
  scene_add(inst);
  return inst;
})();
function scene_add(o) {
  ground.add(o);
}

// low fog banks: big soft planes drifting slowly between the trunks
{
  const cv = document.createElement("canvas");
  cv.width = cv.height = 128;
  const x = cv.getContext("2d");
  const gr = x.createRadialGradient(64, 64, 4, 64, 64, 62);
  gr.addColorStop(0, "rgba(255,240,225,0.55)");
  gr.addColorStop(1, "rgba(255,240,225,0)");
  x.fillStyle = gr;
  x.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    opacity: 0.55,
  });
  const banks = [];
  for (let i = 0; i < 9; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(16, 3.2), mat);
    m.userData.noAO = true;
    m.position.set(-14 + i * 4, 0.9 + (i % 3) * 0.4, -12 - (i % 4) * 4);
    banks.push(m);
    ground.add(m);
  }
  onFrame((t) => banks.forEach((b, i) => (b.position.x = -16 + ((i * 4 + t * 0.35) % 34))));
}

// sun shafts slanting through the trunks
{
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffd9a0,
    transparent: true,
    opacity: 0.09,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  for (let i = 0; i < 6; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.2 + (i % 3) * 0.6, 26), mat);
    m.userData.noAO = true;
    m.position.set(-9 + i * 3.6, 9, -9 - (i % 2) * 5);
    m.rotation.set(0, 0.3, -0.42);
    ground.add(m);
  }
}
birds(3);

finishSet({ ground: 0x9c5f2c });
export { sky, M };
