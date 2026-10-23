// "Warum fällt ein Foto bei Face ID durch?" World, captions, camera, panel,
// arrows and labels live in world.js; this file builds the story: a giant
// low-poly bust ("you") on the beach looks into a giant phone held up by
// your hand. The phone's top island sprays thousands of infrared dots onto
// the face (hook), a photo fails, the IR flood lights the face in the dark,
// the dot projector fires (slow motion), the dots land differently on nose
// and cheek, the IR camera reads them back, the head turns into a
// depth-coloured 3D map and the lock opens. In the payoff the photo gets a
// flat, one-colour grid and fails; for the bonus fact a stranger fails and
// a twin gets in.
import {
  THREE,
  ramp,
  smooth,
  easeInOut,
  inBack,
  pop,
  V,
  scene,
  flat,
  M,
  xrayMaterial,
  setXray,
  roundedRect,
  showNope,
  showPanel,
  LED,
  LOOK,
  labels,
  squash,
  puff,
  jitter,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { createWorld } from "./environments.js";
import { createHand } from "./hand.js";
import {
  T,
  shots,
  LABELS,
  HIGHLIGHTS,
  YAW,
  DIR,
  PERP,
  HEAD,
  PHONE,
  PH_W,
  PH_H,
  PH_D,
  ISLAND_Y,
  MOD,
  PROJ_W,
  CAM_W,
  FLOOD_W,
  PHOTO,
  TWIN,
  BURST,
  DARK,
  XRAY,
  PHOTO_IN,
} from "./beats.js";

highlights(HIGHLIGHTS);
createWorld({ env: "strand", sky: "sonnenuntergang" });

Object.assign(M, {
  phoneBody: flat(0x2a2e38, { roughness: 0.35, metalness: 0.3 }),
  phoneEdge: flat(0xc9ccd4, { roughness: 0.3, metalness: 0.6 }),
  island: flat(0x08090c, { roughness: 0.25 }),
  lens: flat(0x1b2a4a, { roughness: 0.15, metalness: 0.4 }),
  proj: flat(0x3a1020, { emissive: 0xff2d55, emissiveIntensity: 0 }),
  flood: flat(0x2a1440, { emissive: 0xb04dff, emissiveIntensity: 0 }),
  camRing: flat(0x10313a, { emissive: 0x4fe3ff, emissiveIntensity: 0 }),
  eyeW: flat(0xffffff, { roughness: 0.4 }),
  pupil: flat(0x2b1d16, { roughness: 0.3 }),
  lips: flat(0xd8706f),
  brow: flat(0x3a2418),
  photoBack: flat(0xf7f4ee, { roughness: 0.6 }),
});

const clamp = (x) => Math.min(1, Math.max(0, x));
const vDIR = V(...DIR);
const vPERP = V(...PERP);
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

// ---------------------------------------------------------------- the bust
// A toy bust: hoodie shoulders, neck, faceted head with hair, eyes, brows,
// nose, lips and ears. Front = +z; returns the group and the meshes the
// dots can land on.
function makeBust({ skin, hair, hoodie, style = 0, glasses = false, seed = 1 }) {
  const g = new THREE.Group();
  const skinMat = xrayMaterial(skin, { flatShading: true, roughness: 0.75 });
  const hairMat = xrayMaterial(hair, { flatShading: true, roughness: 0.8 });
  const hoodMat = flat(hoodie);
  const mesh = (geo, mat, x, y, z, parent = g) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };
  // shoulders + hood rim
  const torso = mesh(
    jitter(new THREE.CylinderGeometry(0.62, 0.8, 1.25, 12, 2), 0.02, seed),
    hoodMat,
    0,
    0.62,
    0,
  );
  torso.scale.z = 0.7;
  mesh(new THREE.TorusGeometry(0.3, 0.09, 6, 14), hoodMat, 0, 1.26, -0.04).rotation.x = Math.PI / 2;
  mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.42, 10), skinMat, 0, 1.42, 0);
  // head
  const head = new THREE.Group();
  head.position.set(0, HEAD[1], 0);
  g.add(head);
  const hits = [];
  const skull = mesh(
    jitter(new THREE.SphereGeometry(0.42, 14, 11), 0.012, seed + 1),
    skinMat,
    0,
    0,
    0,
    head,
  );
  skull.scale.set(0.88, 1.08, 0.95);
  hits.push(skull);
  const jaw = mesh(
    jitter(new THREE.SphereGeometry(0.3, 10, 8), 0.01, seed + 2),
    skinMat,
    0,
    -0.2,
    0.06,
    head,
  );
  jaw.scale.set(0.95, 0.75, 0.95);
  hits.push(jaw);
  const noseGeo = new THREE.ConeGeometry(0.075, 0.2, 5);
  const nose = mesh(noseGeo, skinMat, 0, -0.03, 0.43, head);
  nose.rotation.x = Math.PI / 2;
  nose.scale.set(1, 1, 0.75);
  hits.push(nose);
  for (const sx of [-1, 1]) {
    const ear = mesh(new THREE.SphereGeometry(0.09, 7, 6), skinMat, sx * 0.37, 0, -0.02, head);
    ear.scale.set(0.5, 1, 0.8);
    hits.push(ear);
    const eye = mesh(new THREE.SphereGeometry(0.06, 10, 8), M.eyeW, sx * 0.145, 0.07, 0.345, head);
    eye.scale.z = 0.55;
    hits.push(eye);
    mesh(new THREE.SphereGeometry(0.033, 8, 6), M.pupil, sx * 0.145, 0.07, 0.38, head);
    const brow = mesh(
      new THREE.BoxGeometry(0.14, 0.028, 0.03),
      M.brow,
      sx * 0.15,
      0.17,
      0.37,
      head,
    );
    brow.rotation.z = sx * -0.12;
    if (glasses) {
      const rim = mesh(
        new THREE.TorusGeometry(0.085, 0.014, 6, 16),
        M.island,
        sx * 0.145,
        0.07,
        0.4,
        head,
      );
      rim.scale.set(1, 0.85, 1);
    }
  }
  const lips = mesh(new THREE.BoxGeometry(0.16, 0.04, 0.05), M.lips, 0, -0.2, 0.345, head);
  hits.push(lips);
  // hair: cap + back, style 1 adds a bun
  const cap = mesh(
    jitter(
      new THREE.SphereGeometry(0.455, 14, 9, 0, Math.PI * 2, 0, Math.PI * 0.46),
      0.012,
      seed + 3,
    ),
    hairMat,
    0,
    0.04,
    -0.03,
    head,
  );
  cap.scale.set(0.92, 1.1, 1.0);
  cap.rotation.x = -0.22;
  hits.push(cap);
  const back = mesh(
    jitter(new THREE.SphereGeometry(0.4, 10, 8), 0.015, seed + 4),
    hairMat,
    0,
    -0.05,
    -0.12,
    head,
  );
  back.scale.set(0.95, 1.05, 0.8);
  if (style === 1)
    mesh(
      jitter(new THREE.SphereGeometry(0.16, 8, 6), 0.01, seed + 5),
      hairMat,
      0,
      0.42,
      -0.25,
      head,
    );
  return { g, head, hits, hair: [cap], mats: [skinMat, hairMat] };
}

const me = makeBust({ skin: 0xf1c09a, hair: 0x5a3522, hoodie: 0xff8a3d, seed: 3 });
me.g.position.set(HEAD[0], 0, HEAD[2]);
me.g.rotation.y = YAW;
scene.add(me.g);
const stranger = makeBust({
  skin: 0xa8714f,
  hair: 0xf2d27a,
  hoodie: 0x3db6a0,
  style: 1,
  glasses: true,
  seed: 11,
});
stranger.g.position.copy(me.g.position);
stranger.g.rotation.y = YAW;
scene.add(stranger.g);
const twin = makeBust({ skin: 0xf1c09a, hair: 0x5a3522, hoodie: 0x6b8cff, seed: 3 });
twin.g.position.set(TWIN[0], 0, TWIN[2]);
twin.g.rotation.y = Math.atan2(PHONE[0] - TWIN[0], PHONE[2] - TWIN[2]);
scene.add(twin.g);
// eyelids for a blink
const lidMat = flat(0xe8b28c);
const lids = [];
for (const sx of [-1, 1]) {
  const lid = new THREE.Mesh(
    new THREE.SphereGeometry(0.064, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2),
    lidMat,
  );
  lid.position.set(sx * 0.145, 0.07, 0.345);
  lid.scale.set(1, 0.05, 0.6);
  me.head.add(lid);
  lids.push(lid);
}

// ---------------------------------------------------------------- the phone
const phone = new THREE.Group();
phone.position.set(...PHONE);
phone.rotation.y = YAW + Math.PI; // screen (+z) faces the face
scene.add(phone);
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
slab(PH_W + 0.02, PH_H + 0.02, PH_D * 0.8, 0.15, M.phoneEdge, phone);
slab(PH_W, PH_H, PH_D, 0.14, M.phoneBody, phone);
// back: camera bump (seen from the camera side)
{
  const bump = slab(0.38, 0.38, 0.04, 0.09, M.phoneBody, phone);
  bump.position.set(-0.22, 0.62, -PH_D / 2 - 0.02);
  for (const [x, y] of [
    [-0.3, 0.7],
    [-0.14, 0.54],
    [-0.3, 0.54],
  ]) {
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 16), M.lens);
    l.rotation.x = Math.PI / 2;
    l.position.set(x, y, -PH_D / 2 - 0.05);
    phone.add(l);
  }
}
// screen
const screenArt = canvasTex(380, 760);
const screen = new THREE.Mesh(
  new THREE.ShapeGeometry(roundedRect(PH_W - 0.07, PH_H - 0.07, 0.11), 6),
  new THREE.MeshStandardMaterial({
    map: screenArt.tex,
    emissive: 0xffffff,
    emissiveMap: screenArt.tex,
    emissiveIntensity: 0.65,
    roughness: 0.3,
  }),
);
{
  const g = screen.geometry;
  g.translate(0, -(PH_H - 0.07) / 2, 0);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++)
    uv.setXY(i, pos.getX(i) / (PH_W - 0.07) + 0.5, pos.getY(i) / (PH_H - 0.07) + 0.5);
}
screen.position.z = PH_D / 2 + 0.003;
phone.add(screen);
// the top island with IR camera, flood and dot projector
{
  const isl = slab(0.56, 0.13, 0.012, 0.065, M.island, phone);
  isl.position.set(0, ISLAND_Y, PH_D / 2 + 0.01);
  const mod = (x, r, mat) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.02, 16), mat);
    m.rotation.x = Math.PI / 2;
    m.position.set(x, ISLAND_Y, PH_D / 2 + 0.018);
    phone.add(m);
    return m;
  };
  mod(MOD.cam, 0.04, M.camRing);
  mod(MOD.cam, 0.022, M.lens).position.z += 0.003;
  mod(MOD.flood, 0.026, M.flood);
  mod(MOD.proj, 0.034, M.proj);
}
const projGlow = new THREE.PointLight(0xff2d55, 0, 2.5, 1.5);
projGlow.position.set(...PROJ_W);
scene.add(projGlow);

// screen states: lock, scan, open, nope, faceid, finger
let screenKey = "";
function drawScreen(state, k = 0) {
  const key = state + ":" + Math.round(k * 12) + (FONT_OK() ? "f" : "");
  if (key === screenKey) return;
  screenKey = key;
  const { g } = screenArt;
  const W = 380;
  const H = 760;
  const gr = g.createLinearGradient(0, 0, W, H);
  if (state === "open") {
    gr.addColorStop(0, "#38d27a");
    gr.addColorStop(1, "#13874a");
  } else if (state === "nope") {
    gr.addColorStop(0, "#ff5a4a");
    gr.addColorStop(1, "#b5171f");
  } else {
    gr.addColorStop(0, "#ff9a6b");
    gr.addColorStop(0.5, "#c04d9a");
    gr.addColorStop(1, "#3b2a8c");
  }
  g.fillStyle = gr;
  g.fillRect(0, 0, W, H);
  g.fillStyle = "#ffffff";
  g.textAlign = "center";
  g.strokeStyle = "#ffffff";
  g.lineCap = "round";
  g.lineJoin = "round";
  const cx = W / 2;
  if (state === "lock" || state === "scan" || state === "open" || state === "nope") {
    // lock icon: shackle lifts when open
    const ly = 190;
    const lift = state === "open" ? 26 : 0;
    g.lineWidth = 14;
    g.beginPath();
    g.arc(cx, ly - 10 - lift, 30, Math.PI, 0);
    g.lineTo(cx + 30, ly + 8 - lift * (state === "open" ? 0 : 1));
    g.moveTo(cx - 30, ly - 10 - lift);
    g.lineTo(cx - 30, ly + 8);
    g.stroke();
    g.beginPath();
    g.roundRect(cx - 46, ly + 6, 92, 70, 12);
    g.fill();
    g.font = '800 92px "Montserrat", sans-serif';
    g.fillText("9:41", cx, 360);
    g.font = '800 30px "Montserrat", sans-serif';
    const txt = { lock: "GESPERRT", scan: "SCANNE …", open: "OFFEN", nope: "NICHT ERKANNT" }[state];
    g.fillText(txt, cx, 420);
  }
  if (state === "scan" || state === "faceid") {
    // Face-ID glyph: corner brackets + smile, pulsing
    const s = 70 + 8 * Math.sin(k * Math.PI * 2);
    const y0 = state === "faceid" ? 300 : 560;
    g.lineWidth = 12;
    for (const [sx, sy] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ]) {
      g.beginPath();
      g.moveTo(cx + sx * s, y0 + sy * (s - 26));
      g.lineTo(cx + sx * s, y0 + sy * s);
      g.lineTo(cx + sx * (s - 26), y0 + sy * s);
      g.stroke();
    }
    g.lineWidth = 9;
    g.beginPath();
    g.moveTo(cx - 20, y0 - 18);
    g.lineTo(cx - 20, y0 - 8);
    g.moveTo(cx + 20, y0 - 18);
    g.lineTo(cx + 20, y0 - 8);
    g.moveTo(cx, y0 - 14);
    g.lineTo(cx, y0 + 8);
    g.lineTo(cx - 8, y0 + 8);
    g.stroke();
    g.beginPath();
    g.arc(cx, y0 + 14, 22, 0.3, Math.PI - 0.3);
    g.stroke();
  }
  if (state === "faceid" || state === "finger") {
    g.font = '800 46px "Montserrat", sans-serif';
    g.fillText(state === "faceid" ? "FACE ID" : "FINGER", cx, 470);
  }
  if (state === "finger") {
    g.lineWidth = 8;
    for (let i = 0; i < 6; i++) {
      g.beginPath();
      g.ellipse(
        cx,
        310,
        18 + i * 13,
        26 + i * 15,
        0,
        Math.PI * 1.05,
        Math.PI * 2.05 - (i % 2) * 0.4,
      );
      g.stroke();
    }
  }
  if (state === "open") {
    g.lineWidth = 22;
    g.beginPath();
    g.moveTo(cx - 60, 560);
    g.lineTo(cx - 12, 608);
    g.lineTo(cx + 70, 510);
    g.stroke();
  }
  if (state === "nope") {
    g.lineWidth = 22;
    g.beginPath();
    g.moveTo(cx - 55, 505);
    g.lineTo(cx + 55, 615);
    g.moveTo(cx + 55, 505);
    g.lineTo(cx - 55, 615);
    g.stroke();
  }
  g.textAlign = "left";
  screenArt.tex.needsUpdate = true;
}

// ---------------------------------------------------------------- your hand
// held behind the phone's lower half, fingers up, palm on the back
const holder = new THREE.Group();
holder.rotation.x = -Math.PI / 2;
phone.add(holder);
const hand = createHand({ scale: 1.25 });
scene.remove(hand.group);
holder.add(hand.group);

// ---------------------------------------------------------------- the photo
const photoArt = canvasTex(400, 500);
function drawPhoto() {
  const { g } = photoArt;
  g.fillStyle = "#f7f4ee";
  g.fillRect(0, 0, 400, 500);
  const gr = g.createLinearGradient(0, 30, 0, 400);
  gr.addColorStop(0, "#7cc6ff");
  gr.addColorStop(1, "#ffd9a8");
  g.fillStyle = gr;
  g.fillRect(28, 28, 344, 360);
  // hoodie
  g.fillStyle = "#ff8a3d";
  g.beginPath();
  g.ellipse(200, 400, 150, 90, 0, Math.PI, 0);
  g.fill();
  // face
  g.fillStyle = "#f1c09a";
  g.beginPath();
  g.ellipse(200, 205, 92, 112, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#5a3522";
  g.beginPath();
  g.ellipse(200, 150, 100, 70, 0, Math.PI, 0);
  g.fill();
  g.fillStyle = "#2b1d16";
  g.beginPath();
  g.arc(168, 205, 9, 0, Math.PI * 2);
  g.arc(232, 205, 9, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "#c86a5e";
  g.lineWidth = 7;
  g.lineCap = "round";
  g.beginPath();
  g.arc(200, 245, 26, 0.35, Math.PI - 0.35);
  g.stroke();
  g.strokeStyle = "#d89a76";
  g.beginPath();
  g.moveTo(200, 210);
  g.lineTo(192, 236);
  g.lineTo(204, 236);
  g.stroke();
  photoArt.tex.needsUpdate = true;
}
drawPhoto();
const photo = new THREE.Group();
photo.position.set(...PHOTO);
photo.rotation.y = YAW;
scene.add(photo);
const PHW = 0.8;
const PHH = 1.0;
const photoFace = new THREE.Mesh(
  new THREE.PlaneGeometry(PHW, PHH),
  new THREE.MeshStandardMaterial({ map: photoArt.tex, roughness: 0.55, side: THREE.DoubleSide }),
);
photoFace.position.z = 0.006;
photoFace.castShadow = true;
photo.add(photoFace);
{
  const b = new THREE.Mesh(new THREE.BoxGeometry(PHW, PHH, 0.01), M.photoBack);
  b.castShadow = true;
  photo.add(b);
}
const photoGlow = new THREE.PointLight(0xb04dff, 0, 2.2, 1.5);
scene.add(photoGlow);

// ---------------------------------------------------------------- dots
// Rays from the projector over the face area; each hit on the head is one
// dot. depth = how far it sticks out towards the phone (nose = 1).
scene.updateMatrixWorld(true);
const vProj = V(...PROJ_W);
const vHead = V(...HEAD);
const up = V(0, 1, 0);
const ray = new THREE.Raycaster();
const faceHits = [];
const photoHits = [];
{
  const r = rngLocal(7);
  const N = 52;
  const aim = V(0, 0, 0);
  const dir = V(0, 0, 0);
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) {
      const u = (i / (N - 1) - 0.5) * 1.15 + (r() - 0.5) * 0.02;
      const v = (j / (N - 1) - 0.5) * 1.1 - 0.08 + (r() - 0.5) * 0.02;
      if ((u / 0.55) ** 2 + (v / 0.65) ** 2 > 1) continue;
      aim
        .copy(vHead)
        .addScaledVector(vDIR, 0.3)
        .addScaledVector(vPERP, u)
        .addScaledVector(up, v + 0.02);
      dir.copy(aim).sub(vProj).normalize();
      ray.set(vProj, dir);
      const h = ray.intersectObjects(me.hits, false)[0];
      const seed = hash(i * 131 + j * 17);
      if (h && !me.hair.includes(h.object)) {
        const depth = h.point.clone().sub(vHead).dot(vDIR);
        faceHits.push({ p: h.point.clone().addScaledVector(dir, -0.006), depth, seed });
      }
    }
}
// the photo gets a perfectly even grid: every dot at the same depth
for (let gx = -8; gx <= 8; gx++)
  for (let gy = -10; gy <= 10; gy++) {
    const lx = gx * 0.044;
    const ly = gy * 0.044;
    const p = V(...PHOTO)
      .addScaledVector(vPERP, lx)
      .addScaledVector(vDIR, 0.015);
    p.y += ly;
    photoHits.push({ p, seed: hash(gx * 37 + gy * 101 + 5), lx, ly });
  }
function rngLocal(s) {
  let a = s >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let dMin = Infinity;
let dMax = -Infinity;
for (const h of faceHits) {
  dMin = Math.min(dMin, h.depth);
  dMax = Math.max(dMax, h.depth);
}
for (const h of faceHits) h.d = (h.depth - dMin) / (dMax - dMin);

const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
const dotGeo = new THREE.IcosahedronGeometry(0.0075, 0);
function dotMesh(n) {
  const m = new THREE.InstancedMesh(dotGeo, dotMat, n);
  m.userData.noAO = true;
  m.frustumCulled = false;
  m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3);
  scene.add(m);
  return m;
}
const faceDots = dotMesh(faceHits.length);
const photoDots = dotMesh(photoHits.length);
// beams: projector -> hit for a subset of the dots
function beamSet(list, color, step) {
  const pts = [];
  for (let i = 0; i < list.length; i += step) pts.push(vProj.clone(), list[i].p.clone());
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const l = new THREE.LineSegments(geo, mat);
  l.userData.noAO = true;
  l.frustumCulled = false;
  scene.add(l);
  return l;
}
const beams = beamSet(faceHits, 0xff3a5c, 6);
// read-back rays: dot -> IR camera
const backRays = (() => {
  const pts = [];
  const vCam = V(...CAM_W);
  for (let i = 0; i < faceHits.length; i += 7) pts.push(faceHits[i].p.clone(), vCam.clone());
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = new THREE.LineBasicMaterial({
    color: 0x4fe3ff,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const l = new THREE.LineSegments(geo, mat);
  l.userData.noAO = true;
  l.frustumCulled = false;
  scene.add(l);
  return l;
})();

// IR flood: violet cone + spot light on the face
const floodCone = (() => {
  const vF = V(...FLOOD_W);
  const len = vF.distanceTo(vHead) + 0.2;
  const geo = new THREE.ConeGeometry(0.62, len, 24, 1, true);
  geo.translate(0, -len / 2, 0);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xb04dff,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const m = new THREE.Mesh(geo, mat);
  m.userData.noAO = true;
  m.position.copy(vF);
  m.lookAt(vHead);
  m.rotateX(-Math.PI / 2);
  scene.add(m);
  return m;
})();
const floodLight = new THREE.SpotLight(0xc070ff, 0, 6, 0.5, 0.6, 1.2);
floodLight.position.set(...FLOOD_W);
floodLight.target.position.copy(vHead);
scene.add(floodLight, floodLight.target);

// darkness: a black dome beyond the stage + dimmed world lights
const darkDome = new THREE.Mesh(
  new THREE.SphereGeometry(9, 24, 16),
  new THREE.MeshBasicMaterial({
    color: 0x07060f,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    fog: false,
  }),
);
darkDome.position.copy(vHead);
darkDome.userData.noAO = true;
scene.add(darkDome);
const worldLights = [];
scene.traverse((o) => {
  if (o.isLight && o !== floodLight && o !== projGlow && o !== photoGlow)
    worldLights.push([o, o.intensity]);
});
const baseVignette = LOOK.vignette;

// ---------------------------------------------------------------- dot colours
const cIR = new THREE.Color(0xff2d55);
const cHot = new THREE.Color(0xffd23f);
const cCold = new THREE.Color(0x4fd8ff);
const cFlat = new THREE.Color(0x3dff7a);
const depthColor = (d, out) => {
  // far (cheek, ears) blue -> mid magenta -> near (nose) yellow
  if (d < 0.5) return out.copy(cCold).lerp(cIR, d * 2);
  return out.copy(cIR).lerp(cHot, (d - 0.5) * 2);
};
const dummy = new THREE.Object3D();
const col = new THREE.Color();
const tmpC = new THREE.Color();

// one burst: each dot launches in [start, start + spread], flies 0.28 s
function flyK(t, burst, seed) {
  const t0 = burst[0] + seed * burst[1];
  return clamp((t - t0) / 0.28);
}

const applyCamera = shotCamera(shots);
const vPhoto = V(...PHOTO);
const tmp = V(0, 0, 0);

// ---------------------------------------------------------------- render
function renderAt(t) {
  // ---- your hand holds the phone the whole time
  hand.track(t, [
    { t: -5, pos: [0.06, 0.16, -0.78], rot: [0, 0, 0], pose: "open" },
    { t: 200, pos: [0.06, 0.16, -0.78], rot: [0, 0, 0], pose: "open" },
  ]);
  phone.position.set(PHONE[0], PHONE[1] + Math.sin(t * 1.3) * 0.02, PHONE[2]);
  phone.rotation.z = Math.sin(t * 0.9) * 0.015;

  // ---- blink now and then
  const bl = [1.0, 4.9, 9.4, 17.1, 23.0, 29.0, 35.0].some((b) => t > b && t < b + 0.16);
  for (const l of lids) l.scale.y = bl ? 1 : 0.05;

  // ---- who stands in front of the phone (bonus fact: stranger, then twin)
  const strangerK = pop(t, T.fremder - 0.05, T.zwilling);
  me.g.visible = !(t >= T.fremder - 0.05 && t < T.zwilling);
  if (t >= T.zwilling && t < T.zwilling + 0.8) me.g.scale.copy(squash(t, T.zwilling));
  else me.g.scale.setScalar(1);
  stranger.g.visible = strangerK > 0.01;
  if (stranger.g.visible)
    stranger.g.scale
      .copy(squash(t, T.fremder - 0.05))
      .multiplyScalar(t < T.zwilling - 0.3 ? 1 : strangerK);
  puff("stranger", t, T.fremder + 0.1, HEAD[0], 0.05, HEAD[2], 1.4);
  twin.g.visible = t >= T.zwilling && t < T.ab + 0.2;
  if (twin.g.visible)
    twin.g.scale
      .copy(squash(t, T.zwilling))
      .multiplyScalar(1 - inBack(ramp(t, T.ab - 0.1, T.ab + 0.2)));
  puff("twin", t, T.zwilling + 0.15, TWIN[0], 0.05, TWIN[2], 1.4);

  // ---- darkness + IR flood
  const dark = smooth(ramp(t, DARK[0], DARK[1])) * (1 - smooth(ramp(t, DARK[2], DARK[3])));
  for (const [l, i0] of worldLights) l.intensity = i0 * (1 - 0.85 * dark);
  darkDome.material.opacity = 0.88 * dark;
  darkDome.visible = dark > 0.001;
  LOOK.vignette = baseVignette + 0.45 * dark;
  const floodPulse = pop(t, T.blitz - 0.05, T.bestanden + 0.4, 0.15);
  const floodHook = pop(t, -0.9, 0.9, 0.2) * 0.4;
  const flood = Math.max(floodPulse, floodHook) * (0.85 + 0.15 * Math.sin(t * 30));
  M.flood.emissiveIntensity = 3 * flood;
  floodLight.intensity = 9 * floodPulse * (0.4 + 0.6 * dark) + 5 * floodPulse;
  floodCone.material.opacity = 0.12 * floodPulse * (0.5 + dark);
  floodCone.visible = floodPulse > 0.01;

  // ---- photo visits
  let pk = 0;
  let pIn = -1;
  for (let i = 0; i < PHOTO_IN.length; i++) {
    const [a, b] = PHOTO_IN[i];
    if (t >= a && t < b + 0.35) {
      pk = pop(t, a, b);
      pIn = i;
    }
  }
  photo.visible = pk > 0.01;
  if (photo.visible) {
    const a = PHOTO_IN[pIn][0];
    const k = easeInOut(ramp(t, a, a + 0.45));
    // flies in from the side with a spin, leaves upward
    tmp.copy(vPhoto).addScaledVector(vPERP, (1 - k) * -1.6);
    tmp.y += (1 - k) * 0.9 + (1 - pk) * 0.6;
    photo.position.copy(tmp);
    photo.rotation.set(0, YAW + (1 - k) * 2.4, (1 - k) * 0.5 + Math.sin(t * 1.4) * 0.03);
    photo.scale.setScalar(Math.max(0.001, pk));
    // fail: wobble after the ✕
    const fail = pIn === 0 ? T.faellt1 : pIn === 2 ? T.faellt2 : null;
    if (fail != null && t > fail)
      photo.rotation.z += Math.sin((t - fail) * 40) * 0.06 * Math.max(0, 1 - (t - fail) * 2.5);
  }
  photoGlow.position.copy(vPhoto).addScaledVector(vDIR, 0.3);
  photoGlow.intensity = pIn === 1 ? 4 * floodPulse * pk : 0;

  // ---- face dots
  const hookVis = 1 - smooth(ramp(t, T.du1 + 0.05, T.keinen + 0.2));
  const mainOn = t >= BURST.main[0];
  const mainVis = mainOn ? 1 - smooth(ramp(t, T.uebrigens - 0.2, T.uebrigens + 0.1)) : 0;
  const nearHL = pop(t, T.nase, T.wange, 0.2);
  const farHL = pop(t, T.wange, T.eine, 0.2);
  const xk = smooth(ramp(t, XRAY[0], XRAY[1])) * (1 - smooth(ramp(t, XRAY[2], XRAY[3])));
  const hookK = t < T.foto1 ? hookVis : 0;
  const anyFace = (hookK > 0.01 || mainVis > 0.01) && me.g.visible;
  faceDots.visible = anyFace;
  if (anyFace) {
    const burst = mainOn ? BURST.main : BURST.hook;
    const vis = mainOn ? mainVis : hookK;
    for (let i = 0; i < faceHits.length; i++) {
      const h = faceHits[i];
      const k = flyK(t, burst, h.seed);
      if (k <= 0) {
        dummy.scale.setScalar(0.0001);
      } else {
        dummy.position.copy(vProj).lerp(h.p, k);
        // a little spark when it lands
        const land = clamp((t - (burst[0] + h.seed * burst[1] + 0.28)) / 0.25);
        const s = (k < 1 ? 0.8 : 1 + 0.9 * (1 - land)) * vis;
        dummy.scale.setScalar(Math.max(0.0001, s * (1 + 0.5 * xk)));
      }
      dummy.updateMatrix();
      faceDots.setMatrixAt(i, dummy.matrix);
      col.copy(cIR);
      if (nearHL > 0 && h.d > 0.72) col.lerp(cHot, nearHL);
      if (farHL > 0 && h.d < 0.4) col.lerp(cCold, farHL);
      const dk = Math.max(xk, smooth(ramp(t, T.flach, T.flach + 0.4)));
      if (dk > 0) col.lerp(depthColor(h.d, tmpC), dk);
      col.multiplyScalar(1.6);
      faceDots.setColorAt(i, col);
    }
    faceDots.instanceMatrix.needsUpdate = true;
    faceDots.instanceColor.needsUpdate = true;
  }
  // beams while a burst is in flight
  const beamK = Math.max(
    pop(t, BURST.hook[0], T.du1 + 0.2, 0.2) * hookK,
    pop(t, BURST.main[0], BURST.main[0] + BURST.main[1] + 0.3, 0.2),
  );
  beams.material.opacity = 0.35 * beamK;
  beams.visible = beamK > 0.01 && me.g.visible;
  M.proj.emissiveIntensity = 0.3 + 3 * beamK;
  projGlow.intensity = 3 * beamK;

  // ---- photo dots: a flat grid in one colour (payoff)
  const pd = t >= T.foto3 + 0.3 && photo.visible ? pk : 0;
  photoDots.visible = pd > 0.01;
  if (photoDots.visible) {
    const flatK = smooth(ramp(t, T.flach, T.flach + 0.4));
    for (let i = 0; i < photoHits.length; i++) {
      const h = photoHits[i];
      const k = clamp((t - (T.foto3 + 0.3 + h.seed * 0.6)) / 0.25);
      dummy.position.copy(vProj).lerp(h.p, k);
      // follow the photo (it may wobble): place on its plane
      if (k >= 1) {
        dummy.position
          .copy(photo.position)
          .addScaledVector(vPERP, h.lx)
          .add(tmp.set(0, h.ly, 0))
          .addScaledVector(vDIR, 0.015);
      }
      dummy.scale.setScalar(Math.max(0.0001, k > 0 ? pd * (1 + 0.4 * flatK) : 0));
      dummy.updateMatrix();
      photoDots.setMatrixAt(i, dummy.matrix);
      col.copy(cIR).lerp(cFlat, flatK).multiplyScalar(1.6);
      photoDots.setColorAt(i, col);
    }
    photoDots.instanceMatrix.needsUpdate = true;
    photoDots.instanceColor.needsUpdate = true;
  }

  // ---- IR camera reads the dots back
  const read = pop(t, T.liest - 0.05, T.baut + 0.2, 0.2);
  backRays.material.opacity = 0.4 * read * (0.7 + 0.3 * Math.sin(t * 25));
  backRays.visible = read > 0.01;
  M.camRing.emissiveIntensity = 2.5 * Math.max(read, pop(t, T.kamera, T.baut, 0.2));

  // ---- 3D map: the head turns to glass
  setXray(me.mats, xk);

  // ---- screen
  let st = "lock";
  let sk = t * 1.5;
  if (t < T.foto1 - 0.1) st = "scan";
  else if (t < T.gleich1) st = t >= T.faellt1 ? "nope" : "scan";
  else if (t >= T.liest && t < T.zack) st = "scan";
  else if (t >= T.zack && t < T.foto3) st = "open";
  else if (t >= T.foto3 && t < T.uebrigens) st = t >= T.faellt2 ? "nope" : "scan";
  else if (t >= T.uebrigens && t < T.face)
    st = t >= T.vielleicht ? "open" : t >= T.million ? "nope" : "scan";
  else if (t >= T.face) st = t >= T.finger ? "finger" : "faceid";
  drawScreen(st, sk % 1);

  // ---- ✕ for the photo and the stranger
  const nope1 = pop(t, T.faellt1, T.gleich1 + 0.2);
  const nope2 = pop(t, T.faellt2, T.uebrigens);
  const nope3 = pop(t, T.million, T.zwilling);
  if (nope1 > 0 || nope2 > 0) {
    tmp.copy(photo.position).addScaledVector(vDIR, 0.12);
    showNope(Math.max(nope1, nope2), tmp.x, tmp.y, tmp.z, 0.75);
  } else if (nope3 > 0) {
    tmp
      .copy(vHead)
      .addScaledVector(vDIR, 0.45)
      .addScaledVector(vPERP, -0.35)
      .add(V(0, 0.15, 0));
    showNope(nope3, tmp.x, tmp.y, tmp.z, 0.75);
  } else showNope(0, 0, 0, 0);

  // ---- LED panel: one fact at a time
  if (t >= T.zahl && t < T.auf) {
    showPanel(pop(t, T.zahl, T.auf), "PUNKTE", "30.000", LED.red);
  } else if (t >= T.million && t < T.face) {
    showPanel(pop(t, T.million, T.face), "KOMMT REIN: 1 VON", "1 Mio", LED.green);
  } else {
    showPanel(0);
  }

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
