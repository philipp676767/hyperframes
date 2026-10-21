// Shared engine for the "Du hast gerade X gebaut" explainer series:
// word-anchored timing, renderer, materials, camera shots, LED panel, wavy
// force/heat arrows, orange "nope" X and x-ray glass. The landscape and sky
// come from environments.js (createWorld). A video's scene.js imports from
// both and only builds its own subject + story beats.
// Everything renders as a pure function of time t (seconds).
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.181.2/+esm";

window.THREE = THREE;
export { THREE };

// 3D is drawn at 2/3 resolution and scaled up by CSS; captions stay full-res DOM.
export const WIDTH = 720;
export const HEIGHT = 1280;

// ---------------------------------------------------------------- word anchors
// W(word, n), LAST, END, HL … live in timing.js (shared with build-sfx.mjs).
import { W, LAST, END, HL } from "./timing.js";
export { W, LAST, END, HL };

// ---------------------------------------------------------------- math helpers
export const clamp01 = (x) => Math.min(1, Math.max(0, x));
export const ramp = (t, a, b) => clamp01((t - a) / (b - a));
export const lerp = (a, b, k) => a + (b - a) * k;
export const smooth = (x) => x * x * (3 - 2 * x);
export const easeInOut = (x) => -(Math.cos(Math.PI * x) - 1) / 2;
export const outBack = (x) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return x <= 0 ? 0 : x >= 1 ? 1 : 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
export const inBack = (x) => {
  const c1 = 1.70158;
  return x <= 0 ? 0 : x >= 1 ? 1 : (c1 + 1) * x * x * x - c1 * x * x;
};
// visible inside [a, b) with a quick pop in/out
export const pop = (t, a, b, d = 0.35) =>
  t < a || t >= b ? 0 : outBack(ramp(t, a, a + d)) * (1 - ramp(t, b - 0.15, b));

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const rand = rng(1337);
export const V = (x, y, z) => new THREE.Vector3(x, y, z);

// Displace vertices by a hash of their rounded position so faceted meshes stay watertight.
export function jitter(geom, amt, seed = 1) {
  const p = geom.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const h = (k) => {
      const s =
        Math.sin(
          Math.round(x * 100) * 12.9898 +
            Math.round(y * 100) * 78.233 +
            Math.round(z * 100) * 37.719 +
            k * 11.1 +
            seed,
        ) * 43758.5453;
      return (s - Math.floor(s)) * 2 - 1;
    };
    p.setXYZ(i, x + h(1) * amt, y + h(2) * amt, z + h(3) * amt);
  }
  geom.computeVertexNormals();
  return geom;
}

// ---------------------------------------------------------------- renderer
const canvas = document.getElementById("stage");
export const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  preserveDrawingBuffer: true,
});
renderer.setPixelRatio(1);
renderer.setSize(WIDTH, HEIGHT, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

export const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xe9a7c4, 30, 95);
export const camera = new THREE.PerspectiveCamera(48, WIDTH / HEIGHT, 0.03, 500);

// ---------------------------------------------------------------- materials
export const flat = (color, extra = {}) =>
  new THREE.MeshStandardMaterial({
    color,
    flatShading: true,
    roughness: 0.85,
    metalness: 0,
    ...extra,
  });
export const M = {
  grass: flat(0x79c24a),
  grassDark: flat(0x5f9f37),
  earth: flat(0x6e3b22),
  root: flat(0x4b2414),
  trunk: flat(0x7a4a2a),
  leaf: flat(0x6db33c),
  leaf2: flat(0x5aa233),
  rock: flat(0xa9a3ad),
  wood: flat(0xc58b4f),
  woodDark: flat(0x9a6a38),
  chrome: new THREE.MeshStandardMaterial({ color: 0xe8edf2, metalness: 0.9, roughness: 0.2 }),
  rubber: flat(0x2e2a2c),
  copper: new THREE.MeshStandardMaterial({ color: 0xc8743c, metalness: 0.6, roughness: 0.35 }),
  alu: new THREE.MeshStandardMaterial({ color: 0xb9d6ea, metalness: 0.5, roughness: 0.3 }),
  steel: flat(0x8a96a3, { roughness: 0.45, metalness: 0.5 }),
  concrete: flat(0xd8d2cc),
  water: new THREE.MeshStandardMaterial({
    color: 0x7cc7f2,
    roughness: 0.05,
    transparent: true,
    opacity: 0.72,
  }),
  steam: new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
  }),
  orange: flat(0xff7a2f, { emissive: 0xff5a10, emissiveIntensity: 0.25 }),
};

// X-ray glass: solid at k=0, light-blue see-through glass with glowing edges at
// k=1. Keep `transparent` fixed: flipping it after first compile does not
// recompile the shader, and the mesh stays opaque.
export function xrayMaterial(color = 0xffffff, extra = {}) {
  const m = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.32,
    metalness: 0.05,
    transparent: true,
    ...extra,
  });
  m.userData.base = new THREE.Color(color);
  return m;
}
export const edgeMat = new THREE.LineBasicMaterial({
  color: 0x9fdcff,
  transparent: true,
  opacity: 0,
});
const GLASS = new THREE.Color(0.55, 0.82, 1.0);
export function setXray(materials, k) {
  for (const m of materials) {
    m.opacity = lerp(1, 0.2, k);
    m.color.copy(m.userData.base).lerp(GLASS, k);
    m.depthWrite = k < 0.02;
  }
  edgeMat.opacity = 0.9 * k;
}
// glowing outline for an x-ray mesh (add it next to the mesh, same transform)
export const xrayEdges = (geo) => new THREE.LineSegments(new THREE.EdgesGeometry(geo, 35), edgeMat);

// ---------------------------------------------------------------- ground
// Environments (sky, lights, landscape) live in environments.js and fill this
// group; createWorld() there must run before the subject is built.
export const ground = new THREE.Group();
scene.add(ground);

// Checkered floor pad under the subject (kitchen tiles, workshop floor...).
export function addFloor(size = 3.6, colorA = "#f3e9dc", colorB = "#d9c9b6") {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  for (let i = 0; i < 8; i++)
    for (let j = 0; j < 8; j++) {
      g.fillStyle = (i + j) % 2 ? colorA : colorB;
      g.fillRect(i * 32, j * 32, 32, 32);
    }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(size, 0.08, size),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }),
  );
  floor.receiveShadow = true;
  ground.add(floor);
  return floor;
}

// Per-frame hooks for animated environment details (falling snow, waves...).
const frameHooks = [];
export const onFrame = (fn) => frameHooks.push(fn);

// ---------------------------------------------------------------- shared props
export function roundedRect(w, h, r) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2 + r, 0);
  s.lineTo(w / 2 - r, 0);
  s.quadraticCurveTo(w / 2, 0, w / 2, r);
  s.lineTo(w / 2, h - r);
  s.quadraticCurveTo(w / 2, h, w / 2 - r, h);
  s.lineTo(-w / 2 + r, h);
  s.quadraticCurveTo(-w / 2, h, -w / 2, h - r);
  s.lineTo(-w / 2, r);
  s.quadraticCurveTo(-w / 2, 0, -w / 2 + r, 0);
  return s;
}

// orange "this doesn't work" X; billboarded every frame by renderFrame()
export const nope = new THREE.Group();
for (const s of [-1, 1]) {
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.2, 0.2), M.orange);
  b.rotation.z = (s * Math.PI) / 4;
  nope.add(b);
}
scene.add(nope);
nope.visible = false;
export function showNope(k, x, y, z, size = 0.7) {
  nope.visible = k > 0;
  nope.scale.setScalar(Math.max(0.001, k * size));
  nope.position.set(x, y, z);
}

// ---------------------------------------------------------------- wavy arrows
export const heatMat = new THREE.MeshBasicMaterial({
  color: 0xff4d2e,
  transparent: true,
  depthWrite: false,
});
export const coldMat = new THREE.MeshBasicMaterial({
  color: 0x46b8ff,
  transparent: true,
  depthWrite: false,
});
export const forceMat = new THREE.MeshBasicMaterial({
  color: 0xffd23f,
  transparent: true,
  depthWrite: false,
});
function waveArrow(len, amp, r, mat) {
  const pts = [];
  for (let k = 0; k <= 40; k++) {
    const f = k / 40;
    pts.push(V(f * len, Math.sin(f * Math.PI * 4) * amp, 0));
  }
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, r, 6), mat));
  const head = new THREE.Mesh(new THREE.ConeGeometry(r * 3.2, r * 7, 10), mat);
  head.rotation.z = -Math.PI / 2;
  head.position.x = len + r * 3;
  g.add(head);
  return g;
}
// One arrow per [from, to] pair. amp 0 gives a straight arrow (forces);
// the default wave reads as heat / air / energy.
export function makeArrowSet(list, opts = {}) {
  return list.map(([a, b], i) => {
    const g = new THREE.Group();
    const dir = b.clone().sub(a);
    const len = dir.length();
    const arrow = waveArrow(len * 0.7, opts.amp ?? 0.05, opts.r ?? 0.022, opts.mat ?? heatMat);
    g.add(arrow);
    g.position.copy(a);
    g.quaternion.setFromUnitVectors(V(1, 0, 0), dir.normalize());
    g.userData = { arrow, len, phase: i * 0.37 };
    (opts.parent ?? scene).add(g);
    g.visible = false;
    return g;
  });
}
// vis 0..1 (use pop()); arrows creep along their axis and breathe in width
export function animateArrows(set, t, vis) {
  for (const g of set) {
    const { arrow, len, phase } = g.userData;
    const c = (t * 0.9 + phase) % 1;
    arrow.position.x = c * len * 0.3;
    g.visible = vis > 0.001;
    g.scale.setScalar(Math.max(0.001, vis));
    arrow.scale.set(1, 0.6 + 0.4 * Math.sin(c * Math.PI), 1);
  }
}

// ---------------------------------------------------------------- LED panel
// A black sign with a small label and big glowing value ("KOCHT BEI / -26°C"),
// pinned to the upper third of the frame in front of the camera.
const panelCanvas = document.createElement("canvas");
panelCanvas.width = 512;
panelCanvas.height = 256;
const panelTex = new THREE.CanvasTexture(panelCanvas);
panelTex.colorSpace = THREE.SRGBColorSpace;
const panel = new THREE.Group();
{
  const back = new THREE.Mesh(
    new THREE.BoxGeometry(0.84, 0.44, 0.06),
    flat(0x1c1c22, { depthTest: false }),
  );
  back.renderOrder = 10;
  panel.add(back);
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 0.4),
    new THREE.MeshBasicMaterial({ map: panelTex, toneMapped: false, depthTest: false }),
  );
  face.renderOrder = 11;
  face.position.z = 0.032;
  panel.add(face);
  panel.visible = false;
  scene.add(panel);
}
export const LED = { red: "#ff4b2b", blue: "#4fc3ff", green: "#3dff7a", yellow: "#ffd23f" };
let panelKey = "";
let panelK = 0;
// Call once per frame (k = 0 hides it). value is short: "-26°C", "AN", "8 t".
export function showPanel(k, label = "", value = "", color = LED.red) {
  panelK = k;
  if (k <= 0) return;
  const key = label + value + color;
  if (key === panelKey) return;
  panelKey = key;
  const g = panelCanvas.getContext("2d");
  g.fillStyle = "#0d0d12";
  g.fillRect(0, 0, 512, 256);
  g.fillStyle = "#c9c9d6";
  g.font = '800 36px "Montserrat", sans-serif';
  g.textBaseline = "top";
  g.fillText(label, 28, 22);
  g.shadowColor = color;
  g.shadowBlur = 24;
  g.fillStyle = color;
  g.font = '800 132px "Montserrat", sans-serif';
  g.textBaseline = "alphabetic";
  g.textAlign = "right";
  g.fillText(value, 488, 222);
  g.textAlign = "left";
  g.shadowBlur = 0;
  panelTex.needsUpdate = true;
}

// ---------------------------------------------------------------- camera shots
// Each shot starts at a word anchor and lasts until the next one (hard cut).
//   { at, from:[x,y,z], to:[x,y,z], look:[x,y,z], lookTo?, rel?: Vector3, zoom? }
//   { at, orbit: { c:[x,y,z], r, y, a0, a1 } }   // a = angle around c, 0 = +z
// Shots are authored tight and pulled back by `zoom` (default 1.7) along the
// view line, so write positions as if standing close to the subject.
// Every highlighted word (HL) adds a short punch-in: the lens snaps ~10 %
// tighter on the word and eases back over ~0.5 s.
const FOV = 48;
export function punch(t) {
  let p = 0;
  for (const h of HL) {
    const x = t - h;
    if (x >= 0 && x < 0.9) p = Math.max(p, x < 0.07 ? x / 0.07 : Math.exp(-(x - 0.07) / 0.17));
  }
  return p;
}
export function shotCamera(shots, defaultZoom = 1.7) {
  const p = V(0, 0, 0);
  const l = V(0, 0, 0);
  const zero = V(0, 0, 0);
  return (t) => {
    let i = shots.length - 1;
    while (i > 0 && shots[i].at > t) i--;
    const s = shots[i];
    const next = i + 1 < shots.length ? shots[i + 1].at : END;
    const k = easeInOut(clamp01((t - s.at) / Math.max(0.01, next - s.at)));
    if (s.orbit) {
      const o = s.orbit;
      const a = lerp(o.a0, o.a1, k);
      p.set(o.c[0] + Math.sin(a) * o.r, o.y, o.c[2] + Math.cos(a) * o.r);
      l.set(...o.c);
    } else {
      const rel = s.rel ?? zero;
      p.set(
        lerp(s.from[0], s.to[0], k),
        lerp(s.from[1], s.to[1], k),
        lerp(s.from[2], s.to[2], k),
      ).add(rel);
      const la = s.look;
      const lb = s.lookTo ?? s.look;
      l.set(lerp(la[0], lb[0], k), lerp(la[1], lb[1], k), lerp(la[2], lb[2], k)).add(rel);
    }
    p.sub(l)
      .multiplyScalar(s.zoom ?? defaultZoom)
      .add(l);
    camera.position.copy(p);
    camera.lookAt(l);
    camera.fov = FOV / (1 + 0.11 * punch(t));
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  };
}

// ---------------------------------------------------------------- labels
// Name tag + arrow pointing at a part, drawn as DOM over the canvas (crisp
// text at 1080 px). Immediate mode: call showLabel() every frame while it is
// visible; renderFrame() projects it after the camera has moved.
const SVG = "http://www.w3.org/2000/svg";
const labelLayer = document.createElement("div");
labelLayer.id = "labels";
labelLayer.style.cssText = "position:absolute;inset:0;pointer-events:none;";
const arrowSvg = document.createElementNS(SVG, "svg");
arrowSvg.setAttribute("width", "1080");
arrowSvg.setAttribute("height", "1920");
arrowSvg.style.cssText = "position:absolute;left:0;top:0;overflow:visible;";
labelLayer.appendChild(arrowSvg);
{
  const root = document.getElementById("root");
  root.insertBefore(labelLayer, document.getElementById("captions"));
}
const labelPool = new Map();
const labelsNow = [];
function labelNode(id) {
  let n = labelPool.get(id);
  if (n) return n;
  const pill = document.createElement("div");
  pill.style.cssText =
    "position:absolute;left:0;top:0;padding:12px 30px;border-radius:999px;background:#fff;" +
    'color:#1c1c22;font:800 52px/1.1 "Montserrat",sans-serif;white-space:nowrap;' +
    "box-shadow:0 10px 30px rgba(40,10,40,.35);border:5px solid #ffd23f;opacity:0;";
  labelLayer.appendChild(pill);
  const mk = (stroke, w) => {
    const p = document.createElementNS(SVG, "path");
    p.setAttribute("fill", "none");
    p.setAttribute("stroke", stroke);
    p.setAttribute("stroke-width", w);
    p.setAttribute("stroke-linecap", "round");
    p.setAttribute("stroke-linejoin", "round");
    arrowSvg.appendChild(p);
    return p;
  };
  n = { pill, shadow: mk("rgba(20,12,30,.55)", 15), line: mk("#ffd23f", 8), text: "" };
  labelPool.set(id, n);
  return n;
}
// k 0..1 (use pop()), pos = world point the arrow tip touches, side -1 | 1
// puts the tag left / right of it (default: away from the frame centre).
export function showLabel(id, k, text, pos, side) {
  if (k > 0) labelsNow.push({ id, k, text, pos, side });
}
// Draw a list of { text, at, until, pos:[x,y,z] | Vector3, side? } (beats.js LABELS).
export function labels(t, list) {
  list.forEach((l, i) => {
    const p = Array.isArray(l.pos) ? V(...l.pos) : l.pos;
    showLabel(l.id ?? `l${i}`, pop(t, l.at, l.until ?? l.at + 2.6), l.text, p, l.side);
  });
}
const tmpV = V(0, 0, 0);
function drawLabels() {
  const live = new Set();
  for (const l of labelsNow) {
    const n = labelNode(l.id);
    live.add(l.id);
    tmpV.copy(l.pos).project(camera);
    if (tmpV.z > 1 || Math.abs(tmpV.x) > 1.3 || Math.abs(tmpV.y) > 1.3) continue;
    const ax = (tmpV.x + 1) * 540;
    const ay = (1 - tmpV.y) * 960;
    if (n.text !== l.text) {
      n.pill.textContent = l.text;
      n.text = l.text;
    }
    const w = n.pill.offsetWidth;
    const h = n.pill.offsetHeight;
    const side = l.side ?? (ax > 540 ? 1 : -1);
    let cx = Math.min(1040 - w / 2, Math.max(40 + w / 2, ax + side * 210));
    let cy = Math.min(1640, Math.max(180, ay - 230));
    // keep the caption band (y 880-1040) free
    if (cy > 840 && cy < 1080) cy = cy < 960 ? 820 : 1100;
    const k = l.k;
    n.pill.style.opacity = String(Math.min(1, k * 1.5));
    n.pill.style.transform = `translate(${cx - w / 2}px, ${cy - h / 2}px) scale(${Math.max(0.01, k)})`;
    // arrow from the tag edge to the part; it grows towards the tip
    const sx = cx;
    const sy = cy + (ay > cy ? h / 2 : -h / 2);
    const g = smooth(clamp01((Math.min(k, 1) - 0.2) / 0.8));
    const ex = lerp(sx, ax, g);
    const ey = lerp(sy, ay, g);
    const ang = Math.atan2(ey - sy, ex - sx);
    const head = 26 * g;
    const d =
      `M${sx},${sy} L${ex},${ey} ` +
      `M${ex - head * Math.cos(ang - 0.5)},${ey - head * Math.sin(ang - 0.5)} L${ex},${ey} ` +
      `L${ex - head * Math.cos(ang + 0.5)},${ey - head * Math.sin(ang + 0.5)}`;
    for (const p of [n.shadow, n.line]) {
      p.setAttribute("d", g > 0.01 ? d : "");
      p.style.opacity = String(Math.min(1, k * 1.5));
    }
  }
  for (const [id, n] of labelPool) {
    if (live.has(id)) continue;
    n.pill.style.opacity = "0";
    n.shadow.setAttribute("d", "");
    n.line.setAttribute("d", "");
  }
  labelsNow.length = 0;
}

// ---------------------------------------------------------------- frame loop
// Billboards + render. Call at the end of your renderAt(t).
export function renderFrame() {
  nope.quaternion.copy(camera.quaternion);
  panel.visible = panelK > 0;
  if (panelK > 0) {
    panel.quaternion.copy(camera.quaternion);
    panel.scale.setScalar(Math.max(0.001, panelK * 0.8));
    // fixed spot in the upper third of the frame, just in front of the camera
    panel.position.set(0.18, 0.78, -3.0).applyMatrix4(camera.matrixWorld);
  }
  renderer.render(scene, camera);
  drawLabels();
}

// Wire HyperFrames seeking to renderAt(t); redraw once fonts land so the LED
// panel text uses Montserrat.
export function start(renderAt) {
  const frame = (t) => {
    for (const fn of frameHooks) fn(t);
    renderAt(t);
  };
  window.addEventListener("hf-seek", (e) => frame(e.detail.time));
  document.fonts.load('800 40px "Montserrat"').then(() => {
    panelKey = "";
    frame(window.__hfThreeTime || 0);
  });
  frame(window.__hfThreeTime || 0);
  window.__dbg = { renderAt: frame, scene, camera };
}
