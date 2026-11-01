// #43 "Was passiert, wenn du die Nacht durchmachst?" — a WG roof terrace
// in Vienna at 4:30 a.m.: wooden deck six storeys up, fairy lights between
// poles, speakers, a drinks table with empty cans, potted plants; around it
// the old-town roofs (some windows still lit), chimney smoke, a Gothic
// church spire as the hero piece against the first orange band of dawn,
// the Kahlenberg hills far behind, the street with its lamps far below.
import { THREE, V, rng, flat, ground, onFrame, facet, facetMat, patches, noise2 } from "./world.js";
import { setSky, finishSet, F, add, discGeo, lightString, fireflies } from "./environments.js";
import { place, crate, planter, bush } from "./props.js";

const SEED = 43;
const r = rng(SEED);
const m4 = new THREE.Matrix4();
const col = new THREE.Color();

// the roof deck we stand on is y = 0; the street is far below
export const STREET_Y = -15;
export const DECK = { x0: -11, x1: 11, z0: -8.5, z1: 7.5 };

// ---------------------------------------------------------------- light
// blue hour just before dawn: deep navy on top, violet, an orange band at
// the horizon behind the spire; the "sun" sits just under the horizon
setSky({
  top: [0.05, 0.07, 0.22],
  mid: [0.2, 0.2, 0.46],
  hor: [1.0, 0.56, 0.36],
  below: [0.16, 0.15, 0.3],
  sun: [1.0, 0.62, 0.38],
  cloud: [0x8f86c2, 0x4a3f86],
  hemi: [0xa8a8ff, 0x3a2f4a, 1.15],
  key: [0xffc8a0, 1.9],
  keyPos: [-5, 9, -10],
  rim: [0x7f9bff, 1.1],
  sunDir: [0.18, 0.02, -1],
  stars: 0.45,
  clouds: 9,
  birds: true,
  fog: [42, 150],
  nightWindows: true,
});

// ---------------------------------------------------------------- the street far below
{
  const geo = discGeo(95, 3.4, SEED);
  const m = new THREE.Mesh(
    patches(facet(geo, 0.05, SEED), { amt: 0.1, scale: 0.08, seed: SEED, warm: 0.2 }),
    facetMat(flat(0x4a4658)),
  );
  m.position.y = STREET_Y;
  m.receiveShadow = true;
  ground.add(m);
  // the road in front of our house + its markings
  add(
    new THREE.Mesh(new THREE.BoxGeometry(160, 0.05, 6), flat(0x34323e)),
    0,
    STREET_Y + 0.03,
    13,
    false,
  );
  for (let x = -78; x < 78; x += 3.4)
    add(
      new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.02, 0.14), flat(0xf4f1ea)),
      x,
      STREET_Y + 0.07,
      13,
      false,
    );
  add(
    new THREE.Mesh(new THREE.BoxGeometry(160, 0.2, 2.2), flat(0x9a94a0)),
    0,
    STREET_Y + 0.1,
    9.0,
    false,
  );
  add(
    new THREE.Mesh(new THREE.BoxGeometry(160, 0.2, 2.2), flat(0x9a94a0)),
    0,
    STREET_Y + 0.1,
    17.0,
    false,
  );
  // street lamps glowing along the pavement
  const lampMat = flat(0xffd890, { emissive: 0xffc070, emissiveIntensity: 1.6 });
  for (let x = -40; x <= 40; x += 10)
    for (const z of [9.6, 16.4]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 3.6, 6), flat(0x2f3440));
      add(post, x + (z > 12 ? 5 : 0), STREET_Y + 1.8, z, false);
      const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.24, 0), lampMat);
      head.userData.noAO = true;
      add(head, x + (z > 12 ? 5 : 0), STREET_Y + 3.65, z, false);
    }
}

// ---------------------------------------------------------------- old-town houses
const pastel = [0xe9c2a8, 0xf2dcb0, 0xc6cbe0, 0xd2bfd9, 0xb8d6c6, 0xf0e4c0, 0xe7b5b8];
const roofCols = [0xa8503a, 0x8a5a4a, 0x6f6470, 0xb8653f, 0x5f7f7a];
const lit = [];
const dark = [];
const frames = [];
const smokeFrom = [];
function house(x, z, w, d, top, rotY, chimney = true) {
  const h = top - STREET_Y;
  const g = new THREE.Group();
  const wall = pastel[Math.floor(r() * pastel.length)];
  const body = new THREE.Mesh(
    facet(new THREE.BoxGeometry(w, h, d), 0.03, Math.floor(r() * 99)),
    facetMat(flat(wall)),
  );
  body.position.y = h / 2;
  body.castShadow = body.receiveShadow = true;
  g.add(body);
  const trim = flat(new THREE.Color(wall).multiplyScalar(0.8));
  const cornice = new THREE.Mesh(new THREE.BoxGeometry(w + 0.25, 0.3, d + 0.25), trim);
  cornice.position.y = h - 0.15;
  g.add(cornice);
  // pitched Viennese roof (hip-ish: extruded gable), tiles in rows
  const rh = Math.min(3.2, d * 0.45);
  const rs = new THREE.Shape();
  rs.moveTo(-d / 2 - 0.25, 0);
  rs.lineTo(0, rh);
  rs.lineTo(d / 2 + 0.25, 0);
  rs.lineTo(-d / 2 - 0.25, 0);
  const roof = new THREE.Mesh(
    facet(
      new THREE.ExtrudeGeometry(rs, { depth: w + 0.2, bevelEnabled: false }),
      0.06,
      7 + Math.floor(r() * 9),
    ),
    facetMat(flat(roofCols[Math.floor(r() * roofCols.length)], { roughness: 0.8 })),
  );
  roof.rotation.y = Math.PI / 2;
  roof.position.set(-w / 2 - 0.1, h, 0);
  roof.castShadow = true;
  g.add(roof);
  // dormer windows on the roof
  const nd = Math.max(1, Math.floor(w / 3.2));
  for (let i = 0; i < nd; i++) {
    const dx = -((nd - 1) * 3.2) / 2 + i * 3.2;
    const dm = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.8, 0.9),
      flat(new THREE.Color(wall).multiplyScalar(0.92)),
    );
    dm.position.set(dx, h + 0.6, d / 4 + 0.15);
    g.add(dm);
    frames.push({ g, x: dx, y: h + 0.62, z: d / 4 + 0.62, s: 0.7 });
    (r() < 0.35 ? lit : dark).push({ g, x: dx, y: h + 0.62, z: d / 4 + 0.65, s: 0.7 });
  }
  if (chimney) {
    const cx = (r() - 0.5) * (w - 1.5);
    const ch = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.6, 0.5), flat(0x9a8078));
    ch.position.set(cx, h + rh * 0.55 + 0.4, -0.3);
    ch.castShadow = true;
    g.add(ch);
    smokeFrom.push({ g, p: V(cx, h + rh * 0.55 + 1.3, -0.3) });
  }
  // windows: the top three floors are what we see from the terrace
  const cols = Math.max(1, Math.floor((w - 0.6) / 1.25));
  for (let fy = h - 1.7; fy > Math.max(1.5, h - 13); fy -= 2.1)
    for (let cx = 0; cx < cols; cx++) {
      const wx = -((cols - 1) * 1.25) / 2 + cx * 1.25;
      frames.push({ g, x: wx, y: fy, z: d / 2 + 0.02, s: 1 });
      (r() < 0.22 ? lit : dark).push({ g, x: wx, y: fy, z: d / 2 + 0.05, s: 1 });
    }
  g.position.set(x, STREET_Y, z);
  g.rotation.y = rotY;
  ground.add(g);
}
// back row (beyond the terrace), facing us
for (let x = -62; x < 62; ) {
  const w = 6 + r() * 4;
  house(x + w / 2, -22 - r() * 3, w, 8, -3.5 + r() * 4.5, 0);
  x += w + 0.3;
}
// a second, higher row further back
for (let x = -70; x < 70; ) {
  const w = 7 + r() * 5;
  house(x + w / 2, -38 - r() * 4, w, 9, -1 + r() * 6, 0, r() < 0.6);
  x += w + 0.6;
}
// side rows, facing the centre
for (const side of [-1, 1])
  for (let z = -16; z < 24; ) {
    const w = 6 + r() * 3;
    house(side * (22 + r() * 2), z + w / 2, w, 8, -4 + r() * 4, (-side * Math.PI) / 2);
    z += w + 0.4;
  }
// across the street (front, lower so the drone outro looks over them)
for (let x = -60; x < 60; ) {
  const w = 6 + r() * 4;
  house(x + w / 2, 24 + r() * 2, w, 8, -6 + r() * 3, Math.PI, r() < 0.5);
  x += w + 0.4;
}
const inst = (list, w, h, depth, mat) => {
  const im = new THREE.InstancedMesh(
    new THREE.BoxGeometry(w, h, depth),
    mat,
    Math.max(1, list.length),
  );
  list.forEach((o, i) => {
    o.g.updateMatrixWorld();
    m4.compose(V(o.x, o.y, o.z), new THREE.Quaternion(), V(o.s, o.s, 1)).premultiply(
      o.g.matrixWorld,
    );
    im.setMatrixAt(i, m4);
  });
  im.count = list.length;
  ground.add(im);
  return im;
};
inst(frames, 0.8, 1.15, 0.05, flat(0xf6f1ea));
inst(
  lit,
  0.62,
  0.95,
  0.06,
  flat(0xffd27a, { emissive: 0xffb04d, emissiveIntensity: 1.0 }),
).userData.noAO = true;
inst(dark, 0.62, 0.95, 0.06, flat(0x262c4a, { roughness: 0.15, metalness: 0.35 }));

// chimney smoke drifting from a handful of roofs (deterministic)
{
  const smokeMat = new THREE.MeshStandardMaterial({
    color: 0xc9c4dc,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    flatShading: true,
  });
  const picks = smokeFrom.filter((_, i) => i % 4 === 1).slice(0, 7);
  const puffs = [];
  for (const s of picks) {
    s.g.updateMatrixWorld();
    const at = s.p.clone().applyMatrix4(s.g.matrixWorld);
    for (let i = 0; i < 7; i++) {
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4, 0), smokeMat.clone());
      m.userData.noAO = true;
      ground.add(m);
      puffs.push({ m, at, ph: i / 7 });
    }
  }
  onFrame((t) => {
    for (const { m, at, ph } of puffs) {
      const k = (t * 0.12 + ph) % 1;
      m.position.copy(at).add(V(k * 2.4 + Math.sin(k * 6 + ph * 9) * 0.25, k * 5, -k * 0.8));
      m.scale.setScalar(0.5 + k * 1.8);
      m.material.opacity = 0.45 * Math.sin(Math.PI * Math.min(1, k * 1.3));
    }
  });
}

// ---------------------------------------------------------------- hero piece: the spire
// A Gothic cathedral tower (Stephansdom-like) right behind the stage, dark
// against the orange band of dawn, with a lit clock face.
{
  const g = new THREE.Group();
  const stone = flat(0xb9a99a, { roughness: 0.85 });
  const stoneD = flat(0x8f8078, { roughness: 0.85 });
  const tiers = [
    [7.0, 9],
    [5.6, 9],
    [4.4, 7],
  ];
  let y = 0;
  tiers.forEach(([w, h], i) => {
    const b = F(new THREE.BoxGeometry(w, h, w), i % 2 ? stoneD : stone, 0.04, 30 + i);
    b.position.y = y + h / 2;
    g.add(b);
    // corner pinnacles
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        const p = F(new THREE.ConeGeometry(0.35, 2.2, 4), stoneD, 0.05, 40 + i);
        p.position.set((sx * w) / 2, y + h + 1.1, (sz * w) / 2);
        g.add(p);
      }
    // tall lancet windows
    for (const sx of [-1, 0, 1]) {
      const win = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, h * 0.55, 0.1),
        flat(0x2a2f4e, { roughness: 0.2 }),
      );
      win.position.set(sx * w * 0.28, y + h * 0.5, w / 2 + 0.03);
      g.add(win);
    }
    y += h;
  });
  // the clock face, lit
  const clock = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 1.1, 0.1, 20),
    flat(0xfff0c8, { emissive: 0xffd28a, emissiveIntensity: 0.9 }),
  );
  clock.rotation.x = Math.PI / 2;
  clock.position.set(0, 18 + 2.6, 2.86);
  clock.userData.noAO = true;
  g.add(clock);
  for (const [len, a] of [
    [0.75, -Math.PI / 2 + 0.2],
    [0.55, Math.PI / 3],
  ]) {
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.08, len, 0.04), flat(0x1e1e2a));
    hand.geometry.translate(0, len / 2, 0);
    hand.position.set(0, 20.6, 2.95);
    hand.rotation.z = a;
    g.add(hand);
  }
  // the spire with its crockets
  const spire = F(new THREE.ConeGeometry(2.3, 16, 8), stone, 0.05, 50);
  spire.position.y = y + 8;
  g.add(spire);
  for (let k = 0; k < 6; k++) {
    const ky = y + 1.5 + k * 2.2;
    const rad = 2.1 * (1 - (ky - y) / 16);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + k * 0.4;
      const c = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.6, 4), stoneD);
      c.position.set(Math.cos(a) * rad, ky, Math.sin(a) * rad);
      g.add(c);
    }
  }
  const tip = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.35, 0),
    flat(0xffd23f, { metalness: 0.6, roughness: 0.3 }),
  );
  tip.position.y = y + 16.3;
  g.add(tip);
  // the nave roof with its zigzag tile pattern colours
  const nave = new THREE.Shape();
  nave.moveTo(-6, 0);
  nave.lineTo(0, 7);
  nave.lineTo(6, 0);
  nave.lineTo(-6, 0);
  const naveRoof = F(
    new THREE.ExtrudeGeometry(nave, { depth: 30, bevelEnabled: false }),
    flat(0x3f7f6a),
    0.08,
    55,
  );
  naveRoof.rotation.y = Math.PI / 2;
  naveRoof.position.set(-34, 13, 0);
  g.add(naveRoof);
  const naveBody = F(new THREE.BoxGeometry(30, 13, 11), stone, 0.04, 56);
  naveBody.position.set(-19, 6.5, 0);
  g.add(naveBody);
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = o.receiveShadow = true;
  });
  g.position.set(9, STREET_Y, -52);
  g.rotation.y = -0.18;
  ground.add(g);
}
// a green copper dome further left (Karlskirche-ish)
{
  const g = new THREE.Group();
  const drum = F(new THREE.CylinderGeometry(4.2, 4.4, 6, 12), flat(0xe8dcc6), 0.04, 60);
  drum.position.y = 3;
  g.add(drum);
  const dome = F(
    new THREE.SphereGeometry(4.4, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    flat(0x5fa08a),
    0.06,
    61,
  );
  dome.position.y = 6;
  g.add(dome);
  const lantern = F(new THREE.CylinderGeometry(0.7, 0.8, 2, 8), flat(0xe8dcc6), 0.04, 62);
  lantern.position.y = 11.2;
  g.add(lantern);
  g.position.set(-30, 4, -60);
  ground.add(g);
}
// far layer: the Kahlenberg hills as a faceted ring behind the city
{
  const n = 44;
  const geo = new THREE.BufferGeometry();
  const pos = [];
  const idx = [];
  for (let i = 0; i <= n; i++) {
    const a = Math.PI * (0.05 + (i / n) * 0.9) + Math.PI;
    const rr = 120;
    const hgt = 8 + noise2(i * 0.35, 1, SEED) * 16;
    pos.push(
      Math.cos(a) * rr,
      STREET_Y,
      Math.sin(a) * rr,
      Math.cos(a) * rr,
      STREET_Y + 14 + hgt,
      Math.sin(a) * rr,
    );
    if (i < n) idx.push(i * 2, i * 2 + 2, i * 2 + 1, i * 2 + 1, i * 2 + 2, i * 2 + 3);
  }
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const hills = new THREE.Mesh(
    facet(geo.toNonIndexed(), 0.06, SEED),
    facetMat(flat(0x2c2f52, { side: THREE.DoubleSide })),
  );
  ground.add(hills);
}

// ---------------------------------------------------------------- our house + the deck
{
  const { x0, x1, z0, z1 } = DECK;
  const w = x1 - x0;
  const d = z1 - z0;
  // the building under the deck (seen in the drone outro and the street shot)
  const wall = 0xf0d6b4;
  const body = F(new THREE.BoxGeometry(w, -STREET_Y - 0.25, d), flat(wall), 0.03, 70);
  body.position.set((x0 + x1) / 2, STREET_Y / 2 - 0.125, (z0 + z1) / 2);
  ground.add(body);
  const own = [];
  const ownLit = [];
  for (let fy = -2.2; fy > STREET_Y + 1.5; fy -= 2.3)
    for (let x = x0 + 1.2; x < x1 - 0.6; x += 1.5) {
      own.push({ g: ground, x, y: fy, z: z1 + 0.02, s: 1 });
      ((x * 7 + fy * 3) % 5 > 3.6 ? ownLit : []).push({ g: ground, x, y: fy, z: z1 + 0.05, s: 1 });
    }
  inst(own, 0.8, 1.2, 0.05, flat(0xf6f1ea));
  inst(
    own.filter((o) => !ownLit.includes(o)).map((o) => ({ ...o, z: o.z + 0.03 })),
    0.62,
    0.98,
    0.06,
    flat(0x262c4a, { roughness: 0.15, metalness: 0.35 }),
  );
  inst(
    ownLit.map((o) => ({ ...o, z: o.z + 0.03 })),
    0.62,
    0.98,
    0.06,
    flat(0xffd27a, { emissive: 0xffb04d, emissiveIntensity: 1 }),
  );
  // the deck: planks along x, each a touch different
  const planks = [];
  for (let z = z0 + 0.15; z < z1; z += 0.3)
    for (let x = x0; x < x1; x += 2.75)
      planks.push([x + 1.375 + (Math.round(z / 0.3) % 2) * 0.6, z]);
  const pm = new THREE.InstancedMesh(
    new THREE.BoxGeometry(2.72, 0.08, 0.27),
    flat(0xffffff, { roughness: 0.8 }),
    planks.length,
  );
  const wood = new THREE.Color(0xb98a5e);
  planks.forEach(([x, z], i) => {
    m4.makeTranslation(Math.min(x, x1 - 1.36), -0.04, z);
    pm.setMatrixAt(i, m4);
    const k = 0.85 + r() * 0.2 + (noise2(x * 0.2, z * 0.2, 5) - 0.5) * 0.2;
    pm.setColorAt(i, col.copy(wood).multiplyScalar(k));
  });
  pm.receiveShadow = true;
  ground.add(pm);
  // railing: posts, a top rail and glass panels on front + sides
  const rail = flat(0x2f3440, { metalness: 0.5, roughness: 0.4 });
  const glass = new THREE.MeshStandardMaterial({
    color: 0xbfd8ff,
    transparent: true,
    opacity: 0.18,
    roughness: 0.05,
  });
  const edge = (ax, az, bx, bz) => {
    const len = Math.hypot(bx - ax, bz - az);
    const ang = Math.atan2(bz - az, bx - ax);
    const top = new THREE.Mesh(new THREE.BoxGeometry(len, 0.07, 0.07), rail);
    top.position.set((ax + bx) / 2, 1.05, (az + bz) / 2);
    top.rotation.y = -ang;
    ground.add(top);
    const gl = new THREE.Mesh(new THREE.BoxGeometry(len, 0.9, 0.03), glass);
    gl.position.set((ax + bx) / 2, 0.55, (az + bz) / 2);
    gl.rotation.y = -ang;
    gl.userData.noAO = true;
    ground.add(gl);
    for (let k = 0; k <= len; k += 2.2) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.05, 0.07), rail);
      p.position.set(ax + ((bx - ax) * k) / len, 0.52, az + ((bz - az) * k) / len);
      ground.add(p);
    }
  };
  edge(x0, z1, x1, z1);
  edge(x0, z0, x0, z1);
  edge(x1, z0, x1, z1);
  // back: the stairwell hut with a lit door
  const hut = F(new THREE.BoxGeometry(4.2, 2.8, 2.6), flat(0xe2c6a4), 0.04, 71);
  hut.position.set(-6.6, 1.4, z0 + 1.3);
  ground.add(hut);
  const hutRoof = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.18, 2.9), flat(0x5a5060));
  hutRoof.position.set(-6.6, 2.88, z0 + 1.3);
  ground.add(hutRoof);
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 2.0, 0.06),
    flat(0xffd890, { emissive: 0xffb860, emissiveIntensity: 0.9 }),
  );
  door.position.set(-6.0, 1.0, z0 + 2.62);
  door.userData.noAO = true;
  ground.add(door);
  // a big potted olive tree next to the hut, and planters along the back
  place(planter(3), 3.2, -7.3);
  place(planter(5), 5.6, -7.6);
  place(bush(SEED, 0x4f8a3a), 9.2, -6.9, 0, 1.3);
  place(bush(SEED + 1, 0x5a9a3e), -9.6, 5.6, 0, 1.0);
  place(crate(0x2f7d4a), 9.4, 4.8, 0.3);
  place(crate(0x2f7d4a), 9.1, 4.8, 0.1, 1, 0.42);
}

// ---------------------------------------------------------------- party props
// speakers with pulsing cones (the music is still on)
const cones = [];
for (const [x, z, ry] of [
  [-8.2, -2.6, 0.55],
  [8.2, -2.8, -0.55],
]) {
  const g = new THREE.Group();
  const box = F(new THREE.BoxGeometry(1.1, 2.0, 0.9), flat(0x23232e, { roughness: 0.5 }), 0.04, 80);
  box.position.y = 1.0;
  g.add(box);
  for (const [cy, cr] of [
    [1.45, 0.24],
    [0.7, 0.36],
  ]) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(cr, 0.05, 6, 16),
      flat(0x5a5a6a, { metalness: 0.4 }),
    );
    ring.position.set(0, cy, 0.46);
    g.add(ring);
    const cone = new THREE.Mesh(
      new THREE.CircleGeometry(cr * 0.9, 16),
      flat(0x3a3a48, { emissive: 0xff3f9a, emissiveIntensity: 0.25 }),
    );
    cone.position.set(0, cy, 0.455);
    g.add(cone);
    cones.push(cone);
  }
  g.traverse((o) => o.isMesh && (o.castShadow = true));
  g.position.set(x, 0, z);
  g.rotation.y = ry;
  ground.add(g);
}
onFrame((t) => {
  const beat = Math.pow(Math.max(0, Math.sin(t * Math.PI * 2 * 2.0)), 6);
  cones.forEach((c) => {
    c.position.z = 0.455 + beat * 0.05;
    c.material.emissiveIntensity = 0.2 + beat * 0.7;
  });
});
// drinks table with empty cans and bottles
{
  const g = new THREE.Group();
  const top = F(new THREE.BoxGeometry(2.2, 0.1, 1.0), flat(0xd8b48a), 0.04, 90);
  top.position.y = 0.95;
  g.add(top);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.9, 0.07), flat(0x2f3440));
      leg.position.set(sx * 1.0, 0.45, sz * 0.42);
      g.add(leg);
    }
  const canCols = [0x2fb7ff, 0x3dff7a, 0xff3f9a, 0xffd23f, 0x2fb7ff];
  for (let i = 0; i < 9; i++) {
    const c = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.075, 0.26, 10),
      flat(canCols[i % 5], { metalness: 0.5, roughness: 0.3 }),
    );
    const lying = i % 4 === 3;
    c.position.set(-0.9 + i * 0.22, lying ? 1.08 : 1.13, (r() - 0.5) * 0.6);
    if (lying) c.rotation.z = Math.PI / 2;
    g.add(c);
  }
  for (let i = 0; i < 3; i++) {
    const b = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.09, 0.42, 8),
      flat(0x3f8a4a, { roughness: 0.15, transparent: true, opacity: 0.85 }),
    );
    b.position.set(0.6 + i * 0.18, 1.21, -0.3);
    g.add(b);
  }
  g.traverse((o) => o.isMesh && (o.castShadow = true));
  g.position.set(7.4, 0, 1.6);
  g.rotation.y = -0.35;
  ground.add(g);
}
// a few cans and confetti on the deck
{
  const conf = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.07, 0.01, 0.05),
    flat(0xffffff),
    140,
  );
  const cc = [0xff3f9a, 0xffd23f, 0x2fb7ff, 0x3dff7a, 0xffffff];
  for (let i = 0; i < 140; i++) {
    let x = (r() - 0.5) * 20;
    let z = (r() - 0.5) * 14;
    if (Math.abs(x) < 2.5 && Math.abs(z) < 2) x += 3 * Math.sign(x || 1);
    m4.compose(
      V(x, 0.01, z),
      new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), r() * 6),
      V(1, 1, 1),
    );
    conf.setMatrixAt(i, m4);
    conf.setColorAt(i, col.set(cc[i % cc.length]));
  }
  conf.userData.noAO = true;
  ground.add(conf);
  for (const [x, z] of [
    [3.4, 3.2],
    [-3.2, 4.4],
    [5.2, -1.0],
  ]) {
    const c = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.075, 0.26, 10),
      flat(0x2fb7ff, { metalness: 0.5, roughness: 0.3 }),
    );
    c.rotation.z = Math.PI / 2;
    c.rotation.y = x;
    add(c, x, 0.075, z);
  }
}
// fairy lights: poles at the deck corners, strings zig-zagging over it
{
  const poles = [
    [-10.4, 6.8],
    [10.4, 6.8],
    [10.4, -7.8],
    [-10.4, -7.8],
  ];
  for (const [x, z] of poles) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 4.2, 6), flat(0x2f3440));
    add(p, x, 2.1, z);
  }
  const warm = [0xffd27a, 0xff9a5a, 0xfff1c2, 0xff6fae];
  lightString([-10.4, 4.1, -7.8], [10.4, 4.1, -7.8], { n: 24, sag: 0.7, colors: warm });
  lightString([-10.4, 4.1, -7.8], [10.4, 4.1, 6.8], { n: 30, sag: 1.1, colors: warm });
  lightString([10.4, 4.1, -7.8], [-10.4, 4.1, 6.8], { n: 30, sag: 1.1, colors: warm });
  lightString([-10.4, 4.1, 6.8], [-10.4, 4.1, -7.8], { n: 18, sag: 0.6, colors: warm });
  lightString([10.4, 4.1, 6.8], [10.4, 4.1, -7.8], { n: 18, sag: 0.6, colors: warm });
}

// ---------------------------------------------------------------- life
// dust and late confetti glinting in the fairy lights
fireflies(40, { area: [-10, 10, 0.6, 4.2, -7, 6], color: 0xffd9a0, seed: SEED, size: 0.035 });

finishSet({ ground: 0x3a3650 });
