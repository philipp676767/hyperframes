// #98 Eiffelturm — the iron tower bends away from the sun.
// The tower is one merged lattice geometry (legs, arches, shaft) whose
// vertices are bent every frame: offset = tip · (y / H)², height · (1 + grow).
// A second mesh shares the same geometry in thermal colours (sun side red,
// shadow side blue). The café terrace (dough + banana) stands at z = CZ.
import {
  THREE,
  ramp,
  smooth,
  pop,
  lerp,
  clamp01,
  easeInOut,
  V,
  scene,
  camera,
  flat,
  real,
  roundedBox,
  ground,
  LOOK,
  showNope,
  makeArrowSet,
  animateArrows,
  showPanel,
  LED,
  labels,
  squash,
  puff,
  highlights,
  shotCamera,
  renderFrame,
  start,
  rng,
  facet,
  facetMat,
} from "./world.js";
import { SUN } from "./set.js";
import { createHand } from "./hand.js";
import { viewfinder, counter } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS, CZ, C } from "./beats.js";
import { discGeo } from "./environments.js";

highlights(HIGHLIGHTS);
const R = rng(980);

// ================================================================ tower geometry
const H = 12; // antenna top
const Y1 = 2.07; // 1st floor (57 m)
const Y2 = 4.18; // 2nd floor (115 m)
const Y3 = 10.0; // top floor (276 m)
const wOut = (y) => 0.12 + 2.15 * Math.exp(-y / 3.0); // half width of the outer edge
const legW = (y) => lerp(0.48, wOut(Y2) / 2, clamp01(y / Y2)); // half width of one leg
const legC = (y) => wOut(y) - legW(y); // centre of a leg (on the diagonal)

const P = [];
const N = [];
const IDX = [];
const tmpU = new THREE.Vector3();
const tmpW = new THREE.Vector3();
function beam(a, b, r, seg = 6) {
  const d = b.clone().sub(a);
  const len = d.length();
  if (len < 1e-4) return;
  d.divideScalar(len);
  const ref = Math.abs(d.y) < 0.9 ? V(0, 1, 0) : V(1, 0, 0);
  tmpU.crossVectors(d, ref).normalize();
  tmpW.crossVectors(d, tmpU).normalize();
  const base = P.length / 3;
  for (let k = 0; k < seg; k++) {
    const an = (k / seg) * Math.PI * 2 + Math.PI / seg;
    const nx = tmpU.x * Math.cos(an) + tmpW.x * Math.sin(an);
    const ny = tmpU.y * Math.cos(an) + tmpW.y * Math.sin(an);
    const nz = tmpU.z * Math.cos(an) + tmpW.z * Math.sin(an);
    P.push(a.x + nx * r, a.y + ny * r, a.z + nz * r, b.x + nx * r, b.y + ny * r, b.z + nz * r);
    N.push(nx, ny, nz, nx, ny, nz);
  }
  for (let k = 0; k < seg; k++) {
    const i0 = base + k * 2;
    const i1 = base + ((k + 1) % seg) * 2;
    IDX.push(i0, i1, i0 + 1, i1, i1 + 1, i0 + 1);
  }
}
// a lattice "column" between square sections: corners c(y) = [[x, z] × 4]
function lattice(levels, corners, rChord, rBrace) {
  for (let i = 0; i < levels.length; i++) {
    const y = levels[i];
    const cs = corners(y).map(([x, z]) => V(x, y, z));
    for (let k = 0; k < 4; k++) beam(cs[k], cs[(k + 1) % 4], rBrace * 1.15); // horizontals
    if (i === 0) continue;
    const y0 = levels[i - 1];
    const ps = corners(y0).map(([x, z]) => V(x, y0, z));
    for (let k = 0; k < 4; k++) {
      beam(ps[k], cs[k], rChord(y0)); // corner chords
      beam(ps[k], cs[(k + 1) % 4], rBrace); // X bracing on each face
      beam(ps[(k + 1) % 4], cs[k], rBrace);
    }
  }
}
const chordR = (y) => lerp(0.04, 0.016, clamp01(y / Y3));
// the four legs (ground → 2nd floor), each its own lattice column
for (const [sx, sz] of [
  [1, 1],
  [-1, 1],
  [-1, -1],
  [1, -1],
]) {
  const levels = [];
  for (let i = 0; i <= 13; i++) levels.push((Y2 * i) / 13);
  lattice(
    levels,
    (y) => {
      const c = legC(y);
      const w = legW(y);
      return [
        [sx * c + w, sz * c + w],
        [sx * c - w, sz * c + w],
        [sx * c - w, sz * c - w],
        [sx * c + w, sz * c - w],
      ];
    },
    chordR,
    0.011,
  );
}
// the shaft (2nd floor → top), one square column
{
  const levels = [];
  for (let i = 0; i <= 20; i++) levels.push(Y2 + ((Y3 - Y2) * i) / 20);
  lattice(
    levels,
    (y) => {
      const w = wOut(y);
      return [
        [w, w],
        [-w, w],
        [-w, -w],
        [w, -w],
      ];
    },
    chordR,
    0.009,
  );
  // inner cross: the four smaller columns that rise inside the shaft
  for (let i = 1; i <= 20; i++) {
    const ya = levels[i - 1];
    const yb = levels[i];
    for (const [sx, sz] of [
      [1, 1],
      [-1, 1],
      [-1, -1],
      [1, -1],
    ])
      beam(
        V(sx * wOut(ya) * 0.45, ya, sz * wOut(ya) * 0.45),
        V(sx * wOut(yb) * 0.45, yb, sz * wOut(yb) * 0.45),
        0.01,
      );
  }
}
// the four decorative arches under the 1st floor
for (let f = 0; f < 4; f++) {
  const rot = (f * Math.PI) / 2;
  const toW = (x, y, out) => {
    const z = wOut(y) + out;
    return V(x * Math.cos(rot) + z * Math.sin(rot), y, -x * Math.sin(rot) + z * Math.cos(rot));
  };
  const y0 = 0.32;
  const Rx = legC(y0) - legW(y0);
  const n = 28;
  for (const [rr, out] of [
    [1.0, 0.0],
    [0.9, 0.01],
  ]) {
    let prev = null;
    for (let i = 0; i <= n; i++) {
      const th = (i / n) * Math.PI;
      const p = toW(
        Math.cos(th) * Rx * rr,
        y0 + Math.sin(th) * (Y1 - 0.12 - y0) * (rr === 1 ? 1 : 0.92),
        out,
      );
      if (prev) beam(prev, p, 0.024);
      prev = p;
    }
  }
  // little struts between the two arch rings
  for (let i = 2; i < n; i += 2) {
    const th = (i / n) * Math.PI;
    beam(
      toW(Math.cos(th) * Rx, y0 + Math.sin(th) * (Y1 - 0.12 - y0), 0),
      toW(Math.cos(th) * Rx * 0.9, y0 + Math.sin(th) * (Y1 - 0.12 - y0) * 0.92, 0.01),
      0.008,
    );
  }
}
const towerGeo = new THREE.BufferGeometry();
towerGeo.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
towerGeo.setAttribute("normal", new THREE.Float32BufferAttribute(N, 3));
towerGeo.setIndex(IDX);
const BASE = Float32Array.from(P);
// thermal colours: sun side hot (yellow → red), shadow side cold (purple → blue)
const sunH = V(SUN[0], 0, SUN[2]).normalize();
{
  const col = [];
  const cHot = new THREE.Color(0xffe14a);
  const cWarm = new THREE.Color(0xff3a1a);
  const cMid = new THREE.Color(0x8a2bd8);
  const cCold = new THREE.Color(0x1d3cff);
  const c = new THREE.Color();
  for (let i = 0; i < P.length; i += 3) {
    const y = P[i + 1];
    const s = (P[i] * sunH.x + P[i + 2] * sunH.z) / Math.max(0.15, wOut(y));
    const k = clamp01(s * 0.5 + 0.5);
    if (k > 0.55) c.copy(cWarm).lerp(cHot, ramp(k, 0.72, 1));
    else c.copy(cCold).lerp(cMid, ramp(k, 0.15, 0.55));
    col.push(c.r, c.g, c.b);
  }
  towerGeo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
}
const ironMat = real.metal(0x7b6248, { roughness: 0.55, metalness: 0.65 });
const thermalMat = new THREE.MeshBasicMaterial({ vertexColors: true });
const tower = new THREE.Mesh(towerGeo, ironMat);
tower.castShadow = true;
tower.receiveShadow = true;
tower.frustumCulled = false;
scene.add(tower);
const towerHot = new THREE.Mesh(towerGeo, thermalMat);
towerHot.frustumCulled = false;
towerHot.visible = false;
scene.add(towerHot);

// floors, top, antenna, flag: separate meshes that ride the bend
const riders = []; // { obj, y } — placed every frame at the bent position of height y
const ride = (obj, y) => (riders.push({ obj, y }), scene.add(obj), obj);
const floorMat = real.metal(0x6e5640, { roughness: 0.6, metalness: 0.5 });
const glassMat = real.glass(0xcfe6ee, { opacity: 0.5 });
const hotMats = []; // { mesh, solid } swapped in the thermal shots
const thermalFloor = new THREE.MeshBasicMaterial({ color: 0x9a2bc8 });
function part(geo, mat, y, x = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, 0, z);
  m.castShadow = true;
  m.receiveShadow = true;
  const g = new THREE.Group();
  g.add(m);
  hotMats.push({ mesh: m, solid: mat });
  return ride(g, y);
}
// 1st floor: a square ring with the glass pavilions and the gallery band
{
  const o = wOut(Y1) + 0.1;
  const i = o - 0.42;
  for (let k = 0; k < 4; k++) {
    const g = roundedBox(2 * o, 0.12, o - i, 0.02);
    const a = (k * Math.PI) / 2;
    const m = part(g, floorMat, Y1 + 0.06);
    m.children[0].position.set(Math.sin(a) * (o + i) * 0.5, 0, Math.cos(a) * (o + i) * 0.5);
    m.children[0].rotation.y = a;
    const band = part(roundedBox(2 * o, 0.16, 0.03, 0.01), floorMat, Y1 + 0.2);
    band.children[0].position.set(Math.sin(a) * o, 0, Math.cos(a) * o);
    band.children[0].rotation.y = a;
    const pav = part(roundedBox(0.9, 0.16, 0.2, 0.02), glassMat, Y1 + 0.2);
    pav.children[0].position.set(Math.sin(a) * (o - 0.25), 0, Math.cos(a) * (o - 0.25));
    pav.children[0].rotation.y = a;
  }
}
// 2nd floor
part(roundedBox(2 * wOut(Y2) + 0.16, 0.1, 2 * wOut(Y2) + 0.16, 0.02), floorMat, Y2 + 0.05);
part(
  roundedBox(2 * wOut(Y2) + 0.18, 0.12, 2 * wOut(Y2) + 0.18, 0.02).translate(0, 0, 0),
  glassMat,
  Y2 + 0.16,
);
// top: platform, cabin, terrace, lantern, antenna
part(roundedBox(0.66, 0.06, 0.66, 0.015), floorMat, Y3);
part(roundedBox(0.44, 0.34, 0.44, 0.03), glassMat, Y3 + 0.2);
part(roundedBox(0.46, 0.05, 0.46, 0.01), floorMat, Y3 + 0.4);
part(new THREE.CylinderGeometry(0.035, 0.06, 0.5, 24), floorMat, Y3 + 0.67);
part(new THREE.CylinderGeometry(0.03, 0.04, 1.05, 16), real.plastic(0xf2f2f2), Y3 + 1.45);
for (const y of [Y3 + 1.15, Y3 + 1.55])
  part(new THREE.CylinderGeometry(0.036, 0.036, 0.12, 16), real.plastic(0xd8282e), y);
// the flag on the top terrace — hanging limp (no wind)
const flag = (() => {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.006, 0.006, 0.42, 8),
    real.metal(0xdddddd),
  );
  pole.position.y = 0.21;
  g.add(pole);
  const c = document.createElement("canvas");
  c.width = 96;
  c.height = 64;
  const x = c.getContext("2d");
  ["#1f3a93", "#ffffff", "#e3262e"].forEach(
    (col, i) => ((x.fillStyle = col), x.fillRect(i * 32, 0, 32, 64)),
  );
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  // a strip hanging down the pole: tricolour stripes run downward, gentle folds
  const fg = new THREE.PlaneGeometry(0.14, 0.2, 6, 10);
  const pa = fg.attributes.position;
  for (let i = 0; i < pa.count; i++) {
    const px = pa.getX(i) + 0.07;
    pa.setZ(i, Math.sin(px * 50) * 0.008 * (px / 0.14));
  }
  fg.computeVertexNormals();
  const uv = fg.attributes.uv; // rotate the texture: stripes along the hang
  for (let i = 0; i < uv.count; i++) uv.setXY(i, 1 - uv.getY(i), uv.getX(i));
  const cloth = new THREE.Mesh(
    fg,
    new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.9 }),
  );
  cloth.position.set(0.072, 0.31, 0);
  cloth.castShadow = true;
  g.add(cloth);
  g.position.set(0.18, 0, 0.18);
  const r = new THREE.Group();
  r.add(g);
  return ride(r, Y3 + 0.43);
})();
// the ruler next to the antenna (winter mark blue, summer mark yellow)
const ruler = (() => {
  const g = new THREE.Group();
  const bar = new THREE.Mesh(roundedBox(0.06, 1.6, 0.02, 0.008), real.plastic(0xffd23f));
  bar.position.y = 0.8;
  g.add(bar);
  for (let i = 0; i <= 16; i++) {
    const tk = new THREE.Mesh(
      new THREE.BoxGeometry(i % 4 ? 0.025 : 0.045, 0.006, 0.024),
      flat(0x1b1b1b),
    );
    tk.position.set(-0.012, i * 0.1, 0.002);
    g.add(tk);
  }
  const mark = (y, col) => {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.012, 0.012),
      flat(col, { emissive: col, emissiveIntensity: 0.8 }),
    );
    m.position.set(-0.17, y, 0.01);
    g.add(m);
    return m;
  };
  g.userData.winter = mark(H - 11.2, 0x4fc3ff);
  g.position.set(0.32, 11.2, 0.0);
  scene.add(g);
  return g;
})();

// ---------------------------------------------------------------- the bend
// tip offset (x, z) at time t: hook sway, the wandering tip, the thermal bend,
// the time-lapse payoff where the tip follows the sun around
const away = Math.atan2(-sunH.z, -sunH.x); // direction away from the sun
const SUN_A0 = -0.35; // payoff: sun azimuth sweep (radians, atan2(z, x))
const SUN_A1 = 2.35;
const sunAz = (t) => lerp(SUN_A0, SUN_A1, easeInOut(ramp(t, T.deshalb, T.warst)));
function tip(t) {
  let mag = 0.12;
  let ang = away;
  if (t < T.von) {
    // hook: hard sway that settles
    const k = Math.exp(-t * 0.45);
    mag = 2.7 * k * Math.sin(t * 3.4 + 1.2);
  } else if (t < T.doch) {
    mag = 0.3 + 0.08 * Math.sin(t * 1.3);
  } else if (t < T.wind + 0.6) {
    // the tip wanders across the sky
    const k = smooth(ramp(t, T.spitze, T.wind));
    mag = 1.0;
    ang = away - 1.2 + k * 2.4;
  } else if (t < T.heisse) {
    mag = 0.1;
  } else if (t < T.wie2) {
    mag = lerp(0.1, 1.7, smooth(ramp(t, T.laenger2 - 0.2, T.schatten + 0.3)));
  } else if (t < T.deshalb) {
    mag = 0.18;
  } else {
    // time-lapse: away from the sun as it sweeps
    const a = sunAz(t);
    ang = a + Math.PI;
    mag = lerp(0.25, 1.5, smooth(ramp(t, T.deshalb, T.biegt + 0.4)));
  }
  return [Math.cos(ang) * mag, Math.sin(ang) * mag];
}
// grow: summer +, winter −, breathing with the years
function grow(t) {
  let g = 0;
  g +=
    0.045 * smooth(ramp(t, T.zehn - 0.05, T.zehn + 0.45)) * (1 - ramp(t, T.trick, T.trick + 0.3));
  if (t >= T.fakt && t < T.deshalb) {
    if (t < T.jedes) g = -0.04 * smooth(ramp(t, T.schrumpft, T.schrumpft + 0.6));
    else g = 0.035 * Math.sin((t - T.jedes) * 4.2);
  }
  return g;
}
const pos = towerGeo.attributes.position;
let lastKey = "";
function bendTower(t) {
  const [bx, bz] = tip(t);
  const g = grow(t);
  const key = `${bx.toFixed(4)},${bz.toFixed(4)},${g.toFixed(4)}`;
  if (key !== lastKey) {
    lastKey = key;
    const a = pos.array;
    for (let i = 0; i < a.length; i += 3) {
      const y = BASE[i + 1];
      const f = (y / H) * (y / H);
      a[i] = BASE[i] + bx * f;
      a[i + 1] = y * (1 + g);
      a[i + 2] = BASE[i + 2] + bz * f;
    }
    pos.needsUpdate = true;
  }
  for (const r of riders) {
    const f = (r.y / H) * (r.y / H);
    r.obj.position.set(bx * f, r.y * (1 + g), bz * f);
    r.obj.rotation.set((-bz * 2 * r.y) / (H * H), 0, (bx * 2 * r.y) / (H * H));
  }
  return [bx, bz, g];
}
const tipWorld = (t) => {
  const [bx, bz] = tip(t);
  return V(bx, H * (1 + grow(t)), bz);
};

// the glowing trail of the tip (the wandering, the circle in the payoff)
const TRAIL = 70;
const trail = new THREE.InstancedMesh(
  new THREE.SphereGeometry(0.075, 10, 8),
  new THREE.MeshBasicMaterial({ color: 0xffd23f }),
  TRAIL,
);
trail.frustumCulled = false;
scene.add(trail);
const tm = new THREE.Matrix4();
function drawTrail(t, from, vis) {
  trail.visible = vis > 0;
  if (!trail.visible) return;
  for (let k = 0; k < TRAIL; k++) {
    const tk = t - k * 0.055;
    const s = tk < from ? 0 : vis * (1 - k / TRAIL) * 1.1 + 0.15 * vis;
    const p = tipWorld(Math.max(from, tk));
    tm.makeScale(s, s, s).setPosition(p);
    trail.setMatrixAt(k, tm);
  }
  trail.instanceMatrix.needsUpdate = true;
}

// heat arrows: sunlight hitting the sun side (thermal shot)
const sunArrows = makeArrowSet(
  [3.2, 5.0, 6.8].map((y, i) => [
    V(sunH.x * 3.6 + 0.3 * i, y + 1.6, sunH.z * 3.6),
    V(sunH.x * 0.9, y, sunH.z * 0.9),
  ]),
  {},
);
// heat rising off the warm lattice (iron shot)
const heatUp = makeArrowSet(
  [
    [V(1.1, 2.7, 1.2), V(1.2, 3.6, 1.3)],
    [V(0.7, 2.9, 1.0), V(0.75, 3.9, 1.1)],
    [V(1.3, 3.1, 0.6), V(1.4, 4.0, 0.7)],
  ],
  {},
);

// snow for the winter (Übrigens)
const SNOW = 700;
const snow = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.035, 0),
  new THREE.MeshBasicMaterial({ color: 0xffffff }),
  SNOW,
);
snow.frustumCulled = false;
scene.add(snow);
const snowSeed = Array.from({ length: SNOW }, () => [R() * 30 - 15, R() * 16, R() * 30 - 22, R()]);

// ================================================================ the café terrace (z = CZ)
const cafe = new THREE.Group();
cafe.position.set(0, 0, CZ);
scene.add(cafe);
{
  const cob = new THREE.Mesh(facet(discGeo(9, 0.35, 7), 0.12, 7), facetMat(flat(0x9a9286)));
  cob.receiveShadow = true;
  cafe.add(cob);
  // boulangerie front behind the table
  const wall = new THREE.Mesh(
    roundedBox(10, 5, 0.4, 0.04),
    real.ceramic(0xe8dcc2, { roughness: 0.85, clearcoat: 0 }),
  );
  wall.position.set(0, 2.5, -2.6);
  wall.receiveShadow = true;
  cafe.add(wall);
  const win = new THREE.Mesh(
    roundedBox(3.2, 1.9, 0.04, 0.02),
    real.glass(0xfff4e0, { opacity: 0.18 }),
  );
  win.position.set(-0.6, 1.35, -2.36);
  cafe.add(win);
  const inside = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 1.9),
    new THREE.MeshStandardMaterial({
      color: 0x5a3a20,
      emissive: 0xffb060,
      emissiveIntensity: 0.35,
    }),
  );
  inside.position.set(-0.6, 1.35, -2.62);
  cafe.add(inside);
  const frame = new THREE.Mesh(roundedBox(3.45, 2.15, 0.06, 0.03), real.gloss(0x1f4d3a));
  frame.position.set(-0.6, 1.35, -2.4);
  cafe.add(frame);
  // warm bread shelves glowing in the window
  for (let i = 0; i < 9; i++) {
    const b = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.07, 0.35, 6, 12),
      real.plastic(0xc98a3e, { roughness: 0.6 }),
    );
    b.rotation.z = Math.PI / 2 + (R() - 0.5) * 0.2;
    b.position.set(-1.8 + (i % 5) * 0.55, 0.85 + Math.floor(i / 5) * 0.55, -2.5);
    cafe.add(b);
  }
  // awning: red and white stripes
  for (let i = 0; i < 12; i++) {
    const s = new THREE.Mesh(
      roundedBox(0.34, 0.04, 1.3, 0.01),
      real.fabric(i % 2 ? 0xffffff : 0xc8202c),
    );
    s.position.set(-2.0 + i * 0.34, 2.85, -1.95);
    s.rotation.x = 0.38;
    s.castShadow = true;
    cafe.add(s);
  }
  // sign
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 96;
  const x = c.getContext("2d");
  x.fillStyle = "#1f4d3a";
  x.fillRect(0, 0, 512, 96);
  x.fillStyle = "#f3d98a";
  x.font = "bold 58px serif";
  x.textAlign = "center";
  x.fillText("BOULANGERIE", 256, 68);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 0.48),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 }),
  );
  sign.position.set(-0.4, 3.35, -2.38);
  cafe.add(sign);
  // the round marble bistro table + two rattan chairs
  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(0.62, 0.62, 0.05, 64),
    real.ceramic(0xf1ede6, { roughness: 0.25 }),
  );
  top.position.y = 0.92;
  top.castShadow = top.receiveShadow = true;
  cafe.add(top);
  const iron = real.metal(0x2a2c30, { roughness: 0.45 });
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.9, 24), iron);
  stem.position.y = 0.45;
  cafe.add(stem);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.3, 0.03, 32), iron);
  foot.position.y = 0.015;
  cafe.add(foot);
  for (const s of [-1, 1]) {
    const ch = new THREE.Group();
    const seat = new THREE.Mesh(roundedBox(0.5, 0.05, 0.48, 0.02), real.wood(0xb98c55));
    seat.position.y = 0.55;
    ch.add(seat);
    const back = new THREE.Mesh(
      new THREE.TorusGeometry(0.24, 0.03, 10, 32, Math.PI),
      real.wood(0xa87a45),
    );
    back.position.set(0, 0.6, -0.22);
    ch.add(back);
    for (const lx of [-0.2, 0.2])
      for (const lz of [-0.2, 0.2]) {
        const leg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.018, 0.018, 0.55, 10),
          real.wood(0x8a5f35),
        );
        leg.position.set(lx, 0.275, lz);
        ch.add(leg);
      }
    ch.position.set(s * 1.0, 0, 0.1);
    ch.rotation.y = (-s * Math.PI) / 2;
    ch.traverse((o) => (o.castShadow = true));
    cafe.add(ch);
  }
  // espresso cup + saucer
  const sau = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.08, 0.015, 32),
    real.ceramic(0xffffff),
  );
  sau.position.set(0.38, 0.955, 0.2);
  cafe.add(sau);
  const cup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.04, 0.08, 32, 1, true),
    real.ceramic(0xffffff, { side: THREE.DoubleSide }),
  );
  cup.position.set(0.38, 1.0, 0.2);
  cafe.add(cup);
  const cof = new THREE.Mesh(new THREE.CircleGeometry(0.05, 24), real.gloss(0x3b2414));
  cof.rotation.x = -Math.PI / 2;
  cof.position.set(0.38, 1.03, 0.2);
  cafe.add(cof);
  // planters with lavender
  for (const s of [-1, 1]) {
    const pot = new THREE.Mesh(
      roundedBox(0.7, 0.45, 0.4, 0.04),
      real.ceramic(0x4d6b5a, { roughness: 0.6 }),
    );
    pot.position.set(s * 2.6, 0.225, -1.9);
    cafe.add(pot);
    for (let i = 0; i < 14; i++) {
      const l = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.03, 0.22, 4, 8),
        flat(i % 3 ? 0x8a6fc9 : 0x5f8a4a),
      );
      l.position.set(s * 2.6 + (R() - 0.5) * 0.6, 0.6, -1.9 + (R() - 0.5) * 0.3);
      l.rotation.z = (R() - 0.5) * 0.5;
      cafe.add(l);
    }
  }
}
// dough in a bowl (rises on "Ofen")
const bowl = new THREE.Mesh(
  new THREE.LatheGeometry(
    [
      V(0, 0, 0),
      V(0.12, 0, 0),
      V(0.21, 0.06, 0),
      V(0.25, 0.17, 0),
      V(0.24, 0.18, 0),
      V(0.2, 0.07, 0),
      V(0.0, 0.02, 0),
    ].map((p) => new THREE.Vector2(p.x, p.y)),
    64,
  ),
  real.ceramic(0x5c7fa6, { side: THREE.DoubleSide }),
);
bowl.position.set(-0.15, 0.945, 0.0);
bowl.castShadow = true;
cafe.add(bowl);
const dough = new THREE.Mesh(
  new THREE.SphereGeometry(0.22, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2),
  real.skin(0xf1dcb4, { roughness: 0.75 }),
);
dough.position.set(-0.15, 1.08, 0.0);
dough.castShadow = true;
cafe.add(dough);
// banana: a tapered 5-sided tube along an arc, bent by `curl`
const BN = 40;
const BS = 7;
const banGeo = new THREE.BufferGeometry();
{
  const idx = [];
  for (let i = 0; i < BN; i++)
    for (let k = 0; k < BS; k++) {
      const a = i * BS + k;
      const b = i * BS + ((k + 1) % BS);
      idx.push(a, b, a + BS, b, b + BS, a + BS);
    }
  banGeo.setIndex(idx);
  banGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(new Float32Array((BN + 1) * BS * 3), 3),
  );
  const col = [];
  const yel = new THREE.Color(0xf4cf36);
  const brown = new THREE.Color(0x4a3418);
  const green = new THREE.Color(0x9bbf3a);
  for (let i = 0; i <= BN; i++) {
    const u = i / BN;
    const c = yel.clone();
    if (u < 0.1) c.lerp(green, 1 - u / 0.1);
    if (u > 0.95) c.lerp(brown, (u - 0.95) / 0.05);
    if (u < 0.03) c.lerp(brown, 0.5);
    for (let k = 0; k < BS; k++) col.push(c.r, c.g, c.b);
  }
  banGeo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
}
const banana = new THREE.Mesh(
  banGeo,
  real.plastic(0xffffff, { vertexColors: true, roughness: 0.55, clearcoat: 0.15 }),
);
banana.castShadow = true;
banana.position.set(0.1, 0.97, 0.28);
cafe.add(banana);
const BL = 0.62; // centre line length
const banCentre = (u, curl) => {
  // arc in the x-y plane (banana lying on its side, bending up), length BL
  const k = curl * 2.6; // curvature
  const s = (u - 0.5) * BL;
  if (k < 1e-4) return [s, 0];
  return [Math.sin(s * k) / k, (1 - Math.cos(s * k)) / k];
};
let lastCurl = -1;
function bendBanana(curl) {
  if (Math.abs(curl - lastCurl) < 1e-4) return;
  lastCurl = curl;
  const a = banGeo.attributes.position.array;
  const k = curl * 2.6;
  for (let i = 0; i <= BN; i++) {
    const u = i / BN;
    const [cx, cy] = banCentre(u, curl);
    const s = (u - 0.5) * BL;
    // normal of the arc (in x-y), binormal = z
    const nx = -Math.sin(s * k);
    const ny = Math.cos(s * k);
    const r = 0.068 * Math.pow(Math.sin(Math.PI * clamp01(u * 0.97 + 0.015)), 0.55) + 0.008;
    for (let j = 0; j < BS; j++) {
      const an = (j / BS) * Math.PI * 2;
      const o = (i * BS + j) * 3;
      a[o] = cx + nx * Math.cos(an) * r;
      a[o + 1] = cy + ny * Math.cos(an) * r + r;
      a[o + 2] = Math.sin(an) * r;
    }
  }
  banGeo.attributes.position.needsUpdate = true;
  banGeo.computeVertexNormals();
}
// "außen lang" (yellow, along the outside) and "innen kurz" (blue, inside)
function arcArrow(mat) {
  const m = new THREE.Mesh(new THREE.BufferGeometry(), mat);
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.07, 16), mat);
  cafe.add(m, head);
  return { m, head };
}
const outArrow = arcArrow(new THREE.MeshBasicMaterial({ color: 0xffd23f }));
const inArrow = arcArrow(new THREE.MeshBasicMaterial({ color: 0x4fc3ff }));
function drawArc(ar, curl, side, k) {
  ar.m.visible = ar.head.visible = k > 0.01;
  if (!ar.m.visible) return;
  const pts = [];
  const kk = curl * 2.6;
  for (let i = 0; i <= 30; i++) {
    const u = 0.08 + (0.84 * i) / 30;
    const [cx, cy] = banCentre(u, curl);
    const s = (u - 0.5) * BL;
    const off = side * 0.13;
    pts.push(
      V(0.1 + cx - Math.sin(s * kk) * off, 0.97 + 0.07 + cy + Math.cos(s * kk) * off, 0.28 + 0.02),
    );
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  ar.m.geometry.dispose();
  ar.m.geometry = new THREE.TubeGeometry(curve, 40, 0.012, 8);
  ar.m.geometry.setDrawRange(0, Math.ceil(k * 40) * 8 * 6);
  const p = curve.getPoint(k);
  const d = curve.getTangent(k);
  ar.head.position.copy(p);
  ar.head.quaternion.setFromUnitVectors(V(0, 1, 0), d);
}

// ================================================================ the viewer's hand (top of the tower)
const hand = createHand({ scale: 0.12, sleeve: 0x2f3542 });
const HAND_ROT = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.35, Math.PI, 0));

// ================================================================ light + sky (the sun moves in the payoff)
let key = null;
let skyU = null;
scene.traverse((o) => {
  if (o.isDirectionalLight && o.castShadow) key = o;
  if (o.material && o.material.uniforms && o.material.uniforms.sunDir) skyU = o.material.uniforms;
});
const KEY0 = key.position.clone();
scene.add(key.target);
const SUN0 = skyU.sunDir.value.clone();

const applyCamera = shotCamera(shots, 1);
const shotAt = (t) => {
  let s = shots[0];
  for (const x of shots) if (x.at <= t) s = x;
  return s;
};

// ================================================================ render
function renderAt(t) {
  const shot = shotAt(t);
  const inCafe = shot.from ? shot.from[2] > CZ - 20 : false;

  // sun: fixed, but it sweeps across the sky in the payoff time-lapse
  const sweeping = t >= T.deshalb && t < T.warst;
  if (sweeping) {
    const a = sunAz(t);
    const el = 0.62 + 0.18 * Math.sin(ramp(t, T.deshalb, T.warst) * Math.PI);
    const d = V(Math.cos(a), el, Math.sin(a)).normalize();
    skyU.sunDir.value.copy(d);
    key.position.copy(d).multiplyScalar(34);
  } else {
    skyU.sunDir.value.copy(SUN0);
    key.position.copy(KEY0);
  }
  key.target.position.set(0, 0, 0);
  if (inCafe) {
    key.position.z += CZ;
    key.target.position.set(0, 0, CZ);
  }
  key.target.updateMatrixWorld();

  // the tower
  bendTower(t);
  const thermal = !!shot.thermal;
  tower.visible = !thermal;
  towerHot.visible = thermal;
  for (const h of hotMats) h.mesh.material = thermal ? thermalFloor : h.solid;
  LOOK.exposure = thermal ? 0.55 : 1.0;
  viewfinder(thermal ? 1 : 0, { label: "WÄRMEBILD", time: "IR · 38 °C", color: "#ff7a2b" });
  // the iron glows warm when "Eisen wird in der Wärme länger"
  const warm = pop(t, T.waerme - 0.2, T.wie) * 1;
  ironMat.emissive = ironMat.emissive || new THREE.Color();
  ironMat.emissive.setRGB(0.9, 0.28, 0.05);
  ironMat.emissiveIntensity = warm * 0.75;
  animateArrows(heatUp, t, pop(t, T.waerme, T.wie));
  animateArrows(sunArrows, t, thermal ? pop(t, T.knallt + 0.1, T.heisse) : 0);

  // the ruler + LED: "Über zehn Zentimeter"
  const rulerOn = t >= T.ueber2 && t < T.nur2;
  ruler.visible = rulerOn;
  if (rulerOn) {
    const [bx, bz] = tip(t);
    ruler.position.set(0.32 + bx, 11.2, bz);
  }
  if (t >= T.rate && t < T.zehn)
    showPanel(pop(t, T.rate + 0.3, T.zehn), "IM SOMMER", "+ ?", LED.yellow);
  else if (t >= T.zehn && t < T.nur2)
    showPanel(pop(t, T.zehn, T.nur2), "IM SOMMER", "+10 cm", LED.yellow);
  else showPanel(0);

  // the years ticking (Übrigens: every year since 1889)
  const yearK = pop(t, T.jedes, T.deshalb);
  counter("jahr", yearK, {
    label: "JAHR",
    value: String(Math.round(lerp(1889, 2026, smooth(ramp(t, T.jedes, T.deshalb - 0.3))))),
    x: 330,
    y: 430,
  });

  // ✕ marks: no wind, no earthquake, growing is not bending
  const [fx, , fz] = [flag.position.x, 0, flag.position.z];
  showNope(pop(t, T.wind + 0.15, T.kein2), 0.5 + fx, 10.65, 0.62 + fz, 0.14);
  showNope(pop(t, T.erdbeben + 0.05, T.turm), 2.0, 0.6, 2.6, 0.5);
  showNope(pop(t, T.biegen, T.trick), 1.6, 9.0, 0.5, 1.0);

  // the tip's trail: wandering (hook beat) and the circle in the payoff
  drawTrail(t, T.spitze, pop(t, T.spitze + 0.1, T.wind));
  if (t >= T.deshalb && t < T.warst) drawTrail(t, T.biegt, pop(t, T.biegt + 0.2, T.warst));

  // winter snow
  const snowK = pop(t, T.fakt, T.jedes);
  snow.visible = snowK > 0;
  if (snow.visible) {
    snowSeed.forEach(([x, y, z, s], i) => {
      const yy = (((y - t * (0.9 + s * 0.6)) % 16) + 16) % 16;
      tm.makeScale(snowK, snowK, snowK).setPosition(x + Math.sin(t + s * 9) * 0.3, yy, z);
      snow.setMatrixAt(i, tm);
    });
    snow.instanceMatrix.needsUpdate = true;
  }
  LOOK.saturation = snowK > 0 ? lerp(1.06, 0.55, snowK) : 1.06;

  // the café: dough rises on "Ofen", banana bends on "außen … krumm"
  const rise = smooth(ramp(t, T.ofen - 0.1, T.ofen + 0.5));
  dough.scale.set(0.85 + rise * 0.17, 0.35 + rise * 0.55, 0.85 + rise * 0.17);
  bowl.visible = dough.visible = t < T.rate || !inCafe;
  if (t >= T.ofen) dough.scale.multiply(squash(t, T.ofen + 0.05, 0.6));
  puff("dough", t, T.ofen + 0.15, -0.15, 1.45, CZ, 0.5);
  const curl = lerp(0.08, 1.0, smooth(ramp(t, T.aussen - 0.3, T.krumm + 0.25)));
  bendBanana(curl);
  drawArc(outArrow, curl, 1, smooth(ramp(t, T.aussen, T.aussen + 0.6)) * (t < T.krumm ? 1 : 0));
  drawArc(inArrow, curl, -1, smooth(ramp(t, T.innen, T.innen + 0.5)) * (t < T.krumm ? 1 : 0));

  // labels: the tag points follow the bend
  labels(t, LABELS);

  applyCamera(t);
  camera.updateMatrixWorld(true);

  // the viewer's hand on top of the tower, pointing down at Paris
  hand.group.visible = !!shot.hand;
  if (shot.hand) {
    hand.pose("point");
    const fwd = V(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = V(1, 0, 0).applyQuaternion(camera.quaternion);
    const up = V(0, 1, 0).applyQuaternion(camera.quaternion);
    const reach = smooth(ramp(t, shot.at, shot.at + 0.6));
    hand.group.position
      .copy(camera.position)
      .addScaledVector(fwd, 0.42 + reach * 0.08)
      .addScaledVector(right, 0.07)
      .addScaledVector(up, -0.17 + reach * 0.04);
    hand.group.quaternion.copy(camera.quaternion).multiply(HAND_ROT);
  }

  renderFrame();
}
void [ground, C, flat];
start(renderAt);
