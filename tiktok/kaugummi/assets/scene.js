// #37 "Was passiert, wenn du einen Kaugummi verschluckst?" — a person on a
// bench in the Prater laughs and swallows the gum (frame 0: the hand pushes
// it in, the bubble bursts). X-ray: the gum slides down the gullet, plops
// into the stomach acid, the acid can't break it, sugar and mint fly out,
// the grey core circles while the food moves on, a glue bottle on the bench
// ("Kunststoff"), the cleaning wave pushes it out, it slides through the gut,
// a warning (too many), the calendar flips 7 JAHRE → 1–2 TAGE, the WC door,
// the Stone-Age gum with its DNA, drone pull-back over the Prater.
import {
  THREE,
  ramp,
  smooth,
  easeInOut,
  inBack,
  pop,
  lerp,
  V,
  rng,
  scene,
  flat,
  M,
  jitter,
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
import { wcDoor } from "./set.js";
import { createHand } from "./hand.js";
import { bench } from "./props.js";
import { T, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);

const mesh = (geo, mat, x, y, z, parent) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};
const canvasTex = (w, h) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return { c, g: c.getContext("2d"), tex };
};

// ---------------------------------------------------------------- bench + person
const BENCH_S = 2;
{
  const b = bench(0xc58b4f);
  b.scale.setScalar(BENCH_S);
  b.position.set(0, 0, -0.1);
  scene.add(b);
}
const SEAT = 0.45 * BENCH_S + 0.06;

const SKIN = 0xf1c09a;
const HOODIE = 0x3a7bd5;
const person = new THREE.Group();
scene.add(person);
const hoodMat = xrayMaterial(HOODIE, { flatShading: true, roughness: 0.7 });
const neckMat = xrayMaterial(SKIN, { flatShading: true, roughness: 0.75 });
const skinMat = flat(SKIN, { roughness: 0.7 });
const pantsMat = xrayMaterial(0x2f3440, { flatShading: true, roughness: 0.7 });
const hairMat = flat(0x5a3522);
// torso: a tapered faceted barrel from the seat to the shoulders
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
const shoulders = mesh(
  jitter(new THREE.SphereGeometry(0.75, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0.015, 4),
  hoodMat,
  0,
  TORSO.y1 - 0.05,
  0,
  person,
);
shoulders.scale.set(1.05, 0.42, 0.62);
// hood rim
mesh(
  new THREE.TorusGeometry(0.3, 0.09, 6, 14),
  hoodMat,
  0,
  TORSO.y1 + 0.24,
  -0.06,
  person,
).rotation.x = Math.PI / 2;
const neckGeo = new THREE.CylinderGeometry(0.2, 0.23, 0.5, 10);
mesh(neckGeo, neckMat, 0, TORSO.y1 + 0.3, 0, person);
// the gulp: a bulge that slides down the throat
const gulpBulge = mesh(
  new THREE.SphereGeometry(0.11, 10, 8),
  neckMat,
  0,
  TORSO.y1 + 0.4,
  0.12,
  person,
);
// legs: thighs forward, shins down
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
  const shin = mesh(
    new THREE.CylinderGeometry(0.22, 0.24, SEAT + 0.1, 10),
    pantsMat,
    sx * 0.36,
    (SEAT + 0.1) / 2,
    1.0,
    person,
  );
  shin.position.y = (SEAT + 0.15) / 2;
  const shoe = mesh(
    new THREE.BoxGeometry(0.34, 0.2, 0.55),
    flat(0xf4f1ea),
    sx * 0.36,
    0.1,
    1.12,
    person,
  );
  shoe.castShadow = true;
}
// arms: upper arm down the side, forearm forward onto the thigh
const arms = [];
for (const sx of [-1, 1]) {
  const arm = new THREE.Group();
  arm.position.set(sx * 0.88, TORSO.y1 - 0.15, 0);
  person.add(arm);
  arm.rotation.z = sx * 0.1;
  const upper = mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.95, 8), hoodMat, 0, -0.45, 0, arm);
  const fore = mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.8, 8), hoodMat, 0, -1.3, 0.04, arm);
  mesh(new THREE.SphereGeometry(0.14, 8, 6), skinMat, 0, -1.78, 0.06, arm);
  arms.push({ arm, upper, fore });
}
// head
const HEAD_Y = TORSO.y1 + 0.85;
const head = new THREE.Group();
head.position.set(0, HEAD_Y, 0.02);
person.add(head);
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
    // laughing eyes: closed arcs ^ ^
    const eye = mesh(
      new THREE.TorusGeometry(0.065, 0.018, 4, 10, Math.PI),
      flat(0x2a1a14),
      sx * 0.16,
      0.08,
      0.4,
      head,
    );
    eye.rotation.z = 0;
    const brow = mesh(new THREE.BoxGeometry(0.15, 0.03, 0.03), hairMat, sx * 0.16, 0.22, 0.4, head);
    brow.rotation.z = sx * -0.25;
    const cheek = mesh(
      new THREE.SphereGeometry(0.07, 8, 6),
      flat(0xff9a8a),
      sx * 0.24,
      -0.1,
      0.36,
      head,
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
}
// the laughing mouth: dark opening + teeth + tongue, opens and closes
const mouth = new THREE.Group();
mouth.position.set(0, -0.2, 0.39);
head.add(mouth);
const mouthHole = mesh(new THREE.SphereGeometry(0.12, 12, 8), flat(0x5a1420), 0, 0, 0, mouth);
mouthHole.scale.set(1.1, 0.7, 0.35);
mesh(new THREE.BoxGeometry(0.2, 0.04, 0.05), flat(0xffffff), 0, 0.055, 0.03, mouth);
const tongue = mesh(new THREE.SphereGeometry(0.07, 8, 6), flat(0xff6f7a), 0, -0.04, 0.02, mouth);
tongue.scale.set(1.2, 0.5, 0.6);
const MOUTH_W = V(0, HEAD_Y - 0.2, 0.47); // world point (person not moved)

// ---------------------------------------------------------------- organs (x-ray)
const organs = new THREE.Group();
person.add(organs);
const glow = (c, e = 0.35) => flat(c, { emissive: c, emissiveIntensity: e, roughness: 0.45 });
const gulletPts = [
  V(0, HEAD_Y - 0.22, 0.25),
  V(0, HEAD_Y - 0.42, 0.06),
  V(0, TORSO.y1 + 0.2, 0.04),
  V(0.02, TORSO.y1 - 0.25, 0.05),
  V(0.08, TORSO.y1 - 0.62, 0.08),
  V(0.2, TORSO.y1 - 0.85, 0.1),
];
const gulletCurve = new THREE.CatmullRomCurve3(gulletPts);
mesh(new THREE.TubeGeometry(gulletCurve, 60, 0.065, 8), glow(0xff8f9a, 0.25), 0, 0, 0, organs);
const STOM = V(0.3, TORSO.y1 - 1.07, 0.1); // stomach centre ≈ y 2.0
const stomMat = new THREE.MeshStandardMaterial({
  color: 0xffc08a,
  emissive: 0xff9a50,
  emissiveIntensity: 0.15,
  roughness: 0.4,
  transparent: true,
  opacity: 0.32,
  depthWrite: false,
  side: THREE.DoubleSide,
});
const stomach = mesh(
  jitter(new THREE.SphereGeometry(0.5, 18, 12), 0.01, 9),
  stomMat,
  STOM.x,
  STOM.y,
  STOM.z,
  organs,
);
stomach.scale.set(1.0, 0.68, 0.62);
stomach.rotation.z = 0.32;
stomach.castShadow = false;
// stomach acid: green glowing pool in the bottom of the stomach
const acidMat = new THREE.MeshStandardMaterial({
  color: 0x7dff6a,
  emissive: 0x3dff4a,
  emissiveIntensity: 0.9,
  transparent: true,
  opacity: 0.75,
  roughness: 0.2,
  depthWrite: false,
});
const acid = mesh(
  new THREE.SphereGeometry(0.4, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
  acidMat,
  STOM.x,
  STOM.y + 0.02,
  STOM.z,
  organs,
);
acid.scale.set(1.0, 0.62, 0.55);
acid.castShadow = false;
const PYLORUS = V(-0.12, STOM.y - 0.18, 0.14);
// small intestine: a snake of rows in the lower belly
const gutPts = [
  STOM.clone().add(V(-0.15, -0.12, 0.04)),
  PYLORUS.clone(),
  V(-0.2, PYLORUS.y - 0.12, 0.18),
];
{
  const rows = 5;
  for (let r = 0; r < rows; r++) {
    const y = PYLORUS.y - 0.2 - r * 0.13;
    const dir = r % 2 === 0 ? 1 : -1;
    for (let k = 0; k <= 6; k++) {
      const f = k / 6;
      const x = dir > 0 ? lerp(-0.42, 0.42, f) : lerp(0.42, -0.42, f);
      gutPts.push(V(x, y + Math.sin(f * Math.PI * 2) * 0.03, 0.17 + Math.sin(f * Math.PI) * 0.06));
    }
  }
}
// large intestine: frame around, then down and out
const colonPts = [
  V(-0.5, TORSO.y0 + 0.2, 0.06),
  V(-0.58, STOM.y - 0.15, 0.03),
  V(-0.2, STOM.y - 0.2, 0.0),
  V(0.4, STOM.y - 0.28, 0.0),
  V(0.6, STOM.y - 0.4, 0.04),
  V(0.58, TORSO.y0 + 0.2, 0.06),
  V(0.15, TORSO.y0 + 0.1, 0.06),
  V(0, TORSO.y0 - 0.05, 0.0),
];
const gutCurve = new THREE.CatmullRomCurve3(gutPts);
const colonCurve = new THREE.CatmullRomCurve3(colonPts);
const gutMat = glow(0xffa07a, 0.25);
mesh(new THREE.TubeGeometry(gutCurve, 300, 0.045, 8), gutMat, 0, 0, 0, organs);
mesh(new THREE.TubeGeometry(colonCurve, 120, 0.065, 8), glow(0xd9706a, 0.2), 0, 0, 0, organs);
// one track for the whole trip after the stomach (gut, then colon)
const tripPts = [...gutCurve.getSpacedPoints(160), ...colonCurve.getSpacedPoints(60)];
const tripCurve = new THREE.CatmullRomCurve3(tripPts);

// ---------------------------------------------------------------- the gum
const GUM_PINK = new THREE.Color(0xff3f9a);
const GUM_GREY = new THREE.Color(0xc9a0b0);
const gumMat = flat(0xff3f9a, { emissive: 0xff2a8a, emissiveIntensity: 0.55, roughness: 0.25 });
const gum = new THREE.Mesh(jitter(new THREE.IcosahedronGeometry(0.13, 1), 0.014, 11), gumMat);
gum.castShadow = true;
gum.userData.noAO = true;
scene.add(gum);
const gumPos = V(0, 0, 0); // live, for the "Kern" label
// the bubble on frame 0
const bubbleMat = new THREE.MeshStandardMaterial({
  color: 0xff7ab8,
  roughness: 0.2,
  transparent: true,
  opacity: 0.85,
  emissive: 0xff3f9a,
  emissiveIntensity: 0.2,
});
const bubble = mesh(
  new THREE.SphereGeometry(0.3, 18, 12),
  bubbleMat,
  MOUTH_W.x,
  MOUTH_W.y,
  MOUTH_W.z + 0.28,
  scene,
);
// bubble shreds after the burst
const shreds = [];
{
  const r = rng(21);
  for (let i = 0; i < 10; i++) {
    const s = mesh(new THREE.TetrahedronGeometry(0.05, 0), gumMat, 0, 0, 0, scene);
    shreds.push({ s, d: V(r() - 0.5, r() - 0.3, r() * 0.8).normalize(), sp: 0.8 + r() * 0.8 });
  }
}

// gum position over time
function gumAt(t, out) {
  const swallowIn = smooth(ramp(t, 0.4, 0.85)); // pushed into the mouth
  if (t < T.schluck) {
    // in front of the lips → into the mouth, sits on the tongue
    return out.set(MOUTH_W.x, MOUTH_W.y, lerp(MOUTH_W.z + 0.12, MOUTH_W.z - 0.08, swallowIn));
  }
  if (t < T.rutscht) {
    // swallowed: waiting at the top of the gullet (hidden in the neck)
    return gulletCurve.getPointAt(0.12, out);
  }
  if (t < T.plumpst + 0.2) {
    const k = easeInOut(ramp(t, T.rutscht, T.plumpst + 0.2));
    return gulletCurve.getPointAt(0.12 + 0.88 * k, out);
  }
  const end = gulletCurve.getPointAt(1);
  if (t < T.putzwelle + 0.3) {
    // drop into the acid, then circle in the stomach
    const land = smooth(ramp(t, T.plumpst + 0.2, T.plumpst + 0.7));
    const circ =
      smooth(ramp(t, T.kreist - 0.2, T.kreist + 0.6)) *
      (1 - smooth(ramp(t, T.putzwelle - 0.6, T.putzwelle + 0.3)));
    const a = (t - T.kreist) * 2.4;
    const base = V(STOM.x + 0.05, STOM.y - 0.08, STOM.z + 0.05);
    out.copy(end).lerp(base, land);
    out.x += Math.cos(a) * 0.2 * circ;
    out.y += Math.sin(a * 0.7) * 0.06 * circ;
    out.z += Math.sin(a) * 0.08 * circ;
    // bounced by the acid (money shot)
    const b = Math.max(0, Math.sin(ramp(t, T.zaehne - 0.2, T.zaehne + 0.9) * Math.PI));
    out.y += b * 0.12;
    return out;
  }
  // the cleaning wave pushes it out; it slides through the whole gut
  const k =
    smooth(ramp(t, T.putzwelle + 0.3, T.wandert)) * 0.05 +
    easeInOut(ramp(t, T.wandert, T.darum)) * 0.95;
  return tripCurve.getPointAt(Math.min(0.999, k), out);
}

// sugar + mint sparkles leaving the gum
const sparkMat = [
  flat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 1.2 }),
  flat(0x7dffd0, { emissive: 0x3dffc0, emissiveIntensity: 1.2 }),
];
const sparks = [];
{
  const r = rng(31);
  for (let i = 0; i < 26; i++) {
    const s = new THREE.Mesh(new THREE.OctahedronGeometry(0.022, 0), sparkMat[i % 2]);
    s.userData.noAO = true;
    scene.add(s);
    sparks.push({
      s,
      d: V(r() - 0.5, r() * 0.8, r() - 0.5).normalize(),
      sp: 0.3 + r() * 0.5,
      ph: r() * 0.5,
    });
  }
}
// acid bubbles
const bubbles = [];
{
  const r = rng(41);
  const m = new THREE.MeshBasicMaterial({ color: 0xc9ffb8, transparent: true, opacity: 0.85 });
  for (let i = 0; i < 18; i++) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.018 + r() * 0.015, 6, 4), m);
    b.userData.noAO = true;
    organs.add(b);
    bubbles.push({ b, x: (r() - 0.5) * 0.55, z: (r() - 0.5) * 0.25, ph: r(), sp: 0.5 + r() * 0.6 });
  }
}
// acid splash droplets (money shot 2)
const splash = [];
{
  const r = rng(51);
  for (let i = 0; i < 14; i++) {
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 4), acidMat);
    d.userData.noAO = true;
    scene.add(d);
    splash.push({ d, a: r() * Math.PI * 2, v: 0.6 + r() * 0.7, up: 0.8 + r() * 0.8 });
  }
}
// schnitzel bits: dissolve in the acid, then move on through the gut
const foodMat = flat(0xc98a3a, { roughness: 0.6 });
const food = [];
{
  const r = rng(61);
  for (let i = 0; i < 7; i++) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.05, 0.08), foodMat);
    f.rotation.set(r() * 3, r() * 3, r() * 3);
    organs.add(f);
    food.push({ f, x: (r() - 0.5) * 0.5, y: (r() - 0.5) * 0.1, z: (r() - 0.5) * 0.2, ph: r() });
  }
}
// "too many" — a pile of gums in the stomach (warning)
const pile = [];
{
  const r = rng(71);
  for (let i = 0; i < 12; i++) {
    const p = new THREE.Mesh(gum.geometry, gumMat);
    organs.add(p);
    pile.push({
      p,
      x: (r() - 0.5) * 0.5,
      y: (r() - 0.3) * 0.18,
      z: (r() - 0.5) * 0.2,
      at: i * 0.12,
    });
  }
}
// the cleaning wave: a bright ring that runs along stomach → gut
const waveMat = new THREE.MeshBasicMaterial({
  color: 0xfff1a0,
  transparent: true,
  opacity: 0.9,
  depthWrite: false,
});
const wave = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 6, 24), waveMat);
wave.userData.noAO = true;
scene.add(wave);
const wavePos = V(0, 0, 0);

// ---------------------------------------------------------------- analogy props
// lemon (Zitronensaft) beside the stomach
const lemon = mesh(
  jitter(new THREE.SphereGeometry(0.2, 10, 8), 0.01, 12),
  flat(0xffe14a, { roughness: 0.4 }),
  0.98,
  2.4,
  0.75,
  scene,
);
lemon.scale.set(1.25, 0.95, 0.95);
const lemonTip = mesh(new THREE.ConeGeometry(0.05, 0.1, 6), flat(0xffe14a), 1.25, 2.4, 0.75, scene);
lemonTip.rotation.z = -Math.PI / 2;
// glue bottle on the bench (left)
const glue = new THREE.Group();
glue.position.set(-1.35, SEAT - 0.04, 0.15);
scene.add(glue);
{
  const body = mesh(
    new THREE.CylinderGeometry(0.17, 0.19, 0.5, 14),
    flat(0xf6f3ea, { roughness: 0.4 }),
    0,
    0.25,
    0,
    glue,
  );
  const neckB = mesh(
    new THREE.CylinderGeometry(0.07, 0.15, 0.14, 12),
    flat(0xf6f3ea),
    0,
    0.57,
    0,
    glue,
  );
  const capB = mesh(new THREE.ConeGeometry(0.07, 0.18, 10), flat(0xff7a2f), 0, 0.73, 0, glue);
  const { c, g, tex } = canvasTex(256, 128);
  g.fillStyle = "#ff7a2f";
  g.fillRect(0, 0, 256, 128);
  g.fillStyle = "#fff";
  g.font = "900 54px Montserrat, Arial, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("LEIM", 128, 68);
  tex.needsUpdate = true;
  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(0.181, 0.191, 0.22, 20, 1, true, -0.9, 1.8),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 }),
  );
  label.position.y = 0.25;
  glue.add(label);
  void c;
  void body;
  void neckB;
  void capB;
}
// calendar on the bench (right): "7 JAHRE?" → "1–2 TAGE"
const cal = new THREE.Group();
cal.position.set(1.4, SEAT - 0.04, 0.1);
cal.rotation.y = -0.35;
scene.add(cal);
const calCanvas = canvasTex(512, 512);
function drawCal(state) {
  const g = calCanvas.g;
  g.clearRect(0, 0, 512, 512);
  g.fillStyle = "#ffffff";
  g.fillRect(0, 0, 512, 512);
  g.fillStyle = state === "tage" ? "#2fbf5a" : "#e2453c";
  g.fillRect(0, 0, 512, 150);
  g.fillStyle = "#ffffff";
  g.font = "900 72px Montserrat, Arial, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(state === "tage" ? "NUR" : "BLEIBT", 256, 80);
  g.fillStyle = "#1d1d2b";
  if (state === "tage") {
    g.font = "900 170px Montserrat, Arial, sans-serif";
    g.fillText("1–2", 256, 300);
    g.font = "900 84px Montserrat, Arial, sans-serif";
    g.fillText("TAGE", 256, 440);
  } else {
    g.font = "900 230px Montserrat, Arial, sans-serif";
    g.fillText("7", 256, 300);
    g.font = "900 84px Montserrat, Arial, sans-serif";
    g.fillText("JAHRE?", 256, 450);
  }
  calCanvas.tex.needsUpdate = true;
}
drawCal("jahre");
let calState = "jahre";
{
  const stand = mesh(new THREE.BoxGeometry(0.9, 0.9, 0.12), flat(0x3b3f47), 0, 0.45, -0.05, cal);
  stand.rotation.x = -0.12;
  void stand;
}
const calPage = new THREE.Group(); // flips over its top edge
calPage.position.set(0, 0.88, 0.03);
cal.add(calPage);
const calFace = new THREE.Mesh(
  new THREE.PlaneGeometry(0.82, 0.82),
  new THREE.MeshBasicMaterial({ map: calCanvas.tex }),
);
calFace.position.y = -0.42;
calPage.add(calFace);
calPage.rotation.x = -0.12;
for (const sx of [-0.25, 0.25])
  mesh(new THREE.TorusGeometry(0.04, 0.012, 4, 10), M.chrome, sx, 0.9, 0.04, cal);

// Stone-Age gum: a dark birch-pitch lump on a stone, DNA helix rising
const STONE = V(-4.6, 0, 1.8);
const stoneSet = new THREE.Group();
stoneSet.position.copy(STONE);
scene.add(stoneSet);
{
  const rock = mesh(
    jitter(new THREE.DodecahedronGeometry(0.75, 1), 0.08, 13),
    M.rock,
    0,
    0.55,
    0,
    stoneSet,
  );
  rock.scale.set(1.2, 0.9, 1.0);
  const pitch = mesh(
    jitter(new THREE.IcosahedronGeometry(0.22, 1), 0.04, 14),
    flat(0x3a2414, { roughness: 0.35 }),
    0,
    1.3,
    0,
    stoneSet,
  );
  pitch.scale.set(1.3, 0.8, 1.0);
}
const helix = new THREE.Group();
helix.position.set(0, 1.45, 0);
stoneSet.add(helix);
{
  const a = flat(0x3fb5ff, { emissive: 0x3fb5ff, emissiveIntensity: 0.9 });
  const b = flat(0xff4f8b, { emissive: 0xff4f8b, emissiveIntensity: 0.9 });
  const rungMat = flat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.5 });
  for (let i = 0; i < 16; i++) {
    const y = i * 0.09;
    const ang = i * 0.55;
    const p1 = V(Math.cos(ang) * 0.22, y, Math.sin(ang) * 0.22);
    const p2 = V(-Math.cos(ang) * 0.22, y, -Math.sin(ang) * 0.22);
    mesh(new THREE.SphereGeometry(0.045, 8, 6), a, p1.x, p1.y, p1.z, helix);
    mesh(new THREE.SphereGeometry(0.045, 8, 6), b, p2.x, p2.y, p2.z, helix);
    const rung = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.44, 4), rungMat, 0, y, 0, helix);
    rung.rotation.z = Math.PI / 2;
    rung.rotation.y = -ang;
  }
}

// ---------------------------------------------------------------- the viewer's hand
// frame 0: the hand pushes the gum between the laughing lips
const hand = createHand({ skin: SKIN, sleeve: HOODIE, scale: 0.55 });

// ---------------------------------------------------------------- render
const applyCamera = shotCamera(shots);
const liveLabels = LABELS.map((l) =>
  l.pos === "gum" ? { ...l, pos: gumPos } : l.pos === "wave" ? { ...l, pos: wavePos } : l,
);
const xrayMats = [hoodMat, neckMat, pantsMat];
const tmp = V(0, 0, 0);

function renderAt(t) {
  // ---- frame 0: hand + bubble + laugh
  hand.track(t, [
    { t: -0.6, pos: [0.55, HEAD_Y - 0.55, 1.15], rot: [0.5, Math.PI, 0.2], pose: "grab" },
    { t: 0.0, pos: [0.32, HEAD_Y - 0.4, 0.95], rot: [0.4, Math.PI, 0.15], pose: "grab" },
    { t: 0.45, pos: [0.12, HEAD_Y - 0.28, 0.72], rot: [0.3, Math.PI, 0.1], pose: "point" },
    { t: 0.8, pos: [0.22, HEAD_Y - 0.32, 0.8], rot: [0.3, Math.PI, 0.1], pose: "point" },
    { t: 1.25, pos: [0.7, HEAD_Y - 0.8, 1.25], rot: [0.5, Math.PI, 0.2], pose: "open", out: true },
  ]);
  // bubble grows, bursts at 0.32
  const bubK = t < 0.32 ? 0.75 + t * 0.9 : 0;
  bubble.visible = bubK > 0.01;
  bubble.scale.setScalar(Math.max(0.001, bubK));
  for (const { s, d, sp } of shreds) {
    const k = ramp(t, 0.32, 0.9);
    s.visible = k > 0 && k < 1;
    s.position
      .copy(MOUTH_W)
      .add(V(0, 0, 0.28))
      .addScaledVector(d, k * sp * 0.6);
    s.position.y -= k * k * 0.4;
    s.rotation.set(t * 6, t * 4, 0);
  }
  // laughing: mouth opens wide in the hook and on "lachst"; head tips back
  const laugh = Math.max(1 - ramp(t, 1.0, 1.4), pop(t, T.lachst - 0.1, T.schluck), 0.15);
  const giggle = Math.abs(Math.sin(t * 14)) * 0.25;
  mouth.scale.set(1, 0.6 + laugh * (1.0 + giggle), 1);
  head.rotation.x = -0.12 * laugh + 0.08 * pop(t, T.schluck, T.weg + 0.4);
  // gulp bulge in the throat (frame 0 act + the spoken "schluck")
  const gulpK = Math.max(
    ramp(t, 0.9, 1.6) * (t < 1.6 ? 1 : 0),
    ramp(t, T.schluck, T.schluck + 0.6) * (t < T.schluck + 0.6 ? 1 : 0),
  );
  gulpBulge.visible = gulpK > 0 && gulpK < 1;
  gulpBulge.position.y = TORSO.y1 + 0.5 - gulpK * 0.45;
  gulpBulge.scale.setScalar(Math.sin(gulpK * Math.PI) * 1.1 + 0.01);
  // hand to the mouth "weg ist er" — the person's right arm lifts
  const shock = pop(t, T.weg, T.rutscht - 0.3);
  arms[0].arm.rotation.x = -1.2 * smooth(Math.min(1, shock * 1.2));

  // ---- x-ray: from "rutscht" until the payoff
  const xr =
    smooth(ramp(t, T.rutscht - 0.25, T.rutscht + 0.35)) *
    (1 - smooth(ramp(t, T.darum, T.darum + 0.5)));
  // the glue bottle shot and the follow line wide stay solid-ish
  setXray(xrayMats, xr);
  organs.visible = xr > 0.02;

  // ---- the gum
  gumAt(t, gumPos);
  gum.position.copy(gumPos);
  const inside = t >= T.schluck;
  gum.visible = t >= 0.32 && (t < 1.25 || (inside && xr > 0.3)) && t < T.darum + 0.6;
  // pink → grey core when sugar and mint are gone
  const grey = smooth(ramp(t, T.zucker, T.kern1 + 0.3));
  gumMat.color.copy(GUM_PINK).lerp(GUM_GREY, grey);
  gumMat.emissiveIntensity = 0.55 * (1 - grey) + 0.25 + 0.6 * pop(t, T.ernicht, T.rate);
  const squish = pop(t, T.plumpst + 0.2, T.plumpst + 0.8);
  gum.scale.set(1 + squish * 0.3, 1 - squish * 0.25, 1 + squish * 0.3);
  gum.rotation.set(t * 1.3, t * 0.9, 0);
  puff("plop", t, T.plumpst + 0.22, gumPos.x, gumPos.y, gumPos.z, 0.25, 0xb8ffb0);

  // acid bubbles + level
  const acidK = smooth(ramp(t, T.saeure - 0.2, T.saeure + 0.4));
  acid.visible = xr > 0.02;
  acidMat.emissiveIntensity = 0.4 + 0.8 * acidK + 0.6 * pop(t, T.zaehne - 0.3, T.folg);
  for (const { b, x, z, ph, sp } of bubbles) {
    const k = (t * sp + ph) % 1;
    b.visible = acidK > 0.05;
    b.position.set(STOM.x + x * (1 - k * 0.3), STOM.y - 0.17 + k * 0.17, STOM.z + z);
    b.scale.setScalar(acidK * (1 - k * 0.5));
  }
  // acid splash bounces off the gum
  for (const { d, a, v, up } of splash) {
    const k = ramp(t, T.zaehne - 0.15, T.zaehne + 1.2);
    d.visible = k > 0 && k < 1 && xr > 0.3;
    d.position.set(
      gumPos.x + Math.cos(a) * v * 0.25 * k,
      gumPos.y + up * 0.3 * k - 0.6 * k * k,
      gumPos.z + Math.sin(a) * v * 0.15 * k,
    );
  }
  // schnitzel: dissolves (shrinks), what's left moves out with the food
  for (const { f, x, y, z, ph } of food) {
    const dissolve = smooth(ramp(t, T.zerlegt, T.kaugummi2));
    const leave = easeInOut(ramp(t, T.essen - 0.1, T.ernicht + 0.3));
    f.visible = xr > 0.02 && t > T.schnitzel - 1.4 && leave < 1;
    const base = tmp.set(STOM.x + x, STOM.y - 0.08 + y, STOM.z + z);
    if (leave > 0) {
      const p = tripCurve.getPointAt(Math.min(0.999, leave * (0.25 + ph * 0.1)));
      base.lerp(p, Math.min(1, leave * 3));
    }
    f.position.copy(base);
    f.scale.setScalar(Math.max(0.01, (1 - dissolve * 0.6) * (1 - leave * 0.3)));
    f.rotation.y = t * 0.6 + ph * 6;
  }
  // sugar + mint fly out of the gum
  for (const { s, d, sp, ph } of sparks) {
    const k = ramp(t, T.zucker + ph * 0.6, T.zucker + ph * 0.6 + 1.3);
    s.visible = k > 0 && k < 1 && xr > 0.3;
    s.position.copy(gumPos).addScaledVector(d, k * sp);
    s.scale.setScalar(1 - k * 0.6);
    s.rotation.set(t * 5, t * 3, 0);
  }
  // the cleaning wave: ring travels from the stomach top through the exit
  const wk = ramp(t, T.putzwelle - 0.1, T.wandert + 0.4);
  wave.visible = wk > 0 && wk < 1 && xr > 0.3;
  if (wk <= 0.4) {
    // across the stomach towards the pylorus
    const k = wk / 0.4;
    wavePos.set(lerp(STOM.x + 0.35, PYLORUS.x, k), lerp(STOM.y + 0.1, PYLORUS.y, k), STOM.z + 0.05);
    wave.scale.setScalar(lerp(1.4, 0.6, k));
  } else {
    tripCurve.getPointAt(Math.min(0.999, ((wk - 0.4) / 0.6) * 0.3), wavePos);
    wave.scale.setScalar(0.45);
  }
  wave.position.copy(wavePos);
  wave.lookAt(tmp.copy(wavePos).add(V(1, -0.5, 0)));
  waveMat.opacity = 0.9 * Math.sin(Math.min(1, wk * 1.2) * Math.PI);
  // the stomach squeezes with the wave
  const squeeze = Math.sin(ramp(t, T.putzwelle - 0.1, T.putzwelle + 1.4) * Math.PI);
  stomach.scale.set(1.0 - squeeze * 0.12, 0.68 - squeeze * 0.1, 0.62);
  // warning: a pile of gums
  for (const { p, x, y, z, at } of pile) {
    const k = pop(t, T.staendig + 0.3 + at, T.verstopfen + 0.9, 0.25);
    p.visible = k > 0.01 && xr > 0.3;
    p.position.set(STOM.x + x, STOM.y - 0.06 + y, STOM.z + z);
    p.scale.setScalar(k);
  }
  showNope(
    pop(t, T.nichts + 0.1, T.wandert - 0.1),
    gumPos.x - 0.2,
    gumPos.y + 0.18,
    gumPos.z + 0.25,
    0.22,
  );

  // ---- props
  const lemonK = pop(t, T.zitrone, T.zerlegt + 0.3);
  lemon.visible = lemonTip.visible = lemonK > 0.01;
  lemon.scale.set(1.25 * lemonK, 0.95 * lemonK, 0.95 * lemonK);
  lemonTip.scale.setScalar(Math.max(0.001, lemonK));
  const glueK = t >= T.kunststoff ? 1 : 0;
  glue.visible = glueK > 0 && t < T.doch + 0.5;
  glue.scale.copy(squash(t, T.kunststoff));
  if (t >= T.doch)
    glue.scale.multiplyScalar(Math.max(0.001, 1 - inBack(ramp(t, T.doch, T.doch + 0.35))));
  puff("glue", t, T.kunststoff + 0.15, glue.position.x, SEAT, glue.position.z, 0.6);
  // calendar
  cal.visible = t >= T.sieben1;
  cal.scale.copy(squash(t, T.sieben1));
  const flip = ramp(t, T.tagen - 0.15, T.tagen + 0.35);
  const want = flip > 0.5 ? "tage" : "jahre";
  if (want !== calState) {
    drawCal(want);
    calState = want;
  }
  calPage.rotation.x = -0.12 - Math.sin(flip * Math.PI) * 1.4;
  showNope(
    pop(t, T.sieben2, T.tagen - 0.1),
    cal.position.x,
    SEAT + 0.48,
    cal.position.z + 0.3,
    0.55,
  );
  // WC door shuts on "normal"
  wcDoor.rotation.y = -1.3 * (1 - smooth(ramp(t, T.normal + 0.1, T.normal + 0.4)));
  // Stone-Age gum + DNA
  const stoneK = t >= T.fakt ? 1 : 0;
  stoneSet.visible = stoneK > 0;
  stoneSet.scale.copy(squash(t, T.fakt));
  const dna = smooth(ramp(t, T.erbgut - 0.4, T.erbgut + 0.4));
  helix.scale.set(dna + 0.001, dna + 0.001, dna + 0.001);
  helix.rotation.y = t * 1.4;

  // ---- LED panel: one fact at a time
  if (t >= T.zitrone && t < T.zerlegt + 0.3)
    showPanel(pop(t, T.zitrone, T.zerlegt + 0.3), "SAURER ALS", "ZITRONE", LED.green);
  else if (t >= T.kunststoff && t < T.doch)
    showPanel(pop(t, T.kunststoff, T.doch), "DER KERN", "KUNSTSTOFF", LED.yellow);
  else if (t >= T.darm && t < T.staendig)
    showPanel(pop(t, T.darm, T.staendig), "DARM", "METERLANG", LED.blue);
  else if (t >= T.kinder - 0.3 && t < T.darum)
    showPanel(pop(t, T.kinder - 0.3, T.darum), "VORSICHT BEI", "ZU VIELEN", LED.red);
  else if (t >= T.fakt + 0.3 && t < T.hast)
    showPanel(pop(t, T.fakt + 0.3, T.hast), "STEINZEIT-KAUGUMMI", "5.700 JAHRE", LED.yellow);
  else showPanel(0);

  labels(t, liveLabels);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
