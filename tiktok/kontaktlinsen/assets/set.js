// #59 Kontaktlinsen — a bedroom at night, seen from pillow height.
// Moonlight falls through the big window behind the bed, a fairy-light
// string glows on the headboard, the bedside lamp is still on at frame 0
// (the hand switches it off). Hero piece: the window with the moon over the
// city roofs. Props: nightstand with lens case, phone, glass of water, dice;
// a chair with a hoodie, slippers, books, a plant, a poster.
// Life: curtains breathe, dust drifts in the moonbeam, the phone pulses,
// windows across the street blink, a plane crosses the sky.
//
// Units: the sleeper's head is ~0.9 tall (toy scale, 1 unit ≈ 0.25 m).
// The bed's pillow end sits at the origin; the eye cross-section stage
// (scene.js) lives far away at CUT and has its own backdrop.
import { THREE, flat, ground, onFrame, rng, jitter, facet, facetMat } from "./world.js";
import { SKIES, setSky, finishSet, F, add, fireflies, lightString } from "./environments.js";

const SEED = 59;

// ---------------------------------------------------------------- light
// own night palette: deep navy, a violet city glow at the horizon; the key
// light is the moon, shining in through the window onto the pillow
const sky = setSky({
  ...SKIES.nacht,
  top: [0.02, 0.03, 0.12],
  mid: [0.07, 0.08, 0.26],
  hor: [0.36, 0.24, 0.48],
  below: [0.05, 0.05, 0.12],
  sunDir: [0.42, 0.5, -1],
  sun: [0.85, 0.9, 1.0],
  hemi: [0x7f8fe0, 0x2a2238, 1.25],
  key: [0xc4d2ff, 2.4],
  keyPos: [10.8, 8.4, -13],
  rim: [0x7a6bff, 0.6],
  fog: [30, 140],
  clouds: 7,
  birds: false,
  stars: 0.9,
});

const r = rng(SEED);
const box = (w, h, d, mat, x, y, z, amt = 0.06, seed = 1) => {
  const m = F(new THREE.BoxGeometry(w, h, d, 2, 2, 2), mat, amt, seed);
  add(m, x, y, z);
  return m;
};

// ---------------------------------------------------------------- room shell
// floor: oak planks in strips (each a little different)
{
  const woods = [0x9c6b45, 0xa87650, 0x8f603e, 0xb07d55];
  for (let i = 0; i < 22; i++) {
    const z = -5 + i * 0.62 + 0.31;
    const m = F(
      new THREE.BoxGeometry(19, 0.12, 0.6, 12, 1, 1),
      flat(woods[i % 4], { roughness: 0.55 }),
      0.07,
      SEED + i,
    );
    add(m, 2 + (r() - 0.5) * 0.6, -0.06, z);
  }
}
// rug under the bed, sticking out at the front
{
  const geo = new THREE.CylinderGeometry(1, 1, 0.05, 28, 1);
  geo.scale(5.2, 1, 3.3);
  const rug = F(geo, flat(0xd9c4a8, { roughness: 1 }), 0.05, 4);
  add(rug, 2.6, 0.03, 2.2);
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.025, 4, 48),
    flat(0xb5523b, { roughness: 1 }),
  );
  rim.rotation.x = Math.PI / 2;
  rim.scale.set(4.9, 3.05, 1);
  add(rim, 2.6, 0.07, 2.2, false);
}

// back wall with a big window hole (x 1.6..7.2, y 2.7..7.6)
const wallMat = flat(0x3f4a78, { roughness: 0.95 });
const WZ = -5.2;
box(8.6, 10, 0.4, wallMat, -2.7, 5, WZ, 0.04, 1); // left of the window
box(4.2, 10, 0.4, wallMat, 9.3, 5, WZ, 0.04, 2); // right
box(5.6, 2.7, 0.4, wallMat, 4.4, 1.35, WZ, 0.04, 3); // below
box(5.6, 2.4, 0.4, wallMat, 4.4, 8.8, WZ, 0.04, 4); // above
// side wall on the left
box(0.4, 10, 14, flat(0x46507f, { roughness: 0.95 }), -7, 5, 1.8, 0.04, 5);
// skirting
box(18.4, 0.35, 0.12, flat(0xe9e2d6), 2.2, 0.17, WZ + 0.26, 0.03, 6);
box(0.12, 0.35, 13.5, flat(0xe9e2d6), -6.74, 0.17, 1.8, 0.03, 7);

// window frame, cross bars, sill
{
  const white = flat(0xf3eee6, { roughness: 0.6 });
  const g = new THREE.Group();
  const bar = (w, h, x, y) => {
    const m = F(new THREE.BoxGeometry(w, h, 0.32), white, 0.03, 9);
    m.position.set(x, y, 0);
    g.add(m);
  };
  bar(5.8, 0.22, 4.4, 2.7);
  bar(5.8, 0.22, 4.4, 7.6);
  bar(0.22, 5.1, 1.6, 5.15);
  bar(0.22, 5.1, 7.2, 5.15);
  bar(0.14, 4.9, 4.4, 5.15);
  bar(5.6, 0.14, 4.4, 5.6);
  g.position.z = WZ + 0.1;
  g.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  ground.add(g);
  box(6.4, 0.18, 0.9, white, 4.4, 2.62, WZ + 0.45, 0.03, 10);
  // a pot plant and a candle jar on the sill
  const pot = F(new THREE.CylinderGeometry(0.28, 0.22, 0.45, 8), flat(0xd77a5a), 0.08, 11);
  add(pot, 2.4, 2.94, WZ + 0.5);
  for (let i = 0; i < 7; i++) {
    const leaf = F(
      jitter(new THREE.ConeGeometry(0.12, 0.9, 4), 0.02, 12 + i),
      flat(i % 2 ? 0x4f9a4a : 0x3f8a42),
      0.1,
      12 + i,
    );
    const a = (i / 7) * Math.PI * 2;
    leaf.position.set(2.4 + Math.cos(a) * 0.1, 3.5, WZ + 0.5 + Math.sin(a) * 0.1);
    leaf.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5);
    ground.add(leaf);
  }
}

// curtains: two soft panels that breathe in the draught
const curtains = [];
{
  const mat = new THREE.MeshStandardMaterial({
    color: 0xc98a8a,
    roughness: 0.95,
    side: THREE.DoubleSide,
    flatShading: true,
  });
  for (const [x, w] of [
    [0.9, 1.6],
    [7.9, 1.6],
  ]) {
    const geo = new THREE.PlaneGeometry(w, 6.6, 8, 14);
    const base = geo.attributes.position.array.slice();
    const m = new THREE.Mesh(facet(geo, 0.06, Math.round(x * 10)), facetMat(mat));
    m.position.set(x, 5.0, WZ + 0.55);
    m.castShadow = true;
    ground.add(m);
    curtains.push({ m, geo, base, ph: x });
  }
  // rod
  const rod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 8.6, 8),
    flat(0x2d2a2a, { metalness: 0.5, roughness: 0.4 }),
  );
  rod.rotation.z = Math.PI / 2;
  add(rod, 4.4, 8.35, WZ + 0.55, false);
}
onFrame((t) => {
  for (const { geo, base, ph } of curtains) {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 3];
      const y = base[i * 3 + 1];
      const fold = Math.sin(x * 7 + ph) * 0.12;
      const low = (3.3 - y) / 6.6; // 0 at the rod, 1 at the hem
      const breathe = Math.sin(t * 0.9 + ph + y * 0.6) * 0.22 * low * low;
      p.setZ(i, fold + breathe);
    }
    p.needsUpdate = true;
    geo.computeVertexNormals();
  }
});

// ---------------------------------------------------------------- outside
// city across the street: roof line + lit windows, a big moon, a plane
{
  const r2 = rng(SEED + 5);
  const facade = [0x2a2f55, 0x332d5a, 0x26294a, 0x3a3566];
  const winOn = new THREE.MeshBasicMaterial({ color: 0xffc977, fog: false });
  const winBlue = new THREE.MeshBasicMaterial({ color: 0x9fc3ff, fog: false });
  const blinkers = [];
  let x = -14;
  let k = 0;
  while (x < 26) {
    const w = 3 + r2() * 3.5;
    const h = 9 + r2() * 14;
    const z = -34 - r2() * 10;
    const b = F(
      new THREE.BoxGeometry(w, h, 4),
      flat(facade[k % 4], { roughness: 1 }),
      0.05,
      20 + k,
    );
    b.position.set(x + w / 2, h / 2 - 4, z);
    ground.add(b);
    // roof hat
    if (r2() > 0.5) {
      const roof = F(new THREE.ConeGeometry(w * 0.72, 2.2, 4), flat(0x1d1f3a), 0.06, 40 + k);
      roof.rotation.y = Math.PI / 4;
      roof.position.set(x + w / 2, h - 4 + 1.1, z);
      ground.add(roof);
    }
    for (let yy = 0; yy < h - 2; yy += 1.6) {
      for (let xx = 0.6; xx < w - 0.5; xx += 1.1) {
        if (r2() < 0.32) {
          const win = new THREE.Mesh(
            new THREE.PlaneGeometry(0.55, 0.75),
            r2() < 0.25 ? winBlue : winOn,
          );
          win.position.set(x + xx, yy - 3, z + 2.02);
          win.userData.noAO = true;
          ground.add(win);
          if (r2() < 0.18) blinkers.push({ win, ph: r2() * 40 });
        }
      }
    }
    x += w + 0.4 + r2() * 1.5;
    k++;
  }
  onFrame((t) => {
    for (const { win, ph } of blinkers) win.visible = Math.sin(t * 0.35 + ph) > -0.6;
  });
  // the moon
  const moon = new THREE.Mesh(
    new THREE.IcosahedronGeometry(4.2, 2),
    new THREE.MeshBasicMaterial({ color: 0xfff6dc, fog: false }),
  );
  moon.position.set(30, 38, -80);
  moon.userData.noAO = true;
  ground.add(moon);
  const craterMat = new THREE.MeshBasicMaterial({ color: 0xe6dcc0, fog: false });
  for (const [cx, cy, s] of [
    [-1.2, 1.1, 0.9],
    [1.3, -0.6, 1.2],
    [0.2, -1.8, 0.6],
  ]) {
    const c = new THREE.Mesh(new THREE.CircleGeometry(s, 10), craterMat);
    c.position.set(30 + cx, 38 + cy, -75.7);
    ground.add(c);
  }
  // a plane with a blinking light crossing the sky
  const plane = new THREE.Group();
  const blink = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 6, 4),
    new THREE.MeshBasicMaterial({ color: 0xff3b3b, fog: false }),
  );
  plane.add(blink);
  const white = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 6, 4),
    new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }),
  );
  white.position.x = 0.9;
  plane.add(white);
  ground.add(plane);
  onFrame((t) => {
    plane.position.set(-30 + ((t * 1.6) % 70), 30 + Math.sin(t * 0.05) * 2, -70);
    blink.visible = t % 1.2 < 0.25;
    white.visible = (t + 0.6) % 1.2 < 0.15;
  });
}

// ---------------------------------------------------------------- bed
export const MATTRESS_TOP = 1.9;
{
  const woodBed = flat(0x7a5236, { roughness: 0.6 });
  box(8.4, 1.0, 6.0, woodBed, 2.5, 0.5, 0, 0.05, 30); // frame
  for (const [x, z] of [
    [-1.5, -2.8],
    [-1.5, 2.8],
    [6.5, -2.8],
    [6.5, 2.8],
  ])
    box(0.3, 0.25, 0.3, woodBed, x, 0.12, z, 0.04, 31);
  // mattress
  const mat = F(
    jitter(new THREE.BoxGeometry(8.1, 0.9, 5.8, 10, 2, 8), 0.02, 32),
    flat(0xf4efe7, { roughness: 0.9 }),
    0.05,
    32,
  );
  add(mat, 2.55, 1.45, 0);
  // headboard: upholstered, sage green, buttons
  const hb = F(
    jitter(new THREE.BoxGeometry(0.5, 3.4, 6.2, 2, 6, 10), 0.03, 33),
    flat(0x6f8f78, { roughness: 0.95 }),
    0.06,
    33,
  );
  add(hb, -1.95, 2.6, 0);
  const btnMat = flat(0x587562);
  for (let j = 0; j < 3; j++)
    for (let i = 0; i < 6; i++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), btnMat);
      b.position.set(-1.68, 2.1 + j * 0.85, -2.5 + i * 1.0 + (j % 2) * 0.5);
      ground.add(b);
    }
  // fairy lights over the headboard, warm
  lightString([-1.6, 4.25, -3.0], [-1.6, 4.25, 3.0], {
    n: 16,
    sag: 0.45,
    colors: [0xffc066, 0xffe3a8, 0xff9b5a],
    glow: 2.2,
  });
  const warm = new THREE.PointLight(0xffb066, 6, 9, 1.6);
  warm.position.set(-1.0, 3.9, 0.6);
  ground.add(warm);
}

// pillow under the head (the head itself is built in scene.js)
{
  const geo = jitter(new THREE.SphereGeometry(1, 16, 10), 0.03, 34);
  geo.scale(1.2, 0.36, 1.9);
  const pillow = F(geo, flat(0xf7f2ea, { roughness: 0.95 }), 0.05, 34);
  add(pillow, -0.45, MATTRESS_TOP + 0.3, 0.1);
  const geo2 = jitter(new THREE.SphereGeometry(1, 14, 8), 0.03, 35);
  geo2.scale(1.0, 0.3, 1.6);
  const p2 = F(geo2, flat(0xc9b6e0, { roughness: 0.95 }), 0.05, 35);
  p2.rotation.z = 0.5;
  add(p2, -1.2, MATTRESS_TOP + 0.6, -1.4);
}

// duvet: a lilac mound over the sleeper, folds, a bump for the shoulder
export const duvet = (() => {
  const geo = new THREE.PlaneGeometry(6.8, 6.4, 34, 30);
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const z = p.getZ(i);
    const ex = Math.max(0, Math.abs(z) - 2.6); // falls over the sides
    let y = 0.45 - ex * 1.3;
    // body under it: shoulder near the head, hip, legs
    const body = (cx, cz, rx, rz, h) =>
      h * Math.exp(-((x - cx) ** 2) / (2 * rx * rx) - (z - cz) ** 2 / (2 * rz * rz));
    y +=
      body(-2.5, 0.15, 0.55, 1.1, 0.5) +
      body(-0.6, 0.0, 1.0, 1.2, 0.55) +
      body(1.6, 0.1, 1.6, 0.9, 0.35);
    y += Math.sin(x * 2.1 + z * 0.7) * 0.05 + Math.sin(z * 3.1 - x) * 0.04;
    p.setY(i, Math.max(y, -1.1));
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(
    facet(geo, 0.06, 36),
    facetMat(
      new THREE.MeshStandardMaterial({
        color: 0xb7a3d9,
        roughness: 0.95,
        flatShading: true,
        side: THREE.DoubleSide,
      }),
    ),
  );
  m.position.set(3.9, MATTRESS_TOP, 0);
  m.castShadow = m.receiveShadow = true;
  ground.add(m);
  return m;
})();

// ---------------------------------------------------------------- nightstand
export const STAND = [-0.6, 2.3, -4.0]; // top centre
{
  const wood = flat(0xc89a6a, { roughness: 0.6 });
  box(2.4, 2.2, 1.6, wood, STAND[0], 1.1, STAND[2], 0.05, 40);
  box(2.0, 0.7, 0.05, flat(0xb4875a), STAND[0], 1.5, STAND[2] + 0.81, 0.04, 41);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 4), flat(0x3d2c22));
  add(knob, STAND[0], 1.5, STAND[2] + 0.86, false);
  // glass of water
  const glass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.17, 0.15, 0.55, 12, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0xdff2ff,
      roughness: 0.05,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    }),
  );
  add(glass, STAND[0] + 0.85, STAND[1] + 0.28, STAND[2] - 0.35, false);
  const water = new THREE.Mesh(
    new THREE.CylinderGeometry(0.155, 0.145, 0.32, 12),
    new THREE.MeshStandardMaterial({
      color: 0x8fd0ff,
      roughness: 0.05,
      transparent: true,
      opacity: 0.55,
    }),
  );
  add(water, STAND[0] + 0.85, STAND[1] + 0.17, STAND[2] - 0.35, false);
  // books under the lamp
  box(1.0, 0.14, 0.7, flat(0x2f6f9e), STAND[0] - 0.55, STAND[1] + 0.07, STAND[2] - 0.25, 0.05, 42);
  box(0.9, 0.12, 0.65, flat(0xe0b040), STAND[0] - 0.55, STAND[1] + 0.2, STAND[2] - 0.22, 0.05, 43);
}

// ---------------------------------------------------------------- foreground + room dressing
{
  // slippers on the rug in front of the bed
  const slip = (x, z, ry) => {
    const g = new THREE.Group();
    const sole = F(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 10), flat(0x6b5a8c), 0.05, 50);
    sole.scale.set(1, 1, 2.1);
    g.add(sole);
    const top = F(
      new THREE.SphereGeometry(0.22, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2),
      flat(0xf2d5e6),
      0.06,
      51,
    );
    top.scale.set(1, 0.7, 1.3);
    top.position.z = 0.15;
    g.add(top);
    g.position.set(x, 0.1, z);
    g.rotation.y = ry;
    g.traverse((o) => o.isMesh && (o.castShadow = true));
    ground.add(g);
  };
  slip(-0.2, 4.4, 0.3);
  slip(0.5, 4.9, -0.2);
  // chair with a hoodie hung over it, front left
  const chairWood = flat(0x5b4a3e);
  box(1.4, 0.15, 1.4, chairWood, -4.6, 1.6, 4.0, 0.05, 52);
  for (const [dx, dz] of [
    [-0.6, -0.6],
    [0.6, -0.6],
    [-0.6, 0.6],
    [0.6, 0.6],
  ])
    box(0.12, 1.6, 0.12, chairWood, -4.6 + dx, 0.8, 4.0 + dz, 0.04, 53);
  box(1.4, 1.6, 0.14, chairWood, -4.6, 2.45, 3.33, 0.04, 54);
  const hoodie = F(
    jitter(new THREE.BoxGeometry(1.5, 1.4, 0.5, 4, 4, 2), 0.08, 55),
    flat(0xe8743b, { roughness: 1 }),
    0.08,
    55,
  );
  hoodie.rotation.x = 0.15;
  add(hoodie, -4.6, 2.5, 3.4);
  // books + a mug on the floor by the chair
  box(1.1, 0.18, 0.8, flat(0x8a3b4b), -4.2, 0.09, 5.6, 0.05, 56);
  box(1.0, 0.16, 0.75, flat(0xeee3cf), -4.15, 0.26, 5.55, 0.05, 57);
  // shelf + poster on the left wall
  box(0.7, 0.12, 3.2, flat(0xc89a6a), -6.45, 5.2, -1.5, 0.04, 58);
  const bookCols = [0xd65a4a, 0x3f7fbf, 0xf0c04a, 0x5aa070, 0xe6e0d4];
  for (let i = 0; i < 9; i++) {
    const h = 0.55 + r() * 0.35;
    box(0.5, h, 0.18, flat(bookCols[i % 5]), -6.45, 5.26 + h / 2, -2.8 + i * 0.22, 0.05, 60 + i);
  }
  const frame = F(new THREE.BoxGeometry(0.08, 2.4, 1.8), flat(0x1e1e26), 0.03, 70);
  add(frame, -6.76, 3.3, 2.0);
  const poster = new THREE.Mesh(
    new THREE.PlaneGeometry(1.55, 2.15),
    flat(0xf3b562, { roughness: 1 }),
  );
  poster.rotation.y = Math.PI / 2;
  poster.position.set(-6.7, 3.3, 2.0);
  ground.add(poster);
  const sun = new THREE.Mesh(new THREE.CircleGeometry(0.42, 16), flat(0xe8543d));
  sun.rotation.y = Math.PI / 2;
  sun.position.set(-6.68, 3.6, 2.0);
  ground.add(sun);
  const hill = new THREE.Mesh(new THREE.CircleGeometry(0.9, 16, 0, Math.PI), flat(0x3b6e8f));
  hill.rotation.y = Math.PI / 2;
  hill.position.set(-6.67, 2.5, 2.0);
  ground.add(hill);
  // big floor plant at the right of the window
  const pot = F(new THREE.CylinderGeometry(0.55, 0.45, 1.0, 9), flat(0xeae4da), 0.06, 80);
  add(pot, 9.0, 0.5, -3.8);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const leaf = F(
      jitter(new THREE.SphereGeometry(0.6, 6, 4), 0.05, 81 + i),
      flat(i % 2 ? 0x3f8a52 : 0x2f7445),
      0.1,
      81 + i,
    );
    leaf.scale.set(0.5, 1.2, 0.25);
    leaf.position.set(9.0 + Math.cos(a) * 0.5, 2.0 + (i % 3) * 0.5, -3.8 + Math.sin(a) * 0.5);
    leaf.rotation.set(Math.sin(a) * 0.6, a, -Math.cos(a) * 0.6);
    leaf.castShadow = true;
    ground.add(leaf);
  }
}

// ---------------------------------------------------------------- life
// dust drifting in the moonbeam between window and pillow
fireflies(60, { area: [-1, 6, 2.4, 7.0, -4.8, 1.5], color: 0xdfe6ff, size: 0.02, seed: SEED });

finishSet({ ground: 0x6a4a34 });
export { sky };
