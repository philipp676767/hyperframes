// "So funktioniert ein Kühlschrank". The shared island world, captions
// anchoring, camera shots, LED panel and arrows live in world.js; this file
// only builds the fridge story.
import {
  THREE,
  W,
  END,
  clamp01,
  ramp,
  lerp,
  smooth,
  easeInOut,
  outBack,
  inBack,
  pop,
  rng,
  rand,
  V,
  jitter,
  scene,
  flat,
  M,
  xrayMaterial,
  xrayEdges,
  setXray,
  addFloor,
  roundedRect,
  showNope,
  makeArrowSet,
  animateArrows,
  showPanel,
  LED,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { createWorld } from "./environments.js";

Object.assign(M, {
  condenser: new THREE.MeshStandardMaterial({
    color: 0x2c2c30,
    metalness: 0.4,
    roughness: 0.5,
    emissive: 0xff5a1a,
    emissiveIntensity: 0,
  }),
  discharge: new THREE.MeshStandardMaterial({
    color: 0xc8743c,
    metalness: 0.6,
    roughness: 0.35,
    emissive: 0xff4a10,
    emissiveIntensity: 0,
  }),
  compressor: new THREE.MeshStandardMaterial({ color: 0x1f2124, metalness: 0.3, roughness: 0.45 }),
  milk: flat(0xfbfaf4, { roughness: 0.4 }),
  milkCap: flat(0x2f6fd6),
  ice: new THREE.MeshStandardMaterial({
    color: 0xd9f4ff,
    roughness: 0.08,
    metalness: 0,
    transparent: true,
    opacity: 0.82,
    emissive: 0x8fd6ff,
    emissiveIntensity: 0.18,
    flatShading: true,
  }),
  skin: flat(0xf0b08a),
  drop: new THREE.MeshStandardMaterial({
    color: 0xbfe8ff,
    roughness: 0.05,
    transparent: true,
    opacity: 0.8,
    emissive: 0x9fdcff,
    emissiveIntensity: 0.15,
  }),
  capillary: new THREE.MeshStandardMaterial({
    color: 0xd9894f,
    metalness: 0.6,
    roughness: 0.3,
    emissive: 0x4fd8ff,
    emissiveIntensity: 0,
  }),
  pumpBody: flat(0x5b6b7a, { roughness: 0.5, metalness: 0.3 }),
  pumpHot: flat(0x6b7480, { roughness: 0.5, emissive: 0xff3b10, emissiveIntensity: 0 }),
});

// floating island at sunset + kitchen tiles under the fridge
createWorld({ env: "insel" });
addFloor(3.6);

// ---------------------------------------------------------------- props
function milkBottle() {
  const g = new THREE.Group();
  const prof = [
    [0, 0],
    [0.17, 0],
    [0.19, 0.03],
    [0.19, 0.38],
    [0.15, 0.48],
    [0.085, 0.56],
    [0.08, 0.64],
    [0, 0.64],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const body = new THREE.Mesh(new THREE.LatheGeometry(prof, 12), M.milk);
  body.castShadow = true;
  g.add(body);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.07, 12), M.milkCap);
  cap.position.y = 0.66;
  g.add(cap);
  const band = new THREE.Mesh(
    new THREE.CylinderGeometry(0.195, 0.195, 0.13, 12, 1, true),
    M.milkCap,
  );
  band.position.y = 0.2;
  g.add(band);
  return g;
}

// hook: wooden crate full of ice + milk
const crate = new THREE.Group();
const ice = [];
let crateWater;
let puddle;
const hookMilk = milkBottle();
{
  const w = 1.6;
  const h = 0.9;
  const d = 1.1;
  const bottom = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, d), M.woodDark);
  bottom.position.y = 0.07;
  crate.add(bottom);
  for (let r = 0; r < 3; r++) {
    const y = 0.2 + r * 0.29;
    for (const s of [-1, 1]) {
      const fb = new THREE.Mesh(new THREE.BoxGeometry(w, 0.24, 0.06), M.wood);
      fb.position.set(0, y, (s * d) / 2);
      fb.castShadow = true;
      crate.add(fb);
      const lr = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.24, d), M.wood);
      lr.position.set((s * w) / 2, y, 0);
      lr.castShadow = true;
      crate.add(lr);
    }
  }
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, h, 0.1), M.woodDark);
      post.position.set((sx * w) / 2, h / 2 + 0.05, (sz * d) / 2);
      crate.add(post);
    }
  crateWater = new THREE.Mesh(new THREE.BoxGeometry(w - 0.1, 1, d - 0.1), M.water);
  crate.add(crateWater);
  const ir = rng(99);
  for (let i = 0; i < 18; i++) {
    const s = 0.22 + ir() * 0.1;
    const m = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), M.ice);
    let x = (ir() - 0.5) * (w - 0.4);
    const z = (ir() - 0.5) * (d - 0.4);
    if (Math.abs(x) < 0.3 && Math.abs(z) < 0.3) x += x < 0 ? -0.35 : 0.35;
    m.position.set(x, 0.55 + ir() * 0.4, z);
    m.rotation.set(ir() * 3, ir() * 3, ir() * 3);
    m.userData.base = m.position.clone();
    m.userData.delay = ir() * 0.5;
    crate.add(m);
    ice.push(m);
  }
  hookMilk.position.set(0, 0.45, 0);
  crate.add(hookMilk);
  puddle = new THREE.Mesh(new THREE.CircleGeometry(1, 28), M.water);
  puddle.rotation.x = -Math.PI / 2;
  puddle.position.y = 0.05;
  scene.add(puddle);
}
scene.add(crate);

// ---------------------------------------------------------------- fridge
const FW = 1.5;
const FH = 2.9;
const FD = 1.2;
const FY = 0.14; // body bottom (feet below)
const fridge = new THREE.Group();
scene.add(fridge);

const shellMat = xrayMaterial(0xffffff);
const doorMat = xrayMaterial(0xffffff);
const bodyGeo = new THREE.ExtrudeGeometry(roundedRect(FW, FH, 0.3), {
  depth: FD,
  bevelEnabled: true,
  bevelThickness: 0.04,
  bevelSize: 0.04,
  bevelSegments: 2,
  curveSegments: 6,
});
const body = new THREE.Mesh(bodyGeo, shellMat);
body.position.set(0, FY, -0.65);
body.castShadow = true;
fridge.add(body);
const bodyEdges = xrayEdges(bodyGeo);
bodyEdges.position.copy(body.position);
fridge.add(bodyEdges);

const doorPivot = new THREE.Group();
doorPivot.position.set(-FW / 2, FY, 0.6);
fridge.add(doorPivot);
const doorGeo = new THREE.ExtrudeGeometry(roundedRect(FW, FH, 0.3), {
  depth: 0.1,
  bevelEnabled: true,
  bevelThickness: 0.03,
  bevelSize: 0.03,
  bevelSegments: 2,
  curveSegments: 6,
});
const door = new THREE.Mesh(doorGeo, doorMat);
door.position.set(FW / 2, 0, 0);
door.castShadow = true;
doorPivot.add(door);
const doorEdges = xrayEdges(doorGeo);
doorEdges.position.copy(door.position);
doorPivot.add(doorEdges);
const handle = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.75, 4, 8), M.chrome);
handle.position.set(FW - 0.17, 1.95, 0.22);
doorPivot.add(handle);
const doorHardware = [handle];
for (const dy of [-0.38, 0.38]) {
  const st = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.1, 6), M.chrome);
  st.rotation.x = Math.PI / 2;
  st.position.set(FW - 0.17, 1.95 + dy, 0.16);
  doorPivot.add(st);
  doorHardware.push(st);
}
const badge = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.02), M.chrome);
badge.position.set(FW / 2, FH - 0.35, 0.14);
doorPivot.add(badge);
doorHardware.push(badge);
for (const sx of [-1, 1])
  for (const sz of [-1, 1]) {
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, FY, 8), M.rubber);
    foot.position.set(sx * 0.6, FY / 2, sz * 0.45 - 0.05);
    fridge.add(foot);
  }

// interior (seen in x-ray)
const interior = new THREE.Group();
fridge.add(interior);
const glassShelf = new THREE.MeshStandardMaterial({
  color: 0xdff4ff,
  transparent: true,
  opacity: 0.55,
  roughness: 0.1,
});
for (const y of [1.0, 1.9]) {
  const s = new THREE.Mesh(new THREE.BoxGeometry(FW - 0.2, 0.035, FD - 0.25), glassShelf);
  s.position.set(0, y, -0.02);
  interior.add(s);
}
const fridgeMilk = milkBottle();
fridgeMilk.position.set(-0.25, 1.02, 0.12);
interior.add(fridgeMilk);
const apple = new THREE.Mesh(
  jitter(new THREE.IcosahedronGeometry(0.13, 1), 0.01, 5),
  flat(0xe0362f),
);
apple.position.set(0.35, 2.04, 0.15);
interior.add(apple);
const cheese = new THREE.Mesh(
  new THREE.CylinderGeometry(0.22, 0.22, 0.16, 3, 1, false, 0, Math.PI / 2),
  flat(0xffcf3a),
);
cheese.position.set(-0.25, 2.0, 0.1);
interior.add(cheese);
const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.24, 10), flat(0xe8586b));
jar.position.set(0.35, 1.14, 0.18);
interior.add(jar);

// thermostat: dial box on the inside ceiling + sensor bulb
const thermo = new THREE.Group();
{
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.14, 0.2), flat(0xf2f2f2));
  thermo.add(box);
  const dial = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.05, 14),
    flat(0x3b82f6, { emissive: 0x3b82f6, emissiveIntensity: 0 }),
  );
  dial.rotation.x = Math.PI / 2;
  dial.position.set(0.08, -0.01, 0.11);
  thermo.add(dial);
  thermo.userData.dial = dial;
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), M.copper);
  bulb.position.set(-0.3, -0.25, -0.2);
  thermo.add(bulb);
  const wire = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([V(-0.15, -0.02, 0), V(-0.28, -0.1, -0.1), V(-0.3, -0.22, -0.2)]),
      10,
      0.008,
      4,
    ),
    M.copper,
  );
  thermo.add(wire);
  thermo.position.set(0.32, FY + FH - 0.25, 0.25);
}
interior.add(thermo);

// compressor at the bottom back
const compressor = new THREE.Group();
{
  const dome = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.18, 6, 12), M.compressor);
  dome.rotation.z = Math.PI / 2;
  dome.castShadow = true;
  compressor.add(dome);
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.05, 0.36), M.rubber);
  base.position.y = -0.2;
  compressor.add(base);
  compressor.position.set(0.22, 0.32, -0.98);
}
fridge.add(compressor);

// ---------------------------------------------------------------- refrigerant loop
// Segments in order of flow. Each becomes its own tube (revealed when it's named)
// and a stretch of the shared particle track.
function serpentine(x0, x1, ys, z, startLeft = true) {
  const pts = [];
  let left = startLeft;
  ys.forEach((y, i) => {
    const xa = left ? x0 : x1;
    const xb = left ? x1 : x0;
    pts.push(V(xa, y, z), V(xb, y, z));
    if (i < ys.length - 1) {
      const yn = ys[i + 1];
      const r = (y - yn) / 2;
      const cx = xb;
      const cy = y - r;
      const dir = left ? 1 : -1;
      for (let k = 1; k < 8; k++) {
        const a = Math.PI / 2 - (k / 8) * Math.PI;
        pts.push(V(cx + dir * r * Math.cos(a), cy + r * Math.sin(a), z));
      }
    }
    left = !left;
  });
  return pts;
}
function densify(pts, step = 0.03) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const n = Math.max(1, Math.ceil(a.distanceTo(b) / step));
    for (let k = 0; k < n; k++) out.push(a.clone().lerp(b, k / n));
  }
  out.push(pts[pts.length - 1].clone());
  return out;
}
const evapYs = [2.75, 2.5, 2.25, 2.0, 1.75].map((y) => y + FY - 0.14);
const condYs = Array.from({ length: 9 }, (_, i) => 0.78 + i * 0.25);
const evapPts = serpentine(-0.55, 0.55, evapYs, -0.5, true);
const evapEnd = evapPts[evapPts.length - 1];
const suctionPts = new THREE.CatmullRomCurve3(
  [
    evapEnd,
    V(0.64, evapEnd.y - 0.12, -0.5),
    V(0.72, evapEnd.y - 0.3, -0.78),
    V(0.72, 0.9, -0.8),
    V(0.66, 0.42, -0.95),
    V(0.46, 0.33, -0.98),
  ],
  false,
  "centripetal",
).getPoints(60);
const compPts = [V(0.46, 0.33, -0.98), V(0.22, 0.4, -0.98), V(0.12, 0.5, -0.96)];
const condStart = V(0.55, condYs[0], -0.88);
const dischargePts = new THREE.CatmullRomCurve3(
  [V(0.12, 0.5, -0.96), V(0.2, 0.66, -0.93), V(0.42, 0.74, -0.9), condStart],
  false,
  "centripetal",
).getPoints(30);
const condPts = serpentine(-0.55, 0.55, condYs.slice().reverse(), -0.88, false).reverse();
// condPts runs bottom-right → top-left
const condEnd = condPts[condPts.length - 1];
const capPts = (() => {
  const pts = [condEnd, V(-0.66, condEnd.y + 0.08, -0.88)];
  const cy = condEnd.y + 0.2;
  const turns = 7;
  for (let k = 0; k <= turns * 16; k++) {
    const f = k / (turns * 16);
    const a = f * turns * Math.PI * 2;
    pts.push(V(-0.66 + Math.cos(a) * 0.06, cy + Math.sin(a) * 0.06, lerp(-0.86, -0.56, f)));
  }
  pts.push(V(-0.64, evapPts[0].y + 0.05, -0.52), evapPts[0]);
  return pts;
})();

const SEGMENTS = [
  { key: "evap", pts: densify(evapPts), radius: 0.028, mat: M.alu },
  { key: "suction", pts: densify(suctionPts), radius: 0.026, mat: M.copper },
  { key: "comp", pts: densify(compPts), radius: 0.0, mat: null },
  { key: "discharge", pts: densify(dischargePts), radius: 0.026, mat: M.discharge },
  { key: "cond", pts: densify(condPts), radius: 0.028, mat: M.condenser },
  { key: "cap", pts: densify(capPts, 0.015), radius: 0.014, mat: M.capillary },
];
const track = [];
const trackLen = [];
let total = 0;
for (const seg of SEGMENTS) {
  seg.s0 = total;
  seg.pts.forEach((p, i) => {
    if (track.length) total += p.distanceTo(track[track.length - 1]);
    if (i === 0 && track.length) return; // shared joint
    track.push(p);
    trackLen.push(total);
  });
  seg.s1 = total;
  if (seg.mat) {
    const curve = new THREE.CatmullRomCurve3(seg.pts, false, "catmullrom", 0.2);
    const ts = Math.max(20, Math.floor(seg.pts.length * 1.2));
    const geo = new THREE.TubeGeometry(curve, ts, seg.radius, 8, false);
    seg.mesh = new THREE.Mesh(geo, seg.mat);
    seg.mesh.castShadow = true;
    seg.tris = ts * 8 * 6;
    fridge.add(seg.mesh);
  }
}
total += track[0].distanceTo(track[track.length - 1]);
const LOOP = total;
const segBy = Object.fromEntries(SEGMENTS.map((s) => [s.key, s]));

// condenser fins (vertical wires)
const fins = new THREE.Group();
for (let i = 0; i < 9; i++) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 2.2, 4), M.condenser);
  m.position.set(-0.48 + i * 0.12, 1.78, -0.91);
  fins.add(m);
}
fridge.add(fins);

function trackPos(s, out) {
  s = ((s % LOOP) + LOOP) % LOOP;
  if (s >= trackLen[trackLen.length - 1]) {
    const a = track[track.length - 1];
    const k = (s - trackLen[trackLen.length - 1]) / (LOOP - trackLen[trackLen.length - 1]);
    return out.copy(a).lerp(track[0], k);
  }
  let lo = 0;
  let hi = trackLen.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (trackLen[mid] <= s) lo = mid;
    else hi = mid;
  }
  const k = (s - trackLen[lo]) / Math.max(1e-6, trackLen[hi] - trackLen[lo]);
  return out.copy(track[lo]).lerp(track[hi], k);
}

// flow particles
const NP = 300;
const flowMesh = new THREE.InstancedMesh(
  new THREE.SphereGeometry(1, 8, 6),
  new THREE.MeshBasicMaterial({ color: 0xffffff }),
  NP,
);
flowMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
flowMesh.frustumCulled = false;
fridge.add(flowMesh);
const C = {
  cold: new THREE.Color(0x2f9bff),
  coolGas: new THREE.Color(0xa8dcff),
  hot: new THREE.Color(0xff3d1f),
  warm: new THREE.Color(0xffa83a),
  warmLiquid: new THREE.Color(0xffd166),
  ice: new THREE.Color(0x62e6ff),
};
function flowColor(key, f, out) {
  switch (key) {
    case "evap":
      return out.copy(C.cold).lerp(C.coolGas, f);
    case "suction":
    case "comp":
      return out.copy(C.coolGas);
    case "discharge":
      return out.copy(C.hot);
    case "cond":
      return f < 0.5
        ? out.copy(C.hot).lerp(C.warm, f * 2)
        : out.copy(C.warm).lerp(C.warmLiquid, (f - 0.5) * 2);
    default:
      return out.copy(C.warmLiquid).lerp(C.ice, smooth(ramp(f, 0.25, 0.9)));
  }
}

// boiling bubbles in the evaporator
const NB = 46;
const bubbles = new THREE.InstancedMesh(
  new THREE.SphereGeometry(1, 8, 6),
  new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }),
  NB,
);
bubbles.frustumCulled = false;
fridge.add(bubbles);
const bubbleSeed = Array.from({ length: NB }, () => [rand(), rand(), rand(), rand()]);

// frost sparkles at the capillary exit
const NF = 40;
const frost = new THREE.InstancedMesh(
  new THREE.OctahedronGeometry(1, 0),
  new THREE.MeshBasicMaterial({ color: 0xe8fbff }),
  NF,
);
frost.frustumCulled = false;
fridge.add(frost);
const frostSeed = Array.from({ length: NF }, () => [rand(), rand(), rand(), rand()]);

// ---------------------------------------------------------------- heat arrows
// heat from food into the evaporator
const arrowsIn = makeArrowSet(
  [
    [V(-0.2, 1.45, 0.25), V(-0.2, 2.05, -0.45)],
    [V(0.35, 1.35, 0.3), V(0.3, 1.95, -0.45)],
    [V(0.3, 2.2, 0.3), V(0.1, 2.5, -0.45)],
  ],
  { parent: fridge },
);
// heat out of the condenser into the kitchen
const arrowsOut = makeArrowSet(
  [-0.4, 0.1, 0.5].flatMap((x, i) => [
    [V(x, 1.2 + (i % 2) * 0.2, -0.95), V(x + 0.1, 1.5, -1.9)],
    [V(x + 0.05, 2.2 - (i % 2) * 0.2, -0.95), V(x - 0.05, 2.6, -1.9)],
  ]),
  { parent: fridge, r: 0.026 },
);

// ---------------------------------------------------------------- sweat analogy set
const S = V(-5.1, 0, 2.2);
const sweat = new THREE.Group();
sweat.position.copy(S);
scene.add(sweat);
const drops = [];
const steamPuffs = [];
let sweatArrows;
{
  const skin = new THREE.Mesh(
    jitter(new THREE.SphereGeometry(1.5, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0.04, 77),
    M.skin,
  );
  skin.scale.set(1, 0.42, 0.8);
  skin.receiveShadow = true;
  sweat.add(skin);
  const dr = rng(21);
  for (let i = 0; i < 6; i++) {
    const a = dr() * Math.PI * 2;
    const r = 0.15 + dr() * 0.75;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r * 0.8;
    const y = 0.63 * Math.sqrt(Math.max(0, 1 - (x * x) / 2.25 - (z * z) / (1.44 * 1.0))) * 1.0;
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.17 + dr() * 0.07, 12, 8), M.drop);
    m.scale.y = 0.6;
    m.position.set(x, y, z);
    m.userData.base = m.position.clone();
    m.userData.s = 1;
    sweat.add(m);
    drops.push(m);
  }
  for (let i = 0; i < 24; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), M.steam.clone());
    m.userData.seed = [dr(), dr(), dr()];
    sweat.add(m);
    steamPuffs.push(m);
  }
  sweatArrows = makeArrowSet(
    drops
      .slice(0, 4)
      .map((d) => [
        d.position.clone().add(V(S.x, S.y - 0.25, S.z)),
        d.position.clone().add(V(S.x, S.y + 0.55, S.z)),
      ]),
    { r: 0.018, amp: 0.035 },
  );
}

// ---------------------------------------------------------------- bike pump analogy
const P = V(4.7, 0, 1.6);
const pump = new THREE.Group();
pump.position.copy(P);
pump.rotation.y = -0.5;
scene.add(pump);
const pumpRod = new THREE.Group();
let pumpArrows;
{
  const foot = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.25), M.rubber);
  foot.position.y = 0.03;
  pump.add(foot);
  const barrelLow = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.55, 14), M.pumpHot);
  barrelLow.position.y = 0.335;
  pump.add(barrelLow);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.85, 14), M.pumpBody);
  barrel.position.y = 1.035;
  barrel.castShadow = true;
  pump.add(barrel);
  const capTop = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.06, 14), M.rubber);
  capTop.position.y = 1.48;
  pump.add(capTop);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 8), M.chrome);
  rod.position.y = -0.5;
  pumpRod.add(rod);
  const grip = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.6, 4, 8), M.rubber);
  grip.rotation.z = Math.PI / 2;
  pumpRod.add(grip);
  pump.add(pumpRod);
  const hose = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        V(0.12, 0.12, 0),
        V(0.4, 0.08, 0.2),
        V(0.6, 0.1, 0.5),
        V(0.5, 0.06, 0.8),
      ]),
      20,
      0.03,
      6,
    ),
    M.rubber,
  );
  pump.add(hose);
  pumpArrows = makeArrowSet(
    [
      [V(0.2, 0.25, 0), V(0.75, 0.55, 0)],
      [V(-0.2, 0.35, 0), V(-0.75, 0.65, 0)],
      [V(0, 0.3, 0.2), V(0.1, 0.6, 0.75)],
    ],
    { parent: pump, r: 0.024 },
  );
}

// ---------------------------------------------------------------- sound rings
const rings = [];
for (let i = 0; i < 3; i++) {
  const m = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.012, 6, 48),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false }),
  );
  fridge.add(m);
  rings.push(m);
}

// interior light for the outro
const innerLight = new THREE.PointLight(0xfff3d6, 0, 4, 1.5);
innerLight.position.set(0, 2.4, 0.2);
fridge.add(innerLight);

// ---------------------------------------------------------------- beats (word anchors)
const T = {
  hookStart: 0,
  kiste: W("Kiste"),
  built1: W("Kühlschrank", 1),
  aber1: W("Aber", 1),
  morgen: W("morgen"),
  pfuetze: W("Pfütze"),
  pfuetzeEnd: W("Pfütze", 1, true),
  also1: W("Also", 1),
  trick: W("Trick"),
  verdampft: W("verdampft"),
  schluckt: W("schluckt"),
  wie1: W("wie", 1),
  haut: W("Haut", 1, true),
  legst: W("legst"),
  rohr1: W("Rohr", 1),
  rueckwandEnd: W("Rückwand", 1, true),
  gefuellt: W("gefüllt"),
  minus: W("minus"),
  kocht: W("kocht"),
  verdampfer: W("Verdampfer"),
  aber2: W("Aber", 2),
  voller: W("voller"),
  presst: W("presst"),
  wie2: W("wie", 2),
  heiss: W("heiß"),
  kompressor: W("Kompressor"),
  heisse: W("heiße"),
  jagst: W("jagst"),
  hintenEnd: W("Kühlschrank", 2, true),
  gibt: W("gibt"),
  fluessig: W("flüssig"),
  kondensator: W("Kondensator"),
  darum1: W("Darum", 1),
  warm: W("warm", 1),
  dann: W("Dann"),
  quetschst: W("quetschst"),
  roehrchenEnd: W("Röhrchen", 1, true),
  druck: W("Druck"),
  eiskalt: W("eiskalt"),
  kapillar: W("Kapillarrohr"),
  jetzt2: W("jetzt", 2),
  damit: W("damit"),
  gefriert: W("gefriert"),
  schaltet: W("schaltet"),
  aus: W("aus", 1),
  thermostat: W("Thermostat"),
  darum2: W("Darum", 2),
  brummt: W("brummt"),
  mal2: W("mal", 2),
  nicht2: W("nicht", 2),
  schau: W("Schau"),
  gerade: W("gerade"),
};

// ---------------------------------------------------------------- shots
const shots = [
  { at: 0, from: [2.6, 1.7, 3.6], to: [1.9, 1.45, 3.0], look: [0, 0.55, 0] },
  { at: T.kiste, from: [1.0, 2.0, 1.9], to: [0.7, 1.85, 1.55], look: [0, 0.6, 0] },
  { at: T.built1, from: [4.4, 3.4, 7.2], to: [3.6, 2.8, 6.0], look: [0, 0.6, 0] },
  { at: T.aber1, from: [-1.9, 0.95, 2.3], to: [-1.45, 0.9, 1.85], look: [0, 0.35, 0] },
  { at: T.also1, from: [3.0, 2.3, 4.9], to: [2.4, 2.0, 4.1], look: [0, 1.5, 0] },
  { at: T.trick, from: [1.7, 1.3, 1.8], to: [1.3, 1.1, 1.45], look: [0, 0.35, 0], rel: S },
  { at: T.wie1, from: [-1.0, 0.8, 1.1], to: [-0.75, 0.7, 0.85], look: [0, 0.45, 0], rel: S },
  { at: T.legst, from: [-2.5, 3.1, 3.4], to: [-2.0, 2.85, 2.9], look: [0, 2.0, -0.3] },
  { at: T.gefuellt, from: [0.55, 2.35, 1.7], to: [0.3, 2.3, 1.3], look: [0, 2.25, -0.5] },
  { at: T.minus, from: [1.5, 2.65, 2.6], to: [1.2, 2.55, 2.25], look: [0.25, 2.4, -0.2] },
  { at: T.verdampfer, from: [1.7, 1.9, 3.7], to: [1.1, 1.95, 3.25], look: [0, 1.85, -0.2] },
  {
    at: T.aber2,
    from: [2.5, 1.9, -1.0],
    to: [2.3, 1.1, -1.5],
    look: [0.6, 1.3, -0.7],
    lookTo: [0.5, 0.6, -0.9],
  },
  { at: T.presst, from: [1.3, 0.75, -2.7], to: [1.0, 0.65, -2.25], look: [0.25, 0.42, -0.95] },
  { at: T.wie2, from: [1.6, 1.6, 2.0], to: [1.25, 1.4, 1.65], look: [0, 0.75, 0], rel: P },
  { at: T.kompressor, from: [-0.7, 0.95, -2.1], to: [-0.4, 0.85, -1.85], look: [0.3, 0.5, -0.95] },
  { at: T.heisse, from: [-1.7, 2.3, -4.4], to: [-1.25, 2.05, -3.7], look: [0, 1.75, -0.9] },
  { at: T.gibt, from: [2.1, 2.3, -3.1], to: [1.75, 2.1, -2.8], look: [0, 1.75, -1.1], zoom: 1.45 },
  { at: T.kondensator, orbit: { c: [0, 1.75, -0.9], r: 2.9, y: 1.8, a0: -1.25, a1: -1.9 } },
  { at: T.darum1, from: [1.9, 2.5, -3.3], to: [1.6, 2.35, -2.9], look: [0.3, 2.1, -1.0] },
  {
    at: T.dann,
    from: [-1.6, 3.35, -0.2],
    to: [-1.4, 3.15, -0.45],
    look: [-0.64, 2.95, -0.7],
    zoom: 1.0,
  },
  {
    at: T.druck,
    from: [-0.1, 3.0, 0.75],
    to: [-0.25, 2.92, 0.4],
    look: [-0.5, 2.75, -0.5],
    zoom: 1.2,
  },
  { at: T.kapillar, from: [-2.5, 3.1, -1.7], to: [-2.7, 2.7, -1.25], look: [-0.4, 2.4, -0.6] },
  { at: T.jetzt2, orbit: { c: [0, 1.6, -0.2], r: 4.3, y: 2.5, a0: 0.95, a1: -0.95 } },
  {
    at: T.damit,
    from: [0.55, 1.65, 1.6],
    to: [0.35, 1.55, 1.25],
    look: [-0.2, 1.35, 0.1],
    zoom: 1.4,
  },
  {
    at: T.schaltet,
    from: [1.0, 2.55, 1.6],
    to: [0.85, 2.6, 1.35],
    look: [0.35, 2.82, 0.25],
    zoom: 1.3,
  },
  { at: T.thermostat, from: [3.3, 2.1, 2.3], to: [2.9, 1.85, 1.7], look: [0, 1.45, -0.3] },
  { at: T.darum2, from: [1.7, 0.95, -2.7], to: [1.35, 0.85, -2.25], look: [0.25, 0.45, -0.95] },
  { at: T.schau, from: [0.9, 1.85, 3.8], to: [0.55, 1.75, 3.1], look: [0, 1.6, 0] },
  {
    at: T.gerade,
    from: [3.2, 2.5, 5.2],
    to: [9.5, 7.5, 15],
    look: [0, 1.4, 0],
    lookTo: [0, 0.4, 0],
  },
];
const applyCamera = shotCamera(shots);

// ---------------------------------------------------------------- flow phase (integrated speed)
function pumpOn(t) {
  if (t < T.gefuellt) return 0;
  if (t >= T.aus && t < T.brummt) return 0;
  if (t >= T.nicht2) return 0;
  return 1;
}
const SPEED = 0.85; // units per second
const phaseCache = [];
const DT = 1 / 60;
{
  let ph = 0;
  let sp = 0;
  for (let k = 0; k * DT <= END + 1; k++) {
    phaseCache.push(ph);
    const target = pumpOn(k * DT) * SPEED;
    sp += (target - sp) * 0.08; // spin up / down smoothly
    ph += sp * DT;
  }
}
const flowPhase = (t) => {
  const k = Math.max(0, t / DT);
  const i = Math.min(phaseCache.length - 2, Math.floor(k));
  return lerp(phaseCache[i], phaseCache[i + 1], k - i);
};

// ---------------------------------------------------------------- render
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = V(1, 1, 1);
const _v = V(0, 0, 0);
const _c = new THREE.Color();
function applyXray(k) {
  setXray([shellMat, doorMat], k);
  doorHardware.forEach((h) => (h.visible = k < 0.5));
  interior.visible = k > 0.02 || doorPivot.rotation.y < -0.05;
}

function renderAt(t) {
  // hook: crate, ice melting, puddle, X
  const crateOut = inBack(ramp(t, T.also1, T.also1 + 0.35));
  crate.visible = crateOut < 1;
  crate.scale.setScalar(Math.max(0.001, 1 - crateOut));
  const melt = ramp(t, T.morgen - 0.1, T.pfuetzeEnd + 0.2);
  ice.forEach((m) => {
    const k = clamp01(melt * 1.4 - m.userData.delay * 0.4);
    m.scale.setScalar(Math.max(0.001, 1 - smooth(k) * 0.92));
    m.position.y = lerp(m.userData.base.y, 0.25 + smooth(k) * 0.2, smooth(k));
  });
  const waterH = 0.04 + 0.5 * smooth(melt);
  crateWater.scale.y = waterH;
  crateWater.position.y = 0.1 + waterH / 2;
  hookMilk.rotation.z = Math.sin(t * 2.2) * 0.05 * melt;
  hookMilk.position.y = 0.11 + 0.08 * smooth(melt);
  puddle.visible = melt > 0 && crateOut < 1;
  puddle.scale.setScalar(
    Math.max(0.001, 0.4 + 1.5 * smooth(ramp(t, T.morgen + 0.3, T.pfuetzeEnd + 0.4))) *
      (1 - crateOut),
  );
  showNope(pop(t, T.pfuetze, T.also1), 0, 1.55, 0.3);

  // fridge pops in
  const fIn = outBack(ramp(t, T.also1 + 0.15, T.also1 + 0.75));
  fridge.visible = fIn > 0;
  fridge.scale.setScalar(Math.max(0.001, fIn));
  const xr =
    smooth(ramp(t, T.legst - 0.1, T.legst + 0.5)) * (1 - smooth(ramp(t, T.schau, T.schau + 0.5)));
  doorPivot.rotation.y = -1.6 * easeInOut(ramp(t, T.schau + 0.3, T.schau + 1.6));
  applyXray(xr);

  // pipe reveal
  const reveal = {
    evap: ramp(t, T.rohr1, T.rueckwandEnd + 0.3),
    suction: ramp(t, T.voller, T.voller + 1.3),
    comp: t >= T.presst ? 1 : 0,
    discharge: ramp(t, T.kompressor - 0.2, T.kompressor + 0.4),
    cond: ramp(t, T.jagst, T.hintenEnd + 0.2),
    cap: ramp(t, T.quetschst, T.roehrchenEnd + 0.3),
  };
  for (const seg of SEGMENTS) {
    if (!seg.mesh) continue;
    const r = reveal[seg.key];
    seg.mesh.visible = r > 0;
    seg.mesh.geometry.setDrawRange(0, Math.ceil(r * (seg.tris / 48)) * 48);
  }
  fins.visible = reveal.cond > 0.6;
  fins.scale.y = Math.max(0.001, smooth(ramp(reveal.cond, 0.6, 1)));
  const compIn = outBack(ramp(t, T.presst, T.presst + 0.45));
  compressor.visible = compIn > 0;
  const on = pumpOn(t) && t >= T.presst;
  const buzz = on ? Math.sin(t * 90) * 0.008 : 0;
  compressor.scale.setScalar(Math.max(0.001, compIn));
  compressor.position.x = 0.22 + buzz;
  M.discharge.emissiveIntensity = 0.9 * ramp(t, T.kompressor, T.kompressor + 0.6) * (on ? 1 : 0.4);
  M.condenser.emissiveIntensity =
    0.75 *
    ramp(t, T.heisse, T.heisse + 0.8) *
    (1 - 0.6 * ramp(t, T.dann, T.dann + 1)) *
    (on ? 1 : 0.5);

  M.capillary.emissiveIntensity = 0.8 * pop(t, T.quetschst, T.jetzt2, 0.3);

  // flow particles
  const ph = flowPhase(t);
  for (let i = 0; i < NP; i++) {
    const s = ((i / NP) * LOOP + ph) % LOOP;
    let seg = SEGMENTS[SEGMENTS.length - 1];
    for (const sg of SEGMENTS) {
      if (s >= sg.s0 && s < sg.s1) {
        seg = sg;
        break;
      }
    }
    const f = clamp01((s - seg.s0) / Math.max(1e-6, seg.s1 - seg.s0));
    const shown = t >= T.gefuellt && seg.key !== "comp" && f <= reveal[seg.key];
    trackPos(s, _v);
    const liquid =
      seg.key === "cap" || (seg.key === "cond" && f > 0.6) || (seg.key === "evap" && f < 0.3);
    let size = shown ? (liquid ? 0.03 : 0.036) : 0;
    if (seg.key === "cap") size = shown ? 0.02 : 0;
    _s.setScalar(Math.max(1e-4, size * ramp(t, T.gefuellt, T.gefuellt + 0.4)));
    _m.compose(_v, _q.identity(), _s);
    flowMesh.setMatrixAt(i, _m);
    flowMesh.setColorAt(i, flowColor(seg.key, f, _c));
  }
  flowMesh.instanceMatrix.needsUpdate = true;
  if (flowMesh.instanceColor) flowMesh.instanceColor.needsUpdate = true;

  // boiling bubbles
  const boil = pop(t, T.kocht - 0.1, T.aber2, 0.3) * clamp01(reveal.evap);
  const evap = segBy.evap;
  for (let i = 0; i < NB; i++) {
    const [a, b, c2, d] = bubbleSeed[i];
    const cyc = (t * (1.2 + d) + a) % 1;
    trackPos(evap.s0 + a * (evap.s1 - evap.s0), _v);
    _v.x += (b - 0.5) * 0.05;
    _v.y += 0.03 + cyc * 0.09;
    _v.z += 0.02 + c2 * 0.03;
    _s.setScalar(Math.max(1e-4, boil * (0.012 + 0.012 * Math.sin(cyc * Math.PI))));
    _m.compose(_v, _q.identity(), _s);
    bubbles.setMatrixAt(i, _m);
  }
  bubbles.instanceMatrix.needsUpdate = true;

  // frost sparkles
  const fr = pop(t, T.druck - 0.1, T.jetzt2 + 0.6, 0.4);
  for (let i = 0; i < NF; i++) {
    const [a, b, c2, d] = frostSeed[i];
    trackPos(evap.s0 + a * 0.35 * (evap.s1 - evap.s0), _v);
    _v.x += (b - 0.5) * 0.12;
    _v.y += (c2 - 0.5) * 0.12;
    _v.z += 0.04;
    const tw = 0.5 + 0.5 * Math.sin(t * 6 + d * 20);
    _s.setScalar(Math.max(1e-4, fr * 0.018 * tw));
    _q.setFromEuler(new THREE.Euler(t + d * 4, t * 1.3 + a * 5, 0));
    _m.compose(_v, _q, _s);
    frost.setMatrixAt(i, _m);
  }
  frost.instanceMatrix.needsUpdate = true;

  // heat arrows
  animateArrows(arrowsIn, t, pop(t, T.verdampfer - 0.3, T.aber2));
  animateArrows(arrowsOut, t, pop(t, T.gibt, T.dann));

  // sweat analogy
  const evapK = smooth(ramp(t, T.verdampft, T.haut + 0.6));
  drops.forEach((d, i) => {
    const k = clamp01(evapK * 1.3 - i * 0.05);
    d.scale.set(1 - k * 0.85, 0.6 * (1 - k * 0.9), 1 - k * 0.85);
  });
  steamPuffs.forEach((m) => {
    const [a, b, c2] = m.userData.seed;
    const cyc = (t * 0.45 + a) % 1;
    const src = drops[Math.floor(b * drops.length)].userData.base;
    m.position.set(
      src.x + (c2 - 0.5) * 0.25 * cyc,
      src.y + 0.1 + cyc * 1.1,
      src.z + (a - 0.5) * 0.2 * cyc,
    );
    m.scale.setScalar(0.06 + cyc * 0.16);
    m.material.opacity =
      0.55 * Math.sin(cyc * Math.PI) * ramp(t, T.verdampft - 0.4, T.verdampft + 0.3);
  });
  animateArrows(sweatArrows, t, pop(t, T.schluckt, T.legst));

  // bike pump
  const pumping = t >= T.wie2 && t < T.kompressor + 0.2;
  const stroke = pumping ? Math.abs(Math.sin((t - T.wie2) * 5.2)) : 0;
  pumpRod.position.y = 1.0 + 1.05 - stroke * 0.55;
  M.pumpHot.emissiveIntensity = 1.1 * smooth(ramp(t, T.wie2 + 0.3, T.heiss + 0.4));
  animateArrows(pumpArrows, t, pop(t, T.heiss - 0.1, T.kompressor + 0.2));

  // thermostat
  const dial = thermo.userData.dial;
  dial.material.emissiveIntensity =
    0.9 * pop(t, T.schaltet, T.darum2) * (0.6 + 0.4 * Math.sin(t * 8));
  dial.rotation.y = t >= T.aus ? 1.2 : 0;

  // compressor hum rings
  const hum = t >= T.brummt && t < T.nicht2 && on ? 1 : 0;
  rings.forEach((r, i) => {
    const cyc = (t * 1.6 + i / 3) % 1;
    r.visible = hum > 0;
    r.position.set(0.22, 0.32, -1.05);
    r.scale.setScalar(0.25 + cyc * 0.9);
    r.material.opacity = (1 - cyc) * 0.9;
  });

  // LED panel
  if (t >= T.minus && t < T.verdampfer) {
    showPanel(pop(t, T.minus, T.verdampfer), "KOCHT BEI", "-26°C", LED.blue);
  } else if (t >= T.darum1 && t < T.dann) {
    showPanel(pop(t, T.darum1, T.dann), "RÜCKSEITE", "+40°C", LED.red);
  } else if (t >= T.damit && t < T.schaltet) {
    showPanel(pop(t, T.damit, T.schaltet), "MILCH", "4°C", LED.blue);
  } else if (t >= T.schaltet && t < T.darum2) {
    const off = t >= T.aus;
    showPanel(pop(t, T.schaltet, T.darum2), "PUMPE", off ? "AUS" : "AN", off ? LED.red : LED.green);
  } else {
    showPanel(0);
  }

  // outro
  innerLight.intensity = 3 * smooth(ramp(t, T.schau + 0.6, T.schau + 1.4));

  applyCamera(t);
  renderFrame();
}

start(renderAt);
