// #48 "Cent vom Wolkenkratzer" (Format B) — the world of this video.
// A banking-district street at sunset (Frankfurt-like, but no real place):
// one glass skyscraper (the hero, roof deck with a glass railing, a coin
// telescope, a flag and an antenna) right behind the stage, the sidewalk in
// front of it where the passer-by walks, a street with taxis, a row of old
// shop houses opposite, a railway line with a passing ICE behind them, and
// a skyline of towers + a TV tower against the pink evening sky.
import { THREE, V, rng, flat, M, ground, onFrame, facet, facetMat, noise2 } from "./world.js";
import { SKIES, setSky, finishSet, terrain, F, add, car, birds } from "./environments.js";
import {
  place,
  lamp,
  bench,
  bin,
  bike,
  hydrant,
  busStop,
  awning,
  trafficLight,
  bush,
  sway,
} from "./props.js";
import { T } from "./beats.js";

const SEED = 48;
const r = rng(SEED);

// ---------------------------------------------------------------- light
// golden-pink sunset behind the towers, warm low key light from the front right
export const sky = setSky({
  ...SKIES.sonnenuntergang,
  top: [0.32, 0.3, 0.72],
  mid: [0.9, 0.52, 0.7],
  hor: [1.0, 0.72, 0.46],
  below: [0.86, 0.62, 0.7],
  sunDir: [-0.25, 0.09, -1],
  keyPos: [9, 9, 9],
  key: [0xffd9b0, 2.7],
  fog: [60, 210],
  clouds: 14,
  birds: false,
});
birds(5);

// ---------------------------------------------------------------- layout
export const H = 34; // roof height of the hero tower
export const FRONT = -4.4; // its front facade (faces +z)
const TW = 11; // tower width (x)
const TD = 11; // tower depth (z)
export const WALK_Z = -2.4; // the passer-by's line on the sidewalk
export const ROAD = { z0: -0.8, z1: 4.6 };
export const TRACK_Z = 21; // the railway behind the shop houses

// ---------------------------------------------------------------- ground
terrain(0x6f6a78, { seed: SEED, amt: 0.08, warm: 0.2, hills: 0, flatR: 80, step: 3.6 });

const m4 = new THREE.Matrix4();
const col = new THREE.Color();
// paving slabs as instances, each a touch different
function paving(x0, x1, z0, z1, size, color, y = 0.06, seed = 1) {
  const list = [];
  for (let x = x0 + size / 2; x < x1; x += size)
    for (let z = z0 + size / 2; z < z1; z += size) list.push([x, z]);
  const im = new THREE.InstancedMesh(
    new THREE.BoxGeometry(size * 0.96, 0.1, size * 0.96),
    flat(0xffffff, { roughness: 0.9 }),
    list.length,
  );
  const base = new THREE.Color(color);
  const rr = rng(seed);
  list.forEach(([x, z], i) => {
    m4.makeTranslation(x, y - 0.05, z);
    im.setMatrixAt(i, m4);
    const k = 0.9 + rr() * 0.12 + (noise2(x * 0.12, z * 0.12, seed) - 0.5) * 0.14;
    im.setColorAt(i, col.copy(base).multiplyScalar(k));
  });
  im.receiveShadow = true;
  ground.add(im);
}
// sidewalk in front of the tower and on the far side
paving(-60, 60, -16, ROAD.z0, 1.2, 0xd6cdc2, 0.1, 3);
paving(-60, 60, ROAD.z1, 8.4, 1.2, 0xcfc6bb, 0.1, 4);
// the road: asphalt with patches, kerbs, lane dashes, a zebra crossing
{
  const asphalt = new THREE.Mesh(
    facet(new THREE.BoxGeometry(120, 0.06, ROAD.z1 - ROAD.z0, 60, 1, 4), 0.05, 7),
    facetMat(flat(0x4a4754, { roughness: 0.85 })),
  );
  add(asphalt, 0, 0.03, (ROAD.z0 + ROAD.z1) / 2, false);
  asphalt.receiveShadow = true;
  const kerb = flat(0xb7aea6);
  for (const z of [ROAD.z0, ROAD.z1])
    add(new THREE.Mesh(new THREE.BoxGeometry(120, 0.16, 0.26), kerb), 0, 0.08, z);
  const paint = flat(0xf4f1ea, { roughness: 0.6 });
  const mid = (ROAD.z0 + ROAD.z1) / 2;
  for (let x = -58; x < 58; x += 3.4)
    add(new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.02, 0.14), paint), x, 0.07, mid, false);
  for (let i = 0; i < 8; i++)
    add(
      new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, ROAD.z1 - ROAD.z0 - 0.6), paint),
      -12 + i * 0.95,
      0.07,
      mid,
      false,
    );
}

// ---------------------------------------------------------------- windows (instanced)
const frames = [];
const lit = [];
const dark = [];
function inst(list, geo, mat) {
  if (!list.length) return;
  const im = new THREE.InstancedMesh(geo, mat, list.length);
  list.forEach((w, i) => {
    w.g.updateMatrixWorld();
    m4.makeTranslation(w.x, w.y, w.z).premultiply(w.g.matrixWorld);
    im.setMatrixAt(i, m4);
  });
  ground.add(im);
}

// ---------------------------------------------------------------- shop houses opposite (face -z)
const pastel = [0xe9b8a8, 0xf2d0a4, 0xb8c7e0, 0xc9b3d9, 0xa8d5c2, 0xf0e2b6, 0xe7a9b5];
const roofCols = [0xb4553c, 0x8a7f86, 0x6f6470, 0xc0683f];
function house(x, z, w, d, h, rotY, shop) {
  const g = new THREE.Group();
  const wall = pastel[Math.floor(r() * pastel.length)];
  const body = new THREE.Mesh(
    facet(new THREE.BoxGeometry(w, h, d), 0.03, Math.floor(r() * 99)),
    facetMat(flat(wall)),
  );
  body.position.y = h / 2;
  body.castShadow = body.receiveShadow = true;
  g.add(body);
  const trim = flat(new THREE.Color(wall).multiplyScalar(0.82));
  const band = (y, hh, out) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w + out, hh, d + out), trim);
    b.position.y = y;
    b.castShadow = true;
    g.add(b);
  };
  band(0.3, 0.6, 0.06);
  band(h - 0.12, 0.24, 0.16);
  band(2.9, 0.16, 0.1);
  if (r() < 0.55) {
    const rs = new THREE.Shape();
    rs.moveTo(-w / 2 - 0.2, 0);
    rs.lineTo(0, Math.min(2.6, w * 0.42));
    rs.lineTo(w / 2 + 0.2, 0);
    rs.lineTo(-w / 2 - 0.2, 0);
    const roof = new THREE.Mesh(
      facet(new THREE.ExtrudeGeometry(rs, { depth: d + 0.3, bevelEnabled: false }), 0.05, 7),
      facetMat(flat(roofCols[Math.floor(r() * roofCols.length)])),
    );
    roof.position.set(0, h, -d / 2 - 0.15);
    roof.castShadow = true;
    g.add(roof);
  } else {
    const pr = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.4, d + 0.1), trim);
    pr.position.y = h + 0.2;
    g.add(pr);
    const ch = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 0.5), flat(0x9a8f88));
    ch.position.set((r() - 0.5) * (w - 1), h + 0.45, (r() - 0.5) * (d - 1));
    ch.castShadow = true;
    g.add(ch);
  }
  const cols = Math.max(1, Math.floor((w - 0.6) / 1.1));
  const rows = Math.max(1, Math.floor((h - 3.2) / 1.3));
  for (let cx = 0; cx < cols; cx++)
    for (let ry = 0; ry < rows; ry++) {
      const wx = -((cols - 1) * 1.1) / 2 + cx * 1.1;
      const wy = 3.7 + ry * 1.3;
      frames.push({ g, x: wx, y: wy, z: d / 2 + 0.02 });
      (r() < 0.4 ? lit : dark).push({ g, x: wx, y: wy, z: d / 2 + 0.05 });
    }
  if (shop) {
    const sw = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.6, 1.5, 0.06),
      flat(0xffe2a8, { emissive: 0xffc46b, emissiveIntensity: 0.7 }),
    );
    sw.position.set(-w * 0.1, 1.25, d / 2 + 0.04);
    g.add(sw);
    const aw = awning(w * 0.66, [roofCols[Math.floor(r() * 2)], 0xffffff]);
    aw.position.set(-w * 0.1, 2.3, d / 2);
    g.add(aw);
  }
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.6, 0.08), flat(0x6b4a3a));
  door.position.set(shop ? w * 0.34 : 0, 0.8, d / 2 + 0.03);
  g.add(door);
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  ground.add(g);
}
for (let x = -46; x < 46; ) {
  const w = 4 + r() * 3;
  house(x + w / 2, 11.6, w, 6, 7 + r() * 6, Math.PI, r() < 0.75);
  x += w + 0.3;
}

// ---------------------------------------------------------------- glass towers
// curtain wall: a glossy body that mirrors the sunset + mullions and floor
// bands as instances; some offices still lit.
const mullions = [];
const bands = [];
function tower(x, z, w, d, h, { glass = 0x3f6290, frame = 0xe4e6ee, crown = true, seed = 1 } = {}) {
  const g = new THREE.Group();
  const rr = rng(seed);
  const body = new THREE.Mesh(
    facet(new THREE.BoxGeometry(w, h, d, 2, 6, 2), 0.04, seed),
    facetMat(
      new THREE.MeshStandardMaterial({
        color: glass,
        roughness: 0.1,
        metalness: 0.55,
        flatShading: true,
      }),
    ),
  );
  body.position.y = h / 2;
  body.castShadow = body.receiveShadow = true;
  g.add(body);
  const FL = 1.25;
  for (let y = 2.6; y < h - 0.4; y += FL) {
    bands.push({ g, x: 0, y, z: 0, sx: w + 0.06, sz: d + 0.06 });
    // lit offices: pane-size warm rectangles on the front + sides
    for (let k = 0; k < Math.floor(w / 1.4); k++)
      if (rr() < 0.13) lit.push({ g, x: -w / 2 + 0.7 + k * 1.4, y: y + 0.62, z: d / 2 + 0.03 });
  }
  for (let k = 0; k <= Math.round(w / 1.4); k++) {
    const xx = -w / 2 + (k * w) / Math.round(w / 1.4);
    mullions.push({ g, x: xx, y: h / 2, z: d / 2 + 0.02, h });
    mullions.push({ g, x: xx, y: h / 2, z: -d / 2 - 0.02, h });
  }
  for (let k = 1; k < Math.round(d / 1.4); k++) {
    const zz = -d / 2 + (k * d) / Math.round(d / 1.4);
    mullions.push({ g, x: w / 2 + 0.02, y: h / 2, z: zz, h, side: true });
    mullions.push({ g, x: -w / 2 - 0.02, y: h / 2, z: zz, h, side: true });
  }
  // base: stone plinth with a lobby
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, 2.4, d + 0.3), flat(frame));
  plinth.position.y = 1.2;
  plinth.castShadow = plinth.receiveShadow = true;
  g.add(plinth);
  // crown
  const parapet = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 0.5, d + 0.2), flat(frame));
  parapet.position.y = h + 0.1;
  parapet.castShadow = true;
  g.add(parapet);
  if (crown) {
    const top = new THREE.Mesh(new THREE.BoxGeometry(w * 0.6, 2.4, d * 0.6), flat(frame));
    top.position.y = h + 1.4;
    top.castShadow = true;
    g.add(top);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.18, 6, 6), M.steel);
    mast.position.y = h + 5.6;
    g.add(mast);
    const red = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 8, 6),
      flat(0xff3b2f, { emissive: 0xff2010, emissiveIntensity: 1.5 }),
    );
    red.position.y = h + 8.7;
    g.add(red);
    blinkers.push(red);
  }
  g.position.set(x, 0, z);
  ground.add(g);
  return g;
}
const blinkers = [];
const fans = [];
// neighbours (near ring)
tower(-15.5, -12, 9, 9, 25, { glass: 0x5a7fa6, seed: 3, crown: false });
tower(16.5, -14, 10, 10, 44, { glass: 0x3d7f88, seed: 4 });
tower(-28, -24, 11, 10, 33, { glass: 0x4a5f93, seed: 5 });
tower(30, -27, 10, 10, 27, { glass: 0x6f86a8, seed: 6, crown: false });
tower(-7, -32, 12, 10, 50, { glass: 0x33507f, seed: 7 });
tower(9, -38, 10, 10, 38, { glass: 0x4f7398, seed: 8 });
// far skyline ring
for (let i = 0; i < 26; i++) {
  const a = Math.PI + (i / 25 - 0.5) * 2.6 + (r() - 0.5) * 0.08;
  const d = 62 + r() * 28;
  const x = Math.sin(a) * d;
  const z = Math.cos(a) * d;
  if (z > -40) continue;
  tower(x, z, 7 + r() * 6, 7 + r() * 6, 12 + r() * 30, {
    glass: [0x55709c, 0x4a6390, 0x6a7fa6, 0x3f5a85][i % 4],
    seed: 20 + i,
    crown: r() < 0.3,
  });
}
// TV tower far left (a landmark the skyline is known by)
{
  const g = new THREE.Group();
  const conc = flat(0xd9d4cf);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 2.2, 52, 10), conc);
  shaft.position.y = 26;
  g.add(shaft);
  const pod = F(new THREE.CylinderGeometry(4.2, 3.0, 3.4, 14), flat(0xe8e2dc), 0.05, 2);
  pod.position.y = 50;
  g.add(pod);
  const podTop = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 4.2, 1.2, 14), flat(0xbcc7d6));
  podTop.position.y = 52.3;
  g.add(podTop);
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.5, 18, 6), flat(0xd84a3a));
  ant.position.y = 62;
  g.add(ant);
  g.position.set(-46, 0, -70);
  ground.add(g);
}

// ---------------------------------------------------------------- the hero tower
export const hero = tower(0, FRONT - TD / 2, TW, TD, H, { glass: 0x3a5c8c, seed: 2, crown: false });
// lobby: dark glass doors + a canopy
{
  const lobby = new THREE.Mesh(
    new THREE.BoxGeometry(5, 2.2, 0.1),
    flat(0x26324a, { roughness: 0.1, metalness: 0.5 }),
  );
  add(lobby, 0, 1.1, FRONT + 0.2);
  const doorLit = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 1.9, 0.06),
    flat(0xffe0a8, { emissive: 0xffc070, emissiveIntensity: 0.9 }),
  );
  add(doorLit, 0, 0.95, FRONT + 0.28, false);
  const canopy = new THREE.Mesh(
    new THREE.BoxGeometry(6, 0.18, 1.8),
    flat(0x2f3440, { metalness: 0.5, roughness: 0.35 }),
  );
  add(canopy, 0, 2.55, FRONT + 0.95);
}
// roof deck: wooden planks, glass railing along the front edge, planters,
// a coin telescope, a flag, AC boxes and an antenna mast
export const ROOF_Y = H + 0.35;
{
  const deck = new THREE.Group();
  const planks = [];
  for (let x = -TW / 2 + 0.3; x < TW / 2 - 0.2; x += 0.42) planks.push(x);
  const plankIM = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.4, 0.08, TD - 0.4),
    flat(0xffffff, { roughness: 0.8 }),
    planks.length,
  );
  planks.forEach((x, i) => {
    m4.makeTranslation(x, ROOF_Y - 0.04, FRONT - TD / 2);
    plankIM.setMatrixAt(i, m4);
    plankIM.setColorAt(i, col.set(0xb98552).multiplyScalar(0.85 + r() * 0.2));
  });
  plankIM.receiveShadow = true;
  deck.add(plankIM);
  // glass railing: panels + steel top rail + posts (front and sides)
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xd6ecff,
    roughness: 0.05,
    metalness: 0.1,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
  });
  const rail = new THREE.MeshStandardMaterial({
    color: 0xdfe5ec,
    metalness: 0.85,
    roughness: 0.22,
  });
  const RZ = FRONT + 0.05;
  const panel = new THREE.Mesh(new THREE.BoxGeometry(TW - 0.2, 1.05, 0.04), glassMat);
  panel.position.set(0, ROOF_Y + 0.55, RZ);
  deck.add(panel);
  const top = new THREE.Mesh(new THREE.BoxGeometry(TW - 0.1, 0.07, 0.12), rail);
  top.position.set(0, ROOF_Y + 1.1, RZ);
  top.castShadow = true;
  deck.add(top);
  for (let x = -TW / 2 + 0.1; x <= TW / 2; x += 1.35) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.1, 0.06), rail);
    p.position.set(x, ROOF_Y + 0.55, RZ);
    p.castShadow = true;
    deck.add(p);
  }
  for (const sx of [-1, 1]) {
    const sp = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.05, TD - 0.2), glassMat);
    sp.position.set((sx * (TW - 0.1)) / 2, ROOF_Y + 0.55, FRONT - TD / 2);
    deck.add(sp);
    const st = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, TD - 0.1), rail);
    st.position.set((sx * (TW - 0.1)) / 2, ROOF_Y + 1.1, FRONT - TD / 2);
    deck.add(st);
  }
  // coin telescope (green, the classic tourist viewer)
  const tg = new THREE.Group();
  const green = flat(0x2f8f6a, { roughness: 0.45, metalness: 0.3 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.38, 0.12, 10), green);
  base.position.y = 0.06;
  tg.add(base);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.1, 8), green);
  pole.position.y = 0.65;
  tg.add(pole);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.42, 0.5), green);
  head.position.set(0, 1.35, 0);
  tg.add(head);
  for (const sx of [-0.15, 0.15]) {
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.26, 10), green);
    lens.rotation.x = Math.PI / 2;
    lens.position.set(sx, 1.38, 0.34);
    tg.add(lens);
    const eye = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.12, 8), M.rubber);
    eye.rotation.x = Math.PI / 2;
    eye.position.set(sx, 1.38, -0.3);
    tg.add(eye);
  }
  const slot = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.16, 0.02),
    flat(0xffd23f, { metalness: 0.6, roughness: 0.3 }),
  );
  slot.position.set(0.32, 1.32, 0);
  slot.rotation.y = Math.PI / 2;
  tg.add(slot);
  tg.traverse((o) => o.isMesh && (o.castShadow = true));
  tg.position.set(-2.4, ROOF_Y, RZ - 0.9);
  tg.rotation.y = -0.2;
  deck.add(tg);
  // planters with little trees
  for (const [x, z] of [
    [-4.6, RZ - 0.9],
    [4.4, RZ - 1.0],
    [-4.4, RZ - 6],
  ]) {
    const pot = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.6, 1.0), flat(0x8b8f99));
    pot.position.set(x, ROOF_Y + 0.3, z);
    pot.castShadow = true;
    deck.add(pot);
    const b = sway(bush(Math.abs(Math.round(x * 3)), 0x5aa233), Math.abs(x), 0.03);
    b.position.set(x, ROOF_Y + 0.55, z);
    b.scale.setScalar(0.9);
    deck.add(b);
  }
  // AC units + vents further back
  for (const [x, z] of [
    [2.2, FRONT - 7],
    [3.8, FRONT - 7],
    [-1.0, FRONT - 8.5],
  ]) {
    const ac = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 1.2), flat(0xc9cdd4));
    ac.position.set(x, ROOF_Y + 0.45, z);
    ac.castShadow = true;
    deck.add(ac);
    const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.04, 12), flat(0x50555e));
    fan.position.set(x, ROOF_Y + 0.92, z);
    deck.add(fan);
    fans.push(fan);
  }
  // antenna mast + red light
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.2, 9, 6), M.steel);
  mast.position.set(-3.2, ROOF_Y + 4.5, FRONT - 9);
  mast.castShadow = true;
  deck.add(mast);
  const red = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 8, 6),
    flat(0xff3b2f, { emissive: 0xff2010, emissiveIntensity: 1.5 }),
  );
  red.position.set(-3.2, ROOF_Y + 9.1, FRONT - 9);
  deck.add(red);
  blinkers.push(red);
  // flag pole + flag waving in the wind (vertex wave)
  const fp = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 4.2, 6), rail);
  fp.position.set(4.7, ROOF_Y + 2.1, FRONT - 2.4);
  deck.add(fp);
  const fgeo = new THREE.PlaneGeometry(1.6, 1.0, 10, 4);
  fgeo.translate(0.8, 0, 0);
  const flag = new THREE.Mesh(fgeo, flat(0xffd23f, { side: THREE.DoubleSide, roughness: 0.7 }));
  flag.position.set(4.72, ROOF_Y + 3.6, FRONT - 2.4);
  flag.rotation.y = 2.3;
  flag.castShadow = true;
  deck.add(flag);
  const fbase = Float32Array.from(fgeo.attributes.position.array);
  onFrame((t) => {
    const p = fgeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = fbase[i * 3];
      p.setZ(i, Math.sin(x * 3.2 - t * 7) * 0.16 * x);
      p.setY(i, fbase[i * 3 + 1] - x * 0.05);
    }
    p.needsUpdate = true;
    fgeo.computeVertexNormals();
  });
  ground.add(deck);
}
onFrame((t) => {
  fans.forEach((f, i) => (f.rotation.y = t * (6 + i)));
  blinkers.forEach((b, i) => (b.visible = (t * 0.8 + i * 0.37) % 1 < 0.55));
});

// window instances (after every house + tower exists)
inst(frames, new THREE.BoxGeometry(0.74, 0.94, 0.05), flat(0xf6f1ea));
inst(
  lit,
  new THREE.BoxGeometry(0.62, 0.8, 0.06),
  flat(0xffd27a, { emissive: 0xffb84d, emissiveIntensity: 0.9 }),
);
inst(
  dark,
  new THREE.BoxGeometry(0.6, 0.8, 0.06),
  flat(0x55709c, { roughness: 0.12, metalness: 0.4 }),
);
{
  const frameMat = flat(0xe4e6ee, { roughness: 0.5 });
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), frameMat, bands.length);
  bands.forEach((b, i) => {
    b.g.updateMatrixWorld();
    m4.compose(V(b.x, b.y, b.z), new THREE.Quaternion(), V(b.sx, 0.14, b.sz)).premultiply(
      b.g.matrixWorld,
    );
    im.setMatrixAt(i, m4);
  });
  im.castShadow = im.receiveShadow = true;
  ground.add(im);
  const mm = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), frameMat, mullions.length);
  mullions.forEach((b, i) => {
    b.g.updateMatrixWorld();
    m4.compose(
      V(b.x, b.y, b.z),
      new THREE.Quaternion(),
      b.side ? V(0.08, b.h, 0.1) : V(0.1, b.h, 0.08),
    ).premultiply(b.g.matrixWorld);
    mm.setMatrixAt(i, m4);
  });
  ground.add(mm);
}

// ---------------------------------------------------------------- street furniture
for (const x of [-16, 7.5, 16]) place(lamp({ on: true, h: 3.8 }), x, ROAD.z0 - 0.45);
for (const x of [-18, -2, 13]) place(lamp({ on: true, h: 3.8 }), x, ROAD.z1 + 0.5);
export const PLANTER = [-4.4, -3.75];
{
  const pot = flat(0xbfb6ad);
  for (const [x, z, s] of [
    [PLANTER[0], PLANTER[1], 1],
    [-9.5, -3.6, 1.1],
    [8.5, -3.7, 1.0],
  ]) {
    const g = new THREE.Group();
    const b = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.7, 0.9), pot);
    b.position.y = 0.35;
    b.castShadow = b.receiveShadow = true;
    g.add(b);
    const soil = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.06, 0.75), flat(0x5a3a26));
    soil.position.y = 0.7;
    g.add(soil);
    const bu = sway(bush(Math.round(x * 7 + 50), 0x62a83a), x, 0.03);
    bu.position.set(-0.25, 0.65, 0);
    bu.scale.setScalar(0.7);
    g.add(bu);
    place(g, x, z, 0, s);
  }
}
// street trees on the far sidewalk
for (const x of [-22, -9, 4, 19]) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.18, 2.4, 6), M.trunk);
  trunk.position.y = 1.2;
  trunk.castShadow = true;
  g.add(trunk);
  for (let k = 0; k < 3; k++) {
    const leaf = F(
      new THREE.IcosahedronGeometry(1.0 - k * 0.2, 1),
      [M.leaf, M.leaf2, flat(0xd98a3a)][k],
      0.1,
      x + k,
    );
    leaf.position.set((k - 1) * 0.35, 2.7 + k * 0.6, 0);
    leaf.castShadow = true;
    g.add(leaf);
  }
  sway(g, x, 0.02);
  place(g, x, 6.6);
}
place(busStop(), 21, -1.9, Math.PI);
place(bench(), -12.5, -3.7);
place(bin(), -7.6, -1.3);
place(hydrant(), 4.6, -1.25);
place(trafficLight("red"), -13.4, -1.1, Math.PI);
place(trafficLight("green"), -7.6, ROAD.z1 + 0.35);
place(bike(0x2f9bff), -17.6, -3.6, 0.1);
place(bike(0xffd23f), -16.9, -3.7, 0.1);
// parked cars on the far side
car(-26, ROAD.z1 - 0.8, 0x3c7be2);
car(24, ROAD.z1 - 0.8, 0xf2c230);

// ---------------------------------------------------------------- life: taxis on the road
{
  const taxis = [
    [car(0, 0, 0xf2c230), 1, 3.4, 9, 0],
    [car(0, 0, 0xe2453c), -1, 0.6, 7.5, 31],
    [car(0, 0, 0xf2c230), -1, 0.6, 8, 63],
    [car(0, 0, 0x8fd0c5), 1, 3.4, 6.5, 47],
  ];
  onFrame((t) => {
    for (const [c, dir, z, v, ph] of taxis) {
      const x = ((((t * v + ph) % 130) + 130) % 130) - 65;
      c.position.set(dir * x, 0.04, z);
      c.rotation.y = dir > 0 ? 0 : Math.PI;
    }
  });
}

// ---------------------------------------------------------------- the railway + ICE
// embankment, gravel, sleepers, two rails, catenary poles; the ICE races
// through on its own clock and once right past the camera (T.ohne … T.doch).
{
  const emb = new THREE.Mesh(
    facet(new THREE.BoxGeometry(220, 0.5, 6, 80, 1, 2), 0.06, 9),
    facetMat(flat(0x9a8e86)),
  );
  add(emb, 0, 0.25, TRACK_Z, false);
  emb.receiveShadow = true;
  const sleepers = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.35, 0.1, 2.6),
    flat(0x6e5544),
    220,
  );
  for (let i = 0; i < 220; i++) {
    m4.makeTranslation(-110 + i, 0.55, TRACK_Z);
    sleepers.setMatrixAt(i, m4);
  }
  sleepers.receiveShadow = true;
  ground.add(sleepers);
  for (const dz of [-0.75, 0.75])
    add(
      new THREE.Mesh(new THREE.BoxGeometry(220, 0.1, 0.12), M.chrome),
      0,
      0.65,
      TRACK_Z + dz,
      false,
    );
  const poleMat = flat(0x8a96a3, { metalness: 0.5, roughness: 0.4 });
  for (let x = -100; x <= 100; x += 12) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.14, 4.6, 0.14), poleMat);
    add(p, x, 2.8, TRACK_Z - 2.2);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 2.4), poleMat);
    add(arm, x, 4.9, TRACK_Z - 1.1, false);
  }
  add(
    new THREE.Mesh(new THREE.BoxGeometry(220, 0.03, 0.03), flat(0x333333)),
    0,
    4.7,
    TRACK_Z,
    false,
  );
  // green strip with bushes beyond the track
  for (let x = -60; x < 60; x += 4.5) {
    if (x > 8 && x < 34) continue; // keep the ICE camera's view free
    const b = bush(Math.round(x + 200), 0x5f9f37);
    place(b, x + (r() - 0.5) * 2, TRACK_Z + 4.5 + r() * 2, r() * 6, 1.2 + r() * 0.6);
  }
}
export const ice = new THREE.Group();
{
  const white = flat(0xf3f5f8, { roughness: 0.3, metalness: 0.1 });
  const red = flat(0xd8142a, { roughness: 0.4 });
  const win = flat(0x23293a, { roughness: 0.1, metalness: 0.5 });
  const L = 7.2;
  for (let c = 0; c < 3; c++) {
    const x0 = -c * (L + 0.3);
    const body = new THREE.Mesh(new THREE.BoxGeometry(L, 1.6, 1.5), white);
    body.position.set(x0 - L / 2, 1.65, 0);
    body.castShadow = true;
    ice.add(body);
    const band = new THREE.Mesh(new THREE.BoxGeometry(L - 0.4, 0.42, 1.52), win);
    band.position.set(x0 - L / 2, 1.95, 0);
    ice.add(band);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(L, 0.14, 1.53), red);
    stripe.position.set(x0 - L / 2, 1.2, 0);
    ice.add(stripe);
    const skirt = new THREE.Mesh(new THREE.BoxGeometry(L - 0.6, 0.35, 1.3), flat(0x3a3f4a));
    skirt.position.set(x0 - L / 2, 0.85, 0);
    ice.add(skirt);
  }
  // the nose: a rounded wedge (side profile extruded across the width)
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(0, 1.6);
  s.quadraticCurveTo(1.6, 1.55, 3.0, 0.25);
  s.lineTo(3.0, 0);
  s.lineTo(0, 0);
  const nose = new THREE.Mesh(
    new THREE.ExtrudeGeometry(s, {
      depth: 1.5,
      bevelEnabled: true,
      bevelSize: 0.12,
      bevelThickness: 0.12,
      bevelSegments: 2,
      curveSegments: 6,
    }),
    white,
  );
  nose.position.set(0, 0.85, -0.75);
  nose.castShadow = true;
  ice.add(nose);
  const shield = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.3, 1.2), win);
  shield.position.set(1.0, 2.05, 0);
  shield.rotation.z = -0.55;
  ice.add(shield);
  const nstripe = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.14, 1.66), red);
  nstripe.position.set(1.2, 1.2, 0);
  nstripe.rotation.z = -0.12;
  ice.add(nstripe);
  const lampMat = flat(0xffffff, { emissive: 0xfff2d0, emissiveIntensity: 1.6 });
  for (const dz of [-0.5, 0.5]) {
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), lampMat);
    l.position.set(2.75, 1.25, dz);
    ice.add(l);
  }
  ice.position.set(-200, 0.25, TRACK_Z);
  ground.add(ice);
}
// nose x at time t: the close pass is keyed to "ICE"; otherwise it rolls
// through the background every ~16 s
export const ICE_SPEED = 34;
export function iceX(t) {
  if (t > T.ohne - 0.5 && t < T.doch + 0.5) return -4 + (t - T.ohne) * 18;
  return (((((t - 26) * 18) % 300) + 300) % 300) - 150;
}
onFrame((t) => (ice.position.x = iceX(t)));

finishSet({ ground: 0x8a8590 });
