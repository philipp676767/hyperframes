// #84 Föhn — the subject: a graphite hair dryer with a rose-gold ring (nozzle
// along +x, handle down) in the viewer's hand. Inside (x-ray): fan + motor at
// the back, the heating coil wound on a mica cross, the bimetal strip above
// the coil's front end with its contact. Air beads flow through it; the
// dryer presses into the towel, the coil goes white-hot, smoke and a flame,
// the strip bends — klack. Mini-set: a pizza in front of a glowing oven.
// Übrigens: the warm Föhn wind over the Alps outside the window.
import {
  THREE,
  ramp,
  smooth,
  pop,
  scene,
  real,
  roundedBox,
  xrayMaterial,
  xrayEdges,
  setXray,
  showNope,
  makeArrowSet,
  animateArrows,
  heatMat,
  coldMat,
  showPanel,
  LED,
  labels,
  squash,
  highlights,
  shotCamera,
  renderFrame,
  start,
  rng,
  clamp01,
  lerp,
} from "./world.js";
import { TOP, OUT, towel, towelMat, put, CONTACT_X, TOWEL_ROT } from "./set.js";
import { createHand } from "./hand.js";
import { T, PUSH, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);
const PI = Math.PI;
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------- state over time (pure)
// power: 1 = heating + fan on
function power(t) {
  if (t < T.aus1 + 0.08) return 1;
  if (t < T.stell) return 0;
  if (t < T.ploetzlich) return 1;
  if (t < T.hinter) return 0;
  if (t < T.klack + 0.02) return 1;
  if (t < T.cta) return 0;
  return 1;
}
// push into the towel 0..1
function pushK(t) {
  if (t < T.stell) return 1;
  return (
    smooth(ramp(t, T.handtuch - 0.05, T.handtuch + 0.6)) *
    (1 - smooth(ramp(t, T.hitze, T.hitze + 0.9)))
  );
}
// how freely air flows (1 free, ~0 jammed)
function airFree(t) {
  if (t < T.stell) return 0.12;
  return 1 - 0.88 * smooth(ramp(t, T.staut - 0.2, T.heizt));
}
// fan speed with spin-up / spin-down
const DT = 1 / 60;
const N_TAB = Math.ceil(47 / DT);
const fanTab = new Float32Array(N_TAB);
const airTab = new Float32Array(N_TAB);
{
  let sp = 0;
  let a = 0;
  let ph = 0;
  for (let i = 0; i < N_TAB; i++) {
    const t = -1 + i * DT;
    const target = power(t);
    sp += (target - sp) * (target > sp ? 0.18 : 0.045);
    a += sp * DT * 55;
    ph += sp * airFree(t) * DT * 2.4;
    fanTab[i] = a;
    airTab[i] = ph;
  }
}
const tab = (arr, t) => {
  const f = clamp01((t + 1) / (N_TAB * DT)) * (N_TAB - 1);
  const i = Math.floor(f);
  return lerp(arr[i], arr[Math.min(i + 1, N_TAB - 1)], f - i);
};
const fanSpeed = (t) => (tab(fanTab, t + DT) - tab(fanTab, t)) / (DT * 55);
// heat of the coil 0..1 (0.55 = normal orange, 1 = white-hot)
function heat(t) {
  const on = power(t);
  if (t < T.stell) {
    if (t < T.aus1 + 0.08) return 1;
    return Math.exp(-(t - T.aus1 - 0.08) * 1.4);
  }
  let h = 0.58 + 0.12 * pop(t, T.ueber, T.pizza, 0.2);
  h += 0.42 * smooth(ramp(t, T.staut, T.bis + 0.2));
  if (on) return Math.min(1, h);
  // decaying after a switch-off
  const offAt = t < T.hinter ? T.ploetzlich : t < T.cta ? T.klack + 0.02 : 99;
  const h0 = t < T.hinter ? 0.58 : 1;
  return h0 * Math.exp(-(t - offAt) * 2.2);
}

// ---------------------------------------------------------------- dryer
const dryer = new THREE.Group();
scene.add(dryer);
const shellMat = xrayMaterial(0x2b2c30, { roughness: 0.42, side: THREE.DoubleSide });
const nozMat = xrayMaterial(0x1d1e21, { roughness: 0.3, side: THREE.DoubleSide });
const roseMat = xrayMaterial(0xd49a7f, { roughness: 0.22, metalness: 0.9 });
const grillMat = xrayMaterial(0x141416, { roughness: 0.5, metalness: 0.4 });
const XRAY = [shellMat, nozMat, roseMat, grillMat];

const lathe = (pts, segs = 96) =>
  new THREE.LatheGeometry(
    pts.map(([r, x]) => new THREE.Vector2(r, x)),
    segs,
  ).rotateZ(-PI / 2);
{
  const g = lathe([
    [0.4, -1.36],
    [0.5, -1.33],
    [0.57, -1.2],
    [0.6, -0.9],
    [0.6, 0.75],
    [0.585, 0.9],
    [0.55, 0.97],
    [0.47, 0.99],
  ]);
  put(g, shellMat, 0, 0, 0, dryer);
  dryer.add(xrayEdges(g));
  const n = lathe([
    [0.53, 0.97],
    [0.53, 1.05],
    [0.47, 1.3],
    [0.41, 1.56],
    [0.37, 1.57],
    [0.36, 1.5],
  ]);
  put(n, nozMat, 0, 0, 0, dryer);
  put(new THREE.TorusGeometry(0.565, 0.03, 16, 96).rotateY(PI / 2), roseMat, 0.985, 0, 0, dryer);
  // front grill (rings + spokes)
  for (const r of [0.12, 0.24])
    put(
      new THREE.TorusGeometry(r, 0.012, 8, 64).rotateY(PI / 2),
      grillMat,
      1.5,
      0,
      0,
      dryer,
      false,
    );
  for (let i = 0; i < 6; i++) {
    const s = put(roundedBox(0.02, 0.74, 0.02, 0.008), grillMat, 1.5, 0, 0, dryer, false);
    s.rotation.x = (i / 6) * PI;
  }
  // rear intake: rings + spokes + rose-gold rim
  for (const r of [0.1, 0.2, 0.3])
    put(
      new THREE.TorusGeometry(r, 0.018, 8, 64).rotateY(PI / 2),
      grillMat,
      -1.37,
      0,
      0,
      dryer,
      false,
    );
  for (let i = 0; i < 8; i++) {
    const s = put(roundedBox(0.03, 0.8, 0.03, 0.01), grillMat, -1.37, 0, 0, dryer, false);
    s.rotation.x = (i / 8) * PI;
  }
  put(new THREE.TorusGeometry(0.41, 0.025, 12, 64).rotateY(PI / 2), roseMat, -1.36, 0, 0, dryer);
  // handle + buttons + logo
  const handle = put(roundedBox(0.6, 2.25, 0.7, 0.27, 6), shellMat, -0.32, -1.2, 0, dryer);
  handle.rotation.z = 0.16;
  const sl = put(roundedBox(0.16, 0.5, 0.08, 0.05), roseMat, -0.18, -0.75, 0.36, dryer);
  sl.rotation.z = 0.16;
  put(
    new THREE.CylinderGeometry(0.08, 0.08, 0.06, 32).rotateX(PI / 2),
    real.plastic(0x5b8fd6),
    -0.24,
    -1.15,
    0.36,
    dryer,
  );
  put(
    new THREE.CylinderGeometry(0.06, 0.06, 0.02, 32).rotateX(PI / 2),
    roseMat,
    -0.2,
    0.1,
    0.6,
    dryer,
  );
  put(roundedBox(0.36, 0.035, 0.02, 0.01), roseMat, -0.2, -0.02, 0.6, dryer);
  // hanging loop + cable
  put(new THREE.TorusGeometry(0.12, 0.03, 12, 32), real.rubber(0x1a1a1a), -0.56, -2.42, 0, dryer);
  put(
    new THREE.CylinderGeometry(0.1, 0.14, 0.4, 24),
    real.rubber(0x1a1a1a),
    -0.45,
    -2.45,
    0,
    dryer,
  ).rotation.z = 0.16;
  const cable = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      V(-0.5, -2.6, 0),
      V(-0.62, -3.1, 0.2),
      V(-1.2, -3.55, 0.8),
      V(-3.2, -3.6, 1.6),
      V(-6, -3.6, 1.0),
    ]),
    80,
    0.055,
    10,
  );
  put(cable, real.rubber(0x1c1c1e), 0, 0, 0, dryer);
}

// ---------------------------------------------------------------- inside (x-ray)
const inside = new THREE.Group();
dryer.add(inside);
const fan = new THREE.Group();
fan.position.x = -1.12;
inside.add(fan);
{
  const fanMat = real.plastic(0x9fb4c8, { roughness: 0.35 });
  put(new THREE.CylinderGeometry(0.12, 0.12, 0.12, 32).rotateZ(PI / 2), fanMat, 0, 0, 0, fan);
  for (let i = 0; i < 8; i++) {
    const b = new THREE.Group();
    const m = put(roundedBox(0.03, 0.3, 0.14, 0.012), fanMat, 0, 0.26, 0, b);
    m.rotation.y = 0.55;
    b.rotation.x = (i / 8) * PI * 2;
    fan.add(b);
  }
  // motor
  put(
    new THREE.CylinderGeometry(0.2, 0.2, 0.42, 32).rotateZ(PI / 2),
    real.metal(0xbfc4c9, { roughness: 0.3 }),
    -0.82,
    0,
    0,
    inside,
  );
  put(
    new THREE.CylinderGeometry(0.17, 0.17, 0.3, 32).rotateZ(PI / 2),
    real.metal(0xc0703a, { roughness: 0.35 }),
    -0.82,
    0,
    0,
    inside,
  );
  // mica cross
  const mica = real.plastic(0xd9c79a, { roughness: 0.6, transparent: true, opacity: 0.85 });
  for (const rx of [0, PI / 2]) {
    const p = put(new THREE.BoxGeometry(1.45, 0.66, 0.015), mica, 0.2, 0, 0, inside, false);
    p.rotation.x = rx;
  }
}
// coil: two helices of thin wire
const coilMat = new THREE.MeshStandardMaterial({
  color: 0x5a3a2a,
  roughness: 0.5,
  metalness: 0.6,
  emissive: 0xff5a10,
  emissiveIntensity: 1,
});
for (const [R, ph] of [
  [0.31, 0],
  [0.2, 1.3],
]) {
  const pts = [];
  for (let i = 0; i <= 600; i++) {
    const u = i / 600;
    const a = ph + u * PI * 2 * 13;
    pts.push(V(-0.48 + u * 1.38, Math.cos(a) * R, Math.sin(a) * R));
  }
  put(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 900, 0.022, 6),
    coilMat,
    0,
    0,
    0,
    inside,
    false,
  );
}
const coilLight = new THREE.PointLight(0xff7a2a, 0, 4, 2);
coilLight.position.set(0.9, 0, 0);
dryer.add(coilLight);
const coilColor = (h) => {
  const c = new THREE.Color();
  const stops = [
    [0.0, 0x220400],
    [0.3, 0x9a1400],
    [0.58, 0xff4a10],
    [0.8, 0xffa030],
    [1.0, 0xfff2c0],
  ];
  for (let i = 1; i < stops.length; i++)
    if (h <= stops[i][0]) {
      const k = (h - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]);
      return c.set(stops[i - 1][1]).lerp(new THREE.Color(stops[i][1]), k);
    }
  return c.set(0xfff2c0);
};

// bimetal strip: fixed at its rear end, 8 links that bend up; contact under the tip
const bim = new THREE.Group();
bim.position.set(0.32, 0.45, 0);
dryer.add(bim);
put(roundedBox(0.12, 0.1, 0.16, 0.03), real.ceramic(0xf2efe8), -0.04, -0.03, 0, bim);
const links = [];
const NL = 8;
const LL = 0.065;
const copper = new THREE.MeshStandardMaterial({
  color: 0xc8703a,
  roughness: 0.3,
  metalness: 0.9,
  emissive: 0xff3a00,
  emissiveIntensity: 0,
});
const steel = new THREE.MeshStandardMaterial({ color: 0xc9ced4, roughness: 0.25, metalness: 0.9 });
const copperLayers = [];
const steelLayers = [];
{
  let parent = bim;
  for (let i = 0; i < NL; i++) {
    const g = new THREE.Group();
    g.position.x = i === 0 ? 0.02 : LL;
    parent.add(g);
    copperLayers.push(
      put(new THREE.BoxGeometry(LL, 0.018, 0.1), copper, LL / 2, 0.009, 0, g, false),
    );
    steelLayers.push(
      put(new THREE.BoxGeometry(LL, 0.018, 0.1), steel, LL / 2, -0.009, 0, g, false),
    );
    links.push(g);
    parent = g;
  }
  // moving contact at the tip
  put(
    new THREE.CylinderGeometry(0.025, 0.025, 0.02, 16),
    real.metal(0xeeeeee, { roughness: 0.15 }),
    LL - 0.01,
    -0.028,
    0,
    parent,
  );
}
// fixed contact + bracket
put(
  new THREE.CylinderGeometry(0.025, 0.025, 0.02, 16),
  real.metal(0xeeeeee, { roughness: 0.15 }),
  0.32 + 0.02 + NL * LL - 0.08,
  0.398,
  0,
  dryer,
);
put(
  roundedBox(0.04, 0.12, 0.1, 0.01),
  real.metal(0x9aa0a6),
  0.32 + 0.02 + NL * LL - 0.08,
  0.34,
  0,
  dryer,
);
const spark = new THREE.Mesh(
  new THREE.SphereGeometry(0.05, 16, 12),
  new THREE.MeshBasicMaterial({
    color: 0xbfe3ff,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }),
);
spark.position.set(0.32 + 0.02 + NL * LL - 0.08, 0.42, 0);
spark.userData.noAO = true;
dryer.add(spark);

// ---------------------------------------------------------------- air beads (x-ray)
const NB = 170;
const beads = new THREE.InstancedMesh(
  new THREE.SphereGeometry(0.03, 10, 8),
  new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 }),
  NB,
);
beads.frustumCulled = false;
beads.userData.noAO = true;
dryer.add(beads);
const bSeed = (() => {
  const r = rng(84);
  return Array.from({ length: NB }, () => [r(), r() * PI * 2, 0.1 + r() * 0.32]);
})();
const m4 = new THREE.Matrix4();
const cBlue = new THREE.Color(0x48a8ff);
const cHot = new THREE.Color(0xff6a1a);
const tmpC = new THREE.Color();
const X0 = -2.4;
const X1 = 3.2;

// ---------------------------------------------------------------- air arrows (solid shots)
const hotArrows = makeArrowSet(
  [
    [V(1.65, 0.12, 0), V(3.5, 0.2, 0)],
    [V(1.65, -0.12, 0.12), V(3.4, -0.25, 0.25)],
    [V(1.65, 0, -0.14), V(3.4, 0, -0.3)],
  ],
  { parent: dryer, mat: heatMat, r: 0.03, amp: 0.06 },
);
const coldArrows = makeArrowSet(
  [
    [V(-2.7, 0.25, 0.1), V(-1.5, 0.1, 0)],
    [V(-2.7, -0.2, 0.25), V(-1.5, -0.1, 0.1)],
    [V(-2.6, 0, -0.3), V(-1.5, 0, -0.1)],
  ],
  { parent: dryer, mat: coldMat, r: 0.03, amp: 0.05 },
);

// ---------------------------------------------------------------- towel: scorch glow, smoke, flames
const scorchTex = (() => {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, "rgba(255,240,190,1)");
  grd.addColorStop(0.3, "rgba(255,120,30,0.9)");
  grd.addColorStop(0.65, "rgba(160,30,0,0.45)");
  grd.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
})();
const scorch = new THREE.Mesh(
  new THREE.PlaneGeometry(2.3, 2.3),
  new THREE.MeshBasicMaterial({
    map: scorchTex,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }),
);
scorch.rotation.y = -PI / 2 + TOWEL_ROT;
scorch.position.set(CONTACT_X - 0.04, 0, 0);
scorch.userData.noAO = true;
scene.add(scorch);
const smoke = [];
const smokeMat = new THREE.MeshStandardMaterial({
  color: 0x6d6f74,
  roughness: 1,
  transparent: true,
  depthWrite: false,
});
for (let i = 0; i < 14; i++) {
  const s = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 10), smokeMat.clone());
  s.userData.noAO = true;
  scene.add(s);
  smoke.push(s);
}
const flames = [];
for (let i = 0; i < 7; i++) {
  const f = new THREE.Mesh(
    new THREE.ConeGeometry(0.12, 0.6, 12, 1, true),
    new THREE.MeshBasicMaterial({
      color: i % 2 ? 0xffb030 : 0xff5a10,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  f.userData.noAO = true;
  scene.add(f);
  flames.push(f);
}
const fireLight = new THREE.PointLight(0xff6a20, 0, 5, 2);
fireLight.position.set(CONTACT_X - 0.6, 0.3, 0.5);
scene.add(fireLight);

// ---------------------------------------------------------------- pizza mini-set (by the window)
const PZ = { x: 9.6, z: -2.6 };
const pizzaSet = new THREE.Group();
pizzaSet.position.set(PZ.x, TOP, PZ.z);
scene.add(pizzaSet);
{
  // brick oven dome with a glowing mouth
  const dome = put(
    new THREE.SphereGeometry(2.2, 48, 24, 0, PI * 2, 0, PI / 2),
    real.ceramic(0xb8573a, { roughness: 0.8, clearcoat: 0 }),
    0,
    0,
    -1.6,
    pizzaSet,
  );
  dome.scale.set(1, 0.85, 1);
  const mouth = put(
    new THREE.CircleGeometry(0.9, 48, 0, PI),
    new THREE.MeshBasicMaterial({ color: 0xff8a2a }),
    0,
    0.02,
    0.55,
    pizzaSet,
    false,
  );
  mouth.scale.set(1.1, 1, 1);
  put(
    roundedBox(2.5, 0.2, 0.5, 0.06),
    real.ceramic(0x9a4a32, { roughness: 0.85 }),
    0,
    1.0,
    0.5,
    pizzaSet,
  );
  // wooden peel + pizza
  put(
    roundedBox(2.2, 0.08, 2.2, 0.3),
    real.wood(0xc9935a, { roughness: 0.6 }),
    0,
    0.04,
    1.9,
    pizzaSet,
  );
  put(
    roundedBox(0.35, 0.07, 1.6, 0.1),
    real.wood(0xc9935a, { roughness: 0.6 }),
    0,
    0.04,
    3.6,
    pizzaSet,
  );
  put(
    new THREE.CylinderGeometry(0.95, 0.95, 0.12, 64),
    real.plastic(0xe7b56a, { roughness: 0.7 }),
    0,
    0.14,
    1.9,
    pizzaSet,
  );
  put(
    new THREE.CylinderGeometry(0.82, 0.82, 0.04, 64),
    real.plastic(0xc8321e, { roughness: 0.5 }),
    0,
    0.21,
    1.9,
    pizzaSet,
  );
  const r = rng(11);
  for (let i = 0; i < 9; i++) {
    const a = r() * PI * 2;
    const d = r() * 0.6;
    put(
      new THREE.SphereGeometry(0.16, 16, 10).scale(1, 0.3, 1),
      real.plastic(0xfaf2dc, { roughness: 0.4 }),
      Math.cos(a) * d,
      0.24,
      1.9 + Math.sin(a) * d,
      pizzaSet,
    );
  }
  for (let i = 0; i < 4; i++) {
    const a = r() * PI * 2;
    const d = 0.2 + r() * 0.4;
    put(
      new THREE.SphereGeometry(0.1, 12, 8).scale(1.4, 0.2, 0.8),
      real.plastic(0x2f7a32),
      Math.cos(a) * d,
      0.27,
      1.9 + Math.sin(a) * d,
      pizzaSet,
    );
  }
}
const ovenLight = new THREE.PointLight(0xff8030, 0, 6, 2);
ovenLight.position.set(PZ.x, TOP + 0.6, PZ.z + 0.8);
scene.add(ovenLight);

// ---------------------------------------------------------------- Föhn wind over the Alps
const alpWind = makeArrowSet(
  [
    [V(OUT.x - 150, 175, -300), V(OUT.x - 20, 110, -260)],
    [V(OUT.x - 110, 150, -280), V(OUT.x + 20, 85, -240)],
    [V(OUT.x - 60, 165, -310), V(OUT.x + 70, 100, -270)],
  ],
  { mat: heatMat, r: 2.2, amp: 3.5 },
);

// ---------------------------------------------------------------- the hand on the handle
const hand = createHand({ scale: 1.25, sleeve: 0xe8e1d4, skin: 0xeab896 });
scene.remove(hand.group);
dryer.add(hand.group);
const HR = (() => {
  const m = new THREE.Matrix4().makeBasis(V(0, 1, 0), V(-1, 0, 0), V(0, 0, 1));
  const e = new THREE.Euler().setFromRotationMatrix(m);
  return [e.x, e.y, e.z];
})();
const HP = [-0.9, -1.05, -0.75];

const applyCamera = shotCamera(shots);

function renderAt(t) {
  // dryer pose: pushed into the towel, held in the hand (slight life)
  const pk = pushK(t);
  dryer.position.set(PUSH * pk + Math.sin(t * 1.3) * 0.02, Math.sin(t * 1.7) * 0.025, 0);
  dryer.rotation.z = Math.sin(t * 1.1) * 0.012;
  hand.track(t, [
    { t: -1, pos: HP, rot: HR, pose: "grab" },
    { t: 46, pos: HP, rot: HR, pose: "grab" },
  ]);

  // fan + coil
  fan.rotation.x = tab(fanTab, t);
  const h = heat(t);
  const cc = coilColor(h);
  coilMat.emissive.copy(cc);
  coilMat.emissiveIntensity = 0.3 + 2.6 * h;
  coilLight.color.copy(cc);
  coilLight.intensity = 6 * h * h;

  // x-ray: the coil + fan stretch and the towel → bimetal stretch
  const xr =
    smooth(ramp(t, T.draht1 - 0.2, T.draht1 + 0.2)) * (1 - ramp(t, T.wind1 - 0.05, T.wind1)) +
    smooth(ramp(t, T.staut - 0.15, T.staut + 0.25)) * (1 - ramp(t, T.der2 - 0.2, T.der2 + 0.2));
  setXray(XRAY, xr);
  bim.visible = xr > 0.02;

  // bimetal: warms and bends from "biegt", contact opens on "reißt", stays open
  const bend =
    smooth(ramp(t, T.biegt1, T.reisst + 0.1)) * (1 - smooth(ramp(t, T.cta, T.cta + 1.5)));
  links.forEach((l) => (l.rotation.z = bend * 0.11));
  copper.emissiveIntensity =
    0.6 * smooth(ramp(t, T.heiss2, T.biegt1)) * (1 - ramp(t, T.klack, T.klack + 1.5));
  const split = pop(t, T.metallen, T.heiss2, 0.25);
  copperLayers.forEach((m) => (m.position.y = 0.009 + split * 0.04));
  steelLayers.forEach((m) => (m.position.y = -0.009 - split * 0.04));
  const sp = pop(t, T.reisst + 0.25, T.reisst + 0.5, 0.08) + pop(t, T.klack, T.klack + 0.25, 0.05);
  spark.visible = sp > 0.01 && xr > 0.02;
  spark.scale.setScalar(0.4 + sp * 1.6);
  spark.material.opacity = sp;

  // air beads
  beads.visible = xr > 0.3;
  if (beads.visible) {
    const ph = tab(airTab, t);
    const free = airFree(t);
    const pushX = 0;
    for (let i = 0; i < NB; i++) {
      const [u0, a, rr] = bSeed[i];
      let f = (u0 + ph) % 1;
      // jam: beads crowd toward the nozzle instead of leaving
      const jam = 1 - free;
      f = f * (1 - jam * 0.45) + jam * 0.35 * Math.pow(f, 0.3);
      const x = lerp(X0, X1 - jam * 1.6, f);
      let rad = rr;
      if (x < -1.35) rad = rr * (1 + (-1.35 - x) * 1.1);
      else if (x > 1.56) rad = rr * 0.8 * (1 + (x - 1.56) * 0.35);
      const wob = Math.sin(t * 7 + i) * 0.015;
      m4.makeTranslation(x + pushX, Math.cos(a) * rad + wob, Math.sin(a) * rad);
      beads.setMatrixAt(i, m4);
      const hk = clamp01((x + 0.3) / 1.2) * (power(t) ? 1 : 0.4);
      tmpC.copy(cBlue).lerp(cHot, hk);
      beads.setColorAt(i, tmpC);
    }
    beads.instanceMatrix.needsUpdate = true;
    if (beads.instanceColor) beads.instanceColor.needsUpdate = true;
  }

  // arrows in the solid shots
  const fs = fanSpeed(t);
  const onAir = fs > 0.3 && xr < 0.1 && pk < 0.2;
  const hotWin = (t >= T.foehnst && t < T.ploetzlich) || (t >= T.wind1 && t < T.rate) || t >= T.cta;
  animateArrows(hotArrows, t, onAir && hotWin ? clamp01(fs) : 0);
  animateArrows(coldArrows, t, pop(t, T.kuehlt, T.aber));
  // the towel moves in the warm wind
  const blow = onAir ? clamp01(fs) * (1 - pk) : 0;
  towel.rotation.z = (0.05 + Math.sin(t * 9) * 0.02) * blow;

  // scorch, smoke, flames at the towel
  const pressedHot = pk * clamp01((h - 0.62) / 0.3);
  scorch.material.opacity = Math.min(1, pressedHot * 1.3);
  scorch.visible = pressedHot > 0.01;
  towelMat.emissive.setRGB(0.05 * pressedHot, 0.012 * pressedHot, 0);
  const smokeK = Math.max(
    t < T.stell ? 1 - ramp(t, T.aus1 + 0.6, T.stell) : 0,
    pk * clamp01((h - 0.7) / 0.25),
    pop(t, T.klack, T.darum2 + 0.5, 0.4) * 0.6,
  );
  smoke.forEach((s, i) => {
    const f = (t * 0.45 + i / smoke.length) % 1;
    s.visible = smokeK > 0.01;
    s.position.set(
      CONTACT_X - 0.15 - f * 0.6 + Math.sin(f * 7 + i) * 0.12,
      0.15 + f * 2.6,
      Math.cos(f * 5 + i) * 0.25,
    );
    s.scale.setScalar(0.6 + f * 3.2);
    s.material.opacity = 0.42 * smokeK * Math.sin(f * PI);
  });
  const fk = pop(t, T.bis, T.darum1, 0.15);
  flames.forEach((f, i) => {
    f.visible = fk > 0.01;
    const fl = 0.75 + 0.35 * Math.sin(t * 23 + i * 2.1) + 0.2 * Math.sin(t * 41 + i);
    f.position.set(CONTACT_X - 0.1 - 0.05 * i, 0.2 + 0.3 * fl * fk, -0.35 + (i / 6) * 0.7);
    f.scale.set(fk * (0.8 + 0.4 * (i % 3)), fk * fl * 1.6, fk);
  });
  fireLight.intensity = 8 * fk + 2.5 * pressedHot;

  // ✕ on "kaputt?"
  showNope(pop(t, T.kaputt, T.nein + 0.35), 0.1, 1.0, 0.4, 0.7);

  // pizza mini-set pops in for its shot
  const pv = t >= T.pizza - 0.05 && t < T.kuehlt;
  pizzaSet.visible = pv;
  if (pv) pizzaSet.scale.copy(squash(t, T.pizza));
  ovenLight.intensity = pv ? 9 + Math.sin(t * 13) * 1.5 : 0;

  // Föhn wind over the Alps
  animateArrows(alpWind, t, pop(t, T.wind2 - 0.1, T.cta));

  // LED panel: the guess, then the brand
  if (t >= T.ueber && t < T.pizza)
    showPanel(pop(t, T.ueber, T.pizza), "HEIZDRAHT", "ÜBER 500 °C", LED.red);
  else if (t >= T.marke && t < T.wind2)
    showPanel(pop(t, T.marke, T.wind2), "MARKENNAME", "FÖN", LED.yellow);
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
