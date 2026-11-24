// Set of #93 "Handy gegen Klobrille": a modern city-flat bathroom at night,
// 23:40. A white wall-hung toilet hangs from a tiled pre-wall (origin, seat
// top ≈ 1.28, 3 units = 1 m); the pre-wall's ledge (LEDGE) is where the
// phone lies. Deep bottle-green vertical tiles, a warm concrete floor in
// big slabs, a walk-in shower with a glass pane and a rain head on the left,
// an oak vanity with a white basin and a round LED mirror on the right, a
// eucalyptus vase, a black paper holder, a bath mat, a rattan basket. Hero
// piece: the tall window in the back wall over the night city (lit towers,
// a TV tower, the moon). Life: dust in the lamp light, a dripping tap, a
// plane blinking across the window, drifting clouds.
// Two mini-sets far away for beat 2: an U-Bahn door with a yellow pole
// (UBAHN) and a kitchen worktop with raw chicken (KUECHE).
import { THREE, flat, ground, onFrame, rng, real, roundedBox, V } from "./world.js";
import { SKIES, setSky, finishSet, fireflies } from "./environments.js";

const SEED = 93;
const r = rng(SEED);
export const WZ = -1.8; // back wall
export const PRE = { x0: -1.35, x1: 1.35, z: -1.12, top: 3.6 }; // pre-wall (toilet hangs here)
export const LEDGE = [0.78, 3.6, -1.48]; // where the phone lies (top of the pre-wall)
export const FLUSH = [0, 3.0, PRE.z]; // flush plate centre
export const UBAHN = [70, 0, 0];
export const KUECHE = [-70, 0, 0];

// ---------------------------------------------------------------- light
setSky({
  ...SKIES.nacht,
  top: [0.02, 0.03, 0.1],
  mid: [0.06, 0.08, 0.2],
  hor: [0.2, 0.18, 0.32],
  below: [0.08, 0.08, 0.12],
  sunDir: [0.25, 0.32, -1],
  sun: [0.9, 0.92, 1.0],
  stars: 0.8,
  clouds: 6,
  birds: false,
  hemi: [0xfff1e0, 0x3a3430, 1.15],
  key: [0xffe6c8, 2.1],
  keyPos: [3.5, 14, 9],
  rim: [0x8fa8ff, 0.7],
  fog: [60, 160],
});
// warm glow of the LED mirror + a cool spill from the window
const mirrorLight = new THREE.PointLight(0xffd7a8, 7, 9, 1.6);
mirrorLight.position.set(4.6, 4.8, -0.9);
ground.add(mirrorLight);
const winLight = new THREE.PointLight(0x7f98ff, 3, 8, 1.6);
winLight.position.set(-3.4, 5.2, -1.0);
ground.add(winLight);
export const SET_LIGHTS = [mirrorLight, winLight];

// ---------------------------------------------------------------- textures
function tileTex({ w = 512, h = 512, cols, rows, base, vary = 0.06, grout, groutW = 3, seed = 1 }) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  const rr = rng(seed);
  g.fillStyle = grout;
  g.fillRect(0, 0, w, h);
  const col = new THREE.Color(base);
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      const k = 1 + (rr() - 0.5) * vary * 2;
      const cc = col.clone().multiplyScalar(k);
      g.fillStyle = `#${cc.getHexString()}`;
      const x = (i * w) / cols + groutW / 2;
      const y = (j * h) / rows + groutW / 2;
      g.fillRect(x, y, w / cols - groutW, h / rows - groutW);
      // a soft glaze highlight near the top of each tile
      const gr = g.createLinearGradient(0, y, 0, y + h / rows);
      gr.addColorStop(0, "rgba(255,255,255,0.10)");
      gr.addColorStop(0.4, "rgba(255,255,255,0)");
      g.fillStyle = gr;
      g.fillRect(x, y, w / cols - groutW, h / rows - groutW);
    }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}
const addM = (geo, mat, x, y, z, parent = ground, shadow = true) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};

// ---------------------------------------------------------------- room
// floor: warm grey concrete slabs, 60 cm (1.8 u)
const floorTex = tileTex({
  cols: 4,
  rows: 4,
  base: 0x8d867d,
  vary: 0.05,
  grout: "#5d5853",
  groutW: 2,
  seed: 3,
});
floorTex.repeat.set(16 / 7.2, 14 / 7.2);
const floorMat = new THREE.MeshPhysicalMaterial({
  map: floorTex,
  roughness: 0.55,
  clearcoat: 0.3,
  clearcoatRoughness: 0.35,
});
const floor = addM(new THREE.PlaneGeometry(16, 14), floorMat, 1, 0, 5, ground, false);
floor.rotation.x = -Math.PI / 2;

// walls: bottle-green vertical tiles 7.5 × 30 cm
const wallTex = (rx, ry) => {
  const t = tileTex({
    cols: 8,
    rows: 2,
    base: 0x24564a,
    vary: 0.09,
    grout: "#d9d2c4",
    groutW: 3,
    seed: 7,
  });
  t.repeat.set(rx, ry);
  return t;
};
const wallMat = (rx, ry) =>
  new THREE.MeshPhysicalMaterial({
    map: wallTex(rx, ry),
    roughness: 0.22,
    clearcoat: 0.7,
    clearcoatRoughness: 0.12,
  });
// back wall with a window hole (x -4.6..-2.2, y 3.6..7.0)
const H = 8.4;
const wallPiece = (x0, x1, y0, y1) => {
  const w = x1 - x0;
  const h = y1 - y0;
  addM(
    new THREE.PlaneGeometry(w, h),
    wallMat(w / 1.8, h / 1.8),
    (x0 + x1) / 2,
    (y0 + y1) / 2,
    WZ,
    ground,
    false,
  );
};
const WIN = { x0: -4.6, x1: -2.2, y0: 3.6, y1: 7.0 };
wallPiece(-7, WIN.x0, 0, H);
wallPiece(WIN.x1, 9, 0, H);
wallPiece(WIN.x0, WIN.x1, 0, WIN.y0);
wallPiece(WIN.x0, WIN.x1, WIN.y1, H);
// side walls
{
  const l = addM(
    new THREE.PlaneGeometry(14, H),
    wallMat(14 / 1.8, H / 1.8),
    -7,
    H / 2,
    5,
    ground,
    false,
  );
  l.rotation.y = Math.PI / 2;
  const rw = addM(
    new THREE.PlaneGeometry(14, H),
    wallMat(14 / 1.8, H / 1.8),
    9,
    H / 2,
    5,
    ground,
    false,
  );
  rw.rotation.y = -Math.PI / 2;
  const ceil = addM(new THREE.PlaneGeometry(16, 14), flat(0xe9e4dc), 1, H, 5, ground, false);
  ceil.rotation.x = Math.PI / 2;
}
// window: deep reveal, black frame, cross bar, sill
{
  const frame = real.plastic(0x1c1c1e, { roughness: 0.5 });
  const cx = (WIN.x0 + WIN.x1) / 2;
  const cy = (WIN.y0 + WIN.y1) / 2;
  const w = WIN.x1 - WIN.x0;
  const h = WIN.y1 - WIN.y0;
  const reveal = flat(0xe4ddd2, { flatShading: false, roughness: 0.8 });
  addM(new THREE.BoxGeometry(w, 0.05, 0.5), reveal, cx, WIN.y0, WZ - 0.25);
  addM(new THREE.BoxGeometry(w, 0.05, 0.5), reveal, cx, WIN.y1, WZ - 0.25);
  addM(new THREE.BoxGeometry(0.05, h, 0.5), reveal, WIN.x0, cy, WZ - 0.25);
  addM(new THREE.BoxGeometry(0.05, h, 0.5), reveal, WIN.x1, cy, WZ - 0.25);
  for (const [x, y, ww, hh] of [
    [cx, WIN.y0 + 0.05, w, 0.1],
    [cx, WIN.y1 - 0.05, w, 0.1],
    [WIN.x0 + 0.05, cy, 0.1, h],
    [WIN.x1 - 0.05, cy, 0.1, h],
    [cx, cy + 0.4, w, 0.07],
    [cx, cy, 0.07, h],
  ])
    addM(roundedBox(ww, hh, 0.1, 0.02), frame, x, y, WZ - 0.42);
  addM(roundedBox(w + 0.3, 0.08, 0.36, 0.03), real.ceramic(0xf2efe9), cx, WIN.y0 - 0.02, WZ + 0.12);
  addM(
    new THREE.PlaneGeometry(w, h),
    real.glass(0xbfd0ff, { opacity: 0.12 }),
    cx,
    cy,
    WZ - 0.44,
    ground,
    false,
  );
  // small candle-like pot plant on the sill
  addM(
    new THREE.CylinderGeometry(0.16, 0.12, 0.3, 32),
    real.ceramic(0xc9b8a0),
    WIN.x0 + 0.5,
    WIN.y0 + 0.17,
    WZ + 0.1,
  );
  for (let i = 0; i < 6; i++) {
    const leaf = addM(
      new THREE.SphereGeometry(0.09, 16, 12),
      real.plastic(0x3e7b45, { roughness: 0.6 }),
      WIN.x0 + 0.5 + Math.cos(i) * 0.1,
      WIN.y0 + 0.42 + (i % 3) * 0.06,
      WZ + 0.1 + Math.sin(i) * 0.1,
    );
    leaf.scale.set(0.8, 1.5, 0.5);
  }
}

// ---------------------------------------------------------------- far layer: night city in the window
{
  const city = new THREE.Group();
  ground.add(city);
  const winMat = new THREE.MeshBasicMaterial({ color: 0xffcf7a, fog: false });
  const bodyMat = flat(0x161a2a, { fog: false });
  const lit = [];
  for (let i = 0; i < 26; i++) {
    const x = -16 + i * 1.3 + (r() - 0.5) * 0.6;
    const z = -34 - r() * 18;
    const w = 1.4 + r() * 2.2;
    const h = 6 + r() * 20;
    addM(new THREE.BoxGeometry(w, h, 2), bodyMat, x * 1.7, h / 2 - 4, z, city, false);
    for (let k = 0; k < 18; k++)
      if (r() < 0.45) lit.push([x * 1.7 + (r() - 0.5) * w * 0.8, -4 + r() * h * 0.95, z + 1.02]);
  }
  const wg = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.28, 0.34), winMat, lit.length);
  const m4 = new THREE.Matrix4();
  lit.forEach((p, i) => wg.setMatrixAt(i, m4.makeTranslation(...p)));
  city.add(wg);
  // TV tower with a red beacon
  addM(new THREE.CylinderGeometry(0.35, 0.6, 34, 16), bodyMat, -8, 13, -44, city, false);
  addM(new THREE.SphereGeometry(1.8, 24, 16), bodyMat, -8, 24, -44, city, false);
  const beacon = addM(
    new THREE.SphereGeometry(0.4, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0xff3030, fog: false }),
    -8,
    30.3,
    -44,
    city,
    false,
  );
  // moon
  addM(
    new THREE.SphereGeometry(2.2, 32, 16),
    new THREE.MeshBasicMaterial({ color: 0xfff4dc, fog: false }),
    6,
    36,
    -80,
    city,
    false,
  );
  // a plane blinking across
  const plane = addM(
    new THREE.SphereGeometry(0.22, 8, 6),
    new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }),
    0,
    26,
    -60,
    city,
    false,
  );
  onFrame((t) => {
    beacon.visible = Math.sin(t * 3) > -0.2;
    plane.position.x = -30 + ((t * 1.6) % 60);
    plane.visible = Math.sin(t * 7) > 0.3;
  });
}

// ---------------------------------------------------------------- pre-wall + flush plate
const preMat = wallMat(2.7 / 1.8, 3.6 / 1.8);
addM(
  new THREE.BoxGeometry(PRE.x1 - PRE.x0, PRE.top, WZ * -1 + PRE.z),
  preMat,
  0,
  PRE.top / 2,
  (WZ + PRE.z) / 2,
);
// ledge: oak top
addM(
  roundedBox(PRE.x1 - PRE.x0 + 0.06, 0.08, -WZ + PRE.z + 0.08, 0.025),
  real.wood(0xb48a5a, { roughness: 0.55 }),
  0,
  PRE.top + 0.04,
  (WZ + PRE.z) / 2 + 0.02,
);
export const flushPlate = new THREE.Group();
flushPlate.position.set(...FLUSH);
ground.add(flushPlate);
addM(
  roundedBox(0.75, 0.5, 0.05, 0.03),
  real.metal(0x2a2a2c, { roughness: 0.35 }),
  0,
  0,
  0.02,
  flushPlate,
);
export const flushBtnBig = addM(
  roundedBox(0.4, 0.38, 0.04, 0.03),
  real.metal(0x3a3a3d, { roughness: 0.25 }),
  0.12,
  0,
  0.055,
  flushPlate,
);
addM(
  roundedBox(0.2, 0.38, 0.04, 0.03),
  real.metal(0x3a3a3d, { roughness: 0.25 }),
  -0.22,
  0,
  0.055,
  flushPlate,
);
// eucalyptus vase on the ledge (left side)
{
  const vase = addM(
    new THREE.CylinderGeometry(0.12, 0.16, 0.5, 40),
    real.glass(0xcfe6dc, { opacity: 0.45 }),
    -0.85,
    PRE.top + 0.33,
    -1.48,
  );
  vase.castShadow = false;
  const stemMat = real.wood(0x6b5a44);
  const leafMat = real.plastic(0x8fae9a, { roughness: 0.7 });
  for (let s = 0; s < 4; s++) {
    const a = -0.5 + s * 0.35;
    const stem = addM(
      new THREE.CylinderGeometry(0.008, 0.012, 1.4, 6),
      stemMat,
      -0.85 + Math.sin(a) * 0.3,
      PRE.top + 1.0,
      -1.48 + Math.cos(a * 2) * 0.06,
    );
    stem.rotation.z = -a * 0.6;
    for (let k = 0; k < 7; k++) {
      const lf = addM(
        new THREE.SphereGeometry(0.07, 16, 10),
        leafMat,
        stem.position.x - Math.sin(-a * 0.6) * (k * 0.09 + 0.05),
        PRE.top + 0.55 + k * 0.12,
        stem.position.z + (k % 2 ? 0.05 : -0.05),
      );
      lf.scale.set(1, 1, 0.25);
    }
  }
}

// ---------------------------------------------------------------- toilet (the subject's rival)
export const toilet = new THREE.Group();
ground.add(toilet);
const TS = 0.72; // real seat size: 37 × 45 cm
toilet.scale.set(TS, 1, TS);
toilet.position.z = PRE.z * (1 - TS);
export const ceramicMat = real.ceramic(0xf7f6f2, { roughness: 0.12 });
export const seatMat = new THREE.MeshPhysicalMaterial({
  color: 0xfbfbf8,
  roughness: 0.2,
  clearcoat: 1,
  clearcoatRoughness: 0.08,
});
const BOWL_Z = 0.25; // bowl centre z
export const SEAT_Y = 1.28;
{
  // bowl body: lathe stretched along z, hanging from the pre-wall
  const prof = [];
  for (let i = 0; i <= 24; i++) {
    const f = i / 24;
    const y = 0.42 + f * 0.76;
    const rad = 0.42 + Math.sin(f * Math.PI * 0.5) * 0.36 - (f > 0.94 ? (f - 0.94) * 2 : 0);
    prof.push(new THREE.Vector2(rad, y));
  }
  const body = addM(new THREE.LatheGeometry(prof, 96), ceramicMat, 0, 0, BOWL_Z, toilet);
  body.scale.set(1, 1, 1.32);
  // back block into the wall
  addM(roundedBox(1.0, 0.75, 0.9, 0.12), ceramicMat, 0, 0.8, PRE.z + 0.3, toilet);
  // water in the bowl
  const water = addM(
    new THREE.CircleGeometry(0.4, 48),
    real.glass(0x9fd6e8, { opacity: 0.6 }),
    0,
    0.92,
    BOWL_Z + 0.08,
    toilet,
    false,
  );
  water.rotation.x = -Math.PI / 2;
  water.scale.set(1, 1.3, 1);
  const inner = addM(
    new THREE.CylinderGeometry(0.62, 0.38, 0.28, 48, 1, true),
    real.ceramic(0xeceae4, { side: THREE.DoubleSide }),
    0,
    1.05,
    BOWL_Z + 0.02,
    toilet,
    false,
  );
  inner.scale.set(1, 1, 1.3);
}
// seat: an oval ring + the lid standing open against the pre-wall
export const seat = new THREE.Group();
seat.position.set(0, SEAT_Y - 0.05, BOWL_Z + 0.02);
toilet.add(seat);
{
  const outer = new THREE.Shape();
  outer.absellipse(0, 0, 0.8, 1.02, 0, Math.PI * 2);
  const hole = new THREE.Path();
  hole.absellipse(0, 0.06, 0.5, 0.7, 0, Math.PI * 2);
  outer.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(outer, {
    depth: 0.06,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.03,
    bevelSegments: 4,
    curveSegments: 72,
  });
  g.rotateX(-Math.PI / 2);
  addM(g, seatMat, 0, 0, 0, seat);
  // lid
  const lidS = new THREE.Shape();
  lidS.absellipse(0, 0, 0.82, 0.74, 0, Math.PI * 2);
  const lg = new THREE.ExtrudeGeometry(lidS, {
    depth: 0.05,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 4,
    curveSegments: 72,
  });
  const lid = addM(lg, seatMat, 0, 0.72, -1.0, seat);
  lid.rotation.x = -0.12;
  // hinges
  for (const x of [-0.45, 0.45])
    addM(
      new THREE.CylinderGeometry(0.05, 0.05, 0.16, 24),
      real.metal(0xd8dbe0, { roughness: 0.2 }),
      x,
      0.06,
      -0.98,
      seat,
    ).rotation.z = Math.PI / 2;
}
export const SEAT_TOP = SEAT_Y + 0.07;
export const SEAT_C = [0, SEAT_TOP, PRE.z * (1 - TS) + (BOWL_Z + 0.02) * TS];
export const SEAT_SCALE = TS;

// paper holder (black steel stand) right of the toilet
{
  const steel = real.metal(0x1d1d1f, { roughness: 0.4 });
  addM(new THREE.CylinderGeometry(0.03, 0.03, 2.2, 16), steel, 1.85, 1.1, -0.9);
  addM(new THREE.CylinderGeometry(0.26, 0.26, 0.04, 32), steel, 1.85, 0.02, -0.9);
  const arm = addM(new THREE.CylinderGeometry(0.02, 0.02, 0.36, 12), steel, 1.85, 1.7, -0.72);
  arm.rotation.x = Math.PI / 2;
  const roll = addM(
    new THREE.CylinderGeometry(0.17, 0.17, 0.33, 40),
    real.fabric(0xfbfaf6),
    1.85,
    1.7,
    -0.68,
  );
  roll.rotation.z = Math.PI / 2;
  roll.rotation.y = Math.PI / 2;
  const roll2 = addM(
    new THREE.CylinderGeometry(0.17, 0.17, 0.33, 40),
    real.fabric(0xfbfaf6),
    1.85,
    2.38,
    -0.9,
  );
  roll2.rotation.x = 0;
}

// ---------------------------------------------------------------- vanity + LED mirror (right)
{
  const oak = real.wood(0xa8784a, { roughness: 0.55 });
  addM(roundedBox(2.8, 1.5, 1.4, 0.05), oak, 4.6, 1.95, -1.1);
  // drawer seam + handle
  addM(new THREE.BoxGeometry(2.72, 0.02, 0.01), flat(0x3b2a1a), 4.6, 1.95, -0.39);
  addM(roundedBox(0.9, 0.05, 0.06, 0.02), real.metal(0x1d1d1f), 4.6, 2.4, -0.37);
  // countertop + basin
  addM(roundedBox(2.9, 0.1, 1.45, 0.03), real.ceramic(0xefece6), 4.6, 2.75, -1.1);
  const basin = addM(new THREE.CylinderGeometry(0.62, 0.5, 0.4, 64), ceramicMat, 4.6, 3.0, -1.05);
  addM(
    new THREE.CylinderGeometry(0.55, 0.45, 0.05, 48),
    real.ceramic(0xdedbd4),
    4.6,
    3.18,
    -1.05,
    ground,
    false,
  );
  basin.castShadow = true;
  // tap
  const chrome = real.metal(0xe4e6ea, { roughness: 0.1 });
  addM(new THREE.CylinderGeometry(0.05, 0.06, 0.6, 32), chrome, 4.6, 3.1, -1.65);
  const spout = addM(new THREE.CylinderGeometry(0.035, 0.035, 0.42, 24), chrome, 4.6, 3.38, -1.45);
  spout.rotation.x = Math.PI / 2;
  // drip
  const drop = addM(
    new THREE.SphereGeometry(0.03, 16, 12),
    real.glass(0xd8f0ff, { opacity: 0.8 }),
    4.6,
    3.3,
    -1.25,
    ground,
    false,
  );
  onFrame((t) => {
    const p = (t * 0.7) % 1;
    drop.position.y = 3.33 - (p > 0.6 ? ((p - 0.6) / 0.4) ** 2 * 0.15 : 0);
    drop.scale.setScalar(p > 0.6 ? 1 : 0.4 + p);
    drop.visible = p < 0.98;
  });
  // soap + toothbrush cup
  addM(roundedBox(0.32, 0.5, 0.22, 0.08), real.plastic(0xd8c4a8), 5.6, 3.05, -1.5);
  addM(new THREE.CylinderGeometry(0.03, 0.03, 0.15, 12), real.metal(0x1d1d1f), 5.6, 3.37, -1.5);
  addM(new THREE.CylinderGeometry(0.14, 0.12, 0.36, 32), real.ceramic(0x2d2d30), 3.55, 2.98, -1.5);
  for (const [dx, c] of [
    [-0.04, 0x46b5ff],
    [0.05, 0xff7a59],
  ]) {
    const b = addM(
      new THREE.CylinderGeometry(0.02, 0.02, 0.6, 10),
      real.plastic(c),
      3.55 + dx,
      3.3,
      -1.5,
    );
    b.rotation.z = dx * 3;
  }
  // round mirror with LED ring
  const mirror = addM(
    new THREE.CircleGeometry(1.15, 72),
    real.metal(0xdfe6ee, { roughness: 0.04 }),
    4.6,
    4.9,
    WZ + 0.06,
    ground,
    false,
  );
  mirror.userData.noAO = true;
  const ring = addM(
    new THREE.TorusGeometry(1.17, 0.035, 12, 96),
    new THREE.MeshStandardMaterial({ color: 0xffe2b8, emissive: 0xffc98a, emissiveIntensity: 2.2 }),
    4.6,
    4.9,
    WZ + 0.08,
    ground,
    false,
  );
  ring.userData.noAO = true;
  SET_LIGHTS.push(ring);
  // towel ring + towel
  addM(new THREE.TorusGeometry(0.28, 0.025, 12, 48), chrome, 2.9, 4.2, WZ + 0.06);
  const towel = addM(roundedBox(0.62, 1.1, 0.1, 0.05), real.fabric(0xe9d9c0), 2.9, 3.55, WZ + 0.12);
  towel.rotation.z = 0.02;
}
// bath mat + rattan basket
addM(
  roundedBox(2.2, 0.04, 1.2, 0.04),
  real.fabric(0xc8b9a2),
  4.6,
  0.02,
  0.6,
  ground,
  false,
).receiveShadow = true;
{
  const basket = addM(
    new THREE.CylinderGeometry(0.62, 0.52, 1.5, 48, 6, true),
    real.wood(0xc19a63, { side: THREE.DoubleSide, roughness: 0.9 }),
    7.4,
    0.75,
    0.4,
  );
  for (let i = 0; i < 6; i++)
    addM(
      new THREE.TorusGeometry(0.6 - i * 0.015, 0.018, 8, 48),
      real.wood(0x9c7845),
      7.4,
      0.2 + i * 0.25,
      0.4,
    ).rotation.x = Math.PI / 2;
  const cloth = addM(
    new THREE.SphereGeometry(0.45, 24, 16),
    real.fabric(0x5a6f8c),
    7.35,
    1.4,
    0.45,
  );
  cloth.scale.set(1.1, 0.5, 1);
  basket.castShadow = true;
}

// ---------------------------------------------------------------- shower (left)
{
  const glass = addM(
    new THREE.PlaneGeometry(2.6, 6.2),
    real.glass(0xd8ecf2, { opacity: 0.16, side: THREE.DoubleSide }),
    -2.2,
    3.1,
    -0.5,
    ground,
    false,
  );
  glass.rotation.y = Math.PI / 2;
  const blk = real.metal(0x1d1d1f, { roughness: 0.4 });
  addM(new THREE.BoxGeometry(0.04, 6.2, 0.04), blk, -2.2, 3.1, 0.8);
  addM(new THREE.BoxGeometry(0.04, 0.04, 2.6), blk, -2.2, 6.2, -0.5);
  addM(new THREE.CylinderGeometry(0.02, 0.02, 1.6, 12), blk, -2.2, 6.9, -1.1).rotation.x = 0.6;
  // rain head
  addM(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 12), blk, -4.4, 7.4, -1.2).rotation.x =
    Math.PI / 2;
  addM(new THREE.CylinderGeometry(0.6, 0.6, 0.05, 48), blk, -4.4, 7.35, -0.6);
  // niche with bottles
  addM(new THREE.BoxGeometry(1.4, 0.06, 0.3), real.ceramic(0xefece6), -5.0, 3.0, WZ + 0.15);
  [
    [0x2f2f33, 0.6],
    [0xe7e2d8, 0.5],
    [0x9b6f4f, 0.45],
  ].forEach(([c, h], i) =>
    addM(
      roundedBox(0.22, h, 0.18, 0.06),
      real.plastic(c),
      -5.4 + i * 0.35,
      3.03 + h / 2,
      WZ + 0.15,
    ),
  );
  // floor drain strip
  addM(
    new THREE.BoxGeometry(2.0, 0.01, 0.12),
    real.metal(0x9a9ea6),
    -4.4,
    0.01,
    -1.4,
    ground,
    false,
  );
}

// ---------------------------------------------------------------- life: dust in the lamp light
fireflies(26, { area: [-2.5, 4.5, 2.5, 7.5, -1.5, 3.5], color: 0xfff1d6, seed: 93, size: 0.02 });

// ---------------------------------------------------------------- mini-set 1: U-Bahn (beat 2)
export const ubahn = new THREE.Group();
ubahn.position.set(...UBAHN);
ground.add(ubahn);
export const POLE = [0, 0, 0]; // relative to UBAHN
{
  addM(
    new THREE.BoxGeometry(12, 0.1, 10),
    flat(0x4d5056, { flatShading: false, roughness: 0.8 }),
    0,
    -0.05,
    0,
    ubahn,
    false,
  );
  // dotted rubber floor
  addM(
    new THREE.BoxGeometry(12, 9, 0.2),
    flat(0xd9dde2, { flatShading: false }),
    0,
    4.5,
    -3,
    ubahn,
    false,
  );
  // window band with the tunnel rushing by
  const tunnel = new THREE.Group();
  ubahn.add(tunnel);
  addM(
    new THREE.PlaneGeometry(8, 2.6),
    new THREE.MeshBasicMaterial({ color: 0x0b0d12 }),
    0,
    4.6,
    -2.88,
    ubahn,
    false,
  );
  const lamps = [];
  for (let i = 0; i < 6; i++)
    lamps.push(
      addM(
        new THREE.PlaneGeometry(0.7, 0.08),
        new THREE.MeshBasicMaterial({ color: 0xfff0c0 }),
        0,
        4.2 + (i % 2) * 0.9,
        -2.86,
        tunnel,
        false,
      ),
    );
  onFrame((t) => lamps.forEach((l, i) => (l.position.x = 4 - ((t * 14 + i * 2.7) % 9))));
  // frame around the window
  const blue = real.plastic(0x2b5fb8);
  addM(roundedBox(8.4, 0.3, 0.3, 0.08), blue, 0, 3.15, -2.8, ubahn);
  addM(roundedBox(8.4, 0.3, 0.3, 0.08), blue, 0, 6.05, -2.8, ubahn);
  // the yellow pole + crossbar
  const yel = real.gloss(0xf2c21b);
  addM(new THREE.CylinderGeometry(0.12, 0.12, 9, 32), yel, 0, 4.5, 0, ubahn);
  addM(new THREE.CylinderGeometry(0.1, 0.1, 9, 24), yel, 0, 7.6, -1.4, ubahn).rotation.z =
    Math.PI / 2;
  // seats
  for (const x of [-3.2, 3.2]) {
    addM(roundedBox(2.4, 0.3, 1.4, 0.12), real.fabric(0x2b4f8c), x, 1.5, -2.0, ubahn);
    addM(roundedBox(2.4, 1.6, 0.25, 0.1), real.fabric(0x2b4f8c), x, 2.4, -2.65, ubahn);
  }
  const l = new THREE.PointLight(0xeef4ff, 18, 14, 1.4);
  l.position.set(0, 8, 3);
  ubahn.add(l);
}

// ---------------------------------------------------------------- mini-set 2: kitchen worktop (beat 2)
export const kueche = new THREE.Group();
kueche.position.set(...KUECHE);
ground.add(kueche);
export const BOARD = [0, 2.75, 0]; // top of the cutting board, relative
{
  addM(
    roundedBox(10, 0.25, 4, 0.05),
    real.ceramic(0x2e2e30, { roughness: 0.3 }),
    0,
    2.5,
    0,
    kueche,
  );
  addM(
    new THREE.BoxGeometry(10, 2.5, 3.8),
    flat(0xe8e2d6, { flatShading: false }),
    0,
    1.24,
    0.05,
    kueche,
  );
  const back = tileTex({
    cols: 6,
    rows: 3,
    base: 0xf1ede6,
    vary: 0.04,
    grout: "#bdb6aa",
    seed: 11,
  });
  back.repeat.set(3, 2);
  addM(
    new THREE.PlaneGeometry(10, 5),
    new THREE.MeshPhysicalMaterial({ map: back, roughness: 0.2, clearcoat: 0.6 }),
    0,
    5.1,
    -2,
    kueche,
    false,
  );
  addM(roundedBox(2.6, 0.12, 1.6, 0.06), real.wood(0xc89a62), 0.4, 2.69, 0.2, kueche);
  // raw chicken drumsticks
  const meat = real.skin(0xf0b3a4, { roughness: 0.45, clearcoat: 0.6, clearcoatRoughness: 0.2 });
  for (let i = 0; i < 3; i++) {
    const g = new THREE.Group();
    g.position.set(0.1 + i * 0.55, 2.86, 0.1 + (i % 2) * 0.35);
    g.rotation.y = 0.4 + i * 0.5;
    kueche.add(g);
    const lump = addM(new THREE.SphereGeometry(0.26, 32, 20), meat, 0, 0, 0, g);
    lump.scale.set(1.5, 0.7, 1);
    addM(
      new THREE.CylinderGeometry(0.06, 0.08, 0.5, 16),
      real.ceramic(0xf3e9dc),
      0.5,
      0,
      0,
      g,
    ).rotation.z = Math.PI / 2;
  }
  // knife
  addM(
    roundedBox(1.0, 0.02, 0.16, 0.01),
    real.metal(0xd6d9de, { roughness: 0.15 }),
    -2.4,
    2.66,
    0.9,
    kueche,
  ).rotation.y = 0.3;
  addM(
    roundedBox(0.5, 0.06, 0.12, 0.03),
    real.plastic(0x1d1d1f),
    -3.05,
    2.68,
    1.1,
    kueche,
  ).rotation.y = 0.3;
  const l = new THREE.PointLight(0xfff0dc, 16, 12, 1.4);
  l.position.set(1, 7, 3);
  kueche.add(l);
  addM(new THREE.SphereGeometry(0.5, 24, 16), real.plastic(0xe24a3b), -3.2, 3.1, -0.6, kueche); // tomato
  addM(roundedBox(0.8, 1.2, 0.8, 0.2), real.plastic(0xf7f2e6), 3.3, 3.2, -0.9, kueche); // milk carton
}

finishSet({ ground: 0x6c665f });
export { V };
