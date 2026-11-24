// Scene of #93 "Handy gegen Klobrille" (format D, Duell). The toilet is
// built in set.js; here: the phone (screen, smudges, battery for the x-ray),
// germs on both rivals, the flush plume, the wipe, the tap counter, the
// microscope dive and the UV-torch payoff. renderAt(t) is a pure function
// of t.
import {
  THREE,
  ramp,
  smooth,
  pop,
  V,
  scene,
  real,
  roundedBox,
  rng,
  xrayMaterial,
  setXray,
  showNope,
  makeArrowSet,
  animateArrows,
  heatMat,
  labels,
  highlights,
  shotCamera,
  renderFrame,
  start,
  clamp01,
  lerp,
} from "./world.js";
import {
  LEDGE,
  SEAT_C,
  BOARD,
  UBAHN,
  KUECHE,
  flushBtnBig,
  SET_LIGHTS,
  seatMat,
  SEAT_SCALE,
} from "./set.js";
import { createHand } from "./hand.js";
import { counter } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);
const R = rng(931);
const LEDGE_TOP = LEDGE[1] + 0.08;

// ---------------------------------------------------------------- phone
// lying flat: screen up (+y), long side along z, 15.5 × 7.5 cm (×3 units)
const PW = 0.225;
const PL = 0.465;
const PT = 0.024;
const phone = new THREE.Group();
scene.add(phone);
const shellMat = xrayMaterial(0x34373d);
const shell = new THREE.Mesh(roundedBox(PW, PT, PL, 0.011, 4), shellMat);
shell.castShadow = true;
phone.add(shell);
function feedTex() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 512;
  const g = c.getContext("2d");
  g.fillStyle = "#0e0f13";
  g.fillRect(0, 0, 256, 512);
  const cols = ["#ff5a7a", "#ffb547", "#43c6ff", "#7b6bff", "#3ddc97", "#ff7b3d"];
  for (let i = 0; i < 6; i++) {
    g.fillStyle = cols[i];
    g.globalAlpha = 0.9;
    g.beginPath();
    g.roundRect(14 + (i % 2) * 118, 46 + Math.floor(i / 2) * 150, 110, 140, 14);
    g.fill();
  }
  g.globalAlpha = 1;
  g.fillStyle = "#ffffff";
  for (let i = 0; i < 5; i++) {
    g.beginPath();
    g.arc(40 + i * 44, 488, 9, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = "#000";
  g.beginPath();
  g.roundRect(108, 12, 40, 12, 6);
  g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const scrTex = feedTex();
const screenMat = new THREE.MeshPhysicalMaterial({
  color: 0x111111,
  map: scrTex,
  emissive: 0xffffff,
  emissiveMap: scrTex,
  emissiveIntensity: 0.9,
  roughness: 0.08,
  clearcoat: 1,
});
const screen = new THREE.Mesh(new THREE.PlaneGeometry(PW - 0.014, PL - 0.014), screenMat);
screen.rotation.x = -Math.PI / 2;
screen.position.y = PT / 2 + 0.0008;
phone.add(screen);
// fingerprint smudges (fade in on "Hautfett", glow under UV)
function smudgeTex() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 512;
  const g = c.getContext("2d");
  const rr = rng(77);
  for (let i = 0; i < 26; i++) {
    const x = 30 + rr() * 196;
    const y = 40 + rr() * 430;
    const s = 14 + rr() * 16;
    for (let k = 0; k < 7; k++) {
      g.strokeStyle = `rgba(255,255,255,${0.32 - k * 0.03})`;
      g.lineWidth = 1.6;
      g.beginPath();
      g.ellipse(x, y, s - k * 2, s * 1.3 - k * 2.4, rr() * 0.6, 0, Math.PI * 2);
      g.stroke();
    }
    g.fillStyle = "rgba(255,255,255,0.12)";
    g.beginPath();
    g.ellipse(x, y, s, s * 1.3, 0, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const smudgeMat = new THREE.MeshBasicMaterial({
  map: smudgeTex(),
  color: 0xd8dde4,
  transparent: true,
  opacity: 0,
  depthWrite: false,
});
const smudge = new THREE.Mesh(new THREE.PlaneGeometry(PW - 0.014, PL - 0.014), smudgeMat);
smudge.rotation.x = -Math.PI / 2;
smudge.position.y = PT / 2 + 0.0016;
phone.add(smudge);
// camera bump on the back + side buttons
{
  const bump = new THREE.Mesh(roundedBox(0.09, 0.008, 0.09, 0.02), real.gloss(0x2a2c31));
  bump.position.set(-0.05, -PT / 2 - 0.004, -0.15);
  phone.add(bump);
  for (const [dx, dz] of [
    [-0.02, -0.02],
    [0.02, 0.02],
  ]) {
    const lens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.016, 0.006, 24),
      real.glass(0x111318, { opacity: 0.9 }),
    );
    lens.position.set(-0.05 + dx, -PT / 2 - 0.009, -0.15 + dz);
    phone.add(lens);
  }
  const btn = new THREE.Mesh(roundedBox(0.006, 0.01, 0.05, 0.003), real.metal(0x8a8d93));
  btn.position.set(PW / 2 + 0.002, 0, -0.06);
  phone.add(btn);
}
// battery inside (seen in the x-ray)
const battMat = new THREE.MeshStandardMaterial({
  color: 0xff8a2a,
  emissive: 0xff5a10,
  emissiveIntensity: 0,
});
const batt = new THREE.Mesh(roundedBox(0.17, 0.012, 0.28, 0.01), battMat);
batt.position.set(0, -0.002, 0.04);
phone.add(batt);
const heat = makeArrowSet(
  [
    [V(0.04, 0.02, 0.05), V(0.1, 0.3, 0.1)],
    [V(-0.05, 0.02, -0.04), V(-0.1, 0.28, -0.08)],
    [V(0, 0.02, 0.13), V(0.02, 0.32, 0.22)],
  ],
  { parent: phone, mat: heatMat, r: 0.008 },
);

// ---------------------------------------------------------------- germs
const germMat = new THREE.MeshStandardMaterial({
  color: 0x7dff4a,
  emissive: 0x47e01c,
  emissiveIntensity: 0.7,
  roughness: 0.4,
});
const m4 = new THREE.Matrix4();
const q = new THREE.Quaternion();
const e = new THREE.Euler();
function germField(n, parent, size, place) {
  const im = new THREE.InstancedMesh(
    new THREE.CapsuleGeometry(size * 0.45, size, 4, 10),
    germMat,
    n,
  );
  im.userData.noAO = true;
  im.frustumCulled = false;
  parent.add(im);
  const pts = Array.from({ length: n }, (_, i) => ({
    p: place(i),
    a: R() * 6.28,
    ph: R() * 6.28,
    s: 0.7 + R() * 0.6,
  }));
  return {
    im,
    pts,
    // k = share visible (0..1), wob = wiggle, grow = size multiplier
    set(t, k, grow = 1) {
      pts.forEach((g, i) => {
        const vis = clamp01((k * n - i) / 1.5);
        const sc =
          vis > 0 ? g.s * grow * (0.4 + 0.6 * vis) * (1 + 0.12 * Math.sin(t * 5 + g.ph)) : 0.0001;
        e.set(Math.PI / 2, g.a + Math.sin(t * 1.3 + g.ph) * 0.4, 0);
        q.setFromEuler(e);
        m4.compose(V(g.p[0], g.p[1], g.p[2]), q, V(sc, sc, sc));
        im.setMatrixAt(i, m4);
      });
      im.instanceMatrix.needsUpdate = true;
    },
  };
}
const phoneGerms = germField(80, phone, 0.012, () => {
  // mostly on the screen, some on the edges
  if (R() < 0.82) return [(R() - 0.5) * (PW - 0.03), PT / 2 + 0.006, (R() - 0.5) * (PL - 0.04)];
  const side = R() < 0.5 ? -1 : 1;
  return [side * (PW / 2 + 0.004), (R() - 0.5) * 0.01, (R() - 0.5) * PL];
});
const seatGroup = new THREE.Group();
seatGroup.position.set(...SEAT_C);
seatGroup.scale.set(SEAT_SCALE, 1, SEAT_SCALE);
scene.add(seatGroup);
const seatGerms = germField(46, seatGroup, 0.03, () => {
  const a = R() * Math.PI * 2;
  const rr = 0.62 + R() * 0.12;
  return [Math.cos(a) * rr * 1.08, 0.025, Math.sin(a) * rr * 1.22];
});

// germs that jump from a source onto the phone (U-Bahn pole, chicken)
const jumpers = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.006, 0.012, 4, 8), germMat, 16);
jumpers.frustumCulled = false;
jumpers.userData.noAO = true;
scene.add(jumpers);
const jumpSeed = Array.from({ length: 16 }, () => [R(), R(), R()]);
function jump(t, t0, from, to) {
  const p = clamp01((t - t0) / 0.9);
  jumpSeed.forEach(([a, b, c], i) => {
    const f = clamp01(p * 1.6 - a * 0.6);
    const sc = f > 0 && f < 1 ? 1.4 : 0.0001;
    const x = lerp(from[0] + (b - 0.5) * 0.15, to[0] + (c - 0.5) * 0.15, f);
    const z = lerp(from[2] + (c - 0.5) * 0.15, to[2] + (b - 0.5) * 0.25, f);
    const y = lerp(from[1], to[1], f) + Math.sin(f * Math.PI) * 0.25;
    m4.compose(V(x, y, z), q.identity(), V(sc, sc, sc));
    jumpers.setMatrixAt(i, m4);
  });
  jumpers.instanceMatrix.needsUpdate = true;
}

// ---------------------------------------------------------------- flush plume
const NP = 220;
const plumeMat = new THREE.MeshStandardMaterial({
  color: 0xd8f4ff,
  emissive: 0x9fe8ff,
  emissiveIntensity: 0.35,
  transparent: true,
  opacity: 0.75,
  roughness: 0.2,
});
const plume = new THREE.InstancedMesh(new THREE.SphereGeometry(0.018, 8, 6), plumeMat, NP);
plume.frustumCulled = false;
plume.userData.noAO = true;
scene.add(plume);
const plumeSeed = Array.from({ length: NP }, () => [R(), R(), R(), R()]);
function setPlume(t, t0) {
  const age = t - t0;
  plumeSeed.forEach(([a, b, c, d], i) => {
    const s = age - a * 0.5;
    let sc = 0.0001;
    let p = [0, 0, 0];
    if (s > 0 && s < 3.2) {
      const vy = 2.2 + b * 2.0;
      const ang = c * Math.PI * 2;
      const vh = 0.25 + d * 0.55;
      const y = 0.95 + vy * s - 0.9 * s * s;
      p = [Math.cos(ang) * vh * s * 1.1, Math.max(1.0, y), -0.12 + Math.sin(ang) * vh * s * 1.3];
      sc = (0.6 + d) * (1 - clamp01((s - 2.2) / 1.0));
    }
    m4.compose(V(...p), q.identity(), V(sc, sc, sc));
    plume.setMatrixAt(i, m4);
  });
  plume.instanceMatrix.needsUpdate = true;
}

// ---------------------------------------------------------------- cloth + sparkles (the wipe)
const cloth = new THREE.Mesh(roundedBox(0.5, 0.05, 0.38, 0.03), real.fabric(0x3d7fe0));
cloth.castShadow = true;
scene.add(cloth);
const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const sparks = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.03, 0), sparkMat, 14);
sparks.frustumCulled = false;
sparks.userData.noAO = true;
scene.add(sparks);
const sparkSeed = Array.from({ length: 14 }, () => [R() * 6.28, 0.5 + R() * 0.3, R()]);

// ---------------------------------------------------------------- microscope bacteria (Übrigens)
const micro = new THREE.Group();
micro.position.set(0.77, LEDGE_TOP + PT + 0.002, -1.45);
scene.add(micro);
{
  const rodMat = new THREE.MeshStandardMaterial({
    color: 0xc9a24a,
    emissive: 0x7a5a10,
    emissiveIntensity: 0.5,
    roughness: 0.35,
  });
  const rr = rng(5);
  for (let i = 0; i < 70; i++) {
    const rod = new THREE.Mesh(new THREE.CapsuleGeometry(0.0016, 0.006, 4, 12), rodMat);
    rod.position.set((rr() - 0.5) * 0.06, 0.0016, (rr() - 0.5) * 0.06);
    rod.rotation.set(Math.PI / 2, 0, rr() * 6.28);
    micro.add(rod);
  }
}

// ---------------------------------------------------------------- UV torch
const torch = new THREE.Group();
scene.add(torch);
{
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.045, 0.42, 32),
    real.metal(0x1c1c1e, { roughness: 0.35 }),
  );
  body.rotation.x = Math.PI / 2;
  torch.add(body);
  const head = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.05, 0.1, 32),
    real.metal(0x1c1c1e, { roughness: 0.35 }),
  );
  head.rotation.x = Math.PI / 2;
  head.position.z = 0.25;
  torch.add(head);
}
const lensMat = new THREE.MeshBasicMaterial({ color: 0x8a5cff });
const lens = new THREE.Mesh(new THREE.CircleGeometry(0.062, 32), lensMat);
lens.position.z = 0.302;
torch.add(lens);
const uvSpot = new THREE.SpotLight(0x8f4dff, 0, 14, 0.75, 0.6, 1.2);
uvSpot.position.set(0, 0, 0.3);
torch.add(uvSpot);
torch.add(uvSpot.target);
uvSpot.target.position.set(0, 0, 3);
torch.position.set(2.2, 3.9, 1.6);
torch.lookAt(0.4, 2.4, -0.6);

// lights the UV payoff dims (everything except the torch)
const dimmable = [];
scene.traverse((o) => {
  if (o.isLight && o !== uvSpot) dimmable.push([o, o.intensity]);
});
const ringMats = SET_LIGHTS.filter((o) => o.isMesh).map((o) => [
  o.material,
  o.material.emissiveIntensity,
]);
const envBase = scene.environmentIntensity;

// ---------------------------------------------------------------- hands
const handA = createHand({ scale: 0.6, sleeve: 0x8a93a6, skin: 0xe9b796 }); // holds the phone
const handB = createHand({ scale: 0.6, sleeve: 0x8a93a6, skin: 0xe9b796 }); // presses, wipes, holds the torch
// the phone in hand A: palm up (hand rotated z = π), phone on the palm
const HOLD = new THREE.Matrix4().compose(
  V(0, -0.045, 0.1),
  new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI, 0, 0)),
  V(1, 1, 1),
);
const tmpM = new THREE.Matrix4();
const HUP = [0, 0, Math.PI]; // palm-up rotation base

const applyCamera = shotCamera(shots);

const P_LEDGE = [LEDGE[0], LEDGE_TOP + PT / 2, LEDGE[2]];
const P_KUECHE = [
  KUECHE[0] + BOARD[0] - 0.55,
  KUECHE[1] + BOARD[1] + PT / 2 + 0.005,
  KUECHE[2] + BOARD[2] + 0.62,
];

function placeOnLedge() {
  phone.position.set(...P_LEDGE);
  phone.rotation.set(0, 0.35, 0);
}
function inHand() {
  handA.group.updateMatrixWorld(true);
  tmpM.multiplyMatrices(handA.group.matrixWorld, HOLD);
  tmpM.decompose(phone.position, phone.quaternion, phone.scale);
}

// ---------------------------------------------------------------- render
function renderAt(t) {
  // -------- where is the phone, who holds it
  const U = UBAHN;
  const holdKeys = [
    // hook: phone in your hand right over the seat
    { t: -0.6, pos: [0.5, 1.95, 0.6], rot: [0.5, -0.25, HUP[2]], pose: "grab" },
    { t: 1.0, pos: [0.38, 1.9, 0.45], rot: [0.55, -0.25, HUP[2]], pose: "grab" },
    {
      t: T.klar - 0.01,
      pos: [0.38, 1.9, 0.45],
      rot: [0.55, -0.25, HUP[2]],
      pose: "grab",
      out: true,
    },
    // U-Bahn: at the pole
    { t: T.in1 - 0.01, pos: [U[0] + 0.25, 3.25, 0.45], rot: [0.75, 0.3, HUP[2]], pose: "grab" },
    {
      t: T.neben - 0.01,
      pos: [U[0] + 0.22, 3.3, 0.42],
      rot: [0.75, 0.3, HUP[2]],
      pose: "grab",
      out: true,
    },
    // on the toilet: phone low over your knees, then up to your face
    { t: T.jetzt - 0.01, pos: [0.05, 1.95, 0.75], rot: [0.9, 0, HUP[2]], pose: "grab" },
    { t: T.danach, pos: [0.05, 2.0, 0.8], rot: [0.9, 0, HUP[2]], pose: "grab" },
    { t: T.gesicht + 0.3, pos: [0.08, 2.62, 1.75], rot: [1.0, 0, HUP[2]], pose: "grab" },
    { t: T.rate - 0.01, pos: [0.08, 2.66, 1.8], rot: [1.0, 0, HUP[2]], pose: "grab", out: true },
  ];
  handA.track(t, holdKeys);
  const held = t < T.klar || (t >= T.in1 && t < T.neben) || (t >= T.jetzt && t < T.rate);
  if (held) inHand();
  else if (t >= T.neben && t < T.jetzt) {
    phone.position.set(...P_KUECHE);
    phone.rotation.set(0, 1.25, 0);
  } else placeOnLedge();

  // hand B: flush press, tapping, wipe, cloth ignoring the phone, UV torch
  const tapY = Math.abs(Math.sin(t * 22)) * 0.05;
  handB.track(t, [
    { t: T.beim - 0.3, pos: [0.8, 3.2, 0.6], rot: [0.1, -0.6, 0], pose: "point" },
    { t: T.beim + 0.12, pos: [0.22, 3.02, -0.62], rot: [0.05, -0.15, 0], pose: "point" },
    { t: T.beim + 0.25, pos: [0.2, 3.0, -0.7], rot: [0.05, -0.15, 0], pose: "press" },
    { t: T.spruet - 0.01, pos: [0.5, 3.1, -0.2], rot: [0.05, -0.3, 0], pose: "point", out: true },
    // tapping on the phone while the counter runs
    { t: T.rate + 0.1, pos: [0.6, 3.86 + tapY, -1.18], rot: [0.35, 2.5, 0], pose: "point" },
    {
      t: T.unterschied - 0.11,
      pos: [0.6, 3.86 + tapY, -1.18],
      rot: [0.35, 2.5, 0],
      pose: "point",
      out: true,
    },
    // the wipe over the seat
    { t: T.klobrille3, pos: [0.8, 1.75, 0.55], rot: [0.2, -0.4, 0], pose: "grab" },
    { t: T.klobrille3 + 0.4, pos: [0.35, 1.56, 0.35], rot: [0.2, -0.4, 0], pose: "grab" },
    { t: T.klobrille3 + 0.8, pos: [-0.35, 1.56, 0.2], rot: [0.2, -0.2, 0], pose: "grab" },
    { t: T.klobrille3 + 1.2, pos: [0.1, 1.56, -0.2], rot: [0.2, -0.3, 0], pose: "grab" },
    { t: T.glatt - 0.01, pos: [0.8, 1.8, 0.45], rot: [0.2, -0.4, 0], pose: "grab", out: true },
    // "Geputzt wird es fast nie": the cloth sweeps past the phone, never onto it
    { t: T.geputzt2, pos: [1.6, 3.92, -1.0], rot: [0.2, -0.8, 0], pose: "grab" },
    { t: T.nie1, pos: [1.3, 3.92, -1.15], rot: [0.2, -0.8, 0], pose: "grab" },
    { t: T.uebrigens - 0.01, pos: [1.7, 3.95, -1.0], rot: [0.2, -0.8, 0], pose: "grab", out: true },
    // the UV torch
    { t: T.licht - 0.5, pos: [2.6, 3.7, 2.0], rot: [-0.25, 0.75, 0], pose: "grab" },
    { t: T.licht, pos: [2.3, 3.75, 1.75], rot: [-0.25, 0.7, 0], pose: "grab" },
    { t: 46, pos: [2.25, 3.8, 1.7], rot: [-0.25, 0.7, 0], pose: "grab" },
  ]);
  // cloth follows hand B during the wipes
  const wiping = (t >= T.klobrille3 && t < T.glatt) || (t >= T.geputzt2 && t < T.uebrigens);
  cloth.visible = wiping;
  if (wiping) {
    handB.group.updateMatrixWorld(true);
    tmpM.multiplyMatrices(
      handB.group.matrixWorld,
      new THREE.Matrix4().makeTranslation(0, -0.06, 0.08),
    );
    tmpM.decompose(cloth.position, cloth.quaternion, cloth.scale);
  }
  showNope(
    pop(t, T.nie1 - 0.1, T.uebrigens),
    P_LEDGE[0],
    P_LEDGE[1] + 0.25,
    P_LEDGE[2] + 0.05,
    0.22,
  );
  flushBtnBig.position.z = 0.055 - 0.02 * pop(t, T.beim + 0.22, T.beim + 0.6, 0.1);

  // torch: in hand B from "Licht" on
  const uvOn = t >= T.licht + 0.05;
  torch.visible = t >= T.licht - 0.5;
  if (torch.visible) {
    handB.group.updateMatrixWorld(true);
    tmpM.multiplyMatrices(
      handB.group.matrixWorld,
      new THREE.Matrix4().makeTranslation(0, -0.05, 0.09),
    );
    tmpM.decompose(torch.position, torch.quaternion, torch.scale);
    torch.lookAt(0.4, 2.4, -0.6);
  }
  const uv = uvOn ? smooth(ramp(t, T.licht + 0.05, T.licht + 0.35)) : 0;
  uvSpot.intensity = 55 * uv;
  lensMat.color.setHex(uvOn ? 0xc9a6ff : 0x3a3150);
  for (const [l, base] of dimmable) l.intensity = base * (1 - 0.88 * uv);
  for (const [m, base] of ringMats) m.emissiveIntensity = base * (1 - 0.9 * uv);
  scene.environmentIntensity = envBase * (1 - 0.85 * uv);

  // -------- germs
  // phone: a few from the start, more at every stop, a burst on "Buffet"
  let gk = 0.18;
  gk += 0.14 * smooth(ramp(t, T.halte, T.halte + 0.8));
  gk += 0.16 * smooth(ramp(t, T.haehnchen, T.haehnchen + 0.8));
  gk += 0.12 * smooth(ramp(t, T.klo1, T.klo1 + 0.6));
  gk += 0.4 * smooth(ramp(t, T.buffet, T.buffet + 0.8));
  const grow = 1 + 0.5 * smooth(ramp(t, T.buffet, T.buffet + 0.6)) + 0.5 * uv;
  phoneGerms.set(t, gk, grow);
  phoneGerms.im.visible = !(t >= T.uebrigens && t < T.licht);
  // seat: dirty in the hook, extra from the plume, wiped clean
  let sk = 0.75 + 0.25 * smooth(ramp(t, T.spruet + 0.6, T.aber));
  sk *= 1 - 0.9 * smooth(ramp(t, T.klobrille3 + 0.3, T.klobrille3 + 1.4));
  seatGerms.set(t, sk, 1);
  germMat.emissiveIntensity = 0.7 + 3.2 * uv;
  germMat.color.setHex(uv > 0.5 ? 0xb6ff3a : 0x7dff4a);

  // jumpers: U-Bahn pole → phone, chicken → phone
  if (t >= T.halte && t < T.neben)
    jump(t, T.halte, [U[0], 3.5, 0.1], [phone.position.x, phone.position.y, phone.position.z]);
  else if (t >= T.haehnchen - 0.2 && t < T.jetzt)
    jump(
      t,
      T.haehnchen - 0.2,
      [KUECHE[0] + 0.4, 2.95, 0.3],
      [P_KUECHE[0], P_KUECHE[1], P_KUECHE[2]],
    );
  else jump(t, -10, [0, 0, 0], [0, 0, 0]);

  // plume after the flush
  setPlume(t, T.spruet - 0.25);
  plume.visible = t >= T.spruet - 0.3 && t < T.in1;

  // sparkles on the clean seat
  const sp = clamp01((t - T.geputzt1) / 1.6);
  sparkSeed.forEach(([a, rr, ph], i) => {
    const k =
      t >= T.geputzt1 && t < T.handy3 - 0.2 ? Math.max(0, Math.sin((sp * 3 + ph) * Math.PI)) : 0;
    const sc = Math.max(0.0001, k);
    e.set(0, t * 3 + i, 0);
    q.setFromEuler(e);
    m4.compose(
      V(
        SEAT_C[0] + Math.cos(a) * rr * 0.8,
        SEAT_C[1] + 0.06 + k * 0.05,
        SEAT_C[2] + Math.sin(a) * rr * 0.95,
      ),
      q,
      V(sc, sc * 1.6, sc),
    );
    sparks.setMatrixAt(i, m4);
  });
  sparks.instanceMatrix.needsUpdate = true;
  seatMat.clearcoatRoughness = 0.08 - 0.06 * smooth(ramp(t, T.glatt, T.glatt + 0.6));

  // -------- phone: screen, smudges, x-ray, battery heat
  const xr =
    smooth(ramp(t, T.handy3 - 0.1, T.warm)) *
    (1 - smooth(ramp(t, T.hautfett - 0.1, T.hautfett + 0.2)));
  setXray([shellMat], xr);
  screen.visible = xr < 0.5;
  battMat.emissiveIntensity = 2.2 * smooth(ramp(t, T.warm, T.akku)) * xr;
  batt.visible = xr > 0.05;
  animateArrows(heat, t, pop(t, T.warm, T.hautfett - 0.1));
  screenMat.emissiveIntensity = 0.9 * (1 - 0.8 * uv);
  smudgeMat.opacity = 0.75 * smooth(ramp(t, T.hautfett, T.hautfett + 0.5)) + 0.25 * uv;
  smudgeMat.color.setHex(uv > 0.5 ? 0xe9ff7a : 0xd8dde4);

  // microscope bacteria (only during the dive)
  micro.visible = t >= T.uebrigens && t < T.licht;
  micro.rotation.y = t * 0.15;

  // -------- displays
  // tap counter: climbs on "Rate mal", rushes to 2 617 on "Über 2600 Mal"
  const kc = pop(t, T.rate + 0.2, T.unterschied - 0.1);
  const v1 = 40 + 760 * smooth(ramp(t, T.rate + 0.2, T.ueber));
  const v2 = 2617 * smooth(ramp(t, T.ueber, T.mal2));
  counter("tap", kc, {
    label: "Heute angefasst",
    value: Math.round(t < T.ueber ? v1 : Math.max(v1, v2)),
    x: 60,
    y: 1180,
    color: "#ffd23f",
  });

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
