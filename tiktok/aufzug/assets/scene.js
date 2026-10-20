// "So funktioniert ein Aufzug": a glass-walled lift shaft on a city plaza at
// blue hour. Hook: bucket on a rope over a beam. Build: shaft, traction
// sheave + motor, counterweight (see-saw analogy), several ropes, safety gear
// clamping the rails, landing + car doors that only open when the car is there.
import {
  THREE,
  W,
  ramp,
  lerp,
  smooth,
  easeInOut,
  outBack,
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
  showNope,
  makeArrowSet,
  animateArrows,
  forceMat,
  showPanel,
  LED,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { createWorld } from "./environments.js";

createWorld({ env: "stadt", sky: "abend" });

// ---------------------------------------------------------------- beats
const T = {
  eimer: W("Eimer"),
  hochziehst: W("hochziehst"),
  aufzug1: W("Aufzug", 1),
  aber1: W("Aber", 1),
  meter: W("Meter"),
  also1: W("Also", 1),
  seil2: W("Seil", 2),
  rad: W("Rad"),
  elektromotor: W("Elektromotor"),
  treibscheibe: W("Treibscheibe"),
  aber2: W("Aber", 2),
  schleppen: W("schleppen"),
  also2: W("Also", 2),
  gewicht: W("Gewicht"),
  wippe: W("Wippe"),
  gegengewicht: W("Gegengewicht"),
  reisst: W("reißt"),
  mehreren: W("mehreren"),
  halten: W("halten"),
  schnell: W("schnell"),
  krallen: W("krallen"),
  schienen: W("Schienen"),
  fang: W("Fangvorrichtung"),
  tueren: W("Türen"),
  wirklich: W("wirklich"),
  da: W("da"),
  schau: W("Schau"),
  gerade: W("gerade"),
};

// helpers ---------------------------------------------------------
const UP = V(0, 1, 0);
const _a = V(0, 0, 0);
// stretch a unit-height cylinder between two points
function segment(mesh, a, b) {
  _a.copy(b).sub(a);
  const len = Math.max(1e-4, _a.length());
  mesh.position.copy(a).addScaledVector(_a, 0.5);
  mesh.quaternion.setFromUnitVectors(UP, _a.normalize());
  mesh.scale.set(1, len, 1);
}
const ropeGeo = new THREE.CylinderGeometry(1, 1, 1, 6);
const ropeMat = flat(0x3a3a44, { roughness: 0.5, metalness: 0.4 });
const rope = (r = 0.022, mat = ropeMat) => {
  const m = new THREE.Mesh(ropeGeo, mat);
  m.scale.set(r, 1, r);
  m.userData.r = r;
  m.castShadow = true;
  return m;
};
function ropeSeg(mesh, a, b) {
  segment(mesh, a, b);
  mesh.scale.x = mesh.scale.z = mesh.userData.r;
}

// ---------------------------------------------------------------- hook: bucket on a beam
const hook = new THREE.Group();
scene.add(hook);
const hookRopeV = rope(0.02, flat(0xc9a46b));
const hookRopeTop = rope(0.02, flat(0xc9a46b));
const hookRopeDown = rope(0.02, flat(0xc9a46b));
hook.add(hookRopeV, hookRopeTop, hookRopeDown);
const bucket = new THREE.Group();
const tub = new THREE.Group();
const person = new THREE.Group();
{
  for (const x of [-1.0, 1.0]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.5, 0.16), M.wood);
    post.position.set(x, 1.25, 0);
    post.castShadow = true;
    hook.add(post);
  }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.18, 0.2), M.woodDark);
  beam.position.set(0, 2.5, 0);
  beam.castShadow = true;
  hook.add(beam);
  const pail = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.15, 0.32, 12, 1, true),
    flat(0x7da3c9, { side: THREE.DoubleSide }),
  );
  pail.position.y = 0.16;
  bucket.add(pail);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.012, 4, 16, Math.PI), M.steel);
  handle.position.y = 0.32;
  bucket.add(handle);
  hook.add(bucket);
  const big = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.42, 0.55, 14, 1, true),
    flat(0x7da3c9, { side: THREE.DoubleSide }),
  );
  big.position.y = 0.28;
  big.castShadow = true;
  tub.add(big);
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(0.42, 14), flat(0x6b8fb5));
  bottom.rotation.x = -Math.PI / 2;
  bottom.position.y = 0.02;
  tub.add(bottom);
  // you, in the tub
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.42, 4, 8), flat(0xff7a5c));
  body.position.y = 0.6;
  body.castShadow = true;
  person.add(body);
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.17, 1), flat(0xf0b08a));
  head.position.y = 1.08;
  head.castShadow = true;
  person.add(head);
  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(0.17, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2),
    flat(0x3c7be2),
  );
  cap.position.y = 1.12;
  person.add(cap);
  for (const s of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.32, 3, 6), flat(0xff7a5c));
    arm.position.set(s * 0.27, 0.82, 0);
    arm.rotation.z = s * 2.6; // arms up, holding the rope
    person.add(arm);
  }
  tub.add(person);
  hook.add(tub);
}

// ---------------------------------------------------------------- lift
const lift = new THREE.Group();
scene.add(lift);
const SH = 6.0; // shaft wall height
const SW = 1.9; // inner width (x)
const SZ0 = -0.95; // inner back (z)
const SZ1 = 0.95; // inner front (z)
const CAR_Z = 0.25;
const CW_Z = -0.66;
const SHEAVE_Y = SH + 0.55;
const SHEAVE_Z = (CAR_Z + CW_Z) / 2;
const SHEAVE_R = (CAR_Z - CW_Z) / 2;
const CAR_H = 1.7;
const CW_H = 1.15;

// shaft walls (x-ray) with a door opening at the ground floor
const wallMat = xrayMaterial(0xe9d8c4);
const shaftMats = [wallMat];
const wall = (w, h, d, x, y, z) => {
  const geo = new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(geo, wallMat);
  m.position.set(x, y, z);
  m.castShadow = true;
  lift.add(m);
  const e = xrayEdges(geo);
  e.position.copy(m.position);
  lift.add(e);
};
const WT = 0.1;
wall(SW + 2 * WT, SH, WT, 0, SH / 2, SZ0 - WT / 2); // back
wall(WT, SH, SZ1 - SZ0, -SW / 2 - WT / 2, SH / 2, 0); // left
wall(WT, SH, SZ1 - SZ0, SW / 2 + WT / 2, SH / 2, 0); // right
const DOOR_W = 1.1;
const DOOR_H = 2.0;
const sideW = (SW + 2 * WT - DOOR_W) / 2;
wall(sideW, SH, WT, -(DOOR_W + sideW) / 2, SH / 2, SZ1 + WT / 2); // front left
wall(sideW, SH, WT, (DOOR_W + sideW) / 2, SH / 2, SZ1 + WT / 2); // front right
wall(DOOR_W, SH - DOOR_H, WT, 0, DOOR_H + (SH - DOOR_H) / 2, SZ1 + WT / 2); // lintel
// corner posts + machine deck on top (always solid)
for (const sx of [-1, 1])
  for (const sz of [SZ0 - WT, SZ1 + WT]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.14, SH + 0.1, 0.14), M.steel);
    p.position.set(sx * (SW / 2 + WT), (SH + 0.1) / 2, sz);
    p.castShadow = true;
    lift.add(p);
  }
const deck = new THREE.Mesh(
  new THREE.BoxGeometry(SW + 0.5, 0.14, SZ1 - SZ0 + 0.5),
  flat(0x7f8a99, { roughness: 0.5 }),
);
deck.position.set(0, SH + 0.07, 0);
deck.castShadow = true;
lift.add(deck);
// landing door frame + sliding landing doors + floor indicator lamp
const landingDoors = [];
for (const s of [-1, 1]) {
  const d = new THREE.Mesh(
    new THREE.BoxGeometry(DOOR_W / 2, DOOR_H, 0.05),
    flat(0xb8c2cf, { roughness: 0.35, metalness: 0.4 }),
  );
  d.position.set((s * DOOR_W) / 4, DOOR_H / 2, SZ1 + WT + 0.04);
  d.userData.s = s;
  lift.add(d);
  landingDoors.push(d);
}
const lampMat = flat(0xff3b2f, { emissive: 0xff3b2f, emissiveIntensity: 1.2 });
const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), lampMat);
lamp.position.set(0, DOOR_H + 0.22, SZ1 + WT + 0.06);
lift.add(lamp);

// guide rails (T-profile) on both sides
const railMat = flat(0x9aa6b6, {
  roughness: 0.4,
  metalness: 0.5,
  emissive: 0xffb84d,
  emissiveIntensity: 0,
});
for (const s of [-1, 1]) {
  const web = new THREE.Mesh(new THREE.BoxGeometry(0.12, SH - 0.1, 0.04), railMat);
  web.position.set(s * (SW / 2 - 0.06), (SH - 0.1) / 2, CAR_Z);
  lift.add(web);
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.04, SH - 0.1, 0.14), railMat);
  blade.position.set(s * (SW / 2 - 0.12), (SH - 0.1) / 2, CAR_Z);
  lift.add(blade);
}

// the car
const car = new THREE.Group();
lift.add(car);
const carDoors = [];
const wedges = [];
const carLight = new THREE.PointLight(0xfff1cf, 0, 3, 1.5);
{
  const cw = 1.45;
  const cd = 1.2;
  const shell = flat(0xf6efe6, { roughness: 0.4 });
  const add = (geo, mat, x, y, z) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    car.add(m);
    return m;
  };
  add(new THREE.BoxGeometry(cw, 0.08, cd), flat(0x8a7f86), 0, 0.04, 0); // floor
  add(new THREE.BoxGeometry(cw, 0.08, cd), shell, 0, CAR_H - 0.04, 0); // roof
  add(new THREE.BoxGeometry(cw, CAR_H, 0.05), shell, 0, CAR_H / 2, -cd / 2 + 0.025); // back
  for (const s of [-1, 1])
    add(new THREE.BoxGeometry(0.05, CAR_H, cd), shell, (s * (cw - 0.05)) / 2, CAR_H / 2, 0);
  // brass handrail + mirror strip inside
  add(
    new THREE.BoxGeometry(cw - 0.2, 0.04, 0.04),
    flat(0xd9a441, { metalness: 0.6, roughness: 0.3 }),
    0,
    0.95,
    -cd / 2 + 0.1,
  );
  add(
    new THREE.BoxGeometry(cw - 0.3, 0.6, 0.02),
    flat(0xcfe6ff, { roughness: 0.1 }),
    0,
    1.35,
    -cd / 2 + 0.06,
  );
  // car doors (front)
  for (const s of [-1, 1]) {
    const d = add(
      new THREE.BoxGeometry(cw / 2 - 0.02, CAR_H - 0.12, 0.04),
      flat(0xd9dee6, { roughness: 0.3, metalness: 0.3 }),
      (s * cw) / 4,
      CAR_H / 2,
      cd / 2 - 0.02,
    );
    d.userData.s = s;
    carDoors.push(d);
  }
  // rope hitch on top
  add(new THREE.BoxGeometry(0.5, 0.12, 0.2), M.steel, 0, CAR_H + 0.06, 0);
  // guide shoes + safety-gear wedges at both sides, at the bottom
  for (const s of [-1, 1]) {
    add(new THREE.BoxGeometry(0.12, 0.2, 0.2), M.rubber, s * (cw / 2 + 0.06), 0.3, 0);
    add(new THREE.BoxGeometry(0.12, 0.2, 0.2), M.rubber, s * (cw / 2 + 0.06), CAR_H - 0.3, 0);
    const wedge = add(
      new THREE.CylinderGeometry(0.0, 0.11, 0.24, 3),
      flat(0xff7a2f, { emissive: 0xff5a10, emissiveIntensity: 0 }),
      s * (cw / 2 + 0.03),
      0.12,
      0.12,
    );
    wedge.rotation.z = Math.PI;
    wedge.userData.s = s;
    wedges.push(wedge);
  }
  carLight.position.set(0, CAR_H - 0.25, 0);
  car.add(carLight);
  car.position.z = CAR_Z;
}

// counterweight: stack of concrete slabs in a steel frame
const cwGroup = new THREE.Group();
lift.add(cwGroup);
{
  const frame = flat(0x5a6170, { metalness: 0.4, roughness: 0.5 });
  for (let i = 0; i < 5; i++) {
    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.2, 0.22),
      flat(i % 2 ? 0x9b9590 : 0xa9a39d),
    );
    slab.position.y = 0.13 + i * 0.21;
    slab.castShadow = true;
    cwGroup.add(slab);
  }
  for (const s of [-1, 1]) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.06, CW_H, 0.26), frame);
    bar.position.set(s * 0.5, CW_H / 2, 0);
    cwGroup.add(bar);
  }
  const topBar = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.08, 0.26), frame);
  topBar.position.y = CW_H;
  cwGroup.add(topBar);
  cwGroup.position.z = CW_Z;
}

// traction sheave + motor on the deck
const sheave = new THREE.Group();
sheave.position.set(0, SHEAVE_Y, SHEAVE_Z);
lift.add(sheave);
const motorMat = flat(0x3d6fd6, { roughness: 0.4, emissive: 0x4fc3ff, emissiveIntensity: 0 });
const motor = new THREE.Group();
{
  const wheel = new THREE.Mesh(new THREE.CylinderGeometry(SHEAVE_R, SHEAVE_R, 0.5, 24), M.steel);
  wheel.rotation.z = Math.PI / 2;
  wheel.castShadow = true;
  sheave.add(wheel);
  for (let k = 0; k < 6; k++) {
    // spokes make the rotation readable
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.05, SHEAVE_R * 1.9), flat(0x4a5260));
    spoke.rotation.x = (k / 6) * Math.PI;
    sheave.add(spoke);
  }
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.55, 14), motorMat);
  body.rotation.z = Math.PI / 2;
  body.position.set(0.62, 0, 0);
  body.castShadow = true;
  motor.add(body);
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.3), flat(0x2b2b33));
  box.position.set(0.62, 0.32, 0);
  motor.add(box);
  const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8), M.chrome);
  axle.rotation.z = Math.PI / 2;
  axle.position.x = 0.3;
  motor.add(axle);
  const stand = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, SHEAVE_Y - SH - 0.14, 0.3),
    flat(0x5a6170),
  );
  stand.position.set(0.3, -(SHEAVE_Y - SH) / 2 + 0.07, 0);
  motor.add(stand);
  motor.position.copy(sheave.position);
  lift.add(motor);
}

// ropes: four parallel, car side + counterweight side + the bit on the sheave
const ROPE_X = [-0.15, -0.05, 0.05, 0.15];
const carRopes = ROPE_X.map(() => rope());
const cwRopes = ROPE_X.map(() => rope());
const ropeHighlight = flat(0x3a3a44, { emissive: 0xffd23f, emissiveIntensity: 0 });
carRopes.forEach((r) => lift.add(r));
cwRopes.forEach((r) => lift.add(r));
for (const x of ROPE_X) {
  const arc = new THREE.Mesh(
    new THREE.TorusGeometry(SHEAVE_R + 0.02, 0.022, 4, 20, Math.PI),
    ropeMat,
  );
  arc.rotation.y = Math.PI / 2;
  arc.position.set(x, SHEAVE_Y, SHEAVE_Z);
  lift.add(arc);
}
// the snapped rope's two loose ends
const snapTop = rope();
const snapBottom = rope();
lift.add(snapTop, snapBottom);

// sparks (rope snap + safety gear)
const NS = 60;
const sparks = new THREE.InstancedMesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0xffd27a }),
  NS,
);
sparks.frustumCulled = false;
lift.add(sparks);
const sr = rng(5);
const sparkSeed = Array.from({ length: NS }, () => [sr() * 2 - 1, sr(), sr() * 2 - 1, sr()]);

// weight arrows (straight, yellow) on car and counterweight
const carArrow = makeArrowSet([[V(0, CAR_H + 1.1, 0.75), V(0, CAR_H + 0.1, 0.75)]], {
  parent: car,
  mat: forceMat,
  amp: 0,
  r: 0.06,
});
const cwArrow = makeArrowSet([[V(0, CW_H + 1.1, 0.3), V(0, CW_H + 0.1, 0.3)]], {
  parent: cwGroup,
  mat: forceMat,
  amp: 0,
  r: 0.06,
});

// ---------------------------------------------------------------- see-saw analogy
const S = V(-5, 0, 2.2);
const seesaw = new THREE.Group();
seesaw.position.copy(S);
seesaw.rotation.y = 0.35;
scene.add(seesaw);
const plank = new THREE.Group();
const ssWeight = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 0.5), flat(0xa9a39d));
{
  const fulcrum = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.6, 3), flat(0xffc928));
  fulcrum.position.y = 0.3;
  fulcrum.castShadow = true;
  seesaw.add(fulcrum);
  const board = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.08, 0.45), M.wood);
  board.castShadow = true;
  plank.add(board);
  const mini = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.7, 0.5), flat(0xf6efe6));
  mini.position.set(-1.25, 0.39, 0);
  mini.castShadow = true;
  plank.add(mini);
  const miniDoor = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.5, 0.02), flat(0xd9dee6));
  miniDoor.position.set(-1.25, 0.34, 0.26);
  plank.add(miniDoor);
  ssWeight.position.set(1.25, 0.27, 0);
  ssWeight.castShadow = true;
  plank.add(ssWeight);
  plank.position.y = 0.62;
  seesaw.add(plank);
}

// ---------------------------------------------------------------- motion schedule
// car floor height over time (pure function of t)
function carY(t) {
  if (t < T.elektromotor) return 0.1;
  if (t < T.reisst) {
    const up1 = smooth(ramp(t, T.elektromotor, T.schleppen + 0.6)) * 1.6; // slow, straining
    const up2 = easeInOut(ramp(t, T.gegengewicht - 0.2, T.reisst)) * 1.9; // easy with counterweight
    return 0.1 + up1 + up2;
  }
  const hang = 3.6;
  if (t < T.schnell) return hang;
  if (t < T.krallen) {
    const k = ramp(t, T.schnell, T.krallen);
    return hang - 1.4 * k * k; // accelerating drop
  }
  const caught = hang - 1.4;
  return lerp(caught, 0.1, easeInOut(ramp(t, T.tueren, T.wirklich + 0.1)));
}
const cwY = (c) => 4.35 - c; // counterweight bottom, opposite to the car

// ---------------------------------------------------------------- shots
const shots = [
  { at: 0, from: [2.0, 1.7, 3.1], to: [1.6, 1.5, 2.7], look: [0, 1.3, 0] },
  { at: T.aufzug1, from: [3.4, 2.4, 5.6], to: [2.9, 2.1, 4.9], look: [0, 1.3, 0] },
  { at: T.aber1, from: [-1.7, 1.2, 2.5], to: [-1.4, 1.1, 2.1], look: [0.3, 0.9, 0] },
  { at: T.also1, from: [3.4, 3.6, 6.4], to: [2.9, 3.3, 5.6], look: [0, 3.1, 0] },
  { at: T.rad, from: [1.6, 7.4, 2.2], to: [1.2, 7.2, 1.8], look: [0.2, 6.4, -0.2], zoom: 1.9 },
  { at: T.treibscheibe, orbit: { c: [0.2, 6.4, -0.2], r: 2.2, y: 7.4, a0: 0.9, a1: -0.4 } },
  { at: T.aber2, from: [3.6, 3.0, 3.2], to: [3.2, 2.8, 2.8], look: [0, 2.3, 0.2] },
  { at: T.wippe, from: [2.0, 1.7, 3.0], to: [1.7, 1.5, 2.6], look: [0, 0.8, 0], rel: S },
  { at: T.gegengewicht, from: [3.9, 3.4, -1.2], to: [3.7, 3.1, 0.6], look: [0, 3.0, -0.1] },
  { at: T.reisst, from: [1.3, 5.9, 2.3], to: [1.0, 5.7, 1.9], look: [0, 5.4, 0.2] },
  { at: T.mehreren, from: [2.4, 5.3, 3.3], to: [2.0, 5.1, 2.9], look: [0, 4.8, 0] },
  {
    at: T.schnell,
    from: [2.6, 1.9, 3.4],
    to: [2.4, 1.9, 3.1],
    look: [0, 3.6, 0.2],
    lookTo: [0, 2.7, 0.2],
    zoom: 1.4,
  },
  {
    at: T.krallen,
    from: [1.9, 2.6, 1.5],
    to: [1.6, 2.45, 1.25],
    look: [0.8, 2.3, 0.25],
    zoom: 1.2,
  },
  { at: T.fang, orbit: { c: [0, 2.9, 0.2], r: 2.7, y: 3.3, a0: 1.0, a1: 0.2 } },
  {
    at: T.tueren,
    from: [0.2, 1.5, 4.3],
    to: [0.1, 1.35, 3.7],
    look: [0, 2.4, 0.9],
    lookTo: [0, 1.2, 0.9],
  },
  { at: T.schau, from: [1.0, 1.9, 4.6], to: [0.6, 1.7, 3.9], look: [0, 1.6, 0] },
  {
    at: T.gerade,
    from: [3.2, 2.8, 5.4],
    to: [9.5, 7.8, 15],
    look: [0, 2.6, 0],
    lookTo: [0, 1.8, 0],
  },
];
const applyCamera = shotCamera(shots);

// ---------------------------------------------------------------- render
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = V(1, 1, 1);
const _v = V(0, 0, 0);
const _b = V(0, 0, 0);

function renderAt(t) {
  // hook ----------------------------------------------------------
  const hookOut = inBack(ramp(t, T.also1, T.also1 + 0.35));
  hook.visible = hookOut < 1;
  hook.scale.setScalar(Math.max(0.001, 1 - hookOut));
  const lifted = smooth(ramp(t, T.hochziehst - 0.2, T.aufzug1));
  const swapped = t >= T.aber1;
  bucket.visible = !swapped;
  tub.visible = swapped;
  bucket.position.set(0.55, lifted * 1.5, 0);
  bucket.rotation.z = Math.sin(t * 3) * 0.06 * lifted;
  // with you inside: the tub only twitches
  const strain = swapped ? ramp(t, T.aber1, T.aber1 + 0.4) : 0;
  tub.position.set(0.45, Math.abs(Math.sin(t * 14)) * 0.04 * strain, 0);
  tub.rotation.z = Math.sin(t * 9) * 0.04 * strain;
  person.rotation.y = Math.sin(t * 2) * 0.2;
  const hx = swapped ? 0.45 : 0.55;
  const hy = swapped ? tub.position.y + 1.3 : bucket.position.y + 0.32;
  ropeSeg(hookRopeV, V(hx, hy, 0), V(hx, 2.5, 0));
  ropeSeg(hookRopeTop, V(hx, 2.6, 0), V(-0.75, 2.6, 0));
  ropeSeg(hookRopeDown, V(-0.75, 2.5, 0), V(-0.75 + Math.sin(t * 9) * 0.05 * strain, 0.3, 0.1));
  showNope(pop(t, T.meter, T.also1), 0.45, 2.3, 0.4, 0.45);

  // lift appears --------------------------------------------------
  const lIn = outBack(ramp(t, T.also1 + 0.15, T.also1 + 0.8));
  lift.visible = lIn > 0;
  lift.scale.setScalar(Math.max(0.001, lIn));
  const xr = smooth(ramp(t, T.seil2, T.rad + 0.3)) * (1 - smooth(ramp(t, T.schau, T.schau + 0.5)));
  setXray(shaftMats, xr);

  // reveal of parts on their words
  const sheaveIn = outBack(ramp(t, T.rad, T.rad + 0.4));
  sheave.scale.setScalar(Math.max(0.001, sheaveIn));
  const motorIn = outBack(ramp(t, T.elektromotor, T.elektromotor + 0.4));
  motor.scale.setScalar(Math.max(0.001, motorIn));
  const cwIn = outBack(ramp(t, T.gewicht, T.gewicht + 0.45));
  cwGroup.visible = cwIn > 0;
  cwGroup.scale.setScalar(Math.max(0.001, cwIn));

  // car + counterweight + sheave rotation
  const c = carY(t);
  car.position.y = c;
  const cy = cwY(c);
  cwGroup.position.y = cy;
  sheave.rotation.x = -(c - 0.1) / SHEAVE_R;

  // motor: blue hum when it starts, red strain while it drags the car alone
  const strainK = pop(t, T.schleppen - 0.2, T.gegengewicht + 0.2, 0.3);
  motorMat.emissive.setHex(strainK > 0.05 ? 0xff3b1f : 0x4fc3ff);
  motorMat.emissiveIntensity =
    strainK > 0.05
      ? 1.2 * strainK * (0.7 + 0.3 * Math.sin(t * 20))
      : 0.8 * pop(t, T.elektromotor, T.aber2);
  motor.position.x = strainK > 0.05 ? Math.sin(t * 70) * 0.01 : 0;

  // ropes
  const ropesOn = sheaveIn > 0.3;
  const snapped = t >= T.reisst;
  const ropeGlow = pop(t, T.mehreren, T.schnell);
  ropeHighlight.emissiveIntensity = 0.9 * ropeGlow;
  ROPE_X.forEach((x, i) => {
    const carTop = V(x, c + CAR_H + 0.12, CAR_Z);
    const sheaveFront = V(x, SHEAVE_Y, CAR_Z);
    const sheaveBack = V(x, SHEAVE_Y, CW_Z);
    const cwTop = V(x, cy + CW_H + 0.04, CW_Z);
    const r = carRopes[i];
    r.visible = ropesOn && !(snapped && i === 3);
    r.material = ropeGlow > 0.05 && i !== 3 ? ropeHighlight : ropeMat;
    ropeSeg(r, carTop, sheaveFront);
    cwRopes[i].visible = ropesOn && cwIn > 0.2;
    ropeSeg(cwRopes[i], sheaveBack, cwTop);
  });
  snapTop.visible = snapBottom.visible = snapped;
  if (snapped) {
    const k = smooth(ramp(t, T.reisst, T.reisst + 0.6));
    const sw = Math.sin((t - T.reisst) * 5) * 0.4 * (1 - 0.6 * k);
    _v.set(0.15, SHEAVE_Y, CAR_Z);
    _b.set(0.15 + 0.6 * Math.sin(sw + 0.3 * k), SHEAVE_Y - 1.0, CAR_Z + 0.35 * k);
    ropeSeg(snapTop, _v, _b);
    _v.set(0.15, c + CAR_H + 0.12, CAR_Z);
    _b.set(0.45 + 0.2 * k, c + CAR_H + 0.1 + 0.6 * (1 - k), CAR_Z + 0.3 * k);
    ropeSeg(snapBottom, _v, _b);
  }

  // safety gear: wedges bite into the rails at "krallen"
  const bite = ramp(t, T.krallen - 0.05, T.krallen + 0.15);
  wedges.forEach((w) => {
    w.position.x = w.userData.s * (0.725 + 0.07 * bite);
    w.material.emissiveIntensity = 1.4 * pop(t, T.krallen, T.tueren, 0.15);
  });
  railMat.emissiveIntensity = 0.7 * pop(t, T.schienen, T.tueren, 0.3);

  // sparks: rope snap (at sheave height) and safety gear (at the car)
  const snapAge = t - T.reisst;
  const gearAge = t - T.krallen;
  for (let i = 0; i < NS; i++) {
    const [dx, dy, dz, d] = sparkSeed[i];
    const useGear = i % 2 === 0;
    const age = useGear ? gearAge : snapAge;
    let size = 0;
    if (age > 0 && age < 0.9) {
      const k = age / 0.9;
      const side = dx < 0 ? -1 : 1;
      const ox = useGear ? side * 0.8 : 0.15;
      const oy = useGear ? c + 0.15 : SHEAVE_Y - 0.6;
      _v.set(ox + dx * 0.9 * k, oy + dy * 0.8 * k - 2.2 * k * k, CAR_Z + dz * 0.6 * k);
      size = 0.035 * (1 - k) * (0.6 + d);
    }
    _s.setScalar(Math.max(1e-4, size));
    _m.compose(_v, _q.identity(), _s);
    sparks.setMatrixAt(i, _m);
  }
  sparks.instanceMatrix.needsUpdate = true;

  // weight arrows
  animateArrows(carArrow, t, pop(t, T.schleppen - 0.1, T.reisst));
  animateArrows(cwArrow, t, pop(t, T.gegengewicht, T.reisst));

  // see-saw: car side heavy → weight drops on the other end → level
  const drop = smooth(ramp(t, T.wippe + 0.1, T.wippe + 0.7));
  ssWeight.position.y = 0.27 + (1 - drop) * 1.6;
  ssWeight.visible = drop > 0;
  plank.rotation.z = lerp(0.28, 0, smooth(ramp(t, T.wippe + 0.6, T.wippe + 1.0)));

  // doors open only when the car is there
  const open = easeInOut(ramp(t, T.da, T.da + 0.7));
  landingDoors.forEach(
    (d) => (d.position.x = d.userData.s * (DOOR_W / 4 + open * (DOOR_W / 2 - 0.02))),
  );
  carDoors.forEach((d) => (d.position.x = d.userData.s * (1.45 / 4 + open * (1.45 / 2 - 0.06))));
  const here = c < 0.15;
  lampMat.color.setHex(here ? 0x3dff7a : 0xff3b2f);
  lampMat.emissive.setHex(here ? 0x3dff7a : 0xff3b2f);
  carLight.intensity = 1.4 + 1.6 * open;

  // LED facts
  if (t >= T.schleppen && t < T.gewicht) {
    showPanel(pop(t, T.schleppen, T.gewicht), "MOTOR", "100%", LED.red);
  } else if (t >= T.gegengewicht && t < T.reisst) {
    showPanel(pop(t, T.gegengewicht, T.reisst), "MOTOR", "LEICHT", LED.green);
  } else if (t >= T.mehreren && t < T.schnell) {
    showPanel(pop(t, T.mehreren, T.schnell), "SEILE ÜBRIG", "3", LED.green);
  } else if (t >= T.schnell && t < T.krallen + 0.3) {
    showPanel(pop(t, T.schnell, T.krallen + 0.3), "ZU SCHNELL", "+15%", LED.red);
  } else {
    showPanel(0);
  }

  applyCamera(t);
  renderFrame();
}

start(renderAt);
