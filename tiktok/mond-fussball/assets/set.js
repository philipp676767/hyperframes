// #85 "Fußball auf dem Mond" (format B): a flat lunar mare at a low sun —
// long black shadows, grey-beige regolith full of craters, a ring of crater
// mountains on the horizon, the Earth big and half-lit in the black sky.
// Hero piece: the lunar lander behind the astronaut. Props: a rover with a
// blinking light and a dish, a flag, a football goal somebody brought along,
// footprints from the lander. Life: the Earth turns, an orbiter crosses the
// sky, dust motes glint in the sunlight, the rover beacon blinks.
// The ball flies along -z (x = 0) and lands near z = -160: that corridor is
// a calm plain (small craters only) so the pitch lines can lie on it.
import {
  THREE,
  V,
  flat,
  ground,
  scene,
  onFrame,
  facet,
  facetMat,
  noise2,
  rng,
  jitter,
  real,
  roundedBox,
} from "./world.js";
import { setSky, finishSet, fireflies } from "./environments.js";

const SEED = 85;
const r = rng(SEED);

// ---------------------------------------------------------------- light
// black sky, sun low on the right: long shadows to the left, warm-white key
setSky({
  top: [0.0, 0.0, 0.01],
  mid: [0.01, 0.01, 0.03],
  hor: [0.05, 0.05, 0.08],
  below: [0.02, 0.02, 0.04],
  sun: [1.0, 0.95, 0.85],
  sunDir: [1, 0.06, 0.25],
  cloud: [0x000000, 0x000000],
  hemi: [0x8d97b8, 0x2a2826, 0.55],
  key: [0xfff4e2, 3.6],
  keyPos: [10, 6.5, 3],
  rim: [0x7f9cff, 0.9],
  stars: 1.3,
  noClouds: true,
  birds: false,
});
scene.fog = null;

// ---------------------------------------------------------------- ground
const R = 260;
const craters = [];
// big craters away from the ball's corridor, small ones everywhere
for (let i = 0; i < 70; i++) {
  const a = r() * Math.PI * 2;
  const d = 12 + r() * 220;
  const cx = Math.cos(a) * d;
  const cz = Math.sin(a) * d - 60;
  const inLane = Math.abs(cx) < 22 && cz < 8 && cz > -175;
  const cr = inLane ? 3.5 + r() * 2.5 : 4 + r() * (d > 80 ? 22 : 9);
  if (Math.hypot(cx, cz) < 7) continue;
  craters.push([cx, cz, cr]);
}
// a few hand-placed ones the shots look at
craters.push([7.5, -6, 4], [-6, -22, 4.5], [9, -42, 6], [-14, -70, 9], [16, -95, 7], [-9, -128, 5]);

export function heightAt(x, z) {
  const d = Math.hypot(x, z);
  let y = (noise2(x * 0.05, z * 0.05, 3) - 0.5) * 1.2;
  for (const [cx, cz, cr] of craters) {
    const q = Math.hypot(x - cx, z - cz) / cr;
    if (q < 1.5) {
      const depth = cr * 0.12;
      y += q < 1 ? -depth * (1 - q * q) : depth * 0.45 * Math.sin(((q - 1) / 0.5) * Math.PI);
    }
  }
  // the crater-mountain ring on the horizon
  if (d > 150) y += ((d - 150) / 110) ** 2 * 38 * (0.55 + 0.45 * noise2(x * 0.02, z * 0.02, 7));
  // keep the kick spot dead flat
  return y * Math.min(1, Math.max(0, (d - 2.5) / 5));
}

// a regular grid (a ring-built disc showed swirl bands under the grazing sun)
const geo = new THREE.PlaneGeometry(R * 2, R * 2, 280, 280);
geo.rotateX(-Math.PI / 2);
{
  const gp = geo.attributes.position;
  for (let i = 0; i < gp.count; i++) gp.setY(i, heightAt(gp.getX(i), gp.getZ(i)));
}
// smooth-shaded (a grazing sun turns flat facets into streaks), dusty
// colour blotches painted per vertex
geo.computeVertexNormals();
{
  const gp = geo.attributes.position;
  const gc = new Float32Array(gp.count * 3);
  const base = new THREE.Color(0x9c978f);
  for (let i = 0; i < gp.count; i++) {
    const x = gp.getX(i);
    const z = gp.getZ(i);
    const v = 0.86 + noise2(x * 0.04, z * 0.04, 21) * 0.18 + noise2(x * 0.3, z * 0.3, 22) * 0.06;
    gc.set([base.r * v, base.g * v, base.b * v * 0.98], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(gc, 3));
}
const moonGround = new THREE.Mesh(
  geo,
  new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.97, metalness: 0 }),
);
moonGround.receiveShadow = true;
moonGround.userData.noAO = true; // SSAO bands on the huge grazing plain
ground.add(moonGround);

// rocks: instanced, faceted, half sunk in the dust
{
  const rockGeo = facet(jitter(new THREE.DodecahedronGeometry(1, 0), 0.18, 3), 0.12, 3);
  const n = 420;
  const im = new THREE.InstancedMesh(rockGeo, facetMat(flat(0x7e7a74)), n);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  let k = 0;
  const rr = rng(SEED + 9);
  while (k < n) {
    const a = rr() * Math.PI * 2;
    const d = 3 + rr() ** 1.6 * 150;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d - 30;
    if (Math.abs(x) < 1.6 && z < 2 && z > -170) continue; // the ball's lane
    const s = (0.04 + rr() ** 3 * 0.9) * (d < 10 ? 0.35 : 1);
    e.set(rr() * 3, rr() * 3, rr() * 3);
    q.setFromEuler(e);
    m.compose(V(x, heightAt(x, z) + s * 0.2, z), q, V(s, s * 0.7, s));
    im.setMatrixAt(k++, m);
  }
  im.castShadow = true;
  im.receiveShadow = true;
  ground.add(im);
}

// footprints from the lander to the kick spot (dark boot prints)
{
  const pr = new THREE.InstancedMesh(
    new THREE.CircleGeometry(1, 14),
    new THREE.MeshStandardMaterial({ color: 0x5f5a54, roughness: 1 }),
    44,
  );
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  for (let i = 0; i < 44; i++) {
    const u = i / 43;
    const x = -11 + u * 10.4 + ((i % 2) - 0.5) * 0.32;
    const z = -9 + u * 9.6 + Math.sin(u * 5) * 0.8;
    const dir = Math.atan2(10.4, 9.6);
    q.setFromEuler(new THREE.Euler(-Math.PI / 2, 0, -dir));
    m.compose(V(x, heightAt(x, z) + 0.012, z), q, V(0.13, 0.3, 1));
    pr.setMatrixAt(i, m);
  }
  pr.receiveShadow = true;
  ground.add(pr);
}

// ---------------------------------------------------------------- the Earth
const EARTH = V(-58, 52, -232);
{
  const g = new THREE.IcosahedronGeometry(26, 5);
  const ep = g.attributes.position;
  const col = new Float32Array(ep.count * 3);
  const ocean = new THREE.Color(0x1f5fbf);
  const land = [new THREE.Color(0x4d8f43), new THREE.Color(0x9a8455), new THREE.Color(0x3e7a3b)];
  const ice = new THREE.Color(0xf3f7ff);
  const c = new THREE.Color();
  for (let i = 0; i < ep.count; i++) {
    const x = ep.getX(i) / 26;
    const y = ep.getY(i) / 26;
    const z = ep.getZ(i) / 26;
    const n =
      noise2(x * 2.4 + z * 1.4, y * 2.4 - z * 0.8, 5) * 0.7 + noise2(x * 6, y * 6 + z * 3, 6) * 0.3;
    if (Math.abs(y) > 0.84) c.copy(ice);
    else if (n > 0.55) c.copy(land[Math.floor(n * 37) % 3]);
    else c.copy(ocean).multiplyScalar(0.85 + n * 0.3);
    col.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const earth = new THREE.Mesh(
    g,
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75 }),
  );
  earth.position.copy(EARTH);
  earth.userData.noAO = true;
  scene.add(earth);
  // clouds: a second, slightly bigger shell with white blotches
  const cg = new THREE.IcosahedronGeometry(26.5, 5);
  const cp = cg.attributes.position;
  const cc = new Float32Array(cp.count * 4);
  for (let i = 0; i < cp.count; i++) {
    const x = cp.getX(i) / 26.5;
    const y = cp.getY(i) / 26.5;
    const z = cp.getZ(i) / 26.5;
    const n = noise2(x * 4 - z * 2, y * 4 + z * 2.5, 11);
    cc.set([1, 1, 1, Math.max(0, (n - 0.5) * 2.6)], i * 4);
  }
  cg.setAttribute("color", new THREE.BufferAttribute(cc, 4));
  const clouds = new THREE.Mesh(
    cg,
    new THREE.MeshStandardMaterial({
      vertexColors: true,
      transparent: true,
      roughness: 1,
      depthWrite: false,
    }),
  );
  clouds.position.copy(EARTH);
  clouds.userData.noAO = true;
  scene.add(clouds);
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(28, 48, 32),
    new THREE.MeshBasicMaterial({
      color: 0x6fb6ff,
      transparent: true,
      opacity: 0.28,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
    }),
  );
  atmo.position.copy(EARTH);
  atmo.userData.noAO = true;
  scene.add(atmo);
  // the Earth is lit by the same sun as the Moon: its own light, Earth only
  const sunOnEarth = new THREE.DirectionalLight(0xffffff, 2.2);
  sunOnEarth.position.copy(EARTH).add(V(60, 8, 15));
  sunOnEarth.target = earth;
  scene.add(sunOnEarth);
  onFrame((t) => {
    earth.rotation.y = 0.6 + t * 0.025;
    clouds.rotation.y = 0.6 + t * 0.032;
  });
}

// ---------------------------------------------------------------- the lander (hero piece)
const LANDER = V(-14, 0, -12);
{
  const g = new THREE.Group();
  const gold = new THREE.MeshPhysicalMaterial({
    color: 0xd9a441,
    metalness: 1,
    roughness: 0.32,
    clearcoat: 0.4,
  });
  const goldDark = new THREE.MeshPhysicalMaterial({
    color: 0x9a6a22,
    metalness: 1,
    roughness: 0.4,
  });
  const white = real.plastic(0xd9d9d4, { roughness: 0.5 });
  const grey = real.metal(0x8e939a, { roughness: 0.4 });
  const black = real.rubber(0x1c1d21);
  // descent stage: octagonal gold-foil box (crinkled by facets)
  const ds = new THREE.Mesh(
    facet(jitter(new THREE.CylinderGeometry(2.1, 2.1, 1.6, 8, 2), 0.04, 2), 0.06, 2),
    gold,
  );
  ds.position.y = 1.9;
  g.add(ds);
  // legs + pads
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const top = V(Math.cos(a) * 1.8, 2.1, Math.sin(a) * 1.8);
    const foot = V(Math.cos(a) * 3.3, 0.25, Math.sin(a) * 3.3);
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, top.distanceTo(foot), 16),
      goldDark,
    );
    leg.position.copy(top).add(foot).multiplyScalar(0.5);
    leg.quaternion.setFromUnitVectors(V(0, 1, 0), foot.clone().sub(top).normalize());
    g.add(leg);
    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 12), grey);
    const s0 = V(Math.cos(a) * 2.0, 1.2, Math.sin(a) * 2.0);
    strut.position.copy(s0).add(foot).multiplyScalar(0.5);
    strut.quaternion.setFromUnitVectors(V(0, 1, 0), foot.clone().sub(s0).normalize());
    g.add(strut);
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 0.14, 24), grey);
    pad.position.copy(foot).setY(0.07);
    g.add(pad);
  }
  // ascent stage: angular cabin with windows, antennas, a hatch
  const as = new THREE.Mesh(facet(new THREE.DodecahedronGeometry(1.45, 0), 0.05, 4), white);
  as.position.y = 3.6;
  as.scale.set(1.15, 0.85, 1);
  g.add(as);
  for (const s of [-1, 1]) {
    const win = new THREE.Mesh(new THREE.CircleGeometry(0.22, 3), black);
    win.position.set(s * 0.45, 3.85, 1.18);
    win.rotation.z = Math.PI / 2;
    g.add(win);
  }
  const hatch = new THREE.Mesh(roundedBox(0.75, 0.75, 0.08, 0.05), grey);
  hatch.position.set(0, 3.25, 1.3);
  g.add(hatch);
  const ladder = new THREE.Group();
  for (const s of [-1, 1]) {
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.4, 8), grey);
    rail.position.set(s * 0.3, 1.2, 0);
    ladder.add(rail);
  }
  for (let i = 0; i < 7; i++) {
    const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 8), grey);
    rung.rotation.z = Math.PI / 2;
    rung.position.y = 0.25 + i * 0.32;
    ladder.add(rung);
  }
  ladder.position.set(0, 0, 2.55);
  ladder.rotation.x = -0.35;
  g.add(ladder);
  const dish = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 12, 0, Math.PI * 2, 0, 0.9), white);
  dish.position.set(0.9, 4.9, -0.4);
  dish.rotation.set(-0.6, 0.4, 0);
  g.add(dish);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 8), grey);
  mast.position.set(-0.8, 4.8, 0.1);
  g.add(mast);
  g.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  g.position.set(LANDER.x, heightAt(LANDER.x, LANDER.z), LANDER.z);
  g.rotation.y = 0.75;
  ground.add(g);
}

// flag next to the lander (a top rod holds it out — no wind here)
{
  const g = new THREE.Group();
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 2.6, 12),
    real.metal(0xd0d3d8),
  );
  pole.position.y = 1.3;
  g.add(pole);
  const rod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, 1.25, 10),
    real.metal(0xd0d3d8),
  );
  rod.rotation.z = Math.PI / 2;
  rod.position.set(0.62, 2.55, 0);
  g.add(rod);
  const cloth = new THREE.PlaneGeometry(1.2, 0.78, 12, 6);
  const cp = cloth.attributes.position;
  for (let i = 0; i < cp.count; i++) cp.setZ(i, Math.sin(cp.getX(i) * 6) * 0.04);
  cloth.computeVertexNormals();
  // stripes painted into vertex colours: a made-up mission flag
  const col = new Float32Array(cp.count * 3);
  for (let i = 0; i < cp.count; i++) {
    const y = cp.getY(i);
    const c = new THREE.Color(y > 0.13 ? 0x2b5bd7 : y > -0.13 ? 0xf4f2ea : 0xe0a526);
    col.set([c.r, c.g, c.b], i * 3);
  }
  cloth.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const flag = new THREE.Mesh(
    cloth,
    real.fabric(0xffffff, { vertexColors: true, side: THREE.DoubleSide }),
  );
  flag.position.set(0.62, 2.15, 0);
  g.add(flag);
  g.traverse((o) => o.isMesh && (o.castShadow = true));
  g.position.set(-8.5, heightAt(-8.5, -15), -15);
  g.rotation.y = 0.5;
  ground.add(g);
}

// ---------------------------------------------------------------- rover
export const ROVER = V(9.5, 0, -6);
{
  const g = new THREE.Group();
  const frame = real.metal(0xb7bcc2, { roughness: 0.35 });
  const wheelM = real.metal(0x8b8f94, { roughness: 0.55 });
  const seatM = real.fabric(0x3c5a8a);
  const deck = new THREE.Mesh(roundedBox(1.9, 0.12, 3.0, 0.04), frame);
  deck.position.y = 0.62;
  g.add(deck);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.24, 28), wheelM);
      w.rotation.z = Math.PI / 2;
      w.position.set(sx * 1.05, 0.4, sz * 1.15);
      g.add(w);
      const fender = new THREE.Mesh(
        new THREE.CylinderGeometry(0.46, 0.46, 0.3, 24, 1, true, 0, Math.PI),
        real.plastic(0x3a6fc9, { side: THREE.DoubleSide }),
      );
      fender.rotation.set(0, 0, Math.PI / 2);
      fender.rotation.x = Math.PI / 2;
      fender.position.set(sx * 1.05, 0.42, sz * 1.15);
      g.add(fender);
    }
  for (const sx of [-0.45, 0.45]) {
    const seat = new THREE.Mesh(roundedBox(0.6, 0.08, 0.6, 0.03), seatM);
    seat.position.set(sx, 0.78, 0.2);
    g.add(seat);
    const back = new THREE.Mesh(roundedBox(0.6, 0.55, 0.06, 0.03), seatM);
    back.position.set(sx, 1.05, -0.12);
    g.add(back);
  }
  const console_ = new THREE.Mesh(roundedBox(0.5, 0.45, 0.25, 0.05), real.plastic(0x2a2c30));
  console_.position.set(0, 1.0, 0.75);
  g.add(console_);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.3, 10), frame);
  mast.position.set(0.7, 1.3, 1.1);
  g.add(mast);
  const dish = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 32, 10, 0, Math.PI * 2, 0, 1.0),
    real.plastic(0xf0efe9, { side: THREE.DoubleSide }),
  );
  dish.position.set(0.7, 2.0, 1.1);
  dish.rotation.x = -1.0;
  g.add(dish);
  const beacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 16, 10),
    new THREE.MeshStandardMaterial({ color: 0xff4a2a, emissive: 0xff3a1a, emissiveIntensity: 2 }),
  );
  beacon.position.set(-0.7, 1.45, 1.2);
  beacon.userData.noAO = true;
  g.add(beacon);
  onFrame((t) => (beacon.material.emissiveIntensity = (t * 1.1) % 1 < 0.15 ? 6 : 0.3));
  g.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  g.position.set(ROVER.x, heightAt(ROVER.x, ROVER.z), ROVER.z);
  g.rotation.y = -0.6;
  ground.add(g);
}

// ---------------------------------------------------------------- football goal
// somebody brought a goal. The ball sails high over it.
export const GOAL = V(0, 0, -16);
{
  const g = new THREE.Group();
  const post = real.plastic(0xf6f6f2, { roughness: 0.3 });
  const W2 = 3.66;
  const H = 2.44;
  for (const s of [-1, 1]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, H, 20), post);
    p.position.set(s * W2, H / 2, 0);
    g.add(p);
    const back = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.0, 10), post);
    back.position.set(s * W2, H / 2 - 0.2, -0.85);
    back.rotation.x = 0.5;
    g.add(back);
  }
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, W2 * 2 + 0.12, 20), post);
  bar.rotation.z = Math.PI / 2;
  bar.position.y = H;
  g.add(bar);
  const net = new THREE.Mesh(
    new THREE.PlaneGeometry(W2 * 2, H, 28, 10),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    }),
  );
  net.position.set(0, H / 2 - 0.1, -1.0);
  net.rotation.x = 0.3;
  net.userData.noAO = true;
  g.add(net);
  g.traverse((o) => o.isMesh && (o.castShadow = true));
  g.position.set(GOAL.x, heightAt(GOAL.x, GOAL.z), GOAL.z);
  ground.add(g);
}

// ---------------------------------------------------------------- life
// an orbiter crossing the black sky
{
  const sat = new THREE.Group();
  sat.add(new THREE.Mesh(roundedBox(1.2, 1.2, 2, 0.1), real.metal(0xcfa54a, { roughness: 0.3 })));
  for (const s of [-1, 1]) {
    const p = new THREE.Mesh(roundedBox(3.4, 0.06, 1.2, 0.02), real.gloss(0x203a7a));
    p.position.x = s * 2.4;
    sat.add(p);
  }
  scene.add(sat);
  onFrame((t) => {
    sat.position.set(-120 + t * 5.5, 70 + Math.sin(t * 0.05) * 4, -170);
    sat.rotation.set(t * 0.15, t * 0.1, 0.3);
  });
}
// dust motes glinting in the low sun near the kick spot
fireflies(60, { area: [-6, 6, 0.1, 2.2, -8, 4], color: 0xfff1d6, seed: SEED, size: 0.012 });

finishSet({ ground: 0x8c877f });
export { R as MOON_R };
