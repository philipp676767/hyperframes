// #94 Papier 42-mal falten — four worlds, switched by time in scene.js:
//  ROOM  a classroom on an autumn afternoon: sun through tall windows, dust
//        in the light, the green chalkboard (hero piece), rows of desks.
//        Scale: 2 units = 1 m, desk top at y = 1.5, the paper at the origin.
//  EXT   the same school from outside (3 floors, schoolyard, trees) — the
//        paper column punches through the roof; the toilet-paper record strip
//        runs across the yard.
//  AIR   above a sea of clouds, an airliner cruising.
//  SPACE the Earth's limb, black sky, stars and the Moon.
import { THREE, flat, real, roundedBox, scene, ground, onFrame, rng, V } from "./world.js";
import {
  SKIES,
  setSky,
  finishSet,
  terrain,
  tree,
  cloudPuffs,
  fireflies,
  pathStrip,
} from "./environments.js";
import { facet, facetMat } from "./world.js";

// ---------------------------------------------------------------- light
const before = scene.children.length;
setSky({
  ...SKIES.mittag,
  top: [0.26, 0.5, 0.88],
  mid: [0.55, 0.74, 0.95],
  hor: [1.0, 0.9, 0.74],
  below: [0.86, 0.86, 0.84],
  sun: [1.0, 0.9, 0.7],
  sunDir: [0.85, 0.42, 0.2],
  key: [0xffe2b8, 3.2],
  keyPos: [16, 10.5, 4],
  hemi: [0xf2ecff, 0x8a7d6a, 1.2],
  noClouds: true,
  birds: false,
  fog: [70, 260],
});
export const skyBits = scene.children.slice(before).filter((o) => !o.isLight);
for (const o of scene.children) {
  if (o.isDirectionalLight && o.castShadow) {
    Object.assign(o.shadow.camera, {
      left: -16,
      right: 16,
      top: 16,
      bottom: -16,
      near: 1,
      far: 70,
    });
    o.shadow.camera.updateProjectionMatrix();
  }
}

// ---------------------------------------------------------------- materials
const paperM = real.plastic(0xf6f3ea, { roughness: 0.92, clearcoat: 0 });
const deskTop = real.wood(0xd8b27c, { roughness: 0.55 });
const deskEdge = real.plastic(0x2f6c5a, { roughness: 0.5 });
const steel = real.metal(0x9aa3ad, { roughness: 0.4 });
const plaster = flat(0xf0e6d2);
const plasterOut = flat(0xe9c27f);
const floorM = flat(0xb98a58);
const frameM = real.plastic(0xfafafa, { roughness: 0.5 });
const glassM = new THREE.MeshPhysicalMaterial({
  color: 0xbfe3ff,
  roughness: 0.05,
  transparent: true,
  opacity: 0.18,
});
export const M2 = { paperM, deskTop };

// ---------------------------------------------------------------- ROOM
export const school = new THREE.Group();
ground.add(school);
const box = (w, h, d, mat, x, y, z, parent = school, shadow = true) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};
const rbox = (w, h, d, rr, mat, x, y, z, parent = school) => {
  const m = new THREE.Mesh(roundedBox(w, h, d, rr, 3), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};

// room: x -8..8, z -7..6, floor 0, ceiling 6.5
const RX = 8,
  RZ0 = -7,
  RZ1 = 6,
  RH = 6.5;
// wooden plank floor (inside) with seams
{
  const g = facet(new THREE.PlaneGeometry(16, 13, 16, 26), 0.05, 3);
  g.rotateX(-Math.PI / 2);
  const f = new THREE.Mesh(g, facetMat(floorM));
  f.position.set(0, 0.01, -0.5);
  f.receiveShadow = true;
  school.add(f);
  const seam = flat(0x8a6038);
  for (let i = 0; i < 26; i++) box(16, 0.004, 0.02, seam, 0, 0.015, RZ0 + i * 0.5, school, false);
}
// walls (thickness 0.4); window wall x = +8 with three openings
const WALL = 0.4;
box(16.8, RH, WALL, plaster, 0, RH / 2, RZ0 - WALL / 2); // board wall
box(16.8, RH, WALL, plaster, 0, RH / 2, RZ1 + WALL / 2); // back wall
box(WALL, RH, 13, plaster, -RX - WALL / 2, RH / 2, -0.5); // door wall
// window wall built around 3 openings z: [-5.6,-2.6], [-1.5,1.5], [2.6,5.2], y 1.6..5.4
{
  const openings = [
    [-5.6, -2.6],
    [-1.5, 1.5],
    [2.6, 5.2],
  ];
  const x = RX + WALL / 2;
  box(WALL, 1.6, 13, plaster, x, 0.8, -0.5);
  box(WALL, RH - 5.4, 13, plaster, x, (5.4 + RH) / 2, -0.5);
  let z = RZ0;
  for (const [a, b] of openings) {
    box(WALL, 3.8, a - z, plaster, x, 3.5, (a + z) / 2);
    // frame + mullions + glass
    const zc = (a + b) / 2;
    const w = b - a;
    box(0.12, 0.12, w, frameM, x - 0.1, 1.62, zc);
    box(0.12, 0.12, w, frameM, x - 0.1, 5.38, zc);
    box(0.12, 3.8, 0.1, frameM, x - 0.1, 3.5, zc);
    box(0.12, 0.08, w, frameM, x - 0.1, 4.3, zc);
    const gl = box(0.02, 3.7, w - 0.1, glassM, x, 3.5, zc, school, false);
    gl.receiveShadow = false;
    // windowsill + a plant on the middle one
    rbox(0.7, 0.08, w + 0.3, 0.02, real.plastic(0xeeeeea), x - 0.45, 1.6, zc);
    z = b;
  }
  box(WALL, 3.8, RZ1 - z, plaster, x, 3.5, (RZ1 + z) / 2);
}
// ceiling + lamp strips
box(16.8, 0.3, 13.8, plaster, 0, RH + 0.15, -0.5);
for (const x of [-4, 0, 4]) {
  rbox(
    0.5,
    0.12,
    9,
    0.04,
    real.plastic(0xffffff, { emissive: 0xfff4dc, emissiveIntensity: 0.25 }),
    x,
    RH - 0.1,
    -0.5,
  );
}
// skirting
const skirt = flat(0x6d4a30);
box(16, 0.25, 0.06, skirt, 0, 0.125, RZ0 + 0.03);
box(16, 0.25, 0.06, skirt, 0, 0.125, RZ1 - 0.03);
box(0.06, 0.25, 13, skirt, -RX + 0.03, 0.125, -0.5);

// hero piece: the green chalkboard with chalk scribbles + tray
{
  const bz = RZ0 + 0.05;
  rbox(9.6, 3.4, 0.16, 0.04, real.wood(0x7a5232), 0, 3.6, bz);
  box(9.2, 3.0, 0.06, flat(0x2f5e47, { roughness: 0.95 }), 0, 3.6, bz + 0.1, school, false);
  const chalk = new THREE.MeshBasicMaterial({ color: 0xf2f2ea, transparent: true, opacity: 0.85 });
  // a doubling sum + a staircase of growing bars, drawn in chalk
  const R = rng(7);
  for (let i = 0; i < 6; i++) {
    const h = 0.12 * 2 ** (i * 0.55);
    box(0.32, h, 0.01, chalk, -3.6 + i * 0.6, 2.4 + h / 2, bz + 0.14, school, false);
  }
  for (let row = 0; row < 3; row++)
    for (let k = 0; k < 6 + row; k++) {
      const w = 0.18 + R() * 0.2;
      box(w, 0.06, 0.01, chalk, 0.6 + k * 0.42, 4.5 - row * 0.45, bz + 0.14, school, false);
    }
  // "×2" arrow loops
  const curve = new THREE.CatmullRomCurve3([
    V(-3.8, 4.2, 0),
    V(-3.2, 4.8, 0),
    V(-2.6, 4.2, 0),
    V(-2.0, 4.85, 0),
    V(-1.4, 4.2, 0),
  ]);
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.025, 4), chalk);
  tube.position.z = bz + 0.14;
  school.add(tube);
  rbox(9.2, 0.08, 0.3, 0.02, real.wood(0x8a603c), 0, 2.08, bz + 0.18);
  rbox(0.18, 0.05, 0.05, 0.02, real.plastic(0xffffff), -2, 2.15, bz + 0.2);
  rbox(0.14, 0.05, 0.05, 0.02, real.plastic(0xffd23f), -1.6, 2.15, bz + 0.22);
}
// wall clock with a moving second hand (life)
{
  const cg = new THREE.Group();
  cg.position.set(-5.8, 5.2, RZ0 + 0.12);
  school.add(cg);
  const face = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 0.06, 36),
    real.plastic(0xffffff),
  );
  face.rotation.x = Math.PI / 2;
  cg.add(face);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.04, 8, 36), real.plastic(0x222222));
  cg.add(rim);
  for (let i = 0; i < 12; i++) {
    const tk = box(
      0.025,
      0.08,
      0.01,
      flat(0x222222),
      Math.sin((i / 12) * Math.PI * 2) * 0.34,
      Math.cos((i / 12) * Math.PI * 2) * 0.34,
      0.04,
      cg,
      false,
    );
    tk.rotation.z = -(i / 12) * Math.PI * 2;
  }
  const hand = (len, w, col, z) => {
    const p = new THREE.Group();
    p.position.z = z;
    cg.add(p);
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, len, 0.01), flat(col));
    m.position.y = len / 2 - 0.04;
    p.add(m);
    return p;
  };
  const hh = hand(0.22, 0.04, 0x222222, 0.045);
  const mh = hand(0.32, 0.03, 0x222222, 0.05);
  const sh = hand(0.36, 0.012, 0xd83a2a, 0.055);
  hh.rotation.z = -Math.PI * 2 * (3.6 / 12);
  onFrame((t) => {
    mh.rotation.z = -Math.PI * 2 * (0.25 + t / 3600);
    sh.rotation.z = (-Math.PI * 2 * Math.floor(t + 14)) / 60;
  });
}
// teacher's desk with globe and books
{
  rbox(3.4, 0.1, 1.5, 0.03, real.wood(0xb98d5a), -2.2, 1.55, -5.4);
  box(3.3, 1.5, 0.08, real.wood(0x9c7448), -2.2, 0.75, -4.75);
  const globe = new THREE.Group();
  globe.position.set(-3.4, 1.6, -5.5);
  school.add(globe);
  const st = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.05, 16), real.wood(0x5a3a22));
  globe.add(st);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 16), real.plastic(0x3a86c8));
  ball.position.y = 0.42;
  globe.add(ball);
  const land = new THREE.Mesh(
    new THREE.SphereGeometry(0.285, 10, 6, 0, 2.2, 0.6, 1.4),
    real.plastic(0x6bab55),
  );
  land.position.y = 0.42;
  globe.add(land);
  onFrame((t) => (land.rotation.y = t * 0.3));
  for (let i = 0; i < 4; i++)
    rbox(
      0.5,
      0.09,
      0.36,
      0.015,
      real.plastic([0xd84a3a, 0x3a6ad8, 0xf2c23a, 0x2a9a6a][i]),
      -1.2,
      1.65 + i * 0.09,
      -5.4 + (i % 2) * 0.04,
    );
}

// student desks (hero desk at the origin)
export function desk(x, z, hero = false) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  school.add(g);
  rbox(2.4, 0.07, 1.2, 0.025, deskTop, 0, 1.465, 0, g);
  rbox(2.42, 0.05, 1.22, 0.02, deskEdge, 0, 1.415, 0, g);
  for (const sx of [-1.05, 1.05]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 10), steel);
    leg.position.set(sx, 0.7, -0.4);
    leg.castShadow = true;
    g.add(leg);
    const leg2 = leg.clone();
    leg2.position.z = 0.4;
    g.add(leg2);
    box(0.06, 0.06, 0.95, steel, sx, 0.08, 0, g);
  }
  box(2.1, 0.04, 0.9, flat(0x6a6a6a), 0, 1.22, -0.05, g); // book shelf
  // chair behind (+z)
  const c = new THREE.Group();
  c.position.set(0.3, 0, 1.15);
  g.add(c);
  rbox(0.9, 0.06, 0.85, 0.03, real.plastic(0x2f6c5a), 0, 0.9, 0, c);
  rbox(0.9, 0.5, 0.06, 0.03, real.plastic(0x2f6c5a), 0, 1.4, 0.42, c);
  for (const [sx, sz] of [
    [-0.38, -0.36],
    [0.38, -0.36],
    [-0.38, 0.36],
    [0.38, 0.36],
  ]) {
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8), steel);
    l.position.set(sx, 0.45, sz);
    c.add(l);
  }
  if (!hero) {
    // a few things on the other desks
    const R = rng(Math.round(x * 13 + z * 7 + 50));
    rbox(
      0.5,
      0.05,
      0.7,
      0.01,
      real.plastic([0xd84a3a, 0x3a6ad8, 0xf2c23a][Math.floor(R() * 3)]),
      -0.6 + R() * 0.3,
      1.53,
      R() * 0.2,
      g,
    ).rotation.y = R();
    if (R() > 0.4) rbox(0.42, 0.006, 0.6, 0.002, paperM, 0.4, 1.505, 0.1, g).rotation.y = R() - 0.5;
    if (R() > 0.5) {
      const bag = rbox(
        0.7,
        0.8,
        0.35,
        0.12,
        real.fabric([0x3a5ad8, 0xd85a8a, 0x2a2a2a][Math.floor(R() * 3)]),
        1.3,
        0.4,
        0.6,
        g,
      );
      bag.rotation.y = 0.4;
    }
  }
  return g;
}
for (const x of [-4.6, 0, 4.6]) for (const z of [-2.8, 0, 3.0]) desk(x, z, x === 0 && z === 0);

// hero desk dressing: pencil case, pencils, ruler, the coffee cup, eraser
export const CUP = V(0.25, 1.5, 0.06);
{
  const pc = rbox(0.62, 0.12, 0.2, 0.05, real.fabric(0xe06a3a), -0.75, 1.56, -0.32);
  pc.rotation.y = 0.25;
  for (let i = 0; i < 3; i++) {
    const p = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.014, 0.36, 6),
      real.plastic([0xffd23f, 0x3a86c8, 0xd84a3a][i]),
    );
    p.rotation.z = Math.PI / 2;
    p.rotation.y = 0.2 + i * 0.25;
    p.position.set(-0.55 + i * 0.05, 1.515, 0.34 + i * 0.03);
    p.castShadow = true;
    school.add(p);
  }
  const ruler = rbox(
    0.06,
    0.006,
    0.6,
    0.002,
    real.plastic(0xbfe8ff, { transparent: true, opacity: 0.7 }),
    0.55,
    1.505,
    -0.3,
  );
  ruler.rotation.y = -0.5;
  rbox(0.1, 0.04, 0.06, 0.015, real.plastic(0xff8fa8), -0.35, 1.52, 0.42);
  // coffee cup
  const cup = new THREE.Group();
  cup.position.copy(CUP);
  school.add(cup);
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.085, 0.075, 0.18, 28, 1, true),
    real.ceramic(0xd8473a, { side: THREE.DoubleSide }),
  );
  body.position.y = 0.09;
  body.castShadow = true;
  cup.add(body);
  const bottom = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.075, 0.01, 28),
    real.ceramic(0xd8473a),
  );
  bottom.position.y = 0.005;
  cup.add(bottom);
  const coffee = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.005, 28),
    real.gloss(0x3a2214),
  );
  coffee.position.y = 0.15;
  cup.add(coffee);
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.045, 0.012, 8, 20, Math.PI),
    real.ceramic(0xd8473a),
  );
  handle.rotation.z = -Math.PI / 2;
  handle.position.set(0.085, 0.09, 0);
  cup.add(handle);
  // steam wisps
  const steamM = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.25,
    depthWrite: false,
  });
  const wisps = [];
  for (let i = 0; i < 5; i++) {
    const w = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), steamM);
    cup.add(w);
    wisps.push(w);
  }
  onFrame((t) => {
    wisps.forEach((w, i) => {
      const k = (t * 0.35 + i / 5) % 1;
      w.position.set(Math.sin(t * 1.3 + i) * 0.03, 0.18 + k * 0.3, Math.cos(t + i) * 0.02);
      w.scale.setScalar(0.6 + k * 1.6);
      w.material.opacity = 0.22 * (1 - k);
    });
  });
}

// back wall: cubbies with bags, posters; door wall: door, coat hooks
{
  for (let i = 0; i < 6; i++) {
    const x = -6 + i * 2.4;
    rbox(2.2, 1.6, 0.8, 0.04, real.wood(0xc9a06a), x, 0.8, RZ1 - 0.45);
    box(1.9, 1.3, 0.05, flat(0x5a4030), x, 0.82, RZ1 - 0.84, school, false);
    rbox(
      0.7,
      0.6,
      0.3,
      0.1,
      real.fabric([0xd84a3a, 0x3a6ad8, 0xf2c23a, 0x2a9a6a, 0x8a4ad8, 0xff8a3a][i]),
      x - 0.3,
      0.45,
      RZ1 - 0.75,
    );
  }
  const posters = [0xffd23f, 0x4fc3ff, 0xff7a5a, 0x7ad87a];
  posters.forEach((c, i) => {
    rbox(
      1.5,
      2.0,
      0.03,
      0.01,
      real.plastic(c, { roughness: 0.8 }),
      -5.4 + i * 3.6,
      3.7,
      RZ1 - 0.04,
    );
    box(1.1, 0.12, 0.01, flat(0x333333), -5.4 + i * 3.6, 4.3, RZ1 - 0.06, school, false);
    box(0.9, 0.9, 0.01, flat(0xffffff), -5.4 + i * 3.6, 3.4, RZ1 - 0.06, school, false);
  });
  rbox(0.1, 4.2, 2.0, 0.02, real.wood(0x8a603c), -RX + 0.06, 2.1, 3.4);
  for (let i = 0; i < 6; i++) {
    const hook = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), steel);
    hook.position.set(-RX + 0.1, 3.6, -5 + i * 1.1);
    school.add(hook);
    if (i % 2 === 0)
      rbox(
        0.3,
        1.2,
        0.7,
        0.12,
        real.fabric([0x3a5a8a, 0xb04a3a, 0x6a8a3a][i / 2]),
        -RX + 0.25,
        3.0,
        -5 + i * 1.1,
      );
  }
}
// potted plant on the middle sill (sways)
{
  const p = new THREE.Group();
  p.position.set(RX - 0.4, 1.64, -0.2);
  school.add(p);
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.15, 0.32, 20),
    real.ceramic(0xc8643c),
  );
  pot.position.y = 0.16;
  pot.castShadow = true;
  p.add(pot);
  const leaves = new THREE.Group();
  leaves.position.y = 0.3;
  p.add(leaves);
  for (let i = 0; i < 9; i++) {
    const l = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 10, 6),
      real.plastic(0x3f9a45, { roughness: 0.6 }),
    );
    l.scale.set(0.5, 0.15, 1.3);
    const a = (i / 9) * Math.PI * 2;
    l.position.set(Math.cos(a) * 0.15, 0.1 + (i % 3) * 0.12, Math.sin(a) * 0.15);
    l.rotation.set(0.6 * Math.sin(a), -a, 0.5);
    l.castShadow = true;
    leaves.add(l);
  }
  onFrame((t) => (leaves.rotation.z = Math.sin(t * 1.4) * 0.04));
}
// a paper plane hanging from the ceiling on a thread (life)
{
  const pp = new THREE.Group();
  pp.position.set(-3.2, 4.6, 1.6);
  school.add(pp);
  const shape = new THREE.BufferGeometry().setFromPoints([
    V(0, 0, 0.5),
    V(-0.35, 0, -0.3),
    V(0, -0.08, -0.25),
    V(0, 0, 0.5),
    V(0, -0.08, -0.25),
    V(0.35, 0, -0.3),
  ]);
  shape.computeVertexNormals();
  const plane = new THREE.Mesh(
    shape,
    new THREE.MeshStandardMaterial({ color: 0xfafafa, side: THREE.DoubleSide, roughness: 0.9 }),
  );
  plane.castShadow = true;
  pp.add(plane);
  const th = box(0.005, 1.9, 0.005, flat(0xdddddd), 0, 0.95, 0, pp, false);
  th.castShadow = false;
  onFrame((t) => (pp.rotation.y = Math.sin(t * 0.5) * 0.6));
}
// sun shafts through the windows + dust dancing in them
{
  const d = fireflies(70, {
    area: [0, 7.5, 0.6, 4.5, -5.5, 5],
    color: 0xfff1cc,
    seed: 94,
    size: 0.012,
  });
  d.position.y = 0;
}

// ---------------------------------------------------------------- EXT: the school building
const W3 = 21.5; // roof height (3 floors)
{
  // outer shell: the classroom is the ground-floor corner of a long wing toward -x
  const winM = real.gloss(0x5a7da0, { roughness: 0.15 });
  const shell = (w, d, x, z) => {
    box(w, W3 - RH - 0.3, d, plasterOut, x, (RH + 0.3 + W3) / 2, z);
  };
  shell(16.8 + 30, 13.8, -15, -0.5); // upper floors above the classroom + wing
  box(30, RH + 0.3, 13.8, plasterOut, -23.4 - 0.4, (RH + 0.3) / 2, -0.5); // ground floor of the wing
  // outer skin of the classroom walls (warm plaster) so it reads the same from outside
  box(0.05, RH, 13.8, plasterOut, RX + WALL + 0.03, RH / 2, -0.5).visible = false;
  // window rows on the +x end and the +z front
  for (let fl = 1; fl < 3; fl++) {
    const y = RH + 0.3 + (fl - 1) * 7.6 + 3.6;
    for (const zc of [-4.1, 0, 3.9])
      box(0.1, 3.2, 2.8, winM, RX + WALL + 0.05, y, zc, school, false);
    for (let i = 0; i < 11; i++)
      box(2.6, 3.2, 0.1, winM, 6 - i * 4, y, RZ1 + WALL + 0.95, school, false);
  }
  for (let i = 0; i < 11; i++)
    if (i > 3) box(2.6, 3.2, 0.1, winM, 6 - i * 4, 3.5, RZ1 + WALL + 0.95, school, false);
  // cornice + parapet + roof
  box(47.6, 0.6, 14.6, flat(0xcfa868), -15, W3 + 0.3, -0.5);
  box(47.6, 0.9, 0.3, flat(0xd8b070), -15, W3 + 1.05, 6.75);
  box(47.6, 0.9, 0.3, flat(0xd8b070), -15, W3 + 1.05, -7.75);
  box(0.3, 0.9, 14.6, flat(0xd8b070), 8.95, W3 + 1.05, -0.5);
  // entrance with steps, a sign and a flag pole
  rbox(5, 4.5, 1.2, 0.05, flat(0xb98a58), -18, 2.25, RZ1 + 1.2);
  box(4, 3.6, 0.1, real.gloss(0x2a3a4a), -18, 1.8, RZ1 + 1.85, school, false);
  for (let i = 0; i < 3; i++)
    box(6.5, 0.2, 1.2 - i * 0.3, flat(0xcfc8bf), -18, 0.1 + i * 0.2, RZ1 + 2.6 - i * 0.15);
  rbox(8, 1.2, 0.2, 0.05, real.plastic(0x2f6c5a), -18, 5.4, RZ1 + 1.9);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 16, 10), steel);
  pole.position.set(-8, 8, 16);
  school.add(pole);
  const flag = box(3, 1.8, 0.04, real.fabric(0xd83a3a), -6.5, 15, 16);
  onFrame((t) => (flag.rotation.y = Math.sin(t * 2.3) * 0.18));
}
// the yard: terrain, asphalt, hopscotch, trees, a basketball hoop
terrain(0x7aa84e, { r: 240, step: 6, flatR: 120, hills: 14, seed: 94, warm: 0.3 });
{
  const asphalt = new THREE.Mesh(new THREE.PlaneGeometry(80, 40), flat(0x8e8a86));
  asphalt.rotation.x = -Math.PI / 2;
  asphalt.position.set(-10, 0.02, 27);
  asphalt.receiveShadow = true;
  school.add(asphalt);
  const lineM = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (let i = 0; i < 6; i++)
    box(
      1.2,
      0.01,
      1.2,
      lineM,
      8 + (i % 2) * 1.3,
      0.035,
      14 + Math.floor(i / 2) * 1.3 + (i % 2 ? 0 : 0.6),
      school,
      false,
    );
  const hoopPole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 6, 10), steel);
  hoopPole.position.set(-28, 3, 40);
  school.add(hoopPole);
  rbox(3, 2, 0.1, 0.05, real.plastic(0xffffff), -28, 6.2, 39.6);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.04, 8, 20), real.metal(0xff6a2a));
  ring.rotation.x = Math.PI / 2;
  ring.position.set(-28, 5.4, 39);
  school.add(ring);
  const R = rng(12);
  for (let i = 0; i < 16; i++) {
    const a = R() * Math.PI * 2;
    const d = 50 + R() * 70;
    const x = Math.cos(a) * d - 10;
    const z = Math.sin(a) * d;
    if (z > -20 && z < 60 && x > -60 && x < 30 && d < 70) continue;
    if (z > 8 && x > -70) continue; // keep the yard and the toilet-paper strip clear
    tree(x, z, 4.5 + R() * 3, i + 3);
  }
  for (const [x, z] of [
    [30, -12],
    [-45, 18],
    [-52, 44],
    [40, -30],
  ])
    tree(x, z, 5.5, Math.round(x));
  pathStrip(
    [
      [-18, 9],
      [-16, 30],
      [-6, 60],
      [10, 110],
    ],
    { width: 4, color: 0xcdb892, seed: 9 },
  );
}

// ---------------------------------------------------------------- TP: world-record strip across the yard
export const tp = new THREE.Group();
school.add(tp);
export const TP_ROLL = V(-30, 0, 28);
export const TP_ANGLE = -2.0; // strip runs from the roll toward +x / +z, away from the building
{
  const tpM = real.fabric(0xfbfbf8, { roughness: 0.95 });
  const roll = new THREE.Group();
  roll.position.copy(TP_ROLL).add(V(0, 1.2, 0));
  tp.add(roll);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 2.2, 40), tpM);
  body.rotation.x = Math.PI / 2;
  body.castShadow = true;
  roll.add(body);
  const core = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.45, 2.24, 24),
    real.fabric(0xb08a5a),
  );
  core.rotation.x = Math.PI / 2;
  roll.add(core);
  // the strip: 2.1 units wide, running out across the yard to the horizon
  const sg = new THREE.PlaneGeometry(2.1, 420, 1, 80);
  sg.rotateX(-Math.PI / 2);
  sg.translate(0, 0, -210);
  const strip = new THREE.Mesh(sg, tpM);
  strip.rotation.y = TP_ANGLE;
  strip.position.set(TP_ROLL.x, 0.06, TP_ROLL.z);
  strip.receiveShadow = true;
  tp.add(strip);
  // perforation lines every few units, fading into the distance
  const perfM = flat(0xdcdcd6);
  for (let i = 1; i < 60; i++) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.005, 0.05), perfM);
    p.position.set(0, 0.075, -i * 3.5);
    const holder = new THREE.Group();
    holder.rotation.y = TP_ANGLE;
    holder.position.set(TP_ROLL.x, 0, TP_ROLL.z);
    holder.add(p);
    tp.add(holder);
  }
  // the folded pile: 12 folds of a strip a kilometre long
  rbox(2.1, 1.4, 2.4, 0.15, tpM, TP_ROLL.x - 3.2, 0.7, TP_ROLL.z + 1.5, tp);
}

// ---------------------------------------------------------------- AIR: above the clouds
// y = (altitude km − 2) × 2: cloud deck at 0, airliners (10 km) at 16
export const air = new THREE.Group();
air.visible = false;
scene.add(air);
export const PLANE_Y = 16;
export const airliner = new THREE.Group();
{
  const deck = new THREE.Mesh(
    facet(new THREE.CircleGeometry(260, 48).rotateX(-Math.PI / 2), 0.04, 3),
    facetMat(
      new THREE.MeshStandardMaterial({
        color: 0xf4f6fb,
        roughness: 1,
        flatShading: true,
        emissive: 0xc8d4ea,
        emissiveIntensity: 0.35,
      }),
    ),
  );
  deck.position.y = -1.5;
  air.add(deck);
  const cloudMat = facetMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xd8e2f4,
      emissiveIntensity: 0.35,
      roughness: 1,
      flatShading: true,
    }),
  );
  const R = rng(31);
  for (let i = 0; i < 70; i++) {
    const g = new THREE.Group();
    const a = R() * Math.PI * 2;
    const d = 4 + Math.sqrt(R()) * 150;
    g.position.set(Math.cos(a) * d, -1.2 + R() * 1.2, Math.sin(a) * d);
    cloudPuffs(g, 4 + Math.floor(R() * 4), 3 + R() * 4, cloudMat, i * 5);
    g.rotation.y = R() * 6;
    air.add(g);
  }
  // a few high cirrus wisps far above
  const ciM = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
    fog: false,
  });
  for (let i = 0; i < 8; i++) {
    const c = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 6), ciM);
    c.scale.set(40, 0.6, 7);
    c.position.set(-120 + i * 34, 90 + R() * 20, -60 - R() * 80);
    c.rotation.y = 0.3;
    air.add(c);
  }
  // airliner (~ 18 units long), white with a blue tail
  const white = real.gloss(0xf4f5f7, { roughness: 0.25 });
  const blue = real.gloss(0x2a5ab8, { roughness: 0.25 });
  const fus = new THREE.Mesh(new THREE.CapsuleGeometry(1.0, 15, 8, 24), white);
  fus.rotation.z = Math.PI / 2;
  airliner.add(fus);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 8), real.gloss(0x1a2a3a));
  nose.position.set(8.2, 0.35, 0);
  nose.scale.set(1, 0.5, 1.6);
  airliner.add(nose);
  const wingGeo = new THREE.BoxGeometry(4.5, 0.18, 18);
  const wing = new THREE.Mesh(wingGeo, white);
  wing.position.set(0.5, -0.4, 0);
  wing.rotation.y = -0.35;
  airliner.add(wing);
  for (const z of [-3.4, 3.4]) {
    const eng = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.5, 2.4, 20),
      real.metal(0xc9ced6),
    );
    eng.rotation.z = Math.PI / 2;
    eng.position.set(1.6, -1.0, z);
    airliner.add(eng);
  }
  const fin = new THREE.Mesh(new THREE.BoxGeometry(2.8, 3.6, 0.18), blue);
  fin.position.set(-7.2, 2.0, 0);
  fin.rotation.z = 0.45;
  airliner.add(fin);
  const stab = new THREE.Mesh(new THREE.BoxGeometry(2, 0.14, 6.5), white);
  stab.position.set(-7.4, 0.3, 0);
  airliner.add(stab);
  const winM = flat(0x24323f);
  for (let i = 0; i < 18; i++) {
    for (const z of [-0.98, 0.98]) {
      const w = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.28, 0.04), winM);
      w.position.set(-5.5 + i * 0.68, 0.3, z);
      airliner.add(w);
    }
  }
  const stripe = new THREE.Mesh(
    new THREE.CylinderGeometry(1.01, 1.01, 14, 24, 1, true, Math.PI * 0.95, Math.PI * 0.1),
    blue,
  );
  stripe.rotation.z = Math.PI / 2;
  airliner.add(stripe);
  airliner.traverse((o) => (o.castShadow = true));
  air.add(airliner);
}

// ---------------------------------------------------------------- SPACE: Earth, stars, Moon
export const space = new THREE.Group();
space.visible = false;
scene.add(space);
export const EARTH_R = 40;
export const MOON = V(0, 66, -2);
export const MOON_R = 5.5;
{
  const bg = new THREE.Mesh(
    new THREE.SphereGeometry(280, 32, 16),
    new THREE.MeshBasicMaterial({
      color: 0x02030a,
      side: THREE.BackSide,
      fog: false,
      depthWrite: false,
    }),
  );
  space.add(bg);
  const R = rng(77);
  const pts = [];
  for (let i = 0; i < 2200; i++) {
    const v = V(R() - 0.5, R() - 0.5, R() - 0.5)
      .normalize()
      .multiplyScalar(250);
    pts.push(v.x, v.y, v.z);
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  space.add(
    new THREE.Points(
      sg,
      new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, fog: false }),
    ),
  );
  // the Earth: oceans, continents, cloud swirls, a glowing blue rim
  const eg = new THREE.SphereGeometry(EARTH_R, 96, 64);
  const col = [];
  const p = eg.attributes.position;
  const c = new THREE.Color();
  const n3 = (x, y, z) =>
    Math.sin(x * 1.7 + Math.sin(z * 2.3)) * Math.cos(y * 1.9 - x * 0.7) +
    0.5 * Math.sin(z * 3.1 + y * 2.7);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) / EARTH_R,
      y = p.getY(i) / EARTH_R,
      z = p.getZ(i) / EARTH_R;
    const v = n3(x * 2.2, y * 2.2, z * 2.2);
    if (Math.abs(y) > 0.86) c.set(0xf4f8ff);
    else if (v > 0.45) c.set(v > 0.9 ? 0x8c7a4a : 0x4f9a45);
    else c.set(0x1f5fbf).lerp(new THREE.Color(0x2a7fd8), 0.5 + 0.5 * Math.sin(x * 9));
    col.push(c.r, c.g, c.b);
  }
  eg.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  const earth = new THREE.Mesh(
    eg,
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7, metalness: 0 }),
  );
  earth.position.set(0, -EARTH_R, 0);
  earth.rotation.set(0.4, 0, 0.2);
  space.add(earth);
  const cl = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_R + 0.25, 64, 48),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.0,
      roughness: 1,
    }),
  );
  // cloud swirls as flattened white blobs on the surface
  const blobM = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 1,
    transparent: true,
    opacity: 0.85,
  });
  for (let i = 0; i < 90; i++) {
    const dir = V(R() - 0.5, R() * 0.9 + 0.1, R() - 0.5).normalize();
    const b = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 6), blobM);
    b.scale.set(1.5 + R() * 3.5, 0.08, 0.8 + R() * 1.6);
    b.position.copy(dir.clone().multiplyScalar(EARTH_R + 0.2)).add(V(0, -EARTH_R, 0));
    b.quaternion.setFromUnitVectors(V(0, 1, 0), dir);
    b.rotateY(R() * 6);
    space.add(b);
  }
  void cl;
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_R * 1.035, 96, 48),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      fog: false,
      vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 2.5); gl_FragColor = vec4(vec3(0.35,0.65,1.0)*f*1.6, f); #include <colorspace_fragment> }`,
    }),
  );
  atmo.position.copy(earth.position);
  space.add(atmo);
  // the Moon: grey with craters
  const mg = new THREE.SphereGeometry(MOON_R, 64, 48);
  const mp = mg.attributes.position;
  const craters = Array.from({ length: 22 }, () => [
    V(R() - 0.5, R() - 0.5, R() - 0.5).normalize(),
    0.12 + R() * 0.3,
  ]);
  const mc = [];
  const mcol = new THREE.Color();
  for (let i = 0; i < mp.count; i++) {
    const d = V(mp.getX(i), mp.getY(i), mp.getZ(i)).normalize();
    let h = 0;
    let dark = 0;
    for (const [cd, cr] of craters) {
      const q = d.distanceTo(cd) / cr;
      if (q < 1) h -= 0.18 * (1 - q * q);
      else if (q < 1.3) h += 0.08 * Math.sin(((q - 1) / 0.3) * Math.PI);
      if (q < 1) dark = Math.max(dark, 0.25 * (1 - q));
    }
    mp.setXYZ(i, d.x * (MOON_R + h), d.y * (MOON_R + h), d.z * (MOON_R + h));
    mcol.setRGB(0.72 - dark, 0.71 - dark, 0.74 - dark);
    mc.push(mcol.r, mcol.g, mcol.b);
  }
  mg.setAttribute("color", new THREE.Float32BufferAttribute(mc, 3));
  mg.computeVertexNormals();
  const moon = new THREE.Mesh(
    mg,
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }),
  );
  moon.position.copy(MOON);
  moon.name = "moon";
  space.add(moon);
  // sunlight for space (the classroom key light also shines here)
  const sun = new THREE.DirectionalLight(0xfff4e6, 1.6);
  sun.position.set(40, 30, 30);
  space.add(sun);
}

finishSet({ ground: 0x9a8a72 });
