// Props: small low-poly set pieces to dress every video's world for its
// topic (SKILL.md "Set design") — a café terrace for the coffee machine, a
// bus stop for the ticket machine, cows and a fence for the milking robot.
// Same toy style as everything else: faceted, flat colours, soft shadows.
//   import { place, bench, parasol, scatter } from "./props.js";
//   place(bench(), -7, -3, 0.4);                 // x, z, rotY, scale
//   scatter(() => bush(), 12, { rMin: 8, rMax: 18, seed: 4 });
// Every builder returns a THREE.Group standing on y = 0, front = +z.
// place() keeps the stage clear: it warns when something lands on the
// subject (r < 4.5) or an analogy spot (x = ±5, z = -1…4).
import { THREE, V, rng, jitter, flat, M, ground, onFrame, facet, facetMat } from "./world.js";

const F = (geo, mat, amt = 0.08, seed = 1) => new THREE.Mesh(facet(geo, amt, seed), facetMat(mat));
const mesh = (geo, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
};
const box = (w, h, d, mat, x = 0, y = 0, z = 0) =>
  mesh(new THREE.BoxGeometry(w, h, d), mat, x, y + h / 2, z);
const cyl = (r1, r2, h, mat, x = 0, y = 0, z = 0, seg = 8) =>
  mesh(new THREE.CylinderGeometry(r1, r2, h, seg), mat, x, y + h / 2, z);
const group = (...kids) => {
  const g = new THREE.Group();
  for (const k of kids) g.add(k);
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = o.receiveShadow = true;
  });
  return g;
};

export const inStage = (x, z) =>
  x * x + z * z < 4.5 * 4.5 || ((Math.abs(x) - 5) ** 2 + (z - 1.5) ** 2 < 2.4 * 2.4 && z > -1.5);

// Put a prop into the world.
export function place(obj, x, z, rotY = 0, s = 1, y = 0) {
  if (inStage(x, z)) console.warn(`props: something placed on the stage at ${x}, ${z}`);
  obj.position.set(x, y, z);
  obj.rotation.y = rotY;
  obj.scale.setScalar(s);
  ground.add(obj);
  return obj;
}

// n copies of make(i, r) at random spots in a ring, never on the stage.
// keep(x, z) can exclude more (a road, the sea).
export function scatter(
  make,
  n,
  { rMin = 7, rMax = 20, seed = 1, keep = () => true, s = [0.8, 1.2] } = {},
) {
  const r = rng(seed);
  const out = [];
  for (let i = 0; out.length < n && i < n * 30; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(rMin * rMin + r() * (rMax * rMax - rMin * rMin));
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    if (inStage(x, z) || !keep(x, z)) continue;
    out.push(place(make(out.length, r), x, z, r() * Math.PI * 2, s[0] + r() * (s[1] - s[0])));
  }
  return out;
}

// slow sway for anything leafy (deterministic)
const swaying = [];
onFrame((t) => {
  for (const { g, seed, amp } of swaying) {
    g.rotation.z = Math.sin(t * 1.1 + seed * 1.7) * amp;
    g.rotation.x = Math.sin(t * 0.8 + seed * 2.9) * amp * 0.7;
  }
});
export const sway = (g, seed = 1, amp = 0.02) => (swaying.push({ g, seed, amp }), g);

// ---------------------------------------------------------------- nature
export function bush(seed = 1, color = 0x5aa233) {
  const r = rng(seed);
  const g = new THREE.Group();
  const mat = flat(color);
  for (let k = 0; k < 3; k++) {
    const m = F(
      jitter(new THREE.IcosahedronGeometry(0.45 + r() * 0.2, 1), 0.06, seed + k),
      mat,
      0.1,
      seed + k,
    );
    m.position.set((k - 1) * 0.42, 0.35 + r() * 0.12, (r() - 0.5) * 0.3);
    m.scale.y = 0.8;
    g.add(m);
  }
  return sway(group(g), seed, 0.012);
}

export function flowerBed(seed = 1, colors = [0xff8fb8, 0xffd84a, 0xffffff, 0xc9a4ff]) {
  const r = rng(seed);
  const g = new THREE.Group();
  g.add(
    F(jitter(new THREE.CylinderGeometry(0.9, 1.0, 0.18, 9), 0.03, seed), flat(0x6e3b22), 0.1, seed),
  );
  g.children[0].position.y = 0.09;
  for (let i = 0; i < 14; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * 0.75;
    const stem = mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.3, 4),
      flat(0x4f9a35),
      Math.cos(a) * d,
      0.32,
      Math.sin(a) * d,
    );
    const head = mesh(
      new THREE.IcosahedronGeometry(0.08, 0),
      flat(colors[i % colors.length], { roughness: 0.6 }),
      Math.cos(a) * d,
      0.5,
      Math.sin(a) * d,
    );
    g.add(stem, head);
  }
  return group(g);
}

export function rock(seed = 1, size = 0.5, mat = M.rock) {
  const m = F(jitter(new THREE.DodecahedronGeometry(size, 0), size * 0.15, seed), mat, 0.12, seed);
  m.position.y = size * 0.45;
  m.scale.y = 0.7;
  return group(m);
}

export function palm(seed = 1, lean = 0.3) {
  const g = new THREE.Group();
  const pts = [];
  for (let k = 0; k <= 6; k++) pts.push(V(Math.sin((k / 6) * 1.2) * lean * 2, k * 0.75, 0));
  g.add(
    F(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 0.16, 6),
      flat(0x9b6b3d),
      0.1,
      seed,
    ),
  );
  const top = pts[pts.length - 1];
  for (let k = 0; k < 8; k++) {
    const f = F(
      new THREE.ConeGeometry(0.32, 2.3, 4, 2),
      flat(k % 2 ? 0x4caf50 : 0x3d9443),
      0.08,
      seed + k,
    );
    f.scale.z = 0.22;
    f.position.copy(top);
    f.rotation.set(0, (k / 8) * Math.PI * 2, 0);
    f.rotateZ(-1.95);
    f.translateY(1.05);
    g.add(f);
  }
  return sway(group(g), seed, 0.015);
}

// ---------------------------------------------------------------- street
export function bench(color = 0xc58b4f) {
  const wood = flat(color);
  const iron = flat(0x3b3f47, { roughness: 0.5, metalness: 0.4 });
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) g.add(box(1.8, 0.06, 0.14, wood, 0, 0.45, -0.18 + i * 0.18));
  for (let i = 0; i < 2; i++) {
    const b = box(1.8, 0.14, 0.05, wood, 0, 0.62 + i * 0.2, -0.32);
    b.rotation.x = -0.15;
    g.add(b);
  }
  for (const x of [-0.75, 0.75])
    g.add(box(0.07, 0.45, 0.5, iron, x, 0, -0.05), box(0.07, 0.5, 0.06, iron, x, 0.45, -0.32));
  return group(g);
}

export function bin(color = 0x2f7d4a) {
  const m = flat(color, { roughness: 0.5 });
  return group(cyl(0.24, 0.2, 0.75, m, 0, 0, 0, 10), cyl(0.27, 0.27, 0.06, m, 0, 0.75, 0, 10));
}

export function lamp({ on = false, h = 3.6 } = {}) {
  const iron = flat(0x2f3440, { roughness: 0.45, metalness: 0.5 });
  const glass = on
    ? flat(0xfff1c2, { emissive: 0xffd27a, emissiveIntensity: 1.4 })
    : flat(0xf6f0e0, { roughness: 0.3 });
  return group(
    cyl(0.12, 0.14, 0.3, iron),
    cyl(0.05, 0.06, h, iron, 0, 0.3),
    cyl(0.16, 0.12, 0.34, glass, 0, h + 0.3, 0, 6),
    cyl(0.02, 0.22, 0.16, iron, 0, h + 0.64, 0, 6),
  );
}

export function planter(seed = 1) {
  const g = group(cyl(0.6, 0.5, 0.55, flat(0xc9c1b8), 0, 0, 0, 10));
  const b = bush(seed);
  b.position.y = 0.4;
  b.scale.setScalar(0.85);
  g.add(b);
  return g;
}

export function bike(color = 0xe2453c) {
  const frame = flat(color, { roughness: 0.35, metalness: 0.3 });
  const tire = M.rubber;
  const g = new THREE.Group();
  for (const x of [-0.55, 0.55]) {
    const w = mesh(new THREE.TorusGeometry(0.33, 0.04, 6, 16), tire, x, 0.36, 0);
    g.add(w);
  }
  const bar = (x1, y1, x2, y2) => {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const m = mesh(
      new THREE.CylinderGeometry(0.03, 0.03, len, 5),
      frame,
      (x1 + x2) / 2,
      (y1 + y2) / 2,
      0,
    );
    m.rotation.z = Math.atan2(x1 - x2, y2 - y1);
    return m;
  };
  g.add(
    bar(-0.55, 0.36, -0.05, 0.36),
    bar(-0.05, 0.36, 0.45, 0.8),
    bar(-0.55, 0.36, -0.15, 0.8),
    bar(-0.15, 0.8, 0.45, 0.8),
    bar(0.55, 0.36, 0.45, 0.95),
    bar(-0.05, 0.36, -0.15, 0.85),
  );
  g.add(box(0.26, 0.05, 0.1, M.rubber, -0.15, 0.86, 0), box(0.05, 0.05, 0.5, frame, 0.45, 0.95, 0));
  return group(g);
}

export function cone() {
  const o = flat(0xff6a1f, { roughness: 0.5 });
  const w = flat(0xffffff);
  return group(
    box(0.5, 0.05, 0.5, o),
    cyl(0.04, 0.2, 0.7, o, 0, 0.05, 0, 8),
    cyl(0.12, 0.15, 0.12, w, 0, 0.35, 0, 8),
  );
}

export function hydrant(color = 0xd8352a) {
  const m = flat(color, { roughness: 0.4 });
  return group(
    cyl(0.16, 0.18, 0.6, m, 0, 0, 0, 8),
    cyl(0.12, 0.16, 0.16, m, 0, 0.6, 0, 8),
    mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 6), m, 0, 0.42, 0).rotateZ(Math.PI / 2),
  );
}

export function sign(color = 0x2f6fd6) {
  const pole = flat(0x9aa3ad, { metalness: 0.5, roughness: 0.4 });
  const panel = flat(color, { roughness: 0.4 });
  return group(
    cyl(0.04, 0.04, 2.2, pole),
    box(0.7, 0.7, 0.05, panel, 0, 1.9, 0.05),
    box(0.5, 0.1, 0.06, flat(0xffffff), 0, 2.15, 0.06),
  );
}

export function mailbox(color = 0xffcc00) {
  const m = flat(color, { roughness: 0.45 });
  return group(
    cyl(0.05, 0.05, 1.0, flat(0x3b3f47)),
    box(0.5, 0.45, 0.32, m, 0, 1.0, 0),
    box(0.3, 0.04, 0.05, M.rubber, 0, 1.32, 0.17),
  );
}

export function busStop() {
  const frame = flat(0x3b3f47, { roughness: 0.4, metalness: 0.4 });
  const glass = new THREE.MeshStandardMaterial({
    color: 0xcfe6ff,
    roughness: 0.05,
    transparent: true,
    opacity: 0.35,
  });
  const g = new THREE.Group();
  for (const x of [-1.3, 1.3])
    g.add(box(0.08, 2.3, 0.08, frame, x, 0, -0.5), box(0.08, 2.3, 0.08, frame, x, 0, 0.5));
  g.add(
    box(2.8, 0.1, 1.3, frame, 0, 2.3, 0),
    box(2.6, 2.0, 0.04, glass, 0, 0.25, -0.5),
    box(1.6, 0.06, 0.35, flat(0xc58b4f), 0, 0.5, -0.25),
  );
  g.add(
    box(
      0.06,
      1.3,
      0.9,
      flat(0xffd23f, { emissive: 0xffd23f, emissiveIntensity: 0.15 }),
      1.3,
      0.6,
      0,
    ),
  );
  return group(g);
}

// Striped awning (shops, market stalls, kiosks), w wide, sloping forward.
export function awning(w = 2, colors = [0xe2453c, 0xffffff]) {
  const g = new THREE.Group();
  const n = Math.max(4, Math.round(w / 0.3));
  for (let i = 0; i < n; i++) {
    const s = box(
      w / n,
      0.04,
      0.9,
      flat(colors[i % colors.length], { roughness: 0.7 }),
      -w / 2 + (i + 0.5) * (w / n),
      0,
      0.45,
    );
    g.add(s);
  }
  g.rotation.x = 0.35;
  return group(g);
}

export function stall(
  colors = [0x2f9e6a, 0xffffff],
  goods = [0xff7a2f, 0xe2453c, 0xffd23f, 0x79c24a],
) {
  const wood = M.wood;
  const g = new THREE.Group();
  g.add(box(2.2, 0.9, 1.0, wood), box(2.3, 0.06, 1.1, M.woodDark, 0, 0.9, 0));
  for (const x of [-1.05, 1.05])
    g.add(box(0.08, 2.2, 0.08, wood, x, 0, 0.45), box(0.08, 2.2, 0.08, wood, x, 0, -0.45));
  const a = awning(2.4, colors);
  a.position.set(0, 2.25, -0.55);
  g.add(a);
  const r = rng(5);
  for (let i = 0; i < 18; i++)
    g.add(
      mesh(
        new THREE.IcosahedronGeometry(0.1, 0),
        flat(goods[i % goods.length], { roughness: 0.5 }),
        -0.9 + (i % 9) * 0.22,
        1.02 + r() * 0.04,
        -0.15 + Math.floor(i / 9) * 0.28,
      ),
    );
  return group(g);
}

// Café table with parasol and two chairs.
export function cafeTable(color = 0xe2453c) {
  const iron = flat(0x2f3440, { roughness: 0.4, metalness: 0.5 });
  const g = new THREE.Group();
  g.add(
    cyl(0.45, 0.45, 0.05, flat(0xf4efe6), 0, 0.72, 0, 12),
    cyl(0.04, 0.04, 0.72, iron),
    cyl(0.25, 0.25, 0.04, iron, 0, 0, 0, 10),
  );
  for (const s of [-1, 1]) {
    const c = new THREE.Group();
    c.add(box(0.42, 0.05, 0.42, iron, 0, 0.45, 0), box(0.42, 0.45, 0.04, iron, 0, 0.5, -0.2));
    for (const x of [-0.18, 0.18])
      for (const z of [-0.18, 0.18]) c.add(box(0.03, 0.45, 0.03, iron, x, 0, z));
    c.position.set(s * 0.75, 0, 0);
    c.rotation.y = (s * Math.PI) / 2;
    g.add(c);
  }
  const p = parasol(color);
  g.add(p);
  return group(g);
}

// Beach / café umbrella with alternating panels.
export function parasol(color = 0xff6b6b, white = 0xffffff, h = 2.4) {
  const g = new THREE.Group();
  g.add(cyl(0.035, 0.035, h, M.chrome));
  const n = 8;
  for (let i = 0; i < n; i++) {
    const geo = new THREE.ConeGeometry(
      1.4,
      0.5,
      n,
      1,
      true,
      (i / n) * Math.PI * 2,
      (Math.PI * 2) / n,
    );
    const m = mesh(
      geo,
      flat(i % 2 ? white : color, { side: THREE.DoubleSide, roughness: 0.7 }),
      0,
      h + 0.05,
      0,
    );
    g.add(m);
  }
  return group(g);
}

export function crate(color = 0xc58b4f) {
  const m = flat(color);
  const g = new THREE.Group();
  g.add(F(new THREE.BoxGeometry(0.7, 0.7, 0.7), m, 0.06, 3));
  g.children[0].position.y = 0.35;
  for (const y of [0.12, 0.58]) g.add(box(0.74, 0.08, 0.74, M.woodDark, 0, y - 0.04, 0));
  return group(g);
}

export function barrel(color = 0x9a6a38) {
  const m = flat(color);
  const band = flat(0x4a4f57, { metalness: 0.6, roughness: 0.4 });
  return group(
    cyl(0.34, 0.34, 0.95, m, 0, 0, 0, 10),
    cyl(0.36, 0.36, 0.06, band, 0, 0.18, 0, 10),
    cyl(0.36, 0.36, 0.06, band, 0, 0.72, 0, 10),
  );
}

// Wooden fence, `len` long along x.
export function fence(len = 6, color = 0x9a6a38) {
  const m = flat(color);
  const g = new THREE.Group();
  for (let x = -len / 2; x <= len / 2 + 0.01; x += 1.2) g.add(box(0.12, 1.0, 0.12, m, x, 0, 0));
  for (const y of [0.4, 0.78]) g.add(box(len + 0.2, 0.08, 0.06, M.wood, 0, y, 0));
  return group(g);
}

export function trafficLight(state = "red") {
  const pole = flat(0x3b3f47, { roughness: 0.4, metalness: 0.4 });
  const on = { red: 0, yellow: 1, green: 2 }[state];
  const cols = [0xff3b2f, 0xffc928, 0x3dff7a];
  const g = new THREE.Group();
  g.add(cyl(0.06, 0.07, 3.0, pole), box(0.36, 0.95, 0.3, pole, 0, 2.9, 0));
  cols.forEach((c, i) =>
    g.add(
      mesh(
        new THREE.SphereGeometry(0.1, 10, 8),
        flat(i === on ? c : 0x2a2a2a, i === on ? { emissive: c, emissiveIntensity: 1.6 } : {}),
        0,
        3.65 - i * 0.3,
        0.16,
      ),
    ),
  );
  return group(g);
}

// ---------------------------------------------------------------- winter
export function snowman(scarf = 0xe2453c) {
  const snow = F(new THREE.IcosahedronGeometry(1, 2), flat(0xf4f8ff), 0.03, 2);
  const g = new THREE.Group();
  [
    [0.55, 0.5],
    [0.4, 1.28],
    [0.28, 1.85],
  ].forEach(([r, y]) => {
    const m = snow.clone();
    m.scale.setScalar(r);
    m.position.y = y;
    g.add(m);
  });
  g.add(
    mesh(new THREE.ConeGeometry(0.06, 0.32, 6).rotateX(Math.PI / 2), flat(0xff7a2f), 0, 1.86, 0.4),
  );
  g.add(
    mesh(new THREE.TorusGeometry(0.3, 0.07, 6, 12).rotateX(Math.PI / 2), flat(scarf), 0, 1.6, 0),
  );
  g.add(
    cyl(0.22, 0.22, 0.32, M.rubber, 0, 2.05, 0, 10),
    cyl(0.32, 0.32, 0.03, M.rubber, 0, 2.05, 0, 10),
  );
  return group(g);
}

// ---------------------------------------------------------------- animals
export function cow(seed = 1) {
  const white = flat(0xf7f4ee);
  const spot = flat(0x2e2a2c);
  const pink = flat(0xf2b8b0);
  const g = new THREE.Group();
  g.add(F(new THREE.BoxGeometry(1.4, 0.75, 0.7, 2, 1, 1), white, 0.05, seed));
  g.children[0].position.y = 0.95;
  const r = rng(seed);
  for (let i = 0; i < 3; i++)
    g.add(box(0.35 + r() * 0.2, 0.05, 0.3, spot, -0.4 + i * 0.4, 1.31, (r() - 0.5) * 0.3));
  g.add(box(0.45, 0.42, 0.42, white, 0.85, 1.05, 0), box(0.2, 0.2, 0.36, pink, 1.1, 1.02, 0));
  for (const z of [-0.14, 0.14]) g.add(box(0.05, 0.12, 0.05, flat(0xe8dcc0), 0.8, 1.45, z));
  for (const x of [-0.5, 0.5])
    for (const z of [-0.22, 0.22]) g.add(box(0.14, 0.6, 0.14, white, x, 0, z));
  return group(g);
}

export function sheep(seed = 1) {
  const wool = flat(0xf4f1ea);
  const g = new THREE.Group();
  g.add(F(jitter(new THREE.IcosahedronGeometry(0.5, 1), 0.06, seed), wool, 0.06, seed));
  g.children[0].position.y = 0.65;
  g.children[0].scale.set(1.3, 0.9, 0.9);
  g.add(box(0.3, 0.3, 0.26, flat(0x2e2a2c), 0.6, 0.65, 0));
  for (const x of [-0.3, 0.3])
    for (const z of [-0.18, 0.18]) g.add(box(0.08, 0.35, 0.08, flat(0x2e2a2c), x, 0, z));
  return group(g);
}
