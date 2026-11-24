// #94 Papier 42-mal falten — the viewer folds a sheet on a school desk;
// past fold 7 the video folds on: the stack doubles to cup height, to "you",
// through the ceiling, past the airliner, out of the atmosphere — and on
// fold 42 it hits the Moon.
import {
  THREE,
  ramp,
  smooth,
  clamp01,
  pop,
  V,
  scene,
  ground,
  real,
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
import { school, tp, air, space, airliner, skyBits, MOON, MOON_R, M2 } from "./set.js";
import { createHand } from "./hand.js";
import { counter } from "./hud.js";
import {
  T,
  shots,
  LABELS,
  HIGHLIGHTS,
  FOLDS,
  FAIL,
  foldsAt,
  worldAt,
  T_CRASH,
  HAIR_POS,
} from "./beats.js";

highlights(HIGHLIGHTS);
const applyCamera = shotCamera(shots);
const baseFog = scene.fog;

// ---------------------------------------------------------------- the sheet (folded by hand)
// A3 sheet 0.6 × 0.84 (2 units = 1 m); thickness exaggerated ×3 so the block reads
const SHEET = [0.6, 0.84];
const TH0 = 0.0006;
const DESK = 1.5;
const paperM = M2.paperM;
const paperEdge = real.plastic(0xe9e4d6, { roughness: 0.95, clearcoat: 0 });
const mats = [paperEdge, paperEdge, paperM, paperEdge, paperEdge, paperEdge];
const sheet = new THREE.Group();
school.add(sheet);
const staticHalf = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mats);
staticHalf.castShadow = true;
staticHalf.receiveShadow = true;
sheet.add(staticHalf);
const pivot = new THREE.Group();
sheet.add(pivot);
const flipHalf = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mats);
flipHalf.castShadow = true;
pivot.add(flipHalf);
// crease lines on top (faint) — one per completed fold
const glowM = new THREE.MeshBasicMaterial({
  color: 0x7fe0ff,
  transparent: true,
  opacity: 0,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});
const glowBox = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), glowM);
sheet.add(glowBox);

function dimsAfter(k) {
  let [wx, wz] = SHEET;
  for (let i = 1; i <= k; i++) {
    if (i % 2) wz /= 2;
    else wx /= 2;
  }
  return [wx, wz, TH0 * 2 ** k];
}
function setBox(m, w, h, d, x, y, z) {
  m.scale.set(w, Math.max(h, 0.0004), d);
  m.position.set(x, y, z);
}
// state of the hand-folded sheet at time t
function sheetAt(t) {
  let done = 0;
  let active = -1;
  let p = 0;
  FOLDS.forEach(([a, d], i) => {
    if (t >= a + d) done = i + 1;
    else if (t >= a && active < 0) {
      active = i + 1;
      p = (t - a) / d;
    }
  });
  // fold 8: lifts ~35°, strains, falls back
  let fail = 0;
  if (done === 7 && t >= FAIL[0] && t < FAIL[1] + 0.3) {
    active = 8;
    const a = ramp(t, FAIL[0], FAIL[0] + 0.25);
    const b = ramp(t, FAIL[1], FAIL[1] + 0.3);
    fail = 0.2 * smooth(a) * (1 - smooth(b)) + 0.012 * Math.sin(t * 70) * a * (1 - b);
    p = fail;
  }
  if (active < 0) {
    const [wx, wz, th] = dimsAfter(done);
    sheet.position.set(0, DESK, 0);
    setBox(staticHalf, wx, th, wz, 0, th / 2, 0);
    flipHalf.visible = false;
    return { done, wx, wz, th };
  }
  const [wx, wz, th] = dimsAfter(active - 1);
  const alongZ = active % 2 === 1;
  const L = alongZ ? wz : wx;
  const e = active === 8 ? 0 : smooth(p);
  const ang = Math.PI * (active === 8 ? p : easeFold(p));
  sheet.position.set(alongZ ? 0 : (L / 4) * e, DESK, alongZ ? (L / 4) * e : 0);
  flipHalf.visible = true;
  pivot.position.set(0, th, 0);
  pivot.rotation.set(0, 0, 0);
  if (alongZ) {
    setBox(staticHalf, wx, th, L / 2, 0, th / 2, -L / 4);
    setBox(flipHalf, wx, th, L / 2, 0, -th / 2, L / 4);
    pivot.rotation.x = -ang;
  } else {
    setBox(staticHalf, L / 2, th, wz, -L / 4, th / 2, 0);
    setBox(flipHalf, L / 2, th, wz, L / 4, -th / 2, 0);
    pivot.rotation.z = ang;
  }
  return { done, wx, wz, th };
}
const easeFold = (p) => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2);

// ---------------------------------------------------------------- the viewer's hand
const hand = createHand({ scale: 0.34, skin: 0xe9b48e, sleeve: 0x5a6ad8 });
// fingers point toward -x (the hand comes in from the window side, never between camera and paper)
const ROTY = -1.75;
const DIR = [Math.sin(ROTY), Math.cos(ROTY)];
const REACH = 0.19; // wrist → fingertips at this scale
const at = (x, y, z) => [x - DIR[0] * REACH, y, z - DIR[1] * REACH];
const handKeys = (() => {
  const k = [];
  const R = [0.35, ROTY, 0];
  k.push({ t: -0.8, pos: at(0.55, 1.75, 0.15), rot: R, pose: "open" });
  // each fold: grab the edge of the flipping half, lift it over, press the crease
  FOLDS.forEach(([a, d], i) => {
    const [wx, wz] = dimsAfter(i);
    const alongZ = (i + 1) % 2 === 1;
    const edge = alongZ ? [0.0, 1.53, wz / 2] : [wx / 2, 1.53, 0.0];
    k.push({ t: a - 0.06, pos: at(edge[0] + 0.02, edge[1] + 0.02, edge[2]), rot: R, pose: "grab" });
    k.push({
      t: a + d * 0.5,
      pos: at(0.01, 1.53 + (alongZ ? wz : wx) * 0.45, 0.01),
      rot: [0.5, ROTY, 0],
      pose: "grab",
    });
    k.push({ t: a + d, pos: at(0.0, 1.55, 0.0), rot: [0.45, ROTY, 0], pose: "press" });
    if (i === 1) {
      k.push({ t: a + d + 0.35, pos: at(0.3, 1.66, 0.05), rot: R, pose: "open" });
      k.push({ t: T.probier - 0.25, pos: at(0.3, 1.66, 0.05), rot: R, pose: "open" });
    }
  });
  // fold 8: grab, strain (fist), give up
  k.push({ t: FAIL[0], pos: at(0.04, 1.56, 0.0), rot: R, pose: "grab" });
  k.push({ t: FAIL[0] + 0.3, pos: at(0.02, 1.6, 0.0), rot: [0.6, ROTY, 0], pose: "fist" });
  k.push({ t: FAIL[1], pos: at(0.03, 1.59, 0.0), rot: [0.6, ROTY, 0], pose: "fist" });
  k.push({ t: FAIL[1] + 0.35, pos: at(0.22, 1.66, 0.04), rot: R, pose: "open" });
  // knock knock on the block ("hart wie ein Brett")
  k.push({ t: T.hart - 0.12, pos: at(0.04, 1.68, 0.0), rot: [0.9, ROTY, 0], pose: "fist" });
  k.push({ t: T.hart + 0.1, pos: at(0.03, 1.6, 0.0), rot: [0.9, ROTY, 0], pose: "fist" });
  k.push({ t: T.hart + 0.25, pos: at(0.04, 1.68, 0.0), rot: [0.9, ROTY, 0], pose: "fist" });
  k.push({ t: T.hart + 0.4, pos: at(0.03, 1.6, 0.0), rot: [0.9, ROTY, 0], pose: "fist" });
  k.push({ t: T.brett + 0.2, pos: at(0.12, 1.7, 0.02), rot: [0.6, ROTY, 0], pose: "open" });
  k.push({ t: T.hier + 0.4, pos: at(0.8, 1.95, 0.1), rot: R, pose: "open", out: true });
  k.sort((p, q) => p.t - q.t);
  return k;
})();

// warm classroom lights (the room is closed; the sun alone leaves it dull)
for (const [x, z] of [
  [0, 1],
  [0, -4],
  [-4.5, -1],
]) {
  const l = new THREE.PointLight(0xfff0d8, 9, 14, 1.2);
  l.position.set(x, 5.8, z);
  school.add(l);
}

// ---------------------------------------------------------------- magic sparkles ("ohne Grenze")
const sparkM = new THREE.MeshBasicMaterial({
  color: 0xbff0ff,
  transparent: true,
  opacity: 0.95,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});
const sparks = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.008, 0), sparkM, 60);
sparks.frustumCulled = false;
sparks.userData.noAO = true;
school.add(sparks);
const m4 = new THREE.Matrix4();
const q0 = new THREE.Quaternion();
function drawSparks(t, k, cx, cy, cz, rad) {
  sparks.visible = k > 0;
  if (k <= 0) return;
  for (let i = 0; i < 60; i++) {
    const ph = (i * 0.618) % 1;
    const a = t * (1.5 + ph) + i;
    const rr = rad * (0.6 + 0.6 * ph);
    const y = cy + ((t * 0.4 + ph) % 1) * 0.25;
    const s = k * (0.5 + 0.5 * Math.sin(t * 9 + i));
    m4.compose(V(cx + Math.cos(a) * rr, y, cz + Math.sin(a) * rr), q0, V(s, s, s));
    sparks.setMatrixAt(i, m4);
  }
  sparks.instanceMatrix.needsUpdate = true;
}

// ---------------------------------------------------------------- doubling demo (sheet layers)
const layers = [];
for (let i = 0; i < 8; i++) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.006, 0.3), mats);
  m.castShadow = true;
  m.receiveShadow = true;
  school.add(m);
  layers.push(m);
}
function drawLayers(t) {
  const on = t >= T.jeder && t < T.am;
  const steps = [T.knick1, T.verdoppelt, T.stapel1];
  let n = 1;
  layers.forEach((m, i) => {
    m.visible = on && i < 8;
  });
  if (!on) return;
  // layer i belongs to doubling step s (0: 1 layer, 1: 2, 2: 4, 3: 8)
  layers.forEach((m, i) => {
    const step = i === 0 ? 0 : Math.ceil(Math.log2(i + 1));
    const at = step === 0 ? T.jeder - 1 : steps[step - 1];
    if (t < at) {
      m.visible = false;
      return;
    }
    n = Math.max(n, i + 1);
    const drop = 1 - smooth(ramp(t, at, at + 0.22));
    m.position.set(0, DESK + 0.004 + i * 0.011 + drop * 0.25, 0);
    m.rotation.y = drop * 0.4;
  });
}

// ---------------------------------------------------------------- hair macro (enlarged)
const macro = new THREE.Group();
macro.position.set(...HAIR_POS);
school.add(macro);
{
  const sh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.004, 0.09), mats);
  sh.position.set(0.02, 0.002, -0.03);
  sh.castShadow = true;
  macro.add(sh);
  const pts = [];
  for (let i = 0; i <= 30; i++)
    pts.push(V(-0.08 + i * 0.006, 0.0018, 0.018 + Math.sin(i * 0.5) * 0.002));
  const hair = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.0018, 8),
    real.gloss(0x3a2414, { roughness: 0.35 }),
  );
  hair.castShadow = true;
  macro.add(hair);
}

// ---------------------------------------------------------------- the column (rooms, outside)
const colM = real.plastic(0xf8f5ec, { roughness: 0.9, clearcoat: 0 });
const column = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), colM);
column.castShadow = true;
column.receiveShadow = true;
school.add(column);
// ceiling debris
const debris = [];
for (let i = 0; i < 14; i++) {
  const d = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.06 + (i % 4) * 0.03, 0),
    real.plastic(0xf0e6d2, { roughness: 1 }),
  );
  d.castShadow = true;
  school.add(d);
  debris.push(d);
}
// roof debris (outside)
const hole = new THREE.Mesh(
  new THREE.CylinderGeometry(0.7, 0.9, 0.4, 10),
  real.plastic(0x3a3632, { roughness: 1 }),
);
hole.position.set(0, 6.5 - 0.1, 0);
school.add(hole);

// ---------------------------------------------------------------- the column in the air + in space
const airCol = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  real.plastic(0xfbf8f0, {
    roughness: 0.85,
    clearcoat: 0,
    emissive: 0x404040,
    emissiveIntensity: 0.25,
  }),
);
airCol.castShadow = true;
air.add(airCol);
const spaceCol = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  real.plastic(0xfbf8f0, {
    roughness: 0.85,
    clearcoat: 0,
    emissive: 0x6a6a72,
    emissiveIntensity: 0.35,
  }),
);
space.add(spaceCol);
const moon = space.getObjectByName("moon");
const rocks = [];
for (let i = 0; i < 16; i++) {
  const r = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.25 + (i % 3) * 0.15, 0),
    real.plastic(0x9a98a0, { roughness: 1 }),
  );
  space.add(r);
  rocks.push(r);
}

// ---------------------------------------------------------------- render
function renderAt(t) {
  const w = worldAt(t);
  const inSchool = w === "room" || w === "ext" || w === "tp";
  ground.visible = inSchool;
  air.visible = w === "air";
  space.visible = w === "space";
  for (const o of skyBits) o.visible = w !== "space";
  scene.fog = w === "space" ? null : baseFog;
  if (baseFog) {
    baseFog.near = w === "air" ? 160 : 70;
    baseFog.far = w === "air" ? 520 : 260;
  }
  tp.visible = w === "tp";

  // --- the sheet, folded by hand (until "ohne Grenze")
  const handOn = t < T.jeder;
  sheet.visible = t < T.jeder;
  hand.track(t, handKeys);
  if (sheet.visible) {
    const s = sheetAt(t);
    // magic: the block glows and lifts slightly on "ohne Grenze"
    const g = pop(t, T.hier + 0.3, T.jeder, 0.5);
    glowM.opacity = 0.55 * g;
    glowBox.scale.set(s.wx * 1.4, s.th * 1.6, s.wz * 1.4);
    glowBox.position.set(0, s.th / 2, 0);
    sheet.position.y = DESK + 0.06 * smooth(ramp(t, T.grenze - 0.3, T.grenze + 0.3));
    drawSparks(t, g, 0, DESK + 0.02, 0, 0.12);
  } else {
    drawSparks(t, 0);
  }
  void handOn;
  showNope(pop(t, T.schluss, T.hart - 0.1), 0.0, DESK + 0.16, 0.05, 0.12);

  // --- doubling demo + hair macro
  drawLayers(t);
  macro.visible = t >= T.am && t < T.zehn + 0.6;

  // --- the column
  const n = foldsAt(t);
  const colOn = (w === "room" || w === "ext") && t >= T.zehn;
  column.visible = colOn;
  if (colOn) {
    const h = 0.0002 * 2 ** n;
    const wd = w === "ext" ? 1.6 : 0.16;
    column.scale.set(wd, h, wd * 0.75);
    column.position.set(0, DESK + h / 2, 0);
  }
  // ceiling breaks
  const crashed = t >= T_CRASH;
  hole.visible = crashed && w === "room";
  puff("ceil", t, T_CRASH, 0, 6.3, 0, 1.6, 0xf3ebde);
  debris.forEach((d, i) => {
    const k = t - T_CRASH;
    d.visible = w === "room" && k >= 0 && k < 1.6;
    if (!d.visible) return;
    const a = i * 2.39;
    const v = 0.6 + (i % 5) * 0.25;
    d.position.set(Math.cos(a) * v * k, Math.max(0.05, 6.4 - 4.9 * k * k), Math.sin(a) * v * k);
    d.rotation.set(k * 5 + i, k * 3, 0);
  });
  puff("roof", t, T.haus + 0.05, 0, 22.2, 0, 3, 0xe8dcc8);

  // --- air: the airliner cruises, the column punches up through the clouds
  if (w === "air") {
    airliner.position.set(-18 + (t - T.wieOft) * 5, 16 + Math.sin(t * 0.8) * 0.15, -7);
    airliner.rotation.set(0, 0, Math.sin(t * 0.6) * 0.02);
    const top = ((0.0001 * 2 ** n) / 1000 - 2) * 2;
    const bot = -60;
    const hh = Math.max(0.01, top - bot);
    airCol.scale.set(1.6, hh, 1.6);
    airCol.position.set(0, bot + hh / 2, 0);
    puff("deck", t, T.nur + 0.45, 0, 0.5, 0, 6, 0xffffff);
  }

  // --- space: out of the atmosphere, then to the Moon
  if (w === "space") {
    let top;
    if (t < T.weltrekord) top = 0.6 + 3.4 * smooth(ramp(t, T.weltall - 0.05, T.weltall + 1.0));
    else {
      const k = clamp01((n - 30) / 12);
      top = 4 * ((MOON.y - MOON_R + 0.2) / 4) ** k;
    }
    spaceCol.scale.set(0.8, top + 1, 0.6);
    spaceCol.position.set(0, top / 2 - 0.5, 0);
    // impact: the Moon is knocked back a little, rocks fly
    const hit = t - T.mond;
    moon.position.set(
      MOON.x,
      MOON.y +
        (hit > 0
          ? 0.6 * Math.sin(Math.min(hit, 1.2) * 4) * Math.exp(-hit * 2) +
            0.15 * smooth(clamp01(hit * 3))
          : 0),
      MOON.z,
    );
    moon.rotation.set(hit > 0 ? 0.1 * Math.exp(-hit) * Math.sin(hit * 9) : 0, t * 0.02, 0);
    rocks.forEach((r, i) => {
      r.visible = hit > 0 && hit < 4;
      if (!r.visible) return;
      const a = i * 2.39;
      const sp = 3 + (i % 4) * 1.6;
      r.position.set(
        Math.cos(a) * sp * hit,
        MOON.y - MOON_R + Math.sin(i) * 0.5 - 0.6 * hit - 0.3 * hit * hit,
        Math.sin(a) * sp * hit,
      );
      r.rotation.set(hit * 3 + i, hit * 2, 0);
    });
    puff("moon", t, T.mond, 0, MOON.y - MOON_R, 0, 7, 0xd8d6dc);
  }

  // --- the fold counter (device-style display)
  const showCount =
    t >= T.probier - 0.1 && !(t >= T.jeder && t < T.zehn) && w !== "tp" && t < T.cta - 0.1;
  const cy = t >= T.fakt - 0.1 && t < T.mond + 0.4 ? 560 : 300; // below the "WUSSTEST DU?" badge
  const handN = (() => {
    let d = 0;
    FOLDS.forEach(([a, dd], i) => {
      if (t >= a + dd * 0.6) d = i + 1;
    });
    return d;
  })();
  const shownN = t < T.jeder ? handN : Math.floor(n + 0.001);
  counter("n", showCount ? pop(t, T.probier - 0.1, 99) : 0, {
    label: "KNICKE",
    value: shownN,
    x: 70,
    y: cy,
    color: "#ffd23f",
  });
  counter("rec", w === "tp" ? pop(t, T.weltrekord, T.knick3) : 0, {
    label: "WELTREKORD",
    value: 12,
    x: 70,
    y: cy,
    color: "#7fe0ff",
  });

  // LED panel only for the doubling
  if (t >= T.verdoppelt && t < T.am)
    showPanel(pop(t, T.verdoppelt, T.am), "JEDER KNICK", "×2", LED.yellow);
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
