// #33 "Weltall" (format B): what happens if you go out into space without a
// spacesuit? You pull the lever, the hatch of the airlock blasts open and
// the air takes you with it (set.js: the station over the night side of the
// Earth). Your spit bubbles, the air leaves your lungs, the clock starts;
// the water in your body turns to vapour and you swell, ~15 s until it goes
// black — but the heart keeps the blood liquid and the vacuum keeps you warm
// like a thermos flask. The robot arm catches you, in one piece, back into
// the airlock. Übrigens: 1966, a NASA vacuum chamber. renderAt(t) is a pure
// function of t; all timing lives in beats.js.
import {
  THREE,
  ramp,
  smooth,
  clamp01,
  lerp,
  pop,
  outBack,
  V,
  scene,
  camera,
  flat,
  facet,
  facetMat,
  rng,
  xrayMaterial,
  setXray,
  squash,
  showNope,
  makeArrowSet,
  animateArrows,
  heatMat,
  forceMat,
  showPanel,
  LED,
  labels,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { HATCH_Z, LOCK_Y, LOCK_R } from "./set.js";
import { F } from "./environments.js";
import { stopwatch, readout } from "./hud.js";
import {
  T,
  shots as SHOTS,
  LABELS,
  HIGHLIGHTS,
  YOU as YOU_A,
  THERMOS as THERMOS_A,
  CHAMBER as CHAMBER_A,
} from "./beats.js";

highlights(HIGHLIGHTS);
const applyCamera = shotCamera(SHOTS.map((s) => (s.rel ? { ...s, rel: V(...s.rel) } : s)));
const YOU = V(...YOU_A);
const THERMOS = V(...THERMOS_A);
const CHAMBER = V(...CHAMBER_A);
const frac = (x) => x - Math.floor(x);
const yAxis = V(0, 1, 0);

// ---------------------------------------------------------------- blackout
// "Dann wird alles schwarz": a dark vignette over the picture, under the captions
const black = document.createElement("div");
black.style.cssText =
  "position:absolute;inset:0;pointer-events:none;opacity:0;" +
  "background:radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 0%, rgba(0,0,0,.55) 30%, #000 62%);";
document.getElementById("stage").after(black);

// ---------------------------------------------------------------- a person
// Low-poly person, origin at the body centre. xray: shells turn to glass so
// the lungs, heart and vessels show. Returns pose / face controls.
function makePerson({ top = 0x4a7bd6, legs = 0x2f4f7f, hair = 0x5a3a22, xray = false } = {}) {
  const g = new THREE.Group();
  const body = new THREE.Group(); // scaled when you swell
  body.position.y = -0.6;
  g.add(body);
  const shell = [];
  const mat = (c, extra) => {
    if (!xray) return facetMat(flat(c, extra));
    const m = xrayMaterial(c, { flatShading: true, roughness: 0.75, ...extra });
    shell.push(m);
    return m;
  };
  const topM = mat(top);
  const legM = mat(legs);
  const skinM = mat(0xf1c09a, { roughness: 0.7 });
  const shoe = facetMat(flat(0xf6f6f6));
  const mk = (geo, m, x, y, z, parent, seed) => {
    const mesh = new THREE.Mesh(xray ? geo : facet(geo, 0.07, seed), m);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const legsG = [];
  for (const s of [-1, 1]) {
    const hip = new THREE.Group();
    hip.position.set(s * 0.09, 0.5, 0);
    body.add(hip);
    mk(new THREE.BoxGeometry(0.13, 0.46, 0.14), legM, 0, -0.23, 0, hip, 3 + s);
    mk(new THREE.BoxGeometry(0.14, 0.08, 0.22), shoe, 0, -0.47, 0.04, hip, 5 + s);
    legsG.push(hip);
  }
  const torso = mk(new THREE.BoxGeometry(0.38, 0.44, 0.23), topM, 0, 0.72, 0, body, 7);
  mk(new THREE.BoxGeometry(0.3, 0.12, 0.12), topM, 0, 0.92, -0.1, body, 8);
  const head = new THREE.Group();
  head.position.set(0, 1.07, 0);
  body.add(head);
  mk(new THREE.IcosahedronGeometry(0.15, 1), skinM, 0, 0, 0, head, 10);
  const hairM = new THREE.Mesh(
    facet(new THREE.SphereGeometry(0.165, 9, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), 0.07, 11),
    facetMat(flat(hair)),
  );
  hairM.position.set(0, 0.02, -0.015);
  hairM.rotation.x = -0.25;
  head.add(hairM);
  const eyes = [];
  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 4), flat(0x1c1c22));
    eye.position.set(s * 0.055, 0.01, 0.135);
    head.add(eye);
    eyes.push(eye);
  }
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), flat(0x7a2228));
  mouth.position.set(0, -0.065, 0.135);
  head.add(mouth);
  const tongue = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 4), flat(0xe06a78));
  tongue.position.set(0, -0.078, 0.142);
  head.add(tongue);
  // spit bubbles on the tongue
  const bubbleMat = new THREE.MeshStandardMaterial({
    color: 0xe8f6ff,
    roughness: 0.08,
    metalness: 0.1,
    transparent: true,
    opacity: 0.85,
  });
  const bubbles = Array.from({ length: 14 }, () => {
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.009, 1), bubbleMat);
    b.userData.noAO = true;
    head.add(b);
    return b;
  });
  const arms = [];
  for (const s of [-1, 1]) {
    const sh = new THREE.Group();
    sh.position.set(s * 0.23, 0.9, 0);
    body.add(sh);
    mk(new THREE.BoxGeometry(0.1, 0.4, 0.11), topM, 0, -0.2, 0, sh, 12 + s);
    mk(new THREE.IcosahedronGeometry(0.055, 0), skinM, 0, -0.43, 0, sh, 14 + s);
    arms.push(sh);
  }
  g.traverse((o) => o.isMesh && (o.receiveShadow = true));
  function pose({ legL = 0, legR = 0, armL = [0, 0], armR = [0, 0], tilt = 0 }) {
    legsG[0].rotation.x = legL;
    legsG[1].rotation.x = legR;
    arms[0].rotation.set(armL[0], 0, -armL[1]);
    arms[1].rotation.set(armR[0], 0, armR[1]);
    head.rotation.x = tilt;
  }
  // face: open = mouth open 0..1, closed = eyes shut 0..1, fizz = bubbles 0..1
  function face(t, { open = 0, closed = 0, fizz = 0 }) {
    mouth.scale.set(1.2 + open * 0.5, 0.6 + open * 1.4, 0.5);
    tongue.visible = open > 0.2;
    eyes.forEach((e) => e.scale.set(1, Math.max(0.12, 1 - closed), 1));
    const br = rng(7);
    bubbles.forEach((b, i) => {
      const ph = br();
      const ox = (br() - 0.5) * 0.05;
      const sp = 0.8 + br() * 0.9;
      const u = frac(t * sp + ph);
      b.visible = fizz > 0.02;
      const s = Math.sin(u * Math.PI) * (0.6 + br() * 0.9) * fizz;
      b.scale.setScalar(Math.max(0.001, s));
      b.position.set(ox, -0.074 + u * 0.03, 0.15 + u * 0.035 + (i % 3) * 0.004);
    });
  }
  return { g, body, torso, head, shell, pose, face };
}

// ---------------------------------------------------------------- you
const you = makePerson({ xray: true });
scene.add(you.g);
// inside you: lungs, heart, vessels (shown with the x-ray)
const inner = new THREE.Group();
you.body.add(inner);
const lungMat = flat(0xff8fa6, { emissive: 0xff4f78, emissiveIntensity: 0.35, roughness: 0.6 });
const lungs = [-1, 1].map((s) => {
  const l = new THREE.Mesh(
    facet(new THREE.IcosahedronGeometry(0.075, 1), 0.08, 30 + s),
    facetMat(lungMat),
  );
  l.scale.set(1, 1.5, 0.85);
  l.position.set(s * 0.085, 0.76, 0);
  inner.add(l);
  return l;
});
const heartMat = flat(0xd9203a, { emissive: 0xff1a3a, emissiveIntensity: 0.6, roughness: 0.5 });
const heart = new THREE.Mesh(
  facet(new THREE.IcosahedronGeometry(0.05, 1), 0.08, 33),
  facetMat(heartMat),
);
heart.position.set(0.035, 0.78, 0.05);
inner.add(heart);
// vessels: from the heart out to the head, arms and legs; red beads flow along
const veinMat = flat(0xc81830, { emissive: 0x8a0018, emissiveIntensity: 0.5 });
const veinCurves = [
  [V(0.035, 0.8, 0.05), V(0.02, 0.95, 0.04), V(0, 1.02, 0.02)],
  [V(0.035, 0.8, 0.05), V(0.15, 0.86, 0.02), V(0.23, 0.72, 0), V(0.23, 0.5, 0)],
  [V(0.035, 0.8, 0.05), V(-0.12, 0.86, 0.02), V(-0.23, 0.72, 0), V(-0.23, 0.5, 0)],
  [V(0.035, 0.76, 0.05), V(0.06, 0.6, 0.03), V(0.09, 0.4, 0.01), V(0.09, 0.1, 0)],
  [V(0.035, 0.76, 0.05), V(-0.02, 0.6, 0.03), V(-0.09, 0.4, 0.01), V(-0.09, 0.1, 0)],
].map((pts) => new THREE.CatmullRomCurve3(pts));
for (const c of veinCurves)
  inner.add(new THREE.Mesh(new THREE.TubeGeometry(c, 24, 0.008, 5), veinMat));
const NB = 60;
const beads = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.011, 0),
  new THREE.MeshBasicMaterial({ color: 0xff4a5a }),
  NB,
);
beads.userData.noAO = true;
inner.add(beads);
// the pressure that keeps the blood liquid
const pressure = makeArrowSet(
  [
    [V(0.42, 0.78, 0.05), V(0.14, 0.78, 0.05)],
    [V(-0.36, 0.78, 0.05), V(-0.08, 0.78, 0.05)],
    [V(0.035, 0.78, 0.42), V(0.035, 0.78, 0.13)],
    [V(0.035, 1.05, 0.2), V(0.035, 0.86, 0.08)],
  ],
  { parent: inner, mat: forceMat, r: 0.012, amp: 0 },
);
const skinHold = makeArrowSet(
  [
    [V(0.5, 0.62, 0.1), V(0.31, 0.62, 0.02)],
    [V(0.5, 0.42, 0.1), V(0.31, 0.42, 0.02)],
    [V(-0.5, 0.55, 0.1), V(-0.31, 0.55, 0.02)],
  ],
  { parent: inner, mat: forceMat, r: 0.018, amp: 0 },
);
// vapour off your skin
const NV = 36;
const vapour = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.035, 1),
  new THREE.MeshBasicMaterial({
    color: 0xf2f8ff,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
  }),
  NV,
);
vapour.userData.noAO = true;
vapour.frustumCulled = false;
you.g.add(vapour);
const vapSeed = (() => {
  const r = rng(41);
  return Array.from({ length: NV }, () => [
    r() * 2 - 1,
    r() * 1.1 - 0.55,
    r() * 2 - 1,
    r(),
    0.5 + r(),
  ]);
})();

// ---------------------------------------------------------------- the hatch
const door = new THREE.Group();
door.position.set(LOCK_R - 0.05, LOCK_Y, HATCH_Z + 0.05);
scene.add(door);
{
  const hullM = flat(0xdfe4ea, { roughness: 0.5, metalness: 0.2 });
  const disc = F(
    new THREE.CylinderGeometry(LOCK_R - 0.12, LOCK_R - 0.12, 0.16, 26),
    hullM,
    0.06,
    50,
  );
  disc.rotation.x = Math.PI / 2;
  disc.position.x = -(LOCK_R - 0.05);
  disc.castShadow = true;
  door.add(disc);
  for (const z of [0.1, -0.1]) {
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 5, 16), flat(0x3a4250));
    wheel.position.set(-(LOCK_R - 0.05), 0, z);
    door.add(wheel);
  }
  const win = new THREE.Mesh(
    new THREE.CircleGeometry(0.16, 14),
    new THREE.MeshBasicMaterial({ color: 0x9fd8ff }),
  );
  win.position.set(-(LOCK_R - 0.05), 0.62, 0.085);
  door.add(win);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.17), flat(0xff6a2a));
  stripe.position.set(-(LOCK_R - 0.05), -0.55, 0);
  door.add(stripe);
}
// the lever inside, by the camera, and the red alarm light
const lever = new THREE.Group();
lever.position.set(0.45, 0.82, -4.05);
scene.add(lever);
{
  const red = flat(0xe8322a, { emissive: 0x5a0a08, emissiveIntensity: 0.5 });
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.38, 0.06), red);
  arm.position.y = 0.17;
  lever.add(arm);
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.26, 8), red);
  grip.rotation.x = Math.PI / 2;
  grip.position.y = 0.36;
  lever.add(grip);
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.2), flat(0x2b3442));
  lever.add(base);
}
const alarm = new THREE.PointLight(0xff2a1a, 0, 7, 1.4);
alarm.position.set(0, LOCK_Y + 0.9, -4.0);
scene.add(alarm);
const beacon = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.08, 1),
  new THREE.MeshBasicMaterial({ color: 0xff3a2a }),
);
beacon.position.copy(alarm.position);
scene.add(beacon);

// ---------------------------------------------------------------- the air jet
// soft white vapour puffs (billboards) + thin speed streaks stream out of the
// airlock through the hatch and past you
const puffTex = (() => {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,255,255,1)");
  gr.addColorStop(0.45, "rgba(255,255,255,0.55)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace;
  return tx;
})();
const NJ = 240;
const jet = new THREE.InstancedMesh(
  new THREE.PlaneGeometry(1, 1),
  new THREE.MeshBasicMaterial({
    map: puffTex,
    color: 0xeef6ff,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
  }),
  NJ,
);
jet.userData.noAO = true;
jet.frustumCulled = false;
scene.add(jet);
const NS = 170;
const streaks = new THREE.InstancedMesh(
  new THREE.BoxGeometry(0.012, 0.012, 1),
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
  }),
  NS,
);
streaks.userData.noAO = true;
streaks.frustumCulled = false;
scene.add(streaks);
const jetSeed = (() => {
  const r = rng(77);
  return Array.from({ length: NJ + NS }, () => [
    r() * Math.PI * 2,
    Math.sqrt(r()),
    r(),
    0.7 + r() * 0.6,
    r(),
  ]);
})();
// how much air is still coming (1 at the blast, gone a bit after "Lunge")
const air = (t) =>
  (1 - 0.5 * smooth(ramp(t, 0.8, T.spucke))) * (1 - smooth(ramp(t, T.nichts, T.halt + 0.3)));

// ---------------------------------------------------------------- robot arm
const ARM_B = V(4.2, 3.3, -8.0);
const L1 = 5.2;
const L2 = 5.2;
const armMat = flat(0xf2f2f2, { roughness: 0.5 });
const joint = flat(0x3a4250);
const seg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 1, 10), armMat);
const seg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 1, 10), armMat);
const elbowM = new THREE.Mesh(new THREE.IcosahedronGeometry(0.24, 1), joint);
const baseM = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.4, 0.4, 10), joint);
baseM.position.copy(ARM_B);
const effector = new THREE.Group();
{
  const c = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.36, 10), joint);
  c.rotation.x = Math.PI / 2;
  effector.add(c);
  for (const a of [0, 2.1, 4.2]) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.3), flat(0xffc83a));
    f.position.set(Math.cos(a) * 0.14, Math.sin(a) * 0.14, 0.28);
    effector.add(f);
  }
}
for (const m of [seg1, seg2, elbowM, baseM]) m.castShadow = true;
scene.add(seg1, seg2, elbowM, baseM, effector);
function placeSeg(m, a, b) {
  const d = b.clone().sub(a);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(yAxis, d.clone().normalize());
  m.scale.set(1, d.length(), 1);
}
function armTo(P) {
  const d = P.clone().sub(ARM_B);
  const len = Math.min(d.length(), L1 + L2 - 0.02);
  const dir = d.clone().normalize();
  const tip = ARM_B.clone().addScaledVector(dir, len);
  const a = len / 2;
  const h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const n = V(0, 1, 0).addScaledVector(dir, -dir.y).normalize();
  const elbow = ARM_B.clone().addScaledVector(dir, a).addScaledVector(n, h);
  placeSeg(seg1, ARM_B, elbow);
  placeSeg(seg2, elbow, tip);
  elbowM.position.copy(elbow);
  effector.position.copy(tip);
  effector.lookAt(tip.clone().add(dir));
}
const ARM_REST = V(7.5, 7.2, -4.2);

// ---------------------------------------------------------------- the thermos
const thermos = new THREE.Group();
thermos.position.copy(THERMOS);
scene.add(thermos);
const heatBounce = makeArrowSet(
  [
    [V(0.06, 0.6, 0.05), V(0.2, 0.75, 0.1)],
    [V(-0.05, 0.4, 0.05), V(-0.2, 0.5, 0.12)],
    [V(0.03, 0.85, 0.05), V(0.18, 1.0, 0.1)],
  ],
  { parent: thermos, mat: heatMat, r: 0.02, amp: 0.02 },
);
const coffeeSteam = [];
{
  // cut-away: the front quarter is open, showing the two walls and the gap
  const steel = new THREE.MeshStandardMaterial({
    color: 0xc4ccd6,
    metalness: 0.8,
    roughness: 0.25,
    side: THREE.DoubleSide,
    flatShading: true,
  });
  const silver = new THREE.MeshStandardMaterial({
    color: 0xeef3f8,
    metalness: 0.95,
    roughness: 0.12,
    side: THREE.DoubleSide,
    flatShading: true,
  });
  const cut = [Math.PI * 0.45, Math.PI * 1.5]; // thetaStart, thetaLength (open towards +z/+x)
  const outer = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.34, 1.2, 24, 1, true, ...cut),
    steel,
  );
  outer.position.y = 0.6;
  thermos.add(outer);
  const innerW = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.25, 1.1, 24, 1, true, ...cut),
    silver,
  );
  innerW.position.y = 0.62;
  thermos.add(innerW);
  // the vacuum gap: dark band between the walls, edges of the cut
  for (const a of [cut[0], cut[0] + cut[1]]) {
    const edge = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.16, 0.02), flat(0x0e1630));
    edge.position.set(Math.sin(a) * 0.295, 0.6, Math.cos(a) * 0.295);
    edge.rotation.y = a + Math.PI / 2;
    thermos.add(edge);
  }
  const bottom = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.3, 0.06, 24), steel);
  bottom.position.y = -0.0;
  thermos.add(bottom);
  const coffee = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.24, 0.8, 24),
    flat(0x6a3a1c, { emissive: 0x4a1a08, emissiveIntensity: 0.4 }),
  );
  coffee.position.y = 0.47;
  thermos.add(coffee);
  const lid = F(new THREE.CylinderGeometry(0.3, 0.35, 0.22, 16), flat(0x2f7d4a), 0.06, 60);
  lid.position.y = 1.32;
  thermos.add(lid);
  for (let i = 0; i < 6; i++) {
    const s = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.05, 1),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      }),
    );
    thermos.add(s);
    coffeeSteam.push(s);
  }
  thermos.traverse((o) => o.isMesh && (o.castShadow = true));
}

// ---------------------------------------------------------------- 1966 chamber
const chamber = new THREE.Group();
chamber.position.copy(CHAMBER);
scene.add(chamber);
const tester = makePerson({ top: 0xdfe3e8, legs: 0xb8bfca, hair: 0x2e2a28 });
tester.g.position.set(0, 1.2, 0.2);
chamber.add(tester.g);
{
  const steel = flat(0x7d8794, { roughness: 0.45, metalness: 0.55, side: THREE.DoubleSide });
  const shell = F(
    new THREE.CylinderGeometry(1.5, 1.5, 3.0, 28, 2, true, Math.PI * 0.3, Math.PI * 1.4),
    steel,
    0.06,
    70,
  );
  shell.position.y = 1.5;
  chamber.add(shell);
  const floor = F(new THREE.CylinderGeometry(1.55, 1.6, 0.16, 28), flat(0x4a525e), 0.05, 71);
  chamber.add(floor);
  const roof = floor.clone();
  roof.position.y = 3.0;
  chamber.add(roof);
  // the lamp inside, warm
  const lamp = new THREE.PointLight(0xffd08a, 6, 5, 1.5);
  lamp.position.set(0, 2.6, 0.2);
  chamber.add(lamp);
  // helmet: a glass dome over the tester's head
  const helmet = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 18, 12),
    new THREE.MeshStandardMaterial({
      color: 0xdff2ff,
      transparent: true,
      opacity: 0.22,
      roughness: 0.05,
      metalness: 0.2,
      depthWrite: false,
    }),
  );
  helmet.position.copy(tester.head.position);
  tester.body.add(helmet);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.035, 6, 16), flat(0xd9a441));
  collar.rotation.x = Math.PI / 2;
  collar.position.set(0, 0.9, 0);
  tester.body.add(collar);
  // a hose from the suit to the wall (the one that came loose)
  const hose = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([V(0.12, 1.3, -0.05), V(0.6, 1.1, -0.4), V(1.0, 1.3, -0.9)]),
      16,
      0.03,
      6,
    ),
    flat(0x2a2e36),
  );
  chamber.add(hose);
  tester.pose({ armL: [0.1, 0.15], armR: [0.25, 0.1] });
}

// ---------------------------------------------------------------- render
const m4 = new THREE.Matrix4();
const q4 = new THREE.Quaternion();
const e4 = new THREE.Euler();
const tmp = V(0, 0, 0);
const HATCH_OUT = V(0, LOCK_Y, HATCH_Z - 0.4);
const INSIDE = V(0, LOCK_Y, HATCH_Z - 2.0);

function youPos(t, out) {
  // blasted out of the hatch, then floating
  const e = 1 - Math.pow(1 - clamp01((t + 1.2) / (T.ziehst + 2.0)), 2.2);
  out.copy(HATCH_OUT).lerp(YOU, e);
  out.y += Math.sin(t * 0.7) * 0.04 * e;
  // caught by the arm and pulled back in
  const back = smooth(ramp(t, T.stueck + 0.15, T.reingeholt + 0.3));
  const inn = smooth(ramp(t, T.reingeholt + 0.3, T.ueberleben + 0.2));
  if (back > 0) out.lerp(V(0, LOCK_Y, HATCH_Z + 0.9), back);
  if (inn > 0) out.lerp(INSIDE, inn);
  return out;
}

function renderAt(t) {
  // ---------- hatch + lever + hand (the blast)
  const openK = outBack(clamp01((t + 0.35) / 0.95));
  const closeK = smooth(ramp(t, T.ueberleben + 0.15, T.ueberleben + 0.5));
  door.rotation.y = 1.95 * openK * (1 - closeK);
  lever.rotation.x = -1.0 * smooth(clamp01((t + 0.4) / 0.4));
  const alarmOn = t < T.spucke ? 1 : 0;
  alarm.intensity = alarmOn * (Math.sin(t * 14) > 0 ? 9 : 2);
  beacon.visible = alarmOn > 0;
  beacon.scale.setScalar(Math.sin(t * 14) > 0 ? 1.4 : 0.7);

  // ---------- the air jet
  applyCamera(t); // billboards face the camera of this frame
  for (let i = 0; i < NJ + NS; i++) {
    const [a, rr, ph, sp, sz] = jetSeed[i];
    const streak = i >= NJ;
    const rate = (streak ? 1.6 : 0.8) * sp;
    const u = frac(t * rate + ph);
    const k = air(t - u / rate) * (t > -1.2 ? 1 : 0);
    const z = -5.2 + u * (streak ? 11 : 8.5);
    const spread = z < HATCH_Z ? 1 : 1 + (z - HATCH_Z) * 0.3;
    const rad = rr * (LOCK_R - 0.3) * spread;
    tmp.set(Math.cos(a) * rad, LOCK_Y + Math.sin(a) * rad * 0.9, z);
    const fade = (1 - smooth(ramp(u, 0.7, 1))) * smooth(ramp(u, 0, 0.08));
    if (streak) {
      const l = k * fade * (0.4 + sz * 0.8);
      q4.setFromUnitVectors(
        yAxis,
        tmp
          .clone()
          .sub(V(0, LOCK_Y, -6))
          .normalize(),
      );
      q4.multiply(new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), Math.PI / 2));
      m4.compose(tmp, q4, V(Math.max(0.001, l), Math.max(0.001, l), Math.max(0.001, l)));
      streaks.setMatrixAt(i - NJ, m4);
    } else {
      const sc = k * fade * (0.25 + sz * 0.45) * (0.6 + u * 1.8);
      m4.compose(tmp, camera.quaternion, V(Math.max(0.001, sc), Math.max(0.001, sc), 1));
      jet.setMatrixAt(i, m4);
    }
  }
  jet.instanceMatrix.needsUpdate = true;
  streaks.instanceMatrix.needsUpdate = true;
  streaks.visible = t < T.platzt + 1;
  jet.visible = t < T.platzt + 1;

  // ---------- you
  you.g.visible = t < T.ueberleben + 0.6;
  youPos(t, you.g.position);
  const tumble = 1 - smooth(ramp(t, 0, T.spucke - 0.2));
  // a roll while you tumble (the face stays towards the camera side), then a
  // slow drift; the front always faces +z so the labels sit on the organs
  e4.set(
    tumble * Math.sin(t * 2.6) * 0.45 + Math.sin(t * 0.4) * 0.08,
    -0.35 * tumble + Math.sin(t * 0.23) * 0.12 * (1 - tumble),
    tumble * (t + 1.2) * 1.1 + Math.sin(t * 0.31) * 0.06,
  );
  you.g.quaternion.setFromEuler(e4);
  const fl = Math.sin(t * 0.9);
  const limp =
    smooth(ramp(t, T.schwarz, T.schwarz + 1.2)) * (1 - ramp(t, T.reingeholt, T.ueberleben));
  you.pose({
    legL: 0.3 + fl * 0.15 + tumble * 0.6,
    legR: -0.2 - fl * 0.12,
    armL: [lerp(-0.4 + fl * 0.2, 0.2, limp), lerp(0.9, 0.5, limp)],
    armR: [lerp(-0.6 - fl * 0.2, 0.25, limp), lerp(1.1, 0.55, limp)],
    tilt: lerp(-0.05, 0.35, limp),
  });
  // swelling: up to about twice the volume, back to normal once inside
  const sw =
    smooth(ramp(t, T.schwillst, T.doppelte + 0.4)) *
    (1 - smooth(ramp(t, T.reingeholt, T.ueberleben)));
  you.body.scale.set(1 + 0.55 * sw, 1 + 0.2 * sw, 1 + 0.6 * sw);
  you.head.scale.setScalar(1 + 0.18 * sw);
  // face
  const fizz = pop(t, T.spucke - 0.15, T.luft + 0.6) + 0.5 * pop(t, T.kochen, T.nichts);
  const awake =
    1 - smooth(ramp(t, T.schwarz, T.schwarz + 0.8)) * (1 - ramp(t, T.reingeholt, T.ueberleben));
  you.face(t, {
    open: Math.max(pop(t, T.spucke - 0.3, T.halt), 0.4 * pop(t, T.luft, T.uhr)),
    closed: 1 - awake,
    fizz: clamp01(fizz),
  });
  // x-ray windows: the lungs, then the blood
  const xr =
    smooth(ramp(t, T.lunge - 0.25, T.lunge + 0.25)) *
      (1 - smooth(ramp(t, T.tickt - 0.1, T.tickt + 0.2))) +
    smooth(ramp(t, T.blut - 0.2, T.blut + 0.3)) *
      (1 - smooth(ramp(t, T.erfrieren - 0.1, T.erfrieren + 0.2)));
  setXray(you.shell, xr);
  inner.visible = xr > 0.02;
  // lungs: emptying, then the danger of holding the breath
  const hold = smooth(ramp(t, T.halt, T.platzt));
  const burst = pop(t, T.platzt, T.platzt + 0.6, 0.1);
  lungs.forEach((l, i) => {
    const b =
      1 - 0.25 * ramp(t, T.lunge, T.halt) + 0.6 * hold * (1 - ramp(t, T.platzt + 0.3, T.tickt));
    l.scale.set(b, 1.5 * b, 0.85 * b);
    l.material.emissiveIntensity = 0.35 + burst * 2.5;
    l.material.emissive.setHex(burst > 0.05 ? 0xff1a1a : 0xff4f78);
    void i;
  });
  showNope(pop(t, T.platzt, T.tickt), YOU.x + 0.22, YOU.y + 0.2, YOU.z + 0.35, 0.14);
  // heart beat + blood flow
  const beat = Math.pow(Math.max(0, Math.sin(t * 8.4)), 6);
  heart.scale.setScalar(1 + 0.35 * beat * ramp(t, T.blut, T.herz));
  heart.material.emissiveIntensity = 0.6 + beat * 1.6;
  for (let i = 0; i < NB; i++) {
    const c = veinCurves[i % veinCurves.length];
    const u = frac(t * 0.45 + (i / NB) * 3.7);
    c.getPointAt(u, tmp);
    m4.makeTranslation(tmp.x, tmp.y, tmp.z);
    beads.setMatrixAt(i, m4);
  }
  beads.instanceMatrix.needsUpdate = true;
  animateArrows(pressure, t, pop(t, T.druck - 0.1, T.erfrieren));
  animateArrows(skinHold, t, pop(t, T.haut, T.rate));
  // vapour rising off the skin
  const vk = pop(t, T.luftdruck, T.rate + 0.5);
  vapour.visible = vk > 0;
  vapSeed.forEach(([x, y, z, ph, sp], i) => {
    const u = frac(t * 0.35 * sp + ph);
    tmp.set(x * (0.25 + u * 0.5), y + u * 0.35, z * (0.18 + u * 0.45));
    const s = vk * Math.sin(u * Math.PI) * (0.8 + 0.6 * sw);
    m4.compose(tmp, q4.identity(), V(s, s, s));
    vapour.setMatrixAt(i, m4);
  });
  vapour.instanceMatrix.needsUpdate = true;

  // ---------- the robot arm
  const reach = smooth(ramp(t, T.stueck - 1.3, T.stueck + 0.1));
  const letGo = smooth(ramp(t, T.reingeholt + 0.3, T.ueberleben + 0.8));
  const grip = youPos(t, V(0, 0, 0)).add(V(0.3, 0.45, 0.15));
  const target = ARM_REST.clone().lerp(grip, reach * (1 - letGo));
  armTo(target);

  // ---------- thermos (pops in for its two shots)
  const thK = t >= T.vakuum - 0.2 && t < T.stueck;
  thermos.visible = thK;
  if (thK) {
    thermos.scale.copy(squash(t, T.vakuum));
    thermos.rotation.y = 0.4 + Math.sin(t * 0.3) * 0.08;
    thermos.rotation.z = Math.sin(t * 0.5) * 0.04;
    coffeeSteam.forEach((s, i) => {
      const u = frac(t * 0.5 + i / 6);
      s.position.set(Math.sin(i * 2.1) * 0.06, 0.9 + u * 0.3, Math.cos(i * 1.7) * 0.06);
      s.scale.setScalar(Math.sin(u * Math.PI) * 0.8 + 0.01);
    });
  }
  animateArrows(heatBounce, t, pop(t, T.vakuum + 0.3, T.stueck));

  // ---------- 1966 chamber
  chamber.visible = t >= T.uebrigens - 0.3 && t < T.sollen;
  tester.face(t, {
    open: pop(t, T.zuletzt - 0.2, T.sollen),
    closed: smooth(ramp(t, T.spucke2, T.sollen)),
    fizz: pop(t, T.zuletzt - 0.1, T.sollen),
  });
  tester.g.rotation.y = -0.35 + Math.sin(t * 0.6) * 0.04;

  // ---------- blackout
  const bk =
    smooth(ramp(t, T.schwarz + 0.1, T.schwarz + 0.9)) * (1 - smooth(ramp(t, T.blut - 0.3, T.blut)));
  black.style.opacity = String(0.92 * bk);

  // ---------- displays
  const runSec = clamp01((t - T.uhr) / (T.fuenfzehn - T.uhr)) * 15;
  const swSmall = pop(t, T.uhr, T.folg) + pop(t, T.luftdruck, T.rate);
  stopwatch("wach", Math.min(1, swSmall), {
    seconds: runSec,
    max: 15,
    label: "Ohne Luft",
    x: 70,
    y: 1240,
    color: runSec > 11 ? "#ff4b2b" : "#ffd23f",
  });
  stopwatch("wachBig", pop(t, T.rate, T.schwarz + 0.4), {
    seconds: runSec,
    max: 15,
    label: "Wach",
    x: 380,
    y: 1150,
    color: runSec > 11 ? "#ff4b2b" : "#ffd23f",
  });
  readout("temp", pop(t, T.erfrieren, T.vakuum), {
    label: "Körper",
    value: 36,
    unit: "°C",
    note: "kühlt kaum ab",
    x: 70,
    y: 1240,
    color: "#ffd23f",
  });
  if (t >= T.doppelte && t < T.haut)
    showPanel(pop(t, T.doppelte, T.haut), "VOLUMEN", "BIS 2×", LED.yellow);
  else if (t >= T.fuenfzehn && t < T.schwarz)
    showPanel(pop(t, T.fuenfzehn, T.schwarz), "WACH", "15 SEK", LED.red);
  else if (t >= T.ueberleben && t < T.uebrigens)
    showPanel(pop(t, T.ueberleben, T.uebrigens), "RETTUNG", "≈ 90 SEK", LED.green);
  else if (t >= T.nasa - 0.1 && t < T.zuletzt)
    showPanel(pop(t, T.nasa - 0.1, T.zuletzt), "NASA-TEST", "1966", LED.blue);
  else showPanel(0);

  labels(t, LABELS);
  renderFrame();
}
start(renderAt);
