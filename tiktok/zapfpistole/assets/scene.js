// "Wie funktioniert die Zapfpistole?" World, captions, camera, panel, arrows
// and labels live in world.js; this file builds the story: a red car at a
// country petrol station, a big green nozzle in its fuel flap. The nozzle
// stops by itself: fuel flowing through it sucks air in through a tiny hole
// at the spout tip and a thin tube; when the rising fuel closes the hole,
// suction builds under a rubber membrane, the membrane pulls, the latch
// lets go — KLACK, the lever drops and the valve slams shut. Bonus set: a
// thick black diesel nozzle that bounces off a petrol filler neck.
import {
  THREE,
  ramp,
  smooth,
  inBack,
  pop,
  V,
  scene,
  ground,
  flat,
  M,
  jitter,
  facet,
  facetMat,
  xrayMaterial,
  xrayEdges,
  setXray,
  showNope,
  makeArrowSet,
  animateArrows,
  forceMat,
  labels,
  squash,
  puff,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { createWorld } from "./environments.js";
import {
  T,
  shots,
  LABELS,
  HIGHLIGHTS,
  FLAP,
  HOVER,
  PUMP,
  DIESEL,
  LIFT,
  PLUNGE,
  FLOW_ON,
  COVER,
  STOP,
  FLOWS,
  SPILL_END,
} from "./beats.js";

highlights(HIGHLIGHTS);
createWorld({ env: "land", sky: "morgen" });

Object.assign(M, {
  fuel: flat(0xffb21e, { emissive: 0xff8a00, emissiveIntensity: 0.55, roughness: 0.2 }),
  air: new THREE.MeshBasicMaterial({ color: 0xffffff }),
  tube: flat(0x35d6ff, { emissive: 0x1fb8ff, emissiveIntensity: 0.9 }),
  membrane: flat(0xff7a2f, { emissive: 0xff5a10, emissiveIntensity: 0.2, roughness: 0.5 }),
  chamber: flat(0x3a3550, { emissive: 0x8a2cff, emissiveIntensity: 0 }),
  valve: flat(0xd8dde3, { emissive: 0xff2a1a, emissiveIntensity: 0, metalness: 0.4 }),
  hose: flat(0x26242a, { roughness: 0.6 }),
  ring: flat(0xffc21e, { emissive: 0xffa000, emissiveIntensity: 0.9 }),
  pad: flat(0xcfcac4, { roughness: 0.95 }),
  curb: flat(0xf2efe9),
  pumpWhite: flat(0xf6f4ef, { roughness: 0.5 }),
  pumpRed: flat(0xe2453c, { roughness: 0.5 }),
  holeDark: flat(0x111114),
  glassIn: new THREE.MeshStandardMaterial({
    color: 0xd9eefc,
    roughness: 0.2,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
  }),
  brain: flat(0xff9ab6, { roughness: 0.55 }),
  tail: flat(0xff3a2a, { emissive: 0xff2010, emissiveIntensity: 0.6 }),
  head: flat(0xfff6d8, { emissive: 0xfff0b0, emissiveIntensity: 0.5 }),
});

const clamp = (x) => Math.min(1, Math.max(0, x));
const TINY = V(1e-3, 1e-3, 1e-3);
function mesh(geo, mat, parent, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
function hash(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
function setPop(group, t, a, b) {
  const k = pop(t, a, b);
  group.visible = k > 0.001;
  group.scale.copy(t >= a ? squash(t, a).multiplyScalar(k) : TINY);
}
// tube along points, revealed by setDrawRange
function tubeAlong(pts, r, mat, parent, segs = 64, radial = 8) {
  const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), segs, r, radial);
  const m = mesh(geo, mat, parent);
  m.userData.count = segs * radial * 6;
  return m;
}
const _m = new THREE.Matrix4();
const _s = V(1, 1, 1);
const _q = new THREE.Quaternion();
const _p = V(0, 0, 0);

// ---------------------------------------------------------------- station floor
// concrete pad + pump island; the meadow's grass tufts under it are hidden
mesh(new THREE.BoxGeometry(10.4, 0.06, 7.6), M.pad, ground, 0.2, 0.03, -0.6).castShadow = false;
for (let i = 0; i < 7; i++) {
  // painted bay lines
  const l = mesh(
    new THREE.BoxGeometry(0.08, 0.01, 3.2),
    M.curb,
    ground,
    -3.6 + i * 1.5,
    0.065,
    1.2,
  );
  l.visible = i === 0 || i === 6;
}
mesh(new THREE.BoxGeometry(1.7, 0.18, 1.1), M.curb, ground, PUMP[0], 0.12, PUMP[2]);
ground.traverse((o) => {
  if (!o.isInstancedMesh) return;
  const pos = V(0, 0, 0);
  let hit = false;
  for (let i = 0; i < o.count; i++) {
    o.getMatrixAt(i, _m);
    pos.setFromMatrixPosition(_m);
    if (pos.x > -5.1 && pos.x < 5.5 && pos.z > -4.6 && pos.z < 3.4) {
      _m.makeScale(0, 0, 0);
      o.setMatrixAt(i, _m);
      hit = true;
    }
  }
  if (hit) o.instanceMatrix.needsUpdate = true;
});

// ---------------------------------------------------------------- the car
// long axis along z, right side (with the flap) at x = FLAP.x
const car = new THREE.Group();
scene.add(car);
const CX = FLAP[0] - 0.85;
const bodyMat = xrayMaterial(0xe2453c);
const cabinMat = xrayMaterial(0x6fa8d6, { roughness: 0.15, metalness: 0.2 });
const capMat = xrayMaterial(0x2b2b30);
const wheelMat = xrayMaterial(0x2e2a2c);
const hubMat = xrayMaterial(0xb9d6ea);
const tailMat = xrayMaterial(0xff3a2a, { emissive: 0xff2010, emissiveIntensity: 0.6 });
const carMats = [bodyMat, cabinMat, capMat, wheelMat, hubMat, tailMat];
{
  const lower = new THREE.BoxGeometry(1.7, 0.78, 3.6);
  const b = mesh(lower, bodyMat, car, CX, 0.73, -0.6);
  b.renderOrder = 3;
  const be = xrayEdges(lower);
  be.position.copy(b.position);
  car.add(be);
  // cabin: window band + red roof
  const cab = new THREE.BoxGeometry(1.5, 0.4, 1.9);
  const c = mesh(cab, cabinMat, car, CX, 1.32, -0.85);
  c.renderOrder = 3;
  const ce = xrayEdges(cab);
  ce.position.copy(c.position);
  car.add(ce);
  const roofG = new THREE.BoxGeometry(1.56, 0.13, 2.0);
  const roof = mesh(roofG, bodyMat, car, CX, 1.58, -0.85);
  roof.renderOrder = 3;
  for (const z of [-1.82, 0.12]) {
    const pillar = mesh(new THREE.BoxGeometry(1.54, 0.4, 0.1), bodyMat, car, CX, 1.32, z);
    pillar.renderOrder = 3;
  }
  // bumpers, lights
  mesh(new THREE.BoxGeometry(1.74, 0.16, 0.12), capMat, car, CX, 0.42, 1.22).renderOrder = 3;
  mesh(new THREE.BoxGeometry(1.74, 0.16, 0.12), capMat, car, CX, 0.42, -2.42).renderOrder = 3;
  for (const s of [-1, 1]) {
    mesh(new THREE.BoxGeometry(0.34, 0.14, 0.04), tailMat, car, CX + s * 0.6, 0.92, 1.21);
    mesh(new THREE.BoxGeometry(0.3, 0.14, 0.04), M.head, car, CX + s * 0.6, 0.86, -2.41);
  }
  // wheels
  for (const z of [-1.75, -0.05])
    for (const s of [-1, 1]) {
      const w = new THREE.CylinderGeometry(0.34, 0.34, 0.24, 14);
      w.rotateZ(Math.PI / 2);
      mesh(w, wheelMat, car, CX + s * 0.8, 0.34, z).renderOrder = 3;
      const hub = new THREE.CylinderGeometry(0.16, 0.16, 0.26, 10);
      hub.rotateZ(Math.PI / 2);
      mesh(hub, hubMat, car, CX + s * 0.8, 0.34, z).renderOrder = 3;
    }
  // open fuel flap + dark mouth of the filler neck
  const flapDoor = mesh(
    new THREE.BoxGeometry(0.03, 0.3, 0.3),
    bodyMat,
    car,
    FLAP[0] + 0.02,
    FLAP[1],
    FLAP[2] + 0.32,
  );
  flapDoor.rotation.y = -0.9;
  flapDoor.renderOrder = 3;
  const mouth = new THREE.CylinderGeometry(0.11, 0.11, 0.02, 16);
  mouth.rotateZ(Math.PI / 2);
  mesh(mouth, capMat, car, FLAP[0] + 0.005, FLAP[1], FLAP[2]).renderOrder = 3;
}
// inside (seen in x-ray): filler neck, tank, fuel
const NECK = [
  V(FLAP[0] + 0.02, FLAP[1] + 0.02, FLAP[2]),
  V(FLAP[0] - 0.3, FLAP[1] - 0.01, FLAP[2]),
  V(FLAP[0] - 0.66, FLAP[1] - 0.22, FLAP[2]),
  V(FLAP[0] - 0.82, FLAP[1] - 0.4, FLAP[2]),
  V(FLAP[0] - 0.86, 0.52, FLAP[2]),
];
const inner = new THREE.Group();
scene.add(inner);
const neck = tubeAlong(NECK, 0.1, M.glassIn, inner, 48, 12);
neck.castShadow = false;
neck.renderOrder = 1;
const TANK = { x0: FLAP[0] - 1.55, x1: FLAP[0] - 0.3, y0: 0.36, y1: 0.66, z0: -0.7, z1: 1.02 };
const tankGeo = new THREE.BoxGeometry(TANK.x1 - TANK.x0, TANK.y1 - TANK.y0, TANK.z1 - TANK.z0);
const tank = mesh(
  tankGeo,
  M.glassIn,
  inner,
  (TANK.x0 + TANK.x1) / 2,
  (TANK.y0 + TANK.y1) / 2,
  (TANK.z0 + TANK.z1) / 2,
);
tank.renderOrder = 1;
tank.castShadow = false;
const tankEdges = new THREE.LineSegments(
  new THREE.EdgesGeometry(tankGeo),
  new THREE.LineBasicMaterial({ color: 0xffd27a, transparent: true }),
);
tankEdges.position.copy(tank.position);
inner.add(tankEdges);
const tankFuel = mesh(
  new THREE.BoxGeometry(TANK.x1 - TANK.x0 - 0.04, 1, TANK.z1 - TANK.z0 - 0.04),
  M.fuel,
  inner,
  tank.position.x,
  0,
  tank.position.z,
);
// fuel rising up the neck (bottom → tip), revealed by draw range
const neckFuel = tubeAlong([...NECK].reverse(), 0.085, M.fuel, inner, 48, 10);
neckFuel.renderOrder = 2;

// ---------------------------------------------------------------- the nozzle
// local frame: origin at the flap, spout points -x. Built by makeNozzle so
// the diesel set can reuse the outer shape.
const SPOUT = [
  V(0.16, 0.03, 0),
  V(-0.05, 0.02, 0),
  V(-0.3, 0.0, 0),
  V(-0.5, -0.09, 0),
  V(-0.62, -0.2, 0),
];
const HOLE = V(-0.55, -0.15, 0.052); // on the side of the spout, just behind the tip
const HOSE_END = V(1.14, -0.13, 0);
function makeNozzle({ color, spoutR = 0.052, xray = false }) {
  const g = new THREE.Group();
  const mk = (c, extra) => (xray ? xrayMaterial(c, extra) : flat(c, { roughness: 0.4, ...extra }));
  const body = mk(color);
  const dark = mk(0x2b2b30);
  const steel = mk(0xc9d2da, { metalness: 0.5, roughness: 0.3 });
  const mats = [body, dark, steel];
  const parts = {};
  const rec = (m) => {
    m.renderOrder = 4;
    if (xray) {
      const e = xrayEdges(m.geometry);
      e.position.copy(m.position);
      e.rotation.copy(m.rotation);
      g.add(e);
    }
    return m;
  };
  rec(tubeAlong(SPOUT, spoutR, steel, g, 40, 12));
  // tip ring
  const tipRing = new THREE.TorusGeometry(spoutR, 0.012, 6, 16);
  tipRing.rotateY(Math.PI / 2);
  const tr = mesh(tipRing, steel, g, -0.6, -0.185, 0);
  tr.rotation.z = -0.75;
  // splash guard (black bellows) where the spout leaves the head
  const guard = new THREE.CylinderGeometry(0.11, 0.13, 0.14, 14);
  guard.rotateZ(Math.PI / 2);
  rec(mesh(guard, dark, g, 0.13, 0.03, 0));
  // head: rounded, a bit taller at the front
  const headShape = new THREE.ExtrudeGeometry(roundedShape(0.4, 0.3, 0.11), {
    depth: 0.22,
    bevelEnabled: true,
    bevelSize: 0.03,
    bevelThickness: 0.03,
    bevelSegments: 3,
  });
  headShape.translate(0, -0.11, -0.11);
  parts.head = rec(mesh(headShape, body, g, 0.4, 0.0, 0));
  // grip sloping down to the back: green shell with a black rubber top
  const grip = new THREE.BoxGeometry(0.6, 0.14, 0.18);
  const gr = rec(mesh(grip, body, g, 0.86, -0.04, 0));
  gr.rotation.z = -0.32;
  const top = rec(mesh(new THREE.BoxGeometry(0.5, 0.05, 0.2), dark, g, 0.86, 0.04, 0));
  top.rotation.z = -0.32;
  // swivel where the hose attaches
  const sw = new THREE.CylinderGeometry(0.075, 0.075, 0.12, 12);
  sw.rotateZ(Math.PI / 2);
  const s = rec(mesh(sw, steel, g, 1.17, -0.14, 0));
  s.rotation.z = -0.32;
  // lever under the grip (pivot near the head)
  const lever = new THREE.Group();
  lever.position.set(0.6, -0.15, 0);
  g.add(lever);
  const lb = mesh(new THREE.BoxGeometry(0.44, 0.045, 0.1), steel, lever, 0.22, -0.02, 0);
  lb.rotation.z = -0.3;
  lb.renderOrder = 4;
  parts.lever = lever;
  // guard bow below the lever
  rec(mesh(new THREE.BoxGeometry(0.62, 0.04, 0.12), dark, g, 0.82, -0.36, 0)).rotation.z = -0.22;
  rec(mesh(new THREE.BoxGeometry(0.04, 0.24, 0.12), dark, g, 0.53, -0.24, 0));
  return { g, mats, parts };
}
function roundedShape(w, h, r) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2 + r, 0);
  s.lineTo(w / 2 - r, 0);
  s.quadraticCurveTo(w / 2, 0, w / 2, r);
  s.lineTo(w / 2, h - r);
  s.quadraticCurveTo(w / 2, h, w / 2 - r, h);
  s.lineTo(-w / 2 + r, h);
  s.quadraticCurveTo(-w / 2, h, -w / 2, h - r);
  s.lineTo(-w / 2, r);
  s.quadraticCurveTo(-w / 2, 0, -w / 2 + r, 0);
  return s;
}

const noz = makeNozzle({ color: 0x2fb34a, xray: true });
scene.add(noz.g);
const nozMats = noz.mats;
// the hole: dark dot + glowing ring
const holeDot = mesh(
  new THREE.CircleGeometry(0.02, 12),
  M.holeDark,
  noz.g,
  HOLE.x,
  HOLE.y,
  HOLE.z + 0.002,
);
holeDot.castShadow = false;
const holeRing = mesh(
  new THREE.TorusGeometry(0.03, 0.008, 6, 18),
  M.ring,
  noz.g,
  HOLE.x,
  HOLE.y,
  HOLE.z + 0.004,
);
holeRing.castShadow = false;
holeRing.userData.noAO = true;
// inside: sensing tube from the hole back to the chamber under the membrane
const CHAMBER = V(0.42, 0.17, 0);
const tubePts = [
  V(HOLE.x, HOLE.y, 0.03),
  V(-0.48, -0.08, 0.02),
  V(-0.3, 0.025, 0.02),
  V(-0.05, 0.045, 0.02),
  V(0.2, 0.09, 0.02),
  V(0.36, 0.15, 0.0),
];
const sense = tubeAlong(tubePts, 0.013, M.tube, noz.g, 60, 6);
sense.castShadow = false;
const senseCurve = new THREE.CatmullRomCurve3(tubePts);
const chamber = mesh(
  new THREE.CylinderGeometry(0.1, 0.1, 0.05, 18),
  M.chamber,
  noz.g,
  CHAMBER.x,
  CHAMBER.y,
  0,
);
const membrane = mesh(
  new THREE.CylinderGeometry(0.105, 0.105, 0.018, 18),
  M.membrane,
  noz.g,
  CHAMBER.x,
  CHAMBER.y + 0.04,
  0,
);
// valve disc on its seat in the head
const valve = new THREE.CylinderGeometry(0.075, 0.075, 0.025, 16);
valve.rotateZ(Math.PI / 2);
const valveM = mesh(valve, M.valve, noz.g, 0.26, 0.03, 0);
// suction arrows pulling the membrane down
const suck = makeArrowSet(
  [
    [V(CHAMBER.x - 0.05, CHAMBER.y + 0.26, 0.0), V(CHAMBER.x - 0.05, CHAMBER.y + 0.07, 0.0)],
    [V(CHAMBER.x + 0.06, CHAMBER.y + 0.26, 0.0), V(CHAMBER.x + 0.06, CHAMBER.y + 0.07, 0.0)],
  ],
  { parent: noz.g, mat: forceMat, amp: 0, r: 0.012 },
);
const innerNoz = [sense, chamber, membrane, valveM];

// ---------------------------------------------------------------- fuel + air particles
// fuel path in nozzle-local coords (hose end → tip), continued by the neck
const FUEL_LOCAL = [
  HOSE_END,
  V(0.85, -0.03, 0),
  V(0.55, 0.04, 0),
  V(0.3, 0.03, 0),
  ...SPOUT.slice(1),
];
const NF = 46;
const beads = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), M.fuel, NF);
beads.renderOrder = 5;
scene.add(beads);
const NA = 26;
const airs = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), M.air, NA);
airs.renderOrder = 6;
scene.add(airs);
// flow rings travelling along the hose (solid look: you see the fuel rush)
const NR = 9;
const rings = new THREE.InstancedMesh(new THREE.TorusGeometry(0.075, 0.018, 6, 14), M.ring, NR);
scene.add(rings);

// on-time of the pump up to t (for a deterministic flow phase)
function onTime(t) {
  let s = 0;
  for (const [a, b] of FLOWS) s += clamp((t - a) / (b - a)) * (b - a);
  return s;
}
function flowK(t) {
  let k = 0;
  for (const [a, b] of FLOWS)
    k = Math.max(k, smooth(ramp(t, a, a + 0.12)) * (1 - ramp(t, b, b + 0.08)));
  return k;
}
function leverPull(t) {
  let k = 0;
  let dip = 0;
  for (const [a, b] of FLOWS) {
    const x = t - b;
    k = Math.max(k, smooth(ramp(t, a - 0.12, a)) * (1 - clamp(x / 0.07)));
    // the released lever smacks down past its rest and settles
    if (x > 0.07 && x < 0.8)
      dip = Math.min(dip, -0.35 * Math.exp(-(x - 0.07) * 7) * Math.abs(Math.sin((x - 0.07) * 22)));
  }
  return k + dip;
}

// ---------------------------------------------------------------- pump column + hose
const pump = new THREE.Group();
pump.position.set(...PUMP);
scene.add(pump);
const dispCanvas = document.createElement("canvas");
dispCanvas.width = 512;
dispCanvas.height = 320;
const dispTex = new THREE.CanvasTexture(dispCanvas);
dispTex.colorSpace = THREE.SRGBColorSpace;
{
  mesh(new THREE.BoxGeometry(1.1, 2.3, 0.62), M.pumpWhite, pump, 0, 1.36, 0);
  mesh(new THREE.BoxGeometry(1.14, 0.34, 0.66), M.pumpRed, pump, 0, 2.6, 0);
  mesh(new THREE.BoxGeometry(1.14, 0.14, 0.66), M.pumpRed, pump, 0, 0.3, 0);
  mesh(new THREE.BoxGeometry(0.9, 0.58, 0.04), flat(0x1c1c22), pump, 0, 1.86, 0.32);
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(0.84, 0.52),
    new THREE.MeshBasicMaterial({ map: dispTex, toneMapped: false }),
  );
  face.position.set(0, 1.86, 0.345);
  face.userData.noAO = true;
  pump.add(face);
  // holster for a second (diesel) nozzle on the right side
  mesh(new THREE.BoxGeometry(0.16, 0.34, 0.26), flat(0x2b2b30), pump, 0.62, 1.3, 0.05);
  // three fuel buttons
  [0x2fb34a, 0x2fb34a, 0x2b2b30].forEach((c, i) =>
    mesh(new THREE.BoxGeometry(0.16, 0.1, 0.04), flat(c), pump, -0.25 + i * 0.25, 1.38, 0.33),
  );
}
let dispKey = "";
function drawDisplay(liters) {
  const l = liters.toFixed(2).replace(".", ",");
  const e = (liters * 1.79).toFixed(2).replace(".", ",");
  const key = l + e;
  if (key === dispKey) return;
  dispKey = key;
  const g = dispCanvas.getContext("2d");
  g.fillStyle = "#0d0d12";
  g.fillRect(0, 0, 512, 320);
  g.fillStyle = "#c9c9d6";
  g.font = '800 34px "Montserrat", sans-serif';
  g.textBaseline = "top";
  g.fillText("EURO", 24, 26);
  g.fillText("LITER", 24, 176);
  g.shadowBlur = 18;
  g.textAlign = "right";
  g.textBaseline = "alphabetic";
  g.font = '800 104px "Montserrat", sans-serif';
  g.shadowColor = g.fillStyle = "#ffd23f";
  g.fillText(e, 492, 140);
  g.shadowColor = g.fillStyle = "#3dff7a";
  g.fillText(l, 492, 292);
  g.shadowBlur = 0;
  g.textAlign = "left";
  dispTex.needsUpdate = true;
}
const HOSE_START = V(PUMP[0] - 0.56, 1.25, PUMP[2] + 0.12);
let hoseMesh = null;
let hoseCurve = null;
function updateHose(t, endW, dirW, shake) {
  const mid1 = V(PUMP[0] - 0.9, 0.7, PUMP[2] + 0.6);
  const low = V(
    (HOSE_START.x + endW.x) / 2 + 0.25,
    0.16 + 0.03 * Math.sin(t * 31) * shake,
    (HOSE_START.z + endW.z) / 2 + 0.55,
  );
  const before = endW
    .clone()
    .addScaledVector(dirW, 0.45)
    .add(V(0, -0.25, 0));
  hoseCurve = new THREE.CatmullRomCurve3([HOSE_START, mid1, low, before, endW]);
  if (hoseMesh) {
    hoseMesh.geometry.dispose();
    hoseMesh.geometry = new THREE.TubeGeometry(hoseCurve, 64, 0.055, 8);
  } else {
    hoseMesh = mesh(new THREE.TubeGeometry(hoseCurve, 64, 0.055, 8), M.hose, scene);
  }
}

// ---------------------------------------------------------------- the brain gag
const brain = new THREE.Group();
scene.add(brain);
{
  for (const s of [-1, 1]) {
    const h = mesh(
      facet(jitter(new THREE.IcosahedronGeometry(0.17, 1), 0.035, s + 3), 0.07, s + 5),
      facetMat(M.brain),
      brain,
      0,
      0,
      s * 0.07,
    );
    h.scale.set(1.25, 0.9, 0.62);
  }
}
const BRAIN_AT = V(FLAP[0] + 0.45, FLAP[1] + 0.62, FLAP[2] + 0.05);

// ---------------------------------------------------------------- diesel set
// a petrol filler hole in a red car panel; the green petrol nozzle hangs on
// the left, the thick black diesel nozzle tries to get in and bounces off.
// Nozzles hang spout-down (local -x turned to -y).
const dset = new THREE.Group();
dset.position.set(...DIESEL);
scene.add(dset);
const PLATE_Y = 0.62;
{
  mesh(new THREE.CylinderGeometry(0.06, 0.08, PLATE_Y, 10), M.steel, dset, 0, PLATE_Y / 2, 0);
  mesh(new THREE.BoxGeometry(0.9, 0.08, 0.6), flat(0xe2453c), dset, 0, PLATE_Y, 0);
  const rim = mesh(
    new THREE.TorusGeometry(0.075, 0.025, 8, 20),
    flat(0x2fb34a),
    dset,
    0,
    PLATE_Y + 0.045,
    0,
  );
  rim.rotation.x = Math.PI / 2;
  const hole = mesh(new THREE.CircleGeometry(0.06, 16), M.holeDark, dset, 0, PLATE_Y + 0.042, 0);
  hole.rotation.x = -Math.PI / 2;
  mesh(new THREE.BoxGeometry(0.5, 0.06, 0.5), M.curb, dset, 0, 0.03, 0);
}
const petrolN = makeNozzle({ color: 0x2fb34a });
petrolN.g.rotation.z = Math.PI / 2;
petrolN.g.position.set(-0.45, 1.3, 0);
petrolN.g.scale.setScalar(0.75);
dset.add(petrolN.g);
const dieselN = makeNozzle({ color: 0x2b2b30, spoutR: 0.078 });
dieselN.g.rotation.z = Math.PI / 2;
dieselN.g.scale.setScalar(0.75);
dset.add(dieselN.g);
const DIESEL_REST = V(0.45, 1.3, 0);

// ---------------------------------------------------------------- the overflow (hook)
// what would happen without the hole: fuel gushes out of the flap and a
// puddle spreads on the concrete
const PUD = V(FLAP[0] + 0.55, 0.075, FLAP[2] + 0.25);
const puddle = mesh(
  new THREE.CylinderGeometry(1, 1, 0.02, 28),
  flat(0xffb21e, { emissive: 0xff8a00, emissiveIntensity: 0.35, roughness: 0.6 }),
  scene,
  PUD.x,
  PUD.y,
  PUD.z,
);
puddle.castShadow = false;
const NS = 34;
const spill = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), M.fuel, NS);
spill.castShadow = true;
scene.add(spill);
const SP = Array.from({ length: NS }, (_, i) => ({
  per: 0.55 + hash(i + 11) * 0.35,
  ph: hash(i + 12),
  vx: 0.7 + hash(i + 13) * 0.9,
  vy: 0.4 + hash(i + 14) * 1.1,
  vz: (hash(i + 15) - 0.5) * 0.9,
  s: 0.035 + hash(i + 16) * 0.035,
}));

const applyCamera = shotCamera(shots);

// ---------------------------------------------------------------- render
const _w = V(0, 0, 0);
const _d = V(0, 0, 0);
function renderAt(t) {
  // ---- nozzle pose: docked in the flap, floats during beat 1
  const out = smooth(ramp(t, LIFT, LIFT + 0.5));
  const back = inBack(ramp(t, PLUNGE, PLUNGE + 0.3));
  const hover = t >= LIFT && t < PLUNGE + 0.3 ? out * (1 - back) : 0;
  const docked = hover < 0.01;
  const bob = Math.sin(t * 2.1) * 0.03 * hover;
  noz.g.position.set(
    FLAP[0] + (HOVER[0] - FLAP[0]) * hover,
    FLAP[1] + (HOVER[1] - FLAP[1]) * hover + bob,
    FLAP[2] + (HOVER[2] - FLAP[2]) * hover,
  );
  noz.g.rotation.set(Math.sin(t * 1.3) * 0.06 * hover, 0, Math.sin(t * 1.7) * 0.04 * hover);
  noz.g.updateMatrixWorld();

  // ---- lever + flow
  const fk = docked ? flowK(t) : 0;
  noz.parts.lever.rotation.z = -0.05 + 0.3 * (docked ? leverPull(t) : 0);
  const shake = fk;
  _w.copy(HOSE_END).applyMatrix4(noz.g.matrixWorld);
  _d.set(1, -0.32, 0).normalize().transformDirection(noz.g.matrixWorld);
  updateHose(t, _w, _d, shake);
  drawDisplay(18.4 + onTime(t) * 0.62);

  // flow rings on the hose
  const ph = onTime(t) * 1.4;
  rings.visible = fk > 0.01;
  if (rings.visible) {
    for (let i = 0; i < NR; i++) {
      const u = 0.06 + 0.9 * ((i / NR + ph) % 1);
      hoseCurve.getPointAt(u, _p);
      const tan = hoseCurve.getTangentAt(u);
      _q.setFromUnitVectors(V(0, 0, 1), tan);
      _s.setScalar(Math.max(1e-4, fk * Math.sin(u * Math.PI) * 1.1));
      _m.compose(_p, _q, _s);
      rings.setMatrixAt(i, _m);
    }
    rings.instanceMatrix.needsUpdate = true;
  }

  // ---- x-ray: car + nozzle while the inside is explained
  const xk =
    smooth(ramp(t, T.saugt - 0.35, T.saugt + 0.2)) * (1 - smooth(ramp(t, STOP + 0.15, STOP + 0.6)));
  setXray([...carMats, ...nozMats], xk);
  inner.visible = xk > 0.02;
  M.glassIn.opacity = 0.28 * xk;
  tankEdges.material.opacity = 0.8 * xk;
  for (const m of innerNoz) m.visible = xk > 0.02;

  // fuel level: tank fills, then the neck up to the hole and a bit beyond
  const tankLvl = 0.35 + 0.65 * smooth(ramp(t, FLOW_ON, T.steigt + 0.3));
  const h = (TANK.y1 - TANK.y0 - 0.04) * tankLvl;
  tankFuel.scale.y = Math.max(0.001, h);
  tankFuel.position.y = TANK.y0 + 0.02 + h / 2;
  const neckLvl = 0.66 * smooth(ramp(t, T.steigt + 0.3, COVER)) + 0.08 * ramp(t, COVER, STOP);
  neckFuel.visible = neckLvl > 0.005 && inner.visible;
  neckFuel.geometry.setDrawRange(0, Math.ceil((neckLvl * neckFuel.userData.count) / 60) * 60);

  // sensing tube grows on "Röhrchen", glows cyan while air flows, dark after
  const grow = t < T.durch ? 0 : smooth(ramp(t, T.durch, T.roehrchen + 0.3));
  sense.geometry.setDrawRange(0, Math.ceil((grow * sense.userData.count) / 36) * 36);
  const airOn = clamp(ramp(t, FLOW_ON, FLOW_ON + 0.4) * (1 - ramp(t, COVER, COVER + 0.3)));
  M.tube.emissiveIntensity = 0.3 + 1.4 * airOn + 0.8 * pop(t, T.roehrchen, T.roehrchen + 1.2, 0.3);
  M.tube.color.setHex(airOn > 0.5 || t < COVER ? 0x35d6ff : 0x6a3cff);

  // suction under the membrane
  const vac = smooth(ramp(t, COVER, T.unterdruck + 0.4)) * (1 - ramp(t, STOP, STOP + 0.25));
  const pulse = 0.5 + 0.5 * Math.sin(t * 14);
  M.chamber.emissiveIntensity = vac * (1.2 + 0.8 * pulse);
  const pull =
    smooth(ramp(t, T.zieht, T.membran + 0.4)) * 0.7 * (1 - ramp(t, STOP + 0.3, STOP + 1.2));
  const snap = t >= STOP && t < STOP + 0.3 ? 1 : 0;
  membrane.position.y = CHAMBER.y + 0.04 - 0.025 * (pull + 0.3 * snap) - 0.006 * vac * pulse;
  membrane.scale.set(1, 1 + pull * 0.5, 1);
  M.membrane.emissiveIntensity = 0.2 + 1.2 * pop(t, T.membran, T.klack, 0.2);
  animateArrows(suck, t, pop(t, T.unterdruck + 0.1, STOP));

  // valve: open while flowing, closed (red flash) on the stop
  const closed = 1 - fk;
  valveM.position.x = 0.26 - 0.07 * closed;
  M.valve.emissiveIntensity =
    1.6 * pop(t, STOP, T.sie, 0.2) * (1 + 0.6 * pop(t, T.knallt, T.knallt + 0.4, 0.1));

  // hole ring: pulses on "Loch", breathes on "atmet"
  const ringK = pop(t, T.loch1 - 0.05, T.fliesst, 0.2) * (0.75 + 0.25 * Math.sin(t * 7));
  holeRing.visible = ringK > 0.01;
  holeRing.scale.setScalar(Math.max(0.001, ringK * (1 + 0.25 * Math.sin(t * 5))));

  // ---- fuel beads through the nozzle and down the neck (x-ray only)
  const showBeads = docked && xk > 0.05 && fk > 0.01;
  beads.visible = showBeads;
  if (showBeads) {
    const pts = FUEL_LOCAL.map((p) => p.clone().applyMatrix4(noz.g.matrixWorld));
    pts.push(V(FLAP[0] - 0.8, FLAP[1] - 0.4, FLAP[2]), V(FLAP[0] - 0.86, 0.55, FLAP[2]));
    const curve = new THREE.CatmullRomCurve3(pts);
    const fph = onTime(t) * 0.9;
    for (let i = 0; i < NF; i++) {
      const u = (i / NF + fph) % 1;
      curve.getPointAt(u, _p);
      _p.z += (hash(i) - 0.5) * 0.04;
      _s.setScalar(Math.max(1e-4, fk * (0.022 + 0.012 * hash(i + 9))));
      _m.compose(_p, _q.identity(), _s);
      beads.setMatrixAt(i, _m);
    }
    beads.instanceMatrix.needsUpdate = true;
  }

  // ---- air: sucked into the hole (hover: from outside; docked: up the tube)
  let airVis = 0;
  if (!docked) airVis = pop(t, T.atmet - 0.1, PLUNGE, 0.2);
  else airVis = xk * airOn * fk;
  airs.visible = airVis > 0.01;
  if (airs.visible) {
    for (let i = 0; i < NA; i++) {
      const u = (t * (docked ? 0.55 : 0.8) + hash(i)) % 1;
      if (!docked) {
        // converge from a cone in front of the hole into it
        const a = hash(i + 3) * Math.PI * 2;
        const r = (1 - u) * 0.45;
        _p.set(
          HOLE.x + Math.cos(a) * r * 0.8,
          HOLE.y + Math.sin(a) * r * 0.6,
          HOLE.z + 0.02 + (1 - u) * 0.35,
        );
      } else {
        senseCurve.getPointAt(Math.min(u, 0.999), _p);
      }
      _p.applyMatrix4(noz.g.matrixWorld);
      const sc = (docked ? 0.012 : 0.016 * (0.4 + u)) * airVis;
      _s.setScalar(Math.max(1e-4, sc));
      _m.compose(_p, _q.identity(), _s);
      airs.setMatrixAt(i, _m);
    }
    airs.instanceMatrix.needsUpdate = true;
  }

  // ---- the overflow in the hook (t < SPILL_END, also the loop tail)
  const spillOn = t < SPILL_END;
  puddle.visible = spillOn;
  const pGrow = clamp((t + 3) / 5.5);
  puddle.scale.set(0.55 + 0.35 * pGrow, 1, 0.45 + 0.3 * pGrow);
  spill.visible = spillOn;
  if (spillOn) {
    for (let i = 0; i < NS; i++) {
      const f = SP[i];
      const u = (((t / f.per + f.ph) % 1) + 1) % 1;
      const tt = u * f.per;
      const y = FLAP[1] - 0.05 + f.vy * tt - 4.9 * tt * tt;
      _p.set(FLAP[0] + 0.08 + f.vx * tt, Math.max(0.09, y), FLAP[2] + f.vz * tt);
      _s.setScalar(y > 0.09 ? f.s : f.s * 0.4);
      _m.compose(_p, _q.identity(), _s);
      spill.setMatrixAt(i, _m);
    }
    spill.instanceMatrix.needsUpdate = true;
  }

  // ---- the brain gag (payoff)
  const bk = pop(t, T.nichts - 0.05, T.uebrigens, 0.25);
  brain.visible = bk > 0.01;
  const bAt = T.nichts - 0.05;
  brain.position.copy(BRAIN_AT);
  brain.scale.copy(t >= bAt ? squash(t, bAt).multiplyScalar(bk) : TINY);
  brain.rotation.y = Math.sin(t * 2) * 0.3 + 0.4;
  const nk = pop(t, T.nichts + 0.3, T.luft3 + 0.5, 0.15);
  if (nk > 0) showNope(nk, BRAIN_AT.x, BRAIN_AT.y, BRAIN_AT.z + 0.2, 0.42);
  else if (t >= T.ueberlaufen && t < SPILL_END)
    showNope(
      pop(t, T.ueberlaufen + 0.25, SPILL_END, 0.12),
      FLAP[0] + 1.0,
      FLAP[1] - 0.2,
      FLAP[2] + 0.4,
      0.45,
    );
  else if (t >= T.passt && t < T.hoerst)
    showNope(
      pop(t, T.passt + 0.3, T.hoerst, 0.15),
      DIESEL[0] + 0.35,
      DIESEL[1] + PLATE_Y + 0.3,
      DIESEL[2] + 0.35,
      0.3,
    );
  else showNope(0, 0, 0, 0);

  // ---- diesel set: thick nozzle moves over the hole, pushes down, bounces off
  setPop(dset, t, T.uebrigens + 0.05, T.hoerst);
  const over = smooth(ramp(t, T.viele, T.viele + 0.5));
  const down = smooth(ramp(t, T.viele + 0.5, T.passt + 0.25));
  const bt = t - T.passt - 0.25;
  const bounce = bt > 0 ? Math.exp(-bt * 4) * Math.abs(Math.sin(bt * 12)) : 0;
  dieselN.g.position.set(
    DIESEL_REST.x + (-0.15 - DIESEL_REST.x) * over,
    DIESEL_REST.y - 0.17 * down + 0.25 * bounce + 0.12 * smooth(ramp(t, T.nicht, T.nicht + 0.5)),
    0,
  );
  dieselN.g.rotation.x = Math.sin(bt * 30) * 0.05 * bounce;
  petrolN.g.position.y = 1.3 + Math.sin(t * 2 + 1) * 0.015;

  // ---- landing puff when the nozzle goes back in
  puff("plunge", t, PLUNGE + 0.25, FLAP[0] + 0.1, FLAP[1] - 0.05, FLAP[2] + 0.1, 0.45);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
