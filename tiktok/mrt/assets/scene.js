// MRT (#26): the scanner at the origin (bore along z, opening towards +z),
// the patient on the sliding table, the water drop with the compass needles
// (analogy spot right), the monitor where the picture builds (left), and
// the oxygen bottle that flies into the magnet. Timing: beats.js.
import {
  THREE,
  ramp,
  smooth,
  pop,
  outBack,
  lerp,
  clamp01,
  V,
  rng,
  scene,
  flat,
  M,
  facet,
  facetMat,
  roundedRect,
  xrayMaterial,
  xrayEdges,
  setXray,
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
import { T, shots, LABELS, HIGHLIGHTS, DROP, MON, BOTTLE } from "./beats.js";

highlights(HIGHLIGHTS);

const F = (geo, mat, amt = 0.06, seed = 1) => new THREE.Mesh(facet(geo, amt, seed), facetMat(mat));
const shade = (o) => {
  o.traverse((m) => {
    if (m.isMesh) m.castShadow = m.receiveShadow = true;
  });
  return o;
};
const glowMat = (color, k = 0) => flat(color, { emissive: color, emissiveIntensity: k });
const basic = (color, opacity = 1) =>
  new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
const win = (t, a, b) => t >= a && t < b;

// ---------------------------------------------------------------- the scanner
const BC = 1.45; // bore centre height
const BR = 0.8; // bore radius
const mrt = new THREE.Group();
scene.add(mrt);
const shellMat = xrayMaterial(0xf2f5f7);
const trimMat = xrayMaterial(0x3b4a56);
const linerMat = xrayMaterial(0xe3eaee, { side: THREE.BackSide });
const stripeMat = xrayMaterial(0x3fa7a3);
const frontBits = new THREE.Group(); // control panel: hidden in x-ray
{
  const shape = roundedRect(3.1, 2.9, 0.75);
  const hole = new THREE.Path();
  hole.absarc(0, BC, BR, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 1.8,
    bevelEnabled: true,
    bevelThickness: 0.07,
    bevelSize: 0.06,
    bevelSegments: 2,
    curveSegments: 28,
  });
  const shell = new THREE.Mesh(geo, shellMat);
  shell.position.z = -0.9;
  shell.castShadow = true;
  mrt.add(shell);
  const edges = xrayEdges(geo);
  edges.position.z = -0.9;
  mrt.add(edges);
  // dark trim ring around the opening (front and back)
  for (const z of [0.98, -0.98]) {
    const ring = new THREE.Mesh(new THREE.RingGeometry(BR, BR + 0.22, 40), trimMat);
    ring.position.set(0, BC, z);
    if (z < 0) ring.rotation.y = Math.PI;
    mrt.add(ring);
  }
  const liner = new THREE.Mesh(new THREE.CylinderGeometry(BR, BR, 1.96, 40, 1, true), linerMat);
  liner.rotation.x = Math.PI / 2;
  liner.position.y = BC;
  mrt.add(liner);
  // plinth
  const plinth = F(new THREE.BoxGeometry(3.3, 0.14, 2.1), flat(0x8fa0a8), 0.04, 3);
  plinth.position.y = 0.07;
  mrt.add(plinth);
  // a teal stripe across the top, the maker's look
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 1.82), stripeMat);
  stripe.position.set(0, 2.94, 0);
  mrt.add(stripe);
}
// glowing ring light around the opening (pulses with the knocks)
const ringLightMat = glowMat(0x4fd8ff, 1.2);
const ringLight = new THREE.Mesh(new THREE.TorusGeometry(BR + 0.11, 0.035, 8, 48), ringLightMat);
ringLight.position.set(0, BC, 1.0);
ringLight.userData.noAO = true;
mrt.add(ringLight);
// control panel with the start button (your finger presses it)
const btnMat = glowMat(0x3dff7a, 0.2);
{
  const p = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.3, 0.06), flat(0x2a3138));
  p.position.set(1.12, 2.1, 0.99);
  frontBits.add(p);
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.05, 12), btnMat);
  b.rotation.x = Math.PI / 2;
  b.position.set(1.04, 2.1, 1.03);
  frontBits.add(b);
  const b2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.05, 12),
    glowMat(0xff4b2b, 0.6),
  );
  b2.rotation.x = Math.PI / 2;
  b2.position.set(1.22, 2.1, 1.03);
  frontBits.add(b2);
  mrt.add(frontBits);
}
shade(mrt);
mrt.traverse((o) => {
  if (o.material === linerMat) o.castShadow = false;
});

// inside: the main magnet (thick superconducting coil), three gradient coils
// (green / pink / yellow), the radio coil (birdcage) — seen in x-ray
const inner = new THREE.Group();
inner.position.y = BC;
mrt.add(inner);
const magnetMat = new THREE.MeshStandardMaterial({
  color: 0xc8743c,
  metalness: 0.6,
  roughness: 0.35,
  emissive: 0x4fc3ff,
  emissiveIntensity: 0,
  transparent: true,
});
for (let i = 0; i < 6; i++) {
  const c = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.11, 10, 48), magnetMat);
  c.position.z = -0.72 + i * 0.288;
  inner.add(c);
}
const gradCols = [0x3dff7a, 0xff4fd8, 0xffd23f];
const gradMats = gradCols.map((c) => glowMat(c, 0.3));
const gradCoils = gradMats.map((m, i) => {
  const c = new THREE.Mesh(new THREE.TorusGeometry(0.97, 0.055, 8, 48), m);
  c.position.z = -0.55 + i * 0.55;
  inner.add(c);
  return c;
});
const rfMat = new THREE.MeshStandardMaterial({
  color: 0xd9a441,
  metalness: 0.6,
  roughness: 0.3,
  emissive: 0xff8a2a,
  emissiveIntensity: 0,
});
const rf = new THREE.Group();
inner.add(rf);
for (const z of [-0.62, 0.62]) {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.028, 6, 40), rfMat);
  ring.position.z = z;
  rf.add(ring);
}
for (let i = 0; i < 10; i++) {
  const a = (i / 10) * Math.PI * 2;
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.24, 5), rfMat);
  rod.rotation.x = Math.PI / 2;
  rod.position.set(Math.cos(a) * 0.86, Math.sin(a) * 0.86, 0);
  rf.add(rod);
}

// ---------------------------------------------------------------- table + patient
{
  const ped = F(new THREE.BoxGeometry(0.46, 0.84, 1.5), flat(0x9fb0b8), 0.04, 11);
  ped.position.set(0, 0.42, 2.45);
  mrt.add(shade(ped));
  const foot = F(new THREE.BoxGeometry(0.7, 0.08, 1.7), flat(0x8fa0a8), 0.04, 12);
  foot.position.set(0, 0.04, 2.45);
  mrt.add(shade(foot));
}
const bed = new THREE.Group();
mrt.add(bed);
{
  const slab = F(new THREE.BoxGeometry(0.8, 0.1, 2.5), flat(0xeef2f4), 0.04, 13);
  slab.position.y = 0.98;
  bed.add(slab);
  const pad = F(new THREE.BoxGeometry(0.72, 0.07, 2.4), flat(0x7fc4e0), 0.05, 14);
  pad.position.y = 1.065;
  bed.add(pad);
}
// the patient, head first towards the magnet, hearing protection on
const patient = new THREE.Group();
bed.add(patient);
{
  const skin = flat(0xf0bf98);
  const gown = flat(0x9fd0ec);
  const y0 = 1.1;
  const torso = F(new THREE.CylinderGeometry(0.24, 0.22, 0.8, 9), gown, 0.06, 21);
  torso.rotation.x = Math.PI / 2;
  torso.scale.set(1.15, 1, 0.6);
  torso.position.set(0, y0 + 0.14, -0.42);
  patient.add(torso);
  const head = F(new THREE.IcosahedronGeometry(0.16, 1), skin, 0.06, 22);
  head.position.set(0, y0 + 0.17, -1.0);
  patient.add(head);
  const hair = F(new THREE.IcosahedronGeometry(0.168, 1), flat(0x5a3a26), 0.06, 23);
  hair.scale.set(1, 0.85, 0.8);
  hair.position.set(0, y0 + 0.13, -1.06);
  patient.add(hair);
  const muffMat = flat(0xff6fa8);
  for (const s of [-1, 1]) {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.07, 10), muffMat);
    cup.rotation.z = Math.PI / 2;
    cup.position.set(s * 0.17, y0 + 0.17, -1.0);
    patient.add(cup);
  }
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.02, 5, 12, Math.PI), muffMat);
  band.position.set(0, y0 + 0.17, -1.0);
  band.rotation.y = Math.PI / 2;
  patient.add(band);
  for (const s of [-1, 1]) {
    const arm = F(new THREE.CylinderGeometry(0.065, 0.06, 0.62, 6), gown, 0.06, 24 + s);
    arm.rotation.x = Math.PI / 2;
    arm.position.set(s * 0.31, y0 + 0.08, -0.4);
    patient.add(arm);
    const palm = F(new THREE.IcosahedronGeometry(0.055, 0), skin, 0.06, 31 + s);
    palm.position.set(s * 0.31, y0 + 0.08, -0.06);
    patient.add(palm);
    const leg = F(new THREE.CylinderGeometry(0.085, 0.07, 0.86, 7), gown, 0.06, 26 + s);
    leg.rotation.x = Math.PI / 2;
    leg.position.set(s * 0.11, y0 + 0.09, 0.4);
    patient.add(leg);
    const footM = F(new THREE.BoxGeometry(0.1, 0.16, 0.08), flat(0xffffff), 0.06, 28 + s);
    footM.position.set(s * 0.11, y0 + 0.17, 0.86);
    patient.add(footM);
  }
  // a teal blanket over the legs
  const blanket = F(new THREE.BoxGeometry(0.5, 0.06, 0.7), flat(0x3fa7a3), 0.06, 30);
  blanket.position.set(0, y0 + 0.19, 0.42);
  patient.add(blanket);
}
shade(bed);
// table slide: out (hook start) → head in → belly in the centre → out again
const BED_OUT = 2.15;
const bedZ = (t) => {
  let z = BED_OUT;
  z = lerp(z, 1.35, smooth(ramp(t, 0.35, 2.6)));
  z = lerp(z, 0.05, smooth(ramp(t, T.tunnel, T.tunnel + 0.75)));
  z = lerp(z, 1.75, smooth(ramp(t, T.daher + 0.3, T.fakt + 0.4)));
  return z;
};

// ---------------------------------------------------------------- knocking rings
// sound rings pushing out of the bore while the gradient coils knock
const knockRings = Array.from({ length: 5 }, () => {
  const m = new THREE.Mesh(new THREE.TorusGeometry(BR * 0.95, 0.018, 6, 40), basic(0x8fe8ff, 0));
  m.userData.noAO = true;
  mrt.add(m);
  return m;
});
// how loud the knocking is
const knock = (t) =>
  Math.max(
    t < T.trotzdem ? 0.6 : 0,
    pop(t, T.trotzdem, T.indir, 0.15),
    0.35 * pop(t, T.spulen, T.jede, 0.15),
    pop(t, T.zittern, T.fakt, 0.2),
  );

// ---------------------------------------------------------------- field lines
// blue loops out of the bore and around the magnet (the magnet beat + follow line)
const fieldMat = basic(0x6fd4ff, 0);
const fieldLines = [];
for (let i = 0; i < 8; i++) {
  const th = (i / 8) * Math.PI * 2 + 0.2;
  const u = V(Math.cos(th), Math.sin(th), 0);
  const pts = [];
  for (let k = 0; k <= 60; k++) {
    const ph = (k / 60) * Math.PI * 2;
    const rr = 2.0 - 1.75 * Math.cos(ph);
    pts.push(
      u
        .clone()
        .multiplyScalar(rr)
        .add(V(0, BC, 2.5 * Math.sin(ph))),
    );
  }
  const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 120, 0.022, 5, true);
  const m = new THREE.Mesh(geo, fieldMat);
  m.userData.noAO = true;
  mrt.add(m);
  fieldLines.push(m);
}

// ---------------------------------------------------------------- radio pulse rings
const rfRings = Array.from({ length: 3 }, () => {
  const m = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.04, 6, 40), basic(0xffa83a, 0));
  m.position.y = BC;
  m.userData.noAO = true;
  mrt.add(m);
  return m;
});

// ---------------------------------------------------------------- rainbow slices
// every slice of the body "sings" in its own tone
const slices = Array.from({ length: 7 }, (_, i) => {
  const c = new THREE.Color().setHSL(i / 7, 0.9, 0.58);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.66, 0.06, 32), basic(c, 0));
  m.rotation.x = Math.PI / 2;
  m.position.set(0, BC, -0.78 + i * 0.26);
  m.userData.noAO = true;
  mrt.add(m);
  return m;
});

// ---------------------------------------------------------------- echo rings
// "where does each echo come from?" — little rings flying out of the bore
const echoR = rng(61);
const echoes = Array.from({ length: 9 }, (_, i) => {
  const c = new THREE.Color().setHSL(echoR(), 0.85, 0.62);
  const m = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 5, 20), basic(c, 0));
  m.userData = {
    dir: V(echoR() * 2 - 1, echoR() * 1.2 - 0.3, 1.2).normalize(),
    ph: i / 9,
    noAO: true,
  };
  mrt.add(m);
  return m;
});

// ---------------------------------------------------------------- the water drop
const drop = new THREE.Group();
drop.position.set(...DROP);
scene.add(drop);
const dropR = 1.35;
{
  const water = new THREE.Mesh(
    new THREE.IcosahedronGeometry(dropR, 3),
    new THREE.MeshStandardMaterial({
      color: 0x7cc7f2,
      roughness: 0.05,
      metalness: 0.1,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      flatShading: true,
    }),
  );
  water.userData.noAO = true;
  drop.add(water);
  const rim = new THREE.Mesh(
    new THREE.IcosahedronGeometry(dropR * 1.003, 3),
    new THREE.MeshBasicMaterial({
      color: 0xbfeaff,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    }),
  );
  drop.add(rim);
  // a glint
  const glint = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), basic(0xffffff, 0.45));
  glint.scale.set(1.0, 0.45, 0.3);
  glint.position.set(-0.62, 0.78, 0.92);
  drop.add(glint);
}
// compass needles: red tip, white tail, built along +y
const needleR = rng(77);
const tipMat = flat(0xe2453c, { emissive: 0xe2453c, emissiveIntensity: 0.25 });
const tailMat = flat(0xf6f6f6);
const needles = [];
for (let tries = 0; needles.length < 44 && tries < 2000; tries++) {
  const p = V(needleR() * 2 - 1, needleR() * 2 - 1, needleR() * 2 - 1).multiplyScalar(0.98);
  if (p.length() > 0.98) continue;
  if (needles.some((n) => n.position.distanceTo(p) < 0.3)) continue;
  const g = new THREE.Group();
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.19, 6), tipMat);
  tip.position.y = 0.095;
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.19, 6), tailMat);
  tail.position.y = -0.095;
  tail.rotation.x = Math.PI;
  g.add(tip, tail);
  g.position.copy(p);
  g.userData = {
    a: needleR() * 6.28,
    b: needleR() * 6.28,
    c: needleR() * 6.28,
    w1: 1.5 + needleR() * 2.5,
    w2: 1 + needleR() * 2,
    d: ((p.x + 1) / 2) * 0.32 + needleR() * 0.05, // the wave runs left → right
  };
  drop.add(g);
  needles.push(g);
}
const qA = new THREE.Quaternion();
const qB = new THREE.Quaternion();
const qUp = new THREE.Quaternion();
const eul = new THREE.Euler();
const yAxis = V(0, 1, 0);
// echo rings out of the drop when the needles snap back
const dropRings = Array.from({ length: 4 }, () => {
  const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.03, 6, 48), basic(0x6fffd2, 0));
  m.userData.noAO = true;
  drop.add(m);
  return m;
});
const dropShots = (t) =>
  win(t, T.indir, T.tunnel) || win(t, T.zack, T.das2) || win(t, T.alle2, T.ein2);

// ---------------------------------------------------------------- the monitor
const monitor = new THREE.Group();
monitor.position.set(MON[0], 0, MON[1]);
monitor.rotation.y = MON[2];
scene.add(monitor);
const SCR_W = 1.18;
const SCR_H = 1.6;
const scrCanvas = document.createElement("canvas");
scrCanvas.width = 384;
scrCanvas.height = 520;
const scrTex = new THREE.CanvasTexture(scrCanvas);
scrTex.colorSpace = THREE.SRGBColorSpace;
{
  const dark = flat(0x2a3138, { roughness: 0.4 });
  const base = F(new THREE.CylinderGeometry(0.55, 0.6, 0.1, 5), dark, 0.05, 41);
  base.position.y = 0.12;
  monitor.add(base);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const w = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 5), M.rubber);
    w.position.set(Math.cos(a) * 0.5, 0.07, Math.sin(a) * 0.5);
    monitor.add(w);
  }
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.4, 8), M.steel);
  pole.position.y = 0.85;
  monitor.add(pole);
  const housing = F(new THREE.BoxGeometry(SCR_W + 0.14, SCR_H + 0.14, 0.12), dark, 0.04, 42);
  housing.position.y = 2.3;
  monitor.add(housing);
  const scr = new THREE.Mesh(
    new THREE.PlaneGeometry(SCR_W, SCR_H),
    new THREE.MeshBasicMaterial({ map: scrTex, toneMapped: false }),
  );
  scr.position.set(0, 2.3, 0.062);
  scr.userData.noAO = true;
  monitor.add(scr);
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 4), glowMat(0x3dff7a, 2));
  led.position.set(0.5, 1.5, 0.07);
  monitor.add(led);
}
shade(monitor);
// The scan: a front view of a body in MRT greys (fat bright, lungs dark).
// reveal 0..1 = how much has been scanned (slice by slice from the top);
// sparkle 0..1 = blue water dots glinting over it.
function drawBody(g) {
  const W = 384;
  g.save();
  g.translate(W / 2, 0);
  const fill = (c, f) => {
    g.fillStyle = c;
    g.beginPath();
    f();
    g.fill();
  };
  // body outline (bright fat layer) then the inside
  fill("#d9e8f0", () => {
    g.ellipse(0, 78, 46, 56, 0, 0, Math.PI * 2);
  });
  fill("#d9e8f0", () => {
    g.moveTo(-26, 126);
    g.lineTo(26, 126);
    g.lineTo(30, 150);
    g.quadraticCurveTo(118, 150, 124, 196);
    g.lineTo(134, 400);
    g.lineTo(104, 404);
    g.lineTo(96, 260);
    g.lineTo(92, 380);
    g.quadraticCurveTo(80, 440, 62, 520);
    g.lineTo(-62, 520);
    g.quadraticCurveTo(-80, 440, -92, 380);
    g.lineTo(-96, 260);
    g.lineTo(-104, 404);
    g.lineTo(-134, 400);
    g.lineTo(-124, 196);
    g.quadraticCurveTo(-118, 150, -30, 150);
    g.closePath();
  });
  fill("#8ea7b6", () => {
    g.ellipse(0, 80, 38, 47, 0, 0, Math.PI * 2);
  });
  // brain folds
  g.strokeStyle = "#c3d6e1";
  g.lineWidth = 3;
  for (let i = 0; i < 6; i++) {
    g.beginPath();
    g.arc(0, 80, 10 + i * 5, Math.PI * (1.1 + i * 0.07), Math.PI * (1.9 - i * 0.05));
    g.stroke();
  }
  fill("#7f98a8", () => {
    g.moveTo(-82, 172);
    g.quadraticCurveTo(0, 160, 82, 172);
    g.lineTo(78, 470);
    g.lineTo(-78, 470);
    g.closePath();
  });
  // lungs
  fill("#1b2d3a", () => {
    g.ellipse(-40, 236, 30, 62, 0.08, 0, Math.PI * 2);
  });
  fill("#1b2d3a", () => {
    g.ellipse(40, 236, 30, 62, -0.08, 0, Math.PI * 2);
  });
  // heart, liver, kidneys
  fill("#a9bfcc", () => {
    g.ellipse(12, 262, 24, 30, 0.5, 0, Math.PI * 2);
  });
  fill("#c8dbe6", () => {
    g.ellipse(-30, 330, 46, 28, -0.2, 0, Math.PI * 2);
  });
  fill("#5f7a8c", () => {
    g.ellipse(-36, 372, 13, 22, 0.2, 0, Math.PI * 2);
  });
  fill("#5f7a8c", () => {
    g.ellipse(36, 372, 13, 22, -0.2, 0, Math.PI * 2);
  });
  // spine
  g.fillStyle = "#eef7fb";
  for (let y = 160; y < 470; y += 17) g.fillRect(-6, y, 12, 12);
  // pelvis
  g.strokeStyle = "#eef7fb";
  g.lineWidth = 7;
  g.beginPath();
  g.arc(0, 440, 54, Math.PI * 1.05, Math.PI * 1.95);
  g.stroke();
  g.restore();
}
let scrKey = "";
function drawScreen(reveal, sparkle, frameNo) {
  const key = `${reveal.toFixed(3)}|${sparkle.toFixed(2)}|${sparkle > 0 ? frameNo : 0}`;
  if (key === scrKey) return;
  scrKey = key;
  const g = scrCanvas.getContext("2d");
  const W = scrCanvas.width;
  const H = scrCanvas.height;
  g.fillStyle = "#02101a";
  g.fillRect(0, 0, W, H);
  const yCut = 30 + reveal * (H - 30);
  g.save();
  g.beginPath();
  g.rect(0, 0, W, yCut);
  g.clip();
  g.save();
  g.translate(0, 18);
  g.scale(1, 0.94);
  drawBody(g);
  g.restore();
  // slice lines over the scanned part
  g.fillStyle = "rgba(2,16,26,0.35)";
  for (let y = 0; y < yCut; y += 26) g.fillRect(0, y, W, 2);
  g.restore();
  // the scan line
  if (reveal > 0 && reveal < 1) {
    const grd = g.createLinearGradient(0, yCut - 40, 0, yCut);
    grd.addColorStop(0, "rgba(61,255,210,0)");
    grd.addColorStop(1, "rgba(61,255,210,0.85)");
    g.fillStyle = grd;
    g.fillRect(0, yCut - 40, W, 40);
    g.fillStyle = "#3dffd2";
    g.fillRect(0, yCut - 3, W, 4);
  }
  // water dots: the picture is made of the water in you
  if (sparkle > 0) {
    const r = rng(1 + frameNo);
    for (let i = 0; i < 160; i++) {
      const x = r() * W;
      const y = 30 + r() * (yCut - 30);
      const s = 2 + r() * 4;
      g.fillStyle = `rgba(90,200,255,${(0.5 + r() * 0.5) * sparkle})`;
      g.beginPath();
      g.arc(x, y, s, 0, Math.PI * 2);
      g.fill();
    }
  }
  // HUD
  g.fillStyle = "#3dff7a";
  g.font = '800 22px "Montserrat", sans-serif';
  g.fillText("MRT · T2", 14, 28);
  g.fillStyle = "#7fa8bf";
  g.font = '700 18px "Montserrat", sans-serif';
  g.fillText(`Schicht ${Math.max(1, Math.round(reveal * 24))}/24`, 14, H - 14);
  scrTex.needsUpdate = true;
}

// ---------------------------------------------------------------- oxygen bottle
const cart = new THREE.Group();
cart.position.set(BOTTLE[0], 0, BOTTLE[1]);
cart.rotation.y = 0.7;
scene.add(cart);
{
  const steel = flat(0x9aa6ad, { metalness: 0.5, roughness: 0.4 });
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.4), steel);
  plate.position.y = 0.12;
  cart.add(plate);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.2, 0.05), steel);
  back.position.set(0, 0.7, -0.2);
  cart.add(back);
  const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.02, 5, 14, Math.PI), steel);
  hoop.position.set(0, 0.95, 0);
  hoop.rotation.x = -Math.PI / 2;
  cart.add(hoop);
  for (const s of [-1, 1]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 10), M.rubber);
    w.rotation.z = Math.PI / 2;
    w.position.set(s * 0.25, 0.09, -0.15);
    cart.add(w);
  }
}
shade(cart);
const bottle = new THREE.Group();
scene.add(bottle);
{
  const body = F(
    new THREE.CylinderGeometry(0.17, 0.17, 0.95, 12),
    flat(0x4f9f7a, { roughness: 0.4 }),
    0.04,
    51,
  );
  bottle.add(body);
  const shoulder = F(
    new THREE.SphereGeometry(0.17, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2),
    flat(0xffffff, { roughness: 0.35 }),
    0.04,
    52,
  );
  shoulder.position.y = 0.475;
  bottle.add(shoulder);
  const valve = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.16, 8), M.chrome);
  valve.position.y = 0.7;
  bottle.add(valve);
  const gauge = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 12), flat(0xffffff));
  gauge.rotation.x = Math.PI / 2;
  gauge.position.set(0, 0.74, 0.07);
  bottle.add(gauge);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 5, 12), M.chrome);
  ring.position.set(0, 0.74, 0.085);
  bottle.add(ring);
}
shade(bottle);
const B0 = V(BOTTLE[0], 0.66, BOTTLE[1] - 0.02);
const B1 = V(-0.95, 2.2, 1.12); // stuck on the magnet's face, left of the bore
const bq0 = new THREE.Quaternion();
const bq1 = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0.5));

// ---------------------------------------------------------------- the hand
const hand = createHand({ scale: 0.6 });
const R = [0.15, Math.PI, 0];

const applyCamera = shotCamera(shots, 1);

// ---------------------------------------------------------------- render
function renderAt(t) {
  // your hand presses the start button
  hand.track(t, [
    { t: -0.7, pos: [1.6, 2.35, 2.3], rot: R, pose: "open" },
    { t: 0, pos: [1.25, 2.2, 1.62], rot: R, pose: "point" },
    { t: 0.4, pos: [1.06, 2.12, 1.34], rot: R, pose: "press" },
    { t: 0.75, pos: [1.15, 2.18, 1.5], rot: R, pose: "point" },
    { t: T.foto, pos: [1.5, 2.3, 2.0], rot: R, pose: "open", out: true },
  ]);
  btnMat.emissiveIntensity = t >= 0.4 && t < T.trotzdem ? 2.2 : 0.3;

  // knocking: rings, shudder, ring light
  const kn = knock(t);
  const shud =
    kn * 0.006 + 0.02 * pop(t, T.zittern, T.fakt, 0.1) + 0.012 * pop(t, T.trotzdem, T.indir, 0.1);
  const beat = Math.abs(Math.sin(t * Math.PI * 6.25));
  mrt.position.set(Math.sin(t * 83) * shud * beat, Math.sin(t * 61 + 1) * shud * 0.5 * beat, 0);
  knockRings.forEach((m, k) => {
    const ph = (((t * 1.6 + k / 5) % 1) + 1) % 1;
    m.position.set(0, BC, 1.05 + ph * 1.6);
    m.scale.setScalar(1 + ph * 0.7);
    m.material.opacity = kn * (1 - ph) * 0.55;
    m.visible = kn > 0.01;
  });
  ringLightMat.emissiveIntensity = 1.0 + kn * beat * 2.2;

  // table
  bed.position.z = bedZ(t);

  // x-ray: the magnet beat + radio pulse, and the coils + payoff
  const xr = Math.max(
    smooth(ramp(t, T.das2 + 0.15, T.magnet + 0.15)) * (t < T.alle2 ? 1 : 0),
    smooth(ramp(t, T.spulen - 0.05, T.spulen + 0.25)) * (t < T.daher ? 1 : 0),
  );
  setXray([shellMat, trimMat, linerMat, stripeMat], xr);
  inner.visible = xr > 0.01;
  frontBits.visible = xr < 0.5;
  magnetMat.emissiveIntensity = 1.4 * pop(t, T.magnet, T.dann, 0.3);
  // after its own beat the big magnet turns to a ghost so the coils inside read
  const ghost = t >= T.dann - 0.05;
  magnetMat.opacity = ghost ? 0.16 : 1;
  magnetMat.depthWrite = !ghost;

  // field lines grow from the magnet word, gone after the follow line
  const fl = smooth(ramp(t, T.magnet + 0.2, T.zahl + 1.2));
  fieldMat.opacity = 0.7 * pop(t, T.magnet + 0.2, T.dann, 0.25);
  fieldLines.forEach((m, i) => {
    m.visible = fieldMat.opacity > 0.01;
    const n = m.geometry.index ? m.geometry.index.count : 0;
    m.geometry.setDrawRange(0, Math.floor(n * clamp01(fl * 1.15 - i * 0.02)));
    m.rotation.z = t * 0.05;
  });

  // radio pulse: coil glows, rings close in on the body
  rfMat.emissiveIntensity = 2.4 * pop(t, T.funk - 0.05, T.alle2, 0.15);
  rfRings.forEach((m, k) => {
    const ph = clamp01((t - T.funk - k * 0.22) / 0.6);
    const on = t >= T.funk + k * 0.22 && t < T.alle2;
    m.visible = on;
    m.scale.setScalar(Math.max(0.05, 1 - ph * 0.85));
    m.position.z = lerp(0.6, -0.2, ph) * (k % 2 ? -1 : 1);
    m.material.opacity = on ? 0.9 * (1 - ph * 0.6) : 0;
  });

  // gradient coils: blink one after another, then shake (payoff)
  const coilsOn = win(t, T.spulen, T.daher);
  const shake = pop(t, T.zittern, T.fakt, 0.1);
  gradCoils.forEach((c, i) => {
    const sw = Math.floor((t - T.spulen) * (t > T.blitz ? 9 : 3.5)) % 3 === i;
    gradMats[i].emissiveIntensity = coilsOn
      ? (sw ? 3.0 : 0.5) + shake * 1.5 * Math.abs(Math.sin(t * 40 + i))
      : 0.3;
    c.position.x = Math.sin(t * 97 + i * 2) * 0.035 * shake;
    c.position.y = Math.sin(t * 71 + i) * 0.03 * shake;
    c.scale.setScalar(1 + Math.sin(t * 120 + i) * 0.02 * shake);
  });

  // rainbow slices: each part of the body in its own tone
  slices.forEach((m, i) => {
    const on = pop(t, T.jede + i * 0.08, T.und1, 0.2);
    m.visible = on > 0.01;
    const f = 3 + i * 1.3;
    m.material.opacity = on * (0.35 + 0.25 * Math.abs(Math.sin(t * f)));
    m.scale.set(1 + 0.06 * Math.sin(t * f * 2), 1, 1 + 0.06 * Math.sin(t * f * 2));
  });

  // echoes flying out of the bore (the "where from?" beat)
  const eo = pop(t, T.aber, T.spulen, 0.2);
  echoes.forEach((m) => {
    const { dir, ph } = m.userData;
    const k = (((t * 0.7 + ph) % 1) + 1) % 1;
    m.visible = eo > 0.01;
    m.position.set(dir.x * k * 2.6, BC + dir.y * k * 2.6, 0.6 + dir.z * k * 2.6);
    m.scale.setScalar(0.6 + k * 1.6);
    m.material.opacity = eo * (1 - k);
  });

  // the water drop: needles tumble → snap into line → tip over → snap back
  const dv = dropShots(t);
  drop.visible = dv;
  if (dv) {
    drop.scale.copy(squash(t, T.indir, 0.6));
    drop.rotation.y = Math.sin(t * 0.4) * 0.12;
    const tipK = smooth(ramp(t, T.alle2 + 0.05, T.alle2 + 0.4));
    const ph = t * 5.5;
    for (const n of needles) {
      const u = n.userData;
      eul.set(u.a + t * u.w1, u.b + t * u.w2, u.c + t * 0.7);
      qA.setFromEuler(eul);
      const al = smooth(ramp(t, T.zack + u.d, T.zack + u.d + 0.22));
      // aligned: up, with a tiny shared precession wobble
      qUp.setFromEuler(eul.set(Math.sin(t * 3 + u.a) * 0.06, 0, Math.cos(t * 3 + u.a) * 0.06));
      qA.slerp(qUp, al);
      if (tipK > 0) {
        const back = outBack(ramp(t, T.zurueck + u.d * 0.6, T.zurueck + u.d * 0.6 + 0.35));
        const k = tipK * (1 - back);
        // tipped: lying flat, all spinning together around the up axis
        qB.setFromUnitVectors(yAxis, V(Math.cos(ph), 0.12, Math.sin(ph)).normalize());
        qA.slerp(qB, Math.min(1, k));
      }
      n.quaternion.copy(qA);
    }
    dropRings.forEach((m, k) => {
      const a = T.zurueck + 0.15 + k * 0.32;
      const p = clamp01((t - a) / 1.1);
      m.visible = t >= a && p < 1;
      m.scale.setScalar(0.5 + p * 1.6);
      m.material.opacity = 0.85 * (1 - p);
    });
  }

  // monitor: the picture of water (hook), slice by slice (echo beat)
  let reveal = 1;
  if (t < T.foto + 0.9) reveal = smooth(ramp(t, T.foto - 0.05, T.foto + 0.85));
  if (t >= T.alle2 && t < T.aber) reveal = ramp(t, T.ein2 + 0.05, T.aber - 0.1);
  const sparkle = pop(t, T.wasser - 0.1, T.trotzdem, 0.12);
  drawScreen(reveal, sparkle, Math.floor(t * 12));

  // the bottle: rattles, then flies into the magnet and sticks
  const pull = ramp(t, T.flasche + 0.4, T.quer);
  const fly = ramp(t, T.quer, T.klonk);
  if (t < T.quer) {
    bottle.position.copy(B0);
    const r = 0.05 * pull * Math.sin(t * 38);
    bottle.quaternion.setFromEuler(eul.set(r * 0.5, 0, r - 0.12 * pull));
    bottle.position.x += 0.04 * pull;
  } else if (t < T.klonk) {
    const e = fly * fly * fly; // the pull grows the closer it gets
    bottle.position.lerpVectors(B0, B1, e);
    bottle.position.y += Math.sin(fly * Math.PI) * 0.5;
    bottle.quaternion.slerpQuaternions(bq0, bq1, smooth(fly));
  } else {
    bottle.position.copy(B1);
    const k = ramp(t, T.klonk, T.klonk + 0.4);
    bottle.position.z += Math.sin(k * Math.PI * 3) * (1 - k) * 0.06;
    bottle.quaternion.copy(bq1);
  }
  puff("klonk", t, T.klonk, B1.x, B1.y - 0.1, B1.z + 0.1, 0.5);

  // LED facts
  if (t >= T.zahl + 0.35 && t < T.folg) {
    showPanel(pop(t, T.zahl + 0.35, T.folg - 0.1), "× STÄRKER ALS DIE ERDE", "60.000", LED.yellow);
  } else if (t >= T.fakt && t < T.flasche) {
    showPanel(pop(t, T.fakt + 0.15, T.flasche - 0.1), "DER MAGNET IST AN", "24/7", LED.green);
  } else {
    showPanel(0);
  }

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
