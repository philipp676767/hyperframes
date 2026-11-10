// #64 Blitzer — a speed camera column on a country road at night (set.js).
// The picture: the viewer's car brakes hard into frame and the box flashes
// red anyway (frame 0), the night drive replayed (box in the headlights, in
// die Eisen, BLITZ), an invisible infrared flash, the column turns to glass
// (radar inside), blue waves fly to the car and come back squeezed red, an
// ambulance with its siren rings bunching up in front, the speedometer
// climbs, "Rate mal" frozen in the beam, the laser unit and hundreds of
// pulses racing far up the road, the camera's own viewfinder, the violet
// Schwarzblitz, the ride inside the car, the red ghost car where the
// measurement really happened, the warning app on the phone with a ✕, and
// the next car flashed at the end.
import {
  THREE,
  ramp,
  smooth,
  lerp,
  pop,
  V,
  scene,
  camera,
  real,
  roundedBox,
  xrayMaterial,
  xrayEdges,
  setXray,
  showNope,
  showPanel,
  showLabel,
  LED,
  labels,
  squash,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import "./set.js";
import { LANE_FAR } from "./set.js";
import { createHand } from "./hand.js";
import { viewfinder, gauge, readout } from "./hud.js";
import {
  T,
  shots,
  LABELS,
  HIGHLIGHTS,
  FLASHES,
  BOX_YAW,
  RADAR,
  FLASH,
  LANE,
  AMB_X,
  GHOST_X,
} from "./beats.js";

highlights(HIGHLIGHTS);

const mesh = (geo, mat, parent, x = 0, y = 0, z = 0, shadow = true) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = shadow;
  parent.add(m);
  return m;
};
const glowMat = (c, o = 1, blend = THREE.NormalBlending) =>
  new THREE.MeshBasicMaterial({
    color: c,
    transparent: o < 1 || blend !== THREE.NormalBlending,
    opacity: o,
    blending: blend,
    depthWrite: false,
  });

// ---------------------------------------------------------------- flashes
// red (visible) or infrared (violet, faint) — envelope of every flash at t
function flashK(t, ir) {
  let k = 0;
  for (const f of FLASHES) {
    if (f.ir !== ir) continue;
    const x = t - f.at;
    if (x < 0 || x > 0.9) continue;
    k = Math.max(k, x < 0.03 ? x / 0.03 : Math.exp(-(x - 0.03) / (ir ? 0.22 : 0.12)));
  }
  return k;
}
// afterglow of the flash window (the tube stays warm a moment)
function afterglow(t) {
  let k = 0;
  for (const f of FLASHES) {
    if (f.ir) continue;
    const x = t - f.at;
    if (x >= 0 && x < 2.5) k = Math.max(k, Math.exp(-x / 0.8));
  }
  return k;
}

// red screen tint over the frame for the visible flash (on top of the white highlight flash)
const redEl = document.createElement("div");
redEl.style.cssText =
  "position:absolute;inset:0;pointer-events:none;opacity:0;mix-blend-mode:screen;" +
  "background:radial-gradient(circle at 50% 45%, rgba(255,40,30,.95), rgba(160,0,0,.55) 60%, rgba(60,0,0,.2));";
document.getElementById("root").insertBefore(redEl, document.getElementById("captions"));

// ---------------------------------------------------------------- the speed camera column
const box = new THREE.Group();
box.rotation.y = BOX_YAW;
scene.add(box);
const shellMat = xrayMaterial(0x9aa1a8, { metalness: 0.55, roughness: 0.32 });
const capMat = xrayMaterial(0x2b2e33, { metalness: 0.3, roughness: 0.4 });
const COL_W = 0.62;
const COL_H = 2.9;
{
  // concrete foundation (flush with the verge, not a plinth)
  mesh(
    roundedBox(0.95, 0.14, 0.95, 0.03),
    real.plastic(0x8a8780, { roughness: 0.95, clearcoat: 0 }),
    box,
    0,
    0.05,
    0,
  );
  const bodyGeo = roundedBox(COL_W, COL_H, COL_W, 0.06);
  mesh(bodyGeo, shellMat, box, 0, 0.12 + COL_H / 2, 0);
  const e = xrayEdges(bodyGeo);
  e.position.set(0, 0.12 + COL_H / 2, 0);
  box.add(e);
  const capGeo = roundedBox(0.72, 0.16, 0.72, 0.05);
  mesh(capGeo, capMat, box, 0, 0.12 + COL_H + 0.06, 0);
  // dark base band
  mesh(roundedBox(0.645, 0.3, 0.645, 0.04), capMat, box, 0, 0.27, 0);
}
const F = COL_W / 2 + 0.006; // front face
// radar / laser window (dark glass)
const winMat = real.gloss(0x0b0d12, { roughness: 0.08 });
mesh(roundedBox(0.46, 0.34, 0.03, 0.04), winMat, box, 0, 2.5, F);
// camera window with the lens ring
mesh(roundedBox(0.46, 0.34, 0.03, 0.04), winMat, box, 0, 1.95, F);
mesh(
  new THREE.TorusGeometry(0.085, 0.018, 16, 48),
  real.metal(0x707780, { roughness: 0.25 }),
  box,
  0,
  1.95,
  F + 0.02,
);
mesh(
  new THREE.CircleGeometry(0.075, 48),
  real.gloss(0x1b2a44, { roughness: 0.02, emissive: 0x0a1430 }),
  box,
  0,
  1.95,
  F + 0.022,
);
// the flash window: red filter glass
const flashMat = new THREE.MeshPhysicalMaterial({
  color: 0x5a0d10,
  roughness: 0.15,
  clearcoat: 1,
  emissive: 0xff1a10,
  emissiveIntensity: 0.05,
});
mesh(roundedBox(0.48, 0.28, 0.035, 0.05), flashMat, box, 0, 1.38, F);
// fine ribs on the flash filter
for (let i = 0; i < 6; i++)
  mesh(
    new THREE.BoxGeometry(0.44, 0.006, 0.004),
    real.plastic(0x30080a),
    box,
    0,
    1.28 + i * 0.04,
    F + 0.02,
    false,
  );
// details: door seam on the side, lock, vent slots, plate, status LED
const seamMat = real.plastic(0x2a2d31, { roughness: 0.6 });
mesh(new THREE.BoxGeometry(0.008, 2.3, 0.008), seamMat, box, COL_W / 2 + 0.002, 1.5, -0.2, false);
mesh(new THREE.BoxGeometry(0.008, 2.3, 0.008), seamMat, box, COL_W / 2 + 0.002, 1.5, 0.2, false);
mesh(
  new THREE.CylinderGeometry(0.022, 0.022, 0.02, 20),
  real.metal(0xc0c6cc, { roughness: 0.2 }),
  box,
  COL_W / 2 + 0.01,
  1.4,
  0.12,
).rotation.z = Math.PI / 2;
for (let i = 0; i < 4; i++)
  mesh(new THREE.BoxGeometry(0.3, 0.018, 0.01), seamMat, box, 0, 0.55 + i * 0.05, F, false);
{
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 96;
  const g = c.getContext("2d");
  g.fillStyle = "#f4f4f0";
  g.fillRect(0, 0, 256, 96);
  g.fillStyle = "#1d3c8f";
  g.fillRect(0, 0, 256, 22);
  g.fillStyle = "#111";
  g.font = "bold 34px Arial";
  g.fillText("VKÜ 64", 22, 70);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  mesh(
    new THREE.PlaneGeometry(0.22, 0.083),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }),
    box,
    0,
    0.92,
    F + 0.004,
    false,
  );
}
const ledMat = new THREE.MeshBasicMaterial({ color: 0x3dff7a });
mesh(new THREE.SphereGeometry(0.014, 12, 8), ledMat, box, 0.17, 2.82, F, false);

// flash light + glow (visible red, infrared violet)
const flashLight = new THREE.PointLight(0xff2a18, 0, 26, 1.4);
flashLight.position.set(FLASH[0] + 0.25, FLASH[1], FLASH[2] + 0.35);
scene.add(flashLight);
const flashGlowMat = glowMat(0xff3322, 0, THREE.AdditiveBlending);
const flashGlow = mesh(
  new THREE.CircleGeometry(1, 48),
  flashGlowMat,
  box,
  0,
  1.38,
  F + 0.05,
  false,
);
flashGlow.userData.noAO = true;
const irGlowMat = glowMat(0x8a3cff, 0, THREE.AdditiveBlending);
const irGlow = mesh(new THREE.CircleGeometry(1, 48), irGlowMat, box, 0, 1.38, F + 0.055, false);
irGlow.userData.noAO = true;
// soft glow texture for both
{
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(64, 64, 2, 64, 64, 62);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.25, "rgba(255,255,255,0.55)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  flashGlowMat.map = tex;
  irGlowMat.map = tex;
}

// ---- inside (only while x-ray)
const inside = new THREE.Group();
box.add(inside);
// radar module: green board with a grid of gold patch antennas
const radar = new THREE.Group();
radar.position.set(0, 2.5, 0.18);
inside.add(radar);
mesh(roundedBox(0.4, 0.3, 0.025, 0.01), real.plastic(0x1f6b3a, { roughness: 0.5 }), radar);
const goldMat = real.metal(0xd9a640, { roughness: 0.25 });
for (let i = 0; i < 4; i++)
  for (let j = 0; j < 3; j++)
    mesh(
      new THREE.BoxGeometry(0.06, 0.05, 0.008),
      goldMat,
      radar,
      -0.135 + i * 0.09,
      -0.08 + j * 0.08,
      0.016,
      false,
    );
// laser scanner: black housing, spinning mirror, red emitter
const laser = new THREE.Group();
laser.position.set(0, 2.5, 0.12);
inside.add(laser);
mesh(roundedBox(0.36, 0.26, 0.18, 0.03), real.plastic(0x141519, { roughness: 0.35 }), laser);
const mirror = mesh(
  new THREE.BoxGeometry(0.12, 0.12, 0.01),
  real.metal(0xe6ecf2, { roughness: 0.05 }),
  laser,
  0,
  0,
  0.1,
  false,
);
const emitter = mesh(
  new THREE.CylinderGeometry(0.03, 0.03, 0.04, 20),
  new THREE.MeshBasicMaterial({ color: 0xff2020 }),
  laser,
  0.12,
  -0.07,
  0.1,
  false,
);
emitter.rotation.x = Math.PI / 2;
// camera body + lens barrel
const cam = new THREE.Group();
cam.position.set(0, 1.95, 0.02);
inside.add(cam);
mesh(roundedBox(0.26, 0.2, 0.3, 0.03), real.plastic(0x1c1d22, { roughness: 0.4 }), cam);
const barrel = mesh(
  new THREE.CylinderGeometry(0.07, 0.08, 0.18, 32),
  real.metal(0x2a2c30, { roughness: 0.3 }),
  cam,
  0,
  0,
  0.22,
);
barrel.rotation.x = Math.PI / 2;
// flash: capacitors + tube
const fl = new THREE.Group();
fl.position.set(0, 1.38, 0.05);
inside.add(fl);
for (const sx of [-0.15, 0, 0.15]) {
  const cap = mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.2, 24),
    real.plastic(0x2c5fd6, { roughness: 0.3 }),
    fl,
    sx,
    -0.02,
    -0.12,
  );
  cap.rotation.x = 0;
}
const tubeMat = new THREE.MeshStandardMaterial({
  color: 0xffd9d0,
  emissive: 0xff3020,
  emissiveIntensity: 0,
});
const tube = mesh(
  new THREE.CylinderGeometry(0.018, 0.018, 0.38, 16),
  tubeMat,
  fl,
  0,
  0,
  0.12,
  false,
);
tube.rotation.z = Math.PI / 2;
// computer with blinking LEDs + cables
const comp = new THREE.Group();
comp.position.set(0, 0.9, 0);
inside.add(comp);
mesh(roundedBox(0.4, 0.34, 0.36, 0.02), real.plastic(0x3a3f47, { roughness: 0.5 }), comp);
const compLeds = [];
for (let i = 0; i < 5; i++)
  compLeds.push(
    mesh(
      new THREE.SphereGeometry(0.012, 8, 6),
      new THREE.MeshBasicMaterial({ color: 0x3dff7a }),
      comp,
      -0.12 + i * 0.06,
      0.1,
      0.185,
      false,
    ),
  );
const cableMat = real.rubber(0x161616);
for (const [a, b] of [
  [V(0.1, 1.07, 0), V(0.1, 2.38, 0.1)],
  [V(-0.1, 1.07, 0), V(-0.1, 1.85, 0)],
  [V(0, 1.07, -0.1), V(0, 1.38, -0.1)],
]) {
  const mid = a
    .clone()
    .lerp(b, 0.5)
    .add(V(0.06, 0, -0.08));
  mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a, mid, b]), 24, 0.012, 8),
    cableMat,
    inside,
    0,
    0,
    0,
    false,
  );
}

// ---------------------------------------------------------------- the viewer's car (front = -x)
function buildCar({ paint = 0x9ea4ab, ghost = false } = {}) {
  const g = new THREE.Group();
  const P = ghost
    ? glowMat(0xff2a1a, 0.28, THREE.AdditiveBlending)
    : real.gloss(paint, { roughness: 0.22 });
  const glass = ghost ? P : real.gloss(0x0d1118, { roughness: 0.05 });
  const dark = ghost ? P : real.plastic(0x15171b, { roughness: 0.5 });
  const lower = mesh(roundedBox(4.4, 0.72, 1.8, 0.2, 5), P, g, 0, 0.64, 0, !ghost);
  const cabin = mesh(roundedBox(2.2, 0.58, 1.6, 0.26, 5), P, g, 0.2, 1.24, 0, !ghost);
  const parts = { lower, cabin };
  if (ghost) return { g, parts };
  // window panes (outside only, so the cabin is see-through from inside)
  for (const sz of [-1, 1]) {
    const w = mesh(new THREE.PlaneGeometry(1.75, 0.38), glass, g, 0.22, 1.27, sz * 0.805, false);
    w.rotation.y = sz > 0 ? 0 : Math.PI;
  }
  const wsO = mesh(new THREE.PlaneGeometry(1.36, 0.4), glass, g, -0.905, 1.27, 0, false);
  wsO.rotation.y = -Math.PI / 2;
  const rw = mesh(new THREE.PlaneGeometry(1.3, 0.36), glass, g, 1.305, 1.27, 0, false);
  rw.rotation.y = Math.PI / 2;
  // bumpers + grille
  mesh(roundedBox(0.22, 0.26, 1.82, 0.08), dark, g, -2.18, 0.42, 0);
  mesh(roundedBox(0.22, 0.26, 1.82, 0.08), dark, g, 2.18, 0.42, 0);
  mesh(roundedBox(0.04, 0.16, 0.8, 0.03), dark, g, -2.21, 0.66, 0, false);
  // A-pillars (frame the windscreen from inside)
  for (const sz of [-0.74, 0.74]) {
    const p = mesh(new THREE.BoxGeometry(0.06, 0.62, 0.06), P, g, -0.72, 1.25, sz, false);
    p.rotation.z = -0.55;
  }
  // wheels
  const wheels = [];
  for (const sx of [-1.38, 1.38])
    for (const sz of [-0.82, 0.82]) {
      const w = new THREE.Group();
      w.position.set(sx, 0.34, sz);
      g.add(w);
      const tyre = mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 40), real.rubber(), w);
      tyre.rotation.x = Math.PI / 2;
      const rim = mesh(
        new THREE.CylinderGeometry(0.22, 0.22, 0.25, 32),
        real.metal(0xb9c0c8, { roughness: 0.25 }),
        w,
      );
      rim.rotation.x = Math.PI / 2;
      for (let k = 0; k < 5; k++) {
        const s = mesh(
          new THREE.BoxGeometry(0.04, 0.36, 0.02),
          real.metal(0x8a9098, { roughness: 0.3 }),
          w,
          0,
          0,
          sz > 0 ? 0.13 : -0.13,
          false,
        );
        s.rotation.z = (k / 5) * Math.PI * 2;
      }
      wheels.push(w);
    }
  // headlights
  const headMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xfff3dc,
    emissiveIntensity: 2.2,
  });
  for (const sz of [-0.6, 0.6])
    mesh(roundedBox(0.08, 0.14, 0.42, 0.04), headMat, g, -2.17, 0.78, sz, false);
  // taillights (brighter when braking)
  const tailMat = new THREE.MeshStandardMaterial({
    color: 0xff2a1a,
    emissive: 0xff1208,
    emissiveIntensity: 0.9,
  });
  for (const sz of [-0.62, 0.62])
    mesh(roundedBox(0.08, 0.12, 0.46, 0.04), tailMat, g, 2.17, 0.8, sz, false);
  const brake3 = mesh(roundedBox(0.04, 0.04, 0.5, 0.015), tailMat, g, 1.38, 1.5, 0, false);
  // number plates
  {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 56;
    const x = c.getContext("2d");
    x.fillStyle = "#f6f6f2";
    x.fillRect(0, 0, 256, 56);
    x.fillStyle = "#1d3c8f";
    x.fillRect(0, 0, 26, 56);
    x.fillStyle = "#111";
    x.font = "bold 40px Arial";
    x.fillText("HF 6464", 40, 44);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const pm = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 });
    const f = mesh(new THREE.PlaneGeometry(0.52, 0.11), pm, g, -2.3, 0.42, 0, false);
    f.rotation.y = -Math.PI / 2;
    const b = mesh(new THREE.PlaneGeometry(0.52, 0.11), pm, g, 2.3, 0.42, 0, false);
    b.rotation.y = Math.PI / 2;
  }
  // mirrors
  for (const sz of [-0.98, 0.98]) mesh(roundedBox(0.16, 0.12, 0.14, 0.04), P, g, -0.75, 1.02, sz);
  // interior: dashboard, steering wheel, seats
  const dash = real.plastic(0x1a1b1f, { roughness: 0.6 });
  mesh(roundedBox(0.55, 0.22, 1.56, 0.06), dash, g, -0.78, 0.98, 0, false);
  const wheel = mesh(
    new THREE.TorusGeometry(0.17, 0.022, 12, 40),
    dash,
    g,
    -0.42,
    1.06,
    0.38,
    false,
  );
  wheel.rotation.y = Math.PI / 2;
  wheel.rotation.x = 0;
  wheel.rotation.z = 0.5;
  mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.3, 12),
    dash,
    g,
    -0.55,
    0.98,
    0.38,
    false,
  ).rotation.z = Math.PI / 2 - 0.5;
  for (const sz of [-0.38, 0.38]) {
    mesh(roundedBox(0.5, 0.12, 0.5, 0.05), real.fabric(0x26272c), g, 0.35, 0.82, sz, false);
    mesh(roundedBox(0.12, 0.6, 0.5, 0.05), real.fabric(0x26272c), g, 0.6, 1.12, sz, false);
  }
  // windscreen glass (seen from inside)
  // headlight beam (soft cone in the night air) + the light itself
  const spot = new THREE.SpotLight(0xfff1d8, 0, 45, 0.42, 0.55, 1.2);
  spot.position.set(-2.1, 0.8, 0);
  const target = new THREE.Object3D();
  target.position.set(-14, -0.6, 0);
  g.add(target);
  spot.target = target;
  g.add(spot);
  const tail = new THREE.PointLight(0xff1a10, 0, 7, 1.6);
  tail.position.set(2.6, 0.7, 0);
  g.add(tail);
  return { g, parts, wheels, headMat, tailMat, spot, tail, brake3 };
}
const car = buildCar();
scene.add(car.g);
const ghost = buildCar({ ghost: true });
scene.add(ghost.g);
// phone in a holder on the dashboard, screen to the driver (+x)
const phone = new THREE.Group();
phone.position.set(-0.6, 1.16, 0.04);
car.g.add(phone);
{
  mesh(roundedBox(0.012, 0.17, 0.085, 0.006), real.gloss(0x1b1c20, { roughness: 0.2 }), phone);
  mesh(roundedBox(0.03, 0.03, 0.03, 0.01), real.plastic(0x111), phone, -0.02, -0.1, 0);
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 512;
  const g = c.getContext("2d");
  g.fillStyle = "#0e1a2b";
  g.fillRect(0, 0, 256, 512);
  // map streets
  g.strokeStyle = "#2c4566";
  g.lineWidth = 18;
  g.beginPath();
  g.moveTo(128, 512);
  g.lineTo(128, 120);
  g.stroke();
  g.lineWidth = 8;
  g.beginPath();
  g.moveTo(0, 300);
  g.lineTo(256, 260);
  g.stroke();
  // warning: red triangle with a camera
  g.fillStyle = "#e3241b";
  g.beginPath();
  g.moveTo(128, 70);
  g.lineTo(220, 230);
  g.lineTo(36, 230);
  g.closePath();
  g.fill();
  g.fillStyle = "#fff";
  g.beginPath();
  g.moveTo(128, 100);
  g.lineTo(196, 218);
  g.lineTo(60, 218);
  g.closePath();
  g.fill();
  g.fillStyle = "#111";
  g.fillRect(100, 160, 56, 38);
  g.beginPath();
  g.arc(128, 179, 13, 0, Math.PI * 2);
  g.fillStyle = "#fff";
  g.fill();
  g.fillStyle = "#fff";
  g.font = "bold 46px Arial";
  g.textAlign = "center";
  g.fillText("BLITZER", 128, 300);
  g.font = "bold 70px Arial";
  g.fillStyle = "#ffd23f";
  g.fillText("300 m", 128, 390);
  g.fillStyle = "#e3241b";
  g.fillRect(0, 450, 256, 62);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const scr = mesh(
    new THREE.PlaneGeometry(0.075, 0.15),
    new THREE.MeshBasicMaterial({ map: tex }),
    phone,
    0.0065,
    0,
    0,
    false,
  );
  scr.rotation.y = Math.PI / 2;
}
const PHONE_LOCAL = V(-0.6, 1.16, 0.04);

// where the car is (x along the road, braking 0..1) — pure function of t
function carState(t) {
  let x;
  let brake = 0;
  if (t < T.stell) {
    x = 9 - 4.5 * t;
    brake = 1;
  } else if (t < T.manche) {
    x = t < T.blitz ? 1 + 13 * (T.blitz - t) * (t < T.eisen ? 1 : 0.85) : 1 - 9 * (t - T.blitz);
    if (t >= T.eisen) x = 1 + 11 * (T.blitz - t);
    if (t >= T.blitz) x = 1 - 8 * (t - T.blitz);
    brake = t >= T.eisen ? 1 : 0;
  } else if (t < T.kasten2) {
    x = 3 + 14 * (T.aufleuchten + 0.15 - t);
  } else if (t < T.rate) {
    x = 16 - 0.6 * (t - T.kasten2) - (t > T.je ? 0.6 * (t - T.je) ** 1.3 : 0);
  } else if (t < T.neuere) {
    x = 12.5 - 0.5 * (t - T.rate);
  } else if (t < T.foto - 0.1) {
    x = 52 - 5 * (t - T.neuere);
  } else if (t < T.schwarzblitz - 0.15) {
    x = 11 - 5 * (t - T.foto);
  } else if (t < T.merkst) {
    x = 6 + 8 * (T.schwarzblitz + 0.15 - t);
  } else if (t < T.bremst) {
    x = 22 - 8 * (t - T.merkst);
  } else if (t < T.fakt) {
    x = 4 - 4.5 * (t - T.bremst);
    brake = 1;
  } else {
    x = t < T.geblitzt ? 2 + 7 * (T.geblitzt - t) : 2 - 3 * (t - T.geblitzt);
  }
  return { x, brake };
}
const CARV = V(0, 0, LANE);
for (const s of shots) if (s.car) s.rel = CARV;
const applyCamera = shotCamera(shots);

// ---------------------------------------------------------------- radar waves
// spherical caps flying from the box to the car (blue) and back (red, squeezed)
const capGeo = new THREE.SphereGeometry(1, 40, 6, Math.PI - 0.28, 0.56, Math.PI / 2 - 0.03, 0.06);
const waveOutMat = glowMat(0x48b6ff, 0.5, THREE.AdditiveBlending);
waveOutMat.side = THREE.DoubleSide;
const waveBackMat = glowMat(0xff3b2a, 0.55, THREE.AdditiveBlending);
waveBackMat.side = THREE.DoubleSide;
const mkWaves = (n, mat) =>
  Array.from({ length: n }, () => {
    const g = new THREE.Group();
    const m = new THREE.Mesh(capGeo, mat);
    m.userData.noAO = true;
    g.add(m);
    scene.add(g);
    return g;
  });
const wavesOut = mkWaves(14, waveOutMat);
const wavesBack = mkWaves(24, waveBackMat);
const radarW = V(...RADAR);
const tmp = V(0, 0, 0);
function drawWaves(set, from, to, spacing, speed, t, vis, r0) {
  const dir = tmp.copy(to).sub(from);
  const L = dir.length();
  dir.normalize();
  const yaw = Math.atan2(-dir.z, dir.x);
  const pitch = Math.asin(dir.y);
  set.forEach((g, i) => {
    const s =
      (((t * speed + i * spacing) % (set.length * spacing)) + set.length * spacing) %
      (set.length * spacing);
    const show = vis > 0.01 && s < L - 0.1 && s > 0.15;
    g.visible = show;
    if (!show) return;
    g.position.copy(from);
    g.rotation.set(0, yaw, pitch, "YZX");
    g.scale.setScalar(r0 + s);
    const fade = Math.min(1, s / 2.5) * Math.min(1, (L - s) / 2.5);
    g.children[0].material.opacity = vis * fade * 0.55;
  });
}

// ---------------------------------------------------------------- laser pulses
const pulseMat = glowMat(0xff2c2c, 0.95, THREE.AdditiveBlending);
const pulseGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.6, 8);
pulseGeo.rotateZ(Math.PI / 2);
const pulses = Array.from({ length: 46 }, (_, i) => {
  const m = new THREE.Mesh(pulseGeo, pulseMat);
  m.userData.noAO = true;
  m.userData.ph = (i * 0.618) % 1;
  m.userData.off = ((i * 37) % 11) / 11 - 0.5;
  scene.add(m);
  return m;
});
// scan fan (thin translucent sheet sweeping over the road)
const fanMat = glowMat(0xff3030, 0.0, THREE.AdditiveBlending);
fanMat.side = THREE.DoubleSide;
const fanGeo = new THREE.BufferGeometry();
fanGeo.setAttribute(
  "position",
  new THREE.Float32BufferAttribute([0, 0, 0, 1, -0.05, -0.12, 1, -0.05, 0.12], 3),
);
const fan = new THREE.Mesh(fanGeo, fanMat);
fan.userData.noAO = true;
scene.add(fan);

// ---------------------------------------------------------------- ambulance (Doppler analogy)
const amb = new THREE.Group();
scene.add(amb);
const ambBlue = [];
{
  const white = real.gloss(0xf3f4f2, { roughness: 0.25 });
  mesh(roundedBox(5.6, 2.1, 2.0, 0.2, 5), white, amb, 0.3, 1.45, 0);
  mesh(roundedBox(1.5, 1.1, 1.96, 0.25), white, amb, 3.6, 0.95, 0); // cab front (+x = front)
  mesh(
    roundedBox(0.7, 0.55, 1.9, 0.12),
    real.gloss(0x0d1118, { roughness: 0.05 }),
    amb,
    3.85,
    1.45,
    0,
  );
  const stripe = real.gloss(0xff4a1a, { roughness: 0.3 });
  for (const sz of [-1.01, 1.01])
    mesh(new THREE.BoxGeometry(5.4, 0.28, 0.02), stripe, amb, 0.6, 1.2, sz, false);
  for (const sx of [-1.6, 2.6])
    for (const sz of [-0.9, 0.9]) {
      const w = mesh(
        new THREE.CylinderGeometry(0.42, 0.42, 0.28, 32),
        real.rubber(),
        amb,
        sx,
        0.42,
        sz,
      );
      w.rotation.x = Math.PI / 2;
    }
  for (const [sx, sz] of [
    [2.9, -0.7],
    [2.9, 0.7],
    [-2.3, -0.7],
    [-2.3, 0.7],
  ]) {
    const m = new THREE.MeshStandardMaterial({
      color: 0x2a6bff,
      emissive: 0x2a6bff,
      emissiveIntensity: 0,
    });
    mesh(roundedBox(0.3, 0.16, 0.3, 0.05), m, amb, sx, 2.58, sz, false);
    ambBlue.push(m);
  }
  const head = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xfff3dc,
    emissiveIntensity: 2,
  });
  for (const sz of [-0.7, 0.7])
    mesh(roundedBox(0.06, 0.16, 0.36, 0.04), head, amb, 4.36, 0.75, sz, false);
}
const ambLight = new THREE.PointLight(0x3a6bff, 0, 18, 1.4);
ambLight.position.set(0.5, 3.2, 0);
amb.add(ambLight);
const ringMat = glowMat(0xbfe4ff, 0.8, THREE.AdditiveBlending);
const ringGeo = new THREE.TorusGeometry(1, 0.05, 6, 72);
ringGeo.rotateX(Math.PI / 2);
const rings = Array.from({ length: 16 }, () => {
  const m = new THREE.Mesh(ringGeo, ringMat.clone());
  m.userData.noAO = true;
  scene.add(m);
  return m;
});
const AMB_V = 4; // m/s along +x
const SOUND = 6; // drawn speed of the rings
const ambX = (t) => AMB_X - 3 + AMB_V * (t - (T.sirene - 0.1));

// ---------------------------------------------------------------- ghost marker (payoff)
const markMat = glowMat(0xff2a1a, 0.0, THREE.AdditiveBlending);
const mark = mesh(
  new THREE.PlaneGeometry(0.5, 3.4),
  markMat,
  scene,
  GHOST_X - 2.4,
  0.05,
  LANE,
  false,
);
mark.rotation.x = -Math.PI / 2;

// ---------------------------------------------------------------- hand (taps the phone)
const hand = createHand({ scale: 0.1, sleeve: 0x2b2f3a, skin: 0xe8b394 });
const handKeys = [
  { t: T.fakt + 0.3, p: [-0.25, 1.02, 0.2], pose: "open" },
  { t: T.schweiz, p: [-0.42, 1.1, 0.12], pose: "point" },
  { t: T.app, p: [-0.53, 1.14, 0.07], pose: "press" },
  { t: T.verboten + 0.2, p: [-0.47, 1.1, 0.12], pose: "point" },
  { t: T.oft - 0.1, p: [-0.2, 1.0, 0.25], pose: "open", out: true },
];

// ---------------------------------------------------------------- render
function renderAt(t) {
  // --- car
  const { x, brake } = carState(t);
  CARV.set(x, 0, LANE);
  car.g.position.copy(CARV);
  const hookDip = t < T.stell ? 0.035 * Math.exp(-t * 1.2) : 0;
  const eisenDip = t >= T.eisen && t < T.manche ? 0.04 * Math.exp(-(t - T.eisen) * 1.5) : 0;
  const payDip = t >= T.bremst && t < T.fakt ? 0.03 * Math.exp(-(t - T.bremst) * 1.4) : 0;
  car.g.rotation.z = hookDip + eisenDip + payDip;
  car.g.position.y = -(hookDip + eisenDip + payDip) * 0.6;
  for (const w of car.wheels) w.rotation.z = x / 0.34;
  car.tailMat.emissiveIntensity = 0.7 + 3.2 * brake;
  car.tail.intensity = 1.2 + 9 * brake;
  car.spot.intensity = 38;
  car.headMat.emissiveIntensity = 2.4;

  // --- ghost car where it was measured (payoff)
  const gk = pop(t, T.bremst + 0.3, T.fakt);
  ghost.g.visible = gk > 0.01;
  ghost.g.position.set(GHOST_X, 0, LANE);
  for (const m of Object.values(ghost.parts))
    m.material.opacity = 0.3 * gk * (0.8 + 0.2 * Math.sin(t * 9));
  markMat.opacity = 0.75 * gk;
  if (gk > 0) showLabel("ghost", gk, "Hier gemessen", V(GHOST_X - 0.4, 1.7, LANE), 1);

  // --- flashes
  const red = flashK(t, false);
  const ir = flashK(t, true);
  const ag = afterglow(t);
  flashMat.emissiveIntensity = 0.05 + 6 * red + 0.6 * ag;
  tubeMat.emissiveIntensity = 4 * red + 0.4 * ag;
  flashLight.color.setHex(red >= ir ? 0xff2a18 : 0x7a30ff);
  flashLight.intensity = 260 * red + 14 * ir;
  flashGlowMat.opacity = Math.min(1, 1.2 * red + 0.12 * ag);
  flashGlow.scale.setScalar(0.4 + 2.6 * red + 0.2 * ag);
  irGlowMat.opacity = 0.75 * ir;
  irGlow.scale.setScalar(0.35 + 1.1 * ir);
  redEl.style.opacity = String(0.55 * red);
  ledMat.color.setHex(Math.floor(t * 1.5) % 2 ? 0x3dff7a : 0x1a7a3a);

  // --- x-ray (radar beat, laser beat, camera)
  const xk = Math.max(
    smooth(ramp(t, T.kasten2 - 0.1, T.kasten2 + 0.5)) * (1 - ramp(t, T.weil - 0.2, T.weil)),
    smooth(ramp(t, T.neuere - 0.1, T.neuere + 0.4)) * (1 - ramp(t, T.lange - 0.2, T.lange)),
    smooth(ramp(t, T.erst - 0.1, T.erst + 0.4)) * (1 - ramp(t, T.foto - 0.3, T.foto - 0.1)),
  );
  setXray([shellMat, capMat], xk);
  inside.visible = xk > 0.03;
  const laserOn = t >= T.neuere;
  radar.visible = !laserOn;
  radar.scale.copy(squash(t, T.radar - 0.1));
  laser.visible = laserOn;
  laser.scale.copy(squash(t, T.laser - 0.1));
  mirror.rotation.y = t * 14;
  compLeds.forEach((m, i) => (m.visible = Math.floor(t * 6 + i * 1.7) % 3 !== 0));

  // --- radar waves (out: blue, back: red and squeezed)
  const carFront = V(x - 2.25, 0.7, LANE);
  const vOut = Math.max(pop(t, T.feuert, T.folge), pop(t, T.kuerzer, T.neuere));
  const vBack = Math.max(pop(t, T.gestaucht1 - 0.2, T.folge), pop(t, T.kuerzer, T.neuere));
  const squeeze = 0.55 - 0.25 * smooth(ramp(t, T.je, T.je + 1.6));
  drawWaves(wavesOut, radarW, carFront, 1.5, 5, t, vOut, 0.3);
  drawWaves(wavesBack, carFront, radarW, 1.5 * squeeze, 5 * squeeze * 1.6, t, vBack, 0.2);

  // --- laser pulses + scan fan
  const vL = pop(t, T.laser + 0.15, T.erst);
  const laserW = V(RADAR[0] + 0.05, RADAR[1], RADAR[2] + 0.05);
  const tgt = V(x - 2.2, 0.9, LANE);
  const dL = tgt.clone().sub(laserW);
  const len = dL.length();
  dL.normalize();
  const yawL = Math.atan2(-dL.z, dL.x);
  pulses.forEach((m) => {
    const u = (t * 0.9 + m.userData.ph) % 1;
    m.visible = vL > 0.01;
    if (!m.visible) return;
    m.position.copy(laserW).addScaledVector(dL, u * len);
    m.position.y += m.userData.off * 0.5 * u;
    m.position.z += m.userData.off * 0.9 * u;
    m.rotation.set(0, yawL, Math.asin(dL.y));
    m.scale.set(1, 1 + vL, 1 + vL);
    m.material.opacity = 0.9 * vL;
  });
  fan.visible = vL > 0.01;
  fan.position.copy(laserW);
  fan.scale.set(len, 1, len * (0.6 + 0.4 * Math.sin(t * 5)));
  fan.rotation.set(0, yawL, 0);
  fanMat.opacity = 0.18 * vL;

  // --- ambulance with its siren rings (visible around the analogy shot)
  const vA = pop(t, T.sirene - 0.6, T.je + 0.3);
  amb.visible = vA > 0.01;
  const ax = ambX(t);
  amb.position.set(ax, 0, LANE_FAR);
  const blink = Math.floor(t * 6) % 2;
  ambBlue.forEach((m, i) => (m.emissiveIntensity = (i + blink) % 2 ? 6 : 0.3));
  ambLight.intensity = blink ? 40 : 6;
  rings.forEach((r, i) => {
    // ring i was emitted at te, from where the ambulance was then
    const per = 0.32;
    const te = Math.floor(t / per) * per - i * per;
    const age = t - te;
    r.visible = amb.visible && age > 0;
    if (!r.visible) return;
    r.position.set(ambX(te) + 4.2, 2.2, LANE_FAR);
    r.scale.setScalar(Math.max(0.01, SOUND * age));
    r.material.opacity = vA * 0.85 * Math.max(0, 1 - age / 2.2);
  });

  // --- hand tapping the phone (world coords follow the car)
  hand.track(
    t,
    handKeys.map((k) => ({
      t: k.t,
      pos: [x + k.p[0], k.p[1], LANE + k.p[2]],
      rot: [0.35, -Math.PI / 2 - 0.25, 0],
      pose: k.pose,
      out: k.out,
    })),
  );
  const nk = pop(t, T.verboten, T.oft - 0.1);
  showNope(nk, x + PHONE_LOCAL.x + 0.03, PHONE_LOCAL.y, LANE + PHONE_LOCAL.z, 0.12);
  if (t >= T.fakt && t < T.oft - 0.1)
    showLabel(
      "app",
      pop(t, T.app, T.oft - 0.1),
      "Blitzer-App",
      V(x + PHONE_LOCAL.x, PHONE_LOCAL.y + 0.08, LANE + PHONE_LOCAL.z),
      1,
    );

  // --- device displays + LED panel
  const hookVF = t < 0.55 ? 1 : 0;
  viewfinder(Math.max(hookVF, pop(t, T.foto - 0.1, T.schwarzblitz - 0.15)), {
    label: hookVF ? "BLITZ · 98 KM/H" : t >= T.infrarot ? "CAM A · INFRAROT" : "CAM A · TEMPO 98",
    time: "23:41:07",
    color: t >= T.infrarot ? "#9a5cff" : "#ff3b5c",
  });
  if (t >= T.je && t < T.folge) {
    const v = lerp(62, 104, smooth(ramp(t, T.je, T.folge - 0.3)));
    gauge("tempo", pop(t, T.je, T.folge), {
      label: "Tempo",
      value: Math.round(v),
      max: 160,
      unit: "km/h",
      x: 60,
      y: 400,
      color: "#ff3b5c",
    });
  }
  if (t >= T.lange && t < T.erst) {
    readout("abst", pop(t, T.lange, T.erst), {
      label: "Abstand",
      value: Math.round(lerp(10, 50, smooth(ramp(t, T.lange, T.lange + 0.8)))),
      unit: "m",
      note: "Laser misst schon",
      x: 60,
      y: 420,
    });
  }
  if (t >= T.rate && t < T.kuerzer)
    showPanel(pop(t, T.rate + 0.2, T.kuerzer), "MESSZEIT", "?", LED.yellow);
  else if (t >= T.kuerzer && t < T.neuere)
    showPanel(pop(t, T.wimpern, T.neuere), "MESSZEIT", "< 0,1 s", LED.green);
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  // the flash glow is for outside views; from the lens itself it would sit in front of the picture
  flashGlow.getWorldPosition(tmp);
  const near = camera.position.distanceTo(tmp) < 1.4;
  flashGlow.visible = !near;
  irGlow.visible = !near;
  renderFrame();
}

start(renderAt);
