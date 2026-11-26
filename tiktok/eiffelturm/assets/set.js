// #98 Eiffelturm — Paris on a hot July midday. The tower (built in
// scene.js) stands at the origin; the Champ de Mars lawns run toward the
// camera (+z) between rows of plane trees and cream Haussmann blocks with
// blue-grey mansard roofs; behind the tower the Seine with a sightseeing
// boat and the Pont d'Iéna, across the river the Trocadéro gardens with
// their fountains and the curved wings of the Palais de Chaillot. Far
// layer: a sea of Paris roofs, the dark Tour Montparnasse, haze.
// Scale: 1 unit ≈ 27.5 m (the tower is 12 units with its antenna).
import { THREE, flat, ground, onFrame, real, rng, scene, facet, facetMat } from "./world.js";
import { SKIES, setSky, finishSet, terrain, pathStrip, F, add, tree } from "./environments.js";

const SEED = 98;
const R = rng(SEED);

// ---------------------------------------------------------------- light
export const SUN = [0.62, 0.6, 0.5]; // high summer sun, from the front right
setSky({
  ...SKIES.mittag,
  top: [0.16, 0.42, 0.86],
  mid: [0.48, 0.7, 0.95],
  hor: [0.93, 0.9, 0.84],
  below: [0.9, 0.88, 0.84],
  sun: [1.0, 0.95, 0.82],
  sunDir: SUN,
  keyPos: SUN.map((v) => v * 34),
  key: [0xfff1dc, 3.1],
  hemi: [0xeaf2ff, 0x8a8470, 1.3],
  fog: [40, 150],
  clouds: 10,
  birds: true,
});
// the tower is tall: a bigger shadow frustum for the sun
scene.traverse((o) => {
  if (o.isDirectionalLight && o.castShadow) {
    Object.assign(o.shadow.camera, {
      left: -17,
      right: 17,
      top: 17,
      bottom: -17,
      near: 2,
      far: 90,
    });
    o.shadow.camera.updateProjectionMatrix();
  }
});

// ---------------------------------------------------------------- ground
const RIVER_Z = -8.6; // centre line of the Seine
const RIVER_W = 2.1; // half width
const GRAVEL = 0xd9c8a2;
const STREET = 0xa9a49a;
terrain(STREET, {
  seed: SEED,
  amt: 0.08,
  warm: 0.35,
  step: 1.6,
  r: 80,
  height: (x, z, d) => {
    const dz = Math.abs(z - RIVER_Z);
    if (dz < RIVER_W + 0.15) return -0.7; // the river bed
    // Trocadéro hill rises behind the river
    let h = z < RIVER_Z - 4 ? Math.min(1.6, (RIVER_Z - 4 - z) * 0.11) : 0;
    if (d > 58) h += (d - 58) * 0.12;
    return h;
  },
});

// lawns of the Champ de Mars (and the small gardens around the tower foot)
const lawnMat = facetMat(flat(0x79a845));
const gravelMat = facetMat(flat(GRAVEL));
function lawn(x0, x1, z0, z1, seed, mat = lawnMat, y = 0.015) {
  const g = new THREE.PlaneGeometry(
    x1 - x0,
    z1 - z0,
    Math.ceil((x1 - x0) / 0.7),
    Math.ceil((z1 - z0) / 0.7),
  );
  g.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(facet(g.toNonIndexed(), 0.07, seed), mat);
  m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
  m.receiveShadow = true;
  ground.add(m);
}
// beige gravel of the Champ de Mars + the tower plaza
lawn(-7.2, 7.2, -5.2, 42, 9, gravelMat, 0.008);
lawn(-4.4, -0.9, 5.0, 40, 1);
lawn(0.9, 4.4, 5.0, 40, 2);
lawn(-6.5, -3.0, -4.6, 3.6, 3);
lawn(3.0, 6.5, -4.6, 3.6, 4);
// flower borders along the lawns
const flowerMat = flat(0xe8506a, { emissive: 0x30060c });
for (const sx of [-1, 1])
  for (let z = 5.4; z < 39; z += 0.8) {
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), flowerMat);
    f.scale.y = 0.5;
    add(f, sx * (0.85 + R() * 0.08), 0.03, z, false);
  }

// ---------------------------------------------------------------- Seine
const waterMat = new THREE.MeshPhysicalMaterial({
  color: 0x3d6f73,
  roughness: 0.12,
  metalness: 0.15,
  clearcoat: 0.6,
  flatShading: true,
});
const waterGeo = new THREE.PlaneGeometry(170, RIVER_W * 2 + 0.3, 170, 6);
waterGeo.rotateX(-Math.PI / 2);
const water = new THREE.Mesh(waterGeo, waterMat);
water.position.set(0, -0.32, RIVER_Z);
water.receiveShadow = true;
ground.add(water);
const wBase = waterGeo.attributes.position.array.slice();
onFrame((t) => {
  const p = waterGeo.attributes.position.array;
  for (let i = 0; i < p.length; i += 3) {
    const x = wBase[i];
    const z = wBase[i + 2];
    p[i + 1] = Math.sin(x * 1.3 + t * 1.6) * 0.025 + Math.sin(z * 3.1 - t * 2.1 + x * 0.4) * 0.018;
  }
  waterGeo.attributes.position.needsUpdate = true;
  waterGeo.computeVertexNormals();
});
// stone quay walls + a strip of road on both banks
const quayMat = real.ceramic(0xcdbf9f, { roughness: 0.85, clearcoat: 0 });
const roadMat = facetMat(flat(0x6d6a66));
for (const s of [-1, 1]) {
  const wall = new THREE.Mesh(new THREE.BoxGeometry(170, 0.75, 0.3), quayMat);
  add(wall, 0, -0.3, RIVER_Z + s * (RIVER_W + 0.15), false);
  const road = new THREE.Mesh(
    facet(
      new THREE.PlaneGeometry(170, 1.1, 120, 2).rotateX(-Math.PI / 2).toNonIndexed(),
      0.05,
      7 + s,
    ),
    roadMat,
  );
  add(road, 0, s > 0 ? 0.02 : 0.02 + 0.0, RIVER_Z + s * (RIVER_W + 0.95), false);
  road.receiveShadow = true;
}
// Pont d'Iéna: stone deck on five arches, straight ahead of the tower
{
  const stone = real.ceramic(0xd8cbb0, { roughness: 0.8, clearcoat: 0 });
  const deck = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.14, RIVER_W * 2 + 1.2), stone);
  add(deck, 0, 0.05, RIVER_Z);
  for (let i = 0; i < 4; i++) {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.55, 0.22), stone);
    add(pier, 0, -0.25, RIVER_Z - RIVER_W + 0.85 + i * ((RIVER_W * 2 - 1.7) / 3));
  }
  // parapets + the eagle statues' plinths at the ends
  for (const sx of [-0.66, 0.66]) {
    const par = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, RIVER_W * 2 + 1.2), stone);
    add(par, sx, 0.16, RIVER_Z);
    for (const sz of [-1, 1]) {
      const pl = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.3, 0.16), stone);
      add(pl, sx, 0.25, RIVER_Z + sz * (RIVER_W + 0.55));
    }
  }
}
// the sightseeing boat gliding along the river (and a barge the other way)
function boat(len, hullCol, topCol) {
  const g = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.BoxGeometry(len, 0.12, 0.42), real.plastic(hullCol));
  hull.position.y = 0.06;
  g.add(hull);
  const bow = new THREE.Mesh(new THREE.ConeGeometry(0.21, 0.4, 4, 1), real.plastic(hullCol));
  bow.rotation.set(0, Math.PI / 4, -Math.PI / 2);
  bow.scale.set(1, 1, 0.42 / 0.3);
  bow.position.set(len / 2 + 0.17, 0.06, 0);
  g.add(bow);
  if (topCol) {
    const cab = new THREE.Mesh(
      new THREE.BoxGeometry(len * 0.8, 0.1, 0.36),
      real.glass(0xbfe3f0, { opacity: 0.55 }),
    );
    cab.position.y = 0.17;
    g.add(cab);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(len * 0.8, 0.02, 0.38), real.plastic(topCol));
    roof.position.y = 0.23;
    g.add(roof);
  } else {
    const load = new THREE.Mesh(new THREE.BoxGeometry(len * 0.6, 0.08, 0.32), flat(0x8a6a42));
    load.position.y = 0.15;
    g.add(load);
  }
  g.traverse((o) => (o.castShadow = true));
  ground.add(g);
  return g;
}
const bateau = boat(1.4, 0xf4f4f0, 0x2b4a7a);
const barge = boat(1.9, 0x2d3a46, null);
onFrame((t) => {
  bateau.position.set(-22 + ((t * 0.45 + 18) % 44), -0.3, RIVER_Z + 0.8);
  barge.position.set(22 - ((t * 0.3 + 9) % 44), -0.3, RIVER_Z - 1.0);
  barge.rotation.y = Math.PI;
});

// ---------------------------------------------------------------- Trocadéro
{
  const stone = facetMat(flat(0xe6dcc4));
  // the two curved wings of the Palais de Chaillot
  const zC = -27;
  for (const s of [-1, 1]) {
    for (let k = 0; k < 9; k++) {
      const a = s * (0.25 + k * 0.1);
      const r = 9.5;
      const x = Math.sin(a) * r;
      const z = zC + 3.4 - Math.cos(a) * r * 0.45;
      const b = F(new THREE.BoxGeometry(1.2, 1.0, 0.8), stone, 0.04, k + (s > 0 ? 20 : 0));
      b.rotation.y = -a * 0.9;
      add(b, x + s * 2.2, 1.45, z);
    }
    // the end pavilions
    const pav = F(new THREE.BoxGeometry(1.6, 1.35, 1.2), stone, 0.04, 40 + s);
    add(pav, s * 2.3, 1.6, zC + 2.6);
  }
  // terraces + the long fountain basin down the slope
  const basin = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 5.2), waterMat);
  add(basin, 0, 0.62, -16.6, false);
  const rim = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 5.4), stone);
  add(rim, 0, 0.56, -16.6, false);
  // fountain jets (animated)
  const jetMat = new THREE.MeshStandardMaterial({
    color: 0xf2fbff,
    emissive: 0x4a6a7a,
    transparent: true,
    opacity: 0.8,
    roughness: 0.2,
  });
  const jets = [];
  for (let i = 0; i < 10; i++) {
    const j = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.05, 1, 6), jetMat);
    j.position.set(i % 2 ? 0.55 : -0.55, 0.65, -14.6 - Math.floor(i / 2) * 1.0);
    ground.add(j);
    jets.push(j);
  }
  const canon = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.12, 1, 8), jetMat);
  canon.position.set(0, 0.65, -14.0);
  canon.rotation.x = -0.35;
  ground.add(canon);
  onFrame((t) => {
    jets.forEach((j, i) => {
      const h = 0.5 + 0.12 * Math.sin(t * 3 + i);
      j.scale.y = h;
      j.position.y = 0.65 + h / 2;
    });
    canon.scale.y = 1.4 + 0.1 * Math.sin(t * 4);
    canon.position.y = 0.65 + 0.6;
  });
  // garden trees on the slope
  for (let i = 0; i < 26; i++) {
    const s = i % 2 ? 1 : -1;
    const x = s * (2.4 + R() * 6.5);
    const z = -12.5 - R() * 10;
    tree(x, z, 0.26 + R() * 0.08, 200 + i).position.y = Math.min(1.6, (RIVER_Z - 4 - z) * 0.11);
  }
}

// ---------------------------------------------------------------- plane trees along the Champ de Mars
let ti = 0;
for (const x of [-5.2, -6.1, 5.2, 6.1])
  for (let z = 4.6; z < 39; z += 1.25)
    tree(x + (R() - 0.5) * 0.15, z, 0.27 + R() * 0.05, 300 + ti++);
// clipped trees along the quay
for (let x = -30; x < 30; x += 1.3) {
  if (Math.abs(x) < 1.4) continue;
  tree(x, RIVER_Z + RIVER_W + 2.0, 0.25 + R() * 0.05, 500 + ti++);
}

// ---------------------------------------------------------------- Haussmann blocks
// cream stone walls with rows of tall windows, blue-grey zinc mansard roofs
function facadeTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const g = c.getContext("2d");
  g.fillStyle = "#e9dfc9";
  g.fillRect(0, 0, 256, 128);
  for (let row = 0; row < 5; row++) {
    const y = 14 + row * 22;
    g.fillStyle = "rgba(120,100,80,0.35)";
    g.fillRect(0, y + 17, 256, 2); // cornice / balcony line
    for (let col = 0; col < 12; col++) {
      const x = 6 + col * 21;
      g.fillStyle = row === 0 ? "#6e7c86" : "#4a5862";
      g.fillRect(x, y, 10, 14);
      g.fillStyle = "rgba(255,255,255,0.25)";
      g.fillRect(x, y, 10, 3);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}
const facadeTex = facadeTexture();
const wallMat = new THREE.MeshStandardMaterial({ map: facadeTex, roughness: 0.85 });
const roofMat = facetMat(flat(0x6f7f8c));
const roofGeo = (() => {
  // mansard: a box with steeply sloped sides (truncated pyramid)
  const g = new THREE.CylinderGeometry(Math.SQRT1_2 * 0.72, Math.SQRT1_2, 1, 4, 1);
  g.rotateY(Math.PI / 4);
  g.translate(0, 0.5, 0);
  return facet(g.toNonIndexed(), 0.06, 3);
})();
const wallGeo = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
const blocks = [];
function block(x, z, w, d, h, rot = 0) {
  blocks.push({ x, z, w, d, h, rot });
}
// lining the Champ de Mars
for (const s of [-1, 1])
  for (let z = 6; z < 40; z += 2.4) block(s * (8.2 + R() * 0.4), z, 1.6, 2.2, 0.7 + R() * 0.15);
for (const s of [-1, 1])
  for (let z = 5; z < 40; z += 2.6)
    block(s * (10.6 + R() * 0.5), z + 0.6, 1.8, 2.3, 0.65 + R() * 0.2);
// the city all around: a dense grid of blocks with streets and boulevards
// (not on the lawns, the river or the Trocadéro)
for (let gx = -70, ix = 0; gx < 70; gx += 2.3, ix++)
  for (let gz = -70, iz = 0; gz < 70; gz += 2.3, iz++) {
    const x = gx + (R() - 0.5) * 0.2;
    const z = gz + (R() - 0.5) * 0.2;
    const r = Math.hypot(x, z);
    if (r < 12.5 || r > 72) continue;
    if (ix % 6 === 0 || iz % 7 === 0) continue; // boulevards
    if (Math.abs(z - RIVER_Z) < RIVER_W + 3.0) continue; // river + quays
    if (z < RIVER_Z - 3 && z > -32 && Math.abs(x) < 13) continue; // Trocadéro
    if (z > 3 && z < 45 && Math.abs(x) < 11.8) continue; // Champ de Mars + its blocks
    if (R() < 0.06) continue; // a little square
    block(x, z, 1.75 + R() * 0.3, 1.75 + R() * 0.3, 0.6 + R() * 0.28, 0);
  }
{
  const walls = new THREE.InstancedMesh(wallGeo, wallMat, blocks.length);
  const roofs = new THREE.InstancedMesh(roofGeo, roofMat, blocks.length);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  blocks.forEach((b, i) => {
    const y0 = b.x * b.x + b.z * b.z > 3600 ? (Math.sqrt(b.x * b.x + b.z * b.z) - 58) * 0.12 : 0;
    q.setFromEuler(e.set(0, b.rot, 0));
    m.compose(new THREE.Vector3(b.x, y0, b.z), q, new THREE.Vector3(b.w, b.h, b.d));
    walls.setMatrixAt(i, m);
    m.compose(new THREE.Vector3(b.x, y0 + b.h, b.z), q, new THREE.Vector3(b.w, 0.28, b.d));
    roofs.setMatrixAt(i, m);
  });
  for (const im of [walls, roofs]) {
    im.castShadow = true;
    im.receiveShadow = true;
    ground.add(im);
  }
}
// École Militaire closing the Champ de Mars, with its dome
{
  const stone = facetMat(flat(0xe4d9bf));
  add(F(new THREE.BoxGeometry(9, 0.75, 1.4), stone, 0.03, 61), 0, 0.375, 43.5);
  add(F(new THREE.BoxGeometry(2.0, 1.1, 1.6), stone, 0.03, 62), 0, 0.55, 43.0);
  add(
    F(
      new THREE.SphereGeometry(0.7, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2),
      roofMat.clone(),
      0.04,
      63,
    ),
    0,
    1.1,
    43.0,
  );
}
// Tour Montparnasse: the dark tower on the horizon
add(F(new THREE.BoxGeometry(1.6, 7.6, 1.0), flat(0x2e3238), 0.03, 64), 15, 3.8, 58);
// Les Invalides golden dome
{
  const gold = real.metal(0xd8b25a, { roughness: 0.3 });
  const drum = F(new THREE.CylinderGeometry(0.8, 0.8, 1.0, 16), flat(0xe6dcc4), 0.03, 65);
  add(drum, 17, 1.2, 24);
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.85, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    gold,
  );
  dome.scale.y = 1.25;
  add(dome, 17, 1.7, 24);
  const spire = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.9, 12), gold);
  add(spire, 17, 3.2, 24);
}

finishSet({ ground: STREET });

void pathStrip;
