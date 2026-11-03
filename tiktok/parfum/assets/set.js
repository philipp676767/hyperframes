// Set of #54 "Parfum": inside a commuter train (S-Bahn wagon) early in the
// morning. Low golden sun through the window band on the -z side, the
// landscape outside streams past (catenary masts, poplars, fields, a
// village, hills, the Alps far away). Inside: vis-à-vis seat bays in teal
// fabric, yellow grab poles, swaying hand straps, luggage racks, ad frames,
// an end wall with the line display and a door. Life: the landscape and
// masts rushing past (their shadows sweep through the wagon), swaying
// straps, dust in the sunlight, a tiny wagon rock.
// Two separate pockets far below for macros: SKIN (your wrist) and NOSE.
import { THREE, flat, ground, onFrame, rng, patches, facet, facetMat, V, noise2 } from "./world.js";
import { setSky, finishSet, F, fireflies, discGeo } from "./environments.js";
import { SKIN, NOSE } from "./beats.js";

const r = rng(54);
export const WALL_Z = 6; // side walls at ±6
export const CEIL = 9.4;
export const WIN_Y0 = 3.6;
export const WIN_Y1 = 7.6;
export const X0 = -30;
export const X1 = 30;

// ---------------------------------------------------------------- light
// early morning, sun low and warm on the window side
export const sky = setSky({
  top: [0.36, 0.55, 0.86],
  mid: [0.86, 0.72, 0.74],
  hor: [1.0, 0.8, 0.55],
  below: [0.9, 0.78, 0.7],
  sun: [1.0, 0.86, 0.55],
  sunDir: [0.42, 0.13, -1],
  cloud: [0xfff0e6, 0xffc9b0],
  clouds: 12,
  birds: false,
  hemi: [0xffefe0, 0x6a6470, 1.6],
  key: [0xffd9a6, 3.0],
  keyPos: [12.6, 7.5, -30],
  rim: [0xa9c0ff, 0.7],
  fog: [60, 230],
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
const glow = (color, i = 1.6) => flat(0xffffff, { emissive: color, emissiveIntensity: i });
// canvas texture with text (line display, ads)
function textTex(w, h, draw) {
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
const wallMat = flat(0xe2ddd3, { roughness: 0.7 });
const wallLow = flat(0xb9c3c9, { roughness: 0.7 });
const frameMat = flat(0x3b414b, { roughness: 0.45, metalness: 0.2 });
const ceilMat = flat(0xf2efe8, { roughness: 0.8 });
const fabric = flat(0x1f6170, { roughness: 1 });
const fabric2 = flat(0x174b58, { roughness: 1 });
const headMat = flat(0xaeb8be, { roughness: 0.9 });
const poleMat = flat(0xf2c230, { roughness: 0.35, metalness: 0.2 });
const steel = flat(0x9aa6b2, { roughness: 0.35, metalness: 0.6 });
const strapMat = flat(0x2c2f36, { roughness: 0.7 });

// ---------------------------------------------------------------- the wagon shell
const wagon = new THREE.Group();
ground.add(wagon);
export { wagon };
// floor: dark blue-grey speckled vinyl, a lighter aisle strip
{
  const g = patches(facet(new THREE.BoxGeometry(X1 - X0, 0.3, WALL_Z * 2, 60, 1, 24), 0.035, 3), {
    amt: 0.06,
    scale: 0.4,
    seed: 4,
  });
  const fl = new THREE.Mesh(g, facetMat(flat(0x44525f, { roughness: 0.75 })));
  fl.position.set(0, -0.15, 0);
  fl.receiveShadow = true;
  wagon.add(fl);
  box(X1 - X0, 0.02, 2.4, flat(0x56646f, { roughness: 0.6 }), 0, 0.01, 0, 0.03, 5, false, wagon);
  // speckles
  const n = 900;
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(0.07, 0.02, 0.07), flat(0xffffff), n);
  const m4 = new THREE.Matrix4();
  const c = new THREE.Color();
  const sp = [0x8a97a2, 0x2c3640, 0xc9d1d6, 0x6d7b88];
  for (let i = 0; i < n; i++) {
    m4.makeTranslation(X0 + r() * (X1 - X0), 0.025, -WALL_Z + 0.3 + r() * (WALL_Z * 2 - 0.6));
    im.setMatrixAt(i, m4);
    im.setColorAt(i, c.setHex(sp[i % 4]));
  }
  im.receiveShadow = true;
  wagon.add(im);
}
// ceiling with two light strips + the luggage racks
box(X1 - X0, 0.3, WALL_Z * 2, ceilMat, 0, CEIL + 0.15, 0, 0.02, 6, false, wagon);
for (const z of [-2.2, 2.2]) {
  box(X1 - X0, 0.08, 0.7, glow(0xfff4e0, 1.1), 0, CEIL - 0.04, z, 0, 7, false, wagon);
}
// side walls: low wall, window band (pillars between windows), upper wall
const PITCH = 8.4;
export const WINDOWS = [];
for (const side of [-1, 1]) {
  const z = side * WALL_Z;
  box(X1 - X0, WIN_Y0, 0.5, wallLow, 0, WIN_Y0 / 2, z + side * 0.25, 0.02, 10 + side, true, wagon);
  box(
    X1 - X0,
    CEIL - WIN_Y1,
    0.5,
    wallMat,
    0,
    (CEIL + WIN_Y1) / 2,
    z + side * 0.25,
    0.02,
    12,
    true,
    wagon,
  );
  // window sill
  box(X1 - X0, 0.18, 0.7, frameMat, 0, WIN_Y0 + 0.05, z - side * 0.05, 0.02, 13, true, wagon);
  for (let x = 4.2 - PITCH * 4; x <= X1; x += PITCH) {
    // pillar between windows (at bay boundaries x = ±3.6 + k·7.2)
    box(
      1.1,
      WIN_Y1 - WIN_Y0,
      0.6,
      wallMat,
      x,
      (WIN_Y0 + WIN_Y1) / 2,
      z + side * 0.2,
      0.02,
      14,
      true,
      wagon,
    );
    // dark rubber frame around the opening
    box(
      1.3,
      WIN_Y1 - WIN_Y0,
      0.12,
      frameMat,
      x,
      (WIN_Y0 + WIN_Y1) / 2,
      z - side * 0.06,
      0.02,
      15,
      false,
      wagon,
    );
    if (side < 0) WINDOWS.push(x);
  }
  box(X1 - X0, 0.22, 0.14, frameMat, 0, WIN_Y1 + 0.02, z - side * 0.06, 0.02, 16, false, wagon);
  // a thin horizontal transom bar in each window (top vent)
  box(X1 - X0, 0.1, 0.1, frameMat, 0, WIN_Y1 - 0.9, z - side * 0.02, 0.02, 17, true, wagon);
  // luggage rack over the window band
  box(X1 - X0, 0.08, 1.4, steel, 0, WIN_Y1 + 0.55, z - side * 0.9, 0.02, 18, true, wagon);
  for (let x = X0 + 1; x < X1; x += 2.4)
    box(0.06, 0.06, 1.4, steel, x, WIN_Y1 + 0.62, z - side * 0.9, 0, 19, false, wagon);
}
// a very faint glass in the windows (catches the sky light, keeps the view)
{
  const gm = new THREE.MeshStandardMaterial({
    color: 0xcfe6ff,
    roughness: 0.05,
    metalness: 0.1,
    transparent: true,
    opacity: 0.08,
    depthWrite: false,
  });
  for (const side of [-1, 1]) {
    const g = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, WIN_Y1 - WIN_Y0), gm);
    g.position.set(0, (WIN_Y0 + WIN_Y1) / 2, side * (WALL_Z + 0.05));
    if (side > 0) g.rotation.y = Math.PI;
    g.userData.noAO = true;
    wagon.add(g);
  }
}
// ad frames above the window band (between the racks)
{
  const ads = [
    ["#ff6f61", "#ffd23f", "Sommer"],
    ["#4f7cff", "#ffffff", "Konzert"],
    ["#2fbf8f", "#103a33", "Kaffee"],
    ["#c06cff", "#fff0ff", "Kino"],
  ];
  ads.forEach(([bg, fg, word], i) => {
    const tx = textTex(512, 160, (g, w, h) => {
      g.fillStyle = bg;
      g.fillRect(0, 0, w, h);
      g.fillStyle = fg;
      g.font = "800 84px Montserrat, sans-serif";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(word, w / 2, h / 2 + 4);
    });
    const ad = new THREE.Mesh(
      new THREE.PlaneGeometry(4.2, 1.3),
      new THREE.MeshStandardMaterial({ map: tx, roughness: 0.6 }),
    );
    const x = -12.6 + i * 8.4;
    ad.position.set(x, WIN_Y1 + 1.15, -WALL_Z + 0.02);
    wagon.add(ad);
  });
}
// end wall (+x) with a door and the line display; back end (-x) a plain wall
{
  const ex = X1;
  box(0.4, CEIL, WALL_Z * 2, wallMat, ex, CEIL / 2, 0, 0.02, 30, true, wagon);
  box(0.2, 7.4, 3.6, flat(0xd8452e, { roughness: 0.5 }), ex - 0.25, 3.7, 0, 0.03, 31, true, wagon);
  box(
    0.12,
    3.0,
    2.2,
    new THREE.MeshStandardMaterial({ color: 0x23303c, roughness: 0.1 }),
    ex - 0.37,
    5.2,
    0,
    0,
    32,
    false,
    wagon,
  );
  const tx = textTex(1024, 160, (g, w, h) => {
    g.fillStyle = "#14161b";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#ffa62b";
    g.font = "700 72px Montserrat, sans-serif";
    g.textBaseline = "middle";
    g.fillText("S 3  ›  Nächster Halt: Rosenhügel", 30, h / 2 + 4);
  });
  const disp = new THREE.Mesh(
    new THREE.PlaneGeometry(6.4, 1.0),
    new THREE.MeshStandardMaterial({
      map: tx,
      emissive: 0xffffff,
      emissiveMap: tx,
      emissiveIntensity: 0.9,
    }),
  );
  disp.rotation.y = -Math.PI / 2;
  disp.position.set(ex - 0.22, 8.2, 0);
  wagon.add(disp);
  box(0.4, CEIL, WALL_Z * 2, wallMat, X0, CEIL / 2, 0, 0.02, 33, true, wagon);
}

// ---------------------------------------------------------------- seat bays
// bay centres c: bench A at c-2.9 facing +x, bench B at c+2.9 facing -x,
// a small table under the window between them
export const BAYS = [-16.8, -8.4, 0, 8.4, 16.8, 25.2];
function bench(x, side, face, seed) {
  // side: -1 = window side -z, +1 = +z; face: +1 faces +x, -1 faces -x
  const g = new THREE.Group();
  g.position.set(x, 0, side * 3.65);
  wagon.add(g);
  const w = 4.4; // two seats along z
  // cushion
  const cg = patches(facet(new THREE.BoxGeometry(1.9, 0.55, w, 4, 1, 8), 0.06, seed), {
    amt: 0.06,
    scale: 0.8,
    seed,
  });
  const cush = new THREE.Mesh(cg, facetMat(fabric));
  cush.position.set(face * 0.15, 1.55, 0);
  cush.castShadow = cush.receiveShadow = true;
  g.add(cush);
  // base
  box(1.6, 1.3, w - 0.3, frameMat, face * 0.1, 0.65, 0, 0.02, seed + 1, true, g);
  // backrest (tall, slightly reclined)
  const bg = patches(facet(new THREE.BoxGeometry(0.45, 4.2, w, 1, 8, 8), 0.06, seed + 2), {
    amt: 0.06,
    scale: 0.8,
    seed: seed + 2,
  });
  const back = new THREE.Mesh(bg, facetMat(fabric2));
  back.position.set(-face * 0.95, 3.9, 0);
  back.rotation.z = face * 0.1;
  back.castShadow = back.receiveShadow = true;
  g.add(back);
  // headrest covers
  for (const zz of [-1.1, 1.1]) {
    const hc = box(
      0.1,
      0.55,
      1.3,
      headMat,
      -face * 0.7 - face * 0.0,
      5.45,
      zz,
      0.03,
      seed + 3,
      false,
      g,
    );
    hc.position.x = -face * 0.72 + face * 0.0;
    hc.rotation.z = face * 0.1;
  }
  // grab handle on the aisle corner of the backrest
  const hx = -face * 1.05;
  const hz = -side * (w / 2 - 0.1);
  box(0.16, 0.16, 0.16, poleMat, hx, 6.0, hz, 0, seed + 4, false, g);
  return g;
}
for (const c of BAYS) {
  for (const side of [-1, 1]) {
    if (c - 2.9 > X0 + 1) bench(c - 2.9, side, 1, 100 + c * 3 + side);
    if (c + 2.9 < X1 - 1) bench(c + 2.9, side, -1, 200 + c * 3 + side);
    // window table
    if (c > X0 + 2 && c < X1 - 2) {
      box(
        1.9,
        0.12,
        1.3,
        flat(0x8e9aa4, { roughness: 0.4 }),
        c,
        2.94,
        side * 5.1,
        0.02,
        300 + c,
        true,
        wagon,
      );
      box(0.25, 1.6, 0.25, steel, c, 2.1, side * 5.6, 0, 301, true, wagon);
      // rubbish flap under the table
      box(0.9, 0.7, 0.12, frameMat, c, 2.3, side * 5.62, 0.02, 302, false, wagon);
    }
  }
}
// yellow grab poles on the aisle, between the bays, + a ceiling rail with straps
export const STRAPS = [];
for (const side of [-1, 1]) {
  const z = side * 1.35;
  cyl(0.1, 0.1, CEIL, 10, poleMat, 4.2, CEIL / 2, z, 0.02, 400);
  cyl(0.1, 0.1, CEIL, 10, poleMat, -12.6, CEIL / 2, z, 0.02, 401);
  cyl(0.1, 0.1, CEIL, 10, poleMat, 21.0, CEIL / 2, z, 0.02, 402);
  // ceiling rail
  const rail = cyl(0.08, 0.08, X1 - X0, 8, steel, 0, CEIL - 0.6, z, 0, 403);
  rail.rotation.z = Math.PI / 2;
  for (let x = X0 + 2; x < X1 - 1; x += 1.8) {
    const s = new THREE.Group();
    s.position.set(x, CEIL - 0.6, z);
    wagon.add(s);
    const band = F(new THREE.BoxGeometry(0.12, 1.1, 0.05), strapMat, 0.03, 410);
    band.position.y = -0.55;
    band.castShadow = true;
    s.add(band);
    const loop = F(
      new THREE.TorusGeometry(0.28, 0.06, 6, 12),
      flat(0xe9ecef, { roughness: 0.5 }),
      0.03,
      411,
    );
    loop.position.y = -1.35;
    loop.castShadow = true;
    s.add(loop);
    STRAPS.push({ s, ph: r() * 6 });
  }
}

// ---------------------------------------------------------------- outside: the landscape
// Everything outside moves along -x (the train runs towards +x); near
// things fast, far things slow (parallax). Pure functions of t.
const outside = new THREE.Group();
ground.add(outside);
// the ground below the windows: fields + meadows (static, the movers sell the speed)
{
  const g = patches(
    facet(new THREE.PlaneGeometry(700, 360, 70, 36).rotateX(-Math.PI / 2), 0.08, 21),
    {
      amt: 0.14,
      scale: 0.03,
      seed: 22,
      fn: (x, z) => 0.1 * Math.sin(x * 0.05) * Math.sin(z * 0.04),
    },
  );
  const m = new THREE.Mesh(g, facetMat(flat(0x8fbf58, { roughness: 1 })));
  m.position.y = -4.2;
  m.receiveShadow = true;
  outside.add(m);
  // the track bed right under the train (gravel) — seen in low shots
  box(700, 0.4, 9, flat(0x8c8478), 0, -4.0, -9.5, 0.06, 23, false, outside);
  box(700, 0.4, 9, flat(0x8c8478), 0, -4.0, 9.5, 0.06, 23, false, outside);
}
// movers: { mesh, x0, v, L } → x = wrap(x0 - v t)
const movers = [];
const mover = (obj, x0, v, L = 240) => {
  outside.add(obj);
  movers.push({ obj, x0, v, L });
  return obj;
};
const wrap = (x, L) => ((((x + L / 2) % L) + L) % L) - L / 2;
onFrame((t) => {
  for (const m of movers) m.obj.position.x = wrap(m.x0 - m.v * t, m.L);
});
// catenary masts close to the train (their shadows sweep through the wagon)
for (const side of [-1, 1]) {
  for (let i = 0; i < 8; i++) {
    const g = new THREE.Group();
    const mz = side * 10.5;
    const mast = F(new THREE.BoxGeometry(0.45, 17, 0.45), steel, 0.03, 30 + i);
    mast.position.set(0, 4.3, mz);
    mast.castShadow = true;
    g.add(mast);
    const arm = F(new THREE.BoxGeometry(0.2, 0.2, 5.4), steel, 0.02, 40 + i);
    arm.position.set(0, 12.2, mz - side * 2.7);
    arm.castShadow = true;
    g.add(arm);
    mover(g, -120 + i * 30 + (side > 0 ? 15 : 0), 46, 240);
  }
  // the overhead wire (static: it doesn't show motion)
  const wire = cyl(0.04, 0.04, 700, 4, frameMat, 0, 11.2, side * 8.2, 0, 50, outside);
  wire.rotation.z = Math.PI / 2;
}
// poplars, bushes, a fence: the near belt
function poplar(seed, s = 1) {
  const rr = rng(seed);
  const g = new THREE.Group();
  const trunk = F(
    new THREE.CylinderGeometry(0.22 * s, 0.3 * s, 3 * s, 6),
    flat(0x7a5236),
    0.05,
    seed,
  );
  trunk.position.y = 1.5 * s;
  g.add(trunk);
  const col = [0x5f9f37, 0x6fae3e, 0x82b84a, 0xc9b04a][Math.floor(rr() * 4)];
  const crown = F(
    new THREE.IcosahedronGeometry(1, 1).scale(1.3 * s, 4.2 * s, 1.3 * s),
    flat(col),
    0.1,
    seed + 1,
  );
  crown.position.y = 6 * s;
  crown.castShadow = true;
  g.add(crown);
  return g;
}
function roundTree(seed, s = 1) {
  const rr = rng(seed);
  const g = new THREE.Group();
  const trunk = F(
    new THREE.CylinderGeometry(0.25 * s, 0.35 * s, 2.6 * s, 6),
    flat(0x6d4a30),
    0.05,
    seed,
  );
  trunk.position.y = 1.3 * s;
  g.add(trunk);
  const col = [0x6aa83a, 0x4f8f34, 0xd59a3a, 0xc8733a][Math.floor(rr() * 4)];
  for (let k = 0; k < 3; k++) {
    const c = F(
      new THREE.IcosahedronGeometry(1.5 * s * (0.8 + rr() * 0.4), 1),
      flat(col),
      0.1,
      seed + k,
    );
    c.position.set((rr() - 0.5) * 1.6 * s, 3.4 * s + rr() * 1.2 * s, (rr() - 0.5) * 1.2 * s);
    c.castShadow = true;
    g.add(c);
  }
  return g;
}
function house(seed, s = 1) {
  const rr = rng(seed);
  const g = new THREE.Group();
  const walls = [0xf4e6cf, 0xf1c9a5, 0xe7eef2, 0xf6d98b, 0xd9e6c9][Math.floor(rr() * 5)];
  const w = (3.5 + rr() * 2) * s;
  const d = (3 + rr() * 1.5) * s;
  const h = (2.6 + rr() * 1.6) * s;
  const body = F(new THREE.BoxGeometry(w, h, d), flat(walls), 0.04, seed);
  body.position.y = h / 2;
  g.add(body);
  const roof = F(
    new THREE.CylinderGeometry(0.01, d * 0.78, w * 1.08, 4, 1)
      .rotateZ(Math.PI / 2)
      .rotateX(Math.PI / 4),
    flat([0xc4573a, 0x8f3b2c, 0x5a5f6a][Math.floor(rr() * 3)]),
    0.05,
    seed + 1,
  );
  roof.scale.set(1, 0.7, 1);
  roof.position.y = h + d * 0.22;
  g.add(roof);
  // windows catching the low sun
  for (let k = -1; k <= 1; k += 2) {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.7 * s, 0.8 * s), glow(0xffc66b, 0.8));
    win.position.set(k * w * 0.25, h * 0.55, d / 2 + 0.02);
    g.add(win);
  }
  return g;
}
for (const side of [-1, 1]) {
  const rr = rng(60 + side);
  // near belt: poplars + bushes, fast
  for (let i = 0; i < 14; i++) {
    const g =
      rr() < 0.6
        ? poplar(70 + i * 3 + side, 0.9 + rr() * 0.4)
        : roundTree(90 + i * 3 + side, 0.8 + rr() * 0.4);
    g.position.set(0, -4.2, side * (17 + rr() * 6));
    mover(g, -120 + i * 17 + rr() * 6, 26, 240);
  }
  // mid belt: a village, trees, a church, slower
  for (let i = 0; i < 16; i++) {
    const g =
      rr() < 0.55
        ? house(120 + i * 5 + side, 1 + rr() * 0.4)
        : roundTree(150 + i * 3 + side, 1.2 + rr() * 0.5);
    g.position.set(0, -4.2, side * (38 + rr() * 22));
    g.rotation.y = side < 0 ? 0 : Math.PI;
    mover(g, -150 + i * 19 + rr() * 8, 11, 300);
  }
  // a church with an onion dome (once per side)
  {
    const g = new THREE.Group();
    const tower = F(new THREE.BoxGeometry(2.4, 11, 2.4), flat(0xf3ead8), 0.03, 170);
    tower.position.y = 5.5;
    g.add(tower);
    const dome = F(
      new THREE.SphereGeometry(1.6, 8, 6),
      flat(0x4f8a6a, { roughness: 0.5 }),
      0.05,
      171,
    );
    dome.scale.set(1, 1.3, 1);
    dome.position.y = 12.2;
    g.add(dome);
    const spire = F(new THREE.ConeGeometry(0.4, 2.4, 6), flat(0x4f8a6a), 0.03, 172);
    spire.position.y = 14.6;
    g.add(spire);
    const nave = F(new THREE.BoxGeometry(7, 5, 4), flat(0xf3ead8), 0.03, 173);
    nave.position.set(-4.5, 2.5, 0);
    g.add(nave);
    g.position.set(0, -4.2, side * 52);
    mover(g, side < 0 ? 40 : -60, 11, 300);
  }
  // far hills, slow
  for (let i = 0; i < 9; i++) {
    const s = 18 + rr() * 16;
    const hgeo = new THREE.IcosahedronGeometry(1, 2).scale(s * 1.8, s * 0.55, s);
    const hm = patches(facet(hgeo, 0.08, 180 + i), { amt: 0.1, scale: 0.05, seed: 181 + i });
    const hill = new THREE.Mesh(
      hm,
      facetMat(flat([0x7aa84d, 0x6a9a48, 0x93b35a][i % 3], { roughness: 1 })),
    );
    hill.position.set(0, -6, side * (110 + rr() * 30));
    mover(hill, -200 + i * 48 + rr() * 10, 2.2, 440);
  }
}
// the Alps on the window side, static, snow caps catching the sun
{
  const rr = rng(77);
  for (let i = 0; i < 12; i++) {
    const h = 30 + rr() * 34;
    const x = -220 + i * 40 + rr() * 14;
    const m = F(
      new THREE.ConeGeometry(h * 0.9, h, 6 + Math.floor(rr() * 3)),
      flat(0x8f97b4, { roughness: 1 }),
      0.08,
      190 + i,
    );
    m.position.set(x, -4 + h / 2, -220 - rr() * 30);
    outside.add(m);
    const cap = F(
      new THREE.ConeGeometry(h * 0.9 * 0.32, h * 0.32, 6),
      flat(0xfff4ea, { roughness: 0.8 }),
      0.05,
      200 + i,
    );
    cap.position.set(x, -4 + h - h * 0.16 + 0.1, m.position.z);
    outside.add(cap);
  }
}
// birds over the fields
{
  const n = 7;
  const birdMat = flat(0x3a3540);
  const birds = [];
  for (let i = 0; i < n; i++) {
    const b = F(new THREE.ConeGeometry(0.25, 1.6, 3).rotateZ(Math.PI / 2), birdMat, 0.02, 210 + i);
    b.scale.set(1, 0.3, 2.2);
    outside.add(b);
    birds.push({ b, ph: r() * 6, y: 14 + r() * 6, z: -50 - r() * 20 });
  }
  onFrame((t) => {
    birds.forEach(({ b, ph, y, z }, i) => {
      b.position.set(wrap(-40 + i * 9 - 4 * t, 160), y + Math.sin(t * 2 + ph) * 0.8, z);
      b.scale.y = 0.3 + 0.25 * Math.sin(t * 9 + ph);
    });
  });
}

// ---------------------------------------------------------------- life inside
// straps swing with the wagon's rocking; dust in the sun
onFrame((t) => {
  for (const { s, ph } of STRAPS) {
    s.rotation.x = Math.sin(t * 1.7 + ph) * 0.08 + Math.sin(t * 4.3 + ph * 2) * 0.02;
    s.rotation.z = Math.sin(t * 1.1 + ph) * 0.05;
  }
  // the whole wagon rocks a hair (tracks)
  wagon.position.y = Math.sin(t * 7.3) * 0.006 + Math.sin(t * 2.1) * 0.01;
});
fireflies(70, { area: [-14, 14, 2.5, 8.5, -5.5, 3], color: 0xfff1c8, seed: 54, size: 0.03 });

// ---------------------------------------------------------------- pocket: SKIN (your wrist, macro)
export const skinMat = flat(0xf0b08c, { roughness: 0.62 });
{
  const g = new THREE.Group();
  g.position.set(...SKIN);
  ground.add(g);
  // warm dark backdrop dome so the macro never shows the sky
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(60, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0x3b2026, side: THREE.BackSide, fog: false }),
  );
  dome.userData.noAO = true;
  g.add(dome);
  // the skin: soft rolling relief + fine wrinkle lines
  const geo = discGeo(46, 0.9, 5, (x, z) => {
    const w = Math.sin(x * 0.9 + Math.sin(z * 0.35) * 1.5) * 0.08;
    return (
      w + (noise2(x * 0.12, z * 0.12, 3) - 0.5) * 0.9 - Math.max(0, Math.hypot(x, z) - 26) * 0.25
    );
  });
  const sk = new THREE.Mesh(
    patches(facet(geo, 0.05, 6), { amt: 0.07, scale: 0.12, seed: 7, warm: 0.6 }),
    facetMat(skinMat),
  );
  sk.receiveShadow = true;
  g.add(sk);
  // pores
  const n = 260;
  const pores = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.16, 0.12, 0.06, 7),
    flat(0xb86f5a, { roughness: 0.9 }),
    n,
  );
  const hairs = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.015, 0.045, 3.2, 4).translate(0, 1.6, 0),
    flat(0x6b4a3a),
    60,
  );
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const rr = rng(8);
  let h = 0;
  for (let i = 0; i < n; i++) {
    const a = rr() * Math.PI * 2;
    const d = 1.5 + Math.sqrt(rr()) * 24;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    const y =
      (noise2(x * 0.12, z * 0.12, 3) - 0.5) * 0.9 +
      Math.sin(x * 0.9 + Math.sin(z * 0.35) * 1.5) * 0.08;
    m4.compose(V(x, y + 0.01, z), q.identity(), V(1, 1, 1));
    pores.setMatrixAt(i, m4);
    if (h < 60 && i % 4 === 0 && d > 4) {
      q.setFromEuler(new THREE.Euler(0.9 + rr() * 0.3, rr() * 6, 0.2));
      m4.compose(V(x, y, z), q, V(1, 0.7 + rr() * 0.6, 1));
      hairs.setMatrixAt(h++, m4);
    }
  }
  hairs.count = h;
  hairs.castShadow = true;
  g.add(pores, hairs);
  // a warm light of its own
  const pl = new THREE.PointLight(0xffd2b0, 120, 60, 1.6);
  pl.position.set(8, 16, 10);
  g.add(pl);
}

// ---------------------------------------------------------------- pocket: NOSE (cut-away)
{
  const g = new THREE.Group();
  g.position.set(...NOSE);
  ground.add(g);
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(60, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0x1c1838, side: THREE.BackSide, fog: false }),
  );
  dome.userData.noAO = true;
  g.add(dome);
  // a soft floor glow disc under the nose
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(10, 40).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x3a2f6a, transparent: true, opacity: 0.6, fog: false }),
  );
  disc.position.y = -4.6;
  disc.userData.noAO = true;
  g.add(disc);
  const pl = new THREE.PointLight(0xbfc8ff, 140, 60, 1.6);
  pl.position.set(6, 10, 14);
  g.add(pl);
  const pl2 = new THREE.PointLight(0xff8fc8, 60, 40, 1.8);
  pl2.position.set(-8, 2, 6);
  g.add(pl2);
}

finishSet({ ground: 0x6b7480 });
