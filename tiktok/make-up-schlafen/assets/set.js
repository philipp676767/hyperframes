// #87 Mit Make-up schlafen — the world: a living room the morning after a
// birthday party, at dawn. A teal velvet sofa along the back wall, a cream
// linen throw pillow at the origin (the sleeper's head lands on it, scene.js),
// a big window behind with a pink-orange dawn sky over a city skyline, a
// "PARTY" pennant garland, warm fairy lights, gold and pink balloons, a
// floor lamp still on, a coffee table with prosecco glasses and the make-up
// (lipstick, mascara, compact), kicked-off red heels and confetti on the
// oak floor, a monstera in the corner.
// Life: balloons bob and turn, fairy lights twinkle, dust in the dawn beam,
// the curtain sways, a bird crosses the window now and then.
// Scale: 1 unit ≈ 12 cm (a head is ~1.6 units wide).
import { THREE, scene, onFrame, rng, real, roundedBox, flat } from "./world.js";
import { setSky, finishSet, fireflies, lightString } from "./environments.js";

export const FLOOR = -3.6;
export const SEAT = -0.5; // top of the sofa seat cushions
export const WALL = -8.5; // back wall plane (z)
export const WIN = { x0: -7.5, x1: 3.5, y0: 0.6, y1: 10.5 };

setSky({
  top: [0.36, 0.42, 0.72],
  mid: [0.95, 0.62, 0.7],
  hor: [1.0, 0.74, 0.52],
  below: [0.86, 0.62, 0.66],
  sun: [1.0, 0.82, 0.58],
  sunDir: [-0.18, 0.1, -1],
  cloud: [0xffe2ea, 0xffa9c2],
  clouds: 6,
  birds: false,
  hemi: [0xffe6ee, 0x6d5560, 1.15],
  key: [0xffd2a8, 2.6],
  keyPos: [-4.5, 12, -22],
  rim: [0xff9fbf, 0.8],
  fog: [60, 260],
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

// ---------------------------------------------------------------- floor: oak planks
{
  const planks = tex(
    1024,
    1024,
    (g, w, h) => {
      const r = rng(87);
      const rows = 8;
      for (let j = 0; j < rows; j++) {
        let x = -r() * 400;
        while (x < w) {
          const len = 380 + r() * 300;
          const l = 50 + r() * 14;
          g.fillStyle = `hsl(${30 + r() * 6}, ${42 + r() * 10}%, ${l}%)`;
          g.fillRect(x, (j * h) / rows, len, h / rows);
          g.strokeStyle = "rgba(60,35,15,.45)";
          g.lineWidth = 3;
          g.strokeRect(x, (j * h) / rows, len, h / rows);
          // grain
          g.strokeStyle = "rgba(90,55,25,.18)";
          g.lineWidth = 1.5;
          for (let k = 0; k < 6; k++) {
            const y = (j * h) / rows + 8 + r() * (h / rows - 16);
            g.beginPath();
            g.moveTo(x, y);
            g.bezierCurveTo(x + len * 0.3, y + 6, x + len * 0.6, y - 6, x + len, y + 2);
            g.stroke();
          }
          x += len;
        }
      }
    },
    3,
    3,
  );
  const floor = put(
    new THREE.PlaneGeometry(60, 40),
    real.wood(0xffffff, { map: planks, roughness: 0.45, clearcoat: 0.3, clearcoatRoughness: 0.3 }),
    0,
    FLOOR,
    6,
  );
  floor.rotation.x = -Math.PI / 2;
  // a soft round rug in front of the sofa
  const rugTex = tex(512, 512, (g, w, h) => {
    g.fillStyle = "#e9dccb";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#c98f7a";
    g.lineWidth = 18;
    for (const rr of [230, 190]) {
      g.beginPath();
      g.arc(w / 2, h / 2, rr, 0, Math.PI * 2);
      g.stroke();
    }
    const r = rng(5);
    for (let i = 0; i < 3000; i++) {
      g.fillStyle = `rgba(${150 + r() * 60},${120 + r() * 50},${100 + r() * 40},.18)`;
      g.fillRect(r() * w, r() * h, 3, 3);
    }
  });
  const rug = put(
    new THREE.CircleGeometry(7, 48),
    real.fabric(0xffffff, { map: rugTex }),
    2,
    FLOOR + 0.03,
    6.5,
  );
  rug.rotation.x = -Math.PI / 2;
}

// ---------------------------------------------------------------- walls with the big window
{
  const plaster = tex(
    512,
    512,
    (g, w, h) => {
      g.fillStyle = "#9fb5a6";
      g.fillRect(0, 0, w, h);
      const r = rng(11);
      for (let i = 0; i < 2600; i++) {
        const v = r();
        g.fillStyle = v > 0.5 ? "rgba(255,255,255,.05)" : "rgba(40,60,50,.05)";
        g.fillRect(r() * w, r() * h, 2 + r() * 6, 2 + r() * 6);
      }
    },
    4,
    4,
  );
  const wallMat = real.plastic(0xffffff, { map: plaster, roughness: 0.9, clearcoat: 0 });
  const H = 16;
  const box = (x0, x1, y0, y1, z, d = 0.6) =>
    put(new THREE.BoxGeometry(x1 - x0, y1 - y0, d), wallMat, (x0 + x1) / 2, (y0 + y1) / 2, z);
  box(-30, WIN.x0, FLOOR, H, WALL);
  box(WIN.x1, 30, FLOOR, H, WALL);
  box(WIN.x0, WIN.x1, FLOOR, WIN.y0, WALL);
  box(WIN.x0, WIN.x1, WIN.y1, H, WALL);
  // side wall on the left
  const side = put(new THREE.BoxGeometry(0.6, H - FLOOR, 30), wallMat, -13, (H + FLOOR) / 2, 6);
  side.receiveShadow = true;
  // skirting board
  put(roundedBox(60, 0.5, 0.15, 0.04), real.plastic(0xf2efe8), 0, FLOOR + 0.25, WALL + 0.35);
  // window frame: white, cross bars, deep sill
  const frameMat = real.plastic(0xf6f3ee, { roughness: 0.35 });
  const fx = (WIN.x0 + WIN.x1) / 2;
  const fy = (WIN.y0 + WIN.y1) / 2;
  const fw = WIN.x1 - WIN.x0;
  const fh = WIN.y1 - WIN.y0;
  for (const [w, h, x, y] of [
    [fw + 0.5, 0.35, fx, WIN.y1],
    [fw + 0.5, 0.35, fx, WIN.y0],
    [0.35, fh, WIN.x0, fy],
    [0.35, fh, WIN.x1, fy],
    [0.22, fh, fx, fy],
    [fw, 0.22, fx, WIN.y0 + fh * 0.62],
  ]) {
    put(roundedBox(w, h, 0.4, 0.06), frameMat, x, y, WALL);
  }
  put(roundedBox(fw + 1.2, 0.25, 1.4, 0.08), frameMat, fx, WIN.y0 - 0.1, WALL + 0.6);
  // the glass: barely there, catches a soft reflection
  put(
    new THREE.PlaneGeometry(fw, fh),
    real.glass(0xffe8f0, { opacity: 0.08 }),
    fx,
    fy,
    WALL - 0.05,
    scene,
    false,
  );
}

// ---------------------------------------------------------------- outside: the city at dawn
{
  const r = rng(31);
  const winTex = tex(128, 256, (g, w, h) => {
    g.fillStyle = "#fff";
    g.fillRect(0, 0, w, h);
  });
  winTex.dispose();
  for (let i = 0; i < 46; i++) {
    const x = -70 + i * 3.2 + r() * 2;
    const z = -45 - r() * 40;
    const hgt = 8 + r() * 26 + (Math.abs(x + 5) < 20 ? r() * 14 : 0);
    const wdt = 3 + r() * 4;
    const tone = 0.32 + r() * 0.16;
    const col = new THREE.Color().setRGB(0.42 * tone + 0.3, 0.3 * tone + 0.22, 0.42 * tone + 0.32);
    const b = put(
      new THREE.BoxGeometry(wdt, hgt, wdt),
      flat(col.getHex()),
      x,
      FLOOR - 6 + hgt / 2,
      z,
    );
    b.castShadow = false;
    // a few lit windows (warm) on the facade facing us
    const lit = flat(0xffd59a, { emissive: 0xffb860, emissiveIntensity: 1.2 });
    for (let k = 0; k < 6; k++) {
      if (r() < 0.45) continue;
      const wy = FLOOR - 6 + 2 + r() * (hgt - 3);
      const wx = x - wdt / 2 + 0.6 + r() * (wdt - 1.2);
      put(new THREE.PlaneGeometry(0.5, 0.7), lit, wx, wy, z + wdt / 2 + 0.02, scene, false);
    }
  }
  // the TV tower on the skyline (the hero silhouette in the window)
  const towerMat = flat(0x6c5470);
  put(new THREE.CylinderGeometry(0.5, 1.2, 46, 8), towerMat, -3, 17, -78);
  put(new THREE.SphereGeometry(2.3, 12, 10), towerMat, -3, 36, -78);
  put(new THREE.CylinderGeometry(0.15, 0.3, 10, 6), towerMat, -3, 44, -78);
  put(
    new THREE.SphereGeometry(0.35, 8, 6),
    flat(0xff4d5a, { emissive: 0xff3040, emissiveIntensity: 2 }),
    -3,
    49.2,
    -78,
    scene,
    false,
  );
}

// ---------------------------------------------------------------- the sofa (teal velvet)
export const velvet = real.fabric(0x1f6f6c, { sheenRoughness: 0.35 });
{
  const legMat = real.wood(0x6b4428, { roughness: 0.4 });
  // base frame + seat cushions
  put(roundedBox(17, 1.5, 6.6, 0.3), velvet, 5, SEAT - 1.95, -0.2);
  for (const [x, w] of [
    [-0.4, 5.6],
    [5.4, 5.6],
    [11.2, 5.6],
  ]) {
    put(roundedBox(w, 1.2, 6.0, 0.45, 5), velvet, x, SEAT - 0.6, 0.1);
  }
  // back cushions, leaning
  for (const [x, w] of [
    [-0.4, 5.6],
    [5.4, 5.6],
    [11.2, 5.6],
  ]) {
    const b = put(roundedBox(w, 3.8, 1.5, 0.6, 5), velvet, x, SEAT + 1.6, -3.0);
    b.rotation.x = -0.14;
  }
  put(roundedBox(17.6, 3.2, 1.2, 0.4), velvet, 5, SEAT + 0.6, -3.9);
  // armrest on the left (the head end)
  put(roundedBox(1.6, 4.2, 7.2, 0.7, 5), velvet, -3.9, SEAT - 0.4, -0.2);
  // legs
  for (const x of [-4.2, 13.2])
    for (const z of [-3.6, 2.8]) {
      const l = put(new THREE.CylinderGeometry(0.22, 0.14, 0.9, 12), legMat, x, FLOOR + 0.45, z);
      l.rotation.z = x < 0 ? 0.12 : -0.12;
    }
}

// ---------------------------------------------------------------- the knit blanket over the sleeper's body
export const blanketMat = real.fabric(0xe0a13a, { sheenRoughness: 0.6 });
{
  // a lumpy, draped shape: a subdivided box pushed into a soft hill
  const g = new THREE.BoxGeometry(9, 2.2, 4.6, 40, 8, 20);
  const p = g.attributes.position;
  const r = rng(4);
  const bumps = Array.from({ length: 7 }, () => [r() * 8 - 4, r() * 4 - 2, 0.2 + r() * 0.3]);
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i);
    let y = p.getY(i);
    const z = p.getZ(i);
    const ex = 1 - (Math.abs(x) / 4.5) ** 8;
    const ez = 1 - (Math.abs(z) / 2.3) ** 2;
    if (y > 0) {
      y = -1.1 + 2.7 * Math.max(0.04, ex * ez);
      for (const [bx, bz, h] of bumps) y += h * Math.exp(-((x - bx) ** 2 + (z - bz) ** 2) / 1.2);
    } else y = -1.1;
    // folds along x
    y += 0.08 * Math.sin(x * 2.4 + z * 0.8);
    p.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals();
  put(g, blanketMat, 5.6, SEAT + 1.05, 0.0);
  // a hanging fold over the seat edge
  const fold = put(roundedBox(6, 2.4, 0.3, 0.14, 4), blanketMat, 6.4, SEAT - 0.9, 3.25);
  fold.rotation.x = 0.12;
}

// ---------------------------------------------------------------- coffee table + party leftovers + make-up
export const TABLE = [5.5, FLOOR + 2.1, 7.2];
{
  const top = real.wood(0xa8754a, { roughness: 0.35, clearcoat: 0.6 });
  put(roundedBox(6.5, 0.3, 3.6, 0.12), top, TABLE[0], TABLE[1] - 0.15, TABLE[2]);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      put(
        new THREE.CylinderGeometry(0.14, 0.1, 2.0, 10),
        real.metal(0xc9a86a, { roughness: 0.25 }),
        TABLE[0] + sx * 2.9,
        FLOOR + 1.0,
        TABLE[2] + sz * 1.5,
      );
  // prosecco glasses (one tipped over)
  const glass = real.glass(0xfff0e0, { opacity: 0.3 });
  const flute = () => {
    const pts = [
      [0.0, 0],
      [0.3, 0.02],
      [0.04, 0.08],
      [0.04, 0.9],
      [0.18, 1.1],
      [0.24, 1.6],
      [0.25, 2.1],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 20);
  };
  put(flute(), glass, TABLE[0] - 1.8, TABLE[1], TABLE[2] - 0.8);
  const f2 = put(flute(), glass, TABLE[0] - 0.6, TABLE[1] + 0.25, TABLE[2] + 0.6);
  f2.rotation.set(0, 0.4, Math.PI / 2);
  // the bottle
  const bottle = put(
    new THREE.CylinderGeometry(0.42, 0.42, 2.2, 20),
    real.gloss(0x24502e, { roughness: 0.15 }),
    TABLE[0] + 2.1,
    TABLE[1] + 1.1,
    TABLE[2] - 0.7,
  );
  put(
    new THREE.CylinderGeometry(0.16, 0.4, 0.8, 16),
    bottle.material,
    TABLE[0] + 2.1,
    TABLE[1] + 2.6,
    TABLE[2] - 0.7,
  );
  put(
    new THREE.CylinderGeometry(0.18, 0.17, 0.45, 16),
    real.metal(0xe2c062, { roughness: 0.2 }),
    TABLE[0] + 2.1,
    TABLE[1] + 3.1,
    TABLE[2] - 0.7,
  );
  put(
    new THREE.CylinderGeometry(0.43, 0.43, 0.8, 20, 1, true),
    real.plastic(0xf3ead6),
    TABLE[0] + 2.1,
    TABLE[1] + 0.9,
    TABLE[2] - 0.7,
  );
  // lipstick: gold case, open, red bullet
  const lip = new THREE.Group();
  lip.position.set(TABLE[0] + 0.7, TABLE[1], TABLE[2] + 0.9);
  lip.rotation.y = 0.5;
  scene.add(lip);
  put(
    new THREE.CylinderGeometry(0.17, 0.17, 0.6, 20),
    real.metal(0xd9b25a, { roughness: 0.2 }),
    0,
    0.3,
    0,
    lip,
  );
  put(new THREE.CylinderGeometry(0.13, 0.13, 0.3, 20), real.gloss(0xb0122a), 0, 0.72, 0, lip);
  const tip = put(
    new THREE.CylinderGeometry(0.02, 0.13, 0.18, 20),
    real.gloss(0xb0122a),
    0,
    0.95,
    0,
    lip,
  );
  tip.rotation.z = 0.5;
  const cap = put(
    new THREE.CylinderGeometry(0.18, 0.18, 0.55, 20),
    real.metal(0xd9b25a, { roughness: 0.2 }),
    0.55,
    0.18,
    0.1,
    lip,
  );
  cap.rotation.z = Math.PI / 2;
  // compact powder: open, mirror in the lid, beige puck
  const cmp = new THREE.Group();
  cmp.position.set(TABLE[0] - 1.6, TABLE[1], TABLE[2] + 0.7);
  scene.add(cmp);
  put(new THREE.CylinderGeometry(0.6, 0.6, 0.18, 32), real.gloss(0x111114), 0, 0.09, 0, cmp);
  put(
    new THREE.CylinderGeometry(0.5, 0.5, 0.04, 32),
    real.plastic(0xe0b48f, { roughness: 0.9, clearcoat: 0 }),
    0,
    0.19,
    0,
    cmp,
  );
  const lidG = new THREE.Group();
  lidG.position.set(0, 0.18, -0.6);
  lidG.rotation.x = -1.9;
  cmp.add(lidG);
  put(new THREE.CylinderGeometry(0.6, 0.6, 0.08, 32), real.gloss(0x111114), 0, 0, 0.6, lidG);
  put(
    new THREE.CircleGeometry(0.5, 32),
    real.metal(0xf4f4f8, { roughness: 0.02 }),
    0,
    -0.045,
    0.6,
    lidG,
  ).rotation.x = Math.PI / 2;
}

// ---------------------------------------------------------------- red heels kicked off on the rug
{
  const patent = real.gloss(0xc0142e);
  for (const [x, z, ry, rz] of [
    [-0.5, 4.8, 0.6, 0],
    [1.6, 5.6, -1.9, 1.35],
  ]) {
    const s = new THREE.Group();
    s.position.set(x, FLOOR + 0.02, z);
    s.rotation.set(0, ry, rz);
    scene.add(s);
    // sole curve + toe box + heel spike
    const sole = new THREE.CatmullRomCurve3([
      V3(-1.2, 1.3, 0),
      V3(-0.6, 0.8, 0),
      V3(0.2, 0.15, 0),
      V3(1.1, 0.05, 0),
    ]);
    put(new THREE.TubeGeometry(sole, 24, 0.22, 8), patent, 0, 0, 0, s).scale.z = 1.6;
    const toe = put(
      new THREE.SphereGeometry(0.45, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2),
      patent,
      0.75,
      0.1,
      0,
      s,
    );
    toe.scale.set(1.3, 0.8, 0.85);
    put(new THREE.CylinderGeometry(0.05, 0.13, 1.35, 10), patent, -1.15, 0.65, 0, s);
  }
}
function V3(x, y, z) {
  return new THREE.Vector3(x, y, z);
}

// ---------------------------------------------------------------- floor lamp (still on), monstera
{
  const lx = -9.5;
  const lz = -5.8;
  put(
    new THREE.CylinderGeometry(0.9, 1.0, 0.2, 24),
    real.metal(0x2a2a2e, { roughness: 0.4 }),
    lx,
    FLOOR + 0.1,
    lz,
  );
  put(
    new THREE.CylinderGeometry(0.08, 0.08, 11, 10),
    real.metal(0xc9a86a, { roughness: 0.25 }),
    lx,
    FLOOR + 5.6,
    lz,
  );
  put(
    new THREE.CylinderGeometry(1.2, 1.9, 2.2, 28, 1, true),
    flat(0xfbe8c8, { emissive: 0xffb45e, emissiveIntensity: 1.3, side: THREE.DoubleSide }),
    lx,
    FLOOR + 11.6,
    lz,
    scene,
    false,
  );
  const ll = new THREE.PointLight(0xffb060, 30, 16, 1.4);
  ll.position.set(lx, FLOOR + 10.8, lz + 0.6);
  scene.add(ll);

  // monstera in a terracotta pot (right corner)
  const px = 17;
  const pz = -6.2;
  put(
    new THREE.CylinderGeometry(1.4, 1.1, 2.4, 24),
    real.ceramic(0xc06a46, { roughness: 0.6 }),
    px,
    FLOOR + 1.2,
    pz,
  );
  const leaf = real.plastic(0x2f7a3e, { roughness: 0.55, side: THREE.DoubleSide });
  const r = rng(12);
  const leaves = new THREE.Group();
  leaves.position.set(px, FLOOR + 2.3, pz);
  scene.add(leaves);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + r();
    const len = 3 + r() * 3;
    const stem = new THREE.Group();
    stem.rotation.set(0, a, 0.5 + r() * 0.5);
    leaves.add(stem);
    put(new THREE.CylinderGeometry(0.05, 0.06, len, 6), leaf, 0, len / 2, 0, stem);
    const lf = put(new THREE.CircleGeometry(1.1 + r() * 0.5, 14), leaf, 0, len + 0.6, 0.2, stem);
    lf.rotation.set(-1.0, 0, 0);
    lf.scale.set(1, 1.3, 1);
  }
  onFrame((t) => {
    leaves.rotation.y = Math.sin(t * 0.4) * 0.03;
  });
}

// ---------------------------------------------------------------- curtain on the window's right
{
  const g = new THREE.PlaneGeometry(3.2, 14.5, 24, 30);
  const base = g.attributes.position.array.slice();
  const cur = put(
    g,
    real.fabric(0xf3d9cf, { side: THREE.DoubleSide, transparent: true, opacity: 0.92 }),
    WIN.x1 + 1.4,
    WIN.y0 + 5.6,
    WALL + 0.9,
  );
  cur.castShadow = false;
  onFrame((t) => {
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 3];
      const y = base[i * 3 + 1];
      const low = (7.25 - y) / 14.5;
      p.setZ(i, 0.35 * Math.sin(x * 4.2) + low * 0.25 * Math.sin(t * 0.9 + x * 1.5 + y * 0.3));
    }
    p.needsUpdate = true;
    g.computeVertexNormals();
  });
}

// ---------------------------------------------------------------- party: garland, fairy lights, balloons, confetti
{
  // pennant garland across the window top
  const A = [WIN.x0 - 1, WIN.y1 + 0.6, WALL + 0.6];
  const B = [WIN.x1 + 1, WIN.y1 + 0.6, WALL + 0.6];
  lightString(A, B, { n: 2, sag: 0.9, colors: [0x2f3440], glow: 0 });
  const cols = [0xf2668b, 0xffd23f, 0x5ac8c8, 0xffffff];
  const letters = "PARTY";
  for (let i = 0; i < 9; i++) {
    const k = (i + 1) / 10;
    const x = A[0] + (B[0] - A[0]) * k;
    const y = A[1] - 0.9 * 4 * k * (1 - k);
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g2 = c.getContext("2d");
    g2.fillStyle = "#" + cols[i % 4].toString(16).padStart(6, "0");
    g2.beginPath();
    g2.moveTo(0, 0);
    g2.lineTo(128, 0);
    g2.lineTo(64, 128);
    g2.fill();
    if (i >= 2 && i < 7) {
      g2.fillStyle = cols[i % 4] === 0xffffff ? "#f2668b" : "#ffffff";
      g2.font = "900 54px sans-serif";
      g2.textAlign = "center";
      g2.fillText(letters[i - 2], 64, 58);
    }
    const tx = new THREE.CanvasTexture(c);
    tx.colorSpace = THREE.SRGBColorSpace;
    const pen = put(
      new THREE.PlaneGeometry(1.0, 1.0),
      real.fabric(0xffffff, { map: tx, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide }),
      x,
      y - 0.55,
      WALL + 0.62,
      scene,
      false,
    );
    onFrame((t) => (pen.rotation.x = Math.sin(t * 1.3 + i) * 0.12));
  }
  // fairy lights along the wall above the sofa
  lightString([-12.5, 8.5, WALL + 0.5], [WIN.x0 - 0.4, 9.4, WALL + 0.5], { n: 10, sag: 1.2 });
  lightString([WIN.x1 + 2.5, 9.6, WALL + 0.5], [18, 8.2, WALL + 0.5], {
    n: 12,
    sag: 1.4,
    colors: [0xffc46e, 0xfff0c8],
  });

  // balloons floating at the ceiling-ish, on strings
  const r = rng(77);
  for (const [x, y, z, col, s] of [
    [-10.5, 9.5, -4.5, 0xe9c25c, 1.0],
    [-8.8, 10.6, -5.6, 0xf28fb0, 1.1],
    [10.5, 10.2, -5.2, 0xe9c25c, 1.0],
    [12.4, 9.0, -4.2, 0xffffff, 0.95],
    [14.2, 10.8, -6.0, 0xf28fb0, 1.05],
  ]) {
    const b = new THREE.Group();
    b.position.set(x, y, z);
    scene.add(b);
    const mat =
      col === 0xe9c25c ? real.metal(col, { roughness: 0.18 }) : real.gloss(col, { roughness: 0.2 });
    const ball = put(new THREE.SphereGeometry(1.0 * s, 28, 20), mat, 0, 0, 0, b);
    ball.scale.set(1, 1.18, 1);
    put(new THREE.ConeGeometry(0.14, 0.22, 10), mat, 0, -1.22 * s, 0, b).rotation.x = Math.PI;
    const str = put(
      new THREE.CylinderGeometry(0.012, 0.012, y - FLOOR - 1.4, 4),
      flat(0xf4f4f4),
      0,
      -(y - FLOOR) / 2 - 0.6,
      0,
      b,
      false,
    );
    str.castShadow = false;
    const ph = r() * 6;
    onFrame((t) => {
      b.position.y = y + Math.sin(t * 0.7 + ph) * 0.18;
      b.rotation.y = Math.sin(t * 0.35 + ph) * 0.5;
      b.rotation.z = Math.sin(t * 0.5 + ph) * 0.05;
    });
  }
  // one sad deflated balloon on the floor
  const sad = put(
    new THREE.SphereGeometry(0.8, 20, 12),
    real.gloss(0x5ac8c8, { roughness: 0.3 }),
    -6.5,
    FLOOR + 0.18,
    4.5,
  );
  sad.scale.set(1.1, 0.25, 0.8);

  // confetti on the floor, the rug and the sofa (instanced)
  const N = 520;
  const im = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(0.13, 0.08),
    real.gloss(0xffffff, { side: THREE.DoubleSide }),
    N,
  );
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const pal = [0xf2668b, 0xffd23f, 0x5ac8c8, 0xffffff, 0xe9c25c].map((c) => new THREE.Color(c));
  for (let i = 0; i < N; i++) {
    let x;
    let y;
    let z;
    if (i < 380) {
      x = -10 + r() * 24;
      z = 3.5 + r() * 9;
      y = FLOOR + 0.04;
    } else {
      x = 2.5 + r() * 12;
      z = -2.5 + r() * 5;
      y = SEAT + 0.04 + (x > 2 ? 0 : 0);
      if (x > 2 && x < 10.5 && z > -2 && z < 2.4) {
        i--;
        continue;
      }
    }
    e.set(-Math.PI / 2 + (r() - 0.5) * 0.4, r() * 6, 0);
    q.setFromEuler(e);
    m4.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(1, 1, 1));
    im.setMatrixAt(i, m4);
    im.setColorAt(i, pal[Math.floor(r() * pal.length)]);
  }
  im.receiveShadow = true;
  scene.add(im);
}

// ---------------------------------------------------------------- life: dust in the dawn beam, a bird outside
fireflies(70, { area: [-7, 4, -1, 8, -7, 3], color: 0xffe6c8, seed: 21, size: 0.03 });
{
  const bird = new THREE.Group();
  const wingMat = flat(0x3a2c3c, { side: THREE.DoubleSide });
  const wl = put(new THREE.PlaneGeometry(0.9, 0.3), wingMat, -0.45, 0, 0, bird, false);
  const wr = put(new THREE.PlaneGeometry(0.9, 0.3), wingMat, 0.45, 0, 0, bird, false);
  scene.add(bird);
  onFrame((t) => {
    const k = (((t * 0.09) % 1) + 1) % 1;
    bird.position.set(-40 + k * 70, 14 + Math.sin(k * 9) * 1.5, -40);
    const f = Math.sin(t * 11) * 0.7;
    wl.rotation.z = f;
    wr.rotation.z = -f;
    wl.rotation.x = wr.rotation.x = -Math.PI / 2;
  });
}

finishSet({ ground: 0x8c6a52 });
