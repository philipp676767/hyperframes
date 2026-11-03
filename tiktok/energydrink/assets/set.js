// #51 Energydrinks — the world: a WG desk at 4 a.m. during a gaming / study
// marathon. Dark room, the monitor's blue glow, a pink LED strip along the
// wall, a warm desk lamp, the night city behind the window. Everything sits
// on the desk where it really lives: keyboard and clock in front (foreground
// layer), monitor, lamp and shelf behind, the window as the hero piece, the
// skyline as the far layer. Life: monitor flicker, LED colour drift, blinking
// city windows, a plane light, dust in the lamp light, fairy lights.
import { THREE, flat, ground, onFrame, M, facet, facetMat, patches, rng, scene } from "./world.js";
import { SKIES, setSky, finishSet, F, add, fireflies, lightString } from "./environments.js";

const SEED = 51;
const r = rng(SEED);

// ---------------------------------------------------------------- light
setSky({
  ...SKIES.nacht,
  top: [0.02, 0.03, 0.09],
  mid: [0.05, 0.06, 0.16],
  hor: [0.12, 0.1, 0.26],
  below: [0.05, 0.05, 0.1],
  noClouds: true,
  birds: false,
  stars: 0.5,
  hemi: [0x7f8cff, 0x24162e, 0.9],
  key: [0xcbd6ff, 0.75],
  keyPos: [-3, 13, 9],
  rim: [0xff5fb8, 1.3],
  fog: [45, 140],
});

// ---------------------------------------------------------------- the desk
const DESK = { w: 34, d: 15, z: -0.6 };
const deskTop = new THREE.Mesh(
  patches(facet(new THREE.BoxGeometry(DESK.w, 0.7, DESK.d, 34, 1, 15), 0.035, 4), {
    amt: 0.09,
    scale: 0.22,
    seed: 5,
    warm: 0.5,
  }),
  facetMat(flat(0x5a3d2b, { roughness: 0.42 })),
);
deskTop.position.set(0, -0.35, DESK.z);
deskTop.receiveShadow = true;
ground.add(deskTop);
// front edge trim + legs, the room floor far below
add(new THREE.Mesh(new THREE.BoxGeometry(DESK.w, 0.18, 0.2), flat(0x3a2619)), 0, -0.62, 6.95);
for (const x of [-16, 16])
  add(new THREE.Mesh(new THREE.BoxGeometry(0.7, 9, 0.7), flat(0x2a2a33)), x, -5.2, 6.2);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), flat(0x2b2433));
floor.rotation.x = -Math.PI / 2;
floor.position.y = -9.6;
ground.add(floor);
// a rug and a corner of the bed far below the desk (seen only in wide shots)
add(new THREE.Mesh(new THREE.BoxGeometry(14, 0.1, 9), flat(0x4a3a6a)), -4, -9.5, 13);

// ---------------------------------------------------------------- back wall
const WALL_Z = -8.1;
const wallMat = facetMat(flat(0x2a2d4a, { roughness: 0.9 }));
const wallGeo = facet(new THREE.BoxGeometry(80, 40, 0.4, 40, 20, 1), 0.04, 9);
const wall = new THREE.Mesh(wallGeo, wallMat);
wall.position.set(0, 10, WALL_Z - 0.2);
wall.receiveShadow = true;
// the window hole is faked: the city backdrop sits in front of the wall
ground.add(wall);

// ---- hero piece: big window with the night city
const WIN = { x: 7.2, y: 6.2, w: 10, h: 7.6 };
const city = new THREE.Group();
city.position.set(WIN.x, WIN.y, WALL_Z + 0.05);
ground.add(city);
{
  // night sky in the window: deep blue to violet
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 256;
  const g = c.getContext("2d");
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, "#0b1030");
  grad.addColorStop(0.6, "#28204f");
  grad.addColorStop(1, "#5a3466");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const skyPane = new THREE.Mesh(
    new THREE.PlaneGeometry(WIN.w, WIN.h),
    new THREE.MeshBasicMaterial({ map: tex, fog: false }),
  );
  skyPane.userData.noAO = true;
  city.add(skyPane);
  // moon
  const moon = new THREE.Mesh(
    new THREE.CircleGeometry(0.55, 20),
    new THREE.MeshBasicMaterial({ color: 0xfff2d0, fog: false }),
  );
  moon.position.set(2.9, 2.4, 0.02);
  city.add(moon);
  // skyline silhouettes, three depths, lit windows as an instanced grid
  const winGeo = new THREE.PlaneGeometry(0.13, 0.17);
  const winMat = new THREE.MeshBasicMaterial({ color: 0xffd98a, fog: false });
  const lit = [];
  const layers = [
    [0x1b1a3a, 0.03, 0.55, 2.6],
    [0x15142e, 0.06, 0.75, 3.4],
    [0x0e0d22, 0.09, 1.0, 1.9],
  ];
  for (const [col, z, sc, hMax] of layers) {
    let x = -WIN.w / 2;
    while (x < WIN.w / 2) {
      const bw = (0.7 + r() * 1.1) * sc;
      const bh = (0.8 + r() * hMax) * sc;
      const b = new THREE.Mesh(
        new THREE.PlaneGeometry(bw, bh),
        new THREE.MeshBasicMaterial({ color: col, fog: false }),
      );
      b.position.set(x + bw / 2, -WIN.h / 2 + bh / 2, z);
      city.add(b);
      if (sc > 0.7)
        for (let wy = 0.25; wy < bh - 0.2; wy += 0.32)
          for (let wx = 0.18; wx < bw - 0.1; wx += 0.26)
            if (r() < 0.32) lit.push([x + wx, -WIN.h / 2 + wy, z + 0.005, r()]);
      x += bw + 0.05;
    }
  }
  const im = new THREE.InstancedMesh(winGeo, winMat, lit.length);
  const m4 = new THREE.Matrix4();
  const cc = new THREE.Color();
  lit.forEach(([x, y, z, k], i) => {
    im.setMatrixAt(i, m4.makeTranslation(x, y, z));
    im.setColorAt(i, cc.setHSL(0.1 + k * 0.05, 0.9, 0.55 + k * 0.2));
  });
  city.add(im);
  // a few windows blink on and off (life), deterministic
  onFrame((t) => {
    for (let i = 0; i < lit.length; i += 7) {
      const on = Math.sin(t * 0.7 + i * 1.7) > -0.6;
      im.setColorAt(i, cc.setHSL(0.1, 0.9, on ? 0.62 : 0.08));
    }
    im.instanceColor.needsUpdate = true;
  });
  // a plane's blinking light crossing the sky
  const plane = new THREE.Mesh(
    new THREE.CircleGeometry(0.06, 8),
    new THREE.MeshBasicMaterial({ color: 0xff4d4d, fog: false }),
  );
  city.add(plane);
  onFrame((t) => {
    plane.position.set(-WIN.w / 2 + ((t * 0.22) % 1.2) * WIN.w, 2.9 - t * 0.012, 0.1);
    plane.visible = Math.sin(t * 9) > 0.2;
  });
  // window frame, cross bars, sill
  const frameMat = flat(0xd9dbe8, { roughness: 0.5 });
  for (const [w, h, x, y] of [
    [WIN.w + 0.6, 0.35, 0, WIN.h / 2],
    [WIN.w + 0.6, 0.35, 0, -WIN.h / 2],
    [0.35, WIN.h + 0.6, -WIN.w / 2, 0],
    [0.35, WIN.h + 0.6, WIN.w / 2, 0],
    [0.2, WIN.h, 0, 0],
    [WIN.w, 0.2, 0, 1.0],
  ]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.4), frameMat);
    b.position.set(x, y, 0.2);
    b.castShadow = true;
    city.add(b);
  }
  const sill = new THREE.Mesh(new THREE.BoxGeometry(WIN.w + 1.2, 0.25, 1.1), frameMat);
  sill.position.set(0, -WIN.h / 2 - 0.2, 0.5);
  city.add(sill);
  // cool moonlight falling in
  const moonLight = new THREE.PointLight(0x7f9bff, 14, 22, 1.6);
  moonLight.position.set(WIN.x, WIN.y, WALL_Z + 2.5);
  ground.add(moonLight);
}

// ---- LED strip along the wall at desk height (pink → violet drift)
const ledMat = new THREE.MeshBasicMaterial({ color: 0xff3fa8 });
const strip = new THREE.Mesh(new THREE.BoxGeometry(DESK.w, 0.12, 0.12), ledMat);
strip.position.set(0, 0.12, WALL_Z + 0.15);
strip.userData.noAO = true;
ground.add(strip);
const ledLights = [-11, -1, 9].map((x) => {
  const l = new THREE.PointLight(0xff3fa8, 9, 9, 1.6);
  l.position.set(x, 0.7, WALL_Z + 1.0);
  ground.add(l);
  return l;
});
const ledCol = new THREE.Color();
onFrame((t) => {
  ledCol.setHSL(0.9 + 0.05 * Math.sin(t * 0.35), 1, 0.56);
  ledMat.color.copy(ledCol);
  ledLights.forEach((l) => l.color.copy(ledCol));
});

// fairy lights across the wall
lightString([-17, 9.8, WALL_Z + 0.3], [1.5, 10.6, WALL_Z + 0.3], {
  n: 16,
  sag: 0.9,
  colors: [0xffd27a, 0xfff0c4],
});

// ---------------------------------------------------------------- monitor
// big gaming monitor behind the stage on the left, its screen glows blue
export const MON = { x: -4.6, z: -5.6 };
{
  const g = new THREE.Group();
  g.position.set(MON.x, 0, MON.z);
  g.rotation.y = 0.22;
  ground.add(g);
  const dark = flat(0x1c1d26, { roughness: 0.35, metalness: 0.3 });
  const foot = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 1.3), dark);
  foot.position.y = 0.06;
  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.2, 0.25), dark);
  neck.position.set(0, 1.15, -0.3);
  const bezel = new THREE.Mesh(new THREE.BoxGeometry(7.4, 4.4, 0.3), dark);
  bezel.position.set(0, 3.3, -0.2);
  for (const m of [foot, neck, bezel]) {
    m.castShadow = true;
    g.add(m);
  }
  // screen: a stylised game — dark sky, neon hills, a HUD bar
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 300;
  const x = c.getContext("2d");
  const grad = x.createLinearGradient(0, 0, 0, 300);
  grad.addColorStop(0, "#0b2a6b");
  grad.addColorStop(1, "#2a7bff");
  x.fillStyle = grad;
  x.fillRect(0, 0, 512, 300);
  x.fillStyle = "#13d6ff";
  x.beginPath();
  x.moveTo(0, 230);
  for (let i = 0; i <= 16; i++) x.lineTo(i * 32, 200 + Math.sin(i * 1.3) * 26);
  x.lineTo(512, 300);
  x.lineTo(0, 300);
  x.fill();
  x.fillStyle = "#0a1a44";
  x.fillRect(0, 250, 512, 50);
  x.fillStyle = "#ff3fa8";
  x.fillRect(24, 22, 150, 14);
  x.fillStyle = "#3dff7a";
  x.fillRect(24, 44, 96, 14);
  x.fillStyle = "#ffffff";
  for (let i = 0; i < 18; i++) x.fillRect((i * 97) % 500, 70 + ((i * 53) % 90), 3, 3);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const screenMat = new THREE.MeshBasicMaterial({ map: tex });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(7.0, 4.0), screenMat);
  screen.position.set(0, 3.3, -0.04);
  screen.userData.noAO = true;
  g.add(screen);
  const glow = new THREE.PointLight(0x4f8dff, 22, 14, 1.5);
  glow.position.set(0, 3.2, 1.6);
  g.add(glow);
  onFrame((t) => {
    const f = 0.88 + 0.08 * Math.sin(t * 2.3) + 0.04 * Math.sin(t * 17.1);
    screenMat.color.setScalar(f);
    glow.intensity = 22 * f;
  });
  // sticky notes on the bezel
  [
    [-3.2, 1.6, 0xffe066, 0.1],
    [3.3, 1.5, 0xff9ec4, -0.12],
  ].forEach(([sx, sy, col, rz]) => {
    const n = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.02), flat(col));
    n.position.set(sx, 3.3 + sy, -0.03);
    n.rotation.z = rz;
    g.add(n);
  });
}

// ---------------------------------------------------------------- desk lamp
// warm architect lamp on the far left, its cone lights the stage
{
  const g = new THREE.Group();
  g.position.set(-10.5, 0, -4.2);
  ground.add(g);
  const metal = flat(0xff8a3d, { roughness: 0.35, metalness: 0.2 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 0.25, 16), metal);
  base.position.y = 0.12;
  const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 4.2, 8), metal);
  arm1.position.set(0.5, 2.1, 0);
  arm1.rotation.z = -0.25;
  const arm2 = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 3.4, 8), metal);
  arm2.position.set(2.2, 4.4, 0.6);
  arm2.rotation.z = -1.1;
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.3, 16, 1, true), metal);
  head.position.set(3.7, 4.7, 1.0);
  head.rotation.set(0.3, 0, 0.9);
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0xfff1c9 }),
  );
  bulb.position.set(3.95, 4.4, 1.1);
  for (const m of [base, arm1, arm2, head]) {
    m.castShadow = true;
    g.add(m);
  }
  g.add(bulb);
  const spot = new THREE.SpotLight(0xffc98a, 60, 30, 0.6, 0.7, 1.4);
  spot.position.set(-6.4, 4.4, -3.0);
  spot.target.position.set(0, 0.5, 0.5);
  spot.castShadow = true;
  spot.shadow.mapSize.set(2048, 2048);
  spot.shadow.bias = -0.0005;
  ground.add(spot, spot.target);
}
// dust drifting in the lamp light
fireflies(60, { area: [-6, 4, 0.4, 5, -4, 3], color: 0xffe3b0, size: 0.02, seed: SEED });

// ---------------------------------------------------------------- shelf on the wall
{
  const plank = add(new THREE.Mesh(new THREE.BoxGeometry(7, 0.22, 1.2), M.wood), -12.5, 6.4, -7.4);
  plank.receiveShadow = true;
  let x = -15.6;
  for (let i = 0; i < 9; i++) {
    const h = 1.0 + r() * 0.7;
    const w = 0.28 + r() * 0.2;
    const col = [0xff5f6d, 0x4fc3ff, 0xffd23f, 0x7c5cff, 0x3ddc97][i % 5];
    const b = add(
      new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.9), flat(col)),
      x,
      6.5 + h / 2,
      -7.4,
    );
    b.rotation.z = i === 6 ? 0.25 : 0;
    x += w + 0.04;
  }
  // a little cactus and a game figure on the shelf
  add(
    new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.3, 0.5, 10), flat(0xc0683f)),
    -10.6,
    6.76,
    -7.4,
  );
  add(F(new THREE.CapsuleGeometry(0.22, 0.5, 3, 8), flat(0x3f9a4a), 0.06, 3), -10.6, 7.4, -7.4);
  add(F(new THREE.IcosahedronGeometry(0.4, 0), flat(0xff3fa8), 0.05, 5), -9.6, 6.9, -7.4);
}
// a poster on the wall, right of the monitor
{
  const p = new THREE.Mesh(new THREE.BoxGeometry(3.2, 4.4, 0.08), flat(0x15172a));
  p.position.set(-0.2, 7.4, WALL_Z + 0.06);
  ground.add(p);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.9, 0.12, 6, 24),
    new THREE.MeshBasicMaterial({ color: 0x3dd6ff }),
  );
  ring.position.set(-0.2, 7.7, WALL_Z + 0.12);
  ground.add(ring);
  const bar = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.25, 0.04),
    new THREE.MeshBasicMaterial({ color: 0xff3fa8 }),
  );
  bar.position.set(-0.2, 6.0, WALL_Z + 0.12);
  ground.add(bar);
}

// ---------------------------------------------------------------- desk props
const dark = flat(0x22232d, { roughness: 0.4 });
// keyboard in front (foreground layer), RGB-ish keys
{
  const g = new THREE.Group();
  g.position.set(-2.4, 0, 4.6);
  g.rotation.y = 0.08;
  ground.add(g);
  const body = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.3, 2.0), dark);
  body.position.y = 0.15;
  body.castShadow = true;
  g.add(body);
  const keys = [];
  for (let row = 0; row < 4; row++)
    for (let k = 0; k < 14; k++) keys.push([-2.75 + k * 0.42, -0.62 + row * 0.42]);
  const keyMesh = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.34, 0.14, 0.34),
    flat(0x2e3040, { roughness: 0.5 }),
    keys.length,
  );
  const m4 = new THREE.Matrix4();
  const cc = new THREE.Color();
  keys.forEach(([kx, kz], i) => {
    keyMesh.setMatrixAt(i, m4.makeTranslation(kx, 0.36, kz));
    keyMesh.setColorAt(i, cc.setHSL((kx + 3) / 7, 0.55, 0.32));
  });
  g.add(keyMesh);
}
// mouse + pad
add(new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.05, 2.6), flat(0x16161e)), 5.2, 0.03, 4.6);
add(F(new THREE.SphereGeometry(0.42, 10, 8), dark, 0.05, 7), 5.4, 0.18, 4.6).scale.set(
  0.8,
  0.45,
  1.25,
);
// headphones lying on the desk
{
  const hp = new THREE.Group();
  hp.position.set(-8.2, 0.25, 1.2);
  hp.rotation.set(-Math.PI / 2 + 0.1, 0, 0.5);
  ground.add(hp);
  const band = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.13, 8, 20, Math.PI), dark);
  hp.add(band);
  for (const sx of [-1, 1]) {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.32, 14), dark);
    cup.position.set(sx * 1.0, -0.05, 0);
    cup.rotation.z = Math.PI / 2;
    hp.add(cup);
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 0.05, 14),
      new THREE.MeshBasicMaterial({ color: 0xff3fa8 }),
    );
    pad.position.set(sx * 1.18, -0.05, 0);
    pad.rotation.z = Math.PI / 2;
    hp.add(pad);
  }
  hp.traverse((m) => (m.castShadow = true));
}
// pizza box, lid half open, one slice left
{
  const g = new THREE.Group();
  g.position.set(9.6, 0, 1.6);
  g.rotation.y = -0.35;
  ground.add(g);
  const card = flat(0xd8b27a, { roughness: 0.9 });
  const box = new THREE.Mesh(facet(new THREE.BoxGeometry(4.2, 0.35, 4.2), 0.05, 2), facetMat(card));
  box.position.y = 0.18;
  box.castShadow = true;
  g.add(box);
  const lid = new THREE.Group();
  lid.position.set(0, 0.35, -2.1);
  lid.rotation.x = -1.15;
  g.add(lid);
  const lidM = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.08, 4.2), card);
  lidM.position.z = 2.1;
  lidM.castShadow = true;
  lid.add(lidM);
  const slice = new THREE.Shape();
  slice.moveTo(0, 0);
  slice.lineTo(1.6, 0.5);
  slice.lineTo(1.5, -0.5);
  slice.closePath();
  const sl = new THREE.Mesh(
    new THREE.ExtrudeGeometry(slice, { depth: 0.12, bevelEnabled: false }),
    flat(0xffc44d),
  );
  sl.rotation.x = -Math.PI / 2;
  sl.position.set(-0.8, 0.38, 0.4);
  g.add(sl);
  for (const [px, pz] of [
    [0.1, 0.25],
    [0.6, 0.05],
    [0.4, 0.5],
  ]) {
    const pep = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.04, 10), flat(0xc8322a));
    pep.position.set(-0.8 + px, 0.52, 0.4 - pz);
    g.add(pep);
  }
}
// mug with pens, a phone face down, crumpled paper
add(F(new THREE.CylinderGeometry(0.55, 0.5, 1.1, 14), flat(0x4fc3ff), 0.05, 3), -9.8, 0.55, 3.8);
for (let i = 0; i < 3; i++) {
  const pen = add(
    new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 1.5, 6),
      flat([0xff5f6d, 0xffd23f, 0xffffff][i]),
    ),
    -9.8 + (i - 1) * 0.18,
    1.3,
    3.8,
  );
  pen.rotation.z = (i - 1) * 0.25;
}
add(new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 1.8), dark), 7.0, 0.04, -1.2).rotation.y = 0.4;
for (let i = 0; i < 3; i++)
  add(
    F(new THREE.IcosahedronGeometry(0.35, 0), flat(0xf4f1ea), 0.1, 30 + i),
    -12.4 + i * 0.7,
    0.3,
    2.6 - i * 0.4,
  );

// ---------------------------------------------------------------- coffee plant (Übrigens)
// on the desk by the window: glossy dark leaves, red coffee cherries
export const PLANT = { x: 10.2, z: -5.6, leafTop: [9.2, 2.55, -4.3] };
{
  const g = new THREE.Group();
  g.position.set(PLANT.x, 0, PLANT.z);
  ground.add(g);
  const pot = new THREE.Mesh(
    facet(new THREE.CylinderGeometry(0.95, 0.75, 1.3, 12), 0.06, 4),
    facetMat(flat(0xe9e2d4, { roughness: 0.6 })),
  );
  pot.position.y = 0.65;
  pot.castShadow = true;
  g.add(pot);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 2.6, 6), flat(0x6b4a2b));
  stem.position.y = 2.4;
  g.add(stem);
  const leafMat = flat(0x2f7d3a, { roughness: 0.25 });
  const leafGeo = new THREE.SphereGeometry(0.5, 8, 6);
  for (let i = 0; i < 11; i++) {
    const a = i * 2.39;
    const y = 1.6 + (i / 11) * 2.0;
    const leaf = new THREE.Mesh(facet(leafGeo.clone(), 0.08, 40 + i), facetMat(leafMat));
    leaf.scale.set(0.5, 0.12, 1.25);
    leaf.position.set(Math.cos(a) * 0.55, y, Math.sin(a) * 0.55);
    leaf.rotation.set(0.25, -a, 0.35);
    leaf.castShadow = true;
    g.add(leaf);
  }
  for (let i = 0; i < 7; i++) {
    const b = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 8, 6),
      flat(0xc8202a, { roughness: 0.3 }),
    );
    b.position.set(Math.cos(i * 1.3) * 0.18, 2.0 + i * 0.22, Math.sin(i * 1.3) * 0.18);
    g.add(b);
  }
  // the big leaf in front where the beetle sits (scene.js)
  const big = new THREE.Mesh(facet(leafGeo.clone(), 0.06, 77), facetMat(leafMat));
  big.scale.set(0.9, 0.12, 1.6);
  big.position.set(PLANT.leafTop[0] - PLANT.x, PLANT.leafTop[1] - 0.06, PLANT.leafTop[2] - PLANT.z);
  big.rotation.set(0.1, 0.6, 0.05);
  big.castShadow = true;
  big.receiveShadow = true;
  g.add(big);
}

scene.fog = new THREE.Fog(0x0b0c18, 40, 130);
finishSet({ ground: 0x3a2a24 });
