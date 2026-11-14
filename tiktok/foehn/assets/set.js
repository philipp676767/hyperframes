// #84 Föhn — the world: a bathroom in an Alpine chalet on a sunny morning
// (1 unit ≈ 10 cm). A light terrazzo counter with a white vessel sink and a
// brass tap, sage-green tiles, a big larch-framed mirror with fogged edges,
// a tall window on the right with snowy peaks and pines outside, a sage
// towel hanging from a bar right of the dryer (the nozzle presses into it),
// a toothbrush cup, a soap pump, a round brush, a eucalyptus pot, a stack of
// towels. Life: steam drifting up from the sink, dust in the sun beam,
// clouds sliding over the peaks.
import { THREE, scene, onFrame, rng, real, roundedBox, flat } from "./world.js";
import { setSky, finishSet, fireflies, F } from "./environments.js";

export const TOP = -3.0; // counter surface
export const WALL = -6.0; // back wall
export const TOWEL_X = 3.6; // towel plane (faces ±x)
export const TOWEL_Z = -0.8; // towel centre on the bar
export const TOWEL_ROT = 0.35; // turned toward the camera
// where the towel crosses z = 0 (the nozzle's axis)
export const CONTACT_X = TOWEL_X + (-TOWEL_Z / Math.cos(TOWEL_ROT)) * Math.sin(TOWEL_ROT);
export const WIN = { x0: 6.5, x1: 15.5, y0: -1.2, y1: 12 };

setSky({
  top: [0.36, 0.58, 0.92],
  mid: [0.72, 0.84, 0.97],
  hor: [1.0, 0.9, 0.78],
  below: [0.9, 0.9, 0.95],
  sun: [1.0, 0.92, 0.78],
  sunDir: [0.6, 0.35, -1],
  cloud: [0xffffff, 0xe6e9f2],
  clouds: 0,
  noClouds: true,
  birds: false,
  hemi: [0xf2f5ff, 0x8f8a80, 1.2],
  key: [0xfff0d8, 2.6],
  keyPos: [30, 26, -26],
  rim: [0xcfe0ff, 0.8],
  fog: [140, 900],
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

// ---------------------------------------------------------------- walls: sage tiles + larch
const tiles = tex(
  1024,
  1024,
  (g, w, h) => {
    const r = rng(84);
    g.fillStyle = "#e9ece6";
    g.fillRect(0, 0, w, h);
    const cols = 8;
    const rows = 16;
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        const off = j % 2 ? w / cols / 2 : 0;
        const x = i * (w / cols) + off;
        const y = j * (h / rows);
        const l = 70 + r() * 6;
        g.fillStyle = `hsl(${118 + r() * 10}, ${16 + r() * 6}%, ${l}%)`;
        g.fillRect(x + 3, y + 3, w / cols - 6, h / rows - 6);
        g.fillStyle = "rgba(255,255,255,0.25)";
        g.fillRect(x + 6, y + 6, w / cols - 30, 5);
        if (off) {
          g.fillStyle = `hsl(${118 + r() * 10}, 18%, ${l}%)`;
          g.fillRect(3 - w / cols / 2, y + 3, w / cols / 2 - 6, h / rows - 6);
        }
      }
  },
  3,
  3,
);
const tileMat = real.ceramic(0xffffff, { map: tiles, roughness: 0.22 });
const larchTex = tex(
  512,
  512,
  (g, w, h) => {
    const r = rng(9);
    g.fillStyle = "#c98f55";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      g.strokeStyle = `rgba(${110 + r() * 40},${60 + r() * 25},${25 + r() * 15},${0.15 + r() * 0.25})`;
      g.lineWidth = 1 + r() * 3;
      g.beginPath();
      const y = r() * h;
      g.moveTo(0, y);
      for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.02 + i) * 6);
      g.stroke();
    }
  },
  2,
  2,
);
const larch = real.wood(0xffffff, { map: larchTex, roughness: 0.55 });

const wl = (x0, x1, y0, y1, mat = tileMat) =>
  put(
    new THREE.BoxGeometry(x1 - x0, y1 - y0, 0.5),
    mat,
    (x0 + x1) / 2,
    (y0 + y1) / 2,
    WALL - 0.25,
    scene,
    false,
  );
// back wall with the window hole
wl(-60, WIN.x0 - 0.8, -20, 40);
wl(WIN.x1 + 0.8, 60, -20, 40);
wl(WIN.x0 - 0.8, WIN.x1 + 0.8, -20, WIN.y0 - 0.6);
wl(WIN.x0 - 0.8, WIN.x1 + 0.8, WIN.y1 + 0.6, 40);
// larch ceiling beam + upper panelling (visible on low shots)
put(roundedBox(120, 1.6, 2.4, 0.2), larch, 0, 17, WALL + 1.2);

// ---------------------------------------------------------------- window: larch frame, Alps outside
const WZ = WALL - 1.6;
const fw = WIN.x1 - WIN.x0;
const fh = WIN.y1 - WIN.y0;
const mx = (WIN.x0 + WIN.x1) / 2;
for (const [w, h, x, y] of [
  [fw + 1, 0.8, mx, WIN.y1],
  [fw + 1, 0.8, mx, WIN.y0],
  [0.8, fh, WIN.x0, (WIN.y0 + WIN.y1) / 2],
  [0.8, fh, WIN.x1, (WIN.y0 + WIN.y1) / 2],
  [0.6, fh, mx, (WIN.y0 + WIN.y1) / 2],
  [fw, 0.5, mx, WIN.y0 + fh * 0.66],
])
  put(roundedBox(w, h, 0.8, 0.16), larch, x, y, WZ);
// deep reveal
for (const x of [WIN.x0 - 0.6, WIN.x1 + 0.6])
  put(new THREE.BoxGeometry(0.5, fh + 1.2, 2.2), tileMat, x, (WIN.y0 + WIN.y1) / 2, WALL - 1.1);
put(roundedBox(fw + 2, 0.4, 2.6, 0.12), larch, mx, WIN.y0 - 0.5, WALL - 0.6);
put(
  new THREE.PlaneGeometry(fw, fh),
  real.glass(0xdde8ff, { opacity: 0.08 }),
  mx,
  (WIN.y0 + WIN.y1) / 2,
  WZ - 0.1,
  scene,
  false,
);

// outside: meadow slope, pines, two ranges of snowy peaks, clouds
export const OUT = { x: mx, z: -60 };
{
  const r = rng(41);
  const rock = flat(0x7d828c);
  const rockDark = flat(0x5f6670);
  const snow = flat(0xf7f9ff);
  const grass = flat(0x7aa04f);
  // slope under the window
  const slope = new THREE.PlaneGeometry(400, 160, 40, 16).rotateX(-Math.PI / 2);
  {
    const p = slope.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const z = p.getZ(i);
      p.setY(i, -40 + (80 - z) * 0.12 + Math.sin(p.getX(i) * 0.05) * 2 + r() * 0.8);
    }
  }
  const slopeMesh = F(slope, grass, 0.1, 3);
  slopeMesh.position.set(mx, 0, -110);
  scene.add(slopeMesh);
  const peak = (x, z, h, w, seed, dark) => {
    const g = new THREE.ConeGeometry(w, h, 7, 3);
    const p = g.attributes.position;
    const rr = rng(seed);
    for (let i = 0; i < p.count; i++)
      if (p.getY(i) < h / 2 - 0.1) {
        p.setX(i, p.getX(i) * (0.85 + rr() * 0.3));
        p.setZ(i, p.getZ(i) * (0.85 + rr() * 0.3));
        p.setY(i, p.getY(i) + (rr() - 0.5) * h * 0.06);
      }
    const m = F(g, dark ? rockDark : rock, 0.12, seed);
    m.position.set(x, -40 + h / 2, z);
    scene.add(m);
    const cap = F(new THREE.ConeGeometry(w * 0.42, h * 0.42, 7, 1), snow, 0.06, seed + 1);
    cap.position.set(x, -40 + h - h * 0.21 + 0.5, z);
    cap.rotation.y = rr();
    scene.add(cap);
  };
  for (let i = 0; i < 7; i++)
    peak(
      mx - 210 + i * 70 + r() * 20,
      -330 - r() * 60,
      150 + r() * 90,
      60 + r() * 20,
      10 + i,
      false,
    );
  for (let i = 0; i < 6; i++)
    peak(mx - 160 + i * 64 + r() * 20, -230 - r() * 30, 90 + r() * 40, 42 + r() * 10, 30 + i, true);
  // pines on the slope
  const pineMat = flat(0x2f5a3a);
  for (let i = 0; i < 26; i++) {
    const x = mx - 90 + r() * 180;
    const z = -90 - r() * 90;
    const s = 3 + r() * 3;
    const y = -40 + (80 - (z + 110)) * 0.12;
    const m = F(new THREE.ConeGeometry(s, s * 3.2, 6, 2), pineMat, 0.12, 50 + i);
    m.position.set(x, y + s * 1.6, z);
    scene.add(m);
  }
}
// clouds drifting along the peaks (the Föhn wall cloud, scene.js moves them)
export const foehnClouds = new THREE.Group();
{
  const r = rng(77);
  const cm = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 1,
    transparent: true,
    opacity: 0.92,
  });
  for (let i = 0; i < 9; i++) {
    const c = new THREE.Mesh(new THREE.IcosahedronGeometry(14 + r() * 10, 1), cm);
    c.scale.set(2.2, 0.55, 1);
    c.position.set(-160 + i * 42 + r() * 16, 140 + r() * 30, -300 - r() * 40);
    c.userData.noAO = true;
    foehnClouds.add(c);
  }
  foehnClouds.position.x = OUT.x;
  scene.add(foehnClouds);
}

// ---------------------------------------------------------------- mirror with fogged edges
const MX0 = -10.5;
const MX1 = 2.2;
const MY0 = -1.4;
const MY1 = 11.5;
const fogTex = tex(512, 512, (g, w, h) => {
  const grd = g.createRadialGradient(w * 0.45, h * 0.45, w * 0.18, w / 2, h / 2, w * 0.72);
  grd.addColorStop(0, "rgba(255,255,255,0)");
  grd.addColorStop(1, "rgba(255,255,255,0.78)");
  g.fillStyle = grd;
  g.fillRect(0, 0, w, h);
  const r = rng(5);
  for (let i = 0; i < 60; i++) {
    g.fillStyle = `rgba(255,255,255,${0.15 + r() * 0.2})`;
    g.beginPath();
    g.arc(r() * w, r() * h, 2 + r() * 6, 0, 7);
    g.fill();
  }
});
put(
  roundedBox(MX1 - MX0 + 1.2, MY1 - MY0 + 1.2, 0.5, 0.2),
  larch,
  (MX0 + MX1) / 2,
  (MY0 + MY1) / 2,
  WALL + 0.2,
);
export const mirror = put(
  new THREE.PlaneGeometry(MX1 - MX0, MY1 - MY0),
  real.metal(0xdfe6ee, { roughness: 0.04, metalness: 1 }),
  (MX0 + MX1) / 2,
  (MY0 + MY1) / 2,
  WALL + 0.47,
  scene,
  false,
);
export const mirrorFog = new THREE.MeshBasicMaterial({
  map: fogTex,
  transparent: true,
  opacity: 0.85,
  depthWrite: false,
});
put(
  new THREE.PlaneGeometry(MX1 - MX0, MY1 - MY0),
  mirrorFog,
  (MX0 + MX1) / 2,
  (MY0 + MY1) / 2,
  WALL + 0.5,
  scene,
  false,
);
// two warm wall lights either side of the mirror
for (const x of [MX0 - 1.6, MX1 + 1.6]) {
  put(roundedBox(0.5, 0.5, 0.7, 0.1), real.metal(0xc8a46a, { roughness: 0.3 }), x, 7.5, WALL + 0.4);
  const bulb = put(
    new THREE.SphereGeometry(0.55, 32, 20),
    new THREE.MeshStandardMaterial({ color: 0xfff1d8, emissive: 0xffd9a0, emissiveIntensity: 1.6 }),
    x,
    7.5,
    WALL + 1.0,
  );
  bulb.castShadow = false;
}

// ---------------------------------------------------------------- counter: terrazzo + larch cabinet
const terrazzo = tex(
  1024,
  512,
  (g, w, h) => {
    const r = rng(12);
    g.fillStyle = "#ecebe6";
    g.fillRect(0, 0, w, h);
    const cols = ["#c9c3b8", "#9aa69a", "#d9b9a3", "#7f8a8f", "#f6f4ef"];
    for (let i = 0; i < 1600; i++) {
      g.fillStyle = cols[i % cols.length];
      g.globalAlpha = 0.5 + r() * 0.5;
      g.beginPath();
      const x = r() * w;
      const y = r() * h;
      const s = 1.5 + r() * 5;
      g.moveTo(x, y);
      g.lineTo(x + s, y + r() * s);
      g.lineTo(x + r() * s, y + s);
      g.fill();
    }
    g.globalAlpha = 1;
  },
  3,
  1,
);
put(
  roundedBox(30, 0.5, 7.4, 0.15),
  real.ceramic(0xffffff, { map: terrazzo, roughness: 0.28 }),
  -3,
  TOP - 0.25,
  WALL + 3.6,
);
put(roundedBox(29.4, 8, 6.8, 0.2), larch, -3, TOP - 4.5, WALL + 3.5);
for (const x of [-12, -3, 6]) {
  put(roundedBox(8.4, 0.12, 0.08, 0.04), flat(0x3a2716), x, TOP - 1.2, WALL + 6.95);
  put(
    roundedBox(2, 0.25, 0.3, 0.1),
    real.metal(0xc8a46a, { roughness: 0.25 }),
    x,
    TOP - 1.9,
    WALL + 7.05,
  );
}

// vessel sink + brass tap
const sinkX = -6.2;
const sinkZ = WALL + 3.2;
{
  const prof = [
    [0.001, 0],
    [1.8, 0.02],
    [2.5, 0.35],
    [2.75, 1.1],
    [2.8, 1.5],
    [2.62, 1.52],
    [2.55, 1.15],
    [2.3, 0.5],
    [1.6, 0.18],
    [0.001, 0.16],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  put(
    new THREE.LatheGeometry(prof, 96),
    real.ceramic(0xfbfbf9, { roughness: 0.12 }),
    sinkX,
    TOP,
    sinkZ,
  );
  const brass = real.metal(0xc8a46a, { roughness: 0.2 });
  put(new THREE.CylinderGeometry(0.22, 0.26, 3.8, 32), brass, sinkX, TOP + 1.9, sinkZ - 3.1);
  const spout = new THREE.TubeGeometry(
    new THREE.QuadraticBezierCurve3(V3(0, 3.8, 0), V3(0, 4.6, 0.6), V3(0, 4.0, 1.9)),
    24,
    0.17,
    16,
  );
  put(spout, brass, sinkX, TOP, sinkZ - 3.1);
  put(roundedBox(0.3, 0.3, 1.0, 0.1), brass, sinkX + 0.6, TOP + 3.3, sinkZ - 3.1);
}
function V3(x, y, z) {
  return new THREE.Vector3(x, y, z);
}

// toothbrush cup, soap pump, round brush, eucalyptus, towel stack
{
  const cup = new THREE.Group();
  put(
    new THREE.CylinderGeometry(0.55, 0.48, 1.4, 48, 1, true),
    real.ceramic(0xd8cfc0, { roughness: 0.4, side: THREE.DoubleSide }),
    0,
    0.7,
    0,
    cup,
  );
  put(new THREE.CylinderGeometry(0.48, 0.48, 0.08, 48), real.ceramic(0xd8cfc0), 0, 0.04, 0, cup);
  for (const [c, a] of [
    [0xf2f2f2, 0.18],
    [0x6fb0c8, -0.22],
  ]) {
    const b = put(
      roundedBox(0.16, 2.6, 0.12, 0.06),
      real.plastic(c),
      Math.sin(a) * 0.6,
      1.6,
      0,
      cup,
    );
    b.rotation.z = -a;
    put(
      roundedBox(0.2, 0.5, 0.2, 0.08),
      real.plastic(0x3d8bd9),
      Math.sin(a) * 1.3,
      2.95,
      0.06,
      cup,
    );
  }
  cup.position.set(-10.4, TOP, WALL + 2.0);
  scene.add(cup);

  const pump = new THREE.Group();
  put(roundedBox(1.0, 1.8, 1.0, 0.25), real.glass(0xa98a63, { opacity: 0.85 }), 0, 0.9, 0, pump);
  put(new THREE.CylinderGeometry(0.16, 0.16, 0.6, 24), real.metal(0x2b2b2b), 0, 2.1, 0, pump);
  put(roundedBox(0.8, 0.22, 0.3, 0.08), real.metal(0x2b2b2b), 0.25, 2.42, 0, pump);
  put(new THREE.PlaneGeometry(0.7, 0.7), flat(0xf3eee4), 0, 0.85, 0.51, pump);
  pump.position.set(-2.2, TOP, WALL + 1.6);
  pump.rotation.y = -0.3;
  scene.add(pump);

  // round brush lying on the counter, foreground on low shots
  const brush = new THREE.Group();
  put(
    new THREE.CylinderGeometry(0.22, 0.26, 3.2, 32).rotateZ(Math.PI / 2),
    real.plastic(0x1d1d1f),
    -1.9,
    0,
    0,
    brush,
  );
  put(
    new THREE.CylinderGeometry(0.42, 0.42, 2.2, 32).rotateZ(Math.PI / 2),
    real.metal(0xbfc3c8),
    0.8,
    0,
    0,
    brush,
  );
  const br = rng(3);
  const bristle = real.plastic(0x2a2a2a);
  for (let i = 0; i < 70; i++) {
    const a = br() * Math.PI * 2;
    const m = put(
      new THREE.CylinderGeometry(0.035, 0.035, 0.5, 6),
      bristle,
      -0.2 + br() * 2.0,
      Math.cos(a) * 0.62,
      Math.sin(a) * 0.62,
      brush,
    );
    m.rotation.x = a + Math.PI / 2;
    m.castShadow = false;
  }
  brush.position.set(-9.0, TOP + 0.65, WALL + 6.2);
  brush.rotation.y = -0.4;
  scene.add(brush);

  // eucalyptus in a stone pot, far left
  const pot = new THREE.Group();
  put(
    new THREE.CylinderGeometry(1.2, 0.95, 2.2, 48),
    real.ceramic(0x8f8a82, { roughness: 0.8 }),
    0,
    1.1,
    0,
    pot,
  );
  const r = rng(8);
  const leaf = real.plastic(0x7d9e8c, { roughness: 0.6, side: THREE.DoubleSide });
  const stem = real.plastic(0x5d6b52);
  for (let s = 0; s < 6; s++) {
    const a = (s / 6) * Math.PI * 2 + r();
    const tilt = 0.2 + r() * 0.35;
    const len = 4 + r() * 3;
    const sg = new THREE.Group();
    put(new THREE.CylinderGeometry(0.04, 0.05, len, 6), stem, 0, len / 2, 0, sg);
    for (let k = 0; k < 7; k++) {
      const lf = put(
        new THREE.CircleGeometry(0.34, 18),
        leaf,
        k % 2 ? 0.25 : -0.25,
        0.8 + k * (len / 8),
        0,
        sg,
      );
      lf.rotation.set(0.3, k % 2 ? 0.6 : -0.6, 0);
    }
    sg.position.y = 2.1;
    sg.rotation.set(Math.sin(a) * tilt, 0, Math.cos(a) * tilt);
    pot.add(sg);
  }
  pot.position.set(-15.5, TOP, WALL + 2.4);
  scene.add(pot);

  // folded towel stack, left of the sink
  const cols = [0xe8e1d4, 0x9db39a, 0xe8e1d4];
  cols.forEach((c, i) =>
    put(roundedBox(3.4, 0.7, 2.6, 0.32), real.fabric(c), -13.0, TOP + 0.36 + i * 0.72, WALL + 4.2),
  );
}

// ---------------------------------------------------------------- the towel the dryer presses into
export const towelBarY = 2.6;
put(
  new THREE.CylinderGeometry(0.16, 0.16, 7.2, 24).rotateX(Math.PI / 2),
  real.metal(0xc8a46a, { roughness: 0.2 }),
  TOWEL_X,
  towelBarY,
  WALL + 3.6,
).rotation.y = 0;
put(
  new THREE.CylinderGeometry(0.3, 0.3, 0.3, 24).rotateX(Math.PI / 2),
  real.metal(0xc8a46a, { roughness: 0.2 }),
  TOWEL_X,
  towelBarY,
  WALL + 0.15,
);
const terry = tex(
  256,
  256,
  (g, w, h) => {
    const r = rng(4);
    g.fillStyle = "#93ab93";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 5000; i++) {
      g.fillStyle = r() > 0.5 ? "rgba(255,255,255,0.12)" : "rgba(30,50,30,0.12)";
      g.fillRect(r() * w, r() * h, 2, 2);
    }
    g.fillStyle = "rgba(255,255,255,0.35)";
    g.fillRect(0, h * 0.82, w, h * 0.06);
  },
  2,
  2,
);
export const towelMat = real.fabric(0xffffff, {
  map: terry,
  side: THREE.DoubleSide,
  emissive: 0x000000,
});
// two hanging halves (front + back of the bar), gently folded
export const towelGeo = new THREE.PlaneGeometry(6.2, 5.6, 48, 40);
{
  const p = towelGeo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    p.setZ(i, Math.sin(x * 1.6) * 0.12 + Math.sin(x * 0.7 + y * 0.4) * 0.08);
  }
  towelGeo.computeVertexNormals();
}
export const towel = new THREE.Group();
for (const dx of [-0.18, 0.18]) {
  const m = put(towelGeo, towelMat, dx, -2.8, 0, towel);
  m.rotation.y = Math.PI / 2;
}
towel.position.set(TOWEL_X, towelBarY, TOWEL_Z);
towel.rotation.y = TOWEL_ROT;
scene.add(towel);

// ---------------------------------------------------------------- steam from the sink, dust in the sun
const steamMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.2,
  depthWrite: false,
});
const steam = [];
for (let i = 0; i < 10; i++) {
  const s = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 12), steamMat.clone());
  s.userData.noAO = true;
  scene.add(s);
  steam.push(s);
}
onFrame((t) => {
  steam.forEach((s, i) => {
    const f = (t * 0.16 + i / steam.length) % 1;
    s.position.set(
      sinkX + Math.sin(f * 5 + i) * 0.8 * f,
      TOP + 1.2 + f * 9,
      sinkZ + Math.cos(f * 4 + i) * 0.5,
    );
    s.scale.setScalar(0.6 + f * 2.4);
    s.material.opacity = 0.16 * Math.sin(f * Math.PI);
  });
  foehnClouds.children.forEach((c, i) => {
    c.position.x = -160 + i * 42 + ((t * 2.5 + i * 13) % 60) - 30;
  });
});
fireflies(45, { area: [-4, 14, -3, 12, -5, 4], color: 0xfff1d6, seed: 84, size: 0.05 });

// soft fill from the room side so the dryer's side is not backlit-dark
const fill = new THREE.DirectionalLight(0xffeedd, 1.0);
fill.position.set(-10, 8, 20);
scene.add(fill);

finishSet({ ground: 0xb8a58c });
