// #72 Rolltreppe (Format A) — why the brushes at the edge are there.
// The escalator is built in "profile space": a group turned so that local
// X = u (distance up the escalator, world -z), Y = height, Z = sideways
// (world +x). The step band is one closed loop: top run → around the upper
// sprocket → back underneath, upside down → around the lower one.
import {
  THREE,
  ramp,
  smooth,
  clamp01,
  lerp,
  outBack,
  pop,
  V,
  rng,
  scene,
  real,
  roundedBox,
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
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import "./set.js";
import { makeFigure } from "./figur.js";
import { T, shots, LABELS, HIGHLIGHTS, H } from "./beats.js";

highlights(HIGHLIGHTS);

// ---------------------------------------------------------------- the path
const TAN = Math.tan(Math.PI / 6);
const R = 0.38; // sprocket radius
const U0 = -4.7;
const U1 = 4.7;
const UE = 5.6; // end of the truss
const Y0 = 0.012;
const S01 = (x) => smooth(clamp01(x));
const YT = [];
{
  let y = 0;
  for (let i = 0; i <= 1400; i++) {
    const u = -7 + i * 0.01;
    YT.push(y);
    y += TAN * (S01((u + 3.35) / 0.7) - S01((u - 2.65) / 0.7)) * 0.01;
  }
}
// height of the nose line (the step edges) at u
const ytop = (u) => {
  const f = clamp01((u + 7) / 14) * 1400;
  const i = Math.min(1399, Math.floor(f));
  return lerp(YT[i], YT[i + 1], f - i);
};
// closed loop, resampled every 5 mm: u, y, tumble angle, tangent angle
const DS = 0.005;
const PU = [];
const PY = [];
const PA = [];
const PT = [];
let L = 0;
{
  const raw = [];
  for (let u = U0; u < U1; u += 0.01) raw.push([u, ytop(u), 0]);
  for (let a = 0; a < Math.PI; a += 0.02)
    raw.push([U1 + R * Math.sin(a), H - R + R * Math.cos(a), a]);
  for (let u = U1; u > U0; u -= 0.01) raw.push([u, ytop(u) - 2 * R, Math.PI]);
  for (let a = Math.PI; a < 2 * Math.PI; a += 0.02)
    raw.push([U0 + R * Math.sin(a), -R + R * Math.cos(a), a]);
  raw.push([U0, 0, 2 * Math.PI]);
  let acc = 0;
  let next = 0;
  for (let i = 0; i < raw.length - 1; i++) {
    const [u0, y0, a0] = raw[i];
    const [u1, y1, a1] = raw[i + 1];
    const d = Math.hypot(u1 - u0, y1 - y0);
    while (next <= acc + d) {
      const k = d > 0 ? (next - acc) / d : 0;
      PU.push(lerp(u0, u1, k));
      PY.push(lerp(y0, y1, k));
      PA.push(lerp(a0, a1, k));
      PT.push(Math.atan2(y1 - y0, u1 - u0));
      next += DS;
    }
    acc += d;
  }
  L = acc;
}
const NP = PU.length;
const idxAt = (s) => Math.floor((((s % L) + L) % L) / DS) % NP;
// path coordinate on the top run for a given u
const sOfU = (u) => {
  let lo = 0;
  let hi = Math.floor(NP * 0.45);
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (PU[m] < u) lo = m;
    else hi = m;
  }
  return lo * DS;
};
const NSTEP = Math.round(L / 0.4);
const PITCH = L / NSTEP;

// the band runs at 0.5 m/s, stands still for the "Übrigens" and runs again
const V0 = 0.5;
const phi = (t) => {
  if (t < T.fakt) return V0 * t;
  const stop = V0 * T.fakt + 0.1 * (1 - (1 - ramp(t, T.fakt, T.fakt + 0.4)) ** 2);
  return t < T.stehst ? stop : stop + V0 * (t - T.stehst);
};
// the handrail: a touch faster (shown exaggerated), then the "what if it were slower"
const drift = (t) => {
  if (t < T.rate || t >= T.jetzt) return 0;
  const fast = 0.065 * (Math.min(t, T.waere) - T.rate);
  return t < T.waere ? fast : fast - 0.3 * (t - T.waere);
};

// ---------------------------------------------------------------- escalator
const esc = new THREE.Group();
esc.rotation.y = Math.PI / 2;
esc.position.y = Y0;
scene.add(esc);
const put = (geo, mat, x = 0, y = 0, z = 0, parent = esc, shadow = true) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};
// a band between two height offsets from the nose line, extruded sideways
function band(u0, u1, top, bot, depth, step = 0.1) {
  const s = new THREE.Shape();
  const n = Math.ceil((u1 - u0) / step);
  for (let i = 0; i <= n; i++) {
    const u = lerp(u0, u1, i / n);
    if (i === 0) s.moveTo(u, ytop(u) + top);
    else s.lineTo(u, ytop(u) + top);
  }
  for (let i = n; i >= 0; i--) {
    const u = lerp(u0, u1, i / n);
    s.lineTo(u, ytop(u) + bot);
  }
  return new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
}
const canvasTex = (w, h, draw) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

const steel = real.metal(0xc6cbd1, { roughness: 0.34 });
const darkAlu = real.metal(0x4b4e54, { roughness: 0.5 });
const black = real.rubber(0x15161a);

// steps
const treadTex = (glow) =>
  canvasTex(256, 512, (g, w, h) => {
    g.fillStyle = glow ? "#8a6a1a" : "#9a9ea5";
    g.fillRect(0, 0, w, h);
    g.fillStyle = glow ? "#ffd23f" : "#3a3c42";
    for (let y = 0; y < h; y += 8) g.fillRect(0, y, w, 3);
    g.fillStyle = "#f2c21f";
    g.fillRect(0, 0, w, 16);
    g.fillRect(0, h - 16, w, 16);
    g.fillRect(w - 18, 0, 18, h);
  });
const treadMat = new THREE.MeshPhysicalMaterial({
  map: treadTex(false),
  metalness: 0.35,
  roughness: 0.5,
});
const tracerMat = new THREE.MeshPhysicalMaterial({
  map: treadTex(false),
  metalness: 0.35,
  roughness: 0.5,
  emissive: 0xffb52e,
  emissiveMap: treadTex(true),
  emissiveIntensity: 0,
});
const rollerMat = real.plastic(0xff8a2a, { emissive: 0xff6a10, emissiveIntensity: 0 });
const stepBodyMat = real.metal(0x7d8188, { roughness: 0.55, metalness: 0.5 });
const tracerBodyMat = real.metal(0x7d8188, {
  metalness: 0.5,
  roughness: 0.55,
  emissive: 0xffa22e,
  emissiveIntensity: 0,
});
const TD = PITCH - 0.004;
const treadGeo = new THREE.PlaneGeometry(TD, 1.0).rotateX(-Math.PI / 2).translate(TD / 2, 0, 0);
const slabGeo = new THREE.BoxGeometry(TD, 0.028, 0.998).translate(TD / 2, -0.0145, 0);
const riserGeo = new THREE.BoxGeometry(0.022, 0.235, 0.998).translate(0.011, -0.13, 0);
const cheekGeo = (() => {
  const s = new THREE.Shape();
  s.moveTo(0, -0.02);
  s.lineTo(TD - 0.01, -0.02);
  s.lineTo(TD - 0.05, -0.1);
  s.lineTo(0.05, -0.245);
  s.lineTo(0, -0.245);
  return new THREE.ExtrudeGeometry(s, { depth: 0.012, bevelEnabled: false });
})();
const rollerGeo = new THREE.CylinderGeometry(0.036, 0.036, 0.03, 20).rotateX(Math.PI / 2);
const gapGlow = new THREE.MeshBasicMaterial({ color: 0xff3d1f, transparent: true, opacity: 0 });
const gapGeo = new THREE.BoxGeometry(TD, 0.012, 0.014).translate(TD / 2, 0.002, 0.507);
const steps = [];
for (let i = 0; i < NSTEP; i++) {
  const g = new THREE.Group();
  const tracer = i % 8 === 0;
  const body = tracer ? tracerBodyMat : stepBodyMat;
  put(treadGeo, tracer ? tracerMat : treadMat, 0, 0, 0, g);
  put(slabGeo, body, 0, 0, 0, g);
  put(riserGeo, body, 0, 0, 0, g);
  for (const z of [-0.499, 0.487]) put(cheekGeo, body, 0, 0, z, g);
  put(gapGeo, gapGlow, 0, 0, 0, g, false).renderOrder = 2;
  for (const z of [-0.535, 0.535]) {
    put(rollerGeo, rollerMat, 0.05, -0.215, z, g, false);
    put(rollerGeo, rollerMat, TD - 0.05, -0.07, z, g, false);
  }
  esc.add(g);
  steps.push(g);
}

// skirt (the standing "Wand"), deck, glass balustrade, outer cladding
const cladMat = xrayMaterial(0xaeb4bc);
const brushGlow = new THREE.MeshStandardMaterial({
  color: 0x1c1d21,
  roughness: 0.6,
  emissive: 0xffd23f,
  emissiveIntensity: 0,
});
{
  const skirt = band(-UE, UE, 0.2, -0.05, 0.02);
  const deck = band(-UE, UE, 0.215, 0.2, 0.15);
  const glass = band(-5.0, 5.0, 0.95, 0.2, 0.016, 0.25);
  const clad = band(-UE, UE, 0.2, -1.2, 0.02);
  const holder = band(-4.5, 4.5, 0.038, 0.02, 0.012);
  const glassMat = real.glass(0xcfe6ee, { opacity: 0.2 });
  for (const sgn of [-1, 1]) {
    put(skirt, steel, 0, 0, sgn > 0 ? 0.515 : -0.535);
    put(deck, steel, 0, 0, sgn > 0 ? 0.515 : -0.665);
    put(glass, glassMat, 0, 0, sgn * 0.588 - 0.008, esc, false);
    put(clad, cladMat, 0, 0, sgn > 0 ? 0.66 : -0.68);
    const e = xrayEdges(clad);
    e.position.z = sgn > 0 ? 0.66 : -0.68;
    esc.add(e);
    put(holder, sgn > 0 ? brushGlow : black, 0, 0, sgn > 0 ? 0.503 : -0.515, esc, false);
  }
  put(band(-UE, UE, -1.2, -1.22, 1.34), cladMat, 0, 0, -0.67);
  // warning stickers on the skirt make its standing still visible
  const sticker = roundedBox(0.11, 0.07, 0.004, 0.012);
  const stickerMat = real.plastic(0xffd23f, { roughness: 0.5 });
  for (let u = -3.6; u <= 3.7; u += 0.9)
    for (const sgn of [-1, 1]) {
      const m = put(sticker, stickerMat, u, ytop(u) + 0.13, sgn * 0.513, esc, false);
      m.rotation.z = Math.atan(TAN) * S01((u + 3.35) / 0.7) * (1 - S01((u - 2.65) / 0.7));
    }
}

// landing plates + combs
{
  const plateTex = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = "#b9bec4";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#8d9299";
    for (let x = 0; x < w; x += 10) g.fillRect(x, 0, 4, h);
  });
  const plateMat = new THREE.MeshPhysicalMaterial({
    map: plateTex,
    metalness: 0.85,
    roughness: 0.4,
  });
  const yellow = real.plastic(0xffd23f, { roughness: 0.5 });
  const tooth = new THREE.BoxGeometry(0.075, 0.012, 0.009);
  const comb = new THREE.InstancedMesh(tooth, real.metal(0xd2d6db, { roughness: 0.3 }), 2 * 56);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  let n = 0;
  for (const [u, y, sgn] of [
    [3.86, H, 1],
    [-3.86, 0, -1],
  ]) {
    put(
      new THREE.BoxGeometry(UE - 3.86, 0.03, 1.03),
      plateMat,
      (sgn * (3.86 + UE)) / 2,
      y + 0.034,
      0,
    );
    put(new THREE.BoxGeometry(0.05, 0.032, 1.03), yellow, u + sgn * 0.04, y + 0.0345, 0);
    for (let i = 0; i < 56; i++) {
      e.set(0, 0, sgn * 0.26);
      q.setFromEuler(e);
      m4.compose(V(u - sgn * 0.03, y + 0.021, -0.495 + i * 0.018), q, V(1, 1, 1));
      comb.setMatrixAt(n++, m4);
    }
  }
  comb.castShadow = true;
  esc.add(comb);
}

// handrails (black rubber loops) with small white marks that show their speed
const railMat = real.rubber(0x17181c, { roughness: 0.6, emissive: 0x000000, emissiveIntensity: 1 });
const MARKS = 22;
const marks = new THREE.InstancedMesh(
  new THREE.SphereGeometry(0.02, 12, 8),
  real.plastic(0xf4f4f0),
  MARKS * 2,
);
esc.add(marks);
{
  const pts = [
    [-4.75, 0.26],
    [-5.2, 0.33],
    [-5.38, 0.63],
    [-5.2, 0.95],
    [-4.75, 1.0],
  ];
  for (let u = -4.5; u <= 4.5; u += 0.25) pts.push([u, ytop(u) + 1.0]);
  pts.push([4.75, H + 1.0], [5.2, H + 0.95], [5.38, H + 0.63], [5.2, H + 0.33], [4.75, H + 0.26]);
  const geo = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(
      pts.map(([u, y]) => V(u, y, 0)),
      false,
      "centripetal",
    ),
    320,
    0.04,
    16,
  );
  for (const z of [-0.588, 0.588]) put(geo, railMat, 0, 0, z);
  // newel bases
  for (const z of [-0.588, 0.588])
    for (const [u, y] of [
      [-5.15, 0],
      [5.15, H],
    ])
      put(roundedBox(0.75, 0.3, 0.16, 0.04), steel, u, y + 0.2, z);
}
const lamp = put(
  new THREE.SphereGeometry(0.035, 16, 12),
  new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x3dff7a, emissiveIntensity: 3 }),
  -5.15,
  0.3,
  0.5,
  esc,
  false,
);

// brushes: two rows of nylon bristles per side
const BR = [];
{
  const r = rng(72);
  for (let u = -4.45; u <= 4.45; u += 0.0085)
    for (let row = 0; row < 2; row++)
      BR.push({
        u: u + (r() - 0.5) * 0.004,
        y: 0.022 + row * 0.011,
        len: 0.044 + r() * 0.01,
        droop: 0.1 + r() * 0.25,
        yaw: (r() - 0.5) * 0.3,
      });
}
const bristleGeo = new THREE.BoxGeometry(0.0045, 0.0045, 1).translate(0, 0, -0.5);
const brushR = new THREE.InstancedMesh(bristleGeo, brushGlow, BR.length);
const brushL = new THREE.InstancedMesh(bristleGeo, black, BR.length);
esc.add(brushR, brushL);
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler(0, 0, 0, "YXZ");
const setBristle = (im, i, sgn, yaw, droop) => {
  const b = BR[i];
  _e.set(sgn * droop, sgn > 0 ? yaw : Math.PI + yaw, 0);
  _q.setFromEuler(_e);
  _m.compose(V(b.u, ytop(b.u) + b.y, sgn * 0.503), _q, V(1, 1, b.len));
  im.setMatrixAt(i, _m);
};
BR.forEach((b, i) => {
  setBristle(brushR, i, 1, b.yaw, -b.droop);
  setBristle(brushL, i, -1, b.yaw, -b.droop);
});
let bent = [];

// chain + sprockets (only seen in x-ray)
const chainMat = real.metal(0x6d7178, {
  roughness: 0.4,
  emissive: 0xff7a1a,
  emissiveIntensity: 0,
});
const sprocketMat = real.metal(0x4f535a, { roughness: 0.4 });
const NLINK = NSTEP * 4;
const chain = new THREE.InstancedMesh(
  new THREE.BoxGeometry(0.075, 0.03, 0.022),
  chainMat,
  NLINK * 2,
);
chain.frustumCulled = false;
esc.add(chain);
const sprockets = [];
for (const z of [-0.6, 0.6]) {
  const g = new THREE.Group();
  g.position.set(U1, H - R, z);
  put(
    new THREE.CylinderGeometry(R - 0.06, R - 0.06, 0.03, 36).rotateX(Math.PI / 2),
    sprocketMat,
    0,
    0,
    0,
    g,
  );
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const tooth = put(
      new THREE.BoxGeometry(0.07, 0.05, 0.03),
      sprocketMat,
      Math.cos(a) * (R - 0.04),
      Math.sin(a) * (R - 0.04),
      0,
      g,
    );
    tooth.rotation.z = a;
  }
  esc.add(g);
  sprockets.push(g);
}
put(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 20).rotateX(Math.PI / 2), darkAlu, U1, H - R, 0);

// ---------------------------------------------------------------- people
const rider = makeFigure({});
scene.add(rider.group);
const shoe = rider.legR.userData.shoe;
const extras = [
  makeFigure({
    top: 0xd8352a,
    legs: 0x23262c,
    pack: null,
    hair: 0x6a4a2a,
    shoe: { accent: 0x2f5f9a },
  }),
  makeFigure({
    top: 0xe8c86a,
    legs: 0x3a4a6a,
    hair: 0x1a1512,
    pack: 0x5a3a2a,
    shoe: { upper: 0x23262c },
  }),
  makeFigure({
    top: 0x4a4f5a,
    legs: 0x2a2c33,
    pack: null,
    hair: 0x2a2018,
    shoe: { accent: 0x12894a },
  }),
];
extras.forEach((f) => scene.add(f.group));

// step-locked rides: [from time, u of the step edge at that time, time it refers to]
const rideBase = (uDes, t0) => Math.round((sOfU(uDes) - phi(t0)) / PITCH) * PITCH;
const RIDES = [
  [-99, rideBase(-1.8, 0)],
  [T.denn, rideBase(-2.6, T.denn)],
  [T.rate, rideBase(-1.9, T.rate)],
  [T.jetzt, rideBase(-2.7, T.jetzt)],
  [T.stehst, rideBase(-1.7, T.stehst)],
];
const EXTRA_BASE = [rideBase(-0.3, T.stehst), rideBase(1.1, T.stehst)];
const edgeAt = (base, t) => {
  const i = idxAt(base + phi(t));
  return [PU[i], PY[i]];
};
const FOOT = V(0, 0, 0); // the rider's right foot (world) — riding shots hang on it
for (const s of shots) if (s.rel === "foot") s.rel = FOOT;
const applyCamera = shotCamera(shots, 1);
const LAB = Object.fromEntries(LABELS.map((l) => [l.text, l]));
const W3 = (u, y, lat) => [lat, y + Y0, -u]; // profile → world

// loose lace (rebuilt every frame while it is on screen)
const laceMat = real.fabric(0xd8352a, { emissive: 0xff3d1f, emissiveIntensity: 0 });
const lace = new THREE.Mesh(new THREE.BufferGeometry(), laceMat);
lace.castShadow = true;
lace.frustumCulled = false;
scene.add(lace);
const aglet = put(
  new THREE.CapsuleGeometry(0.004, 0.012, 4, 8),
  real.plastic(0xffd23f),
  0,
  0,
  0,
  scene,
);

// dust flying off the brush in the hook
const DUST = 26;
const dust = new THREE.InstancedMesh(
  new THREE.SphereGeometry(0.006, 8, 6),
  new THREE.MeshBasicMaterial({ color: 0xfff0d0, transparent: true, opacity: 0.85 }),
  DUST,
);
dust.frustumCulled = false;
dust.userData.noAO = true;
scene.add(dust);
const dustSeed = Array.from({ length: DUST }, (_, i) => {
  const r = rng(100 + i);
  return [r(), r(), r(), r()];
});

// arrows: the step moves …
const moveArrows = makeArrowSet(
  [1.2, 1.75, 2.3].map((u) => [
    V(0.12, ytop(u) + 0.33 + Y0, -u),
    V(0.12, ytop(u + 0.42) + 0.33 + Y0, -u - 0.42),
  ]),
  { parent: scene, mat: forceMat, amp: 0, r: 0.022 },
);
// … and the foot flinches away from the gap
const awayArrow = makeArrowSet([[V(0, 0, 0), V(-0.22, 0, 0)]], {
  parent: scene,
  mat: forceMat,
  amp: 0,
  r: 0.007,
});

// ---------------------------------------------------------------- render
function renderAt(t) {
  const ph = phi(t);
  // steps around the loop
  for (let i = 0; i < NSTEP; i++) {
    const k = idxAt(i * PITCH + ph);
    const g = steps[i];
    g.position.set(PU[k], PY[k], 0);
    g.rotation.z = -PA[k];
  }
  // chain links + sprockets
  for (let i = 0; i < NLINK; i++) {
    const k = idxAt((i * PITCH) / 4 + ph);
    const a = PA[k];
    _e.set(0, 0, PT[k]);
    _q.setFromEuler(_e);
    for (let s = 0; s < 2; s++) {
      _m.compose(
        V(PU[k] - Math.sin(a) * 0.05, PY[k] - Math.cos(a) * 0.05, s ? 0.6 : -0.6),
        _q,
        V(1, 1, 1),
      );
      chain.setMatrixAt(i * 2 + s, _m);
    }
  }
  chain.instanceMatrix.needsUpdate = true;
  sprockets.forEach((g) => (g.rotation.z = -ph / (R - 0.03)));
  // handrail marks
  const dr = drift(t);
  for (let i = 0; i < MARKS; i++) {
    const u = ((((i * 0.42 + ph + dr) % 9.24) + 9.24) % 9.24) - 4.62;
    for (let s = 0; s < 2; s++) {
      _m.makeTranslation(u, ytop(u) + 1.042, s ? 0.588 : -0.588);
      marks.setMatrixAt(i * 2 + s, _m);
    }
  }
  marks.instanceMatrix.needsUpdate = true;
  const railGreen = pop(t, T.handlauf2, T.waere, 0.25);
  const railRed = pop(t, T.waere, T.jetzt, 0.25);
  railMat.emissive.setRGB(0.9 * railRed + 0.1 * railGreen, 0.75 * railGreen, 0.15 * railGreen);
  const stopped = t >= T.fakt && t < T.stehst;
  lamp.material.emissive.set(stopped ? 0xff2a1f : 0x3dff7a);

  // x-ray: cladding to glass, the mechanism lights up
  const xr = smooth(ramp(t, T.denn - 0.05, T.denn + 0.45)) * (t < T.folge ? 1 : 0);
  setXray([cladMat], xr);
  chainMat.emissiveIntensity = 1.3 * xr;
  tracerMat.emissiveIntensity = 1.6 * xr;
  tracerBodyMat.emissiveIntensity = 0.7 * xr;
  rollerMat.emissiveIntensity = 0.8 * xr;

  // ---- the rider
  const walking = stopped;
  let ride = RIDES[0];
  for (const r of RIDES) if (t >= r[0]) ride = r;
  let ue;
  let ye;
  let bodyPitch = 0;
  let legSwing = 0; // sideways swing of the right leg (towards the brush)
  let rub = 0; // fore-aft scrub
  let lift = 0;
  let toeUp = 0;
  let walk = 0;
  if (walking) {
    const w = t - T.fakt;
    const uu =
      -5.75 +
      1.25 * Math.min(w, T.stolperst - T.fakt + 0.1) +
      0.35 * Math.max(0, t - T.stolperst - 0.1);
    ue = uu - 0.19;
    ye = ytop(uu);
    walk = Math.sin(w * 8.5) * 0.42;
    const st = t - T.stolperst;
    if (st > 0) {
      bodyPitch = -0.55 * Math.exp(-st * 2.2) * Math.sin(Math.min(st * 9, Math.PI / 2 + st * 2));
      walk *= 0.5;
    }
  } else {
    [ue, ye] = edgeAt(ride[1], t);
  }
  const hook = t < T.genau;
  if (!walking) {
    if (hook) {
      // scrubbing the sneaker on the brush (still doing it in the wide shot)
      legSwing = 0.086 + 0.008 * Math.sin(t * 7);
      rub = Math.sin(t * 12.5);
      lift = 0.03;
      toeUp = 0.3;
    } else if (t < T.denn) {
      // the lace teaser: resting at the edge, then the jerk
      const j = ramp(t, T.kosten, T.kosten + 0.12);
      legSwing = -0.04 + 0.1 * j;
    } else if (t >= T.jetzt && t < T.darum) {
      const j = ramp(t, T.zack, T.zack + 0.1);
      legSwing = t < T.weiche ? 0.07 * smooth(ramp(t, T.jetzt, T.jetzt + 1)) : -0.04 + 0.1 * j;
    } else if (t >= T.darum && t < T.fakt) {
      const touch = smooth(ramp(t, T.spuerst, T.spuerst + 0.7));
      const away = outBack(ramp(t, T.zuckt, T.zuckt + 0.3));
      legSwing = 0.03 + 0.056 * touch - 0.12 * away;
      rub = 0.25 * Math.sin(t * 9) * touch * (1 - away);
      lift = 0.02 * touch + 0.02 * Math.sin(Math.PI * ramp(t, T.zuckt, T.zuckt + 0.3));
      toeUp = 0.2 * touch * (1 - 0.5 * away);
    }
    if (t >= T.waere && t < T.jetzt)
      bodyPitch = 0.26 * smooth(ramp(t, T.waere + 0.3, T.hinten + 0.25));
  }
  const rx = 0.26;
  const uc = ue + 0.19; // where the rider stands
  rider.group.position.set(rx, ye + Y0, -uc);
  rider.group.rotation.x = bodyPitch;
  rider.legR.rotation.set(walking ? walk : 0.05 * rub, 0, legSwing);
  rider.legL.rotation.set(walking ? -walk : 0, 0, 0);
  // close-ups of the right foot: the left leg would only block the lens
  rider.legL.visible = !(t < T.du || (t >= T.genau && t < T.denn) || (t >= T.jetzt && t < T.fakt));
  shoe.position.set(0, -0.9 + lift, -0.03);
  shoe.rotation.x = -toeUp;
  FOOT.set(rx + 0.1, ye + Y0, -uc + 0.03);
  // right hand on the moving handrail (ahead of the body), left arm hangs
  if (walking || t >= T.stehst - 0.01 || t < T.rate || t >= T.jetzt) {
    const hz = walking ? 0.0 : -0.22;
    rider.reachR(
      walking ? V(0.27, 0.9, 0.05 - walk * 0.25) : V(0.588 - rx, ytop(uc - hz) + 1.062 - ye, hz),
    );
  } else {
    const hz = -0.22 - dr;
    rider.reachR(V(0.588 - rx, ytop(uc - hz) + 1.062 - ye, hz));
  }
  rider.reachL(V(-0.26, 0.86, walking ? 0.05 + walk * 0.25 : -0.02));

  // passengers of the last shot: two more standing on the right, one walking up on the left
  const crowd = t >= T.stehst;
  extras.forEach((f) => (f.group.visible = crowd));
  let walkerPos = [0, 0, 0];
  if (crowd) {
    EXTRA_BASE.forEach((b, i) => {
      const [u, y] = edgeAt(b, t);
      extras[i].group.position.set(0.27, y + Y0, -(u + 0.19));
      extras[i].reachR(V(0.588 - 0.27, ytop(u + 0.41) + 1.062 - y, -0.22));
    });
    const wk = extras[2];
    const u = -3.4 + 1.0 * (t - T.stehst);
    const sw = Math.sin((t - T.stehst) * 9) * 0.45;
    wk.group.position.set(-0.26, ytop(u) + Y0 + 0.02 * Math.abs(sw), -u);
    wk.legR.rotation.x = sw;
    wk.legL.rotation.x = -sw;
    wk.reachR(V(0.26, 0.88, -sw * 0.2));
    wk.reachL(V(-0.26, 0.88, sw * 0.2));
    walkerPos = [-0.45, ytop(u) + 1.0, -u];
  }

  // bristles bend where the shoe presses into them
  for (const i of bent) setBristle(brushR, i, 1, BR[i].yaw, -BR[i].droop);
  bent = [];
  const shoeEdge = rx + 0.1 + Math.sin(legSwing) * 0.9 + 0.05; // world x of the shoe's outer side
  const shoeU = uc + 0.05 * rub * 0.9;
  if (!walking && shoeEdge > 0.455) {
    const press = clamp01((shoeEdge - 0.455) / 0.045);
    const dir = hook ? Math.cos(t * 12.5) : 1;
    BR.forEach((b, i) => {
      const d = b.u - shoeU;
      if (d < -0.17 || d > 0.17) return;
      const edge = smooth(clamp01((0.17 - Math.abs(d)) / 0.05));
      setBristle(brushR, i, 1, b.yaw + (dir >= 0 ? 1 : -1) * 1.15 * press * edge, -b.droop);
      bent.push(i);
    });
  }
  brushR.instanceMatrix.needsUpdate = true;
  brushGlow.emissiveIntensity =
    1.6 * pop(t, T.darum, T.spuerst + 0.4, 0.3) * (0.7 + 0.3 * Math.sin(t * 14));

  // dust off the brush (hook only)
  const dustOn = hook && t < T.du;
  dust.visible = dustOn;
  if (dustOn) {
    for (let i = 0; i < DUST; i++) {
      const [a, b, c, d] = dustSeed[i];
      const life = (t * 1.9 + a) % 1;
      _m.makeTranslation(
        0.47 - life * (0.1 + 0.25 * b),
        ye + Y0 + 0.12 + 0.2 * c * life - 0.25 * life * life + 0.08 * d,
        -uc + (c - 0.5) * 0.3 + (d - 0.5) * 0.2 * life,
      );
      dust.setMatrixAt(i, _m);
    }
    dust.instanceMatrix.needsUpdate = true;
  }

  // the loose lace: hangs over the step's edge, then gets dragged into the gap
  const laceOn = (t >= T.genau && t < T.denn) || (t >= T.weiche && t < T.darum);
  lace.visible = aglet.visible = laceOn;
  let caught = 0;
  if (laceOn) {
    caught = t < T.denn ? ramp(t, T.kosten, T.kosten + 0.12) : ramp(t, T.zack, T.zack + 0.1);
    const sx = rx + 0.1 + Math.sin(legSwing) * 0.9;
    const ty = ye + Y0;
    const wig = (1 - caught) * Math.sin(t * 6) * 0.006;
    const tip = V(
      0.498 + 0.012 * caught + wig,
      ty + 0.006 - 0.11 * caught,
      -uc + 0.03 + 0.1 * caught,
    );
    const slack = (1 - caught) * 0.03;
    const pts = [
      V(sx + 0.03, ty + 0.1, -uc - 0.03),
      V(sx + 0.06, ty + 0.055, -uc - 0.01),
      V(sx + 0.072, ty + 0.012, -uc + 0.02),
      V(lerp(sx + 0.072, tip.x, 0.5), ty + 0.008, -uc + 0.03 + slack + 0.03 * caught),
      tip,
    ];
    lace.geometry.dispose();
    lace.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.005, 8);
    aglet.position.copy(tip);
    aglet.rotation.z = 0.4 + caught;
    laceMat.emissiveIntensity = 0.9 * caught;
  }
  // the gap glows while it is explained / when it bites
  gapGlow.opacity =
    0.85 * pop(t, T.spalt - 0.15, T.aber, 0.3) * (0.75 + 0.25 * Math.sin(t * 10)) +
    0.9 * caught * (laceOn ? 1 : 0);

  // arrows
  animateArrows(moveArrows, t, pop(t, T.aber + 0.2, T.weiche));
  awayArrow[0].position.set(FOOT.x + 0.02, FOOT.y + 0.03, FOOT.z - 0.24);
  animateArrows(awayArrow, t, pop(t, T.zuckt, T.fakt));

  // ✕ on the "shoe cleaner" idea and on the slower handrail
  if (t < T.du) showNope(pop(t, T.keine, T.du), 0.47, ye + Y0 + 0.2, -uc - 0.16, 0.075);
  else if (t >= T.waere && t < T.jetzt)
    showNope(pop(t, T.hinten, T.jetzt), 0.6, ye + Y0 + 1.2, -uc + 0.25, 0.28);
  else showNope(0, 0, 0, 0);

  // LED facts
  if (t >= T.handlauf2 && t < T.waere)
    showPanel(pop(t, T.handlauf2, T.waere), "HANDLAUF", "BIS +2 %", LED.green);
  else if (t >= T.vier && t < T.aber)
    showPanel(pop(t, T.vier, T.aber), "SPALT", "MAX. 4 mm", LED.yellow);
  else if (t >= T.gehirn && t < T.stehst)
    showPanel(pop(t, T.gehirn, T.stehst), "DEIN GEHIRN", "FÄHRT SCHON", LED.yellow);
  else showPanel(0);

  // name tags (most ride along)
  LAB.Kammplatte.pos = [0.05, H + 0.07, -3.84];
  LAB.Kette.pos = [-0.62, ytop(-0.6) - 0.05, 0.6];
  LAB.Stufe.pos = [FOOT.x - 0.3, FOOT.y + 0.01, FOOT.z + 0.1];
  LAB.Handlauf.pos = [0.588, FOOT.y + 1.1, FOOT.z - 0.1];
  LAB.Spalt.pos = [0.508, FOOT.y + 0.03, FOOT.z - 0.12];
  LAB.Wand.pos = W3(2.05, ytop(2.05) + 0.1, 0.515);
  LAB.Bürste.pos = [0.49, ytop(uc + 0.22) + Y0 + 0.03, -uc - 0.22];
  LAB.stehen.pos = [0.45, FOOT.y + 1.0, FOOT.z];
  LAB.gehen.pos = walkerPos;
  labels(t, LABELS);

  applyCamera(t);
  renderFrame();
}

start(renderAt);
