// #75 Eine Woche ohne Zucker (Format B). The coffee table in the night
// living room is the stage: the hand sweeps the sweets into a box on frame 0,
// the ketchup turns into a sugar cube, 30 cubes pile up, the apple of day 7
// sparkles, orange juice vs cola. Three mini-sets show what happens inside:
// a supermarket checkout whose chocolate bars scream, the brain with its
// dopamine + the liver that makes sugar itself, and the tongue as a pink
// landscape where the taste cells are rebuilt.
import {
  THREE,
  ramp,
  smooth,
  lerp,
  clamp01,
  outBack,
  inBack,
  pop,
  V,
  rng,
  scene,
  real,
  roundedBox,
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
import { TABLE_Y, tex, CAL } from "./set.js";
import { fireflies } from "./environments.js";
import { createHand } from "./hand.js";
import { counter, meter } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS, KASSE, BODY, TONGUE, BRAIN, LIVER } from "./beats.js";

highlights(HIGHLIGHTS);

const TY = TABLE_Y;
const mesh = (geo, mat, parent = scene, shadow = true) => {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = shadow;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};
const grp = (parent = scene) => {
  const g = new THREE.Group();
  parent.add(g);
  return g;
};
const label = (w, h, draw) =>
  new THREE.MeshStandardMaterial({ map: tex(w, h, draw), roughness: 0.5 });
// parabola between two points (k 0..1), peak `hgt` above the higher end
const arc = (a, b, k, hgt) =>
  V(lerp(a[0], b[0], k), lerp(a[1], b[1], k) + Math.sin(Math.PI * k) * hgt, lerp(a[2], b[2], k));

// ---------------------------------------------------------------- props on the table
function makeChoc() {
  const g = new THREE.Group();
  const wrap = mesh(
    roundedBox(0.16, 0.014, 0.07, 0.005),
    real.gloss(0x5a2d8c, { roughness: 0.35 }),
    g,
  );
  wrap.position.y = 0.007;
  const lab = mesh(
    new THREE.PlaneGeometry(0.1, 0.05),
    label(256, 128, (c, w, h) => {
      c.fillStyle = "#5a2d8c";
      c.fillRect(0, 0, w, h);
      c.fillStyle = "#fff";
      c.font = "bold 52px Montserrat, sans-serif";
      c.textAlign = "center";
      c.fillText("SCHOKO", w / 2, 82);
      c.fillStyle = "#f2c14e";
      c.fillRect(0, 100, w, 8);
    }),
    g,
    false,
  );
  lab.rotation.x = -Math.PI / 2;
  lab.position.set(0.02, 0.0145, 0);
  // torn end: foil + two chocolate squares
  const foil = mesh(
    roundedBox(0.035, 0.012, 0.068, 0.004),
    real.metal(0xd8dce0, { roughness: 0.25 }),
    g,
  );
  foil.position.set(-0.075, 0.007, 0);
  for (const z of [-0.016, 0.016]) {
    const sq = mesh(
      roundedBox(0.03, 0.012, 0.03, 0.004),
      real.gloss(0x4a2614, { roughness: 0.4 }),
      g,
    );
    sq.position.set(-0.098, 0.01, z);
  }
  return g;
}
function makeCan() {
  const g = new THREE.Group();
  const body = mesh(
    new THREE.CylinderGeometry(0.033, 0.033, 0.105, 48),
    new THREE.MeshPhysicalMaterial({
      map: tex(512, 256, (c, w, h) => {
        c.fillStyle = "#c8102e";
        c.fillRect(0, 0, w, h);
        c.strokeStyle = "#fff";
        c.lineWidth = 10;
        c.beginPath();
        c.moveTo(0, 170);
        c.bezierCurveTo(130, 120, 260, 220, 512, 150);
        c.stroke();
        c.fillStyle = "#fff";
        c.font = "italic bold 70px Montserrat, sans-serif";
        c.fillText("COLA", 160, 110);
        c.fillText("COLA", 420, 110);
      }),
      roughness: 0.25,
      metalness: 0.3,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    }),
    g,
  );
  body.position.y = 0.06;
  const alu = real.metal(0xd4d7dc, { roughness: 0.25 });
  const top = mesh(new THREE.CylinderGeometry(0.028, 0.033, 0.01, 48), alu, g);
  top.position.y = 0.117;
  const bot = mesh(new THREE.CylinderGeometry(0.033, 0.027, 0.008, 48), alu, g);
  bot.position.y = 0.004;
  const tab = mesh(roundedBox(0.012, 0.002, 0.022, 0.001), alu, g);
  tab.position.set(0, 0.123, 0.006);
  return g;
}
function makeGummy() {
  const g = new THREE.Group();
  const bag = mesh(
    roundedBox(0.11, 0.15, 0.03, 0.014, 6),
    new THREE.MeshPhysicalMaterial({
      map: tex(256, 360, (c, w, h) => {
        const gr = c.createLinearGradient(0, 0, 0, h);
        gr.addColorStop(0, "#ff4f9a");
        gr.addColorStop(1, "#ff8a3d");
        c.fillStyle = gr;
        c.fillRect(0, 0, w, h);
        c.fillStyle = "#fff";
        c.font = "bold 50px Montserrat, sans-serif";
        c.textAlign = "center";
        c.fillText("GUMMI", w / 2, 90);
        c.fillText("BÄREN", w / 2, 145);
        const cols = ["#ffd23f", "#3dd16b", "#ff3b3b", "#ffffff", "#ff9a1f"];
        for (let i = 0; i < 5; i++) {
          c.fillStyle = cols[i];
          const x = 40 + i * 44;
          c.beginPath();
          c.arc(x, 230, 16, 0, Math.PI * 2);
          c.arc(x, 262, 20, 0, Math.PI * 2);
          c.fill();
        }
      }),
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
    }),
    g,
  );
  bag.position.y = 0.075;
  return g;
}
function cubeGeo(s) {
  return roundedBox(s, s, s, s * 0.12, 3);
}
const sugarMat = real.plastic(0xfbfaf6, {
  emissive: 0x3a3836,
  roughness: 0.75,
  clearcoat: 0.1,
  sheen: 0.6,
  sheenColor: new THREE.Color(0xffffff),
});

const choc = makeChoc();
const can = makeCan();
const gummy = makeGummy();
scene.add(choc, can, gummy);
const CHOC0 = [-0.1, TY, 0.14];
const GUM0 = [-0.2, TY, -0.1];
const CAN0 = [0.03, TY, -0.2];
const BOXP = [0.38, TY, 0.06];

// cardboard box with four flaps, a marker label and tape
const box = grp();
box.position.set(...BOXP);
const BW = 0.3;
const BH = 0.2;
const BD = 0.24;
const card = real.plastic(0xc29561, { roughness: 0.9, clearcoat: 0 });
const cardIn = real.plastic(0xa77a49, { roughness: 0.95, clearcoat: 0, side: THREE.DoubleSide });
{
  const wall = (w, h, d, x, y, z) => {
    const m = mesh(new THREE.BoxGeometry(w, h, d), card, box);
    m.position.set(x, y, z);
    return m;
  };
  wall(BW, 0.006, BD, 0, 0.003, 0);
  wall(BW, BH, 0.006, 0, BH / 2, BD / 2);
  wall(BW, BH, 0.006, 0, BH / 2, -BD / 2);
  wall(0.006, BH, BD, BW / 2, BH / 2, 0);
  wall(0.006, BH, BD, -BW / 2, BH / 2, 0);
  const lab = mesh(
    new THREE.PlaneGeometry(0.22, 0.14),
    label(512, 320, (c, w, h) => {
      c.fillStyle = "#c29561";
      c.fillRect(0, 0, w, h);
      c.fillStyle = "#f4efe4";
      c.fillRect(30, 20, w - 60, h - 40);
      c.fillStyle = "#d1202f";
      c.font = "bold 120px 'Permanent Marker', Montserrat, sans-serif";
      c.textAlign = "center";
      c.fillText("7 TAGE", w / 2, 150);
      c.font = "bold 62px Montserrat, sans-serif";
      c.fillStyle = "#222";
      c.fillText("FINGER WEG!", w / 2, 250);
    }),
    box,
    false,
  );
  lab.position.set(0, BH * 0.5, BD / 2 + 0.004);
}
// flaps: hinge groups on the four top edges
const flaps = [];
for (const [axis, sign, len, wid] of [
  ["x", 1, BD / 2, BW],
  ["x", -1, BD / 2, BW],
  ["z", 1, BW / 2, BD],
  ["z", -1, BW / 2, BD],
]) {
  const h = grp(box);
  if (axis === "x") h.position.set(0, BH, (sign * BD) / 2);
  else h.position.set((sign * BW) / 2, BH, 0);
  const f = mesh(
    axis === "x" ? new THREE.BoxGeometry(wid, 0.005, len) : new THREE.BoxGeometry(len, 0.005, wid),
    [cardIn, cardIn, card, cardIn, cardIn, cardIn],
    h,
  );
  if (axis === "x") f.position.z = (-sign * len) / 2;
  else f.position.x = (-sign * len) / 2;
  flaps.push({ h, axis, sign });
}
const tape = mesh(
  roundedBox(0.05, 0.003, BD + 0.02, 0.001),
  real.plastic(0xd9b37a, { roughness: 0.3, clearcoat: 0.8, transparent: true, opacity: 0.85 }),
  box,
  false,
);
tape.position.y = BH + 0.007;

// ketchup squeeze bottle (stands on its white cap) + spoon
const ketchup = grp();
const KET0 = [-0.42, TY, -0.12];
{
  const pts = [];
  for (let i = 0; i <= 40; i++) {
    const y = (i / 40) * 0.17;
    const r =
      0.036 * Math.pow(Math.sin(Math.min(1, (y / 0.17) * 1.04) * Math.PI * 0.5 + 0.35), 0.5);
    pts.push(
      new THREE.Vector2(
        Math.min(0.037, r * (y > 0.155 ? Math.cos(((y - 0.155) / 0.015) * 1.4) : 1)),
        y,
      ),
    );
  }
  pts.push(new THREE.Vector2(0.0, 0.17));
  const body = mesh(
    new THREE.LatheGeometry(pts, 64),
    new THREE.MeshPhysicalMaterial({
      map: tex(512, 256, (c, w, h) => {
        c.fillStyle = "#b3141b";
        c.fillRect(0, 0, w, h);
        c.fillStyle = "#f6f1e6";
        c.fillRect(0, 100, w, 90);
        c.fillStyle = "#b3141b";
        c.font = "bold 58px Montserrat, sans-serif";
        c.fillText("KETCHUP", 20, 166);
        c.fillText("KETCHUP", 280, 166);
      }),
      roughness: 0.18,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
    }),
    ketchup,
  );
  body.position.y = 0.035;
  const cap = mesh(
    new THREE.CylinderGeometry(0.03, 0.034, 0.036, 48),
    real.plastic(0xf3f1ec),
    ketchup,
  );
  cap.position.y = 0.018;
  ketchup.position.set(...KET0);
}
const SPOON = [-0.24, TY, 0.12];
const spoon = grp();
spoon.position.set(...SPOON);
{
  const steel = real.metal(0xd8dce2, { roughness: 0.18 });
  const bowl = mesh(
    new THREE.SphereGeometry(0.026, 48, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    steel,
    spoon,
  );
  bowl.scale.set(1, 0.38, 1.4);
  bowl.position.y = 0.011;
  bowl.material = steel.clone();
  bowl.material.side = THREE.DoubleSide;
  const handle = mesh(roundedBox(0.011, 0.004, 0.12, 0.002), steel, spoon);
  handle.position.set(0.0, 0.012, 0.09);
  handle.rotation.x = -0.12;
}
const blob = mesh(
  new THREE.SphereGeometry(0.022, 48, 24),
  real.gloss(0xa8121a, { roughness: 0.15 }),
);
const stream = mesh(
  new THREE.CylinderGeometry(0.004, 0.005, 1, 16),
  real.gloss(0xa8121a, { roughness: 0.15 }),
  scene,
  false,
);
const spoonCube = mesh(cubeGeo(0.024), sugarMat);
spoonCube.position.set(SPOON[0], TY + 0.026, SPOON[2]);

// 30 sugar cubes piling up in the middle of the table
const PILE = [];
{
  const s = 0.038;
  const layers = [
    [5, 3],
    [4, 2],
    [3, 2],
    [1, 1],
  ];
  layers.forEach(([nx, nz], ly) => {
    for (let iz = 0; iz < nz; iz++)
      for (let ix = 0; ix < nx; ix++)
        PILE.push([(ix - (nx - 1) / 2) * s, TY + s / 2 + ly * s, 0.04 + (iz - (nz - 1) / 2) * s]);
  });
}
const pileGeo = cubeGeo(0.036);
const pile = PILE.map(() => mesh(pileGeo, sugarMat));
const pr = rng(30);
const pileRot = PILE.map(() => (pr() - 0.5) * 0.25);
const PILE_T0 = T.rate + 0.3;
const pileAt = (i) => PILE_T0 + ((T.dreissig - PILE_T0) * (i + 1)) / PILE.length - 0.12;

// day 7: apple; Übrigens: orange juice + cola with sugar columns
const apple = grp();
const APPLE0 = [0.08, TY, 0.14];
{
  const geo = new THREE.SphereGeometry(0.042, 64, 48);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const r = Math.hypot(x, z) / 0.042;
    const dip = Math.exp(-r * r * 9) * 0.012 * Math.sign(y);
    p.setY(i, y * 0.88 - dip);
    const s = 1 + 0.05 * Math.sin(Math.atan2(z, x) * 5) * (1 - Math.abs(y) / 0.042);
    p.setX(i, x * s);
    p.setZ(i, z * s);
  }
  geo.computeVertexNormals();
  const skin = new THREE.MeshPhysicalMaterial({
    map: tex(256, 256, (c, w, h) => {
      const gr = c.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, "#9bbf3a");
      gr.addColorStop(0.35, "#d8362e");
      gr.addColorStop(1, "#b81f23");
      c.fillStyle = gr;
      c.fillRect(0, 0, w, h);
      const r = rng(4);
      for (let i = 0; i < 260; i++) {
        c.fillStyle = `rgba(255,230,160,${0.25 + r() * 0.3})`;
        c.fillRect(r() * w, r() * h, 2, 2);
      }
    }),
    roughness: 0.35,
    clearcoat: 0.9,
    clearcoatRoughness: 0.15,
  });
  const a = mesh(geo, skin, apple);
  a.position.y = 0.037;
  const stem = mesh(
    new THREE.CylinderGeometry(0.0025, 0.002, 0.022, 8),
    real.wood(0x5a3a1c),
    apple,
  );
  stem.position.set(0.002, 0.078, 0);
  stem.rotation.z = -0.25;
  const leaf = mesh(
    new THREE.SphereGeometry(0.012, 24, 12),
    real.plastic(0x4f9a35, { roughness: 0.5 }),
    apple,
  );
  leaf.scale.set(1.4, 0.15, 0.6);
  leaf.position.set(0.013, 0.08, 0);
  leaf.rotation.z = 0.4;
}
const OJ = [-0.13, TY, 0.12];
const CAN2 = [0.13, TY, 0.12];
const oj = grp();
{
  const glass = mesh(
    new THREE.CylinderGeometry(0.036, 0.032, 0.12, 48, 1, true),
    real.glass(0xeef6ff, { opacity: 0.22, side: THREE.DoubleSide }),
    oj,
    false,
  );
  glass.position.y = 0.06;
  const juice = mesh(
    new THREE.CylinderGeometry(0.033, 0.03, 0.095, 48),
    new THREE.MeshPhysicalMaterial({
      color: 0xffa31a,
      roughness: 0.2,
      clearcoat: 1,
      emissive: 0x6a2c00,
      emissiveIntensity: 0.25,
    }),
    oj,
  );
  juice.position.y = 0.05;
  const base = mesh(
    new THREE.CylinderGeometry(0.032, 0.032, 0.006, 48),
    real.glass(0xeef6ff, { opacity: 0.4 }),
    oj,
    false,
  );
  base.position.y = 0.003;
  oj.position.set(...OJ);
}
const can2 = makeCan();
scene.add(can2);
can2.position.set(...CAN2);
can2.rotation.y = -0.6;
const COLS = [
  { x: OJ[0], n: 7 },
  { x: CAN2[0], n: 9 },
];
const colGeo = cubeGeo(0.03);
const colCubes = COLS.map((c) => Array.from({ length: c.n }, () => mesh(colGeo, sugarMat)));

// the calendar: 7 days, crossed out one by one
{
  const m = mesh(
    new THREE.PlaneGeometry(0.46, 0.58),
    label(460, 580, (c, w, h) => {
      c.fillStyle = "#faf7f0";
      c.fillRect(0, 0, w, h);
      c.fillStyle = "#e0573f";
      c.fillRect(0, 0, w, 110);
      c.fillStyle = "#fff";
      c.font = "bold 46px Montserrat, sans-serif";
      c.textAlign = "center";
      c.fillText("OHNE ZUCKER", w / 2, 72);
      const days = ["MO", "DI", "MI", "DO", "FR", "SA", "SO"];
      c.font = "bold 40px Montserrat, sans-serif";
      days.forEach((d, i) => {
        const x = 30 + (i % 4) * 102;
        const y = 140 + Math.floor(i / 4) * 210;
        c.strokeStyle = "#cfc6b8";
        c.lineWidth = 3;
        c.strokeRect(x, y, 92, 180);
        c.fillStyle = "#333";
        c.fillText(d, x + 46, y + 50);
        c.font = "bold 64px Montserrat, sans-serif";
        c.fillText(String(i + 1), x + 46, y + 130);
        c.font = "bold 40px Montserrat, sans-serif";
      });
    }),
    scene,
    false,
  );
  m.position.set(CAL[0], CAL[1], CAL[2] + 0.004);
}
const calX = [];
const xMat = new THREE.MeshBasicMaterial({ color: 0xe0202f });
for (let i = 0; i < 7; i++) {
  const g = grp();
  const cx = CAL[0] - 0.23 + (30 + (i % 4) * 102 + 46) / 1000;
  const cy = CAL[1] + 0.29 - (140 + Math.floor(i / 4) * 210 + 100) / 1000;
  g.position.set(cx, cy, CAL[2] + 0.008);
  for (const r of [0.7, -0.7]) {
    const b = mesh(new THREE.BoxGeometry(0.012, 0.15, 0.002), xMat, g, false);
    b.rotation.z = r;
  }
  calX.push(g);
}
const dayAt = [
  T.schon + 0.2,
  T.ab + 0.1,
  T.drei + 0.1,
  T.viele + 0.1,
  T.viele + 0.3,
  T.viele + 0.5,
  T.sieben + 0.05,
];

// ---------------------------------------------------------------- mini-set 1: checkout
const kasse = grp();
kasse.position.set(...KASSE);
const bars = [];
let flyBar;
{
  const floorM = mesh(
    new THREE.PlaneGeometry(8, 8),
    real.ceramic(0xffffff, {
      roughness: 0.35,
      map: tex(
        512,
        512,
        (c, w, h) => {
          c.fillStyle = "#d9d4cb";
          c.fillRect(0, 0, w, h);
          c.strokeStyle = "#b9b2a6";
          c.lineWidth = 4;
          for (let i = 0; i <= 8; i++) {
            c.beginPath();
            c.moveTo((i * w) / 8, 0);
            c.lineTo((i * w) / 8, h);
            c.moveTo(0, (i * h) / 8);
            c.lineTo(w, (i * h) / 8);
            c.stroke();
          }
        },
        4,
        4,
      ),
    }),
    kasse,
    false,
  );
  floorM.rotation.x = -Math.PI / 2;
  const back = mesh(
    new THREE.PlaneGeometry(8, 4),
    real.plastic(0xeeeae2, { roughness: 0.9 }),
    kasse,
    false,
  );
  back.position.set(0, 2, -2.2);
  // aisle shelves full of products along the back wall
  const r = rng(52);
  const cols = [0xe94b3c, 0x2f80ed, 0xf2c94c, 0x27ae60, 0xffffff, 0xf2994a, 0x9b51e0];
  for (let s = 0; s < 4; s++) {
    const sh = mesh(
      roundedBox(5, 0.03, 0.45, 0.01),
      real.metal(0xbfc4c9, { roughness: 0.4 }),
      kasse,
    );
    sh.position.set(0, 0.25 + s * 0.48, -1.95);
    for (let i = 0; i < 26; i++) {
      const w = 0.12 + r() * 0.1;
      const h = 0.18 + r() * 0.2;
      const p = mesh(
        roundedBox(w, h, 0.18, 0.015),
        real.plastic(cols[Math.floor(r() * cols.length)], { roughness: 0.5 }),
        kasse,
      );
      p.position.set(-2.4 + i * 0.19, 0.265 + s * 0.48 + h / 2, -1.9);
    }
  }
  // ceiling light strips
  for (const x of [-1.5, 0, 1.5]) {
    const l = mesh(
      roundedBox(1.0, 0.04, 0.12, 0.01),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
      kasse,
      false,
    );
    l.position.set(x, 2.6, -0.6);
  }
  const fl = new THREE.PointLight(0xfff6ea, 6, 7, 1.2);
  fl.position.set(0.3, 2.3, 1.2);
  kasse.add(fl);
  // candy rack
  const black = real.metal(0x26282c, { roughness: 0.45 });
  for (const x of [-0.52, 0.52]) {
    const p = mesh(roundedBox(0.03, 1.55, 0.3, 0.01), black, kasse);
    p.position.set(x, 0.775, 0);
  }
  const wrapCols = [0x5a2d8c, 0xc8102e, 0xf2b705, 0x1e5bd8, 0xf26b1d, 0x1f9d55, 0x8b4513, 0xe84393];
  for (let s = 0; s < 5; s++) {
    const y = 0.35 + s * 0.27;
    const sh = mesh(roundedBox(1.04, 0.02, 0.3, 0.008), black, kasse);
    sh.position.set(0, y, 0);
    const lip = mesh(roundedBox(1.04, 0.05, 0.01, 0.004), real.plastic(0xffd23f), kasse);
    lip.position.set(0, y + 0.02, 0.15);
    for (let i = 0; i < 7; i++) {
      const g = grp(kasse);
      const col = wrapCols[(i + s * 3) % wrapCols.length];
      const mat = real.gloss(col, { roughness: 0.3, emissive: 0xff4f9a, emissiveIntensity: 0 });
      const bar = mesh(roundedBox(0.12, 0.04, 0.02, 0.008), mat, g);
      bar.position.y = 0.04;
      const stripe = mesh(
        roundedBox(0.122, 0.012, 0.021, 0.004),
        real.gloss(0xffffff, { roughness: 0.3 }),
        g,
        false,
      );
      stripe.position.y = 0.045;
      g.position.set(-0.42 + i * 0.14, y + 0.012, 0.03);
      g.rotation.x = -0.35;
      bars.push({ g, mat, ph: (i * 1.7 + s * 2.3) % 6.28, base: y + 0.012 });
    }
  }
  flyBar = grp(kasse);
  const fm = real.gloss(0x5a2d8c, { roughness: 0.3, emissive: 0xff4f9a, emissiveIntensity: 0 });
  mesh(roundedBox(0.12, 0.04, 0.02, 0.008), fm, flyBar);
  const fs = mesh(roundedBox(0.122, 0.012, 0.021, 0.004), real.gloss(0xffffff), flyBar, false);
  fs.position.y = 0.005;
  flyBar.userData.mat = fm;
  // conveyor + counter in front
  const counterBody = mesh(
    roundedBox(1.8, 0.82, 0.55, 0.03),
    real.plastic(0x9aa3ad, { roughness: 0.5 }),
    kasse,
  );
  counterBody.position.set(-0.9, 0.41, 1.0);
  const belt = mesh(roundedBox(1.7, 0.03, 0.45, 0.012), real.rubber(0x1d1f22), kasse);
  belt.position.set(-0.9, 0.835, 1.0);
  const sign = mesh(
    new THREE.PlaneGeometry(0.36, 0.2),
    label(360, 200, (c, w, h) => {
      c.fillStyle = "#1e5bd8";
      c.fillRect(0, 0, w, h);
      c.fillStyle = "#fff";
      c.font = "bold 90px Montserrat, sans-serif";
      c.textAlign = "center";
      c.fillText("KASSE 3", w / 2, 132);
    }),
    kasse,
    false,
  );
  sign.position.set(0.9, 1.75, -0.2);
  const pole = mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.65, 12), black, kasse);
  pole.position.set(0.9, 0.82, -0.22);
}

// ---------------------------------------------------------------- mini-set 2: brain + liver
const body = grp();
body.position.set(...BODY);
{
  const bd = mesh(
    new THREE.PlaneGeometry(14, 9),
    new THREE.MeshBasicMaterial({
      map: tex(512, 512, (c, w, h) => {
        const g = c.createRadialGradient(w / 2, h * 0.45, 10, w / 2, h / 2, w * 0.6);
        g.addColorStop(0, "#4a1d63");
        g.addColorStop(0.5, "#24103a");
        g.addColorStop(1, "#0a0612");
        c.fillStyle = g;
        c.fillRect(0, 0, w, h);
      }),
      fog: false,
    }),
    body,
    false,
  );
  bd.position.set(0, 2, -3.2);
  const fl = mesh(
    new THREE.CircleGeometry(6, 64),
    real.plastic(0x120a1a, { roughness: 0.7, clearcoat: 0 }),
    body,
    false,
  );
  fl.rotation.x = -Math.PI / 2;
  const key = new THREE.SpotLight(0xffd9e6, 14, 8, 0.6, 0.6, 1.2);
  key.position.set(1.2, 3.2, 2.2);
  key.target.position.set(0, 1.2, 0);
  body.add(key, key.target);
  const rim = new THREE.PointLight(0x58d6ff, 5, 5, 1.5);
  rim.position.set(-1.0, 2.6, -1.6);
  body.add(rim);
}
fireflies(60, {
  area: [BODY[0] - 2.2, BODY[0] + 2.2, 0.2, 2.8, -1.8, 0.8],
  color: 0xd9a0ff,
  seed: 6,
  size: 0.012,
});
const brainMat = new THREE.MeshPhysicalMaterial({
  color: 0xe7a1ab,
  roughness: 0.42,
  clearcoat: 0.6,
  clearcoatRoughness: 0.3,
  sheen: 0.5,
  sheenColor: new THREE.Color(0xffd0d8),
  emissive: 0xffb347,
  emissiveIntensity: 0,
});
const brain = grp();
brain.position.set(...BRAIN);
const PINK = new THREE.Color(0xe7a1ab);
const GREY = new THREE.Color(0x8f8589);
{
  const geo = new THREE.SphereGeometry(0.5, 160, 120);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const v = V(p.getX(i), p.getY(i), p.getZ(i)).normalize();
    let r = 0.5;
    const ridge = Math.abs(
      Math.sin(v.x * 12 + 2.5 * Math.sin(v.y * 8 + v.z * 6) + 1.8 * Math.sin(v.z * 9 - v.y * 5)),
    );
    r += 0.03 * (Math.sqrt(ridge) - 0.7);
    r += 0.006 * Math.sin(v.z * 29 + v.x * 11);
    r -= 0.07 * Math.exp(-Math.pow(v.z / 0.07, 2)) * Math.max(0, v.y + 0.2);
    const x = v.x * r * 1.18;
    const y = v.y * r * (v.y < 0 ? 0.72 : 0.84);
    const z = v.z * r * 0.92;
    p.setXYZ(i, x, y - (v.x > 0.3 && v.y < 0 ? 0.04 * (v.x - 0.3) : 0), z);
  }
  geo.computeVertexNormals();
  mesh(geo, brainMat, brain);
  const cg = new THREE.SphereGeometry(0.18, 96, 64);
  const cp = cg.attributes.position;
  for (let i = 0; i < cp.count; i++) {
    const y = cp.getY(i);
    const s = 1 + 0.04 * Math.sin(y * 120);
    cp.setXYZ(i, cp.getX(i) * s * 1.2, y * 0.75, cp.getZ(i) * s * 1.5);
  }
  cg.computeVertexNormals();
  const cb = mesh(cg, brainMat, brain);
  cb.position.set(0.36, -0.27, 0);
  const stem = mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.42, 32), brainMat, brain);
  stem.position.set(0.22, -0.48, 0);
  stem.rotation.z = 0.35;
}
// dopamine sparks: three bursts
const NSP = 96;
const spark = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.02, 1),
  new THREE.MeshBasicMaterial({ color: 0xffd36b }),
  NSP,
);
spark.frustumCulled = false;
spark.userData.noAO = true;
scene.add(spark);
const sr = rng(77);
const sparkDir = Array.from({ length: NSP }, () => {
  const v = V(sr() - 0.5, sr() - 0.35, sr() - 0.5).normalize();
  return [v, 0.6 + sr() * 0.8];
});
const bursts = [T.belohnung + 0.12, T.dopamin - 0.35, T.dopamin + 0.25];
const sugarFly = mesh(cubeGeo(0.09), sugarMat);
// liver + glucose stream
const liver = grp();
liver.position.set(...LIVER);
{
  const geo = new THREE.SphereGeometry(0.5, 128, 96);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const k = (x + 0.5) / 1; // 0 right lobe (big) … 1 left tip
    p.setXYZ(i, x * 1.15, y * (0.62 - 0.38 * k), z * 0.62);
  }
  geo.computeVertexNormals();
  mesh(geo, real.gloss(0x7d1f2c, { roughness: 0.32, clearcoat: 0.8 }), liver);
  const gb = mesh(
    new THREE.SphereGeometry(0.06, 32, 24),
    real.gloss(0x5f8a3a, { roughness: 0.3 }),
    liver,
  );
  gb.scale.set(1, 0.7, 1.4);
  gb.position.set(-0.05, -0.17, 0.18);
}
const glucoseCurve = new THREE.CatmullRomCurve3([
  V(LIVER[0] - 0.1, LIVER[1] + 0.18, LIVER[2] + 0.1),
  V(LIVER[0] + 0.3, LIVER[1] + 0.45, LIVER[2] + 0.35),
  V(BRAIN[0] - 0.05, BRAIN[1] - 0.55, 0.3),
  V(BRAIN[0] - 0.1, BRAIN[1] - 0.25, 0.12),
]);
const NG = 34;
const glucose = new THREE.InstancedMesh(
  new THREE.CylinderGeometry(0.035, 0.035, 0.014, 6),
  new THREE.MeshStandardMaterial({ color: 0xfff1c2, emissive: 0xffd36b, emissiveIntensity: 1.3 }),
  NG,
);
glucose.frustumCulled = false;
glucose.userData.noAO = true;
scene.add(glucose);

// ---------------------------------------------------------------- mini-set 3: the tongue
const tongue = grp();
tongue.position.set(...TONGUE);
const tH = (x, z) =>
  -0.05 * Math.exp(-Math.pow(x / 0.28, 2)) -
  0.5 * Math.pow(Math.max(0, Math.abs(x) - 1.3), 2) -
  0.25 * Math.pow(Math.max(0, z - 1.6), 2) +
  0.012 * Math.sin(x * 7 + z * 3) * Math.sin(z * 5 - x * 2);
const papMat = new THREE.MeshPhysicalMaterial({
  color: 0xdc7480,
  roughness: 0.5,
  clearcoat: 0.7,
  clearcoatRoughness: 0.25,
  sheen: 0.4,
  sheenColor: new THREE.Color(0xffc0c8),
});
const FUN = [];
const budMat = new THREE.MeshStandardMaterial({
  color: 0xffe9f0,
  emissive: 0xff6fa8,
  emissiveIntensity: 0,
});
let buds;
{
  const geo = new THREE.PlaneGeometry(3.6, 5, 200, 260).rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setY(i, tH(p.getX(i), p.getZ(i)));
  geo.computeVertexNormals();
  const surf = mesh(geo, papMat, tongue, false);
  surf.receiveShadow = true;
  // filiform papillae
  const r = rng(90);
  const NF = 2600;
  const fil = new THREE.InstancedMesh(new THREE.ConeGeometry(0.009, 0.03, 8), papMat, NF);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  for (let i = 0; i < NF; i++) {
    const x = (r() - 0.5) * 3.0;
    const z = (r() - 0.5) * 4.6;
    q.setFromEuler(new THREE.Euler((r() - 0.5) * 0.4, 0, (r() - 0.5) * 0.4));
    const s = 0.7 + r() * 0.6;
    m4.compose(V(x, tH(x, z) + 0.012 * s, z), q, V(s, s, s));
    fil.setMatrixAt(i, m4);
  }
  fil.castShadow = true;
  fil.receiveShadow = true;
  tongue.add(fil);
  // fungiform papillae (the round red ones) + a taste bud on each
  FUN.push([0.1, 0.1]);
  for (let i = 0; i < 70; i++) FUN.push([(r() - 0.5) * 2.4, (r() - 0.5) * 4.2]);
  const fun = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.035, 32, 20),
    new THREE.MeshPhysicalMaterial({
      color: 0xe0485e,
      roughness: 0.4,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2,
    }),
    FUN.length,
  );
  FUN.forEach(([x, z], i) => {
    m4.compose(V(x, tH(x, z) + 0.012, z), q.identity(), V(1, 0.75, 1));
    fun.setMatrixAt(i, m4);
  });
  fun.castShadow = true;
  tongue.add(fun);
  buds = new THREE.InstancedMesh(new THREE.SphereGeometry(0.014, 20, 14), budMat, FUN.length);
  buds.frustumCulled = false;
  buds.userData.noAO = true;
  tongue.add(buds);
  // palate arch + throat + uvula
  const arch = mesh(
    new THREE.CylinderGeometry(2.3, 2.3, 5.4, 64, 1, true, -Math.PI / 2, Math.PI),
    new THREE.MeshPhysicalMaterial({
      color: 0x7a2232,
      roughness: 0.55,
      clearcoat: 0.5,
      side: THREE.BackSide,
    }),
    tongue,
    false,
  );
  arch.rotation.x = Math.PI / 2;
  arch.position.set(0, -0.25, -0.2);
  const throat = mesh(
    new THREE.PlaneGeometry(5, 3),
    new THREE.MeshBasicMaterial({
      map: tex(256, 256, (c, w, h) => {
        const g = c.createRadialGradient(w / 2, h * 0.55, 5, w / 2, h / 2, w * 0.55);
        g.addColorStop(0, "#050102");
        g.addColorStop(0.6, "#3a0c14");
        g.addColorStop(1, "#6e1a28");
        c.fillStyle = g;
        c.fillRect(0, 0, w, h);
      }),
      fog: false,
    }),
    tongue,
    false,
  );
  throat.position.set(0, 0.9, -2.6);
  const uv = mesh(new THREE.SphereGeometry(0.14, 48, 32), papMat, tongue);
  uv.scale.set(1, 2.2, 1);
  uv.position.set(0, 1.45, -2.2);
  const pk = new THREE.PointLight(0xff9db0, 5, 6, 1.4);
  pk.position.set(0.4, 1.3, 1.2);
  tongue.add(pk);
  const wk = new THREE.SpotLight(0xffffff, 10, 8, 0.7, 0.6, 1.2);
  wk.position.set(-0.8, 1.6, 2.4);
  wk.target.position.set(0, 0, -0.5);
  tongue.add(wk, wk.target);
}

// ---------------------------------------------------------------- the hand
const hand = createHand({ scale: 0.21, skin: 0xe6ad8a, sleeve: 0x2f3440 });
const H = Math.PI; // fingers pointing away from the camera (-z)
const HAND_KEYS = [
  { t: -0.5, pos: [-0.6, 0.53, 0.42], rot: [0.12, H, 0], pose: "open" },
  { t: 0.0, pos: [-0.22, 0.5, 0.34], rot: [0.12, H - 0.15, 0], pose: "open" },
  { t: 0.5, pos: [0.06, 0.5, 0.3], rot: [0.1, H - 0.3, 0], pose: "open" },
  { t: 0.92, pos: [0.36, 0.75, 0.24], rot: [0.35, H, 0], pose: "open" },
  { t: 1.12, pos: [0.37, 0.69, 0.22], rot: [0.45, H, 0], pose: "press" },
  { t: 1.32, pos: [0.6, 0.85, 0.5], rot: [0.3, H, 0], pose: "open", out: true },
  // day 7: grab the apple and lift it
  { t: T.apfel - 0.25, pos: [0.36, 0.6, 0.42], rot: [0.25, H + 0.4, 0], pose: "open" },
  { t: T.apfel + 0.3, pos: [0.1, 0.5, 0.29], rot: [0.3, H + 0.15, 0], pose: "open" },
  { t: T.apfel + 0.55, pos: [0.1, 0.5, 0.29], rot: [0.3, H + 0.15, 0], pose: "grab" },
  { t: T.suess - 0.05, pos: [0.13, 0.62, 0.34], rot: [0.15, H + 0.15, 0], pose: "grab" },
  { t: T.fakt - 0.1, pos: [0.15, 0.64, 0.36], rot: [0.1, H + 0.15, 0], pose: "grab" },
  { t: T.fakt + 0.25, pos: [0.6, 0.75, 0.6], rot: [0.1, H + 0.3, 0], pose: "grab", out: true },
];
const APPLE_OFF = [0.0, 0.0, -0.15]; // apple centre relative to the wrist while held

const applyCamera = shotCamera(shots, 1);
const tmpA = V(0, 0, 0);

function setFlaps(k) {
  // k 0 = wide open, 1 = shut
  for (const f of flaps) {
    const open = -2.1 * (1 - k);
    if (f.axis === "x") f.h.rotation.x = f.sign * -open;
    else f.h.rotation.z = f.sign * open;
  }
}

// ---------------------------------------------------------------- render
function renderAt(t) {
  hand.track(t, HAND_KEYS);

  // --- hook: sweets fly into the box, the lid slams, the box rattles
  const fly = (obj, a, k, ry, spin) => {
    const kk = smooth(clamp01(k));
    obj.visible = k < 1;
    obj.position.copy(arc(a, [BOXP[0], TY + 0.12, BOXP[2]], kk, 0.22));
    obj.rotation.set(spin * kk * 6, ry + spin * kk * 3, spin * kk * 2);
  };
  fly(choc, CHOC0, ramp(t, -0.25, 0.38), 0.3, 1);
  fly(gummy, GUM0, ramp(t, -0.08, 0.6), -0.2, -1);
  fly(can, CAN0, ramp(t, 0.12, 0.82), 0, 0.7);
  // Schoki / Cola pop out of the box with an ✕
  const outK = (a, b) => outBack(clamp01((t - a) / 0.25)) * (1 - inBack(clamp01((t - b) / 0.2)));
  const cK = outK(T.schoki, T.cola - 0.15);
  if (cK > 0.001) {
    choc.visible = true;
    choc.position.set(BOXP[0], TY + BH + 0.02 + 0.12 * cK, BOXP[2]);
    choc.rotation.set(Math.PI / 2 - 0.25, Math.sin(t * 3) * 0.3, 0);
    choc.scale.setScalar(Math.max(0.01, cK) * 1.3);
  } else choc.scale.setScalar(1);
  const kK = outK(T.cola, T.ketchup - 0.15);
  if (kK > 0.001) {
    can.visible = true;
    can.position.set(BOXP[0], TY + BH - 0.04 + 0.12 * kK, BOXP[2]);
    can.rotation.set(0, t * 2, 0.15);
    can.scale.setScalar(Math.max(0.01, kK) * 1.2);
  } else can.scale.setScalar(1);
  const shut = smooth(ramp(t, 0.92, 1.12));
  setFlaps(
    Math.max(shut, t >= T.schoki - 0.1 && t < T.ketchup - 0.1 ? 0 : 0) *
      (1 - pop(t, T.schoki - 0.1, T.ketchup - 0.1, 0.12)),
  );
  tape.visible = t > 1.2 && (t < T.schoki - 0.1 || t > T.ketchup - 0.1);
  const rattle =
    pop(t, 1.25, T.keine - 0.05, 0.1) * 1 +
    pop(t, T.folge - 0.05, T.rate - 0.05, 0.1) * 0.8 +
    pop(t, T.frage, 50, 0.2) * 0.6;
  box.rotation.z = Math.sin(t * 38) * 0.035 * rattle;
  box.rotation.x = Math.sin(t * 31 + 1) * 0.02 * rattle;
  box.position.y = TY + Math.abs(Math.sin(t * 19)) * 0.012 * rattle;

  // --- ketchup: ✕, then a spoonful becomes a sugar cube
  const tilt =
    smooth(ramp(t, T.loeffel - 0.25, T.loeffel + 0.15)) *
    (1 - smooth(ramp(t, T.wuerfel - 0.1, T.wuerfel + 0.25)));
  ketchup.position.set(
    lerp(KET0[0], SPOON[0] - 0.02, tilt),
    lerp(KET0[1], TY + 0.2, tilt),
    lerp(KET0[2], SPOON[2] - 0.07, tilt),
  );
  ketchup.rotation.set(-2.5 * tilt, 0, 0.2 * tilt);
  const squeeze = ramp(t, T.loeffel + 0.15, T.wuerfel - 0.15);
  const flowing = squeeze > 0 && squeeze < 1;
  stream.visible = flowing;
  if (flowing) {
    const top = TY + 0.19;
    stream.position.set(SPOON[0], (top + TY + 0.02) / 2, SPOON[2]);
    stream.scale.set(1, top - TY - 0.02, 1);
  }
  const blobK = smooth(squeeze) * (1 - smooth(ramp(t, T.wuerfel, T.wuerfel + 0.3)));
  blob.visible = blobK > 0.01;
  blob.position.set(SPOON[0], TY + 0.014, SPOON[2]);
  blob.scale.set(blobK * 1.1, blobK * 0.5, blobK * 1.3);
  spoonCube.visible = t >= T.wuerfel;
  spoonCube.scale.copy(squash(t, T.wuerfel, 0.6));
  spoonCube.rotation.y = 0.4;
  puff("cube", t, T.wuerfel + 0.05, SPOON[0], TY + 0.03, SPOON[2], 0.12);

  // --- 30 sugar cubes pile up (Rate mal)
  const pileOut = inBack(ramp(t, T.ab, T.ab + 0.35));
  pile.forEach((c, i) => {
    const at = pileAt(i);
    const [x, y, z] = PILE[i];
    const k = ramp(t, at - 0.22, at);
    c.visible = t >= at - 0.22 && pileOut < 1 && t < T.ab + 1;
    const bounce =
      Math.max(0, Math.sin(clamp01((t - at) / 0.18) * Math.PI)) * 0.006 * (t > at ? 1 : 0);
    c.position.set(x, y + (1 - k * k) * 0.35 + bounce, z);
    c.rotation.set(0, pileRot[i] * (1 - k) * 4 + pileRot[i], 0);
    c.scale.setScalar(Math.max(0.001, 1 - pileOut));
  });
  const landed = PILE.reduce((n, _, i) => n + (t >= pileAt(i) ? 1 : 0), 0);

  // --- day 7: apple pops in, the hand lifts it, it sparkles
  apple.visible = t >= T.viele + 0.2 && t < T.fakt + 0.3;
  if (apple.visible) {
    const held = t >= T.apfel + 0.55;
    if (held) {
      hand.group.getWorldPosition(tmpA);
      apple.position.set(
        tmpA.x + APPLE_OFF[0],
        tmpA.y + APPLE_OFF[1] - 0.04,
        tmpA.z + APPLE_OFF[2],
      );
    } else apple.position.set(...APPLE0);
    apple.scale.copy(squash(t, T.viele + 0.2, 0.6));
    apple.rotation.y = 0.5 + (held ? (t - T.apfel) * 0.6 : 0);
  }

  // --- Übrigens: orange juice vs cola, sugar columns
  const ojOn = t >= T.fakt + 0.15;
  oj.visible = ojOn;
  can2.visible = ojOn;
  if (ojOn) {
    oj.scale.copy(squash(t, T.fakt + 0.15, 0.6));
    can2.scale.copy(squash(t, T.fakt + 0.3, 0.6));
  }
  COLS.forEach((col, ci) => {
    colCubes[ci].forEach((c, i) => {
      const at = T.saft + 0.1 + i * 0.16 + ci * 0.06;
      const k = ramp(t, at - 0.18, at);
      c.visible = t >= at - 0.18;
      c.position.set(col.x, TY + 0.015 + i * 0.03 + (1 - k * k) * 0.25, 0.24);
      c.rotation.y = (i % 3) * 0.12 - 0.1;
    });
  });

  // --- calendar crosses
  calX.forEach((g, i) => {
    g.visible = t >= dayAt[i];
    g.scale.copy(squash(t, dayAt[i], 0.5));
  });

  // --- checkout: the bars jump and glow, one flies at you
  const scream = ramp(t, T.schreit - 0.1, T.schreit + 0.2) * (1 - ramp(t, T.denn - 0.2, T.denn));
  for (const b of bars) {
    const hop = Math.abs(Math.sin(t * 9 + b.ph)) * 0.05 * scream;
    b.g.position.y = b.base + hop;
    b.g.rotation.z = Math.sin(t * 11 + b.ph) * 0.15 * scream;
    b.mat.emissiveIntensity = 0.5 * scream * (0.5 + 0.5 * Math.sin(t * 12 + b.ph));
  }
  const fk = smooth(ramp(t, T.riegel, T.riegel + 0.55));
  flyBar.visible = t >= T.riegel - 0.2 && t < T.denn;
  flyBar.position.copy(arc([0.0, 1.17, 0.05], [-0.12, 1.2, 0.45], fk, 0.08));
  flyBar.rotation.set(-0.35 + fk * 0.6, fk * 2.5 + Math.sin(t * 13) * 0.1, Math.sin(t * 17) * 0.2);
  flyBar.userData.mat.emissiveIntensity = 0.6 * scream;

  // --- brain: reward glow, dopamine bursts, the missing kick, the liver
  const sk = smooth(ramp(t, T.belohnung - 0.45, T.belohnung + 0.12));
  sugarFly.visible = sk > 0 && sk < 1;
  sugarFly.position.copy(
    arc([BRAIN[0] - 1.0, 0.45, 0.7], [BRAIN[0] - 0.05, BRAIN[1], 0.1], sk, 0.4),
  );
  sugarFly.rotation.set(sk * 5, sk * 4, 0);
  sugarFly.scale.setScalar(1 - sk * 0.7);
  const reward =
    ramp(t, T.belohnung + 0.1, T.belohnung + 0.4) * (1 - ramp(t, T.jetzt, T.jetzt + 0.4));
  const pulse = 0.65 + 0.35 * Math.sin(t * 8);
  const lack = ramp(t, T.jetzt, T.jetzt + 0.5) * (1 - ramp(t, T.folge - 0.3, T.folge));
  const angry = pop(t, T.zurueck - 0.1, T.folge, 0.15) * (0.5 + 0.5 * Math.sin(t * 22));
  const glucoseGlow = ramp(t, T.leber + 0.6, T.selbst + 0.3);
  brainMat.color.copy(PINK).lerp(GREY, lack * 0.8);
  if (angry > 0.01) {
    brainMat.emissive.setHex(0xff2a2a);
    brainMat.emissiveIntensity = 0.55 * angry;
  } else {
    brainMat.emissive.setHex(0xffb347);
    brainMat.emissiveIntensity = 0.6 * reward * pulse + 0.25 * glucoseGlow;
  }
  brain.rotation.y = Math.sin(t * 0.5) * 0.15;
  brain.position.y = BRAIN[1] + Math.sin(t * 1.3) * 0.03;
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  for (let i = 0; i < NSP; i++) {
    const bt = bursts[i % bursts.length];
    const f = (t - bt) / 1.3;
    const [d, sp] = sparkDir[i];
    const on = f > 0 && f < 1;
    const s = on ? (1 - f) * 1.2 : 0.0001;
    const dist = 0.42 + sp * Math.sqrt(Math.max(0, f)) * 0.9;
    m4.compose(V(BRAIN[0] + d.x * dist * 1.1, BRAIN[1] + d.y * dist, d.z * dist), q, V(s, s, s));
    spark.setMatrixAt(i, m4);
  }
  spark.instanceMatrix.needsUpdate = true;
  liver.visible = t >= T.leber - 0.05;
  liver.scale.copy(squash(t, T.leber - 0.05, 0.7));
  liver.rotation.y = Math.sin(t * 0.6) * 0.1;
  const gOn = ramp(t, T.leber + 0.35, T.leber + 0.7) * (1 - ramp(t, T.zunge - 0.3, T.zunge));
  for (let i = 0; i < NG; i++) {
    const f = (t * 0.45 + i / NG) % 1;
    const p = glucoseCurve.getPointAt(f);
    const s = gOn * Math.sin(Math.PI * f) * 1.1 + 0.0001;
    q.setFromEuler(new THREE.Euler(t * 2 + i, t * 1.3 + i * 2, 0));
    m4.compose(p, q, V(s, s, s));
    glucose.setMatrixAt(i, m4);
  }
  glucose.instanceMatrix.needsUpdate = true;

  // --- tongue: taste buds glow, then get rebuilt in a wave
  const glow = ramp(t, T.zellen - 0.2, T.zellen + 0.4);
  budMat.emissiveIntensity = 0.3 + 1.6 * glow * (0.75 + 0.25 * Math.sin(t * 6));
  FUN.forEach(([x, z], i) => {
    const w = T.neu - 0.15 + ((2.2 - z) / 4.4) * 0.6;
    const old = 1 - smooth(ramp(t, w, w + 0.12));
    const fresh = t >= w + 0.12 ? squash(t, w + 0.12, 0.45).y : 0;
    const s = Math.max(0.0001, t < w + 0.12 ? old : fresh);
    m4.compose(V(x, tH(x, z) + 0.04, z), q.identity(), V(s, s, s));
    buds.setMatrixAt(i, m4);
  });
  buds.instanceMatrix.needsUpdate = true;

  // --- ✕ marks (one at a time)
  const nopeK = [
    [T.schoki + 0.15, T.cola - 0.15, BOXP[0] + 0.1, TY + BH + 0.2, BOXP[2] + 0.06, 0.16],
    [T.cola + 0.15, T.ketchup - 0.15, BOXP[0] + 0.1, TY + BH + 0.2, BOXP[2] + 0.06, 0.16],
    [T.ketchup + 0.15, T.ketchup2 - 0.05, KET0[0] + 0.07, TY + 0.25, KET0[2] + 0.06, 0.16],
    [T.kick, T.zurueck + 0.4, BRAIN[0] - 0.35, BRAIN[1] + 0.55, 0.3, 0.3],
  ].find(([a, b]) => t >= a && t < b);
  if (nopeK) showNope(pop(t, nopeK[0], nopeK[1], 0.15), nopeK[2], nopeK[3], nopeK[4], nopeK[5]);
  else showNope(0, 0, 0, 0);

  // --- HUD: day counter, mood meter, sugar counter
  const day = t < T.ab ? 1 : t < T.viele ? 3 : 7;
  const dayK =
    pop(t, T.schon, T.kasse - 0.3, 0.25) +
    pop(t, T.ab, T.verhungert - 0.55, 0.25) +
    pop(t, T.viele, T.fakt - 0.05, 0.25);
  counter("tag", dayK, {
    label: "OHNE ZUCKER",
    value: `TAG ${day}`,
    x: 60,
    y: 470,
    color: "#ffd23f",
  });
  const moodK = pop(t, T.kopf - 0.2, T.kasse - 0.3, 0.2) + pop(t, T.drei, T.verhungert - 0.55, 0.2);
  const mood = t < T.ab ? 0.14 : 0.3 + 0.4 * smooth(ramp(t, T.drei, T.drei + 0.8));
  meter("laune", moodK, {
    label: "LAUNE",
    value: mood,
    x: 60,
    y: 700,
    width: 440,
    color: t < T.ab ? "#ff4b2b" : "#3dff7a",
  });
  counter("zw", pop(t, T.rate + 0.2, T.wuerfel2, 0.2), {
    label: "WÜRFEL",
    value: landed,
    x: 60,
    y: 470,
    color: "#ffffff",
  });

  // --- LED facts
  if (t >= T.wuerfel2 && t < T.ab)
    showPanel(pop(t, T.wuerfel2, T.ab), "PRO TAG", "90 GRAMM", LED.yellow);
  else if (t >= T.cola2 - 0.4 && t < T.frage)
    showPanel(pop(t, T.cola2 - 0.4, T.frage), "PRO GLAS · SAFT : COLA", "7 : 9", LED.yellow);
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
