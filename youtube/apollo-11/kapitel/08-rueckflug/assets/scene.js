// Chapter 8 "Der Feuerball": the ascent stage lifts off (the flag tips over
// in the exhaust), meets the Columbia, docks; the way home; re-entry with
// the angle diagram, the skipping stone, the bike pump, the burning heat
// shield; three parachutes, splashdown, the quarantine trailer.
import {
  THREE,
  V,
  scene,
  camera,
  ramp,
  smooth,
  pop,
  lerp,
  rng,
  real,
  roundedBox,
  makeArrowSet,
  animateArrows,
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
import { makeLM, makeCSM, makeEarth, makeMoonGlobe, MAT } from "./welt.js";
import { readout } from "./hud.js";
import { T, RDV, RE, ST, PU, SEA, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);
camera.far = 6000;
scene.background = new THREE.Color(0x000000);
camera.updateProjectionMatrix();
const glow = (c, o = 0.9) =>
  new THREE.MeshBasicMaterial({
    color: c,
    transparent: true,
    opacity: o,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  });

// ---------------------------------------------------------------- lift-off from the Moon
const lm = makeLM();
lm.group.rotation.y = 0.2;
scene.add(lm.group);
const flag = new THREE.Group();
{
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 2.4, 12),
    real.metal(0xd0d3d8),
  );
  pole.position.y = 1.2;
  flag.add(pole);
  const cloth = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 0.95),
    real.fabric(0xb8292f, { side: THREE.DoubleSide }),
  );
  cloth.position.set(0.75, 1.88, 0);
  flag.add(cloth);
  const canton = new THREE.Mesh(
    new THREE.PlaneGeometry(0.62, 0.5),
    real.fabric(0x2a3a7a, { side: THREE.DoubleSide }),
  );
  canton.position.set(0.31, 2.11, 0.004);
  flag.add(canton);
  flag.position.set(2.6, 0, 7.4);
  flag.traverse((o) => o.isMesh && (o.castShadow = true));
  scene.add(flag);
}

// ---------------------------------------------------------------- rendezvous in lunar orbit
const R1 = V(...RDV);
const rmoon = makeMoonGlobe(400);
rmoon.position.copy(R1).add(V(0, -440, -100));
scene.add(rmoon);
const csm = makeCSM();
scene.add(csm.group);
const asc = makeLM();
asc.descent.visible = false;
scene.add(asc.group);
const homeEarth = makeEarth(40, { spin: 0.02 });
homeEarth.position.copy(R1).add(V(0, 10, -900));
scene.add(homeEarth);
const fill = new THREE.DirectionalLight(0xfff2e2, 1.6);
fill.position.copy(R1).add(V(30, 20, 40));
fill.target = csm.group;
scene.add(fill);

// ---------------------------------------------------------------- re-entry above the Earth
const R2 = V(...RE);
const bigEarth = makeEarth(1500, { spin: 0.002 });
bigEarth.position.copy(R2).add(V(0, -1720, -200));
scene.add(bigEarth);
const cm = new THREE.Group();
{
  const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 1.95, 3.2, 64), MAT.silver);
  cone.position.y = 1.6;
  cm.add(cone);
  const shield = new THREE.Mesh(
    new THREE.SphereGeometry(2.6, 64, 16, 0, Math.PI * 2, Math.PI - 0.85, 0.85),
    real.metal(0x6f4a2a, { roughness: 0.6, emissive: 0xff5a10, emissiveIntensity: 0 }),
  );
  shield.position.y = 2.15;
  shield.name = "shield";
  cm.add(shield);
  cm.traverse((o) => o.isMesh && (o.castShadow = true));
}
cm.position.copy(R2);
cm.rotation.z = 0.5; // heat shield forward-down along the flight path
scene.add(cm);
const sm = new THREE.Mesh(new THREE.CylinderGeometry(1.95, 1.95, 7.4, 48), MAT.alu);
scene.add(sm);
// the plasma: glowing shells in front of the shield + a trail
const plasma = new THREE.Group();
for (let i = 0; i < 4; i++) {
  const s = new THREE.Mesh(
    new THREE.SphereGeometry(2.6 + i * 0.5, 32, 16, 0, Math.PI * 2, Math.PI - 1.0, 1.0),
    glow([0xfff1c8, 0xffb04a, 0xff6a1a, 0xff3a10][i], 0.5 - i * 0.1),
  );
  s.position.y = 2.15 - i * 0.15;
  plasma.add(s);
}
const trail = new THREE.Mesh(new THREE.ConeGeometry(2.2, 18, 32, 1, true), glow(0xff7a2a, 0.35));
trail.position.y = 11;
plasma.add(trail);
cm.add(plasma);
const heat = new THREE.PointLight(0xff8a3a, 0, 40, 1.4);
heat.position.y = -1;
cm.add(heat);
// compressed air: arrows rushing into the shield
const squeeze = makeArrowSet(
  [
    [V(-5, -4, 0), V(-1.6, -1.4, 0)],
    [V(0, -5.5, 0), V(0, -2.2, 0)],
    [V(5, -4, 0), V(1.6, -1.4, 0)],
  ],
  { parent: cm, amp: 0 },
);
// flakes coming off the shield
const NF = 70;
const flakes = new THREE.InstancedMesh(
  new THREE.TetrahedronGeometry(0.12, 0),
  glow(0xffc070, 0.9),
  NF,
);
scene.add(flakes);
const fr = rng(8);
const fseed = Array.from({ length: NF }, () => [fr() * Math.PI * 2, fr(), fr()]);
// trajectory diagram: steep (burns), shallow (bounces), right (glides)
const traj = {};
for (const [k, pts, col] of [
  ["good", [V(-60, 40, 0), V(-25, 14, 0), V(0, 0, 0), V(25, -12, 0), V(45, -24, 0)], 0x3dff7a],
  ["steep", [V(-60, 40, 0), V(-35, 10, 0), V(-22, -16, 0), V(-15, -32, 0)], 0xff4b2b],
  ["flat", [V(-60, 40, 0), V(-25, 24, 0), V(0, 20, 0), V(25, 28, 0), V(50, 46, 0)], 0xff4b2b],
]) {
  const m = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.7, 8),
    glow(col, 0.9),
  );
  m.position.copy(R2);
  scene.add(m);
  traj[k] = m;
}

// ---------------------------------------------------------------- skipping stone
const S1 = V(...ST);
const stoneSet = new THREE.Group();
stoneSet.position.copy(S1);
scene.add(stoneSet);
const water = new THREE.Mesh(
  new THREE.CircleGeometry(12, 64),
  real.gloss(0x2f6f8f, { roughness: 0.15 }),
);
water.rotation.x = -Math.PI / 2;
stoneSet.add(water);
const stone = new THREE.Mesh(
  new THREE.SphereGeometry(0.12, 32, 16),
  real.plastic(0x8a857c, { roughness: 0.7 }),
);
stone.scale.set(1, 0.35, 0.8);
stoneSet.add(stone);
const rings = [0, 1, 2].map(() => {
  const r = new THREE.Mesh(
    new THREE.TorusGeometry(0.2, 0.012, 8, 48),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true }),
  );
  r.rotation.x = Math.PI / 2;
  stoneSet.add(r);
  return r;
});
{
  const l = new THREE.PointLight(0xfff0dc, 20, 12, 1.5);
  l.position.set(1, 3, 2);
  stoneSet.add(l);
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(30, 32, 16),
    new THREE.MeshBasicMaterial({ color: 0x9cc8ee, side: THREE.BackSide, fog: false }),
  );
  stoneSet.add(sky);
}

// ---------------------------------------------------------------- bike pump
const P1 = V(...PU);
const pump = new THREE.Group();
pump.position.copy(P1);
scene.add(pump);
const piston = new THREE.Group();
const tipMat = real.metal(0x8a8f96, { emissive: 0xff5a10, emissiveIntensity: 0 });
{
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.6, 32),
    real.gloss(0x2f6fd8),
  );
  barrel.position.y = 0.3;
  pump.add(barrel);
  const foot = new THREE.Mesh(roundedBox(0.3, 0.02, 0.12, 0.01), real.plastic(0x1d1f24));
  pump.add(foot);
  const rod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.01, 0.01, 0.4, 16),
    real.metal(0xd0d3d6, { roughness: 0.2 }),
  );
  rod.position.y = 0.2;
  piston.add(rod);
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.3, 24),
    real.plastic(0x1d1f24),
  );
  handle.rotation.z = Math.PI / 2;
  handle.position.y = 0.4;
  piston.add(handle);
  piston.position.y = 0.6;
  pump.add(piston);
  const hose = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([V(0.05, 0.05, 0), V(0.3, 0.02, 0.1), V(0.5, 0.05, 0.05)]),
      40,
      0.01,
      8,
    ),
    real.rubber(),
  );
  pump.add(hose);
  const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.06, 16), tipMat);
  tip.rotation.z = Math.PI / 2;
  tip.position.set(0.52, 0.05, 0.05);
  pump.add(tip);
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(6, 4), real.plastic(0x20232a));
  bg.position.set(0, 1, -1);
  pump.add(bg);
  const fl = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 6),
    real.wood ? real.wood(0x7a5a3a) : real.plastic(0x7a5a3a),
  );
  fl.rotation.x = -Math.PI / 2;
  pump.add(fl);
  const l = new THREE.SpotLight(0xfff0dc, 12, 4, 0.7, 0.5, 1.2);
  l.position.set(0.6, 1.4, 1);
  l.target = pump;
  pump.add(l);
}

// ---------------------------------------------------------------- the Pacific: parachutes, splash, quarantine trailer
const S2 = V(...SEA);
const sea = new THREE.Group();
sea.position.copy(S2);
scene.add(sea);
{
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(400, 32, 16),
    new THREE.MeshBasicMaterial({ color: 0x8fc0ea, side: THREE.BackSide, fog: false }),
  );
  sea.add(dome);
  const ocean = new THREE.Mesh(
    new THREE.CircleGeometry(390, 64),
    real.gloss(0x1d5a86, { roughness: 0.25 }),
  );
  ocean.rotation.x = -Math.PI / 2;
  sea.add(ocean);
  const sun = new THREE.DirectionalLight(0xfff4e0, 2.2);
  sun.position.set(40, 60, 30);
  sun.target = sea;
  sea.add(sun);
  const hemi = new THREE.HemisphereLight(0xbcdcff, 0x1d3a5a, 1.2);
  sea.add(hemi);
  // carrier deck + quarantine trailer
  const deck = new THREE.Mesh(
    roundedBox(40, 3, 24, 0.3),
    real.plastic(0x5a6068, { roughness: 0.8 }),
  );
  deck.position.set(60, 1.5, 0);
  sea.add(deck);
  const line = new THREE.Mesh(new THREE.PlaneGeometry(38, 0.3), real.plastic(0xf2d23a));
  line.rotation.x = -Math.PI / 2;
  line.position.set(60, 3.02, 5);
  sea.add(line);
  const trailer = new THREE.Group();
  const body = new THREE.Mesh(
    roundedBox(10.5, 2.6, 2.6, 0.5),
    real.metal(0xd8dce1, { roughness: 0.3 }),
  );
  body.position.y = 1.6;
  trailer.add(body);
  for (const x of [-3, 0, 3]) {
    const w = new THREE.Mesh(roundedBox(1.2, 0.8, 0.05, 0.08), MAT.window);
    w.position.set(x, 2.0, 1.31);
    trailer.add(w);
  }
  for (const x of [-3.5, 3.5]) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.3, 24), real.rubber());
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, 0.35, 1.2);
    trailer.add(wheel);
  }
  trailer.position.set(60, 3, 0);
  sea.add(trailer);
}
const capsule = new THREE.Group();
{
  const cone = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 1.95, 3.2, 48),
    real.metal(0xb9b2a6, { roughness: 0.5 }),
  );
  cone.position.y = 1.6;
  capsule.add(cone);
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(1.95, 1.9, 0.4, 48),
    real.metal(0x5a3e28, { roughness: 0.8 }),
  );
  base.position.y = 0;
  capsule.add(base);
}
sea.add(capsule);
const chutes = [];
for (let i = 0; i < 3; i++) {
  const c = new THREE.Group();
  const canopy = new THREE.Mesh(
    new THREE.SphereGeometry(5, 32, 12, 0, Math.PI * 2, 0, 1.2),
    real.fabric(i === 1 ? 0xf2f0ea : 0xe0552a, { side: THREE.DoubleSide }),
  );
  c.add(canopy);
  for (let j = 0; j < 8; j++) {
    const a = (j / 8) * Math.PI * 2;
    const top = V(Math.cos(a) * 4.6, 1.8, Math.sin(a) * 4.6);
    const ln = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1, 4), real.plastic(0xffffff));
    ln.userData.top = top;
    c.add(ln);
  }
  sea.add(c);
  chutes.push(c);
}
const splash = new THREE.InstancedMesh(
  new THREE.SphereGeometry(0.16, 10, 8),
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
    roughness: 0.2,
  }),
  80,
);
sea.add(splash);
const sr = rng(3);
const sseed = Array.from({ length: 80 }, () => [sr() * Math.PI * 2, sr(), sr()]);

const applyCamera = shotCamera(shots, 1);
const mm = new THREE.Matrix4();
const qq = new THREE.Quaternion();

function renderAt(t) {
  // ---- lift-off
  const up = Math.max(0, t - T.zuendet);
  lm.ascent.position.y = up * up * 1.4 + up * 2;
  lm.ascentFlame.userData.set(t >= T.zuendet && up < 6 ? 1 : 0, t);
  const tip = smooth(ramp(t, T.flagge + 0.3, T.flagge + 1.1));
  flag.rotation.z = -tip * 1.45;
  flag.position.y = 0;

  // ---- rendezvous: CSM nose down; ascent stage rises to dock, then is let go
  csm.group.position.copy(R1).add(V(0, 14.05, 0));
  csm.group.rotation.set(Math.PI, 0, 0);
  const dockU = smooth(ramp(t, T.jetzt, T.docken + 0.25));
  const release = Math.max(0, t - T.bleibt);
  asc.group.position
    .copy(R1)
    .add(V(release * 1.5, lerp(-40, -5.75, dockU) - release * 3, release * 2));
  asc.group.rotation.set(release * 0.3, 0.3, 0);
  asc.ascentFlame.userData.set(t > T.jetzt && t < T.docken - 0.5 ? 0.5 : 0, t);
  // way home: the CSM turns toward the Earth and fires
  if (t >= T.heimweg) {
    csm.group.rotation.set(-Math.PI / 2, 0, 0);
    csm.group.position.copy(R1);
    asc.group.visible = false;
  }
  csm.spsFlame.userData.set(t >= T.heimweg && t < T.wieder ? 1 : 0, t);

  // ---- re-entry: the SM drops away, the CM glows
  const sep = Math.max(0, t - (T.wieder + 0.3));
  sm.position.copy(R2).add(V(-4 - sep * 1.5, 6 + sep * 0.6, -sep));
  sm.rotation.set(sep * 0.6, 0, 0.5 + sep * 0.4);
  sm.visible = t >= T.wieder && t < T.winkel;
  const hot =
    smooth(ramp(t, T.trifft, T.trifft + 1.2)) * (1 - smooth(ramp(t, T.schirme - 0.6, T.schirme)));
  cm.visible = t >= T.wieder && t < T.schirme && !(t >= T.winkel && t < T.trifft);
  plasma.visible = hot > 0.02;
  plasma.scale.setScalar(0.6 + 0.4 * hot + Math.sin(t * 30) * 0.02);
  cm.getObjectByName("shield").material.emissiveIntensity = 2.5 * hot;
  heat.intensity = 80 * hot;
  animateArrows(squeeze, t, pop(t, T.vor, T.pumpe));
  flakes.visible = t >= T.schild && t < T.funk + 1.5;
  fseed.forEach(([a, ph, sp], i) => {
    const u = (t * (0.6 + sp * 0.6) + ph) % 1;
    mm.compose(
      R2.clone().add(V(Math.cos(a) * (1.6 + u * 2), 0.2 + u * 9, Math.sin(a) * (1.6 + u * 2))),
      qq,
      V(1 - u, 1 - u, 1 - u),
    );
    flakes.setMatrixAt(i, mm);
  });
  flakes.instanceMatrix.needsUpdate = true;
  const diag = t >= T.winkel && t < T.trifft && !(t >= T.stein && t < T.steil);
  traj.good.visible = diag && t < T.steil + 0.0 ? true : diag && t >= T.flach + 0.8;
  traj.steep.visible = diag && t >= T.steil && t < T.flach;
  traj.flat.visible = diag && t >= T.flach;
  if (diag) traj.good.visible = t < T.steil || t >= T.trifft - 0.6;
  showNope(
    diag && t >= T.steil ? pop(t, T.steil + 0.6, T.trifft) : 0,
    R2.x - 15,
    R2.y - 32,
    R2.z,
    8,
  );

  // ---- skipping stone
  const su = ramp(t, T.stein, T.steil);
  const hopH = Math.abs(Math.sin(su * Math.PI * 3)) * 0.4 * (1 - su * 0.5);
  stone.position.set(lerp(2.5, -3, su), 0.05 + hopH, 0);
  stone.rotation.y = t * 12;
  rings.forEach((r, i) => {
    const at = T.stein + ((i + 1) / 3) * (T.steil - T.stein) * 0.95;
    const age = t - at;
    r.visible = age > 0;
    r.position.set(lerp(2.5, -3, (i + 1) / 3), 0.01, 0);
    r.scale.setScalar(1 + age * 4);
    r.material.opacity = Math.max(0, 1 - age);
  });

  // ---- bike pump: the piston slams down, the tip glows
  const stroke = Math.abs(Math.sin(Math.max(0, t - T.pumpe) * 4));
  piston.position.y = 0.6 - stroke * 0.32;
  tipMat.emissiveIntensity = 2 * smooth(ramp(t, T.pumpe + 0.3, T.pumpe + 1.4));

  // ---- the Pacific
  const desc = ramp(t, T.schirme - 0.3, T.platsch);
  const cy = lerp(42, 0.2, desc);
  capsule.position.set(0, cy, 0);
  capsule.rotation.z = Math.sin(t * 1.3) * 0.06;
  chutes.forEach((c, i) => {
    const a = (i / 3) * Math.PI * 2;
    c.visible = t >= T.schirme && t < T.platsch + 1.2;
    c.position.set(Math.cos(a) * 4, cy + 16, Math.sin(a) * 4);
    c.scale.setScalar(Math.min(1, ramp(t, T.schirme, T.schirme + 0.8) * 1.1));
    c.children.slice(1).forEach((ln) => {
      const top = ln.userData.top;
      const from = c.position.clone().add(top);
      const to = capsule.position.clone().add(V(0, 3.2, 0));
      ln.position.copy(from.clone().add(to).multiplyScalar(0.5).sub(c.position));
      ln.scale.set(1, from.distanceTo(to), 1);
      ln.quaternion.setFromUnitVectors(V(0, 1, 0), to.clone().sub(from).normalize());
    });
  });
  const sa = t - T.platsch;
  splash.visible = sa > 0 && sa < 2.5;
  sseed.forEach(([a, sp, h], i) => {
    const u = Math.max(0, sa) * (0.6 + sp);
    mm.compose(
      V(
        Math.cos(a) * (2 + u * 3),
        Math.max(0, h * 5 * u - 4.9 * u * u * 0.6),
        Math.sin(a) * (2 + u * 3),
      ),
      qq,
      V(1, 1, 1),
    );
    splash.setMatrixAt(i, mm);
  });
  splash.instanceMatrix.needsUpdate = true;

  // ---- displays
  readout("speed", pop(t, T.schiffe, T.collins - 0.1), {
    label: "Tempo",
    value: "5.800",
    unit: "km/h",
    x: 110,
    y: 190,
  });
  readout("re", pop(t, T.trifft + 1.2, T.vor), {
    label: "Tempo",
    value: "40.000",
    unit: "km/h",
    x: 110,
    y: 190,
  });
  readout("funk", pop(t, T.funk, T.schirme - 0.2), {
    label: "Funk",
    value: "—",
    unit: "",
    x: 110,
    y: 190,
    color: "#ff4b2b",
  });
  readout("q", pop(t, T.quar - 0.3, T.wie + 0.6), {
    label: "Quarantäne",
    value: 21,
    unit: "Tage",
    x: 110,
    y: 190,
  });
  if (t >= T.grad - 0.2 && t < T.schild)
    showPanel(pop(t, T.grad - 0.2, T.schild), "HITZESCHILD", "2.500 °C", LED.red);
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
