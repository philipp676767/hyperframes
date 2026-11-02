// #48 "Cent vom Wolkenkratzer" (Format B): you flick a 1-cent coin off the
// roof of a skyscraper; it tumbles down the glass facade, never gets faster
// than ~40 km/h and only stings the passer-by below. Everything here is a
// pure function of t (beats.js holds the timing, set.js the world).
import {
  THREE,
  V,
  ramp,
  smooth,
  lerp,
  clamp01,
  pop,
  rng,
  scene,
  camera,
  flat,
  M,
  facet,
  facetMat,
  jitter,
  showNope,
  makeArrowSet,
  animateArrows,
  coldMat,
  forceMat,
  showPanel,
  LED,
  labels,
  squash,
  puff,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { H, WALK_Z, TRACK_Z, PLANTER, iceX } from "./set.js";
import { createHand } from "./hand.js";
import { gauge, stopwatch, readout } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);

const mesh = (geo, mat, x = 0, y = 0, z = 0, parent = scene, shadow = true) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = shadow;
  parent.add(m);
  return m;
};
const canvasTex = (w, h, draw) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace;
  return tx;
};
const easeOut = (x) => 1 - (1 - x) * (1 - x);

// ---------------------------------------------------------------- key light follows the shot
// the sun's shadow box (±14) travels with the camera's focus, so the roof
// deck, the sidewalk and the railway all get crisp shadows
const key = scene.children.find((o) => o.isDirectionalLight && o.castShadow);
const KEY_DIR = key.position.clone().normalize();
const KEY_I = key.intensity;
scene.add(key.target);
Object.assign(key.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 130 });
key.shadow.camera.updateProjectionMatrix();

// ---------------------------------------------------------------- the coin
const COIN_R = 0.2;
const copper = new THREE.MeshStandardMaterial({
  color: 0xd07a3e,
  metalness: 0.8,
  roughness: 0.26,
  flatShading: true,
});
const copperDark = new THREE.MeshStandardMaterial({
  color: 0xa65a2a,
  metalness: 0.8,
  roughness: 0.32,
});
const coin = new THREE.Group();
scene.add(coin);
{
  const disc = mesh(new THREE.CylinderGeometry(COIN_R, COIN_R, 0.032, 28), copper, 0, 0, 0, coin);
  disc.receiveShadow = false;
  for (const s of [-1, 1]) {
    const rim = mesh(
      new THREE.TorusGeometry(COIN_R * 0.9, 0.009, 4, 28),
      copperDark,
      0,
      s * 0.017,
      0,
      coin,
      false,
    );
    rim.rotation.x = Math.PI / 2;
    // a raised "1" and a few stars of the euro side
    const one = mesh(
      new THREE.BoxGeometry(0.03, 0.006, 0.13),
      copperDark,
      0.02,
      s * 0.018,
      0,
      coin,
      false,
    );
    one.rotation.y = 0.0;
    const flag = mesh(
      new THREE.BoxGeometry(0.05, 0.006, 0.022),
      copperDark,
      -0.005,
      s * 0.018,
      -0.055,
      coin,
      false,
    );
    flag.rotation.y = 0.6;
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      mesh(
        new THREE.BoxGeometry(0.018, 0.006, 0.018),
        copperDark,
        Math.cos(a) * COIN_R * 0.72,
        s * 0.018,
        Math.sin(a) * COIN_R * 0.72,
        coin,
        false,
      );
    }
  }
}
// a sparkle on the coin so it reads from far away
const glintTex = canvasTex(128, 128, (g, w) => {
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, "rgba(255,250,220,1)");
  grd.addColorStop(0.18, "rgba(255,214,120,0.9)");
  grd.addColorStop(1, "rgba(255,180,80,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, w, w);
  g.fillStyle = "rgba(255,250,230,0.95)";
  g.beginPath();
  for (const [a, l] of [
    [0, 64],
    [Math.PI / 2, 64],
    [Math.PI / 4, 30],
    [-Math.PI / 4, 30],
  ]) {
    g.save();
    g.translate(64, 64);
    g.rotate(a);
    g.fillRect(-l, -2.5, l * 2, 5);
    g.restore();
  }
});
const glint = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: glintTex,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    fog: false,
  }),
);
scene.add(glint);

// the fall: keyframes (time → height), anchored to the words. Hard cuts
// hide the changes of speed; the hook part is quick, then ~1 unit/s.
export const START = V(0.6, H + 1.42, -3.7);
const TI = T.impact;
const HEAD_TOP = 1.98;
const YK = [
  [-0.3, START.y],
  [0, START.y - 0.14],
  [T.wolkenkratzer, START.y - 2.3],
  [T.unten1, START.y - 7.5],
  [T.jede, 26],
  [T.ohne, 25],
  [T.doch, 23],
  [T.was, 8.0],
  [T.rate, 6.8],
  [T.der3, 5.8],
  [T.darum, 4.9],
  [T.und, 3.5],
  [TI, HEAD_TOP],
];
function fallY(t) {
  if (t <= YK[0][0]) return YK[0][1];
  for (let i = 1; i < YK.length; i++) {
    if (t <= YK[i][0]) {
      const [t0, y0] = YK[i - 1];
      const [t1, y1] = YK[i];
      // ease the first leg (it leaves the fingers from rest)
      const k = (t - t0) / (t1 - t0);
      return lerp(y0, y1, i === 1 ? k * k : k);
    }
  }
  return HEAD_TOP;
}
const tumbleK = (t) =>
  ramp(t, T.taumelt, T.taumelt + 1.4) * (1 - ramp(t, T.darum + 0.6, T.und + 0.4));
const BOUNCE_T = (2.0 + Math.sqrt(4 + 4 * 4.9 * (HEAD_TOP - 0.12))) / 9.8;
const coinP = V(0, 0, 0);
function coinPos(t, out = coinP) {
  if (t >= TI) {
    const dt = Math.min(t - TI, BOUNCE_T);
    const slide = Math.max(0, t - TI - BOUNCE_T);
    const sk = 1 - Math.exp(-slide * 5);
    out.set(
      0.6 + 0.9 * dt + 0.12 * sk,
      Math.max(0.12, HEAD_TOP + 2.0 * dt - 4.9 * dt * dt),
      WALK_Z + 0.5 * dt + 0.05 * sk,
    );
    return out;
  }
  const a = tumbleK(t);
  const u = t - T.taumelt;
  out.set(
    START.x + 0.35 * Math.sin(u * 1.3) * a,
    fallY(t),
    lerp(START.z, WALK_Z, smooth(clamp01(t / T.und))) + 0.2 * Math.sin(u * 1.0) * a,
  );
  return out;
}
function coinRot(t) {
  if (t >= TI) {
    const dt = t - TI;
    if (dt < BOUNCE_T) return [dt * 16, 0, dt * 5];
    const s = Math.exp(-(dt - BOUNCE_T) * 6);
    return [Math.PI * 4 * 0 + s * 0.25 * Math.sin(dt * 30), 0, 0];
  }
  if (t < -0.3) return [Math.PI / 2, 0, 0.2];
  if (t < T.taumelt) return [Math.PI / 2 + (t + 0.3) * 11, 0.3, 0.25];
  // like a leaf: rocks and tilts, flat-ish in the parachute / forces beat
  const calm = 1 - 0.8 * ramp(t, T.der3 - 0.3, T.der3) * (1 - ramp(t, T.darum, T.darum + 0.4));
  const amp = 0.95 * calm;
  return [amp * Math.sin(t * 3.3), t * 0.9, amp * 0.6 * Math.sin(t * 2.1 + 1)];
}
// a frame that follows the coin without its spin (arrows, canopy, streaks)
const follower = new THREE.Group();
scene.add(follower);
const COIN_REL = V(0, 0, 0);

// streaks rushing up past the falling coin
const STREAKS = 70;
const streakIM = new THREE.InstancedMesh(
  new THREE.BoxGeometry(0.012, 0.6, 0.012),
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  }),
  STREAKS,
);
streakIM.frustumCulled = false;
follower.add(streakIM);
const streakSeed = (() => {
  const r = rng(91);
  return Array.from({ length: STREAKS }, () => {
    const a = r() * Math.PI * 2;
    const d = 0.45 + r() * 2.0;
    return [Math.cos(a) * d, r() * 6, Math.sin(a) * d];
  });
})();
const dummy = new THREE.Object3D();
// streak speed (units/s relative to the coin) per moment
function streakPhase(t) {
  // integrated speed so the streaks never jump within a shot
  const v0 = 5;
  if (t < T.jede) return t * v0;
  if (t < T.ohne) {
    const u = t - T.jede;
    return T.jede * v0 + u * v0 + u * u * 6; // faster every second
  }
  return T.jede * v0 + (T.ohne - T.jede) * v0 + (T.ohne - T.jede) ** 2 * 6 + (t - T.ohne) * 3.2;
}

// ---------------------------------------------------------------- people
const SKIN = 0xf1c09a;
function makePerson({ coat, pants, hat, hair = 0x3a2418, skin = SKIN, seed = 1 }) {
  const g = new THREE.Group();
  scene.add(g);
  const coatMat = flat(coat, { roughness: 0.75 });
  const pantMat = flat(pants, { roughness: 0.8 });
  const skinMat = flat(skin, { roughness: 0.7 });
  const shoeMat = flat(0x2b2a33);
  const legs = [];
  for (const s of [-1, 1]) {
    const leg = new THREE.Group();
    leg.position.set(s * 0.11, 0.95, 0);
    g.add(leg);
    mesh(
      jitter(new THREE.BoxGeometry(0.17, 0.88, 0.19), 0.01, seed + s),
      pantMat,
      0,
      -0.44,
      0,
      leg,
    );
    mesh(new THREE.BoxGeometry(0.18, 0.1, 0.3), shoeMat, 0, -0.9, 0.05, leg);
    legs.push(leg);
  }
  const torso = mesh(
    facet(jitter(new THREE.CylinderGeometry(0.21, 0.25, 0.68, 8), 0.012, seed), 0.08, seed),
    facetMat(coatMat),
    0,
    1.27,
    0,
    g,
  );
  torso.scale.z = 0.62;
  const arms = [];
  for (const s of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(s * 0.29, 1.53, 0);
    g.add(arm);
    mesh(
      jitter(new THREE.BoxGeometry(0.13, 0.58, 0.14), 0.008, seed + 3 + s),
      coatMat,
      0,
      -0.29,
      0,
      arm,
    );
    mesh(new THREE.SphereGeometry(0.07, 8, 6), skinMat, 0, -0.62, 0, arm);
    arms.push(arm);
  }
  const head = new THREE.Group();
  head.position.set(0, 1.6, 0);
  g.add(head);
  mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.1, 8), skinMat, 0, 0.03, 0, head);
  mesh(
    facet(jitter(new THREE.IcosahedronGeometry(0.17, 1), 0.008, seed + 7), 0.05, seed),
    facetMat(skinMat),
    0,
    0.2,
    0,
    head,
  );
  const eyeMat = flat(0x1c1820);
  for (const s of [-1, 1])
    mesh(new THREE.SphereGeometry(0.022, 6, 4), eyeMat, s * 0.065, 0.22, 0.15, head, false);
  mesh(new THREE.SphereGeometry(0.03, 6, 4), skinMat, 0, 0.17, 0.17, head, false);
  if (hat) {
    const beanie = mesh(
      new THREE.SphereGeometry(0.185, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2),
      flat(hat, { roughness: 0.9 }),
      0,
      0.24,
      -0.01,
      head,
    );
    beanie.scale.y = 0.95;
    mesh(
      new THREE.TorusGeometry(0.175, 0.035, 5, 14),
      flat(hat, { roughness: 0.9 }),
      0,
      0.25,
      -0.01,
      head,
    ).rotation.x = Math.PI / 2;
    mesh(new THREE.SphereGeometry(0.05, 6, 4), flat(0xffffff), 0, 0.43, -0.01, head);
  } else {
    const h = mesh(
      new THREE.SphereGeometry(0.18, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2),
      flat(hair),
      0,
      0.23,
      -0.02,
      head,
    );
    h.rotation.x = -0.25;
  }
  return { g, legs, arms, head, torso };
}
function walkPose(p, phase, amp) {
  const s = Math.sin(phase) * 0.55 * amp;
  p.legs[0].rotation.x = s;
  p.legs[1].rotation.x = -s;
  p.arms[0].rotation.x = -s * 0.8;
  p.arms[1].rotation.x = s * 0.8;
  p.g.position.y = Math.abs(Math.cos(phase)) * 0.03 * amp;
}

// the passer-by: orange coat, mustard beanie, phone in the right hand
const walker = makePerson({ coat: 0xff7a3d, pants: 0x34507f, hat: 0xffc83a, seed: 3 });
const phone = mesh(
  new THREE.BoxGeometry(0.09, 0.02, 0.16),
  flat(0x1f2230, { roughness: 0.2 }),
  0,
  -0.66,
  0.06,
  walker.arms[1],
);
const phoneScreen = mesh(
  new THREE.BoxGeometry(0.075, 0.005, 0.13),
  flat(0x9fd8ff, { emissive: 0x5fb8ff, emissiveIntensity: 0.9 }),
  0,
  -0.648,
  0.06,
  walker.arms[1],
  false,
);
// umbrella for the rain (Übrigens)
const umbrella = new THREE.Group();
walker.g.add(umbrella);
{
  const canopy = mesh(
    facet(new THREE.ConeGeometry(0.8, 0.34, 8, 1, true), 0.06, 4),
    facetMat(flat(0x2f6fd6, { side: THREE.DoubleSide, roughness: 0.5 })),
    0,
    0,
    0,
    umbrella,
  );
  canopy.position.y = 0.17;
  mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.9, 5), M.steel, 0, -0.3, 0, umbrella);
  mesh(new THREE.SphereGeometry(0.03, 6, 4), flat(0x2f6fd6), 0, 0.36, 0, umbrella);
}
umbrella.position.set(-0.22, 2.25, 0.05);

// walking along the sidewalk, stops under the coin's line
const WALK_X0 = -10;
const WALK_X1 = 0.6;
const walkR = (t) => ramp(t, 0.6, 19.0);
const walkX = (t) => lerp(WALK_X0, WALK_X1, easeOut(walkR(t)));
const WALKER_REL = V(0, 0, 0);
const headW = V(0, 0, 0);

// background pedestrians on the far sidewalk
const crowd = [
  [makePerson({ coat: 0x5a4f9a, pants: 0x2b2f3a, seed: 11 }), 1, 6.0, 1.1, 0],
  [makePerson({ coat: 0x2f9e8f, pants: 0x3b3340, hair: 0x9a5a2a, seed: 12 }), -1, 6.4, 1.0, 37],
  [makePerson({ coat: 0xe2453c, pants: 0x34507f, hat: 0x2b2f3a, seed: 13 }), 1, 5.6, 0.9, 61],
  [makePerson({ coat: 0xc9b3d9, pants: 0x2b2a33, hair: 0x2b1a12, seed: 14 }), -1, -3.4, 1.0, 18],
];

// the cyclist (Rate mal: "wie ein Radfahrer bergab")
const rider = makePerson({ coat: 0x3fae5a, pants: 0x2b2f3a, hat: 0xe2453c, seed: 21 });
const bikeG = new THREE.Group();
scene.add(bikeG);
{
  const frame = flat(0xff3b6b, { roughness: 0.35, metalness: 0.3 });
  const bar = (x1, y1, x2, y2) => {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const m = mesh(
      new THREE.CylinderGeometry(0.03, 0.03, len, 5),
      frame,
      (x1 + x2) / 2,
      (y1 + y2) / 2,
      0,
      bikeG,
    );
    m.rotation.z = Math.atan2(x1 - x2, y2 - y1);
  };
  bar(-0.55, 0.36, -0.05, 0.36);
  bar(-0.05, 0.36, 0.45, 0.8);
  bar(-0.55, 0.36, -0.15, 0.8);
  bar(-0.15, 0.8, 0.45, 0.8);
  bar(0.55, 0.36, 0.45, 0.95);
  bar(-0.05, 0.36, -0.15, 0.85);
  mesh(new THREE.BoxGeometry(0.26, 0.05, 0.12), M.rubber, -0.15, 0.87, 0, bikeG);
  mesh(new THREE.BoxGeometry(0.05, 0.05, 0.55), frame, 0.45, 0.95, 0, bikeG);
}
const wheels = [-0.55, 0.55].map((x) => {
  const w = new THREE.Group();
  w.position.set(x, 0.36, 0);
  bikeG.add(w);
  mesh(new THREE.TorusGeometry(0.33, 0.045, 6, 16), M.rubber, 0, 0, 0, w);
  for (let k = 0; k < 3; k++) {
    const sp = mesh(new THREE.BoxGeometry(0.62, 0.015, 0.015), M.steel, 0, 0, 0, w, false);
    sp.rotation.z = (k / 3) * Math.PI;
  }
  return w;
});
rider.g.rotation.y = Math.PI / 2;
const RIDER_REL = V(0, 0, 0);
const riderX = (t) => -11 + (t - T.wie4) * 7.5;

// ---------------------------------------------------------------- your hand (frame 0)
const hand = createHand({ scale: 0.62, sleeve: 0x2f9e8f });

// ---------------------------------------------------------------- the Eiffel Tower (comparison)
const EIFFEL = V(13.8, 0, -5.6);
const eiffel = new THREE.Group();
scene.add(eiffel);
{
  const iron = flat(0x9a6240, { roughness: 0.6, metalness: 0.25 });
  const ironD = flat(0x7a4a30, { roughness: 0.6, metalness: 0.25 });
  const leg = (x0, z0, x1, z1, y0, y1, w0, w1) => {
    const len = Math.hypot(x1 - x0, y1 - y0, z1 - z0);
    const geo = new THREE.CylinderGeometry(w1, w0, len, 4, 1);
    geo.rotateY(Math.PI / 4);
    const m = mesh(geo, iron, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, eiffel);
    m.lookAt(V(x1, y1, z1).add(EIFFEL));
    m.quaternion.setFromUnitVectors(V(0, 1, 0), V(x1 - x0, y1 - y0, z1 - z0).normalize());
    return m;
  };
  const S = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ];
  for (const [sx, sz] of S) {
    leg(sx * 4.0, sz * 4.0, sx * 1.6, sz * 1.6, 0, 11.5, 0.75, 0.45);
    leg(sx * 1.6, sz * 1.6, sx * 0.75, sz * 0.75, 11.5, 21, 0.4, 0.28);
    leg(sx * 0.75, sz * 0.75, sx * 0.18, sz * 0.18, 21, 31, 0.26, 0.12);
  }
  // lattice: crosses between the lower legs
  for (let i = 0; i < 4; i++) {
    const [ax, az] = S[i];
    const [bx, bz] = S[(i + 1) % 4];
    for (const [y0, y1, k0, k1] of [
      [2.5, 6.5, 3.4, 2.6],
      [6.5, 10.5, 2.6, 1.8],
      [13, 17, 1.4, 1.0],
    ]) {
      leg(ax * k0, az * k0, bx * k1, bz * k1, y0, y1, 0.1, 0.1);
      leg(bx * k0, bz * k0, ax * k1, az * k1, y0, y1, 0.1, 0.1);
    }
  }
  // arches + platforms
  for (let i = 0; i < 4; i++) {
    const arch = mesh(new THREE.TorusGeometry(2.6, 0.22, 4, 14, Math.PI), ironD, 0, 3.0, 0, eiffel);
    arch.scale.y = 1.2;
    arch.rotation.y = (i * Math.PI) / 2;
    arch.position.set(Math.sin((i * Math.PI) / 2) * 3.3, 3.0, Math.cos((i * Math.PI) / 2) * 3.3);
  }
  mesh(new THREE.BoxGeometry(4.4, 0.7, 4.4), ironD, 0, 11.5, 0, eiffel);
  mesh(new THREE.BoxGeometry(2.0, 0.55, 2.0), ironD, 0, 21, 0, eiffel);
  mesh(new THREE.BoxGeometry(0.7, 0.8, 0.7), ironD, 0, 31.2, 0, eiffel);
  mesh(new THREE.CylinderGeometry(0.05, 0.12, 3, 5), M.steel, 0, 33.2, 0, eiffel);
  const lightTop = mesh(
    new THREE.SphereGeometry(0.22, 8, 6),
    flat(0xfff2b0, { emissive: 0xffd060, emissiveIntensity: 1.4 }),
    0,
    34.7,
    0,
    eiffel,
    false,
  );
  lightTop.castShadow = false;
}
eiffel.position.copy(EIFFEL);

// ---------------------------------------------------------------- ghost coin racing the ICE
const ghost = new THREE.Group();
scene.add(ghost);
{
  const gold = new THREE.MeshStandardMaterial({
    color: 0xffc23a,
    emissive: 0xff9a10,
    emissiveIntensity: 0.55,
    metalness: 0.6,
    roughness: 0.25,
    flatShading: true,
  });
  const d = mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.14, 28), gold, 0, 0, 0, ghost);
  d.rotation.x = Math.PI / 2;
  const ring = mesh(
    new THREE.TorusGeometry(0.72, 0.035, 4, 28),
    copperDark,
    0,
    0,
    0.075,
    ghost,
    false,
  );
  ring.rotation.z = 0;
  mesh(new THREE.BoxGeometry(0.14, 0.62, 0.03), copperDark, 0.08, 0, 0.08, ghost, false);
}
const ghostLines = new THREE.InstancedMesh(
  new THREE.BoxGeometry(1, 0.03, 0.03),
  new THREE.MeshBasicMaterial({
    color: 0xfff2c0,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
  }),
  14,
);
ghostLines.frustumCulled = false;
scene.add(ghostLines);

// ---------------------------------------------------------------- the leaf (tumbling like it)
const leafShape = new THREE.Shape();
leafShape.moveTo(0, -0.22);
leafShape.quadraticCurveTo(0.17, -0.05, 0, 0.24);
leafShape.quadraticCurveTo(-0.17, -0.05, 0, -0.22);
const leaf = mesh(
  new THREE.ShapeGeometry(leafShape, 6),
  flat(0xe8822a, { side: THREE.DoubleSide, roughness: 0.7 }),
  0,
  0,
  0,
  scene,
);
mesh(new THREE.BoxGeometry(0.01, 0.42, 0.012), flat(0xb35a1a), 0, 0, 0.004, leaf, false);

// ---------------------------------------------------------------- air + forces
const airArrows = makeArrowSet(
  [
    [V(-0.3, -1.25, 0.05), V(-0.25, -0.28, 0.05)],
    [V(0.3, -1.3, -0.05), V(0.25, -0.28, -0.05)],
    [V(0.02, -1.4, 0.25), V(0.02, -0.3, 0.2)],
  ],
  { parent: follower, mat: coldMat, amp: 0.06 },
);
const upArrow = makeArrowSet([[V(0, 0.12, 0), V(0, 0.85, 0)]], {
  parent: follower,
  mat: coldMat,
  amp: 0,
  r: 0.045,
});
const downArrow = makeArrowSet([[V(0, -0.12, 0), V(0, -0.85, 0)]], {
  parent: follower,
  mat: forceMat,
  amp: 0,
  r: 0.045,
});

// ---------------------------------------------------------------- the mini parachute
const chute = new THREE.Group();
follower.add(chute);
{
  const geo = new THREE.SphereGeometry(0.62, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2.4);
  const cols = [];
  const c = new THREE.Color();
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const a = Math.atan2(p.getZ(i), p.getX(i));
    c.set(Math.floor(((a + Math.PI) / (Math.PI * 2)) * 8) % 2 ? 0xffffff : 0xff4d5a);
    cols.push(c.r, c.g, c.b);
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
  const canopy = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88,
      roughness: 0.7,
      flatShading: true,
    }),
  );
  canopy.position.y = 0.38;
  chute.add(canopy);
  const pts = [];
  const rimY = 0.38 + 0.62 * Math.cos(Math.PI / 2.4);
  const rimR = 0.62 * Math.sin(Math.PI / 2.4);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    pts.push(
      V(Math.cos(a) * rimR, rimY, Math.sin(a) * rimR),
      V(Math.cos(a) * COIN_R * 0.9, 0.02, Math.sin(a) * COIN_R * 0.9),
    );
  }
  chute.add(
    new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0xffffff }),
    ),
  );
}

// ---------------------------------------------------------------- the trail of the fall
const TRAIL = 110;
const trailIM = new THREE.InstancedMesh(
  new THREE.SphereGeometry(0.16, 6, 4),
  flat(0xffd23f, { emissive: 0xffb020, emissiveIntensity: 1.1 }),
  TRAIL,
);
trailIM.frustumCulled = false;
scene.add(trailIM);
const tmpP = V(0, 0, 0);

// ---------------------------------------------------------------- the pen
const pen = new THREE.Group();
scene.add(pen);
{
  const body = flat(0x2d5bd6, { roughness: 0.35 });
  mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.5, 8), body, 0, 0.05, 0, pen);
  mesh(
    new THREE.ConeGeometry(0.045, 0.12, 8),
    flat(0xe8edf2, { metalness: 0.6, roughness: 0.3 }),
    0,
    -0.26,
    0,
    pen,
  ).rotation.x = Math.PI;
  mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.1, 8), flat(0x1f2a55), 0, 0.33, 0, pen);
  mesh(new THREE.BoxGeometry(0.02, 0.22, 0.03), M.chrome, 0.05, 0.24, 0, pen);
}
const penTrail = mesh(
  new THREE.CylinderGeometry(0.04, 0.005, 1, 6, 1, true),
  new THREE.MeshBasicMaterial({
    color: 0xcfe3ff,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  }),
  0,
  0,
  0,
  scene,
  false,
);
const PEN_Y0 = 9;
const PEN_LAND = 0.73 + 0.48 - 0.15; // pen centre when the tip is in the soil
const PEN_A = (2 * (PEN_Y0 - PEN_LAND)) / (T.voran - T.nur) ** 2;
const penW = V(0, 0, 0);

// ---------------------------------------------------------------- ouch: text + stars
const ouchTex = canvasTex(512, 220, (g) => {
  g.font = '800 120px "Montserrat", sans-serif';
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.lineWidth = 22;
  g.strokeStyle = "rgba(28,16,36,0.9)";
  g.lineJoin = "round";
  g.strokeText("AUTSCH!", 256, 112);
  g.fillStyle = "#ffd23f";
  g.fillText("AUTSCH!", 256, 112);
});
const ouch = new THREE.Sprite(
  new THREE.SpriteMaterial({ map: ouchTex, transparent: true, depthTest: false, fog: false }),
);
ouch.renderOrder = 10;
scene.add(ouch);
const starTex = canvasTex(64, 64, (g) => {
  g.fillStyle = "#ffe066";
  g.strokeStyle = "rgba(40,20,10,.8)";
  g.lineWidth = 4;
  g.beginPath();
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2 - Math.PI / 2;
    const rr = k % 2 ? 12 : 28;
    g.lineTo(32 + Math.cos(a) * rr, 32 + Math.sin(a) * rr);
  }
  g.closePath();
  g.fill();
  g.stroke();
});
const stars = [0, 1, 2].map(() => {
  const s = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: starTex, transparent: true, depthTest: false, fog: false }),
  );
  s.renderOrder = 11;
  scene.add(s);
  return s;
});

// ---------------------------------------------------------------- rain
const RAIN = 1500;
const rainIM = new THREE.InstancedMesh(
  new THREE.BoxGeometry(0.014, 0.34, 0.014),
  new THREE.MeshBasicMaterial({
    color: 0xdbe6ff,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  }),
  RAIN,
);
rainIM.frustumCulled = false;
scene.add(rainIM);
const rainSeed = (() => {
  const r = rng(77);
  return Array.from({ length: RAIN }, () => [-7 + r() * 15, r(), -6 + r() * 13]);
})();
const SPL = 160;
const splashIM = new THREE.InstancedMesh(
  new THREE.TorusGeometry(0.09, 0.012, 3, 12),
  new THREE.MeshBasicMaterial({
    color: 0xeef4ff,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
  }),
  SPL,
);
splashIM.frustumCulled = false;
scene.add(splashIM);
const splashSeed = (() => {
  const r = rng(78);
  return Array.from({ length: SPL }, () => [-4 + r() * 9, r(), -4.2 + r() * 5.5]);
})();

// ---------------------------------------------------------------- camera
// follow tags in beats.js → live rel vectors
for (const s of shots) {
  if (s.follow === "coin") s.rel = COIN_REL;
  if (s.follow === "walker") s.rel = WALKER_REL;
  if (s.follow === "rider") s.rel = RIDER_REL;
}
const applyCamera = shotCamera(shots);
const focus = V(0, 0, 0);
function shotFocus(t) {
  let i = shots.length - 1;
  while (i > 0 && shots[i].at > t) i--;
  const s = shots[i];
  focus.set(...s.look);
  if (s.rel) focus.add(s.rel);
  // looking straight down / up: keep the shadow box near the camera
  if (s.follow === "coin" && s.look[1] < -5) focus.copy(COIN_REL).add(V(0, -6, 0));
  return focus;
}

// label anchors
const LP = {
  head: V(0, 0, 0),
  walkerTop: V(0, 0, 0),
  eiffel: EIFFEL.clone().add(V(-1.0, 16, 0)),
  air: V(0, 0, 0),
  up: V(0, 0, 0),
  down: V(0, 0, 0),
  pen: V(0, 0, 0),
};
const LIST = LABELS.map((l) => (typeof l.pos === "string" ? { ...l, pos: LP[l.pos] } : l));

// ---------------------------------------------------------------- render
function renderAt(t) {
  // --- the coin
  coinPos(t, coinP);
  coin.position.copy(coinP);
  const [rx, ry, rz] = coinRot(t);
  coin.rotation.set(rx, ry, rz);
  if (t < -0.3) coin.position.copy(START);
  COIN_REL.copy(coin.position);
  follower.position.copy(coin.position);
  // streaks in the close coin shots while it falls
  const followCoin = shots.some(
    (s, i) => s.follow === "coin" && t >= s.at && (i + 1 >= shots.length || t < shots[i + 1].at),
  );
  streakIM.visible = followCoin && t < TI && !(t >= T.was && t < T.rate);
  if (streakIM.visible) {
    const ph = streakPhase(t);
    const len = t >= T.jede && t < T.ohne ? 0.6 + (t - T.jede) * 0.9 : 0.6;
    for (let i = 0; i < STREAKS; i++) {
      const [x, s, z] = streakSeed[i];
      dummy.position.set(x, ((((s + ph * 0.18) % 1) + 1) % 1) * 6 - 3, z);
      dummy.scale.set(1, len, 1);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      streakIM.setMatrixAt(i, dummy.matrix);
    }
    streakIM.instanceMatrix.needsUpdate = true;
  }

  // --- your hand lets go of the coin on frame 0
  hand.track(t, [
    { t: -1.2, pos: [0.6, H + 1.95, -4.35], rot: [0.55, 0, 0], pose: "grab" },
    { t: -0.35, pos: [0.6, H + 1.8, -4.12], rot: [0.5, 0, 0], pose: "grab" },
    { t: 0.0, pos: [0.6, H + 1.86, -4.1], rot: [0.32, 0, 0], pose: "open" },
    { t: 0.9, pos: [0.6, H + 1.9, -4.15], rot: [0.22, 0, 0], pose: "open" },
    { t: T.wolkenkratzer, pos: [0.6, H + 1.9, -4.2], rot: [0.2, 0, 0], pose: "open", out: true },
  ]);

  // --- the passer-by
  {
    const x = walkX(t);
    const v = (walkX(t + 0.02) - walkX(t)) / 0.02;
    const moving = clamp01(v / 0.4);
    walker.g.position.set(x, 0, WALK_Z);
    walkPose(walker, x * 3.2, moving);
    // turns to the street once he stops
    const turn = smooth(ramp(t, 18.4, 19.4));
    walker.g.rotation.y = lerp(Math.PI / 2, 0.15, turn);
    // phone: right arm up in front, head down
    const hit = ramp(t, TI, TI + 0.12);
    const phoneUp = 1 - ramp(t, TI + 0.1, TI + 0.6);
    walker.arms[1].rotation.x = lerp(walker.arms[1].rotation.x, -0.9, phoneUp);
    walker.arms[1].rotation.z = 0.25 * phoneUp;
    phone.visible = phoneScreen.visible = t < T.fakt;
    // head: looks down at the phone → jolts on the hit → looks up, annoyed
    const look = lerp(
      0.35,
      -0.5,
      smooth(ramp(t, T.voellig + 0.1, T.voellig + 0.6)) * (1 - ramp(t, T.nur, T.nur + 0.5)),
    );
    const jolt = Math.sin(clamp01((t - TI) / 0.35) * Math.PI) * 0.45 * hit;
    walker.head.rotation.x = look + jolt;
    walker.head.rotation.y = 0.25 * Math.sin(t * 0.7) * (1 - turn);
    // left hand: rubs the head after the hit, later holds the umbrella
    const rub =
      smooth(ramp(t, TI + 0.15, TI + 0.45)) * (1 - smooth(ramp(t, T.nur - 0.3, T.nur + 0.2)));
    const umb = smooth(ramp(t, T.fakt + 0.2, T.fakt + 0.6));
    if (rub > 0 || umb > 0) {
      walker.arms[0].rotation.x = lerp(
        walker.arms[0].rotation.x,
        -2.75 + 0.12 * Math.sin(t * 14),
        rub,
      );
      walker.arms[0].rotation.z = lerp(0, -0.55, rub);
      walker.arms[0].rotation.x = lerp(walker.arms[0].rotation.x, -2.4, umb);
      walker.arms[0].rotation.z = lerp(walker.arms[0].rotation.z, -0.15, umb);
    } else walker.arms[0].rotation.z = 0;
    umbrella.visible = t >= T.fakt + 0.35;
    umbrella.scale.copy(squash(t, T.fakt + 0.35));
    walker.g.updateMatrixWorld();
    walker.head.getWorldPosition(headW);
    LP.head.copy(headW).add(V(0, 0.22, 0));
    LP.walkerTop.copy(headW).add(V(0, 0.45, 0));
    WALKER_REL.set(x, 0, WALK_Z);
  }
  // crowd on the far sidewalk
  for (const [p, dir, z, v, ph] of crowd) {
    const x = ((((t * v + ph) % 70) + 70) % 70) - 35;
    p.g.position.set(dir * x, 0, z);
    p.g.rotation.y = (dir * Math.PI) / 2;
    walkPose(p, x * 3.2, 1);
  }
  // cyclist
  {
    const on = t > T.wie4 - 0.3 && t < T.der3 + 0.3;
    rider.g.visible = bikeG.visible = on;
    const x = on ? riderX(t) : -80;
    bikeG.position.set(x, 0.04, 2.0);
    rider.g.position.set(x - 0.12, -0.06, 2.0);
    const pedal = x * 2.8;
    rider.legs[0].rotation.x = -0.75 + 0.38 * Math.sin(pedal);
    rider.legs[1].rotation.x = -0.75 - 0.38 * Math.sin(pedal);
    rider.arms[0].rotation.x = rider.arms[1].rotation.x = -1.25;
    rider.head.rotation.x = 0.1;
    wheels.forEach((w) => (w.rotation.z = -x / 0.33));
    RIDER_REL.set(x, 0, 2.0);
  }

  // --- Eiffel Tower rises next to the skyscraper
  eiffel.visible = t >= T.eiffel && t < T.jede;
  eiffel.scale.copy(squash(t, T.eiffel, 0.8));
  puff("eiffel", t, T.eiffel + 0.2, EIFFEL.x, 0.2, EIFFEL.z + 3, 5);

  // --- the ghost coin keeps up with the ICE
  {
    const on = t >= T.ohne && t < T.doch;
    ghost.visible = ghostLines.visible = on;
    if (on) {
      const x = iceX(t) + 2.1;
      ghost.position.set(x, 1.55, TRACK_Z + 2.6);
      ghost.rotation.z = -x / 0.85;
      for (let i = 0; i < 14; i++) {
        const y = 0.9 + (i % 7) * 0.2;
        const len = 2.5 + ((i * 37) % 10) * 0.25;
        dummy.position.set(
          x - 1.2 - len / 2 - (i % 3) * 0.6,
          y,
          TRACK_Z + 2.6 + (i < 7 ? 0.2 : -0.2),
        );
        dummy.scale.set(len, 1, 1);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        ghostLines.setMatrixAt(i, dummy.matrix);
      }
      ghostLines.instanceMatrix.needsUpdate = true;
    }
  }

  // --- the leaf next to the tumbling coin
  leaf.visible = t >= T.doch && t < T.ab;
  if (leaf.visible) {
    const u = t - T.doch;
    leaf.position
      .copy(coin.position)
      .add(V(0.48 + 0.12 * Math.sin(u * 2.2), 0.12 + 0.1 * Math.sin(u * 3.1), 0.22));
    leaf.rotation.set(0.9 * Math.sin(u * 2.9), u * 1.2, 0.7 * Math.sin(u * 2.3 + 1));
    leaf.scale.setScalar(0.6);
  }

  // --- air pushes up / the forces
  animateArrows(airArrows, t, pop(t, T.ab + 0.05, T.was) + pop(t, T.flach, T.die3));
  animateArrows(upArrow, t, pop(t, T.luft2, T.darum));
  animateArrows(downArrow, t, pop(t, T.erde - 0.1, T.darum));
  LP.air.copy(coin.position).add(V(-0.28, -0.85, 0.05));
  LP.up.copy(coin.position).add(V(0, 0.75, 0));
  LP.down.copy(coin.position).add(V(0, -0.75, 0));

  // --- parachute
  chute.visible = t >= T.fallschirm && t < T.die3 + 0.3;
  chute.scale.copy(squash(t, T.fallschirm, 0.6)).multiplyScalar(0.7);
  chute.rotation.set(0.12 * Math.sin(t * 2), 0, 0.1 * Math.sin(t * 1.7));

  // --- golden trail of the fall (half a minute)
  {
    const k = pop(t, T.darum + 0.05, T.und);
    trailIM.visible = k > 0;
    if (k > 0) {
      for (let i = 0; i < TRAIL; i++) {
        const tau = (i / (TRAIL - 1)) * t;
        coinPos(tau, tmpP);
        const s = k * (0.55 + 0.45 * (i / TRAIL));
        dummy.position.copy(tmpP);
        dummy.scale.setScalar(s);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        trailIM.setMatrixAt(i, dummy.matrix);
      }
      trailIM.instanceMatrix.needsUpdate = true;
    }
  }

  // --- impact: ouch + stars
  {
    const k = pop(t, TI + 0.04, TI + 1.5, 0.25);
    ouch.visible = k > 0;
    ouch.position.copy(headW).add(V(0.5, 0.42, 0.35));
    ouch.scale.set(0.6 * k, 0.26 * k, 1);
    stars.forEach((s, i) => {
      const a = (t - TI) * 5 + (i * Math.PI * 2) / 3;
      s.visible = k > 0;
      s.position
        .copy(headW)
        .add(V(Math.cos(a) * 0.32, 0.38 + 0.05 * Math.sin(a * 2), Math.sin(a) * 0.32));
      s.scale.setScalar(0.13 * k);
    });
  }

  // --- the pen falls tip first and sticks in the planter
  {
    const on = t >= T.nur - 0.05;
    pen.visible = on;
    const dt = Math.max(0, t - T.nur);
    const landed = t >= T.voran;
    const y = landed ? PEN_LAND : PEN_Y0 - 0.5 * PEN_A * dt * dt;
    const w = landed ? Math.exp(-(t - T.voran) * 6) * Math.sin((t - T.voran) * 32) * 0.16 : 0;
    pen.position.set(PLANTER[0] + 0.45, y, PLANTER[1] + 0.1);
    pen.scale.setScalar(1.5);
    pen.rotation.set(0, 0, w);
    penW.copy(pen.position);
    LP.pen.copy(pen.position).add(V(0, 0.2, 0));
    const speed = PEN_A * dt;
    penTrail.visible = on && !landed && dt > 0.05;
    const L = Math.min(4, speed * 0.12);
    penTrail.scale.set(1, L, 1);
    penTrail.position.set(pen.position.x, y + 0.35 + L / 2, pen.position.z);
    puff("pen", t, T.voran, PLANTER[0] + 0.45, 0.8, PLANTER[1] + 0.05, 0.7, 0x8a6a4a);
    showNope(pop(t, T.den, T.fakt), PLANTER[0] + 0.45, 2.1, PLANTER[1] + 0.3, 0.55);
  }

  // --- rain (Übrigens)
  {
    const k = smooth(ramp(t, T.fakt - 0.1, T.fakt + 0.9));
    rainIM.visible = splashIM.visible = k > 0;
    if (k > 0) {
      const n = Math.floor(RAIN * k);
      for (let i = 0; i < RAIN; i++) {
        const [x, s, z] = rainSeed[i];
        const y = i < n ? 10 - ((((s * 10 + t * 15) % 10) + 10) % 10) : -50;
        dummy.position.set(x + (y - 5) * 0.04, y, z);
        dummy.scale.set(1, 1, 1);
        dummy.rotation.set(0, 0, -0.04);
        dummy.updateMatrix();
        rainIM.setMatrixAt(i, dummy.matrix);
      }
      rainIM.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < SPL; i++) {
        const [x, s, z] = splashSeed[i];
        const c = (((s + t * 2.4) % 1) + 1) % 1;
        dummy.position.set(x, 0.12, z);
        dummy.rotation.set(Math.PI / 2, 0, 0);
        dummy.scale.setScalar(i < SPL * k ? 0.3 + c * 1.6 : 0.0001);
        dummy.updateMatrix();
        splashIM.setMatrixAt(i, dummy.matrix);
      }
      splashIM.instanceMatrix.needsUpdate = true;
    }
    key.intensity = KEY_I * (1 - 0.35 * k);
  }

  // --- displays
  {
    const gk = pop(t, T.rate + 0.15, T.vierzig + 0.35);
    const v =
      40 * easeOut(ramp(t, T.rate + 0.25, T.vierzig)) +
      1.6 * Math.sin(t * 23) * (1 - ramp(t, T.vierzig - 0.4, T.vierzig));
    gauge("tempo", gk, {
      label: "Tempo des Cents",
      value: v,
      max: 60,
      unit: "km/h",
      x: 352,
      y: 1150,
    });
    readout("rad", pop(t, T.radfahrer, T.der3), {
      label: "Radfahrer bergab",
      value: 40,
      unit: "km/h",
      x: 60,
      y: 1150,
    });
    stopwatch("fall", pop(t, T.darum + 0.1, T.und), {
      seconds: 25 * smooth(ramp(t, T.darum + 0.15, T.minute + 0.6)),
      max: 30,
      label: "Fallzeit",
      x: 640,
      y: 480,
    });
  }
  if (t >= T.vierzig && t < T.wie4)
    showPanel(pop(t, T.vierzig, T.wie4), "ENDTEMPO", "40 km/h", LED.yellow);
  else if (t >= T.harmlos && t < T.nur)
    showPanel(pop(t, T.harmlos, T.nur), "TREFFER", "HARMLOS", LED.green);
  else if (t >= T.fuenfhundert && t < T.folge)
    showPanel(pop(t, T.fuenfhundert, T.folge - 0.05), "REGEN OHNE LUFT", "500 km/h", LED.red);
  else showPanel(0);

  labels(t, LIST);
  applyCamera(t);
  // the sun's shadow box follows the shot
  shotFocus(t);
  key.target.position.copy(focus);
  key.position.copy(focus).addScaledVector(KEY_DIR, 60);
  key.target.updateMatrixWorld();
  // coin sparkle: only when the coin is far away (after the camera moved)
  const camD = camera.position.distanceTo(coin.position);
  glint.visible = t < TI && camD > 6;
  glint.position.copy(coin.position);
  glint.scale.setScalar(camD * 0.07 * (0.85 + 0.15 * Math.sin(t * 9)));
  renderFrame();
}
start(renderAt);
