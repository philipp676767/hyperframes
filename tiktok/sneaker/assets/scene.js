// #62 Sneaker-Sohle — a giant white sneaker on the centre circle of a rooftop
// court at sunset (set.js). The picture: the sneaker slams down with its
// window glowing, the viewer's finger taps the window, a player dunks and
// lands like a hammer blow, the midsole turns to glass (millions of foam
// bubbles squeezing, then sagging tired), a jet over the roofs, the gas
// cushion pops into the heel, the shoe stomps and never tires while the
// player pants, small particles slip through the plastic, fat green
// greenhouse-gas molecules fill the cushion (20.000× CO2), turn blue
// (nitrogen, since 2006), the little Paris museum with its pipes outside
// pops up, the window lights up, and an odometer runs to 800 km while the
// foam goes flat.
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
  facet,
  facetMat,
  roundedRect,
  xrayMaterial,
  xrayEdges,
  setXray,
  showNope,
  showPanel,
  LED,
  labels,
  squash,
  puff,
  highlights,
  shotCamera,
  renderFrame,
  start,
  forceMat,
  makeArrowSet,
  animateArrows,
} from "./world.js";
import { HOOP, ball } from "./set.js";
import { person } from "./people.js";
import { createHand } from "./hand.js";
import { counter } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS, AIR, PLAYER, PARIS } from "./beats.js";

highlights(HIGHLIGHTS);
const R = rng(620);
const glow = (c, o = 1) =>
  new THREE.MeshBasicMaterial({ color: c, transparent: o < 1, opacity: o, depthWrite: o >= 1 });
const mesh = (geo, mat, parent = scene, x = 0, y = 0, z = 0, shadow = true) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = shadow;
  parent.add(m);
  return m;
};
// extrude a side profile (x, y points) to a slab of depth d centred on z = 0
function slab(pts, d, bevel = 0.08) {
  const s = new THREE.Shape();
  pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, {
    depth: d - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 10,
  });
  g.translate(0, 0, -(d - bevel * 2) / 2);
  return g;
}
// smooth closed outline from a few control points
const curvePts = (ctrl, n = 60) =>
  new THREE.CatmullRomCurve3(
    ctrl.map(([x, y]) => V(x, y, 0)),
    true,
    "centripetal",
  )
    .getPoints(n)
    .map((p) => [p.x, p.y]);

// ================================================================ the giant sneaker
// local frame: heel at -x, toe at +x, outer side (window) facing +z
const shoe = new THREE.Group();
scene.add(shoe);
const body = new THREE.Group(); // everything above the outsole (sinks when the foam squeezes)
shoe.add(body);

// outsole: dark gum rubber with a tread lip
mesh(
  slab(
    curvePts([
      [-2.42, 0.02],
      [0.0, 0.0],
      [2.38, 0.04],
      [2.5, 0.12],
      [2.38, 0.17],
      [0, 0.15],
      [-2.42, 0.17],
      [-2.52, 0.1],
    ]),
    1.72,
    0.05,
  ),
  flat(0x2a2b31, { roughness: 0.8 }),
  shoe,
);
for (let i = 0; i < 9; i++) {
  mesh(new THREE.BoxGeometry(0.12, 0.05, 1.5), flat(0x1d1e22), shoe, -2.0 + i * 0.5, 0.015, 0);
}

// midsole: white foam, thick under the heel, x-ray glass while explained
const midMat = xrayMaterial(0xf6f2ea, { roughness: 0.75 });
const midTop = (x) => lerp(0.8, 0.42, smooth(clamp01((x + 2.3) / 4.6)));
const midGeo = slab(
  curvePts(
    [
      [-2.4, 0.16],
      [0, 0.15],
      [2.4, 0.18],
      [2.5, 0.32],
      [2.3, 0.42],
      [0.6, 0.5],
      [-1.4, 0.76],
      [-2.3, 0.8],
      [-2.5, 0.5],
    ],
    80,
  ),
  1.68,
  0.07,
);
const midsole = new THREE.Group();
shoe.add(midsole);
mesh(midGeo, midMat, midsole);
const midEdges = xrayEdges(midGeo);
midsole.add(midEdges);

// foam bubbles inside the midsole (seen through the x-ray)
const NB = 150;
const bubbleMat = flat(0xffffff, { roughness: 0.4 });
const bubbles = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), bubbleMat, NB);
bubbles.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(NB * 3), 3);
const BUB = [];
for (let i = 0; i < NB; i++) {
  const x = -2.15 + R() * 4.35;
  const top = midTop(x) - 0.07;
  BUB.push({
    x,
    y: 0.21 + R() * (top - 0.21),
    z: -0.68 + R() * 1.36,
    s: 0.05 + R() * 0.045,
    ph: R() * 6.28,
    inAir: x > -2.08 && x < -0.92,
  });
}
shoe.add(bubbles);
const dummy = new THREE.Object3D();
const colA = new THREE.Color(0x8fe3ff);
const colTired = new THREE.Color(0x9a958c);
const tmpC = new THREE.Color();

// the air cushion behind the window: clear blue plastic bag
const airMat = new THREE.MeshStandardMaterial({
  color: 0x7fdcff,
  emissive: 0x2a9fd8,
  emissiveIntensity: 0.35,
  roughness: 0.08,
  metalness: 0.1,
  transparent: true,
  opacity: 0.55,
  depthWrite: false,
});
const air = new THREE.Group();
air.position.set(AIR[0], AIR[1], 0);
shoe.add(air);
{
  const g = new THREE.ExtrudeGeometry(roundedRect(1.12, 0.36, 0.16), {
    depth: 1.52,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.06,
    bevelSegments: 4,
    curveSegments: 8,
  });
  g.translate(0, -0.18, -0.76);
  const m = new THREE.Mesh(g, airMat);
  m.renderOrder = 2;
  air.add(m);
  // window frame on the outer side: an orange rounded outline
  const fp = roundedRect(1.3, 0.5, 0.2)
    .getPoints(12)
    .map((p) => V(p.x, p.y - 0.25, 0.92));
  const fr = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(fp, true), 80, 0.03, 6, true),
    flat(0xf0702a, { roughness: 0.4 }),
  );
  air.add(fr);
}
const airGlow = new THREE.PointLight(0x7fdcff, 0, 3, 1.6);
airGlow.position.set(AIR[0], AIR[1], 1.2);
shoe.add(airGlow);

// gas inside the cushion: small particles (air), fat molecules (SF6), pairs (N2)
const BOX = { x: 0.5, y: 0.13, z: 0.7 };
const tri = (x) => 1 - Math.abs((((x % 2) + 2) % 2) - 1) * 2; // -1..1 triangle wave
const NS = 34;
const small = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.045, 1), glow(0xffffff), NS);
air.add(small);
const SMALL = Array.from({ length: NS }, (_, i) => ({
  vx: 0.6 + R() * 0.9,
  vy: 0.9 + R() * 1.2,
  vz: 0.5 + R() * 0.9,
  px: R() * 2,
  py: R() * 2,
  pz: R() * 2,
  leak: i % 3 === 0,
  lt: R(),
}));
const NM = 9;
const sMat = flat(0xffe14a, { roughness: 0.4, emissive: 0x5a4a00, emissiveIntensity: 0.3 });
const fMat = flat(0x3ddc5a, { roughness: 0.4, emissive: 0x0c5a1a, emissiveIntensity: 0.35 });
const nMat = flat(0x3f8cff, { roughness: 0.35, emissive: 0x0a2a7a, emissiveIntensity: 0.4 });
const MOL = [];
for (let i = 0; i < NM; i++) {
  const g = new THREE.Group();
  const sf6 = new THREE.Group();
  sf6.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.055, 1), sMat));
  for (const [x, y, z] of [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1],
  ]) {
    const f = new THREE.Mesh(new THREE.IcosahedronGeometry(0.045, 1), fMat);
    f.position.set(x * 0.085, y * 0.085, z * 0.085);
    sf6.add(f);
  }
  g.add(sf6);
  const n2 = new THREE.Group();
  for (const s of [-1, 1]) {
    const a = new THREE.Mesh(new THREE.IcosahedronGeometry(0.05, 1), nMat);
    a.position.x = s * 0.042;
    n2.add(a);
  }
  g.add(n2);
  air.add(g);
  MOL.push({
    g,
    sf6,
    n2,
    vx: 0.25 + R() * 0.3,
    vy: 0.35 + R() * 0.3,
    vz: 0.2 + R() * 0.3,
    px: R() * 2,
    py: R() * 2,
    pz: R() * 2,
    rx: R() * 3,
    ry: R() * 3,
  });
}

// the upper: white leather, low toe box, high collar at the heel
const upperMat = flat(0xfbfaf7, { roughness: 0.35 });
const upperGeo = slab(
  curvePts(
    [
      [-2.28, 0.74],
      [-2.42, 1.3],
      [-2.3, 2.12],
      [-1.75, 2.28],
      [-1.0, 1.98],
      [-0.45, 2.36],
      [0.2, 1.95],
      [1.2, 1.38],
      [2.05, 1.08],
      [2.4, 0.66],
      [1.6, 0.48],
      [0.2, 0.56],
      [-1.4, 0.78],
    ],
    90,
  ),
  1.5,
  0.16,
);
mesh(facet(upperGeo, 0.025, 9), facetMat(upperMat), body);
// collar opening + lining
const collar = mesh(
  new THREE.CylinderGeometry(0.62, 0.62, 0.2, 16),
  flat(0x23252b, { roughness: 0.9 }),
  body,
  -1.42,
  2.1,
  0,
);
collar.scale.set(1, 1, 0.78);
collar.rotation.z = -0.32;
// tongue
const tongue = mesh(
  new THREE.BoxGeometry(0.9, 0.16, 0.86),
  flat(0xf1ede6, { roughness: 0.5 }),
  body,
  -0.42,
  2.3,
  0,
);
tongue.rotation.z = -0.55;
// laces across the top
for (let i = 0; i < 5; i++) {
  const x = -0.15 + i * 0.32;
  const y = lerp(2.06, 1.46, i / 4);
  const l = mesh(
    new THREE.BoxGeometry(0.09, 0.07, 1.25),
    flat(0xefe9df, { roughness: 0.6 }),
    body,
    x,
    y + 0.08,
    0,
  );
  l.rotation.z = -0.6;
}
// orange heel tab + side panel stripes + toe cap
const orangeM = flat(0xf0702a, { roughness: 0.4 });
mesh(new THREE.BoxGeometry(0.2, 1.0, 0.7), orangeM, body, -2.4, 1.62, 0).rotation.z = 0.08;
for (const s of [-1, 1]) {
  const stripe = mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        V(-2.0, 1.25, 0),
        V(-0.8, 1.05, 0),
        V(0.6, 0.98, 0),
        V(1.6, 0.86, 0),
      ]),
      30,
      0.05,
      6,
    ),
    orangeM,
    body,
    0,
    0,
    s * 0.76,
  );
  stripe.scale.z = 1;
}
const toeCap = mesh(
  new THREE.SphereGeometry(0.62, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2),
  flat(0xe9e4da, { roughness: 0.5 }),
  body,
  1.78,
  0.62,
  0,
);
toeCap.scale.set(1.0, 0.75, 1.15);
toeCap.rotation.z = -0.35;
const shoeMats = [midMat];

// a shockwave ring on the court where the shoe lands
const ringMat = glow(0xffffff, 0.8);
const ring = mesh(
  new THREE.RingGeometry(0.9, 1.1, 40).rotateX(-Math.PI / 2),
  ringMat,
  scene,
  0,
  0.04,
  0,
  false,
);

// force arrows when the foot hits
const hitArrows = makeArrowSet(
  [
    [V(-1.6, 3.6, 0), V(-1.6, 2.4, 0)],
    [V(-0.9, 3.8, 0.3), V(-0.9, 2.6, 0.3)],
    [V(-2.2, 3.5, -0.3), V(-2.2, 2.4, -0.3)],
  ],
  { mat: forceMat, amp: 0 },
);

// ================================================================ the player (dunk scene)
const pl = person({
  top: 0xf0702a,
  legs: 0x1d1f26,
  hair: 0x2a1c14,
  stand: true,
  seed: 3,
  style: "short",
});
pl.g.position.set(...PLAYER);
// white sneakers over the feet
for (const sx of [-1, 1]) {
  const s = mesh(
    new THREE.BoxGeometry(0.52, 0.36, 1.0),
    flat(0xfbfaf7, { roughness: 0.4 }),
    pl.g,
    sx * 0.36,
    0.18,
    0.2,
  );
  mesh(new THREE.BoxGeometry(0.54, 0.1, 0.32), glow(0x7fdcff), pl.g, sx * 0.36, 0.1, -0.12, false);
  s.castShadow = true;
}
const plBall = ball(0.62, 9);
scene.add(plBall);
// sweat drops when he pants
const sweat = [];
for (let i = 0; i < 4; i++) {
  const d = mesh(new THREE.SphereGeometry(0.09, 8, 6), glow(0x9fe4ff), scene, 0, 0, 0, false);
  d.scale.set(0.8, 1.3, 0.8);
  sweat.push(d);
}

// ================================================================ the jet over the roofs
const jet = new THREE.Group();
{
  const w = flat(0xffffff, { roughness: 0.4 });
  const fus = mesh(new THREE.CylinderGeometry(0.55, 0.42, 7.5, 10), w, jet);
  fus.rotation.z = Math.PI / 2;
  const nose = mesh(new THREE.SphereGeometry(0.55, 10, 8), w, jet, 3.75, 0, 0);
  nose.scale.set(1.5, 1, 1);
  mesh(new THREE.BoxGeometry(1.8, 0.12, 8.5), flat(0xe8eef5), jet, 0.3, -0.1, 0);
  mesh(new THREE.BoxGeometry(1.0, 1.7, 0.12), flat(0xf0702a), jet, -3.3, 0.9, 0);
  mesh(new THREE.BoxGeometry(0.9, 0.1, 3.0), flat(0xe8eef5), jet, -3.3, 0.2, 0);
  for (const s of [-1, 1])
    mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 1.0, 8),
      flat(0xc9ccd2),
      jet,
      0.6,
      -0.5,
      s * 2.0,
    ).rotation.z = Math.PI / 2;
  // contrails
  for (const s of [-1, 1]) {
    const c = mesh(
      new THREE.CylinderGeometry(0.18, 0.4, 30, 8),
      glow(0xffffff, 0.55),
      jet,
      -18.5,
      -0.5,
      s * 2.0,
      false,
    );
    c.rotation.z = Math.PI / 2;
  }
  scene.add(jet);
}

// ================================================================ Paris: the museum with pipes outside
const paris = new THREE.Group();
{
  const plaza = mesh(new THREE.BoxGeometry(4.2, 0.16, 3.0), flat(0xc9b9a4), paris, 0, 0.08, 0);
  plaza.receiveShadow = true;
  // glass box with a white frame grid
  mesh(
    new THREE.BoxGeometry(3.4, 1.8, 1.6),
    flat(0x9fc7e6, { roughness: 0.15, metalness: 0.2 }),
    paris,
    0,
    1.06,
    -0.3,
  );
  const frameM = flat(0xf2f2f2, { roughness: 0.4 });
  for (let i = 0; i <= 6; i++)
    mesh(new THREE.BoxGeometry(0.05, 1.86, 0.06), frameM, paris, -1.7 + i * (3.4 / 6), 1.06, 0.52);
  for (let j = 0; j <= 3; j++)
    mesh(new THREE.BoxGeometry(3.46, 0.05, 0.06), frameM, paris, 0, 0.16 + j * 0.6, 0.52);
  // the famous pipes outside: blue, green, yellow, red
  const pipeCols = [0x2f6fd6, 0x2fae5a, 0xffd23f, 0xe2453c, 0x2f6fd6, 0x2fae5a];
  pipeCols.forEach((c, i) => {
    const x = -1.45 + i * 0.58;
    mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 1.9, 8),
      flat(c, { roughness: 0.4 }),
      paris,
      x,
      1.06,
      0.68,
    );
    const elbow = mesh(
      new THREE.TorusGeometry(0.16, 0.1, 6, 8, Math.PI / 2),
      flat(c),
      paris,
      x,
      2.02,
      0.52,
    );
    elbow.rotation.y = Math.PI / 2;
  });
  // the red escalator tube running diagonally up the front
  const esc = mesh(
    new THREE.CylinderGeometry(0.13, 0.13, 3.6, 10),
    flat(0xe2453c, { roughness: 0.3 }),
    paris,
    0.1,
    1.1,
    0.9,
  );
  esc.rotation.z = -1.1;
  // little tricolour flag
  mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 5), frameM, paris, 1.85, 2.3, 0.4);
  [0x2f4fb0, 0xffffff, 0xe2453c].forEach((c, i) =>
    mesh(new THREE.BoxGeometry(0.16, 0.34, 0.02), flat(c), paris, 1.95 + i * 0.16, 2.55, 0.4),
  );
  paris.position.set(...PARIS);
  paris.rotation.y = -0.35;
  scene.add(paris);
}

// ================================================================ the viewer's hand
const hand = createHand({ scale: 0.55, sleeve: 0x2f6fd6 });

const applyCamera = shotCamera(shots);

// stomp cycle: returns 0..1 load on the sole (1 = full impact) and the lift
function stomp(t, a, b, period = 0.62) {
  if (t < a || t >= b) return { load: 0, lift: 0 };
  const ph = ((t - a) / period) % 1;
  const lift = ph < 0.55 ? Math.sin((ph / 0.55) * Math.PI) * 0.45 : 0;
  const load = ph >= 0.55 ? Math.sin(((ph - 0.55) / 0.45) * Math.PI) : 0;
  return { load, lift };
}

// ================================================================ render
function renderAt(t) {
  // ------------------------------------------------ the sneaker: slam + stomps
  // frame 0: falling, lands at 0.12
  const fall = t < 0.12 ? Math.pow(clamp01((0.12 - t) / 0.42), 1.6) * 2.4 : 0;
  let load = Math.exp(-Math.max(0, t - 0.12) * 7) * (t >= 0.12 ? 1 : 0);
  let lift = fall;
  for (const [a, b] of [
    [T.quetschen - 0.6, T.nur1],
    [T.nie - 0.15, T.anders],
    [T.mal20k - 0.1, T.seine],
  ]) {
    const s = stomp(t, a, b);
    load = Math.max(load, s.load);
    lift += s.lift;
  }
  // tired foam (from "müde" to the cushion) and flat foam (800 km)
  const tired =
    smooth(ramp(t, T.muede1 - 0.2, T.muede1 + 0.5)) * (1 - ramp(t, T.also, T.also + 0.3));
  const flatK = smooth(ramp(t, T.platt - 0.2, T.platt + 0.4));
  shoe.position.y = lift;
  shoe.rotation.y = t >= T.welche ? Math.sin((t - T.welche) * 1.2) * 0.25 : 0;
  shoe.rotation.z = lift * 0.12;
  // the cushion only exists once the engineer builds it (plus in the hook)
  const hasAir = t < T.normale ? 1 : ramp(t, T.kissen, T.kissen + 0.01);
  const airLoad = load * (hasAir ? 1 : 0);
  // with the cushion, the foam squeezes less
  const sq = (hasAir ? 0.06 : 0.16) * load + 0.12 * tired + 0.22 * flatK;
  midsole.scale.y = 1 - sq;
  body.position.y = -0.8 * sq;
  // leaking: the cushion goes slowly flat ("kriecht raus"), back full with SF6
  const leak = smooth(ramp(t, T.kriecht, T.folge)) * (1 - ramp(t, T.treibhaus, T.treibhaus + 0.4));
  air.visible = hasAir > 0;
  air.scale.set(1, Math.max(0.05, 1 - 0.38 * airLoad - 0.4 * leak - 0.3 * flatK), 1);
  air.position.y = AIR[1] * midsole.scale.y;
  const winGlow =
    0.35 +
    0.7 * ramp(t, T.kissen, T.kissen + 0.3) * (1 - ramp(t, T.fakt, T.fakt + 0.3)) +
    1.6 * pop(t, 0, T.stell) +
    1.8 * pop(t, T.fenster2 - 0.3, T.designer) +
    2.4 * pop(t, T.zeigt - 0.1, T.fakt);
  airMat.emissiveIntensity = winGlow;
  airGlow.intensity = (winGlow - 0.35) * 3;
  // x-ray of the midsole while the inside is explained
  const xr =
    smooth(ramp(t, T.schaum1 - 0.3, T.schaum1 + 0.2)) * (1 - ramp(t, T.also, T.also + 0.2)) +
    smooth(ramp(t, T.platt - 0.5, T.platt)) * (1 - ramp(t, T.welche, T.welche + 0.3)) +
    // the cushion's gas is only visible through the glass
    smooth(ramp(t, T.kissen - 0.2, T.kissen + 0.2)) * (1 - ramp(t, T.nie - 0.2, T.nie)) +
    smooth(ramp(t, T.nur2 - 0.2, T.nur2 + 0.2)) * (1 - ramp(t, T.folge - 0.3, T.folge)) +
    smooth(ramp(t, T.rate - 0.2, T.rate + 0.2)) * (1 - ramp(t, T.fenster2 - 0.5, T.fenster2 - 0.3));
  setXray(shoeMats, clamp01(xr));
  // foam bubbles
  bubbles.visible = xr > 0.02;
  if (bubbles.visible) {
    for (let i = 0; i < NB; i++) {
      const b = BUB[i];
      const heel = clamp01((0.5 - b.x) / 2.6);
      const hide = b.inAir && hasAir ? 0 : 1;
      const k = 1 - (0.5 * load * (0.4 + 0.6 * heel) + 0.6 * tired + 0.6 * flatK);
      const wob = 1 + Math.sin(t * 3 + b.ph) * 0.05;
      dummy.position.set(b.x, b.y * midsole.scale.y, b.z);
      dummy.scale.set(
        b.s * wob * (1 + 0.3 * (1 - k)) * hide,
        b.s * Math.max(0.15, k) * hide,
        b.s * wob * hide + 1e-4,
      );
      dummy.updateMatrix();
      bubbles.setMatrixAt(i, dummy.matrix);
      tmpC.copy(colA).lerp(colTired, Math.max(tired, flatK));
      bubbles.setColorAt(i, tmpC);
    }
    bubbles.instanceMatrix.needsUpdate = true;
    bubbles.instanceColor.needsUpdate = true;
  }
  showNope(pop(t, T.muede1 + 0.1, T.also), 0.6, 1.6, 1.2, 0.6);
  // landing shockwave + dust
  const rk = ramp(t, 0.12, 0.7);
  ring.visible = rk > 0 && rk < 1;
  ring.scale.setScalar(1 + rk * 4);
  ringMat.opacity = 0.8 * (1 - rk);
  puff("slam", t, 0.12, 0, 0.05, 0, 2.6);

  // ------------------------------------------------ gas inside the cushion
  const smallK = hasAir && t < T.treibhaus ? 1 : 0;
  const hookGas = t < T.normale ? 1 : 0;
  small.visible = smallK > 0 && (hookGas || t >= T.kissen);
  if (small.visible) {
    for (let i = 0; i < NS; i++) {
      const p = SMALL[i];
      let x = tri(t * p.vx + p.px) * BOX.x;
      let y = tri(t * p.vy + p.py) * BOX.y * air.scale.y;
      let z = tri(t * p.vz + p.pz) * BOX.z;
      let s = 1;
      if (p.leak && t > T.kriecht) {
        // slips out through the outer wall and drifts away
        const k = clamp01((t - T.kriecht - p.lt * 1.4) / 1.2);
        if (k > 0) {
          z = lerp(z, 1.6, k);
          y += k * 0.3;
          s = 1 - k;
        }
      }
      dummy.position.set(x, y / Math.max(0.05, air.scale.y), z);
      dummy.scale.setScalar(Math.max(0.001, s));
      dummy.updateMatrix();
      small.setMatrixAt(i, dummy.matrix);
    }
    small.instanceMatrix.needsUpdate = true;
  }
  // SF6 → N2
  const molIn = t >= T.treibhaus;
  const toN2 = smooth(ramp(t, T.stickstoff - 0.1, T.stickstoff + 0.4));
  MOL.forEach((m, i) => {
    m.g.visible = molIn;
    if (!molIn) return;
    const k = squash(t, T.treibhaus + i * 0.05, 0.6).x;
    // fat molecules bump into the wall and bounce back (never through)
    m.g.position.set(
      tri(t * m.vx + m.px) * (BOX.x - 0.1),
      (tri(t * m.vy + m.py) * (BOX.y - 0.04)) / Math.max(0.05, air.scale.y),
      tri(t * m.vz + m.pz) * (BOX.z - 0.1),
    );
    m.g.rotation.set(t * m.rx, t * m.ry, 0);
    m.sf6.scale.setScalar(Math.max(0.001, k * (1 - toN2)));
    m.n2.scale.setScalar(Math.max(0.001, k * toN2));
    m.g.scale.y = 1 / Math.max(0.05, air.scale.y);
  });

  // ------------------------------------------------ the force arrows on the landing
  animateArrows(
    hitArrows,
    t,
    pop(t, T.normale, T.millionen) * 0 + pop(t, T.quetschen - 0.1, T.nur1),
  );

  // ------------------------------------------------ the player
  const pv =
    t >= T.stell - 0.1 && t < T.normale + 0.1 ? 1 : t >= T.anders - 0.1 && t < T.nur2 ? 1 : 0;
  pl.g.visible = pv > 0;
  plBall.visible = false;
  if (pv) {
    const P0 = PLAYER;
    if (t < T.normale) {
      // bounce in place, jump on "springst", top at the rim on "Korb", land on "knallt"
      const up = ramp(t, T.springst, T.korb + 0.25);
      const down = ramp(t, T.korb + 0.4, T.knallt);
      const jy = t < T.korb + 0.4 ? Math.sin(up * Math.PI * 0.5) * 2.4 : (1 - down * down) * 2.4;
      const bob = t < T.springst ? Math.abs(Math.sin(t * 7)) * 0.25 : 0;
      const zMove = lerp(P0[2] + 2.4, P0[2] - 1.6, smooth(ramp(t, T.springst, T.korb + 0.2)));
      const zBack = lerp(zMove, P0[2], smooth(ramp(t, T.korb + 0.4, T.knallt)));
      pl.g.position.set(P0[0], jy + bob, t < T.korb + 0.4 ? zMove : zBack);
      // arms: dribbling low, then both up for the dunk
      const armsUp =
        smooth(ramp(t, T.springst, T.korb)) * (1 - smooth(ramp(t, T.korb + 0.5, T.knallt)));
      for (const [a, s] of [
        [pl.armL, 1],
        [pl.armR, -1],
      ]) {
        a.sh.rotation.set(lerp(-0.35, -3.0, armsUp), 0, s * lerp(0.1, 0.25, armsUp));
        a.el.rotation.set(lerp(-1.15, -0.2, armsUp), 0, 0);
      }
      // squat on landing
      const land = pop(t, T.knallt, T.normale, 0.12) * Math.exp(-Math.max(0, t - T.knallt) * 3);
      pl.torso.rotation.x = 0.35 * land;
      pl.g.scale.set(1, 1 - 0.12 * land, 1);
      // the ball: dribble, then up and through the rim
      plBall.visible = true;
      if (t < T.springst) {
        plBall.position.set(P0[0] + 1.1, 0.62 + Math.abs(Math.cos(t * 7)) * 3.0, P0[2] + 2.9);
      } else {
        const k = ramp(t, T.springst, T.korb + 0.35);
        const fallK = ramp(t, T.korb + 0.35, T.korb + 1.0);
        const yHand = lerp(4.5, 10.8, smooth(k));
        plBall.position.set(
          lerp(P0[0] + 0.6, HOOP[0], smooth(k)),
          t < T.korb + 0.35 ? yHand : lerp(10.4, 0.62, fallK * fallK),
          lerp(P0[2] + 1.5, HOOP[2], smooth(k)),
        );
      }
      plBall.rotation.x = t * 6;
    } else {
      // out of breath: bent over, hands on the knees, sweat
      pl.g.position.set(P0[0] + 2.2, 0, P0[2] + 1.5);
      pl.g.scale.set(1, 1, 1);
      pl.g.rotation.y = -0.5;
      const pant = Math.sin(t * 9) * 0.04;
      pl.torso.rotation.x = 0.6 + pant;
      for (const [a, s] of [
        [pl.armL, 1],
        [pl.armR, -1],
      ]) {
        a.sh.rotation.set(-0.9, 0, s * 0.25);
        a.el.rotation.set(-0.3, 0, 0);
      }
    }
  }
  sweat.forEach((d, i) => {
    const k = ((t - T.anders) * 1.3 + i * 0.25) % 1;
    d.visible = t >= T.anders && t < T.nur2;
    const hx = PLAYER[0] + 2.2 + (i - 1.5) * 0.3;
    d.position.set(hx, 6.6 - k * 2.2, PLAYER[2] + 2.9);
    d.scale.setScalar(Math.max(0.001, 1 - k) * 1.1);
  });

  // ------------------------------------------------ the jet
  const jk = ramp(t, T.also - 0.2, T.gas1);
  jet.visible = jk > 0 && jk < 1;
  jet.position.set(lerp(-34, 18, jk), 14 + jk * 3, -30);
  jet.rotation.set(0, 0, 0.06);

  // ------------------------------------------------ Paris
  const pk = t >= T.designer ? squash(t, T.designer + 0.1, 0.7) : null;
  paris.visible = t >= T.designer && t < T.darum + 0.2;
  if (pk) paris.scale.copy(pk);
  puff("paris", t, T.designer + 0.2, PARIS[0], 0.05, PARIS[2], 1.8);

  // ------------------------------------------------ the viewer's hand taps the window
  hand.track(t, [
    { t: T.fenster1 - 0.6, pos: [-0.5, 0.8, 2.3], rot: [0.1, Math.PI, 0], pose: "point" },
    { t: T.fenster1 + 0.15, pos: [-1.25, 0.5, 1.06], rot: [0.15, Math.PI, 0], pose: "point" },
    { t: T.fenster1 + 0.35, pos: [-1.2, 0.5, 1.18], rot: [0.15, Math.PI, 0], pose: "point" },
    { t: T.sohle + 0.2, pos: [-1.25, 0.5, 1.06], rot: [0.15, Math.PI, 0], pose: "point" },
    { t: T.stell, pos: [-0.4, 0.9, 2.6], rot: [0.1, Math.PI, 0], pose: "open", out: true },
  ]);

  // ------------------------------------------------ panels / HUD
  if (t >= T.rate - 0.05 && t < T.treibhaus) {
    showPanel(pop(t, T.rate - 0.05, T.treibhaus), "WELCHES GAS?", "???", LED.yellow);
  } else if (t >= T.mal20k && t < T.seine) {
    showPanel(pop(t, T.mal20k, T.seine), "KLIMAWIRKUNG", "20.000× CO2", LED.red);
  } else if (t >= T.n2006 && t < T.fenster2 - 0.3) {
    showPanel(pop(t, T.n2006, T.fenster2 - 0.3), "SEIT 2006", "STICKSTOFF", LED.green);
  } else {
    showPanel(0);
  }
  const km = Math.round(800 * smooth(ramp(t, T.n800 - 0.4, T.kilometer + 0.3)));
  counter("km", pop(t, T.n800 - 0.4, T.welche), { label: "KILOMETER", value: km, x: 90, y: 1260 });

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
