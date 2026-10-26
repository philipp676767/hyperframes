// #36 UV-Nagellampe: why gel nails don't dry but turn into plastic — and
// why your finger burns. Studio (origin): the UV lamp on the nail table,
// your hand with hot-pink gel nails, the brush, the phone, the artist's
// hand. MICRO: inside the gel layer — monomer beads with little arms,
// yellow photoinitiators, UV rays, the radical with its tiny grabbing hand,
// the chain reaction, the net, oxygen on top, every bond flashing hot.
// ZAHN: a giant tooth whose filling hardens under the dentist's blue light.
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
  flat,
  showPanel,
  showNope,
  LED,
  labels,
  squash,
  puff,
  makeArrowSet,
  animateArrows,
  heatMat,
  highlights,
  shotCamera,
  renderFrame,
  start,
  facet,
  facetMat,
} from "./world.js";
import "./set.js";
import { createHand } from "./hand.js";
import { counter, meter } from "./hud.js";
import {
  T,
  shots,
  LABELS,
  HIGHLIGHTS,
  MICRO,
  ZAHN,
  I0,
  FOLLOW,
  NAIL,
  HEAD,
  LAMP_ON,
  BEADPOS,
  JEDER,
  JEDER_REL,
} from "./beats.js";

highlights(HIGHLIGHTS);

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();
const _p = new THREE.Vector3();
const _p2 = new THREE.Vector3();
const _c = new THREE.Color();
const UP = V(0, 1, 0);
const shadow = (o) =>
  o.traverse((m) => {
    if (m.isMesh) m.castShadow = m.receiveShadow = true;
  });
const keep = (l) => ((l.userData.keep = true), l);
const lampOn = (t) => LAMP_ON.some(([a, b]) => t >= a && t < b);
// gradient backdrop for the dark places: a big inside-out sphere
function backdrop(parent, r, top, bottom) {
  const g = new THREE.SphereGeometry(r, 32, 16);
  const p = g.attributes.position;
  const col = new Float32Array(p.count * 3);
  const a = new THREE.Color(top);
  const b = new THREE.Color(bottom);
  for (let i = 0; i < p.count; i++) {
    const k = clamp01((p.getY(i) / r) * 0.7 + 0.5);
    _c.copy(b).lerp(a, k);
    col.set([_c.r, _c.g, _c.b], i * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const m = new THREE.Mesh(
    g,
    new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false }),
  );
  m.userData.noAO = true;
  parent.add(m);
  return m;
}

// ================================================================ STUDIO
// ---------------------------------------------------------------- the UV lamp
const lamp = new THREE.Group();
scene.add(lamp);
const lampWhite = flat(0xfbf7ff, { roughness: 0.22 });
// base plate with a mirror floor inside
{
  const base = new THREE.Mesh(
    new THREE.ExtrudeGeometry(
      (() => {
        const s = new THREE.Shape();
        const w = 1.05;
        const d = 0.92;
        const r = 0.3;
        s.moveTo(-w + r, -d);
        s.lineTo(w - r, -d);
        s.quadraticCurveTo(w, -d, w, -d + r);
        s.lineTo(w, d - r);
        s.quadraticCurveTo(w, d, w - r, d);
        s.lineTo(-w + r, d);
        s.quadraticCurveTo(-w, d, -w, d - r);
        s.lineTo(-w, -d + r);
        s.quadraticCurveTo(-w, -d, -w + r, -d);
        return s;
      })(),
      { depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 },
    ),
    lampWhite,
  );
  base.rotation.x = -Math.PI / 2;
  lamp.add(base);
  const mirror = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 1.5),
    flat(0xd8d0e8, { roughness: 0.05, metalness: 0.9 }),
  );
  mirror.rotation.x = -Math.PI / 2;
  mirror.position.y = 0.105;
  lamp.add(mirror);
}
// the shell: a half tunnel, open towards you (+z), frosted lilac acrylic
const shellMat = new THREE.MeshStandardMaterial({
  color: 0xf6efff,
  roughness: 0.18,
  metalness: 0.05,
  transparent: true,
  opacity: 0.32,
  side: THREE.DoubleSide,
  depthWrite: false,
  emissive: 0x7a2bff,
  emissiveIntensity: 0,
});
{
  const g = new THREE.CylinderGeometry(1.0, 1.0, 1.7, 28, 1, true, -Math.PI / 2, Math.PI);
  g.rotateX(-Math.PI / 2);
  const shell = new THREE.Mesh(g, shellMat);
  shell.scale.set(1, 0.78, 1);
  shell.position.set(0, 0.1, 0);
  shell.userData.noAO = true;
  lamp.add(shell);
  const back = new THREE.Mesh(new THREE.CircleGeometry(1.0, 28, 0, Math.PI), shellMat);
  back.scale.set(1, 0.78, 1);
  back.position.set(0, 0.1, -0.85);
  lamp.add(back);
  // a solid white rim at the opening and on the back edge
  for (const z of [0.85, -0.85]) {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.045, 6, 28, Math.PI), lampWhite);
    rim.scale.set(1, 0.78, 1);
    rim.position.set(0, 0.1, z);
    lamp.add(rim);
  }
  // control pad on top: a glowing power ring
  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(0.17, 0.17, 0.05, 16),
    flat(0x2a2236, { roughness: 0.3 }),
  );
  pad.position.set(0.55, 0.62, 0.72);
  pad.rotation.x = 0.7;
  pad.rotation.z = -0.5;
  lamp.add(pad);
}
// LEDs on the inside of the shell: little violet dots in three rows
const ledMat = new THREE.MeshBasicMaterial({ color: 0x5a3a7a });
{
  const N = 33;
  const leds = new THREE.InstancedMesh(new THREE.SphereGeometry(0.028, 8, 6), ledMat, N);
  let i = 0;
  for (const z of [-0.5, 0, 0.5])
    for (let k = 0; k < 11; k++) {
      const a = -1.25 + (k / 10) * 2.5;
      _m.makeTranslation(Math.sin(a) * 0.95, 0.1 + Math.cos(a) * 0.95 * 0.78, z);
      leds.setMatrixAt(i++, _m);
    }
  leds.userData.noAO = true;
  lamp.add(leds);
}
const lampLight = keep(new THREE.PointLight(0xa44dff, 0, 5, 1.4));
lampLight.position.set(0, 0.55, 0);
lamp.add(lampLight);
const lampSpill = keep(new THREE.PointLight(0xc070ff, 0, 7, 1.6));
lampSpill.position.set(0, 0.4, 1.4);
lamp.add(lampSpill);
shadow(lamp);
lamp.traverse((o) => o.material === shellMat && (o.castShadow = false));

// ---------------------------------------------------------------- props on the table
// a pink towel under your hand, the gel pot, the phone in a pink case, a
// classic polish bottle (CTA), a cotton pad (wipe)
{
  const towel = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.05, 1.8),
    flat(0xffc4dc, { roughness: 1 }),
  );
  towel.position.set(0.1, 0.025, 2.1);
  towel.receiveShadow = true;
  scene.add(towel);
}
const gelPot = new THREE.Group();
{
  const jar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.26, 0.34, 14),
    flat(0x1c1a22, { roughness: 0.2 }),
  );
  jar.position.y = 0.17;
  const gel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 0.02, 14),
    flat(0xff2d8a, { roughness: 0.05 }),
  );
  gel.position.y = 0.335;
  const lid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 0.1, 14),
    flat(0xffffff, { roughness: 0.3 }),
  );
  lid.position.set(0.45, 0.05, 0.1);
  gelPot.add(jar, gel, lid);
  gelPot.position.set(-1.45, 0, 2.2);
  shadow(gelPot);
  scene.add(gelPot);
}
const phone = new THREE.Group();
{
  const caseM = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.07, 1.55),
    flat(0xff8fb8, { roughness: 0.45 }),
  );
  caseM.position.y = 0.035;
  const cam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 0.03, 12),
    flat(0x1c1a22, { roughness: 0.1 }),
  );
  cam.position.set(-0.22, 0.075, -0.55);
  const cam2 = cam.clone();
  cam2.position.x = -0.05;
  phone.add(caseM, cam, cam2);
  phone.position.set(2.5, 0, 0.75);
  phone.rotation.y = -0.35;
  shadow(phone);
  scene.add(phone);
}
const bottle = new THREE.Group();
{
  const glass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.34, 0.62, 10),
    flat(0xd01530, { roughness: 0.08, metalness: 0.1 }),
  );
  glass.position.y = 0.31;
  const capB = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.15, 0.62, 8),
    flat(0x1c1a22, { roughness: 0.25 }),
  );
  capB.position.y = 0.93;
  bottle.add(glass, capB);
  bottle.position.set(-1.75, 0, 1.25);
  shadow(bottle);
  scene.add(bottle);
}
const cottonPad = new THREE.Mesh(
  new THREE.CylinderGeometry(0.4, 0.4, 0.1, 14),
  flat(0xffffff, { roughness: 1 }),
);
cottonPad.castShadow = true;
cottonPad.visible = false;
scene.add(cottonPad);

// ---------------------------------------------------------------- your hand + nails
const hand = createHand({ scale: 2.0, sleeve: 0x5fd0b8, skin: 0xffd4b8 });
const nailMat = new THREE.MeshStandardMaterial({
  color: 0xff2d8a,
  roughness: 0.25,
  metalness: 0.05,
  emissive: 0xff2d8a,
  emissiveIntensity: 0,
});
const NAILS = [];
const heatMatGlow = new THREE.MeshBasicMaterial({
  color: 0xff3a1a,
  transparent: true,
  opacity: 0,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});
const sparkMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0,
  depthWrite: false,
});
const SPARKS = [];
{
  const nailGeo = new THREE.SphereGeometry(1, 12, 6);
  const glowGeo = new THREE.SphereGeometry(1, 10, 8);
  const sparkGeo = new THREE.OctahedronGeometry(0.025, 0);
  const lens = { index: 0.3, middle: 0.33, ring: 0.31, pinky: 0.24, thumb: 0.25 };
  for (const [name, fg] of Object.entries(hand.fingers)) {
    const len = lens[name];
    const z = fg.thumb ? 0.1 : len * 0.27;
    const n = new THREE.Mesh(nailGeo, nailMat);
    n.position.set(0, fg.thumb ? 0.04 : 0.038, z);
    n.scale.set(0.05, 0.016, fg.thumb ? 0.066 : 0.078);
    n.castShadow = true;
    fg.j.add(n);
    NAILS.push(n);
    const gl = new THREE.Mesh(glowGeo, heatMatGlow);
    gl.position.set(0, 0.0, z + 0.02);
    gl.scale.setScalar(0.09);
    gl.userData.noAO = true;
    fg.j.add(gl);
    for (let k = 0; k < 2; k++) {
      const s = new THREE.Mesh(sparkGeo, sparkMat);
      s.position.set((k - 0.5) * 0.05, 0.065, z + (k - 0.5) * 0.06);
      s.userData = { ph: SPARKS.length * 0.77, noAO: true };
      fg.j.add(s);
      SPARKS.push(s);
    }
  }
}
// heat waves rising from your nails (hand-local: the hand's fingers point
// to local +z; the group is unscaled, the root inside is scaled ×2)
const heatSet = makeArrowSet(
  [-0.3, -0.1, 0.1, 0.3].map((x) => [V(x, 0.18, 1.32), V(x + 0.05, 0.62, 1.32)]),
  { parent: hand.group, mat: heatMat, r: 0.018, amp: 0.035 },
);
const steamMat = new THREE.MeshBasicMaterial({
  color: 0xc8c8d4,
  transparent: true,
  opacity: 0.85,
  depthWrite: false,
});
const steamSet = makeArrowSet(
  [-0.3, -0.1, 0.1, 0.3].map((x) => [V(x, 0.2, 1.32), V(x, 0.95, 1.32)]),
  { parent: hand.group, mat: steamMat, r: 0.02, amp: 0.04 },
);
// the hand's places
const PI = Math.PI;
const IN_LAMP = [0, 0.2, 1.05];
const ON_TOWEL = [0.15, 0.14, 2.95];
const IN = { pos: IN_LAMP, rot: [0, PI, 0], pose: "open" };
const TOWEL = { pos: ON_TOWEL, rot: [0, PI, 0], pose: "open" };
const at = (t, k, extra = {}) => ({ t, ...k, ...extra });
// phone taps: middle finger over the case
const TAP_UP = [2.62, 0.86, 2.12];
const TAP_DN = [2.62, 0.68, 2.12];
const TAP_ROT = [-0.35, PI - 0.35, 0];

// ---------------------------------------------------------------- the artist's hand + brush
const hand2 = createHand({ scale: 2.0, sleeve: 0x2a2833 });
const brush = new THREE.Group();
{
  // tip at the origin, the handle up and to the left
  const bristle = new THREE.Mesh(
    new THREE.ConeGeometry(0.06, 0.22, 8),
    flat(0xff2d8a, { roughness: 0.15 }),
  );
  bristle.rotation.x = PI;
  bristle.position.y = 0.11;
  const ferrule = new THREE.Mesh(
    new THREE.CylinderGeometry(0.065, 0.065, 0.18, 10),
    flat(0xd9a441, { metalness: 0.8, roughness: 0.25 }),
  );
  ferrule.position.y = 0.3;
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.07, 1.0, 10),
    flat(0x1c1a22, { roughness: 0.25 }),
  );
  handle.position.y = 0.88;
  const inner = new THREE.Group();
  inner.add(bristle, ferrule, handle);
  inner.rotation.z = 0.55;
  inner.rotation.x = 0.25;
  brush.add(inner);
  shadow(brush);
  brush.visible = false;
  scene.add(brush);
}
const goldGelMat = new THREE.MeshStandardMaterial({
  color: 0xff2d8a,
  roughness: 0.04,
  metalness: 0.05,
  emissive: 0x6a0a34,
  emissiveIntensity: 0.25,
});
const thread = new THREE.Mesh(
  new THREE.CylinderGeometry(1, 1, 1, 10).translate(0, 0.5, 0),
  goldGelMat,
);
const drop = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10), goldGelMat);
thread.visible = drop.visible = false;
scene.add(thread, drop);
// sticky threads between the artist's finger and your nail
const STICKY = [0, 1, 2].map(() => {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 6).translate(0, 0.5, 0), goldGelMat);
  m.visible = false;
  scene.add(m);
  return m;
});
function stretch(m, a, b, r) {
  _p.copy(b).sub(a);
  const len = _p.length();
  m.position.copy(a);
  m.quaternion.setFromUnitVectors(UP, _p.normalize());
  m.scale.set(r, Math.max(0.001, len), r);
  m.visible = true;
}
const tipOf = (h, name, out) => h.fingers[name].j.localToWorld(out.set(0, 0, 0.18));

// ================================================================ MICRO: inside the gel
const micro = new THREE.Group();
micro.position.set(...MICRO);
scene.add(micro);
backdrop(micro, 45, 0x3a1466, 0x0a0614);
{
  // the nail plate: pale pink with fine ridges along z
  const g = new THREE.BoxGeometry(24, 1, 18, 24, 1, 18);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++)
    if (p.getY(i) > 0) p.setY(i, p.getY(i) + Math.sin(p.getX(i) * 2.2) * 0.06);
  const plate = new THREE.Mesh(facet(g, 0.06, 5), facetMat(flat(0xc98a9e, { roughness: 0.55 })));
  plate.position.y = -0.5;
  plate.receiveShadow = true;
  micro.add(plate);
  // the top of the gel layer: a faint glossy sheet
  const top = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 18),
    new THREE.MeshStandardMaterial({
      color: 0xff9ed2,
      roughness: 0.05,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  top.rotation.x = -PI / 2;
  top.position.y = 4.45;
  top.userData.noAO = true;
  micro.add(top);
  const l1 = keep(new THREE.PointLight(0xb46bff, 60, 30, 1.2));
  l1.position.set(0, 9, 3);
  const l2 = keep(new THREE.PointLight(0xff7ab8, 30, 24, 1.4));
  l2.position.set(-6, 3, 7);
  const l3 = keep(new THREE.PointLight(0xffd2a8, 22, 24, 1.4));
  l3.position.set(7, 4, 6);
  micro.add(l1, l2, l3);
}

// ---------------------------------------------------------------- monomers
const mr = rng(3636);
const NB = 112;
const BEADS = []; // { p: Vector3 (local), top, arms: [dir×3], ph }
while (BEADS.length < NB) {
  // a free corridor in front (z > 1.9) keeps the macro shots clear
  const p = V(-6.2 + mr() * 12.4, 0.5 + mr() * 3.7, -4.4 + mr() * 6.3);
  if (BEADS.some((b) => b.p.distanceTo(p) < 0.86)) continue;
  if (p.distanceTo(V(...I0)) < 0.8) continue;
  const arms = [];
  for (let k = 0; k < 3; k++) arms.push(V(mr() - 0.5, mr() - 0.5, mr() - 0.5).normalize());
  BEADS.push({ p, top: p.y > 3.5, arms, ph: mr() * 6.28, link: Infinity });
}
const beadMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.3,
  metalness: 0.05,
  flatShading: true,
  emissive: 0xff6a1a,
  emissiveIntensity: 0,
});
const beads = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.24, 1), beadMat, NB);
const armMat = flat(0xffffff, { roughness: 0.4 });
const arms = new THREE.InstancedMesh(
  new THREE.CylinderGeometry(0.035, 0.035, 0.22).translate(0, 0.33, 0),
  armMat,
  NB * 3,
);
const tips = new THREE.InstancedMesh(new THREE.SphereGeometry(0.065, 8, 6), armMat, NB * 3);
beads.castShadow = arms.castShadow = true;
micro.add(beads, arms, tips);
const COL_FREE = new THREE.Color(0xff7cc0);
const COL_LINK = new THREE.Color(0xd2187a);
const COL_TOP = new THREE.Color(0xffb6dc);
const COL_HOT = new THREE.Color(0xffa040);
const COL_ARM = new THREE.Color(0xffd6ea);

// ---------------------------------------------------------------- photoinitiators, radicals, rays
const INI = [V(...I0)];
while (INI.length < 9) {
  const p = V(-5.5 + mr() * 11, 0.8 + mr() * 2.4, -3.8 + mr() * 5.4);
  if (INI.some((q) => q.distanceTo(p) < 2.4)) continue;
  if (BEADS.some((b) => b.p.distanceTo(p) < 0.5)) continue;
  INI.push(p);
}
const iniMat = new THREE.MeshStandardMaterial({
  color: 0xffd23f,
  roughness: 0.3,
  emissive: 0xffb020,
  emissiveIntensity: 0.5,
  flatShading: true,
});
const INIM = INI.map((p) => {
  const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), iniMat);
  m.position.copy(p);
  m.castShadow = true;
  micro.add(m);
  return m;
});
// the remnant that stays after the burst (chain start), small and orange
const remMat = flat(0xff8a3a, { roughness: 0.3 });
const REM = INI.map((p) => {
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.17, 0), remMat);
  m.position.copy(p);
  m.visible = false;
  micro.add(m);
  return m;
});
// the radical = the hot chain head: red core + soft glow
const radMat = new THREE.MeshStandardMaterial({
  color: 0xff2a2a,
  emissive: 0xff1a0a,
  emissiveIntensity: 0.7,
  roughness: 0.3,
  flatShading: true,
});
const radGlowMat = new THREE.MeshBasicMaterial({
  color: 0xff4a2a,
  transparent: true,
  opacity: 0.08,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});
const RAD = INI.map(() => {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.27, 1), radMat));
  const gl = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 8), radGlowMat);
  gl.userData.noAO = true;
  g.add(gl);
  g.visible = false;
  micro.add(g);
  return g;
});
const radLight = keep(new THREE.PointLight(0xff3a2a, 0, 4, 1.5));
micro.add(radLight);
// UV rays: violet bolts falling from the top; the first nine hit the initiators
const rayMat = new THREE.MeshBasicMaterial({
  color: 0xd7a8ff,
  transparent: true,
  opacity: 0.95,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});
const rayGlowMat = new THREE.MeshBasicMaterial({
  color: 0x8a3dff,
  transparent: true,
  opacity: 0.35,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});
const RAYS = [];
for (let k = 0; k < 20; k++) {
  const target = k < INI.length ? INI[k].clone() : V(-6 + mr() * 12, 0.2, -4 + mr() * 8);
  const g = new THREE.Group();
  g.add(
    new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.4, 6).translate(0, 1.2, 0), rayMat),
  );
  g.add(
    new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 2.4, 8).translate(0, 1.2, 0), rayGlowMat),
  );
  g.rotation.z = 0.12;
  g.visible = false;
  g.userData = { target, delay: k < INI.length ? k * 0.03 : mr() * 0.4 };
  micro.add(g);
  RAYS.push(g);
}

// ---------------------------------------------------------------- chains + net (precomputed)
// each radical grabs the nearest free bead, that one the next … (hero first)
const BONDS = []; // { a, b (bead index or -1-ini), t }
const CHAINS = INI.map(() => []);
{
  const claimed = new Set();
  INI.forEach((ip, c) => {
    const L = c === 0 ? 14 : 11;
    let cur = ip;
    for (let j = 0; j < L; j++) {
      let best = -1;
      let bd = 1e9;
      BEADS.forEach((b, i) => {
        if (b.top || claimed.has(i)) return;
        const d = b.p.distanceTo(cur);
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      if (best < 0 || bd > 2.2) break;
      claimed.add(best);
      CHAINS[c].push(best);
      cur = BEADS[best].p;
    }
  });
  // link times
  CHAINS.forEach((ch, c) => {
    ch.forEach((bi, j) => {
      let t;
      if (c === 0) {
        if (j === 0) t = T.schnappt1 + 0.15;
        else if (j === 1) t = T.schnappt2 + 0.1;
        else t = T.schnappt2 + 0.35 + (j - 2) * 0.13;
      } else t = T.tausende + 0.1 + c * 0.07 + j * 0.2 * (1 - j / 30);
      BONDS.push({ a: j === 0 ? -1 - c : ch[j - 1], b: bi, t });
      BEADS[bi].link = Math.min(BEADS[bi].link, t);
    });
  });
  // cross-links: the net, a wave from the middle outwards
  const deg = new Map();
  const bonded = new Set(BONDS.map(({ a, b }) => `${Math.min(a, b)}:${Math.max(a, b)}`));
  const pairs = [];
  BEADS.forEach((a, i) => {
    if (a.top) return;
    BEADS.forEach((b, j) => {
      if (j <= i || b.top) return;
      const d = a.p.distanceTo(b.p);
      if (d < 1.3 && !bonded.has(`${i}:${j}`)) pairs.push([i, j, d]);
    });
  });
  pairs.sort((x, y) => x[2] - y[2]);
  const r2 = rng(77);
  for (const [i, j] of pairs) {
    if ((deg.get(i) ?? 0) >= 2 || (deg.get(j) ?? 0) >= 2) continue;
    deg.set(i, (deg.get(i) ?? 0) + 1);
    deg.set(j, (deg.get(j) ?? 0) + 1);
    const mid = BEADS[i].p.clone().add(BEADS[j].p).multiplyScalar(0.5);
    const t = T.also + 0.2 + clamp01(mid.length() / 7) * 1.7 + r2() * 0.2;
    BONDS.push({ a: i, b: j, t });
    BEADS[i].link = Math.min(BEADS[i].link, t);
    BEADS[j].link = Math.min(BEADS[j].link, t);
  }
}
// label + macro targets on real beads
{
  const near = (x, y, z) => {
    let best = 0;
    let bd = 1e9;
    BEADS.forEach((b, i) => {
      if (b.top) return;
      const d = b.p.distanceTo(V(x, y, z));
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    return BEADS[best].p;
  };
  const b1 = near(1.2, 2.0, 1.0);
  BEADPOS.splice(0, 3, b1.x + MICRO[0], b1.y + MICRO[1] + 0.2, b1.z + MICRO[2]);
  const b2 = near(-2.4, 2.1, 1.8);
  JEDER.splice(0, 3, b2.x + MICRO[0], b2.y + MICRO[1], b2.z + MICRO[2]);
  Object.assign(JEDER_REL, { x: JEDER[0], y: JEDER[1], z: JEDER[2] });
}
const bondMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const bonds = new THREE.InstancedMesh(
  new THREE.CylinderGeometry(0.06, 0.06, 1, 6).translate(0, 0.5, 0),
  bondMat,
  BONDS.length,
);
bonds.userData.noAO = true;
micro.add(bonds);
const COL_BOND = new THREE.Color(0xffd6ec);
const bondPh = BONDS.map((_, i) => (i * 0.618) % 1);
// the bead's current (local) position: Brownian wobble, frozen once linked
const beadPos = (i, t, out) => {
  const b = BEADS[i];
  const free = t < b.link;
  const a = b.top ? 0.16 : free ? 0.12 : 0.025;
  out.set(
    b.p.x + Math.sin(t * 1.3 + b.ph) * a,
    b.p.y + Math.sin(t * 1.1 + b.ph * 1.7) * a * (b.top ? 1.4 : 1),
    b.p.z + Math.sin(t * 0.9 + b.ph * 2.3) * a,
  );
  return out;
};
const endPos = (idx, t, out) => (idx >= 0 ? beadPos(idx, t, out) : out.copy(INI[-1 - idx]));
// the hero radical's tiny grabbing hand
const tiny = createHand({ scale: 0.55, sleeve: 0xff3b3b, skin: 0xffd9c8 });
// oxygen: blue twin spheres that settle onto the top beads
const TOPB = BEADS.map((b, i) => (b.top ? i : -1))
  .filter((i) => i >= 0)
  .slice(0, 16);
const oxMat = flat(0x4fc3ff, { roughness: 0.25 });
const ox = new THREE.InstancedMesh(new THREE.SphereGeometry(0.19, 10, 8), oxMat, TOPB.length * 2);
micro.add(ox);
// heat waves rising out of the net
const microHeat = makeArrowSet(
  [-4, -2, 0, 2, 4, -3, 1, 3].map((x, k) => [
    V(x, 2.2 + (k % 3) * 0.4, -1 + (k % 4)),
    V(x + 0.3, 5.6 + (k % 2), -1 + (k % 4)),
  ]),
  { parent: micro, mat: heatMat, r: 0.06, amp: 0.16 },
);

// ================================================================ ZAHN: the tooth
const zahn = new THREE.Group();
zahn.position.set(...ZAHN);
scene.add(zahn);
backdrop(zahn, 40, 0x1c5a66, 0x050b0e);
const fillMat = new THREE.MeshStandardMaterial({
  color: 0xece2c8,
  roughness: 0.8,
  emissive: 0x3f7dff,
  emissiveIntensity: 0,
});
const curingLight = new THREE.Group();
const cureConeMat = new THREE.MeshBasicMaterial({
  color: 0x4f8dff,
  transparent: true,
  opacity: 0,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  side: THREE.DoubleSide,
});
const cureTipMat = new THREE.MeshBasicMaterial({ color: 0x2a3a5a });
const cureLight = keep(new THREE.PointLight(0x4f8dff, 0, 6, 1.4));
let fillMesh;
{
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(12, 40),
    flat(0x123038, { roughness: 0.35, metalness: 0.1 }),
  );
  floor.rotation.x = -PI / 2;
  floor.receiveShadow = true;
  zahn.add(floor);
  const toothMat = flat(0xfaf6ee, { roughness: 0.28 });
  // a row of three molars in a long gum ridge; the middle one gets the filling
  const gum = new THREE.Mesh(
    facet(new THREE.CapsuleGeometry(1.5, 5.2, 4, 12), 0.05, 3),
    facetMat(flat(0xe8768a, { roughness: 0.5 })),
  );
  gum.rotation.z = PI / 2;
  gum.scale.set(0.75, 1, 1);
  gum.position.y = 0.5;
  zahn.add(gum);
  const molar = (x, s, withFill) => {
    const g = new THREE.Group();
    const crown = new THREE.Mesh(
      facet(new THREE.CylinderGeometry(1.15, 1.0, 1.0, 12), 0.03, 4),
      facetMat(toothMat),
    );
    crown.position.y = 1.85;
    g.add(crown);
    for (const [cx, cz] of [
      [-0.5, -0.45],
      [0.5, -0.45],
      [-0.5, 0.45],
      [0.5, 0.45],
    ]) {
      const c = new THREE.Mesh(
        facet(new THREE.SphereGeometry(0.62, 10, 8), 0.03, 5),
        facetMat(toothMat),
      );
      c.position.set(cx, 2.28, cz);
      c.scale.set(1, 0.48, 1);
      g.add(c);
    }
    if (withFill) {
      fillMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.4, 0.3, 14), fillMat);
      fillMesh.position.y = 2.6;
      g.add(fillMesh);
    }
    g.position.x = x;
    g.scale.setScalar(s);
    shadow(g);
    zahn.add(g);
  };
  molar(0, 1, true);
  molar(-2.45, 0.95, false);
  molar(2.45, 0.95, false);
  // the dentist's curing light: the group origin is the light tip
  const pen = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.2, 2.6, 12),
    flat(0xdfe4ec, { roughness: 0.3 }),
  );
  pen.position.set(0.9, 1.0, 0);
  pen.rotation.z = -0.75;
  const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.1, 14), cureTipMat);
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(0.55, 1.0, 20, 1, true).translate(0, -0.5, 0),
    cureConeMat,
  );
  cone.userData.noAO = true;
  cureLight.position.set(0, -0.5, 0);
  curingLight.add(pen, tip, cone, cureLight);
  shadow(curingLight);
  zahn.add(curingLight);
  const spot = keep(new THREE.SpotLight(0xfff1e0, 60, 30, 0.5, 0.7, 1.2));
  spot.position.set(3, 9, 6);
  spot.target.position.set(0, 1.8, 0);
  zahn.add(spot, spot.target);
  const back = keep(new THREE.PointLight(0x3fd6c8, 40, 20, 1.4));
  back.position.set(-3, 4, -5);
  zahn.add(back);
}

// ================================================================ studio light dimming
// the room dims while the lamp glows, so the violet carries the picture
let LIGHTS = null;
let ENV0 = 0;
function dimRoom(k) {
  if (!LIGHTS) {
    ENV0 = scene.environmentIntensity;
    LIGHTS = [];
    scene.traverse((o) => {
      if (o.isLight && !o.userData.keep) LIGHTS.push([o, o.intensity]);
    });
  }
  for (const [l, i0] of LIGHTS) l.intensity = i0 * k;
  scene.environmentIntensity = ENV0 * (0.25 + 0.75 * k);
}

// ================================================================ render
const applyCamera = shotCamera(shots);
const nailW = V(0, 0, 0);

function renderAt(t) {
  const inMicro = (t >= T.baut && t < T.darum) || (t >= T.und2 && t < T.brennt2);
  const inZahn = t >= T.fakt && t < T.cta;
  const studio = !inMicro && !inZahn;

  // ------------------------------------------------ lamp
  const on = lampOn(t);
  const flick = 0.92 + 0.08 * Math.sin(t * 41) * Math.sin(t * 17);
  lampLight.intensity = on ? 12 * flick : 0;
  lampSpill.intensity = on ? 4 * flick : 0;
  shellMat.emissiveIntensity = on ? 0.22 : 0;
  ledMat.color.setHex(on ? 0xc77dff : 0x5a3a7a);
  dimRoom(studio && on ? 0.28 : 1);

  // ------------------------------------------------ your hand
  const jerk = (t0) => [
    at(t0 + 0.02, IN),
    at(t0 + 0.16, { pos: [0.15, 0.6, 1.95], rot: [0.4, PI, 0.15], pose: "open" }),
    at(t0 + 0.5, { pos: [0.2, 0.62, 2.1], rot: [0.3, PI, 0.1], pose: "open" }),
  ];
  hand.track(t, [
    // cold open: the hand just jerked out of the lamp, nails red-hot
    at(-0.6, { pos: [0.1, 0.5, 1.75], rot: [0.25, PI, 0.1], pose: "open" }),
    at(0, { pos: [0.12, 0.6, 1.8], rot: [0.32, PI, 0.12], pose: "open" }),
    at(T.unter - 0.02, { pos: [0.14, 0.62, 1.85], rot: [0.34, PI, 0.13], pose: "open", out: true }),
    at(T.unter, IN),
    at(T.brennt1 - 0.05, IN),
    ...jerk(T.brennt1),
    // "kaum warm": the index finger taps the roof
    at(T.kaum - 0.35, { pos: [0.31, 1.8, 1.45], rot: [-0.5, PI, 0], pose: "point" }),
    at(T.kaum, { pos: [0.31, 1.58, 1.4], rot: [-0.5, PI, 0], pose: "point" }),
    at(T.kaum + 0.22, { pos: [0.31, 1.75, 1.45], rot: [-0.5, PI, 0], pose: "point" }),
    at(T.stell - 0.02, { pos: [0.31, 1.75, 1.45], rot: [-0.5, PI, 0], pose: "point", out: true }),
    // on the towel: the brush, then into the lamp
    at(T.stell, TOWEL),
    at(T.kurz, TOWEL),
    at(T.kurz + 0.3, IN),
    at(T.huelle - 0.05, IN),
    // tap tap on the phone case
    at(T.huelle + 0.15, { pos: TAP_UP, rot: TAP_ROT, pose: "open" }),
    at(T.huelle + 0.3, { pos: TAP_DN, rot: TAP_ROT, pose: "open" }),
    at(T.huelle + 0.44, { pos: TAP_UP, rot: TAP_ROT, pose: "open" }),
    at(T.huelle + 0.58, { pos: TAP_DN, rot: TAP_ROT, pose: "open" }),
    at(T.huelle + 0.75, { pos: TAP_UP, rot: TAP_ROT, pose: "open" }),
    at(T.da - 0.02, { pos: TAP_UP, rot: TAP_ROT, pose: "open", out: true }),
    at(T.da, TOWEL),
    at(T.brennt2 - 0.62, TOWEL),
    at(T.brennt2 - 0.6, { ...IN, out: true }),
    at(T.brennt2 - 0.59, IN),
    at(T.brennt2 - 0.05, IN),
    ...jerk(T.brennt2),
    at(T.fakt, { pos: [0.2, 0.85, 2.2], rot: [0.3, PI, 0.1], pose: "open", out: true }),
    at(T.cta - 0.01, { ...TOWEL, out: true }),
    at(T.cta, TOWEL),
  ]);
  hand.group.updateMatrixWorld(true);
  NAILS[0].getWorldPosition(nailW);
  NAIL[0] = nailW.x;
  NAIL[1] = nailW.y + 0.04;
  NAIL[2] = nailW.z;

  // nails: wet gel while brushing, curing glow in the lamp, heat, gloss
  const wet = t >= T.stell && t < T.kurz + 0.4;
  const inLamp =
    on &&
    (t < T.brennt1 + 0.1 ||
      (t >= T.kurz + 0.3 && t < T.huelle) ||
      (t >= T.brennt2 - 0.6 && t < T.brennt2 + 0.1));
  nailMat.roughness = wet ? 0.02 : 0.2;
  nailMat.color.setHex(wet ? 0xff4d9e : 0xff2d8a);
  nailMat.emissive.setHex(0xff3da0);
  nailMat.emissiveIntensity = inLamp ? 1.1 + 0.35 * Math.sin(t * 9) : wet ? 0.08 : 0;
  // sparkles: curing in the lamp, and the fresh gloss after the wipe
  const shine = pop(t, T.chemie - 0.2, T.und2, 0.2) + pop(t, T.cta + 0.2, 99, 0.3) * 0.7;
  SPARKS.forEach((s) => {
    const ph = s.userData.ph;
    const tw = Math.max(0, Math.sin(t * 7 + ph * 3));
    const k = (inLamp ? 1 : 0) * tw + shine * Math.max(0, Math.sin(t * 5 + ph * 2));
    s.scale.setScalar(Math.max(0.001, k * 1.3));
    s.rotation.y = t * 3 + ph;
  });
  sparkMat.opacity = 1;
  // heat in the nails: the hook (ramping to the jerk) and the payoff
  const heat =
    Math.max(
      (t < T.unter ? 1 : 0.35 + 0.65 * ramp(t, T.unter, T.brennt1)) *
        (1 - ramp(t, T.brennt1 + 0.3, T.brennt1 + 1.4)),
      ramp(t, T.brennt2 - 0.6, T.brennt2) * (1 - ramp(t, T.brennt2 + 0.4, T.fakt)),
    ) *
    (0.85 + 0.15 * Math.sin(t * 13));
  heatMatGlow.opacity = 0.7 * heat;
  animateArrows(heatSet, t, heat > 0.25 ? heat : 0);

  // brush: dab, stroke, lift with a honey thread
  {
    const vis = t >= T.eben - 0.1 && t < T.kurz;
    brush.visible = vis;
    if (vis) {
      const n = nailW;
      // keyframes: above → touch (front of the nail) → stroke back → lift → away
      const K = [
        [T.eben - 0.1, n.x - 0.4, n.y + 0.95, n.z + 0.05],
        [T.eben + 0.35, n.x, n.y + 0.03, n.z + 0.1],
        [T.gel1 + 0.4, n.x, n.y + 0.03, n.z - 0.1],
        [T.wie1 - 0.1, n.x, n.y + 0.04, n.z - 0.1],
        [T.honig + 0.5, n.x - 0.12, n.y + 0.62, n.z - 0.1],
        [T.honig + 0.6, n.x - 0.12, n.y + 0.64, n.z - 0.1],
        [T.kurz, n.x - 0.7, n.y + 1.2, n.z - 0.1],
      ];
      let i = 0;
      while (i < K.length - 2 && t >= K[i + 1][0]) i++;
      const k = smooth(ramp(t, K[i][0], K[i + 1][0]));
      brush.position.set(
        lerp(K[i][1], K[i + 1][1], k),
        lerp(K[i][2], K[i + 1][2], k),
        lerp(K[i][3], K[i + 1][3], k),
      );
      // the honey thread from the bristle tip down to the nail
      const th = t >= T.wie1 - 0.1 && t < T.kurz;
      if (th) {
        const thin = 1 - ramp(t, T.honig, T.kurz - 0.1);
        const sag = Math.sin(t * 6) * 0.01;
        _p2.set(n.x - 0.03, n.y + 0.02, n.z - 0.05);
        _s.set(brush.position.x, brush.position.y + sag, brush.position.z);
        stretch(thread, _p2, _s, 0.012 + 0.03 * thin);
        drop.visible = true;
        drop.position.set(_s.x, _s.y - 0.05 - 0.05 * (1 - thin), _s.z);
        drop.scale.set(0.05, 0.07 + 0.05 * (1 - thin), 0.05);
      } else thread.visible = drop.visible = false;
    } else thread.visible = drop.visible = false;
  }
  // "Da verdunstet nichts": grey steam that isn't there
  animateArrows(steamSet, t, pop(t, T.da + 0.15, T.nichts + 0.25, 0.25) * 0.8);
  showNope(pop(t, T.nichts - 0.05, T.zeug, 0.25), nailW.x + 0.3, nailW.y + 0.75, nailW.z, 0.45);

  // ------------------------------------------------ the artist's hand: sticky threads, the wipe
  {
    // tip offset of the index finger for rot [0, PI/2, -0.4] in ZYX order
    const off = [1.42, -0.6, -0.31];
    const P2 = (x, y, z) => [x - off[0], y - off[1] + 0.06, z - off[2]];
    const n = nailW;
    const touch = P2(n.x, n.y + 0.04, n.z);
    const lift = P2(n.x - 0.15, n.y + 0.85, n.z + 0.1);
    const rot = [0, PI / 2, -0.4];
    const wipeA = P2(n.x - 0.35, n.y + 0.2, n.z + 0.05);
    const wipeB = P2(n.x + 0.75, n.y + 0.2, n.z + 0.1);
    hand2.track(t, [
      { t: T.darum - 0.25, pos: [touch[0] - 0.7, touch[1] + 0.7, touch[2]], rot, pose: "point" },
      { t: T.darum + 0.25, pos: touch, rot, pose: "point" },
      { t: T.darum + 0.6, pos: touch, rot, pose: "point" },
      { t: T.klebrig - 0.3, pos: lift, rot, pose: "point" },
      { t: T.kein - 0.25, pos: [lift[0] - 0.3, lift[1], lift[2]], rot, pose: "point" },
      { t: T.kein + 0.05, pos: wipeA, rot, pose: "point" },
      { t: T.chemie - 0.1, pos: wipeB, rot, pose: "point" },
      {
        t: T.chemie + 0.35,
        pos: [wipeB[0] + 0.3, wipeB[1] + 0.5, wipeB[2]],
        rot,
        pose: "point",
        out: true,
      },
    ]);
    const r2 = hand2.group.rotation;
    r2.set(r2.x, r2.y, r2.z, "ZYX");
    hand2.group.updateMatrixWorld(true);
    // sticky threads while the finger lifts off, snapping at klebrig − 0.3
    const sticky = t >= T.darum + 0.6 && t < T.klebrig - 0.3;
    STICKY.forEach((m, k) => {
      if (!sticky) {
        m.visible = false;
        return;
      }
      tipOf(hand2, "index", _s);
      _s.y -= 0.05;
      _p.set(n.x + (k - 1) * 0.04, n.y + 0.02, n.z + (k - 1) * 0.03);
      const thin = ramp(t, T.darum + 0.6, T.klebrig - 0.3);
      stretch(m, _p, _s, 0.02 * (1 - thin * 0.75) * (k === 1 ? 1.2 : 0.8));
    });
    // the cotton pad under the artist's fingertips
    const padOn = t >= T.kein - 0.25 && t < T.chemie + 0.35;
    cottonPad.visible = padOn;
    if (padOn) {
      tipOf(hand2, "index", _s);
      cottonPad.position.set(_s.x, _s.y - 0.1, _s.z);
    }
  }

  bottle.visible = t >= T.cta;
  gelPot.visible = t < T.cta;

  // ------------------------------------------------ MICRO
  micro.visible = inMicro;
  tiny.group.visible = false;
  if (inMicro) {
    // initiators sit until the burst; remnants + radicals after
    const burstT = (c) => T.platzt + 0.05 + (c === 0 ? 0 : 0.08 * c);
    INIM.forEach((m, c) => {
      const bt = burstT(c);
      m.visible = t < bt;
      m.rotation.y = t * 0.8 + c;
      m.rotation.x = t * 0.5 + c;
      const pre = t >= T.trifft ? 1 + 0.25 * Math.sin(t * 30) * ramp(t, T.trifft, bt) : 1;
      m.scale.setScalar(pre * (c === 0 ? 1.15 : 1));
      if (t >= bt)
        puff(
          `ini${c}`,
          t,
          bt,
          INI[c].x + MICRO[0],
          INI[c].y + MICRO[1],
          INI[c].z + MICRO[2],
          c === 0 ? 1.0 : 0.6,
          0xffe680,
        );
      REM[c].visible = t >= bt;
    });
    iniMat.emissiveIntensity =
      0.5 + (t >= T.dazwischen && t < T.trifft ? 0.6 * Math.max(0, Math.sin(t * 6)) : 0);
    // rays (scene time is slowed from trifft)
    RAYS.forEach((g) => {
      const { target, delay } = g.userData;
      const t0 = T.trifft + 0.02 + delay * 0.5;
      const k = ramp(t, t0, t0 + 0.42);
      g.visible = t >= t0 && t < T.platzt + 0.25;
      const y = lerp(10, target.y, smooth(k));
      g.position.set(target.x - (y - target.y) * 0.12, y, target.z);
      g.scale.set(1, 1 - 0.6 * k, 1);
    });
    // beads
    for (let i = 0; i < NB; i++) {
      const b = BEADS[i];
      beadPos(i, t, _p);
      _m.makeTranslation(_p.x, _p.y, _p.z);
      beads.setMatrixAt(i, _m);
      const linked = t >= b.link;
      _c.copy(b.top ? COL_TOP : linked ? COL_LINK : COL_FREE);
      const fl = linked ? 1 - ramp(t, b.link, b.link + 0.45) : 0;
      if (fl > 0) _c.lerp(COL_HOT, fl);
      beads.setColorAt(i, _c);
      b.arms.forEach((d, k) => {
        _q.setFromUnitVectors(UP, d);
        _m.compose(_p, _q, _s.set(1, 1, 1));
        arms.setMatrixAt(i * 3 + k, _m);
        _p2.copy(d).multiplyScalar(0.47).add(_p);
        _m.makeTranslation(_p2.x, _p2.y, _p2.z);
        tips.setMatrixAt(i * 3 + k, _m);
        arms.setColorAt(i * 3 + k, COL_ARM);
      });
    }
    beads.instanceMatrix.needsUpdate =
      arms.instanceMatrix.needsUpdate =
      tips.instanceMatrix.needsUpdate =
        true;
    beads.instanceColor.needsUpdate = arms.instanceColor.needsUpdate = true;
    // heat: every bond flashes; "Milliarden auf einmal" — all of them
    const heatOn = t >= T.und2;
    const allHot = smooth(ramp(t, T.milliarden2, T.milliarden2 + 0.5));
    beadMat.emissiveIntensity = heatOn ? 0.15 + 0.6 * allHot : 0;
    // bonds
    BONDS.forEach((bd, i) => {
      const grow = ramp(t, bd.t, bd.t + 0.14);
      if (grow <= 0) {
        _m.makeScale(0, 0, 0);
        bonds.setMatrixAt(i, _m);
        return;
      }
      endPos(bd.a, t, _p);
      endPos(bd.b, t, _p2);
      _s.copy(_p2).sub(_p);
      const len = _s.length() * grow;
      _q.setFromUnitVectors(UP, _s.normalize());
      _m.compose(_p, _q, _p2.set(1, len, 1));
      bonds.setMatrixAt(i, _m);
      let hot = 1 - ramp(t, bd.t, bd.t + 0.5);
      if (heatOn) {
        const f = ((t - T.und2) * 1.3 + bondPh[i]) % 1;
        hot = Math.max(
          hot,
          f < 0.18 ? Math.sin((f / 0.18) * PI) : 0,
          allHot * (0.75 + 0.25 * Math.sin(t * 8 + i)),
        );
      }
      bonds.setColorAt(i, _c.copy(COL_BOND).lerp(COL_HOT, hot));
    });
    bonds.instanceMatrix.needsUpdate = true;
    if (bonds.instanceColor) bonds.instanceColor.needsUpdate = true;
    // radicals: born at the burst, then ride the head of their chain
    let heroHead = null;
    RAD.forEach((g, c) => {
      const bt = burstT(c);
      g.visible = t >= bt && t < T.also + 0.4;
      if (!g.visible) return;
      const ch = CHAINS[c];
      let idx = -1 - c;
      let prev = -1 - c;
      let tl = bt;
      for (const bd of BONDS) {
        if (bd.t > t) continue;
        if (ch.includes(bd.b) && (bd.a === idx || (bd.a < 0 && -1 - bd.a === c))) {
          prev = idx;
          idx = bd.b;
          tl = bd.t;
        }
      }
      endPos(prev, t, _p);
      endPos(idx, t, _p2);
      _p.lerp(_p2, smooth(ramp(t, tl, tl + 0.12)));
      g.position.copy(_p);
      g.scale.setScalar(squash(t, bt, 0.6).x * (1 + 0.08 * Math.sin(t * 14 + c)));
      if (c === 0) heroHead = { pos: _p.clone(), idx };
    });
    if (heroHead) {
      FOLLOW.x = heroHead.pos.x + MICRO[0];
      FOLLOW.y = heroHead.pos.y + MICRO[1];
      FOLLOW.z = heroHead.pos.z + MICRO[2];
      HEAD[0] = FOLLOW.x;
      HEAD[1] = FOLLOW.y + 0.25;
      HEAD[2] = FOLLOW.z;
      radLight.position.copy(heroHead.pos);
      radLight.intensity = 6;
      // the tiny hand: reaches towards the next bead of the chain
      const ch = CHAINS[0];
      const next = ch[Math.min(ch.length - 1, ch.indexOf(heroHead.idx) + 1)];
      if (t < T.also && next != null) {
        beadPos(next, t, _p2);
        _s.copy(_p2).sub(heroHead.pos).normalize();
        const reach = t >= T.rate && t < T.tausende ? 0.05 * Math.sin(t * 9) : 0;
        _p.copy(heroHead.pos).addScaledVector(_s, 0.3 + reach);
        tiny.group.position.copy(_p).add(micro.position);
        _p2.add(micro.position);
        tiny.group.lookAt(_p2);
        // grab right at each link of the hero chain
        let g = 0;
        for (const bd of BONDS) if (ch.includes(bd.b) && Math.abs(t - bd.t) < 0.12) g = 1;
        tiny.pose(
          g
            ? "grab"
            : t >= T.rate && t < T.tausende
              ? {
                  index: 0.2 + 0.3 * Math.sin(t * 8),
                  middle: 0.3,
                  ring: 0.3,
                  pinky: 0.3,
                  thumb: 0.2,
                }
              : "open",
        );
        tiny.group.visible = true;
      }
    } else radLight.intensity = 0;
    // oxygen settles on the top beads
    TOPB.forEach((bi, k) => {
      const t0 = T.nur + 0.15 + k * 0.07;
      const kf = smooth(ramp(t, t0, t0 + 0.6));
      const vis = t >= t0;
      beadPos(bi, t, _p);
      _p.y += lerp(5, 0.42, kf);
      const side = V(Math.cos(k * 2.1), 0, Math.sin(k * 2.1)).multiplyScalar(0.17);
      for (let s = 0; s < 2; s++) {
        _p2.copy(_p).addScaledVector(side, s ? 1 : -1);
        _m.compose(_p2, _q.identity(), _s.setScalar(vis ? 1 : 0));
        ox.setMatrixAt(k * 2 + s, _m);
      }
    });
    ox.instanceMatrix.needsUpdate = true;
    animateArrows(microHeat, t, pop(t, T.waerme, T.brennt2, 0.3));
  }

  // ------------------------------------------------ ZAHN
  zahn.visible = inZahn;
  if (inZahn) {
    const kIn = smooth(ramp(t, T.fakt, T.zahnarzt + 0.4));
    curingLight.position.set(lerp(3.4, 0.05, kIn), lerp(5.6, 3.65, kIn), lerp(1.4, 0.05, kIn));
    const lit = smooth(ramp(t, T.haertet - 0.1, T.haertet + 0.2));
    cureConeMat.opacity = 0.32 * lit * (0.9 + 0.1 * Math.sin(t * 30));
    cureTipMat.color.setHex(lit > 0.1 ? 0x9cc4ff : 0x2a3a5a);
    cureLight.intensity = 14 * lit;
    const hard = smooth(ramp(t, T.blauem, T.blauem + 0.4));
    fillMat.emissiveIntensity = 0.7 * lit * (1 - hard * 0.6);
    fillMat.roughness = lerp(0.85, 0.15, hard);
    fillMat.color.setHex(hard > 0.5 ? 0xfaf6ee : 0xece2c8);
    fillMesh.scale.set(1, 1 + 0.05 * Math.sin(t * 7) * (1 - hard), 1);
  }

  // ------------------------------------------------ HUD + panels
  counter("radikal", pop(t, T.rate + 0.3, T.jeder, 0.25), {
    label: "BAUSTEINE PRO RADIKAL",
    value: t < T.tausende ? "?" : Math.round(Math.pow(ramp(t, T.tausende, T.kette), 0.6) * 3000),
    y: 1180,
  });
  meter("waerme", pop(t, T.waerme - 0.2, T.brennt2 + 0.9, 0.25), {
    label: "WÄRME IM NAGEL",
    value: 0.15 + 0.85 * smooth(ramp(t, T.und2, T.brennt2)),
    color: "#ff7a2a",
    y: 1180,
  });
  if (t >= T.haertet - 0.2 && t < T.cta)
    showPanel(pop(t, T.haertet - 0.2, T.cta), "HÄRTET MIT", "BLAU", LED.blue);
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
