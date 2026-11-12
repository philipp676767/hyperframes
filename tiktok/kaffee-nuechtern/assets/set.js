// #83 Kaffee auf leeren Magen — the world: a giant-scale body world.
// Up top, in warm morning light, your hand tips the mug over the gullet;
// below it the stomach is a huge glistening pink cave with folded walls
// (the hero piece: the folds and the gullet opening in the ceiling), a
// dark exit hole to the gut, slime drops on the ceiling, drifting steam
// and mist. Two small caves of the same flesh hold the close-up sets: the
// coiled gut and the cut through the stomach wall.
import { THREE, scene, onFrame, rng, noise2 } from "./world.js";
import { SKIES, setSky, finishSet, cloudPuffs, fireflies } from "./environments.js";
import { MUG, GUT, SLAB } from "./beats.js";

// ---------------------------------------------------------------- light
// a warm sunrise for the mug shots (the first sip of the day)
const sky = setSky({
  ...SKIES.morgen,
  top: [0.36, 0.42, 0.72],
  mid: [0.98, 0.66, 0.56],
  hor: [1.0, 0.78, 0.5],
  below: [0.6, 0.38, 0.36],
  sunDir: [0.6, 0.35, 0.7],
  keyPos: [10, 30, 12],
  fog: [40, 160],
  clouds: 6,
  birds: false,
});

// ---------------------------------------------------------------- flesh
// wet, glistening stomach lining: soft red-pink, clearcoat for the wet
// sheen, vertex colours darken the fold valleys
export const fleshMat = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  vertexColors: true,
  roughness: 0.38,
  clearcoat: 0.9,
  clearcoatRoughness: 0.12,
  sheen: 0.5,
  sheenRoughness: 0.35,
  sheenColor: new THREE.Color(0xffb0a8),
  emissive: 0x3a0c12,
  emissiveIntensity: 0.35,
  side: THREE.DoubleSide,
});
const C_RIDGE = new THREE.Color(0xe98a86);
const C_VALLEY = new THREE.Color(0x8e2a36);
const C_FLOOR = new THREE.Color(0xd06a6c);

// a cave of flesh: a lathe with folds (rugae) running down the walls
// profile = [[r, y], …] from the floor centre up to the opening
function cave(profile, { seed = 1, folds = 14, depth = 0.05, segs = 96 } = {}) {
  const pts = new THREE.SplineCurve(profile.map(([r, y]) => new THREE.Vector2(r, y))).getPoints(70);
  const geo = new THREE.LatheGeometry(pts, segs);
  const pos = geo.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    const a = Math.atan2(z, x);
    // folds: meandering ridges, stronger on the walls than on the floor
    const wall = THREE.MathUtils.smoothstep(r, 1.5, 6);
    const ridge =
      Math.sin(a * folds + Math.sin(y * 0.55 + seed) * 1.6 + noise2(x * 0.2, z * 0.2, seed) * 2.5) *
        0.5 +
      0.5;
    const fold = Math.pow(ridge, 1.6);
    const k = 1 + depth * (fold - 0.4) * (0.4 + wall);
    pos.setXYZ(i, x * k, y + (1 - wall) * fold * 0.18, z * k);
    c.copy(C_VALLEY).lerp(C_RIDGE, fold * 0.85 + 0.1);
    c.lerp(C_FLOOR, (1 - wall) * 0.35);
    const n = noise2(x * 0.35, y * 0.35 + z * 0.2, seed + 3);
    c.multiplyScalar(0.85 + n * 0.3);
    col.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, fleshMat);
  m.receiveShadow = true;
  return m;
}

// ---------------------------------------------------------------- the stomach cave
export const stomach = new THREE.Group();
scene.add(stomach);
const STOMACH_PROFILE = [
  [0.01, 0],
  [3.5, 0.05],
  [6.5, 0.6],
  [8.8, 2.2],
  [10.0, 4.8],
  [9.8, 7.6],
  [8.4, 10.2],
  [5.6, 12.2],
  [2.8, 13.1],
  [1.75, 13.5],
];
stomach.add(cave(STOMACH_PROFILE, { seed: 2, folds: 16, depth: 0.07, segs: 128 }));

// the gullet: a ribbed tube from the ceiling up to the mug
const GULLET_TOP = MUG[1] - 2.2;
export const gullet = (() => {
  const h = GULLET_TOP - 13.4;
  const geo = new THREE.CylinderGeometry(1.7, 1.78, h, 64, 40, true);
  const pos = geo.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const ring = Math.sin(y * 5.2) * 0.5 + 0.5;
    const k = 1 + 0.05 * ring;
    pos.setXYZ(i, x * k, y, z * k);
    c.copy(C_VALLEY).lerp(C_RIDGE, 0.35 + ring * 0.55);
    col.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, fleshMat);
  m.position.y = 13.4 + h / 2;
  stomach.add(m);
  // a soft lip where the gullet leaves the cave
  const lip = new THREE.Mesh(new THREE.TorusGeometry(1.82, 0.22, 16, 64), fleshMat);
  lip.rotation.x = Math.PI / 2;
  lip.position.y = 13.45;
  stomach.add(lip);
  // the rim at the top of the gullet (where the mug pours in)
  const top = new THREE.Mesh(new THREE.TorusGeometry(1.76, 0.16, 16, 64), fleshMat);
  top.rotation.x = Math.PI / 2;
  top.position.y = GULLET_TOP;
  stomach.add(top);
  // the throat above is dark, not sky
  const cap = new THREE.Mesh(
    new THREE.CircleGeometry(1.8, 48),
    new THREE.MeshBasicMaterial({ color: 0x2a0508, side: THREE.DoubleSide }),
  );
  cap.rotation.x = -Math.PI / 2;
  cap.position.y = GULLET_TOP - 0.25;
  stomach.add(cap);
  return m;
})();

// the exit to the gut (a dark puckered hole low in the wall)
{
  const ex = new THREE.Group();
  const hole = new THREE.Mesh(
    new THREE.CircleGeometry(1.1, 48),
    new THREE.MeshBasicMaterial({ color: 0x1a0306 }),
  );
  ex.add(hole);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.32, 20, 64), fleshMat);
  ex.add(ring);
  const a = -2.3;
  ex.position.set(Math.cos(a) * 8.75, 2.4, Math.sin(a) * 8.75);
  ex.lookAt(0, 2.2, 0);
  ex.translateZ(0.1);
  stomach.add(ex);
}

// light inside the cave: a warm glow from above (through the gullet), a
// soft rose fill and a cool rim so the wet folds catch highlights
{
  const top = new THREE.PointLight(0xffd2a8, 260, 40, 1.6);
  top.position.set(0, 12.5, 0);
  stomach.add(top);
  const fill = new THREE.PointLight(0xff8f8a, 90, 30, 1.6);
  fill.position.set(4, 4, 6);
  stomach.add(fill);
  const rim = new THREE.PointLight(0x9fc6ff, 70, 30, 1.6);
  rim.position.set(-5, 6, -5);
  stomach.add(rim);
}

// slime drops hanging from the ceiling, slowly stretching and falling
{
  const r = rng(831);
  const N = 26;
  const geo = new THREE.SphereGeometry(1, 20, 14);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffd9d0,
    roughness: 0.05,
    clearcoat: 1,
    transparent: true,
    opacity: 0.75,
  });
  const im = new THREE.InstancedMesh(geo, mat, N);
  im.frustumCulled = false;
  im.userData.noAO = true;
  stomach.add(im);
  const d = [];
  for (let i = 0; i < N; i++) {
    const a = r() * Math.PI * 2;
    const rr = 3 + r() * 5;
    // ceiling height along the profile (roughly)
    const y = 13 - (rr - 2.8) * 0.75;
    d.push({
      x: Math.cos(a) * rr,
      z: Math.sin(a) * rr,
      y,
      ph: r(),
      sp: 0.12 + r() * 0.12,
      s: 0.07 + r() * 0.07,
    });
  }
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  const p = new THREE.Vector3();
  onFrame((t) => {
    d.forEach((o, i) => {
      const u = (t * o.sp + o.ph) % 1;
      const grow = Math.min(1, u / 0.7);
      const fall = Math.max(0, (u - 0.7) / 0.3);
      p.set(o.x, o.y - grow * 0.25 - fall * fall * 10, o.z);
      s.set(o.s, o.s * (1 + grow * 1.4), o.s);
      m.compose(p, q, s.multiplyScalar(fall > 0.95 ? 0 : 1));
      im.setMatrixAt(i, m);
    });
    im.instanceMatrix.needsUpdate = true;
  });
}

// warm mist drifting through the cave (life + depth)
fireflies(70, { area: [-7, 7, 0.6, 9, -7, 7], color: 0xffd0b8, seed: 83, size: 0.05 });

// ---------------------------------------------------------------- the two small caves
const SMALL = [
  [0.01, 0],
  [3, 0.05],
  [5.8, 0.8],
  [7.4, 3],
  [7.6, 5.6],
  [6.4, 8],
  [3.5, 9.6],
  [0.4, 10],
];
for (const [o, seed] of [
  [GUT, 5],
  [SLAB, 7],
]) {
  const g = cave(SMALL, { seed, folds: 12, depth: 0.08, segs: 96 });
  g.position.set(o[0], o[1], o[2]);
  scene.add(g);
  const l1 = new THREE.PointLight(0xffd2b0, 120, 26, 1.6);
  l1.position.set(o[0] + 3, o[1] + 6.5, o[2] + 4);
  scene.add(l1);
  const l2 = new THREE.PointLight(0x9fc6ff, 45, 22, 1.6);
  l2.position.set(o[0] - 4, o[1] + 4, o[2] - 3);
  scene.add(l2);
}

// ---------------------------------------------------------------- around the mug
// a few big morning clouds so the mug shot has depth behind it
{
  const g = new THREE.Group();
  g.position.set(-14, MUG[1] - 6, -30);
  cloudPuffs(g, 5, 4.5, new THREE.MeshStandardMaterial({ color: 0xffe6d8, roughness: 1 }), 83);
  scene.add(g);
  onFrame((t) => (g.position.x = -14 + t * 0.05));
}

finishSet({ ground: 0xc86a68 });
export { sky };
