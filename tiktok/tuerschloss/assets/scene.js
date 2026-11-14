// #88 Türschloss — a pin-tumbler lock cylinder in the flat's door, 1 unit =
// 1 cm. The cylinder axis is z (face at z = 1), the door front is z = 0,
// pins sit above the plug (shear line at y = 0.6). Two keys: yours (blue,
// with a key bunch) lifts every pin to the line; the neighbour's (red) has
// one tooth too high. Payoff: the door opens. Übrigens: an egyptian wooden
// pin lock on the doormat.
import {
  THREE,
  ramp,
  smooth,
  lerp,
  pop,
  V,
  scene,
  real,
  roundedBox,
  xrayMaterial,
  xrayEdges,
  setXray,
  showNope,
  showPanel,
  LED,
  labels,
  highlights,
  shotCamera,
  renderFrame,
  start,
  rng,
} from "./world.js";
import { FLOOR } from "./set.js";
import { T, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);
const PI = Math.PI;

// ---------------------------------------------------------------- lock data
const PIN_Z = [0.5, 0, -0.5, -1, -1.5];
const TIP_FULL = -1.85;
const CUT = PIN_Z.map((z) => z - TIP_FULL);
const SHEAR = 0.6;
const H_A = [0.25, 0.05, 0.4, 0.15, 0.3];
const H_B = [0.25, 0.05, 0.53, 0.15, 0.3]; // the neighbour's: pin 3 too high
const LEN = H_A.map((h) => SHEAR - h); // key pin lengths
const REST_TOP = 0.25;
const DRIVER = 0.6;
const CHAMBER_TOP = 2.55;

function profile(H) {
  const p = [[0, -0.12]];
  for (let i = 4; i >= 0; i--) {
    if (i < 4) p.push([(CUT[i + 1] + CUT[i]) / 2, Math.min(0.56, Math.max(H[i + 1], H[i]) + 0.14)]);
    p.push([CUT[i] - 0.06, H[i]], [CUT[i] + 0.06, H[i]]);
  }
  p.push([2.62, 0.56], [2.85, 0.5], [3.3, 0.5]);
  return p;
}
const P_A = profile(H_A);
const P_B = profile(H_B);
function profileAt(p, s) {
  if (s <= p[0][0]) return p[0][1];
  for (let i = 1; i < p.length; i++)
    if (s <= p[i][0])
      return lerp(p[i - 1][1], p[i][1], (s - p[i - 1][0]) / (p[i][0] - p[i - 1][0]));
  return p[p.length - 1][1];
}

// ---------------------------------------------------------------- materials
const MAT = {
  doorPaint: new THREE.MeshStandardMaterial({ color: 0x1d4636, roughness: 0.32, metalness: 0.05 }),
  stile: xrayMaterial(0x1d4636),
  plate: xrayMaterial(0xc9a25a, { metalness: 0.85, roughness: 0.3 }),
  housing: xrayMaterial(0xc8a35c, { metalness: 0.8, roughness: 0.3 }),
  plug: xrayMaterial(0xe0bd6e, { metalness: 0.8, roughness: 0.28 }),
  brass: real.metal(0xd8b46a, { roughness: 0.26 }),
  steel: real.metal(0xd0d6de, { roughness: 0.22 }),
  nickel: real.metal(0xd6dade, { roughness: 0.2 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x14100c, roughness: 0.8 }),
  spring: real.metal(0xaeb8c4, { roughness: 0.3 }),
  line: new THREE.MeshBasicMaterial({
    color: 0xffd23f,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  }),
  woodA: real.wood(0xa86e3a, { roughness: 0.62 }),
  woodB: real.wood(0x7c4a22, { roughness: 0.66 }),
  woodPin: real.wood(0x4a2812, { roughness: 0.6 }),
  woodKey: real.wood(0xe0b070, { roughness: 0.55 }),
  woodBolt: real.wood(0x8e5a2c, { roughness: 0.6 }),
  leather: real.plastic(0x6b3a1e, { roughness: 0.7 }),
};
const XRAY = [MAT.stile, MAT.plate, MAT.housing, MAT.plug];

const mesh = (geo, mat, parent, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  parent.add(m);
  return m;
};

// ---------------------------------------------------------------- door
// pivot at the hinge edge so the payoff can swing it open
const doorG = new THREE.Group();
doorG.position.set(-84.5, 0, -4);
scene.add(doorG);
const lockG = new THREE.Group();
lockG.position.set(84.5, 0, 4);
doorG.add(lockG);
const DOOR_Y = FLOOR + 102.5;
mesh(roundedBox(76.5, 205, 4, 0.5, 2), MAT.doorPaint, lockG, -46.25, DOOR_Y, -2);
mesh(roundedBox(13.5, 205, 4, 0.5, 2), MAT.stile, lockG, -1.25, DOOR_Y, -2);
mesh(new THREE.BoxGeometry(0.35, 205, 0.2), MAT.dark, lockG, -8, DOOR_Y, 0.02);
// raised panels with a moulding frame
for (const py of [-55, 42]) {
  mesh(roundedBox(52, 78, 1.2, 0.5, 2), MAT.doorPaint, lockG, -46.25, py, 0.5);
  for (const [w, h, x, y] of [
    [58, 2, 0, 41],
    [58, 2, 0, -41],
    [2, 84, 29, 0],
    [2, 84, -29, 0],
  ])
    mesh(roundedBox(w, h, 1.6, 0.6, 2), MAT.doorPaint, lockG, -46.25 + x, py + y, 0.8);
}
// peephole
{
  const ph = mesh(new THREE.TorusGeometry(1.3, 0.45, 16, 40), MAT.brass, lockG, -42, 58, 0.4);
  mesh(new THREE.CircleGeometry(1.0, 32), MAT.dark, lockG, -42, 58, 0.3);
  ph.castShadow = false;
}
// escutcheon plate (Langschild) + lever handle
mesh(roundedBox(4.6, 24, 0.8, 0.35, 3), MAT.plate, lockG, 0, 6, 0.4);
{
  const rose = mesh(new THREE.CylinderGeometry(1.5, 1.6, 0.6, 48), MAT.brass, lockG, 0, 11, 1.1);
  rose.rotation.x = PI / 2;
  const neck = mesh(new THREE.CylinderGeometry(0.85, 0.95, 5, 32), MAT.brass, lockG, 0, 11, 3.6);
  neck.rotation.x = PI / 2;
  const lever = mesh(new THREE.CapsuleGeometry(0.85, 11, 8, 32), MAT.brass, lockG, -5.6, 11, 6);
  lever.rotation.z = PI / 2;
}

// ---------------------------------------------------------------- cylinder
// euro profile: round part around the plug + the web with the pin chambers above
const housingGeo = (() => {
  const s = new THREE.Shape();
  const a0 = Math.atan2(0.687, 0.5);
  const a1 = Math.atan2(0.687, -0.5);
  s.moveTo(0.5, 0.687);
  s.lineTo(0.5, 2.25);
  s.absarc(0, 2.25, 0.5, 0, PI, false);
  s.lineTo(-0.5, 0.687);
  s.absarc(0, 0, 0.85, a1, a0 + 2 * PI, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, 0.62, 0, 2 * PI, true);
  s.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: 3,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 2,
    curveSegments: 40,
  });
  g.translate(0, 0, -2);
  return g;
})();
mesh(housingGeo, MAT.housing, lockG);
lockG.add(xrayEdges(housingGeo));

const plugG = new THREE.Group();
lockG.add(plugG);
{
  const g = new THREE.CylinderGeometry(0.6, 0.6, 3, 48);
  g.rotateX(PI / 2);
  g.translate(0, 0, -0.5);
  mesh(g, MAT.plug, plugG);
  plugG.add(xrayEdges(g));
  // keyway slot on the face
  mesh(new THREE.BoxGeometry(0.24, 0.95, 0.04), MAT.dark, plugG, 0, 0.05, 1.01);
}
// the shear line glow
const lineMesh = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.035, 2.7), MAT.line);
lineMesh.position.set(0, SHEAR, -0.5);
lineMesh.userData.noAO = true;
lockG.add(lineMesh);

// pins: key pins (brass, in the plug), driver pins (steel), springs
const v2 = (x, y) => new THREE.Vector2(x, y);
const keyPins = [];
const drivers = [];
const springs = [];
const pinMats = [];
const driverMats = [];
class Helix extends THREE.Curve {
  getPoint(t, out = new THREE.Vector3()) {
    return out.set(0.11 * Math.cos(2 * PI * 8 * t), t, 0.11 * Math.sin(2 * PI * 8 * t));
  }
}
const springGeo = new THREE.TubeGeometry(new Helix(), 260, 0.022, 6, false);
const driverGeo = new THREE.LatheGeometry(
  [
    v2(0, 0),
    v2(0.115, 0),
    v2(0.135, 0.02),
    v2(0.135, DRIVER - 0.02),
    v2(0.115, DRIVER),
    v2(0, DRIVER),
  ],
  32,
);
PIN_Z.forEach((z, i) => {
  const L = LEN[i];
  const pm = real.metal(0xf2b13a, { roughness: 0.24, emissive: 0x000000 });
  const dm = real.metal(0xd2dae4, { roughness: 0.22, emissive: 0x000000 });
  pinMats.push(pm);
  driverMats.push(dm);
  const g = new THREE.LatheGeometry(
    [v2(0, 0), v2(0.06, 0), v2(0.135, 0.07), v2(0.135, L - 0.02), v2(0.115, L), v2(0, L)],
    32,
  );
  keyPins.push(mesh(g, pm, plugG, 0, REST_TOP - L, z));
  drivers.push(mesh(driverGeo, dm, lockG, 0, REST_TOP, z));
  springs.push(mesh(springGeo, MAT.spring, lockG, 0, REST_TOP + DRIVER, z));
});

// ---------------------------------------------------------------- keys
function keyGeos(P) {
  const s = new THREE.Shape();
  s.moveTo(0, -0.12);
  s.lineTo(0.15, -0.42);
  s.lineTo(3.3, -0.42);
  for (let i = P.length - 1; i >= 0; i--) s.lineTo(P[i][0], P[i][1]);
  const blade = new THREE.ExtrudeGeometry(s, {
    depth: 0.2,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.015,
    bevelSegments: 2,
  });
  blade.translate(0, 0, -0.1);
  blade.rotateY(-PI / 2);
  const b = new THREE.Shape();
  b.absellipse(4.85, 0.1, 1.6, 1.35, 0, 2 * PI, false);
  const hole = new THREE.Path();
  hole.absarc(5.9, 0.1, 0.3, 0, 2 * PI, true);
  b.holes.push(hole);
  const bow = new THREE.ExtrudeGeometry(b, {
    depth: 0.5,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.08,
    bevelSegments: 3,
    curveSegments: 48,
  });
  bow.translate(0, 0, -0.25);
  bow.rotateY(-PI / 2);
  return { blade, bow };
}
const GEO_A = keyGeos(P_A);
const GEO_B = keyGeos(P_B);

function buildKey(geos, color, s = 1) {
  const g = new THREE.Group();
  const inner = new THREE.Group();
  inner.scale.setScalar(s);
  g.add(inner);
  mesh(geos.blade, MAT.nickel, inner);
  mesh(geos.bow, real.plastic(color, { roughness: 0.38 }), inner);
  // milled grooves along the blade
  for (const [x, y] of [
    [0.105, -0.22],
    [-0.105, 0.0],
  ])
    mesh(new THREE.BoxGeometry(0.02, 0.06, 2.9), MAT.dark, inner, x, y, 1.75);
  const eye = mesh(new THREE.TorusGeometry(0.34, 0.06, 12, 32), MAT.nickel, inner, 0, 0.1, 5.9);
  eye.rotation.y = PI / 2;
  return g;
}
const keyA = buildKey(GEO_A, 0x2a63c9);
const keyB = buildKey(GEO_B, 0xc8392b);
plugG.add(keyA, keyB);

// the key bunch on your key: ring, two more keys, a leather fob
const bunch = new THREE.Group();
bunch.position.set(0, 0.1, 5.9);
keyA.add(bunch);
mesh(new THREE.TorusGeometry(0.9, 0.06, 12, 48), MAT.steel, bunch, 0, -0.9, 0);
{
  const hang = (geos, color, dx, ry, sc) => {
    const outer = new THREE.Group();
    outer.position.set(dx, -1.8, 0);
    outer.rotation.y = ry;
    const k = buildKey(geos, color, sc);
    k.rotation.x = PI / 2;
    k.position.set(0, 5.9 * sc, -0.1 * sc);
    outer.add(k);
    bunch.add(outer);
  };
  hang(GEO_B, 0x3a9a5a, 0.35, 0.5, 0.8);
  hang(GEO_A, 0xe8b43a, -0.4, -0.7, 0.72);
  const fob = mesh(roundedBox(1.5, 3.0, 0.3, 0.3, 3), MAT.leather, bunch, 0, -3.5, 0.3);
  fob.rotation.y = 0.3;
}

// ---------------------------------------------------------------- key rain (mid twist)
const RAIN = 150;
const rainBlade = new THREE.InstancedMesh(GEO_A.blade, MAT.nickel, RAIN);
const rainBow = new THREE.InstancedMesh(
  GEO_A.bow,
  real.plastic(0xffffff, { roughness: 0.4 }),
  RAIN,
);
const rainData = [];
{
  const r = rng(881);
  const cols = [0x2a63c9, 0xc8392b, 0x3a9a5a, 0xe8b43a, 0x8a4fd0, 0xff7a2a, 0x222428];
  for (let i = 0; i < RAIN; i++) {
    rainData.push({
      x: (r() - 0.5) * 70,
      z: 2 + r() * 40,
      t0: T.rate - 0.4 + r() * 2.6,
      v: 30 + r() * 20,
      ax: r() * 6,
      ay: r() * 6,
      sp: 2 + r() * 5,
    });
    rainBow.setColorAt(i, new THREE.Color(cols[i % cols.length]));
  }
  for (const im of [rainBlade, rainBow]) {
    im.frustumCulled = false;
    im.castShadow = true;
    im.scale.setScalar(1.4);
    scene.add(im);
  }
}
const m4 = new THREE.Matrix4();
const q = new THREE.Quaternion();
const eu = new THREE.Euler();
function rain(t) {
  const on = t >= T.rate && t < T.dein;
  rainBlade.visible = rainBow.visible = on;
  if (!on) return;
  rainData.forEach((d, i) => {
    const age = t - d.t0;
    const y = age < 0 ? 999 : 26 - age * d.v;
    eu.set(d.ax + age * d.sp, d.ay + age * d.sp * 0.7, 0);
    q.setFromEuler(eu);
    m4.compose(V(d.x / 1.4, y / 1.4, d.z / 1.4), q, V(1, 1, 1));
    rainBlade.setMatrixAt(i, m4);
    rainBow.setMatrixAt(i, m4);
  });
  rainBlade.instanceMatrix.needsUpdate = rainBow.instanceMatrix.needsUpdate = true;
}

// ---------------------------------------------------------------- egyptian lock
const EG = new THREE.Group();
EG.position.set(-40, FLOOR + 2.2, 28);
EG.rotation.y = 0.25;
scene.add(EG);
mesh(roundedBox(18, 22, 2, 0.5, 2), MAT.woodB, EG, 0, 11, -5);
mesh(roundedBox(18, 4, 10, 0.6, 2), MAT.woodA, EG, 0, 20, 0);
mesh(roundedBox(3, 22, 10, 0.5, 2), MAT.woodA, EG, -7.5, 11, 0);
mesh(roundedBox(3, 22, 10, 0.5, 2), MAT.woodA, EG, 7.5, 11, 0);
// an old plank door behind it, so it reads as a lock
for (let i = 0; i < 6; i++)
  mesh(roundedBox(13.6, 56, 3, 0.8, 2), i % 2 ? MAT.woodB : MAT.woodA, EG, -34 + i * 13.8, 28, -8);
const boltG = new THREE.Group();
EG.add(boltG);
mesh(roundedBox(64, 1.6, 6, 0.4, 2), MAT.woodBolt, boltG, 0, 4.3, 0);
mesh(roundedBox(64, 5.2, 1.4, 0.4, 2), MAT.woodBolt, boltG, 0, 6.2, -2.3);
mesh(roundedBox(64, 1.4, 6, 0.4, 2), MAT.woodBolt, boltG, 0, 8.1, 0);
const egPins = [-4, 0, 4].map((x) =>
  mesh(new THREE.CylinderGeometry(1.1, 1.1, 8, 32), MAT.woodPin, EG, x, 13, 0.5),
);
const egKey = new THREE.Group();
EG.add(egKey);
mesh(roundedBox(48, 1.6, 2.6, 0.4, 2), MAT.woodKey, egKey, -3, 0, 0);
const PEG = [14, 18, 22];
PEG.forEach((x) =>
  mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.6, 24), MAT.woodKey, egKey, x, 1.4, 0),
);
{
  const spot = new THREE.SpotLight(0xffd8a8, 1.1, 0, 0.55, 0.6, 0);
  spot.position.set(-10, FLOOR + 60, 95);
  spot.target = EG;
  spot.castShadow = true;
  spot.shadow.mapSize.set(1024, 1024);
  scene.add(spot);
}
function egyptian(t) {
  // pins drop in (locked), the key slides in, lifts, the bolt slides open
  const drop = smooth(ramp(t, T.fakt + 0.3, T.fakt + 0.7));
  const lift = smooth(ramp(t, T.holz - 0.1, T.holz + 0.3));
  const slide = smooth(ramp(t, T.holz + 0.4, T.holz + 1.4)) * 16;
  const kx = lerp(-62, -18, smooth(ramp(t, T.aegypter - 0.1, T.aegypter + 1.1)));
  egPins.forEach((p) => (p.position.y = lerp(13.2, 10.4, drop) + lift * 2.2));
  egKey.position.set(kx + slide, 5.3 + lift * 2.2, 0.4);
  boltG.position.x = slide;
}

// ---------------------------------------------------------------- key timeline
const wig = (t, at, amp, dur = 1) =>
  t < at ? 0 : -amp * Math.sin((t - at) * 28) * Math.exp(-(t - at) * (3 / dur));
function keyAt(t) {
  if (t < T.nachbarn1) {
    const tip = lerp(4.8, TIP_FULL, smooth(ramp(t, -0.25, 1.75)));
    const ang = -(PI / 2) * smooth(ramp(t, T.dreht1 + 0.05, T.dreht1 + 0.5));
    return { key: keyA, P: P_A, tip, ang };
  }
  if (t < T.warum) {
    const tip = lerp(4.6, TIP_FULL, smooth(ramp(t, T.nachbarn1 + 0.1, T.nachbarn1 + 1.4)));
    return { key: keyB, P: P_B, tip, ang: wig(t, T.stecken, 0.1, 1.2) };
  }
  if (t < T.dein) return { key: null, ang: t < T.zylinder ? wig(t, T.walze1 + 0.5, 0.05, 1.5) : 0 };
  if (t < T.nachbarn2) {
    const tip = lerp(4.6, TIP_FULL, smooth(ramp(t, T.dein + 0.15, T.trenn - 0.2)));
    const k = ramp(t, T.zack, T.zack + 0.35);
    return { key: keyA, P: P_A, tip, ang: -(PI / 2) * (k < 1 ? smooth(k) * 1.08 : 1) };
  }
  if (t < T.payoff) {
    const tip = lerp(3.2, TIP_FULL, smooth(ramp(t, T.nachbarn2, T.nachbarn2 + 0.5)));
    return { key: keyB, P: P_B, tip, ang: wig(t, T.hoch2, 0.08, 1) };
  }
  return {
    key: keyA,
    P: P_A,
    tip: TIP_FULL,
    ang: -(PI / 2) * smooth(ramp(t, T.payoff + 0.3, T.payoff + 0.7)),
  };
}

const applyCamera = shotCamera(shots, 1);

function renderAt(t) {
  const st = keyAt(t);
  keyA.visible = st.key === keyA;
  keyB.visible = st.key === keyB;
  if (st.key) st.key.position.set(0, 0, st.tip);
  plugG.rotation.z = st.ang;
  const turned = Math.abs(st.ang) > 0.3;
  bunch.rotation.z = -st.ang + 0.18 * Math.sin(t * 3.3) * (0.4 + 0.6 * Math.exp(-((t % 6) * 0.5)));

  // pins follow the key's teeth
  const split = pop(t, T.geteilt, T.rate, 0.3);
  PIN_Z.forEach((z, i) => {
    const s = z - (st.tip ?? 99);
    const blade = st.key && s >= 0 && s <= 3.3 ? profileAt(st.P, s) : -9;
    const bottom = Math.max(REST_TOP - LEN[i], blade);
    const top = bottom + LEN[i];
    keyPins[i].position.y = bottom;
    let db = turned ? Math.max(SHEAR, top) : top;
    if (i === 1) db += split * 0.35;
    drivers[i].position.y = db;
    const st0 = db + DRIVER;
    springs[i].position.y = st0;
    springs[i].scale.y = CHAMBER_TOP - st0;
    // glow: the roll call of the five pins, the split, the one too high
    const call = pop(t, T.fuenf + 0.05 + i * 0.16, T.fuenf + 0.6 + i * 0.16, 0.12);
    const bad =
      i === 2 && st.key === keyB && t >= T.nachbarn2 ? pop(t, T.hoch2 - 0.1, T.payoff) : 0;
    const sp = i === 1 ? split : 0;
    pinMats[i].emissive.setRGB(1.0 * Math.max(call, sp) + bad * 1.6, 0.55 * Math.max(call, sp), 0);
    driverMats[i].emissive.setRGB(0.25 * sp, 0.55 * sp, 0.9 * sp);
  });

  // x-ray only while the inside is explained
  let xr = 0;
  if (t >= T.zylinder - 0.3 && t < T.rate) xr = smooth(ramp(t, T.zylinder - 0.3, T.zylinder));
  else if ((t >= T.dein && t < T.frei) || (t >= T.nachbarn2 && t < T.payoff)) xr = 1;
  setXray(XRAY, xr);
  MAT.line.opacity =
    xr *
    Math.max(pop(t, T.linie1 - 0.1, T.frei, 0.2), t >= T.nachbarn2 && t < T.payoff ? 0.8 : 0) *
    (0.85 + 0.15 * Math.sin(t * 14));

  // the hand holds your key in the hook

  // door opens in the payoff
  doorG.rotation.y = 0.5 * smooth(ramp(t, T.genau + 0.15, T.genau + 1.1));

  rain(t);
  EG.visible = t >= T.fakt - 0.05;
  egyptian(t);

  showNope(pop(t, T.stecken + 0.25, T.warum), 0, 3.2, 2, 1.4);
  showNope(pop(t, T.hoch2 + 0.05, T.payoff), 0, 2.2, -0.5, 0.9);
  if (t >= T.zehn && t < T.dein)
    showPanel(pop(t, T.zehn, T.dein), "SCHLÜSSEL", "ZEHNTAUSENDE", LED.yellow);
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
