// "Wie funktioniert ein Taschenwärmer?" World, captions, camera, panel,
// arrows and labels live in world.js; this file builds the story: a big
// see-through gel pad on a floating island. Its click disc starts a white
// crystal wave that races through the supercooled salt and makes it glow
// hot; a thermometer for the 58 °C, a battery that isn't needed, a boiling
// pot that recharges a small pad, and a bag of salt & vinegar chips.
import {
  THREE,
  ramp,
  smooth,
  inBack,
  pop,
  V,
  scene,
  flat,
  M,
  roundedRect,
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
import { createWorld } from "./environments.js";
import {
  T,
  shots,
  LABELS,
  HIGHLIGHTS,
  PW,
  PH,
  PY0,
  DISC,
  THERMO,
  K,
  P,
  HOOK_CLICK,
  HOOK_FULL,
  SLOW_END,
  CLICK,
} from "./beats.js";

highlights(HIGHLIGHTS);
createWorld({ env: "insel", sky: "sonnenuntergang" });

Object.assign(M, {
  foot: flat(0xc58b4f),
  disc: new THREE.MeshStandardMaterial({ color: 0xe8edf3, metalness: 0.35, roughness: 0.25 }),
  slit: flat(0x3a3f48),
  shard: flat(0xf4fbff, { emissive: 0xcfeeff, emissiveIntensity: 0.15 }),
  seed: flat(0xffffff, { emissive: 0xcff4ff, emissiveIntensity: 2.2 }),
  ice: flat(0xeaf7ff, { emissive: 0xbfe6ff, emissiveIntensity: 0.4 }),
  batBody: flat(0x2b2b31, { roughness: 0.5 }),
  batTop: new THREE.MeshStandardMaterial({ color: 0xd99a2b, metalness: 0.6, roughness: 0.3 }),
  glassTube: new THREE.MeshStandardMaterial({
    color: 0xeaf6ff,
    roughness: 0.1,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  }),
  mercury: flat(0xe8302a, { emissive: 0xff2a1a, emissiveIntensity: 0.35 }),
  mark: flat(0x2f9bff, { emissive: 0x2f9bff, emissiveIntensity: 0.8 }),
  stove: flat(0x2c2f38, { roughness: 0.7 }),
  coil: flat(0x6a1a12, { emissive: 0xff3a1a, emissiveIntensity: 1.6 }),
  pot: new THREE.MeshStandardMaterial({
    color: 0xc9d2dc,
    metalness: 0.7,
    roughness: 0.3,
    side: THREE.DoubleSide,
  }),
  bubble: flat(0xffffff, { emissive: 0xe6f6ff, emissiveIntensity: 0.3 }),
  bag: flat(0x2fa84f, { roughness: 0.4 }),
  chip: flat(0xf6c24a, { roughness: 0.7 }),
});

const clamp = (x) => Math.min(1, Math.max(0, x));
const TINY = V(1e-3, 1e-3, 1e-3);
function hash(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
function mesh(geo, mat, parent, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
function setPop(group, t, a, b) {
  const k = pop(t, a, b);
  group.visible = k > 0.001;
  group.scale.copy(t >= a ? squash(t, a).multiplyScalar(k) : TINY);
}

// ---------------------------------------------------------------- liquid shader
// The salt inside the pad: clear blue liquid, turned white crystal where the
// wave (a sphere of radius uFront around the disc) has passed, with a bright
// band on the wave front, warm orange glow (uHeat), cold blue pulse (uCold),
// and cut off above uFill while it pours in.
function makeLiquidMat() {
  const u = {
    uFront: { value: 0 },
    uDisc: { value: V(...DISC) },
    uFill: { value: 99 },
    uHeat: { value: 0 },
    uCold: { value: 0 },
  };
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.25,
    metalness: 0,
    transparent: true,
  });
  mat.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, u);
    s.vertexShader = s.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vW;")
      .replace(
        "#include <project_vertex>",
        "#include <project_vertex>\nvW = (modelMatrix * vec4(transformed, 1.0)).xyz;",
      );
    s.fragmentShader = s.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
varying vec3 vW;
uniform float uFront, uFill, uHeat, uCold;
uniform vec3 uDisc;`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
if (vW.y > uFill) discard;
float dd = distance(vW, uDisc);
float cr = 1.0 - smoothstep(uFront - 0.04, uFront, dd);
vec3 liq = vec3(0.12, 0.5, 1.0);
vec3 crys = mix(vec3(0.9, 0.93, 0.96), vec3(1.0, 0.62, 0.3), uHeat);
diffuseColor.rgb = mix(liq, crys, cr);
diffuseColor.a = mix(0.82, 0.97, cr);`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
float band = (1.0 - smoothstep(0.0, 0.08, abs(dd - uFront))) * step(0.001, uFront) * (1.0 - cr * 0.5);
totalEmissiveRadiance += vec3(0.7, 0.95, 1.0) * band * 1.8
  + vec3(1.0, 0.38, 0.08) * uHeat * cr * 0.42
  + vec3(0.15, 0.5, 1.0) * uCold * 0.55;`,
      );
  };
  return { mat, u };
}

// ---------------------------------------------------------------- the pad
const R_MAX = 2.2; // wave radius that reaches the farthest corner
const pad = new THREE.Group();
scene.add(pad);

const shellGeo = new THREE.ExtrudeGeometry(roundedRect(PW, PH, 0.5), {
  depth: 0.18,
  bevelEnabled: true,
  bevelThickness: 0.11,
  bevelSize: 0.08,
  bevelSegments: 4,
  curveSegments: 16,
});
shellGeo.translate(0, PY0, -0.09);
const shellMat = new THREE.MeshStandardMaterial({
  color: 0xe6f6ff,
  roughness: 0.08,
  metalness: 0.05,
  transparent: true,
  opacity: 0.28,
  depthWrite: false,
});
const shell = new THREE.Mesh(shellGeo, shellMat);
shell.renderOrder = 3;
shell.userData.noAO = true;
pad.add(shell);

// welded seam around the edge
const rimGeo = (() => {
  const outer = roundedRect(PW + 0.3, PH + 0.3, 0.62);
  const inner = roundedRect(PW + 0.04, PH + 0.04, 0.52);
  const hole = new THREE.Path(inner.getPoints(24).map((p) => p.add(new THREE.Vector2(0, 0.13))));
  outer.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(outer, {
    depth: 0.035,
    bevelEnabled: false,
    curveSegments: 16,
  });
  g.translate(0, PY0 - 0.15, -0.0175);
  return g;
})();
const rimMat = new THREE.MeshStandardMaterial({
  color: 0xf2fbff,
  roughness: 0.2,
  transparent: true,
  opacity: 0.75,
});
const rim = new THREE.Mesh(rimGeo, rimMat);
rim.renderOrder = 2;
pad.add(rim);

const liquidGeo = new THREE.ExtrudeGeometry(roundedRect(PW - 0.12, PH - 0.12, 0.45), {
  depth: 0.14,
  bevelEnabled: true,
  bevelThickness: 0.065,
  bevelSize: 0.04,
  bevelSegments: 3,
  curveSegments: 16,
});
liquidGeo.translate(0, PY0 + 0.06, -0.07);
const liquid = makeLiquidMat();
const liquidMesh = new THREE.Mesh(liquidGeo, liquid.mat);
liquidMesh.renderOrder = 1;
liquidMesh.userData.noAO = true;
pad.add(liquidMesh);

// crystal needles that appear where the wave has passed (some poke out of
// the front and back of the liquid like frost)
const NS = 760;
const shardGeo = new THREE.OctahedronGeometry(1, 0);
const shards = new THREE.InstancedMesh(shardGeo, M.shard, NS);
shards.castShadow = false;
pad.add(shards);
const SH = [];
{
  const hw = (PW - 0.12) / 2;
  const r = 0.45;
  let i = 0;
  let n = 0;
  while (i < NS) {
    n++;
    const x = (hash(n) * 2 - 1) * (hw - 0.03);
    const y = PY0 + 0.1 + hash(n + 0.5) * (PH - 0.2);
    // keep inside the rounded corners
    const cx = Math.max(Math.abs(x) - (hw - r), 0);
    const cyLo = Math.max(PY0 + 0.06 + r - y, 0);
    const cyHi = Math.max(y - (PY0 + 0.06 + PH - 0.12 - r), 0);
    if (Math.hypot(cx, Math.max(cyLo, cyHi)) > r - 0.04) continue;
    const side = i % 3 === 0 ? 0 : i % 3 === 1 ? 1 : -1;
    const z = side === 0 ? (hash(n + 0.3) * 2 - 1) * 0.08 : side * (0.1 + hash(n + 0.3) * 0.06);
    const p = V(x, y, z);
    const e = new THREE.Euler(hash(n + 0.7) * 6.3, hash(n + 0.9) * 6.3, hash(n + 0.1) * 6.3);
    SH.push({
      p,
      q: new THREE.Quaternion().setFromEuler(e),
      d: p.distanceTo(V(...DISC)),
      s: 0.6 + hash(n + 0.2) * 0.8,
    });
    i++;
  }
}
const _m = new THREE.Matrix4();
const _s = V(1, 1, 1);
function updateShards(R) {
  for (let i = 0; i < NS; i++) {
    const h = SH[i];
    const k = clamp((R - h.d) / 0.18);
    const s = k > 0 ? k * h.s : 0.0001;
    _s.set(0.028 * s, 0.085 * s, 0.028 * s);
    _m.compose(h.p, h.q, _s);
    shards.setMatrixAt(i, _m);
  }
  shards.instanceMatrix.needsUpdate = true;
}

// click disc + the tiny seed crystal
const disc = new THREE.Group();
disc.position.set(...DISC);
pad.add(disc);
{
  const g = new THREE.CylinderGeometry(0.17, 0.17, 0.025, 28);
  g.rotateX(Math.PI / 2);
  mesh(g, M.disc, disc);
  const ring = new THREE.TorusGeometry(0.11, 0.012, 6, 28);
  mesh(ring, M.disc, disc, 0, 0, 0.014);
  for (let i = 0; i < 4; i++) {
    const s = mesh(new THREE.BoxGeometry(0.07, 0.012, 0.01), M.slit, disc, 0, 0, 0.016);
    s.rotation.z = (i * Math.PI) / 4;
  }
}
const SEED = V(DISC[0] - 0.17, DISC[1] + 0.12, DISC[2] + 0.03);
const seed = mesh(new THREE.OctahedronGeometry(1, 0), M.seed, pad, ...SEED.toArray());
seed.castShadow = false;
const pressArrow = makeArrowSet([[V(DISC[0], DISC[1], 1.0), V(DISC[0], DISC[1], 0.22)]], {
  mat: forceMat,
  amp: 0,
  r: 0.035,
});

// wooden foot
mesh(new THREE.BoxGeometry(1.3, 0.26, 0.62), M.foot, pad, 0, 0.13, 0);
mesh(new THREE.BoxGeometry(1.42, 0.06, 0.74), M.woodDark, pad, 0, 0.03, 0);

// warmth
const padLight = new THREE.PointLight(0xff8a3a, 0, 6, 1.4);
padLight.position.set(0, 1.5, 0.8);
pad.add(padLight);
const heatOut = makeArrowSet(
  [
    [V(0.55, 2.1, 0.25), V(1.45, 2.75, 1.1)],
    [V(-0.55, 2.1, 0.25), V(-1.45, 2.75, 1.1)],
    [V(0, 2.75, 0.2), V(0.1, 3.75, 0.8)],
    [V(0.75, 1.05, 0.25), V(1.7, 1.05, 1.2)],
    [V(-0.75, 1.05, 0.25), V(-1.7, 1.05, 1.2)],
  ],
  { parent: pad, r: 0.03, amp: 0.06 },
);

// ice that tries to form on top ("müsste es fest werden – tut es aber nicht")
const ice = [];
for (let i = 0; i < 9; i++) {
  const m = mesh(new THREE.OctahedronGeometry(1, 0), M.ice, pad);
  m.position.set(-0.55 + i * 0.14, PY0 + PH - 0.12 - Math.abs(i - 4) * 0.035, 0.13);
  m.rotation.set(hash(i) * 3, hash(i + 3) * 3, hash(i + 5) * 3);
  m.castShadow = false;
  ice.push(m);
}

// ---------------------------------------------------------------- battery (hook)
const battery = new THREE.Group();
battery.position.set(1.4, 0, 0.75);
scene.add(battery);
{
  const body = new THREE.CylinderGeometry(0.17, 0.17, 0.48, 20);
  mesh(body, M.batBody, battery, 0, 0.24, 0);
  mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.2, 20), M.batTop, battery, 0, 0.58, 0);
  mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 12), M.batTop, battery, 0, 0.71, 0);
}

// ---------------------------------------------------------------- thermometer
const thermo = new THREE.Group();
thermo.position.set(...THERMO);
scene.add(thermo);
const TH0 = 0.42; // bottom of the column
{
  mesh(new THREE.BoxGeometry(0.42, 0.14, 0.42), M.wood, thermo, 0, 0.07, 0);
  mesh(new THREE.SphereGeometry(0.15, 16, 12), M.mercury, thermo, 0, 0.3, 0);
  const tube = mesh(
    new THREE.CylinderGeometry(0.075, 0.075, 1.75, 16),
    M.glassTube,
    thermo,
    0,
    1.25,
    0,
  );
  tube.renderOrder = 2;
  tube.castShadow = false;
  tube.userData.noAO = true;
  mesh(new THREE.TorusGeometry(0.09, 0.018, 6, 20), M.mark, thermo, 0, 1.05, 0).rotation.x =
    Math.PI / 2;
}
const colGeo = new THREE.CylinderGeometry(0.042, 0.042, 1, 12);
colGeo.translate(0, 0.5, 0);
const column = mesh(colGeo, M.mercury, thermo, 0, TH0, 0);

// ---------------------------------------------------------------- boiling pot (recharge)
const pot = new THREE.Group();
pot.position.set(...K);
scene.add(pot);
const WATER_Y = 0.78;
{
  mesh(new THREE.CylinderGeometry(0.8, 0.85, 0.14, 28), M.stove, pot, 0, 0.07, 0);
  const coil = mesh(new THREE.TorusGeometry(0.45, 0.035, 6, 32), M.coil, pot, 0, 0.15, 0);
  coil.rotation.x = Math.PI / 2;
  mesh(new THREE.CylinderGeometry(0.62, 0.56, 0.8, 28, 1, true), M.pot, pot, 0, 0.56, 0);
  mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.03, 28), M.pot, pot, 0, 0.17, 0);
  for (const s of [-1, 1])
    mesh(new THREE.BoxGeometry(0.22, 0.06, 0.1), M.rubber, pot, s * 0.72, 0.86, 0);
  const water = mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.02, 28), M.water, pot, 0, WATER_Y, 0);
  water.renderOrder = 2;
  water.userData.noAO = true;
  water.castShadow = false;
}
// small pad in the pot, recharging (its crystals melt back to clear)
const MINI = 0.36;
const mini = new THREE.Group();
mini.position.set(0, 0.2, -0.05);
mini.scale.setScalar(MINI);
mini.rotation.y = 0.25;
pot.add(mini);
const miniLiquid = makeLiquidMat();
{
  const s = new THREE.Mesh(shellGeo, shellMat);
  s.renderOrder = 3;
  mini.add(s);
  const l = new THREE.Mesh(liquidGeo, miniLiquid.mat);
  l.renderOrder = 1;
  mini.add(l);
  const d = new THREE.CylinderGeometry(0.17, 0.17, 0.025, 28);
  d.rotateX(Math.PI / 2);
  mesh(d, M.disc, mini, ...DISC);
}
const NB = 36;
const bubbles = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), M.bubble, NB);
pot.add(bubbles);
const steam = [];
for (let i = 0; i < 10; i++) {
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), M.steam);
  m.userData.noAO = true;
  pot.add(m);
  steam.push(m);
}
function animatePot(t) {
  for (let i = 0; i < NB; i++) {
    const ph = (t * (0.9 + hash(i) * 0.6) + hash(i + 9)) % 1;
    const a = hash(i + 4) * Math.PI * 2;
    const r = 0.12 + hash(i + 7) * 0.4;
    _s.setScalar(0.025 + 0.03 * ph);
    _m.compose(
      V(Math.cos(a) * r, 0.22 + ph * (WATER_Y - 0.2), Math.sin(a) * r),
      new THREE.Quaternion(),
      _s,
    );
    bubbles.setMatrixAt(i, _m);
  }
  bubbles.instanceMatrix.needsUpdate = true;
  steam.forEach((m, i) => {
    const ph = (t * 0.45 + i / steam.length) % 1;
    const a = i * 2.4;
    m.position.set(Math.cos(a) * 0.3 * (1 - ph * 0.5), WATER_Y + 0.1 + ph * 1.3, Math.sin(a) * 0.3);
    m.scale.setScalar(Math.max(0.001, (0.08 + 0.12 * ph) * Math.sin(ph * Math.PI)));
  });
}

// ---------------------------------------------------------------- chips bag (bonus fact)
const chipsSet = new THREE.Group();
chipsSet.position.set(...P);
scene.add(chipsSet);
const FONT_OK = () => document.fonts.check('800 60px "Montserrat"');
const bagCanvas = document.createElement("canvas");
bagCanvas.width = 512;
bagCanvas.height = 640;
const bagTex = new THREE.CanvasTexture(bagCanvas);
bagTex.colorSpace = THREE.SRGBColorSpace;
function drawBag() {
  const g = bagCanvas.getContext("2d");
  g.fillStyle = "#2fa84f";
  g.fillRect(0, 0, 512, 640);
  g.fillStyle = "#ffd23f";
  g.beginPath();
  g.ellipse(256, 330, 200, 150, -0.12, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#ffffff";
  g.textAlign = "center";
  g.font = '800 64px "Montserrat", sans-serif';
  g.fillText("SALT &", 256, 120);
  g.fillText("VINEGAR", 256, 190);
  g.fillStyle = "#1f6b33";
  g.font = '800 96px "Montserrat", sans-serif';
  g.fillText("CHIPS", 256, 365);
  g.fillStyle = "#ffffff";
  g.font = '800 44px "Montserrat", sans-serif';
  g.fillText("mit E 262", 256, 560);
  bagTex.needsUpdate = true;
}
drawBag();
let fontsDrawn = FONT_OK();
{
  const bagGeo = new THREE.ExtrudeGeometry(roundedRect(1.0, 1.4, 0.12), {
    depth: 0.16,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.06,
    bevelSegments: 3,
  });
  bagGeo.translate(0, 0.02, -0.08);
  const bag = mesh(bagGeo, M.bag, chipsSet);
  bag.rotation.set(-0.08, 0.15, 0.04);
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(0.96, 1.2),
    new THREE.MeshStandardMaterial({ map: bagTex, roughness: 0.5 }),
  );
  face.position.set(0, 0.72, 0.19);
  bag.add(face);
}
const chipGeo = new THREE.SphereGeometry(0.15, 8, 6);
chipGeo.scale(1, 0.22, 0.8);
const chips = [];
for (let i = 0; i < 8; i++) {
  const m = mesh(chipGeo, M.chip, chipsSet);
  const a = -1.2 + i * 0.75;
  m.userData = { x: Math.sin(a) * (0.75 + hash(i) * 0.15), z: 0.35 + Math.cos(a) * 0.35, i };
  chips.push(m);
}
function animateChips(t) {
  for (const m of chips) {
    const { x, z, i } = m.userData;
    const k = smooth(ramp(t, T.uebrigens + 0.15 + i * 0.07, T.uebrigens + 0.75 + i * 0.07));
    // fly out of the top of the bag in an arc and land around it
    m.position.set(x * k, 1.55 * (1 - k) + Math.sin(k * Math.PI) * 0.6 + 0.04, 0.1 + (z - 0.1) * k);
    m.rotation.set(hash(i) * 2 + k * 4, hash(i + 2) * 3, hash(i + 4) * 0.6);
    m.visible = t >= T.uebrigens + 0.15 + i * 0.07;
  }
}

const applyCamera = shotCamera(shots);

// ---------------------------------------------------------------- states
const REBUILD = T.brauchst + 0.25; // the hook pad leaves, the empty bag arrives
function frontR(t) {
  if (t < REBUILD) return R_MAX * ramp(t, HOOK_CLICK, HOOK_FULL);
  if (t < T.zack) return 0;
  if (t < T.beutel2) return 0.6 * R_MAX * ramp(t, T.zack, SLOW_END);
  return R_MAX * (0.6 + 0.4 * smooth(ramp(t, T.beutel2, T.beutel2 + 0.9)));
}
function heatK(t) {
  if (t < REBUILD) return smooth(ramp(t, HOOK_FULL - 0.5, T.knick + 0.3));
  return smooth(ramp(t, T.beim, T.waerme1 + 0.4));
}
// disc snap: a quick wobble after each click
function snap(t, at) {
  const x = t - at;
  return x < 0 || x > 0.5 ? 0 : Math.sin(x * 40) * Math.exp(-x * 9);
}

// ---------------------------------------------------------------- render
function renderAt(t) {
  if (!fontsDrawn && FONT_OK()) {
    fontsDrawn = true;
    drawBag();
  }

  // ---- the pad: hook pad leaves on "brauchst", an empty bag pops in
  if (t < REBUILD) {
    pad.scale.setScalar(Math.max(0.001, 1 - inBack(ramp(t, T.brauchst, REBUILD))));
  } else {
    pad.scale.copy(squash(t, REBUILD));
  }
  puff("pad", t, REBUILD + 0.15, 0, 0.05, 0, 1.5);

  const R = frontR(t);
  const heat = heatK(t);
  liquid.u.uFront.value = R;
  liquid.u.uHeat.value = heat;
  liquid.u.uFill.value =
    t < REBUILD ? 99 : PY0 + (PH + 0.2) * smooth(ramp(t, T.salz1, T.salz1 + 0.8)) - 0.01;
  liquidMesh.visible = t < REBUILD || t >= T.salz1;
  liquid.u.uCold.value =
    pop(t, T.unterkuehlt, T.hier) * (0.65 + 0.35 * Math.sin((t - T.unterkuehlt) * 6));
  updateShards(R);
  shards.visible = R > 0;
  M.shard.emissive.setHex(heat > 0.05 ? 0xff7a2a : 0xcfeeff);
  M.shard.emissiveIntensity = 0.15 + 0.4 * heat;
  shellMat.color.setHex(0xe6f6ff).lerp(new THREE.Color(0xffc49a), heat * 0.6);
  padLight.intensity = 9 * heat * (1 + 0.6 * pop(t, T.knick, T.knick + 0.6, 0.2));
  animateArrows(
    heatOut,
    t,
    Math.max(pop(t, T.knick + 0.2, T.brauchst), pop(t, T.waerme1, T.uebrigens)),
  );

  // ---- disc: clicks in the hook and on "Knickst"
  const wob = snap(t, HOOK_CLICK) + snap(t, CLICK);
  disc.rotation.set(wob * 0.35, wob * 0.2, 0);
  disc.scale.set(1, 1, 1 - Math.abs(wob) * 0.6);
  animateArrows(
    pressArrow,
    t,
    t < REBUILD ? pop(t, -0.6, HOOK_CLICK + 0.35) : pop(t, T.knickst - 0.05, CLICK + 0.35),
  );
  const sk = smooth(ramp(t, T.entsteht + 0.15, T.kristall1 + 0.35));
  seed.visible = t >= T.entsteht && t < T.zack + 0.2;
  seed.scale.set(0.03 * sk, 0.06 * sk, 0.03 * sk).multiplyScalar(1 + 0.25 * Math.sin(t * 14));
  seed.rotation.y = t * 2;
  M.seed.emissiveIntensity = 1.6 + 1.2 * Math.abs(Math.sin(t * 7));

  // ---- ice tries to form, melts again
  ice.forEach((m, i) => {
    const a = T.fest + 0.1 + i * 0.06;
    const k = t >= a ? squash(t, a, 0.5).x * (1 - smooth(ramp(t, T.tut + 0.1, T.nicht + 0.1))) : 0;
    m.visible = k > 0.01;
    m.scale.set(0.05 * k, 0.11 * k, 0.05 * k);
  });

  // ---- battery: "keine Batterie" ✕
  setPop(battery, t, T.batterie - 0.05, T.knick + 0.15);
  battery.rotation.y = t * 0.8;

  // ---- thermometer: drops below the 58 °C mark
  setPop(thermo, t, T.unter, T.es3);
  const lvl =
    1.05 +
    0.4 * (1 - smooth(ramp(t, T.f58, T.f58 + 1.0))) -
    0.35 * smooth(ramp(t, T.f58 + 0.6, T.tut));
  column.scale.y = Math.max(0.01, lvl - TH0);

  // ---- ✕: battery not needed / ice doesn't stay
  if (t >= T.batterie + 0.25 && t < T.knick + 0.15) {
    showNope(pop(t, T.batterie + 0.25, T.knick + 0.15), 1.4, 1.15, 0.75, 0.45);
  } else if (t >= T.nicht && t < T.es3) {
    showNope(pop(t, T.nicht, T.es3), 0, PY0 + PH + 0.42, 0.25, 0.5);
  } else {
    showNope(0, 0, 0, 0);
  }

  // ---- boiling pot: the small pad turns clear again
  setPop(pot, t, T.kochendem - 0.15, T.schau);
  if (pot.visible) animatePot(t);
  pot.updateMatrixWorld();
  miniLiquid.u.uDisc.value.set(...DISC).applyMatrix4(mini.matrixWorld);
  miniLiquid.u.uFront.value =
    R_MAX * MINI * (1 - smooth(ramp(t, T.kochendem + 0.5, T.schau - 0.2)));
  miniLiquid.u.uHeat.value = 0.25;
  puff("pot", t, T.kochendem, K[0], 0.05, K[2], 1.4);

  // ---- chips bag
  setPop(chipsSet, t, T.uebrigens + 0.05, T.hast);
  if (chipsSet.visible) animateChips(t);
  puff("chips", t, T.uebrigens + 0.2, P[0], 0.05, P[2], 1.4);

  // ---- LED panel (none on the cover)
  if (window.HF_COVER_T != null) {
    showPanel(0);
  } else if (t >= T.fuenfzig && t < T.brauchst) {
    showPanel(pop(t, T.fuenfzig, T.brauchst), "TASCHENWÄRMER", "50 °C+", LED.red);
  } else if (t >= T.f58 && t < T.fest) {
    showPanel(pop(t, T.f58, T.fest), "FEST UNTER", "58 °C", LED.blue);
  } else if (t >= T.unterkuehlt && t < T.hier) {
    showPanel(pop(t, T.unterkuehlt, T.hier), "FLÜSSIG BEI", "20 °C", LED.blue);
  } else if (t >= T.waerme1 && t < T.kwaerme) {
    showPanel(pop(t, T.waerme1, T.kwaerme), "HEIZT AUF", "54 °C", LED.red);
  } else if (t >= T.kochendem + 0.3 && t < T.schau) {
    showPanel(pop(t, T.kochendem + 0.3, T.schau), "AUFLADEN", "100 °C", LED.red);
  } else {
    showPanel(0);
  }

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
