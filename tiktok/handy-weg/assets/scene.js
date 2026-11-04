// Scene of #57 "Woche ohne Handy": your hand drops the glowing phone into a
// crate on a misty mountain-lake jetty, the lid slams, the padlock snaps.
// Day one: your hand goes for the pocket — empty — and the pocket buzzes
// anyway (phantom vibration, the brain in x-ray sends it down). Ten people
// on the shore, nine pockets buzz. The screen-time hologram over the crate,
// a stopwatch over the lake, then day three in the scanner (pocket BRAIN):
// the reward centre lights up, and the brain rewires itself.
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
  flat,
  facet,
  facetMat,
  jitter,
  xrayMaterial,
  xrayEdges,
  setXray,
  showPanel,
  showNope,
  LED,
  labels,
  squash,
  highlights,
  shotCamera,
  renderFrame,
  start,
  outBack,
  roundedRect,
} from "./world.js";
import "./set.js";
import { createHand } from "./hand.js";
import { readout, counter } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS, YOU, HEAD, BOX, POCKET, BRAIN, ROW_Z } from "./beats.js";

highlights(HIGHLIGHTS);

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
// Toy low-poly people (as in #54). Local frame: facing +z, origin on the seat
// (seated: the jetty planks) or on the floor (standing).
function person({
  skin = 0xf1c09a,
  top = 0x4a7bd6,
  legs = 0x2f3a4f,
  hair = 0x3a2a20,
  style = "short",
  stand = false,
  seed = 1,
  beanie = null,
  skullMat = null,
}) {
  const g = new THREE.Group();
  const body = new THREE.Group();
  g.add(body);
  const hip = stand ? 3.7 : 0;
  const skinM = flat(skin, { roughness: 0.7 });
  const topM = flat(top, { roughness: 0.9 });
  const legM = flat(legs, { roughness: 0.9 });
  const hairM = flat(hair, { roughness: 0.8 });
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
  mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.45, 7), skinM, torso, 0, 2.4, 0, 0.04, seed + 3);
  const head = new THREE.Group();
  head.position.set(0, 2.85, 0.04);
  head.scale.setScalar(1.22);
  torso.add(head);
  const skull = new THREE.Mesh(
    jitter(new THREE.IcosahedronGeometry(0.5, 1), 0.02, seed + 4),
    skullMat ?? skinM,
  );
  skull.castShadow = true;
  skull.scale.set(0.95, 1.08, 1);
  head.add(skull);
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
  const hairParts = [];
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
  hairParts.push(cap);
  if (style === "long")
    hairParts.push(
      mesh(new THREE.BoxGeometry(0.98, 1.1, 0.4), hairM, head, 0, -0.45, -0.3, 0.06, seed + 7),
    );
  if (style === "bun")
    hairParts.push(
      mesh(new THREE.IcosahedronGeometry(0.26, 1), hairM, head, 0, 0.5, -0.3, 0.06, seed + 8),
    );
  if (beanie != null) {
    const bm = flat(beanie, { roughness: 0.95 });
    const b = mesh(
      new THREE.SphereGeometry(0.57, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5),
      bm,
      head,
      0,
      0.12,
      -0.02,
      0.07,
      seed + 9,
    );
    b.scale.set(1, 1.12, 1);
    hairParts.push(b);
    hairParts.push(
      mesh(new THREE.TorusGeometry(0.53, 0.09, 5, 14), bm, head, 0, 0.14, -0.02, 0.06, seed + 10),
    );
    hairParts[hairParts.length - 1].rotation.x = Math.PI / 2;
    hairParts.push(
      mesh(
        new THREE.IcosahedronGeometry(0.17, 0),
        flat(0xf4efe6),
        head,
        0,
        0.8,
        -0.05,
        0.06,
        seed + 11,
      ),
    );
  }
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
  const legsG = [];
  for (const sx of [-1, 1]) {
    if (stand) {
      legsG.push(
        mesh(
          new THREE.CapsuleGeometry(0.27, 2.9, 2, 7),
          legM,
          body,
          sx * 0.36,
          2.05,
          0,
          0.05,
          seed + 14,
        ),
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
        0.28,
        0.95,
        0.05,
        seed + 14,
      );
      th.rotation.x = Math.PI / 2;
      legsG.push(th);
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
  const P = { g, torso, head, skull, eyes, brows, mouth, armL, armR, hip, hairParts, legsG };
  P.rest = (a, s = 1) => {
    a.sh.rotation.set(-0.35, 0, s * 0.1);
    a.el.rotation.set(-1.15, 0, 0);
  };
  P.smile = (k) => {
    P.mouth.scale.set(1 + 0.5 * k, 1, 1);
    P.mouth.position.y = -0.22 + 0.02 * k;
  };
  P.rest(armL, 1);
  P.rest(armR, -1);
  return P;
}

// you: mustard hoodie, jeans, red beanie — at the end of the jetty
const skullMat = xrayMaterial(0xf1c09a, { roughness: 0.6 });
const you = person({
  top: 0xf0b42a,
  legs: 0x3b5a8a,
  hair: 0x5a3a24,
  beanie: 0xc8413a,
  seed: 3,
  skullMat,
});
you.g.position.set(...YOU);
const skullEdges = xrayEdges(you.skull.geometry);
skullEdges.scale.copy(you.skull.scale);
you.head.add(skullEdges);

// ---------------------------------------------------------------- brains
// a folded brain: two halves of a displaced icosphere (gyri as ridges)
function brainGeo(seed = 1) {
  const g = new THREE.IcosahedronGeometry(1, 3);
  const p = g.attributes.position;
  const v = V(0, 0, 0);
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const folds = Math.sin(v.x * 9 + Math.sin(v.z * 7) * 2) * Math.cos(v.y * 8 + v.z * 5);
    const r = 1 + 0.07 * folds + 0.03 * Math.sin(v.x * 17 + v.y * 13 + seed);
    v.multiplyScalar(r);
    v.x *= 0.82;
    v.y *= 0.78;
    v.z *= 1.12;
    if (v.y < -0.45) v.y = -0.45 + (v.y + 0.45) * 0.4; // flatter underside
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}
const brainMat = xrayMaterial(0xf59ab4, {
  roughness: 0.5,
  emissive: 0xff5c8a,
  emissiveIntensity: 0.25,
});
function makeBrain(parent, s, mat0 = brainMat) {
  const g = new THREE.Group();
  const mat = facetMat(mat0);
  mat.userData.base = mat0.userData.base ?? mat0.color.clone();
  g.userData.mat = mat;
  for (const sx of [-1, 1]) {
    const h = new THREE.Mesh(facet(brainGeo(sx + 3), 0.07, sx + 5), mat);
    h.scale.set(0.52, 1, 1);
    h.position.x = sx * 0.27;
    h.castShadow = true;
    g.add(h);
  }
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.1, 0.7, 7), mat);
  stem.position.set(0, -0.6, -0.25);
  stem.rotation.x = 0.4;
  g.add(stem);
  g.scale.setScalar(s);
  parent.add(g);
  return g;
}
// the small brain in your head (seen through the x-ray skull)
const headBrainMat = flat(0xf59ab4, { emissive: 0xff4f80, emissiveIntensity: 0.4, roughness: 0.5 });
const headBrain = makeBrain(you.head, 0.36, headBrainMat);
headBrain.position.set(0, 0.1, -0.02);
// mischief sparks around the brain
const sparkMat = glowMat(0xffd23f, 2.2);
const sparks = Array.from({ length: 10 }, (_, i) => {
  const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.05, 0), sparkMat);
  m.userData.ph = i / 10;
  you.head.add(m);
  return m;
});

// ================================================================ the crate + the phone
const crate = new THREE.Group();
crate.position.set(...BOX);
scene.add(crate);
const CW = 1.5;
const CH = 0.85;
const CD = 1.1;
const crateDark = flat(0x8a6038, { roughness: 0.9 });
const crateX = xrayMaterial(0xc89a62, { roughness: 0.85 });
const crateEdges = [];
{
  mesh(new THREE.BoxGeometry(CW, 0.08, CD), crateDark, crate, 0, 0.04, 0, 0.05, 1);
  const side = (w, d, x, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, CH, d), crateX);
    m.position.set(x, CH / 2, z);
    m.castShadow = true;
    crate.add(m);
    const e = xrayEdges(m.geometry);
    e.position.copy(m.position);
    crate.add(e);
    crateEdges.push(e);
  };
  side(CW, 0.08, 0, CD / 2 - 0.04);
  side(CW, 0.08, 0, -CD / 2 + 0.04);
  side(0.08, CD, CW / 2 - 0.04, 0);
  side(0.08, CD, -CW / 2 + 0.04, 0);
  // slats on the front (solid wood stripes)
  for (const y of [0.22, 0.62])
    mesh(
      new THREE.BoxGeometry(CW + 0.04, 0.12, 0.06),
      crateDark,
      crate,
      0,
      y,
      CD / 2 + 0.02,
      0.04,
      2,
    );
}
// the lid: pivot at the back top edge
const lid = new THREE.Group();
lid.position.set(0, CH, -CD / 2);
crate.add(lid);
{
  const top = new THREE.Mesh(new THREE.BoxGeometry(CW + 0.08, 0.1, CD + 0.06), crateX);
  top.position.set(0, 0.05, CD / 2);
  top.castShadow = true;
  lid.add(top);
  const e = xrayEdges(top.geometry);
  e.position.copy(top.position);
  lid.add(e);
  crateEdges.push(e);
}
for (const x of [-0.5, 0.5])
  mesh(new THREE.BoxGeometry(0.12, 0.06, CD), crateDark, lid, x, 0.12, CD / 2, 0.04, 5);
// hasp on the lid front + the padlock on the crate front
mesh(
  new THREE.BoxGeometry(0.16, 0.26, 0.04),
  flat(0x8b8b92, { metalness: 0.7, roughness: 0.3 }),
  lid,
  0,
  -0.08,
  CD + 0.05,
  0,
  1,
);
const lock = new THREE.Group();
lock.position.set(0, CH - 0.28, CD / 2 + 0.11);
crate.add(lock);
const brass = flat(0xd9a93a, { metalness: 0.75, roughness: 0.28 });
mesh(new THREE.BoxGeometry(0.3, 0.26, 0.11), brass, lock, 0, -0.08, 0, 0.03, 6);
const shackle = new THREE.Mesh(
  new THREE.TorusGeometry(0.1, 0.028, 6, 14, Math.PI),
  flat(0xc4c4cc, { metalness: 0.85, roughness: 0.2 }),
);
lock.add(shackle);

// the phone: screen full of notifications
function screenTex() {
  const cv = document.createElement("canvas");
  cv.width = 256;
  cv.height = 512;
  const x = cv.getContext("2d");
  const gr = x.createLinearGradient(0, 0, 0, 512);
  gr.addColorStop(0, "#5b3cff");
  gr.addColorStop(1, "#ff4fa0");
  x.fillStyle = gr;
  x.fillRect(0, 0, 256, 512);
  x.fillStyle = "#fff";
  x.font = "800 54px Montserrat, sans-serif";
  x.textAlign = "center";
  x.fillText("7:12", 128, 86);
  const cols = ["#ff3b5c", "#2fd27a", "#2f9bff", "#ffd23f", "#ff8a2f", "#b56bff"];
  for (let i = 0; i < 4; i++) {
    x.fillStyle = "rgba(255,255,255,0.88)";
    x.beginPath();
    x.roundRect(18, 128 + i * 78, 220, 64, 16);
    x.fill();
    x.fillStyle = cols[i % cols.length];
    x.beginPath();
    x.roundRect(30, 140 + i * 78, 40, 40, 10);
    x.fill();
    x.fillStyle = "#2a2240";
    x.fillRect(82, 146 + i * 78, 120, 10);
    x.fillStyle = "#8a83a0";
    x.fillRect(82, 164 + i * 78, 90, 8);
  }
  // red badge
  x.fillStyle = "#ff2d4a";
  x.beginPath();
  x.arc(214, 122, 30, 0, Math.PI * 2);
  x.fill();
  x.fillStyle = "#fff";
  x.font = "800 34px Montserrat, sans-serif";
  x.fillText("99", 214, 134);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const scrTex = screenTex();
function makePhone() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.ExtrudeGeometry(roundedRect(0.42, 0.86, 0.07), {
      depth: 0.05,
      bevelEnabled: true,
      bevelSize: 0.012,
      bevelThickness: 0.012,
      bevelSegments: 1,
    }),
    flat(0x1b1b22, { metalness: 0.5, roughness: 0.25 }),
  );
  body.position.z = -0.03;
  body.castShadow = true;
  g.add(body);
  const scrMat = new THREE.MeshStandardMaterial({
    map: scrTex,
    emissive: 0xffffff,
    emissiveMap: scrTex,
    emissiveIntensity: 1.3,
    roughness: 0.2,
  });
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.8), scrMat);
  scr.position.z = 0.036;
  g.add(scr);
  scene.add(g);
  return { g, scrMat, scr };
}
// in your hand (hook) and in the crate
const phoneHand = makePhone();
const phoneBox = makePhone();
phoneHand.scr.rotation.z = Math.PI;
const phoneLight = new THREE.PointLight(0xc08cff, 0, 4, 1.6);
scene.add(phoneLight);

// ================================================================ your hand
const hand = createHand({ sleeve: 0xf0b42a, skin: 0xf1c09a, scale: 1 });
const DROP = [BOX[0] - 0.05, 1.95, BOX[2] + 0.05];
const HAND_KEYS = [
  { t: -1, pos: [DROP[0] + 0.3, DROP[1] + 0.5, DROP[2] + 0.9], rot: [0.9, 0.2, 0], pose: "grab" },
  { t: 0, pos: [DROP[0] + 0.12, DROP[1] + 0.25, DROP[2] + 0.45], rot: [0.9, 0.2, 0], pose: "grab" },
  { t: T.drop, pos: [DROP[0], DROP[1], DROP[2] + 0.2], rot: [0.95, 0.1, 0], pose: "grab" },
  {
    t: T.drop + 0.2,
    pos: [DROP[0] + 0.05, DROP[1] + 0.25, DROP[2] + 0.35],
    rot: [0.8, 0.1, 0],
    pose: "open",
  },
  {
    t: T.woche,
    pos: [DROP[0] + 0.4, DROP[1] + 0.9, DROP[2] + 1.0],
    rot: [0.6, 0.1, 0],
    pose: "open",
    out: true,
  },
  // POV: reaching for the pocket, coming out empty
  {
    t: T.greift - 0.05,
    pos: [POCKET[0] - 0.55, POCKET[1] + 1.1, POCKET[2] + 0.4],
    rot: [1.1, 0.25, 0],
    pose: "open",
  },
  {
    t: T.hosentasche,
    pos: [POCKET[0] - 0.15, POCKET[1] + 0.25, POCKET[2] + 0.05],
    rot: [1.35, 0.3, 0],
    pose: "grab",
  },
  {
    t: T.leere - 0.05,
    pos: [POCKET[0] - 0.1, POCKET[1] + 0.12, POCKET[2]],
    rot: [1.4, 0.3, 0],
    pose: "grab",
  },
  {
    t: T.leere + 0.35,
    pos: [POCKET[0] + 0.05, POCKET[1] + 0.95, POCKET[2] + 0.95],
    rot: [-0.3, 0.3, 2.9],
    pose: "open",
  },
  {
    t: T.bzzz - 0.25,
    pos: [POCKET[0] + 0.05, POCKET[1] + 1.0, POCKET[2] + 1.0],
    rot: [-0.3, 0.3, 2.9],
    pose: "open",
    out: true,
  },
];
// your right arm: a sleeve from the shoulder to the hand's wrist
const sleeve = mesh(
  new THREE.CapsuleGeometry(0.2, 1, 2, 7),
  flat(0xf0b42a, { roughness: 0.9 }),
  scene,
);
const SHOULDER = V(YOU[0] - 0.82, YOU[1] + 2.0, YOU[2] + 0.1);

// ================================================================ pocket buzz
const ghostMat = new THREE.MeshBasicMaterial({
  color: 0x7af0ff,
  transparent: true,
  opacity: 0,
  depthWrite: false,
  side: THREE.DoubleSide,
});
const ghost = new THREE.Mesh(new THREE.ShapeGeometry(roundedRect(0.34, 0.62, 0.06)), ghostMat);
ghost.position.set(POCKET[0] + 0.05, POCKET[1] + 0.27, POCKET[2]);
ghost.rotation.set(-Math.PI / 2, 0, 0.25);
ghost.userData.noAO = true;
scene.add(ghost);
const ringMat = new THREE.MeshBasicMaterial({
  color: 0x7af0ff,
  transparent: true,
  opacity: 0,
  depthWrite: false,
});
function makeRings(n, parent) {
  return Array.from({ length: n }, () => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.035, 5, 24), ringMat.clone());
    m.rotation.x = Math.PI / 2;
    m.userData.noAO = true;
    parent.add(m);
    return m;
  });
}
const pocketRings = makeRings(3, scene);
function animRings(rings, t, k, x, y, z, s = 1) {
  rings.forEach((m, i) => {
    const f = (t * 1.8 + i / rings.length) % 1;
    m.visible = k > 0.01;
    m.position.set(x, y, z);
    m.scale.setScalar(s * (0.5 + f * 1.6));
    m.material.opacity = k * 0.85 * (1 - f);
  });
}
// the brain → pocket signal: glowing beads along a curve
const sigCurve = new THREE.CatmullRomCurve3([
  V(HEAD[0], HEAD[1] + 0.1, HEAD[2]),
  V(HEAD[0] - 0.9, HEAD[1] - 0.6, HEAD[2] + 0.5),
  V(POCKET[0] - 0.5, POCKET[1] + 0.9, POCKET[2] + 0.2),
  V(POCKET[0], POCKET[1] + 0.25, POCKET[2]),
]);
const beads = new THREE.InstancedMesh(
  new THREE.SphereGeometry(0.06, 6, 4),
  glowMat(0x7af0ff, 2.4),
  22,
);
beads.userData.noAO = true;
scene.add(beads);
const dummy = new THREE.Object3D();

// ================================================================ the study: ten people on the shore
const ROW = [];
{
  const tops = [
    0xe2453c, 0x2f9e6a, 0x4a7bd6, 0xf08a3c, 0x9b6bd6, 0x2fb5c4, 0xe86aa0, 0x6b7d3a, 0xd9c23a,
    0x5a5a6a,
  ];
  const hairs = [0x2e2018, 0xe8c36a, 0x5a3a24, 0x1d1a22, 0xa0522d];
  const styles = ["short", "long", "bun", "short", "long"];
  const spots = [
    [-1.9, 0],
    [0, 0.2],
    [1.9, 0],
    [-1.0, -2.4],
    [1.0, -2.3],
    [-2.1, -4.8],
    [0, -4.6],
    [2.0, -4.9],
    [-1.0, -7.2],
    [1.1, -7.1],
  ];
  for (let i = 0; i < 10; i++) {
    const [x, dz] = spots[i];
    const p = person({
      top: tops[i],
      legs: i % 2 ? 0x2f3a4f : 0x3b5a8a,
      hair: hairs[i % 5],
      style: styles[i % 5],
      stand: true,
      seed: 20 + i,
    });
    p.g.position.set(x, 0, ROW_Z + dz);
    p.z = ROW_Z + dz;
    p.g.rotation.y = (i % 3) * 0.12 - 0.12;
    p.rest(p.armL, 1);
    p.rest(p.armR, -1);
    const rings = makeRings(2, scene);
    ROW.push({ p, x, rings, buzz: i !== 6 });
  }
}

// ================================================================ hologram: screen time
const holoCv = document.createElement("canvas");
holoCv.width = 512;
holoCv.height = 400;
const holoTex = new THREE.CanvasTexture(holoCv);
holoTex.colorSpace = THREE.SRGBColorSpace;
let holoKey = "";
function drawHolo(f) {
  const key = Math.round(f * 40);
  if (key === holoKey) return;
  holoKey = key;
  const x = holoCv.getContext("2d");
  x.clearRect(0, 0, 512, 400);
  x.fillStyle = "rgba(20,40,70,0.55)";
  x.beginPath();
  x.roundRect(8, 8, 496, 384, 34);
  x.fill();
  x.strokeStyle = "#7af0ff";
  x.lineWidth = 8;
  x.stroke();
  x.fillStyle = "#e8fbff";
  x.font = "800 40px Montserrat, sans-serif";
  x.fillText("BILDSCHIRMZEIT", 40, 70);
  const mins = Math.round(192 * clamp01(f));
  x.fillStyle = "#ffd23f";
  x.font = "800 54px Montserrat, sans-serif";
  x.fillText(`${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, "0")} h`, 40, 128);
  const days = ["M", "D", "M", "D", "F", "S", "S"];
  const hs = [0.62, 0.7, 0.55, 0.8, 0.9, 1, 0.85];
  for (let i = 0; i < 7; i++) {
    const h = 190 * hs[i] * clamp01(f * 1.6 - i * 0.08);
    x.fillStyle = i === 5 ? "#ffd23f" : "#7af0ff";
    x.fillRect(48 + i * 64, 340 - h, 40, h);
    x.fillStyle = "#e8fbff";
    x.font = "700 26px Montserrat, sans-serif";
    x.fillText(days[i], 58 + i * 64, 376);
  }
  holoTex.needsUpdate = true;
}
const holo = new THREE.Mesh(
  new THREE.PlaneGeometry(1.9, 1.48),
  new THREE.MeshBasicMaterial({
    map: holoTex,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  }),
);
holo.userData.noAO = true;
scene.add(holo);
const holoBeam = new THREE.Mesh(
  new THREE.ConeGeometry(0.95, 1.1, 16, 1, true),
  new THREE.MeshBasicMaterial({
    color: 0x7af0ff,
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
    side: THREE.DoubleSide,
  }),
);
holoBeam.userData.noAO = true;
scene.add(holoBeam);

// ================================================================ pocket BRAIN: the scanner
const lab = new THREE.Group();
lab.position.set(...BRAIN);
scene.add(lab);
{
  const room = new THREE.Mesh(
    new THREE.SphereGeometry(45, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0x060a1a, side: THREE.BackSide, fog: false }),
  );
  lab.add(room);
  // glossy dark floor with a cyan grid
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(40, 48),
    flat(0x0b1226, { roughness: 0.25, metalness: 0.3 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -4.6;
  floor.receiveShadow = true;
  lab.add(floor);
  const grid = new THREE.GridHelper(40, 40, 0x1f5f8a, 0x153a5a);
  grid.position.y = -4.58;
  lab.add(grid);
  // the scanner ring
  const ring = mesh(
    new THREE.TorusGeometry(6.2, 1.25, 10, 40),
    flat(0xe9edf4, { roughness: 0.35 }),
    lab,
    0,
    0.3,
    -0.6,
    0.04,
    3,
  );
  ring.castShadow = false;
  const inner = new THREE.Mesh(new THREE.TorusGeometry(5.05, 0.09, 6, 48), glowMat(0x4fc3ff, 2.2));
  inner.position.set(0, 0.3, -0.6);
  lab.add(inner);
  const pl = new THREE.PointLight(0xb8d8ff, 30, 30, 1.6);
  pl.position.set(4, 6, 8);
  lab.add(pl);
  const pl2 = new THREE.PointLight(0xff6aa0, 14, 20, 1.6);
  pl2.position.set(-6, 2, 4);
  lab.add(pl2);
}
const bigBrainMat = xrayMaterial(0xf59ab4, {
  roughness: 0.45,
  emissive: 0xff4f80,
  emissiveIntensity: 0.18,
});
const bigBrain = makeBrain(lab, 2.6, bigBrainMat);
bigBrain.position.set(0, 0.4, 0);
// the reward centre (deep, front-middle)
const rewardMat = glowMat(0xffd23f, 0);
const reward = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 1), rewardMat);
reward.position.set(0.15, 0.05, 0.5);
reward.userData.noAO = true;
lab.add(reward);
const rewardLight = new THREE.PointLight(0xffc23f, 0, 8, 1.4);
rewardLight.position.copy(reward.position);
lab.add(rewardLight);
// pathways: old (cyan) and new (yellow) — the new ones grow at the payoff
function paths(n, seed, color, r = 1.9) {
  const rr = rng(seed);
  const mat = glowMat(color, 0.9);
  mat.color.set(color);
  return Array.from({ length: n }, () => {
    const pts = [];
    let p = V((rr() - 0.5) * 1.4, (rr() - 0.5) * 0.9, (rr() - 0.5) * 2.2);
    for (let k = 0; k < 5; k++) {
      pts.push(
        p
          .clone()
          .multiplyScalar(r / 1.9)
          .add(V(0, 0.4, 0)),
      );
      p = p.add(V((rr() - 0.5) * 1.1, (rr() - 0.5) * 0.7, (rr() - 0.5) * 1.2));
      p.x = Math.max(-1.6, Math.min(1.6, p.x));
      p.y = Math.max(-0.9, Math.min(1.1, p.y));
      p.z = Math.max(-2.2, Math.min(2.2, p.z));
    }
    const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.05, 5);
    const m = new THREE.Mesh(geo, mat);
    m.userData.noAO = true;
    lab.add(m);
    return m;
  });
}
const oldPaths = paths(12, 5, 0x4fc3ff);
const newPaths = paths(12, 9, 0xffd23f);
// the scan plane sweeping through
const scanPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(9, 7),
  new THREE.MeshBasicMaterial({
    color: 0x4fc3ff,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
    side: THREE.DoubleSide,
  }),
);
scanPlane.userData.noAO = true;
lab.add(scanPlane);

// ================================================================ render
const applyCamera = shotCamera(shots);
const inLab = (t) => (t >= T.tag3 && t < T.merkten) || (t >= T.stellt && t < T.fakt);
const pov = () => false;

function renderAt(t) {
  // ---------------------------------------------- the crate: phone drops in, lid slams, lock snaps
  const lidA = -1.85 * (1 - smooth(ramp(t, T.slam - 0.22, T.slam)));
  const bounce = t > T.slam ? Math.sin((t - T.slam) * 28) * Math.exp(-(t - T.slam) * 9) * 0.12 : 0;
  lid.rotation.x = lidA - Math.abs(bounce);
  const snap = smooth(ramp(t, T.lock - 0.08, T.lock));
  shackle.position.y = 0.13 - 0.07 * snap;
  lock.rotation.z =
    t > T.lock ? Math.sin((t - T.lock) * 16) * Math.exp(-(t - T.lock) * 4) * 0.35 : 0.12;
  // phone in your hand until the drop
  hand.track(t, HAND_KEYS);
  const handOn = hand.group.visible;
  phoneHand.g.visible = handOn && t < T.drop;
  if (phoneHand.g.visible) {
    hand.group.updateMatrixWorld(true);
    const p = V(0, -0.1, 0.42).applyMatrix4(hand.group.matrixWorld);
    phoneHand.g.position.copy(p);
    phoneHand.g.quaternion.copy(hand.group.quaternion);
    phoneHand.g.rotateX(-Math.PI / 2 + 0.25);
    phoneHand.g.rotateZ(Math.PI);
  }
  // falling phone: from the hand into the crate (lying flat, screen up)
  const fall = clamp01((t - T.drop) / 0.32);
  phoneBox.g.visible = t >= T.drop;
  {
    const y0 = DROP[1] - 0.25;
    const y1 = 0.14;
    const y =
      fall < 1
        ? lerp(y0, y1, fall * fall)
        : y1 +
          Math.max(
            0,
            Math.sin((t - T.drop - 0.32) * 18) * Math.exp(-(t - T.drop - 0.32) * 10) * 0.08,
          );
    phoneBox.g.position.set(BOX[0] - 0.05, y, BOX[2] + 0.05);
    phoneBox.g.rotation.set(-Math.PI / 2 + (1 - fall) * 0.9, 0, 0.3 + (1 - fall) * 0.6);
  }
  // the screen glows in the hook, dark once it's locked away
  const scrOn = t < T.slam + 0.2 ? 1 : 0;
  phoneHand.scrMat.emissiveIntensity = 1.4;
  phoneBox.scrMat.emissiveIntensity = 1.4 * scrOn;
  phoneBox.scrMat.color.setScalar(scrOn ? 1 : 0.18);
  phoneLight.intensity = (t < T.slam ? 4 : 0) * (handOn || t >= T.drop ? 1 : 0);
  phoneLight.position
    .copy(t < T.drop ? phoneHand.g.position : phoneBox.g.position)
    .add(V(0, 0.3, 0.2));
  // crate x-ray when "Dein Handy liegt in der Kiste"
  const cx =
    smooth(ramp(t, T.nur + 0.15, T.nur + 0.55)) * (1 - ramp(t, T.phantom - 0.2, T.phantom));
  setXray([crateX], cx);
  for (const e of crateEdges) e.visible = cx > 0.02;

  // ---------------------------------------------- your arm / sleeve while the hand is on
  if (handOn && t >= T.greift - 0.1) {
    hand.group.updateMatrixWorld(true);
    const wrist = V(0, 0, -0.15).applyMatrix4(hand.group.matrixWorld);
    const dir = wrist.clone().sub(SHOULDER);
    const len = dir.length();
    sleeve.visible = true;
    sleeve.position.copy(SHOULDER).addScaledVector(dir, 0.5);
    sleeve.quaternion.setFromUnitVectors(V(0, 1, 0), dir.normalize());
    sleeve.scale.set(1, Math.max(0.1, (len - 0.1) / 1.4), 1);
    you.armR.sh.visible = false;
  } else {
    sleeve.visible = false;
    you.armR.sh.visible = true;
  }
  // POV shots: the camera sits in your head
  you.head.visible = !pov(t);

  // ---------------------------------------------- your head: x-ray + brain
  const hx =
    smooth(ramp(t, T.streiche - 0.1, T.streiche + 0.25)) * (1 - ramp(t, T.tag1 - 0.15, T.tag1)) +
    smooth(ramp(t, T.phantom - 0.1, T.phantom + 0.3)) * (1 - ramp(t, T.studie - 0.15, T.studie));
  setXray([skullMat], hx);
  skullEdges.visible = hx > 0.02;
  for (const h of you.hairParts) h.visible = hx < 0.3;
  headBrain.visible = hx > 0.02;
  headBrain.userData.mat.emissiveIntensity = 0.4 + 0.9 * Math.max(0, Math.sin(t * 9)) * hx;
  const mischief = pop(t, T.streiche + 0.05, T.tag1);
  sparks.forEach((m, i) => {
    const a = t * 3.2 + m.userData.ph * Math.PI * 2;
    m.visible = mischief > 0.01;
    m.position.set(Math.cos(a) * 0.62, 0.15 + Math.sin(a * 2 + i) * 0.22, Math.sin(a) * 0.62);
    m.scale.setScalar(mischief * (0.8 + 0.5 * Math.sin(t * 20 + i)));
    m.rotation.set(t * 4, t * 3, 0);
  });
  // head: looks at the lake, down at the pocket on day one, back at the crate later
  const lookDown = pop(t, T.tag1 + 0.3, T.nur, 0.4);
  const lookBox = pop(t, T.nur + 0.1, T.phantom, 0.3);
  you.head.rotation.set(0.5 * lookDown + 0.15 * lookBox, -0.25 * lookDown - 0.9 * lookBox, 0);
  // shrug at "merkten … nichts" + smile
  const shrug = pop(t, T.merkten + 0.1, T.stellt, 0.3);
  you.armL.sh.rotation.set(-0.35 - 0.3 * shrug, 0, 0.1 + 0.9 * shrug);
  you.armL.el.rotation.set(-1.15 - 0.4 * shrug, 0, 0);
  if (you.armR.sh.visible) {
    you.armR.sh.rotation.set(-0.35 - 0.3 * shrug, 0, -0.1 - 0.9 * shrug);
    you.armR.el.rotation.set(-1.15 - 0.4 * shrug, 0, 0);
  }
  you.torso.rotation.z = Math.sin(t * 0.8) * 0.015;
  you.head.position.y = 2.85 + 0.08 * shrug;
  you.smile(t >= T.merkten ? 1 : 0.3);

  // ---------------------------------------------- the buzz in your pocket
  const buzz = pop(t, T.buzz, T.phantom, 0.25) + 0.7 * pop(t, T.wartet, T.studie, 0.3);
  ghostMat.opacity = 0.75 * buzz * (0.6 + 0.4 * Math.abs(Math.sin(t * 40)));
  ghost.position.x = POCKET[0] + 0.05 + Math.sin(t * 90) * 0.012 * buzz;
  animRings(pocketRings, t, buzz, POCKET[0] + 0.05, POCKET[1] + 0.3, POCKET[2]);
  // the "nothing there" ✕ next to your empty hand
  showNope(
    pop(t, T.leere + 0.3, T.bzzz),
    POCKET[0] - 0.25,
    POCKET[1] + 1.25,
    POCKET[2] + 0.35,
    0.35,
  );
  // the signal from the brain down to the pocket
  const sig = pop(t, T.wartet - 0.1, T.studie, 0.3);
  beads.visible = sig > 0.01;
  for (let i = 0; i < 22; i++) {
    const f = (i / 22 + t * 0.55) % 1;
    dummy.position.copy(sigCurve.getPointAt(f));
    dummy.scale.setScalar(sig * (0.6 + 0.6 * Math.sin(f * Math.PI)));
    dummy.updateMatrix();
    beads.setMatrixAt(i, dummy.matrix);
  }
  beads.instanceMatrix.needsUpdate = true;

  // ---------------------------------------------- the study row
  const rowOn = t >= T.studie - 0.1 && t < T.rate;
  you.g.visible = !rowOn;
  crate.visible = !rowOn;
  phoneBox.g.visible = phoneBox.g.visible && !rowOn;
  ROW.forEach((r, i) => {
    r.p.g.visible = rowOn;
    if (rowOn) r.p.g.scale.copy(squash(t, T.studie + i * 0.06, 0.6));
    const k = r.buzz ? pop(t, T.studie + 0.6 + i * 0.12, T.rate, 0.25) : 0;
    animRings(r.rings, t + i * 0.13, rowOn ? k : 0, r.x - 0.36, 3.2, r.p.z + 0.3, 1.1);
    // the odd one out shrugs
    if (!r.buzz) {
      const s = pop(t, T.neun, T.rate, 0.3);
      r.p.armL.sh.rotation.z = 0.1 + 0.9 * s;
      r.p.armR.sh.rotation.z = -0.1 - 0.9 * s;
    }
  });

  // ---------------------------------------------- the screen-time hologram over the crate
  const hk = pop(t, T.wie + 0.05, 99, 0.3);
  holo.visible = holoBeam.visible = hk > 0.01;
  if (hk > 0.01) {
    drawHolo(ramp(t, T.wie, T.kommentare));
    holo.position.set(BOX[0], 2.2 + Math.sin(t * 2) * 0.04, BOX[2] + 0.1);
    holo.scale.setScalar(Math.max(0.001, 0.62 * outBack(clamp01(hk))));
    holo.rotation.y = 0.2;
    holoBeam.position.set(BOX[0], 1.3, BOX[2]);
    holoBeam.rotation.x = Math.PI;
    holoBeam.scale.setScalar(Math.max(0.001, hk));
  }

  // ---------------------------------------------- the scanner
  lab.visible = inLab(t);
  if (lab.visible) {
    bigBrain.rotation.y = 0.35 + t * 0.12;
    const bx = smooth(ramp(t, T.forscher, T.forscher + 0.6));
    {
      const m = bigBrain.userData.mat;
      const k = (0.6 + 0.4 * smooth(ramp(t, T.belohnung - 0.2, T.belohnung + 0.3))) * bx;
      m.transparent = true;
      m.opacity = lerp(1, 0.42, k);
      m.depthWrite = k < 0.02;
    }
    scanPlane.position.z = Math.sin(t * 1.6) * 2.8;
    const rk = smooth(ramp(t, T.belohnung - 0.1, T.belohnung + 0.5));
    rewardMat.emissiveIntensity = rk * (2.2 + 0.8 * Math.sin(t * 8));
    rewardLight.intensity = rk * 9;
    reward.scale.setScalar(0.6 + rk * (0.5 + 0.1 * Math.sin(t * 8)));
    // payoff: the old cyan paths fade, the new yellow ones grow
    const re = ramp(t, T.stellt + 0.1, T.um + 0.6);
    oldPaths.forEach((m, i) => {
      const k = 1 - smooth(ramp(re, i / 24, i / 24 + 0.4));
      m.visible = k > 0.01;
      m.scale.setScalar(Math.max(0.001, k));
    });
    newPaths.forEach((m, i) => {
      const k = smooth(ramp(re, 0.15 + i / 24, 0.45 + i / 24));
      m.visible = k > 0.01;
      const segs = m.geometry.parameters.tubularSegments;
      m.geometry.setDrawRange(0, Math.ceil(k * segs) * 5 * 6);
    });
    oldPaths.forEach((m) => (m.rotation.y = bigBrain.rotation.y - 0.35));
    newPaths.forEach((m) => (m.rotation.y = bigBrain.rotation.y - 0.35));
  }

  // ---------------------------------------------- HUD + LED facts
  readout("tag", pop(t, T.tag1, T.greift), { label: "Ohne Handy", value: "Tag 1", x: 60, y: 560 });
  readout("tag3", pop(t, T.tag3, T.belohnung), {
    label: "Ohne Handy",
    value: `${Math.round(lerp(0, 72, smooth(ramp(t, T.tag3, T.h72 + 0.3))))} h`,
    x: 60,
    y: 560,
  });
  const hours = Math.round(lerp(0, 21, smooth(ramp(t, T.rate + 0.3, T.ganzen))));
  counter("zurueck", pop(t, T.rate + 0.2, T.ganzen), {
    label: "ZURÜCK",
    value: `${hours} h`,
    x: 60,
    y: 1420,
  });
  const years = Math.max(1, Math.round(lerp(0, 7, smooth(ramp(t, T.fakt + 0.3, T.sieben)))));
  if (t >= T.neun && t < T.folge)
    showPanel(pop(t, T.neun, T.folge), "STUDIE", "9 VON 10", LED.blue);
  else if (t >= T.ganzen && t < T.tag3)
    showPanel(pop(t, T.ganzen, T.tag3), "IN 1 WOCHE", "FAST 1 TAG", LED.green);
  else if (t >= T.fakt + 0.3 && t < T.wie)
    showPanel(
      pop(t, T.fakt + 0.3, T.wie, 0.2),
      "IM LEBEN",
      `${years} ${years === 1 ? "JAHR" : "JAHRE"}`,
      LED.red,
    );
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
