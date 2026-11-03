// #53 "Treibsand" (Format B) — a sandbank on a jungle river on a sticky
// thunderstorm afternoon. Pale sand in front of a near-black green jungle
// wall (frame-0 contrast), violet storm clouds with a warm low sun breaking
// through, a brown river behind the sandbank. Hero piece: a giant fallen
// tree lying across the river, root ball and all. Near ring: a warning sign
// "TREIBSAND", a dropped backpack, driftwood, elephant-ear plants, reeds,
// footprints leading into the quicksand. Life: the river flows, dragonflies,
// butterflies, birds, swaying palms and lianas. The quicksand pit itself
// (stage centre) is part of the subject in scene.js; the terrain only dips
// into a pit under it.
import { THREE, flat, ground, onFrame, rng, jitter, V, M, scene } from "./world.js";
import {
  SKIES,
  setSky,
  finishSet,
  terrain,
  fireflies,
  F,
  add,
  cloudPuffs,
} from "./environments.js";
import { place, scatter, palm, rock, sway } from "./props.js";

const SEED = 53;
const R = rng(SEED);

// ---------------------------------------------------------------- light
// storm afternoon: bruised violet sky, a warm band low in the west where
// the sun breaks through, sticky haze
const sky = setSky({
  ...SKIES.sonnenuntergang,
  top: [0.2, 0.18, 0.34],
  mid: [0.46, 0.4, 0.56],
  hor: [1.0, 0.78, 0.5],
  below: [0.42, 0.44, 0.38],
  sun: [1.0, 0.8, 0.45],
  sunDir: [0.55, 0.16, -1],
  cloud: [0x7d7394, 0x3f3858],
  clouds: 20,
  hemi: [0xe8dcc8, 0x2c4630, 1.25],
  key: [0xffd8a0, 2.8],
  keyPos: [-7, 10, 6],
  rim: [0xffb070, 1.0],
  fog: [26, 90],
});

// ---------------------------------------------------------------- ground
export const SAND = 0xe6cf98;
export const PIT_R = 3.4; // radius of the quicksand pool (scene.js)
const RIVER_Z = -10.5;
const relief = (x, z, d) => {
  // the pit under the quicksand (only the centre point drops)
  if (d < 1.0) return -3.0;
  // the sandbank slopes into the river behind
  const rz = Math.abs(z - RIVER_Z);
  let h = 0;
  if (rz < 4.2) h = -1.15 * Math.cos((rz / 4.2) * (Math.PI / 2));
  // a side arm of the river on the left, in front
  const sx = Math.hypot(x + 15, (z - 6) * 0.6);
  if (sx < 4) h = Math.min(h, -0.9 * Math.cos((sx / 4) * (Math.PI / 2)));
  // the far bank rises into the jungle
  if (z < RIVER_Z - 4) h = Math.max(h, Math.min(1.4, (RIVER_Z - 4 - z) * 0.35));
  // hills all around further out
  if (d > 34) {
    const v = Math.sin(x * 0.19 + 2) * Math.cos(z * 0.15 - 1) * 0.5 + 0.5;
    h += ((d - 34) / 41) * 9 * (0.35 + 0.65 * v);
  }
  return h;
};
const terr = terrain(SAND, {
  seed: SEED,
  step: 2.2,
  amt: 0.12,
  warm: 0.5,
  scale: 0.09,
  height: relief,
  // wetter, darker sand near the water, green further back
  fn: (x, z) => {
    const rz = Math.abs(z - RIVER_Z);
    return (rz < 5 ? -0.12 * (1 - rz / 5) : 0) + (z < -15 ? -0.06 : 0);
  },
});
// recolour the terrain's faces: jungle floor on the far bank, dark mud on
// the river bed (vertex colours multiply the sand colour)
{
  const g = terr.geometry;
  const p = g.attributes.position;
  const c = g.attributes.color;
  const mix = (k, r, gg, bb) => {
    for (let j = 0; j < 3; j++) {
      const i = k * 3 + j;
      c.setXYZ(i, c.getX(i) * r, c.getY(i) * gg, c.getZ(i) * bb);
    }
  };
  for (let k = 0; k < p.count / 3; k++) {
    let z = 0;
    let y = 0;
    for (let j = 0; j < 3; j++) {
      z += p.getZ(k * 3 + j) / 3;
      y += p.getY(k * 3 + j) / 3;
    }
    const v = 0.85 + 0.3 * ((k * 0.618) % 1);
    if (z < RIVER_Z - 3.6) mix(k, 0.22 * v, 0.46 * v, 0.3 * v);
    else if (y < -0.25) mix(k, 0.62, 0.6, 0.55);
  }
  c.needsUpdate = true;
}

// ---------------------------------------------------------------- the river
// one big faceted water sheet under everything: flows left → right and is
// lifted by scene.js for the flood at the end (export).
export const water = (() => {
  const geo = new THREE.PlaneGeometry(170, 150, 70, 60);
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  const base = Float32Array.from(p.array);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x5d6a4a,
    flatShading: true,
    roughness: 0.55,
    metalness: 0.05,
    envMapIntensity: 0.9,
    transparent: true,
    opacity: 0.92,
  });
  const m = new THREE.Mesh(geo, mat);
  m.position.set(0, -0.42, -20);
  m.receiveShadow = true;
  m.userData.noAO = true;
  ground.add(m);
  onFrame((t) => {
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 3];
      const z = base[i * 3 + 2];
      p.setY(
        i,
        Math.sin(x * 0.55 - t * 1.6 + z * 0.2) * 0.05 +
          Math.cos(z * 0.9 + x * 0.3 - t * 1.1) * 0.035,
      );
    }
    p.needsUpdate = true;
  });
  return m;
})();
// foam streaks drifting down the river
{
  const n = 40;
  const im = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.9, 0.02, 0.08),
    new THREE.MeshBasicMaterial({ color: 0xe8e6d6, transparent: true, opacity: 0.55 }),
    n,
  );
  im.userData.noAO = true;
  im.frustumCulled = false;
  ground.add(im);
  const s = Array.from({ length: n }, () => [R(), R(), R()]);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  onFrame((t) => {
    s.forEach(([a, b, c], i) => {
      const x = ((((a * 90 + t * (1.2 + c)) % 90) + 90) % 90) - 45;
      const z = RIVER_Z - 2.6 + b * 5.2;
      m4.compose(V(x, water.position.y + 0.06, z), q, V(0.6 + c, 1, 1));
      im.setMatrixAt(i, m4);
    });
    im.instanceMatrix.needsUpdate = true;
  });
}

// ---------------------------------------------------------------- jungle builders
const leafMats = [0x2f7a3a, 0x24602f, 0x3d8f45, 0x1f5229, 0x4a9a3e].map((c) =>
  flat(c, { roughness: 0.85 }),
);
const barkMat = flat(0x6b4a33, { roughness: 0.9 });
const barkDark = flat(0x4e3524, { roughness: 0.9 });
const lianaMat = flat(0x3f6b2a);

// a tall rainforest tree: buttress roots, a long bare trunk, flat layered
// canopy, lianas hanging down
function jungleTree(x, z, s, seed) {
  const r = rng(seed);
  const g = new THREE.Group();
  const h = 4.5 + r() * 6;
  const trunk = F(new THREE.CylinderGeometry(0.28, 0.5, h, 7, 3), barkMat, 0.08, seed);
  trunk.position.y = h / 2;
  g.add(trunk);
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + r();
    const fin = F(new THREE.ConeGeometry(0.55, 1.8, 3), barkDark, 0.08, seed + k);
    fin.position.set(Math.cos(a) * 0.32, 0.8, Math.sin(a) * 0.32);
    fin.rotation.y = -a;
    fin.scale.set(0.25, 1, 1);
    g.add(fin);
  }
  const nC = 3 + Math.floor(r() * 3);
  for (let k = 0; k < nC; k++) {
    const c = F(
      jitter(new THREE.IcosahedronGeometry(1.6 + r() * 0.9, 1), 0.15, seed * 7 + k),
      leafMats[(seed + k) % leafMats.length],
      0.1,
      seed * 7 + k,
    );
    c.scale.y = 0.48;
    c.position.set((r() - 0.5) * 2.6, h + (r() - 0.3) * 0.9, (r() - 0.5) * 2.2);
    g.add(c);
  }
  // lianas: sagging tubes from the canopy
  for (let k = 0; k < 2; k++) {
    const x0 = (r() - 0.5) * 2.4;
    const z0 = 0.5 + r();
    const len = 2.5 + r() * 3;
    const pts = [
      V(x0, h - 0.2, z0),
      V(x0 + 0.3, h - len * 0.5, z0 + 0.4),
      V(x0 + 0.1, h - len, z0 + 0.2),
    ];
    g.add(
      new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.04, 4),
        lianaMat,
      ),
    );
  }
  g.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  g.position.set(x, relief(x, z, Math.hypot(x, z)), z);
  g.scale.setScalar(s);
  g.rotation.y = r() * 6;
  ground.add(g);
  return sway(g, seed, 0.006);
}
// elephant-ear plant: a few big heart leaves on stalks
function bigLeaves(seed, color = 0x3d8f45) {
  const r = rng(seed);
  const g = new THREE.Group();
  const mat = flat(color, { roughness: 0.7, side: THREE.DoubleSide });
  const n = 4 + Math.floor(r() * 3);
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2 + r() * 0.5;
    const stalk = new THREE.Group();
    stalk.rotation.y = a;
    const len = 0.9 + r() * 0.8;
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, len, 5), flat(0x4f7d30));
    st.position.set(0, len / 2, 0.15);
    st.rotation.x = 0.35;
    stalk.add(st);
    const leaf = F(new THREE.ConeGeometry(0.55, 1.4, 6, 1), mat, 0.12, seed + k);
    leaf.scale.z = 0.12;
    leaf.position.set(0, len + 0.05, 0.6);
    leaf.rotation.x = 1.25;
    stalk.add(leaf);
    g.add(stalk);
  }
  g.traverse((o) => o.isMesh && (o.castShadow = true));
  return sway(g, seed, 0.02);
}
// reeds at the waterline (instanced thin cones)
function reeds(n, area, seed) {
  const r = rng(seed);
  const im = new THREE.InstancedMesh(new THREE.ConeGeometry(0.03, 1.3, 4), flat(0x7f9a3a), n);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const [x0, x1, z0, z1] = area;
  const pos = [];
  for (let i = 0; i < n; i++) {
    const x = x0 + (x1 - x0) * r();
    const z = z0 + (z1 - z0) * r();
    pos.push([x, z, r(), 0.6 + r() * 0.8]);
  }
  im.castShadow = true;
  ground.add(im);
  onFrame((t) => {
    pos.forEach(([x, z, ph, s], i) => {
      e.set(Math.sin(t * 1.3 + ph * 6) * 0.08, 0, Math.cos(t * 1.1 + ph * 5) * 0.08);
      q.setFromEuler(e);
      m4.compose(V(x, relief(x, z, Math.hypot(x, z)) + 0.55 * s, z), q, V(s, s, s));
      im.setMatrixAt(i, m4);
    });
    im.instanceMatrix.needsUpdate = true;
  });
}

// ---------------------------------------------------------------- far layer + jungle wall
// the wall on the far bank: dense rainforest trees, bigger further back
for (let i = 0; i < 26; i++) {
  const x = -46 + i * 3.7 + (R() - 0.5) * 2;
  const z = -19 - R() * 7;
  jungleTree(x, z, 0.9 + R() * 0.5, SEED + i * 3);
}
for (let i = 0; i < 16; i++) {
  const x = -50 + i * 6.7 + (R() - 0.5) * 3;
  jungleTree(x, -30 - R() * 8, 1.4 + R() * 0.5, SEED + 200 + i);
}
// dense undergrowth along the far bank: bushes and big leaves hide the trunks' feet
for (let i = 0; i < 34; i++) {
  const x = -48 + i * 2.9 + (R() - 0.5) * 1.5;
  const z = -16.5 - R() * 4;
  const b = F(
    jitter(new THREE.IcosahedronGeometry(1.3 + R() * 1.1, 1), 0.15, SEED + 800 + i),
    leafMats[i % leafMats.length],
    0.1,
    SEED + 800 + i,
  );
  b.scale.y = 0.7;
  b.castShadow = true;
  add(b, x, relief(x, z, Math.hypot(x, z)) + 0.5, z);
  if (i % 3 === 0)
    place(
      bigLeaves(SEED + 900 + i, 0x2f7a3a),
      x + 1.2,
      z + 2.2,
      i,
      1.6,
      relief(x + 1.2, z + 2.2, 30),
    );
}
// misty jungle hills far behind (big dark-green faceted mounds)
for (let i = 0; i < 9; i++) {
  const m = F(
    jitter(new THREE.IcosahedronGeometry(1, 1), 0.12, SEED + 300 + i),
    leafMats[(i + 1) % 4],
    0.1,
    SEED + 300 + i,
  );
  const s = 12 + R() * 9;
  m.scale.set(s * 1.4, s * 0.7, s);
  m.position.set(-70 + i * 18, -2, -62 - R() * 10);
  ground.add(m);
}
// side jungle (left and right of the sandbank), lower and lusher
[
  [-17, -4, 1.0],
  [-21, 2, 1.15],
  [-24, -9, 1.2],
  [18, -5, 1.05],
  [22, 1, 1.2],
  [25, -9, 1.1],
  [-27, 9, 1.0],
  [28, 8, 1.0],
].forEach(([x, z, s], i) => jungleTree(x, z, s, SEED + 400 + i));
[
  [-12, -6.2, 0.4],
  [12.5, -6.4, -0.35],
  [-15.5, -1.2, 0.25],
  [15.5, -0.6, -0.3],
  [-10, 9.5, 0.2],
  [13, 10, -0.2],
].forEach(([x, z, lean], i) => place(palm(SEED + 30 + i, lean), x, z, i * 1.3, 1.25));

// ---------------------------------------------------------------- hero piece: the fallen giant
{
  const g = new THREE.Group();
  const pts = [V(-15, 1.1, -11.5), V(-6, 0.9, -11.0), V(3, 0.7, -10.2), V(12, 0.5, -9.6)];
  const curve = new THREE.CatmullRomCurve3(pts);
  const trunk = F(new THREE.TubeGeometry(curve, 30, 1.0, 9), barkMat, 0.1, SEED + 500);
  g.add(trunk);
  // moss patches on top
  for (let k = 0; k < 9; k++) {
    const p = curve.getPoint(0.08 + k * 0.1);
    const m = F(
      jitter(new THREE.IcosahedronGeometry(0.55, 0), 0.1, SEED + 510 + k),
      leafMats[k % 3],
      0.1,
      SEED + 510 + k,
    );
    m.scale.set(1.3, 0.35, 0.9);
    m.position.set(p.x, p.y + 0.85, p.z);
    g.add(m);
  }
  // the root ball at the left end, standing up like a wall
  const roots = F(
    jitter(new THREE.CylinderGeometry(2.8, 2.6, 0.9, 12, 2), 0.25, SEED + 520),
    flat(0x5a3a26),
    0.12,
    SEED + 520,
  );
  roots.rotation.set(0, 0.3, Math.PI / 2);
  roots.position.set(-15.6, 1.6, -11.6);
  g.add(roots);
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * Math.PI * 2;
    const tip = V(-16.4, 1.6 + Math.sin(a) * 3.6, -11.6 + Math.cos(a) * 3.4);
    const root = new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          V(-15.9, 1.6 + Math.sin(a) * 2.2, -11.6 + Math.cos(a) * 2.1),
          tip,
        ]),
        6,
        0.13,
        5,
      ),
      barkDark,
    );
    g.add(root);
  }
  // broken branches sticking up
  for (const [u, len, tilt] of [
    [0.35, 2.2, 0.4],
    [0.55, 1.6, -0.5],
    [0.78, 2.6, 0.25],
  ]) {
    const p = curve.getPoint(u);
    const b = F(new THREE.CylinderGeometry(0.12, 0.26, len, 6), barkDark, 0.08, SEED + u * 100);
    b.position.set(p.x, p.y + 0.7 + len / 2, p.z);
    b.rotation.z = tilt;
    g.add(b);
  }
  // a liana from the branch down to the water
  g.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([V(3.5, 3.6, -10.3), V(4.4, 1.6, -9.8), V(4.0, -0.2, -9.6)]),
        10,
        0.05,
        4,
      ),
      lianaMat,
    ),
  );
  g.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  ground.add(g);
}

// ---------------------------------------------------------------- near ring
// warning sign "TREIBSAND" on a leaning wooden post, left of the pit
{
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 300;
  const x = c.getContext("2d");
  x.fillStyle = "#ffd23f";
  x.fillRect(0, 0, 512, 300);
  x.fillStyle = "#1a1a1a";
  x.fillRect(14, 14, 484, 272);
  x.fillStyle = "#ffd23f";
  x.fillRect(26, 26, 460, 248);
  x.fillStyle = "#1a1a1a";
  x.font = "bold 150px sans-serif";
  x.textAlign = "center";
  x.fillText("!", 256, 150);
  x.font = "bold 78px sans-serif";
  x.fillText("TREIBSAND", 256, 250);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const g = new THREE.Group();
  const post = F(new THREE.BoxGeometry(0.16, 2.3, 0.16), M.woodDark, 0.1, SEED + 600);
  post.position.y = 1.15;
  g.add(post);
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.88, 0.06), [
    M.wood,
    M.wood,
    M.wood,
    M.wood,
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }),
    M.wood,
  ]);
  board.position.set(0, 2.0, 0.1);
  g.add(board);
  g.traverse((o) => o.isMesh && (o.castShadow = true));
  g.rotation.z = 0.12;
  place(g, -6.9, -1.4, 0.45);
}
// the backpack the hiker dropped on firm sand (right)
{
  const g = new THREE.Group();
  const pack = F(new THREE.BoxGeometry(0.6, 0.75, 0.38), flat(0xe8742a), 0.08, SEED + 610);
  pack.position.y = 0.37;
  pack.rotation.x = -0.5;
  g.add(pack);
  const lid = F(new THREE.BoxGeometry(0.62, 0.2, 0.42), flat(0xc85a18), 0.08, SEED + 611);
  lid.position.set(0, 0.68, -0.18);
  lid.rotation.x = -0.5;
  g.add(lid);
  const bottle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.32, 8),
    flat(0x3fa9e8, { roughness: 0.3 }),
  );
  bottle.position.set(0.42, 0.16, 0.2);
  bottle.rotation.z = Math.PI / 2;
  g.add(bottle);
  g.traverse((o) => o.isMesh && (o.castShadow = true));
  place(g, 6.9, 1.2, -0.6);
}
// driftwood + stones on the sandbank
for (const [x, z, len, ry] of [
  [8.5, -3.5, 3.2, 0.3],
  [-9.5, 3.2, 2.4, -0.8],
  [10.5, 5.5, 1.8, 1.2],
]) {
  const d = F(
    jitter(new THREE.CylinderGeometry(0.14, 0.2, len, 6, 3), 0.04, SEED + x),
    flat(0xb9a58a),
    0.1,
    SEED + x,
  );
  d.rotation.set(0, ry, Math.PI / 2);
  add(d, x, 0.14, z);
}
scatter((i) => rock(SEED + i, 0.35 + (i % 3) * 0.15, flat(0x8d8a7e)), 9, {
  rMin: 7.5,
  rMax: 14,
  seed: SEED + 7,
  keep: (x, z) => z > -6,
});
// elephant-ear plants framing the foreground (left / right, near the camera)
[
  [-8.0, 4.5, 1.3, 0x3d8f45],
  [8.6, 3.6, 1.1, 0x2f7a3a],
  [-11.5, -3.5, 1.4, 0x4a9a3e],
  [11.8, -2.2, 1.3, 0x3d8f45],
  [-6.8, 7.5, 1.0, 0x2f7a3a],
  [7.6, 8.2, 1.2, 0x4a9a3e],
].forEach(([x, z, s, c], i) => place(bigLeaves(SEED + 40 + i, c), x, z, i, s));
reeds(140, [-40, 40, RIVER_Z + 2.6, RIVER_Z + 3.8], SEED + 50);
reeds(50, [-20, -10, 2, 10], SEED + 51);
// footprints leading from the backpack into the pit
{
  const mat = flat(0xc9ae78, { roughness: 1 });
  for (let k = 0; k < 7; k++) {
    const x = 6.2 - k * 0.55;
    const z = 1.0 - k * 0.12 + (k % 2 ? 0.18 : -0.18);
    if (Math.hypot(x, z) < PIT_R + 0.2) break;
    const f = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.02, 8), mat);
    f.scale.set(1, 1, 2.1);
    f.rotation.y = Math.PI / 2 + 0.2;
    add(f, x, 0.012, z, false);
  }
}

// ---------------------------------------------------------------- life
// dragonflies (blue-green glints) over the water and the sandbank
fireflies(26, { area: [-12, 12, 0.6, 2.4, -12, 4], color: 0x7fe8ff, seed: SEED, size: 0.05 });
// butterflies: two flapping wing pairs drifting near the leaves
{
  const flies = [0xffb43f, 0x5fc8ff, 0xff6fa8].map((c, i) => {
    const g = new THREE.Group();
    const wm = flat(c, { side: THREE.DoubleSide, emissive: c, emissiveIntensity: 0.25 });
    const wings = [-1, 1].map((sx) => {
      const w = new THREE.Mesh(new THREE.CircleGeometry(0.14, 5), wm);
      w.position.x = sx * 0.12;
      const p = new THREE.Group();
      p.add(w);
      g.add(p);
      return { p, sx };
    });
    ground.add(g);
    return { g, wings, i };
  });
  onFrame((t) =>
    flies.forEach(({ g, wings, i }) => {
      const a = t * 0.35 + i * 2.1;
      g.position.set(
        Math.cos(a) * (8 + i),
        1.4 + Math.sin(t * 1.3 + i) * 0.4,
        -2 + Math.sin(a) * 4,
      );
      g.rotation.y = -a;
      const f = Math.sin(t * 22 + i) * 0.9;
      wings.forEach(({ p, sx }) => (p.rotation.z = sx * f));
    }),
  );
}
// low storm clouds over the jungle, slowly drifting
{
  const mat = new THREE.MeshStandardMaterial({
    color: 0x6e6688,
    emissive: 0x2a2440,
    emissiveIntensity: 0.3,
    roughness: 1,
    flatShading: true,
    fog: false,
  });
  const g = new THREE.Group();
  for (let i = 0; i < 7; i++) {
    const c = new THREE.Group();
    c.position.set(-60 + i * 20, 16 + R() * 6, -55 - R() * 15);
    cloudPuffs(c, 5, 5 + R() * 3, mat, SEED + 700 + i);
    g.add(c);
  }
  scene.add(g);
  onFrame((t) => (g.position.x = t * 0.15));
}

finishSet({ ground: 0x8c7a52 });
export { sky, relief, terr };
