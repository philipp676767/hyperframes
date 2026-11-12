// #77 Nasse Haare (Format B) — "Du rennst mit nassen Haaren raus in die Kälte."
// FOREST (origin): you run out of the cabin door, the wet hair steams,
// freezes stiff, a strand snaps; viruses, the heat meter, the red nose.
// NOSE (under the world): inside the nose — guards catch viruses, the cold
// freezes half of them, the viruses stroll in. ANT: the Antarctic station
// and the plane that brings the viruses. CTA: the hair dryer thaws one side.
import {
  THREE,
  ramp,
  smooth,
  lerp,
  pop,
  V,
  scene,
  real,
  roundedBox,
  showNope,
  makeArrowSet,
  animateArrows,
  heatMat,
  coldMat,
  showPanel,
  LED,
  labels,
  squash,
  highlights,
  shotCamera,
  renderFrame,
  start,
  rng,
} from "./world.js";
import { DOOR } from "./set.js";
import { meter } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS, NOSE, ANT } from "./beats.js";

highlights(HIGHLIGHTS);
const applyCamera = shotCamera(shots, 1);
const R = rng(77);
const col = (h) => new THREE.Color(h);
const _c = new THREE.Color();
const mix = (m, a, b, k) => m.color.copy(_c.set(a)).lerp(_c2.set(b), k);
const _c2 = new THREE.Color();
const mesh = (geo, mat, x = 0, y = 0, z = 0, parent) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  if (parent) parent.add(m);
  return m;
};

// ================================================================ people
function makePerson({
  jacket,
  pants = 0x2b3550,
  hair = 0x2a1a12,
  strands = false,
  bun = false,
  scarf = null,
}) {
  const g = new THREE.Group();
  const body = new THREE.Group();
  g.add(body);
  const skinMat = real.skin(0xe9b594);
  const noseMat = real.skin(0xe9b594);
  const jacketMat = real.fabric(jacket);
  const pantsMat = real.fabric(pants);
  const bootMat = real.rubber(0x3a2a22);
  const dark = real.gloss(0x17130f);
  // legs (pivots at the hip)
  const legs = [-1, 1].map((s) => {
    const p = new THREE.Group();
    p.position.set(s * 0.19, 1.02, 0);
    mesh(new THREE.CapsuleGeometry(0.15, 0.56, 8, 24), pantsMat, 0, -0.45, 0, p);
    mesh(roundedBox(0.3, 0.24, 0.5, 0.09), bootMat, 0, -0.9, 0.07, p);
    body.add(p);
    return p;
  });
  // puffer jacket: quilted rings
  [
    [1.2, 0.56],
    [1.47, 0.58],
    [1.74, 0.57],
    [1.99, 0.5],
  ].forEach(([y, r]) => {
    const m = mesh(new THREE.SphereGeometry(r, 48, 24), jacketMat, 0, y, 0, body);
    m.scale.set(1, 0.42, 0.78);
  });
  // arms (pivots at the shoulder)
  const arms = [-1, 1].map((s) => {
    const p = new THREE.Group();
    p.position.set(s * 0.6, 1.98, 0);
    mesh(new THREE.CapsuleGeometry(0.15, 0.6, 8, 24), jacketMat, 0, -0.42, 0, p);
    mesh(new THREE.SphereGeometry(0.16, 24, 16), real.fabric(0x30343c), 0, -0.9, 0, p);
    p.rotation.z = s * 0.14;
    body.add(p);
    return p;
  });
  mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.3, 24), skinMat, 0, 2.2, 0, body);
  // scarf: ring + hanging end + the part that can be pulled over the nose
  let mask = null;
  if (scarf) {
    const sm = real.fabric(scarf);
    const ring = mesh(new THREE.TorusGeometry(0.27, 0.115, 16, 48), sm, 0, 2.22, 0, body);
    ring.rotation.x = Math.PI / 2;
    mesh(roundedBox(0.17, 0.36, 0.07, 0.03), sm, 0.24, 2.0, 0.4, body).rotation.z = -0.12;
    mask = mesh(new THREE.CylinderGeometry(0.5, 0.41, 0.36, 48, 1, true), sm, 0, 2.2, 0.07, body);
    mask.material = sm.clone();
    mask.material.side = THREE.DoubleSide;
    mask.visible = false;
  }
  // head
  const head = new THREE.Group();
  head.position.y = 2.62;
  body.add(head);
  const skull = mesh(new THREE.SphereGeometry(0.42, 56, 36), skinMat, 0, 0, 0, head);
  skull.scale.set(0.96, 1.04, 0.98);
  for (const s of [-1, 1]) {
    mesh(new THREE.SphereGeometry(0.052, 24, 16), dark, s * 0.15, 0.05, 0.378, head);
    mesh(
      new THREE.SphereGeometry(0.014, 10, 8),
      real.gloss(0xffffff),
      s * 0.15 + 0.018,
      0.07,
      0.425,
      head,
    );
    const brow = mesh(
      new THREE.CapsuleGeometry(0.014, 0.09, 6, 12),
      real.fabric(hair),
      s * 0.15,
      0.16,
      0.39,
      head,
    );
    brow.rotation.z = Math.PI / 2 - s * 0.1;
    const cheek = mesh(
      new THREE.SphereGeometry(0.075, 20, 12),
      real.skin(0xf0958a, { transparent: true, opacity: 0.7 }),
      s * 0.24,
      -0.1,
      0.325,
      head,
    );
    cheek.scale.set(1, 0.7, 0.3);
    cheek.castShadow = false;
  }
  const nose = mesh(new THREE.SphereGeometry(0.078, 28, 20), noseMat, 0, -0.045, 0.425, head);
  nose.scale.set(1, 0.95, 1.15);
  const mouth = mesh(
    new THREE.TorusGeometry(0.075, 0.016, 10, 28, Math.PI),
    real.gloss(0x8a2f2f),
    0,
    -0.19,
    0.385,
    head,
  );
  mouth.rotation.z = Math.PI;
  // hair: cap + back shell (+ bun) + strands
  const hairMat = real.gloss(hair, { roughness: 0.28 });
  const hairMatR = hairMat.clone(); // the viewer's left side (x > 0): the dryer thaws it in the CTA
  const cap = mesh(
    new THREE.SphereGeometry(0.455, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.5),
    hairMat,
    0,
    0.02,
    0,
    head,
  );
  cap.rotation.x = -0.5;
  cap.scale.set(1, 1.04, 1.03);
  const back = mesh(new THREE.SphereGeometry(0.445, 48, 28), hairMat, 0, 0.03, -0.075, head);
  back.scale.set(1.01, 1.03, 1);
  if (bun) mesh(new THREE.SphereGeometry(0.2, 24, 16), hairMat, 0, 0.42, -0.22, head);
  const strandList = [];
  let special = null;
  if (strands) {
    const iceMat = real.glass(0xeaf6ff, {
      roughness: 0.1,
      emissive: 0xbfe2ff,
      emissiveIntensity: 0.6,
    });
    const addStrand = (a, y, rad, L, wet, froz, w = 0.036) => {
      const p = new THREE.Group();
      p.position.set(Math.sin(a) * rad, y, Math.cos(a) * rad);
      p.rotation.order = "YXZ";
      p.rotation.y = a;
      const geo = new THREE.CylinderGeometry(w, w * 0.55, L, 12);
      geo.translate(0, -L / 2, 0);
      const mat = Math.sin(a) > 0.15 ? hairMatR : hairMat;
      const m = mesh(geo, mat, 0, 0, 0, p);
      const ice = [0.35, 0.78].map((u, i) => {
        const c = mesh(
          new THREE.OctahedronGeometry(0.03 + R() * 0.015, 0),
          iceMat,
          (i ? -1 : 1) * w * 0.8,
          -L * u,
          w * 0.7,
          p,
        );
        c.castShadow = false;
        return c;
      });
      head.add(p);
      const s = { p, m, ice, a, L, wet, froz, seed: R() * 6.28, right: mat === hairMatR };
      strandList.push(s);
      return s;
    };
    const N = 30;
    for (let i = 0; i < N; i++) {
      const a = 0.85 + (i / (N - 1)) * (Math.PI * 2 - 1.7);
      if (Math.abs(a - 0.95) < 0.08) continue; // the special strand's place
      addStrand(a, 0.1 + R() * 0.08, 0.4, 0.72 + R() * 0.22, 0.07 + R() * 0.06, 0.3 + R() * 0.4);
    }
    for (let i = 0; i < 7; i++) {
      const a = -0.75 + (i / 6) * 1.5;
      addStrand(a, 0.3, 0.33, 0.2 + R() * 0.08, 0.5, 0.95 + R() * 0.3, 0.03);
    }
    // the strand that snaps: two halves, hinged in the middle
    {
      const a = 0.95;
      const L = 0.92;
      const p = new THREE.Group();
      p.position.set(Math.sin(a) * 0.4, 0.12, Math.cos(a) * 0.4);
      p.rotation.order = "YXZ";
      p.rotation.y = a;
      const up = new THREE.CylinderGeometry(0.04, 0.032, L / 2, 12);
      up.translate(0, -L / 4, 0);
      mesh(up, hairMatR, 0, 0, 0, p);
      const hinge = new THREE.Group();
      hinge.position.y = -L / 2;
      p.add(hinge);
      const lo = new THREE.CylinderGeometry(0.032, 0.022, L / 2, 12);
      lo.translate(0, -L / 4, 0);
      mesh(lo, hairMatR, 0, 0, 0, hinge);
      const c = mesh(new THREE.OctahedronGeometry(0.04, 0), iceMat, 0.03, -L * 0.2, 0.03, hinge);
      head.add(p);
      special = { p, hinge, ice: [c], L };
    }
  }
  return {
    g,
    body,
    legs,
    arms,
    head,
    skinMat,
    noseMat,
    hairMat,
    hairMatR,
    strandList,
    special,
    mask,
    mouth,
  };
}

// ---- you
const YOU = makePerson({ jacket: 0xe2572b, strands: true, scarf: 0xf2c230 });
scene.add(YOU.g);
// ---- Mama in the doorway
const MAMA = makePerson({ jacket: 0x7a4f7f, pants: 0x4a4a55, hair: 0xb9b3ac, bun: true });
MAMA.g.position.copy(DOOR);
MAMA.g.scale.setScalar(0.95);
scene.add(MAMA.g);

// halo for "unschuldig"
const halo = mesh(
  new THREE.TorusGeometry(0.3, 0.035, 14, 56),
  real.metal(0xffd23f, { emissive: 0xffc21a, emissiveIntensity: 1.6, roughness: 0.25 }),
);
halo.rotation.x = Math.PI / 2 - 0.25;
halo.castShadow = false;
scene.add(halo);

// steam off the wet hair, flying drops, breath
const softMat = (o) =>
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: o,
    depthWrite: false,
  });
const steam = Array.from({ length: 9 }, () => {
  const m = mesh(new THREE.SphereGeometry(0.16, 14, 10), softMat(0.3));
  m.castShadow = false;
  m.userData.noAO = true;
  YOU.g.add(m);
  return m;
});
const breath = Array.from({ length: 3 }, () => {
  const m = mesh(new THREE.SphereGeometry(0.12, 14, 10), softMat(0.3));
  m.castShadow = false;
  m.userData.noAO = true;
  YOU.g.add(m);
  return m;
});
const dropMat = real.glass(0xbfe6ff, {
  roughness: 0.05,
  emissive: 0x7fc4ff,
  emissiveIntensity: 0.4,
});
const drops = Array.from({ length: 14 }, () => {
  const m = mesh(new THREE.SphereGeometry(0.03, 10, 8), dropMat);
  m.castShadow = false;
  scene.add(m);
  return { m, v: [(R() - 0.5) * 2.4, 0.8 + R() * 1.4, -0.6 - R() * 1.2] };
});

// the viewer's hand bends a frozen strand
const shards = Array.from({ length: 7 }, () => {
  const m = mesh(
    new THREE.OctahedronGeometry(0.035, 0),
    real.glass(0xeaf6ff, { roughness: 0.1, emissive: 0xbfe2ff, emissiveIntensity: 0.8 }),
  );
  m.castShadow = false;
  scene.add(m);
  return m;
});

// ================================================================ viruses
const PHI = (1 + Math.sqrt(5)) / 2;
const SPIKES = [];
for (const s1 of [-1, 1])
  for (const s2 of [-1, 1]) {
    SPIKES.push(
      V(0, s1, s2 * PHI).normalize(),
      V(s1, s2 * PHI, 0).normalize(),
      V(s1 * PHI, 0, s2).normalize(),
    );
  }
const virusCore = new THREE.SphereGeometry(1, 24, 16);
const virusStem = new THREE.CylinderGeometry(0.06, 0.09, 0.4, 8);
virusStem.translate(0, 1.15, 0);
const virusKnob = new THREE.SphereGeometry(0.15, 12, 8);
virusKnob.translate(0, 1.4, 0);
const virusMat = real.gloss(0x86d83c, { emissive: 0x2f7a10, emissiveIntensity: 0.55 });
const knobMat = real.gloss(0x3f9a22, { emissive: 0x1d5a0c, emissiveIntensity: 0.4 });
const UP = V(0, 1, 0);
function makeVirus(r, parent = scene) {
  const g = new THREE.Group();
  mesh(virusCore, virusMat, 0, 0, 0, g);
  for (const d of SPIKES) {
    for (const geo of [virusStem, virusKnob]) {
      const m = mesh(geo, knobMat, 0, 0, 0, g);
      m.quaternion.setFromUnitVectors(UP, d);
      m.castShadow = false;
    }
  }
  g.userData.r = r;
  g.visible = false;
  parent.add(g);
  return g;
}
const setVirus = (g, k, x, y, z, t, i) => {
  g.visible = k > 0.01;
  if (!g.visible) return;
  g.position.set(x, y, z);
  g.scale.setScalar(g.userData.r * k);
  g.rotation.set(t * 0.9 + i, t * 1.3 + i * 2, 0);
};
const vOut = Array.from({ length: 9 }, () => makeVirus(0.1));

// arrows: the cold on your head, the heat leaving it
const coldArrows = makeArrowSet(
  [
    [V(-2.0, 3.9, 0.7), V(-0.6, 3.05, 0.25)],
    [V(2.0, 4.0, 0.6), V(0.6, 3.05, 0.25)],
    [V(0, 4.7, 0.5), V(0, 3.35, 0.15)],
  ],
  { mat: coldMat, r: 0.05, amp: 0.07 },
);
const heatArrows = makeArrowSet(
  [
    [V(-0.25, 3.15, 0.1), V(-0.7, 4.1, 0.1)],
    [V(0, 3.2, 0.1), V(0, 4.3, 0.1)],
    [V(0.25, 3.15, 0.1), V(0.7, 4.1, 0.1)],
  ],
  { mat: heatMat, r: 0.045, amp: 0.07 },
);

// ================================================================ inside the nose
const NP = V(...NOSE);
const noseSet = new THREE.Group();
noseSet.position.copy(NP);
scene.add(noseSet);
const wallMat = new THREE.MeshStandardMaterial({
  color: 0xe88a8c,
  emissive: 0x8a2f3a,
  emissiveIntensity: 0.55,
  roughness: 0.45,
  side: THREE.DoubleSide,
});
const bumpMat = new THREE.MeshStandardMaterial({
  color: 0xf2a0a0,
  emissive: 0x8a2f3a,
  emissiveIntensity: 0.45,
  roughness: 0.4,
});
{
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.3, 11, 64, 1, true), wallMat);
  tube.rotation.x = Math.PI / 2;
  tube.receiveShadow = false;
  noseSet.add(tube);
  const endA = new THREE.Mesh(
    new THREE.CircleGeometry(1.4, 40),
    new THREE.MeshBasicMaterial({ color: 0x4a1620 }),
  );
  endA.position.z = -5.4;
  noseSet.add(endA);
  const endB = new THREE.Mesh(
    new THREE.CircleGeometry(1.8, 40),
    new THREE.MeshBasicMaterial({ color: 0xdff0ff }),
  );
  endB.position.z = 5.4;
  endB.rotation.y = Math.PI;
  noseSet.add(endB);
  for (let i = 0; i < 18; i++) {
    const piv = new THREE.Group();
    piv.rotation.z = i * 2.4 + R();
    piv.position.z = -4.6 + (i / 17) * 7.2;
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 16), bumpMat);
    b.position.x = 1.5 - (piv.position.z + 5) * 0.012;
    b.scale.set(0.34, 0.8 + R() * 0.5, 1.0 + R() * 0.6);
    piv.add(b);
    noseSet.add(piv);
  }
  // fine hairs on the wall
  const N = 160;
  const cilia = new THREE.InstancedMesh(new THREE.ConeGeometry(0.028, 0.26, 6), bumpMat, N);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const one = V(1, 1, 1);
  for (let i = 0; i < N; i++) {
    const a = R() * Math.PI * 2;
    const z = -4.5 + R() * 8;
    const rad = 1.52 - (z + 5) * 0.02;
    q.setFromUnitVectors(UP, V(-Math.cos(a), -Math.sin(a), 0));
    m4.compose(V(Math.cos(a) * rad, Math.sin(a) * rad, z), q, one);
    cilia.setMatrixAt(i, m4);
  }
  noseSet.add(cilia);
}
const noseLight = new THREE.PointLight(0xffe2d2, 20, 14, 1.3);
noseLight.position.set(0, 0.4, 2.6);
noseSet.add(noseLight);
// guards: 10 round blue helpers sitting on the wall
const guardA = real.gloss(0x58c7ff, { emissive: 0x1b78e0, emissiveIntensity: 0.7 });
const guardB = guardA.clone(); // the half that the cold switches off
const eyeMat = real.gloss(0x0f1a2a);
const guards = Array.from({ length: 10 }, (_, i) => {
  const g = new THREE.Group();
  mesh(new THREE.SphereGeometry(0.17, 28, 20), i % 2 ? guardB : guardA, 0, 0, 0, g);
  for (const s of [-1, 1])
    mesh(new THREE.SphereGeometry(0.032, 12, 8), eyeMat, s * 0.065, 0.035, 0.15, g).castShadow =
      false;
  const a = i * 0.63 + 0.3;
  g.userData.home = V(Math.cos(a) * 1.02, Math.sin(a) * 1.02, 1.3 - (i % 5) * 0.5);
  noseSet.add(g);
  return g;
});
const vNose = Array.from({ length: 8 }, () => makeVirus(0.17, noseSet));
const vNosePos = (j, t, out) => {
  const x = Math.cos(j * 2.1) * 0.55;
  const y = Math.sin(j * 1.7) * 0.42;
  if (t < T.kuehlt)
    return out.set(x, y + Math.sin(t * 3 + j) * 0.05, 1.9 - 0.6 * (t - T.dort) - j * 0.2);
  const hold = 1.7 - (j % 4) * 0.36 - Math.floor(j / 4) * 0.22;
  let z = Math.max(hold - 0.6, 2.4 - 1.0 * (t - T.kuehlt) - j * 0.25);
  let yy = y + Math.sin(t * 3 + j) * 0.05;
  if (t > T.die) {
    z -= 2.3 * (t - T.die) * (1 + 0.08 * j);
    yy += Math.abs(Math.sin(t * 9 + j)) * 0.09;
  }
  return out.set(x, yy, z);
};

// ================================================================ Antarctica: researchers + the plane
const AP = V(...ANT);
const researchers = [
  [0.6, 0.8, 0xd8442f],
  [1.9, 0.2, 0x2f6fd6],
].map(([x, z, c]) => {
  const g = new THREE.Group();
  const parka = real.fabric(c);
  mesh(new THREE.CapsuleGeometry(0.34, 0.6, 8, 28), parka, 0, 0.95, 0, g);
  for (const s of [-1, 1]) {
    mesh(new THREE.CapsuleGeometry(0.13, 0.3, 6, 16), real.fabric(0x2a2f3a), s * 0.16, 0.3, 0, g);
    const arm = new THREE.Group();
    arm.position.set(s * 0.36, 1.3, 0);
    mesh(new THREE.CapsuleGeometry(0.1, 0.42, 6, 16), parka, 0, 0.3, 0, arm);
    arm.rotation.z = -s * 0.6;
    g.add(arm);
    g.userData[s < 0 ? "armL" : "armR"] = arm;
  }
  mesh(new THREE.SphereGeometry(0.22, 28, 20), real.skin(0xe9b594), 0, 1.72, 0.03, g);
  const hood = mesh(
    new THREE.TorusGeometry(0.22, 0.09, 12, 32),
    real.fabric(0xf4efe6),
    0,
    1.72,
    0,
    g,
  );
  hood.scale.z = 1.4;
  mesh(new THREE.SphereGeometry(0.25, 24, 16), parka, 0, 1.74, -0.1, g);
  for (const s of [-1, 1])
    mesh(new THREE.SphereGeometry(0.03, 10, 8), eyeMat, s * 0.08, 1.75, 0.235, g);
  g.userData.base = V(AP.x + x, 0, z);
  g.rotation.y = 0.5;
  scene.add(g);
  return g;
});
const plane = new THREE.Group();
const prop = new THREE.Group();
{
  const white = real.gloss(0xf4f5f7);
  const red = real.gloss(0xd23a2e);
  const fus = mesh(new THREE.CapsuleGeometry(0.46, 2.6, 12, 32), white, 0, 0, 0, plane);
  fus.rotation.z = Math.PI / 2;
  const stripe = mesh(new THREE.CapsuleGeometry(0.47, 2.2, 12, 32), red, 0, -0.06, 0, plane);
  stripe.rotation.z = Math.PI / 2;
  stripe.scale.set(0.5, 1, 1.0);
  mesh(roundedBox(1.0, 0.09, 5.2, 0.04), red, -0.3, 0.42, 0, plane);
  mesh(roundedBox(0.6, 0.07, 1.9, 0.03), red, 1.55, 0.25, 0, plane);
  mesh(roundedBox(0.7, 0.8, 0.07, 0.03), red, 1.6, 0.6, 0, plane);
  for (let i = 0; i < 3; i++)
    mesh(roundedBox(0.3, 0.24, 0.94, 0.06), real.gloss(0x26303c), -0.9 + i * 0.5, 0.16, 0, plane);
  for (const s of [-1, 1]) {
    mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8), real.metal(), -0.4, -0.6, s * 0.6, plane);
    mesh(roundedBox(1.5, 0.06, 0.2, 0.03), real.metal(0xd8dde4), -0.4, -0.9, s * 0.6, plane);
  }
  prop.position.set(-1.82, 0, 0);
  for (let i = 0; i < 2; i++) {
    const b = mesh(roundedBox(0.04, 1.5, 0.14, 0.02), real.plastic(0x23252b), 0, 0, 0, prop);
    b.rotation.x = (i * Math.PI) / 2;
  }
  mesh(new THREE.SphereGeometry(0.14, 16, 12), red, -0.05, 0, 0, prop);
  plane.add(prop);
  scene.add(plane);
}
const vPlane = Array.from({ length: 8 }, () => makeVirus(0.2));

// ================================================================ CTA: the hair dryer
const dryer = new THREE.Group();
{
  const bodyM = real.plastic(0x2c2c34);
  const gold = real.metal(0xe0a890, { roughness: 0.25 });
  const b = mesh(new THREE.CylinderGeometry(0.19, 0.21, 0.6, 40), bodyM, 0, 0, 0, dryer);
  b.rotation.z = Math.PI / 2;
  const nz = mesh(new THREE.CylinderGeometry(0.13, 0.17, 0.22, 40), gold, -0.4, 0, 0, dryer);
  nz.rotation.z = Math.PI / 2;
  const ring = mesh(new THREE.TorusGeometry(0.205, 0.025, 12, 40), gold, 0.3, 0, 0, dryer);
  ring.rotation.y = Math.PI / 2;
  const h = mesh(roundedBox(0.17, 0.62, 0.2, 0.06), bodyM, 0.12, -0.42, 0, dryer);
  h.rotation.z = -0.2;
  mesh(roundedBox(0.05, 0.12, 0.08, 0.02), gold, 0.03, -0.38, 0, dryer);
  dryer.position.set(1.18, 2.82, 0.3);
  scene.add(dryer);
}
const dryArrows = makeArrowSet(
  [
    [V(0.74, 2.86, 0.3), V(0.48, 2.82, 0.25)],
    [V(0.74, 2.72, 0.32), V(0.5, 2.6, 0.26)],
  ],
  { mat: heatMat, r: 0.03, amp: 0.04 },
);

// ================================================================ frame
const HAIR_WET = col(0x2a1a12);
const HAIR_ICE = col(0xd6e8f4);
const SKIN = col(0xe9b594);
const SKIN_COLD = col(0xd8c3c6);
const NOSE_RED = col(0xe2513c);
const easeOut = (k) => 1 - (1 - k) * (1 - k);
const youZ = (t) => lerp(-3.4, 0, easeOut(ramp(t, -0.5, 1.6)));
const _v = V(0, 0, 0);
const _w = V(0, 0, 0);

function renderAt(t) {
  const inNose = t >= T.dort && t < T.payoff;
  const inAnt = t >= T.fakt && t < T.foehnen;
  const inForest = !inNose && !inAnt;
  YOU.g.visible = MAMA.g.visible = inForest;
  noseSet.visible = inNose;

  // ---------------------------------------------------------------- you
  const runK = 1 - smooth(ramp(t, 1.15, 1.65));
  const shiver =
    ramp(t, T.dein, T.dein + 0.3) * (1 - ramp(t, T.rate - 0.3, T.rate)) +
    ramp(t, T.payoff, T.payoff + 0.2) * 0.35;
  YOU.g.position.set(
    Math.sin(t * 62) * 0.012 * shiver,
    Math.abs(Math.sin(t * 13)) * 0.09 * runK,
    youZ(t),
  );
  YOU.body.rotation.x = 0.14 * runK;
  YOU.legs.forEach((p, i) => (p.rotation.x = Math.sin(t * 13 + i * Math.PI) * 0.85 * runK));
  YOU.arms.forEach((p, i) => {
    p.rotation.x = -Math.sin(t * 13 + i * Math.PI) * 0.7 * runK;
    p.rotation.z = (i ? 1 : -1) * (0.14 + 0.25 * shiver);
  });
  // the head: looks back at Mama, shakes to show the stiff hair, tilts at "unschuldig"
  const shake = pop(t, T.straehne, T.biegst - 0.15, 0.2);
  YOU.head.rotation.y = Math.sin((t - T.straehne) * 9.5) * 0.55 * shake;
  YOU.head.rotation.z = 0.12 * pop(t, T.unschuldig - 0.1, T.kalte, 0.3);
  YOU.head.rotation.x = -0.1 * pop(t, T.rate, T.nur, 0.3);

  // frost: the hair freezes from "gefrieren"; the dryer thaws the right side in the CTA
  const frost = smooth(ramp(t, T.gefrieren - 0.05, T.gefrieren + 0.75));
  const thaw = smooth(ramp(t, T.foehnen + 0.35, T.foehnen + 1.7));
  const frostR = frost * (1 - thaw);
  const sparkle = 0.12 + 0.1 * Math.sin(t * 7);
  YOU.hairMat.color.copy(HAIR_WET).lerp(HAIR_ICE, frost);
  YOU.hairMat.roughness = lerp(0.24, 0.5, frost);
  YOU.hairMat.emissive.set(0x9fcff0).multiplyScalar(frost * sparkle);
  YOU.hairMatR.color.copy(HAIR_WET).lerp(HAIR_ICE, frostR);
  YOU.hairMatR.roughness = lerp(0.24, 0.5, frostR);
  YOU.hairMatR.emissive.set(0x9fcff0).multiplyScalar(frostR * sparkle);
  for (const s of YOU.strandList) {
    const f = s.right ? frostR : frost;
    const wet =
      s.wet +
      Math.sin(t * 5 + s.seed) * 0.05 +
      0.3 * runK +
      (s.right ? thaw * (0.15 + Math.sin(t * 16 + s.seed) * 0.12) : 0);
    s.p.rotation.x = -lerp(wet, s.froz, f);
    for (const c of s.ice) c.scale.setScalar(Math.max(0.001, f));
  }
  {
    // the special strand: bends, snaps, the lower half drops
    const sp = YOU.special;
    const bend = smooth(ramp(t, T.biegst + 0.3, T.brechen)) * 0.95;
    const fall = Math.max(0, t - T.brechen);
    sp.p.rotation.x = -lerp(0.1 + 0.3 * runK, 0.42, frost);
    sp.hinge.rotation.x = -bend - fall * 5;
    sp.hinge.position.y = -sp.L / 2 - 4.5 * fall * fall;
    sp.hinge.position.z = fall * 0.5;
    sp.hinge.visible = fall < 0.7;
    for (const c of sp.ice) c.scale.setScalar(Math.max(0.001, frost));
  }
  shards.forEach((m, i) => {
    const k = t - T.brechen;
    m.visible = inForest && k > 0 && k < 0.8;
    if (!m.visible) return;
    const a = i * 1.05;
    m.position.set(
      0.5 + Math.cos(a) * k * 0.9,
      2.3 + (0.6 + (i % 3) * 0.4) * k - 3.5 * k * k,
      0.38 + Math.sin(a) * k * 0.9,
    );
    m.rotation.set(k * 9 + i, k * 7, 0);
  });

  // cold skin, red nose (it glows when it is named)
  const coldK = smooth(ramp(t, T.erst, T.dein + 1)) * 0.75;
  YOU.skinMat.color.copy(SKIN).lerp(SKIN_COLD, coldK);
  const noseK = smooth(ramp(t, T.gefrieren, T.dein + 0.8));
  YOU.noseMat.color.copy(SKIN).lerp(NOSE_RED, noseK);
  const glow = pop(t, T.der + 0.4, T.dort, 0.3) + pop(t, T.kalte, T.schal, 0.3);
  YOU.noseMat.emissive.set(0xff2a10).multiplyScalar(glow * (0.55 + 0.35 * Math.sin(t * 9)));

  // steam off the warm wet hair, breath clouds, drops flying off
  steam.forEach((m, i) => {
    const k = (((t * 0.55 + i / 9) % 1) + 1) % 1;
    m.position.set(
      Math.sin(i * 2.4) * 0.3,
      3.0 + k * 1.0,
      Math.cos(i * 1.7) * 0.25 - 0.25 * runK * k,
    );
    m.scale.setScalar(0.6 + k * 1.6);
    m.material.opacity = 0.34 * Math.sin(Math.PI * k) * (1 - frost);
    m.visible = m.material.opacity > 0.01;
  });
  const masked = ramp(t, T.schal, T.schal + 0.25);
  breath.forEach((m, i) => {
    const k = ((((t - 2.6) * 0.45 + i * 0.07) % 1) + 1) % 1;
    const on = t > 2.6 && k < 0.6 && masked < 0.5;
    m.visible = on;
    if (!on) return;
    const u = k / 0.6;
    m.position.set(0, 2.42 + u * 0.12, 0.5 + u * (0.5 + i * 0.12));
    m.scale.setScalar(0.4 + u * 1.5);
    m.material.opacity = 0.3 * Math.sin(Math.PI * u);
  });
  drops.forEach((d, i) => {
    const t0 = -0.35 + i * 0.2;
    const k = t - t0;
    d.m.visible = inForest && k > 0 && k < 0.7;
    if (!d.m.visible) return;
    d.m.position.set(
      d.v[0] * k * 0.5,
      2.75 + d.v[1] * k - 4.5 * k * k,
      youZ(t0) + d.v[2] * k * 0.5 + 0.1,
    );
  });

  // scarf over the nose at "Schal drüber!"
  if (YOU.mask) {
    YOU.mask.visible = masked > 0;
    YOU.mask.position.y = lerp(2.2, 2.45, smooth(masked));
    YOU.mask.scale.set(1, Math.max(0.01, masked), 1);
  }
  // halo: the hair is innocent
  const haloK = pop(t, T.unschuldig - 0.05, T.kalte);
  halo.visible = haloK > 0;
  halo.scale.setScalar(Math.max(0.001, haloK));
  halo.position.set(0.02, 3.42 + Math.sin(t * 4) * 0.03, 0);

  // ---------------------------------------------------------------- Mama wags her finger
  {
    const wag = pop(t, T.mama - 0.3, T.erst + 0.2, 0.25);
    MAMA.arms[1].rotation.z = 0.14 + wag * (2.35 + Math.sin(t * 13) * 0.28);
    MAMA.arms[0].rotation.z = -0.14 - wag * 0.5;
    MAMA.head.rotation.z = Math.sin(t * 6.5) * 0.08 * wag;
    MAMA.g.position.y = DOOR.y + Math.abs(Math.sin(t * 6.5)) * 0.04 * wag;
  }

  // ---------------------------------------------------------------- cold ✕, viruses, heat meter
  animateArrows(coldArrows, t, inForest ? pop(t, T.dein, T.erkaelt) : 0);
  showNope(inForest ? pop(t, T.trotzdem + 0.1, T.erkaelt) : 0, 0, 3.75, 0.5, 0.75);
  animateArrows(heatArrows, t, inForest ? pop(t, T.waerme, T.der) : 0);
  {
    const k = pop(t, T.rate + 0.25, T.der);
    const known = ramp(t, T.zehntel, T.zehntel + 0.3);
    meter("kopf", k, {
      label: "WÄRME ÜBER DEN KOPF",
      value: lerp(0.55 + 0.4 * Math.sin(t * 5), 0.1, smooth(known)),
      text: known > 0.1 ? "10 %" : "?",
      x: 190,
      y: 560,
      width: 640,
      color: "#ff6b3d",
    });
  }
  vOut.forEach((g, i) => {
    if (!inForest) return (g.visible = false);
    if (t < T.rate) {
      const k = pop(t, T.viren - 0.05 + i * 0.07, T.rate - 0.1);
      const a = i * 0.7 + t * 0.6;
      const rad = 0.75 + (i % 3) * 0.28;
      setVirus(
        g,
        k,
        0.1 + Math.cos(a) * rad,
        2.75 + Math.sin(a * 1.3 + i) * 0.45,
        1.0 + Math.sin(a) * 0.4,
        t,
        i,
      );
    } else {
      const k = pop(t, T.kalte + i * 0.04, T.fakt, 0.25);
      _v.set(Math.cos(i * 0.7) * 0.9 - 0.25, 2.55 + Math.sin(i * 1.9) * 0.5, 0.95 + (i % 3) * 0.15);
      _w.set(0, 2.56, 0.54);
      const u = ((((t - T.kalte) * 0.5 + i * 0.111) % 1) + 1) % 1;
      const b = easeOut(ramp(t, T.schal + 0.08, T.schal + 0.55));
      if (b > 0) {
        // bounce off the scarf
        _w.lerp(_v, 0.3 + b * 1.3);
        _w.y += Math.sin(b * Math.PI) * 0.3;
        setVirus(g, k, _w.x, _w.y, _w.z, t * 3, i);
      } else {
        _v.lerp(_w, u);
        setVirus(g, k * (1 - u * u * u), _v.x, _v.y, _v.z, t, i);
      }
    }
  });

  // ---------------------------------------------------------------- inside the nose
  if (inNose) {
    const cold = smooth(ramp(t, T.kuehlt, T.fuenf + 0.5));
    mix(wallMat, 0xe88a8c, 0x8ea6dc, cold);
    wallMat.emissive.copy(_c.set(0x8a2f3a)).lerp(_c2.set(0x243a70), cold);
    mix(bumpMat, 0xf2a0a0, 0xa9bdea, cold);
    bumpMat.emissive.copy(wallMat.emissive);
    noseLight.color.copy(_c.set(0xffe2d2)).lerp(_c2.set(0xbcd4ff), cold);
    const off = smooth(ramp(t, T.fuenf + 0.3, T.haelfte + 0.1));
    mix(guardB, 0x58c7ff, 0x9aa9bb, off);
    guardB.emissiveIntensity = 0.7 * (1 - off);
    const caught1 = ramp(t, T.ab - 0.05, T.ab + 0.3);
    const caught2 = ramp(t, T.haelfte + 0.5, T.haelfte + 0.8);
    vNose.forEach((g, j) => {
      vNosePos(j, t, _v);
      const born =
        t < T.kuehlt
          ? ramp(t, T.dort - 0.2 + j * 0.05, T.dort + 0.15 + j * 0.05)
          : ramp(t, T.kuehlt + j * 0.06, T.kuehlt + 0.35 + j * 0.06);
      const k = born * (t < T.kuehlt ? 1 - caught1 : j < 3 ? 1 - caught2 : 1);
      setVirus(g, k, _v.x, _v.y, _v.z, t, j);
    });
    guards.forEach((g, i) => {
      const home = g.userData.home;
      let go = 0;
      let target = 0;
      if (t < T.kuehlt + 0.3) {
        go =
          smooth(ramp(t, T.waechter + i * 0.04, T.waechter + 0.5 + i * 0.04)) *
          (1 - smooth(ramp(t, T.ab + 0.3, T.kuehlt + 0.3)));
        target = i % 8;
      } else if (i % 2 === 0) {
        go = smooth(ramp(t, T.haelfte + 0.1, T.haelfte + 0.55));
        target = (i / 2) % 3;
      }
      vNosePos(target, t, _v);
      _v.x += Math.cos(i * 1.9) * 0.24;
      _v.y += Math.sin(i * 1.9) * 0.24;
      g.position.copy(home).lerp(_v, go);
      const frozen = i % 2 ? off : 0;
      g.position.y += Math.sin(t * 4 + i) * 0.04 * (1 - frozen) - 0.14 * frozen;
      g.position.x += Math.sin(t * 60 + i) * 0.008 * frozen;
      g.scale.setScalar(1 + 0.25 * Math.sin(go * Math.PI) - 0.15 * frozen);
    });
    showPanel(pop(t, T.fuenf - 0.1, T.haelfte - 0.15), "NASE", "−5 °C", LED.blue);
    if (t >= T.haelfte - 0.15)
      showPanel(pop(t, T.haelfte - 0.1, T.die), "WÄCHTER", "−42 %", LED.red);
  } else {
    showPanel(0);
  }

  // ---------------------------------------------------------------- Antarctica
  plane.visible = inAnt && t >= T.bis - 0.1;
  researchers.forEach((g, i) => {
    g.visible = inAnt;
    if (!inAnt) return;
    const scared = smooth(ramp(t, T.flugzeug + 0.5, T.flugzeug + 1.0));
    const b = g.userData.base;
    g.position.set(
      b.x + scared * 0.5 + Math.sin(t * 55 + i) * 0.012 * scared,
      Math.abs(Math.sin(t * 6 + i * 1.3)) * 0.2 * (1 - scared),
      b.z + scared * 0.5,
    );
    g.userData.armL.rotation.z = 0.6 + Math.sin(t * 8 + i) * 0.35 * (1 - scared) - scared * 0.9;
    g.userData.armR.rotation.z = -0.6 - Math.sin(t * 8 + i) * 0.35 * (1 - scared) + scared * 0.9;
    g.rotation.y = lerp(0.5, -1.1, scared);
  });
  if (plane.visible) {
    const u = easeOut(ramp(t, T.bis, T.flugzeug + 0.95));
    plane.position.set(
      AP.x + lerp(17, 3.4, u),
      lerp(8.5, 0.95, u) + Math.sin(t * 5) * 0.1 * (1 - u),
      lerp(-8, 1.6, u),
    );
    plane.rotation.set(Math.sin(t * 3) * 0.15 * (1 - u), -0.55, lerp(-0.2, 0, u));
    prop.rotation.x = t * 40;
    vPlane.forEach((g, i) => {
      const k = ramp(t, T.bis + 0.2 + i * 0.05, T.bis + 0.5 + i * 0.05);
      const land = smooth(ramp(t, T.flugzeug + 0.9, T.foehnen));
      const back = (1.6 + i * 0.6) * (1 - land * 0.7);
      setVirus(
        g,
        k,
        plane.position.x + back * 0.85 - land * (1.2 + i * 0.25),
        plane.position.y + 0.3 + Math.sin(t * 7 + i) * 0.35 + back * 0.12,
        plane.position.z - back * 0.5 + Math.cos(t * 5 + i * 2) * 0.35,
        t,
        i,
      );
    });
  } else vPlane.forEach((g) => (g.visible = false));

  // ---------------------------------------------------------------- CTA: the dryer
  dryer.visible = t >= T.foehnen;
  if (dryer.visible) {
    dryer.scale.copy(squash(t, T.foehnen));
    dryer.rotation.z = Math.sin(t * 9) * 0.06;
    dryer.position.y = 2.82 + Math.sin(t * 30) * 0.006;
  }
  animateArrows(dryArrows, t, t >= T.foehnen ? pop(t, T.foehnen + 0.25, 99) : 0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
