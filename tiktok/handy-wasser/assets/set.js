// Set of #41 "Handy ins Wasser": an old-building bathroom on a Sunday
// evening, 19:40. A claw-foot tub full of foam stands at the origin (rim
// top = 0); above it a tall window looks out over Vienna's rooftops in the
// last pink-orange dusk (the hero piece: roofs, chimneys and a church dome).
// Mint subway tiles, a dusty-rose wall, a black-and-white tiled floor, a
// chrome towel ladder, a pedestal sink with a round mirror, a monstera, a
// wooden bench with a folded towel (left, where the phone dries) and a
// stool (right, where the rice bowl stands). Life: candle flames on the
// sill, steam over the water, dust in the window light, a dripping tap,
// pigeons over the roofs. The tub, water, foam, phone and rice are built
// in scene.js; the macro lab (MAC) lives far below the floor.
import { THREE, flat, ground, onFrame, rng, M, patches, facet, facetMat } from "./world.js";
import { SKIES, setSky, finishSet, F, cloudPuffs } from "./environments.js";

const SEED = 41;
const r = rng(SEED);
export const FLOOR = -3.4; // bathroom floor (tub rim top = 0)
export const CEIL = 9.4;
export const WZ = -2.7; // back wall
export const BENCH = [-6.3, -0.55, 0.7]; // top of the folded towel (phone dries here)
export const STOOL = [6.3, -0.75, 0.9]; // top of the stool (the rice bowl stands here)
export const SOCKET = [-4.6, 0.9, WZ + 0.2]; // wall socket for the charging cable

// ---------------------------------------------------------------- light
// dusk: violet zenith, a hot pink-orange band low over the roofs; inside,
// the warm pendant and the candles carry the room
const sky = setSky({
  ...SKIES.sonnenuntergang,
  top: [0.24, 0.2, 0.52],
  mid: [0.72, 0.42, 0.66],
  hor: [1.0, 0.58, 0.38],
  below: [0.42, 0.3, 0.42],
  sunDir: [0.1, 0.06, -1],
  clouds: 7,
  birds: false,
  stars: 0.12,
  hemi: [0xf2f0ff, 0x4a4a58, 1.0],
  key: [0xffe0c4, 1.4],
  keyPos: [5, 12, 9],
  rim: [0xffb0cc, 0.6],
  fog: [40, 140],
  nightWindows: true,
});

// ---------------------------------------------------------------- helpers
const white = flat(0xf6f1ea, { roughness: 0.5 });
const box = (w, h, d, mat, x, y, z, amt = 0.04, seed = 1, shadow = true) => {
  const m = F(new THREE.BoxGeometry(w, h, d), mat, amt, seed);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  ground.add(m);
  return m;
};
const cyl = (rt, rb, h, seg, mat, x, y, z, amt = 0.05, seed = 1, shadow = true) => {
  const m = F(new THREE.CylinderGeometry(rt, rb, h, seg), mat, amt, seed);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  ground.add(m);
  return m;
};
const tiles = (list, size, base, spread, z, rough = 0.25) => {
  const t = new THREE.InstancedMesh(
    new THREE.BoxGeometry(...size),
    flat(0xffffff, { roughness: rough }),
    list.length,
  );
  const m = new THREE.Matrix4();
  const c = new THREE.Color();
  const b = new THREE.Color(base);
  list.forEach(([x, y], i) => {
    m.makeTranslation(x, y, z);
    t.setMatrixAt(i, m);
    t.setColorAt(i, c.copy(b).multiplyScalar(1 - spread / 2 + r() * spread));
  });
  t.receiveShadow = true;
  ground.add(t);
  return t;
};

// ---------------------------------------------------------------- floor
{
  // black-and-white checker tiles, each a touch different
  const list = [];
  const cols = [];
  for (let x = -12; x < 26; x += 1.1)
    for (let z = -2.6; z < 26; z += 1.1) {
      list.push([x, z]);
      cols.push((Math.round(x / 1.1) + Math.round(z / 1.1)) % 2 ? 0x24262c : 0xefe9de);
    }
  const tile = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1.07, 0.1, 1.07),
    flat(0xffffff, { roughness: 0.35 }),
    list.length,
  );
  const m4 = new THREE.Matrix4();
  const col = new THREE.Color();
  list.forEach(([x, z], i) => {
    m4.makeTranslation(x, FLOOR - 0.05, z);
    tile.setMatrixAt(i, m4);
    tile.setColorAt(i, col.set(cols[i]).multiplyScalar(0.9 + r() * 0.16));
  });
  tile.receiveShadow = true;
  ground.add(tile);
  box(60, 0.1, 40, flat(0x3a3a40), 6, FLOOR - 0.12, 10, 0, 1, false);
  // a soft pink bath mat in front of the tub
  const mat = box(
    5.2,
    0.08,
    2.2,
    flat(0xf2a7b8, { roughness: 1 }),
    0.3,
    FLOOR + 0.04,
    3.4,
    0.08,
    7,
  );
  mat.castShadow = false;
  for (let k = 0; k < 9; k++)
    box(
      0.12,
      0.09,
      2.3,
      flat(0xffd0da, { roughness: 1 }),
      -1.9 + k * 0.55,
      FLOOR + 0.05,
      3.4,
      0.04,
      8 + k,
      false,
    );
}

// ---------------------------------------------------------------- walls + window
const wallMat = flat(0xd8a7a0, { roughness: 0.9 });
const WX0 = -3.4;
const WX1 = 3.4;
const WY0 = 2.3;
const WY1 = 8.0;
{
  // back wall with the window opening
  box(
    WX0 + 14,
    CEIL - FLOOR,
    0.4,
    wallMat,
    (-14 + WX0) / 2,
    (FLOOR + CEIL) / 2,
    WZ - 0.2,
    0.02,
    21,
    false,
  );
  box(
    26 - WX1,
    CEIL - FLOOR,
    0.4,
    wallMat,
    (WX1 + 26) / 2,
    (FLOOR + CEIL) / 2,
    WZ - 0.2,
    0.02,
    22,
    false,
  );
  box(WX1 - WX0, WY0 - FLOOR, 0.4, wallMat, 0, (FLOOR + WY0) / 2, WZ - 0.2, 0.02, 23, false);
  box(WX1 - WX0, CEIL - WY1, 0.4, wallMat, 0, (WY1 + CEIL) / 2, WZ - 0.2, 0.02, 24, false);
  // mint subway tiles up to y = 1.8 along the back wall, a white trim on top
  const list = [];
  for (let y = FLOOR + 0.22; y < 1.8; y += 0.46)
    for (let x = -13.5 + (Math.round((y - FLOOR) / 0.46) % 2) * 0.48; x < 14; x += 0.96)
      list.push([x, y]);
  tiles(list, [0.92, 0.42, 0.08], 0x8fd3c1, 0.2, WZ + 0.04);
  box(28, 0.16, 0.2, white, 0, 1.9, WZ + 0.06, 0, 1, false);
  // left wall (tiled too) and the ceiling with a cornice
  box(0.4, CEIL - FLOOR, 30, wallMat, -12.2, (FLOOR + CEIL) / 2, 12, 0.02, 25, false);
  const side = [];
  for (let y = FLOOR + 0.22; y < 1.8; y += 0.46)
    for (let z = WZ + 0.5 + (Math.round((y - FLOOR) / 0.46) % 2) * 0.48; z < 24; z += 0.96)
      side.push([z, y]);
  {
    const t = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.08, 0.42, 0.92),
      flat(0xffffff, { roughness: 0.25 }),
      side.length,
    );
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    const b = new THREE.Color(0x8fd3c1);
    side.forEach(([z, y], i) => {
      m.makeTranslation(-11.96, y, z);
      t.setMatrixAt(i, m);
      t.setColorAt(i, c.copy(b).multiplyScalar(0.9 + r() * 0.2));
    });
    t.receiveShadow = true;
    ground.add(t);
  }
  box(60, 0.4, 34, flat(0xf3ebe0), 6, CEIL + 0.2, 12, 0, 1, false);
  box(40, 0.3, 0.3, white, 6, CEIL - 0.15, WZ + 0.1, 0, 1, false);

  // the window: a deep white frame, glazing bars, a wide sill with candles
  const fr = (w, h, x, y, d = 0.55) => box(w, h, d, white, x, y, WZ - 0.1, 0.02, 1, false);
  fr(WX1 - WX0 + 0.9, 0.45, 0, WY1 + 0.2);
  fr(0.45, WY1 - WY0 + 0.6, WX0 - 0.2, (WY0 + WY1) / 2);
  fr(0.45, WY1 - WY0 + 0.6, WX1 + 0.2, (WY0 + WY1) / 2);
  fr(0.2, WY1 - WY0, 0, (WY0 + WY1) / 2, 0.32);
  fr(WX1 - WX0, 0.16, 0, 6.4, 0.32);
  box(WX1 - WX0 + 1.4, 0.24, 1.0, white, 0, WY0 - 0.08, WZ + 0.3, 0.02, 1);
  const pane = new THREE.Mesh(
    new THREE.PlaneGeometry(WX1 - WX0, WY1 - WY0),
    new THREE.MeshStandardMaterial({
      color: 0xffd8e8,
      roughness: 0.05,
      metalness: 0.2,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
    }),
  );
  pane.position.set(0, (WY0 + WY1) / 2, WZ - 0.2);
  pane.userData.noAO = true;
  ground.add(pane);
}

// the time-lapse veil just outside the window ("einen Tag warten"): scene.js
// drives its colour + opacity (night → sunrise) for one beat
export const windowVeil = new THREE.Mesh(
  new THREE.PlaneGeometry(WX1 - WX0 + 0.2, WY1 - WY0 + 0.2),
  new THREE.MeshBasicMaterial({
    color: 0x0b1030,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    fog: false,
  }),
);
windowVeil.position.set(0, (WY0 + WY1) / 2, WZ - 0.5);
windowVeil.userData.noAO = true;
ground.add(windowVeil);

// ---------------------------------------------------------------- candles on the sill
const flames = [];
{
  const wax = flat(0xfff3e0, { roughness: 0.6 });
  const fl = flat(0xffc04a, { emissive: 0xff8a20, emissiveIntensity: 2.2 });
  [
    [-2.4, 0.9],
    [-1.8, 0.6],
    [2.2, 0.75],
  ].forEach(([x, h], k) => {
    cyl(0.2, 0.2, h, 10, wax, x, WY0 + 0.04 + h / 2, WZ + 0.35, 0.04, 30 + k);
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.24, 7), fl);
    f.position.set(x, WY0 + 0.16 + h, WZ + 0.35);
    ground.add(f);
    flames.push(f);
  });
  const glow = new THREE.PointLight(0xffa04a, 9, 7, 1.6);
  glow.position.set(-1.2, WY0 + 1.4, WZ + 0.9);
  ground.add(glow);
  // a little succulent in a terracotta pot, a stack of folded washcloths
  cyl(0.3, 0.24, 0.42, 8, flat(0xc8704a), 1.2, WY0 + 0.25, WZ + 0.35, 0.05, 40);
  for (let j = 0; j < 7; j++) {
    const leaf = F(
      new THREE.ConeGeometry(0.09, 0.4, 5),
      flat(j % 2 ? 0x6fb38a : 0x89c79e),
      0.1,
      41 + j,
    );
    const a = (j / 7) * Math.PI * 2;
    leaf.position.set(1.2 + Math.cos(a) * 0.12, WY0 + 0.6, WZ + 0.35 + Math.sin(a) * 0.12);
    leaf.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5);
    ground.add(leaf);
  }
  for (let k = 0; k < 3; k++)
    box(
      0.9,
      0.16,
      0.6,
      flat([0xffffff, 0xf2a7b8, 0x8fd3c1][k], { roughness: 1 }),
      2.9,
      WY0 + 0.12 + k * 0.17,
      WZ + 0.35,
      0.05,
      50 + k,
    );
  onFrame((t) =>
    flames.forEach((f, k) => {
      f.scale.set(1, 1 + Math.sin(t * 11 + k * 2.1) * 0.12 + Math.sin(t * 23 + k) * 0.06, 1);
      f.rotation.z = Math.sin(t * 7 + k * 1.3) * 0.12;
    }),
  );
}

// ---------------------------------------------------------------- right side: pedestal sink + mirror + stool
{
  const porcelain = flat(0xfbf8f2, { roughness: 0.25 });
  cyl(0.45, 0.6, 2.6, 12, porcelain, 8.6, FLOOR + 1.3, WZ + 1.2, 0.03, 60);
  const basin = F(new THREE.CylinderGeometry(1.4, 1.0, 0.7, 16), porcelain, 0.03, 61);
  basin.scale.set(1, 1, 0.75);
  basin.position.set(8.6, FLOOR + 2.95, WZ + 1.15);
  basin.castShadow = basin.receiveShadow = true;
  ground.add(basin);
  // chrome tap with a drop that forms and falls (life)
  cyl(0.09, 0.09, 0.6, 8, M.chrome, 8.6, FLOOR + 3.55, WZ + 0.45, 0, 1);
  const spout = cyl(0.07, 0.07, 0.6, 8, M.chrome, 8.6, FLOOR + 3.82, WZ + 0.72, 0, 1);
  spout.rotation.x = Math.PI / 2;
  const drop = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 8, 6),
    new THREE.MeshStandardMaterial({ color: 0xcfeeff, roughness: 0.05, metalness: 0.2 }),
  );
  drop.userData.noAO = true;
  ground.add(drop);
  onFrame((t) => {
    const f = (t * 0.55) % 1;
    const y = f < 0.7 ? FLOOR + 3.74 : FLOOR + 3.74 - Math.pow((f - 0.7) / 0.3, 2) * 0.6;
    drop.position.set(8.6, y, WZ + 1.0);
    drop.scale.setScalar(f < 0.7 ? 0.4 + f * 0.9 : 1);
  });
  // round mirror with a brass rim, a wall lamp beside it
  const mirror = new THREE.Mesh(
    new THREE.CircleGeometry(1.5, 32),
    new THREE.MeshStandardMaterial({ color: 0xc8d6e6, roughness: 0.05, metalness: 0.9 }),
  );
  mirror.position.set(8.6, 3.4, WZ + 0.07);
  ground.add(mirror);
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(1.52, 0.1, 6, 32),
    flat(0xd9a441, { metalness: 0.7, roughness: 0.3 }),
  );
  rim.position.set(8.6, 3.4, WZ + 0.1);
  ground.add(rim);
  const sconce = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 10, 8),
    flat(0xfff3d6, { emissive: 0xffd09a, emissiveIntensity: 2.0 }),
  );
  sconce.position.set(10.6, 3.6, WZ + 0.4);
  ground.add(sconce);
  const sl = new THREE.PointLight(0xffc98a, 10, 10, 1.5);
  sl.position.set(10.3, 3.4, WZ + 1.2);
  ground.add(sl);
  // toothbrush cup and a soap bottle on the basin rim
  cyl(
    0.18,
    0.15,
    0.5,
    8,
    flat(0x8fd3c1, { roughness: 0.3 }),
    7.5,
    FLOOR + 3.55,
    WZ + 0.9,
    0.05,
    62,
  );
  for (const [dx, c] of [
    [-0.05, 0xff6f7d],
    [0.07, 0x4a7bd6],
  ]) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 5), flat(c));
    b.position.set(7.5 + dx, FLOOR + 3.85, WZ + 0.9);
    b.rotation.z = dx * 3;
    ground.add(b);
  }
  cyl(0.2, 0.22, 0.6, 8, flat(0xf2c440, { roughness: 0.3 }), 9.7, FLOOR + 3.6, WZ + 0.9, 0.05, 63);

  // the wooden stool for the rice bowl (top at STOOL)
  const oak = flat(0xc89a62, { roughness: 0.6 });
  const top = cyl(1.25, 1.25, 0.22, 14, oak, STOOL[0], STOOL[1] - 0.11, STOOL[2], 0.05, 64);
  top.castShadow = true;
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + 0.4;
    const leg = cyl(0.1, 0.12, STOOL[1] - FLOOR - 0.2, 6, flat(0xa8784a), 0, 0, 0, 0.05, 65 + k);
    leg.position.set(
      STOOL[0] + Math.cos(a) * 0.85,
      (STOOL[1] + FLOOR) / 2 - 0.1,
      STOOL[2] + Math.sin(a) * 0.85,
    );
    leg.rotation.set(Math.sin(a) * 0.12, 0, -Math.cos(a) * 0.12);
  }
  // laundry basket behind the stool
  const basket = cyl(
    1.1,
    0.9,
    2.0,
    12,
    flat(0xe8d2a8, { roughness: 0.9 }),
    10.0,
    FLOOR + 1.0,
    2.6,
    0.08,
    70,
  );
  basket.castShadow = true;
  box(1.4, 0.4, 1.1, flat(0x8fd3c1, { roughness: 1 }), 10.0, FLOOR + 2.1, 2.6, 0.1, 71).rotation.z =
    0.3;
}

// ---------------------------------------------------------------- left side: towel ladder, bench, plant
{
  // chrome towel ladder against the left wall, a striped towel over it
  for (const z of [-1.0, 1.4]) cyl(0.08, 0.08, 6.0, 8, M.chrome, -11.6, FLOOR + 3.2, z, 0, 1);
  for (let k = 0; k < 9; k++) {
    const rung = cyl(0.06, 0.06, 2.4, 6, M.chrome, -11.6, FLOOR + 1.0 + k * 0.6, 0.2, 0, 1);
    rung.rotation.x = Math.PI / 2;
  }
  box(0.5, 2.6, 2.2, flat(0xf2c440, { roughness: 1 }), -11.45, FLOOR + 4.1, 0.2, 0.08, 80);
  for (let k = 0; k < 4; k++)
    box(
      0.52,
      0.18,
      2.22,
      flat(0xffffff, { roughness: 1 }),
      -11.45,
      FLOOR + 3.1 + k * 0.6,
      0.2,
      0.04,
      81 + k,
      false,
    );

  // the wooden bench with a folded towel (the phone dries on it)
  const oak = flat(0xb9895a, { roughness: 0.6 });
  box(3.6, 0.24, 2.0, oak, BENCH[0], BENCH[1] - 0.62, BENCH[2], 0.05, 90);
  for (const dx of [-1.5, 1.5])
    for (const dz of [-0.75, 0.75])
      box(
        0.2,
        BENCH[1] - 0.74 - FLOOR,
        0.2,
        flat(0x8f6a42),
        BENCH[0] + dx,
        (BENCH[1] - 0.74 + FLOOR) / 2,
        BENCH[2] + dz,
        0.04,
        91,
      );
  box(3.2, 0.12, 1.6, oak, BENCH[0], FLOOR + 0.9, BENCH[2], 0.05, 92);
  const towel = flat(0xffffff, { roughness: 1 });
  const towelStripe = flat(0x8fd3c1, { roughness: 1 });
  for (let k = 0; k < 3; k++) {
    const t = box(
      2.6,
      0.16,
      1.7,
      towel,
      BENCH[0],
      BENCH[1] - 0.42 + k * 0.15,
      BENCH[2],
      0.08,
      93 + k,
    );
    t.castShadow = true;
  }
  box(2.62, 0.17, 0.25, towelStripe, BENCH[0], BENCH[1] - 0.12, BENCH[2] + 0.55, 0.05, 97);
  // rolled towels under the bench
  for (let k = 0; k < 3; k++) {
    const roll = cyl(
      0.35,
      0.35,
      1.4,
      10,
      flat([0xf2a7b8, 0xffffff, 0x8fd3c1][k], { roughness: 1 }),
      BENCH[0] - 0.9 + k * 0.8,
      FLOOR + 1.36,
      BENCH[2],
      0.06,
      98 + k,
    );
    roll.rotation.x = Math.PI / 2;
  }
  // wall socket for the charger, a white plate with two holes
  box(0.6, 0.6, 0.08, white, SOCKET[0], SOCKET[1], WZ + 0.12, 0, 1, false);
  for (const dx of [-0.1, 0.1]) {
    const h = new THREE.Mesh(new THREE.CircleGeometry(0.05, 8), flat(0x2a2a30));
    h.position.set(SOCKET[0] + dx, SOCKET[1], WZ + 0.17);
    ground.add(h);
  }

  // monstera in a big pot in the corner (leaves sway in the warm air)
  cyl(0.9, 0.7, 1.6, 10, flat(0xf3ebe0, { roughness: 0.5 }), -10.2, FLOOR + 0.8, -1.4, 0.04, 110);
  const plant = new THREE.Group();
  for (let j = 0; j < 9; j++) {
    const leaf = F(
      new THREE.CircleGeometry(0.9, 7),
      flat(j % 2 ? 0x2f7f4f : 0x3f9a5c, { side: THREE.DoubleSide }),
      0.12,
      111 + j,
    );
    const a = (j / 9) * Math.PI * 2;
    const h = 1.2 + (j % 3) * 0.8;
    leaf.position.set(Math.cos(a) * 0.9, h, Math.sin(a) * 0.8);
    leaf.rotation.set(-1.0 + (j % 2) * 0.3, a, 0.4);
    leaf.scale.set(1, 0.7, 1);
    plant.add(leaf);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, h, 4), flat(0x3f8a4a));
    stem.position.set(Math.cos(a) * 0.45, h / 2, Math.sin(a) * 0.4);
    stem.rotation.set(Math.sin(a) * 0.4, 0, -Math.cos(a) * 0.4);
    plant.add(stem);
  }
  plant.position.set(-10.2, FLOOR + 1.6, -1.4);
  ground.add(plant);
  onFrame((t) => (plant.rotation.z = Math.sin(t * 0.7) * 0.025));
}

// ---------------------------------------------------------------- pendant lamp
{
  const shade = new THREE.Mesh(
    new THREE.ConeGeometry(1.1, 0.9, 14, 1, true),
    flat(0x2f6f6a, { side: THREE.DoubleSide, roughness: 0.5 }),
  );
  shade.position.set(-3.5, CEIL - 2.3, 3.5);
  ground.add(shade);
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.9, 4), flat(0x111111));
  cord.position.set(-3.5, CEIL - 0.95, 3.5);
  ground.add(cord);
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 8, 6),
    flat(0xfff3d6, { emissive: 0xffd09a, emissiveIntensity: 2.5 }),
  );
  bulb.position.set(-3.5, CEIL - 2.75, 3.5);
  ground.add(bulb);
  const pl = new THREE.PointLight(0xffc98a, 34, 26, 1.3);
  pl.position.set(-3.5, CEIL - 3.0, 3.5);
  pl.castShadow = false;
  ground.add(pl);
  const fill = new THREE.PointLight(0xffb8c8, 10, 22, 1.4);
  fill.position.set(4, 4, 7);
  ground.add(fill);
}

// ---------------------------------------------------------------- outside: Vienna rooftops at dusk (hero)
{
  const Y = -6; // street far below the window
  const roofCols = [0xb4553a, 0xa8483a, 0x8a5a4a, 0x6a6a7a];
  const facade = [0xe8c8a8, 0xd8b8c8, 0xc8c0a8, 0xe0d0b8, 0xb8a8c0];
  const winLit = flat(0xffd58a, { emissive: 0xffb54a, emissiveIntensity: 1.1 });
  const winDark = flat(0x3a3050, { roughness: 0.3 });
  let x = -38;
  let k = 0;
  for (const row of [
    { z: -16, h: [7, 10] },
    { z: -27, h: [11, 15] },
  ]) {
    x = -40 + (row.z === -27 ? 3 : 0);
    while (x < 40) {
      const w = 5 + r() * 3.5;
      const h = row.h[0] + r() * (row.h[1] - row.h[0]);
      const fcol = new THREE.Color(facade[k % facade.length]).multiplyScalar(
        row.z === -16 ? 0.78 : 0.6,
      );
      box(w, h, 6, flat(fcol), x + w / 2, Y + h / 2, row.z, 0.03, 200 + k, false);
      // pitched roof: a prism along x
      const roof = F(
        new THREE.CylinderGeometry(3.4, 3.4, w + 0.4, 3, 1),
        flat(roofCols[k % 4]),
        0.06,
        300 + k,
      );
      roof.rotation.z = Math.PI / 2;
      roof.scale.set(1, 1, 0.55);
      roof.position.set(x + w / 2, Y + h + 0.9, row.z);
      ground.add(roof);
      // chimneys
      if (r() < 0.7)
        box(
          0.6,
          1.8,
          0.6,
          flat(0x9a6a5a),
          x + 1 + r() * (w - 2),
          Y + h + 2.0,
          row.z + 0.6,
          0.05,
          400 + k,
          false,
        );
      // dormer + windows on the facade facing us
      const cols = Math.floor((w - 1) / 1.6);
      for (let cx = 0; cx < cols; cx++)
        for (let ry = 0; ry < Math.floor((h - 2) / 2.4); ry++) {
          const rr = r();
          const m = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 1.3, 0.1),
            rr < 0.3 ? winLit : winDark,
          );
          m.position.set(x + 1.1 + cx * 1.6, Y + 2.2 + ry * 2.4, row.z + 3.05);
          ground.add(m);
        }
      x += w + 0.25;
      k++;
    }
  }
  // the church dome with a lantern (Karlskirche-style silhouette), far right
  const dome = F(
    new THREE.SphereGeometry(5.5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    flat(0x5f9a8a, { roughness: 0.5 }),
    0.06,
    500,
  );
  dome.position.set(14, Y + 18, -42);
  ground.add(dome);
  cyl(5.6, 5.8, 5, 14, flat(0xd8c8b0), 14, Y + 15.5, -42, 0.03, 501, false);
  cyl(0.9, 1.1, 3, 8, flat(0x5f9a8a), 14, Y + 25, -42, 0.05, 502, false);
  const cross = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 1.6, 0.25),
    flat(0xd9a441, { metalness: 0.7, roughness: 0.3 }),
  );
  cross.position.set(14, Y + 27.3, -42);
  ground.add(cross);
  // a distant tower with a red light (life: it blinks)
  cyl(0.8, 1.2, 26, 8, flat(0x7a7a90), -18, Y + 13, -60, 0.04, 503, false);
  const red = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 8, 6),
    new THREE.MeshBasicMaterial({ color: 0xff3a3a }),
  );
  red.position.set(-18, Y + 26.5, -60);
  ground.add(red);
  onFrame((t) => (red.visible = t % 1.6 < 0.8));
  // a few soft pink clouds low over the roofs
  const cl = new THREE.Group();
  cloudPuffs(cl, 6, 2.6, flat(0xffc8d8, { roughness: 1 }), 7);
  cl.position.set(-6, 14, -70);
  ground.add(cl);
  // pigeons circling over the roofs (life)
  const birdMat = flat(0x3a3040);
  const pigeons = [];
  for (let b = 0; b < 4; b++) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 4), birdMat);
    body.scale.set(1.6, 0.8, 0.8);
    g.add(body);
    for (const s of [-1, 1]) {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 0.7), birdMat);
      wing.position.set(0, 0.05, s * 0.4);
      wing.userData.s = s;
      g.add(wing);
    }
    ground.add(g);
    pigeons.push(g);
  }
  onFrame((t) =>
    pigeons.forEach((g, b) => {
      const a = t * 0.35 + b * 1.6;
      g.position.set(Math.cos(a) * 9 - 2, 9 + Math.sin(a * 2 + b) * 0.8, -22 + Math.sin(a) * 4);
      g.rotation.y = -a;
      g.children.forEach((c) => {
        if (c.userData.s) c.rotation.x = c.userData.s * Math.sin(t * 14 + b) * 0.6;
      });
    }),
  );
}

// ---------------------------------------------------------------- dust in the window light (life)
{
  const N = 60;
  const motes = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.03, 4, 3),
    new THREE.MeshBasicMaterial({ color: 0xffe8c8, transparent: true, opacity: 0.7, fog: false }),
    N,
  );
  motes.userData.noAO = true;
  const rs = rng(77);
  const seeds = Array.from({ length: N }, () => [
    rs() * 7 - 3.5,
    rs() * 6 + 1,
    rs() * 3 - 1.8,
    rs(),
  ]);
  const m = new THREE.Matrix4();
  ground.add(motes);
  onFrame((t) => {
    seeds.forEach(([x, y, z, ph], i) => {
      m.makeTranslation(
        x + Math.sin(t * 0.3 + ph * 9) * 0.3,
        y + Math.sin(t * 0.21 + ph * 5) * 0.4,
        z + Math.cos(t * 0.27 + ph * 7) * 0.3,
      );
      motes.setMatrixAt(i, m);
    });
    motes.instanceMatrix.needsUpdate = true;
  });
}

finishSet({ ground: 0x6a5a5a });
export { sky, patches, facet, facetMat };
