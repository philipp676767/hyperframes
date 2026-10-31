// #42 Tattoo — "Dein Körper will dein Tattoo auffressen. Jeden Tag."
// STUDIO (origin): your forearm with a rose-and-dagger tattoo on a black
// arm rest; a gloved hand with a pen machine. HAUT (under the floor): a cut
// through the skin — epidermis roof that renews and flakes, the dermis as an
// open "aquarium" with ink blobs, collagen and a blood vessel, a fat floor;
// green scavenger cells (Fresszellen) with jaws and eyes that swallow ink,
// get stuck, die and hand it on; the sun, a layer of cream, a lymph vessel
// to a lymph node that turns colourful.
import {
  THREE,
  ramp,
  smooth,
  clamp01,
  lerp,
  outBack,
  pop,
  V,
  rng,
  scene,
  camera,
  flat,
  facet,
  facetMat,
  patches,
  jitter,
  showNope,
  makeArrowSet,
  animateArrows,
  forceMat,
  showPanel,
  LED,
  labels,
  puff,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import "./set.js";
import { T, STROKES, shots, LABELS, HIGHLIGHTS, HAUT, B0, NODE, CELL0, CELL_REL } from "./beats.js";

highlights(HIGHLIGHTS);
const PI = Math.PI;
const _c = new THREE.Color();
const _v = V(0, 0, 0);
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = V(1, 1, 1);
const between = (t, a, b) => t >= a && t < b;

// ---------------------------------------------------------------- tattoo design
// rose with a dagger through it, leaves, two little stars — bold old-school lines
function drawDesign(g, cx, cy, s) {
  g.save();
  g.translate(cx, cy);
  g.scale(s, s);
  g.lineJoin = "round";
  g.lineCap = "round";
  const ink = "#15121c";
  // dagger blade + guard + grip
  g.fillStyle = "#cfd6e2";
  g.beginPath();
  g.moveTo(0, 250);
  g.lineTo(-26, -40);
  g.lineTo(26, -40);
  g.closePath();
  g.fill();
  g.lineWidth = 11;
  g.strokeStyle = ink;
  g.stroke();
  g.lineWidth = 5;
  g.beginPath();
  g.moveTo(0, 230);
  g.lineTo(0, -30);
  g.stroke();
  g.fillStyle = "#e8b21c";
  g.fillRect(-70, -62, 140, 26);
  g.lineWidth = 10;
  g.strokeRect(-70, -62, 140, 26);
  g.fillStyle = "#6a2f18";
  g.fillRect(-18, -170, 36, 108);
  g.strokeRect(-18, -170, 36, 108);
  g.fillStyle = "#e8b21c";
  g.beginPath();
  g.arc(0, -190, 24, 0, 7);
  g.fill();
  g.stroke();
  // leaves
  g.fillStyle = "#2c8a3c";
  for (const sx of [-1, 1]) {
    g.beginPath();
    g.ellipse(sx * 92, 70, 66, 28, sx * 0.55, 0, 7);
    g.fill();
    g.lineWidth = 10;
    g.stroke();
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(sx * 40, 50);
    g.lineTo(sx * 140, 92);
    g.stroke();
  }
  // rose
  g.fillStyle = "#d4202f";
  g.beginPath();
  g.arc(0, 18, 92, 0, 7);
  g.fill();
  g.lineWidth = 12;
  g.stroke();
  g.fillStyle = "#f04a52";
  g.beginPath();
  g.arc(-10, 4, 52, 0, 7);
  g.fill();
  g.lineWidth = 8;
  g.beginPath();
  for (let a = 0; a < 15; a += 0.15) g.lineTo(Math.cos(a) * a * 4.6, 10 + Math.sin(a) * a * 4.2);
  g.stroke();
  for (const [x, y, rr] of [
    [-62, 40, 34],
    [58, 46, 30],
    [0, 82, 26],
  ]) {
    g.beginPath();
    g.arc(x, y, rr, 0.3, 2.8);
    g.stroke();
  }
  // stars
  g.fillStyle = "#e8b21c";
  for (const [x, y] of [
    [-120, -120],
    [118, -60],
  ]) {
    g.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -PI / 2 + (i * PI) / 5;
      const rr = i % 2 ? 11 : 26;
      g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    g.closePath();
    g.fill();
    g.lineWidth = 6;
    g.stroke();
  }
  g.restore();
}
function canvasTex(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

// ================================================================ STUDIO
const SKIN = 0xf2bb9a;
const skinMat = flat(SKIN, { roughness: 0.62 });
const skinSmooth = new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.55 });
{
  // arm rest: chrome pole, base, black pad along z
  const chrome = flat(0xd8dde4, { metalness: 0.9, roughness: 0.18 });
  const leather = flat(0x141216, { roughness: 0.3 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.9, 10), chrome);
  pole.position.set(0, 0.45, 0.1);
  pole.castShadow = true;
  scene.add(pole);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.85, 0.1, 16), chrome);
  base.position.set(0, 0.05, 0.1);
  scene.add(base);
  const pad = new THREE.Mesh(
    facet(new THREE.BoxGeometry(1.0, 0.2, 3.5, 4, 1, 10), 0.03, 2),
    facetMat(leather),
  );
  pad.position.set(0, 0.97, 0.1);
  pad.castShadow = pad.receiveShadow = true;
  scene.add(pad);
}
// the forearm (built along +x in armG, turned so the fist points to +z)
const armG = new THREE.Group();
armG.rotation.y = -PI / 2;
armG.position.set(0, 0, 0.1);
scene.add(armG);
const AY = 1.38; // arm axis height
const rAt = (X) => 0.32 + ((1.3 - X) / 3.0) * 0.1;
const TH0 = PI / 2 - 1.2;
const THL = 2.4;
{
  const g = new THREE.CylinderGeometry(0.42, 0.32, 3.0, 40, 6);
  const arm = new THREE.Mesh(g, skinSmooth);
  arm.rotation.z = PI / 2;
  arm.scale.x = 0.88;
  arm.position.set(-0.2, AY, 0);
  arm.castShadow = arm.receiveShadow = true;
  armG.add(arm);
  // fist + thumb at the wrist
  const fist = new THREE.Mesh(
    facet(jitter(new THREE.BoxGeometry(0.62, 0.5, 0.6, 2, 2, 2), 0.04, 5), 0.05, 5),
    facetMat(skinMat),
  );
  fist.position.set(1.55, AY - 0.02, 0.02);
  fist.castShadow = true;
  armG.add(fist);
  for (let i = 0; i < 4; i++) {
    const k = new THREE.Mesh(new THREE.SphereGeometry(0.1, 7, 5), skinMat);
    k.position.set(1.84, AY + 0.14, -0.22 + i * 0.15);
    armG.add(k);
  }
  const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.26, 3, 6), skinMat);
  thumb.rotation.z = PI / 2.4;
  thumb.position.set(1.6, AY + 0.12, 0.33);
  armG.add(thumb);
  // pushed-up hoodie sleeve at the elbow
  const sleeve = new THREE.Mesh(
    facet(jitter(new THREE.CylinderGeometry(0.55, 0.5, 0.9, 12, 2), 0.04, 6), 0.08, 6),
    facetMat(flat(0x3a3f55, { roughness: 0.9 })),
  );
  sleeve.rotation.z = PI / 2;
  sleeve.position.set(-1.95, AY + 0.02, 0);
  sleeve.castShadow = true;
  armG.add(sleeve);
}
// the tattoo: a patch of the same cylinder, a bit bigger, with the design
const tatTex = canvasTex(320, 1152, (g) => drawDesign(g, 160, 600, 0.95));
const tatMat = new THREE.MeshStandardMaterial({
  map: tatTex,
  transparent: true,
  alphaTest: 0.05,
  roughness: 0.4,
  polygonOffset: true,
  polygonOffsetFactor: -2,
});
{
  const g = new THREE.CylinderGeometry(0.42 * 1.006, 0.32 * 1.006, 3.0, 40, 6, true, TH0, THL);
  const patch = new THREE.Mesh(g, tatMat);
  patch.rotation.z = PI / 2;
  patch.scale.x = 0.88;
  patch.position.set(-0.2, AY, 0);
  armG.add(patch);
}
// a point on the arm surface (armG local) at axis position X and angle th
const armPoint = (X, th, lift = 0) => {
  const r = rAt(X) + lift;
  return V(X, AY + 0.88 * r * Math.sin(th), r * Math.cos(th));
};
// sparkles over the healed tattoo
const sparkMat = flat(0xffffff, { emissive: 0xfff3c0, emissiveIntensity: 3 });
const sparks = [
  [-0.45, 1.3],
  [0.25, 1.75],
  [0.6, 1.25],
  [-0.1, 1.95],
].map(([X, th]) => {
  const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.07, 0), sparkMat);
  m.position.copy(armPoint(X, th, 0.06));
  m.scale.set(0.001, 0.001, 0.001);
  armG.add(m);
  return m;
});

// ---------------------------------------------------------------- the scavenger cell (shared builder)
const CELL_GREEN = 0xa6e36a;
function makeCell(seed) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: CELL_GREEN,
    roughness: 0.35,
    flatShading: true,
    transparent: true,
    opacity: 0.74,
    side: THREE.DoubleSide,
    emissive: 0x2a4a10,
    emissiveIntensity: 0.25,
  });
  const lower = new THREE.Mesh(
    jitter(new THREE.SphereGeometry(0.5, 12, 6, 0, 2 * PI, PI / 2, PI / 2), 0.03, seed),
    mat,
  );
  g.add(lower);
  const jaw = new THREE.Group();
  jaw.position.set(0, 0, -0.42);
  g.add(jaw);
  const upper = new THREE.Mesh(
    jitter(new THREE.SphereGeometry(0.5, 12, 6, 0, 2 * PI, 0, PI / 2), 0.03, seed + 1),
    mat,
  );
  upper.position.set(0, 0, 0.42);
  jaw.add(upper);
  // mouth inside: dark red
  const mouth = new THREE.Mesh(
    new THREE.CircleGeometry(0.46, 12),
    flat(0x6a1428, { side: THREE.DoubleSide }),
  );
  mouth.rotation.x = -PI / 2;
  mouth.position.y = 0.005;
  g.add(mouth);
  // eyes on the upper half
  const eyes = new THREE.Group();
  upper.add(eyes);
  const white = flat(0xffffff, { roughness: 0.3 });
  const black = flat(0x111111, { roughness: 0.2 });
  for (const sx of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), white);
    e.position.set(sx * 0.17, 0.33, 0.3);
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), black);
    p.position.set(0, 0.01, 0.09);
    e.add(p);
    eyes.add(e);
  }
  // nucleus (seen through the membrane)
  const nuc = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.17, 1),
    flat(0x7a3aa8, { roughness: 0.4 }),
  );
  nuc.position.set(0.05, -0.2, -0.18);
  g.add(nuc);
  // little pseudopods
  const feet = [];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * 2 * PI + 0.6;
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.32, 6), mat);
    f.position.set(Math.cos(a) * 0.46, -0.12, Math.sin(a) * 0.46 - 0.05);
    f.rotation.set(Math.sin(a) * 1.4, 0, -Math.cos(a) * 1.4);
    g.add(f);
    feet.push(f);
  }
  g.userData = { mat, jaw, eyes, feet, seed };
  return g;
}
// pose a cell: open 0..1, scale, tint (0 green → 1 stuffed dark), dead (0..1 grey), t for life
function poseCell(c, t, { open = 0, s = 1, stuffed = 0, dead = 0 }) {
  const u = c.userData;
  u.jaw.rotation.x = -open * 0.95;
  _c.setHex(CELL_GREEN)
    .lerp(_c.clone().setHex(0x5e7a3c), stuffed)
    .lerp(_c.clone().setHex(0x9a9a92), dead);
  u.mat.color.copy(_c);
  const w = Math.sin(t * 5 + u.seed) * 0.03 + (dead > 0 ? Math.sin(t * 40) * 0.05 * dead : 0);
  c.scale.set(s * (1 + w), s * (1 - w), s * (1 + w));
  u.eyes.scale.set(1, Math.max(0.1, 1 - dead * 0.9), 1);
  u.feet.forEach((f, i) => (f.scale.y = 1 + 0.25 * Math.sin(t * 6 + i * 1.7 + u.seed)));
}

// mini scavengers nibbling at the tattoo (hook)
const MINI = [
  [-0.45, 1.25, 0.7],
  [0.05, 1.85, -1.1],
  [0.55, 1.4, 2.6],
  [-0.15, 1.05, -0.4],
  [0.35, 2.05, 1.9],
].map(([X, th, yaw], i) => {
  const c = makeCell(10 + i);
  const n = V(0, Math.sin(th), Math.cos(th)).normalize();
  c.position.copy(armPoint(X, th, 0.035));
  c.quaternion
    .setFromUnitVectors(V(0, 1, 0), n)
    .multiply(_q.clone().setFromAxisAngle(V(0, 1, 0), yaw));
  c.userData.X = X;
  c.userData.th = th;
  c.userData.yaw = yaw;
  armG.add(c);
  return c;
});

// the tattoo machine (pen style) in a black-gloved hand
const machine = new THREE.Group();
armG.add(machine);
const TIP = armPoint(0.1, PI / 2, 0.0);
machine.position.copy(TIP);
machine.quaternion.setFromUnitVectors(V(0, 1, 0), V(-0.3, 1, 0.55).normalize());
const needleM = new THREE.Group();
machine.add(needleM);
{
  const chrome = flat(0xe0e4ea, { metalness: 0.95, roughness: 0.12 });
  const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.002, 0.16, 6), chrome);
  needle.position.y = 0.08;
  needleM.add(needle);
  const cart = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.022, 0.26, 10),
    new THREE.MeshStandardMaterial({
      color: 0xbfe8ff,
      roughness: 0.1,
      transparent: true,
      opacity: 0.55,
    }),
  );
  cart.position.y = 0.26;
  machine.add(cart);
  const grip = new THREE.Mesh(
    facet(new THREE.CylinderGeometry(0.075, 0.065, 0.42, 12), 0.05, 2),
    facetMat(flat(0x1a1a20, { roughness: 0.6 })),
  );
  grip.position.y = 0.6;
  machine.add(grip);
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.085, 0.08, 0.6, 14),
    flat(0x7a3ad8, { metalness: 0.6, roughness: 0.3 }),
  );
  body.position.y = 1.1;
  machine.add(body);
  for (const y of [0.82, 1.38]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.087, 0.012, 5, 14), chrome);
    ring.rotation.x = PI / 2;
    ring.position.y = y;
    machine.add(ring);
  }
  const cable = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        V(0, 1.4, 0),
        V(0.05, 1.8, 0.1),
        V(0.3, 2.2, 0.5),
        V(0.8, 2.4, 1.2),
      ]),
      20,
      0.018,
      5,
    ),
    flat(0x111111),
  );
  machine.add(cable);
  // gloved fingers wrapped around the grip
  const glove = flat(0x1c1c24, { roughness: 0.35 });
  const palm = new THREE.Mesh(
    facet(jitter(new THREE.SphereGeometry(0.2, 9, 7), 0.02, 3), 0.06, 3),
    facetMat(glove),
  );
  palm.scale.set(1.1, 1.2, 0.8);
  palm.position.set(0.02, 0.86, -0.17);
  machine.add(palm);
  for (let i = 0; i < 3; i++) {
    const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.2, 3, 6), glove);
    f.position.set(0.08 - i * 0.07, 0.56 + i * 0.1, 0.07);
    f.rotation.set(0.3, 0, 1.25);
    machine.add(f);
  }
  const wrist = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.5, 9), glove);
  wrist.position.set(0.05, 1.05, -0.38);
  wrist.rotation.x = -0.9;
  machine.add(wrist);
}
// ink mist at the needle tip
const mistMat = new THREE.MeshBasicMaterial({
  color: 0x1a1430,
  transparent: true,
  opacity: 0.5,
  depthWrite: false,
});
const mist = Array.from({ length: 6 }, (_, i) => {
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.02, 0), mistMat);
  m.userData.a = (i / 6) * 2 * PI;
  armG.add(m);
  return m;
});

// ================================================================ HAUT
const haut = new THREE.Group();
haut.position.set(...HAUT);
scene.add(haut);
const hr = rng(4242);
function backdrop(parent, r, top, bottom) {
  const g = new THREE.SphereGeometry(r, 32, 16);
  const p = g.attributes.position;
  const col = new Float32Array(p.count * 3);
  const a = new THREE.Color(top);
  const b = new THREE.Color(bottom);
  for (let i = 0; i < p.count; i++) {
    const k = clamp01((p.getY(i) / r) * 0.7 + 0.5);
    _c.copy(b).lerp(a, k);
    col.set([_c.r, _c.g, _c.b], i * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const m = new THREE.Mesh(
    g,
    new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false }),
  );
  m.userData.noAO = true;
  parent.add(m);
  return m;
}
backdrop(haut, 42, 0x5a1224, 0x0e0307);
const hautLights = [
  [0xff9aa8, 40, [0, 7, 6]],
  [0xffc0a0, 26, [-6, 3, 6]],
  [0xffb0d0, 26, [7, 3, 6]],
  [0xfff0c8, 30, [10.5, 4, 4]],
].map(([c, i, p]) => {
  const l = new THREE.PointLight(c, i, 30, 1.2);
  l.position.set(...p);
  l.userData.base = i;
  l.userData.col = new THREE.Color(c);
  haut.add(l);
  return l;
});
const hAdd = (mesh, x, y, z) => {
  mesh.position.set(x, y, z);
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  haut.add(mesh);
  return mesh;
};
// fat floor (subcutis) with yellow globules
hAdd(
  new THREE.Mesh(
    patches(facet(new THREE.BoxGeometry(30, 0.8, 10, 30, 1, 10), 0.05, 1), { amt: 0.08, seed: 2 }),
    facetMat(flat(0xe8b85a, { roughness: 0.5 })),
  ),
  3,
  -0.3,
  -0.5,
);
{
  const N = 160;
  const fat = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.5, 1),
    flat(0xffffff, { roughness: 0.25, flatShading: true }),
    N,
  );
  for (let i = 0; i < N; i++) {
    const s = 0.35 + hr() * 0.45;
    _m.compose(
      V(-9 + hr() * 24, 0.0 + hr() * 0.1, -4.5 + hr() * 8.5),
      _q.identity(),
      _s.set(s, s * 0.8, s),
    );
    fat.setMatrixAt(i, _m);
    fat.setColorAt(i, _c.setRGB(0.95, 0.7 + hr() * 0.1, 0.3 + hr() * 0.12));
  }
  haut.add(fat);
}
// dermis back wall
hAdd(
  new THREE.Mesh(
    patches(facet(new THREE.BoxGeometry(30, 3.6, 0.6, 30, 4, 1), 0.06, 3), { amt: 0.1, seed: 5 }),
    facetMat(flat(0xc0505e, { roughness: 0.7 })),
  ),
  3,
  1.7,
  -4.6,
);
// collagen fibres
const fibreMat = flat(0xf3b3ba, { roughness: 0.5 });
for (let i = 0; i < 16; i++) {
  const y = 0.6 + hr() * 2.2;
  const z = -4 + hr() * 3.2;
  const ph = hr() * 6;
  const pts = [];
  for (let k = 0; k <= 30; k++) {
    const x = -9 + (k / 30) * 18;
    pts.push(V(x, y + Math.sin(x * 1.3 + ph) * 0.18, z + Math.cos(x * 0.9 + ph) * 0.25));
  }
  haut.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 90, 0.06 + hr() * 0.04, 6),
      fibreMat,
    ),
  );
}
// blood vessel with flowing red cells
const VESSEL = { y: 0.85, z: -2.2 };
{
  const v = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.34, 20, 16, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0xc8283a,
      roughness: 0.25,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    }),
  );
  v.rotation.z = PI / 2;
  hAdd(v, 1, VESSEL.y, VESSEL.z);
}
const NBLOOD = 34;
const blood = new THREE.InstancedMesh(
  new THREE.CylinderGeometry(0.13, 0.13, 0.05, 10),
  flat(0xe0283a, { roughness: 0.4 }),
  NBLOOD,
);
haut.add(blood);
const bloodPh = Array.from({ length: NBLOOD }, () => [hr(), hr() * 6, hr() * 6]);

// epidermis roof: three rows of flat cells, the top row flakes off
const EX = 32;
const EZ = 15;
const ER = 3;
const NE = EX * EZ * ER;
const epi = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.3, 1),
  flat(0xffffff, { roughness: 0.55, flatShading: true }),
  NE,
);
epi.frustumCulled = false;
haut.add(epi);
const EPI = [];
for (let row = 0; row < ER; row++)
  for (let ix = 0; ix < EX; ix++)
    for (let iz = 0; iz < EZ; iz++) {
      const x = -8 + ix * 0.5 + (row % 2) * 0.25 + (hr() - 0.5) * 0.06;
      const z = -4 + iz * 0.5 + (row % 2) * 0.25 + (hr() - 0.5) * 0.06;
      const y = 3.2 + row * 0.24;
      const i = EPI.length;
      EPI.push({
        x,
        y,
        z,
        row,
        d: hr() * 1.7,
        sx: hr() - 0.5,
        sz: hr() * 0.8,
        rot: hr() * 6,
        s: 0.92 + hr() * 0.14,
      });
      const k = row / 2;
      epi.setColorAt(i, _c.setRGB(lerp(0.86, 0.94, k), lerp(0.46, 0.7, k), lerp(0.48, 0.58, k)));
    }
// a skin base under the cells (closes the roof)
hAdd(
  new THREE.Mesh(new THREE.BoxGeometry(17, 0.2, 7.8), flat(0xd8737a, { roughness: 0.6 })),
  0,
  3.02,
  -0.4,
);
// tattoo seen from above, on the skin surface
const topTex = canvasTex(512, 512, (g) => drawDesign(g, 256, 256, 0.92));
const topMat = new THREE.MeshStandardMaterial({
  map: topTex,
  transparent: true,
  alphaTest: 0.05,
  roughness: 0.45,
  depthWrite: false,
});
const topTat = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 5.2), topMat);
topTat.rotation.x = -PI / 2;
hAdd(topTat, 0.3, 3.92, 0.2);
// ink dots stuck in the epidermis (would flake away)
const epiInk = Array.from({ length: 12 }, () => {
  const m = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.16 + hr() * 0.07, 0),
    flat(0x1b1f4a, { roughness: 0.3 }),
  );
  m.userData = { x: -1.8 + hr() * 3.8, y: 3.72 + hr() * 0.14, z: 1.2 + hr() * 1.8, d: hr() * 0.6 };
  haut.add(m);
  return m;
});

// ink blobs in the dermis
const NB = 34;
const inkMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.28,
  flatShading: true,
  emissive: 0x000000,
});
const inks = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), inkMat, NB);
inks.frustumCulled = false;
haut.add(inks);
const INK = [];
while (INK.length < NB) {
  const p = V(-3.4 + hr() * 6.8, 1.65 + hr() * 1.1, -2.3 + hr() * 3.6);
  if (INK.some((b) => b.p.distanceTo(p) < 0.62)) continue;
  if (p.distanceTo(V(...B0)) < 0.9) continue;
  if (Math.abs(p.x - 2.5) < 2.4 && p.z > 0 && p.y > 1.8) continue; // keep the relay lane clear
  const i = INK.length;
  INK.push({ p, r: 0.14 + hr() * 0.13, st: i % 4, rot: hr() * 6 });
  const cols = [0x1b1f4a, 0x1b1f4a, 0x15121c, 0xa8172a, 0x1f6a34];
  inks.setColorAt(i, _c.setHex(cols[i % cols.length]));
}
const heroInk = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.3, 1),
  new THREE.MeshStandardMaterial({
    color: 0x1b1f4a,
    roughness: 0.28,
    flatShading: true,
    emissive: 0x000000,
  }),
);
haut.add(heroInk);
// red warning ring around the hero blob
const warn = new THREE.Mesh(
  new THREE.TorusGeometry(0.55, 0.045, 6, 32),
  new THREE.MeshBasicMaterial({ color: 0xff2a3a, transparent: true, depthWrite: false }),
);
haut.add(warn);

// the needle in the skin world: three chrome needles from above
const bigNeedle = new THREE.Group();
haut.add(bigNeedle);
{
  const chrome = flat(0xe4e8ee, { metalness: 0.95, roughness: 0.12 });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * 2 * PI;
    const n = new THREE.Group();
    n.position.set(Math.cos(a) * 0.1, 0, Math.sin(a) * 0.1);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 7, 8), chrome);
    rod.position.y = 3.5 + 0.3;
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.32, 8), chrome);
    tip.rotation.x = PI;
    tip.position.y = 0.16;
    n.add(rod, tip);
    bigNeedle.add(n);
  }
  const drop = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 8, 6),
    flat(0x1b1f4a, { roughness: 0.2 }),
  );
  drop.position.y = 0.05;
  bigNeedle.add(drop);
}
const NEEDLE_XZ = [0.3, 0.9];

// cells in the dermis
const CELLS = Array.from({ length: 9 }, (_, i) => {
  const c = makeCell(100 + i * 7);
  c.scale.setScalar(0.001);
  haut.add(c);
  return c;
});
// homes after the swarm (C0 left of the hero blob, C1–C4 = the relay chain)
const Q = [
  [-0.9, 2.2, 1.0],
  [3.0, 2.5, 1.4],
  [2.1, 1.95, -0.4],
  [3.5, 2.2, 0.6],
  [4.9, 2.0, -0.2],
  [-2.6, 2.5, -0.9],
  [-3.8, 1.6, 0.6],
  [1.2, 1.25, -1.6],
  [-1.6, 1.3, -2.2],
];
const CS = 0.72; // cell size in the skin world
const C0_EAT = [B0[0] - 0.55, B0[1], B0[2]];
const C1_EAT = [C0_EAT[0] + 0.55, C0_EAT[1], C0_EAT[2]];
// relay: blob hops C1 → C2 → C3 → C4
const HOPS = [T.zelle1 - 0.15, T.zelle1 + 0.45, T.weiter];

// sun + rays, cream layer
const sun = new THREE.Group();
sun.position.set(-3.2, 9.4, 1.2);
haut.add(sun);
{
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.1, 1),
    flat(0xffd23f, { emissive: 0xffb020, emissiveIntensity: 2.2 }),
  );
  sun.add(core);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * 2 * PI;
    const sp = new THREE.Mesh(
      new THREE.ConeGeometry(0.22, 0.7, 5),
      flat(0xffe066, { emissive: 0xffc030, emissiveIntensity: 1.8 }),
    );
    sp.position.set(Math.cos(a) * 1.45, Math.sin(a) * 1.45, 0);
    sp.rotation.z = a - PI / 2;
    sun.add(sp);
  }
}
const rayTargets = [
  [-1.6, 2.4, 0.4],
  [-0.2, 2.2, 1.0],
  [1.0, 2.5, 0.2],
  [2.2, 2.3, 0.9],
  [-0.9, 2.6, -1.0],
];
const rays = makeArrowSet(
  rayTargets.map(([x, y, z]) => [V(-3.2, 8.2, 1.2), V(x, y, z)]),
  { parent: haut, mat: forceMat, amp: 0.06, r: 0.035 },
);
const bounce = makeArrowSet(
  rayTargets.map(([x, , z]) => [V(x, 4.1, z), V(x - 1.6, 7.6, z + 0.4)]),
  { parent: haut, mat: forceMat, amp: 0.04, r: 0.03 },
);
const cream = new THREE.Mesh(
  facet(jitter(new THREE.BoxGeometry(9, 0.22, 6.4, 18, 1, 12), 0.03, 9), 0.03, 9),
  facetMat(flat(0xfffaf2, { roughness: 0.18 })),
);
haut.add(cream);

// lymph vessel + node
const lymphCurve = new THREE.CatmullRomCurve3([
  V(3.6, 1.9, 0.7),
  V(5.4, 1.3, 1.0),
  V(7.4, 0.95, 0.8),
  V(9.2, 1.15, 0.5),
  V(NODE[0] - 0.9, NODE[1], NODE[2]),
]);
haut.add(
  new THREE.Mesh(
    new THREE.TubeGeometry(lymphCurve, 60, 0.22, 10),
    new THREE.MeshStandardMaterial({
      color: 0xe8f0b0,
      roughness: 0.2,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    }),
  ),
);
const node = new THREE.Mesh(
  facet(jitter(new THREE.SphereGeometry(1, 14, 10), 0.05, 7), 0.06, 7),
  facetMat(flat(0xf2e3c4, { roughness: 0.45 })),
);
node.scale.set(1.45, 0.95, 1.05);
hAdd(node, ...NODE);
const NSP = 46;
const specks = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.075, 0),
  flat(0xffffff, { roughness: 0.3, emissive: 0x222222 }),
  NSP,
);
specks.frustumCulled = false;
haut.add(specks);
const SPECK = [];
{
  const cols = [0xd8262f, 0x1f4fa8, 0x2f8a3a, 0xf2b417, 0x8a2fb8, 0x15121c, 0xff6a1f, 0x26b8c9];
  for (let i = 0; i < NSP; i++) {
    const u = hr() * 2 * PI;
    const v = Math.acos(2 * hr() - 1);
    const d = V(Math.sin(v) * Math.cos(u), Math.cos(v), Math.sin(v) * Math.sin(u));
    if (d.z < -0.3) d.z = -d.z; // most on the visible side
    SPECK.push({
      p: V(NODE[0] + d.x * 1.45, NODE[1] + d.y * 0.95, NODE[2] + d.z * 1.05),
      d: hr() * 0.6,
    });
    specks.setColorAt(i, _c.setHex(cols[i % cols.length]));
  }
}
const NFLOW = 22;
const flow = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.08, 0),
  flat(0xffffff, { roughness: 0.3 }),
  NFLOW,
);
flow.frustumCulled = false;
haut.add(flow);
{
  const cols = [0x1b1f4a, 0xd8262f, 0x1f4fa8, 0x2f8a3a, 0xf2b417];
  for (let i = 0; i < NFLOW; i++) flow.setColorAt(i, _c.setHex(cols[i % cols.length]));
}

const applyCamera = shotCamera(shots);

// ================================================================ timelines
// position of a cell (HAUT local) and its yaw
function cellState(i, t) {
  const q = Q[i];
  const fromRight = q[0] > 1.5 && i !== 0;
  const stag = i * 0.12;
  const inK = smooth(ramp(t, T.schickt + stag, T.putz + 0.55 + stag * 0.4));
  const p = V(lerp(fromRight ? 11 : -11, q[0], inK), q[1] + Math.sin(t * 1.3 + i) * 0.06, q[2]);
  let yaw = fromRight ? -PI / 2 + 0.6 : PI / 2 - 0.6;
  if (i >= 5) yaw = [0.9, 2.1, -0.4, 0.4][i - 5];
  let vis = t >= T.schickt + stag;
  // hook: C0 + two others already eat
  if (t < T.trotzdem) {
    vis = i === 0 || i === 5 || i === 7;
    if (i === 0) p.set(...C0_EAT);
    else p.set(q[0], q[1] + Math.sin(t * 1.3 + i) * 0.06, q[2]);
  }
  if (i === 0 && t >= T.rate) {
    const k = smooth(ramp(t, T.rate + 0.3, T.schluckt - 0.1));
    p.set(lerp(q[0], C0_EAT[0], k), q[1] + Math.sin(t * 1.3) * 0.04, q[2]);
  }
  if (i === 1 && t >= T.schnappt - 0.45) {
    const k = smooth(ramp(t, T.schnappt - 0.45, T.schnappt + 0.2));
    p.set(lerp(q[0], C1_EAT[0], k), lerp(q[1], C1_EAT[1], k), lerp(q[2], C1_EAT[2], k));
    yaw = -PI / 2 + 0.6 + (PI - 1.2) * smooth(ramp(t, T.farbe3 + 0.2, HOPS[0] - 0.2));
  }
  if ((i === 2 || i === 3 || i === 4) && t >= T.farbe3)
    yaw = -PI / 2 + 0.6 + (PI - 1.2) * smooth(ramp(t, HOPS[i - 2] + 0.25, HOPS[i - 2] + 0.7));
  return { p, yaw, vis };
}
const hopFrom = (i) => (i === 0 ? C1_EAT : Q[i + 1]);
// hero ink blob (HAUT local) or null
function heroInkPos(t) {
  if (t < T.trotzdem) {
    const k = smooth(ramp(t, T.auffressen + 0.1, T.auffressen + 0.45));
    return [V(lerp(B0[0], C0_EAT[0], k), B0[1], B0[2]), 1 - 0.25 * k];
  }
  if (t < STROKES[1] + 0.1) return null;
  if (t < T.kriegt) {
    const g = outBack(ramp(t, STROKES[1] + 0.1, STROKES[1] + 0.6));
    return [
      V(lerp(NEEDLE_XZ[0], B0[0], g), lerp(2.0, B0[1], g), lerp(NEEDLE_XZ[1], B0[2], g)),
      clamp01(g * 1.4),
    ];
  }
  if (t < T.stirbt + 0.45) {
    const k = smooth(ramp(t, T.kriegt, T.kriegt + 0.45));
    return [V(lerp(B0[0], C0_EAT[0], k), B0[1] - 0.05 * k, B0[2]), 1 - 0.2 * k];
  }
  if (t < T.schnappt + 0.3)
    return [V(C0_EAT[0], C0_EAT[1] + 0.1 * ramp(t, T.stirbt + 0.45, T.schnappt), C0_EAT[2]), 0.85];
  if (t < HOPS[0]) {
    const k = smooth(ramp(t, T.schnappt + 0.3, T.schnappt + 0.6));
    return [V(lerp(C0_EAT[0], C1_EAT[0], k), C1_EAT[1], C1_EAT[2]), 0.8];
  }
  for (let h = 0; h < HOPS.length; h++) {
    const a = HOPS[h];
    const end = h + 1 < HOPS.length ? HOPS[h + 1] : 1e9;
    if (t >= a && t < end) {
      const k = smooth(ramp(t, a, a + 0.35));
      const A = hopFrom(h);
      const B = Q[h + 2];
      return [
        V(lerp(A[0], B[0], k), lerp(A[1], B[1], k) + Math.sin(k * PI) * 0.7, lerp(A[2], B[2], k)),
        0.8,
      ];
    }
  }
  return null;
}

// ================================================================ render
function renderAt(t) {
  const inStudio = t < T.auffressen || between(t, T.trotzdem, T.aber) || t >= T.wie;
  armG.visible = inStudio;
  haut.visible = !inStudio;

  // ------------------------------------------------ STUDIO
  if (inStudio) {
    // mini scavengers nibble, then vanish when the tattoo "stays"
    MINI.forEach((c, i) => {
      const show = t < T.trotzdem;
      c.visible = show;
      if (!show) return;
      const u = c.userData;
      const chew = Math.max(0, Math.sin(t * 9 + i * 1.3));
      const X = u.X + Math.sin(t * 0.8 + i) * 0.04;
      const n = V(0, Math.sin(u.th), Math.cos(u.th)).normalize();
      c.position.copy(armPoint(X, u.th, 0.035));
      c.quaternion
        .setFromUnitVectors(V(0, 1, 0), n)
        .multiply(_q.setFromAxisAngle(V(0, 1, 0), u.yaw + Math.sin(t * 2 + i) * 0.2));
      poseCell(c, t, { open: chew * 0.8, s: 0.13 * outBack(clamp01((t + 0.3 + i * 0.05) / 0.4)) });
    });
    // the tattoo heals to full colour, sparkles
    sparks.forEach((s, i) => {
      const a = T.leben - 0.3 + i * 0.22;
      const k = pop(t, a, a + 0.9, 0.2);
      s.scale.setScalar(Math.max(0.001, k * (0.8 + 0.4 * Math.sin(t * 12 + i))));
      s.rotation.y = t * 4 + i;
    });
    // machine: only in its shot, needle hammering
    const mOn = between(t, T.nadel1, T.aber);
    machine.visible = mOn;
    const stroke = Math.abs(Math.sin(t * PI * 26));
    needleM.position.y = -0.035 * stroke;
    mist.forEach((m, i) => {
      m.visible = mOn;
      const k = (t * 1.6 + i / 6) % 1;
      m.position.set(
        TIP.x + Math.cos(m.userData.a) * 0.06 * (1 + k * 2),
        TIP.y + 0.01 + k * 0.06,
        TIP.z + Math.sin(m.userData.a) * 0.06 * (1 + k * 2),
      );
      m.scale.setScalar(1 - k * 0.6);
    });
  }

  // ------------------------------------------------ HAUT
  if (!inStudio) {
    // alarm tint while the body spots the intruder
    const alarm = between(t, T.nur, T.fress) ? 0.5 + 0.5 * Math.sin((t - T.nur) * 9) : 0;
    const alarmK = alarm * (1 - ramp(t, T.schickt + 0.6, T.fress));
    hautLights.forEach((l, i) => {
      l.color.copy(l.userData.col).lerp(_c.setHex(0xff1a2a), i < 3 ? alarmK * 0.8 : 0);
      l.intensity = l.userData.base * (1 + alarmK * 0.4);
    });

    // blood flow
    bloodPh.forEach(([a, b, c], i) => {
      const x = -9 + ((t * 1.1 + a * 18) % 18);
      _m.compose(
        V(x, VESSEL.y + Math.sin(b + t) * 0.16, VESSEL.z + Math.cos(c + t) * 0.16),
        _q.setFromAxisAngle(V(0, 0, 1), PI / 2 + Math.sin(t + b)),
        _s.set(1, 1, 1),
      );
      blood.setMatrixAt(i, _m);
    });
    blood.instanceMatrix.needsUpdate = true;

    // epidermis: conveyor up + flaking during "tauschst … weg"
    const fA = T.tauschst - 0.3;
    const conv = smooth(ramp(t, fA, T.also1 - 0.2));
    const flaking = between(t, fA, T.also1);
    EPI.forEach((e, i) => {
      let y = e.y;
      let x = e.x;
      let z = e.z;
      let s = e.s;
      let rx = 0;
      if (flaking) {
        y += conv * 0.24;
        if (e.row === 2 && Math.abs(e.x) < 5 && e.z > -2) {
          const k = smooth(ramp(t, fA + e.d, fA + e.d + 1.2));
          y += k * 2.6;
          x += e.sx * k * 1.2;
          z += e.sz * k;
          rx = k * (1 + e.rot);
          s *= 1 - k * 0.45;
        }
        if (e.row === 0) s *= 0.4 + 0.6 * conv;
      }
      _m.compose(
        _v.set(x, y, z),
        _q.setFromEuler(new THREE.Euler(rx, e.rot, rx * 0.5)),
        _s.set(0.9 * s, 0.42 * s, 0.9 * s),
      );
      epi.setMatrixAt(i, _m);
    });
    epi.instanceMatrix.needsUpdate = true;
    topMat.opacity = between(t, T.aber, T.oberste + 0.4)
      ? 1 - ramp(t, T.haut, T.oberste + 0.4) * 0.7
      : between(t, T.verblassen, T.fakt)
        ? 0.9 - 0.4 * ramp(t, T.sonne, T.also2)
        : 0;
    topTat.visible = topMat.opacity > 0.01;
    epiInk.forEach((m) => {
      const u = m.userData;
      const on = between(t, T.aber, T.also1);
      m.visible = on;
      if (!on) return;
      const k = smooth(ramp(t, T.weg - 0.5 + u.d, T.weg + 0.6 + u.d));
      m.position.set(u.x + k * 0.5, u.y + conv * 0.24 + k * 2.4, u.z + k * 0.6);
      const glow = between(t, T.dort, T.weg) ? 0.5 + 0.5 * Math.sin(t * 10) : 0;
      m.material.emissive.setHex(0x3a50ff).multiplyScalar(glow * 0.6);
      m.scale.setScalar(Math.max(0.001, 1 - k * 0.7));
    });
    showNope(
      pop(t, T.weg, T.also1) + pop(t, T.verdaut, T.bleibt2),
      between(t, T.weg, T.also1) ? 0.2 : C0_EAT[0],
      (between(t, T.weg, T.also1) ? 4.9 : 3.2) + HAUT[1],
      between(t, T.weg, T.also1) ? 1.6 : C0_EAT[2] + 0.5,
      0.75,
    );

    // the needle strokes
    const nOn = between(t, T.also1 - 0.1, T.nur);
    bigNeedle.visible = nOn;
    if (nOn) {
      let y = lerp(9, 4.5, smooth(ramp(t, T.also1 - 0.1, T.also1 + 0.4)));
      for (const s of STROKES) {
        const k = t - s;
        if (k >= 0 && k < 0.12) y = lerp(4.5, 2.0, k / 0.12);
        else if (k >= 0.12 && k < 0.36) y = lerp(2.0, 4.5, smooth((k - 0.12) / 0.24));
      }
      bigNeedle.position.set(NEEDLE_XZ[0], y, NEEDLE_XZ[1]);
    }

    // ink blobs: hook (all there), gone, injected stroke by stroke, red alarm, sun shrinks them
    const sunK =
      smooth(ramp(t, T.sonne - 0.3, T.also2)) * (1 - smooth(ramp(t, T.creme, T.creme + 0.4)) * 0.0);
    inkMat.emissive.setHex(0xff1a2a).multiplyScalar(alarmK * 0.7);
    INK.forEach((b, i) => {
      let g;
      let p = b.p;
      if (t < T.trotzdem) g = 1;
      else if (t < STROKES[0]) g = 0;
      else {
        const s = STROKES[b.st] + 0.08;
        g = outBack(ramp(t, s, s + 0.5));
        const k = clamp01(ramp(t, s, s + 0.45));
        p = _v.set(lerp(NEEDLE_XZ[0], b.p.x, k), lerp(2.0, b.p.y, k), lerp(NEEDLE_XZ[1], b.p.z, k));
      }
      const r = b.r * Math.max(0.001, g) * (1 - 0.35 * sunK);
      _m.compose(
        p,
        _q.setFromEuler(new THREE.Euler(b.rot, b.rot * 2 + t * 0.2, 0)),
        _s.set(r, r, r),
      );
      inks.setMatrixAt(i, _m);
    });
    inks.instanceMatrix.needsUpdate = true;
    const hp = heroInkPos(t);
    heroInk.visible = !!hp;
    if (hp) {
      heroInk.position.copy(hp[0]);
      heroInk.scale.setScalar(Math.max(0.001, hp[1] * (1 - 0.3 * sunK)));
      heroInk.rotation.set(t * 0.7, t * 1.1, 0);
      heroInk.material.emissive.setHex(0xff1a2a).multiplyScalar(alarmK * 0.8);
    }
    const wK = pop(t, T.eindring - 0.2, T.schickt + 0.3, 0.2);
    warn.visible = wK > 0 && !!hp;
    if (warn.visible) {
      warn.position.copy(hp[0]);
      warn.scale.setScalar(wK * (1 + 0.15 * Math.sin(t * 14)));
      warn.quaternion.copy(camera.quaternion);
      warn.material.opacity = 0.9;
    }

    // cells
    CELLS.forEach((c, i) => {
      const st = cellState(i, t);
      c.visible = st.vis;
      if (!st.vis) return;
      c.position.copy(st.p);
      c.rotation.set(0, st.yaw, 0);
      let open = 0.15 + 0.15 * Math.max(0, Math.sin(t * 4 + i * 2));
      let s = 1;
      let stuffed = 0;
      let dead = 0;
      if (i >= 5) open = 0.5 * Math.max(0, Math.sin(t * 5 + i));
      if (i === 0) {
        if (t < T.trotzdem) {
          open =
            t < T.auffressen ? 0.6 : 1 - smooth(ramp(t, T.auffressen + 0.25, T.auffressen + 0.55));
          if (t < T.auffressen - 0.1) open = 0.4 + 0.4 * Math.sin(t * 8);
          stuffed = smooth(ramp(t, T.auffressen + 0.4, T.jeden));
          s = 1 + 0.15 * stuffed;
        } else {
          if (between(t, T.schluckt - 0.4, T.kriegt + 0.45))
            open =
              t < T.kriegt
                ? smooth(ramp(t, T.schluckt - 0.4, T.kriegt))
                : 1 - smooth(ramp(t, T.kriegt + 0.15, T.kriegt + 0.45));
          if (t >= T.kriegt + 0.45) open = 0.05;
          stuffed = smooth(ramp(t, T.kriegt + 0.3, T.bauch));
          s = 1 + 0.3 * stuffed;
          dead = smooth(ramp(t, T.stirbt, T.stirbt + 0.42));
          s += dead * 0.15;
          if (t >= T.stirbt + 0.45) c.visible = false;
        }
        CELL0.splice(0, 3, st.p.x + HAUT[0], st.p.y + HAUT[1], st.p.z + HAUT[2]);
        CELL_REL.x = CELL0[0];
        CELL_REL.y = CELL0[1];
        CELL_REL.z = CELL0[2];
      }
      if (i === 1 && t >= T.schnappt - 0.3) {
        open =
          t < T.schnappt + 0.3
            ? smooth(ramp(t, T.schnappt - 0.3, T.schnappt + 0.2))
            : 1 - smooth(ramp(t, T.schnappt + 0.3, T.schnappt + 0.6));
        stuffed = t < HOPS[0] ? smooth(ramp(t, T.schnappt + 0.4, T.farbe3 + 0.4)) : 0;
      }
      // relay: sender spits (opens), receiver gulps
      HOPS.forEach((h, k) => {
        const sender = k + 1;
        const recv = k + 2;
        if (i === sender) open = Math.max(open, pop(t, h - 0.15, h + 0.3, 0.12));
        if (i === recv) {
          open = Math.max(open, pop(t, h - 0.2, h + 0.35, 0.12));
          if (t >= h + 0.35 && (k === 2 || t < HOPS[k + 1]))
            stuffed = smooth(ramp(t, h + 0.3, h + 0.6));
          s = 1 + 0.18 * pop(t, h + 0.3, h + 0.7, 0.1);
        }
      });
      poseCell(c, t, { open, s: s * CS, stuffed, dead });
    });
    if (CELL0[1] !== 0)
      puff("burst", t, T.stirbt + 0.45, CELL0[0], CELL0[1] - 0.3, CELL0[2], 1.1, 0xd8ffb0);

    // sun + rays, cream, bounce
    const sunVis = pop(t, T.verblassen - 0.1, T.fakt, 0.3);
    sun.visible = sunVis > 0;
    sun.scale.setScalar(Math.max(0.001, sunVis));
    sun.rotation.z = t * 0.6;
    const creamK = smooth(ramp(t, T.creme - 0.25, T.creme + 0.35));
    animateArrows(rays, t, pop(t, T.verblassen + 0.2, T.creme, 0.25));
    animateArrows(bounce, t, pop(t, T.creme + 0.2, T.fakt, 0.25));
    cream.visible = between(t, T.creme - 0.3, T.fakt + 0.6);
    cream.position.set(lerp(-14, 0.3, creamK), 4.02, 0.0);

    // lymph: ink drifts along the vessel, the node turns colourful
    const fOn = t >= T.fakt - 0.2;
    flow.visible = fOn;
    if (fOn) {
      for (let i = 0; i < NFLOW; i++) {
        const k = (t * 0.22 + i / NFLOW) % 1;
        lymphCurve.getPoint(k, _v);
        _v.y += Math.sin(i * 3 + t * 2) * 0.06;
        const s = 1 - Math.max(0, k - 0.9) * 10;
        _m.compose(_v, _q.identity(), _s.set(s, s, s));
        flow.setMatrixAt(i, _m);
      }
      flow.instanceMatrix.needsUpdate = true;
    }
    SPECK.forEach((sp, i) => {
      const k = outBack(ramp(t, T.bunt - 0.25 + sp.d * 0.5, T.bunt + 0.25 + sp.d * 0.5));
      const pre = i % 6 === 0 ? smooth(ramp(t, T.lymph, T.lymph + 0.6)) : 0;
      const s = Math.max(0.001, Math.max(k, pre * 0.7));
      _m.compose(sp.p, _q.identity(), _s.set(s, s, s));
      specks.setMatrixAt(i, _m);
    });
    specks.instanceMatrix.needsUpdate = true;
    node.rotation.y = Math.sin(t * 0.8) * 0.05;
  }

  // ------------------------------------------------ LED facts
  if (between(t, T.vier, T.also1))
    showPanel(pop(t, T.vier, T.also1), "ALLE 4 WOCHEN", "NEU", LED.yellow);
  else if (between(t, STROKES[1], T.nur))
    showPanel(pop(t, STROKES[1], T.nur), "NADEL BIS", "2 mm", LED.blue);
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
