// "Wie erkennt ein Geldautomat Falschgeld?" World, captions, camera, panel,
// arrows and labels live in world.js; this file builds the story: a deposit
// ATM in a snowy village whose glass body shows the note's trip past the
// rollers, the UV lamp, the infrared sensor and the magnetic head into the
// reject box; a test bench with a fake and a real 50 € note (UV glow, IR
// fade), a cassette recorder and a cotton plant next to a giant note.
import {
  THREE,
  ramp,
  lerp,
  smooth,
  easeInOut,
  pop,
  V,
  scene,
  flat,
  M,
  xrayMaterial,
  xrayEdges,
  setXray,
  showNope,
  makeArrowSet,
  animateArrows,
  forceMat,
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
import { createWorld } from "./environments.js";
import {
  T,
  shots,
  LABELS,
  HIGHLIGHTS,
  PY,
  FRONT,
  ZR,
  ZU,
  ZI,
  ZM,
  BIN,
  P,
  K,
  NOTE_PATH,
  DROP,
  XRAY,
} from "./beats.js";

highlights(HIGHLIGHTS);
createWorld({ env: "winter", sky: "mittag" });

Object.assign(M, {
  plinth: flat(0x8d96a8, { roughness: 0.7 }),
  topper: flat(0xffc93c, { roughness: 0.5 }),
  bezel: flat(0x22262f, { roughness: 0.4 }),
  key: flat(0xe9edf3, { roughness: 0.5 }),
  keyGreen: flat(0x3ec46d),
  keyRed: flat(0xe8473b),
  keyYellow: flat(0xffd23f),
  slotGlow: flat(0x1c3a2a, { emissive: 0x3dff7a, emissiveIntensity: 1.2 }),
  rail: flat(0x9aa4b2, { metalness: 0.5, roughness: 0.4 }),
  roller: flat(0x2b2b31, { roughness: 0.7 }),
  rollerMark: flat(0xff7a2f, { emissive: 0xff5a10, emissiveIntensity: 0.4 }),
  housing: flat(0x5b6270, { roughness: 0.5 }),
  uvTube: flat(0x6a3bd6, { emissive: 0x9b4dff, emissiveIntensity: 0 }),
  uvBeam: new THREE.MeshBasicMaterial({
    color: 0xa76bff,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }),
  irBox: flat(0x2a1d22, { roughness: 0.5 }),
  irLed: flat(0x5a1010, { emissive: 0xff2a1a, emissiveIntensity: 0 }),
  irBeam: new THREE.MeshBasicMaterial({
    color: 0xff3a2a,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }),
  head: flat(0x2b2f38, { roughness: 0.45 }),
  coil: new THREE.MeshStandardMaterial({ color: 0xc8743c, metalness: 0.6, roughness: 0.35 }),
  dot: flat(0x7a6420, { emissive: 0xffd23f, emissiveIntensity: 0 }),
  missing: new THREE.MeshBasicMaterial({ color: 0xff3b2b, transparent: true, opacity: 0 }),
  bin: flat(0xe8473b, { roughness: 0.6, emissive: 0xff2a1a, emissiveIntensity: 0 }),
  safe: flat(0x7d8696, { metalness: 0.4, roughness: 0.4 }),
  alarm: flat(0x8a1a12, { emissive: 0xff2a1a, emissiveIntensity: 0 }),
  scan: new THREE.MeshBasicMaterial({
    color: 0x7fe9ff,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }),
  slate: flat(0x2c3140, { roughness: 0.8 }),
  slate2: flat(0x20242f, { roughness: 0.85 }),
  lampBar: flat(0x444a58, { roughness: 0.5 }),
  benchTube: flat(0x6a3bd6, { emissive: 0x9b4dff, emissiveIntensity: 0 }),
  silver: new THREE.MeshStandardMaterial({ color: 0xc7ccd4, metalness: 0.6, roughness: 0.3 }),
  grille: flat(0x1f2228, { roughness: 0.8 }),
  tape: flat(0xf1e4c8),
  reel: flat(0xfbfbf7),
  stem: flat(0x6f8a3a),
  calyx: flat(0x7a4a2a),
  cotton: flat(0xffffff, { roughness: 0.95 }),
});

const clamp = (x) => Math.min(1, Math.max(0, x));
const TINY = V(1e-3, 1e-3, 1e-3);
function box(w, h, d, mat, x, y, z, parent = scene) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
function cyl(r, len, mat, axis = "x", seg = 16) {
  const g = new THREE.CylinderGeometry(r, r, len, seg);
  if (axis === "x") g.rotateZ(Math.PI / 2);
  if (axis === "z") g.rotateX(Math.PI / 2);
  const m = new THREE.Mesh(g, mat);
  m.castShadow = true;
  return m;
}
function at(m, x, y, z) {
  m.position.set(x, y, z);
  return m;
}
function hash(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// ---------------------------------------------------------------- canvas art
const FONT_OK = () => document.fonts.check('800 60px "Montserrat"');
// a toy 50 € note; mode "ir" = what an infrared camera sees (only the right
// part of the motif, the emerald number and the stripe stay)
function drawNote(g, mode) {
  const w = 512;
  const h = 280;
  const ir = mode === "ir";
  g.clearRect(0, 0, w, h);
  if (ir) {
    g.fillStyle = "#f1e9da";
    g.fillRect(0, 0, w, h);
  } else {
    const gr = g.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, "#f9c27d");
    gr.addColorStop(1, "#e8873a");
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    // watermark field
    g.fillStyle = "#fde6c7";
    g.fillRect(0, 0, 112, h);
    g.fillStyle = "rgba(214,140,70,.35)";
    g.font = '800 70px "Montserrat", sans-serif';
    g.fillText("50", 14, 170);
    // EU flag with stars
    g.fillStyle = "#2a4fb8";
    g.fillRect(150, 18, 92, 62);
    g.fillStyle = "#ffd23f";
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      g.beginPath();
      g.arc(196 + Math.cos(a) * 21, 49 + Math.sin(a) * 21, 3.6, 0, Math.PI * 2);
      g.fill();
    }
    // the arch on the left half
    g.fillStyle = "#c9621f";
    g.beginPath();
    g.moveTo(170, 240);
    g.lineTo(170, 150);
    g.arc(225, 150, 55, Math.PI, 0);
    g.lineTo(280, 240);
    g.closePath();
    g.fill();
    g.fillStyle = "#f6b26b";
    g.beginPath();
    g.moveTo(195, 240);
    g.lineTo(195, 155);
    g.arc(225, 155, 30, Math.PI, 0);
    g.lineTo(255, 240);
    g.closePath();
    g.fill();
    g.fillStyle = "#5b2f12";
    g.font = '800 34px "Montserrat", sans-serif';
    g.fillText("EURO", 150, 268);
    // white big value top right
    g.font = '800 96px "Montserrat", sans-serif';
    g.lineWidth = 8;
    g.strokeStyle = "#7a3a12";
    g.strokeText("50", 380, 100);
    g.fillStyle = "#ffffff";
    g.fillText("50", 380, 100);
  }
  // hologram / security stripe (visible in both)
  const sg = g.createLinearGradient(112, 0, 140, h);
  sg.addColorStop(0, "#e4e8ee");
  sg.addColorStop(0.5, "#9ea7b4");
  sg.addColorStop(1, "#e4e8ee");
  g.fillStyle = sg;
  g.fillRect(114, 0, 26, h);
  // the right part of the motif (a window + a bridge): dark in IR
  g.fillStyle = ir ? "#6b5a4a" : "#b4521a";
  g.fillRect(300, 130, 70, 110);
  g.fillStyle = ir ? "#f1e9da" : "#f6b26b";
  g.beginPath();
  g.moveTo(312, 240);
  g.lineTo(312, 165);
  g.arc(335, 165, 23, Math.PI, 0);
  g.lineTo(358, 240);
  g.closePath();
  g.fill();
  g.strokeStyle = ir ? "#6b5a4a" : "#9a4312";
  g.lineWidth = 10;
  g.beginPath();
  g.moveTo(380, 250);
  g.quadraticCurveTo(440, 190, 500, 250);
  g.stroke();
  // emerald number bottom right
  g.font = '800 64px "Montserrat", sans-serif';
  g.fillStyle = ir ? "#3a3a3a" : "#1f8a5a";
  g.fillText("50", 410, 236);
  // frame line
  g.strokeStyle = ir ? "rgba(0,0,0,.08)" : "rgba(120,50,10,.35)";
  g.lineWidth = 6;
  g.strokeRect(3, 3, w - 6, h - 6);
}
function noteTexture(mode) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 280;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const draw = () => {
    drawNote(c.getContext("2d"), mode);
    tex.needsUpdate = true;
  };
  draw();
  return { tex, draw };
}
const printTex = noteTexture("print");
const irTex = noteTexture("ir");

// the ATM screen: 0 checking (blue), 1 counterfeit (red), 2 thanks (green)
const screenCanvas = document.createElement("canvas");
screenCanvas.width = 512;
screenCanvas.height = 320;
const screenTex = new THREE.CanvasTexture(screenCanvas);
screenTex.colorSpace = THREE.SRGBColorSpace;
let screenKey = "";
function drawScreen(state) {
  const key = state + (FONT_OK() ? "f" : "");
  if (key === screenKey) return;
  screenKey = key;
  const g = screenCanvas.getContext("2d");
  const bg = ["#1d5fd6", "#d8322a", "#1f9e57"][state];
  g.fillStyle = bg;
  g.fillRect(0, 0, 512, 320);
  g.fillStyle = "rgba(255,255,255,.12)";
  g.fillRect(0, 0, 512, 70);
  g.fillStyle = "#ffffff";
  g.textAlign = "center";
  g.font = '800 40px "Montserrat", sans-serif';
  g.fillText(["EINZAHLUNG", "ACHTUNG", "EINZAHLUNG"][state], 256, 50);
  g.lineCap = "round";
  g.lineJoin = "round";
  g.strokeStyle = "#ffffff";
  g.lineWidth = 22;
  g.beginPath();
  if (state === 0) {
    g.font = '800 120px "Montserrat", sans-serif';
    g.fillText("€", 256, 205);
    g.fillStyle = "rgba(255,255,255,.3)";
    g.fillRect(96, 250, 320, 22);
    g.fillStyle = "#ffffff";
    g.fillRect(96, 250, 200, 22);
  } else if (state === 1) {
    g.moveTo(206, 110);
    g.lineTo(306, 210);
    g.moveTo(306, 110);
    g.lineTo(206, 210);
    g.stroke();
    g.font = '800 38px "Montserrat", sans-serif';
    g.fillText("FALSCHGELD", 256, 290);
  } else {
    g.moveTo(196, 165);
    g.lineTo(240, 210);
    g.lineTo(320, 115);
    g.stroke();
    g.font = '800 38px "Montserrat", sans-serif';
    g.fillText("DANKE!", 256, 290);
  }
  g.textAlign = "left";
  screenTex.needsUpdate = true;
}
drawScreen(0);

// the "€" sign on the topper
const signCanvas = document.createElement("canvas");
signCanvas.width = 512;
signCanvas.height = 128;
const signTex = new THREE.CanvasTexture(signCanvas);
signTex.colorSpace = THREE.SRGBColorSpace;
function drawSign() {
  const g = signCanvas.getContext("2d");
  g.fillStyle = "#ffc93c";
  g.fillRect(0, 0, 512, 128);
  g.fillStyle = "#1c2a5a";
  g.textAlign = "center";
  g.font = '800 84px "Montserrat", sans-serif';
  g.fillText("€  GELD", 256, 98);
  signTex.needsUpdate = true;
}
drawSign();
let fontsDrawn = FONT_OK();
function redrawFonts() {
  if (fontsDrawn || !FONT_OK()) return;
  fontsDrawn = true;
  printTex.draw();
  irTex.draw();
  drawSign();
  screenKey = "";
}

// ---------------------------------------------------------------- the ATM
const BW = 1.5;
const BH = 2.3;
const BD = 1.3;
const atm = new THREE.Group();
scene.add(atm);
box(1.75, 0.14, 1.55, M.plinth, 0, 0.07, 0, atm);
const shellMat = xrayMaterial(0x2f6fe0);
{
  const geo = new THREE.BoxGeometry(BW, BH, BD);
  const shell = new THREE.Mesh(geo, shellMat);
  shell.position.y = 0.14 + BH / 2;
  shell.castShadow = true;
  atm.add(shell);
  const edges = xrayEdges(geo);
  edges.position.copy(shell.position);
  atm.add(edges);
}
const TOP = 0.14 + BH;
// topper with the sign and the alarm dome
box(BW + 0.1, 0.34, BD + 0.1, M.topper, 0, TOP + 0.17, 0, atm);
{
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(BW - 0.1, 0.28),
    new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.5 }),
  );
  sign.position.set(0, TOP + 0.17, BD / 2 + 0.051);
  atm.add(sign);
}
const dome = new THREE.Mesh(
  new THREE.SphereGeometry(0.17, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2),
  M.alarm,
);
dome.position.set(0, TOP + 0.34, 0.1);
atm.add(dome);
const alarmLight = new THREE.PointLight(0xff2a1a, 0, 8, 1.3);
alarmLight.position.set(0, TOP + 0.7, 0.8);
atm.add(alarmLight);
// front: screen, slot, keypad, card slot
const FZ = FRONT + 0.012;
// the front panel parts are solid: hidden while the body is glass
const front = new THREE.Group();
atm.add(front);
box(0.92, 0.62, 0.05, M.bezel, 0, 1.9, FZ, front);
{
  const scr = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 0.5),
    new THREE.MeshStandardMaterial({
      map: screenTex,
      emissive: 0xffffff,
      emissiveMap: screenTex,
      emissiveIntensity: 0.55,
      roughness: 0.3,
    }),
  );
  scr.position.set(0, 1.9, FZ + 0.03);
  front.add(scr);
}
box(0.86, 0.13, 0.08, M.bezel, 0, PY + 0.1, FZ, front); // slot hood above the note
box(0.86, 0.05, 0.08, M.bezel, 0, PY - 0.06, FZ, front); // lip below
const slotStrip = box(0.78, 0.025, 0.02, M.slotGlow, 0, PY - 0.1, FZ + 0.04, front);
slotStrip.castShadow = false;
{
  const pad = new THREE.Group();
  pad.position.set(-0.15, 0.98, FZ + 0.08);
  pad.rotation.x = -0.5;
  front.add(pad);
  box(0.52, 0.4, 0.06, M.bezel, 0, 0, 0, pad);
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 3; c++)
      box(0.1, 0.06, 0.03, M.key, -0.13 + c * 0.13, 0.13 - r * 0.085, 0.04, pad);
  for (const [i, m] of [M.keyRed, M.keyYellow, M.keyGreen].entries())
    box(0.07, 0.06, 0.03, m, 0.27 + 0.0 * i, 0.13 - i * 0.11, 0.04, pad);
  box(0.24, 0.06, 0.06, M.bezel, 0.48, 0.12, 0.02, pad); // card slot
}

// inside: rails, rollers, UV lamp, IR sensor, magnetic head, reject box, safe
for (const x of [-0.37, 0.37]) box(0.03, 0.04, 1.15, M.rail, x, PY - 0.03, 0.05, atm);
const ROLL_R = 0.065;
const rollers = [1, -1].map((s) => {
  const g = new THREE.Group();
  g.position.set(0, PY + s * (ROLL_R + 0.008), ZR);
  atm.add(g);
  g.add(cyl(ROLL_R, 0.72, M.roller, "x", 8));
  for (const x of [-0.24, 0, 0.24]) box(0.05, 0.03, 0.02, M.rollerMark, x, ROLL_R, 0, g);
  g.userData.s = s;
  return g;
});

const uv = new THREE.Group();
uv.position.set(0, PY + 0.3, ZU);
atm.add(uv);
box(0.76, 0.08, 0.15, M.housing, 0, 0.04, 0, uv);
uv.add(at(cyl(0.032, 0.66, M.uvTube, "x", 12), 0, -0.02, 0));
{
  const g = new THREE.CylinderGeometry(0.05, 0.36, 0.27, 4, 1, true);
  g.rotateY(Math.PI / 4);
  g.scale(1.25, 1, 0.55);
  const beam = new THREE.Mesh(g, M.uvBeam);
  beam.position.y = -0.17;
  uv.add(beam);
}
const uvLight = new THREE.PointLight(0x9b4dff, 0, 2.5, 1.4);
uvLight.position.set(0, PY + 0.15, ZU + 0.05);
atm.add(uvLight);

const irs = new THREE.Group();
irs.position.set(0, PY, ZI);
atm.add(irs);
box(0.72, 0.07, 0.1, M.irBox, 0, 0.28, 0, irs);
box(0.72, 0.07, 0.1, M.irBox, 0, -0.22, 0, irs);
for (let i = 0; i < 5; i++) {
  const x = -0.26 + i * 0.13;
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 6), M.irLed);
  led.position.set(x, 0.24, 0);
  irs.add(led);
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.016, 0.44, 6), M.irBeam);
  b.position.set(x, 0.03, 0);
  irs.add(b);
}

const head = new THREE.Group();
head.position.set(0, PY, ZM);
atm.add(head);
box(0.26, 0.2, 0.15, M.head, 0, 0.22, 0, head);
head.add(at(cyl(0.075, 0.16, M.chrome, "z", 16), 0, 0.1, 0));
for (const y of [0.17, 0.22, 0.27]) {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.015, 6, 20), M.coil);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = y;
  head.add(ring);
}

// reject box (open top, red) and the safe for good notes
const bin = new THREE.Group();
bin.position.set(...BIN);
atm.add(bin);
box(0.74, 0.04, 0.48, M.bin, 0, -0.19, 0, bin);
box(0.74, 0.38, 0.04, M.bin, 0, 0, -0.22, bin);
box(0.74, 0.38, 0.04, M.bin, 0, 0, 0.22, bin);
box(0.04, 0.38, 0.48, M.bin, -0.35, 0, 0, bin);
box(0.04, 0.38, 0.48, M.bin, 0.35, 0, 0, bin);
box(0.74, 0.5, 0.42, M.safe, 0, 0.42, 0.33, atm);
{
  const dial = cyl(0.08, 0.04, M.chrome, "z", 16);
  dial.position.set(0, 0.42, 0.56);
  atm.add(dial);
}

// scan light bar sweeping over the note at "durchleuchtet"
const scan = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.012, 0.035), M.scan);
atm.add(scan);

// the note in the machine (a fake — it ends in the reject box)
const noteTopMat = new THREE.MeshStandardMaterial({
  map: printTex.tex,
  roughness: 0.75,
  emissive: 0x2f7bff,
  emissiveIntensity: 0,
});
const noteEdge = flat(0xf3c890);
const note = new THREE.Group();
atm.add(note);
{
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.006, 0.34), [
    noteEdge,
    noteEdge,
    noteTopMat,
    noteEdge,
    noteEdge,
    noteEdge,
  ]);
  m.castShadow = true;
  note.add(m);
}
// magnetic ink spots: three light up under the head, the fourth is missing
const DOTS = [
  [-0.22, 0.12],
  [-0.07, 0.12],
  [0.08, 0.12],
  [0.23, 0.12],
];
const dots = DOTS.slice(0, 3).map(([x, z]) => {
  const d = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.006, 16), M.dot);
  d.position.set(x, 0.005, z);
  note.add(d);
  return d;
});
const missRing = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.009, 6, 24), M.missing);
missRing.rotation.x = Math.PI / 2;
missRing.position.set(DOTS[3][0], 0.01, DOTS[3][1]);
note.add(missRing);

function noteZ(t) {
  if (t <= NOTE_PATH[0][0]) return NOTE_PATH[0][1];
  for (let i = 1; i < NOTE_PATH.length; i++) {
    const [ta, za] = NOTE_PATH[i - 1];
    const [tb, zb] = NOTE_PATH[i];
    if (t < tb) return lerp(za, zb, easeInOut(ramp(t, ta, tb)));
  }
  return NOTE_PATH[NOTE_PATH.length - 1][1];
}

// ---------------------------------------------------------------- test bench
const bench = new THREE.Group();
bench.position.set(...P);
scene.add(bench);
box(2.7, 0.7, 1.2, M.slate, 0, 0.35, 0, bench);
box(2.7, 1.25, 0.1, M.slate2, 0, 1.3, -0.5, bench);
box(2.6, 0.06, 0.12, M.lampBar, 0, 0.74, 0.12, bench); // ledge the notes stand on
const NW = 1.0;
const NH = 0.55;
function benchNote(x, mat) {
  const g = new THREE.Group();
  g.position.set(x, 0.95, 0);
  g.rotation.x = -0.32;
  bench.add(g);
  const m = new THREE.Mesh(new THREE.BoxGeometry(NW, NH, 0.008), [
    noteEdge,
    noteEdge,
    noteEdge,
    noteEdge,
    mat,
    noteEdge,
  ]);
  m.castShadow = true;
  g.add(m);
  return g;
}
const fakeMat = new THREE.MeshStandardMaterial({
  map: printTex.tex,
  roughness: 0.75,
  emissive: 0x2f7bff,
  emissiveIntensity: 0,
});
const realMat = new THREE.MeshStandardMaterial({ map: printTex.tex, roughness: 0.75 });
benchNote(-0.6, fakeMat);
const realNote = benchNote(0.6, realMat);
// IR view of the real note fades in on top of its print
const irMat = new THREE.MeshStandardMaterial({
  map: irTex.tex,
  roughness: 0.75,
  transparent: true,
  opacity: 0,
  depthWrite: false,
});
{
  const ov = new THREE.Mesh(new THREE.PlaneGeometry(NW, NH), irMat);
  ov.position.z = 0.0055;
  realNote.add(ov);
}
// tiny security fibres in the real note glow under UV
const fibreMats = [0xff4b6b, 0x4bff8a, 0x5ab8ff].map((c) =>
  flat(c, { emissive: c, emissiveIntensity: 0 }),
);
for (let i = 0; i < 18; i++) {
  const f = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.008, 0.002), fibreMats[i % 3]);
  f.position.set((hash(i * 3.3) - 0.5) * 0.85, (hash(i * 5.1) - 0.5) * 0.45, 0.006);
  f.rotation.z = hash(i * 7.7) * Math.PI;
  realNote.add(f);
}
const benchLamp = new THREE.Group();
benchLamp.position.set(0, 1.62, 0.38);
bench.add(benchLamp);
box(2.5, 0.1, 0.16, M.lampBar, 0, 0.06, 0, benchLamp);
benchLamp.add(at(cyl(0.045, 2.3, M.benchTube, "x", 12), 0, -0.02, 0));
for (const x of [-1.28, 1.28]) box(0.06, 0.95, 0.06, M.lampBar, x, -0.45, -0.06, benchLamp);
const benchLight = new THREE.PointLight(0x9b4dff, 0, 4.5, 1.2);
benchLight.position.set(0, 1.45, 0.9);
bench.add(benchLight);

// ---------------------------------------------------------------- cassette recorder
const rec = new THREE.Group();
rec.position.set(...K);
scene.add(rec);
box(1.7, 0.85, 0.45, M.silver, 0, 0.45, 0, rec);
{
  const spk = cyl(0.29, 0.04, M.grille, "z", 24);
  spk.position.set(-0.45, 0.45, 0.235);
  rec.add(spk);
  for (let i = 0; i < 4; i++) {
    const r = new THREE.Mesh(new THREE.TorusGeometry(0.07 + i * 0.055, 0.008, 4, 28), M.silver);
    r.position.set(-0.45, 0.45, 0.258);
    rec.add(r);
  }
  box(0.72, 0.44, 0.03, M.grille, 0.38, 0.47, 0.235, rec); // cassette window
  box(0.6, 0.32, 0.02, M.tape, 0.38, 0.47, 0.255, rec);
  box(0.34, 0.1, 0.01, flat(0x3a2a24), 0.38, 0.47, 0.266, rec); // tape window
  const cols = [0xe8473b, 0x2e2a2c, 0x2e2a2c, 0x3ec46d, 0x2e2a2c, 0xffd23f];
  cols.forEach((c, i) => box(0.12, 0.06, 0.14, flat(c), 0.08 + i * 0.13, 0.9, 0.05, rec));
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.035, 6, 20, Math.PI), M.grille);
  handle.position.set(-0.2, 0.88, -0.08);
  rec.add(handle);
}
const reels = [0.27, 0.49].map((x) => {
  const g = new THREE.Group();
  g.position.set(x, 0.47, 0.27);
  rec.add(g);
  g.add(cyl(0.055, 0.012, M.reel, "z", 16));
  for (let i = 0; i < 3; i++) {
    const s = box(0.012, 0.09, 0.006, M.grille, 0, 0, 0.008, g);
    s.rotation.z = (i * Math.PI) / 3;
    s.castShadow = false;
  }
  return g;
});

// ---------------------------------------------------------------- cotton + giant note
const cot = new THREE.Group();
cot.position.set(...K);
scene.add(cot);
const plant = new THREE.Group();
plant.position.set(0.75, 0, 0);
cot.add(plant);
{
  const branch = (pts) => {
    const m = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => V(...p))), 10, 0.03, 6),
      M.stem,
    );
    m.castShadow = true;
    plant.add(m);
  };
  branch([
    [0, 0, 0],
    [0.02, 0.6, 0],
    [-0.02, 1.2, 0],
    [0, 1.55, 0],
  ]);
  branch([
    [0.01, 0.55, 0],
    [0.25, 0.85, 0.05],
    [0.38, 1.05, 0.1],
  ]);
  branch([
    [0, 0.75, 0],
    [-0.25, 1.0, 0.05],
    [-0.36, 1.2, 0.08],
  ]);
  branch([
    [0, 0.35, 0],
    [0.22, 0.5, -0.05],
    [0.3, 0.62, -0.1],
  ]);
  const bolls = [
    [0, 1.6, 0],
    [0.4, 1.1, 0.1],
    [-0.38, 1.25, 0.08],
    [0.32, 0.66, -0.1],
    [-0.15, 0.9, 0.15],
  ];
  bolls.forEach(([x, y, z], i) => {
    const b = new THREE.Group();
    b.position.set(x, y, z);
    plant.add(b);
    const cal = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.12, 5), M.calyx);
    cal.rotation.x = Math.PI;
    cal.position.y = -0.05;
    b.add(cal);
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + i;
      const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 1), M.cotton);
      c.position.set(Math.cos(a) * 0.06, 0.06 + (k % 2) * 0.03, Math.sin(a) * 0.06);
      c.castShadow = true;
      b.add(c);
    }
  });
}
const bigNote = new THREE.Group();
bigNote.position.set(-0.55, 0.62, 0.1);
bigNote.rotation.y = 0.25;
cot.add(bigNote);
{
  const m = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.55, 0.01), [
    noteEdge,
    noteEdge,
    noteEdge,
    noteEdge,
    realMat,
    noteEdge,
  ]);
  m.castShadow = true;
  bigNote.add(m);
  box(0.06, 0.36, 0.06, M.lampBar, 0, -0.45, -0.02, bigNote); // stand
}
const cottonArrow = makeArrowSet([[V(0.45, 1.0, 0.1), V(-0.05, 0.8, 0.2)]], {
  parent: cot,
  mat: forceMat,
  amp: 0,
  r: 0.03,
});

const applyCamera = shotCamera(shots);

function setPop(group, t, a, b) {
  const k = pop(t, a, b);
  group.visible = k > 0.001;
  group.scale.copy(t >= a ? squash(t, a).multiplyScalar(k) : TINY);
}

// ---------------------------------------------------------------- render
function renderAt(t) {
  redrawFonts();
  const blink2 = (a) => (Math.floor((t - a) / 0.2) % 2 === 0 ? 1 : 0);

  // ---- x-ray body
  const xr = smooth(ramp(t, XRAY[0], XRAY[1])) * (1 - smooth(ramp(t, XRAY[2], XRAY[3])));
  setXray([shellMat], xr);
  front.visible = xr < 0.5;

  // ---- the note's trip
  const z = noteZ(t);
  const drop = ramp(t, ...DROP);
  if (drop > 0) {
    const f = drop * drop;
    note.position.set(0, lerp(PY, BIN[1] - 0.15, f), lerp(ZM, BIN[2], drop));
    note.rotation.x = lerp(0, -0.35, smooth(drop));
  } else {
    note.position.set(0, PY, z);
    note.rotation.x = 0;
  }
  const travel = NOTE_PATH[0][1] - z;
  for (const r of rollers) r.rotation.x = r.userData.s * (travel / ROLL_R);

  // ---- parts pop in on their words (hidden inside the solid body before)
  rollers.forEach((r, i) => {
    r.visible = t >= T.rollen;
    r.scale.copy(squash(t, T.rollen + i * 0.12, 0.6));
  });
  uv.visible = t >= T.uv;
  uv.scale.copy(squash(t, T.uv, 0.6));
  irs.visible = t >= T.sensor - 0.1;
  irs.scale.copy(squash(t, T.sensor - 0.1, 0.6));
  head.visible = t >= T.magnet;
  // the magnet close-ups look past the lamp and the sensor: keep them out of view
  if (t >= W2 && t < T.zack) uv.visible = irs.visible = false;
  head.scale.copy(squash(t, T.magnet, 0.6));

  // ---- scan bar at "durchleuchtet"
  const sk = pop(t, T.durch, T.zwei, 0.2);
  scan.visible = sk > 0.01;
  scan.position.set(0, PY + 0.03, lerp(0.6, -0.4, ((t - T.durch) * 0.8) % 1));
  M.scan.opacity = 0.9 * sk;
  M.slotGlow.emissiveIntensity = 0.9 + 0.6 * Math.sin(t * 10);

  // ---- UV lamp in the machine: the fake note glows blue under it
  const uvOn = smooth(ramp(t, T.uv + 0.1, T.uv + 0.4)) * (1 - smooth(ramp(t, T.ir, T.ir + 0.3)));
  M.uvTube.emissiveIntensity = 2.2 * uvOn;
  M.uvBeam.opacity = 0.35 * uvOn * (0.85 + 0.15 * Math.sin(t * 23));
  uvLight.intensity = 3 * uvOn;
  const nGlow = uvOn * clamp((ZU + 0.25 - z) / 0.2);
  noteTopMat.emissiveIntensity = 1.6 * nGlow;
  noteTopMat.color.setScalar(1 - 0.75 * nGlow);

  // ---- IR sensor + magnetic head
  const irOn =
    smooth(ramp(t, T.sensor, T.sensor + 0.3)) * (1 - ramp(t, T.dann + 0.3, T.dann + 0.6));
  M.irLed.emissiveIntensity = 2.5 * irOn;
  M.irBeam.opacity = 0.75 * irOn * (0.8 + 0.2 * Math.sin(t * 31));
  dots.forEach((d, i) => {
    const at = T.tinte + 0.1 + i * 0.35;
    d.visible = t >= at - 0.05;
    d.material.emissiveIntensity = 1.8;
    d.scale.copy(squash(t, at, 0.5));
  });
  M.missing.opacity =
    t >= T.fehlt && t < T.zack + 0.2 ? 0.55 + 0.45 * Math.sin((t - T.fehlt) * 12) : 0;
  missRing.scale.setScalar(1 + 0.25 * Math.sin((t - T.fehlt) * 12));
  head.position.y = PY + (t >= T.tinte && t < T.zack ? 0.006 * Math.sin(t * 70) : 0);

  // ---- ZACK: alarm, screen red, box glows; outro: green
  const alarm = t >= T.zack && t < T.schau ? 1 : 0;
  const bl = alarm * blink2(T.zack);
  M.alarm.emissiveIntensity = 0.2 + 3 * bl;
  alarmLight.intensity = 10 * bl;
  M.bin.emissiveIntensity = alarm * (0.4 + 0.6 * bl);
  drawScreen(t >= T.schau ? 2 : t >= T.zack ? 1 : 0);
  if (t >= T.zack && t < T.schau) M.slotGlow.emissive.setHex(0xff2a1a);
  else M.slotGlow.emissive.setHex(0x3dff7a);

  // ---- test bench: UV (fake glows, real stays dark, then a better fake) and IR
  setPop(bench, t, T.billiges - 0.25, T.jetzt + 0.1);
  if (t >= T.ir - 0.2) setPop(bench, t, T.ir - 0.2, T.sensor - 0.1);
  const bUv =
    smooth(ramp(t, T.billiges, T.billiges + 0.3)) * (1 - ramp(t, T.aber + 0.4, T.aber + 0.6));
  const bIr = smooth(ramp(t, T.ir - 0.1, T.ir + 0.2));
  const lampCol = bIr > 0 ? 0xff2a1a : 0x9b4dff;
  M.benchTube.emissive.setHex(lampCol);
  M.benchTube.emissiveIntensity = 2.4 * Math.max(bUv, bIr);
  benchLight.color.setHex(lampCol);
  benchLight.intensity = 9 * Math.max(bUv, bIr);
  // fake glows on "blau", fades when the forger gets smarter
  const fGlow =
    smooth(ramp(t, T.blau - 0.15, T.blau + 0.1)) *
    (1 - smooth(ramp(t, T.aber + 0.2, T.aber + 0.7)));
  fakeMat.emissiveIntensity = 1.6 * fGlow;
  fakeMat.color.setScalar(1 - 0.75 * fGlow);
  fibreMats.forEach((m) => (m.emissiveIntensity = 2.2 * bUv));
  // IR: half the colour of the real note disappears
  // (slow motion: scene time only reaches ~verschwindet + 1.1 before the cut)
  irMat.opacity = smooth(ramp(t, T.verschwindet + 0.05, T.verschwindet + 0.8));
  showNope(pop(t, T.aber + 0.6, T.jetzt), P[0], P[1] + 1.95, P[2] + 0.4, 0.6);

  // ---- cassette recorder
  setPop(rec, t, T.kassette - 0.05, W2);
  for (const [i, r] of reels.entries()) r.rotation.z = -(t - T.kassette) * (5 + i);
  puff("rec", t, T.kassette + 0.1, K[0], 0.05, K[2], 1.3);

  // ---- cotton + giant note
  setPop(cot, t, T.uebrigens + 0.05, T.hattest);
  animateArrows(cottonArrow, t, pop(t, T.baumwolle + 0.1, T.hattest));
  puff("cot", t, T.uebrigens + 0.2, K[0], 0.05, K[2], 1.5);

  // ---- LED panel (none on the cover)
  if (window.HF_COVER_T != null) {
    showPanel(0);
  } else if (t >= T.blau && t < T.echtes) {
    showPanel(pop(t, T.blau, T.echtes), "UV · FALSCHER SCHEIN", "BLAU", LED.blue);
  } else if (t >= T.dunkel - 0.3 && t < T.aber) {
    showPanel(pop(t, T.dunkel - 0.3, T.aber), "UV · ECHTER SCHEIN", "ECHT", LED.green);
  } else if (t >= T.verschwindet + 0.6 && t < T.beim2) {
    showPanel(pop(t, T.verschwindet + 0.6, T.beim2), "INFRAROT · ECHT", "HALB", LED.yellow);
  } else if (t >= T.alles - 0.2 && t < T.sensor - 0.2) {
    showPanel(pop(t, T.alles - 0.2, T.sensor - 0.2), "INFRAROT · FALSCH", "VOLL", LED.red);
  } else if (t >= T.fehlt + 0.2 && t < T.zack) {
    showPanel(pop(t, T.fehlt + 0.2, T.zack), "MAGNET-TINTE", "3/4", LED.red);
  } else if (t >= T.behaelt && t < W3) {
    showPanel(pop(t, T.behaelt, W3), "FALSCHGELD", "STOP", LED.red);
  } else {
    showPanel(0);
  }

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
// "Er" #2 / #3 (shot cuts), looked up once
const W2 = shots.find((s) => s.at > T.kassette).at;
const W3 = shots.find((s) => s.at > T.behaelt).at;

start(renderAt);
