// #60 Bluetooth-Kopfhörer — a basement gym on a Monday evening: dark rubber
// floor tiles, cool neon tubes on a low concrete ceiling, a full mirror wall
// with a magenta neon dumbbell above it (hero piece), a dumbbell rack, a
// power rack with bumper plates, two treadmills, a plyo box, a punching
// bag, and the counter in the corner with the WLAN router and the
// microwave. Small basement windows show the last blue of the evening.
// Life: the runners run, the punching bag swings, the wall fan turns, chalk
// dust drifts in the neon light, the router blinks.
//
// Scale: the toy people (people.js) are ~7 units tall standing, a bench
// seat is 1.8 high — 1 unit ≈ 25 cm.
import { THREE, flat, M, ground, onFrame, facet, facetMat, patches, rng, V } from "./world.js";
import { SKIES, setSky, finishSet, fireflies, F, add } from "./environments.js";
import { person, FACE_PX } from "./people.js";

const SEED = 60;
const r = rng(SEED);

// ---------------------------------------------------------------- light
setSky({
  ...SKIES.studio,
  top: [0.06, 0.07, 0.12],
  mid: [0.1, 0.11, 0.18],
  hor: [0.16, 0.17, 0.26],
  below: [0.08, 0.08, 0.12],
  hemi: [0xc8d4ff, 0x2a2630, 1.5],
  key: [0xf2f6ff, 2.2],
  keyPos: [3, 12, 8],
  rim: [0xff5fc8, 1.1],
  fog: [34, 95],
});

// ---------------------------------------------------------------- floor: rubber tiles
const FLOOR = 0x2f3440;
{
  const tiles = [];
  for (let x = -24; x < 24; x += 4) for (let z = -18; z < 18; z += 4) tiles.push([x + 2, z + 2]);
  const im = new THREE.InstancedMesh(
    facet(new THREE.BoxGeometry(3.94, 0.2, 3.94, 3, 1, 3), 0.04, 3),
    facetMat(flat(0xffffff, { roughness: 0.92 })),
    tiles.length,
  );
  const m4 = new THREE.Matrix4();
  const c = new THREE.Color();
  const base = new THREE.Color(FLOOR);
  tiles.forEach(([x, z], i) => {
    im.setMatrixAt(i, m4.makeTranslation(x, -0.1, z));
    im.setColorAt(i, c.copy(base).multiplyScalar(0.88 + r() * 0.22));
  });
  im.receiveShadow = true;
  ground.add(im);
  // coloured rubber flecks (EPDM granules) scattered on the tiles
  const n = 900;
  const fl = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.09, 0.02, 0.09),
    flat(0xffffff, { roughness: 0.9 }),
    n,
  );
  const cols = [0x5d7fb8, 0x8a94a8, 0xb24a5a, 0x6aa38a];
  const q = new THREE.Quaternion();
  for (let i = 0; i < n; i++) {
    q.setFromAxisAngle(V(0, 1, 0), r() * 3);
    m4.compose(V(-24 + r() * 48, 0.005, -18 + r() * 36), q, V(1, 1, 1));
    fl.setMatrixAt(i, m4);
    fl.setColorAt(i, c.set(cols[i % 4]));
  }
  fl.userData.noAO = true;
  ground.add(fl);
  // wooden lifting platform in front of the power rack
  const plat = new THREE.Mesh(
    patches(facet(new THREE.BoxGeometry(7, 0.16, 6, 8, 1, 6), 0.04, 5), {
      amt: 0.08,
      scale: 0.4,
      seed: 6,
      warm: 0.6,
    }),
    facetMat(flat(0xb98a58, { roughness: 0.6 })),
  );
  plat.receiveShadow = true;
  add(plat, 12.5, 0.08, -9.5, false);
}

// ---------------------------------------------------------------- walls + ceiling
const BACK_Z = -16;
const CEIL = 13.5;
const wallMat = flat(0x3a4150, { roughness: 0.95 });
{
  const back = F(new THREE.BoxGeometry(52, 16, 0.5, 26, 8, 1), wallMat, 0.03, 11);
  back.position.set(0, 7, BACK_Z - 0.25);
  back.receiveShadow = true;
  ground.add(back);
  const left = F(new THREE.BoxGeometry(0.5, 16, 40, 1, 8, 20), wallMat, 0.03, 12);
  left.position.set(-24, 7, 0);
  left.receiveShadow = true;
  ground.add(left);
  const right = F(new THREE.BoxGeometry(0.5, 16, 40, 1, 8, 20), flat(0x2c4b52), 0.03, 13);
  right.position.set(24, 7, 0);
  right.receiveShadow = true;
  ground.add(right);
  // a broad yellow stripe on the right wall (gym branding)
  add(new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.1, 40), flat(0xffc83a)), 23.7, 6.2, 0, false);
  add(new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 40), flat(0xffc83a)), 23.7, 5.1, 0, false);
  const ceil = F(new THREE.BoxGeometry(52, 0.4, 40, 26, 1, 20), flat(0x2a2e38), 0.03, 14);
  ceil.position.set(0, CEIL + 0.2, 0);
  ceil.receiveShadow = false;
  ground.add(ceil);
  // exposed ducts along the ceiling
  for (const x of [-15, 15]) {
    const d = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.7, 40, 12),
      flat(0x8b93a3, { metalness: 0.6, roughness: 0.4 }),
    );
    d.rotation.x = Math.PI / 2;
    add(d, x, CEIL - 0.9, 0, false);
  }
  // skirting
  add(
    new THREE.Mesh(new THREE.BoxGeometry(52, 0.6, 0.1), flat(0x1c1f27)),
    0,
    0.3,
    BACK_Z + 0.02,
    false,
  );
}

// neon tubes on the ceiling (cool white), with a few point lights
const neonMat = new THREE.MeshBasicMaterial({ color: 0xeaf2ff });
for (let x = -18; x <= 18; x += 6)
  for (const z of [-11, -3, 5]) {
    const tube = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 4.6), neonMat);
    tube.userData.noAO = true;
    add(tube, x, CEIL - 0.1, z, false);
  }
for (const [x, z, i] of [
  [-6, -3, 9],
  [6, -3, 9],
  [0, 5, 7],
  [-14, -8, 7],
  [14, -6, 8],
]) {
  const l = new THREE.PointLight(0xdfe8ff, i, 18, 1.4);
  l.position.set(x, CEIL - 1.5, z);
  ground.add(l);
}

// basement windows high on the left wall: the last blue of the evening
for (const z of [-10, -2, 6]) {
  add(new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.0, 4.4), flat(0x1c1f27)), -23.8, 11.2, z, false);
  const g = new THREE.Mesh(
    new THREE.PlaneGeometry(4.0, 1.6),
    new THREE.MeshBasicMaterial({ color: 0x3f63b8 }),
  );
  g.rotation.y = Math.PI / 2;
  g.userData.noAO = true;
  add(g, -23.62, 11.2, z, false);
  // grass tufts against the glass (we are below street level)
  for (let k = 0; k < 5; k++) {
    const b = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.6, 4), flat(0x24402e));
    add(b, -23.55, 10.6, z - 1.6 + k * 0.8, false);
  }
}

// ---------------------------------------------------------------- mirror wall (hero piece)
{
  const mirror = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 8.6),
    new THREE.MeshStandardMaterial({ color: 0xaab8cc, metalness: 1, roughness: 0.06 }),
  );
  mirror.userData.noAO = true;
  add(mirror, 0, 4.9, BACK_Z + 0.06, false);
  const frame = flat(0x15171d, { roughness: 0.5 });
  for (let x = -15; x <= 15; x += 5)
    add(new THREE.Mesh(new THREE.BoxGeometry(0.16, 8.8, 0.16), frame), x, 4.9, BACK_Z + 0.1, false);
  add(new THREE.Mesh(new THREE.BoxGeometry(30.3, 0.2, 0.2), frame), 0, 9.25, BACK_Z + 0.1, false);
  add(new THREE.Mesh(new THREE.BoxGeometry(30.3, 0.2, 0.2), frame), 0, 0.55, BACK_Z + 0.1, false);
  // magenta neon: a line over the mirror and a dumbbell icon
  const pink = new THREE.MeshBasicMaterial({ color: 0xff4fc3 });
  const line = new THREE.Mesh(new THREE.BoxGeometry(30, 0.12, 0.12), pink);
  line.userData.noAO = true;
  add(line, 0, 9.7, BACK_Z + 0.2, false);
  const icon = new THREE.Group();
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 3.2, 8), pink);
  bar.rotation.z = Math.PI / 2;
  icon.add(bar);
  for (const s of [-1, 1])
    for (const [dx, h] of [
      [1.25, 1.5],
      [1.6, 1.0],
    ]) {
      const p = new THREE.Mesh(new THREE.TorusGeometry(h / 2, 0.08, 6, 4), pink);
      p.rotation.y = Math.PI / 2;
      p.rotation.x = Math.PI / 4;
      p.position.x = s * dx;
      p.scale.set(1, 1, 0.3);
      icon.add(p);
    }
  icon.traverse((o) => (o.userData.noAO = true));
  icon.position.set(0, 11.5, BACK_Z + 0.3);
  ground.add(icon);
  const pl = new THREE.PointLight(0xff4fc3, 10, 16, 1.5);
  pl.position.set(0, 10.5, BACK_Z + 2);
  ground.add(pl);
}

// ---------------------------------------------------------------- dumbbell rack (back, left)
{
  const blk = flat(0x22252c, { roughness: 0.6, metalness: 0.3 });
  const x0 = -13;
  const x1 = -3;
  for (const x of [x0, (x0 + x1) / 2, x1]) {
    add(new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.4, 0.25), blk), x, 1.7, -12.6);
    add(new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.2, 0.25), blk), x, 1.1, -11.4);
  }
  for (const [y, z] of [
    [3.3, -12.6],
    [2.1, -11.4],
  ]) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0 + 0.4, 0.14, 1.0), blk);
    s.rotation.x = 0.25;
    add(s, (x0 + x1) / 2, y, z);
  }
  const head = flat(0x1a1c21, { roughness: 0.5 });
  const handle = M.chrome;
  const ringCols = [0xe2453c, 0x3f7fe0, 0xffd23f, 0x3fbf7a, 0xf08a2c];
  let k = 0;
  for (const [y, z] of [
    [3.75, -12.55],
    [2.55, -11.35],
  ])
    for (let x = x0 + 0.6; x < x1 - 0.3; x += 1.15, k++) {
      const db = new THREE.Group();
      const s = 0.8 + (k % 5) * 0.08;
      const h = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.9, 8), handle);
      h.rotation.x = Math.PI / 2;
      db.add(h);
      for (const e of [-1, 1]) {
        const hx = F(new THREE.CylinderGeometry(0.3 * s, 0.3 * s, 0.32, 6), head, 0.05, k * 2 + e);
        hx.rotation.x = Math.PI / 2;
        hx.position.z = e * 0.55;
        hx.castShadow = true;
        db.add(hx);
        const ring = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2 * s, 0.2 * s, 0.04, 6),
          flat(ringCols[k % 5]),
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.z = e * 0.72;
        db.add(ring);
      }
      db.position.set(x, y, z);
      db.rotation.y = 0.04 * Math.sin(k);
      ground.add(db);
    }
}

// ---------------------------------------------------------------- power rack + bumper plates (back, right)
{
  const steel = flat(0x1d2027, { roughness: 0.5, metalness: 0.4 });
  const R0 = [12.5, -11];
  for (const [dx, dz] of [
    [-2.6, -1.6],
    [2.6, -1.6],
    [-2.6, 1.6],
    [2.6, 1.6],
  ])
    add(new THREE.Mesh(new THREE.BoxGeometry(0.3, 9, 0.3), steel), R0[0] + dx, 4.6, R0[1] + dz);
  for (const dz of [-1.6, 1.6])
    add(new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.3, 0.3), steel), R0[0], 9.0, R0[1] + dz);
  for (const dx of [-2.6, 2.6])
    add(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 3.5), steel), R0[0] + dx, 9.0, R0[1]);
  // the barbell resting in the hooks
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 9, 10), M.chrome);
  bar.rotation.z = Math.PI / 2;
  add(bar, R0[0], 5.2, R0[1] + 1.6);
  const plateCols = [0xd23c3c, 0x2f6fd6, 0xd23c3c];
  for (const s of [-1, 1])
    plateCols.forEach((c, i) => {
      const p = F(
        new THREE.CylinderGeometry(1.5 - i * 0.25, 1.5 - i * 0.25, 0.32, 14),
        flat(c, { roughness: 0.75 }),
        0.04,
        20 + i,
      );
      p.rotation.z = Math.PI / 2;
      add(p, R0[0] + s * (3.3 + i * 0.34), 5.2, R0[1] + 1.6);
    });
  // plate tree with spare plates
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4, 8), steel), 19, 2, -12.5);
  add(new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.2, 2.2), steel), 19, 0.1, -12.5);
  [0x2f6fd6, 0xffd23f, 0x3fbf7a].forEach((c, i) => {
    const p = F(
      new THREE.CylinderGeometry(1.3 - i * 0.25, 1.3 - i * 0.25, 0.3, 14),
      flat(c, { roughness: 0.75 }),
      0.04,
      30 + i,
    );
    p.rotation.x = Math.PI / 2;
    add(p, 19, 1.5 + i * 0.4, -12.2 + i * 0.32);
  });
}

// ---------------------------------------------------------------- treadmills (left)
function treadmill(x, z) {
  const g = new THREE.Group();
  const body = flat(0x2a2e36, { roughness: 0.5, metalness: 0.3 });
  const deck = F(new THREE.BoxGeometry(7, 0.9, 2.6), body, 0.03, x + z);
  deck.position.y = 0.45;
  g.add(deck);
  const belt = new THREE.Mesh(
    new THREE.BoxGeometry(6.4, 0.06, 2.0),
    flat(0x111216, { roughness: 0.95 }),
  );
  belt.position.y = 0.93;
  g.add(belt);
  for (const s of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.22, 4.6, 0.22), body);
    post.position.set(3.0, 3.0, s * 1.15);
    post.rotation.z = 0.12;
    g.add(post);
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4, 8), M.chrome);
    rail.rotation.z = Math.PI / 2;
    rail.position.set(1.9, 4.0, s * 1.15);
    g.add(rail);
  }
  const consoleM = F(new THREE.BoxGeometry(0.6, 1.2, 2.5), body, 0.03, 7);
  consoleM.position.set(2.85, 5.3, 0);
  consoleM.rotation.z = -0.5;
  g.add(consoleM);
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(1.0, 1.9),
    new THREE.MeshBasicMaterial({ color: 0x2fd6ff }),
  );
  screen.rotation.y = -Math.PI / 2;
  screen.rotation.x = 0;
  screen.position.set(2.5, 5.45, 0);
  screen.rotation.z = 0;
  screen.rotateX(-0.5);
  g.add(screen);
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = o.receiveShadow = true;
  });
  g.position.set(x, 0, z);
  ground.add(g);
  return g;
}
treadmill(-15, -7.5);
treadmill(-15, -1.5);

// ---------------------------------------------------------------- plyo box, mats, kettlebells, bag, plant
{
  const box = F(new THREE.BoxGeometry(3.0, 1.8, 2.4), flat(0x6b4a33, { roughness: 0.8 }), 0.05, 41);
  add(box, -8.5, 0.9, -8.5);
  // kettlebells in a row
  const kbCols = [0x1d2027, 0xe2453c, 0x3f7fe0, 0xffd23f];
  for (let i = 0; i < 4; i++) {
    const kb = new THREE.Group();
    const s = 0.8 + i * 0.12;
    const b = F(
      new THREE.IcosahedronGeometry(0.55 * s, 1),
      flat(kbCols[i], { roughness: 0.5 }),
      0.05,
      50 + i,
    );
    b.position.y = 0.5 * s;
    b.scale.y = 0.9;
    kb.add(b);
    const h = new THREE.Mesh(
      new THREE.TorusGeometry(0.32 * s, 0.07, 6, 12, Math.PI),
      flat(0x1d2027),
    );
    h.position.y = 0.95 * s;
    kb.add(h);
    kb.traverse((o) => {
      if (o.isMesh) o.castShadow = true;
    });
    kb.position.set(-5.2 + i * 1.5, 0, -13.6);
    ground.add(kb);
  }
  // rolled yoga mats in a basket
  const basket = F(
    new THREE.CylinderGeometry(1.1, 0.95, 1.6, 10, 1, true),
    flat(0x7a5a3a),
    0.05,
    61,
  );
  basket.material.side = THREE.DoubleSide;
  add(basket, -19.5, 0.8, 9.5);
  [0x8f6bd6, 0x3fbf9a, 0xff8a7a, 0x4a7bd6].forEach((c, i) => {
    const m = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 3.2, 10),
      flat(c, { roughness: 0.8 }),
    );
    m.rotation.z = (i - 1.5) * 0.12;
    m.rotation.x = (i % 2 ? 1 : -1) * 0.1;
    add(m, -19.5 + (i - 1.5) * 0.45, 1.8, 9.5 + (i % 2 ? 0.3 : -0.3));
  });
  // monstera in a pot in the far left corner
  const pot = F(new THREE.CylinderGeometry(0.9, 0.7, 1.4, 10), flat(0xe8e2d6), 0.05, 71);
  add(pot, -21, 0.7, -13.5);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const leaf = new THREE.Mesh(
      new THREE.CircleGeometry(0.9, 7),
      flat(0x2f7a4a, { side: THREE.DoubleSide }),
    );
    leaf.position.set(-21 + Math.cos(a) * 0.9, 2.6 + (i % 3) * 0.5, -13.5 + Math.sin(a) * 0.9);
    leaf.rotation.set(-1.0, a, 0.3);
    leaf.castShadow = true;
    ground.add(leaf);
  }
}

// punching bag on a chain (front right) — it swings
const bag = new THREE.Group();
{
  const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.2, 5), M.chrome);
  chain.position.y = -1.6;
  bag.add(chain);
  const b = F(
    new THREE.CylinderGeometry(1.0, 1.0, 5.2, 12),
    flat(0x8c1f2a, { roughness: 0.45 }),
    0.04,
    81,
  );
  b.position.y = -3.2 - 2.6;
  b.castShadow = true;
  bag.add(b);
  for (const y of [-3.4, -8.2]) {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.02, 1.02, 0.25, 12), flat(0x1a1c21));
    cap.position.y = y;
    bag.add(cap);
  }
  bag.position.set(17.5, CEIL, 7);
  ground.add(bag);
}

// ---------------------------------------------------------------- counter: router + microwave (right)
export const COUNTER = { x: 17.5, z: -2.5, top: 3.9 };
export const ROUTER_POS = [15.2, COUNTER.top, -3.0];
export const MICRO_POS = [18.6, COUNTER.top, -3.2];
const routerLeds = [];
let microDoorLight = null;
let microPlate = null;
{
  const wood = flat(0x7a5236, { roughness: 0.7 });
  const c = F(new THREE.BoxGeometry(9, COUNTER.top - 0.2, 3.4, 6, 2, 2), flat(0xe9e4da), 0.03, 91);
  add(c, COUNTER.x, (COUNTER.top - 0.2) / 2, COUNTER.z);
  add(
    F(new THREE.BoxGeometry(9.4, 0.22, 3.8), wood, 0.04, 92),
    COUNTER.x,
    COUNTER.top - 0.1,
    COUNTER.z,
  );
  // front panel stripe in the gym yellow
  add(
    new THREE.Mesh(new THREE.BoxGeometry(9, 0.5, 0.05), flat(0xffc83a)),
    COUNTER.x,
    2.6,
    COUNTER.z + 1.72,
    false,
  );
  // router: flat box, 3 antennas, a row of LEDs
  const rt = new THREE.Group();
  const rb = F(
    new THREE.BoxGeometry(1.8, 0.35, 1.2),
    flat(0xf4f4f6, { roughness: 0.35 }),
    0.03,
    93,
  );
  rb.position.y = 0.18;
  rb.castShadow = true;
  rt.add(rb);
  for (const dx of [-0.7, 0, 0.7]) {
    const a = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 1.4, 6), flat(0x1d2027));
    a.position.set(dx, 0.9, -0.5);
    a.rotation.z = dx * 0.35;
    a.castShadow = true;
    rt.add(a);
  }
  for (let i = 0; i < 5; i++) {
    const led = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.06, 0.04),
      new THREE.MeshBasicMaterial({ color: 0x3fff8a }),
    );
    led.position.set(-0.6 + i * 0.3, 0.2, 0.61);
    rt.add(led);
    routerLeds.push(led);
  }
  rt.position.set(...ROUTER_POS);
  rt.rotation.y = -0.15;
  ground.add(rt);
  // microwave
  const mw = new THREE.Group();
  const body = F(
    new THREE.BoxGeometry(2.6, 1.6, 1.8),
    flat(0xd8dade, { roughness: 0.35, metalness: 0.2 }),
    0.03,
    94,
  );
  body.position.y = 0.8;
  body.castShadow = true;
  mw.add(body);
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 1.25, 0.06),
    flat(0x15171d, { roughness: 0.15 }),
  );
  door.position.set(-0.35, 0.8, 0.91);
  mw.add(door);
  microDoorLight = new THREE.Mesh(
    new THREE.PlaneGeometry(1.45, 1.0),
    new THREE.MeshBasicMaterial({ color: 0xffb35a, transparent: true, opacity: 0 }),
  );
  microDoorLight.position.set(-0.35, 0.8, 0.95);
  microDoorLight.userData.noAO = true;
  mw.add(microDoorLight);
  microPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.05, 10), flat(0xffffff));
  microPlate.position.set(-0.35, 0.25, 0.1);
  mw.add(microPlate);
  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.25),
    new THREE.MeshBasicMaterial({ color: 0x3fffb0 }),
  );
  panel.position.set(0.9, 1.25, 0.91);
  mw.add(panel);
  for (let i = 0; i < 3; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.14, 0.05), flat(0x9aa0aa));
    b.position.set(0.9, 0.9 - i * 0.25, 0.91);
    mw.add(b);
  }
  mw.position.set(...MICRO_POS);
  mw.rotation.y = -0.2;
  ground.add(mw);
  // shaker + protein tub + blender
  const shaker = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.26, 1.0, 10),
    flat(0x3fbfff, { roughness: 0.3 }),
  );
  add(shaker, 13.6, COUNTER.top + 0.5, -2.2);
  const tub = F(
    new THREE.CylinderGeometry(0.55, 0.55, 1.3, 10),
    flat(0x1d2027, { roughness: 0.4 }),
    0.03,
    95,
  );
  add(tub, 20.9, COUNTER.top + 0.65, -2.0);
  add(
    new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.4, 10), flat(0xff6a2a)),
    20.9,
    COUNTER.top + 0.7,
    -2.0,
    false,
  );
  // shelf above with tubs
  add(new THREE.Mesh(new THREE.BoxGeometry(8, 0.2, 1.4), wood), 18, 8.2, BACK_Z + 0.8, false);
  for (let i = 0; i < 5; i++) {
    const t2 = F(
      new THREE.CylinderGeometry(0.5, 0.5, 1.2, 10),
      flat([0x1d2027, 0xffffff, 0xe2453c][i % 3], { roughness: 0.4 }),
      0.03,
      96 + i,
    );
    add(t2, 15 + i * 1.5, 8.9, BACK_Z + 0.8);
  }
}

// wall fan on the right wall
const fanBlades = new THREE.Group();
{
  const cage = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.06, 6, 20), M.chrome);
  cage.rotation.y = Math.PI / 2;
  cage.position.set(23.2, 10.5, -8);
  ground.add(cage);
  for (let i = 0; i < 3; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.1, 0.42), flat(0xdfe3ea));
    b.position.y = 0.55;
    const piv = new THREE.Group();
    piv.rotation.x = (i / 3) * Math.PI * 2;
    piv.add(b);
    fanBlades.add(piv);
  }
  fanBlades.position.set(23.1, 10.5, -8);
  ground.add(fanBlades);
}

// ---------------------------------------------------------------- the other people (all with earbuds)
// Runners on the treadmills (facing +x), a lifter at the rack, a woman on
// the plyo box. Each has a colour for her / his own radio signal.
export const CROWD = [];
function phoneMesh(color) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.08, 1.2),
    flat(0x15171d, { roughness: 0.3 }),
  );
  g.add(b);
  const s = new THREE.Mesh(
    new THREE.PlaneGeometry(0.54, 1.08),
    new THREE.MeshBasicMaterial({ color }),
  );
  s.rotation.x = -Math.PI / 2;
  s.position.y = 0.045;
  g.add(s);
  g.traverse((o) => (o.castShadow = true));
  return g;
}
{
  const runner1 = person({
    top: 0xe2453c,
    legs: 0x1d2027,
    hair: 0x2a1a12,
    style: "bun",
    stand: true,
    seed: 3,
    skin: 0xd9a27a,
  });
  runner1.g.position.set(-15.4, 0.95, -7.5);
  runner1.g.rotation.y = FACE_PX;
  const p1 = phoneMesh(0xff7ab8);
  p1.position.set(-12.35, 5.55, -7.5);
  p1.rotation.z = 0.6;
  ground.add(p1);
  CROWD.push({ p: runner1, color: 0xff4fa8, phone: p1, run: 0 });

  const runner2 = person({
    top: 0x3fbf9a,
    legs: 0x2f3a4f,
    hair: 0x8a5a2a,
    style: "short",
    stand: true,
    seed: 5,
  });
  runner2.g.position.set(-15.4, 0.95, -1.5);
  runner2.g.rotation.y = FACE_PX;
  const p2 = phoneMesh(0x7affc8);
  p2.position.set(-12.35, 5.55, -1.5);
  p2.rotation.z = 0.6;
  ground.add(p2);
  CROWD.push({ p: runner2, color: 0x3fffb0, phone: p2, run: 1.7 });

  const lifter = person({
    top: 0x1d2027,
    legs: 0x4a4f5a,
    hair: 0x15100c,
    style: "cap",
    stand: true,
    seed: 7,
    skin: 0x9a6a48,
  });
  lifter.g.position.set(12.5, 0.16, -7.2);
  const p3 = phoneMesh(0x9ad0ff);
  p3.position.set(15.1, 0.2, -6.4);
  p3.rotation.y = 0.4;
  ground.add(p3);
  CROWD.push({ p: lifter, color: 0x4fa8ff, phone: p3, run: -1 });

  const sitter = person({ top: 0x8f6bd6, legs: 0x1d2027, hair: 0xe0b060, style: "long", seed: 9 });
  sitter.g.position.set(-8.5, 1.8, -8.3);
  sitter.g.rotation.y = 0.35;
  // she holds her phone in front of her
  sitter.armL.sh.rotation.set(-0.9, 0, 0.25);
  sitter.armL.el.rotation.set(-1.2, 0, 0);
  const p4 = phoneMesh(0xffd27a);
  sitter.armL.el.add(p4);
  p4.position.set(0, -1.15, 0.2);
  p4.rotation.set(Math.PI / 2 + 0.3, 0, 0);
  CROWD.push({ p: sitter, color: 0xffa83a, phone: p4, run: -1 });
}

// ---------------------------------------------------------------- life
fireflies(70, { area: [-20, 20, 1, 12, -14, 10], color: 0xeaf0ff, seed: SEED, size: 0.035 });
onFrame((t) => {
  // runners: bob + arm swing
  for (const c of CROWD) {
    if (c.run < 0) continue;
    const ph = t * 9.5 + c.run;
    c.p.g.position.y = 0.95 + Math.abs(Math.sin(ph)) * 0.18;
    c.p.armL.sh.rotation.x = -0.35 + Math.sin(ph) * 0.6;
    c.p.armR.sh.rotation.x = -0.35 - Math.sin(ph) * 0.6;
  }
  // the lifter rolls his shoulders, the sitter scrolls
  const lf = CROWD[2].p;
  lf.torso.rotation.z = Math.sin(t * 1.3) * 0.04;
  CROWD[3].p.head.rotation.x = 0.25 + Math.sin(t * 0.7) * 0.05;
  // punching bag swing
  bag.rotation.z = Math.sin(t * 1.6) * 0.07;
  bag.rotation.x = Math.sin(t * 1.1 + 1) * 0.04;
  // fan
  fanBlades.rotation.x = t * 9;
  // router LEDs blink
  routerLeds.forEach((l, i) => (l.visible = Math.sin(t * (7 + i * 3.1) + i * 1.7) > -0.3));
});

// microwave on/off (scene.js decides when it runs)
export function setMicrowave(on, t) {
  microDoorLight.material.opacity = on ? 0.85 : 0;
  microPlate.rotation.y = on ? t * 2.2 : 0;
}

finishSet({ ground: FLOOR });
