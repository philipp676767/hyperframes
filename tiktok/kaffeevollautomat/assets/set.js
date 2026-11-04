// #56 Kaffeevollautomat — an office tea kitchen high up in a tower, Monday
// 8 a.m.: a long oak worktop along a bottle-green tiled wall, sage cabinets
// with post-its, and a floor-to-ceiling glass front on the right with the
// city skyline in the morning sun. The machine lives on the worktop between
// the colleagues' mugs. Life: sun shafts with dust, drifting clouds, a plane
// crossing, the kettle steaming, the plant swaying.
import { THREE, flat, M, ground, onFrame, facet, facetMat, patches, rng, V } from "./world.js";
import { SKIES, setSky, finishSet, fireflies, F, add } from "./environments.js";
import { bush, sway } from "./props.js";

const SEED = 56;
const r = rng(SEED);

// ---------------------------------------------------------------- light
setSky({
  ...SKIES.morgen,
  top: [0.34, 0.58, 0.92],
  mid: [0.72, 0.8, 0.95],
  hor: [1.0, 0.86, 0.66],
  below: [0.86, 0.82, 0.8],
  sunDir: [0.75, 0.16, -1],
  keyPos: [9, 9, 5],
  key: [0xffe8c8, 2.6],
  rim: [0xffd7a8, 0.9],
  fog: [60, 230],
  clouds: 12,
  birds: false,
});
scene_fixups();

// ---------------------------------------------------------------- worktop
const OAK = 0xd6ad7c;
const top = new THREE.Mesh(
  patches(facet(new THREE.BoxGeometry(30, 0.36, 5.0, 30, 1, 6), 0.035, 3), {
    amt: 0.07,
    scale: 0.3,
    seed: 4,
    warm: 0.5,
  }),
  facetMat(flat(OAK, { roughness: 0.5 })),
);
top.position.set(-3, -0.18, -0.1);
top.receiveShadow = true;
top.castShadow = true;
ground.add(top);
// front edge strip (darker oak) so the counter reads as a slab
add(new THREE.Mesh(new THREE.BoxGeometry(30, 0.12, 0.1), flat(0xb98a58)), -3, -0.3, 2.42);

// base cabinets (sage) + kick plate, the carpet far below
const SAGE = 0x86ad98;
for (let x = -17.5; x < 11; x += 2.6) {
  const d = F(new THREE.BoxGeometry(2.5, 5.1, 0.25), flat(SAGE), 0.04, 30 + x);
  d.position.set(x + 1.3, -2.95, 2.2);
  d.receiveShadow = true;
  ground.add(d);
  add(new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.12, 0.14), M.chrome), x + 1.3, -0.85, 2.4, false);
}
add(new THREE.Mesh(new THREE.BoxGeometry(30, 0.5, 0.2), flat(0x3b4048)), -3, -5.75, 2.05, false);
const carpet = new THREE.Mesh(
  patches(facet(new THREE.PlaneGeometry(90, 90, 30, 30), 0.05, 7), {
    amt: 0.08,
    scale: 0.1,
    seed: 8,
  }),
  facetMat(flat(0x5d6b82)),
);
carpet.rotation.x = -Math.PI / 2;
carpet.position.set(0, -6.0, 10);
carpet.receiveShadow = true;
ground.add(carpet);

// ---------------------------------------------------------------- back wall (left part, solid)
const WALL_Z = -2.6;
const wall = new THREE.Mesh(new THREE.BoxGeometry(24, 22, 0.4), flat(0xefe3d1));
wall.position.set(-9.5, 5, WALL_Z - 0.2);
wall.receiveShadow = true;
ground.add(wall);
// bottle-green subway tiles behind the worktop: a dark ground for the red machine
{
  const tiles = [];
  for (let x = -20.8; x <= 2.0; x += 0.62)
    for (let row = 0, y = 0.17; y < 4.3; y += 0.34, row++) tiles.push([x + (row % 2) * 0.31, y]);
  const im = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.58, 0.3, 0.06),
    flat(0xffffff, { roughness: 0.25 }),
    tiles.length,
  );
  const m4 = new THREE.Matrix4();
  const c = new THREE.Color();
  const base = new THREE.Color(0x2c5a4c);
  tiles.forEach(([x, y], i) => {
    im.setMatrixAt(i, m4.makeTranslation(Math.min(x, 2.2), y, WALL_Z + 0.03));
    im.setColorAt(i, c.copy(base).multiplyScalar(0.86 + r() * 0.26));
  });
  im.receiveShadow = true;
  ground.add(im);
  // grout behind the tiles
  add(
    new THREE.Mesh(new THREE.BoxGeometry(23.4, 4.3, 0.02), flat(0x1f3a33)),
    -9.3,
    2.15,
    WALL_Z + 0.005,
    false,
  );
}
// upper cabinets with post-its
for (let x = -17; x < 1.5; x += 3.1) {
  const c = F(new THREE.BoxGeometry(3.0, 3.3, 2.0), flat(SAGE), 0.04, 50 + x);
  c.position.set(x + 1.5, 7.15, WALL_Z + 1.0);
  c.castShadow = true;
  c.receiveShadow = true;
  ground.add(c);
  add(
    new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 0.14), M.chrome),
    x + 2.6,
    6.0,
    WALL_Z + 2.06,
    false,
  );
}
[
  [-7.6, 6.9, 0xffe066, 0.08],
  [-7.0, 7.5, 0xff8fb8, -0.12],
  [-1.2, 7.2, 0x9be3ff, 0.1],
  [-13.3, 6.6, 0xffe066, -0.05],
].forEach(([x, y, col, rz]) => {
  const p = add(
    new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.02), flat(col)),
    x,
    y,
    WALL_Z + 2.02,
    false,
  );
  p.rotation.z = rz;
});
// under-cabinet light strip (warm glow on the tiles)
add(
  new THREE.Mesh(
    new THREE.BoxGeometry(18, 0.06, 0.2),
    new THREE.MeshBasicMaterial({ color: 0xfff1d2 }),
  ),
  -8,
  5.45,
  WALL_Z + 1.6,
  false,
);
{
  const l = new THREE.PointLight(0xffd9a0, 6, 9, 1.6);
  l.position.set(-3, 4.8, WALL_Z + 1.2);
  ground.add(l);
}

// ---------------------------------------------------------------- glass front (hero piece)
// from x = 2.6 to the right: mullions, a transom, a thin sill — the city outside
{
  const frame = flat(0x2a2d33, { roughness: 0.5 });
  for (let x = 2.6; x <= 30; x += 4.2)
    add(new THREE.Mesh(new THREE.BoxGeometry(0.22, 22, 0.3), frame), x, 5, WALL_Z - 0.1);
  add(new THREE.Mesh(new THREE.BoxGeometry(28, 0.18, 0.3), frame), 16, 9.6, WALL_Z - 0.1);
  add(new THREE.Mesh(new THREE.BoxGeometry(28, 0.3, 0.5), frame), 16, -0.1, WALL_Z - 0.1);
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(28, 22),
    new THREE.MeshStandardMaterial({
      color: 0xcfe6f5,
      roughness: 0.05,
      metalness: 0.2,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    }),
  );
  glass.position.set(16, 5, WALL_Z - 0.12);
  glass.userData.noAO = true;
  ground.add(glass);
  // ceiling
  const ceil = new THREE.Mesh(new THREE.BoxGeometry(60, 0.3, 30), flat(0xf3efe9));
  ceil.position.set(0, 13.5, 10);
  ground.add(ceil);
}

// skyline far below and behind the glass: towers in morning sun
{
  const cols = [0xd9c7b0, 0xb8c6d6, 0xe6d3bd, 0x9fb1c6, 0xcab59c, 0xf0e2cf, 0x8ea2ba];
  const winMat = flat(0x5d7ea8, { roughness: 0.2, metalness: 0.3 });
  for (let i = 0; i < 46; i++) {
    const x = -10 + r() * 90;
    const z = -40 - r() * 80;
    const w = 3 + r() * 6;
    const h = 8 + r() * 34 * (1 - Math.abs(x - 30) / 80);
    const d = 3 + r() * 6;
    const y0 = -30;
    const b = F(new THREE.BoxGeometry(w, h + 30, d), flat(cols[i % cols.length]), 0.05, i);
    b.position.set(x, y0 + (h + 30) / 2, z);
    ground.add(b);
    // window bands
    for (let k = 1; k < h / 2.4; k++) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(w * 0.86, 0.5, 0.05), winMat);
      s.position.set(x, y0 + 30 + k * 2.4 - 1.2, z + d / 2 + 0.03);
      ground.add(s);
    }
    if (i % 9 === 0) {
      // a spire / antenna
      add(
        new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 6, 5), M.steel),
        x,
        y0 + h + 33,
        z,
        false,
      );
    }
  }
  // a hazy far band of hills
  const hills = new THREE.Mesh(
    new THREE.CylinderGeometry(160, 160, 14, 48, 1, true, -1.2, 2.4),
    new THREE.MeshBasicMaterial({ color: 0xb7c6d8, side: THREE.BackSide, fog: false }),
  );
  hills.position.set(0, -24, 0);
  ground.add(hills);
}

// a plane crossing the sky, slowly (life)
{
  const plane = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.3, 5, 8), flat(0xffffff));
  body.rotation.z = Math.PI / 2;
  plane.add(body);
  const wing = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 6), flat(0xe8eef5));
  plane.add(wing);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.08), flat(0xe8463a));
  tail.position.set(-2.3, 0.6, 0);
  plane.add(tail);
  ground.add(plane);
  onFrame((t) => {
    const k = (t / 45) % 1;
    plane.position.set(-20 + k * 120, 34 + k * 6, -110);
  });
}

// ---------------------------------------------------------------- props on the worktop
const mugCols = [0xffffff, 0xf2c94c, 0x2f6fd6, 0xe86a5a, 0x3a3a44];
function mug(col, h = 0.55, rr = 0.26) {
  const g = new THREE.Group();
  const m = flat(col, { roughness: 0.35 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(rr, rr * 0.92, h, 14), m);
  body.position.y = h / 2;
  body.castShadow = true;
  g.add(body);
  const hd = new THREE.Mesh(new THREE.TorusGeometry(h * 0.24, 0.045, 6, 12), m);
  hd.position.set(rr + 0.05, h * 0.52, 0);
  g.add(hd);
  return g;
}
// mug tree of the colleagues, left behind the machine
[
  [-3.2, -1.6, 0],
  [-3.85, -1.2, 1],
  [-3.0, -0.75, 2],
  [-4.6, -1.7, 3],
  [-5.3, -1.0, 4],
].forEach(([x, z, i]) => {
  const m = mug(mugCols[i]);
  m.position.set(x, 0, z);
  m.rotation.y = r() * 6;
  ground.add(m);
});
// coffee bean bag (kraft paper) next to the machine
{
  const bag = F(new THREE.BoxGeometry(0.9, 1.5, 0.6, 2, 3, 2), flat(0xc89b6a), 0.06, 61);
  bag.position.set(2.2, 0.75, -1.5);
  bag.rotation.y = -0.4;
  bag.castShadow = true;
  ground.add(bag);
  const label = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.02), flat(0x2b2b30));
  label.position.set(2.2 + Math.sin(-0.4) * 0.31, 0.85, -1.5 + Math.cos(-0.4) * 0.31);
  label.rotation.y = -0.4;
  ground.add(label);
}
// kettle (steaming now and then) far left
const kettle = new THREE.Group();
{
  const b = F(
    new THREE.CylinderGeometry(0.5, 0.62, 1.1, 10),
    flat(0xf4f1ec, { roughness: 0.3 }),
    0.04,
    71,
  );
  b.position.y = 0.55 + 0.12;
  kettle.add(b);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.66, 0.12, 14), flat(0x2a2d33));
  base.position.y = 0.06;
  kettle.add(base);
  const sp = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.5, 6), flat(0xf4f1ec));
  sp.position.set(0.55, 1.0, 0);
  sp.rotation.z = -1.0;
  kettle.add(sp);
  const hd = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.07, 6, 10, Math.PI), flat(0x2a2d33));
  hd.position.set(-0.5, 0.95, 0);
  hd.rotation.z = Math.PI / 2;
  kettle.add(hd);
  kettle.position.set(-8.2, 0, -1.2);
  ground.add(kettle);
}
// fruit bowl + paper towel roll + cutlery pot, far left
{
  const bowl = add(
    new THREE.Mesh(
      new THREE.SphereGeometry(0.9, 14, 7, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
      flat(0x2f6fd6, { side: THREE.DoubleSide }),
    ),
    -11,
    0.75,
    -1.0,
  );
  bowl.scale.y = 0.75;
  for (let i = 0; i < 6; i++)
    add(
      F(
        new THREE.IcosahedronGeometry(0.3, 1),
        flat([0xd8352a, 0xffb347, 0x79c24a, 0xffe066][i % 4]),
        0.06,
        i,
      ),
      -11 + Math.cos(i * 1.7) * 0.45,
      0.48 + (i % 2) * 0.22,
      -1.0 + Math.sin(i * 1.7) * 0.45,
    );
  add(
    new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 1.2, 12), flat(0xffffff)),
    -6.6,
    0.6,
    -1.9,
  );
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.5, 6), M.chrome), -6.6, 0.75, -1.9);
  add(
    new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.7, 10), flat(0xe86a5a)),
    4.0,
    0.35,
    -1.8,
  );
  for (let i = 0; i < 4; i++)
    add(
      new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 5), M.chrome),
      3.95 + (i % 2) * 0.1,
      0.8,
      -1.8 + (i > 1 ? 0.08 : -0.06),
      false,
    ).rotation.z = (i - 1.5) * 0.12;
}
// plant in a pot by the window (sways)
{
  const pot = F(new THREE.CylinderGeometry(0.7, 0.55, 1.1, 10), flat(0xd9774b), 0.05, 81);
  pot.position.set(7.4, 0.55, -1.3);
  pot.castShadow = true;
  ground.add(pot);
  const leaves = bush(9, 0x3f8f4a);
  leaves.position.set(7.4, 1.1, -1.3);
  leaves.scale.setScalar(1.5);
  ground.add(leaves);
  sway(leaves, 3, 0.03);
}
// stack of paper cups + sugar jar right of the machine, by the window
{
  for (let i = 0; i < 6; i++)
    add(
      new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.17, 0.4, 12), flat(0xf6f0e6)),
      6.3,
      0.2 + i * 0.12,
      -1.9,
      i === 0,
    );
  const jar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.6, 12),
    new THREE.MeshStandardMaterial({
      color: 0xe6f4ff,
      roughness: 0.05,
      transparent: true,
      opacity: 0.45,
    }),
  );
  jar.position.set(5.9, 0.3, -1.5);
  jar.userData.noAO = true;
  ground.add(jar);
  add(
    new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.35, 12), flat(0xffffff)),
    5.9,
    0.18,
    -1.5,
  );
}
// office water dispenser standing on the floor at the right, in front of the glass
{
  const g = new THREE.Group();
  const body = F(new THREE.BoxGeometry(1.4, 4.6, 1.4), flat(0xeef1f4), 0.04, 91);
  body.position.y = 2.3;
  g.add(body);
  const bottle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.62, 0.62, 2.0, 14),
    new THREE.MeshStandardMaterial({
      color: 0x6cc4ff,
      roughness: 0.05,
      transparent: true,
      opacity: 0.6,
    }),
  );
  bottle.position.y = 5.6;
  bottle.userData.noAO = true;
  g.add(bottle);
  const tap = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), flat(0x2f6fd6));
  tap.position.set(0, 3.4, 0.72);
  g.add(tap);
  g.position.set(12.5, -6, 1.5);
  g.traverse((o) => (o.castShadow = true));
  ground.add(g);
}

// ---------------------------------------------------------------- light shafts + dust (life)
{
  const shaftMat = new THREE.MeshBasicMaterial({
    color: 0xfff0d0,
    transparent: true,
    opacity: 0.04,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: false,
  });
  const shafts = [];
  for (let i = 0; i < 4; i++) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(2.2 + i * 0.4, 16), shaftMat);
    s.position.set(5 + i * 3.6, 6, 0.5);
    s.rotation.set(0, -0.5, 0.75);
    s.userData.noAO = true;
    ground.add(s);
    shafts.push(s);
  }
  onFrame((t) => {
    shaftMat.opacity = 0.035 + 0.01 * Math.sin(t * 0.7);
  });
  fireflies(90, { area: [-4, 12, 0.4, 7, -2.2, 4], color: 0xfff1cf, size: 0.022, seed: 56 });
}

// kettle steam puffs (life, far left)
{
  const steamMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
  });
  const puffs = [];
  for (let i = 0; i < 7; i++) {
    const p = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 0), steamMat);
    p.userData.noAO = true;
    ground.add(p);
    puffs.push(p);
  }
  onFrame((t) => {
    puffs.forEach((p, i) => {
      const k = (t * 0.35 + i / puffs.length) % 1;
      p.position.set(-8.2 + 0.85 + k * 0.6 + Math.sin(k * 6 + i) * 0.15, 1.4 + k * 2.4, -1.2);
      p.scale.setScalar(0.5 + k * 1.8);
    });
    steamMat.opacity = 0.35;
  });
}

finishSet({ ground: OAK });

function scene_fixups() {
  // nothing yet — kept for set-specific tweaks after setSky
}
export const WORKTOP_Y = 0;
export const SPOT_A = V(-4.4, 0, 0.9); // analogy spot left (cups)
export const SPOT_B = V(4.4, 0, 0.9); // analogy spot right (bean, kettle, mug)
