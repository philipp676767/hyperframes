// #89 Ei in der Mikrowelle — Format B. Your hand sets a peeled boiled egg on
// the turntable, the door shuts, the microwave hums… and nothing happens.
// X-ray: the waves shake the water, deep in the firm yolk it gets hotter than
// boiling but can't bubble — tiny pockets full of pressure. Out on the plate
// the fork goes in, the pockets flash to steam (1,700× the volume) and the
// egg bursts at your fork. The safe way: slices. Übrigens: in the lab some
// eggs were louder than a jackhammer.
import {
  THREE,
  ramp,
  smooth,
  outBack,
  pop,
  V,
  scene,
  real,
  rng,
  lerp,
  xrayMaterial,
  setXray,
  showNope,
  makeArrowSet,
  animateArrows,
  forceMat,
  showPanel,
  LED,
  labels,
  puff,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { MW, PLATE, BOARD, ANALOGY } from "./set.js";
import { createHand } from "./hand.js";
import { gauge } from "./hud.js";
import { T, SLAM, GRAB, BOOM, BOOM2, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);
const applyCamera = shotCamera(shots);
const easeOut = (x) => 1 - (1 - x) * (1 - x);

// ---------------------------------------------------------------- the egg
// peeled hard-boiled egg, lying on its side: long axis along x
const RX = 0.45;
const RY = 0.6;
function eggGeo(seg = 56) {
  const g = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.7));
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    const k = 1 - 0.11 * y; // narrower at the top: egg shape
    p.setXYZ(i, p.getX(i) * RX * k, y * RY, p.getZ(i) * RX * k);
  }
  g.computeVertexNormals();
  return g;
}
const egg = new THREE.Group(); // position + yaw
scene.add(egg);
const body = new THREE.Group(); // lies on its side
body.rotation.z = Math.PI / 2;
egg.add(body);
const whiteMat = xrayMaterial(0xfbf7ef, {
  roughness: 0.16,
  emissive: 0xff5a10,
  emissiveIntensity: 0,
});
const shell = new THREE.Mesh(eggGeo(), whiteMat);
shell.castShadow = true;
shell.receiveShadow = true;
body.add(shell);
const yolkMat = real.plastic(0xf3b322, { roughness: 0.55 });
const yolk = new THREE.Mesh(new THREE.SphereGeometry(0.27, 40, 28), yolkMat);
yolk.position.y = -0.04;
body.add(yolk);

// water molecules inside (x-ray only): blue → red as they heat up
const NW = 90;
const water = new THREE.InstancedMesh(
  new THREE.SphereGeometry(0.026, 10, 8),
  new THREE.MeshBasicMaterial({ color: 0xffffff }),
  NW,
);
water.userData.noAO = true;
body.add(water);
const WP = [];
{
  const r = rng(31);
  while (WP.length < NW) {
    const p = V((r() * 2 - 1) * 0.4, (r() * 2 - 1) * 0.54, (r() * 2 - 1) * 0.4);
    if ((p.x / 0.4) ** 2 + (p.y / 0.54) ** 2 + (p.z / 0.4) ** 2 > 1) continue;
    WP.push({ p, f: 18 + r() * 14, ph: r() * 6.3, inYolk: p.distanceTo(V(0, -0.04, 0)) < 0.25 });
  }
}
const BLUE = new THREE.Color(0x4fc3ff);
const RED = new THREE.Color(0xff4b1f);
const tmpC = new THREE.Color();
const m4 = new THREE.Matrix4();

// pockets of superheated water inside the yolk
const pocketMat = new THREE.MeshBasicMaterial({
  color: 0xff7a2a,
  transparent: true,
  opacity: 0.95,
});
const pockets = [];
{
  const r = rng(8);
  for (let i = 0; i < 9; i++) {
    const a = r() * 6.3;
    const b = Math.acos(r() * 2 - 1);
    const d = 0.06 + r() * 0.13;
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), pocketMat);
    m.position.set(
      Math.sin(b) * Math.cos(a) * d,
      -0.04 + Math.cos(b) * d,
      Math.sin(b) * Math.sin(a) * d,
    );
    m.userData = { s: 0.035 + r() * 0.03, ph: r() * 6.3, at: i * 0.07 };
    body.add(m);
    pockets.push(m);
  }
}
// steam bursting out of the pockets (x-ray, at the stab)
const steamIn = [];
for (let i = 0; i < 9; i++) {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(1, 16, 12),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
      roughness: 1,
      depthWrite: false,
    }),
  );
  m.position.copy(pockets[i].position);
  body.add(m);
  steamIn.push(m);
}

// microwaves from the side walls into the egg
const waves = makeArrowSet(
  [
    [V(-3.0, 1.4, -0.6), V(-0.55, 0.5, -0.1)],
    [V(-3.0, 0.7, 0.8), V(-0.55, 0.45, 0.15)],
    [V(-3.0, 2.3, 0.2), V(-0.4, 0.75, 0.0)],
    [V(3.0, 1.2, 0.6), V(0.55, 0.5, 0.1)],
    [V(3.0, 2.2, -0.7), V(0.45, 0.7, -0.1)],
  ],
  { amp: 0.12 },
);
// pressure arrows pushing out of the yolk
const press = makeArrowSet(
  [
    [V(0.12, 0.45, 0.0), V(0.42, 0.45, 0.0)],
    [V(-0.12, 0.45, 0.0), V(-0.42, 0.45, 0.0)],
    [V(0.0, 0.58, 0.0), V(0.0, 0.85, 0.0)],
    [V(0.0, 0.45, 0.12), V(0.0, 0.45, 0.4)],
  ],
  { amp: 0, r: 0.022, mat: forceMat },
);

// ---------------------------------------------------------------- burst chunks
const NCH = 60;
const chunkGeo = new THREE.IcosahedronGeometry(1, 1);
const whiteChunks = new THREE.InstancedMesh(
  chunkGeo,
  real.plastic(0xfbf7ef, { roughness: 0.3 }),
  NCH,
);
const yolkChunks = new THREE.InstancedMesh(
  chunkGeo,
  real.plastic(0xf3b322, { roughness: 0.5 }),
  NCH,
);
for (const im of [whiteChunks, yolkChunks]) {
  im.frustumCulled = false;
  im.castShadow = true;
  scene.add(im);
}
function makeBurst(seed, toward) {
  const r = rng(seed);
  const list = [];
  for (let i = 0; i < NCH * 2; i++) {
    const a = r() * 6.3;
    let v = V(Math.cos(a) * (1.5 + r() * 3), 2 + r() * 4, Math.sin(a) * (1.5 + r() * 3));
    // a third of them fly at the camera ("mitten ins Gesicht")
    if (toward && i % 3 === 0)
      v = toward
        .clone()
        .multiplyScalar(2.6 + r() * 1.2)
        .add(V((r() - 0.5) * 1.5, r() * 1.5, (r() - 0.5) * 1.5));
    list.push({ v, s: 0.04 + r() * 0.09, rot: V(r() * 6, r() * 6, r() * 6), spin: 4 + r() * 10 });
  }
  return list;
}
const B1 = makeBurst(5, V(0.1, 0.9, 1.25).normalize().multiplyScalar(3.4));
const B2 = makeBurst(9, null);
const G = 14;
function drawBurst(t, at, c, list, floorY, until) {
  const u = t - at;
  const show = u >= 0 && t < until;
  let wi = 0;
  let yi = 0;
  list.forEach((ch, i) => {
    const im = i % 2 ? yolkChunks : whiteChunks;
    const idx = i % 2 ? yi++ : wi++;
    if (!show) {
      m4.makeScale(0, 0, 0);
    } else {
      const uu = Math.min(u, 1.6);
      let y = c.y + ch.v.y * uu - 0.5 * G * uu * uu;
      const landed = y < floorY + ch.s * 0.5;
      if (landed) y = floorY + ch.s * 0.45;
      const tFly = landed
        ? Math.max(0.05, (ch.v.y + Math.sqrt(ch.v.y ** 2 + 2 * G * (c.y - floorY))) / G)
        : uu;
      const tt = Math.min(uu, tFly);
      const x = c.x + ch.v.x * tt;
      const z = c.z + ch.v.z * tt;
      const k = smooth(Math.min(1, u / 0.06));
      const e = new THREE.Euler(ch.rot.x + ch.spin * tt, ch.rot.y + ch.spin * tt, ch.rot.z);
      m4.compose(
        V(x, y, z),
        new THREE.Quaternion().setFromEuler(e),
        V(ch.s * k, ch.s * k * (landed ? 0.45 : 1), ch.s * k),
      );
    }
    im.setMatrixAt(idx, m4);
  });
  whiteChunks.instanceMatrix.needsUpdate = true;
  yolkChunks.instanceMatrix.needsUpdate = true;
}

// sound rings for the lab egg
const rings = [];
for (let i = 0; i < 4; i++) {
  const m = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.035, 8, 64),
    new THREE.MeshBasicMaterial({ color: 0xffa23a, transparent: true, opacity: 0 }),
  );
  m.userData.noAO = true;
  scene.add(m);
  rings.push(m);
}
// lab egg on the board (a second peeled egg) + a measuring microphone + needle
const labEgg = new THREE.Mesh(eggGeo(48), real.plastic(0xfbf7ef, { roughness: 0.16 }));
labEgg.rotation.z = Math.PI / 2;
labEgg.castShadow = true;
labEgg.position.set(BOARD.x, BOARD.y + RX, BOARD.z);
scene.add(labEgg);
{
  const steel = real.metal(0x9aa0a8, { roughness: 0.3 });
  const dark = real.plastic(0x1e2024, { roughness: 0.5 });
  const mic = new THREE.Group();
  mic.position.set(BOARD.x + 2.0, -0.75, BOARD.z - 0.6);
  scene.add(mic);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 0.12, 32), dark);
  foot.position.y = 0.06;
  mic.add(foot);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 12), steel);
  pole.position.y = 0.9;
  mic.add(pole);
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.08, 0.8, 20), dark);
  head.rotation.z = Math.PI / 2 - 0.35;
  head.rotation.y = 0.3;
  head.position.set(-0.32, 1.72, 0.1);
  mic.add(head);
  const grill = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), steel);
  grill.position.set(-0.7, 1.58, 0.22);
  mic.add(grill);
  for (const m of [foot, pole, head, grill]) m.castShadow = true;
}
const needle = new THREE.Mesh(
  new THREE.CylinderGeometry(0.012, 0.02, 1.6, 8),
  real.metal(0xd8dce2, { roughness: 0.2 }),
);
needle.castShadow = true;
scene.add(needle);

// sliced egg on the plate (the safe way)
const slices = new THREE.Group();
slices.position.set(PLATE.x + 0.1, PLATE.y, PLATE.z + 0.15);
scene.add(slices);
{
  const wm = real.plastic(0xfbf7ef, { roughness: 0.3 });
  const ym = real.plastic(0xf5c03a, { roughness: 0.6 });
  [0.32, 0.42, 0.45, 0.43, 0.34].forEach((r, i) => {
    const s = new THREE.Group();
    const d = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.13, 36), wm);
    d.position.y = 0.065;
    d.castShadow = true;
    s.add(d);
    if (i > 0 && i < 4) {
      const yk = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.55, r * 0.55, 0.012, 32), ym);
      yk.position.y = 0.136;
      s.add(yk);
    }
    s.position.set(-0.9 + i * 0.42, 0.02 + i * 0.012, Math.sin(i * 1.3) * 0.1);
    s.rotation.set(0, 0, 0.12 - i * 0.03);
    slices.add(s);
  });
}
const wisps = [];
for (let i = 0; i < 7; i++) {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(1, 10, 8),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      roughness: 1,
    }),
  );
  scene.add(m);
  wisps.push(m);
}

// analogy: one drop of water → a ball of steam 10× as wide (1,000× the volume)
const drop = new THREE.Mesh(
  new THREE.SphereGeometry(0.13, 24, 16),
  new THREE.MeshPhysicalMaterial({
    color: 0x5ab8ff,
    roughness: 0.05,
    clearcoat: 1,
    transparent: true,
    opacity: 0.9,
  }),
);
drop.scale.set(1, 0.8, 1);
drop.position.set(ANALOGY.x - 0.75, ANALOGY.y + 0.105, ANALOGY.z + 0.2);
scene.add(drop);
const cloud = new THREE.Group();
cloud.position.set(ANALOGY.x + 0.35, ANALOGY.y + 0.85, ANALOGY.z);
scene.add(cloud);
{
  const r = rng(17);
  for (let i = 0; i < 12; i++) {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(1, 20, 14),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.85,
        roughness: 1,
        depthWrite: false,
      }),
    );
    const a = r() * 6.3;
    const b = r() * 3.1;
    m.position.set(
      Math.sin(b) * Math.cos(a) * 0.35,
      Math.cos(b) * 0.35,
      Math.sin(b) * Math.sin(a) * 0.35,
    );
    m.scale.setScalar(0.38 + r() * 0.2);
    cloud.add(m);
  }
}

// yolk splats on the lens ("mitten ins Gesicht")
const splat = document.createElement("div");
splat.style.cssText = "position:absolute;inset:0;pointer-events:none;opacity:0;";
splat.innerHTML = [
  [180, 760, 260],
  [760, 1050, 190],
  [520, 560, 120],
  [880, 420, 140],
]
  .map(
    ([x, y, s]) =>
      `<div style="position:absolute;left:${x - s / 2}px;top:${y - s / 2}px;width:${s}px;height:${s * 0.9}px;border-radius:48% 52% 45% 55%;background:radial-gradient(circle at 38% 35%,rgba(255,240,180,.95),rgba(245,180,30,.92) 45%,rgba(220,140,10,.75) 80%,rgba(220,140,10,0));filter:blur(1px);"></div>`,
  )
  .join("");
document.getElementById("root").insertBefore(splat, document.getElementById("captions"));

// ---------------------------------------------------------------- the hand (+ fork)
const hand = createHand({ scale: 3.0, sleeve: 0xe0735a, skin: 0xe9b48f });
scene.add(hand.group);
const fork = new THREE.Group();
{
  const st = real.metal(0xd4d8de, { roughness: 0.22 });
  const h = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.06, 1.5), st);
  h.position.z = 1.3;
  fork.add(h);
  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.4), st);
  neck.position.z = 2.2;
  fork.add(neck);
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.08), st);
  bridge.position.z = 2.42;
  fork.add(bridge);
  for (let i = 0; i < 4; i++) {
    const tine = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 0.6), st);
    tine.position.set(-0.13 + i * 0.087, 0, 2.74);
    fork.add(tine);
  }
  fork.position.y = -0.12;
  fork.traverse((m) => (m.castShadow = true));
}
hand.group.add(fork);
const FORK_TIP = 3.04;
const HOLD = 1.25; // wrist → held egg centre
// rotation that points the fingers (+z) along dir, palm down
function rotFor(d) {
  const n = d.clone().normalize();
  const h = Math.hypot(n.y, n.z);
  return [Math.atan2(n.y / h, -n.z / h), Math.atan2(n.x, -h), 0];
}
const dirIn = V(0.45, -0.4, -0.8).normalize();
const dirOut = V(0.35, -0.2, -1).normalize();
const dirFork = V(-0.28, -0.85, -0.45).normalize();
const holdKey = (t, target, d, pose, extra = {}) => ({
  t,
  pos: target
    .clone()
    .sub(d.clone().multiplyScalar(HOLD))
    .add(V(0, 0.3, 0))
    .toArray(),
  rot: rotFor(d),
  pose,
  ...extra,
});
const forkKey = (t, tip, extra = {}) => ({
  t,
  pos: tip
    .clone()
    .sub(dirFork.clone().multiplyScalar(FORK_TIP))
    .add(V(0, 0.12, 0))
    .toArray(),
  rot: rotFor(dirFork),
  pose: "grab",
  ...extra,
});
const EGG_MW = V(0, RX, 0);
const EGG_PLATE = V(PLATE.x, PLATE.y + RX, PLATE.z);
const STAB = EGG_PLATE.clone().add(V(0.05, RX - 0.02, 0.05));
const handKeys = [
  // hook: set the egg on the turntable, pull out
  holdKey(-0.3, V(-1.0, 1.2, 2.0), dirIn, "grab"),
  holdKey(0.2, EGG_MW, dirIn, "grab"),
  holdKey(0.36, EGG_MW.clone().add(V(0, 0.05, 0)), dirIn, "open"),
  holdKey(0.78, V(-1.6, 1.5, 4.6), dirIn, "open", { out: true }),
  // take it out after the beep
  holdKey(T.rate + 0.45, V(1.0, 1.6, 4.6), dirOut, "open"),
  holdKey(GRAB - 0.2, EGG_MW.clone().add(V(0.05, 0.12, 0.25)), dirOut, "open"),
  holdKey(GRAB, EGG_MW, dirOut, "grab"),
  holdKey(T.meistens + 0.1, V(0.9, 1.3, 3.4), dirOut, "grab"),
  holdKey(T.stichst - 0.12, V(2.4, 1.8, 6.6), dirOut, "grab", { out: true }),
  // the fork
  forkKey(T.stichst - 0.05, STAB.clone().add(V(0.25, 0.9, 0.45))),
  forkKey(T.stichst + 0.4, STAB),
  forkKey(T.knallt2 - 0.1, STAB.clone().add(V(0.02, 0.1, 0.03))),
  forkKey(BOOM - 0.02, STAB.clone().add(V(0, -0.06, 0))),
  forkKey(BOOM + 0.3, STAB.clone().add(V(0.6, 1.4, 1.4))),
  forkKey(T.also - 0.05, STAB.clone().add(V(1.2, 2.4, 2.6)), { out: true }),
];
const dirTmp = V(0, 0, 1);

// ---------------------------------------------------------------- render
function renderAt(t) {
  // ---- microwave: door, power, turntable, display
  const opened = -1.75;
  let door;
  if (t < 0.62) door = opened;
  else if (t < SLAM) door = lerp(opened, 0, smooth(ramp(t, 0.62, SLAM)) ** 1.6);
  else if (t < T.rate + 0.2) door = 0;
  else door = lerp(0, -1.5, outBack(ramp(t, T.rate + 0.2, T.rate + 0.55)));
  MW.door.rotation.y = door;
  const on = (t >= SLAM && t < T.piept) || (t >= T.heizt && t < T.rate);
  MW.light.color.set(on ? 0xffa54a : 0xfff0d8);
  MW.light.intensity = on ? 26 + Math.sin(t * 40) * 0.8 : door < -0.2 ? 8 : 0.6;
  MW.lampMat.color.set(on ? 0xffbb66 : door < -0.2 ? 0xfff2d6 : 0x8a8478);
  const onTime =
    Math.min(Math.max(t - SLAM, 0), T.piept - SLAM) +
    Math.min(Math.max(t - T.heizt, 0), T.rate - T.heizt);
  MW.plate.rotation.y = onTime * 0.7;
  if (t < SLAM) MW.setDisplay("0:30");
  else if (t < T.piept)
    MW.setDisplay("0:" + String(Math.round(30 * (1 - ramp(t, SLAM, T.piept)))).padStart(2, "0"));
  else MW.setDisplay("0:00", t < T.piept + 1.2 ? Math.floor((t - T.piept) * 5) % 2 === 0 : 1);

  // ---- hand
  hand.track(t, handKeys);
  fork.visible = t >= T.stichst - 0.2 && t < T.also;
  const handD = dirTmp.set(0, 0, 1).applyQuaternion(hand.group.quaternion);

  // ---- egg: where is it?
  const held = t < 0.2 || (t >= GRAB && t < T.stichst);
  const onPlate = t >= T.stichst;
  egg.visible = !(onPlate && t >= BOOM + 0.03);
  if (held) {
    egg.position
      .copy(hand.group.position)
      .addScaledVector(handD, HOLD)
      .add(V(0, -0.3, 0));
    egg.rotation.y = 0.4;
  } else if (onPlate) {
    egg.position.copy(EGG_PLATE);
    egg.rotation.y = 0.35;
  } else {
    egg.position.copy(EGG_MW);
    egg.rotation.y = 0.4 + MW.plate.rotation.y;
  }
  // "Trotzdem ist es jetzt eine Bombe": glows from within, trembles
  const bomb = pop(t, T.trotzdem + 0.15, T.heizt, 0.3);
  whiteMat.emissiveIntensity = bomb * (0.18 + 0.12 * Math.sin(t * 11));
  body.position.set(Math.sin(t * 61) * 0.006 * bomb, 0, Math.cos(t * 53) * 0.006 * bomb);
  // the stab: the egg bulges a little before it bursts
  const bulge = onPlate ? smooth(ramp(t, T.stichst + 0.35, BOOM)) : 0;
  shell.scale.set(1 + 0.05 * bulge, 1 + 0.03 * bulge, 1 + 0.05 * bulge);

  // ---- x-ray
  let xr = 0;
  if (t >= T.heizt && t < T.rate) xr = smooth(ramp(t, T.heizt, T.heizt + 0.35));
  if (t >= T.reisst && t < T.tausendmal) xr = 1;
  setXray([whiteMat], xr);
  yolk.visible = xr > 0.02;
  // yolk tears at the stab
  const tear = smooth(ramp(t, T.reisst + 0.1, T.dampf));
  yolk.scale.set(1 + 0.08 * tear, 1 - 0.06 * tear, 1 + 0.08 * tear);

  // water molecules: heat from "Wasser" on, jiggle harder and redden
  const heat = t >= T.reisst ? 1 : smooth(ramp(t, T.wasser1, T.doch));
  water.visible = xr > 0.05 && t < T.dampf;
  if (water.visible) {
    WP.forEach((w, i) => {
      const a = (0.008 + 0.03 * heat) * (w.inYolk && t >= T.doch ? 0.35 : 1);
      const ph = t * w.f + w.ph;
      m4.makeTranslation(
        w.p.x + Math.sin(ph) * a,
        w.p.y + Math.cos(ph * 1.3) * a,
        w.p.z + Math.sin(ph * 0.7) * a,
      );
      water.setMatrixAt(i, m4);
      water.setColorAt(i, tmpC.copy(BLUE).lerp(RED, heat));
    });
    water.instanceMatrix.needsUpdate = true;
    water.instanceColor.needsUpdate = true;
  }
  // pockets: appear on "Doch … sperrt es ein", pulse, flash to steam at the tear
  const pk = t >= T.dampf ? 0 : t >= T.reisst ? 1 : t >= T.doch && t < T.rate ? 1 : 0;
  pockets.forEach((p) => {
    const s = pop(t, T.doch + 0.3 + p.userData.at, T.rate) + (t >= T.reisst && t < T.dampf ? 1 : 0);
    const k = Math.min(1, s) * pk * (xr > 0.05 ? 1 : 0);
    const pulse =
      1 + 0.25 * Math.sin(t * 8 + p.userData.ph) * smooth(ramp(t, T.taschen, T.taschen + 0.4));
    const grow = 1 + 1.4 * tear;
    p.visible = k > 0.01;
    p.scale.setScalar(p.userData.s * k * pulse * grow);
  });
  pocketMat.color.set(0xff7a2a).lerp(new THREE.Color(0xffffff), tear);
  steamIn.forEach((m, i) => {
    const u = ramp(t, T.dampf, T.dampf + 0.5 + i * 0.03);
    m.visible = t >= T.dampf && t < T.tausendmal && xr > 0.05;
    m.scale.setScalar(0.05 + easeOut(u) * (0.22 + (i % 3) * 0.05));
    m.material.opacity = 0.75 - 0.25 * u;
  });
  animateArrows(waves, t, pop(t, T.heizt + 0.15, T.tief));
  animateArrows(press, t, t >= T.taschen + 0.2 && t < T.rate ? pop(t, T.taschen + 0.2, T.rate) : 0);

  // ---- the burst on the plate (+ splats on the lens), the lab egg
  if (t < T.also) drawBurst(t, BOOM, EGG_PLATE, B1, PLATE.y + 0.02, T.also);
  else drawBurst(t, BOOM2, labEgg.position, B2, BOARD.y, 1e9);
  puff("boom", t, BOOM, EGG_PLATE.x, EGG_PLATE.y, EGG_PLATE.z, 2.2);
  splat.style.opacity = String(pop(t, BOOM + 0.22, T.also, 0.12));
  splat.style.transform = `translateY(${Math.max(0, t - BOOM - 0.22) * 40}px)`;

  // sliced egg (the safe way) + harmless wisps
  slices.visible = t >= T.also && t < T.fakt;
  wisps.forEach((m, i) => {
    const u = (t * 0.45 + i / 7) % 1;
    const k = slices.visible ? 1 : 0;
    m.position.set(
      slices.position.x - 0.9 + (i % 5) * 0.42 + Math.sin(t + i) * 0.08,
      slices.position.y + 0.2 + u * 1.4,
      slices.position.z + Math.cos(i) * 0.1,
    );
    m.scale.setScalar(0.06 + u * 0.18);
    m.material.opacity = k * 0.35 * Math.sin(Math.PI * u);
  });

  // analogy: drop → steam cloud
  const an = t >= T.tausendmal && t < T.knallt2;
  drop.visible = an;
  cloud.visible = an;
  const grow = outBack(ramp(t, T.tausendmal + 0.15, T.tausendmal + 0.9));
  cloud.scale.setScalar(Math.max(0.001, grow * (1 + 0.03 * Math.sin(t * 3))));
  cloud.rotation.y = t * 0.3;

  // lab egg + needle + sound rings
  labEgg.visible = t < BOOM2 + 0.03;
  labEgg.position.x = BOARD.x + Math.sin(t * 70) * 0.008 * ramp(t, T.fakt, BOOM2);
  needle.visible = t >= T.fakt - 0.5 && t < T.schon;
  const nd = smooth(ramp(t, T.press - 0.35, BOOM2));
  needle.position.set(
    BOARD.x + 0.05,
    BOARD.y + 2 * RX + 0.8 - 0.75 * nd + (t > BOOM2 ? ramp(t, BOOM2, BOOM2 + 0.3) * 0.8 : 0),
    BOARD.z,
  );
  puff("lab", t, BOOM2, BOARD.x, BOARD.y + RX, BOARD.z, 2.0);
  rings.forEach((m, i) => {
    const u = ramp(t, BOOM2 + i * 0.16, BOOM2 + i * 0.16 + 1.1);
    m.visible = u > 0 && u < 1;
    m.position.set(BOARD.x, BOARD.y + RX, BOARD.z);
    m.scale.setScalar(0.3 + easeOut(u) * 3.2);
    m.material.opacity = 0.9 * (1 - u);
  });

  // ---- panels / displays (one at a time)
  showNope(pop(t, T.meistens, T.stichst), 0.6, 2.0, 4.0, 0.9);
  gauge("temp", t >= T.heisser - 0.1 && t < T.rate ? pop(t, T.heisser - 0.1, T.rate) : 0, {
    label: "WASSER IM EI",
    value: lerp(70, 112, smooth(ramp(t, T.heisser, T.doch))),
    max: 150,
    unit: "°C",
  });
  gauge("db", t >= T.labor && t < 99 ? pop(t, T.labor, 99) : 0, {
    label: "LAUTSTÄRKE",
    value: t < BOOM2 ? 35 : lerp(35, 133, easeOut(ramp(t, BOOM2, BOOM2 + 0.45))),
    max: 150,
    unit: "dB",
    color: "#ff4b2b",
  });
  if (t >= T.tausendmal && t < T.knallt2)
    showPanel(pop(t, T.tausendmal + 0.1, T.knallt2), "DAMPF", "1.700×", LED.yellow);
  else if (t >= T.also && t < T.fakt)
    showPanel(pop(t, T.also + 0.1, T.fakt), "SICHER", "IN STÜCKE", LED.green);
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
