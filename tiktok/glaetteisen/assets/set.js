// #66 Glätteisen — a vanity table on a rainy winter morning, seen up close
// (1 unit = 10 cm). Light oak top against a sage-green wall, a white
// Hollywood mirror with warm bulbs (hero piece), on the right a tall window
// with rain running down the glass and wet town roofs outside in the blue
// morning. On the table: the phone with the 07:52 alarm, a steaming mug,
// a round brush, a pink heat-protection spray, hair ties, a cup of make-up
// brushes, a plant, the silicone mat for the iron. Life: rain outside and
// drops on the glass, steam off the coffee, the plant sways, bulbs shimmer.
// The strand + iron + hand live in scene.js (they move).
import { THREE, flat, ground, onFrame, rng, real, roundedBox, scene } from "./world.js";
import { setSky, finishSet } from "./environments.js";

export const TABLE_Y = 0;
const R = rng(66);
const PI = Math.PI;

// ---------------------------------------------------------------- light
setSky({
  top: [0.36, 0.44, 0.58],
  mid: [0.55, 0.62, 0.73],
  hor: [0.74, 0.77, 0.82],
  below: [0.24, 0.25, 0.28],
  sun: [0.25, 0.27, 0.3],
  sunDir: [1, 0.3, -0.5],
  cloud: [0xffffff, 0x000000],
  noClouds: true,
  birds: false,
  stars: 0,
  hemi: [0xe2ebf6, 0x6e5a48, 1.5],
  key: [0xe4edff, 2.1],
  keyPos: [16, 20, 8],
  rim: [0xffc890, 0.8],
  fog: [70, 180],
});

const add = (mesh, x, y, z, parent = ground) => {
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
};
const canvasTex = (w, h, draw) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
};

// ---------------------------------------------------------------- room
// floor (herringbone-ish planks), far below the table top
{
  const tex = canvasTex(512, 512, (g) => {
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 4; x++) {
        const v = 120 + Math.floor(R() * 30);
        g.fillStyle = `rgb(${v + 40},${v + 12},${v - 20})`;
        g.fillRect(x * 128 + (y % 2) * 64 - 64, y * 32, 128, 32);
        g.strokeStyle = "rgba(60,35,20,0.5)";
        g.strokeRect(x * 128 + (y % 2) * 64 - 64, y * 32, 128, 32);
      }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(5, 5);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 60),
    new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.45, clearcoat: 0.3 }),
  );
  floor.rotation.x = -PI / 2;
  floor.position.set(0, -7.5, 10);
  floor.receiveShadow = true;
  ground.add(floor);
}
// walls: sage green, a white baseboard
const wallMat = new THREE.MeshPhysicalMaterial({ color: 0x8fa38b, roughness: 0.92 });
{
  // back wall in four pieces around the window opening (x 8.6..15.6, y 2.4..15.5)
  for (const [x0, x1, y0, y1] of [
    [-40, 8.6, -13, 37],
    [15.6, 40, -13, 37],
    [8.6, 15.6, 15.5, 37],
    [8.6, 15.6, -13, 2.4],
  ]) {
    const back = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, y1 - y0), wallMat);
    back.position.set((x0 + x1) / 2, (y0 + y1) / 2, -5);
    back.receiveShadow = true;
    ground.add(back);
  }
  for (const sx of [-1, 1]) {
    const side = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), wallMat);
    side.rotation.y = (-sx * PI) / 2;
    side.position.set(sx * 26, 12, 18);
    side.receiveShadow = true;
    ground.add(side);
  }
  add(new THREE.Mesh(roundedBox(80, 1.2, 0.3, 0.08), real.plastic(0xf4f1ea)), 0, -6.9, -4.85);
  // a framed print on the left wall area
  const print = canvasTex(256, 320, (g, w, h) => {
    g.fillStyle = "#f3ece2";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#e6a48f";
    g.beginPath();
    g.arc(128, 150, 78, 0, PI * 2);
    g.fill();
    g.fillStyle = "#4f6b5a";
    g.fillRect(40, 230, 176, 14);
  });
  add(new THREE.Mesh(roundedBox(4.4, 5.4, 0.25, 0.08), real.wood(0x2b2420)), -13.5, 9.5, -4.82);
  add(
    new THREE.Mesh(
      new THREE.PlaneGeometry(3.8, 4.8),
      new THREE.MeshPhysicalMaterial({ map: print, roughness: 0.7 }),
    ),
    -13.5,
    9.5,
    -4.68,
  );
}

// ---------------------------------------------------------------- table
{
  const oak = real.wood(0xd8b78a, { roughness: 0.55, clearcoat: 0.25, clearcoatRoughness: 0.4 });
  const tex = canvasTex(1024, 256, (g, w, h) => {
    g.fillStyle = "#d8b78a";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      const y = R() * h;
      g.strokeStyle = `rgba(${150 + R() * 40},${105 + R() * 30},${60 + R() * 20},${0.12 + R() * 0.2})`;
      g.lineWidth = 1 + R() * 3;
      g.beginPath();
      g.moveTo(0, y);
      for (let x = 0; x <= w; x += 64) g.lineTo(x, y + Math.sin(x * 0.01 + i) * 6);
      g.stroke();
    }
  });
  oak.map = tex;
  oak.color.set(0xffffff);
  add(new THREE.Mesh(roundedBox(34, 0.6, 10.6, 0.18, 6), oak), 0, -0.3, 0.5);
  // apron + two drawers with brass knobs
  const apron = real.wood(0xcfae80, { roughness: 0.6 });
  add(new THREE.Mesh(roundedBox(32.6, 1.6, 0.4, 0.1), apron), 0, -1.45, 5.45);
  for (const x of [-8, 8]) {
    add(new THREE.Mesh(roundedBox(9, 1.2, 0.12, 0.06), real.wood(0xd4b385)), x, -1.45, 5.7);
    add(
      new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 24, 16),
        real.metal(0xd9b46a, { roughness: 0.25 }),
      ),
      x,
      -1.45,
      5.85,
    );
  }
  for (const x of [-16, 16])
    for (const z of [-4, 5])
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.3, 7, 24), apron), x, -4.3, z);
}

// ---------------------------------------------------------------- Hollywood mirror (hero piece)
export const MIRROR = { x: -1.5, y: 8.8, w: 14, h: 11 };
export const BULBS = [];
{
  const frameMat = real.plastic(0xf6f3ee, { roughness: 0.3, clearcoat: 0.6 });
  const g = new THREE.Group();
  g.position.set(MIRROR.x, MIRROR.y, -4.6);
  ground.add(g);
  const fr = new THREE.Mesh(roundedBox(MIRROR.w, MIRROR.h, 0.6, 0.25, 6), frameMat);
  fr.castShadow = fr.receiveShadow = true;
  g.add(fr);
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(MIRROR.w - 2.4, MIRROR.h - 2.4),
    new THREE.MeshPhysicalMaterial({
      map: canvasTex(256, 256, (c, w, h) => {
        // a soft, out-of-focus reflection of the room: warm bulb light at the
        // top, the sage wall, a bright window patch on the right
        const gr = c.createLinearGradient(0, 0, 0, h);
        gr.addColorStop(0, "#bfb19c");
        gr.addColorStop(0.45, "#8f9a8a");
        gr.addColorStop(1, "#6d7868");
        c.fillStyle = gr;
        c.fillRect(0, 0, w, h);
        const wg = c.createRadialGradient(205, 90, 5, 205, 90, 80);
        wg.addColorStop(0, "rgba(225,235,250,0.9)");
        wg.addColorStop(1, "rgba(225,235,250,0)");
        c.fillStyle = wg;
        c.fillRect(0, 0, w, h);
      }),
      metalness: 0.35,
      roughness: 0.08,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      envMapIntensity: 1.2,
    }),
  );
  glass.position.z = 0.31;
  g.add(glass);
  // soft reflection hints: a warm blur of the bulbs + a cool window streak
  const refl = canvasTex(256, 256, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, "rgba(255,255,255,0)");
    gr.addColorStop(0.45, "rgba(255,255,255,0.10)");
    gr.addColorStop(0.5, "rgba(255,255,255,0.22)");
    gr.addColorStop(0.56, "rgba(255,255,255,0.08)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = gr;
    c.fillRect(0, 0, w, h);
  });
  const sheen = new THREE.Mesh(
    new THREE.PlaneGeometry(MIRROR.w - 2.4, MIRROR.h - 2.4),
    new THREE.MeshBasicMaterial({ map: refl, transparent: true, depthWrite: false }),
  );
  sheen.position.z = 0.32;
  sheen.userData.noAO = true;
  g.add(sheen);
  // bulbs around the frame
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xfff4e0,
    emissive: 0xffd9a0,
    emissiveIntensity: 2.4,
    roughness: 0.2,
  });
  const sockMat = real.metal(0xd8d2c6, { roughness: 0.3 });
  const pts = [];
  for (let i = 0; i < 5; i++)
    pts.push([-MIRROR.w / 2 + 1.6 + (i * (MIRROR.w - 3.2)) / 4, MIRROR.h / 2 - 0.6]);
  for (let i = 1; i < 4; i++)
    pts.push(
      [-MIRROR.w / 2 + 0.6, MIRROR.h / 2 - 0.6 - (i * (MIRROR.h - 1.2)) / 4],
      [MIRROR.w / 2 - 0.6, MIRROR.h / 2 - 0.6 - (i * (MIRROR.h - 1.2)) / 4],
    );
  for (const [x, y] of pts) {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.3, 24), sockMat);
    s.rotation.x = PI / 2;
    s.position.set(x, y, 0.4);
    g.add(s);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 20), bulbMat);
    b.position.set(x, y, 0.75);
    b.userData.noAO = true;
    g.add(b);
    BULBS.push(b);
  }
  for (const [x, y, i] of [
    [-4, 4.5, 26],
    [4, 4.5, 26],
    [0, -3, 10],
  ]) {
    const l = new THREE.PointLight(0xffd29a, i, 26, 1.6);
    l.position.set(x, y, 2.5);
    g.add(l);
  }
  onFrame(
    (t) => (bulbMat.emissiveIntensity = 2.3 + Math.sin(t * 2.1) * 0.06 + Math.sin(t * 7.3) * 0.03),
  );
}

// ---------------------------------------------------------------- window with rain
export const WIN = { x0: 8.6, x1: 15.6, y0: 2.4, y1: 15.5 };
{
  const cx = (WIN.x0 + WIN.x1) / 2;
  const cy = (WIN.y0 + WIN.y1) / 2;
  const w = WIN.x1 - WIN.x0;
  const h = WIN.y1 - WIN.y0;
  // cut the wall: the back wall stays, a dark "hole" frame sits on it and the
  // outside view is a canvas a little behind the glass
  const out = canvasTex(512, 900, (g, W, H) => {
    const gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, "#7d8fa8");
    gr.addColorStop(0.55, "#a9b4c2");
    gr.addColorStop(1, "#5f6a7a");
    g.fillStyle = gr;
    g.fillRect(0, 0, W, H);
    // wet roofs + facades of the house across the street
    const r2 = rng(5);
    for (let i = 0; i < 6; i++) {
      const x = i * 100 - 20 + r2() * 30;
      const top = 470 + r2() * 120;
      g.fillStyle = `rgb(${70 + r2() * 30},${74 + r2() * 26},${86 + r2() * 26})`;
      g.beginPath();
      g.moveTo(x, top);
      g.lineTo(x + 55, top - 70);
      g.lineTo(x + 115, top);
      g.lineTo(x + 115, H);
      g.lineTo(x, H);
      g.fill();
      for (let k = 0; k < 6; k++) {
        const lit = r2() < 0.35;
        g.fillStyle = lit ? "#ffd08a" : "#3d4656";
        g.fillRect(x + 14 + (k % 2) * 48, top + 30 + Math.floor(k / 2) * 90, 26, 40);
      }
    }
  });
  const view = new THREE.Mesh(
    new THREE.PlaneGeometry(w + 6, h + 6),
    new THREE.MeshBasicMaterial({ map: out, fog: false }),
  );
  view.position.set(cx, cy, -9.5);
  view.userData.noAO = true;
  ground.add(view);
  // window opening: four reveals so the wall looks cut
  const reveal = real.plastic(0xeeeae2, { roughness: 0.6 });
  const T = 4.6;
  for (const [x, y, ww, hh, dd] of [
    [cx, WIN.y1 + 0.15, w + 0.3, 0.3, T],
    [cx, WIN.y0 - 0.15, w + 0.3, 0.3, T],
    [WIN.x0 - 0.15, cy, 0.3, h, T],
    [WIN.x1 + 0.15, cy, 0.3, h, T],
  ])
    add(new THREE.Mesh(new THREE.BoxGeometry(ww, hh, dd), reveal), x, y, -5 - T / 2 + 0.05);
  // wall around the opening is covered by the back wall plane — punch the
  // view through by drawing it in front of the wall: a thin black mask frame
  // is not needed because the frame + sill sit on the wall face
  const frame = real.plastic(0xffffff, { roughness: 0.35, clearcoat: 0.5 });
  for (const [x, y, ww, hh] of [
    [cx, WIN.y1, w + 0.8, 0.5],
    [cx, WIN.y0, w + 0.8, 0.5],
    [WIN.x0, cy, 0.5, h],
    [WIN.x1, cy, 0.5, h],
    [cx, cy + 1.6, w, 0.35],
    [cx, cy, 0.35, h],
  ])
    add(new THREE.Mesh(roundedBox(ww, hh, 0.5, 0.1), frame), x, y, -4.7);
  // sill
  add(new THREE.Mesh(roundedBox(w + 2, 0.4, 1.6, 0.12), frame), cx, WIN.y0 - 0.4, -4.1);
  // glass pane (slightly blue, reflective)
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    real.glass(0xd8e6f0, { opacity: 0.18 }),
  );
  glass.position.set(cx, cy, -4.9);
  ground.add(glass);
  // rain streaks outside
  const NR = 160;
  const rainMat = new THREE.MeshBasicMaterial({
    color: 0xdfe8f2,
    transparent: true,
    opacity: 0.45,
    fog: false,
  });
  const rain = new THREE.InstancedMesh(new THREE.BoxGeometry(0.025, 0.7, 0.025), rainMat, NR);
  rain.userData.noAO = true;
  ground.add(rain);
  const RD = Array.from({ length: NR }, () => ({
    x: WIN.x0 - 2 + R() * (w + 4),
    z: -6 - R() * 3,
    ph: R(),
    sp: 0.7 + R() * 0.5,
  }));
  // drops on the glass, sliding down in jerks
  const ND = 46;
  const dropMat = new THREE.MeshPhysicalMaterial({
    color: 0xeef6ff,
    roughness: 0.02,
    transmission: 0,
    transparent: true,
    opacity: 0.55,
    envMapIntensity: 2,
  });
  const drops = new THREE.InstancedMesh(new THREE.SphereGeometry(0.11, 14, 10), dropMat, ND);
  drops.userData.noAO = true;
  ground.add(drops);
  const DD = Array.from({ length: ND }, () => ({
    x: WIN.x0 + 0.4 + R() * (w - 0.8),
    y0: WIN.y0 + R() * h,
    ph: R(),
    s: 0.5 + R() * 0.9,
    sp: 0.15 + R() * 0.5,
  }));
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  const p = new THREE.Vector3();
  onFrame((t) => {
    RD.forEach((r, i) => {
      const k = (t * 1.6 * r.sp + r.ph) % 1;
      p.set(r.x - k * 0.4, WIN.y1 + 3 - k * (h + 6), r.z);
      s.set(1, 1, 1);
      rain.setMatrixAt(i, m4.compose(p, q, s));
    });
    rain.instanceMatrix.needsUpdate = true;
    DD.forEach((d, i) => {
      // stick-slip: mostly still, then a quick run down
      const c = t * d.sp + d.ph;
      const run = Math.floor(c) + Math.min(1, (c % 1) * 4) ** 2;
      let y = d.y0 - run * 1.4;
      y = WIN.y0 + ((((y - WIN.y0) % h) + h) % h);
      p.set(d.x + Math.sin(c * 3) * 0.05, y, -4.86);
      s.set(d.s, d.s * 1.25, d.s * 0.5);
      drops.setMatrixAt(i, m4.compose(p, q, s));
    });
    drops.instanceMatrix.needsUpdate = true;
  });
}

// ---------------------------------------------------------------- props on the table
// phone with the alarm screen (07:52 — late!)
export const PHONE = [-5.6, 0.05, 2.6];
{
  const g = new THREE.Group();
  g.position.set(...PHONE);
  g.rotation.y = 0.25;
  ground.add(g);
  const body = new THREE.Mesh(
    roundedBox(3.4, 0.16, 7.0, 0.07, 6),
    real.metal(0x9aa3ad, { roughness: 0.25 }),
  );
  body.position.y = 0.08;
  body.castShadow = body.receiveShadow = true;
  g.add(body);
  const scr = canvasTex(340, 700, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, "#1a1f3a");
    gr.addColorStop(1, "#3a2244");
    c.fillStyle = gr;
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#ffffff";
    c.font = "bold 110px Montserrat, Arial";
    c.textAlign = "center";
    c.fillText("07:52", w / 2, 230);
    c.font = "600 34px Montserrat, Arial";
    c.fillStyle = "#ffb4b4";
    c.fillText("Wecker · zu spät!", w / 2, 300);
    c.fillStyle = "#ff4b5c";
    c.beginPath();
    c.roundRect(60, 520, 220, 80, 40);
    c.fill();
    c.fillStyle = "#fff";
    c.font = "bold 38px Montserrat, Arial";
    c.fillText("Stopp", w / 2, 574);
  });
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(3.15, 6.7),
    new THREE.MeshStandardMaterial({
      map: scr,
      emissive: 0xffffff,
      emissiveMap: scr,
      emissiveIntensity: 0.9,
      roughness: 0.15,
    }),
  );
  screen.rotation.x = -PI / 2;
  screen.position.y = 0.17;
  g.add(screen);
}
// mug with coffee + steam
export const MUG = [7.2, 0, -0.8];
{
  const g = new THREE.Group();
  g.position.set(...MUG);
  ground.add(g);
  const pts = [];
  for (let i = 0; i <= 24; i++) {
    const k = i / 24;
    pts.push(
      new THREE.Vector2(1.25 + Math.sin(k * PI) * 0.06 - (k < 0.05 ? (0.05 - k) * 3 : 0), k * 3.2),
    );
  }
  const mug = new THREE.Mesh(
    new THREE.LatheGeometry(pts, 64),
    real.ceramic(0xe9d6c2, { side: THREE.DoubleSide }),
  );
  mug.castShadow = mug.receiveShadow = true;
  g.add(mug);
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(1.25, 48), real.ceramic(0xe9d6c2));
  bottom.rotation.x = -PI / 2;
  bottom.position.y = 0.05;
  g.add(bottom);
  const coffee = new THREE.Mesh(
    new THREE.CircleGeometry(1.2, 48),
    real.gloss(0x3a2214, { roughness: 0.15 }),
  );
  coffee.rotation.x = -PI / 2;
  coffee.position.y = 2.7;
  g.add(coffee);
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.75, 0.18, 20, 40, PI * 1.2),
    real.ceramic(0xe9d6c2),
  );
  handle.position.set(1.35, 1.6, 0);
  handle.rotation.z = -PI * 0.6;
  handle.castShadow = true;
  g.add(handle);
  const steamMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
  });
  const NS = 16;
  const steam = new THREE.InstancedMesh(new THREE.SphereGeometry(0.4, 12, 8), steamMat, NS);
  steam.userData.noAO = true;
  g.add(steam);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  const p = new THREE.Vector3();
  onFrame((t) => {
    for (let i = 0; i < NS; i++) {
      const k = (t * 0.22 + i / NS) % 1;
      p.set(Math.sin(k * 7 + i) * 0.4 * k, 3.0 + k * 4.5, Math.cos(k * 5 + i) * 0.3 * k);
      s.setScalar((0.4 + k * 1.6) * Math.sin(k * PI));
      steam.setMatrixAt(i, m4.compose(p, q, s));
    }
    steam.instanceMatrix.needsUpdate = true;
  });
}
// round brush
{
  const g = new THREE.Group();
  g.position.set(-9.6, 0.55, 0.6);
  g.rotation.set(0, 0.5, PI / 2);
  ground.add(g);
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.5, 5.0, 32),
    real.gloss(0x2d2a33),
  );
  handle.position.y = -3.4;
  g.add(handle);
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.55, 3.6, 32),
    real.metal(0xc9b08a, { roughness: 0.35 }),
  );
  barrel.position.y = 0.9;
  g.add(barrel);
  const bristle = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.55, 5),
    real.plastic(0xf2efe8),
    220,
  );
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 220; i++) {
    const a = ((i % 20) / 20) * PI * 2 + (Math.floor(i / 20) % 2) * 0.15;
    const y = -0.7 + Math.floor(i / 20) * 0.32;
    m4.makeRotationZ(-PI / 2);
    m4.premultiply(new THREE.Matrix4().makeRotationY(-a));
    m4.setPosition(Math.cos(a) * 0.8, y, Math.sin(a) * 0.8);
    bristle.setMatrixAt(i, m4);
  }
  g.add(bristle);
  g.traverse((o) => (o.castShadow = true));
}
// heat-protection spray (pink)
{
  const g = new THREE.Group();
  g.position.set(-3.4, 0, -2.6);
  ground.add(g);
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 0.95, 5.4, 48),
    real.gloss(0xf2a3b6),
  );
  body.position.y = 2.7;
  g.add(body);
  const label = canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = "#fbe9ee";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#c23a62";
    c.font = "bold 46px Montserrat, Arial";
    c.textAlign = "center";
    c.fillText("HEAT", w / 2, 110);
    c.fillText("PROTECT", w / 2, 160);
    c.font = "600 26px Montserrat, Arial";
    c.fillText("bis 230 °C", w / 2, 210);
  });
  const lab = new THREE.Mesh(
    new THREE.CylinderGeometry(0.97, 0.97, 2.4, 48, 1, true, -0.9, 1.8),
    new THREE.MeshPhysicalMaterial({ map: label, roughness: 0.4 }),
  );
  lab.position.y = 2.6;
  g.add(lab);
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.9, 0.6, 32),
    real.plastic(0xffffff),
  );
  neck.position.y = 5.7;
  g.add(neck);
  const head = new THREE.Mesh(roundedBox(0.8, 1.0, 1.2, 0.2), real.plastic(0xffffff));
  head.position.set(0, 6.4, 0.1);
  g.add(head);
  g.traverse((o) => (o.castShadow = o.receiveShadow = true));
}
// hair ties
for (const [x, z, c, r] of [
  [-7.4, -0.6, 0x2b2b2e, 0.3],
  [-6.6, 0.1, 0xd48a9a, 1.1],
  [-7.0, 0.9, 0x7a5b4a, 2.2],
]) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.12, 16, 40), real.fabric(c));
  m.rotation.set(PI / 2, 0, r);
  add(m, x, 0.12, z);
}
// cup of make-up brushes
{
  const g = new THREE.Group();
  g.position.set(-11.8, 0, -2.4);
  ground.add(g);
  const cup = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 0.95, 3.0, 48, 1, true),
    real.ceramic(0xf3d9c8, { side: THREE.DoubleSide }),
  );
  cup.position.y = 1.5;
  g.add(cup);
  const cols = [0x2a2a2e, 0xe7c7a4, 0x2a2a2e, 0xc9a15e, 0x2a2a2e];
  cols.forEach((c, i) => {
    const b = new THREE.Group();
    b.position.set(Math.cos(i * 1.3) * 0.45, 0.4, Math.sin(i * 1.3) * 0.45);
    b.rotation.set(Math.sin(i * 2.1) * 0.22, 0, Math.cos(i * 1.7) * 0.22);
    const h = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 4.6, 16), real.gloss(c));
    h.position.y = 2.3;
    b.add(h);
    const fer = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.13, 0.8, 16),
      real.metal(0xd8c08a),
    );
    fer.position.y = 5.0;
    b.add(fer);
    const tuft = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 20, 14),
      real.fabric(i % 2 ? 0x3a2a22 : 0xf2e2d2),
    );
    tuft.scale.set(1, 1.6, 1);
    tuft.position.y = 5.7;
    b.add(tuft);
    g.add(b);
  });
  g.traverse((o) => (o.castShadow = o.receiveShadow = true));
}
// plant (pothos in a terracotta pot) — sways a little
{
  const g = new THREE.Group();
  g.position.set(13.2, 0, -2.4);
  ground.add(g);
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.15, 2.6, 48),
    real.ceramic(0xc4724a, { roughness: 0.75, clearcoat: 0 }),
  );
  pot.position.y = 1.3;
  g.add(pot);
  const soil = new THREE.Mesh(new THREE.CircleGeometry(1.42, 32), flat(0x3a2a1e));
  soil.rotation.x = -PI / 2;
  soil.position.y = 2.5;
  g.add(soil);
  const leafMat = real.gloss(0x3f7a3a, { roughness: 0.45, side: THREE.DoubleSide });
  const leafGeo = new THREE.SphereGeometry(0.7, 20, 12);
  leafGeo.scale(1, 0.18, 1.4);
  const leaves = new THREE.Group();
  leaves.position.y = 2.5;
  g.add(leaves);
  for (let i = 0; i < 22; i++) {
    const a = i * 2.4;
    const r = 0.4 + (i % 5) * 0.35;
    const l = new THREE.Mesh(leafGeo, leafMat);
    l.position.set(Math.cos(a) * r, 0.5 + (i % 7) * 0.45 - (i > 14 ? 1.6 : 0), Math.sin(a) * r);
    l.rotation.set(0.4 + R() * 0.5, -a, 0.3);
    l.castShadow = true;
    leaves.add(l);
  }
  onFrame((t) => (leaves.rotation.z = Math.sin(t * 0.8) * 0.03));
  g.traverse((o) => (o.castShadow = o.receiveShadow = true));
}
// silicone heat mat for the iron
export const MAT = [2.0, 0, 2.6];
add(
  new THREE.Mesh(roundedBox(4.6, 0.14, 2.0, 0.07), real.rubber(0x4a4f57, { roughness: 0.75 })),
  MAT[0],
  0.07,
  MAT[2],
);

finishSet({ ground: 0x8a7a68 });

// keep the scene object reachable for the 4-camera set check
export { scene };
