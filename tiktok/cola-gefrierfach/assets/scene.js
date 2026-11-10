// #63 Cola im Gefrierfach (Format B) — the can you forgot in the freezer.
// Frame 0: the can tears open, brown slush spraying (cold open), your hand
// flinching back. Then the act: your hand puts the can into the drawer.
// The can is a real 0.33 l can at giant scale (1 unit ≈ 5 cm); a cutaway
// (per-material clip plane at z = 0) shows the inside: bubbles, the
// supercooled cola, ice growing from the wall inward, CO2 squeezed out.
// Mini-sets: the "open it now" can (slush), the can wall magnified next to a
// hair, a rock and a road split by frost.
import {
  THREE,
  ramp,
  smooth,
  inBack,
  outBack,
  pop,
  lerp,
  clamp01,
  V,
  rng,
  scene,
  renderer,
  flat,
  real,
  roundedBox,
  facet,
  facetMat,
  jitter,
  showNope,
  makeArrowSet,
  animateArrows,
  forceMat,
  showPanel,
  LED,
  labels,
  squash,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { tex } from "./set.js";
import { F, discGeo } from "./environments.js";
import { createHand } from "./hand.js";
import { readout, gauge } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS, CAN2, MAG, FELS } from "./beats.js";

highlights(HIGHLIGHTS);
renderer.localClippingEnabled = true;

// ---------------------------------------------------------------- can
const R = 0.66; // body radius
const clip = new THREE.Plane(V(0, 0, -1), 1e4); // keeps z <= constant
const clipped = (m) => ((m.clippingPlanes = [clip]), m);

const printTex = tex(2048, 1024, (c, w, h) => {
  c.fillStyle = "#c40f22";
  c.fillRect(0, 0, w, h);
  // a darker band low and a white dynamic ribbon
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
  // the name twice around the can (u = 0.25 and 0.75)
  for (const u of [0.25, 0.75]) {
    c.save();
    c.translate(w * u, h * 0.42);
    c.font = "italic 900 230px Montserrat, sans-serif";
    c.fillText("COLA", 0, 0);
    c.font = "800 52px Montserrat, sans-serif";
    c.fillText("CLASSIC · 0,33 l", 0, h * 0.18);
    c.restore();
  }
  // small print
  c.font = "700 26px Montserrat, sans-serif";
  c.fillStyle = "rgba(255,255,255,0.75)";
  for (const u of [0.0, 0.5])
    c.fillText("koffeinhaltig · gekühlt servieren", w * u + 260, h * 0.93);
});
const frostTex = tex(1024, 1024, (c, w, h) => {
  const rr = rng(7);
  c.clearRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) {
    const a = 0.12 + rr() * 0.5;
    c.fillStyle = `rgba(240,248,255,${a})`;
    const s = 1 + rr() * 5;
    c.fillRect(rr() * w, rr() * h, s, s);
  }
  // feathery frost ferns
  c.strokeStyle = "rgba(255,255,255,0.55)";
  c.lineWidth = 2;
  for (let i = 0; i < 60; i++) {
    let x = rr() * w;
    let y = rr() * h;
    let a = rr() * 6.3;
    c.beginPath();
    c.moveTo(x, y);
    for (let k = 0; k < 8; k++) {
      x += Math.cos(a) * 14;
      y += Math.sin(a) * 14;
      a += (rr() - 0.5) * 0.8;
      c.lineTo(x, y);
    }
    c.stroke();
  }
});
frostTex.wrapS = frostTex.wrapT = THREE.RepeatWrapping;

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
const frostMats = [];
const makeFrostMat = () => {
  const m = clipped(
    new THREE.MeshStandardMaterial({
      map: frostTex,
      color: 0xf4f9ff,
      transparent: true,
      opacity: 0,
      roughness: 0.9,
      depthWrite: false,
    }),
  );
  frostMats.push(m);
  return m;
};

function buildCan() {
  const g = new THREE.Group();
  const parts = [];
  const add = (m) => {
    m.castShadow = true;
    m.receiveShadow = true;
    m.userData.noAO = true; // the AO pass ignores clip planes
    g.add(m);
    parts.push(m);
    return m;
  };
  // printed body
  const body = add(new THREE.Mesh(new THREE.CylinderGeometry(R, R, 1.9, 128, 1, true), printMat));
  body.position.y = 1.15;
  body.rotation.y = -Math.PI / 2; // text at u = 0.25 faces +z
  // aluminium shoulder + bottom curve (lathe)
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
  // inner liner so the cutaway shows a metal inside
  const liner = add(
    new THREE.Mesh(new THREE.CylinderGeometry(R - 0.004, R - 0.004, 2.2, 96, 1, true), innerMat),
  );
  liner.position.y = 1.18;
  // bottom dome (flips from inward to outward when the ice pushes)
  const R0 = 0.72;
  const th = Math.asin(0.5 / R0);
  const domeGeo = new THREE.SphereGeometry(R0, 64, 10, 0, Math.PI * 2, 0, th);
  domeGeo.translate(0, -R0 * Math.cos(th), 0);
  const dome = add(
    new THREE.Mesh(
      domeGeo,
      clipped(real.metal(0xc6cbd2, { roughness: 0.3, side: THREE.DoubleSide })),
    ),
  );
  dome.position.y = 0.02;
  // tab + rivet
  const tab = new THREE.Group();
  const tabMesh = add(new THREE.Mesh(roundedBox(0.2, 0.025, 0.38, 0.012), aluMat));
  g.remove(tabMesh);
  tabMesh.position.z = 0.12;
  tab.add(tabMesh);
  const hole = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.012, 8, 24), aluMat);
  hole.rotation.x = Math.PI / 2;
  hole.position.set(0, 0.01, 0.2);
  tab.add(hole);
  tab.position.set(0, 2.4, -0.02);
  g.add(tab);
  // mouth outline (score line) on the lid
  const score = new THREE.Mesh(
    new THREE.TorusGeometry(0.11, 0.008, 6, 32),
    real.metal(0x9aa0a8, { roughness: 0.4 }),
  );
  score.rotation.x = Math.PI / 2;
  score.scale.set(1, 1.5, 1);
  score.position.set(0, 2.392, -0.28);
  g.add(score);
  // frost skin (opacity animated)
  const fm = makeFrostMat();
  const frost = new THREE.Mesh(
    new THREE.CylinderGeometry(R + 0.008, R + 0.008, 2.2, 96, 1, true),
    fm,
  );
  frost.position.y = 1.2;
  frost.userData.noAO = true;
  g.add(frost);
  scene.add(g);
  return { g, dome, tab, frost, fm, body };
}
const can = buildCan();

// ---------------------------------------------------------------- cutaway face (z = 0)
const section = new THREE.Group();
scene.add(section);
const iceTex = tex(512, 1024, (c, w, h) => {
  const rr = rng(11);
  c.fillStyle = "#d9eeff";
  c.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i++) {
    c.strokeStyle = `rgba(255,255,255,${0.25 + rr() * 0.6})`;
    c.lineWidth = 1 + rr() * 3;
    c.beginPath();
    const x = rr() * w;
    const y = rr() * h;
    c.moveTo(x, y);
    c.lineTo(x + (rr() - 0.5) * 120, y + (rr() - 0.5) * 120);
    c.stroke();
  }
  for (let i = 0; i < 400; i++) {
    c.fillStyle = `rgba(150,190,230,${rr() * 0.35})`;
    c.fillRect(rr() * w, rr() * h, 3, 3);
  }
});
iceTex.wrapS = iceTex.wrapT = THREE.RepeatWrapping;
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
const rimFace = new THREE.Mesh(profShape(0), real.metal(0xe0e4ea, { roughness: 0.2 }));
section.add(rimFace);
const iceFace = new THREE.Mesh(
  profShape(0.016),
  new THREE.MeshStandardMaterial({
    map: iceTex,
    roughness: 0.35,
    emissive: 0x5d86b0,
    emissiveIntensity: 0.25,
  }),
);
section.add(iceFace);
const liqTex = tex(256, 1024, (c, w, h) => {
  const gr = c.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, "#6b3214");
  gr.addColorStop(0.5, "#4a200b");
  gr.addColorStop(1, "#2d1206");
  c.fillStyle = gr;
  c.fillRect(0, 0, w, h);
});
const liqMat = new THREE.MeshStandardMaterial({
  map: liqTex,
  roughness: 0.15,
  emissive: 0x2a5a8a,
  emissiveIntensity: 0,
});
const liqFace = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), liqMat);
liqFace.position.z = 0.003;
section.add(liqFace);
const gasFace = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1),
  new THREE.MeshStandardMaterial({ color: 0x1c2533, roughness: 0.6 }),
);
gasFace.position.z = 0.004;
section.add(gasFace);
section.traverse((o) => o.isMesh && (o.userData.noAO = true));
// liquid bounds in can-local coordinates
const IN = { x: R - 0.02, y0: 0.08, y1: 2.3, level: 2.16 };

// bubbles in front of the face
const NB = 70;
const bubGeo = new THREE.SphereGeometry(1, 14, 10);
const bubMat = new THREE.MeshPhysicalMaterial({
  color: 0xfff1dc,
  roughness: 0.05,
  transparent: true,
  opacity: 0.85,
  clearcoat: 1,
  emissive: 0x6b4a2a,
  emissiveIntensity: 0.3,
});
const bubbles = new THREE.InstancedMesh(bubGeo, bubMat, NB);
bubbles.userData.noAO = true;
section.add(bubbles);
const bubSeed = Array.from({ length: NB }, (_, i) => {
  const r = rng(100 + i);
  return [r(), r(), 0.012 + r() * 0.03, r()];
});

// the first crystal: a glinting star on the wall
const starTex = tex(128, 128, (c, w) => {
  const g = c.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(200,235,255,0.6)");
  g.addColorStop(1, "rgba(200,235,255,0)");
  c.fillStyle = g;
  c.fillRect(0, 0, w, w);
  c.strokeStyle = "rgba(255,255,255,0.9)";
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(w / 2, 4);
  c.lineTo(w / 2, w - 4);
  c.moveTo(4, w / 2);
  c.lineTo(w - 4, w / 2);
  c.stroke();
});
const star = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: starTex,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  }),
);
star.userData.noAO = true;
scene.add(star);
// a hexagonal crystal seed + dendrite arms growing from the wall
const crystal = new THREE.Group();
{
  const m = new THREE.MeshPhysicalMaterial({
    color: 0xeaf7ff,
    roughness: 0.05,
    emissive: 0x9fd4ff,
    emissiveIntensity: 0.6,
  });
  const hex = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.01, 6), m);
  hex.rotation.x = Math.PI / 2;
  crystal.add(hex);
  for (let i = 0; i < 6; i++) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.008, 0.006), m);
    const a = (i / 6) * Math.PI * 2;
    arm.position.set(Math.cos(a) * 0.06, Math.sin(a) * 0.06, 0);
    arm.rotation.z = a;
    crystal.add(arm);
  }
  crystal.traverse((o) => (o.userData.noAO = true));
  crystal.position.set(0.6, 1.3, 0.012);
  scene.add(crystal);
}

// force arrows: the ice pushes the wall outward
const pushArrows = makeArrowSet(
  [
    [V(-0.25, 0.7, 0.03), V(-0.95, 0.7, 0.03)],
    [V(0.25, 0.7, 0.03), V(0.95, 0.7, 0.03)],
    [V(-0.25, 1.35, 0.03), V(-0.95, 1.35, 0.03)],
    [V(0.25, 1.35, 0.03), V(0.95, 1.35, 0.03)],
    [V(0, 0.45, 0.03), V(0, -0.15, 0.03)],
    [V(0, 2.0, 0.03), V(0, 2.7, 0.03)],
  ],
  { mat: forceMat, amp: 0, r: 0.035 },
);
pushArrows.group?.traverse?.((o) => (o.userData.noAO = true));

// ---------------------------------------------------------------- the tear + jet
const TEAR_A = 1.15; // angle around the can (0 = +z, faces camera right)
const TEAR_Y = 1.8;
const tearN = V(Math.sin(TEAR_A), 0, Math.cos(TEAR_A));
const tearP = V(tearN.x * R, TEAR_Y, tearN.z * R);
const tear = new THREE.Group();
{
  const slit = new THREE.Mesh(
    new THREE.CircleGeometry(1, 24),
    new THREE.MeshBasicMaterial({ color: 0x1a0904 }),
  );
  slit.scale.set(0.05, 0.42, 1);
  tear.add(slit);
  // two jagged metal flaps bending outward
  for (const s of [-1, 1]) {
    const flap = new THREE.Mesh(
      jitter(new THREE.PlaneGeometry(0.12, 0.42, 2, 6), 0.012, s + 3),
      real.metal(0xd8dce2, { roughness: 0.25, side: THREE.DoubleSide }),
    );
    flap.position.x = s * 0.06;
    flap.userData.side = s;
    tear.add(flap);
  }
  tear.position.copy(tearP).addScaledVector(tearN, 0.006);
  tear.rotation.y = TEAR_A;
  tear.traverse((o) => (o.userData.noAO = true));
  can.g.add(tear);
}
// slush particles
const NJ = 420;
const jetMat = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  roughness: 0.25,
  clearcoat: 0.6,
  sheen: 0.6,
  sheenColor: new THREE.Color(0xffffff),
});
const jet = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), jetMat, NJ);
jet.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(NJ * 3), 3);
jet.userData.noAO = true;
jet.frustumCulled = false;
scene.add(jet);
const jetSeed = Array.from({ length: NJ }, (_, i) => {
  const r = rng(300 + i);
  return {
    d: r(),
    sp: 1.6 + r() * 3.6,
    up: (r() - 0.3) * 2.6,
    side: (r() - 0.5) * 2.0,
    s: 0.012 + r() * r() * 0.05,
    c: r(),
  };
});
// the frozen "worm" of slush growing out of the tear
const wormCurve = new THREE.CatmullRomCurve3(
  [0, 0.15, 0.32, 0.5, 0.7].map((k) =>
    tearP
      .clone()
      .addScaledVector(tearN, k * 1.4)
      .add(V(0, Math.sin(k * 3) * 0.35 - k * k * 0.6, 0)),
  ),
);
const wormGeo = new THREE.TubeGeometry(wormCurve, 80, 0.09, 12);
const wormMat = new THREE.MeshPhysicalMaterial({
  color: 0x7a4a2a,
  roughness: 0.6,
  sheen: 1,
  sheenColor: new THREE.Color(0xf3e3d0),
});
const worm = new THREE.Mesh(wormGeo, wormMat);
worm.castShadow = true;
worm.userData.noAO = true;
scene.add(worm);
// splatter decals (brown, frozen) on things to the right of the can
const splatTex = tex(256, 256, (c, w) => {
  const rr = rng(19);
  c.fillStyle = "#5a2c12";
  c.beginPath();
  for (let i = 0; i <= 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    const rad = w * (0.28 + rr() * 0.14 + (i % 5 === 0 ? 0.12 : 0));
    const x = w / 2 + Math.cos(a) * rad;
    const y = w / 2 + Math.sin(a) * rad;
    if (i) c.lineTo(x, y);
    else c.moveTo(x, y);
  }
  c.fill();
  for (let i = 0; i < 14; i++) {
    c.beginPath();
    c.arc(rr() * w, rr() * w, 4 + rr() * 10, 0, 7);
    c.fill();
  }
  c.fillStyle = "rgba(255,240,225,0.35)";
  for (let i = 0; i < 300; i++) c.fillRect(rr() * w, rr() * w, 2, 2);
});
const splatMat = new THREE.MeshStandardMaterial({
  map: splatTex,
  transparent: true,
  roughness: 0.5,
  depthWrite: false,
  polygonOffset: true,
  polygonOffsetFactor: -2,
});
// [position, normal, size, delay]
const SPLATS = [
  [[2.4, 2.02, -1.4], [0, 1, 0], 0.9, 0.35], // ice-cream lid
  [[3.0, 1.2, -1.12], [0.3, 0, 1], 0.8, 0.4], // ice-cream front
  [[4.65, 1.9, 0.6], [-0.6, 0, 0.8], 0.7, 0.3], // fish-finger box
  [[6.18, 2.8, -0.6], [-1, 0, 0], 1.3, 0.45], // side wall
  [[6.18, 1.6, 1.2], [-1, 0, 0], 0.9, 0.5],
  [[2.0, 0.03, 0.6], [0, 1, 0], 1.1, 0.55], // floor
  [[1.3, 0.03, -0.4], [0, 1, 0], 0.7, 0.6],
  [[3.3, 0.66, 2.0], [0, 1, 0], 0.6, 0.5], // ice tray
  [[1.6, 6.37, -0.5], [0, -1, 0], 1.0, 0.4], // shelf underside
  [[4.2, 2.13, -2.9], [0, 1, 0], 0.8, 0.5],
  [[5.3, 1.0, 0.45], [-0.6, 0, 0.8], 0.6, 0.45],
  [[0.9, 0.03, 1.4], [0, 1, 0], 0.8, 0.65],
];
const splats = SPLATS.map(([p, n, s]) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), splatMat);
  m.position.set(...p);
  m.lookAt(V(...p).add(V(...n)));
  m.userData.size = s;
  m.userData.noAO = true;
  scene.add(m);
  return m;
});

// ---------------------------------------------------------------- what-if can (slush)
const can2 = buildCan();
can2.g.position.set(...CAN2);
const crown = new THREE.Group();
{
  const r = rng(77);
  const m1 = new THREE.MeshPhysicalMaterial({
    color: 0x8a5a36,
    roughness: 0.55,
    sheen: 1,
    sheenColor: new THREE.Color(0xfff0e0),
  });
  const m2 = new THREE.MeshPhysicalMaterial({
    color: 0xd9c2a8,
    roughness: 0.6,
    sheen: 1,
    sheenColor: new THREE.Color(0xffffff),
  });
  for (let i = 0; i < 90; i++) {
    const s = 0.045 + r() * 0.07;
    const lump = new THREE.Mesh(
      jitter(new THREE.IcosahedronGeometry(s, 2), s * 0.15, i),
      i % 3 ? m1 : m2,
    );
    const a = r() * Math.PI * 2;
    const rad = Math.pow(r(), 0.7) * 0.32;
    lump.userData.base = V(
      Math.cos(a) * rad,
      (1 - rad / 0.32) * 0.5 * r() + r() * 0.15,
      Math.sin(a) * rad,
    );
    lump.userData.d = r();
    lump.castShadow = true;
    crown.add(lump);
  }
  crown.position.set(0, 2.38, -0.28);
  can2.g.add(crown);
}
// frost that sweeps down can2 from the top (anchored at the top, scaled down)
const sweepMat = new THREE.MeshStandardMaterial({
  map: frostTex,
  color: 0xffffff,
  transparent: true,
  opacity: 0.95,
  roughness: 0.9,
  depthWrite: false,
});
const sweepGeo = new THREE.CylinderGeometry(R + 0.012, R + 0.012, 2.2, 96, 1, true);
sweepGeo.translate(0, -1.1, 0);
const sweep = new THREE.Mesh(sweepGeo, sweepMat);
sweep.position.y = 2.3;
sweep.userData.noAO = true;
can2.g.add(sweep);

// ---------------------------------------------------------------- hand
const hand = createHand({ scale: 3.0, sleeve: 0x2f3a4f, skin: 0xe9b48f });

// ---------------------------------------------------------------- MAG: wall vs hair
const mag = new THREE.Group();
mag.position.set(...MAG);
scene.add(mag);
{
  const floor = new THREE.Mesh(
    discGeo(9, 0.8, 4),
    new THREE.MeshStandardMaterial({ color: 0x141b2b, roughness: 0.35, metalness: 0.2 }),
  );
  floor.receiveShadow = true;
  mag.add(floor);
  // the wall slab, seen edge-on: 0.1 mm magnified (thickness 0.25)
  const slab = new THREE.Group();
  const metal = new THREE.Mesh(
    roundedBox(0.25, 2.4, 3.2, 0.02),
    real.metal(0xd0d5dc, { roughness: 0.25 }),
  );
  metal.position.y = 1.2;
  metal.castShadow = true;
  slab.add(metal);
  const paint = new THREE.Mesh(new THREE.BoxGeometry(0.03, 2.4, 3.2), real.gloss(0xc40f22));
  paint.position.set(0.14, 1.2, 0);
  slab.add(paint);
  slab.position.set(0, 0, -1.2);
  mag.add(slab);
  // measuring bracket on top
  const yel = new THREE.MeshBasicMaterial({ color: 0xffd23f, toneMapped: false });
  for (const s of [-1, 1]) {
    const tick = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.35, 0.02), yel);
    tick.position.set(s * 0.14, 2.62, 0.4);
    mag.add(tick);
  }
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.02), yel);
  bar.position.set(0, 2.62, 0.4);
  mag.add(bar);
  mag.userData.bracket = [bar];
  // the hair: as thick as the wall
  const pts = [];
  for (let i = 0; i <= 20; i++)
    pts.push(V(Math.sin(i * 0.35) * 0.05, i * 0.16, Math.cos(i * 0.2) * 0.04));
  const hair = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.125, 16),
    new THREE.MeshPhysicalMaterial({
      color: 0x3b2416,
      roughness: 0.35,
      sheen: 1,
      sheenColor: new THREE.Color(0xc9a27a),
      clearcoat: 0.6,
    }),
  );
  hair.position.set(0.85, 0, 0.2);
  hair.castShadow = true;
  mag.add(hair);
  mag.userData.hair = hair;
  const l1 = new THREE.PointLight(0xfff0e0, 30, 14, 1.5);
  l1.position.set(2.5, 4, 4);
  const l2 = new THREE.PointLight(0x4f9dff, 25, 12, 1.5);
  l2.position.set(-3, 3, -3);
  mag.add(l1, l2);
}

// ---------------------------------------------------------------- FELS: rock + road
const fels = new THREE.Group();
fels.position.set(...FELS);
scene.add(fels);
const rockL = new THREE.Group();
const rockR = new THREE.Group();
const crackWater = new THREE.Mesh(
  new THREE.BoxGeometry(0.08, 1.9, 1.6),
  new THREE.MeshStandardMaterial({ color: 0x3f8fd8, roughness: 0.1, emissive: 0x0a2a50 }),
);
const potChunks = [];
const potHole = new THREE.Mesh(
  new THREE.CircleGeometry(0.75, 20),
  new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: 1 }),
);
const roadIce = new THREE.Mesh(
  new THREE.BoxGeometry(1.6, 0.04, 0.05),
  new THREE.MeshStandardMaterial({ color: 0xdff2ff, emissive: 0x6aa8e0, emissiveIntensity: 0.4 }),
);
{
  const snow = new THREE.Mesh(facet(discGeo(10, 0.8, 9), 0.05, 9), facetMat(flat(0xe9f1fb)));
  snow.receiveShadow = true;
  fels.add(snow);
  const rockMat = flat(0x8d8f99, { roughness: 0.9 });
  for (const [grp, s] of [
    [rockL, -1],
    [rockR, 1],
  ]) {
    const geo = jitter(
      new THREE.SphereGeometry(1.4, 9, 7, s < 0 ? Math.PI : 0, Math.PI),
      0.12,
      s + 5,
    );
    const m = F(geo, rockMat, 0.1, s + 8);
    m.rotation.y = Math.PI / 2;
    m.scale.set(1, 0.9, 1);
    m.position.y = 1.15;
    m.castShadow = true;
    grp.add(m);
    // snow cap
    const cap = F(
      jitter(
        new THREE.SphereGeometry(1.32, 9, 4, s < 0 ? Math.PI : 0, Math.PI, 0, 0.7),
        0.06,
        s + 11,
      ),
      flat(0xf6f9ff),
      0.05,
      s + 2,
    );
    cap.rotation.y = Math.PI / 2;
    cap.position.y = 1.3;
    grp.add(cap);
    const capCut = new THREE.Mesh(
      new THREE.CircleGeometry(1.36, 12),
      flat(0x6f717a, { roughness: 0.95, side: THREE.DoubleSide }),
    );
    capCut.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2;
    capCut.scale.set(1, 0.88, 1);
    capCut.position.set(s * 0.005, 1.15, 0);
    grp.add(capCut);
    grp.position.x = s * 0.04;
    fels.add(grp);
  }
  crackWater.position.set(0, 1.15, 0.1);
  fels.add(crackWater);
  // the road in front, with frost under a crack
  const road = new THREE.Mesh(
    facet(new THREE.BoxGeometry(12, 0.2, 2.4, 24, 1, 6), 0.06, 4),
    facetMat(flat(0x3b3e46, { roughness: 0.85 })),
  );
  road.position.set(0, 0.1, 3.0);
  road.receiveShadow = true;
  fels.add(road);
  for (const x of [-4, -1.5, 1, 3.5]) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.01, 0.12), flat(0xf3f3f3));
    line.position.set(x + 1.5, 0.205, 3.0);
    fels.add(line);
  }
  potHole.rotation.x = -Math.PI / 2;
  potHole.position.set(0.2, 0.207, 2.9);
  fels.add(potHole);
  roadIce.position.set(0.2, 0.21, 2.9);
  fels.add(roadIce);
  const r = rng(51);
  for (let i = 0; i < 9; i++) {
    const ch = new THREE.Mesh(
      facet(jitter(new THREE.DodecahedronGeometry(0.16 + r() * 0.12, 0), 0.03, i), 0.06, i),
      facetMat(flat(0x9a9ea8)),
    );
    const a = (i / 9) * Math.PI * 2;
    ch.userData = { a, v: 1.6 + r() * 1.4, up: 2 + r() * 2 };
    ch.castShadow = true;
    fels.add(ch);
    potChunks.push(ch);
  }
  const l1 = new THREE.PointLight(0xfff2e0, 40, 20, 1.4);
  l1.position.set(4, 6, 6);
  const l2 = new THREE.PointLight(0x7fb8ff, 25, 16, 1.4);
  l2.position.set(-4, 3, -3);
  fels.add(l1, l2);
  // a few pines behind
  for (const [x, z, s] of [
    [-4.5, -3.5, 1.3],
    [-2.6, -5, 1.6],
    [3.4, -4.2, 1.4],
    [5.4, -2.2, 1.1],
  ]) {
    const tr = new THREE.Group();
    for (let k = 0; k < 3; k++) {
      const cone = F(
        new THREE.ConeGeometry(0.9 - k * 0.22, 1.2, 7),
        flat(k % 2 ? 0x2f5a46 : 0x274d3c),
        0.08,
        k,
      );
      cone.position.y = 0.9 + k * 0.6;
      tr.add(cone);
      const sn = F(new THREE.ConeGeometry(0.5 - k * 0.12, 0.4, 7), flat(0xf3f7ff), 0.05, k + 4);
      sn.position.y = 1.35 + k * 0.6;
      tr.add(sn);
    }
    tr.scale.setScalar(s);
    tr.position.set(x, 0, z);
    fels.add(tr);
  }
}
// falling snow at the rock
const NS = 120;
const snowFlakes = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.03, 0),
  new THREE.MeshBasicMaterial({ color: 0xffffff }),
  NS,
);
snowFlakes.userData.noAO = true;
snowFlakes.frustumCulled = false;
fels.add(snowFlakes);
const fArrows = makeArrowSet(
  [
    [V(-0.1, 1.2, 0.95), V(-0.75, 1.2, 0.95)],
    [V(0.1, 1.2, 0.95), V(0.75, 1.2, 0.95)],
  ],
  { mat: forceMat, amp: 0, r: 0.05, parent: fels },
);

// ---------------------------------------------------------------- state
const shotList = shots.map((s) => (s.rel ? { ...s, rel: V(...s.rel) } : s));
const applyCamera = shotCamera(shotList);
const COLD = T.gefrierfach; // end of the cold open

// how much the can is frosted (0..1)
const frostK = (t) =>
  t < COLD
    ? 0.95
    : 0.12 +
      0.5 * smooth(ramp(t, T.dose1, T.oeffnest)) +
      0.35 * smooth(ramp(t, T.kristall, T.folge));
// ice thickness inside (0..R)
const iceK = (t) =>
  t < COLD
    ? 0.62
    : 0.2 * smooth(ramp(t, T.kristall + 0.3, T.innen + 0.4)) +
      0.2 * smooth(ramp(t, T.innen + 0.4, T.dagegen)) +
      0.22 * smooth(ramp(t, T.dagegen, T.reisst));
// bottom dome: 0 = inward, 1 = bulged out
const bulgeK = (t) => (t < COLD ? 1 : smooth(ramp(t, T.beult + 0.05, T.beult + 0.3)));
// burst progress (seconds since the tear, scene time)
const burstS = (t) => (t < COLD ? 0.18 + t * 0.55 : t >= T.reisst ? t - T.reisst : -1);
// cutaway shots
const cutOn = (t) =>
  (t >= T.schuld && t < T.oeffnest) ||
  (t >= T.waechst && t < T.boden) ||
  (t >= T.dagegen && t < T.dose3) ||
  (t >= T.sprengen && t < T.fakt);

const m4 = new THREE.Matrix4();
const q = new THREE.Quaternion();
const tmp = V(0, 0, 0);
const col = new THREE.Color();
const brown = new THREE.Color(0x4a220e);
const tan = new THREE.Color(0xd8b48e);

function renderAt(t) {
  // ---- hand: frame 0 reaches for the bursting can and flinches; then the act
  hand.track(t, [
    { t: -0.6, pos: [-1.6, 3.4, 2.6], rot: [0.5, 2.6, 0], pose: "open" },
    { t: 0.1, pos: [-1.1, 3.0, 1.9], rot: [0.6, 2.5, 0], pose: "grab" },
    { t: 0.55, pos: [-2.2, 3.9, 3.0], rot: [0.2, 2.7, 0.3], pose: "open" },
    { t: COLD - 0.05, pos: [-2.6, 4.2, 3.3], rot: [0.2, 2.7, 0.3], pose: "open", out: true },
    // the act: the hand grips the can from the left side and lowers it
    { t: COLD, pos: [-0.82, 5.1, 0.15], rot: [Math.PI / 2, 0, Math.PI / 2], pose: "grab" },
    { t: COLD + 0.65, pos: [-0.82, 2.95, 0.15], rot: [Math.PI / 2, 0, Math.PI / 2], pose: "grab" },
    { t: COLD + 0.9, pos: [-1.15, 3.0, 0.2], rot: [Math.PI / 2, 0, Math.PI / 2], pose: "open" },
    { t: COLD + 1.5, pos: [-1.8, 5.6, 1.0], rot: [1.2, 0, Math.PI / 2], pose: "open", out: true },
  ]);
  // ---- main can
  const placing = t >= COLD && t < COLD + 0.65;
  const lower = placing ? 1 - smooth(ramp(t, COLD, COLD + 0.65)) : 0;
  const b = bulgeK(t);
  const burst = burstS(t);
  can.dome.scale.y = lerp(1, -1.05, b);
  const lift = 0.21 * b;
  const wob =
    t >= COLD
      ? Math.exp(-Math.max(0, t - T.beult - 0.2) * 2.5) * Math.sin((t - T.beult) * 14) * 0.07 * b
      : 0;
  const pressure = t < COLD ? 1 : smooth(ramp(t, T.dagegen, T.reisst));
  const swell = 1 + 0.035 * pressure;
  can.g.position.set(0, lower * 2.2 + lift, 0);
  can.g.rotation.set(0, 0, wob + 0.05 * b);
  can.g.scale.set(swell, 1, swell);
  can.fm.opacity = frostK(t) * 0.9;
  can.frost.material.map.offset.y = 0;
  can.tab.rotation.x = 0;
  // tear opens
  const tk = burst >= 0 ? smooth(clamp01(burst / 0.25)) : 0;
  tear.visible = tk > 0;
  tear.scale.set(0.3 + tk, 0.4 + 0.6 * tk, 1);
  tear.children.forEach((c) => {
    if (c.userData.side) c.rotation.y = c.userData.side * tk * 1.2;
  });
  // jet particles
  const show = burst >= 0;
  jet.visible = show;
  if (show) {
    can.g.updateMatrixWorld();
    const origin = tearP.clone().applyMatrix4(can.g.matrixWorld);
    const dir = tearN.clone().applyQuaternion(can.g.quaternion);
    const side = V(-dir.z, 0, dir.x);
    for (let i = 0; i < NJ; i++) {
      const s = jetSeed[i];
      const tau = burst - s.d * 0.35;
      if (tau <= 0) {
        m4.makeScale(0, 0, 0);
        jet.setMatrixAt(i, m4);
        continue;
      }
      const v = s.sp;
      tmp
        .copy(origin)
        .addScaledVector(dir, v * tau)
        .addScaledVector(side, s.side * tau)
        .add(V(0, s.up * tau - 3.5 * tau * tau, 0));
      // stick to walls / floor
      tmp.x = Math.min(tmp.x, 6.1);
      tmp.y = Math.max(tmp.y, 0.04);
      tmp.z = Math.max(-5.2, Math.min(tmp.z, 3.1));
      const sc = s.s * (1 + Math.min(0.6, tau));
      m4.compose(tmp, q, V(sc, sc, sc));
      jet.setMatrixAt(i, m4);
      col.copy(brown).lerp(tan, clamp01(tau * 0.8) * (0.3 + 0.5 * s.c));
      jet.setColorAt(i, col);
    }
    jet.instanceMatrix.needsUpdate = true;
    jet.instanceColor.needsUpdate = true;
  }
  // frozen worm
  const wk = burst >= 0 ? smooth(clamp01((burst - 0.05) / 0.9)) : 0;
  worm.visible = wk > 0.01;
  worm.geometry.setDrawRange(0, Math.ceil(wk * 80) * 12 * 6);
  worm.position.copy(can.g.position);
  worm.rotation.copy(can.g.rotation);
  // splatters
  splats.forEach((m, i) => {
    const d = SPLATS[i][3];
    const k = burst >= 0 ? smooth(clamp01((burst - d) / 0.25)) : 0;
    m.visible = k > 0.01;
    m.scale.setScalar(m.userData.size * 1.7 * (0.3 + 0.7 * k));
  });

  // ---- cutaway
  const cut = cutOn(t);
  clip.constant = cut ? 0 : 1e4;
  section.visible = cut;
  section.position.copy(can.g.position);
  section.rotation.copy(can.g.rotation);
  section.scale.copy(can.g.scale);
  if (cut) {
    const ice = iceK(t);
    iceFace.position.set(0, 0, 0.001);
    const lw = Math.max(0.001, 2 * (IN.x - ice));
    const ly0 = IN.y0 + ice * 0.55;
    const ly1 = IN.level - ice * 0.25;
    liqFace.scale.set(lw, Math.max(0.001, ly1 - ly0), 1);
    liqFace.position.set(0, (ly0 + ly1) / 2, 0.003);
    liqFace.visible = ice < IN.x - 0.01;
    // supercooled: a cold blue sheen on the liquid
    liqMat.emissiveIntensity =
      0.12 * smooth(ramp(t, T.kaelter, T.fluessig + 0.3)) * (t < T.oeffnest ? 1 : 0.5);
    gasFace.scale.set(1.06, 2.36 - ly1, 1);
    gasFace.position.set(0, (ly1 + 2.36) / 2, 0.004);
    // bubbles
    const squeeze = smooth(ramp(t, T.kohlen, T.kohlen + 1.6)); // CO2 out of the ice, up
    for (let i = 0; i < NB; i++) {
      const [a, ph, s, c] = bubSeed[i];
      const rise = (t * (0.18 + c * 0.25) + ph) % 1;
      let x = (a * 2 - 1) * (lw / 2 - 0.04);
      let y = ly0 + 0.03 + rise * (ly1 - ly0 - 0.06);
      if (squeeze > 0) {
        // start in the ice ring and collect at the top centre
        const sx = (a * 2 - 1) * (IN.x - 0.05);
        const sy = IN.y0 + 0.1 + ph * (IN.y1 - IN.y0 - 0.3);
        const k = clamp01(squeeze * 1.3 - c * 0.3);
        x = lerp(sx, (a - 0.5) * lw * 0.6, k);
        y = lerp(sy, ly1 - 0.05 - c * 0.18, k);
      }
      const vis = t >= T.sprengen ? 0 : 1;
      m4.compose(V(x, y, 0.03 + c * 0.02), q, V(s * vis, s * vis, s * vis));
      bubbles.setMatrixAt(i, m4);
    }
    bubbles.instanceMatrix.needsUpdate = true;
  }
  // "bubbles are not to blame"
  showNope(pop(t, T.blaeschen1 + 0.15, T.erst), 0.0, 1.25, 0.15, 0.6);
  // the first crystal
  const ck = pop(t, T.kristall, T.waechst, 0.2);
  crystal.visible = ck > 0.01 && !cut;
  crystal.scale.setScalar(0.4 + 1.4 * ck * (1 + 0.6 * ramp(t, T.kristall, T.waechst)));
  crystal.rotation.z = t * 0.6;
  star.visible = ck > 0.01;
  star.position.set(0.6, 1.3, 0.03);
  star.scale.setScalar(0.35 * ck * (1 + 0.3 * Math.sin(t * 20)));
  // for the crystal macro the front stays cut open too (we look inside)
  if (t >= T.kristall && t < T.waechst) {
    clip.constant = 0;
    section.visible = true;
    const ice = 0.04 * smooth(ramp(t, T.kristall + 0.3, T.waechst));
    liqFace.scale.set(2 * (IN.x - ice), IN.level - IN.y0, 1);
    liqFace.position.set(0, (IN.y0 + IN.level) / 2, 0.003);
    liqFace.visible = true;
    gasFace.scale.set(1.06, 2.36 - IN.level, 1);
    gasFace.position.set(0, (IN.level + 2.36) / 2, 0.004);
    crystal.visible = true;
  }
  animateArrows(pushArrows, t, pop(t, T.dagegen + 0.3, T.kohlen));
  if (pushArrows.group) pushArrows.group.position.copy(can.g.position);

  // ---- what-if can (slush)
  const c2in = t >= T.oeffnest && t < T.laesst + 0.35;
  can2.g.visible = c2in;
  if (c2in) {
    const out = inBack(ramp(t, T.laesst, T.laesst + 0.35));
    can2.g.scale.copy(squash(t, T.oeffnest)).multiplyScalar(Math.max(0.001, 1 - out));
    can2.fm.opacity = 0.35;
    can2.dome.scale.y = 1;
    const tabK = smooth(ramp(t, T.jetzt1, T.jetzt1 + 0.25));
    can2.tab.rotation.x = -tabK * 1.1;
    const sk = smooth(ramp(t, T.sekunden - 0.2, T.slush + 0.4));
    sweep.scale.y = Math.max(0.001, sk);
    sweep.visible = sk > 0.01;
    crown.visible = sk > 0.01;
    crown.children.forEach((l) => {
      const k = clamp01((sk - l.userData.d * 0.4) / 0.6);
      l.position.copy(l.userData.base).multiplyScalar(0.3 + 0.7 * k);
      l.position.y = l.userData.base.y * k * 1.4;
      l.scale.setScalar(Math.max(0.001, outBack(k)));
    });
  }

  // ---- MAG
  const hk = smooth(ramp(t, T.haar - 0.1, T.haar + 0.4));
  mag.userData.hair.scale.set(1, Math.max(0.001, hk), 1);
  mag.userData.hair.visible = hk > 0.01;

  // ---- FELS: water in the crack freezes, the rock splits; the road pops
  const fz = smooth(ramp(t, T.frost, T.frost + 0.5));
  crackWater.material.color.setHex(fz > 0.5 ? 0xe2f3ff : 0x3f8fd8);
  crackWater.material.emissive.setHex(fz > 0.5 ? 0x5c8fc0 : 0x0a2a50);
  const split = smooth(ramp(t, T.felsen, T.felsen + 0.35));
  rockL.rotation.z = split * 0.22;
  rockR.rotation.z = -split * 0.22;
  rockL.position.x = -0.04 - split * 0.35;
  rockR.position.x = 0.04 + split * 0.35;
  crackWater.scale.x = 1 + split * 4;
  animateArrows(fArrows, t, pop(t, T.frost + 0.2, T.strassen));
  const rp = t - T.strassen - 0.25;
  roadIce.visible = t >= T.fakt;
  roadIce.scale.set(1, 1, 1 + 8 * smooth(ramp(t, T.strassen, T.strassen + 0.3)));
  potHole.scale.setScalar(rp > 0 ? smooth(clamp01(rp / 0.2)) : 0.001);
  potChunks.forEach((ch) => {
    const u = ch.userData;
    const tau = Math.max(0, rp);
    const x = 0.2 + Math.cos(u.a) * (0.3 + u.v * tau * 0.6);
    const z = 2.9 + Math.sin(u.a) * (0.3 + u.v * tau * 0.4);
    const y = Math.max(0.28, 0.25 + u.up * tau - 5 * tau * tau);
    ch.position.set(x, rp > 0 ? y : 0.18, z);
    ch.rotation.set(tau * 5 * u.v, tau * 3, 0);
    ch.visible = rp > 0;
  });
  for (let i = 0; i < NS; i++) {
    const r = bubSeed[i % NB];
    const y = 6 - ((t * (0.4 + r[3] * 0.4) + r[1] + i * 0.013) % 1) * 6;
    m4.makeTranslation(-5 + ((i * 0.618) % 1) * 10, y, -3 + ((i * 0.377) % 1) * 7);
    snowFlakes.setMatrixAt(i, m4);
  }
  snowFlakes.instanceMatrix.needsUpdate = true;

  // ---- HUD + LED
  const lapse = t >= T.dose1 && t < T.schuld;
  readout("zeit", pop(t, T.dose1 + 0.2, T.schuld), {
    label: "IM GEFRIERFACH",
    value: (() => {
      const m = Math.floor(ramp(t, T.dose1, T.schuld) * 75);
      return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
    })(),
    unit: "h",
    note: "Zeitraffer",
    x: 60,
    y: 1200,
    color: "#7fd4ff",
  });
  readout("temp", pop(t, T.kaelter, T.oeffnest), {
    label: "COLA",
    value: (lapse
      ? 4
      : -6 * smooth(ramp(t, T.kaelter, T.fluessig + 0.4)) +
        4 * (1 - smooth(ramp(t, T.kaelter, T.fluessig + 0.4)))
    ).toFixed(0),
    unit: "°C",
    note: "noch flüssig!",
    x: 60,
    y: 1200,
    color: "#7fd4ff",
  });
  gauge("druck", pop(t, T.kohlen + 0.2, T.dose3), {
    label: "DRUCK",
    value: 2.5 + 4 * smooth(ramp(t, T.kohlen, T.dose3)),
    max: 8,
    unit: "bar",
    x: 760,
    y: 1240,
    color: "#ff4b2b",
    digits: 1,
  });
  if (t >= T.zehntel && t < T.haar)
    showPanel(pop(t, T.zehntel, T.haar), "DOSENWAND", "0,1 mm", LED.yellow);
  else if (t >= T.neun && t < T.kohlen)
    showPanel(pop(t, T.neun, T.kohlen), "EIS BRAUCHT", "+9 %", LED.yellow);
  else if (t >= T.felsen - 0.1 && t < T.strassen)
    showPanel(pop(t, T.felsen, T.strassen), "FROST", "SPRENGT", LED.blue);
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
