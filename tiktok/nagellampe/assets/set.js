// Set of #36 "UV-Nagellampe": a small nail studio in a Viennese side street
// at dusk, 18:30. The nail table stands at the origin (table top = 0) with
// the UV lamp on it; the studio is dimmed so the lamp's violet glow carries
// the picture. Behind the table the hero piece: a wall-high shelf with
// hundreds of polish bottles in every colour. Right of it the shop window
// with a pink "NAILS" neon sign, outside the blue-pink dusk, old houses with
// lit windows and a red tram that passes now and then. Props: a monstera,
// a pink velvet armchair, a pendant globe lamp, a cup of tea with steam,
// a mirror, files in a cup. The molecule world (MICRO) and the tooth (ZAHN)
// are dark places under the floor, built in scene.js.
import { THREE, flat, ground, onFrame, rng, patches, facet, facetMat } from "./world.js";
import { SKIES, setSky, finishSet, F } from "./environments.js";

const SEED = 36;
const r = rng(SEED);
export const FLOOR = -3.6; // studio floor (table top = 0)
export const CEIL = 7.4;
const WZ = -5.6; // back wall

// ---------------------------------------------------------------- light
// dusk: deep blue above, a pink-orange band over the roofs; the key light
// low and warm through the window, the room itself dim
const sky = setSky({
  ...SKIES.abend,
  top: [0.12, 0.13, 0.36],
  mid: [0.4, 0.28, 0.58],
  hor: [1.0, 0.56, 0.5],
  below: [0.3, 0.22, 0.38],
  stars: 0.2,
  clouds: 8,
  birds: false,
  hemi: [0xb8a8ff, 0x3a2a3a, 0.85],
  key: [0xffc6a8, 1.25],
  keyPos: [7, 10, 9],
  rim: [0xb07dff, 1.0],
  fog: [32, 110],
  nightWindows: true,
});

// ---------------------------------------------------------------- helpers
const box = (w, h, d, mat, x, y, z, amt = 0.04, seed = 1, shadow = true) => {
  const m = F(new THREE.BoxGeometry(w, h, d), mat, amt, seed);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  ground.add(m);
  return m;
};
const cyl = (rt, rb, h, seg, mat, x, y, z, amt = 0.05, seed = 1, shadow = true) => {
  const m = F(new THREE.CylinderGeometry(rt, rb, h, seg), mat, amt, seed);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  ground.add(m);
  return m;
};
const glow = (color, intensity) =>
  flat(0xffffff, { emissive: color, emissiveIntensity: intensity });

// ---------------------------------------------------------------- nail table
{
  // white marble top with soft grey veins (patches), rounded front edge
  const top = new THREE.Mesh(
    patches(facet(new THREE.BoxGeometry(11, 0.3, 6.4, 22, 1, 13), 0.03, 3), {
      amt: 0.06,
      scale: 0.5,
      seed: 7,
      warm: 0.1,
    }),
    facetMat(flat(0xf3eef0, { roughness: 0.25 })),
  );
  top.position.set(0, -0.15, -0.6);
  top.castShadow = top.receiveShadow = true;
  ground.add(top);
  const edge = F(new THREE.CylinderGeometry(0.15, 0.15, 11, 8), flat(0xd9a7b8), 0.03, 4);
  edge.rotation.z = Math.PI / 2;
  edge.position.set(0, -0.15, 2.6);
  ground.add(edge);
  // pink lacquered body with gold kick plate, two drawers each side
  const pink = flat(0xf2a7c3, { roughness: 0.35 });
  box(10.4, -FLOOR - 0.6, 5.6, pink, 0, (FLOOR - 0.3) / 2, -0.9, 0.03, 5);
  const gold = flat(0xd9a441, { metalness: 0.75, roughness: 0.28 });
  box(10.5, 0.25, 5.7, gold, 0, FLOOR + 0.12, -0.9, 0, 1);
  for (const x of [-3.4, 3.4])
    for (const y of [-0.9, -2.0]) {
      box(2.6, 0.9, 0.12, flat(0xf7c3d6, { roughness: 0.3 }), x, y, 1.92, 0.02, 6);
      box(0.9, 0.1, 0.12, gold, x, y + 0.2, 2.02, 0, 1);
    }
}

// ---------------------------------------------------------------- floor, walls, ceiling
{
  // light terrazzo floor: a slab with coloured chips
  box(60, 0.2, 40, flat(0xe9e1da, { roughness: 0.55 }), 6, FLOOR - 0.1, 8, 0.03, 10, false);
  {
    const N = 900;
    const chips = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.02, 5),
      flat(0xffffff, { roughness: 0.5 }),
      N,
    );
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    const cols = [0xd98aa8, 0x9a8cc8, 0xc9b49a, 0x7a7a86, 0xf2c4a0];
    for (let i = 0; i < N; i++) {
      const s = 0.6 + r() * 1.4;
      m.makeScale(s, 1, s * (0.6 + r() * 0.6));
      m.setPosition(-14 + r() * 36, FLOOR + 0.005, -5 + r() * 24);
      chips.setMatrixAt(i, m);
      chips.setColorAt(i, c.setHex(cols[i % cols.length]));
    }
    chips.receiveShadow = true;
    ground.add(chips);
  }
  // round fluffy rug under the chair
  const rug = new THREE.Mesh(
    facet(new THREE.CylinderGeometry(2.6, 2.6, 0.06, 20), 0.05, 12),
    facetMat(flat(0xf6dfe8, { roughness: 1 })),
  );
  rug.position.set(-7.4, FLOOR + 0.03, 2.6);
  rug.receiveShadow = true;
  ground.add(rug);

  const wall = flat(0xe8c9d6, { roughness: 0.9 }); // dusty rose
  // back wall with the shop window opening x[3.4, 11.6], y[-1.6, 5.6]
  const wx0 = 3.4;
  const wx1 = 11.6;
  const wy0 = -1.6;
  const wy1 = 5.6;
  const H = CEIL - FLOOR;
  box(wx0 + 16, H, 0.4, wall, (-16 + wx0) / 2, (FLOOR + CEIL) / 2, WZ, 0.02, 21, false);
  box(30 - wx1, H, 0.4, wall, (wx1 + 30) / 2, (FLOOR + CEIL) / 2, WZ, 0.02, 22, false);
  box(wx1 - wx0, wy0 - FLOOR, 0.4, wall, (wx0 + wx1) / 2, (FLOOR + wy0) / 2, WZ, 0.02, 23, false);
  box(wx1 - wx0, CEIL - wy1, 0.4, wall, (wx0 + wx1) / 2, (wy1 + CEIL) / 2, WZ, 0.02, 24, false);
  // window frame (black steel), mullion, sill with a candle
  const steel = flat(0x24222a, { roughness: 0.4, metalness: 0.4 });
  const fr = (w, h, x, y) => box(w, h, 0.45, steel, x, y, WZ + 0.05, 0.02, 1, false);
  fr(wx1 - wx0 + 0.5, 0.3, (wx0 + wx1) / 2, wy1 + 0.1);
  fr(wx1 - wx0 + 0.5, 0.3, (wx0 + wx1) / 2, wy0 - 0.1);
  fr(0.3, wy1 - wy0 + 0.5, wx0 - 0.1, (wy0 + wy1) / 2);
  fr(0.3, wy1 - wy0 + 0.5, wx1 + 0.1, (wy0 + wy1) / 2);
  fr(0.16, wy1 - wy0, (wx0 + wx1) / 2, (wy0 + wy1) / 2);
  box(wx1 - wx0 + 0.8, 0.2, 1.0, flat(0xf3eef0), (wx0 + wx1) / 2, wy0 - 0.2, WZ + 0.5, 0.02, 2);
  const pane = new THREE.Mesh(
    new THREE.PlaneGeometry(wx1 - wx0, wy1 - wy0),
    new THREE.MeshStandardMaterial({
      color: 0xc8b8ff,
      roughness: 0.05,
      metalness: 0.2,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
    }),
  );
  pane.position.set((wx0 + wx1) / 2, (wy0 + wy1) / 2, WZ);
  pane.userData.noAO = true;
  ground.add(pane);
  // left wall
  box(0.4, H, 30, wall, -13, (FLOOR + CEIL) / 2, 9.4, 0.02, 25, false);
  // ceiling + cornice
  box(60, 0.4, 34, flat(0xf6eef0), 6, CEIL + 0.2, 10, 0, 1, false);
  box(44, 0.3, 0.3, flat(0xf6eef0), 8, CEIL - 0.15, WZ + 0.3, 0, 1, false);
  // a gold rail with a striped wallpaper band at dado height
  box(
    16.6,
    0.12,
    0.12,
    flat(0xd9a441, { metalness: 0.7, roughness: 0.3 }),
    -4.7,
    -1.2,
    WZ + 0.26,
    0,
    1,
  );
}

// ---------------------------------------------------------------- hero: the polish wall
// a wall-high white shelf with hundreds of bottles, sorted into a rainbow
{
  const x0 = -12.2;
  const x1 = 2.6;
  const shelfMat = flat(0xfaf6f4, { roughness: 0.5 });
  box(
    x1 - x0 + 0.4,
    CEIL - FLOOR - 0.6,
    0.6,
    flat(0xf2e6ea),
    (x0 + x1) / 2,
    (FLOOR + CEIL) / 2 - 0.3,
    WZ + 0.45,
    0.02,
    30,
    false,
  );
  const rows = [];
  for (let y = -1.0; y < CEIL - 0.6; y += 0.95) rows.push(y);
  for (const y of rows)
    box(x1 - x0 + 0.4, 0.1, 0.9, shelfMat, (x0 + x1) / 2, y, WZ + 0.8, 0.02, 31, false);
  // side cheeks
  for (const x of [x0 - 0.2, x1 + 0.2])
    box(
      0.16,
      CEIL - FLOOR - 0.6,
      1.0,
      shelfMat,
      x,
      (FLOOR + CEIL) / 2 - 0.3,
      WZ + 0.8,
      0.02,
      32,
      false,
    );
  // bottles: glass body (colour), black cap — instanced
  const list = [];
  rows.slice(0, -1).forEach((y, ri) => {
    for (let x = x0 + 0.25; x < x1 - 0.1; x += 0.36 + r() * 0.04) list.push([x, y + 0.05, ri]);
  });
  const N = list.length;
  const body = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.13, 0.15, 0.36, 7).translate(0, 0.18, 0),
    flat(0xffffff, { roughness: 0.15, metalness: 0.05 }),
    N,
  );
  const cap = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.06, 0.07, 0.3, 6).translate(0, 0.51, 0),
    flat(0x1c1a20, { roughness: 0.3 }),
    N,
  );
  const m = new THREE.Matrix4();
  const c = new THREE.Color();
  list.forEach(([x, y, ri], i) => {
    const s = 0.9 + r() * 0.25;
    m.makeScale(s, s, s);
    m.setPosition(x, y, WZ + 0.85 + (r() - 0.5) * 0.1);
    body.setMatrixAt(i, m);
    cap.setMatrixAt(i, m);
    // hue runs along the shelf like a rainbow, each row a little shifted
    const u = (x - x0) / (x1 - x0);
    c.setHSL((u * 0.9 + ri * 0.035) % 1, 0.62 + r() * 0.25, 0.48 + r() * 0.16);
    if (r() < 0.07) c.setHSL(0, 0, 0.92); // a few whites
    if (r() < 0.05) c.setHex(0x1c1a20); // a few blacks
    body.setColorAt(i, c);
  });
  body.castShadow = true;
  ground.add(body, cap);
  // "NAIL BAR" lettering on the wall above the shelf, gold
  {
    const cv = document.createElement("canvas");
    cv.width = 1024;
    cv.height = 160;
    const g = cv.getContext("2d");
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    const draw = () => {
      g.clearRect(0, 0, 1024, 160);
      g.fillStyle = "#c9933a";
      g.font = 'italic 800 120px "Montserrat", sans-serif';
      g.textAlign = "center";
      g.fillText("Nail Bar", 512, 122);
      tex.needsUpdate = true;
    };
    draw();
    document.fonts?.load('italic 800 120px "Montserrat"').then(draw);
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(6.4, 1.0),
      new THREE.MeshStandardMaterial({
        map: tex,
        transparent: true,
        roughness: 0.4,
        metalness: 0.5,
      }),
    );
    sign.position.set(-4.8, CEIL - 0.55, WZ + 0.78);
    ground.add(sign);
  }
}

// ---------------------------------------------------------------- neon "NAILS" in the window
{
  const cv = document.createElement("canvas");
  cv.width = 512;
  cv.height = 192;
  const g = cv.getContext("2d");
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const draw = () => {
    g.clearRect(0, 0, 512, 192);
    g.shadowColor = "#ff4fb8";
    g.shadowBlur = 26;
    g.strokeStyle = "#ffd6f0";
    g.lineWidth = 9;
    g.font = '800 120px "Montserrat", sans-serif';
    g.textAlign = "center";
    g.strokeText("NAILS", 256, 140);
    g.strokeText("NAILS", 256, 140);
    tex.needsUpdate = true;
  };
  draw();
  document.fonts?.load('800 120px "Montserrat"').then(draw);
  const signMat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    color: 0xffffff,
    fog: false,
  });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 1.65), signMat);
  sign.position.set(7.5, 3.6, WZ + 0.5);
  sign.userData.noAO = true;
  ground.add(sign);
  const glowL = new THREE.PointLight(0xff4fb8, 14, 12, 1.5);
  glowL.userData.keep = true;
  glowL.position.set(7.5, 3.4, WZ + 1.6);
  ground.add(glowL);
  onFrame((t) => {
    const f = t % 9.1;
    const on = !(f > 6.0 && f < 6.1) && !(f > 6.22 && f < 6.3);
    signMat.color.setScalar(on ? 1 : 0.3);
    glowL.intensity = on ? 14 : 3;
  });
}

// ---------------------------------------------------------------- props in the studio
{
  // pendant globe lamp over the table, warm
  {
    const cord = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 2.4, 4),
      flat(0xd9a441, { metalness: 0.7, roughness: 0.3 }),
    );
    cord.position.set(-2.6, CEIL - 1.2, -2.2);
    ground.add(cord);
    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(0.62, 16, 12),
      flat(0xfff3e0, { emissive: 0xffcf9a, emissiveIntensity: 1.6 }),
    );
    globe.position.set(-2.6, CEIL - 2.9, -2.2);
    globe.userData.noAO = true;
    ground.add(globe);
    const pl = new THREE.PointLight(0xffc98a, 16, 16, 1.4);
    pl.position.set(-2.6, CEIL - 3.4, -2.2);
    ground.add(pl);
  }
  // monstera in a terracotta pot, left front, swaying gently
  const leaves = new THREE.Group();
  {
    cyl(0.9, 0.7, 1.6, 10, flat(0xc4714a), -10.4, FLOOR + 0.8, -2.6, 0.05, 40);
    const leafMat = flat(0x2f7a4a, { roughness: 0.6, side: THREE.DoubleSide });
    const leafMat2 = flat(0x3f9a5a, { roughness: 0.6, side: THREE.DoubleSide });
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * Math.PI * 2 + r() * 0.4;
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.05, 2.2 + r() * 1.2, 4),
        flat(0x3f8a4a),
      );
      stem.geometry.translate(0, (stem.geometry.parameters.height ?? 2.6) / 2, 0);
      const g = new THREE.Group();
      g.rotation.set(Math.sin(a) * 0.55, 0, Math.cos(a) * 0.55);
      g.add(stem);
      const leaf = F(new THREE.CircleGeometry(0.8, 7), k % 2 ? leafMat : leafMat2, 0.12, 41 + k);
      leaf.position.y = 2.4 + r() * 0.8;
      leaf.rotation.set(-1.0 + r() * 0.4, a, 0);
      leaf.scale.set(1, 1.3, 1);
      g.add(leaf);
      leaves.add(g);
    }
    leaves.position.set(-10.4, FLOOR + 1.5, -2.6);
    ground.add(leaves);
  }
  // pink velvet armchair on the rug
  {
    const velvet = flat(0xe07aa0, { roughness: 0.95 });
    const ch = new THREE.Group();
    const seat = F(new THREE.BoxGeometry(2.4, 0.7, 2.2), velvet, 0.05, 50);
    seat.position.y = 1.3;
    const back = F(
      new THREE.CylinderGeometry(1.3, 1.3, 1.9, 12, 1, false, Math.PI * 0.75, Math.PI * 1.5),
      velvet,
      0.05,
      51,
    );
    back.position.set(0, 2.0, -0.2);
    back.material.side = THREE.DoubleSide;
    ch.add(seat, back);
    for (const [x, z] of [
      [-0.9, -0.8],
      [0.9, -0.8],
      [-0.9, 0.8],
      [0.9, 0.8],
    ]) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.04, 1.0, 5),
        flat(0xd9a441, { metalness: 0.7, roughness: 0.3 }),
      );
      leg.position.set(x, 0.5, z);
      ch.add(leg);
    }
    ch.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
    ch.position.set(-7.4, FLOOR, 2.6);
    ch.rotation.y = 0.7;
    ground.add(ch);
  }
  // round mirror on the left wall area of the shelf side
  {
    const mir = new THREE.Mesh(
      new THREE.CircleGeometry(1.0, 24),
      flat(0xdfe6f2, { roughness: 0.02, metalness: 0.9 }),
    );
    mir.position.set(-12.75, 2.6, 0.5);
    mir.rotation.y = Math.PI / 2;
    ground.add(mir);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.05, 0.08, 6, 24),
      flat(0xd9a441, { metalness: 0.7, roughness: 0.3 }),
    );
    ring.position.copy(mir.position);
    ring.rotation.y = Math.PI / 2;
    ground.add(ring);
  }
  // on the table, back left: tissue box, file cup, tea cup with steam
  box(1.1, 0.55, 0.7, flat(0xffffff, { roughness: 0.6 }), -4.2, 0.28, -2.6, 0.03, 60);
  box(1.12, 0.05, 0.72, flat(0xf2a7c3), -4.2, 0.4, -2.6, 0, 1);
  {
    const tissue = F(
      new THREE.ConeGeometry(0.22, 0.4, 5),
      flat(0xffffff, { roughness: 1 }),
      0.1,
      61,
    );
    tissue.position.set(-4.2, 0.72, -2.6);
    ground.add(tissue);
  }
  cyl(0.28, 0.24, 0.7, 10, flat(0x9a8cc8, { roughness: 0.3 }), -4.4, 0.35, -1.3, 0.04, 62);
  for (let k = 0; k < 4; k++) {
    const f = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 1.0, 0.02),
      flat(k % 2 ? 0xf2a7c3 : 0x7a7a86),
    );
    f.position.set(-4.45 + k * 0.08, 0.95, -1.3);
    f.rotation.z = (k - 1.5) * 0.12;
    ground.add(f);
  }
  const cup = cyl(
    0.32,
    0.26,
    0.5,
    12,
    flat(0xffffff, { roughness: 0.25 }),
    4.3,
    0.25,
    -2.4,
    0.03,
    63,
  );
  cup.castShadow = true;
  cyl(0.29, 0.29, 0.02, 12, flat(0x9a5a2a), 4.3, 0.48, -2.4, 0, 1, false);
  const steam = [];
  for (let k = 0; k < 6; k++) {
    const s = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 6, 4),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
      }),
    );
    s.userData.noAO = true;
    ground.add(s);
    steam.push(s);
  }
  // rows of polish bottles in a little acrylic stand, back right
  const standCols = [0xff2d8a, 0xc8102e, 0xffb3c7, 0x7b3fe4, 0x1c1a20];
  standCols.forEach((col, k) => {
    cyl(
      0.2,
      0.22,
      0.5,
      8,
      flat(col, { roughness: 0.12 }),
      1.7 + k * 0.55,
      0.25,
      -2.7,
      0.03,
      70 + k,
    );
    cyl(
      0.08,
      0.09,
      0.42,
      6,
      flat(0x1c1a20, { roughness: 0.3 }),
      1.7 + k * 0.55,
      0.71,
      -2.7,
      0.02,
      80 + k,
    );
  });
  // a succulent in a white pot
  cyl(0.35, 0.28, 0.5, 9, flat(0xffffff, { roughness: 0.4 }), -3.0, 0.25, -2.9, 0.04, 90);
  for (let k = 0; k < 7; k++) {
    const l = F(new THREE.ConeGeometry(0.1, 0.45, 5), flat(0x6aa87a), 0.1, 91 + k);
    const a = (k / 7) * Math.PI * 2;
    l.position.set(-3.0 + Math.cos(a) * 0.12, 0.65, -2.9 + Math.sin(a) * 0.12);
    l.rotation.set(Math.sin(a) * 0.6, 0, -Math.cos(a) * 0.6);
    ground.add(l);
  }
  onFrame((t) => {
    leaves.rotation.z = Math.sin(t * 0.7) * 0.025;
    leaves.rotation.x = Math.sin(t * 0.53 + 1) * 0.02;
    steam.forEach((s, k) => {
      const f = (t * 0.35 + k / 6) % 1;
      s.position.set(
        4.3 + Math.sin(t * 1.3 + k) * 0.08 * f,
        0.55 + f * 1.4,
        -2.4 + Math.cos(t + k) * 0.06,
      );
      s.scale.setScalar(0.6 + f * 1.4);
      s.material.opacity = 0.32 * Math.sin(f * Math.PI);
    });
  });
}

// ---------------------------------------------------------------- outside: old-town lane at dusk
{
  const Y = FLOOR; // street level = studio floor (ground floor shop)
  box(
    80,
    0.3,
    12,
    flat(0x4a4458, { roughness: 0.3, metalness: 0.2 }),
    6,
    Y - 0.15,
    -13,
    0.04,
    200,
    false,
  );
  box(80, 0.35, 2.2, flat(0x8a8098), 6, Y, -7.4, 0.03, 201, false);
  // tram rails
  for (const z of [-12.2, -13.6])
    box(
      80,
      0.06,
      0.12,
      flat(0xb8b8c8, { metalness: 0.8, roughness: 0.3 }),
      6,
      Y + 0.02,
      z,
      0,
      1,
      false,
    );
  const pastel = [0xe8c8a0, 0xd8a8b0, 0xa8b8d8, 0xe0d0a0, 0xc8b0d8, 0xb8d0b8];
  const winLit = glow(0xffb54a, 1.0);
  const winDark = flat(0x2a2840, { roughness: 0.2, metalness: 0.3 });
  let x = -24;
  let hi = 0;
  while (x < 34) {
    const w = 5.5 + r() * 2.5;
    const h = 14 + r() * 6;
    const col = new THREE.Color(pastel[hi % pastel.length]).multiplyScalar(0.62);
    box(w, h, 6, flat(col), x + w / 2, Y + h / 2, -22, 0.03, 210 + hi, false);
    box(
      w + 0.4,
      0.45,
      6.4,
      flat(col.clone().multiplyScalar(0.75)),
      x + w / 2,
      Y + h,
      -22,
      0,
      1,
      false,
    );
    // a pitched roof
    const roof = F(
      new THREE.CylinderGeometry(0.01, 3.4, 2.2, 4, 1),
      flat(0x7a4a4a),
      0.05,
      220 + hi,
    );
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(w / 4.8, 1, 1.2);
    roof.position.set(x + w / 2, Y + h + 1.3, -22);
    ground.add(roof);
    const cols = Math.floor((w - 1) / 1.6);
    for (let cx = 0; cx < cols; cx++)
      for (let ry = 0; ry < Math.floor((h - 4) / 2.6); ry++) {
        const wxp = x + 0.9 + cx * 1.6 + (w - 0.8 - cols * 1.6) / 2 + 0.4;
        const wyp = Y + 4.2 + ry * 2.6;
        const m = new THREE.Mesh(
          new THREE.BoxGeometry(0.85, 1.4, 0.1),
          r() < 0.42 ? winLit : winDark,
        );
        m.position.set(wxp, wyp, -18.95);
        ground.add(m);
      }
    // shop fronts at street level with awnings
    box(
      w - 1,
      2.4,
      0.1,
      r() < 0.5 ? glow(0xffd09a, 0.6) : winDark,
      x + w / 2,
      Y + 1.6,
      -18.95,
      0,
      1,
      false,
    );
    x += w + 0.25;
    hi++;
  }
  // street lamps, on
  for (const lx of [-6, 8, 22]) {
    cyl(0.1, 0.13, 6.2, 6, flat(0x2a2833), lx, Y + 3.1, -8.4, 0, 1, false);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 8, 6), glow(0xffd08a, 2));
    head.position.set(lx, Y + 6.3, -8.4);
    ground.add(head);
  }
  // the red Vienna tram: passes left → right every 14 s
  {
    const tram = new THREE.Group();
    const red = flat(0xd8282e, { roughness: 0.35 });
    const cream = flat(0xf2e6d0, { roughness: 0.4 });
    const b1 = F(new THREE.BoxGeometry(14, 2.4, 2.4), red, 0.03, 300);
    b1.position.y = 1.6;
    const b2 = F(new THREE.BoxGeometry(14.05, 0.9, 2.42), cream, 0.03, 301);
    b2.position.y = 2.6;
    const roof = F(new THREE.BoxGeometry(13.6, 0.35, 2.2), flat(0x9a9aa8), 0.03, 302);
    roof.position.y = 3.25;
    tram.add(b1, b2, roof);
    for (let k = 0; k < 7; k++) {
      const wdw = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 0.05), glow(0xffe0a8, 0.9));
      wdw.position.set(-5.6 + k * 1.85, 2.55, 1.22);
      tram.add(wdw);
    }
    const pole = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.6, 0.06), flat(0x2a2833));
    pole.position.set(0, 4.1, 0);
    pole.rotation.z = 0.5;
    tram.add(pole);
    tram.position.set(0, Y, -12.9);
    ground.add(tram);
    onFrame((t) => {
      const f = ((t + 5) % 14) / 14;
      tram.position.x = -40 + f * 95;
    });
  }
}

finishSet({ ground: 0xb8a4b0 });
export { sky };
