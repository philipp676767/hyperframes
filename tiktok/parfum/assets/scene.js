// Scene of #54 "Parfum": you in the morning S-Bahn, the golden mist of your
// perfume, the passenger three seats on who smells you, the flask in x-ray,
// the drop on your skin (macro pocket SKIN), the sperm whale gliding past
// the windows (Ambra in its gut), the lab flask, the nose cut-away with its
// smell cells switching off (pocket NOSE), and a summer memory in a bubble.
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
  jitter,
  xrayMaterial,
  xrayEdges,
  setXray,
  edgeMat,
  showPanel,
  LED,
  labels,
  showLabel,
  squash,
  puff,
  highlights,
  shotCamera,
  renderFrame,
  start,
  outBack,
  roundedRect,
} from "./world.js";
import "./set.js";
import { parasol } from "./props.js";
import { createHand } from "./hand.js";
import { readout } from "./hud.js";
import {
  T,
  shots,
  LABELS,
  HIGHLIGHTS,
  YOU,
  PA,
  PB,
  TABLE,
  SKIN,
  NOSE,
  WHALE_Z,
  FLAKON,
  SEAT_H,
} from "./beats.js";

highlights(HIGHLIGHTS);

// the sun's shadow light follows the place on screen (wagon / pockets)
const key = scene.children.find((o) => o.isDirectionalLight && o.castShadow);
scene.add(key.target);
key.shadow.camera.far = 80;
key.shadow.camera.updateProjectionMatrix();
const KEY_WAGON = key.position.clone();

const glowMat = (color, i = 1.4, extra = {}) =>
  flat(0xffffff, { emissive: color, emissiveIntensity: i, ...extra });
const mesh = (geo, mat, parent, x = 0, y = 0, z = 0, amt = 0.05, seed = 1) => {
  const m = new THREE.Mesh(facet(geo, amt, seed), facetMat(mat));
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};

// ================================================================ people
// Toy low-poly people. Local frame: facing +z, origin on the seat top
// (seated) or on the floor (standing).
function person({
  skin = 0xf1c09a,
  top = 0x4a7bd6,
  legs = 0x2f3a4f,
  hair = 0x3a2a20,
  style = "short",
  stand = false,
  seed = 1,
  hood = false,
}) {
  const g = new THREE.Group();
  const body = new THREE.Group();
  g.add(body);
  const hip = stand ? 3.7 : 0;
  const skinM = flat(skin, { roughness: 0.7 });
  const topM = flat(top, { roughness: 0.9 });
  const legM = flat(legs, { roughness: 0.9 });
  const hairM = flat(hair, { roughness: 0.8 });
  // torso (slightly tapered), leaning back a touch when seated
  const torso = new THREE.Group();
  torso.position.y = hip;
  torso.rotation.x = stand ? 0 : -0.06;
  body.add(torso);
  mesh(
    jitter(new THREE.CylinderGeometry(0.72, 0.62, 2.2, 8), 0.02, seed),
    topM,
    torso,
    0,
    1.15,
    0,
    0.06,
    seed,
  ).scale.set(1.08, 1, 0.62);
  if (hood)
    mesh(
      new THREE.TorusGeometry(0.42, 0.18, 6, 10),
      topM,
      torso,
      0,
      2.28,
      -0.25,
      0.06,
      seed + 2,
    ).rotation.x = Math.PI / 2 - 0.4;
  // neck + head
  mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.45, 7), skinM, torso, 0, 2.4, 0, 0.04, seed + 3);
  const head = new THREE.Group();
  head.position.set(0, 2.85, 0.04);
  head.scale.setScalar(1.22);
  torso.add(head);
  const skull = mesh(
    jitter(new THREE.IcosahedronGeometry(0.5, 1), 0.02, seed + 4),
    skinM,
    head,
    0,
    0,
    0,
    0.05,
    seed + 4,
  );
  skull.scale.set(0.95, 1.08, 1);
  const dark = flat(0x1d1a22, { roughness: 0.5 });
  const eyes = [];
  for (const sx of [-1, 1]) {
    const e = mesh(new THREE.SphereGeometry(0.065, 6, 5), dark, head, sx * 0.17, 0.06, 0.44, 0, 1);
    e.castShadow = false;
    eyes.push(e);
  }
  const brows = [];
  for (const sx of [-1, 1]) {
    const b = mesh(
      new THREE.BoxGeometry(0.2, 0.045, 0.05),
      hairM,
      head,
      sx * 0.17,
      0.2,
      0.45,
      0,
      1,
    );
    b.castShadow = false;
    brows.push(b);
  }
  const nose = mesh(
    new THREE.ConeGeometry(0.075, 0.2, 5),
    skinM,
    head,
    0,
    -0.03,
    0.5,
    0.04,
    seed + 5,
  );
  nose.rotation.x = Math.PI / 2 + 0.3;
  const mouth = mesh(
    new THREE.BoxGeometry(0.2, 0.04, 0.04),
    flat(0x9a3f45),
    head,
    0,
    -0.22,
    0.44,
    0,
    1,
  );
  mouth.castShadow = false;
  // hair
  const cap = mesh(
    new THREE.SphereGeometry(0.54, 10, 7, 0, Math.PI * 2, 0, Math.PI * 0.55),
    hairM,
    head,
    0,
    0.04,
    -0.04,
    0.06,
    seed + 6,
  );
  cap.rotation.x = -0.35;
  if (style === "long")
    mesh(new THREE.BoxGeometry(0.98, 1.1, 0.4), hairM, head, 0, -0.45, -0.3, 0.06, seed + 7);
  if (style === "bun")
    mesh(new THREE.IcosahedronGeometry(0.26, 1), hairM, head, 0, 0.5, -0.3, 0.06, seed + 8);
  if (style === "cap") {
    const c = mesh(
      new THREE.SphereGeometry(0.56, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.45),
      flat(0xe2453c),
      head,
      0,
      0.08,
      0,
      0.04,
      seed + 9,
    );
    c.rotation.x = -0.15;
    mesh(
      new THREE.BoxGeometry(0.62, 0.05, 0.42),
      flat(0xe2453c),
      head,
      0,
      0.26,
      0.5,
      0.03,
      seed + 10,
    ).rotation.x = 0.15;
  }
  // arms: shoulder pivot → upper arm → elbow pivot → forearm + hand
  const arm = (sx) => {
    const sh = new THREE.Group();
    sh.position.set(sx * 0.82, 2.0, 0);
    torso.add(sh);
    mesh(new THREE.CapsuleGeometry(0.2, 0.85, 2, 7), topM, sh, 0, -0.55, 0, 0.05, seed + 11);
    const el = new THREE.Group();
    el.position.y = -1.1;
    sh.add(el);
    mesh(new THREE.CapsuleGeometry(0.18, 0.75, 2, 7), topM, el, 0, -0.5, 0, 0.05, seed + 12);
    mesh(new THREE.IcosahedronGeometry(0.2, 0), skinM, el, 0, -1.05, 0, 0.05, seed + 13);
    return { sh, el };
  };
  const armL = arm(1);
  const armR = arm(-1);
  // legs
  for (const sx of [-1, 1]) {
    if (stand) {
      mesh(
        new THREE.CapsuleGeometry(0.27, 2.9, 2, 7),
        legM,
        body,
        sx * 0.36,
        2.05,
        0,
        0.05,
        seed + 14,
      );
      mesh(
        new THREE.BoxGeometry(0.4, 0.3, 0.8),
        dark,
        body,
        sx * 0.36,
        0.15,
        0.15,
        0.03,
        seed + 15,
      );
    } else {
      const th = mesh(
        new THREE.CapsuleGeometry(0.3, 1.45, 2, 7),
        legM,
        body,
        sx * 0.38,
        0.25,
        0.95,
        0.05,
        seed + 14,
      );
      th.rotation.x = Math.PI / 2;
      mesh(
        new THREE.CapsuleGeometry(0.25, 1.4, 2, 7),
        legM,
        body,
        sx * 0.38,
        -0.75,
        1.85,
        0.05,
        seed + 15,
      );
      mesh(
        new THREE.BoxGeometry(0.4, 0.3, 0.8),
        dark,
        body,
        sx * 0.38,
        -1.65,
        2.1,
        0.03,
        seed + 16,
      );
    }
  }
  scene.add(g);
  const P = { g, torso, head, eyes, brows, nose, mouth, armL, armR, hip };
  // pose helpers ------------------------------------------------------
  P.rest = (a, s = 1) => {
    a.sh.rotation.set(-0.35, 0, s * 0.1);
    a.el.rotation.set(-1.15, 0, 0);
  };
  P.fan = (a, t, k, s = 1) => {
    // forearm up in front of the face, waving
    a.sh.rotation.set(
      lerp(-0.35, -1.25, k),
      0,
      s * lerp(0.1, 0.5, k) + k * Math.sin(t * 15) * 0.16,
    );
    a.el.rotation.set(lerp(-1.15, -1.75, k), 0, 0);
  };
  P.face = (k) => {
    // k 0..1: wrinkled nose, brows down, mouth pinched
    P.brows[0].rotation.z = -0.45 * k;
    P.brows[1].rotation.z = 0.45 * k;
    P.brows[0].position.y = P.brows[1].position.y = 0.2 - 0.05 * k;
    P.nose.scale.set(1 + 0.25 * k, 1 - 0.3 * k, 1);
    P.mouth.scale.set(1 - 0.45 * k, 1 + 0.6 * k, 1);
    for (const e of P.eyes) e.scale.y = 1 - 0.55 * k;
  };
  P.smile = (k) => {
    P.mouth.scale.set(1 + 0.5 * k, 1, 1);
    P.mouth.position.y = -0.22 + 0.02 * k;
    for (const e of P.eyes) e.scale.y = Math.max(0.2, 1 - 0.8 * k);
  };
  P.rest(armL, 1);
  P.rest(armR, -1);
  return P;
}
const face = (p, yaw) => (p.g.rotation.y = yaw);
const FACE_PX = Math.PI / 2; // facing +x
const FACE_NX = -Math.PI / 2;

// you: coral hoodie, dark bun, bench facing +x
const you = person({
  top: 0xe96d5a,
  legs: 0x3b4a6b,
  hair: 0x2e2018,
  style: "bun",
  seed: 10,
  hood: true,
  skin: 0xf3c4a0,
});
you.g.position.set(...YOU);
face(you, FACE_PX);
// passenger A, next bay, facing you: mustard jacket, long hair
const pa = person({
  top: 0xe0a93b,
  legs: 0x2b2f3a,
  hair: 0x5a3422,
  style: "long",
  seed: 20,
  skin: 0xe8b48e,
});
pa.g.position.set(...PA);
face(pa, FACE_NX);
// passenger B standing in the aisle with a cap, phone in hand
const pb = person({
  top: 0x3f8f6a,
  legs: 0x2a3550,
  hair: 0x2a2220,
  style: "cap",
  stand: true,
  seed: 30,
  skin: 0xc98f6a,
});
pb.g.position.set(...PB);
face(pb, FACE_NX + 0.5);
// passenger C on the other side, reading
const pc = person({
  top: 0x8a6bd6,
  legs: 0x3a3a44,
  hair: 0xd9d4cc,
  style: "short",
  seed: 40,
  skin: 0xf0c6a6,
});
pc.g.position.set(3.2, SEAT_H, 2.4);
face(pc, FACE_NX);
// passenger D opposite you at the window, asleep with headphones
const pd = person({
  top: 0x5a6b7a,
  legs: 0x2b2f3a,
  hair: 0x1f1a18,
  style: "short",
  seed: 50,
  skin: 0xb5805e,
});
pd.g.position.set(3.3, SEAT_H, -4.6);
face(pd, FACE_NX);
pd.head.rotation.z = 0.28;
for (const e of pd.eyes) e.scale.y = 0.18;
{
  const hp = mesh(
    new THREE.TorusGeometry(0.56, 0.06, 5, 14, Math.PI),
    flat(0x222428),
    pd.head,
    0,
    0.05,
    0,
    0.02,
    51,
  );
  hp.rotation.y = Math.PI / 2;
  for (const sx of [-1, 1])
    mesh(
      new THREE.CylinderGeometry(0.17, 0.17, 0.12, 10),
      flat(0xe8e8ec),
      pd.head,
      sx * 0.53,
      0.0,
      0,
      0.02,
      52,
    ).rotation.z = Math.PI / 2;
}
// B's phone
{
  const ph = mesh(
    new THREE.BoxGeometry(0.34, 0.6, 0.05),
    flat(0x1b1d22, { roughness: 0.3 }),
    pb.armL.el,
    0,
    -1.25,
    0.12,
    0,
    1,
  );
  ph.rotation.x = -0.4;
  mesh(new THREE.PlaneGeometry(0.28, 0.52), glowMat(0x7fd0ff, 0.8), ph, 0, 0, 0.03, 0, 1);
}
// C's book
{
  const bk = mesh(
    new THREE.BoxGeometry(0.9, 0.06, 0.65),
    flat(0x3a6fd0),
    pc.torso,
    0,
    1.1,
    1.45,
    0.03,
    41,
  );
  bk.rotation.x = -0.6;
}

// "?" over your head at midday
const qTex = (() => {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  g.font = "900 210px Montserrat, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.lineWidth = 22;
  g.strokeStyle = "#1c1c22";
  g.strokeText("?", 128, 140);
  g.fillStyle = "#ffd23f";
  g.fillText("?", 128, 140);
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace;
  return tx;
})();
const qmark = new THREE.Sprite(
  new THREE.SpriteMaterial({ map: qTex, transparent: true, depthTest: false }),
);
qmark.renderOrder = 10;
scene.add(qmark);

// ================================================================ your hand + the flask
const hand = createHand({ sleeve: 0xe96d5a, skin: 0xf3c4a0, scale: 1 });
const HOLD = { index: 0.2, middle: 1.25, ring: 1.35, pinky: 1.4, thumb: 0.95 };
const PRESS = { index: 0.62, middle: 1.25, ring: 1.35, pinky: 1.4, thumb: 0.95 };
// the flask sits under the fingers; local frame of the hand (fingers +z)
const FL_LOCAL = V(0.1, -0.43, 0.6);
function makeFlakon(glassColor = 0xffc6d9, liquidColor = 0xffb347) {
  const g = new THREE.Group();
  const glassM = xrayMaterial(glassColor, { roughness: 0.05, metalness: 0.1, opacity: 0.55 });
  glassM.userData.solidOpacity = 0.55;
  const shape = roundedRect(0.44, 0.46, 0.08);
  const bodyGeo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.24,
    bevelEnabled: true,
    bevelSize: 0.025,
    bevelThickness: 0.025,
    bevelSegments: 1,
    curveSegments: 3,
  });
  bodyGeo.center();
  const body = new THREE.Mesh(bodyGeo, glassM);
  g.add(body);
  const edges = xrayEdges(bodyGeo);
  g.add(edges);
  // the liquid: mostly alcohol (pale gold) with tiny drops of scent oil inside
  const liq = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.3, 0.2),
    new THREE.MeshStandardMaterial({
      color: liquidColor,
      roughness: 0.15,
      transparent: true,
      opacity: 0.85,
      emissive: liquidColor,
      emissiveIntensity: 0.25,
    }),
  );
  liq.position.y = -0.06;
  g.add(liq);
  const oils = [];
  const rr = rng(7);
  const oc = [0xfff06a, 0xff6fae, 0x8f5bff];
  for (let i = 0; i < 12; i++) {
    const o = new THREE.Mesh(new THREE.IcosahedronGeometry(0.022, 0), glowMat(oc[i % 3], 1.2));
    o.position.set((rr() - 0.5) * 0.3, -0.18 + rr() * 0.22, (rr() - 0.5) * 0.14);
    o.userData.ph = rr() * 6;
    g.add(o);
    oils.push(o);
  }
  // the dip tube
  const tube = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.42, 4),
    flat(0xffffff, { transparent: true, opacity: 0.7 }),
  );
  tube.position.y = 0.0;
  g.add(tube);
  // gold collar + pump head with its nozzle facing +z
  const gold = new THREE.MeshStandardMaterial({
    color: 0xe8b85a,
    metalness: 0.85,
    roughness: 0.22,
  });
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.07, 10), gold);
  collar.position.y = 0.285;
  g.add(collar);
  const pump = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.072, 0.1, 10), gold);
  pump.position.y = 0.37;
  g.add(pump);
  const noz = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.03, 6), flat(0x1c1c22));
  noz.rotation.x = Math.PI / 2;
  noz.position.set(0, 0.37, 0.072);
  g.add(noz);
  for (const m of [body, collar, pump]) m.castShadow = true;
  return { g, glassM, oils, liq };
}
const flakon = makeFlakon();
flakon.g.position.copy(FL_LOCAL);
hand.group.add(flakon.g);
const NOZ_LOCAL = V(FL_LOCAL.x, FL_LOCAL.y + 0.37, FL_LOCAL.z + 0.1);
// hand pose so the flask lands on point F, fingers pointing at yaw ry
const handAt = (F, ry) => {
  const o = FL_LOCAL.clone().applyAxisAngle(V(0, 1, 0), ry);
  return [F[0] - o.x, F[1] - o.y, F[2] - o.z];
};
const RY0 = 1.02;
const H0 = handAt(FLAKON, RY0);
const H1 = handAt([-1.75, 4.15, -2.0], 1.35);
const HAND_KEYS = [
  { t: -1.0, pos: H0, rot: [0, RY0, 0], pose: HOLD },
  { t: -0.36, pos: H0, rot: [0, RY0, 0], pose: HOLD },
  { t: -0.26, pos: H0, rot: [0, RY0, 0], pose: PRESS },
  { t: 0.08, pos: H0, rot: [0, RY0, 0], pose: PRESS },
  { t: 0.35, pos: H0, rot: [0, RY0, 0], pose: HOLD },
  { t: 1.9, pos: H0, rot: [0, RY0, 0], pose: HOLD },
  { t: 2.25, pos: H1, rot: [0, 1.35, 0], pose: HOLD },
  { t: T.spray[1] - 0.08, pos: H1, rot: [0, 1.35, 0], pose: PRESS },
  { t: T.spray[1] + 0.15, pos: H1, rot: [0, 1.35, 0], pose: HOLD },
  { t: T.spray[2] - 0.08, pos: H1, rot: [0, 1.35, 0], pose: PRESS },
  { t: T.spray[2] + 0.15, pos: H1, rot: [0, 1.35, 0], pose: HOLD },
  { t: T.mittags, pos: H1, rot: [0, 1.35, 0], pose: HOLD, out: true },
  { t: T.sprueht - 0.2, pos: H0, rot: [0, RY0, 0], pose: HOLD },
  { t: T.spray[3] - 0.1, pos: H0, rot: [0, RY0, 0], pose: PRESS },
  { t: T.spray[3] + 0.2, pos: H0, rot: [0, RY0, 0], pose: HOLD },
  { t: T.leute, pos: H0, rot: [0, RY0, 0], pose: HOLD, out: true },
  { t: T.flakon - 0.2, pos: H0, rot: [0, RY0, 0], pose: HOLD },
  { t: T.auf, pos: H0, rot: [0, RY0, 0], pose: HOLD, out: true },
];
// your right arm: a sleeve from the shoulder to the hand's wrist
const sleeve = mesh(
  new THREE.CapsuleGeometry(0.2, 1, 2, 7),
  flat(0xe96d5a, { roughness: 0.9 }),
  scene,
);
const YOU_SHOULDER = V(YOU[0] - 0.1, YOU[1] + 2.0, YOU[2] + 0.82);

// ================================================================ the spray + your cloud
// one burst per spray moment: droplets fly out of the nozzle in a cone,
// slow down, grow and fade into the haze
const SPRAY_N = 110;
const sprayIM = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(1, 0),
  new THREE.MeshBasicMaterial({
    color: 0xffe7a8,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
  }),
  SPRAY_N * T.spray.length,
);
sprayIM.frustumCulled = false;
sprayIM.userData.noAO = true;
scene.add(sprayIM);
const sprayCol = new THREE.Color();
const spraySeeds = Array.from({ length: SPRAY_N }, (_, i) => {
  const rr = rng(500 + i);
  return {
    a: rr() * Math.PI * 2,
    c: Math.sqrt(rr()),
    v: 5 + rr() * 6,
    s: 0.6 + rr() * 0.8,
    l: 1.6 + rr() * 1.4,
    up: rr(),
  };
});
const _m4 = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _v = V(0, 0, 0);
function nozzleAt(ts) {
  hand.track(ts, HAND_KEYS);
  hand.group.updateMatrixWorld(true);
  const o = NOZ_LOCAL.clone().applyMatrix4(hand.group.matrixWorld);
  const d = V(0, 0, 1).applyQuaternion(hand.group.getWorldQuaternion(new THREE.Quaternion()));
  return { o, d };
}
function drawSpray(t) {
  let idx = 0;
  T.spray.forEach((s) => {
    const age0 = t - s;
    const live = age0 > 0 && age0 < 3.2;
    const { o, d } = live ? nozzleAt(s + 0.02) : { o: V(0, 0, 0), d: V(1, 0, 0) };
    const side = V(0, 1, 0).cross(d).normalize();
    const upv = d.clone().cross(side).normalize();
    for (let i = 0; i < SPRAY_N; i++, idx++) {
      const p = spraySeeds[i];
      const age = age0 - (i % 7) * 0.012;
      if (!live || age <= 0 || age > p.l) {
        _m4.makeScale(0, 0, 0);
        sprayIM.setMatrixAt(idx, _m4);
        continue;
      }
      const dist = (p.v / 3.2) * (1 - Math.exp(-3.2 * age));
      const cone = 0.32 * p.c;
      _v.copy(d)
        .addScaledVector(side, Math.cos(p.a) * cone)
        .addScaledVector(upv, Math.sin(p.a) * cone)
        .normalize()
        .multiplyScalar(dist)
        .add(o);
      _v.y += age * (0.18 + p.up * 0.2);
      const grow = 0.02 + Math.min(age, 1) * 0.11 * p.s;
      const fade = 1 - smooth(clamp01((age - p.l * 0.55) / (p.l * 0.45)));
      const sc = grow * fade * smooth(clamp01((_v.distanceTo(camera.position) - 0.35) / 0.6));
      _m4.compose(_v, _q.identity(), V(sc, sc, sc));
      sprayIM.setMatrixAt(idx, _m4);
      sprayIM.setColorAt(idx, sprayCol.setHex(i % 5 === 0 ? 0xffffff : 0xffd98a));
    }
  });
  sprayIM.instanceMatrix.needsUpdate = true;
  if (sprayIM.instanceColor) sprayIM.instanceColor.needsUpdate = true;
}

// the haze: soft puffs spreading from you through the bay
const HAZE_N = 90;
const hazeMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.16,
  depthWrite: false,
});
if (window.__noHaze) hazeMat.visible = false;
const hazeIM = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), hazeMat, HAZE_N);
hazeIM.frustumCulled = false;
hazeIM.userData.noAO = true;
scene.add(hazeIM);
const hazeSeeds = Array.from({ length: HAZE_N }, (_, i) => {
  const rr = rng(700 + i);
  const x = -6 + Math.pow(rr(), 0.8) * 19;
  const y = 2.6 + rr() * 5.0;
  const z = -5.2 + rr() * 6.4;
  const d = Math.hypot(x - -2.2, (y - 4.4) * 0.7, z - -2.2);
  return { x, y, z, d, s: 0.7 + rr() * 0.9, ph: rr() * 6 };
});
const C_GOLD = new THREE.Color(0xffd36b);
const C_TOP = new THREE.Color(0xe9f56a);
const C_MID = new THREE.Color(0xff8fc0);
const C_BASE = new THREE.Color(0xa47cff);
const hc = new THREE.Color();
function drawHaze(t) {
  const reach = t < -0.2 ? 0 : Math.min(16, 1.0 + 1.55 * (t + 0.2));
  const split = smooth(ramp(t, T.verwandelt - 0.1, T.verwandelt + 0.5));
  const late = smooth(ramp(t, T.sie1, T.darum1));
  hazeSeeds.forEach((p, i) => {
    const k = smooth(clamp01((reach - p.d) / 2.2));
    _v.set(
      p.x + Math.sin(t * 0.35 + p.ph) * 0.45,
      p.y + Math.sin(t * 0.5 + p.ph * 2) * 0.25,
      p.z + Math.cos(t * 0.3 + p.ph) * 0.3,
    );
    const near = smooth(clamp01((_v.distanceTo(camera.position) - p.s - 0.8) / 2.5));
    const sc = k * p.s * near;
    _m4.compose(_v, _q.identity(), V(sc, sc * 0.8, sc));
    hazeIM.setMatrixAt(i, _m4);
    const layer = p.y > 5.9 ? C_TOP : p.y > 4.1 ? C_MID : C_BASE;
    hc.copy(C_GOLD)
      .lerp(layer, split)
      .lerp(C_BASE, late * 0.55);
    hazeIM.setColorAt(i, hc);
  });
  hazeIM.instanceMatrix.needsUpdate = true;
  hazeIM.instanceColor.needsUpdate = true;
  hazeMat.opacity =
    lerp(0.07, 0.12, smooth(ramp(t, 0, 8))) + 0.05 * pop(t, T.verwandelt, T.flakon) * 1;
  hazeMat.opacity *= 1 - 0.75 * pop(t, T.rate, T.darum1 - 0.2, 0.3);
}

// ================================================================ bottles on the window table
const bottles = [];
{
  const specs = [
    { glass: 0xff9ec4, liq: 0xffb6d0, shape: "round" },
    { glass: 0x2a2a30, liq: 0xffc76a, shape: "square" },
    { glass: 0x6fb6ff, liq: 0xbfe4ff, shape: "tall" },
    { glass: 0xb47cff, liq: 0xe0c4ff, shape: "gem" },
    { glass: 0x6fd39a, liq: 0xd7ffb0, shape: "drop" },
  ];
  specs.forEach((s, i) => {
    const g = new THREE.Group();
    const gm = new THREE.MeshStandardMaterial({
      color: s.glass,
      roughness: 0.08,
      metalness: 0.15,
      transparent: true,
      opacity: 0.75,
    });
    let geo;
    if (s.shape === "round") geo = new THREE.IcosahedronGeometry(0.17, 1).scale(1, 1.05, 0.8);
    else if (s.shape === "square") geo = new THREE.BoxGeometry(0.28, 0.3, 0.16);
    else if (s.shape === "tall") geo = new THREE.CylinderGeometry(0.09, 0.1, 0.42, 8);
    else if (s.shape === "gem") geo = new THREE.OctahedronGeometry(0.2, 0).scale(1, 1.15, 0.75);
    else geo = new THREE.DodecahedronGeometry(0.17, 0).scale(0.9, 1.2, 0.8);
    geo.computeBoundingBox();
    const h = geo.boundingBox.max.y - geo.boundingBox.min.y;
    const body = new THREE.Mesh(geo, gm);
    body.position.y = h / 2;
    body.castShadow = true;
    g.add(body);
    const inner = new THREE.Mesh(
      geo.clone().scale(0.75, 0.6, 0.75),
      new THREE.MeshStandardMaterial({
        color: s.liq,
        emissive: s.liq,
        emissiveIntensity: 0.3,
        roughness: 0.2,
      }),
    );
    inner.position.y = h * 0.4;
    g.add(inner);
    const capM = new THREE.MeshStandardMaterial({
      color: i === 4 ? 0x9a6a38 : 0xe8b85a,
      metalness: i === 4 ? 0 : 0.85,
      roughness: 0.25,
    });
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.12, 8), capM);
    cap.position.y = h + 0.06;
    cap.castShadow = true;
    g.add(cap);
    g.position.set(TABLE[0] - 0.52 + i * 0.26, TABLE[1] + 0.06, TABLE[2] + (i % 2 ? 0.18 : -0.05));
    scene.add(g);
    bottles.push(g);
  });
}

// ================================================================ the lab flask
const flask = new THREE.Group();
flask.position.set(TABLE[0] + 0.45, TABLE[1] + 0.06, TABLE[2] + 0.3);
scene.add(flask);
const flaskBubbles = [];
{
  const prof = [
    [0.0, 0],
    [0.46, 0],
    [0.5, 0.06],
    [0.2, 0.62],
    [0.13, 0.78],
    [0.13, 1.05],
    [0.16, 1.1],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const glass = new THREE.Mesh(
    new THREE.LatheGeometry(prof, 10),
    new THREE.MeshStandardMaterial({
      color: 0xcfeaff,
      roughness: 0.05,
      metalness: 0.1,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  glass.castShadow = true;
  flask.add(glass);
  const liqProf = [
    [0.0, 0.02],
    [0.44, 0.02],
    [0.47, 0.07],
    [0.3, 0.4],
    [0.0, 0.4],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  flask.add(
    new THREE.Mesh(
      new THREE.LatheGeometry(liqProf, 10),
      new THREE.MeshStandardMaterial({
        color: 0xffd36b,
        emissive: 0xffb02e,
        emissiveIntensity: 0.45,
        roughness: 0.2,
      }),
    ),
  );
  for (let i = 0; i < 9; i++) {
    const b = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.03, 0),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
    );
    b.userData.ph = i / 9;
    b.userData.x = (rng(900 + i)() - 0.5) * 0.4;
    flask.add(b);
    flaskBubbles.push(b);
  }
  // a little ball-and-stick molecule model next to it (lab-made Ambra)
  const mol = new THREE.Group();
  mol.position.set(-0.75, 0.45, 0.05);
  flask.add(mol);
  const pts = [
    [0, 0, 0],
    [0.22, 0.12, 0],
    [-0.2, 0.15, 0.08],
    [0.05, -0.22, 0.1],
    [0.3, -0.1, -0.12],
    [-0.15, -0.1, -0.2],
  ];
  pts.forEach(([x, y, z], i) => {
    const a = new THREE.Mesh(
      new THREE.IcosahedronGeometry(i ? 0.065 : 0.085, 1),
      flat(i % 2 ? 0xf4f4f8 : 0x8f5bff, { roughness: 0.3 }),
    );
    a.position.set(x, y, z);
    a.castShadow = true;
    mol.add(a);
    if (i) {
      const stick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, V(x, y, z).length(), 4),
        flat(0xcfcfd8),
      );
      stick.position.set(x / 2, y / 2, z / 2);
      stick.quaternion.setFromUnitVectors(V(0, 1, 0), V(x, y, z).normalize());
      mol.add(stick);
    }
  });
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 4), flat(0x9aa6b2));
  stand.position.set(-0.75, 0.2, 0.05);
  flask.add(stand);
  flask.userData.mol = mol;
}

// ================================================================ the sperm whale
const whale = new THREE.Group();
scene.add(whale);
const whaleMat = xrayMaterial(0x5d6f8a, { roughness: 0.55 });
const whaleBits = {};
const whaleFM = facetMat(whaleMat);
{
  const prof = [
    [0.01, -11],
    [0.7, -9.5],
    [1.5, -7],
    [2.5, -3],
    [3.1, 1],
    [3.3, 5],
    [3.25, 8.5],
    [2.9, 10.3],
    [1.8, 11],
    [0.01, 11.1],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const geo = new THREE.LatheGeometry(prof, 9).rotateZ(Math.PI / 2);
  geo.scale(1, 0.95, 0.8);
  const body = new THREE.Mesh(facet(geo, 0.06, 3), facetMat(whaleMat));
  whale.add(body);
  const be = xrayEdges(geo);
  whale.add(be);
  // lower jaw + belly stripe, eye, flippers, flukes
  const pale = flat(0xc9d2dd);
  const jaw = mesh(new THREE.BoxGeometry(6.5, 0.4, 1.2), pale, whale, -7.0, -2.75, 0, 0.04, 4);
  jaw.rotation.z = 0.04;
  for (const sz of [-1, 1]) {
    const eye = mesh(
      new THREE.SphereGeometry(0.22, 6, 5),
      flat(0x101014),
      whale,
      -6.4,
      -0.8,
      sz * 2.3,
      0,
      1,
    );
    eye.castShadow = false;
    const fl = mesh(
      new THREE.BoxGeometry(2.2, 0.25, 1.0),
      whaleMat,
      whale,
      -4.5,
      -2.2,
      sz * 2.4,
      0.04,
      5,
    );
    fl.rotation.set(sz * 0.5, 0, -0.3);
  }
  const tail = new THREE.Group();
  tail.position.set(10.6, 0, 0);
  whale.add(tail);
  for (const sz of [-1, 1]) {
    const f = new THREE.Mesh(
      facet(new THREE.BoxGeometry(2.4, 0.25, 3.0), 0.05, 6),
      facetMat(whaleMat),
    );
    f.position.set(0.9, 0, sz * 1.6);
    f.rotation.y = sz * 0.35;
    tail.add(f);
  }
  whaleBits.tail = tail;
  // the gut (pink tube) and the Ambra lump inside it
  const gutPts = [];
  for (let k = 0; k <= 12; k++) {
    const x = -5 + k * 1.05;
    gutPts.push(V(x, -0.9 + Math.sin(k * 1.3) * 0.35, Math.cos(k * 1.1) * 0.5));
  }
  const gut = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(gutPts), 60, 0.45, 7),
    flat(0xff7f9e, { emissive: 0xff3f6e, emissiveIntensity: 0.35 }),
  );
  whale.add(gut);
  whaleBits.gut = gut;
  const lump = new THREE.Mesh(
    facet(jitter(new THREE.IcosahedronGeometry(0.85, 0), 0.15, 9), 0.1, 9),
    facetMat(flat(0xd8c89a, { emissive: 0xffc94a, emissiveIntensity: 0.7, roughness: 0.6 })),
  );
  lump.position.set(3.0, -0.9, 0.1);
  whale.add(lump);
  whaleBits.lump = lump;
}

// ================================================================ pocket SKIN: drop, alcohol, scent molecules
const skin = new THREE.Group();
skin.position.set(...SKIN);
scene.add(skin);
const dropMat = new THREE.MeshStandardMaterial({
  color: 0xffcf7a,
  roughness: 0.05,
  metalness: 0.1,
  transparent: true,
  opacity: 0.8,
  emissive: 0xffa64a,
  emissiveIntensity: 0.25,
});
const drop = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 2), dropMat);
skin.add(drop);
const film = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.05, 0.25, 24), dropMat);
skin.add(film);
const crown = [];
for (let i = 0; i < 12; i++) {
  const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 1), dropMat);
  skin.add(c);
  crown.push({ c, a: (i / 12) * Math.PI * 2 + 0.2, v: 2.2 + rng(950 + i)() * 1.2 });
}
// alcohol: white wisps rising out of the film
const WISP_N = 30;
const wispMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 1,
  transparent: true,
  opacity: 0.38,
  depthWrite: false,
  emissive: 0xffffff,
  emissiveIntensity: 0.25,
});
const wisps = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), wispMat, WISP_N);
wisps.frustumCulled = false;
wisps.userData.noAO = true;
skin.add(wisps);
// ball-and-stick molecules
function molecule(n, r, color, seed) {
  const g = new THREE.Group();
  const rr = rng(seed);
  const mat = flat(color, { roughness: 0.3, emissive: color, emissiveIntensity: 0.35 });
  const pts = [V(0, 0, 0)];
  for (let i = 1; i < n; i++)
    pts.push(
      pts[Math.floor(rr() * i)].clone().add(
        V(rr() - 0.5, rr() - 0.5, rr() - 0.5)
          .normalize()
          .multiplyScalar(r * 2.4),
      ),
    );
  pts.forEach((p, i) => {
    const a = new THREE.Mesh(
      new THREE.IcosahedronGeometry(i % 3 === 2 ? r * 0.7 : r, 1),
      i % 3 === 2 ? flat(0xf4f4f8, { roughness: 0.3 }) : mat,
    );
    a.position.copy(p);
    a.castShadow = true;
    g.add(a);
  });
  for (let i = 1; i < n; i++) {
    let best = 0;
    for (let j = 0; j < i; j++)
      if (pts[j].distanceTo(pts[i]) < pts[best].distanceTo(pts[i])) best = j;
    const a = pts[i];
    const b = pts[best];
    const len = a.distanceTo(b);
    const s = new THREE.Mesh(
      new THREE.CylinderGeometry(r * 0.22, r * 0.22, len, 5),
      flat(0xdedee6),
    );
    s.position.copy(a).add(b).multiplyScalar(0.5);
    s.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize());
    g.add(s);
  }
  return g;
}
const TOP_N = 26;
const tops = Array.from({ length: TOP_N }, (_, i) => {
  const m = molecule(3, 0.22, i % 2 ? 0xe4f23e : 0xffd93a, 1000 + i);
  skin.add(m);
  const rr = rng(1100 + i);
  return {
    m,
    a: rr() * Math.PI * 2,
    d: 0.3 + rr() * 1.6,
    st: 14.25 + i * 0.14 + (i > 6 ? 1.4 : 0),
    v: 2.4 + rr() * 1.6,
    ph: rr() * 6,
  };
});
const BASE_N = 11;
const bases = Array.from({ length: BASE_N }, (_, i) => {
  const m = molecule(6, 0.3, 0x8f5bff, 1200 + i);
  skin.add(m);
  const rr = rng(1300 + i);
  return { m, a: (i / BASE_N) * Math.PI * 2 + rr() * 0.4, d: 0.6 + rr() * 1.7, ph: rr() * 6 };
});

// ================================================================ pocket NOSE: cut-away with smell cells
const nose = new THREE.Group();
nose.position.set(...NOSE);
scene.add(nose);
const noseMat = xrayMaterial(0xf0b08c, { roughness: 0.6 });
const cells = [];
let channelCurve;
{
  const pts = [
    [-3.2, 5.2],
    [-0.2, 5.2],
    [0.2, 4.2],
    [0.35, 3.2],
    [1.4, 1.2],
    [2.5, -0.3],
    [2.75, -0.9],
    [2.45, -1.45],
    [1.8, -1.65],
    [1.25, -1.5],
    [0.95, -1.8],
    [1.05, -2.6],
    [0.7, -3.2],
    [-3.2, -3.2],
  ];
  const sh = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  const geo = new THREE.ExtrudeGeometry(sh, {
    depth: 3.2,
    bevelEnabled: true,
    bevelSize: 0.3,
    bevelThickness: 0.3,
    bevelSegments: 2,
    curveSegments: 2,
  });
  geo.translate(0, 0, -1.6);
  const m = new THREE.Mesh(geo, noseMat);
  nose.add(m);
  nose.add(xrayEdges(geo));
  // the air channel from the nostril up to the roof and back down the throat
  channelCurve = new THREE.CatmullRomCurve3([
    V(6.5, -2.4, 0.4),
    V(3.4, -2.2, 0.2),
    V(1.55, -1.55, 0),
    V(1.05, -0.5, 0),
    V(0.45, 1.0, 0),
    V(-0.35, 2.3, 0),
    V(-1.5, 2.0, 0),
    V(-2.5, 0.2, 0),
    V(-2.9, -2.6, 0),
  ]);
  const inner = new THREE.CatmullRomCurve3(channelCurve.points.slice(2));
  const ch = new THREE.Mesh(
    new THREE.TubeGeometry(inner, 70, 0.48, 9),
    new THREE.MeshStandardMaterial({
      color: 0xff7f9e,
      roughness: 0.5,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
      depthWrite: false,
      emissive: 0xff4f7e,
      emissiveIntensity: 0.15,
    }),
  );
  nose.add(ch);
  // the olfactory bulb above the roof + the smell cells hanging into the channel
  const bulb = mesh(
    new THREE.IcosahedronGeometry(0.6, 1).scale(1.6, 0.6, 0.9),
    flat(0xffb0c8, { emissive: 0xff6fa0, emissiveIntensity: 0.3 }),
    nose,
    -0.6,
    3.9,
    0,
    0.05,
    3,
  );
  bulb.castShadow = false;
  for (let i = 0; i < 12; i++) {
    const x = -0.95 + (i % 6) * 0.3 + (i > 5 ? 0.15 : 0);
    const z = i > 5 ? 0.3 : -0.3;
    const y0 = 2.62 + (x + 0.35) * -0.12;
    const stemMat = flat(0xffd0de, { emissive: 0x4fe3ff, emissiveIntensity: 0 });
    const stem = mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.9, 4),
      stemMat,
      nose,
      x,
      y0 + 0.45,
      z,
      0,
      1,
    );
    stem.castShadow = false;
    const bmat = flat(0xbff6ff, { emissive: 0x4fe3ff, emissiveIntensity: 0.1 });
    const b = mesh(new THREE.IcosahedronGeometry(0.11, 1), bmat, nose, x, y0, z, 0, 1);
    b.castShadow = false;
    cells.push({ stemMat, bmat, b, base: V(x, y0, z) });
  }
}
const SM_N = 44;
const smells = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.13, 1),
  flat(0xffffff, { roughness: 0.3, emissive: 0xffffff, emissiveIntensity: 0.25 }),
  SM_N,
);
smells.frustumCulled = false;
nose.add(smells);
{
  const cs = [0xffd93a, 0xff8fc0, 0x8f5bff, 0xe4f23e];
  const c = new THREE.Color();
  for (let i = 0; i < SM_N; i++) smells.setColorAt(i, c.setHex(cs[i % 4]));
}

// ================================================================ the memory bubble + her feeling glow
const BUBBLE = V(10.8, 7.3, -1.2);
const bubble = new THREE.Group();
bubble.position.copy(BUBBLE);
scene.add(bubble);
{
  const cm = facetMat(
    flat(0xffffff, { emissive: 0xffe8f2, emissiveIntensity: 0.35, roughness: 1 }),
  );
  const ring = new THREE.Group();
  bubble.add(ring);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const p = new THREE.Mesh(
      jitter(new THREE.IcosahedronGeometry(0.42 + (i % 3) * 0.08, 1), 0.04, i),
      cm,
    );
    p.position.set(Math.cos(a) * 1.25, Math.sin(a) * 0.95, 0);
    ring.add(p);
  }
  const back = new THREE.Mesh(
    new THREE.CircleGeometry(1.25, 24).scale(1, 0.78, 1),
    new THREE.MeshBasicMaterial({ color: 0x8fd3ff }),
  );
  back.position.z = -0.25;
  back.rotation.y = 0;
  bubble.add(back);
  // the beach: sand, sea, parasol, sun
  const beach = new THREE.Group();
  beach.rotation.set(0.5, 0, 0);
  beach.position.set(0, -0.35, 0);
  bubble.add(beach);
  const sand = new THREE.Mesh(
    new THREE.CylinderGeometry(1.05, 1.05, 0.12, 20, 1, false, Math.PI / 2, Math.PI),
    flat(0xf3d49a),
  );
  sand.rotation.y = Math.PI;
  beach.add(sand);
  const sea = new THREE.Mesh(
    new THREE.CylinderGeometry(1.05, 1.05, 0.1, 20, 1, false, -Math.PI / 2, Math.PI),
    flat(0x2fa8d8, { roughness: 0.2 }),
  );
  sea.rotation.y = Math.PI;
  beach.add(sea);
  const ps = parasol(0xff6b6b);
  ps.scale.setScalar(0.32);
  ps.position.set(0.25, 0.06, 0.45);
  beach.add(ps);
  const sun = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 1), glowMat(0xffc23a, 2));
  sun.position.set(-0.55, 0.45, -0.05);
  bubble.add(sun);
  // trailing puffs from her head up to the bubble
  [0.18, 0.13, 0.09].forEach((s, i) => {
    const p = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 1), cm);
    p.position.set(0.4 + i * 0.25, -1.25 - i * 0.35, -0.5 - i * 0.2);
    bubble.add(p);
  });
}
const halo = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.8, 2),
  new THREE.MeshBasicMaterial({
    color: 0xff6fae,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }),
);
halo.userData.noAO = true;
scene.add(halo);

// ================================================================ camera + render
const applyCamera = shotCamera(shots);
const inSkin = (t) => (t >= T.auf && t < T.welches) || (t >= T.sie1 && t < T.nase);
const inNose = (t) => t >= T.nase && t < T.darum1;

function renderAt(t) {
  applyCamera(t);
  // -------------------------------------------------- which place: move the sun's shadow box there
  const place = inSkin(t) ? SKIN : inNose(t) ? NOSE : null;
  if (place) {
    key.position.set(place[0] + 12, place[1] + 26, place[2] + 16);
    key.target.position.set(...place);
  } else {
    key.position.copy(KEY_WAGON);
    key.target.position.set(0, 0, 0);
  }
  key.target.updateMatrixWorld();

  // -------------------------------------------------- your hand, the flask and your arm
  drawSpray(t);
  hand.track(t, HAND_KEYS);
  const handOn = hand.group.visible;
  if (handOn) {
    hand.group.updateMatrixWorld(true);
    const wrist = V(0, 0.0, -0.15).applyMatrix4(hand.group.matrixWorld);
    const dir = wrist.clone().sub(YOU_SHOULDER);
    const len = dir.length();
    sleeve.visible = true;
    sleeve.position.copy(YOU_SHOULDER).addScaledVector(dir, 0.5);
    sleeve.quaternion.setFromUnitVectors(V(0, 1, 0), dir.normalize());
    sleeve.scale.set(1, (len - 0.1) / 1.4, 1);
  } else sleeve.visible = false;
  you.armR.sh.visible = !handOn;
  // flask x-ray while it is explained
  const xf = smooth(ramp(t, T.flakon + 0.1, T.flakon + 0.5)) * (1 - ramp(t, T.auf - 0.1, T.auf));
  flakon.oils.forEach((o) => {
    o.position.y += Math.sin(t * 2 + o.userData.ph) * 0.0006;
    o.scale.setScalar(1 + xf * 0.6);
  });

  // you: sniff at midday (arm to the nose, head down), "?" over your head
  const sniff = pop(t, T.mittags + 0.1, T.sprueht - 0.1, 0.3);
  you.fan(you.armR, 0, sniff * 0.85, -1);
  you.head.rotation.set(0.25 * sniff, 0, -0.2 * sniff);
  const qk = pop(t, T.mittags + 0.7, T.sprueht);
  qmark.visible = qk > 0;
  qmark.position.set(YOU[0] + 0.1, YOU[1] + 4.35 + 0.1 * Math.sin(t * 5), YOU[2]);
  qmark.scale.setScalar(Math.max(0.001, outBack(clamp01(qk)) * 0.95));
  // you look out of the window when guessing
  if (t >= T.rate && t < T.aus2 + 1)
    you.head.rotation.y = -0.7 * smooth(ramp(t, T.rate, T.rate + 0.5));
  // a happy face at the start (you love that scent)
  you.smile(t < T.mittags ? 0.6 : 0);

  // -------------------------------------------------- your cloud
  drawHaze(t);

  // -------------------------------------------------- passenger A: smells you, fans, then a memory
  const smell =
    smooth(ramp(t, T.dich1 - 0.7, T.dich1 - 0.1)) *
      (1 - smooth(ramp(t, T.dabei + 1.2, T.dabei + 1.8))) +
    smooth(ramp(t, T.darum1 - 0.4, T.darum1)) * (1 - smooth(ramp(t, T.fakt + 0.2, T.fakt + 0.9)));
  pa.face(smell);
  pa.fan(pa.armR, t, smooth(ramp(smell, 0.3, 1)), -1);
  pa.torso.rotation.x = -0.06 - 0.12 * smell;
  const happy = smooth(ramp(t, T.fakt + 0.5, T.fakt + 1.3));
  if (happy > 0) pa.smile(happy);
  pa.head.rotation.x = -0.15 * happy;
  // passenger B: phone, then covers his nose at the payoff
  const bk =
    smooth(ramp(t, T.darum1 + 0.2, T.anderen)) * (1 - smooth(ramp(t, T.fakt, T.fakt + 0.6)));
  pb.fan(pb.armR, 0, bk * 0.95, -1);
  pb.face(bk);
  pb.head.rotation.y = 0.5 * bk;
  pb.armL.sh.rotation.set(-0.9, 0, 0.15);
  pb.armL.el.rotation.set(-0.9, 0, 0);
  // C turns a page now and then, D breathes
  pc.head.rotation.x = 0.3 + Math.sin(t * 0.7) * 0.03;
  pc.armL.sh.rotation.set(-0.65, 0, 0.3);
  pc.armR.sh.rotation.set(-0.65, 0, -0.3);
  pd.torso.scale.y = 1 + Math.sin(t * 1.6) * 0.008;

  // -------------------------------------------------- bottles (comment question)
  bottles.forEach((b, i) => {
    const at = T.bottles + i * 0.12;
    const on = t >= at && t < T.aus2;
    b.visible = on;
    if (on) {
      b.scale.copy(squash(t, at, 0.6));
      b.rotation.y = (t - at) * 0.9 + i;
    }
  });
  // -------------------------------------------------- lab flask
  flask.visible = t >= T.flask;
  if (flask.visible) {
    flask.scale.copy(squash(t, T.flask, 0.6));
    flaskBubbles.forEach((b) => {
      const u = (t * 0.8 + b.userData.ph) % 1;
      b.position.set(b.userData.x * (1 - u * 0.6), 0.06 + u * 0.32, 0.05);
      b.scale.setScalar(0.6 + u);
    });
    flask.userData.mol.rotation.y = t * 1.2;
    flask.userData.mol.rotation.x = Math.sin(t) * 0.3;
    puff(
      "flask",
      t,
      T.flask + 0.05,
      flask.position.x,
      flask.position.y + 0.05,
      flask.position.z,
      0.5,
    );
  }

  // -------------------------------------------------- whale
  const wOn = t >= T.whaleIn && t < T.heute;
  whale.visible = wOn;
  let xw = 0;
  if (wOn) {
    const wx = 14 - (t - T.aus2) * 9;
    whale.position.set(wx, 8.6 + Math.sin(t * 1.4) * 0.35, WHALE_Z);
    whale.rotation.z = Math.sin(t * 1.4 + 0.8) * 0.04;
    whaleBits.tail.rotation.z = Math.sin(t * 3.2) * 0.35;
    xw = smooth(ramp(t, T.darm - 0.05, T.darm + 0.35));
    whaleBits.lump.material.emissiveIntensity =
      0.6 + 0.6 * pop(t, T.ambra, T.heute) * (0.7 + 0.3 * Math.sin(t * 9));
    whaleBits.lump.rotation.y = t * 0.8;
    whale.updateMatrixWorld(true);
    showLabel(
      "darm",
      pop(t, T.darm + 0.05, T.ambra),
      "Darm",
      whaleBits.gut.localToWorld(V(-1.5, -0.9, 0.5)),
      -1,
    );
    showLabel(
      "ambra",
      pop(t, T.ambra, T.heute),
      "Ambra",
      whaleBits.lump.getWorldPosition(V(0, 0, 0)),
      1,
    );
  }

  // -------------------------------------------------- skin pocket
  const skOn = inSkin(t);
  skin.visible = skOn;
  if (skOn) {
    const fall = clamp01((t - T.auf) / (T.drop - T.auf));
    drop.visible = t < T.drop;
    drop.position.set(0, lerp(9, 1.0, fall * fall), 0);
    drop.scale.set(1 - 0.15 * fall, 1 + 0.25 * fall, 1 - 0.15 * fall);
    const age = t - T.drop;
    film.visible = age > 0;
    const shrink = 1 - 0.45 * smooth(ramp(t, T.welches, T.sie1));
    const spread = age > 0 ? (1.4 + 1.2 * smooth(clamp01(age / 0.5))) * shrink : 0.001;
    film.scale.set(spread, 0.6 + 0.4 * (1 - clamp01(age / 0.4)), spread);
    film.position.y = 0.05;
    crown.forEach(({ c, a, v }) => {
      const ca = age;
      c.visible = ca > 0 && ca < 0.6;
      if (!c.visible) return;
      const rad = 1.2 + v * ca;
      c.position.set(Math.cos(a) * rad, 0.2 + 3.2 * ca - 6.5 * ca * ca, Math.sin(a) * rad);
      c.scale.setScalar(1 - ca * 1.2);
    });
    // alcohol wisps rise and vanish
    for (let i = 0; i < WISP_N; i++) {
      const st = T.drop + 0.08 + i * 0.16;
      const a2 = t - st;
      let sc = 0;
      if (a2 > 0 && t < T.welches + 1) {
        const life = 2.4;
        const u = (a2 % life) / life;
        const rr = rng(1400 + i);
        const ang = rr() * Math.PI * 2;
        const rad = rr() * 1.8 * shrink;
        _v.set(Math.cos(ang) * rad + Math.sin(u * 6 + i) * 0.5, 0.3 + u * 9, Math.sin(ang) * rad);
        sc = (0.4 + u * 1.3) * (1 - smooth(clamp01((u - 0.5) / 0.5)));
        _m4.compose(_v, _q.identity(), V(sc, sc, sc));
      } else _m4.makeScale(0, 0, 0);
      wisps.setMatrixAt(i, _m4);
    }
    wisps.instanceMatrix.needsUpdate = true;
    wispMat.opacity = 0.38 * (1 - ramp(t, T.sie1 - 0.1, T.sie1 + 0.4));
    // top-note molecules: fly up fast
    tops.forEach((p, i) => {
      const a2 = t - p.st;
      p.m.visible = a2 > 0 && t < T.welches;
      if (!p.m.visible) return;
      const y = 0.4 + a2 * p.v + a2 * a2 * 0.6;
      const rad = p.d + a2 * 0.35;
      p.m.position.set(Math.cos(p.a + a2 * 0.8) * rad, y, Math.sin(p.a + a2 * 0.8) * rad);
      p.m.rotation.set(t * 1.3 + p.ph, t * 0.9, 0);
      p.m.scale.setScalar(Math.min(1, a2 * 3));
      if (i === 0) {
        // the hero: rises to the label point and hovers
        const k = smooth(ramp(t, T.zuerst + 0.2, T.kopfnote - 0.2));
        p.m.position.set(1.2, lerp(0.6, 7.4, k) + Math.sin(t * 3) * 0.1, 0.6);
      }
    });
    showLabel(
      "kopf",
      pop(t, T.kopfnote, T.welches),
      "Kopfnote",
      tops[0].m.getWorldPosition(V(0, 0, 0)),
      1,
    );
    // base-note molecules: heavy, they stay on the skin
    bases.forEach((p) => {
      p.m.visible = t > T.drop + 0.1;
      const lift = 0.45 + 0.2 * Math.max(0, Math.sin(t * 1.8 + p.ph));
      p.m.position.set(Math.cos(p.a) * p.d * shrink, lift, Math.sin(p.a) * p.d * shrink);
      p.m.rotation.set(Math.sin(t + p.ph) * 0.4, t * 0.4 + p.ph, 0);
      const glowK = pop(t, T.basisnote, T.nase);
      p.m.scale.setScalar(Math.min(1, (t - T.drop) * 2) * (1 + 0.12 * glowK));
    });
  }
  // stopwatch-ish readout: base note lasts for hours
  readout("std", pop(t, T.stundenlang, T.nase), {
    label: "HÄLT",
    value: Math.min(8, 1 + Math.floor(Math.max(0, t - T.stundenlang) * 6)),
    unit: "Std.",
    x: 60,
    y: 430,
  });
  readout("uhr", pop(t, T.mittags + 0.1, T.sprueht), {
    label: "UHRZEIT",
    value: "12:30",
    x: 60,
    y: 430,
  });

  // -------------------------------------------------- nose pocket
  const nOn = inNose(t);
  nose.visible = nOn;
  if (nOn) {
    // molecules stream in through the nostril and up to the roof
    for (let i = 0; i < SM_N; i++) {
      const u = (((t - T.nase) * 0.16 + i / SM_N) % 1) * 0.82;
      const p = channelCurve.getPointAt(u);
      p.z += Math.sin(i * 2.3) * 0.25;
      p.y += Math.sin(t * 3 + i) * 0.08;
      const sc = smooth(clamp01((t - T.nase) * 2 - i * 0.02));
      _m4.compose(p, _q.identity(), V(sc, sc, sc));
      smells.setMatrixAt(i, _m4);
    }
    smells.instanceMatrix.needsUpdate = true;
    if (smells.instanceColor) smells.instanceColor.needsUpdate = true;
    cells.forEach((c, i) => {
      // light up as the scent arrives, all bright on "neu", then off one by one
      const arrive = smooth(ramp(t, T.meldet - 0.2 + i * 0.04, T.meldet + 0.3 + i * 0.04));
      const flick = 0.6 + 0.4 * Math.sin(t * 14 + i * 1.7);
      const boost = pop(t, T.neu, T.bleibt, 0.15);
      const off = T.bleibt + 0.3 + i * 0.105;
      const on = arrive * (1 - smooth(ramp(t, off, off + 0.12)));
      const e = on * (1.4 * flick + 1.6 * boost);
      c.bmat.emissiveIntensity = 0.1 + e;
      c.stemMat.emissiveIntensity = 0.6 * e;
      c.b.scale.setScalar(1 + 0.4 * on * boost);
    });
  }
  // x-ray: flask / whale / nose share the glow edges — one place at a time
  setXray([whaleFM], xw * 0.6);
  setXray([noseMat], nOn ? 0.85 : 0);
  setXray([flakon.glassM], xf);
  flakon.glassM.opacity = lerp(0.55, 0.3, xf);
  flakon.glassM.depthWrite = false;
  edgeMat.opacity = 0.9 * Math.max(xf, xw, nOn ? 0.85 : 0);

  // -------------------------------------------------- memory bubble + feeling glow
  const bk2 = t >= T.bubble;
  bubble.visible = bk2;
  if (bk2) {
    bubble.scale.copy(squash(t, T.bubble, 0.7));
    bubble.position.set(BUBBLE.x, BUBBLE.y + Math.sin(t * 1.6) * 0.06, BUBBLE.z);
    bubble.lookAt(8.0, 6.6, 0.9);
  }
  const hk = pop(t, T.gefuehl - 0.1, END_T);
  halo.visible = hk > 0;
  if (hk > 0) {
    pa.head.updateMatrixWorld(true);
    pa.head.getWorldPosition(halo.position);
    halo.scale.setScalar(hk * (1 + 0.08 * Math.sin(t * 6)));
    halo.material.opacity = 0.28 * hk;
  }

  // -------------------------------------------------- LED panels (one at a time)
  if (t >= T.alkohol && t < T.auf)
    showPanel(pop(t, T.alkohol, T.auf), "ALKOHOL", "70–90 %", LED.yellow);
  else if (t >= T.rate && t < T.aus2)
    showPanel(pop(t, T.rate + 0.1, T.aus2), "LUXUS-DUFT", "WOHER?", LED.yellow);
  else if (t >= T.stumm && t < T.darum1)
    showPanel(pop(t, T.stumm, T.darum1), "NASE", "STUMM", LED.red);
  else showPanel(0);

  labels(t, LABELS);
  renderFrame();
}
const END_T = 60;

start(renderAt);
