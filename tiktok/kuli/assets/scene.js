// #52 "Kuli-Deckel": the exam pen on the desk (x-ray barrel, the barrel
// hole, the ink column), its cap stuck in a windpipe with air whistling
// through the hole, a POV from inside the mouth, a too-big cap that never
// fits, the snorkel and the toy head with the same hole. The exam hall is
// set.js.
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
  M,
  facet,
  facetMat,
  xrayMaterial,
  xrayEdges,
  setXray,
  showNope,
  makeArrowSet,
  animateArrows,
  forceMat,
  coldMat,
  labels,
  squash,
  puff,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { paperTex } from "./set.js";
import { createHand } from "./hand.js";
import { counter, readout } from "./hud.js";
import {
  T,
  shots,
  LABELS,
  HIGHLIGHTS,
  TUN,
  TUN2,
  PEN,
  PEN_TIP,
  CAP_UP,
  SNORKEL,
  HEAD,
  NORM,
} from "./beats.js";

highlights(HIGHLIGHTS);
scene.add(camera); // the POV teeth + pen ride on the camera

const capMat = flat(0x2f62ff, { roughness: 0.26, metalness: 0.05 });
const holeMat = flat(0x0b1230, { roughness: 0.9 });
const airMat = new THREE.MeshBasicMaterial({ color: 0x9fe9ff, transparent: true, opacity: 0.95 });

// ---------------------------------------------------------------- the cap
// local +y = its axis: open end at y = 0, closed top with the hole at y = 1
function makeCap({ hole = true, color = capMat } = {}) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    facet(new THREE.CylinderGeometry(0.205, 0.215, 1.0, 16, 1, true), 0.04, 3),
    facetMat(color),
  );
  body.material.side = THREE.DoubleSide;
  body.position.y = 0.5;
  body.castShadow = true;
  g.add(body);
  // rounded closed top
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.205, 0.1, 16), color);
  top.position.y = 1.04;
  top.castShadow = true;
  g.add(top);
  if (hole) {
    const h = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 12), holeMat);
    h.position.y = 1.08;
    g.add(h);
  }
  // pocket clip along +z with a little ball at its end
  const clip = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.82, 0.05), color);
  clip.position.set(0, 0.58, 0.26);
  clip.castShadow = true;
  g.add(clip);
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.08, 0.08), color);
  bridge.position.set(0, 0.98, 0.23);
  g.add(bridge);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), color);
  ball.position.set(0, 0.18, 0.27);
  g.add(ball);
  return g;
}

// ---------------------------------------------------------------- the pen
// rig = pivot at the writing tip; the body runs along local -x
function makePen({ xray = false } = {}) {
  const rig = new THREE.Group();
  const body = new THREE.Group();
  body.position.x = -1.94;
  rig.add(body);
  const barrelGeo = new THREE.CylinderGeometry(0.17, 0.17, 3.0, 6);
  barrelGeo.rotateZ(Math.PI / 2);
  const barrelMat = xray ? xrayMaterial(0xdbe9ff) : flat(0xdbe9ff, { roughness: 0.2 });
  const barrel = new THREE.Mesh(barrelGeo, barrelMat);
  barrel.castShadow = true;
  body.add(barrel);
  if (xray) {
    const e = xrayEdges(barrelGeo);
    body.add(e);
  }
  // writing cone + tip ball
  const cone = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.15, 0.42, 12),
    flat(0xf1f1f1, { roughness: 0.4 }),
  );
  cone.rotation.z = -Math.PI / 2;
  cone.position.x = 1.71;
  cone.castShadow = true;
  body.add(cone);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), M.chrome);
  tip.position.x = 1.94;
  body.add(tip);
  // end plug
  const plug = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.16, 12), capMat);
  plug.rotation.z = Math.PI / 2;
  plug.position.x = -1.56;
  body.add(plug);
  // refill tube + ink column (seen through the x-ray)
  const tube = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 2.9, 10),
    flat(0xf4f4f4, { roughness: 0.5 }),
  );
  tube.rotation.z = Math.PI / 2;
  tube.position.x = 0.02;
  body.add(tube);
  const inkMat = flat(0x1d47ff, { roughness: 0.3, emissive: 0x0a1c80, emissiveIntensity: 0.35 });
  const inkGeo = new THREE.CylinderGeometry(0.06, 0.06, 1, 10);
  inkGeo.translate(0, -0.5, 0); // grows from its front end backwards
  const ink = new THREE.Mesh(inkGeo, inkMat);
  ink.rotation.z = -Math.PI / 2; // local -y → body -x
  ink.position.x = 1.4;
  ink.scale.y = 1.74; // back end at x ≈ -0.34 (INK_BACK_X)
  body.add(ink);
  // the small hole on top of the barrel (+ the tape that covers it later)
  const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.04, 10), holeMat);
  hole.position.set(0, 0.165, 0); // x set from HOLE_X below
  body.add(hole);
  const tape = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.03, 0.22),
    flat(0xffd23f, { roughness: 0.6 }),
  );
  tape.position.set(hole.position.x, 0.18, 0);
  tape.visible = false;
  body.add(tape);
  // the cap on the tip
  const cap = makeCap();
  cap.rotation.z = -Math.PI / 2;
  cap.position.x = 1.02;
  body.add(cap);
  return { rig, body, barrelMat, ink, inkMat, hole, tape, cap };
}
// the barrel hole sits 0.06 before the tip-to-centre midpoint: body x = 1.94 - 1.78 + 0.06
const HOLE_X = 1.94 - 1.78 + 0.06;
const INK_BACK_X = 1.94 - 1.78 - 0.5;

// desk pen
const pen = makePen({ xray: true });
pen.hole.position.x = HOLE_X;
pen.tape.position.x = HOLE_X;
scene.add(pen.rig);
function layPen() {
  pen.rig.position.set(...PEN_TIP);
  pen.rig.rotation.set(0, PEN.yaw, 0);
}

// ---------------------------------------------------------------- the writing line on the exam sheet
const lineN = 80;
const lineIM = new THREE.InstancedMesh(
  new THREE.BoxGeometry(0.09, 0.012, 0.05),
  flat(0x2650c8, { roughness: 0.5 }),
  lineN,
);
lineIM.userData.noAO = true;
lineIM.frustumCulled = false;
scene.add(lineIM);
const writePath = (k) => {
  // a scribble running across the exam sheet
  const x = -0.2 + k * 1.8;
  return [x, 0.045, 1.1 - k * 0.2 + Math.sin(k * 40) * 0.09];
};

// ---------------------------------------------------------------- hands
const hand = createHand({ scale: 4.2, sleeve: 0x2f2f3a });
const handPov = createHand({ scale: 3.2, sleeve: 0x2f2f3a });
camera.add(handPov.group);

// ---------------------------------------------------------------- POV: teeth + pen on the camera
const pov = new THREE.Group();
camera.add(pov);
const toothMat = flat(0xfbf7ee, { roughness: 0.35 });
const gumMat = flat(0xe0707c, { roughness: 0.5 });
const upper = new THREE.Group();
const lower = new THREE.Group();
pov.add(upper, lower);
for (const [row, sy] of [
  [upper, 1],
  [lower, -1],
]) {
  for (let i = -4; i <= 4; i++) {
    const w = Math.abs(i) < 2 ? 0.085 : 0.07;
    const tooth = new THREE.Mesh(
      facet(new THREE.CapsuleGeometry(w * 0.5, 0.11, 3, 8), 0.03, 5 + i),
      facetMat(toothMat),
    );
    const x = i * 0.072;
    tooth.position.set(x, sy * 0.255, -0.74 + Math.abs(i) * Math.abs(i) * 0.012);
    tooth.scale.set(1, 1, 0.6);
    row.add(tooth);
  }
  const gum = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.14, 0.2), gumMat);
  gum.position.set(0, sy * 0.36, -0.78);
  row.add(gum);
}
// dark cheeks at the frame edges
for (const sx of [-1, 1]) {
  const cheek = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 10, 8),
    flat(0x7a2430, { roughness: 0.6 }),
  );
  cheek.position.set(sx * 0.33, 0, -0.75);
  cheek.scale.set(0.6, 1.6, 0.6);
  pov.add(cheek);
}
const penPov = makePen();
penPov.hole.position.x = HOLE_X;
// the POV pen points its capped tip at the mouth (local +x → +z of the camera)
penPov.rig.rotation.set(0, -Math.PI / 2, 0);
pov.add(penPov.rig);
const flyCap = makeCap(); // the cap that slips off into the throat
flyCap.visible = false;
pov.add(flyCap);

// air sucked into the mouth on the inhale (streaks flying past the camera)
function streaks(n, mat, seed, rad = 0.012, len = 0.16) {
  const im = new THREE.InstancedMesh(new THREE.CapsuleGeometry(rad, len, 2, 5), mat, n);
  im.userData.noAO = true;
  im.frustumCulled = false;
  const r = rng(seed);
  const s = Array.from({ length: n }, () => [r(), r() * Math.PI * 2, r(), r()]);
  return { im, s };
}
const inhale = streaks(40, airMat, 7);
pov.add(inhale.im);

// ---------------------------------------------------------------- the windpipe (TUN)
const tunnel = new THREE.Group();
tunnel.position.set(...TUN);
tunnel.rotation.x = -Math.PI / 2; // upright: local +z (mouth) → world +y
scene.add(tunnel);
const R = 0.62;
const fleshMat = flat(0xd8616f, { roughness: 0.32, emissive: 0x5a0d18, emissiveIntensity: 0.25 });
const tubeMat = facetMat(fleshMat);
const full = new THREE.Group(); // the closed windpipe (inside shots)
const cutaway = new THREE.Group(); // the hook's cut-away

{
  const geo = new THREE.CylinderGeometry(R, R, 18, 28, 40, true);
  geo.rotateX(Math.PI / 2);
  const tube = new THREE.Mesh(facet(geo, 0.06, 11), tubeMat);
  tube.material.side = THREE.BackSide;
  tube.receiveShadow = true;
  tunnel.add(full, cutaway);
  // cartilage rings
  const ringMat = flat(0xf4c6c2, { roughness: 0.4 });
  for (let z = -8.5; z <= 8.5; z += 0.55) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(R - 0.015, 0.06, 6, 28), ringMat);
    ring.position.z = z;
    full.add(ring);
  }
  // deep end: dark red (towards the lungs); top end: warm light from the mouth
  const deep = new THREE.Mesh(new THREE.CircleGeometry(R, 24), flat(0x2a0508));
  deep.position.z = -9;
  tunnel.add(deep);
  const mouth = new THREE.Mesh(
    new THREE.CircleGeometry(R, 24),
    flat(0xffffff, { emissive: 0xffe0c8, emissiveIntensity: 1.6 }),
  );
  mouth.rotation.y = Math.PI;
  mouth.position.z = 9;
  tunnel.add(mouth);
  // the hook's cut-away: the back half of the windpipe only (local x ≤ 0) + cut rims
  const hgeo = new THREE.CylinderGeometry(R, R, 18, 16, 40, true, Math.PI, Math.PI);
  hgeo.rotateX(Math.PI / 2);
  const half = new THREE.Mesh(facet(hgeo, 0.06, 13), tubeMat);
  half.material.side = THREE.DoubleSide;
  half.receiveShadow = true;
  cutaway.add(half);
  for (let z = -8.5; z <= 8.5; z += 0.55) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(R - 0.015, 0.06, 6, 14, Math.PI), ringMat);
    ring.rotation.z = Math.PI / 2;
    ring.position.z = z;
    cutaway.add(ring);
  }
  const rimMat = flat(0xb8404f, { roughness: 0.5 });
  for (const sy of [-1, 1]) {
    const rim = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 18), rimMat);
    rim.position.set(0, sy * R, 0);
    cutaway.add(rim);
  }
  full.add(tube);
  // dark backdrop around the pocket: hard contrast behind the cut-away
  const back = new THREE.Mesh(
    new THREE.SphereGeometry(14, 24, 12),
    new THREE.MeshBasicMaterial({ color: 0x1a0710, side: THREE.BackSide, fog: false }),
  );
  back.userData.noAO = true;
  tunnel.add(back);
  const l1 = new THREE.PointLight(0xffe2e2, 9, 9, 1.4);
  l1.position.set(0.2, 0.25, -2.4);
  tunnel.add(l1);
  const l2 = new THREE.PointLight(0xffd0c0, 7, 9, 1.4);
  l2.position.set(-0.2, 0.2, 2.6);
  tunnel.add(l2);
}
// the stuck cap, 2.6× (fills the windpipe), closed top towards the lungs (-z)
const CAPS = 2.6;
const tCap = makeCap();
tCap.scale.setScalar(CAPS);
tCap.rotation.x = -Math.PI / 2;
tunnel.add(tCap);
const CAP_Z = CAPS * 0.5; // cap centred at z = 0: open end at +1.3, top at -1.3
// air jet out of the hole (downstream) and air sucked into the open end (upstream)
const jet = streaks(80, airMat, 21, 0.034, 0.32);
const suck = streaks(50, airMat, 22, 0.026, 0.26);
tunnel.add(jet.im, suck.im);
const m4 = new THREE.Matrix4();
const q = new THREE.Quaternion();
const qz = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));
function runJet(st, t, flow, { z0, len, r0, r1, speed, dirZ, size = 1 }) {
  st.s.forEach(([a, ang, rr, sz], i) => {
    const ph = (a + t * speed) % 1;
    const rad = lerp(r0, r1, ph) * (0.3 + 0.7 * rr);
    const k = flow * Math.sin(Math.PI * Math.min(1, ph * 1.2)) * (0.6 + 0.6 * sz) * size;
    m4.compose(
      V(Math.cos(ang) * rad, Math.sin(ang) * rad, z0 + dirZ * ph * len),
      qz,
      V(Math.max(0.001, k), Math.max(0.001, k * (1.2 + flow)), Math.max(0.001, k)),
    );
    st.im.setMatrixAt(i, m4);
  });
  st.im.instanceMatrix.needsUpdate = true;
  st.im.visible = flow > 0.01;
}

// ---------------------------------------------------------------- the throat entrance (TUN2) + the giant cap
const entrance = new THREE.Group();
entrance.position.set(...TUN2);
scene.add(entrance);
{
  const r = rng(77);
  const geo = new THREE.CylinderGeometry(7, 7.5, 1, 40, 6);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const d = Math.hypot(x, z);
    if (pos.getY(i) > 0)
      pos.setY(
        i,
        0.5 +
          Math.sin(x * 1.3) * 0.08 +
          Math.cos(z * 1.1) * 0.08 +
          (d < 1.4 ? -0.35 * (1 - d / 1.4) : 0) +
          r() * 0.03,
      );
  }
  const flesh = new THREE.Mesh(facet(geo, 0.07, 12), facetMat(fleshMat));
  flesh.receiveShadow = true;
  entrance.add(flesh);
  const lip = new THREE.Mesh(
    new THREE.TorusGeometry(0.72, 0.16, 8, 28),
    flat(0xf0a2a6, { roughness: 0.35 }),
  );
  lip.rotation.x = Math.PI / 2;
  lip.position.y = 0.32;
  entrance.add(lip);
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.66, 28), flat(0x1a0306));
  hole.rotation.x = -Math.PI / 2;
  hole.position.y = 0.3;
  entrance.add(hole);
  const back = new THREE.Mesh(
    new THREE.SphereGeometry(16, 24, 12),
    new THREE.MeshBasicMaterial({ color: 0x24101a, side: THREE.BackSide, fog: false }),
  );
  back.userData.noAO = true;
  entrance.add(back);
  const l = new THREE.PointLight(0xfff0e8, 30, 18, 1.3);
  l.position.set(2, 6, 4);
  entrance.add(l);
}
const giant = makeCap({ hole: false, color: flat(0xe2453c, { roughness: 0.3 }) });
giant.scale.set(5.6, 3.0, 5.6);
entrance.add(giant);
const small = makeCap();
small.scale.setScalar(CAPS);
entrance.add(small);

// ---------------------------------------------------------------- desk extras: upright cap, snorkel, toy head, the norm
const capUp = makeCap();
capUp.position.set(...CAP_UP);
scene.add(capUp);
const snorkel = new THREE.Group();
snorkel.position.set(...SNORKEL);
scene.add(snorkel);
{
  const curve = new THREE.CatmullRomCurve3([
    V(0, 2.45, 0),
    V(0, 1.0, 0),
    V(0.02, 0.4, 0.05),
    V(0.25, 0.15, 0.25),
    V(0.55, 0.15, 0.3),
  ]);
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 40, 0.14, 10),
    flat(0xffb321, { roughness: 0.35 }),
  );
  tube.castShadow = true;
  snorkel.add(tube);
  const mouth = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.22, 0.25, 12),
    flat(0x2b2f3a, { roughness: 0.5 }),
  );
  mouth.rotation.z = Math.PI / 2;
  mouth.position.set(0.62, 0.15, 0.3);
  snorkel.add(mouth);
  const end = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.03, 12), holeMat);
  end.position.y = 2.46;
  snorkel.add(end);
}
const head = new THREE.Group();
head.position.set(...HEAD);
scene.add(head);
{
  const yellow = flat(0xffd21f, { roughness: 0.35 });
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.16, 16), yellow);
  neck.position.y = 0.08;
  head.add(neck);
  const skull = new THREE.Mesh(new THREE.CapsuleGeometry(0.48, 0.42, 4, 18), yellow);
  skull.position.y = 0.66;
  skull.castShadow = true;
  head.add(skull);
  const stud = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.2, 16), yellow);
  stud.position.y = 1.2;
  head.add(stud);
  const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.03, 12), holeMat);
  sh.position.y = 1.31;
  head.add(sh);
  const face = flat(0x1d1d22);
  for (const x of [-0.17, 0.17]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), face);
    eye.position.set(x, 0.78, 0.45);
    eye.scale.set(1, 1.3, 0.5);
    head.add(eye);
  }
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.03, 6, 16, Math.PI * 0.8), face);
  smile.rotation.z = Math.PI * 1.1;
  smile.position.set(0, 0.62, 0.46);
  head.add(smile);
}
const normTex = paperTex(840, 1180, (g, w) => {
  g.fillStyle = "#fbfaf6";
  g.fillRect(0, 0, w, 1180);
  g.fillStyle = "#1d2a44";
  g.font = "bold 120px sans-serif";
  g.fillText("ISO 11540", 60, 200);
  g.font = "bold 44px sans-serif";
  g.fillStyle = "#3a4a66";
  g.fillText("Kappen für Schreibgeräte", 60, 280);
  g.fillText("Schutz vor dem Ersticken", 60, 340);
  g.fillStyle = "#e7eefb";
  g.fillRect(50, 420, w - 100, 190);
  g.fillStyle = "#1d47ff";
  g.font = "bold 76px sans-serif";
  g.fillText("Luft: ≥ 8 L/min", 80, 545);
  g.strokeStyle = "#c9d6ea";
  g.lineWidth = 4;
  for (let y = 700; y < 1120; y += 60) {
    g.beginPath();
    g.moveTo(60, y);
    g.lineTo(w - 60 - ((y / 60) % 3) * 90, y);
    g.stroke();
  }
});
const paperMat = flat(0xf8f6f0, { roughness: 0.9 });
const norm = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.03, 6.4), [
  paperMat,
  paperMat,
  flat(0xffffff, { map: normTex, roughness: 0.85 }),
  paperMat,
  paperMat,
  paperMat,
]);
norm.receiveShadow = true;
norm.castShadow = true;
scene.add(norm);
const stamp = new THREE.Mesh(
  new THREE.RingGeometry(0.7, 0.86, 28),
  flat(0xe2453c, { roughness: 0.6, side: THREE.DoubleSide }),
);
stamp.rotation.x = -Math.PI / 2;
const stampTxt = new THREE.Mesh(
  new THREE.PlaneGeometry(1.25, 0.5),
  new THREE.MeshStandardMaterial({
    map: paperTex(300, 120, (g) => {
      g.fillStyle = "#e2453c";
      g.font = "bold 76px sans-serif";
      g.fillText("PFLICHT", 6, 90);
    }),
    transparent: true,
    roughness: 0.6,
  }),
);
stampTxt.rotation.x = -Math.PI / 2;
const stampG = new THREE.Group();
stampG.add(stamp, stampTxt);
stampTxt.position.y = 0.002;
scene.add(stampG);

// air arrows out of the snorkel, the upright cap and the toy head
const arrowsOut = makeArrowSet(
  [
    [V(CAP_UP[0], 1.25, CAP_UP[2]), V(CAP_UP[0] - 0.1, 2.5, CAP_UP[2] + 0.2)],
    [V(SNORKEL[0], 2.6, SNORKEL[2]), V(SNORKEL[0] + 0.05, 3.8, SNORKEL[2] + 0.2)],
  ],
  { mat: coldMat, r: 0.05, amp: 0.08 },
);
const arrowsHead = makeArrowSet(
  [[V(HEAD[0], 1.4, HEAD[2]), V(HEAD[0] + 0.1, 2.7, HEAD[2] + 0.25)]],
  {
    mat: coldMat,
    r: 0.05,
    amp: 0.08,
  },
);
// Unterdruck: arrows inside the barrel pulling the ink back
const underArrows = makeArrowSet(
  [
    [V(INK_BACK_X - 0.75, 0, 0), V(INK_BACK_X - 0.12, 0, 0)],
    [V(INK_BACK_X - 0.75, 0.08, 0.05), V(INK_BACK_X - 0.15, 0.04, 0.02)],
  ],
  { parent: pen.body, mat: forceMat, r: 0.014, amp: 0 },
);

const applyCamera = shotCamera(shots, 1);

// ---------------------------------------------------------------- render
function renderAt(t) {
  const tunnelOn = t < T.stell || (t >= T.zack && t < T.schau) || (t >= T.zurueck && t < T.etwa);
  tunnel.visible = tunnelOn;
  cutaway.visible = t < T.stell;
  full.visible = !cutaway.visible;
  entrance.visible = t >= T.deckel3 - 0.1 && t < T.das3;
  const povOn = t >= T.kaust && t < T.zack;
  pov.visible = povOn;

  // ---------------- the windpipe: the cap flies in on "zack", then sticks
  let capZ = 0;
  if (t >= T.zack && t < T.capLand) {
    const k = ramp(t, T.zack, T.capLand);
    capZ = lerp(8.5, 0, 1 - (1 - k) * (1 - k));
  }
  const wob =
    t >= T.capLand ? Math.sin((t - T.capLand) * 40) * 0.05 * Math.exp(-(t - T.capLand) * 5) : 0;
  tCap.position.set(0, 0, capZ + CAP_Z);
  tCap.rotation.set(-Math.PI / 2 + wob, 0, wob * 0.5);
  // air flow through the hole: steady in the hook, a trickle right after it sticks, big on "acht"
  let flow = 1.15;
  if (t >= T.zack)
    flow = 0.35 + 0.35 * ramp(t, T.capLand, T.jetzt + 0.4) + 0.2 * ramp(t, T.loch2 - 0.4, T.loch2);
  if (t >= T.zurueck) flow = 0.55;
  if (t >= T.korken) flow = 0.25 + 0.3 * ramp(t, T.rate, T.mindestens);
  if (t >= T.mindestens) flow = 0.6 + 0.9 * smooth(ramp(t, T.mindestens, T.acht + 0.2));
  if (t >= T.zack && t < T.capLand) flow = 0;
  const hookJet = t < T.stell;
  runJet(jet, t, flow, {
    z0: -CAPS * 0.5 - 0.02,
    len: hookJet ? 5 : 4,
    r0: 0.03,
    r1: hookJet ? 0.5 : 0.28,
    speed: 0.9 + flow,
    dirZ: -1,
    size: hookJet ? 1.9 : 1,
  });
  runJet(suck, t, flow * 0.8, {
    z0: 2.9,
    len: 1.5,
    r0: 0.45,
    r1: 0.12,
    speed: 0.6 + flow * 0.5,
    dirZ: -1,
    size: 0.8,
  });
  // the windpipe flushes red when the cap plugs it like a cork
  tubeMat.emissiveIntensity =
    0.25 + 0.5 * pop(t, T.korken, T.rate) * (0.6 + 0.4 * Math.sin(t * 12));

  // ---------------- desk pen
  layPen();
  const capOn = t < T.kaust;
  pen.cap.visible = capOn;
  pen.rig.visible = !povOn;
  // hand reaches for the pen during "Prüfung"
  hand.track(t, [
    { t: T.pruefung, pos: [6.0, 2.6, -3.6], rot: [0.35, -0.85, 0], pose: "open" },
    { t: T.pruefung + 0.45, pos: [2.6, 1.6, -0.6], rot: [0.4, -0.85, 0], pose: "open" },
    { t: T.kaust - 0.05, pos: [1.5, 1.0, 0.5], rot: [0.45, -0.85, 0], pose: "grab", out: true },
  ]);
  // writing ("dein Kuli streikt"): tip on the sheet, scribbling, ink stops
  let inkDrawn = 0;
  if (t >= T.dein2 && t < T.kaust2) {
    const k = ramp(t, T.dein2, T.kaust2 - 0.1);
    const p = writePath(k);
    pen.rig.position.set(p[0], p[1] + 0.01, p[2]);
    pen.rig.rotation.set(0, -2.2, -0.75, "YXZ");
    inkDrawn = Math.min(k, ramp(T.streikt - 0.25, T.dein2, T.kaust2 - 0.1));
    hand.group.visible = false;
  }
  // the line: only drawn while ink flows
  {
    const shown = t >= T.dein2 && t < T.kaust2 + 0.5 ? Math.floor(inkDrawn * lineN) : 0;
    for (let i = 0; i < lineN; i++) {
      const k = i / lineN;
      const p = writePath(k);
      const fade = i < shown ? 1 - 0.7 * clamp01((k - inkDrawn + 0.12) / 0.12) : 0;
      m4.compose(V(...p), q, V(Math.max(0.001, fade), 1, Math.max(0.001, fade)));
      lineIM.setMatrixAt(i, m4);
    }
    lineIM.instanceMatrix.needsUpdate = true;
  }
  showNope(pop(t, T.streikt + 0.1, T.kaust2), 0.9, 1.3, 1.0, 0.5);

  // x-ray while the barrel hole and the ink are explained
  const xr =
    0.78 *
    smooth(ramp(t, T.schaft - 0.3, T.schaft + 0.25)) *
    (1 - ramp(t, T.dein2 - 0.1, T.dein2 + 0.25));
  setXray([pen.barrelMat], xr);
  pen.tape.visible = t >= T.tape && t < T.kaust2;
  if (pen.tape.visible) pen.tape.scale.copy(squash(t, T.tape, 0.4));
  // the ink column: wobbles and stays stuck (Unterdruck)
  const stuck =
    t >= T.unterdruck && t < T.dein2
      ? Math.sin(t * 22) * 0.02 * ramp(t, T.unterdruck, T.unterdruck + 0.3)
      : 0;
  pen.ink.scale.y = 1.74 + stuck;
  animateArrows(underArrows, t, pop(t, T.unterdruck + 0.1, T.dein2));

  // ---------------- POV: chewing, then the cap slips off into the throat
  if (povOn) {
    const chew =
      t < T.atmest
        ? Math.abs(Math.sin((t - T.kaust) * 7.5))
        : 0.6 * (1 - ramp(t, T.atmest, T.atmest + 0.15));
    upper.position.y = -0.03 * chew;
    lower.position.y = 0.05 * chew - 0.02;
    const jig = chew * 0.012;
    // pen along -z from the mouth, tip (with the cap) towards the camera
    const pull = ramp(t, T.atmest - 0.25, T.atmest); // the inhale pulls the pen a little closer
    penPov.rig.position.set(
      0.02 + Math.sin(t * 31) * jig,
      -0.02 + Math.sin(t * 27) * jig,
      -1.02 + 0.06 * pull,
    );
    const off = ramp(t, T.capFly, T.capFly + 0.27); // scene time inside the slow motion
    penPov.cap.visible = off <= 0;
    flyCap.visible = off > 0;
    if (off > 0) {
      // cap leaves the pen and flies between the teeth into the mouth (past the camera)
      flyCap.rotation.set(Math.PI / 2 + off * 1.4, off * 0.8, 0);
      flyCap.position.set(0.02 + off * 0.05, -0.02 + off * off * 0.75, -1.94 + off * 1.5);
    }
    // hand holding the far end
    handPov.track(t, [
      { t: T.kaust - 0.1, pos: [0.16, -0.32, -3.0], rot: [0.25, 0.08, 0.1], pose: "grab" },
      { t: T.zack, pos: [0.16, -0.31, -2.9], rot: [0.25, 0.08, 0.1], pose: "grab" },
    ]);
    // inhale streaks
    const inh = pop(t, T.atmest - 0.1, T.zack);
    inhale.s.forEach(([a, ang, rr, sz], i) => {
      const ph = (a + t * 1.6) % 1;
      const rad = 0.05 + rr * 0.18;
      m4.compose(
        V(Math.cos(ang) * rad, Math.sin(ang) * rad * 0.8, -3.2 + ph * 2.2),
        qz,
        V(inh * 0.5 * (0.6 + sz), inh * 1.6, inh * 0.5 * (0.6 + sz)),
      );
      inhale.im.setMatrixAt(i, m4);
    });
    inhale.im.instanceMatrix.needsUpdate = true;
    inhale.im.visible = inh > 0.01;
  } else {
    handPov.group.visible = false;
  }

  // ---------------- the throat entrance: the giant cap drops and does not fit
  if (entrance.visible) {
    const fall = ramp(t, T.giantLand - 0.55, T.giantLand);
    const bounce =
      t > T.giantLand
        ? Math.abs(Math.sin((t - T.giantLand) * 9)) * 0.9 * Math.exp(-(t - T.giantLand) * 3.2)
        : 0;
    giant.position.set(0.1, lerp(12, 3.7, fall * fall) + bounce, 0.05);
    giant.rotation.set(0.06 + bounce * 0.2, 0, Math.PI); // closed top down onto the opening, clip to the camera
    // the small cap (with hole) lies next to it
    small.position.set(-2.9, 0.62, 1.5);
    small.rotation.set(0, 0.6, Math.PI / 2);
  }
  showNope(pop(t, T.passen - 0.1, T.das3), TUN2[0] + 1.8, TUN2[1] + 2.2, TUN2[2] + 1.6, 0.9);

  // ---------------- norm lands on the desk + stamp
  norm.visible = t >= T.schreibt - 0.1 && t < T.deckel3;
  if (norm.visible) {
    const k = ramp(t, T.schreibt - 0.1, T.normLand + 0.35);
    norm.position.set(NORM[0], lerp(3.5, NORM[1], k * k), NORM[2] + (1 - k) * 0.6);
    norm.rotation.set((1 - k) * 0.5, 0.25 + (1 - k) * 0.4, (1 - k) * -0.3);
    if (t >= T.normLand + 0.35) puff("norm", t, T.normLand + 0.35, NORM[0], 0.1, NORM[2], 1.1);
  }
  stampG.visible = t >= T.norm && t < T.deckel3;
  if (stampG.visible) {
    stampG.position.set(NORM[0] + 0.9, NORM[1] + 0.03, NORM[2] + 1.6);
    stampG.rotation.y = 0.35;
    stampG.scale.copy(squash(t, T.norm, 0.45));
  }

  // ---------------- payoff + bonus: upright cap, snorkel, toy head
  const endOn = t >= T.das3;
  capUp.visible = endOn;
  if (endOn) capUp.scale.copy(squash(t, T.das3 + 0.05, 0.6));
  snorkel.visible = t >= T.snorkelPop;
  if (snorkel.visible) snorkel.scale.copy(squash(t, T.snorkelPop, 0.6));
  puff("snork", t, T.snorkelPop + 0.15, SNORKEL[0], 0.05, SNORKEL[2], 0.9);
  head.visible = t >= T.headPop;
  if (head.visible) {
    head.scale.copy(squash(t, T.headPop, 0.7));
    head.rotation.y = -0.35 + Math.sin(t * 1.3) * 0.08;
  }
  puff("head", t, T.headPop + 0.15, HEAD[0], 0.05, HEAD[2], 1.0);
  animateArrows(arrowsOut, t, pop(t, T.schnorchel + 0.2, 45.5));
  animateArrows(arrowsHead, t, pop(t, T.oben, 45.5));

  // ---------------- HUD: the guess, then the number
  const guessK = pop(t, T.rate + 0.15, T.etwa);
  if (guessK > 0) {
    const n =
      t < T.acht
        ? t < T.mindestens
          ? "?"
          : Math.min(8, Math.floor(ramp(t, T.mindestens, T.acht) * 8))
        : 8;
    counter("luft", guessK, { label: "LUFT DURCHS LOCH · L/min", value: n, x: 70, y: 1210 });
  }
  readout("atem", pop(t, T.etwa + 0.1, T.schreibt), {
    label: "DU IM SITZEN",
    value: "6–8",
    unit: "L/min",
    x: 70,
    y: 560,
  });

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
