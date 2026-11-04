// Set of #57 "Woche ohne Handy": a mountain lake on an autumn morning — a
// digital-detox cabin. A long wooden jetty runs from the shore out into the
// misty lake; you sit at its end, legs over the water, the locked crate with
// your phone next to you. Behind: the log cabin with a smoking chimney,
// pines and orange larches along the shore, snowy peaks around the lake.
// Life: drifting mist on the water, chimney smoke, ducks, ripples, birds.
// Scale: 1 unit ≈ 25 cm. The jetty runs along z (shore at z ≈ -14).
import { THREE, flat, M, ground, scene, onFrame, rng, V, jitter, noise2 } from "./world.js";
import { SKIES, setSky, finishSet, terrain, tree, pine, rocks, F, add } from "./environments.js";
import { sway } from "./props.js";

const SEED = 57;
const at = (m, x, y, z) => (m.position.set(x, y, z), m);
export const WATER_Y = -2.6;
export const DECK = { x0: -3, x1: 3, z0: -26, z1: 4 }; // deck top at y = 0

// ---------------------------------------------------------------- light
// autumn morning: cool blue zenith, peach haze on the horizon, low sun
// behind the mountains on the left
const sky = setSky({
  ...SKIES.morgen,
  top: [0.42, 0.6, 0.86],
  mid: [0.82, 0.8, 0.86],
  hor: [1.0, 0.82, 0.62],
  below: [0.8, 0.8, 0.84],
  sun: [1.0, 0.86, 0.62],
  sunDir: [-0.55, 0.1, -1],
  keyPos: [9, 13, 11],
  key: [0xffe8cc, 2.6],
  clouds: 9,
  fog: [45, 260],
});

// ---------------------------------------------------------------- ground: shore + lake bed + hills
const shoreH = (x, z) => {
  const s = -14 - z + Math.sin(x * 0.11 + 1.3) * 2.2 + Math.sin(x * 0.043) * 3; // > 0 = land
  const land = smooth01((s + 2.5) / 4);
  let h = land * (0.35 + Math.max(0, s) * 0.05) + (1 - land) * -4.2;
  // hills rise behind the shore
  if (s > 26) h += (s - 26) * 0.22 * (0.45 + 0.55 * noise2(x * 0.03, z * 0.03, SEED));
  return h;
};
function smooth01(x) {
  x = Math.min(1, Math.max(0, x));
  return x * x * (3 - 2 * x);
}
terrain(0x7d9a4e, {
  r: 170,
  step: 3.6,
  seed: SEED,
  amt: 0.14,
  warm: 0.55,
  scale: 0.08,
  height: (x, z) => shoreH(x, z),
  fn: (x, z) => (shoreH(x, z) < -0.6 ? -0.25 : 0) + (noise2(x * 0.2, z * 0.2, 3) - 0.5) * 0.08,
});
// a pebble beach along the waterline
rocks(30, 15, 30, SEED, flat(0xa59c94));

// ---------------------------------------------------------------- the lake
{
  const geo = new THREE.PlaneGeometry(560, 520, 110, 100);
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, WATER_Y, 160);
  const p = geo.attributes.position;
  const r = rng(SEED + 1);
  const base = new Float32Array(p.count * 2);
  const col = new Float32Array(p.count * 3);
  const near = new THREE.Color(0x3f8a8c);
  const far = new THREE.Color(0x24556e);
  const c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) + (r() - 0.5) * 2.2;
    const z = p.getZ(i) + (r() - 0.5) * 2.2;
    p.setX(i, x);
    p.setZ(i, z);
    base[i * 2] = x;
    base[i * 2 + 1] = z;
    c.lerpColors(near, far, Math.min(1, Math.hypot(x, z - 10) / 140));
    col.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const water = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({
      vertexColors: true,
      flatShading: true,
      roughness: 0.1,
      metalness: 0.1,
      envMapIntensity: 1.6,
    }),
  );
  water.receiveShadow = true;
  ground.add(water);
  onFrame((t) => {
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 2];
      const z = base[i * 2 + 1];
      const d = Math.hypot(x, z);
      if (d > 90) continue;
      const h =
        Math.sin(x * 0.31 + z * 0.12 + t * 0.9) * 0.6 +
        Math.sin(z * 0.43 - x * 0.09 - t * 0.7) * 0.45 +
        Math.sin((x + z) * 0.8 + t * 1.4) * 0.15;
      p.setY(i, WATER_Y + h * 0.07);
    }
    p.needsUpdate = true;
  });
}

// ---------------------------------------------------------------- the jetty
const woodA = flat(0xb98a5a, { roughness: 0.85 });
const woodB = flat(0x9c6e44, { roughness: 0.85 });
const woodDark = flat(0x6b4a30, { roughness: 0.9 });
{
  const rr = rng(SEED + 2);
  let i = 0;
  for (let z = DECK.z1 - 0.45; z > DECK.z0; z -= 0.98, i++) {
    const plank = F(
      jitter(new THREE.BoxGeometry(DECK.x1 - DECK.x0 + (rr() - 0.5) * 0.3, 0.28, 0.9), 0.02, i),
      i % 3 ? woodA : woodB,
      0.07,
      SEED + i,
    );
    plank.rotation.y = (rr() - 0.5) * 0.02;
    add(plank, (rr() - 0.5) * 0.12, -0.14, z);
  }
  // two stringers under the planks + posts into the water
  for (const x of [DECK.x0 + 0.4, DECK.x1 - 0.4]) {
    add(
      F(new THREE.BoxGeometry(0.4, 0.4, DECK.z1 - DECK.z0), woodDark, 0.05, 3),
      x,
      -0.45,
      (DECK.z0 + DECK.z1) / 2,
    );
    for (let z = DECK.z1 - 0.3; z > -15; z -= 4.2) {
      const post = F(
        jitter(new THREE.CylinderGeometry(0.26, 0.3, 5.2, 7), 0.02, z),
        woodDark,
        0.06,
        9,
      );
      add(post, x, -2.4, z);
    }
  }
}

// ---------------------------------------------------------------- props on the jetty
// thermos + enamel mug, steam rising from the mug
const STEAM = [];
{
  const g = new THREE.Group();
  g.add(
    at(
      F(new THREE.CylinderGeometry(0.2, 0.2, 1.0, 10), flat(0x2f7d5a, { roughness: 0.4 }), 0.04, 2),
      0,
      0.5,
      0,
    ),
  );
  g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.22, 10), M.alu), 0, 1.1, 0));
  const mug = F(
    new THREE.CylinderGeometry(0.2, 0.18, 0.38, 10),
    flat(0xf3efe6, { roughness: 0.5 }),
    0.04,
    3,
  );
  mug.position.set(0.55, 0.19, 0.2);
  g.add(mug);
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.02, 10), flat(0x5a3a26));
  rim.position.set(0.55, 0.37, 0.2);
  g.add(rim);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.03, 5, 8), flat(0xf3efe6));
  handle.position.set(0.77, 0.2, 0.2);
  g.add(handle);
  g.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  g.position.set(-2.55, 0, 0.6);
  ground.add(g);
  const sm = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
    flatShading: true,
  });
  for (let k = 0; k < 5; k++) {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.09, 0), sm.clone());
    m.userData.noAO = true;
    ground.add(m);
    STEAM.push({ m, ph: k / 5 });
  }
  onFrame((t) => {
    for (const { m, ph } of STEAM) {
      const k = (t * 0.35 + ph) % 1;
      m.position.set(-2.0 + Math.sin(k * 7 + ph * 5) * 0.06, 0.45 + k * 1.1, 0.8);
      m.scale.setScalar(0.6 + k * 1.8);
      m.material.opacity = 0.35 * Math.sin(Math.PI * k);
    }
  });
}
// a warm lantern on a post halfway along the jetty
{
  const g = new THREE.Group();
  g.add(at(F(new THREE.BoxGeometry(0.3, 3.2, 0.3), woodDark, 0.05, 5), 0, 1.6, 0));
  g.add(
    at(
      new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.65, 0.5),
        flat(0x2b2b30, { metalness: 0.4, roughness: 0.5 }),
      ),
      0,
      3.55,
      0,
    ),
  );
  g.add(
    at(
      new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 0.45, 0.38),
        flat(0xffe2a0, { emissive: 0xffb44d, emissiveIntensity: 1.6 }),
      ),
      0,
      3.55,
      0,
    ),
  );
  g.add(at(new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.3, 4), flat(0x2b2b30)), 0, 4.0, 0));
  g.traverse((o) => o.isMesh && (o.castShadow = true));
  g.position.set(DECK.x1 + 0.1, 0, -9);
  ground.add(g);
  const pl = new THREE.PointLight(0xffb45a, 3, 9, 1.6);
  pl.position.set(DECK.x1 + 0.1, 3.5, -9);
  scene.add(pl);
}
// the "OFFLINE" sign at the start of the jetty
{
  const cv = document.createElement("canvas");
  cv.width = 512;
  cv.height = 192;
  const x = cv.getContext("2d");
  x.fillStyle = "#c79a64";
  x.fillRect(0, 0, 512, 192);
  x.strokeStyle = "#6b4a30";
  x.lineWidth = 14;
  x.strokeRect(7, 7, 498, 178);
  x.fillStyle = "#3a2618";
  x.font = "900 92px Montserrat, sans-serif";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.fillText("OFFLINE", 256, 100);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const g = new THREE.Group();
  g.add(at(F(new THREE.BoxGeometry(0.28, 4.2, 0.28), woodDark, 0.05, 6), 0, 2.1, 0));
  const board = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.2, 0.18), [
    woodA,
    woodA,
    woodA,
    woodA,
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 }),
    woodA,
  ]);
  board.position.set(0, 3.6, 0.15);
  g.add(board);
  g.traverse((o) => o.isMesh && (o.castShadow = true));
  g.position.set(DECK.x0 - 1.4, shoreH(DECK.x0 - 1.4, -17), -17);
  g.rotation.y = 0.35;
  ground.add(g);
}

// ---------------------------------------------------------------- the canoe, tied to the jetty
{
  const g = new THREE.Group();
  const hull = F(
    jitter(new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), 0.02, 7),
    flat(0xd8452f, { roughness: 0.45 }),
    0.06,
    7,
  );
  hull.scale.set(1.1, 0.75, 5.4);
  g.add(hull);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1, 0.06, 4, 24), flat(0x6b4a30));
  rim.rotation.x = Math.PI / 2;
  rim.scale.set(1.1, 5.4, 1);
  g.add(rim);
  for (const z of [-1.8, 0, 1.8]) {
    g.add(at(new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.1, 0.5), woodA), 0, -0.12, z));
  }
  const paddle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 4.2), woodB);
  paddle.position.set(0.3, 0.05, 0.4);
  paddle.rotation.y = 0.25;
  g.add(paddle);
  g.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  g.position.set(DECK.x0 - 2.3, WATER_Y + 0.25, -6.5);
  g.rotation.y = 0.12;
  ground.add(g);
  onFrame((t) => {
    g.position.y = WATER_Y + 0.25 + Math.sin(t * 1.1) * 0.05;
    g.rotation.z = Math.sin(t * 0.9) * 0.025;
  });
}

// ---------------------------------------------------------------- reeds in the shallows
{
  const reedMat = flat(0xb7a45a);
  const tipMat = flat(0x7a5232);
  const r = rng(SEED + 4);
  for (const [cx, cz, n] of [
    [-8, -11.5, 26],
    [7.5, -12, 22],
    [-16, -9.5, 18],
    [17, -10, 18],
  ]) {
    const g = new THREE.Group();
    for (let i = 0; i < n; i++) {
      const h = 2.6 + r() * 2.2;
      const s = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, h, 4), reedMat);
      const x = (r() - 0.5) * 4.5;
      const z = (r() - 0.5) * 2.5;
      s.position.set(x, WATER_Y + h / 2, z);
      s.rotation.set((r() - 0.5) * 0.15, 0, (r() - 0.5) * 0.15);
      g.add(s);
      if (r() < 0.45) {
        const c = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.5, 5), tipMat);
        c.position.set(x, WATER_Y + h - 0.2, z);
        g.add(c);
      }
    }
    g.position.set(cx, 0, cz);
    ground.add(g);
    sway(g, cx, 0.015);
  }
}

// ---------------------------------------------------------------- shore: pines + autumn larches
M.leaf.color.set(0xe8902c);
M.leaf2.color.set(0xf2b53a);
{
  const r = rng(SEED + 5);
  const keep = (x, z) =>
    !(Math.abs(x) < 5.5 && z > -30) && !(x > -2 && x < 22 && z < -28 && z > -50);
  let n = 0;
  for (let tries = 0; tries < 400 && n < 95; tries++) {
    const x = (r() - 0.5) * 150;
    const z = -17 - r() * 70;
    if (!keep(x, z)) continue;
    const y = shoreH(x, z);
    if (y < 0.1) continue;
    const s = 1.6 + r() * 1.6 + (-z - 17) * 0.015;
    const g = r() < 0.62 ? pine(x, z, s * 1.25, SEED + n) : tree(x, z, s, SEED + n);
    g.position.y = y;
    n++;
  }
}

// ---------------------------------------------------------------- hero piece: the log cabin
const HUT = [10, -38];
{
  const g = new THREE.Group();
  const logA = flat(0x8a5a36, { roughness: 0.9 });
  const logB = flat(0x7a4d2c, { roughness: 0.9 });
  const W = 16;
  const D = 11;
  for (let i = 0; i < 9; i++) {
    const y = 0.55 + i * 0.95;
    for (const z of [-D / 2, D / 2]) {
      const l = F(new THREE.CylinderGeometry(0.5, 0.5, W + 1.4, 7), i % 2 ? logA : logB, 0.06, i);
      l.rotation.z = Math.PI / 2;
      l.position.set(0, y, z);
      g.add(l);
    }
    for (const x of [-W / 2, W / 2]) {
      const l = F(
        new THREE.CylinderGeometry(0.5, 0.5, D + 1.4, 7),
        i % 2 ? logB : logA,
        0.06,
        i + 20,
      );
      l.rotation.x = Math.PI / 2;
      l.position.set(x, y + 0.47, 0);
      g.add(l);
    }
  }
  // gable roof
  const roofShape = new THREE.Shape();
  roofShape.moveTo(-W / 2 - 1.6, 0);
  roofShape.lineTo(0, 5.2);
  roofShape.lineTo(W / 2 + 1.6, 0);
  roofShape.lineTo(-W / 2 - 1.6, 0);
  const gable = F(
    new THREE.ExtrudeGeometry(roofShape, { depth: D - 0.4, bevelEnabled: false }),
    logA,
    0.05,
    30,
  );
  gable.position.set(0, 8.9, -D / 2 + 0.2);
  g.add(gable);
  const roofMat = flat(0x5b3a3a, { roughness: 0.8 });
  for (const sx of [-1, 1]) {
    const len = Math.hypot(W / 2 + 2.2, 5.6);
    const slab = F(new THREE.BoxGeometry(len, 0.5, D + 2.6), roofMat, 0.07, 31 + sx);
    slab.position.set((sx * (W / 2 + 2.2)) / 2, 8.9 + 2.75, 0);
    slab.rotation.z = -sx * Math.atan2(5.6, W / 2 + 2.2);
    g.add(slab);
  }
  // windows (warm light) + door + porch
  const glow = flat(0xffd88a, { emissive: 0xffaa44, emissiveIntensity: 1.1 });
  for (const x of [-4.5, 4.5]) {
    g.add(at(new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.2, 0.3), glow), x, 4.2, D / 2 + 0.45));
    g.add(at(new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.3, 0.6), logB), x, 3.0, D / 2 + 0.6));
    g.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.2, 0.4), logB), x, 4.2, D / 2 + 0.55));
  }
  g.add(
    at(new THREE.Mesh(new THREE.BoxGeometry(2.4, 4.0, 0.3), flat(0x5a3a22)), 0, 2.0, D / 2 + 0.45),
  );
  g.add(at(F(new THREE.BoxGeometry(W + 2, 0.4, 3.4), logA, 0.05, 40), 0, 0.2, D / 2 + 2));
  // gable window
  g.add(at(new THREE.Mesh(new THREE.CircleGeometry(1.0, 8), glow), 0, 11.3, D / 2 + 0.25));
  // chimney
  const chim = F(new THREE.BoxGeometry(1.6, 5, 1.6), flat(0x9a9090), 0.08, 41);
  chim.position.set(-4.5, 12.5, -1.5);
  g.add(chim);
  // firewood pile
  for (let i = 0; i < 14; i++) {
    const l = F(new THREE.CylinderGeometry(0.32, 0.32, 2.4, 6), i % 2 ? logA : logB, 0.06, 50 + i);
    l.rotation.x = Math.PI / 2;
    l.position.set(
      W / 2 + 2 + (i % 5) * 0.68 - (Math.floor(i / 5) % 2) * 0.34,
      0.35 + Math.floor(i / 5) * 0.6,
      1.5,
    );
    g.add(l);
  }
  g.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  g.position.set(HUT[0], shoreH(HUT[0], HUT[1]), HUT[1]);
  g.rotation.y = -0.18;
  ground.add(g);
  g.updateMatrixWorld();
  const smokeAt = chim.getWorldPosition(V(0, 0, 0)).add(V(0, 2.8, 0));
  const smokeMat = new THREE.MeshStandardMaterial({
    color: 0xf4f2f6,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
    flatShading: true,
  });
  const smoke = Array.from({ length: 12 }, (_, i) => {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.8, 0), smokeMat.clone());
    m.userData.noAO = true;
    ground.add(m);
    return { m, ph: i / 12 };
  });
  onFrame((t) => {
    for (const { m, ph } of smoke) {
      const k = (t * 0.09 + ph) % 1;
      m.position.copy(smokeAt).add(V(k * 6 + Math.sin(k * 6 + ph * 9) * 0.6, k * 14, -k * 2));
      m.scale.setScalar(0.6 + k * 3.2);
      m.material.opacity = 0.5 * Math.sin(Math.PI * Math.min(1, k * 1.25));
    }
  });
}

// ---------------------------------------------------------------- far layer: snowy peaks around the lake
{
  const r = rng(SEED + 6);
  const peakMat = flat(0x6f7f96);
  const peak2 = flat(0x84879e);
  const snow = flat(0xf4f6fb);
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2 + (r() - 0.5) * 0.2;
    const d = 190 + r() * 60;
    const h = 45 + r() * 55;
    const rad = 34 + r() * 26;
    const g = new THREE.Group();
    g.add(
      F(
        jitter(new THREE.ConeGeometry(rad, h, 7, 3), 2.2, 30 + i),
        i % 2 ? peakMat : peak2,
        0.1,
        30 + i,
      ),
    );
    const cap = F(
      jitter(new THREE.ConeGeometry(rad * 0.36, h * 0.36, 7), 1.0, 60 + i),
      snow,
      0.05,
      60 + i,
    );
    cap.position.y = h * 0.32;
    g.add(cap);
    g.position.set(Math.sin(a) * d, h / 2 - 8, -Math.cos(a) * d);
    g.rotation.y = r() * 3;
    ground.add(g);
  }
}

// ---------------------------------------------------------------- life: mist over the water, ducks
{
  const mistMat = new THREE.MeshBasicMaterial({
    color: 0xf6f1f2,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
    fog: true,
  });
  const r = rng(SEED + 7);
  const mist = [];
  for (let i = 0; i < 26; i++) {
    const m = new THREE.Mesh(new THREE.CircleGeometry(1, 10), mistMat.clone());
    m.rotation.x = -Math.PI / 2;
    const sx = 6 + r() * 12;
    m.scale.set(sx, sx * (0.25 + r() * 0.2), 1);
    m.userData = {
      noAO: true,
      x: (r() - 0.5) * 120,
      z: -10 + r() * 70,
      y: WATER_Y + 0.3 + r() * 1.4,
      v: 0.25 + r() * 0.35,
      o: 0.12 + r() * 0.16,
    };
    m.material.opacity = m.userData.o;
    ground.add(m);
    mist.push(m);
  }
  onFrame((t) => {
    for (const m of mist) {
      const u = m.userData;
      let x = u.x + t * u.v;
      x = ((((x + 60) % 120) + 120) % 120) - 60;
      m.position.set(x, u.y, u.z);
    }
  });
  const duck = (c) => {
    const d = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 6), flat(c));
    body.scale.set(1.35, 0.75, 1);
    d.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), flat(0x2f6b4a));
    head.position.set(0.46, 0.38, 0);
    d.add(head);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.24, 5), flat(0xffb347));
    beak.rotation.z = -Math.PI / 2;
    beak.position.set(0.72, 0.34, 0);
    d.add(beak);
    d.traverse((o) => o.isMesh && (o.castShadow = true));
    ground.add(d);
    return d;
  };
  const ducks = [duck(0x9a7a5a), duck(0x8a6a4a), duck(0xf4efe6)];
  onFrame((t) =>
    ducks.forEach((d, i) => {
      const a = t * 0.07 + i * 0.5;
      d.position.set(
        -14 + Math.cos(a) * 5 + i * 1.6,
        WATER_Y + 0.15 + Math.sin(t * 2 + i) * 0.03,
        10 + Math.sin(a) * 3 + i * 0.8,
      );
      d.rotation.y = -a - Math.PI / 2;
    }),
  );
}

finishSet({ ground: 0x6b7f52 });
export { sky, shoreH, HUT };
