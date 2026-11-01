// #44 Smartwatch-Puls — the world: the Donaukanal promenade in Vienna on a
// crisp autumn morning, the sun just over the roofs. The jogger's stop is
// the stage (a stone pillar of the quay balustrade at the origin, part of
// the subject in scene.js); behind it the canal (dark teal water, mist
// drifting over it, a river boat gliding by), a green steel arch bridge as
// the hero piece, the far bank with a long graffiti wall, autumn trees and
// a row of old pastel apartment houses with a church spire as the skyline.
// Life: water, mist, the boat, a cyclist on the far bank, falling leaves,
// swaying trees, gulls.
import {
  THREE,
  V,
  rng,
  flat,
  M,
  ground,
  onFrame,
  facet,
  facetMat,
  noise2,
  jitter,
} from "./world.js";
import { SKIES, setSky, finishSet, terrain, F, add } from "./environments.js";
import { place, bench, lamp, bin, bike, sway } from "./props.js";

const SEED = 44;
const r = rng(SEED);
const PI = Math.PI;
const m4 = new THREE.Matrix4();
const q = new THREE.Quaternion();
const col = new THREE.Color();

// canal geometry (z): near quay wall, far quay wall
export const NEAR = -5.6;
export const FAR = -15.4;
const WATER_Y = -1.35;

// ---------------------------------------------------------------- light
// crisp autumn morning: clear blue top, a warm gold band at the horizon,
// the sun low behind the far bank (backlight, long shadows towards us)
const sky = setSky({
  ...SKIES.morgen,
  top: [0.32, 0.52, 0.86],
  mid: [0.78, 0.74, 0.78],
  hor: [1.0, 0.8, 0.52],
  below: [0.86, 0.78, 0.72],
  sun: [1.0, 0.86, 0.6],
  sunDir: [0.42, 0.09, -1],
  key: [0xffe0b8, 2.6],
  keyPos: [7, 9, 5],
  rim: [0xffc890, 1.1],
  clouds: 9,
  fog: [34, 120],
});

// ---------------------------------------------------------------- ground
// paved city ground; a trench where the canal runs (hidden behind the walls)
const GROUND = 0xb9b0a6;
terrain(GROUND, {
  seed: SEED,
  step: 2.2,
  amt: 0.08,
  warm: 0.25,
  height: (x, z, d) => {
    if (z < NEAR + 0.6 && z > FAR - 0.6) return -3;
    if (d > 44) return ((d - 44) / 31) * 5 * (0.4 + 0.6 * noise2(x * 0.05, z * 0.05, 3));
    return 0;
  },
});
// promenade slabs (near bank) — each a touch different
{
  const slabs = [];
  for (let x = -30; x <= 30; x += 1.1)
    for (let z = NEAR + 0.15; z <= 12; z += 1.1) slabs.push([x, z]);
  const slab = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1.05, 0.08, 1.05),
    flat(0xffffff, { roughness: 0.92 }),
    slabs.length,
  );
  const stone = new THREE.Color(0xc4bab0);
  slabs.forEach(([x, z], i) => {
    m4.makeTranslation(x, -0.01, z);
    slab.setMatrixAt(i, m4);
    const k = 0.86 + r() * 0.14 + (noise2(x * 0.12, z * 0.12, 7) - 0.5) * 0.2;
    slab.setColorAt(i, col.copy(stone).multiplyScalar(k));
  });
  slab.receiveShadow = true;
  ground.add(slab);
}
// asphalt cycle lane on the far bank + paving
add(
  new THREE.Mesh(new THREE.BoxGeometry(110, 0.06, 9.6), flat(0xb3aba2)),
  0,
  0.0,
  FAR - 4.8,
  false,
);
add(
  new THREE.Mesh(new THREE.BoxGeometry(110, 0.06, 2.4), flat(0x55535c)),
  0,
  0.02,
  FAR - 1.8,
  false,
);
for (let x = -54; x < 54; x += 3)
  add(
    new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.02, 0.1), flat(0xf2efe6)),
    x,
    0.06,
    FAR - 1.8,
    false,
  );

// ---------------------------------------------------------------- canal
// quay walls of big stone blocks (both banks), a dark teal water ribbon
function quayWall(z, face) {
  const blocks = [];
  for (let x = -56; x <= 56; x += 1.6)
    for (let row = 0; row < 3; row++) blocks.push([x + (row % 2) * 0.8, -0.45 - row * 0.9]);
  const im = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1.56, 0.86, 0.9),
    flat(0xffffff, { roughness: 0.85 }),
    blocks.length,
  );
  const base = new THREE.Color(0xa9a096);
  blocks.forEach(([x, y], i) => {
    m4.makeTranslation(x, y, z - face * 0.45);
    im.setMatrixAt(i, m4);
    const k = 0.82 + r() * 0.2 + (y < -1.3 ? -0.12 : 0);
    im.setColorAt(i, col.copy(base).multiplyScalar(k));
  });
  im.receiveShadow = true;
  ground.add(im);
  // coping stone on top
  add(
    F(new THREE.BoxGeometry(112, 0.18, 1.1, 56, 1, 1), flat(0xd6cec4), 0.04, SEED + face),
    0,
    0.06,
    z - face * 0.45,
  );
  // dark wet band just above the water
  add(
    new THREE.Mesh(new THREE.BoxGeometry(112, 0.25, 0.05), flat(0x4f5a56)),
    0,
    WATER_Y + 0.12,
    z + face * 0.02,
    false,
  );
}
quayWall(NEAR, 1);
quayWall(FAR, -1);
// water: faceted ribbon with small moving ripples, deep teal, glossy
const water = (() => {
  const W = 120;
  const D = NEAR - FAR;
  const g = new THREE.PlaneGeometry(W, D, 120, 12).toNonIndexed();
  g.rotateX(-PI / 2);
  const p = g.attributes.position;
  const base = Float32Array.from(p.array);
  const c = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const zz = p.getZ(i) / D + 0.5;
    const k = 0.85 + 0.15 * Math.sin(zz * PI) + (r() - 0.5) * 0.08;
    col.setHex(0x2d6670).multiplyScalar(k);
    c.set([col.r, col.g, col.b], i * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(c, 3));
  const m = new THREE.Mesh(
    g,
    new THREE.MeshStandardMaterial({
      vertexColors: true,
      flatShading: true,
      roughness: 0.12,
      metalness: 0.15,
      envMapIntensity: 1.2,
    }),
  );
  m.position.set(0, WATER_Y, (NEAR + FAR) / 2);
  m.receiveShadow = true;
  m.userData.noAO = true;
  ground.add(m);
  onFrame((t) => {
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 3];
      const z = base[i * 3 + 2];
      p.setY(i, Math.sin(x * 0.9 + t * 1.6 + z * 0.7) * 0.05 + Math.sin(x * 0.37 - t * 0.9) * 0.04);
    }
    p.needsUpdate = true;
    g.computeVertexNormals();
  });
  return m;
})();
// morning mist drifting over the water
{
  const mat = new THREE.MeshBasicMaterial({
    color: 0xfff3e6,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
    fog: false,
  });
  const puffs = Array.from({ length: 16 }, (_, i) => {
    const m = new THREE.Mesh(jitter(new THREE.IcosahedronGeometry(1, 1), 0.12, i), mat);
    m.userData = {
      x0: -50 + r() * 100,
      z: FAR + 1.2 + r() * (NEAR - FAR - 2.4),
      s: 1.6 + r() * 1.8,
    };
    m.scale.set(m.userData.s * 2.2, 0.35, m.userData.s);
    m.userData.noAO = true;
    ground.add(m);
    return m;
  });
  onFrame((t) =>
    puffs.forEach((m, i) => {
      const u = m.userData;
      m.position.set(
        ((u.x0 + t * 0.45 + 60) % 120) - 60,
        WATER_Y + 0.35 + Math.sin(t * 0.5 + i) * 0.05,
        u.z,
      );
    }),
  );
}
// a river boat gliding down the canal (white hull, blue band, cabin windows)
{
  const g = new THREE.Group();
  const hull = F(new THREE.BoxGeometry(9, 0.9, 2.2, 6, 1, 2), flat(0xf4f2ee), 0.04, 3);
  hull.position.y = 0.2;
  g.add(hull);
  const bow = F(new THREE.ConeGeometry(1.1, 2, 4, 1), flat(0xf4f2ee), 0.04, 4);
  bow.rotation.set(0, PI / 4, -PI / 2);
  bow.scale.set(1, 1, 0.45 / 0.78);
  bow.position.set(5.4, 0.2, 0);
  g.add(bow);
  const band = new THREE.Mesh(new THREE.BoxGeometry(9.05, 0.2, 2.25), flat(0x2a5fbf));
  band.position.y = 0.35;
  g.add(band);
  const cabin = F(new THREE.BoxGeometry(6, 0.9, 1.8), flat(0xffffff), 0.03, 5);
  cabin.position.set(-0.4, 1.1, 0);
  g.add(cabin);
  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(5.6, 0.45, 1.84),
    flat(0x3a4f6a, { roughness: 0.1, metalness: 0.4 }),
  );
  glass.position.set(-0.4, 1.15, 0);
  g.add(glass);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.1, 1.95), flat(0x2a5fbf));
  roof.position.set(-0.4, 1.6, 0);
  g.add(roof);
  g.traverse((o) => o.isMesh && (o.castShadow = true));
  ground.add(g);
  onFrame((t) => {
    g.position.set(-52 + t * 1.6, WATER_Y + Math.sin(t * 1.3) * 0.04, FAR + 3.2);
    g.rotation.x = Math.sin(t * 1.1) * 0.012;
  });
}

// ---------------------------------------------------------------- balustrade
// green iron railing along the near quay (posts + top rail + lower rail)
{
  const iron = flat(0x2f5a46, { roughness: 0.4, metalness: 0.45 });
  const posts = [];
  for (let x = -40; x <= 40; x += 1.5) posts.push(x);
  const pm = new THREE.InstancedMesh(new THREE.BoxGeometry(0.08, 1.05, 0.08), iron, posts.length);
  posts.forEach((x, i) => pm.setMatrixAt(i, m4.makeTranslation(x, 0.6, NEAR + 0.35)));
  pm.castShadow = true;
  ground.add(pm);
  for (const y of [1.1, 0.45]) {
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 80, 6), iron);
    rail.rotation.z = PI / 2;
    add(rail, 0, y, NEAR + 0.35);
  }
  // far bank railing
  const pm2 = new THREE.InstancedMesh(new THREE.BoxGeometry(0.08, 1.05, 0.08), iron, posts.length);
  posts.forEach((x, i) => pm2.setMatrixAt(i, m4.makeTranslation(x, 0.6, FAR - 0.35)));
  ground.add(pm2);
  const rail2 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 80, 6), iron);
  rail2.rotation.z = PI / 2;
  add(rail2, 0, 1.1, FAR - 0.35);
}

// ---------------------------------------------------------------- hero: the arch bridge
// a green steel arch bridge across the canal, lattice hangers, lamps on it
{
  const g = new THREE.Group();
  const steel = flat(0x3f8a6e, { roughness: 0.35, metalness: 0.5 });
  const deckM = flat(0x8e8a86, { roughness: 0.8 });
  const span = NEAR - FAR + 3;
  const deck = F(new THREE.BoxGeometry(5.2, 0.45, span, 2, 1, 10), deckM, 0.04, 9);
  deck.position.y = 0.55;
  g.add(deck);
  const under = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.5, span), flat(0x5c5a5c));
  under.position.y = 0.1;
  g.add(under);
  for (const sx of [-1, 1]) {
    const pts = [];
    for (let k = 0; k <= 24; k++) {
      const f = k / 24;
      pts.push(V(sx * 2.45, 0.8 + Math.sin(f * PI) * 4.2, -span / 2 + 0.6 + f * (span - 1.2)));
    }
    const arch = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.16, 6),
      steel,
    );
    g.add(arch);
    // hangers
    for (let k = 2; k <= 22; k += 2) {
      const p = pts[k];
      const h = p.y - 0.8;
      const hg = new THREE.Mesh(new THREE.BoxGeometry(0.06, h, 0.06), steel);
      hg.position.set(p.x, 0.8 + h / 2, p.z);
      g.add(hg);
    }
    // side girder
    const gird = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.5, span), steel);
    gird.position.set(sx * 2.45, 0.95, 0);
    g.add(gird);
  }
  // cross bracing at the top
  for (let k = 6; k <= 18; k += 4) {
    const f = k / 24;
    const y = 0.8 + Math.sin(f * PI) * 4.2;
    const b = new THREE.Mesh(new THREE.BoxGeometry(4.9, 0.12, 0.12), steel);
    b.position.set(0, y, -span / 2 + 0.6 + f * (span - 1.2));
    g.add(b);
  }
  g.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  g.position.set(-15, 0, (NEAR + FAR) / 2);
  ground.add(g);
  for (const z of [NEAR + 1.2, FAR - 1.2]) place(lamp({ on: true, h: 3.2 }), -12.2, z);
}

// ---------------------------------------------------------------- far bank
// graffiti wall: long concrete wall facing the canal, painted pieces
function graffitiTex(w, h, seed) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  const rr = rng(seed);
  g.fillStyle = "#8f8a86";
  g.fillRect(0, 0, w, h);
  // concrete panels
  g.strokeStyle = "rgba(0,0,0,0.18)";
  g.lineWidth = 3;
  for (let x = 0; x < w; x += 128) g.strokeRect(x, 0, 128, h);
  const pal = [
    "#ff4fa3",
    "#ffd23f",
    "#2fc8ff",
    "#7cff6a",
    "#ff7a2f",
    "#a66bff",
    "#ffffff",
    "#ff3b3b",
  ];
  // big pieces: bubble letters made of fat round strokes
  const letters = ["LAUF", "PULS", "WIEN", "GO", "MORGEN", "KANAL"];
  let x = 20;
  let li = 0;
  while (x < w - 80) {
    const word = letters[li++ % letters.length];
    const size = 70 + rr() * 30;
    const fill = pal[Math.floor(rr() * pal.length)];
    const fill2 = pal[Math.floor(rr() * pal.length)];
    g.save();
    g.translate(x, h * 0.62 + (rr() - 0.5) * 20);
    g.rotate((rr() - 0.5) * 0.18);
    g.font = `900 ${size}px Montserrat, Arial Black, sans-serif`;
    g.lineJoin = "round";
    // drop shadow / 3D block
    g.fillStyle = "#1a1626";
    g.fillText(word, 7, 7);
    const grad = g.createLinearGradient(0, -size, 0, 0);
    grad.addColorStop(0, fill);
    grad.addColorStop(1, fill2);
    g.lineWidth = 16;
    g.strokeStyle = "#1a1626";
    g.strokeText(word, 0, 0);
    g.fillStyle = grad;
    g.fillText(word, 0, 0);
    g.lineWidth = 3;
    g.strokeStyle = "#ffffff";
    g.strokeText(word, -2, -2);
    const ww = g.measureText(word).width;
    // drips
    g.fillStyle = fill2;
    for (let k = 0; k < 3; k++) g.fillRect(rr() * ww, 4, 4, 10 + rr() * 26);
    g.restore();
    // a star / heart / sticker between pieces
    g.fillStyle = pal[Math.floor(rr() * pal.length)];
    g.beginPath();
    g.arc(x + ww + 36, h * 0.3 + rr() * 30, 12 + rr() * 10, 0, 7);
    g.fill();
    x += ww + 80 + rr() * 60;
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
{
  const len = 70;
  const wall = new THREE.Mesh(new THREE.BoxGeometry(len, 3.2, 0.5), [
    flat(0x8f8a86),
    flat(0x8f8a86),
    flat(0xa29d98),
    flat(0x8f8a86),
    new THREE.MeshStandardMaterial({ map: graffitiTex(4096, 190, SEED), roughness: 0.85 }),
    flat(0x8f8a86),
  ]);
  add(wall, 4, 1.6, FAR - 3.6);
  const cap = new THREE.Mesh(new THREE.BoxGeometry(len, 0.15, 0.7), flat(0xb3ada7));
  add(cap, 4, 3.25, FAR - 3.6);
}
// autumn trees: own leaf colours (gold, orange, rust), along both banks
const LEAF = [0xf2b134, 0xe8762c, 0xc9502a, 0xd99a2b, 0x9fb03a].map((c) => flat(c));
function autumnTree(x, z, s, seed) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.22, 2.2, 6), M.trunk);
  trunk.position.y = 1.1;
  trunk.castShadow = true;
  g.add(trunk);
  const rr = rng(seed);
  const n = 3;
  for (let k = 0; k < n; k++) {
    const rad = 1.05 - k * 0.2;
    const m = F(
      jitter(new THREE.IcosahedronGeometry(rad, 1), 0.08, seed * 13 + k),
      LEAF[Math.floor(rr() * LEAF.length)],
      0.12,
      seed * 13 + k,
    );
    m.position.set((rr() - 0.5) * 0.7, 2.5 + k * 0.85, (rr() - 0.5) * 0.5);
    m.castShadow = true;
    g.add(m);
  }
  g.position.set(x, 0, z);
  g.scale.setScalar(s);
  g.rotation.y = seed;
  ground.add(g);
  sway(g, seed, 0.02);
  return g;
}
const TREES = [];
for (let x = -34; x <= 34; x += 4.6 + r() * 1.4) {
  if (Math.abs(x + 15) < 3.2) continue; // bridge
  TREES.push(autumnTree(x, FAR - 6.0 + (r() - 0.5) * 1.2, 1.15 + r() * 0.3, SEED + TREES.length));
}
// near bank trees: only out to the sides (camera looks over the canal)
for (const [x, z, s] of [
  [-9.5, NEAR + 1.2, 1.1],
  [9.0, NEAR + 1.1, 1.15],
  [-20, NEAR + 1.4, 1.2],
  [19, NEAR + 1.3, 1.1],
  [-26, 4, 1.25],
  [27, 5, 1.2],
])
  TREES.push(autumnTree(x, z, s, SEED + 50 + TREES.length));

// skyline: old pastel apartment houses (Gründerzeit), framed windows, a spire
{
  const pastel = [0xf1d7b0, 0xe8c4b8, 0xd7d0c0, 0xf3e2c2, 0xc8d3dc, 0xe9b9a0, 0xdcc9e0];
  const roofCols = [0x8a5a48, 0x6f6470, 0x9a6a4e];
  const frames = [];
  const wins = [];
  const house = (x, z, w, d, h) => {
    const g = new THREE.Group();
    const wallC = pastel[Math.floor(r() * pastel.length)];
    const body = new THREE.Mesh(
      facet(new THREE.BoxGeometry(w, h, d), 0.03, Math.floor(r() * 99)),
      facetMat(flat(wallC)),
    );
    body.position.y = h / 2;
    body.castShadow = body.receiveShadow = true;
    g.add(body);
    const trim = flat(new THREE.Color(wallC).multiplyScalar(0.84));
    for (const [y, hh] of [
      [0.5, 1.0],
      [h - 0.15, 0.3],
      [3.2, 0.12],
    ]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w + 0.12, hh, d + 0.12), trim);
      b.position.y = y;
      g.add(b);
    }
    // mansard-ish roof
    const roof = F(
      new THREE.BoxGeometry(w * 0.96, 1.4, d * 0.8),
      flat(roofCols[Math.floor(r() * 3)]),
      0.05,
      7,
    );
    roof.position.set(0, h + 0.7, -0.2);
    g.add(roof);
    const cols = Math.max(2, Math.floor((w - 0.6) / 1.15));
    const rows = Math.max(2, Math.floor((h - 2.0) / 1.5));
    for (let cx = 0; cx < cols; cx++)
      for (let ry = 0; ry < rows; ry++) {
        const wx = -((cols - 1) * 1.15) / 2 + cx * 1.15;
        const wy = 2.2 + ry * 1.5;
        frames.push({ g, x: wx, y: wy, z: d / 2 + 0.02 });
        wins.push({ g, x: wx, y: wy, z: d / 2 + 0.05, lit: r() < 0.12 });
      }
    g.position.set(x, 0, z);
    ground.add(g);
  };
  for (let x = -46; x < 46; ) {
    const w = 5 + r() * 3;
    house(x + w / 2, FAR - 12 - r() * 1.5, w, 6, 9 + r() * 6);
    x += w + 0.2;
  }
  // second row higher, further away
  for (let x = -50; x < 50; ) {
    const w = 6 + r() * 4;
    house(x + w / 2, FAR - 22, w, 6, 12 + r() * 7);
    x += w + 0.3;
  }
  const inst = (list, geo, mat) => {
    const im = new THREE.InstancedMesh(geo, mat, Math.max(1, list.length));
    list.forEach((w, i) => {
      w.g.updateMatrixWorld();
      m4.makeTranslation(w.x, w.y, w.z).premultiply(w.g.matrixWorld);
      im.setMatrixAt(i, m4);
    });
    im.count = list.length;
    ground.add(im);
  };
  inst(frames, new THREE.BoxGeometry(0.74, 1.02, 0.05), flat(0xf6f1ea));
  inst(
    wins.filter((w) => !w.lit),
    new THREE.BoxGeometry(0.6, 0.86, 0.06),
    flat(0x4f6890, { roughness: 0.1, metalness: 0.4 }),
  );
  inst(
    wins.filter((w) => w.lit),
    new THREE.BoxGeometry(0.6, 0.86, 0.06),
    flat(0xffd78a, { emissive: 0xffb84d, emissiveIntensity: 0.7 }),
  );
  // church: tower with a green copper spire behind the roofs
  const ch = new THREE.Group();
  const stoneC = flat(0xe8dcc8);
  const tower = F(new THREE.BoxGeometry(3.2, 20, 3.2), stoneC, 0.03, 11);
  tower.position.y = 10;
  ch.add(tower);
  const spire = F(new THREE.ConeGeometry(2.3, 9, 8), flat(0x6fae96, { roughness: 0.5 }), 0.06, 12);
  spire.position.y = 24.5;
  ch.add(spire);
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 8, 6),
    flat(0xffd23f, { metalness: 0.7, roughness: 0.25 }),
  );
  ball.position.y = 29.2;
  ch.add(ball);
  const clock = new THREE.Mesh(new THREE.CircleGeometry(0.9, 16), flat(0xf8f4ea));
  clock.position.set(0, 16.5, 1.62);
  ch.add(clock);
  ch.position.set(10, 0, FAR - 20);
  ground.add(ch);
}

// ---------------------------------------------------------------- near ring
place(bench(0x6b4a33), 10.5, NEAR + 1.5, 0);
place(bench(0x6b4a33), -11.5, NEAR + 1.6, 0);
place(bin(0x2f5a46), 12.4, NEAR + 1.2);
place(bin(0x2f5a46), -7.4, NEAR + 1.0);
for (const x of [-18, -4.5, 7.5, 21]) place(lamp({ on: true, h: 3.4 }), x, NEAR + 0.9);
place(bike(0xffd23f), 13.8, NEAR + 1.6, 0.25);
// drinking fountain (Trinkbrunnen) — green cast iron column with a bowl
{
  const iron = flat(0x2f6b52, { roughness: 0.4, metalness: 0.4 });
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 0.25, 10), iron);
  base.position.y = 0.12;
  const col1 = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 1.25, 10), iron);
  col1.position.y = 0.85;
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.22, 0.2, 12), iron);
  bowl.position.set(0, 0.7, 0.32);
  const top = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 6), iron);
  top.position.y = 1.55;
  g.add(base, col1, bowl, top);
  g.traverse((o) => o.isMesh && (o.castShadow = true));
  place(g, -14.5, 3.6, 0.9);
}
// fallen leaves on the promenade (instanced little flakes)
{
  const N = 260;
  const im = new THREE.InstancedMesh(
    new THREE.CircleGeometry(0.11, 5),
    flat(0xffffff, { side: THREE.DoubleSide, roughness: 0.8 }),
    N,
  );
  let n = 0;
  for (let i = 0; i < N * 4 && n < N; i++) {
    const x = -24 + r() * 48;
    const z = NEAR + 0.7 + r() * 16;
    if (Math.abs(x) < 3.5 && z < 4) continue; // keep the stage clean
    q.setFromEuler(new THREE.Euler(-PI / 2, 0, r() * 6));
    m4.compose(V(x, 0.045, z), q, V(1, 1, 1));
    im.setMatrixAt(n, m4);
    im.setColorAt(n, col.setHex([0xf2b134, 0xe8762c, 0xc9502a, 0xd99a2b][n % 4]));
    n++;
  }
  im.count = n;
  im.receiveShadow = true;
  ground.add(im);
}
// leaves falling from the trees (deterministic loops)
{
  const N = 40;
  const im = new THREE.InstancedMesh(
    new THREE.CircleGeometry(0.1, 5),
    flat(0xe8762c, { side: THREE.DoubleSide }),
    N,
  );
  im.frustumCulled = false;
  ground.add(im);
  const S = Array.from({ length: N }, (_, i) => {
    const tr = TREES[i % TREES.length].position;
    return [tr.x, tr.z, r() * 6, 0.3 + r() * 0.3];
  });
  S.forEach((_, i) => im.setColorAt(i, col.setHex([0xf2b134, 0xe8762c, 0xc9502a][i % 3])));
  onFrame((t) => {
    S.forEach(([x, z, ph, sp], i) => {
      const k = (t * sp * 0.25 + ph / 6) % 1;
      const y = 4.2 - k * 4.1;
      const px = x + Math.sin(t * 1.4 + ph) * 0.8 + k * 1.5;
      const pz = z + Math.cos(t * 1.1 + ph) * 0.6 + k * 0.8;
      q.setFromEuler(new THREE.Euler(t * 2 + ph, t * 1.3, ph));
      m4.compose(V(px, y, pz), q, V(1, 1, 1));
      im.setMatrixAt(i, m4);
    });
    im.instanceMatrix.needsUpdate = true;
  });
}
// a cyclist on the far bank cycle lane
{
  const g = new THREE.Group();
  const b = bike(0xe2453c);
  g.add(b);
  const jacket = flat(0x2fa8d8);
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.55, 3, 6), jacket);
  body.position.set(0.1, 1.35, 0);
  body.rotation.z = -0.35;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 6), flat(0xf1c09a));
  head.position.set(0.32, 1.85, 0);
  const helmet = new THREE.Mesh(
    new THREE.SphereGeometry(0.19, 8, 6, 0, PI * 2, 0, PI / 2),
    flat(0xffd23f),
  );
  helmet.position.copy(head.position).y += 0.03;
  g.add(body, head, helmet);
  g.traverse((o) => o.isMesh && (o.castShadow = true));
  ground.add(g);
  onFrame((t) => {
    const x = 40 - ((t * 3.2) % 80);
    g.position.set(x, 0, FAR - 1.6);
    g.rotation.y = PI;
  });
}

finishSet({ ground: GROUND });
export { sky, water };
