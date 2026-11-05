// #61 Niesen (Format B: „Was passiert, wenn du mit offenen Augen niest?“)
// You sit on a picnic blanket in a morning meadow (set.js) and hold your
// eyes open with your fingers. The myth plays (eyes shoot out on springs),
// then the real sneeze: a cloud of droplets bursts across the meadow and
// blows the dandelions bare, the lids fight the fingers (reflex). Then the
// danger: nose + mouth shut, the body turns to x-ray, the windpipe swells;
// the Scottish driver on his road; a giant windpipe section where the tear
// opens; payoff solid again, the sneeze into the elbow, the sun sneeze.
import {
  THREE,
  ramp,
  smooth,
  pop,
  lerp,
  clamp01,
  V,
  scene,
  flat,
  jitter,
  facet,
  facetMat,
  rng,
  xrayMaterial,
  xrayEdges,
  setXray,
  showPanel,
  showNope,
  LED,
  labels,
  puff,
  highlights,
  shotCamera,
  renderFrame,
  start,
  outBack,
} from "./world.js";
import { DANDELIONS } from "./set.js";
import { meter } from "./hud.js";
import {
  T,
  shots,
  LABELS,
  HIGHLIGHTS,
  HEAD,
  MOUTH,
  SCOT,
  CUT,
  HOLE,
  SUN,
  ELBOW_AT,
} from "./beats.js";

highlights(HIGHLIGHTS);
const win = (t, a, b, d = 0.3) => pop(t, a, b, d);
const UP = V(0, 1, 0);
const tmpQ = new THREE.Quaternion();
// place a unit (radius 1, height 1, along y) cylinder between two points
function seg(mesh, a, b, r) {
  const d = new THREE.Vector3().subVectors(b, a);
  const len = Math.max(1e-4, d.length());
  mesh.position.copy(a).addScaledVector(d, 0.5);
  mesh.quaternion.copy(tmpQ.setFromUnitVectors(UP, d.multiplyScalar(1 / len)));
  mesh.scale.set(r, len, r);
}
const mk = (geo, mat, parent, x = 0, y = 0, z = 0, shadow = true) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};

// ================================================================ the person
const SKIN = 0xf2c29f;
const HOOD = 0xe8574a;
const skinX = xrayMaterial(SKIN, { roughness: 0.7 });
const hoodX = xrayMaterial(HOOD, { roughness: 0.8 });
const shellMats = [skinX, hoodX];
// the arms turn to glass too, so they never hide the windpipe
const skinA = xrayMaterial(SKIN, { roughness: 0.7 });
const hoodA = xrayMaterial(HOOD, { roughness: 0.8 });
shellMats.push(skinA, hoodA);
const jeans = flat(0x3d5a8a, { roughness: 0.85 });
const hairMat = flat(0x4a2c1c, { roughness: 0.85 });

const person = new THREE.Group();
scene.add(person);

// ---- body: hoodie torso, shoulders, neck, crossed legs
const torso = new THREE.Group();
torso.position.set(0, 0.45, 0);
person.add(torso);
{
  const tg = facet(jitter(new THREE.CylinderGeometry(0.66, 0.86, 1.45, 14, 3), 0.015, 2), 0.04, 2);
  const tm = mk(tg, hoodX, torso, 0, 0.78, 0);
  tm.scale.z = 0.78;
  const te = xrayEdges(tg);
  te.position.copy(tm.position);
  te.scale.copy(tm.scale);
  torso.add(te);
  const sh = mk(new THREE.SphereGeometry(1, 16, 10), hoodX, torso, 0, 1.5, 0);
  sh.scale.set(0.98, 0.36, 0.62);
  // hood folded behind the neck + drawstrings
  const hood = mk(new THREE.TorusGeometry(0.34, 0.13, 6, 14), hoodX, torso, 0, 1.68, -0.22);
  hood.rotation.x = 1.25;
  for (const sx of [-0.12, 0.12]) {
    const str = mk(
      new THREE.CylinderGeometry(0.015, 0.015, 0.45, 4),
      flat(0xffffff),
      torso,
      sx,
      1.38,
      0.52,
    );
    str.rotation.x = 0.2;
  }
  // pocket
  const pk = mk(new THREE.BoxGeometry(0.8, 0.3, 0.05), flat(0xd24c40), torso, 0, 0.45, 0.66);
  pk.rotation.x = -0.12;
}
const neck = mk(new THREE.CylinderGeometry(0.26, 0.3, 0.55, 10), skinX, person, 0, 2.4, 0.02);
{
  const ne = xrayEdges(neck.geometry);
  ne.position.copy(neck.position);
  person.add(ne);
}
// crossed legs on the blanket
for (const sx of [-1, 1]) {
  const thigh = mk(new THREE.CylinderGeometry(1, 1, 1, 9), jeans, person);
  seg(thigh, V(sx * 0.42, 0.42, 0.05), V(-sx * 0.25, 0.3, 1.05), 0.26);
  const shin = mk(new THREE.CylinderGeometry(1, 1, 1, 9), jeans, person);
  seg(shin, V(-sx * 0.25, 0.3 + (sx > 0 ? 0.08 : 0), 1.05), V(-sx * 0.95, 0.24, 0.55), 0.22);
  const shoe = mk(
    new THREE.BoxGeometry(0.3, 0.24, 0.52),
    flat(0xf4f1ea),
    person,
    -sx * 1.05,
    0.2,
    0.42,
  );
  shoe.rotation.y = sx * 0.6;
  const sole = mk(
    new THREE.BoxGeometry(0.32, 0.06, 0.54),
    flat(0xe2453c),
    person,
    -sx * 1.05,
    0.08,
    0.42,
  );
  sole.rotation.y = sx * 0.6;
}

// ---- head
const head = new THREE.Group();
head.position.set(...HEAD);
person.add(head);
const faceParts = []; // hidden during x-ray
{
  const sg = facet(jitter(new THREE.SphereGeometry(0.75, 18, 14), 0.012, 3), 0.035, 3);
  const skull = mk(sg, skinX, head);
  skull.scale.set(0.9, 1.04, 0.94);
  const se = xrayEdges(sg);
  se.scale.copy(skull.scale);
  head.add(se);
  const jaw = mk(
    jitter(new THREE.SphereGeometry(0.52, 14, 10), 0.01, 4),
    skinX,
    head,
    0,
    -0.34,
    0.12,
  );
  jaw.scale.set(0.95, 0.72, 0.95);
  for (const sx of [-1, 1]) {
    const ear = mk(new THREE.SphereGeometry(0.15, 8, 6), skinX, head, sx * 0.67, -0.02, -0.02);
    ear.scale.set(0.45, 1, 0.75);
  }
  // hair: cap + fringe + a little tuft
  const cap = mk(
    facet(
      jitter(new THREE.SphereGeometry(0.8, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.46), 0.02, 5),
      0.06,
      5,
    ),
    facetMat(hairMat),
    head,
    0,
    0.06,
    -0.05,
  );
  cap.scale.set(0.93, 1.06, 1.0);
  cap.rotation.x = -0.22;
  faceParts.push(cap);
  for (let i = 0; i < 7; i++) {
    const f = mk(new THREE.ConeGeometry(0.1, 0.34, 4), hairMat, head, -0.42 + i * 0.14, 0.56, 0.5);
    f.rotation.set(2.05, 0, (i - 3) * 0.16);
    faceParts.push(f);
  }
  const tuft = mk(new THREE.ConeGeometry(0.08, 0.32, 4), hairMat, head, 0.1, 0.86, 0.05);
  tuft.rotation.z = -0.4;
  faceParts.push(tuft);
}
// nose (twitches, nostrils flare)
const nose = new THREE.Group();
nose.position.set(0, -0.05, 0.68);
head.add(nose);
{
  const n = mk(new THREE.ConeGeometry(0.12, 0.26, 6), skinX, nose, 0, 0, 0.08);
  n.rotation.x = Math.PI / 2;
  n.scale.set(1, 1, 0.8);
  for (const sx of [-1, 1]) {
    const nos = mk(
      new THREE.SphereGeometry(0.035, 6, 4),
      flat(0x6a3a2a),
      nose,
      sx * 0.05,
      -0.07,
      0.14,
      false,
    );
    nos.scale.set(1, 0.6, 0.8);
    faceParts.push(nos);
  }
}
// cheeks (puff up and blush while the sneeze is trapped)
const cheekMat = flat(0xf3a99a, { roughness: 0.7, emissive: 0xff2a2a, emissiveIntensity: 0 });
const cheeks = [-1, 1].map((sx) => {
  const ch = mk(new THREE.SphereGeometry(0.17, 10, 8), cheekMat, head, sx * 0.4, -0.2, 0.47);
  ch.scale.set(1, 0.8, 0.6);
  faceParts.push(ch);
  return ch;
});
// mouth: dark inside + lips, opens "aah" / snaps open on the sneeze
const mouth = new THREE.Group();
mouth.position.set(0, -0.33, 0.66);
head.add(mouth);
const mouthIn = mk(new THREE.SphereGeometry(0.13, 12, 8), flat(0x5a1f24), mouth, 0, 0, 0, false);
const lips = mk(
  new THREE.TorusGeometry(0.13, 0.032, 6, 16),
  flat(0xc0605a),
  mouth,
  0,
  0,
  0.02,
  false,
);
faceParts.push(mouthIn, lips);
// eyebrows
const brows = [-1, 1].map((sx) => {
  const b = mk(
    new THREE.BoxGeometry(0.26, 0.055, 0.06),
    hairMat,
    head,
    sx * 0.27,
    0.36,
    0.63,
    false,
  );
  faceParts.push(b);
  return b;
});
// eyes: socket group → eyeball group (pops out on a spring) + lids
const eyeWhite = flat(0xffffff, { roughness: 0.3 });
const irisMat = flat(0x3f9a8a, { roughness: 0.3 });
const pupilMat = flat(0x121218, { roughness: 0.2 });
const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const lidMat = flat(0xe9b28e, { roughness: 0.7, side: THREE.DoubleSide });
const springMat = flat(0xc8ccd6, { metalness: 0.7, roughness: 0.3 });
const springGeo = (() => {
  const pts = [];
  for (let i = 0; i <= 120; i++) {
    const a = (i / 120) * Math.PI * 2 * 7;
    pts.push(V(Math.cos(a) * 0.05, Math.sin(a) * 0.05, i / 120));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 240, 0.009, 5);
})();
const eyes = [-1, 1].map((sx) => {
  const socket = new THREE.Group();
  socket.position.set(sx * 0.27, 0.13, 0.56);
  head.add(socket);
  const ball = new THREE.Group();
  socket.add(ball);
  const w = mk(new THREE.SphereGeometry(0.15, 16, 12), eyeWhite, ball, 0, 0, 0, false);
  w.scale.z = 0.75;
  const iris = mk(new THREE.CircleGeometry(0.075, 18), irisMat, ball, 0, 0, 0.113, false);
  const pupil = mk(new THREE.CircleGeometry(0.036, 14), pupilMat, ball, 0, 0, 0.1135, false);
  const glint = mk(new THREE.CircleGeometry(0.016, 8), glintMat, ball, 0.028, 0.03, 0.114, false);
  // red veins (they show while the eye is pulled wide)
  const spring = mk(springGeo, springMat, socket, 0, 0, 0, false);
  spring.visible = false;
  // upper lid: top half shell, rotates down over the ball; lower lid: bottom half
  const up = new THREE.Group();
  socket.add(up);
  const ul = mk(
    new THREE.SphereGeometry(0.162, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    lidMat,
    up,
    0,
    0,
    0,
    false,
  );
  ul.scale.z = 0.8;
  // lash line: a thin dark rim on the lid edge
  const lashLine = mk(
    new THREE.TorusGeometry(0.16, 0.01, 4, 24, Math.PI),
    hairMat,
    up,
    0,
    0,
    0,
    false,
  );
  lashLine.rotation.x = Math.PI / 2;
  lashLine.scale.y = 0.8;
  const lo = new THREE.Group();
  socket.add(lo);
  const ll = mk(
    new THREE.SphereGeometry(0.158, 16, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    lidMat,
    lo,
    0,
    0,
    0,
    false,
  );
  ll.scale.z = 0.8;
  faceParts.push(w, iris, pupil, glint, ul, ll);
  up.traverse((o) => o.isMesh && faceParts.push(o));
  return { sx, socket, ball, spring, up, lo, iris };
});
// sparkles next to the eyes in the payoff
const sparkMat = new THREE.MeshBasicMaterial({ color: 0xfff3a0 });
const sparkles = [0, 1, 2, 3].map((i) => {
  const m = mk(new THREE.OctahedronGeometry(0.06, 0), sparkMat, head, 0, 0, 0, false);
  m.userData.p = V((i % 2 ? 1 : -1) * (0.55 + (i > 1 ? 0.12 : 0)), 0.32 - (i > 1 ? 0.2 : 0), 0.62);
  return m;
});

// ---- arms, two-bone IK
function makeArm(sx) {
  const g = new THREE.Group();
  person.add(g);
  const cyl = new THREE.CylinderGeometry(1, 1, 1, 9);
  const upper = mk(cyl, hoodA, g);
  const fore = mk(cyl, hoodA, g);
  const elbowBall = mk(new THREE.SphereGeometry(1, 9, 7), hoodA, g);
  const cuff = mk(new THREE.CylinderGeometry(1, 1, 1, 9), flat(0xd24c40), g);
  const palm = mk(new THREE.SphereGeometry(1, 10, 8), skinA, g);
  const index = mk(cyl, skinA, g);
  const thumb = mk(cyl, skinA, g);
  const tipI = mk(new THREE.SphereGeometry(1, 7, 5), skinA, g);
  const tipT = mk(new THREE.SphereGeometry(1, 7, 5), skinA, g);
  const curl = [0, 1, 2].map(() => mk(new THREE.SphereGeometry(1, 7, 5), skinA, g));
  return { sx, g, upper, fore, elbowBall, cuff, palm, index, thumb, tipI, tipT, curl };
}
const L1 = 0.82;
const L2 = 0.8;
function solveElbow(S, Wr, pole) {
  const d = Math.min(S.distanceTo(Wr), L1 + L2 - 0.02);
  const dir = new THREE.Vector3().subVectors(Wr, S).normalize();
  const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const perp = pole.clone().addScaledVector(dir, -pole.dot(dir)).normalize();
  return S.clone().addScaledVector(dir, a).addScaledVector(perp, h);
}
function poseArm(arm, P) {
  const S = V(arm.sx * 0.9, 1.98, 0.02);
  const Wr = P.wrist;
  const E = P.elbow ?? solveElbow(S, Wr, V(arm.sx * 1, -1, -0.35));
  seg(arm.upper, S, E, 0.19);
  seg(arm.fore, E, Wr, 0.17);
  arm.elbowBall.position.copy(E);
  arm.elbowBall.scale.setScalar(0.19);
  const fd = new THREE.Vector3().subVectors(Wr, E).normalize();
  seg(
    arm.cuff,
    Wr.clone().addScaledVector(fd, -0.12),
    Wr.clone().addScaledVector(fd, -0.02),
    0.185,
  );
  // palm between the wrist and the knuckles (towards the index tip)
  const toI = new THREE.Vector3().subVectors(P.index, Wr);
  const K = Wr.clone().addScaledVector(toI, 0.45);
  arm.palm.position.copy(Wr).lerp(K, 0.55);
  arm.palm.quaternion.setFromUnitVectors(UP, toI.clone().normalize());
  arm.palm.scale.set(0.13, 0.16, 0.08);
  seg(arm.index, K, P.index, 0.062);
  arm.tipI.position.copy(P.index);
  arm.tipI.scale.setScalar(0.064);
  const T0 = Wr.clone().lerp(K, 0.4);
  seg(arm.thumb, T0, P.thumb, 0.065);
  arm.tipT.position.copy(P.thumb);
  arm.tipT.scale.setScalar(0.067);
  // the other three fingers curled into a soft lump beside the knuckles
  const side = new THREE.Vector3().subVectors(P.thumb, K).normalize().multiplyScalar(-1);
  arm.curl.forEach((c, i) => {
    c.position
      .copy(K)
      .addScaledVector(side, 0.06 + i * 0.045)
      .addScaledVector(toI.clone().normalize(), -0.02 - i * 0.02);
    c.scale.setScalar(0.055);
  });
}
const arms = [makeArm(1), makeArm(-1)];
const HY = HEAD[1];
// hand poses in person space (the face is at z ≈ 0.7)
const POSE = {
  lids: (sx) => ({
    // the hands come from the sides: index on the brow edge of the upper lid,
    // thumb under the lower lid, pulling both apart
    wrist: V(sx * 0.86, HY - 0.12, 0.72),
    index: V(sx * 0.34, HY + 0.36, 0.7),
    thumb: V(sx * 0.36, HY - 0.1, 0.74),
  }),
  pinch: () => ({
    wrist: V(0.32, HY - 0.42, 1.28),
    index: V(0.075, HY - 0.06, 0.86),
    thumb: V(-0.07, HY - 0.08, 0.86),
  }),
  cover: () => ({
    wrist: V(-0.42, HY - 0.62, 1.0),
    index: V(0.14, HY - 0.3, 0.88),
    thumb: V(-0.1, HY - 0.46, 0.86),
  }),
  rest: (sx) => ({
    wrist: V(sx * 0.66, 0.62, 0.95),
    index: V(sx * 0.62, 0.5, 1.32),
    thumb: V(sx * 0.48, 0.58, 1.18),
  }),
  elbow: () => ({
    wrist: V(-0.62, HY + 0.02, 0.62),
    elbow: V(...ELBOW_AT),
    index: V(-0.9, HY + 0.12, 0.5),
    thumb: V(-0.82, HY + 0.02, 0.6),
  }),
  touch: (sx) => ({
    // fingertips at the throat ("dein Hals ist in Gefahr")
    wrist: V(sx * 0.35, 2.05, 0.75),
    index: V(sx * 0.08, 2.4, 0.36),
    thumb: V(sx * 0.18, 2.3, 0.42),
  }),
};
function blendPose(a, b, k) {
  const out = {};
  for (const key of ["wrist", "index", "thumb"]) out[key] = a[key].clone().lerp(b[key], k);
  if (a.elbow || b.elbow) {
    // blend the IK elbow with the override
    const S = V(0.9, 1.98, 0.02);
    const ea = a.elbow ?? solveElbow(S, out.wrist, V(1, -1, -0.35));
    const eb = b.elbow ?? solveElbow(S, out.wrist, V(1, -1, -0.35));
    out.elbow = ea.clone().lerp(eb, k);
  }
  return out;
}
// keys: [time, poseName]; each change blends over `d` seconds
function armAt(t, sx, keys, d = 0.42) {
  let cur = POSE[keys[0][1]](sx);
  for (let i = 1; i < keys.length; i++) {
    const [kt, name] = keys[i];
    if (t < kt) break;
    cur = blendPose(cur, POSE[name](sx), smooth(clamp01((t - kt) / d)));
  }
  return cur;
}
const RIGHT = [
  [-1, "lids"],
  [T.gef + 0.35, "pinch"],
  [T.anderer + 0.1, "touch"],
  [T.augen2 - 0.45, "rest"],
  [T.lass + 0.2, "elbow"],
  [T.fakt - 0.1, "rest"],
];
const LEFT = [
  [-1, "lids"],
  [T.gef + 0.5, "cover"],
  [T.anderer + 0.2, "touch"],
  [T.augen2 - 0.4, "rest"],
];

// ---- face animation curves
// lid closure: 0 = normal open, −1 = stretched wide, 1 = shut
function lidAt(t) {
  if (t < T.gef + 0.45) {
    let v = -1;
    // the sneeze: the lids slam against the fingers
    v += 0.55 * pop(t, T.hatschi - 0.05, T.wolke + 0.4, 0.12) * (1 + 0.15 * Math.sin(t * 61));
    // "Wollen trotzdem zu" — pushing, trembling
    v += pop(t, T.lider2, T.gef + 0.2, 0.25) * (0.62 + 0.1 * Math.sin(t * 47));
    return v;
  }
  if (t < T.augen2 - 0.3) {
    // hands on nose + mouth: squeezed, strained eyes
    return 0.28 + 0.06 * Math.sin(t * 9);
  }
  if (t < T.lass) return -0.35; // payoff: eyes wide, fine
  if (t < T.fakt) return lerp(0, 1, pop(t, T.elbow - 0.2, T.elbow + 0.55, 0.12)); // sneeze in the elbow
  if (t < T.gehoerst) {
    // squint into the sun, shut on the sneeze
    return lerp(0.55, 1, pop(t, T.sunSneeze - 0.15, T.sunSneeze + 0.5, 0.1));
  }
  // relaxed, one blink
  return 0.05 + 0.95 * pop(t, T.gehoerst + 1.2, T.gehoerst + 1.4, 0.07);
}
// mouth opening 0..1
function mouthAt(t) {
  if (t < T.brust - 0.1)
    return lerp(0.25, 0.45, smooth(ramp(t, 0, 2.2))) * (1 - 0.3 * Math.sin(t * 6) ** 2);
  if (t < T.hatschi - 0.04) return lerp(0.45, 0.75, ramp(t, T.brust, T.hatschi));
  if (t < T.gef) return lerp(1, 0.18, smooth(ramp(t, T.hatschi, T.wolke + 0.8)));
  if (t < T.augen2 - 0.3) return 0; // pressed shut
  if (t < T.lass) return 0.32; // smile-ish
  if (t < T.fakt) return 0.2 + 0.6 * pop(t, T.elbow - 0.05, T.elbow + 0.4, 0.1);
  if (t < T.gehoerst)
    return (
      lerp(0.2, 0.55, ramp(t, T.fakt, T.sunSneeze)) *
        (1 - ramp(t, T.sunSneeze + 0.2, T.sunSneeze + 0.8)) +
      0.15
    );
  return 0.25;
}
// head rotation [pitch (− = chin up), yaw]
function headRot(t) {
  let pitch = -0.08 * smooth(ramp(t, 0.3, 1.0));
  // inhale: chin up … snap forward on HATSCHI … settle
  pitch +=
    -0.3 * smooth(ramp(t, T.brust, T.hatschi - 0.08)) * (1 - ramp(t, T.hatschi - 0.08, T.hatschi));
  const snap = ramp(t, T.hatschi - 0.08, T.hatschi + 0.04);
  pitch += snap * 0.42 * (1 - smooth(ramp(t, T.hatschi + 0.2, T.wolke + 1.0)));
  pitch -= 0.3 * (t >= T.hatschi + 0.04 ? 0 : 0);
  let yaw = 0;
  // elbow sneeze: a nod into the arm
  pitch += 0.3 * pop(t, T.elbow - 0.1, T.elbow + 0.5, 0.12);
  yaw += -0.25 * win(t, T.lass + 0.2, T.fakt - 0.1, 0.4);
  // into the sun: turn right + chin up, the sneeze jerks it forward
  const sunK = win(t, T.fakt, T.gehoerst, 0.6);
  yaw += 0.85 * sunK;
  pitch += -0.38 * sunK + 0.4 * pop(t, T.sunSneeze - 0.05, T.sunSneeze + 0.45, 0.08);
  // tiny idle drift
  pitch += Math.sin(t * 0.9) * 0.015;
  yaw += Math.sin(t * 0.6 + 1) * 0.02;
  return [pitch, yaw];
}
// eyes shooting out on springs (the myth), 0..1
const popOut = (t) =>
  outBack(clamp01(ramp(t, T.raus1 - 0.08, T.raus1 + 0.28))) *
  (1 - smooth(ramp(t, T.finger - 0.3, T.finger)));
// trapped pressure 0..1 (body)
const pressure = (t) =>
  smooth(ramp(t, T.stifle - 0.1, T.druck + 0.9)) * (1 - smooth(ramp(t, T.augen2 - 0.5, T.augen2)));

// ================================================================ the airway (x-ray inside)
const inner = new THREE.Group();
person.add(inner);
const airMat = flat(0xe05568, { roughness: 0.4, emissive: 0xff2030, emissiveIntensity: 0 });
const lungMat = flat(0xf28ea0, { roughness: 0.6, emissive: 0xff3048, emissiveIntensity: 0 });
const tube = (pts, r) =>
  mk(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => V(...p))), 32, r, 10),
    airMat,
    inner,
    0,
    0,
    0,
    false,
  );
tube(
  [
    [0, 2.86, 0.72],
    [0, 2.92, 0.42],
    [0, 2.84, 0.12],
    [0, 2.62, 0.0],
  ],
  0.075,
);
tube(
  [
    [0, 2.62, 0.68],
    [0, 2.6, 0.36],
    [0, 2.56, 0.05],
  ],
  0.08,
);
// the windpipe swells under pressure: its own group, scaled around its axis
const pipe = new THREE.Group();
pipe.position.set(0, 0, 0.05);
inner.add(pipe);
mk(
  new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([V(0, 2.62, 0), V(0, 2.3, 0), V(0, 1.95, 0), V(0, 1.55, 0)]),
    24,
    0.1,
    10,
  ),
  airMat,
  pipe,
  0,
  0,
  0,
  false,
);
const pipeRings = [];
for (let i = 0; i < 7; i++) {
  const r = mk(
    new THREE.TorusGeometry(0.11, 0.022, 5, 14),
    flat(0xf6ece2),
    pipe,
    0,
    1.62 + i * 0.13,
    0,
    false,
  );
  r.rotation.x = Math.PI / 2;
  pipeRings.push(r);
}
for (const sx of [-1, 1]) {
  tube(
    [
      [0, 1.58, 0.05],
      [sx * 0.18, 1.45, 0.05],
      [sx * 0.34, 1.3, 0.04],
    ],
    0.07,
  );
  const lung = mk(
    facet(jitter(new THREE.SphereGeometry(1, 14, 10), 0.04, sx + 5), 0.05, sx),
    facetMat(lungMat),
    inner,
    sx * 0.4,
    1.25,
    0.03,
    false,
  );
  lung.scale.set(0.22, 0.38, 0.2);
  lung.userData.base = lung.scale.clone();
  lung.userData.lung = true;
}
const lungs = inner.children.filter((o) => o.userData.lung);
// air particles crowding up in the windpipe
const AIR_N = 70;
const airParts = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.03, 0),
  new THREE.MeshBasicMaterial({ color: 0xffb04a }),
  AIR_N,
);
airParts.frustumCulled = false;
inner.add(airParts);
inner.visible = false;

// ================================================================ the sneeze clouds
// droplets (instanced) + mist spheres, for three sneezes: the big one, the
// one into the elbow, the sun sneeze
const DROP_N = 560;
const drops = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(1, 0),
  new THREE.MeshStandardMaterial({
    color: 0xe4f6ff,
    roughness: 0.1,
    metalness: 0.0,
    emissive: 0x9fd8ff,
    emissiveIntensity: 0.35,
    transparent: true,
    opacity: 0.88,
  }),
  DROP_N,
);
drops.frustumCulled = false;
drops.userData.noAO = true;
scene.add(drops);
const SNEEZES = [
  { at: T.hatschi, from: 0, n: 420, power: 1.0, dir: [0, -0.05, 1], spread: 0.36, mist: 1 },
  { at: T.elbow, from: 420, n: 50, power: 0.22, dir: [0, -0.1, 1], spread: 0.6, mist: 0.25 },
  {
    at: T.sunSneeze,
    from: 470,
    n: 90,
    power: 0.55,
    dir: [SUN[0], SUN[1] + 0.1, SUN[2]],
    spread: 0.4,
    mist: 0.55,
  },
];
const mistMeshes = SNEEZES.map(() => {
  const m = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(1, 1),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 1,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
    14,
  );
  m.frustumCulled = false;
  m.userData.noAO = true;
  scene.add(m);
  return m;
});
const dropParam = Array.from({ length: DROP_N }, (_, i) => {
  const r = rng(1000 + i);
  return { a: r(), b: r(), c: r(), d: r(), e: r(), f: r() };
});
const m4 = new THREE.Matrix4();
const qI = new THREE.Quaternion();
const hidden = new THREE.Matrix4().makeScale(0, 0, 0);
// mouth position in the world at time tt (pure: from the head curves, no state)
function mouthAtTime(tt) {
  const [p, y] = headRot(tt);
  const v = V(0, -0.33, 0.8).applyEuler(new THREE.Euler(p, y, 0, "YXZ"));
  const hz = 0.12 * pop(tt, T.hatschi - 0.05, T.hatschi + 0.5, 0.08);
  return v.add(V(HEAD[0], HEAD[1], HEAD[2] + hz));
}
function updateSneezes(t) {
  for (let i = 0; i < DROP_N; i++) drops.setMatrixAt(i, hidden);
  SNEEZES.forEach((s, si) => {
    const tau = t - s.at;
    const mm = mistMeshes[si];
    if (tau < 0 || tau > 7) {
      mm.material.opacity = 0;
      return;
    }
    const base = V(...s.dir).normalize();
    const p0 = mouthAtTime(s.at);
    for (let k = 0; k < s.n; k++) {
      const P = dropParam[s.from + k];
      const dir = base
        .clone()
        .add(
          V((P.a - 0.5) * 2 * s.spread, (P.b - 0.4) * 1.3 * s.spread, (P.c - 0.5) * 0.6 * s.spread),
        )
        .normalize();
      const v = s.power * (5 + 13 * P.d);
      const kd = 1.0 + 2.2 * P.e;
      const size = 0.012 + 0.05 * P.f * P.f;
      const travel = (v * (1 - Math.exp(-kd * tau))) / kd;
      const fall = 0.5 * (0.6 + size * 40) * tau * tau;
      const x = p0.x + dir.x * travel;
      const z = p0.z + dir.z * travel;
      const y = Math.max(0.05, p0.y + dir.y * travel - fall);
      const fade = 1 - ramp(tau, 3.2 + P.a * 2.5, 4.2 + P.a * 2.5);
      const sc = size * fade * (y <= 0.051 ? 0.6 : 1);
      if (sc <= 0.0005) continue;
      m4.compose(V(x, y, z), qI, V(sc, sc, sc));
      drops.setMatrixAt(s.from + k, m4);
    }
    // mist: soft spheres drifting along, growing, fading
    for (let k = 0; k < 14; k++) {
      const r = rng(5000 + si * 50 + k);
      const off = V((r() - 0.5) * 0.7, (r() - 0.4) * 0.5, (r() - 0.5) * 0.3);
      const dist = s.power * (3 + 7 * r()) * (1 - Math.exp(-1.1 * tau));
      const pos = p0
        .clone()
        .addScaledVector(base, dist)
        .add(off.multiplyScalar(1 + tau));
      const rad = s.mist * (0.18 + tau * (0.35 + r() * 0.3));
      m4.compose(pos, qI, V(rad, rad * 0.8, rad));
      mm.setMatrixAt(k, m4);
    }
    mm.instanceMatrix.needsUpdate = true;
    mm.material.opacity =
      0.34 * s.mist * smooth(ramp(tau, 0, 0.06)) * (1 - smooth(ramp(tau, 0.6, 3.6)));
  });
  drops.instanceMatrix.needsUpdate = true;
}

// ---- dandelion seeds blown off by the big sneeze
const SEEDS_PER = 12;
const seeds = new THREE.InstancedMesh(
  new THREE.ConeGeometry(0.035, 0.12, 4),
  flat(0xffffff, { emissive: 0xfff4e0, emissiveIntensity: 0.3 }),
  DANDELIONS.length * SEEDS_PER,
);
seeds.frustumCulled = false;
seeds.userData.noAO = true;
scene.add(seeds);
function updateDandelions(t, p0) {
  const tau = t - T.hatschi;
  DANDELIONS.forEach((d, di) => {
    const dist = Math.hypot(d.x - p0.x, d.z - p0.z);
    // the cloud front: ≈ 14·(1 − e^(−1.4τ)) units out; only dandelions in front of you
    const inFront = d.z > 1.5;
    const tHit = inFront && dist < 13.5 ? -Math.log(1 - dist / 14) / 1.4 : Infinity;
    const k = tau > tHit ? clamp01((tau - tHit) / 0.35) : 0;
    d.head.scale.setScalar(1 - 0.72 * k);
    d.g.rotation.x =
      0.35 *
      Math.sin(Math.max(0, tau - tHit) * 9) *
      Math.exp(-Math.max(0, tau - tHit) * 2) *
      (k > 0 ? 1 : 0);
    for (let j = 0; j < SEEDS_PER; j++) {
      const idx = di * SEEDS_PER + j;
      const r = rng(7000 + idx);
      const st = tau - tHit - r() * 0.15;
      if (!(st > 0) || st > 6) {
        seeds.setMatrixAt(idx, hidden);
        continue;
      }
      const a = r() * Math.PI * 2;
      const x = d.x + Math.cos(a) * 0.12 + (r() - 0.5) * 1.6 * st + Math.sin(st * 2 + j) * 0.15;
      const z = d.z + st * (1.2 + r() * 1.8);
      const y = d.y + Math.sin(a) * 0.12 + st * (0.5 + r() * 0.5) - 0.05 * st * st;
      m4.compose(
        V(x, Math.max(0.1, y), z),
        qI.clone().setFromEuler(new THREE.Euler(Math.PI, 0, st * 2 + j)),
        V(1, 1, 1),
      );
      seeds.setMatrixAt(idx, m4);
    }
  });
  seeds.instanceMatrix.needsUpdate = true;
}

// ================================================================ Schottland: the car
const carDir = V(0.78, 0, 0.62).normalize();
const car = new THREE.Group();
scene.add(car);
const carBody = new THREE.Group();
car.add(carBody);
const driverHead = new THREE.Group();
{
  const paint = flat(0x2f8f5b, { roughness: 0.35 });
  const body = mk(new THREE.BoxGeometry(2.4, 0.55, 1.15), paint, carBody, 0, 0.52, 0);
  body.geometry = facet(body.geometry, 0.04, 2);
  body.material = facetMat(paint);
  const hoodTop = mk(new THREE.BoxGeometry(0.7, 0.12, 1.1), paint, carBody, 0.85, 0.84, 0);
  hoodTop.rotation.z = -0.12;
  const glass = new THREE.MeshStandardMaterial({
    color: 0xbfe3ff,
    roughness: 0.05,
    transparent: true,
    opacity: 0.32,
  });
  mk(new THREE.BoxGeometry(1.25, 0.5, 1.05), glass, carBody, -0.15, 1.04, 0, false);
  mk(new THREE.BoxGeometry(1.32, 0.06, 1.1), paint, carBody, -0.15, 1.31, 0);
  for (const sx of [-0.78, 0.78])
    for (const sz of [-0.55, 0.55]) {
      const w = mk(
        new THREE.CylinderGeometry(0.25, 0.25, 0.2, 12),
        flat(0x22222a),
        carBody,
        sx,
        0.25,
        sz,
      );
      w.rotation.x = Math.PI / 2;
      const hub = mk(
        new THREE.CylinderGeometry(0.11, 0.11, 0.22, 8),
        flat(0xd8dde6, { metalness: 0.6 }),
        carBody,
        sx,
        0.25,
        sz,
      );
      hub.rotation.x = Math.PI / 2;
    }
  for (const sz of [-0.38, 0.38]) {
    mk(
      new THREE.BoxGeometry(0.05, 0.12, 0.22),
      flat(0xfff3c0, { emissive: 0xfff0b0, emissiveIntensity: 0.8 }),
      carBody,
      1.21,
      0.6,
      sz,
      false,
    );
  }
  // the driver on the right (UK): head + hoodie + hands on the wheel
  const drv = new THREE.Group();
  drv.position.set(-0.25, 0, 0.28);
  carBody.add(drv);
  mk(new THREE.BoxGeometry(0.4, 0.45, 0.42), flat(0x3a6fd0), drv, 0, 0.95, 0);
  driverHead.position.set(0, 1.32, 0);
  drv.add(driverHead);
  mk(new THREE.SphereGeometry(0.18, 10, 8), flat(SKIN), driverHead);
  const dh = mk(
    new THREE.SphereGeometry(0.19, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5),
    flat(0xc8742e),
    driverHead,
    0,
    0.03,
    0,
  );
  dh.rotation.z = 0.25;
  for (const sz of [-1, 1]) {
    const ch = mk(
      new THREE.SphereGeometry(0.07, 6, 5),
      cheekMat,
      driverHead,
      0.13,
      -0.05,
      sz * 0.09,
    );
    ch.userData.cheek = true;
  }
  const wheel = mk(new THREE.TorusGeometry(0.16, 0.025, 5, 14), flat(0x22222a), drv, 0.35, 1.0, 0);
  wheel.rotation.y = Math.PI / 2;
  wheel.rotation.x = 0.4;
}
car.scale.setScalar(1.6);
car.rotation.y = -Math.atan2(carDir.z, carDir.x);
const carU = (t) => lerp(-6, 3.5, ramp(t, T.mann - 0.8, T.rate + 0.3));

// ================================================================ the giant windpipe (inside a dome)
const cut = new THREE.Group();
cut.position.set(...CUT);
scene.add(cut);
{
  // dark warm dome all around (nothing of the meadow shows in these shots)
  const dg = new THREE.SphereGeometry(13, 32, 16);
  const cols = [];
  const pos = dg.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / 13;
    const c = new THREE.Color(0x2a0c18).lerp(new THREE.Color(0x8a2f45), clamp01(0.5 - y * 0.6));
    cols.push(c.r, c.g, c.b);
  }
  dg.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
  const dome = new THREE.Mesh(
    dg,
    new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false }),
  );
  dome.userData.noAO = true;
  cut.add(dome);
  // floating glowing specks (it's a body, not a room)
  const sp = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.06, 0),
    new THREE.MeshBasicMaterial({ color: 0xff9db0 }),
    60,
  );
  const r = rng(77);
  for (let i = 0; i < 60; i++) {
    const a = r() * Math.PI * 2;
    const d = 4 + r() * 7;
    m4.compose(V(Math.cos(a) * d, (r() - 0.5) * 9, Math.sin(a) * d), qI, V(1, 1, 1));
    sp.setMatrixAt(i, m4);
  }
  sp.userData.noAO = true;
  cut.add(sp);
  const key = new THREE.PointLight(0xffd6c8, 60, 30, 1.4);
  key.position.set(4, 5, 7);
  cut.add(key);
  const fill = new THREE.PointLight(0xff6a8a, 25, 25, 1.4);
  fill.position.set(-6, -2, 4);
  cut.add(fill);
}
const bigPipe = new THREE.Group();
cut.add(bigPipe);
const wallMat = new THREE.MeshStandardMaterial({
  color: 0xf08a9a,
  roughness: 0.35,
  transparent: true,
  opacity: 0.55,
  side: THREE.DoubleSide,
  depthWrite: false,
  emissive: 0xff2040,
  emissiveIntensity: 0,
});
mk(new THREE.CylinderGeometry(1.4, 1.4, 7.5, 32, 12, true), wallMat, bigPipe, 0, 0, 0, false);
const bigRings = [];
for (let i = 0; i < 11; i++) {
  const ring = mk(
    facet(new THREE.TorusGeometry(1.47, 0.14, 6, 28, Math.PI * 1.6), 0.05, i),
    facetMat(flat(0xf6ece2, { roughness: 0.5 })),
    bigPipe,
    0,
    -3.3 + i * 0.66,
    0,
  );
  ring.rotation.set(Math.PI / 2, 0, Math.PI * 0.7); // gap at the back
  bigRings.push(ring);
}
// the closed top (mouth + nose shut): a dark cap with a ✕ above it
const topCap = mk(
  new THREE.CylinderGeometry(1.5, 1.5, 0.3, 32),
  flat(0x5a1f2c),
  bigPipe,
  0,
  3.85,
  0,
);
// the tear
const holeG = new THREE.Group();
holeG.position.set(...HOLE);
cut.add(holeG);
mk(
  new THREE.CircleGeometry(1, 16),
  new THREE.MeshBasicMaterial({ color: 0x1a0508 }),
  holeG,
  0,
  0,
  0.02,
  false,
);
const holeRim = mk(
  new THREE.TorusGeometry(1, 0.18, 5, 16),
  flat(0xd8203a, { emissive: 0xff1a30, emissiveIntensity: 1.2 }),
  holeG,
  0,
  0,
  0.03,
  false,
);
// air inside: particles rising, crowding at the top, then rushing out the tear
const BIG_N = 180;
const bigAir = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.055, 0),
  new THREE.MeshBasicMaterial({ color: 0xffc06a }),
  BIG_N,
);
bigAir.frustumCulled = false;
cut.add(bigAir);
const bigP = Array.from({ length: BIG_N }, (_, i) => {
  const r = rng(9000 + i);
  return { a: r() * Math.PI * 2, r: Math.sqrt(r()) * 1.15, y: r(), s: r(), out: r() < 0.35 };
});
const holeOpen = (t) => outBack(clamp01(ramp(t, T.loch + 0.02, T.loch + 0.45)));
const cutPressure = (t) =>
  smooth(ramp(t, T.rate, T.loch)) * (1 - 0.6 * smooth(ramp(t, T.loch + 0.1, T.loch + 1.5)));

// ================================================================ camera
const applyCamera = shotCamera(shots, 1);

// ================================================================ renderAt
function renderAt(t) {
  // ---- x-ray of the body
  const xk =
    smooth(ramp(t, T.druck - 0.25, T.druck + 0.25)) *
    (1 - smooth(ramp(t, T.augen2 - 0.4, T.augen2 - 0.05)));
  setXray(shellMats, xk);
  const showFace = xk < 0.4;
  for (const p of faceParts) p.visible = showFace;
  inner.visible = xk > 0.02;

  // ---- body: breathing, the big inhale
  const inhale =
    smooth(ramp(t, T.brust - 0.1, T.hatschi - 0.08)) *
    (1 - smooth(ramp(t, T.hatschi - 0.05, T.hatschi + 0.25)));
  const hold = pressure(t);
  const breath = 1 + 0.015 * Math.sin(t * 2.1) + 0.09 * inhale + 0.05 * hold;
  torso.scale.set(breath, 1 + 0.03 * inhale, breath);
  torso.position.z = -0.12 * pop(t, T.hatschi - 0.05, T.hatschi + 0.6, 0.06);

  // ---- head
  const [pitch, yaw] = headRot(t);
  head.rotation.set(pitch, yaw, 0, "YXZ");
  head.position.set(
    HEAD[0],
    HEAD[1] + 0.04 * inhale,
    HEAD[2] + 0.12 * pop(t, T.hatschi - 0.05, T.hatschi + 0.5, 0.08),
  );
  // nose twitch before the sneeze
  const tw = (t < T.hatschi ? 1 : 0) * (0.5 + 0.5 * Math.sin(t * 17)) * (0.6 + 0.4 * inhale);
  nose.scale.set(1 + 0.08 * tw + 0.1 * hold, 1 + 0.05 * tw, 1);
  nose.rotation.x = -0.06 * tw;
  // mouth
  const mo = mouthAt(t);
  mouthIn.scale.set(1 - 0.25 * mo * 0, 0.12 + mo * 0.85, 0.35);
  lips.scale.set(1, 0.18 + mo * 0.85, 1);
  // cheeks puff while the sneeze is trapped
  for (const ch of cheeks) ch.scale.set(1 + 0.5 * hold, 0.8 + 0.4 * hold, 0.6 + 0.5 * hold);
  cheekMat.emissiveIntensity = 0.55 * hold;
  // brows: up while the eyes are pulled open, knitted when straining
  const lid = lidAt(t);
  brows.forEach((b) => {
    b.position.y = 0.36 + 0.08 * clamp01(-lid) - 0.04 * clamp01(lid);
    b.rotation.z = -b.position.x * (0.6 * clamp01(lid) - 0.3 * clamp01(-lid));
  });
  // eyes + lids
  const po = popOut(t);
  for (const ey of eyes) {
    const zOut = po * 0.75;
    ey.ball.position.z = zOut;
    ey.ball.rotation.y = -ey.sx * 0.15 * po;
    ey.spring.visible = showFace && po > 0.01;
    ey.spring.scale.set(1, 1, Math.max(0.001, zOut));
    const up = lid < 0 ? lerp(-0.35, -0.62, -lid) : lerp(-0.35, 1.3, lid);
    const lo = lid < 0 ? lerp(0.32, 0.5, -lid) : lerp(0.32, -0.42, lid);
    ey.up.rotation.x = up;
    ey.lo.rotation.x = lo;
    // the eyes look at the camera-ish, a little up into the sun later
    ey.iris.parent.rotation.x = -0.25 * win(t, T.fakt, T.gehoerst, 0.6);
  }
  // sparkles in the payoff
  const sk = win(t, T.drin - 0.1, T.drin + 1.4, 0.2);
  sparkles.forEach((m, i) => {
    const k = sk * (0.6 + 0.4 * Math.sin(t * 9 + i * 2));
    m.visible = showFace && k > 0.01;
    m.position.copy(m.userData.p);
    m.scale.setScalar(k);
    m.rotation.set(t * 3 + i, t * 2, 0);
  });

  // ---- arms
  poseArm(arms[0], armAt(t, 1, RIGHT));
  poseArm(arms[1], armAt(t, -1, LEFT));

  // ---- inside: pressure in the windpipe
  if (inner.visible) {
    const p = Math.max(hold, 0.75 * win(t, T.anderer, T.augen2, 0.3));
    const bulge = 1 + 0.55 * hold + 0.06 * hold * Math.sin(t * 22);
    pipe.scale.set(bulge, 1, bulge);
    pipe.position.x = 0;
    airMat.emissiveIntensity = 0.6 + 1.6 * p * (0.75 + 0.25 * Math.sin(t * 14));
    for (const l of lungs) {
      const k = 1 + 0.12 * hold;
      l.scale.set(l.userData.base.x * k, l.userData.base.y * k, l.userData.base.z * k);
    }
    lungMat.emissiveIntensity = 0.3 * hold;
    for (let i = 0; i < AIR_N; i++) {
      const r = rng(300 + i);
      const b = r();
      const ph = r();
      // without pressure the air flows up and down; trapped it piles up and jitters
      const flow = (b + t * 0.4 + ph) % 1;
      const crowd = 1 - Math.pow(1 - b, 1 + 4 * hold);
      const s = lerp(flow, crowd, hold);
      const y = lerp(1.35, 2.75, s);
      const z = y > 2.6 ? lerp(0, 0.4, (y - 2.6) / 0.15) : 0;
      const jit = 0.05 * (0.3 + hold) * bulge;
      m4.compose(
        V(
          Math.sin(t * 13 + i) * jit + (r() - 0.5) * 0.1 * bulge,
          y,
          0.05 + z + Math.cos(t * 11 + i) * jit,
        ),
        qI,
        V(1, 1, 1),
      );
      airParts.setMatrixAt(i, m4);
    }
    airParts.instanceMatrix.needsUpdate = true;
  }

  // ---- sneeze clouds + dandelions
  updateSneezes(t);
  updateDandelions(t, V(...MOUTH));

  // ---- the car on the Scottish road
  const carOn = t > T.mann - 1.0 && t < T.rate + 0.5;
  car.visible = carOn;
  if (carOn) {
    const u = carU(t);
    car.position.set(SCOT[0] + carDir.x * u, 0, SCOT[2] + carDir.z * u);
    const wob = Math.exp(-Math.max(0, t - T.carMpf) * 3) * (t > T.carMpf ? 1 : 0);
    carBody.rotation.x = 0.07 * wob * Math.sin((t - T.carMpf) * 30);
    carBody.rotation.y = 0.05 * wob * Math.sin((t - T.carMpf) * 13);
    const mpf = pop(t, T.carMpf - 0.05, T.carMpf + 0.6, 0.06);
    driverHead.scale.set(1 + 0.25 * mpf, 1 - 0.1 * mpf, 1 + 0.25 * mpf);
    driverHead.rotation.z = -0.25 * mpf;
    puff("carmpf", t, T.carMpf, car.position.x, 1.9, car.position.z, 0.7);
  }

  // ---- the giant windpipe
  const cutOn = t > T.rate - 0.5 && t < T.anderer + 0.2;
  cut.visible = cutOn;
  if (cutOn) {
    const cp = cutPressure(t);
    const ho = holeOpen(t);
    const bul = 1 + 0.1 * cp + 0.02 * cp * Math.sin(t * 20);
    bigPipe.scale.set(bul, 1, bul);
    wallMat.emissiveIntensity = 0.5 * cp;
    bigRings.forEach((r, i) => (r.position.y = -3.3 + i * 0.66 + 0.03 * cp * Math.sin(t * 18 + i)));
    holeG.scale.set(0.34 * ho * bul, 0.2 * ho * bul, 1);
    holeG.visible = ho > 0.01;
    holeRim.material.emissiveIntensity = 1.2 + 0.6 * Math.sin(t * 12);
    for (let i = 0; i < BIG_N; i++) {
      const P = bigP[i];
      let x, y, z;
      if (ho > 0.05 && P.out) {
        // rushing out of the tear, spreading
        const st = ((t - T.loch) * (1.2 + P.s) + P.y) % 0.9;
        const sp = 0.4 + st * 1.4;
        x = HOLE[0] + Math.cos(P.a) * 0.12 * sp;
        y = HOLE[1] + Math.sin(P.a) * 0.1 * sp;
        z = HOLE[2] - 0.6 + st * 2.6;
        if (st < 0.25) z = HOLE[2] - 0.6 + st * 2.4;
      } else {
        const crowd = 1 - Math.pow(1 - P.y, 1 + 5 * cp);
        const flow = (P.y + t * 0.25) % 1;
        const s = lerp(flow, crowd, cp);
        y = -3.6 + s * 7.2;
        const rr = P.r * bul;
        x = Math.cos(P.a + t * 0.5) * rr + Math.sin(t * 9 + i) * 0.06 * cp;
        z = Math.sin(P.a + t * 0.5) * rr + Math.cos(t * 8 + i) * 0.06 * cp;
      }
      m4.compose(V(x, y, z), qI, V(1, 1, 1));
      bigAir.setMatrixAt(i, m4);
    }
    bigAir.instanceMatrix.needsUpdate = true;
    topCap.visible = true;
    showNope(win(t, T.rate + 0.2, T.loch, 0.25), CUT[0], CUT[1] + 4.6, CUT[2], 1.1);
  } else {
    showNope(0);
  }

  // ---- HUD + LED facts
  meter("druck", win(t, T.druck + 0.2, T.mann, 0.25), {
    label: "DRUCK IM HALS",
    value: clamp01(hold * 1.02),
    x: 230,
    y: 560,
    width: 620,
    color: "#ff4a3a",
    text: hold > 0.8 ? "VIEL ZU HOCH" : "",
  });
  if (t >= T.rate && t < T.loch)
    showPanel(win(t, T.rate + 0.15, T.loch), "RATE MAL", "?", LED.yellow);
  else if (t >= T.zwei && t < T.anderer)
    showPanel(win(t, T.zwei, T.anderer), "LOCH", "2 MM", LED.red);
  else if (t >= T.woche && t < T.augen2)
    showPanel(win(t, T.woche, T.augen2), "KAUM SCHLUCKEN", "1 WOCHE", LED.red);
  else if (t >= T.vierte && t < T.gehoerst + 0.2)
    showPanel(win(t, T.vierte, T.gehoerst + 0.2), "SONNEN-NIESER", "JEDER 4.", LED.yellow);
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
