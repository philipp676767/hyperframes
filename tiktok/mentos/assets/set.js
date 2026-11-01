// Set of #45 "Mentos + Cola": the forecourt of an old city cinema at night,
// ~21:30, after rain. The velvet bench with the person, the side table with
// the cola bottles stand at the origin (built in scene.js). Behind it the
// hero piece: the cinema facade with a big marquee canopy full of chasing
// bulbs, a red vertical "KINO" blade sign, glowing glass doors and poster
// light boxes. Left a ticket kiosk, right a popcorn cart that keeps popping,
// street lamps, wet paving with puddles, a street with a parked car in front,
// the city skyline with lit windows behind. Life: bulb chase, neon flicker,
// popcorn popping, moths in the lamp light, a passing tram.
import { THREE, flat, ground, onFrame, rng, patches, facet, facetMat } from "./world.js";
import { setSky, finishSet, F, fireflies, car } from "./environments.js";
import { lamp, bin, place } from "./props.js";

const r = rng(45);
const FZ = -11; // cinema facade front

// ---------------------------------------------------------------- light
setSky({
  top: [0.02, 0.03, 0.1],
  mid: [0.06, 0.06, 0.2],
  hor: [0.3, 0.14, 0.32],
  below: [0.06, 0.05, 0.12],
  sun: [0.5, 0.35, 0.9],
  sunDir: [0.2, 0.25, -1],
  cloud: [0x2a2a4a, 0x14142a],
  clouds: 7,
  birds: false,
  stars: 0.45,
  hemi: [0x9a8cff, 0x241a20, 0.85],
  key: [0xffe2b8, 1.5],
  keyPos: [4, 12, 8],
  rim: [0x39e6ff, 0.8],
  fog: [30, 85],
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
const glowMat = (color, i = 2) => flat(0xffffff, { emissive: color, emissiveIntensity: i });
const canvasTex = (w, h, draw) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
};
const at = (m, x, y, z) => {
  m.position.set(x, y, z);
  return m;
};
const FONT = (s) => `900 ${s}px Montserrat, Arial, sans-serif`;

// ---------------------------------------------------------------- ground: wet paving + street
{
  // dark wet stone plaza, big colour patches
  const g = patches(facet(new THREE.BoxGeometry(80, 0.2, 30, 80, 1, 30), 0.06, 3), {
    amt: 0.1,
    scale: 0.18,
    seed: 5,
    warm: 0.3,
  });
  const plaza = new THREE.Mesh(g, facetMat(flat(0x3b3a46, { roughness: 0.42 })));
  plaza.position.set(0, -0.1, -4);
  plaza.receiveShadow = true;
  ground.add(plaza);
  // paving grid
  const seam = flat(0x22212a);
  for (let i = -40; i <= 40; i += 1.6) box(0.04, 0.01, 30, seam, i, 0.005, -4, 0, 1, false);
  for (let k = -18; k <= 10; k += 1.6) box(80, 0.01, 0.04, seam, 0, 0.006, k, 0, 1, false);
  // a warm red carpet from the doors to the stage
  const carpet = new THREE.Mesh(
    facet(new THREE.BoxGeometry(3.2, 0.04, 9, 6, 1, 18), 0.05, 6),
    facetMat(flat(0xa51d2d, { roughness: 0.9 })),
  );
  carpet.position.set(0, 0.03, FZ + 4.6);
  carpet.receiveShadow = true;
  ground.add(carpet);
  for (const sx of [-1, 1]) {
    // brass posts + velvet rope along the carpet
    for (let i = 0; i < 4; i++) {
      const z = FZ + 1.6 + i * 2.1;
      cyl(0.06, 0.08, 1.0, 8, flat(0xd9a93a, { metalness: 0.7, roughness: 0.3 }), sx * 2.1, 0.5, z);
      cyl(
        0.18,
        0.2,
        0.06,
        10,
        flat(0xd9a93a, { metalness: 0.7, roughness: 0.3 }),
        sx * 2.1,
        0.03,
        z,
      );
      if (i < 3) {
        const rope = new THREE.Mesh(
          new THREE.TubeGeometry(
            new THREE.QuadraticBezierCurve3(
              new THREE.Vector3(sx * 2.1, 0.92, z),
              new THREE.Vector3(sx * 2.1, 0.62, z + 1.05),
              new THREE.Vector3(sx * 2.1, 0.92, z + 2.1),
            ),
            12,
            0.04,
            6,
          ),
          flat(0xc0162c, { roughness: 0.8 }),
        );
        rope.castShadow = true;
        ground.add(rope);
      }
    }
  }
  // puddles: glossy dark mirrors that catch the neon
  const puddleMat = new THREE.MeshStandardMaterial({
    color: 0x1a1830,
    roughness: 0.04,
    metalness: 0.6,
  });
  for (const [x, z, sx, sz] of [
    [-4.6, 2.6, 1.4, 0.8],
    [5.2, 1.4, 1.1, 0.6],
    [-8.5, -1.5, 1.8, 0.9],
    [9.5, 3.8, 1.3, 0.7],
    [3.2, -6.8, 1.0, 0.5],
    [-12, 5, 1.6, 0.8],
  ]) {
    const p = new THREE.Mesh(new THREE.CircleGeometry(1, 18), puddleMat);
    p.rotation.x = -Math.PI / 2;
    p.scale.set(sx, sz, 1);
    p.position.set(x, 0.012, z);
    p.receiveShadow = true;
    ground.add(p);
  }
  // curb + street in front
  box(80, 0.18, 0.5, flat(0x8a8892), 0, 0.09, 9.2, 0.03, 7);
  const road = new THREE.Mesh(
    patches(facet(new THREE.BoxGeometry(80, 0.1, 14, 60, 1, 10), 0.04, 9), {
      amt: 0.07,
      scale: 0.2,
      seed: 9,
    }),
    facetMat(flat(0x24232b, { roughness: 0.5 })),
  );
  road.position.set(0, -0.06, 16.4);
  road.receiveShadow = true;
  ground.add(road);
  for (let x = -38; x < 40; x += 4) box(2, 0.01, 0.16, flat(0xe8e2c8), x, 0.0, 16.4, 0, 1, false);
  // tram rails
  for (const z of [12.4, 13.6])
    box(80, 0.03, 0.08, flat(0x9aa0aa, { metalness: 0.8, roughness: 0.3 }), 0, 0.0, z, 0, 1, false);
}

// ---------------------------------------------------------------- hero piece: the cinema
export const bulbs = []; // marquee bulbs, chased in onFrame
export const neonMats = [];
{
  const wallMat = flat(0xd9b48a, { roughness: 0.85 });
  const trim = flat(0x7a2430, { roughness: 0.6 });
  // facade: art-deco block with stepped top
  box(24, 10, 1.2, wallMat, 0, 5, FZ - 0.6, 0.04, 11);
  box(14, 2.2, 1.2, wallMat, 0, 11.1, FZ - 0.6, 0.04, 12);
  box(6, 1.6, 1.2, wallMat, 0, 12.9, FZ - 0.6, 0.04, 13);
  for (const sx of [-1, 1]) {
    // pilasters
    for (const x of [3.6, 8, 11.6]) box(0.7, 10, 0.4, trim, sx * x, 5, FZ + 0.15, 0.03, 14);
  }
  box(24.6, 0.4, 1.6, trim, 0, 10.1, FZ - 0.4, 0.03, 15);
  // glass doors: warm glowing foyer behind
  const foyer = canvasTex(512, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, "#ffcf7a");
    gr.addColorStop(1, "#c8642c");
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    // silhouettes of a counter and people inside
    g.fillStyle = "rgba(90,30,20,0.55)";
    g.fillRect(40, 170, 220, 86);
    for (const [x, s] of [
      [320, 1],
      [380, 0.9],
      [450, 1.05],
    ]) {
      g.beginPath();
      g.arc(x, 140 - 30 * s, 18 * s, 0, 7);
      g.fill();
      g.fillRect(x - 22 * s, 140 - 12 * s, 44 * s, 120);
    }
  });
  const door = new THREE.Mesh(
    new THREE.PlaneGeometry(6.4, 3.4),
    new THREE.MeshBasicMaterial({ map: foyer, toneMapped: false }),
  );
  door.position.set(0, 1.7, FZ + 0.02);
  door.userData.noAO = true;
  ground.add(door);
  for (const x of [-3.2, -1.6, 0, 1.6, 3.2])
    box(
      0.1,
      3.4,
      0.12,
      flat(0xd9a93a, { metalness: 0.7, roughness: 0.3 }),
      x,
      1.7,
      FZ + 0.06,
      0,
      1,
      false,
    );
  box(
    6.6,
    0.14,
    0.14,
    flat(0xd9a93a, { metalness: 0.7, roughness: 0.3 }),
    0,
    3.42,
    FZ + 0.06,
    0,
    1,
    false,
  );
  const foyerLight = new THREE.PointLight(0xffa860, 16, 14, 1.5);
  foyerLight.position.set(0, 2.2, FZ + 1.8);
  ground.add(foyerLight);

  // marquee canopy: a deep wedge over the doors with a letter board
  const MZ = FZ + 1.6;
  box(11, 0.5, 3.4, flat(0x2a1a2a), 0, 4.4, MZ, 0.03, 16);
  const board = canvasTex(1024, 256, (g, w, h) => {
    g.fillStyle = "#fbf3dc";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#1a1420";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = FONT(78);
    g.fillText("HEUTE: DIE FONTÄNE", w / 2, 82);
    g.font = FONT(62);
    g.fillText("21:45 · SAAL 1", w / 2, 182);
  });
  const boardMat = new THREE.MeshBasicMaterial({ map: board, toneMapped: false });
  for (const sx of [0]) {
    const b = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 2.2), boardMat);
    b.position.set(sx, 5.85, MZ + 1.62);
    b.userData.noAO = true;
    ground.add(b);
  }
  box(10.6, 2.8, 0.3, flat(0x7a2430), 0, 5.85, MZ + 1.45, 0.02, 17);
  box(10.6, 0.2, 3.4, flat(0xd9a93a, { metalness: 0.6, roughness: 0.35 }), 0, 4.1, MZ, 0.02, 18);
  // bulbs around the board and along the canopy edge
  const bulbGeo = new THREE.SphereGeometry(0.09, 8, 6);
  const addBulb = (x, y, z) => {
    const m = glowMat(0xffd27a, 2.4);
    const b = new THREE.Mesh(bulbGeo, m);
    b.position.set(x, y, z);
    b.userData.noAO = true;
    ground.add(b);
    bulbs.push(m);
  };
  for (let i = 0; i <= 26; i++) {
    const x = -5.2 + (i / 26) * 10.4;
    addBulb(x, 7.35, MZ + 1.65);
    addBulb(x, 4.35, MZ + 1.75);
  }
  for (let i = 1; i < 7; i++) {
    const y = 4.35 + (i / 7) * 3.0;
    addBulb(-5.35, y, MZ + 1.65);
    addBulb(5.35, y, MZ + 1.65);
  }
  for (let i = 0; i <= 16; i++) addBulb(-5.4 + 0, 4.15, MZ + 1.5 - (i / 16) * 3.1);
  for (let i = 0; i <= 16; i++) addBulb(5.4, 4.15, MZ + 1.5 - (i / 16) * 3.1);
  const marqueeLight = new THREE.PointLight(0xffc070, 26, 18, 1.4);
  marqueeLight.position.set(0, 3.6, MZ + 3.2);
  ground.add(marqueeLight);

  // vertical blade sign "KINO": red neon letters, cyan outline
  const blade = new THREE.Group();
  blade.position.set(-7.6, 9.2, FZ + 1.1);
  ground.add(blade);
  {
    const body = F(new THREE.BoxGeometry(0.5, 6.2, 1.9), flat(0x1e1828), 0.03, 19);
    body.castShadow = true;
    blade.add(body);
    const tex = canvasTex(256, 1024, (g, w, h) => {
      g.fillStyle = "#1e1828";
      g.fillRect(0, 0, w, h);
      g.strokeStyle = "#39e6ff";
      g.lineWidth = 14;
      g.strokeRect(14, 14, w - 28, h - 28);
      g.fillStyle = "#ff2f4f";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.font = FONT(190);
      ["K", "I", "N", "O"].forEach((ch, i) => g.fillText(ch, w / 2, 150 + i * 240));
    });
    const m = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
    neonMats.push(m);
    for (const sx of [-1, 1]) {
      const face = new THREE.Mesh(new THREE.PlaneGeometry(1.86, 6.1), m);
      face.position.set(sx * 0.26, 0, 0);
      face.rotation.y = (sx * Math.PI) / 2;
      face.userData.noAO = true;
      blade.add(face);
    }
    const bl = new THREE.PointLight(0xff2f4f, 18, 14, 1.5);
    bl.position.set(1.2, -1, 0.5);
    blade.add(bl);
  }

  // poster light boxes left and right of the doors (made-up films)
  const posters = [
    ["DIE", "FONTÄNE", "#2a7fff", "#ffd23f"],
    ["RÜLPS", "2", "#ff4f8b", "#ffffff"],
    ["MONDLAND", "SCHAFT", "#1fbf8f", "#fff4c2"],
    ["BLÄSCHEN", "ALARM", "#ff8a2a", "#1a1420"],
  ];
  posters.forEach(([a, b, bg, fg], i) => {
    const tex = canvasTex(256, 384, (g, w, h) => {
      g.fillStyle = bg;
      g.fillRect(0, 0, w, h);
      g.fillStyle = "rgba(0,0,0,0.25)";
      g.beginPath();
      g.arc(w / 2, h * 0.42, w * 0.32, 0, 7);
      g.fill();
      g.fillStyle = fg;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.font = FONT(a.length > 6 ? 40 : 56);
      g.fillText(a, w / 2, h * 0.76);
      g.font = FONT(b.length > 4 ? 44 : 72);
      g.fillText(b, w / 2, h * 0.88);
      // a bottle silhouette for "Die Fontäne"
      g.fillStyle = fg;
      if (i === 0) {
        g.fillRect(w / 2 - 18, h * 0.3, 36, 90);
        g.fillRect(w / 2 - 8, h * 0.22, 16, 30);
        for (let k = 0; k < 14; k++) g.fillRect(w / 2 - 40 + k * 6, h * 0.05 + (k % 3) * 10, 4, 40);
      }
    });
    const x = [-6.0, -9.7, 6.0, 9.7][i];
    box(
      2.2,
      3.2,
      0.3,
      flat(0xd9a93a, { metalness: 0.6, roughness: 0.35 }),
      x,
      2.3,
      FZ + 0.15,
      0.02,
      20 + i,
    );
    const p = new THREE.Mesh(
      new THREE.PlaneGeometry(1.9, 2.85),
      new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }),
    );
    p.position.set(x, 2.3, FZ + 0.32);
    p.userData.noAO = true;
    ground.add(p);
  });
  // upper windows: some lit
  for (let i = 0; i < 7; i++) {
    const x = -9 + i * 3;
    const lit = r() > 0.45;
    box(
      1.3,
      1.8,
      0.1,
      lit ? glowMat(0xffc27a, 1.1) : flat(0x241e30, { roughness: 0.2 }),
      x,
      8.3,
      FZ + 0.02,
      0,
      1,
      false,
    );
  }
}

// ---------------------------------------------------------------- left: ticket kiosk
{
  const g = new THREE.Group();
  const red = flat(0xb5202f, { roughness: 0.55 });
  const gold = flat(0xd9a93a, { metalness: 0.6, roughness: 0.35 });
  const base = F(new THREE.CylinderGeometry(1.25, 1.35, 1.2, 10), red, 0.04, 31);
  base.position.y = 0.6;
  g.add(base);
  const glass = new THREE.Mesh(
    new THREE.CylinderGeometry(1.15, 1.15, 1.5, 10, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0xffe0a0,
      emissive: 0xffb050,
      emissiveIntensity: 0.7,
      roughness: 0.15,
      transparent: true,
      opacity: 0.75,
    }),
  );
  glass.position.y = 1.95;
  g.add(glass);
  const roof = F(new THREE.ConeGeometry(1.55, 1.2, 10), red, 0.05, 32);
  roof.position.y = 3.3;
  g.add(roof);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.32, 0.07, 6, 20), gold);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 2.72;
  g.add(ring);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), gold);
  knob.position.y = 3.95;
  g.add(knob);
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 0.45),
    new THREE.MeshBasicMaterial({
      map: canvasTex(256, 80, (c, w, h) => {
        c.fillStyle = "#fbf3dc";
        c.fillRect(0, 0, w, h);
        c.fillStyle = "#b5202f";
        c.font = FONT(52);
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText("KASSE", w / 2, h / 2 + 2);
      }),
      toneMapped: false,
    }),
  );
  sign.position.set(0, 1.0, 1.37);
  g.add(sign);
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = o.receiveShadow = true;
  });
  g.position.set(-9.6, 0, -4.6);
  g.rotation.y = 0.5;
  ground.add(g);
  const kl = new THREE.PointLight(0xffb050, 8, 8, 1.6);
  kl.position.set(-9.6, 2, -3.4);
  ground.add(kl);
}

// ---------------------------------------------------------------- right: popcorn cart (keeps popping)
export const popcorn = [];
{
  const g = new THREE.Group();
  const red = flat(0xd92a35, { roughness: 0.5 });
  const white = flat(0xf6efe2, { roughness: 0.6 });
  g.add(at(F(new THREE.BoxGeometry(2.2, 1.1, 1.3), red, 0.04, 41), 0, 1.05, 0));
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.08, 1.32), white);
    s.position.set(-0.8 + i * 0.4, 1.05, 0);
    g.add(s);
  }
  for (const sx of [-1, 1]) {
    const wh = F(new THREE.CylinderGeometry(0.45, 0.45, 0.12, 14), flat(0x1a1420), 0.04, 42);
    wh.rotation.x = Math.PI / 2;
    wh.position.set(sx * 0.8, 0.45, 0.7);
    g.add(wh);
  }
  // glass case with a warm glow
  const caseM = new THREE.Mesh(
    new THREE.BoxGeometry(1.9, 1.2, 1.1),
    new THREE.MeshStandardMaterial({
      color: 0xfff1c0,
      emissive: 0xffc860,
      emissiveIntensity: 0.55,
      roughness: 0.1,
      transparent: true,
      opacity: 0.45,
    }),
  );
  caseM.position.y = 2.2;
  g.add(caseM);
  const pile = F(
    new THREE.BoxGeometry(1.8, 0.35, 1.0, 6, 2, 4),
    flat(0xfff0b0, { emissive: 0xffc860, emissiveIntensity: 0.3 }),
    0.12,
    43,
  );
  pile.position.y = 1.78;
  g.add(pile);
  const roof = F(new THREE.BoxGeometry(2.3, 0.2, 1.4), red, 0.03, 44);
  roof.position.y = 2.9;
  g.add(roof);
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(1.9, 0.5),
    new THREE.MeshBasicMaterial({
      map: canvasTex(320, 84, (c, w, h) => {
        c.fillStyle = "#ffd23f";
        c.fillRect(0, 0, w, h);
        c.fillStyle = "#b5202f";
        c.font = FONT(56);
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText("POPCORN", w / 2, h / 2 + 2);
      }),
      toneMapped: false,
    }),
  );
  sign.position.set(0, 3.3, 0);
  g.add(sign);
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = o.receiveShadow = true;
  });
  g.position.set(9.0, 0, -3.6);
  g.rotation.y = -0.45;
  ground.add(g);
  const pl = new THREE.PointLight(0xffc860, 7, 7, 1.6);
  pl.position.set(9.0, 2.3, -2.6);
  ground.add(pl);
  // popping kernels inside the case
  const kernMat = flat(0xfff6d8, { emissive: 0xffd890, emissiveIntensity: 0.35 });
  const kg = new THREE.IcosahedronGeometry(0.07, 0);
  for (let i = 0; i < 16; i++) {
    const k = new THREE.Mesh(kg, kernMat);
    g.add(k);
    popcorn.push({ k, x: (r() - 0.5) * 1.5, z: (r() - 0.5) * 0.8, ph: r(), sp: 0.7 + r() * 0.8 });
  }
}

// ---------------------------------------------------------------- street furniture
for (const [x, z] of [
  [-13, -5.5],
  [13, -5.5],
  [-12.5, 8.4],
  [12.5, 8.4],
])
  place(lamp({ on: true }), x, z);
place(bin(), -6.9, -6.3);
place(bin(), 11.4, 7.6, 0.3);
// planters with little clipped trees beside the doors
for (const sx of [-1, 1]) {
  cyl(0.6, 0.5, 0.8, 8, flat(0x2a2430), sx * 4.2, 0.4, FZ + 1.0, 0.05, 50);
  const t = F(new THREE.IcosahedronGeometry(0.75, 1), flat(0x2f6b3a), 0.12, 51);
  t.position.set(sx * 4.2, 1.6, FZ + 1.0);
  t.castShadow = true;
  ground.add(t);
}
car(-15, 15, 0x2f7fd9, Math.PI / 2);
car(19, 18.5, 0xffd23f, -Math.PI / 2);

// ---------------------------------------------------------------- far layer: city blocks with lit windows
{
  const N = 900;
  const win = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(0.7, 0.9),
    new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
    N,
  );
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const c = new THREE.Color();
  let n = 0;
  const blocks = [];
  // behind the cinema and to the sides, a ring of tall blocks
  for (let i = 0; i < 22; i++) {
    const a = -Math.PI * 0.95 + (i / 21) * Math.PI * 0.9 + (r() - 0.5) * 0.05; // back half
    const rad = 26 + r() * 10;
    blocks.push([Math.cos(a) * rad, Math.sin(a) * rad, 5 + r() * 5, 8 + r() * 14, 4 + r() * 3]);
  }
  for (const [x, z, w, h, d] of blocks) {
    const shade = 0.12 + r() * 0.08;
    const b = box(
      w,
      h,
      d,
      flat(new THREE.Color(shade, shade * 0.95, shade * 1.4).getHex(), { roughness: 0.9 }),
      x,
      h / 2,
      z,
      0.03,
      Math.floor(r() * 100),
      false,
    );
    b.lookAt(0, h / 2, 0);
    // windows on the face pointing at the stage
    const face = new THREE.Vector3(-x, 0, -z).normalize();
    const side = new THREE.Vector3(face.z, 0, -face.x);
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), face);
    for (let row = 1.2; row < h - 0.8; row += 1.5)
      for (let col = -w / 2 + 0.8; col < w / 2 - 0.5; col += 1.2) {
        if (n >= N || r() > 0.42) continue;
        const p = new THREE.Vector3(x, row, z)
          .addScaledVector(face, d / 2 + 0.02)
          .addScaledVector(side, col);
        m.compose(p, q, new THREE.Vector3(1, 1, 1));
        win.setMatrixAt(n, m);
        const k = r();
        win.setColorAt(
          n++,
          k > 0.85 ? c.setRGB(0.6, 0.85, 1.0) : c.setRGB(1.0, 0.72 + k * 0.15, 0.4),
        );
      }
  }
  win.count = n;
  win.userData.noAO = true;
  ground.add(win);
}

// ---------------------------------------------------------------- life: tram passing on the street
const tram = new THREE.Group();
{
  const red = flat(0xd92a35, { roughness: 0.45 });
  const cream = flat(0xf3e9d2, { roughness: 0.5 });
  tram.add(at(F(new THREE.BoxGeometry(12, 1.6, 2.4), red, 0.03, 61), 0, 1.2, 0));
  tram.add(at(F(new THREE.BoxGeometry(12, 1.1, 2.4), cream, 0.03, 62), 0, 2.55, 0));
  tram.add(
    at(new THREE.Mesh(new THREE.BoxGeometry(12.1, 0.8, 2.3), glowMat(0xffd89a, 1.3)), 0, 2.55, 0),
  );
  tram.add(at(F(new THREE.BoxGeometry(12.2, 0.25, 2.5), flat(0x2a2430), 0.02, 63), 0, 3.2, 0));
  tram.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });
  tram.position.set(0, 0, 13);
  ground.add(tram);
}

// moths around the lamps + warm dust under the marquee
fireflies(40, { area: [-14, 14, 1.0, 6.5, -10, 9], color: 0xffd890, seed: 45, size: 0.05 });

onFrame((t) => {
  // marquee bulbs: a chase running along the strip
  bulbs.forEach((m, i) => {
    const on = (Math.floor(t * 9) - i) % 3 === 0;
    m.emissiveIntensity = on ? 3.2 : 1.3;
  });
  // neon: steady with a short double flicker every ~6 s
  const f = (t % 6.2) / 6.2;
  const flick = f > 0.93 && f < 0.95 ? 0.25 : f > 0.96 && f < 0.97 ? 0.4 : 1;
  for (const m of neonMats) m.color.setScalar(flick);
  // popcorn: kernels jump up and fall back in the glass case
  for (const { k, x, z, ph, sp } of popcorn) {
    const u = (t * sp + ph) % 1;
    k.position.set(x, 1.95 + Math.sin(u * Math.PI) * 0.75, z);
    k.rotation.set(t * 5 + ph * 9, t * 3, 0);
  }
  // tram: passes left → right once every 30 s
  const u = ((t + 9) % 30) / 30;
  tram.position.x = -60 + u * 120;
});

finishSet({ ground: 0x3b3a46 });
