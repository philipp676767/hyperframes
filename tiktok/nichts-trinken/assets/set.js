// #67 „Einen Tag nichts trinken“ — a festival campsite on a hot late
// afternoon: dry yellow-green grass, dome tents in every colour, a row of
// blue Dixi toilets, flags swaying on poles, and far behind the main stage
// with its truss roof, speaker stacks and a glowing screen. Dust floats in
// the low sun. The place where everybody forgets to drink.
import { THREE, flat, ground, onFrame, rng } from "./world.js";
import {
  SKIES,
  setSky,
  finishSet,
  terrain,
  pathStrip,
  lightString,
  fireflies,
  meadow,
  tree,
  F,
} from "./environments.js";
import { place, scatter, bush, crate, sway } from "./props.js";

const SEED = 67;

// ---------------------------------------------------------------- light
// hot golden afternoon: warm haze at the horizon, strong low sun from the left
const sky = setSky({
  ...SKIES.mittag,
  top: [0.22, 0.5, 0.88],
  mid: [0.58, 0.74, 0.92],
  hor: [1.0, 0.86, 0.62],
  below: [0.95, 0.85, 0.7],
  sun: [1.0, 0.9, 0.66],
  key: [0xffe0b0, 3.0],
  hemi: [0xfff2dc, 0x8a7a5a, 1.4],
  rim: [0xffd29a, 0.7],
  clouds: 6,
  birds: true,
});

// ---------------------------------------------------------------- ground
const GROUND = 0xb7b45a; // dry, trampled festival grass
terrain(GROUND, { seed: SEED, amt: 0.14, warm: 0.6, hills: 5 });
// trampled dirt paths between the tents
pathStrip(
  [
    [-36, -6.5],
    [-14, -6.2],
    [0, -6.8],
    [15, -6.0],
    [36, -7.2],
  ],
  { width: 2.6, color: 0xb59a6c, seed: SEED },
);
pathStrip(
  [
    [7.5, 14],
    [8.6, 4],
    [8.0, -6.3],
  ],
  { width: 1.7, color: 0xb59a6c, seed: SEED + 1 },
);
meadow({
  n: 420,
  rMin: 3.2,
  rMax: 24,
  seed: SEED,
  tint: [0xa9a548, 0xc2b85e, 0x9ab04a],
  flowers: 0.15,
  keep: (x, z) => Math.abs(z + 6.5) > 1.6 && !(x > -1.5 && x < 10 && z > -1 && z < 4),
});

// ---------------------------------------------------------------- tents
// low-poly dome tents with a darker fly and an open door flap
function tent(color, seed = 1, s = 1) {
  const g = new THREE.Group();
  const shell = F(
    new THREE.SphereGeometry(1.25, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2),
    flat(color, { roughness: 0.85 }),
    0.08,
    seed,
  );
  shell.scale.set(1.25, 0.9, 1);
  g.add(shell);
  const door = new THREE.Mesh(
    new THREE.CircleGeometry(0.5, 10, 0, Math.PI),
    flat(0x1d1a22, { roughness: 1 }),
  );
  door.position.set(0, 0.02, 1.24);
  g.add(door);
  // poles: two crossing arcs
  const poleMat = flat(0x3a3a3a);
  for (const a of [0.6, -0.6]) {
    const arc = new THREE.Mesh(new THREE.TorusGeometry(1.27, 0.025, 4, 18, Math.PI), poleMat);
    arc.rotation.y = a + Math.PI / 2;
    arc.scale.set(1.2, 0.9, 1);
    g.add(arc);
  }
  // guy line pegs
  const r = rng(seed);
  for (let i = 0; i < 4; i++) {
    const peg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 4), poleMat);
    const a = (i / 4) * Math.PI * 2 + 0.6;
    peg.position.set(Math.cos(a) * 2, 0.08, Math.sin(a) * 1.6);
    g.add(peg);
  }
  g.rotation.y = (r() - 0.5) * 0.8;
  g.scale.setScalar(s);
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = o.receiveShadow = true;
  });
  return g;
}
const TENT_COLORS = [0xe94b3c, 0x2f8ad6, 0xf2b631, 0x36a568, 0xf07aa8, 0x8b5bd6, 0xff8a2a];
[
  [-8.5, -2.2, 1.0],
  [-12.5, 1.5, 1.1],
  [-11, -10, 1.2],
  [-6, -11.5, 1.0],
  [12.5, -2.5, 1.05],
  [15, 2.5, 1.15],
  [12, -10.5, 1.0],
  [4.5, -11, 1.1],
  [-16, -5, 1.2],
  [18.5, -6, 1.1],
  [-17, 7, 1.0],
  [-2, -14.5, 1.15],
  [9, -15.5, 1.2],
  [-20, -12, 1.3],
  [21, 0, 1.2],
].forEach(([x, z, s], i) =>
  place(tent(TENT_COLORS[i % TENT_COLORS.length], SEED + i, s), x, z, 0, 1),
);

// gazebo / pavilion with a striped roof next to the tents
function gazebo(c1, c2) {
  const g = new THREE.Group();
  const leg = flat(0xd9d9d9, { metalness: 0.4, roughness: 0.4 });
  for (const [x, z] of [
    [-1.4, -1.4],
    [1.4, -1.4],
    [-1.4, 1.4],
    [1.4, 1.4],
  ]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 6), leg);
    p.position.set(x, 1.1, z);
    g.add(p);
  }
  for (let i = 0; i < 8; i++) {
    const seg = new THREE.Mesh(
      new THREE.ConeGeometry(
        2.1,
        0.9,
        4,
        1,
        true,
        (i / 8) * Math.PI * 2 + Math.PI / 4,
        Math.PI / 4,
      ),
      flat(i % 2 ? c1 : c2, { side: THREE.DoubleSide, roughness: 0.9 }),
    );
    seg.position.y = 2.65;
    g.add(seg);
  }
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = o.receiveShadow = true;
  });
  return g;
}
place(gazebo(0xffffff, 0xe94b3c), -14.5, -1.5, 0.3);
place(gazebo(0xffffff, 0x2f8ad6), 16, -12, -0.2);

// camping clutter: crates, a cooler, a folding chair
function cooler(color = 0x2f8ad6) {
  const g = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.5), flat(color));
  box.position.y = 0.25;
  g.add(box);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.1, 0.54), flat(0xf4f4f4));
  lid.position.y = 0.53;
  g.add(lid);
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = o.receiveShadow = true;
  });
  return g;
}
function chair(color = 0x36a568) {
  const g = new THREE.Group();
  const frame = flat(0x2a2a2a);
  for (const [x, z] of [
    [-0.3, -0.3],
    [0.3, -0.3],
    [-0.3, 0.3],
    [0.3, 0.3],
  ]) {
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.55, 4), frame);
    l.position.set(x, 0.27, z);
    g.add(l);
  }
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.05, 0.6), flat(color));
  seat.position.y = 0.5;
  g.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.6, 0.05), flat(color));
  back.position.set(0, 0.82, -0.3);
  back.rotation.x = -0.15;
  g.add(back);
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = o.receiveShadow = true;
  });
  return g;
}
place(cooler(), -7, 0.4, 0.4);
place(chair(0xe94b3c), -10.2, 3.6, 0.8);
place(chair(0xf2b631), 11.2, 1.0, -0.6);
place(cooler(0xe94b3c), 13.8, 0.8, -0.3);
place(crate(), -9.6, -4.2, 0.3);
place(crate(0x9a6a38), 10.2, -4.6, -0.5);

// ---------------------------------------------------------------- Dixi row
// a line of blue portable toilets on the left — the doors swing now and then
export const dixiDoors = [];
function dixi(i) {
  const g = new THREE.Group();
  const blue = flat(0x2c6fd1, { roughness: 0.55 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.3, 1.2), blue);
  body.position.y = 1.15;
  g.add(body);
  const roof = new THREE.Mesh(
    new THREE.CylinderGeometry(0.75, 0.75, 1.24, 12, 1, false, 0, Math.PI),
    flat(0xf2f2f2, { roughness: 0.5 }),
  );
  roof.rotation.z = Math.PI / 2;
  roof.rotation.y = Math.PI / 2;
  roof.scale.set(1, 1, 0.3);
  roof.position.y = 2.3;
  g.add(roof);
  const hinge = new THREE.Group();
  hinge.position.set(-0.52, 0, 0.61);
  g.add(hinge);
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.05, 0.05), flat(0x2a62bd));
  door.position.set(0.5, 1.1, 0);
  hinge.add(door);
  const sign = new THREE.Mesh(
    new THREE.CircleGeometry(0.11, 12),
    flat(0x3dd17a, { emissive: 0x2a9a50, emissiveIntensity: 0.5 }),
  );
  sign.position.set(0.82, 1.15, 0.03);
  hinge.add(sign);
  dixiDoors.push({ hinge, seed: i });
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = o.receiveShadow = true;
  });
  return g;
}
for (let i = 0; i < 5; i++) place(dixi(i), -9.5 + i * 1.35, -8.2, 0.12);
onFrame((t) =>
  dixiDoors.forEach(({ hinge, seed }) => {
    // each door opens briefly every ~9 s, staggered
    const ph = (t * 0.11 + seed * 0.37) % 1;
    const k = ph < 0.08 ? Math.sin((ph / 0.08) * Math.PI) : 0;
    hinge.rotation.y = -k * 1.4;
  }),
);

// ---------------------------------------------------------------- hero piece
// the main stage far behind: truss frame, black roof, speaker stacks, a
// glowing LED screen with a slow colour sweep, spotlights
export const stageScreen = {};
{
  const g = new THREE.Group();
  const truss = flat(0xcfd3d8, { metalness: 0.6, roughness: 0.35 });
  const black = flat(0x1b1b20, { roughness: 0.7 });
  const deck = F(new THREE.BoxGeometry(18, 1.6, 7), flat(0x2a2a30), 0.04, 3);
  deck.position.y = 0.8;
  g.add(deck);
  for (const x of [-9, 9]) {
    for (const z of [-3.3, 3.3]) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.45, 11, 0.45), truss);
      p.position.set(x, 5.5, z);
      g.add(p);
    }
  }
  const roof = new THREE.Mesh(new THREE.BoxGeometry(19.5, 0.8, 8), black);
  roof.position.y = 11.2;
  g.add(roof);
  const front = new THREE.Mesh(new THREE.BoxGeometry(19.5, 1.4, 0.4), truss);
  front.position.set(0, 10.4, 3.5);
  g.add(front);
  const back = new THREE.Mesh(new THREE.BoxGeometry(17.5, 9, 0.3), black);
  back.position.set(0, 6, -3.3);
  g.add(back);
  // screen with a canvas texture (colour sweep)
  const cv = document.createElement("canvas");
  cv.width = 256;
  cv.height = 128;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(11, 5.5),
    new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }),
  );
  screen.position.set(0, 6.4, -3.1);
  g.add(screen);
  Object.assign(stageScreen, { cv, tex });
  // speaker stacks
  for (const x of [-11, 11]) {
    for (let k = 0; k < 4; k++) {
      const box = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 1.4), black);
      box.position.set(x, 0.7 + k * 1.45, 2.2);
      g.add(box);
      const cone = new THREE.Mesh(new THREE.CircleGeometry(0.5, 14), flat(0x3a3a44));
      cone.position.set(x, 0.7 + k * 1.45, 2.91);
      g.add(cone);
    }
  }
  // banner on the front truss
  const banner = new THREE.Mesh(new THREE.PlaneGeometry(12, 1.1), flat(0xffd23f));
  banner.position.set(0, 10.4, 3.72);
  g.add(banner);
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = o.receiveShadow = true;
  });
  g.position.set(-2, 0, -34);
  ground.add(g);
}
onFrame((t) => {
  const { cv, tex } = stageScreen;
  const c = cv.getContext("2d");
  const h = (t * 40) % 360;
  const gr = c.createLinearGradient(0, 0, 256, 128);
  gr.addColorStop(0, `hsl(${h},90%,55%)`);
  gr.addColorStop(1, `hsl(${(h + 120) % 360},90%,50%)`);
  c.fillStyle = gr;
  c.fillRect(0, 0, 256, 128);
  // equaliser bars
  c.fillStyle = "rgba(255,255,255,0.85)";
  for (let i = 0; i < 16; i++) {
    const v = 0.3 + 0.7 * Math.abs(Math.sin(t * 3.1 + i * 1.7) * Math.cos(t * 1.3 + i));
    c.fillRect(8 + i * 15.5, 120 - v * 90, 10, v * 90);
  }
  tex.needsUpdate = true;
});

// festival fence behind the tents + flags on poles
{
  const fenceMat = flat(0x9aa0a6, { metalness: 0.5, roughness: 0.5 });
  for (let i = 0; i < 26; i++) {
    const x = -39 + i * 3;
    const panel = new THREE.Mesh(new THREE.BoxGeometry(2.9, 1.9, 0.06), fenceMat);
    panel.position.set(x, 0.95, -22);
    panel.castShadow = true;
    ground.add(panel);
  }
}
const FLAG_COLORS = [0xe94b3c, 0xffd23f, 0x2f8ad6, 0x36a568, 0xf07aa8, 0xff8a2a];
const flags = [];
[
  [-19, -18],
  [-11, -20],
  [-3, -19],
  [6, -20],
  [14, -18.5],
  [22, -17],
  [-24, -8],
  [25, -9],
].forEach(([x, z], i) => {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 7, 6), flat(0xeeeeee));
  pole.position.y = 3.5;
  g.add(pole);
  const cloth = new THREE.Mesh(
    new THREE.PlaneGeometry(1.4, 2.6, 6, 1),
    flat(FLAG_COLORS[i % FLAG_COLORS.length], { side: THREE.DoubleSide, roughness: 0.9 }),
  );
  cloth.position.set(0.72, 5.6, 0);
  g.add(cloth);
  g.position.set(x, 0, z);
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });
  ground.add(g);
  flags.push({ cloth, base: cloth.geometry.attributes.position.array.slice(), i });
});
onFrame((t) =>
  flags.forEach(({ cloth, base, i }) => {
    const p = cloth.geometry.attributes.position;
    for (let k = 0; k < p.count; k++) {
      const x = base[k * 3];
      const f = (x + 0.7) / 1.4;
      p.array[k * 3 + 2] = Math.sin(t * 4 + x * 3 + i) * 0.25 * f;
    }
    p.needsUpdate = true;
  }),
);

// a few trees at the field edge, bushes, bunting between the flag poles
[
  [-28, -16, 1.4],
  [-31, -4, 1.3],
  [29, -14, 1.5],
  [31, 3, 1.3],
  [-26, 12, 1.2],
  [27, 13, 1.2],
].forEach(([x, z, s], i) => tree(x, z, s, SEED + i));
scatter((i) => bush(SEED + i, 0x7f9a3a), 7, {
  rMin: 18,
  rMax: 26,
  seed: SEED + 3,
});
lightString([-19, 5.2, -18], [-11, 5.2, -20], {
  n: 14,
  sag: 0.9,
  colors: [0xe94b3c, 0xffd23f, 0x2f8ad6, 0x36a568],
});
lightString([-3, 5.2, -19], [6, 5.2, -20], {
  n: 14,
  sag: 0.9,
  colors: [0xf07aa8, 0xffd23f, 0x2f8ad6, 0xff8a2a],
});

// ---------------------------------------------------------------- life
// balloons drifting up from behind the tents
{
  const cols = [0xe94b3c, 0xffd23f, 0x2f8ad6, 0xf07aa8];
  const bs = [];
  for (let i = 0; i < 6; i++) {
    const b = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 14, 10),
      flat(cols[i % 4], { roughness: 0.25 }),
    );
    b.scale.y = 1.2;
    ground.add(b);
    bs.push(b);
  }
  onFrame((t) =>
    bs.forEach((b, i) => {
      const ph = (t * 0.05 + i * 0.17) % 1;
      b.position.set(-16 + i * 6.5 + Math.sin(t * 0.7 + i) * 1.2, 2 + ph * 22, -16 - i * 1.5);
    }),
  );
}
// dust motes glowing in the low sun
fireflies(60, { area: [-14, 14, 0.3, 4.0, -12, 8], seed: SEED, color: 0xffe6b0, size: 0.05 });

// flags sway; bushes too
flags.forEach(({ cloth }) => sway(cloth.parent, 3, 0.01));

finishSet({ ground: GROUND });
export { sky };
