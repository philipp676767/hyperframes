// #38 Knicklicht — the world: a Halloween front yard at night. A wooden
// house with a lit porch behind the stage, carved pumpkins glowing all
// around, crooked bare trees, cardboard gravestones, a picket fence, the
// neighbours' windows on the hill, a huge moon with bats, ground fog
// creeping over the lawn. Near-black + orange, so the neon green of the
// glow stick is the only cold colour in the picture.
import { THREE, flat, ground, onFrame, rng, facet, facetMat, V } from "./world.js";
import {
  SKIES,
  setSky,
  finishSet,
  terrain,
  pathStrip,
  lightString,
  pine,
  F,
  add,
} from "./environments.js";
import { place, fence } from "./props.js";

const SEED = 38;
const r = rng(SEED);

// ---------------------------------------------------------------- light
// deep violet night, a faint orange glow on the horizon (the town), stars
setSky({
  ...SKIES.nacht,
  top: [0.04, 0.03, 0.12],
  mid: [0.12, 0.07, 0.26],
  hor: [0.42, 0.2, 0.3],
  below: [0.06, 0.04, 0.1],
  sun: [0.9, 0.85, 0.6],
  sunDir: [0.22, 0.34, -1],
  stars: 0.9,
  clouds: 6,
  cloud: [0x3a2f55, 0x1c1630],
  hemi: [0x8f86d8, 0x1d1a2a, 0.9],
  key: [0xbfc4ff, 1.15],
  keyPos: [5, 12, 6],
  rim: [0xff9a4a, 0.9],
  fog: [22, 85],
  birds: false,
});

// the moon: big, low behind the house, with a soft halo
{
  const moon = new THREE.Mesh(
    new THREE.IcosahedronGeometry(9, 2),
    new THREE.MeshBasicMaterial({ color: 0xfff1c4, fog: false }),
  );
  moon.position.set(34, 52, -150);
  moon.userData.noAO = true;
  ground.add(moon);
  const halo = new THREE.Mesh(
    new THREE.CircleGeometry(22, 32),
    new THREE.MeshBasicMaterial({
      color: 0xffd89a,
      transparent: true,
      opacity: 0.12,
      fog: false,
      depthWrite: false,
    }),
  );
  halo.position.set(34, 52, -152);
  halo.lookAt(0, 2, 0);
  ground.add(halo);
  // craters
  for (let i = 0; i < 6; i++) {
    const c = new THREE.Mesh(
      new THREE.CircleGeometry(1 + r() * 1.6, 8),
      new THREE.MeshBasicMaterial({ color: 0xe8d8a8, fog: false }),
    );
    c.position.set(34 + (r() - 0.5) * 10, 52 + (r() - 0.5) * 10, -141);
    c.lookAt(0, 2, 0);
    ground.add(c);
  }
}

// ---------------------------------------------------------------- ground
terrain(0x2c4a3c, {
  seed: SEED,
  amt: 0.14,
  warm: 0.2,
  hills: 6,
  height: (x, z, d) =>
    (z < -30 ? Math.min(9, (-z - 30) * 0.35) : 0) + (d > 40 ? (d - 40) * 0.12 : 0),
});
// flagstone path from the gate past the stage to the porch steps
pathStrip(
  [
    [1.2, 16],
    [2.0, 8],
    [-7.4, 1],
    [-7.8, -6],
    [-2.4, -10.5],
  ],
  { width: 1.5, color: 0x8b8494, seed: SEED },
);
// fallen leaves: orange / brown / red flakes all over the lawn
{
  const n = 520;
  const geo = new THREE.CircleGeometry(0.09, 5);
  geo.rotateX(-Math.PI / 2);
  const im = new THREE.InstancedMesh(geo, flat(0xffffff), n);
  const cols = [0xd8742a, 0xb5451f, 0xe2a23a, 0x8a4a22];
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2;
    const d = 1.6 + Math.pow(r(), 0.8) * 22;
    q.setFromEuler(new THREE.Euler((r() - 0.5) * 0.4, r() * 6, (r() - 0.5) * 0.4));
    const s = 0.6 + r() * 1.1;
    m4.compose(V(Math.cos(a) * d, 0.03, Math.sin(a) * d), q, V(s, 1, s * 0.7));
    im.setMatrixAt(i, m4);
    im.setColorAt(i, c.setHex(cols[i % 4]));
  }
  im.receiveShadow = true;
  ground.add(im);
}

// lamps / windows / pumpkin faces that go dark on "stockdunkel" (scene.js
// calls setPartyLights(k), k = 0..1)
const glowMats = [];
const glowLights = [];
const glowMat = (c, i = 1.6) => {
  const m = flat(c, { emissive: c, emissiveIntensity: i });
  m.userData.on = i;
  glowMats.push(m);
  return m;
};
export function setPartyLights(k) {
  for (const m of glowMats) m.emissiveIntensity = m.userData.on * k;
  for (const l of glowLights) l.intensity = l.userData.on * k;
}

// ---------------------------------------------------------------- pumpkins
// ribbed, slightly squashed, a carved face that glows from inside
const faceMat = flat(0xffa21f, { emissive: 0xffa21f, emissiveIntensity: 2.2 });
const pumpkinMat = facetMat(flat(0xe8731c, { roughness: 0.6 }));
function pumpkin(seed, s = 1, carved = true) {
  const g = new THREE.Group();
  const geo = new THREE.SphereGeometry(0.5, 16, 10);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const z = p.getZ(i);
    const a = Math.atan2(z, x);
    const k = 1 + 0.07 * Math.cos(a * 8);
    p.setXYZ(i, x * k, p.getY(i) * 0.78, z * k);
  }
  geo.computeVertexNormals();
  const body = new THREE.Mesh(facet(geo, 0.06, seed), pumpkinMat);
  body.position.y = 0.38;
  body.castShadow = body.receiveShadow = true;
  g.add(body);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.22, 6), flat(0x4f6b2a));
  stem.position.set(0, 0.8, 0);
  stem.rotation.z = 0.25;
  g.add(stem);
  if (carved) {
    const tri = (pts) => {
      const sh = new THREE.Shape();
      sh.moveTo(pts[0][0], pts[0][1]);
      for (const q of pts.slice(1)) sh.lineTo(q[0], q[1]);
      const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), faceMat);
      m.position.z = 0.53;
      m.userData.noAO = true;
      g.add(m);
    };
    tri([
      [-0.26, 0.46],
      [-0.08, 0.46],
      [-0.17, 0.62],
    ]);
    tri([
      [0.08, 0.46],
      [0.26, 0.46],
      [0.17, 0.62],
    ]);
    tri([
      [-0.3, 0.3],
      [-0.18, 0.2],
      [-0.06, 0.27],
      [0.06, 0.2],
      [0.18, 0.27],
      [0.3, 0.3],
      [0.18, 0.12],
      [-0.18, 0.12],
    ]);
  }
  g.scale.setScalar(s);
  return g;
}
const PUMPKINS = [
  [-6.2, 2.6, 0.5, 1.15],
  [-7.0, 3.4, 0.2, 0.75],
  [7.2, 1.2, -0.5, 1.25],
  [8.0, 2.4, -0.7, 0.8],
  [-4.4, -6.6, 0.3, 0.9],
  [3.6, -7.2, -0.2, 1.0],
  [-1.6, -11.2, 0.1, 0.9],
  [1.0, -11.4, -0.1, 1.0],
  [10.5, -4, -0.9, 1.1],
  [-11.5, -2.5, 0.9, 1.2],
];
PUMPKINS.forEach(([x, z, rot, s], i) => place(pumpkin(SEED + i, s, i !== 3), x, z, rot));
// two of them light the lawn for real
for (const [x, z] of [
  [-6.2, 2.6],
  [7.2, 1.2],
]) {
  const l = new THREE.PointLight(0xff8a2a, 4, 7, 1.6);
  l.position.set(x, 0.6, z + 0.6);
  l.userData.on = 4;
  glowLights.push(l);
  ground.add(l);
}
// candles flicker inside the pumpkins (k = how bright the yard is; called
// from renderAt with t so the flicker stays a pure function of time)
export function setPumpkins(k, t) {
  const f = 0.82 + 0.12 * Math.sin(t * 13.1) + 0.06 * Math.sin(t * 29.7 + 1);
  faceMat.emissiveIntensity = 2.2 * f * k;
}

// ---------------------------------------------------------------- bare trees
const barkMat = facetMat(flat(0x2a2130, { roughness: 1 }));
function bareTree(seed, s = 1) {
  const rr = rng(seed);
  const g = new THREE.Group();
  const branch = (parent, len, rad, depth) => {
    const geo = new THREE.CylinderGeometry(rad * 0.6, rad, len, 6);
    geo.translate(0, len / 2, 0);
    const m = new THREE.Mesh(facet(geo, 0.08, depth * 7 + seed), barkMat);
    m.castShadow = true;
    parent.add(m);
    if (depth > 0) {
      const n = depth === 3 ? 3 : 2;
      for (let i = 0; i < n; i++) {
        const c = new THREE.Group();
        c.position.y = len * (0.55 + rr() * 0.4);
        c.rotation.set((rr() - 0.5) * 1.2, rr() * Math.PI * 2, 0.5 + rr() * 0.5);
        m.add(c);
        branch(c, len * (0.55 + rr() * 0.2), rad * 0.55, depth - 1);
      }
    }
  };
  branch(g, 2.6, 0.32, 3);
  g.rotation.z = (rr() - 0.5) * 0.15;
  g.scale.setScalar(s);
  return g;
}
[
  [-12.5, -9, 1.25],
  [13.5, -10, 1.35],
  [-15, 6, 1.1],
  [16, 5.5, 1.0],
  [-20, -16, 1.4],
  [21, -17, 1.3],
].forEach(([x, z, s], i) => place(bareTree(SEED + i * 5, s), x, z, r() * 6));

// ---------------------------------------------------------------- gravestones
function grave(seed, txt) {
  const g = new THREE.Group();
  const sh = new THREE.Shape();
  sh.moveTo(-0.4, 0);
  sh.lineTo(-0.4, 0.75);
  sh.absarc(0, 0.75, 0.4, Math.PI, 0, true);
  sh.lineTo(0.4, 0);
  sh.lineTo(-0.4, 0);
  const stone = new THREE.Mesh(
    facet(new THREE.ExtrudeGeometry(sh, { depth: 0.16, bevelEnabled: false }), 0.07, seed),
    facetMat(flat(0x7d7889)),
  );
  stone.position.z = -0.08;
  stone.castShadow = stone.receiveShadow = true;
  g.add(stone);
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 64;
  const x = c.getContext("2d");
  x.fillStyle = "#3b3746";
  x.font = "800 44px Montserrat, sans-serif";
  x.textAlign = "center";
  x.fillText(txt, 64, 48);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const plate = new THREE.Mesh(
    new THREE.PlaneGeometry(0.6, 0.3),
    new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 1 }),
  );
  plate.position.set(0, 0.72, 0.09);
  g.add(plate);
  return g;
}
place(grave(1, "RIP"), -9.5, -6.5, 0.35);
place(grave(2, "BUH"), 9.8, -7.2, -0.3);
place(grave(3, "RIP"), -11.8, 1.5, 0.9, 0.85);
place(grave(4, "RIP"), 12.2, -1.2, -0.8, 0.9);

// ---------------------------------------------------------------- fence + gate
{
  const f1 = fence(10, 0xd9d2e3);
  place(f1, -7.5, 14, 0);
  const f2 = fence(10, 0xd9d2e3);
  place(f2, 10.5, 14, 0);
}

// ---------------------------------------------------------------- hero: the house
// a wooden two-storey house with a porch, warm windows, a lit door, a
// witch's wreath of string lights over the porch
const houseZ = -16;
{
  const g = new THREE.Group();
  const wall = facetMat(flat(0x4b3f5e));
  const trim = flat(0x2a2236);
  const body = new THREE.Mesh(facet(new THREE.BoxGeometry(11, 6, 6, 4, 3, 2), 0.04, 3), wall);
  body.position.y = 3;
  body.castShadow = body.receiveShadow = true;
  g.add(body);
  // siding lines
  for (let y = 0.6; y < 6; y += 0.5) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(11.04, 0.05, 6.04), trim);
    s.position.y = y;
    g.add(s);
  }
  // gable roof
  const rs = new THREE.Shape();
  rs.moveTo(-6, 0);
  rs.lineTo(0, 3.6);
  rs.lineTo(6, 0);
  rs.lineTo(-6, 0);
  const roof = new THREE.Mesh(
    facet(new THREE.ExtrudeGeometry(rs, { depth: 7, bevelEnabled: false }), 0.06, 7),
    facetMat(flat(0x241c2c)),
  );
  roof.position.set(0, 6, -3.5);
  roof.castShadow = true;
  g.add(roof);
  // round attic window
  const attic = new THREE.Mesh(new THREE.CircleGeometry(0.55, 12), glowMat(0xffb347, 1.4));
  attic.position.set(0, 7.4, 3.52);
  g.add(attic);
  // chimney
  const ch = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.4, 0.9), flat(0x5a3b36));
  ch.position.set(3.4, 8.2, -1);
  ch.castShadow = true;
  g.add(ch);
  // windows: frame + glowing pane + a cross bar
  const win = (x, y, on) => {
    const fr = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.55, 0.12), flat(0xe8dfd0));
    fr.position.set(x, y, 3.04);
    g.add(fr);
    const pane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.0, 1.3),
      on ? glowMat(0xffb04a, 1.5) : flat(0x1b1828),
    );
    pane.position.set(x, y, 3.11);
    g.add(pane);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.07, 0.04), flat(0xe8dfd0));
    bar.position.set(x, y, 3.13);
    g.add(bar);
    const bar2 = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.3, 0.04), flat(0xe8dfd0));
    bar2.position.set(x, y, 3.13);
    g.add(bar2);
  };
  win(-3.6, 1.9, true);
  win(3.6, 1.9, true);
  win(-3.6, 4.4, false);
  win(0, 4.4, true);
  win(3.6, 4.4, true);
  // door
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.3, 0.1), flat(0x7a2f2a));
  door.position.set(0, 1.15, 3.06);
  g.add(door);
  const doorGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), glowMat(0xffc46b, 1.6));
  doorGlow.position.set(0, 1.85, 3.12);
  g.add(doorGlow);
  // porch: floor, steps, posts, roof
  const deck = new THREE.Mesh(
    facet(new THREE.BoxGeometry(7, 0.4, 2.4), 0.05, 9),
    facetMat(flat(0x6b4a3a)),
  );
  deck.position.set(0, 0.2, 4.2);
  deck.castShadow = deck.receiveShadow = true;
  g.add(deck);
  for (let i = 0; i < 2; i++) {
    const st = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.2, 0.45), flat(0x5a3d30));
    st.position.set(0, 0.1 + i * 0.0, 5.6 + (1 - i) * 0.4);
    st.scale.y = 1 - i * 0.4;
    g.add(st);
  }
  for (const x of [-3.3, -1.1, 1.1, 3.3]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.6, 0.18), flat(0xe8dfd0));
    post.position.set(x, 1.7, 5.3);
    post.castShadow = true;
    g.add(post);
  }
  const proof = new THREE.Mesh(
    facet(new THREE.BoxGeometry(7.6, 0.25, 2.8), 0.05, 4),
    facetMat(flat(0x241c2c)),
  );
  proof.position.set(0, 3.1, 4.3);
  proof.rotation.x = 0.12;
  proof.castShadow = true;
  g.add(proof);
  // porch lantern
  const lan = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.4, 0.28), glowMat(0xffc46b, 2.0));
  lan.position.set(1.0, 2.5, 3.3);
  g.add(lan);
  g.position.set(0, 0, houseZ);
  ground.add(g);
  const pl = new THREE.PointLight(0xffa64a, 9, 14, 1.4);
  pl.position.set(0, 2.6, houseZ + 5.4);
  pl.userData.on = 9;
  glowLights.push(pl);
  ground.add(pl);
}
// party lights: orange + purple, from the porch to the trees and over the lawn
lightString([-3.6, 3.0, houseZ + 5.6], [-12.2, 3.6, -9.4], {
  n: 16,
  sag: 0.8,
  colors: [0xff8a1f, 0xb46bff],
  glow: 2.0,
});
lightString([3.6, 3.0, houseZ + 5.6], [13.2, 3.8, -10.2], {
  n: 16,
  sag: 0.8,
  colors: [0xb46bff, 0xff8a1f],
  glow: 2.0,
});
lightString([-12.2, 3.6, -9.4], [-15, 3.0, 5.6], { n: 18, sag: 0.9, colors: [0xff8a1f, 0xb46bff] });

// ---------------------------------------------------------------- far layer
// the neighbours on the hill: dark houses, a few warm windows; pines
{
  const nb = (x, z, w, h, seed) => {
    const rr = rng(seed);
    const g = new THREE.Group();
    const b = new THREE.Mesh(
      facet(new THREE.BoxGeometry(w, h, 4), 0.04, seed),
      facetMat(flat(0x2c2540)),
    );
    b.position.y = h / 2;
    g.add(b);
    const rs = new THREE.Shape();
    rs.moveTo(-w / 2 - 0.3, 0);
    rs.lineTo(0, w * 0.35);
    rs.lineTo(w / 2 + 0.3, 0);
    rs.lineTo(-w / 2 - 0.3, 0);
    const roof = new THREE.Mesh(
      new THREE.ExtrudeGeometry(rs, { depth: 4.4, bevelEnabled: false }),
      flat(0x1a1424),
    );
    roof.position.set(0, h, -2.2);
    g.add(roof);
    for (let i = 0; i < 4; i++) {
      if (rr() < 0.45) continue;
      const wdw = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.9), glowMat(0xffb85a, 1.3));
      wdw.position.set(-w / 2 + 1 + (i % 2) * (w - 2), 1.4 + Math.floor(i / 2) * 1.7, 2.02);
      g.add(wdw);
    }
    g.position.set(x, 0, z);
    g.lookAt(0, 0, 0);
    ground.add(g);
  };
  const ROW = [
    [-30, -32, 7, 5],
    [-18, -36, 6, 6],
    [18, -36, 7, 5],
    [31, -31, 6, 6.5],
    [-42, -20, 6, 5],
    [43, -18, 7, 5.5],
  ];
  ROW.forEach(([x, z, w, h], i) => {
    const y = z < -30 ? Math.min(9, (-z - 30) * 0.35) : 0;
    nb(x, z, w, h, SEED + 40 + i);
    ground.children[ground.children.length - 1].position.y = y;
  });
  for (let i = 0; i < 22; i++) {
    const a = -Math.PI * 0.95 + (i / 21) * Math.PI * 0.9;
    const d = 46 + r() * 10;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    pine(x, z, 2.2 + r() * 1.4, SEED + 60 + i);
  }
}

// ---------------------------------------------------------------- life
// bats circling the moon side of the sky
{
  const batMat = flat(0x0d0a12);
  const bats = [];
  for (let i = 0; i < 7; i++) {
    const b = new THREE.Group();
    const bodyM = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 4), batMat);
    b.add(bodyM);
    const wing = (side) => {
      const sh = new THREE.Shape();
      sh.moveTo(0, 0);
      sh.lineTo(side * 0.9, 0.25);
      sh.lineTo(side * 0.7, -0.05);
      sh.lineTo(side * 0.45, 0.05);
      sh.lineTo(side * 0.3, -0.12);
      sh.lineTo(0, 0);
      const w = new THREE.Mesh(
        new THREE.ShapeGeometry(sh),
        new THREE.MeshBasicMaterial({ color: 0x0d0a12, side: THREE.DoubleSide }),
      );
      w.rotation.x = -Math.PI / 2;
      const p = new THREE.Group();
      p.add(w);
      b.add(p);
      return p;
    };
    b.userData = {
      l: wing(-1),
      r: wing(1),
      ph: i * 1.7,
      rad: 6 + (i % 3) * 3,
      y: 9 + (i % 4) * 2.2,
    };
    b.scale.setScalar(1.6);
    bats.push(b);
    ground.add(b);
  }
  onFrame((t) => {
    for (const b of bats) {
      const u = b.userData;
      const a = t * 0.45 + u.ph;
      b.position.set(
        8 + Math.cos(a) * u.rad,
        u.y + Math.sin(t * 1.3 + u.ph) * 0.6,
        -22 + Math.sin(a) * u.rad * 0.6,
      );
      b.rotation.y = -a;
      const f = Math.sin(t * 16 + u.ph) * 0.7;
      u.l.rotation.z = f;
      u.r.rotation.z = -f;
    }
  });
}
// ground fog: big flat soft blobs drifting slowly over the lawn
{
  const fogMat = new THREE.MeshBasicMaterial({
    color: 0xb9b0e0,
    transparent: true,
    opacity: 0.07,
    depthWrite: false,
  });
  const blobs = [];
  for (let i = 0; i < 26; i++) {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), fogMat);
    const a = r() * Math.PI * 2;
    const d = 5 + r() * 16;
    m.scale.set(2.6 + r() * 2, 0.35, 1.8 + r() * 1.5);
    m.userData = { x: Math.cos(a) * d, z: Math.sin(a) * d, ph: r() * 6 };
    m.userData.noAO = true;
    blobs.push(m);
    ground.add(m);
  }
  onFrame((t) => {
    for (const m of blobs) {
      const u = m.userData;
      m.position.set(
        u.x + Math.sin(t * 0.15 + u.ph) * 1.6,
        0.25,
        u.z + Math.cos(t * 0.11 + u.ph) * 1.2,
      );
    }
  });
}
// hay bale + stacked pumpkins by the porch (decor)
{
  const hay = F(new THREE.BoxGeometry(1.6, 0.8, 0.9, 3, 2, 2), flat(0xd8b456), 0.08, 5);
  hay.castShadow = true;
  add(hay, 5.6, 0.4, -10.6);
  place(pumpkin(SEED + 50, 0.8), 5.4, -10.6, 0.2, 1, 0.8);
  place(pumpkin(SEED + 51, 0.6, false), 6.1, -10.4, -0.3, 1, 0.8);
}

finishSet({ ground: 0x22302a });
