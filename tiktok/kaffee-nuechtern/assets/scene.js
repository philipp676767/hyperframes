// #83 Kaffee auf leeren Magen (Format B). Your hand pours the coffee into
// the gullet; it falls into the giant stomach cave as a waterfall, the
// stomach flinches and sprays acid, a steak fizzes away in an acid pool,
// acid climbs the gullet (heartburn), the gut wakes up, the cut through the
// wall shows the mucus layer the acid bounces off; payoff: the whole cave
// under its shining coat; Übrigens: the decaf mug pours too.
import {
  THREE,
  ramp,
  smooth,
  lerp,
  pop,
  V,
  scene,
  real,
  roundedBox,
  showNope,
  makeArrowSet,
  animateArrows,
  heatMat,
  showPanel,
  LED,
  labels,
  squash,
  puff,
  rng,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { stomach, gullet, fleshMat } from "./set.js";
import { createHand } from "./hand.js";
import { T, shots, LABELS, HIGHLIGHTS, MUG, GUT, SLAB, POOL, PORE } from "./beats.js";

highlights(HIGHLIGHTS);

const mesh = (geo, mat, parent = scene, shadow = true) => {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = shadow;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};
const M4 = new THREE.Matrix4();
const Q0 = new THREE.Quaternion();
const vS = V(1, 1, 1);
const vP = V(0, 0, 0);
function instanced(n, geo, mat, parent = scene) {
  const im = new THREE.InstancedMesh(geo, mat, n);
  im.frustumCulled = false;
  im.userData.noAO = true;
  parent.add(im);
  im.set = (i, x, y, z, s, sy = s) => {
    vP.set(x, y, z);
    vS.set(Math.max(1e-4, s), Math.max(1e-4, sy), Math.max(1e-4, s));
    M4.compose(vP, Q0, vS);
    im.setMatrixAt(i, M4);
  };
  im.done = () => (im.instanceMatrix.needsUpdate = true);
  return im;
}

// ================================================================ colours
const COFFEE = new THREE.MeshPhysicalMaterial({
  color: 0x3a1f10,
  roughness: 0.08,
  clearcoat: 1,
  clearcoatRoughness: 0.04,
});
const CREMA = new THREE.MeshPhysicalMaterial({ color: 0xb7834f, roughness: 0.5 });
const ACID = new THREE.MeshStandardMaterial({
  color: 0xb8ff3c,
  emissive: 0x7dff1e,
  emissiveIntensity: 1.1,
  roughness: 0.2,
});
const ACID_POOL = new THREE.MeshPhysicalMaterial({
  color: 0x9dff2e,
  emissive: 0x58d81a,
  emissiveIntensity: 0.9,
  roughness: 0.05,
  clearcoat: 1,
  transparent: true,
  opacity: 0.88,
});

// ================================================================ the mug + your hand
// pivot = the lip the coffee leaves from, right above the gullet
const pour = new THREE.Group();
pour.position.set(MUG[0] - 0.15, MUG[1] + 0.45, MUG[2]);
scene.add(pour);

function makeMug(band, text) {
  const g = new THREE.Group();
  const prof = [
    [0.0, 0.0],
    [0.4, 0.0],
    [0.44, 0.04],
    [0.46, 0.5],
    [0.47, 0.98],
    [0.455, 1.0],
    [0.43, 0.98],
    [0.42, 0.1],
    [0.0, 0.08],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const body = mesh(new THREE.LatheGeometry(prof, 72), real.ceramic(0xf6f1ea), g);
  body.position.y = 0;
  // printed band with a word
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 128;
  const x = c.getContext("2d");
  x.fillStyle = band;
  x.fillRect(0, 0, 1024, 128);
  if (text) {
    x.fillStyle = "#fff8ec";
    x.font = "900 72px Montserrat, Arial, sans-serif";
    x.textAlign = "center";
    x.textBaseline = "middle";
    for (const cx of [128, 384, 640, 896]) x.fillText(text, cx, 68);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const bandM = mesh(
    new THREE.CylinderGeometry(0.472, 0.468, 0.3, 72, 1, true),
    real.ceramic(0xffffff, { map: tex }),
    g,
    false,
  );
  bandM.position.y = 0.56;
  // handle
  const h = mesh(
    new THREE.TorusGeometry(0.2, 0.055, 18, 40, Math.PI * 1.15),
    real.ceramic(0xf6f1ea),
    g,
  );
  h.rotation.z = -Math.PI / 2 - 0.07;
  h.position.set(0.47, 0.52, 0);
  // the coffee inside (a disc that stays level-ish — tilted with the mug)
  const surf = mesh(new THREE.CircleGeometry(0.415, 48), COFFEE, g, false);
  surf.rotation.x = -Math.PI / 2;
  surf.position.y = 0.86;
  const crema = mesh(new THREE.RingGeometry(0.33, 0.415, 48), CREMA, g, false);
  crema.rotation.x = -Math.PI / 2;
  crema.position.y = 0.862;
  g.position.set(0.455, -1.0, 0); // rim at the pivot, mouth edge on the pivot
  pour.add(g);
  return g;
}
const mugA = makeMug("#c4552d", "");
const mugB = makeMug("#2f9e6a", "DECAF");

// your hand around the mug (child of the pour group: it tilts with it)
const hand = createHand({ skin: 0xf0bf9c, sleeve: 0x3c4a5e, scale: 2.5 });
pour.add(hand.group);
const HAND_LOCAL = { pos: [1.35, -0.55, 0.05], rot: [0, -Math.PI / 2, -0.15], pose: "grab" };
const HAND_KEYS = [
  { t: -1, ...HAND_LOCAL },
  { t: T.schluck, ...HAND_LOCAL, out: true },
  { t: T.fakt - 0.4, ...HAND_LOCAL },
  { t: T.klo2, ...HAND_LOCAL, out: true },
];
// tilt of the mug: already pouring on frame 0
const tilt = (t) => {
  if (t < T.schluck) return lerp(1.25, 1.95, smooth(ramp(t, -0.6, 0.9)));
  if (t >= T.fakt - 0.4 && t < T.klo2)
    return lerp(1.0, 1.95, smooth(ramp(t, T.fakt - 0.4, T.fakt + 0.5)));
  return 1.2;
};
// steam over the mug
const steam = instanced(
  10,
  new THREE.SphereGeometry(1, 16, 12),
  new THREE.MeshBasicMaterial({
    color: 0xfff6ee,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
  }),
);

// ================================================================ the coffee stream + lake
const pourOn = (t) =>
  t < T.schluck + 1.2
    ? 1 - ramp(t, T.schreckt, T.schreckt + 0.4)
    : t >= T.fakt && t < T.klo2
      ? ramp(t, T.fakt + 0.2, T.fakt + 0.5)
      : t >= T.cta
        ? 1
        : 0;
const STREAM_TOP = MUG[1] + 0.45;
const stream = mesh(new THREE.CylinderGeometry(1, 1, 1, 32, 24, true), COFFEE, scene, false);
// drops around the stream + the splash at the bottom
const SDROPS = 60;
const sdrop = instanced(SDROPS, new THREE.SphereGeometry(1, 14, 10), COFFEE);
const SPLASH = 48;
const splash = instanced(SPLASH, new THREE.SphereGeometry(1, 14, 10), COFFEE);
const lake = mesh(new THREE.CircleGeometry(1, 96), COFFEE, stomach, false);
lake.rotation.x = -Math.PI / 2;
lake.position.y = 0.24;
const foam = mesh(new THREE.TorusGeometry(1, 0.035, 10, 96), CREMA, stomach, false);
foam.rotation.x = -Math.PI / 2;
foam.position.y = 0.25;
const RINGS = 4;
const rings = Array.from({ length: RINGS }, () => {
  const r = mesh(
    new THREE.TorusGeometry(1, 0.025, 8, 64),
    new THREE.MeshBasicMaterial({ color: 0xd9a77a, transparent: true, opacity: 0.6 }),
    stomach,
    false,
  );
  r.rotation.x = -Math.PI / 2;
  return r;
});
// coffee steam drifting over the lake
const lakeSteam = instanced(
  14,
  new THREE.SphereGeometry(1, 16, 12),
  new THREE.MeshBasicMaterial({
    color: 0xfff1e6,
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
  }),
);
const lakeR = (t) => 4.3 * smooth(ramp(t, T.zerfrisst - 0.6, T.schreckt + 0.5));

// ================================================================ acid out of the wall
const PORES = (() => {
  const a0 = Math.atan2(PORE[2], PORE[0]);
  const out = [];
  const r = rng(83);
  for (let i = 0; i < 9; i++) {
    const a = a0 + (i - 2) * 0.62 + (r() - 0.5) * 0.2;
    const y = i === 0 ? PORE[1] : 2.6 + r() * 2.6;
    const rad = 9.15 + (y - 3.4) * 0.12;
    out.push(V(Math.cos(a) * rad, y, Math.sin(a) * rad));
  }
  out[0].set(PORE[0], PORE[1], PORE[2]);
  return out;
})();
const poreGlow = instanced(PORES.length, new THREE.SphereGeometry(1, 20, 14), ACID);
const PER = 22;
const jets = instanced(PORES.length * PER, new THREE.SphereGeometry(1, 12, 9), ACID);
const acidOn = (t) =>
  ramp(t, T.also + 0.1, T.also + 0.5) * (1 - ramp(t, T.rate - 0.2, T.rate)) +
  ramp(t, T.warum - 0.2, T.warum) * (1 - ramp(t, T.schleim - 0.1, T.schleim));

// the acid pool with the steak
const pool = mesh(new THREE.CircleGeometry(1.5, 64), ACID_POOL, stomach, false);
pool.rotation.x = -Math.PI / 2;
pool.position.set(POOL[0], 0.62, POOL[2]);
const steak = new THREE.Group();
{
  const meat = real.plastic(0x9a2b26, { roughness: 0.55, clearcoat: 0.4 });
  const fat = real.plastic(0xf2e3cf, { roughness: 0.5 });
  const b = mesh(roundedBox(1.5, 0.3, 1.0, 0.12, 4), meat, steak);
  b.scale.set(1, 1, 1);
  const f = mesh(roundedBox(0.16, 0.31, 1.0, 0.07, 4), fat, steak);
  f.position.x = -0.78;
  // marbling streaks
  const r = rng(7);
  for (let i = 0; i < 7; i++) {
    const s = mesh(new THREE.BoxGeometry(0.4 + r() * 0.4, 0.01, 0.03), fat, steak, false);
    s.position.set(-0.4 + r() * 0.9, 0.152, -0.4 + r() * 0.8);
    s.rotation.y = r() * Math.PI;
  }
}
steak.position.set(POOL[0], 0.4, POOL[2]);
stomach.add(steak);
const BUB = 40;
const bubbles = instanced(BUB, new THREE.SphereGeometry(1, 12, 9), ACID_POOL, stomach);

// acid drops on the bare floor: they sizzle
const FLOORHIT = V(-5.2, 0.5, 2.6);
const burn = mesh(
  new THREE.CircleGeometry(0.9, 48),
  new THREE.MeshBasicMaterial({
    color: 0xff3a1a,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  }),
  stomach,
  false,
);
burn.rotation.x = -Math.PI / 2;
burn.position.set(FLOORHIT.x, 0.62, FLOORHIT.z);
const FD = 12;
const floorDrops = instanced(FD, new THREE.SphereGeometry(1, 12, 9), ACID, stomach);
const smoke = instanced(
  16,
  new THREE.SphereGeometry(1, 14, 10),
  new THREE.MeshBasicMaterial({
    color: 0xf5f0ea,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
  }),
  stomach,
);

// ================================================================ heartburn: acid up the gullet
const gulletMat = fleshMat.clone();
gullet.material = gulletMat;
const column = mesh(
  new THREE.CylinderGeometry(1.62, 1.62, 1, 48, 1, true),
  new THREE.MeshPhysicalMaterial({
    color: 0x9dff2e,
    emissive: 0x58d81a,
    emissiveIntensity: 1,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
    depthWrite: false,
  }),
  stomach,
  false,
);
const columnTop = mesh(new THREE.CircleGeometry(1.62, 48), ACID_POOL, stomach, false);
columnTop.rotation.x = -Math.PI / 2;
const colH = (t) =>
  4.6 * smooth(ramp(t, T.manchen + 0.2, T.hals + 0.4)) * (1 - ramp(t, T.rate - 0.1, T.rate));
const heatArrows = makeArrowSet(
  [0, 1, 2, 3, 4].map((i) => {
    const a = i * 1.26 + 0.4;
    const x = Math.cos(a) * 2.3;
    const z = Math.sin(a) * 2.3;
    return [V(x, 14.6 + (i % 2) * 0.6, z), V(x, 18.6 + (i % 2) * 0.6, z)];
  }),
  { mat: heatMat, amp: 0.1, r: 0.05 },
);

// ================================================================ the gut
const gut = new THREE.Group();
gut.position.set(GUT[0], GUT[1], GUT[2]);
scene.add(gut);
const gutU = { uTime: { value: 0 }, uAmp: { value: 0 } };
const gutMat = new THREE.MeshPhysicalMaterial({
  color: 0xe8908a,
  roughness: 0.34,
  clearcoat: 0.9,
  clearcoatRoughness: 0.12,
  sheen: 0.5,
  sheenColor: new THREE.Color(0xffc0b8),
  emissive: 0xff6a3a,
  emissiveIntensity: 0,
});
gutMat.onBeforeCompile = (sh) => {
  sh.uniforms.uTime = gutU.uTime;
  sh.uniforms.uAmp = gutU.uAmp;
  sh.vertexShader = sh.vertexShader
    .replace(
      "#include <common>",
      "#include <common>\nuniform float uTime; uniform float uAmp; varying float vWave;",
    )
    .replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
       float wv = pow(0.5 + 0.5 * sin(uv.x * 90.0 - uTime * 7.0), 6.0);
       vWave = wv * step(0.001, uAmp);
       transformed += normal * wv * uAmp;`,
    );
  sh.fragmentShader = sh.fragmentShader
    .replace("#include <common>", "#include <common>\nvarying float vWave;")
    .replace(
      "#include <emissivemap_fragment>",
      "#include <emissivemap_fragment>\ntotalEmissiveRadiance += vec3(1.0, 0.45, 0.25) * vWave * 0.55;",
    );
};
{
  // a pile of loops: a meander rising in three layers
  const pts = [];
  for (let i = 0; i <= 260; i++) {
    const u = i / 260;
    const layer = u * 3;
    const a = u * Math.PI * 2 * 4.2;
    const rr = 1.7 + Math.sin(a * 2.5) * 0.55;
    pts.push(
      V(Math.cos(a) * rr, 0.55 + layer * 0.62 + Math.sin(a * 3) * 0.12, Math.sin(a) * rr * 0.8),
    );
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  mesh(new THREE.TubeGeometry(curve, 900, 0.46, 28, false), gutMat, gut);
}
const gutAwake = (t) =>
  ramp(t, T.darm, T.darm + 0.3) * (1 - ramp(t, T.warum - 0.2, T.warum)) +
  ramp(t, T.klo2 - 0.2, T.klo2 + 0.1);

// the toilet roll
const roll = new THREE.Group();
{
  const paper = real.fabric(0xfbfaf6);
  const r1 = mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.95, 48), paper, roll);
  r1.rotation.z = Math.PI / 2;
  const core = mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 0.97, 32, 1, true),
    real.plastic(0x9c7a55, { side: THREE.DoubleSide }),
    roll,
    false,
  );
  core.rotation.z = Math.PI / 2;
  const hole = mesh(
    new THREE.CircleGeometry(0.19, 24),
    new THREE.MeshBasicMaterial({ color: 0x3a2a1a }),
    roll,
    false,
  );
  hole.rotation.y = Math.PI / 2;
  hole.position.x = 0.486;
}
gut.add(roll);
const sheet = mesh(
  new THREE.PlaneGeometry(0.93, 1),
  real.fabric(0xfbfaf6, { side: THREE.DoubleSide }),
  gut,
  false,
);
sheet.rotation.x = -Math.PI / 2;

// ================================================================ the cut through the wall
const slab = new THREE.Group();
slab.position.set(SLAB[0], SLAB[1], SLAB[2]);
scene.add(slab);
{
  const muscle = real.skin(0x8d2430, { roughness: 0.5 });
  const lining = real.skin(0xe0706e, { roughness: 0.4, clearcoat: 0.6 });
  const m1 = mesh(roundedBox(4.4, 0.8, 2.6, 0.1, 4), muscle, slab);
  m1.position.y = 0.4;
  const m2 = mesh(roundedBox(4.4, 0.5, 2.6, 0.1, 4), lining, slab);
  m2.position.y = 1.02;
  // muscle fibre lines on the cut face
  const r = rng(11);
  for (let i = 0; i < 9; i++) {
    const s = mesh(new THREE.BoxGeometry(4.2, 0.02, 0.01), real.skin(0x5e1420), slab, false);
    s.position.set(0, 0.12 + i * 0.075 + r() * 0.02, 1.302);
  }
}
const mucusMat = new THREE.MeshPhysicalMaterial({
  color: 0xd6ecff,
  roughness: 0.04,
  clearcoat: 1,
  clearcoatRoughness: 0.03,
  transparent: true,
  opacity: 0.6,
  emissive: 0x7fb8ff,
  emissiveIntensity: 0.15,
});
const mucus = mesh(roundedBox(4.4, 1, 2.6, 0.12, 4), mucusMat, slab, false);
const sweep = mesh(
  new THREE.BoxGeometry(0.35, 1, 2.64),
  new THREE.MeshBasicMaterial({
    color: 0xe9f6ff,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  }),
  slab,
  false,
);
const SD = 14;
const slabDrops = instanced(SD, new THREE.SphereGeometry(1, 12, 9), ACID, slab);
const slabOn = (t) => (t >= T.schleim - 0.2 && t < T.meisten ? 1 : 0);

// the shining coat over the whole cave (payoff)
const coatMat = new THREE.MeshPhysicalMaterial({
  color: 0xdcefff,
  roughness: 0.03,
  clearcoat: 1,
  transparent: true,
  opacity: 0,
  emissive: 0x8fc4ff,
  emissiveIntensity: 0.25,
  side: THREE.DoubleSide,
  depthWrite: false,
});
const coat = mesh(stomach.children[0].geometry, coatMat, stomach, false);
coat.scale.setScalar(0.985);
coat.position.y = 0.05;

// ================================================================ render
const applyCamera = shotCamera(shots, 1.0);

function renderAt(t) {
  // ---------------------------------------------------- mug + hand
  const mugSide = t >= T.fakt - 0.5;
  mugA.visible = !mugSide;
  mugB.visible = mugSide;
  pour.rotation.z = tilt(t);
  hand.track(t, HAND_KEYS);
  for (let i = 0; i < 10; i++) {
    const u = (t * 0.35 + i / 10) % 1;
    const s = (0.12 + u * 0.35) * (1 - u) * (pourOn(t) > 0 || t < 0.1 ? 1 : 0);
    steam.set(
      i,
      MUG[0] + 0.9 + Math.sin(i * 2.1 + t) * 0.25,
      MUG[1] + 0.6 + u * 2.4,
      MUG[2] + Math.cos(i) * 0.2,
      s,
    );
  }
  steam.done();

  // ---------------------------------------------------- stream
  const po = pourOn(t);
  stream.visible = po > 0.01;
  if (stream.visible) {
    // the stream detaches from the top when the pour stops
    const topY = STREAM_TOP - (1 - po) * 18;
    const botY = 0.25;
    const h = Math.max(0.01, topY - botY);
    stream.position.set(0, botY + h / 2, 0);
    const w = 0.16 + 0.012 * Math.sin(t * 31);
    stream.scale.set(w * 1.6, h, w * 1.6);
  }
  for (let i = 0; i < SDROPS; i++) {
    const u = (t * 0.9 + i / SDROPS) % 1;
    const a = i * 2.39;
    const y = STREAM_TOP - u * (STREAM_TOP - 0.3);
    const r = 0.28 + u * 0.35;
    sdrop.set(i, Math.cos(a) * r, y, Math.sin(a) * r, po * (0.05 + (i % 3) * 0.02));
  }
  sdrop.done();
  for (let i = 0; i < SPLASH; i++) {
    const u = (t * 1.7 + i / SPLASH) % 1;
    const a = i * 2.39996;
    const sp = 1.4 + (i % 5) * 0.35;
    splash.set(
      i,
      Math.cos(a) * u * sp,
      0.3 + u * (2.6 - (i % 4) * 0.3) - u * u * 2.6,
      Math.sin(a) * u * sp,
      po * 0.11 * (1 - u * 0.6),
    );
  }
  splash.done();
  const lr = lakeR(t);
  lake.visible = foam.visible = lr > 0.02;
  lake.scale.setScalar(Math.max(0.01, lr));
  foam.scale.setScalar(Math.max(0.01, lr));
  rings.forEach((r, i) => {
    const u = (t * 0.6 + i / RINGS) % 1;
    r.visible = lr > 0.3 && po > 0.05;
    r.scale.setScalar(Math.max(0.01, 0.4 + u * (lr - 0.4)));
    r.position.y = 0.26;
    r.material.opacity = 0.6 * (1 - u) * po;
  });
  for (let i = 0; i < 14; i++) {
    const u = (t * 0.12 + i / 14) % 1;
    const a = i * 2.4;
    const rr = (0.4 + (i % 4) * 0.25) * lr;
    lakeSteam.set(
      i,
      Math.cos(a) * rr,
      0.5 + u * 3.5,
      Math.sin(a) * rr,
      lr > 0.5 ? (0.25 + u * 0.7) * Math.sin(u * Math.PI) : 0,
    );
  }
  lakeSteam.done();

  // ---------------------------------------------------- the stomach flinches
  const fl =
    ramp(t, T.schreckt, T.schreckt + 0.18) * (1 - ramp(t, T.schreckt + 0.18, T.schreckt + 0.7));
  stomach.scale.set(1 - fl * 0.05, 1 + fl * 0.02, 1 - fl * 0.05);

  // ---------------------------------------------------- acid jets
  const ao = acidOn(t);
  PORES.forEach((p, k) => {
    poreGlow.set(k, p.x, p.y, p.z, ao * (0.22 + 0.04 * Math.sin(t * 9 + k)));
    const inX = -p.x / 9.2;
    const inZ = -p.z / 9.2;
    for (let j = 0; j < PER; j++) {
      const u = (t * 0.85 + j / PER + k * 0.13) % 1;
      const d = u * (2.6 + (j % 3) * 0.5);
      const y = p.y + u * 1.1 - u * u * 3.4;
      jets.set(k * PER + j, p.x + inX * d, y, p.z + inZ * d, ao * 0.085 * (1 - u * 0.4));
    }
  });
  poreGlow.done();
  jets.done();

  // ---------------------------------------------------- acid pool + steak
  const pk = pop(t, T.sauer - 0.4, T.manchen);
  pool.visible = pk > 0;
  pool.scale.setScalar(Math.max(0.01, pk));
  const drop = smooth(ramp(t, T.sauer, T.sauer + 0.45));
  const eat = ramp(t, T.sauer + 0.5, T.kein - 0.1);
  steak.visible = t >= T.sauer - 0.05 && t < T.kein + 0.05;
  steak.position.y = lerp(3.9, 0.68, drop) - eat * 0.12;
  steak.rotation.y = 0.4 + drop * 0.3;
  steak.rotation.z = (1 - drop) * 0.5;
  const ss = Math.max(0.01, 1 - eat * 0.82);
  steak.scale.set(ss, Math.max(0.01, 1 - eat * 0.6), ss);
  puff("steak", t, T.kein, POOL[0], 0.9, POOL[2], 1.1, 0xeaffd0);
  for (let i = 0; i < BUB; i++) {
    const u = (t * 1.3 + i / BUB) % 1;
    const a = i * 2.4;
    const rr = 0.3 + (i % 5) * 0.2;
    const on = t > T.sauer + 0.4 && t < T.magenwand1 ? 1 : 0;
    bubbles.set(
      i,
      POOL[0] + Math.cos(a) * rr,
      0.64 + u * 0.9,
      POOL[2] + Math.sin(a) * rr * 0.7,
      on * 0.09 * Math.sin(u * Math.PI),
    );
  }
  bubbles.done();
  showNope(pop(t, T.kein + 0.1, T.magenwand1), POOL[0], 1.7, POOL[2], 1.0);

  // ---------------------------------------------------- acid on the bare floor
  const fh = t >= T.magenwand1 - 0.4 && t < T.manchen ? 1 : 0;
  for (let i = 0; i < FD; i++) {
    const u = (t * 0.8 + i / FD) % 1;
    const a = i * 2.39;
    floorDrops.set(
      i,
      FLOORHIT.x + Math.cos(a) * 0.5,
      0.3 + (1 - u) * 4.5,
      FLOORHIT.z + Math.sin(a) * 0.4,
      fh * 0.1,
      fh * 0.16,
    );
  }
  floorDrops.done();
  burn.material.opacity =
    0.5 *
    ramp(t, T.magenwand1 - 0.3, T.magenwand1 + 0.6) *
    (1 - ramp(t, T.manchen - 0.2, T.manchen));
  for (let i = 0; i < 16; i++) {
    const u = (t * 0.6 + i / 16) % 1;
    const a = i * 2.4;
    smoke.set(
      i,
      FLOORHIT.x + Math.cos(a) * 0.4,
      0.4 + u * 2.2,
      FLOORHIT.z + Math.sin(a) * 0.4,
      fh * (0.15 + u * 0.4) * Math.sin(u * Math.PI),
    );
  }
  smoke.done();

  // ---------------------------------------------------- heartburn
  const ch = colH(t);
  column.visible = columnTop.visible = ch > 0.05;
  column.scale.set(1, Math.max(0.01, ch), 1);
  column.position.y = 13.4 + ch / 2;
  columnTop.position.y = 13.4 + ch + 0.05 * Math.sin(t * 8);
  const glow = ramp(t, T.brennt - 0.2, T.brennt + 0.3) * (1 - ramp(t, T.rate - 0.2, T.rate));
  gulletMat.emissive.setRGB(0.23 + glow * 0.77, 0.05 + glow * 0.07, 0.07 - glow * 0.06);
  gulletMat.emissiveIntensity = 0.35 + glow * 4.5;
  animateArrows(heatArrows, t, glow);

  // ---------------------------------------------------- the gut
  const aw = gutAwake(t);
  gutU.uTime.value = t;
  gutU.uAmp.value = aw * 0.16;
  gutMat.emissiveIntensity = aw * 0.12;
  gut.rotation.y = Math.sin(t * 1.6) * 0.04 * aw;
  gut.scale.copy(t >= T.darm && t < T.darm + 1 ? squash(t, T.darm, 0.7) : V(1, 1, 1));
  // roll: pops in on "Klo", rolls toward the camera, unrolling
  const rollAt = t >= T.klo2 - 0.3 ? T.klo2 + 0.1 : T.klo1 + 0.1;
  const rk = t >= rollAt && t < rollAt + 3.2 && (t < T.warum || t >= T.klo2 - 0.3);
  roll.visible = sheet.visible = rk;
  if (rk) {
    const u = smooth(ramp(t, rollAt + 0.3, rollAt + 2.2));
    const z0 = 2.6;
    const z = z0 + u * 1.6;
    roll.position.set(0.5, 0.5, z);
    roll.rotation.x = (u * 1.6) / 0.5;
    roll.scale.copy(squash(t, rollAt));
    const len = Math.max(0.01, z - z0 + 0.2);
    sheet.scale.set(1, len, 1);
    sheet.position.set(0.5, 0.06, z0 + len / 2 - 0.1);
  }
  showPanel(
    pop(t, T.dritten, T.warum) * (t < T.klo1 + 0.6 ? 1 : 0),
    "KLO-ALARM BEI",
    "JEDEM 3.",
    LED.yellow,
  );

  // ---------------------------------------------------- the mucus layer
  const th =
    0.12 +
    0.28 * smooth(ramp(t, T.schleim - 0.1, T.schleim + 0.6)) +
    0.08 * smooth(ramp(t, T.neu, T.neu + 1.2));
  mucus.scale.set(1, th, 1);
  mucus.position.y = 1.27 + th / 2;
  const sw = ramp(t, T.neu, T.neu + 1.4);
  sweep.material.opacity = 0.55 * Math.sin(sw * Math.PI);
  sweep.position.set(-2.2 + sw * 4.4, 1.27 + th / 2, 0);
  sweep.scale.set(1, th + 0.02, 1);
  const top = 1.27 + th;
  for (let i = 0; i < SD; i++) {
    const u = (t * 0.55 + i / SD) % 1;
    const x0 = -1.8 + ((i * 0.37) % 1) * 3.6;
    const z0 = -0.9 + ((i * 0.61) % 1) * 1.8;
    let y;
    let x = x0;
    if (u < 0.55) y = lerp(5.5, top + 0.08, (u / 0.55) ** 2);
    else {
      const b = (u - 0.55) / 0.45;
      y = top + 0.08 + b * 1.6 - b * b * 2.2;
      x = x0 + b * 0.9 * (i % 2 ? 1 : -1);
    }
    const sq = u > 0.53 && u < 0.6 ? 0.6 : 1;
    slabDrops.set(i, x, y, z0, (slabOn(t) * 0.11) / Math.sqrt(sq), slabOn(t) * 0.11 * sq);
  }
  slabDrops.done();

  // ---------------------------------------------------- payoff: the coat over the cave
  coatMat.opacity =
    0.28 * ramp(t, T.meisten - 0.1, T.meisten + 0.7) * (1 - ramp(t, T.fakt - 0.2, T.fakt));
  coatMat.emissiveIntensity = 0.2 + 0.15 * Math.sin(t * 3);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
