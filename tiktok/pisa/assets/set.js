// #92 Schiefer Turm von Pisa — Piazza dei Miracoli on a warm late
// afternoon: the bright mown lawn, white marble paths, the cathedral with
// its dome and the round baptistery behind, the crenellated city wall, the
// terracotta roofs of Pisa beyond, Monte Pisano in the haze. Tourists all
// over the lawn (some doing THE photo pose), souvenir stalls, stone pines,
// pigeons. The tower itself (the subject) is built in scene.js.
import { THREE, flat, ground, onFrame, real, rng } from "./world.js";
import { SKIES, setSky, finishSet, terrain, pathStrip, F, add, birds } from "./environments.js";
import { place, stall, parasol, bench, bin } from "./props.js";

const SEED = 92;

// ---------------------------------------------------------------- light
const sky = setSky({
  ...SKIES.mittag,
  top: [0.22, 0.48, 0.86],
  mid: [0.55, 0.74, 0.94],
  hor: [1.0, 0.9, 0.76],
  below: [0.93, 0.88, 0.8],
  sun: [1.0, 0.9, 0.7],
  sunDir: [-0.75, 0.32, 0.6],
  keyPos: [-8, 10.5, 9],
  key: [0xffe7c8, 2.9],
  hemi: [0xeef4ff, 0x7f8a6a, 1.35],
  fog: [45, 160],
  clouds: 9,
  birds: false,
});

// ---------------------------------------------------------------- ground
const LAWN = 0x5f9e3f;
terrain(LAWN, { seed: SEED, amt: 0.09, warm: 0.3, hills: 11, flatR: 44, step: 3.0 });
const PATH = 0xe2dccf;
// marble paths: along the buildings and past the tower
pathStrip(
  [
    [-44, -6.5],
    [-20, -5.8],
    [-6, -4.2],
    [3.5, -3.6],
    [14, -4.4],
    [30, -6],
  ],
  { width: 2.4, color: PATH, seed: SEED },
);
pathStrip(
  [
    [7.5, 22],
    [5.6, 9],
    [3.6, 2.6],
    [2.6, -3.4],
  ],
  { width: 1.8, color: PATH, seed: SEED + 1 },
);
// the paved ring around the tower foot
{
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.15, 2.6, 64, 1),
    real.ceramic(0xdcd5c6, { roughness: 0.6, clearcoat: 0 }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.012;
  ring.receiveShadow = true;
  ground.add(ring);
}

// ---------------------------------------------------------------- marble
const marble = flat(0xf3eee3);
const stripe = flat(0x8d9399);
const lead = flat(0x8f979e);
const tile = flat(0xb4593a);

// blind arcade: a row of thin half-columns on a wall face
function arcade(g, x0, x1, y, z, h, n, r = 0.07) {
  const geo = new THREE.CylinderGeometry(r, r, h, 6);
  const mesh = new THREE.InstancedMesh(geo, marble, n);
  const m = new THREE.Matrix4();
  for (let i = 0; i < n; i++) {
    m.makeTranslation(x0 + ((x1 - x0) * (i + 0.5)) / n, y + h / 2, z);
    mesh.setMatrixAt(i, m);
  }
  mesh.castShadow = true;
  g.add(mesh);
}

// ---------------------------------------------------------------- hero: the Duomo
// long side faces the camera (+z), facade to the west (-x), dome at the crossing
{
  const g = new THREE.Group();
  const box = (w, h, d, mat, x, y, z, seed = 1) => {
    const m = F(new THREE.BoxGeometry(w, h, d, 3, 2, 2), mat, 0.035, seed);
    m.position.set(x, y + h / 2, z);
    g.add(m);
    return m;
  };
  // aisles + nave + clerestory
  box(22, 2.6, 6.4, marble, 0, 0, 0, 1);
  box(22, 1.7, 3.6, marble, 0, 2.6, 0, 2);
  // grey stripes along the walls
  for (const y of [0.9, 1.7, 3.2, 3.9]) box(22.08, 0.08, y < 2.6 ? 6.48 : 3.68, stripe, 0, y, 0, 3);
  // roofs
  const roof = (w, d, y, h) => {
    const s = new THREE.Shape();
    s.moveTo(-d / 2, 0);
    s.lineTo(0, h);
    s.lineTo(d / 2, 0);
    s.lineTo(-d / 2, 0);
    const geo = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false });
    geo.translate(0, 0, -w / 2);
    const m = F(geo, lead, 0.03, 4);
    m.rotation.y = Math.PI / 2;
    m.position.y = y;
    g.add(m);
  };
  roof(22, 3.9, 4.3, 0.9);
  // transept
  box(4.6, 3.6, 13, marble, 2.5, 0, 0, 5);
  box(4.74, 0.08, 13.1, stripe, 2.5, 1.7, 0, 6);
  // apse
  {
    const a = F(
      new THREE.CylinderGeometry(2.4, 2.4, 3.4, 16, 1, false, 0, Math.PI),
      marble,
      0.03,
      7,
    );
    a.position.set(11, 1.7, 0);
    a.rotation.y = 0;
    g.add(a);
  }
  // dome on a drum at the crossing
  {
    const drum = F(new THREE.CylinderGeometry(2.0, 2.1, 1.2, 16), marble, 0.03, 8);
    drum.position.set(2.5, 5.0, 0);
    g.add(drum);
    const dome = F(
      new THREE.SphereGeometry(2.1, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      lead,
      0.04,
      9,
    );
    dome.scale.y = 1.15;
    dome.position.set(2.5, 5.6, 0);
    g.add(dome);
    const lantern = F(new THREE.CylinderGeometry(0.25, 0.3, 0.7, 8), marble, 0.03, 10);
    lantern.position.set(2.5, 8.2, 0);
    g.add(lantern);
  }
  // facade (west): stacked galleries
  {
    const fx = -11.05;
    const fac = box(0.3, 5.6, 6.6, marble, fx, 0, 0, 11);
    fac.material = marble;
    const s = new THREE.Shape();
    s.moveTo(-3.3, 0);
    s.lineTo(0, 1.3);
    s.lineTo(3.3, 0);
    s.lineTo(-3.3, 0);
    const gable = F(
      new THREE.ExtrudeGeometry(s, { depth: 0.3, bevelEnabled: false }),
      marble,
      0.03,
      12,
    );
    gable.rotation.y = Math.PI / 2;
    gable.position.set(fx - 0.15, 5.6, 0);
    g.add(gable);
    for (let k = 0; k < 4; k++) {
      const y = 2.0 + k * 0.9;
      const half = 3.2 - k * 0.45;
      const geo = new THREE.CylinderGeometry(0.05, 0.05, 0.7, 5);
      const n = 11 - k * 2;
      const cols = new THREE.InstancedMesh(geo, marble, n);
      const m = new THREE.Matrix4();
      for (let i = 0; i < n; i++) {
        m.makeTranslation(fx - 0.3, y + 0.35, -half + (2 * half * (i + 0.5)) / n);
        cols.setMatrixAt(i, m);
      }
      g.add(cols);
      const band = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 2 * half), stripe);
      band.position.set(fx - 0.3, y + 0.74, 0);
      g.add(band);
    }
  }
  // blind arcades on the long south side
  arcade(g, -10.8, 10.6, 0.15, 3.25, 2.2, 26, 0.08);
  arcade(g, -10.8, 10.6, 2.75, 1.85, 1.3, 22, 0.06);
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = o.receiveShadow = true;
  });
  g.position.set(-17, 0, -15);
  ground.add(g);
}

// ---------------------------------------------------------------- the baptistery
{
  const g = new THREE.Group();
  const a = F(new THREE.CylinderGeometry(4.2, 4.3, 3.2, 28), marble, 0.03, 21);
  a.position.y = 1.6;
  g.add(a);
  const b = F(new THREE.CylinderGeometry(3.7, 4.0, 2.2, 28), marble, 0.03, 22);
  b.position.y = 4.3;
  g.add(b);
  for (const y of [1.0, 2.2, 3.2]) {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(4.36, 4.36, 0.08, 28), stripe);
    s.position.y = y;
    g.add(s);
  }
  const dome = F(
    new THREE.SphereGeometry(3.7, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    tile,
    0.04,
    23,
  );
  dome.scale.y = 0.9;
  dome.position.y = 5.4;
  g.add(dome);
  const cap = F(new THREE.ConeGeometry(1.4, 2.6, 14), lead, 0.04, 24);
  cap.position.y = 9.9;
  g.add(cap);
  // ring of columns on the gallery
  const n = 40;
  const cols = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.06, 0.06, 1.1, 5), marble, n);
  const m = new THREE.Matrix4();
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    m.makeTranslation(Math.cos(t) * 4.32, 2.65, Math.sin(t) * 4.32);
    cols.setMatrixAt(i, m);
  }
  g.add(cols);
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = o.receiveShadow = true;
  });
  g.position.set(-42, 0, -17);
  ground.add(g);
}

// ---------------------------------------------------------------- city wall + roofs
const brick = flat(0xb98a60);
function wall(x0, z0, x1, z1, h = 2.4) {
  const len = Math.hypot(x1 - x0, z1 - z0);
  const ang = Math.atan2(z1 - z0, x1 - x0);
  const g = new THREE.Group();
  const w = F(
    new THREE.BoxGeometry(len, h, 0.9, Math.ceil(len / 3), 2, 1),
    brick,
    0.06,
    Math.round(x0),
  );
  w.position.y = h / 2;
  g.add(w);
  const n = Math.floor(len / 1.1);
  const mer = new THREE.InstancedMesh(new THREE.BoxGeometry(0.55, 0.5, 0.95), brick, n);
  const m = new THREE.Matrix4();
  for (let i = 0; i < n; i++) {
    m.makeTranslation(-len / 2 + (i + 0.5) * 1.1, h + 0.25, 0);
    mer.setMatrixAt(i, m);
  }
  mer.castShadow = true;
  g.add(mer);
  g.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2);
  g.rotation.y = -ang;
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = o.receiveShadow = true;
  });
  ground.add(g);
}
wall(-60, -32, 40, -32);
wall(40, -32, 40, 30);
// round wall towers
for (const [x, z] of [
  [-30, -32],
  [0, -32],
  [24, -32],
  [40, -32],
  [40, -6],
  [40, 16],
]) {
  add(F(new THREE.CylinderGeometry(1.4, 1.5, 3.4, 10), brick, 0.06, x + z), x, 1.7, z);
}
// terracotta roofs of Pisa beyond the wall
{
  const r = rng(SEED + 40);
  const walls = [0xe9d6b5, 0xd9b48a, 0xf0e2c6, 0xc9956a, 0xe3c39b];
  const houses = [];
  for (let i = 0; i < 70; i++) {
    const side = i < 46;
    const x = side ? -64 + r() * 108 : 44 + r() * 18;
    const z = side ? -36 - r() * 22 : -30 + r() * 58;
    houses.push([x, z]);
  }
  houses.forEach(([x, z], i) => {
    const w = 2.5 + r() * 3.5;
    const d = 2.5 + r() * 3;
    const h = 2.6 + r() * 4.5;
    const g = new THREE.Group();
    const body = F(new THREE.BoxGeometry(w, h, d), flat(walls[i % walls.length]), 0.05, i);
    body.position.y = h / 2;
    g.add(body);
    const roof = F(new THREE.ConeGeometry(Math.max(w, d) * 0.74, 1.1, 4), tile, 0.06, i + 5);
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(w / Math.max(w, d), 1, d / Math.max(w, d));
    roof.position.y = h + 0.55;
    g.add(roof);
    g.position.set(x, 0, z);
    g.rotation.y = (r() - 0.5) * 0.3;
    ground.add(g);
  });
  // a church tower in the town
  add(F(new THREE.BoxGeometry(2, 11, 2), flat(0xc9956a), 0.04, 77), -40, 5.5, -46);
  add(F(new THREE.ConeGeometry(1.6, 2.4, 4), tile, 0.05, 78), -40, 12.2, -46);
}

// ---------------------------------------------------------------- trees
// Italian stone pines (flat umbrella crowns) and cypresses along the wall
const pineCrown = flat(0x3f6d34);
const trunkMat = flat(0x6b4a33);
function stonePine(x, z, s, seed) {
  const g = new THREE.Group();
  const tr = F(new THREE.CylinderGeometry(0.16, 0.24, 4.2, 6), trunkMat, 0.05, seed);
  tr.position.y = 2.1;
  tr.rotation.z = (seed % 3) * 0.06 - 0.06;
  g.add(tr);
  const r = rng(seed);
  for (let k = 0; k < 5; k++) {
    const c = F(new THREE.IcosahedronGeometry(1, 1), pineCrown, 0.08, seed + k);
    c.scale.set(1.9 + r() * 0.6, 0.65, 1.7 + r() * 0.6);
    c.position.set((r() - 0.5) * 2.2, 4.3 + r() * 0.5, (r() - 0.5) * 1.8);
    g.add(c);
  }
  g.scale.setScalar(s);
  g.position.set(x, 0, z);
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = o.receiveShadow = true;
  });
  ground.add(g);
  onFrame((t) => {
    g.rotation.z = Math.sin(t * 0.7 + seed) * 0.01;
  });
}
function cypress(x, z, s, seed) {
  const c = F(new THREE.ConeGeometry(0.75, 5.5, 8), flat(0x2f5a2c), 0.08, seed);
  c.scale.setScalar(s);
  add(c, x, 2.75 * s, z);
}
[
  [24, -24, 1.1],
  [30, -14, 1.2],
  [-55, -24, 1.0],
  [33, 4, 1.15],
  [-28, 20, 1.0],
  [28, 22, 1.1],
].forEach(([x, z, s], i) => stonePine(x, z, s, SEED + i * 7));
for (let i = 0; i < 9; i++) cypress(-58 + i * 4.2, -28.5, 1 + (i % 3) * 0.12, SEED + 60 + i);
for (let i = 0; i < 6; i++) cypress(35.5, -24 + i * 6, 1.05, SEED + 80 + i);

// ---------------------------------------------------------------- souvenir stalls
place(stall([0xd23b3b, 0xffffff]), 10.5, 9.5, -0.5);
place(stall([0x2f7bd6, 0xffffff]), 12.8, 6.4, -0.7);
place(stall([0x2f9e6a, 0xffffff]), 14.6, 3.0, -0.9);
place(parasol(0xd9a441), 9.0, 13.0);
place(bench(), -6.5, -3.4);
place(bench(), 8.5, -3.2);
place(bin(), -4.6, -3.4);

// ---------------------------------------------------------------- tourists
// a simple, realistic-material person; 1 unit = 8 m, so a person ~0.22 tall.
// pose: "stand", "push" (left arm up to "hold" the tower), "photo" (phone up)
const SHIRTS = [0xd94b4b, 0xf2f2f2, 0x2f6fbf, 0xf2c14e, 0x3c9a6b, 0x1f2933, 0xe58fb1, 0x7a5fb0];
const PANTS = [0x2d3e5c, 0x1f1f24, 0xd8c7a8, 0x5c6b7a, 0x3a4a3a];
const SKINS = [0xe8b394, 0xc98b65, 0x8d5a3b, 0xf1c6a8];
const geoCache = {};
const cap = (r, l) => (geoCache[r + "_" + l] ??= new THREE.CapsuleGeometry(r, l, 6, 14));
export function person({
  shirt = 0xd94b4b,
  pants = 0x2d3e5c,
  skin = 0xe8b394,
  hair = 0x3b2a1e,
  pose = "stand",
  s = 0.125,
} = {}) {
  const g = new THREE.Group();
  const sh = real.fabric(shirt);
  const pa = real.fabric(pants);
  const sk = real.skin(skin);
  const ha = real.fabric(hair, { sheen: 0.4 });
  const shoe = real.rubber(0xf4f4f4);
  const part = (geo, mat, x, y, z, rz = 0, rx = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, 0, rz);
    m.castShadow = true;
    g.add(m);
    return m;
  };
  // legs + shoes
  part(cap(0.075, 0.72), pa, -0.095, 0.47, 0);
  part(cap(0.075, 0.72), pa, 0.095, 0.47, 0);
  part(cap(0.06, 0.12), shoe, -0.095, 0.06, 0.05, 0, Math.PI / 2);
  part(cap(0.06, 0.12), shoe, 0.095, 0.06, 0.05, 0, Math.PI / 2);
  // torso, neck, head, hair
  const torso = part(cap(0.17, 0.36), sh, 0, 1.17, 0);
  torso.scale.set(1, 1, 0.68);
  part(cap(0.05, 0.06), sk, 0, 1.5, 0);
  part(new THREE.SphereGeometry(0.11, 24, 18), sk, 0, 1.63, 0);
  const hr = part(
    new THREE.SphereGeometry(0.118, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.55),
    ha,
    0,
    1.645,
    -0.012,
  );
  hr.rotation.x = -0.25;
  // arms: from the shoulder along a direction
  const arm = (side, dir) => {
    const sx = side * 0.22;
    const d = new THREE.Vector3(...dir).normalize();
    const len = 0.6;
    const a = new THREE.Mesh(cap(0.048, len - 0.1), sh);
    a.position.set(sx + (d.x * len) / 2, 1.4 + (d.y * len) / 2, (d.z * len) / 2);
    a.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
    a.castShadow = true;
    g.add(a);
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.052, 16, 12), sk);
    h.position.set(sx + d.x * (len + 0.03), 1.4 + d.y * (len + 0.03), d.z * (len + 0.03));
    h.scale.set(1, 1.25, 0.6);
    g.add(h);
    return h.position.clone();
  };
  let hand = null;
  if (pose === "push") {
    hand = arm(-1, [-0.62, 0.75, 0.12]);
    arm(1, [0.15, -1, 0.05]);
  } else if (pose === "photo") {
    arm(-1, [0.25, 0.25, 1]);
    arm(1, [-0.25, 0.25, 1]);
    const phone = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.15, 0.01), real.gloss(0x111317));
    phone.position.set(0, 1.62, 0.6);
    g.add(phone);
  } else {
    arm(-1, [-0.12, -1, 0.02]);
    arm(1, [0.12, -1, 0.02]);
  }
  g.scale.setScalar(s);
  g.userData.hand = hand ? hand.multiplyScalar(s) : null; // local hand point (scaled)
  ground.add(g);
  return g;
}

// tourists on the lawn and the paths (none on the tower's stage)
const tourists = [];
{
  const r = rng(SEED + 5);
  const spots = [
    [5.2, 6.5, "push"],
    [6.0, 7.4, "photo"],
    [-4.8, 5.6, "push"],
    [-4.2, 7.0, "photo"],
    [-7.5, 2.5, "stand"],
    [7.8, 2.2, "stand"],
    [-2.6, 9.5, "stand"],
    [3.4, 12.5, "push"],
    [2.8, 14.0, "photo"],
    [-9.5, -3.6, "stand"],
    [-12.5, -5.4, "stand"],
    [11.0, -4.0, "stand"],
    [6.2, -4.6, "stand"],
    [-1.8, -5.6, "stand"],
    [9.2, 11.2, "stand"],
    [11.5, 8.0, "stand"],
    [-10.5, 9.0, "push"],
    [-11.4, 10.2, "photo"],
  ];
  spots.forEach(([x, z, pose], i) => {
    const p = person({
      shirt: SHIRTS[i % SHIRTS.length],
      pants: PANTS[i % PANTS.length],
      skin: SKINS[i % SKINS.length],
      hair: [0x2b1d14, 0x6b4a2b, 0xd8b26a, 0x111111][i % 4],
      pose,
    });
    p.position.set(x, 0, z);
    // pushers face the camera with the tower behind them; photographers face the pushers
    p.rotation.y = pose === "photo" ? Math.PI + (r() - 0.5) * 0.3 : (r() - 0.5) * 0.8;
    if (pose === "photo") p.lookAt(spots[i - 1][0], 0, spots[i - 1][1]);
    tourists.push({ p, x, z, pose, seed: i });
  });
  // a few walkers drifting along the main path
  for (let k = 0; k < 4; k++) {
    const p = person({ shirt: SHIRTS[(k + 3) % 8], pants: PANTS[k % 5], skin: SKINS[(k + 1) % 4] });
    tourists.push({ p, walk: true, seed: 30 + k });
  }
  onFrame((t) => {
    for (const tr of tourists) {
      if (tr.walk) {
        const u = ((t * 0.05 + tr.seed * 0.23) % 1) * 2 - 1;
        const x = u * 22;
        tr.p.position.set(
          x,
          Math.abs(Math.sin(t * 6 + tr.seed)) * 0.006,
          -4.6 + (tr.seed % 2) * 0.8,
        );
        tr.p.rotation.y = Math.PI / 2;
      } else if (tr.pose === "stand") {
        tr.p.rotation.y = Math.sin(t * 0.4 + tr.seed) * 0.5;
      }
    }
  });
}
export { tourists };

// ---------------------------------------------------------------- life
birds(6); // pigeons circling over the piazza

finishSet({ ground: LAWN });
export { sky };
