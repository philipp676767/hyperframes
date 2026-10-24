// #27 "Was passiert eigentlich, wenn du zum tiefsten Punkt im Meer tauchst?"
// (format B). Frame 0: the viewer's hand pulls the release lever on a
// research ship, the yellow toy sub drops into the Pacific with a splash.
// Then it sinks: the Everest goes under in a tank, blue turns black, the
// headlights snap on, glowing fish and an anglerfish drift past, the cola
// can strapped to the sub crunches flat. Water pressure from all sides, a
// box crumples next to the sub, the x-ray shows the titanium sphere inside.
// "Rate mal": four hours down. Eleven kilometres of water above, the last
// fish turns back, touchdown in the trench, amphipods crawl in the light.
// Payoff: a car lands on your fingernail. Übrigens: a plastic bag down
// there. The water column itself moves (set.js); timing lives in beats.js;
// renderAt(t) is a pure function of t.
import {
  THREE,
  ramp,
  smooth,
  lerp,
  pop,
  V,
  rng,
  jitter,
  facet,
  facetMat,
  scene,
  ground,
  flat,
  M,
  inBack,
  xrayMaterial,
  setXray,
  showNope,
  makeArrowSet,
  animateArrows,
  forceMat,
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
import { lever, cable } from "./set.js";
import { createHand } from "./hand.js";
import { T, D0, EV, DROP, SPLASH, LIGHTS_ON, dark, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);
const r = rng(2727);
const F = (geo, mat, amt = 0.06, seed = 1) => {
  const m = new THREE.Mesh(facet(geo, amt, seed), facetMat(mat));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
};
const sub = new THREE.Group(); // the whole sub; its centre is the origin of every rel shot
scene.add(sub);
const body = new THREE.Group(); // tilts / bobs inside `sub`
sub.add(body);

// ================================================================ the sub
// A chubby yellow research sub: fairing (x-ray shell), big front dome, the
// titanium sphere inside, skids, two stern thrusters, headlights, an arm
// with the cola can.
const fairMat = xrayMaterial(0xffc21a, { flatShading: true, roughness: 0.32 });
const finMat = xrayMaterial(0xff7a1a, { flatShading: true, roughness: 0.4 });
const XRAY = [fairMat, finMat];
{
  const shell = new THREE.Mesh(
    facet(jitter(new THREE.SphereGeometry(1, 18, 12), 0.015, 3), 0.05, 3),
    fairMat,
  );
  shell.scale.set(1.0, 0.92, 1.28);
  shell.castShadow = true;
  body.add(shell);
  // fin / conning tower with hatch
  const fin = new THREE.Mesh(
    facet(new THREE.BoxGeometry(0.5, 0.42, 0.9, 1, 1, 2), 0.05, 4),
    finMat,
  );
  fin.position.set(0, 0.95, -0.2);
  fin.castShadow = true;
  body.add(fin);
  const hatch = F(new THREE.CylinderGeometry(0.2, 0.22, 0.08, 10), M.alu, 0.04, 5);
  hatch.position.set(0, 1.2, -0.15);
  body.add(hatch);
  // lifting eye for the crane hook
  const eye = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.03, 6, 10), flat(0x2b2d33));
  eye.position.set(0, 1.32, -0.15);
  body.add(eye);
}
// the titanium sphere (seen in the x-ray) with its bolt ring
const titanMat = flat(0x9aa3ad, { metalness: 0.75, roughness: 0.3 });
const titan = new THREE.Group();
body.add(titan);
{
  const sph = F(new THREE.SphereGeometry(0.74, 20, 14), titanMat, 0.03, 6);
  titan.add(sph);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.75, 0.05, 6, 28),
    flat(0x6c747e, { metalness: 0.8, roughness: 0.35 }),
  );
  titan.add(ring);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 4), flat(0xd8dde3));
    b.position.set(Math.cos(a) * 0.79, Math.sin(a) * 0.79, 0);
    titan.add(b);
  }
  titan.visible = false;
}
// big front dome: the viewport, warm cockpit light inside
const domeMat = new THREE.MeshStandardMaterial({
  color: 0x9fe8ff,
  emissive: 0xffc27a,
  emissiveIntensity: 0.25,
  roughness: 0.05,
  metalness: 0.2,
  transparent: true,
  opacity: 0.75,
});
{
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.52, 16, 12), domeMat);
  dome.position.set(0, 0.08, 1.02);
  dome.scale.z = 0.7;
  body.add(dome);
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.52, 0.05, 6, 20),
    flat(0x2b2d33, { metalness: 0.5, roughness: 0.4 }),
  );
  rim.position.set(0, 0.08, 1.0);
  body.add(rim);
}
// skids
{
  const skidMat = flat(0x2b2d33, { roughness: 0.6 });
  for (const sx of [-1, 1]) {
    const rail = F(new THREE.CylinderGeometry(0.06, 0.06, 2.1, 6), skidMat, 0.04, 7);
    rail.rotation.x = Math.PI / 2;
    rail.position.set(sx * 0.6, -1.04, 0);
    body.add(rail);
    for (const z of [-0.6, 0.6]) {
      const strut = F(new THREE.BoxGeometry(0.07, 0.3, 0.07), skidMat, 0.04, 8);
      strut.position.set(sx * 0.6, -0.86, z);
      body.add(strut);
    }
  }
}
// stern thrusters with spinning props
const props = [];
{
  const shroudMat = flat(0x2b2d33, { roughness: 0.5, side: THREE.DoubleSide });
  for (const sx of [-1, 1]) {
    const g = new THREE.Group();
    g.position.set(sx * 0.78, -0.15, -1.1);
    body.add(g);
    const shroud = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.3, 12, 1, true),
      shroudMat,
    );
    shroud.rotation.x = Math.PI / 2;
    g.add(shroud);
    const p = new THREE.Group();
    g.add(p);
    for (let k = 0; k < 3; k++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.2, 0.02), flat(0xffd23f));
      blade.position.y = 0.1;
      const h = new THREE.Group();
      h.rotation.z = (k / 3) * Math.PI * 2;
      h.add(blade);
      p.add(h);
    }
    props.push(p);
    const arm = F(new THREE.BoxGeometry(0.4, 0.08, 0.1), flat(0x2b2d33), 0.04, 9);
    arm.position.set(-sx * 0.2, 0, 0.1);
    g.add(arm);
  }
}
// red marker light on the fin (blinks)
const markerMat = flat(0xff3b30, { emissive: 0xff2010, emissiveIntensity: 0 });
{
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), markerMat);
  m.position.set(0, 1.2, -0.55);
  body.add(m);
}
// headlights: lamp housings, real spot lights and soft visible beams
const lampMat = flat(0xfff6e0, { emissive: 0xfff2cc, emissiveIntensity: 0 });
const spots = [];
const beamMat = new THREE.MeshBasicMaterial({
  color: 0xfff1cf,
  transparent: true,
  opacity: 0,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  side: THREE.DoubleSide,
  fog: false,
});
for (const sx of [-1, 1]) {
  const housing = F(new THREE.CylinderGeometry(0.11, 0.13, 0.2, 8), flat(0x2b2d33), 0.04, 10);
  housing.rotation.x = Math.PI / 2;
  housing.position.set(sx * 0.62, -0.42, 1.0);
  body.add(housing);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.1, 10), lampMat);
  lens.position.set(sx * 0.62, -0.42, 1.105);
  body.add(lens);
  const spot = new THREE.SpotLight(0xfff0d0, 0, 22, 0.5, 0.55, 1.1);
  spot.position.set(sx * 0.62, -0.42, 1.1);
  spot.target.position.set(sx * 1.4, -2.2, 6.5);
  body.add(spot);
  body.add(spot.target);
  spots.push(spot);
  // visible beam: an open cone along the light's axis
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 2.0, 6.5, 14, 1, true), beamMat);
  const dir = spot.target.position.clone().sub(spot.position);
  beam.position.copy(spot.position).addScaledVector(dir.clone().normalize(), 3.25);
  beam.quaternion.setFromUnitVectors(V(0, -1, 0), dir.normalize());
  beam.userData.noAO = true;
  body.add(beam);
}
// manipulator arm + the cola can (red, unbranded) strapped to it
const CAN = V(0.98, -0.62, 1.12);
const canGroup = new THREE.Group();
canGroup.position.copy(CAN);
body.add(canGroup);
{
  const armMat = flat(0x2b2d33, { roughness: 0.5 });
  const a1 = F(new THREE.BoxGeometry(0.1, 0.1, 0.5), armMat, 0.04, 11);
  a1.position.set(0.72, -0.62, 0.78);
  a1.rotation.y = 0.5;
  body.add(a1);
  const strap = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.025, 6, 14), flat(0x1c1c1c));
  strap.rotation.x = Math.PI / 2;
  canGroup.add(strap);
}
// can: intact geometry morphs into a crushed copy (same vertices)
const canGeo = new THREE.CylinderGeometry(0.115, 0.115, 0.36, 16, 6);
const canPos = canGeo.attributes.position;
const can0 = Float32Array.from(canPos.array);
const canCrushed = new Float32Array(can0.length);
for (let i = 0; i < canPos.count; i++) {
  const x = can0[i * 3];
  const y = can0[i * 3 + 1];
  const z = can0[i * 3 + 2];
  const a = Math.atan2(z, x);
  const dent = 1 + 0.32 * Math.sin(a * 5 + y * 20) * (1 - Math.abs(y) / 0.2);
  const s = y > 0.17 || y < -0.17 ? 1.05 : dent * 0.55; // walls cave in, rims stay round
  canCrushed[i * 3] = x * s;
  canCrushed[i * 3 + 1] = y * 0.62 + Math.sin(a * 3) * 0.02;
  canCrushed[i * 3 + 2] = z * s;
}
const canMat = flat(0xd8262b, { metalness: 0.55, roughness: 0.28, flatShading: true });
const can = new THREE.Mesh(canGeo, canMat);
can.castShadow = true;
canGroup.add(can);
{
  const band = new THREE.Mesh(
    new THREE.CylinderGeometry(0.117, 0.117, 0.08, 16, 1, true),
    flat(0xf4f4f4),
  );
  band.userData.squashY = true;
  can.add(band);
  for (const y of [0.18, -0.18]) {
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 14), M.alu);
    lid.position.y = y;
    can.add(lid);
  }
}
function crushCan(k) {
  for (let i = 0; i < can0.length; i++) canPos.array[i] = lerp(can0[i], canCrushed[i], k);
  canPos.needsUpdate = true;
  canGeo.computeVertexNormals();
  for (const c of can.children) {
    if (c.userData.squashY) c.scale.set(1 - 0.35 * k, 1 - 0.4 * k, 1 - 0.35 * k);
    else c.position.y = Math.sign(c.position.y) * 0.18 * (1 - 0.38 * k);
  }
}

// ================================================================ hook: splash + bubbles
const SURF_Y = -1.6; // water surface in scene coordinates before the descent
const sprayMat = flat(0xffffff, { roughness: 0.3, transparent: true, opacity: 0.95 });
const spray = Array.from({ length: 34 }, () => {
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.07 + r() * 0.09, 0), sprayMat);
  m.userData = { a: r() * Math.PI * 2, v: 2.2 + r() * 3.2, out: 0.8 + r() * 1.6 };
  m.userData.noAO = true;
  scene.add(m);
  return m;
});
const foam = new THREE.Mesh(
  new THREE.RingGeometry(0.9, 1.5, 24),
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
  }),
);
foam.rotation.x = -Math.PI / 2;
foam.position.y = SURF_Y + 0.05;
scene.add(foam);
const bubbleMat = new THREE.MeshStandardMaterial({
  color: 0xe8fbff,
  emissive: 0x9fe8ff,
  emissiveIntensity: 0.25,
  transparent: true,
  opacity: 0.6,
  roughness: 0.05,
});
const bubbles = Array.from({ length: 40 }, (_, i) => {
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.05 + (i % 5) * 0.025, 1), bubbleMat);
  m.userData = { ph: r(), x: (r() - 0.5) * 1.6, z: (r() - 0.5) * 1.6, sp: 1.2 + r() * 1.4 };
  m.userData.noAO = true;
  sub.add(m);
  return m;
});

// ================================================================ the Everest tank
const ev = new THREE.Group();
ev.position.set(...EV);
scene.add(ev);
const tankW = 5.8;
const tankD = 3.0;
const evWater = new THREE.Mesh(
  new THREE.BoxGeometry(tankW, 1, tankD),
  new THREE.MeshStandardMaterial({
    color: 0x1f8fd0,
    emissive: 0x0a5f9a,
    emissiveIntensity: 0.35,
    transparent: true,
    opacity: 0.55,
    roughness: 0.1,
    depthWrite: false,
    fog: false,
  }),
);
evWater.userData.noAO = true;
ev.add(evWater);
{
  const rockMat = flat(0x7a6f66, { fog: false });
  const snowMat = flat(0xf7fbff, { fog: false });
  const mtn = new THREE.Mesh(
    facet(jitter(new THREE.ConeGeometry(2.5, 8.8, 9, 6), 0.22, 4), 0.12, 4),
    facetMat(rockMat),
  );
  mtn.position.y = 4.4;
  mtn.castShadow = true;
  ev.add(mtn);
  const cap = new THREE.Mesh(
    facet(jitter(new THREE.ConeGeometry(1.0, 3.5, 9, 2), 0.08, 5), 0.06, 5),
    facetMat(snowMat),
  );
  cap.position.y = 7.06;
  ev.add(cap);
  // a second, smaller peak beside it
  const m2 = new THREE.Mesh(
    facet(jitter(new THREE.ConeGeometry(1.4, 5, 7, 3), 0.15, 6), 0.1, 6),
    facetMat(rockMat),
  );
  m2.position.set(1.6, 2.5, -0.4);
  ev.add(m2);
  // pedestal + glass frame
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(tankW + 0.6, 0.5, tankD + 0.6),
    flat(0x2b2d33, { fog: false }),
  );
  base.position.y = -0.25;
  ev.add(base);
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(tankW, 12, tankD)),
    new THREE.LineBasicMaterial({ color: 0xbfefff, transparent: true, opacity: 0.8, fog: false }),
  );
  edges.position.y = 6;
  ev.add(edges);
  // flag on the summit
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.6, 4),
    flat(0x333333, { fog: false }),
  );
  pole.position.y = 9.1;
  ev.add(pole);
  const flag = new THREE.Mesh(
    new THREE.PlaneGeometry(0.4, 0.25),
    flat(0xff3b30, { side: THREE.DoubleSide, fog: false }),
  );
  flag.position.set(0.2, 9.27, 0);
  ev.add(flag);
}
const evSurf = new THREE.Mesh(
  new THREE.PlaneGeometry(tankW, tankD, 12, 6),
  new THREE.MeshStandardMaterial({
    color: 0x6fdcff,
    emissive: 0x3fb5ff,
    emissiveIntensity: 0.4,
    transparent: true,
    opacity: 0.8,
    flatShading: true,
    fog: false,
  }),
);
evSurf.rotation.x = -Math.PI / 2;
ev.add(evSurf);
ev.visible = false;

// ================================================================ deep-sea fish
// lanternfish: little glowing darts circling the sub once it is dark
const lanternCols = [0x7affff, 0xff8ad8, 0x9cff7a, 0x7ab8ff];
const lanterns = Array.from({ length: 16 }, (_, i) => {
  const g = new THREE.Group();
  const c = lanternCols[i % lanternCols.length];
  const fb = new THREE.Mesh(
    new THREE.ConeGeometry(0.07, 0.3, 5).rotateZ(-Math.PI / 2),
    flat(0x2a3440, { roughness: 0.4 }),
  );
  g.add(fb);
  for (let k = 0; k < 3; k++) {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.022, 5, 4),
      flat(c, { emissive: c, emissiveIntensity: 3 }),
    );
    dot.position.set(0.08 - k * 0.07, -0.04, 0.05);
    g.add(dot);
  }
  g.userData = {
    a: r() * Math.PI * 2,
    rad: 2.0 + r() * 1.6,
    y: (r() - 0.5) * 2.2,
    sp: 0.4 + r() * 0.3,
  };
  g.traverse((o) => (o.userData.noAO = true));
  sub.add(g);
  return g;
});
// anglerfish with its glowing lure, left of the sub
const angler = new THREE.Group();
angler.position.set(-2.2, 0.0, 1.2);
sub.add(angler);
const lureMat = flat(0xd8ff7a, { emissive: 0xc8ff5a, emissiveIntensity: 3.5 });
{
  const skin = flat(0x3a3236, { roughness: 0.7 });
  const head = F(jitter(new THREE.IcosahedronGeometry(0.42, 1), 0.05, 31), skin, 0.1, 31);
  head.scale.set(1.15, 0.9, 1.0);
  angler.add(head);
  const tail = F(new THREE.ConeGeometry(0.22, 0.5, 6), skin, 0.1, 32);
  tail.rotation.x = -Math.PI / 2;
  tail.position.z = -0.55;
  angler.add(tail);
  const fin = F(new THREE.ConeGeometry(0.2, 0.3, 4), skin, 0.1, 33);
  fin.rotation.x = -Math.PI / 2;
  fin.position.z = -0.85;
  fin.scale.x = 2;
  angler.add(fin);
  const mouth = new THREE.Mesh(new THREE.CircleGeometry(0.26, 10), flat(0x6a1a22));
  mouth.position.set(0, -0.08, 0.41);
  angler.add(mouth);
  const tooth = flat(0xf4f0e6);
  for (let k = 0; k < 9; k++) {
    const a = Math.PI * (0.1 + (k / 8) * 0.8);
    const t1 = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.11, 4), tooth);
    t1.position.set(Math.cos(a) * 0.22, -0.08 + Math.sin(a) * 0.17, 0.44);
    t1.rotation.z = a + Math.PI / 2;
    angler.add(t1);
    const t2 = t1.clone();
    t2.position.y = -0.08 - Math.sin(a) * 0.17;
    t2.rotation.z = a - Math.PI / 2;
    angler.add(t2);
  }
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), flat(0xf4f4f4));
    eye.position.set(sx * 0.2, 0.18, 0.3);
    angler.add(eye);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), flat(0x111111));
    pupil.position.set(sx * 0.21, 0.19, 0.35);
    angler.add(pupil);
  }
  const stalk = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        V(0, 0.35, 0.15),
        V(0, 0.75, 0.3),
        V(0, 0.8, 0.6),
        V(0, 0.62, 0.78),
      ]),
      12,
      0.018,
      5,
    ),
    skin,
  );
  angler.add(stalk);
  const lure = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), lureMat);
  lure.position.set(0, 0.58, 0.8);
  angler.add(lure);
  const lureLight = new THREE.PointLight(0xd8ff7a, 0, 2.2, 1.5);
  lureLight.position.copy(lure.position);
  angler.add(lureLight);
  angler.userData.light = lureLight;
}
angler.visible = false;
// the last fish: a pale snailfish beside the sub; it turns back at 8 km
const snail = new THREE.Group();
sub.add(snail);
{
  const mat = new THREE.MeshStandardMaterial({
    color: 0xf6c6cf,
    emissive: 0x7a3a48,
    emissiveIntensity: 0.25,
    roughness: 0.35,
    transparent: true,
    opacity: 0.88,
    flatShading: true,
  });
  const head = new THREE.Mesh(jitter(new THREE.IcosahedronGeometry(0.22, 1), 0.02, 41), mat);
  head.scale.set(1, 0.9, 1.1);
  snail.add(head);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.75, 7), mat);
  tail.rotation.x = -Math.PI / 2;
  tail.position.z = -0.45;
  snail.add(tail);
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 4), flat(0x1a1a1a));
    eye.position.set(sx * 0.13, 0.06, 0.17);
    snail.add(eye);
  }
}
snail.visible = false;

// ================================================================ water pressure: arrows + the box
const PR = [];
for (let i = 0; i < 10; i++) {
  const a = (i / 10) * Math.PI * 2;
  const tilt = i % 2 ? 0.45 : -0.35;
  const d = V(Math.cos(a) * Math.cos(tilt), Math.sin(tilt), Math.sin(a) * Math.cos(tilt));
  PR.push([d.clone().multiplyScalar(3.0), d.clone().multiplyScalar(1.55)]);
}
PR.push([V(0, 3.4, 0), V(0, 1.75, 0)]);
const pressure = makeArrowSet(PR, { parent: sub, mat: forceMat, amp: 0, r: 0.07 });
const crateGeo = new THREE.BoxGeometry(0.9, 0.9, 0.9, 4, 4, 4);
const cratePos = crateGeo.attributes.position;
const crate0 = Float32Array.from(cratePos.array);
const crateCrushed = new Float32Array(crate0.length);
for (let i = 0; i < cratePos.count; i++) {
  const x = crate0[i * 3];
  const y = crate0[i * 3 + 1];
  const z = crate0[i * 3 + 2];
  const n = Math.sin(x * 9 + y * 7) * Math.cos(z * 8 - y * 5);
  const s = 0.5 + 0.18 * n;
  crateCrushed[i * 3] = x * s;
  crateCrushed[i * 3 + 1] = y * (0.42 + 0.1 * n);
  crateCrushed[i * 3 + 2] = z * s;
}
const crate = new THREE.Mesh(
  crateGeo,
  flat(0x8fa3b5, { metalness: 0.45, roughness: 0.4, flatShading: true }),
);
crate.castShadow = true;
const crateG = new THREE.Group();
crateG.position.set(-2.6, 0.1, 0.5);
crateG.add(crate);
sub.add(crateG);
{
  // rivets / stripes so it reads as a metal box
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.12, 0.92), flat(0xffd23f));
  stripe.userData.box = true;
  crate.add(stripe);
}
function crushCrate(k) {
  for (let i = 0; i < crate0.length; i++) cratePos.array[i] = lerp(crate0[i], crateCrushed[i], k);
  cratePos.needsUpdate = true;
  crateGeo.computeVertexNormals();
  crate.children[0].scale.set(1 - 0.5 * k, 1 - 0.5 * k, 1 - 0.5 * k);
}

// ================================================================ the trench floor: amphipods, plastic bag
// they live in the moving column (ground), so they arrive with the seabed
const amphipods = [];
{
  const mat = flat(0xf3e2d8, { roughness: 0.45 });
  const legMat = flat(0xe0b8a8);
  for (let i = 0; i < 22; i++) {
    const g = new THREE.Group();
    for (let k = 0; k < 5; k++) {
      const seg = new THREE.Mesh(new THREE.SphereGeometry(0.045 - k * 0.004, 6, 5), mat);
      seg.scale.set(1, 0.85, 1.25);
      seg.position.set(0, 0.04 + Math.sin(k * 0.6) * 0.025, 0.07 - k * 0.055);
      seg.castShadow = true;
      g.add(seg);
    }
    for (let k = 0; k < 6; k++) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.07, 3), legMat);
      leg.position.set((k % 2 ? 1 : -1) * 0.04, 0.015, 0.05 - Math.floor(k / 2) * 0.05);
      leg.rotation.z = (k % 2 ? 1 : -1) * 0.7;
      g.add(leg);
    }
    for (const sx of [-1, 1]) {
      const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.12, 3), legMat);
      ant.position.set(sx * 0.02, 0.07, 0.15);
      ant.rotation.x = 1.0;
      ant.rotation.z = sx * 0.3;
      g.add(ant);
    }
    g.userData = {
      x: -0.8 + r() * 2.6,
      z: 1.7 + r() * 1.5,
      a: r() * Math.PI * 2,
      ph: r() * 6,
      s: 0.8 + r() * 0.5,
    };
    g.scale.setScalar(g.userData.s * 1.3);
    ground.add(g);
    amphipods.push(g);
  }
}
const bag = new THREE.Group();
bag.position.set(1.65, 0.12, 4.0);
ground.add(bag);
{
  const mat = new THREE.MeshStandardMaterial({
    color: 0xf4f6f8,
    emissive: 0x9fb4c8,
    emissiveIntensity: 0.15,
    transparent: true,
    opacity: 0.82,
    roughness: 0.35,
    flatShading: true,
    side: THREE.DoubleSide,
  });
  const b = new THREE.Mesh(jitter(new THREE.IcosahedronGeometry(0.32, 1), 0.08, 51), mat);
  b.scale.set(1.3, 0.45, 1.0);
  bag.add(b);
  for (const sx of [-1, 1]) {
    const h = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.025, 4, 10, Math.PI), mat);
    h.position.set(sx * 0.14, 0.12, -0.25);
    h.rotation.y = 0.3 * sx;
    bag.add(h);
  }
  bag.userData.b = b;
}

// ================================================================ payoff: your hand + a toy car on the nail
const hand2 = createHand({ scale: 2.2 });
{
  const nail = new THREE.Mesh(
    new THREE.BoxGeometry(0.075, 0.016, 0.085),
    flat(0xf6d6cf, { roughness: 0.25 }),
  );
  nail.position.set(0.155, 0.05, 0.71);
  hand2.group.children[0].add(nail);
}
const HAND2 = { pos: [-2.0, -D0 - 0.93, 3.8], rot: [0, Math.PI / 2, 0] };
const NAIL = V(-0.46, -D0 - 0.79, 3.46);
const car = new THREE.Group();
scene.add(car);
{
  const paint = flat(0x2f7fe8, { roughness: 0.3, metalness: 0.2 });
  const b1 = F(new THREE.BoxGeometry(0.42, 0.1, 0.2), paint, 0.04, 61);
  b1.position.y = 0.09;
  car.add(b1);
  const b2 = F(new THREE.BoxGeometry(0.22, 0.09, 0.18), paint, 0.04, 62);
  b2.position.set(-0.03, 0.18, 0);
  car.add(b2);
  const win = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.06, 0.185),
    flat(0x1d3550, { roughness: 0.1 }),
  );
  win.position.set(-0.03, 0.185, 0);
  car.add(win);
  for (const x of [-0.13, 0.13])
    for (const z of [-0.1, 0.1]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 10), flat(0x1c1c1c));
      w.rotation.x = Math.PI / 2;
      w.position.set(x, 0.045, z);
      car.add(w);
    }
  for (const z of [-0.06, 0.06]) {
    const hl = new THREE.Mesh(
      new THREE.BoxGeometry(0.01, 0.03, 0.04),
      flat(0xfff2cc, { emissive: 0xfff2cc, emissiveIntensity: 1.5 }),
    );
    hl.position.set(0.215, 0.1, z);
    car.add(hl);
  }
}
car.visible = false;

// ================================================================ the viewer's hand on the lever (frame 0)
const hand = createHand({ scale: 0.9 });
const KNOB = (a) => V(1.55, 0.55 + 0.72 * Math.cos(a), -2.65 + 0.72 * Math.sin(a));
const handAt = (a, dy = 0) => {
  const k = KNOB(a);
  return [k.x + 0.2, k.y - 0.05 + dy, k.z + 0.27];
};
const HROT = [0.15, -2.5, 0];

const applyCamera = shotCamera(shots);

// ================================================================ render
function renderAt(t) {
  // ---------------------------------------------------------------- hook: lever, drop, splash
  const pull = smooth(ramp(t, 0.08, DROP.at));
  lever.rotation.x = 0.9 * pull;
  hand.track(t, [
    { t: -0.6, pos: [2.4, 1.5, -1.6], rot: HROT, pose: "open" },
    { t: -0.05, pos: handAt(0, 0.02), rot: HROT, pose: "grab" },
    { t: 0.08, pos: handAt(0), rot: HROT, pose: "grab" },
    { t: DROP.at, pos: handAt(0.9), rot: HROT, pose: "grab" },
    { t: T.wenn, pos: handAt(0.9, 0.05), rot: HROT, pose: "grab", out: true },
  ]);
  const fall = clampFall(t);
  sub.position.y = -D0 * fall;
  cable.visible = t < DROP.at;
  // after the drop: a gentle bob, nose tips down when the vents blow
  const settle = ramp(t, DROP.end, DROP.end + 0.6);
  body.position.y = Math.sin(t * 1.3) * 0.04 * settle - Math.sin(Math.PI * settle) * 0.25;
  body.rotation.x =
    0.18 *
    smooth(ramp(t, T.hebel + 0.1, T.hebel + 0.9)) *
    (1 - smooth(ramp(t, T.trotzdem - 1.5, T.trotzdem)));
  body.rotation.z = Math.sin(t * 0.9) * 0.025;
  for (const p of props) p.rotation.z = t > DROP.end ? t * 14 : 0;
  markerMat.emissiveIntensity = t > DROP.end && (t * 0.8) % 1 < 0.18 ? 3 : 0.2;
  // splash
  const sk = t - SPLASH;
  spray.forEach((m) => {
    const u = m.userData;
    m.visible = sk > 0 && sk < 1.1 && t < T.wenn;
    if (!m.visible) return;
    const outR = 1.0 + u.out * sk;
    m.position.set(Math.cos(u.a) * outR, SURF_Y + u.v * sk - 4.9 * sk * sk, Math.sin(u.a) * outR);
  });
  foam.material.opacity = sk > 0 && t < T.wenn ? 0.85 * (1 - ramp(sk, 0.2, 1.4)) : 0;
  foam.scale.setScalar(1 + sk * 1.2);
  // bubbles stream up from the sub while it sinks (strongest after the splash)
  const bubK = Math.max(1 - ramp(t, 1.0, 5.0), 0.9 * pop(t, T.hebel + 0.1, T.hebel + 1.8));
  bubbles.forEach((m) => {
    const u = m.userData;
    const k = (t * 0.6 * u.sp + u.ph) % 1;
    m.visible = t > SPLASH && bubK > 0.02;
    m.position.set(u.x + Math.sin(t * 3 + u.ph * 9) * 0.08, -0.2 + k * 3.6, u.z - 0.3);
    m.scale.setScalar(bubK * (0.6 + k));
  });

  // ---------------------------------------------------------------- Everest tank
  ev.visible = t >= T.everest && t < T.erst;
  if (ev.visible) {
    const lvl = lerp(3.4, 10.9, smooth(ramp(t, T.everest + 0.4, T.verschwinden + 0.35)));
    evWater.scale.y = lvl;
    evWater.position.y = lvl / 2;
    evSurf.position.y = lvl + 0.01;
    evSurf.position.y += Math.sin(t * 3) * 0.03;
  }

  // ---------------------------------------------------------------- dark: headlights, fish
  const on = smooth(ramp(t, LIGHTS_ON, LIGHTS_ON + 0.15));
  const flick = t > LIGHTS_ON && t < LIGHTS_ON + 0.3 ? (Math.sin(t * 90) > 0 ? 1 : 0.4) : 1;
  spots.forEach((s) => (s.intensity = 38 * on * flick));
  lampMat.emissiveIntensity = 2.5 * on * flick;
  beamMat.opacity = 0.075 * on * dark(t);
  domeMat.emissiveIntensity = 0.25 + 0.6 * dark(t);
  const lanternK = pop(t, T.draussen - 0.4, T.ab - 0.3, 0.6);
  lanterns.forEach((g) => {
    const u = g.userData;
    g.visible = lanternK > 0;
    const a = u.a + t * u.sp;
    g.position.set(Math.cos(a) * u.rad, u.y + Math.sin(t + u.a) * 0.15, Math.sin(a) * u.rad + 0.3);
    g.rotation.y = -a;
    g.scale.setScalar(lanternK);
  });
  angler.visible = t >= T.draussen - 0.2 && t < T.folg;
  if (angler.visible) {
    angler.position.set(-2.2 + Math.sin(t * 0.7) * 0.1, Math.sin(t * 0.9) * 0.08, 1.2);
    angler.rotation.y = 0.35 + Math.sin(t * 0.6) * 0.1;
    const glow = 0.6 + 0.4 * Math.sin(t * 4);
    lureMat.emissiveIntensity = 2.5 + 1.5 * glow;
    angler.userData.light.intensity = 3 * glow;
  }

  // ---------------------------------------------------------------- the can
  // crunch in the slowmo (scene time runs at 0.3× from T.knack - 0.1)
  const crunch = smooth(ramp(t, T.knack, T.knack + 0.22));
  crushCan(crunch);
  canGroup.rotation.z = crunch * 0.25;
  puff("can", t, T.knack + 0.05, ...sub.localToWorld(CAN.clone()).toArray(), 0.6, 0xe8fbff);

  // ---------------------------------------------------------------- water pressure
  animateArrows(pressure, t, pop(t, T.wasserdruck - 0.1, T.kiste - 0.2));
  // the box: pops in, crumples, ✕, goes
  const boxIn = t >= T.kiste - 0.1 && t < T.dein + 0.3;
  crateG.visible = boxIn;
  if (boxIn) {
    crateG.scale
      .copy(squash(t, T.kiste - 0.1))
      .multiplyScalar(1 - inBack(ramp(t, T.dein - 0.05, T.dein + 0.25)));
    crateG.position.y = 0.1 + Math.sin(t * 1.4) * 0.05;
    crateG.rotation.y = 0.5 + t * 0.15;
    crushCrate(smooth(ramp(t, T.zerknuellen, T.zerknuellen + 0.28)));
  }
  showNope(pop(t, T.zerknuellen + 0.35, T.dein - 0.1), -2.6, -D0 + 1.0, 0.5, 0.6);

  // ---------------------------------------------------------------- x-ray: the titanium sphere
  const xr =
    smooth(ramp(t, T.dein - 0.05, T.dein + 0.45)) *
    (1 - smooth(ramp(t, T.rate - 0.25, T.rate + 0.05)));
  setXray(XRAY, xr);
  titan.visible = xr > 0.02;

  // ---------------------------------------------------------------- the last fish
  snail.visible = t >= T.ab - 0.3 && t < T.trotzdem;
  if (snail.visible) {
    const turn = smooth(ramp(t, T.fisch - 0.1, T.fisch + 0.5));
    const flee = ramp(t, T.fisch + 0.4, T.fisch + 1.6);
    snail.position.set(
      1.9 - Math.sin(t * 0.8) * 0.15 - flee * 0.8,
      0.3 + flee * flee * 3.5,
      0.5 + flee * 1.2,
    );
    snail.rotation.y = -Math.PI / 2 + turn * Math.PI;
    snail.rotation.x = -flee * 0.9;
    snail.children[1].rotation.y = Math.sin(t * 9) * 0.25;
  }
  showNope(
    Math.max(
      pop(t, T.zerknuellen + 0.35, T.dein - 0.1) * 0, // (first ✕ drawn above)
      pop(t, T.fisch + 0.3, T.trotzdem - 0.15),
    ),
    ...(t > T.fisch ? [1.7, -D0 + 0.7, 0.6, 0.55] : [-2.6, -D0 + 1.0, 0.5, 0.6]),
  );

  // ---------------------------------------------------------------- touchdown + amphipods
  puff("land", t, T.trotzdem, 0, -D0 - 1.1, 0, 1.8, 0xb8ad95);
  amphipods.forEach((g, i) => {
    const u = g.userData;
    const walk = t * 0.12 * (0.6 + (i % 3) * 0.3);
    g.position.set(u.x + Math.cos(u.a + walk) * 0.25, 0.01, u.z + Math.sin(u.a + walk) * 0.2);
    g.rotation.y = -(u.a + walk);
    g.children.forEach((c, k) => {
      if (k >= 5 && k < 11) c.rotation.x = Math.sin(t * 14 + k + u.ph) * 0.5;
    });
  });

  // ---------------------------------------------------------------- payoff: hand + car
  hand2.track(t, [
    {
      t: T.ganz2 - 0.15,
      pos: [HAND2.pos[0] - 1.2, HAND2.pos[1] + 0.9, HAND2.pos[2] + 0.4],
      rot: HAND2.rot,
      pose: "open",
    },
    {
      t: T.ganz2 + 0.35,
      pos: [HAND2.pos[0], HAND2.pos[1] + 0.12, HAND2.pos[2]],
      rot: HAND2.rot,
      pose: "point",
    },
    { t: T.ganz2 + 0.75, pos: HAND2.pos, rot: HAND2.rot, pose: "point" },
    { t: T.fakt + 0.25, pos: HAND2.pos, rot: HAND2.rot, pose: "point" },
    {
      t: T.fakt + 0.8,
      pos: [HAND2.pos[0] - 1.6, HAND2.pos[1] + 0.8, HAND2.pos[2]],
      rot: HAND2.rot,
      pose: "open",
      out: true,
    },
  ]);
  puff("hand", t, T.ganz2 + 0.75, NAIL.x - 0.6, -D0 - 1.05, NAIL.z + 0.2, 0.8, 0xb8ad95);
  car.visible = t >= T.fingernaegel - 0.1 && t < T.fakt + 0.8;
  if (car.visible) {
    const drop = ramp(t, T.ein, T.ein + 0.3);
    const h = 1.5 * (1 - drop * drop);
    const hover = (1 - ramp(t, T.ein, T.ein + 0.05)) * Math.sin(t * 2.4) * 0.06;
    car.position.set(NAIL.x, NAIL.y + 0.01 + h + hover, NAIL.z);
    car.rotation.set(0, 0.35, (1 - drop) * 0.15);
    const imp = t - T.auto;
    car.scale.set(1, imp > 0 && imp < 0.3 ? 1 - 0.2 * Math.sin((imp / 0.3) * Math.PI) : 1, 1);
    car.scale.multiplyScalar(smooth(ramp(t, T.fingernaegel - 0.1, T.fingernaegel + 0.25)));
  }

  // ---------------------------------------------------------------- Übrigens: the bag
  bag.userData.b.rotation.y = Math.sin(t * 0.7) * 0.15;
  bag.position.y = 0.12 + Math.sin(t * 1.1) * 0.03;
  bag.visible = t > T.trotzdem - 1;

  // ---------------------------------------------------------------- LED panels (one at a time)
  if (t >= T.fahrt && t < T.vier)
    showPanel(pop(t, T.fahrt, T.vier, 0.25), "FAHRT NACH UNTEN", "? ? ?", LED.yellow);
  else if (t >= T.vier && t < T.dann4)
    showPanel(pop(t, T.vier, T.dann4, 0.25), "FAHRT NACH UNTEN", "4 STUNDEN", LED.yellow);
  else if (t >= T.elf && t < T.ab)
    showPanel(pop(t, T.elf, T.ab), "ÜBER DIR", "11 KM WASSER", LED.blue);
  else if (t >= T.acht && t < T.trotzdem)
    showPanel(pop(t, T.acht, T.trotzdem), "AB 8 KM", "KEIN FISCH", LED.red);
  else if (t >= T.auto && t < T.fakt + 0.6)
    showPanel(pop(t, T.auto, T.fakt + 0.6), "AUF DEINEM NAGEL", "≈ 1 TONNE", LED.yellow);
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
function clampFall(t) {
  const x = ramp(t, DROP.at, DROP.end);
  return x * x;
}

start(renderAt);
