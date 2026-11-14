// #89 Ei in der Mikrowelle — the world: a sunny breakfast kitchen at egg
// scale (1 unit ≈ 5 cm). The hero piece is the microwave on the butcher-block
// counter: brushed steel, a black glass door with the dotted window, a green
// countdown display and a glass turntable (the egg sits at the origin on
// it). Behind it white subway tiles, a window with the sunrise over the
// rooftops, a plant on the sill; on the counter a steaming mug, the egg
// carton, a kettle, a toaster, salt and pepper, a fruit bowl, the plate
// (where the egg goes off) and a cutting board. Warm low morning sun
// through the window, dust in the beam, steam from mug and kettle.
import { THREE, scene, flat, real, roundedBox, rng, onFrame, V } from "./world.js";
import { setSky, finishSet, add, F, fireflies } from "./environments.js";

// ---------------------------------------------------------------- helpers
export const tex = (w, h, draw) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};
const mesh = (geo, mat, x, y, z, shadow = true) => add(new THREE.Mesh(geo, mat), x, y, z, shadow);
const TOP = -0.75; // counter surface

// ---------------------------------------------------------------- light
setSky({
  top: [0.32, 0.5, 0.86],
  mid: [0.72, 0.74, 0.86],
  hor: [1.0, 0.72, 0.46],
  below: [0.35, 0.3, 0.3],
  sun: [1.0, 0.82, 0.6],
  sunDir: [0.45, 0.32, -1],
  cloud: [0xffe6cc, 0xf2c6a8],
  clouds: 6,
  birds: false,
  stars: 0,
  hemi: [0xfff2e2, 0x6a5648, 1.35],
  key: [0xffdcb0, 2.9],
  keyPos: [26, 22, -30],
  rim: [0xbcd4ff, 0.8],
  fog: [60, 220],
});
// soft fill from the room behind the camera + warm under-cabinet strip
const fill = new THREE.PointLight(0xfff0de, 26, 46, 1.5);
fill.position.set(4, 9, 16);
scene.add(fill);
const strip = new THREE.PointLight(0xffc98a, 14, 18, 1.6);
strip.position.set(-6, 8.4, -3.2);
scene.add(strip);

// ---------------------------------------------------------------- materials
const woodTex = tex(1024, 256, (c, w, h) => {
  c.fillStyle = "#b9824f";
  c.fillRect(0, 0, w, h);
  const r = rng(89);
  // butcher block: strips of different wood tone
  let x = 0;
  while (x < w) {
    const sw = 40 + r() * 50;
    const l = 0.85 + r() * 0.3;
    c.fillStyle = `rgb(${(185 * l) | 0},${(130 * l) | 0},${(80 * l) | 0})`;
    c.fillRect(x, 0, sw, h);
    for (let i = 0; i < 14; i++) {
      c.strokeStyle = `rgba(80,45,20,${0.05 + r() * 0.08})`;
      c.lineWidth = 1 + r() * 2;
      const gx = x + r() * sw;
      c.beginPath();
      c.moveTo(gx, 0);
      c.bezierCurveTo(gx + 6, h * 0.3, gx - 6, h * 0.7, gx + 3, h);
      c.stroke();
    }
    c.fillStyle = "rgba(60,30,10,0.35)";
    c.fillRect(x, 0, 1.5, h);
    x += sw;
  }
});
woodTex.wrapS = woodTex.wrapT = THREE.RepeatWrapping;
woodTex.rotation = Math.PI / 2;
woodTex.repeat.set(1, 3);
const counterMat = real.wood(0xffffff, { map: woodTex, roughness: 0.55 });

const tileTex = tex(512, 512, (c, w, h) => {
  c.fillStyle = "#c9c4bb";
  c.fillRect(0, 0, w, h);
  const r = rng(7);
  const tw = 128;
  const th = 64;
  for (let row = 0; row < h / th; row++) {
    const off = row % 2 ? tw / 2 : 0;
    for (let col = -1; col < w / tw + 1; col++) {
      const x = col * tw + off + 3;
      const y = row * th + 3;
      const l = 240 + r() * 12;
      const g = c.createLinearGradient(x, y, x, y + th);
      g.addColorStop(0, `rgb(${l},${l - 2},${l - 6})`);
      g.addColorStop(1, `rgb(${l - 14},${l - 16},${l - 20})`);
      c.fillStyle = g;
      c.fillRect(x, y, tw - 6, th - 6);
    }
  }
});
tileTex.wrapS = tileTex.wrapT = THREE.RepeatWrapping;
const tileMat = (rx, ry) => {
  const t = tileTex.clone();
  t.repeat.set(rx, ry);
  t.needsUpdate = true;
  return real.ceramic(0xffffff, { map: t, roughness: 0.25 });
};
const cabMat = real.plastic(0xe9e1d2, { roughness: 0.45 });
const steelMat = real.metal(0xc3c8ce, { roughness: 0.32 });
const blackGloss = real.gloss(0x121418, { roughness: 0.18 });
const darkPlastic = real.plastic(0x24262b, { roughness: 0.5 });
const white = real.ceramic(0xfbfaf6, { roughness: 0.2 });

// ---------------------------------------------------------------- room
// counter (butcher block) + cabinet fronts below
mesh(roundedBox(34, 0.6, 11.2, 0.12), counterMat, 1, TOP - 0.3, 0.2);
const fascia = roundedBox(34, 9, 0.3, 0.08);
mesh(fascia, cabMat, 1, TOP - 5.3, 5.55);
for (let i = 0; i < 5; i++) {
  const x = -14 + i * 7;
  mesh(new THREE.BoxGeometry(0.06, 8.6, 0.05), darkPlastic, x + 3.5, TOP - 5.3, 5.72, false);
  mesh(roundedBox(1.6, 0.18, 0.25, 0.08), steelMat, x + 1.9, TOP - 1.4, 5.8);
}
// back wall with the window hole (x 7..15, y 1.5..8)
const WZ = -5.6;
const wallPart = (x0, x1, y0, y1) => {
  const w = x1 - x0;
  const h = y1 - y0;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), tileMat(w / 3.2, h / 1.6));
  m.position.set((x0 + x1) / 2, (y0 + y1) / 2, WZ);
  m.receiveShadow = true;
  scene.add(m);
};
wallPart(-18, 7, TOP, 16);
wallPart(15, 22, TOP, 16);
wallPart(7, 15, TOP, 1.5);
wallPart(7, 15, 8, 16);
// side wall on the left
{
  const m = new THREE.Mesh(new THREE.PlaneGeometry(14, 17), tileMat(14 / 3.2, 17 / 1.6));
  m.rotation.y = Math.PI / 2;
  m.position.set(-17.5, TOP + 8, 1.4);
  m.receiveShadow = true;
  scene.add(m);
}
// window: white frame, cross bar, wooden sill, a plant
const frameMat = real.plastic(0xf6f4ef, { roughness: 0.35 });
mesh(roundedBox(8.6, 0.35, 0.5, 0.06), frameMat, 11, 8.05, WZ - 0.1, false);
mesh(roundedBox(8.6, 0.35, 0.5, 0.06), frameMat, 11, 1.55, WZ - 0.1, false);
mesh(roundedBox(0.35, 6.8, 0.5, 0.06), frameMat, 7.0, 4.8, WZ - 0.1, false);
mesh(roundedBox(0.35, 6.8, 0.5, 0.06), frameMat, 15.0, 4.8, WZ - 0.1, false);
mesh(roundedBox(0.22, 6.5, 0.3, 0.05), frameMat, 11, 4.8, WZ - 0.2, false);
mesh(roundedBox(8.2, 0.16, 0.3, 0.05), frameMat, 11, 5.4, WZ - 0.2, false);
mesh(roundedBox(9.4, 0.3, 1.3, 0.08), real.wood(0xa9763f, { roughness: 0.5 }), 11, 1.45, WZ + 0.45);
// plant: terracotta pot + leaves
const potMat = real.ceramic(0xc0643a, { roughness: 0.7 });
mesh(new THREE.CylinderGeometry(0.75, 0.55, 1.2, 24), potMat, 13.4, 2.2, WZ + 0.5);
const leafMat = real.plastic(0x3f8f45, { roughness: 0.55, side: THREE.DoubleSide });
const plant = new THREE.Group();
plant.position.set(13.4, 2.8, WZ + 0.5);
scene.add(plant);
{
  const r = rng(12);
  for (let i = 0; i < 11; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 8), leafMat);
    leaf.scale.set(0.35, 1, 0.12);
    const a = (i / 11) * Math.PI * 2;
    const tilt = 0.4 + r() * 0.5;
    const stem = new THREE.Group();
    stem.rotation.set(Math.sin(a) * tilt, a, Math.cos(a) * tilt);
    leaf.position.y = 0.6 + r() * 0.4;
    stem.add(leaf);
    leaf.castShadow = true;
    plant.add(stem);
  }
}
onFrame((t) => {
  plant.rotation.z = Math.sin(t * 0.9) * 0.025;
  plant.rotation.x = Math.sin(t * 0.7 + 1) * 0.02;
});

// upper cabinets left of the window + the under-cabinet light strip
mesh(roundedBox(23, 6, 3.6, 0.1), cabMat, -5.5, 12.4, WZ + 1.9);
for (let i = 0; i < 4; i++) {
  const x = -16 + i * 5.75 + 2.87;
  mesh(new THREE.BoxGeometry(0.05, 5.8, 0.05), darkPlastic, x + 2.87, 12.4, WZ + 3.72, false);
  mesh(roundedBox(0.2, 1.2, 0.25, 0.08), steelMat, x + 2.2, 10.2, WZ + 3.8);
}
mesh(
  new THREE.BoxGeometry(22, 0.08, 0.3),
  new THREE.MeshBasicMaterial({ color: 0xffe2b0 }),
  -5.5,
  9.37,
  WZ + 3.2,
  false,
);

// rooftops seen through the window (low-poly far layer, warm sunrise)
{
  const r = rng(3);
  const roofMat = flat(0xb2563d);
  const houseMats = [flat(0xe8d2b8), flat(0xd9b896), flat(0xcfd6dc), flat(0xe6c4a2)];
  for (let i = 0; i < 14; i++) {
    const x = -10 + i * 6 + r() * 3;
    const z = -45 - r() * 25;
    const w = 4 + r() * 4;
    const h = 6 + r() * 10;
    const d = 5;
    const y = -10 + r() * 4;
    add(F(new THREE.BoxGeometry(w, h, d), houseMats[i % 4], 0.06, i), x, y + h / 2, z, false);
    const roof = F(new THREE.ConeGeometry(w * 0.75, 3 + r() * 2, 4), roofMat, 0.06, i + 30);
    roof.rotation.y = Math.PI / 4;
    add(roof, x, y + h + 1.4, z, false);
    // lit windows
    for (let k = 0; k < 3; k++) {
      const win = new THREE.Mesh(
        new THREE.PlaneGeometry(0.9, 1.2),
        new THREE.MeshBasicMaterial({ color: r() > 0.5 ? 0xffd28a : 0x8ea6bf }),
      );
      win.position.set(x - w / 3 + k * (w / 3), y + h * 0.65, z + d / 2 + 0.02);
      scene.add(win);
    }
  }
  // a church tower
  add(F(new THREE.BoxGeometry(3, 26, 3), flat(0xe0cdb5), 0.06, 77), 20, 3, -62, false);
  const spire = F(new THREE.ConeGeometry(2.4, 8, 4), flat(0x4f7a6a), 0.06, 78);
  spire.rotation.y = Math.PI / 4;
  add(spire, 20, 20, -62, false);
}

// ---------------------------------------------------------------- the microwave (hero piece)
// cavity x -3.2..3.2, y -0.35..3.8, z -3..3; door hinge at x -3.7, z 3.55
export const MW = {};
{
  const g = new THREE.Group();
  scene.add(g);
  const box = (geo, mat, x, y, z, shadow = true) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = shadow;
    m.receiveShadow = true;
    g.add(m);
    return m;
  };
  // shell (open at the front of the cavity)
  box(roundedBox(9.4, 0.42, 7.1, 0.16), steelMat, 0.95, 4.05, 0);
  box(roundedBox(9.4, 0.42, 7.1, 0.12), darkPlastic, 0.95, -0.52, 0);
  box(roundedBox(0.45, 5.0, 7.1, 0.16), steelMat, -3.48, 1.77, 0);
  box(roundedBox(2.1, 5.0, 7.1, 0.16), steelMat, 4.62, 1.77, 0);
  box(roundedBox(9.4, 5.0, 0.4, 0.12), steelMat, 0.95, 1.77, -3.35);
  // vent slots on the right side
  for (let i = 0; i < 9; i++)
    box(roundedBox(0.04, 0.12, 2.4, 0.03), darkPlastic, 5.68, 2.6 + i * 0.16, -0.8, false);
  // feet
  for (const [x, z] of [
    [-3.2, 3.0],
    [5.2, 3.0],
    [-3.2, -3.0],
    [5.2, -3.0],
  ])
    box(new THREE.CylinderGeometry(0.22, 0.25, 0.1, 14), darkPlastic, x, -0.7, z);

  // cavity walls (inward)
  const cavMat = real.plastic(0xeeebe4, { roughness: 0.42 });
  const plane = (w, h, mat, x, y, z, rx, ry) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, 0);
    m.receiveShadow = true;
    g.add(m);
    return m;
  };
  plane(6.4, 6, cavMat, 0, -0.32, 0, -Math.PI / 2, 0); // floor
  plane(6.4, 6, cavMat, 0, 3.8, 0, Math.PI / 2, 0); // ceiling
  plane(6, 4.15, cavMat, -3.2, 1.73, 0, 0, Math.PI / 2); // left
  plane(6, 4.15, cavMat, 3.2, 1.73, 0, 0, -Math.PI / 2); // right
  plane(6.4, 4.15, cavMat, 0, 1.73, -3.0, 0, 0); // back
  // mica waveguide cover on the right wall + lamp cover in the ceiling
  plane(1.6, 1.4, real.plastic(0xc9b48a, { roughness: 0.6 }), 3.19, 2.7, -0.6, 0, -Math.PI / 2);
  MW.lampMat = new THREE.MeshBasicMaterial({ color: 0xfff2d6 });
  plane(1.0, 0.7, MW.lampMat, 2.2, 3.79, -1.6, Math.PI / 2, 0);
  // the cavity light (animated in scene.js: white when idle, amber when on)
  MW.light = new THREE.PointLight(0xfff0d8, 7, 9, 1.4);
  MW.light.position.set(2.0, 3.3, -1.2);
  g.add(MW.light);

  // turntable: roller ring + glass plate (rotates)
  box(new THREE.TorusGeometry(1.5, 0.05, 8, 40), darkPlastic, 0, -0.25, 0, false).rotation.x =
    Math.PI / 2;
  MW.plate = new THREE.Group();
  g.add(MW.plate);
  const glass = new THREE.Mesh(
    new THREE.CylinderGeometry(2.55, 2.5, 0.1, 64),
    new THREE.MeshPhysicalMaterial({
      color: 0xdff2ee,
      roughness: 0.04,
      metalness: 0,
      transparent: true,
      opacity: 0.55,
      clearcoat: 1,
    }),
  );
  glass.position.y = -0.06;
  glass.receiveShadow = true;
  MW.plate.add(glass);
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(2.48, 0.06, 8, 64),
    new THREE.MeshPhysicalMaterial({
      color: 0xcfe8e2,
      roughness: 0.05,
      transparent: true,
      opacity: 0.6,
    }),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.0;
  MW.plate.add(rim);

  // door: pivot at the hinge, frame bars around the dotted window
  MW.door = new THREE.Group();
  MW.door.position.set(-3.72, 0, 3.55);
  g.add(MW.door);
  const dbox = (w, h, x0, y0, mat = blackGloss) => {
    const m = new THREE.Mesh(roundedBox(w, h, 0.32, 0.08), mat);
    m.position.set(x0 + w / 2, y0 + h / 2, 0.16);
    m.castShadow = true;
    MW.door.add(m);
    return m;
  };
  dbox(0.75, 4.9, 0, -0.65);
  dbox(0.95, 4.9, 6.3, -0.65);
  dbox(5.6, 0.62, 0.72, -0.65);
  dbox(5.6, 0.62, 0.72, 3.63);
  // dotted metal screen (transparent dots) + a reflective glass sheet
  const screen = tex(1024, 680, (c, w, h) => {
    c.fillStyle = "rgba(12,13,16,0.82)";
    c.fillRect(0, 0, w, h);
    c.globalCompositeOperation = "destination-out";
    for (let y = 4; y < h; y += 8)
      for (let x = (y / 8) % 2 ? 8 : 4; x < w; x += 8) {
        c.beginPath();
        c.arc(x, y, 3.0, 0, Math.PI * 2);
        c.fill();
      }
  });
  const scr = new THREE.Mesh(
    new THREE.PlaneGeometry(5.6, 3.7),
    new THREE.MeshStandardMaterial({
      map: screen,
      transparent: true,
      roughness: 0.6,
      metalness: 0.3,
    }),
  );
  scr.position.set(3.52, 1.8, 0.14);
  MW.door.add(scr);
  MW.screen = scr;
  const sheet = new THREE.Mesh(
    new THREE.PlaneGeometry(5.6, 3.7),
    new THREE.MeshPhysicalMaterial({
      color: 0x10141a,
      roughness: 0.05,
      metalness: 0.1,
      transparent: true,
      opacity: 0.16,
      clearcoat: 1,
    }),
  );
  sheet.position.set(3.52, 1.8, 0.3);
  MW.door.add(sheet);
  // handle
  const handle = new THREE.Mesh(roundedBox(0.28, 3.6, 0.32, 0.12), steelMat);
  handle.position.set(6.95, 1.8, 0.55);
  handle.castShadow = true;
  MW.door.add(handle);

  // control panel: green display, buttons, dial
  const panel = box(roundedBox(1.7, 4.6, 0.08, 0.06), blackGloss, 4.62, 1.77, 3.56, false);
  panel.castShadow = false;
  const dc = document.createElement("canvas");
  dc.width = 256;
  dc.height = 112;
  const dctx = dc.getContext("2d");
  const dtex = new THREE.CanvasTexture(dc);
  dtex.colorSpace = THREE.SRGBColorSpace;
  let lastText = null;
  MW.setDisplay = (text, on = 1) => {
    const key = text + on;
    if (key === lastText) return;
    lastText = key;
    dctx.fillStyle = "#06120a";
    dctx.fillRect(0, 0, 256, 112);
    dctx.font = "bold 78px monospace";
    dctx.textAlign = "center";
    dctx.textBaseline = "middle";
    dctx.fillStyle = on ? "#5dff8f" : "#123a20";
    dctx.shadowColor = "#3dff7a";
    dctx.shadowBlur = on ? 14 : 0;
    dctx.fillText(text, 128, 60);
    dtex.needsUpdate = true;
  };
  MW.setDisplay("12:00");
  box(
    new THREE.PlaneGeometry(1.35, 0.6),
    new THREE.MeshBasicMaterial({ map: dtex }),
    4.62,
    3.55,
    3.61,
    false,
  );
  const btnMat = real.plastic(0x2e3138, { roughness: 0.4 });
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      box(roundedBox(0.36, 0.26, 0.1, 0.06), btnMat, 4.2 + c * 0.42, 2.8 - r * 0.36, 3.63, false);
  MW.startBtn = box(
    roundedBox(1.2, 0.34, 0.12, 0.08),
    real.plastic(0x2f9e5a, { roughness: 0.35 }),
    4.62,
    1.6,
    3.63,
    false,
  );
  const dial = box(new THREE.CylinderGeometry(0.42, 0.45, 0.3, 32), steelMat, 4.62, 0.55, 3.72);
  dial.rotation.x = Math.PI / 2;
  MW.group = g;
}

// ---------------------------------------------------------------- counter props
// egg carton with eggs (left, back)
export const CARTON = { x: -11.5, z: -1.2 };
{
  const cg = new THREE.Group();
  cg.position.set(CARTON.x, TOP, CARTON.z);
  cg.rotation.y = 0.25;
  scene.add(cg);
  const pulp = real.fabric(0xbfae94, { roughness: 0.95 });
  const base = new THREE.Mesh(roundedBox(4.2, 0.8, 2.9, 0.12), pulp);
  base.position.y = 0.4;
  base.castShadow = true;
  base.receiveShadow = true;
  cg.add(base);
  const lid = new THREE.Mesh(roundedBox(4.2, 0.18, 2.9, 0.08), pulp);
  lid.position.set(0, 1.6, -2.0);
  lid.rotation.x = -1.1;
  lid.castShadow = true;
  cg.add(lid);
  const shellMat = real.plastic(0xf3e6d2, { roughness: 0.55 });
  const brown = real.plastic(0xd9a777, { roughness: 0.55 });
  for (let i = 0; i < 6; i++) {
    if (i === 1 || i === 4) continue;
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.45, 24, 16), i % 2 ? brown : shellMat);
    e.scale.set(1, 1.3, 1);
    e.position.set(-1.35 + (i % 3) * 1.35, 1.05, i < 3 ? -0.65 : 0.65);
    e.castShadow = true;
    cg.add(e);
  }
}
// kettle (left back corner) — steam animated below
{
  const kg = new THREE.Group();
  kg.position.set(-14.3, TOP, -3.3);
  scene.add(kg);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.6, 3.4, 40), steelMat);
  body.position.y = 1.9;
  body.castShadow = true;
  kg.add(body);
  const lidK = new THREE.Mesh(
    new THREE.SphereGeometry(1.27, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    steelMat,
  );
  lidK.position.y = 3.6;
  lidK.scale.y = 0.35;
  kg.add(lidK);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), darkPlastic);
  knob.position.y = 4.1;
  kg.add(knob);
  const handleK = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.16, 10, 24, Math.PI), darkPlastic);
  handleK.position.set(-1.45, 2.4, 0);
  handleK.rotation.z = Math.PI / 2;
  kg.add(handleK);
  const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.3, 1.3, 16), steelMat);
  spout.position.set(1.6, 2.7, 0);
  spout.rotation.z = -0.9;
  kg.add(spout);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.8, 0.3, 40), darkPlastic);
  base.position.y = 0.15;
  kg.add(base);
}
// fruit bowl with lemons (between carton and microwave)
{
  const bowl = new THREE.Mesh(
    new THREE.SphereGeometry(1.6, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    real.ceramic(0x2f5f8f, { roughness: 0.3, side: THREE.DoubleSide }),
  );
  bowl.scale.y = 0.55;
  mesh(bowl.geometry, bowl.material, -6.4, TOP + 0.85, -3.6).scale.y = 0.55;
  const lemon = real.plastic(0xf2cf2e, { roughness: 0.6 });
  [
    [-6.9, -3.4],
    [-5.9, -3.8],
    [-6.3, -3.0],
  ].forEach(([x, z], i) => {
    const m = mesh(
      new THREE.SphereGeometry(0.5, 20, 14),
      lemon,
      x,
      TOP + 0.75 + (i === 2 ? 0.3 : 0),
      z,
    );
    m.scale.set(1, 0.82, 0.82);
  });
}
// cutting board + knife (front left) — the "Übrigens" egg goes here
export const BOARD = { x: -8.2, y: TOP + 0.25, z: 2.4 };
mesh(
  roundedBox(5.4, 0.25, 3.4, 0.1),
  real.wood(0xd2a066, { roughness: 0.6 }),
  BOARD.x,
  TOP + 0.13,
  BOARD.z,
);
{
  const blade = mesh(
    roundedBox(2.6, 0.04, 0.5, 0.02),
    steelMat,
    BOARD.x + 0.6,
    BOARD.y + 0.05,
    BOARD.z + 1.15,
  );
  blade.rotation.y = 0.15;
  const grip = mesh(
    roundedBox(1.5, 0.2, 0.3, 0.09),
    darkPlastic,
    BOARD.x - 1.4,
    BOARD.y + 0.1,
    BOARD.z + 1.4,
  );
  grip.rotation.y = 0.15;
}
// coffee mug (behind the plate) — steaming
const MUG = V(6.9, TOP, -2.6);
{
  const mug = mesh(
    new THREE.CylinderGeometry(0.85, 0.8, 1.9, 36),
    real.ceramic(0xe6533c, { roughness: 0.3 }),
    MUG.x,
    TOP + 0.95,
    MUG.z,
  );
  mug.castShadow = true;
  const coffee = new THREE.Mesh(
    new THREE.CircleGeometry(0.76, 32),
    real.gloss(0x3b2214, { roughness: 0.15 }),
  );
  coffee.rotation.x = -Math.PI / 2;
  coffee.position.set(MUG.x, TOP + 1.75, MUG.z);
  scene.add(coffee);
  const h = mesh(
    new THREE.TorusGeometry(0.45, 0.12, 10, 20),
    real.ceramic(0xe6533c, { roughness: 0.3 }),
    MUG.x + 0.95,
    TOP + 1.0,
    MUG.z,
  );
  h.rotation.y = 0;
}
// salt + pepper, toaster with toast (right back)
mesh(new THREE.CylinderGeometry(0.33, 0.38, 1.3, 20), real.glass(0xffffff), 10.8, TOP + 0.65, -3.6);
mesh(new THREE.SphereGeometry(0.33, 16, 10), steelMat, 10.8, TOP + 1.35, -3.6).scale.y = 0.5;
mesh(
  new THREE.CylinderGeometry(0.33, 0.38, 1.3, 20),
  real.plastic(0x2a2a2e),
  11.7,
  TOP + 0.65,
  -3.3,
);
mesh(new THREE.SphereGeometry(0.33, 16, 10), steelMat, 11.7, TOP + 1.35, -3.3).scale.y = 0.5;
{
  mesh(
    roundedBox(3.6, 2.4, 2.0, 0.5),
    real.gloss(0x8fc7c0, { roughness: 0.25 }),
    15.2,
    TOP + 1.2,
    -3.4,
  );
  mesh(
    roundedBox(1.2, 1.3, 0.16, 0.06),
    real.plastic(0xd7a15a, { roughness: 0.9 }),
    14.6,
    TOP + 2.5,
    -3.55,
  );
  mesh(
    roundedBox(1.2, 1.2, 0.16, 0.06),
    real.plastic(0xc98f48, { roughness: 0.9 }),
    15.8,
    TOP + 2.45,
    -3.25,
  );
}
// phone face down-ish (front, between microwave and plate)
mesh(
  roundedBox(1.5, 0.15, 3.0, 0.2),
  real.gloss(0x1b1d22, { roughness: 0.2 }),
  5.6,
  TOP + 0.08,
  4.4,
).rotation.y = -0.3;

// the plate where the egg goes off (right of the microwave)
export const PLATE = { x: 9.2, y: TOP + 0.16, z: 1.4 };
{
  const p = mesh(
    new THREE.CylinderGeometry(2.0, 1.4, 0.18, 64),
    white,
    PLATE.x,
    TOP + 0.09,
    PLATE.z,
  );
  p.receiveShadow = true;
  const rimP = new THREE.Mesh(
    new THREE.TorusGeometry(1.86, 0.05, 8, 64),
    real.ceramic(0x2f6fb0, { roughness: 0.3 }),
  );
  rimP.rotation.x = Math.PI / 2;
  rimP.position.set(PLATE.x, TOP + 0.19, PLATE.z);
  scene.add(rimP);
  // salt pinch + a slice of buttered toast on the plate
  const toast = mesh(
    roundedBox(1.4, 0.22, 1.3, 0.1),
    real.plastic(0xd9a35c, { roughness: 0.85 }),
    PLATE.x - 1.0,
    PLATE.y + 0.12,
    PLATE.z - 0.6,
  );
  toast.rotation.y = 0.5;
}
// the empty spot for the steam analogy (right front)
export const ANALOGY = { x: 13.6, y: TOP, z: 1.6 };

// ---------------------------------------------------------------- life
// steam from mug and kettle: soft spheres rising and fading
const steamMat = (o) =>
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: o,
    depthWrite: false,
    roughness: 1,
  });
function steam(x, y, z, n, seed, size, speed = 1) {
  const r = rng(seed);
  const parts = [];
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), steamMat(0.2));
    m.userData = { ph: r(), sx: (r() - 0.5) * 0.8, sz: (r() - 0.5) * 0.8 };
    scene.add(m);
    parts.push(m);
  }
  onFrame((t) => {
    for (const m of parts) {
      const u = (t * 0.25 * speed + m.userData.ph) % 1;
      m.position.set(
        x + m.userData.sx * u + Math.sin(t * 1.3 + m.userData.ph * 9) * 0.15 * u,
        y + u * 3.2,
        z + m.userData.sz * u,
      );
      m.scale.setScalar(size * (0.3 + u));
      m.material.opacity = 0.16 * Math.sin(Math.PI * u);
    }
  });
}
steam(MUG.x, TOP + 1.8, MUG.z, 9, 4, 0.35);
steam(-14.3 + 2.1, TOP + 3.3, -3.3, 9, 6, 0.4, 1.4);
// dust in the sunbeam
fireflies(70, { area: [-4, 18, 0, 9, -5, 5], color: 0xfff1d0, seed: 89, size: 0.05 });

finishSet({ ground: 0xb9824f });
