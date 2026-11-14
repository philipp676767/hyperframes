// #85 "Fußball auf dem Mond" (format B). An astronaut kicks a football on
// frame 0 — and it flies the whole video: up over the craters, past the
// Earth arc (where air would have stopped it), for "almost half a minute"
// (stopwatch + a selfie gag), dead straight (the Bananenflanke curve gets a
// ✕), until it lands five football pitches away on the payoff word.
// Übrigens: the golf balls an astronaut left on the Moon (Apollo 14, 1971).
// The world (mare plain, lander, rover, goal, the Earth) is in set.js.
import {
  THREE,
  ramp,
  smooth,
  clamp01,
  lerp,
  pop,
  V,
  scene,
  camera,
  real,
  roundedBox,
  showNope,
  forceMat,
  puff,
  labels,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { heightAt } from "./set.js";
import { stopwatch, counter } from "./hud.js";
import { T, KICK, LAND, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);

// ---------------------------------------------------------------- shadows follow the action
// the key light's shadow box is ±11 m: slide it to wherever the camera looks
let key = null;
scene.traverse((o) => {
  if (o.isDirectionalLight && o.castShadow) key = o;
});
const KEY_OFF = key ? key.position.clone().normalize().multiplyScalar(22) : V(0, 0, 0);
if (key) scene.add(key.target);
const fwd = V(0, 0, 0);
function followShadows() {
  if (!key) return;
  camera.getWorldDirection(fwd);
  const d = camera.position.y > 20 ? 0 : 7;
  const f = camera.position.clone().addScaledVector(fwd, d);
  f.y = heightAt(f.x, f.z);
  key.target.position.copy(f);
  key.position.copy(f).add(KEY_OFF);
}

// ---------------------------------------------------------------- materials
const suit = real.fabric(0xf1efe8);
const suitShade = real.fabric(0xdcd8cc);
const hard = real.plastic(0xf4f4f2, { roughness: 0.35 });
const metal = real.metal(0xbfc6ce, { roughness: 0.28 });
const darkM = real.rubber(0x2b2e34);
const red = real.plastic(0xc8352b, { roughness: 0.4 });
const goldVisor = new THREE.MeshPhysicalMaterial({
  color: 0xe0a83a,
  metalness: 1,
  roughness: 0.08,
  clearcoat: 1,
  clearcoatRoughness: 0.05,
});

// ---------------------------------------------------------------- the astronaut
// real scale, feet at y = 0, front = +z (the group is turned to kick along -z)
const astro = new THREE.Group();
scene.add(astro);
const body = new THREE.Group(); // everything that bobs with the hop
astro.add(body);
const mk = (geo, mat, x, y, z, parent = body) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};
const UP = V(0, 1, 0);
function placeSeg(m, a, b) {
  const d = b.clone().sub(a);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(UP, d.normalize());
}
// two-bone solve: start S, target H, lengths, pole direction
function solve(S, H, L1, L2, pole0) {
  const d = H.clone().sub(S);
  const dist = Math.min(d.length(), L1 + L2 - 0.001);
  const dir = d.normalize();
  const a = (L1 * L1 - L2 * L2 + dist * dist) / (2 * dist);
  const h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const pole = pole0.clone();
  pole.addScaledVector(dir, -pole.dot(dir)).normalize();
  const E = S.clone().addScaledVector(dir, a).addScaledVector(pole, h);
  const Wp = S.clone().addScaledVector(dir, dist);
  return [E, Wp];
}

// legs: thigh + shin + knee + boot, solved per frame
function makeLeg(s) {
  const thigh = mk(new THREE.CylinderGeometry(0.105, 0.09, 1, 40), suit, 0, 0, 0);
  const shin = mk(new THREE.CylinderGeometry(0.088, 0.078, 1, 40), suit, 0, 0, 0);
  const knee = mk(new THREE.SphereGeometry(0.095, 32, 20), suitShade, 0, 0, 0);
  const ring = mk(new THREE.TorusGeometry(0.084, 0.012, 12, 40), suitShade, 0, 0, 0);
  const stripe = s > 0 ? mk(new THREE.TorusGeometry(0.1, 0.012, 10, 40), red, 0, 0, 0) : null;
  const boot = new THREE.Group();
  body.add(boot);
  mk(roundedBox(0.16, 0.14, 0.34, 0.05), suitShade, 0, -0.03, 0.06, boot);
  mk(roundedBox(0.165, 0.035, 0.345, 0.014), darkM, 0, -0.095, 0.06, boot);
  mk(roundedBox(0.12, 0.05, 0.08, 0.02), hard, 0, 0.0, 0.2, boot); // toe cap
  const HIP = V(s * 0.13, 0.96, 0);
  return (F, pitch = 0) => {
    const [Kn, A] = solve(HIP, F, 0.46, 0.44, V(0, 0.1, 1));
    placeSeg(thigh, HIP, Kn);
    thigh.scale.y = 0.46;
    placeSeg(shin, Kn, A);
    shin.scale.y = 0.44;
    knee.position.copy(Kn);
    placeSeg(ring, Kn.clone().lerp(A, 0.45), A);
    ring.rotateX(Math.PI / 2);
    if (stripe) {
      placeSeg(stripe, HIP.clone().lerp(Kn, 0.55), Kn);
      stripe.rotateX(Math.PI / 2);
    }
    boot.position.copy(A);
    boot.rotation.set(-pitch, 0, 0);
  };
}
const legR = makeLeg(1);
const legL = makeLeg(-1);

// hips, torso, chest box, backpack
mk(roundedBox(0.44, 0.24, 0.3, 0.09), suit, 0, 1.0, 0);
mk(new THREE.TorusGeometry(0.2, 0.02, 12, 48), metal, 0, 1.08, 0).rotation.x = Math.PI / 2;
mk(roundedBox(0.56, 0.5, 0.36, 0.13), suit, 0, 1.3, 0);
mk(roundedBox(0.5, 0.18, 0.37, 0.07), suitShade, 0, 1.12, 0);
{
  mk(roundedBox(0.28, 0.13, 0.11, 0.025), hard, 0, 1.24, 0.22);
  const lcd = new THREE.Mesh(
    new THREE.PlaneGeometry(0.08, 0.035),
    new THREE.MeshBasicMaterial({ color: 0x9be37f }),
  );
  lcd.position.set(-0.06, 1.26, 0.2815);
  lcd.userData.noAO = true;
  body.add(lcd);
  for (const [x, c] of [
    [0.04, darkM],
    [0.09, red],
  ])
    mk(new THREE.CylinderGeometry(0.018, 0.018, 0.03, 24), c, x, 1.24, 0.285).rotation.x =
      Math.PI / 2;
  for (const s of [-1, 1]) {
    const c = new THREE.CatmullRomCurve3([
      V(s * 0.12, 1.2, 0.25),
      V(s * 0.27, 1.14, 0.2),
      V(s * 0.3, 1.22, -0.05),
      V(s * 0.27, 1.27, -0.18),
    ]);
    mk(
      new THREE.TubeGeometry(c, 30, 0.012, 10),
      real.plastic(s > 0 ? 0x2f6fd0 : 0xd6d2c8),
      0,
      0,
      0,
    );
  }
  mk(roundedBox(0.09, 0.05, 0.005, 0.01), real.fabric(0x1d3d8a), 0.17, 1.42, 0.182);
}
mk(roundedBox(0.6, 0.72, 0.28, 0.07), hard, 0, 1.32, -0.32);
mk(roundedBox(0.5, 0.2, 0.05, 0.03), suitShade, 0, 1.47, -0.47);
for (const y of [1.1, 1.22]) mk(roundedBox(0.6, 0.012, 0.282, 0.005), metal, 0, y, -0.32);
mk(new THREE.TorusGeometry(0.17, 0.028, 16, 64), metal, 0, 1.53, 0.02).rotation.x = Math.PI / 2;
for (const s of [-1, 1]) mk(new THREE.SphereGeometry(0.12, 40, 24), suit, s * 0.32, 1.46, 0);

// arms (glove group returned so the phone can sit in the right one)
function makeArm(side) {
  const upper = mk(new THREE.CylinderGeometry(0.085, 0.078, 1, 36), suit, 0, 0, 0);
  const fore = mk(new THREE.CylinderGeometry(0.075, 0.066, 1, 36), suit, 0, 0, 0);
  const elbow = mk(new THREE.SphereGeometry(0.08, 32, 20), suitShade, 0, 0, 0);
  const glove = new THREE.Group();
  body.add(glove);
  mk(roundedBox(0.11, 0.06, 0.14, 0.028), real.rubber(0xe9e6de), 0, 0, 0.07, glove);
  const fingers = mk(
    roundedBox(0.105, 0.05, 0.07, 0.024),
    real.rubber(0xdcd8cf),
    0,
    -0.012,
    0.16,
    glove,
  );
  fingers.rotation.x = 0.45;
  mk(
    new THREE.CylinderGeometry(0.07, 0.07, 0.05, 32),
    real.plastic(0x2f6fd0),
    0,
    0,
    0,
    glove,
  ).rotation.x = Math.PI / 2;
  const S = V(side * 0.34, 1.44, 0);
  const set = (H) => {
    const [E, Wp] = solve(S, H, 0.31, 0.3, V(side * 0.8, -0.6, -0.3));
    placeSeg(upper, S, E);
    upper.scale.y = 0.31;
    placeSeg(fore, E, Wp);
    fore.scale.y = 0.3;
    elbow.position.copy(E);
    glove.position.copy(Wp);
    glove.quaternion.setFromUnitVectors(V(0, 0, 1), Wp.clone().sub(E).normalize());
  };
  return { set, glove };
}
const armR = makeArm(1);
const armL = makeArm(-1);

// phone for the selfie (in the right glove, screen towards the astronaut)
const phone = new THREE.Group();
mk(
  roundedBox(0.08, 0.16, 0.01, 0.012),
  real.plastic(0x1a1b1f, { roughness: 0.25 }),
  0,
  0,
  0,
  phone,
);
{
  const lens = new THREE.Mesh(
    new THREE.CircleGeometry(0.009, 20),
    new THREE.MeshBasicMaterial({ color: 0x0c0c10 }),
  );
  lens.position.set(-0.022, 0.06, -0.0055);
  lens.rotation.y = Math.PI;
  phone.add(lens);
  const scr = new THREE.Mesh(
    new THREE.PlaneGeometry(0.072, 0.15),
    new THREE.MeshBasicMaterial({ color: 0x7fb3ff }),
  );
  scr.position.z = 0.0056;
  scr.userData.noAO = true;
  phone.add(scr);
}
phone.position.set(0, 0.03, 0.13);
armR.glove.add(phone);

// helmet: white shell, closed gold visor (the Sun is out)
const helmet = new THREE.Group();
helmet.position.set(0, 1.69, 0.03);
body.add(helmet);
{
  mk(
    new THREE.SphereGeometry(0.212, 96, 64),
    new THREE.MeshPhysicalMaterial({
      color: 0xf5f5f3,
      roughness: 0.3,
      clearcoat: 0.6,
    }),
    0,
    0,
    0,
    helmet,
  );
  const visGeo = new THREE.SphereGeometry(0.218, 96, 48, 0, Math.PI * 2, 0, 1.15);
  visGeo.rotateX(Math.PI / 2 - 0.12);
  mk(visGeo, goldVisor, 0, 0, 0, helmet);
  const rim = mk(new THREE.TorusGeometry(0.2, 0.012, 12, 96), hard, 0, 0, 0, helmet);
  rim.position.set(0, 0.0, 0.0);
  rim.rotation.x = -0.12;
  rim.scale.set(1, 1, 1);
  for (const s of [-1, 1]) {
    mk(roundedBox(0.05, 0.05, 0.09, 0.012), hard, s * 0.215, 0.05, 0.02, helmet);
    const l = new THREE.Mesh(
      new THREE.CircleGeometry(0.017, 24),
      new THREE.MeshBasicMaterial({ color: 0xfff6dd }),
    );
    l.position.set(s * 0.215, 0.05, 0.066);
    helmet.add(l);
  }
}

// pose of the astronaut at time t (local coords, front +z)
const footRest = (s) => V(s * 0.13, 0.11, 0.06);
const tv = V(0, 0, 0);
function poseAstro(t) {
  // kick: from the backswing (frame 0) through the ball to the follow-through
  let F;
  let pitch = 0;
  if (t < KICK) {
    const k = smooth(clamp01(t / KICK));
    F = V(0.13, lerp(0.42, 0.14, k), lerp(-0.5, 0.32, k));
    pitch = lerp(-0.4, 0.1, k);
  } else if (t < KICK + 0.4) {
    const k = smooth((t - KICK) / 0.4);
    F = V(0.13, lerp(0.14, 0.78, k), lerp(0.32, 0.66, k));
    pitch = lerp(0.1, 0.6, k);
  } else {
    const k = smooth(clamp01((t - KICK - 0.4) / 2.2)); // slow, low gravity
    F = V(0.13, 0.78, 0.66).lerp(footRest(1), k);
    pitch = lerp(0.6, 0, k);
  }
  // the low-gravity hop after the kick
  const hk = clamp01((t - KICK - 0.15) / 1.8);
  const hop = Math.sin(hk * Math.PI) * 0.22;
  body.position.y = hop;
  legR(F.clone().setY(F.y - hop), pitch);
  legL(footRest(-1).setY(0.11 - hop * 0.6));
  // arms out for balance while kicking, then down; selfie from T.zeit
  const out = pop(t, -1, KICK + 2.4, 0.8);
  const selfie =
    clamp01((t - (T.minute + 0.3)) / 0.5) * (1 - clamp01((t - (T.selfie + 0.9)) / 0.5));
  tv.set(lerp(0.4, 0.62, out), lerp(1.0, 1.28, out), lerp(0.16, 0.08, out));
  armR.set(tv.clone().lerp(V(0.2, 1.9, 0.5), smooth(selfie)));
  armL.set(
    V(lerp(-0.4, -0.6, out), lerp(1.0, 1.24, out), lerp(0.16, 0.1, out)).lerp(
      V(-0.5, 1.82, 0.25),
      smooth(selfie),
    ),
  );
  phone.visible = selfie > 0.02;
  phone.lookAt(helmet.getWorldPosition(V(0, 0, 0)));
  // looks up after the ball, into the phone for the selfie
  helmet.rotation.x = lerp(-0.45 * smooth(ramp(t, KICK, KICK + 1)), 0.15, smooth(selfie));
  helmet.rotation.y = 0;
  // turned to kick along -z; turns round for the selfie and back again
  const turn =
    smooth(ramp(t, T.minute, T.minute + 0.5)) *
    (1 - smooth(ramp(t, T.selfie + 0.9, T.bananen - 0.15)));
  astro.rotation.y = Math.PI * (1 - turn);
}

// ---------------------------------------------------------------- the ball
const B0 = V(-0.13, 0.11, -0.45);
const RANGE = 158;
const APEX = 40;
const yLand = heightAt(-0.13, B0.z - RANGE) + 0.11;
function ballAt(t, out) {
  if (t < KICK) return out.copy(B0);
  const u = clamp01((t - KICK) / (LAND - KICK));
  if (t <= LAND)
    return out.set(B0.x, B0.y + (yLand - B0.y) * u + 4 * APEX * u * (1 - u), B0.z - RANGE * u);
  // after landing: a low hop and a short roll in the dust
  const r = t - LAND;
  const roll = 4 * (1 - Math.exp(-r * 1.4));
  const z = B0.z - RANGE - roll;
  const bounce = r < 1.4 ? Math.sin((r / 1.4) * Math.PI) * 0.9 : 0;
  return out.set(B0.x, heightAt(B0.x, z) + 0.11 + bounce, z);
}
// classic black-and-white ball: 12 dark patches around the icosahedron's corners
const ballGeo = new THREE.SphereGeometry(0.11, 64, 48);
{
  const ico = new THREE.IcosahedronGeometry(1, 0).attributes.position;
  const corners = [];
  for (let i = 0; i < ico.count; i++) {
    const c = V(ico.getX(i), ico.getY(i), ico.getZ(i)).normalize();
    if (!corners.some((q) => q.distanceTo(c) < 0.01)) corners.push(c);
  }
  const p = ballGeo.attributes.position;
  const col = new Float32Array(p.count * 3);
  const n = V(0, 0, 0);
  for (let i = 0; i < p.count; i++) {
    n.set(p.getX(i), p.getY(i), p.getZ(i)).normalize();
    const dark = corners.some((c) => c.dot(n) > 0.93);
    const seam = !dark && corners.some((c) => Math.abs(c.dot(n) - 0.8) < 0.012);
    const v = dark ? 0.05 : seam ? 0.55 : 0.95;
    col.set([v, v, v], i * 3);
  }
  ballGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
}
const ball = new THREE.Mesh(
  ballGeo,
  real.plastic(0xffffff, { vertexColors: true, roughness: 0.38 }),
);
ball.castShadow = true;
scene.add(ball);
// glow halo so the ball reads in the wide shots
const haloTex = (() => {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  const gr = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,240,180,1)");
  gr.addColorStop(0.25, "rgba(255,215,90,.55)");
  gr.addColorStop(1, "rgba(255,210,63,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
})();
const halo = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: haloTex,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }),
);
halo.userData.noAO = true;
scene.add(halo);

// the flight path as a yellow trail (drawn up to the ball)
const SEGS = 300;
const RAD = 8;
const pathPts = [];
for (let i = 0; i <= 60; i++) {
  const u = i / 60;
  pathPts.push(V(B0.x, B0.y + (yLand - B0.y) * u + 4 * APEX * u * (1 - u), B0.z - RANGE * u));
}
const trailGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pathPts), SEGS, 0.22, RAD);
const trailMat = new THREE.MeshBasicMaterial({
  color: 0xffd23f,
  transparent: true,
  opacity: 0.8,
  depthWrite: false,
});
const trail = new THREE.Mesh(trailGeo, trailMat);
trail.userData.noAO = true;
scene.add(trail);

// ---------------------------------------------------------------- comparison curves (blue = with air, Earth)
const blueMat = new THREE.MeshBasicMaterial({
  color: 0x4fc3ff,
  transparent: true,
  opacity: 0.9,
  depthWrite: false,
});
function curveMesh(pts, r) {
  const c = new THREE.CatmullRomCurve3(pts);
  const g = new THREE.TubeGeometry(c, 120, r, 8);
  const m = new THREE.Mesh(g, blueMat);
  m.userData.noAO = true;
  scene.add(m);
  return { c, g, m };
}
// on Earth: air brakes it — a short, steep arc
const earthArc = curveMesh(
  [B0.clone(), V(B0.x, 4.5, -7), V(B0.x, 7.2, -14), V(B0.x, 5.5, -20), V(B0.x, 0.11, -25)],
  0.16,
);
// the Bananenflanke: spin + air push it sideways
const curve = curveMesh(
  [B0.clone(), V(-1.2, 2.6, -9), V(-5, 4.2, -19), V(-11.5, 3.6, -29), V(-18, 0.6, -36)],
  0.12,
);
const ghostMat = new THREE.MeshStandardMaterial({
  color: 0x9fdcff,
  emissive: 0x2a8fd8,
  emissiveIntensity: 0.6,
  transparent: true,
  opacity: 0.85,
});
const ghost = new THREE.Mesh(new THREE.SphereGeometry(0.15, 32, 24), ghostMat);
scene.add(ghost);
const tmp = V(0, 0, 0);
function showCurve(cv, t, a, d) {
  const p = clamp01((t - a) / d);
  cv.m.visible = t >= a;
  cv.g.setDrawRange(0, Math.ceil(p * 120) * 8 * 6);
  return p;
}

// gravity arrow under the ball: starts Earth-long, shrinks to Moon-short
const arrow = new THREE.Group();
const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1, 16), forceMat);
const head = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 20), forceMat);
head.rotation.x = Math.PI;
arrow.add(shaft, head);
arrow.traverse((o) => (o.userData.noAO = true));
scene.add(arrow);

// ---------------------------------------------------------------- five pitches on the plain
const pitchMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0,
  depthWrite: false,
});
function ribbon(pts, w) {
  const pos = [];
  const idx = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0];
    const dz = b[1] - a[1];
    const l = Math.hypot(dx, dz) || 1;
    const nx = (-dz / l) * w * 0.5;
    const nz = (dx / l) * w * 0.5;
    for (const s of [-1, 1]) {
      const x = pts[i][0] + nx * s;
      const z = pts[i][1] + nz * s;
      pos.push(x, heightAt(x, z) + 0.3, z);
    }
    if (i) {
      const k = i * 2;
      idx.push(k - 2, k - 1, k, k - 1, k + 1, k);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
}
const line = (x0, z0, x1, z1, n = 24) =>
  Array.from({ length: n + 1 }, (_, i) => [lerp(x0, x1, i / n), lerp(z0, z1, i / n)]);
const ring = (cx, cz, r, n = 40) =>
  Array.from({ length: n + 1 }, (_, i) => [
    cx + Math.cos((i / n) * Math.PI * 2) * r,
    cz + Math.sin((i / n) * Math.PI * 2) * r,
  ]);
const PL = 31.6;
const PW = 20;
const pitches = [];
for (let i = 0; i < 5; i++) {
  const g = new THREE.Group();
  const z0 = -2 - i * PL + 1.0;
  const z1 = z0 - PL + 2.0;
  const x0 = B0.x - PW / 2;
  const x1 = B0.x + PW / 2;
  const zm = (z0 + z1) / 2;
  const parts = [
    line(x0, z0, x1, z0),
    line(x1, z0, x1, z1, 40),
    line(x1, z1, x0, z1),
    line(x0, z1, x0, z0, 40),
    line(x0, zm, x1, zm),
    ring(B0.x, zm, 2.6),
    line(B0.x - 5.8, z0, B0.x - 5.8, z0 - 4.7, 8),
    line(B0.x - 5.8, z0 - 4.7, B0.x + 5.8, z0 - 4.7, 12),
    line(B0.x + 5.8, z0 - 4.7, B0.x + 5.8, z0, 8),
    line(B0.x - 5.8, z1, B0.x - 5.8, z1 + 4.7, 8),
    line(B0.x - 5.8, z1 + 4.7, B0.x + 5.8, z1 + 4.7, 12),
    line(B0.x + 5.8, z1 + 4.7, B0.x + 5.8, z1, 8),
  ];
  for (const p of parts) g.add(new THREE.Mesh(ribbon(p, 0.5), pitchMat));
  // soft green turf glow inside each pitch
  const turf = new THREE.Mesh(
    ribbon(line(B0.x, z0, B0.x, z1, 30), PW),
    new THREE.MeshBasicMaterial({
      color: 0x3ddc84,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  );
  g.add(turf);
  g.userData.turf = turf;
  g.traverse((o) => (o.userData.noAO = true));
  g.visible = false;
  scene.add(g);
  pitches.push(g);
}

// ---------------------------------------------------------------- golf balls (Apollo 14)
const GOLF = V(-10.6, 0, -7.2);
GOLF.y = heightAt(GOLF.x, GOLF.z);
{
  const dimple = new THREE.SphereGeometry(0.0215, 48, 32);
  const dp = dimple.attributes.position;
  for (let i = 0; i < dp.count; i++) {
    const v = V(dp.getX(i), dp.getY(i), dp.getZ(i));
    const n = v.clone().normalize();
    const d = Math.sin(n.x * 40) * Math.sin(n.y * 40) * Math.sin(n.z * 40);
    v.multiplyScalar(1 - Math.max(0, d) * 0.035);
    dp.setXYZ(i, v.x, v.y, v.z);
  }
  dimple.computeVertexNormals();
  const golfMat = real.plastic(0xf4f2ec, { roughness: 0.45 });
  for (const [x, z, s] of [
    [0, 0, 1],
    [0.16, -0.11, 1],
  ]) {
    const b = new THREE.Mesh(dimple, golfMat);
    b.position.set(GOLF.x + x, heightAt(GOLF.x + x, GOLF.z + z) + 0.028 * s, GOLF.z + z);
    b.castShadow = true;
    scene.add(b);
  }
  // the improvised club: a tool handle with an iron head, lying in the dust
  const club = new THREE.Group();
  const sh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.009, 0.009, 0.9, 16),
    real.metal(0xc9ccd2),
  );
  sh.rotation.z = Math.PI / 2;
  club.add(sh);
  const grip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.014, 0.18, 16),
    real.rubber(0x24262b),
  );
  grip.rotation.z = Math.PI / 2;
  grip.position.x = -0.4;
  club.add(grip);
  const iron = new THREE.Mesh(
    roundedBox(0.075, 0.05, 0.012, 0.006),
    real.metal(0xdadde2, { roughness: 0.2 }),
  );
  iron.position.set(0.47, -0.012, 0);
  club.add(iron);
  club.traverse((o) => o.isMesh && (o.castShadow = true));
  club.position.set(GOLF.x - 0.1, GOLF.y + 0.016, GOLF.z - 0.3);
  club.rotation.y = 0.35;
  scene.add(club);
}

// ---------------------------------------------------------------- shots: resolve rel targets
const BALLV = V(0, 0, 0);
for (const s of shots) {
  if (s.rel === "ball") s.rel = BALLV;
  else if (s.rel === "golf") s.rel = GOLF;
}
const applyCamera = shotCamera(shots, 1);

// ---------------------------------------------------------------- renderAt
const bp = V(0, 0, 0);
const camTmp = V(0, 0, 0);
function renderAt(t) {
  poseAstro(t);

  // ball: flight, spin, kick dust
  ballAt(t, bp);
  ball.position.copy(bp);
  const fl = Math.max(0, Math.min(t, LAND) - KICK);
  ball.rotation.set(-fl * 9, fl * 2.2, 0);
  puff("kick", t, KICK, B0.x, 0.06, B0.z, 0.35, 0xcfc8bc);
  puff("land", t, LAND, bp.x, yLand, B0.z - RANGE, 6, 0xcfc8bc);

  // trail up to the ball (hidden in the opening close-up)
  const u = clamp01((Math.min(t, LAND) - KICK) / (LAND - KICK));
  trailGeo.setDrawRange(0, Math.ceil(u * SEGS) * RAD * 6);
  trailMat.opacity = t >= T.ohne && t < T.wenig ? 0.95 : 0.75;

  // the follow target for the "rel: ball" shots
  BALLV.copy(bp);

  // gravity arrow: Earth-long → Moon-short on "zieht"
  const av = pop(t, T.mond2 + 0.1, T.steigt);
  arrow.visible = av > 0;
  const len = lerp(2.6, 0.5, smooth(ramp(t, T.zieht, T.zieht + 0.6)));
  arrow.scale.setScalar(Math.max(0.01, av));
  shaft.scale.y = len;
  shaft.position.y = -0.2 - len / 2;
  head.position.y = -0.2 - len - 0.1;
  arrow.position.copy(bp);
  const gravityTip = bp.clone().add(V(0, -0.25 - len * 0.6, 0));

  // with air (Earth): short arc on "Erde", ghost ball thuds down
  const pe = showCurve(earthArc, t, T.erde2, 1.0);
  earthArc.m.visible = t >= T.erde2 && t < T.rate;
  // Bananenflanke curve
  const pc = showCurve(curve, t, T.bananen + 0.3, 1.5);
  curve.m.visible = t >= T.bananen + 0.3 && t < T.wenig;
  ghost.visible = false;
  if (earthArc.m.visible) {
    ghost.visible = true;
    earthArc.c.getPointAt(pe, tmp);
    ghost.position.copy(tmp);
  } else if (curve.m.visible) {
    ghost.visible = true;
    curve.c.getPointAt(pc, tmp);
    ghost.position.copy(tmp);
  }
  puff("earthThud", t, T.erde2 + 1.0, B0.x, 0.1, -25, 1.6, 0xcfc8bc);
  const curveMid = curve.c.getPointAt(0.62, V(0, 0, 0));
  showNope(pop(t, T.ohne + 0.9, T.wenig), curveMid.x, curveMid.y + 1.2, curveMid.z, 4.5);

  // stopwatch: "Rate mal, wie lange er fliegt" → fast eine halbe Minute
  const sw = pop(t, T.rate + 0.1, T.bananen);
  stopwatch("flug", sw, { seconds: u * 28.4, max: 30, label: "FLUGZEIT", x: 610, y: 430 });

  // five pitches light up one after another on "Fußballfelder"
  pitches.forEach((g, i) => {
    const a = T.felder - 0.1 + i * 0.16;
    const k = smooth(ramp(t, a, a + 0.25)) * (1 - ramp(t, T.fakt - 0.1, T.fakt));
    g.visible = k > 0;
    if (i === 0) pitchMat.opacity = 0.95;
    g.userData.turf.material.opacity = 0.28 * k;
    g.scale.y = 1;
  });
  const nPitch = Math.min(5, Math.max(0, Math.floor((t - (T.felder - 0.1)) / 0.16) + 1));
  counter("felder", pop(t, T.felder - 0.05, T.fakt), {
    label: "FUSSBALLFELDER",
    value: nPitch,
    x: 70,
    y: 400,
  });

  // halo: constant on-screen size, gone when the camera is close
  halo.position.copy(bp);
  // labels with live positions
  const pos = {
    gravity: gravityTip,
    earthArc: earthArc.c.getPointAt(0.5, V(0, 0, 0)).add(V(0, 0.4, 0)),
    curve: curve.c.getPointAt(0.45, V(0, 0, 0)),
    golfBall: V(GOLF.x, GOLF.y + 0.03, GOLF.z),
  };
  labels(
    t,
    LABELS.map((l) => ({ ...l, pos: pos[l.pos] ?? l.pos })),
  );

  applyCamera(t);
  camTmp.copy(camera.position);
  // camera-dependent bits only after the camera moved
  trail.visible =
    t > 1.15 &&
    t < T.fakt &&
    !(t >= T.bein && t < T.mond2) &&
    !(t >= T.zeit && t < T.bananen) &&
    camera.position.distanceTo(bp) > 9;
  const dCam = camera.position.distanceTo(bp);
  const hv = clamp01((dCam - 6) / 10) * (t > KICK + 0.6 && t < T.fakt ? 1 : 0);
  halo.visible = hv > 0;
  halo.scale.setScalar(dCam * 0.045);
  halo.material.opacity = hv;
  followShadows();
  renderFrame();
}
start(renderAt);
