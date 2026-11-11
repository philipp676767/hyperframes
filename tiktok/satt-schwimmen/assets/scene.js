// #73 "Mit vollem Magen schwimmen" (Format B). Cold open: your hand shoves
// the last piece of pizza in, cut — cannonball off the jetty, SPLASH. Oma
// jumps up in her deck chair ("Eine Stunde warten!"). X-ray: the stomach
// kneads the pizza and pulls blood; the myth says the legs run dry (they
// go pale). You crawl, the legs sink, a stab, the calf burns — cramp?
// Rate mal: the counter of accidents spins … and stops at 0. X-ray again:
// blood flows to both, stomach AND muscles. Payoff: you float on your back,
// lazy. The beer is the real danger. Übrigens: the old scout book from 1908
// opens. Last picture: Oma taps her watch, you wave.
import {
  THREE,
  ramp,
  smooth,
  pop,
  lerp,
  clamp01,
  V,
  rng,
  scene,
  real,
  roundedBox,
  setXray,
  showNope,
  showPanel,
  LED,
  labels,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { waveSources, waterHeight, DECK } from "./set.js";
import { makeDiver, pose, face, S } from "./diver.js";
import { meter, counter, readout } from "./hud.js";
import { T, K, POS, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);
const applyCamera = shotCamera(shots, 1);

const mesh = (geo, mat, parent, x = 0, y = 0, z = 0, shadow = true) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};
const YT = -0.42; // navel height while treading water

// ================================================================ pizza
const doughM = real.plastic(0xe9b56a, { roughness: 0.75, clearcoat: 0 });
const crustM = real.plastic(0xc9843e, { roughness: 0.7, clearcoat: 0 });
const sauceM = real.plastic(0xd8402a, { roughness: 0.5 });
const cheeseM = real.plastic(0xffd36b, { roughness: 0.35, clearcoat: 0.4 });
const salamiM = real.plastic(0xb8322a, { roughness: 0.45, clearcoat: 0.3 });
const basilM = real.plastic(0x2f8f3a, { roughness: 0.5 });
// a slice: tip at the origin, pointing -z; len ≈ 0.2 m. bitten = tip missing
function slice(len = 0.2, bitten = false, seed = 1) {
  const g = new THREE.Group();
  const w = len * 0.55;
  const sh = new THREE.Shape();
  const tip = bitten ? 0.35 : 0;
  sh.moveTo(-w * tip, -len * tip);
  if (bitten) {
    // a round bite out of the tip
    for (let i = 0; i <= 8; i++) {
      const a = Math.PI * (i / 8);
      sh.lineTo(-w * tip * Math.cos(a), -len * tip + Math.sin(a) * len * 0.07);
    }
  } else sh.lineTo(0, 0);
  sh.lineTo(w, -len);
  sh.lineTo(-w, -len);
  const geo = new THREE.ExtrudeGeometry(sh, {
    depth: 0.012,
    bevelEnabled: true,
    bevelSize: 0.003,
    bevelThickness: 0.003,
    bevelSegments: 2,
  });
  geo.rotateX(Math.PI / 2);
  mesh(geo, doughM, g);
  const top = new THREE.Mesh(new THREE.ShapeGeometry(sh), cheeseM);
  top.rotation.x = -Math.PI / 2;
  top.position.y = 0.0045;
  top.scale.set(0.92, 0.92, 1);
  g.add(top);
  // crust along the wide edge
  const crust = new THREE.Mesh(new THREE.CapsuleGeometry(0.014, w * 2, 6, 16), crustM);
  crust.rotation.z = Math.PI / 2;
  crust.position.set(0, 0.0, len);
  crust.castShadow = true;
  g.add(crust);
  const r = rng(seed);
  for (let i = 0; i < 4; i++) {
    const v = (0.4 + r() * 0.5) * len;
    if (bitten && v < len * 0.45) continue;
    const x = (r() - 0.5) * (v / len) * w * 1.2;
    const s = mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.005, 20), salamiM, g, x, 0.007, v);
    s.rotation.z = (r() - 0.5) * 0.2;
  }
  for (let i = 0; i < 2; i++) {
    const v = (0.55 + r() * 0.3) * len;
    const b = mesh(
      new THREE.SphereGeometry(0.01, 10, 6),
      basilM,
      g,
      (r() - 0.5) * w * 0.8,
      0.009,
      v,
    );
    b.scale.set(1.3, 0.25, 0.8);
  }
  // pizza slices in this file are built tip at z=0 and growing to +z
  g.children.forEach((c) => {
    if (c.geometry && c.geometry.type === "ExtrudeGeometry") c.scale.z = -1;
  });
  return g;
}

// ================================================================ the jetty props
// pizza box on the towel: open lid, three slices left
const box = new THREE.Group();
scene.add(box);
box.position.set(-2.95, DECK + 0.01, -0.75);
box.rotation.y = 0.35;
{
  const card = real.plastic(0xd9c6a1, { roughness: 0.9, clearcoat: 0 });
  mesh(roundedBox(0.42, 0.012, 0.42, 0.004), card, box, 0, 0.006, 0);
  for (const [x, z, w, d] of [
    [0, 0.205, 0.42, 0.012],
    [0, -0.205, 0.42, 0.012],
    [0.205, 0, 0.012, 0.42],
    [-0.205, 0, 0.012, 0.42],
  ])
    mesh(roundedBox(w, 0.04, d, 0.003), card, box, x, 0.02, z);
  const lid = new THREE.Group();
  lid.position.set(0, 0.04, -0.21);
  lid.rotation.x = -1.95;
  box.add(lid);
  const top = mesh(roundedBox(0.42, 0.012, 0.42, 0.004), card, lid, 0, 0, 0.21);
  // a red print on the lid
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g2 = c.getContext("2d");
  g2.fillStyle = "#d9c6a1";
  g2.fillRect(0, 0, 128, 128);
  g2.strokeStyle = "#c0392b";
  g2.lineWidth = 7;
  g2.beginPath();
  g2.arc(64, 64, 40, 0, Math.PI * 2);
  g2.stroke();
  g2.fillStyle = "#c0392b";
  g2.font = "bold 26px sans-serif";
  g2.textAlign = "center";
  g2.fillText("PIZZA", 64, 73);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const print = new THREE.Mesh(
    new THREE.PlaneGeometry(0.36, 0.36),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }),
  );
  print.rotation.x = Math.PI / 2;
  print.position.set(0, -0.0065, 0.21);
  lid.add(print);
  void top;
  for (let i = 0; i < 3; i++) {
    const s = slice(0.18, false, 10 + i);
    s.position.set(0, 0.015, 0);
    s.rotation.y = 0.5 + (i * Math.PI * 2) / 6;
    box.add(s);
  }
}
// beer bottle by the flip-flops, with condensation sheen
const beer = new THREE.Group();
scene.add(beer);
beer.position.set(-2.35, DECK, -1.55);
{
  const glass = real.glass ? real.glass(0x6b3a10, { roughness: 0.05 }) : real.gloss(0x6b3a10);
  const pts = [];
  for (const [r, y] of [
    [0.0, 0],
    [0.032, 0],
    [0.033, 0.005],
    [0.033, 0.15],
    [0.028, 0.18],
    [0.013, 0.215],
    [0.012, 0.25],
    [0.0135, 0.255],
  ])
    pts.push(new THREE.Vector2(r, y));
  const bottle = mesh(new THREE.LatheGeometry(pts, 40), glass, beer);
  bottle.material.side = THREE.DoubleSide;
  const label = mesh(
    new THREE.CylinderGeometry(0.0335, 0.0335, 0.06, 40, 1, true),
    real.plastic(0xf2e3b3, { roughness: 0.6 }),
    beer,
    0,
    0.08,
    0,
  );
  void label;
  mesh(
    new THREE.CylinderGeometry(0.0145, 0.0145, 0.01, 24),
    real.metal(0xc8a63c, { roughness: 0.3 }),
    beer,
    0,
    0.258,
    0,
  );
  beer.rotation.y = 0.4;
}
// the old scout book (opens at "Übrigens") + a scout hat
const book = new THREE.Group();
scene.add(book);
book.position.set(-3.75, DECK + 0.005, -0.5);
book.rotation.y = 0.5;
book.scale.setScalar(1.9);
const coverL = new THREE.Group();
const coverR = new THREE.Group();
const pagesR = new THREE.Group();
{
  const W = 0.16;
  const H = 0.23;
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 368;
  const g = c.getContext("2d");
  g.fillStyle = "#2f5a3a";
  g.fillRect(0, 0, 256, 368);
  g.strokeStyle = "#e6c46a";
  g.lineWidth = 5;
  g.strokeRect(14, 14, 228, 340);
  g.fillStyle = "#e6c46a";
  g.textAlign = "center";
  g.font = "bold 30px serif";
  g.fillText("PFADFINDER", 128, 90);
  g.font = "22px serif";
  g.fillText("Handbuch", 128, 125);
  // a lily emblem
  g.beginPath();
  g.moveTo(128, 160);
  g.quadraticCurveTo(160, 200, 128, 250);
  g.quadraticCurveTo(96, 200, 128, 160);
  g.fill();
  g.fillRect(100, 236, 56, 10);
  g.font = "bold 40px serif";
  g.fillText("1908", 128, 320);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const coverM = real.fabric(0xffffff, { map: tex });
  const plainCover = real.fabric(0x2f5a3a);
  const pageM = real.plastic(0xf3e6c4, { roughness: 0.95, clearcoat: 0 });
  // left (back) cover + left page block lie flat
  book.add(coverL);
  mesh(roundedBox(W, 0.006, H, 0.002), plainCover, coverL, -W / 2, 0.003, 0);
  mesh(roundedBox(W - 0.008, 0.018, H - 0.01, 0.002), pageM, coverL, -W / 2, 0.015, 0);
  // right half: pages + cover hinge at x = 0
  book.add(pagesR);
  mesh(roundedBox(W - 0.008, 0.018, H - 0.01, 0.002), pageM, pagesR, W / 2, 0.015, 0);
  // printed page text lines
  const pc = document.createElement("canvas");
  pc.width = 256;
  pc.height = 368;
  const pg = pc.getContext("2d");
  pg.fillStyle = "#f3e6c4";
  pg.fillRect(0, 0, 256, 368);
  pg.fillStyle = "#5a4a32";
  pg.font = "bold 22px serif";
  pg.fillText("Krampf.", 24, 50);
  for (let i = 0; i < 13; i++) pg.fillRect(24, 75 + i * 21, 200 - (i % 4) * 22, 5);
  const ptex = new THREE.CanvasTexture(pc);
  ptex.colorSpace = THREE.SRGBColorSpace;
  for (const sx of [-1, 1]) {
    const pl = new THREE.Mesh(
      new THREE.PlaneGeometry(W - 0.02, H - 0.025),
      new THREE.MeshStandardMaterial({ map: ptex, roughness: 0.95 }),
    );
    pl.rotation.x = -Math.PI / 2;
    pl.position.set((sx * W) / 2, 0.0245, 0);
    (sx < 0 ? coverL : pagesR).add(pl);
  }
  book.add(coverR);
  const front = mesh(roundedBox(W, 0.006, H, 0.002), coverM, coverR, W / 2, 0, 0);
  front.material = [plainCover, plainCover, coverM, plainCover, plainCover, plainCover];
  // closed: the right cover lies on top of everything, the book reads as closed
  // (pages right fold over too)
  // scout hat beside the book
  const hat = new THREE.Group();
  hat.position.set(0.32, 0, -0.08);
  book.add(hat);
  const felt = real.fabric(0x9c7a4a);
  mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.008, 40), felt, hat, 0, 0.004, 0);
  const crown = mesh(new THREE.ConeGeometry(0.085, 0.13, 4, 1), felt, hat, 0, 0.07, 0);
  crown.rotation.y = Math.PI / 4;
  mesh(new THREE.CylinderGeometry(0.088, 0.088, 0.02, 32), real.fabric(0x5a3a22), hat, 0, 0.018, 0);
}
function bookAt(t) {
  // closed: the right half (pages + cover) folded over onto the left
  const k = smooth(ramp(t, K.bookOpen, K.bookOpen + 0.7));
  const fold = Math.PI * (1 - k);
  coverR.rotation.z = fold;
  coverR.position.y = 0.03 * Math.sin(fold) + (1 - k) * 0.033;
  pagesR.rotation.z = fold;
  pagesR.position.y = (1 - k) * 0.01;
}

// deck chair for Oma (wooden frame, striped fabric), facing the water
const OMA = V(-4.7, DECK, -0.95);
const OMA_YAW = 0.95;
const chair = new THREE.Group();
scene.add(chair);
chair.position.copy(OMA);
chair.rotation.y = OMA_YAW;
{
  const woodM = real.wood(0xc89a62, { roughness: 0.6 });
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 256;
  const g = c.getContext("2d");
  for (let i = 0; i < 8; i++) {
    g.fillStyle = i % 2 ? "#ffffff" : "#2a6fbd";
    g.fillRect(i * 8, 0, 8, 256);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const cloth = real.fabric(0xffffff, { map: tex, side: THREE.DoubleSide });
  // seat sling + back
  const seat = mesh(new THREE.PlaneGeometry(0.5, 0.55), cloth, chair, 0, 0.3, 0.12);
  seat.rotation.x = -Math.PI / 2 + 0.25;
  const back = mesh(new THREE.PlaneGeometry(0.5, 0.75), cloth, chair, 0, 0.62, -0.32);
  back.rotation.x = -0.5;
  for (const sx of [-1, 1]) {
    const leg1 = mesh(roundedBox(0.035, 1.1, 0.035, 0.01), woodM, chair, sx * 0.27, 0.48, -0.25);
    leg1.rotation.x = -0.5;
    const leg2 = mesh(roundedBox(0.035, 0.75, 0.035, 0.01), woodM, chair, sx * 0.29, 0.3, 0.2);
    leg2.rotation.x = 0.55;
  }
}
// Oma: lilac dress, sun hat, grey hair
const oma = makeDiver({ skin: 0xf2c4a6, hair: 0xd8d8d8, dress: 0x9b72cf, suit: 0x9b72cf });
// her wristwatch (left arm)
{
  const wrist = oma.arms[0].hand;
  const w = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.01, 8, 20), real.plastic(0x5a3a22));
  w.rotation.x = Math.PI / 2;
  w.position.y = 0.01;
  wrist.add(w);
  const face_ = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.022, 0.01, 20),
    real.metal(0xe6c46a, { roughness: 0.2 }),
  );
  face_.rotation.z = Math.PI / 2;
  face_.position.set(0.04, 0.01, 0);
  wrist.add(face_);
}
function omaAt(t) {
  // seated; sits up and wags her finger from "schreit"; again at the end
  const up = smooth(ramp(t, T.oma + 0.05, T.oma + 0.45)) * (1 - smooth(ramp(t, T.im - 0.1, T.im)));
  const end = smooth(ramp(t, T.lange - 0.2, T.lange + 0.3));
  const k = Math.max(up, end);
  const r = oma.root;
  oma.outer.position.set(OMA.x, OMA.y + 0.36 + 0.27 * S + 0.06 * k, OMA.z);
  oma.outer.rotation.set(0, OMA_YAW, 0);
  r.rotation.set(lerp(-0.42, 0.05, k), 0, 0);
  // translate a bit forward while sitting up
  r.position.set(0, 0, 0.08 * k);
  const wag = Math.sin(t * 16);
  pose(
    oma,
    (i) =>
      i === 1
        ? {
            rx: lerp(-0.35, -2.5, k),
            rz: lerp(0.1, 0.25, k) + 0.15 * wag * k,
            el: lerp(0.4, 0.5, k),
            hx: 0,
          }
        : end > up
          ? { rx: -1.15, rz: -0.35, el: 1.5 } // watch arm across the chest
          : { rx: lerp(-0.3, -0.6, k), rz: 0.12, el: lerp(0.5, 1.1, k) },
    { rx: -1.45, rz: 0.06, kn: 1.5 },
  );
  // watch tap: the finger arm taps down onto the wrist
  if (end > up) {
    const tap = Math.abs(Math.sin(t * 9));
    pose(
      oma,
      (i) =>
        i === 1
          ? { rx: -1.35, rz: 0.45 - 0.08 * tap, el: 1.35 }
          : { rx: -1.15, rz: -0.35, el: 1.5 },
      { rx: -1.45, rz: 0.06, kn: 1.5 },
    );
  }
  const shout =
    up * (T.schreit < t && t < T.im - 0.2 ? 0.6 + 0.4 * Math.abs(Math.sin(t * 11)) : 0) + end * 0.3;
  face(oma, shout);
}

// ================================================================ you
const you = makeDiver({ suit: 0x1f6fd1, hair: 0x5a3a22, skin: 0xf0bf98 });
const PALE = new THREE.Color(0xa9bccf);
const limbBase = you.limbM.color.clone();
// the last slice of pizza in your right hand (until you hit the water)
const yourSlice = slice(0.26, true, 3);
yourSlice.scale.setScalar(1 / S);
yourSlice.rotation.set(-1.2, 0, 0.3);
yourSlice.position.set(0, -0.12, 0.04);
you.arms[1].hand.add(yourSlice);

// organs + blood (children of your body, visible in x-ray)
const organs = new THREE.Group();
you.root.add(organs);
const stomachM = real.plastic(0xff8f7a, {
  roughness: 0.35,
  clearcoat: 0.6,
  emissive: 0xff4a2a,
  emissiveIntensity: 0.25,
});
const stomach = mesh(
  new THREE.SphereGeometry(0.085, 32, 20),
  stomachM,
  organs,
  0.035,
  0.06,
  0.06,
  false,
);
stomach.scale.set(1.35, 0.85, 0.75);
stomach.rotation.z = -0.35;
// pizza chunks churning inside
const chunks = [];
{
  const r = rng(7);
  for (let i = 0; i < 9; i++) {
    const m = new THREE.Mesh(
      new THREE.TetrahedronGeometry(0.018 + r() * 0.01, 0),
      i % 3 ? cheeseM : sauceM,
    );
    organs.add(m);
    chunks.push({ m, a: r() * 6.28, b: r() * 6.28, s: 1.5 + r() * 2 });
  }
}
// blood: beads flowing along straight vessels (parent, from, to)
const bloodM = new THREE.MeshBasicMaterial({ color: 0xff2a2a });
const bloodGeo = new THREE.SphereGeometry(0.013, 10, 8);
function flow(parent, a, b, n = 10) {
  const im = new THREE.InstancedMesh(bloodGeo, bloodM, n);
  im.userData.noAO = true;
  im.frustumCulled = false;
  parent.add(im);
  // a thin vessel tube
  const tube = new THREE.Mesh(
    new THREE.CylinderGeometry(0.006, 0.006, a.distanceTo(b), 8),
    new THREE.MeshBasicMaterial({ color: 0xc81e2a, transparent: true, opacity: 0.5 }),
  );
  tube.position.copy(a).add(b).multiplyScalar(0.5);
  tube.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize());
  parent.add(tube);
  return { im, a, b, n, tube };
}
const M4 = new THREE.Matrix4();
const Q0 = new THREE.Quaternion();
function animFlow(f, t, vis, speed, density = 1) {
  // speed > 0: a → b, < 0: b → a
  f.tube.visible = vis > 0.02;
  f.tube.material.opacity = 0.5 * vis;
  for (let i = 0; i < f.n; i++) {
    const u = (((i / f.n + t * speed) % 1) + 1) % 1;
    const on = i / f.n < density ? 1 : 0;
    const s = vis * on * (0.7 + 0.3 * Math.sin(i * 2.1));
    const p = f.a.clone().lerp(f.b, u);
    M4.compose(p, Q0, V(s, s, s));
    f.im.setMatrixAt(i, M4);
  }
  f.im.instanceMatrix.needsUpdate = true;
}
const heart = mesh(
  new THREE.SphereGeometry(0.035, 20, 14),
  new THREE.MeshBasicMaterial({ color: 0xff3b3b }),
  organs,
  -0.035,
  0.3,
  0.05,
  false,
);
const toStomach = flow(organs, V(-0.03, 0.28, 0.05), V(0.03, 0.09, 0.07), 12);
const trunk = flow(organs, V(-0.01, 0.27, 0.02), V(0.0, -0.22, 0.02), 14);
const legFlows = you.legs.map((L) => [
  flow(L.hip, V(0, -0.02, 0.02), V(0, -0.42, 0.02), 10),
  flow(L.kn, V(0, 0.0, 0.02), V(0, -0.4, 0.02), 9),
]);
// calf cramp glow on the right calf
const crampM = new THREE.MeshBasicMaterial({
  color: 0xff2a1a,
  transparent: true,
  opacity: 0,
  depthWrite: false,
});
const cramp = mesh(
  new THREE.CapsuleGeometry(0.068, 0.3, 8, 20),
  crampM,
  you.legs[1].kn,
  0,
  -0.21,
  0,
  false,
);
cramp.userData.noAO = true;

const TREAD = (t) => [
  (k) => ({
    rx: -0.35 + 0.25 * Math.sin(t * 3 + k * Math.PI),
    rz: 1.15 + 0.25 * Math.sin(t * 3 + k * Math.PI),
    el: 0.5,
  }),
  (k) => ({
    rx: -0.25 + 0.35 * Math.sin(t * 2.6 + k * Math.PI),
    rz: 0.12,
    kn: 0.45 + 0.3 * Math.sin(t * 2.6 + k * Math.PI + 1),
  }),
];
const CANNON = [
  { rx: -0.9, rz: 0.35, el: 1.6 },
  { rx: -2.2, rz: 0.15, kn: 2.4 },
];
const CRAWL = (t, slow) => [
  (k) => ({ rx: -(t * 5.5 * slow + k * Math.PI), rz: 0.25, el: 0.15 }),
  (k) => ({ rx: 0.3 * Math.sin(t * 9 * slow + k * Math.PI), rz: 0.08, kn: 0.15 }),
];
const FLOAT = (t) => [
  (k) => ({ rx: -0.2, rz: 1.25 + 0.08 * Math.sin(t * 1.3 + k), el: 0.3 }),
  (k) => ({ rx: 0.08 * Math.sin(t * 1.1 + k * 2), rz: 0.18, kn: 0.15 }),
];
const WAVE = (t) => [
  (k) =>
    k ? { rx: 0, rz: 2.6 + 0.35 * Math.sin(t * 9), el: 0.6 } : { rx: -0.35, rz: 1.1, el: 0.5 },
  (k) => ({ rx: -0.25 + 0.3 * Math.sin(t * 2.6 + k * Math.PI), rz: 0.12, kn: 0.5 }),
];
function youAt(t) {
  const P0 = POS.P0;
  const P1 = POS.P1;
  if (t < K.splash) {
    // cannonball arc from the end of the jetty — already flying on frame 0
    const u = clamp01(0.12 + (0.88 * (t - K.jump)) / (K.splash - K.jump));
    return {
      p: [lerp(-1.3, 0.6, u), 1.75 + 1.0 * u - 2.75 * u * u, lerp(-0.75, -0.45, u)],
      rx: -0.3 + 0.5 * u,
      ry: 0.9,
      pose: [CANNON[0], CANNON[1]],
      scream: 0.45 + 0.35 * Math.abs(Math.sin(t * 9)),
    };
  }
  if (t < T.oma) {
    const u = smooth(ramp(t, K.splash, K.splash + 0.6));
    return { p: [0.6, lerp(-1.2, YT, u), -0.45], rx: 0, ry: 0.4, pose: TREAD(t), scream: 0.3 };
  }
  if (t < T.kraulst)
    return {
      p: [P0[0], YT + 0.025 * Math.sin(t * 2.6), P0[2]],
      rx: 0.05,
      ry: 0,
      pose: TREAD(t),
      scream: t > T.das ? 0.35 : 0,
    };
  if (t < T.folge) {
    const u = (t - T.kraulst) / (T.folge - T.kraulst);
    const sink = smooth(ramp(t, K.sink, T.sticht));
    const slow = 1 - 0.55 * sink;
    const struggle = smooth(ramp(t, K.cramp, K.cramp + 0.5));
    return {
      p: [
        lerp(P0[0], 2.9, Math.min(u, (K.cramp - T.kraulst) / (T.folge - T.kraulst))),
        lerp(-0.08, YT * 0.7, Math.max(sink * 0.6, struggle)),
        P0[2],
      ],
      rx: lerp(Math.PI / 2 - 0.08, 0.15, Math.max(sink * 0.55, struggle)),
      ry: lerp(Math.PI / 2, 0, struggle),
      pose: struggle > 0.3 ? TREAD(t * 1.6) : CRAWL(t, slow),
      scream: Math.max(0.5 * smooth(ramp(t, T.sticht, T.sticht + 0.2)), struggle),
    };
  }
  if (t < K.float)
    return {
      p: [P1[0], YT + 0.025 * Math.sin(t * 2.6), P1[2]],
      rx: 0.05,
      ry: 0,
      pose: TREAD(t),
      scream: t < T.keinen ? 0.1 : 0,
    };
  if (t < T.lange) {
    const u = smooth(ramp(t, K.float, K.float + 0.6));
    return {
      p: [P1[0], lerp(YT, -0.06, u) + 0.02 * Math.sin(t * 1.6), P1[2]],
      rx: lerp(0.05, -Math.PI / 2 + 0.12, u),
      ry: lerp(0, -0.6, u),
      pose: FLOAT(t),
      scream: 0,
      smile: u,
    };
  }
  return {
    p: [-3.3, YT + 0.03 * Math.sin(t * 2.6), 0.85],
    rx: 0.05,
    ry: 0.5,
    pose: WAVE(t),
    scream: 0,
    smile: 1,
  };
}

// splash droplets + foam column
const DROPS = 140;
const dropM = new THREE.MeshPhysicalMaterial({
  color: 0xe8fbff,
  roughness: 0.05,
  transmission: 0.2,
  transparent: true,
  opacity: 0.9,
});
const drops = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.03, 1), dropM, DROPS);
drops.userData.noAO = true;
drops.frustumCulled = false;
scene.add(drops);
const dropV = [];
{
  const r = rng(11);
  for (let i = 0; i < DROPS; i++) {
    const a = r() * Math.PI * 2;
    const sp = 0.6 + r() * 2.2;
    dropV.push({
      vx: Math.cos(a) * sp,
      vz: Math.sin(a) * sp,
      vy: 2.4 + r() * 3.6,
      s: 0.5 + r() * 1.3,
      d: r() * 0.12,
    });
  }
}
const SPL = V(0.6, 0, -0.45);
waveSources.push({
  x: SPL.x,
  z: SPL.z,
  at: K.splash,
  amp: 0.22,
  speed: 2.6,
  life: 3.5,
  crater: 0.35,
});
waveSources.push({ x: POS.P1[0], z: POS.P1[2], at: K.float, amp: 0.05, speed: 1.5, life: 3 });
const foam = new THREE.Mesh(
  new THREE.CylinderGeometry(0.25, 0.5, 1, 20, 1, true),
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
    roughness: 0.4,
    side: THREE.DoubleSide,
  }),
);
foam.userData.noAO = true;
scene.add(foam);
function splashAt(t) {
  const dt = t - K.splash;
  for (let i = 0; i < DROPS; i++) {
    const v = dropV[i];
    const u = dt - v.d;
    let s = 0;
    const p = V(0, -5, 0);
    if (u > 0 && u < 1.6) {
      const y = v.vy * u - 4.9 * u * u;
      if (y > -0.02) {
        p.set(SPL.x + v.vx * u, y, SPL.z + v.vz * u);
        s = v.s;
      }
    }
    M4.compose(p, Q0, V(s, s * 1.3, s));
    drops.setMatrixAt(i, M4);
  }
  drops.instanceMatrix.needsUpdate = true;
  const col = dt > 0 && dt < 1.1 ? Math.sin((dt / 1.1) * Math.PI) : 0;
  foam.visible = col > 0.01;
  foam.scale.set(1 + dt * 0.8, 1.6 * col + 0.01, 1 + dt * 0.8);
  foam.position.set(SPL.x, 0.8 * col, SPL.z);
  foam.material.opacity = 0.75 * (1 - clamp01(dt / 1.1));
}

// crawl wake: small foam beads behind you
const WAKE = 40;
const wake = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.035, 0),
  new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 }),
  WAKE,
);
wake.userData.noAO = true;
wake.frustumCulled = false;
scene.add(wake);
function wakeAt(t, youP, on) {
  for (let i = 0; i < WAKE; i++) {
    const age = ((i / WAKE + t * 1.4) % 1) * 1.2;
    const s = on * (1 - age / 1.2) * (0.6 + 0.4 * Math.sin(i * 3.1));
    M4.compose(
      V(
        youP.x - 0.5 - age * 0.9 + Math.sin(i) * 0.1,
        0.03 + waterHeight(youP.x, youP.z, t),
        youP.z + Math.sin(i * 2.3) * 0.25 * (0.4 + age),
      ),
      Q0,
      V(s, s * 0.4, s),
    );
    wake.setMatrixAt(i, M4);
  }
  wake.instanceMatrix.needsUpdate = true;
}

// ================================================================ render
function xrayK(t) {
  const a =
    smooth(ramp(t, K.xrayOn, K.xrayOn + 0.45)) * (1 - smooth(ramp(t, K.xrayOff, K.xrayOff + 0.4)));
  const b = pop(t, T.sticht, T.kommt, 0.12);
  const c =
    smooth(ramp(t, K.xray2On, K.xray2On + 0.4)) *
    (1 - smooth(ramp(t, K.xray2Off, K.xray2Off + 0.3)));
  return Math.max(a, b, c);
}
function renderAt(t) {
  // ---- frame 0: the last piece of pizza goes into your mouth

  // ---- you
  const s = youAt(t);
  you.outer.visible = !s.hide;
  if (!s.hide) {
    you.outer.position.set(...s.p);
    you.outer.rotation.set(0, s.ry ?? 0, 0);
    you.root.rotation.set(s.rx ?? 0, 0, 0);
    pose(you, s.pose[0], s.pose[1]);
    face(you, s.scream ?? 0);
    if (s.smile) you.mouth.scale.set(1.3 + 0.5 * s.smile, 0.35, 0.5);
  }
  yourSlice.visible = t < K.splash + 0.05;
  // x-ray + blood
  const xr = xrayK(t);
  const pale =
    smooth(ramp(t, T.fehlt, T.beinen + 0.3)) *
    (1 - smooth(ramp(t, T.koerper + 0.6, T.beides + 0.4)));
  you.limbM.userData.base.copy(limbBase).lerp(PALE, pale * 0.8);
  setXray([you.skinM, you.bodyM, you.limbM], xr * 0.92);
  organs.visible = xr > 0.02;
  organs.scale.setScalar(Math.max(0.001, xr));
  const knead =
    ramp(t, T.knetet, T.problem) * (1 - ramp(t, T.problem, T.problem + 0.3)) +
    ramp(t, K.xray2On, K.xray2On + 0.4) * 0.5;
  stomach.scale.set(
    1.35 + 0.12 * knead * Math.sin(t * 7),
    0.85 - 0.08 * knead * Math.sin(t * 7),
    0.75,
  );
  const stab = pop(t, T.sticht, T.kommt + 0.4, 0.1);
  stomachM.emissiveIntensity = 0.25 + 0.35 * knead + 1.6 * stab * (0.6 + 0.4 * Math.sin(t * 30));
  chunks.forEach((c, i) => {
    const a = c.a + t * c.s * (0.4 + knead);
    c.m.position.set(
      0.035 + 0.06 * Math.cos(a),
      0.06 + 0.035 * Math.sin(a * 1.3 + c.b),
      0.06 + 0.03 * Math.sin(a + i),
    );
    c.m.rotation.set(a, a * 1.3, 0);
  });
  // phase 1 (myth): blood runs from the legs up into the stomach and the legs run dry
  // phase 2 (truth): blood flows down to the legs AND into the stomach
  const p2 = t > K.xray2On;
  const legDensity = p2 ? 1 : 1 - 0.85 * pale;
  animFlow(toStomach, t, xr, p2 ? 1.1 : 1.8, 1);
  animFlow(trunk, t, xr, p2 ? 0.9 : -0.9, p2 ? 1 : 1 - 0.6 * pale);
  for (const [th, ca] of legFlows) {
    animFlow(th, t, xr, p2 ? 0.8 : -1.0, legDensity);
    animFlow(ca, t, xr, p2 ? 0.8 : -1.0, legDensity);
  }
  heart.scale.setScalar(1 + 0.2 * Math.max(0, Math.sin(t * 8)));
  // cramp glow on the calf
  crampM.opacity =
    smooth(ramp(t, K.cramp, T.krampf)) *
    (1 - ramp(t, T.folge, T.folge + 0.1)) *
    (0.45 + 0.3 * Math.sin(t * 14));

  // ---- Oma, splash, wake, book
  omaAt(t);
  splashAt(t);
  const youP = you.outer.position;
  wakeAt(t, youP, t > T.kraulst + 0.2 && t < T.sticht ? 1 : 0);
  bookAt(t);

  // ---- ✕ on the pizza (not the pizza's fault)
  showNope(pop(t, T.pizza3 - 0.1, T.du3), -2.95, 0.78, -0.75, 0.32);

  // ---- LED + HUD
  if (t >= T.stunde && t < T.im) showPanel(pop(t, T.stunde, T.im), "1 STUNDE", "WARTEN!", LED.red);
  else if (t >= T.bier && t < T.fakt)
    showPanel(pop(t, T.bier, T.fakt), "WIRKLICH GEFÄHRLICH", "ALKOHOL", LED.red);
  else if (t >= T.jahr && t < T.lange)
    showPanel(pop(t, T.jahr, T.lange), "STUNDEN-REGEL SEIT", "1908", LED.yellow);
  else showPanel(0);
  // blood in your legs (myth)
  meter("blut", pop(t, T.fehlt, T.das), {
    label: "Blut in den Beinen",
    value: 1 - 0.8 * pale,
    x: 330,
    y: 430,
    width: 420,
    color: pale > 0.5 ? "#ff4b2b" : "#3dff7a",
    text: `${Math.round(100 - 80 * pale)} %`,
  });
  // Rate mal: the counter spins, then stops at 0
  const spin = t < T.keinen;
  const shown = spin ? Math.floor(1000 + 8999 * ((Math.sin(t * 23.7) + 1) / 2)) : 0;
  counter("unfaelle", pop(t, T.rate + 0.2, T.koerper), {
    label: "Badeunfälle wegen vollem Magen",
    value: spin ? shown : 0,
    x: 140,
    y: 400,
    color: spin ? "#ffd23f" : "#3dff7a",
  });
  // truth: both get enough
  meter("magen", pop(t, T.magen2, T.kraempfe), {
    label: "Magen",
    value: 0.95,
    x: 330,
    y: 400,
    width: 420,
    color: "#ffd23f",
    text: "mehr Blut",
  });
  meter("muskeln", pop(t, T.muskeln - 0.1, T.kraempfe), {
    label: "Muskeln",
    value: 0.8,
    x: 330,
    y: 520,
    width: 420,
    color: "#3dff7a",
    text: "genug",
  });
  readout("zeit", pop(t, T.erschoepfung - 0.2, T.nicht2), {
    label: "KRAMPF-URSACHE",
    value: "Erschöpfung",
    unit: "",
    note: "zu lange, zu schnell",
    x: 300,
    y: 420,
    color: "#ffd23f",
  });

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
