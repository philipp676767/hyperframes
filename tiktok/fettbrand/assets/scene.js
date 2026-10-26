// #35 Fettbrand: what happens when you pour water into burning fat.
// Kitchen (origin): the pan on the hob, your hand with a glass, the phone,
// later the fireball up to the ceiling, the knob, the lid and the
// fat-fire extinguisher. CUT: a giant cross-section of the pan in a dark lab
// box — the drop sinks to the hot bottom, bursts into steam, the steam rips
// the burning oil up into a spray of droplets that all ignite. TUBS: the
// litre bottle that turns into 1,700 litres of steam = ten bathtubs.
import {
  THREE,
  ramp,
  smooth,
  easeInOut,
  pop,
  lerp,
  clamp01,
  V,
  rng,
  scene,
  flat,
  M,
  showNope,
  showPanel,
  LED,
  labels,
  squash,
  puff,
  makeArrowSet,
  animateArrows,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { CEIL } from "./set.js";
import { createHand } from "./hand.js";
import { gauge, counter } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS, CUT, TUBS } from "./beats.js";

highlights(HIGHLIGHTS);

// ---------------------------------------------------------------- helpers
function canvasTex(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return { c, g: c.getContext("2d"), tex, key: "" };
}
const shadow = (o) =>
  o.traverse((m) => {
    if (m.isMesh) m.castShadow = m.receiveShadow = true;
  });
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();
const _p = new THREE.Vector3();
const _c = new THREE.Color();

// flame look shared by every fire: unlit, bright, a little see-through
const flameOuter = new THREE.MeshBasicMaterial({
  color: 0xff5a14,
  transparent: true,
  opacity: 0.78,
});
const flameInner = new THREE.MeshBasicMaterial({
  color: 0xffd23f,
  transparent: true,
  opacity: 0.95,
});
const flameCore = new THREE.MeshBasicMaterial({ color: 0xfff4c8 });
// a flame = three nested faceted cones; returns { g, set(h, k, t) }
function makeFlame(seed) {
  const g = new THREE.Group();
  const o = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1, 6), flameOuter);
  const i = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.7, 6), flameInner);
  const c = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.38, 5), flameCore);
  for (const m of [o, i, c]) {
    m.geometry.translate(0, 0.5, 0);
    m.userData.noAO = true;
    g.add(m);
  }
  i.position.y = 0.02;
  c.position.y = 0.03;
  const ph = seed * 1.7;
  return {
    g,
    // h = height in units, k = 0..1 visibility
    set(h, k, t) {
      const flick = 0.75 + 0.25 * Math.sin(t * 13 + ph) * Math.sin(t * 7.3 + ph * 2.1);
      const hh = Math.max(0.001, h * flick * k);
      o.scale.set(k + 0.001, hh, k + 0.001);
      i.scale.set(k + 0.001, hh * 0.95, k + 0.001);
      c.scale.set(k + 0.001, hh * 0.85, k + 0.001);
      g.rotation.z = Math.sin(t * 5 + ph) * 0.12;
      g.rotation.x = Math.sin(t * 4.1 + ph * 1.3) * 0.1;
      g.visible = k > 0.01;
    },
  };
}

// ================================================================ KITCHEN
// ---------------------------------------------------------------- hob
{
  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(5.4, 0.06, 4.8),
    new THREE.MeshStandardMaterial({ color: 0x0f1014, roughness: 0.08, metalness: 0.4 }),
  );
  glass.position.set(0, 0.0, -0.2);
  glass.receiveShadow = true;
  scene.add(glass);
  // printed rings of the four zones
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x3a3c44 });
  for (const [x, z, r] of [
    [0, 0, 1.5],
    [-1.9, -1.6, 0.7],
    [1.9, -1.6, 0.7],
    [1.9, 1.3, 0.55],
  ]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.02, 4, 48), ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(x, 0.035, z - 0.2 * (x === 0 ? 0 : 1));
    scene.add(ring);
  }
}
// the zone under the pan glows red while it is on
const zoneMat = new THREE.MeshBasicMaterial({ color: 0xff3a10, transparent: true, opacity: 0 });
const zone = new THREE.Mesh(new THREE.RingGeometry(1.3, 1.6, 48), zoneMat);
zone.rotation.x = -Math.PI / 2;
zone.position.y = 0.036;
zone.userData.noAO = true;
scene.add(zone);

// ---------------------------------------------------------------- pan
const pan = new THREE.Group();
scene.add(pan);
const castIron = flat(0x2b2d33, { roughness: 0.35, metalness: 0.55 });
{
  const prof = [
    [0, 0.03],
    [1.12, 0.03],
    [1.2, 0.08],
    [1.34, 0.52],
    [1.4, 0.55],
    [1.32, 0.56],
    [1.2, 0.14],
    [1.1, 0.1],
    [0, 0.1],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const body = new THREE.Mesh(new THREE.LatheGeometry(prof, 40), castIron);
  body.castShadow = body.receiveShadow = true;
  pan.add(body);
  // wooden handle pointing front-left
  const h = new THREE.Group();
  const stem = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.2), castIron);
  stem.position.x = 0.35;
  h.add(stem);
  const grip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.11, 1.5, 8),
    flat(0x8a5a32, { roughness: 0.6 }),
  );
  grip.rotation.z = Math.PI / 2;
  grip.position.x = 1.4;
  h.add(grip);
  h.position.set(-1.3 * Math.cos(0.55), 0.45, 1.3 * Math.sin(0.55));
  h.rotation.y = Math.PI + 0.55;
  h.rotation.z = -0.12;
  shadow(h);
  pan.add(h);
}
// the oil: a glossy golden disc that turns orange when burning
const oilMat = new THREE.MeshStandardMaterial({
  color: 0xe8a62a,
  roughness: 0.12,
  metalness: 0.1,
  emissive: 0xff7a10,
  emissiveIntensity: 0.1,
});
const oil = new THREE.Mesh(new THREE.CylinderGeometry(1.22, 1.22, 0.04, 40), oilMat);
oil.position.y = 0.3;
oil.receiveShadow = true;
pan.add(oil);
// fries lying in the oil
const friesMat = flat(0xf2c14a, { roughness: 0.6 });
const fries = new THREE.Group();
{
  const rf = rng(8);
  for (let i = 0; i < 16; i++) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.11, 0.62 + rf() * 0.25), friesMat);
    const a = rf() * Math.PI * 2;
    const d = Math.sqrt(rf()) * 0.85;
    f.position.set(Math.cos(a) * d, 0.33 + (i % 3) * 0.035, Math.sin(a) * d);
    f.rotation.set(rf() * 0.3, rf() * Math.PI, rf() * 0.3);
    f.castShadow = true;
    fries.add(f);
  }
  pan.add(fries);
}
// sizzle bubbles on the oil
const NBUB = 60;
const bubbles = new THREE.InstancedMesh(
  new THREE.SphereGeometry(0.05, 6, 4),
  new THREE.MeshStandardMaterial({
    color: 0xfff1c8,
    roughness: 0.1,
    transparent: true,
    opacity: 0.8,
  }),
  NBUB,
);
bubbles.userData.noAO = true;
pan.add(bubbles);
const bubSeeds = (() => {
  const rb = rng(12);
  return Array.from({ length: NBUB }, () => [
    rb() * Math.PI * 2,
    Math.sqrt(rb()) * 1.1,
    rb(),
    1.5 + rb() * 2,
  ]);
})();
// pan flames
const PF = [];
{
  const rf = rng(21);
  for (let i = 0; i < 22; i++) {
    const fl = makeFlame(i);
    const a = rf() * Math.PI * 2;
    const d = i < 5 ? rf() * 0.35 : 0.3 + Math.sqrt(rf()) * 0.8;
    fl.g.position.set(Math.cos(a) * d, 0.32, Math.sin(a) * d);
    pan.add(fl.g);
    // the middle flames are the tall ones
    PF.push({ fl, h: (1.0 - d * 0.55) * (1.6 + rf() * 0.9), seed: i });
  }
}
const fireLight = new THREE.PointLight(0xff7a20, 0, 18, 1.3);
fireLight.position.set(0, 1.6, 0.3);
scene.add(fireLight);
// smoke puffs rising from the pan
const NSM = 26;
const smokeMat = new THREE.MeshStandardMaterial({
  color: 0x6c6670,
  roughness: 1,
  transparent: true,
  opacity: 0.5,
  depthWrite: false,
});
const smoke = [];
for (let i = 0; i < NSM; i++) {
  const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 1), smokeMat.clone());
  s.userData.noAO = true;
  scene.add(s);
  smoke.push(s);
}

// ---------------------------------------------------------------- glass + water
const GLASS_HOME = V(2.6, 0, 1.7);
const glassGrp = new THREE.Group();
{
  const shell = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.3, 0.92, 20, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0xdff4ff,
      roughness: 0.05,
      metalness: 0.1,
      transparent: true,
      opacity: 0.32,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  shell.position.y = 0.46;
  shell.userData.noAO = true;
  glassGrp.add(shell);
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.34, 0.018, 4, 24),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      transparent: true,
      opacity: 0.7,
    }),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.92;
  glassGrp.add(rim);
  const bottom = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.06, 20),
    new THREE.MeshStandardMaterial({
      color: 0xdff4ff,
      roughness: 0.05,
      transparent: true,
      opacity: 0.6,
    }),
  );
  bottom.position.y = 0.03;
  glassGrp.add(bottom);
}
// "nur ein Schluck": a low water level
const waterMat = new THREE.MeshStandardMaterial({
  color: 0x4fb8ff,
  roughness: 0.05,
  metalness: 0.1,
  transparent: true,
  opacity: 0.85,
  emissive: 0x1a5aa0,
  emissiveIntensity: 0.25,
});
const glassWater = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.22, 20), waterMat);
glassWater.position.y = 0.17;
glassGrp.add(glassWater);
scene.add(glassGrp);
// the flying gulp (kitchen)
const blob = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 10), waterMat);
blob.castShadow = true;
scene.add(blob);
const splashRing = new THREE.Mesh(
  new THREE.TorusGeometry(0.3, 0.035, 6, 24),
  new THREE.MeshBasicMaterial({ color: 0xfff1c8, transparent: true, opacity: 0.9 }),
);
splashRing.rotation.x = Math.PI / 2;
splashRing.userData.noAO = true;
scene.add(splashRing);

// ---------------------------------------------------------------- phone
const phoneArt = canvasTex(256, 512);
function drawPhone(on) {
  const key = String(on);
  if (key === phoneArt.key) return;
  phoneArt.key = key;
  const { g } = phoneArt;
  g.fillStyle = on ? "#1d2a52" : "#07080c";
  g.fillRect(0, 0, 256, 512);
  if (on) {
    const gr = g.createLinearGradient(0, 0, 0, 512);
    gr.addColorStop(0, "#3b4fa8");
    gr.addColorStop(1, "#c4568f");
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 512);
    g.fillStyle = "#fff";
    g.textAlign = "center";
    g.font = '800 64px "Montserrat", sans-serif';
    g.fillText("22:41", 128, 120);
    g.fillStyle = "rgba(255,255,255,.88)";
    g.beginPath();
    g.roundRect(18, 190, 220, 92, 22);
    g.fill();
    g.fillStyle = "#1c1c22";
    g.textAlign = "left";
    g.font = '800 26px "Montserrat", sans-serif';
    g.fillText("Lena", 36, 228);
    g.font = '600 24px "Montserrat", sans-serif';
    g.fillText("Kommst du noch? 🎉", 36, 262);
  }
  phoneArt.tex.needsUpdate = true;
}
const phone = new THREE.Group();
{
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.07, 1.2),
    flat(0x1c1c22, { roughness: 0.3, metalness: 0.4 }),
  );
  body.castShadow = true;
  phone.add(body);
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.56, 1.12),
    new THREE.MeshBasicMaterial({ map: phoneArt.tex }),
  );
  screen.rotation.x = -Math.PI / 2;
  screen.position.y = 0.037;
  phone.add(screen);
  phone.position.set(3.5, 0.04, 0.9);
  phone.rotation.y = -0.35;
  scene.add(phone);
}
const phoneGlow = new THREE.PointLight(0x8fa0ff, 0, 3, 1.6);
phoneGlow.position.set(3.5, 0.6, 0.9);
scene.add(phoneGlow);

// ---------------------------------------------------------------- knobs
const knobs = [];
for (const x of [-1.8, -0.6, 0.6, 1.8]) {
  const k = new THREE.Group();
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.22, 0.22, 14),
    flat(0xd8dce2, { metalness: 0.6, roughness: 0.3 }),
  );
  cap.rotation.x = Math.PI / 2;
  k.add(cap);
  const mark = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.18, 0.03), flat(0x1c1c22));
  mark.position.set(0, 0.08, 0.12);
  k.add(mark);
  k.position.set(x, -0.45, 3.13);
  shadow(k);
  scene.add(k);
  knobs.push(k);
}
const KNOB = knobs[2]; // the pan's zone

// ---------------------------------------------------------------- lid
const lid = new THREE.Group();
{
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(1.5, 32, 10, 0, Math.PI * 2, 0, 0.6),
    new THREE.MeshStandardMaterial({
      color: 0xdfeeff,
      roughness: 0.05,
      metalness: 0.2,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  dome.position.y = -1.24;
  dome.userData.noAO = true;
  lid.add(dome);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.42, 0.05, 6, 40), M.chrome);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = -0.04;
  lid.add(rim);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 6), flat(0x1c1c22));
  knob.scale.y = 0.7;
  knob.position.y = 0.32;
  lid.add(knob);
  shadow(lid);
  scene.add(lid);
}

// ---------------------------------------------------------------- extinguisher (Übrigens)
const extArt = canvasTex(256, 384);
{
  const { g } = extArt;
  const draw = () => {
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, 256, 384);
    g.fillStyle = "#e8261b";
    g.fillRect(0, 0, 256, 50);
    g.fillStyle = "#fff";
    g.textAlign = "center";
    g.font = '800 34px "Montserrat", sans-serif';
    g.fillText("FETTBRAND", 128, 38);
    g.fillStyle = "#1c1c22";
    g.font = '800 250px "Montserrat", sans-serif';
    g.fillText("F", 128, 300);
    g.fillStyle = "#e8261b";
    g.fillRect(0, 334, 256, 50);
    extArt.tex.needsUpdate = true;
  };
  draw();
  document.fonts.load('800 250px "Montserrat"').then(draw);
}
const ext = new THREE.Group();
{
  const red = flat(0xe0261b, { roughness: 0.3, metalness: 0.2 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2.0, 24), red);
  body.position.y = 1.0;
  ext.add(body);
  const top = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 24, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    red,
  );
  top.position.y = 2.0;
  ext.add(top);
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.4, 10), flat(0x1c1c22));
  head.position.y = 2.6;
  ext.add(head);
  const lever = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.16), M.chrome);
  lever.position.set(0.2, 2.82, 0);
  lever.rotation.z = 0.2;
  ext.add(lever);
  const hose = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        V(0, 2.65, -0.1),
        V(0.45, 2.4, -0.35),
        V(0.6, 1.4, -0.45),
        V(0.55, 0.9, -0.5),
      ]),
      20,
      0.06,
      6,
    ),
    flat(0x1c1c22),
  );
  ext.add(hose);
  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(0.505, 0.505, 1.15, 24, 1, true, -0.9, 1.8),
    new THREE.MeshStandardMaterial({ map: extArt.tex, roughness: 0.4 }),
  );
  label.position.y = 1.05;
  ext.add(label);
  shadow(ext);
  ext.position.set(3.4, 0, -1.0);
  ext.rotation.y = 0.45;
  scene.add(ext);
}

// ---------------------------------------------------------------- kitchen fireball
const NFB = 70;
const fbMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const fireball = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.5, 1), fbMat, NFB);
fireball.userData.noAO = true;
scene.add(fireball);
const fbSeeds = (() => {
  const rb = rng(31);
  return Array.from({ length: NFB }, () => ({
    a: rb() * Math.PI * 2,
    r: rb(),
    d: rb() * 0.5, // delay
    s: 0.7 + rb() * 0.9,
    h: rb(),
  }));
})();
const FB_COL = [
  new THREE.Color(0xfff2b0),
  new THREE.Color(0xffc23a),
  new THREE.Color(0xff6a1a),
  new THREE.Color(0xc8321a),
];
const fbColor = (h, k) => {
  // h 0 = core (white-yellow) … 1 = edge (dark red); k darkens as it ages
  const x = clamp01(h * 0.75 + k * 0.5) * 3;
  const i = Math.min(2, Math.floor(x));
  return _c.copy(FB_COL[i]).lerp(FB_COL[i + 1], x - i);
};
const fbLight = new THREE.PointLight(0xff8a2a, 0, 40, 1.2);
fbLight.position.set(0, 4, 0.5);
scene.add(fbLight);

// ---------------------------------------------------------------- hands
const hand = createHand({ scale: 1.5, sleeve: 0x3a6fd6 });
hand.group.rotation.order = "YXZ";
const hand2 = createHand({ scale: 1.5, sleeve: 0x3a6fd6 });
hand2.group.rotation.order = "YXZ";
const GLASS_IN_HAND = V(0, -0.62, 0.34); // hand-local spot of the glass foot… under the curled fingers
const YAW = -Math.PI / 2; // fingers along −x: pointing at the pan from the right

// ================================================================ CUT: the cross-section
const cutW = new THREE.Group();
cutW.position.set(...CUT);
scene.add(cutW);
const R = 4.2; // inner radius of the giant pan
const OIL0 = 0.95; // oil bottom (= pan floor)
const OIL1 = 2.45; // oil top
{
  const room = new THREE.Mesh(
    new THREE.BoxGeometry(70, 34, 70),
    new THREE.MeshBasicMaterial({ color: 0x0c0a1a, side: THREE.BackSide, fog: false }),
  );
  room.position.y = 14;
  cutW.add(room);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(70, 70),
    new THREE.MeshStandardMaterial({ color: 0x171428, roughness: 0.5, metalness: 0.2 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  cutW.add(floor);
  const grid = new THREE.GridHelper(70, 70, 0x4a2a5a, 0x2a1a3a);
  grid.position.y = 0.01;
  cutW.add(grid);
  const warm = new THREE.PointLight(0xffe2c0, 70, 34, 1.4);
  warm.position.set(2, 11, 7);
  cutW.add(warm);
  const cyan = new THREE.PointLight(0x4fc3ff, 26, 24, 1.5);
  cyan.position.set(-9, 4, 3);
  cutW.add(cyan);
  const mag = new THREE.PointLight(0xc65bff, 22, 24, 1.5);
  mag.position.set(9, 4, 3);
  cutW.add(mag);
  // the hob: a dark glass slab, a glowing red coil under the pan floor
  const hob = new THREE.Mesh(
    new THREE.BoxGeometry(12, 0.6, 6),
    new THREE.MeshStandardMaterial({ color: 0x0f1014, roughness: 0.1, metalness: 0.4 }),
  );
  hob.position.set(0, 0.3, -2.8);
  hob.castShadow = hob.receiveShadow = true;
  cutW.add(hob);
  // pan: back half (lathe), its walls and floor cut open toward the camera
  const prof = [
    [0, OIL0 - 0.35],
    [R + 0.05, OIL0 - 0.35],
    [R + 0.3, OIL0 - 0.1],
    [R + 0.3, OIL1 + 0.9],
    [R, OIL1 + 0.9],
    [R, OIL0],
    [0, OIL0],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const shell = new THREE.Mesh(
    new THREE.LatheGeometry(prof, 48, Math.PI / 2, Math.PI),
    flat(0x3a3d46, { roughness: 0.4, metalness: 0.5, side: THREE.DoubleSide }),
  );
  shell.castShadow = shell.receiveShadow = true;
  cutW.add(shell);
  // the cut faces (a little lighter, with a red-hot edge on the floor)
  const cutMat = flat(0x5a5e6a, { roughness: 0.5, metalness: 0.3 });
  const faceBox = (w, h, x, y) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.06), cutMat);
    m.position.set(x, y, 0.0);
    m.castShadow = true;
    cutW.add(m);
  };
  faceBox(0.3, OIL1 + 0.9 - (OIL0 - 0.1), R + 0.15, (OIL1 + 0.9 + OIL0 - 0.1) / 2);
  faceBox(0.3, OIL1 + 0.9 - (OIL0 - 0.1), -R - 0.15, (OIL1 + 0.9 + OIL0 - 0.1) / 2);
  faceBox(2 * R + 0.6, 0.35, 0, OIL0 - 0.175);
}
// the hot floor: glows red, heat waves rise from it
const hotMat = new THREE.MeshBasicMaterial({ color: 0xff3a10, transparent: true, opacity: 0.7 });
const hotStrip = new THREE.Mesh(new THREE.BoxGeometry(2 * R, 0.08, 0.1), hotMat);
hotStrip.position.set(0, OIL0 - 0.3, 0.05);
hotStrip.userData.noAO = true;
cutW.add(hotStrip);
const coil = new THREE.Mesh(
  new THREE.TorusGeometry(2.6, 0.12, 6, 48),
  new THREE.MeshBasicMaterial({ color: 0xff3a10 }),
);
coil.rotation.x = Math.PI / 2;
coil.scale.set(1, 0.5, 1);
coil.position.set(0, 0.62, -1.6);
cutW.add(coil);
const heatUp = makeArrowSet(
  [
    [V(-2.4, OIL0 + 0.05, 0.3), V(-2.2, OIL0 + 1.2, 0.3)],
    [V(-0.9, OIL0 + 0.05, 0.3), V(-1.0, OIL0 + 1.3, 0.3)],
    [V(1.6, OIL0 + 0.05, 0.3), V(1.8, OIL0 + 1.2, 0.3)],
    [V(3.0, OIL0 + 0.05, 0.3), V(2.9, OIL0 + 1.1, 0.3)],
  ],
  { parent: cutW },
);
// the oil: back half cylinder + the cut face
const cutOilMat = new THREE.MeshStandardMaterial({
  color: 0xf0a830,
  roughness: 0.15,
  emissive: 0x9a4a00,
  emissiveIntensity: 0.45,
  transparent: true,
  opacity: 0.72,
  depthWrite: false,
  side: THREE.DoubleSide,
});
{
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(R, R, OIL1 - OIL0, 48, 1, false, Math.PI / 2, Math.PI),
    cutOilMat,
  );
  body.position.y = (OIL0 + OIL1) / 2;
  body.userData.noAO = true;
  cutW.add(body);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(2 * R, OIL1 - OIL0), cutOilMat);
  face.position.set(0, (OIL0 + OIL1) / 2, 0.0);
  face.userData.noAO = true;
  cutW.add(face);
  // the surface line glints
  const line = new THREE.Mesh(
    new THREE.BoxGeometry(2 * R, 0.05, 0.05),
    new THREE.MeshBasicMaterial({ color: 0xffe08a }),
  );
  line.position.set(0, OIL1, 0.03);
  cutW.add(line);
}
// flames on the burning oil top
const CF = [];
{
  const rf = rng(41);
  for (let i = 0; i < 30; i++) {
    const fl = makeFlame(100 + i);
    const x = -R + 0.4 + rf() * (2 * R - 0.8);
    const z = -rf() * (R - 0.6);
    fl.g.position.set(x, OIL1, z * Math.sqrt(1 - (x / R) ** 2));
    fl.g.scale.setScalar(2.6);
    cutW.add(fl.g);
    CF.push({ fl, h: 0.7 + rf() * 0.6 });
  }
}
// the water drop
const DROP_R = 0.42;
const dropMat = new THREE.MeshStandardMaterial({
  color: 0x4fb8ff,
  roughness: 0.05,
  metalness: 0.1,
  emissive: 0x1a5aa0,
  emissiveIntensity: 0.4,
});
const drop = new THREE.Mesh(new THREE.SphereGeometry(DROP_R, 20, 14), dropMat);
drop.castShadow = true;
cutW.add(drop);
// tiny boiling bubbles around the drop
const NDB = 18;
const dropBub = new THREE.InstancedMesh(
  new THREE.SphereGeometry(0.06, 6, 4),
  new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 }),
  NDB,
);
dropBub.userData.noAO = true;
cutW.add(dropBub);
// the steam: a blast bubble, then a rising column of puffs
const steamMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 1,
  transparent: true,
  opacity: 0.85,
  emissive: 0x8fa8c8,
  emissiveIntensity: 0.25,
  depthWrite: false,
});
const NST = 40;
const steam = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.5, 1), steamMat, NST);
steam.userData.noAO = true;
cutW.add(steam);
const stSeeds = (() => {
  const rs = rng(52);
  return Array.from({ length: NST }, () => [rs() * Math.PI * 2, rs(), rs(), 0.6 + rs() * 0.8]);
})();
// the oil the steam rips up, then the spray of droplets that all ignite
const NDR = 420;
const dropletMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const droplets = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.11, 0), dropletMat, NDR);
droplets.userData.noAO = true;
cutW.add(droplets);
const drSeeds = (() => {
  const rd = rng(63);
  return Array.from({ length: NDR }, (_, i) => {
    // a direction on the upper half sphere, a speed, an ignition delay
    const a = rd() * Math.PI * 2;
    const up = 0.25 + rd() * 0.75;
    return {
      dir: V(Math.cos(a) * (1 - up * 0.6), up, Math.sin(a) * (1 - up * 0.6) * 0.7),
      sp: 2.2 + rd() * 3.6,
      ign: rd() * 1.2,
      sz: 0.6 + rd() * 1.0,
      col: rd(),
      i,
    };
  });
})();
const OIL_GOLD = new THREE.Color(0xf2b33a);
const cutFireLight = new THREE.PointLight(0xff7a20, 0, 30, 1.2);
cutFireLight.position.set(0, 7, 2);
cutW.add(cutFireLight);
// the ball of burning droplets (Fettexplosion): reuses fireball blobs
const cutBall = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.9, 1), fbMat, 50);
cutBall.userData.noAO = true;
cutW.add(cutBall);

// ================================================================ TUBS: 1 litre → 1,700 litres
const tubW = new THREE.Group();
tubW.position.set(...TUBS);
scene.add(tubW);
{
  const room = new THREE.Mesh(
    new THREE.BoxGeometry(80, 34, 80),
    new THREE.MeshBasicMaterial({ color: 0x0a1424, side: THREE.BackSide, fog: false }),
  );
  room.position.y = 14;
  tubW.add(room);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80),
    new THREE.MeshStandardMaterial({ color: 0x14243a, roughness: 0.25, metalness: 0.4 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  tubW.add(floor);
  const grid = new THREE.GridHelper(80, 80, 0x2a5a8a, 0x1a3a5a);
  grid.position.y = 0.01;
  tubW.add(grid);
  const warm = new THREE.PointLight(0xfff0e0, 90, 40, 1.3);
  warm.position.set(2, 12, 8);
  tubW.add(warm);
  const cyan = new THREE.PointLight(0x4fc3ff, 30, 30, 1.4);
  cyan.position.set(-10, 5, 0);
  tubW.add(cyan);
}
// the litre bottle
const bottle = new THREE.Group();
{
  const shell = new THREE.Mesh(
    new THREE.LatheGeometry(
      [
        [0, 0],
        [0.42, 0],
        [0.46, 0.08],
        [0.46, 1.15],
        [0.3, 1.45],
        [0.15, 1.55],
        [0.15, 1.7],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
      24,
    ),
    new THREE.MeshStandardMaterial({
      color: 0xdff4ff,
      roughness: 0.05,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  shell.userData.noAO = true;
  bottle.add(shell);
  const water = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 1.05, 24), waterMat);
  water.position.y = 0.58;
  bottle.add(water);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.16, 12), flat(0x2f6fd6));
  cap.position.y = 1.76;
  bottle.add(cap);
  const lab = canvasTex(256, 96);
  const drawLab = () => {
    lab.g.fillStyle = "#ffffff";
    lab.g.fillRect(0, 0, 256, 96);
    lab.g.fillStyle = "#2f6fd6";
    lab.g.textAlign = "center";
    lab.g.font = '800 64px "Montserrat", sans-serif';
    lab.g.fillText("1 LITER", 128, 72);
    lab.tex.needsUpdate = true;
  };
  drawLab();
  document.fonts.load('800 64px "Montserrat"').then(drawLab);
  const band = new THREE.Mesh(
    new THREE.CylinderGeometry(0.47, 0.47, 0.42, 24, 1, true, -1.2, 2.4),
    new THREE.MeshStandardMaterial({ map: lab.tex, roughness: 0.5 }),
  );
  band.position.y = 0.6;
  bottle.add(band);
  shadow(bottle);
  bottle.scale.setScalar(1.3);
  bottle.rotation.y = 0.42;
  tubW.add(bottle);
}
// the steam cloud that comes out of it
const NCL = 46;
const cloud = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.7, 1), steamMat, NCL);
cloud.userData.noAO = true;
tubW.add(cloud);
const clSeeds = (() => {
  const rc = rng(71);
  return Array.from({ length: NCL }, () => [rc() * Math.PI * 2, rc(), rc(), 0.6 + rc() * 0.9]);
})();
// ten bathtubs, two rows of five behind the bottle, full of steam
const TUB_POS = [];
for (let row = 0; row < 2; row++)
  for (let c = 0; c < 5; c++) TUB_POS.push([-6.4 + c * 3.2, -3.2 - row * 3.4]);
const tubs = TUB_POS.map(([x, z], i) => {
  const g = new THREE.Group();
  const white = flat(0xf7f5f0, { roughness: 0.3 });
  const outer = new THREE.Mesh(new THREE.CapsuleGeometry(0.62, 1.3, 4, 12), white);
  outer.rotation.z = Math.PI / 2;
  outer.scale.set(1, 1, 1.05);
  outer.position.y = 0.85;
  g.add(outer);
  // flat top: the steam surface
  const top = new THREE.Mesh(new THREE.CapsuleGeometry(0.5, 1.2, 4, 12), steamMat);
  top.rotation.z = Math.PI / 2;
  top.scale.set(0.3, 1, 1);
  top.position.y = 1.36;
  g.add(top);
  for (const [fx, fz] of [
    [-0.8, -0.4],
    [0.8, -0.4],
    [-0.8, 0.4],
    [0.8, 0.4],
  ]) {
    const foot = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 8, 6),
      flat(0xd9a441, { metalness: 0.7, roughness: 0.3 }),
    );
    foot.position.set(fx, 0.12, fz);
    g.add(foot);
  }
  // steam puffs above
  const puffs = [];
  for (let k = 0; k < 4; k++) {
    const p = new THREE.Mesh(new THREE.IcosahedronGeometry(0.45, 1), steamMat);
    p.userData.noAO = true;
    g.add(p);
    puffs.push(p);
  }
  shadow(g);
  g.position.set(x, 0, z);
  tubW.add(g);
  return { g, puffs, i };
});

// ================================================================ timeline helpers
// fire on the kitchen pan: 0 off, 1 burning, >1 boiling up
function panFire(t) {
  if (t < T.abends) return 1;
  if (t < T.feuer1) return 0;
  if (t < T.das5) return 1 + 0.5 * Math.exp(-(t - T.feuer1 - 0.05) * 3) * (t > T.feuer1 ? 1 : 0);
  if (t < T.darum) return 1 + 0.6 * smooth(ramp(t, T.das5, T.feuerball));
  const lidK = smooth(ramp(t, slowLid(), slowLid() + 0.35));
  return 1 - lidK;
}
const LID_DOWN = T.deckel + 0.38; // the lid sits on the pan
const slowLid = () => LID_DOWN;
// smoke amount
function panSmoke(t) {
  if (t < T.abends) return 0.7;
  if (t < T.das2) return 0.1;
  if (t < T.feuer1) return 0.1 + 0.9 * smooth(ramp(t, T.das2, T.feuer1 - 0.2));
  if (t < T.darum) return 0.7;
  if (t < LID_DOWN) return 0.6;
  return 0.35 * (1 - ramp(t, T.fakt, T.fakt + 2));
}

// ================================================================ render
const applyCamera = shotCamera(shots);

function renderAt(t) {
  const inCut = (t >= T.schwimmt && t < T.rate) || (t >= T.alles && t < T.das5);
  const inTubs = t >= T.rate && t < T.alles;

  // ------------------------------------------------ kitchen: fire, oil, smoke
  const fire = panFire(t);
  const burning = fire > 0.02;
  PF.forEach(({ fl, h }, i) => fl.set(h * fire, Math.min(1, fire * 1.2), t + i * 0.37));
  oilMat.emissiveIntensity = 0.1 + 0.9 * Math.min(1, fire);
  oilMat.color.setHex(burning ? 0xd8801a : 0xe8a62a);
  friesMat.color.setHex(burning ? 0x6a3a14 : 0xf2c14a);
  fireLight.intensity = 26 * Math.min(1.6, fire) * (0.85 + 0.15 * Math.sin(t * 17));
  // hob zone: on until "Herd aus"
  const hobOn = 1 - smooth(ramp(t, T.herd + 0.35, T.herd + 1.2));
  zoneMat.opacity = 0.75 * hobOn;
  KNOB.rotation.z = -1.9 * (1 - smooth(ramp(t, T.herd + 0.15, T.herd + 0.4)));
  // sizzle bubbles while frying (and boiling under the fire)
  const sizzle = t >= T.abends && t < T.feuer1 ? 1 : burning ? 0.6 : 0;
  bubSeeds.forEach(([a, d, ph, sp], i) => {
    const f = (t * sp + ph) % 1;
    const k = sizzle * Math.sin(f * Math.PI);
    _p.set(Math.cos(a) * d, 0.33, Math.sin(a) * d);
    _s.setScalar(Math.max(0.001, k * (0.6 + f)));
    _m.compose(_p, _q.identity(), _s);
    bubbles.setMatrixAt(i, _m);
  });
  bubbles.instanceMatrix.needsUpdate = true;
  // smoke
  const sm = panSmoke(t);
  smoke.forEach((s, i) => {
    const f = (t * 0.32 + i / NSM) % 1;
    const a = i * 2.4;
    s.position.set(
      Math.cos(a) * 0.5 * (1 - f) + Math.sin(t * 0.7 + i) * f * 0.8,
      0.5 + f * (burning ? 6.5 : 4.5) + (burning ? 1.2 : 0),
      Math.sin(a) * 0.4 * (1 - f) - f * 1.2,
    );
    s.scale.setScalar(0.4 + f * 1.5);
    s.material.opacity = sm * 0.3 * Math.sin(f * Math.PI);
    s.material.color.setHex(burning ? 0x3c383e : 0x8a8490);
    s.visible = sm > 0.01;
  });

  // ------------------------------------------------ glass, hand
  // hook: the hand holds the glass over the burning pan, tilting more
  const throwT0 = T.der1; // scene time (slow motion from here)
  hand.track(t, [
    { t: -0.6, pos: [2.6, 2.3, 0.9], rot: [0.15, YAW, 0], pose: "grab" },
    { t: 0, pos: [2.25, 2.1, 0.7], rot: [0.25, YAW, 0], pose: "grab" },
    { t: T.wasser1, pos: [1.95, 2.0, 0.55], rot: [0.55, YAW, 0], pose: "grab" },
    { t: T.vorweg, pos: [1.85, 1.95, 0.5], rot: [0.75, YAW, 0], pose: "grab" },
    { t: T.niemals, pos: [2.4, 2.15, 0.7], rot: [0.15, YAW, 0], pose: "grab" },
    { t: T.die1, pos: [3.6, 2.5, 1.3], rot: [0.1, YAW, 0], pose: "grab", out: true },
    // "du greifst zum Glas": in from the right, grab, lift over the pan
    { t: T.greifst - 0.25, pos: [4.6, 1.6, 2.4], rot: [0, YAW, 0], pose: "open" },
    {
      t: T.greifst + 0.3,
      pos: [GLASS_HOME.x + 0.34, 1.07, GLASS_HOME.z],
      rot: [0, YAW, 0],
      pose: "grab",
    },
    { t: T.und1 + 0.1, pos: [2.0, 1.95, 0.6], rot: [0.2, YAW, 0], pose: "grab" },
    { t: T.abends - 0.05, pos: [1.95, 1.95, 0.55], rot: [0.3, YAW, 0], pose: "grab", out: true },
    // the throw (scene time is slowed from der1)
    { t: throwT0 - 0.01, pos: [1.95, 1.95, 0.55], rot: [0.3, YAW, 0], pose: "grab" },
    { t: throwT0 + 0.2, pos: [1.6, 1.8, 0.45], rot: [1.35, YAW, 0], pose: "grab" },
    { t: throwT0 + 0.45, pos: [1.75, 1.9, 0.5], rot: [1.2, YAW, 0], pose: "grab", out: true },
    // "Herd aus": turn the knob
    { t: T.herd - 0.3, pos: [1.6, 0.4, 5.2], rot: [0.1, Math.PI, 0], pose: "open" },
    {
      t: T.herd + 0.12,
      pos: [KNOB.position.x, -0.35, 3.72],
      rot: [0.05, Math.PI, 0.8],
      pose: "grab",
    },
    {
      t: T.herd + 0.42,
      pos: [KNOB.position.x, -0.35, 3.72],
      rot: [0.05, Math.PI, -0.6],
      pose: "grab",
    },
    {
      t: T.deckel - 0.02,
      pos: [1.8, 0.3, 5.0],
      rot: [0.1, Math.PI, -0.6],
      pose: "open",
      out: true,
    },
  ]);
  const hr = hand.group.rotation;
  hr.set(hr.x, hr.y, hr.z, "YXZ");
  hand.group.updateMatrixWorld(true);
  const glassHeld =
    (t >= -0.6 && t < T.die1) ||
    (t >= T.greifst + 0.3 && t < T.abends) ||
    (t >= throwT0 && t < throwT0 + 0.45);
  if (glassHeld) {
    _p.copy(GLASS_IN_HAND);
    hand.group.localToWorld(_p);
    glassGrp.position.copy(_p);
    glassGrp.quaternion.copy(hand.group.quaternion);
    // the glass hangs below the fingers, upright in hand space
  } else {
    glassGrp.position.copy(GLASS_HOME);
    glassGrp.quaternion.identity();
  }
  // in the CUT / TUBS / later kitchen the glass is simply where it was
  glassGrp.visible = t < T.schwimmt;
  // the water in the glass leaves with the throw
  const thrown = t >= throwT0 + 0.15 && t < T.schwimmt;
  glassWater.visible = !(t >= throwT0 + 0.15);
  // the gulp flying into the pan (scene time throwT0 + 0.15 … + 0.4)
  const fly = ramp(t, throwT0 + 0.15, throwT0 + 0.38);
  if (thrown && fly < 1) {
    const from = V(1.25, 1.75, 0.5);
    const to = V(0.05, 0.32, 0.05);
    blob.position.lerpVectors(from, to, fly);
    blob.position.y += Math.sin(fly * Math.PI) * 0.35;
    const st = 1 + 0.35 * Math.sin(fly * Math.PI * 3);
    blob.scale.set(1 / st, st, 1 / st);
    blob.visible = true;
  } else blob.visible = false;
  const ringK = ramp(t, throwT0 + 0.38, throwT0 + 0.45);
  splashRing.visible = t >= throwT0 + 0.38 && t < T.schwimmt;
  splashRing.position.set(0.05, 0.34, 0.05);
  splashRing.scale.setScalar(0.4 + ringK * 1.6);
  splashRing.material.opacity = 0.9 * (1 - ringK * 0.7);
  // "nie": orange ✕ over the glass in the hook
  showNope(pop(t, T.niemals, T.die1), 1.35, 2.15, 0.5, 0.9);

  // phone: lights up on "schaust … aufs Handy"
  const phoneOn = t >= T.schaust - 0.2 && t < T.feuer1;
  drawPhone(phoneOn);
  phoneGlow.intensity = phoneOn ? 3 : 0;

  // lid: comes in from upper right, lands on the pan
  {
    const k = smooth(ramp(t, T.deckel - 0.05, LID_DOWN));
    const show = t >= T.deckel - 0.05 && t < T.cta + 10;
    lid.visible = show;
    lid.position.set(lerp(2.4, 0, k), lerp(2.6, 0.56, k), lerp(1.4, 0, k));
    lid.rotation.z = lerp(0.5, 0, k);
    hand2.track(t, [
      { t: T.deckel - 0.06, pos: [2.4, 2.6 + 0.42, 1.4], rot: [0, YAW, -0.5], pose: "grab" },
      { t: LID_DOWN, pos: [0, 0.56 + 0.42, 0], rot: [0, YAW, 0], pose: "grab" },
      { t: LID_DOWN + 0.45, pos: [0, 0.56 + 0.42, 0], rot: [0, YAW, 0], pose: "grab" },
      { t: LID_DOWN + 0.9, pos: [1.8, 1.9, 0.8], rot: [0, YAW, 0], pose: "open", out: true },
    ]);
    const r2 = hand2.group.rotation;
    r2.set(r2.x, r2.y, r2.z, "YXZ");
  }

  // extinguisher pops in on "Übrigens"
  ext.visible = t >= T.fakt + 0.15;
  ext.scale.copy(squash(t, T.fakt + 0.15));
  puff("ext", t, T.fakt + 0.3, 3.4, 0.05, -1.0, 1.0);

  // ------------------------------------------------ kitchen fireball
  {
    const t0 = T.das5 + 0.9; // the column starts to boil up
    const life = t - t0;
    const on = life > 0 && t < T.darum;
    fireball.visible = on;
    if (on) {
      const top = CEIL - 0.7;
      fbSeeds.forEach((s, i) => {
        const x = life - s.d * 0.8;
        if (x <= 0) {
          _s.setScalar(0.001);
          _m.compose(_p.set(0, 0, 0), _q.identity(), _s);
          fireball.setMatrixAt(i, _m);
          fireball.setColorAt(i, fbColor(1, 1));
          return;
        }
        // rise fast, slow down at the ceiling, then roll outwards under it
        const rise = Math.min(1, x / 0.9);
        const y = 0.6 + (top - 0.6) * (1 - Math.pow(1 - rise, 2.2)) * (0.12 + 0.88 * s.h);
        const atCeil = clamp01((x - 0.6) / 1.6);
        const spread = (0.4 + s.r * 1.4) * (1 + 2.0 * smooth(atCeil) * (0.4 + s.h));
        _p.set(
          Math.cos(s.a) * spread,
          y + Math.sin(t * 3 + i) * 0.12,
          Math.sin(s.a) * spread * 0.7 - atCeil * 1.2,
        );
        const grow = 0.5 + 1.6 * Math.min(1, x / 0.6) + atCeil * 0.8;
        _s.setScalar(s.s * grow);
        _q.setFromEuler(new THREE.Euler(t * 0.8 + i, t * 0.6 + i * 2, 0));
        _m.compose(_p, _q, _s);
        fireball.setMatrixAt(i, _m);
        fireball.setColorAt(i, fbColor(s.r * 0.7 + (1 - s.h) * 0.2, clamp01(x / 6)));
      });
      fireball.instanceMatrix.needsUpdate = true;
      fireball.instanceColor.needsUpdate = true;
    }
    fbLight.intensity = on ? 120 * Math.min(1, life / 0.4) : 0;
  }

  // ------------------------------------------------ CUT
  cutW.visible = inCut;
  if (inCut) {
    // the drop: at the surface → sinks → sits on the hot floor → trembles
    const sinkK = smooth(ramp(t, T.schwimmt + 0.4, T.folg - 0.1));
    let dy = lerp(OIL1 - DROP_R * 0.6, OIL0 + DROP_R * 0.85, sinkK);
    let tremble = ramp(t, T.es4, T.rate) * 0.04;
    const burst = ramp(t, T.alles + 0.02, T.alles + 0.09); // scene time (slow motion)
    drop.visible = t < T.alles + 0.09;
    drop.position.set(Math.sin(t * 60) * tremble, dy + Math.cos(t * 47) * tremble, 0.05);
    const sq = 1 + (sinkK > 0.98 && t < T.alles ? 0.12 : 0) + burst * 0.8;
    drop.scale.set(sq, (1 / sq) * (1 + burst), sq);
    dropMat.emissiveIntensity = 0.4 + ramp(t, T.es4, T.rate) * 0.6;
    // tiny boiling bubbles from "keine Chance" on
    const boil = t >= T.es4 && t < T.rate ? ramp(t, T.es4, T.es4 + 0.4) : 0;
    for (let i = 0; i < NDB; i++) {
      const f = (t * 1.6 + i / NDB) % 1;
      const a = i * 2.3;
      _p.set(
        Math.cos(a) * (DROP_R + 0.05 + f * 0.2),
        OIL0 + DROP_R * 0.85 + Math.sin(a) * DROP_R * 0.8 + f * 0.7,
        0.12,
      );
      _s.setScalar(Math.max(0.001, boil * (1 - f) * 1.2));
      _m.compose(_p, _q.identity(), _s);
      dropBub.setMatrixAt(i, _m);
    }
    dropBub.instanceMatrix.needsUpdate = true;
    // hot floor glow
    const hot = 0.55 + 0.45 * smooth(ramp(t, T.rutscht, T.rutscht + 0.8));
    hotMat.opacity = hot;
    coil.material.color.setHex(0xff3a10);
    animateArrows(heatUp, t, pop(t, T.rutscht + 0.3, T.brennendes2));
    // flames on the oil top
    const blast = t >= T.alles ? smooth(ramp(t, T.der2, T.der2 + 0.8)) : 0;
    const calm = t >= T.zerplatzt ? 1 - 0.55 * smooth(ramp(t, T.zerplatzt, T.zerplatzt + 0.6)) : 1;
    CF.forEach(({ fl, h }, i) => fl.set(h * (1 + blast * 0.6) * calm, 1, t + i * 0.41));
    // steam: the blast bubble (slow motion), then the column
    {
      const s0 = T.alles + 0.07; // scene time of the burst
      const col = ramp(t, T.der2, T.zerplatzt); // the column rises
      const on = t >= s0;
      steam.visible = on;
      if (on) {
        const bubbleK = smooth(ramp(t, s0, T.alles + 0.5));
        stSeeds.forEach(([a, r, h, sz], i) => {
          let x;
          let y;
          let z;
          let sc;
          if (t < T.der2) {
            // a cluster that swells from the drop's spot
            const rr = (0.2 + r * 1.1) * bubbleK * 1.7;
            x = Math.cos(a) * rr;
            y = OIL0 + 0.4 + h * 1.3 * bubbleK + Math.sin(a * 2) * rr * 0.4;
            z = 0.1 + Math.sin(a) * rr * 0.3;
            sc = (0.4 + bubbleK * 1.2) * sz;
          } else {
            // the column: puffs stream up out of the oil
            const f = (h + (t - T.der2) * 0.55) % 1;
            const top = OIL1 + 7.5 * smooth(col);
            x = Math.cos(a) * (0.6 + r * 1.2) * (0.6 + f);
            y = OIL0 + 0.4 + f * (top - OIL0);
            z = 0.2 + Math.sin(a) * (0.6 + r) * 0.4;
            sc =
              (0.9 + f * 1.4) *
              sz *
              (t >= T.zerplatzt ? 1 - ramp(t, T.zerplatzt, T.jeder) * 0.7 : 1);
          }
          _p.set(x, y, z);
          _s.setScalar(Math.max(0.001, sc));
          _q.setFromEuler(new THREE.Euler(i, t * 0.5 + i, 0));
          _m.compose(_p, _q, _s);
          steam.setMatrixAt(i, _m);
        });
        steam.instanceMatrix.needsUpdate = true;
      }
    }
    // the oil ripped up, the spray, the ignition
    {
      const lift = t >= T.der2 ? ramp(t, T.der2, T.zerplatzt) : 0;
      const sprayT = t - T.zerplatzt;
      droplets.visible = t >= T.der2;
      let lit = 0;
      drSeeds.forEach((d, i) => {
        let x;
        let y;
        let z;
        let sc;
        if (sprayT < 0) {
          // a golden column of oil blobs carried up by the steam
          const f = (d.i / NDR + (t - T.der2) * 0.4) % 1;
          const yTop = OIL1 + 7.5 * smooth(lift);
          y = OIL1 + f * (yTop - OIL1);
          const rr = 0.4 + d.col * 1.6 * (0.3 + f);
          x = d.dir.x * rr;
          z = 0.3 + d.dir.z * rr * 0.6;
          sc = d.sz * (f < smooth(lift) * 1.05 ? 1.6 : 0.001);
        } else {
          // spray outwards, gravity, drag
          const tt = Math.min(sprayT, 3.2);
          const k = (1 - Math.exp(-tt * 1.6)) / 1.6;
          const base = OIL1 + 6.2 + (d.col - 0.5) * 2.4;
          x = d.dir.x * d.sp * k * 1.6;
          y = base + d.dir.y * d.sp * k - 0.25 * tt * tt;
          z = 0.3 + d.dir.z * d.sp * k * 1.2;
          sc = d.sz * 1.1;
        }
        // ignition: from "Jeder" each droplet catches fire after its delay
        const ign = clamp01((t - T.jeder - d.ign) / 0.25);
        if (ign > 0.5) lit++;
        _p.set(x, y, z);
        _s.setScalar(Math.max(0.001, sc * (1 + ign * 0.8)));
        _m.compose(_p, _q.identity(), _s);
        droplets.setMatrixAt(i, _m);
        if (ign > 0)
          droplets.setColorAt(
            i,
            fbColor(0.15 + d.col * 0.5, 0.1)
              .clone()
              .lerp(OIL_GOLD, 1 - ign),
          );
        else droplets.setColorAt(i, _c.copy(OIL_GOLD).multiplyScalar(0.9 + d.col * 0.25));
      });
      droplets.instanceMatrix.needsUpdate = true;
      droplets.instanceColor.needsUpdate = true;
      cutFireLight.intensity = 10 + (lit / NDR) * 140 + blast * 20;
    }
    // Fettexplosion: the burning spray fuses into one ball
    {
      const k = smooth(ramp(t, T.das4, T.fettexplosion + 0.3));
      cutBall.visible = k > 0;
      if (k > 0) {
        const rb = rng(88);
        for (let i = 0; i < 50; i++) {
          const a = rb() * Math.PI * 2;
          const r = rb();
          const h = rb();
          const boom = 1 + 0.6 * smooth(ramp(t, T.fettexplosion, T.fettexplosion + 0.6));
          _p.set(
            Math.cos(a) * r * 3.2 * boom,
            OIL1 + 5.5 + (h - 0.4) * 3.2 * boom + Math.sin(t * 2 + i) * 0.2,
            0.3 + Math.sin(a) * r * 1.6,
          );
          _s.setScalar((0.8 + rb() * 1.2) * k * boom);
          _q.setFromEuler(new THREE.Euler(t + i, t * 0.7 + i, 0));
          _m.compose(_p, _q, _s);
          cutBall.setMatrixAt(i, _m);
          cutBall.setColorAt(i, fbColor(r * 0.7 + h * 0.3, 0.1));
        }
        cutBall.instanceMatrix.needsUpdate = true;
        cutBall.instanceColor.needsUpdate = true;
      }
    }
  }

  // ------------------------------------------------ TUBS
  tubW.visible = inTubs;
  if (inTubs) {
    // the bottle: wobbles on "Rate mal", bursts on "1.700"
    const burstK = smooth(ramp(t, T.n1700, T.n1700 + 0.5));
    bottle.visible = burstK < 1;
    bottle.scale.setScalar(1.3 * (1 - burstK) + 0.001);
    bottle.rotation.z = Math.sin(t * 9) * 0.04 * ramp(t, T.dampf1, T.n1700);
    // the steam cloud grows over the bottle
    const g = smooth(ramp(t, T.n1700, T.so + 0.4));
    cloud.visible = g > 0;
    if (g > 0) {
      clSeeds.forEach(([a, r, h, sz], i) => {
        const rr = (0.3 + r * 2.4) * g * (1 - ramp(t, T.so, T.zehn + 0.6) * 0.75);
        _p.set(Math.cos(a) * rr, 1.0 + h * 3.6 * g + Math.sin(t + i) * 0.1, Math.sin(a) * rr * 0.6);
        _s.setScalar(Math.max(0.001, (0.4 + g * 1.1) * sz));
        _q.setFromEuler(new THREE.Euler(i, t * 0.4 + i, 0));
        _m.compose(_p, _q, _s);
        cloud.setMatrixAt(i, _m);
      });
      cloud.instanceMatrix.needsUpdate = true;
    }
    // the tubs pop in one after another on "zehn volle Badewannen"
    tubs.forEach(({ g: tg, puffs, i }) => {
      const at = T.zehn + i * 0.1;
      tg.visible = t >= at;
      tg.scale.copy(squash(t, at, 0.6));
      puffs.forEach((p, k) => {
        const f = (t * 0.35 + k / 4 + i * 0.13) % 1;
        p.position.set(Math.sin(k * 2 + f * 3) * 0.5, 1.4 + f * 1.6, Math.cos(k * 3) * 0.25);
        p.scale.setScalar(0.5 + f * 0.9);
      });
    });
    // device-style counter: 1 litre of water → 1,700 litres of steam
    const cntK = pop(t, T.dampf1, T.alles);
    const climbing = t >= T.n1700;
    const v = climbing ? Math.round(lerp(1, 1700, easeInOut(ramp(t, T.n1700, T.n1700 + 0.7)))) : 1;
    counter("liter", cntK, {
      label: climbing ? "Liter Dampf" : "Liter Wasser",
      value: v,
      x: 70,
      y: 1170,
      color: climbing ? "#ffffff" : "#4fc3ff",
    });
  }

  // ------------------------------------------------ device displays (kitchen)
  // the oil heats up: thermometer gauge from "Das Öl wird heißer"
  {
    const k = pop(t, T.das2, T.der1);
    const v = lerp(180, 360, smooth(ramp(t, T.das2, T.feuer1)));
    gauge("oel", k, {
      label: "Öl",
      value: v,
      max: 400,
      unit: "°C",
      x: 640,
      y: 1150,
      color: "#ff6a1a",
    });
  }

  // ------------------------------------------------ LED panel: one fact at a time
  if (t >= T.n300 && t < T.wasser3)
    showPanel(pop(t, T.n300, T.wasser3), "BRENNENDES ÖL", "300 °C", LED.red);
  else if (t >= T.n100 && t < T.es4)
    showPanel(pop(t, T.n100, T.es4), "WASSER KOCHT", "100 °C", LED.blue);
  else if (t >= T.pfanne3 && t < T.fakt)
    showPanel(pop(t, T.pfanne3, T.fakt), "SO GEHT'S", "DECKEL", LED.green);
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
