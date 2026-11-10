// #68 Kabellos laden — "Leg nie eine Münze auf dein Ladepad."
// PAD (origin, in the car's centre console, set.js): a piano-black tray with
// a rubber mat; under it a flat copper coil on a ferrite plate. Frame 0:
// your hand drops a 2-euro coin onto the live pad — it glows. Then the
// phone goes on, floats up (exploded view) so the coil and the field lines
// show; the phone's own coil and battery in x-ray; the field flips, strobes
// 100,000 times a second. A coin hops out of the cubby onto the pad: eddy
// currents swirl in it, it glows, the pad's LED turns red and switches off.
// HOB on the passenger seat: an induction hob boiling a pot (the analogy).
// Übrigens: the phone back on the pad, warm. Last line: a cable next to it.
import {
  THREE,
  ramp,
  smooth,
  clamp01,
  lerp,
  pop,
  inBack,
  V,
  rng,
  scene,
  real,
  roundedBox,
  xrayMaterial,
  setXray,
  makeArrowSet,
  animateArrows,
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
import { makeCoin, canvasTex, piano, CUBBY } from "./set.js";
import { createHand } from "./hand.js";
import { counter, meter, readout } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS, HOB, PHONE, FIELD, COIN2 } from "./beats.js";

highlights(HIGHLIGHTS);
const PI = Math.PI;
const R = rng(6808);
const between = (t, a, b) => t >= a && t < b;
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = V(1, 1, 1);
const _p = V(0, 0, 0);
const glowMat = (color, opacity = 1) =>
  new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });

// a flat spiral (Archimedes) in the xz plane, as points
function spiral(r0, r1, turns, y, n = 600, cz = 0) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    const a = f * turns * PI * 2;
    const r = lerp(r0, r1, f);
    pts.push(V(Math.cos(a) * r, y, Math.sin(a) * r + cz));
  }
  return pts;
}
// beads running along a polyline: precomputed cumulative lengths
function track(pts) {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1]));
  const L = cum[cum.length - 1];
  const at = (u, out) => {
    let d = (((u % 1) + 1) % 1) * L;
    let lo = 0;
    let hi = cum.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] <= d) lo = mid;
      else hi = mid;
    }
    const k = (d - cum[lo]) / Math.max(1e-6, cum[hi] - cum[lo]);
    return out.copy(pts[lo]).lerp(pts[hi], k);
  };
  return { at, L };
}
function beads(n, size, mat, parent = scene) {
  const im = new THREE.InstancedMesh(new THREE.SphereGeometry(size, 12, 8), mat, n);
  im.frustumCulled = false;
  im.userData.noAO = true;
  parent.add(im);
  return im;
}

// ================================================================ the pad
const pad = new THREE.Group();
scene.add(pad);
{
  // bezel: four piano-black bars around the mat
  const bar = (w, d, x, z) => {
    const m = new THREE.Mesh(roundedBox(w, 0.3, d, 0.1, 4), piano);
    m.position.set(x, 0.24, z);
    m.castShadow = m.receiveShadow = true;
    pad.add(m);
  };
  bar(0.3, 4.6, -1.35, 0);
  bar(0.3, 4.6, 1.35, 0);
  bar(2.4, 0.3, 0, -2.15);
  bar(2.4, 0.3, 0, 2.15);
  // ferrite plate under the coil
  const fer = new THREE.Mesh(
    new THREE.CylinderGeometry(1.08, 1.08, 0.05, 64),
    real.plastic(0x2c2a2a, { roughness: 0.8 }),
  );
  fer.position.y = 0.12;
  pad.add(fer);
}
// the rubber mat (x-ray shell) + its printed charging symbol
const matMat = xrayMaterial(0x1d1f23);
const mat = new THREE.Mesh(roundedBox(2.4, 0.1, 4.0, 0.04, 3), matMat);
mat.position.y = 0.22;
mat.receiveShadow = true;
pad.add(mat);
const decalMat = new THREE.MeshBasicMaterial({
  map: canvasTex(256, 256, (g, w, h) => {
    g.strokeStyle = "rgba(160,165,175,0.55)";
    g.lineWidth = 6;
    g.beginPath();
    g.arc(w / 2, h / 2, 90, 0, PI * 2);
    g.stroke();
    g.fillStyle = "rgba(160,165,175,0.6)";
    g.beginPath();
    g.moveTo(140, 50);
    g.lineTo(95, 140);
    g.lineTo(128, 140);
    g.lineTo(112, 206);
    g.lineTo(165, 112);
    g.lineTo(131, 112);
    g.closePath();
    g.fill();
  }),
  transparent: true,
  depthWrite: false,
});
const decal = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), decalMat);
decal.rotation.x = -PI / 2;
decal.position.y = 0.276;
pad.add(decal);
// the status LED on the bezel end facing you
const ledMat = new THREE.MeshStandardMaterial({
  color: 0x111111,
  emissive: 0x2fd0ff,
  emissiveIntensity: 0,
});
const led = new THREE.Mesh(roundedBox(0.5, 0.06, 0.1, 0.03), ledMat);
led.position.set(0, 0.3, 2.31);
pad.add(led);
const ledLight = new THREE.PointLight(0x2fd0ff, 0, 2.2, 2);
ledLight.position.set(0, 0.45, 2.5);
pad.add(ledLight);

// the copper transmitter coil
const coilMat = real.metal(0xd07a3f, { roughness: 0.28, emissive: 0xff6a20, emissiveIntensity: 0 });
const coilPts = spiral(0.25, 0.98, 10, 0.165, 900);
const coilSegs = 900;
const coilGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coilPts), coilSegs, 0.026, 8);
const coil = new THREE.Mesh(coilGeo, coilMat);
coil.castShadow = true;
pad.add(coil);
const coilTrack = track(coilPts);
const coilBeads = beads(70, 0.026, glowMat(0xffb347));

// ================================================================ the phone
const phone = new THREE.Group();
scene.add(phone);
const PH = { w: 1.5, h: 0.16, d: 3.05 };
const shellMat = xrayMaterial(0x34363c);
const shell = new THREE.Mesh(roundedBox(PH.w, PH.h, PH.d, 0.075, 6), shellMat);
shell.castShadow = true;
phone.add(shell);
// side frame (titanium-ish) — part of the shell look, fades with it
const frameMat = xrayMaterial(0x8b8f96);
const frame = new THREE.Mesh(roundedBox(PH.w + 0.03, PH.h * 0.55, PH.d + 0.03, 0.04, 4), frameMat);
phone.add(frame);
// buttons on the side
for (const [z, l] of [
  [-0.55, 0.35],
  [-0.1, 0.35],
]) {
  const b = new THREE.Mesh(roundedBox(0.05, 0.05, l, 0.02), frameMat);
  b.position.set(-PH.w / 2 - 0.02, 0, z);
  phone.add(b);
}
// USB-C port at the bottom end (+z, facing you)
const port = new THREE.Mesh(
  roundedBox(0.3, 0.05, 0.03, 0.02),
  new THREE.MeshBasicMaterial({ color: 0x050505, transparent: true }),
);
port.position.set(0, 0, PH.d / 2 + 0.006);
phone.add(port);
// the screen: lock screen with the charging bolt and percent
const scrCanvas = document.createElement("canvas");
scrCanvas.width = 300;
scrCanvas.height = 610;
const scrTex = new THREE.CanvasTexture(scrCanvas);
scrTex.colorSpace = THREE.SRGBColorSpace;
const scrMat = new THREE.MeshBasicMaterial({ map: scrTex, transparent: true, toneMapped: false });
const scr = new THREE.Mesh(new THREE.PlaneGeometry(PH.w - 0.1, PH.d - 0.1), scrMat);
scr.rotation.x = -PI / 2;
scr.position.y = PH.h / 2 + 0.004;
phone.add(scr);
let scrKey = "";
function drawScreen(state, pct, hot) {
  const key = `${state}|${pct}|${hot}`;
  if (key === scrKey) return;
  scrKey = key;
  const g = scrCanvas.getContext("2d");
  const w = scrCanvas.width;
  const h = scrCanvas.height;
  // wallpaper: dusk gradient
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, state === "off" ? "#050507" : "#1b2a4a");
  gr.addColorStop(1, state === "off" ? "#050507" : "#c9765a");
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  if (state === "off") return;
  g.fillStyle = "#000";
  g.beginPath();
  g.roundRect(w / 2 - 45, 16, 90, 24, 12); // the island
  g.fill();
  g.fillStyle = "#fff";
  g.textAlign = "center";
  g.font = "600 92px Montserrat, Arial";
  g.fillText("18:42", w / 2, 170);
  if (state === "charge") {
    // the bolt in a ring + percent
    g.strokeStyle = "rgba(255,255,255,0.25)";
    g.lineWidth = 12;
    g.beginPath();
    g.arc(w / 2, 360, 70, 0, PI * 2);
    g.stroke();
    g.strokeStyle = hot ? "#ffb02e" : "#3dff7a";
    g.beginPath();
    g.arc(w / 2, 360, 70, -PI / 2, -PI / 2 + (pct / 100) * PI * 2);
    g.stroke();
    g.fillStyle = hot ? "#ffb02e" : "#3dff7a";
    g.beginPath();
    g.moveTo(w / 2 + 10, 315);
    g.lineTo(w / 2 - 22, 368);
    g.lineTo(w / 2 - 2, 368);
    g.lineTo(w / 2 - 12, 408);
    g.lineTo(w / 2 + 22, 350);
    g.lineTo(w / 2 + 2, 350);
    g.closePath();
    g.fill();
    g.fillStyle = "#fff";
    g.font = "800 64px Montserrat, Arial";
    g.fillText(`${pct} %`, w / 2, 500);
  }
  scrTex.needsUpdate = true;
}
// inside: the receiver coil (front half) and the battery (back half)
const rxPts = spiral(0.12, 0.55, 8, -0.035, 600, 0.35);
const rxMat = real.metal(0xd07a3f, { roughness: 0.3, emissive: 0xffc040, emissiveIntensity: 0 });
const rx = new THREE.Mesh(
  new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rxPts), 600, 0.018, 6),
  rxMat,
);
phone.add(rx);
const rxTrack = track(rxPts);
// wire from the coil to the battery + the battery
const wirePts = [V(0.55, -0.035, 0.35), V(0.6, -0.03, 0.0), V(0.4, -0.02, -0.35)];
const wire = new THREE.Mesh(
  new THREE.TubeGeometry(new THREE.CatmullRomCurve3(wirePts), 40, 0.02, 6),
  rxMat,
);
phone.add(wire);
const batt = new THREE.Mesh(
  roundedBox(1.15, 0.08, 1.2, 0.03),
  real.metal(0x9aa3ad, { roughness: 0.45 }),
);
batt.position.set(0, -0.02, -0.85);
phone.add(batt);
const fillMat = new THREE.MeshBasicMaterial({ color: 0x3dff7a, toneMapped: false });
const fill = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.085, 1.05), fillMat);
fill.position.set(0, -0.02, -0.85);
phone.add(fill);
const inner = [rx, wire, batt, fill];
const flowTrack = track([...rxPts, ...wirePts]);
const rxBeads = beads(46, 0.022, glowMat(0xffe14a));
// heat rising from the phone (Übrigens)
const phoneHeat = makeArrowSet(
  [
    [V(-0.4, 0.15, -0.6), V(-0.6, 1.3, -0.8)],
    [V(0.3, 0.15, 0.2), V(0.5, 1.4, 0.3)],
    [V(0.0, 0.15, 0.9), V(0.1, 1.2, 1.2)],
  ],
  { parent: phone },
);

// ================================================================ the field
// 8 loops around the axis: up through the coil centre, out, down outside
const fieldLines = [];
const fieldMat = glowMat(0x4fc3ff, 0.55);
const fieldMatNeg = glowMat(0xffa83a, 0.55);
const loopPts = [
  [0.12, 0.2],
  [0.22, 1.0],
  [0.45, 2.1],
  [1.05, 2.6],
  [1.75, 2.1],
  [2.0, 1.2],
  [1.75, 0.45],
  [1.2, 0.2],
];
const fieldTracks = [];
for (let i = 0; i < 8; i++) {
  const a = (i / 8) * PI * 2 + 0.2;
  const pts = loopPts.map(([r, y]) => V(Math.cos(a) * r, y, Math.sin(a) * r));
  const curve = new THREE.CatmullRomCurve3(pts);
  const dense = curve.getPoints(120);
  fieldTracks.push(track(dense));
  const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 0.011, 6), fieldMat);
  m.userData.noAO = true;
  m.renderOrder = 3;
  scene.add(m);
  fieldLines.push(m);
}
const fieldBeads = beads(8 * 9, 0.028, glowMat(0xbfe8ff));
// a big direction arrow in the middle of the coil (flips with the field)
const dirArrow = new THREE.Group();
{
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.9, 16),
    glowMat(0xffffff, 0.9),
  );
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.35, 24), glowMat(0xffffff, 0.9));
  head.position.y = 0.6;
  dirArrow.add(shaft, head);
  dirArrow.position.set(0, 1.0, 0);
  scene.add(dirArrow);
}

// ================================================================ the coins
function hotCoin() {
  const c = makeCoin("zwei", 0.26);
  const mats = [];
  c.traverse((m) => {
    if (m.isMesh) {
      m.material = m.material.clone();
      m.material.emissive = new THREE.Color(0xff3a10);
      mats.push(m.material);
    }
  });
  scene.add(c);
  return { c, mats };
}
const coin1 = hotCoin();
const coin2 = hotCoin();
const COIN_Y = 0.27 + 0.026;
const coinLight = new THREE.PointLight(0xff5a1a, 0, 3, 2);
scene.add(coinLight);
const coinHeat = makeArrowSet([
  [V(-0.12, 0.38, 0), V(-0.25, 1.1, -0.05)],
  [V(0.1, 0.38, 0.06), V(0.22, 1.15, 0.1)],
  [V(0.0, 0.38, -0.1), V(0.02, 1.05, -0.25)],
]);
// eddy currents: three rings of beads swirling on the coin face
const eddyBeads = beads(36, 0.014, glowMat(0xffd23f));
function setCoinHeat(cn, k) {
  for (const m of cn.mats) m.emissiveIntensity = 1.5 * k * k;
}

// ================================================================ the cable
const cable = new THREE.Group();
scene.add(cable);
{
  const cMat = real.rubber(0xeeeeee, { roughness: 0.55 });
  const pts = [
    V(0, 0, 0.35),
    V(0.15, 0, 1.2),
    V(0.9, 0, 2.0),
    V(2.0, 0, 2.3),
    V(3.2, 0, 2.0),
    V(4.2, 0, 2.8),
  ];
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.06, 10),
    cMat,
  );
  tube.castShadow = true;
  cable.add(tube);
  const housing = new THREE.Mesh(roundedBox(0.36, 0.14, 0.5, 0.06), cMat);
  housing.position.z = 0.2;
  cable.add(housing);
  const plug = new THREE.Mesh(
    roundedBox(0.26, 0.07, 0.25, 0.03),
    real.metal(0xd9dce0, { roughness: 0.2 }),
  );
  plug.position.z = -0.12;
  cable.add(plug);
  cable.traverse((m) => m.isMesh && (m.castShadow = true));
}

// ================================================================ the induction hob (analogy)
const hob = new THREE.Group();
hob.position.set(...HOB);
scene.add(hob);
const ringMat = new THREE.MeshBasicMaterial({
  color: 0xff3a1a,
  transparent: true,
  opacity: 0,
  toneMapped: false,
});
const water = [];
{
  const glass = new THREE.Mesh(
    roundedBox(4.4, 0.22, 4.4, 0.1, 4),
    real.gloss(0x0c0c0e, { roughness: 0.08 }),
  );
  glass.position.y = 0.11;
  glass.castShadow = glass.receiveShadow = true;
  hob.add(glass);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.04, 8, 64), ringMat);
  ring.rotation.x = -PI / 2;
  ring.position.y = 0.225;
  hob.add(ring);
  // the pot: steel lathe + two handles + water
  const pts = [
    V(0, 0, 0),
    V(1.18, 0, 0),
    V(1.22, 0.06, 0),
    V(1.22, 1.3, 0),
    V(1.27, 1.34, 0),
    V(1.16, 1.34, 0),
    V(1.14, 0.08, 0),
  ].map((p) => new THREE.Vector2(p.x, p.y));
  const pot = new THREE.Mesh(
    new THREE.LatheGeometry(pts, 64),
    real.metal(0xc8ccd2, { roughness: 0.22, side: THREE.DoubleSide }),
  );
  pot.position.y = 0.23;
  pot.castShadow = true;
  hob.add(pot);
  for (const s of [-1, 1]) {
    const h = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 8, 24, PI), real.metal(0x9aa0a8));
    h.position.set(s * 1.3, 1.3, 0);
    h.rotation.set(PI / 2, 0, s > 0 ? -PI / 2 : PI / 2);
    hob.add(h);
  }
  const w = new THREE.Mesh(
    new THREE.CircleGeometry(1.13, 48),
    real.glass(0x6fb3d9, { opacity: 0.85 }),
  );
  w.rotation.x = -PI / 2;
  w.position.y = 1.25;
  hob.add(w);
  for (let i = 0; i < 18; i++) {
    const b = new THREE.Mesh(
      new THREE.SphereGeometry(0.06 + R() * 0.05, 12, 8),
      real.glass(0xffffff, { opacity: 0.6 }),
    );
    const a = R() * PI * 2;
    const r = Math.sqrt(R()) * 0.95;
    b.userData = { x: Math.cos(a) * r, z: Math.sin(a) * r, ph: R() };
    hob.add(b);
    water.push(b);
  }
}
const steam = [];
{
  const sMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
  });
  for (let i = 0; i < 14; i++) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 8), sMat.clone());
    s.userData = { x: (R() - 0.5) * 1.4, z: (R() - 0.5) * 1.4, ph: R() };
    hob.add(s);
    steam.push(s);
  }
}

// ================================================================ hand
const hand = createHand({ scale: 3.6, sleeve: 0x3b4b63, skin: 0xe9b997 });

const applyCamera = shotCamera(shots);

// ================================================================ render
function renderAt(t) {
  // ---------------------------------------------------------- field state
  // direction: steady at first, flips on "dreht", strobes on 100.000
  let dir = 1;
  if (t >= T.dreht - 0.1 && t < T.folge) dir = Math.floor((t - T.dreht + 0.1) / 0.45) % 2 ? -1 : 1;
  if (t >= T.rate && t < T.mal100k)
    dir = Math.sin(t * PI * 2 * lerp(2, 9, ramp(t, T.rate, T.mal100k))) > 0 ? 1 : -1;
  if (t >= T.mal100k && t < T.spuert) dir = Math.floor(t * 30) % 2 ? -1 : 1;
  let fieldK = 0;
  if (between(t, FIELD.on, T.spuert)) fieldK = smooth(ramp(t, FIELD.on, FIELD.on + 0.5));
  if (between(t, COIN2.land, FIELD.off)) fieldK = 0.75;
  if (t >= T.fakt) fieldK = 0.5;
  // off-switch: "schalten" → gone
  const fieldShow = fieldK > 0.01 && !between(t, T.deiner, T.fakt);
  fieldMat.opacity = 0.55 * fieldK;
  fieldMatNeg.opacity = 0.55 * fieldK;
  const strobe = t >= T.mal100k && t < T.spuert ? (Math.floor(t * 30) % 2 ? 1 : 0.35) : 1;
  for (const m of fieldLines) {
    m.visible = fieldShow;
    m.material = dir > 0 ? fieldMat : fieldMatNeg;
  }
  fieldBeads.visible = fieldShow;
  fieldBeads.material.color.set(dir > 0 ? 0xbfe8ff : 0xffd9a0);
  fieldBeads.material.opacity = fieldK * strobe;
  {
    let i = 0;
    const burst = smooth(ramp(t, FIELD.on, FIELD.on + 0.6));
    const reach = t >= FIELD.on && t < T.spuert ? 0.4 + 0.6 * burst : 1;
    // integrate a phase that runs forward / backward with the direction
    const ph = t * 0.35 * dir;
    for (let l = 0; l < 8; l++)
      for (let b = 0; b < 9; b++) {
        const u = (b / 9 + ph + l * 0.05) * reach;
        fieldTracks[l].at(u, _p);
        _m.compose(_p, _q, _s.setScalar(fieldShow ? 1 : 0.001));
        fieldBeads.setMatrixAt(i++, _m);
      }
    fieldBeads.instanceMatrix.needsUpdate = true;
    for (const m of fieldLines) m.scale.set(1, Math.max(0.001, reach), 1);
  }
  dirArrow.visible = fieldShow && between(t, T.nur, T.spuert);
  dirArrow.rotation.z = dir > 0 ? 0 : PI;
  dirArrow.scale.setScalar(pop(t, T.nur, T.spuert));

  // pad LED: blue while charging, red blinking after the switch-off
  const off = between(t, FIELD.off, T.fakt);
  const ledOn = fieldK > 0.05 || off;
  ledMat.emissive.set(off ? 0xff2a1a : 0x2fd0ff);
  ledMat.emissiveIntensity = ledOn ? (off ? (Math.floor(t * 4) % 2 ? 3 : 0.3) : 2.2) : 0;
  ledLight.color.set(off ? 0xff2a1a : 0x2fd0ff);
  ledLight.intensity = ledMat.emissiveIntensity * 0.8;

  // pad x-ray: the mat turns to glass to show the coil
  const padX =
    smooth(ramp(t, T.im1 + 0.2, T.im1 + 0.7)) * (1 - ramp(t, T.folge - 0.3, T.folge)) +
    smooth(ramp(t, T.rate, T.rate + 0.4)) * (1 - ramp(t, T.spuert - 0.3, T.spuert));
  setXray([matMat], padX);
  decalMat.opacity = 1 - padX;
  // the coil grows on "Kupferspule", glows while current runs
  const grow = t < T.im1 ? 1 : smooth(ramp(t, T.kupferspule - 0.5, T.kupferspule + 0.6));
  coilGeo.setDrawRange(0, Math.ceil(grow * coilSegs) * 8 * 6);
  const current = fieldK > 0.05 || between(t, T.strom1, FIELD.on);
  coilMat.emissiveIntensity = current ? 0.25 + 0.2 * Math.sin(t * 9) : 0;
  {
    const showB = current && padX > 0.5;
    coilBeads.visible = showB;
    // back and forth: an oscillating phase (alternating current)
    const f = between(t, T.mal100k, T.spuert) ? 8 : 1.1;
    const osc = Math.sin(t * PI * 2 * f) * 0.06;
    for (let i = 0; i < 70; i++) {
      coilTrack.at(i / 70 + osc, _p);
      _m.compose(_p, _q, _s.setScalar(1));
      coilBeads.setMatrixAt(i, _m);
    }
    coilBeads.instanceMatrix.needsUpdate = true;
  }

  // ---------------------------------------------------------- phone
  let phoneOn = false;
  let py = 0.36;
  let pz = 0;
  let prx = 0;
  if (between(t, T.legst - 0.6, PHONE.away) || t >= PHONE.back) {
    phoneOn = true;
    if (t < PHONE.land) {
      const k = smooth(ramp(t, T.legst - 0.6, PHONE.land));
      py = lerp(3.2, 0.36, k);
      pz = lerp(1.6, 0, k);
      prx = lerp(-0.5, 0, k);
    } else if (between(t, PHONE.up, PHONE.down)) {
      const k = smooth(ramp(t, PHONE.up, PHONE.up + 0.7));
      py = lerp(0.36, 1.66, k) + Math.sin(t * 1.6) * 0.03 * k;
      prx = Math.sin(t * 1.1) * 0.02 * k;
    }
  }
  phone.visible = phoneOn;
  phone.position.set(0, py, pz);
  phone.rotation.set(prx, 0, 0);
  const phoneX =
    smooth(ramp(t, T.im2 - 0.3, T.im2 + 0.3)) * (1 - ramp(t, T.nur - 0.2, T.nur + 0.3));
  setXray([shellMat, frameMat], phoneX);
  scrMat.opacity = 1 - phoneX;
  port.material.opacity = 1 - phoneX;
  for (const m of inner) m.visible = phoneX > 0.05;
  const charging = phoneOn && t >= PHONE.land + 0.1 && !between(t, T.spuert, T.fakt);
  const pct = Math.round(
    t < T.fakt
      ? 23 + 9 * ramp(t, PHONE.land, T.folge) + 2 * ramp(t, T.folge, T.spuert)
      : 61 + 3 * ramp(t, T.fakt, 45),
  );
  drawScreen(charging ? "charge" : "off", pct, t >= T.fakt);
  rxMat.emissiveIntensity = between(t, T.schubst, T.nur) ? 0.6 : 0;
  {
    const showB = phoneX > 0.5 && t >= T.schubst;
    rxBeads.visible = showB;
    const toBatt = t >= T.strom2;
    for (let i = 0; i < 46; i++) {
      const u = i / 46;
      if (toBatt) flowTrack.at(u * 1.0 + t * 0.22, _p);
      else rxTrack.at(u + Math.sin(t * PI * 2 * 1.1) * 0.05, _p);
      _p.y += py;
      _p.z += pz;
      _m.compose(_p, _q, _s.setScalar(1));
      rxBeads.setMatrixAt(i, _m);
    }
    rxBeads.instanceMatrix.needsUpdate = true;
  }
  const charge = 0.23 + 0.5 * ramp(t, T.strom2, T.nur);
  fill.scale.set(1, 1, Math.max(0.02, charge));
  fill.position.z = -0.85 + (1.05 * (1 - charge)) / 2;
  animateArrows(phoneHeat, t, pop(t, T.fakt + 0.6, 45.5));

  // ---------------------------------------------------------- hand
  hand.track(t, [
    // brings the phone
    { t: T.legst - 0.6, pos: [-0.2, 3.4, 4.3], rot: [0.15, PI, 0], pose: "grab" },
    { t: PHONE.land, pos: [0, 0.62, 2.75], rot: [0.12, PI, 0], pose: "grab" },
    { t: PHONE.land + 0.25, pos: [0, 0.75, 2.95], rot: [0.12, PI, 0], pose: "open" },
    { t: T.kein - 0.3, pos: [-0.6, 2.6, 3.4], rot: [0.2, PI, 0], pose: "open", out: true },
    // the last line: puts the phone down again next to the cable
    { t: T.ladepad2 - 0.4, pos: [-2.6, 2.2, 3.6], rot: [0.2, 2.5, 0], pose: "point" },
    { t: T.kabel, pos: [-0.9, 0.85, 1.6], rot: [0.3, 2.5, 0], pose: "point" },
    { t: 45.5, pos: [-1.0, 0.9, 1.7], rot: [0.3, 2.5, 0], pose: "press" },
  ]);

  // ---------------------------------------------------------- coins
  {
    // hook coin: falls out of the hand, glows, flicked away on "Stell"
    const c = coin1.c;
    const fall = smooth(ramp(t, -0.3, 0.15));
    const bounce = Math.abs(Math.sin(ramp(t, 0.15, 0.42) * PI)) * 0.08 * (1 - ramp(t, 0.15, 0.42));
    c.visible = t < T.stell + 0.35;
    c.position.set(lerp(-0.15, 0, fall), lerp(1.0, COIN_Y, fall) + bounce, lerp(0.2, 0.1, fall));
    c.rotation.set(lerp(0.9, 0, fall), 0.4, lerp(0.4, 0, fall));
    const out = inBack(ramp(t, T.stell, T.stell + 0.35));
    c.scale.setScalar(Math.max(0.001, 1 - out));
    const heat1 = smooth(ramp(t, 0.15, 0.9)) * (1 - ramp(t, T.stell, T.stell + 0.3));
    setCoinHeat(coin1, heat1);
    // coin 2: hops from the cubby onto the pad, swirls, glows, cools, glows on "kocht"
    const c2 = coin2.c;
    c2.visible = between(t, T.spuert - 0.35, T.fakt);
    const hop = smooth(ramp(t, COIN2.hop, COIN2.land));
    c2.position.set(
      0.6 - 0.6 * hop,
      lerp(0.25, COIN_Y, hop) + Math.sin(hop * PI) * 1.3,
      lerp(CUBBY.z, 0.05, hop),
    );
    c2.rotation.set(Math.sin(hop * PI) * 2.2, 0.8, 0);
    let heat2 = smooth(ramp(t, T.machen, T.heiss + 0.4)) * (1 - 0.55 * ramp(t, FIELD.off, T.darum));
    if (t >= T.darum) heat2 = 0.45 + 0.55 * smooth(ramp(t, T.kocht - 0.2, T.kocht + 0.4));
    setCoinHeat(coin2, heat2);
    const hot = t < T.spuert ? heat1 : heat2;
    const hc = t < T.spuert ? c : c2;
    coinLight.position.set(hc.position.x, hc.position.y + 0.4, hc.position.z);
    coinLight.intensity = 6 * hot;
    animateArrows(
      coinHeat,
      t,
      hot > 0.5 && (c.visible || c2.visible) ? clamp01((hot - 0.5) * 3) : 0,
    );
    // smoke wisps off the hot coin
    for (const at of [0.6, 1.2]) puff(`s${at}`, t, at, 0, COIN_Y + 0.05, 0.1, 0.25, 0xcfcfcf);
    for (const at of [T.heiss + 0.2, T.heiss + 0.7, T.kocht + 0.3])
      puff(`s${at}`, t, at, 0, COIN_Y + 0.05, 0.05, 0.25, 0xcfcfcf);
    // eddy rings
    const ed = between(t, T.wirbelt - 0.2, T.gute) && c2.visible;
    eddyBeads.visible = ed;
    if (ed) {
      let i = 0;
      for (const [r, n, sp] of [
        [0.07, 8, 3.0],
        [0.14, 12, 2.2],
        [0.21, 16, 1.6],
      ])
        for (let k = 0; k < n; k++) {
          const a = (k / n) * PI * 2 + t * sp * PI;
          _p.set(
            c2.position.x + Math.cos(a) * r,
            c2.position.y + 0.08,
            c2.position.z + Math.sin(a) * r,
          );
          _m.compose(_p, _q, _s.setScalar(smooth(ramp(t, T.wirbelt - 0.2, T.wirbelt + 0.3))));
          eddyBeads.setMatrixAt(i++, _m);
        }
      eddyBeads.instanceMatrix.needsUpdate = true;
    }
  }

  // ---------------------------------------------------------- cable
  if (between(t, T.kein, T.trotzdem)) {
    cable.visible = true;
    const k = smooth(ramp(t, T.kein, T.kein + 0.5));
    cable.position.set(0, 0.36, lerp(3.4, 2.05, k));
    cable.rotation.set(0, 0, 0);
    cable.scale.setScalar(1);
  } else if (t >= T.ladepad2) {
    cable.visible = true;
    cable.position.set(1.75, 0.18, 0.9);
    cable.rotation.set(0, -0.5, 0);
    cable.scale.copy(squash(t, T.kabel - 0.3));
  } else cable.visible = false;
  showNope(
    between(t, T.kontakt, T.trotzdem)
      ? pop(t, T.kontakt, T.trotzdem)
      : between(t, T.ladepad1, T.stell)
        ? pop(t, T.ladepad1, T.stell)
        : 0,
    0,
    between(t, T.kontakt, T.trotzdem) ? 0.75 : 1.4,
    between(t, T.kontakt, T.trotzdem) ? 1.9 : 0.15,
    1.1,
  );

  // ---------------------------------------------------------- hob
  const hobOn = between(t, T.herd - 0.2, T.fakt);
  hob.visible = hobOn;
  if (hobOn) {
    hob.scale.copy(squash(t, T.herd - 0.15));
    puff("hob", t, T.herd, HOB[0], HOB[1] + 0.1, HOB[2], 1.0);
    const boil = smooth(ramp(t, T.herd + 0.1, T.herd + 0.6));
    ringMat.opacity = boil * (0.7 + 0.3 * Math.sin(t * 20));
    for (const b of water) {
      const { x, z, ph } = b.userData;
      const c = (t * 2.4 + ph) % 1;
      b.position.set(x, 1.26 + c * 0.1 * boil, z);
      b.scale.setScalar(Math.max(0.001, boil * Math.sin(c * PI)));
    }
    for (const s of steam) {
      const { x, z, ph } = s.userData;
      const c = (t * 0.6 + ph) % 1;
      s.position.set(x + Math.sin(c * 5 + ph * 9) * 0.2, 1.4 + c * 2.6, z);
      s.scale.setScalar(0.5 + c * 1.6);
      s.material.opacity = 0.32 * boil * Math.sin(c * PI);
    }
  }

  // ---------------------------------------------------------- HUD + panel
  meter("akku", pop(t, T.trotzdem, T.im1), {
    label: "AKKU",
    value: pct / 100,
    x: 300,
    y: 560,
    width: 420,
    color: "#3dff7a",
    text: `⚡ ${pct} %`,
  });
  const cnt = Math.round(100000 * Math.pow(ramp(t, T.rate + 0.3, T.mal100k), 3));
  counter("hz", pop(t, T.rate + 0.2, T.mal100k), {
    label: "Richtungswechsel pro Sekunde",
    value: cnt,
    x: 90,
    y: 540,
    color: "#4fc3ff",
  });
  meter("hitze", pop(t, T.machen, T.gute), {
    label: "MÜNZE",
    value: 0.2 + 0.8 * smooth(ramp(t, T.machen, T.heiss + 0.5)),
    x: 300,
    y: 560,
    width: 420,
    color: "#ff4b2b",
    text: "HEISS",
  });
  readout("aus", pop(t, T.schalten, T.darum), {
    label: "LADEPAD",
    value: "AUS",
    note: "Metall erkannt",
    x: 300,
    y: 540,
    color: "#ff4b2b",
  });
  meter("kabel", pop(t, T.verbraucht - 0.2, T.p47), {
    label: "KABEL",
    value: 0.68,
    x: 300,
    y: 520,
    width: 440,
    color: "#3dff7a",
    text: "Strom",
  });
  meter("kabellos", pop(t, T.verbraucht + 0.1, T.p47), {
    label: "KABELLOS",
    value: 1,
    x: 300,
    y: 680,
    width: 440,
    color: "#ff4b2b",
    text: "bis +47 %",
  });
  if (between(t, T.mal100k, T.spuert))
    showPanel(pop(t, T.mal100k, T.spuert), "PRO SEKUNDE", "100.000×", LED.blue);
  else if (between(t, T.p47, T.ladepad2))
    showPanel(pop(t, T.p47, T.ladepad2), "MEHR STROM", "+47 %", LED.red);
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
