// Set of #31 "Erdloch": a back garden in an Austrian suburb on a late
// Sunday afternoon. Lawn with worn patches, a wooden fence, a garden shed
// with fairy lights as the hero piece behind the stage, vineyard hills on
// the horizon. Life: a lawn sprinkler, smoke from the grill, butterflies,
// swaying trees and birds. The hole itself (the subject) is built in
// scene.js at the origin; so are the shaft, the exit island in the Pacific
// and the space bubble with the Earth.
import { THREE, flat, ground, onFrame, rng, M, jitter, noise2 } from "./world.js";
import {
  SKIES,
  setSky,
  finishSet,
  terrain,
  pathStrip,
  meadow,
  tree,
  pine,
  lightString,
  F,
  add,
} from "./environments.js";
import { place, scatter, bush, flowerBed, fence, rock } from "./props.js";

const SEED = 31;

// ---------------------------------------------------------------- light
// late afternoon: warm low sun from the left, soft blue zenith, golden haze
const sky = setSky({
  ...SKIES.mittag,
  top: [0.32, 0.55, 0.88],
  mid: [0.68, 0.8, 0.95],
  hor: [1.0, 0.88, 0.7],
  below: [0.93, 0.88, 0.8],
  sun: [1.0, 0.86, 0.6],
  sunDir: [-0.7, 0.22, -0.68],
  key: [0xffe2b8, 2.7],
  keyPos: [-8, 9, 6],
  rim: [0xffc890, 0.8],
  hemi: [0xf2f0ff, 0x7d8a6a, 1.4],
  clouds: 12,
  fog: [34, 105],
});

// ---------------------------------------------------------------- ground
// The lawn; the hole in the middle is cut out of it (scene.js covers the
// cut with the dirt wall). Hills rise beyond the fence line.
export const lawn = terrain(0x74b04c, {
  seed: SEED,
  amt: 0.13,
  warm: 0.35,
  flatR: 30,
  hills: 9,
  height: (x, z, d) => {
    if (d <= 30) return 0;
    const v = Math.sin(x * 0.11 + 1.3) * Math.cos(z * 0.09 - 0.4) * 0.5 + 0.5;
    return ((d - 30) / 45) * 10 * (0.4 + 0.6 * v) * (z < 0 ? 1 : 0.5);
  },
});
// stepping-stone path from the terrace (front left) past the hole to the shed
{
  const r = rng(SEED);
  const stoneMat = flat(0xcfc6b8);
  const pts = [
    [-9.5, 9],
    [-8.4, 6.6],
    [-7.6, 4.2],
    [-7.2, 1.6],
    [-6.4, -0.8],
    [-5, -3.2],
    [-3.2, -5.6],
    [-1.4, -8.2],
    [0.4, -10.4],
  ];
  pts.forEach(([x, z], i) => {
    const s = F(
      jitter(new THREE.CylinderGeometry(0.55, 0.6, 0.08, 7), 0.05, SEED + i),
      stoneMat,
      0.08,
      SEED + i,
    );
    s.rotation.y = r() * 3;
    add(s, x, 0.03, z, false);
  });
}
// a gravel strip along the fence
pathStrip(
  [
    [-30, -17],
    [0, -16.4],
    [30, -17.2],
  ],
  { width: 1.4, color: 0xd8cbb0, seed: SEED },
);
meadow({
  n: 420,
  rMin: 6.8,
  rMax: 26,
  seed: SEED,
  flowers: true,
  keep: (x, z) => z > -15.6 && !(Math.abs(x + 7) < 1.4 && z > -6 && z < 10),
});

// ---------------------------------------------------------------- fence + hedge
for (let x = -28; x <= 22; x += 6) place(fence(6, 0x8f6239), x + 3, -17.6);
place(fence(6, 0x8f6239), -24.5, 4.5, Math.PI / 2);
place(fence(6, 0x8f6239), -24.5, -1.5, Math.PI / 2);
place(fence(6, 0x8f6239), -24.5, -7.5, Math.PI / 2);
place(fence(6, 0x8f6239), -24.5, -13.5, Math.PI / 2);

// ---------------------------------------------------------------- planting
[
  [-14, -12.5, 1.25],
  [13.5, -13.5, 1.15],
  [-18.5, 2.5, 1.1],
  [19, 3.5, 1.2],
  [-12, 13, 1.0],
].forEach(([x, z, s], i) => tree(x, z, s, SEED + i));
[
  [-21, -21],
  [24, -22],
  [-27, -9],
  [27, -11],
].forEach(([x, z], i) => pine(x, z, 1.5, SEED + 10 + i));
scatter((i) => bush(SEED + i, i % 2 ? 0x5aa233 : 0x4c9a3a), 9, {
  rMin: 10,
  rMax: 19,
  seed: SEED + 4,
  keep: (x, z) => z > -15.5 && !(x > 4 && x < 13 && z < -6) && !(x > 6 && z > 2),
});
place(flowerBed(SEED), -8.5, -8.6, 0.3);
place(flowerBed(SEED + 1, [0xff6f91, 0xffd84a, 0xffffff]), 9.6, 7.2, -0.4, 0.9);
place(flowerBed(SEED + 2, [0xc9a4ff, 0xffffff]), -15.5, -15.3, 0, 1.1);
[
  [-10.5, 5.5],
  [11, -4.2],
  [8.2, 9.6],
].forEach(([x, z], i) => place(rock(SEED + i, 0.45), x, z));

// ---------------------------------------------------------------- the terrace
// Wooden deck front right with a grill (smoking) and two garden chairs —
// the Sunday afternoon that got interrupted by the hole.
const smokeAt = new THREE.Vector3(11.6, 1.65, 3.4);
{
  const deck = new THREE.Group();
  const plank = flat(0xc08a55, { roughness: 0.8 });
  for (let i = 0; i < 9; i++) {
    const b = F(new THREE.BoxGeometry(6.4, 0.12, 0.62), plank, 0.07, SEED + i);
    b.position.set(0, 0.07, -2.6 + i * 0.66);
    deck.add(b);
  }
  // grill: kettle on three legs, lid open
  const g = new THREE.Group();
  const kettle = F(
    new THREE.SphereGeometry(0.42, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    flat(0x262a33, { roughness: 0.45, metalness: 0.3 }),
    0.05,
    3,
  );
  kettle.position.y = 1.15;
  g.add(kettle);
  const lid = F(
    new THREE.SphereGeometry(0.42, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2),
    flat(0x262a33, { roughness: 0.45, metalness: 0.3 }),
    0.05,
    4,
  );
  lid.position.set(0, 1.18, -0.42);
  lid.rotation.x = -1.2;
  g.add(lid);
  const embers = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.36, 0.04, 10),
    flat(0xff6a2a, { emissive: 0xff4a10, emissiveIntensity: 1.3 }),
  );
  embers.position.y = 1.14;
  g.add(embers);
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 5), M.steel);
    leg.position.set(Math.cos(a) * 0.3, 0.55, Math.sin(a) * 0.3);
    leg.rotation.set(Math.sin(a) * 0.25, 0, -Math.cos(a) * 0.25);
    g.add(leg);
  }
  for (let k = 0; k < 3; k++) {
    const s = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.42, 6),
      flat(0xd96a4a, { roughness: 0.6 }),
    );
    s.rotation.z = Math.PI / 2;
    s.position.set(-0.1 + k * 0.04, 1.2, -0.12 + k * 0.12);
    g.add(s);
  }
  g.position.set(-0.4, 0.13, 0.4);
  deck.add(g);
  // garden chairs (white plastic, the classic)
  const chair = (x, z, ry) => {
    const c = new THREE.Group();
    const white = flat(0xf4f1ea, { roughness: 0.5 });
    const seat = F(new THREE.BoxGeometry(0.7, 0.08, 0.7), white, 0.05, 2);
    seat.position.y = 0.5;
    c.add(seat);
    const back = F(new THREE.BoxGeometry(0.7, 0.75, 0.08), white, 0.05, 3);
    back.position.set(0, 0.9, -0.33);
    back.rotation.x = -0.15;
    c.add(back);
    for (const [lx, lz] of [
      [-0.3, -0.3],
      [0.3, -0.3],
      [-0.3, 0.3],
      [0.3, 0.3],
    ]) {
      const l = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.5, 0.07), white);
      l.position.set(lx, 0.25, lz);
      c.add(l);
    }
    c.position.set(x, 0.13, z);
    c.rotation.y = ry;
    deck.add(c);
  };
  chair(1.6, -1.2, -0.6);
  chair(2.2, 1.0, -1.9);
  deck.traverse((o) => {
    if (o.isMesh) o.castShadow = o.receiveShadow = true;
  });
  deck.position.set(12, 0, 3);
  deck.rotation.y = -0.15;
  ground.add(deck);
}
// grill smoke: soft puffs rising and drifting with the wind
{
  const mat = new THREE.MeshStandardMaterial({
    color: 0xf2eee8,
    transparent: true,
    opacity: 0.5,
    roughness: 1,
    flatShading: true,
    depthWrite: false,
  });
  const puffs = [];
  for (let i = 0; i < 10; i++) {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 0), mat.clone());
    ground.add(m);
    puffs.push(m);
  }
  onFrame((t) =>
    puffs.forEach((m, i) => {
      const f = (t * 0.22 + i / puffs.length) % 1;
      m.position.set(
        smokeAt.x + f * 1.8 + Math.sin(f * 7 + i) * 0.2,
        smokeAt.y + f * 3.6,
        smokeAt.z - f * 0.6,
      );
      m.scale.setScalar(0.5 + f * 2.2);
      m.rotation.set(f * 3 + i, f * 2, 0);
      m.material.opacity = 0.45 * Math.sin(Math.PI * f);
    }),
  );
}

// ---------------------------------------------------------------- hero piece
// The garden shed behind the stage: wooden walls, a red roof, a window with
// a flower box, fairy lights along the eaves, tools leaning on the wall.
{
  const g = new THREE.Group();
  const wood = flat(0xb98252, { roughness: 0.85 });
  const woodDark = flat(0x8a5a34, { roughness: 0.85 });
  const W = 6.2;
  const D = 4.2;
  const H = 2.8;
  // walls from vertical boards
  for (let i = 0; i < 16; i++) {
    const b = F(new THREE.BoxGeometry(W / 16 - 0.02, H, 0.14), i % 2 ? wood : woodDark, 0.06, i);
    b.position.set(-W / 2 + (i + 0.5) * (W / 16), H / 2, D / 2);
    g.add(b);
  }
  const side = F(new THREE.BoxGeometry(W, H, D), wood, 0.06, 40);
  side.position.y = H / 2;
  side.scale.set(0.99, 1, 0.97);
  g.add(side);
  // gable roof
  const roofMat = flat(0xc8483a, { roughness: 0.7 });
  for (const s of [-1, 1]) {
    const r = F(new THREE.BoxGeometry(W + 0.8, 0.16, D / 2 + 0.9), roofMat, 0.08, 41 + s);
    r.position.set(0, H + 0.62, (s * (D / 2 + 0.9)) / 2 - s * 0.05);
    r.rotation.x = s * 0.55;
    g.add(r);
  }
  const gable = new THREE.Shape();
  gable.moveTo(-D / 2, 0);
  gable.lineTo(D / 2, 0);
  gable.lineTo(0, 1.25);
  gable.closePath();
  for (const s of [-1, 1]) {
    const gm = F(
      new THREE.ExtrudeGeometry(gable, { depth: 0.12, bevelEnabled: false }),
      woodDark,
      0.05,
      45,
    );
    gm.rotation.y = Math.PI / 2;
    gm.position.set(s * (W / 2 - 0.06), H, 0);
    g.add(gm);
  }
  // door + window with a flower box
  const door = F(new THREE.BoxGeometry(1.1, 2.1, 0.1), flat(0x4f7a5a), 0.05, 46);
  door.position.set(-1.6, 1.05, D / 2 + 0.1);
  g.add(door);
  const frame = F(new THREE.BoxGeometry(1.5, 1.1, 0.1), flat(0xf4f1ea), 0.04, 47);
  frame.position.set(1.2, 1.7, D / 2 + 0.1);
  g.add(frame);
  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(1.25, 0.85, 0.06),
    flat(0x9fc8e8, {
      roughness: 0.15,
      metalness: 0.2,
      emissive: 0xffd9a0,
      emissiveIntensity: 0.15,
    }),
  );
  glass.position.set(1.2, 1.7, D / 2 + 0.14);
  g.add(glass);
  const box = F(new THREE.BoxGeometry(1.5, 0.28, 0.32), woodDark, 0.05, 48);
  box.position.set(1.2, 1.05, D / 2 + 0.25);
  g.add(box);
  const r = rng(SEED + 7);
  for (let k = 0; k < 9; k++) {
    const f = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.1, 0),
      flat([0xff5a6e, 0xffffff, 0xffd84a][k % 3]),
    );
    f.position.set(0.55 + k * 0.16, 1.27 + r() * 0.08, D / 2 + 0.28);
    g.add(f);
  }
  // a rake and a spade against the wall
  for (const [x, rz] of [
    [2.7, 0.18],
    [-2.6, -0.15],
  ]) {
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.0, 5), woodDark);
    handle.position.set(x, 1.0, D / 2 + 0.25);
    handle.rotation.z = rz;
    g.add(handle);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.4, 0.05), M.steel);
    head.position.set(x - rz * 0.9, 0.2, D / 2 + 0.28);
    g.add(head);
  }
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = o.receiveShadow = true;
  });
  g.position.set(7.5, 0, -11.5);
  g.rotation.y = -0.25;
  ground.add(g);
  // fairy lights along the front eave
  const eave = (x, z) =>
    new THREE.Vector3(x, 0, z).applyAxisAngle(new THREE.Vector3(0, 1, 0), -0.25);
  const a = eave(-W / 2 - 0.3, D / 2 + 0.9);
  const b = eave(W / 2 + 0.3, D / 2 + 0.9);
  lightString([7.5 + a.x, H + 0.15, -11.5 + a.z], [7.5 + b.x, H + 0.15, -11.5 + b.z], {
    n: 16,
    sag: 0.35,
  });
}
// a clothes line between two posts on the left, with a few towels
{
  const postMat = flat(0xdcd6cc);
  const p1 = [-17, -5];
  const p2 = [-11.5, -7];
  for (const [x, z] of [p1, p2]) {
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 2.4, 6), postMat), x, 1.2, z);
  }
  const towels = [0xff7b9c, 0x5fb8ff, 0xffd84a, 0xffffff];
  const tw = [];
  towels.forEach((c, i) => {
    const f = (i + 1) / (towels.length + 1);
    const m = F(new THREE.BoxGeometry(0.8, 1.0, 0.03), flat(c, { roughness: 0.9 }), 0.06, i);
    m.geometry.translate(0, -0.5, 0);
    add(
      m,
      p1[0] + (p2[0] - p1[0]) * f,
      2.3 - Math.sin(Math.PI * f) * 0.25,
      p1[1] + (p2[1] - p1[1]) * f,
    );
    m.rotation.y = Math.atan2(p1[1] - p2[1], p2[0] - p1[0]);
    tw.push(m);
  });
  const line = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(p1[0], 2.35, p1[1]),
        new THREE.Vector3((p1[0] + p2[0]) / 2, 2.0, (p1[1] + p2[1]) / 2),
        new THREE.Vector3(p2[0], 2.35, p2[1]),
      ),
      16,
      0.015,
      4,
    ),
    flat(0xffffff),
  );
  ground.add(line);
  onFrame((t) => tw.forEach((m, i) => (m.rotation.x = Math.sin(t * 1.6 + i * 1.3) * 0.12)));
}

// ---------------------------------------------------------------- far layer
// Vineyard rows on the hills behind the fence + a little white church tower
{
  const rowGeo = new THREE.BoxGeometry(0.35, 0.55, 4.2);
  const rowMat = flat(0x4f8f3a, { roughness: 0.9 });
  const rows = new THREE.InstancedMesh(rowGeo, rowMat, 260);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const c = new THREE.Color();
  let n = 0;
  for (let gx = -60; gx <= 60 && n < 260; gx += 1.6) {
    for (let gz = -66; gz <= -34 && n < 260; gz += 5.2) {
      const d = Math.hypot(gx, gz);
      if (d < 36 || d > 72 || noise2(gx * 0.05, gz * 0.05, 3) < 0.42) continue;
      const v = Math.sin(gx * 0.11 + 1.3) * Math.cos(gz * 0.09 - 0.4) * 0.5 + 0.5;
      const y = ((d - 30) / 45) * 10 * (0.4 + 0.6 * v);
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(gx, gz) + Math.PI / 2);
      m4.compose(new THREE.Vector3(gx, y + 0.2, gz), q, new THREE.Vector3(1, 1, 1));
      rows.setMatrixAt(n, m4);
      rows.setColorAt(
        n,
        c.setHSL(0.27 + noise2(gx, gz, 5) * 0.05, 0.45, 0.32 + noise2(gz, gx, 6) * 0.1),
      );
      n++;
    }
  }
  rows.count = n;
  rows.castShadow = true;
  ground.add(rows);
  const tower = new THREE.Group();
  const white = flat(0xf3eee6);
  const body = F(new THREE.BoxGeometry(1.6, 6, 1.6), white, 0.04, 5);
  body.position.y = 3;
  tower.add(body);
  const onion = F(
    new THREE.SphereGeometry(0.95, 8, 6),
    flat(0x3f7a5a, { roughness: 0.5 }),
    0.06,
    6,
  );
  onion.position.y = 6.7;
  onion.scale.y = 1.25;
  tower.add(onion);
  const spire = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.4, 6), flat(0x3f7a5a));
  spire.position.y = 8.1;
  tower.add(spire);
  tower.position.set(-22, 8.6, -58);
  ground.add(tower);
}

// ---------------------------------------------------------------- life
// lawn sprinkler front left: a fan of water drops sweeping back and forth
{
  const base = add(
    new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.16, 8), flat(0xffd23f)),
    -12.5,
    0.08,
    6.5,
  );
  base.castShadow = true;
  const drops = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.05, 0),
    new THREE.MeshStandardMaterial({
      color: 0xd8f0ff,
      roughness: 0.1,
      transparent: true,
      opacity: 0.8,
    }),
    90,
  );
  ground.add(drops);
  const m4 = new THREE.Matrix4();
  onFrame((t) => {
    const sweep = Math.sin(t * 0.9) * 1.1;
    for (let i = 0; i < 90; i++) {
      const jet = i % 6;
      const f = (t * 0.9 + i / 90 + jet * 0.13) % 1;
      const a = sweep + (jet - 2.5) * 0.08;
      const r = f * 3.4;
      m4.makeTranslation(
        -12.5 + Math.sin(a) * r,
        0.2 + f * 3.0 - f * f * 3.0 + 0.05,
        6.5 + Math.cos(a) * r * 0.4 - r * 0.3,
      );
      drops.setMatrixAt(i, m4);
    }
    drops.instanceMatrix.needsUpdate = true;
  });
}
// butterflies fluttering over the flower beds
{
  const r = rng(SEED + 9);
  const flies = [];
  const colors = [0xffd23f, 0xffffff, 0xff8fb8, 0x8fd0ff];
  for (let i = 0; i < 6; i++) {
    const b = new THREE.Group();
    const wingMat = flat(colors[i % 4], { side: THREE.DoubleSide, roughness: 0.6 });
    const wings = [];
    for (const s of [-1, 1]) {
      const w = new THREE.Mesh(new THREE.CircleGeometry(0.13, 5), wingMat);
      w.geometry.translate(0.13 * s, 0, 0);
      b.add(w);
      wings.push([w, s]);
    }
    const c = [
      [-8.5, -8.6],
      [9.6, 7.2],
      [-15.5, -15.3],
    ][i % 3];
    ground.add(b);
    flies.push({ b, wings, c, ph: r() * 6, rr: 0.8 + r() * 1.2 });
  }
  onFrame((t) =>
    flies.forEach(({ b, wings, c, ph, rr }) => {
      const a = t * 0.7 + ph;
      b.position.set(
        c[0] + Math.cos(a) * rr,
        1.0 + Math.sin(t * 2.1 + ph) * 0.35,
        c[1] + Math.sin(a * 1.3) * rr,
      );
      b.rotation.set(Math.PI / 2 - 0.4, 0, a);
      const flap = Math.sin(t * 22 + ph) * 0.9;
      for (const [w, s] of wings) w.rotation.y = s * flap;
    }),
  );
}

finishSet({ ground: 0x74b04c });
export { sky };
