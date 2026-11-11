// #76 Selbstbräuner — a woman on a hotel lounger at dusk, straw hat over
// her face, one knee up. The hook shows the result (orange knee) with the
// viewer's hand rubbing it; then the story: lotion on pale skin, night
// falls, the skin tans. A floating skin cut-away (SLAB) shows the dead
// cells as roof tiles that brown; the breakfast trolley's toaster is the
// analogy (crust); the bottle in x-ray holds the sugar. Payoff: the thick
// dead-skin stack on the knee turns orange; cream first fixes it; the
// "Übrigens" shower washes the brown tiles off.
import {
  THREE,
  ramp,
  smooth,
  pop,
  V,
  scene,
  flat,
  real,
  roundedBox,
  rng,
  outBack,
  xrayMaterial,
  setXray,
  showNope,
  showPanel,
  LED,
  labels,
  puff,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { lounger, setNight } from "./set.js";
import { createHand } from "./hand.js";
import { T, shots, LABELS, HIGHLIGHTS, SLAB, CART, TOP, TOASTER, BOTTLE } from "./beats.js";

highlights(HIGHLIGHTS);

const col = (h) => new THREE.Color(h);
const PALE = col(0xf2cdb3);
const TAN = col(0xa3704c);
const ORANGE = col(0xff5200);

// ---------------------------------------------------------------- person
const person = new THREE.Group();
scene.add(person);
person.add(lounger());

// a tube with a radius profile and per-vertex colours (limbs)
const limbs = [];
function limb(points, radii, hot = []) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => V(...p)));
  const SEG = 72;
  const RAD = 32;
  const frames = curve.computeFrenetFrames(SEG, false);
  const pos = [];
  const nor = [];
  const idx = [];
  const w = [];
  const rAt = (u) => {
    const f = u * (radii.length - 1);
    const i = Math.min(radii.length - 2, Math.floor(f));
    const k = f - i;
    const s = k * k * (3 - 2 * k);
    return radii[i] + (radii[i + 1] - radii[i]) * s;
  };
  for (let i = 0; i <= SEG; i++) {
    const u = i / SEG;
    const p = curve.getPointAt(u);
    const N = frames.normals[i];
    const B = frames.binormals[i];
    const r = rAt(u);
    for (let j = 0; j <= RAD; j++) {
      const a = (j / RAD) * Math.PI * 2;
      const n = N.clone()
        .multiplyScalar(Math.cos(a))
        .add(B.clone().multiplyScalar(Math.sin(a)));
      const q = p.clone().add(n.clone().multiplyScalar(r));
      pos.push(q.x, q.y, q.z);
      nor.push(n.x, n.y, n.z);
      let ww = 0;
      for (const h of hot) {
        const d = q.distanceTo(V(...h.at));
        ww = Math.max(ww, Math.exp(-((d / h.r) ** 2)));
      }
      w.push(ww);
    }
  }
  for (let i = 0; i < SEG; i++)
    for (let j = 0; j < RAD; j++) {
      const a = i * (RAD + 1) + j;
      const b = a + RAD + 1;
      idx.push(a, a + 1, b, b, a + 1, b + 1);
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(w.length * 3), 3));
  geo.setIndex(idx);
  const m = new THREE.Mesh(geo, real.skin(0xffffff, { vertexColors: true }));
  m.castShadow = m.receiveShadow = true;
  person.add(m);
  limbs.push({ geo, w });
  // round end caps
  for (const [pt, rr] of [
    [points[0], radii[0]],
    [points[points.length - 1], radii[radii.length - 1]],
  ]) {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(rr, 32, 16), skinMat);
    cap.position.set(...pt);
    person.add(cap);
  }
  return m;
}
const skinMat = real.skin(0xf2cdb3);
const KNEE_PT = [0.04, 2.4, 0.4];
// bent leg (near the camera)
limb(
  [
    [-1.35, 1.33, 0.32],
    [-0.7, 1.82, 0.34],
    [0, 2.12, 0.36],
    [0.55, 1.6, 0.36],
    [1.05, 1.08, 0.36],
  ],
  [0.46, 0.4, 0.3, 0.28, 0.32, 0.25, 0.16],
  [{ at: KNEE_PT, r: 0.62 }],
);
// straight leg
limb(
  [
    [-1.35, 1.3, -0.32],
    [-0.5, 1.2, -0.33],
    [0.25, 1.12, -0.33],
    [0.9, 1.08, -0.33],
    [1.5, 1.05, -0.33],
  ],
  [0.45, 0.38, 0.27, 0.27, 0.3, 0.22, 0.15],
  [{ at: [0.25, 1.38, -0.33], r: 0.3 }],
);
// arms resting along the body (near arm's elbow gets orange too)
for (const s of [1, -1])
  limb(
    [
      [-2.85, 2.3, 0.8 * s],
      [-2.4, 1.85, 0.9 * s],
      [-2.0, 1.48, 0.95 * s],
      [-1.4, 1.2, 0.92 * s],
    ],
    [0.2, 0.17, 0.15, 0.12],
    s > 0 ? [{ at: [-2.0, 1.48, 1.12], r: 0.22 }] : [],
  );
// feet
{
  const f1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.55, 12, 32), skinMat);
  f1.rotation.z = Math.PI / 2 - 0.08;
  f1.scale.set(1, 1, 1.15);
  f1.position.set(1.38, 1.02, 0.36);
  person.add(f1);
  const f2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.5, 12, 32), skinMat);
  f2.rotation.z = -0.35;
  f2.scale.set(1, 1, 1.15);
  f2.position.set(1.62, 1.38, -0.33);
  person.add(f2);
  // painted toenails (tiny coral dots)
  const nail = real.gloss(0xe8485a);
  for (let i = 0; i < 4; i++) {
    const n = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), nail);
    n.position.set(1.66, 1.12, 0.26 + i * 0.065);
    n.scale.set(0.6, 0.5, 1);
    person.add(n);
  }
  for (const m of [f1, f2]) m.castShadow = true;
}
// swimsuit (one-piece, coral), neck, head, straw hat over the face
{
  const suit = real.fabric(0xe65a4e);
  const pelvis = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), suit);
  pelvis.scale.set(0.62, 0.4, 0.8);
  pelvis.position.set(-1.5, 1.3, 0);
  person.add(pelvis);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.55, 1.35, 16, 48), suit);
  torso.scale.set(1, 1, 1.4);
  torso.rotation.z = 0.94;
  torso.position.set(-2.35, 1.95, 0);
  person.add(torso);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.4, 24), skinMat);
  neck.rotation.z = 0.94;
  neck.position.set(-3.18, 2.62, 0);
  person.add(neck);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.4, 40, 24), skinMat);
  head.position.set(-3.45, 2.9, 0);
  person.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.43, 40, 24), real.fabric(0x5a3a26));
  hair.scale.set(1, 1, 1.02);
  hair.position.set(-3.6, 2.85, 0);
  person.add(hair);
  // hat: lathe brim + crown, laid over the face
  const prof = [
    [0.0, 0.32],
    [0.32, 0.31],
    [0.4, 0.2],
    [0.43, 0.04],
    [0.62, 0.02],
    [1.0, -0.04],
    [1.04, -0.07],
    [1.0, -0.06],
    [0.62, -0.0],
    [0.4, 0.0],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const hat = new THREE.Mesh(new THREE.LatheGeometry(prof, 64), real.fabric(0xe2c287));
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.035, 12, 64), real.fabric(0x1e1e24));
  band.rotation.x = Math.PI / 2;
  band.position.y = 0.08;
  hat.add(band);
  hat.rotation.z = -0.63;
  hat.position.set(-3.2, 3.25, 0);
  person.add(hat);
  person.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });
}
const skinLook = (tan, orange, w) =>
  PALE.clone()
    .lerp(TAN, tan)
    .lerp(ORANGE, Math.min(1, orange * w));
function paintSkin(tan, orange) {
  skinMat.color.copy(skinLook(tan, 0, 0));
  for (const { geo, w } of limbs) {
    const a = geo.attributes.color;
    for (let i = 0; i < w.length; i++) {
      const c = skinLook(tan, orange, w[i]);
      a.setXYZ(i, c.r, c.g, c.b);
    }
    a.needsUpdate = true;
  }
}

// lotion streaks on the shin (rubbed in) and the cream dab on the knee
const lotionMat = real.ceramic(0xfdf6ee, { roughness: 0.3 });
const streaks = [];
for (let i = 0; i < 5; i++) {
  const u = 0.15 + i * 0.17;
  const c = V(0, 2.12, 0.36).lerp(V(1.05, 1.08, 0.36), u);
  const r = 0.3 - 0.1 * u;
  const p = c.add(V(0.71, 0.7, 0).multiplyScalar(r + 0.005));
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 12), lotionMat);
  m.position.copy(p).add(V(0, 0, (i % 2 ? -0.08 : 0.1) * 1));
  m.scale.set(1.3, 0.25, 0.8);
  m.rotation.z = -0.78;
  scene.add(m);
  streaks.push(m);
}
const dab = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 12), lotionMat);
dab.position.set(0.06, 2.42, 0.42);
dab.scale.set(1, 0.35, 1);
scene.add(dab);

// ---------------------------------------------------------------- trolley
const cart = new THREE.Group();
cart.position.set(...CART);
scene.add(cart);
{
  const teak = real.wood(0x8a5a36, { roughness: 0.55 });
  const brass = real.metal(0xc9a46a, { roughness: 0.3 });
  const top = new THREE.Mesh(roundedBox(2.5, 0.1, 1.35, 0.04), teak);
  top.position.y = TOP - 0.05;
  cart.add(top);
  const low = new THREE.Mesh(roundedBox(2.5, 0.08, 1.35, 0.04), teak);
  low.position.y = 0.75;
  cart.add(low);
  for (const x of [-1.15, 1.15])
    for (const z of [-0.58, 0.58]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, TOP - 0.2, 16), brass);
      leg.position.set(x, (TOP - 0.2) / 2 + 0.2, z);
      cart.add(leg);
      const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.04, 12, 24), real.rubber());
      wheel.position.set(x, 0.14, z);
      cart.add(wheel);
    }
  // folded napkin + a glass of orange juice
  const nap = new THREE.Mesh(roundedBox(0.5, 0.06, 0.5, 0.02), real.fabric(0xf6f2ea));
  nap.position.set(-0.95, TOP + 0.03, -0.3);
  cart.add(nap);
  const glass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.11, 0.46, 32, 1, true),
    real.glass(),
  );
  glass.position.set(-0.4, TOP + 0.23, -0.35);
  cart.add(glass);
  const juice = new THREE.Mesh(
    new THREE.CylinderGeometry(0.115, 0.1, 0.34, 32),
    real.gloss(0xf59a1e, { roughness: 0.2, transparent: true, opacity: 0.92 }),
  );
  juice.position.set(-0.4, TOP + 0.18, -0.35);
  cart.add(juice);
  cart.traverse((o) => {
    if (o.isMesh) o.castShadow = o.receiveShadow = true;
  });
}

// toaster with two slices
const toaster = new THREE.Group();
toaster.position.set(...TOASTER);
scene.add(toaster);
const slotMat = flat(0x161616, { emissive: 0xff4a10, emissiveIntensity: 0 });
const lever = new THREE.Mesh(roundedBox(0.16, 0.08, 0.14, 0.03), real.plastic(0x1b1b1f));
const slices = [];
const crustMat = real.plastic(0x8a4f22, { roughness: 0.8, clearcoat: 0 });
const breadMat = real.plastic(0xf0dcb2, { roughness: 0.9, clearcoat: 0 });
{
  const body = new THREE.Mesh(
    roundedBox(1.1, 0.62, 0.66, 0.16, 6),
    real.metal(0xd9dbe0, { roughness: 0.22 }),
  );
  body.position.y = 0.33;
  toaster.add(body);
  const base = new THREE.Mesh(roundedBox(1.14, 0.08, 0.7, 0.03), real.plastic(0x1b1b1f));
  base.position.y = 0.04;
  toaster.add(base);
  for (const z of [-0.14, 0.14]) {
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.02, 0.11), slotMat);
    slot.position.set(0, 0.64, z);
    toaster.add(slot);
  }
  lever.position.set(0.6, 0.48, 0);
  toaster.add(lever);
  const knob = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.05, 24),
    real.plastic(0x1b1b1f),
  );
  knob.rotation.z = Math.PI / 2;
  knob.position.set(0.57, 0.18, 0.18);
  toaster.add(knob);
  for (const z of [-0.14, 0.14]) {
    const g = new THREE.Group();
    const crust = new THREE.Mesh(roundedBox(0.72, 0.74, 0.085, 0.07, 4), crustMat);
    g.add(crust);
    for (const s of [1, -1]) {
      const face = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.64), breadMat);
      face.position.z = 0.0435 * s;
      face.rotation.y = s > 0 ? 0 : Math.PI;
      g.add(face);
    }
    g.position.set(0, 0.3, z);
    toaster.add(g);
    slices.push(g);
  }
  toaster.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });
}
const BREAD = col(0xf0dcb2);
const TOASTED = col(0xc98a3c);

// the self-tanner bottle (bronze, cream label, pump) — x-ray shell
const bottle = new THREE.Group();
bottle.position.set(...BOTTLE);
scene.add(bottle);
const bottleMat = xrayMaterial(0x9c5524);
let label;
const sugar = [];
{
  const prof = [
    [0, 0],
    [0.16, 0],
    [0.175, 0.03],
    [0.175, 0.5],
    [0.15, 0.56],
    [0.07, 0.6],
    [0.065, 0.64],
    [0, 0.64],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const shell = new THREE.Mesh(new THREE.LatheGeometry(prof, 64), bottleMat);
  shell.castShadow = true;
  bottle.add(shell);
  // label band
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 160;
  const g = c.getContext("2d");
  g.fillStyle = "#f4eadb";
  g.fillRect(0, 0, 512, 160);
  g.fillStyle = "#6b3a1c";
  g.font = "bold 64px Montserrat, Arial, sans-serif";
  g.textAlign = "center";
  g.fillText("SELF TAN", 128, 92);
  g.font = "28px Montserrat, Arial, sans-serif";
  g.fillText("bronzing lotion", 128, 132);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  label = new THREE.Mesh(
    new THREE.CylinderGeometry(0.178, 0.178, 0.24, 64, 1, true),
    real.plastic(0xffffff, { map: tex, roughness: 0.5 }),
  );
  label.position.y = 0.27;
  label.rotation.y = -Math.PI / 2 + 0.3;
  bottle.add(label);
  // pump
  const pumpMat = real.plastic(0x1f1a17, { roughness: 0.3 });
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 20), pumpMat);
  stem.position.y = 0.7;
  bottle.add(stem);
  const head = new THREE.Mesh(roundedBox(0.12, 0.07, 0.12, 0.03), pumpMat);
  head.position.y = 0.78;
  bottle.add(head);
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.16, 16), pumpMat);
  nozzle.rotation.z = Math.PI / 2;
  nozzle.position.set(-0.12, 0.78, 0);
  bottle.add(nozzle);
  // liquid + sugar molecules inside (seen in x-ray)
  const liquid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 0.44, 48),
    real.gloss(0xd99b5c, { roughness: 0.25, transparent: true, opacity: 0.4, depthWrite: false }),
  );
  liquid.position.y = 0.25;
  liquid.name = "liquid";
  bottle.add(liquid);
  const sm = flat(0xffc83a, { emissive: 0xffb020, emissiveIntensity: 1.6 });
  const r = rng(12);
  for (let i = 0; i < 16; i++) {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.045, 1), sm);
    m.userData = { x: (r() - 0.5) * 0.2, y: 0.08 + r() * 0.36, z: (r() - 0.5) * 0.2, p: r() * 6 };
    bottle.add(m);
    sugar.push(m);
  }
}
const liquid = bottle.getObjectByName("liquid");

// golden crystals burst from the pump on "Zucker" (hook)
const SPARK_N = 34;
const sparks = new THREE.InstancedMesh(
  new THREE.OctahedronGeometry(0.035, 0),
  flat(0xffd34a, { emissive: 0xffb81f, emissiveIntensity: 2.2 }),
  SPARK_N,
);
sparks.userData.noAO = true;
scene.add(sparks);
const sparkDir = (() => {
  const r = rng(31);
  return Array.from({ length: SPARK_N }, () => [
    -0.6 - r() * 1.2,
    0.5 + r() * 1.4,
    (r() - 0.5) * 1.4,
    0.6 + r() * 0.6,
  ]);
})();

// ---------------------------------------------------------------- skin slab
const slab = new THREE.Group();
slab.position.set(...SLAB);
scene.add(slab);
const SX = 4.0;
const SZ = 2.6;
{
  const dermis = new THREE.Mesh(roundedBox(SX, 1.2, SZ, 0.08), real.skin(0xe7b49b));
  dermis.position.y = 0.6;
  slab.add(dermis);
  const fat = new THREE.Mesh(roundedBox(SX, 0.35, SZ, 0.08), real.skin(0xf3d98e));
  fat.position.y = -0.12;
  slab.add(fat);
  const vessel = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        V(-2, 0.45, 1.25),
        V(-0.6, 0.6, 1.3),
        V(0.7, 0.38, 1.3),
        V(2, 0.5, 1.25),
      ]),
      64,
      0.09,
      16,
    ),
    real.gloss(0xb8222c, { roughness: 0.35 }),
  );
  slab.add(vessel);
  const living = new THREE.Mesh(roundedBox(SX, 0.5, SZ, 0.06), real.skin(0xf0a39c));
  living.position.y = 1.45;
  slab.add(living);
  // living cells on the cut face
  const cellMat = real.skin(0xff9d97, { roughness: 0.45 });
  const r = rng(5);
  for (let i = 0; i < 15; i++)
    for (let j = 0; j < 2; j++) {
      const c = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 12), cellMat);
      c.position.set(-1.85 + i * 0.265 + (j ? 0.13 : 0), 1.32 + j * 0.24, SZ / 2 - 0.02);
      c.scale.set(1, 0.85 + r() * 0.2, 0.55);
      slab.add(c);
    }
  const key = new THREE.PointLight(0xfff0dc, 30, 24, 1.6);
  key.position.set(2.5, 6, 5);
  slab.add(key);
  const fill = new THREE.PointLight(0xc8b8ff, 12, 20, 1.6);
  fill.position.set(-4, 3, 3);
  slab.add(fill);
}
// dead cells = roof tiles: 6 layers × 7 × 6, instanced
const TX = 7;
const TZ = 6;
const LAYERS = 6;
const TILE_N = TX * TZ * LAYERS;
const tileMat = real.skin(0xffffff, { roughness: 0.7, emissive: 0xffffff, emissiveIntensity: 0 });
const tiles = new THREE.InstancedMesh(roundedBox(0.62, 0.05, 0.5, 0.022, 3), tileMat, TILE_N);
tiles.castShadow = true;
slab.add(tiles);
const tileInfo = [];
{
  const r = rng(76);
  for (let L = 0; L < LAYERS; L++)
    for (let i = 0; i < TX; i++)
      for (let j = 0; j < TZ; j++)
        tileInfo.push({
          L,
          x: -1.74 + i * 0.58 + (j % 2) * 0.12 + (r() - 0.5) * 0.08,
          z: -1.05 + j * 0.42 + (r() - 0.5) * 0.06,
          ry: (r() - 0.5) * 0.25,
          d: r(), // browning / shedding delay
          s: 0.92 + r() * 0.14,
        });
}
const DEAD = col(0xe6d6c0);
const BROWN = col(0xa8622e);
const DEEP = col(0xc4531b);
const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const tmpE = new THREE.Euler();
const tmpC = new THREE.Color();

// sugar beads raining onto the tiles
const BEAD_N = 60;
const beads = new THREE.InstancedMesh(
  new THREE.SphereGeometry(0.05, 12, 8),
  flat(0xffcf3f, { emissive: 0xffb020, emissiveIntensity: 1.8 }),
  BEAD_N,
);
beads.userData.noAO = true;
slab.add(beads);
const beadInfo = (() => {
  const r = rng(44);
  return Array.from({ length: BEAD_N }, () => ({
    x: (r() - 0.5) * 3.6,
    z: (r() - 0.5) * 2.3,
    d: r() * 1.3,
  }));
})();

// the flame that is NOT needed ("ganz ohne Hitze")
const flame = new THREE.Group();
flame.position.set(0.9, 2.0, 1.5);
slab.add(flame);
{
  const outer = new THREE.Mesh(
    new THREE.ConeGeometry(0.16, 0.55, 24),
    flat(0xff8a1f, { emissive: 0xff6a00, emissiveIntensity: 2 }),
  );
  outer.position.y = 0.3;
  flame.add(outer);
  const inner = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.3, 24),
    flat(0xfff0a0, { emissive: 0xffe060, emissiveIntensity: 2.5 }),
  );
  inner.position.y = 0.2;
  flame.add(inner);
}

// shower drops
const DROP_N = 150;
const drops = new THREE.InstancedMesh(
  new THREE.CylinderGeometry(0.014, 0.014, 0.24, 6),
  new THREE.MeshStandardMaterial({
    color: 0xcfeeff,
    emissive: 0x7fc8ff,
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.75,
  }),
  DROP_N,
);
drops.userData.noAO = true;
slab.add(drops);
const dropInfo = (() => {
  const r = rng(91);
  return Array.from({ length: DROP_N }, () => ({
    x: (r() - 0.5) * 4.2,
    z: (r() - 0.5) * 2.8,
    p: r(),
  }));
})();

const applyCamera = shotCamera(shots, 1.0);
// warm festoon glow on the lounger once night has fallen
const lampGlow = new THREE.PointLight(0xffc98a, 0, 14, 1.4);
lampGlow.position.set(1.5, 5.2, 3.2);
scene.add(lampGlow);
const hand = createHand({ scale: 0.55, skin: 0xd99a6c, sleeve: 0xd99a6c });

// ---------------------------------------------------------------- render
function renderAt(t) {
  // night falls on "Stunden später"
  setNight(t < T.stunden ? 0 : 0.62 * smooth(ramp(t, T.stunden, T.stunden + 1.3)));

  lampGlow.intensity = t < T.stunden ? 0 : 28 * smooth(ramp(t, T.stunden, T.stunden + 1.3));
  // skin state
  let tan;
  let orange;
  if (t < T.du) {
    tan = 0.75;
    orange = 1;
  } else {
    tan = t < T.stunden ? 0 : smooth(ramp(t, T.stunden + 0.2, T.braun1 + 0.25));
    orange =
      smooth(ramp(t, T.orange - 0.1, T.orange + 0.3)) *
      (1 - smooth(ramp(t, T.creme + 0.45, T.uebrigens - 0.15)));
  }
  paintSkin(tan, orange);

  // lotion streaks: there on "Du cremst", rubbed in by "Nichts"
  const lot = t >= T.du && t < T.stunden ? 1 - smooth(ramp(t, T.du + 0.3, T.nichts + 0.2)) : 0;
  streaks.forEach((m) => {
    m.visible = lot > 0.02;
    m.scale.set(1.3 * lot, 0.25 * lot + 0.01, 0.8 * lot);
  });
  const dk =
    t >= T.creme
      ? pop(t, T.creme + 0.35, T.uebrigens) * (1 - ramp(t, T.creme + 0.5, T.uebrigens - 0.1))
      : 0;
  dab.visible = dk > 0.02;
  dab.scale.set(dk, 0.35 * dk, dk);

  // the viewer's hand
  const rub = (t0, t1, p, d, rot) => {
    const keys = [];
    for (let x = t0, k = 0; x < t1; x += 0.24, k++)
      keys.push({
        t: x,
        pos: [p[0] + (k % 2 ? d[0] : -d[0]), p[1] + (k % 2 ? d[1] : -d[1]), p[2]],
        rot,
        pose: "open",
      });
    return keys;
  };
  hand.track(t, [
    ...rub(-0.6, T.schuld, [0.62, 2.12, 0.62], [0.1, -0.1], [0, -Math.PI / 2, 0.6]),
    { t: T.schuld, pos: [1.2, 2.4, 1.0], rot: [0, -Math.PI / 2, 0.6], pose: "open", out: true },
    ...rub(T.du - 0.2, T.nichts, [0.78, 1.95, 0.7], [0.18, -0.18], [-0.2, Math.PI, 0.79]),
    { t: T.nichts, pos: [1.2, 2.4, 1.6], rot: [-0.2, Math.PI, 0.79], pose: "open", out: true },
    { t: T.creme - 0.1, pos: [0.35, 3.0, 1.2], rot: [-0.6, Math.PI, 0], pose: "point" },
    { t: T.creme + 0.3, pos: [0.08, 2.62, 0.82], rot: [-0.7, Math.PI, 0], pose: "press" },
    { t: T.creme + 0.55, pos: [0.0, 2.6, 0.8], rot: [-0.5, Math.PI, 0], pose: "open" },
    { t: T.creme + 0.8, pos: [0.18, 2.6, 0.8], rot: [-0.5, Math.PI, 0], pose: "open" },
    {
      t: T.uebrigens - 0.05,
      pos: [0.4, 3.0, 1.4],
      rot: [-0.5, Math.PI, 0],
      pose: "open",
      out: true,
    },
  ]);

  // bottle: crystals burst on "Zucker", x-ray on "Im Selbstbräuner"
  const sk = t >= T.zucker1 - 0.05 && t < T.du ? t - (T.zucker1 - 0.05) : -1;
  sparks.visible = sk >= 0;
  if (sk >= 0) {
    const nz = V(...BOTTLE).add(V(-0.2, 0.78, 0));
    sparkDir.forEach(([vx, vy, vz, s], i) => {
      const tt = sk * s;
      tmpE.set(t * 4 + i, t * 3, 0);
      tmpQ.setFromEuler(tmpE);
      const sc = Math.max(0.001, 1 - tt * 0.7);
      tmpM.compose(
        V(nz.x + vx * tt, nz.y + vy * tt - 2.2 * tt * tt, nz.z + vz * tt),
        tmpQ,
        V(sc, sc, sc),
      );
      sparks.setMatrixAt(i, tmpM);
    });
    sparks.instanceMatrix.needsUpdate = true;
  }
  const xr = smooth(ramp(t, T.im2 + 0.1, T.im2 + 0.5)) * (1 - ramp(t, T.der - 0.15, T.der));
  setXray([bottleMat], xr);
  label.visible = xr < 0.1;
  liquid.visible = xr > 0.05;
  sugar.forEach((m) => {
    const u = m.userData;
    m.visible = xr > 0.05;
    const glow = 1 + 0.6 * pop(t, T.zucker2, T.der);
    m.position.set(u.x + Math.sin(t * 2 + u.p) * 0.02, u.y + Math.sin(t * 1.5 + u.p) * 0.03, u.z);
    m.scale.setScalar(glow);
  });

  // toaster: lever down on "Rate", slots glow, toast pops on "Toaster"
  const down = t >= T.rate + 0.3 && t < T.toaster;
  lever.position.y = down ? 0.2 : 0.48;
  slotMat.emissiveIntensity = down ? 1.6 * ramp(t, T.rate + 0.3, T.rate + 1.2) : 0;
  const up = t >= T.toaster ? outBack(Math.min(1, (t - T.toaster) / 0.35)) : 0;
  const toasted = t >= T.toaster;
  breadMat.color.copy(toasted ? TOASTED : BREAD);
  slices.forEach((g, i) => {
    g.position.y = (down ? 0.18 : 0.3) + up * (0.3 + i * 0.04);
  });

  // ---- slab: tiles
  const thick = t >= T.liegt && t < T.uebrigens;
  let brownBase = 0;
  if (t >= T.braun2 && t < T.der) brownBase = smooth(ramp(t, T.braun2, T.braun2 + 0.4));
  for (let n = 0; n < TILE_N; n++) {
    const ti = tileInfo[n];
    let vis = ti.L < 2;
    let grow = 1;
    if (ti.L >= 2) {
      vis = thick;
      const at = T.liegt + 0.15 + (ti.L - 2) * 0.16 + ti.d * 0.1;
      grow = thick ? smooth(ramp(t, at, at + 0.25)) : 0;
      vis = vis && grow > 0.01;
    }
    // colour
    let b = brownBase;
    if (t >= T.dabei) b = smooth(ramp(t, T.dabei + ti.d * 0.6, T.dabei + ti.d * 0.6 + 0.45));
    if (t >= T.liegt && t < T.mehr && ti.L >= 2) b = 0;
    let c = tmpC.copy(DEAD).lerp(BROWN, b);
    if (t >= T.mehr && t < T.uebrigens)
      c.lerp(DEEP, smooth(ramp(t, T.mehr + 0.1 + ti.d * 0.3, T.mehr + 0.6 + ti.d * 0.3)));
    // shower: top layer sheds, bottom layer fades
    let off = 0;
    if (t >= T.uebrigens) {
      if (ti.L === 1) {
        const ts = T.uebrigens + 0.6 + ti.d * (T.dusch + 0.5 - T.uebrigens - 0.6);
        off = Math.max(0, t - ts);
      }
      if (ti.L === 0) c.copy(BROWN).lerp(DEAD, smooth(ramp(t, T.woche, T.dusch + 0.6)));
    }
    tiles.setColorAt(n, c);
    const y = 1.73 + ti.L * 0.065 + (1 - grow) * 0.6 - 0.9 * off * off * 2 + off * 0.6;
    tmpE.set(0.12 + off * 2.5, ti.ry + off, off * 1.4);
    tmpQ.setFromEuler(tmpE);
    const sc = vis ? ti.s * grow * Math.max(0, 1 - off * 0.6) : 0.0001;
    tmpM.compose(V(ti.x + off * 1.6, y, ti.z + off * 0.8), tmpQ, V(sc, sc, sc));
    tiles.setMatrixAt(n, tmpM);
  }
  tiles.instanceMatrix.needsUpdate = true;
  tiles.instanceColor.needsUpdate = true;
  tileMat.emissiveIntensity = 0.35 * pop(t, T.tot, T.ganz1);

  // sugar beads: fall from "Der", stick, melt into the browning
  const bVis = t >= T.der && t < T.deine;
  beads.visible = bVis;
  if (bVis) {
    beadInfo.forEach((bi, i) => {
      const f = smooth(ramp(t, T.der + bi.d, T.der + bi.d + 0.7));
      const melt = t >= T.dabei ? 1 - ramp(t, T.dabei + 0.3, T.dabei + 1.0) : 1;
      const sc = f > 0 ? melt : 0.0001;
      tmpM.compose(V(bi.x, 4.4 - (4.4 - 1.92) * f, bi.z), tmpQ.identity(), V(sc, sc, sc));
      beads.setMatrixAt(i, tmpM);
    });
    beads.instanceMatrix.needsUpdate = true;
  }

  // flame + ✕ on "ohne Hitze"
  flame.visible = t >= T.deine && t < T.an;
  flame.scale.set(1 + Math.sin(t * 23) * 0.06, 1 + Math.sin(t * 17) * 0.1, 1);
  const fNope = pop(t, T.hitze, T.an);
  if (fNope > 0) showNope(fNope, SLAB[0] + 0.9, SLAB[1] + 2.35, SLAB[2] + 1.5, 0.8);
  else showNope(pop(t, T.ohne1 + 0.3, T.sbr2), 2.7, 4.3, -6, 1.5);

  // shower
  const dVis = t >= T.uebrigens && t < T.ehrlich;
  drops.visible = dVis;
  if (dVis) {
    dropInfo.forEach((di, i) => {
      const f = (t * 1.9 + di.p) % 1;
      tmpM.compose(V(di.x, 6.2 - f * 4.4, di.z), tmpQ.identity(), V(1, 1, 1));
      drops.setMatrixAt(i, tmpM);
    });
    drops.instanceMatrix.needsUpdate = true;
  }

  // the extra layers land with a puff
  puff("stack", t, T.liegt + 0.45, SLAB[0], SLAB[1] + 2.1, SLAB[2], 1.1);

  // LED fact
  if (t >= T.woche && t < T.ehrlich)
    showPanel(pop(t, T.woche, T.ehrlich), "BRÄUNE HÄLT", "1 WOCHE", LED.yellow);
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
