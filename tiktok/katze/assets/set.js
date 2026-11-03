// Set of #50 "Katze schnurrt": a cosy Altbau living room in Vienna on a
// rainy evening. The cat lies on a deep window seat (on a knitted blanket)
// at the origin — built in scene.js. Behind it the hero piece: a tall
// double Kastenfenster with white frames, rain running down the glass, the
// wet street outside with lit windows of the house across and a glowing
// street lamp. Room: herringbone parquet, a dusty-pink sofa on the right,
// a brass floor lamp with a warm shade, a monstera, a bookshelf, a guitar
// on its stand (the analogy in beat 3), a rug, a side table with a candle.
// Life: rain outside + drops on the glass, tea steam, candle flicker, dust
// in the lamp light, fairy lights in the window.
// A second, separate place: a small dark lab bench (the Vienna study),
// LAB, far off to the side with its own walls.
import { THREE, flat, ground, onFrame, rng, patches, facet, facetMat, V } from "./world.js";
import { setSky, finishSet, F, fireflies, lightString } from "./environments.js";
import { sway } from "./props.js";

const r = rng(50);
export const SEAT = 1.0; // top of the window seat
export const WZ = -3.0; // back wall (window)
export const LAB = [70, 0, 70]; // the lab pocket
export const GUITAR = [-5.4, 0, 1.6]; // the guitar on its stand

// ---------------------------------------------------------------- light
// rainy blue evening outside, warm lamp light inside
setSky({
  top: [0.05, 0.08, 0.2],
  mid: [0.11, 0.16, 0.32],
  hor: [0.3, 0.33, 0.48],
  below: [0.1, 0.12, 0.2],
  sun: [0.3, 0.35, 0.5],
  sunDir: [0.2, 0.2, -1],
  cloud: [0x4a5374, 0x262c48],
  clouds: 10,
  birds: false,
  hemi: [0xffe2c4, 0x4a3a40, 1.25],
  key: [0xffd6a8, 2.3],
  keyPos: [6, 11, 8],
  rim: [0x7f9dff, 1.3],
  fog: [30, 80],
});

// ---------------------------------------------------------------- helpers
const box = (w, h, d, mat, x, y, z, amt = 0.04, seed = 1, shadow = true, parent = ground) => {
  const m = F(new THREE.BoxGeometry(w, h, d), mat, amt, seed);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};
const cyl = (
  rt,
  rb,
  h,
  seg,
  mat,
  x,
  y,
  z,
  amt = 0.05,
  seed = 1,
  shadow = true,
  parent = ground,
) => {
  const m = F(new THREE.CylinderGeometry(rt, rb, h, seg), mat, amt, seed);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};
const glow = (color, i = 2) => flat(0xffffff, { emissive: color, emissiveIntensity: i });

// ---------------------------------------------------------------- floor: herringbone parquet
{
  const base = new THREE.Mesh(
    facet(new THREE.BoxGeometry(30, 0.2, 26, 30, 1, 26), 0.03, 2),
    facetMat(flat(0x9a6438, { roughness: 0.55 })),
  );
  base.position.set(0, -0.1, 7);
  base.receiveShadow = true;
  ground.add(base);
  // planks as instances in a herringbone pattern
  const N = 1300;
  const im = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1.0, 0.04, 0.25),
    flat(0xffffff, { roughness: 0.5 }),
    N,
  );
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const c = new THREE.Color();
  const cols = [0xb0743f, 0xa56a39, 0xbd8048, 0x9a5f33, 0xc28a52];
  let i = 0;
  for (let gx = -15; gx < 15 && i < N; gx += 0.72) {
    for (let gz = WZ; gz < 20 && i < N - 1; gz += 0.36) {
      const odd = Math.round(gz / 0.36) % 2;
      q.setFromEuler(new THREE.Euler(0, odd ? Math.PI / 4 : -Math.PI / 4, 0));
      m.compose(V(gx + (odd ? 0.36 : 0), 0.0, gz), q, V(1, 1, 1));
      im.setMatrixAt(i, m);
      im.setColorAt(i, c.setHex(cols[Math.floor(r() * cols.length)]));
      i++;
    }
  }
  im.count = i;
  im.receiveShadow = true;
  ground.add(im);
  // big wool rug in front of the window seat
  const rug = new THREE.Mesh(
    patches(facet(new THREE.BoxGeometry(9, 0.06, 6, 18, 1, 12), 0.05, 5), {
      amt: 0.08,
      scale: 0.5,
      seed: 7,
    }),
    facetMat(flat(0x2f5d6b, { roughness: 1 })),
  );
  rug.position.set(0.5, 0.06, 5.6);
  rug.receiveShadow = true;
  ground.add(rug);
  for (const [w, d, col, y] of [
    [8.2, 5.2, 0xe8c58a, 0.1],
    [7.4, 4.4, 0x2f5d6b, 0.11],
    [3.0, 1.6, 0xc4583e, 0.12],
  ]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.02, d), flat(col, { roughness: 1 }));
    b.position.set(0.5, y, 5.6);
    b.receiveShadow = true;
    ground.add(b);
  }
}

// ---------------------------------------------------------------- walls
const wallMat = flat(0xe9d6bf, { roughness: 0.9 });
const paneelMat = flat(0x6e8f7c, { roughness: 0.75 });
const H = 11;
{
  // back wall around the window opening (x -3.6 … 3.6, y SEAT … 7.2)
  const WX = 3.6;
  const WT = 7.2;
  box(12, H, 0.8, wallMat, -WX - 6, H / 2, WZ - 0.4, 0.02, 11);
  box(12, H, 0.8, wallMat, WX + 6, H / 2, WZ - 0.4, 0.02, 12);
  box(WX * 2, H - WT, 0.8, wallMat, 0, WT + (H - WT) / 2, WZ - 0.4, 0.02, 13);
  // panelled dado on the back wall left and right of the seat
  box(5.2, 1.3, 0.1, paneelMat, -6.8, 0.65, WZ + 0.05, 0.02, 14);
  box(5.2, 1.3, 0.1, paneelMat, 6.8, 0.65, WZ + 0.05, 0.02, 15);
  // stucco cornice
  box(30, 0.35, 0.3, flat(0xf6ece0), 0, H - 0.6, WZ + 0.1, 0.02, 16, false);
  // left wall
  box(0.6, H, 26, wallMat, -9.3, H / 2, 9.5, 0.02, 17);
  box(0.1, 1.3, 26, paneelMat, -8.95, 0.65, 9.5, 0.02, 18);
  // right wall (only far right, behind the sofa)
  box(0.6, H, 26, wallMat, 11.3, H / 2, 9.5, 0.02, 19);
  // skirting
  box(30, 0.2, 0.08, flat(0xf6ece0), 0, 0.1, WZ + 0.04, 0, 1, false);
  // picture frames on the back wall
  const frames = [
    [-6.5, 4.6, 1.6, 2.0, 0xd8894a],
    [-6.9, 2.6, 0.9, 1.1, 0x5f8fbf],
    [-5.3, 2.8, 0.9, 0.9, 0xe0b54a],
    [6.4, 4.4, 2.2, 1.5, 0x8fb37a],
  ];
  frames.forEach(([x, y, w, h, col], i) => {
    box(w, h, 0.08, flat(0x3a2a20), x, y, WZ + 0.06, 0.02, 30 + i, false);
    box(
      w - 0.18,
      h - 0.18,
      0.04,
      flat(col, { roughness: 0.8 }),
      x,
      y,
      WZ + 0.11,
      0.06,
      40 + i,
      false,
    );
  });
}

// ---------------------------------------------------------------- window seat + Kastenfenster (hero)
{
  // seat block (painted wood) and the deep window reveal
  const paint = flat(0xf3ede4, { roughness: 0.6 });
  box(8.0, SEAT, 4.4, paint, 0, SEAT / 2, -0.8, 0.02, 51);
  box(8.2, 0.12, 4.6, flat(0xe9dfd2, { roughness: 0.5 }), 0, SEAT - 0.02, -0.8, 0.02, 52);
  // panel lines on the seat front
  for (const x of [-2.7, 0, 2.7])
    box(2.3, 0.6, 0.06, flat(0xe6ddd1), x, 0.5, 1.43, 0.02, 53, false);
  // reveal side walls of the niche
  box(0.4, 7.2 - SEAT, 1.2, wallMat, -3.8, (7.2 + SEAT) / 2, WZ + 0.2, 0.02, 54);
  box(0.4, 7.2 - SEAT, 1.2, wallMat, 3.8, (7.2 + SEAT) / 2, WZ + 0.2, 0.02, 55);
  // seat cushion pad (mustard), left part under the blanket
  const pad = new THREE.Mesh(
    facet(new THREE.BoxGeometry(7.4, 0.22, 3.4, 14, 1, 6), 0.05, 56),
    facetMat(flat(0xd9a640, { roughness: 0.95 })),
  );
  pad.position.set(0, SEAT + 0.11, -0.95);
  pad.castShadow = pad.receiveShadow = true;
  ground.add(pad);
  // knitted blanket under the cat (cream, cable pattern from the facets)
  const kg = patches(facet(new THREE.BoxGeometry(3.6, 0.12, 2.8, 24, 1, 18), 0.07, 57), {
    amt: 0.06,
    scale: 0.9,
    seed: 3,
    fn: (x, z) => 0.06 * Math.sin(x * 9) * Math.cos(z * 2),
  });
  const knit = new THREE.Mesh(kg, facetMat(flat(0xf2e6d2, { roughness: 1 })));
  knit.position.set(0.1, SEAT + 0.26, -0.3);
  knit.rotation.y = 0.08;
  knit.castShadow = knit.receiveShadow = true;
  ground.add(knit);
  // blanket hanging over the seat edge
  const drape = new THREE.Mesh(
    facet(new THREE.BoxGeometry(2.2, 0.9, 0.1, 10, 4, 1), 0.07, 58),
    facetMat(flat(0xf2e6d2, { roughness: 1 })),
  );
  drape.position.set(-0.6, SEAT - 0.18, 1.32);
  drape.rotation.x = 0.06;
  drape.castShadow = true;
  ground.add(drape);
  // cushions at both ends
  const cushion = (x, col, rz, seed) => {
    const g = facet(new THREE.IcosahedronGeometry(0.7, 1), 0.06, seed);
    const m = new THREE.Mesh(g, facetMat(flat(col, { roughness: 0.95 })));
    m.scale.set(0.55, 1.0, 1.05);
    m.position.set(x, SEAT + 0.85, -2.0);
    m.rotation.z = rz;
    m.castShadow = m.receiveShadow = true;
    ground.add(m);
  };
  cushion(-3.2, 0xc4583e, 0.25, 59);
  cushion(-2.6, 0x2f5d6b, 0.1, 60);
  cushion(3.2, 0xe7a3a8, -0.25, 61);

  // the window: two casements in white frames, a transom above
  const frame = flat(0xfbf8f2, { roughness: 0.4 });
  const fz = WZ - 0.5;
  box(7.4, 0.24, 0.3, frame, 0, SEAT + 0.3, fz, 0.02, 62);
  box(7.4, 0.24, 0.3, frame, 0, 7.1, fz, 0.02, 63);
  box(0.24, 5.9, 0.3, frame, -3.55, 4.2, fz, 0.02, 64);
  box(0.24, 5.9, 0.3, frame, 3.55, 4.2, fz, 0.02, 65);
  box(0.3, 5.9, 0.32, frame, 0, 4.2, fz, 0.02, 66); // middle post
  box(7.4, 0.2, 0.3, frame, 0, 5.8, fz, 0.02, 67); // transom
  for (const x of [-1.75, 1.75]) box(0.1, 4.4, 0.22, frame, x, 3.5, fz, 0.02, 68); // glazing bars
  box(7.4, 0.08, 0.22, frame, 0, 3.6, fz, 0.02, 69);
  // handles (brass)
  const brass = flat(0xd8a84a, { metalness: 0.8, roughness: 0.25 });
  for (const x of [-0.3, 0.3]) box(0.06, 0.4, 0.1, brass, x, 3.4, fz + 0.2, 0.02, 70);
  // glass with a faint reflection
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(7.2, 5.9),
    new THREE.MeshStandardMaterial({
      color: 0xcfe0ff,
      roughness: 0.05,
      metalness: 0.3,
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
    }),
  );
  glass.position.set(0, 4.2, fz + 0.02);
  glass.userData.noAO = true;
  ground.add(glass);
  // rain drops on the glass: still beads + runners sliding down
  const N = 180;
  const drops = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.022, 1),
    new THREE.MeshStandardMaterial({
      color: 0x9fb4dc,
      emissive: 0x1c2848,
      roughness: 0.05,
      metalness: 0.4,
      transparent: true,
      opacity: 0.55,
    }),
    N,
  );
  drops.userData.noAO = true;
  drops.frustumCulled = false;
  ground.add(drops);
  const ds = Array.from({ length: N }, () => [
    r() * 7 - 3.5,
    SEAT + 0.5 + r() * 6,
    0.5 + r() * 1.3,
    r(),
  ]);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  onFrame((t) => {
    ds.forEach(([x, y0, s, ph], i) => {
      let y = y0;
      if (ph < 0.18) {
        // a runner: slides down, wraps at the sill
        const span = 6;
        y = SEAT + 0.4 + ((((y0 - SEAT - 0.4 - t * (0.6 + ph * 3)) % span) + span) % span);
      }
      m4.compose(V(x, y, fz + 0.06), q, V(s, s * (ph < 0.18 ? 1.8 : 1), s * 0.5));
      drops.setMatrixAt(i, m4);
    });
    drops.instanceMatrix.needsUpdate = true;
  });
  // fairy lights along the top of the window
  lightString([-3.4, 6.85, WZ + 0.05], [3.4, 6.85, WZ + 0.05], {
    n: 18,
    sag: 0.35,
    colors: [0xffd27a, 0xfff1c2],
    glow: 2.2,
  });
}

// ---------------------------------------------------------------- outside: wet street at night
{
  const out = new THREE.Group();
  ground.add(out);
  // the street far below (we are on the 2nd floor): dark wet asphalt
  box(
    120,
    0.2,
    50,
    flat(0x1c2233, { roughness: 0.3, metalness: 0.2 }),
    0,
    -6,
    -18,
    0.03,
    80,
    false,
    out,
  );
  // house across the street: Gründerzeit facade with lit windows
  const facade = (x0, w, h, col, seed) => {
    const rr = rng(seed);
    box(w, h, 1.2, flat(col, { roughness: 0.9 }), x0, -6 + h / 2, -42, 0.03, seed, false, out);
    // cornices
    for (let y = 0; y < h; y += 4.2)
      box(w + 0.4, 0.3, 1.5, flat(0xd9cdbd), x0, -6 + y + 0.3, -41.5, 0.02, seed + 1, false, out);
    for (let ix = 0; ix < Math.floor(w / 2.6); ix++)
      for (let iy = 1; iy < Math.floor(h / 4.2); iy++) {
        const lit = rr() < 0.45;
        const col2 = lit ? (rr() < 0.5 ? 0xffc46b : 0xffe0a0) : 0x2a3350;
        const wm = lit ? glow(col2, 1.4) : flat(col2, { roughness: 0.3 });
        box(
          1.2,
          2.0,
          0.1,
          wm,
          x0 - w / 2 + 1.4 + ix * 2.6,
          -6 + iy * 4.2 + 1.6,
          -41.3,
          0,
          1,
          false,
          out,
        );
      }
  };
  facade(-22, 18, 17, 0x4a4a68, 101);
  facade(-2, 20, 21, 0x5a5060, 111);
  facade(20, 16, 15, 0x3f4c66, 121);
  // street lamp glowing in the rain
  const lampPost = cyl(0.12, 0.16, 9, 8, flat(0x222838), 4.5, -1.5, -15, 0.02, 1, false, out);
  void lampPost;
  const head = cyl(0.5, 0.3, 0.5, 8, glow(0xffd28a, 3), 4.5, 3.2, -15, 0.02, 1, false, out);
  void head;
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(1.4, 16, 10),
    new THREE.MeshBasicMaterial({
      color: 0xffc070,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    }),
  );
  halo.position.set(4.5, 3.1, -15);
  halo.userData.noAO = true;
  out.add(halo);
  // tree tops in front of the house (dark, swaying)
  for (const [x, s] of [
    [-8, 1.3],
    [10, 1.1],
  ]) {
    const t = new THREE.Group();
    const leaf = new THREE.Mesh(
      facet(new THREE.IcosahedronGeometry(2.4 * s, 1), 0.08, 90 + x),
      facetMat(flat(0x2b3f3a, { roughness: 1 })),
    );
    leaf.position.y = 0;
    t.add(leaf);
    t.position.set(x, 0.5, -19);
    out.add(t);
    sway(t, x, 0.03);
  }
  // rain: thin streaks falling outside
  const N = 520;
  const rain = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.018, 0.55, 0.018),
    new THREE.MeshBasicMaterial({ color: 0x9fb6e8, transparent: true, opacity: 0.55 }),
    N,
  );
  rain.userData.noAO = true;
  rain.frustumCulled = false;
  out.add(rain);
  const rs = Array.from({ length: N }, () => [r() * 30 - 15, r(), -5 - r() * 18, 0.8 + r() * 0.5]);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0.12));
  onFrame((t) => {
    rs.forEach(([x, ph, z, sp], i) => {
      const y = 14 - ((ph * 22 + t * 11 * sp) % 22);
      m4.compose(V(x + (14 - y) * 0.12, y - 6, z), q, V(1, 1, 1));
      rain.setMatrixAt(i, m4);
    });
    rain.instanceMatrix.needsUpdate = true;
  });
  // cool blue light from the window onto the cat's back
  const blue = new THREE.PointLight(0x7f9dff, 18, 14, 1.6);
  blue.position.set(0, 5, WZ - 1.2);
  ground.add(blue);
}

// ---------------------------------------------------------------- room props
// brass floor lamp right of the seat, warm shade
{
  const brass = flat(0xc89a48, { metalness: 0.7, roughness: 0.3 });
  const x = 5.0;
  const z = -1.6;
  cyl(0.6, 0.7, 0.12, 14, brass, x, 0.06, z, 0.02, 201);
  cyl(0.06, 0.06, 6.0, 8, brass, x, 3.1, z, 0.02, 202);
  const shade = cyl(
    0.75,
    1.15,
    1.2,
    14,
    flat(0xf7e3c0, { emissive: 0xffb45c, emissiveIntensity: 0.9 }),
    x,
    6.3,
    z,
    0.04,
    203,
  );
  shade.userData.noAO = true;
  const l = new THREE.PointLight(0xffb469, 42, 16, 1.5);
  l.position.set(x - 0.4, 5.7, z + 0.4);
  l.castShadow = false;
  ground.add(l);
  // dust in the lamp light
  fireflies(40, { area: [2.5, 6.5, 2.5, 6.5, -2.5, 1.5], color: 0xffe6b8, size: 0.02, seed: 23 });
}
// dusty-pink sofa on the right
{
  const velvet = flat(0xd99a9a, { roughness: 0.9 });
  const g = new THREE.Group();
  box(3.0, 0.9, 5.2, velvet, 0, 0.75, 0, 0.05, 211, true, g); // seat
  box(0.8, 1.6, 5.2, velvet, 1.1, 1.6, 0, 0.05, 212, true, g); // back
  box(3.0, 1.3, 0.6, velvet, 0, 1.0, -2.6, 0.05, 213, true, g); // arms
  box(3.0, 1.3, 0.6, velvet, 0, 1.0, 2.6, 0.05, 214, true, g);
  for (const z of [-1.6, 1.6]) {
    const leg = cyl(0.08, 0.06, 0.3, 6, flat(0x3a2a20), 1.2, 0.15, z, 0.02, 215, true, g);
    void leg;
  }
  const pillow = new THREE.Mesh(
    facet(new THREE.IcosahedronGeometry(0.6, 1), 0.06, 216),
    facetMat(flat(0xe8c58a, { roughness: 0.95 })),
  );
  pillow.scale.set(0.5, 1, 1);
  pillow.position.set(0.5, 1.8, -1.2);
  pillow.rotation.z = -0.3;
  pillow.castShadow = true;
  g.add(pillow);
  g.position.set(9.0, 0, 4.0);
  ground.add(g);
}
// monstera in a terracotta pot left of the seat
{
  const g = new THREE.Group();
  cyl(0.75, 0.55, 1.3, 10, flat(0xc4673e, { roughness: 0.8 }), 0, 0.65, 0, 0.05, 221, true, g);
  cyl(0.68, 0.68, 0.06, 10, flat(0x4a3428), 0, 1.28, 0, 0.05, 222, true, g);
  const leafMat = facetMat(flat(0x2f7a4a, { roughness: 0.7, side: THREE.DoubleSide }));
  const rr = rng(225);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + rr() * 0.4;
    const len = 1.6 + rr() * 1.4;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, len, 5), flat(0x3d8a52));
    const tilt = 0.35 + rr() * 0.4;
    stem.position.set(
      Math.cos(a) * Math.sin(tilt) * len * 0.5,
      1.3 + Math.cos(tilt) * len * 0.5,
      Math.sin(a) * Math.sin(tilt) * len * 0.5,
    );
    stem.rotation.set(Math.sin(a) * tilt, 0, -Math.cos(a) * tilt);
    g.add(stem);
    const lg = facet(new THREE.CircleGeometry(0.75 + rr() * 0.3, 9), 0.08, 226 + i);
    const leaf = new THREE.Mesh(lg, leafMat);
    leaf.scale.set(1, 1.3, 1);
    leaf.position.set(
      Math.cos(a) * Math.sin(tilt) * len,
      1.3 + Math.cos(tilt) * len,
      Math.sin(a) * Math.sin(tilt) * len,
    );
    leaf.lookAt(leaf.position.x * 2, leaf.position.y + 2.5, leaf.position.z * 2);
    leaf.castShadow = true;
    g.add(leaf);
  }
  g.position.set(-5.3, 0, -1.7);
  ground.add(g);
  sway(g, 3, 0.012);
}
// bookshelf on the left wall
{
  const wood = flat(0x6b4a33, { roughness: 0.7 });
  const g = new THREE.Group();
  box(0.9, 6.5, 4.0, wood, 0, 3.25, 0, 0.03, 231, true, g);
  const rr = rng(232);
  const cols = [0xc4583e, 0x2f5d6b, 0xe0b54a, 0x8fb37a, 0xf2e6d2, 0x5f4a8a, 0xd99a9a];
  for (let s = 0; s < 4; s++) {
    box(0.95, 0.08, 3.9, flat(0x4f3626), 0.02, 0.9 + s * 1.5, 0, 0.02, 233 + s, false, g);
    let z = -1.8;
    while (z < 1.7) {
      const w = 0.12 + rr() * 0.14;
      const h = 0.8 + rr() * 0.45;
      box(
        0.7,
        h,
        w,
        flat(cols[Math.floor(rr() * cols.length)], { roughness: 0.8 }),
        0.1,
        0.94 + s * 1.5 + h / 2,
        z + w / 2,
        0.03,
        240 + s * 20 + z * 10,
        false,
        g,
      );
      z += w + 0.02;
    }
  }
  g.position.set(-8.5, 0, 3.0);
  ground.add(g);
}
// side table with a candle and a teacup next to the sofa
{
  const g = new THREE.Group();
  cyl(0.8, 0.8, 0.08, 14, flat(0x6b4a33, { roughness: 0.5 }), 0, 1.6, 0, 0.02, 251, true, g);
  cyl(0.08, 0.08, 1.6, 6, flat(0x2a2220), 0, 0.8, 0, 0.02, 252, true, g);
  cyl(0.45, 0.5, 0.06, 10, flat(0x2a2220), 0, 0.03, 0, 0.02, 253, true, g);
  cyl(0.16, 0.16, 0.5, 10, flat(0xfaf3e6), -0.25, 1.89, 0.1, 0.02, 254, true, g);
  const fl = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.2, 7), glow(0xffa53a, 2.5));
  fl.position.set(-0.25, 2.25, 0.1);
  fl.userData.noAO = true;
  g.add(fl);
  const cl = new THREE.PointLight(0xffa04a, 5, 6, 1.6);
  cl.position.set(-0.25, 2.4, 0.1);
  g.add(cl);
  onFrame((t) => {
    const k = 1 + Math.sin(t * 13) * 0.08 + Math.sin(t * 7.3) * 0.06;
    fl.scale.set(1, k, 1);
    fl.rotation.z = Math.sin(t * 5.1) * 0.08;
    cl.intensity = 5 * k;
  });
  g.position.set(6.6, 0, 0.6);
  ground.add(g);
}
// guitar on its stand (analogy in beat 3: weights on a string)
export const guitar = new THREE.Group();
export const STRING = { y0: 0.55, y1: 3.6, x: 0.0, z: 0.28 }; // the low string in guitar space
{
  const g = guitar;
  const body = new THREE.Mesh(
    facet(new THREE.CylinderGeometry(1, 1, 0.45, 18), 0.05, 261),
    facetMat(flat(0xc98a4a, { roughness: 0.4 })),
  );
  body.rotation.x = Math.PI / 2;
  body.scale.set(0.82, 1, 1);
  body.position.set(0, 0.95, 0);
  body.castShadow = true;
  g.add(body);
  const upper = body.clone();
  upper.scale.set(0.62, 1, 0.8);
  upper.position.set(0, 1.95, 0);
  g.add(upper);
  // sound hole + bridge
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.26, 16), flat(0x2a1a10));
  hole.position.set(0, 1.55, 0.24);
  g.add(hole);
  box(0.6, 0.08, 0.06, flat(0x3a2418), 0, 0.6, 0.25, 0.02, 262, true, g);
  // neck + head
  box(0.26, 1.9, 0.14, flat(0x5a3a22), 0, 3.25, 0.12, 0.02, 263, true, g);
  box(0.36, 0.55, 0.12, flat(0x3a2418), 0, 4.4, 0.1, 0.02, 264, true, g);
  for (let i = 0; i < 6; i++) {
    const peg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.16, 6),
      flat(0xd8a84a, { metalness: 0.8, roughness: 0.3 }),
    );
    peg.rotation.z = Math.PI / 2;
    peg.position.set(i < 3 ? -0.24 : 0.24, 4.25 + (i % 3) * 0.15, 0.1);
    g.add(peg);
  }
  // the other five strings (static); the low one is animated in scene.js
  for (let i = 1; i < 6; i++) {
    const s = new THREE.Mesh(
      new THREE.CylinderGeometry(0.006, 0.006, STRING.y1 + 0.5 - STRING.y0, 4),
      flat(0xe8e2d6, { metalness: 0.8, roughness: 0.3 }),
    );
    s.position.set(-0.1 + i * 0.04, (STRING.y0 + STRING.y1 + 0.5) / 2, STRING.z);
    g.add(s);
  }
  // stand
  const st = flat(0x1f1f24, { metalness: 0.5, roughness: 0.4 });
  box(0.9, 0.06, 0.06, st, 0, 0.32, 0.3, 0.02, 265, true, g);
  box(0.06, 0.06, 1.0, st, -0.35, 0.05, 0, 0.02, 266, true, g);
  box(0.06, 0.06, 1.0, st, 0.35, 0.05, 0, 0.02, 267, true, g);
  box(0.06, 3.0, 0.06, st, 0, 1.5, -0.45, 0.02, 268, true, g);
  g.rotation.set(-0.16, 0.45, 0);
  g.position.set(...GUITAR);
  ground.add(g);
}

// ---------------------------------------------------------------- the lab pocket (Vienna study)
// a small dark lab: black bench, glass dish with the larynx (scene.js),
// a tube with warm air, a monitor showing a wave, shelves with flasks.
export const lab = new THREE.Group();
{
  const g = lab;
  const wall = flat(0x1d2a33, { roughness: 0.9 });
  box(20, 10, 0.4, wall, 0, 5, -5, 0.02, 301, false, g);
  box(0.4, 10, 14, wall, -8, 5, 1, 0.02, 302, false, g);
  box(0.4, 10, 14, wall, 8, 5, 1, 0.02, 303, false, g);
  box(20, 0.2, 16, flat(0x2a3138, { roughness: 0.6 }), 0, -0.1, 2, 0.03, 304, false, g);
  // tiles on the back wall
  for (let ix = -6; ix <= 6; ix++)
    for (let iy = 0; iy < 6; iy++)
      box(
        0.92,
        0.92,
        0.05,
        flat(iy % 2 === ix % 2 ? 0xdfe8e6 : 0xd1dcda, { roughness: 0.4 }),
        ix,
        1.2 + iy,
        -4.75,
        0.02,
        310 + ix + iy * 13,
        false,
        g,
      );
  // bench
  box(9, 0.25, 3.2, flat(0x15181c, { roughness: 0.35 }), 0, 1.0, -0.6, 0.02, 320, true, g);
  box(8.6, 1.0, 3.0, flat(0xe9ecef, { roughness: 0.6 }), 0, 0.45, -0.6, 0.02, 321, true, g);
  // flasks on a shelf
  box(6, 0.12, 0.7, flat(0xd8dde2), 0, 3.6, -4.2, 0.02, 322, true, g);
  const glassM = new THREE.MeshStandardMaterial({
    color: 0xbfe9ff,
    roughness: 0.05,
    transparent: true,
    opacity: 0.45,
  });
  const liq = [0x4fd1a0, 0xffc04a, 0x6fa8ff, 0xff6f6f];
  for (let i = 0; i < 6; i++) {
    const x = -2.6 + i;
    const f = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.3, 0.6, 10), glassM);
    f.position.set(x, 3.96, -4.2);
    g.add(f);
    const l = new THREE.Mesh(
      new THREE.CylinderGeometry(0.17, 0.28, 0.25, 10),
      glow(liq[i % 4], 0.6),
    );
    l.position.set(x, 3.8, -4.2);
    g.add(l);
  }
  // monitor (the wave is drawn in scene.js)
  box(2.4, 1.6, 0.12, flat(0x111418), 2.6, 2.3, -1.8, 0.02, 323, true, g);
  box(0.12, 0.6, 0.12, flat(0x111418), 2.6, 1.35, -1.8, 0.02, 324, true, g);
  // spotlight on the dish
  const s = new THREE.SpotLight(0xfff0dc, 60, 0, 0.45, 0.7, 1.2);
  s.position.set(0.5, 8, 3);
  s.target.position.set(0, 1.2, -0.3);
  s.castShadow = true;
  s.shadow.mapSize.set(1024, 1024);
  g.add(s, s.target);
  const teal = new THREE.PointLight(0x4fd1c5, 12, 14, 1.5);
  teal.position.set(-4, 4, 0);
  g.add(teal);
  g.position.set(...LAB);
  ground.add(g);
}

finishSet({ ground: 0x8a5a36 });
