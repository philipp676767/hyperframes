// Set of #34 "Handy-Akku": an old-building hallway on a dark winter morning,
// 7:41, you have to leave in a minute. The phone charges on the walnut
// dresser; behind it a tall window onto a snowy street where the tram rolls
// by under warm lanterns. Inside: a table lamp, coat hooks with a yellow
// raincoat, a steaming mug, the key bowl. Light: blue hour outside, warm
// lamp inside, the charging glow green.
// Plus two places the story jumps to: the snowy tram stop outside (OUT, the
// cold phone) and the battery's inside (CELL, a dark lab box under the
// floor, built in scene.js).
import { THREE, flat, ground, onFrame, rng, M, patches, facet, facetMat } from "./world.js";
import { SKIES, setSky, finishSet, F, lightString } from "./environments.js";
import { place, lamp, busStop, bin, bush } from "./props.js";

const SEED = 34;
const r = rng(SEED);
export const FLOOR = -4.6; // room floor + street level (dresser top = 0)

// ---------------------------------------------------------------- light
// winter blue hour: deep blue zenith, a pink-orange dawn band low behind the
// window, a few stars left, warm light inside
const sky = setSky({
  ...SKIES.abend,
  top: [0.06, 0.09, 0.27],
  mid: [0.2, 0.26, 0.52],
  hor: [0.98, 0.62, 0.52],
  below: [0.36, 0.38, 0.56],
  sun: [1.0, 0.72, 0.55],
  sunDir: [0.25, 0.05, -1],
  stars: 0.3,
  clouds: 6,
  birds: false,
  hemi: [0xaab6ff, 0x3a3048, 1.15],
  key: [0xffdcb8, 2.2],
  keyPos: [7, 12, 9],
  rim: [0x7f9dff, 1.0],
  fog: [40, 120],
  nightWindows: true,
});

// ---------------------------------------------------------------- materials
const walnut = 0xa8703f;
const wallCol = 0x8fa79a; // sage green
const white = flat(0xf7f3ec);
const snow = flat(0xeef3ff, { roughness: 0.95 });

const box = (w, h, d, mat, x, y, z, amt = 0.04, seed = 1) => {
  const m = F(new THREE.BoxGeometry(w, h, d), mat, amt, seed);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  ground.add(m);
  return m;
};

// ---------------------------------------------------------------- dresser
{
  const top = new THREE.Mesh(
    patches(facet(new THREE.BoxGeometry(22, 0.5, 8.4, 22, 1, 8), 0.04, 3), {
      amt: 0.09,
      scale: 0.3,
      seed: 5,
      warm: 0.5,
    }),
    facetMat(flat(walnut, { roughness: 0.75 })),
  );
  top.position.set(0, -0.25, -0.75);
  top.receiveShadow = top.castShadow = true;
  ground.add(top);
  const body = flat(0x8f5a30, { roughness: 0.6 });
  box(21.2, 4.1, 7.8, body, 0, FLOOR + 2.05, -1.0, 0.03, 4);
  // drawers: 2 rows x 3 columns, brass knobs
  const brass = flat(0xd9a441, { metalness: 0.7, roughness: 0.3 });
  for (let c = 0; c < 3; c++)
    for (let row = 0; row < 2; row++) {
      const x = -7 + c * 7;
      const y = -1.35 - row * 1.85;
      box(6.6, 1.65, 0.16, flat(walnut, { roughness: 0.5 }), x, y, 2.96, 0.05, 10 + c + row * 3);
      const k = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), brass);
      k.position.set(x, y, 3.12);
      k.castShadow = true;
      ground.add(k);
    }
  // feet
  for (const x of [-10.2, 10.2]) box(0.6, 0.4, 0.6, body, x, FLOOR + 0.2, 2.4);
}

// ---------------------------------------------------------------- room shell
{
  // herringbone-ish parquet: planks in two directions, each a touch different
  const planks = [];
  for (let x = -14; x < 32; x += 1.2)
    for (let z = -5; z < 22; z += 2.4)
      planks.push([x, z, (Math.round(x / 1.2) + Math.round(z / 2.4)) % 2]);
  const plank = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1.18, 0.1, 2.38),
    flat(0xffffff, { roughness: 0.55 }),
    planks.length,
  );
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const col = new THREE.Color();
  const wood = new THREE.Color(0xc0874f);
  planks.forEach(([x, z, odd], i) => {
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), odd ? 0 : 0);
    m4.compose(new THREE.Vector3(x, FLOOR - 0.05, z), q, new THREE.Vector3(1, 1, 1));
    plank.setMatrixAt(i, m4);
    plank.setColorAt(i, col.copy(wood).multiplyScalar(0.82 + r() * 0.26));
  });
  plank.receiveShadow = true;
  ground.add(plank);
  box(48, 0.1, 28, flat(0x8a5a32), 9, FLOOR - 0.12, 8, 0, 1);
  // runner rug in front of the dresser
  box(9, 0.06, 4.5, flat(0xb8433a, { roughness: 1 }), 2, FLOOR + 0.03, 7.5, 0.06, 9);
  box(8.2, 0.07, 3.7, flat(0xe8c27a, { roughness: 1 }), 2, FLOOR + 0.04, 7.5, 0.06, 10);

  // back wall with the window opening x[-3.5, 5.5], y[1.2, 9.4]
  const wallMat = flat(wallCol, { roughness: 0.9 });
  const WZ = -5.3;
  const wx0 = -3.5;
  const wx1 = 5.5;
  const wy0 = 1.2;
  const wy1 = 9.4;
  const H = 16;
  box(wx0 + 14, H - FLOOR, 0.4, wallMat, (-14 + wx0) / 2, (FLOOR + H) / 2, WZ, 0.02, 21);
  box(32 - wx1, H - FLOOR, 0.4, wallMat, (wx1 + 32) / 2, (FLOOR + H) / 2, WZ, 0.02, 22);
  box(wx1 - wx0, wy0 - FLOOR, 0.4, wallMat, (wx0 + wx1) / 2, (FLOOR + wy0) / 2, WZ, 0.02, 23);
  box(wx1 - wx0, H - wy1, 0.4, wallMat, (wx0 + wx1) / 2, (wy1 + H) / 2, WZ, 0.02, 24);
  // white skirting + picture rail
  box(46, 0.5, 0.2, white, 9, FLOOR + 0.25, WZ + 0.25);
  box(46, 0.18, 0.18, white, 9, 11.2, WZ + 0.25);
  // window: deep white frame, a cross of glazing bars, sill
  const fr = (w, h, x, y, d = 0.5) => box(w, h, d, white, x, y, WZ + 0.05);
  fr(wx1 - wx0 + 0.8, 0.45, 1, wy1 + 0.2);
  fr(wx1 - wx0 + 0.8, 0.3, 1, wy0 + 0.05);
  fr(0.45, wy1 - wy0 + 0.6, wx0 - 0.2, (wy0 + wy1) / 2);
  fr(0.45, wy1 - wy0 + 0.6, wx1 + 0.2, (wy0 + wy1) / 2);
  fr(0.22, wy1 - wy0, 1, (wy0 + wy1) / 2, 0.3);
  fr(wx1 - wx0, 0.18, 1, 6.6, 0.3);
  box(wx1 - wx0 + 1.4, 0.22, 1.0, white, 1, wy0 - 0.05, WZ + 0.45);
  // a faint glass pane (reflects the lamp a little)
  const pane = new THREE.Mesh(
    new THREE.PlaneGeometry(wx1 - wx0, wy1 - wy0),
    new THREE.MeshStandardMaterial({
      color: 0xcfe2ff,
      roughness: 0.05,
      metalness: 0.2,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
    }),
  );
  pane.position.set(1, (wy0 + wy1) / 2, WZ);
  pane.userData.noAO = true;
  ground.add(pane);
  // curtains: two heavy mustard drapes with folds, swaying very slightly
  const curtainMat = flat(0xd9a03a, { roughness: 0.95 });
  for (const [x, s] of [
    [wx0 - 1.3, 1],
    [wx1 + 1.3, -1],
  ]) {
    const g = new THREE.Group();
    for (let k = 0; k < 4; k++) {
      const f = F(new THREE.CylinderGeometry(0.32, 0.4, 10.6, 7), curtainMat, 0.08, 30 + k);
      f.position.set((k - 1.5) * 0.48, 0, 0);
      f.castShadow = true;
      g.add(f);
    }
    g.position.set(x, 5.3, WZ + 0.55);
    ground.add(g);
    onFrame((t) => (g.rotation.z = Math.sin(t * 0.7 + s) * 0.008 * s));
  }
  box(14.5, 0.14, 0.14, flat(0x3a2a20, { metalness: 0.5, roughness: 0.4 }), 1, 10.75, WZ + 0.55);

  // left wall with coat hooks, a raincoat and a scarf, a round mirror
  box(0.4, H - FLOOR, 18, wallMat, -14, (FLOOR + H) / 2, 3.7, 0.02, 25);
  box(0.2, 0.5, 18, white, -13.75, FLOOR + 0.25, 3.7);
  box(0.25, 0.4, 5.5, flat(0x6b4426), -13.7, 6.4, 5.5);
  for (let k = 0; k < 4; k++) {
    const hook = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 6), M.chrome);
    hook.rotation.z = Math.PI / 2 - 0.3;
    hook.position.set(-13.4, 6.3, 3.4 + k * 1.4);
    ground.add(hook);
  }
  {
    // yellow raincoat
    const coat = new THREE.Group();
    const c1 = F(new THREE.CylinderGeometry(0.55, 1.15, 4.4, 8), flat(0xffc83a), 0.08, 41);
    c1.position.y = -2.2;
    coat.add(c1);
    const hood = F(new THREE.SphereGeometry(0.62, 8, 6), flat(0xf2b72a), 0.08, 42);
    hood.position.y = 0.1;
    coat.add(hood);
    coat.position.set(-13.0, 6.1, 4.8);
    coat.traverse((o) => o.isMesh && (o.castShadow = true));
    ground.add(coat);
    onFrame((t) => (coat.rotation.x = Math.sin(t * 0.9) * 0.012));
    // striped scarf
    for (let k = 0; k < 7; k++) {
      const s = F(
        new THREE.BoxGeometry(0.26, 0.42, 0.5),
        flat(k % 2 ? 0xffffff : 0x2f6fd6),
        0.06,
        50 + k,
      );
      s.position.set(-13.15, 5.8 - k * 0.42, 7.6);
      s.castShadow = true;
      ground.add(s);
    }
  }
  {
    const mirror = new THREE.Mesh(
      new THREE.CircleGeometry(1.6, 32),
      new THREE.MeshStandardMaterial({ color: 0xdfe8f5, metalness: 0.9, roughness: 0.08 }),
    );
    mirror.rotation.y = Math.PI / 2;
    mirror.position.set(-13.75, 5.6, -1.2);
    ground.add(mirror);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.65, 0.14, 8, 32),
      flat(0xc99a3a, { metalness: 0.6, roughness: 0.35 }),
    );
    ring.rotation.y = Math.PI / 2;
    ring.position.copy(mirror.position);
    ground.add(ring);
  }
  // framed pictures right of the window
  const picture = (x, y, w, h, colA, colB, seed) => {
    box(w + 0.3, h + 0.3, 0.14, flat(0x2f2622), x, y, WZ + 0.27);
    box(w, h, 0.1, flat(colA), x, y, WZ + 0.33, 0.06, seed);
    box(w * 0.6, h * 0.35, 0.1, flat(colB), x - w * 0.1, y - h * 0.15, WZ + 0.36, 0.06, seed + 1);
  };
  picture(9.2, 5.8, 2.6, 3.2, 0xf2d6b8, 0xe2694a, 60);
  picture(12.6, 4.9, 2.0, 2.0, 0xbfd8e8, 0x3b6e9a, 62);
  // wall socket left of the window (the charger lives here)
  box(0.9, 0.9, 0.12, white, -6.0, 1.0, WZ + 0.26, 0.02, 70);
}

// ---------------------------------------------------------------- dresser props (outside the stage)
{
  // table lamp, warm, the room's light
  const g = new THREE.Group();
  const base = F(
    new THREE.CylinderGeometry(0.5, 0.75, 1.6, 10),
    flat(0x2f5f6a, { roughness: 0.3 }),
    0.06,
    80,
  );
  base.position.y = 0.8;
  g.add(base);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.4, 6), M.chrome);
  stem.position.y = 2.2;
  g.add(stem);
  const shade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.9, 1.5, 1.5, 12, 1, true),
    flat(0xfff1d6, { emissive: 0xffc77a, emissiveIntensity: 0.9, side: THREE.DoubleSide }),
  );
  shade.position.y = 3.3;
  g.add(shade);
  g.traverse((o) => o.isMesh && (o.castShadow = true));
  g.position.set(-8.6, 0, -3.0);
  ground.add(g);
  const light = new THREE.PointLight(0xffb866, 14, 18, 1.4);
  light.position.set(-8.6, 3.0, -3.0);
  ground.add(light);
}
{
  // key bowl with a key ring
  const bowl = new THREE.Mesh(
    new THREE.SphereGeometry(0.9, 14, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    flat(0xe8e2d6, { side: THREE.DoubleSide, roughness: 0.4 }),
  );
  bowl.scale.y = 0.5;
  bowl.position.set(-7.6, 0.45, 1.6);
  bowl.castShadow = true;
  ground.add(bowl);
  const ringK = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.04, 6, 16), M.chrome);
  ringK.position.set(-7.5, 0.3, 1.6);
  ringK.rotation.x = 1.3;
  ground.add(ringK);
  for (const [dx, c] of [
    [0.2, 0xd9a441],
    [-0.1, 0xb8c0c8],
  ]) {
    const k = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.05, 0.6),
      flat(c, { metalness: 0.7, roughness: 0.3 }),
    );
    k.position.set(-7.5 + dx, 0.32, 1.95);
    ground.add(k);
  }
}
{
  // steaming mug
  const mug = F(
    new THREE.CylinderGeometry(0.45, 0.4, 0.9, 12),
    flat(0xe2453c, { roughness: 0.35 }),
    0.04,
    90,
  );
  mug.position.set(7.6, 0.45, 1.2);
  mug.castShadow = true;
  ground.add(mug);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.07, 6, 10), flat(0xe2453c));
  handle.position.set(8.1, 0.45, 1.2);
  ground.add(handle);
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.4, 12), flat(0x4a2c1a));
  coffee.rotation.x = -Math.PI / 2;
  coffee.position.set(7.6, 0.84, 1.2);
  ground.add(coffee);
  const steamMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    roughness: 1,
  });
  const puffs = [];
  for (let k = 0; k < 6; k++) {
    const p = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 0), steamMat.clone());
    p.userData.noAO = true;
    ground.add(p);
    puffs.push(p);
  }
  onFrame((t) =>
    puffs.forEach((p, k) => {
      const f = (t * 0.35 + k / 6) % 1;
      p.position.set(
        7.6 + Math.sin(f * 6 + k) * 0.18,
        1.0 + f * 2.2,
        1.2 + Math.cos(f * 5 + k) * 0.1,
      );
      p.scale.setScalar(0.6 + f * 1.6);
      p.material.opacity = 0.42 * Math.sin(f * Math.PI);
    }),
  );
}
{
  // potted monstera
  const pot = F(new THREE.CylinderGeometry(0.85, 0.65, 1.4, 10), flat(0xe9e1d4), 0.05, 95);
  pot.position.set(9.2, 0.7, -3.0);
  pot.castShadow = true;
  ground.add(pot);
  const leaves = new THREE.Group();
  for (let k = 0; k < 7; k++) {
    const leaf = F(
      new THREE.SphereGeometry(0.75, 7, 5),
      flat(k % 2 ? 0x3f8f4a : 0x2f7a3e),
      0.1,
      100 + k,
    );
    leaf.scale.set(1, 0.25, 0.7);
    const a = (k / 7) * Math.PI * 2;
    leaf.position.set(Math.cos(a) * 0.8, 2.0 + (k % 3) * 0.5, Math.sin(a) * 0.6);
    leaf.rotation.set(0.4 * Math.sin(a), a, 0.5 * Math.cos(a));
    leaf.castShadow = true;
    leaves.add(leaf);
  }
  leaves.position.set(9.2, 0, -3.0);
  ground.add(leaves);
  onFrame((t) => (leaves.rotation.z = Math.sin(t * 0.8) * 0.02));
  // a little stack of letters
  for (let k = 0; k < 3; k++) {
    const l = box(
      1.6,
      0.06,
      1.0,
      flat([0xffffff, 0xf2e3c4, 0xd8e6f5][k]),
      7.3,
      0.03 + k * 0.06,
      -1.2,
      0.02,
      110 + k,
    );
    l.rotation.y = (k - 1) * 0.15;
  }
}

// ---------------------------------------------------------------- outside: the snowy street
{
  const Y = FLOOR;
  // pavement under the window, snow on top
  box(90, 0.3, 4.6, flat(0xb9b6c2), 0, Y - 0.15, -8.0, 0.03, 120);
  box(90, 0.12, 4.0, snow, 0, Y + 0.06, -7.8, 0.05, 121);
  // street with tram rails and slushy snow lines
  box(90, 0.2, 7.4, flat(0x4a4a58, { roughness: 0.7 }), 0, Y - 0.2, -13.9, 0.03, 122);
  for (const z of [-12.6, -13.6, -15.0, -16.0])
    box(90, 0.06, 0.12, flat(0x9aa0aa, { metalness: 0.8, roughness: 0.3 }), 0, Y - 0.06, z, 0, 1);
  for (const z of [-10.6, -17.4]) box(90, 0.08, 0.7, snow, 0, Y - 0.06, z, 0.05, 123);
  // far pavement + houses across the street, lit windows
  box(90, 0.3, 9.4, flat(0xb9b6c2), 0, Y - 0.15, -22.3, 0.03, 124);
  box(90, 0.12, 8.6, snow, 0, Y + 0.06, -22.2, 0.05, 125);
  const pastel = [0xe9b8a8, 0xf2d0a4, 0xb8c7e0, 0xc9b3d9, 0xa8d5c2, 0xf0e2b6];
  const winLit = flat(0xffd58a, { emissive: 0xffb54a, emissiveIntensity: 1.1 });
  const winDark = flat(0x2c3450, { roughness: 0.2, metalness: 0.3 });
  let x = -42;
  let hi = 0;
  while (x < 42) {
    const w = 6 + r() * 3;
    const h = 11 + r() * 6;
    const col = pastel[hi % pastel.length];
    const body = box(w, h, 6, flat(col), x + w / 2, Y + h / 2, -30, 0.03, 130 + hi);
    body.castShadow = false;
    box(
      w + 0.3,
      0.4,
      6.3,
      flat(new THREE.Color(col).multiplyScalar(0.8)),
      x + w / 2,
      Y + h,
      -30,
      0.03,
      1,
    );
    // snowy roof cap
    box(w + 0.4, 0.5, 6.4, snow, x + w / 2, Y + h + 0.45, -30, 0.05, 150 + hi);
    const cols = Math.floor((w - 1) / 1.6);
    for (let cx = 0; cx < cols; cx++)
      for (let ry = 0; ry < Math.floor((h - 2.5) / 2.2); ry++) {
        const wx = x + 1.1 + cx * 1.6 + (w - 1.2 - cols * 1.6) / 2 + 0.6;
        const wy = Y + 2.6 + ry * 2.2;
        const m = new THREE.Mesh(
          new THREE.BoxGeometry(0.9, 1.3, 0.1),
          r() < 0.55 ? winLit : winDark,
        );
        m.position.set(wx, wy, -26.95);
        ground.add(m);
        box(1.1, 0.12, 0.3, flat(0xf4efe6), wx, wy - 0.72, -26.9, 0, 1);
      }
    // shop front with an awning on some
    if (hi % 2 === 0) {
      const shop = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.6, 1.6, 0.1),
        flat(0xffe2a6, { emissive: 0xffb34a, emissiveIntensity: 0.9 }),
      );
      shop.position.set(x + w / 2, Y + 1.1, -26.94);
      ground.add(shop);
      box(
        w * 0.7,
        0.2,
        1.4,
        flat([0xc0392b, 0x2f7d4a, 0x2f6fd6][hi % 3]),
        x + w / 2,
        Y + 2.25,
        -26.3,
        0.03,
        1,
      );
    }
    x += w + 0.15;
    hi++;
  }
  // church tower far behind, the clock face glowing
  {
    const tx = 14;
    const tz = -42;
    box(5, 26, 5, flat(0xd9cfc0), tx, Y + 13, tz, 0.03, 170);
    const spire = F(new THREE.ConeGeometry(3.6, 9, 4), flat(0x3f7a6a), 0.06, 171);
    spire.rotation.y = Math.PI / 4;
    spire.position.set(tx, Y + 30.5, tz);
    ground.add(spire);
    const face = new THREE.Mesh(
      new THREE.CircleGeometry(1.5, 24),
      flat(0xfff1c8, { emissive: 0xffd27a, emissiveIntensity: 1 }),
    );
    face.position.set(tx, Y + 20, tz + 2.55);
    ground.add(face);
    const hand1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.1, 0.05), flat(0x222222));
    hand1.position.set(tx + 0.35, Y + 20.25, tz + 2.6);
    hand1.rotation.z = -1.2;
    ground.add(hand1);
  }
  // distant snowy roof line
  for (let k = 0; k < 14; k++) {
    const w = 8 + r() * 6;
    const h = 14 + r() * 10;
    box(w, h, 5, flat(0x8f8fb0), -60 + k * 9.5, Y + h / 2, -36 - r() * 6, 0.03, 180 + k);
    box(w + 0.4, 0.6, 5.4, snow, -60 + k * 9.5, Y + h + 0.3, -36, 0.05, 200 + k);
  }
  // lanterns, a tram stop and bins on the near pavement
  for (const lx of [-10, 1, 13, 24]) place(lamp({ on: true, h: 4.6 }), lx, -9.6, 0, 1.1, Y);
  for (const lx of [-20, 30]) place(lamp({ on: true, h: 4.6 }), lx, -18.2, Math.PI, 1.1, Y);
  place(busStop(), 7.8, -10.2, 0, 1.0, Y);
  place(bin(), -5, -8.6, 0, 1, Y);
  place(bush(3, 0x3f7a4a), 18, -7.4, 0, 1, Y);
  // fairy lights over the street
  lightString([-30, Y + 7, -26.9], [30, Y + 7, -26.9], { n: 40, sag: 1.2, glow: 1.2 });
}

// ---------------------------------------------------------------- life: the tram + snowfall
{
  const tram = new THREE.Group();
  const red = flat(0xd6312b, { roughness: 0.4 });
  const cream = flat(0xf4ead6, { roughness: 0.5 });
  const L = 14;
  const body = F(new THREE.BoxGeometry(L, 2.2, 2.6), red, 0.03, 300);
  body.position.y = 1.5;
  tram.add(body);
  const band = new THREE.Mesh(new THREE.BoxGeometry(L + 0.02, 1.0, 2.62), cream);
  band.position.y = 3.0;
  tram.add(band);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(L - 0.4, 0.3, 2.3), flat(0x9aa0aa));
  roof.position.y = 3.65;
  tram.add(roof);
  const winM = flat(0xffe3a8, { emissive: 0xffc56b, emissiveIntensity: 1.0 });
  for (let k = 0; k < 9; k++) {
    const w = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.8, 2.64), winM);
    w.position.set(-L / 2 + 1.0 + k * 1.5, 3.0, 0);
    tram.add(w);
  }
  const pant = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.6, 0.1), flat(0x333333));
  pant.position.set(1, 4.5, 0);
  pant.rotation.z = 0.5;
  tram.add(pant);
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 8, 6),
    flat(0xffffff, { emissive: 0xfff2c8, emissiveIntensity: 2 }),
  );
  head.position.set(L / 2 + 0.02, 1.4, 0.7);
  tram.add(head);
  tram.traverse((o) => o.isMesh && (o.castShadow = true));
  // overhead wire
  box(90, 0.05, 0.05, flat(0x222222), 0, FLOOR + 6.4, -14.3, 0, 1);
  tram.position.set(0, FLOOR, -14.3);
  ground.add(tram);
  // passes left → right every 16 s, in view of the window around t≈7 and t≈44
  onFrame((t) => (tram.position.x = (((t + 6) * 5.2) % 84) - 46));

  // snow: instanced flakes over the street, falling and drifting
  const N = 700;
  const flakes = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.07, 0),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
    N,
  );
  flakes.userData.noAO = true;
  const rs = rng(77);
  const seeds = Array.from({ length: N }, () => [
    rs() * 60 - 30,
    rs() * -26 - 6,
    rs(),
    0.6 + rs() * 0.6,
    rs() * 6,
  ]);
  const m4 = new THREE.Matrix4();
  ground.add(flakes);
  onFrame((t) => {
    seeds.forEach(([x, z, ph, sp, w], i) => {
      const H = 18;
      const y = FLOOR + H - ((t * sp * 1.4 + ph * H) % H);
      m4.makeTranslation(x + Math.sin(t * 0.8 + w) * 0.4, y, z + Math.cos(t * 0.6 + w) * 0.3);
      flakes.setMatrixAt(i, m4);
    });
    flakes.instanceMatrix.needsUpdate = true;
  });
}

finishSet({ ground: 0x6a5a6a });
export { sky };
