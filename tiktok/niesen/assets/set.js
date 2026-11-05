// #61 Niesen — a flower meadow on an early spring-like morning: low golden
// sun behind the hill, pollen glittering in the light, a blue-checked picnic
// blanket where "you" sit, dandelion clocks around it. Hero piece: a lone
// oak on a round hill with hay bales; far layer: snowy mountains in haze.
// Life: swaying grass, drifting pollen, birds, dandelion seeds, clouds.
// The "Schottland" mini-set (a country road with a saltire flag and the
// driver's car) lies off to the right of the meadow (beats.js SCOT).
import { THREE, flat, ground, onFrame, rng, V, facet, facetMat } from "./world.js";
import {
  SKIES,
  setSky,
  finishSet,
  terrain,
  pathStrip,
  meadow,
  tree,
  pine,
  fireflies,
  rocks,
  F,
  add,
} from "./environments.js";
import { place, scatter, bush, flowerBed, fence, sway } from "./props.js";
import { SCOT } from "./beats.js";

const SEED = 61;

// ---------------------------------------------------------------- light
// golden morning: the low sun front-right of the blanket (the face is lit;
// in the "Übrigens" the head turns into it)
setSky({
  ...SKIES.morgen,
  top: [0.42, 0.62, 0.93],
  mid: [0.98, 0.8, 0.7],
  hor: [1.0, 0.82, 0.52],
  below: [0.96, 0.84, 0.7],
  sun: [1.0, 0.9, 0.62],
  sunDir: [0.69, 0.16, 0.7],
  keyPos: [7, 9, 8],
  key: [0xfff0d8, 2.7],
  fog: [34, 120],
  clouds: 10,
});

// ---------------------------------------------------------------- ground
terrain(0x7cbd4c, {
  seed: SEED,
  amt: 0.12,
  scale: 0.1,
  warm: 0.55,
  hills: 9,
  flatR: 44,
});

// the hill with the oak (hero piece, behind the blanket)
{
  const hill = new THREE.Mesh(
    facet(new THREE.SphereGeometry(9, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), 0.07, 3),
    facetMat(flat(0x86c552)),
  );
  hill.scale.set(1.25, 0.42, 0.9);
  hill.receiveShadow = true;
  add(hill, 1.5, -0.2, -21);
  const oak = tree(1.5, -21, 3.1, SEED + 1);
  oak.position.y = 3.5;
  sway(oak, 3, 0.012);
  // round hay bales on the slope + in the field
  const hayMat = flat(0xe8c766, { roughness: 0.9 });
  const endMat = flat(0xd8b050, { roughness: 0.9 });
  for (const [x, z, y, r] of [
    [-5.5, -15.5, 0.4, 0.4],
    [-3.6, -16.8, 0.9, -0.2],
    [7.6, -16, 0.6, 0.9],
    [-11, -9.5, 0, 0.3],
    [10.5, -10.5, 0, 1.2],
  ]) {
    const b = new THREE.Group();
    const roll = F(new THREE.CylinderGeometry(0.95, 0.95, 1.3, 14), hayMat, 0.06, x);
    roll.rotation.z = Math.PI / 2;
    b.add(roll);
    for (const s of [-1, 1]) {
      const end = new THREE.Mesh(new THREE.CircleGeometry(0.9, 14), endMat);
      end.position.x = s * 0.66;
      end.rotation.y = (s * Math.PI) / 2;
      b.add(end);
    }
    b.position.set(x, 0.95 + y, z);
    b.rotation.y = r;
    b.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
    ground.add(b);
  }
}

// far layer: snowy mountains in the haze, all around the back half
{
  const r = rng(SEED + 7);
  const rockMat = flat(0x8d93a8);
  const snow = flat(0xf6f8ff);
  for (let i = 0; i < 11; i++) {
    const a = -Math.PI * 0.95 + (i / 10) * Math.PI * 0.9 + (r() - 0.5) * 0.12;
    const d = 82 + r() * 18;
    const h = 22 + r() * 18;
    const w = 16 + r() * 10;
    const m = new THREE.Group();
    const body = F(new THREE.ConeGeometry(w, h, 6 + Math.floor(r() * 3)), rockMat, 0.08, i);
    body.position.y = h / 2 - 3;
    m.add(body);
    const cap = F(new THREE.ConeGeometry(w * 0.34, h * 0.34, 6), snow, 0.05, i + 30);
    cap.position.y = h - 3 - h * 0.17 + 0.05;
    m.add(cap);
    m.position.set(Math.cos(a) * d, 0, Math.sin(a) * d);
    m.rotation.y = r() * 3;
    ground.add(m);
  }
}

// a red barn + a few trees on the left, a pine row on the right
{
  const barn = new THREE.Group();
  const walls = F(new THREE.BoxGeometry(5, 3.2, 4), flat(0xc0453a), 0.05, 2);
  walls.position.y = 1.6;
  barn.add(walls);
  const rs = new THREE.Shape();
  rs.moveTo(-2.8, 0);
  rs.lineTo(0, 2);
  rs.lineTo(2.8, 0);
  rs.lineTo(-2.8, 0);
  const roof = new THREE.Mesh(
    new THREE.ExtrudeGeometry(rs, { depth: 4.4, bevelEnabled: false }),
    flat(0x5b4a46),
  );
  roof.position.set(0, 3.2, -2.2);
  barn.add(roof);
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.1, 0.08), flat(0xf4efe6));
  door.position.set(0, 1.05, 2.03);
  barn.add(door);
  barn.traverse((o) => o.isMesh && (o.castShadow = true));
  barn.position.set(-19, 0, -22);
  barn.rotation.y = 0.45;
  ground.add(barn);
}
[
  [-13, -14, 1.3],
  [-24, -12, 1.5],
  [-17, 3, 1.2],
  [16, -4, 1.3],
  [14, -18, 1.4],
  [-26, 8, 1.4],
].forEach(([x, z, s], i) => sway(tree(x, z, s, SEED + 10 + i), i, 0.015));
[
  [22, -14],
  [25, -10],
  [27, -17],
  [-30, -18],
].forEach(([x, z], i) => pine(x, z, 1.6, SEED + 20 + i));

// a wooden fence along the field behind the blanket
for (const [x, rot] of [
  [-11, 0.06],
  [-5, 0.02],
  [5.2, -0.03],
  [11.2, -0.08],
])
  place(fence(5.6, 0x9a6a38), x, -9 + Math.abs(x) * 0.05, rot);

// ---------------------------------------------------------------- meadow
meadow({
  n: 900,
  rMin: 3.6,
  rMax: 30,
  seed: SEED,
  flowers: 0.45,
  tint: [0x5e9f36, 0x7cc34a, 0x95d660],
  keep: (x, z) => !(x > 17 && z > 4) && Math.hypot(x - 1.5, (z + 21) / 0.7) > 10,
});
scatter((i) => flowerBed(SEED + i, [0xffd84a, 0xffffff, 0xff8fb8, 0xc9a4ff]), 9, {
  rMin: 7,
  rMax: 16,
  seed: SEED + 3,
  keep: (x, z) => z < 3 || Math.abs(x) > 6,
});
scatter((i) => bush(SEED + 40 + i, i % 2 ? 0x5aa233 : 0x6bb33c), 7, {
  rMin: 10,
  rMax: 22,
  seed: SEED + 4,
  keep: (x, z) => !(x > 15 && z > 3),
});
rocks(8, 9, 22, SEED + 5);

// ---------------------------------------------------------------- dandelions
// white seed heads on thin stems; the sneeze blows the ones in front (scene.js
// reads DANDELIONS to send their seeds flying)
export const DANDELIONS = [];
{
  const stemMat = flat(0x5f9a3a);
  const puffMat = flat(0xffffff, { roughness: 0.9, emissive: 0xfff4e0, emissiveIntensity: 0.25 });
  const spots = [
    [-1.1, 3.6, 1.05],
    [0.5, 4.3, 1.2],
    [1.4, 3.4, 0.95],
    [-0.4, 5.6, 1.15],
    [0.9, 6.6, 1.0],
    [-1.6, 7.4, 1.2],
    [1.9, 8.6, 1.1],
    [-0.8, 9.6, 1.05],
    [-3.2, 4.4, 1.0],
    [3.4, 5.2, 1.1],
    [-4.6, -1.5, 1.0],
    [4.8, -2.6, 1.15],
  ];
  for (const [x, z, s] of spots) {
    const g = new THREE.Group();
    const h = 0.9 * s;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.024, h, 4), stemMat);
    stem.position.y = h / 2;
    g.add(stem);
    const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2 * s, 1), puffMat);
    head.position.y = h + 0.08;
    head.castShadow = true;
    g.add(head);
    g.position.set(x, 0, z);
    ground.add(g);
    DANDELIONS.push({ g, head, x, z, y: h + 0.08, s });
  }
}

// ---------------------------------------------------------------- pollen
// golden motes drifting in the low sun (around the blanket and up the hill)
fireflies(70, { area: [-9, 9, 0.6, 5.5, -10, 8], color: 0xffe9a0, seed: SEED, size: 0.035 });
fireflies(40, { area: [-16, 16, 0.6, 7, -24, -8], color: 0xfff1c0, seed: SEED + 1, size: 0.05 });

// ---------------------------------------------------------------- picnic
// blue-checked blanket, wicker basket, a box of tissues, thermos + cups, an
// apple and a croissant on a plate
export const BLANKET = { x: 0, z: 0.9, w: 5.4, d: 4.6 };
{
  const { x, z, w, d } = BLANKET;
  const nx = 9;
  const nz = 8;
  const cw = w / nx;
  const cd = d / nz;
  const geo = new THREE.BoxGeometry(cw, 0.03, cd);
  const cols = [flat(0x3f6fcf, { roughness: 0.9 }), flat(0xf4f1ea, { roughness: 0.9 })];
  for (let i = 0; i < nx; i++)
    for (let k = 0; k < nz; k++) {
      const m = new THREE.Mesh(geo, cols[(i + k) % 2]);
      m.position.set(
        x - w / 2 + cw * (i + 0.5),
        0.03 + ((i * 7 + k * 3) % 5) * 0.002,
        z - d / 2 + cd * (k + 0.5),
      );
      m.receiveShadow = true;
      ground.add(m);
    }
  // a little fold at the front corner
  const fold = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.03, 0.6), cols[0]);
  fold.position.set(x + w / 2 - 0.4, 0.07, z + d / 2 - 0.2);
  fold.rotation.set(0.15, 0.6, 0.05);
  ground.add(fold);
}
{
  // wicker basket with lid + handle
  const basket = new THREE.Group();
  const wicker = flat(0xb9864a, { roughness: 0.9 });
  const body = F(new THREE.CylinderGeometry(0.62, 0.52, 0.62, 10), wicker, 0.1, 5);
  body.position.y = 0.31;
  basket.add(body);
  for (let i = 0; i < 4; i++) {
    const band = new THREE.Mesh(
      new THREE.TorusGeometry(0.6 - i * 0.025, 0.025, 4, 16),
      flat(0x9a6a38),
    );
    band.rotation.x = Math.PI / 2;
    band.position.y = 0.1 + i * 0.15;
    basket.add(band);
  }
  const lid = F(new THREE.CylinderGeometry(0.66, 0.66, 0.08, 10), flat(0xa77640), 0.08, 6);
  lid.position.y = 0.66;
  lid.rotation.z = 0.08;
  basket.add(lid);
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.04, 5, 14, Math.PI),
    flat(0x8a5e3c),
  );
  handle.position.y = 0.68;
  basket.add(handle);
  // a red-white napkin sticking out
  const nap = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.3), flat(0xe2453c));
  nap.position.set(0.35, 0.72, 0.25);
  nap.rotation.set(0.5, 0.3, -0.4);
  basket.add(nap);
  basket.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  basket.position.set(2.15, 0.04, -0.3);
  basket.rotation.y = -0.4;
  ground.add(basket);

  // box of tissues (one tissue sticking out, it flutters in the sneeze)
  const box = new THREE.Group();
  const cube = F(new THREE.BoxGeometry(0.62, 0.32, 0.36), flat(0x7fd0c8), 0.06, 7);
  cube.position.y = 0.16;
  box.add(cube);
  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.01, 0.08), flat(0x2f6d68));
  slot.position.y = 0.325;
  box.add(slot);
  const tissue = new THREE.Mesh(
    new THREE.ConeGeometry(0.12, 0.3, 4, 1, true),
    flat(0xffffff, { side: THREE.DoubleSide }),
  );
  tissue.position.y = 0.46;
  tissue.rotation.y = 0.8;
  box.add(tissue);
  onFrame((t) => (tissue.rotation.z = Math.sin(t * 2.3) * 0.08));
  box.traverse((o) => o.isMesh && (o.castShadow = true));
  box.position.set(-1.75, 0.04, 2.1);
  box.rotation.y = 0.35;
  ground.add(box);

  // thermos + two cups
  const thermos = new THREE.Group();
  const tb = F(
    new THREE.CylinderGeometry(0.15, 0.15, 0.7, 10),
    flat(0xe2453c, { roughness: 0.35 }),
    0.05,
    8,
  );
  tb.position.y = 0.35;
  thermos.add(tb);
  const tc = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.14, 10), flat(0x2a2a30));
  tc.position.y = 0.76;
  thermos.add(tc);
  thermos.traverse((o) => o.isMesh && (o.castShadow = true));
  thermos.position.set(-2.1, 0.04, -0.2);
  ground.add(thermos);
  for (const [cx, cz, col] of [
    [-1.65, 0.35, 0xffd23f],
    [1.75, 1.0, 0xffffff],
  ]) {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.2, 10), flat(col));
    cup.position.set(cx, 0.14, cz);
    cup.castShadow = true;
    ground.add(cup);
    const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.1, 10), flat(0x5a3a22));
    coffee.rotation.x = -Math.PI / 2;
    coffee.position.set(cx, 0.235, cz);
    ground.add(coffee);
  }
  // plate with croissant + apple
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.32, 0.04, 14), flat(0xffffff));
  plate.position.set(1.3, 0.07, 2.25);
  plate.receiveShadow = true;
  ground.add(plate);
  const cro = new THREE.Mesh(
    new THREE.TorusGeometry(0.16, 0.08, 6, 10, Math.PI * 1.2),
    flat(0xe0a050),
  );
  cro.rotation.x = -Math.PI / 2;
  cro.position.set(1.28, 0.15, 2.25);
  cro.castShadow = true;
  ground.add(cro);
  const apple = F(
    new THREE.IcosahedronGeometry(0.14, 1),
    flat(0xd8302f, { roughness: 0.4 }),
    0.05,
    9,
  );
  apple.position.set(1.6, 0.2, 1.75);
  ground.add(apple);
}

// ---------------------------------------------------------------- Schottland
// a small highland road on the right edge of the meadow: heather patches,
// a saltire on a pole, the car (scene.js) drives along it
{
  const [sx, , sz] = SCOT;
  pathStrip(
    [
      [sx - 10, sz - 7.8],
      [sx - 5, sz - 3.9],
      [sx, sz],
      [sx + 6, sz + 4],
      [sx + 16, sz + 14],
    ],
    { width: 2.6, color: 0x55545c, seed: SEED + 9 },
  );
  // dashed centre line
  for (let i = -6; i <= 6; i++) {
    const dash = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.6), flat(0xf4efe6));
    dash.position.set(sx + i * 1.6 * 0.78, 0.045, sz + i * 1.6 * 0.62);
    dash.rotation.y = Math.atan2(0.78, 0.62);
    ground.add(dash);
  }
  // heather (purple tufts) along the road
  const r = rng(SEED + 11);
  const heather = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.32, 0),
    flat(0xa25fb8, { roughness: 0.9 }),
    70,
  );
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 70; i++) {
    const u = (r() - 0.5) * 26;
    const off = (r() < 0.5 ? -1 : 1) * (2 + r() * 4.5);
    const x = sx + u * 0.78 + off * 0.62;
    const z = sz + u * 0.62 - off * 0.78;
    const s = 0.6 + r() * 0.9;
    m4.compose(V(x, 0.12 * s, z), new THREE.Quaternion(), V(s, 0.6 * s, s));
    heather.setMatrixAt(i, m4);
  }
  heather.castShadow = true;
  ground.add(heather);
  // saltire flag on a pole
  const flag = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 4.2, 6), flat(0xdedede));
  pole.position.y = 2.1;
  flag.add(pole);
  const cloth = new THREE.Group();
  cloth.position.set(0.85, 3.55, 0);
  flag.add(cloth);
  const blue = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.1, 0.03), flat(0x1f5fc8));
  cloth.add(blue);
  const diag = Math.hypot(1.7, 1.1);
  for (const s of [-1, 1]) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(diag, 0.2, 0.045), flat(0xffffff));
    bar.rotation.z = s * Math.atan2(1.1, 1.7);
    cloth.add(bar);
  }
  flag.traverse((o) => o.isMesh && (o.castShadow = true));
  onFrame((t) => (cloth.rotation.y = Math.sin(t * 2.1) * 0.18));
  flag.position.set(sx + 3.6, 0, sz - 2.2);
  ground.add(flag);
}

finishSet({ ground: 0x7cbd4c });
