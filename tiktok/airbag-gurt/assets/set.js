// #99 Airbag gegen Gurt — a crash-test hall: bright work lights under a
// steel roof, a polished concrete floor with yellow/black safety lines, two
// sled tracks that run into a low concrete crash block, high-speed cameras
// on tripods, LED floodlight panels, a control desk with screens. Hero
// piece behind the stage: a red steel drop tower (Fallturm) with a
// platform up high. Life: a rotating orange warning beacon, blinking REC
// lights on the cameras, dust floating in the light, flickering graphs.
import { THREE, ground, onFrame, V, real, roundedBox, surface, worldUV } from "./world.js";
import { SKIES, setSky, finishSet, fireflies } from "./environments.js";

// ---------------------------------------------------------------- helpers
const put = (geo, mat, x = 0, y = 0, z = 0, parent = ground, shadow = true) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};
export function canvasTex(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
// diagonal yellow / black safety stripes
export const stripeTex = (rep = 4) => {
  const t = canvasTex(256, 64, (g, w, h) => {
    g.fillStyle = "#f2c230";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#151515";
    for (let x = -h; x < w + h; x += 64) {
      g.beginPath();
      g.moveTo(x, h);
      g.lineTo(x + 32, h);
      g.lineTo(x + 32 + h, 0);
      g.lineTo(x + h, 0);
      g.fill();
    }
  });
  t.wrapS = THREE.RepeatWrapping;
  t.repeat.set(rep, 1);
  return t;
};
// crash-test target: a circle split in black / yellow quadrants
export const targetTex = canvasTex(128, 128, (g) => {
  g.fillStyle = "#ffffff";
  g.fillRect(0, 0, 128, 128);
  for (let q = 0; q < 4; q++) {
    g.fillStyle = q % 2 ? "#151515" : "#f2c230";
    g.beginPath();
    g.moveTo(64, 64);
    g.arc(64, 64, 60, (q * Math.PI) / 2, ((q + 1) * Math.PI) / 2);
    g.fill();
  }
  g.strokeStyle = "#151515";
  g.lineWidth = 4;
  g.beginPath();
  g.arc(64, 64, 60, 0, Math.PI * 2);
  g.stroke();
});
const textTex = (txt, { w = 512, h = 128, bg = "#ffffff", fg = "#151515", size = 84 } = {}) =>
  canvasTex(w, h, (g) => {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.fillStyle = fg;
    g.font = `900 ${size}px Montserrat, Arial, sans-serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(txt, w / 2, h / 2 + 4);
  });

// ---------------------------------------------------------------- light
// an indoor hall: the "sky" is the dark roof space, the key is the bank of
// work lights overhead, a cool fill from the high windows
setSky({
  ...SKIES.studio,
  top: [0.16, 0.17, 0.19],
  mid: [0.2, 0.21, 0.23],
  hor: [0.3, 0.31, 0.33],
  below: [0.22, 0.22, 0.23],
  sun: [0.0, 0.0, 0.0],
  hemi: [0xeef2f8, 0x4a4b4e, 1.9],
  key: [0xfffaf2, 2.4],
  keyPos: [3, 14, 7],
  rim: [0xc8d8ff, 0.9],
  fog: [34, 95],
});

// ---------------------------------------------------------------- hall shell
const concrete = surface(0x8e8f8c, "concrete", { seed: 99 });
concrete.roughness = 0.55;
const floorGeo = new THREE.PlaneGeometry(90, 90, 1, 1);
floorGeo.rotateX(-Math.PI / 2);
const floor = put(worldUV(floorGeo, 0.35), concrete, 0, 0, 0, ground, false);
floor.receiveShadow = true;

const wallMat = surface(0xb9bab6, "concrete", { seed: 7 });
const wallLow = real.plastic(0x3d5f8a, { roughness: 0.6, clearcoat: 0 }); // painted dado
const wall = (w, h, x, z, rotY) => {
  const g = new THREE.BoxGeometry(w, h, 0.4);
  g.rotateY(rotY);
  const m = put(worldUV(g, 0.3), wallMat, x, h / 2, z, ground, false);
  const d = new THREE.BoxGeometry(w, 2.2, 0.42);
  d.rotateY(rotY);
  put(d, wallLow, x, 1.1, z, ground, false);
  return m;
};
wall(70, 14, 6, -15, 0); // back
wall(70, 14, 6, 20, 0); // front (behind the cameras)
wall(36, 14, -16, 2.5, Math.PI / 2); // crash end
wall(36, 14, 40, 2.5, Math.PI / 2); // launch end
// roof + steel trusses + rows of work lights
put(
  new THREE.BoxGeometry(70, 0.4, 36),
  real.plastic(0x8a8f97, { roughness: 0.85, clearcoat: 0 }),
  6,
  14,
  2.5,
  ground,
  false,
);
const steel = real.metal(0x6b7078, { roughness: 0.5 });
const lampMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  emissive: 0xfff8ec,
  emissiveIntensity: 2.6,
});
for (let x = -12; x <= 36; x += 6) {
  put(new THREE.BoxGeometry(0.35, 0.9, 36), steel, x, 13.3, 2.5, ground, false);
  for (let z = -10; z <= 14; z += 4) {
    const l = put(new THREE.BoxGeometry(1.6, 0.12, 0.5), lampMat, x + 3, 12.6, z, ground, false);
    l.userData.noAO = true;
  }
}
// high windows on the back wall: cool daylight
const winMat = new THREE.MeshStandardMaterial({
  color: 0xcfe2ff,
  emissive: 0xb8d4ff,
  emissiveIntensity: 1.1,
});
for (let x = -10; x <= 34; x += 5.5) {
  const w = put(new THREE.BoxGeometry(4, 2.2, 0.1), winMat, x, 10.6, -14.75, ground, false);
  w.userData.noAO = true;
  for (let k = -1; k <= 1; k++)
    put(new THREE.BoxGeometry(0.08, 2.2, 0.14), steel, x + k * 1.33, 10.6, -14.72, ground, false);
}
// painted wall sign
put(
  new THREE.PlaneGeometry(9, 2.2),
  new THREE.MeshStandardMaterial({
    map: textTex("CRASH-LABOR 3", { w: 1024, h: 250, bg: "#1f3e66", fg: "#ffffff", size: 150 }),
    roughness: 0.8,
  }),
  -4,
  6.2,
  -14.78,
  ground,
  false,
);
for (const x of [-10, 2]) {
  const tg = put(
    new THREE.CircleGeometry(1.1, 48),
    new THREE.MeshStandardMaterial({ map: targetTex, roughness: 0.6 }),
    x,
    6.2,
    -14.78,
    ground,
    false,
  );
  tg.userData.noAO = true;
}

// ---------------------------------------------------------------- tracks
// two sled tracks along x, the sleds stop at x = 0 against the crash block
export const LANE = [-1.05, 1.05]; // z of the belt sled (left) and the airbag sled (right)
const railMat = real.metal(0xb8bec6, { roughness: 0.25 });
const sleeper = real.metal(0x3b3f45, { roughness: 0.6 });
for (const z of LANE) {
  for (const s of [-0.38, 0.38])
    put(new THREE.BoxGeometry(42, 0.09, 0.08), railMat, 19.5, 0.045, z + s);
  for (let x = -1; x < 40; x += 1.2)
    put(new THREE.BoxGeometry(0.2, 0.03, 1.0), sleeper, x, 0.015, z, ground, false);
}
// safety lines left and right of both tracks
const stripeMat = new THREE.MeshStandardMaterial({ map: stripeTex(60), roughness: 0.7 });
for (const z of [-2.15, 0, 2.15]) {
  const g = new THREE.PlaneGeometry(42, z === 0 ? 0.16 : 0.28);
  g.rotateX(-Math.PI / 2);
  put(
    g,
    z === 0 ? new THREE.MeshStandardMaterial({ color: 0xf2c230, roughness: 0.7 }) : stripeMat,
    19.5,
    0.006,
    z,
    ground,
    false,
  );
}

// ---------------------------------------------------------------- crash block
// low reinforced concrete block across both lanes, steel face with an
// aluminium honeycomb crush pad in front of each lane
const blockMat = surface(0xa3a39e, "concrete", { seed: 3 });
const blk = new THREE.BoxGeometry(2.4, 0.95, 5.2);
put(worldUV(blk, 0.6), blockMat, -2.95, 0.475, 0);
const face = real.metal(0x4b5058, { roughness: 0.35 });
put(roundedBox(0.12, 0.85, 5.2, 0.03), face, -1.72, 0.45, 0);
const honeyTex = canvasTex(256, 256, (g) => {
  g.fillStyle = "#c9ccd0";
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = "#7d8288";
  g.lineWidth = 3;
  for (let y = 0; y < 9; y++)
    for (let x = 0; x < 9; x++) {
      const cx = x * 30 + (y % 2) * 15;
      const cy = y * 26;
      g.beginPath();
      for (let k = 0; k < 6; k++)
        g.lineTo(cx + 13 * Math.cos((k * Math.PI) / 3), cy + 13 * Math.sin((k * Math.PI) / 3));
      g.closePath();
      g.stroke();
    }
});
for (const z of LANE) {
  put(
    roundedBox(0.3, 0.55, 1.1, 0.02),
    new THREE.MeshPhysicalMaterial({ map: honeyTex, metalness: 0.6, roughness: 0.35 }),
    -1.52,
    0.42,
    z,
  );
}
const blkStripe = new THREE.MeshStandardMaterial({ map: stripeTex(6), roughness: 0.6 });
const bs = put(new THREE.PlaneGeometry(5.2, 0.22), blkStripe, -1.651, 0.84, 0, ground, false);
bs.rotation.y = -Math.PI / 2;
const bs2 = put(new THREE.PlaneGeometry(2.4, 0.22), blkStripe, -2.95, 0.84, 2.601, ground, false);
bs2.userData.noAO = true;

// ---------------------------------------------------------------- drop tower (hero piece)
export const TOWER = V(4.5, 0, -10);
const red = real.gloss(0xc0392b, { roughness: 0.35, clearcoat: 0.6 });
{
  const g = new THREE.Group();
  g.position.copy(TOWER);
  ground.add(g);
  const H = 12.6;
  for (const [x, z] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ])
    put(new THREE.BoxGeometry(0.22, H, 0.22), red, x * 1.1, H / 2, z * 1.1, g);
  // cross bracing
  for (let y = 1; y < H - 1; y += 2.2)
    for (let s = 0; s < 4; s++) {
      const br = new THREE.Group();
      br.rotation.y = (s * Math.PI) / 2;
      g.add(br);
      const m = put(new THREE.CylinderGeometry(0.04, 0.04, 2.9, 10), red, 0, y + 1.1, 1.1, br);
      m.rotation.z = 0.86;
      put(new THREE.BoxGeometry(2.2, 0.1, 0.1), red, 0, y, 1.1, br);
    }
  // platform up high + railing + hoist beam
  put(new THREE.BoxGeometry(3.0, 0.14, 3.0), steel, 0, 10.2, 0, g);
  for (const s of [-1, 1]) {
    put(
      new THREE.BoxGeometry(3.0, 0.06, 0.06),
      real.metal(0xf2c230, { roughness: 0.4 }),
      0,
      11.2,
      s * 1.5,
      g,
    );
    put(
      new THREE.BoxGeometry(0.06, 0.06, 3.0),
      real.metal(0xf2c230, { roughness: 0.4 }),
      s * 1.5,
      11.2,
      0,
      g,
    );
  }
  put(new THREE.BoxGeometry(0.3, 0.3, 4.2), steel, 0, H + 0.1, 1.2, g);
  // floor plate where the dummy lands
  put(roundedBox(2.6, 0.1, 2.6, 0.03), real.metal(0x5d636b, { roughness: 0.45 }), 0, 0.05, 2.6, g);
  const sign = put(
    new THREE.PlaneGeometry(2.2, 0.55),
    new THREE.MeshStandardMaterial({ map: textTex("FALLTURM", { bg: "#f2c230" }), roughness: 0.7 }),
    0,
    9.6,
    1.56,
    g,
    false,
  );
  sign.userData.noAO = true;
}

// ---------------------------------------------------------------- near props
const black = real.plastic(0x1b1c1f, { roughness: 0.45 });
const blinkers = [];
// high-speed camera on a tripod, looking at the sleds
function hsCam(x, z, h = 1.4, aim = [0, 1.1, 0]) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  ground.add(g);
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2;
    const leg = put(
      new THREE.CylinderGeometry(0.018, 0.025, h + 0.1, 10),
      real.metal(0x2b2d31, { roughness: 0.4 }),
      Math.cos(a) * 0.22,
      h / 2,
      Math.sin(a) * 0.22,
      g,
    );
    leg.rotation.set(Math.sin(a) * 0.16, 0, -Math.cos(a) * 0.16);
  }
  const head = new THREE.Group();
  head.position.y = h + 0.1;
  g.add(head);
  put(roundedBox(0.42, 0.24, 0.24, 0.03), black, 0, 0.1, 0, head);
  const lens = put(
    new THREE.CylinderGeometry(0.075, 0.085, 0.24, 32),
    real.metal(0x202124, { roughness: 0.3 }),
    -0.32,
    0.1,
    0,
    head,
  );
  lens.rotation.z = Math.PI / 2;
  const glass = put(
    new THREE.CircleGeometry(0.068, 32),
    real.gloss(0x10204a, { roughness: 0.05 }),
    -0.442,
    0.1,
    0,
    head,
  );
  glass.rotation.y = -Math.PI / 2;
  const rec = put(
    new THREE.SphereGeometry(0.018, 12, 8),
    new THREE.MeshStandardMaterial({ color: 0xff2020, emissive: 0xff1010, emissiveIntensity: 3 }),
    0.1,
    0.24,
    0.08,
    head,
  );
  rec.userData.noAO = true;
  blinkers.push([rec.material, x * 3.1 + z]);
  head.lookAt(new THREE.Vector3(...aim));
  head.rotateY(Math.PI / 2); // the lens points along -x of the head
  return g;
}
hsCam(-0.2, 4.6, 1.3, [0, 1.1, 0]);
hsCam(-4.2, 2.6, 1.6, [0, 1.2, 0]);
hsCam(-3.8, -3.4, 1.6, [0, 1.2, -1]);
hsCam(6.6, -3.0, 1.2, [0, 1.0, -1]);

// LED floodlight panels on stands, plus the real lights they motivate
const panelMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  emissive: 0xfffaf0,
  emissiveIntensity: 3.2,
});
function flood(x, z, h, aim) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  ground.add(g);
  put(new THREE.CylinderGeometry(0.035, 0.035, h, 12), real.metal(0x2b2d31), 0, h / 2, 0, g);
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2;
    const leg = put(
      new THREE.CylinderGeometry(0.02, 0.02, 0.7, 8),
      real.metal(0x2b2d31),
      Math.cos(a) * 0.28,
      0.12,
      Math.sin(a) * 0.28,
      g,
    );
    leg.rotation.set(Math.sin(a) * 1.2, 0, -Math.cos(a) * 1.2);
  }
  const head = new THREE.Group();
  head.position.y = h;
  g.add(head);
  put(roundedBox(1.1, 0.7, 0.12, 0.03), black, 0, 0, -0.02, head);
  const p = put(new THREE.PlaneGeometry(1.0, 0.6), panelMat, 0, 0, 0.05, head, false);
  p.userData.noAO = true;
  head.lookAt(new THREE.Vector3(...aim));
}
flood(-2.2, 5.6, 2.6, [0, 1.2, 0]);
flood(2.8, 5.2, 2.9, [0, 1.2, 0]);
flood(-5.5, -0.5, 2.8, [0, 1.2, 0]);
const spot = new THREE.SpotLight(0xfff6ea, 26, 30, 0.55, 0.6, 1.2);
spot.position.set(-1.5, 6.5, 6.5);
spot.target.position.set(0, 1.0, 0);
ground.add(spot, spot.target);
const spot2 = new THREE.SpotLight(0xe8f0ff, 14, 30, 0.6, 0.7, 1.2);
spot2.position.set(-6, 5, -2);
spot2.target.position.set(0, 1.0, 0);
ground.add(spot2, spot2.target);

// control desk with screens (life: scrolling graphs)
{
  const g = new THREE.Group();
  g.position.set(6.5, 0, -5.2);
  g.rotation.y = -0.35;
  ground.add(g);
  put(roundedBox(3.2, 0.08, 1.0, 0.02), real.plastic(0xd9dcdf), 0, 0.9, 0, g);
  for (const s of [-1, 1])
    put(roundedBox(0.08, 0.9, 0.9, 0.02), real.plastic(0x9aa0a6), s * 1.5, 0.45, 0, g);
  const scr = canvasTex(512, 320, () => {});
  const ctx = scr.image.getContext("2d");
  const scrMat = new THREE.MeshStandardMaterial({
    map: scr,
    emissive: 0xffffff,
    emissiveMap: scr,
    emissiveIntensity: 1.2,
  });
  for (const s of [-0.75, 0.75]) {
    put(roundedBox(1.25, 0.8, 0.06, 0.02), black, s, 1.42, -0.25, g);
    const sc = put(new THREE.PlaneGeometry(1.15, 0.7), scrMat, s, 1.42, -0.215, g, false);
    sc.userData.noAO = true;
    put(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 10), black, s, 1.05, -0.28, g);
  }
  put(roundedBox(0.9, 0.04, 0.3, 0.01), black, 0, 0.95, 0.2, g); // keyboard
  // office chair
  put(new THREE.CylinderGeometry(0.03, 0.03, 0.45, 10), steel, 0.2, 0.25, 0.9, g);
  put(roundedBox(0.5, 0.1, 0.5, 0.04), real.fabric(0x26282c), 0.2, 0.5, 0.9, g);
  put(roundedBox(0.5, 0.55, 0.08, 0.04), real.fabric(0x26282c), 0.2, 0.82, 1.15, g);
  let last = -1;
  onFrame((t) => {
    const f = Math.floor(t * 10);
    if (f === last) return;
    last = f;
    ctx.fillStyle = "#0b1622";
    ctx.fillRect(0, 0, 512, 320);
    ctx.strokeStyle = "#1e3b55";
    for (let x = 0; x < 512; x += 32) ctx.strokeRect(x, 0, 32, 320);
    const lines = [
      ["#ffd23f", 0.9],
      ["#3fd2ff", 1.7],
      ["#ff5a4a", 2.6],
    ];
    for (const [c, ph] of lines) {
      ctx.strokeStyle = c;
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let x = 0; x <= 512; x += 8) {
        const u = x / 512 + t * 0.15;
        const y =
          160 +
          Math.sin(u * 14 + ph) * 50 * Math.exp(-((((u * 3 + ph) % 3) - 1.2) ** 2)) +
          Math.sin(u * 40 + ph) * 6;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    scr.needsUpdate = true;
  });
}

// calibration board, tool cart, cones, tyre stack, cables
{
  const g = new THREE.Group();
  g.position.set(-6.2, 0, -5.5);
  g.rotation.y = 0.6;
  ground.add(g);
  const chk = canvasTex(256, 256, (c) => {
    for (let y = 0; y < 8; y++)
      for (let x = 0; x < 8; x++) {
        c.fillStyle = (x + y) % 2 ? "#141414" : "#f4f4f4";
        c.fillRect(x * 32, y * 32, 32, 32);
      }
  });
  put(
    roundedBox(1.6, 1.6, 0.05, 0.02),
    new THREE.MeshStandardMaterial({ map: chk, roughness: 0.5 }),
    0,
    1.6,
    0,
    g,
  );
  put(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 10), steel, 0, 0.45, 0, g);
  put(new THREE.CylinderGeometry(0.4, 0.45, 0.06, 32), black, 0, 0.03, 0, g);
}
{
  const g = new THREE.Group();
  g.position.set(5.4, 0, 3.2);
  g.rotation.y = -0.5;
  ground.add(g);
  const cart = real.gloss(0xc62828, { roughness: 0.3 });
  put(roundedBox(1.0, 0.85, 0.55, 0.04), cart, 0, 0.55, 0, g);
  for (let k = 0; k < 4; k++)
    put(
      roundedBox(0.92, 0.012, 0.02, 0.005),
      real.metal(0xd0d4d8),
      0,
      0.3 + k * 0.18,
      0.285,
      g,
      false,
    );
  for (const [x, z] of [
    [-0.42, -0.2],
    [0.42, -0.2],
    [-0.42, 0.2],
    [0.42, 0.2],
  ]) {
    const w = put(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 20), black, x, 0.06, z, g);
    w.rotation.x = Math.PI / 2;
  }
  put(roundedBox(0.3, 0.12, 0.2, 0.03), real.plastic(0xf2c230), 0.2, 1.04, 0, g); // toolbox
}
const coneMat = real.plastic(0xff6a13, { roughness: 0.5 });
const coneWhite = real.plastic(0xf4f4f4, { roughness: 0.5 });
for (const [x, z] of [
  [4.2, 2.3],
  [4.6, -2.3],
  [9, 2.4],
  [9, -2.4],
  [-5.2, 4.8],
]) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  ground.add(g);
  put(roundedBox(0.36, 0.04, 0.36, 0.015), coneMat, 0, 0.02, 0, g);
  put(new THREE.CylinderGeometry(0.03, 0.13, 0.5, 32), coneMat, 0, 0.29, 0, g);
  put(new THREE.CylinderGeometry(0.068, 0.092, 0.09, 32), coneWhite, 0, 0.32, 0, g);
}
const tyre = real.rubber(0x1c1c1e);
for (let k = 0; k < 4; k++) {
  const m = put(new THREE.TorusGeometry(0.33, 0.13, 20, 40), tyre, -6.5, 0.13 + k * 0.26, 3.2);
  m.rotation.x = Math.PI / 2;
}
const cableMat = real.rubber(0x111214);
for (const [a, b, c] of [
  [
    [-0.2, 0.02, 4.6],
    [-2, 0.02, 6],
    [-6, 0.02, 7],
  ],
  [
    [-4.2, 0.02, 2.6],
    [-6, 0.02, 3.5],
    [-8, 0.02, 1],
  ],
  [
    [3.2, 0.02, -4.2],
    [5, 0.02, -4.6],
    [6.5, 0.02, -5],
  ],
]) {
  const curve = new THREE.CatmullRomCurve3([V(...a), V(...b), V(...c)]);
  put(new THREE.TubeGeometry(curve, 40, 0.025, 8), cableMat, 0, 0, 0, ground, false);
}

// ---------------------------------------------------------------- life
// orange warning beacon on a pole: spins while the hall is "live"
const beacon = new THREE.Group();
beacon.position.set(-1.0, 0, -3.0);
ground.add(beacon);
put(new THREE.CylinderGeometry(0.05, 0.05, 3.0, 12), real.metal(0x2b2d31), 0, 1.5, 0, beacon);
const domeMat = new THREE.MeshStandardMaterial({
  color: 0xff8a1a,
  emissive: 0xff6a00,
  emissiveIntensity: 1.5,
  roughness: 0.3,
  transparent: true,
  opacity: 0.85,
});
const dome = put(
  new THREE.SphereGeometry(0.16, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
  domeMat,
  0,
  3.05,
  0,
  beacon,
  false,
);
dome.userData.noAO = true;
const beam = new THREE.SpotLight(0xff8a1a, 0, 18, 0.35, 0.6, 1.2);
beam.position.set(0, 3.12, 0);
beacon.add(beam, beam.target);
onFrame((t) => {
  const a = t * 6.5;
  beam.target.position.set(Math.cos(a) * 5, 1.5, Math.sin(a) * 5);
  beam.intensity = 22;
  domeMat.emissiveIntensity = 1.2 + 1.3 * Math.max(0, Math.cos(a * 2));
  for (const [m, ph] of blinkers) m.emissiveIntensity = Math.sin(t * 6 + ph) > 0 ? 3.5 : 0.3;
});
fireflies(80, { area: [-5, 6, 0.4, 5, -4, 5], color: 0xfff6e0, size: 0.012, seed: 99 });

finishSet({ ground: 0x8e8f8c });
