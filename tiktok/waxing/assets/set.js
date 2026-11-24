// #95 Waxing — two worlds:
//  STUDIO  a bright waxing studio on a winter morning: sage-green walls, a
//          tall arched window with sheer curtains (hero piece) and snowy
//          trees outside, terrazzo floor, the treatment bed with a paper
//          roll, the wax heater with bubbling honey wax, a magnifier lamp,
//          a trolley with towels, a monstera, a round mirror with an LED
//          ring. Life: curtains sway, steam from the wax, dust in the sun.
//          Scale: 2 units = 1 m, bed top at y = 1.6, the shin at the origin.
//  SKIN    (x = 200) a giant-scale cut-away of the skin: hairs as stalks,
//          roots as bulbs, a nerve running to the spinal cord (the "Tor").
//          Built in scene.js; set.js only gives it a dark backdrop.
import { THREE, flat, real, roundedBox, scene, ground, onFrame, rng, V } from "./world.js";
import { SKIES, setSky, finishSet, terrain, tree, fireflies } from "./environments.js";

// ---------------------------------------------------------------- light
setSky({
  ...SKIES.morgen,
  top: [0.5, 0.68, 0.92],
  mid: [0.78, 0.86, 0.96],
  hor: [1.0, 0.93, 0.84],
  below: [0.9, 0.9, 0.9],
  sun: [1.0, 0.92, 0.78],
  sunDir: [-0.35, 0.45, -0.85],
  key: [0xfff0dc, 3.0],
  keyPos: [-6, 11, -14],
  hemi: [0xf4f0ff, 0x9a8f80, 1.25],
  noClouds: true,
  birds: false,
  fog: [90, 300],
});
for (const o of scene.children) {
  if (o.isDirectionalLight && o.castShadow) {
    Object.assign(o.shadow.camera, {
      left: -14,
      right: 14,
      top: 14,
      bottom: -14,
      near: 1,
      far: 60,
    });
    o.shadow.camera.updateProjectionMatrix();
  }
}
// warm practical fill from the magnifier lamp + soft front fill
const lampLight = new THREE.PointLight(0xfff1dd, 9, 9, 1.6);
lampLight.position.set(1.6, 4.2, 1.4);
scene.add(lampLight);

// ---------------------------------------------------------------- materials
const wallM = flat(0x9fb59f);
const wallLow = flat(0x86a088);
const trimM = real.plastic(0xf6f2ea, { roughness: 0.5 });
const floorM = real.ceramic(0xe9e2d6, { roughness: 0.35 });
const chipA = flat(0xb9a58c);
const chipB = flat(0x7f8f80);
const chipC = flat(0xd9b8a0);
const bedPad = real.fabric(0xf1e6dc);
const bedFrame = real.metal(0xd7d9dc, { roughness: 0.3 });
const paperM = real.plastic(0xfbfaf6, { roughness: 0.95, clearcoat: 0 });
const potM = real.metal(0xc9ced6, { roughness: 0.25 });
const potBody = real.gloss(0xf3efe9);
export const waxM = real.gloss(0xe8a233, {
  roughness: 0.15,
  emissive: new THREE.Color(0x6a3500),
  emissiveIntensity: 0.25,
});
const towelA = real.fabric(0xf5efe6);
const towelB = real.fabric(0xd9a99a);
const potPlant = real.ceramic(0xe2d6c4);
const leafM = real.plastic(0x2f7a45, { roughness: 0.55 });
const glassM = new THREE.MeshPhysicalMaterial({
  color: 0xdfefff,
  roughness: 0.05,
  transparent: true,
  opacity: 0.12,
});
const curtainM = new THREE.MeshStandardMaterial({
  color: 0xfffaf2,
  roughness: 0.9,
  transparent: true,
  opacity: 0.55,
  side: THREE.DoubleSide,
});

const studio = new THREE.Group();
ground.add(studio);
export { studio };
const box = (w, h, d, mat, x, y, z, parent = studio, r = 0) => {
  const g = r > 0 ? roundedBox(w, h, d, r) : new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(g, mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  parent.add(m);
  return m;
};
const cyl = (rt, rb, h, mat, x, y, z, parent = studio, seg = 48) => {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  parent.add(m);
  return m;
};

// ---------------------------------------------------------------- room shell
// floor: terrazzo (light base + instanced chips)
box(30, 0.2, 24, floorM, 0, -0.1, 0);
{
  const r = rng(95);
  const geo = new THREE.CircleGeometry(0.05, 6);
  geo.rotateX(-Math.PI / 2);
  for (const [mat, n] of [
    [chipA, 900],
    [chipB, 600],
    [chipC, 700],
  ]) {
    const im = new THREE.InstancedMesh(geo, mat, n);
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      o.position.set((r() - 0.5) * 28, 0.004, (r() - 0.5) * 22);
      o.rotation.y = r() * 6;
      const s = 0.4 + r() * 1.3;
      o.scale.set(s, 1, s * (0.6 + r() * 0.6));
      o.updateMatrix();
      im.setMatrixAt(i, o.matrix);
    }
    im.receiveShadow = true;
    studio.add(im);
  }
}
// back wall (z = -7) with an arched window opening, left wall (x = -9)
const WALL_Z = -7;
{
  const shape = new THREE.Shape();
  shape.moveTo(-15, 0);
  shape.lineTo(15, 0);
  shape.lineTo(15, 12);
  shape.lineTo(-15, 12);
  shape.lineTo(-15, 0);
  const hole = new THREE.Path();
  // arched window, x -4.5..1.5, sill 2.0, arch top 9.6
  hole.moveTo(-4.5, 2.0);
  hole.lineTo(1.5, 2.0);
  hole.lineTo(1.5, 6.6);
  hole.absarc(-1.5, 6.6, 3, 0, Math.PI, false);
  hole.lineTo(-4.5, 2.0);
  shape.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: 0.5,
    bevelEnabled: false,
    curveSegments: 48,
  });
  const w = new THREE.Mesh(g, wallM);
  w.position.set(0, 0, WALL_Z - 0.5);
  w.receiveShadow = w.castShadow = true;
  studio.add(w);
  // window frame (arched ring + mullions)
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3, 0.09, 12, 64, Math.PI), trimM);
  ring.position.set(-1.5, 6.6, WALL_Z - 0.25);
  studio.add(ring);
  box(0.12, 4.6, 0.14, trimM, -4.5, 4.3, WALL_Z - 0.25);
  box(0.12, 4.6, 0.14, trimM, 1.5, 4.3, WALL_Z - 0.25);
  box(0.1, 7.6, 0.12, trimM, -1.5, 5.8, WALL_Z - 0.25);
  box(6, 0.1, 0.12, trimM, -1.5, 5.2, WALL_Z - 0.25);
  box(6.6, 0.18, 0.7, trimM, -1.5, 1.95, WALL_Z + 0.1, studio, 0.06); // sill
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(6, 7.6), glassM);
  pane.position.set(-1.5, 5.8, WALL_Z - 0.28);
  studio.add(pane);
}
box(0.5, 12, 24, wallM, -9.25, 6, 0);
// wainscot + skirting
box(30, 2.0, 0.08, wallLow, 0, 1.0, WALL_Z + 0.04);
box(30, 0.08, 0.14, trimM, 0, 2.02, WALL_Z + 0.07);
box(0.08, 2.0, 24, wallLow, -8.96, 1.0, 0);
box(0.14, 0.08, 24, trimM, -8.93, 2.02, 0);

// ---------------------------------------------------------------- curtains (life)
const curtains = [];
for (const [x, side] of [
  [-5.3, -1],
  [2.3, 1],
]) {
  const geo = new THREE.PlaneGeometry(1.6, 9.2, 16, 24);
  const base = geo.attributes.position.array.slice();
  const m = new THREE.Mesh(geo, curtainM);
  m.position.set(x, 5.0, WALL_Z + 0.45);
  studio.add(m);
  curtains.push({ geo, base, seed: side });
}
box(9.6, 0.07, 0.07, real.metal(0xb8a27a), -1.5, 9.75, WALL_Z + 0.45);
onFrame((t) => {
  for (const c of curtains) {
    const p = c.geo.attributes.position.array;
    for (let i = 0; i < p.length; i += 3) {
      const x = c.base[i];
      const y = c.base[i + 1];
      const hang = (4.6 - y) / 9.2; // 0 at top → 1 at bottom
      p[i + 2] =
        Math.sin(x * 4.2 + c.seed) * 0.12 + Math.sin(t * 1.3 + y * 0.8 + c.seed * 2) * 0.12 * hang;
    }
    c.geo.attributes.position.needsUpdate = true;
    c.geo.computeVertexNormals();
  }
});

// ---------------------------------------------------------------- outside (far layer)
{
  const out = new THREE.Group();
  ground.add(out);
  const snow = terrain(0xeef2f7, { r: 60, step: 3.5, seed: 95, flatR: 0, amt: 0.05 });
  snow.position.set(0, -1.2, -40);
  out.add(snow);
  const r = rng(7);
  for (let i = 0; i < 16; i++) {
    const x = -22 + i * 3 + (r() - 0.5) * 2;
    const z = -16 - r() * 18;
    tree(x, z, 1.1 + r() * 0.9, i + 3);
  }
  // a row of town houses far behind the trees
  const houseCols = [0xe8d3b0, 0xd9a58a, 0xc9d3d9, 0xf0e6cf, 0xb9c7b0];
  for (let i = 0; i < 9; i++) {
    const h = 6 + r() * 5;
    const m = new THREE.Mesh(new THREE.BoxGeometry(4.6, h, 4), flat(houseCols[i % 5]));
    m.position.set(-22 + i * 5.2, h / 2 - 1, -42);
    out.add(m);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.4, 2.4, 4), flat(0x8a5a4a));
    roof.rotation.y = Math.PI / 4;
    roof.position.set(-22 + i * 5.2, h - 1 + 1.2, -42);
    out.add(roof);
  }
}

// ---------------------------------------------------------------- treatment bed
// bed along x, top at y = 1.6, centred so the shin rests at the origin
const BED_X = -1.2;
box(6.4, 0.34, 1.9, bedPad, BED_X, 1.43, 0, studio, 0.14);
box(6.0, 0.12, 1.6, bedFrame, BED_X, 1.2, 0, studio, 0.04);
for (const x of [BED_X - 2.6, BED_X + 2.6])
  for (const z of [-0.65, 0.65]) cyl(0.07, 0.07, 1.15, bedFrame, x, 0.58, z, studio, 24);
box(5.2, 0.06, 1.4, bedFrame, BED_X, 0.35, 0, studio, 0.02); // lower shelf
// paper roll across the bed + the roll itself at the foot end
box(6.2, 0.012, 1.25, paperM, BED_X, 1.606, 0);
{
  const roll = cyl(0.22, 0.22, 1.3, paperM, BED_X + 3.45, 1.45, 0);
  roll.rotation.x = Math.PI / 2;
  const core = cyl(0.07, 0.07, 1.34, real.plastic(0xc8a477), BED_X + 3.45, 1.45, 0);
  core.rotation.x = Math.PI / 2;
}
// folded towels on the shelf
box(1.0, 0.16, 0.9, towelA, BED_X - 1.4, 0.47, 0, studio, 0.07);
box(1.0, 0.16, 0.9, towelB, BED_X - 1.4, 0.63, 0, studio, 0.07);
box(1.0, 0.16, 0.9, towelA, BED_X + 0.2, 0.47, 0, studio, 0.07);

// ---------------------------------------------------------------- trolley + wax heater
export const POT = V(2.6, 0, -1.6); // wax heater on the trolley (top y ≈ 2.4)
{
  const g = new THREE.Group();
  g.position.copy(POT);
  studio.add(g);
  box(1.6, 0.08, 1.2, trimM, 0, 1.6, 0, g, 0.03);
  box(1.6, 0.08, 1.2, trimM, 0, 0.6, 0, g, 0.03);
  for (const x of [-0.72, 0.72])
    for (const z of [-0.52, 0.52]) cyl(0.04, 0.04, 1.6, bedFrame, x, 0.8, z, g, 16);
  // heater: white body, steel rim, amber wax
  cyl(0.42, 0.46, 0.5, potBody, -0.25, 1.89, 0, g, 64);
  cyl(0.44, 0.44, 0.06, potM, -0.25, 2.16, 0, g, 64);
  cyl(0.36, 0.36, 0.04, waxM, -0.25, 2.1, 0, g, 64);
  // dial + power LED
  const dial = cyl(0.07, 0.07, 0.05, real.plastic(0x2a2a2e), -0.25, 1.82, 0.46, g, 24);
  dial.rotation.x = Math.PI / 2;
  const led = new THREE.Mesh(
    new THREE.SphereGeometry(0.025, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0xff5a3a }),
  );
  led.position.set(-0.05, 1.95, 0.45);
  g.add(led);
  // wooden spatulas in a cup
  cyl(0.12, 0.1, 0.32, real.ceramic(0xe6d8c8), 0.45, 1.8, 0.15, g, 32);
  for (let i = 0; i < 4; i++) {
    const s = box(
      0.08,
      0.7,
      0.015,
      real.wood(0xd9b98a),
      0.45 + (i - 1.5) * 0.04,
      2.05,
      0.15,
      g,
      0.007,
    );
    s.rotation.z = (i - 1.5) * 0.12;
  }
  // a stack of white strips + a small bottle
  box(0.6, 0.05, 0.25, paperM, 0.35, 1.67, -0.35, g, 0.01);
  cyl(0.08, 0.08, 0.36, real.gloss(0xb6d7cf), -0.55, 1.82, -0.35, g, 32);
  // towels below
  box(1.2, 0.18, 0.9, towelB, 0, 0.73, 0, g, 0.07);
  // steam (life)
  const steamM = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.25,
    depthWrite: false,
  });
  const puffs = [];
  for (let i = 0; i < 7; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 10), steamM.clone());
    g.add(m);
    puffs.push(m);
  }
  onFrame((t) => {
    puffs.forEach((m, i) => {
      const k = (t * 0.35 + i / puffs.length) % 1;
      m.position.set(
        -0.25 + Math.sin(i * 2.1 + t) * 0.1 * k,
        2.2 + k * 1.3,
        Math.cos(i * 1.7) * 0.08,
      );
      m.scale.setScalar(0.6 + k * 2.2);
      m.material.opacity = 0.22 * Math.sin(Math.PI * k);
    });
  });
}
// magnifier lamp on a stand behind the bed
{
  const g = new THREE.Group();
  g.position.set(1.4, 0, -1.6);
  studio.add(g);
  cyl(0.45, 0.5, 0.08, real.metal(0xe8e8e8), 0, 0.04, 0, g);
  cyl(0.04, 0.04, 3.6, real.metal(0xe8e8e8), 0, 1.8, 0, g, 16);
  const arm = box(0.07, 0.07, 1.6, real.metal(0xe8e8e8), 0, 3.6, 0.75, g);
  arm.rotation.x = -0.25;
  const head = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.08, 16, 48), trimM);
  head.position.set(0, 3.85, 1.55);
  head.rotation.x = -1.2;
  g.add(head);
  const lens = new THREE.Mesh(
    new THREE.CircleGeometry(0.4, 48),
    new THREE.MeshBasicMaterial({ color: 0xfff6e8, transparent: true, opacity: 0.7 }),
  );
  lens.position.set(0, 3.84, 1.55);
  lens.rotation.x = -1.2 - Math.PI;
  g.add(lens);
}

// ---------------------------------------------------------------- right side: mirror, shelf, plant
{
  // round mirror with an LED ring on the back wall, right of the window
  const ringM = new THREE.MeshBasicMaterial({ color: 0xfff3e0 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.06, 12, 64), ringM);
  ring.position.set(6.2, 5.6, WALL_Z + 0.08);
  studio.add(ring);
  const mir = new THREE.Mesh(
    new THREE.CircleGeometry(1.2, 64),
    real.metal(0xdfe6ea, { roughness: 0.05 }),
  );
  mir.position.set(6.2, 5.6, WALL_Z + 0.06);
  studio.add(mir);
  // floating shelf with bottles and jars
  box(3.2, 0.1, 0.6, real.wood(0xc9a477), 6.2, 3.2, WALL_Z + 0.32, studio, 0.03);
  const cols = [0xe9c9b8, 0xb6d7cf, 0xf3efe9, 0xd9a99a, 0xc7b6e0, 0xf3efe9];
  cols.forEach((c, i) => {
    const h = 0.35 + (i % 3) * 0.12;
    cyl(
      0.1 + (i % 2) * 0.04,
      0.1 + (i % 2) * 0.04,
      h,
      real.gloss(c),
      4.9 + i * 0.5,
      3.25 + h / 2,
      WALL_Z + 0.32,
      studio,
      32,
    );
  });
  // tall monstera in a pot by the left of the window
  const plant = new THREE.Group();
  plant.position.set(-7.2, 0, -5.2);
  studio.add(plant);
  cyl(0.6, 0.45, 1.2, potPlant, 0, 0.6, 0, plant);
  cyl(0.55, 0.55, 0.04, flat(0x4a3526), 0, 1.18, 0, plant);
  const r = rng(12);
  const leaves = [];
  for (let i = 0; i < 9; i++) {
    const stem = new THREE.Group();
    stem.position.set(0, 1.2, 0);
    stem.rotation.set((r() - 0.3) * 0.9, r() * 6.28, (r() - 0.5) * 0.9);
    plant.add(stem);
    const len = 1.6 + r() * 1.4;
    const s = cyl(0.025, 0.03, len, leafM, 0, len / 2, 0, stem, 8);
    s.castShadow = true;
    const leaf = new THREE.Mesh(new THREE.CircleGeometry(0.55 + r() * 0.25, 20), leafM);
    leaf.material.side = THREE.DoubleSide;
    leaf.position.set(0, len + 0.3, 0.2);
    leaf.rotation.x = -0.9;
    leaf.scale.set(1, 1.25, 1);
    leaf.castShadow = true;
    stem.add(leaf);
    leaves.push({ stem, base: stem.rotation.z, seed: i });
  }
  onFrame((t) => {
    for (const l of leaves) l.stem.rotation.z = l.base + Math.sin(t * 1.1 + l.seed) * 0.03;
  });
  // stool
  cyl(0.45, 0.45, 0.14, real.fabric(0xd9a99a), 4.2, 1.3, 1.6, studio);
  cyl(0.05, 0.05, 1.2, bedFrame, 4.2, 0.62, 1.6, studio, 16);
  cyl(0.4, 0.4, 0.05, bedFrame, 4.2, 0.03, 1.6, studio);
  // framed print on the left wall
  box(0.06, 2.2, 1.6, trimM, -8.95, 5.2, -2.6, studio, 0.02);
  box(0.03, 1.9, 1.3, flat(0xe7b8a6), -8.9, 5.2, -2.6);
}
// dust in the sunbeam
fireflies(70, { area: [-6, 1.5, -6, 4, 7, 3], color: 0xfff1d0, seed: 95, size: 0.035 });

// ---------------------------------------------------------------- SKIN world backdrop (x = 200)
export const SKIN_POS = V(200, 0, 0);
{
  const bg = new THREE.Mesh(
    new THREE.SphereGeometry(60, 32, 16),
    new THREE.MeshBasicMaterial({ color: 0x1a0d12, side: THREE.BackSide, fog: false }),
  );
  bg.position.copy(SKIN_POS);
  scene.add(bg);
}

finishSet({ ground: 0xe6ddd0 });
