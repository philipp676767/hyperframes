// Windrad: paper pinwheel -> wind turbine. Rotor blades (airfoil, plane
// analogy) -> gearbox (15 -> 1500 rpm, crank whisk analogy) -> generator
// (magnets in copper coils, bike dynamo analogy) -> lamp from the hook lights up.
import {
  THREE,
  W,
  END,
  clamp01,
  ramp,
  smooth,
  outBack,
  inBack,
  pop,
  V,
  scene,
  flat,
  M,
  xrayMaterial,
  xrayEdges,
  setXray,
  showNope,
  makeArrowSet,
  animateArrows,
  coldMat,
  forceMat,
  showPanel,
  LED,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { createWorld } from "./environments.js";

createWorld({ env: "land", sky: "sonnenuntergang" });

Object.assign(M, {
  white: flat(0xf6f4f0, { roughness: 0.5 }),
  red: flat(0xe8463a),
  blue: flat(0x3a7be8),
  yellow: flat(0xffd23f),
  dark: flat(0x3b3f48),
});

// ---------------------------------------------------------------- beats
const T = {
  papier: W("Papierwindrad"),
  dreht1: W("dreht", 1),
  aber1: W("Aber", 1),
  leuchtet: W("leuchtet"),
  lampe: W("Lampe"),
  also1: W("Also", 1),
  riesig: W("riesig"),
  fussball: W("Fußballfeld"),
  gewoelbt: W("gewölbt"),
  flugzeug: W("Flugzeugtragfläche"),
  zieht: W("zieht"),
  herum: W("herum"),
  rotorblaetter: W("Rotorblätter"),
  aber2: W("Aber", 2),
  gemuetlich: W("gemütlich"),
  mal15: W("15-mal"),
  also2: W("Also", 2),
  zahnraeder: W("Zahnräder"),
  n1500: W("1500"),
  schneebesen: W("Schneebesen"),
  kurbel: W("Kurbel"),
  getriebe: W("Getriebe"),
  schnelle: W("schnelle"),
  magnete: W("Magnete"),
  kupfer: W("Kupferspulen"),
  strom: W("Strom"),
  dynamo: W("Dynamo"),
  fahrrad: W("Fahrrad"),
  generator: W("Generator"),
  schau: W("Schau"),
  gerade: W("gerade"),
  folg: W("Folg"),
};

// Deterministic spin: integrate a speed curve once, look the angle up per frame.
function spinTable(speed) {
  const dt = 1 / 120;
  const n = Math.ceil((END + 2) / dt);
  const a = new Float32Array(n + 1);
  for (let i = 1; i <= n; i++) a[i] = a[i - 1] + speed((i - 0.5) * dt) * dt;
  return (t) => {
    const x = clamp01(t / (n * dt)) * n;
    const i = Math.min(n - 1, Math.floor(x));
    return a[i] + (a[i + 1] - a[i]) * (x - i);
  };
}

// ---------------------------------------------------------------- lamp (hook + payoff)
function makeLamp() {
  const g = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.9, 8), M.dark);
  post.position.y = 0.45;
  post.castShadow = true;
  g.add(post);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.06, 12), M.dark);
  foot.position.y = 0.03;
  g.add(foot);
  const sock = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 10), M.alu);
  sock.position.y = 0.95;
  g.add(sock);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xfff6dc,
    roughness: 0.25,
    emissive: 0xffb43a,
    emissiveIntensity: 0,
  });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), mat);
  bulb.position.y = 1.1;
  g.add(bulb);
  const light = new THREE.PointLight(0xffc46b, 0, 4, 1.5);
  light.position.y = 1.1;
  g.add(light);
  scene.add(g);
  return {
    g,
    on(k) {
      mat.emissiveIntensity = 2.2 * k;
      light.intensity = 5 * k;
    },
  };
}

// ---------------------------------------------------------------- hook: paper pinwheel
const hook = new THREE.Group();
scene.add(hook);
const hookLamp = makeLamp();
hook.add(hookLamp.g);
hookLamp.g.position.set(0.55, 0, 0.1);
const pinwheel = new THREE.Group();
{
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.1, 6), M.wood);
  stick.position.set(-0.35, 0.55, 0);
  stick.castShadow = true;
  hook.add(stick);
  pinwheel.position.set(-0.35, 1.08, 0.05);
  hook.add(pinwheel);
  const cols = [0xff5a7a, 0x3fb6ff, 0xffd23f, 0x5fd16a];
  for (let i = 0; i < 4; i++) {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(0.3, 0.02);
    s.lineTo(0.26, 0.28);
    s.lineTo(0, 0);
    const vane = new THREE.Mesh(
      new THREE.ShapeGeometry(s),
      flat(cols[i], { side: THREE.DoubleSide }),
    );
    vane.rotation.z = (i * Math.PI) / 2;
    vane.rotation.y = 0.25;
    vane.castShadow = true;
    pinwheel.add(vane);
  }
  const pin = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), M.yellow);
  pinwheel.add(pin);
}
const hookWind = makeArrowSet(
  [
    [V(-0.9, 1.25, 1.6), V(-0.45, 1.15, 0.25)],
    [V(-0.1, 0.95, 1.6), V(-0.3, 1.0, 0.25)],
    [V(-0.6, 0.7, 1.5), V(-0.4, 0.95, 0.25)],
  ],
  { parent: hook, mat: coldMat },
);
const pinSpin = spinTable((t) => 9 * smooth(ramp(t, T.papier, T.dreht1)));

// ---------------------------------------------------------------- the turbine
const HUB_Y = 3.2;
const turbine = new THREE.Group();
scene.add(turbine);

// tower (x-ray so the cable inside shows)
const towerMat = xrayMaterial(0xf6f4f0);
const towerGeo = new THREE.CylinderGeometry(0.09, 0.17, HUB_Y - 0.25, 16, 1, true);
const tower = new THREE.Mesh(towerGeo, towerMat);
tower.position.y = (HUB_Y - 0.25) / 2;
tower.castShadow = true;
turbine.add(tower);
const towerEdges = xrayEdges(towerGeo);
towerEdges.position.copy(tower.position);
turbine.add(towerEdges);
const foundation = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.1, 16), M.concrete);
foundation.position.y = 0.05;
foundation.receiveShadow = true;
turbine.add(foundation);
const door = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 0.02), M.steel);
door.position.set(0, 0.25, 0.16);
turbine.add(door);

// nacelle (machine house): rounded box, x-ray
const nacMat = xrayMaterial(0xf6f4f0);
const nacGeo = new THREE.BoxGeometry(0.72, 0.6, 1.4, 2, 2, 2);
const nacelle = new THREE.Mesh(nacGeo, nacMat);
nacelle.position.set(0, HUB_Y, -0.15);
nacelle.castShadow = true;
turbine.add(nacelle);
const nacEdges = xrayEdges(nacGeo);
nacEdges.position.copy(nacelle.position);
turbine.add(nacEdges);

// rotor: spinner + three airfoil blades, spinning around z
const rotor = new THREE.Group();
rotor.position.set(0, HUB_Y, 0.62);
turbine.add(rotor);
const spinner = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 10), M.white);
spinner.scale.set(1, 1, 1.5);
spinner.castShadow = true;
rotor.add(spinner);
const BLADE = 1.85;
const blades = [];
{
  const s = new THREE.Shape();
  s.moveTo(-0.06, 0.12);
  s.quadraticCurveTo(-0.14, 0.32, -0.1, 0.6);
  s.lineTo(-0.025, BLADE);
  s.lineTo(0.02, BLADE);
  s.quadraticCurveTo(0.09, 0.6, 0.06, 0.12);
  s.lineTo(-0.06, 0.12);
  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 0.03,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.012,
    bevelSegments: 1,
  });
  geo.translate(0, 0, -0.015);
  for (let i = 0; i < 3; i++) {
    const arm = new THREE.Group();
    arm.rotation.z = (i * Math.PI * 2) / 3;
    rotor.add(arm);
    const b = new THREE.Mesh(geo, M.white);
    b.rotation.y = 0.35; // pitch
    b.castShadow = true;
    arm.add(b);
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.05), M.red);
    tip.position.y = BLADE - 0.1;
    b.add(tip);
    blades.push(arm);
  }
}

// inside the nacelle: slow shaft -> big gear -> small gear -> fast shaft -> generator
const inside = new THREE.Group();
inside.position.set(0, HUB_Y, 0);
turbine.add(inside);
function gearGeo(r, teeth, depth) {
  const s = new THREE.Shape();
  const n = teeth * 4;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = i % 4 < 2 ? r : r * 0.82;
    const x = Math.cos(a) * rr;
    const y = Math.sin(a) * rr;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  const hole = new THREE.Path();
  hole.absarc(0, 0, r * 0.25, 0, Math.PI * 2, true);
  s.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
  g.translate(0, 0, -depth / 2);
  return g;
}
const shaftMat = flat(0x8a96a3, { roughness: 0.4, metalness: 0.5 });
const slowShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.62, 10), shaftMat);
slowShaft.rotation.x = Math.PI / 2;
slowShaft.position.set(-0.1, 0, 0.36);
inside.add(slowShaft);
const bigGearMat = flat(0xffb02e, { emissive: 0xff8a00, emissiveIntensity: 0 });
const smallGearMat = flat(0xff6a2f, { emissive: 0xff3d1f, emissiveIntensity: 0 });
const bigGear = new THREE.Mesh(gearGeo(0.19, 22, 0.07), bigGearMat);
bigGear.position.set(-0.1, 0, 0.08);
inside.add(bigGear);
const smallGear = new THREE.Mesh(gearGeo(0.075, 9, 0.07), smallGearMat);
smallGear.position.set(0.155, 0, 0.08);
inside.add(smallGear);
const fastShaftMat = flat(0x8a96a3, { emissive: 0xff7a2f, emissiveIntensity: 0 });
const fastShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 8), fastShaftMat);
fastShaft.rotation.x = Math.PI / 2;
fastShaft.position.set(0.155, 0, -0.14);
inside.add(fastShaft);
const gen = new THREE.Group();
gen.position.set(0.04, 0, -0.5);
inside.add(gen);
// magnet rotor: alternating red / blue
const magnets = new THREE.Group();
gen.add(magnets);
for (let i = 0; i < 8; i++) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.06, 0.26), i % 2 ? M.red : M.blue);
  const a = (i / 8) * Math.PI * 2;
  m.position.set(Math.cos(a) * 0.1, Math.sin(a) * 0.1, 0);
  m.rotation.z = a;
  magnets.add(m);
}
const magnetCore = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.27, 12), shaftMat);
magnetCore.rotation.x = Math.PI / 2;
magnets.add(magnetCore);
// copper coil ring (stator)
const coilMat = new THREE.MeshStandardMaterial({
  color: 0xc8743c,
  metalness: 0.6,
  roughness: 0.35,
  emissive: 0xff7a1a,
  emissiveIntensity: 0,
});
const coils = new THREE.Group();
gen.add(coils);
for (let i = 0; i < 10; i++) {
  const c = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.018, 6, 12), coilMat);
  const a = (i / 10) * Math.PI * 2;
  c.position.set(Math.cos(a) * 0.205, Math.sin(a) * 0.205, 0);
  c.rotation.set(0, Math.PI / 2, a);
  c.scale.set(1, 1, 2.6);
  coils.add(c);
}
const genRing = new THREE.Mesh(
  new THREE.TorusGeometry(0.205, 0.012, 6, 32),
  flat(0x6b4a3a, { roughness: 0.6 }),
);
coils.add(genRing);

// power cable: generator -> down the tower -> along the grass -> lamp
const payLamp = makeLamp();
payLamp.g.position.set(1.45, 0, 1.25);
const cablePts = [
  V(0.04, HUB_Y - 0.2, -0.5),
  V(0.02, HUB_Y - 0.32, -0.15),
  V(0, HUB_Y - 0.45, 0),
  V(0, 1.6, 0),
  V(0, 0.2, 0),
  V(0.15, 0.04, 0.3),
  V(0.8, 0.04, 0.95),
  V(1.42, 0.04, 1.25),
];
const cableCurve = new THREE.CatmullRomCurve3(cablePts, false, "catmullrom", 0.2);
const CABLE_SEGS = 120;
const cableGeo = new THREE.TubeGeometry(cableCurve, CABLE_SEGS, 0.018, 6);
const cableMat = flat(0x2e2a2c, { emissive: 0xffc23a, emissiveIntensity: 0 });
const cable = new THREE.Mesh(cableGeo, cableMat);
scene.add(cable);
const SPARKS = 22;
const sparks = new THREE.InstancedMesh(
  new THREE.SphereGeometry(0.035, 8, 6),
  new THREE.MeshBasicMaterial({ color: 0xffe066 }),
  SPARKS,
);
scene.add(sparks);
const tmpM = new THREE.Matrix4();
const tmpP = new THREE.Vector3();

// wind arrows into the rotor
const windIn = makeArrowSet(
  [
    [V(-1.3, HUB_Y + 0.9, 3.4), V(-0.9, HUB_Y + 0.7, 1.2)],
    [V(1.2, HUB_Y - 0.6, 3.4), V(0.9, HUB_Y - 0.5, 1.2)],
    [V(0.2, HUB_Y + 1.5, 3.4), V(0.4, HUB_Y + 1.1, 1.2)],
    [V(-1.0, HUB_Y - 1.2, 3.4), V(-0.7, HUB_Y - 0.9, 1.2)],
  ],
  { mat: coldMat },
);

// rotor speed: still -> pulled round on "herum" -> keeps turning
const rotorSpin = spinTable((t) => 1.6 * smooth(ramp(t, T.zieht, T.herum + 0.8)));

// ---------------------------------------------------------------- analogy: airplane wing (-5, 0, 2)
const PLANE = V(-5, 0, 2);
const plane = new THREE.Group();
plane.position.copy(PLANE);
scene.add(plane);
const planeBody = new THREE.Group();
planeBody.position.y = 1.0;
plane.add(planeBody);
{
  const fus = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.09, 1.3, 12), M.white);
  fus.rotation.x = Math.PI / 2;
  fus.castShadow = true;
  planeBody.add(fus);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 8), M.white);
  nose.position.z = 0.65;
  planeBody.add(nose);
  const win = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.12), flat(0x3fb6ff));
  win.position.set(0, 0.07, 0.62);
  planeBody.add(win);
  // curved wing: lathe a cambered profile sideways
  const prof = new THREE.Shape();
  prof.moveTo(-0.22, 0);
  prof.quadraticCurveTo(-0.05, 0.11, 0.22, 0.0);
  prof.quadraticCurveTo(0, 0.02, -0.22, 0);
  const wingGeo = new THREE.ExtrudeGeometry(prof, { depth: 1.7, bevelEnabled: false });
  wingGeo.translate(0, 0, -0.85);
  const wing = new THREE.Mesh(wingGeo, M.red);
  wing.rotation.y = Math.PI / 2;
  wing.position.set(0, -0.02, 0.05);
  wing.castShadow = true;
  planeBody.add(wing);
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.28, 0.22), M.red);
  fin.position.set(0, 0.17, -0.58);
  planeBody.add(fin);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.025, 0.18), M.red);
  tail.position.set(0, 0.02, -0.6);
  planeBody.add(tail);
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 6), M.dark);
  stand.position.y = 0.45;
  plane.add(stand);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.06, 12), M.dark);
  base.position.y = 0.03;
  plane.add(base);
}
const planeAir = makeArrowSet(
  [
    [V(-0.5, 1.12, 1.6), V(-0.5, 1.12, -0.9)],
    [V(0.5, 1.12, 1.6), V(0.5, 1.12, -0.9)],
  ],
  { parent: plane, mat: coldMat },
);
const planeLift = makeArrowSet(
  [
    [V(-0.5, 1.15, 0.05), V(-0.5, 1.85, 0.05)],
    [V(0.5, 1.15, 0.05), V(0.5, 1.85, 0.05)],
  ],
  { parent: plane, mat: forceMat, amp: 0, r: 0.04 },
);

// ---------------------------------------------------------------- analogy: crank whisk (5, 0, 2)
const WHISK = V(5, 0, 2);
const whisk = new THREE.Group();
whisk.position.copy(WHISK);
scene.add(whisk);
const crankWheel = new THREE.Group();
const whiskHead = new THREE.Group();
{
  const bowl = new THREE.Mesh(
    new THREE.LatheGeometry(
      [V(0.0, 0, 0), V(0.3, 0.02, 0), V(0.45, 0.2, 0), V(0.5, 0.42, 0), V(0.47, 0.44, 0)],
      20,
    ),
    flat(0x7fd0c8, { side: THREE.DoubleSide }),
  );
  bowl.castShadow = true;
  whisk.add(bowl);
  const cream = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.35, 0.05, 20), M.white);
  cream.position.y = 0.3;
  whisk.add(cream);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.85, 8), M.chrome);
  shaft.position.y = 0.75;
  whisk.add(shaft);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.32, 10), M.wood);
  handle.position.y = 1.32;
  whisk.add(handle);
  // crank wheel (vertical plane) with handle
  crankWheel.position.set(0.15, 1.0, 0);
  whisk.add(crankWheel);
  const wheel = new THREE.Mesh(gearGeo(0.2, 18, 0.03), M.red);
  wheel.rotation.y = Math.PI / 2;
  crankWheel.add(wheel);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 0.3), M.steel);
  arm.position.set(0.04, 0, 0.12);
  crankWheel.add(arm);
  const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.14, 8), M.wood);
  knob.rotation.z = Math.PI / 2;
  knob.position.set(0.1, 0, 0.26);
  crankWheel.add(knob);
  // whisk loops spinning fast
  whiskHead.position.y = 0.42;
  whisk.add(whiskHead);
  for (let i = 0; i < 4; i++) {
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.008, 6, 20), M.chrome);
    loop.scale.set(1, 1.5, 1);
    loop.rotation.y = (i * Math.PI) / 4;
    whiskHead.add(loop);
  }
}
const crankSpin = spinTable((t) => 2.2 * pop(t, T.schneebesen - 0.2, T.getriebe + 0.4, 0.3));
const whiskSpin = spinTable((t) => 22 * pop(t, T.schneebesen - 0.2, T.getriebe + 0.4, 0.3));

// ---------------------------------------------------------------- analogy: bike dynamo (-5, 0, 2)
const BIKE = V(-5, 0, 2);
const bike = new THREE.Group();
bike.position.copy(BIKE);
scene.add(bike);
const wheelG = new THREE.Group();
wheelG.position.set(0, 0.6, 0);
bike.add(wheelG);
const dynamoCap = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.06, 10), M.dark);
const headMat = new THREE.MeshStandardMaterial({
  color: 0xfff6dc,
  emissive: 0xffd36b,
  emissiveIntensity: 0,
});
const beamMat = new THREE.MeshBasicMaterial({
  color: 0xfff2b0,
  transparent: true,
  opacity: 0,
  depthWrite: false,
});
{
  const tire = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.05, 8, 32), M.rubber);
  tire.castShadow = true;
  wheelG.add(tire);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.015, 6, 32), M.chrome);
  wheelG.add(rim);
  for (let i = 0; i < 12; i++) {
    const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 1.0, 4), M.chrome);
    sp.rotation.z = (i / 12) * Math.PI;
    wheelG.add(sp);
  }
  wheelG.rotation.y = Math.PI / 2;
  const fork = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.9, 0.04), M.red);
  fork.position.set(0.09, 0.95, 0);
  fork.rotation.x = -0.25;
  bike.add(fork);
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7, 8), M.dark);
  bar.rotation.x = Math.PI / 2;
  bar.position.set(0.09, 1.38, -0.12);
  bike.add(bar);
  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 0.4), M.dark);
  stand.position.y = 0.03;
  bike.add(stand);
  // dynamo leaning on the tire
  const dyn = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.18, 10), M.chrome);
  dyn.position.set(0.09, 1.12, 0.12);
  bike.add(dyn);
  dynamoCap.position.set(0.09, 1.02, 0.15);
  bike.add(dynamoCap);
  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.12, 12), headMat);
  lamp.rotation.x = Math.PI / 2;
  lamp.position.set(0.09, 1.3, 0.28);
  bike.add(lamp);
  const beam = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.2, 16, 1, true), beamMat);
  beam.rotation.x = -Math.PI / 2;
  beam.position.set(0.09, 1.3, 0.92);
  bike.add(beam);
}
const bikeSpin = spinTable((t) => 7 * smooth(ramp(t, T.dynamo - 0.4, T.dynamo + 0.2)));

// ---------------------------------------------------------------- shots
const shots = [
  // hook
  { at: 0, from: [1.3, 1.2, 2.0], to: [1.0, 1.1, 1.6], look: [-0.1, 0.8, 0] },
  { at: T.aber1, from: [-0.5, 1.1, 1.6], to: [-0.2, 1.05, 1.3], look: [0.4, 0.9, 0], zoom: 1.4 },
  // turbine appears: low wide
  { at: T.also1, from: [0.8, 1.0, 4.6], to: [0.5, 1.3, 4.0], look: [0, 2.3, 0] },
  // blades grow, panel 70 m
  { at: T.fussball, from: [-1.6, 3.0, 2.8], to: [-1.2, 3.3, 2.4], look: [0, HUB_Y, 0.4] },
  // airplane analogy
  {
    at: T.flugzeug,
    from: [-1.5, 1.9, 1.5],
    to: [-1.2, 1.8, 1.1],
    look: [0, 1.1, 0],
    rel: PLANE,
    zoom: 1.3,
  },
  // wind pulls the rotor round
  { at: T.herum, from: [1.6, 2.2, 3.6], to: [0.9, 2.4, 3.6], look: [0, HUB_Y - 0.3, 0] },
  { at: T.rotorblaetter, orbit: { c: [0, HUB_Y - 0.4, 0], r: 6.0, y: 2.2, a0: 0.5, a1: -0.3 } },
  // slow: close to the hub
  {
    at: T.gemuetlich,
    from: [1.5, HUB_Y + 0.4, 3.0],
    to: [1.2, HUB_Y + 0.3, 2.6],
    look: [0, HUB_Y, 0.5],
  },
  // x-ray gears
  {
    at: T.zahnraeder,
    from: [1.2, HUB_Y + 0.55, -0.7],
    to: [1.0, HUB_Y + 0.45, -0.45],
    look: [0.03, HUB_Y, 0.05],
    zoom: 1.35,
  },
  // whisk analogy
  {
    at: T.schneebesen,
    from: [-1.2, 1.4, 1.6],
    to: [-0.9, 1.3, 1.3],
    look: [0, 0.8, 0],
    rel: WHISK,
    zoom: 1.3,
  },
  // gearbox name: orbit of nacelle
  {
    at: T.getriebe,
    orbit: { c: [0, HUB_Y, -0.1], r: 1.35, y: HUB_Y + 0.6, a0: 1.9, a1: 1.45 },
  },
  // generator: from behind/side
  {
    at: T.magnete,
    from: [1.0, HUB_Y + 0.4, -1.3],
    to: [0.9, HUB_Y + 0.3, -1.0],
    look: [0.04, HUB_Y, -0.45],
    zoom: 1.3,
  },
  // current flows down to the lamp
  { at: T.strom, from: [3.0, 1.4, 3.6], to: [2.5, 1.9, 3.2], look: [0.5, 1.4, 0.4] },
  // bike dynamo
  {
    at: T.dynamo,
    from: [1.4, 1.3, 1.3],
    to: [1.1, 1.25, 1.0],
    look: [0, 0.95, 0.1],
    rel: BIKE,
    zoom: 1.3,
  },
  // full x-ray orbit
  { at: T.generator, orbit: { c: [0, 2.2, 0], r: 6.2, y: 3.0, a0: -0.7, a1: 0.2 } },
  // outro
  { at: T.schau, from: [1.2, 1.6, 4.2], to: [0.9, 1.8, 3.8], look: [0, 2.4, 0] },
  {
    at: T.gerade,
    from: [2.2, 2.4, 4.6],
    to: [8.5, 7.5, 15],
    look: [0, 2.4, 0],
    lookTo: [0, 1.6, 0],
  },
];
const applyCamera = shotCamera(shots);

// ---------------------------------------------------------------- render
function renderAt(t) {
  // hook: pinwheel spins, lamp stays dark, X
  pinwheel.rotation.z = -pinSpin(t);
  animateArrows(hookWind, t, pop(t, T.papier, T.also1));
  hookLamp.on(0);
  showNope(pop(t, T.leuchtet, T.also1), 0.55, 1.45, 0.3, 0.5);
  const hookOut = inBack(ramp(t, T.also1, T.also1 + 0.35));
  hook.visible = hookOut < 1;
  hook.scale.setScalar(Math.max(0.001, 1 - hookOut));

  // turbine pops in on "Also", blades grow on "riesig"
  const k = outBack(ramp(t, T.also1 + 0.15, T.also1 + 0.75));
  turbine.visible = k > 0;
  turbine.scale.setScalar(Math.max(0.001, k));
  blades.forEach((b, i) => {
    const g = outBack(ramp(t, T.riesig - 0.1 + i * 0.15, T.riesig + 0.5 + i * 0.15));
    b.visible = g > 0;
    b.scale.set(1, Math.max(0.001, g), 1);
  });
  const rot = rotorSpin(t);
  rotor.rotation.z = rot;
  animateArrows(windIn, t, pop(t, T.zieht, T.rotorblaetter + 0.6));

  // x-ray from the gears until the outro
  const xr =
    smooth(ramp(t, T.zahnraeder - 0.3, T.zahnraeder + 0.3)) * (1 - ramp(t, T.schau, T.schau + 0.5));
  setXray([nacMat, towerMat], xr);
  inside.visible = xr > 0.02;

  // gears: big one with the rotor, small one 2.5x faster (and racing later)
  const gIn = outBack(ramp(t, T.zahnraeder, T.zahnraeder + 0.5));
  bigGear.scale.setScalar(Math.max(0.001, gIn));
  const sIn = outBack(ramp(t, T.zahnraeder + 0.25, T.zahnraeder + 0.75));
  smallGear.scale.setScalar(Math.max(0.001, sIn));
  bigGear.rotation.z = rot;
  smallGear.rotation.z = -rot * (0.19 / 0.075) + 0.17;
  slowShaft.rotation.y = rot;
  const fast = smooth(ramp(t, T.n1500, T.n1500 + 0.6));
  smallGearMat.emissiveIntensity = 0.6 * fast;
  bigGearMat.emissiveIntensity = 0.25 * pop(t, T.getriebe, T.schnelle);

  // generator: fast shaft, magnets, coils glow on "Strom"
  const shIn = smooth(ramp(t, T.schnelle, T.schnelle + 0.4));
  fastShaft.scale.set(1, Math.max(0.001, shIn), 1);
  fastShaftMat.emissiveIntensity = 0.8 * pop(t, T.schnelle, T.magnete);
  const mIn = outBack(ramp(t, T.magnete, T.magnete + 0.5));
  magnets.scale.setScalar(Math.max(0.001, mIn));
  magnets.rotation.z = -rot * (0.19 / 0.075);
  const cIn = outBack(ramp(t, T.kupfer, T.kupfer + 0.5));
  coils.scale.setScalar(Math.max(0.001, cIn));
  const power = smooth(ramp(t, T.strom - 0.2, T.strom + 0.4));
  coilMat.emissiveIntensity = 1.4 * power * (0.8 + 0.2 * Math.sin(t * 25));

  // cable grows down the tower on "Strom", sparks run to the lamp
  const cg = smooth(ramp(t, T.kupfer + 0.3, T.strom + 0.2));
  cable.visible = cg > 0;
  cableGeo.setDrawRange(0, Math.ceil(cg * CABLE_SEGS) * 6 * 6);
  cableMat.emissiveIntensity = 0.5 * power;
  const sparkOn = power * (1 - ramp(t, T.folg, T.folg + 0.5));
  sparks.visible = sparkOn > 0.01;
  if (sparks.visible) {
    for (let i = 0; i < SPARKS; i++) {
      const u = (i / SPARKS + t * 0.35) % 1;
      cableCurve.getPointAt(u, tmpP);
      tmpM.makeScale(sparkOn, sparkOn, sparkOn).setPosition(tmpP);
      sparks.setMatrixAt(i, tmpM);
    }
    sparks.instanceMatrix.needsUpdate = true;
  }
  const lampIn = outBack(ramp(t, T.kupfer, T.kupfer + 0.5));
  payLamp.g.visible = lampIn > 0;
  payLamp.g.scale.setScalar(Math.max(0.001, lampIn));
  payLamp.on(smooth(ramp(t, T.strom + 0.3, T.strom + 0.7)));

  // airplane analogy: air over the wing, lift pulls it up
  const pv = t >= T.gewoelbt - 0.3 && t < T.herum + 0.3;
  plane.visible = pv;
  if (pv) {
    const lift = smooth(ramp(t, T.flugzeug + 0.3, T.flugzeug + 1.1));
    planeBody.position.y = 1.0 + 0.18 * lift + Math.sin(t * 4) * 0.015 * lift;
    planeBody.rotation.x = -0.08 * lift;
    animateArrows(planeAir, t, pop(t, T.flugzeug, T.herum + 0.3));
    animateArrows(planeLift, t, pop(t, T.flugzeug + 0.4, T.herum + 0.3));
  } else {
    animateArrows(planeAir, t, 0);
    animateArrows(planeLift, t, 0);
  }

  // whisk analogy: slow crank, fast whisk
  const wv = t >= T.also2 && t < T.getriebe + 0.5;
  whisk.visible = wv;
  if (wv) {
    crankWheel.rotation.x = crankSpin(t);
    whiskHead.rotation.y = whiskSpin(t);
  }

  // bike analogy: wheel turns, dynamo hums, headlight on
  const bv = t >= T.strom && t < T.generator + 0.3;
  bike.visible = bv;
  if (bv) {
    wheelG.rotation.z = -bikeSpin(t);
    dynamoCap.rotation.y = bikeSpin(t) * 10;
    const lit = smooth(ramp(t, T.dynamo + 0.2, T.dynamo + 0.6));
    headMat.emissiveIntensity = 2 * lit;
    beamMat.opacity = 0.35 * lit;
  }

  // LED panel: one fact at a time
  if (t >= T.fussball && t < T.flugzeug) {
    showPanel(pop(t, T.fussball, T.flugzeug), "EIN BLATT", "70 m", LED.yellow);
  } else if (t >= T.mal15 && t < T.zahnraeder) {
    showPanel(pop(t, T.mal15, T.zahnraeder), "UMDREHUNGEN/MIN", "15", LED.blue);
  } else if (t >= T.n1500 && t < T.schneebesen) {
    showPanel(pop(t, T.n1500, T.schneebesen), "UMDREHUNGEN/MIN", "1500", LED.red);
  } else if (t >= T.strom + 0.3 && t < T.dynamo) {
    showPanel(pop(t, T.strom + 0.3, T.dynamo), "STROM", "AN", LED.green);
  } else {
    showPanel(0);
  }

  applyCamera(t);
  renderFrame();
}

start(renderAt);
