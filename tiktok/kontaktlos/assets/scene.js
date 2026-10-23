// "Woher bekommt eine Bankkarte ohne Akku ihren Strom?" World, captions,
// camera, panel, arrows and labels live in world.js; this file builds the
// story: a payment terminal on a post in an evening city square and a giant
// bank card. The card pays in the hook, then floats alone: the chip (next to
// a rice grain), the glass card with the copper antenna winding round it,
// the terminal's pulsing magnetic field, current racing through the wire on
// "zack", the chip waking and answering, the green screen, and the field
// dying out when the card is pulled back. A phone joins for the CTA.
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
import { createWorld } from "./environments.js";
import {
  T,
  shots,
  LABELS,
  HIGHLIGHTS,
  TX,
  TY,
  TZ,
  TD,
  FACE,
  SCREEN_Y,
  READER_Y,
  TAP,
  HOME,
  FAR,
  CHIP,
  HOOK_TAP,
  TRIP,
  XRAY,
} from "./beats.js";

highlights(HIGHLIGHTS);
createWorld({ env: "stadt", sky: "abend" });

Object.assign(M, {
  termBody: flat(0x2b303b, { roughness: 0.45 }),
  termTop: flat(0x3a4150, { roughness: 0.4 }),
  key: flat(0xe9edf3, { roughness: 0.5 }),
  keyGreen: flat(0x3ec46d),
  keyRed: flat(0xe8473b),
  keyYellow: flat(0xffd23f),
  post: flat(0x8d96a8, { metalness: 0.4, roughness: 0.45 }),
  coilT: flat(0x2a6f8a, { emissive: 0x4fd8ff, emissiveIntensity: 0 }),
  gold: new THREE.MeshStandardMaterial({
    color: 0xffc94a,
    metalness: 0.2,
    roughness: 0.35,
    emissive: 0x3dff7a,
    emissiveIntensity: 0,
  }),
  wire: new THREE.MeshStandardMaterial({
    color: 0xd27a3c,
    metalness: 0.55,
    roughness: 0.35,
    emissive: 0xffb43a,
    emissiveIntensity: 0,
  }),
  bead: new THREE.MeshBasicMaterial({ color: 0xfff1a0 }),
  rice: flat(0xfbf7ec, { roughness: 0.6 }),
  battery: flat(0xf1f3f6, { roughness: 0.5 }),
  batteryLow: flat(0xe8473b, { emissive: 0xff2a1a, emissiveIntensity: 0.5 }),
  batteryCap: flat(0x9aa4b2, { metalness: 0.5, roughness: 0.4 }),
  phone: flat(0x1c1f26, { roughness: 0.35 }),
});

const clamp = (x) => Math.min(1, Math.max(0, x));
function box(w, h, d, mat, x, y, z, parent = scene) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
// rounded slab centred on its origin, front face at +d/2
function slab(w, h, d, r, mat, parent) {
  const g = new THREE.ExtrudeGeometry(roundedRect(w, h, r), {
    depth: d,
    bevelEnabled: false,
    curveSegments: 6,
  });
  g.translate(0, -h / 2, -d / 2);
  const m = new THREE.Mesh(g, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
function hash(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
const FONT_OK = () => document.fonts.check('800 60px "Montserrat"');
function canvasTex(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return { c, g: c.getContext("2d"), tex };
}
// the contactless symbol: three arcs opening to the right
function waves(g, x, y, s, color, lw) {
  g.strokeStyle = color;
  g.lineWidth = lw;
  g.lineCap = "round";
  for (let i = 0; i < 4; i++) {
    g.beginPath();
    g.arc(x - s * 0.9, y, s * (0.35 + i * 0.32), -0.75, 0.75);
    g.stroke();
  }
}

// ---------------------------------------------------------------- canvas art
// card print: blue gradient, bank name, contactless sign, number, name
const cardArt = canvasTex(1024, 644);
function drawCard() {
  const { g } = cardArt;
  const gr = g.createLinearGradient(0, 0, 1024, 644);
  gr.addColorStop(0, "#2b6cff");
  gr.addColorStop(0.55, "#1c3fc4");
  gr.addColorStop(1, "#14287e");
  g.fillStyle = gr;
  g.fillRect(0, 0, 1024, 644);
  // soft swoosh
  g.fillStyle = "rgba(255,255,255,.09)";
  g.beginPath();
  g.ellipse(820, 120, 420, 260, -0.4, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#ffffff";
  g.font = '800 64px "Montserrat", sans-serif';
  g.fillText("MEINE BANK", 64, 104);
  waves(g, 900, 300, 70, "#ffffff", 14);
  g.font = '800 58px "Montserrat", sans-serif';
  g.fillStyle = "rgba(255,255,255,.92)";
  g.fillText("••••  ••••  ••••  4721", 64, 470);
  g.font = '800 38px "Montserrat", sans-serif';
  g.fillStyle = "rgba(255,255,255,.75)";
  g.fillText("MAX MUSTER", 64, 570);
  g.fillText("12/29", 760, 570);
  // two overlapping circles (generic scheme logo)
  g.fillStyle = "#ff5f3a";
  g.beginPath();
  g.arc(830, 470, 52, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "rgba(255,200,60,.9)";
  g.beginPath();
  g.arc(895, 470, 52, 0, Math.PI * 2);
  g.fill();
  cardArt.tex.needsUpdate = true;
}
// terminal screen: 0 "Karte auflegen" (blue), 1 paid (green)
const screenArt = canvasTex(512, 320);
let screenKey = "";
function drawScreen(state) {
  const key = state + (FONT_OK() ? "f" : "");
  if (key === screenKey) return;
  screenKey = key;
  const { g } = screenArt;
  g.fillStyle = state ? "#1f9e57" : "#1d5fd6";
  g.fillRect(0, 0, 512, 320);
  g.fillStyle = "rgba(255,255,255,.12)";
  g.fillRect(0, 0, 512, 64);
  g.fillStyle = "#ffffff";
  g.textAlign = "center";
  g.font = '800 38px "Montserrat", sans-serif';
  g.fillText("12,90 €", 256, 46);
  if (state === 0) {
    waves(g, 286, 170, 62, "#ffffff", 13);
    g.font = '800 36px "Montserrat", sans-serif';
    g.fillText("KARTE AUFLEGEN", 256, 292);
  } else {
    g.strokeStyle = "#ffffff";
    g.lineWidth = 24;
    g.lineCap = "round";
    g.lineJoin = "round";
    g.beginPath();
    g.moveTo(190, 168);
    g.lineTo(236, 214);
    g.lineTo(326, 112);
    g.stroke();
    g.font = '800 40px "Montserrat", sans-serif';
    g.fillText("BEZAHLT", 256, 292);
  }
  g.textAlign = "left";
  screenArt.tex.needsUpdate = true;
}
// the reader zone on the terminal top: white contactless symbol
const readerArt = canvasTex(256, 256);
function drawReader() {
  const { g } = readerArt;
  g.clearRect(0, 0, 256, 256);
  waves(g, 150, 128, 56, "#ffffff", 14);
  readerArt.tex.needsUpdate = true;
}
// phone screen: wallet with a card
const phoneArt = canvasTex(256, 512);
function drawPhone() {
  const { g } = phoneArt;
  const gr = g.createLinearGradient(0, 0, 0, 512);
  gr.addColorStop(0, "#26304a");
  gr.addColorStop(1, "#111522");
  g.fillStyle = gr;
  g.fillRect(0, 0, 256, 512);
  g.fillStyle = "#2b6cff";
  g.beginPath();
  g.roundRect(28, 120, 200, 126, 16);
  g.fill();
  g.fillStyle = "#e5b64a";
  g.fillRect(52, 164, 34, 26);
  waves(g, 150, 380, 42, "#ffffff", 10);
  phoneArt.tex.needsUpdate = true;
}
drawCard();
drawScreen(0);
drawReader();
drawPhone();
let fontsDrawn = FONT_OK();
function redrawFonts() {
  if (fontsDrawn || !FONT_OK()) return;
  fontsDrawn = true;
  drawCard();
  screenKey = "";
}

// ---------------------------------------------------------------- terminal
const term = new THREE.Group();
term.position.set(TX, 0, TZ);
scene.add(term);
{
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.4, 0.08, 20), M.post);
  base.position.y = 0.04;
  base.castShadow = true;
  base.receiveShadow = true;
  term.add(base);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 1.0, 14), M.post);
  post.position.y = 0.55;
  post.castShadow = true;
  term.add(post);
  const neck = box(0.4, 0.12, 0.22, M.post, 0, 1.0, 0, term);
  neck.castShadow = true;
  const body = slab(1.0, 1.6, TD, 0.12, M.termBody, term);
  body.position.y = TY;
  // lighter top cap around the reader zone
  const cap = slab(0.92, 0.42, 0.02, 0.1, M.termTop, term);
  cap.position.set(0, READER_Y, TD / 2 + 0.01);
  const reader = new THREE.Mesh(
    new THREE.PlaneGeometry(0.34, 0.34),
    new THREE.MeshBasicMaterial({ map: readerArt.tex, transparent: true, depthWrite: false }),
  );
  reader.position.set(0, READER_Y, TD / 2 + 0.022);
  term.add(reader);
  // screen bezel + screen
  box(0.84, 0.56, 0.03, flat(0x14161c), 0, SCREEN_Y, TD / 2 + 0.005, term);
  const scr = new THREE.Mesh(
    new THREE.PlaneGeometry(0.78, 0.49),
    new THREE.MeshStandardMaterial({
      map: screenArt.tex,
      emissive: 0xffffff,
      emissiveMap: screenArt.tex,
      emissiveIntensity: 0.6,
      roughness: 0.3,
    }),
  );
  scr.position.set(0, SCREEN_Y, TD / 2 + 0.022);
  term.add(scr);
  // keypad 3 × 4 + the three coloured keys
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 3; c++)
      box(0.2, 0.09, 0.04, M.key, (c - 1) * 0.25, TY - 0.3 - r * 0.12, TD / 2 + 0.01, term);
  box(0.2, 0.09, 0.04, M.keyRed, -0.25, TY - 0.78 + 0.02, TD / 2 + 0.01, term);
  box(0.2, 0.09, 0.04, M.keyYellow, 0, TY - 0.78 + 0.02, TD / 2 + 0.01, term);
  box(0.2, 0.09, 0.04, M.keyGreen, 0.25, TY - 0.78 + 0.02, TD / 2 + 0.01, term);
}
// the terminal's coil: a glowing ring around the reader zone
const tCoil = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.014, 8, 48), M.coilT);
tCoil.position.set(0, READER_Y, TD / 2 + 0.03);
term.add(tCoil);
const tGlow = new THREE.PointLight(0x4fd8ff, 0, 3, 1.5);
tGlow.position.set(TX, READER_Y, FACE + 0.3);
scene.add(tGlow);
const screenGlow = new THREE.PointLight(0x3dff7a, 0, 3, 1.5);
screenGlow.position.set(TX, SCREEN_Y, FACE + 0.4);
scene.add(screenGlow);

// field rings: cyan from the terminal outwards; answer rings: yellow from the card
const ringGeo = new THREE.TorusGeometry(1, 0.014, 6, 64);
function ringSet(n, color) {
  const list = [];
  for (let i = 0; i < n; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const m = new THREE.Mesh(ringGeo, mat);
    m.userData.noAO = true;
    m.visible = false;
    scene.add(m);
    list.push(m);
  }
  return list;
}
const fieldRings = ringSet(6, 0x5fe0ff);
const answerRings = ringSet(4, 0xffd23f);

// ---------------------------------------------------------------- the card
const CW = 1.4;
const CH = 0.88;
const CD = 0.04;
const card = new THREE.Group();
scene.add(card);
const cardMat = xrayMaterial(0x1f4fd0);
{
  const shell = slab(CW, CH, CD, 0.07, cardMat, card);
  const edges = xrayEdges(shell.geometry);
  card.add(edges);
}
const printMat = new THREE.MeshStandardMaterial({
  map: cardArt.tex,
  roughness: 0.35,
  transparent: true,
  depthWrite: true,
});
{
  const g = new THREE.ShapeGeometry(roundedRect(CW - 0.004, CH - 0.004, 0.068), 6);
  g.translate(0, -(CH - 0.004) / 2, 0);
  // planar UVs from the shape's bounds
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / CW + 0.5, pos.getY(i) / CH + 0.5);
  const print = new THREE.Mesh(g, printMat);
  print.position.z = CD / 2 + 0.002;
  card.add(print);
}
// chip contact plate (gold) — the tiny chip sits under it
box(0.2, 0.155, 0.012, M.gold, CHIP[0], CHIP[1], CD / 2 + 0.008, card);
{
  const lineMat = flat(0x9c7424, { metalness: 0.5, roughness: 0.4 });
  box(0.2, 0.008, 0.004, lineMat, CHIP[0], CHIP[1], CD / 2 + 0.015, card);
  box(0.008, 0.155, 0.004, lineMat, CHIP[0] - 0.035, CHIP[1], CD / 2 + 0.015, card);
  box(0.008, 0.155, 0.004, lineMat, CHIP[0] + 0.035, CHIP[1], CD / 2 + 0.015, card);
}
const chipGlow = new THREE.PointLight(0x3dff7a, 0, 1.5, 1.5);
chipGlow.position.set(CHIP[0], CHIP[1], 0.2);
card.add(chipGlow);
// rice grain next to the chip
const rice = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), M.rice);
rice.castShadow = true;
const riceBase = V(0.065, 0.026, 0.026);
rice.position.set(CHIP[0] + 0.2, CHIP[1] - 0.06, CD / 2 + 0.05);
rice.rotation.z = 0.35;
card.add(rice);

// antenna: four windings round the card edge, both ends run to the chip
const TURNS = 4;
const antennaPts = [];
{
  const N = 720;
  const perim = (k, inset) => {
    // point at fraction k on a rounded rectangle inset from the card edge
    const w = CW / 2 - inset;
    const h = CH / 2 - inset;
    const r = 0.05;
    const L = 2 * (2 * (w - r) + 2 * (h - r)) + 2 * Math.PI * r;
    let s = k * L;
    const seg = [
      [2 * (w - r), (u) => V(-w + r + u, -h, 0)],
      [
        (Math.PI / 2) * r,
        (u) => {
          const a = -Math.PI / 2 + u / r;
          return V(w - r + Math.cos(a) * r, -h + r + Math.sin(a) * r, 0);
        },
      ],
      [2 * (h - r), (u) => V(w, -h + r + u, 0)],
      [
        (Math.PI / 2) * r,
        (u) => {
          const a = u / r;
          return V(w - r + Math.cos(a) * r, h - r + Math.sin(a) * r, 0);
        },
      ],
      [2 * (w - r), (u) => V(w - r - u, h, 0)],
      [
        (Math.PI / 2) * r,
        (u) => {
          const a = Math.PI / 2 + u / r;
          return V(-w + r + Math.cos(a) * r, h - r + Math.sin(a) * r, 0);
        },
      ],
      [2 * (h - r), (u) => V(-w, h - r - u, 0)],
      [
        (Math.PI / 2) * r,
        (u) => {
          const a = Math.PI + u / r;
          return V(-w + r + Math.cos(a) * r, -h + r + Math.sin(a) * r, 0);
        },
      ],
    ];
    for (const [len, f] of seg) {
      if (s <= len) return f(s);
      s -= len;
    }
    return seg[0][1](0);
  };
  antennaPts.push(V(CHIP[0] + 0.05, CHIP[1] - 0.05, 0));
  antennaPts.push(V(CHIP[0] + 0.05, -CH / 2 + 0.07, 0));
  for (let i = 0; i <= N; i++) {
    const k = i / N;
    // start at the bottom edge near the chip, spiral inwards
    antennaPts.push(perim((k * TURNS + 0.12) % 1, 0.07 + k * 0.1));
  }
  antennaPts.push(V(CHIP[0] - 0.05, CHIP[1] - 0.05, 0));
}
const antennaCurve = new THREE.CatmullRomCurve3(antennaPts, false, "centripetal");
const ASEG = 900;
const ARAD = 6;
const antennaGeo = new THREE.TubeGeometry(antennaCurve, ASEG, 0.011, ARAD, false);
const antenna = new THREE.Mesh(antennaGeo, M.wire);
antenna.userData.noAO = true;
card.add(antenna);
// current beads racing along the wire
const NB = 46;
const beads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.015, 8, 6), M.bead, NB);
beads.userData.noAO = true;
beads.frustumCulled = false;
card.add(beads);
const dummy = new THREE.Object3D();

// ---------------------------------------------------------------- hook battery
const battery = new THREE.Group();
scene.add(battery);
battery.position.set(TAP[0] + 0.98, TAP[1] - 0.1, TAP[2] + 0.1);
{
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.42, 20), M.battery);
  body.castShadow = true;
  battery.add(body);
  const low = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.07, 20), M.batteryLow);
  low.position.y = -0.17;
  battery.add(low);
  const nub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 14), M.batteryCap);
  nub.position.y = 0.235;
  battery.add(nub);
}

// ---------------------------------------------------------------- CTA phone
const phone = new THREE.Group();
phone.position.set(HOME[0] + 1.2, HOME[1] - 0.05, HOME[2]);
scene.add(phone);
{
  slab(0.62, 1.24, 0.07, 0.1, M.phone, phone);
  const scr = new THREE.Mesh(
    new THREE.PlaneGeometry(0.55, 1.12),
    new THREE.MeshStandardMaterial({
      map: phoneArt.tex,
      emissive: 0xffffff,
      emissiveMap: phoneArt.tex,
      emissiveIntensity: 0.55,
      roughness: 0.3,
    }),
  );
  scr.position.z = 0.037;
  phone.add(scr);
}

// ---------------------------------------------------------------- card pose
const vTap = V(...TAP);
const vHome = V(...HOME);
const vFar = V(...FAR);
const vHook0 = V(TAP[0] + 1.9, TAP[1] + 0.9, TAP[2] + 2.2);
const SPIN_END = T.plastik + (T.rund - T.plastik) * 0.35; // slowmo: scene time runs at 0.35×
const tmp = V(0, 0, 0);
function arc(a, b, k, lift) {
  tmp.copy(a).lerp(b, k);
  tmp.y += Math.sin(Math.PI * k) * lift;
  return tmp;
}
function cardPose(t) {
  let ry = 0;
  let rx = 0;
  let rz = 0;
  if (t < TRIP.leave[0]) {
    // hook: swoop in from the upper right, tap, tiny settle
    const k = easeInOut(ramp(t, -0.75, HOOK_TAP));
    card.position.copy(arc(vHook0, vTap, k, 0.25));
    ry = lerp(-1.0, 0, k);
    rx = lerp(0.5, 0, k);
    rz = lerp(0.35, 0, k);
  } else if (t < TRIP.pay[0]) {
    // to its home spot, then floating there
    const k = easeInOut(ramp(t, TRIP.leave[0], TRIP.leave[1]));
    card.position.copy(arc(vTap, vHome, k, 0.5));
    rz = Math.sin(Math.PI * k) * 0.3;
    const float = ramp(t, TRIP.leave[1], TRIP.leave[1] + 0.6);
    card.position.y += Math.sin(t * 1.6) * 0.03 * float;
    ry = Math.sin(t * 0.7) * 0.1 * float;
    // the glass card spins once in slow motion on "Plastik"
    ry += Math.PI * 2 * easeInOut(ramp(t, T.plastik, SPIN_END));
  } else if (t < TRIP.back[0]) {
    const k = easeInOut(ramp(t, TRIP.pay[0], TRIP.pay[1]));
    card.position.copy(arc(vHome, vTap, k, 0.35));
    rz = -Math.sin(Math.PI * k) * 0.25;
    // the hit: a tiny bounce
    card.position.z += Math.sin(clamp((t - TRIP.pay[1]) / 0.25) * Math.PI) * 0.03;
  } else if (t < TRIP.home2[0]) {
    const k = easeInOut(ramp(t, TRIP.back[0], TRIP.back[1]));
    card.position.copy(vTap).lerp(vFar, k);
    ry = -0.15 * k;
  } else {
    const k = easeInOut(ramp(t, TRIP.home2[0], TRIP.home2[1]));
    card.position.copy(arc(vFar, vHome, k, 0.3));
    ry = lerp(-0.15, 0, k) + Math.sin(t * 0.7) * 0.08 * k;
    card.position.y += Math.sin(t * 1.6) * 0.03 * k;
  }
  card.rotation.set(rx, ry, rz);
}

// field rings: phase advances faster while "springt … um" is spoken
function span(t, a, b) {
  return Math.max(0, Math.min(t, b) - a);
}
function animateRings(list, t, vis, origin, dir, reach, r0, r1, phase) {
  for (let i = 0; i < list.length; i++) {
    const m = list[i];
    const f = (((phase + i / list.length) % 1) + 1) % 1;
    const a = Math.sin(Math.PI * f) * vis;
    m.visible = a > 0.01;
    if (!m.visible) continue;
    m.position.copy(origin).addScaledVector(dir, f * reach);
    m.scale.setScalar(lerp(r0, r1, f));
    m.material.opacity = a * 0.6;
  }
}
const vReader = V(TX, READER_Y, FACE + 0.04);
const zDir = V(0, 0, 1);
const vChipW = V(0, 0, 0);

const applyCamera = shotCamera(shots);

// ---------------------------------------------------------------- render
function renderAt(t) {
  redrawFonts();
  cardPose(t);

  // ---- x-ray: card glass from "Plastik" until the answer
  const xk = smooth(ramp(t, XRAY[0], XRAY[1])) * (1 - smooth(ramp(t, XRAY[2], XRAY[3])));
  setXray([cardMat], xk);
  printMat.opacity = 1 - 0.92 * xk;
  printMat.depthWrite = xk < 0.02;

  // ---- antenna: winds round the card on the whisper, visible through the glass
  const grow = smooth(ramp(t, T.rund + 0.1, T.gewickelt + 0.5));
  antenna.visible = grow > 0 && xk > 0.02;
  antennaGeo.setDrawRange(0, Math.ceil(grow * ASEG) * ARAD * 6);
  // current: on with "zack" while the card sits in the field, fades as it leaves
  const near = 1 - smooth(ramp(t, T.darum + 0.2, T.nah + 0.4));
  const current = smooth(ramp(t, T.zack, T.zack + 0.12)) * near;
  const flick = 0.85 + 0.15 * Math.sin(t * 47);
  M.wire.emissiveIntensity = (0.15 * grow + 1.5 * current * flick) * xk;
  beads.visible = current > 0.02 && xk > 0.02;
  if (beads.visible) {
    const ph = (t - T.zack) * 0.32;
    for (let i = 0; i < NB; i++) {
      const u = (((i / NB + ph) % 1) + 1) % 1;
      antennaCurve.getPointAt(u, dummy.position);
      dummy.position.z += 0.012;
      dummy.scale.setScalar(Math.max(0.001, current));
      dummy.updateMatrix();
      beads.setMatrixAt(i, dummy.matrix);
    }
    beads.instanceMatrix.needsUpdate = true;
  }

  // ---- chip: thinks in the hook, sleeps, wakes on "wacht", code for the fact
  const hookOn =
    smooth(ramp(t, HOOK_TAP, HOOK_TAP + 0.2)) * (1 - ramp(t, T.gleich + 0.2, T.gleich + 0.8));
  const think = hookOn * (0.9 + 0.6 * Math.max(0, Math.sin(t * 13)));
  const awake = smooth(ramp(t, T.wacht - 0.05, T.wacht + 0.2)) * near;
  const fact = pop(t, T.uebrigens + 0.3, T.karte3);
  const sleep = pop(t, T.ohne, T.krass) * (0.15 + 0.15 * Math.sin(t * 3));
  M.gold.emissiveIntensity =
    0.9 * think + 1.1 * awake + 0.8 * fact * (0.7 + 0.3 * Math.sin(t * 20)) + sleep;
  M.gold.emissive.setHex(sleep > 0 && think + awake + fact < 0.01 ? 0x7f8aa8 : 0x3dff7a);
  chipGlow.intensity = 1.5 * (think + awake + fact);

  // ---- rice grain next to the chip
  rice.visible = t >= T.reiskorn && t < T.krass + 0.3;
  if (rice.visible) {
    const s = squash(t, T.reiskorn);
    const out = 1 - ramp(t, T.krass, T.krass + 0.3);
    rice.scale.set(
      riceBase.x * s.x * out + 1e-4,
      riceBase.y * s.y * out + 1e-4,
      riceBase.z * s.z * out + 1e-4,
    );
  }

  // ---- hook battery + ✕, "Allein bringt sie nichts" ✕
  const bk = pop(t, T.akku, T.gleich + 0.1);
  battery.visible = bk > 0;
  if (battery.visible) {
    battery.scale.copy(squash(t, T.akku)).multiplyScalar(t < T.gleich ? 1 : bk);
    battery.rotation.y = t * 0.8;
    battery.rotation.z = 0.12;
  }
  const nopeBattery = pop(t, T.akku + 0.3, T.gleich + 0.1);
  const nopeCard = pop(t, T.nichts - 0.05, T.jetzt);
  if (nopeBattery > 0)
    showNope(nopeBattery, battery.position.x, battery.position.y, battery.position.z + 0.25, 0.5);
  else if (nopeCard > 0) showNope(nopeCard, HOME[0] + 0.25, HOME[1] + 0.05, HOME[2] + 0.35, 0.7);
  else showNope(0, 0, 0, 0);

  // ---- terminal field: hook tap, then from "Magnetfeld" to the fact
  const fHook = pop(t, -0.4, T.gleich + 0.6);
  const fMain = pop(t, T.magnetfeld - 0.1, T.uebrigens + 0.2);
  const fast =
    smooth(ramp(t, T.dreizehn - 0.1, T.dreizehn + 0.3)) * (1 - ramp(t, T.karte2, T.karte2 + 0.4));
  const field = Math.max(fHook, fMain);
  const phase = 0.9 * t + 2.2 * span(t, T.dreizehn, T.karte2);
  animateRings(fieldRings, t, field * (0.75 + 0.35 * fast), vReader, zDir, 1.35, 0.24, 0.85, phase);
  M.coilT.emissiveIntensity = field * (1.4 + 0.6 * Math.sin(t * 30));
  tGlow.intensity = 2.2 * field;

  // ---- the card answers: yellow rings from the chip
  const ans = pop(t, T.funkt - 0.05, T.piep + 0.5);
  card.updateMatrixWorld();
  vChipW.set(CHIP[0], CHIP[1], CD / 2 + 0.03);
  card.localToWorld(vChipW);
  animateRings(answerRings, t, ans, vChipW, zDir, 0.9, 0.08, 0.45, 1.3 * t);

  // ---- screen: green after the hook tap and on "Piep"
  const paid = (t >= HOOK_TAP + 0.05 && t < T.gleich + 0.4) || (t >= T.piep && t < T.uebrigens);
  drawScreen(paid ? 1 : 0);
  screenGlow.intensity = paid ? 1.6 : 0;

  // ---- phone for the CTA
  phone.visible = t >= T.karte3 + 0.25;
  if (phone.visible) {
    phone.scale.copy(squash(t, T.karte3 + 0.25));
    phone.rotation.y = -0.2 + Math.sin(t * 0.9) * 0.08;
    phone.position.y = HOME[1] - 0.05 + Math.sin(t * 1.5 + 1) * 0.03;
  }
  puff("phone", t, T.karte3 + 0.35, phone.position.x, HOME[1] - 0.5, HOME[2], 0.6);

  // ---- LED panel: one fact at a time
  if (t >= T.dreizehn && t < T.karte2 + 0.2) {
    showPanel(pop(t, T.dreizehn, T.karte2 + 0.2), "PRO SEKUNDE", "13 Mio", LED.blue);
  } else if (t >= T.nah - 0.1 && t < T.uebrigens) {
    showPanel(pop(t, T.nah - 0.1, T.uebrigens), "REICHWEITE", "~4 cm", LED.green);
  } else if (t >= T.geheimcode && t < T.karte3) {
    // a new one-time code ticking through
    const n = Math.floor((t - T.geheimcode) * 9);
    const hex = "0123456789ABCDEF";
    let code = "";
    for (let i = 0; i < 6; i++) code += hex[Math.floor(hash(n * 7 + i) * 16)];
    showPanel(pop(t, T.geheimcode, T.karte3), "EINMAL-CODE", code, LED.yellow);
  } else {
    showPanel(0);
  }

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
