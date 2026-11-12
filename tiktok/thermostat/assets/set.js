// #78 Heizkörper-Thermostat — the world: an Altbau room on a frosty winter
// morning, seen at giant scale (1 unit ≈ 5 cm, the viewer is tiny). A white
// cast-iron column radiator under a tall window, the thermostat head on its
// valve at the origin, a stone window sill with a steaming tea mug and a
// plant, frost flowers on the panes, snowy rooftops outside, a linen
// curtain gathered on the right (it closes over the radiator in the
// "Übrigens"), oak parquet, a wool sock drying on the radiator.
// Life: snow falling outside, tea steam, dust in the window light, curtain
// sway (scene.js drives the curtain).
import { THREE, scene, onFrame, rng, real, roundedBox, flat } from "./world.js";
import { setSky, finishSet, fireflies } from "./environments.js";

export const FLOOR = -11;
export const WALL = -3;
export const RAD = { x0: -1.7, n: 13, step: 1.15, z: -1.9, top: 0.9, bottom: -10.1 };
export const SILL_Y = 4.2;
export const WIN = { x0: -17, x1: -2.2, y0: 5.0, y1: 40 };

setSky({
  top: [0.46, 0.62, 0.86],
  mid: [0.86, 0.84, 0.9],
  hor: [1.0, 0.86, 0.74],
  below: [0.9, 0.9, 0.95],
  sun: [1.0, 0.9, 0.75],
  sunDir: [-0.25, 0.12, -1],
  cloud: [0xfff6f0, 0xe8dde6],
  clouds: 0,
  noClouds: true,
  birds: false,
  hemi: [0xeef2ff, 0x9a8476, 1.25],
  key: [0xfff0dc, 2.4],
  keyPos: [-12, 18, -14],
  rim: [0xbcd2ff, 0.9],
  fog: [90, 420],
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

// ---------------------------------------------------------------- floor: oak parquet
const parquet = tex(
  1024,
  1024,
  (g, w, h) => {
    const r = rng(78);
    const rows = 8;
    for (let j = 0; j < rows; j++) {
      let x = -r() * 300;
      while (x < w) {
        const len = 260 + r() * 260;
        const l = 52 + r() * 14;
        g.fillStyle = `hsl(${28 + r() * 8}, ${42 + r() * 12}%, ${l}%)`;
        g.fillRect(x, (j * h) / rows, len, h / rows);
        // grain
        g.globalAlpha = 0.12;
        for (let k = 0; k < 14; k++) {
          g.fillStyle = r() > 0.5 ? "#5a3418" : "#f3d2a8";
          g.fillRect(x, (j * h) / rows + r() * (h / rows), len, 1 + r() * 2);
        }
        g.globalAlpha = 1;
        g.fillStyle = "rgba(40,22,10,0.55)";
        g.fillRect(x, (j * h) / rows, 3, h / rows);
        x += len;
      }
      g.fillStyle = "rgba(40,22,10,0.5)";
      g.fillRect(0, (j * h) / rows, w, 3);
    }
  },
  6,
  6,
);
const floor = put(
  new THREE.PlaneGeometry(160, 160),
  real.wood(0xffffff, { map: parquet, roughness: 0.38, clearcoat: 0.5, clearcoatRoughness: 0.3 }),
  -10,
  FLOOR,
  40,
  scene,
  false,
);
floor.rotation.x = -Math.PI / 2;
floor.material.map.rotation = Math.PI / 2;

// ---------------------------------------------------------------- walls
const plaster = tex(
  512,
  512,
  (g, w, h) => {
    const r = rng(7);
    g.fillStyle = "#efe7dc";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) {
      g.fillStyle = r() > 0.5 ? "rgba(255,255,255,0.18)" : "rgba(150,130,110,0.1)";
      g.fillRect(r() * w, r() * h, 2 + r() * 5, 2 + r() * 5);
    }
  },
  8,
  8,
);
const wallMat = real.plastic(0xffffff, { map: plaster, roughness: 0.95, clearcoat: 0 });
// back wall with the window hole
const wl = (x0, x1, y0, y1) =>
  put(
    new THREE.BoxGeometry(x1 - x0, y1 - y0, 0.6),
    wallMat,
    (x0 + x1) / 2,
    (y0 + y1) / 2,
    WALL - 0.3,
    scene,
    false,
  );
wl(-90, WIN.x0 - 1.2, FLOOR, 80);
wl(WIN.x1 + 1.2, 60, FLOOR, 80);
wl(WIN.x0 - 1.2, WIN.x1 + 1.2, FLOOR, WIN.y0 - 0.8);
wl(WIN.x0 - 1.2, WIN.x1 + 1.2, WIN.y1 + 1.2, 80);
// deep Altbau window reveal
for (const x of [WIN.x0 - 0.9, WIN.x1 + 0.9])
  put(
    new THREE.BoxGeometry(0.6, WIN.y1 - WIN.y0 + 2, 4),
    wallMat,
    x,
    (WIN.y0 + WIN.y1) / 2,
    WALL - 2.3,
    scene,
    false,
  );
// baseboard
const boardMat = real.plastic(0xf6f2ea, { roughness: 0.45 });
put(roundedBox(150, 1.6, 0.4, 0.12), boardMat, -15, FLOOR + 0.8, WALL + 0.2);
// wall socket on the right (real detail at true scale: 8 cm)
const sock = new THREE.Group();
put(roundedBox(1.6, 1.6, 0.25, 0.25), boardMat, 0, 0, 0, sock);
for (const dx of [-0.25, 0.25])
  put(
    new THREE.CylinderGeometry(0.08, 0.08, 0.1, 16).rotateX(Math.PI / 2),
    flat(0x333333),
    dx,
    0,
    0.12,
    sock,
  );
sock.position.set(7.5, FLOOR + 6, WALL + 0.1);
scene.add(sock);

// ---------------------------------------------------------------- window
const frameMat = real.plastic(0xf8f6f1, { roughness: 0.4 });
const WZ = WALL - 3.6;
const fw = WIN.x1 - WIN.x0;
const fh = WIN.y1 - WIN.y0;
const mx = (WIN.x0 + WIN.x1) / 2;
for (const [w, h, x, y] of [
  [fw + 1, 1, mx, WIN.y1],
  [fw + 1, 1, mx, WIN.y0],
  [1, fh, WIN.x0, (WIN.y0 + WIN.y1) / 2],
  [1, fh, WIN.x1, (WIN.y0 + WIN.y1) / 2],
  [0.8, fh, mx, (WIN.y0 + WIN.y1) / 2],
  [fw, 0.7, mx, WIN.y0 + fh * 0.62],
])
  put(roundedBox(w, h, 0.9, 0.2), frameMat, x, y, WZ);
// handle
put(
  roundedBox(0.35, 2.2, 0.35, 0.15),
  real.metal(0xd8d8d8, { roughness: 0.25 }),
  mx + 0.9,
  WIN.y0 + 9,
  WZ + 0.6,
);
// frosted glass: frost flowers grow from the corners (opacity driven by scene.js)
const frostTex = tex(1024, 1024, (g, w, h) => {
  const r = rng(31);
  g.clearRect(0, 0, w, h);
  const edge = g.createRadialGradient(w / 2, h / 2, w * 0.22, w / 2, h / 2, w * 0.72);
  edge.addColorStop(0, "rgba(255,255,255,0)");
  edge.addColorStop(1, "rgba(255,255,255,0.85)");
  g.fillStyle = edge;
  g.fillRect(0, 0, w, h);
  g.strokeStyle = "rgba(255,255,255,0.7)";
  const fern = (x, y, a, len, d) => {
    if (d > 4 || len < 6) return;
    const x2 = x + Math.cos(a) * len;
    const y2 = y + Math.sin(a) * len;
    g.lineWidth = Math.max(1, 4 - d);
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x2, y2);
    g.stroke();
    for (let k = 1; k < 5; k++) {
      const f = k / 5;
      const px = x + (x2 - x) * f;
      const py = y + (y2 - y) * f;
      fern(px, py, a + 0.8, len * 0.35, d + 1);
      fern(px, py, a - 0.8, len * 0.35, d + 1);
    }
  };
  for (let i = 0; i < 26; i++) {
    const side = i % 4;
    const x = side === 0 ? 0 : side === 1 ? w : r() * w;
    const y = side === 2 ? h : side === 3 ? 0 : r() * h;
    fern(x, y, Math.atan2(h / 2 - y, w / 2 - x) + (r() - 0.5) * 1.2, 120 + r() * 160, 0);
  }
});
export const frostMat = new THREE.MeshBasicMaterial({
  map: frostTex,
  transparent: true,
  opacity: 0.9,
  depthWrite: false,
  fog: false,
});
put(new THREE.PlaneGeometry(fw, fh), frostMat, mx, (WIN.y0 + WIN.y1) / 2, WZ + 0.05, scene, false);
put(
  new THREE.PlaneGeometry(fw, fh),
  real.glass(0xcfe0ff, { opacity: 0.1 }),
  mx,
  (WIN.y0 + WIN.y1) / 2,
  WZ - 0.1,
  scene,
  false,
);

// ---------------------------------------------------------------- sill
const stone = tex(512, 256, (g, w, h) => {
  const r = rng(12);
  g.fillStyle = "#d9d4cc";
  g.fillRect(0, 0, w, h);
  for (let i = 0; i < 900; i++) {
    g.fillStyle = `rgba(${90 + r() * 60},${90 + r() * 50},${90 + r() * 40},${0.08 + r() * 0.15})`;
    g.beginPath();
    g.arc(r() * w, r() * h, 1 + r() * 3, 0, 7);
    g.fill();
  }
});
put(
  roundedBox(fw + 6, 0.7, 7.2, 0.2),
  real.ceramic(0xffffff, { map: stone, roughness: 0.3 }),
  mx,
  SILL_Y,
  WALL - 0.4,
);

// tea mug + steam
const mug = new THREE.Group();
const mugMat = real.ceramic(0x2f5d8c);
put(
  new THREE.CylinderGeometry(1.0, 0.92, 2.1, 64, 1, true),
  mugMat,
  0,
  1.05,
  0,
  mug,
).material.side = THREE.DoubleSide;
put(new THREE.CylinderGeometry(0.92, 0.92, 0.1, 64), mugMat, 0, 0.05, 0, mug);
put(
  new THREE.CylinderGeometry(0.93, 0.93, 0.05, 64),
  real.gloss(0x8a4a1a, { roughness: 0.15 }),
  0,
  1.75,
  0,
  mug,
);
put(
  new THREE.TorusGeometry(0.5, 0.13, 16, 48, Math.PI * 1.2).rotateZ(-Math.PI * 0.6),
  mugMat,
  1.05,
  1.1,
  0,
  mug,
);
// tea-bag tag on a string
put(new THREE.BoxGeometry(0.4, 0.5, 0.02), flat(0xf2d34a), 0.95, 1.6, 0.6, mug);
mug.position.set(-4.2, SILL_Y + 0.35, -1.0);
mug.rotation.y = -0.5;
scene.add(mug);
const steamMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.25,
  depthWrite: false,
});
const steam = [];
for (let i = 0; i < 9; i++) {
  const s = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 12), steamMat.clone());
  s.userData.noAO = true;
  scene.add(s);
  steam.push(s);
}
onFrame((t) => {
  steam.forEach((s, i) => {
    const f = (t * 0.22 + i / steam.length) % 1;
    s.position.set(
      -4.2 + Math.sin(f * 6 + i) * 0.35 * f,
      SILL_Y + 2.4 + f * 5,
      -1.0 + Math.cos(f * 5 + i) * 0.2,
    );
    s.scale.setScalar(0.5 + f * 1.8);
    s.material.opacity = 0.22 * Math.sin(f * Math.PI);
  });
});

// plant in a terracotta pot
const plant = new THREE.Group();
put(
  new THREE.CylinderGeometry(1.3, 1.0, 2.2, 48),
  real.ceramic(0xc0643a, { roughness: 0.75, clearcoat: 0 }),
  0,
  1.1,
  0,
  plant,
);
put(
  new THREE.CylinderGeometry(1.2, 1.2, 0.1, 48),
  real.plastic(0x3b2a1e, { roughness: 1 }),
  0,
  2.1,
  0,
  plant,
);
{
  const r = rng(5);
  const leafMat = real.plastic(0x3f8a3a, { roughness: 0.5, side: THREE.DoubleSide });
  for (let i = 0; i < 14; i++) {
    const g = new THREE.SphereGeometry(0.7, 20, 12);
    g.scale(1, 0.12, 1.7);
    const a = (i / 14) * Math.PI * 2 + r();
    const m = put(g, leafMat, Math.cos(a) * 0.9, 2.6 + r() * 2.4, Math.sin(a) * 0.9, plant);
    m.rotation.set(0.5 + r() * 0.6, -a + Math.PI / 2, 0);
  }
}
plant.position.set(-14.2, SILL_Y + 0.35, -1.2);
scene.add(plant);

// ---------------------------------------------------------------- radiator
export const radMat = real.ceramic(0xf3f0ea, {
  roughness: 0.32,
  emissive: 0xff4400,
  emissiveIntensity: 0,
});
const colH = RAD.top - RAD.bottom;
for (let i = 0; i < RAD.n; i++) {
  const x = RAD.x0 - 0.6 - i * RAD.step;
  // each cast-iron section: two round tubes joined by a web
  for (const dz of [-0.45, 0.45])
    put(roundedBox(0.95, colH, 0.62, 0.3, 6), radMat, x, (RAD.top + RAD.bottom) / 2, RAD.z + dz);
  put(roundedBox(0.6, colH - 1.2, 0.5, 0.2), radMat, x, (RAD.top + RAD.bottom) / 2, RAD.z);
}
const radEnd = RAD.x0 - 0.6 - (RAD.n - 1) * RAD.step;
for (const y of [RAD.top - 0.9, RAD.bottom + 0.9])
  put(
    new THREE.CylinderGeometry(0.42, 0.42, RAD.x0 - radEnd + 0.6, 32).rotateZ(Math.PI / 2),
    radMat,
    (RAD.x0 + radEnd) / 2 - 0.3,
    y,
    RAD.z,
  );
// feet
for (const x of [RAD.x0 - 1.2, radEnd + 0.6])
  put(
    roundedBox(1, FLOOR + 1 - RAD.bottom + 1.4, 1.6, 0.25),
    radMat,
    x,
    (FLOOR + RAD.bottom) / 2,
    RAD.z,
  );
// wall brackets
for (const x of [RAD.x0 - 3, radEnd + 2.4])
  put(roundedBox(0.4, 0.4, 1.4, 0.1), real.metal(0x9a9a9a), x, RAD.top - 2, WALL + 0.3);
// return pipe at the bottom right (lockshield valve)
put(
  new THREE.CylinderGeometry(0.32, 0.32, 1.6, 32).rotateZ(Math.PI / 2),
  real.metal(0xdedede, { roughness: 0.18 }),
  RAD.x0 + 0.1,
  RAD.bottom + 0.9,
  RAD.z,
);
put(
  new THREE.CylinderGeometry(0.32, 0.32, RAD.bottom + 0.9 - FLOOR, 32),
  real.metal(0xdedede, { roughness: 0.18 }),
  RAD.x0 + 0.9,
  (RAD.bottom + 0.9 + FLOOR) / 2,
  RAD.z,
);
put(
  new THREE.CylinderGeometry(0.36, 0.36, 0.7, 6).rotateZ(Math.PI / 2),
  real.metal(0xc9a24a, { roughness: 0.3 }),
  RAD.x0 + 0.3,
  RAD.bottom + 0.9,
  RAD.z,
);
// floor rosettes where the pipes come out
for (const x of [0, RAD.x0 + 0.9])
  put(
    new THREE.CylinderGeometry(0.7, 0.75, 0.12, 40),
    real.metal(0xe6e6e6, { roughness: 0.2 }),
    x,
    FLOOR + 0.06,
    RAD.z,
  );

// wool sock drying over the radiator top
const sockMat = real.fabric(0xb8322a);
const sockStripe = real.fabric(0xf2ece0);
put(roundedBox(1.9, 0.35, 2.6, 0.17), sockMat, -7.5, RAD.top + 0.15, RAD.z);
put(roundedBox(1.9, 4.2, 0.35, 0.17), sockMat, -7.5, RAD.top - 2, RAD.z + 1.45);
put(roundedBox(1.95, 0.7, 0.4, 0.17), sockStripe, -7.5, RAD.top - 1.2, RAD.z + 1.46);
put(roundedBox(1.95, 1.4, 1.5, 0.5), sockMat, -7.5, RAD.top - 4.6, RAD.z + 2.0);
put(roundedBox(1.9, 4.0, 0.35, 0.17), sockMat, -7.5, RAD.top - 1.9, RAD.z - 1.45);

// ---------------------------------------------------------------- curtain (scene.js slides it)
const curtainGeo = new THREE.PlaneGeometry(10, FLOOR * -1 + 44, 80, 1);
{
  const p = curtainGeo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 3.2) * 0.45);
  curtainGeo.computeVertexNormals();
}
const linen = tex(
  256,
  256,
  (g, w, h) => {
    const r = rng(3);
    g.fillStyle = "#e7dccb";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 256; i += 2) {
      g.fillStyle = `rgba(120,100,80,${0.04 + r() * 0.06})`;
      g.fillRect(i, 0, 1, h);
      g.fillRect(0, i, w, 1);
    }
  },
  6,
  30,
);
export const curtain = put(
  curtainGeo,
  real.fabric(0xffffff, { map: linen, side: THREE.DoubleSide }),
  0,
  (FLOOR + 44) / 2 - 0.5,
  2.4,
);
put(
  new THREE.CylinderGeometry(0.25, 0.25, 60, 16).rotateZ(Math.PI / 2),
  real.metal(0x2b2b2b),
  -6,
  43,
  2.4,
);

// slippers on the floor (foreground on low shots)
for (const [x, z, ry] of [
  [6.5, 7, 0.4],
  [9.2, 6.2, 0.15],
]) {
  const s = new THREE.Group();
  put(roundedBox(2.2, 0.35, 5.2, 0.17), real.rubber(0x3a3a3a), 0, 0.18, 0, s);
  put(roundedBox(2.1, 1.2, 4.6, 0.55), real.fabric(0x8c9aa8), 0, 0.85, 0.15, s);
  s.position.set(x, FLOOR, z);
  s.rotation.y = ry;
  scene.add(s);
}

// ---------------------------------------------------------------- outside: snowy rooftops + snowfall
{
  const r = rng(44);
  const wallCols = [0xe8d9c0, 0xd9c2a3, 0xc9d3dc, 0xe6cfc4, 0xd2c7b8];
  for (let i = 0; i < 16; i++) {
    const x = -260 + i * 32 + r() * 10;
    const z = -170 - r() * 90;
    const w = 26 + r() * 16;
    const top = -20 + r() * 50;
    const h = top + 260;
    put(new THREE.BoxGeometry(w, h, 30), flat(wallCols[i % 5]), x, top - h / 2, z, scene, false);
    const roof = new THREE.CylinderGeometry(0.01, 18, 14, 4, 1);
    roof.rotateY(Math.PI / 4);
    roof.scale(w / 25, 1, 1.2);
    put(roof, flat(0xf6f8fc), x, top + 7, z, scene, false);
    put(new THREE.BoxGeometry(3, 10, 3), flat(0x9a6a52), x + w * 0.25, top + 10, z, scene, false);
  }
  // snowflakes falling behind the glass
  const N = 220;
  const im = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.16, 0),
    new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }),
    N,
  );
  im.userData.noAO = true;
  im.frustumCulled = false;
  scene.add(im);
  const seeds = Array.from({ length: N }, () => [r(), r(), r(), r() * 6]);
  const m4 = new THREE.Matrix4();
  onFrame((t) => {
    seeds.forEach(([a, b, c, ph], i) => {
      const y = WIN.y1 + 6 - (((b * 50 + t * (2.2 + c)) % 50) + 0);
      m4.makeTranslation(
        WIN.x0 - 4 + a * (fw + 8) + Math.sin(t * 0.8 + ph) * 0.8,
        y,
        WZ - 3 - c * 24,
      );
      im.setMatrixAt(i, m4);
    });
    im.instanceMatrix.needsUpdate = true;
  });
}

// dust in the window light
fireflies(40, { area: [-16, 4, -6, 14, -1, 8], color: 0xfff1d6, seed: 78, size: 0.05 });

// fill light from the room side so the radiator front is not backlit-dark
const fill = new THREE.DirectionalLight(0xffe6d0, 0.9);
fill.position.set(14, 8, 20);
scene.add(fill);

finishSet({ ground: 0x9a6a44 });
