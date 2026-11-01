// #43 "Was passiert, wenn du die Nacht durchmachst?" — 4 a.m. on a Vienna
// roof terrace. You sit on the sofa, crack the next energy drink (frame 0),
// your eyelids slam shut and snap open. X-ray: the tiredness stuff
// (adenosine) piles up around the brain; the drink only holds the door
// shut (analogy set: a can braced against a door, the yellow crowd pushing).
// Morning: tears + steam from the ears, the emotion centre glows red
// (+60 %). The promille gauge swings to 0.5. Single neurons switch off one
// patch after another while the eyes stay wide open; whip down to a car on
// the street at night (the eyelids close: black). The brain takes its sleep
// anyway — Sekundenschlaf. Übrigens: 11 days, hallucinations swirl around
// the head. Drone pull-back over the terrace into the dawn.
import {
  THREE,
  ramp,
  smooth,
  outBack,
  pop,
  lerp,
  clamp01,
  V,
  rng,
  scene,
  flat,
  jitter,
  xrayMaterial,
  xrayEdges,
  setXray,
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
import "./set.js";
import { createHand } from "./hand.js";
import { meter, readout, gauge, counter } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS, DOOR, STREET } from "./beats.js";

highlights(HIGHLIGHTS);

// warm party light from the front (fairy lights + the open stairwell door)
{
  const fill = new THREE.DirectionalLight(0xffd2b0, 1.5);
  fill.position.set(4, 6, 9);
  scene.add(fill);
  const face = new THREE.PointLight(0xffc89a, 6, 7, 1.2);
  face.position.set(1.2, 4.6, 2.6);
  scene.add(face);
}

const mesh = (geo, mat, x, y, z, parent) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};
const UP = V(0, 1, 0);
// a unit-height cylinder stretched between two points
function between(m, a, b) {
  const d = b.clone().sub(a);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(UP, d.clone().normalize());
  m.scale.set(1, d.length(), 1);
}
// x-ray window: 0 → 1 → 0 over [a, b]
const win = (t, a, b, f = 0.3) => smooth(ramp(t, a, a + f)) * (1 - smooth(ramp(t, b - f, b)));

// ---------------------------------------------------------------- sofa
const SEAT = 0.96;
{
  const g = new THREE.Group();
  const velvet = flat(0x2a8f8a, { roughness: 0.85 });
  const velvetD = flat(0x217370, { roughness: 0.85 });
  mesh(
    jitter(new THREE.BoxGeometry(3.6, 0.55, 1.5, 4, 1, 2), 0.012, 2),
    velvetD,
    0,
    0.42,
    -0.05,
    g,
  );
  for (const x of [-0.82, 0.82])
    mesh(
      jitter(new THREE.BoxGeometry(1.6, 0.26, 1.3, 3, 1, 2), 0.015, 3),
      velvet,
      x,
      0.82,
      0.02,
      g,
    );
  mesh(
    jitter(new THREE.BoxGeometry(3.6, 1.25, 0.42, 4, 2, 1), 0.015, 4),
    velvet,
    0,
    1.25,
    -0.62,
    g,
  ).rotation.x = -0.12;
  for (const x of [-1.95, 1.95])
    mesh(
      jitter(new THREE.BoxGeometry(0.34, 0.95, 1.5, 1, 2, 2), 0.015, 5),
      velvetD,
      x,
      0.85,
      -0.05,
      g,
    );
  // a pink cushion
  const cush = mesh(
    jitter(new THREE.BoxGeometry(0.62, 0.55, 0.22, 2, 2, 1), 0.03, 6),
    flat(0xff6fae),
    -1.35,
    1.25,
    -0.32,
    g,
  );
  cush.rotation.set(-0.25, 0.25, 0.15);
  for (const x of [-1.6, 1.6])
    for (const z of [-0.6, 0.5])
      mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.18, 6), flat(0x3a2a20), x, 0.09, z, g);
  scene.add(g);
}

// ---------------------------------------------------------------- the person (you)
const SKIN = 0xf1c09a;
const HOODIE = 0xff8a2b;
const person = new THREE.Group();
scene.add(person);
const hoodMat = flat(HOODIE, { roughness: 0.75 });
const skinFlat = flat(SKIN, { roughness: 0.7 });
const skinX = xrayMaterial(SKIN, { flatShading: true, roughness: 0.7 });
const hairX = xrayMaterial(0x3a2418, { flatShading: true, roughness: 0.8 });
const pantsMat = flat(0x2f3448, { roughness: 0.75 });
const TORSO = { y0: SEAT - 0.1, y1: SEAT + 2.05 };
{
  const torso = mesh(
    jitter(new THREE.CylinderGeometry(0.72, 0.82, TORSO.y1 - TORSO.y0, 14, 3), 0.015, 3),
    hoodMat,
    0,
    (TORSO.y0 + TORSO.y1) / 2,
    0,
    person,
  );
  torso.scale.z = 0.62;
  const sh = mesh(
    jitter(new THREE.SphereGeometry(0.75, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0.015, 4),
    hoodMat,
    0,
    TORSO.y1 - 0.05,
    0,
    person,
  );
  sh.scale.set(1.05, 0.42, 0.62);
  mesh(
    new THREE.TorusGeometry(0.32, 0.1, 6, 14),
    hoodMat,
    0,
    TORSO.y1 + 0.22,
    -0.08,
    person,
  ).rotation.x = Math.PI / 2;
  // hoodie strings + a white print on the chest
  for (const sx of [-1, 1])
    mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.5, 5),
      flat(0xffffff),
      sx * 0.12,
      TORSO.y1 - 0.25,
      0.48,
      person,
    );
  const print = mesh(
    new THREE.CircleGeometry(0.22, 6),
    flat(0xfff3e0),
    0,
    TORSO.y1 - 0.85,
    0.515,
    person,
  );
  print.castShadow = false;
  mesh(new THREE.CylinderGeometry(0.2, 0.23, 0.5, 10), skinFlat, 0, TORSO.y1 + 0.3, 0, person);
  for (const sx of [-1, 1]) {
    const thigh = mesh(
      new THREE.CylinderGeometry(0.28, 0.31, 1.15, 10),
      pantsMat,
      sx * 0.38,
      SEAT + 0.2,
      0.5,
      person,
    );
    thigh.rotation.x = Math.PI / 2;
    mesh(
      new THREE.CylinderGeometry(0.22, 0.25, SEAT + 0.1, 10),
      pantsMat,
      sx * 0.38,
      (SEAT + 0.15) / 2,
      1.02,
      person,
    );
    mesh(new THREE.BoxGeometry(0.36, 0.22, 0.6), flat(0xf4f1ea), sx * 0.38, 0.11, 1.16, person);
  }
  // left arm (−x): resting on the thigh
  const arm = new THREE.Group();
  arm.position.set(-0.9, TORSO.y1 - 0.15, 0);
  arm.rotation.z = -0.12;
  person.add(arm);
  mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.95, 8), hoodMat, 0, -0.45, 0, arm);
  const fore = mesh(
    new THREE.CylinderGeometry(0.15, 0.13, 0.85, 8),
    hoodMat,
    0.05,
    -0.95,
    0.38,
    arm,
  );
  fore.rotation.x = Math.PI / 2 - 0.3;
  mesh(new THREE.SphereGeometry(0.15, 8, 6), skinFlat, 0.08, -1.05, 0.8, arm);
}
// right arm (+x): upper arm + forearm follow the hand that holds the can
const rUpper = mesh(new THREE.CylinderGeometry(0.17, 0.15, 1, 8), hoodMat, 0, 0, 0, person);
const rFore = mesh(new THREE.CylinderGeometry(0.15, 0.14, 1, 8), hoodMat, 0, 0, 0, person);
const R_SHOULDER = V(0.9, TORSO.y1 - 0.12, 0);

// head
const HEAD_Y = TORSO.y1 + 0.85;
const head = new THREE.Group();
head.position.set(0, HEAD_Y, 0.02);
person.add(head);
const skullGeo = jitter(new THREE.SphereGeometry(0.46, 14, 11), 0.012, 5);
{
  const skull = mesh(skullGeo, skinX, 0, 0, 0, head);
  skull.scale.set(0.9, 1.06, 0.95);
  const edges = xrayEdges(skullGeo);
  edges.scale.copy(skull.scale);
  head.add(edges);
  const jaw = mesh(
    jitter(new THREE.SphereGeometry(0.33, 10, 8), 0.01, 6),
    skinX,
    0,
    -0.22,
    0.06,
    head,
  );
  jaw.scale.set(0.95, 0.75, 0.95);
  const nose = mesh(new THREE.ConeGeometry(0.075, 0.2, 5), skinX, 0, -0.03, 0.46, head);
  nose.rotation.x = Math.PI / 2;
  for (const sx of [-1, 1]) {
    const ear = mesh(new THREE.SphereGeometry(0.1, 7, 6), skinX, sx * 0.41, 0, -0.02, head);
    ear.scale.set(0.5, 1, 0.8);
  }
  const cap = mesh(
    jitter(new THREE.SphereGeometry(0.49, 14, 9, 0, Math.PI * 2, 0, Math.PI * 0.42), 0.014, 7),
    hairX,
    0,
    0.07,
    -0.03,
    head,
  );
  cap.scale.set(0.95, 1.12, 1.02);
  cap.rotation.x = -0.3;
  const back = mesh(
    jitter(new THREE.SphereGeometry(0.43, 10, 8), 0.015, 8),
    hairX,
    0,
    -0.04,
    -0.14,
    head,
  );
  back.scale.set(0.97, 1.05, 0.8);
  // a messy fringe
  for (let i = 0; i < 5; i++) {
    const s = mesh(new THREE.ConeGeometry(0.07, 0.24, 4), hairX, -0.2 + i * 0.1, 0.32, 0.33, head);
    s.rotation.set(1.9, 0, (i - 2) * 0.25);
  }
}
// eyes: white, pupils, tired purple bags, lids that close
const eyes = [];
for (const sx of [-1, 1]) {
  const e = new THREE.Group();
  e.position.set(sx * 0.16, 0.05, 0.36);
  head.add(e);
  mesh(new THREE.SphereGeometry(0.085, 12, 9), flat(0xfbfbff, { roughness: 0.3 }), 0, 0, 0, e);
  const pupil = mesh(
    new THREE.SphereGeometry(0.04, 10, 8),
    flat(0x1c1420, { roughness: 0.2 }),
    0,
    0,
    0.065,
    e,
  );
  pupil.scale.z = 0.5;
  // red veins
  for (let k = 0; k < 3; k++) {
    const v = mesh(
      new THREE.BoxGeometry(0.035, 0.005, 0.004),
      flat(0xe8384a),
      sx * (0.045 + k * 0.004),
      -0.01 + k * 0.022,
      0.07,
      e,
    );
    v.rotation.z = (k - 1) * 0.6;
    v.castShadow = false;
  }
  const bag = mesh(
    new THREE.SphereGeometry(0.08, 10, 6),
    flat(0x9a6a9a, { roughness: 0.8 }),
    0,
    -0.085,
    -0.005,
    e,
  );
  bag.scale.set(1.15, 0.45, 0.7);
  const lid = new THREE.Group();
  e.add(lid);
  mesh(new THREE.SphereGeometry(0.094, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), skinX, 0, 0, 0, lid);
  eyes.push({ e, lid, pupil });
}
// mouth: a tired flat line that opens when crying
const mouth = mesh(new THREE.BoxGeometry(0.16, 0.025, 0.03), flat(0x7a2a30), 0, -0.25, 0.42, head);

// ---------------------------------------------------------------- the brain (x-ray only)
const brain = new THREE.Group();
brain.position.set(0, 0.1, -0.02);
head.add(brain);
const brainMat = flat(0xff8fb0, { emissive: 0xff4f86, emissiveIntensity: 0.28, roughness: 0.55 });
const brainGeo = jitter(new THREE.SphereGeometry(0.3, 16, 12), 0.022, 9);
for (const sx of [-1, 1]) {
  const h = mesh(brainGeo, brainMat, sx * 0.13, 0, 0, brain);
  h.scale.set(0.72, 0.82, 1.12);
}
mesh(
  jitter(new THREE.SphereGeometry(0.12, 10, 8), 0.012, 10),
  flat(0xe86f96, { roughness: 0.6 }),
  0,
  -0.2,
  -0.2,
  brain,
).scale.set(1.5, 0.8, 1);
// gyri: darker wavy ridges over the hemispheres
const gyrusMat = flat(0xd9507a, { roughness: 0.6 });
for (let i = 0; i < 12; i++) {
  const sx = i % 2 ? 1 : -1;
  const a = -1.1 + (Math.floor(i / 2) / 5) * 2.2;
  const ring = mesh(
    new THREE.TorusGeometry(0.255, 0.012, 4, 22, Math.PI * 0.95),
    gyrusMat,
    sx * 0.13,
    0,
    0,
    brain,
  );
  ring.scale.set(0.74, 0.84, 1.14);
  ring.rotation.set(0, Math.PI / 2, a);
  ring.castShadow = false;
}
// neurons: little lights all over the brain surface
const N_NEU = 120;
const neuR = rng(431);
const neuPos = [];
for (let i = 0; i < N_NEU; i++) {
  const sx = i % 2 ? 1 : -1;
  const u = neuR() * Math.PI * 2;
  const v = Math.acos(lerp(-0.75, 0.95, neuR()));
  const d = V(Math.sin(v) * Math.cos(u), Math.cos(v), Math.sin(v) * Math.sin(u));
  if (d.x * sx < -0.3) d.x *= -1;
  neuPos.push(V(sx * 0.13 + d.x * 0.3 * 0.74, d.y * 0.3 * 0.84, d.z * 0.3 * 1.14));
}
const neurons = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.034, 0),
  new THREE.MeshBasicMaterial({ color: 0xffffff }),
  N_NEU,
);
neurons.userData.noAO = true;
brain.add(neurons);
// patches that switch off ("local sleep"): 6 centres, each neuron belongs to the nearest
const centres = [
  V(0.25, 0.15, 0.2),
  V(-0.22, 0.2, 0.12),
  V(0.12, 0.05, -0.28),
  V(-0.18, -0.05, -0.2),
  V(0.05, 0.24, -0.02),
  V(-0.05, -0.1, 0.28),
];
const patchOf = neuPos.map((p) => {
  let best = 0;
  centres.forEach((c, i) => p.distanceTo(c) < p.distanceTo(centres[best]) && (best = i));
  return best;
});
const neuPh = neuPos.map(() => neuR() * 6.28);
const NEU_ON = new THREE.Color(0xfff4a8);
const NEU_OFF = new THREE.Color(0x3a2a44);
// the emotion centre: two red almonds deep in the temporal lobes + rings
const amyMat = flat(0xff2a3a, { emissive: 0xff1a2a, emissiveIntensity: 0.4 });
const amys = [-1, 1].map((sx) => {
  const a = mesh(new THREE.SphereGeometry(0.06, 10, 8), amyMat, sx * 0.29, -0.1, 0.1, brain);
  a.scale.set(0.8, 0.8, 1.3);
  return a;
});
const ringMat = new THREE.MeshBasicMaterial({
  color: 0xff3a4a,
  transparent: true,
  opacity: 0.8,
  depthWrite: false,
});
const amyRings = [0, 1, 2].map(() => {
  const r = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.012, 6, 28), ringMat.clone());
  r.position.set(0.29, -0.1, 0.1);
  r.rotation.y = Math.PI / 2;
  r.userData.noAO = true;
  brain.add(r);
  return r;
});
const amyLight = new THREE.PointLight(0xff2a3a, 0, 1.4, 1.5);
amyLight.position.set(0, -0.1, 0.1);
brain.add(amyLight);

// adenosine: yellow "tiredness" beads piling up between brain and skull
const N_AD = 110;
const adR = rng(77);
const adPos = [];
for (let i = 0; i < N_AD; i++) {
  const u = adR() * Math.PI * 2;
  const v = Math.acos(lerp(-0.7, 0.95, adR()));
  const rr = lerp(0.35, 0.41, adR());
  adPos.push(
    V(
      Math.sin(v) * Math.cos(u) * rr * 0.92,
      Math.cos(v) * rr * 1.04 + 0.08,
      Math.sin(v) * Math.sin(u) * rr * 0.98,
    ),
  );
}
const adMat = flat(0xffb52e, { emissive: 0xff9a10, emissiveIntensity: 0.9, roughness: 0.35 });
const aden = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.03, 1), adMat, N_AD);
aden.userData.noAO = true;
head.add(aden);

// ---------------------------------------------------------------- the can + the hand holding it
const hand = createHand({ sleeve: HOODIE, scale: 0.62 });
const canMat = flat(0x1fb8ff, { metalness: 0.55, roughness: 0.28 });
const can = new THREE.Group();
{
  const body = mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.62, 16), canMat, 0, 0, 0, can);
  body.castShadow = true;
  mesh(
    new THREE.CylinderGeometry(0.172, 0.172, 0.2, 16),
    flat(0x111522, { metalness: 0.4, roughness: 0.4 }),
    0,
    0.04,
    0,
    can,
  );
  // a lightning bolt logo
  const bolt = new THREE.Shape();
  bolt.moveTo(0.02, 0.1);
  bolt.lineTo(-0.05, -0.01);
  bolt.lineTo(0.0, -0.01);
  bolt.lineTo(-0.03, -0.1);
  bolt.lineTo(0.06, 0.02);
  bolt.lineTo(0.01, 0.02);
  bolt.lineTo(0.02, 0.1);
  const logo = new THREE.Mesh(
    new THREE.ShapeGeometry(bolt),
    flat(0x3dff7a, { emissive: 0x3dff7a, emissiveIntensity: 0.8 }),
  );
  logo.position.set(0, 0.04, 0.175);
  can.add(logo);
  mesh(
    new THREE.CylinderGeometry(0.15, 0.17, 0.04, 16),
    flat(0xc9ced8, { metalness: 0.8, roughness: 0.25 }),
    0,
    0.33,
    0,
    can,
  );
  mesh(
    new THREE.BoxGeometry(0.1, 0.012, 0.05),
    flat(0xdfe3ea, { metalness: 0.8, roughness: 0.2 }),
    0,
    0.355,
    0.04,
    can,
  );
}
// in hand-local space: palm down, fingers +z; after the roll the palm faces +x
can.rotation.z = Math.PI / 2;
can.position.set(0, -0.25, 0.3);
hand.group.add(can);
// spray from the opened can (frame 0)
const sprayMat = flat(0xeafff4, { emissive: 0xbfffe0, emissiveIntensity: 0.6, roughness: 0.2 });
const spray = Array.from({ length: 34 }, (_, i) => {
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.05 + (i % 3) * 0.015, 0), sprayMat);
  m.userData.noAO = true;
  m.userData.dir = V(Math.cos(i * 2.4) * 0.5, 1.6 + (i % 5) * 0.25, Math.sin(i * 2.4) * 0.5);
  scene.add(m);
  return m;
});

// ---------------------------------------------------------------- tears
const tearMat = flat(0x6fd0ff, { emissive: 0x3fb0ff, emissiveIntensity: 0.6, roughness: 0.1 });
const tears = Array.from({ length: 14 }, (_, i) => {
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), tearMat);
  m.scale.set(0.8, 1.3, 0.8);
  m.userData.noAO = true;
  head.add(m);
  return { m, side: i % 2 ? 1 : -1, ph: (i >> 1) / 7 };
});

// ---------------------------------------------------------------- door analogy set
const door = new THREE.Group();
door.position.set(...DOOR);
door.rotation.y = -0.75; // diagonal: the crowd side and the can side both in view
scene.add(door);
const doorLeaf = new THREE.Group(); // hinged at z = -0.36
{
  const brick = flat(0xc8735a, { roughness: 0.85 });
  const wallL = mesh(
    jitter(new THREE.BoxGeometry(0.22, 1.3, 0.62, 1, 3, 2), 0.01, 3),
    brick,
    0,
    0.65,
    -0.68,
    door,
  );
  const wallR = mesh(
    jitter(new THREE.BoxGeometry(0.22, 1.3, 0.62, 1, 3, 2), 0.01, 4),
    brick,
    0,
    0.65,
    0.68,
    door,
  );
  mesh(new THREE.BoxGeometry(0.24, 0.22, 2.0), brick, 0, 1.19, 0, door);
  void wallL;
  void wallR;
  doorLeaf.position.set(0, 0, -0.36);
  door.add(doorLeaf);
  mesh(
    new THREE.BoxGeometry(0.08, 1.06, 0.7),
    flat(0x6b4a8a, { roughness: 0.6 }),
    0,
    0.54,
    0.36,
    doorLeaf,
  );
  mesh(
    new THREE.SphereGeometry(0.045, 8, 6),
    flat(0xffd23f, { metalness: 0.7, roughness: 0.3 }),
    0.07,
    0.56,
    0.62,
    doorLeaf,
  );
  // a sign on the door
  mesh(new THREE.BoxGeometry(0.02, 0.18, 0.36), flat(0xfff3e0), 0.05, 0.86, 0.36, doorLeaf);
}
// the yellow crowd behind the door (−x): a heap that grows
const N_CROWD = 70;
const crR = rng(91);
const crowdPos = [];
for (let i = 0; i < N_CROWD; i++) {
  const lay = Math.floor(i / 14);
  crowdPos.push(
    V(
      -0.22 - crR() * (1.1 - lay * 0.16),
      0.12 + lay * 0.27 + crR() * 0.05,
      (crR() - 0.5) * (1.7 - lay * 0.22),
    ),
  );
}
const crowd = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.12, 1), adMat, N_CROWD);
crowd.userData.noAO = true;
door.add(crowd);
// the big can braced against the door (+x side)
const bigCan = new THREE.Group();
{
  const c = can.clone();
  c.rotation.set(0, 0, 0);
  c.position.set(0, 0, 0);
  c.scale.setScalar(2.4);
  bigCan.add(c);
}
door.add(bigCan);

// ---------------------------------------------------------------- the car on the street below
const car = new THREE.Group();
{
  const paint = flat(0xe2453c, { roughness: 0.35, metalness: 0.2 });
  mesh(jitter(new THREE.BoxGeometry(2.4, 0.55, 1.15, 3, 1, 2), 0.01, 5), paint, 0, 0.5, 0, car);
  const cab = mesh(
    new THREE.BoxGeometry(1.3, 0.45, 1.0),
    flat(0x9fc8ff, { roughness: 0.1, metalness: 0.3 }),
    -0.15,
    0.98,
    0,
    car,
  );
  cab.scale.x = 1;
  for (const sx of [-0.78, 0.78])
    for (const sz of [-0.56, 0.56]) {
      const w = mesh(
        new THREE.CylinderGeometry(0.24, 0.24, 0.18, 12),
        flat(0x1e1e24),
        sx,
        0.24,
        sz,
        car,
      );
      w.rotation.x = Math.PI / 2;
    }
  const hlMat = flat(0xfff6d8, { emissive: 0xfff0c0, emissiveIntensity: 2.2 });
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xfff1c8,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
  });
  for (const sz of [-0.38, 0.38]) {
    const hl = mesh(new THREE.SphereGeometry(0.09, 8, 6), hlMat, 1.2, 0.58, sz, car);
    hl.userData.noAO = true;
    const beam = new THREE.Mesh(new THREE.ConeGeometry(0.75, 4.2, 14, 1, true), beamMat);
    beam.rotation.z = Math.PI / 2;
    beam.position.set(3.3, 0.45, sz);
    beam.userData.noAO = true;
    car.add(beam);
  }
  for (const sz of [-0.42, 0.42])
    mesh(
      new THREE.BoxGeometry(0.04, 0.12, 0.2),
      flat(0xff2a2a, { emissive: 0xff1a1a, emissiveIntensity: 1.5 }),
      -1.21,
      0.62,
      sz,
      car,
    );
}
scene.add(car);

// ---------------------------------------------------------------- hallucinations
const halluCols = [0xff3f9a, 0x3dff7a, 0x2fb7ff, 0xffd23f, 0xb06bff, 0xff7a2b, 0x5ff0e0];
const hallus = halluCols.map((c, i) => {
  const g = new THREE.Group();
  mesh(
    jitter(new THREE.IcosahedronGeometry(0.17, 1), 0.02, i),
    flat(c, { emissive: c, emissiveIntensity: 0.5, roughness: 0.4 }),
    0,
    0,
    0,
    g,
  );
  mesh(new THREE.SphereGeometry(0.075, 10, 8), flat(0xffffff), 0, 0.03, 0.13, g);
  mesh(new THREE.SphereGeometry(0.035, 8, 6), flat(0x111111), 0, 0.03, 0.195, g);
  g.userData.noAO = true;
  scene.add(g);
  return g;
});

// ---------------------------------------------------------------- eyelid blackout (DOM)
const lidTop = document.createElement("div");
const lidBot = document.createElement("div");
for (const [el, top] of [
  [lidTop, true],
  [lidBot, false],
]) {
  el.style.cssText = `position:absolute;left:0;right:0;${top ? "top" : "bottom"}:0;height:0;background:#07060c;pointer-events:none;`;
  document.getElementById("root").insertBefore(el, document.getElementById("captions"));
}

// ---------------------------------------------------------------- timing helpers
// eyelid closedness 0 (wide open) … 1 (shut)
function lidAt(t) {
  let c = 0.42; // tired
  const blink = (at, d = 0.22) => {
    const k = clamp01(1 - Math.abs(t - at) / d);
    c = Math.max(c, smooth(k));
  };
  // hook: droop, slam shut on "durch", snap wide open
  if (t < T.durch) c = 0.5 + 0.18 * smooth(ramp(t, 0.2, T.durch));
  else if (t < T.durch + 0.45) c = 1;
  else if (t < T.hirn1 + 0.6) c = lerp(0.05, 0.4, ramp(t, T.durch + 0.45, T.hirn1 + 0.6));
  [3.2, 7.9, 12.3, 20.8, 24.6, 37.2, 41.5].forEach((b) => blink(b));
  if (t >= T.topfit - 0.2 && t < T.aber) c = 0.15; // "topfit"
  if (t >= T.augen - 0.45 && t < T.steuer - 0.15) c = 0.0; // eyes wide open
  if (t >= T.sekunden - 0.05 && t < T.sekunden + 0.85)
    c = 1; // Sekundenschlaf
  else if (t >= T.sekunden + 0.85 && t < T.sekunden + 1.3) c = 0.05;
  return c;
}
// the hand: wrist position over time (world), roll so the palm faces +x
const HAND_KEYS = [
  { t: -0.4, pos: [0.62, 2.7, 0.75], rot: [-0.55, 0, Math.PI / 2], pose: "grab" },
  { t: 0.3, pos: [0.55, 2.95, 0.72], rot: [-0.7, 0, Math.PI / 2], pose: "grab" },
  { t: T.hirn1, pos: [0.62, 2.55, 0.8], rot: [-0.35, 0, Math.PI / 2], pose: "grab" },
  { t: T.fuehlst - 0.1, pos: [0.62, 2.55, 0.8], rot: [-0.35, 0, Math.PI / 2], pose: "grab" },
  { t: T.topfit, pos: [0.85, 3.65, 0.6], rot: [-1.2, 0, Math.PI / 2], pose: "grab" }, // cheers!
  { t: T.aber, pos: [0.75, 3.4, 0.65], rot: [-1.0, 0, Math.PI / 2], pose: "grab" },
  { t: T.morgen, pos: [0.62, 2.4, 0.85], rot: [-0.2, 0, Math.PI / 2], pose: "grab" },
  { t: 60, pos: [0.62, 2.35, 0.85], rot: [-0.2, 0, Math.PI / 2], pose: "grab" },
];
const tmpA = V(0, 0, 0);
const tmpB = V(0, 0, 0);
const m4 = new THREE.Matrix4();
const q0 = new THREE.Quaternion();
const sV = V(1, 1, 1);
const col = new THREE.Color();

const applyCamera = shotCamera(shots);

// ---------------------------------------------------------------- render
function renderAt(t) {
  // --- sway (drunk-like) during the promille part
  const sway = win(t, T.nullfuenf - 0.3, T.denn - 0.1, 0.4);
  person.rotation.z = Math.sin(t * 2.3) * 0.05 * sway;
  person.rotation.x = Math.sin(t * 1.7) * 0.025 * sway;
  head.rotation.z = Math.sin(t * 1.9 + 1) * 0.06 * sway;
  // head nods forward a little when tired, jerks up after the slam
  head.rotation.x = 0.12 * lidAt(t) - 0.1 * pop(t, T.durch + 0.45, T.durch + 0.8, 0.1);
  if (t >= T.sekunden - 0.05 && t < T.sekunden + 0.85) head.rotation.x = 0.28; // nods off

  // --- eyes
  const c = lidAt(t);
  for (const { lid, pupil } of eyes) {
    lid.rotation.x = lerp(-0.75, 1.5, c);
    const wide = t >= T.augen - 0.45 && t < T.steuer - 0.15 ? 0.7 : 1;
    pupil.scale.set(wide, wide, 0.5);
  }

  // --- face colour: red when irritated
  const angry = win(t, T.gereizt - 0.1, T.gefuehl, 0.4);
  skinX.color.setHex(SKIN).lerp(col.setHex(0xff6a5a), 0.55 * angry);
  mouth.scale.set(1, 1 + 3 * win(t, T.heulst - 0.05, T.gefuehl - 0.3, 0.15), 1);

  // --- hand + can + right arm
  hand.track(t, HAND_KEYS);
  hand.group.updateMatrixWorld();
  const wrist = hand.group.localToWorld(tmpA.set(0, 0, -0.55));
  person.worldToLocal(wrist);
  const elbow = R_SHOULDER.clone()
    .lerp(wrist, 0.5)
    .add(V(0.28, -0.35, -0.05));
  between(rUpper, R_SHOULDER, elbow);
  between(rFore, elbow, wrist);
  // spray burst from the opened can (0 → 0.9 s)
  hand.group.localToWorld(tmpB.set(0.3, -0.25, 0.3)); // can top (local +x = can axis)
  const sk = ramp(t, -0.02, 0.9);
  spray.forEach((m, i) => {
    const k = clamp01(sk * 1.25 - (i % 6) * 0.04);
    m.visible = t >= 0 && t < 0.95 && k > 0 && k < 1;
    const d = m.userData.dir;
    m.position.set(
      tmpB.x + d.x * k * 1.1,
      tmpB.y + d.y * k * 0.9 - k * k * 0.9,
      tmpB.z + d.z * k * 1.1,
    );
    m.scale.setScalar(1 - k * 0.6);
  });
  puff("can", t, 0.0, tmpB.x, tmpB.y + 0.08, tmpB.z, 0.8, 0xeafff4);

  // --- x-ray of the head
  const xk = Math.max(
    win(t, T.aber + 0.25, T.drink - 0.12),
    win(t, T.gefuehl - 0.18, T.rate - 0.1),
    win(t, T.denn - 0.1, T.augen - 0.45, 0.25),
    win(t, T.hirn3 - 0.12, T.fakt - 0.1),
  );
  setXray([skinX, hairX], xk);
  brain.visible = xk > 0.02;
  aden.visible = xk > 0.02 && t < T.denn - 0.1; // later the neurons need the stage

  // neurons: twinkle; patches switch off while "knipsen"; all dim for the Sekundenschlaf
  for (let i = 0; i < N_NEU; i++) {
    let on = 0.75 + 0.25 * Math.sin(t * 6 + neuPh[i]);
    // tiredness: slightly dimmer the more adenosine there is
    on *= 1 - 0.25 * ramp(t, T.stoff, T.drink);
    if (t >= T.knipsen - 0.1 && t < T.hirn3) {
      const p = patchOf[i];
      const a = T.knipsen + p * 0.38;
      const off = win(t, a, a + 1.5, 0.12) + win(t, a + 2.6, a + 3.6, 0.12);
      on *= 1 - 0.92 * clamp01(off);
    }
    if (t >= T.hirn3) {
      const wave = clamp01((t - T.hirn3) / (T.sekunden - T.hirn3) - (neuPos[i].z + 0.35) * 0.6);
      on *= 1 - 0.85 * wave * (1 - ramp(t, T.sekunden + 0.85, T.sekunden + 1.4));
    }
    m4.compose(neuPos[i], q0, sV.setScalar(0.6 + 0.6 * on));
    neurons.setMatrixAt(i, m4);
    neurons.setColorAt(i, col.copy(NEU_OFF).lerp(NEU_ON, on));
  }
  neurons.instanceMatrix.needsUpdate = true;
  neurons.instanceColor.needsUpdate = true;
  brainMat.emissiveIntensity =
    0.28 *
    (t >= T.hirn3
      ? 1 - 0.7 * ramp(t, T.hirn3, T.sekunden) * (1 - ramp(t, T.sekunden + 0.85, T.sekunden + 1.4))
      : 1);

  // adenosine beads pop in one after another, then stay (wobbling)
  for (let i = 0; i < N_AD; i++) {
    const at = T.stoff - 0.25 + (i / N_AD) * (T.drink - T.stoff + 0.1);
    const s = t < at ? 0.001 : Math.min(1.25, outBack(clamp01((t - at) / 0.25)));
    const p = adPos[i];
    tmpA.set(p.x + Math.sin(t * 2 + i) * 0.006, p.y + Math.cos(t * 1.7 + i * 2) * 0.006, p.z);
    m4.compose(tmpA, q0, sV.setScalar(s));
    aden.setMatrixAt(i, m4);
  }
  aden.instanceMatrix.needsUpdate = true;

  // emotion centre: glows + pulses + rings
  const emo = win(t, T.gefuehl, T.rate - 0.1, 0.25);
  const beat = Math.pow(Math.max(0, Math.sin(t * Math.PI * 2 * 1.6)), 4);
  amys.forEach((a) => a.scale.set(0.8, 0.8, 1.3).multiplyScalar(1 + emo * (0.7 + 0.5 * beat)));
  amyMat.emissiveIntensity = 0.4 + emo * (1.6 + 1.6 * beat);
  amyLight.intensity = emo * (2 + 2 * beat);
  amyRings.forEach((r, i) => {
    const k = (t * 0.9 + i / 3) % 1;
    r.visible = emo > 0.05;
    r.scale.setScalar(0.6 + k * 2.6);
    r.material.opacity = 0.8 * (1 - k) * emo;
  });

  // tears roll down from the eyes, steam from the ears
  const cry = win(t, T.heulst - 0.1, T.gefuehl - 0.2, 0.15);
  for (const { m, side, ph } of tears) {
    const k = (t * 1.4 + ph) % 1;
    m.visible = cry > 0.05;
    m.position.set(side * (0.2 + k * 0.04), 0.0 - k * 0.42, 0.37 - k * 0.04);
    m.scale.set(0.8, 1.3, 0.8).multiplyScalar(cry * (1 - k * 0.4));
  }
  head.updateMatrixWorld();
  for (const [sx, k] of [
    [-1, 0],
    [1, 0.12],
    [-1, 0.32],
    [1, 0.45],
  ]) {
    const ear = head.localToWorld(V(sx * 0.48, 0.02, -0.02));
    puff(
      `steam${sx}${k}`,
      t,
      T.rastest + k,
      ear.x + sx * 0.08,
      ear.y + 0.05,
      ear.z,
      0.55,
      0xffffff,
    );
  }

  // --- door analogy set
  const dvis = t >= T.drink - 0.25 && t < T.morgen - 0.12;
  door.visible = dvis;
  if (dvis) {
    door.scale.copy(squash(t, T.drink));
    // door ajar until the can slams it, then rattles
    const shut = smooth(ramp(t, T.tuer - 0.18, T.tuer));
    const rattle =
      t > T.tuer ? Math.abs(Math.sin(t * 23)) * 0.05 * (0.5 + 0.5 * Math.sin(t * 3)) : 0;
    doorLeaf.rotation.y = -0.75 * (1 - shut) - rattle;
    // the can slides in and braces against the door
    const slide = smooth(ramp(t, T.haelt - 0.1, T.tuer));
    bigCan.position.set(lerp(1.35, 0.62, slide), 0.36, lerp(0.5, 0.05, slide));
    bigCan.rotation.set(0, 0, lerp(-0.2, 0.62, slide));
    // the crowd grows behind the door and pushes
    for (let i = 0; i < N_CROWD; i++) {
      const at = T.drink + (i / N_CROWD) * (T.morgen - T.drink - 0.3);
      const s = t < at ? 0.001 : Math.min(1.2, outBack(clamp01((t - at) / 0.22)));
      const p = crowdPos[i];
      const push = t > T.tuer ? 0.03 * Math.sin(t * 9 + i) : 0;
      tmpA.set(p.x + push + (t < T.tuer ? 0.25 * (1 - shut) : 0), p.y, p.z);
      m4.compose(tmpA, q0, sV.setScalar(s));
      crowd.setMatrixAt(i, m4);
    }
    crowd.instanceMatrix.needsUpdate = true;
  }

  // --- the car on the street below drifts towards the kerb
  const cvis = t >= T.steuer - 0.3 && t < T.hirn3;
  car.visible = cvis;
  if (cvis) {
    const k = ramp(t, T.steuer - 0.3, T.hirn3);
    const drift = smooth(ramp(t, T.steuer + 0.2, T.hirn3));
    car.position.set(STREET[0] - 5 + k * 6.5, STREET[1] + 0.04, STREET[2] + drift * 2.2);
    car.rotation.y = -0.32 * smooth(ramp(t, T.steuer + 0.1, T.steuer + 0.9));
  }

  // --- hallucinations swirl around the head
  const hv = win(t, T.hallu - 0.1, T.cta + 0.5, 0.3);
  hallus.forEach((g, i) => {
    g.visible = hv > 0.02;
    const a = t * 1.3 + (i / hallus.length) * Math.PI * 2;
    const rr = 1.0 + 0.15 * Math.sin(t * 2 + i);
    g.position.set(
      Math.cos(a) * rr,
      3.95 + Math.sin(t * 2.4 + i * 1.7) * 0.3,
      0.02 + Math.sin(a) * rr,
    );
    g.scale.setScalar(Math.max(0.001, hv * (1 + 0.15 * Math.sin(t * 5 + i))));
    g.lookAt(0, 3.95, 0.02);
    g.rotateY(Math.PI);
  });

  // --- eyelid blackout: the car (eyes close), the Sekundenschlaf
  const bk = Math.max(
    win(t, T.toedlich - 0.05, T.toedlich + 0.55, 0.12),
    win(t, T.sekunden + 0.05, T.sekunden + 0.75, 0.14),
  );
  lidTop.style.height = `${bk * 51}%`;
  lidBot.style.height = `${bk * 51}%`;

  // --- device displays + LED
  meter("akku", pop(t, 0.0, T.vier - 0.1, 0.2), {
    label: "Hirn-Akku",
    value: lerp(0.14, 0.04, ramp(t, 0, T.vier)),
    x: 60,
    y: 1150,
    width: 520,
    color: Math.sin(t * 14) > 0 ? "#ff4b2b" : "#ffb02e",
    text: `${Math.round(lerp(14, 4, ramp(t, 0, T.vier)))} %`,
  });
  const clockK = Math.max(pop(t, T.vier, T.aber, 0.2), pop(t, T.morgen, T.gefuehl - 0.2, 0.2));
  const hh = t < T.morgen ? 4 : Math.round(lerp(4, 8, ramp(t, T.morgen, T.morgen + 0.6)));
  const mm =
    t < T.morgen
      ? Math.floor(lerp(0, 9, ramp(t, T.vier, T.aber)))
      : Math.floor(lerp(9, 7, ramp(t, T.morgen, T.morgen + 0.6)));
  readout("uhr", clockK, {
    label: "Uhrzeit",
    value: `0${hh}:${String(mm).padStart(2, "0")}`,
    unit: "",
    x: 60,
    y: 1150,
  });
  const wachK = pop(t, T.stunden - 0.1, T.denn - 0.1, 0.2);
  readout("wach", wachK, {
    label: "Wach",
    value: Math.round(lerp(0, 17, ramp(t, T.stunden - 0.1, T.stunden + 0.5))),
    unit: "h",
    x: 60,
    y: 1150,
  });
  const pm =
    t < T.nullfuenf - 0.15
      ? 0
      : 0.5 * outBack(clamp01((t - T.nullfuenf + 0.15) / 0.5)) +
        0.25 * smooth(ramp(t, T.vier2, T.vier2 + 1.0));
  gauge("pm", pop(t, T.rate, T.denn - 0.1, 0.25), {
    label: "Promille",
    value: pm,
    max: 1,
    unit: "‰",
    x: 600,
    y: 1130,
    color: "#ff4b2b",
    digits: 1,
  });
  counter("tage", pop(t, T.fakt, T.cta - 0.05, 0.25), {
    label: "Tage wach · Rekord",
    value: Math.round(lerp(0, 11, ramp(t, T.elf - 0.7, T.elf + 0.15))),
    x: 60,
    y: 1150,
  });
  if (t >= T.sechzig - 0.1 && t < T.rate - 0.1)
    showPanel(pop(t, T.sechzig - 0.1, T.rate - 0.1), "GEFÜHLE", "+60 %", LED.red);
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
