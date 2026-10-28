// Set of #40 "Pfandautomat": the empties corner of a big German supermarket
// on a Saturday morning. The reverse vending machine (scene.js) stands at
// the origin, built into a tiled wall with two neighbour machines and a big
// green "LEERGUT" neon above. Left of the wall the store opens into long
// aisles full of coloured goods under rows of ceiling lights (far layer);
// right of it the back-room hatch where a roller conveyor carries crates
// away, stacks of drink crates and a roll cage (hero piece + near ring).
// Life: the neon flickers, crates roll, a shopping cart crosses the aisle,
// the queue of shoppers waits (one taps a foot, a new one joins on
// "Schlange"). Light: cool white shop light from the ceiling, Pfand green
// as accent.
import { THREE, flat, ground, onFrame, rng, M } from "./world.js";
import { SKIES, setSky, finishSet, F } from "./environments.js";
import { T } from "./beats.js";

const SEED = 40;
const r = rng(SEED);
export const WALL_Z = -1.8; // front face of the machine wall
export const CEIL = 7.6;
const GREEN = 0x1fb36b;

// ---------------------------------------------------------------- light
// indoors: a neutral, bright "sky" so the image-based light reads as shop
// light; the key comes steeply from the ceiling in front
setSky({
  ...SKIES.mittag,
  top: [0.92, 0.94, 0.98],
  mid: [0.95, 0.95, 0.96],
  hor: [0.98, 0.96, 0.92],
  below: [0.8, 0.8, 0.82],
  sun: [0, 0, 0],
  noClouds: true,
  birds: false,
  hemi: [0xf4f7ff, 0x8a8a90, 1.5],
  key: [0xfff6ea, 2.3],
  keyPos: [3.5, 14, 9],
  rim: [0xc6ffe0, 0.7],
  fog: [26, 80],
});

// ---------------------------------------------------------------- helpers
const box = (w, h, d, mat, x, y, z, amt = 0.04, seed = 1, shadow = true) => {
  const m = F(new THREE.BoxGeometry(w, h, d), mat, amt, seed);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  ground.add(m);
  return m;
};
const glowMat = (color, intensity) =>
  flat(0xffffff, { emissive: color, emissiveIntensity: intensity });
function textTexture(text, { w = 1024, h = 256, color = "#ffffff", bg = null, font = 150 } = {}) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const g = cv.getContext("2d");
  if (bg) {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
  }
  g.fillStyle = color;
  g.font = `900 ${font}px Montserrat, sans-serif`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, w / 2, h / 2 + 6);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

// ---------------------------------------------------------------- floor
// big light-grey tiles, each a few percent different, with dark grout
{
  const S = 1.2;
  const tiles = [];
  for (let x = -30; x < 20; x += S) for (let z = -30; z < 22; z += S) tiles.push([x, z]);
  const inst = new THREE.InstancedMesh(
    new THREE.BoxGeometry(S - 0.04, 0.1, S - 0.04),
    flat(0xffffff, { roughness: 0.32 }),
    tiles.length,
  );
  const m = new THREE.Matrix4();
  const c = new THREE.Color();
  tiles.forEach(([x, z], i) => {
    m.makeTranslation(x + S / 2, -0.05, z + S / 2);
    inst.setMatrixAt(i, m);
    const v = 0.8 + r() * 0.06;
    c.setRGB(v, v * 0.995, v * 0.98);
    // a worn green guide path from the aisle to the machines
    if (z > -2 && z < 6 && x > -9 && x < -1.2 && Math.abs(z - 2.4) < 0.7) c.setRGB(0.55, 0.8, 0.64);
    inst.setColorAt(i, c);
  });
  inst.receiveShadow = true;
  ground.add(inst);
  box(52, 0.1, 54, flat(0x55585e), -5, -0.12, -4, 0, 1, false); // grout
}

// ---------------------------------------------------------------- machine wall
// white tiles with a green band, built-in neighbour machines left + right
export const neighbours = [];
{
  const H = 4.6;
  const tileMat = flat(0xf4f6f4, { roughness: 0.4 });
  // wall slab with the openings for the three machines (x -3.3..3.3, y 0..3.3)
  const wz = WALL_Z - 0.2;
  box(8.6, H - 3.4, 0.4, tileMat, 0, 3.4 + (H - 3.4) / 2, wz, 0.02, 2, false);
  box(1.0, 3.4, 0.4, tileMat, -3.8, 1.7, wz, 0.02, 3, false);
  box(1.0, 3.4, 0.4, tileMat, 3.8, 1.7, wz, 0.02, 4, false);
  // tile grid (thin grout lines) on the wall face
  const grout = flat(0xc9d0cc);
  for (let y = 3.4; y < H; y += 0.4) box(8.6, 0.02, 0.02, grout, 0, y, wz + 0.21, 0, 1, false);
  for (let x = -4.3; x <= 4.3; x += 0.4)
    box(0.02, H - 3.4, 0.02, grout, x, 3.4 + (H - 3.4) / 2, wz + 0.21, 0, 1, false);
  // green band + steel frames around the openings
  box(8.6, 0.22, 0.06, flat(GREEN, { roughness: 0.35 }), 0, 3.52, wz + 0.23, 0, 1, false);
  const steel = flat(0xb9c0c6, { metalness: 0.6, roughness: 0.32 });
  for (const x of [-3.3, -1.1, 1.1, 3.3])
    box(0.12, 3.4, 0.5, steel, x, 1.7, wz + 0.05, 0, 1, false);
  box(6.7, 0.12, 0.5, steel, 0, 3.36, wz + 0.05, 0, 1, false);
  // dark recess behind the machines (the back room you never see)
  box(6.6, 3.3, 0.1, flat(0x202429), 0, 1.65, wz - 0.25, 0, 1, false);

  // neighbour machines (simplified twins of the hero, lit green)
  for (const x of [-2.2, 2.2]) {
    const g = new THREE.Group();
    g.position.set(x, 0, WALL_Z);
    const body = F(
      new THREE.BoxGeometry(1.96, 3.2, 2.0),
      flat(0x2d3238, { roughness: 0.4 }),
      0.03,
      5,
    );
    body.position.set(0, 1.6, 1.0);
    body.castShadow = body.receiveShadow = true;
    g.add(body);
    const front = F(
      new THREE.BoxGeometry(1.7, 1.4, 0.06),
      flat(0x3a4048, { roughness: 0.35 }),
      0.02,
      6,
    );
    front.position.set(0, 1.55, 2.02);
    g.add(front);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.05, 8, 24), glowMat(GREEN, 1.6));
    ring.position.set(0, 1.5, 2.06);
    g.add(ring);
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.24, 20), flat(0x0b0d10));
    hole.position.set(0, 1.5, 2.055);
    g.add(hole);
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.9, 0.5),
      new THREE.MeshBasicMaterial({
        map: textTexture("0,25 €", { color: "#3dff7a", bg: "#0c1a14", font: 120 }),
      }),
    );
    screen.position.set(0, 2.55, 2.01);
    g.add(screen);
    const btn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.06, 14),
      glowMat(0x3dff7a, 0.8),
    );
    btn.rotation.x = Math.PI / 2;
    btn.position.set(0.45, 0.95, 2.02);
    g.add(btn);
    ground.add(g);
    neighbours.push(g);
  }

  // "LEERGUT" neon sign above (flickers now and then)
  const sign = new THREE.Group();
  sign.position.set(0, 4.15, wz + 0.35);
  const plate = F(
    new THREE.BoxGeometry(4.4, 0.9, 0.12),
    flat(0x173d2a, { roughness: 0.5 }),
    0.02,
    7,
  );
  sign.add(plate);
  const neonMat = new THREE.MeshBasicMaterial({
    map: textTexture("LEERGUT", { color: "#9dffc6", font: 170 }),
    transparent: true,
    toneMapped: false,
  });
  const neon = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.05), neonMat);
  neon.position.z = 0.07;
  sign.add(neon);
  // a little bottle-with-arrow pictogram right of the word
  const neonLight = new THREE.PointLight(0x5dffa0, 2.2, 6, 1.6);
  neonLight.position.set(0, 0, 0.8);
  sign.add(neonLight);
  ground.add(sign);
  onFrame((t) => {
    // mostly steady, two short flicker bursts per ~11 s
    const p = t % 11.3;
    const off = (p > 6.2 && p < 6.32) || (p > 6.45 && p < 6.5) || (p > 9.9 && p < 9.96);
    neonMat.color.setScalar(off ? 0.35 : 1);
    neonLight.intensity = off ? 0.4 : 2.2;
  });
}

// ---------------------------------------------------------------- right: back-room hatch + conveyor
{
  const wallMat = flat(0xe9ece6, { roughness: 0.7 });
  // side wall running back from the machine wall
  box(0.4, CEIL, 14, wallMat, 4.5, CEIL / 2, WALL_Z - 7.2, 0.02, 11, false);
  // back wall of the right bay with the hatch (opening x 7..10, y 0.6..2.4)
  const bz = -6.4;
  box(3, CEIL, 0.4, wallMat, 5.5 + 0.5, CEIL / 2, bz, 0.02, 12, false);
  box(10, CEIL, 0.4, wallMat, 15, CEIL / 2, bz, 0.02, 13, false);
  box(3, 0.6, 0.4, wallMat, 8.5, 0.3, bz, 0.02, 14, false);
  box(3, CEIL - 2.4, 0.4, wallMat, 8.5, 2.4 + (CEIL - 2.4) / 2, bz, 0.02, 15, false);
  box(3.2, 1.8, 0.1, flat(0x1c2024), 8.5, 1.5, bz - 0.6, 0, 1, false);
  // yellow-black hazard frame around the hatch
  const hz = flat(0xffc928, { roughness: 0.5 });
  box(3.3, 0.14, 0.45, hz, 8.5, 2.45, bz + 0.05, 0, 1, false);
  box(0.14, 1.9, 0.45, hz, 6.95, 1.5, bz + 0.05, 0, 1, false);
  box(0.14, 1.9, 0.45, hz, 10.05, 1.5, bz + 0.05, 0, 1, false);
  // "NUR PERSONAL" plate
  const plate = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 0.45),
    new THREE.MeshBasicMaterial({
      map: textTexture("NUR PERSONAL", { color: "#ffffff", bg: "#2a2f36", font: 110 }),
    }),
  );
  plate.position.set(8.5, 3.0, bz + 0.21);
  ground.add(plate);
  // roller conveyor from the front of the bay into the hatch
  const steel = flat(0xaab2b9, { metalness: 0.6, roughness: 0.3 });
  const cx = 8.5;
  box(1.6, 0.08, 7.2, steel, cx - 0.9, 0.9, -2.6, 0, 1);
  box(0.08, 0.08, 7.2, steel, cx + 0.8, 0.9, -2.6, 0, 1);
  box(0.08, 0.08, 7.2, steel, cx - 0.8, 0.9, -2.6, 0, 1);
  for (let z = -6; z < 0.9; z += 0.3) {
    const roll = F(new THREE.CylinderGeometry(0.05, 0.05, 1.56, 8), M.chrome, 0, 1);
    roll.rotation.z = Math.PI / 2;
    roll.position.set(cx, 0.93, z);
    ground.add(roll);
  }
  for (const z of [0.6, -2.6, -5.8])
    for (const x of [cx - 0.75, cx + 0.75]) box(0.08, 0.9, 0.08, steel, x, 0.45, z, 0, 1);
  // crates riding into the hatch, one after another
  const crateCols = [0x2d8f4e, 0xd8352a, 0x2a62c9, 0xf2b41a, 0x2d8f4e, 0x6b3fa0];
  const crates = crateCols.map((col, i) => {
    const g = drinkCrate(col, i % 2 === 0, i);
    g.position.set(cx, 0.98, 0);
    ground.add(g);
    return g;
  });
  onFrame((t) => {
    crates.forEach((g, i) => {
      const u = (t * 0.42 + i * 1.25) % 7.5; // 0..7.5 along the belt
      g.position.z = 0.7 - u;
      g.visible = u < 7.3;
    });
  });

  // stacks of drink crates + a roll cage in the bay (near ring, right)
  const stack = (x, z, n, seed, rot = 0) => {
    for (let k = 0; k < n; k++) {
      const g = drinkCrate(crateCols[(seed + k) % crateCols.length], true, seed + k);
      g.position.set(x + (r() - 0.5) * 0.06, k * 0.62, z + (r() - 0.5) * 0.06);
      g.rotation.y = rot + (r() - 0.5) * 0.08;
      ground.add(g);
    }
  };
  stack(5.6, -1.2, 5, 1, 0.1);
  stack(6.6, -1.4, 4, 3, -0.06);
  stack(5.8, -3.8, 6, 5, 0.2);
  stack(11.2, -4.6, 7, 2, 0);
  stack(12.1, -4.4, 5, 4, 0.1);
  rollCage(10.8, -1.6, 0.3);
}

// a drink crate: plastic box with handle cut-outs, optionally with bottles
function drinkCrate(color, bottles, seed) {
  const g = new THREE.Group();
  const mat = flat(color, { roughness: 0.45 });
  const add = (geo, x, y, z) => {
    const m = F(geo, mat, 0.04, seed);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    g.add(m);
  };
  add(new THREE.BoxGeometry(0.9, 0.08, 0.6), 0, 0.04, 0);
  add(new THREE.BoxGeometry(0.9, 0.5, 0.06), 0, 0.29, 0.27);
  add(new THREE.BoxGeometry(0.9, 0.5, 0.06), 0, 0.29, -0.27);
  add(new THREE.BoxGeometry(0.06, 0.5, 0.6), 0.42, 0.29, 0);
  add(new THREE.BoxGeometry(0.06, 0.5, 0.6), -0.42, 0.29, 0);
  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.09, 0.08), flat(0x111111));
  slot.position.set(0, 0.42, 0.28);
  g.add(slot);
  if (bottles) {
    const glass = flat(color === 0xd8352a ? 0x5a2a12 : 0x2b6b3a, {
      roughness: 0.15,
      metalness: 0.1,
    });
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 3; j++) {
        const b = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.07, 0.6, 7), glass);
        b.position.set(-0.32 + i * 0.21, 0.36, -0.18 + j * 0.18);
        g.add(b);
      }
  }
  return g;
}

function rollCage(x, z, rot) {
  const g = new THREE.Group();
  const steel = flat(0x9aa3ab, { metalness: 0.65, roughness: 0.35 });
  const bar = (w, h, d, px, py, pz) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), steel);
    m.position.set(px, py, pz);
    m.castShadow = true;
    g.add(m);
  };
  bar(1.3, 0.08, 1.0, 0, 0.25, 0);
  for (const sx of [-0.62, 0.62]) {
    for (let k = 0; k <= 6; k++) bar(0.03, 1.9, 0.03, sx, 1.2, -0.48 + k * 0.16);
    bar(0.03, 0.03, 1.0, sx, 2.15, 0);
    bar(0.03, 0.03, 1.0, sx, 1.2, 0);
  }
  for (let k = 0; k <= 7; k++) bar(0.03, 1.9, 0.03, -0.6 + k * 0.17, 1.2, -0.48);
  for (const [px, pz] of [
    [-0.55, -0.42],
    [0.55, -0.42],
    [-0.55, 0.42],
    [0.55, 0.42],
  ]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.07, 10), M.rubber);
    w.rotation.z = Math.PI / 2;
    w.position.set(px, 0.1, pz);
    g.add(w);
  }
  // squashed blue bags of empties inside
  for (let k = 0; k < 3; k++) {
    const b = F(
      new THREE.IcosahedronGeometry(0.42, 1),
      flat(0x2f6fd6, { roughness: 0.6 }),
      0.1,
      30 + k,
    );
    b.scale.set(1.2, 0.8, 0.9);
    b.position.set(-0.25 + k * 0.25, 0.65 + k * 0.4, (k % 2) * 0.15);
    g.add(b);
  }
  g.position.set(x, 0, z);
  g.rotation.y = rot;
  ground.add(g);
}

// ---------------------------------------------------------------- left: the store aisles (far layer)
{
  const shelfMat = flat(0xe2e5e8, { roughness: 0.5 });
  const goodsCols = [
    0xd8352a, 0xf2b41a, 0x2a62c9, 0x2d8f4e, 0xff7a3a, 0xffffff, 0x8a4fc9, 0x18a3a3,
  ];
  const goods = [];
  const rows = [-6.6, -10.4, -14.2, -18, -21.8];
  for (const x of rows) {
    // a double-sided gondola from z = -2.5 back to z = -28
    const z0 = -28;
    const z1 = -2.5;
    box(1.4, 2.7, z1 - z0, shelfMat, x, 1.35, (z0 + z1) / 2, 0.02, 40, false);
    box(1.5, 0.3, z1 - z0 + 0.1, flat(0x2a2f36), x, 0.15, (z0 + z1) / 2, 0, 1, false);
    // end cap with an offer sign
    box(1.5, 0.5, 0.1, flat(0xffd23f), x, 3.0, z1 + 0.05, 0, 1, false);
    for (const side of [-1, 1])
      for (let y = 0.45; y < 2.6; y += 0.55)
        for (let z = z0 + 0.3; z < z1 - 0.2; z += 0.3 + r() * 0.1) {
          if (r() < 0.06) continue; // a few gaps on the shelf
          goods.push([x + side * 0.78, y, z, goodsCols[Math.floor(r() * goodsCols.length)]]);
        }
  }
  const inst = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.16, 0.38, 0.24).translate(0, 0.19, 0),
    flat(0xffffff, { roughness: 0.45 }),
    goods.length,
  );
  const m = new THREE.Matrix4();
  const c = new THREE.Color();
  goods.forEach(([x, y, z, col], i) => {
    const s = 0.8 + r() * 0.45;
    m.makeScale(1, s, 1);
    m.setPosition(x, y, z);
    inst.setMatrixAt(i, m);
    inst.setColorAt(i, c.setHex(col).offsetHSL(0, 0, (r() - 0.5) * 0.12));
  });
  ground.add(inst);
  // far wall of the store with a fruit-and-veg banner
  box(40, CEIL, 0.4, flat(0xf0e6d4, { roughness: 0.8 }), -12, CEIL / 2, -30, 0.02, 41, false);
  const banner = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 2),
    new THREE.MeshBasicMaterial({
      map: textTexture("OBST & GEMÜSE", { color: "#ffffff", bg: "#2d8f4e", font: 120 }),
    }),
  );
  banner.position.set(-14, 5, -29.7);
  ground.add(banner);
  // left side wall
  box(0.4, CEIL, 50, flat(0xeee8dc), -25, CEIL / 2, -5, 0.02, 42, false);

  // a shopping cart crossing the far aisle now and then
  const cart = shoppingCart();
  ground.add(cart);
  onFrame((t) => {
    const u = ((t + 4) % 16) / 16;
    cart.position.set(-8.5, 0, -24 + u * 30);
    cart.rotation.y = 0;
    cart.visible = cart.position.z < -3;
  });
}

function shoppingCart() {
  const g = new THREE.Group();
  const wire = flat(0xc9d1d8, { metalness: 0.7, roughness: 0.3 });
  const red = flat(0xd8352a, { roughness: 0.4 });
  const bar = (w, h, d, x, y, z, mat = wire) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    g.add(m);
  };
  bar(0.7, 0.04, 1.1, 0, 0.75, 0);
  for (const x of [-0.35, 0.35]) bar(0.03, 0.5, 1.1, x, 1.0, 0);
  bar(0.7, 0.5, 0.03, 0, 1.0, -0.55);
  bar(0.7, 0.5, 0.03, 0, 1.0, 0.55);
  bar(0.8, 0.06, 0.06, 0, 1.35, 0.72, red); // handle
  for (const x of [-0.3, 0.3]) bar(0.04, 0.7, 0.04, x, 0.4, 0.4);
  for (const [x, z] of [
    [-0.3, -0.45],
    [0.3, -0.45],
    [-0.3, 0.45],
    [0.3, 0.45],
  ]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 10), M.rubber);
    w.rotation.z = Math.PI / 2;
    w.position.set(x, 0.07, z);
    g.add(w);
  }
  // a few groceries in the basket
  const cols = [0xf2b41a, 0x2d8f4e, 0xffffff];
  cols.forEach((col, i) => bar(0.22, 0.3, 0.2, -0.18 + i * 0.18, 0.93, -0.2 + i * 0.15, flat(col)));
  return g;
}

// ---------------------------------------------------------------- ceiling
{
  box(60, 0.3, 60, flat(0xf3f4f2, { roughness: 0.9 }), -5, CEIL + 0.15, -5, 0, 1, false);
  // rows of long light panels
  const lamp = glowMat(0xfffbf0, 1.4);
  for (let x = -22; x <= 14; x += 3.8)
    for (let z = -26; z <= 12; z += 4.5) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 2.6), lamp);
      p.position.set(x, CEIL - 0.03, z);
      ground.add(p);
    }
  // a few hanging aisle signs
  const words = ["GETRÄNKE", "SNACKS", "MILCH"];
  [-8.5, -12.3, -16.1].forEach((x, i) => {
    const s = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 0.6),
      new THREE.MeshBasicMaterial({
        map: textTexture(words[i], { color: "#ffffff", bg: "#1f7a4a", font: 140 }),
        side: THREE.DoubleSide,
      }),
    );
    s.position.set(x, 5.4, -3.4);
    ground.add(s);
    box(0.02, 2.0, 0.02, flat(0x777777), x, 6.6, -3.4, 0, 1, false);
  });
}

// ---------------------------------------------------------------- the queue (near ring, left)
// low-poly shoppers waiting with bags of empties; one taps a foot, one
// checks the phone, a new one joins on "Schlange"
export const queue = [];
{
  const people = [
    { x: -3.6, z: 2.6, shirt: 0xe86a8f, hair: 0x3a2618, rot: 0.9, bag: true },
    { x: -5.0, z: 3.4, shirt: 0x2fa36b, hair: 0xe2c06a, rot: 0.75, bag: false, phone: true },
    { x: -6.4, z: 4.0, shirt: 0xf2b41a, hair: 0x1c1410, rot: 0.6, bag: true },
    { x: -7.8, z: 4.5, shirt: 0x5a6cd6, hair: 0x8a4a22, rot: 0.55, bag: true, late: true },
  ];
  for (const [i, p] of people.entries()) {
    const g = person(p, 50 + i);
    g.position.set(p.x, 0, p.z);
    g.rotation.y = p.rot;
    ground.add(g);
    queue.push({ ...p, g });
  }
  onFrame((t) => {
    for (const [i, q] of queue.entries()) {
      // idle sway
      q.g.children[0].rotation.z = Math.sin(t * 1.3 + i) * 0.03;
      // foot tapping (the first one, impatient)
      if (i === 0 && q.g.userData.foot)
        q.g.userData.foot.rotation.x = -Math.max(0, Math.sin(t * 9)) * 0.35;
      if (q.late) {
        // walks in from the aisle on "Schlange"
        const k = Math.min(1, Math.max(0, (t - T.schlange + 0.3) / 1.2));
        const e = k * k * (3 - 2 * k);
        q.g.position.set(
          q.x - 4 * (1 - e),
          Math.abs(Math.sin(k * Math.PI * 4)) * 0.06 * (1 - e),
          q.z + 1.6 * (1 - e),
        );
        q.g.visible = t > T.schlange - 0.4;
      }
    }
  });
}

function person(p, seed) {
  const g = new THREE.Group();
  const body = new THREE.Group();
  g.add(body);
  const skin = flat([0xf1c09a, 0xc98d62, 0x8a5a3c][seed % 3], { roughness: 0.7 });
  const pants = flat([0x2a3550, 0x3a3a3a, 0x5a4a3a][seed % 3]);
  const add = (parent, geo, mat, x, y, z, amt = 0.06) => {
    const m = F(geo, mat, amt, seed);
    m.position.set(x, y, z);
    m.castShadow = true;
    parent.add(m);
    return m;
  };
  const legL = add(body, new THREE.BoxGeometry(0.22, 1.0, 0.24), pants, -0.15, 0.5, 0);
  add(body, new THREE.BoxGeometry(0.22, 1.0, 0.24), pants, 0.15, 0.5, 0);
  // the tapping foot hangs from the knee so it can rock
  const foot = new THREE.Group();
  foot.position.set(-0.15, 0.08, 0.05);
  add(foot, new THREE.BoxGeometry(0.24, 0.12, 0.38), flat(0xf4f4f4), 0, -0.02, 0.06);
  body.add(foot);
  add(body, new THREE.BoxGeometry(0.24, 0.12, 0.38), flat(0xf4f4f4), 0.15, 0.06, 0.11);
  legL.visible = true;
  g.userData.foot = foot;
  add(
    body,
    new THREE.CylinderGeometry(0.3, 0.34, 1.0, 8),
    flat(p.shirt, { roughness: 0.6 }),
    0,
    1.5,
    0,
  );
  add(body, new THREE.IcosahedronGeometry(0.27, 1), skin, 0, 2.28, 0.02);
  const hair = add(body, new THREE.IcosahedronGeometry(0.29, 1), flat(p.hair), 0, 2.38, -0.04);
  hair.scale.set(1, 0.7, 1);
  // arms
  const armR = add(
    body,
    new THREE.CylinderGeometry(0.08, 0.09, 0.85, 6),
    flat(p.shirt),
    0.4,
    1.45,
    0.05,
  );
  armR.rotation.z = 0.12;
  const armL = add(
    body,
    new THREE.CylinderGeometry(0.08, 0.09, 0.85, 6),
    flat(p.shirt),
    -0.4,
    1.45,
    0.05,
  );
  armL.rotation.z = -0.12;
  if (p.phone) {
    armR.rotation.set(-1.1, 0, 0.2);
    armR.position.set(0.32, 1.55, 0.3);
    add(
      body,
      new THREE.BoxGeometry(0.14, 0.24, 0.03),
      flat(0x15171c, { roughness: 0.2 }),
      0.25,
      1.75,
      0.6,
    );
  }
  if (p.bag) {
    // a big blue bag of empties at the hand
    const bag = add(
      body,
      new THREE.IcosahedronGeometry(0.36, 1),
      flat(0x2f6fd6, { roughness: 0.55 }),
      0.55,
      0.75,
      0.1,
      0.1,
    );
    bag.scale.set(0.9, 1.15, 0.8);
  }
  return g;
}

// ---------------------------------------------------------------- near props
// a bin next to the machines, a "Bon" box, a waste paper basket with receipts
{
  const binG = new THREE.Group();
  const bm = flat(0x6d747a, { metalness: 0.5, roughness: 0.4 });
  const b = F(new THREE.CylinderGeometry(0.42, 0.36, 1.1, 12), bm, 0.03, 60);
  b.position.y = 0.55;
  b.castShadow = true;
  binG.add(b);
  const lid = F(new THREE.CylinderGeometry(0.46, 0.46, 0.08, 12), flat(0x2d3238), 0.03, 61);
  lid.position.y = 1.12;
  binG.add(lid);
  binG.position.set(-4.4, 0, -1.1);
  ground.add(binG);
  // a sticker "Hier Pfand-Bon einlösen" at the wall
  const st = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 0.5),
    new THREE.MeshBasicMaterial({
      map: textTexture("PFAND-BON → KASSE", { color: "#ffffff", bg: "#d8352a", font: 86 }),
    }),
  );
  st.position.set(-3.8, 2.6, WALL_Z + 0.03);
  ground.add(st);
}

finishSet({ ground: 0xcfd1d0 });
