// #67 „Einen Tag nichts trinken“ (Format B). One diorama on a festival
// campsite: you stand at a camping table, your hand flicks the full glass
// away on frame 0 (water flies) and shoves the coffee after it. Then your
// body turns x-ray: the water level inside drops, sweat runs, breath leaves,
// the colour scale slides to dark, the blood thickens, the heart races, the
// brain shrinks and pounds. Rate mal: your breath fills a whole glass. The
// kidneys hold every drop back, the brain dims — and in the driving
// simulator the errors double: you drive almost drunk. Übrigens: the coffee
// counts after all.
import {
  THREE,
  ramp,
  smooth,
  outBack,
  pop,
  lerp,
  clamp01,
  V,
  scene,
  renderer,
  flat,
  real,
  roundedBox,
  rng,
  xrayMaterial,
  xrayEdges,
  setXray,
  showNope,
  showPanel,
  LED,
  labels,
  squash,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import "./set.js";
import { createHand } from "./hand.js";
import { gauge, meter, readout, counter } from "./hud.js";
import { person } from "./people.js";
import { T, shots, LABELS, HIGHLIGHTS, GLASS, CUP, TABLE, SIM } from "./beats.js";

highlights(HIGHLIGHTS);
renderer.localClippingEnabled = true;

const shadows = (g) =>
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = o.receiveShadow = true;
  });

// ================================================================ table
const table = new THREE.Group();
scene.add(table);
{
  const alu = real.metal(0xd4d8de, { roughness: 0.35 });
  const top = new THREE.Mesh(roundedBox(1.5, 0.06, 0.95, 0.025), real.wood(0xc89a62));
  top.position.y = 1.47;
  table.add(top);
  // slat gaps
  for (let i = -3; i <= 3; i++) {
    const gap = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.062, 0.95), flat(0x5a3d22));
    gap.position.set(i * 0.2, 1.471, 0);
    table.add(gap);
  }
  const frame = new THREE.Mesh(roundedBox(1.42, 0.06, 0.88, 0.02), alu);
  frame.position.y = 1.41;
  table.add(frame);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.42, 16), alu);
      leg.position.set(sx * 0.66, 0.71, sz * 0.4);
      leg.rotation.z = sx * 0.06;
      table.add(leg);
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.03, 16), real.rubber());
      foot.position.set(sx * 0.7, 0.015, sz * 0.4);
      table.add(foot);
    }
  // a festival wristband and a crumpled programme on the table
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 10, 32), real.fabric(0xe94b3c));
  band.rotation.x = Math.PI / 2;
  band.position.set(-0.45, 1.51, 0.25);
  table.add(band);
  const prog = new THREE.Mesh(roundedBox(0.3, 0.012, 0.22, 0.004), real.plastic(0xffd23f));
  prog.position.set(-0.3, 1.506, -0.25);
  prog.rotation.y = 0.4;
  table.add(prog);
  table.position.set(TABLE[0], 0, TABLE[2]);
  shadows(table);
}

// ================================================================ glass (hook)
// pivot at the back bottom edge: the glass tips backwards, away from the hand
const GS = 1.35; // a big festival glass, so it reads in frame 0
const glassPivot = new THREE.Group();
glassPivot.position.set(GLASS[0] - 0.085 * GS, GLASS[1], GLASS[2]);
glassPivot.scale.setScalar(GS);
scene.add(glassPivot);
const glassGeo = new THREE.LatheGeometry(
  [
    V(0, 0, 0),
    V(0.07, 0, 0),
    V(0.075, 0.01, 0),
    V(0.085, 0.24, 0),
    V(0.08, 0.24, 0),
    V(0.068, 0.012, 0),
  ],
  64,
);
const glassMesh = new THREE.Mesh(glassGeo, real.glass(0xe8f6ff, { opacity: 0.35 }));
glassMesh.position.x = 0.085;
glassPivot.add(glassMesh);
const waterMat = real.glass(0x4fb8ff, { opacity: 0.55, roughness: 0.05, color: 0x58b9ff });
const glassWater = new THREE.Mesh(new THREE.CylinderGeometry(0.074, 0.068, 0.19, 48), waterMat);
glassWater.position.set(0.085, 0.105, 0);
glassPivot.add(glassWater);
const lemon = new THREE.Mesh(
  new THREE.CylinderGeometry(0.045, 0.045, 0.01, 32),
  real.plastic(0xf6e05a),
);
lemon.position.set(0.1, 0.18, 0);
lemon.rotation.x = 0.5;
glassPivot.add(lemon);

// water drops of the splash (instanced, ballistic)
const DROPS = 70;
const dropMat = new THREE.MeshPhysicalMaterial({
  color: 0x6cc8ff,
  roughness: 0.03,
  transmission: 0,
  clearcoat: 1,
  emissive: 0x1a5f9a,
  emissiveIntensity: 0.35,
});
const drops = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 16, 12), dropMat, DROPS);
drops.frustumCulled = false;
drops.castShadow = true;
scene.add(drops);
const dropData = (() => {
  const r = rng(671);
  return Array.from({ length: DROPS }, () => ({
    vx: -0.5 - r() * 1.4,
    vy: 0.5 + r() * 1.4,
    vz: (r() - 0.5) * 0.9,
    s: 0.006 + r() * 0.018,
    d: r() * 0.18,
  }));
})();
const puddle = new THREE.Mesh(
  new THREE.CircleGeometry(1, 48),
  real.glass(0x7cc9ff, { opacity: 0.5 }),
);
puddle.rotation.x = -Math.PI / 2;
puddle.position.set(GLASS[0] - 0.4, 1.502, GLASS[2]);
scene.add(puddle);

// ================================================================ coffee cup
const cup = new THREE.Group();
scene.add(cup);
{
  const paper = new THREE.Mesh(
    new THREE.LatheGeometry(
      [V(0, 0, 0), V(0.06, 0, 0), V(0.062, 0.006, 0), V(0.08, 0.2, 0), V(0, 0.2, 0)],
      64,
    ),
    real.plastic(0xf7f3ec, { roughness: 0.6 }),
  );
  cup.add(paper);
  const sleeve = new THREE.Mesh(
    new THREE.CylinderGeometry(0.077, 0.068, 0.08, 64, 1, true),
    real.fabric(0x8a5a34),
  );
  sleeve.position.y = 0.11;
  cup.add(sleeve);
  const lid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.084, 0.084, 0.022, 64),
    real.plastic(0x1c1c1f),
  );
  lid.position.y = 0.21;
  cup.add(lid);
  const dome = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.082, 0.018, 64),
    real.plastic(0x1c1c1f),
  );
  dome.position.y = 0.23;
  cup.add(dome);
  shadows(cup);
}
// steam wisps
const STEAM = 14;
const steamMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.35,
  depthWrite: false,
});
const steam = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 8), steamMat, STEAM);
steam.frustumCulled = false;
steam.userData.noAO = true;
scene.add(steam);
// green check (billboard sprite)
function checkSprite() {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 256;
  const c = cv.getContext("2d");
  c.fillStyle = "#2fd36b";
  c.beginPath();
  c.arc(128, 128, 118, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "#fff";
  c.lineWidth = 30;
  c.lineCap = c.lineJoin = "round";
  c.beginPath();
  c.moveTo(70, 132);
  c.lineTo(112, 176);
  c.lineTo(188, 86);
  c.stroke();
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false }));
  s.renderOrder = 10;
  scene.add(s);
  return s;
}
const check = checkSprite();

// ================================================================ you (body)
const body = new THREE.Group();
scene.add(body);
const skinX = xrayMaterial(0xe3a987, { roughness: 0.55 });
const shirtX = xrayMaterial(0xf4f4f0, { roughness: 0.85, side: THREE.DoubleSide });
const shortsX = xrayMaterial(0x3a5a8c, { roughness: 0.9 });
const hatX = xrayMaterial(0xffd23f, { roughness: 0.8 });
const shellMats = [skinX, shirtX, shortsX, hatX];
const edgesGroup = new THREE.Group();
body.add(edgesGroup);
function part(geo, mat, x, y, z, edges = true) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  body.add(m);
  if (edges) {
    const e = xrayEdges(geo);
    e.position.copy(m.position);
    edgesGroup.add(e);
    m.userData.edges = e;
  }
  return m;
}
// torso profile (hips → chest → shoulders), scaled flat in z
const torsoPts = [
  [0.0, 1.62],
  [0.36, 1.64],
  [0.4, 1.8],
  [0.36, 2.05],
  [0.4, 2.35],
  [0.46, 2.6],
  [0.42, 2.72],
  [0.2, 2.8],
  [0.0, 2.82],
].map(([r, y]) => new THREE.Vector2(r, y));
const torsoGeo = new THREE.LatheGeometry(torsoPts, 48);
const torso = part(torsoGeo, skinX, 0, 0, 0, false);
torso.scale.z = 0.62;
const shirtGeo = new THREE.LatheGeometry(
  torsoPts.slice(2).map((p) => new THREE.Vector2(p.x * 1.05 + 0.012, p.y + 0.0)),
  48,
);
const shirt = part(shirtGeo, shirtX, 0, 0, 0);
shirt.scale.z = 0.64;
shirt.userData.edges.scale.z = 0.64;
const shorts = part(new THREE.CylinderGeometry(0.42, 0.44, 0.42, 40), shortsX, 0, 1.66, 0);
shorts.scale.z = 0.66;
shorts.userData.edges.scale.z = 0.66;
part(new THREE.CylinderGeometry(0.1, 0.12, 0.2, 24), skinX, 0, 2.86, 0, false);
const headGeo = new THREE.SphereGeometry(0.27, 48, 32);
const head = part(headGeo, skinX, 0, 3.1, 0.02);
head.scale.set(0.92, 1.08, 1);
head.userData.edges.scale.copy(head.scale);
// bucket hat
const hat = part(
  new THREE.LatheGeometry(
    [
      V(0, 0.2, 0),
      V(0.2, 0.2, 0),
      V(0.25, 0.08, 0),
      V(0.38, 0.0, 0),
      V(0.38, -0.02, 0),
      V(0.0, -0.02, 0),
    ].map((p) => new THREE.Vector2(p.x, p.y)),
    48,
  ),
  hatX,
  0,
  3.25,
  0.02,
);
hat.rotation.x = -0.12;
hat.userData.edges.rotation.x = -0.12;
// face: eyes, brows, nose, mouth (stay solid, small)
const faceMat = flat(0x2a1d18);
const faceParts = [];
for (const s of [-1, 1]) {
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.028, 16, 12), faceMat);
  eye.position.set(s * 0.09, 3.14, 0.255);
  body.add(eye);
  faceParts.push(eye);
  const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.01, 0.06, 4, 8), faceMat);
  brow.rotation.z = Math.PI / 2 + s * 0.15;
  brow.position.set(s * 0.09, 3.2, 0.255);
  body.add(brow);
  faceParts.push(brow);
}
const nose = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), skinX);
nose.position.set(0, 3.08, 0.29);
body.add(nose);
const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.012, 8, 24, Math.PI), flat(0x9a3a3a));
mouth.position.set(0, 3.0, 0.262);
mouth.rotation.z = 0; // a thirsty frown
body.add(mouth);
faceParts.push(mouth);
// arms + legs (capsules)
const limb = (r, len, x, y, z, rz, mat = skinX) => {
  const m = part(new THREE.CapsuleGeometry(r, len, 8, 24), mat, x, y, z);
  m.rotation.z = rz;
  m.userData.edges.rotation.z = rz;
  return m;
};
limb(0.075, 0.55, 0.53, 2.32, 0, 0.12);
limb(0.065, 0.5, 0.6, 1.72, 0.04, 0.05);
limb(0.075, 0.55, -0.53, 2.32, 0, -0.12);
limb(0.065, 0.5, -0.6, 1.72, 0.04, -0.05);
limb(0.11, 0.65, 0.2, 1.05, 0, 0.02);
limb(0.1, 0.6, 0.2, 0.42, 0, 0.0);
limb(0.11, 0.65, -0.2, 1.05, 0, -0.02);
limb(0.1, 0.6, -0.2, 0.42, 0, 0.0);
// sneakers (solid)
for (const s of [-1, 1]) {
  const shoe = new THREE.Mesh(roundedBox(0.2, 0.12, 0.38, 0.05), real.plastic(0xf4f4f4));
  shoe.position.set(s * 0.2, 0.06, 0.07);
  shoe.castShadow = true;
  body.add(shoe);
  const sole = new THREE.Mesh(roundedBox(0.21, 0.035, 0.39, 0.015), real.rubber(0xe94b3c));
  sole.position.set(s * 0.2, 0.018, 0.07);
  body.add(sole);
}

// ---------------------------------------------------------------- inside
const inner = new THREE.Group();
body.add(inner);
// water inside the torso — a blue copy clipped at the falling level
const waterPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 2.7);
const bodyWaterMat = new THREE.MeshStandardMaterial({
  color: 0x2f9bff,
  emissive: 0x0e5aa8,
  emissiveIntensity: 0.4,
  transparent: true,
  opacity: 0.55,
  roughness: 0.15,
  clippingPlanes: [waterPlane],
  depthWrite: false,
});
const bodyWater = new THREE.Mesh(torsoGeo, bodyWaterMat);
bodyWater.scale.set(0.9, 0.98, 0.56);
bodyWater.position.y = 0.04;
inner.add(bodyWater);
// water surface disc
const surf = new THREE.Mesh(
  new THREE.CircleGeometry(1, 48),
  new THREE.MeshBasicMaterial({
    color: 0x9fe0ff,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
  }),
);
surf.rotation.x = -Math.PI / 2;
inner.add(surf);
// brain
const brainGeo = new THREE.SphereGeometry(0.2, 64, 48);
{
  const p = brainGeo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n =
      1 + 0.06 * Math.sin(v.x * 70) * Math.cos(v.y * 60 + v.z * 40) + 0.03 * Math.sin(v.z * 110);
    v.multiplyScalar(n);
    if (Math.abs(v.x) < 0.012) v.multiplyScalar(0.94); // the split between halves
    p.setXYZ(i, v.x, v.y, v.z);
  }
  brainGeo.computeVertexNormals();
}
const brainMat = new THREE.MeshPhysicalMaterial({
  color: 0xf29bb0,
  roughness: 0.45,
  clearcoat: 0.5,
  emissive: 0x5a1f2a,
  emissiveIntensity: 0.2,
});
const brain = new THREE.Mesh(brainGeo, brainMat);
brain.position.set(0, 3.14, 0.0);
brain.scale.set(0.95, 0.8, 1.1);
inner.add(brain);
// thought sparks around the brain (concentration)
const SPARK = 18;
const sparks = new THREE.InstancedMesh(
  new THREE.OctahedronGeometry(1, 0),
  new THREE.MeshBasicMaterial({ color: 0xfff3a0, toneMapped: false }),
  SPARK,
);
sparks.frustumCulled = false;
sparks.userData.noAO = true;
inner.add(sparks);
// heart
const heart = new THREE.Group();
{
  const hm = new THREE.MeshPhysicalMaterial({
    color: 0xd8242f,
    roughness: 0.35,
    clearcoat: 0.6,
    emissive: 0x6a0a10,
    emissiveIntensity: 0.4,
  });
  for (const s of [-1, 1]) {
    const lobe = new THREE.Mesh(new THREE.SphereGeometry(0.075, 32, 24), hm);
    lobe.position.set(s * 0.05, 0.03, 0);
    heart.add(lobe);
  }
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.105, 0.17, 32), hm);
  tip.rotation.z = Math.PI;
  tip.position.y = -0.07;
  heart.add(tip);
  const aorta = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.02, 12, 24, Math.PI), hm);
  aorta.position.set(0, 0.1, 0);
  heart.add(aorta);
}
heart.position.set(0.1, 2.44, 0.06);
heart.rotation.z = -0.35;
inner.add(heart);
// kidneys
const kidneys = [];
const kidMat = new THREE.MeshPhysicalMaterial({
  color: 0xc8504a,
  roughness: 0.4,
  clearcoat: 0.5,
  emissive: 0xffb02e,
  emissiveIntensity: 0,
});
for (const s of [-1, 1]) {
  const k = new THREE.Mesh(new THREE.SphereGeometry(0.12, 32, 24), kidMat);
  k.scale.set(0.7, 1.15, 0.6);
  k.position.set(s * 0.17, 1.9, -0.1);
  k.rotation.z = s * 0.25;
  inner.add(k);
  kidneys.push(k);
}
// blood loop: heart → down to the legs → up the other side → heart
const bloodCurve = new THREE.CatmullRomCurve3(
  [
    V(0.1, 2.44, 0.08),
    V(0.3, 2.3, 0.05),
    V(0.28, 1.9, 0.05),
    V(0.2, 1.3, 0.04),
    V(0.2, 0.6, 0.03),
    V(-0.2, 0.6, 0.03),
    V(-0.2, 1.3, 0.04),
    V(-0.28, 1.9, 0.05),
    V(-0.3, 2.35, 0.05),
    V(-0.1, 2.6, 0.07),
  ],
  true,
);
const vessel = new THREE.Mesh(
  new THREE.TubeGeometry(bloodCurve, 200, 0.022, 10, true),
  new THREE.MeshStandardMaterial({
    color: 0xff6a70,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  }),
);
inner.add(vessel);
const BEADS = 70;
const beadMat = new THREE.MeshStandardMaterial({
  color: 0xff2a3a,
  emissive: 0x8a0a14,
  emissiveIntensity: 0.5,
  roughness: 0.4,
});
const beads = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 8), beadMat, BEADS);
beads.frustumCulled = false;
inner.add(beads);
// kidney drops (held back)
const KD = 8;
const kdrops = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 8), dropMat, KD);
kdrops.frustumCulled = false;
inner.add(kdrops);
// pain rings around the head
const rings = [0, 1, 2].map(() => {
  const m = new THREE.Mesh(
    new THREE.TorusGeometry(0.4, 0.018, 8, 64),
    new THREE.MeshBasicMaterial({
      color: 0xff3b2b,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  m.position.set(0, 3.12, 0.02);
  m.userData.noAO = true;
  body.add(m);
  return m;
});
// sweat drops (forehead → cheek)
const SW = 5;
const sweat = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 16, 12), dropMat, SW);
sweat.frustumCulled = false;
body.add(sweat);
// breath puffs
const BR = 26;
const breathMat = new THREE.MeshBasicMaterial({
  color: 0xf2fbff,
  transparent: true,
  opacity: 0.45,
  depthWrite: false,
});
const breath = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 8), breathMat, BR);
breath.frustumCulled = false;
breath.userData.noAO = true;
scene.add(breath);
// the big "breath glass" for the Rate-mal moment
const bigGlass = new THREE.Group();
scene.add(bigGlass);
const BG = V(1.15, 2.05, 1.25);
{
  const g = new THREE.Mesh(
    glassGeo,
    real.glass(0xe8f6ff, { opacity: 0.4, side: THREE.DoubleSide }),
  );
  g.scale.setScalar(2.4);
  bigGlass.add(g);
}
const bigWater = new THREE.Mesh(
  new THREE.CylinderGeometry(0.074 * 2.3, 0.068 * 2.3, 1, 48),
  new THREE.MeshStandardMaterial({
    color: 0x3aa8ff,
    emissive: 0x0d5aa8,
    emissiveIntensity: 0.45,
    roughness: 0.1,
    transparent: true,
    opacity: 0.85,
  }),
);
bigWater.renderOrder = 2;
bigGlass.add(bigWater);
bigGlass.position.copy(BG);

// urine colour scale (5 tiles + marker), floating left of you
const scale = new THREE.Group();
scene.add(scale);
const SCALE_COLORS = [0xfdf6c8, 0xf9ea8a, 0xf2cf45, 0xe0a52a, 0xb5711c];
SCALE_COLORS.forEach((c, i) => {
  const tile = new THREE.Mesh(roundedBox(0.22, 0.16, 0.05, 0.03), real.gloss(c));
  tile.position.set(0, 0.42 - i * 0.2, 0);
  scale.add(tile);
});
const marker = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 24), real.gloss(0xff3b2b));
marker.rotation.z = -Math.PI / 2;
scale.add(marker);
scale.position.set(-0.95, 2.05, 0.45);
scale.rotation.y = 0.45;
shadows(scale);

// ================================================================ simulator
const sim = new THREE.Group();
scene.add(sim);
const simCv = document.createElement("canvas");
simCv.width = 768;
simCv.height = 320;
const simTex = new THREE.CanvasTexture(simCv);
simTex.colorSpace = THREE.SRGBColorSpace;
{
  const base = new THREE.Mesh(roundedBox(2.4, 0.18, 2.6, 0.06), real.plastic(0x2a2c33));
  base.position.y = 0.09;
  sim.add(base);
  const stripe = new THREE.Mesh(roundedBox(2.42, 0.04, 2.62, 0.02), real.plastic(0xffd23f));
  stripe.position.y = 0.17;
  sim.add(stripe);
  // seat
  const seat = new THREE.Mesh(roundedBox(0.7, 0.18, 0.7, 0.07), real.fabric(0x1e1f24));
  seat.position.set(0, 0.85, 0.55);
  sim.add(seat);
  const back = new THREE.Mesh(roundedBox(0.7, 1.0, 0.16, 0.07), real.fabric(0x1e1f24));
  back.position.set(0, 1.4, 0.88);
  back.rotation.x = -0.2;
  sim.add(back);
  const seatBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.18, 0.6, 24),
    real.metal(0x9aa0a8),
  );
  seatBase.position.set(0, 0.48, 0.55);
  sim.add(seatBase);
  // wheel column + wheel
  const col = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.06, 0.95, 24),
    real.metal(0x9aa0a8),
  );
  col.position.set(0, 0.6, -0.25);
  sim.add(col);
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.03, 16, 48), real.rubber(0x18181b));
  wheel.position.set(0, 1.22, -0.12);
  wheel.rotation.x = -0.9;
  sim.add(wheel);
  sim.userData.wheel = wheel;
  const pedal = new THREE.Mesh(roundedBox(0.4, 0.06, 0.2, 0.02), real.metal(0x9aa0a8));
  pedal.position.set(0, 0.26, -0.45);
  sim.add(pedal);
  // curved screen (3 panels) on a stand
  const stand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.08, 1.6, 24),
    real.metal(0x6a6f78),
  );
  stand.position.set(0, 0.95, -1.5);
  sim.add(stand);
  const scr = new THREE.Mesh(
    new THREE.CylinderGeometry(2.0, 2.0, 0.85, 64, 1, true, Math.PI - 0.6, 1.2),
    new THREE.MeshBasicMaterial({ map: simTex, side: THREE.DoubleSide, toneMapped: false }),
  );
  scr.position.set(0, 1.85, 0.75);
  sim.add(scr);
  const bezel = new THREE.Mesh(
    new THREE.CylinderGeometry(2.03, 2.03, 0.93, 64, 1, true, Math.PI - 0.62, 1.24),
    real.plastic(0x111114, { side: THREE.BackSide }),
  );
  bezel.position.copy(scr.position);
  sim.add(bezel);
  sim.userData.scr = scr;
}
// the test driver
const driver = person({ top: 0xe94b3c, legs: 0x2f3a4f, hair: 0x6a4a2a, seed: 5 });
driver.g.scale.setScalar(0.27);
driver.g.position.set(0, 0.95, 0.5);
driver.g.rotation.y = Math.PI;
sim.add(driver.g);
sim.position.set(SIM[0], 0, SIM[2]);
shadows(sim);

function drawSim(t) {
  const c = simCv.getContext("2d");
  const W_ = simCv.width;
  const H_ = simCv.height;
  const err = ramp(t, T.doppelt - 0.5, T.faehrst);
  const drunk = ramp(t, T.faehrst - 0.2, T.betrunken + 0.4);
  const drift = Math.sin(t * 1.7) * (0.05 + 0.35 * err + 0.2 * drunk);
  const passes =
    drunk > 0
      ? [
          [-1, 0.55],
          [1, 0.55],
        ]
      : [[0, 1]];
  // sky + ground
  const sk = c.createLinearGradient(0, 0, 0, H_ * 0.45);
  sk.addColorStop(0, "#5fa8e6");
  sk.addColorStop(1, "#cfe6f5");
  c.fillStyle = sk;
  c.fillRect(0, 0, W_, H_ * 0.45);
  c.fillStyle = "#6f9a43";
  c.fillRect(0, H_ * 0.45, W_, H_);
  for (const [o, a] of passes) {
    c.globalAlpha = a;
    const off = o * 26 * drunk + drift * W_ * 0.4;
    const hx = W_ / 2 + off * 0.3;
    c.fillStyle = "#4a4d55";
    c.beginPath();
    c.moveTo(hx - 12, H_ * 0.45);
    c.lineTo(hx + 12, H_ * 0.45);
    c.lineTo(W_ / 2 + 420 + off, H_);
    c.lineTo(W_ / 2 - 420 + off, H_);
    c.fill();
    // dashed centre line + edge lines
    c.strokeStyle = "#ffffff";
    c.lineWidth = 6;
    for (const e of [-1, 1]) {
      c.beginPath();
      c.moveTo(hx + e * 11, H_ * 0.45);
      c.lineTo(W_ / 2 + e * 400 + off, H_);
      c.stroke();
    }
    c.strokeStyle = "#ffd23f";
    for (let i = 0; i < 8; i++) {
      const f = ((i / 8 + t * 0.9) % 1) ** 2;
      const f2 = Math.min(1, f + 0.05);
      const y1 = H_ * 0.45 + f * H_ * 0.55;
      const y2 = H_ * 0.45 + f2 * H_ * 0.55;
      c.lineWidth = 2 + f * 10;
      c.beginPath();
      c.moveTo(hx + (W_ / 2 + off - hx) * f, y1);
      c.lineTo(hx + (W_ / 2 + off - hx) * f2, y2);
      c.stroke();
    }
  }
  c.globalAlpha = 1;
  // car hood
  c.fillStyle = "#c8202c";
  c.beginPath();
  c.ellipse(W_ / 2, H_ + 40, 300, 90, 0, Math.PI, 0);
  c.fill();
  // error flashes
  const flashK = err > 0 && err < 1 ? Math.max(0, Math.sin(t * 14)) : 0;
  if (flashK > 0.5) {
    c.fillStyle = "rgba(255,40,40,0.28)";
    c.fillRect(0, 0, W_, H_);
  }
  simTex.needsUpdate = true;
}

// ================================================================ hand
const hand = createHand({ scale: 0.36, sleeve: 0xe94b3c, skin: 0xe3a987 });
const applyCamera = shotCamera(shots);

// ================================================================ render
const m4 = new THREE.Matrix4();
const q = new THREE.Quaternion();
const vS = V(1, 1, 1);
const vP = V(0, 0, 0);
const tipT0 = -0.35; // the glass starts tipping just before frame 0

function renderAt(t) {
  const s1 = T.schluck;
  // ---------------------------------------------------------- hand
  hand.track(t, [
    { t: -0.9, pos: [2.15, 1.72, 1.1], rot: [0.1, -Math.PI / 2, 0], pose: "open" },
    { t: tipT0, pos: [1.62, 1.7, 1.1], rot: [0.15, -Math.PI / 2, 0], pose: "open" },
    { t: 0.35, pos: [1.42, 1.68, 1.1], rot: [0.2, -Math.PI / 2, 0], pose: "open" },
    { t: s1 - 0.1, pos: [1.6, 1.7, 1.15], rot: [0.2, -Math.PI / 2, 0], pose: "open" },
    { t: s1 + 0.25, pos: [1.86, 1.6, 1.25], rot: [0.2, Math.PI + 0.2, 0], pose: "open" },
    { t: s1 + 0.7, pos: [1.88, 1.6, 0.98], rot: [0.2, Math.PI + 0.2, 0], pose: "open" },
    { t: s1 + 1.3, pos: [1.95, 1.62, 0.72], rot: [0.2, Math.PI + 0.2, 0], pose: "open" },
    { t: T.harmlos, pos: [2.2, 1.7, 1.4], rot: [0.2, Math.PI, 0], pose: "open", out: true },
  ]);

  // ---------------------------------------------------------- glass tips
  const tip = smooth(ramp(t, tipT0, 0.55));
  glassPivot.rotation.z = tip * (Math.PI / 2 - 0.05);
  glassWater.scale.y = Math.max(0.001, 1 - ramp(t, -0.1, 0.5));
  glassWater.position.y = 0.105 - 0.095 * ramp(t, -0.1, 0.5);
  // splash drops
  for (let i = 0; i < DROPS; i++) {
    const d = dropData[i];
    const tt = t - (-0.15 + d.d);
    const live = tt > 0 && tt < 1.4;
    if (!live) {
      vS.setScalar(0.0001);
      vP.set(0, -10, 0);
    } else {
      const g = 4.5;
      let y = GLASS[1] + 0.25 + d.vy * tt - 0.5 * g * tt * tt;
      const x = GLASS[0] - 0.15 + d.vx * tt;
      const z = GLASS[2] + d.vz * tt;
      if (y < 1.505) y = 1.505; // lands on the table
      vP.set(x, y, z);
      const fade = 1 - ramp(tt, 1.0, 1.4);
      vS.set(d.s * (y <= 1.506 ? 1.6 : 1.5), d.s * (y <= 1.506 ? 0.3 : 0.9), d.s).multiplyScalar(
        fade + 0.001,
      );
    }
    m4.compose(vP, q, vS);
    drops.setMatrixAt(i, m4);
  }
  drops.instanceMatrix.needsUpdate = true;
  drops.visible = t < 2;
  const pud = smooth(ramp(t, 0.15, 1.6));
  puddle.scale.set(0.05 + 0.42 * pud, 0.05 + 0.3 * pud, 1);
  puddle.visible = pud > 0;

  // ---------------------------------------------------------- coffee
  const shove = smooth(ramp(t, s1 + 0.5, s1 + 1.3));
  cup.position.set(CUP[0] + 0.12 * shove, CUP[1], CUP[2] - 0.3 * shove);
  cup.rotation.z = Math.sin(shove * Math.PI) * 0.08;
  showNope(pop(t, s1 + 0.9, T.harmlos), CUP[0] + 0.1, CUP[1] + 0.45, CUP[2] - 0.2, 0.25);
  // steam + check only for the Übrigens
  const fact = pop(t, T.fakt, 99);
  steam.visible = fact > 0;
  if (fact > 0) {
    for (let i = 0; i < STEAM; i++) {
      const ph = (t * 0.45 + i / STEAM) % 1;
      vP.set(
        cup.position.x + Math.sin(ph * 6 + i) * 0.03 * (1 + ph * 2),
        cup.position.y + 0.25 + ph * 0.45,
        cup.position.z + Math.cos(ph * 5 + i * 2) * 0.03,
      );
      vS.setScalar((0.02 + ph * 0.05) * fact * Math.sin(ph * Math.PI));
      m4.compose(vP, q, vS);
      steam.setMatrixAt(i, m4);
    }
    steam.instanceMatrix.needsUpdate = true;
  }
  check.visible = fact > 0;
  check.scale.setScalar(Math.max(0.001, 0.22 * outBack(clamp01((t - T.fakt - 0.4) / 0.4))));
  check.position.set(cup.position.x + 0.2, cup.position.y + 0.38, cup.position.z + 0.05);

  // ---------------------------------------------------------- x-ray windows
  const xr = Math.max(
    smooth(ramp(t, T.koerper - 0.1, T.koerper + 0.4)) *
      (1 - ramp(t, T.schwitzen - 0.2, T.schwitzen)),
    smooth(ramp(t, T.mittag - 0.1, T.mittag + 0.3)) * (1 - ramp(t, T.folge - 0.2, T.folge)),
    smooth(ramp(t, T.nieren - 0.2, T.nieren + 0.2)) * (1 - ramp(t, T.forscher - 0.2, T.forscher)),
  );
  setXray(shellMats, xr);
  faceParts.forEach((f) => (f.visible = xr < 0.5));
  inner.visible = xr > 0.02;
  // water level drops over the day (exaggerated so it reads)
  const day = ramp(t, T.koerper, T.konzentration);
  const level = lerp(2.68, 2.08, day);
  waterPlane.constant = level;
  surf.position.y = level;
  const rAt = (y) => {
    // radius of the torso profile at height y (scaled like the water copy)
    for (let i = 0; i < torsoPts.length - 1; i++) {
      const a = torsoPts[i];
      const b = torsoPts[i + 1];
      if (y >= a.y && y <= b.y) return lerp(a.x, b.x, (y - a.y) / (b.y - a.y)) * 0.9 - 0.01;
    }
    return 0.3;
  };
  const rr = rAt(level);
  surf.scale.set(rr, rr * 0.62, 1);
  surf.position.z = 0;
  // blood: thicker + slower after "dicker", darker
  const thick = smooth(ramp(t, T.blut, T.herz));
  beadMat.color.setRGB(lerp(1, 0.55, thick), lerp(0.16, 0.03, thick), lerp(0.23, 0.08, thick));
  const speed = lerp(0.22, 0.12, thick);
  for (let i = 0; i < BEADS; i++) {
    const u = (i / BEADS + t * speed) % 1;
    bloodCurve.getPointAt(u, vP);
    vS.setScalar(lerp(0.016, 0.026, thick));
    m4.compose(vP, q, vS);
    beads.setMatrixAt(i, m4);
  }
  beads.instanceMatrix.needsUpdate = true;
  // heart rate
  const fast = smooth(ramp(t, T.herz, T.herz + 1));
  const hz = lerp(1.2, 2.0, fast);
  const beat = Math.pow(Math.max(0, Math.sin(t * hz * Math.PI * 2)), 8);
  heart.scale.setScalar(1 + 0.18 * beat);
  // brain shrinks, then the concentration dims
  const shrink = smooth(ramp(t, T.schrumpft, T.schrumpft + 1.2));
  const bs = 1 - 0.12 * shrink;
  brain.scale.set(0.95 * bs, 0.8 * bs, 1.1 * bs);
  brain.position.y = 3.14 - 0.03 * shrink;
  const dim = smooth(ramp(t, T.konzentration, T.konzentration + 0.8));
  brainMat.color.setRGB(lerp(0.95, 0.55, dim), lerp(0.6, 0.47, dim), lerp(0.69, 0.5, dim));
  const sparkK = pop(t, T.prozent - 0.6, T.forscher) * (1 - dim);
  sparks.visible = sparkK > 0.01;
  for (let i = 0; i < SPARK; i++) {
    const a = i * 2.39996 + t * 0.6;
    const yy = Math.sin(i * 1.7 + t * 0.9) * 0.12;
    vP.set(Math.cos(a) * 0.3, 3.14 + yy, Math.sin(a) * 0.3);
    const tw = 0.5 + 0.5 * Math.sin(t * 9 + i * 3);
    vS.setScalar(0.018 * sparkK * (0.4 + tw));
    m4.compose(vP, q, vS);
    sparks.setMatrixAt(i, m4);
  }
  sparks.instanceMatrix.needsUpdate = true;
  // kidneys glow and hold drops back
  const kid = pop(t, T.nieren, T.forscher);
  kidMat.emissiveIntensity = kid * (0.6 + 0.4 * Math.sin(t * 6));
  kdrops.visible = kid > 0.01;
  for (let i = 0; i < KD; i++) {
    const s = i % 2 ? -1 : 1;
    const ph = (t * 0.9 + i * 0.27) % 1;
    const y = 1.78 - Math.sin(ph * Math.PI) * 0.28; // falls, turns, goes back up
    vP.set(s * 0.17 + Math.sin(i) * 0.03, y, -0.1 + 0.06);
    vS.setScalar(0.022 * kid);
    m4.compose(vP, q, vS);
    kdrops.setMatrixAt(i, m4);
  }
  kdrops.instanceMatrix.needsUpdate = true;
  // pain rings
  const pain = pop(t, T.haemmert, T.folge);
  rings.forEach((r, i) => {
    const ph = (t * 1.6 + i / 3) % 1;
    r.visible = pain > 0.01;
    r.scale.setScalar(0.7 + ph * 0.9);
    r.material.opacity = pain * (1 - ph) * 0.9;
    r.rotation.x = Math.PI / 2;
  });
  // sweat drops slide down
  const sw = pop(t, T.schwitzen, T.atemzug + 0.5);
  sweat.visible = sw > 0.01;
  for (let i = 0; i < SW; i++) {
    const ph = (t * 0.35 + i * 0.21) % 1;
    const a = -0.5 + i * 0.25;
    const yy = 3.24 - ph * 0.3;
    const rH = 0.27 * Math.sqrt(Math.max(0, 1 - ((yy - 3.1) / 0.3) ** 2)) + 0.012;
    vP.set(Math.sin(a) * rH * 0.92, yy, 0.02 + Math.cos(a) * rH);
    vS.set(0.016, 0.022, 0.016).multiplyScalar(sw);
    m4.compose(vP, q, vS);
    sweat.setMatrixAt(i, m4);
  }
  sweat.instanceMatrix.needsUpdate = true;
  // breath: puffs in the Atemzug shot, a stream into the big glass on "Atmen"
  const br1 = pop(t, T.atemzug, T.mittag);
  const br2 = pop(t, T.atmen - 0.2, T.glas + 0.6);
  breath.visible = br1 + br2 > 0.01;
  const mouthP = V(0, 3.0, 0.3);
  for (let i = 0; i < BR; i++) {
    const ph = (t * 0.8 + i / BR) % 1;
    if (br2 > 0.01) {
      // stream to the glass rim
      const tgt = V(BG.x, BG.y + 0.62, BG.z);
      vP.copy(mouthP).lerp(tgt, ph);
      vP.y += Math.sin(ph * Math.PI) * 0.15;
      vS.setScalar((0.025 + 0.03 * Math.sin(ph * Math.PI)) * br2);
    } else {
      vP.set(Math.sin(i * 2.1) * 0.05 * ph, 3.0 + Math.sin(i) * 0.03 * ph, 0.3 + ph * 0.6);
      vS.setScalar((0.02 + 0.06 * ph) * br1 * (1 - ph));
    }
    m4.compose(vP, q, vS);
    breath.setMatrixAt(i, m4);
  }
  breath.instanceMatrix.needsUpdate = true;
  breathMat.opacity = 0.45;
  // big glass fills up
  const bgK = pop(t, T.rate + 0.3, T.nieren);
  bigGlass.visible = bgK > 0.01;
  bigGlass.scale.copy(squash(t, T.rate + 0.3)).multiplyScalar(Math.max(0.001, bgK));
  const fill = smooth(ramp(t, T.atmen, T.glas + 0.3));
  const fh = 0.5 * fill + 0.001;
  bigWater.scale.set(1, fh, 1);
  bigWater.position.y = 0.03 + fh / 2;
  // colour scale: appears on Mittag, marker slides to dark on "dunkel"
  const sc = pop(t, T.mittag, T.nachmittag);
  scale.visible = sc > 0.01;
  scale.scale.setScalar(Math.max(0.001, sc));
  const mk = smooth(ramp(t, T.pipi, T.dunkel + 0.3));
  marker.position.set(-0.2, 0.42 - mk * 0.8, 0);

  // ---------------------------------------------------------- simulator
  if (t > T.forscher - 1) drawSim(t);
  const err = ramp(t, T.doppelt - 0.5, T.faehrst);
  sim.userData.wheel.rotation.z = Math.sin(t * 1.7) * (0.1 + 0.6 * err);
  driver.g.rotation.z = Math.sin(t * 1.7) * 0.04 * err;
  showNope(
    Math.max(pop(t, s1 + 0.9, T.harmlos) > 0 ? 0 : 0, pop(t, T.fehler, T.faehrst)),
    SIM[0],
    2.6,
    SIM[2] - 0.6,
    0.45,
  );
  if (pop(t, s1 + 0.9, T.harmlos) > 0)
    showNope(pop(t, s1 + 0.9, T.harmlos), CUP[0] + 0.1, CUP[1] + 0.45, CUP[2] - 0.2, 0.25);

  // ---------------------------------------------------------- HUD
  // water in the body (meter) while x-ray shows it
  const wK = pop(t, T.koerper + 0.2, T.schwitzen) + pop(t, T.mittag, T.nachmittag);
  meter("wasser", Math.min(1, wK), {
    label: "WASSER IM KÖRPER",
    value: lerp(1, 0.985, ramp(t, T.koerper, T.dunkel)),
    text: `${lerp(100, 98.5, ramp(t, T.koerper, T.dunkel))
      .toFixed(1)
      .replace(".", ",")} %`,
    x: 70,
    y: 470,
    width: 470,
    color: "#4fc3ff",
  });
  readout("pipi", pop(t, T.dunkel - 0.1, T.nachmittag), {
    label: "PIPI-FARBE",
    value: "dunkel",
    x: 600,
    y: 470,
    color: "#ffb02e",
  });
  gauge("puls", pop(t, T.herz, T.gehirn), {
    label: "PULS",
    value: Math.round(lerp(72, 94, smooth(ramp(t, T.herz, T.herz + 1.4)))),
    max: 160,
    unit: "/min",
    x: 70,
    y: 430,
    color: "#ff4b2b",
  });
  meter("konz", pop(t, T.konzentration - 0.2, T.forscher), {
    label: "KONZENTRATION",
    value: lerp(1, 0.55, dim),
    x: 70,
    y: 1260,
    width: 470,
    color: dim > 0.5 ? "#ff4b2b" : "#3dff7a",
  });
  counter("fehler", pop(t, T.doppelt - 0.2, T.fakt), {
    label: "FEHLER",
    value: Math.round(lerp(47, 101, smooth(ramp(t, T.doppelt, T.faehrst)))),
    x: 70,
    y: 1240,
    color: "#ff4b2b",
  });

  // LED panel: one fact at a time
  if (t >= T.glas && t < T.nieren) {
    showPanel(pop(t, T.glas, T.nieren), "NUR DURCHS ATMEN", "1 GLAS/TAG", LED.blue);
  } else if (t >= T.prozent && t < T.forscher) {
    showPanel(pop(t, T.prozent, T.forscher), "WENIGER WASSER", "−2 %", LED.red);
  } else if (t >= T.betrunken && t < T.fakt) {
    showPanel(pop(t, T.betrunken, T.fakt), "WIE MIT", "0,8 ‰", LED.red);
  } else if (t >= T.mengen && t < T.wie) {
    showPanel(pop(t, T.mengen, T.wie), "KAFFEE", "ZÄHLT MIT", LED.green);
  } else {
    showPanel(0);
  }

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
