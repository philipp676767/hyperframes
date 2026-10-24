// #24 "Was passiert eigentlich, wenn du die Erde anhältst?" (format B).
// A toy Earth floats above a moon-rock island; the viewer's hand slams a
// STOPP button on frame 0 and the globe grinds to a halt. Then: you and the
// little town on it fly on to the east, a storm and a wave sweep the land,
// the sea flows to the poles and leaves one supercontinent around the
// equator — with Europe under water. Übrigens: one side stays dark for half
// a year. Timing lives in beats.js; renderAt(t) is a pure function of t.
import {
  THREE,
  ramp,
  smooth,
  clamp01,
  lerp,
  pop,
  V,
  rng,
  noise2,
  jitter,
  facet,
  facetMat,
  scene,
  ground,
  flat,
  M,
  showNope,
  makeArrowSet,
  animateArrows,
  forceMat,
  coldMat,
  showPanel,
  LED,
  labels,
  showLabel,
  squash,
  puff,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { createWorld } from "./environments.js";
import { createHand } from "./hand.js";
import { place, rock } from "./props.js";
import { cow } from "./props.js";
import { T, G, geo, YOU, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);

// ---------------------------------------------------------------- set (SKILL.md 1b)
// Space, new for this video: the moon-rock island is the stage, the Sun is
// the hero piece behind it; the env's own distant Earth goes — ours is the
// globe on the stage.
createWorld({ env: "weltall", seed: 24 });
ground.traverse((o) => {
  if (o.isMesh && o.position.z < -100 && o.position.x < -40) o.visible = false;
});
const F = (geo_, mat, amt = 0.08, seed = 1) => {
  const m = new THREE.Mesh(facet(geo_, amt, seed), facetMat(mat));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
};

// the Sun, far behind the stage, where the sky glows
const SUN = V(-0.32, 0.07, -1).normalize().multiplyScalar(175);
{
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(13, 3),
    new THREE.MeshBasicMaterial({ color: 0xfff3c4, fog: false }),
  );
  core.position.copy(SUN);
  core.userData.noAO = true;
  scene.add(core);
  const corona = new THREE.Mesh(
    jitter(new THREE.IcosahedronGeometry(16.5, 1), 1.6, 5),
    new THREE.MeshBasicMaterial({ color: 0xffb347, fog: false, flatShading: true }),
  );
  corona.position.copy(SUN);
  corona.userData.noAO = true;
  scene.add(corona);
  for (const [r, o] of [
    [24, 0.22],
    [36, 0.1],
  ]) {
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(r, 32, 16),
      new THREE.MeshBasicMaterial({
        color: 0xffc46b,
        transparent: true,
        opacity: o,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        fog: false,
      }),
    );
    halo.position.copy(SUN);
    halo.userData.noAO = true;
    scene.add(halo);
  }
  // corona turns slowly so the Sun is never a dead disc
  const spin = (t) => {
    corona.rotation.set(t * 0.05, t * 0.08, 0);
  };
  window.__sunSpin = spin;
}
// the Moon, small, upper left
{
  const moon = F(jitter(new THREE.IcosahedronGeometry(3.2, 2), 0.18, 8), flat(0xd9d4cc), 0.08, 8);
  moon.position.set(-26, 19, -62);
  moon.castShadow = moon.receiveShadow = false;
  scene.add(moon);
}

// mission-control dressing on the rock: antenna dish, a flag, a crate, rocks
{
  const dish = new THREE.Group();
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 1.6, 8), M.steel);
  mast.position.y = 0.8;
  dish.add(mast);
  const bowl = new THREE.Mesh(
    new THREE.SphereGeometry(0.75, 14, 8, 0, Math.PI * 2, 0, 1.0),
    flat(0xeeeeee, { side: THREE.DoubleSide, roughness: 0.4 }),
  );
  bowl.rotation.x = -2.2;
  bowl.position.set(0, 1.7, 0.1);
  dish.add(bowl);
  dish.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  place(dish, -6.4, -3.6, 0.7);
  const flag = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.9, 6), M.chrome);
  pole.position.y = 0.95;
  flag.add(pole);
  const cloth = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.48, 0.02, 3, 1, 1),
    flat(0xe2453c, { side: THREE.DoubleSide }),
  );
  cloth.position.set(0.4, 1.62, 0);
  flag.add(cloth);
  flag.traverse((o) => o.isMesh && (o.castShadow = true));
  place(flag, -5.2, 2.6, 0.4);
  place(rock(3, 0.6), 6.4, -2.5);
  place(rock(5, 0.4), -6.8, 1.0);
  place(rock(7, 0.35), 5.6, 2.9);
}

// ---------------------------------------------------------------- the STOPP console
const BTN = V(2.15, 1.05, 3.05);
const console_ = new THREE.Group();
scene.add(console_);
{
  const body = F(
    new THREE.BoxGeometry(0.9, 0.95, 0.7),
    flat(0x3b4a6b, { roughness: 0.5 }),
    0.05,
    31,
  );
  body.position.set(BTN.x, 0.475, BTN.z);
  console_.add(body);
  const top = F(
    new THREE.BoxGeometry(0.98, 0.1, 0.78),
    flat(0xf1c94a, { roughness: 0.5 }),
    0.05,
    32,
  );
  top.position.set(BTN.x, 0.97, BTN.z);
  console_.add(top);
  // label plate "STOPP" on the front
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 96;
  const g = c.getContext("2d");
  g.fillStyle = "#ffffff";
  g.fillRect(0, 0, 256, 96);
  g.fillStyle = "#d8261c";
  g.font = "900 64px Montserrat, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("STOPP", 128, 52);
  const plate = new THREE.Mesh(
    new THREE.PlaneGeometry(0.62, 0.23),
    new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(c), roughness: 0.6 }),
  );
  plate.material.map.colorSpace = THREE.SRGBColorSpace;
  plate.position.set(BTN.x, 0.62, BTN.z + 0.355);
  console_.add(plate);
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.32, 0.06, 20), flat(0x222630));
  ring.position.set(BTN.x, 1.04, BTN.z);
  console_.add(ring);
  console_.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
}
const btnMat = flat(0xe0261c, { roughness: 0.3, emissive: 0xff2010, emissiveIntensity: 0.15 });
const button = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.14, 20), btnMat);
button.castShadow = true;
scene.add(button);
const btnGlow = new THREE.PointLight(0xff3020, 0, 3, 2);
btnGlow.position.copy(BTN).add(V(0, 0.3, 0.1));
scene.add(btnGlow);

// ---------------------------------------------------------------- the globe
const R = G.R;
const tilt = new THREE.Group();
tilt.position.set(...G.C);
tilt.rotation.x = G.TILT;
scene.add(tilt);
const spinG = new THREE.Group();
tilt.add(spinG);

// continents as soft lat/lon blobs (degrees): lat, lon, radius lat, radius lon
const BLOBS = [
  [50, 12, 9, 16],
  [44, 12, 4, 6],
  [40, -4, 5, 6],
  [61, 15, 7, 9],
  [54, 30, 10, 18],
  [54, -2, 4, 3],
  [55, 70, 12, 30],
  [61, 105, 12, 30],
  [45, 90, 12, 25],
  [33, 105, 10, 15],
  [24, 79, 8, 9],
  [14, 78, 7, 5],
  [15, 102, 8, 6],
  [63, 140, 10, 22],
  [36, 45, 8, 12],
  [24, 47, 8, 9],
  [36, 138, 5, 3],
  [10, 20, 14, 20],
  [24, 10, 8, 22],
  [-5, 22, 14, 13],
  [-20, 25, 10, 9],
  [-30, 23, 5, 7],
  [6, 40, 6, 7],
  [55, -100, 14, 28],
  [45, -90, 10, 20],
  [38, -100, 9, 18],
  [30, -95, 6, 12],
  [20, -102, 7, 8],
  [13, -87, 5, 5],
  [63, -150, 7, 15],
  [68, -100, 7, 30],
  [52, -75, 9, 12],
  [72, -42, 9, 14],
  [0, -62, 12, 14],
  [-15, -55, 12, 12],
  [-30, -62, 10, 8],
  [-45, -68, 8, 4],
  [8, -70, 5, 8],
  [-25, 134, 9, 16],
  [-19, 141, 6, 8],
  [-2, 115, 3, 10],
];
const D2R = Math.PI / 180;
const wrap = (d) => ((((d + 180) % 360) + 360) % 360) - 180;
function landMask(lat, lon) {
  if (lat < -68) return 0.4 + (lat + 68) * -0.02;
  let m = -1;
  for (const [a, b, ra, rb] of BLOBS) {
    const q = Math.hypot((lat - a) / ra, wrap(lon - b) / rb);
    m = Math.max(m, 1 - q);
  }
  return m + (noise2(lat * 0.09 + 3, lon * 0.09, 4) - 0.5) * 0.3;
}
const latLonOf = (x, y, z) => {
  const r = Math.hypot(x, y, z);
  return [Math.asin(y / r) / D2R, Math.atan2(x, z) / D2R];
};
const landH = (lat, lon) => {
  const k = smooth(clamp01((landMask(lat, lon) + 0.03) / 0.1));
  return lerp(-0.05, 0.05 + noise2(lat * 0.3, lon * 0.3, 9) * 0.018, k);
};
const landGeo = new THREE.IcosahedronGeometry(R, 6);
{
  const p = landGeo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const [la, lo] = latLonOf(p.getX(i), p.getY(i), p.getZ(i));
    const s = (R + landH(la, lo)) / R;
    p.setXYZ(i, p.getX(i) * s, p.getY(i) * s, p.getZ(i) * s);
  }
}
// split faces: continents vs. sea floor (the floor turns into the supercontinent)
function splitGlobe() {
  const p = landGeo.attributes.position;
  const land = [];
  const floor = [];
  const landCol = [];
  const cc = new THREE.Color();
  const r = rng(24);
  for (let i = 0; i < p.count; i += 3) {
    const x = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3;
    const y = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3;
    const z = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3;
    let h = -1;
    for (let j = 0; j < 3; j++)
      h = Math.max(h, Math.hypot(p.getX(i + j), p.getY(i + j), p.getZ(i + j)) - R);
    const [la, lo] = latLonOf(x, y, z);
    const tri = [];
    for (let j = 0; j < 3; j++) tri.push(p.getX(i + j), p.getY(i + j), p.getZ(i + j));
    if (h > 0.004) {
      land.push(...tri);
      const n = noise2(la * 0.2, lo * 0.2, 2);
      if (la < -62 || (la > 60 && lo > -60 && lo < -20)) cc.set(0xf4f7ff);
      else if (Math.abs(la) > 62) cc.set(0xb9c48a);
      else if (
        (la > 14 && la < 33 && lo > -18 && lo < 58) ||
        (la < -18 && la > -32 && lo > 120 && lo < 148)
      )
        cc.set(n > 0.5 ? 0xe8c784 : 0xdcb46e);
      else cc.set(n > 0.55 ? 0x6bb64e : n > 0.3 ? 0x56a144 : 0x7cbf55);
      const k = 1 + (r() - 0.5) * 0.12;
      for (let j = 0; j < 3; j++) landCol.push(cc.r * k, cc.g * k, cc.b * k);
    } else floor.push(...tri);
  }
  const mk = (arr) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
    g.computeVertexNormals();
    return g;
  };
  const lg = mk(land);
  lg.setAttribute("color", new THREE.Float32BufferAttribute(landCol, 3));
  return [lg, facet(mk(floor), 0.07, 25)];
}
const [landPart, floorPart] = splitGlobe();
const landMesh = new THREE.Mesh(
  landPart,
  new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.8 }),
);
landMesh.castShadow = landMesh.receiveShadow = true;
spinG.add(landMesh);
const floorMat = new THREE.MeshStandardMaterial({
  color: 0xd9c08a,
  vertexColors: true,
  flatShading: true,
  roughness: 0.85,
});
const floorMesh = new THREE.Mesh(floorPart, floorMat);
floorMesh.receiveShadow = true;
spinG.add(floorMesh);
const FLOOR_SAND = new THREE.Color(0xd9c08a);
const FLOOR_GREEN = new THREE.Color(0xa9c46a);

// the sea: one shell whose radius is a function of latitude (and a wave)
const waterGeo = new THREE.IcosahedronGeometry(R, 4);
const waterDir = Float32Array.from(waterGeo.attributes.position.array, (v) => v / R);
waterGeo.setAttribute(
  "color",
  new THREE.BufferAttribute(new Float32Array(waterGeo.attributes.position.count * 3), 3),
);
const SEA = new THREE.Color(0x2f86e0);
const FOAM = new THREE.Color(0xf4fbff);
const waterMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  vertexColors: true,
  roughness: 0.38,
  metalness: 0.05,
  flatShading: true,
});
const water = new THREE.Mesh(waterGeo, waterMat);
water.receiveShadow = true;
tilt.add(water);
const EU_LON = G.EU[1];
let foamNow = 0;
function waterAt(t, lat, lon) {
  foamNow = 0;
  const s2 = Math.sin(lat * D2R) ** 2;
  let h = 0.0;
  // today: the spin flings the sea to the equator (shown exaggerated)
  const kB = pop(t, T.heute + 0.4, T.steht2 + 0.3, 0.6);
  h += 0.05 * kB * (0.6 - s2);
  // stopped: it flows back to the poles
  const kP = smooth(ramp(t, T.fliesst - 0.3, T.ende + 1.4));
  h += kP * 0.5 * (s2 - 0.38);
  // the wave across Europe
  const kW = pop(t, T.meere - 0.6, T.heute, 0.5);
  if (kW > 0) {
    const c = lerp(EU_LON - 40, EU_LON + 30, smooth(ramp(t, T.meere - 0.6, T.land + 1.2)));
    const dl = wrap(lon - c) / 12;
    const band = Math.exp(-(((lat - 48) / 16) ** 2));
    const wv = kW * 0.22 * Math.exp(-dl * dl) * band;
    h += wv;
    foamNow = Math.max(0, (wv - 0.07) / 0.09);
  }
  // storm chop
  const kS = pop(t, T.luft, T.heute, 0.5);
  if (kS > 0) h += kS * 0.006 * Math.sin(lon * 0.9 + t * 9) * Math.sin(lat * 1.3 - t * 5);
  return h;
}
function updateWater(t) {
  const p = waterGeo.attributes.position;
  const a = p.array;
  const col = waterGeo.attributes.color.array;
  for (let i = 0; i < p.count; i++) {
    const x = waterDir[i * 3];
    const y = waterDir[i * 3 + 1];
    const z = waterDir[i * 3 + 2];
    const lat = Math.asin(Math.max(-1, Math.min(1, y))) / D2R;
    const lon = Math.atan2(x, z) / D2R;
    const r = R + waterAt(t, lat, lon);
    // foam on the wave crest: vertex colour lerps from 1 (sea blue) to white-ish
    const f = Math.min(1, foamNow);
    col[i * 3] = lerp(SEA.r, FOAM.r, f);
    col[i * 3 + 1] = lerp(SEA.g, FOAM.g, f);
    col[i * 3 + 2] = lerp(SEA.b, FOAM.b, f);
    a[i * 3] = x * r;
    a[i * 3 + 1] = y * r;
    a[i * 3 + 2] = z * r;
  }
  p.needsUpdate = true;
  waterGeo.attributes.color.needsUpdate = true;
  waterGeo.computeVertexNormals();
}

// spin: turning on frame 0, braked hard by the button; once more "heute"
const OMEGA = 2.4;
const BRAKE_AT = T.press + 0.06;
const BRAKE = 0.6;
const spinRaw = (t) => {
  if (t < BRAKE_AT) return OMEGA * t;
  const u = Math.min(t - BRAKE_AT, BRAKE);
  return OMEGA * BRAKE_AT + OMEGA * (u - (u * u) / (2 * BRAKE));
};
const SPIN_END = spinRaw(99);
// Europe (geo lon 14°) ends up at G.EU[1] in front of the camera
const THETA0 = (G.EU[1] - 14) * D2R - SPIN_END;
function spinAt(t) {
  let a = spinRaw(t) + THETA0;
  const u = ramp(t, T.heute - 0.1, T.steht2 + 0.15);
  a += Math.PI * 2 * (u - Math.sin(Math.PI * 2 * u) / (Math.PI * 2));
  return a;
}
// the moment the globe shudders to a stop: a small kick of the whole globe
const brakeKick = (t) => {
  const u = t - BRAKE_AT;
  return u < 0 || u > 1.2 ? 0 : Math.sin(u * 30) * Math.exp(-u * 4) * 0.025;
};

// spin swooshes on frame 0: two white arcs racing round the globe until it stops
const arcMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.85,
  depthWrite: false,
});
const arcs = new THREE.Group();
for (const [k, y] of [
  [0, 0.55],
  [Math.PI, -0.35],
]) {
  const rr = Math.sqrt((R + 0.32) ** 2 - y * y);
  const arc = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.03, 6, 48, 1.5), arcMat);
  arc.rotation.x = Math.PI / 2;
  arc.position.y = y;
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 10), arcMat);
  head.position.set(rr, 0, 0);
  head.rotation.z = Math.PI;
  arc.add(head);
  const holder = new THREE.Group();
  holder.rotation.y = k;
  holder.add(arc);
  arcs.add(holder);
}
arcs.traverse((o) => (o.userData.noAO = true));
tilt.add(arcs);

// equator ring (Folge 3)
const ringMat = new THREE.MeshBasicMaterial({ color: 0xffd23f, transparent: true, opacity: 0 });
const eqRing = new THREE.Mesh(new THREE.TorusGeometry(R + 0.075, 0.018, 6, 120), ringMat);
eqRing.rotation.x = Math.PI / 2;
eqRing.userData.noAO = true;
tilt.add(eqRing);

// night half (Übrigens): one side away from the Sun stays dark for half a year
const nightMat = new THREE.MeshBasicMaterial({
  color: 0x05061a,
  transparent: true,
  opacity: 0,
  depthWrite: false,
});
const night = new THREE.Mesh(
  new THREE.SphereGeometry(R + 0.3, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2),
  nightMat,
);
night.position.set(...G.C);
night.quaternion.setFromUnitVectors(
  V(0, 1, 0),
  SUN.clone()
    .sub(V(...G.C))
    .normalize()
    .negate(),
);
night.userData.noAO = true;
scene.add(night);

// ---------------------------------------------------------------- the town on the globe
const ORIGIN = V(...G.C);
const tmpM = new THREE.Matrix4();
const qTmp = new THREE.Quaternion();
// world frame (point, up, east) at a geo lat/lon for a spin angle
function frameAt(lat, lonGeo, a, h = 0) {
  const lonT = lonGeo + a / D2R;
  const p = V(...geo(lat, lonT, h));
  const n = p.clone().sub(ORIGIN).normalize();
  const e = V(...geo(lat, lonT + 0.5, h))
    .sub(p)
    .normalize();
  return { p, n, e };
}
const pastel = [0xf7d6a8, 0xf2b8a0, 0xbfe0f0, 0xf6e7b0, 0xd8c8f0];
function house(seed) {
  const r = rng(seed);
  const g = new THREE.Group();
  const w = 0.07 + r() * 0.03;
  const h = 0.06 + r() * 0.03;
  const walls = F(new THREE.BoxGeometry(w, h, w * 0.8), flat(pastel[seed % 5]), 0.05, seed);
  walls.position.y = h / 2;
  g.add(walls);
  const roof = F(
    new THREE.ConeGeometry(w * 0.78, h * 0.7, 4),
    flat([0xe8674a, 0xf08a3c, 0xd94f5c][seed % 3]),
    0.06,
    seed + 1,
  );
  roof.rotation.y = Math.PI / 4;
  roof.scale.z = 0.8;
  roof.position.y = h + h * 0.35;
  g.add(roof);
  const door = new THREE.Mesh(new THREE.BoxGeometry(w * 0.22, h * 0.45, 0.004), flat(0x6b4a2f));
  door.position.set(0, h * 0.22, w * 0.4 + 0.002);
  g.add(door);
  for (const s of [-1, 1]) {
    const win = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.18, w * 0.18, 0.004),
      flat(0x9fd8ff, { emissive: 0x3a6a90, emissiveIntensity: 0.3 }),
    );
    win.position.set(s * w * 0.28, h * 0.62, w * 0.4 + 0.002);
    g.add(win);
  }
  return g;
}
function tree(seed) {
  const g = new THREE.Group();
  const trunk = F(new THREE.CylinderGeometry(0.006, 0.009, 0.05, 6), M.trunk, 0.05, seed);
  trunk.position.y = 0.025;
  g.add(trunk);
  const crown = F(
    jitter(new THREE.IcosahedronGeometry(0.035, 0), 0.006, seed),
    seed % 2 ? M.leaf : M.leaf2,
    0.08,
    seed,
  );
  crown.position.y = 0.07;
  g.add(crown);
  return g;
}
function person() {
  const g = new THREE.Group();
  const hoodie = flat(0x4a7bd6);
  const legs = flat(0x2c2f3a);
  const skin = flat(0xf1c09a);
  for (const s of [-1, 1]) {
    const leg = F(new THREE.BoxGeometry(0.012, 0.035, 0.014), legs, 0.04, 3);
    leg.position.set(s * 0.009, 0.0175, 0);
    g.add(leg);
    const arm = F(new THREE.BoxGeometry(0.01, 0.032, 0.012), hoodie, 0.04, 4);
    arm.position.set(s * 0.024, 0.05, 0);
    arm.rotation.z = s * 0.5;
    g.add(arm);
  }
  const body = F(new THREE.BoxGeometry(0.036, 0.04, 0.022), hoodie, 0.04, 5);
  body.position.y = 0.054;
  g.add(body);
  const head = F(new THREE.IcosahedronGeometry(0.014, 1), skin, 0.04, 6);
  head.position.y = 0.088;
  g.add(head);
  const hair = F(new THREE.IcosahedronGeometry(0.0145, 1), flat(0x4a2e1f), 0.04, 7);
  hair.position.set(0, 0.092, -0.003);
  hair.scale.set(1, 0.7, 1);
  g.add(hair);
  g.scale.setScalar(1.4);
  return g;
}
const things = [];
function addThing(obj, lat, lon, launch, opts = {}) {
  obj.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  scene.add(obj);
  const r = rng(Math.round(lat * 100 + lon * 7));
  things.push({
    obj,
    lat,
    lon,
    launch,
    v: opts.v ?? 0.42 + r() * 0.12,
    lift: opts.lift ?? 0.05 + r() * 0.05,
    spin: opts.spin ?? (0.6 + r() * 1.4) * (r() > 0.5 ? 1 : -1),
    axis: V(r() - 0.5, r() - 0.5, r() - 0.5).normalize(),
    rotY: opts.rotY ?? r() * Math.PI * 2,
    id: `th${things.length}`,
  });
}
const you = person();
addThing(you, YOU.lat, YOU.lon, T.aber, {
  v: YOU.v,
  lift: YOU.lift,
  spin: 0.35,
  rotY: Math.PI / 2,
});
const HOUSES = [
  [49.6, 9.4],
  [45.2, 10.8],
  [50.3, 17.6],
  [44.9, 18.9],
  [48.0, 22.2],
  [51.6, 13.0],
];
HOUSES.forEach(([la, lo], i) => {
  const h = house(i + 2);
  h.scale.setScalar(1.0);
  addThing(h, la, lo, T.haeuser + i * 0.09);
});
const TREES = [
  [48.4, 6.4],
  [46.1, 6.9],
  [52.6, 16.4],
  [43.7, 15.1],
  [50.7, 21.4],
  [45.9, 22.8],
  [52.1, 9.6],
  [43.9, 8.8],
];
TREES.forEach(([la, lo], i) => addThing(tree(i + 10), la, lo, T.baeume + i * 0.06));
const COWS = [
  [45.6, 14.6],
  [49.1, 11.6],
  [47.1, 18.2],
];
COWS.forEach(([la, lo], i) => {
  const c = cow(i + 3);
  c.scale.setScalar(0.05);
  const g = new THREE.Group();
  g.add(c);
  addThing(g, la, lo, T.kuehe + i * 0.1, { spin: i === 2 ? 2.4 : undefined });
});
const GONE = T.luft + 0.1; // by the storm everything has flown off

function placeThing(th, t) {
  const o = th.obj;
  if (t >= (th.obj === you ? T.haeuser : GONE) && t >= th.launch) {
    o.visible = false;
    return null;
  }
  o.visible = true;
  const a = t < th.launch ? spinAt(t) : spinAt(th.launch);
  const f = frameAt(th.lat, th.lon, a);
  const north = f.e.clone().cross(f.n).negate(); // e × n points south
  tmpM.makeBasis(f.e, f.n, north.clone().negate());
  o.quaternion.setFromRotationMatrix(tmpM);
  qTmp.setFromAxisAngle(V(0, 1, 0), th.rotY);
  o.quaternion.multiply(qTmp);
  let p = f.p;
  if (t >= th.launch) {
    const u = t - th.launch;
    // straight on along the old direction of travel: the tangent leaves the surface
    p = f.p
      .clone()
      .addScaledVector(f.e, th.v * u)
      .addScaledVector(f.n, th.lift * u + 0.012 * u * u);
    qTmp.setFromAxisAngle(th.axis, th.spin * u * 2.2);
    o.quaternion.premultiply(qTmp);
  } else if (t > BRAKE_AT && t < BRAKE_AT + 2.6) {
    // the jolt of the stop: everything wobbles east
    const w = Math.sin((t - BRAKE_AT) * 14) * Math.exp(-(t - BRAKE_AT) * 1.6) * 0.18;
    qTmp.setFromAxisAngle(V(0, 0, 1), -w);
    o.quaternion.multiply(qTmp);
  }
  o.position.copy(p);
  return p;
}

// the airliner you overtake
const plane = new THREE.Group();
{
  const white = flat(0xf4f6fa, { roughness: 0.4 });
  const blue = flat(0x2f6fd6);
  const body = F(new THREE.CylinderGeometry(0.012, 0.01, 0.13, 8), white, 0.04, 41);
  body.rotation.z = Math.PI / 2;
  plane.add(body);
  const nose = F(new THREE.SphereGeometry(0.012, 8, 6), white, 0.04, 42);
  nose.position.x = 0.065;
  plane.add(nose);
  const wing = F(new THREE.BoxGeometry(0.03, 0.003, 0.15), white, 0.04, 43);
  wing.position.x = 0.005;
  plane.add(wing);
  const tailW = F(new THREE.BoxGeometry(0.018, 0.003, 0.05), white, 0.04, 44);
  tailW.position.x = -0.058;
  plane.add(tailW);
  const fin = F(new THREE.BoxGeometry(0.022, 0.03, 0.003), blue, 0.04, 45);
  fin.position.set(-0.058, 0.016, 0);
  plane.add(fin);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.004, 0.0245), blue);
  stripe.position.y = -0.003;
  plane.add(stripe);
  plane.traverse((o) => o.isMesh && (o.castShadow = true));
  plane.scale.setScalar(1.3);
  scene.add(plane);
}

// storm streaks (Folge 2), instanced
const STREAKS = 140;
const streakMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.75,
  depthWrite: false,
});
const streaks = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.006, 0.006), streakMat, STREAKS);
streaks.userData.noAO = true;
scene.add(streaks);
const streakSeed = (() => {
  const r = rng(77);
  return Array.from({ length: STREAKS }, () => ({
    lat: 30 + r() * 36,
    lon0: r() * 120,
    h: 0.05 + r() * 0.3,
    len: 0.08 + r() * 0.18,
    v: 70 + r() * 60,
  }));
})();
const sMat4 = new THREE.Matrix4();
function updateStreaks(t, k) {
  streaks.visible = k > 0.01;
  if (!streaks.visible) return;
  streakMat.opacity = 0.75 * k;
  const a = spinAt(t);
  for (let i = 0; i < STREAKS; i++) {
    const s = streakSeed[i];
    const lon = EU_LON - 60 + ((s.lon0 + s.v * t) % 120);
    const f = frameAt(s.lat, lon - a / D2R, a, s.h);
    const north = f.e.clone().cross(f.n).negate();
    sMat4.makeBasis(f.e, f.n, north.negate());
    sMat4.scale(V(s.len * (0.3 + 0.7 * k), 1, 1));
    sMat4.setPosition(f.p);
    streaks.setMatrixAt(i, sMat4);
  }
  streaks.instanceMatrix.needsUpdate = true;
}

// Folge 3 arrows: outward at the equator (spin flings), then to the poles
const fling = makeArrowSet(
  [-60, -25, 15, 50].map((lo) => [V(...geo(0, lo, 0.1)), V(...geo(0, lo, 1.1))]),
  { mat: forceMat, amp: 0, r: 0.035 },
);
const toPoles = makeArrowSet(
  [-40, -6, 28].flatMap((lo) => [
    [V(...geo(12, lo, 0.22)), V(...geo(58, lo, 0.32))],
    [V(...geo(-12, lo, 0.22)), V(...geo(-52, lo, 0.32))],
  ]),
  { mat: coldMat, amp: 0.05, r: 0.05 },
);

// the map that won't be right any more
const mapCard = new THREE.Group();
{
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 300;
  const g = c.getContext("2d");
  g.fillStyle = "#f6ecd2";
  g.fillRect(0, 0, 512, 300);
  g.fillStyle = "#7fc1e6";
  g.fillRect(14, 14, 484, 272);
  g.fillStyle = "#5aa640";
  for (let y = 0; y < 272; y += 4)
    for (let x = 0; x < 484; x += 4) {
      const lat = 82 - (y / 272) * 150;
      const lon = -180 + (x / 484) * 360;
      if (landMask(lat, lon) > 0.02) g.fillRect(14 + x, 14 + y, 4, 4);
    }
  g.strokeStyle = "rgba(255,255,255,.45)";
  g.lineWidth = 2;
  for (let i = 1; i < 6; i++) {
    g.beginPath();
    g.moveTo(14 + (i * 484) / 6, 14);
    g.lineTo(14 + (i * 484) / 6, 286);
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const card = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.0, 0.03), [
    flat(0xe9dcbc),
    flat(0xe9dcbc),
    flat(0xe9dcbc),
    flat(0xe9dcbc),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 }),
    flat(0xe9dcbc),
  ]);
  card.castShadow = true;
  mapCard.add(card);
  mapCard.position.set(-2.7, 2.1, 3.0);
  scene.add(mapCard);
}

const hand = createHand({ scale: 0.85 });
const applyCamera = shotCamera(shots);

// ---------------------------------------------------------------- render
function renderAt(t) {
  window.__sunSpin?.(t);
  // the hand slams the button (keys before 0: the loop tail shows it coming)
  hand.track(t, [
    { t: -1.0, pos: [3.5, 2.5, 3.9], rot: [-0.3, -2.2, 0], pose: "open" },
    { t: -0.25, pos: [2.75, 1.75, 3.45], rot: [-0.45, -2.2, 0], pose: "fist" },
    { t: T.press, pos: [2.38, 1.3, 3.22], rot: [-0.55, -2.2, 0], pose: "fist" },
    { t: T.press + 0.5, pos: [2.4, 1.32, 3.23], rot: [-0.55, -2.2, 0], pose: "fist" },
    { t: T.gleich - 0.3, pos: [2.42, 1.34, 3.24], rot: [-0.55, -2.2, 0], pose: "fist" },
    { t: T.gleich, pos: [3.5, 2.5, 3.9], rot: [-0.3, -2.2, 0], pose: "open", out: true },
  ]);
  const pressed = t >= T.press - 0.02 && t < T.cta;
  button.position.copy(BTN).add(V(0, 0.07 - (pressed ? 0.05 : 0), 0));
  const glow = pressed ? 0.5 + 0.5 * Math.exp(-(t - T.press) * 1.5) : 0;
  btnMat.emissiveIntensity = 0.15 + 1.6 * glow;
  btnGlow.intensity = 6 * glow;

  // the globe
  spinG.rotation.y = spinAt(t);
  const arcK = 1 - ramp(t, BRAKE_AT, BRAKE_AT + 0.35);
  arcs.visible = arcK > 0;
  arcs.rotation.y = spinAt(t) * 1.15 + 0.6;
  arcMat.opacity = 0.85 * arcK;
  tilt.rotation.z = brakeKick(t);
  updateWater(t);
  const green = smooth(ramp(t, T.superkontinent - 0.4, T.superkontinent + 0.8));
  floorMat.color.copy(FLOOR_SAND).lerp(FLOOR_GREEN, green);
  ringMat.opacity = 0.95 * pop(t, T.aequator - 0.1, T.steht2 + 0.8);
  nightMat.opacity =
    0.62 * smooth(ramp(t, T.fakt + 0.2, T.fakt + 1.0)) * (1 - ramp(t, T.cta + 0.6, T.cta + 1.6));

  // the town: you first, then houses, trees, cows
  let youP = null;
  for (const th of things) {
    const p = placeThing(th, t);
    if (th.obj === you) youP = p;
    if (p && t >= th.launch && t < th.launch + 0.8) puff(th.id, t, th.launch, p.x, p.y, p.z, 0.08);
  }
  if (youP)
    showLabel("du", pop(t, T.aber + 0.15, T.osten), "Du", youP.clone().add(V(0, 0.06, 0)), -1);

  // the airliner, slower than you
  plane.visible = t >= T.flugzeug - 0.5 && t < T.haeuser;
  if (plane.visible && youP) {
    const f = frameAt(YOU.lat, YOU.lon, spinAt(T.aber));
    const back = -0.02 + 0.2 * (t - (T.flugzeug - 0.5));
    plane.position.copy(youP).addScaledVector(f.e, -back).addScaledVector(f.n, -0.03);
    tmpM.makeBasis(f.e, f.n, f.e.clone().cross(f.n));
    plane.quaternion.setFromRotationMatrix(tmpM);
  }

  // the map card + its ✕
  const mk = pop(t, T.karte, T.erde2, 0.3);
  mapCard.visible = mk > 0;
  if (mapCard.visible) {
    mapCard.scale.copy(squash(t, T.karte)).multiplyScalar(Math.max(0.001, mk));
    mapCard.rotation.set(-0.05, 0.35 + Math.sin(t * 1.3) * 0.05, Math.sin(t * 0.9) * 0.03);
  }
  showNope(pop(t, T.karte + 0.35, T.erde2, 0.25), -2.6, 2.15, 3.3, 0.9);

  // storm, arrows
  updateStreaks(t, pop(t, T.luft, T.heute, 0.4));
  animateArrows(fling, t, pop(t, T.heute + 0.5, T.steht2));
  animateArrows(toPoles, t, pop(t, T.fliesst - 0.2, T.ende + 0.3));

  // LED facts
  if (t >= T.hurrikan - 0.2 && t < T.meere)
    showPanel(pop(t, T.hurrikan - 0.2, T.meere), "WIND IN KM/H", "1100", LED.red);
  else if (t >= T.jahr - 0.5 && t < T.cta)
    showPanel(pop(t, T.jahr - 0.5, T.cta), "1 TAG", "= 1 JAHR", LED.yellow);
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
