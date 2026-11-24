// #95 Waxing — the studio (leg on the bed, the strip, your hand) and the
// SKIN world: a giant cut-away of the skin with hairs as stalks and their
// roots as bulbs; wax flows around them, the strip rips them out root and
// all; the razor only cuts them; every front-row root hangs on a nerve that
// runs to the spinal cord, where pressure (blue, fast) closes a gate before
// the pain (red, slow) arrives — and the pain bounces off.
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
  clamp01,
  lerp,
  showPanel,
  LED,
  labels,
  puff,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { studio, POT, SKIN_POS, waxM } from "./set.js";
import { createHand } from "./hand.js";
import { counter } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS, BEET, CORD } from "./beats.js";

highlights(HIGHLIGHTS);
void studio;

const col = (h) => new THREE.Color(h);
const SKIN = col(0xf0c4a4);
const RED = col(0xe0525a);
const easeOut = (x) => 1 - (1 - x) * (1 - x) * (1 - x);

// ================================================================= STUDIO
// ---------------------------------------------------------------- legs
const person = new THREE.Group();
scene.add(person);
const legs = [];
function limb(points, radii, hot) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => V(...p)));
  const SEG = 90;
  const RAD = 40;
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
      if (hot) {
        const dx = (q.x - hot[0]) / 0.5;
        const dy = Math.max(0, hot[1] - q.y) / 0.16;
        const dz = (q.z - hot[2]) / 0.3;
        ww = Math.exp(-(dx ** 4) - dy * dy - dz * dz);
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
  legs.push({ geo, w });
  return m;
}
const skinMat = real.skin(0xf0c4a4);
const LEG_Z = 0.3;
// near leg: hip under the towel → knee → shin (origin) → ankle
limb(
  [
    [-4.5, 1.98, LEG_Z],
    [-3.0, 1.95, LEG_Z],
    [-1.5, 1.85, LEG_Z],
    [0, 1.82, LEG_Z],
    [1.3, 1.77, LEG_Z],
  ],
  [0.36, 0.32, 0.25, 0.22, 0.235, 0.18, 0.13],
  [0, 2.03, LEG_Z],
);
limb(
  [
    [-4.5, 1.98, -0.5],
    [-3.0, 1.94, -0.52],
    [-1.5, 1.84, -0.55],
    [0, 1.81, -0.58],
    [1.25, 1.76, -0.6],
  ],
  [0.36, 0.32, 0.25, 0.22, 0.235, 0.18, 0.13],
  null,
);
function paintLegs(k) {
  for (const L of legs) {
    const c = L.geo.attributes.color;
    for (let i = 0; i < L.w.length; i++) {
      const ww = L.w[i] * k;
      c.setXYZ(i, lerp(SKIN.r, RED.r, ww), lerp(SKIN.g, RED.g, ww), lerp(SKIN.b, RED.b, ww));
    }
    c.needsUpdate = true;
  }
}
// feet (toes up) with toenails
for (const [x, z, ry] of [
  [1.42, LEG_Z, 0],
  [1.37, -0.6, 0.1],
]) {
  const f = new THREE.Group();
  f.position.set(x, 1.62, z);
  f.rotation.set(0, ry, -0.22);
  person.add(f);
  const foot = new THREE.Mesh(roundedBox(0.24, 0.6, 0.36, 0.1, 6), skinMat);
  foot.position.set(0.02, 0.3, 0);
  foot.castShadow = true;
  f.add(foot);
  for (let i = 0; i < 5; i++) {
    const toe = new THREE.Mesh(new THREE.SphereGeometry(0.045 - i * 0.004, 20, 14), skinMat);
    toe.position.set(0.03, 0.62 - i * 0.012, -0.13 + i * 0.065);
    toe.scale.set(1, 1.4, 1);
    f.add(toe);
    const nail = new THREE.Mesh(
      new THREE.SphereGeometry(0.03 - i * 0.003, 16, 10),
      real.gloss(0xd9636e, { roughness: 0.2 }),
    );
    nail.position.set(0.065, 0.63 - i * 0.012, -0.13 + i * 0.065);
    nail.scale.set(0.4, 1, 1);
    f.add(nail);
  }
}
// towel over the hips
{
  const tw = new THREE.Mesh(roundedBox(2.0, 0.62, 2.1, 0.25, 6), real.fabric(0xf5efe6));
  tw.position.set(-4.1, 2.05, -0.1);
  tw.castShadow = tw.receiveShadow = true;
  person.add(tw);
  const fold = new THREE.Mesh(roundedBox(0.3, 0.66, 2.14, 0.12, 4), real.fabric(0xece3d6));
  fold.position.set(-3.15, 2.06, -0.1);
  person.add(fold);
}

// ---------------------------------------------------------------- fine hairs on the shin
const SH_N = 220;
const shinHairs = (() => {
  const geo = new THREE.CylinderGeometry(0.0014, 0.0024, 0.045, 5);
  geo.translate(0, 0.025, 0);
  const im = new THREE.InstancedMesh(geo, real.plastic(0x6e5038, { roughness: 0.6 }), SH_N);
  const r = rng(31);
  const info = [];
  const o = new THREE.Object3D();
  for (let i = 0; i < SH_N; i++) {
    const x = -1.25 + r() * 2.5;
    const cy = 1.82 + -x * 0.026;
    const rad = 0.215 + (x < 0 ? x * 0.012 : -x * 0.03);
    const phi = (r() - 0.5) * 2.0;
    o.position.set(x, cy + Math.cos(phi) * rad, LEG_Z + Math.sin(phi) * rad);
    o.rotation.set(phi, 0, -1.15 + (r() - 0.5) * 0.4);
    o.updateMatrix();
    im.setMatrixAt(i, o.matrix);
    info.push({ x, m: o.matrix.clone() });
  }
  im.castShadow = false;
  person.add(im);
  return { im, info };
})();
const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
function setShinHairs(mode) {
  // mode: "all" | "ripped" (none under the strip) | "none"
  shinHairs.info.forEach((h, i) => {
    const show = mode === "all" || (mode === "ripped" && Math.abs(h.x) > 0.5);
    shinHairs.im.setMatrixAt(i, show ? h.m : ZERO);
  });
  shinHairs.im.instanceMatrix.needsUpdate = true;
}

// ---------------------------------------------------------------- the strip (studio)
// a curved sheet that wraps the top of the shin; pivot at its right end
const stripPivot = new THREE.Group();
stripPivot.position.set(0.5, 1.82, LEG_Z);
person.add(stripPivot);
const curved = (r, len, theta, mat) => {
  const g = new THREE.CylinderGeometry(r, r, len, 48, 1, true, -theta / 2, theta);
  g.rotateZ(Math.PI / 2); // axis along x
  g.rotateX(Math.PI / 2); // opening faces down
  const m = new THREE.Mesh(g, mat);
  m.castShadow = true;
  return m;
};
{
  const fab = curved(0.232, 1.0, 1.9, real.fabric(0xfbf8f2, { side: THREE.DoubleSide }));
  fab.position.x = -0.5;
  stripPivot.add(fab);
  const wx = curved(
    0.226,
    0.96,
    1.8,
    real.gloss(0xe3a23e, { side: THREE.DoubleSide, roughness: 0.2 }),
  );
  wx.position.x = -0.5;
  stripPivot.add(wx);
  // hairs caught in the wax (underside)
  const r = rng(8);
  const hg = new THREE.CylinderGeometry(0.002, 0.003, 0.045, 4);
  const hm = real.plastic(0x5a4030);
  for (let i = 0; i < 28; i++) {
    const h = new THREE.Mesh(hg, hm);
    const x = -0.95 + r() * 0.9;
    const phi = (r() - 0.5) * 1.6;
    h.position.set(x, Math.cos(phi) * 0.21, Math.sin(phi) * 0.21);
    h.rotation.set(phi, 0, 0.3);
    stripPivot.add(h);
  }
}
// the wax layer spread on the shin (before the strip goes on)
const waxSpread = curved(
  0.224,
  1.0,
  1.8,
  real.gloss(0xe3a23e, { roughness: 0.12, side: THREE.DoubleSide }),
);
const waxSpreadG = new THREE.Group();
waxSpreadG.position.set(-0.5, 1.82, LEG_Z);
waxSpread.position.x = 0.5;
waxSpreadG.add(waxSpread);
person.add(waxSpreadG);

// wooden spatula with a wax blob
const spatula = new THREE.Group();
{
  const stick = new THREE.Mesh(roundedBox(0.09, 0.9, 0.018, 0.008, 3), real.wood(0xdcbc8c));
  stick.position.y = 0.45;
  spatula.add(stick);
  const blob = new THREE.Mesh(new THREE.SphereGeometry(0.07, 24, 16), waxM);
  blob.scale.set(0.9, 1.6, 0.6);
  blob.position.y = 0.07;
  spatula.add(blob);
  const drip = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.03, 1, 12), waxM);
  drip.position.y = -0.5;
  drip.name = "drip";
  spatula.add(drip);
}
scene.add(spatula);

// wax bubbles in the heater
const potWax = V(POT.x - 0.25, 2.12, POT.z);
const bubbles = [];
for (let i = 0; i < 6; i++) {
  const b = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    waxM,
  );
  scene.add(b);
  bubbles.push(b);
}

// ================================================================= SKIN WORLD
const SK = new THREE.Group();
SK.position.copy(SKIN_POS);
scene.add(SK);
const skLight = new THREE.PointLight(0xffe2cc, 260, 60, 1.6);
skLight.position.set(7, 9, 11);
SK.add(skLight);
const skRim = new THREE.PointLight(0xff8a9a, 120, 40, 1.6);
skRim.position.set(-8, 5, -7);
SK.add(skRim);

// ---------------------------------------------------------------- block
const BW = 8;
const BD = 5;
const FRONT = BD / 2;
const layer = (y0, y1, mat, inset = 0) => {
  const h = y0 - y1;
  const m = new THREE.Mesh(roundedBox(BW - inset, h, BD - inset, 0.06, 3), mat);
  m.position.set(0, (y0 + y1) / 2, 0);
  m.receiveShadow = m.castShadow = true;
  SK.add(m);
  return m;
};
const epiM = real.skin(0xf0c0a0, { roughness: 0.5 });
layer(0, -0.38, epiM);
layer(-0.36, -2.6, real.skin(0xe8a29a, { roughness: 0.65 }), 0.02);
layer(-2.58, -4.0, real.gloss(0xf2d18a, { roughness: 0.45 }), 0.04);
// fat lobes on the cut face
{
  const r = rng(5);
  const lm = real.gloss(0xf7dc98, { roughness: 0.35 });
  for (let i = 0; i < 22; i++) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.28 + r() * 0.12, 24, 16), lm);
    s.position.set(
      -3.7 + (i % 11) * 0.74 + r() * 0.1,
      -2.95 - Math.floor(i / 11) * 0.62,
      FRONT - 0.12,
    );
    s.scale.z = 0.5;
    SK.add(s);
  }
}
// skin surface: fine bumps (skin lines) — instanced flat discs
{
  const g = new THREE.SphereGeometry(0.16, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const im = new THREE.InstancedMesh(g, epiM, 260);
  const r = rng(77);
  const o = new THREE.Object3D();
  for (let i = 0; i < 260; i++) {
    o.position.set((r() - 0.5) * (BW - 0.3), -0.02, (r() - 0.5) * (BD - 0.3));
    o.scale.set(1 + r() * 1.5, 0.25 + r() * 0.2, 1 + r() * 1.5);
    o.updateMatrix();
    im.setMatrixAt(i, o.matrix);
  }
  im.receiveShadow = true;
  SK.add(im);
}

// ---------------------------------------------------------------- hairs
const LEAN = 0.5;
const SHAFT = 0.8;
const ROOT = 1.7;
const hairs = [];
{
  const r = rng(95);
  // front row on the cut face
  for (let i = 0; i < 8; i++) hairs.push({ x: -3.5 + i * 0.86, z: FRONT - 0.02, front: true });
  for (let row = 0; row < 4; row++)
    for (let i = 0; i < 8; i++)
      hairs.push({
        x: -3.4 + i * 0.86 + (r() - 0.5) * 0.4 + (row % 2) * 0.3,
        z: -2.0 + row * 1.05 + (r() - 0.5) * 0.3,
        front: false,
      });
  for (const h of hairs) {
    h.lean = LEAN + (h.front ? 0 : (r() - 0.5) * 0.3);
    h.spin = h.front ? 0 : (r() - 0.5) * 0.6;
    h.rest = new THREE.Matrix4().compose(
      V(h.x, 0, h.z),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, h.spin, h.lean)),
      V(1, 1, 1),
    );
  }
}
const HN = hairs.length;
const hairMat = real.plastic(0x3a2416, { roughness: 0.45 });
const shaftGeo = new THREE.CylinderGeometry(0.035, 0.045, SHAFT, 12);
shaftGeo.translate(0, SHAFT / 2, 0);
const rootGeo = new THREE.CylinderGeometry(0.045, 0.05, ROOT, 12);
rootGeo.translate(0, -ROOT / 2, 0);
const bulbGeo = new THREE.LatheGeometry(
  [
    [0.0, -0.36],
    [0.07, -0.33],
    [0.13, -0.24],
    [0.14, -0.12],
    [0.1, -0.02],
    [0.05, 0.04],
  ].map(([x, y]) => new THREE.Vector2(x, y)),
  32,
);
bulbGeo.translate(0, -ROOT, 0);
const shaftIM = new THREE.InstancedMesh(shaftGeo, hairMat, HN);
const rootIM = new THREE.InstancedMesh(rootGeo, real.plastic(0x5a3826, { roughness: 0.5 }), HN);
const bulbIM = new THREE.InstancedMesh(bulbGeo, real.gloss(0xf6e6d6, { roughness: 0.3 }), HN);
for (const im of [shaftIM, rootIM, bulbIM]) {
  im.castShadow = true;
  SK.add(im);
}
// follicle openings (pits) on top
const pits = [];
for (const h of hairs) {
  const p = new THREE.Mesh(new THREE.CircleGeometry(0.09, 20), flat(0x8a2f3a));
  p.rotation.x = -Math.PI / 2;
  p.position.set(h.x, 0.012, h.z);
  SK.add(p);
  pits.push(p);
}
// shaft length (razor / stubble) per hair; stubble tips
const stubTipGeo = new THREE.ConeGeometry(0.045, 0.12, 12);
stubTipGeo.translate(0, 0.06, 0);
const tipIM = new THREE.InstancedMesh(stubTipGeo, hairMat, HN);
SK.add(tipIM);

// ---------------------------------------------------------------- wax + strip (macro)
const waxG = new THREE.Group(); // pivot at the left edge
waxG.position.set(-BW / 2 - 0.1, 0, 0);
SK.add(waxG);
const waxBody = new THREE.Mesh(
  roundedBox(BW + 0.2, 0.62, BD + 0.1, 0.25, 6),
  new THREE.MeshPhysicalMaterial({
    color: 0xe39a2c,
    roughness: 0.12,
    clearcoat: 1,
    transparent: true,
    opacity: 0.82,
    emissive: new THREE.Color(0x5a2a00),
    emissiveIntensity: 0.3,
  }),
);
waxBody.geometry.translate((BW + 0.2) / 2, 0.31, 0);
waxG.add(waxBody);
const waxFront = new THREE.Mesh(
  new THREE.CylinderGeometry(0.31, 0.31, BD + 0.1, 32),
  waxBody.material,
);
waxFront.rotation.x = Math.PI / 2;
SK.add(waxFront);
const stripM = real.fabric(0xfbf7ef);
const strip = new THREE.Mesh(roundedBox(BW + 0.3, 0.1, BD - 0.2, 0.04, 3), stripM);
strip.geometry.translate((BW + 0.3) / 2 - 0.05, 0.67, 0);
strip.castShadow = true;
waxG.add(strip);

// ---------------------------------------------------------------- razor
const razor = new THREE.Group();
{
  const head = new THREE.Mesh(roundedBox(1.1, 0.34, BD + 0.6, 0.12, 4), real.plastic(0x6fb7c9));
  head.position.y = 0.32;
  razor.add(head);
  for (let i = 0; i < 3; i++) {
    const b = new THREE.Mesh(
      roundedBox(0.06, 0.05, BD + 0.3, 0.01, 2),
      real.metal(0xe6eaee, { roughness: 0.15 }),
    );
    b.position.set(-0.3 + i * 0.3, 0.13, 0);
    razor.add(b);
  }
  const strip2 = new THREE.Mesh(roundedBox(0.18, 0.06, BD + 0.3, 0.02, 2), real.gloss(0xbfe6d8));
  strip2.position.set(0.45, 0.14, 0);
  razor.add(strip2);
  const handle = new THREE.Mesh(roundedBox(0.5, 0.4, 3.2, 0.18, 4), real.plastic(0x2d5f73));
  handle.position.set(0.6, 0.9, BD / 2 + 1.4);
  handle.rotation.x = -0.5;
  razor.add(handle);
}
SK.add(razor);

// ---------------------------------------------------------------- nerves
const nerveM = new THREE.MeshStandardMaterial({
  color: 0xf2d27a,
  roughness: 0.4,
  emissive: new THREE.Color(0xffc23a),
  emissiveIntensity: 0,
});
const GATE = V(CORD[0] - SKIN_POS.x - 1.0, CORD[1], CORD[2]); // SK-local
const mainPts = [
  V(-4.0, -3.2, FRONT),
  V(-1, -3.25, FRONT),
  V(2, -3.2, FRONT),
  V(4.3, -3.2, FRONT),
  V(8, -3.5, 2.0),
  V(13, -2.7, 0.9),
  V(18, -1.7, 0.25),
  V(GATE.x - 0.4, GATE.y, GATE.z),
];
const tube = (pts, r, mat) => {
  const c = new THREE.CatmullRomCurve3(pts);
  const m = new THREE.Mesh(new THREE.TubeGeometry(c, Math.max(24, pts.length * 20), r, 12), mat);
  m.castShadow = true;
  SK.add(m);
  return c;
};
tube(mainPts, 0.15, nerveM);
const bulbBottom = (h) => {
  const p = V(0, -ROOT - 0.3, 0).applyMatrix4(h.rest);
  p.z = FRONT;
  return p;
};
const branches = [];
for (const h of hairs) {
  if (!h.front) continue;
  const b = bulbBottom(h);
  const pts = [b, V(b.x + 0.1, -2.55, FRONT), V(b.x + 0.35, -3.2, FRONT)];
  tube(pts, 0.045, nerveM);
  // full pain path: branch + the main nerve to the right of the junction
  const rest = mainPts.filter((p) => p.x > b.x + 0.6);
  branches.push(new THREE.CatmullRomCurve3([...pts, ...rest]));
}
// pressure path: from the pressed surface down the cut face into the nerve
const PRESS_X = -1.6;
const pressPath = new THREE.CatmullRomCurve3([
  V(PRESS_X, -0.1, FRONT),
  V(PRESS_X + 0.1, -1.6, FRONT),
  V(PRESS_X + 0.4, -3.2, FRONT),
  ...mainPts.filter((p) => p.x > PRESS_X + 1),
]);
// touch receptors (small blue discs) under the surface on the cut face
for (let i = 0; i < 4; i++) {
  const d = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 20, 12),
    new THREE.MeshStandardMaterial({ color: 0x7fc8ff, emissive: 0x2b7cff, emissiveIntensity: 0.4 }),
  );
  d.position.set(PRESS_X - 0.6 + i * 0.45, -0.55, FRONT);
  d.scale.set(1.3, 0.6, 0.5);
  SK.add(d);
}

// pulses
const pulseGeo = new THREE.SphereGeometry(1, 20, 12);
const redM = new THREE.MeshBasicMaterial({ color: 0xff3b3b });
const redGlowM = new THREE.MeshBasicMaterial({
  color: 0xff2a2a,
  transparent: true,
  opacity: 0.35,
  depthWrite: false,
});
const blueM = new THREE.MeshBasicMaterial({ color: 0x9fe1ff });
const blueGlowM = new THREE.MeshBasicMaterial({
  color: 0x3aa0ff,
  transparent: true,
  opacity: 0.4,
  depthWrite: false,
});
const mkPulse = (m, g, r) => {
  const grp = new THREE.Group();
  const core = new THREE.Mesh(pulseGeo, m);
  core.scale.setScalar(r);
  const glow = new THREE.Mesh(pulseGeo, g);
  glow.scale.setScalar(r * 2.4);
  grp.add(core, glow);
  SK.add(grp);
  return grp;
};
const reds = branches.map(() => mkPulse(redM, redGlowM, 0.17));
const blue = mkPulse(blueM, blueGlowM, 0.2);
const blueTrail = [0, 1, 2, 3].map(() => mkPulse(blueM, blueGlowM, 0.12));
const redLight = new THREE.PointLight(0xff3030, 0, 6, 2);
SK.add(redLight);
const blueLight = new THREE.PointLight(0x4aa8ff, 0, 7, 2);
SK.add(blueLight);
// sparks when the pain bounces off the gate
const SPARKS = 18;
const sparks = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 8, 6), redM, SPARKS);
SK.add(sparks);
const sparkDir = (() => {
  const r = rng(3);
  return Array.from({ length: SPARKS }, () =>
    V(-0.4 - r(), (r() - 0.5) * 2, (r() - 0.5) * 2).normalize(),
  );
})();

// ---------------------------------------------------------------- spinal cord + gate
const cordG = new THREE.Group();
cordG.position.set(CORD[0] - SKIN_POS.x, CORD[1], CORD[2]);
SK.add(cordG);
{
  const bone = real.ceramic(0xefe4cf, { roughness: 0.5 });
  const disc = real.skin(0xd49a96, { roughness: 0.6 });
  for (let i = -4; i <= 4; i++) {
    const v = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.05, 0.95, 48), bone);
    v.position.set(0.9, i * 1.25, 0);
    v.castShadow = v.receiveShadow = true;
    cordG.add(v);
    const spine = new THREE.Mesh(roundedBox(1.1, 0.5, 0.4, 0.15, 3), bone);
    spine.position.set(2.1, i * 1.25 - 0.1, 0);
    spine.rotation.z = -0.35;
    cordG.add(spine);
    if (i < 4) {
      const d = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.3, 48), disc);
      d.position.set(0.9, i * 1.25 + 0.62, 0);
      cordG.add(d);
    }
  }
  const cord = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 12, 40),
    new THREE.MeshStandardMaterial({
      color: 0xfff0d6,
      roughness: 0.35,
      emissive: 0xffd9a0,
      emissiveIntensity: 0.25,
    }),
  );
  cord.position.set(-0.25, 0, 0);
  cordG.add(cord);
}
const gateRing = new THREE.Mesh(
  new THREE.TorusGeometry(0.5, 0.09, 16, 48),
  real.metal(0xd6dce4, { roughness: 0.25 }),
);
gateRing.position.copy(GATE);
gateRing.rotation.y = Math.PI / 2;
SK.add(gateRing);
const doorM = new THREE.MeshStandardMaterial({
  color: 0x9fd8ff,
  emissive: 0x2a8cff,
  emissiveIntensity: 0.2,
  roughness: 0.3,
  side: THREE.DoubleSide,
});
const doorTop = new THREE.Mesh(new THREE.CircleGeometry(0.48, 32, 0, Math.PI), doorM);
const doorBot = new THREE.Mesh(new THREE.CircleGeometry(0.48, 32, Math.PI, Math.PI), doorM);
for (const d of [doorTop, doorBot]) {
  d.rotation.y = Math.PI / 2;
  SK.add(d);
}

// ---------------------------------------------------------------- carrot bed (analogy)
const beetG = new THREE.Group();
beetG.position.set(...BEET);
scene.add(beetG);
const carrot = new THREE.Group();
{
  const soil = new THREE.Mesh(
    new THREE.SphereGeometry(3.2, 48, 24),
    real.fabric(0x5a3b26, { roughness: 1 }),
  );
  soil.scale.set(1, 0.28, 0.8);
  soil.receiveShadow = true;
  beetG.add(soil);
  const r = rng(4);
  const crumbs = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.08, 8, 6),
    real.fabric(0x47301f),
    120,
  );
  const o = new THREE.Object3D();
  for (let i = 0; i < 120; i++) {
    const a = r() * 6.28;
    const d = Math.sqrt(r()) * 2.8;
    o.position.set(
      Math.cos(a) * d,
      0.86 * Math.sqrt(Math.max(0, 1 - (d / 3.2) ** 2)) - 0.02,
      Math.sin(a) * d * 0.8,
    );
    o.scale.setScalar(0.6 + r());
    o.updateMatrix();
    crumbs.setMatrixAt(i, o.matrix);
  }
  beetG.add(crumbs);
  const leafM = real.plastic(0x3f9a3a, { roughness: 0.6 });
  const mkTop = (g) => {
    for (let i = 0; i < 7; i++) {
      const l = new THREE.Mesh(new THREE.ConeGeometry(0.07, 1.1, 8), leafM);
      l.geometry.translate(0, 0.55, 0);
      l.rotation.set((i - 3) * 0.18, i * 0.9, (i % 2 ? 1 : -1) * 0.2);
      g.add(l);
    }
  };
  // other carrots in the bed (tops only)
  for (const [x, z] of [
    [-1.6, -0.6],
    [1.5, -0.9],
    [-0.6, 1.2],
    [1.3, 1.0],
  ]) {
    const g = new THREE.Group();
    g.position.set(x, 0.75, z);
    const shoulder = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 24, 12),
      real.gloss(0xf07a1a, { roughness: 0.4 }),
    );
    shoulder.scale.y = 0.4;
    g.add(shoulder);
    mkTop(g);
    beetG.add(g);
  }
  const body = new THREE.Mesh(
    new THREE.LatheGeometry(
      [
        [0.0, -2.2],
        [0.06, -2.0],
        [0.14, -1.5],
        [0.22, -0.9],
        [0.28, -0.3],
        [0.28, 0],
        [0.2, 0.08],
        [0.0, 0.1],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
      40,
    ),
    real.gloss(0xf07a1a, { roughness: 0.45 }),
  );
  body.castShadow = true;
  carrot.add(body);
  // fine root hairs
  for (let i = 0; i < 6; i++) {
    const h = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.35, 4),
      real.plastic(0xd9b48a),
    );
    h.position.set(0.18, -0.6 - i * 0.25, 0);
    h.rotation.z = 1.2;
    h.rotation.y = i * 1.3;
    carrot.add(h);
  }
  mkTop(carrot);
  carrot.position.set(0, 0.78, 0);
  beetG.add(carrot);
}
const beetLight = new THREE.PointLight(0xfff0dc, 120, 30, 1.6);
beetLight.position.set(3, 6, 5);
beetG.add(beetLight);

// ================================================================= HANDS
const hand = createHand({ scale: 0.42, skin: 0xe6b08c, sleeve: 0x7f9c8a });
const bigHand = createHand({ scale: 7.5, skin: 0xe6b08c, sleeve: 0x7f9c8a });
const beetHand = createHand({ scale: 1.2, skin: 0xe6b08c, sleeve: 0x7f9c8a });

// ---------------------------------------------------------------- helpers
const m4 = new THREE.Matrix4();
const m4b = new THREE.Matrix4();
const PI = Math.PI;

// macro state for time t
function macroState(t) {
  // returns { mode, wax: 0..1 flow, strip: 0..1 down, a, lift, flip, razorX, stub }
  if (t < T.rasieren) {
    const flow = smooth(ramp(t, T.umklammert, T.faust - 0.2));
    const down = easeOut(ramp(t, T.faust, T.faust + 0.45));
    const yank = easeOut(ramp(t, T.rip, T.ripEnd));
    const pull = smooth(ramp(t, T.haar + 0.2, T.moehre - 0.1));
    return {
      mode: "rip",
      flow,
      down,
      a: 0.16 * yank + 0.12 * pull,
      lift: 0.45 * yank + 2.0 * pull,
      attached: t >= T.rip,
    };
  }
  if (t < T.rate) {
    const razorX = lerp(-5.2, 5.2, smooth(ramp(t, T.rasieren + 0.15, T.sticht - 0.15)));
    const grow = smooth(ramp(t, T.sticht, T.sticht + 0.4));
    return { mode: "razor", razorX, grow };
  }
  if (t < T.jede) return { mode: "flip" };
  return { mode: "intact" };
}

// ================================================================= RENDER
const applyCamera = shotCamera(shots);
const tmpV = V(0, 0, 0);
function renderAt(t) {
  // ---------------- STUDIO state
  const ripped = t < T.warmes || (t >= T.daumen && t < T.rast);
  const smoothLeg = (t >= T.darum && t < T.rasieren) || t >= T.uebrigens;
  const before = t >= T.warmes && t < T.umklammert;
  setShinHairs(ripped ? "ripped" : smoothLeg ? "none" : before ? "all" : "all");
  let redK = 0;
  if (t < T.warmes) redK = 0.5 + 0.5 * smooth(ramp(t, 0.0, 0.4));
  else if (t >= T.daumen && t < T.rast) redK = 1 - 0.35 * smooth(ramp(t, T.drauf, T.rast));
  else if (t >= T.team) redK = 0.35 * (1 - smooth(ramp(t, T.team, T.schreib + 1)));
  paintLegs(redK);

  // studio strip: hook rip (angle a around its right end)
  let stripA = 0;
  let stripVis = false;
  if (t < T.warmes) {
    stripVis = true;
    stripA = lerp(0.55, 2.75, easeOut(ramp(t, -0.35, 0.6)));
  }
  stripPivot.visible = stripVis;
  stripPivot.rotation.z = -stripA;
  stripPivot.position.y = 1.82 + (t < T.warmes ? 0.25 * smooth(ramp(t, 0.4, 1.0)) : 0);
  // free end of the strip in world space (for the hand)
  const freeEnd = V(-1.0, 0.24, 0)
    .applyAxisAngle(V(0, 0, 1), -stripA)
    .add(stripPivot.position);

  // wax spreading
  const spreadK =
    t >= T.auf && t < T.umklammert ? smooth(ramp(t, T.auf + 0.05, T.umklammert - 0.05)) : 0;
  waxSpreadG.visible = spreadK > 0.01;
  waxSpreadG.scale.x = Math.max(0.01, spreadK);

  // spatula: in the pot (warmes) → on the shin (auf)
  spatula.visible = t >= T.warmes && t < T.umklammert;
  const drip = spatula.getObjectByName("drip");
  if (t < T.auf) {
    const up = smooth(ramp(t, T.warmes, T.warmes + 0.7));
    spatula.position.set(potWax.x + 0.05, potWax.y - 0.05 + up * 0.75, potWax.z + 0.1);
    spatula.rotation.set(0.15, 0, -0.1);
    drip.visible = true;
    const len = Math.max(0.05, spatula.position.y - potWax.y);
    drip.scale.set(1 - 0.4 * up, len, 1);
    drip.position.y = -len / 2 + 0.02;
  } else {
    spatula.position.set(lerp(-0.55, 0.5, spreadK), 2.06, LEG_Z + 0.02);
    spatula.rotation.set(0, 0, 0.9);
    drip.visible = false;
  }
  // pot bubbles
  bubbles.forEach((b, i) => {
    const k = (t * 0.9 + i * 0.37) % 1;
    const a = i * 2.4;
    b.position.set(potWax.x + Math.cos(a) * 0.2, potWax.y - 0.015, potWax.z + Math.sin(a) * 0.2);
    b.scale.setScalar(Math.sin(PI * k) * (0.6 + (i % 3) * 0.3) + 0.001);
  });

  // ---------------- hand (studio)
  const H = Math.PI / 2;
  hand.track(t, [
    // hook: holding the strip's free end, pulling it up and away
    {
      t: -0.3,
      pos: [freeEnd.x - 0.04, freeEnd.y + 0.22, LEG_Z - 0.02],
      rot: [0, -H, 0.5],
      pose: "grab",
    },
    {
      t: 0.6,
      pos: [freeEnd.x - 0.04, freeEnd.y + 0.22, LEG_Z - 0.02],
      rot: [0, -H, 0.5],
      pose: "grab",
    },
    { t: 1.0, pos: [1.75, 2.95, LEG_Z + 0.4], rot: [0.1, -H, 0.6], pose: "open" },
    { t: T.sofort + 0.2, pos: [0.6, 2.55, LEG_Z + 0.1], rot: [0, -H, 0.1], pose: "open" },
    { t: T.warmes - 0.05, pos: [0.42, 2.25, LEG_Z + 0.02], rot: [0, -H, 0], pose: "open" },
    { t: T.warmes, pos: [0.42, 2.25, LEG_Z], rot: [0, -H, 0], pose: "open", out: true },
    // spreading wax: hand holds the spatula
    { t: T.auf, pos: [-0.35, 2.48, LEG_Z + 0.25], rot: [0.3, -H, -0.6], pose: "grab" },
    { t: T.umklammert - 0.05, pos: [0.7, 2.48, LEG_Z + 0.25], rot: [0.3, -H, -0.6], pose: "grab" },
    {
      t: T.umklammert,
      pos: [0.7, 2.48, LEG_Z + 0.25],
      rot: [0.3, -H, -0.6],
      pose: "grab",
      out: true,
    },
    // smooth leg: stroke along the shin
    { t: T.darum, pos: [-1.4, 2.22, LEG_Z], rot: [0, -H, 0], pose: "open" },
    { t: T.rasieren - 0.1, pos: [0.9, 2.18, LEG_Z], rot: [0, -H, 0], pose: "open" },
    { t: T.rasieren, pos: [0.9, 2.18, LEG_Z], rot: [0, -H, 0], pose: "open", out: true },
    // press on the red patch
    { t: T.daumen - 0.1, pos: [0.55, 2.7, LEG_Z + 0.05], rot: [0, -H, 0], pose: "open" },
    { t: T.drauf - 0.05, pos: [0.42, 2.2, LEG_Z], rot: [0, -H, 0], pose: "open" },
    { t: T.drauf + 0.15, pos: [0.42, 2.15, LEG_Z], rot: [0, -H, 0], pose: "open" },
    { t: T.rast, pos: [0.42, 2.15, LEG_Z], rot: [0, -H, 0], pose: "open", out: true },
    // the knee rub
    ...Array.from({ length: 9 }, (_, i) => ({
      t: T.uebrigens + 0.2 + i * 0.42,
      pos: [-1.42 + (i % 2 ? 0.1 : -0.08), 2.26, LEG_Z + (i % 2 ? 0.05 : -0.03)],
      rot: [0, -H, 0.15],
      pose: "open",
    })),
    { t: T.im, pos: [-1.2, 2.24, LEG_Z], rot: [0, -H, 0.15], pose: "open", out: true },
    // CTA: hand rests pressing on the shin
    { t: T.team, pos: [0.55, 2.4, LEG_Z], rot: [0, -H, 0], pose: "open" },
    { t: T.team + 0.5, pos: [0.42, 2.16, LEG_Z], rot: [0, -H, 0], pose: "open" },
    { t: 46, pos: [0.42, 2.16, LEG_Z], rot: [0, -H, 0], pose: "open" },
  ]);

  // ---------------- MACRO
  const S = macroState(t);
  // wax + strip
  const ripMode = S.mode === "rip";
  waxG.visible = (ripMode && S.flow > 0.001) || S.mode === "flip";
  waxFront.visible = ripMode && S.flow > 0.001 && S.flow < 0.999;
  if (ripMode) {
    waxBody.scale.set(Math.max(0.001, S.flow), 1, 1);
    waxFront.position.set(-BW / 2 - 0.1 + S.flow * (BW + 0.2), 0.3, 0);
    strip.visible = S.down > 0.001;
    strip.position.y = (1 - S.down) * 2.2;
    waxG.rotation.set(0, 0, S.a);
    waxG.position.set(-BW / 2 - 0.1, S.lift, 0);
  } else if (S.mode === "flip") {
    waxBody.scale.set(1, 1, 1);
    strip.visible = true;
    strip.position.y = 0;
    // upside down, floating above the skin: hairs point up at the camera
    const k = smooth(ramp(t, T.rate, T.rate + 0.6));
    waxG.rotation.set(PI * (0.6 + 0.4 * k), 0, 0);
    waxG.position.set(-BW / 2 - 0.1, 1.6 + 1.3 * k, 1.8 - 1.8 * k);
  }
  waxG.updateMatrix();
  waxG.updateMatrixWorld(true);
  const attached = (ripMode && S.attached) || S.mode === "flip";
  // hair matrices
  for (let i = 0; i < HN; i++) {
    const h = hairs[i];
    let base = h.rest;
    if (attached) {
      // the hair moves rigidly with the wax group (SK-local)
      m4b.copy(waxG.matrix);
      m4.makeTranslation(BW / 2 + 0.1, 0, 0);
      m4b.multiply(m4).multiply(h.rest);
      base = m4b;
    }
    let len = 1;
    let tip = 0;
    if (S.mode === "razor") {
      const cut = h.x < S.razorX;
      len = cut ? 0.06 + 0.2 * S.grow : 1;
      tip = cut ? S.grow : 0;
    }
    m4.copy(base).multiply(new THREE.Matrix4().makeScale(1, len, 1));
    shaftIM.setMatrixAt(i, m4);
    rootIM.setMatrixAt(i, base);
    bulbIM.setMatrixAt(i, base);
    if (tip > 0) {
      m4.copy(base)
        .multiply(new THREE.Matrix4().makeTranslation(0, SHAFT * len, 0))
        .multiply(new THREE.Matrix4().makeScale(1, tip, 1));
      tipIM.setMatrixAt(i, m4);
    } else tipIM.setMatrixAt(i, ZERO);
    pits[i].visible = attached && (S.mode === "flip" || S.lift > 0.9);
  }
  for (const im of [shaftIM, rootIM, bulbIM, tipIM]) im.instanceMatrix.needsUpdate = true;
  razor.visible = S.mode === "razor";
  if (razor.visible) razor.position.set(S.razorX, 0.02, 0);

  // nerves glow + pulses
  nerveM.emissiveIntensity = 0.15 + 0.9 * smooth(ramp(t, T.nerv - 0.2, T.nerv + 0.3));
  // red pulses: crawl from "alle" on; the lead one hits the gate at T.painHit
  const painU = (t - T.painGo) / (T.painHit - T.painGo);
  let lead = null;
  reds.forEach((p, i) => {
    let u = painU * (1 - i * 0.03);
    if (t < T.painGo || u < 0) {
      p.visible = false;
      return;
    }
    p.visible = true;
    let bounce = 0;
    if (u > 1) {
      bounce = u - 1;
      u = Math.max(0.6, 1 - bounce * 2.5);
    }
    branches[i].getPointAt(Math.min(1, u), tmpV);
    p.position.copy(tmpV);
    p.position.z += 0.08;
    const s = 1 + 0.25 * Math.sin(t * 22 + i);
    p.scale.setScalar(bounce > 0 ? Math.max(0.2, 1 - bounce * 3) * s : s);
    if (!lead || u > lead.u) lead = { u, p };
  });
  redLight.intensity = lead ? 8 : 0;
  if (lead) redLight.position.copy(lead.p.position);
  // sparks at the gate on impact
  const sp = t - T.painHit;
  for (let i = 0; i < SPARKS; i++) {
    if (sp < 0 || sp > 0.9) sparks.setMatrixAt(i, ZERO);
    else {
      const d = sparkDir[i];
      m4.makeTranslation(
        GATE.x - 0.3 + d.x * sp * 2.2,
        GATE.y + d.y * sp * 2.2 - sp * sp,
        GATE.z + d.z * sp * 2.2,
      );
      m4.multiply(new THREE.Matrix4().makeScale(1 - sp, 1 - sp, 1 - sp));
      sparks.setMatrixAt(i, m4);
    }
  }
  sparks.instanceMatrix.needsUpdate = true;
  // blue pressure pulse
  const pu = clamp01((t - T.pressGo) / (T.pressHit - T.pressGo)) ** 2;
  blue.visible = t >= T.pressGo;
  if (blue.visible) {
    pressPath.getPointAt(pu, tmpV);
    blue.position.copy(tmpV);
    blue.position.z -= 0.08;
    blue.scale.setScalar(pu >= 1 ? 1.3 + 0.15 * Math.sin(t * 8) : 1);
  }
  blueTrail.forEach((b, i) => {
    const u = pu - (i + 1) * 0.02;
    b.visible = blue.visible && pu < 1 && u > 0;
    if (b.visible) {
      pressPath.getPointAt(u, tmpV);
      b.position.copy(tmpV);
      b.scale.setScalar(1 - i * 0.2);
    }
  });
  blueLight.intensity = blue.visible ? 10 : 0;
  blueLight.position.copy(blue.position);
  // gate: open (doors apart) until "Tor", then slides shut
  const shut = easeOut(ramp(t, T.gate, T.gate + 0.35));
  const gap = 0.75 * (1 - shut);
  doorTop.position.set(GATE.x, GATE.y + gap, GATE.z);
  doorBot.position.set(GATE.x, GATE.y - gap, GATE.z);
  doorTop.visible = doorBot.visible = t >= T.rueckenmark;
  doorM.emissiveIntensity = 0.2 + 1.6 * shut;

  // giant hand presses the skin (macro)
  bigHand.track(t, [
    {
      t: T.rast - 0.35,
      pos: [SKIN_POS.x + PRESS_X - 0.4, 6.5, 0.6],
      rot: [0, -H, 0],
      pose: "open",
    },
    {
      t: T.rast + 0.15,
      pos: [SKIN_POS.x + PRESS_X - 0.4, 1.25, 0.6],
      rot: [0, -H, 0],
      pose: "open",
    },
    {
      t: T.signal2,
      pos: [SKIN_POS.x + PRESS_X - 0.4, 1.2, 0.6],
      rot: [0, -H, 0],
      pose: "open",
      out: true,
    },
  ]);
  // carrot pulled out of the bed
  const pullC = smooth(ramp(t, T.moehre + 0.15, T.darum - 0.25));
  carrot.position.y = 0.78 + pullC * 2.6;
  carrot.rotation.z = 0.12 * pullC;
  puff("soil", t, T.moehre + 0.25, BEET[0], 0.9, BEET[2], 1.2, 0x6a4a30);
  beetHand.track(t, [
    {
      t: T.moehre - 0.3,
      pos: [BEET[0] + 0.2, 3.2, BEET[2] + 1.6],
      rot: [0.3, PI, 0],
      pose: "open",
    },
    {
      t: T.moehre + 0.15,
      pos: [BEET[0] + 0.05, 1.95, BEET[2] + 1.4],
      rot: [0.4, PI, 0],
      pose: "grab",
    },
    {
      t: T.darum - 0.25,
      pos: [BEET[0] + 0.05 + 0.3, 1.95 + 2.6, BEET[2] + 1.4],
      rot: [0.4, PI, -0.12],
      pose: "grab",
    },
    { t: T.darum, pos: [BEET[0], 4.6, BEET[2] + 1.4], rot: [0.4, PI, 0], pose: "grab", out: true },
  ]);

  // ---------------- displays
  const cnt = t >= T.rate + 0.4 && t < T.hunderte ? 1 : 0;
  counter("haare", cnt, {
    label: "Haare am Streifen",
    value: Math.floor(320 * smooth(ramp(t, T.rate + 0.4, T.hunderte))),
    x: 60,
    y: 1060,
  });
  const panel = (a, b) => pop(t, a, b);
  if (t >= T.darum + 0.4 && t < T.rasieren)
    showPanel(panel(T.darum + 0.4, T.rasieren), "WOCHENLANG", "GLATT", LED.green);
  else if (t >= T.sticht && t < T.rate)
    showPanel(panel(T.sticht, T.rate), "STOPPELN NACH", "2 TAGEN", LED.red);
  else if (t >= T.hunderte && t < T.jede + 0.6)
    showPanel(panel(T.hunderte, T.jede + 0.6), "PRO STREIFEN", "HUNDERTE", LED.yellow);
  else if (t >= T.schneller && t < T.rueckenmark)
    showPanel(panel(T.schneller, T.rueckenmark), "DRUCK-SIGNAL", "SCHNELLER", LED.blue);
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
