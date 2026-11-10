// #66 Glätteisen — "Zischt dein Glätteisen? Dann kocht gerade dein Haar."
// VANITY (origin, set.js): a wet brown strand hangs from above (your head
// is just out of frame), your hand clamps a matte-black flat iron with
// rose-gold trim on it; steam bursts out. The iron slides down and leaves
// the strand straight; rain at the window frizzes it again. Later the iron
// rests on its silicone mat while its display climbs to 230 °C. A single
// hair holds a 100 g chocolate bar; a curly strand joins for "Team Locken".
// LEITER: one keratin rope ladder (two chains + yellow bridges) — waves,
// heat cracks the bridges, two hot plates press it straight, it snaps in
// straight; water molecules crack it again. HAAR: one giant hair cut open —
// water beads inside, hot plates outside, the water boils into steam
// bubbles, the hair bulges and snaps. OFEN: an oven on full blast.
import {
  THREE,
  ramp,
  smooth,
  clamp01,
  lerp,
  pop,
  V,
  rng,
  scene,
  real,
  roundedBox,
  showPanel,
  LED,
  labels,
  squash,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { MAT } from "./set.js";
import { createHand } from "./hand.js";
import { counter, readout } from "./hud.js";
import {
  T,
  shots,
  LABELS,
  HIGHLIGHTS,
  LEITER,
  HAAR,
  OFEN,
  STRAND_END,
  BAR,
  CURLY,
  IRON,
} from "./beats.js";

highlights(HIGHLIGHTS);
const PI = Math.PI;
const R = rng(6606);
const between = (t, a, b) => t >= a && t < b;
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = V(1, 1, 1);
const _p = V(0, 0, 0);
const _c = new THREE.Color();
const glow = (color, i = 2, extra = {}) =>
  new THREE.MeshStandardMaterial({
    color: 0x000000,
    emissive: color,
    emissiveIntensity: i,
    ...extra,
  });
const canvasTex = (w, h, draw) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.userData = { c, g: c.getContext("2d") };
  if (draw) draw(t.userData.g, w, h);
  return t;
};

// ================================================================ strands
// A strand = many thin hair tubes, built straight once; every frame each
// vertex is pushed sideways by the curl of its height (wavy below the iron,
// straight where it has passed), pinched where the plates clamp.
const hairWet = new THREE.Color(0x3a2415);
const hairDry = new THREE.Color(0x6a4428);
const hairMat = new THREE.MeshPhysicalMaterial({
  color: 0x3a2415,
  roughness: 0.32,
  sheen: 0.8,
  sheenRoughness: 0.35,
  sheenColor: new THREE.Color(0xd9a878),
  clearcoat: 0.4,
  clearcoatRoughness: 0.3,
});
function makeStrand({ n, width, top, seed, x0 = 0 }) {
  const r = rng(seed);
  const SEG = 120;
  const RAD = 4;
  const ph0 = r() * PI * 2;
  const hairs = [];
  const geos = [];
  for (let i = 0; i < n; i++) {
    const bx = (r() - 0.5) * width;
    const bz = (r() - 0.5) * 0.22;
    const bottom = STRAND_END + r() * 0.7;
    const rad = 0.011 + r() * 0.008;
    const g = new THREE.CylinderGeometry(rad, rad * 0.6, top - bottom, RAD, SEG, true);
    g.translate(bx, (top + bottom) / 2, bz);
    geos.push(g);
    // one shared wave for the whole strand (real hair clumps), a little scatter per hair
    hairs.push({ bx, bz, ph: ph0 + (r() - 0.5) * 0.9, ph2: ph0 * 1.3 + (r() - 0.5) * 1.2 });
  }
  // merge
  let count = 0;
  for (const g of geos) count += g.attributes.position.count;
  const pos = new Float32Array(count * 3);
  const nor = new Float32Array(count * 3);
  const idx = [];
  const meta = new Float32Array(count * 3); // base x, base z, hair index
  let off = 0;
  geos.forEach((g, hi) => {
    const p = g.attributes.position.array;
    pos.set(p, off * 3);
    nor.set(g.attributes.normal.array, off * 3);
    for (let v = 0; v < g.attributes.position.count; v++) {
      meta[(off + v) * 3] = p[v * 3];
      meta[(off + v) * 3 + 1] = p[v * 3 + 2];
      meta[(off + v) * 3 + 2] = hi;
    }
    const ix = g.index.array;
    for (let k = 0; k < ix.length; k++) idx.push(ix[k] + off);
    off += g.attributes.position.count;
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  geo.setIndex(idx);
  const mesh = new THREE.Mesh(geo, hairMat);
  mesh.position.x = x0;
  mesh.castShadow = true;
  mesh.frustumCulled = false;
  scene.add(mesh);
  return { mesh, geo, meta, hairs, base: pos.slice() };
}
// curl(y) → amplitude 0..1; pinch(y) → 0..1 (1 = squeezed flat between plates)
function bendStrand(S, t, { curl, pinch, k = 1.25, amp = 0.38, frizz = 0, sway = 0.05 }) {
  const pos = S.geo.attributes.position.array;
  const { meta, hairs, base } = S;
  for (let v = 0, n = pos.length / 3; v < n; v++) {
    const y = base[v * 3 + 1];
    const bx = meta[v * 3];
    const bz = meta[v * 3 + 1];
    const h = hairs[meta[v * 3 + 2]];
    const c = curl(y);
    const pz = pinch(y);
    const hang = clamp01((22 - y) / 18);
    let dx = c * amp * Math.sin(y * k + h.ph) + Math.sin(t * 1.1 + y * 0.18) * sway * hang;
    let dz = c * amp * 0.6 * Math.cos(y * k * 0.9 + h.ph2);
    if (frizz > 0) {
      dx += frizz * 0.22 * Math.sin(y * 3.3 + h.ph * 2.1);
      dz += frizz * 0.2 * Math.cos(y * 2.9 + h.ph2 * 1.7);
    }
    const px = base[v * 3] - bx; // ring offset
    const pzr = base[v * 3 + 2] - bz;
    pos[v * 3] = px + lerp(bx + dx, bx * 0.92, pz);
    pos[v * 3 + 2] = pzr + lerp(bz + dz, bz * 0.12, pz);
  }
  S.geo.attributes.position.needsUpdate = true;
}
const strand = makeStrand({ n: 150, width: 1.1, top: 24, seed: 11 });
const curly = makeStrand({ n: 120, width: 1.0, top: 24, seed: 23, x0: CURLY });

// water drops on the wet strand
const NDROP = 40;
const dropMat = new THREE.MeshPhysicalMaterial({
  color: 0xe8f4ff,
  roughness: 0.02,
  transparent: true,
  opacity: 0.6,
  envMapIntensity: 2.2,
  clearcoat: 1,
});
const drops = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 16, 12), dropMat, NDROP);
drops.frustumCulled = false;
drops.userData.noAO = true;
scene.add(drops);
const DROPS = Array.from({ length: NDROP }, () => ({
  hair: Math.floor(R() * 150),
  y: 4 + R() * 14,
  s: 0.6 + R() * 0.9,
  fall: R() < 0.25 ? R() * 5 : -1,
}));

// ================================================================ the flat iron
// Local frame: arms along x (tips at -x, hinge at +x), plates face ±z,
// plate centre at x = -0.75.
const iron = new THREE.Group();
scene.add(iron);
const housing = real.plastic(0x1c1c20, {
  roughness: 0.38,
  clearcoat: 0.5,
  clearcoatRoughness: 0.25,
});
const rose = real.metal(0xd9a08a, { roughness: 0.22 });
const plateMat = new THREE.MeshPhysicalMaterial({
  color: 0x3a3a3f,
  roughness: 0.18,
  clearcoat: 0.8,
  emissive: 0xff3a10,
  emissiveIntensity: 0,
});
const lcd = canvasTex(256, 96);
let lcdVal = "";
function setLcd(v) {
  if (v === lcdVal) return;
  lcdVal = v;
  const g = lcd.userData.g;
  g.fillStyle = "#0b0f14";
  g.fillRect(0, 0, 256, 96);
  g.fillStyle = "#ff7a4a";
  g.font = "800 66px Montserrat, Arial";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(v, 128, 52);
  lcd.needsUpdate = true;
}
setLcd("230°");
const arms = [];
for (const side of [1, -1]) {
  const pivot = new THREE.Group();
  pivot.position.set(1.45, 0, side * 0.02);
  iron.add(pivot);
  const arm = new THREE.Mesh(roundedBox(3.0, 0.5, 0.24, 0.1, 6), housing);
  arm.position.set(-1.45, 0, side * 0.14);
  arm.castShadow = arm.receiveShadow = true;
  pivot.add(arm);
  // rose-gold trim stripe on the outside
  const trim = new THREE.Mesh(roundedBox(1.7, 0.06, 0.03, 0.015), rose);
  trim.position.set(-0.7, 0.16, side * 0.265);
  pivot.add(trim);
  // floating plate on the inside
  const plate = new THREE.Mesh(roundedBox(1.4, 0.36, 0.05, 0.02), plateMat);
  plate.position.set(-2.2, 0, side * 0.005);
  pivot.add(plate);
  // tip cap
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 16), housing);
  cap.scale.set(0.6, 1.9, 1);
  cap.position.set(-2.95, 0, side * 0.14);
  pivot.add(cap);
  if (side === 1) {
    // display + button on the outer face of the front arm
    const scr = new THREE.Mesh(
      new THREE.PlaneGeometry(0.62, 0.23),
      new THREE.MeshStandardMaterial({
        map: lcd,
        emissive: 0xffffff,
        emissiveMap: lcd,
        emissiveIntensity: 1.1,
      }),
    );
    scr.position.set(-0.05, -0.04, 0.267);
    pivot.add(scr);
    const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 24), rose);
    btn.rotation.x = PI / 2;
    btn.position.set(0.45, -0.04, 0.27);
    pivot.add(btn);
  }
  arms.push(pivot);
}
// hinge barrel + swivel cord
{
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.52, 32), rose);
  barrel.position.set(1.48, 0, 0);
  iron.add(barrel);
  const swivel = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.4, 24), housing);
  swivel.rotation.z = PI / 2;
  swivel.position.set(1.82, 0, 0);
  iron.add(swivel);
  const cord = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        V(2.0, 0, 0),
        V(2.6, -0.3, 0.1),
        V(3.0, -1.6, 0.4),
        V(3.4, -4, 0.2),
        V(4.2, -9, -0.5),
      ]),
      60,
      0.06,
      10,
    ),
    real.rubber(0x1a1a1d),
  );
  iron.add(cord);
}
iron.traverse((o) => (o.castShadow = true));
// the viewer's hand holds the iron near the hinge (child of the iron)
const hand = createHand({ scale: 2.0, sleeve: 0xe6d8c4, skin: 0xf0c4a2 });
iron.add(hand.group);
// steam from the plates: soft sprites
const steamTex = (() => {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,255,255,0.9)");
  gr.addColorStop(0.4, "rgba(255,255,255,0.45)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
})();
const NSTEAM = 40;
const STEAM = Array.from({ length: NSTEAM }, () => {
  const sp = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: steamTex, transparent: true, depthWrite: false, opacity: 0.3 }),
  );
  sp.userData.noAO = true;
  scene.add(sp);
  return {
    sp,
    ph: R(),
    x: (R() - 0.5) * 1.6,
    side: R() < 0.5 ? -1 : 1,
    up: 0.6 + R(),
    sp2: 0.7 + R() * 0.6,
    s: 0.6 + R() * 1.0,
  };
});

// ================================================================ chocolate bar on one hair
const bar = new THREE.Group();
scene.add(bar);
const barHair = new THREE.Mesh(
  new THREE.CylinderGeometry(0.045, 0.045, 1, 8),
  real.plastic(0xb07a48, { roughness: 0.3 }),
);
scene.add(barHair);
{
  const wrap = canvasTex(256, 512, (g, w, h) => {
    g.fillStyle = "#5b2a86";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#7b44ad";
    g.fillRect(0, 300, w, 60);
    g.fillStyle = "#ffffff";
    g.font = "800 64px Montserrat, Arial";
    g.textAlign = "center";
    g.fillText("SCHOKO", w / 2, 150);
    g.font = "900 96px Montserrat, Arial";
    g.fillStyle = "#ffd23f";
    g.fillText("100 g", w / 2, 270);
    g.fillStyle = "#e8d9c6";
    g.font = "600 34px Montserrat, Arial";
    g.fillText("Vollmilch", w / 2, 345);
  });
  const body = new THREE.Mesh(
    roundedBox(0.85, 1.65, 0.12, 0.03),
    real.plastic(0x5b2a86, { roughness: 0.4 }),
  );
  body.castShadow = true;
  bar.add(body);
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 1.6),
    new THREE.MeshPhysicalMaterial({ map: wrap, roughness: 0.35, clearcoat: 0.4 }),
  );
  label.position.z = 0.062;
  bar.add(label);
  // silver foil peeking out at the top
  const foil = new THREE.Mesh(
    roundedBox(0.8, 0.12, 0.1, 0.02),
    real.metal(0xdfe2e6, { roughness: 0.25 }),
  );
  foil.position.y = 0.86;
  bar.add(foil);
  // the hair loop around the bar's top
  const loop = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.02, 8, 40), hairMat);
  loop.position.y = 0.55;
  loop.scale.set(1, 0.6, 0.25);
  bar.add(loop);
}

// ================================================================ macro worlds: shared bits
function backdrop(parent, r, top, bottom) {
  const g = new THREE.SphereGeometry(r, 32, 16);
  const p = g.attributes.position;
  const col = new Float32Array(p.count * 3);
  const a = new THREE.Color(top);
  const b = new THREE.Color(bottom);
  for (let i = 0; i < p.count; i++) {
    const k = clamp01((p.getY(i) / r) * 0.7 + 0.5);
    _c.copy(b).lerp(a, k);
    col.set([_c.r, _c.g, _c.b], i * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const m = new THREE.Mesh(
    g,
    new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false }),
  );
  m.userData.noAO = true;
  parent.add(m);
}
function bokeh(parent, n, color, seed) {
  const r = rng(seed);
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.2,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  });
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.4 + r() * 1.3, 12, 8), mat);
    const a = r() * PI * 2;
    const d = 18 + r() * 16;
    m.position.set(Math.cos(a) * d, -7 + r() * 16, -Math.abs(Math.sin(a)) * d - 6);
    m.userData.noAO = true;
    parent.add(m);
  }
}
function lights(parent, list) {
  return list.map(([c, i, p]) => {
    const l = new THREE.PointLight(c, i, 40, 1.2);
    l.position.set(...p);
    parent.add(l);
    return l;
  });
}
function hotPlate(parent, w, d) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(roundedBox(w, 1.1, d, 0.3, 6), plateMat);
  g.add(body);
  const back = new THREE.Mesh(roundedBox(w + 0.4, 0.8, d + 0.4, 0.3, 6), housing);
  back.position.y = 0.6;
  g.add(back);
  parent.add(g);
  return g;
}

// ================================================================ LEITER (keratin rope ladder)
const leiter = new THREE.Group();
leiter.position.set(...LEITER);
scene.add(leiter);
backdrop(leiter, 46, 0x2c4a5a, 0x0a141c);
bokeh(leiter, 26, 0xffd0a0, 5);
lights(leiter, [
  [0xfff2e6, 60, [3, 8, 9]],
  [0xffc890, 30, [-9, 2, 6]],
  [0x9fd8ff, 30, [9, -3, 5]],
]);
const NB = 44;
const beadMat = new THREE.MeshPhysicalMaterial({
  color: 0xe8b48c,
  roughness: 0.3,
  clearcoat: 0.6,
  emissive: 0xff3a10,
  emissiveIntensity: 0,
});
const beads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.3, 28, 18), beadMat, NB * 2);
beads.frustumCulled = false;
leiter.add(beads);
const NRUNG = 18;
const rungMat = new THREE.MeshPhysicalMaterial({
  color: 0xffd23f,
  roughness: 0.25,
  clearcoat: 0.5,
  emissive: 0xffb020,
  emissiveIntensity: 0.45,
});
const rungs = new THREE.InstancedMesh(
  new THREE.CylinderGeometry(0.1, 0.1, 1, 16),
  rungMat,
  NRUNG * 2,
);
rungs.frustumCulled = false;
leiter.add(rungs);
const RUNG = Array.from({ length: NRUNG }, (_, i) => ({ x: -8.5 + i, d: R() * 0.35 }));
const lPlateTop = hotPlate(leiter, 22, 4);
const lPlateBot = hotPlate(leiter, 22, 4);
lPlateBot.rotation.x = PI;
// water molecules (O red + 2 H white)
const NMOL = 12;
const oMat = real.gloss(0xe8443a, { roughness: 0.2 });
const hMat = real.gloss(0xf4f6f8, { roughness: 0.2 });
const mols = Array.from({ length: NMOL }, (_, i) => {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 16), oMat));
  for (const s of [-1, 1]) {
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.19, 20, 14), hMat);
    h.position.set(s * 0.26, 0.2, 0);
    g.add(h);
  }
  leiter.add(g);
  const target = RUNG[2 + Math.floor((i * 13) / NMOL)];
  return {
    g,
    target,
    from: V((R() - 0.5) * 6, 3 + R() * 4, 9 + R() * 4),
    d: R() * 0.3,
    spin: R() * 6,
  };
});
const waveY = (x, W) => W * Math.sin(x * 0.55 + 0.4);
// bridge state 0 = intact, 1 = broken
function rungBroken(t, d) {
  const b1 = smooth(ramp(t, T.knackt1 + d, T.knackt1 + d + 0.25));
  const fix = smooth(ramp(t, T.rasten - 0.1 + d, T.rasten + 0.15 + d));
  const b2 = smooth(ramp(t, T.knackt2 + 0.1 + d, T.knackt2 + 0.35 + d));
  return Math.max(b1 * (1 - fix), b2);
}
function ladderWave(t) {
  const press = smooth(ramp(t, T.pressen, T.pressen + 0.45));
  const back = smooth(ramp(t, T.knackt2 + 0.3, T.darum - 0.1));
  return 1.3 * (1 - press) + 1.3 * back;
}

// ================================================================ HAAR (one giant hair)
const haar = new THREE.Group();
haar.position.set(...HAAR);
scene.add(haar);
backdrop(haar, 46, 0x3a2438, 0x0d0810);
bokeh(haar, 24, 0xffb890, 9);
const haarLights = lights(haar, [
  [0xfff0e6, 55, [2, 8, 9]],
  [0xffb0a0, 28, [-8, 2, 6]],
  [0xa0c0ff, 28, [8, -3, 6]],
]);
const HR0 = 2.6;
const halves = [-1, 1].map((sx) => {
  const g = new THREE.Group(); // pivot at x = 0
  haar.add(g);
  return { g, sx };
});
const shellBack = real.plastic(0x6a4126, { roughness: 0.45, side: THREE.DoubleSide });
const shellFront = new THREE.MeshPhysicalMaterial({
  color: 0x8a5634,
  roughness: 0.35,
  transparent: true,
  opacity: 0.22,
  side: THREE.DoubleSide,
  depthWrite: false,
});
const scaleMat = real.plastic(0x9a6a44, { roughness: 0.35, clearcoat: 0.5 });
const SCALES = [];
const bubbleMat = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  roughness: 0.04,
  transparent: true,
  opacity: 0.42,
  clearcoat: 1,
  envMapIntensity: 2.4,
  depthWrite: false,
});
const waterMat = new THREE.MeshPhysicalMaterial({
  color: 0x3aa8ff,
  roughness: 0.05,
  clearcoat: 1,
  emissive: 0x0a3a6a,
  emissiveIntensity: 0.4,
});
const WATER = [];
for (const h of halves) {
  const L = 13;
  const back = new THREE.Mesh(
    new THREE.CylinderGeometry(HR0, HR0, L, 64, 1, true, PI / 2, PI),
    shellBack,
  );
  back.rotation.z = PI / 2;
  back.position.x = (h.sx * L) / 2;
  h.g.add(back);
  const front = new THREE.Mesh(
    new THREE.CylinderGeometry(HR0, HR0, L, 64, 1, true, -PI / 2, PI),
    shellFront,
  );
  front.rotation.z = PI / 2;
  front.position.x = (h.sx * L) / 2;
  front.renderOrder = 3;
  front.userData.noAO = true;
  h.g.add(front);
  // the cut face at the break (a disc), only seen when it snaps
  const cap = new THREE.Mesh(
    new THREE.CircleGeometry(HR0, 48),
    real.plastic(0x7a4a2c, { side: THREE.DoubleSide }),
  );
  cap.rotation.y = PI / 2;
  cap.position.x = h.sx * 0.01;
  h.g.add(cap);
  h.cap = cap;
  // cortex fibres
  const fib = real.plastic(0xc89466, { roughness: 0.4 });
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * PI * 2;
    const rr = k === 0 ? 0 : 1.3;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, L, 24), fib);
    m.rotation.z = PI / 2;
    m.position.set(
      (h.sx * L) / 2,
      Math.cos(a) * rr * (k ? 1 : 0),
      Math.sin(a) * rr * (k ? 1 : 0) - 0.3,
    );
    h.g.add(m);
  }
  // cuticle scales: only on the back half + the top / bottom
  const list = [];
  for (let i = 0; i < 20; i++)
    for (let k = 0; k < 18; k++) {
      const th = (k / 18) * PI * 2 + (i % 2) * 0.17;
      if (Math.cos(th) > 0.3) continue; // leave the front open (z+)
      list.push({ x: h.sx * (0.4 + i * 0.64), th, d: R() });
    }
  const im = new THREE.InstancedMesh(roundedBox(0.8, 0.07, 0.62, 0.03, 3), scaleMat, list.length);
  im.frustumCulled = false;
  h.g.add(im);
  SCALES.push({ im, list, sx: h.sx });
  // water beads inside
  const n = 46;
  const wl = [];
  for (let i = 0; i < n; i++) {
    let y, z;
    do {
      y = (R() - 0.5) * 4.2;
      z = (R() - 0.5) * 4.2;
    } while (y * y + z * z > 2.0 * 2.0);
    wl.push({
      x: h.sx * (0.4 + R() * 11.5),
      y,
      z: Math.abs(z) * 0.4 + z * 0.6,
      s: 0.16 + R() * 0.14,
      d: R() * 0.6,
      ph: R() * 6,
    });
  }
  const wim = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 20, 14), waterMat, n);
  wim.frustumCulled = false;
  h.g.add(wim);
  const bim = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 28, 18), bubbleMat, n);
  bim.frustumCulled = false;
  bim.renderOrder = 4;
  bim.userData.noAO = true;
  h.g.add(bim);
  WATER.push({ wim, bim, wl, sx: h.sx });
}
const hPlateTop = hotPlate(haar, 30, 7);
const hPlateBot = hotPlate(haar, 30, 7);
hPlateBot.rotation.x = PI;
// shards when it snaps
const NSH = 26;
const shards = new THREE.InstancedMesh(roundedBox(0.3, 0.08, 0.24, 0.02, 2), scaleMat, NSH);
shards.frustumCulled = false;
haar.add(shards);
const SHARD = Array.from({ length: NSH }, () => ({
  v: V((R() - 0.5) * 3, R() * 3 - 0.5, (R() - 0.3) * 3),
  spin: V(R() * 9, R() * 9, R() * 9),
  y: (R() - 0.5) * 4,
  z: (R() - 0.5) * 4,
}));

// ================================================================ OFEN (the comparison)
const ofen = new THREE.Group();
ofen.position.set(...OFEN);
scene.add(ofen);
backdrop(ofen, 46, 0x3a2a22, 0x0d0907);
bokeh(ofen, 16, 0xffa060, 3);
lights(ofen, [
  [0xfff0e0, 50, [4, 9, 10]],
  [0xff9a50, 40, [0, 2.4, 4]],
]);
const ovenGlow = glow(0xff6a1a, 1.6);
{
  // cabinet + oven front
  const steel = real.metal(0xbfc4c9, { roughness: 0.35 });
  const body = new THREE.Mesh(roundedBox(7.4, 6.6, 4.2, 0.25, 6), steel);
  body.position.set(0, 3.0, -3.3);
  ofen.add(body);
  // door: a black glass frame around the window, the glowing cavity behind
  const doorMat = real.gloss(0x141416);
  for (const [x, y, w, h] of [
    [0, 5.1, 7.4, 2.4],
    [0, 0.4, 7.4, 1.4],
    [-3.15, 2.5, 1.1, 2.8],
    [3.15, 2.5, 1.1, 2.8],
  ]) {
    const m = new THREE.Mesh(roundedBox(w, h, 1.5, 0.12, 4), doorMat);
    m.position.set(x, y, -0.5);
    ofen.add(m);
  }
  const win = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 3.0), ovenGlow);
  win.position.set(0, 2.5, -1.15);
  win.userData.noAO = true;
  ofen.add(win);
  const winGlass = new THREE.Mesh(
    new THREE.PlaneGeometry(5.3, 2.9),
    real.glass(0x553322, { opacity: 0.22 }),
  );
  winGlass.position.set(0, 2.5, 0.22);
  ofen.add(winGlass);
  // glowing heating rods at the top of the cavity
  for (let i = 0; i < 3; i++) {
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 5.0, 12), glow(0xff5a10, 3));
    rod.rotation.z = PI / 2;
    rod.position.set(0, 3.7, -0.9 + i * 0.3);
    ofen.add(rod);
  }
  // pizza inside, seen through the glass
  const pizza = new THREE.Mesh(
    new THREE.CylinderGeometry(1.7, 1.7, 0.12, 48),
    real.plastic(0xe0a050),
  );
  pizza.position.set(0, 1.45, -0.55);
  pizza.rotation.x = 0.35;
  ofen.add(pizza);
  for (let i = 0; i < 9; i++) {
    const s = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.05, 24),
      real.plastic(0xb8321e),
    );
    s.position.set(
      Math.cos(i * 2.3) * (0.4 + (i % 3) * 0.4),
      0.08,
      Math.sin(i * 2.3) * (0.4 + (i % 3) * 0.4),
    );
    pizza.add(s);
  }
  // handle + control strip with the display
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 5.6, 24), steel);
  handle.rotation.z = PI / 2;
  handle.position.set(0, 4.5, 0.55);
  ofen.add(handle);
  const strip = new THREE.Mesh(roundedBox(7.0, 1.1, 0.3, 0.1), real.gloss(0x1a1a1c));
  strip.position.set(0, 5.6, 0.1);
  ofen.add(strip);
  const disp = canvasTex(256, 96, (g) => {
    g.fillStyle = "#060606";
    g.fillRect(0, 0, 256, 96);
    g.fillStyle = "#ff5a2a";
    g.font = "800 70px Montserrat, Arial";
    g.textAlign = "center";
    g.fillText("250°", 128, 74);
  });
  const d = new THREE.Mesh(
    new THREE.PlaneGeometry(1.4, 0.52),
    new THREE.MeshStandardMaterial({
      map: disp,
      emissive: 0xffffff,
      emissiveMap: disp,
      emissiveIntensity: 1.2,
    }),
  );
  d.position.set(0, 5.6, 0.27);
  ofen.add(d);
  for (const x of [-2.6, 2.6]) {
    const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.3, 32), steel);
    knob.rotation.x = PI / 2;
    knob.position.set(x, 5.6, 0.35);
    ofen.add(knob);
  }
  // worktop + tiles behind
  const top = new THREE.Mesh(roundedBox(20, 0.4, 7, 0.1), real.wood(0x3a2a20));
  top.position.set(0, 6.5, -2.4);
  ofen.add(top);
  const tiles = new THREE.Mesh(new THREE.PlaneGeometry(30, 12), real.ceramic(0xe8e2d6));
  tiles.position.set(0, 9, -5.5);
  ofen.add(tiles);
  ofen.traverse((o) => (o.castShadow = o.receiveShadow = true));
}
// heat shimmer above the oven
const NHEAT = 18;
const heatMat2 = new THREE.MeshBasicMaterial({
  color: 0xffa060,
  transparent: true,
  opacity: 0.18,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});
const heatP = new THREE.InstancedMesh(new THREE.SphereGeometry(0.35, 12, 8), heatMat2, NHEAT);
heatP.frustumCulled = false;
heatP.userData.noAO = true;
ofen.add(heatP);

// ================================================================ camera
const applyCamera = shotCamera(shots);
const place = (t) => {
  // which world the current shot looks at (to hide the others)
  let s = shots[0];
  for (const sh of shots) if (t >= sh.at) s = sh;
  const y = s.orbit ? s.orbit.c[1] : s.look[1];
  if (y < -200) return "ofen";
  if (y < -120) return "haar";
  if (y < -40) return "leiter";
  return "vanity";
};

// ================================================================ render
function ironState(t) {
  // returns { mode, y, open }
  if (t < T.stell)
    return { mode: "strand", y: IRON.park, open: 0, steam: 1 - ramp(t, 2.0, 3.4) * 0.6 };
  if (t < T.klemmen) return { mode: "strand", y: IRON.slideFrom, open: 1, steam: 0 };
  if (t < T.ziehen) {
    const c = smooth(ramp(t, T.klemmen, T.klemmen + 0.25));
    return { mode: "strand", y: IRON.slideFrom, open: 1 - c, steam: c * 0.4 };
  }
  if (t < T.folge) {
    const k = smooth(ramp(t, T.ziehen, T.jedes + 0.2));
    const y = lerp(IRON.slideFrom, IRON.slideTo, k);
    const burst = pop(t, T.pfff - 0.05, T.jedes, 0.15);
    const open = smooth(ramp(t, T.jedes + 0.1, T.jedes + 0.4));
    return {
      mode: "strand",
      y: open > 0 ? IRON.slideTo - open * 0.4 : y,
      open,
      steam: 0.35 + burst * 0.9,
      gone: t > T.jedes + 0.4,
    };
  }
  return { mode: "rest", y: 0, open: 0, steam: 0 };
}

function renderAt(t) {
  const where = place(t);
  const vanity = where === "vanity";
  leiter.visible = where === "leiter";
  haar.visible = where === "haar";
  ofen.visible = where === "ofen";

  // ---------------------------------------------------------- iron
  const st = ironState(t);
  iron.visible = vanity && !st.gone;
  if (st.mode === "strand") {
    iron.position.set(0.75, st.y, 0);
    iron.rotation.set(0, 0, 0);
    const a = st.open * 0.28;
    arms[0].rotation.y = -a;
    arms[1].rotation.y = a;
    hand.track(t, [{ t: -1, pos: [1.35, 0.05, -0.05], rot: [0, 0, -PI / 2], pose: "grab" }]);
  } else {
    // resting on the silicone mat, lying flat, display up
    iron.position.set(MAT[0] + 0.3, 0.42, MAT[2]);
    iron.rotation.set(-PI / 2, 0, 0.12);
    arms[0].rotation.y = 0;
    arms[1].rotation.y = 0;
    hand.track(t, [{ t: 999, pos: [0, 0, 0] }]);
  }
  // heat: display climbs on "Rate mal", plates glow on 230
  const climb = ramp(t, T.rate + 0.3, T.grad230);
  const temp = t < T.rate ? 230 : Math.round(lerp(80, 230, smooth(climb)));
  setLcd(`${temp}°`);
  const hot = smooth(ramp(t, T.platten2, T.grad230 + 0.2)) * (1 - ramp(t, T.fast, T.fast + 0.1));
  plateMat.emissiveIntensity =
    hot * 1.6 + (where === "leiter" ? 0.7 : 0) + (where === "haar" ? 0.45 : 0);

  // ---------------------------------------------------------- strand
  strand.mesh.visible = vanity;
  const passY =
    t < T.stell
      ? IRON.park
      : st.mode === "strand" && t >= T.ziehen
        ? st.y
        : t >= T.ziehen
          ? -10
          : 99;
  const frizz = between(t, T.darum, T.folge) ? smooth(ramp(t, T.darum + 0.3, T.regen + 0.6)) : 0;
  const clampY = st.mode === "strand" && st.open < 0.5 && !st.gone ? st.y : -99;
  if (vanity)
    bendStrand(strand, t, {
      curl: (y) =>
        y > passY + 0.4 ? 0.07 : y > passY - 0.4 ? lerp(1, 0.07, (y - passY + 0.4) / 0.8) : 1,
      pinch: (y) => clamp01(1 - Math.abs(y - clampY) / 0.35),
      frizz,
    });
  const wet = t < T.jedes ? 1 : 0;
  hairMat.color.copy(hairDry).lerp(hairWet, wet);
  hairMat.roughness = wet ? 0.22 : 0.4;
  curly.mesh.visible = vanity && t >= T.team - 0.05;
  if (curly.mesh.visible)
    bendStrand(curly, t, { curl: () => 1, pinch: () => 0, k: 2.3, amp: 0.42 });

  // drops on the strand (wet until the iron passes / the jump to the ladder)
  drops.visible = vanity && t < T.jedes;
  if (drops.visible) {
    DROPS.forEach((d, i) => {
      const h = strand.hairs[d.hair];
      let y = d.y;
      if (d.fall >= 0) y -= ((t * 1.3 + d.fall) % 5) * 1.1;
      const gone = y > passY - 0.3 || y < STRAND_END;
      const c = y > passY + 0.4 ? 0.07 : 1;
      const x = h.bx + c * 0.38 * Math.sin(y * 1.25 + h.ph);
      const z = h.bz + c * 0.38 * 0.6 * Math.cos(y * 1.25 * 0.9 + h.ph2) + 0.03;
      _s.setScalar(gone ? 0.0001 : d.s);
      _s.y *= 1.3;
      drops.setMatrixAt(i, _m.compose(_p.set(x, y, z), _q.identity(), _s));
    });
    drops.instanceMatrix.needsUpdate = true;
  }

  // steam out of the plates
  const steamOn = vanity && st.mode === "strand" && st.steam > 0.02;
  STEAM.forEach((p) => {
    p.sp.visible = steamOn;
    if (!steamOn) return;
    const k = (t * p.sp2 * 0.9 + p.ph) % 1;
    const big = st.steam;
    p.sp.position.set(
      p.x * (1 + k * 0.6),
      st.y + 0.15 + k * (0.8 + p.up * 1.4) * (0.6 + big * 0.6),
      p.side * (0.3 + k * (0.4 + big * 0.9)),
    );
    p.sp.scale.setScalar((0.35 + k * 1.6) * p.s * (0.6 + big * 0.6));
    p.sp.material.opacity = Math.min(0.9, Math.sin(k * PI) * (0.45 + big * 0.5));
  });

  // ---------------------------------------------------------- chocolate bar on one hair
  const barOn = vanity && t >= T.fakt;
  bar.visible = barHair.visible = barOn;
  if (barOn) {
    const drop = smooth(ramp(t, T.fakt, T.fakt + 0.5));
    const bounce =
      Math.exp(-Math.max(0, t - T.fakt - 0.5) * 3) *
      Math.sin(Math.max(0, t - T.fakt - 0.5) * 14) *
      0.25;
    const by = lerp(9, 3.9, drop) - bounce;
    const sw = Math.sin(t * 1.7) * 0.06;
    bar.position.set(BAR[0] + Math.sin(sw) * 0.4, by, BAR[2]);
    bar.rotation.set(0, 0.35 + Math.sin(t * 0.9) * 0.15, sw);
    const topY = 22;
    const y0 = by + 0.55;
    barHair.position.set(BAR[0] + Math.sin(sw) * 0.2, (topY + y0) / 2, BAR[2]);
    barHair.scale.set(1, topY - y0, 1);
  }

  // ---------------------------------------------------------- LEITER
  if (leiter.visible) {
    const W = ladderWave(t);
    const appear = squash(t, T.jedes + 0.05);
    leiter.scale.copy(appear);
    const heat =
      smooth(ramp(t, T.hitze, T.knackt1 + 0.3)) *
      (1 - smooth(ramp(t, T.abgekuehlt, T.abgekuehlt + 0.5)));
    const cool = pop(t, T.abgekuehlt, T.nur, 0.3);
    beadMat.emissive.setHex(cool > 0 && heat < 0.1 ? 0x2a7aff : 0xff3a10);
    beadMat.emissiveIntensity = heat * 0.9 + cool * 0.5;
    for (let c = 0; c < 2; c++)
      for (let i = 0; i < NB; i++) {
        const x = -9.7 + i * 0.45;
        const y = (c ? -0.7 : 0.7) + waveY(x, W);
        const jit = heat * 0.04 * Math.sin(t * 40 + i * 3 + c);
        beads.setMatrixAt(
          c * NB + i,
          _m.compose(_p.set(x + jit, y + jit, 0), _q.identity(), _s.setScalar(1)),
        );
      }
    beads.instanceMatrix.needsUpdate = true;
    RUNG.forEach((r, i) => {
      const b = rungBroken(t, r.d);
      const yc = waveY(r.x, W);
      for (const s of [1, -1]) {
        // each half grows from its chain towards the middle; broken = short + tilted
        const len = lerp(0.72, 0.24, b);
        const tilt = b * 0.6 * s * (i % 2 ? 1 : -1);
        const y0 = yc + s * 0.7;
        _q.setFromEuler(new THREE.Euler(0, 0, tilt));
        const dir = V(0, -s, 0).applyQuaternion(_q);
        _p.set(r.x, y0, 0).addScaledVector(dir, len / 2 + 0.05);
        _s.set(1, len, 1);
        rungs.setMatrixAt(i * 2 + (s > 0 ? 0 : 1), _m.compose(_p, _q, _s));
      }
    });
    rungs.instanceMatrix.needsUpdate = true;
    rungMat.emissiveIntensity = 0.45 + pop(t, T.rasten, T.nur, 0.2) * 0.6;
    // plates press it straight
    const pin =
      smooth(ramp(t, T.platten1, T.pressen + 0.25)) *
      (1 - smooth(ramp(t, T.abgekuehlt, T.abgekuehlt + 0.45)));
    lPlateTop.visible = lPlateBot.visible = pin > 0.001;
    lPlateTop.position.set(0, lerp(9, 1.6, pin), 0);
    lPlateBot.position.set(0, -lerp(9, 1.6, pin), 0);
    // water molecules fly in and wedge into the bridges
    mols.forEach((m) => {
      const k = smooth(ramp(t, T.wasser1 + m.d, T.knackt2 + 0.15 + m.d));
      m.g.visible = t >= T.wasser1 + m.d;
      const tx = m.target.x;
      const ty = waveY(tx, W);
      m.g.position.set(
        lerp(m.from.x + tx, tx + 0.15, k),
        lerp(m.from.y, ty, k),
        lerp(m.from.z, 0.25, k),
      );
      m.g.rotation.set(t * 2 + m.spin, t * 3 + m.spin, 0);
    });
  }

  // ---------------------------------------------------------- HAAR
  if (haar.visible) {
    // teaser (von innen) shows it already boiling, then the real story
    const teaser = between(t, T.und, T.stell);
    const water = teaser ? 1 : smooth(ramp(t, T.dein2 + 0.1, T.schwamm));
    const boil = teaser ? 0.55 : smooth(ramp(t, T.mitten, T.zischen));
    const plates = teaser ? 1 : smooth(ramp(t, T.das, T.kocht2 + 0.2));
    hPlateTop.visible = hPlateBot.visible = plates > 0.001;
    hPlateTop.position.set(0, lerp(10, HR0 + 0.75, plates), 0);
    hPlateBot.position.set(0, -lerp(10, HR0 + 0.75, plates), 0);
    haarLights[1].color.setHex(plates > 0.5 ? 0xff7a40 : 0xffb0a0);
    const swell = boil;
    const snap = smooth(ramp(t, T.bricht, T.bricht + 0.35));
    halves.forEach((h) => {
      h.cap.visible = snap > 0.001;
      h.g.rotation.z = -h.sx * snap * 0.32;
      h.g.position.set(h.sx * snap * 0.5, -snap * 0.8, 0);
    });
    SCALES.forEach(({ im, list }) => {
      list.forEach((sc, i) => {
        const lift = swell * (0.25 + sc.d * 0.4) + water * 0.08;
        const rr = HR0 + 0.04 + swell * 0.25 * (0.5 + 0.5 * Math.sin(sc.x * 1.7 + sc.th * 3));
        const n = V(0, Math.sin(sc.th), Math.cos(sc.th));
        _q.setFromUnitVectors(V(0, 1, 0), n);
        const tq = new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1).applyQuaternion(_q), 0);
        _q.multiply(new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), -lift));
        _p.set(sc.x, n.y * rr, n.z * rr);
        im.setMatrixAt(i, _m.compose(_p, _q.multiply(tq), _s.set(1, 1, 1)));
      });
      im.instanceMatrix.needsUpdate = true;
    });
    WATER.forEach(({ wim, bim, wl }) => {
      wl.forEach((w, i) => {
        const on = smooth(ramp(water, w.d * 0.6, w.d * 0.6 + 0.4));
        const b = clamp01(boil * 1.6 - w.d * 0.5);
        const jig = (plates * 0.04 + b * 0.05) * Math.sin(t * 30 + w.ph);
        _p.set(w.x + jig, w.y + Math.sin(t * 1.2 + w.ph) * 0.05, w.z + jig);
        wim.setMatrixAt(
          i,
          _m.compose(_p, _q.identity(), _s.setScalar(Math.max(0.0001, w.s * on * (1 - b)))),
        );
        const bs = b > 0 ? lerp(w.s * 1.2, w.s * 3.6, b) : 0.0001;
        bim.setMatrixAt(i, _m.compose(_p, _q.identity(), _s.setScalar(bs)));
      });
      wim.instanceMatrix.needsUpdate = true;
      bim.instanceMatrix.needsUpdate = true;
    });
    waterMat.emissiveIntensity = 0.4 + plates * 0.5 * (0.5 + 0.5 * Math.sin(t * 9));
    shards.visible = t >= T.bricht;
    if (shards.visible) {
      const k = t - T.bricht;
      SHARD.forEach((s, i) => {
        _p.set(s.v.x * k, s.y + s.v.y * k - 2.5 * k * k, s.z + s.v.z * k);
        _q.setFromEuler(new THREE.Euler(s.spin.x * k, s.spin.y * k, s.spin.z * k));
        shards.setMatrixAt(i, _m.compose(_p, _q, _s.setScalar(1)));
      });
      shards.instanceMatrix.needsUpdate = true;
    }
  }

  // ---------------------------------------------------------- OFEN
  if (ofen.visible) {
    ovenGlow.emissiveIntensity = 1.5 + Math.sin(t * 6) * 0.15;
    for (let i = 0; i < NHEAT; i++) {
      const k = (t * 0.5 + i / NHEAT) % 1;
      _p.set(Math.sin(i * 2.7) * 3, 6.8 + k * 4, Math.cos(i * 1.9) * 1.2 - 1.5);
      heatP.setMatrixAt(i, _m.compose(_p, _q.identity(), _s.setScalar(Math.sin(k * PI) * 1.2)));
    }
    heatP.instanceMatrix.needsUpdate = true;
  }

  // ---------------------------------------------------------- HUD + panels
  // Rate mal: the iron's temperature climbs (big counter)
  const climbK = pop(t, T.rate + 0.2, T.fast, 0.25);
  counter("temp", climbK, {
    label: "Platten",
    value: `${temp} °C`,
    x: 80,
    y: 360,
    color: temp >= 230 ? "#ff4b2b" : "#ffd23f",
  });
  // comparison at the oven
  readout("ofen", pop(t, T.fast + 0.15, T.dein2, 0.25), {
    label: "Backofen max.",
    value: 250,
    unit: "°C",
    x: 80,
    y: 1250,
    color: "#ff7a3a",
  });
  readout("eisen", pop(t, T.fast + 0.45, T.dein2, 0.25), {
    label: "Glätteisen",
    value: 230,
    unit: "°C",
    x: 80,
    y: 1450,
    color: "#ff4b2b",
  });
  if (between(t, T.kocht2, T.mitten + 0.6))
    showPanel(pop(t, T.kocht2, T.mitten + 0.6), "WASSER KOCHT", "100 °C", LED.blue);
  else if (between(t, T.einziges, T.team))
    showPanel(pop(t, T.einziges, T.team), "EIN HAAR HÄLT", "100 g", LED.yellow);
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
