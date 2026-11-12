// #81 "Nicht blinzeln": a desert at high noon. A giant face lies buried in a
// dune — only its eye, brow and cheek look out of the sand (built in
// scene.js, because it moves). Around it: hot pale sand with ripples, a
// red rock arch behind (the hero piece), a row of mesas on the horizon,
// saguaro cacti, a bleached skull, rolling tumbleweeds, heat dust and
// circling vultures. Everything here is dry — the world the eye is afraid of.
import { THREE, flat, real, ground, onFrame, rng, noise2, V } from "./world.js";
import { SKIES, setSky, finishSet, terrain, fireflies, birds, F, add } from "./environments.js";

const SEED = 81;

// ---------------------------------------------------------------- light
// a white-hot noon: pale blue top, washed-out warm horizon, sun high and
// slightly behind-left so the eye gets a rim and the sand hard shadows
setSky({
  ...SKIES.mittag,
  top: [0.24, 0.5, 0.86],
  mid: [0.6, 0.76, 0.92],
  hor: [1.0, 0.9, 0.74],
  below: [0.96, 0.84, 0.66],
  sun: [1.0, 0.95, 0.8],
  sunDir: [-0.35, 0.75, -0.55],
  keyPos: [-7, 14, 9],
  key: [0xfff1d6, 3.1],
  hemi: [0xdfefff, 0xc89a5e, 1.35],
  rim: [0xffe2b0, 0.8],
  clouds: 3,
  birds: false,
  fog: [40, 190],
});

// ---------------------------------------------------------------- ground
// pale sand, flat around the face, dunes rising from r ≈ 9 in long waves
const dune = (x, z, d) => {
  if (d < 8) return 0;
  const k = Math.min(1, (d - 8) / 14);
  const w = Math.sin(x * 0.16 + z * 0.07 + 1.3) * 0.5 + 0.5;
  const w2 = Math.sin(x * 0.05 - z * 0.13) * 0.5 + 0.5;
  return k * (1.2 + 3.4 * w * w2) + (d > 45 ? (d - 45) * 0.12 : 0);
};
terrain(0xe8c38a, { seed: SEED, step: 2.2, height: dune, amt: 0.09, warm: 0.6, scale: 0.08 });

// sand ripples: thin darker ridges near the camera paths
{
  const r = rng(SEED + 4);
  const mat = flat(0xd9ad72, { roughness: 1 });
  const geo = new THREE.BoxGeometry(1, 0.03, 0.09);
  const n = 160;
  const im = new THREE.InstancedMesh(geo, mat, n);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  let k = 0;
  for (let i = 0; i < n * 3 && k < n; i++) {
    const x = (r() - 0.5) * 26;
    const z = -2 + r() * 14;
    if (Math.abs(x) < 4.6 && z < 3.2) continue; // the face
    if (Math.hypot(x - 3.6, z - 5) < 2.6) continue; // the puddle
    const len = 1.2 + r() * 2.4;
    q.setFromAxisAngle(V(0, 1, 0), 0.35 + Math.sin(x * 0.4) * 0.15);
    m4.compose(V(x, 0.015, z), q, V(len, 1, 1));
    im.setMatrixAt(k++, m4);
  }
  im.count = k;
  im.receiveShadow = true;
  ground.add(im);
}

// ---------------------------------------------------------------- hero piece
// a red sandstone arch behind the face (z ≈ -15): two legs + a bent span
{
  const g = new THREE.Group();
  const red = flat(0xc8643a, { roughness: 0.95 });
  const red2 = flat(0xb0522e, { roughness: 0.95 });
  const leg = (x, s) => {
    for (let i = 0; i < 5; i++) {
      const m = F(
        new THREE.DodecahedronGeometry(1.6 - i * 0.12, 1),
        i % 2 ? red : red2,
        0.14,
        SEED + i + s,
      );
      m.scale.set(1.2, 0.85, 1);
      m.position.set(x + Math.sin(i * 1.7 + s) * 0.35, 0.9 + i * 1.6, 0);
      g.add(m);
    }
  };
  leg(-6, 1);
  leg(6.5, 7);
  const curve = new THREE.QuadraticBezierCurve3(V(-6, 7.2, 0), V(0, 10.8, 0), V(6.5, 7.2, 0));
  const span = F(new THREE.TubeGeometry(curve, 14, 1.25, 7), red, 0.12, SEED + 30);
  span.scale.set(1, 1, 1.15);
  g.add(span);
  // horizontal strata bands
  const band = flat(0xe39a63, { roughness: 1 });
  for (const [x, y] of [
    [-6, 2.2],
    [6.5, 3.4],
    [-6, 5.1],
    [6.5, 6.1],
  ]) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.8, 0.22, 9), band);
    b.position.set(x, y, 0);
    g.add(b);
  }
  g.position.set(1.5, 0, -17);
  g.rotation.y = 0.12;
  g.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  ground.add(g);
}

// ---------------------------------------------------------------- far layer
// mesas on the horizon: flat-topped red/violet blocks, hazier the farther
{
  const r = rng(SEED + 9);
  const cols = [0xc97a52, 0xb9715a, 0xa8708a, 0xc48a6a];
  for (let i = 0; i < 11; i++) {
    const a = -2.5 + (i / 10) * 1.9 + (r() - 0.5) * 0.12; // arc behind (−z)
    const d = 70 + r() * 30;
    const w = 6 + r() * 12;
    const h = 7 + r() * 14;
    const geo = new THREE.CylinderGeometry(w * 0.8, w, h, 7, 2);
    const m = F(geo, flat(cols[i % 4], { roughness: 1 }), 0.1, SEED + 40 + i);
    m.position.set(Math.cos(a) * d, h / 2 - 1, Math.sin(a) * d);
    m.rotation.y = r() * 3;
    m.castShadow = false;
    ground.add(m);
    // a talus skirt
    const sk = F(
      new THREE.CylinderGeometry(w, w * 1.5, h * 0.3, 7),
      flat(0xd8a676),
      0.1,
      SEED + 60 + i,
    );
    sk.position.set(m.position.x, h * 0.15 - 1, m.position.z);
    ground.add(sk);
  }
}

// ---------------------------------------------------------------- near ring
// saguaro cacti (smooth, real material: they come close in several shots)
const cactusMat = real.plastic(0x4f8a3c, { roughness: 0.6, clearcoat: 0.1 });
const ribMat = flat(0x3d6f2f);
function cactus(h, arms, seed) {
  const g = new THREE.Group();
  const r = rng(seed);
  const trunk = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, h, 6, 14), cactusMat);
  trunk.position.y = h / 2 + 0.2;
  g.add(trunk);
  for (let i = 0; i < 8; i++) {
    const rib = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, h, 4), ribMat);
    const a = (i / 8) * Math.PI * 2;
    rib.position.set(Math.cos(a) * 0.31, h / 2 + 0.2, Math.sin(a) * 0.31);
    g.add(rib);
  }
  for (let k = 0; k < arms; k++) {
    const side = k % 2 ? -1 : 1;
    const y = h * (0.35 + r() * 0.3);
    const out = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.5, 4, 10), cactusMat);
    out.rotation.z = (side * Math.PI) / 2;
    out.position.set(side * 0.55, y, 0);
    g.add(out);
    const up = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.7 + r() * 0.6, 4, 10), cactusMat);
    up.position.set(side * 0.85, y + 0.5, 0);
    g.add(up);
    // a pink flower on top of some arms
    if (r() > 0.4) {
      const fl = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 8, 6),
        flat(0xff7fa8, { emissive: 0x401020 }),
      );
      fl.position.set(side * 0.85, y + 0.95 + 0.3, 0);
      g.add(fl);
    }
  }
  g.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return g;
}
for (const [x, z, h, arms, ry] of [
  [-7.2, -3.5, 3.6, 2, 0.4],
  [8.5, -5.5, 4.4, 2, -0.3],
  [-11, 4.5, 2.4, 1, 1.2],
  [12.5, 3, 3.0, 2, 0.8],
  [-4.5, -9.5, 2.6, 1, 2.0],
  [17, -10, 5.0, 2, 0.1],
  [-18, -8, 4.2, 2, -0.6],
]) {
  const c = cactus(h, arms, SEED + x * 3);
  c.position.set(x, 0, z);
  c.rotation.y = ry;
  ground.add(c);
}
// small round barrel cacti + agaves
{
  const r = rng(SEED + 11);
  const barrelMat = real.plastic(0x5f9a45, { roughness: 0.55 });
  const agMat = flat(0x7aa58a);
  for (let i = 0; i < 14; i++) {
    const a = r() * Math.PI * 2;
    const d = 5.2 + r() * 10;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d * 0.8 + 1;
    if (Math.abs(x) < 4.8 && z < 3.4 && z > -3) continue;
    if (i % 2) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.32 + r() * 0.2, 14, 10), barrelMat);
      b.scale.y = 1.15;
      add(b, x, 0.25, z);
    } else {
      const g = new THREE.Group();
      for (let k = 0; k < 9; k++) {
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.9, 4), agMat);
        const aa = (k / 9) * Math.PI * 2;
        leaf.position.set(Math.cos(aa) * 0.15, 0.4, Math.sin(aa) * 0.15);
        leaf.rotation.set(Math.sin(aa) * 0.7, 0, -Math.cos(aa) * 0.7);
        g.add(leaf);
      }
      g.position.set(x, 0, z);
      ground.add(g);
    }
  }
}
// rocks
{
  const r = rng(SEED + 12);
  const mats = [flat(0xc0724a), flat(0xd59a6a), flat(0xa55a3a)];
  for (let i = 0; i < 22; i++) {
    const a = r() * Math.PI * 2;
    const d = 5 + r() * 18;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    if (Math.abs(x) < 4.8 && z > -3 && z < 6) continue;
    const s = 0.2 + r() * 0.7;
    const m = F(new THREE.DodecahedronGeometry(s, 0), mats[i % 3], 0.12, SEED + 100 + i);
    m.scale.y = 0.6;
    add(m, x, s * 0.25, z);
  }
}
// a bleached cow skull half in the sand, left foreground
{
  const g = new THREE.Group();
  const bone = real.ceramic(0xf3ead8, { roughness: 0.5, clearcoat: 0.1 });
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 12), bone);
  head.scale.set(1, 0.8, 1.3);
  g.add(head);
  const snout = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.45, 4, 10), bone);
  snout.rotation.x = Math.PI / 2;
  snout.position.set(0, -0.05, 0.62);
  g.add(snout);
  const holeMat = flat(0x3a2a20);
  for (const s of [-1, 1]) {
    const hole = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), holeMat);
    hole.position.set(s * 0.22, 0.12, 0.42);
    g.add(hole);
    const horn = new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.QuadraticBezierCurve3(
          V(s * 0.3, 0.2, 0),
          V(s * 0.9, 0.3, 0),
          V(s * 1.0, 0.7, -0.1),
        ),
        10,
        0.07,
        8,
      ),
      bone,
    );
    g.add(horn);
  }
  g.position.set(-5.6, 0.15, 5.4);
  g.rotation.set(0.15, 0.7, 0.1);
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });
  ground.add(g);
}

// ---------------------------------------------------------------- life
// tumbleweeds rolling across from the right, looping (pure functions of t)
{
  const weedMat = flat(0xa98a5a, { roughness: 1 });
  const weeds = [];
  for (let i = 0; i < 3; i++) {
    const g = new THREE.Group();
    const r = rng(SEED + 200 + i);
    for (let k = 0; k < 16; k++) {
      const pts = [];
      for (let j = 0; j < 5; j++)
        pts.push(V((r() - 0.5) * 1.1, (r() - 0.5) * 1.1, (r() - 0.5) * 1.1));
      g.add(
        new THREE.Mesh(
          new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.018, 3),
          weedMat,
        ),
      );
    }
    g.traverse((o) => o.isMesh && (o.castShadow = true));
    ground.add(g);
    weeds.push({ g, z: [7.5, -6.5, 11][i], speed: [2.1, 1.6, 2.6][i], ph: [0.1, 0.55, 0.8][i] });
  }
  onFrame((t) => {
    for (const w of weeds) {
      const span = 44;
      const u = ((t * w.speed) / span + w.ph) % 1;
      const x = 22 - u * span;
      const hop = Math.abs(Math.sin(t * 3.3 + w.ph * 9)) * 0.35;
      w.g.position.set(x, 0.55 + hop, w.z);
      w.g.rotation.set(0, 0, (span * u) / 0.55);
    }
  });
}
// heat dust drifting in the light + circling vultures
fireflies(70, { area: [-14, 14, 0.3, 4.5, -10, 10], color: 0xfff0cf, seed: SEED, size: 0.03 });
birds(3);

// ---------------------------------------------------------------- sun glints
// a few mica sparkles in the sand that twinkle
{
  const r = rng(SEED + 300);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
  const sp = [];
  for (let i = 0; i < 40; i++) {
    const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.035, 0), mat.clone());
    const x = (r() - 0.5) * 20;
    const z = -3 + r() * 14;
    if (Math.abs(x) < 4.4 && z < 3) continue;
    m.position.set(x, 0.04, z);
    m.userData.noAO = true;
    ground.add(m);
    sp.push([m, r() * 10]);
  }
  onFrame((t) => {
    for (const [m, ph] of sp) {
      const k = Math.max(0, Math.sin(t * 2.2 + ph * 7)) ** 8;
      m.material.opacity = k;
      m.scale.setScalar(0.4 + k);
    }
  });
}

void noise2;
finishSet({ ground: 0xe8c38a });
