// #97 Handy-Nacken — a bedroom at night, you on the bed with your phone.
// Deep petrol walls, warm bedside lamp, fairy lights over an upholstered
// headboard, a tall window on the left wall with the city skyline and a
// full moon (hero piece), wooden plank floor with a round rug, a chair with
// a hoodie, a plant, posters, a wall clock (its hands race in the time-lapse).
// Life: fairy lights twinkle, curtains sway, dust motes in the lamp light,
// city windows blink, the phone flickers (scene.js).
// Scale: 2 units = 1 m. Mattress top y = 1.1, the person sits at x = 0,
// hip z ≈ -1.5, facing +z. Walls: back z = -3.0, left x = -3.8,
// right x = 4.9, front z = 5.6, ceiling y = 5.4.
import { THREE, flat, real, roundedBox, scene, ground, onFrame, rng } from "./world.js";
import { SKIES, setSky, finishSet, lightString, fireflies } from "./environments.js";

setSky({
  ...SKIES.nacht,
  sunDir: [-0.9, 0.35, 0.2],
  key: [0x9fb6ff, 1.3],
  keyPos: [-12, 9, 2],
  rim: [0x6f8dff, 0.5],
  hemi: [0x7f8fd6, 0x2a2230, 0.9],
  noClouds: true,
  birds: false,
  stars: 0.8,
  fog: [40, 120],
});
for (const o of scene.children) {
  if (o.isDirectionalLight && o.castShadow) {
    Object.assign(o.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 40 });
    o.shadow.camera.updateProjectionMatrix();
  }
}

const R = rng(97);
const mk = (geo, mat, x, y, z, { cast = true, recv = true, parent = ground } = {}) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = cast;
  m.receiveShadow = recv;
  parent.add(m);
  return m;
};
const canvasTex = (w, h, draw) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace;
  tx.anisotropy = 8;
  return tx;
};

// ---------------------------------------------------------------- light
// warm bedside lamp (left of the bed) + a soft warm fill from the fairy lights
export const lampLight = new THREE.PointLight(0xffb468, 16, 9, 1.5);
lampLight.position.set(-2.35, 2.75, -2.3);
lampLight.castShadow = true;
lampLight.shadow.mapSize.set(1024, 1024);
lampLight.shadow.bias = -0.002;
scene.add(lampLight);
const fairyFill = new THREE.PointLight(0xffc98a, 5, 7, 1.6);
fairyFill.position.set(0.5, 4.3, -2.4);
scene.add(fairyFill);
// cool moonlight spilling from the window
const moonSpill = new THREE.SpotLight(0x8fb0ff, 22, 14, 0.75, 0.6, 1.2);
moonSpill.position.set(-4.6, 4.2, 0.4);
moonSpill.target.position.set(0, 1.2, -0.6);
scene.add(moonSpill, moonSpill.target);

// ---------------------------------------------------------------- room shell
const wallTex = canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = "#24484f";
  g.fillRect(0, 0, w, h);
  // soft plaster mottling
  for (let i = 0; i < 1400; i++) {
    g.fillStyle = `rgba(${R() < 0.5 ? "255,255,255" : "0,0,0"},${0.02 + R() * 0.03})`;
    g.beginPath();
    g.arc(R() * w, R() * h, 2 + R() * 10, 0, 7);
    g.fill();
  }
});
wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
const wallM = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.9 });
const trimM = real.plastic(0xe9e3d6, { roughness: 0.6 });
const wall = (w, h, x, y, z, ry) => {
  const m = mk(new THREE.PlaneGeometry(w, h), wallM, x, y, z, { cast: false });
  m.rotation.y = ry;
  return m;
};
wall(10, 5.4, 0.55, 2.7, -3.0, 0); // back
wall(10, 5.4, 0.55, 2.7, 5.6, Math.PI); // front
wall(8.6, 5.4, 4.9, 2.7, 1.3, -Math.PI / 2); // right
// left wall with a window hole: built from 4 pieces around it
const WX = -3.8;
const win = { z0: -1.6, z1: 1.6, y0: 1.5, y1: 4.6 };
const leftPiece = (z0, z1, y0, y1) => {
  const m = mk(new THREE.PlaneGeometry(z1 - z0, y1 - y0), wallM, WX, (y0 + y1) / 2, (z0 + z1) / 2, {
    cast: false,
  });
  m.rotation.y = Math.PI / 2;
};
leftPiece(-3.0, win.z0, 0, 5.4);
leftPiece(win.z1, 5.6, 0, 5.4);
leftPiece(win.z0, win.z1, 0, win.y0);
leftPiece(win.z0, win.z1, win.y1, 5.4);
// ceiling (no shadows, or it would black out the moon key)
{
  const c = mk(new THREE.PlaneGeometry(10, 9), flat(0x1c2b33), 0.55, 5.4, 1.3, {
    cast: false,
    recv: false,
  });
  c.rotation.x = Math.PI / 2;
}
// skirting boards
for (const [w, x, z, ry] of [
  [10, 0.55, -2.97, 0],
  [8.6, 4.87, 1.3, -Math.PI / 2],
]) {
  const b = mk(roundedBox(w, 0.22, 0.05, 0.02), trimM, x, 0.11, z, { cast: false });
  b.rotation.y = ry;
}

// ---------------------------------------------------------------- floor
const plankTex = canvasTex(1024, 1024, (g, w, h) => {
  const rows = 16;
  const rh = h / rows;
  for (let r = 0; r < rows; r++) {
    let x = -R() * 400;
    while (x < w) {
      const len = 260 + R() * 340;
      const v = 0.85 + R() * 0.25;
      g.fillStyle = `rgb(${Math.round(150 * v)},${Math.round(104 * v)},${Math.round(70 * v)})`;
      g.fillRect(x, r * rh, len, rh);
      // grain
      for (let k = 0; k < 9; k++) {
        g.strokeStyle = `rgba(70,40,20,${0.08 + R() * 0.1})`;
        g.lineWidth = 1 + R() * 2;
        g.beginPath();
        const yy = r * rh + R() * rh;
        g.moveTo(x, yy);
        g.bezierCurveTo(x + len * 0.3, yy + 4, x + len * 0.6, yy - 4, x + len, yy + 2);
        g.stroke();
      }
      g.fillStyle = "rgba(40,22,10,.55)";
      g.fillRect(x, r * rh, 3, rh);
      x += len;
    }
    g.fillStyle = "rgba(40,22,10,.6)";
    g.fillRect(0, r * rh, w, 3);
  }
});
plankTex.wrapS = plankTex.wrapT = THREE.RepeatWrapping;
plankTex.repeat.set(2.2, 2.2);
{
  const f = mk(
    new THREE.PlaneGeometry(10, 9),
    new THREE.MeshPhysicalMaterial({
      map: plankTex,
      roughness: 0.42,
      clearcoat: 0.35,
      clearcoatRoughness: 0.3,
    }),
    0.55,
    0,
    1.3,
    { cast: false },
  );
  f.rotation.x = -Math.PI / 2;
}
// round rug beside the bed
{
  const rugTex = canvasTex(512, 512, (g, w) => {
    const c = w / 2;
    const cols = ["#c96f4a", "#e8d6b8", "#7c3f3a", "#e8d6b8", "#c96f4a", "#3e5a5c"];
    cols.forEach((col, i) => {
      g.fillStyle = col;
      g.beginPath();
      g.arc(c, c, c * (1 - i * 0.15), 0, 7);
      g.fill();
    });
    for (let i = 0; i < 4000; i++) {
      g.fillStyle = `rgba(0,0,0,${R() * 0.06})`;
      g.fillRect(R() * w, R() * w, 2, 2);
    }
  });
  const rug = mk(
    new THREE.CylinderGeometry(1.5, 1.5, 0.04, 64),
    real.fabric(0xffffff, { map: rugTex }),
    2.9,
    0.02,
    1.2,
    { cast: false },
  );
  rug.scale.z = 0.8;
}

// ---------------------------------------------------------------- window (hero)
{
  const frameM = real.plastic(0xf1ece2, { roughness: 0.45 });
  const zc = (win.z0 + win.z1) / 2;
  const yc = (win.y0 + win.y1) / 2;
  const W = win.z1 - win.z0;
  const H = win.y1 - win.y0;
  const bar = (w, h, d, y, z) => mk(roundedBox(0.16, h, w, 0.03), frameM, WX + 0.02, y, z);
  bar(W + 0.16, 0.16, 0, win.y0, zc);
  bar(W + 0.16, 0.16, 0, win.y1, zc);
  mk(roundedBox(0.16, H, 0.16, 0.03), frameM, WX + 0.02, yc, win.z0);
  mk(roundedBox(0.16, H, 0.16, 0.03), frameM, WX + 0.02, yc, win.z1);
  mk(roundedBox(0.12, H, 0.1, 0.03), frameM, WX + 0.02, yc, zc); // mullion
  mk(roundedBox(0.12, 0.1, W, 0.03), frameM, WX + 0.02, win.y0 + H * 0.62, zc); // transom
  // sill with a candle and a small cactus
  mk(roundedBox(0.5, 0.08, W + 0.6, 0.03), frameM, WX + 0.2, win.y0 - 0.02, zc);
  mk(
    new THREE.CylinderGeometry(0.09, 0.08, 0.16, 16),
    real.ceramic(0xc4643c),
    WX + 0.22,
    win.y0 + 0.1,
    zc + 0.95,
  );
  mk(
    new THREE.CapsuleGeometry(0.06, 0.14, 6, 12),
    real.plastic(0x4f8a4a, { roughness: 0.8 }),
    WX + 0.22,
    win.y0 + 0.3,
    zc + 0.95,
  );
  // glass with a faint reflection
  const glass = mk(
    new THREE.PlaneGeometry(W, H),
    real.glass(0xbfd4ff, { opacity: 0.12 }),
    WX - 0.02,
    yc,
    zc,
    { cast: false, recv: false },
  );
  glass.rotation.y = Math.PI / 2;
}
// the night city outside: skyline + blinking windows + full moon
export const outside = new THREE.Group();
scene.add(outside);
{
  const city = canvasTex(2048, 1024, (g, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#050a22");
    sky.addColorStop(0.65, "#1a2556");
    sky.addColorStop(1, "#3a3a6a");
    g.fillStyle = sky;
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 180; i++) {
      g.fillStyle = `rgba(255,255,255,${0.3 + R() * 0.6})`;
      g.fillRect(R() * w, R() * h * 0.45, 2, 2);
    }
    // two layers of buildings
    for (const [base, dark, n] of [
      [0.58, "#141a36", 26],
      [0.68, "#0b0f24", 20],
    ]) {
      let x = 0;
      while (x < w) {
        const bw = 60 + R() * 140;
        const bh = h * (0.15 + R() * 0.32);
        const top = h * base - bh + h * 0.3;
        g.fillStyle = dark;
        g.fillRect(x, top, bw, h - top);
        for (let wy = top + 14; wy < h - 10; wy += 22)
          for (let wx = x + 10; wx < x + bw - 10; wx += 18)
            if (R() < 0.34) {
              g.fillStyle = R() < 0.8 ? "#ffcf7a" : "#9fd2ff";
              g.globalAlpha = 0.5 + R() * 0.5;
              g.fillRect(wx, wy, 8, 11);
              g.globalAlpha = 1;
            }
        x += bw + 6;
      }
      void n;
    }
  });
  const back = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 20),
    new THREE.MeshBasicMaterial({ map: city, fog: false, toneMapped: false }),
  );
  back.position.set(-22, 4.5, 0);
  back.rotation.y = Math.PI / 2;
  outside.add(back);
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(1.4, 32, 16),
    new THREE.MeshBasicMaterial({ color: 0xfff4d8, fog: false, toneMapped: false }),
  );
  moon.position.set(-20, 9.5, -2.5);
  outside.add(moon);
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(2.6, 24, 12),
    new THREE.MeshBasicMaterial({ color: 0x9fb6ff, transparent: true, opacity: 0.18, fog: false }),
  );
  halo.position.copy(moon.position);
  outside.add(halo);
  outside.userData = { back, moon };
}
// curtains (sway)
const curtains = [];
{
  const cm = real.fabric(0xd9c6a8, { side: THREE.DoubleSide });
  for (const [z, s] of [
    [win.z0 - 0.45, 1],
    [win.z1 + 0.45, -1],
  ]) {
    const g = new THREE.PlaneGeometry(0.95, 4.4, 12, 24);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      p.setZ(i, Math.sin(x * 14) * 0.07);
    }
    g.computeVertexNormals();
    const c = mk(g, cm, WX + 0.25, 2.75, z, { recv: true });
    c.rotation.y = Math.PI / 2;
    c.userData.s = s;
    curtains.push(c);
  }
  mk(
    new THREE.CylinderGeometry(0.03, 0.03, 4.8, 10),
    real.metal(0x2e2e30),
    WX + 0.25,
    4.98,
    0,
  ).rotation.x = Math.PI / 2;
}

// ---------------------------------------------------------------- bed
const fabricBed = real.fabric(0x8a5a8f); // plum headboard
{
  // frame + mattress
  mk(roundedBox(3.0, 0.5, 4.3, 0.06), real.wood(0x6b4a33), 0, 0.42, -0.65);
  mk(roundedBox(2.8, 0.45, 4.1, 0.14), real.fabric(0xf1ebe2), 0, 0.88, -0.65);
  // fitted sheet
  mk(roundedBox(2.84, 0.12, 4.14, 0.06), real.fabric(0xe7dccd), 0, 1.06, -0.65);
  // upholstered headboard with buttons
  mk(roundedBox(3.2, 2.6, 0.35, 0.16), fabricBed, 0, 1.75, -2.82);
  const btn = real.fabric(0x6d4572);
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 2; j++)
      mk(new THREE.SphereGeometry(0.045, 10, 8), btn, -1.05 + i * 0.7, 2.25 + j * 0.55, -2.63);
  // legs
  for (const x of [-1.35, 1.35])
    for (const z of [-2.7, 1.4])
      mk(new THREE.CylinderGeometry(0.07, 0.05, 0.2, 12), real.wood(0x4e3424), x, 0.1, z);
}
// pillows behind the back
{
  const pm = real.fabric(0xf6efe6);
  const p1 = mk(roundedBox(1.5, 0.95, 0.4, 0.2, 5), pm, -0.65, 1.55, -2.42);
  p1.rotation.x = -0.25;
  p1.scale.set(1, 1, 1.1);
  const p2 = mk(roundedBox(1.5, 0.95, 0.4, 0.2, 5), real.fabric(0xc9b6d6), 0.75, 1.5, -2.36);
  p2.rotation.set(-0.3, 0.05, 0.04);
  const p3 = mk(roundedBox(1.1, 0.7, 0.36, 0.17, 5), real.fabric(0xe8a25a), 0.05, 1.45, -2.05);
  p3.rotation.x = -0.35;
}
// duvet over the legs: a soft lump with folds
{
  const g = new THREE.BoxGeometry(2.9, 0.4, 3.0, 40, 6, 40);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i);
    let y = p.getY(i);
    const z = p.getZ(i);
    const ax = Math.abs(x) / 1.45;
    const fold = Math.sin(z * 3.1 + x * 1.2) * 0.04 + Math.sin(x * 5.0 - z) * 0.025;
    if (y > 0) {
      // legs ridge in the middle, falls off to the sides
      y += 0.2 * Math.exp(-Math.pow(x / 0.55, 2)) + fold - ax * ax * 0.2;
    }
    if (ax > 0.97) {
      y -= 0.15;
      x *= 1.02;
    }
    p.setX(i, x);
    p.setY(i, y);
  }
  g.computeVertexNormals();
  const duvetTex = canvasTex(256, 256, (c, w) => {
    c.fillStyle = "#f3d9c4";
    c.fillRect(0, 0, w, w);
    c.fillStyle = "#e6b99a";
    for (let i = 0; i < 8; i++) c.fillRect(0, i * 32, w, 10);
  });
  duvetTex.wrapS = duvetTex.wrapT = THREE.RepeatWrapping;
  duvetTex.repeat.set(3, 3);
  mk(g, real.fabric(0xffffff, { map: duvetTex }), 0, 1.25, 0.15);
}

// ---------------------------------------------------------------- nightstand + lamp
{
  mk(roundedBox(1.0, 1.15, 0.9, 0.05), real.wood(0x8a6040), -2.3, 0.58, -2.3);
  mk(roundedBox(0.86, 0.04, 0.06, 0.02), real.metal(0xc9a46a), -2.3, 0.85, -1.84);
  // lamp: ceramic base + glowing linen shade
  mk(new THREE.SphereGeometry(0.2, 24, 16), real.ceramic(0x2f6a6f), -2.35, 1.35, -2.4);
  mk(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 8), real.metal(0xb89a6a), -2.35, 1.7, -2.4);
  const shade = mk(
    new THREE.CylinderGeometry(0.28, 0.4, 0.5, 32, 1, true),
    flat(0xffe2b5, { emissive: 0xffa94d, emissiveIntensity: 1.3, side: THREE.DoubleSide }),
    -2.35,
    2.05,
    -2.4,
    { cast: false },
  );
  shade.userData.noAO = true;
  // glass of water + a book
  mk(
    new THREE.CylinderGeometry(0.08, 0.07, 0.25, 20),
    real.glass(0xdff2ff, { opacity: 0.35 }),
    -2.0,
    1.28,
    -2.05,
  );
  mk(roundedBox(0.45, 0.07, 0.32, 0.02), real.plastic(0x3a6bb0), -2.45, 1.19, -2.05);
  // charger cable hanging down
  const pts = [];
  for (let i = 0; i <= 20; i++) {
    const k = i / 20;
    pts.push(new THREE.Vector3(-1.85, 1.16 - Math.sin(k * Math.PI) * 0.55, -2.2 + k * 0.6));
  }
  mk(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.015, 6),
    real.plastic(0xf4f4f4),
    0,
    0,
    0,
  );
}

// ---------------------------------------------------------------- fairy lights
lightString([-1.9, 4.6, -2.92], [2.0, 4.6, -2.92], { n: 18, sag: 0.55 });
lightString([2.0, 4.6, -2.92], [4.85, 4.5, -1.0], { n: 12, sag: 0.4 });
const fairyBulbs = [];
ground.traverse((o) => {
  if (o.isMesh && o.geometry.type === "IcosahedronGeometry" && o.material.emissiveIntensity > 1)
    fairyBulbs.push(o);
});

// ---------------------------------------------------------------- wall decor
// posters on the back wall (right of the bed)
const poster = (x, y, w, h, draw) => {
  mk(roundedBox(w + 0.08, h + 0.08, 0.04, 0.015), real.wood(0x1f1f22), x, y, -2.97, {
    cast: false,
  });
  const p = mk(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({ map: canvasTex(256, 360, draw), roughness: 0.6 }),
    x,
    y,
    -2.94,
    { cast: false },
  );
  return p;
};
poster(2.6, 3.05, 1.0, 1.4, (g, w, h) => {
  g.fillStyle = "#f2c14e";
  g.fillRect(0, 0, w, h);
  g.fillStyle = "#e4572e";
  g.beginPath();
  g.arc(w / 2, h * 0.42, 80, 0, 7);
  g.fill();
  g.fillStyle = "#1d3557";
  g.fillRect(0, h * 0.72, w, h);
});
poster(3.85, 2.75, 0.7, 0.95, (g, w, h) => {
  g.fillStyle = "#a8dadc";
  g.fillRect(0, 0, w, h);
  g.fillStyle = "#457b9d";
  for (let i = 0; i < 5; i++) g.fillRect(20, 30 + i * 60, w - 40 - i * 30, 30);
});
// wall clock (its hands race during "Jeden Tag, über Jahre")
export const clock = new THREE.Group();
clock.position.set(-1.25, 3.95, -2.94);
ground.add(clock);
{
  mk(new THREE.CylinderGeometry(0.42, 0.42, 0.08, 48), real.plastic(0x1e1e22), 0, 0, 0.02, {
    parent: clock,
    cast: false,
  }).rotation.x = Math.PI / 2;
  mk(new THREE.CircleGeometry(0.37, 48), flat(0xf7f3ea), 0, 0, 0.065, {
    parent: clock,
    cast: false,
  });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    mk(
      new THREE.BoxGeometry(0.025, i % 3 ? 0.04 : 0.08, 0.01),
      flat(0x222222),
      Math.sin(a) * 0.31,
      Math.cos(a) * 0.31,
      0.07,
      { parent: clock, cast: false },
    ).rotation.z = -a;
  }
  const hand = (len, w, col) => {
    const g = new THREE.BoxGeometry(w, len, 0.012);
    g.translate(0, len / 2 - 0.03, 0);
    return mk(g, flat(col), 0, 0, 0.08, { parent: clock, cast: false });
  };
  clock.userData.hour = hand(0.2, 0.035, 0x222222);
  clock.userData.min = hand(0.3, 0.022, 0x222222);
  clock.userData.sec = hand(0.32, 0.008, 0xd9342b);
}

// ---------------------------------------------------------------- right side: chair, plant, desk
{
  // chair with a hoodie thrown over it
  const wood = real.wood(0xa87a52);
  const cx = 3.6;
  const cz = -1.4;
  mk(roundedBox(0.9, 0.08, 0.9, 0.03), wood, cx, 0.95, cz);
  for (const dx of [-0.38, 0.38])
    for (const dz of [-0.38, 0.38])
      mk(new THREE.CylinderGeometry(0.035, 0.03, 0.95, 10), wood, cx + dx, 0.47, cz + dz);
  mk(roundedBox(0.9, 1.0, 0.07, 0.03), wood, cx, 1.5, cz - 0.42);
  const hood = mk(roundedBox(1.0, 0.55, 0.3, 0.14, 5), real.fabric(0x3f6e5a), cx, 1.75, cz - 0.38);
  hood.rotation.z = 0.15;
  mk(roundedBox(0.3, 0.8, 0.2, 0.09), real.fabric(0x3f6e5a), cx + 0.35, 1.15, cz - 0.3);
  // sneakers on the floor
  for (const [x, z, r] of [
    [2.2, 2.4, 0.4],
    [2.55, 2.55, 0.1],
  ]) {
    const s = mk(roundedBox(0.3, 0.2, 0.65, 0.09), real.fabric(0xf4f4f4), x, 0.1, z);
    s.rotation.y = r;
    mk(roundedBox(0.32, 0.06, 0.68, 0.03), real.rubber(0xd8d0c0), x, 0.03, z).rotation.y = r;
  }
  // plant in the corner
  mk(new THREE.CylinderGeometry(0.42, 0.32, 0.8, 24), real.ceramic(0xe9e2d4), 4.3, 0.4, -2.4);
  const leafM = real.plastic(0x3f7d3a, { roughness: 0.7, side: THREE.DoubleSide });
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + R();
    const leaf = mk(new THREE.SphereGeometry(0.32, 12, 8), leafM, 4.3, 1.4 + R() * 0.9, -2.4);
    leaf.scale.set(0.35, 0.05, 1);
    leaf.position.x += Math.sin(a) * 0.35;
    leaf.position.z += Math.cos(a) * 0.35;
    leaf.rotation.set(0.5 + R() * 0.4, a, 0);
  }
  // a low dresser on the right wall with a speaker + a little mirror
  mk(roundedBox(0.8, 1.3, 2.2, 0.05), real.wood(0xdac3a0), 4.45, 0.65, 2.2);
  mk(roundedBox(0.3, 0.45, 0.3, 0.1), real.fabric(0x2c2c30), 4.4, 1.53, 1.6);
  const mirror = mk(
    new THREE.CircleGeometry(0.55, 48),
    real.metal(0xdfe6ef, { roughness: 0.05 }),
    4.86,
    2.6,
    2.4,
    { cast: false },
  );
  mirror.rotation.y = -Math.PI / 2;
}
// left side: laundry basket by the window
mk(new THREE.CylinderGeometry(0.42, 0.36, 0.8, 24), real.fabric(0xc8b89a), -3.1, 0.4, 2.6);
mk(roundedBox(0.7, 0.25, 0.7, 0.12), real.fabric(0x6e8fb8), -3.1, 0.85, 2.6);

// ---------------------------------------------------------------- life
fireflies(40, { area: [-2.8, 2.5, 1.4, 4.6, -2.6, 2.4], color: 0xffd9a0, seed: 4, size: 0.012 });
onFrame((t) => {
  for (const c of curtains) {
    c.rotation.z = Math.sin(t * 0.6 + c.userData.s) * 0.012;
    c.position.x = WX + 0.25 + Math.sin(t * 0.45 + c.userData.s * 2) * 0.02;
  }
  fairyBulbs.forEach((b, i) => {
    b.material.emissiveIntensity = 1.4 + 0.5 * Math.sin(t * 2.3 + i * 1.7);
  });
});

finishSet({ ground: 0x2a2030 });
