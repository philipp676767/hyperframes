// MRT (#26): a radiology room at night, cut open like a dollhouse. Cool
// teal light, a yellow magnet-field line on the vinyl floor, the control
// room behind a big glass pane (glowing monitors, the operator at the desk),
// tall windows on the left with rain running down and the lit city outside,
// the skyline rising over the back wall.
import { THREE, flat, M, ground, onFrame, rng, facet, facetMat, patches } from "./world.js";
import { SKIES, setSky, finishSet, F, add, fireflies } from "./environments.js";
import { bush } from "./props.js";

const SEED = 26;
const r = rng(SEED);

// ---------------------------------------------------------------- light
const sky = setSky({
  ...SKIES.nacht,
  top: [0.02, 0.04, 0.13],
  mid: [0.06, 0.1, 0.26],
  hor: [0.2, 0.27, 0.5],
  below: [0.05, 0.07, 0.16],
  hemi: [0xa6e4ff, 0x2a3048, 1.25],
  key: [0xe4f1ff, 2.1],
  keyPos: [4, 13, 7],
  rim: [0x5fd0ff, 1.1],
  stars: 0.7,
  clouds: 6,
  fog: [45, 150],
});

// a box with hand-painted facets, standing on y (bottom)
const box = (w, h, d, color, x, y, z, seed = 1, extra = {}) =>
  add(F(new THREE.BoxGeometry(w, h, d, 1, 1, 1), flat(color, extra), 0.05, seed), x, y + h / 2, z);
const glow = (color, k = 1.4) => flat(color, { emissive: color, emissiveIntensity: k });

// ---------------------------------------------------------------- room shell
// floor slab (x -11…15, z -9…15), the diorama floats in the night
const X0 = -11;
const X1 = 15;
const Z0 = -9;
const Z1 = 15;
{
  const w = X1 - X0;
  const d = Z1 - Z0;
  const geo = patches(facet(new THREE.BoxGeometry(w, 0.7, d, 26, 1, 24), 0.035, SEED), {
    amt: 0.07,
    scale: 0.18,
    seed: SEED,
    warm: 0.2,
  });
  const slab = new THREE.Mesh(geo, facetMat(flat(0xc4d4d8, { roughness: 0.6 })));
  slab.position.set((X0 + X1) / 2, -0.35, (Z0 + Z1) / 2);
  slab.receiveShadow = true;
  ground.add(slab);
  // vinyl seams: a faint tile grid
  const seams = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.03, 0.01, d),
    flat(0xaabdc2),
    Math.floor(w / 2),
  );
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < seams.count; i++)
    seams.setMatrixAt(i, m4.makeTranslation(X0 + 1 + i * 2, 0.006, (Z0 + Z1) / 2));
  ground.add(seams);
  const seamsZ = new THREE.InstancedMesh(
    new THREE.BoxGeometry(w, 0.01, 0.03),
    flat(0xaabdc2),
    Math.floor(d / 2),
  );
  for (let i = 0; i < seamsZ.count; i++)
    seamsZ.setMatrixAt(i, m4.makeTranslation((X0 + X1) / 2, 0.006, Z0 + 1 + i * 2));
  ground.add(seamsZ);
}
// the yellow 5-gauss line around the magnet, dashed
{
  const n = 48;
  const dash = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.42, 0.012, 0.14),
    flat(0xffc928, { roughness: 0.5 }),
    n,
  );
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -a + Math.PI / 2);
    m4.compose(
      new THREE.Vector3(Math.cos(a) * 4.6, 0.012, Math.sin(a) * 4.0 - 0.3),
      q,
      new THREE.Vector3(1, 1, 1),
    );
    dash.setMatrixAt(i, m4);
  }
  dash.receiveShadow = true;
  ground.add(dash);
}

const WALL = 0xd5ebe7;
const WALL_H = 6.4;
// a wall piece with colour patches
const wallBox = (w, h, d, x, y, z, seed) => {
  const geo = patches(
    facet(new THREE.BoxGeometry(w, h, d, Math.ceil(w), Math.ceil(h), 1), 0.03, seed),
    {
      amt: 0.06,
      scale: 0.2,
      seed,
      warm: 0.15,
      fn: () => 0,
    },
  );
  return add(new THREE.Mesh(geo, facetMat(flat(WALL, { roughness: 0.8 }))), x, y + h / 2, z);
};

// back wall (z = -9) with the control-room window (x -9.2…-1.8, y 1.3…4.3)
const BZ = Z0 - 0.2;
wallBox(1.8, WALL_H, 0.4, -10.1, 0, BZ, 1);
wallBox(7.4, 1.3, 0.4, -5.5, 0, BZ, 2);
wallBox(7.4, WALL_H - 4.3, 0.4, -5.5, 4.3, BZ, 3);
wallBox(X1 - -1.8, WALL_H, 0.4, (X1 + -1.8) / 2, 0, BZ, 4);
// left wall (x = -11) with two tall windows (z -6…-2.6 and 0.6…4), y 1.0…5.0
const LX = X0 - 0.2;
wallBox(0.4, WALL_H, 3.0, LX, 0, -7.6, 5);
wallBox(0.4, WALL_H, 3.2, LX, 0, -1.0, 6);
wallBox(0.4, WALL_H, Z1 - 4, LX, 0, (Z1 + 4) / 2, 7);
for (const [z0, z1] of [
  [-6.1, -2.6],
  [0.6, 4.0],
]) {
  wallBox(0.4, 1.0, z1 - z0, LX, 0, (z0 + z1) / 2, 8);
  wallBox(0.4, WALL_H - 5.0, z1 - z0, LX, 5.0, (z0 + z1) / 2, 9);
}
// skirting boards + a top edge cap in a deeper teal
box(X1 - X0 + 0.4, 0.22, 0.12, 0x6fa7a6, (X0 + X1) / 2, 0, Z0 + 0.06, 10);
box(0.12, 0.22, Z1 - Z0, 0x6fa7a6, X0 + 0.06, 0, (Z0 + Z1) / 2, 11);
box(X1 - X0 + 0.8, 0.18, 0.6, 0x5c8f90, (X0 + X1) / 2, WALL_H, BZ, 12);
box(0.6, 0.18, Z1 - Z0 + 0.6, 0x5c8f90, LX, WALL_H, (Z0 + Z1) / 2, 13);
// a teal stripe along the walls at hand height
box(X1 - X0, 0.35, 0.06, 0x8cc9c4, (X0 + X1) / 2, 1.05, Z0 + 0.03, 14);

// ---------------------------------------------------------------- windows
const frameMat = flat(0xf3f6f7, { roughness: 0.5 });
const glassMat = new THREE.MeshStandardMaterial({
  color: 0x9fd4ee,
  roughness: 0.05,
  metalness: 0.1,
  transparent: true,
  opacity: 0.22,
  depthWrite: false,
});
// rain: streaks running down each window, deterministic
function rainOn(x0, x1, y0, y1, z, alongZ, seed) {
  const n = 46;
  const rr = rng(seed);
  const im = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.018, 0.34, 0.018),
    new THREE.MeshBasicMaterial({ color: 0xcfeeff, transparent: true, opacity: 0.55 }),
    n,
  );
  im.userData.noAO = true;
  im.frustumCulled = false;
  ground.add(im);
  const s = Array.from({ length: n }, () => [rr(), rr(), 0.35 + rr() * 0.6]);
  const m4 = new THREE.Matrix4();
  onFrame((t) => {
    s.forEach(([a, ph, sp], i) => {
      const u = x0 + (x1 - x0) * a;
      const y = y1 - ((((t * sp + ph) % 1) + 1) % 1) * (y1 - y0);
      if (alongZ) m4.makeTranslation(z, y, u);
      else m4.makeTranslation(u, y, z);
      im.setMatrixAt(i, m4);
    });
    im.instanceMatrix.needsUpdate = true;
  });
}
// left windows: frame + glass + rain
for (const [z0, z1] of [
  [-6.1, -2.6],
  [0.6, 4.0],
]) {
  const zc = (z0 + z1) / 2;
  const len = z1 - z0;
  const pane = new THREE.Mesh(new THREE.BoxGeometry(0.04, 4.0, len), glassMat);
  pane.position.set(LX, 3.0, zc);
  pane.userData.noAO = true;
  ground.add(pane);
  for (const [h, dz, y] of [
    [0.16, len + 0.2, 5.0],
    [0.16, len + 0.2, 1.0],
    [4.2, 0.16, null],
  ]) {
    for (const zz of y == null ? [z0, z1, zc] : [zc]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.5, h, dz), frameMat);
      b.position.set(LX + 0.05, y ?? 3.0, zz);
      ground.add(b);
    }
  }
  box(0.8, 0.12, len + 0.3, 0xf3f6f7, LX + 0.35, 0.95, zc, 15);
  rainOn(z0 + 0.1, z1 - 0.1, 1.1, 4.9, LX + 0.24, true, SEED + z0 * 10);
}

// ---------------------------------------------------------------- control room (hero piece)
// behind the glass of the back wall: desk, three glowing monitors, the
// operator in a chair, a lit back wall
{
  const cz = BZ - 2.4;
  // floor + walls of the small room
  add(F(new THREE.BoxGeometry(9.2, 0.2, 4.6), flat(0x8fa6ad), 0.04, 31), -5.5, -0.1, cz);
  wallBox(9.2, WALL_H, 0.3, -5.5, 0, cz - 2.3, 32);
  wallBox(0.3, WALL_H, 4.6, -10.1, 0, cz, 33);
  // window frame + glass
  const pane = new THREE.Mesh(new THREE.BoxGeometry(7.4, 3.0, 0.04), glassMat);
  pane.position.set(-5.5, 2.8, BZ);
  pane.userData.noAO = true;
  ground.add(pane);
  for (const [w, h, x, y] of [
    [7.6, 0.18, -5.5, 4.3],
    [7.6, 0.18, -5.5, 1.3],
    [0.18, 3.2, -9.2, 2.8],
    [0.18, 3.2, -1.8, 2.8],
    [0.12, 3.0, -5.5, 2.8],
  ]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.5), frameMat);
    b.position.set(x, y, BZ + 0.02);
    ground.add(b);
  }
  box(7.8, 0.12, 0.7, 0xf3f6f7, -5.5, 1.24, BZ + 0.25, 34);
  // desk
  box(6.6, 0.12, 1.3, 0xe9eef0, -5.5, 1.0, cz + 0.9, 35);
  box(0.12, 1.0, 1.2, 0xbac6ca, -8.6, 0, cz + 0.9, 36);
  box(0.12, 1.0, 1.2, 0xbac6ca, -2.4, 0, cz + 0.9, 37);
  // three monitors with scan images (canvas)
  const scanTex = (seed) => {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 96;
    const g = c.getContext("2d");
    g.fillStyle = "#04121c";
    g.fillRect(0, 0, 128, 96);
    const rr = rng(seed);
    g.fillStyle = "#cfe9f5";
    g.beginPath();
    g.ellipse(64, 50, 34 + rr() * 6, 36, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#5c7b8c";
    for (let i = 0; i < 6; i++) {
      g.beginPath();
      g.ellipse(
        40 + rr() * 48,
        30 + rr() * 40,
        6 + rr() * 8,
        5 + rr() * 8,
        rr() * 3,
        0,
        Math.PI * 2,
      );
      g.fill();
    }
    g.fillStyle = "#3dff7a";
    g.fillRect(6, 86, 40, 3);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };
  [-7.4, -5.5, -3.6].forEach((x, i) => {
    box(1.7, 1.05, 0.08, 0x2a3138, x, 1.55, cz + 0.6, 40 + i);
    const scr = new THREE.Mesh(
      new THREE.PlaneGeometry(1.55, 0.92),
      new THREE.MeshBasicMaterial({ map: scanTex(SEED + i), toneMapped: false }),
    );
    scr.position.set(x, 2.075, cz + 0.65);
    scr.userData.noAO = true;
    ground.add(scr);
    box(0.12, 0.45, 0.12, 0x2a3138, x, 1.12, cz + 0.55, 43 + i);
  });
  // the monitors light the room
  const pl = new THREE.PointLight(0x6fc8ff, 6, 9, 1.6);
  pl.position.set(-5.5, 2.4, cz + 1.6);
  ground.add(pl);
  // the operator: chair + low-poly person, head slowly turning
  const op = new THREE.Group();
  const chair = flat(0x2f3a44);
  op.add(F(new THREE.BoxGeometry(0.8, 0.14, 0.8), chair, 0.06, 51).translateY(0.75));
  op.add(
    F(new THREE.BoxGeometry(0.8, 0.9, 0.12), chair, 0.06, 52)
      .translateY(1.25)
      .translateZ(0.4),
  );
  op.add(F(new THREE.CylinderGeometry(0.06, 0.06, 0.7, 6), M.steel, 0.04, 53).translateY(0.38));
  const shirt = flat(0x3fa7a3);
  const torso = F(new THREE.CylinderGeometry(0.26, 0.32, 0.8, 8), shirt, 0.06, 54);
  torso.position.set(0, 1.25, 0.12);
  op.add(torso);
  const head = new THREE.Group();
  head.position.set(0, 1.85, 0.08);
  head.add(F(new THREE.IcosahedronGeometry(0.22, 1), flat(0xe8b48c), 0.06, 55));
  const hair = F(new THREE.IcosahedronGeometry(0.235, 1), flat(0x3b2a20), 0.06, 56);
  hair.scale.set(1, 0.7, 1);
  hair.position.set(0, 0.07, 0.04);
  head.add(hair);
  op.add(head);
  for (const s of [-1, 1]) {
    const arm = F(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 6), shirt, 0.06, 57);
    arm.position.set(s * 0.32, 1.25, -0.15);
    arm.rotation.x = -1.1;
    op.add(arm);
  }
  op.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  op.position.set(-5.0, 0, cz + 1.75);
  op.rotation.y = Math.PI;
  ground.add(op);
  onFrame((t) => {
    head.rotation.y = Math.sin(t * 0.45) * 0.35;
    op.rotation.y = Math.PI + Math.sin(t * 0.21 + 1) * 0.12;
  });
  // ceiling light strip in the control room
  box(6.0, 0.08, 0.4, 0xffffff, -5.5, WALL_H - 0.4, cz, 58, {
    emissive: 0xdff6ff,
    emissiveIntensity: 1.2,
  });
}

// ---------------------------------------------------------------- room dressing
// the shielded door on the back wall, copper-trimmed, with a round window
{
  const x = 5.2;
  box(2.2, 4.1, 0.16, 0xe7eef0, x, 0, BZ + 0.26, 60);
  box(2.45, 0.16, 0.22, 0xb87a46, x, 4.1, BZ + 0.26, 61, { metalness: 0.5, roughness: 0.4 });
  box(0.16, 4.1, 0.22, 0xb87a46, x - 1.18, 0, BZ + 0.26, 62, { metalness: 0.5, roughness: 0.4 });
  box(0.16, 4.1, 0.22, 0xb87a46, x + 1.18, 0, BZ + 0.26, 63, { metalness: 0.5, roughness: 0.4 });
  const win = new THREE.Mesh(new THREE.CircleGeometry(0.32, 16), glow(0xbfe6ff, 0.6));
  win.position.set(x, 2.9, BZ + 0.36);
  ground.add(win);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.05, 6, 16), M.chrome);
  ring.position.copy(win.position);
  ground.add(ring);
  box(0.5, 0.1, 0.12, 0xcfd6da, x + 0.7, 1.9, BZ + 0.4, 64, { metalness: 0.7, roughness: 0.25 });
}
// warning sign next to the door: yellow triangle with a horseshoe magnet
{
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = "#ffffff";
  g.fillRect(0, 0, 256, 256);
  g.fillStyle = "#ffc928";
  g.strokeStyle = "#1c1c22";
  g.lineWidth = 14;
  g.beginPath();
  g.moveTo(128, 22);
  g.lineTo(236, 214);
  g.lineTo(20, 214);
  g.closePath();
  g.fill();
  g.stroke();
  g.lineWidth = 20;
  g.beginPath();
  g.arc(128, 140, 38, Math.PI, 0, true);
  g.stroke();
  g.fillStyle = "#e2453c";
  g.fillRect(80, 140, 20, 34);
  g.fillRect(156, 140, 20, 34);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Mesh(
    new THREE.PlaneGeometry(1.1, 1.1),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }),
  );
  s.position.set(7.8, 3.2, BZ + 0.22);
  ground.add(s);
}
// wall clock with moving hands
{
  const cx = 1.0;
  const cy = 4.9;
  const face = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.08, 20), flat(0xffffff));
  face.rotation.x = Math.PI / 2;
  face.position.set(cx, cy, BZ + 0.26);
  ground.add(face);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 6, 20), flat(0x2f3a44));
  rim.position.set(cx, cy, BZ + 0.28);
  ground.add(rim);
  const hand = (len, w, c) => {
    const p = new THREE.Group();
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, len, 0.02), flat(c));
    m.position.y = len / 2;
    p.add(m);
    p.position.set(cx, cy, BZ + 0.32);
    ground.add(p);
    return p;
  };
  const hh = hand(0.26, 0.05, 0x1c1c22);
  const mh = hand(0.4, 0.035, 0x1c1c22);
  const sh = hand(0.42, 0.015, 0xe2453c);
  hh.rotation.z = -0.35;
  onFrame((t) => {
    sh.rotation.z = -((t + 20) / 60) * Math.PI * 2;
    mh.rotation.z = -1.9 - t * 0.004;
  });
}
// headphones on a hook + a hanging rack with coil pads
{
  const x = 2.6;
  box(0.08, 0.3, 0.2, 0x9aa6ad, x, 2.7, BZ + 0.3, 70);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.05, 6, 12, Math.PI), flat(0x2f3a44));
  band.position.set(x, 2.5, BZ + 0.42);
  ground.add(band);
  for (const s of [-1, 1]) {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.12, 10), flat(0x3fa7a3));
    cup.rotation.z = Math.PI / 2;
    cup.position.set(x + s * 0.28, 2.42, BZ + 0.42);
    ground.add(cup);
  }
}
// shelf on the left wall with foam pads and folded blankets
{
  const z = 8.5;
  box(1.0, 0.1, 3.2, 0xe9eef0, X0 + 0.55, 1.1, z, 80);
  box(1.0, 0.1, 3.2, 0xe9eef0, X0 + 0.55, 2.2, z, 81);
  box(1.0, 2.3, 0.1, 0xbac6ca, X0 + 0.55, 0, z - 1.6, 82);
  box(1.0, 2.3, 0.1, 0xbac6ca, X0 + 0.55, 0, z + 1.6, 83);
  const cols = [0x6fc0e8, 0xffb347, 0x9fdc8a, 0xf08aa8];
  for (let i = 0; i < 4; i++)
    box(0.7, 0.32, 0.6, cols[i], X0 + 0.55, 1.2, z - 1.1 + i * 0.72, 84 + i);
  for (let i = 0; i < 3; i++)
    box(
      0.75,
      0.16,
      0.8,
      [0xffffff, 0xd8ecf5, 0xffffff][i],
      X0 + 0.55,
      2.3 + i * 0.16,
      z - 0.6,
      90 + i,
    );
  box(0.75, 0.4, 0.8, 0x3fa7a3, X0 + 0.55, 2.3, z + 0.7, 93);
}
// linen cabinet in the back-left corner
box(1.6, 2.6, 0.9, 0xe9eef0, -9.9, 0, -7.9, 95);
box(0.06, 0.4, 0.06, 0x9aa6ad, -9.6, 1.5, -7.42, 96);
box(0.06, 0.4, 0.06, 0x9aa6ad, -10.2, 1.5, -7.42, 97);
// plant in a pot (right back), a step stool, a free-standing sign
{
  const pot = add(
    F(new THREE.CylinderGeometry(0.5, 0.4, 0.7, 10), flat(0xf3f6f7), 0.05, 100),
    11.5,
    0.35,
    -7.4,
  );
  void pot;
  const b = bush(SEED, 0x4f9a5a);
  b.position.set(11.5, 0.6, -7.4);
  b.scale.setScalar(1.3);
  ground.add(b);
  onFrame((t) => (b.rotation.z = Math.sin(t * 0.9) * 0.02));
  box(1.0, 0.35, 0.7, 0xbac6ca, 9.2, 0, -6.6, 101);
  box(1.0, 0.35, 0.35, 0xbac6ca, 9.2, 0.35, -6.78, 102);
  // A-frame sign: "Stop – Magnet"
  const g = new THREE.Group();
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 192;
  const cx = c.getContext("2d");
  cx.fillStyle = "#ffc928";
  cx.fillRect(0, 0, 128, 192);
  cx.fillStyle = "#1c1c22";
  for (let i = -2; i < 8; i++) {
    cx.beginPath();
    cx.moveTo(i * 30, 0);
    cx.lineTo(i * 30 + 14, 0);
    cx.lineTo(i * 30 + 14 + 24, 30);
    cx.lineTo(i * 30 + 24, 30);
    cx.fill();
  }
  cx.fillStyle = "#e2453c";
  cx.beginPath();
  cx.arc(64, 110, 42, 0, Math.PI * 2);
  cx.fill();
  cx.strokeStyle = "#ffffff";
  cx.lineWidth = 12;
  cx.beginPath();
  cx.arc(64, 118, 18, Math.PI, 0, true);
  cx.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const signMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 });
  for (const s of [-1, 1]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.04), [
      frameMat,
      frameMat,
      frameMat,
      frameMat,
      signMat,
      signMat,
    ]);
    p.position.set(0, 0.6, s * 0.18);
    p.rotation.x = s * 0.28;
    p.castShadow = true;
    g.add(p);
  }
  g.position.set(9.5, 0, 6.5);
  g.rotation.y = -0.5;
  ground.add(g);
}
// ceiling-mounted lights over the room: hanging panels (lit) on thin rods
for (const [x, z] of [
  [-3.5, -3],
  [3.5, -3],
  [-3.5, 4],
  [3.5, 4],
]) {
  box(2.4, 0.12, 1.0, 0xffffff, x, 6.2, z, 110, { emissive: 0xe6f7ff, emissiveIntensity: 0.9 });
}

// ---------------------------------------------------------------- city outside
// lit towers past the left windows and over the back wall
{
  const rr = rng(SEED + 7);
  const bodies = [];
  const lit = [];
  const place = (x, z, w, d, h) => {
    bodies.push([x, z, w, d, h]);
    for (let y = 1.2; y < h - 0.8; y += 1.3)
      for (let u = -w / 2 + 0.7; u < w / 2 - 0.4; u += 1.1)
        if (rr() < 0.42)
          lit.push([x + u, y, z + d / 2 + 0.05, x - w / 2 - 0.05, z + u * (d / w), rr()]);
  };
  for (let i = 0; i < 22; i++)
    place(-48 + i * 4.6 + rr() * 2, -42 - rr() * 18, 3 + rr() * 2.5, 3 + rr() * 2, 9 + rr() * 22);
  for (let i = 0; i < 14; i++)
    place(-34 - rr() * 14, -30 + i * 4.8 + rr() * 2, 3 + rr() * 2, 3 + rr() * 2.5, 7 + rr() * 16);
  const bodyMat = facetMat(flat(0x1d2a44, { roughness: 0.9 }));
  bodies.forEach(([x, z, w, d, h], i) => {
    const m = new THREE.Mesh(facet(new THREE.BoxGeometry(w, h, d), 0.08, i), bodyMat);
    m.position.set(x, h / 2 - 2, z);
    ground.add(m);
  });
  const winGeo = new THREE.PlaneGeometry(0.55, 0.7);
  const winMat = new THREE.MeshBasicMaterial({ color: 0xffd98a, toneMapped: false });
  const im = new THREE.InstancedMesh(winGeo, winMat, lit.length * 2);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const q2 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
  const col = new THREE.Color();
  lit.forEach(([fx, y, fz, sx, sz, k], i) => {
    m4.compose(new THREE.Vector3(fx, y - 2, fz), q, new THREE.Vector3(1, 1, 1));
    im.setMatrixAt(i * 2, m4);
    m4.compose(new THREE.Vector3(sx + 9, y - 2, sz), q2, new THREE.Vector3(1, 1, 1));
    im.setMatrixAt(i * 2 + 1, m4);
    col.set(k < 0.7 ? 0xffd98a : 0x9fdcff);
    im.setColorAt(i * 2, col);
    im.setColorAt(i * 2 + 1, col);
  });
  im.userData.noAO = true;
  ground.add(im);
  // a red aircraft light blinking on the tallest tower
  const beacon = new THREE.Mesh(new THREE.IcosahedronGeometry(0.35, 0), glow(0xff3b2f, 2));
  const top = bodies.reduce((a, b) => (b[4] > a[4] ? b : a));
  beacon.position.set(top[0], top[4] - 2 + 0.4, top[1]);
  ground.add(beacon);
  onFrame((t) => (beacon.visible = (t * 0.8) % 1 < 0.5));
}

// ---------------------------------------------------------------- life
// fine dust glinting in the cool light
fireflies(28, { area: [-10, 14, 0.6, 5.5, -8, 12], color: 0xcff4ff, seed: SEED, size: 0.03 });
void r;

finishSet({ ground: 0xc4d4d8 });
export { sky };
