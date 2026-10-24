// #29 "Schleudersitz": a high Alpine valley in the evening light (Alpenglühen).
// A small military airfield lies on the green valley floor (runway along x
// through the stage, hangar, tower, windsock); around it the slopes rise
// through pine forest and grey rock into snow; behind the stage the
// Matterhorn-like hero peak glows pink in the last sun. A cable car climbs
// the left slope, cows graze by an alpine hut, clouds hang between peaks.
// The jet flies at y ≈ 32 between the peaks (scene.js); the ground scenes
// (parked jet, landing, CTA) play on the valley floor at the origin.
import { THREE, flat, ground, onFrame, facet, facetMat, patches, noise2, rng, M } from "./world.js";
import {
  SKIES,
  setSky,
  finishSet,
  discGeo,
  pathStrip,
  pine,
  F,
  cloudPuffs,
} from "./environments.js";
import { place, cow, fence, flowerBed } from "./props.js";

const SEED = 29;

// ---------------------------------------------------------------- light
// golden hour in the Alps: deep blue zenith, peach horizon, a low warm sun
// behind the peaks; warm key from the front so the subject stays bright
const sky = setSky({
  ...SKIES.sonnenuntergang,
  top: [0.2, 0.36, 0.78],
  mid: [0.62, 0.62, 0.86],
  hor: [1.0, 0.76, 0.56],
  below: [0.86, 0.72, 0.78],
  sun: [1.0, 0.82, 0.55],
  sunDir: [-0.55, 0.1, -1],
  cloud: [0xfff0ea, 0xffb9a8],
  hemi: [0xffeef0, 0x6f6a80, 1.35],
  key: [0xffe0c0, 2.7],
  keyPos: [7, 10, 8],
  rim: [0xffa98f, 0.8],
  fog: [70, 260],
  clouds: 14,
});

// ---------------------------------------------------------------- relief
// valley elongated along x (the runway), slopes from |d| ≈ 15, peaks 35–60,
// the hero peak (horn) at (10, -68)
const HORN = [12, -96];
export function height(x, z) {
  const dv = Math.hypot(x * 0.6, z);
  if (dv < 24) return 0;
  const rise = Math.min(1, (dv - 24) / 46);
  const s = rise * rise * (3 - 2 * rise);
  const n = noise2(x * 0.025, z * 0.025, SEED) * 0.7 + noise2(x * 0.05, z * 0.05, SEED + 3) * 0.3;
  const ridge = 1 - Math.abs(noise2(x * 0.035, z * 0.035, SEED + 5) * 2 - 1); // crests
  let h = s * (14 + 36 * n) + s * s * 7 * ridge;
  // hero peak: a steep, slightly twisted pyramid
  const hx = x - HORN[0];
  const hz = z - HORN[1];
  const hd = Math.hypot(hx, hz) * (1 + 0.16 * Math.sin(Math.atan2(hz, hx) * 3 + 0.6));
  h = Math.max(h, 96 - hd * 1.9);
  return Math.max(0, h);
}

{
  const geo = facet(
    discGeo(190, 3.6, SEED, (x, z) => height(x, z)),
    0.05,
    SEED,
  );
  // paint by height and slope: valley meadow → pine green → rock → snow
  const p = geo.attributes.position;
  const c = geo.attributes.color;
  const col = new THREE.Color();
  const GRASS = new THREE.Color(0x86b852);
  const GRASS2 = new THREE.Color(0x5f9a48);
  const ROCK = new THREE.Color(0x857670);
  const ROCK2 = new THREE.Color(0x6a5f60);
  const SNOW = new THREE.Color(0xf6f4fb);
  for (let i = 0; i + 2 < p.count; i += 3) {
    const x = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3;
    const y = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3;
    const z = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3;
    const wob = (noise2(x * 0.06, z * 0.06, SEED + 9) - 0.5) * 7;
    if (y < 1.5 + wob * 0.3) col.copy(GRASS).lerp(GRASS2, noise2(x * 0.15, z * 0.15, 4) * 0.6);
    else if (y < 14 + wob) col.copy(GRASS).lerp(GRASS2, 0.5 + 0.5 * noise2(x * 0.1, z * 0.1, 6));
    else if (y < 40 + wob * 2) col.copy(ROCK).lerp(ROCK2, noise2(x * 0.3, z * 0.3, 2));
    else col.copy(SNOW).lerp(ROCK, y < 45 + wob ? 0.25 : 0);
    for (let j = 0; j < 3; j++) {
      c.setXYZ(i + j, c.getX(i + j) * col.r, c.getY(i + j) * col.g, c.getZ(i + j) * col.b);
    }
  }
  patches(geo, { amt: 0.07, scale: 0.09, seed: SEED, warm: 0.4 });
  const m = new THREE.Mesh(geo, facetMat(flat(0xffffff, { roughness: 0.92 })));
  m.receiveShadow = true;
  ground.add(m);
}

// ---------------------------------------------------------------- airfield
pathStrip(
  [
    [-70, 0.4],
    [-30, 0.1],
    [0, 0],
    [30, -0.1],
    [70, -0.4],
  ],
  { width: 4.2, color: 0x5a5e66, seed: SEED, lift: 0.03 },
);
{
  // centre-line dashes and threshold bars (flat, they don't block the stage)
  const white = flat(0xf4f4f0, { roughness: 0.6 });
  const dash = new THREE.BoxGeometry(1.6, 0.02, 0.18);
  for (let x = -60; x <= 60; x += 3.4) {
    const m = new THREE.Mesh(dash, white);
    m.position.set(x, 0.05, 0);
    m.receiveShadow = true;
    ground.add(m);
  }
  for (const sx of [-1, 1])
    for (let k = -3; k <= 3; k++) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.02, 0.32), white);
      m.position.set(sx * 34, 0.05, k * 0.55);
      ground.add(m);
    }
  // taxiway to the hangar
  pathStrip(
    [
      [-10, 0],
      [-13, -4],
      [-15, -8.5],
    ],
    { width: 2.4, color: 0x62666e, seed: SEED + 1, lift: 0.025 },
  );
}

// hangar: a faceted half-barrel with a dark door and a stripe
{
  const g = new THREE.Group();
  const shell = F(
    new THREE.CylinderGeometry(4.2, 4.2, 9, 14, 1, false, -Math.PI / 2, Math.PI),
    flat(0xa9b0a2, { roughness: 0.6, metalness: 0.2 }),
    0.06,
    3,
  );
  shell.rotation.x = Math.PI / 2;
  shell.rotation.z = Math.PI / 2;
  shell.rotation.y = 0;
  g.add(shell);
  const door = new THREE.Mesh(new THREE.CircleGeometry(3.4, 14, 0, Math.PI), flat(0x2a2d33));
  door.position.set(0, 0.02, 4.52);
  g.add(door);
  const stripe = new THREE.Mesh(
    new THREE.CylinderGeometry(4.25, 4.25, 0.4, 14, 1, true, -Math.PI / 2, Math.PI),
    flat(0xe9c23a),
  );
  stripe.rotation.x = Math.PI / 2;
  stripe.rotation.z = Math.PI / 2;
  stripe.position.z = 4.2;
  g.add(stripe);
  g.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  g.position.set(-17, 0, -13);
  g.rotation.y = 0.35;
  ground.add(g);
}

// control tower with a glass cab
{
  const g = new THREE.Group();
  const shaft = F(new THREE.BoxGeometry(1.6, 6, 1.6), flat(0xe8e3da), 0.05, 7);
  shaft.position.y = 3;
  g.add(shaft);
  const cab = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.2, 1.3, 8),
    flat(0x7fc4e8, { roughness: 0.15, metalness: 0.3, emissive: 0x2a5f80, emissiveIntensity: 0.3 }),
  );
  cab.position.y = 6.65;
  g.add(cab);
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.75, 0.25, 8), flat(0x4a4f58));
  roof.position.y = 7.4;
  g.add(roof);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 5), flat(0x4a4f58));
  mast.position.y = 8.3;
  g.add(mast);
  const beacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 8, 6),
    flat(0xff3a2a, { emissive: 0xff2010, emissiveIntensity: 1.5 }),
  );
  beacon.position.y = 9.15;
  g.add(beacon);
  onFrame((t) => (beacon.material.emissiveIntensity = 0.4 + 1.6 * (Math.sin(t * 5) > 0.3 ? 1 : 0)));
  g.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  g.position.set(15, 0, -11);
  ground.add(g);
}

// windsock on a pole: the orange-white sock swings in the valley wind
{
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 3.2, 6), flat(0xd8d8d8));
  pole.position.y = 1.6;
  g.add(pole);
  const sock = new THREE.Group();
  sock.position.y = 3.1;
  for (let k = 0; k < 5; k++) {
    const seg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26 - k * 0.03, 0.29 - k * 0.03, 0.34, 10, 1, true),
      flat(k % 2 ? 0xffffff : 0xff6a1a, { side: THREE.DoubleSide }),
    );
    seg.rotation.z = Math.PI / 2;
    seg.position.x = 0.2 + k * 0.34;
    sock.add(seg);
  }
  g.add(sock);
  onFrame((t) => {
    sock.rotation.y = 0.5 + Math.sin(t * 0.7) * 0.25;
    sock.rotation.z = -0.15 + Math.sin(t * 2.3) * 0.06;
  });
  g.position.set(9, 0, 6.5);
  ground.add(g);
}

// ---------------------------------------------------------------- alpine hut + meadow
function chalet(scale = 1, seed = 1) {
  const g = new THREE.Group();
  const stone = F(new THREE.BoxGeometry(3.4, 1.0, 2.8), flat(0xd9d2c5), 0.06, seed);
  stone.position.y = 0.5;
  g.add(stone);
  const wood = F(new THREE.BoxGeometry(3.4, 1.5, 2.8), flat(0x8a5632), 0.07, seed + 1);
  wood.position.y = 1.75;
  g.add(wood);
  const shape = new THREE.Shape();
  shape.moveTo(-2.15, 0);
  shape.lineTo(0, 1.1);
  shape.lineTo(2.15, 0);
  shape.lineTo(-2.15, 0);
  const roof = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: 3.6, bevelEnabled: false }),
    flat(0x5b3d2a),
  );
  roof.position.set(0, 2.5, -1.8);
  g.add(roof);
  const gable = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: 0.04, bevelEnabled: false }),
    flat(0x7a4a2a),
  );
  gable.scale.set(0.8, 0.8, 1);
  gable.position.set(0, 2.5, 1.42);
  g.add(gable);
  // balcony with red geraniums
  const bal = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.35, 0.45), flat(0x6e4325));
  bal.position.set(0, 1.45, 1.6);
  g.add(bal);
  const red = flat(0xe8343a, { roughness: 0.7 });
  for (let k = 0; k < 7; k++) {
    const f = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 0), red);
    f.position.set(-1.5 + k * 0.5, 1.72, 1.7);
    g.add(f);
  }
  const winMat = flat(0xffd889, { emissive: 0xffb04d, emissiveIntensity: 0.55 });
  for (const x of [-0.9, 0.9]) {
    const w = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.55, 0.05), winMat);
    w.position.set(x, 0.6, 1.42);
    g.add(w);
    const sh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.6, 0.05), flat(0x2f7a4a));
    sh.position.set(x - 0.42, 0.6, 1.43);
    g.add(sh);
  }
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.9, 0.4), flat(0x9a948c));
  chimney.position.set(0.9, 3.4, -0.5);
  g.add(chimney);
  g.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  g.scale.setScalar(scale);
  return g;
}
place(chalet(1, 3), -11, 8.5, 0.5);
place(chalet(0.85, 5), 18, 9, -0.6);
place(flowerBed(SEED, [0xe8343a, 0xffffff, 0xffd23f]), -8.4, 9.6, 0.4, 0.8);
place(fence(7, 0x8a5a30), -13.5, 5.2, 0.15);
place(cow(1), -7.5, 6, 0.8);
place(cow(2), -13, 3.6, -0.5);
place(cow(3), 12.5, 6.5, 2.2);

// smoke from the hut chimney
{
  const mat = new THREE.MeshStandardMaterial({
    color: 0xe8e4ee,
    transparent: true,
    opacity: 0.5,
    roughness: 1,
    flatShading: true,
    depthWrite: false,
  });
  const puffs = [];
  for (let i = 0; i < 7; i++) {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 0), mat);
    ground.add(m);
    puffs.push(m);
  }
  const base = new THREE.Vector3(-11, 0, 8.5).add(
    new THREE.Vector3(0.9, 3.85, -0.5).applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.5),
  );
  onFrame((t) =>
    puffs.forEach((m, i) => {
      const ph = (t * 0.22 + i / 7) % 1;
      m.position.set(base.x + ph * 1.6, base.y + ph * 3.2, base.z - ph * 0.6);
      m.scale.setScalar(0.4 + ph * 1.6);
      m.material.opacity = 0.5;
    }),
  );
}

// ---------------------------------------------------------------- forest
{
  const r = rng(SEED + 11);
  let n = 0;
  for (let i = 0; i < 600 && n < 150; i++) {
    const a = r() * Math.PI * 2;
    const d = 22 + r() * 40;
    const x = Math.cos(a) * d * 1.5;
    const z = Math.sin(a) * d;
    const y = height(x, z);
    if (y < 0.5 && Math.hypot(x * 0.6, z) < 20) continue; // valley floor stays open
    if (y > 13) continue; // tree line
    if (Math.abs(z) < 6 || (x > -20 && x < 20 && z > -15 && z < 12)) continue; // airfield
    const g = pine(x, z, 1.4 + r() * 1.3, SEED + i, y > 9);
    g.position.y = y - 0.2;
    n++;
  }
}

// ---------------------------------------------------------------- cable car
// a red gondola climbs the left slope on a sagging cable between two pylons
{
  const A = new THREE.Vector3(-34, 1.5, -22);
  const B = new THREE.Vector3(-62, height(-62, -58) + 4, -58);
  const cableMat = flat(0x2b2b30);
  const pts = [];
  for (let k = 0; k <= 30; k++) {
    const f = k / 30;
    const p = A.clone().lerp(B, f);
    p.y += 0.6 - Math.sin(f * Math.PI) * 2.5;
    pts.push(p);
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  for (const dz of [-0.35, 0.35]) {
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 60, 0.04, 4), cableMat);
    tube.position.z = dz;
    ground.add(tube);
  }
  for (const P of [A, B]) {
    const py = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.45, P.y + 1, 6), flat(0x9aa0a8));
    py.position.set(P.x, (P.y + 1) / 2 - 0.5, P.z);
    ground.add(py);
    const station = F(new THREE.BoxGeometry(3, 2.4, 2.6), flat(0xe8e1d4), 0.05, 4);
    station.position.set(P.x, P.y - 1.2 - (P === A ? 0.3 : 0), P.z);
    station.castShadow = true;
    ground.add(station);
  }
  const gondola = new THREE.Group();
  const cabin = F(
    new THREE.BoxGeometry(1.5, 1.2, 1.3),
    flat(0xe8302a, { roughness: 0.4 }),
    0.05,
    6,
  );
  cabin.position.y = -1.3;
  gondola.add(cabin);
  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(1.52, 0.45, 1.32),
    flat(0xbfe6ff, { roughness: 0.15, emissive: 0xffd9a0, emissiveIntensity: 0.25 }),
  );
  glass.position.y = -1.1;
  gondola.add(glass);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.0, 0.08), cableMat);
  arm.position.y = -0.4;
  gondola.add(arm);
  ground.add(gondola);
  onFrame((t) => {
    const f = 0.15 + 0.7 * (0.5 - 0.5 * Math.cos(t * 0.05));
    const p = curve.getPointAt(f);
    gondola.position.copy(p);
    gondola.rotation.z = Math.sin(t * 1.3) * 0.03;
  });
}

// ---------------------------------------------------------------- clouds between the peaks
{
  const mat = facetMat(
    new THREE.MeshStandardMaterial({
      color: 0xfff1ec,
      emissive: 0xffc2b0,
      emissiveIntensity: 0.3,
      roughness: 1,
      flatShading: true,
    }),
  );
  const groups = [];
  [
    [-40, 24, -58, 3.6],
    [34, 28, -66, 4.0],
    [-72, 32, 8, 3.4],
    [66, 22, 26, 3.6],
    [-8, 40, -80, 4.4],
    [76, 36, -24, 3.4],
    [-30, 30, 52, 3.2],
  ].forEach(([x, y, z, s], i) => {
    const g = new THREE.Group();
    cloudPuffs(g, 5, s, mat, SEED + i * 5);
    g.position.set(x, y, z);
    g.lookAt(0, y, 0);
    ground.add(g);
    groups.push({ g, x, z, i });
  });
  onFrame((t) => groups.forEach((c) => (c.g.position.x = c.x + Math.sin(t * 0.04 + c.i) * 3)));
}

void M;
finishSet({ ground: 0x86b852 });
export { sky };
