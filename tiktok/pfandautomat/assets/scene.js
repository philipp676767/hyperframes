// #40 Pfandautomat: the reverse vending machine as a detective. The hook
// spits a crushed bottle back at you; inside, a whole bottle is
// "interrogated" station by station — ring of cameras, barcode laser,
// the logo in special ink under its light, the scale — and only then
// crushed by the press. World: set.js (supermarket empties corner).
import {
  THREE,
  ramp,
  smooth,
  lerp,
  clamp01,
  outBack,
  pop,
  V,
  scene,
  flat,
  M,
  xrayMaterial,
  xrayEdges,
  setXray,
  showNope,
  showPanel,
  labels,
  squash,
  puff,
  highlights,
  shotCamera,
  renderFrame,
  start,
  rng,
} from "./world.js";
import { neighbours } from "./set.js";
import { F } from "./environments.js";
import { createHand } from "./hand.js";
import { viewfinder, readout, gauge, counter } from "./hud.js";
import {
  T,
  shots,
  LABELS,
  HIGHLIGHTS,
  AXIS_Y,
  OPEN_Z,
  RING_Z,
  CHECK_Z,
  PRESS_Z,
  PRESS,
  SIDE,
  BAGS,
  LABEL_Z,
} from "./beats.js";

highlights(HIGHLIGHTS);
const GREEN = 0x1fb36b;
const RED = 0xff3b30;

// ---------------------------------------------------------------- canvas helpers
function canvasTex(w, h, draw) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  draw(cv.getContext("2d"), w, h);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
const FONT = (s, wgt = 900) => `${wgt} ${s}px Montserrat, sans-serif`;

// ---------------------------------------------------------------- the machine
const machine = new THREE.Group();
scene.add(machine);
const W = 1.96;
const H = 3.2;
const D = 2.0; // front at z = 0.2, back at the wall
const shellMat = xrayMaterial(0x2b3036, { roughness: 0.38 });
const panelMat = xrayMaterial(0x3b424a, { roughness: 0.3 });
const stripeMat = xrayMaterial(GREEN, { roughness: 0.35 });
const sideMat = xrayMaterial(0x2b3036, { roughness: 0.38 });
const shellMats = [shellMat, panelMat, stripeMat, sideMat];
const stripeSide = [];
{
  const geo = new THREE.BoxGeometry(W, H, D);
  // material groups: +x, −x, +y, −y, +z, −z — the +x side opens for the inside shots
  const body = new THREE.Mesh(geo, [sideMat, shellMat, shellMat, shellMat, shellMat, shellMat]);
  body.position.set(0, H / 2, OPEN_Z - D / 2);
  body.castShadow = body.receiveShadow = true;
  machine.add(body);
  const e = xrayEdges(geo);
  e.position.copy(body.position);
  machine.add(e);
  // front panel around the opening + green stripe + kick plate
  const fp = new THREE.Mesh(new THREE.BoxGeometry(1.72, 1.36, 0.05), panelMat);
  fp.position.set(0, 1.5, OPEN_Z + 0.025);
  machine.add(fp);
  const st = new THREE.Mesh(new THREE.BoxGeometry(W + 0.01, 0.12, D + 0.01), stripeMat);
  st.position.set(0, 3.0, OPEN_Z - D / 2);
  machine.add(st);
  stripeSide.push(st);
  const kick = new THREE.Mesh(new THREE.BoxGeometry(W + 0.02, 0.22, 0.06), flat(0x15181c));
  kick.position.set(0, 0.11, OPEN_Z + 0.02);
  machine.add(kick);
}
// glowing ring around the opening (green / red / white) + dark hole
const ringGlow = flat(GREEN, { emissive: GREEN, emissiveIntensity: 2.2 });
const mouthRing = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.055, 10, 32), ringGlow);
mouthRing.position.set(0, AXIS_Y, OPEN_Z + 0.06);
machine.add(mouthRing);
const hole = new THREE.Mesh(new THREE.CircleGeometry(0.28, 28), flat(0x07080a, { roughness: 1 }));
hole.position.set(0, AXIS_Y, OPEN_Z + 0.055);
machine.add(hole);
const mouthLight = new THREE.PointLight(0x3dff7a, 1.5, 3, 1.8);
mouthLight.position.set(0, AXIS_Y, OPEN_Z + 0.5);
machine.add(mouthLight);
// receipt slot + "Bon" button
const slot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.04), flat(0x07080a));
slot.position.set(-0.3, 0.95, OPEN_Z + 0.05);
machine.add(slot);
const btnMat = flat(0x1fb36b, { emissive: 0x3dff7a, emissiveIntensity: 0.5 });
const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 18), btnMat);
btn.rotation.x = Math.PI / 2;
btn.position.set(0.45, 0.95, OPEN_Z + 0.06);
machine.add(btn);
// the receipt: a white strip that prints out of the slot
const bonMat = new THREE.MeshStandardMaterial({
  map: canvasTex(128, 1024, (g, w, h) => {
    g.fillStyle = "#fbfbf6";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#33363a";
    g.font = FONT(20, 800);
    g.textAlign = "center";
    for (let y = 40; y < h; y += 46) g.fillText("+0,25 €", w / 2, y);
  }),
  roughness: 0.8,
  side: THREE.DoubleSide,
});
const bon = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 1).translate(0, -0.5, 0), bonMat);
bon.position.set(-0.3, 0.93, OPEN_Z + 0.07);
machine.add(bon);

// the screen: drawn per state, redrawn only when the state changes
const scrCv = document.createElement("canvas");
scrCv.width = 640;
scrCv.height = 380;
const scrTex = new THREE.CanvasTexture(scrCv);
scrTex.colorSpace = THREE.SRGBColorSpace;
const screen = new THREE.Mesh(
  new THREE.PlaneGeometry(1.16, 0.69),
  new THREE.MeshBasicMaterial({ map: scrTex, toneMapped: false }),
);
screen.position.set(0, 2.45, OPEN_Z + 0.024);
machine.add(screen);
const bezel = new THREE.Mesh(
  new THREE.BoxGeometry(1.26, 0.79, 0.03),
  flat(0x101317, { roughness: 0.25 }),
);
bezel.position.set(0, 2.45, OPEN_Z + 0.002);
machine.add(bezel);
let scrState = "";
function drawScreen(state) {
  if (state === scrState) return;
  scrState = state;
  const g = scrCv.getContext("2d");
  const w = scrCv.width;
  const h = scrCv.height;
  const bg = { x: "#c4161c", nope: "#c4161c", ok: "#0f7a40", money: "#0f7a40" }[state] ?? "#0d1a14";
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillStyle = "#ffffff";
  if (state === "x" || state === "nope") {
    // big ✕
    g.lineWidth = 34;
    g.lineCap = "round";
    g.strokeStyle = "#ffffff";
    g.beginPath();
    g.moveTo(w / 2 - 80, 70);
    g.lineTo(w / 2 + 80, 230);
    g.moveTo(w / 2 + 80, 70);
    g.lineTo(w / 2 - 80, 230);
    g.stroke();
    g.font = FONT(52);
    g.fillText(state === "x" ? "NICHT ERKANNT" : "ABGELEHNT", w / 2, 315);
  } else if (state === "sus" || state === "betrug") {
    // suspicious eyes: one narrowed, one eyebrow up
    g.fillStyle = "#3dff7a";
    const eye = (cx, lid, brow) => {
      g.beginPath();
      g.ellipse(cx, 150, 70, 52, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#0d1a14";
      g.fillRect(cx - 80, 90, 160, lid); // eyelid from above
      g.beginPath();
      g.arc(cx + 18, 165, 22, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#3dff7a";
      g.save();
      g.translate(cx, 68);
      g.rotate(brow);
      g.fillRect(-75, -10, 150, 20);
      g.restore();
    };
    eye(w / 2 - 130, 52, -0.32);
    eye(w / 2 + 130, 28, 0.12);
    if (state === "betrug") {
      g.fillStyle = "#ff3b30";
      g.font = FONT(78);
      g.fillText("BETRÜGER?", w / 2, 300);
    }
  } else if (state === "scan") {
    g.fillStyle = "#3dff7a";
    g.font = FONT(58);
    g.fillText("PRÜFE …", w / 2, 150);
    g.font = FONT(34, 700);
    g.fillStyle = "#9fdcbc";
    g.fillText("Bitte warten", w / 2, 240);
  } else if (state === "ok" || state === "money") {
    g.lineWidth = 34;
    g.lineCap = "round";
    g.lineJoin = "round";
    g.strokeStyle = "#ffffff";
    g.beginPath();
    g.moveTo(w / 2 - 85, 150);
    g.lineTo(w / 2 - 20, 215);
    g.lineTo(w / 2 + 95, 80);
    g.stroke();
    g.font = FONT(64);
    g.fillText(state === "ok" ? "+0,25 €" : "+0,25 € +0,25 €", w / 2, 310);
  } else {
    // idle: insert prompt with a bottle pictogram
    g.fillStyle = "#3dff7a";
    g.font = FONT(46);
    g.fillText("LEERGUT", w / 2, 110);
    g.font = FONT(34, 700);
    g.fillStyle = "#cfeee0";
    g.fillText("Flasche einlegen", w / 2, 175);
    g.fillStyle = "#3dff7a";
    g.fillRect(w / 2 - 90, 250, 150, 50);
    g.beginPath();
    g.moveTo(w / 2 + 60, 255);
    g.lineTo(w / 2 + 100, 265);
    g.lineTo(w / 2 + 100, 285);
    g.lineTo(w / 2 + 60, 295);
    g.fill();
  }
  scrTex.needsUpdate = true;
}

// ---------------------------------------------------------------- the inside
// a dark chamber (seen from inside, hidden while the shell is x-ray glass)
const inner = new THREE.Mesh(
  new THREE.BoxGeometry(W - 0.08, H - 0.1, D - 0.06),
  new THREE.MeshStandardMaterial({ color: 0x1a1e24, roughness: 0.6, side: THREE.BackSide }),
);
inner.position.set(0, H / 2, OPEN_Z - D / 2);
inner.receiveShadow = true;
machine.add(inner);
const insides = new THREE.Group(); // the stations, always visible
machine.add(insides);
const steel = flat(0xb9c2ca, { metalness: 0.7, roughness: 0.28 });
const addIn = (geo, mat, x, y, z, parent = insides) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};
// insert tunnel from the hole + two rails the bottle rides on
{
  const tun = new THREE.Mesh(
    new THREE.CylinderGeometry(0.29, 0.29, 0.3, 24, 1, true),
    flat(0x2a3038, { side: THREE.DoubleSide, roughness: 0.4 }),
  );
  tun.rotation.x = Math.PI / 2;
  tun.position.set(0, AXIS_Y, OPEN_Z - 0.15);
  insides.add(tun);
  for (const x of [-0.1, 0.1]) {
    const r = addIn(
      new THREE.CylinderGeometry(0.018, 0.018, 1.2, 8),
      steel,
      x,
      AXIS_Y - 0.145,
      -0.55,
    );
    r.rotation.x = Math.PI / 2;
  }
}
// ring of 8 cameras around the bottle
const lensMat = flat(0x9fe8ff, { emissive: 0x9fe8ff, emissiveIntensity: 0.6 });
const ringGroup = new THREE.Group();
ringGroup.position.set(0, AXIS_Y, RING_Z);
insides.add(ringGroup);
{
  const tor = new THREE.Mesh(
    new THREE.TorusGeometry(0.36, 0.045, 10, 40),
    flat(0x59626c, { metalness: 0.6, roughness: 0.3 }),
  );
  ringGroup.add(tor);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const cam = new THREE.Group();
    cam.position.set(Math.cos(a) * 0.36, Math.sin(a) * 0.36, 0);
    cam.lookAt(0, 0, 0);
    cam.add(
      new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.11, 0.1), flat(0x15181c, { roughness: 0.35 })),
    );
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 14), lensMat);
    lens.rotation.x = Math.PI / 2;
    lens.position.z = 0.06;
    cam.add(lens);
    ringGroup.add(cam);
  }
}
const ringLight = new THREE.PointLight(0xcff4ff, 0, 1.6, 1.4);
ringLight.position.set(0, AXIS_Y + 0.15, RING_Z + 0.2);
insides.add(ringLight);
// the "interrogation lamp" above the ring
const lampMat = flat(0xffffff, { emissive: 0xfff0c8, emissiveIntensity: 2.4 });
{
  addIn(new THREE.CylinderGeometry(0.008, 0.008, 0.62, 5), flat(0x111111), 0, 2.84, RING_Z);
  const shade = addIn(
    new THREE.ConeGeometry(0.22, 0.2, 16, 1, true),
    flat(0x2f7d4a, { side: THREE.DoubleSide, roughness: 0.4 }),
    0,
    2.46,
    RING_Z,
  );
  shade.castShadow = false;
  addIn(new THREE.SphereGeometry(0.07, 12, 8), lampMat, 0, 2.4, RING_Z);
}
const lampLight = new THREE.PointLight(0xffe2b0, 2.6, 2.4, 1.3);
lampLight.position.set(0, 2.3, RING_Z);
insides.add(lampLight);
// barcode scanner head + its red laser line
const laserMat = new THREE.MeshBasicMaterial({
  color: 0xff2a2a,
  transparent: true,
  opacity: 0.85,
  toneMapped: false,
});
const laser = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.36, 0.012), laserMat);
insides.add(laser);
addIn(new THREE.BoxGeometry(0.1, 0.16, 0.16), flat(0x15181c), 0.4, AXIS_Y - 0.24, LABEL_Z);
const laserLight = new THREE.PointLight(0xff3030, 0, 0.9, 1.5);
insides.add(laserLight);
// logo light bar above the check station (violet-blue) + sensor eye
const uvMat = flat(0xffffff, { emissive: 0x7a5cff, emissiveIntensity: 0.3 });
addIn(new THREE.BoxGeometry(0.5, 0.06, 0.12), uvMat, 0, 2.05, CHECK_Z);
addIn(new THREE.BoxGeometry(0.56, 0.1, 0.18), flat(0x15181c), 0, 2.12, CHECK_Z);
const uvLight = new THREE.PointLight(0x8f6bff, 0, 1.4, 1.4);
uvLight.position.set(0, 1.9, CHECK_Z);
insides.add(uvLight);
const sensorMat = flat(0x111111, { emissive: GREEN, emissiveIntensity: 0.4 });
addIn(new THREE.SphereGeometry(0.05, 12, 8), sensorMat, 0.32, 1.85, CHECK_Z);
// the scale: a platform under the check station on a load cell
const scale = new THREE.Group();
scale.position.set(0, AXIS_Y - 0.17, CHECK_Z);
insides.add(scale);
{
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.03, 0.5), steel);
  scale.add(top);
  const cell = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.22, 0.14),
    flat(0xf2b41a, { roughness: 0.45 }),
  );
  cell.position.y = -0.13;
  scale.add(cell);
}
// the press: anvil (trap door) + plate on a piston
const anvilPivot = new THREE.Group();
anvilPivot.position.set(-0.26, AXIS_Y - 0.165, PRESS_Z);
insides.add(anvilPivot);
{
  const a = new THREE.Mesh(
    new THREE.BoxGeometry(0.52, 0.04, 0.56),
    flat(0x6b737b, { metalness: 0.6, roughness: 0.35 }),
  );
  a.position.x = 0.26;
  anvilPivot.add(a);
}
const plate = new THREE.Group();
insides.add(plate);
{
  const p = new THREE.Mesh(
    new THREE.BoxGeometry(0.56, 0.1, 0.6),
    flat(0xd8352a, { roughness: 0.4 }),
  );
  p.castShadow = true;
  plate.add(p);
  const stripes = new THREE.Mesh(new THREE.BoxGeometry(0.57, 0.03, 0.61), flat(0xffc928));
  stripes.position.y = 0.065;
  plate.add(stripes);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.4, 10), M.chrome);
  rod.position.y = 0.75;
  plate.add(rod);
}
addIn(new THREE.CylinderGeometry(0.12, 0.12, 0.4, 12), flat(0x3a4048), 0, 2.95, PRESS_Z);
const warnMat = flat(0xffffff, { emissive: RED, emissiveIntensity: 0.3 });
addIn(new THREE.SphereGeometry(0.05, 10, 8), warnMat, 0.55, 2.6, PRESS_Z);
// the bin under the press, filling up with crushed bottles
{
  const binMat = flat(0x3b6fd6, { roughness: 0.5 });
  const bw = 1.4;
  const bd = 0.7;
  const bz = PRESS_Z - 0.02;
  addIn(new THREE.BoxGeometry(bw, 0.04, bd), binMat, 0, 0.2, bz);
  for (const s of [-1, 1]) {
    addIn(new THREE.BoxGeometry(0.04, 0.75, bd), binMat, (s * bw) / 2, 0.55, bz);
    addIn(new THREE.BoxGeometry(bw, 0.75, 0.04), binMat, 0, 0.55, bz + (s * bd) / 2);
  }
}

// ---------------------------------------------------------------- bottles
// PET bottle 0.8 long along y (bottom at 0), turned to lie along z with the
// cap towards the front (+z) — so it goes in bottom first
const LEN = 0.8;
const RB = 0.14;
const bottleProfile = [
  [0.0, 0.0],
  [0.1, 0.0],
  [0.135, 0.02],
  [0.14, 0.06],
  [0.14, 0.5],
  [0.128, 0.56],
  [0.085, 0.66],
  [0.055, 0.71],
  [0.05, 0.75],
  [0.0, 0.75],
].map(([x, y]) => new THREE.Vector2(x, y));
const bottleGeo = new THREE.LatheGeometry(bottleProfile, 20);
const pet = new THREE.MeshStandardMaterial({
  color: 0xcdeeff,
  roughness: 0.06,
  metalness: 0.05,
  transparent: true,
  opacity: 0.7,
});
// label: red band "COLA" all round, white stripe
const labelTex = canvasTex(1024, 256, (g, w, h) => {
  g.fillStyle = "#d8231f";
  g.fillRect(0, 0, w, h);
  g.fillStyle = "#ffffff";
  g.fillRect(0, h * 0.72, w, h * 0.08);
  g.font = FONT(120);
  g.textAlign = "center";
  g.textBaseline = "middle";
  for (const x of [w * 0.12, w * 0.62]) g.fillText("COLA", x, h * 0.42);
});
const labelMat = flat(0xffffff, { map: labelTex, roughness: 0.4 });
const barcodeTex = canvasTex(256, 200, (g, w, h) => {
  g.fillStyle = "#ffffff";
  g.fillRect(0, 0, w, h);
  g.fillStyle = "#111111";
  const r = rng(77);
  let x = 18;
  while (x < w - 18) {
    const bw = 2 + Math.floor(r() * 3) * 2;
    if (r() > 0.4) g.fillRect(x, 16, bw, h - 56);
    x += bw + 2;
  }
  g.font = FONT(26, 700);
  g.textAlign = "center";
  g.fillText("4 006381 333931", w / 2, h - 20);
});
const logoCv = (glow) =>
  canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = glow ? "#000000" : "#ffffff";
    g.fillRect(0, 0, w, h);
    const c = glow ? "#3dff7a" : "#1c1c1c";
    g.strokeStyle = c;
    g.fillStyle = c;
    // circular arrow around a bottle + a can (the deposit mark, simplified)
    g.lineWidth = 16;
    g.beginPath();
    g.arc(w / 2, h / 2, 96, Math.PI * 0.15, Math.PI * 1.85);
    g.stroke();
    g.beginPath();
    g.moveTo(
      w / 2 + 96 * Math.cos(Math.PI * 0.15) + 22,
      h / 2 + 96 * Math.sin(Math.PI * 0.15) - 30,
    );
    g.lineTo(w / 2 + 96 * Math.cos(Math.PI * 0.15) - 2, h / 2 + 96 * Math.sin(Math.PI * 0.15) + 14);
    g.lineTo(
      w / 2 + 96 * Math.cos(Math.PI * 0.15) - 34,
      h / 2 + 96 * Math.sin(Math.PI * 0.15) - 18,
    );
    g.fill();
    g.fillRect(w / 2 - 50, h / 2 - 30, 34, 90); // bottle body
    g.fillRect(w / 2 - 41, h / 2 - 58, 16, 30); // bottle neck
    g.fillRect(w / 2 + 6, h / 2 - 10, 44, 70); // can
  });
const logoTex = logoCv(false);
const logoGlowTex = logoCv(true);
function decal(tex, theta, y0, y1, width, extra = {}) {
  const geo = new THREE.CylinderGeometry(
    RB + 0.004,
    RB + 0.004,
    y1 - y0,
    10,
    1,
    true,
    theta - width / 2,
    width,
  );
  geo.translate(0, (y0 + y1) / 2, 0);
  return new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4, ...extra }),
  );
}
// one whole bottle; `fake` = home-printed sticker barcode, the logo a grey copy
function makeBottle({ fake = false } = {}) {
  const g = new THREE.Group(); // pivot at the bottle's middle, axis along z
  const inner = new THREE.Group();
  inner.rotation.x = Math.PI / 2;
  inner.position.z = -LEN / 2;
  g.add(inner);
  const body = new THREE.Mesh(bottleGeo, pet);
  inner.add(body);
  const lab = new THREE.Mesh(
    new THREE.CylinderGeometry(RB + 0.002, RB + 0.002, 0.24, 20, 1, true),
    labelMat,
  );
  lab.position.y = 0.3;
  inner.add(lab);
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.07, 14),
    flat(0xf4f4f4, { roughness: 0.4 }),
  );
  cap.position.y = 0.775;
  inner.add(cap);
  // barcode facing +x (theta = π/2), the logo facing up-and-out (3π/4)
  const bc = decal(barcodeTex, Math.PI / 2, 0.24, 0.36, 0.95);
  bc.position.y = 0;
  inner.add(bc);
  if (fake) {
    // the sticker sits a little proud and crooked
    bc.scale.setScalar(1.04);
    bc.rotation.y = 0.08;
  }
  const lg = decal(fake ? logoTex : logoTex, (Math.PI * 3) / 4, 0.36, 0.5, 0.8, {
    emissive: 0x000000,
    emissiveMap: logoGlowTex,
    emissiveIntensity: 0,
  });
  if (fake) lg.material.color.setHex(0xb8b8b8);
  inner.add(lg);
  g.userData = { logo: lg, code: bc };
  g.castShadow = true;
  return g;
}
// a crushed bottle: flattened, buckled, label torn
const crushedGeo = (() => {
  const geo = bottleGeo.clone();
  const p = geo.attributes.position;
  const r = rng(404);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const k = Math.sin((y / 0.75) * Math.PI * 5 + 0.7) * 0.03;
    p.setXYZ(i, x * 1.45 + k, y * (0.96 + r() * 0.02), z * 0.22 + (r() - 0.5) * 0.02);
  }
  geo.computeVertexNormals();
  return geo;
})();
function makeCrushed() {
  const g = new THREE.Group();
  const inner = new THREE.Group();
  inner.rotation.x = Math.PI / 2;
  inner.position.z = -LEN / 2;
  g.add(inner);
  inner.add(new THREE.Mesh(crushedGeo, pet));
  const lab = new THREE.Mesh(
    new THREE.CylinderGeometry(RB + 0.002, RB + 0.002, 0.24, 20, 1, true, 0, Math.PI * 1.4),
    labelMat,
  );
  lab.scale.set(1.45, 1, 0.24);
  lab.position.y = 0.3;
  inner.add(lab);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.07, 14), flat(0xf4f4f4));
  cap.position.y = 0.775;
  cap.rotation.z = 0.3;
  inner.add(cap);
  return g;
}
const hero = makeBottle();
scene.add(hero);
const fake = makeBottle({ fake: true });
scene.add(fake);
const hookCrushed = makeCrushed(); // frame 0: spat out at you
scene.add(hookCrushed);
const crushed2 = makeCrushed(); // 49.7: tries the ring, red
scene.add(crushed2);
const pressed = makeCrushed(); // the hero after the press
scene.add(pressed);
// the pile in the bin (instanced crushed bottles, coloured labels)
{
  const N = 26;
  const geo = crushedGeo
    .clone()
    .rotateX(Math.PI / 2)
    .translate(0, 0, -LEN / 2);
  const inst = new THREE.InstancedMesh(geo, flat(0xffffff, { roughness: 0.2 }), N);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const c = new THREE.Color();
  const r = rng(91);
  const cols = [0xd8231f, 0x2d8f4e, 0xf2b41a, 0xcdeeff, 0x2a62c9, 0xff7a3a];
  for (let i = 0; i < N; i++) {
    e.set((r() - 0.5) * 0.8, r() * Math.PI * 2, (r() - 0.5) * 0.8);
    q.setFromEuler(e);
    m.compose(
      V((r() - 0.5) * 1.15, 0.28 + r() * 0.28 + (i / N) * 0.12, PRESS_Z + (r() - 0.5) * 0.45),
      q,
      V(0.9, 0.9, 0.9),
    );
    inst.setMatrixAt(i, m);
    inst.setColorAt(i, c.setHex(cols[i % cols.length]));
  }
  inst.castShadow = true;
  insides.add(inst);
}

// ---------------------------------------------------------------- props of the story
// the detective hat that lands on the machine
const hat = new THREE.Group();
scene.add(hat);
{
  const felt = flat(0x7a5233, { roughness: 0.8 });
  const brim = F(new THREE.CylinderGeometry(0.72, 0.76, 0.06, 18), felt, 0.05, 3);
  hat.add(brim);
  const crown = F(new THREE.CylinderGeometry(0.42, 0.5, 0.5, 14), felt, 0.05, 4);
  crown.position.y = 0.28;
  hat.add(crown);
  const dent = F(new THREE.BoxGeometry(0.5, 0.08, 0.2), flat(0x684329), 0.05, 5);
  dent.position.set(0, 0.52, 0);
  hat.add(dent);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.505, 0.51, 0.1, 14), flat(0x1c1a18));
  band.position.y = 0.1;
  hat.add(band);
  hat.traverse((o) => (o.castShadow = true));
}
// magnifying glass leaning on the machine (pops with the hat)
const lens = new THREE.Group();
scene.add(lens);
{
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.2, 0.035, 8, 24),
    flat(0x2b2b2b, { metalness: 0.4 }),
  );
  lens.add(rim);
  const gl = new THREE.Mesh(
    new THREE.CircleGeometry(0.19, 20),
    new THREE.MeshStandardMaterial({
      color: 0xbfe8ff,
      roughness: 0.02,
      transparent: true,
      opacity: 0.35,
    }),
  );
  lens.add(gl);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.36, 8), flat(0x7a5233));
  handle.position.y = -0.38;
  lens.add(handle);
}
// three bags of empties
const bags = [];
for (let i = 0; i < 3; i++) {
  const b = F(
    new THREE.IcosahedronGeometry(0.42, 1),
    flat(0x2f6fd6, { roughness: 0.5 }),
    0.1,
    20 + i,
  );
  b.scale.set(1, 1.2, 0.9);
  b.position.set(BAGS[0] + i * 0.62 - 0.3, 0.47, BAGS[2] + (i % 2) * 0.35);
  b.castShadow = true;
  scene.add(b);
  // bottle necks poking out
  for (let k = 0; k < 2; k++) {
    const n = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.25, 8), pet);
    n.position.set((k - 0.5) * 0.25, 0.48, 0);
    n.rotation.z = (k - 0.5) * 0.5;
    b.add(n);
  }
  bags.push(b);
}
// the trash bin of "kein Mülleimer"
const trash = new THREE.Group();
scene.add(trash);
{
  const tb = F(
    new THREE.CylinderGeometry(0.38, 0.32, 0.95, 12),
    flat(0x8a8f94, { metalness: 0.5, roughness: 0.4 }),
    0.03,
    70,
  );
  tb.position.y = 0.48;
  trash.add(tb);
  const lid = F(
    new THREE.SphereGeometry(0.4, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2),
    flat(0x5f656b),
    0.03,
    71,
  );
  lid.position.y = 0.95;
  lid.scale.y = 0.5;
  trash.add(lid);
  trash.traverse((o) => (o.castShadow = true));
  trash.position.set(-1.75, 0, 1.4);
}
// printer + sticker + plain bottle (analogy corner) — and the ink can later
const side = new THREE.Group();
side.position.set(...SIDE);
scene.add(side);
const printer = new THREE.Group();
side.add(printer);
const sticker = new THREE.Mesh(
  new THREE.PlaneGeometry(0.34, 0.27),
  new THREE.MeshStandardMaterial({ map: barcodeTex, roughness: 0.5, side: THREE.DoubleSide }),
);
const plainBottle = makeBottle({ fake: true });
const inkCan = new THREE.Group();
side.add(inkCan);
{
  // a little table
  const tbl = new THREE.Group();
  side.add(tbl);
  const wood = flat(0xc58b4f, { roughness: 0.6 });
  const top = F(new THREE.BoxGeometry(1.8, 0.08, 1.1), wood, 0.04, 80);
  top.position.y = 0.82;
  tbl.add(top);
  for (const [x, z] of [
    [-0.8, -0.45],
    [0.8, -0.45],
    [-0.8, 0.45],
    [0.8, 0.45],
  ]) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.8, 0.07), wood);
    l.position.set(x, 0.4, z);
    tbl.add(l);
  }
  tbl.traverse((o) => (o.castShadow = o.receiveShadow = true));
  // home printer
  const body = F(
    new THREE.BoxGeometry(0.8, 0.32, 0.55),
    flat(0xf1f1ee, { roughness: 0.35 }),
    0.03,
    81,
  );
  body.position.set(0.25, 1.02, -0.05);
  printer.add(body);
  const tray = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.02, 0.3), flat(0x2b2f35));
  tray.position.set(0.25, 0.95, 0.32);
  printer.add(tray);
  const led = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.03, 0.02),
    flat(0xffffff, { emissive: 0x3dff7a, emissiveIntensity: 1.2 }),
  );
  led.position.set(0.55, 1.12, 0.23);
  printer.add(led);
  printer.traverse((o) => (o.castShadow = true));
  side.add(sticker);
  plainBottle.rotation.x = -Math.PI / 2; // stands upright on the table
  side.add(plainBottle);
  // ink can with a padlock (the special ink nobody else gets)
  const can = F(
    new THREE.CylinderGeometry(0.28, 0.28, 0.42, 16),
    flat(0xb9c2ca, { metalness: 0.7, roughness: 0.3 }),
    0.02,
    82,
  );
  can.position.y = 1.07;
  inkCan.add(can);
  const lbl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.285, 0.285, 0.22, 16, 1, true),
    new THREE.MeshStandardMaterial({
      map: canvasTex(512, 128, (g, w, h) => {
        g.fillStyle = "#0f3d26";
        g.fillRect(0, 0, w, h);
        g.fillStyle = "#3dff7a";
        g.font = FONT(56);
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText("SPEZIALFARBE", w / 2, h / 2);
      }),
      roughness: 0.4,
    }),
  );
  lbl.position.y = 1.07;
  inkCan.add(lbl);
  const goo = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.25, 0.02, 16),
    flat(0xffffff, { emissive: 0x3dff7a, emissiveIntensity: 1.6 }),
  );
  goo.position.y = 1.29;
  inkCan.add(goo);
  // chain + padlock across the lid
  const chainMat = flat(0x8a9096, { metalness: 0.8, roughness: 0.3 });
  for (let i = 0; i < 9; i++) {
    const l = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.012, 6, 10), chainMat);
    l.position.set(-0.3 + i * 0.075, 1.31, 0.0);
    l.rotation.y = i % 2 ? Math.PI / 2 : 0;
    inkCan.add(l);
  }
  const lock = F(
    new THREE.BoxGeometry(0.2, 0.18, 0.08),
    flat(0xd9a441, { metalness: 0.75, roughness: 0.3 }),
    0.02,
    83,
  );
  lock.position.set(0, 1.2, 0.3);
  inkCan.add(lock);
  const shackle = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.018, 6, 12, Math.PI), chainMat);
  shackle.position.set(0, 1.29, 0.3);
  inkCan.add(shackle);
  inkCan.position.x = 0.1;
  inkCan.traverse((o) => (o.castShadow = true));
}
const inkLight = new THREE.PointLight(0x3dff7a, 0, 2.5, 1.5);
inkLight.position.set(0.1, 1.6, 0.3);
side.add(inkLight);

const hand = createHand({ scale: 0.85, sleeve: 0xe86a8f });

// ---------------------------------------------------------------- helpers
// bottle lying on the rails: pivot at the middle, so z = middle position
const putOnAxis = (obj, z, y = AXIS_Y) => {
  obj.visible = true;
  obj.position.set(0, y, z);
  obj.rotation.set(0, 0, 0);
};
const RING_C = RING_Z + 0.22; // bottle middle when the label sits in the ring
const CHECK_C = CHECK_Z + 0.1;
const PRESS_C = PRESS_Z + 0.02;
// a bottle thrown out of the opening on an arc
function throwOut(obj, u, end, spin, seed = 0) {
  const p0 = V(0, AXIS_Y, OPEN_Z + 0.15);
  const e = smooth(clamp01(u));
  const p = p0.clone().lerp(V(...end), clamp01(u));
  p.y += Math.sin(Math.PI * clamp01(u)) * 0.75;
  obj.position.copy(p);
  obj.rotation.set(u * spin + seed, u * spin * 0.6, u * spin * 0.3);
  obj.visible = u > -0.2;
  return e;
}

const applyCamera = shotCamera(shots);

// ---------------------------------------------------------------- render
function renderAt(t) {
  // ---- x-ray: only in the medium "how it sits inside" shots
  const xk = Math.max(
    smooth(ramp(t, T.und1, T.und1 + 0.35)) * (t < T.folg ? 1 : 0),
    t >= T.verrueckte && t < T.fakt
      ? smooth(ramp(t, T.verrueckte, T.verrueckte + 0.25)) * (1 - ramp(t, T.fakt - 0.2, T.fakt))
      : 0,
  );
  setXray(shellMats, xk);
  inner.visible = xk < 0.02;
  // cut-away for the inside shots: the right side wall opens, the right
  // neighbour machine steps aside so the camera has room
  let si = shots.length - 1;
  while (si > 0 && shots[si].at > t) si--;
  const insideShot = !!shots[si].inside;
  sideMat.visible = !insideShot;
  stripeSide[0].visible = !insideShot;
  neighbours[1].visible = !insideShot;

  // ---- hand: frame 0 it just pushed the crushed bottle in and recoils;
  // at "Genau" it slides the fake in
  hand.track(t, [
    { t: -0.5, pos: [0.42, 1.5, 0.45], rot: [0, -Math.PI / 2, 0], pose: "grab" },
    { t: 0.05, pos: [0.5, 1.52, 0.5], rot: [0, -Math.PI / 2, 0], pose: "open" },
    { t: 0.6, pos: [1.05, 1.72, 0.9], rot: [0.2, -Math.PI / 2 - 0.4, 0.3], pose: "open" },
    { t: 1.1, pos: [1.6, 1.85, 1.3], rot: [0.2, -Math.PI / 2 - 0.4, 0.3], pose: "open", out: true },
    { t: T.genau - 0.1, pos: [0.75, 1.48, 0.95], rot: [0, -Math.PI / 2, 0], pose: "grab" },
    { t: T.genau + 0.5, pos: [0.42, 1.5, 0.5], rot: [0, -Math.PI / 2, 0], pose: "grab" },
    { t: T.genau + 0.85, pos: [0.5, 1.5, 0.55], rot: [0, -Math.PI / 2, 0], pose: "open" },
    { t: T.genau + 1.3, pos: [1.3, 1.45, 1.2], rot: [0, -Math.PI / 2, 0], pose: "open", out: true },
  ]);

  // ---- hook: the crushed bottle shoots out towards you (until "Pfandflasche"),
  // then falls tumbling — it lands exactly when the slow motion ends
  {
    const end = T.automat1 + (T.er1 - T.automat1) * 0.3; // scene time
    const p0 = V(0, AXIS_Y, OPEN_Z + 0.25);
    const p1 = V(0.38, 1.9, 1.9);
    const p2 = V(0.95, 0.09, 2.85);
    const pos = V(0, 0, 0);
    if (t < T.pfandflasche) {
      const a = ramp(t, -0.08, T.pfandflasche);
      const e = 1 - (1 - a) * (1 - a);
      pos.copy(p0).lerp(p1, e);
      pos.y += Math.sin(e * Math.PI) * 0.12;
    } else {
      const b = ramp(t, T.pfandflasche, end);
      pos.set(
        lerp(p1.x, p2.x, b),
        lerp(p1.y, p2.y, b * b) + Math.sin(b * Math.PI) * 0.25,
        lerp(p1.z, p2.z, b),
      );
    }
    const spin = ramp(t, -0.08, end);
    hookCrushed.position.copy(pos);
    hookCrushed.rotation.set(0.4 + spin * 6.2, 0.6 + spin * 2.4, spin * 1.6);
    hookCrushed.visible = t < T.stell;
    if (t >= end) hookCrushed.rotation.set(0, 0.9, Math.PI / 2);
  }

  // ---- screen
  let scr = "idle";
  if (t < T.er1) scr = "x";
  else if (t < T.stell) scr = t < T.betrueger1 ? "sus" : "betrug";
  else if (t >= T.und1 && t < T.sicher) scr = "scan";
  else if (t >= T.sicher && t < T.noe) scr = "ok";
  else if (t >= T.noe && t < T.einen) scr = "x";
  else if (t >= T.genau && t < T.rate) scr = t < T.genau + 0.9 ? "scan" : "money";
  else if (t >= T.fliegt && t < T.dann2) scr = "nope";
  else if (t >= T.passt && t < T.verrueckte) scr = "ok";
  drawScreen(scr);

  // ---- mouth ring colour: red on refusals, white flash on the cameras, green otherwise
  {
    const red =
      t < T.stell ||
      (t >= T.noe && t < T.einen) ||
      (t >= T.fliegt && t < T.dann2) ||
      (t >= T.form2 - 0.3 && t < T.fakt);
    ringGlow.emissive.setHex(red ? RED : GREEN);
    ringGlow.color.setHex(red ? RED : GREEN);
    mouthLight.color.setHex(red ? 0xff4b3a : 0x3dff7a);
    const blink = red && t < T.stell ? 0.6 + 0.4 * Math.sign(Math.sin(t * 22)) : 1;
    ringGlow.emissiveIntensity = 2.2 * blink;
    mouthLight.intensity = 1.6 * blink;
  }

  // ---- beat 1: bags, the new shopper (set.js), the bin with ✕, the hat
  bags.forEach((b, i) => {
    const at = T.saecke1 + i * 0.12;
    b.visible = t >= at;
    if (b.visible) b.scale.copy(squash(t, at, 0.6)).multiply(V(1, 1.2, 0.9));
  });
  {
    const k = pop(t, T.muelleimer - 0.15, T.er2);
    trash.visible = k > 0;
    trash.scale.setScalar(Math.max(0.001, k));
    showNope(pop(t, T.muelleimer + 0.15, T.er2), -1.75, 1.6, 1.4, 0.6);
  }
  {
    const land = T.detektiv + 0.05;
    hat.visible = t >= land - 0.35;
    const fall = smooth(ramp(t, land - 0.35, land + 0.2));
    const yTop = H + 0.03;
    hat.position.set(0.12, lerp(yTop + 2.2, yTop, Math.min(1, fall * 1.15)), OPEN_Z - 0.7);
    hat.rotation.set(0.12, -0.4, -0.12 + (1 - fall) * 0.6);
    if (t > land + 0.15) hat.scale.copy(squash(t, land + 0.15, 0.5));
    else hat.scale.setScalar(1);
    lens.visible = t >= land;
    lens.scale.setScalar(Math.max(0.001, outBack(ramp(t, land + 0.1, land + 0.45))));
    lens.position.set(1.15, 0.6, 0.0);
    lens.rotation.set(0, -0.6, 0.35);
  }

  // ---- the hero bottle's journey
  hero.visible = false;
  fake.visible = false;
  crushed2.visible = false;
  pressed.visible = false;
  const heroLogo = hero.userData.logo.material;
  heroLogo.emissiveIntensity = 0;
  if (t >= T.und1 && t < T.genau) {
    // slides in from the opening into the ring
    const k = smooth(ramp(t, T.und1 + 0.05, T.verhoert));
    putOnAxis(hero, lerp(OPEN_Z + 0.55, RING_C, k));
  } else if (t >= T.rate && t < T.es) {
    putOnAxis(hero, RING_C);
  } else if (t >= T.es && t < T.eine) {
    const k = smooth(ramp(t, T.es, T.es + 0.4));
    putOnAxis(hero, lerp(RING_C, CHECK_C, k));
    heroLogo.emissiveIntensity =
      2.2 *
      smooth(ramp(t, T.spezialfarbe, T.spezialfarbe + 0.25)) *
      (0.85 + 0.15 * Math.sin(t * 7));
  } else if (t >= T.dann2 && t < T.zack) {
    // back on the scale (it sinks a hair under the weight)
    putOnAxis(hero, CHECK_C, AXIS_Y - 0.012 * smooth(ramp(t, T.wiegt, T.wiegt + 0.3)));
    heroLogo.emissiveIntensity = 0.8;
  } else if (t >= T.zack && t < PRESS.flat) {
    const k = smooth(ramp(t, PRESS.move, PRESS.slam));
    putOnAxis(hero, lerp(CHECK_C, PRESS_C, k));
    // squashing under the plate
    const c = smooth(ramp(t, PRESS.slam, PRESS.flat));
    hero.scale.set(1 + c * 0.45, 1 - c * 0.75, 1);
  } else if (t >= T.nur && t < T.und3) {
    const k = smooth(ramp(t, T.nur + 0.1, T.nur + 0.8));
    putOnAxis(hero, lerp(OPEN_Z + 0.55, RING_C, k));
  }
  if (!(t >= T.zack && t < PRESS.flat)) hero.scale.set(1, 1, 1);
  // after the press: flat on the anvil, then down through the trap door
  if (t >= PRESS.flat && t < T.nur) {
    pressed.visible = true;
    const d = smooth(ramp(t, PRESS.drop + 0.1, PRESS.drop + 0.7));
    pressed.position.set(lerp(0, 0.15, d), lerp(AXIS_Y - 0.12, 0.55, d), PRESS_C);
    pressed.rotation.set(0, 0, lerp(Math.PI / 2, Math.PI / 2 + 0.5, d));
  }
  // the fake: in through the front at "Genau" (outside), under the light at "eine Kopie", out at "fliegt"
  if (t >= T.genau && t < T.rate) {
    const k = smooth(ramp(t, T.genau + 0.1, T.genau + 0.85));
    putOnAxis(fake, lerp(OPEN_Z + 0.75, OPEN_Z - 0.2, k));
  } else if (t >= T.eine && t < T.fliegt) {
    putOnAxis(fake, CHECK_C);
  } else if (t >= T.fliegt && t < T.dann2) {
    const u = ramp(t, T.fliegt, T.fliegt + 0.95);
    throwOut(fake, u, [-0.9, 0.12, 2.6], -6, 0.2);
  }
  // the crushed one at the ring: rattles at the entrance, never gets in
  if (t >= T.und3 && t < T.fakt) {
    const k = smooth(ramp(t, T.und3 + 0.05, T.und3 + 0.5));
    putOnAxis(crushed2, lerp(OPEN_Z + 0.6, OPEN_Z - 0.12, k));
    crushed2.rotation.z = Math.PI / 2 + Math.sin(t * 40) * 0.04 * ramp(t, T.form2 - 0.3, T.form2);
  }

  // ---- ring of cameras: flashes on "verhört" and "Kameras", red / green verdicts
  {
    let lens = 0.6;
    let col = 0x9fe8ff;
    const fl = (at) => Math.exp(-Math.max(0, t - at) * 9) * (t >= at ? 1 : 0);
    const f =
      fl(T.verhoert) +
      fl(T.kameras + 0.05) +
      fl(T.kameras + 0.25) +
      fl(T.kameras + 0.45) +
      fl(T.form1 + 0.2) +
      fl(T.farbe + 0.2) +
      fl(T.groesse + 0.2);
    lens += f * 5;
    if (t >= T.nur + 0.8 && t < T.und3) {
      col = 0x3dff7a;
      lens = 3;
    }
    if (t >= T.form2 - 0.3 && t < T.fakt) {
      col = 0xff3b30;
      lens = 3 * (0.6 + 0.4 * Math.sign(Math.sin(t * 20)));
    }
    lensMat.emissive.setHex(col);
    lensMat.color.setHex(col);
    lensMat.emissiveIntensity = lens;
    ringLight.color.setHex(col);
    ringLight.intensity = Math.min(6, f * 4 + (lens > 2 ? 1.2 : 0));
  }
  // barcode laser sweeping over the barcode
  {
    const on = t >= T.strichcode1 - 0.3 && t < T.sicher;
    laser.visible = on;
    laserLight.intensity = on ? 1.2 : 0;
    if (on) {
      const s = Math.sin((t - T.strichcode1) * 5.5);
      laser.position.set(RB + 0.01, AXIS_Y, LABEL_Z + 0.04 + s * 0.06);
      laserLight.position.set(0.35, AXIS_Y, laser.position.z);
    }
  }
  // the logo light + sensor (green ✓ for the real one, red for the copy)
  {
    const uv = (t >= T.es && t < T.eine + 0.6) || (t >= T.eine && t < T.fliegt) ? 1 : 0;
    uvMat.emissiveIntensity = 0.3 + uv * 2.6 * (0.9 + 0.1 * Math.sin(t * 30));
    uvLight.intensity = uv * 2.2;
    const bad = t >= T.kopie + 0.15 && t < T.fliegt;
    sensorMat.emissive.setHex(bad ? RED : GREEN);
    sensorMat.emissiveIntensity = bad ? 2.5 : t >= T.spezialfarbe && t < T.eine ? 2 : 0.4;
  }
  // interrogation lamp: steady, a little swing after the bottle arrives
  lampLight.intensity = 2.6;
  // the press
  {
    let y = 2.38;
    if (t >= T.zack && t < T.nur) {
      const down = smooth(ramp(t, PRESS.slam, PRESS.slam + 0.05));
      const up = smooth(ramp(t, PRESS.drop - 0.1, PRESS.drop + 0.4));
      y = lerp(2.38, AXIS_Y - 0.03, down * (1 - up));
    }
    plate.position.set(0, y, PRESS_Z);
    anvilPivot.rotation.z =
      -smooth(ramp(t, PRESS.drop, PRESS.drop + 0.25)) *
      (1 - ramp(t, PRESS.drop + 1.6, PRESS.drop + 2.0)) *
      1.3;
    warnMat.emissiveIntensity =
      t >= T.zack && t < T.nur ? 2.5 * (0.5 + 0.5 * Math.sign(Math.sin(t * 25))) : 0.3;
  }

  // ---- receipt: prints out when the fake is "paid" (humorously long)
  {
    const len =
      t >= T.genau + 0.9 && t < T.rate
        ? 0.05 + smooth(ramp(t, T.genau + 0.9, T.rate - 0.1)) * 0.85
        : t >= T.passt && t < T.verrueckte
          ? 0.18
          : 0;
    bon.visible = len > 0.01;
    bon.scale.set(1, Math.max(0.01, len), 1);
    bon.rotation.x = -0.15 * len;
  }

  // ---- analogy corner: printer + sticker (27.4–29.0), ink can (36.3–37.9)
  {
    const pk = pop(t, T.einen - 0.1, T.genau);
    printer.visible = pk > 0;
    printer.scale.setScalar(Math.max(0.001, pk));
    // the sticker slides out of the printer, flies onto the plain bottle
    const out = smooth(ramp(t, T.einen + 0.25, T.einen + 0.9));
    const fly = smooth(ramp(t, T.ausdrucken + 0.05, T.ausdrucken + 0.45));
    sticker.visible = pk > 0 && t > T.einen + 0.2;
    sticker.position.set(
      lerp(0.25, -0.5, fly),
      lerp(0.96, 1.2, fly) + Math.sin(fly * Math.PI) * 0.35,
      lerp(0.15 + out * 0.3, 0.12, fly),
    );
    sticker.rotation.set(lerp(-Math.PI / 2, 0, fly), lerp(0, 0.15, fly), fly * Math.PI * 2);
    sticker.scale.setScalar(lerp(1, 0.6, fly));
    plainBottle.visible = pk > 0;
    plainBottle.userData.code.visible = t >= T.ausdrucken + 0.45;
    plainBottle.position.set(-0.5, 0.86 + LEN / 2, 0.0);
    const ik = pop(t, T.die - 0.1, T.automat3);
    inkCan.visible = ik > 0;
    inkCan.scale.setScalar(Math.max(0.001, ik));
    inkLight.intensity = ik * 2.2;
    // lock rattles once
    inkCan.rotation.z =
      Math.sin((t - T.druckereien) * 30) * 0.03 * pop(t, T.druckereien, T.druckereien + 0.5, 0.05);
  }

  // ---- HUD: device-style read-outs (max 2 at a time, clear of the captions)
  viewfinder(pop(t, T.ring, T.dann1), {
    label: "CAM 1–8 · 360°",
    time: `00:00:${String(Math.floor((t - T.ring) * 30) % 30).padStart(2, "0")}`,
    color: "#3dff7a",
  });
  {
    const n = (t >= T.form1 ? 1 : 0) + (t >= T.farbe ? 1 : 0) + (t >= T.groesse ? 1 : 0);
    const v = ["–", "FORM ✓", "FARBE ✓", "GRÖSSE ✓"][n];
    readout("check", pop(t, T.form1, T.dann1), {
      label: "Prüfung 1",
      value: v,
      note: ["", "Flasche", "klar", "1,0 L"][n],
      x: 60,
      y: 1160,
      color: "#3dff7a",
    });
  }
  readout("code", pop(t, T.cola, T.sicher), {
    label: "Strichcode",
    value: t >= T.cent - 0.3 ? "25 CT" : "COLA 1,0 L",
    note: t >= T.cent - 0.3 ? "Pfand · Einweg" : "erkannt",
    x: 60,
    y: 1160,
    color: "#3dff7a",
  });
  gauge("weight", pop(t, T.wiegt, T.zack), {
    label: "Gewicht",
    value: 31 * smooth(ramp(t, T.wiegt + 0.1, T.wiegt + 0.8)),
    max: 100,
    unit: "g",
    x: 640,
    y: 1120,
    color: t >= T.saft + 0.4 ? "#3dff7a" : "#ffd23f",
    digits: 0,
  });
  readout("leer", pop(t, T.saft + 0.4, T.zack), {
    label: "Inhalt",
    value: "LEER ✓",
    x: 60,
    y: 1160,
    color: "#3dff7a",
  });
  counter("quote", pop(t, T.zahl - 0.2, T.wie), {
    label: "kommen zurück",
    value: `${Math.round(98 * smooth(ramp(t, T.zahl - 0.2, T.zahl + 0.6)))} %`,
    x: 60,
    y: 1160,
    color: "#3dff7a",
  });

  // ---- the guess and the copy (DOM read-outs: the LED panel would sit
  // behind the chamber walls in the inside shots)
  readout("guess", pop(t, T.rate + 0.3, T.logo), {
    label: "Woran?",
    value: "?",
    x: 60,
    y: 1160,
    color: "#ffd23f",
  });
  readout("copy", pop(t, T.kopie + 0.15, T.fliegt), {
    label: "Pfand-Logo",
    value: "KOPIE ✕",
    note: "leuchtet nicht",
    x: 60,
    y: 1160,
    color: "#ff4b2b",
  });
  showPanel(0);
  showNope(pop(t, T.noe, T.einen), 0, 1.95, 0.8, 0.5);
  showNope(pop(t, T.form2, T.fakt), 0.55, 1.95, 0.6, 0.45);
  puff("hat", t, T.detektiv + 0.1, 0.12, H + 0.05, OPEN_Z - 0.7, 0.9);
  puff("bags", t, T.saecke1 + 0.1, BAGS[0] + 0.3, 0.05, BAGS[2] + 0.2, 1.1);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
