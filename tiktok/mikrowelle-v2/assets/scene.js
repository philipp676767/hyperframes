// "So funktioniert die Mikrowelle". World, captions, camera, panel, arrows and
// labels live in world.js; this file only builds the microwave story.
import {
  THREE,
  ramp,
  lerp,
  smooth,
  inBack,
  pop,
  rng,
  V,
  scene,
  flat,
  M,
  xrayMaterial,
  xrayEdges,
  setXray,
  addFloor,
  makeArrowSet,
  animateArrows,
  heatMat,
  showPanel,
  showLabel,
  LED,
  labels,
  squash,
  puff,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { createWorld } from "./environments.js";
import { T, shots, LABELS, HIGHLIGHTS, MOL, KN, MY } from "./beats.js";

highlights(HIGHLIGHTS);
createWorld({ env: "winter", sky: "morgen" });
addFloor(3.4, "#f3e9dc", "#d9c9b6");

Object.assign(M, {
  liner: flat(0xe4e8ee, { roughness: 0.5 }),
  panelGrey: flat(0xe9ecef, { roughness: 0.5 }),
  magnetron: flat(0x4a525c, { roughness: 0.45, metalness: 0.3 }),
  magCore: flat(0xffa040, { emissive: 0xff7a10, emissiveIntensity: 0 }),
  display: flat(0x1c2a22, { emissive: 0x3dff7a, emissiveIntensity: 0 }),
  plateWhite: flat(0xfbfaf6, { roughness: 0.4 }),
  plateBlue: flat(0x2f4f86, { roughness: 0.4 }),
  turntable: flat(0xcfe8f5, { roughness: 0.15 }),
  bowl: flat(0x3c7be2, { roughness: 0.4 }),
  soup: flat(0xf08a3a, { roughness: 0.3, emissive: 0xff5a10, emissiveIntensity: 0 }),
  fork: new THREE.MeshStandardMaterial({
    color: 0xd6dde5,
    metalness: 0.85,
    roughness: 0.22,
    emissive: 0xffd23f,
    emissiveIntensity: 0,
  }),
  oxy: flat(0xe8463a, { emissive: 0xff3b10, emissiveIntensity: 0 }),
  hyd: flat(0xffffff, { emissive: 0xff8a50, emissiveIntensity: 0 }),
  crust: flat(0xe2c27e),
  hot: flat(0xf2dfae, { emissive: 0xff4a10, emissiveIntensity: 0, side: THREE.DoubleSide }),
  core: flat(0xf2dfae, { emissive: 0x2f9bff, emissiveIntensity: 0, side: THREE.DoubleSide }),
  choc: flat(0x5a2f1b, { roughness: 0.35 }),
  wrapper: flat(0xd8232a, { roughness: 0.5 }),
  wave: new THREE.MeshBasicMaterial({ color: 0xffd23f, transparent: true, depthWrite: false }),
  arc: new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
});
M.arc.color.setRGB(0.55, 1.15, 2.6);

// ---------------------------------------------------------------- counter
{
  const base = new THREE.Mesh(new THREE.BoxGeometry(3.0, MY - 0.06, 2.0), M.woodDark);
  base.position.y = (MY - 0.06) / 2;
  base.castShadow = true;
  base.receiveShadow = true;
  scene.add(base);
  const top = new THREE.Mesh(new THREE.BoxGeometry(3.15, 0.06, 2.12), M.wood);
  top.position.y = MY - 0.03;
  top.receiveShadow = true;
  scene.add(top);
}

// ---------------------------------------------------------------- microwave
// 2.4 wide, 1.4 tall, 1.7 deep, standing on the counter, front = +z.
// Left: cavity behind the door. Right: control panel with the magnetron behind.
const MW_W = 2.4;
const MW_H = 1.4;
const MW_D = 1.7;
const mw = new THREE.Group();
mw.position.y = MY;
scene.add(mw);
const box = new THREE.Group(); // shell + liner + control panel (the "Metallkiste")
mw.add(box);

const shellMat = xrayMaterial(0xe0483e, { roughness: 0.35 });
const linerMat = xrayMaterial(0x7d8796, { roughness: 0.55 });
const panelMat = xrayMaterial(0xe9ecef, { roughness: 0.5 });
const doorMat = xrayMaterial(0x2a2d33, { roughness: 0.4 });
const slab = (w, h, d, x, y, z, mat, parent = box) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};
// shell
const th = 0.07;
slab(MW_W, th, MW_D, 0, MW_H - th / 2, 0, shellMat);
slab(MW_W, th, MW_D, 0, th / 2, 0, shellMat);
slab(th, MW_H, MW_D, -MW_W / 2 + th / 2, MW_H / 2, 0, shellMat);
slab(th, MW_H, MW_D, MW_W / 2 - th / 2, MW_H / 2, 0, shellMat);
slab(MW_W, MW_H, th, 0, MW_H / 2, -MW_D / 2 + th / 2, shellMat);
// control panel on the front right
const CP_X = 0.85;
slab(0.7, MW_H, th, CP_X, MW_H / 2, MW_D / 2 - th / 2, panelMat);
slab(0.46, 0.18, 0.03, CP_X, MW_H - 0.28, MW_D / 2 + 0.01, M.display);
for (let i = 0; i < 6; i++) {
  slab(
    0.12,
    0.08,
    0.03,
    CP_X - 0.15 + (i % 3) * 0.15,
    MW_H - 0.55 - Math.floor(i / 3) * 0.13,
    MW_D / 2 + 0.01,
    M.steel,
  );
}
{
  const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.08, 18), M.steel);
  knob.rotation.x = Math.PI / 2;
  knob.position.set(CP_X, 0.38, MW_D / 2 + 0.03);
  box.add(knob);
}
{
  const edges = xrayEdges(new THREE.BoxGeometry(MW_W, MW_H, MW_D));
  edges.position.y = MW_H / 2;
  box.add(edges);
}
// cavity liner: x -1.12..0.47, y 0.08..1.32, z -0.77..0.8
const CX0 = -1.12;
const CX1 = 0.47;
const CY0 = 0.08;
const CY1 = 1.32;
const CZ0 = -0.77;
const lw = 0.03;
const cxm = (CX0 + CX1) / 2;
const cw = CX1 - CX0;
slab(cw, lw, 1.57, cxm, CY0, 0.015, linerMat);
slab(cw, lw, 1.57, cxm, CY1, 0.015, linerMat);
slab(lw, CY1 - CY0, 1.57, CX0, (CY0 + CY1) / 2, 0.015, linerMat);
slab(lw, CY1 - CY0, 1.57, CX1, (CY0 + CY1) / 2, 0.015, linerMat);
slab(cw, CY1 - CY0, lw, cxm, (CY0 + CY1) / 2, CZ0, linerMat);
const lamp = new THREE.PointLight(0xffd8a0, 0, 4, 1.4);
lamp.position.set(cxm, CY1 - 0.12, 0.2);
mw.add(lamp);

// magnetron behind the control panel + the waveguide into the cavity
const magnetron = new THREE.Group();
magnetron.position.set(CP_X, 0.72, -0.1);
mw.add(magnetron);
slab(0.42, 0.42, 0.42, 0, 0, 0, M.magnetron, magnetron);
for (let i = 0; i < 7; i++) slab(0.5, 0.012, 0.5, 0, -0.2 + i * 0.066, 0, M.alu, magnetron);
const magCore = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 14), M.magCore);
magCore.position.y = 0.1;
magnetron.add(magCore);
slab(0.4, 0.16, 0.22, -0.32, 0.36, 0.0, M.magnetron, magnetron); // waveguide
const OUTLET = V(CX1 - 0.02, 0.72 + 0.36, -0.1); // waveguide mouth (microwave space)

// door: hinge on the left front edge
const door = new THREE.Group();
door.position.set(-MW_W / 2, 0, MW_D / 2);
mw.add(door);
const DW = 1.7;
slab(DW, 0.18, 0.07, DW / 2, MW_H - 0.09, 0.035, doorMat, door);
slab(DW, 0.18, 0.07, DW / 2, 0.09, 0.035, doorMat, door);
slab(0.16, MW_H, 0.07, 0.08, MW_H / 2, 0.035, doorMat, door);
slab(0.16, MW_H, 0.07, DW - 0.08, MW_H / 2, 0.035, doorMat, door);
slab(0.06, 0.9, 0.08, DW - 0.1, MW_H / 2, 0.11, M.chrome, door); // handle
let glass;
{
  // window: dark glass with the shielding dot grid (hidden in the macro
  // shots and in x-ray, so nothing screens the view into the cavity)
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  g.fillStyle = "rgba(18,20,26,0.5)";
  g.fillRect(0, 0, 64, 64);
  g.globalCompositeOperation = "destination-out";
  for (const [x, y] of [
    [16, 16],
    [48, 16],
    [16, 48],
    [48, 48],
    [32, 32],
    [0, 32],
    [64, 32],
    [32, 0],
    [32, 64],
  ]) {
    g.beginPath();
    g.arc(x, y, 9, 0, Math.PI * 2);
    g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(40, 30);
  tex.colorSpace = THREE.SRGBColorSpace;
  glass = new THREE.Mesh(
    new THREE.PlaneGeometry(DW - 0.32, MW_H - 0.36),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }),
  );
  glass.position.set(DW / 2, MW_H / 2, 0.05);
  door.add(glass);
}

// turntable with what's being heated: soup bowl (build/outro) or plate + fork
const TT = V(-0.35, CY0 + 0.03, 0);
const table = new THREE.Group();
table.position.copy(TT);
mw.add(table);
{
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.03, 28), M.turntable);
  disc.position.y = 0.03;
  table.add(disc);
}
const bowl = new THREE.Group();
table.add(bowl);
{
  const prof = [
    [0, 0],
    [0.18, 0],
    [0.2, 0.02],
    [0.36, 0.2],
    [0.38, 0.24],
    [0.35, 0.24],
    [0.33, 0.2],
    [0, 0.05],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const b = new THREE.Mesh(new THREE.LatheGeometry(prof, 20), M.bowl);
  b.position.y = 0.045;
  b.castShadow = true;
  bowl.add(b);
  const s = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.3, 0.02, 20), M.soup);
  s.position.y = 0.045 + 0.19;
  bowl.add(s);
}
const plate = new THREE.Group();
table.add(plate);
const tips = [];
{
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.38, 0.04, 26), M.plateBlue);
  p.position.y = 0.065;
  p.castShadow = true;
  plate.add(p);
  // fork lying on the plate, tines towards +x
  const fork = new THREE.Group();
  fork.position.set(0, 0.095, 0.02);
  fork.rotation.y = 0.35;
  plate.add(fork);
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.025, 0.07), M.fork);
  handle.position.x = -0.18;
  fork.add(handle);
  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.025, 0.14), M.fork);
  neck.position.x = 0.08;
  fork.add(neck);
  for (let i = 0; i < 4; i++) {
    const z = -0.055 + i * 0.037;
    const tine = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.02, 0.018), M.fork);
    tine.position.set(0.24, 0.0, z);
    fork.add(tine);
    const tip = new THREE.Object3D();
    tip.position.set(0.35, 0.0, z);
    fork.add(tip);
    tips.push(tip);
  }
}
const tipGlow = tips.map(() => {
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.03, 1), M.arc);
  scene.add(m);
  return m;
});
const sparkLight = new THREE.PointLight(0xbfe4ff, 0, 3.5, 1.2);
scene.add(sparkLight);

// waves bouncing around the cavity (microwave space)
const P = (x, y, z) => V(x, y, z);
const bounce = [
  [OUTLET, P(-1.05, 0.95, 0.35)],
  [P(-1.05, 0.95, 0.35), P(-0.1, 1.28, -0.55)],
  [P(-0.1, 1.28, -0.55), P(0.4, 0.55, 0.5)],
  [P(0.4, 0.55, 0.5), P(-0.35, 0.3, 0.1)],
];
const waveSets = bounce.map((pair) =>
  makeArrowSet([pair], { parent: mw, mat: M.wave, r: 0.028, amp: 0.06 }),
);
const toFood = makeArrowSet(
  [
    [P(-0.95, 1.2, 0.4), P(-0.4, 0.35, 0.05)],
    [P(0.3, 1.25, -0.4), P(-0.25, 0.35, -0.05)],
  ],
  { parent: mw, mat: M.wave, r: 0.03, amp: 0.06 },
);
// metal: waves hit the fork and come straight back
const mirror = makeArrowSet(
  [
    [P(-0.9, 1.25, 0.2), P(-0.25, 0.3, 0.12)],
    [P(-0.2, 0.32, 0.12), P(0.35, 1.25, 0.3)],
  ],
  { parent: mw, mat: M.wave, r: 0.03, amp: 0.06 },
);

// steam (pure in t): little spheres rising and shrinking
function makeSteam(parent, n, spread, seed) {
  const r = rng(seed);
  const g = new THREE.Group();
  parent.add(g);
  const geo = new THREE.IcosahedronGeometry(1, 0);
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(geo, M.steam);
    m.userData = {
      x: (r() - 0.5) * spread,
      z: (r() - 0.5) * spread,
      ph: r(),
      s: 0.05 + r() * 0.05,
    };
    g.add(m);
  }
  return g;
}
function animSteam(g, t, k, h = 0.9) {
  g.visible = k > 0.01;
  for (const m of g.children) {
    const u = (t * 0.45 + m.userData.ph) % 1;
    m.position.set(m.userData.x + Math.sin(u * 6 + m.userData.ph * 9) * 0.06, u * h, m.userData.z);
    m.scale.setScalar(Math.max(0.001, k * m.userData.s * (1 + u) * (1 - u) * 2));
  }
}
const bowlSteam = makeSteam(bowl, 10, 0.4, 5);
bowlSteam.position.y = 0.28;

// ---------------------------------------------------------------- lightning arcs
const arcs = [0, 1, 2, 3].map(() => {
  const m = new THREE.Mesh(new THREE.BufferGeometry(), M.arc);
  m.visible = false;
  m.userData.noAO = true;
  scene.add(m);
  return m;
});
const tipW = [V(0, 0, 0), V(0, 0, 0), V(0, 0, 0), V(0, 0, 0)];
const up = V(0, 1, 0);
function setArc(m, a, b, seed, r) {
  const rr = rng(seed);
  const dir = b.clone().sub(a);
  const p1 = dir.clone().cross(up).normalize();
  if (p1.lengthSq() < 0.01) p1.set(1, 0, 0);
  const p2 = dir.clone().cross(p1).normalize();
  const pts = [];
  const N = 9;
  for (let i = 0; i <= N; i++) {
    const f = i / N;
    const j = Math.sin(Math.PI * f) * 0.22 * dir.length();
    pts.push(
      a
        .clone()
        .addScaledVector(dir, f)
        .addScaledVector(p1, (rr() - 0.5) * j)
        .addScaledVector(p2, (rr() - 0.5) * j),
    );
  }
  m.geometry.dispose();
  m.geometry = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0),
    N * 3,
    r,
    4,
  );
  m.visible = true;
}
// cavity points the arcs jump to (world space)
const wallPts = [
  V(-0.75, MY + 0.15, -0.35),
  V(0.05, MY + 0.2, 0.35),
  V(-0.25, MY + 0.55, 0.2),
  V(0.35, MY + 0.12, -0.25),
  V(-0.6, MY + 0.12, 0.4),
  V(0.15, MY + 0.45, -0.3),
];
// 0..1 how hard the fork sparks right now
function sparkLevel(t) {
  const burst = rng(Math.floor(t * 9) + 7000)() > 0.38 ? 1 : 0.0;
  if (t < T.du - 0.05)
    return t > T.blitze1 - 0.05 && t < T.blitze1 + 0.7 ? 1.4 : 0.85 * burst + 0.15;
  if (t >= T.zack && t < T.schau - 0.05)
    return t < T.zack + 0.8 || (t > T.blitze2 && t < T.blitze2 + 0.5) ? 1.5 : 0.7 + 0.5 * burst;
  if (t >= T.funken) return 0.9 * burst + 0.2;
  return 0;
}

// ---------------------------------------------------------------- set: water molecules on soup
const molSet = new THREE.Group();
molSet.position.set(...MOL);
scene.add(molSet);
{
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.9, 0.5, 20), M.woodDark);
  ped.position.y = 0.25;
  ped.castShadow = true;
  molSet.add(ped);
  const prof = [
    [0, 0],
    [0.5, 0],
    [0.55, 0.05],
    [1.05, 0.5],
    [1.1, 0.58],
    [1.02, 0.58],
    [0.98, 0.5],
    [0, 0.1],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const b = new THREE.Mesh(new THREE.LatheGeometry(prof, 28), M.bowl);
  b.position.y = 0.5;
  b.castShadow = true;
  molSet.add(b);
  const s = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 0.9, 0.04, 28), M.soup);
  s.position.y = 0.98;
  molSet.add(s);
}
const molecules = [];
{
  const oGeo = new THREE.IcosahedronGeometry(0.17, 1);
  const hGeo = new THREE.IcosahedronGeometry(0.1, 1);
  [
    [0, 0, 0.35],
    [-0.5, 0.05, 0.05],
    [0.5, 0.02, 0.0],
    [-0.2, 0.08, -0.45],
    [0.3, 0.06, -0.5],
    [-0.6, 0.03, 0.55],
    [0.6, 0.04, 0.5],
  ].forEach(([x, y, z], i) => {
    const g = new THREE.Group();
    g.position.set(x, 1.28 + y, z);
    const o = new THREE.Mesh(oGeo, M.oxy);
    o.castShadow = true;
    g.add(o);
    for (const s of [-1, 1]) {
      const h = new THREE.Mesh(hGeo, M.hyd);
      const a = s * 0.91; // half of 104.5°
      h.position.set(Math.sin(a) * 0.21, -Math.cos(a) * 0.21, 0);
      g.add(h);
    }
    g.userData.i = i;
    molSet.add(g);
    molecules.push(g);
  });
}
const molWaves = makeArrowSet(
  [
    [V(-1.9, 1.35, 0.3), V(1.9, 1.35, 0.3)],
    [V(-1.9, 1.6, -0.3), V(1.9, 1.6, -0.3)],
  ],
  { parent: molSet, mat: M.wave, r: 0.035, amp: 0.1 },
);
const molHeat = makeArrowSet(
  [
    [V(-0.4, 1.55, 0.2), V(-0.5, 2.6, 0.3)],
    [V(0.35, 1.55, 0.1), V(0.45, 2.6, 0.2)],
    [V(0, 1.6, -0.3), V(0, 2.7, -0.3)],
  ],
  { parent: molSet, mat: heatMat, r: 0.035 },
);

// ---------------------------------------------------------------- set: cut-open dumpling
const knSet = new THREE.Group();
knSet.position.set(...KN);
scene.add(knSet);
const KR = 0.62;
const knC = V(0, 0.62 + KR * 0.85, 0); // centre of the dumpling (set space)
const ring = { hot: null, core: null };
{
  const tb = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.56, 1.2), M.wood);
  tb.position.y = 0.28;
  tb.castShadow = true;
  knSet.add(tb);
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.68, 0.05, 28), M.plateWhite);
  p.position.y = 0.585;
  knSet.add(p);
  const k = new THREE.Group();
  k.position.copy(knC);
  k.scale.y = 0.85;
  knSet.add(k);
  const half = new THREE.Mesh(new THREE.SphereGeometry(KR, 22, 14, 0, Math.PI), M.crust);
  half.rotation.y = Math.PI; // solid half behind, cut face towards the camera (+z)
  half.castShadow = true;
  k.add(half);
  ring.hot = new THREE.Mesh(new THREE.CircleGeometry(KR, 40), M.hot);
  ring.hot.position.z = 0.002;
  k.add(ring.hot);
  ring.core = new THREE.Mesh(new THREE.CircleGeometry(KR, 40), M.core);
  ring.core.position.z = 0.005;
  k.add(ring.core);
}
const knWaves = makeArrowSet(
  [
    [V(-1.5, 1.9, 0.5), V(-0.62, knC.y + 0.1, 0.15)],
    [V(1.5, 1.9, 0.5), V(0.62, knC.y + 0.1, 0.15)],
    [V(0, 2.5, 0.4), V(0, knC.y + 0.55, 0.1)],
  ],
  { parent: knSet, mat: M.wave, r: 0.03, amp: 0.06 },
);
const knHeat = makeArrowSet(
  [
    [V(-0.58, knC.y, 0.06), V(-0.12, knC.y, 0.06)],
    [V(0.58, knC.y, 0.06), V(0.12, knC.y, 0.06)],
    [V(0, knC.y + 0.5, 0.06), V(0, knC.y + 0.12, 0.06)],
  ],
  { parent: knSet, mat: heatMat, r: 0.03 },
);
const knSteam = makeSteam(knSet, 14, 1.0, 9);
knSteam.position.set(0, knC.y + 0.35, -0.2);
const COLD = new THREE.Color(0x58b6ff);
const DOUGH = new THREE.Color(0xf2dfae);
const HOT = new THREE.Color(0xff6a2a);

// ---------------------------------------------------------------- set: the melting chocolate bar (1945)
const chocSet = new THREE.Group();
chocSet.position.set(...MOL);
scene.add(chocSet);
const chunks = [];
let puddle;
{
  const tb = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.6, 1.2), M.wood);
  tb.position.y = 0.3;
  tb.castShadow = true;
  chocSet.add(tb);
  // old radar magnetron on the left
  const mag = new THREE.Group();
  mag.position.set(-0.6, 0.85, 0);
  chocSet.add(mag);
  slab(0.45, 0.45, 0.45, 0, 0, 0, M.magnetron, mag);
  for (let i = 0; i < 6; i++) slab(0.55, 0.014, 0.55, 0, -0.18 + i * 0.072, 0, M.alu, mag);
  const c = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.55, 14), M.magCore);
  c.position.y = 0.1;
  mag.add(c);
  // chocolate bar on the right, half unwrapped
  const bar = new THREE.Group();
  bar.position.set(0.45, 0.6, 0.05);
  bar.rotation.y = -0.3;
  chocSet.add(bar);
  slab(0.3, 0.13, 0.42, -0.22, 0.065, 0, M.wrapper, bar);
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 2; j++) {
      const m = slab(0.13, 0.09, 0.19, -0.02 + i * 0.145, 0.045, -0.1 + j * 0.205, M.choc, bar);
      m.userData.base = m.position.clone();
      chunks.push(m);
    }
  puddle = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.012, 24), M.choc);
  puddle.position.set(0.12, 0.006, 0);
  bar.add(puddle);
}
// "1945" sign on the back of the table (the panel would sit under the fact badge)
const sign = new THREE.Group();
sign.position.set(0.15, 0.6, -0.45);
chocSet.add(sign);
{
  slab(0.06, 0.4, 0.06, 0, 0.2, -0.02, M.woodDark, sign);
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = "#fff6e0";
  g.fillRect(0, 0, 512, 256);
  g.strokeStyle = "#ffd23f";
  g.lineWidth = 22;
  g.strokeRect(11, 11, 490, 234);
  g.fillStyle = "#1c1c22";
  g.font = '800 150px "Montserrat", sans-serif';
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("1945", 256, 138);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const board = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 0.4),
    new THREE.MeshBasicMaterial({ map: tex }),
  );
  board.position.set(0, 0.5, 0.02);
  sign.add(board);
  document.fonts.load('800 150px "Montserrat"').then(() => {
    g.fillStyle = "#fff6e0";
    g.fillRect(22, 22, 468, 212);
    g.fillStyle = "#1c1c22";
    g.fillText("1945", 256, 138);
    tex.needsUpdate = true;
  });
}

const chocWaves = makeArrowSet(
  [
    [V(-0.3, 1.0, 0.1), V(0.4, 0.75, 0.1)],
    [V(-0.3, 0.8, -0.15), V(0.4, 0.7, -0.1)],
  ],
  { parent: chocSet, mat: M.wave, r: 0.025, amp: 0.05 },
);

const applyCamera = shotCamera(shots);
const setPop = (set, k, at, t) => {
  set.visible = k > 0.001;
  if (k > 0) set.scale.copy(squash(t, at - 0.05)).multiplyScalar(k);
  else set.scale.setScalar(1e-3);
};

// ---------------------------------------------------------------- render
function renderAt(t) {
  const hook = t < T.du + 0.35;
  const back = T.kiste + 0.1;

  // ---- the microwave: shrinks away after the hook, the box pops back
  if (hook) {
    mw.scale.setScalar(Math.max(0.001, 1 - inBack(ramp(t, T.du, T.du + 0.35))));
    mw.visible = true;
  } else {
    mw.visible = t >= back;
    mw.scale.copy(squash(t, back));
  }
  puff("box", t, back + 0.2, 0, MY + 0.02, 0, 1.6);
  const magOn = hook || t >= T.magnetron + 0.1;
  magnetron.visible = magOn;
  magnetron.scale.copy(hook ? V(1, 1, 1) : squash(t, T.magnetron + 0.1, 0.6));

  // running: lamp, magnetron glow, turntable, display
  const running =
    t < T.du || (t >= T.feuert && t < T.wasser) || (t >= T.metall && t < T.schau) || t >= T.schon;
  lamp.intensity = running ? 1.6 : 0;
  M.magCore.emissiveIntensity = running ? 1.6 + 0.4 * Math.sin(t * 40) : 0;
  M.display.emissiveIntensity = running ? 1.2 : 0.2;
  // turntable: a slow turn in the hook, still afterwards so the fork stays in the macro shots
  table.rotation.y = t < T.du ? 0.06 * t : 0;

  // what's in the microwave
  const fork = t < T.du || (t >= T.metall && t < T.schau) || t >= T.schon;
  plate.visible = fork;
  bowl.visible = !fork;
  bowl.scale.copy(t >= T.kiste && t < T.metall ? squash(t, T.kiste + 0.3, 0.6) : V(1, 1, 1));
  M.soup.emissiveIntensity =
    0.6 * smooth(ramp(t, T.wellen2, T.wasser)) * (t < T.metall ? 1 : 0) + (t >= T.schau ? 0.35 : 0);
  animSteam(bowlSteam, t, t >= T.gebaut ? smooth(ramp(t, T.gebaut, T.gebaut + 0.6)) : 0, 0.8);

  // door opens on "gebaut", closed again for the CTA
  const open =
    t >= T.gebaut - 0.1 && t < T.schon ? smooth(ramp(t, T.gebaut - 0.1, T.gebaut + 0.6)) : 0;
  door.rotation.y = -1.75 * open;

  // x-ray only while the magnetron and the waves are explained
  const xray =
    smooth(ramp(t, T.magnetron - 0.2, T.magnetron + 0.3)) *
    (1 - ramp(t, T.wasser, T.wasser + 0.01));
  setXray([shellMat, linerMat, panelMat, doorMat], hook ? 0 : xray);
  glass.visible = !(t < T.warum || (t >= T.metall && t < T.schau) || xray > 0.02);

  // waves bounce around, one leg after the other, then into the soup
  const legs = [T.feuert + 0.1, T.wellen1 + 0.2, T.ueberall, T.ueberall + 0.5];
  waveSets.forEach((s, i) => animateArrows(s, t, pop(t, legs[i], T.trick)));
  animateArrows(toFood, t, pop(t, T.trick, T.wasser));
  animateArrows(mirror, t, pop(t, T.spiegelt, T.zinken));

  // ---- fork: charge builds up on the tines, then lightning
  mw.updateMatrixWorld(true);
  tips.forEach((tp, i) => tp.getWorldPosition(tipW[i]));
  const charge = t >= T.staut && t < T.schau ? smooth(ramp(t, T.staut, T.staut + 0.9)) : 0;
  const lvl = fork ? sparkLevel(t) : 0;
  M.fork.emissiveIntensity = Math.max(charge * 0.9, lvl > 0 ? 0.25 * lvl : 0);
  tipGlow.forEach((m, i) => {
    const k = Math.max(charge * (0.7 + 0.3 * Math.sin(t * 30 + i * 2)), lvl * 0.8);
    m.visible = fork && k > 0.02;
    m.position.copy(tipW[i]);
    m.scale.setScalar(Math.max(0.001, k * (1.4 + 0.4 * Math.sin(t * 50 + i))));
  });
  const fr = Math.floor(t * 15);
  arcs.forEach((m, i) => {
    const on = lvl > 0 && (i < 2 || lvl > 1 || rng(fr * 13 + i)() > 0.5);
    if (!on) {
      m.visible = false;
      return;
    }
    const rr = rng(fr * 31 + i * 7 + 3);
    const a = tipW[Math.floor(rr() * 4)];
    const b = wallPts[Math.floor(rr() * wallPts.length)];
    setArc(m, a, b, fr * 17 + i, 0.014 * Math.min(1.6, lvl) + 0.008);
  });
  sparkLight.position.copy(tipW[1]).add(V(0, 0.15, 0));
  sparkLight.intensity = fork ? 2.2 * lvl * (0.7 + 0.3 * Math.sin(t * 70)) : 0;
  puff("zack", t, T.zack, tipW[1].x, tipW[1].y, tipW[1].z, 0.35, 0xcfe9ff);

  // ---- set: water molecules
  const mk = pop(t, T.wasser - 0.05, T.aber);
  setPop(molSet, mk, T.wasser, t);
  const wild = smooth(ramp(t, T.milliarden - 0.1, T.milliarden + 0.3));
  for (const g of molecules) {
    const i = g.userData.i;
    g.rotation.z = lerp(Math.sin(t * 2.2 + i) * 0.35, Math.sin(t * 61 + i * 1.7) * 1.4, wild);
    g.rotation.y = lerp(Math.sin(t * 1.5 + i * 2) * 0.4, Math.sin(t * 43 + i) * 1.1, wild);
    g.position.y = 1.28 + Math.sin(t * 2 + i) * 0.03 + wild * Math.sin(t * 37 + i) * 0.02;
  }
  const heat = smooth(ramp(t, T.reibung, T.hitze + 0.4));
  M.oxy.emissiveIntensity = 0.9 * heat;
  M.hyd.emissiveIntensity = 0.6 * heat;
  animateArrows(molWaves, t, pop(t, T.wasser + 0.2, T.aber));
  animateArrows(molHeat, t, pop(t, T.reibung + 0.1, T.aber));

  // ---- set: the dumpling cut open, hot only 1–2 cm deep
  const kk = pop(t, T.aber - 0.05, T.metall);
  setPop(knSet, kk, T.aber, t);
  const d = KR * 0.3 * smooth(ramp(t, T.zwei, T.zwei + 0.6));
  const hotK = smooth(ramp(t, T.zwei, T.zwei + 0.4));
  M.hot.color.copy(DOUGH).lerp(HOT, hotK);
  M.hot.emissiveIntensity = 0.55 * hotK;
  ring.core.scale.setScalar(Math.max(0.001, (KR - d) / KR));
  const cold = smooth(ramp(t, T.kern, T.eiskalt + 0.3));
  M.core.color.copy(DOUGH).lerp(COLD, cold);
  M.core.emissiveIntensity = 0.35 * cold;
  animateArrows(knWaves, t, pop(t, T.aber + 0.2, T.kern));
  animateArrows(knHeat, t, pop(t, T.kern + 0.1, T.eiskalt));
  animSteam(knSteam, t, pop(t, T.heiss - 0.1, T.metall), 1.1);

  // ---- set: the chocolate bar melts next to an old radar magnetron
  const ck = pop(t, T.uebrigens - 0.05, T.schon);
  setPop(chocSet, ck, T.uebrigens, t);
  const melt = smooth(ramp(t, T.erfunden + 0.6, T.schmolz + 0.5));
  for (const m of chunks) {
    m.scale.set(1 + 0.3 * melt, Math.max(0.05, 1 - 0.8 * melt), 1 + 0.3 * melt);
    m.position.y = m.userData.base.y * (1 - 0.75 * melt);
  }
  puddle.scale.set(0.1 + 0.22 * melt, 1, 0.1 + 0.18 * melt);
  sign.visible = t >= T.erfunden;
  sign.scale.copy(squash(t, T.erfunden));
  puddle.visible = melt > 0.01;
  animateArrows(chocWaves, t, pop(t, T.erfunden, T.schon));

  // ---- LED panel: one fact at a time
  if (t >= T.milliarden && t < T.aber) {
    showPanel(pop(t, T.milliarden, T.aber), "MILLIARDEN MAL/SEK.", "2,45", LED.yellow);
  } else if (t >= T.zwei && t < T.metall) {
    showPanel(pop(t, T.zwei, T.metall), "NUR SO TIEF", "2 cm", LED.red);
  } else {
    showPanel(0);
  }

  labels(t, LABELS);
  showLabel("zinken", pop(t, T.zinken, T.staut + 0.4), "Zinken", tipW[0], -1);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
