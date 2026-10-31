// Set of #42 "Tattoo": a small tattoo studio in a Viennese Hinterhof at
// night, ~22:00. The arm rest with the viewer's tattooed forearm stands at
// the origin (built in scene.js). Behind it the hero piece: a brick wall
// covered in flash sheets under a wall-wide shelf of ink bottles in every
// colour. Right the shop window with a pink "TATTOO" neon, outside the
// courtyard at night (a lamp, wet cobbles, a bike). Props: black leather
// tattoo bench, steel trolley with ink caps + power supply, a ring lamp on
// an arm, a monstera, a hanging plant, a coffee mug with steam, a stool.
// Life: neon flicker, steam, dust in the lamp light, the hanging plant sways.
// The skin world (HAUT) is a dark place under the floor, built in scene.js.
import { THREE, flat, ground, onFrame, rng, patches, facet, facetMat, clamp01 } from "./world.js";
import { setSky, finishSet, F, fireflies } from "./environments.js";

const r = rng(42);
const WZ = -7.2; // back wall
const CEIL = 7.6;

// ---------------------------------------------------------------- light
setSky({
  top: [0.03, 0.03, 0.09],
  mid: [0.06, 0.05, 0.14],
  hor: [0.12, 0.08, 0.2],
  below: [0.05, 0.04, 0.09],
  sun: [0.4, 0.3, 0.9],
  sunDir: [0, 0.3, -1],
  cloud: [0x000000, 0x000000],
  noClouds: true,
  birds: false,
  stars: 0.3,
  hemi: [0xb59ac8, 0x1a1418, 0.75],
  key: [0xffe6c8, 1.35],
  keyPos: [2, 11, 6],
  rim: [0xff4fa8, 1.4],
  fog: [26, 70],
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

// ---------------------------------------------------------------- floor
{
  // dark oiled oak planks with colour patches
  const g = patches(facet(new THREE.BoxGeometry(44, 0.2, 30, 44, 1, 30), 0.05, 3), {
    amt: 0.08,
    scale: 0.3,
    seed: 4,
    warm: 0.4,
  });
  const floor = new THREE.Mesh(g, facetMat(flat(0x4a3428, { roughness: 0.55 })));
  floor.position.set(2, -0.1, 6);
  floor.receiveShadow = true;
  ground.add(floor);
  // plank seams
  for (let i = -10; i <= 14; i++)
    box(0.03, 0.01, 30, flat(0x2a1c16), i * 0.9 + 0.2, 0.005, 6, 0, 1, false);
  // round rug under the arm rest: deep red with a black ring
  const rug = new THREE.Mesh(
    facet(new THREE.CylinderGeometry(3.4, 3.4, 0.05, 28), 0.05, 7),
    facetMat(flat(0x8a1f2c, { roughness: 1 })),
  );
  rug.position.set(0, 0.03, 0.2);
  rug.receiveShadow = true;
  ground.add(rug);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.0, 0.08, 4, 40), flat(0x1a1214));
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0, 0.06, 0.2);
  ground.add(ring);
}

// ---------------------------------------------------------------- back wall: bricks + flash sheets
{
  const H = CEIL;
  // brick wall: a dark red slab with instanced bricks in front
  box(34, H, 0.4, flat(0x3a1c1a, { roughness: 0.95 }), -2, H / 2, WZ - 0.2, 0.02, 11, false);
  const N = 700;
  const bricks = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.62, 0.26, 0.12),
    flat(0xffffff, { roughness: 0.9 }),
    N,
  );
  const m = new THREE.Matrix4();
  const c = new THREE.Color();
  let n = 0;
  for (let row = 0; row < 26 && n < N; row++)
    for (let col = 0; col < 27 && n < N; col++) {
      const x = -15 + col * 0.66 + (row % 2) * 0.33;
      if (x > 3.0) continue; // the window part is plaster
      m.makeTranslation(x, 0.16 + row * 0.29, WZ + 0.02);
      bricks.setMatrixAt(n, m);
      const k = r();
      bricks.setColorAt(n++, c.setRGB(0.42 + k * 0.18, 0.17 + k * 0.06, 0.13 + k * 0.05));
    }
  bricks.count = n;
  bricks.receiveShadow = true;
  ground.add(bricks);

  // flash sheets: tattoo designs on paper, pinned in a grid
  const designs = [
    (g, w, h) => {
      // heart with banner
      g.fillStyle = "#d8262f";
      g.beginPath();
      g.moveTo(w / 2, h * 0.78);
      g.bezierCurveTo(w * 0.05, h * 0.45, w * 0.2, h * 0.12, w / 2, h * 0.32);
      g.bezierCurveTo(w * 0.8, h * 0.12, w * 0.95, h * 0.45, w / 2, h * 0.78);
      g.fill();
      g.lineWidth = 8;
      g.strokeStyle = "#111";
      g.stroke();
      g.fillStyle = "#f3e2b8";
      g.fillRect(w * 0.12, h * 0.42, w * 0.76, h * 0.13);
      g.strokeRect(w * 0.12, h * 0.42, w * 0.76, h * 0.13);
    },
    (g, w, h) => {
      // swallow
      g.fillStyle = "#1f4fa8";
      g.beginPath();
      g.moveTo(w * 0.1, h * 0.35);
      g.quadraticCurveTo(w * 0.5, h * 0.25, w * 0.9, h * 0.2);
      g.quadraticCurveTo(w * 0.6, h * 0.45, w * 0.55, h * 0.75);
      g.lineTo(w * 0.45, h * 0.55);
      g.lineTo(w * 0.2, h * 0.8);
      g.quadraticCurveTo(w * 0.3, h * 0.5, w * 0.1, h * 0.35);
      g.fill();
      g.lineWidth = 7;
      g.strokeStyle = "#111";
      g.stroke();
    },
    (g, w, h) => {
      // star
      g.fillStyle = "#f2b417";
      g.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const rr = i % 2 ? w * 0.17 : w * 0.4;
        g.lineTo(w / 2 + Math.cos(a) * rr, h / 2 + Math.sin(a) * rr);
      }
      g.closePath();
      g.fill();
      g.lineWidth = 8;
      g.strokeStyle = "#111";
      g.stroke();
    },
    (g, w, h) => {
      // rose: red spiral on green leaves
      g.fillStyle = "#2f8a3a";
      g.beginPath();
      g.ellipse(w * 0.3, h * 0.66, w * 0.18, h * 0.08, -0.6, 0, 7);
      g.ellipse(w * 0.7, h * 0.66, w * 0.18, h * 0.08, 0.6, 0, 7);
      g.fill();
      g.fillStyle = "#c81e3a";
      g.beginPath();
      g.arc(w / 2, h * 0.45, w * 0.26, 0, 7);
      g.fill();
      g.lineWidth = 7;
      g.strokeStyle = "#111";
      g.stroke();
      g.beginPath();
      for (let a = 0; a < 14; a += 0.2)
        g.lineTo(w / 2 + Math.cos(a) * a * 3.2, h * 0.45 + Math.sin(a) * a * 3.2);
      g.stroke();
    },
    (g, w, h) => {
      // dagger
      g.fillStyle = "#c9ced6";
      g.beginPath();
      g.moveTo(w / 2, h * 0.9);
      g.lineTo(w * 0.42, h * 0.38);
      g.lineTo(w * 0.58, h * 0.38);
      g.closePath();
      g.fill();
      g.lineWidth = 7;
      g.strokeStyle = "#111";
      g.stroke();
      g.fillStyle = "#7a3a1a";
      g.fillRect(w * 0.44, h * 0.12, w * 0.12, h * 0.22);
      g.fillStyle = "#f2b417";
      g.fillRect(w * 0.26, h * 0.33, w * 0.48, h * 0.06);
    },
    (g, w, h) => {
      // skull-ish moon
      g.fillStyle = "#f4ecd8";
      g.beginPath();
      g.arc(w / 2, h * 0.45, w * 0.3, 0, 7);
      g.fill();
      g.lineWidth = 8;
      g.strokeStyle = "#111";
      g.stroke();
      g.fillStyle = "#111";
      g.beginPath();
      g.arc(w * 0.4, h * 0.43, w * 0.07, 0, 7);
      g.arc(w * 0.6, h * 0.43, w * 0.07, 0, 7);
      g.fill();
      g.fillRect(w * 0.42, h * 0.6, w * 0.16, h * 0.08);
    },
  ];
  const texs = designs.map((d) =>
    canvasTex(256, 320, (g, w, h) => {
      g.fillStyle = "#f6efe0";
      g.fillRect(0, 0, w, h);
      d(g, w, h);
    }),
  );
  let k = 0;
  for (let row = 0; row < 3; row++)
    for (let col = 0; col < 8; col++) {
      const x = -12.4 + col * 1.85 + (row % 2) * 0.3;
      if (x > 2.2) continue;
      const sheet = new THREE.Mesh(
        new THREE.PlaneGeometry(1.4, 1.75),
        new THREE.MeshStandardMaterial({ map: texs[k++ % texs.length], roughness: 0.85 }),
      );
      sheet.position.set(x, 1.6 + row * 1.95, WZ + 0.12);
      sheet.rotation.z = (r() - 0.5) * 0.08;
      sheet.receiveShadow = true;
      ground.add(sheet);
      // black pin
      const pin = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), flat(0x111111));
      pin.position.set(x, 2.38 + row * 1.95, WZ + 0.16);
      ground.add(pin);
    }

  // hero shelf over the sheets: a long black shelf full of ink bottles
  const wood = flat(0x1c1416, { roughness: 0.5 });
  for (const y of [7.15, 6.95]) box(15.5, 0.12, 0.8, wood, -5.2, y - 0.6, WZ + 0.45, 0.02, 3);
  const inks = [
    0xd8262f, 0xf2b417, 0x2f8a3a, 0x1f4fa8, 0x8a2fb8, 0xff6a1f, 0x111111, 0x26b8c9, 0xf25aa8,
    0xffffff,
  ];
  for (let i = 0; i < 46; i++) {
    const x = -12.6 + i * 0.32 + (r() - 0.5) * 0.06;
    const h = 0.42 + r() * 0.18;
    const col = inks[Math.floor(r() * inks.length)];
    cyl(0.12, 0.13, h, 7, flat(col, { roughness: 0.25 }), x, 6.47 + h / 2, WZ + 0.45, 0.04, i);
    cyl(0.07, 0.07, 0.12, 6, flat(0x222222), x, 6.47 + h + 0.06, WZ + 0.45, 0.02, i, false);
  }
}

// ---------------------------------------------------------------- window with neon + courtyard
export const neonMats = [];
{
  const wx0 = 3.4;
  const wx1 = 12.2;
  const wy0 = 1.2;
  const wy1 = 6.2;
  const plaster = flat(0x2c2430, { roughness: 0.95 });
  box(18, wy0, 0.4, plaster, 12, wy0 / 2, WZ, 0.02, 21, false);
  box(18, CEIL - wy1, 0.4, plaster, 12, (wy1 + CEIL) / 2, WZ, 0.02, 22, false);
  box(1, wy1 - wy0, 0.4, plaster, wx0 - 0.4, (wy0 + wy1) / 2, WZ, 0.02, 23, false);
  box(10, wy1 - wy0, 0.4, plaster, wx1 + 5, (wy0 + wy1) / 2, WZ, 0.02, 24, false);
  const steel = flat(0x141218, { roughness: 0.4, metalness: 0.5 });
  box(wx1 - wx0 + 0.4, 0.22, 0.5, steel, (wx0 + wx1) / 2, wy1, WZ + 0.05, 0.01, 1, false);
  box(wx1 - wx0 + 0.4, 0.22, 0.6, steel, (wx0 + wx1) / 2, wy0, WZ + 0.05, 0.01, 1, false);
  box(0.16, wy1 - wy0, 0.5, steel, (wx0 + wx1) / 2, (wy0 + wy1) / 2, WZ + 0.05, 0.01, 1, false);
  const pane = new THREE.Mesh(
    new THREE.PlaneGeometry(wx1 - wx0, wy1 - wy0),
    new THREE.MeshStandardMaterial({
      color: 0x8a9cff,
      roughness: 0.05,
      metalness: 0.3,
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
    }),
  );
  pane.position.set((wx0 + wx1) / 2, (wy0 + wy1) / 2, WZ + 0.02);
  pane.userData.noAO = true;
  ground.add(pane);

  // neon "TATTOO" hanging in the window, pink tubes + a cyan heart
  const neonTex = canvasTex(1024, 300, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.font = "italic 900 190px Arial Black, Impact, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.lineJoin = "round";
    g.shadowColor = "#ff3fa0";
    g.shadowBlur = 30;
    g.lineWidth = 14;
    g.strokeStyle = "#ff5fb4";
    g.strokeText("TATTOO", w / 2, h / 2 + 8);
    g.shadowBlur = 0;
    g.lineWidth = 5;
    g.strokeStyle = "#ffe0f0";
    g.strokeText("TATTOO", w / 2, h / 2 + 8);
  });
  const neonMat = new THREE.MeshBasicMaterial({
    map: neonTex,
    transparent: true,
    depthWrite: false,
    color: 0xffffff,
    fog: false,
  });
  neonMats.push(neonMat);
  const neon = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 1.64), neonMat);
  neon.position.set((wx0 + wx1) / 2, 4.6, WZ + 0.35);
  neon.userData.noAO = true;
  ground.add(neon);
  const heartMat = glowMat(0x3fe8ff, 3);
  neonMats.push(heartMat);
  {
    const s = new THREE.Shape();
    s.moveTo(0, -0.5);
    s.bezierCurveTo(-0.9, 0.1, -0.5, 0.75, 0, 0.35);
    s.bezierCurveTo(0.5, 0.75, 0.9, 0.1, 0, -0.5);
    const pts = s.getPoints(40).map((p) => new THREE.Vector3(p.x, p.y, 0));
    const heart = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 80, 0.045, 6, true),
      heartMat,
    );
    heart.position.set((wx0 + wx1) / 2, 2.85, WZ + 0.35);
    heart.scale.setScalar(0.9);
    ground.add(heart);
  }
  const neonLight = new THREE.PointLight(0xff4fa8, 14, 14, 1.4);
  neonLight.position.set((wx0 + wx1) / 2, 4.4, WZ + 1.6);
  ground.add(neonLight);

  // outside: the courtyard at night — wet cobbles, a lamp, the opposite house
  const cob = new THREE.Mesh(
    patches(facet(new THREE.BoxGeometry(22, 0.2, 12, 22, 1, 12), 0.06, 8), {
      amt: 0.1,
      scale: 0.4,
      seed: 9,
    }),
    facetMat(flat(0x2a2c3a, { roughness: 0.2, metalness: 0.3 })),
  );
  cob.position.set(8, -0.1, WZ - 6.4);
  ground.add(cob);
  box(24, 9, 0.5, flat(0x3a3448, { roughness: 0.9 }), 8, 4.5, WZ - 10.5, 0.03, 31, false);
  for (let i = 0; i < 6; i++) {
    const lit = i % 3 !== 1;
    box(
      1.1,
      1.5,
      0.1,
      lit ? glowMat(0xffc46b, 1.3) : flat(0x1a1824),
      2.6 + i * 2.2,
      5.2,
      WZ - 10.2,
      0,
      1,
      false,
    );
    box(
      1.1,
      1.5,
      0.1,
      i % 2 ? glowMat(0xffd59a, 1.1) : flat(0x1a1824),
      2.6 + i * 2.2,
      2.0,
      WZ - 10.2,
      0,
      1,
      false,
    );
  }
  cyl(0.07, 0.09, 4.4, 6, flat(0x1a1a1a), 9.6, 2.2, WZ - 5, 0.02, 1);
  cyl(0.3, 0.2, 0.42, 8, glowMat(0xffd59a, 3), 9.6, 4.5, WZ - 5, 0.02, 1, false);
  const lampL = new THREE.PointLight(0xffc88a, 12, 12, 1.4);
  lampL.position.set(9.6, 4.2, WZ - 4.6);
  ground.add(lampL);
  // a parked bike against the house
  const bk = flat(0x2fb8a0, { roughness: 0.4 });
  for (const dx of [-0.7, 0.7]) {
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.05, 5, 16), flat(0x111111));
    wheel.position.set(5.2 + dx, 0.45, WZ - 9.6);
    ground.add(wheel);
  }
  box(1.4, 0.08, 0.08, bk, 5.2, 0.8, WZ - 9.6, 0, 1);
  box(0.08, 0.8, 0.08, bk, 4.9, 0.6, WZ - 9.6, 0, 1);
}

// ---------------------------------------------------------------- tattoo bench (left)
{
  const leather = flat(0x141216, { roughness: 0.32 });
  const chrome = flat(0xd8dde4, { metalness: 0.9, roughness: 0.18 });
  box(5.2, 0.5, 2.0, leather, -9.4, 1.55, -1.6, 0.03, 41);
  box(2.0, 0.45, 2.0, leather, -12.3, 2.05, -1.6, 0.03, 42).rotation.z = -0.35;
  for (let i = 0; i < 6; i++)
    box(0.04, 0.02, 1.9, flat(0x2a262c), -11.5 + i * 0.9, 1.81, -1.6, 0, 1, false);
  cyl(0.18, 0.18, 1.3, 10, chrome, -9.4, 0.65, -1.6, 0.02, 2);
  cyl(1.0, 1.1, 0.12, 14, chrome, -9.4, 0.06, -1.6, 0.02, 3);
  // stool
  cyl(0.6, 0.6, 0.22, 12, leather, -6.9, 1.25, 2.8, 0.03, 4);
  cyl(0.06, 0.06, 1.1, 6, chrome, -6.9, 0.6, 2.8, 0.02, 5);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const leg = box(
      0.7,
      0.06,
      0.08,
      chrome,
      -6.9 + Math.cos(a) * 0.35,
      0.08,
      2.8 + Math.sin(a) * 0.35,
      0,
      1,
    );
    leg.rotation.y = -a;
  }
}

// ---------------------------------------------------------------- trolley (right) with inks + power supply
export const PSU_POS = [7.6, 2.3, -1.4];
{
  const steel = flat(0xc9ced6, { metalness: 0.85, roughness: 0.25 });
  box(2.6, 0.08, 1.6, steel, 7.6, 2.05, -1.4, 0.01, 51);
  box(2.6, 0.08, 1.6, steel, 7.6, 0.8, -1.4, 0.01, 52);
  for (const dx of [-1.2, 1.2])
    for (const dz of [-0.7, 0.7]) cyl(0.04, 0.04, 2.0, 5, steel, 7.6 + dx, 1.05, -1.4 + dz, 0, 1);
  // black power supply with red digits
  box(0.9, 0.42, 0.6, flat(0x111114, { roughness: 0.4 }), 7.0, 2.3, -1.6, 0.02, 53);
  box(0.42, 0.16, 0.02, glowMat(0xff2a2a, 3), 7.0, 2.36, -1.29, 0, 1, false);
  // ink caps + bottles
  const inks = [0x111111, 0xd8262f, 0x2f8a3a, 0x1f4fa8, 0xf2b417];
  inks.forEach((c, i) => {
    cyl(
      0.1,
      0.12,
      0.42,
      7,
      flat(c, { roughness: 0.25 }),
      7.9 + (i % 3) * 0.32,
      2.3,
      -1.85 + Math.floor(i / 3) * 0.36,
      0.03,
      i,
    );
    cyl(
      0.06,
      0.06,
      0.1,
      6,
      flat(0x222222),
      7.9 + (i % 3) * 0.32,
      2.56,
      -1.85 + Math.floor(i / 3) * 0.36,
      0.02,
      i,
      false,
    );
  });
  for (let i = 0; i < 6; i++)
    cyl(0.07, 0.05, 0.1, 6, flat(inks[i % 5]), 7.9 + i * 0.16, 2.14, -0.95, 0.02, i, false);
  // paper towel roll + green soap bottle on the lower shelf
  cyl(0.28, 0.28, 0.75, 10, flat(0xf4f0ea, { roughness: 1 }), 7.0, 1.22, -1.4, 0.04, 6);
  cyl(0.16, 0.18, 0.6, 8, flat(0x3cbf6a, { roughness: 0.2 }), 8.3, 1.14, -1.4, 0.03, 7);
}

// ---------------------------------------------------------------- ring lamp on an arm (hero light)
export const LAMP_POS = [-3.4, 6.2, -1.2];
{
  const black = flat(0x18161a, { roughness: 0.4, metalness: 0.3 });
  cyl(0.9, 1.0, 0.14, 12, black, -5.6, 0.07, -3.4, 0.02, 61);
  cyl(0.06, 0.06, 5.2, 6, black, -5.6, 2.7, -3.4, 0.02, 62);
  const arm = box(3.0, 0.1, 0.1, black, -4.5, 5.6, -2.3, 0, 1);
  arm.rotation.y = Math.PI / 4;
  arm.rotation.z = 0.25;
  const ringL = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.13, 8, 28), glowMat(0xfff4e8, 2.6));
  ringL.position.set(...LAMP_POS);
  ringL.rotation.x = Math.PI / 2.4;
  ground.add(ringL);
  const spot = new THREE.SpotLight(0xfff1e0, 60, 18, 0.6, 0.6, 1.2);
  spot.position.set(...LAMP_POS);
  spot.target.position.set(0, 1, 0);
  spot.castShadow = false;
  ground.add(spot, spot.target);
}

// ---------------------------------------------------------------- plants, mug, shelf deco
export const sways = [];
{
  // monstera in a terracotta pot (left back)
  cyl(0.8, 0.6, 1.2, 10, flat(0xb8603a, { roughness: 0.8 }), -14.2, 0.6, -5.2, 0.05, 71);
  const leaf = flat(0x2f7a3a, { roughness: 0.6, side: THREE.DoubleSide });
  const mon = new THREE.Group();
  mon.position.set(-14.2, 1.2, -5.2);
  ground.add(mon);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + r();
    const stem = new THREE.Group();
    stem.rotation.set(0.5 + r() * 0.5, a, 0);
    const l = F(new THREE.CircleGeometry(0.7, 9), leaf, 0.1, i);
    l.scale.set(1, 1.4, 1);
    l.position.set(0, 1.4 + r() * 0.8, 0);
    l.rotation.x = -0.6;
    l.castShadow = true;
    stem.add(l);
    mon.add(stem);
  }
  sways.push(mon);
  // hanging plant from the ceiling, vines down
  const hang = new THREE.Group();
  hang.position.set(4.4, CEIL - 1.0, -4.6);
  ground.add(hang);
  const pot = F(new THREE.SphereGeometry(0.5, 8, 6, 0, 6.3, 0, 1.8), flat(0xe8e2d8), 0.05, 3);
  hang.add(pot);
  for (let i = 0; i < 7; i++) {
    const vine = new THREE.Group();
    const a = (i / 7) * Math.PI * 2;
    vine.position.set(Math.cos(a) * 0.4, 0, Math.sin(a) * 0.4);
    for (let j = 0; j < 6 + (i % 3); j++) {
      const lf = F(new THREE.IcosahedronGeometry(0.15, 0), flat(0x4f9a4a), 0.1, i * 10 + j);
      lf.position.set(0, -j * 0.28, 0);
      vine.add(lf);
    }
    hang.add(vine);
  }
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.0, 4), flat(0x222222));
  cord.position.y = 0.5;
  hang.add(cord);
  sways.push(hang);
}
// coffee mug on the trolley, steam rises
export const MUG = [8.6, 2.1, -0.95];
{
  cyl(
    0.17,
    0.15,
    0.32,
    10,
    flat(0x111111, { roughness: 0.3 }),
    MUG[0],
    MUG[1] + 0.16,
    MUG[2],
    0.03,
    81,
  );
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.03, 4, 10), flat(0x111111));
  handle.position.set(MUG[0] + 0.19, MUG[1] + 0.17, MUG[2]);
  ground.add(handle);
}
const steamMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.35,
  depthWrite: false,
});
const steam = Array.from({ length: 7 }, (_, i) => {
  const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.08, 0), steamMat.clone());
  s.userData.ph = i / 7;
  s.userData.noAO = true;
  ground.add(s);
  return s;
});

// warm dust in the lamp light
fireflies(70, { area: [-6, 6, 0.6, 6, -4, 4], color: 0xffd9a8, seed: 42, size: 0.03 });

// ---------------------------------------------------------------- life
onFrame((t) => {
  // neon: steady, with a short double flicker every ~7 s
  const ph = (t * 0.14) % 1;
  const fl = ph > 0.93 && ph < 0.96 ? 0.25 : ph > 0.97 && ph < 0.985 ? 0.4 : 1;
  for (const m of neonMats) {
    if (m.isMeshBasicMaterial) m.opacity = fl;
    else m.emissiveIntensity = 3 * fl;
  }
  for (const s of steam) {
    const k = (t * 0.4 + s.userData.ph) % 1;
    s.position.set(
      MUG[0] + Math.sin(k * 7 + s.userData.ph * 9) * 0.08,
      MUG[1] + 0.4 + k * 1.1,
      MUG[2],
    );
    s.scale.setScalar(0.6 + k * 1.8);
    s.material.opacity = 0.35 * clamp01(k * 4) * (1 - k);
  }
  sways.forEach((g, i) => {
    g.rotation.z = Math.sin(t * 0.7 + i * 2) * 0.03;
    g.rotation.x = Math.sin(t * 0.5 + i) * 0.02;
  });
});

finishSet({ ground: 0x2a1c16 });
