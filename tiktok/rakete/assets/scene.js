// #28 "Raketen-Landung": a reusable booster falls engine-first out of space
// onto a landing ship in the Atlantic. Story: hook burn high above the
// clouds → you on the deck, sonic boom, it falls out of the clouds → its
// own fire brakes it → grid fins steer it → guess the speed (faster than a
// Formula 1 car) → mid twist: it cannot hover (the test goes back up, x-ray:
// weakest thrust > weight) → suicide burn just above the deck, too early /
// too late → legs out, touchdown at zero → 37 flights → drone pull-back.
import {
  THREE,
  ramp,
  smooth,
  clamp01,
  lerp,
  outBack,
  pop,
  V,
  rng,
  scene,
  camera,
  flat,
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
  onFrame,
} from "./world.js";
import "./set.js";
import { gauge, readout, meter, counter, viewfinder } from "./hud.js";
import { T, shots as SHOTS, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);

// the booster's position; shots / labels with rel "B" follow it
const BP = V(0, 140, 0);
const shots = SHOTS.map((s) => (s.rel === "B" ? { ...s, rel: BP } : s));
const applyCamera = shotCamera(shots, 1);

// ---------------------------------------------------------------- booster
// Origin = where the legs touch the deck. Body r 0.38 from y 0.8 to 5.0
// (black interstage on top), 9 engines below, 4 grid fins at the top,
// 4 landing legs hinged at the bottom (folded up along the body).
const booster = new THREE.Group();
scene.add(booster);
const R = 0.38;
const BODY_Y0 = 0.8;
const BODY_Y1 = 5.0;
const bodyMat = xrayMaterial(0xf3f2ee, { roughness: 0.3, metalness: 0.08 });
const bodyGeo = new THREE.CylinderGeometry(R, R, BODY_Y1 - BODY_Y0, 28, 1, true);
bodyGeo.translate(0, (BODY_Y0 + BODY_Y1) / 2, 0);
const body = new THREE.Mesh(bodyGeo, bodyMat);
body.castShadow = true;
booster.add(body);
const bodyEdges = xrayEdges(new THREE.CylinderGeometry(R, R, BODY_Y1 - BODY_Y0, 14, 1, true));
bodyEdges.position.y = (BODY_Y0 + BODY_Y1) / 2;
booster.add(bodyEdges);
const interMat = xrayMaterial(0x1d1f24, { roughness: 0.45 });
const inter = new THREE.Mesh(
  new THREE.CylinderGeometry(R + 0.006, R + 0.006, 0.62, 28, 1, true),
  interMat,
);
inter.position.y = BODY_Y1 - 0.31;
booster.add(inter);
const capMat = xrayMaterial(0x2a2d33, { roughness: 0.6 });
const cap = new THREE.Mesh(new THREE.CircleGeometry(R, 28), capMat);
cap.rotation.x = -Math.PI / 2;
cap.position.y = BODY_Y1 - 0.02;
booster.add(cap);
// a thin dark band + small thruster pods near the top
const bandMat = xrayMaterial(0x2b2e35, { roughness: 0.5 });
const band = new THREE.Mesh(
  new THREE.CylinderGeometry(R + 0.008, R + 0.008, 0.06, 28, 1, true),
  bandMat,
);
band.position.y = 1.55;
booster.add(band);
const shellMats = [bodyMat, interMat, capMat, bandMat];

// soot: a dark, streaky shell that grows on after the burn (vertex alpha)
const sootMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  vertexColors: true,
  transparent: true,
  depthWrite: false,
  roughness: 0.8,
  opacity: 0,
});
{
  const g = new THREE.CylinderGeometry(R + 0.004, R + 0.004, 3.58, 56, 18, true);
  g.translate(0, BODY_Y0 + 1.79, 0);
  const p = g.attributes.position;
  const col = new Float32Array(p.count * 4);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const a = Math.atan2(z, x);
    const streak = 0.5 + 0.5 * Math.sin(a * 7 + Math.sin(a * 3) * 2);
    const n = Math.sin(a * 23 + y * 1.3) * 0.5 + 0.5;
    const low = 1 - clamp01((y - BODY_Y0) / 3.4); // heavier at the bottom
    const side = 0.55 + 0.45 * Math.cos(a - 2.3); // one side dirtier (the lee)
    const alpha = clamp01((0.25 + 0.75 * low) * side * (0.55 + 0.3 * streak + 0.25 * n));
    col.set([0.16, 0.13, 0.11, alpha * 0.92], i * 4);
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 4));
  const soot = new THREE.Mesh(g, sootMat);
  booster.add(soot);
}

// engines: octaweb + 9 bells (centre + ring of 8)
const nozMat = new THREE.MeshStandardMaterial({
  color: 0x3a3b40,
  metalness: 0.7,
  roughness: 0.35,
  emissive: 0xff5a1a,
  emissiveIntensity: 0,
  side: THREE.DoubleSide,
});
const octa = new THREE.Mesh(
  new THREE.CylinderGeometry(R, R * 0.95, 0.1, 28),
  flat(0x34363c, { roughness: 0.6 }),
);
octa.position.y = BODY_Y0 - 0.03;
booster.add(octa);
const ENG = [[0, 0]];
for (let i = 0; i < 8; i++) {
  const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
  ENG.push([Math.cos(a) * 0.245, Math.sin(a) * 0.245]);
}
const NOZ_Y = 0.42;
for (const [x, z] of ENG) {
  const n = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.1, 0.33, 14, 1, true), nozMat);
  n.position.set(x, NOZ_Y + 0.165, z);
  booster.add(n);
}

// flames: per engine an inner white-yellow core + an outer orange cone
// (additive, unlit), pointing down from the bell; 3 engines for the burns
// high up, the centre one for the landing.
const fireCore = new THREE.MeshBasicMaterial({
  color: 0xfff1c2,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  fog: false,
});
const fireOuter = new THREE.MeshBasicMaterial({
  color: 0xff7a26,
  transparent: true,
  opacity: 0.75,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  fog: false,
});
const coneDown = (r, h) => {
  const g = new THREE.ConeGeometry(r, h, 16, 1, true);
  g.rotateX(Math.PI);
  g.translate(0, -h / 2, 0);
  return g;
};
const flames = ENG.slice(0, 1)
  .concat([ENG[1], ENG[5]])
  .map(([x, z], i) => {
    const g = new THREE.Group();
    g.position.set(x, NOZ_Y, z);
    const outer = new THREE.Mesh(coneDown(0.15, 1), fireOuter);
    const core = new THREE.Mesh(coneDown(0.075, 1), fireCore);
    g.add(outer, core);
    // shock diamonds along the core
    const dia = [];
    for (let k = 0; k < 3; k++) {
      const d = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 6), fireCore);
      d.scale.set(1, 0.55, 1);
      g.add(d);
      dia.push(d);
    }
    booster.add(g);
    return { g, outer, core, dia, seed: i * 1.7 };
  });
// the plume that wraps around the lower body when it burns at high speed
const engulfMat = new THREE.MeshBasicMaterial({
  color: 0xff8a24,
  transparent: true,
  opacity: 0.3,
  depthWrite: false,
  side: THREE.DoubleSide,
  fog: false,
});
const engulf = new THREE.Group();
{
  const pts = [];
  for (let k = 0; k <= 12; k++) {
    const f = k / 12;
    pts.push(new THREE.Vector2(0.42 + Math.sin(f * Math.PI) * 0.5 + f * 0.12, 0.25 + f * 1.9));
  }
  const geo = new THREE.LatheGeometry(pts, 24);
  engulf.add(new THREE.Mesh(geo, engulfMat));
  const inner = new THREE.Mesh(geo, engulfMat);
  inner.scale.set(0.72, 0.8, 0.72);
  engulf.add(inner);
}
booster.add(engulf);
const fireLight = new THREE.PointLight(0xff9a40, 0, 40, 1.4);
fireLight.position.y = -0.4;
booster.add(fireLight);

// grid fins: titanium lattice plates, folded up flat against the
// interstage; they swing out to stick out sideways
const titan = new THREE.MeshStandardMaterial({ color: 0x8e9196, metalness: 0.7, roughness: 0.38 });
function gridFin() {
  const g = new THREE.Group();
  const W = 0.5; // tangential width
  const L = 0.55; // outward span
  const bar = (w, d, x, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.07, d), titan);
    m.position.set(x, 0, z);
    m.castShadow = true;
    g.add(m);
  };
  bar(L, 0.03, L / 2, -W / 2);
  bar(L, 0.03, L / 2, W / 2);
  bar(0.03, W, L, 0);
  bar(0.03, W, 0.02, 0);
  for (let k = 1; k < 5; k++) bar(0.012, W, (k / 5) * L, 0);
  for (let k = 1; k < 4; k++) bar(L, 0.012, L / 2, -W / 2 + (k / 4) * W);
  return g;
}
const FIN_Y = 4.4;
const fins = [0, 1, 2, 3].map((i) => {
  const a = (i / 4) * Math.PI * 2;
  const pivot = new THREE.Group();
  pivot.position.set(Math.cos(a) * (R + 0.02), FIN_Y, Math.sin(a) * (R + 0.02));
  pivot.rotation.y = -a;
  const hinge = new THREE.Group();
  pivot.add(hinge);
  const steer = new THREE.Group();
  hinge.add(steer);
  steer.add(gridFin());
  booster.add(pivot);
  return { hinge, steer, i };
});

// landing legs: black carbon struts hinged at the bottom, folded up along
// the body; they swing down and out (118°) so the feet stand on the deck
const legMat = flat(0x1b1d22, { roughness: 0.45, metalness: 0.2 });
const LEG_L = 2.1;
const legs = [0, 1, 2, 3].map((i) => {
  const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
  const pivot = new THREE.Group();
  pivot.position.set(Math.cos(a) * (R + 0.03), 0.95, Math.sin(a) * (R + 0.03));
  pivot.rotation.y = -a;
  const hinge = new THREE.Group();
  pivot.add(hinge);
  const g = new THREE.BoxGeometry(0.1, LEG_L, 0.17);
  g.translate(0, LEG_L / 2, 0);
  const leg = new THREE.Mesh(g, legMat);
  leg.castShadow = true;
  hinge.add(leg);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.06, 12), flat(0x3a3d44));
  foot.position.y = LEG_L;
  hinge.add(foot);
  booster.add(pivot);
  return { hinge, foot };
});

// x-ray inside: two tanks, almost empty (a little fuel at the bottom of each)
const inside = new THREE.Group();
booster.add(inside);
{
  const wall = new THREE.MeshStandardMaterial({
    color: 0xdfe6ee,
    roughness: 0.4,
    transparent: true,
    opacity: 0.35,
  });
  const tank = (y0, y1, liquid) => {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, y1 - y0, 20, 1, true), wall);
    c.position.y = (y0 + y1) / 2;
    inside.add(c);
    const fuel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.29, 0.29, 0.16, 20),
      flat(liquid, { emissive: liquid, emissiveIntensity: 0.35 }),
    );
    fuel.position.y = y0 + 0.09;
    inside.add(fuel);
  };
  tank(2.75, 4.3, 0x3fa9ff); // liquid oxygen
  tank(1.0, 2.6, 0xff8a2b); // kerosene
}
inside.visible = false;

// ---------------------------------------------------------------- fireball
// The "what if": the booster hits the deck too fast. Fire balls swell and
// fade, black smoke rolls up, debris flies out.
const fb = new THREE.Group();
scene.add(fb);
const fireBalls = [];
const smokeBalls = [];
const debris = [];
{
  const r = rng(77);
  const geo = new THREE.IcosahedronGeometry(1, 1);
  const cols = [0xfff2b0, 0xffc04a, 0xff7a26, 0xff4a1a];
  for (let i = 0; i < 16; i++) {
    const m = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({
        color: cols[i % 4],
        transparent: true,
        depthWrite: false,
        fog: false,
      }),
    );
    const dir = V(r() - 0.5, r() * 0.9 + 0.1, r() - 0.5).normalize();
    m.userData = { dir, s: 0.7 + r() * 0.9, d: 0.6 + r() * 1.8 };
    fb.add(m);
    fireBalls.push(m);
  }
  for (let i = 0; i < 12; i++) {
    const m = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({
        color: 0x2c2a2e,
        roughness: 1,
        flatShading: true,
        transparent: true,
        depthWrite: false,
      }),
    );
    m.userData = { x: (r() - 0.5) * 3, z: (r() - 0.5) * 3, s: 1 + r() * 1.2, ph: r() };
    fb.add(m);
    smokeBalls.push(m);
  }
  const dGeo = new THREE.BoxGeometry(0.25, 0.08, 0.4);
  for (let i = 0; i < 14; i++) {
    const m = new THREE.Mesh(dGeo, flat(i % 3 ? 0xe9e7e2 : 0x1d1f24));
    const a = r() * Math.PI * 2;
    m.userData = {
      vx: Math.cos(a) * (3 + r() * 5),
      vz: Math.sin(a) * (3 + r() * 5),
      vy: 4 + r() * 6,
      spin: r() * 9,
    };
    fb.add(m);
    debris.push(m);
  }
}
const fbLight = new THREE.PointLight(0xff8a3a, 0, 60, 1.2);
fbLight.position.set(0, 2, 0);
fb.add(fbLight);
function fireball(k) {
  fb.visible = k >= 0 && k < 3.2;
  if (!fb.visible) return;
  const grow = 1 - Math.pow(1 - clamp01(k / 0.55), 3);
  const fade = 1 - clamp01((k - 0.6) / 1.6);
  for (const m of fireBalls) {
    const u = m.userData;
    m.position
      .copy(u.dir)
      .multiplyScalar(grow * u.d * 1.4)
      .add(V(0, 0.6 + k * 0.8, 0));
    m.scale.setScalar(Math.max(0.001, u.s * (0.3 + 1.8 * grow) * (0.6 + 0.4 * fade)));
    m.material.opacity = 0.95 * fade;
  }
  for (const m of smokeBalls) {
    const u = m.userData;
    const s = clamp01((k - 0.25) / 2.6);
    m.position.set(u.x * (0.5 + s), 1 + s * 6 + u.ph * 2, u.z * (0.5 + s));
    m.scale.setScalar(Math.max(0.001, u.s * (0.6 + 2.2 * s)));
    m.material.opacity = 0.85 * clamp01(k / 0.4) * (1 - s);
  }
  for (const m of debris) {
    const u = m.userData;
    const tt = Math.min(k, 1.6);
    m.position.set(u.vx * tt, Math.max(0.05, 0.5 + u.vy * tt - 4.9 * tt * tt), u.vz * tt);
    m.rotation.set(u.spin * tt, u.spin * 0.7 * tt, 0);
  }
  fbLight.intensity = 80 * fade * grow;
}

// ---------------------------------------------------------------- deck blast
// When the flame hits the deck: a ring of grey-white exhaust racing outward.
const blastMat = new THREE.MeshBasicMaterial({
  color: 0xf4efea,
  transparent: true,
  depthWrite: false,
});
const blast = [];
{
  const geo = new THREE.IcosahedronGeometry(1, 0);
  for (let i = 0; i < 20; i++) {
    const m = new THREE.Mesh(geo, blastMat);
    m.userData.a = (i / 20) * Math.PI * 2 + (i % 2) * 0.13;
    scene.add(m);
    blast.push(m);
  }
}
function deckBlast(k, t) {
  blastMat.opacity = 0.42 * k;
  for (const m of blast) {
    m.visible = k > 0.01;
    if (!m.visible) continue;
    const a = m.userData.a;
    const ph = (t * 1.3 + a * 0.37) % 1;
    const r = 0.6 + ph * 4.2;
    m.position.set(Math.cos(a) * r, 0.25 + ph * 0.5, Math.sin(a) * r);
    m.scale.setScalar(0.12 + ph * 0.32);
  }
}
// steam after touchdown: puffs rising from the hot engines
const steamMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  depthWrite: false,
});
const steam = [];
{
  const geo = new THREE.IcosahedronGeometry(1, 0);
  for (let i = 0; i < 10; i++) {
    const m = new THREE.Mesh(geo, steamMat);
    m.userData.ph = i / 10;
    scene.add(m);
    steam.push(m);
  }
}
function steamUp(k, t) {
  steamMat.opacity = 0.3 * k;
  for (const m of steam) {
    m.visible = k > 0.01;
    if (!m.visible) continue;
    const ph = (t * 0.35 + m.userData.ph) % 1;
    const a = m.userData.ph * 17;
    m.position.set(
      Math.cos(a) * (0.35 + ph * 0.9),
      0.2 + ph * 1.1,
      Math.sin(a) * (0.35 + ph * 0.9),
    );
    m.scale.setScalar(0.1 + ph * 0.32);
  }
}

// ---------------------------------------------------------------- you
// A small low-poly "you" in a hoodie on the deck (the story frame).
const you = new THREE.Group();
scene.add(you);
const youHead = new THREE.Group();
const arms = [];
{
  const hood = flat(0x4a7bd6, { roughness: 0.8 });
  const jeans = flat(0x2d3a55);
  const skin = flat(0xf1c09a, { roughness: 0.7 });
  for (const s of [-1, 1]) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.24, 0.085), jeans);
    l.position.set(s * 0.05, 0.12, 0);
    you.add(l);
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.04, 0.13), flat(0xf4f4f4));
    shoe.position.set(s * 0.05, 0.02, 0.02);
    you.add(shoe);
  }
  const torso = new THREE.Mesh(
    facet(new THREE.BoxGeometry(0.2, 0.24, 0.12), 0.06, 4),
    facetMat(hood),
  );
  torso.position.y = 0.36;
  you.add(torso);
  for (const s of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(s * 0.125, 0.46, 0);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 0.07), hood);
    arm.position.y = -0.1;
    pivot.add(arm);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), skin);
    hand.position.y = -0.22;
    pivot.add(hand);
    you.add(pivot);
    arms.push({ pivot, s });
  }
  youHead.position.y = 0.5;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 9), skin);
  head.position.y = 0.06;
  youHead.add(head);
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    flat(0x3b2a20),
  );
  hair.position.y = 0.075;
  hair.rotation.x = -0.25;
  youHead.add(hair);
  you.add(youHead);
  you.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });
  you.scale.setScalar(1.25);
}

// ---------------------------------------------------------------- race car
const car = new THREE.Group();
scene.add(car);
const wheels = [];
{
  const red = flat(0xe8202a, { roughness: 0.35, metalness: 0.2 });
  const black = flat(0x1c1c20, { roughness: 0.7 });
  const bodyC = new THREE.Mesh(
    facet(new THREE.BoxGeometry(1.1, 0.13, 0.26), 0.05, 2),
    facetMat(red),
  );
  bodyC.position.y = 0.13;
  car.add(bodyC);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.42, 6), red);
  nose.rotation.z = -Math.PI / 2;
  nose.position.set(0.74, 0.12, 0);
  car.add(nose);
  const fw = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.62), black);
  fw.position.set(0.86, 0.05, 0);
  car.add(fw);
  const rw = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.56), red);
  rw.position.set(-0.56, 0.36, 0);
  car.add(rw);
  for (const s of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.2, 0.03), black);
    post.position.set(-0.56, 0.25, s * 0.18);
    car.add(post);
  }
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), flat(0xffd23f));
  helmet.position.set(0.05, 0.26, 0);
  car.add(helmet);
  for (const [x, z, r] of [
    [0.48, 0.24, 0.1],
    [0.48, -0.24, 0.1],
    [-0.42, 0.25, 0.12],
    [-0.42, -0.25, 0.12],
  ]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.12, 12), black);
    w.rotation.x = Math.PI / 2;
    w.position.set(x, r, z);
    car.add(w);
    wheels.push(w);
  }
  // speed lines behind it
  const lineMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  for (let i = 0; i < 5; i++) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(1.4 + i * 0.3, 0.012, 0.012), lineMat);
    l.position.set(-1.4 - i * 0.2, 0.08 + i * 0.06, (i - 2) * 0.09);
    car.add(l);
  }
  car.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });
  car.scale.setScalar(1.8);
}

// ---------------------------------------------------------------- ghost tower block
// "hoch wie ein Hochhaus": a see-through 14-storey block next to the booster
const tower = new THREE.Group();
scene.add(tower);
{
  const H = BODY_Y1;
  const glass = new THREE.MeshStandardMaterial({
    color: 0x8fd3ff,
    transparent: true,
    opacity: 0.35,
    roughness: 0.2,
    depthWrite: false,
  });
  const box = new THREE.Mesh(new THREE.BoxGeometry(1.15, H, 1.0), glass);
  box.position.y = H / 2;
  tower.add(box);
  const lm = new THREE.LineBasicMaterial({ color: 0xd8f1ff, transparent: true, opacity: 0.9 });
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(box.geometry), lm);
  edges.position.y = H / 2;
  tower.add(edges);
  const pts = [];
  for (let f = 1; f < 14; f++) {
    const y = (f / 14) * H;
    pts.push(-0.575, y, 0.5, 0.575, y, 0.5, 0.575, y, 0.5, 0.575, y, -0.5);
  }
  const fl = new THREE.BufferGeometry();
  fl.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  tower.add(new THREE.LineSegments(fl, lm));
}

// ---------------------------------------------------------------- sonic boom
const boomMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  depthWrite: false,
  side: THREE.DoubleSide,
  fog: false,
});
const boom = new THREE.Mesh(new THREE.TorusGeometry(1, 0.05, 6, 64), boomMat);
boom.rotation.x = Math.PI / 2;
scene.add(boom);

// ---------------------------------------------------------------- space
// Up high the sky turns black: a dark dome around the camera, fading in
// with altitude, see-through below the horizon.
const space = new THREE.Mesh(
  new THREE.SphereGeometry(240, 32, 16),
  new THREE.ShaderMaterial({
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    fog: false,
    uniforms: { k: { value: 0 } },
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform float k; varying vec3 vDir;
      void main(){
        float h = vDir.y;
        float a = k * smoothstep(-0.02, 0.35, h);
        vec3 q = floor(vDir * 380.0);
        float st = fract(sin(dot(q, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
        vec3 c = mix(vec3(0.03, 0.05, 0.16), vec3(0.0, 0.0, 0.02), smoothstep(0.1, 0.8, h));
        c += step(0.9975, st) * 0.8 * smoothstep(0.15, 0.4, h);
        gl_FragColor = vec4(c, a);
        #include <colorspace_fragment>
      }`,
  }),
);
space.renderOrder = -1;
scene.add(space);

// ---------------------------------------------------------------- force arrows (x-ray test)
const thrustArrow = makeArrowSet([[V(0.95, 4.0, 0), V(0.95, 9.4, 0)]], {
  mat: forceMat,
  amp: 0,
  r: 0.07,
});
const weightArrow = makeArrowSet([[V(-0.95, 8.6, 0), V(-0.95, 5.0, 0)]], {
  mat: new THREE.MeshBasicMaterial({ color: 0x4fc3ff, transparent: true, depthWrite: false }),
  amp: 0,
  r: 0.07,
});

// ---------------------------------------------------------------- the booster's story
// Pure function of (scene) time: where it is and what it does.
function boosterAt(t) {
  const s = {
    tilt: 0,
    x: 0,
    z: 0,
    y: 0,
    vis: true,
    burn: 0,
    engines: 3,
    engulf: 0,
    legs: 0,
    fins: 1,
    hot: 0,
    xray: 0,
    nope: 0,
  };
  if (t < T.auf1) {
    // hook: high above the clouds, burning, engine first
    Object.assign(s, { y: 140 - 2.5 * t, burn: 1, engulf: 0.85, fins: 0, hot: 1 });
  } else if (t < T.metallturm) {
    s.vis = false;
  } else if (t < T.dann) {
    // out of the clouds, straight at you; the bottom still glows. Seen from
    // the deck it comes in at an angle (from straight below a rocket is
    // only a dot), the side shot of the tower block keeps it high
    if (t >= T.hoch && t < T.stuerzt) Object.assign(s, { y: 40, fins: 0, hot: 0.6 });
    else {
      const early = t < T.hoch;
      const u = early ? ramp(t, T.metallturm, T.hoch) : ramp(t, T.stuerzt, T.dann);
      Object.assign(
        s,
        early ? { x: -1.5, z: -1.5, y: lerp(15, 13, u) } : { x: -1, z: -1, y: lerp(11, 8.5, u) },
      );
      Object.assign(s, { fins: 0, hot: 0.6, tilt: 0.08 });
    }
  } else if (t < T.folg) {
    // money shot: the burn
    const on = smooth(ramp(t, T.brennt + 0.05, T.brennt + 0.3));
    Object.assign(s, {
      y: 38 - 3 * (t - T.dann),
      burn: on,
      engulf: on,
      fins: 0,
      hot: 0.6 + 0.4 * on,
    });
  } else if (t < T.aber) {
    Object.assign(s, { y: lerp(34, 31, ramp(t, T.folg, T.aber)), fins: 0, hot: 0.5 });
  } else if (t < T.rate) {
    Object.assign(s, { y: lerp(31, 24, ramp(t, T.aber, T.rate)), fins: 0, hot: 0.3 });
  } else if (t < T.schneller) {
    // fly-by: it shoots past the camera
    s.y = lerp(27, 13, ramp(t, T.rate, T.schneller));
  } else if (t < T.verrueckte) {
    s.y = lerp(7.4, 6.4, ramp(t, T.schneller, T.verrueckte));
  } else if (t < T.selbst) {
    // the hover test: it lights up, stops — and goes back up
    const z = T.ghostZuend;
    if (t < z) s.y = lerp(10.5, 6.0, ramp(t, T.verrueckte, z));
    else {
      const d = t - z;
      s.burn = smooth(clamp01(d / 0.12));
      s.engines = 1;
      // decelerate (v 3 → 0 in 0.35 s), then accelerate upwards
      s.y = d < 0.35 ? 6.0 - 3 * d + (3 / 0.7) * d * d : 5.475 + 0.5 * 9 * (d - 0.35) ** 2;
    }
    s.nope = pop(t, z + 0.45, T.selbst);
  } else if (t < T.also) {
    // x-ray: hovering in the diagram, flame on
    Object.assign(s, {
      y: 5 + Math.sin(t * 2) * 0.05,
      burn: 0.7,
      engines: 1,
      xray: smooth(ramp(t, T.selbst, T.selbst + 0.35)) * (1 - ramp(t, T.also - 0.3, T.also)),
    });
  } else if (t < T.zuendet) {
    s.y = lerp(22, 14.5, ramp(t, T.also, T.zuendet));
  } else if (t < T.frueh) {
    const u = ramp(t, T.zuendet, T.frueh);
    Object.assign(s, {
      y: 5.5 + 9 * Math.pow(1 - u, 1.5),
      burn: smooth(clamp01((t - T.zuendet) / 0.12)),
      engines: 1,
    });
  } else if (t < T.spaet) {
    // too early: it stops in the air and climbs again
    const d = t - T.frueh;
    Object.assign(s, {
      y: d < 0.5 ? 9 - 1.2 * d + 1.2 * d * d : 8.7 + 1.6 * (d - 0.5) ** 2,
      burn: 1,
      engines: 1,
    });
    s.nope = pop(t, T.frueh + 0.75, T.spaet);
  } else if (t < T.bumm) {
    // too late: it slams into the deck
    const u = ramp(t, T.spaet, T.bumm);
    Object.assign(s, {
      y: 9 * (1 - u * u),
      burn: smooth(ramp(t, T.spaet + 0.3, T.spaet + 0.4)),
      engines: 1,
    });
  } else if (t < T.vier) {
    s.vis = false;
  } else {
    // the real landing: legs out, zero exactly at the deck
    const u = ramp(t, T.vier, T.landen);
    const after = t - T.landen;
    Object.assign(s, {
      y: 2.2 * Math.pow(1 - u, 1.6),
      burn: after < 0 ? 1 : Math.max(0, 1 - after / 0.18),
      engines: 1,
      legs: outBack(ramp(t, T.vier + 0.05, T.vier + 0.38)),
      hot: after < 0 ? 1 : Math.max(0.15, 1 - after / 6),
    });
  }
  // the fins fold out on "klappen" and stay out
  if (t >= T.aber && t < T.rate) s.fins = 0;
  return s;
}

const tmpLabels = LABELS.map((l) => ({ ...l }));

// ---------------------------------------------------------------- render
function renderAt(t) {
  const s = boosterAt(t);
  BP.set(s.x, s.y, s.z);
  booster.position.copy(BP);
  booster.visible = s.vis;
  // a slight wobble while falling free
  booster.rotation.z = s.y > 0.01 ? Math.sin(t * 1.7) * 0.012 - s.tilt * 0.7 : 0;
  booster.rotation.x = -s.tilt * 0.7;

  // flames
  const fl = (k) => 0.88 + 0.12 * Math.sin(t * 47 + k) * Math.sin(t * 31.7 + k * 2);
  flames.forEach((f, i) => {
    const on = i === 0 || s.engines === 3 ? s.burn : 0;
    f.g.visible = on > 0.01 && s.vis;
    if (!f.g.visible) return;
    const len = (s.engulf > 0.3 ? 2.2 : 3.1) * on * fl(f.seed);
    f.outer.scale.set(on * (1 + 0.2 * s.engulf), len, on * (1 + 0.2 * s.engulf));
    f.core.scale.set(on, len * 0.62, on);
    fireOuter.opacity = 0.7;
    f.dia.forEach((d, k) => {
      d.position.y = -(0.35 + k * 0.42) * len * 0.33;
      d.visible = s.engulf < 0.3;
    });
  });
  engulf.visible = s.engulf > 0.01 && s.vis;
  engulf.scale.set(
    1 + 0.08 * Math.sin(t * 23),
    s.engulf * (0.95 + 0.1 * Math.sin(t * 17)),
    1 + 0.08 * Math.sin(t * 19 + 1),
  );
  engulfMat.opacity = 0.32 * s.engulf;
  fireLight.intensity = 60 * s.burn;
  nozMat.emissiveIntensity = 1.4 * s.hot;

  // fins: fold out one after another on "klappen", steer a little later
  fins.forEach((f) => {
    let k = s.fins;
    if (t >= T.klappen1 && t < T.rate)
      k = outBack(ramp(t, T.klappen1 + 0.2 + f.i * 0.13, T.klappen1 + 0.55 + f.i * 0.13));
    f.hinge.rotation.z = (1 - k) * (Math.PI / 2);
    f.steer.rotation.x = t > T.gitterflossen ? Math.sin(t * 2.4 + f.i * 1.6) * 0.32 : 0;
  });
  legs.forEach((l) => {
    l.hinge.rotation.z = (-s.legs * (118 * Math.PI)) / 180;
    l.foot.scale.setScalar(Math.max(0.001, clamp01(s.legs * 1.5)));
  });

  // soot after the first burn
  sootMat.opacity = smooth(ramp(t, T.brennt + 0.4, T.brennt + 1.6)) * (s.xray > 0.02 ? 0 : 1);
  setXray(shellMats, s.xray);
  inside.visible = s.xray > 0.05;
  animateArrows(thrustArrow, t, s.xray > 0.5 ? pop(t, T.selbst + 0.25, T.also) : 0);
  animateArrows(weightArrow, t, s.xray > 0.5 ? pop(t, T.selbst + 0.8, T.also) : 0);
  showNope(s.nope, 0, s.y + 2.6, 0.9, 1.1);

  // fireballs: the hook's "what if" and "zu spät – Bumm"
  const fbK =
    t >= T.explodiert && t < T.stell
      ? t - T.explodiert - 0.05
      : t >= T.bumm && t < T.vier
        ? t - T.bumm
        : -1;
  fireball(fbK);
  // exhaust racing over the deck when the flame is close
  deckBlast(s.vis ? s.burn * clamp01((3.5 - s.y) / 2) : 0, t);
  steamUp(
    t >= T.landen && t < T.cta + 1
      ? smooth(ramp(t, T.landen, T.landen + 0.3)) * (1 - 0.6 * ramp(t, T.darum, T.fakt))
      : 0,
    t,
  );
  puff("touch", t, T.landen, 0, 0.05, 0, 2.2);

  // you on the deck: story (9–21 s) and the CTA
  const youOn = (t >= T.stell && t < T.aber) || t >= T.cta;
  you.visible = youOn;
  if (t >= T.cta) {
    you.position.set(2.1, 0, 2.2);
    you.rotation.y = -2.4;
    youHead.rotation.x = -0.55;
  } else {
    you.position.set(2.7, 0, 2.5);
    you.rotation.y = 2.75;
    const look = smooth(ramp(t, T.knall + 0.1, T.knall + 0.5));
    youHead.rotation.x = -0.75 * look;
  }
  const duck = t >= T.stuerzt && t < T.aber ? smooth(ramp(t, T.stuerzt, T.stuerzt + 0.3)) : 0;
  const wave =
    t >= T.cta ? Math.max(0, Math.sin((t - T.cta) * 6)) * ramp(t, T.cta + 0.3, T.cta + 0.6) : 0;
  arms.forEach((a) => {
    a.pivot.rotation.z = a.s * (0.12 + duck * 2.6) + (a.s > 0 ? wave * 2.4 : 0);
  });

  // race car across the deck
  const cu = ramp(t, T.schneller + 0.1, T.schneller + 1.5);
  car.visible = t >= T.schneller && t < T.verrueckte && cu > 0 && cu < 1;
  car.position.set(lerp(-5.5, 5.5, cu), 0, 1.4);
  wheels.forEach((w) => (w.rotation.y = t * 60));

  // ghost tower block next to the booster
  tower.visible = t >= T.hoch && t < T.stuerzt;
  if (tower.visible) {
    tower.position.set(1.9, s.y + 0.1, 0.2);
    tower.scale.copy(squash(t, T.hoch + 0.1));
  }
  // sonic boom ring
  const bk = ramp(t, T.knall - 0.05, T.knall + 0.9);
  boom.visible = bk > 0 && bk < 1;
  boom.position.set(1.2, 26, -1.5);
  boom.scale.setScalar(2 + bk * 40);
  boomMat.opacity = 0.75 * (1 - bk);

  // HUD: device displays, max two at once
  if (t >= T.zielen && t < T.rate) {
    viewfinder(1, { label: "BOOSTER-KAMERA · ZIEL", time: "T+08:12" });
    readout("ziel", pop(t, T.zielen + 0.4, T.rate), {
      label: "Abweichung",
      value: Math.max(3, Math.round(lerp(40, 3, ramp(t, T.zielen + 0.4, T.zielen + 1.6)))),
      unit: "m",
      x: 60,
      y: 1100,
    });
  }
  if (t >= T.rate && t < T.verrueckte) {
    const v = Math.round(lerp(0, 900, smooth(ramp(t, T.rate + 0.3, T.schneller + 0.4))) / 10) * 10;
    gauge("tempo", pop(t, T.rate + 0.15, T.verrueckte), {
      label: "Tempo",
      value: v,
      max: 1000,
      unit: "km/h",
      x: 600,
      y: 400,
    });
    if (t >= T.schneller)
      readout("f1", pop(t, T.schneller + 0.2, T.verrueckte), {
        label: "Formel 1",
        value: "≈ 350",
        unit: "km/h",
        x: 60,
        y: 420,
      });
  }
  if (t >= T.selbst && t < T.also) {
    meter("schub", pop(t, T.selbst + 0.3, T.also), {
      label: "Schwächster Schub",
      value: 0.86,
      color: "#ffd23f",
      text: "",
      x: 60,
      y: 1100,
    });
    meter("gew", pop(t, T.selbst + 0.85, T.also), {
      label: "Gewicht",
      value: 0.6,
      color: "#4fc3ff",
      text: "",
      x: 60,
      y: 1250,
    });
  }
  if ((t >= T.also && t < T.frueh) || (t >= T.vier && t < T.fakt)) {
    const real = t >= T.vier ? Math.max(0, s.y) : s.y;
    const h = Math.round((real * 60) / 10) * 10;
    // speed from the slope of the height curve (scene units → km/h, toy scale)
    // free fall ≈ 820 km/h; while burning v ∝ √height (constant braking)
    const kmh =
      t >= T.landen
        ? 0
        : t < T.zuendet
          ? 820
          : Math.round((400 * Math.sqrt(Math.max(0, h) / 870)) / 5) * 5;
    const k = t >= T.vier ? pop(t, T.vier, T.fakt) : pop(t, T.also + 0.2, T.frueh);
    const top = t >= T.vier; // the landing shots are low: displays up top
    readout("hoehe", k, { label: "Höhe", value: h, unit: "m", x: 60, y: top ? 420 : 1110 });
    gauge("tempo2", k, {
      label: "Tempo",
      value: kmh,
      max: 1000,
      unit: "km/h",
      x: top ? 660 : 590,
      y: top ? 400 : 1080,
    });
  }
  if (t >= T.fakt && t < T.cta) {
    counter("fl", pop(t, T.fakt + 0.2, T.cta), {
      label: "Flüge",
      value: Math.round(lerp(1, 37, smooth(ramp(t, T.fakt + 0.4, T.mal37 + 0.15)))),
      x: 60,
      y: 1100,
    });
  }

  // labels (rel "B" ones follow the booster)
  tmpLabels.forEach((l, i) => {
    const src = LABELS[i];
    l.pos = src.rel === "B" ? [src.pos[0] + s.x, src.pos[1] + s.y, src.pos[2] + s.z] : src.pos;
  });
  labels(t, tmpLabels);

  applyCamera(t);
  // dark sky up high
  space.position.copy(camera.position);
  space.material.uniforms.k.value = 0.92 * smooth(ramp(camera.position.y, 55, 120));
  renderFrame();
}

void onFrame;
start(renderAt);
