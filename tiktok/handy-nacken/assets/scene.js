// #97 Handy-Nacken — you, in bed at night, scrolling. Side view of head,
// neck and spine; the head tips forward and gets heavier for the neck.
// Story: hook (head snaps down, neck glows red) → the head is a bowling
// ball balanced on the spine → it tips: a ball on a lever → fingers on the
// neck, the neck muscles pull → "Rate mal": the scale runs to 27 kg → a
// child on the shoulders → time-lapse: chest muscles short, neck muscles
// long → Übrigens: a small nod doubles it → payoff: the phone drops, the
// head stays forward (ghost = where it belongs).
import {
  THREE,
  ramp,
  smooth,
  lerp,
  pop,
  V,
  scene,
  flat,
  real,
  roundedBox,
  xrayMaterial,
  setXray,
  labels,
  squash,
  highlights,
  shotCamera,
  renderFrame,
  start,
  showPanel,
} from "./world.js";
import { clock, lampLight, outside } from "./set.js";
import { gauge } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);

// ---------------------------------------------------------------- helpers
const add = (parent, geo, mat, x = 0, y = 0, z = 0, shadow = true) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};
// a capsule limb from a to b (local points), radius r
const UP = V(0, 1, 0);
function limb(parent, a, b, r, mat) {
  const A = V(...a);
  const B = V(...b);
  const len = A.distanceTo(B);
  const m = add(parent, new THREE.CapsuleGeometry(r, len, 8, 16), mat);
  m.position.copy(A).add(B).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(UP, B.clone().sub(A).normalize());
  return m;
}

// ---------------------------------------------------------------- materials
const skinM = xrayMaterial(0xe2a684, { roughness: 0.55 });
const hoodM = xrayMaterial(0x2f3f6e, { roughness: 0.95 });
const hairM = xrayMaterial(0x3a2618, { roughness: 0.7 });
const pantsM = xrayMaterial(0x5a5f6a, { roughness: 0.95 });
const SHELL = [skinM, hoodM, hairM, pantsM];
const boneM = real.ceramic(0xf2e6cc, { roughness: 0.45, clearcoat: 0.2 });
const muscleM = new THREE.MeshStandardMaterial({
  color: 0xc9283e,
  roughness: 0.45,
  emissive: 0xff2040,
  emissiveIntensity: 0,
});
const chestM = muscleM.clone();
const darkM = flat(0x1a1216, { roughness: 0.4 });
const whiteM = real.ceramic(0xfbf8f2);
const insides = [];

// ---------------------------------------------------------------- the person
// hip pivot on the mattress, facing +z, leaning back into the pillows
const HIP = V(0, 1.25, -1.55);
const LEAN = -0.22;
const person = new THREE.Group();
person.position.copy(HIP);
person.rotation.x = LEAN;
scene.add(person);

// pelvis + thighs (pants; the duvet hides the rest)
add(person, new THREE.SphereGeometry(0.36, 24, 16), pantsM, 0, 0.05, -0.02).scale.set(
  1.15,
  0.7,
  0.9,
);
for (const s of [-1, 1]) {
  const th = limb(person, [s * 0.2, 0.0, 0.0], [s * 0.22, -0.1, 0.9], 0.17, pantsM);
  th.rotation.x += 0; // under the duvet
}
// abdomen (lower torso)
add(person, new THREE.CapsuleGeometry(0.33, 0.35, 8, 20), hoodM, 0, 0.42, 0).scale.set(
  1.15,
  1,
  0.72,
);

// upper torso: pivots at the waist, rounds forward (slouch)
const upper = new THREE.Group();
upper.position.set(0, 0.55, 0);
person.add(upper);
add(upper, new THREE.CapsuleGeometry(0.36, 0.3, 8, 24), hoodM, 0, 0.32, 0).scale.set(1.2, 1, 0.74);
// hood bunched behind the neck
add(upper, new THREE.TorusGeometry(0.2, 0.08, 10, 24), hoodM, 0, 0.66, -0.12).rotation.x =
  Math.PI / 2 - 0.5;
// hoodie strings
for (const s of [-1, 1]) limb(upper, [s * 0.07, 0.6, 0.24], [s * 0.08, 0.32, 0.27], 0.012, whiteM);

// shoulders + arms (hoodie sleeves) holding the phone in front of the chest
const SH = [
  [-0.4, 0.55, 0.0],
  [0.4, 0.55, 0.0],
];
const EL = [
  [-0.42, 0.05, 0.22],
  [0.42, 0.05, 0.22],
];
const HA = [
  [-0.1, 0.22, 0.56],
  [0.1, 0.22, 0.56],
];
const shoulderGrp = [];
for (let i = 0; i < 2; i++) {
  const g = new THREE.Group();
  upper.add(g);
  shoulderGrp.push(g);
  add(g, new THREE.SphereGeometry(0.15, 16, 12), hoodM, ...SH[i]);
  limb(g, SH[i], EL[i], 0.115, hoodM);
  limb(g, EL[i], HA[i], 0.095, hoodM);
  // hand
  const h = add(
    g,
    roundedBox(0.09, 0.2, 0.1, 0.04),
    skinM,
    HA[i][0],
    HA[i][1] + 0.05,
    HA[i][2] + 0.03,
  );
  h.rotation.set(-0.6, 0, i ? -0.3 : 0.3);
  // thumb on the screen edge
  limb(
    g,
    [HA[i][0], HA[i][1] + 0.1, HA[i][2] + 0.05],
    [HA[i][0] * 0.4, HA[i][1] + 0.18, HA[i][2] + 0.05],
    0.025,
    skinM,
  );
}

// the phone, in the hands
const phone = new THREE.Group();
upper.add(phone);
const PHONE_REST = { p: V(0, 0.36, 0.6), r: -0.85 };
phone.position.copy(PHONE_REST.p);
phone.rotation.x = PHONE_REST.r;
add(phone, roundedBox(0.17, 0.34, 0.022, 0.025), real.gloss(0x1a1c22));
const feedTex = (() => {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 1024;
  const g = c.getContext("2d");
  g.fillStyle = "#0e0f14";
  g.fillRect(0, 0, 256, 1024);
  const cols = ["#ff5f7e", "#ffd23f", "#4fc3ff", "#7cff9a", "#c58cff", "#ff9b4f"];
  for (let i = 0; i < 8; i++) {
    g.fillStyle = cols[i % cols.length];
    g.fillRect(10, 10 + i * 128, 236, 92);
    g.fillStyle = "#ffffff";
    g.globalAlpha = 0.7;
    g.fillRect(10, 106 + i * 128, 160, 8);
    g.globalAlpha = 1;
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1, 0.35);
  return t;
})();
const screen = add(
  phone,
  new THREE.PlaneGeometry(0.155, 0.32),
  new THREE.MeshBasicMaterial({ map: feedTex, toneMapped: false }),
  0,
  0,
  0.0115,
  false,
);
screen.userData.noAO = true;
const phoneLight = new THREE.PointLight(0xbfd8ff, 3.2, 2.2, 1.4);
phoneLight.position.set(0, 0.05, 0.25);
phone.add(phoneLight);

// thoracic spine + ribs + collarbones (x-ray only)
const bones = new THREE.Group();
person.add(bones);
insides.push(bones);
for (let i = 0; i < 6; i++) {
  const v = add(bones, roundedBox(0.1, 0.07, 0.1, 0.02), boneM, 0, 0.1 + i * 0.085, -0.16);
  add(v, roundedBox(0.04, 0.04, 0.08, 0.015), boneM, 0, -0.01, -0.07);
}
const upBones = new THREE.Group();
upper.add(upBones);
insides.push(upBones);
for (let i = 0; i < 6; i++) {
  const v = add(upBones, roundedBox(0.1, 0.07, 0.1, 0.02), boneM, 0, 0.04 + i * 0.09, -0.17);
  add(v, roundedBox(0.04, 0.04, 0.08, 0.015), boneM, 0, -0.01, -0.07);
}
for (let i = 0; i < 3; i++) {
  // open at the front (sternum), so they read as ribs, not a spring
  const rib = add(
    upBones,
    new THREE.TorusGeometry(0.31 - Math.abs(i - 1.5) * 0.025, 0.011, 6, 36, Math.PI * 1.55),
    boneM,
    0,
    0.2 + i * 0.12,
    -0.02,
  );
  rib.rotation.set(Math.PI / 2 + 0.35, 0, Math.PI / 2 + Math.PI * 0.225);
  rib.scale.set(1.12, 0.72, 1);
}
add(upBones, roundedBox(0.05, 0.36, 0.03, 0.012), boneM, 0, 0.32, 0.2).rotation.x = 0.12; // sternum
for (const s of [-1, 1]) limb(upBones, [s * 0.04, 0.6, 0.15], [s * 0.36, 0.6, 0.03], 0.02, boneM);
// pelvis bone
add(bones, new THREE.TorusGeometry(0.22, 0.04, 8, 28), boneM, 0, 0.05, -0.02).rotation.x =
  Math.PI / 2;

// ---------------------------------------------------------------- neck chain
const NSEG = 6;
const SEG = 0.058;
const neckBase = new THREE.Group();
neckBase.position.set(0, 0.6, -0.04);
upper.add(neckBase);
const segs = [];
{
  let parent = neckBase;
  for (let i = 0; i < NSEG; i++) {
    const g = new THREE.Group();
    g.position.y = i === 0 ? 0 : SEG;
    parent.add(g);
    segs.push(g);
    // skin slice of the neck (overlapping slices read as one smooth neck)
    add(g, new THREE.CylinderGeometry(0.125, 0.13, SEG * 1.9, 24), skinM, 0, SEG / 2, -0.01);
    // vertebra + spinous process
    const v = add(g, roundedBox(0.085, 0.042, 0.085, 0.015), boneM, 0, SEG / 2, -0.03);
    add(v, roundedBox(0.03, 0.03, 0.07, 0.01), boneM, 0, -0.005, -0.06);
    insides.push(v);
    parent = g;
  }
}
// strain glow on the back of the neck
const glowM = new THREE.MeshBasicMaterial({
  color: 0xff2a3a,
  transparent: true,
  opacity: 0,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const strainGlow = add(
  segs[2],
  new THREE.SphereGeometry(0.17, 24, 16),
  glowM,
  0,
  0.02,
  -0.08,
  false,
);
strainGlow.scale.set(1, 1.5, 0.8);
strainGlow.userData.noAO = true;

// ---------------------------------------------------------------- head
const head = new THREE.Group();
head.position.y = SEG;
segs[NSEG - 1].add(head);
const face = new THREE.Group();
head.add(face);
const C = V(0, 0.2, 0.04); // head centre
add(face, new THREE.SphereGeometry(0.2, 40, 28), skinM, C.x, C.y, C.z).scale.set(0.88, 1.08, 1.02);
add(face, new THREE.SphereGeometry(0.125, 32, 20), skinM, 0, 0.075, 0.08).scale.set(0.95, 0.78, 1); // jaw
add(face, new THREE.CapsuleGeometry(0.028, 0.06, 6, 12), skinM, 0, 0.19, 0.245).rotation.x = 0.35; // nose
for (const s of [-1, 1]) {
  add(face, new THREE.SphereGeometry(0.05, 16, 12), skinM, s * 0.175, 0.19, 0.02).scale.set(
    0.4,
    1,
    0.75,
  ); // ear
  add(face, new THREE.SphereGeometry(0.028, 16, 12), whiteM, s * 0.075, 0.245, 0.195); // eye
  add(face, new THREE.SphereGeometry(0.015, 12, 8), darkM, s * 0.075, 0.24, 0.219); // pupil
  const brow = add(face, roundedBox(0.07, 0.014, 0.02, 0.006), hairM, s * 0.075, 0.29, 0.205);
  brow.rotation.z = s * -0.12;
}
add(face, roundedBox(0.07, 0.012, 0.02, 0.005), flat(0x9a4a44), 0, 0.09, 0.215); // mouth
// hair: a cap over top and back + a fringe
{
  const cap = add(
    face,
    new THREE.SphereGeometry(0.215, 40, 24, 0, Math.PI * 2, 0, 1.55),
    hairM,
    C.x,
    C.y + 0.01,
    C.z - 0.01,
  );
  cap.scale.set(0.92, 1.1, 1.06);
  cap.rotation.x = -0.55;
  const fr = add(face, new THREE.SphereGeometry(0.12, 24, 12), hairM, 0.04, 0.37, 0.12);
  fr.scale.set(1.4, 0.45, 0.9);
  fr.rotation.z = -0.2;
}
// skull (x-ray)
const skull = add(head, new THREE.SphereGeometry(0.175, 32, 20), boneM, C.x, C.y + 0.01, C.z);
skull.scale.set(0.88, 1.08, 1.02);
const jawBone = add(head, new THREE.SphereGeometry(0.11, 24, 16), boneM, 0, 0.06, 0.1);
jawBone.scale.set(0.95, 0.7, 1);
insides.push(skull, jawBone);

// bowling ball, same place as the head
const ballTex = (() => {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = "#1b3fd0";
  g.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 60; i++) {
    g.strokeStyle = i % 3 ? "rgba(120,60,255,.35)" : "rgba(80,200,255,.35)";
    g.lineWidth = 6 + (i % 5) * 3;
    g.beginPath();
    const y = (i * 37) % 256;
    g.moveTo(0, y);
    g.bezierCurveTo(130, y + 60, 300, y - 70, 512, y + 20);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();
const ball = new THREE.Group();
ball.position.copy(C);
head.add(ball);
add(ball, new THREE.SphereGeometry(0.23, 48, 32), real.gloss(0xffffff, { map: ballTex }));
for (const [x, y] of [
  [-0.045, 0.05],
  [0.045, 0.05],
  [0, -0.04],
]) {
  const h = add(ball, new THREE.CircleGeometry(0.03, 20), darkM, x, y, 0.228, false);
  h.lookAt(V(x * 3, y * 3, 1));
}

// ---------------------------------------------------------------- muscles (x-ray)

function tubeBetween(mesh, pts, r) {
  if (mesh.geometry) mesh.geometry.dispose();
  mesh.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, r, 10, false);
}
const neckMus = [-1, 1].map(() => {
  const m = new THREE.Mesh(new THREE.BufferGeometry(), muscleM);
  scene.add(m);
  return m;
});
const chestMus = [-1, 1].map(() => {
  const m = new THREE.Mesh(new THREE.BufferGeometry(), chestM);
  scene.add(m);
  return m;
});

// ---------------------------------------------------------------- force arrow + lever
const forceM = new THREE.MeshBasicMaterial({ color: 0xff3b30, transparent: true, opacity: 1 });
const arrow = new THREE.Group();
scene.add(arrow);
add(arrow, new THREE.CylinderGeometry(0.03, 0.03, 1, 12), forceM, 0, -0.5, 0, false);
const tip = add(arrow, new THREE.ConeGeometry(0.08, 0.16, 16), forceM, 0, -1, 0, false);
tip.rotation.x = Math.PI;
const leverM = new THREE.MeshBasicMaterial({ color: 0xffd23f });
const lever = add(scene, new THREE.CylinderGeometry(0.018, 0.018, 1, 10), leverM, 0, 0, 0, false);
const pivotDot = add(scene, new THREE.SphereGeometry(0.045, 16, 12), leverM, 0, 0, 0, false);

// ---------------------------------------------------------------- ghost head (payoff)
const ghostM = new THREE.MeshBasicMaterial({
  color: 0x9fe0ff,
  transparent: true,
  opacity: 0,
  depthWrite: false,
});
const ghost = new THREE.Group();
scene.add(ghost);
add(ghost, new THREE.SphereGeometry(0.21, 32, 20), ghostM, 0, 0, 0, false).scale.set(
  0.9,
  1.1,
  1.02,
);
const ghostNeck = add(
  ghost,
  new THREE.CylinderGeometry(0.12, 0.12, 0.34, 20),
  ghostM,
  0,
  -0.32,
  -0.04,
  false,
);
const gapM = new THREE.MeshBasicMaterial({ color: 0xffd23f, transparent: true, opacity: 0 });
const gap = add(scene, new THREE.CylinderGeometry(0.02, 0.02, 1, 10), gapM, 0, 0, 0, false);
const gapTip = add(scene, new THREE.ConeGeometry(0.06, 0.12, 14), gapM, 0, 0, 0, false);

// ---------------------------------------------------------------- the child
const kid = new THREE.Group();
upper.add(kid);
{
  const shirt = real.fabric(0xffc23a);
  const kskin = real.skin(0xf0c0a0);
  const jeans = real.fabric(0x3c6fb0);
  add(kid, new THREE.CapsuleGeometry(0.17, 0.26, 8, 16), shirt, 0, 0.3, 0).scale.set(1.1, 1, 0.8);
  const kh = add(kid, new THREE.SphereGeometry(0.16, 32, 20), kskin, 0, 0.72, 0.02);
  kh.scale.set(0.95, 1.05, 1);
  const kc = add(
    kid,
    new THREE.SphereGeometry(0.168, 32, 16, 0, Math.PI * 2, 0, 1.5),
    flat(0xb5651d),
    0,
    0.73,
    0.0,
  );
  kc.rotation.x = -0.5;
  for (const s of [-1, 1]) {
    add(kid, new THREE.SphereGeometry(0.02, 10, 8), darkM, s * 0.055, 0.74, 0.165);
    // legs over your shoulders, dangling down your chest
    limb(kid, [s * 0.12, 0.08, 0.05], [s * 0.2, 0.05, 0.4], 0.075, jeans);
    limb(kid, [s * 0.2, 0.05, 0.4], [s * 0.22, -0.4, 0.45], 0.065, jeans);
    add(kid, roundedBox(0.1, 0.08, 0.18, 0.03), real.rubber(0xffffff), s * 0.22, -0.48, 0.5);
    // arms up — cheering
    limb(kid, [s * 0.2, 0.45, 0], [s * 0.38, 0.75, 0.05], 0.05, shirt);
    add(kid, new THREE.SphereGeometry(0.05, 12, 8), kskin, s * 0.4, 0.8, 0.06);
  }
  add(kid, roundedBox(0.06, 0.014, 0.02, 0.006), flat(0x9a4a44), 0, 0.66, 0.17);
}
kid.position.set(0, 0.78, -0.2);
kid.visible = false;

// ---------------------------------------------------------------- the viewer's hand

// ---------------------------------------------------------------- posture over time
// head flex in rad (0 = upright, 1.05 = 60° down) as keyframes
const FLEX = [
  [-1, 0.12],
  [0.05, 0.12],
  [0.75, 1.02],
  [T.abends, 1.0],
  [T.abends + 0.7, 0.72],
  [T.bowling, 0.6],
  [T.aufrecht, 0.6],
  [T.aufrecht + 0.5, 0.0],
  [T.kippt, 0.0],
  [T.kippt + 0.9, 1.0],
  [T.rate, 1.02],
  [T.k27, 1.05],
  [T.kind + 0.2, 1.05],
  [T.kind + 0.45, 1.18],
  [T.jeden, 1.12],
  [T.jeden + 0.4, 0.95],
  [T.fakt, 0.95],
  [T.fakt + 0.6, 0.0],
  [T.nicken, 0.0],
  [T.nicken + 0.35, 0.26],
  [T.je, 0.26],
  [T.tiefer + 0.3, 1.05],
  [T.deshalb, 1.05],
  [T.bleibt + 0.1, 0.98],
  [T.bleibt + 0.6, 0.82], // tries to lift …
  [T.vorne + 0.1, 0.92], // … sinks back
  [99, 0.92],
];
function keyed(list, t) {
  for (let i = 1; i < list.length; i++) {
    if (t < list[i][0]) {
      const [t0, a] = list[i - 1];
      const [t1, b] = list[i];
      return lerp(a, b, smooth(ramp(t, t0, t1)));
    }
  }
  return list[list.length - 1][1];
}
// neck load in kg for a flex angle (Hansraj 2014: 0° 5 kg … 60° 27 kg)
const KG = [
  [0, 5],
  [15, 12],
  [30, 18],
  [45, 22],
  [60, 27],
];
function kgOf(rad) {
  const d = Math.max(0, Math.min(60, (rad * 180) / Math.PI));
  for (let i = 1; i < KG.length; i++)
    if (d <= KG[i][0]) return lerp(KG[i - 1][1], KG[i][1], (d - KG[i - 1][0]) / 15);
  return 27;
}

const applyCamera = shotCamera(shots);
const wp = (obj, x, y, z, out = V(0, 0, 0)) => obj.localToWorld(out.set(x, y, z));

// ---------------------------------------------------------------- render
function renderAt(t) {
  // --- posture
  const scroll = Math.sin(t * 2.1) * 0.015 + Math.sin(t * 5.3) * 0.006;
  const flex = keyed(FLEX, t) + scroll;
  const slouch =
    smooth(ramp(t, T.jeden + 0.3, T.schlapp)) * (1 - smooth(ramp(t, T.fakt, T.fakt + 0.6))) +
    smooth(ramp(t, T.deshalb, T.vorne)) * 0.8;
  upper.rotation.x = 0.06 + 0.22 * slouch;
  const sh = 0.07 * slouch;
  shoulderGrp.forEach((g) => {
    g.position.z = sh;
    g.position.y = -sh * 0.4;
  });
  const total = flex - LEAN - upper.rotation.x; // world flex relative to upper torso
  const neckPart = total * 0.62;
  segs.forEach((g) => (g.rotation.x = neckPart / NSEG));
  head.rotation.x = total * 0.38;
  // kid: lands on the shoulders on "Kind", leaves at "Jeden"
  kid.visible = t >= T.kind && t < T.jeden + 0.3;
  if (kid.visible) {
    const drop = 1 - smooth(ramp(t, T.kind, T.kind + 0.25));
    kid.position.set(0, 0.84 + drop * 1.2, -0.24);
    const sq = squash(t, T.kind + 0.25, 0.6);
    const out = 1 - smooth(ramp(t, T.jeden, T.jeden + 0.3));
    kid.scale.set(1.3 * sq.x * out + 0.001, 1.3 * sq.y * out + 0.001, 1.3 * sq.z * out + 0.001);
  }

  // --- phone: scrolls; drops onto the duvet in the payoff
  feedTex.offset.y = (t * 0.12) % 1;
  const fall = smooth(ramp(t, T.deshalb + 0.15, T.deshalb + 0.55));
  phone.position.set(0, lerp(PHONE_REST.p.y, -0.05, fall), lerp(PHONE_REST.p.z, 0.78, fall));
  phone.rotation.x = lerp(PHONE_REST.r, -1.55, fall);
  phoneLight.intensity = 3.2 * (1 - 0.6 * fall) * (0.9 + 0.1 * Math.sin(t * 7));

  // --- head vs. bowling ball
  const isBall = t >= T.bowling && t < T.leg;
  const ballK = isBall ? smooth(ramp(t, T.bowling, T.bowling + 0.25)) : 0;
  face.visible = !isBall || ballK < 0.5;
  ball.visible = isBall;
  ball.scale.setScalar(
    isBall ? 0.5 + 0.5 * ballK + 0.12 * Math.max(0, 1 - (t - T.bowling) / 0.4) : 0.001,
  );
  skull.visible = jawBone.visible = !isBall;

  // --- x-ray windows
  const xr =
    smooth(ramp(t, T.aufrecht, T.aufrecht + 0.35)) * (1 - smooth(ramp(t, T.leg, T.leg + 0.25))) +
    smooth(ramp(t, T.spuerst, T.spuerst + 0.35)) * (1 - smooth(ramp(t, T.rate, T.rate + 0.25))) +
    smooth(ramp(t, T.brust - 0.1, T.brust + 0.25)) * (1 - smooth(ramp(t, T.fakt, T.fakt + 0.3)));
  setXray(SHELL, xr);
  for (const o of insides) o.visible = xr > 0.02;
  if (isBall) for (const o of insides) if (o === skull || o === jawBone) o.visible = false;

  // --- muscles
  const strain = Math.max(0, (flex - 0.3) / 0.8);
  const showMus = xr > 0.02 && t >= T.spuerst;
  const stretch =
    smooth(ramp(t, T.hinten, T.nackenm + 0.6)) * (1 - smooth(ramp(t, T.fakt, T.fakt + 0.3)));
  [-1, 1].forEach((s, i) => {
    neckMus[i].visible = showMus;
    if (showMus) {
      const a = wp(head, s * 0.06, 0.12, -0.13);
      const b = wp(upper, s * 0.09, 0.42, -0.25);
      const mid = wp(segs[2], s * 0.075, 0.02, -0.13);
      tubeBetween(neckMus[i], [a, mid, b], 0.04 - 0.014 * stretch);
    }
    chestMus[i].visible = xr > 0.02 && t >= T.brust - 0.1 && t < T.fakt + 0.3;
    if (chestMus[i].visible) {
      const a = wp(upper, s * 0.07, 0.45, 0.2);
      const b = wp(shoulderGrp[i], s * 0.36, 0.5, 0.08);
      const mid = a
        .clone()
        .lerp(b, 0.5)
        .add(wp(upper, 0, 0, 0.06).sub(wp(upper, 0, 0, 0)));
      tubeBetween(chestMus[i], [a, mid, b], 0.06);
    }
  });
  const pulse = 0.5 + 0.5 * Math.sin(t * 9);
  muscleM.emissiveIntensity = (0.25 + 0.9 * strain * (1 - 0.7 * stretch)) * (0.75 + 0.25 * pulse);
  muscleM.color.setHex(stretch > 0.5 ? 0xd98a8f : 0xc9283e);
  chestM.emissiveIntensity = 0.5 + 0.6 * smooth(ramp(t, T.brust, T.steif + 0.3)) * pulse;

  // --- strain glow (hook, "Spürst du's ziehen", the child, the payoff)
  const glowK = Math.max(
    pop(t, 0.35, T.abends, 0.25),
    pop(t, T.finger, T.rate, 0.3),
    pop(t, T.kind + 0.25, T.jeden, 0.2),
    pop(t, T.vorne, 99, 0.3),
  );
  glowM.opacity = glowK * (0.45 + 0.25 * Math.sin(t * 8)) * (1 - xr * 0.6);

  // --- lever + force arrow ("Jetzt hängt die Kugel vor deinem Hals")
  const leverK = pop(t, T.jetzt, T.leg, 0.25);
  const headC = wp(head, C.x, C.y, C.z);
  const pivot = wp(neckBase, 0, 0, 0);
  arrow.visible = lever.visible = pivotDot.visible = leverK > 0.01;
  if (arrow.visible) {
    const L = (0.35 + 0.5 * strain) * leverK;
    arrow.position.copy(headC).add(V(0, -0.25, 0));
    arrow.scale.set(1, L, 1);
    tip.scale.set(1 / 1, 1 / Math.max(L, 0.05), 1).multiplyScalar(1);
    const under = V(pivot.x, pivot.y, headC.z);
    lever.position.copy(pivot).add(under).multiplyScalar(0.5);
    lever.scale.set(1, Math.max(0.001, Math.abs(headC.z - pivot.z)) * leverK, 1);
    lever.rotation.set(Math.PI / 2, 0, 0);
    pivotDot.position.copy(pivot);
    pivotDot.scale.setScalar(leverK);
  }

  // --- ghost head: where the head belongs (payoff)
  const gk = smooth(ramp(t, T.vorne - 0.05, T.vorne + 0.35));
  ghost.visible = gk > 0.01;
  ghostM.opacity = 0.5 * gk * (0.85 + 0.15 * Math.sin(t * 6));
  gapM.opacity = gk;
  gap.visible = gapTip.visible = gk > 0.01;
  if (ghost.visible) {
    const base = wp(neckBase, 0, 0, 0);
    // upright: straight up from the neck base
    const gp = base.clone().add(V(0, 0.36 + 0.22, 0.03));
    ghost.position.copy(gp);
    const side = V(0.32, 0, 0); // in front of both heads, towards the camera
    const from = gp.clone().add(side);
    const to = headC.clone().add(side);
    const d = to.clone().sub(from);
    const len = d.length() * gk;
    gap.position.copy(from).addScaledVector(d.clone().normalize(), len / 2);
    gap.scale.set(1, Math.max(0.001, len - 0.1), 1);
    gap.quaternion.setFromUnitVectors(UP, d.clone().normalize());
    gapTip.position.copy(from).addScaledVector(d.clone().normalize(), len - 0.05);
    gapTip.quaternion.copy(gap.quaternion);
  }
  void ghostNeck;

  // --- time-lapse: the clock races, the lamp blinks day / night
  const tl = ramp(t, T.jeden, T.brust);
  const hours = 22.5 + tl * 24 * 40;
  clock.userData.hour.rotation.z = -((hours % 12) / 12) * Math.PI * 2;
  clock.userData.min.rotation.z = -(hours % 1) * Math.PI * 2;
  clock.userData.sec.rotation.z = -t * 0.105 * 6 - tl * 900;
  const day = tl > 0 && tl < 1 ? Math.max(0, Math.sin(tl * 40 * Math.PI)) : 0;
  lampLight.intensity = 16 * (1 - 0.8 * day);
  outside.userData.back.material.color.setRGB(1 + day * 2, 1 + day * 2.2, 1 + day * 3);
  outside.userData.moon.visible = day < 0.3;

  // --- displays: the neck scale
  const kgNow = kgOf(flex);
  let gaugeK = Math.max(pop(t, T.rate, T.jeden, 0.3), pop(t, T.fakt + 0.6, T.deshalb, 0.3));
  let shown = kgNow;
  if (t >= T.rate && t < T.k27) {
    // "Rate mal": the needle runs up and searches
    const u = ramp(t, T.rate, T.k27);
    shown = 5 + 22 * smooth(u) + Math.sin(t * 23) * 3 * (1 - u);
  }
  gauge("kg", gaugeK, {
    label: "Last im Nacken",
    value: Math.max(0, shown),
    max: 30,
    unit: "kg",
    x: 600,
    y: 400,
    color: shown > 20 ? "#ff4b2b" : "#ffd23f",
  });
  showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
