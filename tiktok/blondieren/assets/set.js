// Set of #46 "Blondieren": a small hair salon in Wien-Neubau on a sunny
// Saturday afternoon, ~15:30. The styling chair with the viewer (head full
// of foils) stands at the origin (built in scene.js). Behind it the hero
// piece: a big shop window to the street with golden "SALON" letters, the
// sun streaming in, outside a sidewalk, a red-white tram passing and a
// pastel Gründerzeit facade across the street. Left of it the mirror station
// with round mirrors in bulb frames over a counter full of bottles. Props:
// hood dryer, second styling chair, wash basin, trolley-free corner with a
// monstera, hanging plants, pendant globes, a broom with a pile of cut hair,
// a coffee cup with steam. Life: dust in the sunbeam, the tram, steam,
// swaying hanging plants, a slowly turning ceiling fan, bulbs that twinkle.
import { THREE, flat, ground, onFrame, rng, patches, facet, facetMat, V } from "./world.js";
import { setSky, finishSet, F, fireflies } from "./environments.js";
import { sway } from "./props.js";

const r = rng(46);
const WZ = -7.5; // back wall (shop window + mirror station)
const LX = -10; // left wall
const CEIL = 8.2;

// ---------------------------------------------------------------- light
// warm afternoon: a soft blue sky through the window, golden sun from the
// front right (lights the face), peach bounce, a pink rim from the street
setSky({
  top: [0.42, 0.62, 0.93],
  mid: [0.7, 0.8, 0.95],
  hor: [1.0, 0.86, 0.66],
  below: [0.93, 0.82, 0.74],
  sun: [1.0, 0.9, 0.7],
  sunDir: [0.3, 0.35, -1],
  cloud: [0xfff6ee, 0xffd9c4],
  clouds: 8,
  birds: false,
  hemi: [0xfff1e6, 0x9a7a6a, 1.3],
  key: [0xffe9cc, 2.5],
  keyPos: [6, 11, 8],
  rim: [0xffb0c8, 0.9],
  fog: [34, 90],
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
const chrome = flat(0xe2e6ec, { metalness: 0.9, roughness: 0.16 });

// ---------------------------------------------------------------- floor: warm terrazzo
{
  const g = patches(facet(new THREE.BoxGeometry(40, 0.2, 32, 40, 1, 32), 0.04, 3), {
    amt: 0.07,
    scale: 0.25,
    seed: 4,
    warm: 0.5,
  });
  const floor = new THREE.Mesh(g, facetMat(flat(0xeadbc8, { roughness: 0.45 })));
  floor.position.set(0, -0.1, 4);
  floor.receiveShadow = true;
  ground.add(floor);
  // terrazzo chips: pastel and terracotta specks
  const N = 1400;
  const chips = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.06, 0),
    flat(0xffffff, { roughness: 0.4 }),
    N,
  );
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const c = new THREE.Color();
  const cols = [0xd9805a, 0xf2b8a2, 0x9cc6b8, 0x5e6e8a, 0xf6e7c8, 0xc4583e];
  for (let i = 0; i < N; i++) {
    const x = -19 + r() * 38;
    const z = -7.3 + r() * 27;
    const s = 0.6 + r() * 1.4;
    q.setFromEuler(new THREE.Euler(r() * 6, r() * 6, 0));
    m.compose(V(x, 0.0, z), q, V(s, 0.25, s));
    chips.setMatrixAt(i, m);
    chips.setColorAt(i, c.setHex(cols[i % cols.length]));
  }
  chips.receiveShadow = true;
  ground.add(chips);
  // round blush rug under the chair
  const rug = new THREE.Mesh(
    facet(new THREE.CylinderGeometry(3.3, 3.3, 0.05, 30), 0.05, 7),
    facetMat(flat(0xe7a3a8, { roughness: 1 })),
  );
  rug.position.set(0, 0.03, 0.3);
  rug.receiveShadow = true;
  ground.add(rug);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.95, 0.06, 4, 44), flat(0xc4583e));
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0, 0.06, 0.3);
  ground.add(ring);
}

// ---------------------------------------------------------------- walls
const plaster = flat(0xf3e1d2, { roughness: 0.9 });
const sage = flat(0x9fbfa8, { roughness: 0.85 });
{
  // back wall around the window (window opening x 1.2 … 9.2, y 0.9 … 5.9)
  box(11.2, CEIL, 0.4, sage, -4.4, CEIL / 2, WZ - 0.2, 0.03, 11); // left part (mirror station)
  box(2.0, CEIL, 0.4, sage, 10.2, CEIL / 2, WZ - 0.2, 0.03, 12);
  box(8.0, 0.9, 0.4, sage, 5.2, 0.45, WZ - 0.2, 0.03, 13); // sill wall
  box(8.0, CEIL - 5.9, 0.4, sage, 5.2, 5.9 + (CEIL - 5.9) / 2, WZ - 0.2, 0.03, 14);
  // wainscot along the back wall
  box(11.2, 1.1, 0.12, flat(0x7fa48c, { roughness: 0.7 }), -4.4, 0.55, WZ + 0.06, 0.03, 15);
  // left wall, plaster with a terracotta lower half
  box(0.4, CEIL, 30, plaster, LX - 0.2, CEIL / 2, 7.3, 0.03, 16);
  box(0.12, 1.4, 30, flat(0xd48a6a, { roughness: 0.8 }), LX + 0.06, 0.7, 7.3, 0.03, 17);
  // skirting
  box(0.1, 0.18, 30, flat(0xfaf3ea), LX + 0.1, 0.09, 7.3, 0, 1, false);
}

// ---------------------------------------------------------------- shop window (hero piece)
{
  const frame = flat(0x2c3a33, { roughness: 0.5 });
  // frame bars
  box(8.2, 0.18, 0.3, frame, 5.2, 0.95, WZ, 0.02, 21);
  box(8.2, 0.18, 0.3, frame, 5.2, 5.85, WZ, 0.02, 22);
  box(0.18, 5.0, 0.3, frame, 1.2, 3.4, WZ, 0.02, 23);
  box(0.18, 5.0, 0.3, frame, 9.2, 3.4, WZ, 0.02, 24);
  box(0.12, 5.0, 0.25, frame, 5.2, 3.4, WZ, 0.02, 25); // middle mullion
  box(8.0, 0.1, 0.25, frame, 5.2, 4.75, WZ, 0.02, 26); // transom bar
  // glass: faint reflective sheet
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(8.0, 4.9),
    new THREE.MeshStandardMaterial({
      color: 0xdff1ff,
      roughness: 0.05,
      metalness: 0.2,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    }),
  );
  glass.position.set(5.2, 3.4, WZ + 0.02);
  glass.userData.noAO = true;
  ground.add(glass);
  // golden "SALON" letters on the glass (seen from inside: mirrored)
  const tex = canvasTex(1024, 256, (g, w, h) => {
    g.font = "800 170px Montserrat, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.lineWidth = 14;
    g.strokeStyle = "#7a4a12";
    g.strokeText("SALON", w / 2, h / 2 + 8);
    g.fillStyle = "#f2c14e";
    g.fillText("SALON", w / 2, h / 2 + 8);
  });
  const letters = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 0.9),
    new THREE.MeshStandardMaterial({
      map: tex,
      transparent: true,
      alphaTest: 0.1,
      roughness: 0.3,
      metalness: 0.4,
      emissive: 0x4a3008,
      side: THREE.DoubleSide,
    }),
  );
  letters.position.set(5.2, 5.25, WZ + 0.05);
  ground.add(letters);
  // window display: a little shelf with a mannequin head and a fern
  box(7.6, 0.12, 0.9, flat(0xc79a6a, { roughness: 0.6 }), 5.2, 1.1, WZ + 0.45, 0.03, 27);
  const head = new THREE.Group();
  const hd = new THREE.Mesh(
    facet(new THREE.IcosahedronGeometry(0.42, 1), 0.04, 3),
    facetMat(flat(0xf6efe6, { roughness: 0.6 })),
  );
  hd.scale.set(0.85, 1.05, 0.9);
  hd.position.y = 0.85;
  head.add(hd);
  const wig = new THREE.Mesh(
    facet(new THREE.SphereGeometry(0.44, 10, 7, 0, Math.PI * 2, 0, Math.PI * 0.62), 0.06, 4),
    facetMat(flat(0xf3dc9a, { roughness: 0.6 })),
  );
  wig.position.y = 0.95;
  wig.scale.set(0.95, 1.1, 1.0);
  head.add(wig);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.26, 0.5, 9), hd.material);
  neck.position.y = 0.3;
  head.add(neck);
  head.position.set(3.0, 1.16, WZ + 0.45);
  head.rotation.y = 0.5;
  head.traverse((o) => (o.castShadow = true));
  ground.add(head);
  const pot = cyl(0.3, 0.24, 0.45, 9, flat(0xc4583e), 7.6, 1.39, WZ + 0.45, 0.06, 5);
  pot.castShadow = true;
  const fern = new THREE.Group();
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const leaf = new THREE.Mesh(
      facet(new THREE.ConeGeometry(0.12, 0.9, 4), 0.1, 30 + i),
      facetMat(flat(0x4f9a4a)),
    );
    leaf.position.set(Math.cos(a) * 0.2, 0.4, Math.sin(a) * 0.2);
    leaf.rotation.set(Math.sin(a) * 0.8, 0, -Math.cos(a) * 0.8);
    fern.add(leaf);
  }
  fern.position.set(7.6, 1.6, WZ + 0.45);
  ground.add(sway(fern, 3, 0.04));
}

// ---------------------------------------------------------------- outside: sidewalk, street, tram, facade
{
  const OZ = WZ - 0.4;
  box(26, 0.25, 4, flat(0xb9b2aa, { roughness: 0.9 }), 4, 0.0, OZ - 2, 0.05, 31); // sidewalk
  box(26, 0.12, 0.25, flat(0x8e8780), 4, 0.1, OZ - 4.1, 0.02, 32); // kerb
  box(26, 0.1, 7, flat(0x5b5a60, { roughness: 0.85 }), 4, -0.05, OZ - 7.6, 0.05, 33); // street
  for (const dz of [-6.2, -9.0])
    box(
      26,
      0.04,
      0.12,
      flat(0xa7a7ae, { metalness: 0.7, roughness: 0.3 }),
      4,
      0.02,
      OZ + dz,
      0,
      1,
      false,
    );
  // a lamp post and a bike on the sidewalk
  cyl(0.06, 0.08, 4.4, 8, flat(0x2c3a33), 1.8, 2.2, OZ - 3.4, 0.03, 34);
  const lampHead = cyl(0.32, 0.16, 0.3, 8, flat(0x2c3a33), 1.8, 4.5, OZ - 3.4, 0.03, 35);
  lampHead.castShadow = false;
  // opposite facade: pastel Gründerzeit house with stucco window frames
  const FZ = OZ - 12;
  const facadeCols = [0xf2c6a0, 0xf6e2b0, 0xd8e4cf];
  facadeCols.forEach((col, i) => {
    const x = -6 + i * 9;
    box(9, 14, 1, flat(col, { roughness: 0.85 }), x, 7, FZ, 0.03, 40 + i, false);
    box(9, 0.3, 1.3, flat(0xfaf3ea), x, 3.2, FZ + 0.1, 0.02, 50 + i, false);
    box(9, 0.3, 1.3, flat(0xfaf3ea), x, 13.8, FZ + 0.1, 0.02, 53 + i, false);
    for (let row = 0; row < 3; row++)
      for (let col2 = 0; col2 < 3; col2++) {
        const wx = x - 3 + col2 * 3;
        const wy = 4.8 + row * 3.1;
        box(
          1.3,
          2.0,
          0.2,
          flat(0x3e5a74, { roughness: 0.2, metalness: 0.3 }),
          wx,
          wy,
          FZ + 0.55,
          0.02,
          60 + row * 3 + col2,
          false,
        );
        box(1.6, 0.25, 0.4, flat(0xfaf3ea), wx, wy + 1.15, FZ + 0.6, 0.02, 70, false);
        box(1.6, 0.15, 0.4, flat(0xfaf3ea), wx, wy - 1.05, FZ + 0.6, 0.02, 71, false);
      }
    // ground floor shop with awning
    box(5.5, 2.4, 0.25, flat(0x2c3a33, { roughness: 0.3 }), x, 1.3, FZ + 0.55, 0.02, 80 + i, false);
    const aw = new THREE.Mesh(
      facet(new THREE.BoxGeometry(6, 0.12, 1.6, 6, 1, 2), 0.06, 90 + i),
      facetMat(flat([0xc4583e, 0x2f6e5a, 0xe0a33a][i], { roughness: 0.8 })),
    );
    aw.position.set(x, 2.9, FZ + 1.3);
    aw.rotation.x = 0.35;
    ground.add(aw);
  });
  // the tram: red and white Vienna-style, passes left → right twice
  const tram = new THREE.Group();
  const red = flat(0xd23a32, { roughness: 0.45 });
  const white = flat(0xf6f1ea, { roughness: 0.5 });
  const win = flat(0x2a3440, { roughness: 0.15, metalness: 0.4 });
  const tb = (w, h, d, m, x, y, z) => {
    const b = F(new THREE.BoxGeometry(w, h, d), m, 0.03, 7);
    b.position.set(x, y, z);
    tram.add(b);
  };
  tb(12, 1.3, 2.4, red, 0, 0.9, 0);
  tb(12, 1.2, 2.42, white, 0, 2.15, 0);
  tb(12, 0.35, 2.3, red, 0, 2.9, 0);
  for (let i = 0; i < 6; i++) tb(1.5, 0.85, 2.46, win, -5 + i * 2, 2.2, 0);
  tb(0.4, 0.6, 0.4, flat(0x333333), 0, 3.4, 0); // pantograph base
  const pant = F(new THREE.BoxGeometry(0.06, 1.2, 0.06), flat(0x333333), 0, 1);
  pant.position.set(0, 3.9, 0);
  pant.rotation.z = 0.5;
  tram.add(pant);
  tram.position.set(-30, 0.2, OZ - 7.6);
  ground.add(tram);
  onFrame((t) => {
    const k = ((t + 4) % 22) / 22; // one pass every 22 s
    tram.position.x = -26 + k * 60;
    tram.position.y = 0.2 + Math.sin(t * 9) * 0.01;
  });
  // overhead wire
  box(40, 0.03, 0.03, flat(0x222222), 4, 4.6, OZ - 7.6, 0, 1, false);
}

// ---------------------------------------------------------------- mirror station (left part of the back wall)
const bulbs = [];
{
  const counter = flat(0xf6efe6, { roughness: 0.4 });
  const wood = flat(0xb5835a, { roughness: 0.6 });
  box(10.2, 0.16, 1.2, counter, -4.6, 1.6, WZ + 0.6, 0.03, 101);
  box(10.2, 1.5, 1.0, wood, -4.6, 0.8, WZ + 0.55, 0.04, 102);
  // drawers
  for (let i = 0; i < 6; i++)
    box(1.5, 0.08, 0.05, flat(0xd8b48a), -8.6 + i * 1.6, 1.15, WZ + 1.07, 0, 1, false);
  // two arched mirrors with bulb frames
  // mirror: a soft silver-blue gradient with two diagonal sheen bands
  const mirrorTex = canvasTex(256, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, "#e9f2fa");
    gr.addColorStop(0.5, "#b8c9da");
    gr.addColorStop(1, "#8fa4ba");
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(255,255,255,0.55)";
    g.beginPath();
    g.moveTo(w * 0.15, h);
    g.lineTo(w * 0.45, h);
    g.lineTo(w, h * 0.35);
    g.lineTo(w, h * 0.18);
    g.fill();
    g.fillStyle = "rgba(255,255,255,0.35)";
    g.beginPath();
    g.moveTo(w * 0.55, h);
    g.lineTo(w * 0.62, h);
    g.lineTo(w, h * 0.62);
    g.lineTo(w, h * 0.54);
    g.fill();
  });
  const mirrorMat = new THREE.MeshStandardMaterial({
    map: mirrorTex,
    roughness: 0.1,
    metalness: 0.3,
  });
  const bulbMat = glowMat(0xffd59a, 2.2);
  for (const mx of [-7.4, -2.6]) {
    const shape = new THREE.Shape();
    shape.moveTo(-1.3, 0);
    shape.lineTo(1.3, 0);
    shape.lineTo(1.3, 2.4);
    shape.absarc(0, 2.4, 1.3, 0, Math.PI, false);
    shape.lineTo(-1.3, 0);
    const mg = new THREE.ShapeGeometry(shape, 16);
    // planar UVs over the arch (0..1)
    const up = mg.attributes.position;
    const uv = new Float32Array(up.count * 2);
    for (let i = 0; i < up.count; i++) uv.set([(up.getX(i) + 1.3) / 2.6, up.getY(i) / 3.7], i * 2);
    mg.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    const mir = new THREE.Mesh(mg, mirrorMat);
    mir.position.set(mx, 2.0, WZ + 0.13);
    ground.add(mir);
    const frameG = new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false });
    const fr = new THREE.Mesh(frameG, flat(0xe6c27a, { metalness: 0.6, roughness: 0.3 }));
    fr.scale.set(1.12, 1.07, 1);
    fr.position.set(mx, 1.88, WZ - 0.02);
    ground.add(fr);
    // bulbs around the arch
    for (let i = 0; i < 15; i++) {
      const k = i / 14;
      let x;
      let y;
      if (k < 0.25) {
        x = -1.5;
        y = (k / 0.25) * 2.4;
      } else if (k > 0.75) {
        x = 1.5;
        y = ((1 - k) / 0.25) * 2.4;
      } else {
        const a = Math.PI - ((k - 0.25) / 0.5) * Math.PI;
        x = Math.cos(a) * 1.5;
        y = 2.4 + Math.sin(a) * 1.5;
      }
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), bulbMat.clone());
      b.position.set(mx + x, 2.0 + y, WZ + 0.18);
      b.userData.noAO = true;
      b.userData.ph = r() * 6;
      ground.add(b);
      bulbs.push(b);
    }
  }
  // bottles, sprays, a hair-dryer and a cup on the counter
  const cols = [0xf28ab0, 0x7f5ad6, 0xffd23f, 0x3fb6a8, 0xffffff, 0x2c3a33, 0xe86a3a];
  for (let i = 0; i < 16; i++) {
    const x = -9.2 + i * 0.6 + r() * 0.2;
    if (x > -5.4 && x < -4.0) continue;
    const h = 0.35 + r() * 0.45;
    const b = cyl(
      0.11 + r() * 0.05,
      0.13,
      h,
      8,
      flat(cols[i % cols.length], { roughness: 0.3 }),
      x,
      1.68 + h / 2,
      WZ + 0.55 + r() * 0.25,
      0.05,
      110 + i,
    );
    if (i % 3 === 0)
      cyl(0.04, 0.05, 0.14, 6, flat(0x222222), x, 1.68 + h + 0.07, b.position.z, 0, 1);
  }
  // round brush + comb laid flat
  box(0.9, 0.03, 0.12, flat(0x2c2c30), -4.8, 1.7, WZ + 0.95, 0, 1);
  // coffee cup with steam
  cyl(0.13, 0.11, 0.22, 10, flat(0xffffff, { roughness: 0.3 }), -4.4, 1.79, WZ + 0.8, 0.03, 120);
  const steamMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });
  const steam = Array.from({ length: 6 }, (_, i) => {
    const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 0), steamMat);
    s.userData.ph = i / 6;
    ground.add(s);
    return s;
  });
  onFrame((t) => {
    steam.forEach((s) => {
      const k = (t * 0.4 + s.userData.ph) % 1;
      s.position.set(-4.4 + Math.sin(k * 7 + s.userData.ph * 9) * 0.06, 1.95 + k * 0.8, WZ + 0.8);
      s.scale.setScalar(0.6 + k * 1.6);
    });
    bulbs.forEach((b) => {
      b.material.emissiveIntensity = 2.0 + 0.4 * Math.sin(t * 3 + b.userData.ph);
    });
  });
  // a pendant light over the counter
}

// ---------------------------------------------------------------- left wall: shelves, framed photos
{
  const shelfMat = flat(0xb5835a, { roughness: 0.6 });
  const cols = [0xf28ab0, 0xb48ae6, 0xffd23f, 0x6ac3b8, 0xffffff, 0xe86a3a, 0x2c3a33];
  for (let row = 0; row < 3; row++) {
    const y = 3.0 + row * 1.15;
    box(0.5, 0.08, 6, shelfMat, LX + 0.3, y, -2, 0.03, 130 + row);
    for (let i = 0; i < 11; i++) {
      const z = -4.6 + i * 0.5;
      const h = 0.3 + r() * 0.35;
      cyl(
        0.1,
        0.12,
        h,
        8,
        flat(cols[(i + row) % cols.length], { roughness: 0.3 }),
        LX + 0.3,
        y + 0.04 + h / 2,
        z,
        0.05,
        140 + i + row * 11,
      );
    }
  }
  // framed photos of hairstyles (simple coloured heads)
  const photo = (z, y, bg, hair) => {
    const tex = canvasTex(256, 320, (g, w, h) => {
      g.fillStyle = bg;
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#f1c09a";
      g.beginPath();
      g.ellipse(w / 2, h * 0.52, 62, 78, 0, 0, 7);
      g.fill();
      g.fillStyle = hair;
      g.beginPath();
      g.ellipse(w / 2, h * 0.42, 92, 96, 0, Math.PI, 0);
      g.fill();
      g.fillRect(w / 2 - 92, h * 0.42, 34, 130);
      g.fillRect(w / 2 + 58, h * 0.42, 34, 130);
    });
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 1.5),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 }),
    );
    m.rotation.y = Math.PI / 2;
    m.position.set(LX + 0.09, y, z);
    ground.add(m);
    box(0.06, 1.66, 1.36, flat(0x2c2c30), LX + 0.04, y, z, 0, 1, false);
  };
  photo(2.5, 3.6, "#f6d6c8", "#f3dc9a");
  photo(4.3, 3.3, "#cfe3dc", "#d8623a");
  photo(6.1, 3.7, "#e8dcf6", "#f2f2f6");
}

// ---------------------------------------------------------------- props on the floor
// hood dryer (Trockenhaube) on the left
{
  const g = new THREE.Group();
  const pink = flat(0xf2a7b8, { roughness: 0.35 });
  const base = F(new THREE.CylinderGeometry(0.55, 0.65, 0.12, 12), chrome, 0.03, 1);
  base.position.y = 0.06;
  g.add(base);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8), chrome);
  pole.position.y = 1.15;
  g.add(pole);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.7), chrome);
  arm.position.set(0, 2.2, 0.3);
  g.add(arm);
  const hood = F(
    new THREE.SphereGeometry(0.75, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
    pink,
    0.05,
    3,
  );
  hood.material.side = THREE.DoubleSide;
  hood.position.set(0, 2.25, 0.75);
  hood.rotation.x = 0.55;
  g.add(hood);
  const visor = new THREE.Mesh(
    new THREE.TorusGeometry(0.68, 0.06, 6, 20),
    flat(0xffffff, { roughness: 0.3 }),
  );
  visor.position.set(0, 1.95, 1.05);
  visor.rotation.x = Math.PI / 2 + 0.55;
  g.add(visor);
  // seat under it
  const seat = F(new THREE.BoxGeometry(1.1, 0.3, 1.0), flat(0xe7a3a8, { roughness: 0.6 }), 0.04, 9);
  seat.position.set(0, 0.85, 1.1);
  g.add(seat);
  const sleg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.7, 6), chrome);
  sleg.position.set(0, 0.35, 1.1);
  g.add(sleg);
  g.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  g.position.set(-8.0, 0, -0.5);
  g.rotation.y = 0.9;
  ground.add(g);
}
// a second (empty) styling chair at the mirror
function chair(x, z, rot, seat = 0x1c1a20) {
  const g = new THREE.Group();
  const leather = flat(seat, { roughness: 0.35 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 0.12, 14), chrome);
  base.position.y = 0.06;
  g.add(base);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.8, 10), chrome);
  post.position.y = 0.5;
  g.add(post);
  const s = F(new THREE.BoxGeometry(1.2, 0.3, 1.1, 2, 1, 2), leather, 0.03, 4);
  s.position.y = 1.05;
  g.add(s);
  const back = F(new THREE.BoxGeometry(1.15, 1.4, 0.25, 2, 2, 1), leather, 0.03, 5);
  back.position.set(0, 1.9, -0.5);
  back.rotation.x = -0.12;
  g.add(back);
  for (const sx of [-1, 1]) {
    const a = F(new THREE.BoxGeometry(0.16, 0.12, 0.9), chrome, 0.02, 6);
    a.position.set(sx * 0.66, 1.45, -0.05);
    g.add(a);
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 6), chrome);
    l.position.set(sx * 0.66, 1.25, 0.3);
    g.add(l);
  }
  const foot = F(new THREE.BoxGeometry(0.9, 0.06, 0.35), chrome, 0.02, 7);
  foot.position.set(0, 0.4, 0.8);
  g.add(foot);
  g.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  g.position.set(x, 0, z);
  g.rotation.y = rot;
  ground.add(g);
  return g;
}
chair(-6.0, -5.2, 0.2, 0x3a5a4a);
// wash basin on the right, against the window corner
{
  const g = new THREE.Group();
  const bowl = F(
    new THREE.SphereGeometry(0.6, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    flat(0x1c1a20, { roughness: 0.2 }),
    0.03,
    2,
  );
  bowl.material.side = THREE.DoubleSide;
  bowl.position.set(0, 1.45, 0);
  g.add(bowl);
  const ped = F(new THREE.BoxGeometry(0.9, 1.0, 0.8), flat(0xf6efe6, { roughness: 0.4 }), 0.03, 3);
  ped.position.y = 0.5;
  g.add(ped);
  const tap = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.03, 6, 12, Math.PI), chrome);
  tap.position.set(0, 1.6, -0.5);
  g.add(tap);
  const seat = F(
    new THREE.BoxGeometry(1.0, 0.3, 1.2),
    flat(0x1c1a20, { roughness: 0.35 }),
    0.03,
    4,
  );
  seat.position.set(0, 0.85, 1.1);
  g.add(seat);
  g.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  g.position.set(10.2, 0, -4.0);
  g.rotation.y = -0.6;
  ground.add(g);
}
// monstera in a terracotta pot (front right)
{
  const g = new THREE.Group();
  const pot = F(
    new THREE.CylinderGeometry(0.55, 0.42, 0.8, 10),
    flat(0xc4583e, { roughness: 0.8 }),
    0.06,
    1,
  );
  pot.position.y = 0.4;
  g.add(pot);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + r() * 0.4;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 1.6, 5), flat(0x4f8a3a));
    stem.position.set(Math.cos(a) * 0.35, 1.5, Math.sin(a) * 0.35);
    stem.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5);
    g.add(stem);
    const leaf = F(
      new THREE.CircleGeometry(0.5, 7),
      flat(0x3d8a44, { side: THREE.DoubleSide }),
      0.1,
      10 + i,
    );
    leaf.position.set(Math.cos(a) * 0.85, 2.15 + r() * 0.4, Math.sin(a) * 0.85);
    leaf.rotation.set(-Math.PI / 2 + 0.6 * Math.sin(a), a, 0.4);
    leaf.scale.set(1, 1.3, 1);
    g.add(leaf);
  }
  g.traverse((o) => o.isMesh && (o.castShadow = true));
  g.position.set(8.4, 0, 3.4);
  ground.add(sway(g, 5, 0.015));
}
// broom leaning on the left wall, a pile of cut hair at its foot
{
  const handle = cyl(0.04, 0.04, 3.2, 6, flat(0xc79a6a), LX + 0.9, 1.6, 8.4, 0, 1);
  handle.rotation.z = -0.25;
  const head = box(0.9, 0.25, 0.25, flat(0x2c2c30), LX + 1.3, 0.15, 8.4, 0.03, 160);
  head.rotation.y = 0.2;
  const hair = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.5, 3),
    flat(0x4a2a1a),
    90,
  );
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const c = new THREE.Color();
  for (let i = 0; i < 90; i++) {
    q.setFromEuler(new THREE.Euler(Math.PI / 2 + (r() - 0.5) * 0.6, r() * 6, 0));
    m.compose(V(LX + 2.2 + (r() - 0.5) * 0.9, 0.03, 8.0 + (r() - 0.5) * 0.7), q, V(1, 1, 1));
    hair.setMatrixAt(i, m);
    hair.setColorAt(i, c.setHex([0x4a2a1a, 0x2a1a12, 0xd8a050, 0x6a3a22][i % 4]));
  }
  ground.add(hair);
}
// a small round magazine table + pink pouf near the left
{
  cyl(0.6, 0.6, 0.06, 14, flat(0xf6efe6, { roughness: 0.3 }), -7.4, 1.0, 4.4, 0.03, 170);
  cyl(0.05, 0.05, 1.0, 6, flat(0xc8a23a, { metalness: 0.7, roughness: 0.3 }), -7.4, 0.5, 4.4, 0, 1);
  box(0.5, 0.04, 0.65, flat(0xf28ab0), -7.3, 1.05, 4.3, 0.02, 171);
  box(0.5, 0.04, 0.65, flat(0x6ac3b8), -7.5, 1.09, 4.5, 0.02, 172);
  cyl(0.5, 0.5, 0.6, 12, flat(0xe7a3a8, { roughness: 0.9 }), -6.6, 0.3, 6.2, 0.05, 173);
}

// ---------------------------------------------------------------- ceiling things: pendants, hanging plants, fan
{
  const globeMat = glowMat(0xffe2b0, 1.5);
  for (const [x, z] of [
    [-6.5, -2.5],
    [-3.0, -4.5],
    [3.6, -4.0],
    [6.8, 0.5],
  ]) {
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 2.4, 4), flat(0x222222));
    cord.position.set(x, CEIL - 1.2, z);
    ground.add(cord);
    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 8), globeMat);
    globe.position.set(x, CEIL - 2.5, z);
    globe.userData.noAO = true;
    ground.add(globe);
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.16, 0.15, 8),
      flat(0xc8a23a, { metalness: 0.7, roughness: 0.3 }),
    );
    cap.position.set(x, CEIL - 2.18, z);
    ground.add(cap);
  }
  // hanging pothos in macramé pots
  for (const [x, z, s] of [
    [-8.8, 1.8, 3],
    [9.0, -6.4, 7],
  ]) {
    const g = new THREE.Group();
    const pot = F(
      new THREE.SphereGeometry(0.35, 9, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
      flat(0xf6efe6),
      0.06,
      s,
    );
    g.add(pot);
    for (let i = 0; i < 4; i++) {
      const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.6, 3), flat(0xe8d8bc));
      const a = (i / 4) * Math.PI * 2;
      cord.position.set(Math.cos(a) * 0.17, 0.75, Math.sin(a) * 0.17);
      cord.rotation.set(Math.sin(a) * 0.2, 0, -Math.cos(a) * 0.2);
      g.add(cord);
    }
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      const len = 0.8 + r() * 1.4;
      const vine = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, len, 3), flat(0x4f8a3a));
      vine.position.set(Math.cos(a) * 0.3, -len / 2, Math.sin(a) * 0.3);
      g.add(vine);
      for (let k = 0; k < 4; k++) {
        const leaf = F(
          new THREE.CircleGeometry(0.1, 5),
          flat(0x5fae4a, { side: THREE.DoubleSide }),
          0.1,
          i * 4 + k,
        );
        leaf.position.set(Math.cos(a) * 0.36, -k * (len / 4) - 0.1, Math.sin(a) * 0.36);
        leaf.rotation.y = a;
        g.add(leaf);
      }
    }
    g.position.set(x, CEIL - 1.8, z);
    ground.add(sway(g, s, 0.03));
  }
}

// ---------------------------------------------------------------- sunbeam + dust
{
  // a soft golden shaft from the window down to the floor (additive, no depth write)
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xffd9a0,
    transparent: true,
    opacity: 0.08,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 3.2, 9, 6, 1, true), beamMat);
  beam.position.set(4.6, 3.2, -3.4);
  beam.rotation.set(0.75, 0, -0.18);
  beam.userData.noAO = true;
  ground.add(beam);
  fireflies(60, { area: [1.5, 9, 0.6, 5.5, -7, 1], color: 0xfff1cc, size: 0.02, seed: 46 });
  const warm = new THREE.PointLight(0xffc890, 18, 16, 1.4);
  warm.position.set(5.2, 4.5, -5.8);
  ground.add(warm);
}

finishSet({ ground: 0xeadbc8 });
