// #80 Katzenzunge — a sunny glass conservatory (Wintergarten) on a late
// autumn morning: terracotta tiles, black iron window frames, a glass roof
// whose beams throw stripes of shadow, monstera and ferns in clay pots, a
// wicker chair, tea steaming on a side table, dust dancing in the sunbeams.
// The cat sits in its rattan basket in the middle, where it really lives.
// Behind the glass: the garden, trees, a hill line.
import { THREE, flat, ground, onFrame, real, roundedBox, rng, V } from "./world.js";
import { SKIES, setSky, finishSet, terrain, tree, pine, fireflies } from "./environments.js";
import { sway } from "./props.js";

const SEED = 80;
const R = rng(SEED);

// ---------------------------------------------------------------- light
const sky = setSky({
  ...SKIES.morgen,
  top: [0.42, 0.62, 0.9],
  mid: [0.86, 0.84, 0.86],
  hor: [1.0, 0.88, 0.7],
  sunDir: [0.55, 0.32, -1],
  keyPos: [7, 12, 5],
  key: [0xffe7c4, 2.7],
  fog: [40, 110],
  clouds: 10,
});

// ---------------------------------------------------------------- outside
terrain(0x7fae52, { seed: SEED, amt: 0.12, warm: 0.4, hills: 6, flatR: 18 });
[
  [-10, -16, 1.4],
  [-3, -19, 1.6],
  [5, -17, 1.3],
  [12, -20, 1.5],
  [-17, -12, 1.2],
  [18, -11, 1.3],
].forEach(([x, z, s], i) => tree(x, z, s, SEED + i));
[
  [-24, -24],
  [22, -26],
  [0, -30],
  [-12, -32],
  [14, -34],
].forEach(([x, z], i) => pine(x, z, 1.8, SEED + 10 + i));

// ---------------------------------------------------------------- floor: terracotta tiles
{
  const T = 1.2;
  const xs = [];
  for (let x = -14; x <= 14; x += T) for (let z = -7.2; z <= 12; z += T) xs.push([x, z]);
  const geo = roundedBox(T - 0.04, 0.12, T - 0.04, 0.03, 2);
  const mat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.78, clearcoat: 0.15 });
  const im = new THREE.InstancedMesh(geo, mat, xs.length);
  const m4 = new THREE.Matrix4();
  const base = new THREE.Color(0xc0643c);
  xs.forEach(([x, z], i) => {
    m4.makeTranslation(x, 0.0, z);
    im.setMatrixAt(i, m4);
    const c = base.clone().offsetHSL((R() - 0.5) * 0.02, (R() - 0.5) * 0.08, (R() - 0.5) * 0.08);
    im.setColorAt(i, c);
  });
  im.receiveShadow = true;
  ground.add(im);
  // grout below
  const grout = new THREE.Mesh(new THREE.PlaneGeometry(30, 20), flat(0xd8c4ab));
  grout.rotation.x = -Math.PI / 2;
  grout.position.set(0, 0.01, 2.4);
  grout.receiveShadow = true;
  ground.add(grout);
}

// ---------------------------------------------------------------- glass house
const iron = real.metal(0x1d1f22, { roughness: 0.45, metalness: 0.7 });
const glass = real.glass(0xe6f3f7, { opacity: 0.12 });
const brick = new THREE.MeshPhysicalMaterial({ color: 0x9c4a32, roughness: 0.85 });
const H = 11; // eaves height
function bar(w, h, d, x, y, z, mat = iron, shadow = true) {
  const m = new THREE.Mesh(roundedBox(w, h, d, Math.min(w, h, d) * 0.3, 2), mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  ground.add(m);
  return m;
}
// back wall (z = -7.8): brick knee wall + iron mullions + glass
bar(28.4, 0.9, 0.5, 0, 0.45, -7.8, brick);
for (let x = -14; x <= 14.01; x += 1.75) bar(0.12, H, 0.14, x, 0.9 + H / 2 - 0.45, -7.8);
for (const y of [0.95, 4.2, 7.6, H + 0.45]) bar(28.4, 0.12, 0.16, 0, y, -7.8);
{
  const g = new THREE.Mesh(new THREE.PlaneGeometry(28, H), glass);
  g.position.set(0, 0.9 + H / 2 - 0.45, -7.85);
  ground.add(g);
}
// side walls (x = ±14)
for (const sx of [-14, 14]) {
  bar(0.5, 0.9, 20, sx, 0.45, 2.2, brick);
  for (let z = -7.8; z <= 12.2; z += 1.75) bar(0.14, H, 0.12, sx, 0.9 + H / 2 - 0.45, z);
  for (const y of [0.95, 4.2, 7.6, H + 0.45]) bar(0.16, 0.12, 20, sx, y, 2.2);
  const g = new THREE.Mesh(new THREE.PlaneGeometry(20, H), glass);
  g.rotation.y = Math.PI / 2;
  g.position.set(sx, 0.9 + H / 2 - 0.45, 2.2);
  ground.add(g);
}
// glass roof: iron rafters every 1.75 — they paint stripes of shadow on the floor
for (let x = -14; x <= 14.01; x += 1.75) bar(0.14, 0.22, 20, x, H + 0.6, 2.2);
for (const z of [-7.8, -2.5, 3, 8.5]) bar(28.4, 0.18, 0.14, 0, H + 0.6, z);

// ---------------------------------------------------------------- plants
const leafMat = (c) =>
  new THREE.MeshPhysicalMaterial({
    color: c,
    roughness: 0.45,
    clearcoat: 0.4,
    side: THREE.DoubleSide,
  });
const potMat = new THREE.MeshPhysicalMaterial({ color: 0xb85a35, roughness: 0.82 });
function pot(r, h) {
  const pts = [
    V(0, 0, 0),
    V(r * 0.72, 0, 0),
    V(r * 0.95, h * 0.85, 0),
    V(r * 1.05, h * 0.86, 0),
    V(r * 1.05, h, 0),
    V(r * 0.9, h, 0),
    V(r * 0.88, h * 0.92, 0),
  ].map((p) => new THREE.Vector2(p.x, p.y));
  const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 48), potMat);
  m.castShadow = m.receiveShadow = true;
  const soil = new THREE.Mesh(new THREE.CircleGeometry(r * 0.88, 32), flat(0x3b2a20));
  soil.rotation.x = -Math.PI / 2;
  soil.position.y = h * 0.9;
  const g = new THREE.Group();
  g.add(m, soil);
  return g;
}
// a big-leaved plant (monstera-like): stems + broad glossy leaves
function bigPlant(x, z, s, seed, n = 9) {
  const r = rng(seed);
  const g = new THREE.Group();
  const p = pot(0.75, 1.0);
  g.add(p);
  const stemMat = flat(0x4f7a32);
  const lm = leafMat(0x2f6b2a);
  const lm2 = leafMat(0x3d7f33);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r() * 0.5;
    const len = 1.4 + r() * 1.6;
    const tilt = 0.35 + r() * 0.5;
    const tip = V(
      Math.cos(a) * Math.sin(tilt) * len,
      0.9 + Math.cos(tilt) * len,
      Math.sin(a) * Math.sin(tilt) * len,
    );
    const curve = new THREE.QuadraticBezierCurve3(
      V(0, 0.9, 0),
      V(tip.x * 0.3, tip.y, tip.z * 0.3),
      tip,
    );
    const stem = new THREE.Mesh(new THREE.TubeGeometry(curve, 10, 0.035, 6), stemMat);
    g.add(stem);
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.62, 24, 12), i % 2 ? lm : lm2);
    leaf.scale.set(1, 0.06, 0.78);
    leaf.position.copy(tip);
    leaf.rotation.set(0.5 * Math.sin(a), -a, -0.45 - r() * 0.3);
    leaf.castShadow = true;
    const lg = new THREE.Group();
    lg.add(leaf);
    g.add(lg);
  }
  g.traverse((o) => o.isMesh && (o.castShadow = true));
  g.position.set(x, 0.06, z);
  g.scale.setScalar(s);
  ground.add(g);
  sway(g, seed, 0.012);
  return g;
}
// a fern: many thin arching fronds
function fern(x, z, s, seed) {
  const r = rng(seed);
  const g = new THREE.Group();
  g.add(pot(0.55, 0.8));
  const lm = leafMat(0x4f8f37);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + r() * 0.3;
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 8), lm);
    f.scale.set(1.6, 0.04, 0.22);
    f.position.set(Math.cos(a) * 0.75, 1.05 + r() * 0.2, Math.sin(a) * 0.75);
    f.rotation.set(0, -a, -0.35 - r() * 0.25);
    f.castShadow = true;
    g.add(f);
  }
  g.position.set(x, 0.06, z);
  g.scale.setScalar(s);
  ground.add(g);
  sway(g, seed, 0.02);
  return g;
}
bigPlant(-6.5, -5.4, 1.5, 1);
bigPlant(7.4, -5.6, 1.7, 2, 11);
bigPlant(-11.5, 1.5, 1.3, 3);
bigPlant(11.2, 3.5, 1.4, 4);
fern(-3.6, -6.2, 1.2, 5);
fern(3.4, -6.4, 1.1, 6);
fern(-9.2, -3.2, 1.0, 7);
fern(9.8, -1.2, 1.05, 8);
fern(-8.5, 7.5, 1.1, 9);
fern(8.8, 8.8, 1.2, 10);

// hanging pothos from a rafter: a basket and trailing vines
{
  const g = new THREE.Group();
  const basket = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    potMat,
  );
  g.add(basket);
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 3.6, 6), flat(0xcbb48c));
  rope.position.y = 1.8;
  g.add(rope);
  const lm = leafMat(0x3f8a3a);
  for (let v = 0; v < 6; v++) {
    const a = (v / 6) * Math.PI * 2;
    for (let k = 0; k < 9; k++) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 6), lm);
      leaf.scale.set(1, 0.25, 0.75);
      leaf.position.set(
        Math.cos(a) * (0.5 + k * 0.02),
        -0.1 - k * 0.32,
        Math.sin(a) * (0.5 + k * 0.02),
      );
      leaf.rotation.set(k * 0.7, a, 0.6);
      g.add(leaf);
    }
  }
  g.traverse((o) => o.isMesh && (o.castShadow = true));
  g.position.set(-4.8, 7.6, -3.2);
  ground.add(g);
  sway(g, 12, 0.03);
}

// ---------------------------------------------------------------- furniture & props
// rattan armchair (left)
{
  const g = new THREE.Group();
  const rat = new THREE.MeshPhysicalMaterial({ color: 0xc89a5e, roughness: 0.7 });
  const seat = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 0.9, 0.35, 40), rat);
  seat.position.y = 1.2;
  const back = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.16, 16, 48, Math.PI * 1.2), rat);
  back.position.set(0, 2.2, -0.2);
  back.rotation.set(-0.35, 0, -0.3);
  const cushion = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), real.fabric(0x6f8f74));
  cushion.scale.set(1, 0.2, 1);
  cushion.position.y = 1.45;
  g.add(seat, back, cushion);
  for (const [a, b] of [
    [0.7, 0.7],
    [-0.7, 0.7],
    [0.7, -0.7],
    [-0.7, -0.7],
  ]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.1, 10), rat);
    leg.position.set(a, 0.55, b);
    g.add(leg);
  }
  g.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  g.position.set(-5.2, 0.06, -2.4);
  g.rotation.y = 0.6;
  ground.add(g);
}
// side table with a tea cup that steams (right)
const steamAt = V(5.0, 2.45, -2.8);
{
  const g = new THREE.Group();
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.08, 48), real.wood(0x8a5a36));
  top.position.y = 2.0;
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 2.0, 16), iron);
  leg.position.y = 1.0;
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 0.06, 32), iron);
  foot.position.y = 0.03;
  const cup = new THREE.Mesh(
    new THREE.LatheGeometry(
      [0, 0.16, 0.22, 0.23, 0.2].map((r, i) => new THREE.Vector2(r, i * 0.09)),
      40,
    ),
    real.ceramic(0xf3efe7, { side: THREE.DoubleSide }),
  );
  cup.position.set(0, 2.04, 0.1);
  const tea = new THREE.Mesh(new THREE.CircleGeometry(0.2, 32), real.gloss(0x8a4a1c));
  tea.rotation.x = -Math.PI / 2;
  tea.position.set(0, 2.38, 0.1);
  const saucer = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.3, 0.04, 40),
    real.ceramic(0xf3efe7),
  );
  saucer.position.set(0, 2.06, 0.1);
  const book = new THREE.Mesh(roundedBox(0.8, 0.12, 0.6, 0.03), real.fabric(0x2f4f6f));
  book.position.set(-0.35, 2.1, -0.35);
  book.rotation.y = 0.4;
  g.add(top, leg, foot, cup, tea, saucer, book);
  g.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  g.position.set(5.0, 0.06, -2.9);
  ground.add(g);
}
// tea steam: soft rising puffs
{
  const n = 10;
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.25,
    depthWrite: false,
  });
  const im = new THREE.InstancedMesh(new THREE.SphereGeometry(0.09, 12, 8), mat, n);
  im.userData.noAO = true;
  im.frustumCulled = false;
  ground.add(im);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  onFrame((t) => {
    for (let i = 0; i < n; i++) {
      const f = (t * 0.35 + i / n) % 1;
      const s = 0.5 + f * 1.6;
      m4.compose(
        V(
          steamAt.x + Math.sin(f * 6 + i) * 0.12,
          steamAt.y + f * 1.4,
          steamAt.z + Math.cos(f * 5 + i) * 0.08,
        ),
        q,
        V(s * (1 - f), s * (1 - f), s * (1 - f)),
      );
      im.setMatrixAt(i, m4);
    }
    im.instanceMatrix.needsUpdate = true;
  });
}
// watering can (brass) back left, a stack of clay pots right
{
  const g = new THREE.Group();
  const brass = real.metal(0xc9a24a, { roughness: 0.3 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.8, 40), brass);
  body.position.y = 0.4;
  const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.07, 1.1, 16), brass);
  spout.position.set(0.55, 0.65, 0);
  spout.rotation.z = -0.9;
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.04, 10, 32, Math.PI), brass);
  handle.position.set(-0.05, 0.85, 0);
  g.add(body, spout, handle);
  g.traverse((o) => o.isMesh && (o.castShadow = true));
  g.position.set(-2.6, 0.06, -5.2);
  g.rotation.y = 0.5;
  ground.add(g);
}
{
  const g = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const p = pot(0.42 - i * 0.02, 0.6);
    p.position.y = i * 0.18;
    g.add(p);
  }
  g.position.set(2.4, 0.06, -5.6);
  ground.add(g);
}
// rug under the basket: a woven round jute rug (part of the room, not a stage)
{
  const rug = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.04, 64), real.fabric(0xd9c7a2));
  rug.position.y = 0.08;
  rug.receiveShadow = true;
  ground.add(rug);
  for (let k = 1; k <= 4; k++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(k * 0.6, 0.025, 6, 96),
      real.fabric(0xb89f74),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.1;
    ground.add(ring);
  }
}

// ---------------------------------------------------------------- life: dust in the sunbeams + light shafts
fireflies(70, { area: [-6, 6, 0.6, 7, -5, 4], color: 0xfff1cc, seed: SEED, size: 0.02 });
{
  const mat = new THREE.MeshBasicMaterial({
    color: 0xfff0d0,
    transparent: true,
    opacity: 0.05,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    fog: false,
  });
  const dir = V(7, 12, 5).normalize();
  for (const [x, z, w] of [
    [-2.2, -1, 1.4],
    [0.6, 0.4, 1.9],
    [3.0, -1.6, 1.1],
  ]) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 26, 0.05), mat);
    m.userData.noAO = true;
    m.position.set(x, 0, z).addScaledVector(dir, 13);
    m.lookAt(m.position.clone().add(V(0, 0, 1)));
    m.quaternion.setFromUnitVectors(V(0, 1, 0), dir);
    ground.add(m);
  }
}

finishSet({ ground: 0xc0643c });
export { sky };
