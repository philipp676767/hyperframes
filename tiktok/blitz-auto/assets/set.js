// Set of #29 "Blitz ins Auto": a country road at night in a thunderstorm.
// Wet asphalt that mirrors the sky, white roadside posts, a yellow town
// sign, a lone street lamp, hay bales in the fields, a lone oak, a village
// with a few lit windows and a church tower far behind, two high-voltage
// pylons on the ridge (hero piece), and a heavy storm-cloud deck overhead
// that lights up from inside. Life: rain, swaying trees, sheet lightning.
// storm.flash(k) (called by scene.js every frame) turns the whole world
// bright for a lightning strike.
import { THREE, flat, M, ground, scene, onFrame, rng, V, facet, facetMat } from "./world.js";
import {
  SKIES,
  setSky,
  finishSet,
  terrain,
  pathStrip,
  tree,
  pine,
  rocks,
  cloudPuffs,
  F,
  add,
} from "./environments.js";
import { place, bush, lamp, fence } from "./props.js";

const SEED = 29;
// analogy spots (scene.js builds its sets there)
export const CAB = [34, 0, 20]; // the roofless convertible on a field lane

// ---------------------------------------------------------------- light
// stormy night: deep violet-blue, the horizon a dim teal glow under the
// clouds, cool moonlight; fog close so the far layer sinks into the rain
const sky = setSky({
  ...SKIES.nacht,
  top: [0.05, 0.05, 0.14],
  mid: [0.12, 0.12, 0.27],
  hor: [0.26, 0.3, 0.42],
  below: [0.1, 0.11, 0.2],
  sun: [0.4, 0.45, 0.7],
  sunDir: [0.4, 0.25, -1],
  stars: 0,
  clouds: 0,
  birds: false,
  hemi: [0x9aa8e8, 0x232a3e, 1.25],
  key: [0xb4c2ff, 1.55],
  keyPos: [-5, 12, 7],
  rim: [0x8f7dff, 1.3],
  fog: [26, 92],
});

// ---------------------------------------------------------------- ground
// flat around the road and the fields, rolling hills further out, a ridge
// behind for the pylons
const height = (x, z, d) => {
  if (d < 40) return 0;
  const v = Math.sin(x * 0.19 + 2) * Math.cos(z * 0.15 - 1) * 0.5 + 0.5;
  return ((d - 40) / 35) * 7 * (0.4 + 0.6 * v);
};
terrain(0x3f6b3a, { seed: SEED, height, amt: 0.13, scale: 0.09, warm: 0.2 });
// fields: dark ploughed earth and paler stubble, in strips beside the road
const fieldMat = (c) => facetMat(flat(c));
function field(x0, x1, z0, z1, color, rows, seed) {
  const w = x1 - x0;
  const d = z1 - z0;
  const geo = facet(
    new THREE.PlaneGeometry(w, d, Math.ceil(w / 1.6), Math.ceil(d / 1.6)),
    0.09,
    seed,
  );
  geo.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(geo, fieldMat(color));
  m.position.set((x0 + x1) / 2, 0.012, (z0 + z1) / 2);
  m.receiveShadow = true;
  ground.add(m);
  // furrows: low ridges along x
  if (rows) {
    const rm = flat(new THREE.Color(color).multiplyScalar(0.78).getHex());
    const n = Math.floor(d / 0.9);
    const ridge = new THREE.InstancedMesh(new THREE.BoxGeometry(w, 0.08, 0.22), rm, n);
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      o.position.set((x0 + x1) / 2, 0.05, z0 + 0.45 + i * 0.9);
      o.updateMatrix();
      ridge.setMatrixAt(i, o.matrix);
    }
    ridge.receiveShadow = true;
    ground.add(ridge);
  }
}
field(-30, -6, 4.6, 16, 0x5a3f2c, true, 1);
field(6, 30, 4.6, 14, 0x9a8a4a, false, 2);
field(-28, -7, -14, -5.2, 0x8f8442, false, 3);
field(8, 26, -16, -5.2, 0x52402e, true, 4);

// the road: wet asphalt (low roughness = it mirrors the sky and the lights)
export const ROAD_Z = -1.1;
{
  const pts = [];
  for (let x = -70; x <= 70; x += 10)
    pts.push([x, ROAD_Z + Math.sin(x * 0.02) * (Math.abs(x) > 20 ? 2 : 0)]);
  const road = pathStrip(pts, { width: 4.6, color: 0x2c2f38, lift: 0.03, seed: SEED });
  road.material.roughness = 0.22;
  road.material.metalness = 0.15;
  // shoulders: gravel
  pathStrip(pts, { width: 5.6, color: 0x5d5a55, lift: 0.02, seed: SEED + 1 });
  // centre dashes + edge lines
  const white = flat(0xe9ecf2, { roughness: 0.4, emissive: 0x30343c, emissiveIntensity: 0.4 });
  const dashes = new THREE.InstancedMesh(new THREE.BoxGeometry(1.4, 0.02, 0.12), white, 40);
  const o = new THREE.Object3D();
  for (let i = 0; i < 40; i++) {
    o.position.set(-60 + i * 3, 0.045, ROAD_Z);
    o.updateMatrix();
    dashes.setMatrixAt(i, o.matrix);
  }
  ground.add(dashes);
  for (const s of [-1, 1]) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(120, 0.02, 0.1), white);
    line.position.set(0, 0.044, ROAD_Z + s * 2.05);
    ground.add(line);
  }
  // puddles: glossy dark patches that catch the lightning
  const pud = new THREE.MeshStandardMaterial({ color: 0x1c2234, roughness: 0.04, metalness: 0.3 });
  const r = rng(SEED + 5);
  for (let i = 0; i < 14; i++) {
    const g = new THREE.CircleGeometry(1, 10);
    g.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(g, pud);
    const x = -22 + r() * 44;
    if (Math.abs(x) < 2.6) continue;
    m.position.set(x, 0.05, ROAD_Z + (r() - 0.5) * 3.4);
    m.scale.set(0.5 + r() * 0.9, 1, 0.3 + r() * 0.4);
    ground.add(m);
  }
}

// ---------------------------------------------------------------- near ring
// white roadside posts (Leitpfosten) with a black band and an orange reflector
{
  const post = flat(0xf2f2ee, { roughness: 0.5 });
  const band = flat(0x1d1d22);
  const refl = flat(0xff9a2e, { emissive: 0xff7a10, emissiveIntensity: 1.6 });
  const reflW = flat(0xffffff, { emissive: 0xdde6ff, emissiveIntensity: 1.2 });
  for (let x = -54; x <= 54; x += 6) {
    for (const s of [-1, 1]) {
      const z = ROAD_Z + s * 2.9;
      if (Math.abs(x) < 3 && s > 0) continue;
      const g = new THREE.Group();
      const p = F(new THREE.BoxGeometry(0.14, 1.0, 0.14), post, 0.05, x + s);
      p.position.y = 0.5;
      p.castShadow = true;
      g.add(p);
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.22, 0.15), band);
      b.position.y = 0.82;
      g.add(b);
      const rf = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.06), s > 0 ? refl : reflW);
      rf.position.set(0, 0.82, 0);
      g.add(rf);
      g.position.set(x, 0, z);
      ground.add(g);
    }
  }
}

// yellow town sign "Donnerbach" on the right verge behind the car
function townSign() {
  const g = new THREE.Group();
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 300;
  const x = c.getContext("2d");
  x.fillStyle = "#ffd02a";
  x.fillRect(0, 0, 512, 300);
  x.lineWidth = 16;
  x.strokeStyle = "#1c1c22";
  x.strokeRect(14, 14, 484, 272);
  x.fillStyle = "#1c1c22";
  x.font = "800 92px Montserrat, sans-serif";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.fillText("Donner-", 256, 112);
  x.fillText("bach", 256, 206);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 0.88),
    new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.5,
      emissive: 0x4a3a10,
      emissiveIntensity: 0.25,
    }),
  );
  face.position.set(0, 2.0, 0.05);
  g.add(face);
  const back = new THREE.Mesh(
    new THREE.BoxGeometry(1.56, 0.94, 0.06),
    flat(0x9aa3ad, { metalness: 0.4 }),
  );
  back.position.set(0, 2.0, 0);
  g.add(back);
  for (const sx of [-0.55, 0.55]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.5, 6), M.steel);
    pole.position.set(sx, 1.25, -0.05);
    pole.castShadow = true;
    g.add(pole);
  }
  return g;
}
place(townSign(), -9.5, 2.4, Math.PI / 2 - 0.25);

// the lone street lamp right next to the parked car, warm pool of light
{
  const l = place(lamp({ on: true, h: 4.2 }), -3.2, 2.6, 0, 1.05);
  const pl = new THREE.PointLight(0xffc27a, 9, 11, 1.6);
  pl.position.set(-3.2, 4.4, 2.6);
  ground.add(pl);
  l.userData.light = pl;
}

// round hay bales in the stubble field, a few wrapped in white
{
  const hay = flat(0xd9b45a);
  const wrap = flat(0xf0f0ea, { roughness: 0.35 });
  const r = rng(SEED + 7);
  const spots = [
    [10, 7.5],
    [13.5, 9.8],
    [17, 6.8],
    [21, 10.5],
    [-12, -8.5],
    [-17, -10],
    [-22, -7.5],
  ];
  spots.forEach(([x, z], i) => {
    const b = F(
      new THREE.CylinderGeometry(0.75, 0.75, 1.15, 12),
      i % 3 === 2 ? wrap : hay,
      0.08,
      i,
    );
    b.rotation.z = Math.PI / 2;
    b.rotation.y = r() * Math.PI;
    add(b, x, 0.75, z);
  });
}

// fences along the fields
place(fence(10, 0x6e5238), -16, 4.3);
place(fence(10, 0x6e5238), -26, 4.3);
place(fence(10, 0x6e5238), 13, -5.0);

// the lone oak in the field (lightning's other favourite target)
export const OAK = [11, 0, -9];
tree(OAK[0], OAK[2], 1.9, SEED + 1);
[
  [-14, -18, 1.5],
  [-6, -19, 1.3],
  [18, 15, 1.4],
  [-19, 12, 1.2],
  [26, -14, 1.3],
  [-30, 2, 1.4],
].forEach(([x, z, s], i) => tree(x, z, s, SEED + 10 + i));
[
  [-8, 7.5],
  [-12, -5.6],
  [-25, -4],
  [-6, 9.5],
].forEach(([x, z], i) => place(bush(SEED + i, 0x3f7a35), x, z));
rocks(10, 9, 28, SEED, M.rock);

// ---------------------------------------------------------------- hero piece
// two high-voltage lattice pylons on the ridge, wires sagging between them
function pylon() {
  const g = new THREE.Group();
  const steel = flat(0x9aa6b4, { roughness: 0.5, metalness: 0.55 });
  const H = 17;
  const bar = (a, b, r = 0.07) => {
    const d = b.clone().sub(a);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 5), steel);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
    m.castShadow = true;
    g.add(m);
  };
  const half = (y) => 1.8 * (1 - y / H) + 0.35;
  const corner = (y, sx, sz) => V(sx * half(y), y, sz * half(y));
  const C = [
    [1, 1],
    [1, -1],
    [-1, -1],
    [-1, 1],
  ];
  for (const [sx, sz] of C) bar(corner(0, sx, sz), corner(H, sx, sz), 0.1);
  for (let y = 0; y < H - 1; y += 2.4) {
    for (let i = 0; i < 4; i++) {
      const [ax, az] = C[i];
      const [bx, bz] = C[(i + 1) % 4];
      bar(corner(y, ax, az), corner(y + 2.4, bx, bz), 0.05);
      bar(corner(y + 2.4, ax, az), corner(y + 2.4, bx, bz), 0.05);
    }
  }
  // cross arms with insulators
  for (const [y, w] of [
    [H - 5, 4.2],
    [H - 1.6, 3.0],
  ]) {
    bar(V(-w, y, 0), V(w, y, 0), 0.09);
    bar(V(-w, y, 0), V(0, y + 1.2, 0), 0.05);
    bar(V(w, y, 0), V(0, y + 1.2, 0), 0.05);
    for (const s of [-1, 1]) {
      const ins = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.7, 6),
        flat(0x6c7a8a, { roughness: 0.3 }),
      );
      ins.position.set(s * w, y - 0.35, 0);
      g.add(ins);
    }
  }
  // red aviation light on top
  const top = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 8, 6),
    flat(0xff2a2a, { emissive: 0xff2020, emissiveIntensity: 2 }),
  );
  top.position.y = H + 1.3;
  g.add(top);
  g.userData.top = top;
  g.userData.arms = [
    [H - 5, 4.2],
    [H - 1.6, 3.0],
  ];
  return g;
}
const PYL = [
  [-16, -30],
  [12, -36],
];
const pylons = PYL.map(([x, z]) => {
  const p = pylon();
  p.position.set(x, height(x, z, Math.hypot(x, z)) - 0.2, z);
  p.rotation.y = Math.atan2(PYL[1][0] - PYL[0][0], PYL[1][1] - PYL[0][1]) + Math.PI / 2;
  ground.add(p);
  return p;
});
{
  // sagging wires between the pylons and off to both sides
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x1a1d26 });
  const ends = (p, s, y) => V(s, y, 0).applyMatrix4(p.matrixWorld);
  pylons.forEach((p) => p.updateMatrixWorld(true));
  const sag = (a, b, dip) => {
    const pts = [];
    for (let i = 0; i <= 20; i++) {
      const k = i / 20;
      pts.push(
        a
          .clone()
          .lerp(b, k)
          .add(V(0, -dip * 4 * k * (1 - k), 0)),
      );
    }
    const m = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.035, 4),
      wireMat,
    );
    ground.add(m);
  };
  for (const [y, w] of pylons[0].userData.arms)
    for (const s of [-1, 1]) {
      const a = ends(pylons[0], s * w, y - 0.7);
      const b = ends(pylons[1], s * w, y - 0.7);
      sag(a, b, 2.2);
      const dir = b.clone().sub(a).normalize();
      sag(
        a,
        a
          .clone()
          .addScaledVector(dir, -30)
          .add(V(0, 3, 0)),
        2.6,
      );
      sag(
        b,
        b
          .clone()
          .addScaledVector(dir, 30)
          .add(V(0, 3, 0)),
        2.6,
      );
    }
}

// ---------------------------------------------------------------- far layer
// the village of Donnerbach behind the fields: houses, a few lit windows,
// the church tower
{
  const r = rng(SEED + 11);
  const walls = [0xd8cfc0, 0xc9b9a5, 0xe2d8c8, 0xbfae9a];
  const roofs = [0x7a3a32, 0x5e3a3a, 0x6a4a3a];
  const lit = flat(0xffd88a, { emissive: 0xffb84a, emissiveIntensity: 1.8 });
  const dark = flat(0x2a3040, { roughness: 0.3 });
  const house = (x, z, w, h, rot) => {
    const g = new THREE.Group();
    const body = F(new THREE.BoxGeometry(w, h, 2.6), flat(walls[Math.floor(r() * 4)]), 0.06, x);
    body.position.y = h / 2;
    body.castShadow = true;
    g.add(body);
    const roofG = new THREE.CylinderGeometry(0.01, 1.75, w + 0.4, 4, 1);
    roofG.rotateZ(Math.PI / 2);
    roofG.rotateX(Math.PI / 4);
    const roof = F(roofG, flat(roofs[Math.floor(r() * 3)]), 0.08, z);
    roof.scale.set(1, 0.85, 1.05);
    roof.position.y = h + 0.55;
    g.add(roof);
    for (let i = 0; i < Math.floor(w / 1.1); i++) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.5, 0.05), r() < 0.35 ? lit : dark);
      win.position.set(-w / 2 + 0.7 + i * 1.1, h * 0.6, 1.32);
      g.add(win);
    }
    g.position.set(x, height(x, z, Math.hypot(x, z)), z);
    g.rotation.y = rot;
    ground.add(g);
  };
  for (let i = 0; i < 9; i++) {
    const x = -44 + i * 4.3 + r() * 1.2;
    const z = -46 - r() * 6;
    house(x, z, 2.6 + r() * 1.2, 2.0 + r() * 1.2, (r() - 0.5) * 0.5);
  }
  // church: tall tower with a pointed roof and a lit clock face
  const cg = new THREE.Group();
  const tower = F(new THREE.BoxGeometry(2.0, 9, 2.0), flat(0xe6dccb), 0.05, 3);
  tower.position.y = 4.5;
  tower.castShadow = true;
  cg.add(tower);
  const spire = F(new THREE.ConeGeometry(1.5, 5, 4), flat(0x3f5a4a), 0.08, 4);
  spire.rotation.y = Math.PI / 4;
  spire.position.y = 11.5;
  cg.add(spire);
  const clock = new THREE.Mesh(
    new THREE.CircleGeometry(0.55, 14),
    flat(0xfff1c8, { emissive: 0xffd27a, emissiveIntensity: 1.2 }),
  );
  clock.position.set(0, 7.4, 1.02);
  cg.add(clock);
  const nave = F(new THREE.BoxGeometry(3.4, 4, 7), flat(0xd8cfc0), 0.05, 5);
  nave.position.set(0, 2, -4.4);
  cg.add(nave);
  cg.position.set(-26, height(-26, -50, Math.hypot(26, 50)), -50);
  ground.add(cg);
}
// tree line on the hills all around
{
  const r = rng(SEED + 12);
  for (let i = 0; i < 46; i++) {
    const a = (i / 46) * Math.PI * 2 + r() * 0.1;
    const d = 46 + r() * 16;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    if (z < -42 && x > -48 && x < 0) continue; // keep the village free
    const p = pine(x, z, 1.6 + r() * 1.2, SEED + 40 + i);
    p.position.y = height(x, z, d);
  }
}

// ---------------------------------------------------------------- storm clouds
// a heavy, low deck of dark cumulus over the whole valley; its insides
// light up (sheet lightning) and flare with every strike
const cloudMat = facetMat(
  new THREE.MeshStandardMaterial({
    color: 0x3a3f5c,
    emissive: 0x9aa8ff,
    emissiveIntensity: 0.0,
    roughness: 1,
    flatShading: true,
    fog: false,
  }),
);
const cloudMat2 = facetMat(
  new THREE.MeshStandardMaterial({
    color: 0x2c3048,
    emissive: 0xb8c4ff,
    emissiveIntensity: 0.0,
    roughness: 1,
    flatShading: true,
    fog: false,
  }),
);
const cloudGroups = [];
{
  const r = rng(SEED + 20);
  for (let i = 0; i < 42; i++) {
    const g = new THREE.Group();
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * 60;
    g.position.set(Math.cos(a) * d, 20 + r() * 5, Math.sin(a) * d - 6);
    const mat = i % 3 ? cloudMat : cloudMat2;
    cloudPuffs(g, 4 + Math.floor(r() * 4), 4.5 + r() * 3, mat, SEED * 3 + i);
    g.scale.y = 0.75;
    g.rotation.y = r() * Math.PI;
    g.userData.ph = r() * 10;
    scene.add(g);
    cloudGroups.push(g);
  }
}
// slow churn of the deck
onFrame((t) => {
  for (const g of cloudGroups) g.position.x += Math.sin(t * 0.05 + g.userData.ph) * 0.002;
});

// ---------------------------------------------------------------- rain
// streaks falling through a box around the stage (and the convertible's
// field), pure function of t
function rain(n, cx, cz, w, d, h, seed) {
  const mat = new THREE.MeshBasicMaterial({
    color: 0xc8d6ff,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  });
  const geo = new THREE.BoxGeometry(0.012, 0.42, 0.012);
  const mesh = new THREE.InstancedMesh(geo, mat, n);
  mesh.frustumCulled = false;
  mesh.userData.noAO = true;
  const r = rng(seed);
  const P = [];
  for (let i = 0; i < n; i++)
    P.push([cx + (r() - 0.5) * w, cz + (r() - 0.5) * d, r(), 0.8 + r() * 0.4]);
  const o = new THREE.Object3D();
  o.rotation.z = 0.12; // a little wind
  onFrame((t) => {
    for (let i = 0; i < n; i++) {
      const [x, z, ph, sp] = P[i];
      const k = (t * 1.6 * sp + ph) % 1;
      const y = h * (1 - k);
      o.position.set(x + k * 0.9, y, z);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });
  scene.add(mesh);
  return mesh;
}
rain(2600, 0, 0, 26, 24, 12, SEED + 30);
rain(900, CAB[0], CAB[2], 14, 12, 9, SEED + 31);

// splashes on the road and the car: tiny rings popping at seeded spots
{
  const n = 260;
  const mat = new THREE.MeshBasicMaterial({
    color: 0xdfe8ff,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
  });
  const mesh = new THREE.InstancedMesh(
    new THREE.RingGeometry(0.05, 0.08, 8).rotateX(-Math.PI / 2),
    mat,
    n,
  );
  mesh.userData.noAO = true;
  const r = rng(SEED + 32);
  const P = [];
  for (let i = 0; i < n; i++) P.push([(r() - 0.5) * 22, ROAD_Z + (r() - 0.5) * 6, r()]);
  const o = new THREE.Object3D();
  onFrame((t) => {
    for (let i = 0; i < n; i++) {
      const [x, z, ph] = P[i];
      const k = (t * 2.2 + ph) % 1;
      o.position.set(x, 0.06, z);
      o.scale.setScalar(0.4 + k * 2.2);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mat.opacity = 0.45;
  });
  scene.add(mesh);
}

// ---------------------------------------------------------------- the flash
// k 0..1 = how bright the strike is right now; sheet = sheet lightning
// glowing inside the clouds. A strong cold light from above lights the whole
// world, the sky turns pale violet, the cloud deck flares.
const skyMesh = scene.children.find(
  (o) => o.material && o.material.uniforms && o.material.uniforms.top,
);
const base = {
  top: skyMesh.material.uniforms.top.value.clone(),
  mid: skyMesh.material.uniforms.mid.value.clone(),
  hor: skyMesh.material.uniforms.hor.value.clone(),
};
const flashLight = new THREE.DirectionalLight(0xe4e8ff, 0);
flashLight.position.set(4, 30, 6);
scene.add(flashLight);
const flashFill = new THREE.HemisphereLight(0xdfe4ff, 0x404660, 0);
scene.add(flashFill);
const bright = V(0.62, 0.6, 0.9);
export const storm = {
  flash(k, sheet = 0) {
    flashLight.intensity = 7 * k;
    flashFill.intensity = 2.2 * k + 0.6 * sheet;
    const u = skyMesh.material.uniforms;
    u.top.value.copy(base.top).lerp(bright, Math.min(1, k * 0.8 + sheet * 0.25));
    u.mid.value.copy(base.mid).lerp(bright, Math.min(1, k * 0.9 + sheet * 0.3));
    u.hor.value.copy(base.hor).lerp(bright, Math.min(1, k * 0.7 + sheet * 0.2));
    cloudMat.emissiveIntensity = 0.12 + 1.6 * k + 0.9 * sheet;
    cloudMat2.emissiveIntensity = 0.08 + 1.3 * k + 0.7 * sheet;
  },
};
// pylon lights blink
onFrame((t) => {
  for (const p of pylons)
    p.userData.top.material.emissiveIntensity = (t * 0.8) % 1 < 0.5 ? 2.4 : 0.3;
});

finishSet({ ground: 0x3f6b3a });
export { sky };
