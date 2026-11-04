// #60 Bluetooth-Kopfhörer — the athlete on the bench in the basement gym
// (set.js) with white earbuds, his phone on the bench. The picture: radio
// rings from every ear in the gym, his song as yellow notes, the note
// chopped into packets, the 79-channel fan between phone and ear, packets
// hopping lanes, router + microwave flooding lanes with red noise, the
// secret hop path, a stranger's pink packets, a busy band crossed out, the
// whole gym hopping in its own rhythm, the viking runestone whose runes
// melt into the Bluetooth logo, and finally his earbud rolling away.
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
  camera,
  flat,
  facet,
  facetMat,
  jitter,
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
  outBack,
} from "./world.js";
import { CROWD, setMicrowave } from "./set.js";
import { person } from "./people.js";
import { createHand } from "./hand.js";
import { counter } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS, PHONE, VIK, ROUTER, MICRO } from "./beats.js";

highlights(HIGHLIGHTS);
const R = rng(600);
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

// ================================================================ the athlete + bench
const bench = new THREE.Group();
{
  const pad = new THREE.Mesh(
    facet(new THREE.BoxGeometry(7.2, 0.42, 1.7, 6, 1, 2), 0.04, 3),
    facetMat(flat(0xc8323c, { roughness: 0.45 })),
  );
  pad.position.y = 1.62;
  pad.castShadow = pad.receiveShadow = true;
  bench.add(pad);
  const frame = flat(0x1d2027, { roughness: 0.5, metalness: 0.4 });
  for (const x of [-2.8, 2.8]) {
    mesh(new THREE.BoxGeometry(0.3, 1.4, 0.3), frame, bench, x, 0.7, 0);
    mesh(new THREE.BoxGeometry(0.3, 0.2, 2.2), frame, bench, x, 0.1, 0);
  }
  mesh(new THREE.BoxGeometry(5.6, 0.2, 0.3), frame, bench, 0, 1.3, 0);
  bench.position.set(0.6, 0, -0.1);
  scene.add(bench);
  // towel draped on the bench + a water bottle on the floor
  mesh(
    new THREE.BoxGeometry(1.4, 0.12, 1.8),
    flat(0xf4f1ea, { roughness: 0.9 }),
    scene,
    -2.1,
    1.9,
    -0.05,
  );
  const bottle = mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 1.2, 10),
    flat(0x3fbfff, { roughness: 0.25 }),
    scene,
    -2.6,
    0.6,
    1.4,
  );
  mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.25, 8), flat(0x1d2027), scene, -2.6, 1.32, 1.4);
  bottle.rotation.z = 0;
}
const ath = person({ top: 0x2f6fd6, legs: 0x1d2027, hair: 0x3a2a20, seed: 1 });
ath.g.position.set(0, 1.83, 0);

// earbuds (white, glossy) in both ears — local to the head group
const budMat = flat(0xffffff, { roughness: 0.18 });
const budLedMat = glow(0x3dff7a);
function earbud(parent, sx, mat = budMat) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 9), mat);
  b.scale.set(0.9, 1, 1);
  b.castShadow = true;
  g.add(b);
  const stem = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.3, 3, 8), mat);
  stem.position.set(0, -0.2, 0.05);
  stem.rotation.x = 0.3;
  stem.castShadow = true;
  g.add(stem);
  g.position.set(sx * 0.47, -0.04, 0.06);
  parent.add(g);
  return g;
}
const budL = earbud(ath.head, 1);
earbud(ath.head, -1);
const budLed = mesh(new THREE.SphereGeometry(0.03, 6, 5), budLedMat, budL, 0.04, -0.12, 0.1, false);
// a loose copy that falls at the end
const dropBud = new THREE.Group();
{
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 9), budMat);
  b.castShadow = true;
  dropBud.add(b);
  const stem = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.36, 3, 8), budMat);
  stem.position.set(0, -0.25, 0.06);
  stem.rotation.x = 0.3;
  stem.castShadow = true;
  dropBud.add(stem);
  scene.add(dropBud);
}

// the phone on the bench (screen up: album art + play bar)
const phone = new THREE.Group();
const phoneScreen = new THREE.MeshBasicMaterial({ color: 0xffffff });
{
  mesh(new THREE.BoxGeometry(0.8, 0.1, 1.55), flat(0x15171d, { roughness: 0.25 }), phone, 0, 0, 0);
  const cv = document.createElement("canvas");
  cv.width = 128;
  cv.height = 256;
  const g = cv.getContext("2d");
  g.fillStyle = "#101218";
  g.fillRect(0, 0, 128, 256);
  const gr = g.createLinearGradient(14, 30, 114, 130);
  gr.addColorStop(0, "#ff4fa8");
  gr.addColorStop(1, "#ffd23f");
  g.fillStyle = gr;
  g.fillRect(14, 30, 100, 100);
  g.fillStyle = "#fff";
  g.fillRect(14, 150, 70, 10);
  g.fillStyle = "#8a90a0";
  g.fillRect(14, 168, 50, 8);
  g.fillStyle = "#3a3f4c";
  g.fillRect(14, 196, 100, 5);
  g.fillStyle = "#ffd23f";
  g.fillRect(14, 196, 46, 5);
  g.fillStyle = "#fff";
  g.beginPath();
  g.moveTo(56, 214);
  g.lineTo(76, 226);
  g.lineTo(56, 238);
  g.fill();
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  phoneScreen.map = tex;
  const s = mesh(new THREE.PlaneGeometry(0.7, 1.42), phoneScreen, phone, 0, 0.056, 0, false);
  s.rotation.x = -Math.PI / 2;
  s.userData.noAO = true;
  phone.position.set(...PHONE);
  phone.rotation.y = -0.35;
  scene.add(phone);
}

scene.updateMatrixWorld(true);
const E = budL.getWorldPosition(V(0, 0, 0)); // the ear end of the fan
const P = V(PHONE[0], PHONE[1] + 0.12, PHONE[2]); // the phone end

// ================================================================ the channel fan (79 lanes)
const NL = 79;
const d = E.clone().sub(P).normalize();
const N = V(1, 0, 0).sub(d.clone().multiplyScalar(d.x)).normalize(); // bulge to +x
const MID = P.clone().add(E).multiplyScalar(0.5);
const CTRL = [];
for (let i = 0; i < NL; i++)
  CTRL.push(MID.clone().add(N.clone().multiplyScalar(0.25 + (3.2 * i) / (NL - 1))));
const _b = V(0, 0, 0);
function bez(i, u, out = _b) {
  const c = CTRL[i];
  const a = (1 - u) * (1 - u);
  const b = 2 * u * (1 - u);
  const e = u * u;
  return out.set(
    a * P.x + b * c.x + e * E.x,
    a * P.y + b * c.y + e * E.y,
    a * P.z + b * c.z + e * E.z,
  );
}
const BAND = [26, 46]; // the lanes the WLAN sits on (~20 channels)
const MBAND = [50, 72]; // the microwave's band
const LSEG = 48;
const lanes = [];
const laneCol = (i) => new THREE.Color().setHSL(0.52 + (0.2 * i) / NL, 0.85, 0.62);
for (let i = 0; i < NL; i++) {
  const pts = [];
  for (let k = 0; k <= LSEG; k++) pts.push(bez(i, k / LSEG, V(0, 0, 0)));
  const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), LSEG, 0.0075, 3, false);
  const m = new THREE.Mesh(geo, glow(laneCol(i), 0.7));
  m.userData.noAO = true;
  m.userData.base = laneCol(i);
  m.renderOrder = 2;
  scene.add(m);
  lanes.push(m);
}
const laneIdx = (geo) => geo.index.count;

// hop sequences (seeded)
const seqA = Array.from({ length: 600 }, () => Math.floor(R() * NL));
const seqB = Array.from({ length: 600 }, () => Math.floor(R() * NL));
const allowedAll = Array.from({ length: NL }, (_, i) => i);
const allowedFree = allowedAll.filter((i) => i < BAND[0] || i > BAND[1]);
// position of a packet on its hop route: segs hops along the flight
const _p1 = V(0, 0, 0);
const _p2 = V(0, 0, 0);
function hopPos(seq, base, u, segs, allowed, out) {
  const s = Math.min(segs - 1, Math.floor(u * segs));
  const f = u * segs - s;
  const la = allowed[seq[(base + s) % seq.length] % allowed.length];
  const lb = s > 0 ? allowed[seq[(base + s - 1) % seq.length] % allowed.length] : la;
  bez(la, u, _p1);
  bez(lb, u, _p2);
  return out.copy(_p2).lerp(_p1, smooth(clamp01(f / 0.22)));
}

// packets (yellow = his song, pink = a stranger's) + red noise
function cubes(n, color, size) {
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(size, size, size), glow(color), n);
  im.userData.noAO = true;
  im.frustumCulled = false;
  im.renderOrder = 3;
  scene.add(im);
  return im;
}
const NA = 34;
const packA = cubes(NA, 0xffd23f, 0.075);
const NB = 22;
const packB = cubes(NB, 0xff4fc3, 0.07);
const NN = 90;
const noise = cubes(NN, 0xff3b2b, 0.05);
const m4 = new THREE.Matrix4();
const q0 = new THREE.Quaternion();
const eul = new THREE.Euler();

// the secret hop paths as glowing tubes (before / after the busy band is struck)
function pathTube(seq, allowed, color, r = 0.02) {
  const pts = [];
  for (let k = 0; k <= 300; k++) pts.push(hopPos(seq, 0, k / 300, 7, allowed, V(0, 0, 0)).clone());
  const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 600, r, 5, false);
  const m = new THREE.Mesh(geo, glow(color, 0.95));
  m.userData.noAO = true;
  m.renderOrder = 4;
  scene.add(m);
  return m;
}
const pathA = pathTube(seqA, allowedAll, 0xffd23f);
const pathA2 = pathTube(
  seqA.map((x) => x + 3),
  allowedFree,
  0xffe680,
);
const pathB = pathTube(seqB, allowedAll, 0xff4fc3, 0.016);
const reveal = (m, k) => {
  m.visible = k > 0.001;
  m.geometry.setDrawRange(0, Math.floor((clamp01(k) * laneIdx(m.geometry)) / 3) * 3);
};

// ================================================================ notes
function noteMesh(color, s = 1) {
  const g = new THREE.Group();
  const mat = flat(color, { emissive: color, emissiveIntensity: 0.9, roughness: 0.4 });
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 9), mat);
  head.scale.set(1.25, 0.9, 0.7);
  head.rotation.z = 0.4;
  g.add(head);
  const stem = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.8, 0.06), mat);
  stem.position.set(0.24, 0.4, 0);
  g.add(stem);
  const flag = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.4, 0.06), mat);
  flag.position.set(0.37, 0.66, 0);
  flag.rotation.z = 0.9;
  g.add(flag);
  g.scale.setScalar(s);
  g.traverse((o) => (o.userData.noAO = true));
  scene.add(g);
  return g;
}
const smallNotes = Array.from({ length: 4 }, () => noteMesh(0xffd23f, 0.45));
const bigNote = noteMesh(0xffd23f, 1.4);
const pinkNote = noteMesh(0xff4fc3, 0.8);
const shards = cubes(44, 0xffd23f, 0.11);
const shardDir = Array.from({ length: 44 }, () => V(R() - 0.5, R() - 0.4, R() - 0.5).normalize());

// ================================================================ radio rings
const ringGeo = new THREE.RingGeometry(0.8, 1, 36);
const rings = [];
function emitter(color, n = 3) {
  const list = [];
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(ringGeo, glow(color, 0.8));
    m.material.side = THREE.DoubleSide;
    m.userData.noAO = true;
    m.renderOrder = 5;
    scene.add(m);
    list.push(m);
  }
  const e = { list, pos: V(0, 0, 0), size: 1.6, speed: 0.9, k: 0 };
  rings.push(e);
  return e;
}
const ringMe = emitter(0xffd23f, 4);
const ringCrowd = CROWD.map((c) => {
  const e = emitter(c.color, 3);
  e.src = c;
  return e;
});
const ringRouter = emitter(0xff3b2b, 4);
const ringMicro = emitter(0xff8a2a, 4);
ringRouter.pos.set(...ROUTER).add(V(0, 0.6, 0));
ringMicro.pos.set(...MICRO).add(V(0, 0.9, 0.3));
ringRouter.size = ringMicro.size = 3.4;
const earOf = (p, out) => p.head.localToWorld(out.set(0.47, -0.04, 0.06));

// crowd: earbuds in their colour + a short hop stream from their phone to the ear
const crowdStreams = CROWD.map((c, ci) => {
  earbud(c.p.head, 1, flat(ci === 2 ? 0x1d2027 : 0xffffff, { roughness: 0.2 }));
  earbud(c.p.head, -1, flat(ci === 2 ? 0x1d2027 : 0xffffff, { roughness: 0.2 }));
  return cubes(10, c.color, 0.09);
});

// ================================================================ viking runestone
const vik = new THREE.Group();
vik.position.set(...VIK);
vik.rotation.y = 0.32;
scene.add(vik);
const stoneMat = flat(0x8d929c, { roughness: 0.85 });
const stone = new THREE.Mesh(
  facet(jitter(new THREE.BoxGeometry(3.0, 5.4, 0.9, 3, 5, 1), 0.12, 7), 0.07, 8),
  facetMat(stoneMat),
);
stone.position.y = 2.7;
stone.castShadow = stone.receiveShadow = true;
vik.add(stone);
const moss = mesh(new THREE.IcosahedronGeometry(0.5, 0), flat(0x4f7a3a), vik, -1.2, 0.3, 0.3);
moss.scale.set(1.4, 0.5, 1);
const runeMat = glow(0x7fd8ff);
const strokes = [];
for (let i = 0; i < 8; i++) {
  const s = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 1, 6), runeMat);
  s.userData.noAO = true;
  vik.add(s);
  strokes.push(s);
}
// rune strokes (Hagall ᚼ left, Bjarkan ᛒ right) → Bluetooth logo strokes
const RS = 0.85;
const HX = -0.62;
const BX = 0.5;
const RUNE = [
  [
    [HX, -1],
    [HX, 1],
  ],
  [
    [HX - 0.45, 0.45],
    [HX + 0.45, -0.45],
  ],
  [
    [HX - 0.45, -0.45],
    [HX + 0.45, 0.45],
  ],
  [
    [BX, -1],
    [BX, 1],
  ],
  [
    [BX, 1],
    [BX + 0.5, 0.5],
  ],
  [
    [BX + 0.5, 0.5],
    [BX, 0],
  ],
  [
    [BX, 0],
    [BX + 0.5, -0.5],
  ],
  [
    [BX + 0.5, -0.5],
    [BX, -1],
  ],
];
const LOGO = [
  [
    [0, -1],
    [0, 1],
  ],
  [
    [-0.5, 0.5],
    [0.5, -0.5],
  ],
  [
    [-0.5, -0.5],
    [0.5, 0.5],
  ],
  [
    [0, -1],
    [0, 1],
  ],
  [
    [0, 1],
    [0.5, 0.5],
  ],
  [
    [0.5, 0.5],
    [0, 0],
  ],
  [
    [0, 0],
    [0.5, -0.5],
  ],
  [
    [0.5, -0.5],
    [0, -1],
  ],
];
const RY = 3.25;
function setStroke(s, a, b, z) {
  const dx = (b[0] - a[0]) * RS;
  const dy = (b[1] - a[1]) * RS;
  s.position.set(((a[0] + b[0]) / 2) * RS, RY + ((a[1] + b[1]) / 2) * RS, z);
  s.scale.set(1, Math.hypot(dx, dy) + 0.075, 1);
  s.rotation.set(0, 0, Math.atan2(-dx, dy));
}
const badge = (() => {
  const sh = new THREE.Shape();
  sh.absellipse(0, 0, 0.95, 1.35, 0, Math.PI * 2);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.08, bevelEnabled: false });
  const m = new THREE.Mesh(
    geo,
    flat(0x1462ff, { emissive: 0x0a3cff, emissiveIntensity: 0.6, roughness: 0.3 }),
  );
  m.position.set(0.1, RY, 0.45);
  vik.add(m);
  return m;
})();
// the king: helmet with a gold crown band, red beard — and one blue tooth
const king = person({
  top: 0x6b4a33,
  legs: 0x4a3a2a,
  hair: 0xc8642a,
  style: "long",
  stand: true,
  seed: 11,
});
scene.remove(king.g);
king.g.scale.setScalar(0.78);
king.g.position.set(-2.7, 0, 0.2);
king.g.rotation.y = 0.15;
vik.add(king.g);
{
  const helm = new THREE.Mesh(
    new THREE.SphereGeometry(0.58, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5),
    flat(0x9aa2ae, { metalness: 0.7, roughness: 0.35 }),
  );
  helm.position.y = 0.22;
  helm.castShadow = true;
  king.head.add(helm);
  const nose = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.36, 0.06),
    flat(0x9aa2ae, { metalness: 0.7, roughness: 0.35 }),
  );
  nose.position.set(0, 0.16, 0.56);
  king.head.add(nose);
  const gold = flat(0xffc83a, { metalness: 0.8, roughness: 0.3 });
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.14, 14, 1, true), gold);
  band.material.side = THREE.DoubleSide;
  band.position.y = 0.28;
  king.head.add(band);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 4), gold);
    c.position.set(Math.sin(a) * 0.6, 0.45, Math.cos(a) * 0.6);
    king.head.add(c);
  }
  const beard = new THREE.Mesh(
    facet(jitter(new THREE.BoxGeometry(0.72, 0.62, 0.34, 2, 2, 1), 0.04, 3), 0.08, 4),
    facetMat(flat(0xc8642a)),
  );
  beard.position.set(0, -0.58, 0.28);
  king.head.add(beard);
  // cape
  const cape = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.6, 0.12), flat(0x8c1f2a));
  cape.position.set(0, 1.2, -0.5);
  king.torso.add(cape);
  king.armR.sh.rotation.set(-0.3, 0, -0.5);
  king.armR.el.rotation.set(-1.4, 0, 0);
}
const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.06), glow(0x2f8bff));
tooth.position.set(0.05, -0.19, 0.48);
king.head.add(tooth);

// ================================================================ the viewer's hand (hook tap)
const hand = createHand({ scale: 1.1, sleeve: 0xe2453c });
const HY = -Math.PI / 2 - 0.15; // yaw: fingers pointing at the earbud

const applyCamera = shotCamera(shots);
const _e = V(0, 0, 0);
const _q = V(0, 0, 0);

// ================================================================ render
function renderAt(t) {
  scene.updateMatrixWorld(true);

  // ---------------- hand taps the earbud on frame 0
  hand.track(t, [
    { t: -0.7, pos: [2.3, 4.2, 0.5], rot: [0.1, HY, 0], pose: "point" },
    { t: 0.0, pos: [1.75, 4.4, 0.3], rot: [0.08, HY, 0], pose: "point" },
    { t: 0.3, pos: [1.38, 4.5, 0.18], rot: [0.05, HY, 0], pose: "press" },
    { t: 0.75, pos: [1.55, 4.45, 0.25], rot: [0.08, HY, 0], pose: "point" },
    { t: 1.35, pos: [2.5, 4.1, 0.6], rot: [0.1, HY, 0], pose: "open", out: true },
  ]);
  budL.position.x = 0.47 - 0.02 * pop(t, 0.3, 0.55, 0.08);

  // ---------------- radio rings
  const meK = Math.max(
    pop(t, -1, T.stell + 0.2) * (0.55 + 0.45 * ramp(t, 0.3, 0.45)),
    pop(t, T.alle1, T.trotzdem) * 0.9,
    pop(t, T.folge, T.rate) * 0.6,
    pop(t, T.darum, T.fakt) * 0.8,
  );
  earOf(ath, ringMe.pos);
  ringMe.k = meK;
  ringMe.size = t < T.nie ? 1.3 : 2.4;
  const crowdK = Math.max(
    pop(t, 0, T.trotzdem + 0.6) * (t < T.alle1 ? 0.75 : 1),
    pop(t, T.folge, T.rate) * 0.6,
    pop(t, T.darum, T.fakt),
  );
  ringCrowd.forEach((e) => {
    earOf(e.src.p, e.pos);
    e.k = crowdK * (1 + 0.6 * pop(t, T.funken1, T.funken1 + 0.8));
    e.size = 2.6;
  });
  ringRouter.k = Math.max(pop(t, T.wlan, T.wie1 + 0.2), pop(t, T.belegt, T.streichen + 0.5) * 0.5);
  setMicrowave((t >= T.mikro1 && t < T.folge) || (t >= T.nur && t < T.darum), t);
  ringMicro.k = Math.max(pop(t, T.mikro1, T.folge), pop(t, T.nur, T.darum));
  const camQ = camera.quaternion;
  for (const e of rings) {
    e.list.forEach((m, i) => {
      const f = (t * e.speed + i / e.list.length) % 1;
      m.visible = e.k > 0.01;
      if (!m.visible) return;
      m.position.copy(e.pos);
      m.quaternion.copy(camQ);
      m.scale.setScalar(0.15 + f * e.size);
      m.material.opacity = Math.min(1, e.k) * 0.95 * (1 - f) * Math.min(1, f * 6);
    });
  }

  // ---------------- the stranger's pink note bounces off his ear (hook)
  {
    const k = ramp(t, T.nie - 0.1, T.musik1);
    const back = ramp(t, T.musik1, T.musik1 + 0.6);
    pinkNote.visible = t >= T.nie - 0.1 && t < T.stell;
    const src = CROWD[3].phone.getWorldPosition(_q);
    const hit = V(E.x + 0.4, E.y + 0.25, E.z + 0.5);
    pinkNote.position.copy(src).lerp(hit, smooth(k));
    pinkNote.position.y += Math.sin(k * Math.PI) * 1.2;
    if (back > 0) pinkNote.position.add(V(1.5 * back, -2.2 * back * back, 1.0 * back));
    pinkNote.rotation.z = Math.sin(t * 8) * 0.3 + back * 4;
    showNope(pop(t, T.musik1, T.stell, 0.15), hit.x, hit.y + 0.2, hit.z, 0.55);
  }
  if (!(t >= T.musik1 && t < T.stell)) {
    // other ✕ moments
    const st = pop(t, T.streichen, T.nur, 0.15);
    const mid = bez(36, 0.5, V(0, 0, 0));
    showNope(st, mid.x, mid.y, mid.z + 0.1, 0.5);
  }

  // ---------------- his song: small notes from the phone to the ear
  smallNotes.forEach((n, i) => {
    const vis = pop(t, T.trotzdem, T.handy1);
    n.visible = vis > 0.01;
    if (!n.visible) return;
    const f = (t * 0.55 + i / 4) % 1;
    bez(20, f, n.position);
    n.scale.setScalar(0.45 * vis * Math.min(1, f * 5) * Math.min(1, (1 - f) * 5));
    n.rotation.z = Math.sin(t * 5 + i) * 0.3;
  });
  // the big note rises out of the phone, hovers … zerhackt
  {
    const up = smooth(ramp(t, T.handy1 + 0.1, T.handy1 + 1.1));
    bigNote.visible = t >= T.handy1 + 0.1 && t < T.zerhackt;
    const pos = V(...PHONE).lerp(V(MID.x + 0.5, MID.y + 0.1, MID.z + 0.2), up);
    bigNote.position.copy(pos);
    bigNote.scale.setScalar(1.4 * Math.max(0.05, up) * (1 + 0.06 * Math.sin(t * 12)));
    bigNote.rotation.set(0, Math.sin(t * 2) * 0.4, Math.sin(t * 3) * 0.15);
    // shards: explode, then pull into a stream
    const k = ramp(t, T.zerhackt, T.in);
    const gather = smooth(ramp(t, T.in, T.pakete1 + 0.3));
    shards.visible = t >= T.zerhackt && t < T.pakete1 + 0.3;
    if (shards.visible) {
      const c = V(MID.x + 0.5, MID.y + 0.3, MID.z + 0.2);
      for (let i = 0; i < 44; i++) {
        const out = c.clone().addScaledVector(shardDir[i], 1.8 * Math.pow(k, 0.5));
        out.y -= 0.6 * k * k;
        const tgt = bez(39, i / 44, V(0, 0, 0));
        out.lerp(tgt, gather);
        eul.set(t * 4 + i, t * 3 + i * 2, 0);
        q0.setFromEuler(eul);
        m4.compose(out, q0, V(1, 1, 1));
        shards.setMatrixAt(i, m4);
      }
      shards.instanceMatrix.needsUpdate = true;
    }
  }

  // ---------------- the 79-lane fan
  const fanOn =
    t >= T.jedes1 && t < T.darum && !(t >= T.genau && t < T.wie1) && !(t >= T.nur && t < T.wirds);
  const grow = smooth(ramp(t, T.jedes1, T.n79 + 0.2));
  const struck = smooth(ramp(t, T.streichen, T.streichen + 0.4));
  const jam = t >= T.wie1 && t < T.folge ? 1 : t >= T.belegt && t < T.nur ? 1 : 0;
  const microJam = t >= T.wirds && t < T.darum ? 1 : 0;
  const flick = 0.5 + 0.5 * Math.sin(t * 40);
  lanes.forEach((m, i) => {
    m.visible = fanOn || (t >= T.folge && t < T.rate);
    if (!m.visible) return;
    const g = clamp01(grow * 1.6 - (i / NL) * 0.6);
    m.geometry.setDrawRange(0, Math.floor(g * LSEG) * 3 * 6);
    const inBand = i >= BAND[0] && i <= BAND[1];
    const inM = i >= MBAND[0] && i <= MBAND[1];
    const c = m.material.color.copy(m.userData.base);
    let o = 0.7;
    if (inBand && jam) {
      c.set(0xff3b2b);
      o = 0.6 + 0.4 * flick;
    }
    if (inBand && struck > 0) {
      c.lerp(new THREE.Color(0x3a3f4c), struck);
      o = lerp(o, 0.25, struck);
    }
    if (inM && microJam) {
      c.set(0xff8a2a);
      o = 0.55 + 0.45 * flick;
    }
    if (t >= T.folge && t < T.rate) o *= 0.5;
    m.material.opacity = o;
  });

  // ---------------- packets: his song (yellow)
  {
    const stream = t >= T.in && t < T.jedes1; // one lane, no hopping yet
    const hopping = fanOn && t >= T.jedes1;
    packA.visible = (stream && t >= T.pakete1 + 0.2) || hopping;
    if (packA.visible) {
      const fast = t >= T.mal1600 && t < T.beide;
      const rate = t >= T.rate && t < T.mal1600 ? 0.9 : fast ? 1.2 : 0.55;
      const segs = fast ? 26 : 7;
      const onPath = t >= T.beide; // everybody follows the secret route
      const allowed = t >= T.streichen ? allowedFree : allowedAll;
      for (let i = 0; i < NA; i++) {
        const ph = t * rate + i / NA;
        const u = ph % 1;
        const cyc = Math.floor(ph);
        let p;
        if (stream) p = bez(39, u, _e);
        else if (onPath) p = hopPos(t >= T.streichen ? seqA3 : seqA, 0, u, 7, allowed, _e);
        else p = hopPos(seqA, (i * 7 + cyc * 131) % 600, u, segs, allowed, _e);
        let s = Math.min(1, u * 8) * Math.min(1, (1 - u) * 8);
        if (microJam && Math.sin(t * 23 + i * 3.1) > 0.4) {
          p.x += Math.sin(t * 60 + i) * 0.08;
          s *= 1.6;
        }
        if (jam && !onPath && Math.sin(t * 17 + i * 2.3) > 0.6) s *= 0.3;
        eul.set(t * 3 + i, t * 2, 0);
        q0.setFromEuler(eul);
        m4.compose(p, q0, V(s, s, s));
        packA.setMatrixAt(i, m4);
      }
      packA.instanceMatrix.needsUpdate = true;
    }
  }
  // the stranger's packets (pink) — they never reach his ear
  packB.visible = fanOn && t >= T.fremde2 && t < T.ist + 0.6;
  if (packB.visible) {
    for (let i = 0; i < NB; i++) {
      const u = (t * 0.5 + i / NB) % 1;
      const p = hopPos(seqB, 0, u, 7, allowedAll, _e);
      const s = Math.min(1, u * 8) * clamp01((0.8 - u) * 6);
      m4.compose(p, q0.identity(), V(s, s, s));
      packB.setMatrixAt(i, m4);
    }
    packB.instanceMatrix.needsUpdate = true;
  }
  // red noise on the WLAN band (and orange on the microwave band)
  noise.visible = fanOn && (jam > 0 || microJam > 0 || (t >= T.streichen && t < T.nur));
  if (noise.visible) {
    const band = microJam ? MBAND : BAND;
    noise.material.color.set(microJam ? 0xff8a2a : 0xff3b2b);
    for (let i = 0; i < NN; i++) {
      const lane = band[0] + ((i * 7) % (band[1] - band[0] + 1));
      const u = (i * 0.618 + t * (0.3 + (i % 5) * 0.1)) % 1;
      const p = bez(lane, u, _e);
      const s =
        (0.6 + 0.6 * Math.abs(Math.sin(t * 30 + i))) * (t >= T.streichen && !microJam ? 0.6 : 1);
      m4.compose(p, q0.identity(), V(s, s, s));
      noise.setMatrixAt(i, m4);
    }
    noise.instanceMatrix.needsUpdate = true;
  }

  // ---------------- the secret paths
  reveal(pathA, fanOn && t < T.streichen ? smooth(ramp(t, T.beide, T.reihenfolge + 0.4)) : 0);
  pathA.material.opacity = t >= T.belegt ? 0.95 - 0.5 * ramp(t, T.belegt, T.streichen) : 0.95;
  reveal(pathA2, fanOn ? smooth(ramp(t, T.streichen + 0.1, T.streichen + 0.7)) : 0);
  reveal(pathB, fanOn && t < T.ist + 0.6 ? smooth(ramp(t, T.fremde2, T.springen2 + 0.5)) : 0);

  // ---------------- rate mal: phone + earbud blink in sync, counter
  const sync = t >= T.rate && t < T.beide;
  const beat = sync ? (Math.sin(t * (t >= T.mal1600 ? 40 : 14)) > 0 ? 1 : 0) : 0;
  budLedMat.color.set(beat ? 0x3dff7a : 0x0f3a20);
  budLed.scale.setScalar(beat ? 1.6 : 1);
  phoneScreen.color.setScalar(1 + beat * 0.0);
  phone.children[0].material.emissive?.set(beat ? 0x2a6a40 : 0x000000);
  const ck = pop(t, T.rate + 0.15, T.beide);
  const cnt =
    t < T.mal1600 ? Math.floor(1600 * Math.pow(ramp(t, T.rate + 0.2, T.rate + 0.79), 1.6)) : 1600;
  counter("hops", ck, {
    label: "SPRÜNGE PRO SEKUNDE",
    value: cnt,
    x: 60,
    y: 560,
    color: "#ffd23f",
  });
  if (t >= T.n79 && t < T.genau) showPanel(pop(t, T.n79, T.genau), "FUNKKANÄLE", "79", LED.blue);
  else showPanel(0);

  // ---------------- payoff: the whole gym hops in its own rhythm
  crowdStreams.forEach((im, ci) => {
    const c = CROWD[ci];
    const k = pop(t, T.darum, T.fakt);
    im.visible = k > 0.01;
    if (!im.visible) return;
    const a = c.phone.getWorldPosition(V(0, 0, 0));
    const b = earOf(c.p, V(0, 0, 0));
    const side = V(0, 0, 1).cross(b.clone().sub(a)).normalize();
    for (let i = 0; i < 10; i++) {
      const u = (t * (0.5 + ci * 0.13) + i / 10) % 1;
      const hop = Math.floor(u * 6 + ci * 3 + Math.floor(t * (2 + ci))) % 5;
      const p = a
        .clone()
        .lerp(b, u)
        .addScaledVector(side, (hop - 2) * 0.25 * Math.sin(u * Math.PI));
      p.y += Math.sin(u * Math.PI) * 0.8;
      const s = k * Math.min(1, u * 6) * Math.min(1, (1 - u) * 6);
      m4.compose(p, q0.identity(), V(s, s, s));
      im.setMatrixAt(i, m4);
    }
    im.instanceMatrix.needsUpdate = true;
  });
  // in the payoff his own yellow stream runs too (on the fan path, fan hidden)
  if (t >= T.darum && t < T.fakt) {
    packA.visible = true;
    for (let i = 0; i < NA; i++) {
      const u = (t * 0.55 + i / NA) % 1;
      const p = hopPos(seqA3, 0, u, 7, allowedFree, _e);
      const s = 1.3 * Math.min(1, u * 8) * Math.min(1, (1 - u) * 8);
      m4.compose(p, q0.identity(), V(s, s, s));
      packA.setMatrixAt(i, m4);
    }
    packA.instanceMatrix.needsUpdate = true;
  }
  // heads nod to their own beat
  const nod = (t >= T.darum && t < T.fakt) || (t >= T.trotzdem && t < T.handy1);
  ath.head.rotation.x = nod ? Math.max(0, Math.sin(t * 7.5)) * 0.1 : 0;
  CROWD.forEach((c, i) => {
    if (c.run < 0)
      c.p.head.rotation.x =
        (i === 3 ? 0.25 : 0) + (nod ? Math.max(0, Math.sin(t * (5 + i * 1.7))) * 0.12 : 0);
  });

  // ---------------- viking runestone
  {
    const on = t >= T.fakt + 0.05;
    vik.visible = on;
    stone.scale.copy(squash(t, T.fakt + 0.05));
    puff("stone", t, T.fakt + 0.2, VIK[0], 0.1, VIK[2], 1.6);
    king.g.visible = t >= T.wikinger;
    king.g.scale.copy(squash(t, T.wikinger)).multiplyScalar(0.78);
    puff("king", t, T.wikinger + 0.15, VIK[0] - 2.6, 0.1, VIK[2] + 0.9, 1.2);
    const smile = smooth(ramp(t, T.blauzahn - 0.1, T.blauzahn + 0.25));
    king.smile(smile);
    king.mouth.scale.y = 1 + 2.2 * smile;
    tooth.visible = smile > 0.2;
    tooth.scale.setScalar(Math.max(0.01, smile));
    // runes glow in, then melt into the logo
    const runeIn = smooth(ramp(t, T.fakt + 0.3, T.fakt + 0.9));
    const morph = smooth(ramp(t, T.logo + 0.05, T.logo + 0.55));
    strokes.forEach((s, i) => {
      s.visible = runeIn > 0.01;
      const a = [
        lerp(RUNE[i][0][0], LOGO[i][0][0], morph),
        lerp(RUNE[i][0][1], LOGO[i][0][1], morph),
      ];
      const b = [
        lerp(RUNE[i][1][0], LOGO[i][1][0], morph),
        lerp(RUNE[i][1][1], LOGO[i][1][1], morph),
      ];
      setStroke(s, a, b, 0.5 + morph * 0.1);
      s.scale.x = s.scale.z = runeIn;
    });
    runeMat.color.set(0x7fd8ff).lerp(new THREE.Color(0xffffff), morph);
    badge.visible = morph > 0.01;
    badge.scale.setScalar(Math.max(0.01, outBack(clamp01(morph))));
  }

  // ---------------- the end: his earbud drops and rolls under the bench
  {
    const t0 = T.airpods + 0.15;
    const drop = t >= t0;
    budL.visible = !drop;
    dropBud.visible = drop;
    if (drop) {
      const fall = clamp01((t - t0) / 0.47);
      const floorY = 0.22;
      let y;
      let x = E.x + 0.25 * fall;
      let z = E.z + 0.6 * fall;
      if (fall < 1) y = lerp(E.y, floorY, fall * fall);
      else {
        const b = t - t0 - 0.47;
        y = floorY + Math.max(0, 0.9 * Math.sin(Math.min(Math.PI, b * 6)) * Math.exp(-b * 2));
        const roll = smooth(clamp01((b - 0.3) / 1.4));
        x += lerp(0, 0.7, roll);
        z += lerp(0, -1.4, roll);
      }
      dropBud.position.set(x, y, z);
      dropBud.rotation.set((t - t0) * 7, 0, (t - t0) * 5);
    }
    // he grabs at his ear
    const grab = smooth(ramp(t, T.airpods + 0.4, T.airpods + 0.8));
    ath.armL.sh.rotation.set(lerp(-0.35, -1.7, grab), 0, lerp(0.1, 0.75, grab));
    ath.armL.el.rotation.set(lerp(-1.15, -1.9, grab), 0, 0);
  }

  labels(t, LABELS);
  applyCamera(t);
  // rings face the final camera
  for (const e of rings) for (const m of e.list) m.quaternion.copy(camera.quaternion);
  renderFrame();
}
const seqA3 = seqA.map((x) => x + 3);
T.springen2 = T.verpassen;

start(renderAt);
