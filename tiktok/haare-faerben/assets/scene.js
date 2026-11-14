// #86 Haare färben — one giant hair in a scalp forest. Its cuticle scales
// sit closed like a pine cone, dye beads off; ammonia swells the hair and
// the scales open; tiny colourless particles slip in; peroxide hooks them
// into long chains that turn brown / red / pink — too big to get out. The
// scales close: the colour is trapped, like a ship in a bottle.
import {
  THREE,
  ramp,
  smooth,
  lerp,
  pop,
  V,
  scene,
  real,
  rng,
  xrayMaterial,
  setXray,
  showNope,
  showPanel,
  LED,
  labels,
  highlights,
  shotCamera,
  renderFrame,
  start,
  roundedBox,
  LOOK,
} from "./world.js";
import { forest } from "./set.js";
import { T, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);
LOOK.exposure = 1.25;

const R = 0.55; // hair radius
const BROWN = new THREE.Color(0x6e4428);
const DYED = new THREE.Color(0x9e1d4c);
const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const tmpE = new THREE.Euler();
const tmpS = new THREE.Vector3();
const tmpP = new THREE.Vector3();

// ---------------------------------------------------------------- the hero hair
const hairG = new THREE.Group();
scene.add(hairG);
const coreMat = xrayMaterial(0x2e1a10, { roughness: 0.4 });
const core = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.96, R * 0.96, 12, 64, 1), coreMat);
core.position.y = 5.7;
core.castShadow = true;
hairG.add(core);
// follicle mound at the root
{
  const mound = new THREE.Mesh(
    new THREE.SphereGeometry(R * 2.3, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    real.skin(0xc98a70),
  );
  mound.scale.y = 0.3;
  mound.receiveShadow = true;
  scene.add(mound);
}
// cuticle scales: overlapping curved plates, hinged at the lower edge, free
// edge pointing to the tip — they tilt open like a pine cone
const ROWS = 34;
const AROUND = 14;
const SC_H = 0.44;
const scaleMat = xrayMaterial(0x6e4428, { roughness: 0.22, metalness: 0.1 });
const scaleGeo = new THREE.CylinderGeometry(
  R,
  R,
  SC_H,
  10,
  1,
  true,
  -((Math.PI * 2) / AROUND) * 0.66,
  ((Math.PI * 2) / AROUND) * 1.32,
);
scaleGeo.translate(0, SC_H / 2, -R);
const scales = new THREE.InstancedMesh(scaleGeo, scaleMat, ROWS * AROUND);
scales.castShadow = true;
scales.receiveShadow = true;
hairG.add(scales);
const scaleSeed = [];
{
  const r = rng(860);
  for (let i = 0; i < ROWS * AROUND; i++) scaleSeed.push(r());
}
function placeScales(swell, open) {
  let i = 0;
  for (let row = 0; row < ROWS; row++) {
    const y = -0.1 + row * 0.27;
    for (let k = 0; k < AROUND; k++) {
      const a = ((k + (row % 2) * 0.5) / AROUND) * Math.PI * 2;
      const s = scaleSeed[i];
      const tilt = 0.11 + open * (0.75 + s * 0.35);
      const rr = R * swell * 1.0;
      tmpP.set(Math.sin(a) * rr, y, Math.cos(a) * rr);
      tmpE.set(tilt, a, 0, "YXZ");
      tmpQ.setFromEuler(tmpE);
      tmpS.set(swell, 1, swell);
      tmpM.compose(tmpP, tmpQ, tmpS);
      scales.setMatrixAt(i++, tmpM);
    }
  }
  scales.instanceMatrix.needsUpdate = true;
}

// ---------------------------------------------------------------- hook: the dye brush
const brush = new THREE.Group();
scene.add(brush);
{
  const black = real.plastic(0x1d1b20, { roughness: 0.35 });
  const head = new THREE.Mesh(roundedBox(0.95, 0.22, 0.42, 0.06), black);
  brush.add(head);
  const bristles = new THREE.Mesh(roundedBox(0.88, 0.32, 0.36, 0.05), real.fabric(0x2b2b30));
  bristles.position.y = -0.24;
  brush.add(bristles);
  const tips = new THREE.Mesh(roundedBox(0.9, 0.12, 0.38, 0.05), real.gloss(0x8a1f50));
  tips.position.y = -0.42;
  brush.add(tips);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 6, 24), black);
  handle.rotation.z = -0.9;
  handle.position.set(2.4, 1.75, 0);
  brush.add(handle);
}

// dye blobs: painted on, then they bead off the closed scales
const dyeMat = real.gloss(0x8e1f52);
const BLOBS = 10;
const blobs = [];
{
  const r = rng(861);
  const geo = new THREE.SphereGeometry(1, 32, 16);
  for (let i = 0; i < BLOBS; i++) {
    const m = new THREE.Mesh(geo, dyeMat);
    m.castShadow = true;
    scene.add(m);
    blobs.push({ m, a: 0.15 + r() * 1.1, y: 1.5 + r() * 0.9, s: 0.07 + r() * 0.07, d: r() });
  }
}
// a blob sits on the surface from t0, slides down a bit, then rolls off outward
function blob(b, t, t0, fallFrom) {
  const dt = t - t0;
  if (dt < (fallFrom ? -0.45 : 0) || dt > 1.6) return false;
  const out = V(Math.sin(b.a), 0, Math.cos(b.a));
  let y = b.y;
  let rr = R + b.s * 0.7;
  if (dt < 0) {
    // falling onto the hair from above
    y = b.y + ((dt * dt) / 0.2) * 1.8;
  } else {
    const slide = Math.min(dt, 0.35);
    y -= slide * 0.5;
    if (dt > 0.35) {
      const f = dt - 0.35;
      rr += f * (1.2 + b.d);
      y -= 4.9 * f * f;
    }
  }
  b.m.position.set(out.x * rr, y, out.z * rr);
  const wob = dt > 0 && dt < 0.4 ? 1 + Math.sin(dt * 40) * 0.12 * (1 - dt / 0.4) : 1;
  b.m.scale.set(b.s * wob, b.s / wob, b.s * wob);
  return y > -0.3;
}

// ---------------------------------------------------------------- ammonia cloud
const ammoMat = new THREE.MeshStandardMaterial({
  color: 0xdfeec0,
  roughness: 1,
  transparent: true,
  opacity: 0,
  depthWrite: false,
});
const puffs = [];
{
  const r = rng(862);
  const geo = new THREE.IcosahedronGeometry(1, 3);
  for (let i = 0; i < 16; i++) {
    const m = new THREE.Mesh(geo, ammoMat);
    scene.add(m);
    puffs.push({
      m,
      a: 1.2 + r() * 3.9,
      d: 1.0 + r() * 1.4,
      y: 0.25 + r() * 1.0,
      s: 0.22 + r() * 0.28,
      p: r(),
    });
  }
}

// ---------------------------------------------------------------- dye particles → chains
const N = 96; // 16 chains × 6
const beadMat = new THREE.MeshStandardMaterial({ roughness: 0.25, emissive: 0x332222 });
const beads = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 20, 12), beadMat, N);
beads.frustumCulled = false;
hairG.add(beads);
const CHAIN_COLORS = [
  new THREE.Color(0x6b3a1e),
  new THREE.Color(0xd8202c),
  new THREE.Color(0xff3fa4),
];
const CLEAR = new THREE.Color(0xf4fbff);
const B = [];
{
  const r = rng(863);
  const chains = [];
  for (let c = 0; c < 16; c++) {
    const a = r() * Math.PI * 2;
    const d = 0.08 + r() * 0.24;
    chains.push({
      c: V(Math.sin(a) * d, 1.35 + r() * 1.5, Math.cos(a) * d),
      dir: V((r() - 0.5) * 0.7, 1, (r() - 0.5) * 0.7).normalize(),
      wig: r() * 6,
    });
  }
  for (let i = 0; i < N; i++) {
    const c = Math.floor(i / 6);
    const j = i % 6;
    const ch = chains[c];
    const chainPos = ch.c
      .clone()
      .addScaledVector(ch.dir, (j - 2.5) * 0.085)
      .add(V(Math.sin(ch.wig + j) * 0.018, 0, Math.cos(ch.wig + j) * 0.018));
    const a = r() * Math.PI * 2;
    const din = r() * 0.38;
    const yin = 1.3 + r() * 1.7;
    const inPos = V(Math.sin(a) * din, yin, Math.cos(a) * din);
    const dout = 1.5 + r() * 0.9;
    const outPos = V(Math.sin(a) * dout, yin + (r() - 0.5) * 0.6, Math.cos(a) * dout);
    B.push({ c, chainPos, inPos, outPos, delay: r() * 2.0, ph: r() * 6 });
  }
}
const colTmp = new THREE.Color();
function placeBeads(t) {
  for (let i = 0; i < N; i++) {
    const b = B[i];
    const kIn = smooth(ramp(t, T.farblos + b.delay, T.farblos + b.delay + 1.5));
    const kCh = smooth(ramp(t, T.hakt + b.c * 0.06, T.hakt + 0.9 + b.c * 0.06));
    if (t < T.farblos + b.delay - 0.01) {
      tmpS.setScalar(0.0001);
      tmpP.set(0, -5, 0);
    } else {
      tmpP.copy(b.outPos).lerp(b.inPos, kIn).lerp(b.chainPos, kCh);
      // drifting while loose
      const loose = 1 - kCh;
      tmpP.x += Math.sin(t * 2.3 + b.ph) * 0.02 * loose;
      tmpP.y += Math.cos(t * 1.9 + b.ph) * 0.02 * loose;
      tmpS.setScalar(lerp(0.028, 0.042, kCh));
    }
    tmpQ.identity();
    tmpM.compose(tmpP, tmpQ, tmpS);
    beads.setMatrixAt(i, tmpM);
    const which = b.c % 3;
    const at = [T.braun, T.rot, T.pink][which];
    colTmp.copy(CLEAR).lerp(CHAIN_COLORS[which], smooth(ramp(t, at, at + 0.4)));
    beads.setColorAt(i, colTmp);
  }
  beads.instanceMatrix.needsUpdate = true;
  beads.instanceColor.needsUpdate = true;
}

// ---------------------------------------------------------------- peroxide bubbles
const bubMat = real.glass(0xffffff, { opacity: 0.55 });
const bubbles = [];
{
  const r = rng(864);
  const geo = new THREE.SphereGeometry(1, 20, 12);
  for (let i = 0; i < 40; i++) {
    const m = new THREE.Mesh(geo, bubMat);
    hairG.add(m);
    const a = r() * Math.PI * 2;
    bubbles.push({
      m,
      a,
      d: r() * 0.8,
      y0: 1.2 + r() * 1.2,
      sp: 0.4 + r() * 0.6,
      s: 0.02 + r() * 0.035,
      p: r(),
    });
  }
}

// ---------------------------------------------------------------- analogy: pine cone
const coneG = new THREE.Group();
coneG.position.set(4.8, 0, 2.6);
coneG.scale.setScalar(1.45);
scene.add(coneG);
const CONE_ROWS = 16;
const CONE_N = 9;
const coneScales = new THREE.InstancedMesh(
  roundedBox(0.34, 0.06, 0.3, 0.025).translate(0, 0, 0.15),
  real.wood(0x8a5a34, { roughness: 0.75 }),
  CONE_ROWS * CONE_N,
);
coneScales.castShadow = true;
coneG.add(coneScales);
{
  const axis = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 1.9, 16), real.wood(0x5e3a20));
  axis.position.y = 0.95;
  coneG.add(axis);
}
function placeCone(open) {
  let i = 0;
  for (let row = 0; row < CONE_ROWS; row++) {
    const h = row / (CONE_ROWS - 1);
    const y = 0.15 + h * 1.65;
    const prof = 0.05 + 0.32 * Math.pow(Math.sin(Math.PI * (0.15 + h * 0.8)), 0.8);
    for (let k = 0; k < CONE_N; k++) {
      const a = ((k + row * 0.5) / CONE_N) * Math.PI * 2;
      tmpP.set(Math.sin(a) * 0.1, y, Math.cos(a) * 0.1);
      tmpE.set(lerp(-1.05, -0.2, open), a, 0, "YXZ");
      tmpQ.setFromEuler(tmpE);
      tmpS.set(prof * 2.6, 1, prof * 2.8);
      tmpM.compose(tmpP, tmpQ, tmpS);
      coneScales.setMatrixAt(i++, tmpM);
    }
  }
  coneScales.instanceMatrix.needsUpdate = true;
}

// ---------------------------------------------------------------- analogy: ship in a bottle
const shipSet = new THREE.Group();
shipSet.position.set(-4.8, 0, 2.6);
scene.add(shipSet);
const mastG = new THREE.Group();
{
  const pts = [];
  const prof = [
    [0.0, -1.2],
    [0.5, -1.18],
    [0.55, -1.05],
    [0.55, 0.45],
    [0.4, 0.75],
    [0.18, 0.95],
    [0.18, 1.35],
    [0.21, 1.4],
  ];
  for (const [r, y] of prof) pts.push(new THREE.Vector2(r, y));
  const bottle = new THREE.Mesh(
    new THREE.LatheGeometry(pts, 64),
    real.glass(0xd6f0e6, { opacity: 0.22 }),
  );
  bottle.rotation.z = -Math.PI / 2;
  bottle.position.y = 0.62;
  shipSet.add(bottle);
  const cork = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.3, 24), real.wood(0xb98a56));
  cork.rotation.z = -Math.PI / 2;
  cork.position.set(1.5, 0.62, 0);
  shipSet.add(cork);
  const stand = real.wood(0x6a4128);
  for (const x of [-0.7, 0.5]) {
    const s = new THREE.Mesh(roundedBox(0.22, 0.12, 0.9, 0.03), stand);
    s.position.set(x, 0.06, 0);
    shipSet.add(s);
  }
  const hull = new THREE.Mesh(roundedBox(1.25, 0.2, 0.36, 0.08), real.wood(0x7a3f22));
  hull.position.set(-0.15, 0.3, 0);
  shipSet.add(hull);
  // masts + sails, hinged at the deck (raised inside the bottle)
  mastG.position.set(-0.15, 0.4, 0);
  shipSet.add(mastG);
  const sailMat = real.fabric(0xf6efe2, { side: THREE.DoubleSide });
  for (const [x, h] of [
    [-0.32, 0.6],
    [0.25, 0.72],
  ]) {
    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, h, 12),
      real.wood(0x4a2c18),
    );
    mast.position.set(x, h / 2, 0);
    mastG.add(mast);
    const sail = new THREE.Mesh(new THREE.PlaneGeometry(0.34, h * 0.62), sailMat);
    sail.position.set(x, h * 0.55, 0.01);
    sail.rotation.y = Math.PI / 2;
    mastG.add(sail);
  }
  const flag = new THREE.Mesh(
    new THREE.PlaneGeometry(0.12, 0.07),
    real.fabric(0x9e1d4c, { side: THREE.DoubleSide }),
  );
  flag.position.set(0.31, 0.74, 0);
  flag.rotation.y = Math.PI / 2;
  mastG.add(flag);
}

const applyCamera = shotCamera(shots);

// ---------------------------------------------------------------- render
function renderAt(t) {
  // hook brush: sweeps across the hair front, then leaves
  const sweep = smooth(ramp(t, -0.2, 0.9));
  const away = smooth(ramp(t, T.haar1 - 0.1, T.haar1 + 0.3));
  brush.visible = away < 1;
  brush.position.set(
    lerp(1.5, -0.3, sweep) + away * 2,
    lerp(2.5, 2.0, sweep) + away * 2.5,
    R + 0.52,
  );
  brush.rotation.set(0.25, 0, -0.15 + sweep * 0.25);

  // dye blobs: painted on in the hook, falling and bouncing off at "keine"
  for (let i = 0; i < BLOBS; i++) {
    const b = blobs[i];
    let on = blob(b, t, 0.28 + i * 0.07, false);
    if (!on) on = blob(b, t, T.keine + i * 0.06, true);
    b.m.visible = on;
  }
  showNope(pop(t, T.keine + 0.5, T.stinkt), 0.9, 2.5, 0.6, 0.6);

  // swell + scales opening ("bricht ein" teaser flick, then for real)
  const teaser = Math.sin(Math.PI * ramp(t, T.bricht, T.bricht + 0.6)) * 0.55;
  const swell =
    1 +
    0.18 *
      smooth(ramp(t, T.aufquellen, T.aufquellen + 0.9)) *
      (1 - smooth(ramp(t, T.klein, T.gefangen + 0.3)));
  const open =
    smooth(ramp(t, T.klappen, T.klappen + 0.5)) *
    (1 - smooth(ramp(t, T.klein + 0.2, T.gefangen + 0.1)));
  placeScales(swell, Math.max(teaser, open));
  core.scale.set(swell, 1, swell);

  // hair colour: natural brown → dyed after the payoff
  const dyed = smooth(ramp(t, T.gefangen, T.gefangen + 1.2));
  coreMat.userData.base
    .copy(BROWN)
    .multiplyScalar(0.8)
    .lerp(DYED.clone().multiplyScalar(0.75), dyed);
  scaleMat.userData.base.copy(BROWN).lerp(DYED, dyed);

  // x-ray while the inside is explained
  const xr =
    smooth(ramp(t, T.verrueckte, T.verrueckte + 0.5)) *
    (1 - smooth(ramp(t, T.gefangen, T.gefangen + 0.6)));
  setXray([coreMat, scaleMat], xr);

  // ammonia cloud
  const ammo = pop(t, T.stinkt, T.verrueckte, 0.6);
  ammoMat.opacity = 0.34 * ammo;
  for (const p of puffs) {
    p.m.visible = ammo > 0.01;
    const roll = ramp(t, T.stinkt, T.verrueckte);
    const a = p.a + roll * 0.9;
    const d = p.d + (1 - roll) * 1.6;
    p.m.position.set(Math.sin(a) * d, p.y + Math.sin(t * 1.3 + p.p * 6) * 0.08, Math.cos(a) * d);
    p.m.scale.setScalar(p.s * (0.6 + 0.6 * smooth(ramp(t, T.stinkt, T.stinkt + 1.2))));
  }

  // particles + chains
  beads.visible = t >= T.farblos - 0.1 && t < T.uebrigens;
  if (beads.visible) placeBeads(t);

  // peroxide bubbles
  const fizz = pop(t, T.peroxid, T.erst, 0.4);
  for (const b of bubbles) {
    b.m.visible = fizz > 0.01;
    const f = ((t - T.peroxid) * b.sp + b.p) % 1;
    b.m.position.set(Math.sin(b.a) * b.d, b.y0 + f * 1.6, Math.cos(b.a) * b.d);
    b.m.scale.setScalar(b.s * fizz * (0.6 + f * 0.6));
  }

  // pine cone opens with the hair
  placeCone(smooth(ramp(t, T.klappen, T.klappen + 0.8)));
  coneG.visible = t > T.stell;

  // ship: masts lie flat until "Schiff", then are pulled up inside the bottle
  mastG.rotation.z = lerp(1.35, 0, smooth(ramp(t, T.schiff + 0.2, T.schiff + 0.9)));

  // the colour wave through the forest
  for (const f of forest) {
    const d = Math.hypot(f.x, f.z);
    const k = smooth(ramp(t, T.uebrigens + d * 0.07, T.uebrigens + d * 0.07 + 0.6));
    const target = CHAIN_COLORS[(f.seed % 2) + 1];
    f.mat.color.copy(f.base).lerp(target.clone().multiplyScalar(0.75), k);
  }

  // LED fact for "Übrigens"
  if (t >= T.uebrigens && t < T.welche)
    showPanel(pop(t, T.heute, T.welche), "SEIT", "1907", LED.yellow);
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
