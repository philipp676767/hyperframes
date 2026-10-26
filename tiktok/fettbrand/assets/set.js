// Set of #35 "Fettbrand": a shared-flat (WG) kitchen late at night, 22:40,
// rain on the old-building window, the city's lit windows and a blinking
// neon sign across the street. The hob with the pan stands at the origin
// (worktop top = 0); above it the range hood throws a warm cone of light,
// everything else sits in a cosy dark. Props: turquoise subway tiles, a
// spice rack, a knife block, a kettle, herbs on the windowsill, the fridge
// with magnets, a wall clock. The ceiling is there for "bis unter die
// Decke". Light: blue rain-night outside, warm hood + under-cabinet LEDs
// inside, later the flames.
// The cross-section (CUT) and the bathtubs (TUBS) are dark lab places under
// the floor, built in scene.js.
import { THREE, flat, ground, onFrame, rng, M, patches, facet, facetMat } from "./world.js";
import { SKIES, setSky, finishSet, F } from "./environments.js";

const SEED = 35;
const r = rng(SEED);
export const FLOOR = -4.6; // kitchen floor (worktop top = 0)
export const CEIL = 9.6; // kitchen ceiling
const WZ = -5.3; // back wall

// ---------------------------------------------------------------- light
// rain night: deep blue-violet, no stars (clouds), the key light dimmed so
// the kitchen lamps carry the room
const sky = setSky({
  ...SKIES.nacht,
  top: [0.03, 0.04, 0.12],
  mid: [0.07, 0.09, 0.22],
  hor: [0.2, 0.2, 0.38],
  below: [0.08, 0.09, 0.18],
  stars: 0,
  clouds: 4,
  birds: false,
  hemi: [0x7a86c8, 0x2a1a1a, 0.45],
  key: [0xffd2a8, 0.6],
  keyPos: [6, 14, 10],
  rim: [0x6f8dff, 1.1],
  fog: [30, 110],
  nightWindows: true,
});

// ---------------------------------------------------------------- helpers
const white = flat(0xf4efe6);
const box = (w, h, d, mat, x, y, z, amt = 0.04, seed = 1, shadow = true) => {
  const m = F(new THREE.BoxGeometry(w, h, d), mat, amt, seed);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  ground.add(m);
  return m;
};
const cyl = (rt, rb, h, seg, mat, x, y, z, amt = 0.05, seed = 1) => {
  const m = F(new THREE.CylinderGeometry(rt, rb, h, seg), mat, amt, seed);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  ground.add(m);
  return m;
};

// ---------------------------------------------------------------- worktop + base cabinets
{
  // light oak worktop with patches, the hob is set into it
  const top = new THREE.Mesh(
    patches(facet(new THREE.BoxGeometry(28, 0.5, 8.8, 28, 1, 9), 0.04, 3), {
      amt: 0.08,
      scale: 0.3,
      seed: 5,
      warm: 0.5,
    }),
    facetMat(flat(0xd9b07a, { roughness: 0.6 })),
  );
  top.position.set(0, -0.25, -0.9);
  top.castShadow = top.receiveShadow = true;
  ground.add(top);
  // sage-green base cabinets with brass handles
  const front = flat(0x7f9c8a, { roughness: 0.55 });
  box(27.4, 4.1, 8.0, flat(0x6b8676), 0, FLOOR + 2.05, -1.2, 0.02, 4);
  const brass = flat(0xd9a441, { metalness: 0.7, roughness: 0.3 });
  for (let c = 0; c < 6; c++) {
    const x = -11.25 + c * 4.5;
    if (Math.abs(x) < 3) continue; // the oven sits under the hob
    box(4.3, 3.7, 0.16, front, x, FLOOR + 2.25, 2.86, 0.04, 10 + c);
    box(1.4, 0.14, 0.14, brass, x, -0.75, 3.02, 0, 1);
  }
  // oven under the hob: black glass door with a steel handle
  box(
    5.2,
    3.0,
    0.2,
    flat(0x1b1d22, { roughness: 0.15, metalness: 0.3 }),
    0,
    FLOOR + 2.0,
    2.88,
    0,
    1,
  );
  box(4.0, 0.16, 0.3, M.chrome, 0, -1.55, 3.1, 0, 1);
  // control strip with the knobs (the hand turns one in the payoff)
  box(5.2, 0.7, 0.2, flat(0x2a2c33, { roughness: 0.3 }), 0, -0.45, 2.92, 0, 1);
  // plinth
  box(27.4, 0.5, 0.2, flat(0x2a2a2e), 0, FLOOR + 0.25, 2.7, 0, 1);
}

// ---------------------------------------------------------------- floor + walls
{
  // terracotta floor tiles, each a touch different
  const tiles = [];
  for (let x = -14; x < 30; x += 1.6) for (let z = -5; z < 24; z += 1.6) tiles.push([x, z]);
  const tile = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1.55, 0.1, 1.55),
    flat(0xffffff, { roughness: 0.6 }),
    tiles.length,
  );
  const m4 = new THREE.Matrix4();
  const col = new THREE.Color();
  const terra = new THREE.Color(0xc4714a);
  tiles.forEach(([x, z], i) => {
    m4.makeTranslation(x, FLOOR - 0.05, z);
    tile.setMatrixAt(i, m4);
    tile.setColorAt(i, col.copy(terra).multiplyScalar(0.8 + r() * 0.28));
  });
  tile.receiveShadow = true;
  ground.add(tile);
  box(60, 0.1, 40, flat(0x6a3a28), 8, FLOOR - 0.12, 8, 0, 1, false);
  // a striped rug in front of the stove
  box(8, 0.06, 4, flat(0x2f4f7a, { roughness: 1 }), 0, FLOOR + 0.03, 7.2, 0.06, 9);
  for (let k = 0; k < 4; k++)
    box(
      8,
      0.07,
      0.35,
      flat(0xf2d27a, { roughness: 1 }),
      0,
      FLOOR + 0.04,
      5.8 + k * 0.95,
      0.04,
      20 + k,
    );

  const wallMat = flat(0xc9b8a8, { roughness: 0.9 });
  // back wall with the window opening x[-12, -5], y[1.4, 8.0]
  const wx0 = -12.2;
  const wx1 = -5.2;
  const wy0 = 1.4;
  const wy1 = 8.0;
  box(
    wx0 + 16,
    CEIL - FLOOR,
    0.4,
    wallMat,
    (-16 + wx0) / 2,
    (FLOOR + CEIL) / 2,
    WZ,
    0.02,
    21,
    false,
  );
  box(
    32 - wx1,
    CEIL - FLOOR,
    0.4,
    wallMat,
    (wx1 + 32) / 2,
    (FLOOR + CEIL) / 2,
    WZ,
    0.02,
    22,
    false,
  );
  box(
    wx1 - wx0,
    wy0 - FLOOR,
    0.4,
    wallMat,
    (wx0 + wx1) / 2,
    (FLOOR + wy0) / 2,
    WZ,
    0.02,
    23,
    false,
  );
  box(wx1 - wx0, CEIL - wy1, 0.4, wallMat, (wx0 + wx1) / 2, (wy1 + CEIL) / 2, WZ, 0.02, 24, false);
  // turquoise subway tiles between worktop and wall cabinets
  {
    const list = [];
    for (let y = 0.25; y < 4.6; y += 0.5)
      for (let x = -4.9 + (Math.round(y * 2) % 2) * 0.5; x < 14; x += 1.0) list.push([x, y]);
    const t = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.94, 0.44, 0.08),
      flat(0xffffff, { roughness: 0.25 }),
      list.length,
    );
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    const base = new THREE.Color(0x5fb8b0);
    list.forEach(([x, y], i) => {
      m.makeTranslation(x, y, WZ + 0.24);
      t.setMatrixAt(i, m);
      t.setColorAt(i, c.copy(base).multiplyScalar(0.86 + r() * 0.24));
    });
    t.receiveShadow = true;
    ground.add(t);
  }
  // window: white frame, glazing bars, sill with herbs
  const fr = (w, h, x, y, d = 0.5) => box(w, h, d, white, x, y, WZ + 0.05, 0.02, 1, false);
  fr(wx1 - wx0 + 0.8, 0.45, (wx0 + wx1) / 2, wy1 + 0.2);
  fr(wx1 - wx0 + 0.8, 0.3, (wx0 + wx1) / 2, wy0 + 0.05);
  fr(0.45, wy1 - wy0 + 0.6, wx0 - 0.2, (wy0 + wy1) / 2);
  fr(0.45, wy1 - wy0 + 0.6, wx1 + 0.2, (wy0 + wy1) / 2);
  fr(0.22, wy1 - wy0, (wx0 + wx1) / 2, (wy0 + wy1) / 2, 0.3);
  fr(wx1 - wx0, 0.18, (wx0 + wx1) / 2, 5.4, 0.3);
  box(wx1 - wx0 + 1.2, 0.22, 1.2, white, (wx0 + wx1) / 2, wy0 - 0.05, WZ + 0.5, 0.02, 1);
  const pane = new THREE.Mesh(
    new THREE.PlaneGeometry(wx1 - wx0, wy1 - wy0),
    new THREE.MeshStandardMaterial({
      color: 0xb8c8ff,
      roughness: 0.05,
      metalness: 0.2,
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
    }),
  );
  pane.position.set((wx0 + wx1) / 2, (wy0 + wy1) / 2, WZ);
  pane.userData.noAO = true;
  ground.add(pane);
  // raindrops running down the glass
  {
    const N = 70;
    const drops = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.06, 6, 4),
      new THREE.MeshStandardMaterial({ color: 0xdfe8ff, roughness: 0.05, metalness: 0.3 }),
      N,
    );
    drops.userData.noAO = true;
    const rs = rng(99);
    const seeds = Array.from({ length: N }, () => [
      wx0 + 0.3 + rs() * (wx1 - wx0 - 0.6),
      rs(),
      0.15 + rs() * 0.5,
      0.7 + rs() * 0.8,
    ]);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    ground.add(drops);
    onFrame((t) => {
      seeds.forEach(([x, ph, sp, sz], i) => {
        // drops hang, then run down in a short rush
        const f = (t * sp + ph) % 1;
        const run = f < 0.6 ? f * 0.15 : 0.09 + (f - 0.6) * 2.2;
        const y = wy1 - 0.3 - run * (wy1 - wy0);
        p.set(x + Math.sin(i * 3.1 + run * 4) * 0.05, Math.max(y, wy0 + 0.2), WZ + 0.08);
        s.set(sz, sz * (f < 0.6 ? 1 : 1.8), sz * 0.6);
        m.compose(p, q, s);
        drops.setMatrixAt(i, m);
      });
      drops.instanceMatrix.needsUpdate = true;
    });
  }
  // ceiling (no shadow, so the key light still reaches the room) + cornice
  box(60, 0.4, 34, flat(0xefe6d6), 8, CEIL + 0.2, 10, 0, 1, false);
  box(46, 0.3, 0.3, white, 9, CEIL - 0.15, WZ + 0.3, 0, 1, false);
  // left wall
  box(0.4, CEIL - FLOOR, 30, wallMat, -16, (FLOOR + CEIL) / 2, 9.7, 0.02, 25, false);
}

// ---------------------------------------------------------------- range hood + wall cabinets
{
  // steel hood above the hob, chimney to the ceiling, warm light cone
  const steel = flat(0xc9ced6, { metalness: 0.75, roughness: 0.3 });
  const hood = F(new THREE.CylinderGeometry(1.2, 3.0, 1.4, 4, 1), steel, 0.03, 30);
  hood.rotation.y = Math.PI / 4;
  hood.scale.set(1.25, 1, 0.85);
  hood.position.set(0, 6.4, -3.3);
  hood.castShadow = false;
  ground.add(hood);
  box(1.8, CEIL - 7.1, 1.6, steel, 0, (7.1 + CEIL) / 2, -4.3, 0.02, 31, false);
  box(
    5.6,
    0.12,
    3.1,
    flat(0x9aa0aa, { metalness: 0.6, roughness: 0.4 }),
    0,
    5.66,
    -3.3,
    0,
    1,
    false,
  );
  for (const x of [-1.4, 1.4]) {
    const bulb = new THREE.Mesh(
      new THREE.CircleGeometry(0.18, 12),
      flat(0xfff3d6, { emissive: 0xffd9a0, emissiveIntensity: 2.2 }),
    );
    bulb.rotation.x = Math.PI / 2;
    bulb.position.set(x, 5.59, -3.0);
    ground.add(bulb);
  }
  const spot = new THREE.SpotLight(0xffd29a, 70, 16, 0.75, 0.6, 1.4);
  spot.position.set(0, 5.5, -2.8);
  spot.target.position.set(0, 0, -0.2);
  ground.add(spot);
  ground.add(spot.target);

  // wall cabinets right of the hood, cream with brass knobs
  const cab = flat(0xf1e8d6, { roughness: 0.55 });
  const brass = flat(0xd9a441, { metalness: 0.7, roughness: 0.3 });
  for (let c = 0; c < 3; c++) {
    const x = 5.0 + c * 3.1;
    box(3.0, 3.6, 2.4, cab, x, 6.6, WZ + 1.4, 0.03, 40 + c, false);
    const k = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), brass);
    k.position.set(x + (c % 2 ? -1.1 : 1.1), 5.3, WZ + 2.65);
    ground.add(k);
  }
  // warm LED strip under the cabinets
  const led = new THREE.Mesh(
    new THREE.BoxGeometry(9.2, 0.06, 0.12),
    flat(0xfff0d0, { emissive: 0xffc77a, emissiveIntensity: 2.0 }),
  );
  led.position.set(8.1, 4.76, WZ + 2.3);
  ground.add(led);
  const ledLight = new THREE.PointLight(0xffc77a, 10, 9, 1.5);
  ledLight.position.set(8.1, 4.3, WZ + 2.0);
  ground.add(ledLight);
  // open shelf left of the hood: jars and a stack of plates
  box(4.6, 0.18, 1.2, flat(0xb98a55), -2.8 - 0.6, 6.4, WZ + 0.8, 0.04, 50);
  const jarCols = [0xe0533a, 0xf2c440, 0x7fb069, 0xffffff];
  for (let k = 0; k < 4; k++) {
    cyl(
      0.32,
      0.32,
      0.8,
      10,
      flat(jarCols[k], { roughness: 0.4 }),
      -4.8 + k * 0.85,
      6.9,
      WZ + 0.8,
      0.05,
      51 + k,
    );
    cyl(0.34, 0.34, 0.14, 10, flat(0x8a5a32), -4.8 + k * 0.85, 7.37, WZ + 0.8, 0.03, 60 + k);
  }
}

// ---------------------------------------------------------------- props on the worktop (beside the hob)
{
  // spice rack on the tiles
  box(4.2, 0.14, 0.7, flat(0xb98a55), 8.6, 2.2, WZ + 0.65, 0.04, 70);
  const spice = [0xc0392b, 0xe67e22, 0x2e8b57, 0xf1c40f, 0x8e5a3a, 0xd35400];
  spice.forEach((c, k) => {
    cyl(
      0.18,
      0.18,
      0.6,
      8,
      flat(0xeaf2f2, { roughness: 0.2 }),
      6.9 + k * 0.68,
      2.6,
      WZ + 0.65,
      0.03,
      71 + k,
    );
    cyl(0.17, 0.17, 0.32, 8, flat(c), 6.9 + k * 0.68, 2.5, WZ + 0.65, 0.05, 80 + k);
  });
  // knife block with handles
  {
    const kb = box(1.2, 1.7, 1.1, flat(0x5a3a22), 10.6, 0.85, -3.4, 0.05, 90);
    kb.rotation.x = -0.25;
    for (let k = 0; k < 4; k++) {
      const h = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.8, 0.22), flat(0x1c1c22));
      h.position.set(10.25 + k * 0.24, 2.0, -3.6 + (k % 2) * 0.2);
      h.rotation.x = -0.25;
      ground.add(h);
    }
  }
  // red kettle
  {
    const kt = cyl(
      0.8,
      1.0,
      1.6,
      12,
      flat(0xd83a2f, { roughness: 0.25 }),
      7.6,
      0.8,
      -2.6,
      0.04,
      95,
    );
    kt.castShadow = true;
    cyl(0.5, 0.75, 0.25, 12, flat(0xd83a2f, { roughness: 0.25 }), 7.6, 1.72, -2.6, 0.04, 96);
    const h = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.09, 6, 12, Math.PI), flat(0x1c1c22));
    h.position.set(7.6, 1.85, -2.6);
    ground.add(h);
    const sp = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.8, 6), flat(0xd83a2f));
    sp.rotation.z = -1.1;
    sp.position.set(8.55, 1.05, -2.6);
    ground.add(sp);
  }
  // cutting board with a few chopped vegetables
  {
    const b = box(3.2, 0.16, 2.0, flat(0xc89a62, { roughness: 0.7 }), -8.4, 0.08, 0.6, 0.04, 100);
    b.rotation.y = 0.15;
    const veg = [0xff6b3a, 0xff6b3a, 0x7fb069, 0x7fb069, 0xf2e3c4];
    veg.forEach((c, k) => {
      const v = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 8), flat(c));
      v.position.set(-9.4 + k * 0.45, 0.2, 0.4 + (k % 2) * 0.35);
      ground.add(v);
    });
  }
  // paper towel roll
  cyl(0.45, 0.45, 1.6, 12, flat(0xffffff, { roughness: 0.9 }), -10.9, 0.8, -3.6, 0.03, 110);
  // herbs on the windowsill, swaying in the draught
  const herbs = [];
  for (let k = 0; k < 3; k++) {
    const x = -11 + k * 2.4;
    cyl(0.4, 0.3, 0.6, 8, flat(0xc4714a), x, 1.65, WZ + 0.5, 0.05, 120 + k);
    const g = new THREE.Group();
    for (let j = 0; j < 6; j++) {
      const leaf = F(
        new THREE.SphereGeometry(0.3, 6, 4),
        flat(j % 2 ? 0x3f8f4a : 0x5aa85a),
        0.1,
        130 + k * 6 + j,
      );
      const a = (j / 6) * Math.PI * 2;
      leaf.position.set(Math.cos(a) * 0.25, 0.35 + (j % 3) * 0.22, Math.sin(a) * 0.2);
      leaf.scale.set(1, 0.6, 0.8);
      g.add(leaf);
    }
    g.position.set(x, 1.95, WZ + 0.5);
    ground.add(g);
    herbs.push(g);
  }
  onFrame((t) => herbs.forEach((g, k) => (g.rotation.z = Math.sin(t * 0.9 + k * 1.7) * 0.05)));
}

// ---------------------------------------------------------------- fridge + wall clock + pendant
{
  // tall retro fridge in mint at the left wall, with magnets and a note
  const mint = flat(0xa9d8c8, { roughness: 0.35 });
  box(4.4, 12.6, 4.2, mint, -13.2, FLOOR + 6.3, -2.4, 0.02, 140);
  box(4.42, 0.12, 4.22, flat(0x8fbfb0), -13.2, FLOOR + 8.4, -2.4, 0, 1);
  box(0.25, 2.4, 0.3, M.chrome, -11.3, FLOOR + 6.6, -0.2, 0, 1);
  box(0.25, 1.6, 0.3, M.chrome, -11.3, FLOOR + 10.2, -0.2, 0, 1);
  const mag = [0xe0533a, 0xffd23f, 0x2f6fd6, 0xff7ab8];
  mag.forEach((c, k) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 10), flat(c));
    m.rotation.x = Math.PI / 2;
    m.position.set(-14.3 + k * 0.7, FLOOR + 9.8 - (k % 2) * 0.5, -0.25);
    ground.add(m);
  });
  box(1.2, 1.5, 0.04, flat(0xfff6c8), -13.4, FLOOR + 9.2, -0.27, 0.02, 141);
  // wall clock above the window side: 22:40
  {
    const cx = -1.8;
    const cy = 8.3;
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.75, 24), flat(0xffffff));
    face.position.set(cx, cy, WZ + 0.25);
    ground.add(face);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.08, 6, 24), flat(0x1c1c22));
    ring.position.set(cx, cy, WZ + 0.25);
    ground.add(ring);
    const hand = (len, ang, w) => {
      const h = new THREE.Mesh(new THREE.BoxGeometry(w, len, 0.04), flat(0x1c1c22));
      h.geometry.translate(0, len / 2, 0);
      h.position.set(cx, cy, WZ + 0.29);
      h.rotation.z = -ang;
      ground.add(h);
    };
    hand(0.42, (22.67 / 12) * Math.PI * 2, 0.08);
    hand(0.6, (40 / 60) * Math.PI * 2, 0.05);
  }
  // pendant lamp over the room (low, warm) — off-axis so it never blocks the hob
  {
    const shade = new THREE.Mesh(
      new THREE.ConeGeometry(1.0, 0.9, 12, 1, true),
      flat(0x2f4f7a, { side: THREE.DoubleSide, roughness: 0.5 }),
    );
    shade.position.set(-7, CEIL - 2.6, 4.5);
    ground.add(shade);
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.2, 4), flat(0x111111));
    cord.position.set(-7, CEIL - 1.1, 4.5);
    ground.add(cord);
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 8, 6),
      flat(0xfff3d6, { emissive: 0xffd09a, emissiveIntensity: 2.5 }),
    );
    bulb.position.set(-7, CEIL - 3.05, 4.5);
    ground.add(bulb);
    const pl = new THREE.PointLight(0xffc98a, 18, 20, 1.4);
    pl.position.set(-7, CEIL - 3.3, 4.5);
    ground.add(pl);
  }
}

// ---------------------------------------------------------------- outside: rainy street at night
{
  const Y = FLOOR - 4; // the kitchen is on the first floor
  box(
    120,
    0.3,
    14,
    flat(0x2a2c38, { roughness: 0.15, metalness: 0.3 }),
    0,
    Y,
    -16,
    0.03,
    200,
    false,
  );
  const pastel = [0xb8a0c8, 0xc8a890, 0x90a8c8, 0xa8b8a0, 0xd0b0a0];
  const winLit = flat(0xffd58a, { emissive: 0xffb54a, emissiveIntensity: 1.0 });
  const winBlue = flat(0xa8c8ff, { emissive: 0x6f8dff, emissiveIntensity: 0.8 });
  const winDark = flat(0x1c2238, { roughness: 0.2, metalness: 0.3 });
  let x = -50;
  let hi = 0;
  while (x < 40) {
    const w = 6 + r() * 3;
    const h = 18 + r() * 8;
    const col = pastel[hi % pastel.length];
    box(
      w,
      h,
      6,
      flat(new THREE.Color(col).multiplyScalar(0.55)),
      x + w / 2,
      Y + h / 2,
      -26,
      0.03,
      210 + hi,
      false,
    );
    box(
      w + 0.3,
      0.5,
      6.3,
      flat(new THREE.Color(col).multiplyScalar(0.4)),
      x + w / 2,
      Y + h,
      -26,
      0,
      1,
      false,
    );
    const cols = Math.floor((w - 1) / 1.7);
    for (let cx = 0; cx < cols; cx++)
      for (let ry = 0; ry < Math.floor((h - 2.5) / 2.4); ry++) {
        const wxp = x + 1.2 + cx * 1.7 + (w - 1.2 - cols * 1.7) / 2 + 0.5;
        const wyp = Y + 2.6 + ry * 2.4;
        const rr = r();
        const m = new THREE.Mesh(
          new THREE.BoxGeometry(0.9, 1.4, 0.1),
          rr < 0.35 ? winLit : rr < 0.45 ? winBlue : winDark,
        );
        m.position.set(wxp, wyp, -22.95);
        ground.add(m);
      }
    x += w + 0.2;
    hi++;
  }
  // a pink neon sign across the street ("IMBISS"), blinking now and then
  {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 160;
    const g = c.getContext("2d");
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const draw = () => {
      g.clearRect(0, 0, 512, 160);
      g.fillStyle = "#1a0f1f";
      g.fillRect(0, 0, 512, 160);
      g.shadowColor = "#ff4fa8";
      g.shadowBlur = 24;
      g.fillStyle = "#ffd0ea";
      g.font = '800 104px "Montserrat", sans-serif';
      g.textAlign = "center";
      g.fillText("IMBISS", 256, 118);
      tex.needsUpdate = true;
    };
    draw();
    document.fonts?.load('800 104px "Montserrat"').then(draw);
    const signMat = new THREE.MeshBasicMaterial({ map: tex, color: 0xffffff });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 1.6), signMat);
    sign.position.set(-9.5, Y + 6.5, -22.8);
    ground.add(sign);
    const glow = new THREE.PointLight(0xff4fa8, 12, 14, 1.6);
    glow.position.set(-9.5, Y + 6.5, -21.5);
    ground.add(glow);
    onFrame((t) => {
      const f = t % 7.3;
      const on = !(f > 5.0 && f < 5.12) && !(f > 5.25 && f < 5.32);
      signMat.color.setScalar(on ? 1 : 0.25);
      glow.intensity = on ? 12 : 2;
    });
  }
  // street lamps
  for (const lx of [-20, -2, 16]) {
    cyl(0.12, 0.15, 7, 6, flat(0x2a2c33), lx, Y + 3.5, -19.5, 0, 1);
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 8, 6),
      flat(0xfff0c8, { emissive: 0xffd08a, emissiveIntensity: 2 }),
    );
    head.position.set(lx, Y + 7.1, -19.5);
    ground.add(head);
  }
  // rain: thin falling streaks between the kitchen and the houses
  {
    const N = 500;
    const rain = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.025, 0.7, 0.025),
      new THREE.MeshBasicMaterial({ color: 0x9fb4e8, transparent: true, opacity: 0.55 }),
      N,
    );
    rain.userData.noAO = true;
    const rs = rng(55);
    const seeds = Array.from({ length: N }, () => [
      rs() * 50 - 30,
      -7 - rs() * 15,
      rs(),
      0.8 + rs() * 0.5,
    ]);
    const m = new THREE.Matrix4();
    ground.add(rain);
    onFrame((t) => {
      seeds.forEach(([x, z, ph, sp], i) => {
        const H = 26;
        const y = Y + H - ((t * sp * 14 + ph * H) % H);
        m.makeTranslation(x + y * 0.05, y, z);
        rain.setMatrixAt(i, m);
      });
      rain.instanceMatrix.needsUpdate = true;
    });
  }
}

finishSet({ ground: 0x6a4a3a });
export { sky };
