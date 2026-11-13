// #90 Protein-Shake — the world: an alpine pasture (Alm) on a clear autumn
// morning. A giant protein shaker stands in the grass in front of a log
// Sennhütte; under the hut's lean-to a copper cheese kettle steams over a
// wood fire, to the right a pig pen with a wooden trough, to the left the
// outhouse with a heart in the door. Cows, a fence, pines and snowy peaks
// behind. Life: kettle steam, chimney smoke, swaying grass, birds, the pig.
import { THREE, flat, real, roundedBox, rng, V, onFrame, scene } from "./world.js";
import {
  SKIES,
  setSky,
  finishSet,
  terrain,
  pathStrip,
  meadow,
  pine,
  rocks,
  F,
} from "./environments.js";
import { place, scatter, fence, cow, flowerBed, rock } from "./props.js";

const SEED = 90;

// ---------------------------------------------------------------- light
setSky({
  ...SKIES.morgen,
  top: [0.27, 0.52, 0.9],
  mid: [0.62, 0.78, 0.96],
  hor: [1.0, 0.9, 0.74],
  below: [0.82, 0.88, 0.94],
  sunDir: [-0.55, 0.32, -1],
  keyPos: [-9, 13, 9],
  clouds: 7,
  fog: [40, 150],
});

// ---------------------------------------------------------------- ground
terrain(0x7cb54a, {
  seed: SEED,
  amt: 0.12,
  warm: 0.35,
  flatR: 22,
  hills: 9,
});
// trodden path from the hut door down past the shaker
pathStrip(
  [
    [-1.5, -8.5],
    [-2.6, -4],
    [-3.4, 1],
    [-2.2, 7],
    [1, 16],
  ],
  { width: 1.5, color: 0xa88d62, seed: SEED },
);
meadow({
  n: 520,
  rMin: 2.4,
  rMax: 26,
  seed: SEED,
  flowers: 0.3,
  tint: [0x5f9f37, 0x7cb54a, 0x93c95a],
  keep: (x, z) => !(z < -6.5 && Math.abs(x) < 9) && !(x > 5.5 && x < 10 && z > -8 && z < -2),
});

// ---------------------------------------------------------------- far layer: peaks
const snow = flat(0xf6f8fc);
const rockMat = flat(0x8d8a96);
const rockDark = flat(0x6f6c7a);
const peaks = [
  [-62, -95, 34, 30],
  [-30, -110, 46, 38],
  [8, -120, 40, 44],
  [44, -104, 36, 34],
  [78, -88, 30, 28],
  [-90, -70, 26, 30],
  [100, -60, 22, 26],
];
peaks.forEach(([x, z, h, r], i) => {
  const geo = new THREE.ConeGeometry(r, h, 7, 3);
  const m = F(geo, i % 2 ? rockMat : rockDark, 0.1, SEED + i);
  m.position.set(x, h / 2 - 4, z);
  m.rotation.y = i * 0.7;
  m.castShadow = false;
  scene.add(m);
  const cap = F(new THREE.ConeGeometry(r * 0.36, h * 0.36, 7, 1), snow, 0.05, SEED + 30 + i);
  cap.position.set(x, h - 4 - h * 0.18 + 0.2, z);
  cap.rotation.y = i * 0.7;
  scene.add(cap);
});
// forest line on the slopes
for (let i = 0; i < 46; i++) {
  const r = rng(SEED + 100 + i);
  const a = -Math.PI * 0.95 + (i / 46) * Math.PI * 0.9 + (r() - 0.5) * 0.05;
  const d = 30 + r() * 16;
  pine(Math.cos(a) * d, Math.sin(a) * d, 1.5 + r() * 1.4, SEED + 200 + i);
}
[
  [13, -12, 1.4],
  [16, -6, 1.2],
  [-15, -12, 1.5],
  [-17, -4, 1.3],
  [18, 6, 1.1],
].forEach(([x, z, s], i) => pine(x, z, s, SEED + 300 + i));
rocks(14, 12, 28, SEED, flat(0xa8a3ab));

// ---------------------------------------------------------------- the Sennhütte (hero piece)
const logMat = real.wood(0x8a5a34, { roughness: 0.8 });
const logDark = real.wood(0x6b4426, { roughness: 0.85 });
const shingle = flat(0x6d5444);
export const HUT = V(0, 0, -11.5);
const hut = new THREE.Group();
hut.position.copy(HUT);
scene.add(hut);
{
  // log walls: 9 x 6, height 3.2
  const W = 9,
    D = 6,
    H = 3.2;
  for (let i = 0; i < 11; i++) {
    const y = 0.15 + i * 0.29;
    const mat = i % 2 ? logMat : logDark;
    for (const z of [-D / 2, D / 2]) {
      if (z > 0 && i < 8) {
        // front wall: door gap + window gap
        for (const [x0, x1] of [
          [-W / 2 - 0.2, -1.6],
          [-0.4, 1.6],
          [3.2, W / 2 + 0.2],
        ]) {
          if (i >= 3 && i < 6 && x0 === -0.4) continue;
          const len = x1 - x0;
          const m = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, len, 12), mat);
          m.rotation.z = Math.PI / 2;
          m.position.set((x0 + x1) / 2, y, z);
          m.castShadow = m.receiveShadow = true;
          hut.add(m);
        }
        continue;
      }
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, W + 0.4, 12), mat);
      m.rotation.z = Math.PI / 2;
      m.position.set(0, y, z);
      m.castShadow = m.receiveShadow = true;
      hut.add(m);
    }
    for (const x of [-W / 2, W / 2]) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, D + 0.4, 12), mat);
      m.rotation.x = Math.PI / 2;
      m.position.set(x, y + 0.14, 0);
      m.castShadow = m.receiveShadow = true;
      hut.add(m);
    }
  }
  // door (dark planks) and window with a frame + geraniums
  const door = new THREE.Mesh(roundedBox(1.3, 2.3, 0.12, 0.03), real.wood(0x5a3a22));
  door.position.set(-1.0, 1.2, D / 2 + 0.02);
  hut.add(door);
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(1.4, 0.8),
    real.glass(0xbcd8f0, { opacity: 0.6 }),
  );
  glass.position.set(0.6, 1.6, D / 2 - 0.02);
  hut.add(glass);
  const frame = new THREE.Mesh(roundedBox(1.6, 0.1, 0.3, 0.03), real.wood(0xf2ead8));
  frame.position.set(0.6, 1.2, D / 2 + 0.1);
  hut.add(frame);
  const box = new THREE.Mesh(roundedBox(1.7, 0.32, 0.4, 0.05), real.wood(0x7a4a2a));
  box.position.set(0.6, 1.0, D / 2 + 0.3);
  hut.add(box);
  const r = rng(SEED + 7);
  for (let i = 0; i < 9; i++) {
    const f = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.11, 1),
      flat(i % 3 ? 0xe23b3b : 0x3f8f35, { roughness: 0.6 }),
    );
    f.position.set(-0.2 + i * 0.2, 1.24 + r() * 0.12, D / 2 + 0.3 + (r() - 0.5) * 0.15);
    hut.add(f);
  }
  // roof: two shingle slabs + stones on top (alpine style)
  for (const s of [-1, 1]) {
    const slab = F(
      new THREE.BoxGeometry(W + 1.6, 0.25, D / 2 + 1.6, 6, 1, 4),
      shingle,
      0.08,
      SEED + s,
    );
    slab.position.set(0, H + 0.95, s * (D / 4 + 0.55));
    slab.rotation.x = s * 0.42;
    slab.castShadow = true;
    hut.add(slab);
    for (let i = 0; i < 4; i++) {
      const st = F(new THREE.DodecahedronGeometry(0.28, 0), flat(0x9a96a0), 0.1, SEED + 40 + i);
      st.position.set(-3.3 + i * 2.2, H + 1.25, s * (D / 4 + 0.3));
      hut.add(st);
    }
  }
  const gable = new THREE.Shape();
  gable.moveTo(-D / 2 - 0.2, 0);
  gable.lineTo(D / 2 + 0.2, 0);
  gable.lineTo(0, 1.6);
  gable.closePath();
  for (const x of [-W / 2, W / 2]) {
    const g = new THREE.Mesh(
      new THREE.ExtrudeGeometry(gable, { depth: 0.2, bevelEnabled: false }),
      logDark,
    );
    g.rotation.y = Math.PI / 2;
    g.position.set(x - 0.1, H + 0.1, 0);
    hut.add(g);
  }
  // chimney
  const ch = F(new THREE.BoxGeometry(0.7, 1.8, 0.7), flat(0xa7a2a6), 0.08, SEED);
  ch.position.set(2.8, H + 1.6, -0.8);
  hut.add(ch);
}

// ---------------------------------------------------------------- the cheese kettle under the lean-to
export const KETTLE = V(-5.2, 0, -7.4);
export const kettle = new THREE.Group();
kettle.position.copy(KETTLE);
scene.add(kettle);
export const milkMat = real.plastic(0xfbfaf4, { roughness: 0.25, clearcoat: 0.6 });
export const curds = [];
export let milkSurface;
{
  // lean-to roof on two posts
  for (const x of [-1.9, 1.9]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 4.1, 12), logDark);
    p.position.set(x, 2.05, 1.6);
    p.castShadow = true;
    kettle.add(p);
  }
  const lean = F(new THREE.BoxGeometry(4.6, 0.2, 3.6, 5, 1, 4), shingle, 0.08, SEED + 9);
  lean.position.set(0, 4.25, 0.1);
  lean.rotation.x = 0.22;
  lean.castShadow = true;
  kettle.add(lean);
  // stone fireplace ring
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const s = F(
      new THREE.DodecahedronGeometry(0.3, 0),
      flat(i % 2 ? 0x9b97a0 : 0x84808c),
      0.1,
      SEED + 50 + i,
    );
    s.position.set(Math.cos(a) * 1.25, 0.2, Math.sin(a) * 1.25);
    s.scale.set(1, 0.8, 1);
    kettle.add(s);
  }
  // kettle: lathe, polished copper, iron rim
  const prof = [];
  for (let i = 0; i <= 24; i++) {
    const f = i / 24;
    prof.push(new THREE.Vector2(0.05 + Math.sqrt(1 - (1 - f) * (1 - f)) * 1.2, f * 1.5));
  }
  const pot = new THREE.Mesh(
    new THREE.LatheGeometry(prof, 64),
    real.metal(0xd07a45, { roughness: 0.22, side: THREE.DoubleSide }),
  );
  pot.position.y = 0.55;
  pot.castShadow = true;
  kettle.add(pot);
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(1.25, 0.06, 12, 64),
    real.metal(0x3a3a40, { roughness: 0.4 }),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 2.05;
  kettle.add(rim);
  // the crane arm it hangs from
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.0, 10), real.metal(0x2e2e33));
  arm.position.set(-1.75, 1.5, -0.6);
  kettle.add(arm);
  milkSurface = new THREE.Mesh(new THREE.CircleGeometry(1.2, 64), milkMat);
  milkSurface.rotation.x = -Math.PI / 2;
  milkSurface.position.y = 1.85;
  kettle.add(milkSurface);
  const r = rng(SEED + 11);
  const curdMat = real.plastic(0xfff6dc, { roughness: 0.55 });
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * 0.95;
    const c = new THREE.Mesh(roundedBox(0.2, 0.15, 0.2, 0.05, 2), curdMat);
    c.position.set(Math.cos(a) * d, 1.86, Math.sin(a) * d);
    c.rotation.y = r() * 3;
    c.userData.ph = r() * 6;
    c.visible = false;
    kettle.add(c);
    curds.push(c);
  }
  // fire: glowing embers + flame cones
  const ember = flat(0xff6a1a, { emissive: 0xff4a10, emissiveIntensity: 1.6 });
  const flames = [];
  for (let i = 0; i < 5; i++) {
    const fl = new THREE.Mesh(
      new THREE.ConeGeometry(0.16, 0.6, 7),
      flat(0xffb43a, { emissive: 0xff7a18, emissiveIntensity: 1.8 }),
    );
    fl.position.set(Math.cos(i * 1.3) * 0.45, 0.35, Math.sin(i * 1.3) * 0.45);
    fl.userData.noAO = true;
    kettle.add(fl);
    flames.push(fl);
  }
  const coals = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.85, 0.12, 16), ember);
  coals.position.y = 0.08;
  kettle.add(coals);
  const fireLight = new THREE.PointLight(0xff8a3a, 6, 7, 1.6);
  fireLight.position.set(0, 0.6, 0.6);
  kettle.add(fireLight);
  onFrame((t) => {
    flames.forEach((f, i) => {
      const k = 0.75 + 0.35 * Math.sin(t * 11 + i * 2.1);
      f.scale.set(1, k, 1);
      f.rotation.z = Math.sin(t * 7 + i) * 0.15;
    });
    fireLight.intensity = 5 + Math.sin(t * 13) * 0.8 + Math.sin(t * 7.3) * 0.6;
  });
}

// ---------------------------------------------------------------- steam / smoke (life)
function plume(
  parent,
  x,
  y,
  z,
  { n = 9, rise = 2.6, size = 0.35, color = 0xffffff, op = 0.55, seed = 1, spread = 0.4 },
) {
  const mat = new THREE.MeshStandardMaterial({
    color,
    transparent: true,
    opacity: op,
    roughness: 1,
    depthWrite: false,
  });
  const r = rng(seed);
  const parts = [];
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(size, 1), mat);
    m.userData = { ph: i / n, dx: (r() - 0.5) * spread, noAO: true };
    parent.add(m);
    parts.push(m);
  }
  onFrame((t) => {
    parts.forEach((m) => {
      const f = (t * 0.32 + m.userData.ph) % 1;
      m.position.set(
        x + m.userData.dx * (0.4 + f) + Math.sin(t + m.userData.ph * 6) * 0.15,
        y + f * rise,
        z,
      );
      m.scale.setScalar(0.4 + f * 1.4);
      m.material.opacity = op;
      m.visible = f < 0.95;
    });
  });
  return parts;
}
plume(kettle, 0, 2.0, 0, { n: 8, rise: 2.0, size: 0.32, op: 0.4, seed: SEED + 1, spread: 1.6 });
plume(hut, 2.8, 5.4, -0.8, { n: 8, rise: 4, size: 0.4, color: 0xd9d6dc, op: 0.5, seed: SEED + 2 });

// ---------------------------------------------------------------- pig pen
export const PEN = V(7.6, 0, -4.6);
export const pig = new THREE.Group();
export const pigParts = {};
export const troughWhey = real.plastic(0xf1e8a6, { roughness: 0.15, clearcoat: 1 });
{
  const pen = new THREE.Group();
  pen.position.copy(PEN);
  scene.add(pen);
  const f1 = fence(5, 0x8a5a34);
  f1.position.set(0, 0, -1.9);
  pen.add(f1);
  const f2 = fence(4, 0x8a5a34);
  f2.position.set(2.5, 0, 0);
  f2.rotation.y = Math.PI / 2;
  pen.add(f2);
  // mud patch
  const mud = F(new THREE.CircleGeometry(2.3, 18), flat(0x7a5a3c), 0.08, SEED);
  mud.rotation.x = -Math.PI / 2;
  mud.position.y = 0.02;
  mud.receiveShadow = true;
  pen.add(mud);
  // trough
  const trough = new THREE.Mesh(roundedBox(1.9, 0.45, 0.7, 0.06), real.wood(0x7d5232));
  trough.position.set(-0.4, 0.23, 0.9);
  trough.castShadow = true;
  pen.add(trough);
  const tw = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.5), troughWhey);
  tw.rotation.x = -Math.PI / 2;
  tw.position.set(-0.4, 0.47, 0.9);
  pen.add(tw);
  // pig: smooth pink body, snout, ears, curly tail — facing the trough (+z)
  const skin = real.skin(0xf3a7a8, { sheenColor: new THREE.Color(0xffd6d6) });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.62, 48, 32), skin);
  body.scale.set(0.85, 0.78, 1.25);
  body.position.set(0, 0.68, 0);
  pig.add(body);
  const head = new THREE.Group();
  head.position.set(0, 0.78, 0.78);
  pig.add(head);
  const hd = new THREE.Mesh(new THREE.SphereGeometry(0.38, 48, 32), skin);
  head.add(hd);
  const snout = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.17, 0.16, 32),
    real.skin(0xf08f93),
  );
  snout.rotation.x = Math.PI / 2;
  snout.position.z = 0.38;
  head.add(snout);
  for (const x of [-0.06, 0.06]) {
    const n = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), flat(0x8a3a44));
    n.position.set(x, 0, 0.465);
    head.add(n);
    const e = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 16, 12),
      flat(0x1c1416, { roughness: 0.2 }),
    );
    e.position.set(x * 2.6, 0.13, 0.31);
    head.add(e);
  }
  const ears = [];
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.26, 24), skin);
    ear.position.set(s * 0.22, 0.33, 0.05);
    ear.rotation.z = -s * 0.5;
    ear.rotation.x = 0.4;
    head.add(ear);
    ears.push(ear);
  }
  for (const [x, z] of [
    [-0.28, -0.45],
    [0.28, -0.45],
    [-0.28, 0.45],
    [0.28, 0.45],
  ]) {
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.32, 16), skin);
    l.position.set(x, 0.16, z);
    pig.add(l);
  }
  const tailPts = [];
  for (let i = 0; i <= 30; i++) {
    const a = i * 0.45;
    tailPts.push(V(Math.cos(a) * 0.06, 0.8 + i * 0.006, -0.78 - Math.sin(a) * 0.06 - i * 0.004));
  }
  const tail = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(tailPts), 40, 0.018, 6),
    skin,
  );
  pig.add(tail);
  pig.traverse((m) => m.isMesh && (m.castShadow = true));
  pig.position.set(-0.4, 0, -0.35);
  pen.add(pig);
  Object.assign(pigParts, { head, ears, tail });
}

// ---------------------------------------------------------------- outhouse (Plumpsklo)
export const KLO = V(-8.6, 0, -2.6);
export const kloDoor = new THREE.Group();
{
  const g = new THREE.Group();
  g.position.copy(KLO);
  g.rotation.y = 0.55;
  scene.add(g);
  const plank = real.wood(0x9a6a3e, { roughness: 0.85 });
  for (const [x, z, w, d] of [
    [-0.8, 0, 0.1, 1.7],
    [0.8, 0, 0.1, 1.7],
    [0, -0.8, 1.7, 0.1],
  ]) {
    const wall = new THREE.Mesh(roundedBox(w, 2.4, d, 0.03), plank);
    wall.position.set(x, 1.2, z);
    wall.castShadow = wall.receiveShadow = true;
    g.add(wall);
  }
  const roof = new THREE.Mesh(roundedBox(2.1, 0.12, 2.1, 0.04), real.wood(0x6b4426));
  roof.position.set(0, 2.5, 0);
  roof.rotation.x = -0.18;
  roof.castShadow = true;
  g.add(roof);
  // door on a hinge at x = -0.8 (left edge), heart cut-out
  kloDoor.position.set(-0.8, 0, 0.85);
  g.add(kloDoor);
  const heart = new THREE.Shape();
  heart.moveTo(0, -0.12);
  heart.bezierCurveTo(-0.2, 0.0, -0.16, 0.18, 0, 0.09);
  heart.bezierCurveTo(0.16, 0.18, 0.2, 0.0, 0, -0.12);
  const doorShape = new THREE.Shape();
  doorShape.moveTo(0, 0);
  doorShape.lineTo(1.6, 0);
  doorShape.lineTo(1.6, 2.3);
  doorShape.lineTo(0, 2.3);
  doorShape.closePath();
  const hole = new THREE.Path(
    heart.getPoints(16).map((p) => new THREE.Vector2(p.x * 1.4 + 0.8, p.y * 1.4 + 1.85)),
  );
  doorShape.holes.push(hole);
  const dm = new THREE.Mesh(
    new THREE.ExtrudeGeometry(doorShape, {
      depth: 0.07,
      bevelEnabled: true,
      bevelSize: 0.015,
      bevelThickness: 0.015,
      bevelSegments: 2,
    }),
    real.wood(0xb07a4a, { roughness: 0.8 }),
  );
  dm.castShadow = true;
  kloDoor.add(dm);
  // inside: dark + the seat (a box with a hole)
  const inside = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 2.3, 1.5),
    flat(0x2a1e16, { side: THREE.BackSide }),
  );
  inside.position.set(0, 1.15, 0);
  g.add(inside);
  const seat = new THREE.Mesh(roundedBox(1.5, 0.8, 0.7, 0.04), plank);
  seat.position.set(0, 0.4, -0.4);
  g.add(seat);
}

// ---------------------------------------------------------------- near props + cows
place(cow(SEED), -11, 6, 0.9, 1.25);
place(cow(SEED + 1), 12.5, 3.5, -2.4, 1.25);
place(cow(SEED + 2), 15, -2, -1.8, 1.2);
{
  const f = fence(8, 0x8a5a34);
  place(f, -14, 1, Math.PI / 2 - 0.15);
}
// milk cans by the hut, a hay bale, a wooden bench
const canMat = real.metal(0xc9ced6, { roughness: 0.28 });
for (const [x, z] of [
  [-2.6, -7.6],
  [-3.2, -7.2],
]) {
  const prof = [
    [0, 0],
    [0.32, 0],
    [0.34, 0.05],
    [0.34, 0.75],
    [0.2, 0.95],
    [0.2, 1.05],
    [0.26, 1.08],
    [0.26, 1.13],
    [0, 1.13],
  ].map(([a, b]) => new THREE.Vector2(a, b));
  const can = new THREE.Mesh(new THREE.LatheGeometry(prof, 48), canMat);
  can.position.set(x, 0, z);
  can.castShadow = true;
  scene.add(can);
}
{
  const bale = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 0.85, 1.2, 40),
    real.fabric(0xd8b45a),
  );
  bale.rotation.z = Math.PI / 2;
  bale.position.set(4.6, 0.85, -8.2);
  bale.castShadow = true;
  scene.add(bale);
}
scatter((i) => flowerBed(SEED + i, [0xffffff, 0xf3d24a, 0xb48be8, 0xff8fb8]), 6, {
  rMin: 8,
  rMax: 15,
  seed: SEED + 5,
  keep: (x, z) => z > -6,
});
scatter((i) => rock(SEED + i, 0.5), 6, {
  rMin: 7,
  rMax: 13,
  seed: SEED + 6,
  keep: (x, z) => z > -5 && Math.abs(x) > 6,
});

finishSet({ ground: 0x6f9f45 });
