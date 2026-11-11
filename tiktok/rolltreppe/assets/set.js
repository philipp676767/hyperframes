// #72 Rolltreppe — an underground station at rush hour. Lower level = the
// platform (grey terrazzo tiles, white safety line, track pit on the left
// with a white-red train that rolls in, waits and leaves), upper level =
// the mezzanine the escalator climbs to (glass railing, ticket machines,
// the bright exit). Fixed stairs run beside the escalator, cream wall
// tiles with lit poster frames on the right, a snack machine, a bench, a
// departure board under the ceiling's light strips. Life: the train, the
// board's blinking colon, dust in the light, waiting people shifting.
//
// Scale: 1 unit = 1 m. Platform floor y = 0, mezzanine floor y = H. The
// escalator (scene.js) runs up towards -z between x = -0.7 and 0.7.
import { THREE, onFrame, ground, real, roundedBox, rng } from "./world.js";
import { setSky, finishSet, fireflies } from "./environments.js";
import { makeFigure } from "./figur.js";

export const H = 3.464; // rise of the escalator (30°, 6 m run)
export const TOP_Z = -5.6; // where the mezzanine slab starts
const FLOOR_H = H + 0.045;

setSky({
  top: [0.78, 0.79, 0.8],
  mid: [0.62, 0.63, 0.66],
  hor: [0.42, 0.44, 0.48],
  below: [0.3, 0.31, 0.34],
  sun: [0.3, 0.3, 0.3],
  sunDir: [0, 1, 0],
  cloud: [0x000000, 0x000000],
  noClouds: true,
  birds: false,
  hemi: [0xf6f8ff, 0x8a8e98, 2.3],
  key: [0xfff3e2, 2.6],
  keyPos: [-5, 13, 9],
  rim: [0x9fd0ff, 0.8],
  fog: [24, 85],
});

// ---------------------------------------------------------------- helpers
const tex = (w, h, draw, rx = 1, ry = 1) => {
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
const tiles = (base, joint, n, spread, seed) => (g, w, h) => {
  const r = rng(seed);
  const s = w / n;
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const v = (r() - 0.5) * spread;
      g.fillStyle = `rgb(${base.map((c) => Math.round(c + v)).join(",")})`;
      g.fillRect(x * s, y * s, s, s);
      if (r() < 0.25) {
        g.fillStyle = `rgba(0,0,0,${0.03 + r() * 0.05})`;
        g.fillRect(x * s + r() * s * 0.5, y * s + r() * s * 0.5, s * 0.4, s * 0.3);
      }
    }
  g.strokeStyle = joint;
  g.lineWidth = 2;
  for (let i = 0; i <= n; i++) {
    g.beginPath();
    g.moveTo(i * s, 0);
    g.lineTo(i * s, h);
    g.moveTo(0, i * s);
    g.lineTo(w, i * s);
    g.stroke();
  }
};
const box = (w, h, d, mat, x, y, z, shadow = true) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  ground.add(m);
  return m;
};
const rbox = (w, h, d, r, mat, x, y, z) => {
  const m = new THREE.Mesh(roundedBox(w, h, d, r), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  ground.add(m);
  return m;
};
const glow = (color, i = 1.6) =>
  new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: color, emissiveIntensity: i });
const tileMat = (base, joint, rx, ry, seed, o = {}) =>
  new THREE.MeshPhysicalMaterial({
    map: tex(512, 512, tiles(base, joint, 8, 14, seed), rx, ry),
    roughness: 0.38,
    clearcoat: 0.35,
    clearcoatRoughness: 0.3,
    ...o,
  });

// ---------------------------------------------------------------- floors
const floorMat = tileMat([150, 152, 156], "rgba(60,62,68,0.6)", 6, 15, 3);
box(15, 0.4, 38, floorMat, 1.5, -0.2, -5); // platform x -6..9, z -24..14
box(0.42, 0.012, 38, real.plastic(0xf4f4f0, { roughness: 0.7 }), -5.35, 0.006, -5, false);
box(0.12, 0.014, 38, real.plastic(0xffd23f, { roughness: 0.6 }), -5.75, 0.007, -5, false);
// track pit, rails, sleepers
box(3.6, 0.2, 38, real.rubber(0x2b2c30), -7.8, -1.2, -5);
for (const x of [-8.5, -7.0])
  box(0.08, 0.14, 38, real.metal(0x9aa0a8, { roughness: 0.25 }), x, -1.03, -5);
{
  const im = new THREE.InstancedMesh(
    new THREE.BoxGeometry(2.4, 0.1, 0.26),
    real.rubber(0x4a4640),
    56,
  );
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 56; i++) im.setMatrixAt(i, m4.makeTranslation(-7.75, -1.08, -24 + i * 0.68));
  im.receiveShadow = true;
  ground.add(im);
}
// mezzanine slab + its floor
box(15, 0.42, 18.4, real.plastic(0xb9bcc2, { roughness: 0.8 }), 1.5, H - 0.21, -14.8);
box(
  15,
  0.045,
  18.4,
  tileMat([196, 190, 178], "rgba(90,86,78,0.6)", 6, 7, 5),
  1.5,
  H + 0.0225,
  -14.8,
);
box(15, 0.5, 0.08, real.plastic(0x2f5f9a, { roughness: 0.5 }), 1.5, H - 0.2, TOP_Z + 0.05, false);

// ---------------------------------------------------------------- walls + ceiling
const wallR = tileMat([226, 220, 204], "rgba(120,112,96,0.55)", 19, 4, 7);
box(0.3, 7.6, 38, wallR, 9.15, 3.4, -5, false);
box(18.9, 7.6, 0.3, tileMat([214, 210, 198], "rgba(120,112,96,0.55)", 9, 4, 8), -0.3, 3.4, -24.15);
// track wall: dark tiles, a blue band with the station name
box(
  0.3,
  9,
  38,
  tileMat([70, 78, 92], "rgba(20,24,32,0.7)", 19, 5, 9, { roughness: 0.3 }),
  -9.75,
  3,
  -5,
  false,
);
box(0.05, 0.5, 38, real.gloss(0x2f5f9a), -9.57, 3.1, -5, false);
const nameTex = tex(512, 96, (g, w, h) => {
  g.fillStyle = "#f4f4f0";
  g.fillRect(0, 0, w, h);
  g.fillStyle = "#1f2a3a";
  g.font = "800 62px Montserrat, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("MARKTPLATZ", w / 2, h / 2 + 4);
});
for (const z of [-17, -5, 7]) {
  const s = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 0.48),
    new THREE.MeshStandardMaterial({
      map: nameTex,
      emissive: 0xffffff,
      emissiveMap: nameTex,
      emissiveIntensity: 0.35,
    }),
  );
  s.rotation.y = Math.PI / 2;
  s.position.set(-9.53, 3.1, z);
  ground.add(s);
}
// tunnel mouth at the far end of the track
box(3.6, 4.2, 1.2, new THREE.MeshBasicMaterial({ color: 0x050608 }), -7.8, 0.9, -24.6, false);
box(0.12, 0.12, 0.05, glow(0xff2a1f, 3), -9.3, 1.6, -23.9, false);
// ceiling + light strips
box(19.5, 0.3, 38, real.plastic(0xd4d7dc, { roughness: 0.9 }), -0.3, 7.35, -5, false);
const tube = glow(0xfff6e6, 2.4);
for (const x of [-7.8, -3.2, 2.2, 6.6])
  for (let z = 11; z >= -22; z -= 5.5) box(0.22, 0.06, 3.2, tube, x, 7.16, z, false);
for (const x of [-3.2, 2.2, 6.6])
  for (let z = -8; z >= -22; z -= 4.5) box(0.2, 0.05, 2.4, tube, x, H - 0.44, z, false);
// columns
const colMat = tileMat([92, 128, 150], "rgba(30,50,64,0.6)", 4, 12, 11, { roughness: 0.25 });
for (const [x, z] of [
  [-4.3, 8.5],
  [-4.3, -9.5],
  [-4.3, -17],
  [5.6, -11],
  [5.6, -18],
]) {
  const c = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 7.2, 40), colMat);
  c.position.set(x, 3.6, z);
  c.castShadow = c.receiveShadow = true;
  ground.add(c);
}

// ---------------------------------------------------------------- fixed stairs beside the escalator
{
  const stone = real.plastic(0xa9a39a, { roughness: 0.85, clearcoat: 0 });
  const nose = real.plastic(0xffd23f, { roughness: 0.6 });
  const N = 15;
  for (let i = 0; i < N; i++) {
    const y = ((i + 1) * H) / N;
    const z = 3 - (i + 0.5) * 0.4;
    box(1.62, y, 0.4, stone, 2.1, y / 2, z);
    box(1.62, 0.012, 0.03, nose, 2.1, y + 0.006, z + 0.185, false);
  }
  box(1.62, H + 0.045, 2.6, stone, 2.1, (H + 0.045) / 2, -4.3);
  // solid side walls with a steel handrail
  const band = new THREE.Shape();
  band.moveTo(-3.3, 0);
  band.lineTo(-3.3, 1.0);
  band.lineTo(3, H + 1.0);
  band.lineTo(5.6, H + 1.0);
  band.lineTo(5.6, 0);
  const wallGeo = new THREE.ExtrudeGeometry(band, { depth: 0.1, bevelEnabled: false });
  const railGeo = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(
      [
        [-3.4, 1.08],
        [-3.0, 1.1],
        [3, H + 1.1],
        [5.5, H + 1.1],
      ].map(([u, y]) => new THREE.Vector3(u, y, 0)),
      false,
      "catmullrom",
      0.05,
    ),
    80,
    0.028,
    12,
  );
  for (const x of [1.2, 2.92]) {
    const g = new THREE.Group();
    g.rotation.y = Math.PI / 2;
    g.position.x = x;
    // the wall next to the escalator is glass, so the camera can look across
    const w = new THREE.Mesh(
      wallGeo,
      x < 2
        ? real.glass(0xcfe6ee, { opacity: 0.16 })
        : real.plastic(0xd9d5cc, { roughness: 0.8, clearcoat: 0 }),
    );
    w.castShadow = w.receiveShadow = x > 2;
    const r = new THREE.Mesh(railGeo, real.metal(0xcdd2d8, { roughness: 0.2 }));
    r.position.z = 0.05;
    g.add(w, r);
    ground.add(g);
  }
}

// ---------------------------------------------------------------- glass railings on the mezzanine
{
  const glass = real.glass(0xcfe6ee, { opacity: 0.22 });
  const steel = real.metal(0xcdd2d8, { roughness: 0.22 });
  const run = (x0, x1, z0, z1) => {
    const len = Math.hypot(x1 - x0, z1 - z0);
    const g = new THREE.Group();
    g.position.set((x0 + x1) / 2, FLOOR_H, (z0 + z1) / 2);
    g.rotation.y = Math.atan2(z0 - z1, x1 - x0);
    const p = new THREE.Mesh(new THREE.BoxGeometry(len, 0.95, 0.02), glass);
    p.position.y = 0.55;
    const r = new THREE.Mesh(new THREE.BoxGeometry(len, 0.05, 0.06), steel);
    r.position.y = 1.05;
    g.add(p, r);
    for (let i = 0; i <= Math.round(len / 1.5); i++) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.05, 0.05), steel);
      post.position.set(-len / 2 + (i * len) / Math.round(len / 1.5), 0.52, 0);
      g.add(post);
    }
    ground.add(g);
  };
  run(-6, -0.85, TOP_Z, TOP_Z);
  run(3.05, 9, TOP_Z, TOP_Z);
  run(-6, -6, TOP_Z, -24);
}

// ---------------------------------------------------------------- posters, machines, bench, board
const poster = (seed, a, b, word) =>
  tex(256, 384, (g, w, h) => {
    const r = rng(seed);
    const gr = g.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, a);
    gr.addColorStop(1, b);
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 5; i++) {
      g.fillStyle = `rgba(255,255,255,${0.1 + r() * 0.2})`;
      g.beginPath();
      g.arc(r() * w, r() * h * 0.7, 30 + r() * 70, 0, 7);
      g.fill();
    }
    g.fillStyle = "#fff";
    g.font = "800 44px Montserrat, sans-serif";
    g.textAlign = "center";
    g.fillText(word, w / 2, h - 46);
  });
[
  [6.5, 2.2, 0, poster(1, "#ff6a3d", "#ffd23f", "SOMMER")],
  [2.6, 2.2, 0, poster(2, "#2c7a82", "#7fe0c3", "KAFFEE?")],
  [-1.3, 2.2, 0, poster(3, "#5b3fd6", "#ff7ab8", "KONZERT")],
  [-9, H + 1.9, 0, poster(4, "#1f2a3a", "#4fc3ff", "NACHTBUS")],
  [-14, H + 1.9, 0, poster(5, "#d8352a", "#ff9a5a", "KINO")],
].forEach(([z, y, , t]) => {
  box(0.08, 1.96, 1.36, real.metal(0x8d939b, { roughness: 0.35 }), 8.97, y, z, false);
  const p = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 1.8),
    new THREE.MeshStandardMaterial({
      map: t,
      emissive: 0xffffff,
      emissiveMap: t,
      emissiveIntensity: 0.55,
    }),
  );
  p.rotation.y = -Math.PI / 2;
  p.position.set(8.92, y, z);
  ground.add(p);
});
// snack machine
{
  rbox(0.85, 1.9, 1.05, 0.05, real.gloss(0x1f2a3a), 8.5, 0.95, 4.4);
  const t = tex(256, 384, (g, w, h) => {
    g.fillStyle = "#0e1420";
    g.fillRect(0, 0, w, h);
    const r = rng(12);
    const cols = ["#ff6a3d", "#ffd23f", "#4fc3ff", "#7fe0c3", "#ff7ab8", "#f4f4f0"];
    for (let y = 0; y < 6; y++)
      for (let x = 0; x < 5; x++) {
        g.fillStyle = cols[Math.floor(r() * cols.length)];
        g.fillRect(14 + x * 47, 14 + y * 60, 34, 46);
      }
  });
  const f = new THREE.Mesh(
    new THREE.PlaneGeometry(0.72, 1.3),
    new THREE.MeshStandardMaterial({
      map: t,
      emissive: 0xffffff,
      emissiveMap: t,
      emissiveIntensity: 0.9,
    }),
  );
  f.rotation.y = -Math.PI / 2;
  f.position.set(8.07, 1.15, 4.4);
  ground.add(f);
}
// ticket machines on the mezzanine
for (const z of [-8.2, -9.6]) {
  rbox(0.5, 1.7, 0.9, 0.04, real.gloss(0xd8352a), 8.7, FLOOR_H + 0.85, z);
  box(0.02, 0.45, 0.55, glow(0x9fd8ff, 1.3), 8.44, FLOOR_H + 1.2, z, false);
}
// bench + bin
{
  const steel = real.metal(0xb9bec6, { roughness: 0.3 });
  box(0.08, 0.08, 2.2, steel, 8.3, 0.36, 0.6);
  for (const z of [-0.3, 0.6, 1.5]) {
    rbox(0.46, 0.05, 0.5, 0.02, real.plastic(0x2f5f9a), 8.3, 0.44, z);
    rbox(0.05, 0.42, 0.5, 0.02, real.plastic(0x2f5f9a), 8.55, 0.7, z);
  }
  for (const z of [-0.4, 1.6]) box(0.4, 0.36, 0.06, steel, 8.3, 0.18, z);
  const bin = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.2, 0.75, 32), steel);
  bin.position.set(8.45, 0.375, 2.6);
  bin.castShadow = true;
  ground.add(bin);
}
// exit portal + sign on the mezzanine's back wall
box(3.2, 2.7, 0.06, glow(0xfff3d8, 2.6), 4.4, FLOOR_H + 1.35, -23.95, false);
{
  const t = tex(256, 96, (g, w, h) => {
    g.fillStyle = "#12894a";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#fff";
    g.font = "800 50px Montserrat, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("AUSGANG", w / 2, h / 2 + 3);
  });
  const s = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 0.56),
    new THREE.MeshStandardMaterial({
      map: t,
      emissive: 0xffffff,
      emissiveMap: t,
      emissiveIntensity: 0.9,
    }),
  );
  s.position.set(4.4, FLOOR_H + 3.05, -23.9);
  ground.add(s);
}
// departure board hanging over the platform
{
  const draw = (colon) => (g, w, h) => {
    g.fillStyle = "#0b0d12";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#ffb52e";
    g.font = "700 44px Montserrat, sans-serif";
    g.textBaseline = "middle";
    g.fillText("U2  Seeufer", 20, 38);
    g.fillText("U2  Stadion", 20, 96);
    g.textAlign = "right";
    g.fillText(colon ? "2 min" : "2 min.", w - 20, 38);
    g.fillText("7 min", w - 20, 96);
  };
  const a = tex(512, 128, draw(true));
  const b = tex(512, 128, draw(false));
  const mat = new THREE.MeshStandardMaterial({
    map: a,
    emissive: 0xffffff,
    emissiveMap: a,
    emissiveIntensity: 1.1,
  });
  box(2.3, 0.62, 0.14, real.plastic(0x1a1c22), -3.2, 4.5, 3.2, false);
  for (const x of [-4.1, -2.3]) box(0.04, 2.4, 0.04, real.metal(0x8d939b), x, 6.0, 3.2, false);
  const p = new THREE.Mesh(new THREE.PlaneGeometry(2.16, 0.5), mat);
  p.position.set(-3.2, 4.5, 3.275);
  ground.add(p);
  onFrame((t) => {
    const m = Math.floor(t * 1.2) % 2 ? a : b;
    mat.map = mat.emissiveMap = m;
  });
}

// ---------------------------------------------------------------- the train (life)
{
  const train = new THREE.Group();
  const t = tex(1024, 128, (g, w, h) => {
    g.fillStyle = "#f1f1ee";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#d8352a";
    g.fillRect(0, h * 0.72, w, h * 0.28);
    for (let i = 0; i < 8; i++) {
      const x = 20 + i * 126;
      g.fillStyle = i % 3 === 1 ? "#c9ccd2" : "#ffe9b8";
      g.fillRect(x, 22, i % 3 === 1 ? 70 : 100, i % 3 === 1 ? 96 : 52);
      if (i % 3 === 1) {
        g.fillStyle = "#ffe9b8";
        g.fillRect(x + 6, 28, 26, 46);
        g.fillRect(x + 38, 28, 26, 46);
      }
    }
  });
  const side = new THREE.MeshPhysicalMaterial({
    map: t,
    emissive: 0xffffff,
    emissiveMap: t,
    emissiveIntensity: 0.32,
    roughness: 0.3,
    clearcoat: 0.8,
  });
  const body = real.gloss(0xf1f1ee);
  for (const z of [-8.7, 8.7]) {
    const car = new THREE.Mesh(roundedBox(2.7, 2.9, 17, 0.25), [
      side,
      side,
      body,
      body,
      body,
      body,
    ]);
    car.position.set(0, 0.55, z);
    car.castShadow = true;
    train.add(car);
  }
  for (const x of [-0.9, 0.9]) {
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 12), glow(0xfff6d8, 4));
    l.position.set(x, -0.3, 17.25);
    train.add(l);
  }
  train.position.x = -7.75;
  ground.add(train);
  onFrame((t) => {
    const k = (((t - 2) % 36) + 36) % 36;
    let z;
    if (k < 7) z = -50 + 44 * (1 - (1 - k / 7) ** 2);
    else if (k < 24) z = -6;
    else z = -6 + 70 * ((k - 24) / 12) ** 2;
    train.position.z = z;
  });
}

// ---------------------------------------------------------------- waiting people + dust
{
  const looks = [
    { top: 0xc9503c, legs: 0x23262c, pack: null, hair: 0x5a3a22 },
    { top: 0xe8c86a, legs: 0x3a4a6a, hair: 0x1a1512 },
    { top: 0x4a4f5a, legs: 0x6b5a48, pack: null, hair: 0xb98a4a },
    { top: 0x7a5aa8, legs: 0x23262c, hair: 0x2a2018 },
    { top: 0x3f8f5a, legs: 0x2f3440, pack: null, hair: 0x1a1512 },
  ];
  const spots = [
    [-4.6, 0, 4.6, 1.5],
    [-4.9, 0, 1.6, 1.3],
    [-4.4, 0, -2.4, 1.8],
    [-4.8, 0, -12, 1.4],
    [-3.2, FLOOR_H, -6.4, 3.0],
  ];
  const ppl = spots.map(([x, y, z, rot], i) => {
    const f = makeFigure(looks[i]);
    f.group.position.set(x, y, z);
    f.group.rotation.y = rot;
    ground.add(f.group);
    return f;
  });
  onFrame((t) =>
    ppl.forEach((f, i) => {
      f.body.rotation.z = Math.sin(t * 0.7 + i * 2.1) * 0.025;
      f.body.rotation.x = Math.sin(t * 0.5 + i) * 0.02;
    }),
  );
}
fireflies(46, { area: [-5, 8, 0.6, 6.5, -5, 10], color: 0xfff1d6, seed: 72, size: 0.012 });

finishSet({ ground: 0x8e9096 });
