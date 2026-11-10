// #63 Cola im Gefrierfach — inside a freezer drawer, giant scale.
// The camera is the size of a mouse: the can (12 cm) is a tower, the bag of
// peas a green hill, the ice-cream tub a building. Cold blue LED light from
// the shelf edge, warm kitchen light spilling in from the front, frost on
// every wall, mist creeping over the floor, ice glitter in the air.
// Hero piece: the frosted back wall with the evaporator ribs, icicles and a
// glowing "−18 °C" display. Props: peas bag, berries bag, ice-cream tub,
// fish-fingers box, ice-cube tray, a dark pizza box standing behind the can
// (dark backdrop for the red can), loose ice cubes.
// Life: drifting mist, glitter, the display blinking, the LED strip flicker.
//
// Units: 1 unit ≈ 5 cm. Can: 2.44 tall, radius 0.66 (real 12.2 × 6.6 cm).
// Drawer interior x −6.2..6.2, z −5.4..3.3, floor y = 0, shelf above y = 6.4.
import { THREE, ground, onFrame, rng, real, roundedBox, scene } from "./world.js";
import { SKIES, setSky, finishSet, fireflies } from "./environments.js";

const SEED = 63;
const r = rng(SEED);

// ---------------------------------------------------------------- light
// own palette: deep freezer blue; the key is the kitchen light from the open
// door (front, a little warm), the rim a cold blue from the back
setSky({
  ...SKIES.studio,
  top: [0.03, 0.06, 0.14],
  mid: [0.05, 0.1, 0.22],
  hor: [0.1, 0.18, 0.34],
  below: [0.04, 0.07, 0.15],
  sunDir: [0, 0.4, -1],
  hemi: [0xbfd8ff, 0x2a3a5a, 1.2],
  key: [0xfff1de, 2.2],
  keyPos: [5, 13, 14],
  rim: [0x7fb8ff, 1.4],
  fog: [30, 90],
});
// cold LED strip under the shelf edge (practical light) + warm spill
const led = new THREE.PointLight(0xcfe6ff, 22, 16, 1.4);
led.position.set(0, 6.0, 2.6);
scene.add(led);
const warm = new THREE.PointLight(0xffc28a, 10, 22, 1.6);
warm.position.set(-3, 4.5, 10);
scene.add(warm);
const blueBack = new THREE.PointLight(0x4f9dff, 14, 12, 1.5);
blueBack.position.set(2, 3.5, -4.2);
scene.add(blueBack);

// ---------------------------------------------------------------- helpers
const tex = (w, h, draw) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};
const mesh = (geo, mat, x, y, z, shadow = true) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  ground.add(m);
  return m;
};
// a soft, puffy freezer bag: box with many segments, inflated in the middle
function pillowGeo(w, h, d) {
  const g = new THREE.BoxGeometry(w, h, d, 28, 6, 28);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) / (w / 2);
    const y = p.getY(i) / (h / 2);
    const z = p.getZ(i) / (d / 2);
    const k = (1 - Math.pow(Math.abs(x), 3)) * (1 - Math.pow(Math.abs(z), 3));
    p.setY(i, ((y * h) / 2) * (0.25 + 0.75 * k));
    // crinkles
    p.setY(i, p.getY(i) + Math.sin(x * 9 + z * 5) * 0.025 * k * Math.sign(y));
  }
  g.computeVertexNormals();
  g.translate(0, (h / 2) * 0.25 + 0.02, 0);
  return g;
}
const frostMat = new THREE.MeshPhysicalMaterial({
  color: 0xf2f8ff,
  roughness: 0.85,
  sheen: 1,
  sheenColor: new THREE.Color(0xdff0ff),
  flatShading: true,
});

// ---------------------------------------------------------------- drawer
// floor: white plastic with a frosty, slightly bluish crust in patches
{
  const geo = new THREE.PlaneGeometry(12.4, 8.7, 62, 44);
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  const col = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const z = p.getZ(i);
    const n = 0.5 + 0.5 * Math.sin(x * 1.3 + Math.sin(z * 0.9) * 2) * Math.cos(z * 1.1 - x * 0.4);
    const k = 0.84 + n * 0.14 + (r() - 0.5) * 0.04;
    col.set([k * 0.93, k * 0.97, k], i * 3);
    p.setY(i, n * 0.03);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  geo.computeVertexNormals();
  const floor = mesh(
    geo,
    new THREE.MeshPhysicalMaterial({
      color: 0xe8f1fb,
      vertexColors: true,
      roughness: 0.55,
      clearcoat: 0.4,
      clearcoatRoughness: 0.5,
    }),
    0,
    0,
    -1.05,
    false,
  );
  floor.receiveShadow = true;
}
// side walls + back wall of the drawer: frosted translucent plastic
const drawerMat = real.plastic(0xd7e8f7, { roughness: 0.6, transparent: true, opacity: 0.55 });
mesh(roundedBox(0.18, 4.2, 8.8, 0.06), drawerMat, -6.3, 2.1, -1.05, false);
mesh(roundedBox(0.18, 4.2, 8.8, 0.06), drawerMat, 6.3, 2.1, -1.05, false);
// low front lip of the drawer with a grip
mesh(roundedBox(12.8, 0.9, 0.2, 0.08), drawerMat, 0, 0.45, 3.4, false);
mesh(
  roundedBox(3.2, 0.22, 0.3, 0.1),
  real.plastic(0xb9cadb, { roughness: 0.35 }),
  0,
  0.78,
  3.6,
  false,
);
// the freezer's inner side walls (white, above the drawer)
const linerMat = real.plastic(0xeef4fa, { roughness: 0.45 });
mesh(new THREE.BoxGeometry(0.4, 9, 12), linerMat, -6.8, 4.5, -1, false);
mesh(new THREE.BoxGeometry(0.4, 9, 12), linerMat, 6.8, 4.5, -1, false);

// ---------------------------------------------------------------- back wall (hero)
{
  const WZ = -5.6;
  mesh(new THREE.BoxGeometry(13.6, 9, 0.4), linerMat, 0, 4.5, WZ - 0.2, false);
  // evaporator ribs, frosted
  for (let i = 0; i < 9; i++) {
    const y = 0.9 + i * 0.62;
    mesh(roundedBox(12.2, 0.2, 0.3, 0.08), linerMat, 0, y, WZ + 0.1, false);
  }
  // frost crust: lumpy instanced ice on the wall and in the corners
  const lump = new THREE.IcosahedronGeometry(1, 1);
  const n = 260;
  const inst = new THREE.InstancedMesh(lump, frostMat, n);
  const o = new THREE.Object3D();
  for (let i = 0; i < n; i++) {
    const corner = i % 3 === 0;
    const x = corner ? (r() < 0.5 ? -6 : 6) + (r() - 0.5) * 0.6 : (r() - 0.5) * 12.4;
    const y = corner ? r() * 6 : 0.4 + r() * 5.6;
    const z = corner ? WZ + 0.4 + r() * 7 : WZ + 0.18 + r() * 0.14;
    o.position.set(x, y, z);
    const s = 0.08 + r() * 0.22;
    o.scale.set(s * (1 + r()), s, s * 0.7);
    o.rotation.set(r() * 3, r() * 3, r() * 3);
    o.updateMatrix();
    inst.setMatrixAt(i, o.matrix);
  }
  inst.receiveShadow = true;
  ground.add(inst);
  // icicles hanging from the shelf edge at the back
  for (let i = 0; i < 16; i++) {
    const h = 0.3 + r() * 0.9;
    const ic = mesh(
      new THREE.ConeGeometry(0.06 + r() * 0.06, h, 10),
      real.glass(0xe8f6ff, { opacity: 0.7, roughness: 0.12 }),
      -5.6 + i * 0.75 + (r() - 0.5) * 0.3,
      6.35 - h / 2,
      WZ + 0.35,
      false,
    );
    ic.rotation.x = Math.PI;
  }
  // the display: "−18 °C", glowing blue
  const disp = tex(512, 192, (c, w, h) => {
    c.fillStyle = "#06121f";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#7fd4ff";
    c.font = "bold 128px Montserrat, sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("−18 °C", w / 2, h / 2 + 6);
  });
  const dmat = new THREE.MeshBasicMaterial({ map: disp, toneMapped: false });
  mesh(roundedBox(2.5, 1.0, 0.16, 0.08), real.plastic(0x2a3340), 3.6, 5.0, WZ + 0.22, false);
  const screen = mesh(new THREE.PlaneGeometry(2.2, 0.82), dmat, 3.6, 5.0, WZ + 0.31, false);
  screen.userData.noAO = true;
  onFrame((t) => dmat.color.setScalar(0.85 + 0.15 * Math.sin(t * 2.1)));
}

// ---------------------------------------------------------------- shelf + LED strip
{
  const shelf = mesh(
    new THREE.BoxGeometry(13.2, 0.16, 9.2),
    real.glass(0xcfe9ff, { opacity: 0.45 }),
    0,
    6.45,
    -1.05,
    false,
  );
  shelf.userData.noAO = true;
  mesh(roundedBox(13.2, 0.3, 0.3, 0.08), linerMat, 0, 6.35, 3.5, false);
  const strip = mesh(
    new THREE.BoxGeometry(10, 0.06, 0.08),
    new THREE.MeshBasicMaterial({ color: 0xe6f3ff, toneMapped: false }),
    0,
    6.18,
    3.42,
    false,
  );
  strip.userData.noAO = true;
}

// ---------------------------------------------------------------- props
const bagLabel = (base, title, sub, dot) =>
  tex(1024, 768, (c, w, h) => {
    c.fillStyle = base;
    c.fillRect(0, 0, w, h);
    // little produce dots
    const rr = rng(title.length * 7);
    for (let i = 0; i < 70; i++) {
      c.fillStyle = dot;
      c.beginPath();
      c.arc(rr() * w, h * 0.55 + rr() * h * 0.45, 18 + rr() * 22, 0, 7);
      c.fill();
    }
    c.fillStyle = "rgba(255,255,255,0.92)";
    c.fillRect(0, h * 0.16, w, h * 0.3);
    c.fillStyle = base;
    c.font = "900 150px Montserrat, sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(title, w / 2, h * 0.31);
    c.fillStyle = "#fff";
    c.font = "700 60px Montserrat, sans-serif";
    c.fillText(sub, w / 2, h * 0.08);
  });
// peas: the green hill on the left
{
  const m = mesh(
    pillowGeo(4.2, 1.1, 3.0),
    real.gloss(0xffffff, { map: bagLabel("#1f8a3a", "ERBSEN", "TIEFGEKÜHLT", "#6fcf4a") }),
    -3.4,
    0,
    -1.3,
  );
  m.rotation.y = 0.28;
}
// berries: purple bag leaning on the back wall
{
  const m = mesh(
    pillowGeo(3.0, 0.8, 3.8),
    real.gloss(0xffffff, { map: bagLabel("#5b2a7a", "BEEREN", "MIX", "#c2398a") }),
    -4.0,
    0.2,
    -4.3,
  );
  m.rotation.set(-1.15, 0.2, 0);
}
// pizza box standing behind the can: dark, so the red can pops
{
  const t = tex(1024, 1024, (c, w, h) => {
    c.fillStyle = "#14161f";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#c8a24a";
    c.lineWidth = 14;
    c.strokeRect(60, 60, w - 120, h - 120);
    c.fillStyle = "#c8a24a";
    c.font = "900 120px Montserrat, sans-serif";
    c.textAlign = "center";
    c.fillText("STEINOFEN", w / 2, h * 0.3);
    c.font = "700 80px Montserrat, sans-serif";
    c.fillText("PIZZA", w / 2, h * 0.42);
    c.fillStyle = "#b8452c";
    c.beginPath();
    c.arc(w / 2, h * 0.68, 190, 0, 7);
    c.fill();
    c.fillStyle = "#e9c46a";
    c.beginPath();
    c.arc(w / 2, h * 0.68, 160, 0, 7);
    c.fill();
    c.fillStyle = "#a3261c";
    for (let i = 0; i < 9; i++) {
      c.beginPath();
      c.arc(w / 2 + Math.cos(i * 2.4) * 95, h * 0.68 + Math.sin(i * 2.4) * 95, 26, 0, 7);
      c.fill();
    }
  });
  const g = new THREE.Group();
  const box = new THREE.Mesh(
    roundedBox(5.8, 5.8, 0.36, 0.05),
    real.plastic(0x14161f, { roughness: 0.7 }),
  );
  box.castShadow = box.receiveShadow = true;
  g.add(box);
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(5.6, 5.6),
    new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 }),
  );
  face.position.z = 0.185;
  g.add(face);
  g.position.set(0.6, 2.9, -4.9);
  g.rotation.x = -0.12;
  ground.add(g);
}
// ice-cream tub on the right
{
  const t = tex(1024, 512, (c, w, h) => {
    c.fillStyle = "#f4ead2";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#d9577f";
    c.fillRect(0, h * 0.62, w, h * 0.38);
    c.fillStyle = "#5a3a2a";
    c.font = "900 150px Montserrat, sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("VANILLE", w / 2, h * 0.34);
    c.fillStyle = "#fff";
    c.font = "700 64px Montserrat, sans-serif";
    c.fillText("EISCREME · 1 L", w / 2, h * 0.81);
  });
  const g = new THREE.Group();
  const body = new THREE.Mesh(roundedBox(3.4, 2.0, 2.5, 0.28), real.plastic(0xf4ead2));
  body.position.y = 1.0;
  const lid = new THREE.Mesh(roundedBox(3.55, 0.26, 2.65, 0.1), real.gloss(0xd9577f));
  lid.position.y = 2.08;
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(3.0, 1.5),
    new THREE.MeshStandardMaterial({ map: t, roughness: 0.5 }),
  );
  face.position.set(0, 1.0, 1.256);
  [body, lid].forEach((m) => (m.castShadow = m.receiveShadow = true));
  g.add(body, lid, face);
  g.position.set(3.6, 0, -2.6);
  g.rotation.y = -0.3;
  ground.add(g);
}
// fish-fingers box standing on the right
{
  const t = tex(512, 1024, (c, w, h) => {
    c.fillStyle = "#1d58b0";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#ff9a1f";
    for (let i = 0; i < 4; i++) {
      c.save();
      c.translate(w / 2, h * 0.58 + i * 90);
      c.rotate(-0.2);
      c.fillRect(-170, -28, 340, 56);
      c.restore();
    }
    c.fillStyle = "#fff";
    c.font = "900 92px Montserrat, sans-serif";
    c.textAlign = "center";
    c.fillText("FISCH", w / 2, h * 0.2);
    c.fillText("STÄBCHEN", w / 2, h * 0.3);
  });
  const g = new THREE.Group();
  const box = new THREE.Mesh(
    roundedBox(2.0, 3.0, 0.9, 0.05),
    real.plastic(0x1d58b0, { roughness: 0.6 }),
  );
  box.position.y = 1.5;
  box.castShadow = box.receiveShadow = true;
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(1.9, 2.9),
    new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 }),
  );
  face.position.set(0, 1.5, 0.456);
  g.add(box, face);
  g.position.set(5.0, 0, 0.1);
  g.rotation.y = -0.7;
  ground.add(g);
}
// ice-cube tray, front right, with cubes
const iceMat = real.glass(0xeaf7ff, { opacity: 0.78, roughness: 0.15, depthWrite: true });
{
  const g = new THREE.Group();
  const tray = new THREE.Mesh(
    roundedBox(3.0, 0.4, 1.4, 0.1),
    real.plastic(0x4fb3e8, { transparent: true, opacity: 0.85, roughness: 0.3 }),
  );
  tray.position.y = 0.2;
  tray.castShadow = tray.receiveShadow = true;
  g.add(tray);
  for (let i = 0; i < 6; i++)
    for (let j = 0; j < 2; j++) {
      const cube = new THREE.Mesh(roundedBox(0.4, 0.34, 0.5, 0.08), iceMat);
      cube.position.set(-1.15 + i * 0.46, 0.45, -0.3 + j * 0.6);
      cube.castShadow = true;
      g.add(cube);
    }
  g.position.set(3.4, 0, 1.9);
  g.rotation.y = 0.2;
  ground.add(g);
}
// loose ice cubes on the floor
for (let i = 0; i < 7; i++) {
  const a = 0.6 + i * 0.85;
  const rr = 1.7 + r() * 1.6;
  const x = Math.cos(a) * rr * 1.4;
  const z = 0.8 + Math.sin(a) * rr * 0.6;
  if (Math.hypot(x, z) < 1.4) continue;
  const c = mesh(roundedBox(0.42, 0.36, 0.42, 0.09), iceMat, x, 0.18, z);
  c.rotation.set(r() * 0.4, r() * 3, r() * 0.4);
}

// ---------------------------------------------------------------- life
// mist creeping over the floor: soft sprites drifting slowly
{
  const mt = tex(128, 128, (c, w) => {
    const g = c.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    g.addColorStop(0, "rgba(255,255,255,0.55)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, w, w);
  });
  const mm = new THREE.MeshBasicMaterial({
    map: mt,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
    color: 0xdcecff,
  });
  const n = 26;
  const sprites = [];
  for (let i = 0; i < n; i++) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mm);
    s.userData = {
      noAO: true,
      x: (r() - 0.5) * 12,
      z: -5 + r() * 8.5,
      s: 1.6 + r() * 2.4,
      ph: r(),
    };
    s.rotation.x = -Math.PI / 2;
    s.renderOrder = 2;
    ground.add(s);
    sprites.push(s);
  }
  onFrame((t) => {
    for (const s of sprites) {
      const u = s.userData;
      const x = ((u.x + 6.2 + t * 0.18 * (0.5 + u.ph)) % 12.4) - 6.2;
      s.position.set(x, 0.12 + u.ph * 0.25, u.z + Math.sin(t * 0.3 + u.ph * 6) * 0.3);
      s.scale.setScalar(u.s * (1 + 0.1 * Math.sin(t * 0.5 + u.ph * 9)));
    }
  });
}
// ice glitter in the air
fireflies(90, { area: [-6, 6, 0.3, 6, -5.2, 3.2], color: 0xeaf6ff, size: 0.02, seed: SEED });

finishSet({ ground: 0xdfeaf6 });
export { iceMat, frostMat, tex };
