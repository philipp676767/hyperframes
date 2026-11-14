// #91 Flugmodus — "Was passiert, wenn du den Flugmodus vergisst?"
// Three places: the window seat (your hand + phone, the wing over the
// landscape at sunset), the airliner outside above the miniature landscape
// (cell towers, the peak, the airport) and the cockpit (pilot + headset).
import {
  THREE,
  ramp,
  smooth,
  lerp,
  clamp01,
  pop,
  V,
  rng,
  scene,
  flat,
  real,
  roundedBox,
  roundedRect,
  xrayMaterial,
  setXray,
  showNope,
  labels,
  puff,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { towerTops, TOWERS } from "./set.js";
import { createHand } from "./hand.js";
import { gauge } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);
const R0 = rng(9101);

// ================================================================ places
const CAB = V(40, 26, 0); // window seat (local: window wall at x = -1.3, forward = -z)
const CKP = V(40, 26, 32); // cockpit (local: pilot faces -x, side window at +z)
const PLANE_POS = V(0, 11, 0);
for (const s of shots) {
  if (s.rel === "plane") s.rel = PLANE_POS;
  else if (s.where === "cab") s.rel = CAB;
  else if (s.where === "ckp") s.rel = CKP;
}
const whereAt = (t) => {
  let i = shots.length - 1;
  while (i > 0 && shots[i].at > t) i--;
  return shots[i].where;
};

const add = (parent, geo, mat, x = 0, y = 0, z = 0, shadow = true) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};
const glowMat = (color, op = 1) =>
  new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: op,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

// ================================================================ the airliner
// built at unit scale (nose +x at x = 4, tail x = -4), group scaled 0.45
const plane = new THREE.Group();
scene.add(plane);
const pBody = new THREE.Group(); // pitch / roll pivot
plane.add(pBody);
const R = 0.38;
function ringOf(x) {
  // radius + centre height along the fuselage (nose droop, tail upsweep)
  if (x > 2.55) {
    const k = clamp01((x - 2.55) / 1.45);
    return { r: Math.max(0.004, R * Math.pow(1 - k * k, 0.5)), y: -0.07 * k };
  }
  if (x < -2.1) {
    const k = clamp01((-2.1 - x) / 1.9);
    return { r: lerp(R, 0.07, Math.pow(k, 1.1)), y: 0.24 * Math.pow(k, 1.3) };
  }
  return { r: R, y: 0 };
}
function fuselageGeo() {
  const NX = 120;
  const NA = 56;
  const pos = [];
  const idx = [];
  for (let i = 0; i <= NX; i++) {
    const x = -4 + (8 * i) / NX;
    const { r, y } = ringOf(x);
    for (let j = 0; j <= NA; j++) {
      const a = (j / NA) * Math.PI * 2;
      // slightly oval: a touch taller than wide
      pos.push(x, y + Math.sin(a) * r * 1.04, Math.cos(a) * r);
    }
  }
  for (let i = 0; i < NX; i++)
    for (let j = 0; j < NA; j++) {
      const a = i * (NA + 1) + j;
      const b = a + NA + 1;
      idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
const fuseMat = xrayMaterial(0xf6f7f9, { roughness: 0.26, metalness: 0.08 });
add(pBody, fuselageGeo(), fuseMat);
const paint = real.gloss(0xf6f7f9, { roughness: 0.26 });
const greyPaint = real.metal(0xd9dde3, { roughness: 0.42 });
const blue = real.gloss(0x1d3c8c, { roughness: 0.28 });
const darkGlass = real.gloss(0x141a24, { roughness: 0.08, metalness: 0.4 });
// cabin windows (instanced) on both sides + a blue cheat line
{
  const wg = new THREE.ShapeGeometry(roundedRect(0.075, 0.1, 0.032), 6);
  const list = [];
  for (let x = -2.3; x <= 2.45; x += 0.2) for (const s of [-1, 1]) list.push([x, s]);
  const inst = new THREE.InstancedMesh(wg, darkGlass, list.length);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  list.forEach(([x, s], i) => {
    q.setFromEuler(new THREE.Euler(0, s > 0 ? 0 : Math.PI, 0));
    m4.compose(V(x, 0.09, s * (R * 0.985 + 0.004)), q, V(1, 1, 1));
    inst.setMatrixAt(i, m4);
  });
  pBody.add(inst);
  for (const s of [-1, 1]) {
    const band = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 0.035), blue);
    band.position.set(0.05, -0.02, s * (R * 0.99 + 0.003));
    band.rotation.y = s > 0 ? 0 : Math.PI;
    pBody.add(band);
    // doors: thin dark outlines
    for (const dx of [2.25, -1.95]) {
      const door = new THREE.Mesh(
        new THREE.ShapeGeometry(roundedRect(0.16, 0.3, 0.05), 4),
        flat(0xc9ccd2, { roughness: 0.4 }),
      );
      door.position.set(dx, 0.04, s * (R * 0.99 + 0.002));
      door.rotation.y = s > 0 ? 0 : Math.PI;
      pBody.add(door);
      const inner = new THREE.Mesh(
        new THREE.ShapeGeometry(roundedRect(0.145, 0.285, 0.045), 4),
        paint,
      );
      inner.position.set(dx, 0.04, s * (R * 0.99 + 0.0035));
      inner.rotation.y = s > 0 ? 0 : Math.PI;
      pBody.add(inner);
    }
  }
  // cockpit windows
  for (const s of [-1, 1])
    for (let k = 0; k < 3; k++) {
      const w = new THREE.Mesh(roundedBox(0.13, 0.075, 0.02, 0.012), darkGlass);
      const x = 3.38 + k * 0.13;
      const { r, y } = ringOf(x);
      const a = 0.45 + k * 0.22;
      w.position.set(x, y + Math.sin(a) * r * 0.98, s * Math.cos(a) * r * 0.98);
      w.lookAt(w.position.clone().add(V(0.5 + k * 0.5, Math.sin(a), s * Math.cos(a))));
      pBody.add(w);
    }
}
function slab(pts, depth, mat, bevel = 0.018) {
  const sh = new THREE.Shape(pts.map(([a, b]) => new THREE.Vector2(a, b)));
  const g = new THREE.ExtrudeGeometry(sh, {
    depth,
    bevelEnabled: true,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelSegments: 3,
    curveSegments: 4,
  });
  return new THREE.Mesh(g, mat);
}
// wings: shape in (x, z), extruded down along -y
for (const s of [-1, 1]) {
  const w = slab(
    [
      [0.98, 0.2],
      [-0.85, 3.55],
      [-1.32, 3.55],
      [-0.95, 1.3],
      [-0.78, 0.2],
    ].map(([x, z]) => [x, z * s]),
    0.05,
    greyPaint,
  );
  w.geometry.rotateX(Math.PI / 2);
  w.position.y = -0.15;
  w.rotation.x = -s * 0.07; // dihedral
  w.castShadow = true;
  pBody.add(w);
  // winglet
  const wl = slab(
    [
      [0, 0],
      [-0.3, 0.42],
      [-0.48, 0.42],
      [-0.42, 0],
    ],
    0.03,
    blue,
    0.01,
  );
  wl.position.set(-0.86, -0.12 + 0.25, s * 3.53 - 0.015);
  pBody.add(wl);
  // engine: nacelle + intake + fan + spinner, on a pylon
  const eng = new THREE.Group();
  const prof = [];
  for (let i = 0; i <= 24; i++) {
    const k = i / 24;
    prof.push(
      new THREE.Vector2(
        0.2 - 0.05 * Math.pow(k, 2) + 0.012 * Math.sin(k * Math.PI),
        -0.44 + 0.88 * k,
      ),
    );
  }
  const nac = add(eng, new THREE.LatheGeometry(prof, 48), paint);
  nac.rotation.z = -Math.PI / 2;
  const lip = add(
    eng,
    new THREE.TorusGeometry(0.2, 0.018, 12, 48),
    real.metal(0xcfd3d9, { roughness: 0.2 }),
    0.44,
    0,
    0,
  );
  lip.rotation.y = Math.PI / 2;
  const intake = add(
    eng,
    new THREE.CircleGeometry(0.19, 40),
    flat(0x15181d, { roughness: 0.6 }),
    0.41,
    0,
    0,
    false,
  );
  intake.rotation.y = Math.PI / 2;
  const fan = new THREE.Group();
  for (let b = 0; b < 18; b++) {
    const bl = new THREE.Mesh(
      new THREE.BoxGeometry(0.008, 0.17, 0.03),
      real.metal(0x8a9099, { roughness: 0.35 }),
    );
    bl.position.y = 0.09;
    const piv = new THREE.Group();
    piv.rotation.x = (b / 18) * Math.PI * 2;
    bl.rotation.y = 0.5;
    piv.add(bl);
    fan.add(piv);
  }
  fan.position.x = 0.42;
  eng.add(fan);
  eng.userData.fan = fan;
  const spin = add(
    eng,
    new THREE.ConeGeometry(0.05, 0.1, 24),
    real.metal(0xb8bec7, { roughness: 0.25 }),
    0.46,
    0,
    0,
    false,
  );
  spin.rotation.z = -Math.PI / 2;
  const accent = add(
    eng,
    new THREE.CylinderGeometry(0.205, 0.205, 0.12, 48, 1, true),
    blue,
    -0.12,
    0,
    0,
  );
  accent.rotation.z = Math.PI / 2;
  const pyl = add(eng, roundedBox(0.5, 0.18, 0.05, 0.02), greyPaint, -0.05, 0.17, 0);
  pyl.rotation.z = 0.08;
  eng.position.set(0.42, -0.42, s * 1.25);
  pBody.add(eng);
  plane.userData[s > 0 ? "engR" : "engL"] = eng;
}
// tail: fin (x, y) + stabilisers (x, z)
{
  const fin = slab(
    [
      [-2.55, 0.18],
      [-3.5, 1.72],
      [-3.98, 1.72],
      [-3.86, 0.18],
    ],
    0.05,
    blue,
  );
  fin.position.z = -0.025;
  fin.castShadow = true;
  pBody.add(fin);
  // a generic logo: white ring + wave on both sides of the fin
  for (const s of [-1, 1]) {
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.17, 0.215, 40), real.gloss(0xffffff));
    ring.position.set(-3.38, 0.98, s * 0.07);
    ring.rotation.y = s > 0 ? 0 : Math.PI;
    pBody.add(ring);
    const wave = new THREE.Mesh(
      new THREE.CircleGeometry(0.12, 32, 0, Math.PI),
      real.gloss(0xffc83d),
    );
    wave.position.set(-3.38, 0.94, s * 0.071);
    wave.rotation.y = s > 0 ? 0 : Math.PI;
    pBody.add(wave);
  }
  for (const s of [-1, 1]) {
    const st = slab(
      [
        [-3.02, 0.06],
        [-3.62, 1.35],
        [-3.92, 1.35],
        [-3.86, 0.06],
      ].map(([x, z]) => [x, z * s]),
      0.035,
      greyPaint,
      0.012,
    );
    st.geometry.rotateX(Math.PI / 2);
    st.position.y = 0.26;
    pBody.add(st);
  }
}
// lights: nav red (left, -z) / green (right, +z), white strobes, red beacons, landing lights
const navR = add(
  pBody,
  new THREE.SphereGeometry(0.035, 16, 12),
  flat(0xff2020, { emissive: 0xff1010, emissiveIntensity: 3 }),
  -0.9,
  -0.12,
  -3.58,
  false,
);
const navG = add(
  pBody,
  new THREE.SphereGeometry(0.035, 16, 12),
  flat(0x20ff60, { emissive: 0x10ff50, emissiveIntensity: 3 }),
  -0.9,
  -0.12,
  3.58,
  false,
);
const strobeMat = flat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0 });
for (const s of [-1, 1])
  add(pBody, new THREE.SphereGeometry(0.03, 12, 10), strobeMat, -1.0, -0.12, s * 3.6, false);
const beaconMat = flat(0xff3020, { emissive: 0xff2010, emissiveIntensity: 0 });
add(pBody, new THREE.SphereGeometry(0.04, 12, 10), beaconMat, 0.2, R + 0.02, 0, false);
add(pBody, new THREE.SphereGeometry(0.04, 12, 10), beaconMat, -0.3, -R - 0.02, 0, false);
const landMat = flat(0xffffff, { emissive: 0xfff4d8, emissiveIntensity: 0 });
const landCones = [];
for (const s of [-1, 1]) {
  add(pBody, new THREE.SphereGeometry(0.035, 16, 12), landMat, 0.86, -0.16, s * 0.55, false);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.9, 6, 32, 1, true), glowMat(0xfff0c8, 0));
  cone.geometry.translate(0, -3, 0);
  cone.geometry.rotateZ(Math.PI / 2); // points +x
  cone.position.set(0.88, -0.16, s * 0.55);
  cone.rotation.z = -0.1;
  cone.userData.noAO = true;
  pBody.add(cone);
  landCones.push(cone);
}
// landing gear
const gear = new THREE.Group();
pBody.add(gear);
{
  const strutM = real.metal(0xbfc4cc, { roughness: 0.3 });
  const tyre = real.rubber(0x1d1e22);
  const hub = real.metal(0xd6d9de, { roughness: 0.3 });
  const leg = (x, z, n) => {
    add(gear, new THREE.CylinderGeometry(0.025, 0.025, 0.42, 12), strutM, x, -R - 0.17, z);
    for (const dz of n === 2 ? [-0.07, 0.07] : [0]) {
      const w = add(
        gear,
        new THREE.CylinderGeometry(0.1, 0.1, 0.07, 32),
        tyre,
        x,
        -R - 0.38,
        z + dz,
      );
      w.rotation.x = Math.PI / 2;
      const h = add(
        gear,
        new THREE.CylinderGeometry(0.05, 0.05, 0.075, 20),
        hub,
        x,
        -R - 0.38,
        z + dz,
        false,
      );
      h.rotation.x = Math.PI / 2;
    }
  };
  leg(-0.45, 0.55, 2);
  leg(-0.45, -0.55, 2);
  leg(2.7, 0, 2);
}
// x-ray inside: seat rows, your glowing phone, the two pilots
const inside = new THREE.Group();
pBody.add(inside);
{
  const seatG = roundedBox(0.09, 0.13, 0.09, 0.02);
  const seatM = flat(0x3a62c8, { roughness: 0.6 });
  const list = [];
  for (let x = -2.2; x <= 2.3; x += 0.17)
    for (const z of [-0.26, -0.17, -0.08, 0.08, 0.17, 0.26]) list.push([x, z]);
  const inst = new THREE.InstancedMesh(seatG, seatM, list.length);
  const m4 = new THREE.Matrix4();
  list.forEach(([x, z], i) => {
    m4.makeTranslation(x, -0.08, z);
    inst.setMatrixAt(i, m4);
  });
  inside.add(inst);
  const floor = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.02, 0.62), flat(0x6a7486));
  floor.position.set(0, -0.15, 0);
  inside.add(floor);
  for (const z of [-0.12, 0.12]) {
    add(inside, roundedBox(0.12, 0.16, 0.1, 0.02), flat(0x2d2f36), 3.15, -0.06, z, false);
    add(inside, new THREE.SphereGeometry(0.045, 20, 14), flat(0xe8b394), 3.2, 0.07, z, false);
  }
}
const PHONE_IN = V(-0.52, 0.02, 0.27);
const phoneDot = add(
  inside,
  new THREE.SphereGeometry(0.04, 20, 14),
  flat(0xff3030, { emissive: 0xff2020, emissiveIntensity: 3 }),
  PHONE_IN.x,
  PHONE_IN.y,
  PHONE_IN.z,
  false,
);
// bursts: beads that run from your phone to the cockpit
const BEADS = 36;
const beads = new THREE.InstancedMesh(
  new THREE.SphereGeometry(0.06, 12, 10),
  glowMat(0xff4a2a, 1),
  BEADS,
);
beads.userData.noAO = true;
pBody.add(beads);
// the scream: rings blasting out of the plane
const screamRings = [];
for (let i = 0; i < 6; i++) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.035, 10, 96), glowMat(0xff3b30, 0));
  m.userData.noAO = true;
  if (i % 2)
    m.rotation.x = Math.PI / 2; // horizontal
  else m.rotation.y = Math.PI / 2; // upright, across the plane
  pBody.add(m);
  screamRings.push(m);
}
const screamGlow = new THREE.PointLight(0xff3020, 0, 14, 1.6);
pBody.add(screamGlow);
plane.scale.setScalar(0.45);

// ================================================================ tower beams (world)
const beams = [];
for (const top of towerTops) {
  const g = new THREE.Group();
  g.position.copy(top);
  const umb = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 6.5, 1.3, 64, 1, true),
    glowMat(0x3dff8a, 0),
  );
  umb.geometry.translate(0, -0.65, 0);
  umb.userData.noAO = true;
  g.add(umb);
  const rings = [];
  for (let k = 0; k < 3; k++) {
    const rr = new THREE.Mesh(new THREE.TorusGeometry(1, 0.03, 8, 96), glowMat(0x7dffb0, 0));
    rr.rotation.x = Math.PI / 2;
    rr.userData.noAO = true;
    g.add(rr);
    rings.push(rr);
  }
  scene.add(g);
  beams.push({ g, umb, rings });
}
// link: plane <-> tower
const link = new THREE.Mesh(
  new THREE.CylinderGeometry(0.035, 0.035, 1, 12, 1, true),
  glowMat(0x3dff8a, 0),
);
link.userData.noAO = true;
scene.add(link);
const linkCore = new THREE.Mesh(
  new THREE.CylinderGeometry(0.012, 0.012, 1, 8),
  glowMat(0xffffff, 0),
);
scene.add(linkCore);

// ================================================================ phone screen
const SCR_W = 480;
const SCR_H = 1024;
const scrCanvas = document.createElement("canvas");
scrCanvas.width = SCR_W;
scrCanvas.height = SCR_H;
const sg = scrCanvas.getContext("2d");
const scrTex = new THREE.CanvasTexture(scrCanvas);
scrTex.colorSpace = THREE.SRGBColorSpace;
scrTex.anisotropy = 8;
let scrKey = "";
const FONT = (w, px) => `${w} ${px}px "Montserrat", sans-serif`;
function rr(x, y, w, h, r) {
  sg.beginPath();
  sg.roundRect(x, y, w, h, r);
}
function planeIcon(cx, cy, s, col) {
  sg.save();
  sg.translate(cx, cy);
  sg.rotate(-Math.PI / 4);
  sg.scale(s, s);
  sg.fillStyle = col;
  sg.beginPath();
  sg.moveTo(0, -40);
  sg.quadraticCurveTo(7, -40, 7, -28);
  sg.lineTo(7, -8);
  sg.lineTo(40, 12);
  sg.lineTo(40, 20);
  sg.lineTo(7, 10);
  sg.lineTo(7, 28);
  sg.lineTo(16, 36);
  sg.lineTo(16, 42);
  sg.lineTo(0, 37);
  sg.lineTo(-16, 42);
  sg.lineTo(-16, 36);
  sg.lineTo(-7, 28);
  sg.lineTo(-7, 10);
  sg.lineTo(-40, 20);
  sg.lineTo(-40, 12);
  sg.lineTo(-7, -8);
  sg.lineTo(-7, -28);
  sg.quadraticCurveTo(-7, -40, 0, -40);
  sg.fill();
  sg.restore();
}
function statusBar(bars, net, batt, battCol = "#fff") {
  sg.fillStyle = "#fff";
  sg.font = FONT(700, 30);
  sg.textAlign = "left";
  sg.fillText("19:42", 34, 58);
  // signal bars
  for (let i = 0; i < 4; i++) {
    sg.fillStyle = i < bars ? "#fff" : "rgba(255,255,255,.28)";
    rr(258 + i * 15, 52 - (i + 1) * 8, 10, (i + 1) * 8, 2);
    sg.fill();
  }
  sg.font = FONT(700, 22);
  sg.fillStyle = net === "Kein Netz" ? "#ff6b5e" : "#fff";
  sg.textAlign = "left";
  if (net) sg.fillText(net, 324, 50);
  // battery
  sg.strokeStyle = "rgba(255,255,255,.8)";
  sg.lineWidth = 3;
  rr(398, 34, 48, 24, 6);
  sg.stroke();
  sg.fillStyle = battCol;
  rr(402, 38, Math.max(3, 40 * (batt / 100)), 16, 3);
  sg.fill();
  sg.fillStyle = "rgba(255,255,255,.8)";
  sg.fillRect(447, 41, 4, 10);
  sg.textAlign = "center";
}
function bg(a, b) {
  const gr = sg.createLinearGradient(0, 0, 0, SCR_H);
  gr.addColorStop(0, a);
  gr.addColorStop(1, b);
  sg.fillStyle = gr;
  sg.fillRect(0, 0, SCR_W, SCR_H);
}
function tile(on, k = 1) {
  // control-centre tile with the airplane
  const x = 90;
  const y = 330;
  const s = 300;
  sg.save();
  sg.shadowColor = on ? "rgba(255,150,40,.9)" : "rgba(0,0,0,.4)";
  sg.shadowBlur = on ? 60 * k : 20;
  sg.fillStyle = on ? "#ff9a1f" : "rgba(120,124,136,.55)";
  rr(x, y, s, s, 70);
  sg.fill();
  sg.restore();
  planeIcon(x + s / 2, y + s / 2, 2.6, on ? "#fff" : "rgba(255,255,255,.85)");
  sg.textAlign = "center";
  sg.fillStyle = "#fff";
  sg.font = FONT(800, 44);
  sg.fillText("Flugmodus", SCR_W / 2, 730);
  sg.font = FONT(800, 56);
  sg.fillStyle = on ? "#ffb347" : "#ff5a4e";
  sg.fillText(on ? "AN" : "AUS", SCR_W / 2, 805);
}
function drawScreen(state, u = 0, extra = 0) {
  const fontOk = document.fonts.check('800 40px "Montserrat"');
  const key = `${state}|${Math.round(u * 60)}|${extra}|${fontOk}`;
  if (key === scrKey) return;
  scrKey = key;
  sg.clearRect(0, 0, SCR_W, SCR_H);
  sg.textAlign = "center";
  if (state === "search" || state === "fight") {
    const fight = state === "fight";
    bg(fight ? "#3a0d14" : "#14182a", fight ? "#7a1222" : "#2a1630");
    const bars = Math.floor(u * 6) % 5;
    statusBar(bars, "Suche …", fight ? 48 : 61, fight ? "#ffcf3d" : "#fff");
    // radar rings
    for (let k = 0; k < 4; k++) {
      const f = (u * (fight ? 1.6 : 0.9) + k / 4) % 1;
      sg.strokeStyle = `rgba(255,${fight ? 70 : 110},${fight ? 60 : 90},${(1 - f) * 0.9})`;
      sg.lineWidth = 10 * (1 - f) + 2;
      sg.beginPath();
      sg.arc(SCR_W / 2, 470, 40 + f * 210, 0, Math.PI * 2);
      sg.stroke();
    }
    // antenna icon
    sg.fillStyle = "#fff";
    rr(SCR_W / 2 - 8, 440, 16, 90, 6);
    sg.fill();
    sg.beginPath();
    sg.arc(SCR_W / 2, 440, 22, 0, Math.PI * 2);
    sg.fill();
    sg.font = FONT(800, fight ? 54 : 46);
    sg.fillStyle = "#fff";
    sg.fillText(fight ? "SUCHE NETZ" : "Suche Netz …", SCR_W / 2, 800);
    if (fight) {
      sg.font = FONT(800, 34);
      sg.fillStyle = "#ffcf3d";
      sg.fillText("Sendeleistung: MAX", SCR_W / 2, 862);
    }
  } else if (state === "toggle") {
    bg("#1c2233", "#0e111b");
    statusBar(Math.floor(u * 6) % 5, "Suche …", 61);
    tile(extra === 1, u);
  } else if (state === "none") {
    bg("#1a1d2a", "#2c1420");
    statusBar(0, "Kein Netz", 52);
    for (let i = 0; i < 4; i++) {
      sg.fillStyle = "rgba(255,255,255,.22)";
      rr(140 + i * 52, 520 - (i + 1) * 46, 36, (i + 1) * 46, 8);
      sg.fill();
    }
    sg.strokeStyle = "#ff4d4d";
    sg.lineWidth = 22;
    sg.lineCap = "round";
    sg.beginPath();
    sg.moveTo(140, 300);
    sg.lineTo(350, 540);
    sg.stroke();
    sg.font = FONT(800, 60);
    sg.fillStyle = "#fff";
    sg.fillText("Kein Netz", SCR_W / 2, 700);
  } else if (state === "battery" || state === "low") {
    const pct = state === "low" ? 1 : Math.round(lerp(58, 9, u));
    bg(state === "low" ? "#2a0a0e" : "#24121a", "#0d0a12");
    statusBar(state === "low" ? 0 : 1, "Suche …", pct, "#ff4d4d");
    // big battery
    sg.strokeStyle = "#fff";
    sg.lineWidth = 14;
    rr(110, 300, 260, 440, 40);
    sg.stroke();
    sg.fillStyle = "#fff";
    rr(195, 268, 90, 34, 10);
    sg.fill();
    const h = 400 * (pct / 100);
    const blink = state === "low" ? (Math.floor(u * 8) % 2 ? 1 : 0.35) : 1;
    sg.fillStyle = `rgba(255,70,70,${blink})`;
    rr(130, 720 - h, 220, Math.max(10, h), 24);
    sg.fill();
    sg.font = FONT(800, 96);
    sg.fillStyle = "#fff";
    sg.fillText(`${pct}%`, SCR_W / 2, 880);
    if (state === "low") {
      sg.font = FONT(800, 38);
      sg.fillStyle = "#ff6b5e";
      sg.fillText("Akku leer", SCR_W / 2, 950);
    }
  } else if (state === "bord" || state === "call") {
    bg(state === "call" ? "#0f3a2a" : "#122236", "#07140f");
    statusBar(4, "Bord-Netz", 1, "#ff4d4d");
    if (state === "bord") {
      sg.font = FONT(800, 50);
      sg.fillStyle = "#5dff9a";
      sg.fillText("Bord-Netz", SCR_W / 2, 470);
      for (let i = 0; i < 4; i++) {
        sg.fillStyle = "#5dff9a";
        rr(140 + i * 52, 700 - (i + 1) * 46, 36, (i + 1) * 46, 8);
        sg.fill();
      }
    } else {
      sg.fillStyle = "rgba(255,255,255,.15)";
      sg.beginPath();
      sg.arc(SCR_W / 2, 330, 110, 0, Math.PI * 2);
      sg.fill();
      sg.font = FONT(800, 110);
      sg.fillStyle = "#fff";
      sg.fillText("M", SCR_W / 2, 370);
      sg.font = FONT(800, 58);
      sg.fillText("Mama", SCR_W / 2, 530);
      sg.font = FONT(700, 34);
      sg.fillStyle = "#9dffc4";
      const secs = Math.floor(u * 3);
      sg.fillText(`Anruf · 00:0${secs}`, SCR_W / 2, 590);
      sg.fillStyle = "#ff4646";
      sg.beginPath();
      sg.arc(SCR_W / 2, 860, 62, 0, Math.PI * 2);
      sg.fill();
      sg.fillStyle = "#fff";
      rr(SCR_W / 2 - 34, 852, 68, 18, 9);
      sg.fill();
    }
  }
  scrTex.needsUpdate = true;
}

// ================================================================ the window seat (cabin)
const cabin = new THREE.Group();
cabin.position.copy(CAB);
scene.add(cabin);
{
  const wallMat = real.plastic(0xebe8e1, { roughness: 0.5 });
  // side wall with the window opening: shape in (u = -z, y), extruded along +x
  const WC = { z: -1.0, y: 1.25, w: 1.3, h: 1.8 };
  const wall = new THREE.Shape();
  wall.moveTo(-4, -2);
  wall.lineTo(5, -2);
  wall.lineTo(5, 4.5);
  wall.lineTo(-4, 4.5);
  wall.lineTo(-4, -2);
  const hole = roundedRect(WC.w, WC.h, 0.5);
  hole.getPoints(); // ensure curves
  const holePath = new THREE.Path(
    hole.getPoints(12).map((p) => new THREE.Vector2(p.x - WC.z, p.y + WC.y)),
  );
  wall.holes.push(holePath);
  const wg = new THREE.ExtrudeGeometry(wall, {
    depth: 0.12,
    bevelEnabled: false,
    curveSegments: 12,
  });
  wg.rotateY(Math.PI / 2);
  add(cabin, wg, wallMat, -1.42, 0, 0, false);
  // deep window reveal (tube) + bezel ring
  const ring = (ow, oh, or, iw, ih, ir, depth, mat, x) => {
    const s = roundedRect(ow, oh, or);
    s.holes.push(new THREE.Path(roundedRect(iw, ih, ir).getPoints(12)));
    const g = new THREE.ExtrudeGeometry(s, {
      depth,
      bevelEnabled: true,
      bevelSize: 0.02,
      bevelThickness: 0.02,
      bevelSegments: 3,
      curveSegments: 16,
    });
    g.rotateY(Math.PI / 2);
    const m = add(cabin, g, mat, x, WC.y, WC.z, false);
    return m;
  };
  ring(1.42, 1.92, 0.56, 1.3, 1.8, 0.5, 0.36, real.plastic(0xd9d6cf, { roughness: 0.45 }), -1.78);
  ring(1.62, 2.12, 0.66, 1.34, 1.84, 0.52, 0.06, real.plastic(0xf1eee8, { roughness: 0.4 }), -1.33);
  // window shade, pulled almost all the way up
  const shade = add(
    cabin,
    roundedBox(0.03, 1.8, 1.3, 0.02),
    real.plastic(0xe2ded6),
    -1.5,
    WC.y + 1.56,
    WC.z,
    false,
  );
  shade.scale.set(1, 1, 0.98);
  const grip = add(
    cabin,
    roundedBox(0.05, 0.05, 0.36, 0.02),
    real.plastic(0xbdb8ae),
    -1.47,
    WC.y + 0.68,
    WC.z,
    false,
  );
  grip.visible = true;
  // outer pane: faint reflective glass with the little breather hole
  const pane = new THREE.Mesh(
    new THREE.ShapeGeometry(roundedRect(1.3, 1.8, 0.5), 12),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.02,
      metalness: 0,
      transparent: true,
      opacity: 0.08,
    }),
  );
  pane.rotation.y = Math.PI / 2;
  pane.position.set(-1.7, WC.y, WC.z);
  pane.userData.noAO = true;
  cabin.add(pane);
  const hole2 = add(
    cabin,
    new THREE.CircleGeometry(0.018, 12),
    flat(0x333333),
    -1.69,
    WC.y - 0.6,
    WC.z,
    false,
  );
  hole2.rotation.y = Math.PI / 2;
  // lower wall panel / armrest
  add(
    cabin,
    roundedBox(0.35, 0.26, 2.4, 0.08),
    real.plastic(0x5c5f66, { roughness: 0.55 }),
    -1.12,
    0.05,
    0.2,
    false,
  );
  // seat back of the row ahead: fabric, white headrest cover, tray table, pocket
  const seatFab = real.fabric(0x26335e);
  add(cabin, roundedBox(2.7, 3.6, 0.55, 0.22), seatFab, 0.28, 1.0, -2.75, false);
  add(cabin, roundedBox(1.7, 0.62, 0.6, 0.14), real.fabric(0xece8de), 0.28, 2.55, -2.73, false);
  const tray = add(
    cabin,
    roundedBox(1.9, 1.15, 0.06, 0.06),
    real.plastic(0x8f939b, { roughness: 0.5 }),
    0.28,
    1.2,
    -2.44,
    false,
  );
  tray.visible = true;
  add(cabin, roundedBox(0.22, 0.08, 0.06, 0.02), real.plastic(0x45484f), 0.28, 1.84, -2.4, false);
  add(cabin, roundedBox(2.1, 0.8, 0.1, 0.06), real.fabric(0x1c254a), 0.28, 0.2, -2.42, false);
  const card = add(
    cabin,
    roundedBox(0.7, 0.5, 0.012, 0.01),
    real.plastic(0xf2f0e6),
    0.6,
    0.62,
    -2.38,
    false,
  );
  card.rotation.z = 0.06;
  // overhead bin, its light strip, ceiling, air nozzles
  add(
    cabin,
    roundedBox(1.6, 0.9, 7.5, 0.08),
    real.plastic(0xf3f1ec, { roughness: 0.45 }),
    -0.55,
    3.2,
    -0.5,
    false,
  );
  add(
    cabin,
    new THREE.BoxGeometry(0.03, 0.025, 7.4),
    flat(0xfff0d0, { emissive: 0xffd9a0, emissiveIntensity: 1.6 }),
    0.25,
    2.76,
    -0.5,
    false,
  );
  add(
    cabin,
    roundedBox(3.6, 0.1, 7.5, 0.04),
    real.plastic(0xf5f3ee, { roughness: 0.5 }),
    2.0,
    3.66,
    -0.5,
    false,
  );
  for (const z of [-0.6, -0.1]) {
    const nz = add(
      cabin,
      new THREE.CylinderGeometry(0.07, 0.09, 0.06, 32),
      real.metal(0xc5c8ce, { roughness: 0.25 }),
      0.05,
      2.73,
      z,
      false,
    );
    nz.visible = true;
  }
  // a second row of seats across the aisle (depth)
  add(cabin, roundedBox(2.7, 3.6, 0.55, 0.22), seatFab, 3.6, 1.0, -4.5, false);
}
// the mini cell tower in the ceiling (picocell)
const PICO = V(0.85, 3.6, -0.8);
const pico = new THREE.Group();
pico.position.copy(PICO);
cabin.add(pico);
{
  add(
    pico,
    roundedBox(0.62, 0.05, 0.62, 0.02),
    real.plastic(0xffffff, { roughness: 0.35 }),
    0,
    -0.03,
    0,
    false,
  );
  const dome = add(
    pico,
    new THREE.SphereGeometry(0.24, 48, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    real.plastic(0xf4f4f4, { roughness: 0.3 }),
    0,
    -0.05,
    0,
    false,
  );
  dome.scale.set(1, 0.5, 1);
}
const picoLed = add(
  pico,
  new THREE.SphereGeometry(0.025, 12, 10),
  flat(0x40ff80, { emissive: 0x30ff70, emissiveIntensity: 0 }),
  0.22,
  -0.07,
  0.22,
  false,
);
const picoRings = [];
for (let k = 0; k < 4; k++) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 8, 96), glowMat(0x5dff9a, 0));
  m.rotation.x = Math.PI / 2;
  m.userData.noAO = true;
  pico.add(m);
  picoRings.push(m);
}
// wing outside the window (big, real scale for this set)
{
  const wing = slab(
    [
      [-2.6, -4.2],
      [-42, 12],
      [-44, 18],
      [-2.6, 5.5],
    ].map(([x, z]) => [x, z]),
    0.5,
    real.metal(0xd8dce2, { roughness: 0.45 }),
    0.15,
  );
  // shape is (x, y) here -> lay it into (x, z)
  wing.geometry.rotateX(Math.PI / 2);
  wing.position.y = -3.0;
  wing.rotation.z = 0.035;
  cabin.add(wing);
  const flap = new THREE.Mesh(
    new THREE.BoxGeometry(30, 0.06, 0.08),
    flat(0x9aa0a8, { roughness: 0.5 }),
  );
  flap.position.set(-17, -2.94, 9.2);
  flap.rotation.y = -0.38;
  cabin.add(flap);
  const nac = add(
    cabin,
    new THREE.CylinderGeometry(2.2, 2.0, 9, 48),
    real.gloss(0xf2f3f5),
    -10,
    -5.6,
    -3.5,
    false,
  );
  nac.rotation.x = Math.PI / 2;
  const acc = add(
    cabin,
    new THREE.CylinderGeometry(2.22, 2.22, 1.4, 48, 1, true),
    real.gloss(0x1d3c8c),
    -10,
    -5.6,
    -1.0,
    false,
  );
  acc.rotation.x = Math.PI / 2;
}
// cabin lights
const cabLight = new THREE.PointLight(0xffe2bc, 7, 10, 1.4);
cabLight.position.set(0.9, 3.2, 1.0);
cabin.add(cabLight);
const phoneLight = new THREE.PointLight(0x8aa0ff, 0, 3, 1.5);
cabin.add(phoneLight);

// ---------------------------------------------------------------- phone + your hand
const phone = new THREE.Group();
cabin.add(phone);
{
  add(
    phone,
    roundedBox(0.43, 0.87, 0.05, 0.07),
    real.metal(0x9aa0a8, { roughness: 0.22 }),
    0,
    0,
    0,
    false,
  );
  add(
    phone,
    roundedBox(0.415, 0.855, 0.056, 0.065),
    real.gloss(0x23262d, { roughness: 0.2 }),
    0,
    0,
    0,
    false,
  );
  const scr = new THREE.Mesh(
    new THREE.PlaneGeometry(0.385, 0.82),
    new THREE.MeshStandardMaterial({
      map: scrTex,
      emissive: 0xffffff,
      emissiveMap: scrTex,
      emissiveIntensity: 1.05,
      roughness: 0.55,
    }),
  );
  scr.position.z = 0.0295;
  scr.userData.noAO = true;
  phone.add(scr);
  // dynamic island + side buttons + camera bump on the back
  add(phone, roundedBox(0.11, 0.032, 0.004, 0.015), flat(0x050505), 0, 0.37, 0.032, false);
  add(phone, roundedBox(0.012, 0.11, 0.02, 0.005), real.metal(0x9aa0a8), 0.218, 0.16, 0, false);
  add(phone, roundedBox(0.012, 0.07, 0.02, 0.005), real.metal(0x9aa0a8), -0.218, 0.2, 0, false);
  add(phone, roundedBox(0.17, 0.17, 0.03, 0.04), real.gloss(0x2c2f36), -0.09, 0.3, -0.035, false);
}
const hand = createHand({ sleeve: 0x2f4a3a, skin: 0xf0bf98, scale: 1 });
hand.pose({ index: 0.15, middle: 0.18, ring: 0.2, pinky: 0.25, thumb: 0.9 });
const OFF = new THREE.Matrix4()
  .makeTranslation(0.02, -0.1, 0.46)
  .multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));
const OFF_INV = OFF.clone().invert();
const PH_BASE = V(-0.25, 0.98, 0.25);
const tmpM = new THREE.Matrix4();
function placePhone(t, where) {
  phone.visible = where === "cab";
  hand.group.visible = phone.visible;
  if (!phone.visible) return;
  // held in front of you, facing your eyes; a little life in the hand
  let y = PH_BASE.y + Math.sin(t * 1.3) * 0.012;
  let shake = 0;
  if (t >= T.und1 && t < T.du2) shake = 0.012; // it "fights"
  if (t >= T.nur && t < T.fakt) shake = 0.02 * pop(t, T.nur + 0.3, T.fakt); // you shake the dead phone
  const sx = Math.sin(t * 47) * shake;
  let rx = -0.18 + Math.sin(t * 0.9) * 0.02;
  let ry = 0.72 + Math.sin(t * 0.7) * 0.02 + Math.sin(t * 39) * shake * 2;
  let x = PH_BASE.x + sx;
  let z = PH_BASE.z;
  // CTA: you lift the phone a bit to tap the tile
  if (t >= T.schon) {
    const k = smooth(ramp(t, T.schon, T.schon + 0.6));
    y += 0.06 * k;
    rx -= 0.05 * k;
  }
  phone.position.set(x, y, z);
  phone.rotation.set(rx, ry, 0, "YXZ");
  phone.updateMatrixWorld(true);
  tmpM.copy(phone.matrixWorld).multiply(OFF_INV);
  tmpM.decompose(hand.group.position, hand.group.quaternion, hand.group.scale);
  hand.group.scale.setScalar(1);
}
// your thumb for the CTA tap: a second (left) hand that reaches in
const thumbHand = createHand({ sleeve: 0x2f4a3a, skin: 0xf0bf98, left: true, scale: 0.6 });

// ================================================================ cockpit
const cockpit = new THREE.Group();
cockpit.position.copy(CKP);
scene.add(cockpit);
const pilotHead = new THREE.Group();
const eyes = [];
const EAR = V(0.02, 1.83, -0.52);
{
  const shellMat = real.plastic(0x5d6168, { roughness: 0.55 });
  // side wall (pilot's left, +z) with a big window, back wall, floor
  const sw = new THREE.Shape();
  sw.moveTo(-2.4, -0.2);
  sw.lineTo(1.8, -0.2);
  sw.lineTo(1.8, 3.2);
  sw.lineTo(-2.4, 3.2);
  sw.lineTo(-2.4, -0.2);
  const win = roundedRect(1.9, 1.15, 0.28);
  sw.holes.push(
    new THREE.Path(win.getPoints(10).map((p) => new THREE.Vector2(p.x - 0.3, p.y + 2.05))),
  );
  const swg = new THREE.ExtrudeGeometry(sw, { depth: 0.1, bevelEnabled: false });
  add(cockpit, swg, shellMat, 0, 0, 0.95, false);
  const frame = add(cockpit, new THREE.TorusGeometry(0.01, 0.01, 4, 8), shellMat, 0, 0, 0, false);
  frame.visible = false;
  add(cockpit, roundedBox(0.12, 3.4, 4.2, 0.05), real.plastic(0x4b4f56), 1.85, 1.5, -0.6, false);
  add(cockpit, roundedBox(4.4, 0.1, 4.2, 0.05), real.plastic(0x2e3036), -0.3, -0.2, -0.6, false);
  // overhead panel with little lit buttons
  add(cockpit, roundedBox(2.6, 0.18, 2.6, 0.06), real.plastic(0x6a6e75), -0.6, 3.1, -0.5, false);
  {
    const bg2 = roundedBox(0.09, 0.03, 0.09, 0.012);
    const list = [];
    for (let i = 0; i < 14; i++)
      for (let j = 0; j < 9; j++) list.push([-1.7 + i * 0.16, -1.5 + j * 0.2]);
    const inst = new THREE.InstancedMesh(
      bg2,
      flat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.6 }),
      list.length,
    );
    const m4 = new THREE.Matrix4();
    const c = new THREE.Color();
    list.forEach(([x, z], i) => {
      m4.makeTranslation(x, 3.0, z);
      inst.setMatrixAt(i, m4);
      const v = R0();
      inst.setColorAt(
        i,
        c.setHex(v < 0.15 ? 0xffb030 : v < 0.25 ? 0x60ff90 : v < 0.6 ? 0xdde6ff : 0x3a3e46),
      );
    });
    cockpit.add(inst);
  }
  // instrument panel + glareshield + displays (in front, -x)
  add(cockpit, roundedBox(0.5, 1.0, 3.6, 0.08), real.plastic(0x2b2e34), -1.85, 0.95, -0.5, false);
  add(cockpit, roundedBox(0.75, 0.14, 3.7, 0.06), real.plastic(0x1f2126), -1.75, 1.5, -0.5, false);
  const dispC = document.createElement("canvas");
  dispC.width = 256;
  dispC.height = 256;
  const dg = dispC.getContext("2d");
  const sky2 = dg.createLinearGradient(0, 0, 0, 256);
  sky2.addColorStop(0, "#1a6ad8");
  sky2.addColorStop(0.5, "#3a8ff0");
  sky2.addColorStop(0.5, "#8a5a2a");
  sky2.addColorStop(1, "#5a3a1a");
  dg.fillStyle = sky2;
  dg.fillRect(0, 0, 256, 256);
  dg.strokeStyle = "#fff";
  dg.lineWidth = 4;
  dg.beginPath();
  dg.moveTo(70, 128);
  dg.lineTo(186, 128);
  dg.stroke();
  dg.fillStyle = "#ffd23f";
  dg.fillRect(100, 124, 56, 8);
  const dTex = new THREE.CanvasTexture(dispC);
  dTex.colorSpace = THREE.SRGBColorSpace;
  for (const z of [-0.25, 0.35, -1.2]) {
    const d = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.5),
      new THREE.MeshStandardMaterial({
        map: dTex,
        emissive: 0xffffff,
        emissiveMap: dTex,
        emissiveIntensity: 0.9,
      }),
    );
    d.rotation.y = Math.PI / 2;
    d.position.set(-1.59, 0.95, z);
    d.userData.noAO = true;
    cockpit.add(d);
  }
  // windshield posts
  for (const z of [-1.8, -0.5, 0.85])
    add(cockpit, roundedBox(0.08, 1.5, 0.08, 0.03), shellMat, -2.15, 2.25, z, false);
  // sidestick
  add(
    cockpit,
    new THREE.CylinderGeometry(0.04, 0.05, 0.4, 20),
    real.rubber(0x1a1b1e),
    -0.45,
    0.75,
    0.62,
    false,
  );
  // seat
  add(cockpit, roundedBox(0.3, 1.5, 1.1, 0.14), real.fabric(0x2c2a30), 0.55, 1.2, 0, false);
  add(cockpit, roundedBox(0.28, 0.6, 0.75, 0.12), real.fabric(0x2c2a30), 0.5, 2.15, 0, false);
  // the pilot: shirt, epaulettes, tie, neck, head, hair, face, headset
  const shirt = real.fabric(0xf4f4f1);
  const torso = add(cockpit, roundedBox(0.75, 1.15, 1.25, 0.3), shirt, 0.08, 0.85, 0, false);
  torso.rotation.z = -0.06;
  for (const s of [-1, 1]) {
    add(
      cockpit,
      roundedBox(0.4, 0.05, 0.2, 0.02),
      real.fabric(0x14161d),
      0.05,
      1.43,
      s * 0.45,
      false,
    );
    for (let k = 0; k < 3; k++)
      add(
        cockpit,
        new THREE.BoxGeometry(0.03, 0.055, 0.205),
        real.metal(0xd8b04a, { roughness: 0.3 }),
        -0.08 + k * 0.06,
        1.435,
        s * 0.45,
        false,
      );
    // arms
    const arm = add(
      cockpit,
      new THREE.CapsuleGeometry(0.16, 0.7, 8, 24),
      shirt,
      -0.15,
      0.95,
      s * 0.68,
      false,
    );
    arm.rotation.z = 0.9;
  }
  add(cockpit, roundedBox(0.04, 0.55, 0.12, 0.02), real.fabric(0x1a2240), -0.31, 1.1, 0, false);
  add(cockpit, new THREE.CylinderGeometry(0.15, 0.17, 0.3, 32), real.skin(), 0.05, 1.5, 0, false);
  const wingsBadge = add(
    cockpit,
    roundedBox(0.02, 0.06, 0.22, 0.01),
    real.metal(0xd8b04a, { roughness: 0.3 }),
    -0.32,
    1.22,
    -0.3,
    false,
  );
  wingsBadge.visible = true;
  pilotHead.position.set(0, 1.85, 0);
  cockpit.add(pilotHead);
  const skin = real.skin(0xe2a987);
  const head = add(pilotHead, new THREE.SphereGeometry(0.42, 64, 48), skin, 0, 0, 0, false);
  head.scale.set(1.0, 1.12, 0.92);
  const jaw = add(pilotHead, new THREE.SphereGeometry(0.3, 48, 32), skin, -0.12, -0.24, 0, false);
  jaw.scale.set(1, 0.8, 1.05);
  const hair = add(
    pilotHead,
    new THREE.SphereGeometry(0.44, 48, 24, 0, Math.PI * 2, 0, 1.3),
    real.fabric(0x3a2a20),
    0.05,
    0.06,
    0,
    false,
  );
  hair.rotation.z = -0.55;
  hair.scale.set(1.0, 1.1, 0.95);
  const nose = add(pilotHead, new THREE.SphereGeometry(0.05, 32, 24), skin, -0.41, -0.04, 0, false);
  nose.scale.set(1.0, 1.3, 0.8);
  for (const s of [-1, 1]) {
    const eg = new THREE.Group();
    eg.position.set(-0.36, 0.07, s * 0.15);
    pilotHead.add(eg);
    add(
      eg,
      new THREE.SphereGeometry(0.06, 24, 16),
      real.plastic(0xf6f3ee, { roughness: 0.25 }),
      0,
      0,
      0,
      false,
    );
    add(
      eg,
      new THREE.SphereGeometry(0.035, 20, 14),
      real.gloss(0x2a1c14, { roughness: 0.1 }),
      -0.04,
      0,
      0,
      false,
    );
    eyes.push(eg);
    const brow = add(
      pilotHead,
      roundedBox(0.04, 0.025, 0.14, 0.01),
      real.fabric(0x3a2a20),
      -0.4,
      0.18,
      s * 0.15,
      false,
    );
    brow.rotation.x = s * 0.1;
    const ear = add(
      pilotHead,
      new THREE.SphereGeometry(0.08, 20, 14),
      skin,
      0.02,
      -0.02,
      s * 0.4,
      false,
    );
    ear.scale.set(0.8, 1.3, 0.5);
  }
  add(pilotHead, roundedBox(0.03, 0.025, 0.14, 0.012), flat(0x8a3a32), -0.38, -0.22, 0, false);
  // headset: band over the head, two ear cups, mic boom with foam ball
  const hsDark = real.plastic(0x26282d, { roughness: 0.4 });
  const band = add(
    pilotHead,
    new THREE.TorusGeometry(0.5, 0.032, 16, 64, Math.PI),
    hsDark,
    0.03,
    -0.02,
    0,
    false,
  );
  band.rotation.y = Math.PI / 2;
  for (const s of [-1, 1]) {
    const cup = add(
      pilotHead,
      new THREE.CylinderGeometry(0.17, 0.17, 0.13, 48),
      hsDark,
      0.03,
      -0.03,
      s * 0.49,
      false,
    );
    cup.rotation.x = Math.PI / 2;
    const pad = add(
      pilotHead,
      new THREE.TorusGeometry(0.135, 0.045, 16, 48),
      real.rubber(0x15161a),
      0.03,
      -0.03,
      s * 0.42,
      false,
    );
    pad.visible = true;
    const logo = add(
      pilotHead,
      new THREE.CircleGeometry(0.07, 32),
      real.metal(0xb8bec7, { roughness: 0.25 }),
      0.03,
      -0.03,
      s * 0.557,
      false,
    );
    logo.rotation.y = s > 0 ? 0 : Math.PI;
  }
  const boom = new THREE.CatmullRomCurve3([
    V(0.03, -0.08, -0.55),
    V(-0.12, -0.2, -0.5),
    V(-0.35, -0.27, -0.3),
    V(-0.45, -0.24, -0.1),
  ]);
  add(pilotHead, new THREE.TubeGeometry(boom, 48, 0.014, 10), hsDark, 0, 0, 0, false);
  add(
    pilotHead,
    new THREE.SphereGeometry(0.045, 24, 16),
    real.fabric(0x111214),
    -0.46,
    -0.24,
    -0.08,
    false,
  );
}
// buzz rings around the right ear cup
const buzz = [];
for (let k = 0; k < 4; k++) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.01, 8, 64), glowMat(0xff4a3a, 0));
  m.userData.noAO = true;
  cockpit.add(m);
  buzz.push(m);
}
// the mosquito
const mozzie = new THREE.Group();
cockpit.add(mozzie);
const mozWings = [];
{
  const dark = flat(0x2a2522, { roughness: 0.6 });
  const body = add(mozzie, new THREE.CapsuleGeometry(0.012, 0.09, 6, 12), dark, 0, 0, 0, false);
  body.rotation.z = Math.PI / 2;
  add(mozzie, new THREE.SphereGeometry(0.016, 12, 10), dark, -0.06, 0.005, 0, false);
  add(
    mozzie,
    new THREE.CylinderGeometry(0.002, 0.002, 0.06, 4),
    dark,
    -0.09,
    -0.005,
    0,
    false,
  ).rotation.z = 1.3;
  for (let l = 0; l < 6; l++) {
    const leg = add(
      mozzie,
      new THREE.CylinderGeometry(0.0015, 0.0015, 0.09, 4),
      dark,
      -0.02 + (l % 3) * 0.02,
      -0.035,
      (l < 3 ? -1 : 1) * 0.02,
      false,
    );
    leg.rotation.x = (l < 3 ? -1 : 1) * 0.6;
  }
  for (const s of [-1, 1]) {
    const w = new THREE.Mesh(
      new THREE.CircleGeometry(0.05, 16),
      new THREE.MeshStandardMaterial({
        color: 0xdde8ff,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
        roughness: 0.2,
      }),
    );
    w.scale.set(1.3, 0.45, 1);
    w.geometry.translate(0.0, 0.0, 0);
    const piv = new THREE.Group();
    piv.position.set(-0.005, 0.012, 0);
    w.position.set(0, 0, s * 0.045);
    w.rotation.x = Math.PI / 2;
    piv.add(w);
    mozzie.add(piv);
    mozWings.push({ piv, s });
  }
  mozzie.scale.setScalar(3.2);
}
const ckLight = new THREE.PointLight(0x8fb4ff, 2.5, 4, 1.5);
ckLight.position.set(-1.3, 1.4, -0.3);
cockpit.add(ckLight);
const ckFill = new THREE.PointLight(0xffd8b0, 2.2, 5, 1.5);
ckFill.position.set(-1.0, 2.6, -1.2);
cockpit.add(ckFill);

// ================================================================ plane path
// segments: [t0, t1, from [x,y,z], to [x,y,z], pitch0, pitch1, gear, landing lights]
const SEG = [
  [T.alle, T.und1, [-14, 11, 2], [-11.5, 10.4, 2], 0, -0.3, 0, 0],
  [T.du2, T.die, [-11.5, 11, -15], [-7.5, 11, -15], 0.02, 0.02, 0, 0],
  [T.nicht, T.findet, [-7, 11, 3.4], [-2, 11, 3.4], 0, 0, 0, 0],
  [T.also, T.rast, [-3, 11, 0], [-0.6, 11, 0], 0, 0, 0, 0],
  [T.rast, T.kaum, [-22, 11, 0], [-6, 11, 0], 0, 0, 0, 0],
  [T.kaum, T.akku, [-8, 11, 0], [9, 11, 0], 0, 0, 0, 0],
  [T.rate, T.pilot, [0, 11, 0], [1.2, 11, 0], 0, 0, 0, 0],
  [T.funkt, T.nah, [2, 11, 0], [3, 11, 0], 0, 0, 0, 0],
  [T.ausgerechnet, T.abstuerzen, [6, 4.0, 13], [15.5, 1.4, 13], 0.03, 0.05, 1, 1],
  [T.abstuerzen, T.er2, [15.5, 1.4, 13], [21.6, 0.62, 13], 0.06, 0.11, 1, 1],
  [T.folge, 45.5, [33, 0.43, 13], [35, 0.43, 13], 0, 0, 1, 1],
];
const GROUND_Y = 0.43;
const st = { p: V(), pitch: 0, gear: 0, lights: 0 };
function planeAt(t) {
  if (t >= T.er2 && t < T.folge) {
    // touchdown roll-out
    const u = t - T.er2;
    const td = T.sicher - T.er2;
    st.p.set(
      21.6 + 5.0 * u - 1.2 * Math.max(0, u - td) * Math.max(0, u - td),
      lerp(0.62, GROUND_Y, smooth(clamp01(u / td))),
      13,
    );
    st.pitch = lerp(0.11, 0.0, smooth(ramp(t, T.sicher + 0.15, T.sicher + 0.9)));
    st.gear = 1;
    st.lights = 1;
    return st;
  }
  for (const s of SEG)
    if (t >= s[0] && t < s[1]) {
      const k = (t - s[0]) / (s[1] - s[0]);
      st.p.set(lerp(s[2][0], s[3][0], k), lerp(s[2][1], s[3][1], k), lerp(s[2][2], s[3][2], k));
      st.pitch = lerp(s[4], s[5], smooth(k));
      st.gear = s[6];
      st.lights = s[7];
      return st;
    }
  st.p.set(0, 11, 0);
  st.pitch = 0;
  st.gear = 0;
  st.lights = 0;
  return st;
}

// ================================================================ helpers
const m4 = new THREE.Matrix4();
const qI = new THREE.Quaternion();
const vS = V(1, 1, 1);
const UP = V(0, 1, 0);
const tmpA = V();
const tmpB = V();
function rings(list, t, { k, period, rMax, rMin = 0.1, op = 0.9, dy = 0 }) {
  list.forEach((m, i) => {
    const f = (((t / period + i / list.length) % 1) + 1) % 1;
    m.visible = k > 0.01;
    m.scale.setScalar(lerp(rMin, rMax, f));
    m.material.opacity = op * k * (1 - f) * Math.min(1, f * 6);
    if (dy) m.position.y = -dy * f;
  });
}
LABELS.forEach((l) => {
  if (l.pos === "ear") l.pos = CKP.clone().add(V(0.03, 1.82, -0.6));
  if (l.pos === "pico") l.pos = CAB.clone().add(V(0.85, 3.5, -0.8));
});

const applyCamera = shotCamera(shots, 1);

// ================================================================ render
function renderAt(t) {
  const where = whereAt(t);
  cabin.visible = where === "cab";
  cockpit.visible = where === "ckp";
  plane.visible = where === "ext";

  // ---------- plane
  const s = planeAt(t);
  PLANE_POS.copy(s.p);
  plane.position.copy(s.p);
  // "stürzt er ab": shaky nose-down
  const fear = t >= T.alle && t < T.und1 ? smooth(ramp(t, T.stuerzt - 0.2, T.und1)) : 0;
  pBody.rotation.set(
    Math.sin(t * 23) * 0.04 * fear + Math.sin(t * 0.8) * 0.015,
    0,
    s.pitch + Math.sin(t * 1.1) * 0.006,
  );
  gear.visible = s.gear > 0;
  for (const e of [plane.userData.engL, plane.userData.engR]) e.userData.fan.rotation.x = t * 40;
  beaconMat.emissiveIntensity = (t * 1.1) % 1 < 0.12 ? 4 : 0.2;
  strobeMat.emissiveIntensity = (t * 0.9 + 0.5) % 1 < 0.06 ? 6 : 0;
  navR.material.emissiveIntensity = 3;
  navG.material.emissiveIntensity = 3;
  landMat.emissiveIntensity = 5 * s.lights;
  for (const c of landCones) {
    c.visible = s.lights > 0;
    c.material.opacity = 0.12 * s.lights;
  }
  // x-ray + bursts (23.42 – 25.26)
  const xk = smooth(ramp(t, T.funkt - 0.05, T.funkt + 0.35)) * (1 - ramp(t, T.nah - 0.1, T.nah));
  setXray([fuseMat], xk);
  inside.visible = xk > 0.02;
  phoneDot.visible = xk > 0.02;
  phoneDot.material.emissiveIntensity = 2 + 2 * ((t * 2.2) % 1 < 0.5 ? 1 : 0);
  {
    const on = xk > 0.02;
    beads.visible = on;
    if (on) {
      const L = 3.2 - PHONE_IN.x;
      for (let i = 0; i < BEADS; i++) {
        const burst = Math.floor(i / 6);
        const j = i % 6;
        const ph = (t - T.funkt) * 1.6 - burst * 0.28 - j * 0.035;
        const f = ph - Math.floor(ph);
        const live = ph > 0 && f < 0.75;
        const u = f / 0.75;
        m4.compose(
          V(PHONE_IN.x + L * u, PHONE_IN.y + Math.sin(u * Math.PI) * 0.12, lerp(PHONE_IN.z, 0, u)),
          qI,
          vS.setScalar(live ? 1 - u * 0.3 : 0.0001),
        );
        beads.setMatrixAt(i, m4);
      }
      beads.instanceMatrix.needsUpdate = true;
    }
  }
  // the scream (12.28 – 14.46)
  const sk = t >= T.also && t < T.rast ? smooth(ramp(t, T.schreit - 0.15, T.schreit + 0.1)) : 0;
  rings(screamRings, t, { k: sk, period: 0.9, rMax: 9, rMin: 0.4, op: 1 });
  screamGlow.intensity = 10 * sk * (0.6 + 0.4 * Math.sin(t * 30));

  // ---------- tower beams + the link
  const ext = where === "ext";
  const beamK = ext ? 1 : 0;
  beams.forEach((b, i) => {
    b.g.visible = beamK > 0;
    b.umb.material.opacity = 0.07 + 0.03 * Math.sin(t * 3 + i);
    rings(b.rings, t + i * 0.3, { k: beamK, period: 1.6, rMax: 6.2, rMin: 0.2, op: 0.75, dy: 1.2 });
  });
  link.visible = false;
  linkCore.visible = false;
  if (ext && t >= T.kaum && t < T.akku) {
    let best = -1;
    let bd = 1e9;
    TOWERS.forEach(([x], i) => {
      const d = Math.abs(s.p.x - x);
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    const conn = 1 - smooth(ramp(bd, 1.6, 2.6));
    if (conn > 0.01) {
      tmpA.copy(s.p).add(V(0, -0.2, 0));
      tmpB.copy(towerTops[best]).add(V(0, 0.25, 0));
      const mid = tmpA.clone().add(tmpB).multiplyScalar(0.5);
      const dir = tmpB.clone().sub(tmpA);
      const len = dir.length();
      for (const m of [link, linkCore]) {
        m.visible = true;
        m.position.copy(mid);
        m.quaternion.setFromUnitVectors(UP, dir.normalize());
        m.scale.set(1, len, 1);
      }
      const flick = 0.7 + 0.3 * Math.sin(t * 50);
      link.material.color.setHex(conn > 0.5 ? 0x3dff8a : 0xff4040);
      link.material.opacity = 0.8 * conn * flick;
      linkCore.material.opacity = 0.9 * conn;
    }
  }
  showNope(pop(t, T.nicht + 0.25, T.findet), -4.3, 7.4, 3.4, 1.8);

  // ---------- touchdown smoke
  for (const dz of [-0.25, 0.25]) puff(`td${dz}`, t, T.sicher, 23.4, 0.12, 13 + dz, 0.5, 0xf0eeea);
  puff("td2", t, T.sicher + 0.12, 23.6, 0.12, 13, 0.4, 0xf0eeea);

  // ---------- cabin: phone, screen, pico
  placePhone(t, where);
  let state = "search";
  let u = t;
  let extra = 0;
  if (t >= T.flugmodus && t < T.alle) state = "toggle";
  else if (t >= T.und1 && t < T.du2) state = "fight";
  else if (t >= T.findet && t < T.also) state = "none";
  else if (t >= T.akku && t < T.rate) {
    state = "battery";
    u = smooth(ramp(t, T.akku, T.rate));
  } else if (t >= T.nur && t < T.fakt) state = "low";
  else if (t >= T.fakt && t < T.dann) state = "bord";
  else if (t >= T.dann && t < T.schon) {
    state = "call";
    u = t - T.dann;
  } else if (t >= T.schon) {
    state = "toggle";
    extra = t >= T.flugmodus2 + 0.15 ? 1 : 0;
    u = clamp01((t - T.flugmodus2 - 0.15) / 0.5);
  }
  if (where === "cab") drawScreen(state, u, extra);
  const scrCol = {
    search: 0x8a90ff,
    fight: 0xff4040,
    toggle: extra ? 0xffa030 : 0x9aa0c0,
    none: 0xff6060,
    battery: 0xff4040,
    low: 0xff3030,
    bord: 0x50ff90,
    call: 0x50ff90,
  }[state];
  phoneLight.color.setHex(scrCol);
  phoneLight.intensity = 1.0;
  phoneLight.position.copy(phone.position).add(V(0.7, -0.45, 0.35));
  // thumb tap for the CTA
  thumbHand.track(t, [
    {
      t: T.schon + 0.2,
      pos: [CAB.x + 0.6, CAB.y + 0.55, CAB.z + 1.0],
      rot: [0.4, -0.9, 0],
      pose: "point",
    },
    {
      t: T.flugmodus2 - 0.1,
      pos: [CAB.x + 0.12, CAB.y + 0.95, CAB.z + 0.62],
      rot: [0.5, -0.95, 0],
      pose: "point",
    },
    {
      t: T.flugmodus2 + 0.15,
      pos: [CAB.x + 0.06, CAB.y + 0.98, CAB.z + 0.55],
      rot: [0.55, -0.95, 0],
      pose: "press",
    },
    {
      t: T.flugmodus2 + 0.6,
      pos: [CAB.x + 0.2, CAB.y + 0.9, CAB.z + 0.75],
      rot: [0.5, -0.95, 0],
      pose: "point",
    },
  ]);
  if (where !== "cab") thumbHand.group.visible = false;
  const pk = t >= T.fakt && t < T.schon ? smooth(ramp(t, T.bord - 0.9, T.bord - 0.4)) : 0;
  rings(picoRings, t, { k: pk, period: 1.2, rMax: 2.6, rMin: 0.25, op: 0.9, dy: 1.4 });
  picoLed.material.emissiveIntensity = pk > 0 ? 2 + Math.sin(t * 8) : 0.3;

  // ---------- cockpit: buzz rings, mosquito, pilot reaction
  const bk =
    t >= T.summen - 0.1 && t < T.ausgerechnet
      ? Math.floor((t - T.summen) / 0.22) % 3 !== 2
        ? 1
        : 0.15
      : 0;
  buzz.forEach((m, i) => {
    const f = (t * 2.2 + i / buzz.length) % 1;
    m.visible = bk > 0;
    m.position.copy(EAR).add(V(0, 0, -0.08 - f * 0.25));
    m.scale.setScalar(0.18 + f * 0.45);
    m.material.opacity = bk * (1 - f) * 0.9;
  });
  const mk = t >= T.wie - 0.3 && t < T.ausgerechnet ? 1 : 0;
  mozzie.visible = mk > 0 && where === "ckp";
  if (mozzie.visible) {
    const a = (t - T.wie) * 5.5;
    mozzie.position.set(
      -0.08 + Math.cos(a) * 0.32,
      1.88 + Math.sin(a * 1.7) * 0.1,
      -0.55 - 0.18 - Math.sin(a) * 0.22,
    );
    mozzie.rotation.y = -a + Math.PI / 2;
    for (const w of mozWings) w.piv.rotation.x = w.s * (0.3 + 0.6 * Math.sin(t * 160));
  }
  const annoy =
    smooth(ramp(t, T.summen + 0.2, T.summen + 0.6)) *
    (1 - ramp(t, T.ausgerechnet - 0.1, T.ausgerechnet));
  pilotHead.rotation.set(
    0.12 * annoy + Math.sin(t * 9) * 0.02 * annoy,
    0.1 * annoy,
    Math.sin(t * 0.7) * 0.02,
  );
  for (const e of eyes) e.scale.set(1, 1 - 0.55 * annoy, 1);

  // ---------- HUD: the speed while racing
  const gk = pop(t, T.rast + 0.3, T.kaum);
  gauge("tempo", gk, {
    label: "TEMPO",
    value: Math.round(930 * smooth(ramp(t, T.rast + 0.3, T.tausend + 0.4))),
    max: 1000,
    unit: "km/h",
    x: 600,
    y: 1240,
    color: "#ffd23f",
  });

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
