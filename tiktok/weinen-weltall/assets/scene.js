// #69 "Weinen im Weltall" (format B). An astronaut on a spacewalk gets soap
// in the eye, cries — and the tear never falls: it grows into a wobbling
// water ball on the eye, wanders over the nose into the other eye, and he is
// blind on both eyes outside the station (Chris Hadfield, 2001). Übrigens:
// water in a helmet nearly drowned an astronaut (Luca Parmitano, 2013).
// The world (station, robot arm, the Earth's day side) is in set.js.
import {
  THREE,
  ramp,
  smooth,
  easeInOut,
  pop,
  V,
  scene,
  real,
  roundedBox,
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
import { meter } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);

// ---------------------------------------------------------------- materials
const suit = real.fabric(0xf1efe8);
const suitShade = real.fabric(0xdcd8cc);
const hard = real.plastic(0xf4f4f2, { roughness: 0.35 });
const metal = real.metal(0xbfc6ce, { roughness: 0.28 });
const darkM = real.rubber(0x2b2e34);
const red = real.plastic(0xc8352b, { roughness: 0.4 });
const skin = real.skin(0xe2b08f);
const eyeWhite = real.gloss(0xf7f4ef);
const iris = real.gloss(0x5a7fa0);
const pupil = real.gloss(0x0b0b0e);
const lip = real.skin(0xb8746a);
const capWhite = real.fabric(0xf2efe6);
const capBrown = real.fabric(0x5b4433);
const brow = real.fabric(0x4a3524);
const goldVisor = new THREE.MeshPhysicalMaterial({
  color: 0xe0a84a,
  metalness: 1,
  roughness: 0.12,
  clearcoat: 1,
});
const bubble = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.1,
  roughness: 0.03,
  metalness: 0,
  clearcoat: 1,
  clearcoatRoughness: 0.02,
  envMapIntensity: 1.6,
  depthWrite: false,
  side: THREE.DoubleSide,
});
const waterMat = new THREE.MeshPhysicalMaterial({
  color: 0xd8f1ff,
  transparent: true,
  opacity: 0.42,
  roughness: 0.02,
  metalness: 0,
  clearcoat: 1,
  clearcoatRoughness: 0.02,
  envMapIntensity: 2.4,
  specularIntensity: 1,
  depthWrite: false,
});
// bright, fresnel-like rim so the water reads as a lens even on skin
const rimMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  uniforms: { k: { value: 1 } },
  vertexShader: `varying vec3 vN; varying vec3 vV;
    void main(){ vN = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `uniform float k; varying vec3 vN; varying vec3 vV;
    void main(){
      float d = abs(dot(vN, vV));
      float rim = pow(1.0 - d, 2.2);
      float spec = pow(max(0.0, dot(reflect(-vV, vN), normalize(vec3(-0.5, 0.7, 0.5)))), 40.0);
      gl_FragColor = vec4(vec3(0.6, 0.85, 1.0) * rim * 1.1 * k + vec3(spec) * 1.4 * k, 1.0);
      #include <colorspace_fragment>
    }`,
});

// ---------------------------------------------------------------- the astronaut
// Real scale (metres): feet in the foot restraint at y = 0, head at ~1.7 m.
const astro = new THREE.Group();
scene.add(astro);
const mk = (geo, mat, x, y, z, parent = astro) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};
function limb(geo, mat, parent = astro) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  parent.add(m);
  return m;
}
const UP = V(0, 1, 0);
function placeSeg(m, a, b) {
  const d = b.clone().sub(a);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(UP, d.normalize());
}

// legs + boots
for (const s of [-1, 1]) {
  mk(roundedBox(0.15, 0.13, 0.32, 0.04), suitShade, s * 0.13, 0.065, 0.04);
  mk(roundedBox(0.152, 0.03, 0.322, 0.012), darkM, s * 0.13, 0.012, 0.04);
  const shin = mk(new THREE.CylinderGeometry(0.085, 0.075, 0.4, 40), suit, s * 0.13, 0.33, 0.0);
  shin.rotation.x = 0.04;
  mk(new THREE.TorusGeometry(0.084, 0.012, 12, 40), suitShade, s * 0.13, 0.53, 0).rotation.x =
    Math.PI / 2;
  mk(new THREE.CylinderGeometry(0.105, 0.088, 0.42, 40), suit, s * 0.13, 0.75, 0);
  mk(new THREE.TorusGeometry(0.1, 0.014, 12, 40), suitShade, s * 0.13, 0.95, 0).rotation.x =
    Math.PI / 2;
  // red commander stripes on the legs (EVA suits carry them)
  if (s > 0)
    mk(new THREE.TorusGeometry(0.106, 0.012, 10, 40), red, s * 0.13, 0.82, 0).rotation.x =
      Math.PI / 2;
}
// pants / brief
mk(roundedBox(0.44, 0.22, 0.3, 0.09), suit, 0, 1.0, 0);
// waist bearing
mk(new THREE.TorusGeometry(0.2, 0.02, 12, 48), metal, 0, 1.06, 0).rotation.x = Math.PI / 2;
// torso (hard upper torso)
mk(roundedBox(0.56, 0.5, 0.36, 0.13), suit, 0, 1.28, 0);
mk(roundedBox(0.5, 0.18, 0.37, 0.07), suitShade, 0, 1.1, 0);
// chest control box with knobs, a small display and a red valve
{
  mk(roundedBox(0.28, 0.13, 0.11, 0.025), hard, 0, 1.22, 0.22);
  mk(roundedBox(0.1, 0.05, 0.01, 0.008), darkM, -0.06, 1.24, 0.276);
  const lcd = new THREE.Mesh(
    new THREE.PlaneGeometry(0.08, 0.035),
    new THREE.MeshBasicMaterial({ color: 0x9be37f }),
  );
  lcd.position.set(-0.06, 1.24, 0.2815);
  lcd.userData.noAO = true;
  astro.add(lcd);
  for (const [x, c] of [
    [0.04, darkM],
    [0.09, red],
  ]) {
    const k = mk(new THREE.CylinderGeometry(0.018, 0.018, 0.03, 24), c, x, 1.22, 0.285);
    k.rotation.x = Math.PI / 2;
  }
  // hoses from the box to the backpack
  for (const s of [-1, 1]) {
    const c = new THREE.CatmullRomCurve3([
      V(s * 0.12, 1.18, 0.25),
      V(s * 0.27, 1.12, 0.2),
      V(s * 0.3, 1.2, -0.05),
      V(s * 0.27, 1.25, -0.18),
    ]);
    limb(
      new THREE.TubeGeometry(c, 30, 0.012, 10),
      s > 0 ? real.plastic(0x2f6fd0) : real.plastic(0xd6d2c8),
    );
  }
  // name patch + flag patch
  mk(roundedBox(0.09, 0.05, 0.005, 0.01), real.fabric(0x1d3d8a), 0.17, 1.4, 0.182);
  mk(roundedBox(0.09, 0.05, 0.005, 0.01), real.fabric(0xdedbd2), -0.17, 1.4, 0.182);
}
// backpack (life support)
mk(roundedBox(0.6, 0.72, 0.28, 0.07), hard, 0, 1.3, -0.32);
mk(roundedBox(0.5, 0.2, 0.05, 0.03), suitShade, 0, 1.45, -0.47);
for (const y of [1.08, 1.2]) mk(roundedBox(0.6, 0.012, 0.282, 0.005), metal, 0, y, -0.32);
// neck ring
mk(new THREE.TorusGeometry(0.17, 0.028, 16, 64), metal, 0, 1.51, 0.02).rotation.x = Math.PI / 2;
// shoulders
for (const s of [-1, 1]) mk(new THREE.SphereGeometry(0.12, 40, 24), suit, s * 0.32, 1.44, 0);

// arms: two segments + glove, positioned by a simple two-bone solve
function makeArm(side) {
  const upper = limb(new THREE.CylinderGeometry(0.085, 0.078, 1, 36), suit);
  const fore = limb(new THREE.CylinderGeometry(0.075, 0.066, 1, 36), suit);
  const elbowJ = limb(new THREE.SphereGeometry(0.08, 32, 20), suitShade);
  const glove = new THREE.Group();
  astro.add(glove);
  const g = new THREE.Mesh(roundedBox(0.11, 0.06, 0.14, 0.028), real.rubber(0xe9e6de));
  g.position.z = 0.07;
  g.castShadow = true;
  glove.add(g);
  const fingers = new THREE.Mesh(roundedBox(0.105, 0.05, 0.07, 0.024), real.rubber(0xdcd8cf));
  fingers.position.set(0, -0.012, 0.16);
  fingers.rotation.x = 0.45;
  glove.add(fingers);
  const thumb = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.018, 0.04, 6, 16),
    real.rubber(0xdcd8cf),
  );
  thumb.position.set(-side * 0.06, -0.005, 0.1);
  thumb.rotation.set(Math.PI / 2, 0, side * 0.5);
  glove.add(thumb);
  const cuff = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.07, 0.05, 32),
    real.plastic(0x2f6fd0),
  );
  cuff.rotation.x = Math.PI / 2;
  glove.add(cuff);
  const S = V(side * 0.34, 1.42, 0);
  const L1 = 0.31;
  const L2 = 0.3;
  return (H) => {
    const d = H.clone().sub(S);
    const dist = Math.min(d.length(), L1 + L2 - 0.001);
    const dir = d.normalize();
    const a = (L1 * L1 - L2 * L2 + dist * dist) / (2 * dist);
    const h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
    const pole = V(side * 0.8, -0.6, -0.3);
    pole.addScaledVector(dir, -pole.dot(dir)).normalize();
    const E = S.clone().addScaledVector(dir, a).addScaledVector(pole, h);
    const W = S.clone().addScaledVector(dir, dist);
    placeSeg(upper, S, E);
    upper.scale.y = L1;
    placeSeg(fore, E, W);
    fore.scale.y = L2;
    elbowJ.position.copy(E);
    glove.position.copy(W);
    const fd = W.clone().sub(E).normalize();
    glove.quaternion.setFromUnitVectors(V(0, 0, 1), fd);
  };
}
const armR = makeArm(1);
const armL = makeArm(-1);

// ---------------------------------------------------------------- head + face
export const HEAD = V(0, 1.67, 0.03);
const head = new THREE.Group();
head.position.copy(HEAD);
astro.add(head);
{
  const face = new THREE.Mesh(new THREE.SphereGeometry(0.1, 64, 48), skin);
  face.scale.set(0.85, 1.1, 0.95);
  head.add(face);
  // jaw / chin
  const chin = new THREE.Mesh(new THREE.SphereGeometry(0.06, 48, 32), skin);
  chin.scale.set(1, 0.8, 0.9);
  chin.position.set(0, -0.06, 0.04);
  head.add(chin);
  // comms cap: white crown, brown ear pads, mic boom
  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(0.104, 64, 40, 0, Math.PI * 2, 0, 1.25),
    capWhite,
  );
  cap.scale.set(0.87, 1.12, 0.97);
  cap.rotation.x = -0.42;
  head.add(cap);
  for (const s of [-1, 1]) {
    const pad = new THREE.Mesh(new THREE.SphereGeometry(0.04, 32, 20), capBrown);
    pad.scale.set(0.45, 1, 0.9);
    pad.position.set(s * 0.082, -0.005, -0.005);
    head.add(pad);
  }
  const boom = new THREE.CatmullRomCurve3([
    V(-0.085, -0.02, 0.0),
    V(-0.07, -0.06, 0.06),
    V(-0.03, -0.055, 0.095),
  ]);
  head.add(new THREE.Mesh(new THREE.TubeGeometry(boom, 20, 0.004, 8), darkM));
  const micM = new THREE.Mesh(new THREE.SphereGeometry(0.009, 16, 12), darkM);
  micM.position.set(-0.026, -0.055, 0.097);
  head.add(micM);
  // nose
  const bridge = new THREE.Mesh(new THREE.CapsuleGeometry(0.009, 0.03, 8, 16), skin);
  bridge.position.set(0, -0.004, 0.098);
  bridge.rotation.x = 0.35;
  head.add(bridge);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.015, 32, 24), skin);
  tip.scale.set(0.95, 0.85, 0.9);
  tip.position.set(0, -0.022, 0.103);
  head.add(tip);
  // mouth: slightly turned down
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.019, 0.0035, 10, 32, Math.PI * 0.8), lip);
  mouth.position.set(0, -0.06, 0.092);
  mouth.rotation.z = Math.PI * 0.1;
  head.add(mouth);
}
// eyes (in head space): white, iris, pupil, lids, brows
export const EYES = [V(-0.035, 0.022, 0.074), V(0.035, 0.022, 0.074)];
const lids = [];
const irises = [];
const irritation = [];
EYES.forEach((p, i) => {
  const e = new THREE.Mesh(new THREE.SphereGeometry(0.014, 40, 30), eyeWhite);
  e.position.copy(p);
  head.add(e);
  const ir = new THREE.Group();
  ir.position.copy(p).add(V(0, 0, 0.0108));
  const ii = new THREE.Mesh(new THREE.SphereGeometry(0.0068, 32, 20), iris);
  ii.scale.z = 0.4;
  ir.add(ii);
  const pp = new THREE.Mesh(new THREE.SphereGeometry(0.0032, 20, 14), pupil);
  pp.scale.z = 0.4;
  pp.position.z = 0.0012;
  ir.add(pp);
  head.add(ir);
  irises.push(ir);
  // upper lid: a skin cap over the top of the eye, rotates down to squint
  const lid = new THREE.Group();
  lid.position.copy(p);
  const lc = new THREE.Mesh(
    new THREE.SphereGeometry(0.0152, 40, 20, 0, Math.PI * 2, 0, 1.25),
    skin,
  );
  lid.add(lc);
  head.add(lid);
  lids.push(lid);
  // lower lid rim
  const ll = new THREE.Mesh(new THREE.TorusGeometry(0.0135, 0.0022, 8, 32, Math.PI), skin);
  ll.position.copy(p).add(V(0, -0.002, 0.003));
  ll.rotation.set(0.3, 0, Math.PI);
  head.add(ll);
  // brow
  const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.004, 0.026, 6, 12), brow);
  b.position.copy(p).add(V(i ? 0.002 : -0.002, 0.024, 0.006));
  b.rotation.z = Math.PI / 2 + (i ? -0.28 : 0.28); // sad, inner ends up
  head.add(b);
  // red irritation round the eye (soap)
  const ri = new THREE.Mesh(
    new THREE.SphereGeometry(0.022, 32, 20),
    new THREE.MeshBasicMaterial({
      color: 0xff3020,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  );
  ri.position.copy(p).add(V(0, -0.002, -0.004));
  ri.scale.set(1.2, 0.9, 0.5);
  ri.userData.noAO = true;
  head.add(ri);
  irritation.push(ri);
});

// ---------------------------------------------------------------- helmet
const HC = V(0, 1.69, 0.03);
const helmet = new THREE.Group();
helmet.position.copy(HC);
astro.add(helmet);
{
  const glass = new THREE.Mesh(new THREE.SphereGeometry(0.2, 96, 64), bubble);
  glass.userData.noAO = true;
  glass.castShadow = false;
  helmet.add(glass);
  // hard shell over the back + top, open to the front
  const shellGeo = new THREE.SphereGeometry(0.212, 96, 48, 0, Math.PI * 2, 0, 1.95);
  shellGeo.rotateX(-1.12);
  const shell = new THREE.Mesh(
    shellGeo,
    new THREE.MeshPhysicalMaterial({ color: 0xf5f5f3, roughness: 0.3, clearcoat: 0.6 }),
  );
  shell.castShadow = true;
  helmet.add(shell);
  // dark padded lining inside the shell, so the face stands out
  const lining = new THREE.Mesh(shellGeo, real.fabric(0x30343c, { side: THREE.BackSide }));
  lining.scale.setScalar(0.985);
  helmet.add(lining);
  // retracted gold visor on top
  const visGeo = new THREE.SphereGeometry(0.222, 96, 32, 0, Math.PI * 2, 0, 0.8);
  visGeo.rotateX(-0.25);
  const vis = new THREE.Mesh(visGeo, goldVisor);
  helmet.add(vis);
  // shell rim
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.193, 0.008, 12, 96), hard);
  rim.rotation.x = -1.12 + Math.PI / 2;
  rim.position.set(0, -0.084, 0.165).multiplyScalar(0.0);
  // helmet lights + camera on both sides
  for (const s of [-1, 1]) {
    const lamp = new THREE.Mesh(roundedBox(0.05, 0.05, 0.09, 0.012), hard);
    lamp.position.set(s * 0.215, 0.05, 0.02);
    helmet.add(lamp);
    const lens = new THREE.Mesh(
      new THREE.CircleGeometry(0.017, 24),
      new THREE.MeshBasicMaterial({ color: 0xfff6dd }),
    );
    lens.position.set(s * 0.215, 0.05, 0.066);
    lens.userData.noAO = true;
    helmet.add(lens);
  }
}

// ---------------------------------------------------------------- water
// the tear ball: unit sphere scaled per frame, a rim shell, a magnified iris
const ball = new THREE.Group();
head.add(ball);
const ballCore = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), waterMat);
ballCore.userData.noAO = true;
ballCore.castShadow = false;
ball.add(ballCore);
const ballRim = new THREE.Mesh(new THREE.SphereGeometry(1.01, 64, 48), rimMat);
ballRim.userData.noAO = true;
ball.add(ballRim);
// "Oberflächenspannung": a net of molecules on the ball's skin
const netGeo = new THREE.IcosahedronGeometry(1.02, 2);
const net = new THREE.LineSegments(
  new THREE.EdgesGeometry(netGeo),
  new THREE.LineBasicMaterial({ color: 0x7fe6ff, transparent: true, opacity: 0 }),
);
net.userData.noAO = true;
ball.add(net);
const dots = (() => {
  const pts = [];
  const p = netGeo.attributes.position;
  const seen = new Set();
  for (let i = 0; i < p.count; i++) {
    const k = `${p.getX(i).toFixed(3)},${p.getY(i).toFixed(3)},${p.getZ(i).toFixed(3)}`;
    if (seen.has(k)) continue;
    seen.add(k);
    pts.push(V(p.getX(i), p.getY(i), p.getZ(i)));
  }
  const im = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.035, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0xbff4ff, transparent: true, opacity: 0 }),
    pts.length,
  );
  const m4 = new THREE.Matrix4();
  pts.forEach((q, i) => im.setMatrixAt(i, m4.makeTranslation(q.x, q.y, q.z)));
  im.userData.noAO = true;
  ball.add(im);
  return im;
})();
// magnified iris copies (the ball acts as a lens)
const lensIris = EYES.map((p) => {
  const g = new THREE.Group();
  const ii = new THREE.Mesh(new THREE.SphereGeometry(0.0068, 32, 20), iris);
  ii.scale.z = 0.3;
  g.add(ii);
  const pp = new THREE.Mesh(new THREE.SphereGeometry(0.0032, 20, 14), pupil);
  pp.scale.z = 0.3;
  pp.position.z = 0.001;
  g.add(pp);
  g.position.copy(p).add(V(0, 0, 0.0125));
  head.add(g);
  return g;
});
// small tear drops welling up from the inner corners
const drops = [];
for (let i = 0; i < 8; i++) {
  const d = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), waterMat);
  d.userData.noAO = true;
  head.add(d);
  drops.push(d);
}
// the soap blob from the visor
const soap = new THREE.Mesh(
  new THREE.SphereGeometry(0.008, 24, 16),
  real.gloss(0xe9ffe0, { transparent: true, opacity: 0.85 }),
);
head.add(soap);
// Übrigens: water filling a helmet round the head
const helmWater = new THREE.Group();
head.add(helmWater);
helmWater.add(new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), waterMat));
helmWater.add(new THREE.Mesh(new THREE.SphereGeometry(1.01, 64, 48), rimMat));
helmWater.children.forEach((m) => (m.userData.noAO = true));

// arrow: the tear does NOT fall down
const downArrow = makeArrowSet([[V(-0.035, 1.63, 0.27), V(-0.035, 1.34, 0.3)]], {
  amp: 0,
  r: 0.007,
  mat: forceMat,
});
downArrow.forEach((g) => scene.add(g));

// ---------------------------------------------------------------- motion keys
const lerpV = (a, b, k) =>
  V(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k);
function track(t, keys) {
  if (t <= keys[0][0]) return V(...keys[0][1]);
  for (let i = 0; i < keys.length - 1; i++) {
    const [ta, a] = keys[i];
    const [tb, b] = keys[i + 1];
    if (t < tb) return lerpV(a, b, easeInOut((t - ta) / (tb - ta)));
  }
  return V(...keys[keys.length - 1][1]);
}
const REST_R = [0.38, 1.02, 0.2];
const REST_L = [-0.4, 1.05, 0.16];
const VISOR = [0.2, 1.64, 0.24]; // glove knuckles against the bubble in front of the face
const VISOR2 = [0.18, 1.73, 0.23];
const kR = () => [
  [-0.6, [0.3, 1.3, 0.45]],
  [0.35, VISOR],
  [0.55, [0.27, 1.66, 0.3]],
  [0.95, VISOR2],
  [1.25, [0.3, 1.5, 0.35]],
  [T.klingt, REST_R],
  [T.wegwischen, REST_R],
  [T.helm1 - 0.02, VISOR2],
  [T.helm1 + 0.25, [0.27, 1.66, 0.3]],
  [T.helm1 + 0.55, VISOR],
  [T.rate + 0.6, REST_R],
];

// tear ball state (head space): centre, radii
function ballState(t) {
  const A = EYES[0].clone().add(V(0, -0.002, 0.012));
  const B = EYES[1].clone().add(V(0, -0.002, 0.012));
  if (t < T.klingt) {
    const r = 0.03 + 0.008 * smooth(ramp(t, 0, T.klingt));
    return { c: A, rx: r, ry: r, rz: r * 0.8, eye: [1, 0] };
  }
  if (t < T.traenen) return null;
  if (t < T.nase) {
    const g = smooth(ramp(t, T.traenen + 0.3, T.wasserkugel + 0.3));
    const r = 0.004 + 0.027 * g + 0.004 * ramp(t, T.wasserkugel + 0.3, T.nase);
    return { c: A, rx: r, ry: r, rz: r * 0.8, eye: [g, 0] };
  }
  if (t < T.uebrigens) {
    const m = smooth(ramp(t, T.nase - 0.1, T.andere + 0.5));
    const grow = smooth(ramp(t, T.waechst, T.uebrigens));
    const c = A.clone().lerp(A.clone().add(B).multiplyScalar(0.5), m);
    const rx = 0.035 + 0.036 * m + 0.012 * grow;
    const ry = 0.035 + 0.006 * m + 0.012 * grow;
    return { c, rx, ry, rz: 0.03 + 0.006 * m + 0.01 * grow, eye: [1, m] };
  }
  return null;
}

// ---------------------------------------------------------------- shots
const applyCamera = shotCamera(shots);

// ---------------------------------------------------------------- render
function renderAt(t) {
  // the astronaut floats gently in the foot restraint
  astro.rotation.set(
    Math.sin(t * 0.4) * 0.015,
    Math.sin(t * 0.27) * 0.03,
    Math.sin(t * 0.33 + 1) * 0.012,
  );
  head.rotation.set(Math.sin(t * 0.5) * 0.03 - 0.02, Math.sin(t * 0.37) * 0.05, 0);

  armR(track(t, kR()));
  armL(
    track(t, [
      [0, REST_L],
      [T.ohne, [-0.42, 1.12, 0.1]],
      [T.folge, REST_L],
      [T.wegwischen, [-0.4, 1.2, 0.25]],
      [T.rate, REST_L],
    ]).add(V(0, Math.sin(t * 0.6) * 0.01, 0)),
  );

  // eyes: soap stings → squint; blind at the end → squeezed
  const sting = pop(t, T.brennt, T.ohne, 0.15);
  const squint = Math.max(
    0.6 * sting,
    t < T.klingt ? 0.35 : 0,
    0.3 * ramp(t, T.jetzt2, T.blind2 + 0.3) * (t < T.uebrigens ? 1 : 0),
  );
  const blink = (t * 0.31) % 1 < 0.04 ? 0.8 : 0;
  lids.forEach(
    (l, i) =>
      (l.rotation.x = 0.15 + Math.max(squint * (i === 0 || t > T.andere ? 1 : 0.5), blink) * 1.1),
  );
  irritation.forEach(
    (m, i) =>
      (m.material.opacity = (i === 0 ? 0.45 : 0.15) * sting + (t < T.klingt && i === 0 ? 0.25 : 0)),
  );
  irises.forEach((ir, i) => ir.position.setX(EYES[i].x + Math.sin(t * 1.3 + i) * 0.0015));

  // soap: off the visor into the left eye
  const sv = t >= T.seife && t < T.brennt + 0.25;
  soap.visible = sv;
  if (sv) {
    const k = smooth(ramp(t, T.seife, T.auge1 + 0.1));
    soap.position.copy(V(-0.06, 0.07, 0.17).lerp(EYES[0].clone().add(V(0, 0.004, 0.016)), k));
    soap.scale.setScalar(1 - smooth(ramp(t, T.brennt, T.brennt + 0.25)) * 0.99);
  }

  // tear drops welling up while crying (they join the ball)
  drops.forEach((d, i) => {
    const on = t >= T.traenen && t < T.wasserkugel + 0.4;
    d.visible = on;
    if (!on) return;
    const ph = ((t - T.traenen) * 1.4 + i / drops.length) % 1;
    const eye = EYES[0];
    const from = eye.clone().add(V(0.016 * (i % 2 ? 1 : 0.6), -0.006 - (i % 3) * 0.003, 0.004));
    const to = eye.clone().add(V(0, -0.002, 0.014));
    d.position.copy(from.lerp(to, smooth(ph)));
    d.scale.setScalar(0.0025 + 0.002 * Math.sin(ph * Math.PI));
  });

  // the tear ball
  const st = ballState(t);
  ball.visible = !!st;
  if (st) {
    const w = 1 + 0.07 * Math.sin(t * 7.3) + 0.04 * Math.sin(t * 11.9 + 1);
    const w2 = 1 + 0.07 * Math.sin(t * 7.3 + Math.PI) + 0.04 * Math.sin(t * 9.1);
    ball.position.copy(st.c);
    ball.scale.set(Math.max(0.001, st.rx * w), Math.max(0.001, st.ry * w2), Math.max(0.001, st.rz));
    lensIris.forEach((g, i) => {
      const k = st.eye[i];
      g.visible = k > 0.05;
      g.scale.setScalar(1 + 0.6 * k);
    });
  } else lensIris.forEach((g) => (g.visible = false));
  // molecule net while "Oberflächenspannung"
  const nk = pop(t, T.oberfl - 0.1, T.jetzt2, 0.3);
  net.material.opacity = 0.85 * nk;
  dots.material.opacity = nk;
  net.visible = dots.visible = nk > 0.01;
  rimMat.uniforms.k.value = 1;

  // Übrigens: water fills another helmet round the head
  const hw = t >= T.uebrigens;
  helmWater.visible = hw;
  if (hw) {
    const g = smooth(ramp(t, T.uebrigens + 0.2, T.ertrunken + 0.3));
    const w = 1 + 0.05 * Math.sin(t * 6.1);
    helmWater.position.set(0, -0.01, -0.06 + 0.07 * g);
    helmWater.scale.set((0.07 + 0.065 * g) * w, (0.06 + 0.07 * g) / w, 0.07 + 0.06 * g);
  }

  // the arrow down that never happens
  const ak = pop(t, T.runter - 0.25, T.ohne);
  animateArrows(downArrow, t, ak);
  showNope(pop(t, T.runter + 0.15, T.ohne), -0.035, 1.45, 0.3, 0.09);

  // panels
  if (t >= T.ohne && t < T.traene)
    showPanel(pop(t, T.ohne, T.traene), "SCHWERKRAFT", "KEIN UNTEN", LED.blue);
  else if (t >= T.uebrigens && t < T.bei)
    showPanel(pop(t, T.uebrigens + 0.3, T.bei), "2013 · WASSER", "IM HELM", LED.blue);
  else showPanel(0);

  // the helmet camera's view: Sicht meter
  const m1 = pop(t, T.verschwimmt, T.folge);
  const m2 = pop(t, T.jetzt2, T.denn);
  if (m1 > 0)
    meter("sicht", m1, {
      label: "SICHT",
      value: 1 - 0.55 * smooth(ramp(t, T.verschwimmt, T.verschwimmt + 0.8)),
      text: "50 %",
      y: 430,
      color: "#ffd23f",
    });
  if (m2 > 0) {
    const v = 0.45 * (1 - smooth(ramp(t, T.jetzt2 + 0.3, T.blind2 + 0.2)));
    meter("sicht", m2, {
      label: "SICHT",
      value: v,
      text: `${Math.round(v * 100)} %`,
      y: 430,
      color: "#ff4b2b",
    });
  }

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
