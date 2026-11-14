// #91 Flugmodus — "Abendflug über dem Alpenvorland": the landscape far
// below the plane as a giant-scale miniature at sunset — patchwork fields,
// a village with a church, a lake, pine woods, a row of cell towers along
// the flight path, one snowy peak right under the route, the Alps on the
// horizon and a small airport with approach lights at the far end.
// The cabin (window seat) and the cockpit are built in scene.js.
import { THREE, flat, ground, onFrame, rng, jitter, roundedBox } from "./world.js";
import { setSky, finishSet, terrain, pathStrip, pond, pine, F } from "./environments.js";

const SEED = 91;
const r = rng(SEED);

// ---------------------------------------------------------------- light
// golden hour: the sun low on the left (-x), warm side light, violet zenith
export const sky = setSky({
  top: [0.2, 0.22, 0.52],
  mid: [0.56, 0.42, 0.66],
  hor: [1.0, 0.68, 0.42],
  below: [0.78, 0.6, 0.62],
  sun: [1.0, 0.8, 0.5],
  sunDir: [-1, 0.08, -0.3],
  cloud: [0xffd9c4, 0xc77fa0],
  clouds: 12,
  birds: false,
  hemi: [0xffe0d0, 0x5a4a5a, 1.2],
  key: [0xffc690, 2.7],
  keyPos: [-15, 7, -3],
  rim: [0x9a8cff, 0.8],
  fog: [70, 190],
});

// ---------------------------------------------------------------- ground
const GREEN = 0x6f9a4a;
terrain(GREEN, { r: 110, seed: SEED, flatR: 58, hills: 16, amt: 0.1, warm: 0.45, step: 3.4 });

// keep-out zones (village, lake, airport, peak) for fields and woods
export const VILLAGE = [-5, -4];
export const LAKE = [9, 8];
export const RUNWAY = { x0: 20, x1: 46, z: 13, w: 2.6 };
export const PEAK = [-9, -15];
export const TOWERS = [
  [-15, -2.5],
  [-4.5, 3.2],
  [6, -2.8],
  [16, 2.6],
  [27, -2.4],
];
function free(x, z, pad = 0) {
  if (Math.hypot(x - VILLAGE[0], z - VILLAGE[1]) < 5.2 + pad) return false;
  if (Math.hypot((x - LAKE[0]) / 6, (z - LAKE[1]) / 4) < 1 + pad * 0.1) return false;
  if (x > RUNWAY.x0 - 9 && x < RUNWAY.x1 + 3 && Math.abs(z - RUNWAY.z) < 5 + pad) return false;
  if (Math.hypot(x - PEAK[0], z - PEAK[1]) < 7.5 + pad) return false;
  for (const [tx, tz] of TOWERS) if (Math.hypot(x - tx, z - tz) < 1.2) return false;
  return true;
}

// patchwork fields: one instanced quad per field, own colour each
{
  const cols = [0x8fb84e, 0xc9b25a, 0x7a9a3c, 0xa7c262, 0xb88a4e, 0x5f8a3a, 0xd6c27a, 0x94a84a];
  const geo = new THREE.PlaneGeometry(1, 1);
  geo.rotateX(-Math.PI / 2);
  const mat = flat(0xffffff, { roughness: 0.95 });
  const list = [];
  for (let gx = -46; gx < 46; gx += 3.4)
    for (let gz = -40; gz < 34; gz += 3.0) {
      const x = gx + (r() - 0.5) * 0.6;
      const z = gz + (r() - 0.5) * 0.6;
      if (!free(x, z, 0.5) || r() < 0.18) continue;
      list.push([x, z, 2.6 + r() * 0.8, 2.2 + r() * 0.7, cols[Math.floor(r() * cols.length)]]);
    }
  const inst = new THREE.InstancedMesh(geo, mat, list.length);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const c = new THREE.Color();
  list.forEach(([x, z, w, d, col], i) => {
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), (r() - 0.5) * 0.12);
    m4.compose(new THREE.Vector3(x, 0.035, z), q, new THREE.Vector3(w, 1, d));
    inst.setMatrixAt(i, m4);
    inst.setColorAt(i, c.setHex(col).offsetHSL(0, 0, (r() - 0.5) * 0.06));
  });
  inst.receiveShadow = true;
  ground.add(inst);
  // furrow stripes on a few fields (ploughed look)
  const sGeo = new THREE.PlaneGeometry(1, 0.08);
  sGeo.rotateX(-Math.PI / 2);
  const stripes = [];
  list.forEach(([x, z, w, d, col]) => {
    if (r() > 0.35) return;
    for (let k = -3; k <= 3; k++) stripes.push([x, z + k * d * 0.12, w * 0.92, col]);
  });
  const sInst = new THREE.InstancedMesh(sGeo, flat(0xffffff, { roughness: 1 }), stripes.length);
  stripes.forEach(([x, z, w, col], i) => {
    m4.compose(new THREE.Vector3(x, 0.04, z), new THREE.Quaternion(), new THREE.Vector3(w, 1, 1));
    sInst.setMatrixAt(i, m4);
    sInst.setColorAt(i, c.setHex(col).multiplyScalar(0.8));
  });
  ground.add(sInst);
}

// roads: one through the village to the airport, one crossing
pathStrip(
  [
    [-60, -1],
    [-30, 0.5],
    [-12, -1.2],
    [-5, -4],
    [4, -0.5],
    [14, 1.5],
    [21, 9.5],
    [30, 9.6],
  ],
  { width: 0.55, color: 0x5d5d64, seed: SEED, lift: 0.045 },
);
pathStrip(
  [
    [-8, 40],
    [-6, 10],
    [-5, -4],
    [-2, -22],
    [2, -50],
  ],
  { width: 0.42, color: 0x6a6a70, seed: SEED + 1, lift: 0.046 },
);
pond(LAKE[0], LAKE[1], { rx: 5.6, rz: 3.4, color: 0x3f7fa6, seed: SEED });

// ---------------------------------------------------------------- village
const wallCols = [0xf2ead8, 0xe9dcc2, 0xf6f1e6, 0xe2cfb0, 0xf0e2c8];
const roofCols = [0xb4472e, 0x9c3b28, 0x7a3a2a, 0xc0583a];
const winMat = flat(0xffc46a, { emissive: 0xffa040, emissiveIntensity: 0.9 });
function house(x, z, rot, s = 1) {
  const g = new THREE.Group();
  const w = 0.7 * s;
  const d = 0.5 * s;
  const h = 0.42 * s;
  const body = new THREE.Mesh(
    roundedBox(w, h, d, 0.03),
    flat(wallCols[Math.floor(r() * wallCols.length)]),
  );
  body.position.y = h / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);
  const roofGeo = new THREE.CylinderGeometry(0.001, d * 0.62, w * 1.08, 4, 1);
  const roof = F(
    roofGeo.rotateZ(Math.PI / 2).rotateX(Math.PI / 4),
    flat(roofCols[Math.floor(r() * roofCols.length)]),
    0.06,
    Math.floor(r() * 100),
  );
  roof.scale.set(1, 0.62, 1);
  roof.position.y = h + 0.13 * s;
  roof.castShadow = true;
  g.add(roof);
  for (const sx of [-0.18, 0.18]) {
    if (r() < 0.35) continue;
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.09 * s, 0.1 * s, 0.01), winMat);
    win.position.set(sx * s, h * 0.55, d / 2 + 0.004);
    g.add(win);
  }
  g.position.set(x, 0, z);
  g.rotation.y = rot;
  ground.add(g);
}
{
  const [vx, vz] = VILLAGE;
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI * 2;
    const d = 1.4 + r() * 3.4;
    house(vx + Math.cos(a) * d, vz + Math.sin(a) * d * 0.8, a + Math.PI / 2, 0.85 + r() * 0.35);
  }
  // church: nave + tower with an onion-ish spire (Alpine)
  const church = new THREE.Group();
  const nave = new THREE.Mesh(roundedBox(1.3, 0.62, 0.6, 0.03), flat(0xf7f2e8));
  nave.position.y = 0.31;
  nave.castShadow = true;
  church.add(nave);
  const nr = F(
    new THREE.CylinderGeometry(0.001, 0.45, 1.36, 4).rotateZ(Math.PI / 2).rotateX(Math.PI / 4),
    flat(0x5a4038),
    0.04,
    3,
  );
  nr.scale.set(1, 0.6, 1);
  nr.position.y = 0.78;
  church.add(nr);
  const tower = new THREE.Mesh(roundedBox(0.38, 1.5, 0.38, 0.03), flat(0xf7f2e8));
  tower.position.set(-0.75, 0.75, 0);
  tower.castShadow = true;
  church.add(tower);
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 24, 16),
    flat(0x3f6b4a, { roughness: 0.4 }),
  );
  bulb.scale.set(1, 1.15, 1);
  bulb.position.set(-0.75, 1.7, 0);
  church.add(bulb);
  const spire = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.5, 16), flat(0x3f6b4a));
  spire.position.set(-0.75, 2.05, 0);
  church.add(spire);
  const clock = new THREE.Mesh(
    new THREE.CircleGeometry(0.1, 24),
    flat(0x2a3a60, { emissive: 0x3050a0, emissiveIntensity: 0.3 }),
  );
  clock.position.set(-0.75, 1.25, 0.195);
  church.add(clock);
  church.position.set(vx + 0.4, 0, vz + 0.2);
  church.rotation.y = 0.3;
  ground.add(church);
}

// ---------------------------------------------------------------- woods
{
  let n = 0;
  for (let k = 0; k < 900 && n < 70; k++) {
    // clusters
    const cx = [-26, -20, 18, 34, -36, 2, 12, -16][k % 8];
    const cz = [-14, 12, -14, -10, 4, -20, 20, 22][k % 8];
    const x = cx + (r() - 0.5) * 10;
    const z = cz + (r() - 0.5) * 7;
    if (!free(x, z, 0.3)) continue;
    pine(x, z, 0.28 + r() * 0.16, n + 3);
    n++;
  }
}

// ---------------------------------------------------------------- the peak + the Alps
const rockMat = flat(0x7c7480, { roughness: 0.95 });
const snowMat = flat(0xfaf6f2, { roughness: 0.8 });
function mountain(x, z, rad, h, seed, snowFrom = 0.55) {
  const g = new THREE.Group();
  const geo = jitter(new THREE.ConeGeometry(rad, h, 9, 5), rad * 0.07, seed);
  const m = F(geo, rockMat, 0.12, seed);
  m.position.y = h / 2;
  m.castShadow = true;
  m.receiveShadow = true;
  g.add(m);
  const capH = h * (1 - snowFrom);
  const cap = F(
    jitter(new THREE.ConeGeometry(rad * (1 - snowFrom) * 1.06, capH, 9, 2), rad * 0.04, seed + 1),
    snowMat,
    0.06,
    seed + 1,
  );
  cap.position.y = h - capH / 2 + 0.02;
  g.add(cap);
  g.position.set(x, -0.2, z);
  g.rotation.y = seed;
  ground.add(g);
  return g;
}
// the hero peak right under the route ("höher als der Everest")
export const peak = mountain(PEAK[0], PEAK[1], 5.6, 8.6, 7, 0.5);
mountain(PEAK[0] - 5, PEAK[1] - 3, 3.6, 5.2, 11, 0.6);
mountain(PEAK[0] + 4.5, PEAK[1] - 4, 3.2, 4.4, 13, 0.62);
for (let i = 0; i < 22; i++) {
  const x = -95 + i * 9 + (r() - 0.5) * 4;
  const z = -78 - r() * 16;
  mountain(x, z, 9 + r() * 7, 14 + r() * 14, 40 + i, 0.5 + r() * 0.1);
}

// ---------------------------------------------------------------- cell towers
// lattice mast, three panel antennas, red warning light on top
export const towerTops = [];
const steel = flat(0xb9bcc4, { metalness: 0.6, roughness: 0.4 });
for (const [tx, tz] of TOWERS) {
  const g = new THREE.Group();
  const H = 2.6;
  for (const [sx, sz] of [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ]) {
    const a = new THREE.Vector3(sx * 0.2, 0, sz * 0.2);
    const b = new THREE.Vector3(sx * 0.05, H, sz * 0.05);
    const len = a.distanceTo(b);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.022, len, 6), steel);
    leg.position.copy(a).add(b).multiplyScalar(0.5);
    leg.lookAt(b);
    leg.rotateX(Math.PI / 2);
    leg.castShadow = true;
    g.add(leg);
  }
  // cross braces
  for (let k = 0; k < 7; k++) {
    const y = 0.2 + k * 0.33;
    const w = 0.4 - (y / H) * 0.3;
    for (const rot of [0, Math.PI / 2]) {
      const br = new THREE.Mesh(new THREE.BoxGeometry(w * 1.05, 0.012, 0.012), steel);
      br.position.y = y;
      br.rotation.y = rot;
      br.position.x = rot ? 0 : 0;
      for (const s of [-1, 1]) {
        const c = br.clone();
        if (rot) c.position.x = (s * w) / 2;
        else c.position.z = (s * w) / 2;
        g.add(c);
      }
    }
  }
  // panel antennas
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2;
    const p = new THREE.Mesh(roundedBox(0.09, 0.42, 0.04, 0.012), flat(0xf3f3f0));
    p.position.set(Math.cos(a) * 0.13, H - 0.22, Math.sin(a) * 0.13);
    p.rotation.y = -a + Math.PI / 2;
    p.castShadow = true;
    g.add(p);
  }
  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 16, 12),
    flat(0xff2a2a, { emissive: 0xff2020, emissiveIntensity: 2.2 }),
  );
  lamp.position.y = H + 0.05;
  g.add(lamp);
  // small equipment hut
  const hut = new THREE.Mesh(roundedBox(0.3, 0.22, 0.22, 0.02), flat(0xd8d4c8));
  hut.position.set(0.32, 0.11, 0.1);
  hut.castShadow = true;
  g.add(hut);
  g.position.set(tx, 0, tz);
  ground.add(g);
  towerTops.push(new THREE.Vector3(tx, H - 0.2, tz));
}

// ---------------------------------------------------------------- airport
export const approach = [];
{
  const { x0, x1, z, w } = RUNWAY;
  const L = x1 - x0;
  const apron = new THREE.Mesh(
    new THREE.PlaneGeometry(L + 6, 7.5).rotateX(-Math.PI / 2),
    flat(0x8a9a6a, { roughness: 1 }),
  );
  apron.position.set((x0 + x1) / 2, 0.03, z + 0.8);
  ground.add(apron);
  const rw = new THREE.Mesh(
    new THREE.PlaneGeometry(L, w).rotateX(-Math.PI / 2),
    flat(0x3c3d42, { roughness: 0.85 }),
  );
  rw.position.set((x0 + x1) / 2, 0.05, z);
  rw.receiveShadow = true;
  ground.add(rw);
  const white = flat(0xf4f4f0, { roughness: 0.7 });
  for (let x = x0 + 2.5; x < x1 - 1.5; x += 1.4) {
    const d = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.07).rotateX(-Math.PI / 2), white);
    d.position.set(x, 0.056, z);
    ground.add(d);
  }
  for (let k = -4; k <= 4; k++) {
    const b = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.12).rotateX(-Math.PI / 2), white);
    b.position.set(x0 + 0.7, 0.056, z + k * 0.26);
    ground.add(b);
  }
  // edge lights + approach light row before the threshold
  const lightMat = flat(0xfff2c0, { emissive: 0xffe08a, emissiveIntensity: 2.5 });
  const lg = new THREE.SphereGeometry(0.04, 10, 8);
  for (let x = x0; x <= x1; x += 1.1)
    for (const s of [-1, 1]) {
      const l = new THREE.Mesh(lg, lightMat);
      l.position.set(x, 0.08, z + (s * w) / 2);
      ground.add(l);
    }
  for (let k = 1; k <= 9; k++) {
    const x = x0 - k * 0.9;
    for (let j = -2; j <= 2; j++) {
      const l = new THREE.Mesh(lg, lightMat);
      l.position.set(x, 0.09, z + j * 0.14);
      ground.add(l);
    }
    approach.push(new THREE.Vector3(x, 0.1, z));
  }
  // terminal + control tower
  const term = new THREE.Mesh(
    roundedBox(6, 0.6, 1.4, 0.06),
    flat(0xd9dde4, { metalness: 0.2, roughness: 0.4 }),
  );
  term.position.set(x0 + 12, 0.3, z + 3.6);
  term.castShadow = true;
  ground.add(term);
  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(5.8, 0.28, 0.02),
    flat(0x4a6a90, { emissive: 0xffb860, emissiveIntensity: 0.5, roughness: 0.15 }),
  );
  glass.position.set(x0 + 12, 0.32, z + 2.88);
  ground.add(glass);
  const ct = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 2.2, 24), flat(0xe8e8ea));
  ct.position.set(x0 + 17, 1.1, z + 4.4);
  ct.castShadow = true;
  ground.add(ct);
  const cab = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.3, 0.38, 24),
    flat(0x3a5a80, { emissive: 0x80c0ff, emissiveIntensity: 0.4, roughness: 0.1 }),
  );
  cab.position.set(x0 + 17, 2.35, z + 4.4);
  ground.add(cab);
}

// ---------------------------------------------------------------- life: cars on the road
{
  const carGeo = roundedBox(0.22, 0.09, 0.11, 0.025);
  const cols = [0xd8352a, 0x2f6fd6, 0xf2f2f2, 0x2a2a2e, 0xffcc00];
  const curve = new THREE.CatmullRomCurve3(
    [
      [-60, -1],
      [-30, 0.5],
      [-12, -1.2],
      [-5, -4],
      [4, -0.5],
      [14, 1.5],
      [21, 9.5],
    ].map(([x, z]) => new THREE.Vector3(x, 0.1, z)),
  );
  const cars = cols.concat(cols).map((c, i) => {
    const m = new THREE.Mesh(carGeo, flat(c, { roughness: 0.35 }));
    m.castShadow = true;
    ground.add(m);
    return { m, ph: i / 10, dir: i % 2 ? 1 : -1 };
  });
  onFrame((t) => {
    for (const c of cars) {
      const u = (((c.ph + c.dir * t * 0.006) % 1) + 1) % 1;
      const p = curve.getPointAt(u);
      const tg = curve.getTangentAt(u);
      c.m.position.set(p.x + tg.z * 0.1 * c.dir, 0.1, p.z - tg.x * 0.1 * c.dir);
      c.m.rotation.y = Math.atan2(-tg.z, tg.x);
    }
  });
}

finishSet({ ground: GREEN });
