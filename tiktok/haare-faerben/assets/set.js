// #86 Haare färben — the world: a giant-scale scalp at night, lit by the
// warm bathroom lamp far above. The viewer is shrunk to the size of a dust
// grain: hairs rise like a forest of dark glossy trunks out of the skin
// (pores, follicle mounds, blobs of dye foam), a giant comb lies across the
// scalp behind like a black fence (hero piece), the tip of the dye bottle
// hangs overhead and lets a slow purple drop fall, dust motes drift in the
// lamp light. The hero hair (scene.js) stands at the origin.
import { THREE, flat, real, onFrame, rng, V } from "./world.js";
import { setSky, finishSet, terrain, fireflies, add } from "./environments.js";

const SEED = 86;

// ---------------------------------------------------------------- light
setSky({
  top: [0.13, 0.08, 0.12],
  mid: [0.42, 0.24, 0.2],
  hor: [0.98, 0.7, 0.48],
  below: [0.52, 0.33, 0.28],
  sun: [1.0, 0.86, 0.62],
  sunDir: [-0.35, 0.42, -1],
  cloud: [0x000000, 0x000000],
  noClouds: true,
  birds: false,
  fog: [26, 95],
  hemi: [0xffe0c8, 0x5a3a34, 1.15],
  key: [0xffe2bc, 2.5],
  keyPos: [-7, 15, 9],
  rim: [0xff9a6a, 0.9],
});

// ---------------------------------------------------------------- ground: skin
const SKIN = 0xd99c80;
terrain(SKIN, {
  r: 80,
  seed: SEED,
  step: 2.6,
  flatR: 16,
  hills: 5,
  amt: 0.08,
  scale: 0.09,
  warm: 0.5,
});

// pores: small dark dimples scattered over the skin
{
  const r = rng(SEED + 1);
  const n = 220;
  const im = new THREE.InstancedMesh(
    new THREE.CircleGeometry(0.09, 10).rotateX(-Math.PI / 2),
    flat(0x9a5a48),
    n,
  );
  const m = new THREE.Matrix4();
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2;
    const d = 1.6 + r() * 22;
    const s = 0.6 + r() * 1.2;
    m.makeScale(s, 1, s).setPosition(Math.cos(a) * d, 0.012, Math.sin(a) * d);
    im.setMatrixAt(i, m);
  }
  im.receiveShadow = true;
  add(im, 0, 0, 0, false);
}

// ---------------------------------------------------------------- the hair forest
// Every hair: a tall glossy trunk with a gentle lean, a follicle mound at its
// base. Each one has its own material, so scene.js can let a colour wave
// run through the forest at the end (exported as `forest`).
export const forest = [];
const keepClear = (x, z) =>
  (z > -4 && Math.abs(x) < 8.6) || // the hero hair + the camera's room
  (z > 5 && Math.abs(x) < 15) || // in front of the camera
  Math.hypot(x - 4.8, z - 2.6) < 3 ||
  Math.hypot(x + 4.8, z - 2.6) < 3;
{
  const r = rng(SEED + 2);
  const pts = [];
  let tries = 0;
  while (pts.length < 52 && tries++ < 4000) {
    const a = r() * Math.PI * 2;
    const d = 5 + Math.pow(r(), 0.8) * 40;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d - 4;
    if (keepClear(x, z)) continue;
    if (pts.some((p) => Math.hypot(p[0] - x, p[1] - z) < 2.6)) continue;
    pts.push([x, z]);
  }
  const moundMat = real.skin(0xc98a70);
  for (const [k, [x, z]] of pts.entries()) {
    const rad = 0.42 + r() * 0.3;
    const h = 22 + r() * 10;
    const lx = (r() - 0.5) * 3.2;
    const lz = (r() - 0.5) * 3.2;
    const curve = new THREE.CatmullRomCurve3([
      V(0, -0.3, 0),
      V(lx * 0.15, h * 0.33, lz * 0.15),
      V(lx * 0.5, h * 0.66, lz * 0.5),
      V(lx, h, lz),
    ]);
    const tone = 0.85 + r() * 0.3;
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x3a2216).multiplyScalar(tone),
      roughness: 0.38,
      clearcoat: 0.6,
      clearcoatRoughness: 0.25,
    });
    const g = new THREE.Group();
    const hair = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, rad, 14), mat);
    hair.castShadow = true;
    hair.receiveShadow = true;
    g.add(hair);
    const mound = new THREE.Mesh(
      new THREE.SphereGeometry(rad * 2.1, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      moundMat,
    );
    mound.scale.y = 0.28;
    mound.receiveShadow = true;
    g.add(mound);
    g.position.set(x, 0, z);
    add(g, x, 0, z, false);
    forest.push({ g, mat, x, z, seed: k, base: mat.color.clone() });
  }
}
onFrame((t) => {
  for (const f of forest) {
    f.g.rotation.x = Math.sin(t * 0.55 + f.seed) * 0.012;
    f.g.rotation.z = Math.cos(t * 0.47 + f.seed * 1.7) * 0.012;
  }
});

// blobs of dye foam on the skin between the hairs (tells "colouring" at a glance)
{
  const r = rng(SEED + 3);
  const foamMat = real.plastic(0x8e2a5a, { roughness: 0.35, clearcoat: 0.8 });
  const geo = new THREE.SphereGeometry(1, 32, 16);
  for (let k = 0; k < 9; k++) {
    const f = forest[(k * 5 + 2) % forest.length];
    const g = new THREE.Group();
    for (let j = 0; j < 4; j++) {
      const b = new THREE.Mesh(geo, foamMat);
      const s = 0.35 + r() * 0.45;
      b.scale.set(s, s * 0.6, s);
      b.position.set((r() - 0.5) * 1.6, s * 0.25, (r() - 0.5) * 1.6);
      b.castShadow = true;
      g.add(b);
    }
    add(g, f.x + 1.2, 0, f.z + 0.8, false);
  }
}

// ---------------------------------------------------------------- hero: the giant comb
// lies across the scalp behind the forest like a black fence
{
  const comb = new THREE.Group();
  const mat = real.plastic(0x1c1a1f, { roughness: 0.3, clearcoat: 0.7 });
  const spine = new THREE.Mesh(new THREE.BoxGeometry(46, 2.2, 1.6), mat);
  spine.position.y = 6.2;
  comb.add(spine);
  const tooth = new THREE.CylinderGeometry(0.32, 0.5, 6, 16);
  for (let i = 0; i < 40; i++) {
    const m = new THREE.Mesh(tooth, mat);
    m.position.set(-22 + i * 1.13, 3, 0);
    m.castShadow = true;
    comb.add(m);
  }
  comb.rotation.set(0, 0.12, -0.05);
  add(comb, -3, 0.2, -30);
}

// ---------------------------------------------------------------- the dye bottle overhead
// the applicator tip hangs above the forest; a purple drop swells and falls
const nozzle = new THREE.Group();
{
  const white = real.plastic(0xf2eee8);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 6, 48), white);
  body.position.y = 5;
  nozzle.add(body);
  const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 1.1, 2.4, 48), white);
  shoulder.position.y = 0.8;
  nozzle.add(shoulder);
  const tip = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 0.35, 3, 32), white);
  tip.position.y = -1.9;
  nozzle.add(tip);
  const band = new THREE.Mesh(
    new THREE.CylinderGeometry(4.25, 4.25, 1.2, 48),
    real.gloss(0x8e2a5a),
  );
  band.position.y = 4.4;
  nozzle.add(band);
  nozzle.rotation.z = 0.25;
  nozzle.position.set(10, 22, -20);
  add(nozzle, 10, 22, -20, false);
}
const dropMat = real.gloss(0x7d1f52);
const drop = new THREE.Mesh(new THREE.SphereGeometry(0.7, 32, 16), dropMat);
add(drop, 0, 0, 0, false);
onFrame((t) => {
  const p = (t / 6) % 1; // a drop every 6 s
  const tipPos = V(10 + Math.sin(0.25) * 3.4, 22 - 3.4, -20);
  if (p < 0.7) {
    const s = 0.3 + (p / 0.7) * 0.8;
    drop.scale.set(s, s * 1.25, s);
    drop.position.set(tipPos.x, tipPos.y - s * 0.7, tipPos.z);
  } else {
    const f = (p - 0.7) / 0.3;
    drop.scale.set(0.9, 1.4, 0.9);
    drop.position.set(tipPos.x, tipPos.y - 0.8 - f * f * 19, tipPos.z);
  }
});

// ---------------------------------------------------------------- life: dust in the lamp light
fireflies(70, { area: [-16, 16, 0.6, 9, -22, 8], color: 0xffe8c4, seed: SEED, size: 0.035 });

finishSet({ ground: SKIN });
