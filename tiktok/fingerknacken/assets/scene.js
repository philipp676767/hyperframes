// Scene of #55 "Fingerknacken" (format B): your hands crack over the keyboard
// in a 20th-floor office at golden hour; grandma texts, the boss pulls a
// face, the whole office cracks. Inside your finger (pocket JOINT): intact
// bones, a glowing gas bubble in the joint, the capsule full of grease, the
// gap opening when you pull, the 20-minute wait on the wall clock, the gas
// dissolved like in a cola, and the big KNACK. Payoff: harmless. Übrigens:
// the doctor who cracked only his left hand for 60 years.
import {
  THREE,
  ramp,
  smooth,
  pop,
  clamp01,
  lerp,
  rng,
  V,
  scene,
  camera,
  flat,
  facet,
  facetMat,
  xrayMaterial,
  xrayEdges,
  setXray,
  makeArrowSet,
  animateArrows,
  forceMat,
  showPanel,
  showNope,
  LED,
  labels,
  highlights,
  shotCamera,
  renderFrame,
  start,
  outBack,
} from "./world.js";
import { phoneScreen, textTex, clock, COLA, colaCap, COLLEAGUE_DESKS } from "./set.js";
import { createHand } from "./hand.js";
import { person } from "./people.js";
import { stopwatch, gauge, counter } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS, HANDS, CHEF, JOINT, SEAT_Y, DESK_Y } from "./beats.js";

highlights(HIGHLIGHTS);
const applyCamera = shotCamera(shots);

// the sun's shadow box follows the place on screen (office / joint pocket)
const key = scene.children.find((o) => o.isDirectionalLight && o.castShadow);
scene.add(key.target);
key.shadow.camera.far = 80;
key.shadow.camera.updateProjectionMatrix();
const KEY_OFFICE = key.position.clone();

const _v = V(0, 0, 0);
const _m4 = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const add = (geo, mat, parent, x = 0, y = 0, z = 0, amt = 0.05, seed = 1) => {
  const m = new THREE.Mesh(facet(geo, amt, seed), facetMat(mat));
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};

// ================================================================ your hands
// right hand palm down, fingers towards the monitor (-z); the left hand lies
// on top of the right fingers and presses them down → crack
const SLEEVE = 0x7c5cd6;
const HS = 1.7; // hand scale (toy-big, readable)
const right = createHand({ sleeve: SLEEVE, skin: 0xf3c4a0, scale: HS });
const left = createHand({ sleeve: SLEEVE, skin: 0xf3c4a0, scale: HS, left: true });
const RY = Math.PI; // fingers along -z
const R0 = [HANDS[0] + 0.1, HANDS[1], HANDS[2] + 0.5];
// curl envelope of one crack at time c: press 0.28 s, snap, ease back
const crackCurl = (t, c) => {
  if (t < c - 0.3 || t > c + 0.5) return 0;
  if (t < c) return smooth(ramp(t, c - 0.3, c));
  return 1 - smooth(ramp(t, c + 0.04, c + 0.5));
};
// knuckle glow dots (red: "Arthrose?", green: harmless)
const dotGeo = new THREE.IcosahedronGeometry(0.075, 1);
const redDot = new THREE.MeshBasicMaterial({
  color: 0xff3b2b,
  transparent: true,
  depthWrite: false,
  toneMapped: false,
});
const greenDot = new THREE.MeshBasicMaterial({
  color: 0x3dff7a,
  transparent: true,
  depthWrite: false,
  toneMapped: false,
});
const knuckleDots = (mat) =>
  [0.155, 0.052, -0.052, -0.155].map((x) => {
    const m = new THREE.Mesh(dotGeo, mat);
    m.position.set(x, 0.08, 0.41);
    m.userData.noAO = true;
    right.root.add(m);
    return m;
  });
const redDots = knuckleDots(redDot);
const greenDots = knuckleDots(greenDot);
// your arms (sleeves from off screen behind the camera to the wrists)
const armMat = flat(SLEEVE, { roughness: 0.9 });
const armR = add(new THREE.CapsuleGeometry(0.2, 1, 2, 7), armMat, scene);
const armL = add(new THREE.CapsuleGeometry(0.2, 1, 2, 7), armMat, scene);
function arm(m, hand, shoulder) {
  if (!hand.group.visible) {
    m.visible = false;
    return;
  }
  hand.group.updateMatrixWorld(true);
  const wrist = _v.set(0, 0.01, -0.62).applyMatrix4(hand.group.matrixWorld);
  const dir = wrist.clone().sub(shoulder);
  const len = dir.length();
  m.visible = true;
  m.position.copy(shoulder).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(V(0, 1, 0), dir.normalize());
  m.scale.set(HS * 0.85, len / 1.4, HS * 0.85);
}
const SHOULDER_R = V(HANDS[0] + 1.3, HANDS[1] + 1.6, HANDS[2] + 4.2);
const SHOULDER_L = V(HANDS[0] - 1.3, HANDS[1] + 1.6, HANDS[2] + 4.2);

// which moments show your hands, and how
const officeHands = (t) =>
  t < T.dabei || (t >= T.knackst2 && t < T.lange) || (t >= T.arthrose2 && t < T.fakt);
const doctorHands = (t) => t >= T.fakt;

function poseHands(t) {
  if (doctorHands(t)) {
    // the doctor's two hands side by side; the LEFT one cracks again and again
    const rk = [HANDS[0] + 0.7, HANDS[1] - 0.12, HANDS[2] + 0.4];
    const lk = [HANDS[0] - 0.7, HANDS[1] - 0.12, HANDS[2] + 0.4];
    right.track(t, [{ t: T.fakt - 1, pos: rk, rot: [0, RY, 0], pose: "open" }]);
    let c = 0;
    for (const a of T.drKnacks) c = Math.max(c, crackCurl(t, a));
    left.track(t, [{ t: T.fakt - 1, pos: lk, rot: [0, RY, 0], pose: "open" }]);
    left.pose({
      index: 0.1 + c * 1.1,
      middle: 0.12 + c * 1.1,
      ring: 0.15 + c * 1.1,
      pinky: 0.2 + c * 1.0,
      thumb: 0.1,
    });
    right.pose("open");
    return;
  }
  if (!officeHands(t)) {
    right.track(t, [{ t: 1e9, pos: R0 }]);
    left.track(t, [{ t: 1e9, pos: R0 }]);
    return;
  }
  // crack strength now
  let c = 0;
  for (const a of T.cracks) c = Math.max(c, crackCurl(t, a));
  // the failed try during "Rate mal": the same press, but no snap
  const fail =
    t < T.tryFail
      ? smooth(ramp(t, T.tryFail - 0.35, T.tryFail))
      : 1 - smooth(ramp(t, T.tryFail + 0.5, T.tryFail + 0.9));
  if (t > T.rate && t < T.erst) c = Math.max(c, fail * 0.8);
  // the second crack (side shot) is the index finger alone
  const single = t > T.fingern - 0.4 && t < T.fingern + 1.0;
  right.track(t, [{ t: -10, pos: R0, rot: [0, RY, 0], pose: "open" }]);
  const curl = 0.15 + c * 1.5;
  right.pose(
    single
      ? { index: 0.15 + c * 1.5, middle: 0.25, ring: 0.3, pinky: 0.35, thumb: 0.2 }
      : { index: curl, middle: curl, ring: curl, pinky: curl * 0.97, thumb: 0.2 + c * 0.8 },
  );
  left.track(t, [{ t: 1e9, pos: R0 }]); // one hand is enough — it makes the fist
}

// ================================================================ the crack burst
// a comic starburst: yellow spikes + white core, billboarded, 0.45 s
const burstPool = [];
const spikeMat = new THREE.MeshBasicMaterial({
  color: 0xffd23f,
  transparent: true,
  depthWrite: false,
  depthTest: false,
  toneMapped: false,
});
const coreMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  depthWrite: false,
  depthTest: false,
  toneMapped: false,
});
function makeBurst() {
  const g = new THREE.Group();
  const n = 10;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (i % 2) * 0.12;
    const len = i % 2 ? 0.7 : 1;
    const s = new THREE.Mesh(
      new THREE.ConeGeometry(0.09, len, 3).translate(0, 0.35 + len / 2, 0),
      spikeMat,
    );
    s.rotation.z = a;
    s.renderOrder = 20;
    g.add(s);
  }
  const core = new THREE.Mesh(new THREE.CircleGeometry(0.28, 12), coreMat);
  core.renderOrder = 21;
  g.add(core);
  g.userData.core = core;
  g.visible = false;
  scene.add(g);
  return g;
}
let burstN = 0;
function burst(t, c, pos, size = 1) {
  const u = (t - c) / 0.45;
  if (u < 0 || u >= 1) return;
  const g = burstPool[burstN] ?? (burstPool[burstN] = makeBurst());
  burstN++;
  g.visible = true;
  g.position.copy(pos);
  g.quaternion.copy(camera.quaternion);
  const s = size * (0.35 + 0.85 * outBack(clamp01(u * 2.2)));
  g.scale.setScalar(s);
  g.rotation.z += u * 0.3;
  spikeMat.opacity = 1;
  coreMat.opacity = 1;
  g.children.forEach((m, i) => {
    if (m === g.userData.core) m.scale.setScalar(1.2 - u);
    else m.scale.set(1, 1 - u * 0.6, 1);
    m.visible = u < 0.85 || i % 2 === 0;
  });
}
const knucklePos = (hand, x = 0) => V(x, 0.16, 0.41).applyMatrix4(hand.root.matrixWorld);

// ================================================================ the phone: grandma texts
const phoneTex = textTex(256, 504, (c, w, h) => {
  c.fillStyle = "#0f1116";
  c.fillRect(0, 0, w, h);
  c.fillStyle = "#1e2230";
  c.fillRect(0, 0, w, 70);
  c.fillStyle = "#ffd23f";
  c.beginPath();
  c.arc(40, 36, 20, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#ffffff";
  c.font = '800 30px "Montserrat", sans-serif';
  c.fillText("Oma", 74, 47);
  const bubble = (y, lines) => {
    c.fillStyle = "#2f8f5a";
    const hh = 22 + lines.length * 34;
    c.beginPath();
    c.roundRect(16, y, w - 40, hh, 18);
    c.fill();
    c.fillStyle = "#ffffff";
    c.font = '700 28px "Montserrat", sans-serif';
    lines.forEach((l, i) => c.fillText(l, 30, y + 42 + i * 34));
  };
  bubble(110, ["Hör auf mit", "dem Knacken!!"]);
  bubble(250, ["Davon kriegst", "du Arthrose!"]);
});
phoneScreen.material.map = phoneTex;
phoneScreen.material.emissiveMap = phoneTex;
phoneScreen.material.color.set(0xffffff);
phoneScreen.material.needsUpdate = true;

// ================================================================ people
const people = [];
COLLEAGUE_DESKS.forEach(([x, z], i) => {
  const rr = rng(400 + i);
  const p = person({
    top: [0x2fae6a, 0xe2453c, 0xffd23f, 0x4a7bd6, 0xd88a4a, 0x8a6fae, 0x3c3c44, 0xff8fb8][i % 8],
    hair: [0x3a2a20, 0xd9b06a, 0x1d1a22, 0x8a4a2a][i % 4],
    style: ["short", "long", "bun", "cap"][i % 4],
    skin: [0xf1c09a, 0xd9a07a, 0x8d5a3b, 0xf3c4a0][(i + 1) % 4],
    seed: 10 + i * 9,
  });
  p.g.position.set(x + 0.4, SEAT_Y, z + 2.6);
  p.g.rotation.y = Math.PI;
  people.push({ p, ph: rr() * 6, at: T.crowd + (i % 4) * 0.18 + rr() * 0.1 });
});
const you = person({ top: SLEEVE, hair: 0x2a1d16, style: "short", seed: 3 });
you.g.position.set(0, SEAT_Y, 3.4);
you.g.rotation.y = Math.PI;
const chef = person({
  top: 0x2c3038,
  legs: 0x23262c,
  hair: 0x9a9aa2,
  style: "short",
  stand: true,
  seed: 77,
});
chef.g.position.set(...CHEF);
chef.g.rotation.y = -0.35;
// a tie for the boss
add(new THREE.BoxGeometry(0.22, 1.2, 0.06), flat(0xe2453c), chef.torso, 0, 1.55, 0.44, 0.02, 5);
// colleague arms: typing, or both hands together in front cracking
function crackArms(p, t, k, at) {
  const c = crackCurl(t, at);
  for (const [a, s] of [
    [p.armL, 1],
    [p.armR, -1],
  ]) {
    a.sh.rotation.set(lerp(-0.5, -1.15, k), 0, s * lerp(0.15, -0.35, k));
    a.el.rotation.set(lerp(-1.1, -0.9 + c * 0.5, k), 0, 0);
  }
}

// ================================================================ the joint (pocket JOINT)
const J = new THREE.Group();
J.position.set(...JOINT);
scene.add(J);
const boneMat = flat(0xf3ead6, { roughness: 0.75 });
const cartMat = flat(0xcfe8f5, { roughness: 0.35 });
// bone A (hand side): shaft + round head, surface at x = 0
const boneA = new THREE.Group();
J.add(boneA);
add(
  new THREE.CylinderGeometry(0.95, 1.05, 12, 12).rotateZ(Math.PI / 2),
  boneMat,
  boneA,
  -7.5,
  0,
  0,
  0.05,
  11,
);
add(new THREE.SphereGeometry(1.45, 16, 12), cartMat, boneA, -1.45, 0, 0, 0.03, 12);
add(new THREE.SphereGeometry(1.4, 14, 10), boneMat, boneA, -1.6, 0, 0, 0.04, 13);
// bone B (finger side): flared base with a cartilage disc, moves with the pull
const boneB = new THREE.Group();
J.add(boneB);
add(
  new THREE.CylinderGeometry(1.35, 0.9, 2.2, 14).rotateZ(Math.PI / 2),
  boneMat,
  boneB,
  1.25,
  0,
  0,
  0.04,
  14,
);
add(
  new THREE.CylinderGeometry(0.85, 0.85, 9, 12).rotateZ(Math.PI / 2),
  boneMat,
  boneB,
  6.6,
  0,
  0,
  0.05,
  15,
);
add(
  new THREE.CylinderGeometry(1.4, 1.4, 0.25, 16).rotateZ(Math.PI / 2),
  cartMat,
  boneB,
  0.12,
  0,
  0,
  0.02,
  16,
);
// skin: the finger in x-ray glass
const skinMat = xrayMaterial(0xf1c09a);
const skinGeo = new THREE.CylinderGeometry(3.3, 3.4, 30, 20, 1, true).rotateZ(Math.PI / 2);
const skin = new THREE.Mesh(skinGeo, skinMat);
skin.userData.noAO = true;
J.add(skin);
const skinEdges = xrayEdges(skinGeo);
J.add(skinEdges);
const knob = new THREE.Mesh(new THREE.SphereGeometry(3.7, 18, 12), skinMat);
knob.scale.set(1.1, 1, 1);
knob.position.set(-0.8, 0.25, 0);
knob.userData.noAO = true;
J.add(knob);
// capsule membrane + the grease inside
const capMat = new THREE.MeshStandardMaterial({
  color: 0xffe08a,
  roughness: 0.3,
  transparent: true,
  opacity: 0,
  depthWrite: false,
  side: THREE.DoubleSide,
  emissive: 0x6a4a10,
  emissiveIntensity: 0.4,
});
const fluidMat = new THREE.MeshStandardMaterial({
  color: 0x7fd0ff,
  roughness: 0.15,
  transparent: true,
  opacity: 0,
  depthWrite: false,
  emissive: 0x1a5a8a,
  emissiveIntensity: 0.5,
});
const capsule = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), capMat);
capsule.renderOrder = 3;
capsule.userData.noAO = true;
J.add(capsule);
const fluid = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), fluidMat);
fluid.renderOrder = 2;
fluid.userData.noAO = true;
J.add(fluid);
// the gas bubble
const bubbleMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.04,
  metalness: 0.2,
  emissive: 0x9fe6ff,
  emissiveIntensity: 0.9,
  transparent: true,
  opacity: 0.92,
});
const bubble = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), bubbleMat);
bubble.renderOrder = 4;
bubble.userData.noAO = true;
J.add(bubble);
const shine = new THREE.Mesh(
  new THREE.SphereGeometry(0.25, 10, 8),
  new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
);
bubble.add(shine);
shine.position.set(-0.35, 0.45, 0.6);
const bubbleLight = new THREE.PointLight(0x9fe6ff, 0, 14, 1.6);
J.add(bubbleLight);
// shockwave ring at the pop
const ringMat = new THREE.MeshBasicMaterial({
  color: 0xbff0ff,
  transparent: true,
  opacity: 0,
  depthWrite: false,
  toneMapped: false,
  side: THREE.DoubleSide,
});
const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.06, 6, 40), ringMat);
ring.userData.noAO = true;
J.add(ring);
// gas dissolved in the grease: tiny dots
const GAS_N = 150;
const gasIM = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.075, 0),
  new THREE.MeshBasicMaterial({ color: 0xe8fbff, toneMapped: false }),
  GAS_N,
);
gasIM.frustumCulled = false;
gasIM.userData.noAO = true;
J.add(gasIM);
const gasSeeds = Array.from({ length: GAS_N }, (_, i) => {
  const rr = rng(900 + i);
  let x, y, z;
  do {
    x = (rr() * 2 - 1) * 2.6;
    y = (rr() * 2 - 1) * 1.9;
    z = (rr() * 2 - 1) * 1.9;
  } while ((x / 2.6) ** 2 + (y / 1.9) ** 2 + (z / 1.9) ** 2 > 1 || Math.hypot(y, z) < 1.5);
  return { x, y, z, ph: rr() * 6, d: rr() * 0.25 };
});
// pull arrows (outside the finger, pointing away from the joint)
const pullArrows = makeArrowSet(
  [
    [V(4.5, 0, 3.9), V(8.5, 0, 3.9)],
    [V(-4.5, 0, 3.9), V(-8.5, 0, 3.9)],
  ],
  { parent: J, mat: forceMat, r: 0.22, amp: 0 },
);

// joint state over time
const inJoint = (t) =>
  (t >= T.dabei && t < T.knackst2) ||
  (t >= T.lange && t < T.cola) ||
  (t >= T.faellt && t < T.arthrose2);
function jointAt(t) {
  let gap = 0.35;
  let bub = 0;
  let cap = 0;
  let gas = 0;
  let pull = 0;
  let conv = 0;
  if (t < T.knackst2) {
    // visit 1
    const lit = smooth(ramp(t, T.bubble1 - 0.05, T.bubble1 + 0.25));
    const back = smooth(ramp(t, T.beutel - 0.1, T.beutel + 0.5));
    gap = 0.35 + 0.95 * lit * (1 - back);
    bub = 0.66 * outBack(lit) * (1 - back);
    cap = smooth(ramp(t, T.beutel, T.beutel + 0.6));
    pull = smooth(ramp(t, T.ziehst + 0.05, T.ziehst + 0.85));
    gap += pull * 1.05;
  } else if (t < T.cola) {
    // visit 2: the bubble hangs in the joint, slowly dissolving
    cap = 1;
    gap = 1.3;
    bub = lerp(0.6, 0.38, ramp(t, T.lange, T.cola));
    gas = smooth(ramp(t, T.gelenkschmiere - 0.2, T.gelenkschmiere + 0.4));
  } else {
    // visit 3: pull → pressure drops → the gas pops out
    cap = 1;
    gas = 1;
    pull = smooth(ramp(t, T.faellt + 0.1, T.pop));
    gap = 0.35 + 0.95 * pull;
    conv = smooth(ramp(t, T.druck, T.pop));
    const p = ramp(t, T.pop, T.pop + 0.3);
    bub = 0.68 * outBack(p);
    if (t >= T.pop) gas = 1 - smooth(ramp(t, T.pop, T.pop + 0.15));
  }
  return { gap, bub, cap, gas, pull, conv };
}

// ================================================================ cola fizz
const fizzN = 70;
const fizzIM = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.05, 0),
  new THREE.MeshStandardMaterial({
    color: 0xfff1d8,
    roughness: 0.3,
    emissive: 0x6a4020,
    emissiveIntensity: 0.3,
  }),
  fizzN,
);
fizzIM.frustumCulled = false;
scene.add(fizzIM);
const fizzSeeds = Array.from({ length: fizzN }, (_, i) => {
  const rr = rng(1200 + i);
  return {
    a: rr() * Math.PI * 2,
    v: 1.6 + rr() * 2.2,
    s: 0.6 + rr() * 1.4,
    d: rr() * 1.2,
    sp: 0.1 + rr() * 0.4,
  };
});
const CAP0 = colaCap.position.clone();

// ================================================================ green checks (both hands healthy)
function makeCheck() {
  const g = new THREE.Group();
  const m = new THREE.MeshBasicMaterial({
    color: 0x3dff7a,
    toneMapped: false,
    depthTest: false,
    transparent: true,
  });
  const a = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.24, 0.02).translate(0, 0.12, 0), m);
  a.rotation.z = 0.75;
  a.position.set(-0.05, 0, 0);
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.02).translate(0, 0.25, 0), m);
  b.rotation.z = -0.62;
  b.position.set(-0.05, 0, 0);
  for (const x of [a, b]) {
    x.renderOrder = 22;
    g.add(x);
  }
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(0.42, 20),
    new THREE.MeshBasicMaterial({
      color: 0x0e2a18,
      transparent: true,
      opacity: 0.75,
      depthTest: false,
    }),
  );
  disc.position.set(0.04, 0.17, -0.01);
  disc.renderOrder = 21;
  g.add(disc);
  g.visible = false;
  scene.add(g);
  return g;
}
const checks = [makeCheck(), makeCheck()];

// ================================================================ render
function renderAt(t) {
  applyCamera(t);
  burstN = 0;
  // ---------------------------------------------- which place: move the shadow box there
  if (inJoint(t)) {
    key.position.set(JOINT[0] + 14, JOINT[1] + 26, JOINT[2] + 18);
    key.target.position.set(...JOINT);
  } else {
    key.position.copy(KEY_OFFICE);
    key.target.position.set(0, 0, 0);
  }
  key.target.updateMatrixWorld();

  // ---------------------------------------------- your hands
  poseHands(t);
  arm(armR, right, doctorHands(t) ? V(HANDS[0] + 1.2, HANDS[1] + 1.0, HANDS[2] + 3) : SHOULDER_R);
  arm(armL, left, doctorHands(t) ? V(HANDS[0] - 1.2, HANDS[1] + 1.0, HANDS[2] + 3) : SHOULDER_L);
  if (right.group.visible) right.group.updateMatrixWorld(true);
  if (left.group.visible) left.group.updateMatrixWorld(true);
  // bursts at your knuckles
  if (officeHands(t)) {
    T.cracks.forEach((c, i) => {
      const x = i === 1 ? 0.155 : 0;
      burst(t, c, knucklePos(right, x), i === 0 ? 0.5 : 0.42);
    });
  }
  if (doctorHands(t) && t < T.beide)
    for (const a of T.drKnacks) burst(t, a, knucklePos(left, 0), 0.24);
  // knuckle glow: red on "Arthrose", green on "harmlos"
  const red = pop(t, T.arthrose1 - 0.05, T.oma) + pop(t, T.arthrose2, T.studien + 0.4);
  redDot.opacity = clamp01(red) * (0.65 + 0.35 * Math.sin(t * 14));
  redDots.forEach((d) =>
    d.scale.setScalar(Math.max(0.001, clamp01(red) * (0.8 + 0.25 * Math.sin(t * 14)))),
  );
  const grn = pop(t, T.harmlos + 0.15, T.wehtut);
  greenDot.opacity = clamp01(grn) * 0.9;
  greenDots.forEach((d) => d.scale.setScalar(Math.max(0.001, clamp01(grn) * 0.85)));
  // the failed try: an ✕ over the knuckles
  if (t > T.tryFail && t < T.erst) {
    const p = knucklePos(right, 0);
    showNope(pop(t, T.tryFail + 0.05, T.erst), p.x, p.y + 0.35, p.z, 0.32);
  } else showNope(0, 0, 0, 0);

  // ---------------------------------------------- phone: grandma's message
  const msg = smooth(ramp(t, T.oma + 0.1, T.oma + 0.3));
  phoneScreen.material.emissiveIntensity = msg * 0.95;
  phoneScreen.material.color.setScalar(0.15 + msg * 0.85);

  // ---------------------------------------------- people
  const wide = t >= T.trotzdem && t < T.dabei;
  you.g.visible = wide;
  crackArms(you, t, wide ? 1 : 0, T.crowd + 0.1);
  for (const { p, ph, at } of people) {
    const k = wide ? smooth(ramp(t, T.trotzdem, T.trotzdem + 0.3)) : 0;
    crackArms(p, t, k, at);
    if (!wide) {
      // typing
      p.armL.el.rotation.x = -1.1 + Math.sin(t * 13 + ph) * 0.06;
      p.armR.el.rotation.x = -1.1 + Math.sin(t * 11 + ph * 2) * 0.06;
    }
    p.head.rotation.y = Math.sin(t * 0.7 + ph) * 0.15;
    if (wide) {
      p.g.updateMatrixWorld(true);
      const hp = V(0, -1.05, 0).applyMatrix4(p.armL.el.matrixWorld);
      const hp2 = V(0, -1.05, 0).applyMatrix4(p.armR.el.matrixWorld);
      burst(t, at, hp.lerp(hp2, 0.5).add(V(0, 0.25, 0)), 1.1);
    }
  }
  if (wide) {
    you.g.updateMatrixWorld(true);
    const hp = V(0, -1.05, 0).applyMatrix4(you.armL.el.matrixWorld);
    burst(t, T.crowd + 0.1, hp.add(V(0, 0.3, 0)), 1.2);
  }
  // the boss: pulls a face, shakes his head
  const ew =
    smooth(ramp(t, T.chef + 0.1, T.chef + 0.4)) * (1 - smooth(ramp(t, T.dabei, T.dabei + 0.3)));
  chef.face(ew);
  chef.head.rotation.y = Math.sin(t * 9) * 0.22 * ew;
  chef.torso.rotation.x = -0.12 * ew;
  chef.armR.sh.rotation.set(lerp(-0.35, -1.0, ew), 0, -0.1 - 0.4 * ew);
  chef.armR.el.rotation.set(lerp(-1.15, -1.9, ew), 0, 0);

  // ---------------------------------------------- the joint
  const js = jointAt(t);
  J.visible = inJoint(t);
  if (J.visible) {
    boneB.position.x = js.gap;
    // capsule + grease stretch with the gap
    const cx = js.gap * 0.5 - 0.2;
    capsule.position.x = fluid.position.x = cx;
    capsule.scale.set(3.0 + js.gap * 0.45, 2.4, 2.4);
    fluid.scale.set(2.85 + js.gap * 0.45, 2.25, 2.25);
    capMat.opacity = 0.3 * js.cap;
    fluidMat.opacity = 0.3 * js.cap;
    capsule.visible = fluid.visible = js.cap > 0.01;
    // bubble
    bubble.visible = js.bub > 0.01;
    bubble.position.set(js.gap * 0.5, 0, 0);
    bubble.scale.setScalar(Math.max(0.001, js.bub) * (1 + 0.03 * Math.sin(t * 7)));
    bubbleLight.position.copy(bubble.position);
    bubbleLight.intensity = js.bub * 60;
    // shockwave at the pop
    const rp = ramp(t, T.pop, T.pop + 0.5);
    ring.visible = t >= T.pop && rp < 1 && t < T.arthrose2;
    ring.position.set(js.gap * 0.5, 0, 0);
    ring.rotation.y = Math.PI / 2;
    ring.scale.setScalar(0.6 + rp * 4.5);
    ringMat.opacity = 0.9 * (1 - rp);
    // dissolved gas dots (twinkle; converge into the bubble before the pop)
    gasIM.visible = js.gas > 0.01;
    if (gasIM.visible) {
      gasSeeds.forEach((s, i) => {
        const k = clamp01((js.conv - s.d) / (1 - s.d));
        const x = lerp(s.x + js.gap * 0.5, js.gap * 0.5, k * k);
        const y = lerp(s.y, 0, k * k) + Math.sin(t * 2 + s.ph) * 0.06;
        const z = lerp(s.z, 0, k * k);
        const sc = js.gas * (0.7 + 0.5 * Math.sin(t * 6 + s.ph * 3));
        _m4.compose(V(x, y, z), _q.identity(), V(sc, sc, sc));
        gasIM.setMatrixAt(i, _m4);
      });
      gasIM.instanceMatrix.needsUpdate = true;
    }
    animateArrows(
      pullArrows,
      t,
      Math.max(pop(t, T.ziehst + 0.05, T.knackst2), pop(t, T.faellt + 0.05, T.pop + 0.1)),
    );
    // the finger skin is glass the whole time inside
    setXray([skinMat], 1);
    skinEdges.visible = true;
  } else {
    animateArrows(pullArrows, t, 0);
  }

  // ---------------------------------------------- cola: cap off, fizz up
  const capT = ramp(t, T.cap, T.cap + 0.7);
  colaCap.position.set(
    CAP0.x + capT * 0.8,
    CAP0.y + Math.sin(capT * Math.PI) * 1.2 + capT * 0.3,
    CAP0.z + capT * 0.5,
  );
  colaCap.rotation.set(capT * 9, 0, capT * 4);
  colaCap.visible = t < T.cap + 0.7 || t < T.cap;
  if (t >= T.cap + 0.7) colaCap.visible = false;
  const fizzOn = t >= T.cap && t < T.cap + 2.4;
  fizzIM.visible = fizzOn;
  if (fizzOn) {
    fizzSeeds.forEach((s, i) => {
      const u = ((t - T.cap) * s.v * 0.45 + s.d) % 1.2;
      const h = u * 1.6;
      const r = 0.06 + u * s.sp;
      const x = COLA[0] + Math.cos(s.a) * r;
      const z = COLA[2] + Math.sin(s.a) * r;
      const y = DESK_Y + 1.95 + h;
      const sc = s.s * (1 - u / 1.2) * smooth(ramp(t, T.cap, T.cap + 0.2));
      _m4.compose(V(x, y, z), _q.identity(), V(sc, sc, sc));
      fizzIM.setMatrixAt(i, _m4);
    });
    fizzIM.instanceMatrix.needsUpdate = true;
  }

  // ---------------------------------------------- wall clock: races 20 minutes forward
  const extra = smooth(ramp(t, T.erst + 0.1, T.minuten + 0.6)) * 20; // minutes
  const mins = 47 + t / 60 + extra;
  clock.userData.min.rotation.z = -(mins / 60) * Math.PI * 2;
  clock.userData.hour.rotation.z = -((16 + mins / 60) / 12) * Math.PI * 2;
  clock.userData.sec.rotation.z = -(Math.floor(t) / 60 + extra) * Math.PI * 2;

  // ---------------------------------------------- HUD + panel
  const sw = pop(t, T.derselbe, T.lange);
  if (sw > 0) {
    const secs =
      t < T.erst
        ? (t - T.derselbe) * 3
        : lerp((T.erst - T.derselbe) * 3, 1200, smooth(ramp(t, T.erst + 0.1, T.minuten + 0.6)));
    stopwatch("pause", sw, { seconds: secs, max: 1200, label: "Pause", x: 640, y: 1180 });
  }
  if (t >= T.faellt && t < T.arthrose2) {
    const pr = lerp(1, 0.35, smooth(ramp(t, T.faellt + 0.1, T.pop)));
    gauge("druck", pop(t, T.faellt + 0.1, T.arthrose2), {
      label: "Druck",
      value: pr,
      max: 1,
      unit: "bar",
      x: 620,
      y: 400,
      color: "#4fc3ff",
      digits: 2,
    });
  }
  if (t >= T.sechzig - 0.2 && t < T.folge + 1) {
    counter("jahre", pop(t, T.sechzig - 0.1, T.folge + 2), {
      label: "Jahre geknackt",
      value: Math.round(60 * smooth(ramp(t, T.sechzig - 0.1, T.linke + 0.3))),
      x: 60,
      y: 1180,
      color: "#ffd23f",
    });
  }
  if (t >= T.studien && t < T.knacken2)
    showPanel(pop(t, T.studien, T.knacken2), "STUDIEN", "KEIN BEFUND", LED.green);
  else if (t >= T.wehtut && t < T.fakt)
    showPanel(pop(t, T.wehtut, T.fakt), "SCHMERZEN?", "AB ZUM ARZT", LED.yellow);
  else showPanel(0);

  // ---------------------------------------------- labels
  labels(t, LABELS);
  if (doctorHands(t)) {
    // both healthy: green checks over both hands
    checks.forEach((g, i) => {
      const k = clamp01(ramp(t, T.gesund - 0.05 + i * 0.12, T.gesund + 0.3 + i * 0.12));
      g.visible = k > 0;
      const p = knucklePos(i ? right : left, 0);
      g.position.set(p.x, p.y + 0.42, p.z + 0.05);
      g.quaternion.copy(camera.quaternion);
      g.scale.setScalar(Math.max(0.001, outBack(k) * 0.55));
    });
  } else checks.forEach((g) => (g.visible = false));

  // hide unused bursts
  for (let i = burstN; i < burstPool.length; i++) burstPool[i].visible = false;
  renderFrame();
}

start(renderAt);
