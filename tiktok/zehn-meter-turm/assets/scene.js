// #65 "10-Meter-Turm" (Format B) — you belly-flop from the 10 m tower.
// Cold open: you, flat in the air just above the water, then SPLASH. The
// water turns to concrete ("Wand"). The story: the hall, everybody looks
// up, you lose your balance, tip over and fall — speed gauge to 50 km/h —
// and the whole belly slaps at once (slowmo). Rate mal (underwater replay):
// the water beads under the belly have no time to move away; force arrows
// push back; you roll over, the belly glows red, the air goes. The pro
// dives straight, flat hands punch a hole, the body slides through; the
// beads part slowly ("träge"). Übrigens: bubble nozzles on the pool floor
// fill the water with air, you land softly in the foam.
import {
  THREE,
  ramp,
  smooth,
  easeInOut,
  pop,
  lerp,
  clamp01,
  V,
  rng,
  scene,
  real,
  roundedBox,
  makeArrowSet,
  animateArrows,
  forceMat,
  showPanel,
  LED,
  labels,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { waterMat, waveSources, PLATFORM } from "./set.js";
import { gauge, readout, meter } from "./hud.js";
import { T, K, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);

const mesh = (geo, mat, parent, x = 0, y = 0, z = 0, shadow = true) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};

const LAND = V(0, 0, 0.6); // where your belly hits
const PRO_X = 0.9; // where the pro goes in
const PRO_Z = 0.3;
const S = 0.9; // body scale (≈ 1.76 m)
const FEET = 1.18 * S; // root (navel) above the soles when standing

// ================================================================ the diver
function makeDiver({ skin = 0xf0bf98, suit = 0xe8343a, hair = 0x3a2618, cap = null }) {
  const outer = new THREE.Group(); // position + roll (rotation.z)
  const root = new THREE.Group(); // pitch (rotation.x)
  outer.add(root);
  root.scale.setScalar(S);
  scene.add(outer);
  const skinM = real.skin ? real.skin(skin) : real.plastic(skin, { roughness: 0.6 });
  const bodyM = skinM.clone(); // torso + thighs: turns red
  const suitM = real.fabric(suit);
  const dark = real.gloss(0x17110e, { roughness: 0.2 });
  // trunks + torso
  mesh(roundedBox(0.34, 0.2, 0.23, 0.07), suitM, root, 0, -0.2, 0);
  const torso = mesh(new THREE.CapsuleGeometry(0.15, 0.36, 10, 32), bodyM, root, 0, 0.12, 0);
  torso.scale.set(1.22, 1, 0.86);
  const sh = mesh(new THREE.CapsuleGeometry(0.075, 0.3, 8, 24), bodyM, root, 0, 0.41, -0.005);
  sh.rotation.z = Math.PI / 2;
  sh.scale.set(1, 1, 0.9);
  // navel + chest hint
  mesh(new THREE.SphereGeometry(0.012, 12, 8), dark, root, 0, 0.0, 0.128, false);
  mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.12, 24), skinM, root, 0, 0.52, 0);
  // head
  const head = new THREE.Group();
  head.position.set(0, 0.67, 0.01);
  root.add(head);
  const skull = mesh(new THREE.SphereGeometry(0.115, 48, 32), skinM, head);
  skull.scale.set(0.92, 1.06, 0.98);
  const hairM = cap ? real.gloss(cap, { roughness: 0.35 }) : real.fabric(hair);
  const hairG = mesh(
    new THREE.SphereGeometry(0.12, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.55),
    hairM,
    head,
    0,
    0.012,
    -0.006,
  );
  hairG.scale.set(0.95, 1.05, 1.0);
  const eyes = [];
  const brows = [];
  for (const sx of [-1, 1]) {
    mesh(
      new THREE.SphereGeometry(0.019, 16, 12),
      real.gloss(0xffffff),
      head,
      sx * 0.04,
      0.02,
      0.098,
      false,
    );
    eyes.push(
      mesh(new THREE.SphereGeometry(0.011, 12, 8), dark, head, sx * 0.04, 0.02, 0.114, false),
    );
    const b = mesh(
      new THREE.BoxGeometry(0.04, 0.008, 0.01),
      real.fabric(cap ? 0x3a2618 : hair),
      head,
      sx * 0.04,
      0.058,
      0.1,
      false,
    );
    brows.push(b);
    const ear = mesh(new THREE.SphereGeometry(0.025, 16, 12), skinM, head, sx * 0.105, 0.0, 0);
    ear.scale.set(0.5, 1, 0.8);
  }
  const nose = mesh(new THREE.SphereGeometry(0.018, 16, 12), skinM, head, 0, -0.01, 0.112);
  nose.scale.set(0.8, 1, 1.1);
  const mouth = mesh(
    new THREE.SphereGeometry(0.02, 16, 12),
    real.gloss(0x5a1a1c),
    head,
    0,
    -0.055,
    0.1,
    false,
  );
  mouth.scale.set(1.3, 0.35, 0.5);
  // arms
  const arms = [];
  for (const sx of [-1, 1]) {
    const shG = new THREE.Group();
    shG.position.set(sx * 0.215, 0.42, 0);
    root.add(shG);
    mesh(new THREE.CapsuleGeometry(0.046, 0.22, 8, 24), skinM, shG, 0, -0.15, 0);
    const el = new THREE.Group();
    el.position.y = -0.3;
    shG.add(el);
    mesh(new THREE.CapsuleGeometry(0.04, 0.2, 8, 24), skinM, el, 0, -0.13, 0);
    const hand = new THREE.Group();
    hand.position.y = -0.27;
    el.add(hand);
    mesh(roundedBox(0.075, 0.1, 0.028, 0.012), skinM, hand, 0, -0.05, 0);
    const th = mesh(
      new THREE.CapsuleGeometry(0.012, 0.04, 6, 12),
      skinM,
      hand,
      sx * -0.04,
      -0.03,
      0.01,
    );
    th.rotation.z = sx * 0.5;
    arms.push({ sx, sh: shG, el, hand });
  }
  // legs
  const legs = [];
  for (const sx of [-1, 1]) {
    const hip = new THREE.Group();
    hip.position.set(sx * 0.09, -0.27, 0);
    root.add(hip);
    mesh(new THREE.CapsuleGeometry(0.072, 0.32, 8, 24), bodyM, hip, 0, -0.2, 0);
    const kn = new THREE.Group();
    kn.position.y = -0.43;
    hip.add(kn);
    mesh(new THREE.CapsuleGeometry(0.056, 0.32, 8, 24), skinM, kn, 0, -0.21, 0);
    const foot = new THREE.Group();
    foot.position.y = -0.43;
    kn.add(foot);
    mesh(roundedBox(0.085, 0.06, 0.22, 0.03), skinM, foot, 0, -0.03, 0.05);
    legs.push({ sx, hip, kn, foot });
  }
  const bellyP = new THREE.Object3D();
  bellyP.position.set(0, 0.05, 0.14);
  root.add(bellyP);
  const handP = new THREE.Object3D();
  arms[1].hand.add(handP);
  handP.position.y = -0.1;
  const headP = new THREE.Object3D();
  head.add(headP);
  return {
    outer,
    root,
    head,
    arms,
    legs,
    eyes,
    brows,
    mouth,
    bodyM,
    skinBase: new THREE.Color(skin),
    bellyP,
    handP,
    headP,
  };
}

// pose: arms {rx, rz, el} (rz = spread outward), legs {rx, rz, kn}
function pose(d, a, l, ft = 0) {
  d.arms.forEach(({ sx, sh, el, hand }, k) => {
    const A = typeof a === "function" ? a(k) : a;
    sh.rotation.set(A.rx, 0, sx * A.rz);
    el.rotation.x = -(A.el ?? 0);
    hand.rotation.set(A.hx ?? 0, 0, 0);
  });
  d.legs.forEach(({ sx, hip, kn, foot }, k) => {
    const L = typeof l === "function" ? l(k) : l;
    hip.rotation.set(L.rx, 0, sx * L.rz);
    kn.rotation.x = L.kn ?? 0;
    foot.rotation.x = ft;
  });
}
const P = {
  stand: [
    { rx: 0, rz: 0.08, el: 0.15 },
    { rx: 0, rz: 0.03, kn: 0 },
  ],
  flail: (t) => [
    (k) => ({
      rx: -0.3 + 0.55 * Math.sin(t * 7 + k * 2),
      rz: 1.35 + 0.4 * Math.sin(t * 9 + k * 1.7),
      el: 0.45,
    }),
    (k) => ({
      rx: 0.35 * Math.sin(t * 8 + k * Math.PI),
      rz: 0.28,
      kn: 0.45 + 0.35 * Math.sin(t * 8 + k * Math.PI + 1),
    }),
  ],
  windmill: (t) => [
    (k) => ({ rx: -(t * 11 + k * Math.PI), rz: 0.3, el: 0.1 }),
    (k) => ({ rx: k ? -0.25 : 0.05, rz: 0.06, kn: k ? 0.3 : 0.05 }),
  ],
  splat: [
    { rx: -0.1, rz: 1.5, el: 0.05 },
    { rx: 0, rz: 0.32, kn: 0.05 },
  ],
  float: (t) => [
    (k) => ({ rx: -0.2, rz: 1.15 + 0.08 * Math.sin(t * 1.3 + k), el: 0.35 }),
    (k) => ({ rx: 0.1 * Math.sin(t * 1.1 + k * 2), rz: 0.16, kn: 0.25 }),
  ],
  wave: (t) => [
    (k) =>
      k ? { rx: 0, rz: 2.6 + 0.35 * Math.sin(t * 9), el: 0.6 } : { rx: -0.2, rz: 1.1, el: 0.3 },
    (k) => ({ rx: 0.12 * Math.sin(t * 2 + k * 2), rz: 0.15, kn: 0.3 }),
  ],
  dive: [
    { rx: 0, rz: Math.PI - 0.06, el: 0, hx: -1.2 },
    { rx: 0, rz: 0.0, kn: 0 },
  ],
};
function face(d, scream) {
  d.mouth.scale.set(1.3 - 0.4 * scream, 0.35 + 1.4 * scream, 0.5 + 0.3 * scream);
  d.brows.forEach((b, k) => (b.rotation.z = (k ? -1 : 1) * 0.4 * scream));
  d.eyes.forEach((e) => e.scale.setScalar(1 - 0.35 * scream));
}

const you = makeDiver({ suit: 0xe8343a, hair: 0x3a2618 });
const pro = makeDiver({ suit: 0x1b2f6b, cap: 0xffffff, skin: 0xd9a27a });
const youPos = V(0, 0, 0);
const proPos = V(0, 0, 0);
const RED = new THREE.Color(0xff3b2b);

// ---------------------------------------------------------------- your story
// returns position, pitch (rx), roll (rz), pose, scream, red, visible
function youAt(t) {
  const standY = PLATFORM.y + FEET + 0.03;
  // cold open: flat in the air, falling the last metres
  if (t < K.hookHit) {
    const u = clamp01(t / K.hookHit);
    return {
      p: [0, 0.14 + 2.5 * (1 - u * u), LAND.z],
      rx: Math.PI / 2 - 0.16,
      pose: P.flail(t),
      scream: 1,
    };
  }
  if (t < T.wasser) {
    const k = smooth(ramp(t, K.hookHit, K.hookHit + 0.5));
    return {
      p: [0, lerp(0.14, 0.02, k) + Math.sin(t * 3) * 0.01, LAND.z],
      rx: Math.PI / 2,
      pose: P.splat,
      scream: 0.7,
    };
  }
  if (t < T.hallenbad) return { hide: true };
  // on the platform
  if (t < K.tip) {
    const wob = smooth(ramp(t, T.verschaetzt, K.tip));
    return {
      p: [0, standY, -1.3 + 0.15 * wob],
      rx: wob * (0.12 + 0.1 * Math.sin(t * 6)),
      pose: wob > 0.05 ? P.windmill(t) : P.stand,
      scream: wob,
    };
  }
  // tipping over the edge
  if (t < K.fallFrom) {
    const k = easeInOut(ramp(t, K.tip, K.fallFrom));
    return {
      p: [0, standY - 0.75 * k, lerp(-1.15, -0.55, k)],
      rx: lerp(0.22, Math.PI / 2 - 0.25, k),
      pose: P.flail(t),
      scream: 1,
    };
  }
  // free fall (story-slow) — the last metre in slowmo
  if (t < K.hit) {
    const u = clamp01((t - K.fallFrom) / (K.hit - K.fallFrom));
    return {
      p: [0, lerp(standY - 0.75, 0.14, 0.45 * u + 0.55 * u * u), lerp(-0.55, LAND.z, u)],
      rx: Math.PI / 2 - 0.25 * (1 - u) - 0.05 * Math.sin(t * 5),
      pose: u > 0.92 ? P.splat : P.flail(t),
      scream: 1,
    };
  }
  // floating face down after the slap
  if (t < T.rate) {
    const k = smooth(ramp(t, K.hit, K.hit + 0.4));
    return {
      p: [0, lerp(0.14, 0.03, k) + Math.sin(t * 2) * 0.01, LAND.z],
      rx: Math.PI / 2,
      pose: P.splat,
      scream: 0.6,
    };
  }
  // underwater replay: the belly comes down onto the water, slowly
  if (t < T.haut) {
    const k = smooth(ramp(t, T.rate, T.wimpern));
    return { p: [0, lerp(0.42, 0.14, k), LAND.z], rx: Math.PI / 2, pose: P.splat, scream: 0.8 };
  }
  // roll onto the back: red belly, no air
  if (t < T.profis) {
    const k = smooth(ramp(t, T.haut - 0.05, T.haut + 0.6));
    return {
      p: [0, 0.04 + Math.sin(t * 1.6) * 0.012, LAND.z],
      rx: Math.PI / 2,
      rz: Math.PI * k,
      pose: P.float(t),
      scream: t > T.luft ? 0.9 : 0.4,
      red: smooth(ramp(t, T.haut, T.knallrot + 0.3)),
    };
  }
  if (t < T.becken) return { hide: true };
  // Übrigens: you fall again — into the bubbles
  if (t < K.softHit) {
    const u = clamp01((t - (T.becken + 0.05)) / (K.softHit - T.becken - 0.05));
    return {
      p: [0, lerp(3.8, 0.12, u * u), LAND.z],
      rx: Math.PI / 2 - 0.12,
      pose: P.splat,
      scream: 0.6,
    };
  }
  const k = smooth(ramp(t, K.softHit + 0.3, K.softHit + 1.2));
  return {
    p: [0, lerp(0.05, 0.08, k) + Math.sin(t * 2.2) * 0.02, LAND.z],
    rx: Math.PI / 2,
    rz: Math.PI * k,
    pose: k > 0.5 ? P.wave(t) : P.float(t),
    scream: 0,
    smile: k,
  };
}

// ---------------------------------------------------------------- the pro
function proAt(t) {
  if (t < T.profis - 0.1 || t >= T.uebrigens) return { hide: true };
  const standY = PLATFORM.y + FEET + 0.03;
  if (t < K.proFrom) return { p: [PRO_X, standY, -1.25], rx: 0, pose: P.dive };
  // jump + rotate head down, then straight down to the water
  const HAND = 1.02 * S + 0.12; // hands below the root when head down
  if (t < K.handSlow) {
    const u = clamp01((t - K.proFrom) / (K.handSlow - K.proFrom));
    const rx = Math.PI * smooth(clamp01(u * 1.8));
    return {
      p: [
        PRO_X,
        lerp(standY + 0.2, HAND + 0.8, u * u) + Math.sin(u * Math.PI) * 0.6,
        lerp(-1.25, PRO_Z, smooth(u)),
      ],
      rx,
      pose: P.dive,
    };
  }
  if (t < K.proHit) {
    const u = clamp01((t - K.handSlow) / (K.proHit - K.handSlow));
    return { p: [PRO_X, lerp(HAND + 0.8, HAND, u), PRO_Z], rx: Math.PI, pose: P.dive };
  }
  // through the hole, gliding down and decelerating
  const dt = t - K.proHit;
  const depth = 3.2 * (1 - Math.exp(-dt * 1.4));
  return {
    p: [PRO_X, HAND - depth, PRO_Z + 0.25 * (1 - Math.exp(-dt))],
    rx: Math.PI - 0.15 * clamp01(dt),
    pose: P.dive,
  };
}

function apply(d, s, pos) {
  d.outer.visible = !s.hide;
  if (s.hide) return;
  d.outer.position.set(...s.p);
  d.outer.rotation.set(0, 0, s.rz ?? 0);
  d.root.rotation.set(s.rx ?? 0, 0, 0);
  const pz = s.pose;
  pose(d, pz[0], pz[1], d === pro ? 0.6 : 0);
  face(d, s.scream ?? 0);
  if (s.smile) d.mouth.scale.set(1.3 + 0.8 * s.smile, 0.35, 0.5);
  d.bodyM.color.copy(d.skinBase).lerp(RED, (s.red ?? 0) * 0.75);
  d.bodyM.emissive.setHex(0x8a1206);
  d.bodyM.emissiveIntensity = (s.red ?? 0) * 0.55;
  pos.set(...s.p);
}

// ================================================================ splashes
// droplets fly from each impact; scene time
const EVENTS = [
  { at: K.hookHit, x: 0, z: LAND.z, n: 70, power: 1.0, sheet: 1 },
  { at: K.hit, x: 0, z: LAND.z, n: 110, power: 1.25, sheet: 1 },
  { at: K.proHit, x: PRO_X, z: PRO_Z, n: 18, power: 0.35, sheet: 0 },
  { at: K.softHit, x: 0, z: LAND.z, n: 30, power: 0.45, sheet: 0.5 },
  { at: T.wasser + 0.55, x: 0, z: 2.2, n: 8, power: 0.18, sheet: 0 },
];
for (const e of EVENTS)
  waveSources.push({
    at: e.at,
    x: e.x,
    z: e.z,
    amp: 0.05 + 0.08 * e.power,
    speed: 1.6 + e.power,
    life: 3.5,
    sx: e.sheet ? 0.8 : 1,
    sz: e.sheet ? 1.6 : 1,
    crater: e.sheet ? 0.18 * e.power : 0,
  });
const DROPS = EVENTS.flatMap((e, ei) =>
  Array.from({ length: e.n * 2 }, (_, i) => {
    const r = rng(900 + ei * 300 + i);
    const a = r() * Math.PI * 2;
    const low = e.sheet && r() < 0.6; // the flat sheet thrown sideways
    const v = e.power * (low ? 2.6 + r() * 2.2 : 1.5 + r() * 2.5);
    const up = e.power * (low ? 1.2 + r() * 1.6 : 3.2 + r() * 2.8);
    return {
      e,
      dx: Math.cos(a) * (e.sheet ? 0.8 : 1),
      dz: Math.sin(a) * (e.sheet ? 1.5 : 1),
      v,
      up,
      ox: (r() - 0.5) * (e.sheet ? 0.7 : 0.12),
      oz: (r() - 0.5) * (e.sheet ? 1.6 : 0.12),
      s: 0.012 + r() * 0.028 * (0.5 + e.power),
    };
  }),
);
const drops = new THREE.InstancedMesh(
  new THREE.SphereGeometry(1, 12, 8),
  new THREE.MeshStandardMaterial({
    color: 0xf2fdff,
    roughness: 0.3,
    emissive: 0xbfeff8,
    emissiveIntensity: 0.35,
    transparent: true,
    opacity: 0.92,
  }),
  DROPS.length,
);
drops.frustumCulled = false;
drops.userData.noAO = true;
scene.add(drops);
// white crown rings
const ringMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0,
  depthWrite: false,
});
const rings = EVENTS.map(() => {
  const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.05, 8, 64), ringMat.clone());
  m.rotation.x = Math.PI / 2;
  m.userData.noAO = true;
  scene.add(m);
  return m;
});
const m4 = new THREE.Matrix4();
const q0 = new THREE.Quaternion();
const vv = V(0, 0, 0);
const sv = V(1, 1, 1);
function updateSplash(t) {
  DROPS.forEach((d, i) => {
    const dt = t - d.e.at;
    let k = 0;
    if (dt > 0 && dt < 1.6) {
      vv.set(
        d.e.x + d.ox + d.dx * d.v * dt,
        0.05 + d.up * dt - 4.9 * dt * dt,
        d.e.z + d.oz + d.dz * d.v * dt,
      );
      k = vv.y > -0.02 ? d.s * (1 - dt / 1.8) : 0;
    }
    sv.setScalar(Math.max(k, 0.00001));
    m4.compose(vv, q0, sv);
    drops.setMatrixAt(i, m4);
  });
  drops.instanceMatrix.needsUpdate = true;
  EVENTS.forEach((e, i) => {
    const dt = t - e.at;
    const r = rings[i];
    r.visible = dt > 0 && dt < 1.4;
    if (!r.visible) return;
    r.position.set(e.x, 0.03, e.z);
    r.scale.set(
      (0.4 + dt * 2.2 * e.power) * (e.sheet ? 0.8 : 1),
      (0.4 + dt * 2.2 * e.power) * (e.sheet ? 1.5 : 1),
      1,
    );
    r.material.opacity = 0.75 * (1 - dt / 1.4);
  });
}

// ================================================================ the pro's hole (cavity)
const cavPts = [];
for (let i = 0; i <= 24; i++) {
  const v = i / 24; // 0 = surface, 1 = tip
  cavPts.push(new THREE.Vector2(0.32 * Math.pow(1 - v, 0.6) + 0.01, -v));
}
const cavity = new THREE.Mesh(
  new THREE.LatheGeometry(cavPts, 64),
  new THREE.MeshPhysicalMaterial({
    color: 0xeaf8ff,
    roughness: 0.08,
    metalness: 0.2,
    clearcoat: 1,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide,
    depthWrite: false,
  }),
);
cavity.position.set(PRO_X, 0.01, PRO_Z);
cavity.userData.noAO = true;
scene.add(cavity);
function cavityDepth(t) {
  const dt = t - K.proHit;
  if (dt <= 0) return 0;
  return 1.5 * Math.sin(Math.PI * clamp01(dt / 3.6));
}

// ================================================================ water beads (molecules)
// a slab of little water balls under the impact, only in the underwater shots
const BEADS = [];
{
  const r = rng(65);
  for (let x = -1.05; x <= 1.05; x += 0.15)
    for (let y = -0.08; y >= -0.75; y -= 0.15)
      for (let z = -0.6; z <= 0.65; z += 0.16)
        BEADS.push({
          x: x + (r() - 0.5) * 0.05,
          y: y + (r() - 0.5) * 0.04,
          z: z + (r() - 0.5) * 0.05,
          ph: r() * 6.28,
        });
}
const beadMat = new THREE.MeshPhysicalMaterial({
  color: 0x3aa8ff,
  roughness: 0.15,
  clearcoat: 1,
  emissive: 0x0a3a80,
  emissiveIntensity: 0.4,
});
const beads = new THREE.InstancedMesh(
  new THREE.SphereGeometry(0.04, 20, 14),
  beadMat,
  BEADS.length,
);
beads.frustumCulled = false;
beads.userData.noAO = true;
scene.add(beads);
const bHot = new THREE.Color(0xffd23f);
const bCold = new THREE.Color(0x3aa8ff);
function updateBeads(t) {
  // which window: belly (rate..haut) or the pro's hole (denn..übrigens)
  const kB = pop(t, T.rate, T.haut, 0.25);
  const kP = pop(t, T.loch + 0.35, T.uebrigens, 0.25);
  const k = Math.max(kB, kP);
  beads.visible = k > 0.01;
  if (!beads.visible) return;
  const atPro = kP > kB;
  const cx = atPro ? PRO_X : 0;
  const cz = atPro ? PRO_Z : LAND.z;
  // belly: squeeze (yellow, packed) then a sudden squirt sideways
  const squeeze = atPro ? 0 : smooth(ramp(t, T.rate + 0.3, T.wimpern));
  const squirt = atPro ? 0 : smooth(ramp(t, T.wimpern, T.wimpern + 0.5));
  // pro: beads flow slowly around the hole
  const part = atPro ? smooth(ramp(t, T.loch + 0.2, T.zeit + 0.8)) : 0;
  beadMat.color.copy(bCold).lerp(bHot, squeeze * (1 - squirt) * 0.85);
  BEADS.forEach((b, i) => {
    const top = clamp01(1 + b.y / 0.5); // 1 at the surface
    const side = Math.sign(b.x) || 1;
    let x = b.x;
    let y = b.y;
    let z = b.z;
    if (!atPro) {
      y -= squeeze * 0.06 * top;
      x += side * (squirt * 0.9 * top * top + squeeze * 0.03 * top);
      y += squirt * 0.25 * top * top * Math.abs(b.x);
    } else {
      const d = Math.hypot(b.x, b.z) + 0.001;
      const push = part * 0.38 * Math.exp(-d * 1.6) * (0.4 + top);
      x += (b.x / d) * push;
      z += (b.z / d) * push;
      y -= part * 0.04 * top;
    }
    if (atPro && Math.abs(b.z) > 0.3) {
      sv.setScalar(0.00001);
      m4.compose(vv, q0, sv);
      beads.setMatrixAt(i, m4);
      return;
    }
    const j = 0.012 * Math.sin(t * 7 + b.ph);
    vv.set(cx + x + j, y + j * 0.6, cz + z * 0.9);
    sv.setScalar(k);
    m4.compose(vv, q0, sv);
    beads.setMatrixAt(i, m4);
  });
  beads.instanceMatrix.needsUpdate = true;
}

// force arrows pushing back up into the belly
const arrows = makeArrowSet(
  [-0.55, -0.2, 0.15, 0.5].flatMap((x) =>
    [0.25, 0.95].map((z) => [
      V(x * 1.4, -0.75, LAND.z + z - 0.6),
      V(x * 1.4, 0.0, LAND.z + z - 0.6),
    ]),
  ),
  { mat: forceMat, amp: 0, r: 0.035 },
);

// ================================================================ air bubbles (Übrigens + gasping)
const NOZ = [];
for (let x = -2.4; x <= 2.41; x += 0.8) for (let z = -1.2; z <= 3.6; z += 0.8) NOZ.push([x, z]);
{
  const nm = real.metal(0xd6dde4, { roughness: 0.2 });
  for (const [x, z] of NOZ) {
    const n = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.03, 20), nm);
    n.position.set(x, -4.985, z);
    scene.add(n);
  }
}
const NB = 700;
const BUB = Array.from({ length: NB }, (_, i) => {
  const r = rng(4000 + i);
  const n = NOZ[i % NOZ.length];
  return {
    x: n[0],
    z: n[1],
    ph: r() * 3,
    sp: 1.3 + r() * 1.1,
    s: 0.035 + r() * 0.065,
    w: r() * 6.28,
  };
});
const bubMat = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  roughness: 0.02,
  clearcoat: 1,
  transparent: true,
  opacity: 0.75,
  emissive: 0x9fe8ff,
  emissiveIntensity: 0.25,
});
const bubbles = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 16, 12), bubMat, NB);
bubbles.frustumCulled = false;
bubbles.userData.noAO = true;
scene.add(bubbles);
const B0 = T.uebrigens - 0.15;
// foam on the surface
const NF = 340;
const FOAM = Array.from({ length: NF }, (_, i) => {
  const r = rng(7000 + i);
  return { x: -3.4 + r() * 6.8, z: -1.9 + r() * 6.2, s: 0.05 + r() * 0.1, ph: r() * 6.28 };
});
const foam = new THREE.InstancedMesh(
  new THREE.SphereGeometry(1, 16, 8),
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.5,
    transparent: true,
    opacity: 0.7,
  }),
  NF,
);
foam.frustumCulled = false;
foam.userData.noAO = true;
scene.add(foam);
// gasp bubbles from your mouth
const gasp = Array.from({ length: 6 }, () =>
  mesh(new THREE.SphereGeometry(0.03, 16, 12), bubMat, scene, 0, 0, 0, false),
);
const headW = V(0, 0, 0);
function updateBubbles(t) {
  const on = t >= B0;
  bubbles.visible = on;
  foam.visible = t >= T.sprudelt;
  if (on) {
    BUB.forEach((b, i) => {
      const age = t - B0 - b.ph * 0.9;
      let k = 0;
      if (age > 0) {
        const y = -4.95 + ((age * b.sp) % 4.95);
        vv.set(b.x + Math.sin(age * 5 + b.w) * 0.06, y, b.z + Math.cos(age * 4 + b.w) * 0.06);
        k = b.s * (0.7 + (0.5 * (y + 5)) / 5);
      }
      sv.setScalar(Math.max(k, 0.00001));
      m4.compose(vv, q0, sv);
      bubbles.setMatrixAt(i, m4);
    });
    bubbles.instanceMatrix.needsUpdate = true;
  }
  if (foam.visible) {
    const fk = smooth(ramp(t, T.sprudelt, T.sprudelt + 1.2));
    FOAM.forEach((f, i) => {
      const s = f.s * fk * (0.8 + 0.25 * Math.sin(t * 6 + f.ph));
      vv.set(f.x + Math.sin(t * 1.5 + f.ph) * 0.05, 0.02 + 0.03 * Math.sin(t * 5 + f.ph), f.z);
      sv.set(s, s * 0.25, s);
      m4.compose(vv, q0, sv);
      foam.setMatrixAt(i, m4);
    });
    foam.instanceMatrix.needsUpdate = true;
  }
  // water turns milky with air
  const air = smooth(ramp(t, T.sprudelt, T.sprudelt + 1.5));
  return air;
}

// ================================================================ speed streaks (the fall)
const NS = 36;
const STREAKS = Array.from({ length: NS }, (_, i) => {
  const r = rng(8000 + i);
  const a = r() * Math.PI * 2;
  return { a, rad: 0.9 + r() * 1.4, ph: r(), len: 0.6 + r() * 0.9 };
});
const streaks = new THREE.InstancedMesh(
  new THREE.CylinderGeometry(0.008, 0.008, 1, 6),
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  }),
  NS,
);
streaks.frustumCulled = false;
streaks.userData.noAO = true;
scene.add(streaks);
function updateStreaks(t) {
  const k = t >= T.nichts && t < K.hit ? smooth(ramp(t, T.nichts, T.nichts + 0.4)) : 0;
  streaks.visible = k > 0;
  if (!k) return;
  STREAKS.forEach((s, i) => {
    const u = (t * 2.2 + s.ph) % 1;
    vv.set(
      youPos.x + Math.cos(s.a) * s.rad,
      youPos.y - 2 + u * 4,
      youPos.z + Math.sin(s.a) * s.rad,
    );
    sv.set(1, s.len * k * Math.sin(u * Math.PI), 1);
    m4.compose(vv, q0, sv);
    streaks.setMatrixAt(i, m4);
  });
  streaks.instanceMatrix.needsUpdate = true;
}

// ================================================================ camera
const applyCamera = shotCamera(
  shots.map((s) =>
    s.rel === "you" ? { ...s, rel: youPos } : s.rel === "pro" ? { ...s, rel: proPos } : s,
  ),
  1,
);
const bellyW = V(0, 0, 0);
const proHandW = V(0, 0, 0);
const LAB = LABELS.map((l) => ({
  ...l,
  pos: l.pos === "belly" ? bellyW : l.pos === "proHand" ? proHandW : l.pos,
}));

const WATER = new THREE.Color(0x3fc4de);
const CONCRETE = new THREE.Color(0x8e8a84);
const MILK = new THREE.Color(0xc8f1f8);

// ================================================================ render
function renderAt(t) {
  const ys = youAt(t);
  apply(you, ys, youPos);
  const ps = proAt(t);
  apply(pro, ps, proPos);
  you.outer.updateMatrixWorld(true);
  pro.outer.updateMatrixWorld(true);
  you.bellyP.getWorldPosition(bellyW);
  pro.handP.getWorldPosition(proHandW);

  updateSplash(t);
  updateStreaks(t);
  updateBeads(t);
  const air = updateBubbles(t);

  // ---- the water: concrete for "Wand", milky with air at the end
  const wall = t >= T.wand && t < T.hallenbad ? smooth(ramp(t, T.wand, T.wand + 0.15)) : 0;
  waterMat.color
    .copy(WATER)
    .lerp(MILK, air * 0.7)
    .lerp(CONCRETE, wall);
  waterMat.opacity = lerp(0.62, 0.9, Math.max(wall, air * 0.4));
  waterMat.roughness = lerp(0.04, 0.85, wall);
  waterMat.clearcoat = 1 - wall;

  // ---- the pro's cavity
  const cd = cavityDepth(t);
  cavity.visible = cd > 0.02;
  cavity.scale.set(
    1 + 0.3 * clamp01((t - K.proHit) / 0.8),
    Math.max(0.01, cd),
    1 + 0.3 * clamp01((t - K.proHit) / 0.8),
  );

  // ---- force arrows
  const fa = pop(t, T.drueckt, T.haut, 0.25);
  animateArrows(arrows, t, fa * (1 + 0.15 * Math.sin(t * 12)));

  // ---- gasp bubbles
  you.headP.getWorldPosition(headW);
  gasp.forEach((g, i) => {
    const u = (t * 1.2 + i / 6) % 1;
    g.visible = t >= T.luft && t < T.profis;
    g.position.set(
      headW.x + Math.sin(i * 2.1) * 0.08,
      headW.y + 0.1 + u * 0.5,
      headW.z + Math.cos(i * 1.7) * 0.06,
    );
    g.scale.setScalar(0.6 + u + 0.001);
  });

  // ---- HUD
  const fallK = pop(t, T.nichts, T.ganzer, 0.2);
  const fallen = Math.max(0, PLATFORM.y + FEET - 0.75 - youPos.y);
  gauge("tempo", fallK, {
    label: "Tempo",
    value: Math.min(50, Math.round(Math.sqrt(2 * 9.81 * fallen * 1.0) * 3.6)),
    max: 60,
    unit: "km/h",
    x: 60,
    y: 430,
    color: t >= T.k50 ? "#ff4b2b" : "#ffd23f",
  });
  readout("zeit", pop(t, T.wimpern, T.drueckt, 0.2), {
    label: "Zeit zum Ausweichen",
    value: "< 0,1",
    unit: "s",
    note: "ein Wimpernschlag",
    x: 60,
    y: 430,
    color: "#4fc3ff",
  });
  meter("luft", pop(t, T.luft, T.profis, 0.2), {
    label: "Luft",
    value: lerp(1, 0.08, smooth(ramp(t, T.luft, T.luft + 0.8))),
    x: 60,
    y: 430,
    color: "#ff4b2b",
    text: "weg",
  });

  // ---- LED facts
  if (t >= T.wand && t < T.hallenbad)
    showPanel(pop(t, T.wand, T.hallenbad), "WASSER", "WIE EINE WAND", LED.red);
  else if (t >= T.k50 && t < T.ganzer)
    showPanel(pop(t, T.k50, T.ganzer), "AUFPRALL", "50 KM/H", LED.red);
  else if (t >= T.knallrot && t < T.luft)
    showPanel(pop(t, T.knallrot, T.luft), "DEINE HAUT", "KNALLROT", LED.red);
  else if (t >= T.weicher && t < T.hoechster)
    showPanel(pop(t, T.weicher, T.hoechster), "LUFT IM BECKEN", "WEICHER", LED.green);
  else showPanel(0);

  labels(t, LAB);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
