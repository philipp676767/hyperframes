// #80 Katzenzunge — the cat in its basket (Wintergarten, set.js), the micro
// world of fur + tongue hooks (MAC), one giant hollow hook (HOOK) and the
// lion's bone (BONE). renderAt(t) is a pure function of time.
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
  showNope,
  makeArrowSet,
  animateArrows,
  forceMat,
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
import "./set.js";
import { createHand } from "./hand.js";
import { meter } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS, MAC, HOOK, BONE, lickPhase } from "./beats.js";

highlights(HIGHLIGHTS);

const fur = real.fabric(0xd2843a);
const furDark = real.fabric(0xa95e24);
const cream = real.fabric(0xf2e0c4);
const pink = real.skin(0xe98e9b, { sheenColor: new THREE.Color(0xffc7cf) });
const tongueMat = real.skin(0xe2707f, { roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.3 });
const keratin = real.plastic(0xf3e7d6, {
  roughness: 0.28,
  clearcoat: 0.8,
  clearcoatRoughness: 0.15,
});
const spitMat = new THREE.MeshPhysicalMaterial({
  color: 0x8fd6ff,
  roughness: 0.05,
  clearcoat: 1,
  emissive: 0x2a7fc0,
  emissiveIntensity: 0.35,
});
const mesh = (geo, mat, x = 0, y = 0, z = 0, parent) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  if (parent) parent.add(m);
  return m;
};
const ball = (r, mat, sx, sy, sz, x, y, z, parent) => {
  const m = mesh(new THREE.SphereGeometry(r, 48, 32), mat, x, y, z, parent);
  m.scale.set(sx, sy, sz);
  return m;
};

// ================================================================ the basket
{
  const prof = [];
  for (let i = 0; i <= 24; i++) {
    const f = i / 24;
    const r = 1.05 + 0.25 * Math.sin(f * Math.PI * 0.5) + 0.025 * Math.sin(f * Math.PI * 14);
    prof.push(new THREE.Vector2(r, f * 0.55));
  }
  prof.push(
    new THREE.Vector2(1.22, 0.58),
    new THREE.Vector2(1.14, 0.55),
    new THREE.Vector2(0.95, 0.1),
  );
  const rattan = new THREE.MeshPhysicalMaterial({
    color: 0xb7834a,
    roughness: 0.75,
    side: THREE.DoubleSide,
  });
  mesh(new THREE.LatheGeometry(prof, 96), rattan, 0, 0.1, 0, scene);
  const rim = mesh(new THREE.TorusGeometry(1.2, 0.07, 16, 96), rattan, 0, 0.67, 0, scene);
  rim.rotation.x = Math.PI / 2;
  ball(1.08, real.fabric(0xe9dcc6), 1, 0.25, 1, 0, 0.32, 0, scene);
}

// ================================================================ the cat
const cat = new THREE.Group();
scene.add(cat);
ball(0.56, fur, 1, 0.88, 1.1, 0, 0.78, -0.18, cat); // hips
const torso = ball(0.46, fur, 0.95, 1.2, 0.9, 0, 1.08, 0.08, cat);
ball(0.3, cream, 0.92, 1.3, 0.5, 0, 1.06, 0.4, cat); // chest bib
// tabby stripes on the back
// tail curled round the front
{
  const c = new THREE.CatmullRomCurve3([
    V(0, 0.48, -0.7),
    V(0.6, 0.45, -0.5),
    V(0.85, 0.42, 0.1),
    V(0.6, 0.42, 0.6),
    V(0.15, 0.44, 0.78),
  ]);
  mesh(new THREE.TubeGeometry(c, 64, 0.085, 16), fur, 0, 0, 0, cat);
  ball(0.09, furDark, 1, 1, 1, 0.15, 0.44, 0.78, cat);
}
// legs: left stays down, right lifts (pivot at the shoulder)
function leg(sx) {
  const g = new THREE.Group();
  g.position.set(sx * 0.17, 0.98, 0.32);
  cat.add(g);
  mesh(new THREE.CapsuleGeometry(0.085, 0.48, 8, 24), fur, 0, -0.32, 0.02, g);
  const paw = ball(0.115, cream, 1, 0.72, 1.2, 0, -0.62, 0.08, g);
  // toe beans + main pad underneath (seen when the paw is lifted)
  const pads = new THREE.Group();
  pads.position.set(0, -0.69, 0.08);
  g.add(pads);
  ball(0.05, pink, 1.2, 0.5, 1, 0, 0, -0.01, pads);
  for (const [x, z] of [
    [-0.06, 0.07],
    [-0.02, 0.1],
    [0.02, 0.1],
    [0.06, 0.07],
  ])
    ball(0.022, pink, 1, 0.6, 1, x, 0.005, z, pads);
  // sweat beads on the pads
  const beads = [];
  const r = rng(sx > 0 ? 3 : 4);
  for (let i = 0; i < 6; i++) {
    const b = ball(0.011, spitMat, 1, 1, 1, (r() - 0.5) * 0.12, -0.012, (r() - 0.2) * 0.14, pads);
    beads.push(b);
  }
  return { g, paw, beads };
}
const legL = leg(-1);
const legR = leg(1);

// head
const head = new THREE.Group();
head.position.set(0, 1.86, 0.3);
cat.add(head);
ball(0.4, fur, 1.12, 0.95, 1, 0, 0, 0, head);
for (const sx of [-1, 1]) {
  ball(0.2, fur, 1, 0.9, 1, sx * 0.21, -0.12, 0.16, head); // cheeks
  ball(0.11, cream, 1, 0.85, 1, sx * 0.07, -0.16, 0.33, head); // muzzle
  // ears
  const ear = mesh(new THREE.ConeGeometry(0.16, 0.32, 32), fur, sx * 0.24, 0.36, -0.02, head);
  ear.rotation.set(-0.12, 0, -sx * 0.32);
  const inner = mesh(new THREE.ConeGeometry(0.1, 0.22, 32), pink, sx * 0.235, 0.34, 0.03, head);
  inner.rotation.set(-0.12, 0, -sx * 0.32);
  // whiskers
  for (let k = 0; k < 3; k++) {
    const w = mesh(
      new THREE.CylinderGeometry(0.004, 0.003, 0.5, 6),
      real.plastic(0xfaf6ee),
      sx * 0.34,
      -0.14 - k * 0.03,
      0.34,
      head,
    );
    w.rotation.set(0, 0, sx * (1.45 + k * 0.1));
    w.castShadow = false;
  }
}
ball(0.08, cream, 1, 0.8, 1, 0, -0.27, 0.27, head); // chin
const nose = ball(0.045, pink, 1.1, 0.6, 0.7, 0, -0.07, 0.41, head);
nose.rotation.x = 0.3;
const eyes = [];
const eyeMat = real.gloss(0x9cbf3a, { emissive: 0x2a3a08, emissiveIntensity: 0.3 });
for (const sx of [-1, 1]) {
  const e = new THREE.Group();
  e.position.set(sx * 0.16, 0.05, 0.345);
  head.add(e);
  ball(0.088, eyeMat, 1, 1, 0.75, 0, 0, 0, e);
  ball(0.088, real.gloss(0x0b0b0b), 0.26, 0.9, 0.78, 0, 0, 0.006, e);
  eyes.push(e);
}
const mouth = ball(0.06, flat(0x3a1418), 1.3, 0.6, 0.6, 0, -0.22, 0.35, head);
const tongueG = new THREE.Group();
tongueG.position.set(0, -0.22, 0.36);
head.add(tongueG);
const tongue = ball(0.1, tongueMat, 0.85, 0.24, 1.6, 0, 0, 0.13, tongueG);

// hairball on the rug
const hairball = new THREE.Group();
hairball.position.set(0.55, 0.22, 1.35);
scene.add(hairball);
ball(0.13, fur, 1.25, 0.8, 1, 0, 0, 0, hairball);
ball(0.08, furDark, 1, 0.8, 1, 0.08, 0.04, 0.04, hairball);
{
  const r = rng(7);
  for (let i = 0; i < 10; i++) {
    const c = new THREE.CatmullRomCurve3([
      V(0, 0, 0),
      V((r() - 0.5) * 0.3, r() * 0.1, (r() - 0.5) * 0.3),
      V((r() - 0.5) * 0.45, 0.02, (r() - 0.5) * 0.45),
    ]);
    mesh(new THREE.TubeGeometry(c, 8, 0.008, 4), fur, 0, 0, 0, hairball);
  }
}
// wet washcloth (the "kein Waschlappen")
const cloth = new THREE.Group();
cloth.position.set(1.9, 0.12, 1.5);
cloth.rotation.y = -0.4;
scene.add(cloth);
mesh(roundedBox(0.9, 0.05, 0.6, 0.02), real.fabric(0x7fb6d8), 0, 0, 0, cloth);
mesh(roundedBox(0.9, 0.05, 0.6, 0.02), real.fabric(0x76aed0), 0.04, 0.05, 0.02, cloth).rotation.y =
  0.08;
// sandpaper sheet with grains
{
  const g = new THREE.Group();
  g.position.set(-3.2, 0.1, 1.8);
  g.rotation.y = 0.3;
  scene.add(g);
  mesh(roundedBox(1.3, 0.02, 1.0, 0.008), real.fabric(0x9b6a3c), 0, 0, 0, g);
  const r = rng(11);
  const n = 1400;
  const im = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.012, 0),
    real.plastic(0x7a5634, { roughness: 0.6 }),
    n,
  );
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < n; i++) {
    m4.compose(
      V((r() - 0.5) * 1.25, 0.012, (r() - 0.5) * 0.95),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(r() * 3, r() * 3, 0)),
      V(1, 0.7 + r(), 1),
    );
    im.setMatrixAt(i, m4);
  }
  im.castShadow = true;
  g.add(im);
}
// cool wisps rising off the fur (Klimaanlage)
const wisps = new THREE.InstancedMesh(
  new THREE.SphereGeometry(0.05, 12, 8),
  new THREE.MeshBasicMaterial({
    color: 0xbfe8ff,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  }),
  24,
);
wisps.userData.noAO = true;
wisps.frustumCulled = false;
scene.add(wisps);

// the viewer's hand (hook)
const hand = createHand({ scale: 1.15, sleeve: 0x8fa3b8 });

// ================================================================ hook geometry
// a papilla: a cone, tip down, the lower half bent backwards (−z)
function hookGeo(r = 0.16, h = 1.6, bend = 0.45, seg = 20) {
  const g = new THREE.ConeGeometry(r, h, seg, 10);
  g.rotateX(Math.PI); // tip down
  g.translate(0, -h / 2, 0); // base at y = 0, tip at −h
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const d = -p.getY(i) / h; // 0 at base, 1 at tip
    p.setZ(i, p.getZ(i) - bend * d * d);
  }
  g.computeVertexNormals();
  return g;
}

// ================================================================ MAC: fur + tongue cross-section
const mac = new THREE.Group();
mac.position.set(...MAC);
scene.add(mac);
const skinMat = real.skin(0xe8b89c);
{
  const g = new THREE.PlaneGeometry(90, 90, 90, 90);
  g.rotateX(-Math.PI / 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++)
    p.setY(i, Math.sin(p.getX(i) * 1.3) * 0.04 + Math.cos(p.getZ(i) * 1.1) * 0.04);
  g.computeVertexNormals();
  mesh(g, skinMat, 0, 0, 0, mac);
}
// hair forest
const HAIR_N = 2600;
{
  const r = rng(21);
  const geo = new THREE.CylinderGeometry(0.02, 0.034, 1.7, 7, 4);
  geo.translate(0, 0.85, 0);
  // bend each hair a little (arching towards +z)
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i) / 1.7;
    p.setZ(i, p.getZ(i) + 0.3 * y * y);
  }
  geo.computeVertexNormals();
  const im = new THREE.InstancedMesh(
    geo,
    real.plastic(0xffffff, { roughness: 0.45, clearcoat: 0.4 }),
    HAIR_N,
  );
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const base = new THREE.Color(0xd98b3e);
  for (let i = 0; i < HAIR_N; i++) {
    const x = -7 + r() * 11.2;
    const z = (r() - 0.5) * 30;
    if ((x - 3) ** 2 + z * z < 0.9) {
      m4.makeScale(0, 0, 0); // room for the knot
    } else {
      q.setFromEuler(new THREE.Euler(0.25 + (r() - 0.5) * 0.25, r() * 0.6, (r() - 0.5) * 0.25));
      m4.compose(V(x, 0, z), q, V(1, 0.75 + r() * 0.4, 1));
    }
    im.setMatrixAt(i, m4);
    im.setColorAt(i, base.clone().offsetHSL((r() - 0.5) * 0.03, 0, (r() - 0.5) * 0.18));
  }
  im.castShadow = true;
  mac.add(im);
}
// tongue slab with rows of hooks (moves as a conveyor)
const SPACING = 0.95;
const tongueSlab = new THREE.Group();
mac.add(tongueSlab);
mesh(roundedBox(8, 1.6, 26, 0.5, 4), tongueMat, 0, 0.8, -1, tongueSlab);
const hookRows = [];
{
  const r = rng(31);
  for (let x = -3.6; x <= 3.61; x += SPACING)
    for (let z = -13; z <= 11; z += SPACING)
      hookRows.push([x + (r() - 0.5) * 0.25, z + (r() - 0.5) * 0.25, 0.85 + r() * 0.3]);
}
const hookIM = new THREE.InstancedMesh(hookGeo(), keratin, hookRows.length);
hookIM.castShadow = true;
hookIM.frustumCulled = false;
tongueSlab.add(hookIM);
// the throat: a dark opening at the back end of the tongue
{
  const g = new THREE.Mesh(
    new THREE.SphereGeometry(5, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x3a0d14, roughness: 0.6, side: THREE.BackSide }),
  );
  g.rotation.x = Math.PI / 2;
  g.scale.set(0.9, 1, 0.7);
  g.position.set(0, 2.2, -14.2);
  mac.add(g);
  const lip = mesh(new THREE.TorusGeometry(5.2, 0.6, 16, 64), tongueMat, 0, 2.2, -14, mac);
  lip.scale.set(0.9, 0.7, 1);
}
// the knot: 6 strands that untangle (precomputed steps)
const KNOT_STEPS = 14;
const knotSteps = [];
{
  const r = rng(41);
  const strands = Array.from({ length: 6 }, (_, i) => ({
    a: (i / 6) * Math.PI * 2,
    ph: r() * 6,
    x: (r() - 0.5) * 0.6,
  }));
  for (let s = 0; s < KNOT_STEPS; s++) {
    const k = s / (KNOT_STEPS - 1);
    const g = new THREE.Group();
    for (const st of strands) {
      const pts = [];
      for (let j = 0; j <= 16; j++) {
        const u = j / 16;
        const y = u * 2.6;
        const tw = (1 - k) * 0.45 * Math.sin(u * Math.PI); // tangle radius
        const a = st.a + u * 9 * (1 - k) + st.ph;
        pts.push(
          V(st.x * k * 2.2 + Math.cos(a) * tw, y, Math.sin(a) * tw + 0.5 * u * u + st.x * k),
        );
      }
      const m = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.045, 7),
        real.plastic(0xc97b33, { roughness: 0.45 }),
      );
      m.castShadow = true;
      g.add(m);
    }
    g.visible = false;
    g.position.x = 3;
    mac.add(g);
    knotSteps.push(g);
  }
}
// the special hook that opens the knot
const knotHook = mesh(hookGeo(0.2, 1.9, 0.5, 32), keratin, 0, 0, 0, mac);
// loose hairs that get caught and ride the hooks backwards
const looseHairs = [];
{
  const r = rng(51);
  for (let i = 0; i < 7; i++) {
    const pts = [];
    for (let j = 0; j <= 8; j++)
      pts.push(
        V(Math.sin(j * 0.8 + i) * 0.15, -0.2 - (j / 8) * 0.4 + Math.sin(j) * 0.05, (j / 8) * 2.4),
      );
    const m = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.04, 6),
      real.plastic(0xe29a4c),
    );
    m.userData = { x: 0.8 + i * 0.45 + (r() - 0.5) * 0.2, z0: 1 + r() * 3 };
    mac.add(m);
    looseHairs.push(m);
  }
}
// arrows: everything goes back (−z)
const backArrows = makeArrowSet(
  [
    [V(4.4, 0.9, 3.5), V(4.4, 0.9, -2.5)],
    [V(4.4, 1.6, 4.5), V(4.4, 1.6, -1.5)],
    [V(4.4, 0.25, 2.5), V(4.4, 0.25, -3.5)],
  ],
  { parent: mac, mat: forceMat, amp: 0, r: 0.09 },
);
// spit drops on the skin + their vapour
const DROPS = 26;
const drops = new THREE.InstancedMesh(new THREE.SphereGeometry(0.12, 24, 16), spitMat, DROPS);
drops.frustumCulled = false;
mac.add(drops);
const dropPos = [];
{
  const r = rng(61);
  for (let i = 0; i < DROPS; i++) dropPos.push([1.2 + r() * 2.8, (r() - 0.5) * 4, r()]);
}
const vapour = new THREE.InstancedMesh(
  new THREE.SphereGeometry(0.16, 12, 8),
  new THREE.MeshBasicMaterial({
    color: 0xd8f2ff,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  }),
  40,
);
vapour.userData.noAO = true;
vapour.frustumCulled = false;
mac.add(vapour);
// one-way sign (German "Einbahnstraße")
const sign = new THREE.Group();
{
  const cv = document.createElement("canvas");
  cv.width = 1024;
  cv.height = 340;
  const c = cv.getContext("2d");
  c.fillStyle = "#1f5fbf";
  c.fillRect(0, 0, 1024, 340);
  c.strokeStyle = "#ffffff";
  c.lineWidth = 14;
  c.strokeRect(16, 16, 992, 308);
  c.fillStyle = "#ffffff";
  c.beginPath();
  c.moveTo(70, 115);
  c.lineTo(760, 115);
  c.lineTo(760, 55);
  c.lineTo(960, 170);
  c.lineTo(760, 285);
  c.lineTo(760, 225);
  c.lineTo(70, 225);
  c.closePath();
  c.fill();
  c.fillStyle = "#111";
  c.font = "bold 92px Montserrat, Arial, sans-serif";
  c.textBaseline = "middle";
  c.fillText("Einbahnstraße", 95, 172);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const plate = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 1),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4 }),
  );
  plate.position.y = 2.2;
  plate.rotation.y = Math.PI / 2; // faces +x (the camera side)
  sign.add(plate);
  const back = mesh(roundedBox(0.04, 1.04, 3.04, 0.02), real.metal(0xb8bcc2), -0.03, 2.2, 0, sign);
  back.castShadow = true;
  mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 16), real.metal(0x9aa0a6), -0.08, 1.1, 0, sign);
}
sign.position.set(4.8, 0, -6);
mac.add(sign);

// ================================================================ HOOK: one giant papilla, hollow tip
const hookG = new THREE.Group();
hookG.position.set(...HOOK);
scene.add(hookG);
{
  const g = new THREE.PlaneGeometry(40, 40);
  g.rotateX(-Math.PI / 2);
  mesh(g, skinMat, 0, 0, 0, hookG);
  mesh(roundedBox(9, 1.4, 9, 0.5), tongueMat, 0, 6.3, -0.8, hookG);
  const r = rng(71);
  for (let i = 0; i < 40; i++) {
    const h = mesh(
      new THREE.CylinderGeometry(0.06, 0.09, 3.2, 8),
      real.plastic(0xd98b3e),
      (r() - 0.5) * 9,
      1.6,
      -2 - r() * 6,
      hookG,
    );
    h.rotation.x = 0.3;
  }
}
// a section of the papilla between d0 and d1 (0 = base, 1 = tip), bent like
// hookGeo; half = open cutaway (only the −x half, open towards +x / camera)
function hookPart(r, h, bend, d0, d1, half, seg = 48) {
  const g = new THREE.CylinderGeometry(
    r * (1 - d0),
    Math.max(0.001, r * (1 - d1)),
    (d1 - d0) * h,
    seg,
    12,
    half,
    half ? Math.PI : 0,
    half ? Math.PI : Math.PI * 2,
  );
  g.translate(0, -d0 * h - ((d1 - d0) * h) / 2, 0);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const d = -p.getY(i) / h;
    p.setZ(i, p.getZ(i) - bend * d * d);
  }
  g.computeVertexNormals();
  return g;
}
const keratinIn = real.plastic(0xe2cdb4, { roughness: 0.35, side: THREE.DoubleSide });
const giantFull = mesh(hookGeo(0.75, 5.0, 1.8, 48), keratin, 0, 5.6, 0, hookG);
const giantCut = new THREE.Group();
giantCut.position.set(0, 5.6, 0);
hookG.add(giantCut);
mesh(hookPart(0.75, 5.0, 1.8, 0, 0.62, false), keratin, 0, 0, 0, giantCut);
mesh(hookPart(0.75, 5.0, 1.8, 0.62, 1, true), keratinIn, 0, 0, 0, giantCut);
// the spit that rises in the hollow tip
const chanPts = [];
for (let j = 0; j <= 12; j++) {
  const d = 0.64 + (j / 12) * 0.33;
  chanPts.push(V(-0.05, 5.6 - d * 5.0, -1.8 * d * d));
}
const chan = new THREE.CatmullRomCurve3(chanPts.reverse()); // starts at the tip
// a liquid column that grows up the hollow (draw range)
const SPIT_SEG = 48;
const spitCol = mesh(new THREE.TubeGeometry(chan, SPIT_SEG, 0.12, 12), spitMat, 0, 0, 0, hookG);
const tipDrop = mesh(new THREE.SphereGeometry(0.16, 32, 24), spitMat, 0, 0, 0, hookG);

// ================================================================ BONE: the lion's tongue rasps meat off
const boneG = new THREE.Group();
boneG.position.set(...BONE);
scene.add(boneG);
{
  const g = new THREE.PlaneGeometry(50, 50);
  g.rotateX(-Math.PI / 2);
  mesh(g, real.fabric(0xc9a66b), 0, 0, 0, boneG); // savanna sand
  const boneMat = real.ceramic(0xf1e6cf, { roughness: 0.45, clearcoat: 0.2 });
  const shaft = mesh(new THREE.CylinderGeometry(0.42, 0.42, 6, 40), boneMat, 0, 0.55, 0, boneG);
  shaft.rotation.z = Math.PI / 2;
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) ball(0.55, boneMat, 1, 1, 1, sx * 3.1, 0.6, sz * 0.38, boneG);
}
const meat = [];
{
  const r = rng(81);
  for (let i = 0; i < 9; i++) {
    const m = ball(
      0.5,
      real.skin(0xa3303a, { roughness: 0.5, clearcoat: 0.4 }),
      1.1,
      0.75,
      1,
      -2.2 + i * 0.55,
      0.95 + r() * 0.15,
      (r() - 0.5) * 0.3,
      boneG,
    );
    meat.push(m);
  }
}
const lionTongue = new THREE.Group();
boneG.add(lionTongue);
mesh(
  roundedBox(3.2, 0.6, 3.2, 0.25),
  real.skin(0xc95a6a, { roughness: 0.4, clearcoat: 0.5 }),
  0,
  0.3,
  0,
  lionTongue,
);
const lionHooks = new THREE.InstancedMesh(hookGeo(0.09, 0.5, 0.15, 12), keratin, 100);
{
  const m4 = new THREE.Matrix4();
  let i = 0;
  for (let x = -1.35; x <= 1.36; x += 0.3)
    for (let z = -1.35; z <= 1.36; z += 0.3) {
      if (i >= 100) continue;
      m4.makeTranslation(x, 0, z);
      lionHooks.setMatrixAt(i++, m4);
    }
  lionHooks.count = i;
}
lionHooks.castShadow = true;
lionTongue.add(lionHooks);

// ================================================================ render
const applyCamera = shotCamera(shots);
const m4 = new THREE.Matrix4();
const q = new THREE.Quaternion();
const qHook = new THREE.Quaternion();

function renderAt(t) {
  // ------------------------------------------------ hand (hook) — the cat licks it
  hand.track(t, [
    { t: -0.6, pos: [0.75, 1.36, 1.25], rot: [0.15, -2.35, 0.2], pose: "open" },
    { t: 0, pos: [0.46, 1.44, 0.98], rot: [0.15, -2.35, 0.2], pose: "open" },
    { t: 0.8, pos: [0.38, 1.47, 0.92], rot: [0.2, -2.35, 0.25], pose: "open" },
    { t: 1.6, pos: [0.42, 1.45, 0.95], rot: [0.2, -2.35, 0.25], pose: "open" },
    { t: T.zunge0, pos: [1.2, 1.4, 1.6], rot: [0.15, -2.35, 0.2], pose: "open", out: true },
  ]);

  // ------------------------------------------------ cat pose
  const lickHand = t < T.zunge0 ? 1 : 0;
  const profile = t >= T.zunge0 && t < T.schmirgel;
  const retch =
    smooth(ramp(t, T.wuergt, T.wuergt + 0.3)) *
    (1 - smooth(ramp(t, T.haarballen + 0.3, T.haarballen + 0.8)));
  const pawUp =
    smooth(ramp(t, T.katzen - 0.2, T.katzen + 0.4)) *
    (1 - smooth(ramp(t, T.haare2 - 0.4, T.haare2)));
  const groom = t >= T.ihre2 && t < T.haare2 ? 1 : 0;
  const ctaLook = t >= T.cta - 0.2 ? 1 : 0;

  // licking cycle (strokes)
  const lickCycle = 0.5 - 0.5 * Math.cos(t * Math.PI * 3.2);
  let tongueOut = 0;
  if (lickHand) tongueOut = 0.55 + 0.45 * lickCycle;
  if (profile) tongueOut = 0.75 + 0.25 * lickCycle;
  if (groom) tongueOut = 0.5 + 0.5 * lickCycle;
  if (ctaLook) tongueOut = pop(t, T.cta + 0.6, T.cta + 1.3, 0.15) * 0.5;
  tongueG.scale.set(1, 1, Math.max(0.01, tongueOut * 1.2));
  tongueG.rotation.x = lickHand ? 0.35 - 0.4 * lickCycle : groom ? 0.7 - 0.3 * lickCycle : 0.15;
  tongue.visible = tongueOut > 0.02;
  mouth.visible = tongueOut > 0.02 || retch > 0.1;
  mouth.scale.set(1.3, 0.6 + retch * 0.8, 0.6);

  head.rotation.set(0, 0, 0);
  if (lickHand) head.rotation.set(0.12, 0.42, -0.12);
  if (profile) head.rotation.set(0.05, 0.25, 0);
  head.rotation.x += retch * 0.55;
  head.position.set(0, 1.86 - retch * 0.18, 0.3 + retch * 0.12);
  if (t >= T.katzen - 0.2 && t < T.haare2)
    head.rotation.set(0.35 * pawUp + (groom ? 0.15 : 0), 0.35 * groom, 0);
  if (ctaLook) head.rotation.set(-0.05, 0, 0.08 * Math.sin((t - T.cta) * 1.2));
  torso.scale.set(0.95, 1.2 - retch * 0.12 * (0.5 + 0.5 * Math.sin(t * 22)), 0.9);

  // eyes: blinks; closed while licking (cats squint), wide at the CTA
  const blink = Math.max(
    pop(t, 3.0, 3.18, 0.06),
    pop(t, 42.6, 42.8, 0.06),
    pop(t, 9.2, 9.36, 0.06),
  );
  const squint = groom ? 0.5 : lickHand ? 0.35 : retch * 0.7;
  for (const e of eyes) e.scale.set(1, Math.max(0.08, 1 - squint - blink), 1);

  // right paw lifts (pads to the camera) for the sweat + grooming shots
  legR.g.rotation.set(-1.55 * pawUp, 0, -0.25 * pawUp);
  legR.g.position.set(0.17, 0.98 + 0.12 * pawUp, 0.32 + 0.1 * pawUp);
  legL.g.rotation.set(0, 0, 0);
  const sweat = pop(t, T.pfoten - 0.3, T.ihre2, 0.25);
  legR.beads.forEach((b, i) =>
    b.scale.setScalar(Math.max(0.001, sweat * (0.8 + 0.5 * Math.sin(i * 2.1 + t * 3) * 0.2))),
  );
  legL.beads.forEach((b) => b.scale.setScalar(0.001));

  // hairball pops out onto the rug
  hairball.visible = t >= T.haarballen + 0.2 && t < T.zunge0 + 20;
  hairball.scale.copy(squash(t, T.haarballen + 0.2, 0.6));
  puff("ball", t, T.haarballen + 0.3, 0.55, 0.15, 1.35, 0.5);

  // washcloth gets the ✕
  showNope(pop(t, T.kein + 0.1, T.kamm), 1.9, 0.5, 1.5, 0.4);

  // cool wisps off the fur
  {
    const k = groom ? smooth(ramp(t, T.ihre2, T.ihre2 + 0.6)) : 0;
    for (let i = 0; i < 24; i++) {
      const f = (t * 0.45 + i / 24) % 1;
      const a = i * 2.39;
      const s = k * (0.6 + f * 1.4) * (1 - f);
      m4.compose(
        V(Math.cos(a) * 0.45, 1.0 + f * 1.6 + (i % 3) * 0.15, 0.1 + Math.sin(a) * 0.4),
        q,
        V(s, s, s),
      );
      wisps.setMatrixAt(i, m4);
    }
    wisps.instanceMatrix.needsUpdate = true;
  }

  // ------------------------------------------------ MAC: conveyor of hooks
  const phase = lickPhase(t);
  const press =
    smooth(ramp(t, T.bringen + 0.1, T.haut)) * (1 - smooth(ramp(t, T.katzen - 0.4, T.katzen)));
  const slabY = 2.3 - 0.45 * press; // hook tips ~0.7 above the skin, ~0.25 when pressed
  tongueSlab.position.set(0, slabY, 0);
  const off = -(phase % SPACING);
  hookRows.forEach(([x, z, s], i) => {
    const zz = z + off;
    m4.compose(V(x, 0, zz), q, V(s, s, s));
    hookIM.setMatrixAt(i, m4);
  });
  hookIM.instanceMatrix.needsUpdate = true;

  // knot + its hook (stand-still part of the micro story)
  const knotOn = t >= T.trifft - 0.3 && t < T.lose + 1.0;
  const untie = smooth(ramp(t, T.zieht - 0.2, T.lose - 0.1));
  knotSteps.forEach((g, s) => (g.visible = knotOn && s === Math.round(untie * (KNOT_STEPS - 1))));
  {
    const arrive = smooth(ramp(t, T.trifft, T.knoten + 0.2));
    const turn = smooth(ramp(t, T.dreht, T.dreht + 0.7));
    knotHook.visible = knotOn;
    knotHook.position.set(3.0, slabY + 0.3 - 0.15 * arrive, 1.6 - 1.6 * arrive - 1.4 * untie);
    qHook.setFromEuler(new THREE.Euler(-0.25 * turn, 0.9 * turn, 0.3 * turn));
    knotHook.quaternion.copy(qHook);
  }

  // loose hairs ride the hooks backwards (from "Lose" until the payoff ends)
  const looseOn = t >= T.lose - 0.1 && t < T.fakt;
  looseHairs.forEach((h) => {
    h.visible = looseOn;
    const z =
      t < T.haare2 - 0.3
        ? h.userData.z0 - (phase - lickPhase(T.lose)) * 0.98
        : h.userData.z0 - 7 - (phase - lickPhase(T.haare2 - 0.3)) * 0.98;
    h.visible = looseOn && z > -14.5;
    h.position.set(h.userData.x, slabY - 0.55, z);
  });

  animateArrows(backArrows, t, pop(t, T.alle + 0.3, T.nur) + pop(t, T.haare2, T.einbahn - 0.4));

  // spit drops on the skin, then they evaporate (vapour rises)
  {
    const land = ramp(t, T.haut - 0.3, T.haut + 0.5);
    const dry = smooth(ramp(t, T.kuehlt - 0.4, T.katzen));
    for (let i = 0; i < DROPS; i++) {
      const [x, z, d] = dropPos[i];
      const s = t < T.bringen ? 0 : clampPos(land * 3 - d * 2) * (1 - dry) * (0.7 + d * 0.6);
      m4.compose(V(x, 0.06, z), q, V(s, s * 0.55, s));
      drops.setMatrixAt(i, m4);
    }
    drops.instanceMatrix.needsUpdate = true;
    const vk = pop(t, T.dort, T.katzen, 0.3);
    for (let i = 0; i < 40; i++) {
      const f = (t * 0.6 + i / 40) % 1;
      const [x, z] = dropPos[i % DROPS];
      const s = vk * (0.5 + f * 1.8) * (1 - f);
      m4.compose(V(x + Math.sin(f * 5 + i) * 0.2, 0.2 + f * 2.6, z), q, V(s, s, s));
      vapour.setMatrixAt(i, m4);
    }
    vapour.instanceMatrix.needsUpdate = true;
  }

  // one-way sign pops up
  sign.visible = t >= T.einbahn - 0.2;
  sign.scale.copy(squash(t, T.einbahn - 0.2, 0.6));

  // ------------------------------------------------ HOOK: x-ray + spit rising
  giantFull.visible = t < T.hohl - 0.05;
  giantCut.visible = !giantFull.visible;
  const fill = smooth(ramp(t, T.spucke, T.bringen - 0.3));
  spitCol.visible = fill > 0.01;
  spitCol.geometry.setDrawRange(0, Math.ceil(fill * SPIT_SEG) * 12 * 6);
  tipDrop.visible = t >= T.stroh;
  tipDrop.position
    .copy(chan.getPoint(0))
    .add(V(0, -0.15 - 0.6 * ramp(t, T.stroh + 1.4, T.bringen), 0));
  tipDrop.scale.copy(squash(t, T.stroh, 0.5, 1));

  // ------------------------------------------------ BONE: lion tongue rasps the meat
  {
    const sw = t - T.fakt;
    const x = -3.2 + ((sw * 1.6) % 6.8);
    const lift = Math.max(0, Math.sin((((sw * 1.6) % 6.8) / 6.8) * Math.PI));
    lionTongue.position.set(x, 1.55 + 0.25 * (1 - lift), 0);
    lionTongue.rotation.z = -0.15;
    meat.forEach((m, i) => {
      const mx = -2.2 + i * 0.55;
      const passes = sw <= 0 ? 0 : Math.floor((sw * 1.6) / 6.8) + (x > mx ? 1 : 0);
      const s = Math.max(0.001, 1 - passes * 0.45);
      m.scale.set(1.1 * s, 0.75 * s, s);
    });
  }

  // ------------------------------------------------ overlays (one at a time)
  if (t >= T.rate && t < T.spucke) {
    showPanel(pop(t, T.rate, T.spucke), "IM HAKEN", "???", LED.yellow);
  } else {
    showPanel(0);
  }
  meter("hitze", pop(t, T.dort + 0.2, T.katzen, 0.3), {
    label: "HITZE",
    value: 0.85 - 0.5 * smooth(ramp(t, T.dort + 0.3, T.katzen - 0.3)),
    x: 140,
    y: 560,
    width: 800,
    color: "#ff6a3d",
    text: "kühlt ab",
  });
  labels(t, LABELS);

  applyCamera(t);
  renderFrame();
}
function clampPos(x) {
  return Math.min(1, Math.max(0, x));
}

start(renderAt);
