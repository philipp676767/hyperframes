// #48 Touchscreen — a Viennese tram stop on a snowy winter evening: snow
// on the paving, the tram tracks right behind the stage with a red-white
// tram gliding through, a glowing Würstelstand as the hero piece (it hands
// out the sausage of the hook), the waiting shelter with its "H" sign, old
// town houses with lit windows behind, overhead wires, falling snow and
// steam from the stand.
import { THREE, V, rng, flat, ground, onFrame, facet, facetMat, noise2 } from "./world.js";
import { SKIES, setSky, finishSet, terrain, F, add, lightString, pine } from "./environments.js";
import { place, bench, lamp, bin, bike, busStop } from "./props.js";

const SEED = 48;
const r = rng(SEED);
const shadowAll = (g) =>
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = o.receiveShadow = true;
  });
const box = (w, h, d, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(
    facet(new THREE.BoxGeometry(w, h, d), 0.04, Math.floor(r() * 99)),
    facetMat(mat),
  );
  m.position.set(x, y + h / 2, z);
  m.castShadow = m.receiveShadow = true;
  return m;
};
function canvasTex(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
const glowMat = (c, k = 1) => flat(c, { emissive: c, emissiveIntensity: k });

// ---------------------------------------------------------------- light
// blue hour in winter: deep blue zenith, a last pink-orange band low in the
// west, the first stars; warm lamps and windows against it
const sky = setSky({
  ...SKIES.abend,
  top: [0.07, 0.1, 0.3],
  mid: [0.24, 0.26, 0.55],
  hor: [0.98, 0.62, 0.55],
  below: [0.36, 0.38, 0.58],
  sun: [1.0, 0.72, 0.55],
  sunDir: [-0.5, 0.04, -1],
  hemi: [0xb8c4ff, 0x4a4a66, 1.2],
  key: [0xffd2b0, 1.9],
  keyPos: [5, 11, 9],
  rim: [0x8fa0ff, 1.0],
  stars: 0.45,
  clouds: 7,
  birds: false,
  fog: [26, 85],
  nightWindows: true,
});

// ---------------------------------------------------------------- ground
// fresh snow everywhere, blue in the hollows
const SNOW = 0xe9eef8;
terrain(SNOW, { seed: SEED, amt: 0.06, scale: 0.16, warm: -0.5, hills: 0 });

// pavement in front of the tracks: grey slabs, half covered by snow
{
  const slabs = [];
  for (let x = -22; x <= 22; x += 1.1) for (let z = -6.1; z <= 9; z += 1.1) slabs.push([x, z]);
  const slab = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1.06, 0.08, 1.06),
    flat(0xffffff, { roughness: 0.85 }),
    slabs.length,
  );
  const m4 = new THREE.Matrix4();
  const col = new THREE.Color();
  const stone = new THREE.Color(0xa9abb8);
  const snow = new THREE.Color(0xf2f5fc);
  slabs.forEach(([x, z], i) => {
    m4.makeTranslation(x, 0, z);
    slab.setMatrixAt(i, m4);
    const n = noise2(x * 0.22, z * 0.22, 5);
    const s = Math.min(1, Math.max(0, (n - 0.38) * 3.2));
    col
      .copy(stone)
      .multiplyScalar(0.85 + r() * 0.2)
      .lerp(snow, s * (0.75 + r() * 0.25));
    slab.setColorAt(i, col);
  });
  slab.receiveShadow = true;
  ground.add(slab);
}
// curb + the street with the tram tracks behind the stage
const TRACK_Z = -8.6;
add(box(90, 0.22, 0.35, flat(0x9c9eaa)), 0, -0.1, -6.55);
{
  const road = new THREE.Mesh(
    facet(new THREE.PlaneGeometry(90, 5.2, 60, 4), 0.05, 3),
    facetMat(flat(0x4a4c5c, { roughness: 0.6 })),
  );
  road.rotation.x = -Math.PI / 2;
  add(road, 0, 0.02, TRACK_Z, false).receiveShadow = true;
  // wet-dark cobbles between the rails
  const cob = new THREE.Mesh(
    facet(new THREE.PlaneGeometry(90, 1.5, 120, 3), 0.12, 4),
    facetMat(flat(0x5d5a64, { roughness: 0.5 })),
  );
  cob.rotation.x = -Math.PI / 2;
  add(cob, 0, 0.03, TRACK_Z, false).receiveShadow = true;
  const rail = flat(0xc8ccd8, { metalness: 0.8, roughness: 0.25 });
  for (const dz of [-0.62, 0.62]) add(box(90, 0.06, 0.1, rail), 0, 0.02, TRACK_Z + dz, false);
  // snow banks at the curb
  for (let i = 0; i < 16; i++) {
    const x = -30 + i * 4 + r() * 2;
    if (Math.abs(x) < 3) continue;
    const m = add(
      new THREE.Mesh(facet(new THREE.IcosahedronGeometry(1, 1), 0.04, i), facetMat(flat(0xf5f8ff))),
      x,
      0,
      -6.1,
      false,
    );
    m.scale.set(1.2 + r(), 0.35 + r() * 0.2, 0.55);
  }
  // pavement on the far side
  add(box(90, 0.16, 3.4, flat(0xb7b9c6)), 0, -0.04, -12.9, false);
  add(box(90, 0.22, 0.3, flat(0x9c9eaa)), 0, -0.1, -11.25);
}

// ---------------------------------------------------------------- the tram
// red-white, low floor, windows lit warm, a pantograph on the wire. Glides
// through every ~16 s (deterministic).
const tram = new THREE.Group();
{
  const red = flat(0xd42a32, { roughness: 0.35, metalness: 0.1 });
  const white = flat(0xf3f0ea, { roughness: 0.4 });
  const dark = flat(0x2a2d38, { roughness: 0.3 });
  const L = 17;
  tram.add(box(L, 0.9, 2.3, red, 0, 0.25, 0));
  tram.add(box(L, 1.3, 2.3, white, 0, 1.15, 0));
  tram.add(box(L, 0.45, 2.3, red, 0, 2.45, 0));
  tram.add(box(L - 0.6, 0.18, 2.0, flat(0xb7b9c6), 0, 2.9, 0));
  // windows both sides, warm light inside
  const lit = glowMat(0xffe0a8, 0.85);
  for (let i = 0; i < 11; i++) {
    const x = -L / 2 + 0.95 + i * 1.5;
    for (const s of [-1, 1])
      tram.add(box(1.15, 0.95, 0.04, i % 4 === 1 ? dark : lit, x, 1.33, s * 1.16));
  }
  // doors
  for (const x of [-4.6, 0.4, 5.4])
    for (const s of [-1, 1]) tram.add(box(1.2, 2.1, 0.05, flat(0x3a3e4a), x, 0.3, s * 1.17));
  // front windows + lights at both ends
  for (const e of [-1, 1]) {
    const f = box(0.06, 1.0, 1.9, lit, (e * L) / 2, 1.3, 0);
    tram.add(f);
    for (const z of [-0.75, 0.75]) {
      const hl = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), glowMat(0xfff6dc, 2.4));
      hl.position.set((e * L) / 2 + 0.03, 0.62, z);
      hl.userData.noAO = true;
      tram.add(hl);
    }
  }
  // pantograph
  const pan = flat(0x2f3440, { metalness: 0.6, roughness: 0.4 });
  const a1 = box(0.06, 1.6, 0.06, pan, 0, 0, 0);
  a1.position.set(-0.4, 3.75, 0);
  a1.rotation.z = 0.6;
  const a2 = box(0.06, 1.6, 0.06, pan, 0, 0, 0);
  a2.position.set(0.4, 3.75, 0);
  a2.rotation.z = -0.6;
  tram.add(a1, a2, box(0.12, 0.06, 1.4, pan, 0, 4.42, 0));
  tram.position.set(0, 0.05, TRACK_Z);
  shadowAll(tram);
  ground.add(tram);
  onFrame((t) => {
    const u = (((9 * (t - 4.5) + 75) % 150) + 150) % 150;
    tram.position.x = u - 75;
  });
}
// overhead wire with poles at the curb and cross spans
{
  const iron = flat(0x2f3440, { roughness: 0.45, metalness: 0.5 });
  const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 90, 4), iron);
  wire.rotation.z = Math.PI / 2;
  add(wire, 0, 4.48, TRACK_Z, false);
  for (const x of [-26, -13, 13, 26]) {
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 6.2, 7), iron), x, 3.1, -6.9);
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 6.2, 7), iron), x, 3.1, -11.5);
    const span = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 4.6, 4), iron);
    span.rotation.x = Math.PI / 2;
    add(span, x, 5.6, -9.2, false);
  }
}

// ---------------------------------------------------------------- hero: the Würstelstand
// a kiosk across the tracks, wide serving window glowing warm, striped
// awning with bulbs, a lit "WÜRSTEL" sign on the roof, steam from the pipe
const STAND = V(3.6, 0, -14.6);
{
  const g = new THREE.Group();
  const green = flat(0x2f7d5b, { roughness: 0.5 });
  const cream = flat(0xf1e6cf, { roughness: 0.6 });
  g.add(box(5.2, 0.5, 2.4, green, 0, 0, 0));
  g.add(box(5.2, 2.2, 2.4, cream, 0, 0.5, 0));
  g.add(box(5.6, 0.25, 2.8, green, 0, 2.7, 0));
  // serving window: warm light, counter, bottles, sausages hanging
  g.add(box(3.6, 1.15, 0.05, glowMat(0xffd59a, 1.0), -0.2, 1.05, 1.21));
  g.add(box(3.9, 0.12, 0.55, flat(0x9a6a38), -0.2, 0.98, 1.4));
  const bottle = (x, c) => {
    const b = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.08, 0.32, 7),
      flat(c, { roughness: 0.3 }),
    );
    b.position.set(x, 1.26, 1.45);
    b.castShadow = true;
    g.add(b);
  };
  bottle(-1.6, 0xffc21a);
  bottle(-1.4, 0xd8282e);
  bottle(1.2, 0xffc21a);
  const wurst = flat(0xc8693a, { roughness: 0.45 });
  for (let i = 0; i < 7; i++) {
    const s = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.32, 3, 6), wurst);
    s.position.set(-1.3 + i * 0.32, 1.85, 1.3);
    g.add(s);
  }
  g.add(box(0.9, 0.6, 0.06, flat(0x2a2d38), 1.9, 1.3, 1.22)); // menu board
  // striped awning + bulbs
  const stripes = [0xd8282e, 0xf6f1ea];
  for (let i = 0; i < 12; i++) {
    const s = box(
      5.6 / 12,
      0.05,
      1.3,
      flat(stripes[i % 2], { roughness: 0.7 }),
      -2.8 + (i + 0.5) * (5.6 / 12),
      0,
      0.65,
    );
    const piv = new THREE.Group();
    piv.add(s);
    piv.position.set(0, 2.45, 1.2);
    piv.rotation.x = 0.32;
    g.add(piv);
  }
  // roof sign
  const tex = canvasTex(512, 128, (c, w, h) => {
    c.fillStyle = "#1d2a4a";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#ffd23f";
    c.font = '900 92px "Montserrat", sans-serif';
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("WÜRSTEL", w / 2, h / 2 + 4);
  });
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(3.8, 0.95, 0.12),
    new THREE.MeshStandardMaterial({
      map: tex,
      emissive: 0xffffff,
      emissiveMap: tex,
      emissiveIntensity: 0.9,
    }),
  );
  sign.position.set(-0.2, 3.5, 0.6);
  g.add(sign);
  g.add(
    box(0.12, 0.6, 0.12, flat(0x2f3440), -1.6, 2.95, 0.6),
    box(0.12, 0.6, 0.12, flat(0x2f3440), 1.2, 2.95, 0.6),
  );
  // snow on the roof
  const roofSnow = new THREE.Mesh(
    facet(new THREE.BoxGeometry(5.5, 0.22, 2.7, 6, 1, 3), 0.04, 9),
    facetMat(flat(0xf6f9ff)),
  );
  roofSnow.position.set(0, 3.06, 0);
  g.add(roofSnow);
  // the pipe
  const pipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 1.2, 8),
    flat(0x8a8f9c, { metalness: 0.6, roughness: 0.3 }),
  );
  pipe.position.set(2.1, 3.5, -0.6);
  g.add(pipe);
  // two bar stools in front
  for (const x of [-1.4, 0.8]) {
    g.add(box(0.08, 0.75, 0.08, flat(0x2f3440), x, 0, 1.9));
    g.add(box(0.42, 0.08, 0.42, flat(0xd8282e), x, 0.75, 1.9));
  }
  g.position.copy(STAND);
  g.rotation.y = -0.18;
  shadowAll(g);
  ground.add(g);
  g.updateMatrixWorld();
  // bulbs along the awning edge
  const a = V(-2.8, 2.05, 2.45).applyMatrix4(g.matrixWorld);
  const b = V(2.8, 2.05, 2.45).applyMatrix4(g.matrixWorld);
  lightString(a.toArray(), b.toArray(), { n: 14, sag: 0.15, colors: [0xffd27a, 0xffa94d] });
  // steam: from the pipe and out of the window
  const sources = [
    V(2.1, 4.2, -0.6).applyMatrix4(g.matrixWorld),
    V(-0.6, 1.9, 1.6).applyMatrix4(g.matrixWorld),
  ];
  const steamMat = new THREE.MeshStandardMaterial({
    color: 0xf3f2f8,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    flatShading: true,
  });
  const puffs = [];
  sources.forEach((src, si) => {
    for (let i = 0; i < 8; i++) {
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 0), steamMat.clone());
      m.userData.noAO = true;
      ground.add(m);
      puffs.push({ m, ph: i / 8, src, si });
    }
  });
  onFrame((t) => {
    for (const { m, ph, src, si } of puffs) {
      const k = (t * (si ? 0.28 : 0.2) + ph) % 1;
      m.position
        .copy(src)
        .add(
          V(k * 1.2 + Math.sin(k * 6 + ph * 9) * 0.2, k * (si ? 2.2 : 3.6), k * (si ? 0.5 : -0.3)),
        );
      m.scale.setScalar((si ? 0.35 : 0.5) + k * (si ? 0.9 : 1.6));
      m.material.opacity = (si ? 0.35 : 0.5) * Math.sin(Math.PI * Math.min(1, k * 1.3));
    }
  });
}

// ---------------------------------------------------------------- the stop
// waiting shelter with a departure board + the round "H" sign at the curb
{
  const sh = busStop();
  place(sh, -8.6, -4.6, 0.25);
  const roofSnow = new THREE.Mesh(
    facet(new THREE.BoxGeometry(2.9, 0.16, 1.4, 4, 1, 2), 0.04, 12),
    facetMat(flat(0xf6f9ff)),
  );
  roofSnow.position.set(-8.6, 2.48, -4.6);
  roofSnow.rotation.y = 0.25;
  ground.add(roofSnow);
  const iron = flat(0x2f3440, { roughness: 0.45, metalness: 0.5 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 3.2, 7), iron);
  add(pole, -6.4, 1.6, -5.9);
  const htex = canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = "#ffd23f";
    c.beginPath();
    c.arc(w / 2, h / 2, 124, 0, Math.PI * 2);
    c.fill();
    c.lineWidth = 12;
    c.strokeStyle = "#2f7d4a";
    c.stroke();
    c.fillStyle = "#2f7d4a";
    c.font = '900 170px "Montserrat", sans-serif';
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("H", w / 2, h / 2 + 8);
  });
  const hs = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.06, 24), [
    iron,
    new THREE.MeshStandardMaterial({ map: htex, roughness: 0.5 }),
    new THREE.MeshStandardMaterial({ map: htex, roughness: 0.5 }),
  ]);
  hs.rotation.x = Math.PI / 2;
  add(hs, -6.4, 3.25, -5.9);
  // departure board: "2  Ring  4 min"
  const dtex = canvasTex(512, 160, (c, w, h) => {
    c.fillStyle = "#0b0d14";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#ffb43a";
    c.font = '800 64px "Montserrat", sans-serif';
    c.textBaseline = "middle";
    c.fillText("2", 26, h / 2);
    c.fillText("Ring", 110, h / 2);
    c.textAlign = "right";
    c.fillText("4'", w - 26, h / 2);
  });
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.48, 0.08),
    new THREE.MeshStandardMaterial({
      map: dtex,
      emissive: 0xffffff,
      emissiveMap: dtex,
      emissiveIntensity: 0.8,
    }),
  );
  add(board, -6.4, 2.45, -5.84);
}

// ---------------------------------------------------------------- street furniture
for (const x of [-11, 9.5, 21]) place(lamp({ on: true, h: 3.8 }), x, -5.9);
for (const x of [-20, 12, -4.5]) place(lamp({ on: true, h: 3.8 }), x, -12.2);
place(bench(0x8a5a3a), -11.8, -3.6, 0.35);
place(bin(0x2f7d4a), -10.6, -5.5);
place(bike(0x2f9bff), 9.5, -4.4, -0.3);
place(bin(0x2f7d4a), 7.2, -5.5);
// snow on the bench and bike saddle, snowy shrubs in planters
{
  const sb = new THREE.Mesh(
    facet(new THREE.BoxGeometry(1.8, 0.08, 0.5, 4, 1, 2), 0.04, 14),
    facetMat(flat(0xf6f9ff)),
  );
  sb.position.set(-11.8, 0.52, -3.6);
  sb.rotation.y = 0.35;
  ground.add(sb);
  [
    [-13.5, 1.5],
    [12.5, 0.5],
    [-14, 6],
    [13.5, 5.5],
  ].forEach(([x, z], i) => {
    const g = new THREE.Group();
    g.add(box(1.1, 0.55, 1.1, flat(0x8f8a86), 0, 0, 0));
    const b = new THREE.Mesh(
      facet(new THREE.IcosahedronGeometry(0.6, 1), 0.08, 30 + i),
      facetMat(flat(0x3f7a4a)),
    );
    b.position.y = 0.85;
    g.add(b);
    const cap = new THREE.Mesh(
      facet(new THREE.IcosahedronGeometry(0.5, 1), 0.04, 40 + i),
      facetMat(flat(0xf6f9ff)),
    );
    cap.position.y = 1.12;
    cap.scale.set(1.1, 0.5, 1.1);
    g.add(cap);
    shadowAll(g);
    place(g, x, z, r() * 3);
  });
}

// ---------------------------------------------------------------- town houses
// back row behind the stand and side rows: pastel facades, white window
// frames, about two thirds of the windows lit, snow on every roof
{
  const pastel = [0xe9b8a8, 0xf2d0a4, 0xb8c7e0, 0xc9b3d9, 0xa8d5c2, 0xf0e2b6, 0xe7a9b5];
  const roofCols = [0x8a5a4a, 0x6f6470, 0x7a5a52];
  const lit = [];
  const dark = [];
  const frames = [];
  const house = (x, z, w, d, h, rotY) => {
    const g = new THREE.Group();
    const wall = pastel[Math.floor(r() * pastel.length)];
    const body = new THREE.Mesh(
      facet(new THREE.BoxGeometry(w, h, d), 0.03, Math.floor(r() * 99)),
      facetMat(flat(wall)),
    );
    body.position.y = h / 2;
    body.castShadow = body.receiveShadow = true;
    g.add(body);
    const trim = flat(new THREE.Color(wall).multiplyScalar(0.8));
    const band = (y, hh, out) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w + out, hh, d + out), trim);
      b.position.y = y;
      g.add(b);
    };
    band(0.4, 0.8, 0.06);
    band(h - 0.12, 0.24, 0.16);
    band(2.35, 0.14, 0.1);
    if (r() < 0.55) {
      const rs = new THREE.Shape();
      const rh = Math.min(2.6, w * 0.42);
      rs.moveTo(-w / 2 - 0.2, 0);
      rs.lineTo(0, rh);
      rs.lineTo(w / 2 + 0.2, 0);
      rs.lineTo(-w / 2 - 0.2, 0);
      const roof = new THREE.Mesh(
        facet(new THREE.ExtrudeGeometry(rs, { depth: d + 0.3, bevelEnabled: false }), 0.05, 7),
        facetMat(flat(roofCols[Math.floor(r() * roofCols.length)])),
      );
      roof.position.set(0, h, -d / 2 - 0.15);
      g.add(roof);
      // snow layer on the roof
      const ss = new THREE.Shape();
      ss.moveTo(-w / 2 - 0.25, 0.12);
      ss.lineTo(0, rh + 0.16);
      ss.lineTo(w / 2 + 0.25, 0.12);
      ss.lineTo(w / 2 + 0.05, 0.02);
      ss.lineTo(0, rh - 0.05);
      ss.lineTo(-w / 2 - 0.05, 0.02);
      const snow = new THREE.Mesh(
        facet(new THREE.ExtrudeGeometry(ss, { depth: d + 0.34, bevelEnabled: false }), 0.03, 8),
        facetMat(flat(0xf6f9ff)),
      );
      snow.position.set(0, h, -d / 2 - 0.17);
      g.add(snow);
    } else {
      const pr = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.4, d + 0.1), trim);
      pr.position.y = h + 0.2;
      g.add(pr);
      const sn = new THREE.Mesh(new THREE.BoxGeometry(w, 0.18, d), flat(0xf6f9ff));
      sn.position.y = h + 0.45;
      g.add(sn);
      const ch = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.0, 0.5), flat(0x9a8f88));
      ch.position.set((r() - 0.5) * (w - 1), h + 0.5, (r() - 0.5) * (d - 1));
      g.add(ch);
    }
    const cols = Math.max(1, Math.floor((w - 0.6) / 1.1));
    const rows = Math.max(1, Math.floor((h - 2.8) / 1.35));
    for (let cx = 0; cx < cols; cx++)
      for (let ry = 0; ry < rows; ry++) {
        const wx = -((cols - 1) * 1.1) / 2 + cx * 1.1;
        const wy = 3.2 + ry * 1.35;
        frames.push({ g, x: wx, y: wy, z: d / 2 + 0.02 });
        (r() < 0.62 ? lit : dark).push({ g, x: wx, y: wy, z: d / 2 + 0.05 });
      }
    // ground floor: a shop window or the house door
    const shop = r() < 0.5;
    g.add(
      box(
        shop ? w * 0.55 : 0.9,
        1.4,
        0.06,
        shop ? glowMat(0xffe2a8, 0.7) : flat(0x5a3f34),
        shop ? -w * 0.1 : 0,
        0.45,
        d / 2 + 0.03,
      ),
    );
    g.traverse((o) => {
      if (o.isMesh) o.castShadow = o.receiveShadow = true;
    });
    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    ground.add(g);
  };
  for (let x = -36; x < 36; ) {
    const w = 4 + r() * 3;
    house(x + w / 2, -21, w, 5, 7 + r() * 8, 0);
    x += w + 0.3;
  }
  for (const side of [-1, 1])
    for (let z = -16; z < 4; ) {
      const w = 4 + r() * 2.5;
      house(side * 19, z + w / 2, w, 5, 6 + r() * 6, (-side * Math.PI) / 2);
      z += w + 0.4;
    }
  const m4 = new THREE.Matrix4();
  const inst = (list, geo, mat) => {
    const im = new THREE.InstancedMesh(geo, mat, Math.max(1, list.length));
    list.forEach((w, i) => {
      w.g.updateMatrixWorld();
      m4.makeTranslation(w.x, w.y, w.z).premultiply(w.g.matrixWorld);
      im.setMatrixAt(i, m4);
    });
    im.count = list.length;
    ground.add(im);
  };
  inst(frames, new THREE.BoxGeometry(0.74, 0.98, 0.05), flat(0xf6f1ea));
  inst(lit, new THREE.BoxGeometry(0.6, 0.84, 0.06), glowMat(0xffd27a, 0.95));
  inst(
    dark,
    new THREE.BoxGeometry(0.6, 0.84, 0.06),
    flat(0x2b3352, { roughness: 0.12, metalness: 0.35 }),
  );
  inst(
    frames.map((f) => ({ ...f, y: f.y - 0.54, z: f.z + 0.06 })),
    new THREE.BoxGeometry(0.86, 0.07, 0.16),
    flat(0xf6f9ff),
  );
}
// a church spire far behind the roofs + snowy pines at the sides
{
  const g = new THREE.Group();
  const stone = flat(0x8a8aa6);
  g.add(box(4, 16, 4, stone, 0, 0, 0));
  const spire = F(new THREE.ConeGeometry(2.6, 12, 4), flat(0x4f6a8a), 0.06, 3);
  spire.position.y = 22;
  spire.rotation.y = Math.PI / 4;
  g.add(spire);
  const clock = new THREE.Mesh(new THREE.CircleGeometry(0.9, 16), glowMat(0xfff1c2, 0.6));
  clock.position.set(0, 13, 2.02);
  g.add(clock);
  g.position.set(-14, 0, -34);
  ground.add(g);
}
[
  [-15.5, -8, 1.3],
  [15.5, -9, 1.2],
  [-16, 8, 1.1],
  [16.5, 9, 1.2],
].forEach(([x, z, s], i) => pine(x, z, s, SEED + i, true));

// ---------------------------------------------------------------- life: falling snow
{
  const N = 420;
  const flakes = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.03, 0),
    flat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.25 }),
    N,
  );
  flakes.frustumCulled = false;
  flakes.userData.noAO = true;
  ground.add(flakes);
  const seeds = Array.from({ length: N }, () => [r(), r(), r(), r()]);
  const m4 = new THREE.Matrix4();
  onFrame((t) => {
    seeds.forEach(([a, b, c, d], i) => {
      const y = 10 - ((t * (0.45 + d * 0.4) + a * 10) % 10);
      m4.makeTranslation((b - 0.5) * 24 + Math.sin(t * 0.6 + i) * 0.35, y, (c - 0.62) * 22);
      flakes.setMatrixAt(i, m4);
    });
    flakes.instanceMatrix.needsUpdate = true;
  });
}

finishSet({ ground: SNOW });
export { sky, STAND, TRACK_Z };
