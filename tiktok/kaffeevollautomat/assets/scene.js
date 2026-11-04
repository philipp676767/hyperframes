// #56 Kaffeevollautomat — the machine on the office worktop (set.js), built
// with its insides: hopper + beans, the conical grinder (Mahlwerk), the brew
// unit with piston (Kolben) and puck, tank → pump → heater → brew unit, the
// spout and the cup with crema. Mini-sets: water over powder (→ brown
// broth), three cups, a diver sinking to 90 m, the roasted bean with its
// CO2, old vs fresh espresso, espresso vs filter mug.
import {
  THREE,
  ramp,
  smooth,
  clamp01,
  lerp,
  pop,
  V,
  rng,
  scene,
  flat,
  M,
  facet,
  facetMat,
  xrayMaterial,
  xrayEdges,
  setXray,
  showNope,
  makeArrowSet,
  animateArrows,
  forceMat,
  showPanel,
  LED,
  labels,
  squash,
  puff,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import "./set.js";
import { createHand } from "./hand.js";
import { gauge, counter, meter } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS, SPOT_A, SPOT_B, DIVE } from "./beats.js";

highlights(HIGHLIGHTS);
const R = rng(560);

// ================================================================ helpers
const mesh = (geo, mat, x = 0, y = 0, z = 0, parent = scene, shadow = true) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = shadow;
  parent.add(m);
  return m;
};
// a polyline track with cumulative lengths: at(f) → point at fraction f
function track(pts) {
  const v = pts.map((p) => V(...p));
  const L = [0];
  for (let i = 1; i < v.length; i++) L.push(L[i - 1] + v[i].distanceTo(v[i - 1]));
  const tot = L[L.length - 1];
  const out = V(0, 0, 0);
  return {
    pts: v,
    at(f) {
      const d = clamp01(f) * tot;
      let i = 1;
      while (i < L.length - 1 && L[i] < d) i++;
      const k = (d - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
      return out.copy(v[i - 1]).lerp(v[i], k);
    },
  };
}
// instanced beads that run along a track while vis > 0
function beads(n, size, tr, colorFn, parent) {
  const im = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(size, 0),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
    n,
  );
  im.userData.noAO = true;
  im.frustumCulled = false;
  const c = new THREE.Color();
  for (let i = 0; i < n; i++) im.setColorAt(i, c.set(colorFn(i / n, 0)));
  parent.add(im);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  return (t, vis, speed = 0.55) => {
    im.visible = vis > 0.01;
    if (!im.visible) return;
    for (let i = 0; i < n; i++) {
      const f = (i / n + t * speed) % 1;
      const p = tr.at(f);
      const s = vis * (0.7 + 0.3 * Math.sin(i * 7.1));
      m4.compose(p, q, V(s, s, s));
      im.setMatrixAt(i, m4);
      im.setColorAt(i, c.set(colorFn(f, i)));
    }
    im.instanceMatrix.needsUpdate = true;
    im.instanceColor.needsUpdate = true;
  };
}
// espresso cup: returns { group, liquid, crema, setLevel(h, cremaH) }
function espressoCup(parent, { s = 1, color = 0xffffff, saucer = true } = {}) {
  const g = new THREE.Group();
  parent.add(g);
  const porcelain = flat(color, { roughness: 0.25 });
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.26, 20, 1, true), porcelain);
  wall.material.side = THREE.DoubleSide;
  wall.position.y = 0.16;
  wall.castShadow = true;
  g.add(wall);
  mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.02, 20), porcelain, 0, 0.04, 0, g);
  const hd = mesh(new THREE.TorusGeometry(0.07, 0.022, 6, 12), porcelain, 0.22, 0.17, 0, g);
  hd.rotation.y = 0;
  if (saucer) mesh(new THREE.CylinderGeometry(0.32, 0.27, 0.03, 24), porcelain, 0, 0.015, 0, g);
  const liquid = mesh(
    new THREE.CylinderGeometry(0.185, 0.15, 1, 20),
    flat(0x2a150b, { roughness: 0.15 }),
    0,
    0,
    0,
    g,
    false,
  );
  const crema = mesh(
    new THREE.CylinderGeometry(0.19, 0.19, 1, 20),
    flat(0xc98a3e, { roughness: 0.6, emissive: 0x6a3a10, emissiveIntensity: 0 }),
    0,
    0,
    0,
    g,
    false,
  );
  g.scale.setScalar(s);
  return {
    group: g,
    liquid,
    crema,
    setLevel(h, ch = 0) {
      // h = liquid height above the cup floor (max ~0.22)
      liquid.visible = h > 0.005;
      liquid.scale.y = Math.max(0.001, h);
      liquid.position.y = 0.05 + h / 2;
      const r = 0.15 + (0.2 - 0.15) * clamp01(h / 0.26);
      liquid.scale.x = liquid.scale.z = r / 0.185;
      crema.visible = ch > 0.002 && h > 0.01;
      crema.scale.y = Math.max(0.001, ch);
      crema.position.y = 0.05 + h + ch / 2;
      const rc = 0.15 + 0.05 * clamp01((h + ch) / 0.26);
      crema.scale.x = crema.scale.z = rc / 0.19;
    },
  };
}

// ================================================================ the machine
const machine = new THREE.Group();
scene.add(machine);
const RED = 0xc8323a;
const shellMat = xrayMaterial(RED, { roughness: 0.28 });
const fasciaMat = xrayMaterial(0x17171d, { roughness: 0.12 });
const shellMats = [shellMat, fasciaMat];
function shell(w, h, d, x, y, z, mat = shellMat) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const m = mesh(geo, mat, x, y, z, machine);
  const e = xrayEdges(geo);
  e.position.copy(m.position);
  machine.add(e);
  return m;
}
shell(1.8, 1.3, 2.1, 0, 1.85, 0); // upper block
shell(1.8, 1.2, 1.4, 0, 0.6, -0.35); // back block
shell(0.32, 1.2, 0.7, -0.74, 0.6, 0.7); // cheeks
shell(0.32, 1.2, 0.7, 0.74, 0.6, 0.7);
shell(1.5, 0.92, 0.04, 0, 1.92, 1.06, fasciaMat); // black glass front
// hopper lid on top (smoked)
const lid = mesh(
  new THREE.CylinderGeometry(0.44, 0.46, 0.24, 18),
  new THREE.MeshStandardMaterial({
    color: 0x4a2c1a,
    roughness: 0.1,
    transparent: true,
    opacity: 0.75,
  }),
  -0.35,
  2.62,
  -0.35,
  machine,
);
lid.userData.noAO = true;
// drip tray with a chrome grid
mesh(new THREE.BoxGeometry(1.16, 0.12, 0.72), flat(0x2a2a30), 0, 0.06, 0.72, machine);
const grid = mesh(new THREE.BoxGeometry(1.1, 0.02, 0.66), M.chrome, 0, 0.13, 0.72, machine);
grid.receiveShadow = true;
// display + buttons
const dispMat = new THREE.MeshBasicMaterial({ color: 0x1b2a30 });
mesh(new THREE.PlaneGeometry(0.62, 0.3), dispMat, -0.15, 2.12, 1.085, machine, false);
const iconMat = new THREE.MeshBasicMaterial({ color: 0x1b2a30 });
{
  // a tiny cup icon on the display
  const ic = new THREE.Group();
  ic.add(new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.09), iconMat));
  const h = new THREE.Mesh(new THREE.RingGeometry(0.02, 0.032, 10), iconMat);
  h.position.set(0.075, 0.01, 0);
  ic.add(h);
  ic.position.set(-0.15, 2.12, 1.087);
  machine.add(ic);
}
const btnMats = [];
[-0.5, 0.18, 0.45].forEach((x, i) => {
  const m = flat(i === 1 ? 0xf2f2f2 : 0x9aa3ad, {
    roughness: 0.3,
    emissive: 0xffb347,
    emissiveIntensity: 0,
  });
  btnMats.push(m);
  const b = mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 16), m, x, 1.68, 1.09, machine);
  b.rotation.x = Math.PI / 2;
});
const startBtn = machine.children[machine.children.length - 2]; // the middle button
// spout under the upper block
mesh(new THREE.BoxGeometry(0.36, 0.12, 0.26), M.chrome, 0, 1.15, 0.8, machine);
for (const dx of [-0.07, 0.07])
  mesh(new THREE.CylinderGeometry(0.025, 0.02, 0.1, 8), M.chrome, dx, 1.05, 0.82, machine);

// ---------------------------------------------------------------- insides
const steelGlass = new THREE.MeshStandardMaterial({
  color: 0xaebccb,
  metalness: 0.5,
  roughness: 0.25,
  transparent: true,
  opacity: 0.22,
  side: THREE.DoubleSide,
  depthWrite: false,
});
// hopper funnel + beans
const funnel = mesh(
  new THREE.CylinderGeometry(0.42, 0.14, 0.48, 14, 1, true),
  steelGlass,
  -0.35,
  2.26,
  -0.35,
  machine,
  false,
);
funnel.userData.noAO = true;
const beanGeo = facet(new THREE.SphereGeometry(0.045, 6, 4).scale(1, 0.7, 1.35), 0.12, 3);
const beanMat = facetMat(flat(0x5a3218, { roughness: 0.35 }));
const hopperBeans = new THREE.InstancedMesh(beanGeo, beanMat, 70);
{
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  for (let i = 0; i < 70; i++) {
    const y = 2.1 + R() * 0.5;
    const rr = (0.12 + (y - 2.05) * 0.55) * Math.sqrt(R());
    const a = R() * 6.28;
    q.setFromEuler(new THREE.Euler(R() * 3, R() * 3, R() * 3));
    m4.compose(V(-0.35 + Math.cos(a) * rr, y, -0.35 + Math.sin(a) * rr), q, V(1, 1, 1));
    hopperBeans.setMatrixAt(i, m4);
  }
}
machine.add(hopperBeans);
// conical grinder: outer ring + spinning inner cone
const burrOuter = mesh(
  new THREE.CylinderGeometry(0.3, 0.27, 0.2, 18, 1, true),
  flat(0x7d8894, { metalness: 0.6, roughness: 0.35, side: THREE.DoubleSide }),
  -0.35,
  1.9,
  -0.35,
  machine,
);
const burr = new THREE.Group();
burr.position.set(-0.35, 1.86, -0.35);
machine.add(burr);
{
  const cone = mesh(
    new THREE.ConeGeometry(0.24, 0.32, 10),
    flat(0x9aa6b3, { metalness: 0.7, roughness: 0.3 }),
    0,
    0,
    0,
    burr,
  );
  for (let i = 0; i < 10; i++) {
    const rib = mesh(
      new THREE.BoxGeometry(0.03, 0.3, 0.05),
      flat(0x5f6a76, { metalness: 0.6 }),
      0,
      0,
      0,
      burr,
    );
    const a = (i / 10) * Math.PI * 2;
    rib.position.set(Math.cos(a) * 0.13, -0.02, Math.sin(a) * 0.13);
    rib.rotation.set(0, -a, 0.6);
  }
  cone.rotation.y = 0.2;
}
// motor under the grinder
mesh(
  new THREE.CylinderGeometry(0.14, 0.14, 0.22, 12),
  flat(0x3a3f47, { metalness: 0.4 }),
  -0.35,
  1.62,
  -0.35,
  machine,
);
// chute grinder → brew unit
mesh(
  new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([V(-0.2, 1.8, -0.25), V(-0.08, 1.74, -0.1), V(0, 1.68, 0.02)]),
    12,
    0.06,
    8,
  ),
  steelGlass,
  0,
  0,
  0,
  machine,
  false,
);
// brew unit: chamber (glassy steel), sieve, piston on a rod
const CH = { x: 0, z: 0.05, y0: 1.0, h: 0.52, r: 0.28 };
const chamber = mesh(
  new THREE.CylinderGeometry(CH.r, CH.r, CH.h, 20, 1, true),
  steelGlass,
  0,
  CH.y0 + CH.h / 2,
  CH.z,
  machine,
  false,
);
chamber.userData.noAO = true;
for (const y of [CH.y0, CH.y0 + CH.h])
  mesh(new THREE.TorusGeometry(CH.r, 0.025, 6, 24), M.chrome, 0, y, CH.z, machine).rotation.x =
    Math.PI / 2;
mesh(
  new THREE.CylinderGeometry(CH.r - 0.01, CH.r - 0.01, 0.03, 20),
  M.chrome,
  0,
  CH.y0 + 0.01,
  CH.z,
  machine,
);
const piston = new THREE.Group();
machine.add(piston);
mesh(new THREE.CylinderGeometry(CH.r - 0.015, CH.r - 0.015, 0.07, 20), M.chrome, 0, 0, 0, piston);
mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.6, 10), M.chrome, 0, 0.33, 0, piston);
mesh(
  new THREE.BoxGeometry(0.4, 0.08, 0.16),
  flat(0x3a3f47, { metalness: 0.5 }),
  0,
  0.62,
  0,
  piston,
);
piston.position.set(CH.x, 0, CH.z);
// powder → puck
const powderMat = flat(0x9a5f2e, { roughness: 0.95, emissive: 0x3a1a06, emissiveIntensity: 0.35 });
const powder = mesh(
  new THREE.CylinderGeometry(CH.r - 0.02, CH.r - 0.02, 1, 20),
  powderMat,
  0,
  0,
  CH.z,
  machine,
  false,
);
// tank (water), pump, heater, pipes
const tank = mesh(
  new THREE.BoxGeometry(0.36, 1.7, 0.66),
  new THREE.MeshStandardMaterial({
    color: 0x9bd8ff,
    roughness: 0.05,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  }),
  0.6,
  1.05,
  -0.62,
  machine,
  false,
);
tank.userData.noAO = true;
mesh(
  new THREE.BoxGeometry(0.32, 1.25, 0.62),
  M.water,
  0.6,
  0.82,
  -0.62,
  machine,
  false,
).userData.noAO = true;
const pump = new THREE.Group();
pump.position.set(0.28, 0.32, -0.55);
machine.add(pump);
{
  const p = mesh(
    new THREE.CylinderGeometry(0.11, 0.11, 0.34, 12),
    flat(0xc9963a, { metalness: 0.6, roughness: 0.3 }),
    0,
    0,
    0,
    pump,
  );
  p.rotation.z = Math.PI / 2;
  for (const dx of [-0.12, 0, 0.12]) {
    const ring = mesh(new THREE.TorusGeometry(0.115, 0.018, 6, 14), flat(0x8a6524), dx, 0, 0, pump);
    ring.rotation.y = Math.PI / 2;
  }
}
const heatMat2 = flat(0x6a6f78, {
  metalness: 0.5,
  roughness: 0.4,
  emissive: 0xff4a12,
  emissiveIntensity: 0,
});
mesh(new THREE.BoxGeometry(0.32, 0.3, 0.3), heatMat2, 0.02, 0.62, -0.55, machine);
const heatLight = new THREE.PointLight(0xff6a2a, 0, 1.6, 1.5);
heatLight.position.set(0.02, 0.7, -0.35);
machine.add(heatLight);
const waterPath = [
  [0.55, 0.22, -0.6],
  [0.45, 0.3, -0.55],
  [0.12, 0.32, -0.55],
  [0.02, 0.45, -0.55],
  [0.02, 0.8, -0.55],
  [0.0, 1.7, -0.45],
  [0.0, 1.78, -0.15],
  [0.0, 1.7, 0.05],
];
const pipeMat = flat(0xc8743c, { metalness: 0.6, roughness: 0.3 });
mesh(
  new THREE.TubeGeometry(new THREE.CatmullRomCurve3(waterPath.map((p) => V(...p))), 60, 0.03, 8),
  pipeMat,
  0,
  0,
  0,
  machine,
  false,
);
const coffeePath = [
  [0.0, 0.98, 0.05],
  [0.0, 0.9, 0.3],
  [0.0, 0.98, 0.62],
  [0.0, 1.1, 0.8],
];
mesh(
  new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coffeePath.map((p) => V(...p))), 30, 0.035, 8),
  steelGlass,
  0,
  0,
  0,
  machine,
  false,
);
const waterFlow = beads(
  46,
  0.03,
  track(waterPath),
  (f) => (f < 0.5 ? 0x46b8ff : f < 0.62 ? 0xffa83a : 0xff5a26),
  machine,
);
const coffeeFlow = beads(
  26,
  0.032,
  track(coffeePath),
  (f, i) => (i % 3 === 0 ? 0xffd78a : 0x7a4420),
  machine,
);
// water + gas pushing through the puck (inside the chamber): rising/sinking dots
const puckBubbles = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.035, 0),
  new THREE.MeshBasicMaterial({ color: 0xffffff }),
  60,
);
puckBubbles.frustumCulled = false;
puckBubbles.userData.noAO = true;
machine.add(puckBubbles);
const pbSeed = Array.from({ length: 60 }, () => [R(), R(), R()]);
// falling beans into the grinder + powder into the chamber
const fallBeans = new THREE.InstancedMesh(beanGeo, beanMat, 14);
fallBeans.frustumCulled = false;
machine.add(fallBeans);
const powderFall = beads(
  40,
  0.022,
  track([
    [-0.3, 1.74, -0.3],
    [-0.12, 1.72, -0.12],
    [0, 1.66, 0.03],
    [0, 1.25, 0.05],
  ]),
  () => 0x9a6a3e,
  machine,
);
// pressure arrows onto the piston
const pressArrows = makeArrowSet(
  [
    [V(-0.2, 2.15, 0.05), V(-0.2, 1.55, 0.05)],
    [V(0.2, 2.15, 0.05), V(0.2, 1.55, 0.05)],
    [V(0, 2.2, 0.28), V(0, 1.6, 0.28)],
  ],
  { parent: machine, mat: forceMat, amp: 0, r: 0.03 },
);

// ---------------------------------------------------------------- cup + streams (main)
const cup = espressoCup(machine);
cup.group.position.set(0, 0.14, 0.82);
const streamMat = flat(0xb0662a, { roughness: 0.2, emissive: 0x7a3a0a, emissiveIntensity: 0.5 });
const streams = [-0.07, 0.07].map((dx) =>
  mesh(new THREE.CylinderGeometry(0.011, 0.009, 1, 8), streamMat, dx, 0, 0.82, machine, false),
);
const cremaDots = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.009, 0),
  flat(0xf3d29a, { roughness: 0.4, emissive: 0x6a3a10, emissiveIntensity: 0.2 }),
  90,
);
cremaDots.frustumCulled = false;
machine.add(cremaDots);
const steamMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.18,
  depthWrite: false,
});
const steamPuffs = Array.from({ length: 6 }, () => {
  const s = mesh(new THREE.IcosahedronGeometry(0.06, 0), steamMat, 0, 0, 0, machine, false);
  s.userData.noAO = true;
  return s;
});

// ---------------------------------------------------------------- the viewer's hand
const hand = createHand({ scale: 0.75, sleeve: 0x2f3f66 });

// ================================================================ mini-sets
const spotA = new THREE.Group();
spotA.position.set(...SPOT_A);
scene.add(spotA);
const spotB = new THREE.Group();
spotB.position.set(...SPOT_B);
scene.add(spotB);

// (1) water over powder → brown broth (SPOT_B)
const broth = new THREE.Group();
spotB.add(broth);
const glassCupMat = new THREE.MeshStandardMaterial({
  color: 0xe6f4ff,
  roughness: 0.05,
  transparent: true,
  opacity: 0.35,
  depthWrite: false,
  side: THREE.DoubleSide,
});
mesh(
  new THREE.CylinderGeometry(0.42, 0.36, 0.8, 20, 1, true),
  glassCupMat,
  0,
  0.4,
  0,
  broth,
  false,
).userData.noAO = true;
mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.03, 20), glassCupMat, 0, 0.015, 0, broth, false);
const brothPowder = mesh(
  new THREE.CylinderGeometry(0.34, 0.34, 0.08, 20),
  flat(0x8a5a34),
  0,
  0.06,
  0,
  broth,
  false,
);
const brothLiquidMat = flat(0xb7a48a, { roughness: 0.2, transparent: true, opacity: 0.85 });
const brothLiquid = mesh(
  new THREE.CylinderGeometry(0.39, 0.35, 1, 20),
  brothLiquidMat,
  0,
  0,
  0,
  broth,
  false,
);
const clumps = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.04, 0), flat(0x6b4426), 18);
broth.add(clumps);
const kettle2 = new THREE.Group();
broth.add(kettle2);
{
  const b = mesh(
    new THREE.CylinderGeometry(0.34, 0.42, 0.75, 12),
    flat(0xf4f1ec, { roughness: 0.3 }),
    0,
    0,
    0,
    kettle2,
  );
  const sp = mesh(new THREE.ConeGeometry(0.07, 0.4, 6), flat(0xf4f1ec), -0.42, 0.18, 0, kettle2);
  sp.rotation.z = 1.0;
  mesh(
    new THREE.TorusGeometry(0.24, 0.05, 6, 10, Math.PI),
    flat(0x2a2d33),
    0.36,
    0.12,
    0,
    kettle2,
  ).rotation.z = -Math.PI / 2;
  b.castShadow = true;
}
const pourStream = mesh(
  new THREE.CylinderGeometry(0.035, 0.03, 1, 8),
  new THREE.MeshStandardMaterial({
    color: 0x9fd8ff,
    roughness: 0.05,
    transparent: true,
    opacity: 0.75,
  }),
  0,
  0,
  0,
  broth,
  false,
);

// (2) three cups (SPOT_A): espresso, cappuccino, Hafer-Latte
const trio = new THREE.Group();
spotA.add(trio);
const trioEsp = espressoCup(trio, { s: 1.5 });
trioEsp.group.position.set(-0.85, 0, 0.1);
trioEsp.setLevel(0.17, 0.04);
const capp = new THREE.Group();
trio.add(capp);
{
  const porc = flat(0x2f6fd6, { roughness: 0.3 });
  mesh(new THREE.CylinderGeometry(0.42, 0.28, 0.48, 20), porc, 0, 0.27, 0, capp);
  mesh(new THREE.CylinderGeometry(0.55, 0.48, 0.04, 24), porc, 0, 0.02, 0, capp);
  mesh(new THREE.TorusGeometry(0.12, 0.035, 6, 12), porc, 0.45, 0.3, 0, capp);
  const foam = mesh(
    new THREE.CylinderGeometry(0.4, 0.4, 0.05, 24),
    flat(0xf3e2c6),
    0,
    0.5,
    0,
    capp,
  );
  const heart = mesh(new THREE.CircleGeometry(0.16, 3), flat(0xa86a3a), 0, 0.53, 0, capp, false);
  heart.rotation.x = -Math.PI / 2;
  heart.rotation.z = -Math.PI / 2;
  foam.castShadow = false;
}
capp.position.set(0.1, 0, 0);
const latte = new THREE.Group();
trio.add(latte);
{
  const g = new THREE.MeshStandardMaterial({
    color: 0xe6f4ff,
    roughness: 0.05,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const gl = mesh(
    new THREE.CylinderGeometry(0.28, 0.24, 1.1, 18, 1, true),
    g,
    0,
    0.55,
    0,
    latte,
    false,
  );
  gl.userData.noAO = true;
  mesh(new THREE.CylinderGeometry(0.235, 0.22, 0.55, 18), flat(0xefe2cc), 0, 0.3, 0, latte, false);
  mesh(
    new THREE.CylinderGeometry(0.255, 0.235, 0.22, 18),
    flat(0x9a6238),
    0,
    0.68,
    0,
    latte,
    false,
  );
  mesh(new THREE.CylinderGeometry(0.27, 0.255, 0.18, 18), flat(0xfaf3e6), 0, 0.88, 0, latte, false);
  const oat = mesh(new THREE.BoxGeometry(0.42, 0.9, 0.3), flat(0xf2d27a), 0.62, 0.45, -0.35, latte);
  oat.rotation.y = -0.3;
}
latte.position.set(1.05, 0, -0.05);

// (3) old vs fresh espresso (SPOT_A)
const compare = new THREE.Group();
spotA.add(compare);
const oldCup = espressoCup(compare, { s: 1.6 });
oldCup.group.position.set(-0.55, 0, 0);
oldCup.setLevel(0.2, 0);
const freshCup = espressoCup(compare, { s: 1.6 });
freshCup.group.position.set(0.55, 0, 0);
freshCup.setLevel(0.17, 0.05);

// (4) the roasted bean + its CO2 (SPOT_B)
const bean = new THREE.Group();
spotB.add(bean);
{
  const g = facet(new THREE.SphereGeometry(0.55, 14, 10).scale(1, 0.62, 1.35), 0.07, 9);
  const b = mesh(g, facetMat(flat(0x4a2614, { roughness: 0.3 })), 0, 0.36, 0, bean);
  b.rotation.y = 0.5;
}
const co2 = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.05, 1),
  new THREE.MeshStandardMaterial({
    color: 0x8fe2ff,
    emissive: 0x3fb8ff,
    emissiveIntensity: 0.6,
    roughness: 0.1,
    transparent: true,
    opacity: 0.85,
  }),
  34,
);
co2.frustumCulled = false;
co2.userData.noAO = true;
bean.add(co2);
const co2Seed = Array.from({ length: 34 }, () => [R(), R(), R()]);

// (5) espresso vs filter mug (SPOT_B)
const caf = new THREE.Group();
spotB.add(caf);
const cafEsp = espressoCup(caf, { s: 1.4 });
cafEsp.group.position.set(-0.6, 0, 0.15);
cafEsp.setLevel(0.17, 0.04);
{
  const porc = flat(0xf2c94c, { roughness: 0.35 });
  mesh(
    new THREE.CylinderGeometry(0.42, 0.38, 1.0, 20, 1, true),
    porc,
    0.45,
    0.5,
    -0.1,
    caf,
  ).material.side = THREE.DoubleSide;
  mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.03, 20), porc, 0.45, 0.02, -0.1, caf);
  mesh(new THREE.TorusGeometry(0.2, 0.05, 6, 12), porc, 0.9, 0.5, -0.1, caf);
  mesh(
    new THREE.CylinderGeometry(0.37, 0.35, 0.86, 20),
    flat(0x3a1e0e, { roughness: 0.15 }),
    0.45,
    0.47,
    -0.1,
    caf,
    false,
  );
}

// (6) the dive: a deep blue sea far below the office
const divePos = V(...DIVE);
const sea = new THREE.Group();
sea.position.copy(divePos);
scene.add(sea);
{
  const g = new THREE.SphereGeometry(32, 32, 18);
  const p = g.attributes.position;
  const col = new Float32Array(p.count * 3);
  const top = new THREE.Color(0x63d4ef);
  const mid = new THREE.Color(0x1a6aa6);
  const bot = new THREE.Color(0x041a36);
  const c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i) / 32;
    if (y > 0) c.copy(mid).lerp(top, Math.pow(y, 0.8));
    else c.copy(mid).lerp(bot, Math.pow(-y, 0.6));
    col.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const dome = new THREE.Mesh(
    g,
    new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false }),
  );
  dome.userData.noAO = true;
  sea.add(dome);
  const rayMat = new THREE.MeshBasicMaterial({
    color: 0xbdf2ff,
    transparent: true,
    opacity: 0.08,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: false,
  });
  for (let i = 0; i < 6; i++) {
    const ray = new THREE.Mesh(new THREE.PlaneGeometry(1.6 + i * 0.3, 40), rayMat);
    ray.position.set(-8 + i * 3.4, 6, -6 + (i % 3) * 3);
    ray.rotation.set(0, 0.4 * i, 0.18 - i * 0.05);
    ray.userData.noAO = true;
    sea.add(ray);
  }
  const floor = new THREE.Mesh(
    facet(new THREE.CircleGeometry(30, 24, 0, Math.PI * 2), 0.1, 5),
    facetMat(flat(0xc9b48a)),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -12;
  sea.add(floor);
  for (let i = 0; i < 9; i++) {
    const rk = new THREE.Mesh(
      facet(new THREE.IcosahedronGeometry(0.6 + R() * 1.2, 0), 0.1, i),
      facetMat(flat(0x6f7f8f)),
    );
    rk.position.set(-10 + R() * 20, -11.6, -9 + R() * 8);
    sea.add(rk);
  }
  for (let i = 0; i < 7; i++) {
    const k = new THREE.Mesh(new THREE.ConeGeometry(0.2, 3 + R() * 3, 5), flat(0x2f8f5a));
    k.position.set(-9 + R() * 18, -10.5, -8 + R() * 5);
    sea.add(k);
  }
}
// a giant espresso cup on the sea floor
const seaCup = espressoCup(sea, { s: 6 });
seaCup.group.position.set(2.2, -12, -1.5);
seaCup.setLevel(0.18, 0.04);
// the diver
const diver = new THREE.Group();
sea.add(diver);
{
  const suit = flat(0x1f2a44, { roughness: 0.6 });
  const yel = flat(0xffc83a, { roughness: 0.4 });
  const torso = mesh(new THREE.CapsuleGeometry(0.32, 0.8, 4, 8), suit, 0, 0, 0, diver);
  mesh(new THREE.SphereGeometry(0.28, 10, 8), flat(0xf1c09a), 0, 0.82, 0, diver);
  mesh(new THREE.BoxGeometry(0.34, 0.16, 0.12), flat(0x2a2d33), 0, 0.86, 0.22, diver);
  mesh(
    new THREE.BoxGeometry(0.28, 0.1, 0.02),
    new THREE.MeshStandardMaterial({ color: 0x9fe3ff, roughness: 0.05, metalness: 0.3 }),
    0,
    0.86,
    0.29,
    diver,
  );
  mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.8, 10), yel, 0, 0.1, -0.38, diver);
  for (const s of [-1, 1]) {
    const arm = mesh(new THREE.CapsuleGeometry(0.1, 0.55, 3, 6), suit, s * 0.42, 0.25, 0.05, diver);
    arm.rotation.z = s * 0.9;
    const leg = mesh(new THREE.CapsuleGeometry(0.12, 0.6, 3, 6), suit, s * 0.16, -0.85, 0, diver);
    leg.rotation.x = 0.15;
    const fin = mesh(new THREE.BoxGeometry(0.22, 0.04, 0.55), yel, s * 0.16, -1.3, 0.15, diver);
    fin.rotation.x = 0.5;
  }
  torso.castShadow = false;
}
const diverBubbles = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.07, 1),
  new THREE.MeshBasicMaterial({ color: 0xdff7ff, transparent: true, opacity: 0.7 }),
  24,
);
diverBubbles.frustumCulled = false;
sea.add(diverBubbles);
const DIVER_POS = V(0, 0, 0); // world position of the diver (camera rel)

// ================================================================ camera
const relOf = (r) => (r === "diver" ? DIVER_POS : Array.isArray(r) ? V(...r) : r);
const applyCamera = shotCamera(shots.map((s) => (s.rel ? { ...s, rel: relOf(s.rel) } : s)));

// ================================================================ render
const m4 = new THREE.Matrix4();
const q0 = new THREE.Quaternion();
function renderAt(t) {
  // ---------------- hand: frame 0 on the start button, then again on "Knopf"
  hand.track(t, [
    { t: -0.8, pos: [0.75, 1.62, 2.1], rot: [-0.1, Math.PI - 0.35, 0], pose: "point" },
    { t: 0.0, pos: [0.22, 1.79, 1.66], rot: [-0.08, Math.PI - 0.3, 0], pose: "point" },
    { t: 0.3, pos: [0.14, 1.79, 1.5], rot: [-0.06, Math.PI - 0.3, 0], pose: "press" },
    { t: 0.9, pos: [0.24, 1.81, 1.72], rot: [-0.08, Math.PI - 0.3, 0], pose: "point" },
    { t: 1.5, pos: [1.0, 1.7, 2.5], rot: [-0.15, Math.PI - 0.4, 0], pose: "open", out: true },
    { t: T.stell + 0.3, pos: [1.3, 1.8, 3.0], rot: [-0.15, Math.PI - 0.4, 0], pose: "open" },
    { t: T.knopf - 0.25, pos: [0.22, 1.79, 1.68], rot: [-0.08, Math.PI - 0.3, 0], pose: "point" },
    { t: T.knopf + 0.05, pos: [0.14, 1.79, 1.5], rot: [-0.06, Math.PI - 0.3, 0], pose: "press" },
    { t: T.knopf + 0.4, pos: [0.24, 1.81, 1.72], rot: [-0.08, Math.PI - 0.3, 0], pose: "point" },
    { t: T.sofort, pos: [1.0, 1.7, 2.5], rot: [-0.15, Math.PI - 0.4, 0], pose: "open", out: true },
  ]);
  const pressed = Math.max(pop(t, 0.3, 0.75, 0.1), pop(t, T.knopf, T.knopf + 0.4, 0.1));
  startBtn.position.z = 1.09 - 0.025 * pressed;
  const on = t < T.stell || t >= T.knopf;
  btnMats[1].emissiveIntensity = on ? 0.9 : 0;
  dispMat.color.set(on ? 0x2ee6c8 : 0x1b2a30);
  iconMat.color.set(on ? 0x0b3a34 : 0x1b2a30);

  // ---------------- x-ray windows (medium shots only, ~⅓ of the runtime)
  const xr =
    smooth(ramp(t, T.sofort, T.sofort + 0.35)) * (1 - ramp(t, T.doch - 0.05, T.doch)) +
    smooth(ramp(t, T.also, T.also + 0.3)) * (1 - ramp(t, T.folge - 0.05, T.folge)) +
    smooth(ramp(t, T.der2, T.der2 + 0.3)) * (1 - ramp(t, T.schlaegt - 0.05, T.schlaegt));
  setXray(shellMats, clamp01(xr));
  lid.material.opacity = lerp(0.75, 0.3, clamp01(xr));

  // ---------------- grinder
  const grinding = t >= T.sofort && t < T.doch;
  burr.rotation.y = grinding ? (t - T.sofort) * 22 : 0;
  burrOuter.position.y = 1.9 + (grinding ? Math.sin(t * 90) * 0.004 : 0);
  fallBeans.visible = grinding;
  if (grinding) {
    for (let i = 0; i < 14; i++) {
      const f = (i / 14 + (t - T.sofort) * 1.4) % 1;
      const a = i * 2.4;
      q0.setFromEuler(new THREE.Euler(t * 5 + i, t * 3, i));
      m4.compose(
        V(
          -0.35 + Math.cos(a) * 0.12 * (1 - f),
          2.15 - f * 0.25,
          -0.35 + Math.sin(a) * 0.12 * (1 - f),
        ),
        q0,
        V(1, 1, 1),
      );
      fallBeans.setMatrixAt(i, m4);
    }
    fallBeans.instanceMatrix.needsUpdate = true;
  }
  powderFall(t, pop(t, T.staub - 0.25, T.also + 0.1), 0.9);
  puff("staub", t, T.staub, -0.32, 1.7, -0.25, 0.32, 0x9a6a3e);

  // ---------------- powder + piston
  let fill = 0.42;
  if (t >= T.stell && t < T.also + 0.2) fill = 0.42 * smooth(ramp(t, T.staub - 0.2, T.also - 0.2));
  const press = t < T.stell ? 1 : smooth(ramp(t, T.quetscht + 0.05, T.quetscht + 0.3));
  const h = lerp(fill, 0.2, press);
  powder.visible = h > 0.01;
  powder.scale.y = Math.max(0.001, h);
  powder.position.y = CH.y0 + 0.025 + h / 2;
  powderMat.color.set(0x9a5f2e).lerp(new THREE.Color(0x5a3215), press);
  const pistonUp = CH.y0 + CH.h + 0.12;
  piston.position.y = lerp(pistonUp, CH.y0 + 0.025 + h + 0.035, press);

  // ---------------- water: pump, heater, flow
  const pumping =
    (t >= T.pumpe - 0.2 && t < T.folge) ||
    (t >= T.der2 && t < T.kein) ||
    t < T.stell ||
    (t >= T.genau && t < T.fakt);
  pump.position.x = 0.28 + (pumping ? Math.sin(t * 120) * 0.006 : 0);
  const hot = smooth(ramp(t, T.kochendes - 0.3, T.kochendes + 0.4));
  heatMat2.emissiveIntensity =
    (t < T.stell ? 0.6 : 1.4 * hot) * (t >= T.folge && t < T.der2 ? 0.3 : 1);
  heatLight.intensity = 2 * heatMat2.emissiveIntensity;
  waterFlow(t, Math.max(pop(t, T.pumpe, T.folge), pop(t, T.der2, T.schlaegt)), 0.5);
  coffeeFlow(t, Math.max(pop(t, T.oelen - 0.2, T.schlaegt), t < T.er ? 1 : 0), 0.7);
  animateArrows(
    pressArrows,
    t,
    Math.max(pop(t, T.neun - 0.2, T.folge), pop(t, T.der2, T.schlaegt)),
  );

  // gas + oil torn out of the puck (x-ray macro)
  const pv = pop(t, T.der2 + 0.3, T.schlaegt);
  puckBubbles.visible = pv > 0.01;
  if (pv > 0.01) {
    pbSeed.forEach(([a, b, c], i) => {
      const f = (b + (t - T.der2) * (0.45 + c * 0.4)) % 1;
      const ang = a * 6.28 + f * 2;
      const rr = (CH.r - 0.06) * Math.sqrt(c);
      const y = CH.y0 + 0.24 - f * 0.26;
      const s = pv * (0.7 + 0.6 * c) * (i % 3 === 0 ? 1.3 : 1);
      m4.compose(V(Math.cos(ang) * rr, y, CH.z + Math.sin(ang) * rr), q0.identity(), V(s, s, s));
      puckBubbles.setMatrixAt(i, m4);
      puckBubbles.setColorAt(i, new THREE.Color(i % 3 === 0 ? 0xffc35a : 0xcff3ff));
    });
    puckBubbles.instanceMatrix.needsUpdate = true;
    puckBubbles.instanceColor.needsUpdate = true;
  }

  // ---------------- main cup: hook pour, then the real pour from "reißt"
  let lvl = 0;
  let cr = 0;
  let pour = 0;
  if (t < T.stell) {
    lvl = lerp(0.09, 0.17, ramp(t, 0, T.stell));
    cr = lerp(0.02, 0.035, ramp(t, 0, T.stell));
    pour = 1;
  } else if (t >= T.oelen) {
    lvl = 0.17 * smooth(ramp(t, T.oelen, T.crema));
    cr = 0.04 * smooth(ramp(t, T.schlaegt, T.crema + 0.3));
    pour = pop(t, T.oelen, T.fakt - 0.2, 0.25);
  }
  cup.setLevel(lvl, cr);
  cup.crema.material.emissiveIntensity = 0.25 + 0.6 * pop(t, T.crema, T.fakt, 0.15);
  const surf = 0.14 + 0.05 + lvl + cr; // cup is at y 0.14
  streams.forEach((s, i) => {
    s.visible = pour > 0.02;
    const top = 1.0;
    const len = Math.max(0.01, top - surf);
    s.scale.set(
      pour * (0.9 + 0.15 * Math.sin(t * 31 + i * 2)),
      len,
      pour * (0.9 + 0.15 * Math.sin(t * 27 + i)),
    );
    s.position.y = surf + len / 2;
  });
  const swarm = pop(t, T.schlaegt, T.kein, 0.2);
  cremaDots.visible = cr > 0.004 || swarm > 0.01;
  if (cremaDots.visible) {
    for (let i = 0; i < 90; i++) {
      const a = i * 2.399 + t * (0.6 + (i % 5) * 0.08);
      const rr = (0.13 + 0.05 * clamp01((lvl + cr) / 0.26)) * Math.sqrt((i + 0.5) / 90);
      const s = (0.6 + (0.6 * ((i * 37) % 10)) / 10) * (1 + swarm * 0.8);
      const rise = swarm * (((i * 0.37 + t * 0.6) % 1) * 0.05);
      m4.compose(
        V(Math.cos(a) * rr, surf + 0.002 - 0.04 * swarm + rise, 0.82 + Math.sin(a) * rr),
        q0.identity(),
        V(s, 0.5 * s + swarm * 0.5 * s, s),
      );
      cremaDots.setMatrixAt(i, m4);
    }
    cremaDots.instanceMatrix.needsUpdate = true;
  }
  steamPuffs.forEach((p, i) => {
    const k = (t * 0.45 + i / steamPuffs.length) % 1;
    p.visible = lvl > 0.05;
    const side = i % 2 ? 1 : -1;
    p.position.set(side * (0.16 + k * 0.08), 0.48 + k * 0.35, 0.86 + Math.cos(k * 4 + i) * 0.04);
    p.scale.setScalar(0.3 + k * 0.7);
  });

  // ---------------- (1) broth
  const vb = pop(t, T.doch - 0.1, T.also);
  broth.visible = vb > 0.01;
  if (broth.visible) {
    broth.scale.copy(squash(t, T.doch - 0.1, 0.6));
    const pourK =
      smooth(ramp(t, T.wasser1 - 0.25, T.wasser1 + 0.15)) *
      (1 - smooth(ramp(t, T.gibt - 0.1, T.gibt + 0.2)));
    kettle2.position.set(0.95, 1.25, 0);
    kettle2.rotation.z = 0.15 + 0.55 * pourK;
    kettle2.position.y = 1.25 - 0.05 * pourK;
    pourStream.visible = pourK > 0.05;
    pourStream.scale.set(1, 0.63, 1);
    pourStream.position.set(0.35, 0.83, 0);
    pourStream.rotation.z = -0.5;
    const fillB = 0.6 * smooth(ramp(t, T.wasser1, T.gibt + 0.2));
    brothLiquid.visible = fillB > 0.01;
    brothLiquid.scale.y = Math.max(0.001, fillB);
    brothLiquid.position.y = 0.04 + fillB / 2;
    brothLiquidMat.color
      .set(0xb7d8ea)
      .lerp(new THREE.Color(0x8a6a48), smooth(ramp(t, T.wasser1 + 0.2, T.gibt + 0.3)));
    brothPowder.visible = fillB < 0.3;
    for (let i = 0; i < 18; i++) {
      const a = i * 1.7 + t * 0.4;
      const rr = 0.1 + (i % 5) * 0.05;
      m4.compose(
        V(Math.cos(a) * rr, 0.06 + fillB * (0.98 - (i % 3) * 0.02), Math.sin(a) * rr),
        q0.identity(),
        V(1, 1, 1),
      );
      clumps.setMatrixAt(i, m4);
    }
    clumps.instanceMatrix.needsUpdate = true;
    clumps.visible = fillB > 0.2;
  }
  // ---------------- (2) trio
  const vt = 0; // trio unused since the CTA swap (2026-11-04)
  trio.visible = vt > 0.01;
  if (trio.visible) {
    trioEsp.group.scale.copy(squash(t, T.folge, 0.6, 1.5));
    capp.scale.copy(squash(t, T.cappuccino, 0.6));
    latte.scale.copy(squash(t, T.hafer, 0.6));
  }
  // ---------------- (3) compare
  const vc = pop(t, T.kein - 0.05, T.genau);
  compare.visible = vc > 0.01;
  if (compare.visible) {
    oldCup.group.scale.copy(squash(t, T.kein, 0.6, 1.6));
    freshCup.group.scale.copy(squash(t, T.kein + 0.12, 0.6, 1.6));
    freshCup.crema.material.emissiveIntensity = 0.4;
  }
  showNope(
    pop(t, T.gibt + 0.1, T.also, 0.25) || pop(t, T.alt - 0.1, T.genau, 0.25),
    ...(t < T.also
      ? [SPOT_B[0], 0.95, SPOT_B[2] + 0.3]
      : [SPOT_A[0] - 0.55, 0.85, SPOT_A[2] + 0.1]),
    0.6,
  );
  // ---------------- (4) bean + CO2
  const vbn = pop(t, T.der1 - 0.05, T.der2);
  bean.visible = vbn > 0.01;
  if (bean.visible) {
    bean.scale.copy(squash(t, T.der1, 0.7));
    bean.rotation.y = -0.4 + (t - T.der1) * 0.12;
    const gasK = smooth(ramp(t, T.gas - 0.6, T.gas + 0.4));
    co2.visible = gasK > 0.01;
    co2Seed.forEach(([a, b, c], i) => {
      const f = (b + (t - T.der1) * (0.18 + c * 0.2)) % 1;
      const ang = a * 6.28;
      const s = gasK * (0.6 + c) * (1 - f * 0.4);
      m4.compose(
        V(Math.cos(ang) * (0.25 + f * 0.5), 0.6 + f * 1.4, Math.sin(ang) * (0.35 + f * 0.4)),
        q0.identity(),
        V(s, s, s),
      );
      co2.setMatrixAt(i, m4);
    });
    co2.instanceMatrix.needsUpdate = true;
  }
  // ---------------- (5) espresso vs filter
  const vf = pop(t, T.fakt, 99);
  caf.visible = vf > 0.01;
  if (caf.visible) caf.scale.copy(squash(t, T.fakt + 0.05, 0.6));

  // ---------------- (6) dive
  const dk = ramp(t, T.rate - 0.12, T.neunzig);
  const depth = 90 * Math.pow(dk, 1.6);
  const seabed = t >= T.neunzig;
  diver.position.set(seabed ? -1.6 : 0, seabed ? -10.9 : 6 - dk * 15.5, seabed ? -0.6 : 0);
  diver.rotation.set(seabed ? 0 : 0.35, 0.5 + t * 0.1, seabed ? 0 : 0.15 * Math.sin(t * 1.3));
  DIVER_POS.copy(diver.position).add(divePos);
  for (let i = 0; i < 24; i++) {
    const f = (i / 24 + t * 0.5) % 1;
    const s = 0.5 + ((i * 13) % 7) / 7;
    m4.compose(
      V(
        diver.position.x + Math.sin(i * 3 + t * 2) * 0.15,
        diver.position.y + 1.0 + f * 5,
        diver.position.z + 0.2 + Math.cos(i) * 0.1,
      ),
      q0.identity(),
      V(s * (0.4 + f), s * (0.4 + f), s * (0.4 + f)),
    );
    diverBubbles.setMatrixAt(i, m4);
  }
  diverBubbles.instanceMatrix.needsUpdate = true;

  // ---------------- HUD + LED
  gauge("bar", pop(t, T.kochendes - 0.3, T.folge), {
    label: "Brühdruck",
    value: Math.round(9 * smooth(ramp(t, T.kochendes - 0.2, T.neun + 0.15)) * 10) / 10,
    max: 15,
    unit: "bar",
    digits: 1,
    x: 640,
    y: 400,
  });
  counter("tiefe", pop(t, T.rate, T.neunzig + 0.05, 0.1), {
    label: "Tiefe",
    value: `${Math.round(depth)} m`,
    x: 60,
    y: 400,
  });
  if (t >= T.neunzig && t < T.der1)
    showPanel(pop(t, T.neunzig, T.der1), "DRUCK WIE IN", "90 m", LED.blue);
  else showPanel(0);
  meter("esp", pop(t, T.koffein - 0.1, 99), {
    label: "Koffein · Espresso",
    value: 0.5 * smooth(ramp(t, T.koffein, T.koffein + 0.8)),
    x: 60,
    y: 1290,
    width: 560,
    text: "≈ 60 mg",
  });
  meter("fil", pop(t, T.filter - 0.1, 99), {
    label: "Koffein · Filterkaffee",
    value: 0.88 * smooth(ramp(t, T.filter, T.filter + 0.8)),
    x: 60,
    y: 1420,
    width: 560,
    text: "≈ 100 mg",
  });

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
