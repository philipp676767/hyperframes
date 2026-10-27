// #38 Knicklicht — "In deinem Knicklicht steckt Glas." The glow stick in a
// Halloween yard at night: two hands snap it, the inner glass vial breaks,
// two liquids run together, neon floods the yard. Then down into the liquid
// (MICRO): hydrogen peroxide + oil build a tiny molecule full of energy like
// a tense spring, it bursts into CO2 — and the energy jumps into the dye,
// which spits it out as light. Side sets in the yard: a cola glass, a hot
// light bulb, a fridge with the freezer, a firefly with a glowing behind.
import {
  THREE,
  ramp,
  smooth,
  easeInOut,
  inBack,
  pop,
  lerp,
  clamp01,
  V,
  scene,
  flat,
  M as MAT,
  showNope,
  makeArrowSet,
  animateArrows,
  showPanel,
  LED,
  labels,
  squash,
  puff,
  highlights,
  shotCamera,
  renderFrame,
  start,
  rng,
} from "./world.js";
import { setPartyLights, setPumpkins } from "./set.js";
import { fireflies } from "./environments.js";
import { createHand } from "./hand.js";
import { gauge } from "./hud.js";
import {
  T,
  HIT,
  shots,
  LABELS,
  HIGHLIGHTS,
  MICRO,
  PIVOT,
  COLA,
  BULB,
  FRIDGE,
  FLY,
  HP0,
  OIL0,
  CO2A,
} from "./beats.js";

highlights(HIGHLIGHTS);
const Z = V(0, 0, 1);
const GREEN = 0x39ff6a;
const PINK = 0xff4fd8;
const BLUE = 0x3fa9ff;

// ---------------------------------------------------------------- the glow stick
// Upright, pivot (the bend point) at its middle. Two halves rotate apart
// when it is bent. Translucent tube → oily liquid → thin glass vial with
// hydrogen peroxide inside. Shards appear where the vial snaps.
const L = 2.4;
const R = 0.15;
function makeStick(color, { light = true, scale = 1 } = {}) {
  const g = new THREE.Group();
  g.scale.setScalar(scale);
  const c = new THREE.Color(color);
  const lower = new THREE.Group();
  const upper = new THREE.Group();
  g.add(lower, upper);
  const tubeMat = new THREE.MeshStandardMaterial({
    color: 0xeef7f0,
    transparent: true,
    opacity: 0.4,
    roughness: 0.12,
    metalness: 0,
    emissive: color,
    emissiveIntensity: 0,
    depthWrite: false,
  });
  const liquidMat = new THREE.MeshStandardMaterial({
    color: 0xf1eec2,
    transparent: true,
    opacity: 0.85,
    roughness: 0.3,
    emissive: color,
    emissiveIntensity: 0,
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xe4f6ff,
    transparent: true,
    opacity: 0.55,
    roughness: 0.04,
    metalness: 0.1,
    emissive: 0x9fdcff,
    emissiveIntensity: 0.08,
    depthWrite: false,
  });
  const peroxMat = new THREE.MeshStandardMaterial({
    color: 0x8fd0ff,
    transparent: true,
    opacity: 0.8,
    roughness: 0.2,
    emissive: 0x3f8fff,
    emissiveIntensity: 0.15,
  });
  const capMat = flat(c.clone().multiplyScalar(0.55), { roughness: 0.4 });
  const half = (grp, dir) => {
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(R, R, L / 2, 24, 4, true), tubeMat);
    tube.position.y = (dir * L) / 4;
    tube.renderOrder = 3;
    grp.add(tube);
    const liq = new THREE.Mesh(
      new THREE.CylinderGeometry(R * 0.86, R * 0.86, L / 2 - 0.02, 18),
      liquidMat,
    );
    liq.position.y = (dir * L) / 4;
    liq.renderOrder = 1;
    grp.add(liq);
    const vial = new THREE.Group();
    vial.position.y = dir * 0.03;
    grp.add(vial);
    const vl = 1.04;
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, vl, 14), glassMat);
    glass.position.y = (dir * vl) / 2;
    glass.renderOrder = 2;
    vial.add(glass);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8), glassMat);
    tip.position.y = dir * vl;
    vial.add(tip);
    const per = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, vl - 0.04, 12), peroxMat);
    per.position.y = (dir * vl) / 2;
    per.renderOrder = 1;
    vial.add(per);
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(
        R * 1.04,
        20,
        8,
        0,
        Math.PI * 2,
        dir > 0 ? 0 : Math.PI / 2,
        Math.PI / 2,
      ),
      capMat,
    );
    cap.position.y = (dir * L) / 2;
    cap.castShadow = true;
    grp.add(cap);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.06, R * 1.06, 0.07, 20), capMat);
    band.position.y = dir * (L / 2 - 0.02);
    grp.add(band);
    if (dir > 0) {
      const loop = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.018, 6, 16), capMat);
      loop.position.y = L / 2 + R + 0.06;
      grp.add(loop);
    }
    return vial;
  };
  const vLow = half(lower, -1);
  const vUp = half(upper, 1);
  // shards of the vial around the break
  const NS = 26;
  const shardMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.85,
    roughness: 0.05,
    emissive: 0xbfeaff,
    emissiveIntensity: 0.35,
  });
  const shards = new THREE.InstancedMesh(new THREE.TetrahedronGeometry(0.028, 0), shardMat, NS);
  shards.frustumCulled = false;
  shards.userData.noAO = true;
  g.add(shards);
  const sr = rng(color % 997);
  const sd = Array.from({ length: NS }, () => [sr() * 6.28, sr(), sr() - 0.5, sr(), sr()]);
  // the mixing zone that spreads from the break (story) — glows first
  const mixMat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 2.0,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
  });
  const mix = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.88, R * 0.88, 1, 18), mixMat);
  mix.visible = false;
  mix.renderOrder = 4;
  g.add(mix);
  const pl = light ? new THREE.PointLight(color, 0, 10, 1.4) : null;
  if (pl) {
    pl.position.y = 0;
    g.add(pl);
  }
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const lit = c.clone().lerp(new THREE.Color(0xffffff), 0.35);
  const dark = new THREE.Color(0xf1eec2);
  return {
    g,
    lower,
    upper,
    bend(a) {
      upper.rotation.z = a / 2;
      lower.rotation.z = -a / 2;
    },
    glow(k, boost = 1) {
      liquidMat.emissiveIntensity = 2.2 * k * boost;
      liquidMat.color.copy(dark).lerp(lit, Math.min(1, k * 1.5));
      tubeMat.emissiveIntensity = 0.55 * k * boost;
      if (pl) pl.intensity = 14 * k * boost;
    },
    xray(k) {
      tubeMat.opacity = lerp(0.4, 0.12, k);
      liquidMat.opacity = lerp(0.85, 0.3, k);
      glassMat.opacity = lerp(0.55, 0.85, k);
      glassMat.emissiveIntensity = lerp(0.08, 1.0, k);
      peroxMat.emissiveIntensity = lerp(0.15, 1.4, k);
    },
    // k = broken (0/1), s = seconds since the snap
    broken(k, s) {
      vLow.rotation.z = k ? 0.05 : 0;
      vUp.rotation.z = k ? -0.07 : 0;
      vUp.position.x = k ? 0.012 : 0;
      shards.visible = k > 0;
      if (!k) return;
      const burst = 1 - Math.exp(-Math.max(0, s) * 5);
      sd.forEach(([a, h, y, sz, sp], i) => {
        const rr = 0.03 + 0.08 * h * burst;
        const aa = a + s * (0.2 + sp * 0.4);
        const yy = y * (0.08 + 0.45 * burst) + Math.sin(s * 0.7 + i) * 0.02;
        e.set(s * (1 + sp * 2) + i, s * 1.3 + a, i);
        q.setFromEuler(e);
        const k2 = (0.6 + sz * 0.9) * Math.min(1, s * 8 + 0.2);
        m4.compose(V(Math.cos(aa) * rr, yy, Math.sin(aa) * rr), q, V(k2, k2 * 1.6, k2));
        shards.setMatrixAt(i, m4);
      });
      shards.instanceMatrix.needsUpdate = true;
    },
    mixZone(len) {
      mix.visible = len > 0;
      mix.scale.y = Math.max(0.001, len);
    },
  };
}
const stick = makeStick(GREEN);
stick.g.position.set(0, PIVOT, 0);
scene.add(stick.g);
const stickPink = makeStick(PINK, { light: true });
stickPink.g.position.set(-0.95, PIVOT, -0.4);
stickPink.g.rotation.z = 0.12;
scene.add(stickPink.g);
const stickBlue = makeStick(BLUE, { light: true });
stickBlue.g.position.set(0.95, PIVOT, -0.4);
stickBlue.g.rotation.z = -0.12;
scene.add(stickBlue.g);

// blue droplets of peroxide running out of the vial into the oil
const NMIX = 46;
const dropMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const drops = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.022, 0), dropMat, NMIX);
drops.frustumCulled = false;
drops.userData.noAO = true;
stick.g.add(drops);
const cBlue = new THREE.Color(0x6fc0ff);
const cGreen = new THREE.Color(GREEN).lerp(new THREE.Color(0xffffff), 0.2);
const tmpC = new THREE.Color();
const m4 = new THREE.Matrix4();
const qI = new THREE.Quaternion();
function animDrops(t, vis) {
  drops.visible = vis > 0;
  if (!vis) return;
  for (let i = 0; i < NMIX; i++) {
    const p = ((((t - T.zwei) * 0.42 + i / NMIX) % 1) + 1) % 1;
    const dir = i % 2 ? 1 : -1;
    const y = dir * (0.02 + p * 0.95);
    const r = 0.05 + 0.06 * Math.min(1, p * 2.2);
    const a = i * 2.39 + p * 4;
    const s = vis * (0.7 + 0.5 * Math.sin(i * 1.7) ** 2) * (1 - p * 0.3);
    m4.compose(V(Math.cos(a) * r, y, Math.sin(a) * r), qI, V(s, s, s));
    drops.setMatrixAt(i, m4);
    drops.setColorAt(i, tmpC.copy(cBlue).lerp(cGreen, smooth(Math.min(1, p * 1.6))));
  }
  drops.instanceMatrix.needsUpdate = true;
  drops.instanceColor.needsUpdate = true;
}

// ---------------------------------------------------------------- hands
const handR = createHand({ scale: 0.9, sleeve: 0x7a3fd6 });
const handL = createHand({ scale: 0.9, sleeve: 0x7a3fd6, left: true });
const RROT = [Math.PI / 2, -Math.PI / 2, 0];
const LROT = [Math.PI / 2, Math.PI / 2, 0];
const R_GRIP = [0.43, PIVOT + 0.62, 0.2];
const L_GRIP = [-0.43, PIVOT - 0.62, 0.2];
const R_AWAY = [1.3, PIVOT + 0.9, 0.9];
const L_AWAY = [-1.3, PIVOT - 0.9, 0.9];
const qz = new THREE.Quaternion();
// warm fill so the skin doesn't go grey in the green night light
const handFill = new THREE.PointLight(0xffc9a0, 0, 4, 1.5);
handFill.position.set(0.9, 1.7, 1.8);
scene.add(handFill);
// the hand rides along with its half of the stick when it bends
function ride(hand, a) {
  if (!hand.group.visible) return;
  const p = hand.group.position;
  p.y -= PIVOT;
  p.applyAxisAngle(Z, a);
  p.y += PIVOT;
  hand.group.quaternion.premultiply(qz.setFromAxisAngle(Z, a));
}

// ---------------------------------------------------------------- hook props
// a battery and a plug that the stick doesn't need
const battery = new THREE.Group();
{
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.11, 0.42, 16),
    flat(0x26232a, { roughness: 0.4 }),
  );
  battery.add(body);
  const band = new THREE.Mesh(
    new THREE.CylinderGeometry(0.112, 0.112, 0.16, 16),
    flat(0xd8a12a, { metalness: 0.5, roughness: 0.3 }),
  );
  band.position.y = 0.13;
  battery.add(band);
  const nub = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 10), MAT.chrome);
  nub.position.y = 0.235;
  battery.add(nub);
  battery.position.set(0.62, 1.32, 0.35);
  battery.rotation.z = -0.3;
  scene.add(battery);
}
const plug = new THREE.Group();
{
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.26, 0.14),
    flat(0xf2f2f2, { roughness: 0.5 }),
  );
  plug.add(body);
  for (const x of [-0.05, 0.05]) {
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.16, 8), MAT.chrome);
    pin.position.set(x, 0.2, 0);
    plug.add(pin);
  }
  const cable = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        V(0, -0.13, 0),
        V(0.02, -0.35, 0.05),
        V(-0.12, -0.6, 0.1),
        V(-0.3, -0.75, 0.0),
      ]),
      20,
      0.025,
      6,
    ),
    flat(0xf2f2f2),
  );
  plug.add(cable);
  plug.position.set(-0.62, 1.42, 0.35);
  plug.rotation.z = 0.35;
  scene.add(plug);
}

// ---------------------------------------------------------------- side set: cola glass
const cola = new THREE.Group();
cola.position.set(...COLA);
scene.add(cola);
const NB = 34;
const bubbles = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.018, 0),
  new THREE.MeshStandardMaterial({
    color: 0xfff1d8,
    roughness: 0.1,
    emissive: 0x7a4a20,
    emissiveIntensity: 0.3,
  }),
  NB,
);
{
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 20), flat(0x6b4a3a));
  top.position.y = 0.9;
  top.castShadow = top.receiveShadow = true;
  cola.add(top);
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.9, 8), flat(0x3a2a24));
  leg.position.y = 0.45;
  cola.add(leg);
  const glass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.18, 0.64, 20, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0xe8f4ff,
      transparent: true,
      opacity: 0.3,
      roughness: 0.05,
      depthWrite: false,
    }),
  );
  glass.position.y = 0.93 + 0.32;
  glass.renderOrder = 3;
  cola.add(glass);
  const liq = new THREE.Mesh(
    new THREE.CylinderGeometry(0.205, 0.172, 0.5, 20),
    new THREE.MeshStandardMaterial({
      color: 0x4a1f0c,
      roughness: 0.15,
      transparent: true,
      opacity: 0.92,
    }),
  );
  liq.position.y = 0.93 + 0.26;
  cola.add(liq);
  const foam = new THREE.Mesh(new THREE.CylinderGeometry(0.208, 0.205, 0.05, 20), flat(0xe8cfa8));
  foam.position.y = 0.93 + 0.53;
  cola.add(foam);
  for (const [x, z, r] of [
    [0.06, 0.04, 0.3],
    [-0.07, -0.03, 1.1],
  ]) {
    const ice = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.1, 0.11),
      new THREE.MeshStandardMaterial({
        color: 0xdff4ff,
        transparent: true,
        opacity: 0.7,
        roughness: 0.05,
      }),
    );
    ice.position.set(x, 0.93 + 0.5, z);
    ice.rotation.set(r, r * 0.7, 0.2);
    cola.add(ice);
  }
  const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.8, 8), flat(0xff4b5c));
  straw.position.set(0.08, 0.93 + 0.55, 0.02);
  straw.rotation.z = -0.25;
  cola.add(straw);
  bubbles.frustumCulled = false;
  cola.add(bubbles);
}
function animBubbles(t) {
  for (let i = 0; i < NB; i++) {
    const p = (t * (0.35 + (i % 5) * 0.06) + i * 0.137) % 1;
    const a = i * 2.1;
    const r = 0.04 + (i % 4) * 0.035;
    const s = 0.7 + (i % 3) * 0.3;
    m4.compose(V(Math.cos(a) * r, 0.96 + p * 0.48, Math.sin(a) * r), qI, V(s, s, s));
    bubbles.setMatrixAt(i, m4);
  }
  bubbles.instanceMatrix.needsUpdate = true;
}

// ---------------------------------------------------------------- side set: the light bulb
const bulbG = new THREE.Group();
bulbG.position.set(...BULB);
scene.add(bulbG);
const filMat = flat(0x5a5a5a, { emissive: 0xff8a2a, emissiveIntensity: 0 });
const bulbGlassMat = new THREE.MeshStandardMaterial({
  color: 0xfff6e0,
  transparent: true,
  opacity: 0.35,
  roughness: 0.05,
  emissive: 0xffa23a,
  emissiveIntensity: 0,
  depthWrite: false,
});
const bulbLight = new THREE.PointLight(0xffa23a, 0, 7, 1.5);
bulbLight.position.set(0, 1.45, 0);
bulbG.add(bulbLight);
{
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 20), flat(0x6b4a3a));
  top.position.y = 0.9;
  top.castShadow = top.receiveShadow = true;
  bulbG.add(top);
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.9, 8), flat(0x3a2a24));
  leg.position.y = 0.45;
  bulbG.add(leg);
  const sock = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.22, 14), MAT.alu);
  sock.position.y = 1.04;
  bulbG.add(sock);
  const glass = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 14), bulbGlassMat);
  glass.position.y = 1.36;
  glass.scale.y = 1.15;
  glass.renderOrder = 3;
  bulbG.add(glass);
  const pts = [];
  for (let k = 0; k <= 60; k++) {
    const f = k / 60;
    const a = f * Math.PI * 2 * 7;
    pts.push(V(-0.1 + f * 0.2, 1.36 + Math.sin(a) * 0.025, Math.cos(a) * 0.025));
  }
  bulbG.add(
    new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.007, 5), filMat),
  );
  for (const x of [-0.1, 0.1]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.25, 4), flat(0x8a8a8a));
    w.position.set(x, 1.24, 0);
    bulbG.add(w);
  }
}
const bulbHeat = makeArrowSet(
  [
    [V(0.18, 1.5, 0.1), V(0.6, 2.2, 0.3)],
    [V(-0.18, 1.5, 0.1), V(-0.6, 2.2, 0.3)],
    [V(0, 1.6, 0.18), V(0.05, 2.45, 0.4)],
  ],
  { parent: bulbG },
);

// ---------------------------------------------------------------- side set: the fridge + freezer
const fridge = new THREE.Group();
fridge.position.set(...FRIDGE);
fridge.rotation.y = 0.35;
scene.add(fridge);
const freezerDoor = new THREE.Group();
const iceStick = makeStick(GREEN, { light: false, scale: 0.42 });
const freezerGlow = new THREE.PointLight(GREEN, 0, 2.2, 1.5);
{
  const white = flat(0xf3f1ee, { roughness: 0.35 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.95, 1.2), white);
  body.position.y = 0.975;
  body.castShadow = body.receiveShadow = true;
  fridge.add(body);
  const seam = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.03, 0.02), flat(0xb9b6b2));
  seam.position.set(0, 1.94, 0.61);
  fridge.add(seam);
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.6, 0.06), MAT.chrome);
  handle.position.set(0.56, 1.4, 0.64);
  fridge.add(handle);
  // freezer compartment: open-front box
  const inner = flat(0xcfe6f5, { emissive: 0x6fa8d8, emissiveIntensity: 0.25 });
  const plate = (w, h, d, x, y, z, m = white) => {
    const p = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    p.position.set(x, y, z);
    p.castShadow = true;
    fridge.add(p);
  };
  plate(1.4, 0.06, 1.2, 0, 2.73, 0); // top
  plate(1.4, 0.06, 1.2, 0, 1.98, 0, inner); // floor
  plate(0.06, 0.8, 1.2, -0.67, 2.35, 0); // sides
  plate(0.06, 0.8, 1.2, 0.67, 2.35, 0);
  plate(1.4, 0.8, 0.06, 0, 2.35, -0.57, inner); // back
  // frost crumbs
  const fr = rng(7);
  for (let i = 0; i < 18; i++) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.05), flat(0xffffff));
    c.position.set((fr() - 0.5) * 1.15, 2.02, (fr() - 0.5) * 0.9);
    c.rotation.y = fr() * 3;
    fridge.add(c);
  }
  // the door, hinged on the left edge
  freezerDoor.position.set(-0.7, 2.35, 0.62);
  fridge.add(freezerDoor);
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 0.08), white);
  door.position.x = 0.7;
  door.castShadow = true;
  freezerDoor.add(door);
  const dh = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.06), MAT.chrome);
  dh.position.set(1.15, -0.28, 0.06);
  freezerDoor.add(dh);
  // the stick lies in the freezer
  iceStick.g.rotation.z = Math.PI / 2;
  iceStick.g.rotation.y = 0.15;
  iceStick.g.position.set(0, 2.12, 0.05);
  fridge.add(iceStick.g);
  freezerGlow.position.set(0, 2.3, 0.2);
  fridge.add(freezerGlow);
}

// ---------------------------------------------------------------- side set: the firefly
const fly = new THREE.Group();
fly.position.set(...FLY);
fly.scale.setScalar(2.2);
scene.add(fly);
const butMat = new THREE.MeshStandardMaterial({
  color: 0xe8ff9a,
  emissive: 0xc8ff3a,
  emissiveIntensity: 1.5,
  roughness: 0.4,
});
const butLight = new THREE.PointLight(0xc8ff3a, 0, 3, 1.6);
const wings = [];
{
  const black = flat(0x1d1a20, { roughness: 0.45 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), black);
  body.scale.set(1.5, 0.75, 0.8);
  fly.add(body);
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.065, 10, 8),
    flat(0xff5a3a, { roughness: 0.5 }),
  );
  head.position.set(0.17, 0.01, 0);
  fly.add(head);
  for (const z of [-0.035, 0.035]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), black);
    eye.position.set(0.215, 0.02, z);
    fly.add(eye);
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.18, 4), black);
    ant.position.set(0.25, 0.08, z * 1.4);
    ant.rotation.z = -0.9;
    ant.rotation.x = z * 6;
    fly.add(ant);
  }
  const but = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), butMat);
  but.scale.set(1.4, 0.85, 0.9);
  but.position.set(-0.2, -0.02, 0);
  fly.add(but);
  butLight.position.set(-0.24, -0.05, 0);
  fly.add(butLight);
  const wMat = new THREE.MeshStandardMaterial({
    color: 0xdfe6ff,
    transparent: true,
    opacity: 0.45,
    roughness: 0.2,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  for (const s of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(0.02, 0.06, s * 0.04);
    const w = new THREE.Mesh(new THREE.CircleGeometry(0.16, 12), wMat);
    w.scale.set(1, 0.45, 1);
    w.rotation.x = -Math.PI / 2;
    w.position.set(-0.08, 0, s * 0.13);
    pivot.add(w);
    fly.add(pivot);
    wings.push([pivot, s]);
  }
}
const swarm = fireflies(46, {
  area: [-6, 6, 0.5, 3.6, -6, 5],
  color: 0xd8ff6a,
  seed: 38,
  size: 0.045,
});

// ---------------------------------------------------------------- MICRO: inside the liquid
const micro = new THREE.Group();
micro.position.set(...MICRO);
scene.add(micro);
{
  const geo = new THREE.SphereGeometry(30, 32, 16);
  const p = geo.attributes.position;
  const col = new Float32Array(p.count * 3);
  const top = new THREE.Color(0x0e2233);
  const bot = new THREE.Color(0x041a10);
  const c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    c.copy(bot).lerp(top, clamp01(p.getY(i) / 30 + 0.5));
    col.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const back = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false }),
  );
  back.position.y = 2;
  back.userData.noAO = true;
  micro.add(back);
  const l1 = new THREE.PointLight(0xdfeeff, 40, 30, 1.2);
  l1.position.set(4, 8, 7);
  micro.add(l1);
  const l2 = new THREE.PointLight(0x5fffa0, 25, 22, 1.3);
  l2.position.set(-6, 3, -4);
  micro.add(l2);
}
// floating motes in the liquid
fireflies(90, {
  area: [-9, 9, -1, 6, -8, 5].map((v, i) => v + (i === 2 || i === 3 ? MICRO[1] : 0)),
  color: 0x7fe8b0,
  seed: 5,
  size: 0.03,
});

const atom = (color, r) =>
  new THREE.Mesh(
    new THREE.IcosahedronGeometry(r, 2),
    flat(color, { roughness: 0.32, metalness: 0.05 }),
  );
const bondMat = flat(0xdfe3ea, { roughness: 0.4 });
function bond(parent, a, b, r = 0.045, mat = bondMat) {
  const d = b.clone().sub(a);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 8), mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
  parent.add(m);
  return m;
}
const O_COL = 0xff4d4d;
const H_COL = 0xf4f4f4;
const C_COL = 0x3b3f4a;
function h2o2() {
  const g = new THREE.Group();
  const o1 = V(-0.24, 0, 0);
  const o2 = V(0.24, 0, 0);
  const h1 = V(-0.48, 0.28, 0.14);
  const h2 = V(0.48, 0.24, -0.16);
  for (const [p, c, r] of [
    [o1, O_COL, 0.24],
    [o2, O_COL, 0.24],
    [h1, H_COL, 0.15],
    [h2, H_COL, 0.15],
  ]) {
    const a = atom(c, r);
    a.position.copy(p);
    g.add(a);
  }
  bond(g, o1, o2);
  bond(g, o1, h1);
  bond(g, o2, h2);
  return g;
}
const ringMat = flat(0xf2c84b, { roughness: 0.35 });
function oil() {
  const g = new THREE.Group();
  const c1 = V(-0.2, 0, 0);
  const c2 = V(0.2, 0, 0);
  const pts = [
    [c1, C_COL, 0.17],
    [c2, C_COL, 0.17],
    [V(-0.26, 0.4, 0), O_COL, 0.18],
    [V(0.26, 0.4, 0), O_COL, 0.18],
    [V(-0.52, -0.16, 0), O_COL, 0.18],
    [V(0.52, -0.16, 0), O_COL, 0.18],
  ];
  for (const [p, c, r] of pts) {
    const a = atom(c, r);
    a.position.copy(p);
    g.add(a);
  }
  bond(g, c1, c2);
  bond(g, c1, pts[2][0]);
  bond(g, c2, pts[3][0]);
  bond(g, c1, pts[4][0]);
  bond(g, c2, pts[5][0]);
  for (const s of [-1, 1]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.07, 6, 6), ringMat);
    ring.position.set(s * 0.98, -0.3, 0);
    ring.rotation.z = s * 0.3;
    g.add(ring);
    bond(g, V(s * 0.52, -0.16, 0), V(s * 0.72, -0.25, 0));
  }
  return g;
}
const HP_POS = [
  [-2.6, 2.6, 0.4],
  [-3.9, 3.5, -1.6],
  [-1.5, 3.7, -1.3],
  [-3.3, 1.4, -0.6],
  [-1.9, 1.1, 1.4],
  [-4.4, 2.1, 1.5],
];
const OIL_POS = [
  [2.4, 2.4, 0.3],
  [3.7, 3.4, -1.7],
  [1.5, 3.8, -1.9],
  [3.5, 1.2, -0.5],
  [1.8, 1.0, 1.5],
];
const hps = HP_POS.map(() => h2o2());
const oils = OIL_POS.map(() => oil());
for (const m of [...hps, ...oils]) micro.add(m);
// the hero molecule: a four-ring (C-C-O-O) with a tense spring inside
const hero = new THREE.Group();
micro.add(hero);
const springMat = flat(0xfff27a, { emissive: 0xffd23f, emissiveIntensity: 1.8 });
const spring = new THREE.Group();
{
  const c1 = V(-0.34, 0.34, 0);
  const c2 = V(0.34, 0.34, 0);
  const o1 = V(0.34, -0.34, 0);
  const o2 = V(-0.34, -0.34, 0);
  const e1 = V(-0.72, 0.72, 0);
  const e2 = V(0.72, 0.72, 0);
  for (const [p, c, r] of [
    [c1, C_COL, 0.2],
    [c2, C_COL, 0.2],
    [o1, O_COL, 0.21],
    [o2, O_COL, 0.21],
    [e1, O_COL, 0.21],
    [e2, O_COL, 0.21],
  ]) {
    const a = atom(c, r);
    a.position.copy(p);
    hero.add(a);
  }
  bond(hero, c1, c2);
  bond(hero, c2, o1);
  bond(hero, o1, o2);
  bond(hero, o2, c1);
  for (const [a, b] of [
    [c1, e1],
    [c2, e2],
  ]) {
    const off = V(0.04, 0.04, 0);
    bond(hero, a.clone().add(off), b.clone().add(off), 0.035);
    bond(hero, a.clone().sub(off), b.clone().sub(off), 0.035);
  }
  const pts = [];
  for (let k = 0; k <= 160; k++) {
    const f = k / 160;
    const a = f * Math.PI * 2 * 7;
    pts.push(V(Math.cos(a) * 0.13, -0.3 + f * 0.6, Math.sin(a) * 0.13));
  }
  spring.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 320, 0.018, 6),
      springMat,
    ),
  );
  spring.rotation.z = Math.PI / 4;
  hero.add(spring);
}
hero.scale.setScalar(1.5);
const HERO_AT = [0, 2.2, 0.5];
hero.position.set(...HERO_AT);
// two CO2 after the burst
function co2() {
  const g = new THREE.Group();
  const c = atom(C_COL, 0.2);
  g.add(c);
  for (const s of [-1, 1]) {
    const o = atom(0x8a3a3a, 0.21);
    o.position.x = s * 0.48;
    g.add(o);
    bond(g, V(s * 0.1, 0.05, 0), V(s * 0.4, 0.05, 0), 0.03);
    bond(g, V(s * 0.1, -0.05, 0), V(s * 0.4, -0.05, 0), 0.03);
  }
  g.scale.setScalar(1.4);
  return g;
}
const co2s = [co2(), co2()];
for (const c of co2s) micro.add(c);
// the energy: a bright spark
const spark = new THREE.Group();
{
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.13, 1),
    new THREE.MeshBasicMaterial({ color: 0xfffbe0 }),
  );
  spark.add(core);
  const halo = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.32, 1),
    new THREE.MeshBasicMaterial({
      color: 0xfff6b0,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  spark.add(halo);
  spark.userData.noAO = true;
  const sl = new THREE.PointLight(0xfff0a0, 12, 4, 1.5);
  spark.add(sl);
}
micro.add(spark);
// dye molecules: three fused rings; green (hero), pink, blue
function dye(color) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0x2b3a33,
    emissive: color,
    emissiveIntensity: 0,
    roughness: 0.35,
    flatShading: true,
  });
  for (let i = -1; i <= 1; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.09, 6, 6), mat);
    ring.position.x = i * 0.6;
    ring.rotation.z = Math.PI / 6;
    g.add(ring);
  }
  for (const s of [-1, 1]) {
    const a = atom(C_COL, 0.13);
    a.position.set(s * 1.25, 0.15, 0);
    g.add(a);
    const b = atom(C_COL, 0.13);
    b.position.set(s * 1.25, -0.15, 0);
    g.add(b);
  }
  g.scale.setScalar(1.25);
  g.userData.mat = mat;
  return g;
}
const dyeG = dye(GREEN);
dyeG.position.set(0, 2.2, 0);
const dyeP = dye(PINK);
dyeP.position.set(0.3, 3.85, -0.5);
const dyeB = dye(BLUE);
dyeB.position.set(-0.3, 0.55, -0.5);
micro.add(dyeG, dyeP, dyeB);
const dyeLights = [dyeG, dyeP, dyeB].map((d, i) => {
  const l = new THREE.PointLight([GREEN, PINK, BLUE][i], 0, 6, 1.4);
  d.add(l);
  return l;
});
// photons: little light balls flying out of the dyes
const NPH = 60;
const phot = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.05, 1),
  new THREE.MeshBasicMaterial({ color: 0xffffff }),
  NPH,
);
phot.frustumCulled = false;
phot.userData.noAO = true;
micro.add(phot);
const ringWave = new THREE.Mesh(
  new THREE.TorusGeometry(1, 0.03, 6, 48),
  new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.8, depthWrite: false }),
);
ringWave.position.copy(dyeG.position);
micro.add(ringWave);
// the eye behind the hero molecule ("kürzer als ein Wimpernschlag")
const eye = new THREE.Group();
const lid = new THREE.Group();
{
  const sclera = new THREE.Mesh(
    new THREE.SphereGeometry(2.3, 32, 20),
    flat(0xf8f4ee, { roughness: 0.3, flatShading: false }),
  );
  eye.add(sclera);
  const iris = new THREE.Mesh(
    new THREE.CircleGeometry(0.95, 24),
    flat(0x3a9a7a, { roughness: 0.4 }),
  );
  iris.position.z = 2.29;
  eye.add(iris);
  const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.46, 20), flat(0x0b0b0e));
  pupil.position.z = 2.3;
  eye.add(pupil);
  const shine = new THREE.Mesh(
    new THREE.CircleGeometry(0.16, 10),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
  );
  shine.position.set(0.32, 0.35, 2.31);
  eye.add(shine);
  const skin = flat(0xe8b896, { roughness: 0.7 });
  const up = new THREE.Mesh(
    new THREE.SphereGeometry(2.42, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    skin,
  );
  lid.add(up);
  for (let i = -4; i <= 4; i++) {
    const lash = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.5, 0.05), flat(0x1b1410));
    lash.position.set(i * 0.42, 0, 2.38 * Math.cos((i * 0.42) / 2.4));
    lash.rotation.x = 0.9;
    lid.add(lash);
  }
  eye.add(lid);
  const low = new THREE.Mesh(
    new THREE.SphereGeometry(2.41, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    skin,
  );
  low.rotation.x = 0.45;
  eye.add(low);
  eye.position.set(0, 2.7, -6.5);
  micro.add(eye);
}
// the ponytail turning blond ("das Zeug zum Haare-Blondieren")
const hairMat = flat(0x5a3a22, { roughness: 0.6 });
const pony = new THREE.Group();
{
  // a hanging bundle of thick wavy strands, gathered at the top
  const sr = rng(11);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const r0 = 0.12 + sr() * 0.08;
    const len = 1.8 + sr() * 0.6;
    const pts = [];
    for (let k = 0; k <= 8; k++) {
      const f = k / 8;
      const spread = Math.sin(f * Math.PI * 0.85) * 0.45 + r0;
      const w = Math.sin(f * 6 + i) * 0.06;
      pts.push(V(Math.cos(a) * spread + w, 1.0 - f * len, Math.sin(a) * spread));
    }
    const strand = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.09 - 0.0 * sr(), 5),
      hairMat,
    );
    pony.add(strand);
  }
  const tie = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.08, 8, 16), flat(0xff4fd8));
  tie.rotation.x = Math.PI / 2;
  tie.position.y = 1.05;
  pony.add(tie);
  pony.position.set(-6.5, 2.2, 0.5);
  micro.add(pony);
}
const hairBrown = new THREE.Color(0x5a3a22);
const hairBlond = new THREE.Color(0xf5d76e);

// ---------------------------------------------------------------- helpers
const applyCamera = shotCamera(shots);
const sP = (x, y, z, arr) => {
  arr[0] = x + MICRO[0];
  arr[1] = y + MICRO[1];
  arr[2] = z + MICRO[2];
};
const vis = (obj, k) => {
  obj.visible = k > 0.001;
  return k;
};
// party lights: on for the establishing shot, out on "stockdunkel", the yard
// stays dark so the green rules
function partyK(t) {
  if (t < T.stell) return 0.55;
  if (t < T.stockdunkel) return 1;
  if (t < T.zack) return lerp(1, 0.06, smooth(ramp(t, T.stockdunkel, T.stockdunkel + 0.35)));
  return 0.06 + 0.3 * smooth(ramp(t, T.zack, T.zack + 1.5));
}

// ---------------------------------------------------------------- render
function renderAt(t) {
  const story = t >= T.stell;
  // ------------------------------------------------ the main stick
  // bend: hook (snap before frame 0, again on "zerbrichst"), story (on "knackt")
  let bend = 0;
  if (!story) {
    bend = 0.55 * (1 - smooth(ramp(t, -0.25, 0.5))) + 0.14 * smooth(ramp(t, -0.25, 0.5));
    bend += 0.32 * Math.sin(Math.PI * clamp01((t - T.zerbrichst - 0.05) / 0.6));
    bend *= 1 - smooth(ramp(t, 2.9, 3.5));
  } else if (t < T.da) {
    const up = smooth(ramp(t, T.biegst - 0.1, T.knackt - 0.05));
    const back = smooth(ramp(t, T.knackt, T.knackt + 0.5));
    bend = 0.6 * up * (1 - back);
  }
  stick.bend(bend);
  const snapAt = story ? T.knackt - 0.05 : -0.25;
  const broken = t >= snapAt ? 1 : 0;
  stick.broken(broken, t - snapAt);
  // glow: hook already surging on frame 0; story only after "Zack"
  let glow;
  if (!story) glow = smooth(ramp(t, -0.25, 0.4));
  else glow = smooth(ramp(t, T.zack - 0.05, T.zack + 0.25));
  const boost =
    1 +
    1.6 *
      Math.exp(-Math.max(0, t - (story ? T.zack : 0)) * 3) *
      (t >= (story ? T.zack : -1) ? 1 : 0);
  stick.glow(glow, boost);
  const mixLen =
    story && t >= T.knackt && t < T.zack + 0.3
      ? 0.12 + 2.25 * smooth(ramp(t, T.knackt, T.zack))
      : 0;
  stick.mixZone(mixLen);
  stick.xray(
    smooth(ramp(t, T.da - 0.1, T.da + 0.35)) * (1 - smooth(ramp(t, T.zack - 0.25, T.zack))),
  );
  animDrops(t, pop(t, T.zwei - 0.2, T.zack + 0.2));
  // the stick turns slowly while nobody holds it
  stick.g.rotation.y = t >= T.zack ? (t - T.zack) * 0.25 : 0;

  // ------------------------------------------------ hands
  handR.track(t, [
    { t: -0.8, pos: R_GRIP, rot: RROT, pose: "grab" },
    { t: T.und1 - 0.02, pos: R_GRIP, rot: RROT, pose: "grab" },
    { t: T.und1, pos: R_AWAY, rot: RROT, pose: "open", out: true },
    { t: T.biegst - 0.55, pos: R_AWAY, rot: RROT, pose: "open" },
    { t: T.biegst - 0.1, pos: R_GRIP, rot: RROT, pose: "grab" },
    { t: T.knackt + 0.4, pos: R_GRIP, rot: RROT, pose: "grab" },
    { t: T.da, pos: R_AWAY, rot: RROT, pose: "open", out: true },
    { t: T.das2 - 0.45, pos: R_AWAY, rot: RROT, pose: "open" },
    { t: T.das2 - 0.05, pos: R_GRIP, rot: RROT, pose: "grab" },
    { t: T.eine - 0.1, pos: R_GRIP, rot: RROT, pose: "grab" },
    { t: T.eine, pos: R_AWAY, rot: RROT, pose: "open", out: true },
  ]);
  handL.track(t, [
    { t: -0.8, pos: L_GRIP, rot: LROT, pose: "grab" },
    { t: T.und1 - 0.02, pos: L_GRIP, rot: LROT, pose: "grab" },
    { t: T.und1, pos: L_AWAY, rot: LROT, pose: "open", out: true },
    { t: T.biegst - 0.55, pos: L_AWAY, rot: LROT, pose: "open" },
    { t: T.biegst - 0.1, pos: L_GRIP, rot: LROT, pose: "grab" },
    { t: T.knackt + 0.4, pos: L_GRIP, rot: LROT, pose: "grab" },
    { t: T.da, pos: L_AWAY, rot: LROT, pose: "open", out: true },
  ]);
  handFill.intensity = handR.group.visible || handL.group.visible ? 2.5 : 0;
  ride(handR, bend / 2);
  ride(handL, -bend / 2);

  // ------------------------------------------------ hook props: battery / plug + ✕
  const kb = pop(t, T.ohne1, T.ohne2);
  vis(battery, kb);
  battery.scale.copy(squash(t, T.ohne1)).multiplyScalar(Math.max(0.001, kb));
  const kp = pop(t, T.ohne2, T.stell);
  vis(plug, kp);
  plug.scale.copy(squash(t, T.ohne2)).multiplyScalar(Math.max(0.001, kp));
  if (kb > 0) showNope(pop(t, T.ohne1 + 0.25, T.ohne2), 0.62, 1.32, 0.45, 0.45);
  else if (kp > 0) showNope(pop(t, T.ohne2 + 0.25, T.stell), -0.62, 1.42, 0.45, 0.45);
  else if (t >= T.aber && t < T.wo)
    showNope(pop(t, T.aber + 0.2, T.wo), MICRO[0], MICRO[1] + 3.1, MICRO[2] + 0.6, 0.6);
  else showNope(0, 0, 0, 0);

  // ------------------------------------------------ party lights, pumpkins
  const pk = partyK(t);
  setPartyLights(pk);
  setPumpkins(Math.max(0.3, pk), t);

  // ------------------------------------------------ cola glass, bulb, fridge
  animBubbles(t);
  const bulbOn = smooth(ramp(t, T.gluehbirne, T.gluehbirne + 0.25));
  filMat.emissiveIntensity = 3.2 * bulbOn;
  bulbGlassMat.emissiveIntensity = 0.9 * bulbOn;
  bulbLight.intensity = 7 * bulbOn;
  animateArrows(bulbHeat, t, pop(t, T.gluehbirne + 0.3, T.und2));
  freezerDoor.rotation.y = -1.9 * easeInOut(ramp(t, T.gefrierfach, T.gefrierfach + 0.6));
  // in the freezer the reaction falls asleep: dim, slow pulse
  const sleep = smooth(ramp(t, T.reaktion, T.schlaeft + 0.6));
  const iceGlow = lerp(1, 0.32 + 0.06 * Math.sin(t * 2.2), sleep);
  iceStick.glow(iceGlow * 0.6);
  freezerGlow.intensity = 1.1 * iceGlow;
  puff("frost", t, T.gefrierfach + 0.35, FRIDGE[0], 2.4, FRIDGE[2] + 0.9, 0.7, 0xdff2ff);

  // ------------------------------------------------ firefly + swarm
  const kf = pop(t, T.fakt - 0.2, 61);
  vis(fly, kf);
  swarm.visible = t >= T.fakt - 0.2;
  fly.position.set(FLY[0] + Math.sin(t * 1.3) * 0.06, FLY[1] + Math.sin(t * 2.1) * 0.05, FLY[2]);
  if (t > T.gruen)
    fly.position.add(
      V(1, 0.7, -0.4).multiplyScalar(easeInOut(ramp(t, T.gruen, T.gruen + 1.2)) * 2.5),
    );
  fly.rotation.y = 0.5 + Math.sin(t * 0.7) * 0.1;
  fly.scale.setScalar(2.2);
  for (const [w, s] of wings) w.rotation.x = s * (0.5 + 0.45 * Math.sin(t * 60));
  const butFlash = Math.exp(-Math.max(0, t - T.hintern) * 2.5) * (t >= T.hintern ? 1 : 0);
  butMat.emissiveIntensity = 1.2 + 0.6 * Math.sin(t * 3.1) ** 2 + 3.5 * butFlash;
  butLight.intensity = 2 + 6 * butFlash;

  // ------------------------------------------------ the extra sticks (CTA)
  for (const [s, at] of [
    [stickPink, T.pink],
    [stickBlue, T.blau],
  ]) {
    s.g.visible = t >= at;
    s.g.scale.copy(squash(t, at));
    s.glow(1, 1 + 1.5 * Math.exp(-Math.max(0, t - at) * 4));
    s.bend(0);
    s.broken(1, 3);
    s.mixZone(0);
    s.xray(0);
  }
  if (t >= T.gruen) stick.glow(1, 1 + 1.5 * Math.exp(-(t - T.gruen) * 4));

  // ------------------------------------------------ MICRO
  // H2O2 + oil molecules bob around; the two heroes fly together
  const merge = easeInOut(ramp(t, T.zusammen, T.zusammen + 0.75));
  const crowdOut = inBack(ramp(t, T.nur, T.nur + 0.5));
  hps.forEach((m, i) => {
    const [x, y, z] = HP_POS[i];
    m.position.set(x + Math.sin(t * 0.6 + i) * 0.15, y + Math.sin(t * 0.9 + i * 2) * 0.15, z);
    m.rotation.set(t * 0.3 + i, t * 0.4 + i * 0.7, 0);
    let s = 1 - crowdOut;
    if (i === 0) {
      m.position.lerp(V(-0.55, 2.2, 0.5), merge);
      s = 1 - inBack(ramp(t, T.zusammen + 0.65, T.zusammen + 0.95));
    }
    m.scale.setScalar(Math.max(0.001, s * 1.35));
    m.visible = s > 0.01;
  });
  oils.forEach((m, i) => {
    const [x, y, z] = OIL_POS[i];
    m.position.set(x + Math.sin(t * 0.5 + i * 1.3) * 0.15, y + Math.sin(t * 0.8 + i) * 0.15, z);
    m.rotation.set(Math.sin(t * 0.3 + i) * 0.5, t * 0.35 + i, Math.sin(t * 0.2) * 0.3);
    let s = 1 - crowdOut;
    if (i === 0) {
      m.position.lerp(V(0.65, 2.2, 0.5), merge);
      s = 1 - inBack(ramp(t, T.zusammen + 0.65, T.zusammen + 0.95));
    }
    m.scale.setScalar(Math.max(0.001, s * 1.2));
    m.visible = s > 0.01;
  });
  sP(hps[0].position.x, hps[0].position.y + 0.3, hps[0].position.z, HP0);
  sP(oils[0].position.x, oils[0].position.y + 0.3, oils[0].position.z, OIL0);
  // hero molecule: pops in, trembles harder and harder, bursts
  const heroIn = T.zusammen + 0.8;
  const heroOn = t >= heroIn && t < T.platzt;
  hero.visible = heroOn;
  if (heroOn) {
    const tense = ramp(t, T.vollgepackt, T.platzt);
    hero.scale.copy(squash(t, heroIn)).multiplyScalar(1.5);
    const j = 0.02 + 0.08 * tense * tense;
    hero.position.set(
      HERO_AT[0] + Math.sin(t * 47) * j,
      HERO_AT[1] + Math.sin(t * 53 + 1) * j,
      HERO_AT[2],
    );
    hero.rotation.set(Math.sin(t * 0.8) * 0.2, Math.sin(t * 0.6) * 0.35, Math.sin(t * 41) * j * 2);
    spring.scale.set(1, 0.72 + 0.06 * Math.sin(t * 30), 1);
    springMat.emissiveIntensity = 1.6 + 2.2 * tense;
  }
  puff("heroPop", t, heroIn + 0.05, MICRO[0], MICRO[1] + 2.2, MICRO[2] + 0.5, 0.9, 0xfff6a0);
  // burst: two CO2 fly apart, the spark stays
  const sinceBurst = t - T.platzt;
  co2s.forEach((c, i) => {
    const on = sinceBurst >= 0 && t < T.rate;
    c.visible = on;
    if (!on) return;
    const s = i ? 1 : -1;
    const fly2 = 1 - Math.exp(-sinceBurst * 2.4);
    c.position.set(
      HERO_AT[0] + s * 0.75 * fly2,
      HERO_AT[1] + s * 1.15 * fly2 + Math.sin(t * 0.8 + i) * 0.1,
      HERO_AT[2] + 0.2 * fly2,
    );
    c.rotation.set(
      sinceBurst * 0.7 * s,
      sinceBurst * 1.1,
      sinceBurst * 2.2 * s * Math.exp(-sinceBurst),
    );
    c.scale.copy(squash(t, T.platzt, 0.5)).multiplyScalar(1.4);
  });
  sP(co2s[0].position.x - 0.2, co2s[0].position.y + 0.35, co2s[0].position.z, CO2A);
  puff("burst", t, T.platzt, MICRO[0], MICRO[1] + 2.2, MICRO[2] + 0.5, 1.6, 0xfff6a0);
  // the spark: born in the burst, zips away on "hin", comes back for the dye
  let sparkOn = false;
  if (t >= T.platzt && t < T.hin + 0.5) {
    sparkOn = true;
    const rise = easeInOut(ramp(t, T.platzt, T.platzt + 1.2));
    const zip = Math.pow(ramp(t, T.hin - 0.15, T.hin + 0.35), 2);
    spark.position.set(
      HERO_AT[0] + Math.sin(t * 5) * 0.06 + zip * 7,
      HERO_AT[1] + rise * 0.25 + Math.sin(t * 7) * 0.05 + zip * 0.3,
      HERO_AT[2] + 0.6 + zip * 0.2,
    );
  } else if (t >= T.energie3 - 0.3 && t < HIT) {
    sparkOn = true;
    const k = easeInOut(ramp(t, T.energie3 - 0.3, HIT));
    spark.position.set(lerp(-5.5, 0, k), 2.2 + Math.sin(k * Math.PI) * 0.6, lerp(0.4, 0, k));
  }
  spark.visible = sparkOn;
  spark.scale.setScalar(1 + 0.15 * Math.sin(t * 25));
  // eye: opens on "lebt", blinks on "Wimpernschlag", gone after the burst
  const ke = pop(t, T.nur + 0.2, T.platzt + 0.15, 0.5);
  vis(eye, ke);
  eye.scale.setScalar(Math.max(0.001, ke));
  const open = smooth(ramp(t, T.lebt - 0.3, T.lebt + 0.3));
  const blink = Math.sin(Math.PI * clamp01((t - T.wimpern) / 0.32));
  lid.rotation.x = lerp(1.35, -0.95, open) + 2.3 * blink * open;
  // ponytail: brown → blond
  const kpz = pop(t, T.zeug - 0.1, T.draussen + 0.1);
  vis(pony, kpz);
  pony.scale.setScalar(Math.max(0.001, kpz));
  pony.rotation.y = t * 0.6;
  hairMat.color.copy(hairBrown).lerp(hairBlond, smooth(ramp(t, T.haare + 0.15, T.haare + 0.6)));
  puff("blond", t, T.haare + 0.2, MICRO[0] - 6.5, MICRO[1] + 2.4, MICRO[2] + 0.5, 0.9, 0xfff3b0);
  // dyes: the green one waits for the payoff; pink + blue join on "Welcher"
  const kd = t >= T.das3 - 0.2 ? 1 : 0;
  dyeG.visible = kd > 0;
  dyeG.scale.copy(squash(t, T.das3 - 0.2)).multiplyScalar(1.25);
  dyeG.rotation.set(Math.sin(t * 0.5) * 0.2, Math.sin(t * 0.4) * 0.4, 0);
  const gG = smooth(ramp(t, HIT, HIT + 0.25));
  const flare = Math.exp(-Math.max(0, t - HIT) * 2) * (t >= HIT ? 1 : 0);
  dyeG.userData.mat.emissiveIntensity = 2.4 * gG + 3 * flare;
  dyeLights[0].intensity = 10 * gG + 20 * flare;
  for (const [d, l, at] of [
    [dyeP, dyeLights[1], T.bestimmt],
    [dyeB, dyeLights[2], T.farbe],
  ]) {
    d.visible = t >= T.welcher + 0.25;
    d.scale.copy(squash(t, T.welcher + 0.25)).multiplyScalar(1.25);
    d.rotation.set(Math.sin(t * 0.5 + 1) * 0.2, Math.sin(t * 0.4 + 2) * 0.4, 0);
    const g2 = smooth(ramp(t, at, at + 0.25));
    const f2 = Math.exp(-Math.max(0, t - at) * 2.5) * (t >= at ? 1 : 0);
    d.userData.mat.emissiveIntensity = 2.4 * g2 + 3 * f2;
    l.intensity = 10 * g2 + 18 * f2;
  }
  // photons stream out of every lit dye
  const lits = [
    [dyeG, gG, GREEN],
    [dyeP, smooth(ramp(t, T.bestimmt, T.bestimmt + 0.25)), PINK],
    [dyeB, smooth(ramp(t, T.farbe, T.farbe + 0.25)), BLUE],
  ];
  phot.visible = gG > 0 && t < T.fakt + 0.5;
  if (phot.visible) {
    for (let i = 0; i < NPH; i++) {
      const [d, k, col] = lits[i % 3];
      const p = ((t - HIT) * 0.7 + ((i * 0.618) % 1)) % 1;
      const th = i * 2.399;
      const ph = Math.acos(1 - 2 * ((i * 0.37) % 1));
      const dir = V(Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th));
      const s = k > 0 ? 1 - p * 0.6 : 0.0001;
      m4.compose(d.position.clone().addScaledVector(dir, 0.6 + p * 3.2), qI, V(s, s, s));
      phot.setMatrixAt(i, m4);
      phot.setColorAt(i, tmpC.setHex(col));
    }
    phot.instanceMatrix.needsUpdate = true;
    phot.instanceColor.needsUpdate = true;
  }
  const wave = ramp(t, HIT, HIT + 0.9);
  ringWave.visible = wave > 0 && wave < 1;
  ringWave.scale.setScalar(0.5 + wave * 4);
  ringWave.material.opacity = 0.8 * (1 - wave);
  ringWave.lookAt(V(0, MICRO[1] + 2.6, 4.6));

  // ------------------------------------------------ HUD + LED panel
  // "Rate mal, wie heiß …": the needle hesitates upward, then falls to air temperature
  const kg = pop(t, T.rate + 0.1, T.eine);
  const guess = smooth(ramp(t, T.rate + 0.2, T.gar - 0.1));
  const drop = smooth(ramp(t, T.gar, T.gar + 0.5));
  const temp = lerp(lerp(21, 64, guess) + Math.sin(t * 9) * 3 * guess * (1 - drop), 21, drop);
  gauge("temp", kg, { label: "TEMPERATUR", value: temp, max: 100, unit: "°C", x: 640, y: 1240 });
  if (t >= T.gluehbirne + 0.15 && t < T.und2) {
    showPanel(pop(t, T.gluehbirne + 0.15, T.und2), "GLÜHBIRNE: HITZE", "90 %", LED.red);
  } else {
    showPanel(0);
  }

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
