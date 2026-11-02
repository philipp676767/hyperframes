// #48 Touchscreen — "Handschuh an? Dein Handy ignoriert dich. Eine Wurst
// nicht." A giant phone stands at a snowy Viennese tram stop. Frame 0: a
// gloved hand jabs at it — nothing, ✕. The same glove with a sausage: it
// unlocks, the message goes out. The bare finger hovers, something inside
// it glows. Then the phone comes apart: glass, the sensor grid of thin
// wires, tiny fields at every crossing; the chip scans row by row, the
// finger steals charge from one field — TIPP. Payoff inside a giant
// fingertip: salt water. Übrigens: germs crawling on the display next to a
// toilet seat.
import {
  THREE,
  ramp,
  smooth,
  lerp,
  pop,
  V,
  scene,
  flat,
  rng,
  roundedRect,
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
import { counter } from "./hud.js";
import {
  T,
  shots,
  LABELS,
  HIGHLIGHTS,
  TAPS_GLOVE,
  TAP_WURST,
  TAP_SEND,
  TAP_FINGER,
  TAP_GLOVE2,
  TAP_WURST2,
  FS,
} from "./beats.js";

highlights(HIGHLIGHTS);

const shadow = (o) =>
  o.traverse((m) => {
    if (m.isMesh) m.castShadow = m.receiveShadow = true;
  });
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();
const _p = new THREE.Vector3();
function canvasTex(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return { c, g: c.getContext("2d"), tex, key: "" };
}

// ================================================================ the phone
const PW = 1.3;
const PH = 2.6;
const PT = 0.12;
const Y0 = 1.65; // centre height
const phone = new THREE.Group();
scene.add(phone);
// a snowy stone plinth it stands on
{
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.35, 0.8), flat(0x8f8f9e));
  plinth.position.set(0, 0.175, -0.05);
  phone.add(plinth);
  const cap = new THREE.Mesh(new THREE.BoxGeometry(1.74, 0.07, 0.84), flat(0xf6f9ff));
  cap.position.set(0, 0.36, -0.05);
  phone.add(cap);
}
const coral = flat(0xff6f5a, { roughness: 0.3, metalness: 0.15 });
{
  const geo = new THREE.ExtrudeGeometry(roundedRect(PW, PH, 0.18), {
    depth: PT,
    bevelEnabled: false,
    curveSegments: 6,
  });
  geo.translate(0, -PH / 2, -PT / 2);
  const body = new THREE.Mesh(geo, coral);
  body.position.y = Y0;
  phone.add(body);
  const bezelGeo = new THREE.ShapeGeometry(roundedRect(PW - 0.05, PH - 0.05, 0.16));
  bezelGeo.translate(0, -(PH - 0.05) / 2, 0);
  const bezel = new THREE.Mesh(bezelGeo, flat(0x0a0a0e, { roughness: 0.1, metalness: 0.3 }));
  bezel.position.set(0, Y0, PT / 2 + 0.002);
  phone.add(bezel);
  const btn = (y, h) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.035, h, 0.06), coral);
    b.position.set(PW / 2 + 0.014, Y0 + y, 0);
    phone.add(b);
  };
  btn(0.55, 0.36);
  btn(0.05, 0.22);
}
shadow(phone);

// ---------------------------------------------------------------- the display
const SW = PW - 0.12;
const SH = PH - 0.14;
const screenArt = canvasTex(256, 544);
const MSG = "Bin gleich da!";
function bubble(g, x, y, w, h, fill) {
  g.fillStyle = fill;
  g.beginPath();
  g.roundRect(x, y, w, h, 22);
  g.fill();
}
function drawScreen(state, typed = 0) {
  const key = state + typed;
  if (key === screenArt.key) return;
  screenArt.key = key;
  const { g, c } = screenArt;
  const W = c.width;
  const H = c.height;
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, "#1f6f8f");
  gr.addColorStop(0.55, "#6a4fb0");
  gr.addColorStop(1, "#ff7a7a");
  g.fillStyle = gr;
  g.fillRect(0, 0, W, H);
  g.fillStyle = "rgba(255,255,255,.12)";
  g.beginPath();
  g.arc(60, 420, 100, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.arc(215, 230, 64, 0, Math.PI * 2);
  g.fill();
  g.textAlign = "center";
  g.fillStyle = "#fff";
  if (state === "lock") {
    g.font = '700 22px "Montserrat", sans-serif';
    g.fillText("Montag, 2. November", W / 2, 70);
    g.font = '800 84px "Montserrat", sans-serif';
    g.fillText("17:48", W / 2, 154);
    bubble(g, 18, 210, W - 36, 74, "rgba(255,255,255,.9)");
    g.fillStyle = "#1c1c22";
    g.textAlign = "left";
    g.font = '800 22px "Montserrat", sans-serif';
    g.fillText("Lisa", 36, 240);
    g.font = '600 20px "Montserrat", sans-serif';
    g.fillText("Wo bist du??", 36, 268);
    g.fillStyle = "rgba(255,255,255,.85)";
    g.beginPath();
    g.roundRect(W / 2 - 50, H - 26, 100, 8, 4);
    g.fill();
  } else if (state === "chat" || state === "sent") {
    g.fillStyle = "rgba(10,12,22,.55)";
    g.fillRect(0, 0, W, H);
    g.fillStyle = "rgba(255,255,255,.95)";
    g.fillRect(0, 0, W, 78);
    g.fillStyle = "#1c1c22";
    g.font = '800 26px "Montserrat", sans-serif';
    g.fillText("Lisa", W / 2, 52);
    bubble(g, 16, 110, 170, 58, "#ffffff");
    g.fillStyle = "#1c1c22";
    g.textAlign = "left";
    g.font = '700 21px "Montserrat", sans-serif';
    g.fillText("Wo bist du??", 32, 146);
    if (state === "sent") {
      bubble(g, 72, 196, 168, 58, "#3ddc84");
      g.fillStyle = "#0b2a17";
      g.fillText(MSG, 86, 232);
      g.fillStyle = "#fff";
      g.font = '800 18px "Montserrat", sans-serif';
      g.textAlign = "right";
      g.fillText("Gesendet ✓✓", W - 18, 280);
    }
    // input line + keyboard
    g.fillStyle = "rgba(255,255,255,.95)";
    g.beginPath();
    g.roundRect(12, 330, W - 84, 46, 23);
    g.fill();
    g.fillStyle = "#1c1c22";
    g.textAlign = "left";
    g.font = '700 20px "Montserrat", sans-serif';
    if (state === "chat")
      g.fillText(MSG.slice(0, typed) + (typed < MSG.length ? "|" : ""), 26, 360);
    g.fillStyle = "#3ddc84";
    g.beginPath();
    g.arc(W - 38, 353, 25, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "#fff";
    g.lineWidth = 6;
    g.lineCap = "round";
    g.beginPath();
    g.moveTo(W - 38, 365);
    g.lineTo(W - 38, 342);
    g.moveTo(W - 48, 351);
    g.lineTo(W - 38, 341);
    g.lineTo(W - 28, 351);
    g.stroke();
    g.fillStyle = "rgba(30,32,44,.92)";
    g.fillRect(0, 392, W, H - 392);
    g.fillStyle = "rgba(255,255,255,.22)";
    for (let r = 0; r < 3; r++)
      for (let k = 0; k < 8; k++) {
        g.beginPath();
        g.roundRect(8 + k * 30.5 + r * 8, 404 + r * 42, 25, 34, 6);
        g.fill();
      }
  } else if (state === "ok") {
    g.fillStyle = "#3ddc84";
    g.beginPath();
    g.arc(W / 2, 250, 70, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "#fff";
    g.lineWidth = 18;
    g.lineCap = "round";
    g.lineJoin = "round";
    g.beginPath();
    g.moveTo(W / 2 - 32, 250);
    g.lineTo(W / 2 - 8, 276);
    g.lineTo(W / 2 + 36, 224);
    g.stroke();
    g.fillStyle = "#fff";
    g.font = '800 34px "Montserrat", sans-serif';
    g.fillText("Geht!", W / 2, 372);
  } else if (state === "dim") {
    g.fillStyle = "rgba(4,6,14,.82)";
    g.fillRect(0, 0, W, H);
  }
  screenArt.tex.needsUpdate = true;
}
drawScreen("lock");
const display = new THREE.Mesh(
  new THREE.PlaneGeometry(SW, SH),
  new THREE.MeshBasicMaterial({ map: screenArt.tex, toneMapped: false }),
);
display.position.set(0, Y0, PT / 2 + 0.005);
phone.add(display);
const screenLight = new THREE.PointLight(0xb4c8ff, 0.7, 2.2, 2);
screenLight.position.set(0, Y0, 0.25);
phone.add(screenLight);

// ---------------------------------------------------------------- the glass
const glassMat = new THREE.MeshStandardMaterial({
  color: 0xdff4ff,
  transparent: true,
  opacity: 0.22,
  roughness: 0.04,
  metalness: 0.1,
  emissive: 0x9fdcff,
  emissiveIntensity: 0,
  depthWrite: false,
});
const glassGeo = new THREE.BoxGeometry(PW - 0.05, PH - 0.05, 0.025);
const glass = new THREE.Mesh(glassGeo, glassMat);
glass.userData.noAO = true;
phone.add(glass);
const glassEdgeMat = new THREE.LineBasicMaterial({
  color: 0x9fe8ff,
  transparent: true,
  opacity: 0,
});
const glassEdges = new THREE.LineSegments(new THREE.EdgesGeometry(glassGeo), glassEdgeMat);
phone.add(glassEdges);
// the crack: a spider web from one corner
const crackArt = canvasTex(256, 544);
{
  const { g } = crackArt;
  const r = rng(77);
  const cx = 176;
  const cy = 392;
  const rays = [];
  for (let i = 0; i < 13; i++) {
    const a = (i / 13) * Math.PI * 2 + (r() - 0.5) * 0.35;
    const pts = [[cx, cy]];
    let x = cx;
    let y = cy;
    const len = 120 + r() * 260;
    for (let s = 1; s <= 7; s++) {
      x = cx + (Math.cos(a + (r() - 0.5) * 0.2) * (len * s)) / 7;
      y = cy + (Math.sin(a + (r() - 0.5) * 0.2) * (len * s)) / 7;
      pts.push([x, y]);
    }
    rays.push(pts);
  }
  const line = (pts, w, col) => {
    g.strokeStyle = col;
    g.lineWidth = w;
    g.lineJoin = "round";
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.stroke();
  };
  for (const pass of [
    [5, "rgba(20,24,40,.55)"],
    [2.2, "rgba(255,255,255,.95)"],
  ]) {
    rays.forEach((p) => line(p, pass[0], pass[1]));
    for (const ring of [1, 2, 3, 4]) {
      for (let i = 0; i < rays.length; i++) {
        const a = rays[i][Math.min(7, ring + 1)];
        const b = rays[(i + 1) % rays.length][Math.min(7, ring + 1)];
        if ((i + ring) % 3 === 0) continue;
        line([a, [(a[0] + b[0]) / 2 + 6, (a[1] + b[1]) / 2 + 4], b], pass[0] * 0.8, pass[1]);
      }
    }
  }
  g.fillStyle = "rgba(255,255,255,.9)";
  g.beginPath();
  g.arc(cx, cy, 9, 0, Math.PI * 2);
  g.fill();
  crackArt.tex.needsUpdate = true;
}
const crackMat = new THREE.MeshBasicMaterial({
  map: crackArt.tex,
  transparent: true,
  opacity: 0,
  toneMapped: false,
  depthWrite: false,
});
const crack = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), crackMat);
phone.add(crack);

// ---------------------------------------------------------------- the sensor grid
const NC = 6;
const NR = 11;
const colX = (i) => -SW / 2 + 0.1 + (i * (SW - 0.2)) / (NC - 1);
const rowY = (j) => Y0 - SH / 2 + 0.16 + (j * (SH - 0.32)) / (NR - 1);
const TOUCH = { i: 3, j: 6 }; // the crossing the finger steals from
const grid = new THREE.Group();
phone.add(grid);
const rowMats = [];
const rows = [];
for (let j = 0; j < NR; j++) {
  const m = flat(0x3fd8ff, { emissive: 0x3fd8ff, emissiveIntensity: 0.9 });
  rowMats.push(m);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(SW - 0.06, 0.016, 0.012), m);
  bar.position.set(0, rowY(j), 0);
  bar.userData.noAO = true;
  grid.add(bar);
  rows.push(bar);
}
const colMat = flat(0x7cf2c8, { emissive: 0x7cf2c8, emissiveIntensity: 0.8 });
const cols = [];
for (let i = 0; i < NC; i++) {
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.016, SH - 0.1, 0.012), colMat);
  bar.position.set(colX(i), Y0, 0.012);
  bar.userData.noAO = true;
  grid.add(bar);
  cols.push(bar);
}
// crossings: a bright dot + a small field bubble each
const NX = NC * NR;
const dots = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.022, 1),
  new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
  NX,
);
dots.userData.noAO = true;
grid.add(dots);
const fieldMat = new THREE.MeshBasicMaterial({
  color: 0x6fe8ff,
  transparent: true,
  opacity: 0.42,
  depthWrite: false,
  toneMapped: false,
});
const fields = new THREE.InstancedMesh(new THREE.SphereGeometry(0.075, 12, 8), fieldMat, NX);
fields.userData.noAO = true;
grid.add(fields);

// ---------------------------------------------------------------- the chip
const chip = new THREE.Group();
{
  const gold = flat(0xffc84a, {
    metalness: 0.7,
    roughness: 0.3,
    emissive: 0xffa21a,
    emissiveIntensity: 0.2,
  });
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.3, 0.05),
    flat(0x15161c, { roughness: 0.35 }),
  );
  chip.add(body);
  for (let k = 0; k < 6; k++)
    for (const s of [-1, 1]) {
      const pin = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.02), gold);
      pin.position.set(-0.17 + k * 0.068, s * 0.17, 0);
      chip.add(pin);
    }
  const dot = new THREE.Mesh(new THREE.CircleGeometry(0.025, 10), flat(0x3a3d4a));
  dot.position.set(-0.14, 0.08, 0.027);
  chip.add(dot);
  // traces from the chip up to every column
  for (let i = 0; i < NC; i++) {
    const x0 = -0.15 + i * 0.06;
    const x1 = colX(i);
    const yTop = rowY(0) - 0.02;
    const yChip = 0.17;
    const up = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.12, 0.01), gold);
    up.position.set(x0, yChip + 0.06, 0);
    chip.add(up);
    const dx = x1 - x0;
    const across = new THREE.Mesh(new THREE.BoxGeometry(Math.abs(dx) + 0.012, 0.012, 0.01), gold);
    across.position.set(x0 + dx / 2, yChip + 0.12, 0);
    chip.add(across);
    const h = yTop - (Y0 - SH / 2 + 0.29 + yChip + 0.12) + 0.29;
    const rise = new THREE.Mesh(new THREE.BoxGeometry(0.012, Math.max(0.01, h), 0.01), gold);
    rise.position.set(x1, yChip + 0.12 + h / 2, 0);
    chip.add(rise);
  }
  chip.position.set(0, Y0 - SH / 2 + 0.29 - 0.17, 0);
  chip.userData.gold = gold;
  phone.add(chip);
}

// ---------------------------------------------------------------- tap ripple
const rippleMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0,
  toneMapped: false,
  depthWrite: false,
});
const ripple = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.012, 6, 32), rippleMat);
ripple.userData.noAO = true;
phone.add(ripple);

// ---------------------------------------------------------------- germs (Übrigens)
const NG = 46;
const germColors = [0x7cf26a, 0xb06fe3, 0x3fd8c8, 0xc8f23f];
const germs = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.042, 0),
  flat(0xffffff, { roughness: 0.5 }),
  NG + 6,
);
germs.userData.noAO = true;
scene.add(germs);
const germSeeds = [];
{
  const r = rng(91);
  const c = new THREE.Color();
  for (let i = 0; i < NG + 6; i++) {
    germSeeds.push([r(), r(), r() * 6, 0.7 + r() * 0.7]);
    germs.setColorAt(i, c.set(germColors[i % germColors.length]));
  }
}

// ---------------------------------------------------------------- the toilet seat
const KB = V(2.05, 0, 0.45);
const klo = new THREE.Group();
{
  const white = flat(0xf6f7fb, { roughness: 0.25 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.34, 0.4, 14), white);
  base.position.y = 0.2;
  klo.add(base);
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.3, 0.45, 18), white);
  bowl.scale.set(1, 1, 1.25);
  bowl.position.y = 0.62;
  klo.add(bowl);
  const water = new THREE.Mesh(
    new THREE.CircleGeometry(0.4, 18),
    flat(0x7fc8ff, { roughness: 0.1 }),
  );
  water.rotation.x = -Math.PI / 2;
  water.scale.set(1, 1.25, 1);
  water.position.y = 0.8;
  klo.add(water);
  const seat = new THREE.Mesh(
    new THREE.TorusGeometry(0.44, 0.075, 8, 28),
    flat(0xffffff, { roughness: 0.3 }),
  );
  seat.rotation.x = Math.PI / 2;
  seat.scale.set(1, 1.25, 1);
  seat.position.y = 0.88;
  klo.add(seat);
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.05, 24), white);
  lid.scale.set(1, 1, 1.22);
  lid.rotation.x = Math.PI / 2 - 0.15;
  lid.position.set(0, 1.42, -0.58);
  klo.add(lid);
  const tank = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.75, 0.3), white);
  tank.position.set(0, 1.25, -0.82);
  klo.add(tank);
  const flush = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.07, 0.03, 12),
    flat(0xc8ccd8, { metalness: 0.6, roughness: 0.3 }),
  );
  flush.position.set(0, 1.64, -0.82);
  klo.add(flush);
  shadow(klo);
  klo.position.copy(KB);
  klo.rotation.y = -0.45;
  scene.add(klo);
}

// ---------------------------------------------------------------- the fingertip mini-set (payoff)
const tip = new THREE.Group();
const ions = [];
{
  const shell = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.62, 1.5, 6, 16),
    new THREE.MeshStandardMaterial({
      color: 0xffc4a8,
      transparent: true,
      opacity: 0.34,
      roughness: 0.3,
      depthWrite: false,
    }),
  );
  shell.rotation.z = Math.PI / 2;
  shell.userData.noAO = true;
  tip.add(shell);
  const rim = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.CapsuleGeometry(0.62, 1.5, 2, 10), 25),
    new THREE.LineBasicMaterial({ color: 0xffd8c8, transparent: true, opacity: 0.5 }),
  );
  rim.rotation.z = Math.PI / 2;
  tip.add(rim);
  const nail = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.3, 0.45, 3, 10),
    flat(0xffd6e0, { roughness: 0.2 }),
  );
  nail.rotation.z = Math.PI / 2;
  nail.scale.set(1, 1, 0.35);
  nail.position.set(0.75, 0.52, 0);
  nail.rotation.x = Math.PI / 2;
  tip.add(nail);
  const water = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.5, 1.4, 6, 14),
    new THREE.MeshStandardMaterial({
      color: 0x2f9bff,
      transparent: true,
      opacity: 0.45,
      emissive: 0x1a5fd6,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      depthWrite: false,
    }),
  );
  water.rotation.z = Math.PI / 2;
  water.userData.noAO = true;
  tip.add(water);
  const r = rng(55);
  const naMat = flat(0xffd23f, { emissive: 0xffb000, emissiveIntensity: 0.7 });
  const clMat = flat(0x7cf26a, { emissive: 0x3fbf3a, emissiveIntensity: 0.6 });
  for (let i = 0; i < 34; i++) {
    const m = new THREE.Mesh(
      new THREE.IcosahedronGeometry(i % 2 ? 0.07 : 0.055, 1),
      i % 2 ? clMat : naMat,
    );
    m.userData.noAO = true;
    tip.add(m);
    ions.push({
      m,
      x: (r() - 0.5) * 1.8,
      y: (r() - 0.5) * 0.65,
      z: (r() - 0.5) * 0.65,
      ph: r() * 6,
    });
  }
  // a piece of the sensor grid in front of the fingertip
  const tile = new THREE.Group();
  for (let k = -2; k <= 2; k++) {
    const a = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 1.3, 0.02),
      flat(0x3fd8ff, { emissive: 0x3fd8ff, emissiveIntensity: 1 }),
    );
    a.position.set(0, 0, k * 0.28);
    tile.add(a);
    const b = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.02, 1.3),
      flat(0x7cf2c8, { emissive: 0x7cf2c8, emissiveIntensity: 1 }),
    );
    b.position.set(0.02, k * 0.28, 0);
    tile.add(b);
  }
  tile.position.set(1.85, 0, 0);
  tip.add(tile);
  tip.position.set(...FS);
  tip.rotation.y = 0.35;
  scene.add(tip);
}
const sparks = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.045, 0),
  new THREE.MeshBasicMaterial({ color: 0xfff27a, toneMapped: false }),
  22,
);
sparks.userData.noAO = true;
sparks.frustumCulled = false;
scene.add(sparks);

// ================================================================ hands
const S = 1.75;
const glove = createHand({ skin: 0xd8343f, sleeve: 0x2e4a7a, scale: S });
const bare = createHand({ skin: 0xf1c09a, sleeve: 0xffc93c, scale: S });
// the sausage, held in the glove's grab
const wurst = new THREE.Group();
{
  const m = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.075, 0.5, 4, 10),
    flat(0xc8693a, { roughness: 0.4 }),
  );
  m.rotation.x = Math.PI / 2;
  wurst.add(m);
  for (const z of [-0.29, 0.29]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 4), flat(0x8a4022));
    e.position.z = z * 1.08;
    wurst.add(e);
  }
  shadow(wurst);
  wurst.position.set(0.05, -0.07, 0.62);
  glove.group.children[0].add(wurst);
}
const IDX = V(0.155, 0, 0.78); // index fingertip, hand-local
const WTIP = V(0.05, -0.07, 0.97); // sausage tip, hand-local
const RG = [-0.1, Math.PI + 0.95, 0.12];
const RB = [-0.08, Math.PI + 0.95, 0.12];
// hand position for a wanted tip position
function at(tipPos, local, rot) {
  const o = local
    .clone()
    .multiplyScalar(S)
    .applyEuler(new THREE.Euler(...rot));
  return [tipPos[0] - o.x, tipPos[1] - o.y, tipPos[2] - o.z];
}
const GZ = PT / 2 + 0.03; // glass front, assembled
const g = (t, p, pose = "point", extra = {}) => ({
  t,
  pos: at(p, IDX, RG),
  rot: RG,
  pose,
  ...extra,
});
const w = (t, p, extra = {}) => ({ t, pos: at(p, WTIP, RG), rot: RG, pose: "grab", ...extra });
const GLOVE_KEYS = [
  g(-0.6, [0.6, 1.2, 0.95]),
  g(-0.25, [0.34, 1.3, 0.38]),
  g(TAPS_GLOVE[0], [0.2, 1.35, GZ], "press"),
  g(0.4, [0.3, 1.38, 0.4]),
  g(TAPS_GLOVE[1], [0.08, 1.48, GZ], "press"),
  g(1.1, [0.32, 1.42, 0.42]),
  g(TAPS_GLOVE[2], [0.22, 1.58, GZ], "press"),
  g(1.95, [0.5, 1.4, 0.65]),
  w(T.eine1, [0.42, 1.45, 0.62]),
  w(TAP_WURST, [0.06, 1.3, GZ]),
  w(TAP_WURST + 0.35, [0.38, 1.3, 0.55]),
  w(T.winter, [0.62, 1.15, 0.85]),
  w(T.tippst - 0.2, [0.6, 1.3, 0.6]),
  w(T.tippst, [0.5, 1.3, 0.42]),
  w(TAP_SEND, [0.41, 1.28, GZ]),
  w(T.klappt, [0.52, 0.95, 0.62]),
  w(T.ja + 0.4, [0.85, 1.2, 1.0]),
  w(T.dein2, [1.3, 1.4, 1.6], { out: true }),
  g(T.handschuh2 - 0.2, [0.55, 1.5, 0.85]),
  g(TAP_GLOVE2, [0.15, 1.55, GZ], "press"),
  g(TAP_GLOVE2 + 0.32, [0.42, 1.5, 0.5]),
  w(T.wurst2 - 0.05, [0.36, 1.5, 0.6]),
  w(TAP_WURST2, [0.05, 1.5, GZ]),
  w(TAP_WURST2 + 0.35, [0.4, 1.45, 0.6]),
  w(T.uebrigens, [0.9, 1.4, 1.3], { out: true }),
];
const b = (t, p, pose = "point", extra = {}) => ({
  t,
  pos: at(p, IDX, RB),
  rot: RB,
  pose,
  ...extra,
});
const gridZ = (ex) => PT / 2 + 0.012 + ex * 0.5;
const touchAt = (ex) => [colX(TOUCH.i), rowY(TOUCH.j), gridZ(ex) + 0.03];
const BARE_KEYS = [
  b(T.dein2 - 0.3, [0.65, 1.7, 0.95]),
  b(T.dein2, [0.36, 1.72, 0.46]),
  b(T.es1, [0.26, 1.74, 0.3]),
  b(T.lass - 0.1, [0.32, 1.76, 0.42]),
  b(T.lass + 0.3, [0.9, 1.9, 1.5], "point", { out: true }),
  b(T.kommt - 0.05, [0.55, 1.98, 1.45]),
  b(TAP_FINGER, [touchAt(1)[0] + 0.03, touchAt(1)[1] + 0.01, touchAt(1)[2] + 0.12]),
  b(T.tipp - 0.05, [touchAt(1)[0] + 0.03, touchAt(1)[1] + 0.01, touchAt(1)[2] + 0.1]),
  b(T.tipp + 0.12, [touchAt(1)[0] + 0.03, touchAt(1)[1] + 0.01, touchAt(1)[2] + 0.06], "press"),
  b(T.salzwasser - 0.05, [0.4, 1.95, 1.0], "point", { out: true }),
];
const fingerMark = new THREE.Object3D();
fingerMark.position.copy(IDX);
bare.group.children[0].add(fingerMark);
const bareSkin = [];
bare.group.traverse((o) => {
  if (
    o.isMesh &&
    o.material.color &&
    o.material.color.getHex() === new THREE.Color(0xf1c09a).getHex()
  )
    if (!bareSkin.includes(o.material)) bareSkin.push(o.material);
});
for (const m of bareSkin) m.emissive = new THREE.Color(0x3fb8ff);

// charge flowing from the field into the finger
const charge = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.022, 1),
  new THREE.MeshBasicMaterial({ color: 0xfff27a, toneMapped: false }),
  26,
);
charge.userData.noAO = true;
charge.frustumCulled = false;
scene.add(charge);

const applyCamera = shotCamera(shots);

// ================================================================ render
function explode(t) {
  const a =
    smooth(ramp(t, T.lass, T.lass + 0.8)) * (1 - smooth(ramp(t, T.zeig - 0.05, T.zeig + 0.35)));
  const c =
    smooth(ramp(t, T.rate, T.rate + 0.6)) * (1 - smooth(ramp(t, T.salzwasser - 0.3, T.salzwasser)));
  return Math.max(a, c);
}
const _tipW = V(0, 0, 0);

function renderAt(t) {
  const ex = explode(t);
  glove.track(t, GLOVE_KEYS);
  bare.track(t, BARE_KEYS);
  wurst.visible = (t >= T.eine1 - 0.02 && t < T.dein2) || (t >= T.wurst2 - 0.08 && t < T.uebrigens);

  // ---- display
  let state = "lock";
  if (t >= TAP_WURST && t < T.zeig) {
    const typed = Math.min(
      MSG.length,
      Math.floor(ramp(t, T.winter + 0.3, T.tippst - 0.3) * MSG.length),
    );
    state = t >= TAP_SEND ? "sent" : "chat";
    if (state === "chat") drawScreen("chat", typed);
  }
  if (t >= TAP_WURST2 && t < T.uebrigens) state = "ok";
  if (ex > 0.25) state = "dim";
  if (state !== "chat") drawScreen(state);
  screenLight.intensity = ex > 0.25 ? 0.25 : 0.7;
  // a tiny wobble of the whole phone on every glove jab
  let jab = 0;
  for (const tg of [...TAPS_GLOVE, TAP_GLOVE2])
    jab = Math.max(jab, Math.exp(-Math.max(0, t - tg) / 0.08) * (t >= tg ? 1 : 0));
  phone.rotation.x = -0.02 * jab;

  // ---- glass + grid + chip (exploded build)
  const gz = PT / 2 + 0.018 + ex * 1.0;
  glass.position.set(0, Y0, gz);
  glassEdges.position.copy(glass.position);
  glassEdgeMat.opacity = 0.9 * ex;
  glassMat.emissiveIntensity = 0.5 * pop(t, T.glas, T.gitter, 0.2) * ex;
  crack.position.set(0, Y0, gz + 0.014);
  crackMat.opacity =
    smooth(ramp(t, T.spinnennetz + 0.1, T.spinnennetz + 0.16)) *
    (1 - ramp(t, T.rate - 0.1, T.rate));
  crack.scale.setScalar(1);

  const gzz = gridZ(ex);
  grid.position.z = gzz;
  grid.visible = ex > 0.15 && t >= T.gitter;
  const build = t < T.zeig; // first time: bars grow on the words; later all there
  for (let j = 0; j < NR; j++) {
    const k = build ? smooth(ramp(t, T.gitter + j * 0.07, T.gitter + j * 0.07 + 0.35)) : 1;
    rows[j].scale.x = Math.max(0.001, k);
  }
  for (let i = 0; i < NC; i++) {
    const k = build ? smooth(ramp(t, T.unsichtbar + i * 0.08, T.unsichtbar + i * 0.08 + 0.4)) : 1;
    cols[i].scale.y = Math.max(0.001, k);
  }
  // row scan: fast in "Rate mal", one by one on "Reihe für Reihe", gentle after
  let scanRow = -1;
  if (t >= T.rate + 0.4 && t < T.mal100) scanRow = Math.floor((t - T.rate) * 38) % NR;
  else if (t >= T.reihe && t < T.kommt) scanRow = NR - 1 - (Math.floor((t - T.reihe) * 12) % NR);
  else if (t >= T.chip1 && t < T.salzwasser)
    scanRow = NR - 1 - (Math.floor((t - T.chip1) * 7) % NR);
  for (let j = 0; j < NR; j++) {
    const hot = j === scanRow;
    rowMats[j].emissiveIntensity = hot ? 4.5 : 0.9;
    rowMats[j].emissive.setHex(hot ? 0xeaffff : 0x3fd8ff);
  }
  // dots + fields at the crossings
  const dotsOn = t >= T.kreuzung1;
  const fieldsOn = t >= T.feld1;
  const steal = smooth(ramp(t, T.klaut, T.ladung + 0.4)); // the touched field shrinks
  const bend = smooth(ramp(t, T.kommt, TAP_FINGER)); // … and bulges to the finger
  for (let j = 0; j < NR; j++)
    for (let i = 0; i < NC; i++) {
      const n = j * NC + i;
      const x = colX(i);
      const y = rowY(j);
      const d = Math.hypot(i - 2.5, j - 5) * 0.035;
      const kd = dotsOn
        ? build
          ? smooth(ramp(t, T.kreuzung1 + d, T.kreuzung1 + d + 0.25))
          : 1
        : 0;
      _m.compose(
        _p.set(x, y, 0.02),
        _q.identity(),
        _s.setScalar(Math.max(0.001, kd * (j === scanRow ? 1.6 : 1))),
      );
      dots.setMatrixAt(n, _m);
      let kf = fieldsOn ? (build ? smooth(ramp(t, T.feld1 + d, T.feld1 + d + 0.3)) : 1) : 0;
      kf *= 1 + 0.08 * Math.sin(t * 5 + n);
      let sz = kf;
      let zoff = 0.03;
      if (i === TOUCH.i && j === TOUCH.j) {
        sz = kf * (1 - 0.65 * steal);
        _s.set(sz, sz, Math.max(0.001, sz * (1 + 2.6 * bend * (1 - steal))));
        zoff = 0.03 + 0.08 * bend * (1 - steal);
      } else _s.setScalar(Math.max(0.001, sz));
      _m.compose(_p.set(x, y, zoff), _q.identity(), _s);
      fields.setMatrixAt(n, _m);
    }
  dots.instanceMatrix.needsUpdate = true;
  fields.instanceMatrix.needsUpdate = true;
  fields.visible = fieldsOn;
  fieldMat.opacity = 0.42 + 0.3 * pop(t, T.feld1, T.zeig, 0.3);

  chip.visible = t >= T.chip1 && ex > 0.05;
  chip.position.z = PT / 2 + 0.01 + ex * 0.22;
  chip.scale.copy(squash(t, T.chip1 + 0.05));
  chip.userData.gold.emissiveIntensity =
    0.2 + 1.2 * pop(t, T.chip1, T.reihe, 0.2) + (scanRow >= 0 ? 0.4 : 0);

  // ---- tap ripple on the taps that work
  let rt = -1;
  let rp = null;
  for (const [tt, p] of [
    [TAP_WURST, [0.06, 1.3, GZ + 0.012]],
    [TAP_SEND, [0.41, 1.28, GZ + 0.012]],
    [T.tipp, [colX(TOUCH.i), rowY(TOUCH.j), gzz + 0.05]],
    [TAP_WURST2, [0.05, 1.5, GZ + 0.012]],
  ])
    if (t >= tt && t - tt < 0.7) {
      rt = tt;
      rp = p;
    }
  ripple.visible = rt >= 0;
  if (rp) {
    const a = t - rt;
    ripple.position.set(...rp);
    ripple.scale.setScalar(1 + a * 7);
    rippleMat.opacity = 1 - a / 0.7;
  }

  // ---- the bare finger: something inside glows, then charge flows into it
  const glow = pop(t, T.es1, T.lass, 0.25) * (0.55 + 0.45 * Math.sin(t * 9));
  for (const m of bareSkin) m.emissiveIntensity = 0.75 * glow;
  bare.group.updateMatrixWorld(true);
  fingerMark.getWorldPosition(_tipW);
  const kc = pop(t, T.klaut, T.tipp + 0.25, 0.2);
  const src = touchAt(ex);
  for (let i = 0; i < 26; i++) {
    const u = (t * 1.6 + i / 26) % 1;
    const wob = Math.sin(u * 9 + i) * 0.025 * (1 - u);
    _p.set(
      lerp(src[0], _tipW.x, u) + wob,
      lerp(src[1], _tipW.y, u) + wob,
      lerp(src[2], _tipW.z, u),
    );
    _m.compose(
      _p,
      _q.identity(),
      _s.setScalar(Math.max(0.001, kc * (0.6 + 0.6 * Math.sin(u * Math.PI)))),
    );
    charge.setMatrixAt(i, _m);
  }
  charge.instanceMatrix.needsUpdate = true;
  charge.visible = kc > 0.001;

  // ---- ✕ when the glove does nothing
  if (t < T.eine1) showNope(pop(t, TAPS_GLOVE[0] + 0.08, T.eine1, 0.25), 0.0, 2.05, 0.35, 0.5);
  else if (t >= TAP_GLOVE2)
    showNope(pop(t, TAP_GLOVE2 + 0.08, T.wurst2, 0.25), 0.0, 2.05, 0.35, 0.5);
  else showNope(0, 0, 0, 0);

  // ---- the fingertip mini-set: salt water inside you
  const kt = pop(t, T.salzwasser - 0.05, T.handschuh2, 0.3);
  tip.visible = kt > 0;
  tip.scale.setScalar(Math.max(0.001, kt));
  const flow = smooth(ramp(t, T.leitet, T.leitet + 0.6));
  for (const o of ions) {
    const drift = flow * (((t * 0.6 + o.ph) % 1) * 0.5);
    o.m.position.set(
      Math.min(0.85, o.x + drift + Math.sin(t * 3 + o.ph) * 0.05),
      o.y + Math.sin(t * 4.2 + o.ph * 2) * 0.04,
      o.z + Math.cos(t * 3.6 + o.ph) * 0.04,
    );
  }
  tip.updateMatrixWorld(true);
  const ks = kt * flow;
  for (let i = 0; i < 22; i++) {
    const u = (t * 2.2 + i / 22) % 1;
    _p.set(1.3 + u * 0.55, Math.sin(u * 20 + i) * 0.05, Math.cos(u * 17 + i) * 0.05).applyMatrix4(
      tip.matrixWorld,
    );
    _m.compose(
      _p,
      _q.identity(),
      _s.setScalar(Math.max(0.001, ks * (0.5 + 0.5 * Math.sin(u * Math.PI)))),
    );
    sparks.setMatrixAt(i, _m);
  }
  sparks.instanceMatrix.needsUpdate = true;
  sparks.visible = ks > 0.001;

  // ---- Übrigens: germs on the display, a few on the toilet seat
  const kg = t >= T.uebrigens;
  germs.visible = kg;
  if (kg) {
    klo.updateMatrixWorld(true);
    germSeeds.forEach(([a, bb, ph, sp], i) => {
      const k = smooth(ramp(t, T.uebrigens + 0.1 + i * 0.025, T.uebrigens + 0.4 + i * 0.025));
      if (i < NG) {
        _p.set(
          (a - 0.5) * (SW - 0.1) + Math.sin(t * sp + ph) * 0.03,
          Y0 + (bb - 0.5) * (SH - 0.1) + Math.cos(t * sp * 0.8 + ph) * 0.03,
          GZ + 0.03,
        );
      } else {
        const ang = a * Math.PI * 2;
        _p.set(Math.cos(ang) * 0.44, 0.97, Math.sin(ang) * 0.55).applyMatrix4(klo.matrixWorld);
      }
      const show = i < NG ? k : k * (t >= T.klobrille ? 1 : 0);
      _q.setFromEuler(new THREE.Euler(t * sp, ph + t, 0));
      const sq = 1 + 0.25 * Math.sin(t * 8 * sp + ph);
      _m.compose(_p, _q, _s.set(show * sq, show / sq, show));
      germs.setMatrixAt(i, _m);
    });
    germs.instanceMatrix.needsUpdate = true;
  }
  klo.visible = t >= T.klobrille - 0.02;
  klo.scale.copy(squash(t, T.klobrille));
  puff("klo", t, T.klobrille + 0.2, KB.x, 0.05, KB.z, 1.1);

  // ---- panel + device readouts
  if (t >= T.mal100 && t < T.chip1)
    showPanel(pop(t, T.mal100, T.chip1), "PRO SEKUNDE", "100+", LED.yellow);
  else showPanel(0);
  const kcount = pop(t, T.rate + 0.5, T.mal100, 0.2);
  if (kcount > 0)
    counter("scans", kcount, {
      label: "Scans",
      value: Math.round(120 * smooth(ramp(t, T.rate + 0.6, T.ueber + 0.1))),
      x: 60,
      y: 1180,
    });

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
