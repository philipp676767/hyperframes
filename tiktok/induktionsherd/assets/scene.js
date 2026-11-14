// #82 Induktionsherd — the hob stays cool, the pot heats itself.
// Story: a rolling boil with the viewer's hand flat on the glass beside it
// → kitchen paper under the pot does not burn → the glass turns to x-ray:
// no heating wire, a copper coil → current flips back and forth (20,000×/s)
// → a magnetic field springs up and down, passes the glass like air → is
// caught in the iron pot bottom → tiny current swirls rub it warm (hands
// rubbing in winter) → payoff: the pot heats itself, the glass stays cool
// → Übrigens: the hob whines, the dog's ears go up → a magnet clacks on.
import {
  THREE,
  ramp,
  smooth,
  outBack,
  pop,
  clamp01,
  lerp,
  V,
  rng,
  scene,
  real,
  roundedBox,
  xrayMaterial,
  xrayEdges,
  setXray,
  showNope,
  labels,
  squash,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { HOB, POT, tex } from "./set.js";
import { createHand } from "./hand.js";
import { readout, counter } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS, RUB, DOG } from "./beats.js";

highlights(HIGHLIGHTS);
const add = (geo, mat, x, y, z, parent = scene, shadow = true) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};
const glowMat = (color, opacity = 1) =>
  new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });

// ---------------------------------------------------------------- the hob glass (x-ray capable)
const glassMat = xrayMaterial(0x0d0e11, { roughness: 0.08, metalness: 0.2 });
const glassGeo = roundedBox(HOB.w, 0.05, HOB.d, 0.02);
const glass = add(glassGeo, glassMat, HOB.x, -0.005, HOB.z, scene, false);
glass.userData.noAO = true;
const glassEdges = xrayEdges(glassGeo);
glassEdges.position.copy(glass.position);
scene.add(glassEdges);
// printed zone rings + touch slider (white, like the real thing)
const printMat = new THREE.MeshBasicMaterial({ color: 0xb8bcc4, transparent: true, opacity: 0.55 });
const ZONES = [
  [POT.x, POT.z, 0.56],
  [HOB.x + 0.75, POT.z, 0.42],
  [POT.x, HOB.z - 0.75, 0.42],
  [HOB.x + 0.75, HOB.z - 0.75, 0.5],
];
for (const [x, z, r] of ZONES) {
  const ring = add(
    new THREE.RingGeometry(r - 0.012, r, 64).rotateX(-Math.PI / 2),
    printMat,
    x,
    0.022,
    z,
    scene,
    false,
  );
  ring.userData.noAO = true;
}
for (let i = 0; i < 9; i++)
  add(
    new THREE.CircleGeometry(0.025, 12).rotateX(-Math.PI / 2),
    printMat,
    HOB.x - 0.7 + i * 0.12,
    0.022,
    HOB.z + HOB.d / 2 - 0.14,
    scene,
    false,
  );

// ---------------------------------------------------------------- under the glass: ferrite plate + the copper coil
const coilY = -0.07;
add(
  new THREE.CylinderGeometry(0.5, 0.5, 0.03, 48),
  real.plastic(0x2a2a2e, { roughness: 0.8 }),
  POT.x,
  coilY - 0.04,
  POT.z,
  scene,
  false,
);
const TURNS = 11;
const spiral = [];
for (let k = 0; k <= 600; k++) {
  const f = k / 600;
  const a = f * Math.PI * 2 * TURNS;
  const r = 0.07 + f * 0.4;
  spiral.push(V(POT.x + Math.cos(a) * r, coilY, POT.z + Math.sin(a) * r));
}
const spiralCurve = new THREE.CatmullRomCurve3(spiral);
const COIL_SEG = 900;
const copper = real.metal(0xd9824a, { roughness: 0.28, emissive: 0x000000 });
const coilGeo = new THREE.TubeGeometry(spiralCurve, COIL_SEG, 0.016, 6);
const coil = add(coilGeo, copper, 0, 0, 0, scene, false);
// current: bright beads running along the coil, back and forth
const N_BEAD = 70;
const beadMat = glowMat(0x7fe6ff, 0.95);
const beads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.014, 8, 6), beadMat, N_BEAD);
beads.frustumCulled = false;
beads.userData.noAO = true;
scene.add(beads);
const m4 = new THREE.Matrix4();
const q0 = new THREE.Quaternion();
// the ghost heating wire of an old hob (shown, then rejected)
const ghostPts = [];
for (let k = 0; k <= 400; k++) {
  const f = k / 400;
  const a = f * Math.PI * 2 * 5;
  const r = 0.1 + f * 0.35;
  ghostPts.push(
    V(POT.x + Math.cos(a) * r, coilY + 0.01 + Math.sin(a * 6) * 0.012, POT.z + Math.sin(a) * r),
  );
}
const ghostMat = glowMat(0xff4a1c, 0.9);
const ghost = add(
  new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ghostPts), 600, 0.02, 6),
  ghostMat,
  0,
  0,
  0,
  scene,
  false,
);

// ---------------------------------------------------------------- the pot (stainless steel)
const pot = new THREE.Group();
pot.position.set(POT.x, 0.025, POT.z);
scene.add(pot);
const prof = [
  [0.0, 0.0],
  [POT.r - 0.04, 0.0],
  [POT.r, 0.03],
  [POT.r, POT.h - 0.02],
  [POT.r + 0.02, POT.h],
  [POT.r - 0.01, POT.h + 0.005],
  [POT.r - 0.02, POT.h - 0.03],
  [POT.r - 0.02, 0.07],
  [0.0, 0.07],
].map(([x, y]) => new THREE.Vector2(x, y));
const potGeo = new THREE.LatheGeometry(prof, 64);
const steel = real.metal(0xeef1f5, {
  roughness: 0.26,
  metalness: 0.72,
  clearcoat: 0.6,
  clearcoatRoughness: 0.15,
  envMapIntensity: 2.2,
});
const potSolid = add(potGeo, steel, 0, 0, 0, pot);
const potXrayMat = xrayMaterial(0xc9ced6);
const potXray = add(potGeo, potXrayMat, 0, 0, 0, pot, false);
potXray.visible = false;
// thick iron base (darker, slightly brushed) — glows when it heats itself
const baseMat = real.metal(0x8f949b, { roughness: 0.4, emissive: 0xff4a10, emissiveIntensity: 0 });
add(new THREE.CylinderGeometry(POT.r - 0.05, POT.r - 0.05, 0.05, 64), baseMat, 0, 0.026, 0, pot);
// red-hot band on the outside of the base (visible from the side when it heats itself)
const bandMat = glowMat(0xff5a1a, 0);
add(
  new THREE.CylinderGeometry(POT.r + 0.006, POT.r + 0.006, 0.14, 64, 1, true),
  bandMat,
  0,
  0.07,
  0,
  pot,
  false,
);
const bandMat2 = glowMat(0xffb040, 0);
add(
  new THREE.CylinderGeometry(POT.r + 0.008, POT.r + 0.008, 0.05, 64, 1, true),
  bandMat2,
  0,
  0.025,
  0,
  pot,
  false,
);
// handles
const handleMat = real.metal(0xc9cdd3, { roughness: 0.22 });
for (const s of [-1, 1]) {
  const h = add(
    new THREE.TorusGeometry(0.11, 0.025, 10, 24, Math.PI),
    handleMat,
    s * (POT.r + 0.02),
    POT.h - 0.12,
    0,
    pot,
  );
  h.rotation.set(Math.PI / 2, 0, s > 0 ? -Math.PI / 2 : Math.PI / 2);
}
// water: a rippling disc + bubbles
const WATER_Y = POT.h - 0.14;
const waterGeo = new THREE.CircleGeometry(POT.r - 0.025, 48, 0, Math.PI * 2);
waterGeo.rotateX(-Math.PI / 2);
const waterBase = Float32Array.from(waterGeo.attributes.position.array);
add(
  waterGeo,
  real.glass(0x6fb2d2, { opacity: 0.62, roughness: 0.05, envMapIntensity: 2.4, depthWrite: true }),
  0,
  WATER_Y,
  0,
  pot,
  false,
);
const N_BUB = 46;
const bubR = rng(8);
const bubSeeds = Array.from({ length: N_BUB }, () => [bubR(), bubR(), bubR(), bubR()]);
const bubbles = new THREE.InstancedMesh(
  new THREE.SphereGeometry(1, 10, 8),
  new THREE.MeshStandardMaterial({
    color: 0xf4fbff,
    roughness: 0.1,
    transparent: true,
    opacity: 0.7,
    emissive: 0x9fb8c8,
    emissiveIntensity: 0.5,
  }),
  N_BUB,
);
bubbles.frustumCulled = false;
pot.add(bubbles);
// steam: soft puffs rising from the pot
const N_STEAM = 30;
const steamMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.16,
  depthWrite: false,
});
const steam = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 2), steamMat, N_STEAM);
steam.frustumCulled = false;
steam.userData.noAO = true;
pot.add(steam);
const stR = rng(21);
const steamSeeds = Array.from({ length: N_STEAM }, () => [stR(), stR(), stR()]);

// ---------------------------------------------------------------- magnetic field loops (two shapes: free, caught by the iron)
const FIELD_N = 8;
const loop = (pts) =>
  new THREE.CatmullRomCurve3(
    pts.map(([r, y]) => V(r, y, 0)),
    true,
  );
const freeShape = [
  [0.05, -0.2],
  [0.05, 0.12],
  [0.22, 0.38],
  [0.5, 0.36],
  [0.68, 0.08],
  [0.66, -0.16],
  [0.45, -0.3],
  [0.15, -0.27],
];
const caughtShape = [
  [0.05, -0.2],
  [0.05, 0.03],
  [0.15, 0.055],
  [0.4, 0.06],
  [0.5, 0.04],
  [0.56, -0.12],
  [0.42, -0.28],
  [0.15, -0.27],
];
const fieldMat = glowMat(0x58b8ff, 0.8);
const caughtMat = glowMat(0x58b8ff, 0.8);
const fieldFree = new THREE.Group();
const fieldCaught = new THREE.Group();
fieldFree.position.set(POT.x, 0, POT.z);
fieldCaught.position.set(POT.x, 0, POT.z);
scene.add(fieldFree, fieldCaught);
const freeCurve = loop(freeShape);
const caughtCurve = loop(caughtShape);
for (let i = 0; i < FIELD_N; i++) {
  const a = (i / FIELD_N) * Math.PI * 2;
  const f = new THREE.Mesh(new THREE.TubeGeometry(freeCurve, 80, 0.02, 6, true), fieldMat);
  f.rotation.y = a;
  f.userData.noAO = true;
  fieldFree.add(f);
  const c = new THREE.Mesh(new THREE.TubeGeometry(caughtCurve, 80, 0.02, 6, true), caughtMat);
  c.rotation.y = a;
  c.userData.noAO = true;
  fieldCaught.add(c);
}
// field "dashes" running around the loops (direction flips)
const N_DASH = FIELD_N * 6;
const dashMat = glowMat(0xbfe6ff, 1);
const dashes = new THREE.InstancedMesh(new THREE.SphereGeometry(0.02, 8, 6), dashMat, N_DASH);
dashes.frustumCulled = false;
dashes.userData.noAO = true;
scene.add(dashes);

// ---------------------------------------------------------------- eddy currents in the iron bottom
const eddyMat = glowMat(0xffa23a, 0.9);
const eddies = new THREE.Group();
eddies.position.set(0, 0.058, 0);
pot.add(eddies);
const EDDY = [];
{
  const r = rng(31);
  for (let i = 0; i < 9; i++) {
    const rad = i === 0 ? 0 : 0.18 + (i % 2) * 0.14;
    const a = i * 0.9 + r();
    const rr = 0.07 + r() * 0.04;
    const ring = add(
      new THREE.TorusGeometry(rr, 0.008, 6, 32).rotateX(Math.PI / 2),
      eddyMat,
      Math.cos(a) * rad,
      0,
      Math.sin(a) * rad,
      eddies,
      false,
    );
    const dot = add(
      new THREE.SphereGeometry(0.018, 8, 6),
      glowMat(0xfff0b0, 1),
      0,
      0,
      0,
      ring,
      false,
    );
    EDDY.push({ ring, dot, rr, ph: r() * 6, dir: i % 2 ? 1 : -1 });
  }
}

// ---------------------------------------------------------------- kitchen paper sheet
const paperTex = tex(512, 512, (g, w, h) => {
  g.fillStyle = "#fbfaf6";
  g.fillRect(0, 0, w, h);
  g.strokeStyle = "rgba(170,165,150,0.35)";
  g.lineWidth = 3;
  for (let i = 0; i < 9; i++)
    for (let j = 0; j < 9; j++) {
      g.beginPath();
      g.arc(28 + i * 57, 28 + j * 57, 16, 0, Math.PI * 2);
      g.stroke();
    }
  g.fillStyle = "rgba(150,145,130,0.4)";
  for (let i = 0; i < 40; i++) g.fillRect(i * 13, h - 6, 6, 3); // perforation
});
const paper = add(
  new THREE.PlaneGeometry(1.35, 1.35, 8, 8).rotateX(-Math.PI / 2),
  real.fabric(0xffffff, { map: paperTex, side: THREE.DoubleSide }),
  POT.x,
  0.026,
  POT.z,
  scene,
  false,
);
paper.rotation.y = 0.18;

// ---------------------------------------------------------------- the viewer's hand (+ a left hand for the rubbing set)
const hand = createHand({ scale: 1.0, skin: 0xe9b48f, sleeve: 0x3b3f8f });
const rubR = createHand({ scale: 1.0, skin: 0xe9b48f, sleeve: 0xb5452f });
const rubL = createHand({ scale: 1.0, skin: 0xe9b48f, sleeve: 0xb5452f, left: true });
const rubGlow = add(
  new THREE.SphereGeometry(0.28, 16, 12),
  glowMat(0xff8a2a, 0.5),
  RUB[0],
  RUB[1],
  RUB[2],
  scene,
  false,
);
const rubLight = new THREE.PointLight(0xff9a40, 0, 4, 1.5);
rubLight.position.set(...RUB);
scene.add(rubLight);
// a woolly mitten scarf of cold air: tiny frost flakes drifting around the hands
const N_FLAKE = 26;
const flakes = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.02, 0),
  glowMat(0xdff2ff, 0.8),
  N_FLAKE,
);
flakes.frustumCulled = false;
scene.add(flakes);

// ---------------------------------------------------------------- whine rings (Übrigens) + the dog
const ringMat = glowMat(0x9ff0ff, 0.6);
const whine = [];
for (let i = 0; i < 4; i++) {
  const r = add(
    new THREE.TorusGeometry(1, 0.01, 6, 64).rotateX(Math.PI / 2),
    ringMat.clone(),
    POT.x,
    0.4,
    POT.z,
    scene,
    false,
  );
  whine.push(r);
}
const dog = new THREE.Group();
const fur = real.fabric(0xb07a45);
const furLight = real.fabric(0xe8c79a);
const black = real.gloss(0x111111);
const head = add(new THREE.SphereGeometry(0.42, 32, 24).scale(1, 0.92, 1.0), fur, 0, 0.75, 0, dog);
add(new THREE.SphereGeometry(0.24, 24, 16).scale(0.9, 0.75, 1.7), furLight, 0, 0.6, 0.42, dog);
add(new THREE.SphereGeometry(0.075, 16, 12).scale(1.2, 0.85, 1), black, 0, 0.68, 0.82, dog);
for (const s of [-1, 1]) {
  add(new THREE.SphereGeometry(0.06, 16, 12), black, s * 0.17, 0.86, 0.33, dog);
  add(
    new THREE.SphereGeometry(0.018, 8, 6),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
    s * 0.17 + 0.02,
    0.89,
    0.385,
    dog,
    false,
  );
}
add(new THREE.CylinderGeometry(0.3, 0.36, 0.7, 24), fur, 0, 0.2, -0.12, dog); // neck
const ears = [];
for (const s of [-1, 1]) {
  const pivot = new THREE.Group();
  pivot.position.set(s * 0.36, 0.98, -0.02);
  dog.add(pivot);
  const ear = add(
    new THREE.SphereGeometry(0.2, 16, 12).scale(0.6, 1.8, 0.25),
    real.fabric(0x7a4f2a),
    0,
    -0.3,
    0,
    pivot,
  );
  ears.push({ pivot, s, ear });
}
dog.position.set(...DOG);
dog.rotation.y = 0.55;
scene.add(dog);

// ---------------------------------------------------------------- fridge magnet for the CTA
const magnet = new THREE.Group();
add(
  new THREE.CylinderGeometry(0.13, 0.13, 0.06, 32).rotateX(Math.PI / 2),
  real.gloss(0xe0262f),
  0,
  0,
  0,
  magnet,
);
add(
  new THREE.CylinderGeometry(0.09, 0.09, 0.02, 32).rotateX(Math.PI / 2),
  real.plastic(0xffffff),
  0,
  0,
  0.035,
  magnet,
);
scene.add(magnet);

const applyCamera = shotCamera(
  shots.map((s) => (Array.isArray(s.rel) ? { ...s, rel: V(...s.rel) } : s)),
);

// ---------------------------------------------------------------- helpers
const flipSign = (t, hz) => (Math.sin(t * hz * Math.PI * 2) >= 0 ? 1 : -1);
// back-and-forth position along a path: the "current" swings with frequency hz
const swing = (t, hz, amp) => Math.sin(t * hz * Math.PI * 2) * amp;
// frequency of the shown flipping: slow when first named, fast after "20.000"
const flipHz = (t) => lerp(1.4, 9, smooth(ramp(t, T.ueber, T.sekunde + 0.3)));

// ---------------------------------------------------------------- render
function renderAt(t) {
  // ---- the viewer's hand: flat on the glass at the start, back again on "Darum"
  hand.track(t, [
    { t: -0.5, pos: [1.6, 0.11, 0.45], rot: [0, -Math.PI / 2 - 0.15, 0], pose: "open" },
    { t: T.papier - 0.25, pos: [1.55, 0.11, 0.45], rot: [0, -Math.PI / 2 - 0.15, 0], pose: "open" },
    {
      t: T.papier + 0.2,
      pos: [2.6, 0.7, 1.2],
      rot: [0.2, -Math.PI / 2 - 0.15, 0],
      pose: "open",
      out: true,
    },
    { t: T.darum - 0.35, pos: [2.5, 0.6, 1.1], rot: [0.2, -Math.PI / 2 - 0.15, 0], pose: "open" },
    { t: T.darum + 0.1, pos: [1.55, 0.11, 0.45], rot: [0, -Math.PI / 2 - 0.15, 0], pose: "open" },
    {
      t: T.fakt,
      pos: [1.55, 0.11, 0.45],
      rot: [0, -Math.PI / 2 - 0.15, 0],
      pose: "open",
      out: true,
    },
  ]);

  // ---- boiling: strong except while the field is explained calmly; full again on the payoff
  const boil =
    1 - 0.55 * smooth(ramp(t, T.unter, T.unter + 0.5)) * (1 - smooth(ramp(t, T.zerrt, T.gar)));
  {
    const p = waterGeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = waterBase[i * 3];
      const z = waterBase[i * 3 + 2];
      p.array[i * 3 + 1] =
        boil *
        0.012 *
        (Math.sin(x * 21 + t * 9) * Math.cos(z * 17 - t * 7) +
          Math.sin((x + z) * 33 + t * 13) * 0.5);
    }
    p.needsUpdate = true;
    waterGeo.computeVertexNormals();
  }
  bubbleSim(t, boil);
  steamSim(t, 0.4 + 0.6 * boil);

  // ---- the paper trick: pot lifts, paper slides in, pot drops
  const lift =
    smooth(ramp(t, T.papier + 0.05, T.papier + 0.45)) *
    (1 - smooth(ramp(t, T.papier + 0.85, T.papier + 1.05)));
  const hover =
    smooth(ramp(t, T.unter, T.unter + 0.5)) * (1 - smooth(ramp(t, T.eisen - 0.35, T.eisen + 0.05)));
  pot.position.y = 0.025 + 0.55 * lift + 0.95 * hover + (paperIn(t) > 0.5 ? 0.004 : 0);
  const slide = paperIn(t);
  paper.visible = slide > 0.001;
  paper.position.z = POT.z + (1 - slide) * 2.2;
  paper.position.y = 0.026 + Math.sin(slide * Math.PI) * 0.03;

  // ---- glass x-ray from "Unter" until the payoff
  const xr =
    smooth(ramp(t, T.unter - 0.1, T.unter + 0.35)) *
    (1 - smooth(ramp(t, T.gar - 0.05, T.gar + 0.25)));
  setXray([glassMat], xr);
  glassEdges.visible = xr > 0.02;
  glassEdges.material.opacity = xr * 0.6;

  // ghost wire: glows red, gets the X, shrinks away
  const gv = pop(t, T.heizdraht - 0.15, T.spule - 0.1);
  ghost.visible = gv > 0;
  ghostMat.opacity = 0.9 * gv * (0.75 + 0.25 * Math.sin(t * 30));
  showNope(pop(t, T.heizdraht + 0.35, T.spule - 0.1), POT.x, 0.35, POT.z, 0.55);

  // coil grows on "Spule"
  const grow = smooth(ramp(t, T.spule - 0.05, T.schnecke + 0.3));
  coil.visible = grow > 0.001;
  coilGeo.setDrawRange(0, Math.ceil(grow * COIL_SEG) * 6 * 6);
  const live = smooth(ramp(t, T.strom, T.strom + 0.3)) * (1 - smooth(ramp(t, T.gar, T.gar + 0.4)));
  copper.emissive.setHex(0xff7a2a);
  copper.emissiveIntensity =
    0.25 * live * (0.6 + 0.4 * Math.abs(Math.sin(t * flipHz(t) * Math.PI * 2)));
  // beads swing back and forth along the coil
  const amp = 0.035;
  for (let i = 0; i < N_BEAD; i++) {
    const u = (((i / N_BEAD + swing(t, flipHz(t), amp)) % 1) + 1) % 1;
    const p = spiralCurve.getPointAt(u);
    const s = live > 0.01 ? live * (0.9 + 0.3 * Math.sin(i * 1.7)) : 0.0001;
    m4.compose(V(p.x, p.y + 0.012, p.z), q0, V(s, s, s));
    beads.setMatrixAt(i, m4);
  }
  beads.instanceMatrix.needsUpdate = true;

  // ---- field: free loops from "Magnetfeld", caught by the iron from "Eisen"
  const fOn =
    smooth(ramp(t, T.magnetfeld, T.magnetfeld + 0.4)) * (1 - smooth(ramp(t, T.gar, T.gar + 0.4)));
  const caught = smooth(ramp(t, T.eisen, T.eisen + 0.6));
  const sgn = flipSign(t, flipHz(t) * 0.5);
  const pulse = 0.55 + 0.45 * Math.abs(Math.sin(t * flipHz(t) * Math.PI));
  const col = sgn > 0 ? 0x58b8ff : 0xff5a8a;
  fieldMat.color.setHex(col);
  caughtMat.color.setHex(col);
  fieldMat.opacity = 0.8 * fOn * (1 - caught) * pulse;
  caughtMat.opacity = 0.9 * fOn * caught * pulse;
  fieldFree.visible = fieldMat.opacity > 0.01;
  fieldCaught.visible = caughtMat.opacity > 0.01;
  // the loops breathe up and down with the current
  fieldFree.scale.set(1, 0.85 + 0.25 * pulse, 1);
  const curve = caught > 0.5 ? caughtCurve : freeCurve;
  for (let i = 0; i < N_DASH; i++) {
    const li = i % FIELD_N;
    const k = Math.floor(i / FIELD_N);
    const u = (((k / 6 + sgn * ((t * 0.8) % 1)) % 1) + 1) % 1;
    const p = curve.getPointAt(u);
    const a = (li / FIELD_N) * Math.PI * 2;
    const x = p.x * Math.cos(a);
    const z = -p.x * Math.sin(a);
    const s = fOn > 0.01 ? fOn : 0.0001;
    m4.compose(
      V(POT.x + x, p.y * (caught > 0.5 ? 1 : 0.85 + 0.25 * pulse), POT.z + z),
      q0,
      V(s, s, s),
    );
    dashes.setMatrixAt(i, m4);
  }
  dashes.instanceMatrix.needsUpdate = true;
  dashMat.color.setHex(sgn > 0 ? 0xbfe6ff : 0xffc0d6);

  // ---- pot x-ray to see the bottom: only in the eddy shot
  const potX = t >= T.zerrt && t < T.reiben;
  potSolid.visible = !potX;
  potXray.visible = potX;
  setXray([potXrayMat], potX ? 1 : 0);
  const eOn =
    smooth(ramp(t, T.zerrt, T.zerrt + 0.4)) * (1 - smooth(ramp(t, T.darum, T.darum + 0.5)));
  eddies.visible = eOn > 0.01;
  eddyMat.opacity = 0.9 * eOn;
  for (const e of EDDY) {
    const a = e.ph + e.dir * t * 6;
    e.dot.position.set(Math.cos(a) * e.rr, 0, Math.sin(a) * e.rr);
    e.ring.scale.setScalar(0.85 + 0.15 * Math.sin(t * 8 + e.ph));
  }
  // the iron bottom heats itself: from the eddies to the payoff, cools a bit after
  const heat =
    smooth(ramp(t, T.zerrt + 0.3, T.selbst + 0.2)) *
    (1 - 0.6 * smooth(ramp(t, T.fakt, T.fakt + 1)));
  baseMat.emissiveIntensity = 2.2 * heat;
  bandMat.opacity = 0.45 * heat;
  bandMat2.opacity = 0.8 * heat;

  // ---- analogy: two hands rubbing (only while that shot is on)
  const rubOn = t >= T.reiben - 0.2 && t < T.gar + 0.1;
  const rx = Math.sin(t * 14) * 0.12;
  if (rubOn) {
    rubR.track(t, [
      {
        t: T.reiben - 0.2,
        pos: [RUB[0] + 0.16, RUB[1] + rx, RUB[2]],
        rot: [-Math.PI / 2, 0, -Math.PI / 2],
        pose: "open",
      },
    ]);
    rubL.track(t, [
      {
        t: T.reiben - 0.2,
        pos: [RUB[0] - 0.16, RUB[1] - rx, RUB[2]],
        rot: [-Math.PI / 2, 0, Math.PI / 2],
        pose: "open",
      },
    ]);
  } else {
    rubR.track(t, []);
    rubL.track(t, []);
  }
  const warm = rubOn ? smooth(ramp(t, T.reiben, T.reiben + 1.0)) : 0;
  rubGlow.visible = warm > 0.01;
  rubGlow.material.opacity = 0.45 * warm * (0.8 + 0.2 * Math.sin(t * 28));
  rubGlow.scale.setScalar(0.7 + 0.5 * warm);
  rubLight.intensity = 3 * warm;
  for (let i = 0; i < N_FLAKE; i++) {
    const ph = (i * 0.61803) % 1;
    const y = (((ph - t * 0.15) % 1) + 1) % 1;
    const s = rubOn ? 1 : 0.0001;
    m4.compose(
      V(
        RUB[0] - 1 + ((i * 0.37) % 1) * 2,
        RUB[1] - 0.8 + y * 1.6,
        RUB[2] - 0.6 + ((i * 0.73) % 1) * 1.0,
      ),
      q0,
      V(s, s, s),
    );
    flakes.setMatrixAt(i, m4);
  }
  flakes.instanceMatrix.needsUpdate = true;

  // ---- Übrigens: whine rings + the dog's ears
  const wOn = pop(t, T.pfeift - 0.1, T.haelt);
  whine.forEach((r, i) => {
    const f = (((t * 0.8 + i / whine.length) % 1) + 1) % 1;
    r.visible = wOn > 0;
    r.scale.setScalar(0.4 + f * 3.2);
    r.material.opacity = 0.7 * wOn * (1 - f);
  });
  const dogUp = outBack(clamp01((t - (T.fakt + 0.2)) / 0.5));
  dog.visible = t >= T.fakt;
  dog.position.y = -1.3 + 1.3 * dogUp - 0.25;
  const perk = smooth(ramp(t, T.hund - 0.1, T.hund + 0.2));
  const twitch = perk * Math.sin(t * 22) * 0.06 * (1 - ramp(t, T.hund + 0.8, T.hund + 1.5));
  for (const e of ears) {
    e.pivot.rotation.z = e.s * (lerp(0.15, 1.9, perk) + twitch);
    e.pivot.rotation.x = lerp(0.05, -0.2, perk);
    e.ear.scale.y = lerp(1.0, 0.85, perk);
  }
  head.rotation.z = Math.sin(t * 3) * 0.06 * perk;
  dog.rotation.z = lerp(0, 0.18, perk); // head tilt

  // ---- CTA: magnet flies in and clacks onto the pot side
  const mIn = t >= T.haelt;
  magnet.visible = mIn;
  if (mIn) {
    const k = clamp01((t - T.haelt) / 0.45);
    const e = k * k;
    magnet.position.set(
      lerp(0.9, POT.x, e),
      lerp(0.9, 0.38, e),
      lerp(2.0, POT.z + POT.r + 0.03, e),
    );
    magnet.rotation.y = lerp(-0.8, 0, e);
    magnet.scale.copy(squash(t, T.haelt + 0.45, 0.5));
  }

  // ---- HUD: one at a time
  readout("glas", pop(t, T.kuehles, T.papier), {
    label: "GLAS",
    value: "kühl",
    note: "",
    x: 60,
    y: 520,
    color: "#7fe6ff",
  });
  readout("papier", pop(t, T.feuer + 0.1, T.unter), {
    label: "PAPIER",
    value: "heil",
    x: 60,
    y: 520,
    color: "#3dff7a",
  });
  const cnt = Math.round(20000 * smooth(ramp(t, T.ueber, T.sekunde + 0.15)));
  counter("hz", pop(t, T.rate + 0.2, T.magnetfeld), {
    label: "Richtungswechsel / s",
    value: t < T.ueber ? "?" : cnt.toLocaleString("de-DE"),
    x: 60,
    y: 470,
    color: "#ffd23f",
  });

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

function paperIn(t) {
  // in while the pot is up; out again (fast) when the glass turns to x-ray
  return (
    smooth(ramp(t, T.papier + 0.4, T.papier + 0.85)) *
    (1 - smooth(ramp(t, T.unter - 0.15, T.unter + 0.15)))
  );
}

function bubbleSim(t, boil) {
  for (let i = 0; i < N_BUB; i++) {
    const [a, b, c, d] = bubbleSeedsOf(i);
    const cyc = 0.35 + d * 0.5;
    const f = ((((t + a * 5) / cyc) % 1) + 1) % 1;
    const rad = Math.sqrt(b) * (POT.r - 0.08);
    const ang = c * Math.PI * 2;
    const s = boil * (0.006 + 0.022 * Math.sin(f * Math.PI)) * (0.6 + d * 0.6);
    m4.compose(
      V(Math.cos(ang) * rad, WATER_Y + 0.005 + f * 0.02, Math.sin(ang) * rad),
      q0,
      V(s, s * 0.9, s),
    );
    bubbles.setMatrixAt(i, m4);
  }
  bubbles.instanceMatrix.needsUpdate = true;
}
function bubbleSeedsOf(i) {
  return bubSeeds[i];
}
function steamSim(t, k) {
  for (let i = 0; i < N_STEAM; i++) {
    const [a, b, c] = steamSeeds[i];
    const f = (((t * 0.32 + a) % 1) + 1) % 1;
    const s = k * (0.12 + f * 0.5) * (0.7 + b * 0.5);
    m4.compose(
      V(
        (b - 0.5) * 0.5 + Math.sin(t * 0.8 + c * 6) * 0.12 * f,
        POT.h + f * 2.4,
        (c - 0.5) * 0.5 + f * 0.15,
      ),
      q0,
      V(s, s * 0.8, s),
    );
    steam.setMatrixAt(i, m4);
  }
  steam.instanceMatrix.needsUpdate = true;
  steamMat.opacity = 0.14 * k;
}

start(renderAt);
