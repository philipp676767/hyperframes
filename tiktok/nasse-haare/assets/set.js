// #77 Nasse Haare — the world: a log cabin in a snowy pine forest at sunrise.
// Cold blue snow, pink-orange horizon, the cabin door wide open with warm
// light (you just ran out of it), chimney smoke, falling snow. Second place
// for the "Übrigens": an Antarctic research station on the ice (ANT).
import {
  THREE,
  flat,
  ground,
  onFrame,
  M,
  rng,
  V,
  jitter,
  facet,
  facetMat,
  patches,
  real,
  roundedBox,
} from "./world.js";
import {
  SKIES,
  setSky,
  finishSet,
  terrain,
  pathStrip,
  pine,
  F,
  add,
  discGeo,
  snowMat,
} from "./environments.js";
import { place, snowman, fence, mailbox, rock } from "./props.js";

const SEED = 77;
export const ANT = V(170, 0, 0); // the Antarctic station (own ice plate, far from the forest)
export const DOOR = V(0.6, 0.3, -6.9); // the cabin's doorway (Mama stands here)

// ---------------------------------------------------------------- light
setSky({
  ...SKIES.morgen,
  top: [0.3, 0.5, 0.88],
  mid: [0.82, 0.72, 0.88],
  hor: [1.0, 0.78, 0.6],
  below: [0.86, 0.88, 0.96],
  sunDir: [0.6, 0.13, -1],
  keyPos: [8, 7.5, 6],
  hemi: [0xe6eeff, 0x8f9fc4, 1.35],
  key: [0xffe2c4, 2.7],
  rim: [0xa9c4ff, 0.8],
  fog: [36, 120],
  clouds: 7,
  birds: false,
});

// ---------------------------------------------------------------- ground
const r = rng(SEED);
terrain(0xe9f0fb, { seed: SEED, amt: 0.07, scale: 0.18, warm: -0.6, hills: 7 });
// snow drifts
for (let i = 0; i < 22; i++) {
  const a = r() * Math.PI * 2;
  const d = 7.5 + r() * 22;
  const x = Math.cos(a) * d;
  const z = Math.sin(a) * d;
  if (Math.abs(x) < 3 && z < -4) continue; // keep the cabin front free
  const mound = add(
    new THREE.Mesh(jitter(new THREE.SphereGeometry(1, 9, 6), 0.06, i), flat(0xf6f9ff)),
    x,
    -0.22,
    z,
    false,
  );
  mound.scale.set(1.3 + r() * 1.6, 0.42 + r() * 0.2, 1.0 + r() * 1.3);
}
// the trodden path from the door past you
pathStrip(
  [
    [0.6, -6.6],
    [0.3, -3],
    [0, 0.5],
    [1.2, 5],
    [4, 13],
    [3, 30],
  ],
  { width: 1.5, color: 0xd3deef, seed: SEED },
);

// ---------------------------------------------------------------- far layer
const peakMat = flat(0x8f9ccf);
for (let i = 0; i < 12; i++) {
  const a = Math.PI * (1.02 + (i / 11) * 0.96) + (r() - 0.5) * 0.12;
  const d = 52 + r() * 18;
  const h = 15 + r() * 15;
  const rad = 11 + r() * 8;
  const g = new THREE.Group();
  g.add(F(jitter(new THREE.ConeGeometry(rad, h, 7, 2), 0.6, 30 + i), peakMat, 0.1, 30 + i));
  const cap = F(
    jitter(new THREE.ConeGeometry(rad * 0.42, h * 0.42, 7), 0.3, 60 + i),
    snowMat,
    0.05,
    60 + i,
  );
  cap.position.y = h * 0.29;
  g.add(cap);
  g.position.set(Math.sin(a) * d, h / 2 - 1, Math.cos(a) * d);
  ground.add(g);
}

// ---------------------------------------------------------------- forest
[
  [-6.5, -4.5, 1.5],
  [-9.5, -9, 1.9],
  [-5.5, -12.5, 2.1],
  [6.8, -5.5, 1.6],
  [9.5, -10, 2.0],
  [5.5, -14, 2.2],
  [-12.5, -2.5, 1.7],
  [12.5, -2, 1.6],
  [-9.5, 4.5, 1.3],
  [10, 5.5, 1.4],
  [-14, -14, 2.3],
  [15, -15, 2.4],
  [0.5, -17, 2.5],
  [-18, 3, 1.8],
  [18, 4, 1.7],
  [-13, 11, 1.4],
  [14, 12, 1.5],
  [-22, -8, 2.2],
  [23, -9, 2.3],
  [-7, -19, 2.4],
  [8, -20, 2.5],
].forEach(([x, z, s], i) => pine(x, z, s, SEED + i, true));
[
  [-4.6, 2.2, 0.5],
  [5.4, 3.4, 0.6],
  [-8, -1.5, 0.7],
  [7.5, -0.5, 0.55],
].forEach(([x, z, s], i) => {
  const k = place(rock(SEED + i, s), x, z, i);
  const capS = new THREE.Mesh(new THREE.SphereGeometry(s * 0.85, 10, 6), flat(0xf6f9ff));
  capS.scale.y = 0.4;
  capS.position.y = s * 0.75;
  k.add(capS);
});

// ---------------------------------------------------------------- hero piece: the cabin
const cabin = new THREE.Group();
{
  const logMat = real.wood(0x8a5a36);
  const logDark = real.wood(0x6f4528);
  const W2 = 5.6;
  const H = 3.3;
  const D = 4.6;
  const body = new THREE.Mesh(new THREE.BoxGeometry(W2 - 0.2, H, D - 0.2), logDark);
  body.position.y = H / 2;
  body.castShadow = true;
  cabin.add(body);
  // round logs on the front and the sides
  for (let i = 0; i < 9; i++) {
    const y = 0.2 + i * 0.37;
    const front = new THREE.Mesh(
      new THREE.CylinderGeometry(0.19, 0.19, W2, 14),
      i % 2 ? logMat : logDark,
    );
    front.rotation.z = Math.PI / 2;
    front.position.set(0, y, D / 2 - 0.08);
    cabin.add(front);
    for (const sx of [-1, 1]) {
      const side = new THREE.Mesh(
        new THREE.CylinderGeometry(0.19, 0.19, D, 14),
        i % 2 ? logDark : logMat,
      );
      side.rotation.x = Math.PI / 2;
      side.position.set(sx * (W2 / 2 - 0.08), y, 0);
      cabin.add(side);
    }
  }
  // gable + snowy roof with overhang
  const gable = new THREE.Shape();
  gable.moveTo(-W2 / 2, 0);
  gable.lineTo(0, 2.1);
  gable.lineTo(W2 / 2, 0);
  gable.lineTo(-W2 / 2, 0);
  const gab = new THREE.Mesh(
    new THREE.ExtrudeGeometry(gable, { depth: D - 0.2, bevelEnabled: false }),
    logMat,
  );
  gab.position.set(0, H, -(D - 0.2) / 2);
  cabin.add(gab);
  for (const sx of [-1, 1]) {
    const slope = Math.atan2(2.1, W2 / 2);
    const len = Math.hypot(2.1, W2 / 2) + 0.7;
    const roof = new THREE.Mesh(
      roundedBox(len, 0.34, D + 0.9, 0.12),
      flat(0xf7faff, { roughness: 0.9 }),
    );
    roof.position.set(sx * (W2 / 4 + 0.12), H + 1.05 + 0.12, 0);
    roof.rotation.z = -sx * slope;
    roof.castShadow = true;
    cabin.add(roof);
  }
  // icicles along the front eave
  const iceMat = real.glass(0xd6ecfa, { roughness: 0.12 });
  for (let i = 0; i < 16; i++) {
    const sx = i < 8 ? -1 : 1;
    const u = ((i % 8) + 0.5) / 8;
    const L = 0.25 + r() * 0.4;
    const ic = new THREE.Mesh(new THREE.ConeGeometry(0.05, L, 8), iceMat);
    ic.rotation.x = Math.PI;
    ic.position.set(sx * (0.25 + u * 2.9), H + 2.1 - u * 2.1 - 0.12 - L / 2, D / 2 + 0.38);
    cabin.add(ic);
  }
  // open doorway with warm light + the door swung open
  const glow = flat(0xffd89a, { emissive: 0xffa94d, emissiveIntensity: 1.5 });
  const doorway = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.35, 0.1), glow);
  doorway.position.set(0, 1.3, D / 2 + 0.13);
  cabin.add(doorway);
  const frameM = real.wood(0x4f2f1b);
  for (const [w, h, x, y] of [
    [0.14, 2.5, -0.72, 1.35],
    [0.14, 2.5, 0.72, 1.35],
    [1.58, 0.14, 0, 2.55],
  ]) {
    const f = new THREE.Mesh(roundedBox(w, h, 0.2, 0.03), frameM);
    f.position.set(x, y, D / 2 + 0.16);
    cabin.add(f);
  }
  const doorPivot = new THREE.Group();
  doorPivot.position.set(0.66, 0.15, D / 2 + 0.2);
  const door = new THREE.Mesh(roundedBox(1.26, 2.3, 0.09, 0.03), real.wood(0x9c3f2e));
  door.position.set(0.63, 1.15, 0);
  doorPivot.add(door);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), real.metal(0xd9b36a));
  knob.position.set(1.1, 1.1, 0.08);
  doorPivot.add(knob);
  doorPivot.rotation.y = 1.9;
  cabin.add(doorPivot);
  // window with a cross + shutters
  const win = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.95, 0.08), glow);
  win.position.set(-1.75, 1.85, D / 2 + 0.14);
  cabin.add(win);
  for (const [w, h] of [
    [1.15, 0.07],
    [0.07, 1.05],
  ]) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.12), frameM);
    bar.position.copy(win.position);
    cabin.add(bar);
  }
  const sill = new THREE.Mesh(roundedBox(1.4, 0.16, 0.34, 0.06), flat(0xf7faff));
  sill.position.set(-1.75, 1.33, D / 2 + 0.24);
  cabin.add(sill);
  // lantern by the door
  const lan = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 16, 12),
    flat(0xffe2a6, { emissive: 0xffb347, emissiveIntensity: 2.2 }),
  );
  lan.position.set(1.35, 2.2, D / 2 + 0.4);
  cabin.add(lan);
  // porch step, chimney
  const step = new THREE.Mesh(roundedBox(2.4, 0.3, 1.1, 0.06), real.wood(0x7a5234));
  step.position.set(0, 0.15, D / 2 + 0.6);
  step.receiveShadow = true;
  cabin.add(step);
  const chimney = new THREE.Mesh(roundedBox(0.7, 1.7, 0.7, 0.05), flat(0x8a7f86));
  chimney.position.set(1.5, H + 1.7, -0.6);
  cabin.add(chimney);
  const chCap = new THREE.Mesh(roundedBox(0.86, 0.16, 0.86, 0.05), flat(0xf7faff));
  chCap.position.set(1.5, H + 2.6, -0.6);
  cabin.add(chCap);
  cabin.position.set(0.6, 0, -9.6);
  ground.add(cabin);
  const warm = new THREE.PointLight(0xffb060, 26, 9, 1.6);
  warm.position.set(0.6, 1.8, -6.2);
  ground.add(warm);
  // chimney smoke
  const smokeAt = V(0.6 + 1.5, H + 2.9, -9.6 - 0.6);
  const smokeMat = new THREE.MeshStandardMaterial({
    color: 0xf4f2f6,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
  });
  const smoke = Array.from({ length: 10 }, (_, i) => {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4, 1), smokeMat.clone());
    m.userData.noAO = true;
    ground.add(m);
    return { m, ph: i / 10 };
  });
  onFrame((t) => {
    for (const { m, ph } of smoke) {
      const k = (((t * 0.16 + ph) % 1) + 1) % 1;
      m.position.copy(smokeAt).add(V(-k * 2.4 + Math.sin(k * 6 + ph * 9) * 0.25, k * 5, -k * 0.5));
      m.scale.setScalar(0.5 + k * 1.9);
      m.material.opacity = 0.5 * Math.sin(Math.PI * Math.min(1, k * 1.3));
    }
  });
}

// ---------------------------------------------------------------- near ring
place(snowman(0xd8352a), -3.6, -3.4, 0.5, 1.25);
place(fence(7, 0x7a5a3c), -7.2, -6.2, 0.12);
place(fence(6, 0x7a5a3c), 8.2, -6.8, -0.1);
{
  const mb = place(mailbox(0xc23b2e), 3.3, -2.9, -0.4, 1.2);
  const capS = new THREE.Mesh(roundedBox(0.5, 0.14, 0.4, 0.06), flat(0xf7faff));
  capS.position.y = 1.32;
  mb.add(capS);
}
{
  // woodpile under the eave
  const g = new THREE.Group();
  const cut = real.wood(0xd9b07a);
  for (let row = 0; row < 3; row++)
    for (let i = 0; i < 5 - row; i++) {
      const log = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 1.1, 12),
        row % 2 ? M.wood : cut,
      );
      log.rotation.x = Math.PI / 2;
      log.position.set(i * 0.42 + row * 0.21, 0.2 + row * 0.36, 0);
      log.castShadow = true;
      g.add(log);
    }
  const sn = new THREE.Mesh(roundedBox(1.5, 0.16, 1.2, 0.07), flat(0xf7faff));
  sn.position.set(0.95, 1.15, 0);
  g.add(sn);
  place(g, 4.3, -7.6, 0.15);
}
{
  // sled leaning in the snow
  const g = new THREE.Group();
  const red = real.gloss(0xc23b2e);
  for (const sx of [-1, 1]) {
    const runner = new THREE.Mesh(roundedBox(0.06, 0.06, 1.5, 0.02), real.metal(0xb8bec8));
    runner.position.set(sx * 0.28, 0.05, 0);
    g.add(runner);
    for (const z of [-0.45, 0.45]) {
      const leg = new THREE.Mesh(roundedBox(0.05, 0.26, 0.05, 0.02), red);
      leg.position.set(sx * 0.28, 0.19, z);
      g.add(leg);
    }
  }
  for (let i = 0; i < 4; i++) {
    const slat = new THREE.Mesh(roundedBox(0.15, 0.04, 1.3, 0.02), real.wood(0xc99a62));
    slat.position.set(-0.26 + i * 0.173, 0.34, 0);
    slat.castShadow = true;
    g.add(slat);
  }
  place(g, -2.7, -1.2, 0.7, 1.15);
}
{
  // frozen pond
  const ice = new THREE.Mesh(
    patches(facet(discGeo(3.4, 0.5, 8), 0.05, 8), { amt: 0.08, scale: 0.6, seed: 8 }),
    facetMat(
      new THREE.MeshStandardMaterial({
        color: 0xb7dcf2,
        roughness: 0.08,
        metalness: 0.1,
        envMapIntensity: 1.5,
      }),
    ),
  );
  ice.scale.set(1.4, 1, 0.85);
  ice.position.set(-10.5, 0.04, 8.5);
  ground.add(ice);
}

// ---------------------------------------------------------------- life: falling snow (around the camera's working area + the station)
{
  const N = 420;
  const flakes = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.03, 6, 5),
    flat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.25 }),
    N,
  );
  flakes.frustumCulled = false;
  flakes.userData.noAO = true;
  ground.add(flakes);
  const seeds = Array.from({ length: N }, () => [r(), r(), r(), r()]);
  const m4 = new THREE.Matrix4();
  onFrame((t) => {
    seeds.forEach(([a, b, c, d], i) => {
      const y = 11 - ((((t * (0.7 + d * 0.6) + a * 11) % 11) + 11) % 11);
      const far = i % 4 === 0 ? ANT.x : 0;
      m4.makeTranslation(far + (b - 0.5) * 22 + Math.sin(t * 0.7 + i) * 0.3, y, (c - 0.5) * 22 + 1);
      flakes.setMatrixAt(i, m4);
    });
    flakes.instanceMatrix.needsUpdate = true;
  });
}

// ---------------------------------------------------------------- Antarctica (Übrigens)
{
  const g = new THREE.Group();
  g.position.copy(ANT);
  ground.add(g);
  const plate = new THREE.Mesh(
    patches(
      facet(
        discGeo(70, 3, 9, (x, z, d) => (d > 16 ? Math.sin(x * 0.2) * Math.cos(z * 0.23) * 1.2 : 0)),
        0.06,
        9,
      ),
      {
        amt: 0.07,
        scale: 0.16,
        seed: 9,
        warm: -0.7,
      },
    ),
    facetMat(flat(0xeaf2fc)),
  );
  plate.receiveShadow = true;
  g.add(plate);
  // icebergs / ice ridges on the horizon
  const bergMat = flat(0xbfdcf4);
  for (let i = 0; i < 14; i++) {
    const a = Math.PI * (0.75 + (i / 13) * 1.5);
    const d = 26 + r() * 22;
    const h = 5 + r() * 9;
    const b = F(
      jitter(new THREE.ConeGeometry(4 + r() * 5, h, 6, 2), 0.9, 80 + i),
      i % 3 ? bergMat : snowMat,
      0.08,
      80 + i,
    );
    b.position.set(Math.sin(a) * d, h / 2 - 0.6, Math.cos(a) * d);
    g.add(b);
  }
  // the station: a red module on stilts, windows, mast, flag
  const st = new THREE.Group();
  const red = real.plastic(0xc8342b);
  const mod = new THREE.Mesh(roundedBox(6.4, 2.2, 2.6, 0.35), red);
  mod.position.y = 2.6;
  mod.castShadow = true;
  st.add(mod);
  const stripe = new THREE.Mesh(roundedBox(6.44, 0.3, 2.64, 0.1), real.plastic(0xf2f4f7));
  stripe.position.y = 1.95;
  st.add(stripe);
  for (let i = 0; i < 5; i++) {
    const w = new THREE.Mesh(
      roundedBox(0.62, 0.62, 0.08, 0.16),
      flat(0xffe3a8, { emissive: 0xffb84d, emissiveIntensity: 1.3 }),
    );
    w.position.set(-2.3 + i * 1.15, 2.85, 1.31);
    st.add(w);
  }
  for (const [x, z] of [
    [-2.6, -0.9],
    [2.6, -0.9],
    [-2.6, 0.9],
    [2.6, 0.9],
  ]) {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.14, 1.6, 12),
      real.metal(0x9aa3ad),
    );
    leg.position.set(x, 0.8, z);
    st.add(leg);
  }
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 3.2, 8), real.metal(0xb8bec8));
  mast.position.set(2.6, 5.2, 0);
  st.add(mast);
  const dish = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 24, 12, 0, Math.PI * 2, 0, 1.0),
    real.plastic(0xf2f4f7),
  );
  dish.rotation.x = -1.1;
  dish.position.set(-2, 4.1, 0);
  st.add(dish);
  const flag = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.03), flat(0xffd23f));
  flag.position.set(3.1, 6.4, 0);
  st.add(flag);
  onFrame((t) => {
    flag.rotation.y = Math.sin(t * 5) * 0.25;
  });
  st.position.set(-4.2, 0, -4.5);
  st.rotation.y = 0.35;
  g.add(st);
  // penguins
  const black = real.plastic(0x23252b);
  const white = real.plastic(0xf4f4f0);
  const beak = real.plastic(0xf2a23a);
  [
    [4.6, -2.2, -0.6],
    [5.5, -1.5, -0.9],
    [-1.5, 2.6, 0.5],
  ].forEach(([x, z, ry], i) => {
    const p = new THREE.Group();
    const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 0.42, 8, 24), black);
    b.position.y = 0.48;
    b.castShadow = true;
    const belly = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.36, 8, 24), white);
    belly.position.set(0, 0.44, 0.1);
    const bk = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 12), beak);
    bk.rotation.x = Math.PI / 2;
    bk.position.set(0, 0.78, 0.28);
    p.add(b, belly, bk);
    p.position.set(x, 0, z);
    p.rotation.y = ry;
    g.add(p);
    onFrame((t) => {
      p.rotation.z = Math.sin(t * 4 + i * 2) * 0.12;
    });
  });
}

finishSet({ ground: 0xe9f0fb });
