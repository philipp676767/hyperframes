// #71 "Alle springen gleichzeitig" (format B). The viewer's hand slams the
// red button, a whole stadium jumps; a small Earth high above the stadium
// carries humanity (Wien, Rio, Tokio, Australia), gets its kick and springs
// back by less than a thousandth of an atom.
import {
  THREE,
  ramp,
  smooth,
  pop,
  V,
  scene,
  real,
  roundedBox,
  rng,
  noise2,
  lerp,
  clamp01,
  makeArrowSet,
  animateArrows,
  forceMat,
  showPanel,
  LED,
  labels,
  puff,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { STAND_SPOTS, STADIUM, screen, confetti } from "./set.js";
import { createHand } from "./hand.js";
import { counter, readout } from "./hud.js";
import { BLOBS } from "./globe-data.js";
import { T, shots, LABELS, HIGHLIGHTS, GC, RG, dir, CITY, ATOM_POS, SPECK_POS } from "./beats.js";

highlights(HIGHLIGHTS);
const TAU = Math.PI * 2;

// ================================================================ the crowd
// one InstancedMesh per body part; every fan = a transform + a pose per frame
const SKIN = [0xf3c9a8, 0xe0ac86, 0xc68a62, 0x9c6644, 0x6e4630, 0xf7d6bd];
const TOPS = [
  0x111214, 0xf2f2f2, 0xd6334a, 0xff5fa8, 0x2f6fd8, 0xffd23f, 0x2a2a3a, 0x8b5cf6, 0x1fa37a,
];
const LEGS = [0x23314d, 0x1a1a1e, 0x3b4a66, 0x5a4a3a, 0x2c2c34];
const HAIR = [0x2a1d16, 0x4a3426, 0xd9b26a, 0x1a1a1a, 0x8a4a2a, 0xb07a4a];

const fans = []; // { x, y, z, rot, amp, del, ph, up, cast }
{
  const r = rng(7101);
  // pitch crowd facing the stage (-z)
  for (let z = 8; z >= -30; z -= 0.78)
    for (let x = -20; x <= 20; x += 0.74) {
      const px = x + (r() - 0.5) * 0.35;
      const pz = z + (r() - 0.5) * 0.3;
      if (Math.hypot(px, pz - 9.5) < 2.5) continue;
      fans.push({ x: px, y: 0, z: pz, rot: Math.PI + (r() - 0.5) * 0.5, r, near: pz > 2 });
    }
  for (const [x, y, z, rot] of STAND_SPOTS) fans.push({ x, y, z, rot, r, near: false });
  fans.forEach((f) => {
    f.amp = 0.5 + r() * 0.25;
    f.del = r() * 0.05;
    f.ph = r();
    f.up = r();
    f.h = 0.92 + r() * 0.16;
    f.skin = SKIN[Math.floor(r() * SKIN.length)];
    f.top = TOPS[Math.floor(r() * TOPS.length)];
    f.legs = LEGS[Math.floor(r() * LEGS.length)];
    f.hair = HAIR[Math.floor(r() * HAIR.length)];
    delete f.r;
  });
}
const NF = fans.length;
const part = (geo, mat, n = NF) => {
  const m = new THREE.InstancedMesh(geo, mat, n);
  m.castShadow = true;
  m.receiveShadow = true;
  m.frustumCulled = false;
  scene.add(m);
  return m;
};
const cloth = (o = {}) => real.fabric(0xffffff, o);
const LEG_OFF = new THREE.Matrix4().makeTranslation(0, -0.41, 0);
const ARM_OFF = new THREE.Matrix4().makeTranslation(0, -0.3, 0);
const torsoM = part(new THREE.CapsuleGeometry(0.19, 0.36, 4, 12), cloth());
const headM = part(new THREE.SphereGeometry(0.115, 16, 12), real.skin(0xffffff));
const hairM = part(
  new THREE.SphereGeometry(0.122, 16, 8, 0, TAU, 0, 1.6),
  cloth({ roughness: 0.7 }),
);
const legM = part(new THREE.CapsuleGeometry(0.085, 0.66, 4, 10), cloth(), NF * 2);
const armM = part(new THREE.CapsuleGeometry(0.058, 0.48, 4, 10), cloth(), NF * 2);
{
  const c = new THREE.Color();
  fans.forEach((f, i) => {
    torsoM.setColorAt(i, c.set(f.top));
    headM.setColorAt(i, c.set(f.skin));
    hairM.setColorAt(i, c.set(f.hair));
    legM.setColorAt(2 * i, c.set(f.legs));
    legM.setColorAt(2 * i + 1, c.set(f.legs));
    armM.setColorAt(2 * i, c.set(f.up < 0.5 ? f.top : f.skin));
    armM.setColorAt(2 * i + 1, c.set(f.up < 0.5 ? f.top : f.skin));
  });
}
// local part matrices (person stands at the origin, faces +z)
const m4 = new THREE.Matrix4();
const base = new THREE.Matrix4();
const loc = new THREE.Matrix4();
const q = new THREE.Quaternion();
const e = new THREE.Euler();
const vp = new THREE.Vector3();
const vs = new THREE.Vector3();
const hop = (u) => Math.max(0, Math.sin(TAU * u));

// crowd state by story time → { y, squash, arms (0 down … 1 up), legsTuck }
function fanState(t, f) {
  // hook: everyone hops in sync, peak exactly on frame 0
  if (t < T.erde1 - 0.3) {
    const u = (t + 0.225 - f.del) / 0.9;
    const y = f.amp * hop(u);
    const ground = Math.max(0, -Math.sin(TAU * u));
    return {
      y,
      sq: 1 - 0.1 * ground,
      arms: 0.35 + 0.65 * Math.min(1, y * 3),
      tuck: y > 0.05 ? 0.35 : 0,
    };
  }
  // waiting, then the big jump: crouch, launch, hover (slow motion), land
  if (t < T.land + 0.6) {
    const a = T.absprung + f.del;
    if (t < a)
      return {
        y: 0,
        sq: 1 - 0.02 * Math.sin(t * 5 + f.ph * 6),
        arms: f.up > 0.7 ? 1 : 0.1,
        tuck: 0,
      };
    if (t < a + 0.35)
      return {
        y: 0,
        sq: 1 - 0.14 * smooth(ramp(t, a, a + 0.3)),
        arms: 0.1 + 0.3 * ramp(t, a, a + 0.35),
        tuck: 0.15,
      };
    const peak = f.amp * 1.25;
    if (t < T.landen) {
      const rise = 1 - Math.pow(1 - clamp01((t - a - 0.35) / 0.5), 3);
      const hover = 0.06 * Math.sin(t * 1.6 + f.ph * TAU);
      return { y: peak * rise + hover * rise, sq: 1.04, arms: 0.4 + 0.6 * rise, tuck: 0.4 * rise };
    }
    if (t < T.land) {
      const k = (t - T.landen) / (T.land - T.landen);
      return {
        y: (peak + 0.06 * Math.sin(T.landen * 1.6 + f.ph * TAU)) * (1 - k * k),
        sq: 1.03,
        arms: 1,
        tuck: 0.2,
      };
    }
    const k = ramp(t, T.land, T.land + 0.5);
    return {
      y: 0,
      sq: 1 - 0.16 * Math.sin(Math.PI * Math.min(1, k * 2)) * (1 - k),
      arms: 1 - 0.5 * k,
      tuck: 0,
    };
  }
  // after: a cheering crowd, some arms up
  if (t < T.fakt) {
    const b = 0.04 * Math.max(0, Math.sin(t * 4.4 + f.ph * TAU));
    return {
      y: b,
      sq: 1,
      arms: f.up > 0.55 ? 0.8 + 0.2 * Math.sin(t * 3 + f.ph * 9) : 0.12,
      tuck: 0,
    };
  }
  // Übrigens: a wild concert — everyone jumps on the beat (2.1 Hz), own rhythm
  const u = t * 2.1 + f.ph * 0.25;
  const y = 0.5 * f.amp * hop(u);
  return {
    y,
    sq: 1 - 0.08 * Math.max(0, -Math.sin(TAU * u)),
    arms: 0.6 + 0.4 * Math.sin(t * 6 + f.ph * TAU),
    tuck: y > 0.05 ? 0.25 : 0,
  };
}

function updateCrowd(t, show) {
  for (const m of [torsoM, headM, hairM, legM, armM]) m.visible = show;
  if (!show) return;
  fans.forEach((f, i) => {
    const s = fanState(t, f);
    e.set(0, f.rot, 0);
    q.setFromEuler(e);
    vp.set(f.x, f.y + s.y, f.z);
    vs.set(f.h, f.h * s.sq, f.h);
    base.compose(vp, q, vs);
    // torso + head + hair
    loc.makeTranslation(0, 1.18, 0);
    torsoM.setMatrixAt(i, m4.multiplyMatrices(base, loc));
    loc.makeTranslation(0, 1.68, 0.01);
    headM.setMatrixAt(i, m4.multiplyMatrices(base, loc));
    loc.makeTranslation(0, 1.705, -0.012);
    hairM.setMatrixAt(i, m4.multiplyMatrices(base, loc));
    // legs: hip pivot, tuck back a little in the air
    for (let k = 0; k < 2; k++) {
      const sx = k ? 0.1 : -0.1;
      e.set(-s.tuck * (k ? 0.7 : 1), 0, 0);
      q.setFromEuler(e);
      loc.compose(vp.set(sx, 0.86, 0), q, vs.set(1, 1, 1));
      legM.setMatrixAt(2 * i + k, m4.multiplyMatrices(base, loc).multiply(LEG_OFF));
    }
    // arms: shoulder pivot, 0 = hanging, 1 = straight up (a little V)
    for (let k = 0; k < 2; k++) {
      const sgn = k ? 1 : -1;
      const a = s.arms;
      e.set(0, 0, sgn * lerp(0.12, Math.PI - 0.38, a));
      q.setFromEuler(e);
      loc.compose(vp.set(sgn * 0.25, 1.46, 0), q, vs.set(1, 1, 1));
      armM.setMatrixAt(2 * i + k, m4.multiplyMatrices(base, loc).multiply(ARM_OFF));
    }
  });
  for (const m of [torsoM, headM, hairM, legM, armM]) m.instanceMatrix.needsUpdate = true;
}

// ================================================================ the button console + hand
const consoleG = new THREE.Group();
consoleG.position.set(0, 0, 12.9);
scene.add(consoleG);
{
  const body = new THREE.Mesh(
    roundedBox(1.5, 1.02, 0.9, 0.06),
    real.metal(0x2b2e36, { roughness: 0.45 }),
  );
  body.position.y = 0.51;
  body.castShadow = true;
  consoleG.add(body);
  const plate = new THREE.Mesh(
    roundedBox(1.3, 0.03, 0.7, 0.012),
    real.metal(0x111216, { roughness: 0.3 }),
  );
  plate.position.y = 1.035;
  consoleG.add(plate);
  // yellow-black warning ring
  const ring = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 0.025, 48),
    real.plastic(0xffd23f),
  );
  ring.position.set(0, 1.055, -0.1);
  consoleG.add(ring);
  // small LEDs + two faders
  [-0.48, -0.36, 0.36, 0.48].forEach((x, i) => {
    const led = new THREE.Mesh(
      new THREE.SphereGeometry(0.022, 16, 12),
      new THREE.MeshBasicMaterial({ color: i % 2 ? 0x3dff7a : 0xff3fa4 }),
    );
    led.position.set(x, 1.06, 0.18);
    consoleG.add(led);
    const fader = new THREE.Mesh(roundedBox(0.05, 0.03, 0.22, 0.01), real.plastic(0x666a74));
    fader.position.set(x, 1.055, -0.12);
    consoleG.add(fader);
  });
}
const btnCap = new THREE.Mesh(
  new THREE.CylinderGeometry(0.15, 0.16, 0.09, 48),
  real.gloss(0xe0141e, { emissive: 0xff1a1a, emissiveIntensity: 0.5 }),
);
btnCap.position.set(0, 1.1, -0.1);
consoleG.add(btnCap);
const hand = createHand({ scale: 0.36, sleeve: 0x1b1d24 });

// ================================================================ the globe
const globe = new THREE.Group();
globe.position.set(...GC);
scene.add(globe);
const D2R = Math.PI / 180;
const wrap = (d) => ((((d + 180) % 360) + 360) % 360) - 180;
function landMask(lat, lon) {
  if (lat < -68) return 0.4 + (lat + 68) * -0.02;
  let m = -1;
  for (const [a, b, ra, rb] of BLOBS)
    m = Math.max(m, 1 - Math.hypot((lat - a) / ra, wrap(lon - b) / rb));
  return m + (noise2(lat * 0.09 + 3, lon * 0.09, 4) - 0.5) * 0.3;
}
const latLon = (x, y, z) => {
  const r = Math.hypot(x, y, z);
  return [Math.asin(y / r) / D2R, Math.atan2(x, z) / D2R];
};
{
  const geo = new THREE.IcosahedronGeometry(RG, 40);
  const p = geo.attributes.position;
  const col = new Float32Array(p.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const [la, lo] = latLon(p.getX(i), p.getY(i), p.getZ(i));
    const m = landMask(la, lo);
    const land = smooth(clamp01((m + 0.02) / 0.08));
    const ice = smooth(clamp01((Math.abs(la) - 66) / 6));
    const n = noise2(la * 0.25, lo * 0.25, 3);
    const sea = c.setRGB(0.04, 0.2 + 0.08 * n, 0.45 + 0.1 * n).clone();
    const dry = Math.abs(la) < 32 && n > 0.45;
    const ground = c
      .setRGB(dry ? 0.62 : 0.2 + 0.1 * n, dry ? 0.5 : 0.42 + 0.1 * n, dry ? 0.3 : 0.16)
      .clone();
    const out = sea.lerp(ground, land).lerp(new THREE.Color(0.94, 0.97, 1), ice);
    col.set([out.r, out.g, out.b], i * 3);
    const s = (RG + land * 0.05) / RG;
    p.setXYZ(i, p.getX(i) * s, p.getY(i) * s, p.getZ(i) * s);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  geo.computeVertexNormals();
  const earth = new THREE.Mesh(
    geo,
    new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      roughness: 0.55,
      clearcoat: 0.4,
      clearcoatRoughness: 0.3,
    }),
  );
  globe.add(earth);
  // atmosphere
  const atm = new THREE.Mesh(
    new THREE.SphereGeometry(RG * 1.06, 64, 48),
    new THREE.MeshBasicMaterial({
      color: 0x5fb4ff,
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  atm.userData.noAO = true;
  globe.add(atm);
}
// tiny glowing people all over the land, hopping radially
const gPeople = (() => {
  const r = rng(7102);
  const pts = [];
  let guard = 0;
  while (pts.length < 2600 && guard++ < 60000) {
    const u = r() * 2 - 1;
    const a = r() * TAU;
    const s = Math.sqrt(1 - u * u);
    const d = [s * Math.sin(a), u, s * Math.cos(a)];
    const [la, lo] = latLon(...d);
    if (landMask(la, lo) < 0.05 || la < -60) continue;
    pts.push({ d: V(...d), ph: r() });
  }
  // dense clusters on the three cities + Australia
  for (const [la, lo] of [CITY.wien, CITY.rio, CITY.tokio, CITY.au])
    for (let k = 0; k < 80; k++) {
      const d = V(...dir(la + (r() - 0.5) * 6, lo + (r() - 0.5) * 7));
      pts.push({ d, ph: r(), city: true });
    }
  const mesh = new THREE.InstancedMesh(
    new THREE.CapsuleGeometry(0.022, 0.07, 2, 6),
    new THREE.MeshStandardMaterial({ color: 0xfff1c0, emissive: 0xffc65a, emissiveIntensity: 1.2 }),
    pts.length,
  );
  mesh.frustumCulled = false;
  globe.add(mesh);
  const up = V(0, 1, 0);
  return (t, k, jump) => {
    mesh.visible = k > 0;
    if (!mesh.visible) return;
    pts.forEach((p, i) => {
      const h = jump(t, p);
      q.setFromUnitVectors(up, p.d);
      vp.copy(p.d).multiplyScalar(RG + 0.07 + h);
      vs.setScalar(k * (p.city ? 1.3 : 1));
      m4.compose(vp, q, vs);
      mesh.setMatrixAt(i, m4);
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
})();
// city glow rings
const cityRings = [CITY.wien, CITY.rio, CITY.tokio, CITY.au].map(([la, lo]) => {
  const m = new THREE.Mesh(
    new THREE.RingGeometry(0.32, 0.42, 48),
    new THREE.MeshBasicMaterial({
      color: 0xffd23f,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  const d = V(...dir(la, lo));
  m.position.copy(d).multiplyScalar(RG + 0.08);
  m.lookAt(d.clone().multiplyScalar(RG * 2));
  globe.add(m);
  return m;
});
// "alle Menschen": a glowing speck next to the Earth
const speck = new THREE.Mesh(
  new THREE.SphereGeometry(0.07, 16, 12),
  new THREE.MeshBasicMaterial({ color: 0xffd23f }),
);
speck.position.set(SPECK_POS[0] - GC[0], SPECK_POS[1] - GC[1], SPECK_POS[2] - GC[2]);
globe.add(speck);
// the kick: one big arrow over Europe, then Europe vs. Australia
const dEU = V(...dir(48, 12));
const dAU = V(...dir(...CITY.au));
const arrowIn = (d, len) => [
  d.clone().multiplyScalar(RG + len),
  d.clone().multiplyScalar(RG + 0.35),
];
const kickArrow = makeArrowSet([arrowIn(dEU, 4.5)], {
  parent: globe,
  mat: forceMat,
  r: 0.2,
  amp: 0,
});
const pushArrows = makeArrowSet([arrowIn(dEU, 3.2), arrowIn(dAU, 3.2)], {
  parent: globe,
  mat: forceMat,
  r: 0.16,
  amp: 0,
});

// ================================================================ the atom
const atom = new THREE.Group();
atom.position.set(...ATOM_POS);
scene.add(atom);
const electrons = [];
{
  const r = rng(7103);
  for (let i = 0; i < 9; i++) {
    const n = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 24, 16),
      real.gloss(i % 2 ? 0xff4b2b : 0x4fc3ff, { emissive: i % 2 ? 0x601010 : 0x103060 }),
    );
    n.position.set((r() - 0.5) * 0.32, (r() - 0.5) * 0.32, (r() - 0.5) * 0.32);
    atom.add(n);
  }
  for (let k = 0; k < 3; k++) {
    const orbit = new THREE.Group();
    orbit.rotation.set(k * 1.05, k * 0.7, 0.4 * k);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.0, 0.012, 8, 96),
      new THREE.MeshBasicMaterial({ color: 0x9fe3ff }),
    );
    orbit.add(ring);
    const el = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
    );
    orbit.add(el);
    atom.add(orbit);
    electrons.push(el);
  }
}

// ================================================================ render
const applyCamera = shotCamera(
  shots.map((s) => (s.rel ? { ...s, rel: V(...s.rel) } : s)),
  1,
);
const inGlobe = (t) => {
  let i = shots.length - 1;
  while (i > 0 && shots[i].at > t) i--;
  const s = shots[i];
  return s.rel === GC || (s.orbit && s.orbit.c === GC);
};

function globeJump(t, p) {
  // humanity hops in sync while the globe is on screen
  return 0.09 * hop((t + 0.225) / 0.9 - p.ph * 0.04);
}

function renderAt(t) {
  applyCamera(t);
  const g = inGlobe(t);

  // ---- hand slams the button on frame 0
  hand.track(t, [
    { t: -0.6, pos: [0.25, 1.62, 13.55], rot: [0.55, Math.PI, 0], pose: "open" },
    { t: -0.15, pos: [0.06, 1.32, 13.3], rot: [0.5, Math.PI, 0], pose: "fist" },
    { t: 0.05, pos: [0.04, 1.2, 13.1], rot: [0.45, Math.PI, 0], pose: "fist" },
    { t: 0.55, pos: [0.08, 1.3, 13.25], rot: [0.5, Math.PI, 0], pose: "fist" },
    { t: T.springen, pos: [0.4, 1.6, 13.9], rot: [0.55, Math.PI, 0], pose: "open", out: true },
  ]);
  const press = t < 0.5 ? 1 - smooth(ramp(t, 0.05, 0.4)) : 0;
  btnCap.position.y = 1.1 - 0.035 * press * (t >= -0.1 ? 1 : 0);
  btnCap.material.emissiveIntensity = 0.5 + 2.5 * pop(t, -0.05, 0.6, 0.08);

  // ---- stadium
  updateCrowd(t, !g);
  confetti(t, !g && (t < T.erde1 || (t > T.land && t < T.folge) || t > T.fakt) ? 1 : 0);
  screen.mat.color.setScalar(0.75 + 0.25 * Math.max(0, Math.sin(t * 7)));
  // dust where the feet push off and where they land
  puff("push1", t, T.absprung + 0.38, -1.2, 0.05, 7.6, 0.9);
  puff("push2", t, T.absprung + 0.42, 1.4, 0.05, 6.8, 0.9);
  puff("land1", t, T.land, -1.0, 0.05, 7.2, 1.3);
  puff("land2", t, T.land + 0.03, 1.8, 0.05, 6.4, 1.3);
  puff("land3", t, T.land + 0.05, 0.2, 0.05, 4.8, 1.2);

  // ---- globe (only drawn while the camera is up there)
  globe.visible = g;
  atom.visible = g && t >= T.atom - 0.05 && t < T.fakt;
  if (g) {
    globe.rotation.y = 0;
    // the kick: pushed away from Europe, springs back
    const kick = Math.sin(Math.PI * ramp(t, T.tritt1, T.tritt1 + 0.5)) * 0.35;
    // payoff: a nudge you can't even see, then a tiny spring back
    const nudge =
      ramp(t, T.tausendstel, T.atom) * (1 - smooth(ramp(t, T.federt, T.federt + 0.6))) * 0.03;
    const wobble =
      t > T.federt ? Math.sin((t - T.federt) * 18) * 0.02 * Math.exp(-(t - T.federt) * 4) : 0;
    globe.position.set(...GC).addScaledVector(dEU, -(kick + nudge + wobble));
    gPeople(t, 1, globeJump);
    cityRings.forEach((m, i) => {
      const a = [T.wien, T.rio, T.tokio, T.australien][i];
      const b = i === 3 ? T.payoff : [T.rio, T.tokio, T.unddann][i];
      const k = pop(t, a - 0.1, b);
      m.visible = k > 0;
      m.scale.setScalar(Math.max(0.001, k * (1 + 0.15 * Math.sin(t * 8))));
    });
    speck.visible = t > T.aber && t < T.und3;
    speck.scale.setScalar(1 + 0.4 * Math.sin(t * 6));
    animateArrows(kickArrow, t, pop(t, T.tritt1 - 0.15, T.jeder));
    animateArrows(pushArrows, t, pop(t, T.australien + 0.3, T.payoff));
    atom.rotation.y = t * 0.8;
    electrons.forEach((el, i) => {
      const a = t * (3.2 + i) + i * 2;
      el.position.set(Math.cos(a), Math.sin(a), 0);
    });
    atom.scale.setScalar(Math.max(0.001, smooth(ramp(t, T.atom - 0.05, T.atom + 0.3))));
  }

  // ---- facts: no numbers before ~15 s
  counter("tonnen", pop(t, T.rate + 0.2, T.aber), {
    label: "Alle Menschen · Mio. Tonnen",
    value: Math.round(400 * smooth(ramp(t, T.rate + 0.3, T.vierhundert + 0.2))),
    x: 60,
    y: 1390,
  });
  if (t >= T.fuenfzehn && t < T.und3) {
    showPanel(pop(t, T.fuenfzehn, T.und3), "DIE ERDE WIEGT", "15 BILLIONEN ×", LED.yellow);
  } else if (t >= T.atom && t < T.fakt) {
    showPanel(pop(t, T.atom, T.fakt), "ERDE RUTSCHT", "< 1/1000 ATOM", LED.green);
  } else {
    showPanel(0);
  }
  readout("beben", pop(t, T.erdbeben - 0.1, T.cta), {
    label: "SEISMOGRAF",
    value: "2,3",
    unit: "Stärke",
    note: "Konzert · Seattle 2023",
    x: 60,
    y: 1180,
    color: LED.red,
  });

  labels(t, LABELS);
  renderFrame();
}

start(renderAt);
void STADIUM;
void lerp;
