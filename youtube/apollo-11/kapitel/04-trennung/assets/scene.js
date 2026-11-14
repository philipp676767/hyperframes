// Chapter 4 "Allein hinterm Mond": the docked Columbia + Eagle in lunar
// orbit, the radio blackout as a diagram, the paper-thin wall, undocking,
// Collins' photo of the Eagle with the Earth behind it, the DSKY.
import {
  THREE,
  V,
  scene,
  camera,
  ramp,
  smooth,
  pop,
  lerp,
  real,
  roundedBox,
  showNope,
  showPanel,
  LED,
  labels,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import "./set.js";
import {
  makeEarth,
  makeMoonGlobe,
  makeCSM,
  makeLM,
  makeAstronaut,
  makeDSKY,
  DSKY_POS,
} from "./welt.js";
import { readout, viewfinder } from "./hud.js";
import { T, DIAG, PAPER, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);
camera.far = 6000;
camera.updateProjectionMatrix();

// ---------------------------------------------------------------- the Moon below, the Earth far away
const moon = makeMoonGlobe(400);
moon.position.set(0, -440, -120);
scene.add(moon);
const EARTH = V(-60, -120, -2600);
const earth = makeEarth(70, { spin: 0.01 });
earth.position.copy(EARTH);
scene.add(earth);
const sunOnEarth = new THREE.DirectionalLight(0xffffff, 2.2);
sunOnEarth.position.copy(EARTH).add(V(300, 60, 200));
sunOnEarth.target = earth;
scene.add(sunOnEarth);
const fill = new THREE.DirectionalLight(0xfff2e2, 1.6);
fill.position.set(30, 20, 40);
scene.add(fill);

// ---------------------------------------------------------------- the docked stack: CSM on top (nose down), LM below
const stack = new THREE.Group();
scene.add(stack);
const csm = makeCSM();
csm.group.rotation.x = Math.PI;
csm.group.position.y = 14.05;
stack.add(csm.group);
const lm = makeLM();
lm.group.position.y = -5.75;
stack.add(lm.group);
// two crew standing in the cabin (seen in x-ray)
const crew = [makeAstronaut(), makeAstronaut()];
crew.forEach((c, i) => {
  c.group.position.set(i ? 0.45 : -0.45, -5.75 + 2.95, 0.6);
  c.group.scale.setScalar(0.95);
  stack.add(c.group);
});
const cabinMats = [];
lm.ascent.traverse((o) => {
  if (o.isMesh && !o.material.transparent && o.material.opacity === 1) {
    o.material = o.material.clone();
    o.material.transparent = true;
    cabinMats.push(o.material);
  }
});

// ---------------------------------------------------------------- radio diagram
const D = V(...DIAG);
const dEarth = makeEarth(6, { spin: 0.08 });
dEarth.position.copy(D).add(V(-40, 0, 0));
scene.add(dEarth);
const dMoon = makeMoonGlobe(2.2);
dMoon.position.copy(D);
scene.add(dMoon);
const glow = (c, o = 0.9) =>
  new THREE.MeshBasicMaterial({
    color: c,
    transparent: true,
    opacity: o,
    depthWrite: false,
    fog: false,
  });
const dCraft = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 12), glow(0xffd23f, 1));
scene.add(dCraft);
const beamMat = glow(0xff5a4a, 0.8);
const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1, 8), beamMat);
scene.add(beam);

// ---------------------------------------------------------------- paper macro: LM skin vs three sheets of paper (x20)
const P = V(...PAPER);
const paper = new THREE.Group();
paper.position.copy(P);
scene.add(paper);
{
  const sheetMat = real.fabric(0xf6f3ea);
  for (let i = 0; i < 3; i++) {
    const s = new THREE.Mesh(roundedBox(0.6, 0.002 * 20 * 0.1, 0.42, 0.002), sheetMat);
    s.position.set(-0.36, 0.002 + i * 0.0045, 0);
    s.rotation.y = 0.05 * i;
    paper.add(s);
  }
  const skin = new THREE.Mesh(
    roundedBox(0.6, 0.012, 0.42, 0.003),
    real.metal(0xc9a24a, { roughness: 0.35 }),
  );
  skin.position.set(0.36, 0.006, 0);
  paper.add(skin);
  const floorM = new THREE.Mesh(
    new THREE.CircleGeometry(2.4, 48),
    real.plastic(0x23262e, { roughness: 0.6 }),
  );
  floorM.rotation.x = -Math.PI / 2;
  paper.add(floorM);
  const spot = new THREE.SpotLight(0xfff0dc, 30, 6, 0.7, 0.5, 1.2);
  spot.position.set(0.8, 1.6, 1.2);
  spot.target = paper;
  paper.add(spot);
  paper.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
}
const driver = new THREE.Group();
{
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.035, 0.2, 32),
    real.plastic(0xd8322c),
  );
  handle.position.y = 0.32;
  driver.add(handle);
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.22, 16),
    real.metal(0xd0d3d6, { roughness: 0.2 }),
  );
  shaft.position.y = 0.11;
  driver.add(shaft);
  driver.rotation.z = 0.25;
  paper.add(driver);
}

// ---------------------------------------------------------------- DSKY at the end
const dsky = makeDSKY();
dsky.group.position.copy(DSKY_POS);
scene.add(dsky.group);

// the LM drifts off toward the Earth (as seen from Collins' window)
const DIR = EARTH.clone()
  .sub(V(3, 1.5, 7))
  .normalize();
const LMW = V(0, -5.75, 0);
for (const s of shots) if (s.rel === "lm") s.rel = LMW;
const applyCamera = shotCamera(shots, 1);

function renderAt(t) {
  // stack drifts along its orbit; SPS burn behind the Moon at the start
  stack.position.set(0, 0, 0);
  stack.rotation.set(0, 0, 0);
  csm.spsFlame.userData.set(t >= T.bremsen && t < T.houston ? 1 : 0, t);
  // undocking: the LM drops away and sinks
  const und = Math.max(0, t - (T.trennen + 0.3));
  const go = und * 3 + und * und * 0.4;
  lm.group.position.set(DIR.x * go, -5.75 + DIR.y * go, DIR.z * go);
  LMW.copy(lm.group.position);
  lm.descentFlame.userData.set(t >= T.sinkt ? 1 : 0, t);
  // x-ray cabin with the two crew standing
  const xr =
    smooth(ramp(t, T.sitze - 0.3, T.sitze + 0.4)) * (1 - ramp(t, T.trennen - 0.4, T.trennen));
  cabinMats.forEach((m) => {
    m.opacity = lerp(1, 0.18, xr);
    m.depthWrite = xr < 0.02;
  });
  crew.forEach((c) => (c.group.visible = xr > 0.02));
  // the descent stage glows on "Landestufe", the cabin on "Kabine"
  lm.descent.scale.setScalar(1 + 0.04 * pop(t, T.landestufe, T.kabine));
  lm.ascent.scale.setScalar(1 + 0.04 * pop(t, T.kabine, T.sitze));
  // the Earth stays hidden behind the Moon until the signal comes back
  earth.visible = t >= T.dann;

  // radio diagram: the craft orbits the Moon; the beam is blocked while it is behind
  const a = lerp(Math.PI * 0.85, Math.PI * 2.2, ramp(t, T.houston - 0.5, T.steigen));
  const cp = D.clone().add(V(Math.cos(a) * 3.6, 0, Math.sin(a) * 3.6));
  dCraft.position.copy(cp);
  const behind = Math.cos(a) > 0.35;
  const from = dEarth.position.clone().add(V(6.2, 0, 0));
  const to = behind ? D.clone().add(V(-2.3, 0, Math.sin(a) * 2)) : cp;
  beam.visible = t >= T.houston && t < T.steigen;
  beam.position.copy(from).add(to).multiplyScalar(0.5);
  beam.scale.set(1, from.distanceTo(to), 1);
  beam.quaternion.setFromUnitVectors(V(0, 1, 0), to.clone().sub(from).normalize());
  beamMat.color.set(t >= T.dann + 0.4 ? 0x3dff7a : 0xff5a4a);
  showNope(
    beam.visible && t < T.dann ? pop(t, T.houston + 0.8, T.dann) : 0,
    D.x - 3.4,
    D.y + 2.5,
    D.z,
    2.4,
  );

  // paper macro: the screwdriver pokes through the gold skin
  const poke = smooth(ramp(t, T.schrauben, T.schrauben + 0.9));
  driver.position.set(0.36 + 0.02, lerp(0.35, 0.02, poke), 0);
  driver.visible = t >= T.schrauben - 0.4;

  // DSKY: 1202 blinking
  dsky.show({
    alarm: t >= T.was,
    blink: Math.floor(t * 3) % 2 === 0,
    r1: "+01202",
    prog: "63",
    r2: "+00000",
    r3: "−00042",
  });

  // HUD
  readout("funk", pop(t, T.runde + 0.6, T.zeitungen - 0.2), {
    label: "Kein Funk",
    value: 48,
    unit: "min",
    x: 110,
    y: 190,
    color: "#ff4b2b",
  });
  if (t >= T.papier - 0.2 && t < T.teile)
    showPanel(pop(t, T.papier - 0.2, T.teile), "WAND", "0,3 MM", LED.yellow);
  else showPanel(0);
  viewfinder(pop(t, T.foto, T.sinkt), { label: "COLUMBIA · HASSELBLAD", time: "20.07.1969" });

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
