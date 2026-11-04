// #58 Deo — "Achsel-Landschaft": we are tiny, standing on warm skin.
// Pores are craters, hairs stand like a bamboo forest, sweat beads lie like
// ponds, a white T-shirt sleeve rises like a cotton mountain range on the
// horizon. The front of the world is a cut: a slab of skin whose front face
// shows its layers (epidermis, dermis, fat) — the middle window is x-ray
// glass so the sweat duct of the hero pore can be seen (scene.js).
// Light: early morning (warm, low sun) that can turn to night and back
// (setDaylight, driven by scene.js).
import {
  THREE,
  flat,
  ground,
  onFrame,
  scene,
  V,
  rng,
  noise2,
  facet,
  facetMat,
  patches,
} from "./world.js";
import { SKIES, setSky, finishSet, discGeo, fireflies, F } from "./environments.js";

const SEED = 58;
export const SKIN = 0xe8b496;
export const CUT_Z = 2.2; // front face of the slab
export const XRAY_W = 2.4; // half width of the x-ray window

// ---------------------------------------------------------------- light
const DAY = {
  ...SKIES.morgen,
  top: [0.36, 0.5, 0.86],
  mid: [0.98, 0.7, 0.62],
  hor: [1.0, 0.76, 0.52],
  below: [0.93, 0.74, 0.66],
  sun: [1.0, 0.86, 0.6],
  sunDir: [-0.45, 0.12, -1],
  keyPos: [7, 9, 9],
  key: [0xffe6c8, 2.6],
  clouds: 9,
  birds: false,
  fog: [26, 110],
};
const NIGHT = SKIES.nacht;
setSky(DAY);

// ---------------------------------------------------------------- ground
// main skin plain: flat behind the cut, soft folds further out, rising to
// gentle hills towards the sleeve; everything in front of the cut drops away
const skinMat = flat(SKIN, { roughness: 0.62 });
const relief = (x, z, d) => {
  if (z > 0.2) return -8.5;
  const fold = Math.sin(x * 0.16 + z * 0.05) * 0.35 + Math.sin(z * 0.31 + x * 0.04) * 0.25;
  const near = Math.min(1, Math.max(0, (d - 7) / 10));
  const far = Math.max(0, (d - 30) / 40);
  return fold * near + far * 7 * (0.4 + 0.6 * noise2(x * 0.05, z * 0.05, SEED));
};
{
  const geo = discGeo(80, 1.5, SEED, relief);
  const m = new THREE.Mesh(
    patches(facet(geo, 0.05, SEED), { amt: 0.09, scale: 0.09, seed: SEED, warm: 0.6 }),
    facetMat(skinMat),
  );
  m.receiveShadow = true;
  ground.add(m);
}
// skin creases: thin darker grooves running across the plain
{
  const creaseMat = flat(0xc98c74, { roughness: 0.8 });
  const r = rng(SEED + 4);
  for (let i = 0; i < 14; i++) {
    const z = -3 - i * 2.4 - r() * 1.2;
    const x0 = -40 + r() * 20;
    const pts = [];
    for (let k = 0; k <= 16; k++) {
      const x = x0 + k * 5;
      pts.push(
        V(x, 0.02 + Math.max(0, relief(x, z, Math.hypot(x, z))), z + Math.sin(k * 0.8 + i) * 0.6),
      );
    }
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, 0.07, 4),
      creaseMat,
    );
    tube.scale.y = 0.4;
    tube.receiveShadow = true;
    ground.add(tube);
  }
}

// the cut: the slab's front face with its layers. The middle window (|x| <
// XRAY_W) is built separately in xray materials (exported for scene.js).
export const LAYERS = [
  { name: "Oberhaut", top: 0, bot: -0.55, color: 0xe2a88a },
  { name: "Lederhaut", top: -0.55, bot: -5.2, color: 0xd9786f },
  { name: "Fett", top: -5.2, bot: -8.5, color: 0xf0cf86 },
];
const DEPTH_Z0 = -1.8; // back of the slab blocks
for (const L of LAYERS) {
  const h = L.top - L.bot;
  const mat = flat(L.color, { roughness: 0.75 });
  for (const [x0, x1] of [
    [-70, -XRAY_W],
    [XRAY_W, 70],
  ]) {
    const w = x1 - x0;
    const geo = new THREE.BoxGeometry(
      w,
      h,
      CUT_Z - DEPTH_Z0,
      Math.ceil(w / 1.4),
      Math.ceil(h / 1.2),
      3,
    );
    const m = new THREE.Mesh(
      patches(facet(geo, 0.05, SEED + L.top * 10), { amt: 0.08, scale: 0.2, seed: SEED }),
      facetMat(mat),
    );
    m.position.set((x0 + x1) / 2, (L.top + L.bot) / 2, (CUT_Z + DEPTH_Z0) / 2);
    m.receiveShadow = true;
    m.castShadow = L.top === 0;
    ground.add(m);
  }
}
// top of the slab blocks in skin colour (the cut layer above is pinker)
{
  const geo = new THREE.BoxGeometry(140, 0.06, CUT_Z - DEPTH_Z0, 90, 1, 3);
  const m = new THREE.Mesh(
    patches(facet(geo, 0.05, SEED + 9), { amt: 0.09, scale: 0.09, seed: SEED, warm: 0.6 }),
    facetMat(skinMat),
  );
  m.position.set(0, -0.02, (CUT_Z + DEPTH_Z0) / 2);
  m.receiveShadow = true;
  ground.add(m);
}
// below the cut: white T-shirt cotton (a weave of soft ribs)
{
  const cotton = flat(0xf4f1ea, { roughness: 0.95 });
  const geo = new THREE.PlaneGeometry(160, 90, 80, 45);
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++)
    p.setY(i, Math.sin(p.getX(i) * 3.1) * 0.06 + Math.sin(p.getZ(i) * 0.9) * 0.15);
  const m = new THREE.Mesh(
    patches(facet(geo, 0.04, SEED + 2), { amt: 0.05, scale: 0.1, seed: SEED }),
    facetMat(cotton),
  );
  m.position.set(0, -8.45, 45);
  m.receiveShadow = true;
  ground.add(m);
}

// ---------------------------------------------------------------- pores + sweat beads
const STAGE = (x, z) => Math.abs(x) < 3.2 && z > -3 && z < 3;
export const PORES = [];
{
  const r = rng(SEED + 11);
  while (PORES.length < 70) {
    const x = (r() - 0.5) * 60;
    const z = -1.4 - r() * 30;
    if (
      STAGE(x, z) ||
      Math.hypot(x - 4.2, z + 3.4) < 2.6 ||
      Math.hypot(x + 2.9, z + 2.4) < 1.8 ||
      PORES.some(([px, pz]) => Math.hypot(px - x, pz - z) < 2.2)
    )
      continue;
    PORES.push([x, z, 0.75 + r() * 0.5]);
  }
  // a few pores along the slab top in front, left and right of the window
  for (const x of [-6.5, -4.2, 4.0, 6.8, -9.4, 9.6]) PORES.push([x, 0.9 + (x % 2) * 0.3, 0.9]);
  const ringGeo = facet(new THREE.TorusGeometry(0.34, 0.12, 5, 10), 0.08, 3);
  ringGeo.rotateX(Math.PI / 2);
  const holeGeo = new THREE.CircleGeometry(0.3, 10).rotateX(-Math.PI / 2);
  const rings = new THREE.InstancedMesh(
    ringGeo,
    facetMat(flat(0xd99a80, { roughness: 0.7 })),
    PORES.length,
  );
  const holes = new THREE.InstancedMesh(holeGeo, flat(0x4a2220, { roughness: 1 }), PORES.length);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  PORES.forEach(([x, z, s], i) => {
    const y = Math.max(0, relief(x, z, Math.hypot(x, z)));
    m4.compose(V(x, y + 0.02, z), q, V(s, s * 0.7, s));
    rings.setMatrixAt(i, m4);
    m4.compose(V(x, y + 0.035, z), q, V(s, 1, s));
    holes.setMatrixAt(i, m4);
  });
  rings.receiveShadow = holes.receiveShadow = true;
  ground.add(rings, holes);
}
export const sweatMat = new THREE.MeshStandardMaterial({
  color: 0x8fd0ff,
  roughness: 0.04,
  metalness: 0.1,
  transparent: true,
  opacity: 0.82,
});
{
  // big sweat beads resting on some pores (glossy, they catch the sky)
  const r = rng(SEED + 17);
  const geo = new THREE.SphereGeometry(1, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  PORES.filter((_, i) => i % 5 === 2).forEach(([x, z, s]) => {
    const b = new THREE.Mesh(geo, sweatMat);
    const k = (0.5 + r() * 0.7) * s;
    b.scale.set(k, k * 0.62, k);
    b.position.set(x + 0.2, Math.max(0, relief(x, z, Math.hypot(x, z))), z);
    b.castShadow = true;
    b.userData.noAO = true;
    ground.add(b);
  });
}

// ---------------------------------------------------------------- hairs
// tapered, bent cylinders: a dense forest behind the stage, a few loners
const hairMat = flat(0x3b2619, { roughness: 0.55 });
const hairs = [];
function hair(x, z, h, lean, rot, seed) {
  const geo = new THREE.CylinderGeometry(0.035, 0.11, h, 6, 8);
  geo.translate(0, h / 2, 0);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const k = p.getY(i) / h;
    p.setX(i, p.getX(i) + k * k * lean * h);
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(facet(geo, 0.1, seed), facetMat(hairMat));
  const g = new THREE.Group();
  g.add(m);
  m.castShadow = true;
  g.position.set(x, Math.max(0, relief(x, z, Math.hypot(x, z))) - 0.05, z);
  g.rotation.y = rot;
  // a small root bump
  const root = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.18, 7), facetMat(flat(0xd99a80)));
  root.geometry = facet(root.geometry, 0.08, seed);
  root.position.y = 0.06;
  g.add(root);
  ground.add(g);
  hairs.push({ g, seed });
}
{
  const r = rng(SEED + 23);
  let n = 0;
  while (n < 120) {
    const x = (r() - 0.5) * 70;
    const z = -9 - r() * 26;
    if (Math.abs(x) < 4 && z > -12) continue;
    hair(x, z, 4.5 + r() * 5.5, 0.15 + r() * 0.35, r() * Math.PI * 2, n);
    n++;
  }
  // loners in the middle distance, clear of the stage and the camera paths
  [
    [-7.5, -5.5, 5.2],
    [8.2, -6.2, 6.0],
    [-12.5, -2.5, 4.6],
    [13.5, -3.2, 5.4],
    [-5.2, -8.4, 6.4],
    [17, -9, 6.8],
  ].forEach(([x, z, h], i) => hair(x, z, h, 0.25, 1 + i * 1.3, 200 + i));
}
onFrame((t) => {
  for (const { g, seed } of hairs) {
    g.rotation.z = Math.sin(t * 0.9 + seed * 1.7) * 0.025;
    g.rotation.x = Math.sin(t * 0.7 + seed * 2.3) * 0.02;
  }
});

// ---------------------------------------------------------------- hero piece: the sleeve
// a white cotton mountain range — the T-shirt sleeve — with a hem and a
// row of stitches, rising behind the hair forest
{
  const cotton = flat(0xf6f3ee, { roughness: 0.95 });
  const geo = new THREE.CylinderGeometry(15, 15, 150, 36, 30, true, -Math.PI / 2, Math.PI);
  geo.rotateZ(Math.PI / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    // soft folds in the fabric
    const x = p.getX(i);
    p.setY(i, p.getY(i) + Math.sin(x * 0.12) * 1.2 + Math.sin(x * 0.37) * 0.4);
  }
  geo.computeVertexNormals();
  const sleeve = F(geo, cotton, 0.04, 5);
  sleeve.position.set(0, -4, -48);
  sleeve.receiveShadow = true;
  ground.add(sleeve);
  // the hem: a thicker roll along the front
  const hemGeo = new THREE.CylinderGeometry(2.2, 2.2, 150, 12, 30);
  hemGeo.rotateZ(Math.PI / 2);
  const hem = F(hemGeo, cotton, 0.05, 6);
  hem.position.set(0, -0.6, -33.5);
  ground.add(hem);
  // stitches along the hem
  const st = new THREE.InstancedMesh(new THREE.BoxGeometry(0.9, 0.18, 0.18), flat(0x9fb3d8), 70);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0));
  for (let i = 0; i < 70; i++) {
    m4.compose(V(-70 + i * 2, 1.1, -31.5), q, V(1, 1, 1));
    st.setMatrixAt(i, m4);
  }
  ground.add(st);
}

// ---------------------------------------------------------------- life
// deo mist drifting over the plain (tiny white motes)
fireflies(40, { area: [-14, 14, 0.3, 3.5, -12, 1], color: 0xffffff, seed: SEED, size: 0.04 });

// moon for the night beat (hidden by day)
export const moon = new THREE.Mesh(
  new THREE.IcosahedronGeometry(5, 1),
  new THREE.MeshBasicMaterial({ color: 0xfff6d8, fog: false }),
);
moon.position.set(-38, 34, -120);
moon.visible = false;
scene.add(moon);

finishSet({ ground: SKIN });

// ---------------------------------------------------------------- day ↔ night
// k = 1 day (morning), 0 night. Lerps the sky dome, fog and the lights.
let skyMesh = null;
const lights = {};
scene.traverse((o) => {
  if (o.isMesh && o.material?.uniforms?.hor) skyMesh = o;
  if (o.isDirectionalLight && o.castShadow) lights.key = o;
  else if (o.isDirectionalLight) lights.rim = o;
  if (o.isHemisphereLight) lights.hemi = o;
});
const c3 = (a) => new THREE.Vector3(...a);
const SK = {
  d: {
    top: c3(DAY.top),
    mid: c3(DAY.mid),
    hor: c3(DAY.hor),
    below: c3(DAY.below),
    sun: c3(DAY.sun),
  },
  n: {
    top: c3(NIGHT.top),
    mid: c3(NIGHT.mid),
    hor: c3(NIGHT.hor),
    below: c3(NIGHT.below),
    sun: c3([0.1, 0.12, 0.2]),
  },
};
const base = {
  key: lights.key?.intensity ?? 2.5,
  keyCol: lights.key?.color.clone(),
  hemi: lights.hemi?.intensity ?? 1.4,
  env: scene.environmentIntensity,
};
const nightKey = new THREE.Color(0x9fb4ff);
const fogDay = scene.fog.color.clone();
const fogNight = new THREE.Color().setRGB(...NIGHT.below, THREE.SRGBColorSpace);
export function setDaylight(k) {
  if (skyMesh) {
    const u = skyMesh.material.uniforms;
    u.top.value.lerpVectors(SK.n.top, SK.d.top, k);
    u.mid.value.lerpVectors(SK.n.mid, SK.d.mid, k);
    u.hor.value.lerpVectors(SK.n.hor, SK.d.hor, k);
    u.below.value.lerpVectors(SK.n.below, SK.d.below, k);
    u.sunCol.value.lerpVectors(SK.n.sun, SK.d.sun, k);
    u.stars.value = 1.2 * (1 - k);
  }
  if (lights.key) {
    lights.key.intensity = base.key * (0.45 + 0.55 * k);
    lights.key.color.copy(nightKey).lerp(base.keyCol, k);
  }
  if (lights.hemi) lights.hemi.intensity = base.hemi * (0.5 + 0.5 * k);
  scene.environmentIntensity = base.env * (0.45 + 0.55 * k);
  scene.fog.color.copy(fogNight).lerp(fogDay, k);
  moon.visible = k < 0.98;
  moon.material.color.setScalar(1 - k);
}
