// #75 Eine Woche ohne Zucker (Format B) — a cosy WG living room late at
// night. A teal velvet sofa against the back wall, an oak coffee table on a
// terracotta rug (the stage: sweets, ketchup, the box), a big window over a
// city skyline with lit windows, a warm floor lamp on the right, a bookshelf
// and posters on the left wall, a wall calendar, a sleeping cat on the sofa,
// a tea mug that steams. Light: the warm lamp + the blue flicker of a TV that
// stands behind the camera. Life: TV flicker, blinking city windows,
// breathing cat, tea steam, dust in the lamp light.
//
// Scale: 1 unit = 1 m. Floor y = 0, coffee table top y = TABLE_Y, centred
// on the origin. Mini-sets of scene.js live far away on +x.
import { THREE, onFrame, real, roundedBox, rng, scene } from "./world.js";
import { setSky, finishSet, fireflies } from "./environments.js";

export const TABLE_Y = 0.43;

setSky({
  top: [0.02, 0.03, 0.1],
  mid: [0.05, 0.07, 0.2],
  hor: [0.2, 0.16, 0.32],
  below: [0.05, 0.05, 0.1],
  sun: [0.25, 0.3, 0.5],
  sunDir: [0.2, 0.5, -1],
  cloud: [0x3a3f60, 0x1a1d38],
  clouds: 0,
  noClouds: true,
  birds: false,
  stars: 0.6,
  hemi: [0x8a8fd0, 0x3a2a2a, 0.9],
  key: [0xbfcbff, 0.9],
  keyPos: [-4, 9, 7],
  rim: [0x7f9bff, 0.7],
  fog: [30, 110],
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
const put = (geo, mat, x, y, z, parent = scene, shadow = true) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};

// ---------------------------------------------------------------- floor
const planks = tex(
  1024,
  1024,
  (g, w, h) => {
    const r = rng(75);
    const n = 8;
    for (let i = 0; i < n; i++) {
      let y = 0;
      while (y < h) {
        const len = 260 + r() * 420;
        const v = 0.85 + r() * 0.25;
        g.fillStyle = `rgb(${Math.round(150 * v)},${Math.round(104 * v)},${Math.round(68 * v)})`;
        g.fillRect((i * w) / n, y, w / n, len);
        for (let k = 0; k < 14; k++) {
          g.strokeStyle = `rgba(70,40,20,${0.06 + r() * 0.08})`;
          g.lineWidth = 1 + r() * 2;
          const x = (i * w) / n + r() * (w / n);
          g.beginPath();
          g.moveTo(x, y);
          g.bezierCurveTo(x + 6, y + len * 0.3, x - 6, y + len * 0.6, x + 3, y + len);
          g.stroke();
        }
        g.fillStyle = "rgba(40,22,10,.75)";
        g.fillRect((i * w) / n, y, w / n, 3);
        y += len;
      }
      g.fillStyle = "rgba(40,22,10,.8)";
      g.fillRect((i * w) / n, 0, 3, h);
    }
  },
  4,
  4,
);
const floor = put(
  new THREE.PlaneGeometry(14, 14),
  real.wood(0xffffff, { map: planks, roughness: 0.45, clearcoat: 0.4, clearcoatRoughness: 0.3 }),
  0,
  0,
  1,
);
floor.rotation.x = -Math.PI / 2;
floor.castShadow = false;

// rug under the table: terracotta with cream stripes and a fringe
const rugTex = tex(512, 512, (g, w, h) => {
  g.fillStyle = "#b5523b";
  g.fillRect(0, 0, w, h);
  g.fillStyle = "#e9d8bd";
  for (const y of [40, 60, 452, 472]) g.fillRect(0, y, w, 8);
  g.strokeStyle = "#e9d8bd";
  g.lineWidth = 6;
  for (let i = 0; i < 9; i++) {
    const x = 60 + i * 49;
    g.beginPath();
    g.moveTo(x, 130);
    g.lineTo(x + 24, 256);
    g.lineTo(x, 382);
    g.stroke();
  }
  const r = rng(9);
  for (let i = 0; i < 4000; i++) {
    g.fillStyle = `rgba(${r() > 0.5 ? "255,255,255" : "0,0,0"},0.05)`;
    g.fillRect(r() * w, r() * h, 2, 2);
  }
});
put(
  roundedBox(2.6, 0.014, 1.8, 0.006, 2),
  real.fabric(0xffffff, { map: rugTex }),
  0,
  0.007,
  0.15,
  scene,
  false,
);

// ---------------------------------------------------------------- walls
const wallMat = real.plastic(0x46524f, { roughness: 0.95, clearcoat: 0 });
const BACK = -2.6;
const WIN = { x0: -1.5, x1: 1.5, y0: 0.95, y1: 2.45 };
put(new THREE.BoxGeometry(12, WIN.y0, 0.12), wallMat, 0, WIN.y0 / 2, BACK);
put(new THREE.BoxGeometry(12, 3.4 - WIN.y1, 0.12), wallMat, 0, (3.4 + WIN.y1) / 2, BACK);
put(
  new THREE.BoxGeometry(6 + WIN.x0, WIN.y1 - WIN.y0, 0.12),
  wallMat,
  (-6 + WIN.x0) / 2,
  (WIN.y0 + WIN.y1) / 2,
  BACK,
);
put(
  new THREE.BoxGeometry(6 - WIN.x1, WIN.y1 - WIN.y0, 0.12),
  wallMat,
  (6 + WIN.x1) / 2,
  (WIN.y0 + WIN.y1) / 2,
  BACK,
);
put(new THREE.BoxGeometry(0.12, 3.4, 8), wallMat, -3.6, 1.7, 1.4);
// skirting board
const white = real.plastic(0xe9e4da);
put(new THREE.BoxGeometry(12, 0.08, 0.02), white, 0, 0.04, BACK + 0.07);
put(new THREE.BoxGeometry(0.02, 0.08, 8), white, -3.53, 0.04, 1.4);
// window frame + mullion + sill
const frameMat = real.plastic(0xf2efe8, { roughness: 0.5 });
const fw = WIN.x1 - WIN.x0;
const fh = WIN.y1 - WIN.y0;
for (const [w, h, x, y] of [
  [fw + 0.12, 0.07, 0, WIN.y1],
  [fw + 0.12, 0.07, 0, WIN.y0],
  [0.07, fh, WIN.x0, (WIN.y0 + WIN.y1) / 2],
  [0.07, fh, WIN.x1, (WIN.y0 + WIN.y1) / 2],
  [0.05, fh, 0, (WIN.y0 + WIN.y1) / 2],
])
  put(roundedBox(w, h, 0.14, 0.015), frameMat, x, y, BACK);
put(roundedBox(fw + 0.4, 0.04, 0.3, 0.012), frameMat, 0, WIN.y0 - 0.02, BACK + 0.12);
// glass with a faint reflection
put(
  new THREE.PlaneGeometry(fw, fh),
  real.glass(0xbfd4ff, { opacity: 0.12 }),
  0,
  (WIN.y0 + WIN.y1) / 2,
  BACK + 0.01,
  scene,
  false,
);
// curtains: soft folded fabric on both sides
const curtainMat = real.fabric(0xd9b48a);
const curtains = [];
for (const side of [-1, 1]) {
  const g = new THREE.PlaneGeometry(0.75, 2.7, 24, 1);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 26) * 0.035);
  g.computeVertexNormals();
  const c = put(g, curtainMat, side * (fw / 2 + 0.32), 1.6, BACK + 0.16);
  c.material.side = THREE.DoubleSide;
  curtains.push(c);
}
put(
  new THREE.CylinderGeometry(0.012, 0.012, 3.6, 12).rotateZ(Math.PI / 2),
  real.metal(0x2b2b2b),
  0,
  2.98,
  BACK + 0.16,
);

// ---------------------------------------------------------------- city outside
const city = new THREE.Group();
scene.add(city);
{
  const r = rng(31);
  const winTex = (seed) =>
    tex(128, 256, (g, w, h) => {
      const q = rng(seed);
      g.fillStyle = "#151827";
      g.fillRect(0, 0, w, h);
      for (let y = 8; y < h - 8; y += 16)
        for (let x = 8; x < w - 8; x += 14) {
          if (q() < 0.42) {
            const warm = q() < 0.7;
            g.fillStyle = warm
              ? `rgba(255,${190 + q() * 50},${110 + q() * 60},1)`
              : "rgba(150,190,255,1)";
            g.fillRect(x, y, 8, 9);
          }
        }
    });
  const texes = [0, 1, 2, 3].map((i) => winTex(100 + i));
  for (let i = 0; i < 26; i++) {
    const w = 3 + r() * 5;
    const h = 8 + r() * 26;
    const d = 3 + r() * 4;
    const x = -34 + i * 2.7 + (r() - 0.5) * 2;
    const z = -26 - r() * 26;
    const t = texes[i % 4].clone();
    t.needsUpdate = true;
    t.repeat.set(w / 6, h / 12);
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({
        color: 0x1b1f30,
        emissive: 0xffffff,
        emissiveMap: t,
        emissiveIntensity: 0.9,
        map: t,
      }),
    );
    m.position.set(x, h / 2 - 6, z);
    city.add(m);
    if (r() < 0.35) {
      const led = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 10, 8),
        new THREE.MeshBasicMaterial({ color: 0xff3344 }),
      );
      led.position.set(x, h - 6 + 0.4, z);
      led.userData.ph = r() * 6;
      city.add(led);
    }
  }
  onFrame((t) => {
    for (const c of city.children)
      if (c.userData.ph !== undefined) c.visible = Math.sin(t * 2.4 + c.userData.ph) > -0.2;
  });
}

// ---------------------------------------------------------------- sofa
const sofaMat = real.fabric(0x245a5e);
const sofa = new THREE.Group();
sofa.position.set(0, 0, -2.05);
scene.add(sofa);
put(roundedBox(2.4, 0.26, 0.9, 0.06), sofaMat, 0, 0.2, 0, sofa);
for (const x of [-0.58, 0.58]) put(roundedBox(1.12, 0.16, 0.78, 0.07), sofaMat, x, 0.4, 0.06, sofa);
put(roundedBox(2.4, 0.5, 0.22, 0.08), sofaMat, 0, 0.6, -0.36, sofa);
for (const x of [-1.24, 1.24]) put(roundedBox(0.2, 0.55, 0.9, 0.08), sofaMat, x, 0.33, 0, sofa);
for (const x of [-1.0, 1.0])
  put(new THREE.CylinderGeometry(0.02, 0.015, 0.08, 16), real.wood(0x3a2414), x, 0.04, 0.35, sofa);
// cushions: blush pink + mustard
const cushion = (col, x, rz) => {
  const c = put(roundedBox(0.42, 0.4, 0.13, 0.08, 6), real.fabric(col), x, 0.66, -0.17, sofa);
  c.rotation.set(-0.25, 0, rz);
};
cushion(0xe39aa0, -0.82, 0.12);
cushion(0xd9a63a, -0.42, -0.08);
cushion(0xe39aa0, 0.9, -0.1);
// knitted blanket over the right arm
put(roundedBox(0.5, 0.05, 0.85, 0.02), real.fabric(0xece4d4), 1.2, 0.62, 0.02, sofa).rotation.z =
  -0.35;

// sleeping cat (orange tabby loaf) on the left seat — breathes
const cat = new THREE.Group();
cat.position.set(-0.75, 0.49, 0.12);
sofa.add(cat);
{
  const fur = real.fabric(0xd98a3d);
  const body = put(new THREE.SphereGeometry(0.17, 48, 32), fur, 0, 0.1, 0, cat);
  body.scale.set(1.35, 0.72, 0.95);
  const head = put(new THREE.SphereGeometry(0.085, 48, 32), fur, 0.2, 0.1, 0.05, cat);
  for (const z of [-0.04, 0.04]) {
    const ear = put(new THREE.ConeGeometry(0.03, 0.06, 16), fur, 0.21, 0.18, 0.05 + z, cat);
    ear.rotation.x = z * 4;
  }
  const tail = put(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.2, 0.05, 0),
        new THREE.Vector3(-0.16, 0.03, 0.15),
        new THREE.Vector3(0.05, 0.02, 0.17),
      ]),
      24,
      0.025,
      12,
    ),
    fur,
    0,
    0,
    0,
    cat,
  );
  for (const z of [-0.03, 0.03])
    put(
      new THREE.BoxGeometry(0.006, 0.003, 0.025),
      real.rubber(0x2a1a10),
      0.27,
      0.11,
      0.05 + z,
      cat,
      false,
    );
  onFrame((t) => {
    const b = 1 + Math.sin(t * 2.2) * 0.035;
    body.scale.set(1.35, 0.72 * b, 0.95 * b);
    head.position.y = 0.1 + Math.sin(t * 2.2) * 0.004;
    tail.rotation.y = Math.sin(t * 0.9) * 0.05;
  });
}

// ---------------------------------------------------------------- coffee table
const oak = real.wood(0xb98552, { roughness: 0.4, clearcoat: 0.5, clearcoatRoughness: 0.2 });
put(roundedBox(1.3, 0.05, 0.72, 0.02), oak, 0, TABLE_Y - 0.025, 0);
put(roundedBox(1.22, 0.03, 0.64, 0.01), oak, 0, 0.12, 0);
for (const x of [-0.6, 0.6])
  for (const z of [-0.3, 0.3])
    put(
      new THREE.CylinderGeometry(0.022, 0.018, TABLE_Y - 0.05, 20),
      real.metal(0x222222, { roughness: 0.4 }),
      x,
      (TABLE_Y - 0.05) / 2,
      z,
    );
// magazines + coaster on the lower shelf
put(roundedBox(0.3, 0.02, 0.22, 0.004), real.plastic(0xe86a5a), -0.3, 0.145, 0.05).rotation.y = 0.2;
put(roundedBox(0.3, 0.015, 0.22, 0.004), real.plastic(0x3d6fd8), -0.27, 0.16, 0.04).rotation.y =
  -0.1;

// tea mug that steams (front left of the table)
export const MUG = [-0.5, TABLE_Y, 0.22];
{
  const mug = put(
    new THREE.CylinderGeometry(0.042, 0.038, 0.1, 48, 1, true),
    real.ceramic(0xf3efe6, { side: THREE.DoubleSide }),
    MUG[0],
    MUG[1] + 0.05,
    MUG[2],
  );
  put(
    new THREE.CircleGeometry(0.04, 48).rotateX(-Math.PI / 2),
    real.gloss(0x8a4a1a),
    MUG[0],
    MUG[1] + 0.085,
    MUG[2],
    scene,
    false,
  );
  put(
    new THREE.TorusGeometry(0.026, 0.008, 12, 32),
    real.ceramic(0xf3efe6),
    MUG[0] + 0.05,
    MUG[1] + 0.05,
    MUG[2],
  );
  mug.receiveShadow = true;
  const steam = [];
  const steamMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
  });
  for (let i = 0; i < 7; i++) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.025, 16, 12), steamMat.clone());
    scene.add(s);
    steam.push(s);
  }
  onFrame((t) => {
    steam.forEach((s, i) => {
      const f = (t * 0.35 + i / steam.length) % 1;
      s.position.set(
        MUG[0] + Math.sin(f * 6 + i) * 0.02,
        MUG[1] + 0.1 + f * 0.3,
        MUG[2] + Math.cos(f * 5 + i) * 0.015,
      );
      s.scale.setScalar(0.6 + f * 1.8);
      s.material.opacity = 0.14 * Math.sin(f * Math.PI);
    });
  });
}

// ---------------------------------------------------------------- left wall: shelf, posters, calendar
const shelfWood = real.wood(0x8a5a36);
{
  const shelf = new THREE.Group();
  shelf.position.set(-3.33, 0, -0.9);
  shelf.rotation.y = Math.PI / 2;
  scene.add(shelf);
  for (const x of [-0.5, 0.5]) put(roundedBox(0.03, 1.8, 0.35, 0.01), shelfWood, x, 0.9, 0, shelf);
  const r = rng(7);
  const bookCols = [0xc94f3d, 0x2e6a8f, 0xe0b44c, 0x4a7c59, 0xf0e6d6, 0x6b4a8a, 0x1f2d3d];
  for (const y of [0.02, 0.45, 0.9, 1.35, 1.78]) {
    put(roundedBox(1.0, 0.025, 0.35, 0.008), shelfWood, 0, y, 0, shelf);
    if (y > 1.7) continue;
    let x = -0.46;
    while (x < 0.4) {
      const w = 0.03 + r() * 0.04;
      const h = 0.24 + r() * 0.12;
      if (r() < 0.15) {
        x += 0.08;
        continue;
      }
      const b = put(
        roundedBox(w, h, 0.22, 0.006),
        real.plastic(bookCols[Math.floor(r() * bookCols.length)], { roughness: 0.7 }),
        x + w / 2,
        y + 0.013 + h / 2,
        0.02,
        shelf,
      );
      b.rotation.z = r() < 0.1 ? 0.25 : 0;
      x += w + 0.004;
    }
  }
  // a plant on top
  put(
    new THREE.CylinderGeometry(0.09, 0.07, 0.16, 32),
    real.ceramic(0xd36b4f),
    0.25,
    1.88,
    0,
    shelf,
  );
  const leafMat = real.plastic(0x3f8a4a, { roughness: 0.55, side: THREE.DoubleSide });
  for (let i = 0; i < 9; i++) {
    const l = put(new THREE.SphereGeometry(0.08, 24, 12), leafMat, 0.25, 2.0, 0, shelf);
    l.scale.set(0.35, 0.08, 1);
    l.rotation.set(0.3 + (i % 3) * 0.2, (i / 9) * Math.PI * 2, 0.5);
    l.position.add(new THREE.Vector3(Math.cos(i) * 0.06, i * 0.012, Math.sin(i) * 0.06));
  }
}
const poster = (w, h, draw, x, y, z, ry) => {
  const t = tex(256, Math.round((256 * h) / w), draw);
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  scene.add(g);
  put(roundedBox(w + 0.04, h + 0.04, 0.025, 0.008), real.plastic(0x1d1d1f), 0, 0, 0, g);
  put(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 }),
    0,
    0,
    0.014,
    g,
    false,
  );
};
poster(
  0.6,
  0.8,
  (g, w, h) => {
    g.fillStyle = "#f2d6b3";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#e0573f";
    g.beginPath();
    g.arc(w / 2, h * 0.42, w * 0.3, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#264653";
    g.fillRect(0, h * 0.62, w, h * 0.38);
  },
  -3.53,
  1.75,
  1.0,
  Math.PI / 2,
);
poster(
  0.5,
  0.7,
  (g, w, h) => {
    g.fillStyle = "#1f2a44";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#f4c95d";
    g.lineWidth = 8;
    for (let i = 0; i < 5; i++) {
      g.beginPath();
      g.arc(w / 2, h / 2, 20 + i * 18, 0, Math.PI * 2);
      g.stroke();
    }
  },
  -3.53,
  1.6,
  2.0,
  Math.PI / 2,
);
// wall calendar left of the window: 7 days, crossed out by scene.js
export const CAL = [-2.35, 1.55, BACK + 0.08];
put(
  roundedBox(0.5, 0.62, 0.012, 0.004),
  real.plastic(0xfaf7f0, { roughness: 0.8 }),
  CAL[0],
  CAL[1],
  CAL[2] - 0.01,
);
put(
  new THREE.CylinderGeometry(0.008, 0.008, 0.03, 8).rotateX(Math.PI / 2),
  real.metal(0x777777),
  CAL[0],
  CAL[1] + 0.33,
  CAL[2] - 0.01,
);

// ---------------------------------------------------------------- right: floor lamp, side table, plant
{
  const lampX = 1.85;
  const lampZ = -1.55;
  const black = real.metal(0x1c1c1c, { roughness: 0.35 });
  put(new THREE.CylinderGeometry(0.16, 0.18, 0.03, 48), black, lampX, 0.015, lampZ);
  put(new THREE.CylinderGeometry(0.012, 0.012, 1.5, 16), black, lampX, 0.78, lampZ);
  const shade = put(
    new THREE.CylinderGeometry(0.17, 0.25, 0.3, 48, 1, true),
    real.fabric(0xf4e6cc, { side: THREE.DoubleSide, emissive: 0xffb866, emissiveIntensity: 0.55 }),
    lampX,
    1.6,
    lampZ,
  );
  shade.castShadow = false;
  const bulb = new THREE.PointLight(0xffb36b, 4.5, 9, 1.6);
  bulb.position.set(lampX, 1.55, lampZ);
  scene.add(bulb);
  const down = new THREE.SpotLight(0xffc27a, 14, 6, 0.9, 0.7, 1.4);
  down.position.set(lampX, 1.5, lampZ);
  down.target.position.set(0.2, 0, 0.2);
  down.castShadow = true;
  down.shadow.mapSize.set(2048, 2048);
  down.shadow.bias = -0.0004;
  scene.add(down, down.target);
  // side table with a little speaker and a candle jar
  put(new THREE.CylinderGeometry(0.24, 0.24, 0.03, 48), oak, 1.75, 0.5, -0.65);
  put(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 16), black, 1.75, 0.25, -0.65);
  put(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 48), black, 1.75, 0.01, -0.65);
  put(roundedBox(0.12, 0.18, 0.1, 0.03), real.fabric(0x9a9a9a), 1.7, 0.6, -0.7);
  // big plant in the corner
  put(new THREE.CylinderGeometry(0.2, 0.16, 0.42, 48), real.ceramic(0xe8e2d6), 2.7, 0.21, -2.1);
  const leafMat = real.plastic(0x2f7a3d, { roughness: 0.5, side: THREE.DoubleSide });
  const leaves = new THREE.Group();
  leaves.position.set(2.7, 0.42, -2.1);
  scene.add(leaves);
  const r = rng(12);
  for (let i = 0; i < 14; i++) {
    const g = new THREE.Group();
    g.rotation.set(0, r() * Math.PI * 2, 0);
    leaves.add(g);
    const stem = put(
      new THREE.CylinderGeometry(0.008, 0.01, 0.6 + r() * 0.5, 8),
      leafMat,
      0,
      0.3,
      0,
      g,
    );
    stem.rotation.z = 0.3 + r() * 0.4;
    const leaf = put(
      new THREE.SphereGeometry(0.18, 32, 16),
      leafMat,
      0.28 + r() * 0.15,
      0.6 + r() * 0.5,
      0,
      g,
    );
    leaf.scale.set(1, 0.12, 0.6);
    leaf.rotation.z = -0.4;
  }
  onFrame((t) => (leaves.rotation.y = Math.sin(t * 0.6) * 0.02));
}

// ---------------------------------------------------------------- TV light (behind the camera)
{
  const tv = new THREE.SpotLight(0x6f9bff, 5, 12, 0.8, 0.8, 1.2);
  tv.position.set(0.4, 0.9, 4.2);
  tv.target.position.set(0, 0.5, -1.5);
  scene.add(tv, tv.target);
  onFrame((t) => {
    const f =
      0.75 + 0.18 * Math.sin(t * 7.1) + 0.12 * Math.sin(t * 13.3 + 1) + 0.1 * Math.sin(t * 2.3);
    tv.intensity = 5 * f;
    tv.color.setHSL(0.6 + 0.03 * Math.sin(t * 1.7), 0.7, 0.62);
  });
}

// dust in the lamp light
fireflies(70, { area: [0.4, 2.6, 0.9, 2.4, -2.2, -0.9], color: 0xffe2b0, seed: 75, size: 0.012 });

finishSet({ ground: 0x6b4a32 });
