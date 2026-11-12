// #79 Geschüttelte Cola (Format B) — you shake a cola can in the U-Bahn and
// tap the lid. Cold open: the fountain already spraying over your phone.
// Then the act (shake, tap, tab), the fountain in slow motion, a cutaway of
// a fresh can (bubbles from shaking, the gas swelling them when it opens),
// the gas of one can as a bubble beside it, 1000 cans filling the aisle
// (the study), waiting with a stopwatch, and the ice-cold can.
// The can is a real 0.33 l can at giant scale (1 unit ≈ 5 cm), built like
// #63's can.
import {
  THREE,
  ramp,
  smooth,
  outBack,
  pop,
  lerp,
  clamp01,
  V,
  rng,
  scene,
  renderer,
  real,
  roundedBox,
  showNope,
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
import { tex } from "./set.js";
import { createHand } from "./hand.js";
import { gauge, counter, stopwatch, readout } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS, CANS, TAPS } from "./beats.js";

highlights(HIGHLIGHTS);
renderer.localClippingEnabled = true;

// ---------------------------------------------------------------- can
const R = 0.66;
const clip = new THREE.Plane(V(0, 0, -1), 1e4); // keeps z <= constant
const clipped = (m) => ((m.clippingPlanes = [clip]), m);

const printTex = tex(2048, 1024, (c, w, h) => {
  c.fillStyle = "#c40f22";
  c.fillRect(0, 0, w, h);
  c.fillStyle = "#9e0a1a";
  c.fillRect(0, h * 0.86, w, h * 0.14);
  c.strokeStyle = "#ffffff";
  c.lineWidth = 34;
  c.beginPath();
  for (let x = 0; x <= w; x += 8) {
    const y = h * 0.72 + Math.sin((x / w) * Math.PI * 4) * h * 0.06;
    if (x === 0) c.moveTo(x, y);
    else c.lineTo(x, y);
  }
  c.stroke();
  c.fillStyle = "#ffffff";
  c.textAlign = "center";
  c.textBaseline = "middle";
  for (const u of [0.25, 0.75]) {
    c.save();
    c.translate(w * u, h * 0.42);
    c.font = "italic 900 230px Montserrat, sans-serif";
    c.fillText("COLA", 0, 0);
    c.font = "800 52px Montserrat, sans-serif";
    c.fillText("CLASSIC · 0,33 l", 0, h * 0.18);
    c.restore();
  }
  c.font = "700 26px Montserrat, sans-serif";
  c.fillStyle = "rgba(255,255,255,0.75)";
  for (const u of [0.0, 0.5])
    c.fillText("koffeinhaltig · gekühlt servieren", w * u + 260, h * 0.93);
});
const frostTex = tex(1024, 1024, (c, w, h) => {
  const rr = rng(7);
  c.clearRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) {
    c.fillStyle = `rgba(240,248,255,${0.12 + rr() * 0.5})`;
    const s = 1 + rr() * 5;
    c.fillRect(rr() * w, rr() * h, s, s);
  }
  // condensation drops
  for (let i = 0; i < 260; i++) {
    const x = rr() * w;
    const y = rr() * h;
    const r = 3 + rr() * 9;
    const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r);
    g.addColorStop(0, "rgba(255,255,255,0.95)");
    g.addColorStop(1, "rgba(200,225,255,0.25)");
    c.fillStyle = g;
    c.beginPath();
    c.ellipse(x, y, r * 0.8, r, 0, 0, 6.3);
    c.fill();
  }
});

const printMat = clipped(
  new THREE.MeshPhysicalMaterial({
    map: printTex,
    color: 0xffffff,
    metalness: 0.35,
    roughness: 0.28,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
  }),
);
const aluMat = clipped(real.metal(0xd2d6dc, { roughness: 0.22 }));
const innerMat = clipped(real.metal(0xb9bec6, { roughness: 0.35, side: THREE.BackSide }));
const frostMat = clipped(
  new THREE.MeshStandardMaterial({
    map: frostTex,
    color: 0xf4f9ff,
    transparent: true,
    opacity: 0,
    roughness: 0.6,
    depthWrite: false,
  }),
);

const can = (() => {
  const g = new THREE.Group();
  const add = (m) => {
    m.castShadow = true;
    m.receiveShadow = true;
    m.userData.noAO = true;
    g.add(m);
    return m;
  };
  const body = add(new THREE.Mesh(new THREE.CylinderGeometry(R, R, 1.9, 128, 1, true), printMat));
  body.position.y = 1.15;
  body.rotation.y = -Math.PI / 2;
  const low = [
    [0.5, 0.02],
    [0.55, 0.03],
    [0.61, 0.08],
    [0.645, 0.14],
    [R, 0.2],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  add(new THREE.Mesh(new THREE.LatheGeometry(low, 96), aluMat));
  const up = [
    [R, 2.1],
    [0.645, 2.18],
    [0.6, 2.26],
    [0.555, 2.33],
    [0.545, 2.37],
    [0.56, 2.41],
    [0.55, 2.44],
    [0.52, 2.43],
    [0.505, 2.39],
    [0.0, 2.385],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  add(new THREE.Mesh(new THREE.LatheGeometry(up, 96), aluMat));
  const liner = add(
    new THREE.Mesh(new THREE.CylinderGeometry(R - 0.004, R - 0.004, 2.2, 96, 1, true), innerMat),
  );
  liner.position.y = 1.18;
  // tab on its rivet; the pull end points to +z
  const tab = new THREE.Group();
  const tabMesh = new THREE.Mesh(roundedBox(0.2, 0.025, 0.38, 0.012), aluMat);
  tabMesh.position.z = 0.12;
  tabMesh.castShadow = true;
  tab.add(tabMesh);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.012, 8, 24), aluMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0, 0.01, 0.2);
  tab.add(ring);
  tab.position.set(0, 2.4, -0.02);
  g.add(tab);
  const score = new THREE.Mesh(
    new THREE.TorusGeometry(0.11, 0.008, 6, 32),
    real.metal(0x9aa0a8, { roughness: 0.4 }),
  );
  score.rotation.x = Math.PI / 2;
  score.scale.set(1, 1.5, 1);
  score.position.set(0, 2.392, -0.28);
  g.add(score);
  // the opening (dark, shown once the tab has pushed it in)
  const mouth = new THREE.Mesh(
    new THREE.CircleGeometry(0.105, 24),
    new THREE.MeshBasicMaterial({ color: 0x140804 }),
  );
  mouth.rotation.x = -Math.PI / 2;
  mouth.scale.set(1, 1.5, 1);
  mouth.position.set(0, 2.396, -0.28);
  g.add(mouth);
  const frost = new THREE.Mesh(
    new THREE.CylinderGeometry(R + 0.008, R + 0.008, 2.2, 96, 1, true),
    frostMat,
  );
  frost.position.y = 1.2;
  frost.userData.noAO = true;
  g.add(frost);
  scene.add(g);
  return { g, tab, mouth };
})();
const MOUTH = V(0, 2.42, -0.28);

// ---------------------------------------------------------------- cutaway face (z = 0)
const section = new THREE.Group();
scene.add(section);
const PROF = [
  [0.5, 0.02],
  [0.55, 0.03],
  [0.61, 0.08],
  [0.645, 0.14],
  [R, 0.2],
  [R, 2.1],
  [0.645, 2.18],
  [0.6, 2.26],
  [0.555, 2.33],
  [0.545, 2.37],
  [0.55, 2.43],
];
const profShape = (inset) => {
  const pts = PROF.map(
    ([x, y]) =>
      new THREE.Vector2(Math.max(0, x - inset), Math.min(2.43 - inset, Math.max(0.02 + inset, y))),
  );
  const all = [
    ...pts,
    ...pts
      .slice()
      .reverse()
      .map((v) => new THREE.Vector2(-v.x, v.y)),
  ];
  return new THREE.ShapeGeometry(new THREE.Shape(all));
};
section.add(
  new THREE.Mesh(profShape(0), real.metal(0xc8202e, { roughness: 0.25, metalness: 0.4 })),
);
const gasFace = new THREE.Mesh(
  profShape(0.055),
  new THREE.MeshStandardMaterial({
    color: 0x8fa3bd,
    roughness: 0.5,
    emissive: 0x2a3d5c,
    emissiveIntensity: 0.5,
  }),
);
gasFace.position.z = 0.002;
section.add(gasFace);
const liqTex = tex(256, 1024, (c, w, h) => {
  const gr = c.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, "#8a3e14");
  gr.addColorStop(0.35, "#5a2408");
  gr.addColorStop(1, "#2d1004");
  c.fillStyle = gr;
  c.fillRect(0, 0, w, h);
});
const liqMat = new THREE.MeshStandardMaterial({
  map: liqTex,
  roughness: 0.12,
  emissive: 0x3a1404,
  emissiveIntensity: 0.35,
});
const LEVEL = 2.06;
const liqFace = new THREE.Mesh(new THREE.PlaneGeometry(2 * (R - 0.055), LEVEL - 0.1), liqMat);
liqFace.position.set(0, 0.05 + (LEVEL - 0.1) / 2, 0.004);
section.add(liqFace);
// foam layer on top of the liquid (grows when the can is opened)
const foamFace = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1),
  new THREE.MeshStandardMaterial({
    color: 0xd9b38a,
    roughness: 0.7,
    emissive: 0x3a2412,
    emissiveIntensity: 0.3,
  }),
);
foamFace.position.z = 0.005;
section.add(foamFace);
section.traverse((o) => o.isMesh && (o.userData.noAO = true));

// ---------------------------------------------------------------- bubbles (in front of the face)
const NB = 220;
const bubMat = new THREE.MeshPhysicalMaterial({
  color: 0xf1dcc0,
  roughness: 0.05,
  transmission: 0,
  clearcoat: 1,
  emissive: 0xffe6c8,
  emissiveIntensity: 0.25,
});
const bubbles = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 14, 10), bubMat, NB);
bubbles.userData.noAO = true;
bubbles.frustumCulled = false;
scene.add(bubbles);
const BS = Array.from({ length: NB }, (_, i) => {
  const r = rng(500 + i);
  const wall = r() < 0.35;
  const side = r() < 0.5 ? -1 : 1;
  return {
    x: wall ? side * (R - 0.05 - r() * 0.02) : (r() * 2 - 1) * 0.56,
    y: 0.18 + r() * 1.8,
    z: 0.02 + r() * 0.05,
    s: 0.012 + r() * r() * 0.032,
    d: r(),
    wall,
    side,
    rise: 0.3 + r() * 0.9,
    ph: r() * 6.3,
  };
});

// ---------------------------------------------------------------- spray (foam out of the mouth)
const NJ = 1100;
const jetMat = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  roughness: 0.18,
  clearcoat: 1,
  clearcoatRoughness: 0.1,
});
const jet = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), jetMat, NJ);
jet.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(NJ * 3), 3);
jet.userData.noAO = true;
jet.frustumCulled = false;
jet.castShadow = true;
scene.add(jet);
const JS = Array.from({ length: NJ }, (_, i) => {
  const r = rng(900 + i);
  return {
    u: r(),
    v: 0.75 + r() * 0.5,
    sx: (r() - 0.5) * 2,
    sz: (r() - 0.5) * 2,
    s: 0.022 + r() * r() * 0.06,
    c: r(),
  };
});
const SPRAYS = [
  { t0: -0.9, dur: 1.7, str: 1, end: T.geschuettelt },
  { t0: T.zischt + 0.25, dur: 2.6, str: 1 },
  { t0: T.schiesst2 + 0.15, dur: 1.4, str: 0.5 },
  { t0: T.steigen + 0.35, dur: 0.45, str: 0.12 },
  { t0: T.kaelte + 0.35, dur: 0.4, str: 0.1 },
];

// ---------------------------------------------------------------- mess: cola puddles on the seat + phone
const messMat = real.gloss(0x3a1606, { roughness: 0.08 });
const mess = new THREE.Group();
scene.add(mess);
{
  const r = rng(31);
  const spots = [
    [0.4, 0.02, 1.2, 0.9],
    [1.3, 0.02, 0.2, 0.7],
    [-0.9, 0.02, 0.9, 0.6],
    [2.2, 0.17, 0.7, 0.55],
    [2.6, 0.17, 0.1, 0.4],
    [2.0, 0.17, 1.3, 0.35],
    [-1.6, 0.02, -0.4, 0.45],
    [0.9, 0.02, -1.4, 0.5],
    [3.4, 0.02, 1.6, 0.6],
  ];
  for (const [x, y, z, s] of spots) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 8), messMat);
    m.position.set(x, y, z);
    m.scale.set(s * (0.8 + r() * 0.4), 0.025, s * (0.7 + r() * 0.5));
    m.userData.s = m.scale.clone();
    mess.add(m);
  }
  // drops on the phone screen
  for (let i = 0; i < 14; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), messMat);
    m.position.set(1.8 + r() * 1.2, 0.18, -0.6 + r() * 2.4);
    const s = 0.05 + r() * 0.08;
    m.scale.set(s, s * 0.5, s);
    m.userData.s = m.scale.clone();
    mess.add(m);
  }
}

// ---------------------------------------------------------------- the gas of one can (1 litre ≈ 3 cans)
const gasBall = new THREE.Mesh(
  new THREE.SphereGeometry(1, 48, 32),
  new THREE.MeshPhysicalMaterial({
    color: 0xbfe6ff,
    roughness: 0.05,
    transparent: true,
    opacity: 0.55,
    clearcoat: 1,
    emissive: 0x3d8fd6,
    emissiveIntensity: 0.7,
    depthWrite: false,
  }),
);
gasBall.userData.noAO = true;
scene.add(gasBall);
const gasDots = new THREE.InstancedMesh(
  new THREE.SphereGeometry(1, 8, 6),
  new THREE.MeshBasicMaterial({ color: 0xeaf6ff }),
  60,
);
gasDots.frustumCulled = false;
scene.add(gasDots);
const GD = Array.from({ length: 60 }, (_, i) => {
  const r = rng(700 + i);
  const th = r() * 6.3;
  const ph = Math.acos(2 * r() - 1);
  const rad = Math.cbrt(r()) * 0.85;
  return V(
    Math.sin(ph) * Math.cos(th) * rad,
    Math.cos(ph) * rad,
    Math.sin(ph) * Math.sin(th) * rad,
  );
});
const GAS_R = 1.31;
const GAS_C = V(1.75, 1.75, 1.0);

// ---------------------------------------------------------------- 1000 beer cans in the aisle
const beerTex = tex(512, 256, (c, w, h) => {
  c.fillStyle = "#1f6b3a";
  c.fillRect(0, 0, w, h);
  c.fillStyle = "#e9c75a";
  c.fillRect(0, h * 0.36, w, h * 0.3);
  c.fillStyle = "#1f6b3a";
  c.font = "900 64px Montserrat, sans-serif";
  c.textAlign = "center";
  for (const u of [0.25, 0.75]) c.fillText("PILS", w * u, h * 0.6);
});
const beerGeo = new THREE.CylinderGeometry(R, R, 2.4, 32);
beerGeo.translate(0, 1.2, 0);
const NC = 1000;
const beer = new THREE.InstancedMesh(
  beerGeo,
  [
    real.metal(0xffffff, { map: beerTex, roughness: 0.3, metalness: 0.5 }),
    real.metal(0xd2d6dc, { roughness: 0.25 }),
    real.metal(0xd2d6dc),
  ],
  NC,
);
beer.castShadow = true;
beer.frustumCulled = false;
scene.add(beer);
const POLES = [
  [-7.5, 7],
  [16, 7],
  [-12, 30],
  [24, 30],
];
const CS = [];
{
  const r = rng(77);
  for (let i = 0; i < NC; i++) {
    const col = i % 40;
    const row = Math.floor(i / 40);
    const x = CANS.x + (col - 19.5) * 1.55 + (r() - 0.5) * 0.15;
    const z = CANS.z - 14 + row * 1.55 + (r() - 0.5) * 0.15;
    const blocked = POLES.some(([px, pz]) => Math.hypot(x - px, z - pz) < 1.6);
    CS.push({ x, z, ry: r() * 6.3, d: Math.hypot(x - CANS.x, z - (CANS.z + 10)), blocked });
  }
}
const maxD = Math.max(...CS.map((c) => c.d));

// ---------------------------------------------------------------- the hand
const hand = createHand({ scale: 3.0, sleeve: 0x2b2f3a, skin: 0xe9b48f });
scene.add(hand.group);
const TIP = 1.7; // wrist → index fingertip at scale 3
const dirOf = (rot) => V(0, 0, 1).applyEuler(new THREE.Euler(...rot));
// a key whose index fingertip sits at `tip`
const tipKey = (t, tip, rot, pose = "point", extra = {}) => {
  const d = dirOf(rot);
  return {
    t,
    pos: [tip[0] - d.x * TIP, tip[1] - d.y * TIP, tip[2] - d.z * TIP],
    rot,
    pose,
    ...extra,
  };
};
const DOWN = [-1.15, Math.PI, 0]; // from behind, index pointing down onto the lid
const SIDE = [0, -Math.PI / 2 + 0.25, 0]; // from the right, pointing at the wall
const GRIP = { pos: [-0.82, 2.95, 0.15], rot: [Math.PI / 2, 0, Math.PI / 2] };

// height of the fingertip above its target while tapping (0 at a tap)
function tapLift(t) {
  let l = 1;
  for (const a of TAPS) {
    const d = Math.abs(t - a);
    if (d < 0.14) l = Math.min(l, smooth(d / 0.14));
  }
  return l;
}

// ---------------------------------------------------------------- cold light (Übrigens)
const coldLight = new THREE.PointLight(0x6fc3ff, 0, 14, 1.4);
coldLight.position.set(2.5, 3, 3);
scene.add(coldLight);

const m4 = new THREE.Matrix4();
const q = new THREE.Quaternion();
const tmp = V(0, 0, 0);
const col = new THREE.Color();
const brown = new THREE.Color(0x4a1c08);
const tan = new THREE.Color(0xe2c49c);
const vel = V(0, 0, 0);
const qv = new THREE.Quaternion();
const yAxis = V(0, 1, 0);

function spray(t, mouthW) {
  // the most recent spray still in the air
  let ev = null;
  for (const e of SPRAYS) if (t >= e.t0 && t < Math.min(e.end ?? 1e9, e.t0 + e.dur + 1.6)) ev = e;
  jet.visible = !!ev;
  if (!ev) return;
  const n = Math.round(NJ * Math.min(1, ev.str * 1.3));
  for (let i = 0; i < NJ; i++) {
    const s = JS[i];
    const e = ev.t0 + s.u * ev.dur;
    const a = t - e;
    if (i >= n || a < 0 || a > 1.6) {
      m4.makeScale(0, 0, 0);
      jet.setMatrixAt(i, m4);
      continue;
    }
    const fade = 1 - 0.55 * s.u; // weaker as the can empties
    const up = (5.6 + 3.4 * Math.sqrt(ev.str)) * s.v * fade * Math.sqrt(ev.str);
    const vx = (1.0 + s.sx * 1.4) * ev.str;
    const vz = (0.4 + s.sz * 1.2) * ev.str;
    tmp.set(mouthW.x + vx * a, mouthW.y + up * a - 5.2 * a * a, mouthW.z + vz * a);
    // land on the seat (or the phone)
    const onPhone = tmp.x > 1.6 && tmp.x < 3.3 && tmp.z > -0.9 && tmp.z < 2.1;
    const floorY = onPhone ? 0.18 : 0.03;
    let sc = s.s * (0.8 + Math.min(0.7, a)) * (0.5 + 0.5 * ev.str);
    if (tmp.y < floorY) {
      tmp.y = floorY;
      m4.compose(tmp, q, V(sc * 1.6, sc * 0.25, sc * 1.6));
    } else {
      // stretched along its velocity: reads as a liquid jet, not balls
      vel.set(vx, up - 10.4 * a, vz);
      const sp = vel.length();
      qv.setFromUnitVectors(yAxis, vel.normalize());
      m4.compose(tmp, qv, V(sc, sc * (1 + Math.min(3.5, sp * 0.45)), sc));
    }
    jet.setMatrixAt(i, m4);
    col.copy(brown).lerp(tan, (0.15 + 0.6 * s.c) * clamp01(1.2 - a));
    jet.setColorAt(i, col);
  }
  jet.instanceMatrix.needsUpdate = true;
  jet.instanceColor.needsUpdate = true;
}

function renderAt(t) {
  // ---------------- phases
  const cut = (t >= T.schuld && t < T.forscher) || (t >= T.was && t < T.steigen);
  clip.constant = cut ? 0 : 1e4;
  section.visible = cut;
  bubbles.visible = cut;

  // ---------------- can: shaking + tab
  const shakeA = t >= T.geschuettelt - 0.2 && t < T.rettet - 0.3 ? 1 : 0;
  const shakeB =
    t >= T.schuetteln && t < T.schuetteln + 1.0
      ? 1 - ramp(t, T.schuetteln + 0.7, T.schuetteln + 1.0)
      : 0;
  const sh = Math.sin(t * Math.PI * 2 * 6.5);
  const lift = shakeA * (0.55 + 0.35 * sh);
  can.g.position.set(0, lift, 0);
  can.g.rotation.set(0, 0, shakeA * 0.22 * sh + shakeB * 0.12 * Math.sin(t * 40));

  // tab angle: opened in the act, in the cutaway, while waiting and with the cold can
  const opens = [
    [T.doch1 + 0.25, T.zischt + 0.05, T.schuld],
    [T.machst + 0.2, T.machst + 0.4, T.klopfen1],
    [T.steigen + 0.1, T.steigen + 0.35, T.fakt],
    [T.kaelte + 0.1, T.kaelte + 0.35, T.klopfst2],
  ];
  let tabA = 0;
  let open = t < T.geschuettelt; // cold open: already open
  if (open) tabA = 0.25;
  for (const [a, b, e] of opens) {
    if (t >= a && t < e) {
      const k = ramp(t, a, b);
      tabA = t < b ? k * 1.1 : lerp(1.1, 0.25, ramp(t, b, b + 0.4));
      if (t >= b - 0.05) open = true;
    }
  }
  if (t >= T.klopfst2) {
    open = true;
    tabA = 0.25;
  }
  can.tab.rotation.x = -tabA;
  can.mouth.visible = open;

  // ---------------- frost (Übrigens)
  const cold = t >= T.fakt && t < T.klopfst2 ? ramp(t, T.fakt, T.kalte + 0.4) : 0;
  frostMat.opacity = cold * 0.9;
  coldLight.intensity = cold * 22;
  if (cold > 0) puff("cold", t, T.kalte, 0.2, 2.5, 0.4, 0.8, 0xe6f6ff);

  // ---------------- hand
  hand.track(t, [
    // shake: grip the can from the left
    { t: T.geschuettelt - 0.3, ...GRIP, pose: "grab" },
    { t: T.rettet - 0.35, ...GRIP, pose: "grab" },
    // taps on the lid
    tipKey(T.rettet - 0.2, [0.05, 2.75, 0.05], DOWN),
    tipKey(T.doch1 - 0.05, [0.05, 2.75, 0.05], DOWN),
    // finger under the tab, lifting it
    tipKey(T.doch1 + 0.2, [0, 2.47, 0.22], DOWN),
    tipKey(T.zischt + 0.05, [0, 2.85, 0.16], DOWN),
    tipKey(T.zischt + 0.45, [-1.2, 4.2, 1.4], DOWN, "open", { out: true }),
    // tapping the wall in the cutaway
    tipKey(T.klopfen1 - 0.05, [R + 0.6, 1.25, 0.25], SIDE),
    tipKey(T.klopfen1 + 0.15, [R + 0.25, 1.25, 0.25], SIDE),
    tipKey(T.nichts + 0.5, [R + 0.25, 1.25, 0.25], SIDE),
    tipKey(T.nichts + 0.9, [R + 2, 1.6, 0.8], SIDE, "open", { out: true }),
    // calmly opening after waiting
    tipKey(T.steigen - 0.1, [0, 2.6, 0.3], DOWN),
    tipKey(T.steigen + 0.1, [0, 2.47, 0.22], DOWN),
    tipKey(T.steigen + 0.4, [0, 2.85, 0.16], DOWN),
    tipKey(T.fakt - 0.05, [0, 3.2, 0.3], DOWN, "point", { out: true }),
    // the cold can
    tipKey(T.kaelte - 0.15, [0, 2.65, 0.3], DOWN),
    tipKey(T.kaelte + 0.1, [0, 2.47, 0.22], DOWN),
    tipKey(T.kaelte + 0.4, [0, 2.85, 0.16], DOWN),
    tipKey(T.kaelte + 0.9, [0.3, 3.6, 0.8], DOWN, "point", { out: true }),
    // CTA: tapping again
    tipKey(T.klopfst2 - 0.1, [0.05, 2.75, 0.05], DOWN),
    tipKey(LAST_T, [0.05, 2.75, 0.05], DOWN),
  ]);
  // tapping bounce on the lid / the wall
  const inTapLid = (t >= T.rettet - 0.2 && t < T.doch1) || t >= T.klopfst2 - 0.1;
  const inTapWall = t >= T.klopfen1 + 0.15 && t < T.nichts + 0.5;
  if (inTapLid) hand.group.position.y += -0.3 + 0.3 * tapLift(t) - 0.0;
  if (inTapWall) hand.group.position.x += 0.28 * tapLift(t) - 0.0;
  if (shakeA || (t >= T.geschuettelt - 0.3 && t < T.rettet - 0.35)) {
    hand.group.position.y += lift;
    hand.group.rotation.z += can.g.rotation.z;
  }

  // ---------------- spray + mess
  can.g.updateMatrixWorld();
  const mouthW = MOUTH.clone().applyMatrix4(can.g.matrixWorld);
  spray(t, mouthW);
  let mk = 0;
  if (t < T.geschuettelt) mk = 0.35 + 0.65 * ramp(t, -0.4, 0.9);
  else if (t >= T.schiesst1 && t < T.schuld) mk = ramp(t, T.schiesst1 + 0.3, T.mitten + 0.3);
  else if (t >= T.klopfst2) mk = 1;
  mess.visible = mk > 0;
  mess.children.forEach((m, i) => {
    const k = clamp01(mk * 1.4 - (i % 5) * 0.08);
    m.scale.copy(m.userData.s).multiplyScalar(Math.max(0.001, k));
  });

  // ---------------- cutaway contents
  if (cut) {
    // foam on top while opened in the cutaway
    const P = smooth(ramp(t, T.machst + 0.35, T.schieben + 0.5));
    const foamOn = t >= T.machst && t < T.klopfen1;
    const fh = foamOn ? 0.06 + 0.3 * P : 0.03;
    foamFace.scale.set(2 * (R - 0.03), fh, 1);
    foamFace.position.y = LEVEL - 0.05 + fh / 2;
    const W = t >= T.was ? 1 : 0;
    for (let i = 0; i < NB; i++) {
      const b = BS[i];
      let x = b.x;
      let y = b.y + Math.sin(t * 1.6 + b.ph) * 0.012;
      let s = b.s;
      if (t < T.schuetteln) s *= i < 18 ? 1 : 0;
      else if (t < T.klopfen1 || t >= T.was)
        s *=
          i < 18 ? 1 : outBack(ramp(t, T.schuetteln + b.d * 0.8, T.schuetteln + b.d * 0.8 + 0.25));
      if (foamOn) {
        s *= 1 + 3.2 * P * (0.6 + b.d);
        y += P * P * b.rise * 1.2;
        x *= 1 - 0.1 * P;
      }
      if (t >= T.klopfen1 && t < T.was && b.wall) {
        // the taps knock the wall bubbles loose: they drift in and up a little
        const lk = smooth(ramp(t, T.klopfen1 + 0.3, T.klopfen1 + 1.4));
        x -= b.side * 0.12 * lk;
        y += 0.1 * lk * b.rise;
      }
      if (W) {
        const wk = smooth(ramp(t, T.warten + b.d * 0.5, T.steigen - 0.2 + b.d * 0.3));
        y = lerp(y, LEVEL - 0.03, wk);
        s *= 1 - ramp(wk, 0.85, 1);
      }
      y = Math.min(y, LEVEL - 0.02 + (foamOn ? 0.3 * P : 0));
      s = Math.min(s, 0.2);
      tmp.set(x, y, b.z);
      m4.compose(tmp, q, V(s, s, s));
      bubbles.setMatrixAt(i, m4);
    }
    bubbles.instanceMatrix.needsUpdate = true;
  }

  // ---------------- gas ball (Rate mal)
  const gk = t >= T.gas1 && t < T.machst ? 1 : 0;
  gasBall.visible = gasDots.visible = gk > 0;
  if (gk) {
    const g = outBack(ramp(t, T.gas1 + 0.1, T.liter + 0.1));
    const shrink = 1 - ramp(t, T.machst - 0.25, T.machst);
    const r = lerp(0.15, GAS_R, g) * shrink;
    const c = V(0, 2.6, 0).lerp(GAS_C, smooth(ramp(t, T.gas1, T.liter)));
    gasBall.position.copy(c);
    gasBall.scale.setScalar(Math.max(0.001, r));
    gasBall.rotation.y = t * 0.6;
    for (let i = 0; i < 60; i++) {
      tmp
        .copy(GD[i])
        .applyAxisAngle(V(0, 1, 0), t * 0.8)
        .multiplyScalar(r)
        .add(c);
      m4.compose(tmp, q, V(0.03, 0.03, 0.03).multiplyScalar(r > 0.1 ? 1 : 0));
      gasDots.setMatrixAt(i, m4);
    }
    gasDots.instanceMatrix.needsUpdate = true;
  }
  showPanel(pop(t, T.liter, T.machst - 0.1), "GAS IN EINER DOSE", "1 LITER", LED.yellow);

  // ---------------- pressure: not the culprit
  const dk = pop(t, T.druck - 0.1, T.schuetteln - 0.05);
  gauge("druck", dk, {
    label: "DRUCK",
    value: 2.5,
    max: 6,
    unit: "bar",
    x: 640,
    y: 380,
    digits: 1,
  });
  showNope(pop(t, T.druck + 0.15, T.schuetteln - 0.05), 0.95, 2.75, 0.4, 0.55);

  // ---------------- payoff: tapping does nothing
  showNope(pop(t, T.doch2 + 0.1, T.forscher), -0.15, 1.5, 0.6, 0.9);

  // ---------------- 1000 cans
  const ck = t >= T.forscher - 0.3 && t < T.was;
  beer.visible = ck;
  if (ck) {
    const span = T.unterschied - T.forscher - 0.2;
    for (let i = 0; i < NC; i++) {
      const c = CS[i];
      if (c.blocked) {
        m4.makeScale(0, 0, 0);
        beer.setMatrixAt(i, m4);
        continue;
      }
      const at = T.forscher + 0.1 + (c.d / maxD) * span;
      const sc = t < at ? V(0, 0, 0) : squash(t, at, 0.5);
      tmp.set(c.x, CANS.y, c.z);
      q.setFromAxisAngle(V(0, 1, 0), c.ry);
      m4.compose(tmp, q, sc);
      beer.setMatrixAt(i, m4);
    }
    q.identity();
    beer.instanceMatrix.needsUpdate = true;
  }
  const cnt = Math.round(1000 * smooth(ramp(t, T.forscher + 0.1, T.unterschied)));
  counter("dosen", pop(t, T.forscher, T.was - 0.05), {
    label: "Dosen getestet",
    value: cnt,
    x: 60,
    y: 380,
  });

  // ---------------- waiting
  stopwatch("warten", pop(t, T.warten - 0.1, T.fakt - 0.05), {
    seconds: 150 * smooth(ramp(t, T.warten, T.fakt - 0.2)),
    max: 180,
    label: "WARTEN",
    x: 640,
    y: 380,
  });

  // ---------------- cold
  readout("kalt", pop(t, T.kalte, T.klopfst2 - 0.05), {
    label: "KALTE COLA",
    value: 4,
    unit: "°C",
    note: "hält das Gas fest",
    x: 60,
    y: 560,
    color: "#7fd3ff",
  });

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
const LAST_T = 60;
const applyCamera = shotCamera(shots);
start(renderAt);
