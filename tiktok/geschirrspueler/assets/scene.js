// "So funktioniert ein Geschirrspüler". World, captions, camera, panel, arrows
// and labels live in world.js; this file only builds the dishwasher story.
import {
  THREE,
  ramp,
  lerp,
  smooth,
  inBack,
  pop,
  rng,
  V,
  scene,
  flat,
  M,
  xrayMaterial,
  xrayEdges,
  setXray,
  addFloor,
  roundedRect,
  makeArrowSet,
  animateArrows,
  coldMat,
  showNope,
  showPanel,
  LED,
  labels,
  squash,
  puff,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { createWorld } from "./environments.js";
import { T, shots, LABELS, P, ARM_LO, ARM_UP, SK } from "./beats.js";

createWorld({ env: "stadt", sky: "mittag" });
addFloor(3.4);

const CLEAN = new THREE.Color(0x4fb8ff);
const MURKY = new THREE.Color(0x9a8a62);
Object.assign(M, {
  tubFloor: xrayMaterial(0xc9d0d8, { metalness: 0.4, roughness: 0.3 }),
  sumpWall: flat(0x9aa6b2, { metalness: 0.5, roughness: 0.35, side: THREE.DoubleSide }),
  sumpWater: new THREE.MeshStandardMaterial({
    color: 0x4fb8ff,
    roughness: 0.05,
    transparent: true,
    opacity: 0.85,
    emissive: 0x1f6fb0,
    emissiveIntensity: 0.25,
  }),
  heater: flat(0x3a3f46, { emissive: 0xff3d1f, emissiveIntensity: 0 }),
  pump: flat(0x4f86d6, {
    roughness: 0.4,
    metalness: 0.2,
    emissive: 0x4fb8ff,
    emissiveIntensity: 0,
  }),
  pipe: flat(0xd5dce4, { roughness: 0.35, metalness: 0.3 }),
  arm: flat(0xb9c2cc, { roughness: 0.3, metalness: 0.4 }),
  wire: flat(0x9aa4b0, { roughness: 0.35, metalness: 0.5 }),
  plate: flat(0xf8f6ef, { roughness: 0.3 }),
  plateRim: flat(0x5aa6e8, { roughness: 0.3 }),
  dirt: flat(0xa0582d, { roughness: 0.8 }),
  jet: new THREE.MeshBasicMaterial({ color: 0xbfe8ff }),
  drop: new THREE.MeshBasicMaterial({ color: 0x7cc7f2 }),
  bead: new THREE.MeshBasicMaterial({ color: 0x2f9bff }),
  dirtyBead: new THREE.MeshBasicMaterial({ color: 0xc8955a }),
  sparkle: new THREE.MeshBasicMaterial({ color: 0xffffff }),
  ring: new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
  }),
  black: flat(0x1c1d22, { roughness: 0.4 }),
  led: flat(0x3dff7a, { emissive: 0x3dff7a, emissiveIntensity: 1 }),
});
const MUG_COLORS = [0xff8a65, 0xffd54f, 0x81c784, 0x64b5f6, 0xba68c8, 0xff8a65];

// ---------------------------------------------------------------- dishwasher
const BW = 1.5;
const BH = 1.85;
const BD = 1.5;
const ZF = BD / 2;
const TH = 0.05;
const PL = 0.12; // plinth height
const FLOOR_Y = 0.3; // tub floor

const dw = new THREE.Group();
scene.add(dw);
const shellMat = xrayMaterial(0xeef0f3, { metalness: 0.25, roughness: 0.3 });
const doorMat = xrayMaterial(0xdfe3e8, { metalness: 0.45, roughness: 0.25 });

function box(w, h, d, mat, x, y, z, parent = dw, edges = false) {
  const g = new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(g, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  parent.add(m);
  if (edges) {
    const e = xrayEdges(g);
    e.position.copy(m.position);
    parent.add(e);
  }
  return m;
}
// shell panels (open front, the door closes it)
box(BW, TH, BD, shellMat, 0, BH - TH / 2, 0, dw, true);
box(BW, BH, TH, shellMat, 0, BH / 2, -ZF + TH / 2, dw, true);
box(TH, BH, BD, shellMat, -BW / 2 + TH / 2, BH / 2, 0, dw, true);
box(TH, BH, BD, shellMat, BW / 2 - TH / 2, BH / 2, 0, dw, true);
box(BW, PL, TH, M.black, 0, PL / 2, ZF - TH / 2 - 0.03);

// tub floor with the sump hole
const floorShape = roundedRect(BW - 2 * TH, BD - 2 * TH, 0.04);
{
  const hole = new THREE.Path();
  hole.absarc(0, (BD - 2 * TH) / 2, 0.3, 0, Math.PI * 2, true);
  floorShape.holes.push(hole);
}
const floorGeo = new THREE.ExtrudeGeometry(floorShape, { depth: 0.03, bevelEnabled: false });
floorGeo.translate(0, -(BD - 2 * TH) / 2, 0);
const tubFloor = new THREE.Mesh(floorGeo, M.tubFloor);
tubFloor.rotation.x = -Math.PI / 2;
tubFloor.position.y = FLOOR_Y - 0.03;
dw.add(tubFloor);

// sump: a little pot under the floor, the water sits in it
const sump = new THREE.Group();
sump.position.y = 0.12;
dw.add(sump);
{
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.27, 0.18, 24, 1, true), M.sumpWall);
  wall.position.y = 0.09;
  sump.add(wall);
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(0.27, 24), M.sumpWall);
  bottom.rotation.x = -Math.PI / 2;
  bottom.position.y = 0.002;
  sump.add(bottom);
}
const SUMP_H = 0.16;
const water = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.27, 1, 24), M.sumpWater);
sump.add(water);

// heater ring on the tub floor
const heater = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.022, 6, 40), M.heater);
heater.rotation.x = Math.PI / 2;
heater.position.y = FLOOR_Y + 0.025;
dw.add(heater);
const heatLight = new THREE.PointLight(0xff6a2a, 0, 1.4, 1.6);
heatLight.position.set(0, FLOOR_Y + 0.1, 0);
dw.add(heatLight);

// filter: a perforated disc over the sump
const siebCanvas = document.createElement("canvas");
siebCanvas.width = siebCanvas.height = 128;
{
  const g = siebCanvas.getContext("2d");
  g.fillStyle = "#c9d2db";
  g.fillRect(0, 0, 128, 128);
  g.fillStyle = "#4a5560";
  for (let y = 4; y < 128; y += 9)
    for (let x = 4; x < 128; x += 9) {
      g.beginPath();
      g.arc(x + ((y / 9) % 2) * 4.5, y, 2.2, 0, Math.PI * 2);
      g.fill();
    }
}
const siebTex = new THREE.CanvasTexture(siebCanvas);
siebTex.colorSpace = THREE.SRGBColorSpace;
const sieb = new THREE.Group();
sieb.position.y = FLOOR_Y + 0.005;
dw.add(sieb);
{
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(0.3, 28),
    new THREE.MeshStandardMaterial({ map: siebTex, metalness: 0.4, roughness: 0.35 }),
  );
  disc.rotation.x = -Math.PI / 2;
  sieb.add(disc);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.015, 6, 32), M.steel);
  rim.rotation.x = Math.PI / 2;
  sieb.add(rim);
}
// leftovers caught by the filter
const NC = 10;
const crumbs = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), M.dirt, NC);
crumbs.frustumCulled = false;
dw.add(crumbs);
const crumbSeed = (() => {
  const r = rng(11);
  return Array.from({ length: NC }, () => [r() * Math.PI * 2, 0.05 + r() * 0.2, r(), r()]);
})();

// circulation pump under the floor
const pump = new THREE.Group();
pump.position.set(...P);
dw.add(pump);
{
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.3, 16), M.pump);
  body.rotation.z = Math.PI / 2;
  body.castShadow = true;
  pump.add(body);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 16), M.steel);
  cap.rotation.z = Math.PI / 2;
  cap.position.x = 0.18;
  pump.add(cap);
  for (let i = 0; i < 4; i++) {
    const rib = new THREE.Mesh(new THREE.TorusGeometry(0.112, 0.008, 4, 20), M.steel);
    rib.rotation.y = Math.PI / 2;
    rib.position.x = -0.1 + i * 0.065;
    pump.add(rib);
  }
}
// sound rings around the pump ("Hör mal hin")
const rings = [];
for (let i = 0; i < 3; i++) {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 4, 40), M.ring.clone());
  ring.position.set(...P);
  dw.add(ring);
  rings.push(ring);
}

// pipes: sump -> pump, pump -> lower arm, pump -> up the back -> upper arm
const v = (a) => V(...a);
function tube(points, r = 0.035) {
  const curve = new THREE.CatmullRomCurve3(points.map(v), false, "centripetal");
  const segs = 64;
  const geo = new THREE.TubeGeometry(curve, segs, r, 8);
  const mesh = new THREE.Mesh(geo, M.pipe);
  mesh.castShadow = true;
  dw.add(mesh);
  return { curve, geo, mesh, segs };
}
const S2P = [[0, 0.14, 0], [0.2, 0.13, 0.12], P];
const LOW = [P, [0.25, 0.24, 0.1], [0.05, 0.3, 0.02], [0, ARM_LO[1] - 0.02, 0]];
const UP = [
  P,
  [0.45, 0.16, -0.3],
  [0.3, 0.22, -0.6],
  [0.08, 0.42, -0.64],
  [0, 0.8, -0.64],
  [0, 1.08, -0.6],
  [0, 1.15, -0.35],
  [0, 1.16, 0],
];
const DRAIN = [P, [0.72, 0.13, 0.05], [0.95, 0.08, -0.15], [1.25, 0.03, -0.35]];
const pipeS2P = tube(S2P, 0.04);
const pipeLow = tube(LOW);
const pipeUp = tube(UP);
const hose = tube(DRAIN, 0.03);
hose.mesh.material = M.rubber;
function grow(p, t) {
  p.mesh.visible = t > 0.001;
  p.geo.setDrawRange(0, Math.ceil(clamp(t) * p.segs) * 8 * 6);
}
const clamp = (x) => Math.min(1, Math.max(0, x));

// spray arms
function makeArm(len, y) {
  const g = new THREE.Group();
  g.position.set(0, y, 0);
  dw.add(g);
  const spin = new THREE.Group();
  g.add(spin);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(len, 0.035, 0.08), M.arm);
  bar.castShadow = true;
  spin.add(bar);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.07, 12), M.arm);
  spin.add(hub);
  for (const s of [-1, 1])
    for (const f of [0.25, 0.45]) {
      const n = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.01, 0.03), M.black);
      n.position.set(s * f * len, 0.02, s * 0.02);
      spin.add(n);
    }
  return { g, spin, len };
}
const armLo = makeArm(1.1, ARM_LO[1]);
const armUp = makeArm(0.9, ARM_UP[1]);

// baskets: wire frames with plates (lower) and mugs (upper)
function basket(y, w, d, h) {
  const g = new THREE.Group();
  g.position.y = y;
  dw.add(g);
  const r = 0.012;
  for (const z of [-d / 2, d / 2]) {
    box(w, r * 2, r * 2, M.wire, 0, 0, z, g);
    box(w, r * 2, r * 2, M.wire, 0, h, z, g);
  }
  for (const x of [-w / 2, w / 2]) {
    box(r * 2, r * 2, d, M.wire, x, 0, 0, g);
    box(r * 2, r * 2, d, M.wire, x, h, 0, g);
  }
  for (const x of [-w / 2, w / 2])
    for (const z of [-d / 2, d / 2]) box(r * 2, h, r * 2, M.wire, x, h / 2, z, g);
  for (let i = 1; i < 6; i++) box(r * 1.5, r * 1.5, d, M.wire, -w / 2 + (i * w) / 6, 0, 0, g);
  return g;
}
const lowBasket = basket(0.48, 1.3, 0.95, 0.22);
const upBasket = basket(1.3, 1.3, 0.95, 0.16);
const plates = [];
const DIRT = [];
for (let i = 0; i < 6; i++) {
  const p = new THREE.Group();
  p.position.set(-0.52 + i * 0.21, 0.23, 0.05);
  p.rotation.z = Math.PI / 2 + 0.08;
  lowBasket.add(p);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.2, 0.025, 24), M.plate);
  disc.castShadow = true;
  p.add(disc);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.195, 0.008, 4, 28), M.plateRim);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.014;
  p.add(rim);
  const r = rng(30 + i);
  for (let k = 0; k < 2; k++) {
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.04 + r() * 0.025, 8, 4), M.dirt);
    d.scale.y = 0.25;
    d.position.set((r() - 0.5) * 0.2, 0.015, (r() - 0.5) * 0.2);
    p.add(d);
    DIRT.push(d);
  }
  plates.push(p);
}
for (let i = 0; i < 6; i++) {
  const mug = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.065, 0.15, 14),
    flat(MUG_COLORS[i], { roughness: 0.4 }),
  );
  mug.position.set(-0.45 + (i % 3) * 0.45, 0.09, i < 3 ? -0.2 : 0.2);
  mug.castShadow = true;
  upBasket.add(mug);
}

// door: hinged at the bottom front edge, opens towards +z
const doorPivot = new THREE.Group();
doorPivot.position.set(0, PL, ZF);
dw.add(doorPivot);
const DH = BH - PL;
const doorGeo = new THREE.BoxGeometry(BW, DH, 0.06);
const door = new THREE.Mesh(doorGeo, doorMat);
door.position.set(0, DH / 2, 0.03);
door.castShadow = true;
doorPivot.add(door);
const doorEdges = xrayEdges(doorGeo);
doorEdges.position.copy(door.position);
doorPivot.add(doorEdges);
const stripMat = xrayMaterial(0x2b2d33);
const strip = new THREE.Mesh(new THREE.BoxGeometry(BW, 0.14, 0.065), stripMat);
strip.position.set(0, DH - 0.07, 0.035);
doorPivot.add(strip);
const handleMat = xrayMaterial(0xc9ced4, { metalness: 0.6, roughness: 0.25 });
const handle = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, 0.05), handleMat);
handle.position.set(0, DH - 0.22, 0.09);
doorPivot.add(handle);
const leds = [];
for (let i = 0; i < 3; i++) {
  const l = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.02), M.led);
  l.position.set(0.35 + i * 0.1, DH - 0.07, 0.07);
  doorPivot.add(l);
  leds.push(l);
}

// ---------------------------------------------------------------- water particles
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = V(1, 1, 1);
const _p = V(0, 0, 0);
const hide = () => _m.makeScale(0, 0, 0);

// jets from the arm nozzles (lower arm: up to the plates; upper: up to the mugs)
const NOZ = [-0.45, -0.25, 0.25, 0.45];
const PER = 7;
const NJ = 2 * NOZ.length * PER;
const jets = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 6, 4), M.jet, NJ);
jets.frustumCulled = false;
dw.add(jets);
function drawJets(t, k, angLo, angUp) {
  let i = 0;
  for (const [arm, ang, range] of [
    [armLo, angLo, 0.55],
    [armUp, angUp, 0.4],
  ]) {
    for (let n = 0; n < NOZ.length; n++) {
      const off = NOZ[n] * arm.len;
      const x0 = Math.cos(ang) * off;
      const z0 = -Math.sin(ang) * off;
      for (let j = 0; j < PER; j++) {
        if (k <= 0.001) {
          hide();
        } else {
          const u = (t * 2.4 + j / PER + n * 0.13) % 1;
          _p.set(x0 * (1 + u * 0.15), arm.g.position.y + 0.03 + u * range, z0 * (1 + u * 0.15));
          _m.compose(_p, _q.identity(), _s.setScalar(k * 0.018 * (1 - 0.4 * u)));
        }
        jets.setMatrixAt(i++, _m);
      }
    }
  }
  jets.instanceMatrix.needsUpdate = true;
}
// drops falling from the dishes back into the sump
const ND = 28;
const drops = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 6, 4), M.drop, ND);
drops.frustumCulled = false;
dw.add(drops);
const dropSeed = (() => {
  const r = rng(5);
  return Array.from({ length: ND }, () => [(r() - 0.5) * 1.1, (r() - 0.5) * 0.7, r(), r()]);
})();
function drawDrops(t, k) {
  for (let i = 0; i < ND; i++) {
    const [x, z, ph, sp] = dropSeed[i];
    if (k <= 0.001) hide();
    else {
      const u = (t * (0.9 + sp * 0.6) + ph) % 1;
      // fall from the plates and funnel towards the sump
      const f = smooth(u);
      _p.set(lerp(x, x * 0.25, f), lerp(0.85, FLOOR_Y + 0.02, u * u), lerp(z, z * 0.25, f));
      _s.set(0.014, 0.028, 0.014).multiplyScalar(k);
      _m.compose(_p, _q.identity(), _s);
    }
    drops.setMatrixAt(i, _m);
  }
  drops.instanceMatrix.needsUpdate = true;
}
// circulation beads: sump -> pump -> up the back -> upper arm
const loopCurve = new THREE.CatmullRomCurve3(
  [...S2P.slice(0, 2), ...UP].map(v),
  false,
  "centripetal",
);
const lowCurve = new THREE.CatmullRomCurve3(LOW.map(v), false, "centripetal");
const drainCurve = new THREE.CatmullRomCurve3(DRAIN.map(v), false, "centripetal");
const NB = 36;
const beads = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), M.bead, NB);
beads.frustumCulled = false;
dw.add(beads);
function drawBeads(t, k) {
  for (let i = 0; i < NB; i++) {
    if (k <= 0.001) hide();
    else {
      const main = i < 26;
      const u = main ? (i / 26 + t * 0.45) % 1 : ((i - 26) / 10 + t * 0.7) % 1;
      (main ? loopCurve : lowCurve).getPointAt(u, _p);
      _m.compose(_p, _q.identity(), _s.setScalar(0.03 * k));
    }
    beads.setMatrixAt(i, _m);
  }
  beads.instanceMatrix.needsUpdate = true;
}
const NDR = 12;
const drainBeads = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), M.dirtyBead, NDR);
drainBeads.frustumCulled = false;
dw.add(drainBeads);
function drawDrain(t, k) {
  for (let i = 0; i < NDR; i++) {
    if (k <= 0.001) hide();
    else {
      drainCurve.getPointAt((i / NDR + t * 0.8) % 1, _p);
      _m.compose(_p, _q.identity(), _s.setScalar(0.04 * k));
    }
    drainBeads.setMatrixAt(i, _m);
  }
  drainBeads.instanceMatrix.needsUpdate = true;
}
// return arrows: the same water runs back down into the sump
const backDown = makeArrowSet(
  [
    [V(0.58, 1.1, 0.5), V(0.28, 0.4, 0.32)],
    [V(-0.58, 1.1, 0.5), V(-0.28, 0.4, 0.32)],
  ],
  { parent: dw, mat: coldMat, r: 0.022, amp: 0.04 },
);
// steam over the hot water
const NS = 8;
const steam = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), M.steam, NS);
steam.frustumCulled = false;
dw.add(steam);
function drawSteam(t, k) {
  for (let i = 0; i < NS; i++) {
    if (k <= 0.001) hide();
    else {
      const u = (t * 0.6 + i / NS) % 1;
      const a = i * 2.3;
      _p.set(Math.cos(a) * 0.15, FLOOR_Y + u * 0.45, Math.sin(a) * 0.15 + 0.05);
      _m.compose(_p, _q.identity(), _s.setScalar(k * 0.05 * Math.sin(u * Math.PI)));
    }
    steam.setMatrixAt(i, _m);
  }
  steam.instanceMatrix.needsUpdate = true;
}
// sparkles on the clean dishes
const NSP = 14;
const sparkles = new THREE.InstancedMesh(new THREE.OctahedronGeometry(1, 0), M.sparkle, NSP);
sparkles.frustumCulled = false;
dw.add(sparkles);
const sparkSeed = (() => {
  const r = rng(9);
  return Array.from({ length: NSP }, (_, i) =>
    i < 9
      ? [-0.52 + (i % 6) * 0.21, 0.6 + r() * 0.3, 0.05 + (r() - 0.5) * 0.25, r()]
      : [-0.45 + ((i - 9) % 3) * 0.45, 1.42, i < 12 ? -0.2 : 0.2, r()],
  );
})();
function drawSparkles(t, k) {
  for (let i = 0; i < NSP; i++) {
    const [x, y, z, ph] = sparkSeed[i];
    if (k <= 0.001) hide();
    else {
      const tw = Math.max(0, Math.sin(t * 6 + ph * 20));
      _m.compose(
        _p.set(x, y, z),
        _q.setFromAxisAngle(V(0, 1, 0), t * 2 + ph),
        _s.setScalar(k * 0.035 * tw + 1e-5),
      );
    }
    sparkles.setMatrixAt(i, _m);
  }
  sparkles.instanceMatrix.needsUpdate = true;
}

// ---------------------------------------------------------------- sink set (bonus fact)
const sink = new THREE.Group();
sink.position.set(...SK);
scene.add(sink);
const sinkW = 1.4;
const sinkD = 0.8;
const sinkH = 0.9;
box(sinkW, sinkH, sinkD, M.wood, 0, sinkH / 2, 0, sink);
box(sinkW + 0.06, 0.05, sinkD + 0.06, flat(0xeeeeea), 0, sinkH + 0.025, 0, sink);
// basin: a dark steel box sunk into the counter top
const basin = new THREE.Group();
basin.position.set(-0.1, sinkH + 0.055, 0);
sink.add(basin);
{
  const bw = 0.8;
  const bd = 0.55;
  const bh = 0.06;
  for (const [w, d, x, z] of [
    [bw, 0.03, 0, -bd / 2],
    [bw, 0.03, 0, bd / 2],
    [0.03, bd, -bw / 2, 0],
    [0.03, bd, bw / 2, 0],
  ])
    box(w, bh, d, M.chrome, x, bh / 2, z, basin);
}
const sinkWater = new THREE.Mesh(new THREE.BoxGeometry(0.78, 1, 0.53), M.water);
basin.add(sinkWater);
const overflow = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, 0.02), M.water);
sink.add(overflow);
const sinkPuddle = new THREE.Mesh(new THREE.CircleGeometry(1, 24), M.water);
sinkPuddle.rotation.x = -Math.PI / 2;
sinkPuddle.position.set(-0.1, 0.012, sinkD / 2 + 0.3);
sink.add(sinkPuddle);
// tap + running stream
{
  const tap = new THREE.CatmullRomCurve3([
    V(0.45, sinkH + 0.05, -0.3),
    V(0.45, sinkH + 0.45, -0.3),
    V(0.3, sinkH + 0.55, -0.15),
    V(0.2, sinkH + 0.5, -0.05),
  ]);
  const m = new THREE.Mesh(new THREE.TubeGeometry(tap, 20, 0.03, 8), M.chrome);
  m.castShadow = true;
  sink.add(m);
}
const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.03, 1, 8), M.water);
sink.add(stream);
// a stack of dirty plates beside the basin
for (let i = 0; i < 4; i++) {
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.025, 20), M.plate);
  p.position.set(0.5, sinkH + 0.065 + i * 0.03, 0.18);
  p.castShadow = true;
  sink.add(p);
}

const applyCamera = shotCamera(shots);

// ---------------------------------------------------------------- render
function renderAt(t) {
  const hook = t < T.lass; // the running machine of the opening (and of the loop tail)

  // dishwasher: shrinks away on "Lass", pops back in as a build
  const out = inBack(ramp(t, T.lass, T.lass + 0.35));
  const back = T.lass + 0.45;
  if (t < T.lass + 0.35) dw.scale.setScalar(Math.max(0.001, 1 - out));
  else dw.scale.copy(squash(t, back));
  dw.visible = t < T.lass + 0.35 || t >= back;
  puff("dw", t, back + 0.15, 0, 0.05, 0, 1.8);

  const xray = hook
    ? 1
    : smooth(ramp(t, T.kiste - 0.1, T.kiste + 0.4)) * (1 - ramp(t, T.schau, T.schau + 0.5));
  setXray([M.tubFloor], xray * 0.6);
  setXray([stripMat, handleMat], xray * 0.9);
  setXray([shellMat, doorMat], xray);

  // door opens in the outro, a puff of steam rolls out
  doorPivot.rotation.x = hook ? 0 : 1.45 * smooth(ramp(t, T.schau + 0.15, T.schau + 1.0));
  puff("steam", t, T.schau + 0.7, 0, 1.25, 1.1, 1.3);
  const running = hook || (t >= T.pumpe && t < T.schau);
  leds.forEach(
    (l, i) => (l.material.emissiveIntensity = running ? 0.6 + 0.4 * Math.sin(t * 5 + i) : 0.15),
  );

  // baskets + dishes
  const baskets = hook || t >= T.koerben;
  lowBasket.visible = upBasket.visible = baskets;
  lowBasket.scale.copy(hook ? V(1, 1, 1) : squash(t, T.koerben));
  upBasket.scale.copy(hook ? V(1, 1, 1) : squash(t, T.koerben + 0.12));
  const dirt = hook
    ? 1 - 0.4 * smooth(ramp(t, 0, T.lass))
    : 1 - smooth(ramp(t, T.teller, T.sieb + 0.3));
  for (const d of DIRT) d.visible = dirt > 0.02;
  for (const d of DIRT) d.scale.set(dirt, 0.25 * dirt, dirt);

  // sump + floor + heater (from "Mulde")
  const sumpOn = hook || t >= T.mulde;
  sump.visible = tubFloor.visible = heater.visible = sumpOn;
  const sk = hook ? V(1, 1, 1) : squash(t, T.mulde + 0.05);
  sump.scale.copy(sk);
  tubFloor.scale.set(sk.x, sk.z, sk.y);
  heater.scale.copy(sk);
  let level = hook ? 1 : smooth(ramp(t, T.drei, T.drei + 0.9));
  level *= 1 - smooth(ramp(t, T.ende + 0.1, T.ende + 0.8)) * (t < T.frisch ? 1 : 0);
  if (!hook && t >= T.frisch) level = smooth(ramp(t, T.frisch, T.frisch + 0.6));
  water.visible = sumpOn && level > 0.01;
  water.scale.set(1, Math.max(0.001, SUMP_H * level), 1);
  water.position.y = 0.005 + (SUMP_H * level) / 2;
  const murk = hook ? 0.25 : smooth(ramp(t, T.tropft, T.hoch)) * (t < T.frisch ? 1 : 0);
  M.sumpWater.color.copy(CLEAN).lerp(MURKY, murk);
  const hot = hook
    ? 0.5
    : smooth(ramp(t, T.heiss - 0.1, T.heiss + 0.4)) *
      (1 - 0.6 * ramp(t, T.reicht, T.trick)) *
      (t < T.schau ? 1 : 0);
  M.heater.emissiveIntensity = 2.2 * hot;
  heatLight.intensity = 2.5 * hot;
  drawSteam(t, hook ? 0.5 : pop(t, T.heiss + 0.1, T.trick));
  showNope(pop(t, T.reicht, T.trick), 0, 0.85, 0.9, 0.55);

  // pump + pipes
  const pumpOn = hook || t >= T.pumpe;
  pump.visible = pumpOn;
  pump.scale.copy(hook ? V(1, 1, 1) : squash(t, T.pumpe + 0.05));
  if (running) pump.position.set(P[0], P[1] + Math.sin(t * 90) * 0.004, P[2]);
  M.pump.emissiveIntensity = 0.6 * pop(t, T.umwaelz - 0.1, T.ende);
  grow(pipeS2P, hook ? 1 : ramp(t, T.pumpe + 0.1, T.pumpe + 0.4));
  grow(pipeLow, hook ? 1 : ramp(t, T.drueckt, T.drueckt + 0.5));
  grow(pipeUp, hook ? 1 : ramp(t, T.drueckt + 0.15, T.drueckt + 1.1));
  grow(hose, hook ? 1 : ramp(t, T.ende - 0.1, T.ende + 0.3));

  // spray arms: spin while the pump runs (angle = integral of "on")
  const armsOn = hook || t >= T.drehende;
  armLo.g.visible = armUp.g.visible = armsOn;
  armLo.g.scale.copy(hook ? V(1, 1, 1) : squash(t, T.drehende + 0.05));
  armUp.g.scale.copy(hook ? V(1, 1, 1) : squash(t, T.drehende + 0.15));
  const spinT = hook
    ? t
    : T.lass +
      Math.max(0, Math.min(t, T.ende + 0.2) - T.drehende) +
      Math.max(0, Math.min(t, T.schau) - T.frisch);
  const angLo = spinT * 4.2;
  const angUp = -spinT * 3.4 + 0.7;
  armLo.spin.rotation.y = angLo;
  armUp.spin.rotation.y = angUp;
  const jetK = hook ? 1 : pop(t, T.arme, T.ende + 0.2) + pop(t, T.frisch + 0.2, T.schau);
  drawJets(t, Math.min(1, jetK), angLo, angUp);
  drawDrops(t, hook ? 0.8 : pop(t, T.tropft - 0.1, T.ende + 0.2));

  // filter catches the leftovers
  sieb.visible = hook || t >= T.sieb;
  sieb.scale.copy(hook ? V(1, 1, 1) : squash(t, T.sieb + 0.1));
  for (let i = 0; i < NC; i++) {
    const [a, rr, d, s] = crumbSeed[i];
    const at = T.sieb + 0.3 + d * 0.6;
    const show = hook ? 0.6 : t >= at && t < T.schau ? 1 : 0;
    if (!show) hide();
    else {
      const f = hook ? 1 : smooth(ramp(t, at, at + 0.35));
      _p.set(Math.cos(a) * rr, lerp(0.7, FLOOR_Y + 0.015, f), Math.sin(a) * rr);
      _m.compose(_p, _q.setFromAxisAngle(V(0, 1, 0), a), _s.setScalar(0.022 * (0.7 + 0.5 * s)));
    }
    crumbs.setMatrixAt(i, _m);
  }
  crumbs.instanceMatrix.needsUpdate = true;

  // the same water, round and round
  drawBeads(t, pop(t, T.hoch - 0.1, T.ende));
  animateArrows(backDown, t, pop(t, T.dasselbe - 0.2, T.ende));
  drawDrain(t, pop(t, T.ende + 0.05, T.frisch + 0.2));
  const rk = pop(t, T.hoer, T.dasselbe + 0.3);
  rings.forEach((ring, i) => {
    const c = (t * 1.1 + i / 3) % 1;
    ring.visible = rk > 0.001;
    ring.scale.setScalar(Math.max(0.001, (0.15 + c * 0.35) * rk));
    ring.material.opacity = 0.8 * (1 - c);
  });

  // clean dishes sparkle from the fresh rinse to the outro
  drawSparkles(t, hook ? 0 : pop(t, T.frisch + 0.3, T.uebrigens));

  // sink set: the tap runs, the basin fills and overflows
  const sk2 = pop(t, T.uebrigens, T.spuelst + 0.4);
  sink.visible = sk2 > 0.001;
  sink.scale.copy(
    sk2 > 0 ? squash(t, T.uebrigens + 0.1).multiplyScalar(sk2) : V(0.001, 0.001, 0.001),
  );
  const fill = smooth(ramp(t, T.uebrigens + 0.3, T.fuenfzig));
  sinkWater.scale.set(1, Math.max(0.001, 0.07 * fill), 1);
  sinkWater.position.y = 0.002 + 0.035 * fill;
  const spill = smooth(ramp(t, T.fuenfzig - 0.1, T.fuenfzig + 1.0));
  overflow.visible = spill > 0.01;
  overflow.scale.set(1, Math.max(0.001, sinkH * spill), 1);
  overflow.position.set(-0.1, sinkH + 0.05 - (sinkH * spill) / 2, sinkD / 2 + 0.045);
  sinkPuddle.visible = spill > 0.01;
  sinkPuddle.scale.set(0.05 + 0.6 * spill, 0.05 + 0.35 * spill, 1);
  const flow = 1 + 0.15 * Math.sin(t * 30);
  stream.scale.set(flow, 0.45, flow);
  stream.position.set(0.2, sinkH + 0.27, -0.05);

  // LED panel: one fact at a time
  if (hook && t >= T.zehn - 0.1) {
    showPanel(pop(t, T.zehn - 0.1, T.lass), "WASSER PRO SPÜLGANG", "10 L", LED.blue);
  } else if (t >= T.drei && t < T.heiss) {
    showPanel(pop(t, T.drei, T.heiss), "IN DER MULDE", "3 L", LED.blue);
  } else if (t >= T.dasselbe && t < T.umwaelz) {
    showPanel(pop(t, T.dasselbe, T.umwaelz), "IMMER IM KREIS", "3 L", LED.green);
  } else {
    showPanel(0);
  }

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
