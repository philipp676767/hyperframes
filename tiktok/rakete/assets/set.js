// Set of #28 "Raketen-Landung": a landing ship (droneship) alone on the open
// Atlantic at sunrise — long swell, warm low sun behind the stage, foam on
// the hull. The deck is the stage (the booster lands on its target ring at
// the origin). Hero piece: the support ship with crane and funnel smoke
// behind the deck; far layer: a coastline with a launch tower and hills on
// the horizon; a cloud layer high above that the booster falls through.
// Life: moving sea, foam, bobbing buoys, gulls, a blinking beacon, smoke.
import { THREE, flat, ground, onFrame, rng, noise2, V, scene, facet, facetMat } from "./world.js";
import { SKIES, setSky, finishSet, sea, F, cloudPuffs } from "./environments.js";

const SEED = 28;

// ---------------------------------------------------------------- light
// sunrise over the sea: deep blue zenith, a hot orange band on the horizon,
// the sun low behind the stage so the booster gets a warm rim
const sky = setSky({
  ...SKIES.morgen,
  top: [0.22, 0.4, 0.78],
  mid: [0.86, 0.62, 0.66],
  hor: [1.0, 0.72, 0.42],
  below: [0.8, 0.66, 0.66],
  sun: [1.0, 0.86, 0.55],
  sunDir: [-0.35, 0.09, -1],
  cloud: [0xfff0e6, 0xffb98f],
  key: [0xffe4c4, 2.7],
  keyPos: [7, 10, 9],
  rim: [0xffa36b, 1.1],
  fog: [80, 320],
  clouds: 14,
});

// ---------------------------------------------------------------- sea
// one moving sea all around the ship (the kit sea runs from zFrom backwards)
const water = sea({ zFrom: 110, depth: 300, width: 320, y: -1.35, amp: 0.32 });
{
  // open ocean: deep blue everywhere, patchy, a little lighter far away
  const c = water.geometry.attributes.color;
  const p = water.geometry.attributes.position;
  const deep = new THREE.Color(0x1d5f9c);
  const light = new THREE.Color(0x2f8fbf);
  const col = new THREE.Color();
  for (let i = 0; i < c.count; i++) {
    const x = p.getX(i);
    const z = p.getZ(i);
    const n = noise2(x * 0.05, z * 0.05, SEED) * 0.7 + noise2(x * 0.17, z * 0.17, SEED + 3) * 0.3;
    col.lerpColors(deep, light, Math.min(1, n * 0.9 + Math.min(1, Math.hypot(x, z) / 160) * 0.3));
    c.setXYZ(i, col.r, col.g, col.b);
  }
  c.needsUpdate = true;
}

// ---------------------------------------------------------------- the landing ship
// Deck 12 × 8 at y = 0 (the stage), hull below into the water, low hazard-
// striped walls on the long sides, the target ring in the middle, two
// equipment houses + masts at the stern (back, z < 0).
export const ship = new THREE.Group();
ground.add(ship);
const DW = 12; // deck width (x)
const DD = 8; // deck depth (z)
{
  const r = rng(SEED);
  // deck plates: an even grid of slightly different greys
  const deckGeo = new THREE.PlaneGeometry(DW, DD, 24, 16);
  deckGeo.rotateX(-Math.PI / 2);
  const deck = new THREE.Mesh(
    facet(deckGeo, 0.06, SEED),
    facetMat(flat(0x6f757d, { roughness: 0.75, metalness: 0.15 })),
  );
  {
    // worn / rusty patches + scorch marks around the target
    const pc = deck.geometry.attributes.color;
    const pp = deck.geometry.attributes.position;
    for (let i = 0; i + 2 < pp.count; i += 3) {
      const x = (pp.getX(i) + pp.getX(i + 1) + pp.getX(i + 2)) / 3;
      const z = (pp.getZ(i) + pp.getZ(i + 1) + pp.getZ(i + 2)) / 3;
      const n = noise2(x * 0.45, z * 0.45, SEED + 5);
      const d = Math.hypot(x, z);
      const scorch = Math.max(0, 1 - Math.abs(d - 1.1) / 1.6) * 0.32 * noise2(x * 1.3, z * 1.3, 9);
      const k = 1 + (n - 0.5) * 0.18 - scorch;
      const rust = Math.max(0, n - 0.72) * 0.9;
      for (let j = 0; j < 3; j++)
        pc.setXYZ(
          i + j,
          pc.getX(i + j) * k * (1 + rust * 0.4),
          pc.getY(i + j) * k * (1 + rust * 0.05),
          pc.getZ(i + j) * k * (1 - rust * 0.3),
        );
    }
  }
  deck.receiveShadow = true;
  ship.add(deck);

  // hull: dark navy box with a waterline stripe, slightly flared
  const hullMat = flat(0x24314a, { roughness: 0.6, metalness: 0.2 });
  const hull = F(new THREE.BoxGeometry(DW + 0.3, 2.4, DD + 0.3, 6, 2, 4), hullMat, 0.05, 3);
  hull.position.y = -1.22;
  hull.castShadow = hull.receiveShadow = true;
  ship.add(hull);
  const stripe = new THREE.Mesh(
    new THREE.BoxGeometry(DW + 0.34, 0.22, DD + 0.34),
    flat(0xc8452f, { roughness: 0.7 }),
  );
  stripe.position.y = -1.95;
  ship.add(stripe);

  // low walls with yellow / black hazard stripes on the long sides (front + back)
  const yel = flat(0xf2c230, { roughness: 0.6 });
  const blk = flat(0x22232a, { roughness: 0.6 });
  for (const side of [-1, 1]) {
    const n = 24;
    for (let i = 0; i < n; i++) {
      const seg = new THREE.Mesh(new THREE.BoxGeometry(DW / n, 0.32, 0.22), i % 2 ? yel : blk);
      seg.position.set(-DW / 2 + (i + 0.5) * (DW / n), 0.16, side * (DD / 2 - 0.05));
      seg.castShadow = true;
      ship.add(seg);
    }
  }
  // bollards along the edges
  const bollard = flat(0xdedad2, { roughness: 0.5, metalness: 0.3 });
  for (const x of [-5.4, -2.6, 2.6, 5.4]) {
    for (const z of [-3.6, 3.6]) {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.28, 8), bollard);
      b.position.set(x, 0.14, z * 0.93);
      b.castShadow = true;
      ship.add(b);
    }
  }

  // target: a big white ring + a cross, painted on the deck
  const paint = new THREE.MeshStandardMaterial({ color: 0xf6f3ec, roughness: 0.7 });
  const ring = new THREE.Mesh(new THREE.RingGeometry(2.25, 2.55, 72), paint);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.012;
  ring.receiveShadow = true;
  ship.add(ring);
  for (const a of [0, Math.PI / 2]) {
    const bar = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.28), paint);
    bar.rotation.x = -Math.PI / 2;
    bar.rotation.z = a;
    bar.position.y = 0.014;
    bar.receiveShadow = true;
    ship.add(bar);
  }
  const dot = new THREE.Mesh(new THREE.CircleGeometry(0.42, 32), flat(0xf2c230));
  dot.rotation.x = -Math.PI / 2;
  dot.position.y = 0.016;
  ship.add(dot);

  // stern: two equipment houses (generators, thrusters) with masts + beacons
  const houseMat = flat(0xe9e4da, { roughness: 0.7 });
  const roofMat = flat(0x3a6ea8, { roughness: 0.6 });
  for (const sx of [-1, 1]) {
    const h = new THREE.Group();
    const box = F(new THREE.BoxGeometry(2.2, 1.5, 1.3), houseMat, 0.05, 5 + sx);
    box.position.y = 0.75;
    h.add(box);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.14, 1.4), roofMat);
    roof.position.y = 1.55;
    h.add(roof);
    // vents + a door
    for (let i = 0; i < 3; i++) {
      const v = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.22, 0.04), flat(0x8a8f96));
      v.position.set(-0.6 + i * 0.6, 1.05, 0.67);
      h.add(v);
    }
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.85, 0.04), flat(0x6a7480));
    door.position.set(0.7 * sx, 0.45, 0.67);
    h.add(door);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 2.2, 6), flat(0xdcdcdc));
    mast.position.set(-0.7 * sx, 2.6, 0);
    h.add(mast);
    const dish = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2),
      flat(0xffffff),
    );
    dish.rotation.x = Math.PI * 0.6;
    dish.position.set(-0.7 * sx, 2.2, 0.15);
    h.add(dish);
    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0xff3b2b, emissive: 0xff2010, emissiveIntensity: 2 }),
    );
    beacon.position.set(-0.7 * sx, 3.75, 0);
    h.add(beacon);
    onFrame((t) => {
      beacon.material.emissiveIntensity = (t + (sx > 0 ? 0.5 : 0)) % 1.2 < 0.25 ? 3.2 : 0.3;
    });
    h.traverse((o) => {
      if (o.isMesh) o.castShadow = o.receiveShadow = true;
    });
    h.position.set(sx * 4.4, 0, -3.2);
    ship.add(h);
  }
  // thruster pods on the hull corners (white water in the foam below)
  for (const [x, z] of [
    [-6.0, -3.9],
    [6.0, -3.9],
    [-6.0, 3.9],
    [6.0, 3.9],
  ]) {
    const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.6, 10), hullMat);
    pod.position.set(x, -1.9, z);
    ship.add(pod);
  }
  void r;
}

// foam around the hull: flattened white lumps riding the swell
{
  const geo = new THREE.IcosahedronGeometry(1, 0);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xf4fbff,
    roughness: 0.9,
    flatShading: true,
    transparent: true,
    opacity: 0.9,
  });
  const N = 120;
  const foam = new THREE.InstancedMesh(geo, mat, N);
  const r = rng(SEED + 9);
  const data = [];
  for (let i = 0; i < N; i++) {
    // around the rectangle of the hull
    const u = r();
    const per = 2 * (DW + DD);
    let d = u * per;
    let x;
    let z;
    if (d < DW) [x, z] = [-DW / 2 + d, DD / 2 + 0.35];
    else if ((d -= DW) < DD) [x, z] = [DW / 2 + 0.35, DD / 2 - d];
    else if ((d -= DD) < DW) [x, z] = [DW / 2 - d, -DD / 2 - 0.35];
    else [x, z] = [-DW / 2 - 0.35, -DD / 2 + (d - DW)];
    x += (r() - 0.5) * 0.7;
    z += (r() - 0.5) * 0.7;
    data.push({ x, z, s: 0.18 + r() * 0.35, ph: r() * 6.28 });
  }
  ground.add(foam);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const sc = V(1, 1, 1);
  const pos = V(0, 0, 0);
  onFrame((t) => {
    data.forEach((f, i) => {
      const b = Math.sin(t * 1.6 + f.ph);
      pos.set(f.x, -1.3 + b * 0.08, f.z);
      sc.set(f.s * (1.4 + 0.3 * b), f.s * 0.28, f.s * (1.2 - 0.2 * b));
      q.setFromAxisAngle(V(0, 1, 0), f.ph);
      foam.setMatrixAt(i, m4.compose(pos, q, sc));
    });
    foam.instanceMatrix.needsUpdate = true;
  });
}

// ---------------------------------------------------------------- buoys
{
  const buoyMat = flat(0xff6b2b, { roughness: 0.5 });
  const white = flat(0xffffff);
  [
    [-11, 7, 0],
    [12.5, 4, 1.7],
    [-15, -6, 3.1],
  ].forEach(([x, z, ph]) => {
    const b = new THREE.Group();
    const body = F(new THREE.CylinderGeometry(0.42, 0.5, 0.9, 10), buoyMat, 0.06, 2);
    b.add(body);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.16, 10), white);
    band.position.y = 0.15;
    b.add(band);
    const top = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.55, 8), buoyMat);
    top.position.y = 0.72;
    b.add(top);
    b.traverse((o) => (o.castShadow = true));
    ground.add(b);
    onFrame((t) => {
      b.position.set(x, -1.2 + Math.sin(t * 1.3 + ph) * 0.18, z);
      b.rotation.set(Math.sin(t * 1.1 + ph) * 0.12, 0, Math.cos(t * 0.9 + ph) * 0.12);
    });
  });
}

// ---------------------------------------------------------------- hero piece
// The support ship behind the deck: a white workboat with a blue hull, a
// bridge with windows, a crane arm and a funnel that smokes.
function workboat(len, seed) {
  const g = new THREE.Group();
  const hull = F(new THREE.BoxGeometry(len, 1.6, len * 0.32), flat(0x2c4f86), 0.05, seed);
  hull.position.y = 0.3;
  g.add(hull);
  const bow = F(new THREE.ConeGeometry(len * 0.17, len * 0.22, 4), flat(0x2c4f86), 0.05, seed + 1);
  bow.rotation.z = -Math.PI / 2;
  bow.rotation.x = Math.PI / 4;
  bow.scale.set(1, 1, 0.75);
  bow.position.set(len / 2 + len * 0.1, 0.3, 0);
  g.add(bow);
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(len, 0.12, len * 0.32),
    flat(0xc84a32, { roughness: 0.8 }),
  );
  deck.position.y = 1.15;
  g.add(deck);
  const white = flat(0xf3f0ea);
  const bridge = F(new THREE.BoxGeometry(len * 0.26, 1.7, len * 0.26), white, 0.05, seed + 2);
  bridge.position.set(len * 0.22, 2.05, 0);
  g.add(bridge);
  const top = F(new THREE.BoxGeometry(len * 0.2, 0.9, len * 0.22), white, 0.05, seed + 3);
  top.position.set(len * 0.24, 3.35, 0);
  g.add(top);
  const glass = flat(0x1f2c3c, { roughness: 0.2, metalness: 0.4 });
  const win = new THREE.Mesh(new THREE.BoxGeometry(len * 0.205, 0.3, len * 0.225), glass);
  win.position.set(len * 0.24, 3.45, 0);
  g.add(win);
  const funnel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.34, 1.3, 10),
    flat(0xf2c230, { roughness: 0.6 }),
  );
  funnel.position.set(len * 0.02, 2.4, 0);
  g.add(funnel);
  // crane at the stern
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 2.6, 8), flat(0xf2a33a));
  post.position.set(-len * 0.32, 2.4, 0);
  g.add(post);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(len * 0.36, 0.18, 0.18), flat(0xf2a33a));
  arm.position.set(-len * 0.32 - len * 0.12, 3.5, 0);
  arm.rotation.z = 0.32;
  g.add(arm);
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = o.receiveShadow = true;
  });
  return { g, funnelTop: V(len * 0.02, 3.1, 0) };
}
function smoke(group, at, seed, color = 0xd9d3cf) {
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 1,
    flatShading: true,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
  });
  const geo = new THREE.IcosahedronGeometry(1, 0);
  const puffs = [];
  for (let i = 0; i < 9; i++) {
    const m = new THREE.Mesh(geo, mat.clone());
    group.add(m);
    puffs.push(m);
  }
  onFrame((t) => {
    puffs.forEach((m, i) => {
      const k = (t * 0.18 + i / puffs.length + seed * 0.13) % 1;
      m.position.set(at.x - k * 3.2, at.y + k * 4.5, at.z + Math.sin(k * 5 + i) * 0.3);
      m.scale.setScalar(0.25 + k * 1.1);
      m.material.opacity = 0.75 * (1 - k);
    });
  });
}
{
  const { g, funnelTop } = workboat(13, SEED + 20);
  g.position.set(-15, -1.2, -24);
  g.rotation.y = 0.35;
  ground.add(g);
  smoke(g, funnelTop, 1);
  onFrame((t) => {
    g.position.y = -1.2 + Math.sin(t * 0.9) * 0.12;
    g.rotation.z = Math.sin(t * 0.7) * 0.025;
  });
  const tug = workboat(7, SEED + 30);
  tug.g.position.set(19, -1.2, -34);
  tug.g.rotation.y = -2.6;
  ground.add(tug.g);
  smoke(tug.g, tug.funnelTop, 2);
  onFrame((t) => {
    tug.g.position.y = -1.2 + Math.sin(t * 1.1 + 2) * 0.14;
    tug.g.rotation.x = Math.sin(t * 0.8 + 1) * 0.03;
  });
}

// ---------------------------------------------------------------- far layer
// The coast on the horizon: low hills, a launch tower with a rocket on it,
// a water tower, hangars — tiny and hazy at the end of the sea.
{
  const coast = new THREE.Group();
  const hillMat = flat(0x6f8a6a, { roughness: 1 });
  const r = rng(SEED + 40);
  for (let i = 0; i < 9; i++) {
    const h = F(
      new THREE.SphereGeometry(1, 9, 5, 0, Math.PI * 2, 0, Math.PI / 2),
      hillMat,
      0.08,
      i,
    );
    h.scale.set(16 + r() * 18, 3 + r() * 5, 8 + r() * 6);
    h.position.set(-120 + i * 30 + r() * 10, -1.4, -175 - r() * 15);
    coast.add(h);
  }
  const sand = new THREE.Mesh(new THREE.BoxGeometry(320, 0.6, 14), flat(0xe5cfa1));
  sand.position.set(0, -1.3, -165);
  coast.add(sand);
  // launch tower: lattice tower + a slim rocket next to it
  const steel = flat(0x9aa2ab, { metalness: 0.4, roughness: 0.5 });
  const tower = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.35, 22, 0.35), steel);
    leg.position.set(i % 2 ? 1.1 : -1.1, 11, i < 2 ? 1.1 : -1.1);
    tower.add(leg);
  }
  for (let k = 0; k < 11; k++) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.22, 2.6), steel);
    bar.position.y = 1 + k * 2;
    tower.add(bar);
  }
  const rocket = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 20, 12), flat(0xf4f4f2));
  rocket.position.set(2.4, 10.8, 0);
  tower.add(rocket);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.75, 2.4, 12), flat(0xf4f4f2));
  nose.position.set(2.4, 22, 0);
  tower.add(nose);
  tower.position.set(26, -1, -163);
  coast.add(tower);
  const wt = new THREE.Group();
  const tank = new THREE.Mesh(new THREE.SphereGeometry(2.2, 12, 8), flat(0xf0ece4));
  tank.position.y = 10;
  wt.add(tank);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 9, 8), flat(0xd8d2cc));
  stem.position.y = 4.5;
  wt.add(stem);
  wt.position.set(-30, -1, -166);
  coast.add(wt);
  for (const [x, w] of [
    [5, 14],
    [44, 9],
    [-12, 10],
  ]) {
    const hang = new THREE.Mesh(new THREE.BoxGeometry(w, 4, 6), flat(0xe8e3da));
    hang.position.set(x, 1, -163);
    coast.add(hang);
    const roof = new THREE.Mesh(
      new THREE.CylinderGeometry(3, 3, w, 10, 1, false, 0, Math.PI),
      flat(0x9aa7b4),
    );
    roof.rotation.z = Math.PI / 2;
    roof.rotation.y = Math.PI / 2;
    roof.position.set(x, 3, -163);
    coast.add(roof);
  }
  ground.add(coast);
}

// ---------------------------------------------------------------- cloud layer
// A sheet of cumulus high above the ship (y ≈ 46) that the booster falls
// through; from the deck it fills the morning sky, from above it hides the
// sea. Left open over the stage so the deck sees the booster coming.
export const CLOUD_Y = 46;
{
  const mat = facetMat(
    new THREE.MeshStandardMaterial({
      color: 0xfff3ea,
      emissive: 0xffc6a8,
      emissiveIntensity: 0.45,
      roughness: 1,
      flatShading: true,
      fog: false,
    }),
  );
  const layer = new THREE.Group();
  const r = rng(SEED + 60);
  for (let i = 0; i < 60; i++) {
    const a = r() * Math.PI * 2;
    const d = 26 + Math.sqrt(r()) * 110;
    const g = new THREE.Group();
    g.position.set(Math.cos(a) * d, CLOUD_Y + (r() - 0.5) * 6, Math.sin(a) * d);
    cloudPuffs(g, 4 + Math.floor(r() * 4), 4 + r() * 4, mat, i * 11);
    g.rotation.y = r() * 6;
    layer.add(g);
  }
  scene.add(layer);
  onFrame((t) => (layer.rotation.y = t * 0.004));
}

finishSet({ ground: 0x1d5f9c });
export { sky, DW, DD };
