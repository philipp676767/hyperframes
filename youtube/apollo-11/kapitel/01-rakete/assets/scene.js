// Chapter 1 "Das Monster": the Saturn V on pad 39A at dawn — its size next
// to the Statue of Liberty, the balloon analogy for thrust, countdown,
// ignition with smoke, lift-off, the first stage falling away, orbit.
import {
  THREE,
  V,
  scene,
  camera,
  ground,
  ramp,
  smooth,
  pop,
  rng,
  squash,
  real,
  makeArrowSet,
  animateArrows,
  showPanel,
  LED,
  labels,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import "./set.js";
import { makeSaturnV, makeEarth } from "./welt.js";
import { readout, counter } from "./hud.js";
import { T, LIFT, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);
camera.far = 6000;
camera.updateProjectionMatrix();

// ---------------------------------------------------------------- the rocket
const sv = makeSaturnV();
sv.group.position.set(0, 6, 0);
scene.add(sv.group);
const ROCKET = V(0, 6, 0);
for (const s of shots) if (s.rel === "rocket") s.rel = ROCKET;

// ---------------------------------------------------------------- Statue of Liberty (size comparison, 93 m)
{
  const g = new THREE.Group();
  const stone = real.ceramic ? real.ceramic(0xb7ab92) : real.plastic(0xb7ab92);
  const copper = real.plastic(0x6fa892, { roughness: 0.6 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(26, 20, 26), stone);
  base.position.y = 10;
  g.add(base);
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(8, 10, 27, 4), stone);
  ped.rotation.y = Math.PI / 4;
  ped.position.y = 33.5;
  g.add(ped);
  const robe = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 6.5, 30, 24), copper);
  robe.position.y = 62;
  g.add(robe);
  const head = new THREE.Mesh(new THREE.SphereGeometry(2.6, 24, 16), copper);
  head.position.y = 79.5;
  g.add(head);
  for (let i = 0; i < 7; i++) {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.45, 3.4, 8), copper);
    const a = -1.2 + (i / 6) * 2.4;
    spike.position.set(Math.sin(a) * 2.4, 82, Math.cos(a) * 1.2);
    spike.rotation.set(Math.cos(a) * 0.5, 0, -Math.sin(a) * 0.6);
    g.add(spike);
  }
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.4, 14, 12), copper);
  arm.position.set(3.6, 82, 0);
  arm.rotation.z = -0.2;
  g.add(arm);
  const torch = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 0.8, 3, 16), copper);
  torch.position.set(5, 90, 0);
  g.add(torch);
  const fl = new THREE.Mesh(
    new THREE.SphereGeometry(1.4, 16, 12),
    new THREE.MeshStandardMaterial({ color: 0xffd27a, emissive: 0xffb040, emissiveIntensity: 1.4 }),
  );
  fl.position.set(5, 92.4, 0);
  g.add(fl);
  g.traverse((o) => o.isMesh && (o.castShadow = true));
  g.position.set(-55, 0, 12);
  g.rotation.y = 0.6;
  ground.add(g);
}

// ---------------------------------------------------------------- balloon analogy (on the pad's edge)
const BAL = V(42, 8.6, 58);
const balloon = new THREE.Group();
{
  const skin = new THREE.Mesh(new THREE.SphereGeometry(1.0, 64, 40), real.gloss(0xd8322c));
  skin.scale.set(1.25, 0.95, 0.95);
  balloon.add(skin);
  const knot = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.3, 24), real.gloss(0xb82a24));
  knot.rotation.z = Math.PI / 2;
  knot.position.x = -1.32;
  balloon.add(knot);
  balloon.userData.skin = skin;
}
scene.add(balloon);
const air = makeArrowSet(
  [
    [V(-1.5, 0, 0), V(-4.2, 0.0, 0)],
    [V(-1.5, 0.15, 0.1), V(-3.8, 0.7, 0.4)],
    [V(-1.5, -0.15, -0.1), V(-3.8, -0.6, -0.4)],
  ],
  { parent: balloon, amp: 0.12 },
);
const push = makeArrowSet([[V(1.4, 0, 0), V(3.2, 0, 0)]], { parent: balloon, amp: 0 });

// ---------------------------------------------------------------- smoke out of the flame trench
const smokeMat = new THREE.MeshStandardMaterial({
  color: 0xe9e4dc,
  roughness: 1,
  transparent: true,
  opacity: 0.9,
  depthWrite: false,
});
const NS = 140;
const smoke = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 2), smokeMat, NS);
smoke.userData.noAO = true;
scene.add(smoke);
const sr = rng(5);
const sseed = Array.from({ length: NS }, () => [sr() < 0.5 ? -1 : 1, sr() * 4, sr(), sr(), sr()]);
const mm = new THREE.Matrix4();
const qq = new THREE.Quaternion();
function smokeAt(t) {
  const t0 = T.null + 0.2;
  smoke.visible = t > t0 && t < T.trick;
  sseed.forEach(([side, delay, a, b, c], i) => {
    const age = t - t0 - delay * 0.9;
    if (age < 0) {
      mm.makeScale(0, 0, 0);
    } else {
      const d = 8 + age * 11 * (0.7 + a * 0.6);
      const s = 3 + age * (2.2 + b * 1.6);
      mm.compose(
        V((c - 0.5) * 18 + (b - 0.5) * age * 4, 3 + age * (1.5 + c * 2.5), side * d),
        qq,
        V(s, s * 0.8, s),
      );
    }
    smoke.setMatrixAt(i, mm);
  });
  smoke.instanceMatrix.needsUpdate = true;
}

// ---------------------------------------------------------------- space backdrop for the orbit shot
const space = new THREE.Group();
const dark = new THREE.Mesh(
  new THREE.SphereGeometry(4000, 32, 16),
  new THREE.MeshBasicMaterial({ color: 0x020206, side: THREE.BackSide, fog: false }),
);
dark.userData.noAO = true;
space.add(dark);
{
  const r = rng(12);
  const pts = [];
  for (let i = 0; i < 900; i++) {
    const v = V(r() - 0.5, r() - 0.3, r() - 0.5)
      .normalize()
      .multiplyScalar(3500);
    pts.push(v.x, v.y, v.z);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  space.add(
    new THREE.Points(
      g,
      new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, fog: false }),
    ),
  );
}
const bigEarth = makeEarth(1500, { spin: 0.004 });
space.add(bigEarth);
scene.add(space);

const applyCamera = shotCamera(shots, 1);

function renderAt(t) {
  // ---- rocket flight: on the pad → climbing → staging altitude → orbit
  const high = t >= T.trick;
  const orbit = t >= T.erde - 0.1;
  let alt = 0;
  if (!high) {
    const u = Math.max(0, t - LIFT);
    alt = 0.5 * 3.2 * u * u;
  } else {
    alt = 3000 + (t - T.trick) * 40;
  }
  ROCKET.set(0, 6 + alt, 0);
  sv.group.position.copy(ROCKET);
  ground.visible = !high;
  space.visible = orbit;
  bigEarth.position.set(ROCKET.x - 200, ROCKET.y - 1540, ROCKET.z - 380);

  // engines: flicker at ignition, full from LIFT
  const ign = t < T.null ? 0 : t < T.bis ? 0.55 + 0.25 * smooth(ramp(t, T.null, T.bis)) : 1;
  sv.s1Flame.children.forEach((f, i) => f.userData.set(t < T.stufe + 0.3 ? ign : 0, t + i * 0.37));
  // first stage drops away, then the second stage burns
  const drop = Math.max(0, t - (T.stufe + 0.3));
  sv.s1.position.set(drop * 0.8, -0.5 * 9 * drop * drop - drop * 6, 0);
  sv.s1.rotation.z = drop * 0.12;
  sv.s1.visible = drop < 12;
  sv.s2Flame.userData.set(t > T.stufe + 0.8 && t < T.erde - 0.1 ? 1 : 0, t);
  sv.s2.visible = !orbit;
  sv.s3Flame.userData.set(0, t);
  sv.tower.visible = t < T.stufe; // the escape tower is jettisoned early in reality
  smokeAt(t);

  // ---- balloon: let go, air rushes back, balloon shoots forward
  const bOn = t >= T.ballon - 0.2 && t < T.saturn2;
  balloon.visible = bOn;
  const bu = ramp(t, T.ballon + 0.5, T.saturn2);
  balloon.position.set(BAL.x - 5 + bu * 10, BAL.y + Math.sin(t * 9) * 0.06, BAL.z);
  balloon.scale.copy(squash(t, T.ballon - 0.1)).multiplyScalar(1 - bu * 0.35);
  balloon.rotation.z = Math.sin(t * 7) * 0.08;
  animateArrows(air, t, pop(t, T.ballon + 0.5, T.saturn2));
  animateArrows(push, t, pop(t, T.rueck - 0.2, T.saturn2));

  // ---- displays (one at a time)
  readout("hoehe", pop(t, T.unter + 0.6, T.fast - 0.2), {
    label: "Höhe",
    value: 111,
    unit: "m",
    x: 110,
    y: 190,
  });
  readout("masse", pop(t, T.fast + 0.2, T.wie - 0.2), {
    label: "Gewicht",
    value: "3.000",
    unit: "t",
    x: 110,
    y: 190,
  });
  const cd = Math.max(0, Math.ceil(10 - (t - T.kontroll) * (10 / (T.null - T.kontroll))));
  counter("cd", pop(t, T.kontroll + 0.2, T.null + 0.8), {
    label: "Countdown",
    value: cd,
    x: 110,
    y: 190,
  });
  if (t >= T.wannen - 0.6 && t < T.noch)
    showPanel(pop(t, T.wannen - 0.6, T.noch), "PRO SEKUNDE", "90 WANNEN", LED.blue);
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
