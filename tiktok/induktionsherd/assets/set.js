// #82 Induktionsherd — the world: a modern Wohnküche late at night, seen
// close (1 unit ≈ 20 cm). The ceiling lights are off; one warm brass
// pendant hangs low over the black induction hob set into an oak worktop.
// Behind: a white subway-tile backsplash, an open shelf with jars, and a
// wide window onto the city at blue hour (lit windows, a moving tram line
// of car lights far below). Near props: cutting board with a knife and
// carrots, a basil pot, a kitchen-paper roll, an olive-oil bottle, a salt
// mill, a utensil crock with wooden spoons. Life: steam (scene.js), dust in
// the lamp light, city car lights, the basil sways a little.
import { THREE, scene, onFrame, rng, real, roundedBox, flat } from "./world.js";
import { setSky, finishSet, fireflies } from "./environments.js";

export const TOP = 0; // worktop surface
export const HOB = { x: 0.55, z: -0.15, w: 3.0, d: 2.6 }; // 60 × 52 cm glass
export const POT = { x: 0, z: 0.25, r: 0.52, h: 0.62 }; // 21 cm pot on the front-left zone
export const WALL = -2.3;
export const FLOOR = -4.5;

setSky({
  top: [0.05, 0.07, 0.2],
  mid: [0.12, 0.14, 0.34],
  hor: [0.42, 0.32, 0.5],
  below: [0.05, 0.05, 0.1],
  sun: [0.2, 0.2, 0.35],
  sunDir: [0.2, 0.1, -1],
  cloud: [0x4a4f78, 0x30344f],
  clouds: 0,
  noClouds: true,
  birds: false,
  stars: 0.3,
  hemi: [0x6f7fb8, 0x2a1d16, 0.55],
  key: [0xffc98a, 2.6],
  keyPos: [1.5, 16, 6],
  rim: [0x7aa6ff, 1.1],
  fog: [40, 160],
});

// ---------------------------------------------------------------- helpers
export const tex = (w, h, draw, rx = 1, ry = 1) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};
export const put = (geo, mat, x, y, z, parent = scene, shadow = true) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};

// ---------------------------------------------------------------- the pendant light (warm pool on the hob)
const spot = new THREE.SpotLight(0xffc27a, 60, 18, 0.62, 0.55, 1.6);
spot.position.set(0.4, 7.5, 0.2);
spot.target.position.set(0.3, 0, 0);
spot.castShadow = true;
spot.shadow.mapSize.set(2048, 2048);
spot.shadow.bias = -0.0004;
scene.add(spot, spot.target);
const brass = real.metal(0xc9a063, { roughness: 0.28 });
const shade = new THREE.Group();
put(new THREE.CylinderGeometry(0.35, 1.25, 1.0, 40, 1, true), brass, 0, 0, 0, shade).material.side =
  THREE.DoubleSide;
put(new THREE.CylinderGeometry(0.35, 0.35, 0.12, 24), brass, 0, 0.55, 0, shade);
put(new THREE.CylinderGeometry(0.02, 0.02, 10, 6), flat(0x1b1b1b), 0, 5.6, 0, shade, false);
put(
  new THREE.SphereGeometry(0.3, 24, 16),
  new THREE.MeshBasicMaterial({ color: 0xfff1d0 }),
  0,
  -0.25,
  0,
  shade,
  false,
);
shade.position.set(0.4, 8.3, 0.2);
scene.add(shade);

// ---------------------------------------------------------------- worktop: oak
const oak = tex(
  1024,
  256,
  (g, w, h) => {
    const r = rng(82);
    g.fillStyle = "#b98a58";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) {
      g.strokeStyle = r() > 0.5 ? "rgba(90,52,22,0.22)" : "rgba(245,210,160,0.18)";
      g.lineWidth = 1 + r() * 2.5;
      const y = r() * h;
      g.beginPath();
      g.moveTo(0, y);
      for (let x = 0; x <= w; x += 64) g.lineTo(x, y + Math.sin(x * 0.01 + i) * 4 * r());
      g.stroke();
    }
    // three staves
    g.fillStyle = "rgba(60,30,10,0.35)";
    g.fillRect(0, h / 3, w, 2);
    g.fillRect(0, (2 * h) / 3, w, 2);
  },
  3,
  1,
);
const topMat = real.wood(0xffffff, {
  map: oak,
  roughness: 0.45,
  clearcoat: 0.35,
  clearcoatRoughness: 0.4,
});
// the worktop in four pieces around the hob cut-out
const TZ0 = WALL + 0.02;
const TZ1 = 1.55;
const hx0 = HOB.x - HOB.w / 2;
const hx1 = HOB.x + HOB.w / 2;
const hz0 = HOB.z - HOB.d / 2;
const hz1 = HOB.z + HOB.d / 2;
const slab = (x0, x1, z0, z1) =>
  put(
    new THREE.BoxGeometry(x1 - x0, 0.2, z1 - z0),
    topMat,
    (x0 + x1) / 2,
    TOP - 0.1,
    (z0 + z1) / 2,
  );
slab(-16, hx0, TZ0, TZ1);
slab(hx1, 16, TZ0, TZ1);
slab(hx0, hx1, TZ0, hz0);
slab(hx0, hx1, hz1, TZ1);
// rounded front edge catches the lamp
put(roundedBox(32, 0.2, 0.2, 0.09), topMat, 0, TOP - 0.1, TZ1 - 0.05);

// ---------------------------------------------------------------- the hob body (black glass; scene.js owns the glass + coils)
put(
  new THREE.BoxGeometry(HOB.w - 0.05, 0.5, HOB.d - 0.05),
  flat(0x111214),
  HOB.x,
  -0.32,
  HOB.z,
  scene,
  false,
);

// ---------------------------------------------------------------- cabinets below: deep green matte lacquer
const lacquer = real.plastic(0x2f4a3f, { roughness: 0.55, clearcoat: 0.15 });
const steelPull = real.metal(0xb7bcc2, { roughness: 0.22 });
for (let i = -5; i <= 5; i++) {
  const x = i * 3.0;
  put(roundedBox(2.9, 2.0, 0.2, 0.05), lacquer, x, -1.25, TZ1 - 0.25);
  put(roundedBox(2.9, 1.9, 0.2, 0.05), lacquer, x, -3.3, TZ1 - 0.25);
  put(roundedBox(1.6, 0.07, 0.1, 0.035), steelPull, x, -0.42, TZ1 - 0.1);
}
put(new THREE.BoxGeometry(34, 4.5, 3.6), flat(0x1c2420), 0, -2.35, -0.4, scene, false);

// ---------------------------------------------------------------- floor (dark oak, only seen in wide shots)
put(
  new THREE.PlaneGeometry(80, 60).rotateX(-Math.PI / 2),
  real.wood(0x4b3324, { roughness: 0.6 }),
  0,
  FLOOR,
  10,
  scene,
  false,
);

// ---------------------------------------------------------------- back wall: subway tiles + a wide window
const tiles = tex(
  1024,
  1024,
  (g, w, h) => {
    const r = rng(5);
    g.fillStyle = "#d9d6cf";
    g.fillRect(0, 0, w, h);
    const tw = 128;
    const th = 64;
    for (let j = 0; j < h / th; j++)
      for (let i = -1; i < w / tw + 1; i++) {
        const x = i * tw + (j % 2 ? tw / 2 : 0);
        const l = 92 + r() * 5;
        g.fillStyle = `hsl(40, 12%, ${l}%)`;
        g.fillRect(x + 3, j * th + 3, tw - 6, th - 6);
        const gr = g.createLinearGradient(0, j * th, 0, j * th + th);
        gr.addColorStop(0, "rgba(255,255,255,0.35)");
        gr.addColorStop(1, "rgba(0,0,0,0.06)");
        g.fillStyle = gr;
        g.fillRect(x + 3, j * th + 3, tw - 6, th - 6);
      }
  },
  6,
  3,
);
const tileMat = real.ceramic(0xffffff, { map: tiles, roughness: 0.2 });
const plaster = real.plastic(0x3a3f4a, { roughness: 0.95, clearcoat: 0 });
// window hole x -9.5 … -2.2, y 1.6 … 7.6
const WX0 = -9.5;
const WX1 = -2.4;
const WY0 = 1.6;
const WY1 = 7.6;
const wall = (x0, x1, y0, y1, mat) =>
  put(
    new THREE.BoxGeometry(x1 - x0, y1 - y0, 0.3),
    mat,
    (x0 + x1) / 2,
    (y0 + y1) / 2,
    WALL - 0.15,
    scene,
    false,
  );
wall(-30, 30, TOP, WY0, tileMat); // backsplash band under the window
wall(WX1, 30, WY0, 3.4, tileMat); // tiles continue right of the window
wall(WX1, 30, 3.4, 20, plaster);
wall(-30, WX0, WY0, 20, plaster);
wall(WX0, WX1, WY1, 20, plaster);
// window frame (dark anthracite) + mullion
const frameMat = real.plastic(0x2b2d31, { roughness: 0.4 });
for (const [w, h, x, y] of [
  [WX1 - WX0 + 0.3, 0.25, (WX0 + WX1) / 2, WY1],
  [WX1 - WX0 + 0.3, 0.25, (WX0 + WX1) / 2, WY0],
  [0.25, WY1 - WY0, WX0, (WY0 + WY1) / 2],
  [0.25, WY1 - WY0, WX1, (WY0 + WY1) / 2],
  [0.18, WY1 - WY0, (WX0 + WX1) / 2, (WY0 + WY1) / 2],
])
  put(roundedBox(w, h, 0.3, 0.08), frameMat, x, y, WALL - 0.2);
// faint reflection in the pane
put(
  new THREE.PlaneGeometry(WX1 - WX0, WY1 - WY0),
  real.glass(0xbfd4ff, { opacity: 0.08 }),
  (WX0 + WX1) / 2,
  (WY0 + WY1) / 2,
  WALL - 0.25,
  scene,
  false,
);

// ---------------------------------------------------------------- far layer: the city at blue hour
const city = tex(2048, 1024, (g, w, h) => {
  const r = rng(19);
  const sky = g.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#141a3a");
  sky.addColorStop(0.55, "#3a3566");
  sky.addColorStop(0.78, "#b46a6e");
  sky.addColorStop(1, "#1a1a2a");
  g.fillStyle = sky;
  g.fillRect(0, 0, w, h);
  for (let i = 0; i < 90; i++) {
    g.fillStyle = `rgba(255,255,255,${0.3 + r() * 0.6})`;
    g.fillRect(r() * w, r() * h * 0.4, 2, 2);
  }
  // three rows of buildings, far → near
  for (const [base, hMax, col, lit] of [
    [0.8, 0.28, "#2a2b4a", 0.25],
    [0.88, 0.36, "#1e1f36", 0.4],
    [0.98, 0.45, "#141526", 0.55],
  ]) {
    let x = -20;
    while (x < w) {
      const bw = 50 + r() * 130;
      const bh = h * (0.08 + r() * hMax);
      const y = h * base - bh;
      g.fillStyle = col;
      g.fillRect(x, y, bw, bh + h);
      if (r() > 0.75) g.fillRect(x + bw * 0.45, y - 30, 4, 30); // antenna
      for (let yy = y + 8; yy < h * base - 6; yy += 14)
        for (let xx = x + 6; xx < x + bw - 8; xx += 12)
          if (r() < lit) {
            g.fillStyle = r() > 0.25 ? `hsl(${35 + r() * 15}, 90%, ${60 + r() * 20}%)` : "#9fd0ff";
            g.fillRect(xx, yy, 6, 8);
          }
      x += bw + r() * 12;
    }
  }
});
const cityMesh = put(
  new THREE.PlaneGeometry(120, 60),
  new THREE.MeshBasicMaterial({ map: city, fog: false }),
  -6,
  14,
  -60,
  scene,
  false,
);
cityMesh.userData.noAO = true;
// car lights streaming along a street far below the window
const carMat = new THREE.MeshBasicMaterial({ color: 0xfff0c0, fog: false });
const carRed = new THREE.MeshBasicMaterial({ color: 0xff4a3a, fog: false });
const cars = [];
for (let i = 0; i < 14; i++) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), i % 2 ? carRed : carMat);
  m.userData.noAO = true;
  scene.add(m);
  cars.push(m);
}
onFrame((t) => {
  cars.forEach((m, i) => {
    const dir = i % 2 ? -1 : 1;
    const ph = ((t * 0.035 * (1 + (i % 3) * 0.2) + i * 0.137) % 1) * 2 - 1;
    m.position.set(-6 + dir * ph * 45, -1.5 + (i % 2) * 0.6, -45);
  });
});

// ---------------------------------------------------------------- open shelf with jars (right of the window)
const shelfMat = real.wood(0x9b6a3e, { roughness: 0.55 });
put(roundedBox(9, 0.18, 1.0, 0.05), shelfMat, 4.5, 5.2, WALL + 0.5);
const jarGlass = real.glass(0xe8f2f0, { opacity: 0.35 });
const fills = [0xd9b26a, 0xf2efe6, 0x8b4b2a, 0x5a7d2e, 0xc4483a];
for (let i = 0; i < 6; i++) {
  const x = 1.4 + i * 1.15;
  const h = 0.9 + (i % 3) * 0.25;
  put(
    new THREE.CylinderGeometry(0.34, 0.34, h * 0.75, 24),
    real.plastic(fills[i % 5], { roughness: 0.8 }),
    x,
    5.29 + h * 0.375,
    WALL + 0.5,
  );
  put(
    new THREE.CylinderGeometry(0.38, 0.38, h, 24),
    jarGlass,
    x,
    5.29 + h / 2,
    WALL + 0.5,
    scene,
    false,
  );
  put(
    new THREE.CylinderGeometry(0.39, 0.39, 0.12, 24),
    real.metal(0xd6d2c8, { roughness: 0.3 }),
    x,
    5.35 + h,
    WALL + 0.5,
  );
}

// ---------------------------------------------------------------- near props on the worktop
// cutting board + carrots + knife (left of the hob)
const board = new THREE.Group();
put(roundedBox(2.6, 0.12, 1.7, 0.05), real.wood(0xc89a64, { roughness: 0.5 }), 0, 0.06, 0, board);
const carrotMat = real.plastic(0xf07a1e, { roughness: 0.55 });
for (let i = 0; i < 3; i++) {
  const c = put(
    new THREE.ConeGeometry(0.1, 1.1, 14),
    carrotMat,
    -0.5 + i * 0.32,
    0.22,
    -0.25 + i * 0.1,
    board,
  );
  c.rotation.z = Math.PI / 2;
  c.rotation.y = 0.2 * i;
  put(
    new THREE.ConeGeometry(0.07, 0.3, 6),
    real.plastic(0x4f8a2b),
    -1.1 + i * 0.32,
    0.22,
    -0.25 + i * 0.1 - 0.12 * i,
    board,
  ).rotation.z = -Math.PI / 2;
}
for (let i = 0; i < 5; i++)
  put(
    new THREE.CylinderGeometry(0.1, 0.1, 0.05, 16),
    carrotMat,
    0.35 + i * 0.16,
    0.15,
    0.45 + (i % 2) * 0.1,
    board,
  ).rotation.x = 0.4;
put(
  roundedBox(1.0, 0.02, 0.18, 0.01),
  real.metal(0xe3e6ea, { roughness: 0.15 }),
  0.6,
  0.14,
  -0.35,
  board,
);
put(
  roundedBox(0.5, 0.08, 0.12, 0.04),
  real.plastic(0x1a1a1a, { roughness: 0.5 }),
  -0.15,
  0.15,
  -0.35,
  board,
);
board.position.set(-3.1, TOP, 0.2);
board.rotation.y = 0.12;
scene.add(board);

// basil pot (sways)
const basil = new THREE.Group();
put(new THREE.CylinderGeometry(0.42, 0.34, 0.75, 28), real.ceramic(0xc8643c), 0, 0.37, 0, basil);
const leafMat = real.plastic(0x3f8a32, { roughness: 0.6, clearcoat: 0.4 });
const leaves = new THREE.Group();
basil.add(leaves);
{
  const r = rng(4);
  for (let i = 0; i < 26; i++) {
    const l = put(
      new THREE.SphereGeometry(0.16, 12, 8).scale(1, 0.35, 0.7),
      leafMat,
      (r() - 0.5) * 0.7,
      0.85 + r() * 0.6,
      (r() - 0.5) * 0.7,
      leaves,
    );
    l.rotation.set(r() * 0.8, r() * 6, r() * 0.8);
  }
}
basil.position.set(-5.0, TOP, -1.4);
scene.add(basil);
onFrame((t) => {
  leaves.rotation.z = Math.sin(t * 0.9) * 0.03;
  leaves.rotation.x = Math.sin(t * 0.7 + 1) * 0.025;
});

// kitchen-paper roll on its holder (right, back)
const roll = new THREE.Group();
put(new THREE.CylinderGeometry(0.42, 0.42, 1.25, 32), real.fabric(0xf7f5f0), 0, 0.75, 0, roll);
put(
  new THREE.CylinderGeometry(0.5, 0.5, 0.06, 28),
  real.metal(0xc0c4c9, { roughness: 0.25 }),
  0,
  0.03,
  0,
  roll,
);
put(
  new THREE.CylinderGeometry(0.04, 0.04, 1.5, 8),
  real.metal(0xc0c4c9, { roughness: 0.25 }),
  0,
  0.8,
  0,
  roll,
);
roll.position.set(3.1, TOP, -1.55);
scene.add(roll);

// olive oil bottle + salt mill + utensil crock (back right)
put(
  new THREE.CylinderGeometry(0.28, 0.28, 1.5, 24),
  real.glass(0x8a9a2a, { opacity: 0.7 }),
  4.1,
  0.75,
  -1.2,
);
put(
  new THREE.CylinderGeometry(0.1, 0.14, 0.4, 16),
  real.glass(0x8a9a2a, { opacity: 0.7 }),
  4.1,
  1.7,
  -1.2,
);
put(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 12), real.metal(0x9a9a9a), 4.1, 1.95, -1.2);
put(
  new THREE.CylinderGeometry(0.18, 0.22, 1.0, 20),
  real.wood(0x3b2416, { roughness: 0.35, clearcoat: 0.6 }),
  4.8,
  0.5,
  -0.6,
);
put(
  new THREE.SphereGeometry(0.19, 16, 12),
  real.metal(0xd0d0d0, { roughness: 0.2 }),
  4.8,
  1.05,
  -0.6,
);
const crock = new THREE.Group();
put(new THREE.CylinderGeometry(0.42, 0.38, 1.0, 28), real.ceramic(0xe9e3d6), 0, 0.5, 0, crock);
for (let i = 0; i < 4; i++) {
  const s = put(
    new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8),
    real.wood(0xb98d5c, { roughness: 0.6 }),
    0,
    1.2,
    0,
    crock,
  );
  s.rotation.set(0.12 * Math.cos(i * 1.6), 0, 0.15 * Math.sin(i * 1.6));
  s.position.x = 0.12 * Math.sin(i * 1.6);
  s.position.z = 0.12 * Math.cos(i * 1.6);
  put(
    new THREE.SphereGeometry(0.15, 12, 8).scale(1, 1.4, 0.4),
    real.wood(0xb98d5c, { roughness: 0.6 }),
    s.position.x * 1.6,
    2.1,
    s.position.z * 1.6,
    crock,
  );
}
crock.position.set(-5.2, TOP, 0.4);
scene.add(crock);

// ---------------------------------------------------------------- dust in the lamp light
fireflies(50, { area: [-2.5, 3.5, 0.8, 7, -1.5, 2.5], color: 0xffe2b0, seed: 82, size: 0.018 });

finishSet({ ground: 0x2a2420 });
