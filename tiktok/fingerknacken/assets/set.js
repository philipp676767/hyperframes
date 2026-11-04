// Set of #55 "Fingerknacken": an open-plan office on the 20th floor, late
// afternoon. Golden sun low through the floor-to-ceiling glass front (-z),
// the mullions throw long stripes across the carpet. Outside: a city of
// towers far below and around, hills on the horizon. Inside: your desk
// (monitor with code, keyboard, coffee, phone, cola, plant), colleague desk
// clusters, a glass meeting box, a concrete column with a wall clock,
// ceiling light panels. Life: coffee steam, clouds + birds, a window-cleaner
// gondola sliding down outside, dust in the sun, plants swaying.
// One pocket far below for the macro: JOINT (inside your finger).
// Scale: 1 unit ≈ 25 cm. Desk top at y = 3.
import { THREE, flat, ground, onFrame, rng, patches, facet, facetMat, V } from "./world.js";
import { setSky, finishSet, F, fireflies } from "./environments.js";
import { sway } from "./props.js";
import { JOINT, DESK_Y } from "./beats.js";

const r = rng(55);
export const CEIL = 11;
export const WIN_Z = -16; // the glass front
const X0 = -34;
const X1 = 34;
const ZB = 12; // back wall

// ---------------------------------------------------------------- light
export const sky = setSky({
  top: [0.3, 0.45, 0.82],
  mid: [0.92, 0.66, 0.6],
  hor: [1.0, 0.74, 0.44],
  below: [0.86, 0.66, 0.56],
  sun: [1.0, 0.8, 0.5],
  sunDir: [0.38, 0.16, -1],
  cloud: [0xfff0e0, 0xffb38a],
  clouds: 14,
  birds: true,
  hemi: [0xffe9d6, 0x5a5060, 1.5],
  key: [0xffc98a, 3.4],
  keyPos: [11.5, 8.2, -30],
  rim: [0x9fb8ff, 0.6],
  fog: [90, 420],
});

// ---------------------------------------------------------------- helpers
const box = (w, h, d, mat, x, y, z, amt = 0.03, seed = 1, shadow = true, parent = ground) => {
  const m = F(new THREE.BoxGeometry(w, h, d), mat, amt, seed);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};
const cyl = (rt, rb, h, seg, mat, x, y, z, amt = 0.04, seed = 1, parent = ground) => {
  const m = F(new THREE.CylinderGeometry(rt, rb, h, seg), mat, amt, seed);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};
export const glow = (color, i = 1.6) => flat(0xffffff, { emissive: color, emissiveIntensity: i });
export function textTex(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace;
  tx.anisotropy = 4;
  return tx;
}

// ---------------------------------------------------------------- materials
const carpet = flat(0x9a8676, { roughness: 1 });
const ceilMat = flat(0xf1eee8, { roughness: 0.85 });
const wallMat = flat(0xe9e2d6, { roughness: 0.8 });
const accentWall = flat(0x2f6f6a, { roughness: 0.8 });
const frameMat = flat(0x2c3038, { roughness: 0.4, metalness: 0.3 });
const concrete = flat(0xb8b2a8, { roughness: 0.9 });
const deskTop = flat(0xe9dcc6, { roughness: 0.55 });
const deskLeg = flat(0x30343c, { roughness: 0.4, metalness: 0.4 });
const plastic = flat(0x2a2d33, { roughness: 0.5 });
const chairMat = flat(0x3b4a8a, { roughness: 0.9 });
const leafA = flat(0x3f9a4a, { roughness: 0.9 });
const leafB = flat(0x5cb85c, { roughness: 0.9 });
const potMat = flat(0xe9e4dc, { roughness: 0.7 });

// ---------------------------------------------------------------- shell
// carpet tiles: two warm greys in a checker + colour patches
{
  const g = patches(facet(new THREE.BoxGeometry(X1 - X0, 0.3, ZB - WIN_Z, 68, 1, 56), 0.03, 3), {
    amt: 0.07,
    scale: 0.12,
    seed: 4,
    warm: 0.5,
  });
  const fl = new THREE.Mesh(g, facetMat(carpet));
  fl.position.set(0, -0.15, (ZB + WIN_Z) / 2);
  fl.receiveShadow = true;
  ground.add(fl);
  // darker tiles in a checker (instanced flat squares)
  const n = 34 * 14;
  const im = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1.96, 0.02, 1.96),
    flat(0xffffff, { roughness: 1 }),
    n,
  );
  const m4 = new THREE.Matrix4();
  const c = new THREE.Color();
  let k = 0;
  for (let i = 0; i < 34; i++)
    for (let j = 0; j < 14; j++) {
      if ((i + j) % 2) continue;
      m4.makeTranslation(X0 + 1 + i * 2, 0.01, WIN_Z + 1 + j * 2);
      im.setMatrixAt(k, m4);
      im.setColorAt(k++, c.setHex([0x857263, 0x8e7a6a, 0x7c6a5c][(i * 7 + j * 3) % 3]));
    }
  im.count = k;
  im.receiveShadow = true;
  ground.add(im);
}
// ceiling + light panels + a duct
box(X1 - X0, 0.4, ZB - WIN_Z + 1, ceilMat, 0, CEIL + 0.2, (ZB + WIN_Z) / 2, 0.02, 6, false);
for (let x = -24; x <= 24; x += 8)
  for (let z = -11; z <= 8; z += 6.5)
    box(3.2, 0.06, 1.4, glow(0xfff6e6, 0.9), x, CEIL - 0.03, z, 0, 7, false);
// back wall (+z) with an accent strip
box(X1 - X0, CEIL, 0.5, wallMat, 0, CEIL / 2, ZB, 0.02, 8);
box(X1 - X0, 3.4, 0.1, accentWall, 0, 4.2, ZB - 0.3, 0.02, 9, false);
// side walls
box(0.5, CEIL, ZB - WIN_Z, wallMat, X0, CEIL / 2, (ZB + WIN_Z) / 2, 0.02, 10);
box(0.5, CEIL, ZB - WIN_Z, wallMat, X1, CEIL / 2, (ZB + WIN_Z) / 2, 0.02, 11);

// the glass front: mullions every 5 units, a sill, the slab edge outside
export const MULLIONS = [];
for (let x = X0 + 2; x < X1; x += 5) {
  box(0.28, CEIL, 0.5, frameMat, x, CEIL / 2, WIN_Z, 0.02, 12);
  MULLIONS.push(x);
}
box(X1 - X0, 0.35, 0.8, frameMat, 0, 0.17, WIN_Z, 0.02, 13);
box(X1 - X0, 0.25, 0.5, frameMat, 0, CEIL - 0.1, WIN_Z, 0.02, 14);
box(X1 - X0, 0.1, 0.4, frameMat, 0, 1.4, WIN_Z, 0.02, 15); // railing bar
{
  const gm = new THREE.MeshStandardMaterial({
    color: 0xcfe6ff,
    roughness: 0.05,
    metalness: 0.1,
    transparent: true,
    opacity: 0.07,
    depthWrite: false,
  });
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, CEIL), gm);
  gl.position.set(0, CEIL / 2, WIN_Z + 0.05);
  gl.userData.noAO = true;
  ground.add(gl);
}
// the building's facade below the window (seen when looking down)
box(X1 - X0 + 20, 0.8, 3, concrete, 0, -0.4, WIN_Z - 1.6, 0.03, 16, false);
box(
  X1 - X0 + 20,
  60,
  1,
  flat(0x6c7684, { roughness: 0.3, metalness: 0.4 }),
  0,
  -30.8,
  WIN_Z - 2.6,
  0.02,
  17,
  false,
);

// concrete column with the wall clock
export const CLOCK = [-7.5, 7.6, -9.4];
box(2, CEIL, 2, concrete, -7.5, CEIL / 2, -10.5, 0.03, 18);
export const clock = new THREE.Group();
{
  clock.position.set(...CLOCK);
  ground.add(clock);
  const face = F(new THREE.CylinderGeometry(0.85, 0.85, 0.12, 24), flat(0xfbfaf5), 0.01, 19);
  face.rotation.x = Math.PI / 2;
  clock.add(face);
  const rim = F(new THREE.TorusGeometry(0.85, 0.08, 6, 24), frameMat, 0.01, 20);
  clock.add(rim);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const tick = F(new THREE.BoxGeometry(0.05, i % 3 ? 0.1 : 0.18, 0.02), plastic, 0, 21);
    tick.position.set(Math.sin(a) * 0.7, Math.cos(a) * 0.7, 0.08);
    tick.rotation.z = -a;
    clock.add(tick);
  }
  const hand = (len, w, z, color) => {
    const p = new THREE.Group();
    p.position.z = z;
    clock.add(p);
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(w, len, 0.02).translate(0, len / 2 - 0.08, 0),
      flat(color),
    );
    p.add(m);
    return p;
  };
  clock.userData.hour = hand(0.45, 0.07, 0.09, 0x23262c);
  clock.userData.min = hand(0.65, 0.05, 0.1, 0x23262c);
  clock.userData.sec = hand(0.7, 0.02, 0.11, 0xe2453c);
}

// glass meeting box on the right (behind the colleague cluster)
{
  const gx = 17;
  const gz = -8;
  const gm = new THREE.MeshStandardMaterial({
    color: 0xd8f0ff,
    roughness: 0.08,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
  });
  for (const [w, d, x, z] of [
    [10, 0.1, gx, gz + 4],
    [0.1, 8, gx - 5, gz],
  ]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(w, CEIL, d), gm);
    p.position.set(x, CEIL / 2, z);
    p.userData.noAO = true;
    ground.add(p);
  }
  box(10, 0.15, 0.15, frameMat, gx, CEIL - 0.2, gz + 4, 0, 22, false);
  box(0.15, CEIL, 0.15, frameMat, gx - 5, CEIL / 2, gz + 4, 0, 23);
  // a frosted band + meeting table and chairs inside
  box(
    10,
    0.6,
    0.12,
    flat(0xffffff, { roughness: 0.9, transparent: true, opacity: 0.55 }),
    gx,
    4.2,
    gz + 4,
    0,
    24,
    false,
  );
  box(6, 0.15, 2.6, flat(0x6a4a34), gx, 3, gz, 0.03, 25);
  box(0.4, 3, 0.4, deskLeg, gx, 1.5, gz, 0, 26);
  // whiteboard on the side
  box(0.1, 3.2, 5, flat(0xfdfdfb), gx + 4.9, 5.5, gz, 0.01, 27, false);
  for (let i = 0; i < 4; i++)
    box(
      0.12,
      0.08,
      1 + r() * 2.5,
      flat([0xe2453c, 0x2f6fd6, 0x2fae6a, 0x2c3038][i]),
      gx + 4.82,
      6.4 - i * 0.6,
      gz - 0.8 + r() * 1.2,
      0,
      28 + i,
      false,
    );
}

// ---------------------------------------------------------------- desks
export const DESKS = [];
function chair(x, z, rot = 0, color = chairMat) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rot;
  ground.add(g);
  box(2.0, 0.4, 2.0, color, 0, 2.0, 0, 0.04, 40, true, g);
  box(2.0, 2.6, 0.35, color, 0, 3.5, 1.0, 0.04, 41, true, g);
  cyl(0.12, 0.12, 1.8, 6, deskLeg, 0, 1.0, 0, 0, 42, g);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const leg = box(
      1.1,
      0.12,
      0.18,
      deskLeg,
      Math.cos(a) * 0.55,
      0.2,
      Math.sin(a) * 0.55,
      0,
      43,
      false,
      g,
    );
    leg.rotation.y = -a;
  }
  return g;
}
function monitor(x, z, rot, seed, lit = true) {
  const g = new THREE.Group();
  g.position.set(x, DESK_Y, z);
  g.rotation.y = rot;
  ground.add(g);
  box(0.9, 0.08, 0.7, plastic, 0, 0.04, 0, 0, seed, true, g);
  box(0.18, 1.0, 0.12, plastic, 0, 0.55, -0.1, 0, seed, true, g);
  box(2.6, 1.55, 0.12, plastic, 0, 1.55, 0, 0.01, seed, true, g);
  if (lit) {
    const tx = textTex(512, 300, (c, w, h) => {
      c.fillStyle = "#14161f";
      c.fillRect(0, 0, w, h);
      const rr = rng(seed);
      const cols = ["#7ad1ff", "#ffd23f", "#ff7ab6", "#8ef07a", "#c6c9d6"];
      for (let i = 0; i < 14; i++) {
        let xx = 20 + Math.floor(rr() * 3) * 22;
        for (let k = 0; k < 3; k++) {
          const ww = 30 + rr() * 110;
          c.fillStyle = cols[Math.floor(rr() * 5)];
          c.fillRect(xx, 16 + i * 20, ww, 9);
          xx += ww + 12;
        }
      }
    });
    const s = new THREE.Mesh(
      new THREE.PlaneGeometry(2.42, 1.4),
      new THREE.MeshStandardMaterial({
        map: tx,
        emissive: 0xffffff,
        emissiveMap: tx,
        emissiveIntensity: 0.7,
        roughness: 0.3,
      }),
    );
    s.position.set(0, 1.55, 0.065);
    g.add(s);
  }
  return g;
}
function deskAt(x, z, seed, { mon = true, chairRot = 0 } = {}) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  ground.add(g);
  box(7, 0.18, 3.2, deskTop, 0, DESK_Y - 0.09, 0, 0.02, seed, true, g);
  for (const sx of [-1, 1]) {
    box(0.18, DESK_Y - 0.18, 2.8, deskLeg, sx * 3.3, (DESK_Y - 0.18) / 2, 0, 0, seed + 1, true, g);
  }
  // privacy screen at the back edge (felt, a coloured band)
  box(
    7,
    1.2,
    0.12,
    flat([0x5c8f86, 0x8a6fae, 0xd88a4a][seed % 3], { roughness: 1 }),
    0,
    DESK_Y + 0.6,
    -1.65,
    0.04,
    seed + 2,
    true,
    g,
  );
  if (mon) monitor(x, z - 0.9, 0, seed + 3);
  DESKS.push({ x, z, g });
  chair(x + 0.4, z + 2.6, chairRot);
  return g;
}

// your desk: centred at the origin, you sit at +z looking at the window
export const YOUR_DESK = [0, DESK_Y, -0.6];
{
  const g = new THREE.Group();
  g.position.set(0, 0, -0.6);
  ground.add(g);
  box(7.6, 0.2, 3.4, deskTop, 0, DESK_Y - 0.1, 0, 0.02, 50, true, g);
  for (const sx of [-1, 1])
    box(0.2, DESK_Y - 0.2, 3, deskLeg, sx * 3.6, (DESK_Y - 0.2) / 2, 0, 0, 51, true, g);
  box(7.6, 1.2, 0.12, flat(0x5c8f86, { roughness: 1 }), 0, DESK_Y + 0.6, -1.75, 0.04, 52, true, g);
  // post-its on the screen
  for (let i = 0; i < 4; i++) {
    const p = box(
      0.32,
      0.32,
      0.02,
      flat([0xffe066, 0xff8fb8, 0x8fe3ff, 0xffe066][i]),
      -1.5 + i * 0.25 + (i > 1 ? 2.5 : 0),
      DESK_Y + 1.55 + (i % 2) * 0.4,
      -1.42,
      0,
      53,
      false,
      g,
    );
    p.rotation.z = (r() - 0.5) * 0.3;
  }
}
export const MONITOR = monitor(0, -1.6, 0, 60);
// keyboard + mouse + mouse pad
export const KEYBOARD = [0, DESK_Y, 0.15];
{
  const kb = box(
    2.4,
    0.1,
    0.8,
    flat(0x3a3e46, { roughness: 0.5 }),
    0,
    DESK_Y + 0.05,
    0.15,
    0.01,
    61,
  );
  kb.rotation.x = 0.04;
  const keys = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.13, 0.05, 0.13),
    flat(0xe8e8ee, { roughness: 0.6 }),
    15 * 5,
  );
  const m4 = new THREE.Matrix4();
  let k = 0;
  for (let i = 0; i < 15; i++)
    for (let j = 0; j < 5; j++) {
      m4.makeTranslation(-1.05 + i * 0.15, DESK_Y + 0.12, -0.15 + j * 0.15);
      keys.setMatrixAt(k++, m4);
    }
  keys.castShadow = true;
  ground.add(keys);
  box(1.3, 0.02, 1.1, flat(0x4b3a6a), 2.3, DESK_Y + 0.01, 0.2, 0, 62, false);
  const mouse = F(
    new THREE.SphereGeometry(0.22, 8, 6),
    flat(0xe8e8ee, { roughness: 0.4 }),
    0.03,
    63,
  );
  mouse.scale.set(0.8, 0.45, 1.2);
  mouse.position.set(2.3, DESK_Y + 0.08, 0.2);
  mouse.castShadow = true;
  ground.add(mouse);
}
// coffee mug with steam
export const MUG = [-2.5, DESK_Y, -0.4];
{
  cyl(
    0.32,
    0.28,
    0.75,
    14,
    flat(0xe2453c, { roughness: 0.4 }),
    MUG[0],
    DESK_Y + 0.37,
    MUG[2],
    0.02,
    64,
  );
  const h = F(
    new THREE.TorusGeometry(0.18, 0.06, 6, 10),
    flat(0xe2453c, { roughness: 0.4 }),
    0.02,
    65,
  );
  h.position.set(MUG[0] + 0.36, DESK_Y + 0.4, MUG[2]);
  ground.add(h);
  const coffee = new THREE.Mesh(
    new THREE.CircleGeometry(0.28, 14).rotateX(-Math.PI / 2),
    flat(0x4a2c1c, { roughness: 0.2 }),
  );
  coffee.position.set(MUG[0], DESK_Y + 0.7, MUG[2]);
  ground.add(coffee);
  const steamMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
    roughness: 1,
  });
  const puffs = [];
  for (let i = 0; i < 7; i++) {
    const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 0), steamMat);
    s.userData.noAO = true;
    ground.add(s);
    puffs.push(s);
  }
  onFrame((t) => {
    puffs.forEach((s, i) => {
      const u = (t * 0.35 + i / 7) % 1;
      s.position.set(
        MUG[0] + Math.sin(u * 7 + i) * 0.12,
        DESK_Y + 0.8 + u * 1.6,
        MUG[2] + Math.cos(u * 5 + i) * 0.08,
      );
      s.scale.setScalar(0.6 + u * 1.6);
      s.visible = u < 0.95;
    });
  });
}
// phone lying on the desk (screen texture set by scene.js)
export const PHONE = [2.2, DESK_Y, -0.9];
export const phoneScreen = new THREE.Mesh(
  new THREE.PlaneGeometry(0.62, 1.22).rotateX(-Math.PI / 2),
  new THREE.MeshStandardMaterial({
    color: 0x111318,
    roughness: 0.2,
    emissive: 0xffffff,
    emissiveIntensity: 0,
  }),
);
{
  const body = box(
    0.7,
    0.08,
    1.32,
    flat(0x1d1f25, { roughness: 0.3 }),
    PHONE[0],
    DESK_Y + 0.04,
    PHONE[2],
    0,
    66,
  );
  body.rotation.y = -0.25;
  phoneScreen.position.set(PHONE[0], DESK_Y + 0.085, PHONE[2]);
  phoneScreen.rotation.y = -0.25;
  ground.add(phoneScreen);
}
// a cola bottle (glass, the cap animated in scene.js)
export const COLA = [-3.0, DESK_Y, -1.15];
export const colaCap = F(
  new THREE.CylinderGeometry(0.13, 0.13, 0.1, 10),
  flat(0xe2453c, { roughness: 0.4 }),
  0.02,
  67,
);
{
  const pts = [
    [0, 0],
    [0.3, 0],
    [0.32, 0.15],
    [0.26, 0.55],
    [0.32, 0.95],
    [0.3, 1.25],
    [0.14, 1.65],
    [0.11, 1.95],
    [0, 1.95],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const glass = new THREE.Mesh(
    new THREE.LatheGeometry(pts, 12),
    new THREE.MeshStandardMaterial({
      color: 0x3a1408,
      roughness: 0.12,
      metalness: 0.1,
      transparent: true,
      opacity: 0.88,
    }),
  );
  glass.position.set(COLA[0], DESK_Y, COLA[2]);
  glass.castShadow = true;
  ground.add(glass);
  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(0.315, 0.315, 0.32, 14, 1, true),
    flat(0xe2453c, { roughness: 0.6, side: THREE.DoubleSide }),
  );
  label.position.set(COLA[0], DESK_Y + 0.62, COLA[2]);
  ground.add(label);
  colaCap.position.set(COLA[0], DESK_Y + 2.0, COLA[2]);
  colaCap.castShadow = true;
  ground.add(colaCap);
}
// plant in a pot on your desk + a desk lamp
function plant(x, y, z, s, seed) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  ground.add(g);
  cyl(0.45 * s, 0.35 * s, 0.8 * s, 9, potMat, 0, 0.4 * s, 0, 0.03, seed, g);
  const rr = rng(seed);
  for (let i = 0; i < 9; i++) {
    const leaf = F(
      new THREE.IcosahedronGeometry(0.35 * s, 0).scale(0.6, 1.6, 0.25),
      i % 2 ? leafA : leafB,
      0.06,
      seed + i,
    );
    const a = (i / 9) * Math.PI * 2;
    leaf.position.set(Math.cos(a) * 0.25 * s, (1.1 + rr() * 0.6) * s, Math.sin(a) * 0.25 * s);
    leaf.rotation.set(Math.sin(a) * 0.6, 0, -Math.cos(a) * 0.6);
    leaf.castShadow = true;
    g.add(leaf);
  }
  sway(g, seed, 0.02);
  return g;
}
plant(3.2, DESK_Y, -1.5, 1, 70);
{
  const g = new THREE.Group();
  g.position.set(-3.4, DESK_Y, -1.3);
  ground.add(g);
  cyl(0.35, 0.4, 0.1, 10, plastic, 0, 0.05, 0, 0, 71, g);
  const arm = box(0.08, 1.8, 0.08, plastic, 0, 0.95, 0, 0, 72, true, g);
  arm.rotation.z = 0.25;
  const shade = cyl(
    0.12,
    0.38,
    0.4,
    10,
    flat(0xffd23f, { roughness: 0.4 }),
    -0.45,
    1.85,
    0.1,
    0.02,
    73,
    g,
  );
  shade.rotation.z = 0.9;
}
chair(0, 3.4, 0, flat(0xe0663a, { roughness: 0.9 }));

// colleague desks: two clusters left and right, one row further forward
export const COLLEAGUE_DESKS = [
  [-9.5, -0.6],
  [9.5, -0.6],
  [-9.5, -7.4],
  [9.5, -7.4],
  [0, -7.4],
  [-19, -0.6],
  [19, -0.6],
  [-19, -7.4],
];
COLLEAGUE_DESKS.forEach(([x, z], i) => deskAt(x, z, 80 + i * 7));
// clutter on the colleague desks: mugs, binders, plants
COLLEAGUE_DESKS.forEach(([x, z], i) => {
  const rr = rng(200 + i);
  cyl(
    0.28,
    0.25,
    0.65,
    10,
    flat([0x2f6fd6, 0xffd23f, 0xffffff, 0x2fae6a][i % 4], { roughness: 0.4 }),
    x - 2.3 + rr(),
    DESK_Y + 0.33,
    z + 0.2,
    0.02,
    210 + i,
  );
  for (let k = 0; k < 3; k++)
    box(
      0.35,
      1.2,
      0.9,
      flat([0xe2453c, 0x2f6fd6, 0x3c3c44][k]),
      x + 2.4 + k * 0.38,
      DESK_Y + 0.6,
      z - 1.0,
      0.02,
      220 + k,
      true,
    );
  if (i % 2 === 0) plant(x - 2.8, DESK_Y, z - 1.1, 0.8, 230 + i);
});
// big floor plants by the window + along the walls
for (const [x, z, s] of [
  [-3.8, -13.6, 2.2],
  [4.6, -13.8, 2.6],
  [-15, -13.6, 2.4],
  [12.4, 9.5, 2.6],
  [-13, 9.6, 2.2],
])
  plant(x, 0, z, s, 300 + Math.round(x * 3));
// a lounge sofa by the window on the left
{
  const g = new THREE.Group();
  g.position.set(-24, 0, -11.5);
  ground.add(g);
  const sofa = flat(0xd88a4a, { roughness: 1 });
  box(7, 1.6, 2.6, sofa, 0, 1.2, 0, 0.05, 310, true, g);
  box(7, 2.2, 0.8, sofa, 0, 2.6, -1.1, 0.05, 311, true, g);
  for (const sx of [-1, 1]) box(0.8, 2.2, 2.6, sofa, sx * 3.5, 1.6, 0, 0.05, 312, true, g);
  box(2.6, 0.15, 1.6, flat(0x2c3038), 0, 1.4, 3, 0.02, 313, true, g);
}

// ---------------------------------------------------------------- outside: the city far below
const CITY_Y = -180;
{
  // ground: blocks of park and streets far below
  const g = patches(
    facet(new THREE.PlaneGeometry(1200, 900, 60, 45).rotateX(-Math.PI / 2), 0.08, 31),
    {
      amt: 0.16,
      scale: 0.02,
      seed: 32,
    },
  );
  const m = new THREE.Mesh(g, facetMat(flat(0x8a8f7c, { roughness: 1 })));
  m.position.set(0, CITY_Y, -300);
  ground.add(m);
  // a river with the sun on it
  const river = new THREE.Mesh(
    new THREE.PlaneGeometry(1200, 30).rotateX(-Math.PI / 2),
    flat(0x9fc2e0, { roughness: 0.12, metalness: 0.3 }),
  );
  river.rotation.y = 0.25;
  river.position.set(0, CITY_Y + 0.5, -260);
  ground.add(river);
  // towers: a field of boxes in warm/cool tones with glowing window grids
  const rr = rng(33);
  const cols = [0xd9cbb8, 0xb9c4d0, 0x8f9db0, 0xe6d2b5, 0x6f7f96, 0xc9b8a4];
  const wr = rng(34);
  const winTex = textTex(64, 128, (c, w, h) => {
    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, w, h);
    for (let y = 4; y < h; y += 10)
      for (let x = 4; x < w; x += 10) {
        const v = wr() < 0.25 ? 255 : 150 + Math.floor(wr() * 40);
        c.fillStyle = `rgb(${v},${v - 10},${v - 30})`;
        c.fillRect(x, y, 6, 6);
      }
  });
  winTex.wrapS = winTex.wrapT = THREE.RepeatWrapping;
  for (let i = 0; i < 70; i++) {
    const a = -Math.PI / 2 + (rr() - 0.5) * 2.3;
    const d = 70 + rr() * 260;
    const x = Math.cos(a) * d * 1.4;
    const z = WIN_Z + Math.sin(a) * d;
    if (z > WIN_Z - 50) continue;
    const tall = rr() < 0.18;
    const h = tall ? 200 + rr() * 90 : 40 + rr() * 140;
    const w = 14 + rr() * 22;
    const mat = new THREE.MeshStandardMaterial({
      color: cols[Math.floor(rr() * cols.length)],
      map: winTex,
      roughness: 0.6,
      emissive: 0xffc078,
      emissiveIntensity: 0.05,
    });
    const tx = winTex.clone();
    tx.repeat.set(w / 10, h / 14);
    tx.needsUpdate = true;
    mat.map = tx;
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, w * (0.7 + rr() * 0.5)), mat);
    b.position.set(x, CITY_Y + h / 2, z);
    b.rotation.y = (rr() - 0.5) * 0.4;
    ground.add(b);
    if (tall && rr() < 0.6) {
      const sp = new THREE.Mesh(
        new THREE.ConeGeometry(1.2, 22, 6),
        flat(0xd8d8de, { roughness: 0.3, metalness: 0.5 }),
      );
      sp.position.set(x, CITY_Y + h + 11, z);
      ground.add(sp);
    }
  }
  // the TV tower — the city's landmark, right of centre
  const tx0 = 120;
  const tz0 = -330;
  const shaft = F(new THREE.CylinderGeometry(4, 8, 300, 10), flat(0xe8e2d8), 0.03, 34);
  shaft.position.set(tx0, CITY_Y + 150, tz0);
  ground.add(shaft);
  const pod = F(new THREE.SphereGeometry(16, 12, 8), flat(0xd84a3a, { roughness: 0.4 }), 0.04, 35);
  pod.scale.set(1, 0.55, 1);
  pod.position.set(tx0, CITY_Y + 250, tz0);
  ground.add(pod);
  const mast = F(new THREE.CylinderGeometry(0.8, 2, 70, 6), flat(0xe8e2d8), 0.02, 36);
  mast.position.set(tx0, CITY_Y + 330, tz0);
  ground.add(mast);
  // hills on the horizon
  for (let i = 0; i < 10; i++) {
    const s = 60 + rr() * 60;
    const hg = new THREE.IcosahedronGeometry(1, 2).scale(s * 2.2, s * 0.5, s);
    const hill = new THREE.Mesh(
      patches(facet(hg, 0.08, 40 + i), { amt: 0.1, scale: 0.02, seed: 41 + i }),
      facetMat(flat([0x7d8f8a, 0x8a9488, 0x6f8288][i % 3], { roughness: 1 })),
    );
    hill.position.set(-500 + i * 110, CITY_Y - 10, -420 - rr() * 20);
    ground.add(hill);
  }
}

// ---------------------------------------------------------------- life
// a window-cleaner gondola slides slowly down outside the glass on the right
{
  const g = new THREE.Group();
  ground.add(g);
  box(9, 0.3, 1.6, flat(0xb9bec6, { metalness: 0.4, roughness: 0.4 }), 0, 0, 0, 0.02, 90, true, g);
  for (const sx of [-1, 1])
    box(0.12, 2.2, 0.12, flat(0xffd23f), sx * 4.4, 1.1, 0.6, 0, 91, true, g);
  box(9, 0.12, 0.12, flat(0xffd23f), 0, 2.2, 0.6, 0, 92, true, g);
  for (const sx of [-1, 1]) cyl(0.03, 0.03, 60, 4, flat(0x30343c), sx * 4.2, 30, 0, 0, 93, g);
  // the cleaner: a tiny figure with a squeegee
  const body = cyl(0.45, 0.45, 2.2, 8, flat(0xff7a1a), 1.4, 1.4, 0.2, 0.04, 94, g);
  cyl(0.38, 0.38, 0.6, 8, flat(0xf1c09a), 1.4, 2.9, 0.2, 0.04, 95, g);
  cyl(0.42, 0.42, 0.3, 8, flat(0xffd23f), 1.4, 3.3, 0.2, 0.04, 96, g);
  const arm = box(0.2, 1.8, 0.2, flat(0xff7a1a), 1.9, 2.6, 0.7, 0, 97, true, g);
  const squeegee = box(1.2, 0.15, 0.15, flat(0x30343c), 1.9, 3.5, 0.9, 0, 98, true, g);
  void body;
  onFrame((t) => {
    g.position.set(13, 12 - t * 0.28, WIN_Z - 1.4);
    const w = Math.sin(t * 3.2);
    arm.rotation.z = w * 0.6;
    squeegee.position.set(1.9 - w * 1.0, 3.4 + Math.cos(t * 3.2) * 0.15, 0.9);
  });
}
// dust drifting in the sun
fireflies(90, { area: [-12, 12, 2.5, 9.5, -14, 4], color: 0xffe7c0, seed: 55, size: 0.03 });

// ---------------------------------------------------------------- pocket: JOINT (inside your finger)
{
  const g = new THREE.Group();
  g.position.set(...JOINT);
  ground.add(g);
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(70, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0x2a1020, side: THREE.BackSide, fog: false }),
  );
  dome.userData.noAO = true;
  g.add(dome);
  // floating blood-cell-ish soft blobs in the dark (depth + life)
  const n = 40;
  const im = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.5, 1),
    new THREE.MeshBasicMaterial({ color: 0x5a1e34, fog: false }),
    n,
  );
  im.userData.noAO = true;
  g.add(im);
  const rr = rng(77);
  const base = [];
  for (let i = 0; i < n; i++) {
    const a = rr() * Math.PI * 2;
    const d = 14 + rr() * 22;
    base.push([
      Math.cos(a) * d,
      (rr() - 0.5) * 26,
      Math.sin(a) * d - 8,
      rr() * 6,
      0.6 + rr() * 1.4,
    ]);
  }
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  onFrame((t) => {
    base.forEach(([x, y, z, ph, s], i) => {
      m4.compose(
        V(x + Math.sin(t * 0.3 + ph) * 1.5, y + Math.sin(t * 0.4 + ph * 2) * 1.2, z),
        q,
        V(s, s * 0.6, s),
      );
      im.setMatrixAt(i, m4);
    });
    im.instanceMatrix.needsUpdate = true;
  });
  const pl = new THREE.PointLight(0xfff0e0, 180, 70, 1.6);
  pl.position.set(10, 14, 16);
  g.add(pl);
  const pl2 = new THREE.PointLight(0x7fc8ff, 90, 50, 1.8);
  pl2.position.set(-12, -4, 10);
  g.add(pl2);
}

finishSet({ ground: 0x8a7a6a });
