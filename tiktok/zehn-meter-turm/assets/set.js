// #65 10-Meter-Turm — an indoor diving hall on a November evening. The deep
// diving pool (5 m, turquoise, lit from below, caustics dancing on the
// floor) sits in front of a concrete diving tower with platforms at 3, 5,
// 7.5 and 10 m (hero piece), chrome railings and a red "10" on the top
// edge. Behind it a tiled wall with the big hall clock; on the right a
// glass facade to the blue-hour sky with snow falling outside; on the left
// a small stand with spectators looking up. Wooden roof beams with warm
// pendant lamps. Life: the water ripples, caustics drift, snow falls, the
// spectators sway, the clock's second hand runs, steam rises off the water.
//
// Scale: 1 unit = 1 m. Water surface y = 0, deck y = 0.3, pool floor
// y = -5. The jumper lands near the origin.
import {
  THREE,
  flat,
  ground,
  onFrame,
  facet,
  facetMat,
  patches,
  rng,
  V,
  real,
  roundedBox,
  scene,
} from "./world.js";
import { setSky, finishSet, F, fireflies } from "./environments.js";
import { person } from "./people.js";

export const DECK = 0.3;
export const POOL = { x0: -8, x1: 8, z0: -2.4, z1: 11, floor: -5 };
export const PLATFORM = { y: 10, edge: -0.9 }; // top surface, front edge (z)
export const export_plats = [];

// ---------------------------------------------------------------- light
// blue hour outside the glass, warm lamps inside
setSky({
  top: [0.05, 0.08, 0.22],
  mid: [0.14, 0.2, 0.42],
  hor: [0.62, 0.48, 0.55],
  below: [0.1, 0.12, 0.18],
  sun: [0.5, 0.35, 0.3],
  sunDir: [1, 0.06, -0.3],
  cloud: [0x000000, 0x000000],
  noClouds: true,
  birds: false,
  stars: 0.15,
  hemi: [0xdfe8ff, 0x3a5a66, 1.6],
  key: [0xfff0dc, 2.6],
  keyPos: [5, 16, 9],
  rim: [0x7fd8ff, 0.9],
  fog: [40, 120],
});

// ---------------------------------------------------------------- deck tiles
const tileTex = (() => {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  const rr = rng(7);
  for (let y = 0; y < 8; y++)
    for (let x = 0; x < 8; x++) {
      const v = 226 + Math.floor(rr() * 16);
      g.fillStyle = `rgb(${v},${v - 2},${v - 8})`;
      g.fillRect(x * 32, y * 32, 32, 32);
    }
  g.strokeStyle = "rgba(120,125,130,0.55)";
  g.lineWidth = 2;
  for (let i = 0; i <= 8; i++) {
    g.beginPath();
    g.moveTo(i * 32, 0);
    g.lineTo(i * 32, 256);
    g.moveTo(0, i * 32);
    g.lineTo(256, i * 32);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();
const deckMat = (rx, rz) => {
  const t = tileTex.clone();
  t.repeat.set(rx, rz);
  t.needsUpdate = true;
  return new THREE.MeshPhysicalMaterial({
    map: t,
    roughness: 0.32,
    clearcoat: 0.6,
    clearcoatRoughness: 0.2,
  });
};
// deck = a big slab with the pool cut out: four pieces around it
const HALL = { x0: -16, x1: 16, z0: -13, z1: 22 };
const deckPiece = (x0, x1, z0, z1) => {
  const w = x1 - x0;
  const d = z1 - z0;
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.6, d), deckMat(w / 4, d / 4));
  m.position.set((x0 + x1) / 2, DECK - 0.3, (z0 + z1) / 2);
  m.receiveShadow = true;
  ground.add(m);
};
deckPiece(HALL.x0, POOL.x0, HALL.z0, HALL.z1);
deckPiece(POOL.x1, HALL.x1, HALL.z0, HALL.z1);
deckPiece(POOL.x0, POOL.x1, HALL.z0, POOL.z0);
deckPiece(POOL.x0, POOL.x1, POOL.z1, HALL.z1);
// rounded edge stones around the pool + a dark overflow gutter
{
  const edge = real.ceramic(0xf3f1ea, { roughness: 0.3 });
  const gut = flat(0x3b4a52, { roughness: 0.6 });
  const W = POOL.x1 - POOL.x0;
  const D = POOL.z1 - POOL.z0;
  for (const [x, z, w, d] of [
    [0, POOL.z0 - 0.25, W + 1, 0.5],
    [0, POOL.z1 + 0.25, W + 1, 0.5],
    [POOL.x0 - 0.25, (POOL.z0 + POOL.z1) / 2, 0.5, D],
    [POOL.x1 + 0.25, (POOL.z0 + POOL.z1) / 2, 0.5, D],
  ]) {
    const m = new THREE.Mesh(roundedBox(w, 0.14, d, 0.05), edge);
    m.position.set(x, DECK + 0.05, z);
    m.receiveShadow = true;
    ground.add(m);
  }
  for (const [x, z, w, d] of [
    [0, POOL.z1 + 0.62, W + 1.2, 0.22],
    [POOL.x0 - 0.62, (POOL.z0 + POOL.z1) / 2, 0.22, D],
    [POOL.x1 + 0.62, (POOL.z0 + POOL.z1) / 2, 0.22, D],
  ]) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, d), gut);
    m.position.set(x, DECK + 0.005, z);
    ground.add(m);
  }
}

// ---------------------------------------------------------------- pool basin
// blue tiles (walls + floor), black lane cross on the floor, caustics
const causticTex = (() => {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = "#000";
  g.fillRect(0, 0, 256, 256);
  const rr = rng(31);
  g.strokeStyle = "rgba(255,255,255,0.9)";
  g.lineCap = "round";
  for (let i = 0; i < 70; i++) {
    const x = rr() * 256;
    const y = rr() * 256;
    g.lineWidth = 1.5 + rr() * 3;
    g.beginPath();
    g.moveTo(x, y);
    for (let k = 0; k < 4; k++) g.lineTo(x + (rr() - 0.5) * 70, y + (rr() - 0.5) * 70);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
})();
const poolTileTex = (() => {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  const rr = rng(9);
  for (let y = 0; y < 8; y++)
    for (let x = 0; x < 8; x++) {
      const v = rr() * 18;
      g.fillStyle = `rgb(${40 + v},${150 + v},${200 + v * 0.5})`;
      g.fillRect(x * 16, y * 16, 16, 16);
    }
  g.strokeStyle = "rgba(230,250,255,0.6)";
  g.lineWidth = 1.5;
  for (let i = 0; i <= 8; i++) {
    g.beginPath();
    g.moveTo(i * 16, 0);
    g.lineTo(i * 16, 128);
    g.moveTo(0, i * 16);
    g.lineTo(128, i * 16);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();
{
  const W = POOL.x1 - POOL.x0;
  const D = POOL.z1 - POOL.z0;
  const H = DECK - POOL.floor;
  const mk = (w, h, rx, ry) => {
    const t = poolTileTex.clone();
    t.repeat.set(rx, ry);
    t.needsUpdate = true;
    return new THREE.MeshStandardMaterial({
      map: t,
      roughness: 0.25,
      emissive: 0xffffff,
      emissiveMap: causticTex,
      emissiveIntensity: 0.0,
    });
  };
  const floorMat = mk(W, D, W / 2, D / 2);
  floorMat.emissiveIntensity = 0.35;
  floorMat.emissive = new THREE.Color(0x9fefff);
  floorMat.emissiveMap = causticTex.clone();
  floorMat.emissiveMap.repeat.set(W / 5, D / 5);
  floorMat.emissiveMap.needsUpdate = true;
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, D), floorMat);
  fl.rotation.x = -Math.PI / 2;
  fl.position.set(0, POOL.floor, (POOL.z0 + POOL.z1) / 2);
  fl.receiveShadow = true;
  ground.add(fl);
  onFrame((t) => {
    floorMat.emissiveMap.offset.set(Math.sin(t * 0.4) * 0.15 + t * 0.03, t * 0.05);
  });
  // lane cross (diving target) on the floor
  const dark = flat(0x13263a, { roughness: 0.5 });
  const lane = new THREE.Mesh(new THREE.PlaneGeometry(0.3, D - 2), dark);
  lane.rotation.x = -Math.PI / 2;
  lane.position.set(0, POOL.floor + 0.01, (POOL.z0 + POOL.z1) / 2);
  ground.add(lane);
  const cross = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.3), dark);
  cross.rotation.x = -Math.PI / 2;
  cross.position.set(0, POOL.floor + 0.01, 0.3);
  ground.add(cross);
  // walls (inward facing)
  const walls = [
    [W, H, 0, (POOL.z0 + 0) * 1, 0, W / 2, H / 2],
    [W, H, 0, POOL.z1, Math.PI, W / 2, H / 2],
    [D, H, POOL.x0, (POOL.z0 + POOL.z1) / 2, Math.PI / 2, D / 2, H / 2],
    [D, H, POOL.x1, (POOL.z0 + POOL.z1) / 2, -Math.PI / 2, D / 2, H / 2],
  ];
  walls.forEach(([w, h, x, z, ry, rx, ryy], i) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mk(w, h, rx, ryy));
    m.position.set(i < 2 ? 0 : x, (DECK + POOL.floor) / 2, i < 2 ? (i ? POOL.z1 : POOL.z0) : z);
    m.rotation.y = ry;
    m.receiveShadow = true;
    ground.add(m);
  });
  // underwater lights: glowing rounded panels on the side walls
  const lm = new THREE.MeshBasicMaterial({ color: 0xd8fbff });
  for (const z of [0.5, 4.5, 8.5])
    for (const sx of [-1, 1]) {
      const l = new THREE.Mesh(new THREE.CircleGeometry(0.28, 24), lm);
      l.position.set(sx * (POOL.x1 - 0.02), -1.4, z);
      l.rotation.y = -sx * (Math.PI / 2);
      l.userData.noAO = true;
      ground.add(l);
    }
  for (const z of [1, 7]) {
    const pl = new THREE.PointLight(0x7fe9ff, 6, 12, 1.6);
    pl.position.set(0, -2.6, z);
    ground.add(pl);
  }
  // chrome pool ladders
  const chrome = real.metal(0xe8edf2, { roughness: 0.12 });
  for (const [x, z] of [
    [POOL.x1 - 0.1, 6.5],
    [POOL.x0 + 0.1, 3.5],
  ]) {
    const g = new THREE.Group();
    for (const dz of [-0.28, 0.28]) {
      const curve = new THREE.CatmullRomCurve3([
        V(0, -1.6, dz),
        V(0, DECK + 0.2, dz),
        V(0.25, DECK + 0.95, dz),
        V(0.7, DECK + 0.9, dz),
        V(0.75, DECK, dz),
      ]);
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.035, 12), chrome);
      tube.castShadow = true;
      g.add(tube);
    }
    for (let k = 0; k < 3; k++) {
      const st = new THREE.Mesh(roundedBox(0.12, 0.04, 0.56, 0.015), chrome);
      st.position.set(-0.05, -0.2 - k * 0.45, 0);
      g.add(st);
    }
    g.position.set(x, 0, z);
    if (x < 0) g.rotation.y = Math.PI;
    else g.rotation.y = 0;
    g.scale.x = x < 0 ? 1 : -1;
    ground.add(g);
  }
}

// ---------------------------------------------------------------- water
// gently moving surface, see-through turquoise; scene.js adds splashes
const WG = new THREE.PlaneGeometry(POOL.x1 - POOL.x0, POOL.z1 - POOL.z0, 96, 120);
WG.rotateX(-Math.PI / 2);
WG.translate(0, 0, (POOL.z0 + POOL.z1) / 2);
const WBASE = Float32Array.from(WG.attributes.position.array);
export const waterMat = new THREE.MeshPhysicalMaterial({
  color: 0x3fc4de,
  roughness: 0.04,
  metalness: 0,
  transparent: true,
  opacity: 0.62,
  clearcoat: 1,
  clearcoatRoughness: 0.03,
  side: THREE.DoubleSide,
  depthWrite: false,
});
export const water = new THREE.Mesh(WG, waterMat);
water.receiveShadow = true;
water.userData.noAO = true;
water.renderOrder = 2;
scene.add(water);
// waves(x, z, t) → extra height; scene.js registers impact rings here
export const waveSources = [];
export function waterHeight(x, z, t) {
  let h = 0.025 * Math.sin(x * 1.3 + t * 1.6) + 0.02 * Math.sin(z * 1.7 - t * 1.25 + x * 0.4);
  for (const s of waveSources) {
    const dt = t - s.at;
    if (dt <= 0 || dt > s.life) continue;
    const d = Math.hypot((x - s.x) / (s.sx ?? 1), (z - s.z) / (s.sz ?? 1));
    const front = dt * s.speed;
    const k = d - front;
    const env = Math.exp(-dt / (s.life * 0.45)) * Math.exp(-(k * k) / 0.6);
    h += s.amp * env * Math.cos(k * 4.2);
    // the crater right at the impact
    if (s.crater)
      h -= s.crater * Math.exp(-(d * d) / 0.5) * Math.exp(-dt * 3.5) * (dt < 0.5 ? 1 : 0.4);
  }
  return h;
}
onFrame((t) => {
  const p = WG.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = WBASE[i * 3];
    const z = WBASE[i * 3 + 2];
    p.setY(i, waterHeight(x, z, t));
  }
  p.needsUpdate = true;
  WG.computeVertexNormals();
});

// ---------------------------------------------------------------- diving tower (hero piece)
const concrete = flat(0xc8c3bb, { roughness: 0.85 });
const concreteDark = flat(0xa29d96, { roughness: 0.9 });
const chrome = real.metal(0xe9eef3, { roughness: 0.14 });
export const tower = new THREE.Group();
ground.add(tower);
{
  // two thick columns behind the pool edge
  for (const x of [-2.6, 2.6]) {
    const col = new THREE.Mesh(
      patches(facet(new THREE.BoxGeometry(1.1, 11, 1.4, 2, 12, 2), 0.03, 3), {
        amt: 0.06,
        scale: 0.5,
        seed: 4,
      }),
      facetMat(concrete),
    );
    col.position.set(x, DECK + 5.5 - 0.6, -4.6);
    col.castShadow = col.receiveShadow = true;
    tower.add(col);
  }
  // platforms: [height, x-centre, width, front edge z]
  const plats = [
    [3, -4.6, 3.0, -1.6],
    [5, 4.6, 3.0, -1.4],
    [7.5, -4.4, 3.2, -1.2],
    [PLATFORM.y, 0, 3.4, PLATFORM.edge],
  ];
  export_plats.push(...plats);
  for (const [h, x, w, edge] of plats) {
    const back = -5.4;
    const d = edge - back;
    const slab = new THREE.Mesh(roundedBox(w, 0.42, d, 0.06), concrete);
    slab.position.set(x, h - 0.21, (edge + back) / 2);
    slab.castShadow = slab.receiveShadow = true;
    tower.add(slab);
    // non-slip top (dark green mat) + a white front stripe
    const mat = new THREE.Mesh(
      roundedBox(w - 0.1, 0.03, d - 0.05, 0.012),
      real.rubber(0x2f6b5a, { roughness: 0.85 }),
    );
    mat.position.set(x, h + 0.012, (edge + back) / 2);
    mat.receiveShadow = true;
    tower.add(mat);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, 0.02), flat(0xf4f4f4));
    stripe.position.set(x, h - 0.08, edge + 0.01);
    tower.add(stripe);
    // the height number on the front
    const lab = numberPlate(h === 7.5 ? "7,5" : String(h), h === PLATFORM.y ? 0xe8343a : 0x2b5fb0);
    lab.position.set(x + w / 2 - 0.45, h - 0.24, edge + 0.03);
    tower.add(lab);
    // chrome railings on the sides: top rail + posts
    for (const sx of [-1, 1]) {
      const rx = x + sx * (w / 2 - 0.08);
      const len = d - 0.7;
      const top = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, len, 12), chrome);
      top.rotation.x = Math.PI / 2;
      top.position.set(rx, h + 1.05, back + 0.2 + len / 2);
      top.castShadow = true;
      tower.add(top);
      const mid = top.clone();
      mid.position.y = h + 0.55;
      tower.add(mid);
      for (let k = 0; k < 3; k++) {
        const z = lerpN(back + 0.2, back + 0.2 + len, k / 2);
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.05, 10), chrome);
        post.position.set(rx, h + 0.52, z);
        post.castShadow = true;
        tower.add(post);
      }
    }
  }
  const stairWall = new THREE.Mesh(
    patches(facet(new THREE.BoxGeometry(3.6, 10.8, 0.4, 4, 12, 1), 0.03, 7), {
      amt: 0.05,
      scale: 0.5,
      seed: 8,
    }),
    facetMat(concreteDark),
  );
  stairWall.position.set(0, DECK + 5.1, -6.5);
  stairWall.castShadow = stairWall.receiveShadow = true;
  tower.add(stairWall);
}
function lerpN(a, b, k) {
  return a + (b - a) * k;
}
function numberPlate(txt, color) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const g = c.getContext("2d");
  g.fillStyle = "#" + color.toString(16).padStart(6, "0");
  g.beginPath();
  g.roundRect(6, 6, 244, 116, 26);
  g.fill();
  g.fillStyle = "#fff";
  g.font = "900 84px Montserrat, Arial, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(txt + " m", 128, 68);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(0.72, 0.36),
    new THREE.MeshStandardMaterial({ map: t, roughness: 0.4 }),
  );
  return m;
}

// ---------------------------------------------------------------- hall: walls, roof, glass facade
const wallTile = (() => {
  const t = tileTex.clone();
  t.needsUpdate = true;
  return t;
})();
{
  // back wall: light tiles with a turquoise band
  const back = new THREE.Mesh(
    new THREE.BoxGeometry(HALL.x1 - HALL.x0, 17, 0.4),
    (() => {
      const t = wallTile.clone();
      t.repeat.set(8, 4.2);
      t.needsUpdate = true;
      return new THREE.MeshStandardMaterial({ map: t, roughness: 0.5 });
    })(),
  );
  back.position.set(0, 8.5, HALL.z0);
  back.receiveShadow = true;
  ground.add(back);
  const band = new THREE.Mesh(new THREE.BoxGeometry(HALL.x1 - HALL.x0, 0.9, 0.05), flat(0x18a3b8));
  band.position.set(0, 3.2, HALL.z0 + 0.23);
  ground.add(band);
  // left wall (stands side), plaster
  const left = F(
    new THREE.BoxGeometry(0.4, 17, HALL.z1 - HALL.z0, 1, 8, 16),
    flat(0xe6dfd2, { roughness: 0.9 }),
    0.03,
    12,
  );
  left.position.set(HALL.x0, 8.5, (HALL.z0 + HALL.z1) / 2);
  left.receiveShadow = true;
  ground.add(left);
  // roof: dark slab + glulam beams + pendant lamps
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(HALL.x1 - HALL.x0 + 2, 0.4, HALL.z1 - HALL.z0),
    flat(0x2a2f38, { roughness: 1 }),
  );
  roof.position.set(0, 17.2, (HALL.z0 + HALL.z1) / 2);
  ground.add(roof);
  const wood = real.wood(0xc48a52, { roughness: 0.55 });
  for (let z = HALL.z0 + 3; z < HALL.z1; z += 5) {
    const beam = new THREE.Mesh(roundedBox(HALL.x1 - HALL.x0, 1.1, 0.5, 0.06), wood);
    beam.position.set(0, 16.4, z);
    ground.add(beam);
  }
  const lampMat = new THREE.MeshBasicMaterial({ color: 0xffe2b0 });
  const shade = real.metal(0x2c2f35, { roughness: 0.4 });
  for (let z = HALL.z0 + 5.5; z < HALL.z1 - 2; z += 5)
    for (const x of [-10, -4.5, 4.5, 10]) {
      const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 3, 6), shade);
      cord.position.set(x, 14.4, z);
      ground.add(cord);
      const sh = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.5, 32, 1, true), shade);
      sh.position.set(x, 12.9, z);
      ground.add(sh);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 12), lampMat);
      bulb.position.set(x, 12.68, z);
      bulb.userData.noAO = true;
      ground.add(bulb);
    }
  for (const [x, z] of [
    [-6, 3],
    [6, 3],
    [0, 12],
  ]) {
    const pl = new THREE.PointLight(0xffd9a8, 40, 30, 1.8);
    pl.position.set(x, 12, z);
    ground.add(pl);
  }
  // right side: glass facade with mullions, the blue-hour sky behind
  const frame = real.metal(0x3b4048, { roughness: 0.45 });
  const gx = HALL.x1;
  for (let z = HALL.z0; z <= HALL.z1; z += 3.5) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.25, 17, 0.25), frame);
    m.position.set(gx, 8.5, z);
    m.castShadow = true;
    ground.add(m);
  }
  for (const y of [0.6, 6, 11.5, 16.8]) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.22, HALL.z1 - HALL.z0), frame);
    m.position.set(gx, y, (HALL.z0 + HALL.z1) / 2);
    ground.add(m);
  }
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(HALL.z1 - HALL.z0, 17),
    new THREE.MeshPhysicalMaterial({
      color: 0xbfd8ea,
      roughness: 0.05,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    }),
  );
  glass.rotation.y = -Math.PI / 2;
  glass.position.set(gx, 8.5, (HALL.z0 + HALL.z1) / 2);
  glass.userData.noAO = true;
  ground.add(glass);
  // outside: snowy ground, dark pines, a lit house far away
  const snow = new THREE.Mesh(
    patches(facet(new THREE.PlaneGeometry(60, 90, 20, 30), 0.05, 3), { amt: 0.08, seed: 3 }),
    facetMat(flat(0xdfe8f6, { roughness: 0.9 })),
  );
  snow.rotation.x = -Math.PI / 2;
  snow.position.set(gx + 30, 0.05, 5);
  ground.add(snow);
  const pineMat = flat(0x1d3a3a, { roughness: 0.9 });
  const rp = rng(41);
  for (let i = 0; i < 18; i++) {
    const h = 5 + rp() * 6;
    const p = F(new THREE.ConeGeometry(1.4 + rp(), h, 7), pineMat, 0.08, i);
    p.position.set(gx + 9 + rp() * 22, h / 2, -30 + rp() * 60);
    ground.add(p);
    const cap = F(new THREE.ConeGeometry(0.8, h * 0.35, 7), flat(0xeef4ff), 0.06, i + 50);
    cap.position.set(p.position.x, h * 0.86, p.position.z);
    ground.add(cap);
  }
  // street lamps glowing outside
  for (const z of [-6, 8, 20]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 5, 8), frame);
    pole.position.set(gx + 6, 2.5, z);
    ground.add(pole);
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 16, 10),
      new THREE.MeshBasicMaterial({ color: 0xffc77a }),
    );
    lamp.position.set(gx + 6, 5.1, z);
    ground.add(lamp);
  }
}
// snow falling outside the glass
{
  const n = 420;
  const flakes = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.06, 0),
    new THREE.MeshBasicMaterial({ color: 0xf4f8ff }),
    n,
  );
  flakes.userData.noAO = true;
  flakes.frustumCulled = false;
  ground.add(flakes);
  const F0 = Array.from({ length: n }, (_, i) => {
    const q = rng(500 + i);
    return {
      x: HALL.x1 + 0.8 + q() * 16,
      z: -20 + q() * 50,
      ph: q(),
      sp: 0.6 + q() * 0.6,
      sw: q() * 6,
    };
  });
  const m4 = new THREE.Matrix4();
  onFrame((t) => {
    F0.forEach((f, i) => {
      const y = 18 - ((t * f.sp * 1.4 + f.ph * 18) % 18);
      m4.makeTranslation(
        f.x + Math.sin(t * 0.8 + f.sw) * 0.4,
        y,
        f.z + Math.cos(t * 0.6 + f.sw) * 0.3,
      );
      flakes.setMatrixAt(i, m4);
    });
    flakes.instanceMatrix.needsUpdate = true;
  });
}

// ---------------------------------------------------------------- hall clock on the back wall
{
  const g = new THREE.Group();
  g.position.set(-8.5, 11, HALL.z0 + 0.3);
  ground.add(g);
  const face = new THREE.Mesh(
    new THREE.CylinderGeometry(1.3, 1.3, 0.12, 64),
    real.plastic(0xfbfbf8),
  );
  face.rotation.x = Math.PI / 2;
  g.add(face);
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(1.3, 0.09, 12, 64),
    real.metal(0x2a2d33, { roughness: 0.3 }),
  );
  rim.position.z = 0.06;
  g.add(rim);
  const black = flat(0x15171b);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const tick = new THREE.Mesh(new THREE.BoxGeometry(0.07, i % 3 ? 0.18 : 0.3, 0.02), black);
    tick.position.set(Math.sin(a) * 1.08, Math.cos(a) * 1.08, 0.08);
    tick.rotation.z = -a;
    g.add(tick);
  }
  const hand = (len, w, col) => {
    const p = new THREE.Group();
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, len, 0.02), col);
    m.position.y = len / 2 - 0.1;
    p.add(m);
    p.position.z = 0.1;
    g.add(p);
    return p;
  };
  const hh = hand(0.62, 0.09, black);
  const mh = hand(0.95, 0.06, black);
  const sh = hand(1.0, 0.025, flat(0xe8343a));
  hh.rotation.z = -((18 + 42 / 60) / 12) * Math.PI * 2; // 18:42
  mh.rotation.z = -(42 / 60) * Math.PI * 2;
  onFrame((t) => (sh.rotation.z = -Math.floor(t) * (Math.PI / 30)));
}

// ---------------------------------------------------------------- left: small stand with spectators
const SPECT = [];
{
  for (let row = 0; row < 3; row++) {
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.5, 18),
      flat(0xb9b3aa, { roughness: 0.9 }),
    );
    step.position.set(-14.6 + row * 0 - row * 1.2 + 2.4, DECK + 0.25 + row * 0.5, 4);
    step.scale.y = row + 1;
    step.position.y = DECK + 0.25 * (row + 1);
    step.receiveShadow = true;
    ground.add(step);
  }
  const looks = [
    { top: 0xe8343a, legs: 0x2f3a4f, hair: 0x2a1c14 },
    { top: 0xffc83a, legs: 0x1e2a3a, hair: 0xd9a65a, style: "long" },
    { top: 0x2f9e6a, legs: 0x3a3a44, hair: 0x14100e },
    { top: 0xf2f2f2, legs: 0x22364e, hair: 0x6a3f22, style: "long" },
    { top: 0x7a5cd6, legs: 0x2a2a30, hair: 0x2a1c14 },
    { top: 0xff8a3a, legs: 0x26324a, hair: 0x8a5a2a },
  ];
  // swimmers standing at the pool edge, looking up at the tower
  const spots = [
    [-9.6, 1.2, 0.5],
    [-10.2, 3.0, 0.7],
    [-9.3, 5.6, 0.3],
    [9.8, 2.4, -0.6],
    [10.4, 4.6, -0.4],
    [9.5, 7.8, -0.8],
  ];
  spots.forEach(([x, z, yaw], i) => {
    const p = person({
      ...looks[i],
      stand: true,
      seed: 10 + i,
      skin: [0xf1c09a, 0xc98e66, 0x8d5a3a][i % 3],
    });
    p.g.scale.setScalar(0.25);
    p.g.position.set(x, DECK, z);
    p.g.rotation.y =
      (x < 0 ? Math.PI / 2 : -Math.PI / 2) + yaw * 0.3 + 0.4 * Math.sign(-z + 0.5) * 0;
    ground.add(p.g);
    SPECT.push({ p, x, z, i });
  });
  onFrame((t) => {
    SPECT.forEach(({ p, i }) => {
      p.g.children[0].rotation.x = -0.18 + Math.sin(t * 1.1 + i) * 0.03; // lean back: looking up
      p.g.children[0].rotation.z = Math.sin(t * 0.7 + i * 2) * 0.03;
    });
  });
  // lifeguard chair (tall, white) + flutter boards + towel bench
  const lg = new THREE.Group();
  const white = real.plastic(0xf6f6f2);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 12), white);
      leg.position.set(sx * 0.35, 1.1, sz * 0.35);
      leg.rotation.z = -sx * 0.06;
      lg.add(leg);
    }
  const seat = new THREE.Mesh(roundedBox(0.9, 0.12, 0.8, 0.04), real.plastic(0xe8343a));
  seat.position.y = 2.2;
  lg.add(seat);
  const backr = new THREE.Mesh(roundedBox(0.9, 0.7, 0.08, 0.03), real.plastic(0xe8343a));
  backr.position.set(0, 2.6, -0.38);
  lg.add(backr);
  lg.position.set(10.6, DECK, -0.4);
  lg.rotation.y = -Math.PI / 2 + 0.4;
  lg.traverse((m) => m.isMesh && (m.castShadow = true));
  ground.add(lg);
  const boardCols = [0xff5a36, 0xffc83a, 0x2f8fd6, 0x2fb07a];
  for (let i = 0; i < 8; i++) {
    const b = new THREE.Mesh(
      roundedBox(0.5, 0.05, 0.75, 0.04),
      real.plastic(boardCols[i % 4], { roughness: 0.6 }),
    );
    b.position.set(12.6, DECK + 0.03 + i * 0.055, 9.5 + (i % 2) * 0.03);
    b.castShadow = true;
    ground.add(b);
  }
  const towels = [0xff7aa8, 0x47b5e6, 0xffd23f];
  towels.forEach((c, i) => {
    const tw = new THREE.Mesh(roundedBox(0.9, 0.08, 0.5, 0.04), real.fabric(c));
    tw.position.set(-11.8, DECK + 0.04, 9 + i * 0.7);
    tw.rotation.y = 0.2 * i;
    ground.add(tw);
  });
}

// ---------------------------------------------------------------- steam over the warm water
fireflies(40, { area: [16, 2.5, 13], color: 0xe9f6ff, seed: 65, size: 0.05 });

finishSet({ ground: 0x6fbfd0 });
