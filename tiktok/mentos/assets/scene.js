// #45 "Mentos + Cola" (Format B) — a person on a velvet bench in front of a
// city cinema at night, a bistro table with a 2-l Cola light beside them.
// Frame 0: the viewer's hand has just dropped a Mentos in, the jet shoots past
// the person into the night sky. Then: the person drinks, the belly bulges;
// the schoolyard myth; a second, slow-motion fountain; x-ray: cola sloshing in
// the stomach; the ball set (more gas than a football); the swallowed Mentos
// plops into the cola; "Chemie? Falsch." — crash into a giant Mentos full of
// craters, bubbles out of every crater; the duel light vs. normal; payoff in
// x-ray: the stomach stretches, the burp goes up, it stays whole; Übrigens: a
// forecourt full of fountains under the drone.
import {
  THREE,
  ramp,
  smooth,
  easeInOut,
  pop,
  lerp,
  V,
  rng,
  scene,
  flat,
  jitter,
  facet,
  facetMat,
  xrayMaterial,
  xrayEdges,
  setXray,
  showNope,
  showPanel,
  LED,
  labels,
  squash,
  puff,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import "./set.js";
import { createHand } from "./hand.js";
import { T, shots, LABELS, HIGHLIGHTS, TABLE, BALL, MAC } from "./beats.js";

highlights(HIGHLIGHTS);

const mesh = (geo, mat, x, y, z, parent = scene, shadow = true) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};
const canvasTex = (w, h, draw) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};
const glow = (c, e = 0.35, extra = {}) =>
  flat(c, { emissive: c, emissiveIntensity: e, roughness: 0.45, ...extra });
const tmp = V(0, 0, 0);

// ---------------------------------------------------------------- velvet bench
const SEAT = 0.96;
{
  const velvet = flat(0xb0182b, { roughness: 0.85 });
  const gold = flat(0xd9a93a, { metalness: 0.7, roughness: 0.3 });
  const seat = mesh(
    facet(new THREE.BoxGeometry(3.4, 0.34, 1.3, 6, 1, 3), 0.05, 2),
    facetMat(velvet),
    0,
    SEAT - 0.17,
    -0.05,
  );
  void seat;
  const back = mesh(
    facet(new THREE.BoxGeometry(3.4, 1.5, 0.3, 6, 3, 1), 0.05, 3),
    facetMat(velvet),
    0,
    SEAT + 0.75,
    -0.62,
  );
  back.rotation.x = -0.08;
  // buttons on the backrest
  for (let i = 0; i < 6; i++)
    for (let j = 0; j < 2; j++)
      mesh(
        new THREE.SphereGeometry(0.05, 6, 4),
        flat(0x7a0f1d),
        -1.3 + i * 0.52,
        SEAT + 0.45 + j * 0.6,
        -0.45,
        scene,
        false,
      );
  mesh(new THREE.BoxGeometry(3.5, 0.08, 1.36), gold, 0, SEAT - 0.36, -0.05);
  for (const sx of [-1.55, 1.55])
    for (const sz of [-0.55, 0.45])
      mesh(new THREE.CylinderGeometry(0.06, 0.05, SEAT - 0.36, 8), gold, sx, (SEAT - 0.36) / 2, sz);
}

// ---------------------------------------------------------------- the person (from #37, adapted)
const SKIN = 0xf1c09a;
const HOODIE = 0x2f9e8f; // teal hoodie: stands off the red bench and the warm marquee
const person = new THREE.Group();
scene.add(person);
const hoodMat = xrayMaterial(HOODIE, { flatShading: true, roughness: 0.7 });
const neckMat = xrayMaterial(SKIN, { flatShading: true, roughness: 0.75 });
const skinMat = flat(SKIN, { roughness: 0.7 });
const pantsMat = xrayMaterial(0x2f3440, { flatShading: true, roughness: 0.7 });
const hairMat = flat(0x3a2418);
const TORSO = { y0: SEAT, y1: SEAT + 2.05 };
const torsoGeo = jitter(
  new THREE.CylinderGeometry(0.72, 0.82, TORSO.y1 - TORSO.y0, 14, 3),
  0.015,
  3,
);
const torso = mesh(torsoGeo, hoodMat, 0, (TORSO.y0 + TORSO.y1) / 2, 0, person);
torso.scale.z = 0.62;
const torsoEdges = xrayEdges(torsoGeo);
torsoEdges.position.copy(torso.position);
torsoEdges.scale.copy(torso.scale);
person.add(torsoEdges);
// belly: a front bulge that can swell (hook "Magen?")
const belly = mesh(
  jitter(new THREE.SphereGeometry(0.6, 14, 10), 0.012, 31),
  hoodMat,
  0,
  TORSO.y0 + 0.75,
  0.12,
  person,
);
belly.scale.set(1.0, 0.85, 0.5);
const shoulders = mesh(
  jitter(new THREE.SphereGeometry(0.75, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0.015, 4),
  hoodMat,
  0,
  TORSO.y1 - 0.05,
  0,
  person,
);
shoulders.scale.set(1.05, 0.42, 0.62);
mesh(
  new THREE.TorusGeometry(0.3, 0.09, 6, 14),
  hoodMat,
  0,
  TORSO.y1 + 0.24,
  -0.06,
  person,
).rotation.x = Math.PI / 2;
mesh(new THREE.CylinderGeometry(0.2, 0.23, 0.5, 10), neckMat, 0, TORSO.y1 + 0.3, 0, person);
const gulpBulge = mesh(
  new THREE.SphereGeometry(0.11, 10, 8),
  neckMat,
  0,
  TORSO.y1 + 0.4,
  0.12,
  person,
);
for (const sx of [-1, 1]) {
  const thigh = mesh(
    new THREE.CylinderGeometry(0.27, 0.3, 1.1, 10),
    pantsMat,
    sx * 0.36,
    SEAT + 0.22,
    0.5,
    person,
  );
  thigh.rotation.x = Math.PI / 2;
  mesh(
    new THREE.CylinderGeometry(0.22, 0.24, SEAT + 0.1, 10),
    pantsMat,
    sx * 0.36,
    (SEAT + 0.15) / 2,
    1.0,
    person,
  );
  mesh(new THREE.BoxGeometry(0.34, 0.2, 0.55), flat(0xf4f1ea), sx * 0.36, 0.1, 1.12, person);
}
// arms with an elbow: shoulder group → upper arm, elbow group → forearm + hand
const arms = [];
for (const sx of [-1, 1]) {
  const arm = new THREE.Group();
  arm.rotation.order = "ZYX"; // x first (forward), then z (inward)
  arm.position.set(sx * 0.88, TORSO.y1 - 0.15, 0);
  person.add(arm);
  mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.95, 8), hoodMat, 0, -0.45, 0, arm);
  const elbow = new THREE.Group();
  elbow.position.set(0, -0.9, 0);
  arm.add(elbow);
  mesh(new THREE.SphereGeometry(0.15, 8, 6), hoodMat, 0, 0, 0, elbow);
  mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.8, 8), hoodMat, 0, -0.42, 0, elbow);
  mesh(new THREE.SphereGeometry(0.14, 8, 6), skinMat, 0, -0.88, 0.02, elbow);
  arms.push({ arm, elbow });
}
// head
const HEAD_Y = TORSO.y1 + 0.85;
const head = new THREE.Group();
head.position.set(0, HEAD_Y, 0.02);
person.add(head);
const eyes = [];
{
  const skull = mesh(
    jitter(new THREE.SphereGeometry(0.46, 14, 11), 0.012, 5),
    skinMat,
    0,
    0,
    0,
    head,
  );
  skull.scale.set(0.9, 1.06, 0.95);
  const jaw = mesh(
    jitter(new THREE.SphereGeometry(0.33, 10, 8), 0.01, 6),
    skinMat,
    0,
    -0.22,
    0.06,
    head,
  );
  jaw.scale.set(0.95, 0.75, 0.95);
  const nose = mesh(new THREE.ConeGeometry(0.075, 0.2, 5), skinMat, 0, -0.01, 0.46, head);
  nose.rotation.x = Math.PI / 2;
  for (const sx of [-1, 1]) {
    const ear = mesh(new THREE.SphereGeometry(0.1, 7, 6), skinMat, sx * 0.41, 0, -0.02, head);
    ear.scale.set(0.5, 1, 0.8);
    const eye = new THREE.Group();
    eye.position.set(sx * 0.16, 0.08, 0.39);
    head.add(eye);
    const white = mesh(
      new THREE.SphereGeometry(0.075, 10, 8),
      flat(0xffffff, { roughness: 0.3 }),
      0,
      0,
      0,
      eye,
      false,
    );
    white.scale.z = 0.5;
    mesh(
      new THREE.SphereGeometry(0.042, 8, 6),
      flat(0x1c120e, { roughness: 0.2 }),
      0,
      0,
      0.03,
      eye,
      false,
    );
    eyes.push(eye);
    const brow = mesh(new THREE.BoxGeometry(0.15, 0.03, 0.03), hairMat, sx * 0.16, 0.22, 0.4, head);
    brow.rotation.z = sx * -0.15;
    const cheek = mesh(
      new THREE.SphereGeometry(0.07, 8, 6),
      flat(0xff9a8a),
      sx * 0.24,
      -0.1,
      0.36,
      head,
      false,
    );
    cheek.scale.z = 0.4;
  }
  const cap = mesh(
    jitter(new THREE.SphereGeometry(0.49, 14, 9, 0, Math.PI * 2, 0, Math.PI * 0.46), 0.012, 7),
    hairMat,
    0,
    0.05,
    -0.03,
    head,
  );
  cap.scale.set(0.93, 1.1, 1.0);
  cap.rotation.x = -0.25;
  const back = mesh(
    jitter(new THREE.SphereGeometry(0.43, 10, 8), 0.015, 8),
    hairMat,
    0,
    -0.06,
    -0.13,
    head,
  );
  back.scale.set(0.95, 1.05, 0.8);
  // curly top
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    mesh(
      new THREE.IcosahedronGeometry(0.13, 0),
      hairMat,
      Math.cos(a) * 0.22,
      0.42,
      Math.sin(a) * 0.18 - 0.05,
      head,
    );
  }
}
const mouth = new THREE.Group();
mouth.position.set(0, -0.2, 0.39);
head.add(mouth);
const mouthHole = mesh(
  new THREE.SphereGeometry(0.12, 12, 8),
  flat(0x5a1420),
  0,
  0,
  0,
  mouth,
  false,
);
mouthHole.scale.set(1.1, 0.7, 0.35);
mesh(new THREE.BoxGeometry(0.2, 0.04, 0.05), flat(0xffffff), 0, 0.055, 0.03, mouth, false);
const MOUTH_W = V(0, HEAD_Y - 0.2, 0.47);

// small 0.5-l bottle in the right hand (elbow group of arms[1])
const PET = new THREE.MeshStandardMaterial({
  color: 0xdff4ff,
  roughness: 0.08,
  metalness: 0.1,
  transparent: true,
  opacity: 0.28,
  depthWrite: false,
});
const COLA = flat(0x3a1408, { roughness: 0.18, emissive: 0x2a0c04, emissiveIntensity: 0.25 });
function labelTex(light) {
  return canvasTex(512, 128, (g, w, h) => {
    g.fillStyle = light ? "#d9dde3" : "#d4182b";
    g.fillRect(0, 0, w, h);
    g.fillStyle = light ? "#1a1a22" : "#ffffff";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = "900 64px Montserrat, Arial, sans-serif";
    g.fillText(light ? "COLA light" : "COLA", w / 2, h / 2 + 4);
    g.fillStyle = light ? "#d4182b" : "#ffffff";
    g.fillRect(0, h - 14, w, 6);
  });
}
const LABEL_LIGHT = new THREE.MeshStandardMaterial({
  map: labelTex(true),
  roughness: 0.35,
  metalness: 0.3,
});
const LABEL_CLASSIC = new THREE.MeshStandardMaterial({ map: labelTex(false), roughness: 0.4 });
// PET bottle: clear shell + dark liquid that can drain + label band + cap
function makeBottle(h, rad, labelMat, capColor) {
  const g = new THREE.Group();
  const prof = [
    [0.0, 0],
    [0.82, 0],
    [1.0, 0.04],
    [1.0, 0.6],
    [0.93, 0.66],
    [1.0, 0.72],
    [0.98, 0.76],
    [0.62, 0.88],
    [0.33, 0.96],
    [0.32, 1.0],
  ].map(([x, y]) => new THREE.Vector2(x * rad, y * h));
  const shell = new THREE.Mesh(new THREE.LatheGeometry(prof, 18), PET);
  shell.userData.noAO = true;
  g.add(shell);
  const liqProf = prof.slice(0, 8).map((p) => new THREE.Vector2(p.x * 0.94, p.y));
  liqProf.push(new THREE.Vector2(0, liqProf[liqProf.length - 1].y));
  const liquid = new THREE.Mesh(new THREE.LatheGeometry(liqProf, 18), COLA);
  liquid.castShadow = true;
  g.add(liquid);
  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(rad * 1.01, rad * 1.01, h * 0.24, 22, 1, true),
    labelMat,
  );
  label.position.y = h * 0.36;
  g.add(label);
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(rad * 0.36, rad * 0.36, h * 0.06, 12),
    flat(capColor, { roughness: 0.4 }),
  );
  cap.position.y = h * 1.02;
  g.add(cap);
  return { g, liquid, cap, h, rad };
}
const small = makeBottle(0.62, 0.11, LABEL_CLASSIC, 0xd4182b);
small.cap.visible = false;
arms[1].elbow.add(small.g);
small.g.position.set(0, -0.92, 0.12);
small.g.rotation.x = 1.2; // upright while the forearm rests forward

// ---------------------------------------------------------------- bistro table + big bottles
const TB = V(...TABLE);
const TOP = 1.6;
{
  const gold = flat(0xd9a93a, { metalness: 0.7, roughness: 0.3 });
  const top = mesh(
    facet(new THREE.CylinderGeometry(0.75, 0.75, 0.08, 24), 0.04, 9),
    facetMat(flat(0x1e1a24, { roughness: 0.25 })),
    TB.x,
    TOP - 0.04,
    TB.z,
  );
  void top;
  mesh(new THREE.TorusGeometry(0.75, 0.03, 6, 28), gold, TB.x, TOP - 0.04, TB.z).rotation.x =
    Math.PI / 2;
  mesh(new THREE.CylinderGeometry(0.05, 0.05, TOP - 0.1, 8), gold, TB.x, (TOP - 0.1) / 2, TB.z);
  mesh(new THREE.CylinderGeometry(0.4, 0.45, 0.06, 16), gold, TB.x, 0.03, TB.z);
  // a roll of Mentos on the table
  const roll = mesh(
    new THREE.CylinderGeometry(0.07, 0.07, 0.42, 12),
    flat(0x2a7fd9, { roughness: 0.4 }),
    TB.x - 0.35,
    TOP + 0.07,
    TB.z + 0.35,
  );
  roll.rotation.z = Math.PI / 2;
  roll.rotation.y = 0.4;
}
const B1 = makeBottle(1.1, 0.19, LABEL_LIGHT, 0xc9ced6);
B1.cap.visible = false;
scene.add(B1.g);
const B2 = makeBottle(1.1, 0.19, LABEL_CLASSIC, 0xd4182b);
B2.cap.visible = false;
scene.add(B2.g);
B2.g.position.set(TB.x + 0.38, TOP, TB.z - 0.08);
B1.g.position.set(TB.x, TOP, TB.z);
const mouthOf = (b, out) => out.set(b.g.position.x, b.g.position.y + b.h + 0.02, b.g.position.z);

// the falling Mentos (white lens)
const MENTOS_GEO = jitter(new THREE.SphereGeometry(0.09, 14, 8), 0.004, 3);
const mentosMat = flat(0xfbfaf4, { roughness: 0.55, emissive: 0xffffff, emissiveIntensity: 0.15 });
const drop = mesh(MENTOS_GEO, mentosMat, 0, 0, 0);
drop.scale.set(1, 0.45, 1);

// ---------------------------------------------------------------- fountains (instanced foam)
const foamMat = flat(0xf0d2a0, { roughness: 0.5, emissive: 0xffc070, emissiveIntensity: 0.28 });
const G = 18;
const coreMat = new THREE.MeshStandardMaterial({
  color: 0xf0d2a0,
  emissive: 0xffc070,
  emissiveIntensity: 0.3,
  roughness: 0.5,
  transparent: true,
  opacity: 0.55,
  depthWrite: false,
  flatShading: true,
});
const dummy = new THREE.Object3D();
function makeFountain(N, seed, mat = foamMat, size = 0.11) {
  const im = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), mat, N);
  im.frustumCulled = false;
  im.userData.noAO = true;
  im.castShadow = false;
  scene.add(im);
  const r = rng(seed);
  const p = Array.from({ length: N }, () => ({
    ax: (r() - 0.5) * 2,
    az: (r() - 0.5) * 2,
    sp: 0.88 + r() * 0.24,
    s: size * (0.55 + r() * 0.9),
    rot: r() * 6,
  }));
  const core = new THREE.Mesh(
    jitter(new THREE.CylinderGeometry(0.05, 0.12, 1, 7, 6, true), 0.02, 5),
    coreMat,
  );
  core.userData.noAO = true;
  scene.add(core);
  return {
    // pos = bottle mouth, H = peak height above it, dur = how long it sprays
    update(t, t0, pos, H, dur, spread = 0.18, solid = true) {
      const a0 = t - t0;
      let any = false;
      for (let i = 0; i < N; i++) {
        const q = p[i];
        const s = (i / N) * dur;
        const a = a0 - s;
        const str = 1 - Math.pow(s / dur, 1.6);
        if (a < 0 || str <= 0 || a > 2.2) {
          dummy.scale.setScalar(0);
        } else {
          const v = Math.sqrt(2 * G * H * str) * q.sp;
          const y = pos.y + v * a - 0.5 * G * a * a;
          if (y < 0.05) dummy.scale.setScalar(0);
          else {
            // the jet fans out near its top: sideways drift grows with height
            const fan = spread * (0.25 + (y - pos.y) / H) * v * a * 0.45;
            dummy.position.set(pos.x + q.ax * fan, y, pos.z + q.az * fan);
            dummy.scale.setScalar(q.s * (1 + Math.min(a, 1) * 0.6));
            dummy.rotation.set(q.rot + a * 4, q.rot * 2, 0);
            any = true;
          }
        }
        dummy.updateMatrix();
        im.setMatrixAt(i, dummy.matrix);
      }
      im.instanceMatrix.needsUpdate = true;
      im.visible = any;
      // solid column while the jet is strong
      const k = a0 < 0 ? 0 : Math.min(1, a0 / 0.12) * Math.max(0, 1 - Math.pow(a0 / dur, 1.6));
      core.visible = k > 0.02 && solid;
      if (core.visible) {
        const hh = H * k * 0.82;
        core.scale.set(1 + k * 0.4, hh, 1 + k * 0.4);
        core.position.set(pos.x, pos.y + hh / 2, pos.z);
      }
    },
    hide() {
      im.visible = false;
      core.visible = false;
    },
  };
}
const F1 = makeFountain(420, 11, foamMat, 0.075);
const F2 = makeFountain(240, 12, foamMat, 0.065);
// when each eruption of B1 happens (refill = the cut before it)
const B1_RUNS = [
  { refill: -99, t0: -0.25, H: 8, dur: 1.7 },
  { refill: T.mentos2, t0: T.schiesst + 0.05, H: 8.5, dur: 2.2 },
  { refill: T.bei, t0: T.light + 0.1, H: 9.5, dur: 1.9 },
  { refill: T.hast, t0: T.hast + 0.45, H: 7, dur: 1.6 },
];

// world fountains for "Weltrekord": bottles all over the forecourt
const WF = [];
{
  const r = rng(77);
  let tries = 0;
  while (WF.length < 46 && tries++ < 2000) {
    const x = (r() - 0.5) * 44;
    const z = -8 + r() * 24;
    const d = Math.hypot(x, z);
    if (d < 4.2 || (Math.abs(x) < 3 && z < 2)) continue;
    if (WF.some((w) => Math.hypot(w.x - x, w.z - z) < 1.8)) continue;
    WF.push({ x, z, d, H: 3.2 + r() * 2.8, ph: r() });
  }
}
const WF_PER = 40;
const wfIM = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(1, 0),
  foamMat,
  WF.length * WF_PER,
);
wfIM.frustumCulled = false;
wfIM.userData.noAO = true;
scene.add(wfIM);
const wfBottles = new THREE.InstancedMesh(
  new THREE.CylinderGeometry(0.19, 0.19, 1.1, 10),
  COLA,
  WF.length,
);
wfBottles.castShadow = true;
scene.add(wfBottles);
const wfSeeds = (() => {
  const r = rng(78);
  return Array.from({ length: WF_PER }, () => ({
    ax: r() - 0.5,
    az: r() - 0.5,
    sp: 0.85 + r() * 0.3,
    s: 0.07 + r() * 0.08,
  }));
})();

// ---------------------------------------------------------------- organs (x-ray)
const organs = new THREE.Group();
person.add(organs);
const gulletPts = [
  V(0, HEAD_Y - 0.22, 0.25),
  V(0, HEAD_Y - 0.42, 0.06),
  V(0, TORSO.y1 + 0.2, 0.04),
  V(0.02, TORSO.y1 - 0.25, 0.05),
  V(0.08, TORSO.y1 - 0.62, 0.08),
  V(0.2, TORSO.y1 - 0.85, 0.1),
];
const gulletCurve = new THREE.CatmullRomCurve3(gulletPts);
mesh(
  new THREE.TubeGeometry(gulletCurve, 60, 0.065, 8),
  glow(0xff8f9a, 0.25),
  0,
  0,
  0,
  organs,
  false,
);
const STOM = V(0.3, TORSO.y1 - 1.07, 0.1);
const stomMat = new THREE.MeshStandardMaterial({
  color: 0xffc08a,
  emissive: 0xff9a50,
  emissiveIntensity: 0.18,
  roughness: 0.4,
  transparent: true,
  opacity: 0.34,
  depthWrite: false,
  side: THREE.DoubleSide,
});
const stomachG = new THREE.Group();
stomachG.position.copy(STOM);
stomachG.rotation.z = 0.32;
organs.add(stomachG);
const stomach = mesh(
  jitter(new THREE.SphereGeometry(0.5, 18, 12), 0.01, 9),
  stomMat,
  0,
  0,
  0,
  stomachG,
  false,
);
stomach.scale.set(1.0, 0.68, 0.62);
// cola pool in the stomach: dark amber, glowing a little
const colaMat = new THREE.MeshStandardMaterial({
  color: 0x7a3010,
  emissive: 0x9a3a0a,
  emissiveIntensity: 0.55,
  transparent: true,
  opacity: 0.85,
  roughness: 0.2,
  depthWrite: false,
});
const pool = mesh(
  new THREE.SphereGeometry(0.42, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
  colaMat,
  0,
  0.04,
  0,
  stomachG,
  false,
);
pool.scale.set(1.0, 0.6, 0.56);
const foamCap = mesh(
  new THREE.CircleGeometry(0.41, 18),
  flat(0xf0d2a0, { emissive: 0xffc070, emissiveIntensity: 0.4 }),
  0,
  0.045,
  0,
  stomachG,
  false,
);
foamCap.rotation.x = -Math.PI / 2;
foamCap.scale.set(1, 0.56, 1);
// bubbles in the stomach cola
const sBubbles = [];
{
  const r = rng(41);
  const m = new THREE.MeshBasicMaterial({ color: 0xffe2b0, transparent: true, opacity: 0.9 });
  for (let i = 0; i < 26; i++) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.018 + r() * 0.018, 6, 4), m);
    b.userData.noAO = true;
    stomachG.add(b);
    sBubbles.push({ b, x: (r() - 0.5) * 0.6, z: (r() - 0.5) * 0.3, ph: r(), sp: 0.6 + r() * 0.8 });
  }
}
// the swallowed Mentos
const swallowed = mesh(MENTOS_GEO, mentosMat, 0, 0, 0, scene, false);
swallowed.scale.set(1.2, 0.55, 1.2);
const swPos = V(0, 0, 0);
// the burp: a gas bubble running up the gullet
const gasMat = new THREE.MeshStandardMaterial({
  color: 0xfff1d0,
  emissive: 0xffd890,
  emissiveIntensity: 0.6,
  transparent: true,
  opacity: 0.6,
  roughness: 0.1,
  depthWrite: false,
});
const burpBubble = mesh(new THREE.SphereGeometry(0.13, 12, 8), gasMat, 0, 0, 0, scene, false);
const rings = [];
for (let i = 0; i < 3; i++) {
  const m = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
  });
  const ring = mesh(new THREE.TorusGeometry(0.2, 0.02, 4, 24), m, 0, 0, 0, scene, false);
  ring.userData.noAO = true;
  rings.push({ ring, m, d: i * 0.12 });
}
// fizz escaping from the small bottle while drinking
const fizz = [];
{
  const r = rng(91);
  const m = new THREE.MeshBasicMaterial({ color: 0xfff4dc, transparent: true, opacity: 0.85 });
  for (let i = 0; i < 22; i++) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.02 + r() * 0.02, 6, 4), m);
    b.userData.noAO = true;
    scene.add(b);
    fizz.push({ b, x: (r() - 0.5) * 0.4, z: (r() - 0.5) * 0.3, ph: r(), sp: 0.7 + r() * 0.6 });
  }
}

// ---------------------------------------------------------------- ball set: more gas than a football
const BS = V(...BALL);
const ballSet = new THREE.Group();
ballSet.position.copy(BS);
scene.add(ballSet);
const B3 = makeBottle(1.1, 0.19, LABEL_CLASSIC, 0xd4182b);
B3.g.position.set(-0.75, 0, 0);
ballSet.add(B3.g);
const ball = new THREE.Group();
ball.position.set(0.65, 0.75, 0.2);
ballSet.add(ball);
{
  const BR = 0.75;
  mesh(
    jitter(new THREE.IcosahedronGeometry(BR, 2), 0.004, 4),
    flat(0xf8f8f4, { roughness: 0.5 }),
    0,
    0,
    0,
    ball,
  );
  const ico = new THREE.IcosahedronGeometry(1, 0).attributes.position;
  const seen = [];
  for (let i = 0; i < ico.count; i++) {
    const d = V(ico.getX(i), ico.getY(i), ico.getZ(i)).normalize();
    if (seen.some((s) => s.distanceTo(d) < 0.1)) continue;
    seen.push(d);
    const pent = mesh(
      new THREE.CircleGeometry(0.24, 5),
      flat(0x1a1a22, { roughness: 0.5 }),
      d.x * BR * 1.005,
      d.y * BR * 1.005,
      d.z * BR * 1.005,
      ball,
      false,
    );
    pent.lookAt(d.clone().multiplyScalar(5).add(ball.position).add(BS));
  }
}
const gasCloud = mesh(
  jitter(new THREE.IcosahedronGeometry(1, 2), 0.06, 6),
  gasMat,
  -0.75,
  1.1,
  0,
  ballSet,
  false,
);
const flyCap = mesh(
  new THREE.CylinderGeometry(0.07, 0.07, 0.07, 12),
  flat(0xd4182b),
  0,
  0,
  0,
  ballSet,
);

// ---------------------------------------------------------------- the giant Mentos (macro)
const MP = V(...MAC);
const macro = new THREE.Group();
macro.position.copy(MP);
scene.add(macro);
const CRATERS = [];
{
  const r = rng(101);
  while (CRATERS.length < 70) {
    const d = V(r() - 0.5, r() - 0.5, r() * 0.9 + 0.1).normalize();
    if (CRATERS.some((c) => c.d.angleTo(d) < 0.16)) continue;
    CRATERS.push({ d, rad: 0.06 + r() * 0.1, deep: 0.05 + r() * 0.05 });
  }
}
{
  const geo = new THREE.IcosahedronGeometry(1.5, 5);
  const pos = geo.attributes.position;
  const d = V(0, 0, 0);
  for (let i = 0; i < pos.count; i++) {
    d.set(pos.getX(i), pos.getY(i), pos.getZ(i)).normalize();
    let off = 0;
    for (const c of CRATERS) {
      const a = d.angleTo(c.d);
      const u = a / c.rad;
      if (u < 1) off -= c.deep * (1 - u * u);
      else if (u < 1.35) off += c.deep * 0.35 * Math.sin(((u - 1) / 0.35) * Math.PI); // rim
    }
    const rr = 1.5 * (1 + off);
    pos.setXYZ(i, d.x * rr, d.y * rr, d.z * rr * 0.45);
  }
  geo.computeVertexNormals();
  const surf = new THREE.Mesh(facet(geo, 0.06, 17), facetMat(flat(0xf6f3ea, { roughness: 0.75 })));
  surf.castShadow = true;
  macro.add(surf);
}
// inside the cola: a dark amber world around the macro
const colaWorld = new THREE.Mesh(
  new THREE.SphereGeometry(9, 24, 16),
  new THREE.MeshBasicMaterial({ color: 0x2a0d05, side: THREE.BackSide, fog: false }),
);
colaWorld.userData.noAO = true;
macro.add(colaWorld);
const macroLight = new THREE.PointLight(0xffd8a0, 30, 12, 1.4);
macroLight.position.set(2.5, 3, 4);
macro.add(macroLight);
const macroRim = new THREE.PointLight(0xff7a2a, 20, 10, 1.4);
macroRim.position.set(-3, -1, 2);
macro.add(macroRim);
const craterPt = V(0, 0, 0);
{
  const c = CRATERS.reduce(
    (a, b) => (b.d.z > 0.8 && b.rad > a.rad && b.d.x > 0 ? b : a),
    CRATERS[0],
  );
  craterPt.set(c.d.x * 1.45, c.d.y * 1.45, c.d.z * 1.45 * 0.45).add(MP);
}
// bubbles out of every crater
const BPC = 3;
const cbIM = new THREE.InstancedMesh(
  new THREE.SphereGeometry(1, 10, 8),
  gasMat,
  CRATERS.length * BPC,
);
cbIM.frustumCulled = false;
cbIM.userData.noAO = true;
macro.add(cbIM);
// drifting background bubbles in the cola world
const bgIM = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), gasMat, 60);
bgIM.frustumCulled = false;
bgIM.userData.noAO = true;
macro.add(bgIM);
const bgSeeds = (() => {
  const r = rng(111);
  return Array.from({ length: 60 }, () => ({
    x: (r() - 0.5) * 12,
    z: -2 - r() * 5,
    ph: r(),
    s: 0.03 + r() * 0.08,
    sp: 0.15 + r() * 0.2,
  }));
})();

// ---------------------------------------------------------------- the viewer's hand
const hand = createHand({ skin: SKIN, sleeve: 0x4a4fd6, scale: 0.55 });

// ---------------------------------------------------------------- arm poses
// rest: forearm forward on the thigh; drink: bottle to the mouth
function armPose(k) {
  const a = arms[1];
  a.arm.rotation.set(lerp(0.05, -1.9, k), 0, lerp(0.08, 0.72, k));
  a.elbow.rotation.x = lerp(-1.25, -1.4, k);
  // the other arm rests
  arms[0].arm.rotation.set(0.05, 0, -0.08);
  arms[0].elbow.rotation.x = -1.25;
}

// ---------------------------------------------------------------- render
const applyCamera = shotCamera(shots);
const liveLabels = LABELS.map((l) => (l.pos === "crater" ? { ...l, pos: craterPt } : l));
const xrayMats = [hoodMat, neckMat, pantsMat];
const m4 = new THREE.Matrix4();
const q0 = new THREE.Quaternion();
const vOne = V(1, 1, 1);

function renderAt(t) {
  // ---- the viewer's hand: has just dropped the Mentos, jerks away from the jet
  hand.track(t, [
    { t: -0.8, pos: [TB.x, 3.15, TB.z + 0.1], rot: [0.9, Math.PI, 0], pose: "grab" },
    { t: -0.3, pos: [TB.x + 0.05, 3.05, TB.z + 0.15], rot: [0.9, Math.PI, 0], pose: "open" },
    { t: 0.25, pos: [TB.x + 0.9, 3.3, TB.z + 1.1], rot: [0.6, Math.PI, 0.5], pose: "open" },
    {
      t: 0.9,
      pos: [TB.x + 1.8, 3.0, TB.z + 2.4],
      rot: [0.5, Math.PI, 0.6],
      pose: "open",
      out: true,
    },
  ]);

  // ---- person: reactions + drinking
  const drink = Math.max(
    smooth(ramp(t, T.hinterher - 0.35, T.hinterher + 0.15)) *
      (1 - smooth(ramp(t, T.magen1 - 0.15, T.magen1 + 0.2))),
    smooth(ramp(t, T.trinken - 0.4, T.trinken + 0.05)) *
      (1 - smooth(ramp(t, T.dehnt - 0.2, T.dehnt + 0.15))),
  );
  armPose(drink);
  // head turns to the fountains, eyes wide; tips back while drinking
  const look = Math.max(
    1 - smooth(ramp(t, 0.8, 1.2)),
    pop(t, T.schiesst, T.schwappt),
    pop(t, T.light, T.dir),
  );
  head.rotation.set(-0.3 * drink - 0.12 * look, 0.55 * look, 0);
  const wide = Math.max(look, pop(t, T.magen1, T.schulhof), pop(t, T.geschluckt + 0.8, T.rate));
  for (const e of eyes) e.scale.setScalar(1 + 0.45 * wide);
  const burp = pop(t, T.ruelpst, T.heil - 0.1, 0.2);
  const grin = pop(t, T.heil, T.fakt);
  mouth.scale.set(1 + 0.5 * grin, 0.5 + 1.2 * Math.max(look * 0.8, burp) + 0.2 * grin, 1);
  // belly bulges on "Magen?" (solid)
  const bulge = pop(t, T.magen1 - 0.05, T.schulhof - 0.1, 0.25);
  belly.scale.set(1.0 + bulge * 0.35, 0.85 + bulge * 0.25, 0.5 + bulge * 0.7);
  // gulp: the swallow on "geschluckt"
  const gulpK = ramp(t, T.geschluckt - 0.1, T.geschluckt + 0.4);
  gulpBulge.visible = gulpK > 0 && gulpK < 1;
  gulpBulge.position.y = TORSO.y1 + 0.5 - gulpK * 0.45;
  gulpBulge.scale.setScalar(Math.sin(gulpK * Math.PI) * 1.1 + 0.01);
  small.liquid.scale.y = 1 - 0.5 * smooth(ramp(t, T.trinken, T.dehnt));

  // ---- x-ray windows
  const win = (a, b) => smooth(ramp(t, a - 0.25, a + 0.3)) * (1 - smooth(ramp(t, b - 0.3, b)));
  const xr = Math.max(
    win(T.schwappt, T.denn),
    win(T.geschluckt - 0.15, T.millionen),
    win(T.dir, T.trinken),
    win(T.dehnt - 0.1, T.heil),
  );
  setXray(xrayMats, xr);
  belly.visible = xr < 0.5;
  organs.visible = xr > 0.02;
  // slosh + stretch
  const slosh = Math.sin(t * 5.2) * 0.12 * (0.4 + pop(t, T.schwappt, T.denn));
  pool.rotation.z = slosh;
  foamCap.rotation.set(-Math.PI / 2, slosh, 0);
  const stretch =
    smooth(ramp(t, T.dehnt, T.ruelpst)) *
    (1 - 0.6 * smooth(ramp(t, T.ruelpst + 0.15, T.ruelpst + 0.6)));
  stomachG.scale.setScalar(1 + 0.38 * stretch);
  stomMat.emissiveIntensity = 0.18 + 0.4 * stretch;
  const fizzK = Math.max(
    pop(t, T.schwappt, T.denn) * 0.5,
    pop(t, T.geschluckt + 0.9, T.millionen),
    pop(t, T.dehnt, T.ruelpst + 0.3),
  );
  for (const { b, x, z, ph, sp } of sBubbles) {
    const k = (t * sp + ph) % 1;
    b.visible = fizzK > 0.05;
    b.position.set(x * (1 - k * 0.3), -0.2 + k * 0.24, z);
    b.scale.setScalar(fizzK * (1 - k * 0.4));
  }
  // the swallowed Mentos: down the gullet, plop, then sits fizzing
  const swK = easeInOut(ramp(t, T.geschluckt, T.geschluckt + 0.9));
  if (t < T.geschluckt + 0.9) gulletCurve.getPointAt(Math.min(1, 0.1 + 0.9 * swK), swPos);
  else swPos.set(STOM.x + 0.05, STOM.y - 0.06 + Math.sin(t * 3) * 0.015, STOM.z + 0.1);
  swallowed.position.copy(swPos);
  swallowed.visible = t > T.geschluckt && t < T.millionen && xr > 0.3;
  swallowed.rotation.set(t * 1.2, 0, 0.3);
  puff("plop", t, T.geschluckt + 0.92, swPos.x, swPos.y + 0.05, swPos.z + 0.1, 0.3, 0xf0d2a0);
  // the burp bubble: stomach → gullet → mouth, then rings
  const bk = ramp(t, T.ruelpst - 0.35, T.ruelpst + 0.12);
  burpBubble.visible = bk > 0 && bk < 1 && xr > 0.3;
  if (burpBubble.visible) {
    gulletCurve.getPointAt(1 - bk, tmp);
    burpBubble.position.copy(tmp);
    burpBubble.scale.setScalar(1.2 - bk * 0.4);
  }
  for (const { ring, m, d } of rings) {
    const k = ramp(t, T.ruelpst + 0.12 + d, T.ruelpst + 0.9 + d);
    ring.visible = k > 0 && k < 1;
    ring.position.set(MOUTH_W.x, MOUTH_W.y, MOUTH_W.z + 0.1 + k * 0.9);
    ring.scale.setScalar(0.6 + k * 2.2);
    m.opacity = 0.8 * (1 - k);
  }
  puff("burp", t, T.ruelpst + 0.12, MOUTH_W.x, MOUTH_W.y, MOUTH_W.z + 0.2, 0.45);
  // drinking fizz: gas escaping at the bottle neck / mouth
  const fz = Math.max(pop(t, T.hinterher, T.magen1, 0.2) * 0.6, pop(t, T.trinken, T.dehnt, 0.2));
  small.g.getWorldPosition(tmp);
  for (const { b, x, z, ph, sp } of fizz) {
    const k = (t * sp * 1.4 + ph) % 1;
    b.visible = fz > 0.05;
    b.position.set(
      lerp(tmp.x, MOUTH_W.x, 0.6) + x * (0.3 + k),
      MOUTH_W.y + 0.05 + k * 0.9,
      MOUTH_W.z + 0.15 + z,
    );
    b.scale.setScalar(fz * (1 - k * 0.6));
  }

  // ---- big bottles + fountains
  let run = B1_RUNS[0];
  for (const r of B1_RUNS) if (t >= r.refill) run = r;
  const duel = t >= T.bei && t < T.dir;
  B1.g.position.set(TB.x + (duel ? -0.3 : 0), TOP, TB.z + (duel ? 0.05 : 0));
  B1.liquid.scale.y = 1 - 0.78 * smooth(ramp(t, run.t0, run.t0 + run.dur));
  mouthOf(B1, tmp);
  F1.update(t, run.t0, tmp, run.H, run.dur);
  B2.g.visible = duel;
  if (duel) {
    B2.g.scale.copy(squash(t, T.bei + 0.05));
    B2.liquid.scale.y = 1 - 0.5 * smooth(ramp(t, run.t0, run.t0 + run.dur));
    F2.update(t, run.t0 + 0.05, mouthOf(B2, V(0, 0, 0)), 4.2, run.dur * 0.8, 0.22);
  } else F2.hide();
  // the Mentos falling into the bottle (Folge 1)
  const dk = ramp(t, T.mentos2 + 0.15, T.mentos2 + 0.6);
  drop.visible = dk > 0 && dk < 1;
  mouthOf(B1, tmp);
  drop.position.set(tmp.x, tmp.y + 0.9 * (1 - dk * dk), tmp.z);
  drop.rotation.set(t * 4, 0, t * 2);

  // world fountains (Übrigens)
  const wfOn = t >= T.fakt - 0.1 && t < T.hast;
  wfIM.visible = wfBottles.visible = wfOn;
  if (wfOn) {
    let n = 0;
    WF.forEach((w, i) => {
      const sc = squash(t, T.fakt + w.d * 0.012).x;
      m4.compose(V(w.x, 0.55 * sc, w.z), q0, V(sc, sc, sc));
      wfBottles.setMatrixAt(i, m4);
      const t0 = T.fakt + 0.35 + w.d * 0.035;
      const dur = 2.6;
      for (let j = 0; j < WF_PER; j++) {
        const q = wfSeeds[j];
        const s = (j / WF_PER) * dur;
        const a = (((t - t0 - s) % 2.4) + 2.4) % 2.4; // keeps spraying in waves
        const live = t - t0 - s > 0;
        const v = Math.sqrt(2 * G * w.H) * q.sp;
        const y = 1.1 + v * a - 0.5 * G * a * a;
        if (!live || y < 0.05) m4.makeScale(0, 0, 0);
        else {
          const sz = q.s * (1 + a);
          m4.compose(V(w.x + q.ax * a * 1.4, y, w.z + q.az * a * 1.4), q0, V(sz, sz, sz));
        }
        wfIM.setMatrixAt(n++, m4);
      }
    });
    wfIM.instanceMatrix.needsUpdate = true;
    wfBottles.instanceMatrix.needsUpdate = true;
  }

  // ---- ball set
  const ballOn = t >= T.denn - 0.05 && t < T.startschuss;
  ballSet.visible = ballOn;
  if (ballOn) {
    B3.g.scale.copy(squash(t, T.denn));
    ball.scale.copy(squash(t, T.fussball - 0.05));
    ball.rotation.set(0, t * 0.4, 0);
    const gk = smooth(ramp(t, T.passt - 0.15, T.passt + 0.7));
    gasCloud.visible = gk > 0.01;
    const R = 0.84 * gk + 0.02 * Math.sin(t * 7) * gk;
    gasCloud.scale.setScalar(Math.max(0.001, R));
    gasCloud.position.set(-0.75, 1.12 + R, 0);
    gasCloud.rotation.y = t * 0.5;
    B3.cap.visible = gk <= 0;
    const ck = ramp(t, T.passt - 0.15, T.passt + 0.6);
    flyCap.visible = ck > 0 && ck < 1;
    flyCap.position.set(-0.75 + ck * 0.9, 1.15 + ck * 2.2 - ck * ck * 1.8, ck * 0.4);
    flyCap.rotation.set(t * 12, 0, t * 9);
  }

  // ---- giant Mentos (macro)
  const macOn = t >= T.millionen - 0.05 && t < T.bei;
  macro.visible = macOn;
  if (macOn) {
    macro.rotation.set(0, Math.sin(t * 0.3) * 0.15, 0);
    const all = smooth(ramp(t, T.blaeschen - 0.05, T.blaeschen + 0.4));
    const few = smooth(ramp(t, T.krater, T.krater + 0.6)) * 0.25;
    let n = 0;
    CRATERS.forEach((c, i) => {
      const base = V(c.d.x * 1.42, c.d.y * 1.42, c.d.z * 1.42 * 0.45);
      const on = Math.max(all, i % 6 === 0 ? few * 4 : 0);
      for (let j = 0; j < BPC; j++) {
        const k = (t * (0.7 + (i % 5) * 0.08) + j / BPC + i * 0.137) % 1;
        const s = on * (0.03 + c.rad * 0.6) * (0.4 + k);
        m4.compose(
          V(base.x + Math.sin(k * 9 + i) * 0.04, base.y + k * 0.9, base.z + 0.04 + k * 0.35),
          q0,
          V(s, s, s),
        );
        cbIM.setMatrixAt(n++, m4);
      }
    });
    cbIM.instanceMatrix.needsUpdate = true;
    bgSeeds.forEach((b, i) => {
      const k = (t * b.sp + b.ph) % 1;
      m4.compose(V(b.x, -4 + k * 9, b.z), q0, vOne.clone().multiplyScalar(b.s));
      bgIM.setMatrixAt(i, m4);
    });
    bgIM.instanceMatrix.needsUpdate = true;
  }

  // ---- LED panel: one fact at a time
  if (t >= T.schulhof + 0.2 && t < T.mentos2)
    showPanel(pop(t, T.schulhof + 0.2, T.mentos2), "SCHULHOF-GERÜCHT", "TÖDLICH?", LED.red);
  else if (t >= T.fussball && t < T.startschuss)
    showPanel(pop(t, T.fussball, T.startschuss), "MEHR GAS ALS", "1 FUSSBALL", LED.yellow);
  else if (t >= T.chemie && t < T.millionen)
    showPanel(pop(t, T.chemie, T.millionen), "REAKTION?", "CHEMIE", LED.red);
  else if (t >= T.krater && t < T.rau)
    showPanel(pop(t, T.krater, T.rau), "AUF JEDEM MENTOS", "MILLIONEN", LED.yellow);
  else if (t >= T.light + 0.3 && t < T.dir)
    showPanel(pop(t, T.light + 0.3, T.dir), "HÖCHSTE FONTÄNE", "LIGHT", LED.green);
  else if (t >= T.maerchen && t < T.trinken)
    showPanel(pop(t, T.maerchen, T.trinken), "NUR EIN", "MÄRCHEN", LED.green);
  else if (t >= T.heil && t < T.fakt)
    showPanel(pop(t, T.heil, T.fakt), "DEIN MAGEN", "HEIL", LED.green);
  else if (t >= T.weltrekord && t < T.hast)
    showPanel(pop(t, T.weltrekord, T.hast), "WELTREKORD", "4.334", LED.yellow);
  else showPanel(0);
  // "Falsch." — the ✕ over the stomach
  showNope(pop(t, T.falsch, T.millionen - 0.05), STOM.x + 0.2, STOM.y + 0.5, STOM.z + 0.7, 0.45);

  labels(t, liveLabels);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
