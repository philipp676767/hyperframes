// #58 Deo — the armpit landscape (set.js) with: a giant deo can + the
// viewer's hand, spray mist, sweat spurting from pores, the hero pore in an
// x-ray cut (duct, gland, sweat beads, salt crystals, gel → plug), the
// bacteria colony with stink clouds, the date (white shirt, stains), the
// shower, day ↔ night, a DNA helix and spray / roller / stick at the end.
import {
  THREE,
  ramp,
  smooth,
  clamp01,
  lerp,
  pop,
  V,
  rng,
  scene,
  flat,
  M,
  facet,
  facetMat,
  jitter,
  xrayMaterial,
  xrayEdges,
  setXray,
  showNope,
  showPanel,
  LED,
  labels,
  squash,
  puff,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { setDaylight, sweatMat, PORES, LAYERS, CUT_Z, XRAY_W, SKIN } from "./set.js";
import { lightString } from "./environments.js";
import { createHand } from "./hand.js";
import { readout } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS, PORE, CAN, BAC, DATE } from "./beats.js";

highlights(HIGHLIGHTS);

// ================================================================ helpers
const mesh = (geo, mat, x = 0, y = 0, z = 0, parent = scene, shadow = true) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = shadow;
  parent.add(m);
  return m;
};
const fmesh = (geo, mat, x, y, z, parent = scene, amt = 0.08, seed = 1) =>
  mesh(facet(geo, amt, seed), facetMat(mat), x, y, z, parent);
const m4 = new THREE.Matrix4();
const q0 = new THREE.Quaternion();
const qT = new THREE.Quaternion();
const eul = new THREE.Euler();
const vS = V(1, 1, 1);
const vP = V(0, 0, 0);
function instanced(geo, mat, n, parent = scene) {
  const im = new THREE.InstancedMesh(geo, mat, n);
  im.frustumCulled = false;
  im.userData.noAO = true;
  parent.add(im);
  return im;
}
// in any of the [a, b) windows
const inAny = (t, wins) => wins.some(([a, b]) => t >= a && t < b);

// ================================================================ the can
const can = new THREE.Group();
can.position.set(...CAN);
scene.add(can);
function buildCan(g) {
  const body = flat(0x1c2142, { roughness: 0.22, metalness: 0.55 });
  const band = flat(0x22c7b3, { roughness: 0.3, metalness: 0.2 });
  const white = flat(0xf7f7f7, { roughness: 0.35 });
  const chrome = M.chrome;
  mesh(new THREE.CylinderGeometry(0.95, 0.95, 4.9, 40), body, 0, 2.45, 0, g);
  mesh(new THREE.CylinderGeometry(0.97, 0.97, 1.5, 40), band, 0, 2.6, 0, g);
  // a white wave stripe across the band
  const wave = new THREE.Mesh(new THREE.TorusGeometry(0.975, 0.07, 6, 48), white);
  wave.rotation.x = Math.PI / 2 + 0.25;
  wave.position.y = 2.75;
  g.add(wave);
  mesh(new THREE.CylinderGeometry(0.99, 0.99, 0.12, 40), chrome, 0, 0.06, 0, g);
  // shoulder dome + collar
  const dome = mesh(
    new THREE.SphereGeometry(0.95, 40, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    chrome,
    0,
    4.9,
    0,
    g,
  );
  dome.scale.y = 0.55;
  mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.22, 24), chrome, 0, 5.45, 0, g);
  // actuator: white cap with the nozzle facing the pore (+x+z)
  const act = new THREE.Group();
  act.position.set(0, 5.56, 0);
  g.add(act);
  mesh(new THREE.CylinderGeometry(0.4, 0.42, 0.42, 24), white, 0, 0.21, 0, act);
  mesh(new THREE.CylinderGeometry(0.34, 0.4, 0.1, 24), flat(0x22c7b3), 0, 0.46, 0, act);
  const noz = mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.06, 10),
    flat(0x111111),
    0,
    0.26,
    0,
    act,
  );
  const dir = V(0.62, 0, 0.78).normalize();
  noz.position.set(dir.x * 0.4, 0.26, dir.z * 0.4);
  noz.lookAt(
    V(dir.x * 2, 0.26, dir.z * 2)
      .add(act.position)
      .add(g.position),
  );
  noz.rotateX(Math.PI / 2);
  return { act };
}
const canParts = buildCan(can);
const NOZZLE = V(CAN[0] + 0.62 * 0.42, 5.82, CAN[2] + 0.78 * 0.42);
const SPRAY_DIR = V(PORE[0] + 0.4, 0.5, PORE[2] + 0.2).sub(NOZZLE);
const SPRAY_LEN = SPRAY_DIR.length();
SPRAY_DIR.normalize();
const SPRAY_SIDE = V(0, 1, 0).cross(SPRAY_DIR).normalize();
const SPRAY_UP = SPRAY_DIR.clone().cross(SPRAY_SIDE).normalize();

// spray mist: many small white puffs flying out of the nozzle in a cone
const mistMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 1,
  transparent: true,
  opacity: 0.5,
  depthWrite: false,
});
const MIST_N = 220;
const mist = instanced(new THREE.IcosahedronGeometry(1, 1), mistMat, MIST_N);
const mistSeed = (() => {
  const r = rng(581);
  return Array.from({ length: MIST_N }, () => [r(), r() * 2 - 1, r() * 2 - 1, 0.6 + r() * 0.8]);
})();
function sprayMist(t, vis) {
  mist.visible = vis > 0.01;
  if (!mist.visible) return;
  for (let i = 0; i < MIST_N; i++) {
    const [ph, a, b, sz] = mistSeed[i];
    const age = (t * 1.1 + ph) % 1;
    const spread = 0.12 + age * 1.6;
    vP.copy(NOZZLE)
      .addScaledVector(SPRAY_DIR, age * SPRAY_LEN * 1.05)
      .addScaledVector(SPRAY_SIDE, a * spread)
      .addScaledVector(SPRAY_UP, b * spread * 0.6);
    vP.y -= age * age * 0.6;
    const s = vis * sz * (0.04 + age * 0.3) * Math.sqrt(Math.max(0, 1 - age));
    m4.compose(vP, q0, vS.set(s, s, s));
    mist.setMatrixAt(i, m4);
  }
  mist.instanceMatrix.needsUpdate = true;
}
// a soft cloud that settles over the pores while spraying
const cloudMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 1,
  transparent: true,
  opacity: 0.28,
  depthWrite: false,
});
const cloud = new THREE.Group();
scene.add(cloud);
{
  const r = rng(77);
  for (let i = 0; i < 9; i++) {
    const m = mesh(
      jitter(new THREE.IcosahedronGeometry(1, 1), 0.1, i),
      cloudMat,
      (r() - 0.5) * 3.4,
      0.4 + r() * 0.6,
      (r() - 0.5) * 2.4,
      cloud,
      false,
    );
    m.scale.setScalar(0.6 + r() * 0.6);
    m.userData.noAO = true;
  }
  cloud.position.set(PORE[0] + 0.3, 0, PORE[2] - 0.4);
}

// the viewer's hand pressing the can
const hand = createHand({ scale: 3.0, sleeve: 0xe8527a, skin: 0xf0bf98 });

// ================================================================ sweat spurts
// droplets shooting up out of the pores around the stage
const spurtPores = [
  [...PORE],
  ...PORES.filter(([x, z]) => Math.hypot(x, z - 0.5) < 9)
    .slice(0, 9)
    .map(([x, z]) => [x, 0, z]),
];
const DROPS_PER = 7;
const drops = instanced(
  new THREE.SphereGeometry(0.11, 10, 8),
  sweatMat,
  spurtPores.length * DROPS_PER,
);
const dropSeed = (() => {
  const r = rng(582);
  return spurtPores.map(() =>
    Array.from({ length: DROPS_PER }, () => [
      r(),
      (r() - 0.5) * 0.8,
      (r() - 0.5) * 0.8,
      1.6 + r() * 1.4,
    ]),
  );
})();
function spurts(t, vis) {
  drops.visible = vis > 0.01;
  if (!drops.visible) return;
  let i = 0;
  spurtPores.forEach(([x, y, z], j) => {
    for (const [ph, vx, vz, up] of dropSeed[j]) {
      const age = (t * 1.25 + ph + j * 0.37) % 1;
      vP.set(x + vx * age * 1.4, y + up * age - 2.4 * age * age + 0.05, z + vz * age * 1.4);
      const s = vis * (1 - age * 0.4) * (vP.y > 0 ? 1 : 0);
      m4.compose(vP, q0, vS.set(s, s * 1.25, s));
      drops.setMatrixAt(i++, m4);
    }
  });
  drops.instanceMatrix.needsUpdate = true;
}

// ================================================================ hero pore + the cut
const pore = new THREE.Group();
pore.position.set(...PORE);
scene.add(pore);
{
  const ring = fmesh(
    new THREE.TorusGeometry(0.5, 0.17, 6, 14),
    flat(0xd99a80, { roughness: 0.7 }),
    0,
    0.03,
    0,
    pore,
    0.08,
    9,
  );
  ring.rotation.x = Math.PI / 2;
  ring.scale.z = 0.7;
  const hole = mesh(
    new THREE.CircleGeometry(0.42, 14),
    flat(0x4a2220, { roughness: 1 }),
    0,
    0.045,
    0,
    pore,
    false,
  );
  hole.rotation.x = -Math.PI / 2;
}
// x-ray window: the layers between -XRAY_W and XRAY_W, in glass materials
const xMats = [];
for (const L of LAYERS) {
  const h = L.top - L.bot;
  const mat = xrayMaterial(L.top === 0 ? SKIN : L.color, { roughness: 0.7 });
  xMats.push(mat);
  const geo = new THREE.BoxGeometry(XRAY_W * 2, h, CUT_Z + 1.8);
  const m = mesh(geo, mat, 0, (L.top + L.bot) / 2, (CUT_Z - 1.8) / 2);
  const e = xrayEdges(geo);
  e.position.copy(m.position);
  scene.add(e);
}
// duct + coiled gland behind the window
const GL_Y = -4.3;
const ductMat = new THREE.MeshStandardMaterial({
  color: 0xffd3cc,
  roughness: 0.3,
  transparent: true,
  opacity: 0.5,
  depthWrite: false,
});
const ductPts = [
  V(0, GL_Y + 0.5, 0),
  V(0.05, -3.0, 0),
  V(-0.06, -2.0, 0),
  V(0.05, -1.0, 0),
  V(0, 0.02, 0),
];
const duct = mesh(
  new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ductPts), 40, 0.17, 10),
  ductMat,
  0,
  0,
  0,
  pore,
  false,
);
duct.userData.noAO = true;
const glandPts = [];
for (let k = 0; k <= 160; k++) {
  const f = k / 160;
  const a = f * Math.PI * 2 * 5;
  const rr = 0.45 * Math.sin(Math.PI * (0.1 + f * 0.8));
  glandPts.push(
    V(Math.cos(a) * rr, GL_Y + (f - 0.5) * 0.7 + Math.sin(a * 0.5) * 0.08, Math.sin(a) * rr),
  );
}
glandPts.push(V(0, GL_Y + 0.5, 0));
const glandMat = flat(0xff7d8a, { roughness: 0.4, emissive: 0xff3050, emissiveIntensity: 0.25 });
const gland = mesh(
  new THREE.TubeGeometry(new THREE.CatmullRomCurve3(glandPts), 240, 0.1, 7),
  glandMat,
  0,
  0,
  0,
  pore,
  false,
);
// sweat beads rising through the duct
const BEAD_N = 28;
const beads = instanced(
  new THREE.IcosahedronGeometry(0.1, 1),
  new THREE.MeshStandardMaterial({
    color: 0x8fd0ff,
    roughness: 0.1,
    emissive: 0x2a7fff,
    emissiveIntensity: 0.35,
  }),
  BEAD_N,
  pore,
);
const BOT = GL_Y + 0.4;
function sweatBeads(t, vis, speed, fmax, spill = 0) {
  beads.visible = vis > 0.01;
  if (!beads.visible) return;
  for (let i = 0; i < BEAD_N; i++) {
    const f = (i / BEAD_N + t * speed) % 1;
    let y = lerp(BOT, 0.05, f);
    let x = Math.sin(i * 2.3 + t * 3) * 0.06;
    let z = Math.cos(i * 1.7 + t * 2.6) * 0.06;
    let s = vis * (0.75 + 0.3 * Math.sin(i * 5.1));
    if (f > fmax) {
      // spill: beads leaving the pore fly up and out
      if (spill > 0) {
        const g = (f - fmax) / (1 - fmax);
        y = 0.05 + g * 1.8 * spill;
        x += Math.sin(i * 4.1) * g * 1.0;
        z += Math.cos(i * 3.3) * g * 0.6;
      } else s = 0;
    }
    m4.compose(vP.set(x, y, z), q0, vS.set(s, s, s));
    beads.setMatrixAt(i, m4);
  }
  beads.instanceMatrix.needsUpdate = true;
}
// salt crystals (white octahedra) and the gel plug
const SALT_N = 22;
const saltMat = flat(0xffffff, { roughness: 0.25, emissive: 0xcfe8ff, emissiveIntensity: 0.35 });
const salt = instanced(new THREE.OctahedronGeometry(0.075, 0), saltMat, SALT_N, pore);
const saltSeed = (() => {
  const r = rng(583);
  return Array.from({ length: SALT_N }, () => ({
    rx: (r() - 0.5) * 0.18,
    rz: (r() - 0.5) * 0.18,
    ry: -0.3 - r() * 0.85, // rest height in the duct
    sx: (r() - 0.5) * 2.4, // start above the skin
    sz: (r() - 0.5) * 1.6,
    d: r(), // stagger
    spin: r() * 6,
  }));
})();
const PLUG_Y = -0.72;
const plugMat = new THREE.MeshStandardMaterial({
  color: 0x5fb8ff,
  roughness: 0.15,
  emissive: 0x2a6fff,
  emissiveIntensity: 0.45,
  transparent: true,
  opacity: 0.85,
});
const plug = mesh(new THREE.CapsuleGeometry(0.16, 0.6, 6, 12), plugMat, 0, PLUG_Y, 0, pore, false);
plug.userData.noAO = true;
// the plug from above: a blue gel disc in the pore hole
const plugTop = mesh(new THREE.CircleGeometry(0.3, 14), plugMat, 0, 0.05, 0, pore, false);
plugTop.rotation.x = -Math.PI / 2;
// crystals: k = 0 above the skin, 1 at rest in the duct; dis = dissolved (0..1); out = flushed (0..1)
function crystals(t, fall, dis, out) {
  salt.visible = true;
  for (let i = 0; i < SALT_N; i++) {
    const c = saltSeed[i];
    const k = smooth(clamp01(fall * 1.6 - c.d * 0.6));
    let x = lerp(c.sx, c.rx, smooth(clamp01(k * 1.6)));
    let z = lerp(c.sz, c.rz, smooth(clamp01(k * 1.6)));
    let y = lerp(2.2 + c.d, c.ry, k);
    let s = 1 - smooth(clamp01(dis * 1.4 - c.d * 0.4));
    if (out > 0) {
      const o = smooth(clamp01(out * 1.5 - c.d * 0.5));
      y = lerp(c.ry, 1.6 + c.d * 1.2, o);
      x += Math.sin(i * 2.1) * o * 1.1;
      z += Math.cos(i * 1.3) * o * 0.8 + o * 0.6;
      s *= 1 - o * 0.5;
    }
    if (k <= 0 && fall <= 0) s = 0;
    eul.set(t * 1.5 + c.spin, t * 1.1 + c.spin, 0);
    qT.setFromEuler(eul);
    m4.compose(vP.set(x, y, z), qT, vS.set(s, s, s));
    salt.setMatrixAt(i, m4);
  }
  salt.instanceMatrix.needsUpdate = true;
}

// ================================================================ bacteria
const bac = new THREE.Group();
bac.position.set(...BAC);
scene.add(bac);
{
  // the pore they sit around
  const ring = fmesh(
    new THREE.TorusGeometry(0.42, 0.14, 6, 14),
    flat(0xd99a80, { roughness: 0.7 }),
    0,
    0.03,
    0,
    bac,
    0.08,
    4,
  );
  ring.rotation.x = Math.PI / 2;
  ring.scale.z = 0.7;
  const hole = mesh(new THREE.CircleGeometry(0.34, 14), flat(0x4a2220), 0, 0.045, 0, bac, false);
  hole.rotation.x = -Math.PI / 2;
}
const bacPlug = mesh(new THREE.CircleGeometry(0.33, 14), plugMat, 0, 0.055, 0, bac, false);
bacPlug.rotation.x = -Math.PI / 2;
const bead = mesh(
  new THREE.SphereGeometry(0.55, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2),
  sweatMat,
  0,
  0,
  0,
  bac,
);
bead.scale.y = 0.7;
bead.userData.noAO = true;
const bugs = [];
{
  const greens = [0x7fd14a, 0x9be05a, 0x5fc25a, 0xa8d94a, 0x6fd17a];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.4;
    const g = new THREE.Group();
    const r = 0.98 + (i % 2) * 0.12;
    g.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
    g.lookAt(0, 0, 0); // +z faces the bead
    bac.add(g);
    const body = new THREE.Group();
    g.add(body);
    const b = fmesh(
      jitter(new THREE.IcosahedronGeometry(0.27, 1), 0.03, i),
      flat(greens[i], { roughness: 0.5 }),
      0,
      0.25,
      0,
      body,
      0.1,
      i,
    );
    b.scale.set(1.15, 0.9, 1.25);
    // little hair-like flagella
    for (let k = 0; k < 4; k++) {
      const fl = mesh(
        new THREE.CylinderGeometry(0.012, 0.02, 0.28, 4),
        flat(0x4f9e3a),
        0,
        0.25,
        0,
        body,
        false,
      );
      fl.position.set(Math.cos(k * 1.6 + 1) * 0.25, 0.28, -0.22 - Math.sin(k) * 0.05);
      fl.rotation.set(-0.8, 0, (k - 1.5) * 0.4);
    }
    const eyes = new THREE.Group();
    eyes.position.set(0, 0.36, 0.2);
    body.add(eyes);
    for (const s of [-1, 1]) {
      mesh(
        new THREE.SphereGeometry(0.075, 10, 8),
        flat(0xffffff, { roughness: 0.3 }),
        s * 0.09,
        0,
        0.05,
        eyes,
        false,
      );
      mesh(
        new THREE.SphereGeometry(0.04, 8, 6),
        flat(0x111111),
        s * 0.09,
        -0.005,
        0.11,
        eyes,
        false,
      );
    }
    const mouth = mesh(
      new THREE.TorusGeometry(0.06, 0.016, 5, 10, Math.PI),
      flat(0x2a2a2a),
      0,
      0.22,
      0.3,
      body,
      false,
    );
    mouth.rotation.z = Math.PI;
    bugs.push({ g, body, eyes, mouth, a });
  }
}
// stink clouds
const stinkMat = new THREE.MeshStandardMaterial({
  color: 0x9be05a,
  roughness: 1,
  transparent: true,
  opacity: 0.55,
  depthWrite: false,
  emissive: 0x4a8a20,
  emissiveIntensity: 0.3,
});
const STINK_N = 16;
const stink = instanced(new THREE.IcosahedronGeometry(1, 1), stinkMat, STINK_N, bac);
function stinkClouds(t, vis) {
  stink.visible = vis > 0.01;
  if (!stink.visible) return;
  for (let i = 0; i < STINK_N; i++) {
    const bg = bugs[i % 5];
    const age = (t * 0.55 + i * 0.137) % 1;
    vP.copy(bg.g.position).multiplyScalar(1 - age * 0.3);
    vP.y = 0.5 + age * 2.4;
    vP.x += Math.sin(t * 2 + i) * 0.2 * age;
    const s = vis * (0.12 + age * 0.38) * Math.sqrt(1 - age);
    m4.compose(vP, q0, vS.set(s, s * 0.8, s));
    stink.setMatrixAt(i, m4);
  }
  stink.instanceMatrix.needsUpdate = true;
}
function animateBugs(t, eat, sad) {
  bugs.forEach(({ body, eyes, mouth }, i) => {
    const chew = eat * Math.abs(Math.sin(t * 11 + i * 1.3));
    body.scale.set(1 + chew * 0.08, 1 - chew * 0.12 - sad * 0.22, 1 + chew * 0.06);
    body.position.y = eat * Math.abs(Math.sin(t * 5.5 + i)) * 0.06;
    body.rotation.x = sad * 0.35 + Math.sin(t * 1.3 + i) * 0.05;
    eyes.position.y = 0.36 - sad * 0.06;
    mouth.rotation.z = Math.PI * (1 - sad); // smile ↔ frown
    mouth.position.y = 0.22 - sad * 0.02;
  });
}

// ================================================================ DNA helix (the one gene)
const dna = new THREE.Group();
dna.position.set(BAC[0], 1.75, BAC[2]);
scene.add(dna);
{
  const cA = flat(0xffd23f, { emissive: 0xffa800, emissiveIntensity: 0.5 });
  const cB = flat(0x4fc3ff, { emissive: 0x1f7fff, emissiveIntensity: 0.5 });
  const rung = flat(0xffffff, { emissive: 0xaad8ff, emissiveIntensity: 0.3 });
  for (let k = 0; k < 14; k++) {
    const a = k * 0.55;
    const y = (k - 6.5) * 0.12;
    const p1 = V(Math.cos(a) * 0.38, y, Math.sin(a) * 0.38);
    const p2 = V(-p1.x, y, -p1.z);
    mesh(new THREE.SphereGeometry(0.075, 10, 8), cA, p1.x, y, p1.z, dna, false);
    mesh(new THREE.SphereGeometry(0.075, 10, 8), cB, p2.x, y, p2.z, dna, false);
    const r = mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.76, 6),
      k === 7 ? flat(0xff4b2b, { emissive: 0xff2010, emissiveIntensity: 1 }) : rung,
      0,
      y,
      0,
      dna,
      false,
    );
    r.rotation.z = Math.PI / 2;
    r.rotation.y = -a;
  }
}

// ================================================================ shower rain
const RAIN_N = 160;
const rain = instanced(
  new THREE.CylinderGeometry(0.018, 0.018, 0.45, 4),
  new THREE.MeshStandardMaterial({
    color: 0xcfeaff,
    roughness: 0.1,
    transparent: true,
    opacity: 0.7,
  }),
  RAIN_N,
);
const rainSeed = (() => {
  const r = rng(584);
  return Array.from({ length: RAIN_N }, () => [r(), (r() - 0.5) * 6, (r() - 0.5) * 5]);
})();
function shower(t, vis, cx, cz) {
  rain.visible = vis > 0.01;
  if (!rain.visible) return;
  for (let i = 0; i < RAIN_N; i++) {
    const [ph, dx, dz] = rainSeed[i];
    const age = (t * 1.6 + ph) % 1;
    vP.set(cx + dx, 6 - age * 6.2, cz + dz);
    const s = vP.y > 0 ? vis : 0;
    m4.compose(vP, q0, vS.set(s, s, s));
    rain.setMatrixAt(i, m4);
  }
  rain.instanceMatrix.needsUpdate = true;
}

// ================================================================ the date (far below)
const date = new THREE.Group();
date.position.set(...DATE);
scene.add(date);
const stains = [];
let forehead;
{
  const wood = flat(0x8a5a3a, { roughness: 0.7 });
  fmesh(new THREE.BoxGeometry(14, 0.2, 12, 14, 1, 12), wood, 0, -0.1, 0, date, 0.12, 2);
  fmesh(
    new THREE.BoxGeometry(14, 6, 0.3, 10, 4, 1),
    flat(0x7a2f3c, { roughness: 0.9 }),
    0,
    3,
    -2.6,
    date,
    0.06,
    3,
  );
  fmesh(
    new THREE.BoxGeometry(0.3, 6, 12, 1, 4, 10),
    flat(0x6a2834, { roughness: 0.9 }),
    -4.2,
    3,
    2.5,
    date,
    0.06,
    4,
  );
  // framed picture + a wall lamp
  mesh(
    new THREE.BoxGeometry(1.6, 1.1, 0.06),
    flat(0xd8b46a, { metalness: 0.4, roughness: 0.4 }),
    1.6,
    2.9,
    -2.42,
    date,
  );
  mesh(new THREE.PlaneGeometry(1.4, 0.9), flat(0x2f6f8f), 1.6, 2.9, -2.38, date, false);
  lightString([-4.0, 3.9 + DATE[1], -2.4], [4.0, 3.9 + DATE[1], -2.4], { n: 14, sag: 0.35 });
  const warm = new THREE.PointLight(0xffb070, 18, 9, 1.6);
  warm.position.set(0.6, 1.6, 1.6);
  date.add(warm);
  // table, candle, two glasses
  fmesh(
    new THREE.CylinderGeometry(0.95, 0.95, 0.08, 20),
    flat(0xf3ece1),
    0,
    0.9,
    1.05,
    date,
    0.04,
    5,
  );
  mesh(
    new THREE.CylinderGeometry(0.08, 0.12, 0.9, 8),
    flat(0x2a2a2a, { metalness: 0.5 }),
    0,
    0.45,
    1.05,
    date,
  );
  mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.24, 10), flat(0xfff3dc), 0.35, 1.06, 1.25, date);
  mesh(
    new THREE.ConeGeometry(0.035, 0.1, 8),
    flat(0xffb02e, { emissive: 0xff8a10, emissiveIntensity: 2 }),
    0.35,
    1.23,
    1.25,
    date,
    false,
  );
  const glass = new THREE.MeshStandardMaterial({
    color: 0xe9f6ff,
    roughness: 0.05,
    transparent: true,
    opacity: 0.45,
  });
  for (const gx of [-0.4, 0.15]) {
    mesh(new THREE.CylinderGeometry(0.09, 0.06, 0.18, 12), glass, gx, 1.12, 1.45, date, false);
    mesh(
      new THREE.CylinderGeometry(0.075, 0.05, 0.08, 12),
      flat(0x8a1f3a),
      gx,
      1.08,
      1.45,
      date,
      false,
    );
    mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 6), glass, gx, 0.97, 1.45, date, false);
  }
  // the person: white T-shirt, arms out a little so the armpits show
  const shirt = flat(0xfbfbf8, { roughness: 0.85 });
  const skin = flat(0xf0bf98, { roughness: 0.7 });
  const torso = fmesh(
    new THREE.CylinderGeometry(0.46, 0.4, 1.0, 14, 3),
    shirt,
    0,
    1.35,
    0,
    date,
    0.04,
    6,
  );
  torso.scale.z = 0.7;
  fmesh(
    new THREE.SphereGeometry(0.47, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    shirt,
    0,
    1.84,
    0,
    date,
    0.04,
    7,
  ).scale.set(1, 0.42, 0.7);
  mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.22, 10), skin, 0, 2.0, 0, date);
  const head = fmesh(new THREE.SphereGeometry(0.29, 14, 10), skin, 0, 2.33, 0.02, date, 0.06, 8);
  head.scale.set(0.95, 1.08, 0.95);
  const hairCap = fmesh(
    new THREE.SphereGeometry(0.31, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
    flat(0x4a2c1a),
    0,
    2.38,
    -0.02,
    date,
    0.1,
    9,
  );
  hairCap.rotation.x = -0.35;
  for (const s of [-1, 1]) {
    mesh(new THREE.SphereGeometry(0.035, 8, 6), flat(0x222222), s * 0.1, 2.36, 0.27, date, false);
    // arm: sleeve + upper arm down-out + forearm onto the table
    const arm = new THREE.Group();
    arm.position.set(s * 0.44, 1.72, 0);
    arm.rotation.z = s * 0.62;
    date.add(arm);
    fmesh(new THREE.CylinderGeometry(0.15, 0.15, 0.32, 10), shirt, 0, -0.12, 0, arm, 0.04, 10);
    fmesh(new THREE.CylinderGeometry(0.1, 0.09, 0.6, 8), skin, 0, -0.45, 0, arm, 0.05, 11);
    const fore = new THREE.Group();
    fore.position.set(0, -0.72, 0);
    fore.rotation.set(-1.25, 0, -s * 0.55);
    arm.add(fore);
    fmesh(new THREE.CylinderGeometry(0.085, 0.07, 0.55, 8), skin, 0, -0.27, 0, fore, 0.05, 12);
    // the wet stain on the shirt side, under the arm
    const st = mesh(
      new THREE.CircleGeometry(0.25, 18),
      flat(0x8592a3, { roughness: 0.3 }),
      s * 0.452,
      1.56,
      0.02,
      date,
      false,
    );
    st.rotation.y = (s * Math.PI) / 2;
    st.scale.set(0.001, 0.001, 1);
    stains.push(st);
  }
  const smile = mesh(
    new THREE.TorusGeometry(0.07, 0.014, 5, 10, Math.PI),
    flat(0x7a3a2a),
    0,
    2.25,
    0.27,
    date,
    false,
  );
  smile.rotation.z = Math.PI;
  forehead = mesh(new THREE.SphereGeometry(0.05, 10, 8), sweatMat, 0.12, 2.48, 0.25, date, false);
  forehead.scale.set(0.001, 0.001, 0.001);
}

// ================================================================ the products (comment question)
const products = [];
{
  const sprayG = new THREE.Group();
  buildCan(sprayG);
  sprayG.scale.setScalar(0.24);
  const roller = new THREE.Group();
  mesh(
    new THREE.CylinderGeometry(0.22, 0.26, 1.0, 20),
    flat(0xff8fb8, { roughness: 0.25 }),
    0,
    0.5,
    0,
    roller,
  );
  mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.18, 20), flat(0xffffff), 0, 1.09, 0, roller);
  mesh(new THREE.SphereGeometry(0.15, 16, 12), M.chrome, 0, 1.2, 0, roller);
  const stick = new THREE.Group();
  const sb = mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 1.15, 24),
    flat(0x2f6fd6, { roughness: 0.3 }),
    0,
    0.575,
    0,
    stick,
  );
  sb.scale.z = 0.55;
  const sc = mesh(
    new THREE.CylinderGeometry(0.31, 0.31, 0.25, 24),
    flat(0xffffff),
    0,
    1.2,
    0,
    stick,
  );
  sc.scale.z = 0.56;
  [
    [sprayG, -1.25, T.spray],
    [roller, 0.05, T.roller],
    [stick, 1.25, T.stick],
  ].forEach(([g, x, at]) => {
    g.position.set(x, 0, 0.15);
    g.traverse((o) => o.isMesh && (o.castShadow = true));
    scene.add(g);
    products.push({ g, at, x });
  });
}

// ================================================================ camera
const applyCamera = shotCamera(shots.map((s) => (s.rel ? { ...s, rel: V(...s.rel) } : s)));

// ================================================================ render
function renderAt(t) {
  // ---- day / night
  const night =
    smooth(ramp(t, T.nachts - 0.1, T.nachts + 0.5)) *
    (1 - smooth(ramp(t, T.das3 - 0.1, T.das3 + 0.35)));
  setDaylight(1 - night);

  // ---- the can + hand + spray
  const sprayWins = [
    [-1, T.stell],
    [T.deo2, T.verstopft],
    [T.also, T.das3],
  ];
  const spraying = inAny(t, sprayWins);
  const sprayK = spraying ? 1 : 0;
  canParts.act.position.y = 5.56 - (spraying ? 0.07 : 0);
  sprayMist(t, sprayK);
  cloud.visible = spraying && t > T.stell;
  cloud.children.forEach((c, i) => {
    c.position.y = 0.6 + Math.sin(t * 0.8 + i) * 0.15;
    c.position.x += 0;
  });
  // hand presses the actuator
  const hk = (t0, t1) => [
    { t: t0 - 0.6, pos: [CAN[0] + 1.6, 7.6, CAN[2] - 1.9], rot: [0.75, -0.55, 0], pose: "open" },
    { t: t0, pos: [CAN[0] + 0.9, 6.55, CAN[2] - 1.35], rot: [0.85, -0.55, 0], pose: "press" },
    { t: t1 - 0.3, pos: [CAN[0] + 0.88, 6.5, CAN[2] - 1.33], rot: [0.85, -0.55, 0], pose: "press" },
    {
      t: t1,
      pos: [CAN[0] + 1.6, 7.6, CAN[2] - 1.9],
      rot: [0.75, -0.55, 0],
      pose: "open",
      out: true,
    },
  ];
  if (t < T.stell) hand.track(t, hk(-0.4, T.stell + 0.3));
  else if (t < T.achsel) hand.track(t, hk(T.deo2 - 0.2, T.verstopft + 0.6));
  else hand.track(t, hk(T.also - 0.2, T.das3));

  // ---- sweat spurting out of the pores
  spurts(
    t,
    inAny(t, [
      [-1, T.stell],
      [T.deo2, T.verstopft],
      [T.warme - 0.1, T.das2],
    ])
      ? 1
      : 0,
  );

  // ---- hero pore x-ray
  const xWins = [
    [T.deo3 - 0.12, T.nur],
    [T.das2, T.nachts],
    [T.schlafen - 0.1, T.also],
    [T.das3, T.fakt],
  ];
  const xk = inAny(t, xWins) ? 1 : 0;
  setXray(xMats, xk);
  duct.visible = gland.visible = xk > 0;
  glandMat.emissiveIntensity = 0.25 + 0.35 * Math.abs(Math.sin(t * 3));

  // phases of the duct story
  let beadVis = 0;
  let beadSpeed = 0.25;
  let fmax = 1;
  let spill = 0;
  let plugK = 0;
  if (t >= T.deo3 - 0.12 && t < T.nur) {
    // A: salt falls in, sweat arrives, gel, PLOPP
    const fall = ramp(t, T.deo3, T.schweiss1 - 0.1);
    const dis = ramp(t, T.gel - 0.1, T.plopp);
    crystals(t, fall, dis, 0);
    beadVis = smooth(ramp(t, T.schweiss1 - 0.3, T.schweiss1 + 0.2));
    fmax = t < T.plopp ? lerp(0.35, 0.74, ramp(t, T.schweiss1, T.plopp)) : 0.7;
    beadSpeed = 0.3;
    plugK = t >= T.gel ? (t < T.plopp ? 0.35 * ramp(t, T.gel, T.plopp) : 1) : 0;
  } else if (t >= T.das2 && t < T.nachts) {
    // B: morning — the sweat flushes the salt out before it seals
    crystals(t, 1, 0, ramp(t, T.spuelt - 0.1, T.dicht + 0.2));
    beadVis = 1;
    beadSpeed = 0.9;
    fmax = 0.92;
    spill = 1;
    plugK = 0;
  } else if (t >= T.schlafen - 0.1 && t < T.also) {
    // C: night — the glands sleep, the salt sinks in, the plug forms calmly
    const fall = ramp(t, T.schlafen - 0.1, T.druesen);
    const dis = ramp(t, T.druesen - 0.2, T.also - 0.1);
    crystals(t, fall, dis, 0);
    beadVis = 0.8;
    beadSpeed = 0.07;
    fmax = 0.68;
    plugK = smooth(ramp(t, T.druesen - 0.2, T.also - 0.1));
  } else if (t >= T.das3 && t < T.fakt) {
    // D: the morning shower can't wash it out
    salt.visible = false;
    beadVis = 1;
    beadSpeed = 0.28;
    fmax = 0.7;
    plugK = 1;
  } else {
    salt.visible = false;
    plugK = (t >= T.plopp && t < T.aber) || t >= T.also ? 1 : 0;
  }
  sweatBeads(t, beadVis * xk, beadSpeed, fmax, spill);
  plug.visible = plugK > 0.01 && xk > 0;
  if (t >= T.plopp && t < T.nur) plug.scale.copy(squash(t, T.plopp, 0.75));
  else plug.scale.setScalar(Math.max(0.001, plugK));
  if (t >= T.das3 && t < T.fakt) plug.position.y = PLUG_Y + Math.sin(t * 18) * 0.012;
  else plug.position.y = PLUG_Y;
  plugTop.visible = plugK > 0.5;
  showNope(pop(t, T.dicht, T.nachts), 0, 1.0, 1.4, 0.6);

  // ---- shower
  if (t >= T.warme - 0.1 && t < T.das2) shower(t, 1, 0.3, 0.6);
  else if (t >= T.das3 && t < T.fakt) shower(t, 1, 0, 1.2);
  else shower(t, 0, 0, 0);

  // ---- bacteria
  const eat = t >= T.rate && t < T.kein1 ? 1 : 0.25;
  const sad = Math.max(
    smooth(ramp(t, T.kein1 + 0.1, T.futter)) * (1 - ramp(t, T.aber, T.aber + 0.1)),
    smooth(ramp(t, T.fakt, T.fakt + 0.4)) * (1 - ramp(t, T.schuld - 0.1, T.schuld)),
  );
  animateBugs(t, eat, sad);
  const dry = (t >= T.kein1 && t < T.aber) || (t >= T.fakt && t < T.spray) ? 1 : 0;
  bead.visible = !dry;
  bead.scale.set(1 + Math.sin(t * 2) * 0.02, 0.7, 1);
  bacPlug.visible = dry > 0;
  stinkClouds(t, pop(t, T.riechst - 0.1, T.kein1 + 0.4));
  // DNA: the one gene
  const dk = pop(t, T.schuld, T.spray - 0.08);
  dna.visible = dk > 0.01;
  dna.scale.setScalar(Math.max(0.001, dk));
  dna.rotation.y = t * 1.6;

  // ---- the date
  const stainK = smooth(ramp(t, T.kurz + 0.1, T.flecken + 0.4));
  stains.forEach((s) =>
    s.scale.set(Math.max(0.001, stainK) * 1.15, Math.max(0.001, stainK) * 1.5, 1),
  );
  forehead.scale.setScalar(Math.max(0.001, smooth(ramp(t, T.nasse, T.flecken))));
  date.visible = t >= T.stell - 0.5 && t < T.deo2 + 0.5;

  // ---- products
  products.forEach(({ g, at, x }) => {
    g.visible = t >= at;
    if (g.visible) {
      g.scale.copy(squash(t, at, 0.6, g === products[0].g ? 0.24 : 1));
      g.rotation.y = Math.sin(t * 1.2 + x) * 0.25;
    }
    puff("prod" + x, t, at + 0.05, x, 0.05, 0.15, 0.8);
  });

  // ---- clock + LED facts
  if (t >= T.nur && t < T.folge)
    readout("uhr", pop(t, T.nur + 0.1, T.folge), {
      label: "UHRZEIT",
      value: "07:00",
      x: 60,
      y: 420,
    });
  else if (t >= T.aber && t < T.nachts)
    readout("uhr", pop(t, T.aber + 0.05, T.nachts), {
      label: "UHRZEIT",
      value: "07:00",
      x: 60,
      y: 420,
    });
  else if (t >= T.nachts && t < T.also)
    readout("uhr", pop(t, T.nachts + 0.05, T.also), {
      label: "UHRZEIT",
      value: "22:00",
      x: 60,
      y: 420,
      color: LED.blue,
    });
  else readout("uhr", 0);
  if (t >= T.abends && t < T.fakt)
    showPanel(pop(t, T.abends, T.fakt), "DEO DRAUF", "ABENDS", LED.yellow);
  else if (t >= T.korea && t < T.schuld)
    showPanel(pop(t, T.korea, T.schuld), "KOREA", "KAUM GERUCH", LED.green);
  else if (t >= T.schuld && t < T.spray - 0.08)
    showPanel(pop(t, T.schuld, T.spray - 0.08), "SCHULD", "1 GEN", LED.green);
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
