// #81 Nicht blinzeln — a giant face buried in a desert dune; its eye is held
// open from frame 0. The tear film tears into dry spots (like a puddle in
// the sun), the eye goes red, floods with tears, everything blurs; the
// counter runs to 15.000 blinks a day; the cornea has no blood vessels and
// drinks tears, the lid wipes it like a windscreen wiper; payoff: the brain
// slams the lid shut. Übrigens: half an hour a day blind.
import {
  THREE,
  LOOK,
  ramp,
  smooth,
  lerp,
  pop,
  V,
  rng,
  scene,
  flat,
  real,
  roundedBox,
  ground,
  showNope,
  showPanel,
  LED,
  labels,
  puff,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import "./set.js";
import { createHand } from "./hand.js";
import { stopwatch, counter } from "./hud.js";
import { T, E, PUDDLE, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);

const D2R = Math.PI / 180;
const R = 1.5;
const EC = V(...E);
// direction around the gaze (+z): polar angle th from +z, azimuth ph in xy
const dir = (th, ph) => V(Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th));
const onEye = (th, ph, r = R) => dir(th, ph).multiplyScalar(r).add(EC);
// a sphere cap of angle a around +z
const capGeo = (r, a, ws = 64, hs = 24) =>
  new THREE.SphereGeometry(r, ws, hs, 0, Math.PI * 2, 0, a).rotateX(Math.PI / 2);

// ================================================================ the face
const skinCol = 0xd9996f;
const skinMat = real.skin(skinCol);
const face = new THREE.Group();
scene.add(face);
{
  // the big mound of the face, half in the sand
  const mound = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), skinMat);
  mound.scale.set(4.8, 3.4, 3.15);
  mound.position.set(0, 0.15, -1.4);
  mound.receiveShadow = true;
  mound.castShadow = true;
  face.add(mound);
  // brow ridge + cheek
  const brow = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32), skinMat);
  brow.scale.set(2.7, 0.75, 1.35);
  brow.position.set(0.1, 3.25, 0.15);
  brow.rotation.z = -0.06;
  face.add(brow);
  const cheek = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32), skinMat);
  cheek.scale.set(2.6, 1.0, 1.5);
  cheek.position.set(0.3, 0.05, 0.6);
  face.add(cheek);
  // eyebrow: dark hair strands along the brow ridge
  const hairMat = flat(0x3b2618, { roughness: 0.9 });
  const hg = new THREE.CylinderGeometry(0.018, 0.03, 0.42, 4).translate(0, 0.21, 0);
  const n = 420;
  const im = new THREE.InstancedMesh(hg, hairMat, n);
  const r = rng(181);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  for (let i = 0; i < n; i++) {
    const u = r();
    const x = -2.0 + u * 3.9;
    const arch = 0.35 * Math.sin(u * Math.PI) - 0.15 * u;
    const y = 3.35 + arch + (r() - 0.5) * 0.28;
    // point on the brow ellipsoid surface (front)
    const bx = (x - 0.1) / 2.7;
    const by = (y - 3.25) / 0.75;
    const zz = 0.15 + 1.35 * Math.sqrt(Math.max(0, 1 - bx * bx - by * by));
    e.set(-0.9 + (r() - 0.5) * 0.3, 0, -1.2 - u * 0.5 + (r() - 0.5) * 0.3);
    q.setFromEuler(e);
    m4.compose(V(x, y, zz - 0.02), q, V(1, 0.8 + r() * 0.5, 1));
    im.setMatrixAt(i, m4);
  }
  im.castShadow = true;
  face.add(im);
  // a few pores / freckles for the realistic close-ups
  const frMat = flat(0xb97a55, { roughness: 0.8 });
  for (let i = 0; i < 26; i++) {
    const x = (r() - 0.5) * 4;
    const y = 0.1 + r() * 0.8;
    const cx = (x - 0.3) / 2.6;
    const cy = (y - 0.05) / 1.0;
    const z = 0.6 + 1.5 * Math.sqrt(Math.max(0, 1 - cx * cx - cy * cy));
    if (z < 0.7) continue;
    const d = new THREE.Mesh(new THREE.CircleGeometry(0.03 + r() * 0.03, 8), frMat);
    d.position.set(x, y, z + 0.005);
    face.add(d);
  }
  // sand drifts piled against the face
  const sandMat = flat(0xe2b97f, { roughness: 1 });
  for (const [x, z, sx, sz] of [
    [-3.6, 0.8, 2.4, 1.8],
    [3.8, 0.4, 2.6, 2.0],
    [0, 2.0, 3.4, 1.2],
    [-1.5, -3.5, 3.0, 2.0],
  ]) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), sandMat);
    s.scale.set(sx, 0.45, sz);
    s.position.set(x, -0.12, z);
    s.receiveShadow = true;
    face.add(s);
  }
}

// ================================================================ the eye
const eye = new THREE.Group();
eye.position.copy(EC);
scene.add(eye);
const scleraMat = real.ceramic(0xf7f2ee, { roughness: 0.32, clearcoat: 0.5 });
const sclera = new THREE.Mesh(new THREE.SphereGeometry(R, 96, 64), scleraMat);
eye.add(sclera);
// iris: painted canvas (radial fibres, darker rim), pupil black
function irisTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d");
  const r = rng(77);
  const grd = g.createRadialGradient(256, 256, 40, 256, 256, 256);
  grd.addColorStop(0, "#7a5a2a");
  grd.addColorStop(0.28, "#5c9a8a");
  grd.addColorStop(0.75, "#3f86b8");
  grd.addColorStop(1, "#173a5c");
  g.fillStyle = grd;
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 700; i++) {
    const a = r() * Math.PI * 2;
    const r0 = 60 + r() * 40;
    const r1 = 150 + r() * 100;
    g.strokeStyle = `rgba(${r() > 0.5 ? "220,240,255" : "20,40,70"},${0.1 + r() * 0.25})`;
    g.lineWidth = 1 + r() * 2;
    g.beginPath();
    g.moveTo(256 + Math.cos(a) * r0, 256 + Math.sin(a) * r0);
    g.lineTo(256 + Math.cos(a + (r() - 0.5) * 0.1) * r1, 256 + Math.sin(a) * r1);
    g.stroke();
  }
  g.strokeStyle = "rgba(10,20,40,0.85)";
  g.lineWidth = 22;
  g.beginPath();
  g.arc(256, 256, 245, 0, Math.PI * 2);
  g.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const IRIS_A = 0.5; // iris half angle (rad)
{
  // planar-mapped cap: uv from x/y
  const geo = capGeo(R + 0.004, IRIS_A, 96, 24);
  const p = geo.attributes.position;
  const uv = geo.attributes.uv;
  const s = R * Math.sin(IRIS_A);
  for (let i = 0; i < p.count; i++)
    uv.setXY(i, 0.5 + p.getX(i) / (2 * s), 0.5 + p.getY(i) / (2 * s));
  const iris = new THREE.Mesh(
    geo,
    new THREE.MeshPhysicalMaterial({ map: irisTexture(), roughness: 0.5 }),
  );
  eye.add(iris);
  const pupil = new THREE.Mesh(capGeo(R + 0.008, 0.19, 48, 8), flat(0x07070b, { roughness: 0.3 }));
  eye.add(pupil);
}
// cornea: a clear bulge over the iris, glossy, catches the sun
const RC = 0.86;
const corneaMat = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  roughness: 0.03,
  clearcoat: 1,
  clearcoatRoughness: 0.02,
  transparent: true,
  opacity: 0.16,
  envMapIntensity: 2.2,
  depthWrite: false,
});
const cornea = new THREE.Mesh(
  new THREE.SphereGeometry(RC, 64, 24, 0, Math.PI * 2, 0, 1.02).rotateX(Math.PI / 2),
  corneaMat,
);
cornea.position.z = R + 0.075 - RC;
eye.add(cornea);
// catchlight: the sun's reflection, the thing that makes an eye look alive
const catchMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });
const catchlight = new THREE.Mesh(new THREE.CircleGeometry(0.075, 20), catchMat);
{
  const p = dir(0.24, 2.3).multiplyScalar(R + 0.08);
  catchlight.position.copy(p);
  catchlight.lookAt(p.clone().multiplyScalar(2));
  catchlight.userData.noAO = true;
  eye.add(catchlight);
}
// tear film: a thin glossy water layer over the visible eye
const filmMat = new THREE.MeshPhysicalMaterial({
  color: 0xc8ecff,
  roughness: 0.02,
  clearcoat: 1,
  transparent: true,
  opacity: 0.22,
  envMapIntensity: 2.0,
  depthWrite: false,
});
const film = new THREE.Mesh(capGeo(R + 0.03, 0.95), filmMat);
eye.add(film);

// dry spots where the film tears: pale cracked patches (caps scaled about the apex)
function crackTexture(seed) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  const r = rng(seed);
  const grd = g.createRadialGradient(64, 64, 10, 64, 64, 64);
  grd.addColorStop(0, "rgba(246,232,206,1)");
  grd.addColorStop(0.7, "rgba(236,214,186,0.95)");
  grd.addColorStop(1, "rgba(236,214,186,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  g.strokeStyle = "rgba(170,120,95,0.8)";
  g.lineWidth = 1.6;
  for (let i = 0; i < 9; i++) {
    let x = 64;
    let y = 64;
    let a = r() * Math.PI * 2;
    g.beginPath();
    g.moveTo(x, y);
    for (let k = 0; k < 6; k++) {
      a += (r() - 0.5) * 0.9;
      x += Math.cos(a) * 9;
      y += Math.sin(a) * 9;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const spots = [];
{
  const r = rng(303);
  const SPOT_A = 0.2;
  for (let i = 0; i < 9; i++) {
    const th = 0.12 + r() * 0.62;
    const ph = r() * Math.PI * 2;
    const geo = new THREE.SphereGeometry(R + 0.035, 24, 8, 0, Math.PI * 2, 0, SPOT_A)
      .rotateX(Math.PI / 2)
      .translate(0, 0, -(R + 0.035));
    const p = geo.attributes.position;
    const uv = geo.attributes.uv;
    const s = (R + 0.035) * Math.sin(SPOT_A);
    for (let k = 0; k < p.count; k++)
      uv.setXY(k, 0.5 + p.getX(k) / (2 * s), 0.5 + p.getY(k) / (2 * s));
    const m = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({
        map: crackTexture(400 + i),
        transparent: true,
        roughness: 1,
        depthWrite: false,
      }),
    );
    const piv = new THREE.Group();
    piv.quaternion.setFromUnitVectors(V(0, 0, 1), dir(th, ph));
    m.position.z = R + 0.035;
    piv.add(m);
    eye.add(piv);
    spots.push({ m, delay: i * 0.13, size: 0.7 + r() * 0.5 });
  }
}

// red veins on the white: grow in as the eye dries
const veinMat = new THREE.MeshStandardMaterial({
  color: 0xc8242c,
  emissive: 0x6a0a10,
  roughness: 0.5,
});
function veinTube(th0, th1, ph, seed, r0 = 0.012) {
  const r = rng(seed);
  const pts = [];
  for (let k = 0; k <= 10; k++) {
    const f = k / 10;
    pts.push(
      dir(
        lerp(th0, th1, f),
        ph + Math.sin(f * 7 + seed) * 0.06 + (r() - 0.5) * 0.04,
      ).multiplyScalar(R + 0.006),
    );
  }
  const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, r0, 5);
  return new THREE.Mesh(geo, veinMat);
}
const veins = [];
{
  const r = rng(505);
  for (let i = 0; i < 18; i++) {
    const ph = (i / 18) * Math.PI * 2 + (r() - 0.5) * 0.3;
    const v = veinTube(1.0, 0.56 + r() * 0.1, ph, 600 + i, 0.01 + r() * 0.008);
    eye.add(v);
    veins.push(v);
    if (i % 2) {
      const b = veinTube(0.85, 0.66, ph + 0.18, 700 + i, 0.007);
      eye.add(b);
      veins.push(b);
    }
  }
}
// blood vessels over the cornea (the "what if": then it would be cloudy)
const cVeins = [];
{
  const r = rng(808);
  for (let i = 0; i < 12; i++) {
    const ph = (i / 12) * Math.PI * 2 + (r() - 0.5) * 0.2;
    const v = veinTube(0.52, 0.08 + r() * 0.12, ph, 900 + i, 0.014);
    v.scale.setScalar(1.035);
    eye.add(v);
    cVeins.push(v);
  }
}
const setDraw = (list, k) => {
  for (const v of list) {
    v.visible = k > 0.001;
    v.geometry.setDrawRange(0, Math.ceil(k * 40) * 5 * 6);
  }
};

// ---------------------------------------------------------------- lids
// Each lid is a sphere cap (around +y / −y) slightly bigger than the eyeball,
// rotated about the eye's centre. Upper: front edge at 80° + a from +y.
const RL = R + 0.085;
const lidMat = real.skin(skinCol, { side: THREE.DoubleSide });
const lashMat = flat(0x1c120c, { roughness: 0.8 });
function makeLid(up) {
  const g = new THREE.Group();
  const th = 80 * D2R;
  const geo = new THREE.SphereGeometry(RL, 96, 32, 0, Math.PI * 2, 0, th);
  if (!up) geo.rotateX(Math.PI);
  const shell = new THREE.Mesh(geo, lidMat);
  shell.castShadow = true;
  g.add(shell);
  // a soft rim along the edge
  const ringR = RL * Math.sin(th);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(ringR, 0.045, 10, 128), lidMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = (up ? 1 : -1) * RL * Math.cos(th);
  g.add(ring);
  // lashes on the front half of the rim, curling outward
  const n = up ? 64 : 34;
  const lg = new THREE.CylinderGeometry(0.004, 0.011, up ? 0.3 : 0.15, 4).translate(
    0,
    up ? 0.15 : 0.075,
    0,
  );
  const im = new THREE.InstancedMesh(lg, lashMat, n);
  const r = rng(up ? 11 : 12);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  for (let i = 0; i < n; i++) {
    const az = Math.PI * (0.15 + 0.7 * (i / (n - 1))) + (r() - 0.5) * 0.02; // front half (+z)
    const px = Math.cos(az) * ringR;
    const pz = Math.sin(az) * ringR;
    const out = V(Math.cos(az), 0, Math.sin(az));
    const d = out
      .clone()
      .multiplyScalar(0.8)
      .add(V(0, up ? 0.75 : -0.6, 0))
      .normalize();
    q.setFromUnitVectors(V(0, 1, 0), d);
    m4.compose(
      V(px, ring.position.y, pz).add(out.clone().multiplyScalar(0.04)),
      q,
      V(1, 0.75 + r() * 0.5, 1),
    );
    im.setMatrixAt(i, m4);
  }
  g.add(im);
  g.position.copy(EC);
  scene.add(g);
  return g;
}
const upper = makeLid(true);
const lower = makeLid(false);
// angles (deg): upper a: open −30, wide −42, closed +35; lower: open 30, wide 36, closed 15
function setLids(open, wide) {
  // open: 0 = shut … 1 = open; wide: 0..1 extra
  upper.rotation.x = (lerp(35, -30, open) - 12 * wide) * D2R;
  lower.rotation.x = (lerp(15, 30, open) + 6 * wide) * D2R;
}

// ---------------------------------------------------------------- tears
const tearMat = new THREE.MeshPhysicalMaterial({
  color: 0xd6f1ff,
  roughness: 0.02,
  clearcoat: 1,
  transparent: true,
  opacity: 0.75,
  envMapIntensity: 2.5,
});
// a tear pool along the lower lid edge
const pool = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 12), tearMat);
pool.position.copy(onEye(0.68, -1.75, R + 0.09));
pool.scale.set(0.001, 0.001, 0.001);
scene.add(pool);
// the stream down the cheek into the sand
const tearPath = new THREE.CatmullRomCurve3([
  onEye(0.7, -2.0, R + 0.12),
  V(-0.95, 0.75, 2.05),
  V(-1.05, 0.38, 2.12),
  V(-1.12, 0.12, 2.45),
  V(-1.2, 0.05, 3.1),
]);
const NT = 26;
const drops = new THREE.InstancedMesh(new THREE.SphereGeometry(0.075, 14, 10), tearMat, NT);
drops.frustumCulled = false;
scene.add(drops);
const wet = new THREE.Mesh(
  new THREE.CircleGeometry(1, 40).rotateX(-Math.PI / 2),
  new THREE.MeshPhysicalMaterial({
    color: 0xa8763f,
    roughness: 0.15,
    clearcoat: 0.8,
    transparent: true,
    opacity: 0.85,
  }),
);
wet.position.set(-1.2, 0.03, 3.15);
ground.add(wet);
// drops falling onto the cornea and soaking in ("Sie trinkt Tränen")
const NF = 6;
const fall = new THREE.InstancedMesh(new THREE.SphereGeometry(0.07, 14, 10), tearMat, NF);
fall.frustumCulled = false;
scene.add(fall);

// ---------------------------------------------------------------- puddle (analogy)
function mudTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d");
  const r = rng(91);
  g.fillStyle = "#a9794a";
  g.fillRect(0, 0, 512, 512);
  g.strokeStyle = "rgba(70,42,22,0.9)";
  g.lineWidth = 4;
  for (let i = 0; i < 60; i++) {
    let x = r() * 512;
    let y = r() * 512;
    let a = r() * Math.PI * 2;
    g.beginPath();
    g.moveTo(x, y);
    for (let k = 0; k < 5; k++) {
      a += (r() - 0.5) * 1.4;
      x += Math.cos(a) * 30;
      y += Math.sin(a) * 30;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const mud = new THREE.Mesh(
  new THREE.CircleGeometry(1.7, 48).rotateX(-Math.PI / 2),
  new THREE.MeshStandardMaterial({ map: mudTexture(), roughness: 1 }),
);
mud.position.set(PUDDLE[0], 0.02, PUDDLE[2]);
mud.scale.set(1, 1, 0.75);
mud.receiveShadow = true;
ground.add(mud);
const water = new THREE.Mesh(
  new THREE.CircleGeometry(1.5, 48).rotateX(-Math.PI / 2),
  new THREE.MeshPhysicalMaterial({
    color: 0x5fb6d9,
    roughness: 0.04,
    clearcoat: 1,
    transparent: true,
    opacity: 0.85,
    envMapIntensity: 1.8,
  }),
);
water.position.set(PUDDLE[0], 0.04, PUDDLE[2]);
ground.add(water);
// steam wisps rising off the puddle
const steamMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.4,
  depthWrite: false,
});
const steam = [];
for (let i = 0; i < 10; i++) {
  const s = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), steamMat.clone());
  s.userData.noAO = true;
  ground.add(s);
  steam.push([s, i / 10, rng(950 + i)()]);
}

// ---------------------------------------------------------------- phone
const phone = new THREE.Group();
{
  const body = new THREE.Mesh(roundedBox(1.25, 2.5, 0.11, 0.16, 6), real.gloss(0x22252c));
  phone.add(body);
  const scr = document.createElement("canvas");
  scr.width = 256;
  scr.height = 512;
  const g = scr.getContext("2d");
  const grd = g.createLinearGradient(0, 0, 0, 512);
  grd.addColorStop(0, "#ff5f8f");
  grd.addColorStop(1, "#5f6bff");
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 512);
  g.fillStyle = "rgba(255,255,255,0.85)";
  for (let i = 0; i < 4; i++) g.fillRect(20, 300 + i * 40, 150 - i * 25, 14);
  g.beginPath();
  g.arc(215, 330, 18, 0, Math.PI * 2);
  g.arc(215, 400, 18, 0, Math.PI * 2);
  g.fill();
  const tex = new THREE.CanvasTexture(scr);
  tex.colorSpace = THREE.SRGBColorSpace;
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(1.13, 2.36),
    new THREE.MeshBasicMaterial({ map: tex }),
  );
  screen.position.z = -0.06;
  screen.rotation.y = Math.PI;
  phone.add(screen);
  const cam = new THREE.Mesh(roundedBox(0.4, 0.4, 0.05, 0.08), real.gloss(0x111317));
  cam.position.set(-0.32, 0.9, 0.07);
  phone.add(cam);
  phone.position.set(0.35, 1.65, 4.5);
  phone.rotation.set(0.02, -0.08, 0.04);
  scene.add(phone);
}
const screenGlow = new THREE.PointLight(0xb98cff, 0, 5, 1.5);
screenGlow.position.set(0.3, 1.6, 3.6);
scene.add(screenGlow);

// ---------------------------------------------------------------- hands
const hand = createHand({ scale: 1.7, skin: 0xe8b394 });
const phoneHand = createHand({ scale: 1.5, skin: 0xe8b394, sleeve: 0x2f3a4a });

const applyCamera = shotCamera(shots);
const LOOK_DOF = LOOK.dof;
const LOOK_EXP = LOOK.exposure;

// ---------------------------------------------------------------- timing helpers
// a single blink: 0 → 1 (shut) → 0 over d seconds
const blinkAt = (t, at, d = 0.32) => {
  const u = (t - at) / d;
  if (u <= 0 || u >= 1) return 0;
  return u < 0.4 ? smooth(u / 0.4) : 1 - smooth((u - 0.4) / 0.6);
};
// the fast blinks during "Rate mal" (more and more often)
const rateBlinks = (() => {
  const out = [];
  let x = T.rate + 0.35;
  let gap = 0.6;
  while (x < T.zahl + 0.5) {
    out.push(x);
    x += gap;
    gap = Math.max(0.22, gap * 0.82);
  }
  return out;
})();
const fakeBlinks = [T.fakt + 0.5, T.fakt + 1.4, T.stunde + 0.1, T.stunde + 0.9];

// ================================================================ render
function renderAt(t) {
  // ------------------------------------------------ the hand holds the lid open
  hand.track(t, [
    { t: -0.2, pos: [0.4, 4.2, 2.5], rot: [2.0, 0.15, 0], pose: "open" },
    { t: 0, pos: [0.3, 4.05, 2.3], rot: [2.0, 0.15, 0], pose: "open" },
    { t: 0.35, pos: [0.25, 3.75, 2.1], rot: [2.05, 0.15, 0], pose: "press" },
    { t: 0.9, pos: [0.25, 3.95, 1.95], rot: [1.9, 0.15, 0], pose: "press" },
    { t: T.jetzt - 0.05, pos: [0.25, 4.0, 1.95], rot: [1.9, 0.15, 0], pose: "press" },
    { t: T.jetzt, pos: [0.25, 4.0, 1.95], rot: [1.9, 0.15, 0], pose: "press", out: true },
  ]);

  // ------------------------------------------------ lids
  let open = 1;
  let wide = 0;
  if (t < T.mach) wide = 0.55 + 0.25 * smooth(ramp(t, 0.2, 0.9));
  else if (t < T.alarm) wide = 1 - 0.3 * ramp(t, T.mach + 1.2, T.alarm);
  else if (t < T.rate) wide = 0.55;
  // blinks: Rate mal, the wiper, the slam, the Übrigens blinks
  let b = 0;
  if (t >= T.rate && t < T.handy) for (const x of rateBlinks) b = Math.max(b, blinkAt(t, x, 0.2));
  b = Math.max(b, blinkAt(t, T.wischer + 0.1, 0.9));
  if (t >= T.knallt) {
    // slam: shut in 0.1 s, stays shut, opens again on "Übrigens"
    const shut = smooth(ramp(t, T.knallt, T.knallt + 0.1));
    const reopen = smooth(ramp(t, T.fakt - 0.1, T.fakt + 0.3));
    b = Math.max(b, shut * (1 - reopen));
  }
  if (t >= T.fakt) for (const x of fakeBlinks) b = Math.max(b, blinkAt(t, x, 0.3));
  open = 1 - b;
  if (t >= T.handy && t < T.warum) wide = 0.3;
  setLids(open, wide * open);

  // ------------------------------------------------ drying, red, film
  const dry =
    smooth(ramp(t, T.reisst - 0.1, T.alarm + 0.3)) *
    (1 - smooth(ramp(t, T.paradox, T.verschwimmt)));
  const dry2 = t >= T.handy && t < T.warum ? 0.4 * smooth(ramp(t, T.handy, T.abends + 0.3)) : 0;
  const wiped = 1 - smooth(ramp(t, T.wischer + 0.35, T.wischer + 0.6));
  const dryAll = Math.max(dry, dry2) * (t >= T.wischer ? wiped : 1);
  for (const s of spots) {
    const k = smooth(ramp(dryAll, s.delay, s.delay + 0.35)) * s.size;
    s.m.visible = k > 0.01;
    s.m.scale.setScalar(Math.max(0.01, k));
    s.m.material.opacity = Math.min(1, k * 1.6);
  }
  filmMat.opacity =
    0.22 * (1 - 0.8 * dryAll) +
    0.1 * smooth(ramp(t, T.traenen, T.traenen + 0.8)) * (t < T.rate ? 1 : 0);
  // redness: burning → alarm → a bit on the phone; gone after the wipe
  let red = 0.35 * smooth(ramp(t, T.brennt, T.brennt + 1.2));
  red = Math.max(red, smooth(ramp(t, T.reisst, T.alarm + 0.2)));
  if (t >= T.rate) red = 0;
  if (t >= T.handy && t < T.warum) red = 0.5 * smooth(ramp(t, T.handy, T.abends));
  setDraw(veins, red);
  scleraMat.color.setRGB(0.97, lerp(0.95, 0.8, red), lerp(0.93, 0.78, red));
  // alarm pulse
  const pulse = t >= T.alarm && t < T.paradox ? 0.5 + 0.5 * Math.sin((t - T.alarm) * 14) : 0;
  veinMat.emissiveIntensity = 1 + 1.5 * pulse;

  // ------------------------------------------------ cornea: vessels + cloudy (what if)
  const cv =
    smooth(ramp(t, T.gefaesse, T.gefaesse + 0.7)) *
    (1 - smooth(ramp(t, T.trinkt - 0.3, T.trinkt + 0.2)));
  setDraw(cVeins, cv);
  const cloudy =
    smooth(ramp(t, T.trueb - 0.1, T.trueb + 0.3)) *
    (1 - smooth(ramp(t, T.trinkt - 0.3, T.trinkt + 0.2)));
  corneaMat.opacity = lerp(0.16, 0.86, cloudy);
  corneaMat.color.setRGB(1, 1, 1);
  corneaMat.roughness = lerp(0.03, 0.6, cloudy);
  showNope(pop(t, T.trueb + 0.35, T.trinkt - 0.2), 0, 1.6, 2.4, 0.6);
  catchMat.opacity = 0.95 * (1 - cloudy) * open;

  // ------------------------------------------------ tears
  const flood = t >= T.traenen - 0.2 && t < T.rate;
  const pk = flood ? smooth(ramp(t, T.traenen - 0.2, T.traenen + 0.5)) : 0;
  pool.scale.set(0.38 * pk + 0.001, 0.09 * pk + 0.001, 0.12 * pk + 0.001);
  pool.lookAt(EC);
  {
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    for (let i = 0; i < NT; i++) {
      let s = 0;
      const p = V(0, -50, 0);
      if (flood) {
        const u = (t - T.traenen - 0.1) * 0.55 - i / NT;
        if (u > 0) {
          const f = u % 1;
          p.copy(tearPath.getPointAt(f));
          s = Math.sin(Math.PI * Math.min(1, f * 1.2)) * (0.75 + (0.35 * ((i * 7) % 5)) / 5);
        }
      }
      m4.compose(p, q, V(s, s * 1.25, s));
      drops.setMatrixAt(i, m4);
    }
    drops.instanceMatrix.needsUpdate = true;
  }
  const wk = smooth(ramp(t, T.traenen + 0.6, T.verschwimmt + 0.5));
  wet.visible = wk > 0.01;
  wet.scale.set(0.2 + 0.9 * wk, 1, 0.15 + 0.6 * wk);
  // drops falling onto the cornea and sinking in
  {
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    for (let i = 0; i < NF; i++) {
      const at = T.trinkt - 0.1 + i * 0.22;
      const u = ramp(t, at, at + 0.45);
      const sink = ramp(t, at + 0.45, at + 0.85);
      let s = 0;
      const tgt = onEye(0.1 + (i % 3) * 0.12, i * 2.1, R + 0.09);
      const p = tgt.clone().add(V(0, 1.4 * (1 - u), 0.6 * (1 - u)));
      if (t >= at && t < at + 0.85 && t < T.lid) s = 1 - sink;
      m4.compose(p, q, V(s, s * (1 + 0.4 * (1 - u)), s));
      fall.setMatrixAt(i, m4);
    }
    fall.instanceMatrix.needsUpdate = true;
  }

  // ------------------------------------------------ puddle drying (analogy)
  const pd = smooth(ramp(t, T.pfuetze - 0.2, T.alarm - 0.05));
  water.scale.set(Math.max(0.02, 1 - 0.92 * pd), 1, Math.max(0.02, 0.75 * (1 - 0.92 * pd)));
  water.material.opacity = 0.85 * (1 - 0.6 * pd);
  const steamOn = t >= T.pfuetze - 0.3 && t < T.alarm + 0.2;
  for (const [s, ph, r0] of steam) {
    s.visible = steamOn;
    if (!steamOn) continue;
    const u = (t * 0.6 + ph) % 1;
    s.position.set(
      PUDDLE[0] + (r0 - 0.5) * 1.8 + Math.sin(t * 2 + ph * 9) * 0.15,
      0.2 + u * 2.2,
      PUDDLE[2] + (ph - 0.5) * 1.2,
    );
    s.scale.setScalar(0.6 + u * 1.4);
    s.material.opacity = 0.35 * Math.sin(Math.PI * u);
  }

  // ------------------------------------------------ phone
  const ph = pop(t, T.handy - 0.05, T.warum, 0.3);
  phone.visible = ph > 0.01;
  phone.scale.setScalar(Math.max(0.01, ph));
  screenGlow.intensity = 9 * ph;
  phoneHand.track(t, [
    { t: T.handy - 0.3, pos: [1.6, 0.0, 5.6], rot: [-0.5, -2.6, 0.3], pose: "grab" },
    { t: T.handy + 0.1, pos: [1.25, 0.55, 5.2], rot: [-0.5, -2.6, 0.3], pose: "grab" },
    { t: T.warum - 0.05, pos: [1.25, 0.6, 5.2], rot: [-0.5, -2.6, 0.3], pose: "grab" },
    { t: T.warum, pos: [1.25, 0.6, 5.2], rot: [-0.5, -2.6, 0.3], pose: "grab", out: true },
  ]);

  // ------------------------------------------------ POV blur
  const blurK =
    t >= T.verschwimmt && t < T.rate ? smooth(ramp(t, T.verschwimmt, T.verschwimmt + 0.5)) : 0;
  LOOK.dof = LOOK_DOF + 3.5 * blurK;
  // Übrigens: every blink = a moment of black
  LOOK.exposure = t >= T.fakt && t < T.schneidet ? LOOK_EXP * (1 - 0.92 * b) : LOOK_EXP;

  // ------------------------------------------------ sand puff when the lid slams
  puff("slam", t, T.knallt + 0.1, 0, 0.3, 2.6, 1.6, 0xf2d6a8);

  // ------------------------------------------------ HUD
  const swA = pop(t, 0, T.rate, 0.25);
  const swB = pop(t, T.einen2, T.fakt, 0.25);
  const frozen = t >= T.knallt;
  const secs = frozen ? T.knallt : t;
  if (swA > 0)
    stopwatch("sw", swA, { seconds: secs, max: 60, label: "OHNE BLINZELN", x: 740, y: 520 });
  else
    stopwatch("sw", swB, {
      seconds: secs,
      max: 60,
      label: frozen ? "ZU!" : "OHNE BLINZELN",
      x: 740,
      y: 520,
      color: frozen ? "#ff4b2b" : undefined,
    });
  const cn = pop(t, T.rate + 0.2, T.handy, 0.25);
  counter("blinks", cn, {
    label: "BLINZELN PRO TAG",
    value: Math.round(15000 * smooth(ramp(t, T.rate + 0.3, T.zahl + 0.15))),
    x: 80,
    y: 1060,
  });
  if (t >= T.stunde && t < T.schneidet + 0.8)
    showPanel(pop(t, T.stunde, T.schneidet + 0.8), "BLIND PRO TAG", "30 MIN", LED.yellow);
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
