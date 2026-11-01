// #47 "Muskelkater": an alpine descent trail on a late, golden afternoon.
// The stage is a flight of timber-edged earth steps in the trail (the
// hiker walks down them towards the camera); behind it the slope climbs to
// a stone-and-timber hut with a flag on a ledge and on to a rocky summit
// with a golden Gipfelkreuz; in front the meadow drops away into a deep
// valley with a turquoise lake. Near ring: yellow trail signpost, cairns,
// dwarf pines, alpine flowers, a bench, a water trough, cows with bells.
// Life: grazing cows, chimney smoke, a fluttering flag, a cable-car
// gondola, birds, drifting clouds, trickling water.
import { THREE, flat, ground, onFrame, facet, facetMat, patches, noise2, rng } from "./world.js";
import {
  SKIES,
  setSky,
  finishSet,
  discGeo,
  pathStrip,
  pine,
  F,
  cloudPuffs,
} from "./environments.js";
import { place as placeFlat, cow, fence, flowerBed, bench, rock } from "./props.js";

// props stand on the slope: place() at the ground height of their spot
const place = (obj, x, z, rot = 0, s = 1) => placeFlat(obj, x, z, rot, s, height(x, z));

const SEED = 47;

// ---------------------------------------------------------------- light
// late afternoon in the Alps: clear blue zenith, a warm golden haze at the
// horizon, low sun behind-left (rim on the hiker), warm key from the front
const sky = setSky({
  ...SKIES.mittag,
  top: [0.2, 0.44, 0.84],
  mid: [0.56, 0.72, 0.94],
  hor: [1.0, 0.86, 0.62],
  below: [0.86, 0.82, 0.76],
  sun: [1.0, 0.85, 0.55],
  sunDir: [-0.7, 0.22, -1],
  cloud: [0xfffaf0, 0xffd9b0],
  hemi: [0xfff3e0, 0x6f7a6a, 1.4],
  key: [0xffe6c4, 2.8],
  keyPos: [7, 10, 9],
  rim: [0xffc890, 0.9],
  fog: [70, 260],
  clouds: 12,
});

// ---------------------------------------------------------------- stairs (the stage)
// Step 0 = top landing, steps 1..6 lead down towards +z, then the trail
// continues on the meadow. scene.js walks the hiker on these numbers.
export const STAIR = { top: 1.32, rise: 0.22, run: 0.7, z0: -2.8, n: 6, width: 1.9 };
// top of step j (j <= 0: the landing, j >= n: the meadow)
export const stepY = (j) => Math.max(0, STAIR.top - Math.max(0, j) * STAIR.rise);
// middle of step j along z
export const stepZ = (j) => STAIR.z0 + (j - 0.5) * STAIR.run;

// ---------------------------------------------------------------- relief
// a level shelf around the stage; behind (−z) the mountain climbs to the
// summit, the sides rise in ridges, in front (+z) the meadow falls away
// into the valley with the lake
const SUMMIT = [-14, -92];
// the meadow slope the stairs are cut into: top of the stairs (z ≈ −3) up
// to the shelf behind, down to the meadow in front (z ≈ 1.4)
const slope = (z) => STAIR.top * Math.min(1, Math.max(0, (1.4 - z) / 4.2));
export function height(x, z) {
  return slope(z) + mountains(x, z);
}
function mountains(x, z) {
  const d = Math.hypot(x, z);
  if (d < 13) return 0;
  const n = noise2(x * 0.03, z * 0.03, SEED) * 0.7 + noise2(x * 0.07, z * 0.07, SEED + 3) * 0.3;
  let h = 0;
  if (z < 0) {
    // the mountain behind: rises with distance, crests from the ridge noise
    const rise = Math.min(1, Math.max(0, d - 30) / 80);
    const ridge = 1 - Math.abs(noise2(x * 0.04, z * 0.04, SEED + 5) * 2 - 1);
    h = rise * rise * (10 + 34 * n) + rise * 10 * ridge;
  }
  // side ridges
  const side = Math.max(0, Math.abs(x) - 34) / 50;
  h = Math.max(h, side * side * (40 + 30 * n));
  // valley in front: falls away beyond z ≈ 16, bottom ≈ −34
  if (z > 14 && Math.abs(x) < 70) {
    const fall = Math.min(1, (z - 14) / 36);
    const drop = fall * fall * (3 - 2 * fall) * 34 * (1 - Math.min(1, side * 1.4));
    h -= drop;
  }
  // the summit: a steep, slightly twisted pyramid
  const sx = x - SUMMIT[0];
  const sz = z - SUMMIT[1];
  const sd = Math.hypot(sx, sz) * (1 + 0.18 * Math.sin(Math.atan2(sz, sx) * 3 + 1.1));
  h = Math.max(h, 74 - sd * 1.6);
  return h;
}

{
  const geo = facet(
    discGeo(200, 3.4, SEED, (x, z) =>
      Math.abs(x) < 15 && z > -11 && z < 3 ? mountains(x, z) : height(x, z) - 0.25,
    ),
    0.05,
    SEED,
  );
  // paint by height: valley floor → meadow → dwarf-pine green → rock → snow
  const p = geo.attributes.position;
  const c = geo.attributes.color;
  const col = new THREE.Color();
  const GRASS = new THREE.Color(0x8fbf55);
  const GRASS2 = new THREE.Color(0x6aa046);
  const DRY = new THREE.Color(0xb9b46a);
  const ROCK = new THREE.Color(0x8f8378);
  const ROCK2 = new THREE.Color(0x6e6460);
  const SNOW = new THREE.Color(0xf6f4fb);
  for (let i = 0; i + 2 < p.count; i += 3) {
    const x = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3;
    const y = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3;
    const z = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3;
    const wob = (noise2(x * 0.06, z * 0.06, SEED + 9) - 0.5) * 8;
    if (y < 16 + wob) {
      col.copy(GRASS).lerp(GRASS2, noise2(x * 0.12, z * 0.12, 4) * 0.8);
      col.lerp(DRY, Math.max(0, noise2(x * 0.2, z * 0.2, 7) - 0.62) * 1.6);
    } else if (y < 38 + wob * 2) col.copy(ROCK).lerp(ROCK2, noise2(x * 0.3, z * 0.3, 2));
    else col.copy(SNOW).lerp(ROCK, y < 42 + wob ? 0.3 : 0);
    for (let j = 0; j < 3; j++) {
      c.setXYZ(i + j, c.getX(i + j) * col.r, c.getY(i + j) * col.g, c.getZ(i + j) * col.b);
    }
  }
  patches(geo, { amt: 0.07, scale: 0.09, seed: SEED, warm: 0.45 });
  const m = new THREE.Mesh(geo, facetMat(flat(0xffffff, { roughness: 0.92 })));
  m.receiveShadow = true;
  ground.add(m);
}

// ---------------------------------------------------------------- lake in the valley
{
  const geo = discGeo(30, 2.4, SEED + 2);
  const lake = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({
      color: 0x3fc1c9,
      roughness: 0.08,
      metalness: 0.1,
      flatShading: true,
    }),
  );
  lake.scale.set(1.6, 1, 0.8);
  lake.position.set(6, -30.5, 66);
  lake.receiveShadow = true;
  ground.add(lake);
  onFrame((t) => (lake.position.y = -30.5 + Math.sin(t * 0.6) * 0.04));
}

// ---------------------------------------------------------------- the trail
const TRAIL = 0xc9ab7c;
pathStrip(
  [
    [6, -34],
    [3.5, -20],
    [0.8, -10],
    [0, -4.6],
  ],
  { width: 1.9, color: TRAIL, seed: SEED, lift: 0.03 },
);
pathStrip(
  [
    [0, 1.4],
    [0.3, 6],
    [-2.5, 13],
    [-7, 19],
  ],
  { width: 1.9, color: TRAIL, seed: SEED + 1, lift: 0.03 },
);

// the stairs: earth steps with a timber beam on every front edge, stakes,
// and grassy banks on both sides
{
  const earth = flat(TRAIL, { roughness: 0.95 });
  const timber = flat(0x7a5232, { roughness: 0.8 });
  const timber2 = flat(0x5e3d24, { roughness: 0.8 });
  const W = STAIR.width;
  // the landing (step 0) reaches back onto the uphill trail
  const land = F(new THREE.BoxGeometry(W, STAIR.top, 2.2, 3, 1, 3), earth, 0.06, 3);
  land.position.set(0, STAIR.top / 2, STAIR.z0 - 1.1);
  land.receiveShadow = true;
  ground.add(land);
  for (let j = 1; j <= STAIR.n; j++) {
    const y = stepY(j);
    const z = stepZ(j);
    if (y > 0.001) {
      const b = F(new THREE.BoxGeometry(W, y, STAIR.run, 3, 1, 1), earth, 0.07, 10 + j);
      b.position.set(0, y / 2, z);
      b.receiveShadow = true;
      b.castShadow = true;
      ground.add(b);
    }
    // timber beam on the front edge of the step above
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, W + 0.2, 7),
      j % 2 ? timber : timber2,
    );
    beam.rotation.z = Math.PI / 2;
    beam.position.set(0, stepY(j - 1) - 0.07, z - STAIR.run / 2 + 0.02);
    beam.castShadow = true;
    ground.add(beam);
    for (const sx of [-1, 1]) {
      const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.38, 5), timber2);
      stake.position.set(sx * (W / 2 + 0.06), stepY(j - 1) - 0.08, z - STAIR.run / 2 + 0.12);
      ground.add(stake);
    }
  }
}
// a finer copy of the ground around the stairs (the coarse terrain can't
// follow the slope), with a notch where the steps sit
{
  const W = STAIR.width;
  const g = new THREE.PlaneGeometry(34, 18, 96, 52);
  g.rotateX(-Math.PI / 2);
  const pp = g.attributes.position;
  for (let i = 0; i < pp.count; i++) {
    const x = pp.getX(i);
    const z = pp.getZ(i) - 4;
    pp.setZ(i, z);
    let y = height(x, z) + 0.015;
    if (Math.abs(x) < W / 2 + 0.05 && z > STAIR.z0 - 2.2 && z < stepZ(STAIR.n) + 0.4) y = 0;
    pp.setY(i, y);
  }
  g.computeVertexNormals();
  const geo = patches(facet(g.toNonIndexed(), 0.05, SEED + 7), {
    amt: 0.1,
    scale: 0.14,
    seed: SEED + 7,
    warm: 0.4,
  });
  const m = new THREE.Mesh(geo, facetMat(flat(0x8fbf55, { roughness: 0.92 })));
  m.receiveShadow = true;
  ground.add(m);
}

// ---------------------------------------------------------------- near ring
// yellow trail signpost (Wegweiser) with arrow boards
function canvasTex(w, h, draw) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  draw(cv.getContext("2d"), w, h);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
function signpost() {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 2.8, 8), flat(0x9aa0a8));
  pole.position.y = 1.4;
  g.add(pole);
  const boards = [
    ["Hütte", "0:20 h", 0.3],
    ["Gipfel", "1:15 h", -0.5],
    ["Tal", "1:40 h", 2.7],
  ];
  boards.forEach(([a, b, rot], i) => {
    const tex = canvasTex(512, 128, (c, w, h) => {
      c.fillStyle = "#f4c21a";
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(w - 70, 0);
      c.lineTo(w, h / 2);
      c.lineTo(w - 70, h);
      c.lineTo(0, h);
      c.closePath();
      c.fill();
      c.fillStyle = "#1c1c22";
      c.font = "800 54px Montserrat, sans-serif";
      c.fillText(a, 26, 84);
      c.font = "700 44px Montserrat, sans-serif";
      c.fillText(b, 270, 82);
    });
    const m = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.32, 0.05), [
      flat(0xf4c21a),
      flat(0xf4c21a),
      flat(0xf4c21a),
      flat(0xf4c21a),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }),
    ]);
    m.geometry.translate(0.62, 0, 0);
    m.position.y = 2.45 - i * 0.4;
    m.rotation.y = rot;
    m.castShadow = true;
    g.add(m);
  });
  return g;
}
place(signpost(), -3.4, -6.2, 0.4);

// cairns (Steinmännchen)
function cairn(seed, n = 5) {
  const g = new THREE.Group();
  const r = rng(seed);
  let y = 0;
  for (let i = 0; i < n; i++) {
    const s = 0.34 - i * 0.05 + r() * 0.04;
    const m = F(
      new THREE.DodecahedronGeometry(s, 0),
      flat(i % 2 ? 0xa59b92 : 0x8c837c),
      0.1,
      seed + i,
    );
    m.scale.y = 0.55;
    y += s * 0.5;
    m.position.set((r() - 0.5) * 0.06, y, (r() - 0.5) * 0.06);
    m.rotation.y = r() * 3;
    m.castShadow = true;
    g.add(m);
    y += s * 0.45;
  }
  return g;
}
place(cairn(3, 6), 3.6, -6.6);
place(cairn(8, 4), 7.6, 4.4, 0, 0.9);
place(cairn(11, 5), -8.4, -1.5, 0, 1.1);

// dwarf pines (Latschen): low, wide, dark
function latsche(seed) {
  const g = new THREE.Group();
  const r = rng(seed);
  for (let k = 0; k < 5; k++) {
    const m = F(
      new THREE.IcosahedronGeometry(0.55 + r() * 0.3, 0),
      flat(k % 2 ? 0x2f6b40 : 0x3b7d4c),
      0.1,
      seed + k,
    );
    m.scale.y = 0.55;
    m.position.set((r() - 0.5) * 1.6, 0.3 + r() * 0.2, (r() - 0.5) * 1.2);
    m.castShadow = true;
    g.add(m);
  }
  return g;
}
[
  [-6.8, -4.6],
  [7.4, -3.8],
  [-9.5, 3.2],
  [10.4, 1.2],
  [-12, -7],
  [12.5, -8.5],
  [-5.5, 8.5],
  [9, 9.5],
].forEach(([x, z], i) => place(latsche(SEED + i * 3), x, z, i));

// alpine flowers: enzian blue, edelweiss white, alpine rose pink
place(flowerBed(SEED, [0x2f5bff, 0x4f7bff, 0xffffff]), -7.2, 3.9, 0.3, 0.7);
place(flowerBed(SEED + 2, [0xff6fa8, 0xffffff, 0xffd84a]), 7.1, 2.6, 0.9, 0.7);
place(flowerBed(SEED + 4, [0xffffff, 0x2f5bff]), 6.8, -5.8, 0.2, 0.6);
place(flowerBed(SEED + 6, [0xff6fa8, 0x2f5bff]), -7.4, 6.2, 0.6, 0.7);

place(bench(0x8a5a30), 5.2, -7.2, -0.3);
place(rock(SEED, 0.9), -10.5, -10);
place(rock(SEED + 1, 1.2), 14, -4);
place(rock(SEED + 2, 0.7), -13.5, 5.5);
place(rock(SEED + 3, 0.6), 8.6, 6.8);

// water trough (Brunnen) with a trickle from a wooden pipe
{
  const g = new THREE.Group();
  const trunk = F(new THREE.BoxGeometry(2.2, 0.6, 0.8), flat(0x7a5232), 0.07, 5);
  trunk.position.y = 0.3;
  g.add(trunk);
  const water = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.04, 0.6),
    new THREE.MeshStandardMaterial({ color: 0x5fc4e0, roughness: 0.05 }),
  );
  water.position.y = 0.56;
  g.add(water);
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.3, 0.2), flat(0x5e3d24));
  post.position.set(-0.85, 0.65, -0.45);
  g.add(post);
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 6), flat(0x5e3d24));
  pipe.rotation.x = Math.PI / 2;
  pipe.position.set(-0.85, 1.15, -0.2);
  g.add(pipe);
  const drops = [];
  const dropMat = new THREE.MeshStandardMaterial({ color: 0xbfeeff, roughness: 0.05 });
  for (let i = 0; i < 6; i++) {
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 4), dropMat);
    g.add(d);
    drops.push(d);
  }
  onFrame((t) =>
    drops.forEach((d, i) => {
      const ph = (t * 1.6 + i / 6) % 1;
      d.position.set(-0.85, 1.12 - ph * ph * 0.56, 0.06);
    }),
  );
  g.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  place(g, -9.2, -4.2, 0.5);
}

// cows with bells, grazing (heads bob slowly)
{
  const bellMat = flat(0xd9a93a, { metalness: 0.7, roughness: 0.3 });
  const strap = flat(0xb0182b);
  [
    [-11, 7.5, 0.7, 1],
    [-14.5, 2.5, -0.4, 2],
    [12.5, -1.5, 2.4, 3],
    [15.5, 5.5, 2.9, 4],
  ].forEach(([x, z, r, s]) => {
    const c = cow(s);
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.11, 0.18, 8), bellMat);
    bell.position.set(0.82, 0.78, 0);
    c.add(bell);
    const st = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 4, 12), strap);
    st.rotation.y = Math.PI / 2;
    st.position.set(0.82, 0.95, 0);
    c.add(st);
    place(c, x, z, r);
    onFrame((t) => (c.rotation.z = Math.sin(t * 0.9 + s * 1.7) * 0.025));
  });
  place(fence(8, 0x8a5a30), -12.5, 10.5, 0.2);
  place(fence(6, 0x8a5a30), 14.5, 8.5, -0.5);
}

// ---------------------------------------------------------------- hero piece: the hut on its ledge
function hut(seed = 1) {
  const g = new THREE.Group();
  const stone = F(new THREE.BoxGeometry(5.2, 1.6, 3.8, 3, 1, 2), flat(0xd6cfc2), 0.07, seed);
  stone.position.y = 0.8;
  g.add(stone);
  const wood = F(new THREE.BoxGeometry(5.2, 1.9, 3.8, 3, 1, 2), flat(0x8a5632), 0.07, seed + 1);
  wood.position.y = 2.55;
  g.add(wood);
  const shape = new THREE.Shape();
  shape.moveTo(-3.1, 0);
  shape.lineTo(0, 1.5);
  shape.lineTo(3.1, 0);
  shape.lineTo(-3.1, 0);
  const roof = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: 4.6, bevelEnabled: false }),
    flat(0x4f3626),
  );
  roof.position.set(0, 3.5, -2.3);
  g.add(roof);
  // stones on the shingle roof
  for (let i = 0; i < 6; i++) {
    const s = F(new THREE.DodecahedronGeometry(0.22, 0), flat(0x9a948c), 0.1, i);
    s.position.set(-2.2 + i * 0.85, 3.5 + 1.5 * (1 - Math.abs(-2.2 + i * 0.85) / 3.1), 0.8);
    g.add(s);
  }
  // balcony with geraniums
  const bal = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.4, 0.55), flat(0x6e4325));
  bal.position.set(0, 2.1, 2.1);
  g.add(bal);
  const red = flat(0xe8343a, { roughness: 0.7 });
  for (let k = 0; k < 10; k++) {
    const f = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18, 0), red);
    f.position.set(-2.3 + k * 0.51, 2.42, 2.2);
    g.add(f);
  }
  const winMat = flat(0xffe3a8, { emissive: 0xffb04d, emissiveIntensity: 0.35 });
  for (const x of [-1.5, 0, 1.5]) {
    const w = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.05), winMat);
    w.position.set(x, 0.85, 1.92);
    g.add(w);
    for (const sx of [-1, 1]) {
      const sh = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.66, 0.05), flat(0x2f7a4a));
      sh.position.set(x + sx * 0.5, 0.85, 1.93);
      g.add(sh);
    }
  }
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.3, 0.05), flat(0x5e3d24));
  door.position.set(2.2, 0.65, 1.92);
  g.add(door);
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.2, 0.5), flat(0x9a948c));
  chimney.position.set(1.3, 4.6, -0.6);
  g.add(chimney);
  // terrace with two tables and red-white parasol
  const deck = F(new THREE.BoxGeometry(5.2, 0.2, 2.2), flat(0xa77a4a), 0.06, seed + 3);
  deck.position.set(0, 0.1, 3.2);
  g.add(deck);
  for (const x of [-1.4, 1.2]) {
    const tbl = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.6), flat(0x8a5632));
    tbl.position.set(x, 0.8, 3.3);
    g.add(tbl);
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.7, 0.1), flat(0x5e3d24));
    leg.position.set(x, 0.45, 3.3);
    g.add(leg);
  }
  g.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  g.scale.setScalar(seed === 1 ? 1 : 0.8);
  return g;
}
const HUT = [8.5, -20];
{
  // a small levelled ledge under the hut
  const hy = height(HUT[0], HUT[1]);
  const ledge = F(new THREE.CylinderGeometry(5.6, 6.4, 2, 9), flat(0x86b852), 0.06, 4);
  ledge.position.set(HUT[0], hy - 0.95, HUT[1] + 1);
  ledge.receiveShadow = true;
  ground.add(ledge);
  const h = hut(1);
  h.position.set(HUT[0], hy + 0.05, HUT[1]);
  h.rotation.y = -0.35;
  ground.add(h);

  // flag pole with a red-white-red flag that flutters
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 5.5, 6), flat(0xe8e4dc));
  pole.position.set(HUT[0] - 4.2, hy + 2.75, HUT[1] + 2.4);
  ground.add(pole);
  const fgeo = new THREE.PlaneGeometry(1.8, 1.1, 8, 3);
  const fc = [];
  const fp = fgeo.attributes.position;
  for (let i = 0; i < fp.count; i++) {
    const y = fp.getY(i);
    const c = new THREE.Color(Math.abs(y) < 0.18 ? 0xffffff : 0xe0242c);
    fc.push(c.r, c.g, c.b);
  }
  fgeo.setAttribute("color", new THREE.Float32BufferAttribute(fc, 3));
  const base = Float32Array.from(fp.array);
  const flag = new THREE.Mesh(
    fgeo,
    new THREE.MeshStandardMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      flatShading: true,
      roughness: 0.7,
    }),
  );
  flag.geometry.translate(0.9, 0, 0);
  for (let i = 0; i < fp.count; i++) base[i * 3] += 0.9;
  flag.position.set(HUT[0] - 4.15, hy + 4.8, HUT[1] + 2.4);
  flag.rotation.y = 0.5;
  ground.add(flag);
  onFrame((t) => {
    for (let i = 0; i < fp.count; i++) {
      const x = base[i * 3];
      fp.setZ(i, Math.sin(x * 3.2 - t * 6) * 0.12 * x);
    }
    fp.needsUpdate = true;
    fgeo.computeVertexNormals();
  });

  // chimney smoke
  const mat = new THREE.MeshStandardMaterial({
    color: 0xeeeaf0,
    transparent: true,
    opacity: 0.5,
    roughness: 1,
    flatShading: true,
    depthWrite: false,
  });
  const puffs = [];
  for (let i = 0; i < 7; i++) {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.35, 0), mat);
    ground.add(m);
    puffs.push(m);
  }
  const chim = new THREE.Vector3(1.3, 5.3, -0.6).applyAxisAngle(new THREE.Vector3(0, 1, 0), -0.35);
  onFrame((t) =>
    puffs.forEach((m, i) => {
      const ph = (t * 0.2 + i / 7) % 1;
      m.position.set(HUT[0] + chim.x + ph * 2.2, hy + chim.y + ph * 3.6, HUT[1] + chim.z - ph);
      m.scale.setScalar(0.4 + ph * 1.8);
    }),
  );
}

// a second, smaller hut far down the valley side
{
  const h = hut(2);
  const x = -38;
  const z = 30;
  h.position.set(x, height(x, z), z);
  h.rotation.y = 0.9;
  ground.add(h);
}

// ---------------------------------------------------------------- the summit with its golden cross
{
  const sy = 74;
  const cross = new THREE.Group();
  const gold = flat(0xe0b040, { metalness: 0.75, roughness: 0.28 });
  const v = new THREE.Mesh(new THREE.BoxGeometry(0.7, 8, 0.7), gold);
  v.position.y = 4;
  cross.add(v);
  const hbar = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.7, 0.7), gold);
  hbar.position.y = 5.8;
  cross.add(hbar);
  cross.position.set(SUMMIT[0], sy - 1.5, SUMMIT[1]);
  cross.rotation.y = 0.3;
  ground.add(cross);
}

// ---------------------------------------------------------------- pines on the lower slopes
{
  const r = rng(SEED + 11);
  let n = 0;
  for (let i = 0; i < 900 && n < 110; i++) {
    const a = r() * Math.PI * 2;
    const d = 26 + r() * 64;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    const y = height(x, z);
    if (y > 14 || y < -30) continue; // tree line / lake
    if (z < 0 && Math.abs(x) < 30) continue; // keep the view to the hut and summit open
    if (Math.abs(x - HUT[0]) < 8 && Math.abs(z - HUT[1]) < 8) continue;
    if (Math.abs(x - 3) < 3 && z < -8 && z > -36) continue; // the uphill trail
    const g = pine(x, z, 1.5 + r() * 1.4, SEED + i, false);
    g.position.y = y - 0.2;
    n++;
  }
}

// ---------------------------------------------------------------- cable car on the right slope
{
  const A = new THREE.Vector3(30, height(30, -6) + 1, -6);
  const B = new THREE.Vector3(48, height(48, -62) + 4, -62);
  const cableMat = flat(0x2b2b30);
  const pts = [];
  for (let k = 0; k <= 30; k++) {
    const f = k / 30;
    const p = A.clone().lerp(B, f);
    p.y += 3 - Math.sin(f * Math.PI) * 3;
    pts.push(p);
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  for (const dx of [-0.35, 0.35]) {
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 60, 0.05, 4), cableMat);
    tube.position.x = dx;
    ground.add(tube);
  }
  for (const P of [A, B]) {
    const station = F(new THREE.BoxGeometry(3, 2.6, 2.6), flat(0xe8e1d4), 0.05, 4);
    station.position.set(P.x, P.y + 1.4, P.z);
    station.castShadow = true;
    ground.add(station);
  }
  const gondola = new THREE.Group();
  const cabin = F(
    new THREE.BoxGeometry(1.5, 1.2, 1.3),
    flat(0xe8302a, { roughness: 0.4 }),
    0.05,
    6,
  );
  cabin.position.y = -1.3;
  gondola.add(cabin);
  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(1.52, 0.45, 1.32),
    flat(0xbfe6ff, { roughness: 0.15 }),
  );
  glass.position.y = -1.1;
  gondola.add(glass);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.0, 0.08), cableMat);
  arm.position.y = -0.4;
  gondola.add(arm);
  ground.add(gondola);
  onFrame((t) => {
    const f = 0.12 + 0.76 * (0.5 - 0.5 * Math.cos(t * 0.06));
    gondola.position.copy(curve.getPointAt(f));
    gondola.position.y += 3;
    gondola.rotation.z = Math.sin(t * 1.3) * 0.03;
  });
}

// ---------------------------------------------------------------- clouds between the peaks
{
  const mat = facetMat(
    new THREE.MeshStandardMaterial({
      color: 0xfffaf2,
      emissive: 0xffd9b8,
      emissiveIntensity: 0.28,
      roughness: 1,
      flatShading: true,
    }),
  );
  const groups = [];
  [
    [-44, 40, -70, 4.0],
    [30, 44, -80, 4.4],
    [-70, 36, -10, 3.6],
    [64, 30, -30, 3.8],
    [-30, 10, 70, 3.4],
    [40, 6, 80, 3.6],
  ].forEach(([x, y, z, s], i) => {
    const g = new THREE.Group();
    cloudPuffs(g, 5, s, mat, SEED + i * 5);
    g.position.set(x, y, z);
    g.lookAt(0, y, 0);
    ground.add(g);
    groups.push({ g, x, i });
  });
  onFrame((t) => groups.forEach((c) => (c.g.position.x = c.x + Math.sin(t * 0.05 + c.i) * 3)));
}

finishSet({ ground: 0x8fbf55 });
export { sky };
