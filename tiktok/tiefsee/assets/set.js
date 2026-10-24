// #27 Tiefsee — this video's own world (SKILL.md 1b): a vertical slice
// through the Pacific above the Mariana Trench. On top a research ship at
// noon rocks on the waves, the toy sub hanging from its orange A-frame; under
// the surface light shafts, bubbles and jellyfish; at the bottom, 300 units
// further down, the trench: black basalt walls, a pale sediment floor with
// rocks and sea cucumbers. The sub stays near the origin and the whole column
// (`ground`) rises past it (off(t) in beats.js); the water's colour, the fog
// and the light sink from sunlit turquoise to pitch black on the way down.
import { THREE, flat, ground, onFrame, scene, V, rng, jitter, facet, facetMat } from "./world.js";
import { SKIES, setSky, finishSet, terrain, discGeo, F, add, rocks } from "./environments.js";
import { T, off, dark, SURF, D0 } from "./beats.js";

const SEED = 27;
const r = rng(SEED);

// ---------------------------------------------------------------- light
// above water: a clear Pacific noon, a few cumulus on the horizon
const AIR = {
  ...SKIES.mittag,
  top: [0.16, 0.42, 0.86],
  mid: [0.42, 0.68, 0.95],
  hor: [0.84, 0.92, 0.98],
  below: [0.2, 0.5, 0.66],
  clouds: 12,
  birds: true,
  sunDir: [-0.4, 0.42, -1],
  keyPos: [5, 12, 7],
  fog: [60, 190],
};
const before = new Set(scene.children);
const sky = setSky(AIR);
// clouds + birds of the air sky: only above water
const airOnly = scene.children.filter((o) => !before.has(o) && o.isGroup);
const skyMesh = scene.children.find((o) => o.material?.uniforms?.top);
const lights = {
  key: scene.children.find((o) => o.isDirectionalLight && o.castShadow),
  rim: scene.children.find((o) => o.isDirectionalLight && !o.castShadow),
  hemi: scene.children.find((o) => o.isHemisphereLight),
};
const BASE = {
  key: lights.key.intensity,
  rim: lights.rim.intensity,
  hemi: lights.hemi.intensity,
  keyCol: lights.key.color.clone(),
};
// under water: bright turquoise towards the surface, deep blue below …
const WATER = {
  top: [0.5, 0.9, 0.95],
  mid: [0.12, 0.56, 0.72],
  hor: [0.04, 0.3, 0.48],
  below: [0.02, 0.14, 0.3],
  fog: [0.05, 0.33, 0.5],
};
// … and the abyss: almost black, a trace of blue so silhouettes still read
const ABYSS = {
  top: [0.012, 0.03, 0.07],
  mid: [0.008, 0.022, 0.05],
  hor: [0.006, 0.016, 0.04],
  below: [0.004, 0.01, 0.026],
  fog: [0.006, 0.018, 0.042],
};
const mix3 = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
const u = skyMesh.material.uniforms;
const AIR_SUN = u.sunDir.value.clone();
const WATER_SUN = V(0.25, 1, 0.15).normalize();
const SUN_COL = u.sunCol.value.clone();

function atmosphere(t) {
  for (const g of airOnly) g.visible = t < T.wenn;
  if (t < T.wenn) {
    // above water (the hook's first shot)
    u.top.value.set(...AIR.top);
    u.mid.value.set(...AIR.mid);
    u.hor.value.set(...AIR.hor);
    u.below.value.set(...AIR.below);
    u.sunDir.value.copy(AIR_SUN);
    u.sunCol.value.copy(SUN_COL);
    scene.fog.color.setRGB(...AIR.hor, THREE.SRGBColorSpace);
    scene.fog.near = AIR.fog[0];
    scene.fog.far = AIR.fog[1];
    lights.key.intensity = BASE.key;
    lights.key.color.copy(BASE.keyCol);
    lights.rim.intensity = BASE.rim;
    lights.hemi.intensity = BASE.hemi;
    scene.environmentIntensity = 0.4;
    return;
  }
  const k = dark(t);
  u.top.value.set(...mix3(WATER.top, ABYSS.top, k));
  u.mid.value.set(...mix3(WATER.mid, ABYSS.mid, k));
  u.hor.value.set(...mix3(WATER.hor, ABYSS.hor, k));
  u.below.value.set(...mix3(WATER.below, ABYSS.below, k));
  u.sunDir.value.copy(WATER_SUN);
  u.sunCol.value.copy(SUN_COL).multiplyScalar(0.55 * (1 - k));
  scene.fog.color.setRGB(...mix3(WATER.fog, ABYSS.fog, k), THREE.SRGBColorSpace);
  scene.fog.near = 3 + (1 - k) * 3;
  scene.fog.far = 26 + (1 - k) * 12;
  lights.key.intensity = BASE.key * (0.85 - 0.72 * k);
  lights.key.color.setRGB(...mix3([0.75, 0.97, 1], [0.45, 0.6, 1], k));
  lights.rim.intensity = BASE.rim * (1 - 0.5 * k);
  lights.hemi.intensity = BASE.hemi * (1 - 0.8 * k);
  scene.environmentIntensity = 0.4 - 0.3 * k;
}

// the column: seabed at y = 0, surface at y = SURF; it rises past the sub
const BASE_Y = -(SURF + 1.6); // off = 0: the surface sits 1.6 below the sub's crane spot
onFrame((t) => {
  ground.position.y = BASE_Y + off(t);
  atmosphere(t);
});

// ================================================================ surface
// a faceted, gently rolling sea, seen from above and from below
const waveGeo = discGeo(70, 1.8, SEED);
const wavePos = waveGeo.attributes.position;
const wave0 = Float32Array.from(wavePos.array);
const waterMat = new THREE.MeshStandardMaterial({
  color: 0x2fa9cf,
  emissive: 0x6fdcff,
  emissiveIntensity: 0.28,
  roughness: 0.12,
  metalness: 0.05,
  flatShading: true,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.92,
});
const waves = new THREE.Mesh(waveGeo, waterMat);
waves.position.y = SURF;
waves.receiveShadow = true;
waves.userData.noAO = true;
ground.add(waves);
onFrame((t) => {
  for (let i = 0; i < wavePos.count; i++) {
    const x = wave0[i * 3];
    const z = wave0[i * 3 + 2];
    wavePos.array[i * 3 + 1] =
      Math.sin(x * 0.45 + t * 1.3) * 0.09 +
      Math.cos(z * 0.38 - t * 1.05) * 0.08 +
      Math.sin((x + z) * 0.9 + t * 2.1) * 0.03;
  }
  wavePos.needsUpdate = true;
  waveGeo.computeVertexNormals();
});

// ================================================================ the ship
// A research vessel lying along -z, stern towards the camera; its A-frame
// holds the sub over the water. Waterline at y = SURF.
const ship = new THREE.Group();
ship.position.set(0, SURF, -0.7); // stern clear of the hanging sub
ground.add(ship);
const hullShape = (inset = 0) => {
  const s = new THREE.Shape();
  const P = [
    [-2.3, -1.3],
    [2.3, -1.3],
    [2.3, -10.8],
    [1.35, -14.0],
    [0, -15.6],
    [-1.35, -14.0],
    [-2.3, -10.8],
  ].map(([x, z]) => [x * (1 - inset / 2.3), z + (z > -5 ? inset : -inset)]);
  s.moveTo(P[0][0], -P[0][1]);
  for (const [x, z] of P.slice(1)) s.lineTo(x, -z);
  return s;
};
const hullPart = (y0, h, mat, inset = 0, seed = 1) => {
  const g = new THREE.ExtrudeGeometry(hullShape(inset), { depth: h, bevelEnabled: false });
  g.rotateX(-Math.PI / 2);
  const m = F(g, mat, 0.05, seed);
  m.position.y = y0;
  ship.add(m);
  return m;
};
hullPart(-1.2, 1.25, flat(0xc8402f), 0, 1); // antifouling red below the waterline
hullPart(0.05, 0.25, flat(0xf4f4f0), 0, 2); // white boot stripe
hullPart(0.3, 0.9, flat(0x1f4f8f, { roughness: 0.45 }), 0, 3); // blue topsides
hullPart(1.2, 0.08, flat(0xb48a5a), 0.12, 4); // wooden deck
const white = flat(0xf6f6f2, { roughness: 0.5 });
const orange = flat(0xff7a1a, { roughness: 0.45 });
const glassDark = flat(0x1d3550, { roughness: 0.15, metalness: 0.3 });
const box = (w, h, d, mat, x, y, z, seed = 1) => {
  const m = F(new THREE.BoxGeometry(w, h, d), mat, 0.05, seed);
  m.position.set(x, y, z);
  ship.add(m);
  return m;
};
// superstructure: two decks + bridge with a window band, funnel, mast
box(3.8, 1.3, 4.6, white, 0, 1.93, -9.0, 5);
box(3.2, 1.0, 3.2, white, 0, 3.08, -9.6, 6);
box(3.24, 0.36, 0.06, glassDark, 0, 3.2, -7.98, 7);
for (const sx of [-1, 1]) box(0.06, 0.36, 2.6, glassDark, sx * 1.62, 3.2, -9.5, 8);
box(3.9, 0.12, 4.7, flat(0xd8d8d2), 0, 2.64, -9.0, 9);
{
  const funnel = F(new THREE.CylinderGeometry(0.42, 0.5, 1.3, 8), orange, 0.05, 10);
  funnel.position.set(0, 4.2, -11.0);
  ship.add(funnel);
  const cap = F(new THREE.CylinderGeometry(0.45, 0.45, 0.2, 8), flat(0x222428), 0.05, 11);
  cap.position.set(0, 4.95, -11.0);
  ship.add(cap);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 2.2, 6), white);
  mast.position.set(0, 4.7, -9.2);
  ship.add(mast);
  // rotating radar bar
  const radar = box(1.1, 0.1, 0.18, flat(0xeeeeee), 0, 5.6, -9.2, 12);
  onFrame((t) => (radar.rotation.y = t * 2.4));
  // smoke puffs from the funnel
  const smokeMat = flat(0xdfe3e8, { transparent: true, opacity: 0.8 });
  const smoke = Array.from({ length: 6 }, (_, i) => {
    const m = new THREE.Mesh(jitter(new THREE.IcosahedronGeometry(0.28, 0), 0.05, i), smokeMat);
    m.userData.noAO = true;
    ship.add(m);
    return m;
  });
  onFrame((t) =>
    smoke.forEach((m, i) => {
      const k = (t * 0.35 + i / 6) % 1;
      m.position.set(Math.sin(i * 2.1) * 0.2 + k * 0.8, 5.1 + k * 2.4, -11.0 - k * 1.6);
      m.scale.setScalar(0.5 + k * 1.6);
    }),
  );
}
// railing along both sides of the aft deck
{
  const railMat = flat(0xf2f2f2);
  for (const sx of [-1, 1]) {
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 5.6, 5), railMat);
    top.rotation.x = Math.PI / 2;
    top.position.set(sx * 2.2, 1.85, -4.3);
    ship.add(top);
    for (let i = 0; i < 7; i++) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.6, 4), railMat);
      p.position.set(sx * 2.2, 1.55, -1.6 - i * 0.9);
      ship.add(p);
    }
    // lifebuoy on the rail
    const buoy = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.07, 6, 12), orange);
    buoy.position.set(sx * 2.26, 1.55, -5.4);
    buoy.rotation.y = Math.PI / 2;
    ship.add(buoy);
  }
}
// the A-frame over the stern, the cable and the hook
const A_TOP = 4.5; // above the waterline
{
  const legGeo = new THREE.BoxGeometry(0.26, 1, 0.26);
  for (const sx of [-1, 1]) {
    const a = V(sx * 1.95, 1.25, -1.7);
    const b = V(sx * 1.95, A_TOP, 0.75);
    const m = F(legGeo.clone(), orange, 0.04, 13);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.scale.y = a.distanceTo(b);
    m.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize());
    ship.add(m);
  }
  box(4.16, 0.3, 0.3, orange, 0, A_TOP, 0.75, 14);
  box(0.36, 0.34, 0.34, flat(0x2b2d33), 0, A_TOP - 0.28, 0.75, 15);
  // winch drum on deck
  const drum = F(new THREE.CylinderGeometry(0.32, 0.32, 1.1, 10), flat(0x3a6fb0), 0.05, 16);
  drum.rotation.z = Math.PI / 2;
  drum.position.set(0, 1.62, -3.6);
  ship.add(drum);
  box(1.5, 0.3, 0.6, flat(0x2b2d33), 0, 1.38, -3.6, 17);
}
// the cable from the A-frame down to the hook (the sub hangs below it)
export const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1, 5), flat(0x1c1c1c));
cable.position.set(0, (A_TOP - 0.45 + 2.9) / 2, 0.75);
cable.scale.y = A_TOP - 0.45 - 2.9;
ship.add(cable);
// release lever on a control post at the stern rail (the hand pulls it)
export const lever = new THREE.Group();
{
  const post = box(0.42, 0.85, 0.42, flat(0xd9dbe0), 0.95, 1.67, -1.6, 18);
  post.castShadow = true;
  box(0.46, 0.06, 0.46, flat(0xffd23f), 0.95, 2.12, -1.6, 19); // yellow warning top
  lever.position.set(0.95, 2.15, -1.6);
  ship.add(lever);
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.7, 6), flat(0x333333));
  arm.position.y = 0.35;
  lever.add(arm);
  const knob = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 10, 8),
    flat(0xe8262b, { roughness: 0.3 }),
  );
  knob.position.y = 0.72;
  lever.add(knob);
}
// crates + a coiled rope on the aft deck
box(0.7, 0.6, 0.7, flat(0x2f8f5f), -1.5, 1.58, -2.6, 20);
box(0.55, 0.45, 0.55, flat(0xffb02e), -1.5, 2.1, -2.55, 21);
{
  const rope = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.09, 6, 14), flat(0xe8d9a8));
  rope.rotation.x = Math.PI / 2;
  rope.position.set(-1.3, 1.36, -4.6);
  ship.add(rope);
}
ship.traverse((o) => {
  if (o.isMesh) {
    o.castShadow = true;
    o.receiveShadow = true;
  }
});
// the ship rocks on the waves
onFrame((t) => {
  ship.rotation.z = Math.sin(t * 0.9) * 0.012;
  ship.rotation.x = Math.sin(t * 0.7 + 1) * 0.008;
  ship.position.y = SURF + Math.sin(t * 1.1) * 0.03;
  ship.position.z = -0.7;
});
// a second boat and a far island on the horizon
{
  const isl = F(jitter(new THREE.ConeGeometry(9, 5, 9, 2), 0.6, SEED), flat(0x4f9a52), 0.1, SEED);
  isl.position.set(-48, SURF + 1.0, -62);
  ground.add(isl);
  const beach = F(new THREE.CylinderGeometry(9.6, 10, 0.6, 12), flat(0xe8d6a0), 0.06, SEED + 1);
  beach.position.set(-48, SURF + 0.1, -62);
  ground.add(beach);
  const boat = new THREE.Group();
  const bh = F(new THREE.BoxGeometry(1.0, 0.5, 2.6), flat(0xf4f4f0), 0.05, 3);
  boat.add(bh);
  const sail = new THREE.Mesh(
    new THREE.ConeGeometry(0.9, 2.6, 3),
    flat(0xffffff, { side: THREE.DoubleSide }),
  );
  sail.position.y = 1.6;
  sail.scale.z = 0.08;
  boat.add(sail);
  boat.position.set(24, SURF + 0.25, -40);
  ground.add(boat);
  onFrame((t) => (boat.rotation.z = Math.sin(t * 1.2) * 0.06));
}

// ================================================================ under the surface
// light shafts under the surface (only seen in the first ~10 s)
{
  const shaftMat = new THREE.MeshBasicMaterial({
    color: 0xb8f2ff,
    transparent: true,
    opacity: 0.09,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: false,
  });
  const shafts = [];
  for (let i = 0; i < 12; i++) {
    const h = 20 + r() * 14;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 2.0, h, 6, 1, true), shaftMat);
    const a = r() * Math.PI * 2;
    const d = 5 + r() * 12;
    m.position.set(Math.cos(a) * d, SURF - h / 2 - 0.3, Math.sin(a) * d - 3);
    if (Math.abs(m.position.x) < 2.6 && m.position.z > -1) m.position.x += 5;
    m.rotation.z = 0.28;
    m.rotation.x = -0.08;
    m.userData = { noAO: true, ph: r() * 6 };
    ground.add(m);
    shafts.push(m);
  }
  onFrame((t) =>
    shafts.forEach(
      (m) =>
        (m.material.opacity = (0.07 + 0.04 * Math.sin(t * 0.6 + m.userData.ph)) * (1 - dark(t))),
    ),
  );
}
// a school of silver fish under the ship (shallow water)
{
  const fishMat = flat(0xcfe2f2, { roughness: 0.25, metalness: 0.4 });
  const fishGeo = new THREE.ConeGeometry(0.1, 0.38, 5).rotateZ(-Math.PI / 2);
  const school = new THREE.InstancedMesh(fishGeo, fishMat, 40);
  school.frustumCulled = false;
  ground.add(school);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const s = Array.from({ length: 40 }, () => [r(), r(), r()]);
  onFrame((t) => {
    s.forEach(([a, b, c], i) => {
      const ang = t * 0.35 + a * 0.9;
      const x = Math.cos(ang) * (7 + c * 2.5);
      const z = -6 + Math.sin(ang) * (5 + c * 2);
      const y = SURF - 5 - b * 3 + Math.sin(t * 1.5 + i) * 0.15;
      q.setFromEuler(new THREE.Euler(0, -ang - Math.PI / 2, 0));
      m4.compose(V(x, y, z), q, V(1, 1, 1));
      school.setMatrixAt(i, m4);
    });
    school.instanceMatrix.needsUpdate = true;
  });
}
// jellyfish drifting in the mid-water (they glow once it is dark)
{
  const cols = [0xff7ad9, 0x7affe8, 0xb08cff, 0xffb86b, 0x7ad0ff];
  const jellies = [];
  for (let i = 0; i < 9; i++) {
    const g = new THREE.Group();
    const c = cols[i % cols.length];
    const bellMat = new THREE.MeshStandardMaterial({
      color: c,
      emissive: c,
      emissiveIntensity: 0.9,
      transparent: true,
      opacity: 0.7,
      roughness: 0.3,
      flatShading: true,
      depthWrite: false,
    });
    const bell = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2),
      bellMat,
    );
    g.add(bell);
    const tentMat = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.55 });
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      const ten = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.004, 0.9, 3), tentMat);
      ten.position.set(Math.cos(a) * 0.22, -0.45, Math.sin(a) * 0.22);
      g.add(ten);
    }
    g.userData = { bell, ph: r() * 6 };
    g.traverse((o) => (o.userData.noAO = true));
    // spread over the depths the sub passes 20–40 s in, beside and behind it
    const side = i % 2 ? 1 : -1;
    g.position.set(side * (2.6 + r() * 3), 258 - i * 9 - r() * 4, -1.5 - r() * 5);
    ground.add(g);
    jellies.push(g);
  }
  onFrame((t) =>
    jellies.forEach((g) => {
      const p = Math.sin(t * 2.2 + g.userData.ph);
      g.userData.bell.scale.set(1 + p * 0.12, 1 - p * 0.15, 1 + p * 0.12);
      g.position.y += Math.sin(t * 0.8 + g.userData.ph) * 0.002;
      g.rotation.z = Math.sin(t * 0.5 + g.userData.ph) * 0.15;
    }),
  );
}

// ================================================================ the trench floor
// pale sediment, a little relief; the trench walls rise steeply on both sides
const seabedCol = 0x8d8574;
terrain(seabedCol, {
  r: 60,
  step: 1.6,
  seed: SEED,
  amt: 0.14,
  scale: 0.18,
  warm: 0.1,
  height: (x, z, d) =>
    d < 6 ? 0 : Math.sin(x * 0.4 + 1) * Math.cos(z * 0.33) * 0.25 + (d - 6) * 0.01,
});
// trench walls: tall, broken basalt slabs, stepped ledges
{
  const basalt = flat(0x3b3d45, { roughness: 0.95 });
  const basalt2 = flat(0x4a4540, { roughness: 0.95 });
  for (const sx of [-1, 1]) {
    for (let i = 0; i < 16; i++) {
      const z = -42 + i * 5.2 + r() * 2;
      const h = 40 + r() * 50;
      const w = 5 + r() * 4;
      const geo = jitter(new THREE.BoxGeometry(w, h, 5.6 + r() * 2, 2, 6, 2), 0.6, SEED + i);
      const m = add(F(geo, i % 3 ? basalt : basalt2, 0.12, SEED + i), 0, 0, 0, false);
      const x = sx * (10.5 + r() * 3 + Math.max(0, z) * 0.12);
      m.position.set(x + sx * w * 0.3, h / 2 - 2, z);
      m.rotation.y = (r() - 0.5) * 0.4;
      m.rotation.z = sx * -0.06;
      // ledges sticking out of the wall
      for (let k = 0; k < 3; k++) {
        const l = add(
          F(
            jitter(new THREE.DodecahedronGeometry(1.4 + r(), 0), 0.25, i * 7 + k),
            basalt2,
            0.12,
            i * 7 + k,
          ),
          x - sx * (w * 0.2 + 0.8),
          3 + k * 9 + r() * 6,
          z + (r() - 0.5) * 3,
          false,
        );
        l.scale.set(1.4, 0.45, 1.2);
      }
    }
  }
}
// boulders, pebbles, pillow lava along the foot of the walls
{
  const stone = flat(0x5a5650);
  for (let i = 0; i < 26; i++) {
    const sx = i % 2 ? 1 : -1;
    const x = sx * (6.5 + r() * 5);
    const z = -18 + r() * 30;
    const m = add(
      F(
        jitter(new THREE.DodecahedronGeometry(0.5 + r() * 1.1, 1), 0.15, 90 + i),
        stone,
        0.12,
        90 + i,
      ),
      x,
      0.2,
      z,
    );
    m.scale.y = 0.55 + r() * 0.4;
  }
  rocks(30, 3.2, 14, SEED + 5, flat(0x6e695f));
}
// sea cucumbers + xenophyophores (life on the trench floor)
export const cucumbers = [];
{
  const mat = flat(0xf0a8b8, { roughness: 0.6, transparent: true, opacity: 0.9 });
  for (let i = 0; i < 7; i++) {
    const a = r() * Math.PI * 2;
    const d = 3.4 + r() * 5;
    const m = new THREE.Mesh(
      facet(new THREE.CapsuleGeometry(0.12, 0.42, 3, 6), 0.08, i),
      facetMat(mat),
    );
    m.rotation.z = Math.PI / 2;
    m.rotation.y = r() * Math.PI;
    m.position.set(Math.cos(a) * d, 0.12, Math.sin(a) * d - 1);
    m.castShadow = true;
    ground.add(m);
    cucumbers.push(m);
  }
  const xmat = flat(0xd9cbb0, { roughness: 1 });
  for (let i = 0; i < 9; i++) {
    const a = r() * Math.PI * 2;
    const d = 4 + r() * 8;
    const m = new THREE.Mesh(
      facet(jitter(new THREE.IcosahedronGeometry(0.22 + r() * 0.12, 1), 0.06, i), 0.1, i),
      facetMat(xmat),
    );
    m.position.set(Math.cos(a) * d, 0.15, Math.sin(a) * d - 2);
    m.scale.y = 0.7;
    ground.add(m);
  }
}
onFrame((t) => cucumbers.forEach((m, i) => (m.scale.x = 1 + Math.sin(t * 1.2 + i) * 0.08)));

// ================================================================ marine snow
// drifts past the sub all the way down; streaks when the descent speeds up
{
  const N = 520;
  const snowMat = new THREE.MeshBasicMaterial({
    color: 0xe8f6ff,
    transparent: true,
    opacity: 0.75,
  });
  const snow = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.022, 0), snowMat, N);
  snow.userData.noAO = true;
  snow.frustumCulled = false;
  scene.add(snow);
  const s = Array.from({ length: N }, () => [r(), r(), r(), r()]);
  const H = 22;
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  onFrame((t) => {
    const o = off(t);
    const v = (off(t + 0.05) - off(t - 0.05)) / 0.1; // descent speed
    const streak = 1 + Math.min(14, v * 0.35);
    const vis = t < T.wenn ? 0 : 1;
    s.forEach(([a, b, c, d], i) => {
      const y = ((((b * H + o * 1.0 - t * 0.08 * (0.5 + d)) % H) + H) % H) - H / 2 - D0;
      const x = (a - 0.5) * 18 + Math.sin(t * 0.3 + i) * 0.3;
      const z = (c - 0.5) * 18 - 1 + Math.cos(t * 0.25 + i) * 0.3;
      const sc = (0.6 + d * 0.9) * vis;
      m4.compose(V(x, y, z), q, V(sc, sc * streak, sc));
      snow.setMatrixAt(i, m4);
    });
    snow.instanceMatrix.needsUpdate = true;
  });
}

finishSet({ ground: 0x2a6f8f });
export { sky };
