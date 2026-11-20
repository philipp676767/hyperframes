// #92 Schiefer Turm von Pisa — the tower on the Piazza dei Miracoli (set.js)
// plus a cut-away model of the ground at z = 150 (soft mud, the sinking
// foundation, the centre of gravity, the rescue drills) and a chair as the
// "kippeln" comparison. Every beat keys on a spoken word (beats.js).
import {
  THREE,
  ramp,
  smooth,
  pop,
  V,
  scene,
  camera,
  real,
  roundedBox,
  xrayMaterial,
  xrayEdges,
  setXray,
  showNope,
  makeArrowSet,
  animateArrows,
  coldMat,
  showPanel,
  LED,
  labels,
  squash,
  puff,
  highlights,
  shotCamera,
  renderFrame,
  start,
  rng,
  lerp,
} from "./world.js";
import { person, tourists } from "./set.js";
import { createHand } from "./hand.js";
import { viewfinder } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS, STOREY_AT, STRAIGHT, CUT_Z } from "./beats.js";

highlights(HIGHLIGHTS);
const DEG = Math.PI / 180;
const R0 = 0.97; // tower radius (1 unit = 8 m: 15.5 m wide, ~53 m tall)
const H = 6.58;

// ---------------------------------------------------------------- the tower
function ringOf(parent, geo, mat, n, r, y, face = true) {
  const mesh = new THREE.InstancedMesh(geo, mat, n);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const one = V(1, 1, 1);
  for (let i = 0; i < n; i++) {
    const a = ((i + 0.5) / n) * Math.PI * 2;
    e.set(0, face ? a : 0, 0);
    q.setFromEuler(e);
    m.compose(V(Math.sin(a) * r, y, Math.cos(a) * r), q, one);
    mesh.setMatrixAt(i, m);
  }
  mesh.castShadow = mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
function buildTower({ wall, inner, col, edges = false }) {
  const pivot = new THREE.Group();
  const storeys = [];
  const cyl = (parent, r, h, y, mat, rTop = r) => {
    const geo = new THREE.CylinderGeometry(rTop, r, h, 64);
    const m = new THREE.Mesh(geo, mat);
    m.position.y = y;
    m.castShadow = m.receiveShadow = true;
    parent.add(m);
    if (edges) {
      const e = xrayEdges(geo);
      e.position.y = y;
      parent.add(e);
    }
    return m;
  };
  const colGeo = (h, r) => new THREE.CylinderGeometry(r * 0.85, r, h, 14);
  const arch = (r, n, tube) => new THREE.TorusGeometry((Math.PI * r) / n, tube, 8, 18, Math.PI);
  // ground storey: plinth, wall with blind arcades
  {
    const s = new THREE.Group();
    cyl(s, 1.05, 0.1, 0.05, wall);
    cyl(s, 0.95, 1.33, 0.1 + 0.665, wall);
    ringOf(s, colGeo(1.1, 0.04), col, 15, 0.975, 0.1 + 0.55);
    ringOf(s, arch(0.975, 15, 0.028), col, 15, 0.975, 1.2);
    cyl(s, 1.01, 0.08, 1.37, wall);
    // the door
    const door = new THREE.Mesh(roundedBox(0.22, 0.42, 0.06, 0.02), real.wood(0x4a3122));
    door.position.set(0, 0.31, 0.94);
    s.add(door);
    pivot.add(s);
    storeys.push(s);
  }
  // six open galleries
  for (let k = 0; k < 6; k++) {
    const s = new THREE.Group();
    s.position.y = 1.41 + k * 0.72;
    cyl(s, 0.8, 0.72, 0.36, inner);
    cyl(s, 1.0, 0.06, 0.03, wall);
    ringOf(s, colGeo(0.5, 0.026), col, 30, 0.935, 0.06 + 0.25, false);
    ringOf(s, arch(0.935, 30, 0.018), col, 30, 0.935, 0.56);
    cyl(s, 0.99, 0.1, 0.67, wall);
    pivot.add(s);
    storeys.push(s);
  }
  // bell chamber + cap
  {
    const s = new THREE.Group();
    s.position.y = 1.41 + 6 * 0.72;
    cyl(s, 0.52, 0.66, 0.33, inner);
    cyl(s, 0.68, 0.05, 0.025, wall);
    ringOf(s, colGeo(0.46, 0.025), col, 16, 0.6, 0.05 + 0.23, false);
    ringOf(s, arch(0.6, 16, 0.02), col, 16, 0.6, 0.51);
    cyl(s, 0.65, 0.08, 0.62, wall);
    cyl(s, 0.57, 0.05, 0.69, wall);
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      wall,
    );
    dome.scale.y = 0.22;
    dome.position.y = 0.71;
    s.add(dome);
    // bells
    for (let i = 0; i < 3; i++) {
      const b = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.11, 0.16, 24, 1, true),
        real.metal(0x8a6a3a, { roughness: 0.35, side: THREE.DoubleSide }),
      );
      const a = (i / 3) * Math.PI * 2 + 0.4;
      b.position.set(Math.sin(a) * 0.36, 0.42, Math.cos(a) * 0.36);
      s.add(b);
    }
    pivot.add(s);
    storeys.push(s);
  }
  return { pivot, storeys };
}
// lean (degrees, toward +x) and sink: rotate about the base centre, the
// high edge stays at -sink, the low edge goes into the ground
function setLean(pivot, deg, sink) {
  pivot.rotation.z = -deg * DEG;
  pivot.position.y = -R0 * Math.sin(deg * DEG) - sink;
}

// main tower: polished white marble
const marbleOut = real.ceramic(0xf2ece0, {
  roughness: 0.42,
  clearcoat: 0.2,
  clearcoatRoughness: 0.3,
});
const marbleIn = real.ceramic(0xd6cdbb, { roughness: 0.6, clearcoat: 0 });
const marbleCol = real.ceramic(0xf7f3ea, { roughness: 0.35, clearcoat: 0.3 });
const main = buildTower({ wall: marbleOut, inner: marbleIn, col: marbleCol });
scene.add(main.pivot);

// ---------------------------------------------------------------- the cut-away model
const cut = new THREE.Group();
cut.position.set(0, 0, CUT_Z);
cut.rotation.y = Math.PI;
scene.add(cut);
const xWall = xrayMaterial(0xf2ece0);
const xIn = xrayMaterial(0xd6cdbb);
const xCol = xrayMaterial(0xf7f3ea);
const ct = buildTower({ wall: xWall, inner: xIn, col: xCol, edges: true });
cut.add(ct.pivot);
{
  const f = new THREE.Mesh(
    new THREE.CylinderGeometry(1.12, 1.16, 0.38, 64),
    real.ceramic(0x9a958c, { roughness: 0.85, clearcoat: 0 }),
  );
  f.position.y = -0.19;
  f.castShadow = f.receiveShadow = true;
  ct.pivot.add(f);
}
// soil: back half opaque (the cut face at z = 0), front half see-through
const LAYERS = [
  // [top, bottom, colour, material options]
  [0, -0.07, 0x5f9e3f, { roughness: 0.9 }],
  [-0.07, -0.5, 0x6e4b30, { roughness: 0.95 }],
  [-0.5, -2.3, 0x54463a, { roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.25 }],
  [-2.3, -3.3, 0xc8ab78, { roughness: 0.9 }],
  [-3.3, -4.3, 0x6a6c72, { roughness: 0.6 }],
];
const W2 = 5.6;
const mud = new THREE.Group(); // the mud layer wobbles like a cushion
mud.position.y = -0.5;
cut.add(mud);
LAYERS.forEach(([top, bot, color, o], i) => {
  const h = top - bot;
  const back = new THREE.Mesh(
    roundedBox(W2 * 2, h, 3, 0.015),
    new THREE.MeshPhysicalMaterial({ color, ...o }),
  );
  back.position.set(0, (top + bot) / 2, -1.5);
  back.receiveShadow = true;
  back.castShadow = i === 0;
  const front = new THREE.Mesh(
    new THREE.BoxGeometry(W2 * 2, h, 3),
    new THREE.MeshStandardMaterial({
      color,
      transparent: true,
      opacity: i === 0 ? 0.55 : 0.3,
      depthWrite: false,
      roughness: 0.5,
    }),
  );
  front.position.set(0, (top + bot) / 2, 1.5);
  if (i === 2) {
    back.position.y -= -0.5;
    front.position.y -= -0.5;
    mud.add(back, front);
  } else cut.add(back, front);
});
// wet shine + water drops in the mud, pebbles in the sand (on the cut face)
{
  const r = rng(920);
  const drops = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.035, 14, 10),
    new THREE.MeshPhysicalMaterial({
      color: 0xa9c2cf,
      roughness: 0.05,
      clearcoat: 1,
      metalness: 0.1,
    }),
    46,
  );
  const peb = new THREE.InstancedMesh(
    new THREE.DodecahedronGeometry(0.05, 0),
    real.ceramic(0x8d8578, { roughness: 0.8, clearcoat: 0 }),
    40,
  );
  const m = new THREE.Matrix4();
  for (let i = 0; i < 46; i++) {
    m.makeTranslation((r() * 2 - 1) * (W2 - 0.2), -0.6 - r() * 1.6 + 0.5, 0.012);
    drops.setMatrixAt(i, m);
  }
  for (let i = 0; i < 40; i++) {
    m.makeTranslation((r() * 2 - 1) * (W2 - 0.2), -2.4 - r() * 0.8, 0.02);
    peb.setMatrixAt(i, m);
  }
  mud.add(drops);
  cut.add(peb);
}
// a tourist next to the tower for scale
{
  const p = person({ shirt: 0xd94b4b, pants: 0x2d3e5c, pose: "stand" });
  p.position.set(2.3, 0, 1.6);
  cut.add(p);
}

// ghost tower: the one that would fall (red, see-through)
const ghostMat = new THREE.MeshStandardMaterial({
  color: 0xff3b2f,
  emissive: 0xff2a1a,
  emissiveIntensity: 0.35,
  transparent: true,
  opacity: 0,
  depthWrite: false,
});
const ghost = new THREE.Group();
{
  const a = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 5.73, 48), ghostMat);
  a.position.y = 5.73 / 2;
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.66, 0.85, 48), ghostMat);
  b.position.y = 5.73 + 0.42;
  ghost.add(a, b);
}
cut.add(ghost);

// centre of gravity + plumb line + the edge mark (world space)
const ballMat = new THREE.MeshStandardMaterial({
  color: 0xff3b2f,
  emissive: 0xff2a1a,
  emissiveIntensity: 1.2,
});
const ball = new THREE.Mesh(new THREE.SphereGeometry(0.16, 32, 20), ballMat);
ball.userData.noAO = true;
scene.add(ball);
const lineMat = new THREE.MeshBasicMaterial({ color: 0xffd23f });
const plumb = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1, 8), lineMat);
scene.add(plumb);
const foot = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.02, 8, 32), lineMat);
foot.rotation.x = -Math.PI / 2;
scene.add(foot);
const edgeMat = new THREE.MeshBasicMaterial({ color: 0xff3b2f });
const edge = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.05, 1.1), edgeMat);
scene.add(edge);
const RED = new THREE.Color(0xff3b2f);
const GREEN = new THREE.Color(0x35e06f);
const YEL = new THREE.Color(0xffd23f);

// ---------------------------------------------------------------- the rescue drill (cut model, high side = -x)
const rig = new THREE.Group();
{
  const yellow = real.plastic(0xf2b705);
  const dark = real.rubber(0x26272b);
  const body = new THREE.Mesh(roundedBox(0.9, 0.42, 0.62, 0.05), yellow);
  body.position.set(0, 0.36, 0);
  const track = new THREE.Mesh(roundedBox(1.0, 0.16, 0.7, 0.07), dark);
  track.position.y = 0.08;
  const cab = new THREE.Mesh(roundedBox(0.34, 0.3, 0.5, 0.04), yellow);
  cab.position.set(-0.22, 0.72, 0);
  const glass = new THREE.Mesh(
    roundedBox(0.02, 0.18, 0.4, 0.01),
    real.glass ? real.glass(0x9fc4d8) : yellow,
  );
  glass.position.set(-0.05, 0.75, 0);
  rig.add(body, track, cab, glass);
  rig.traverse((o) => {
    if (o.isMesh) o.castShadow = o.receiveShadow = true;
  });
  rig.position.set(-4.75, 0, 0.9);
  cut.add(rig);
}
const DS = V(-4.25, 0.25, 0.9); // drill start (at the rig)
const DE = V(-0.85, -0.78, 0.9); // drill tip: under the high edge
const dDir = DE.clone().sub(DS);
const dLen = dDir.length();
dDir.normalize();
const drill = new THREE.Group();
drill.position.copy(DS);
drill.quaternion.setFromUnitVectors(V(0, 1, 0), dDir);
cut.add(drill);
const auger = new THREE.Group();
drill.add(auger);
{
  const tube = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, dLen, 24),
    real.metal(0xb8bec6, { roughness: 0.3 }),
  );
  tube.position.y = dLen / 2;
  auger.add(tube);
  const pts = [];
  for (let i = 0; i <= 260; i++) {
    const f = i / 260;
    const a = f * Math.PI * 2 * 26;
    pts.push(V(Math.cos(a) * 0.1, f * dLen, Math.sin(a) * 0.1));
  }
  const helix = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 520, 0.022, 6),
    real.metal(0x9aa2ab, { roughness: 0.35 }),
  );
  auger.add(helix);
}
const NCH = 16;
const chunks = new THREE.InstancedMesh(
  new THREE.DodecahedronGeometry(0.075, 0),
  new THREE.MeshPhysicalMaterial({ color: 0x5a4636, roughness: 0.5, clearcoat: 0.4 }),
  NCH,
);
cut.add(chunks);
const pile = new THREE.Mesh(
  new THREE.ConeGeometry(0.55, 0.5, 32),
  new THREE.MeshPhysicalMaterial({ color: 0x54463a, roughness: 0.5, clearcoat: 0.4 }),
);
pile.position.set(-5.35, 0, 1.75);
pile.castShadow = pile.receiveShadow = true;
cut.add(pile);
const cavity = new THREE.Mesh(
  new THREE.SphereGeometry(0.4, 32, 20),
  new THREE.MeshStandardMaterial({ color: 0x1e140d, roughness: 1 }),
);
cavity.position.copy(DE);
cut.add(cavity);
const PILE_TOP = V(-5.35, 0.45, 1.75);

// ---------------------------------------------------------------- the chair (kippeln), next to the cut model
const chairSet = new THREE.Group();
chairSet.position.set(10, 0, 0);
cut.add(chairSet);
{
  const slab = new THREE.Mesh(
    roundedBox(4, 0.5, 3.2, 0.04),
    new THREE.MeshPhysicalMaterial({ color: 0xcfc6b4, roughness: 0.7 }),
  );
  slab.position.y = -0.25;
  slab.receiveShadow = true;
  chairSet.add(slab);
}
const chairTilt = new THREE.Group(); // pivot on the back legs' feet
chairSet.add(chairTilt);
const CH = 1.9; // a real chair, 1.9x for the shot
{
  const chair = new THREE.Group();
  const wood = real.wood(0x9a6a40);
  const leg = (x, z, h) => {
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.018 * CH, 0.022 * CH, h, 20), wood);
    l.position.set(x, h / 2, z);
    chair.add(l);
  };
  leg(-0.2 * CH, 0.2 * CH, 0.45 * CH);
  leg(0.2 * CH, 0.2 * CH, 0.45 * CH);
  leg(-0.2 * CH, -0.2 * CH, 0.9 * CH);
  leg(0.2 * CH, -0.2 * CH, 0.9 * CH);
  const seat = new THREE.Mesh(roundedBox(0.46 * CH, 0.04 * CH, 0.46 * CH, 0.012 * CH), wood);
  seat.position.y = 0.46 * CH;
  chair.add(seat);
  for (const y of [0.68, 0.84]) {
    const rail = new THREE.Mesh(roundedBox(0.44 * CH, 0.06 * CH, 0.025 * CH, 0.01 * CH), wood);
    rail.position.set(0, y * CH, -0.2 * CH);
    chair.add(rail);
  }
  chair.traverse((o) => {
    if (o.isMesh) o.castShadow = o.receiveShadow = true;
  });
  chair.position.z = 0.2 * CH;
  chairTilt.add(chair);
  chairTilt.position.z = -0.2 * CH;
}
chairTilt.parent.rotation.y = Math.PI / 2; // chair faces +x of the set, tips back to -x: seen side-on

// ---------------------------------------------------------------- the 4 m on the main tower
const DZ = 1.3; // the measure stands in front of the tower
const dims = new THREE.Group();
scene.add(dims);
const dimMat = new THREE.MeshBasicMaterial({ color: 0xffd23f, transparent: true, opacity: 0 });
const dash = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.03, 0.03, 0.18, 8), dimMat, 22);
dims.add(dash);
const dimBar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1, 10), dimMat);
dimBar.rotation.z = Math.PI / 2;
dims.add(dimBar);
const dimHead = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 16), dimMat);
dimHead.rotation.z = -Math.PI / 2;
dims.add(dimHead);

// ---------------------------------------------------------------- cushion waves (cut model)
const waves = makeArrowSet(
  [
    [V(-2.6, -4.6, 1.6), V(-2.6, -2.2, 1.6)],
    [V(0, -4.6, 1.6), V(0, -2.2, 1.6)],
    [V(2.6, -4.6, 1.6), V(2.6, -2.2, 1.6)],
  ],
  { parent: cut, mat: coldMat, amp: 0.12, r: 0.05 },
);

// ---------------------------------------------------------------- the photo tourist (lined up with the lens)
const photoShot = shots.find((s) => s.photo);
const posers = person({
  shirt: 0xf2c14e,
  pants: 0x2d3e5c,
  skin: 0xe8b394,
  hair: 0x6b4a2b,
  pose: "push",
});
{
  const C = V(...photoShot.to);
  // the tower's right-hand silhouette at y = 2.2 (as seen from the lens)
  const lean = 5.5 * DEG;
  const PY = 2.2;
  const axisX = PY * Math.tan(lean);
  const d = V(axisX - C.x, 0, -C.z).normalize();
  const right = V(-d.z, 0, d.x);
  const P = V(axisX + right.x * (R0 + 0.02), PY, right.z * (R0 + 0.02));
  const hl = posers.userData.hand;
  const f = (hl.y - C.y) / (P.y - C.y);
  const Hp = C.clone().add(P.clone().sub(C).multiplyScalar(f));
  // face the lens
  posers.rotation.y = Math.atan2(C.x - Hp.x, C.z - Hp.z);
  const hw = hl.clone().applyAxisAngle(V(0, 1, 0), posers.rotation.y);
  posers.position.set(Hp.x - hw.x, 0, Hp.z - hw.z);
}

// ---------------------------------------------------------------- the viewer's hand (first person)
const hand = createHand({ scale: 0.12, sleeve: 0x2f3542 });
const HAND_ROT = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, Math.PI, 0));
// in the lens frame: palm turned toward the tower (left) and fingers tilted with the lean
const HAND_TILT = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0.75, -0.12, "ZYX"));

// the key light follows the action so the cut model gets real shadows too
let key = null;
scene.traverse((o) => {
  if (o.isDirectionalLight && o.castShadow) key = o;
});
const KEY0 = key ? key.position.clone() : null;
if (key) scene.add(key.target);

const applyCamera = shotCamera(shots, 1);
const shotAt = (t) => {
  let s = shots[0];
  for (const x of shots) if (x.at <= t) s = x;
  return s;
};

// ---------------------------------------------------------------- timelines
function leanMain(t) {
  let a = t < T.weg ? 5.5 : 5.0;
  if (t < 2.2) a += 1.6 * Math.exp(-t * 2.2) * Math.cos(t * 8);
  a += 1.8 * smooth(ramp(t, T.dann - 0.2, T.dann + 1.4)) * (1 - ramp(t, T.weg - 0.3, T.weg));
  if (t > T.knapp && t < T.weg) a += 0.15 * Math.sin((t - T.knapp) * 2.4);
  if (t > T.erdbeben)
    a += 0.8 * Math.sin((t - T.erdbeben) * 15) * Math.exp(-(t - T.erdbeben) * 1.6);
  return a;
}
const built = (t) => STOREY_AT.reduce((n, at) => n + smooth(ramp(t, at, at + 0.3)), 0);
const straight = (t) => smooth(ramp(t, STRAIGHT[0], STRAIGHT[1]));
function leanCut(t) {
  if (t < T.schon) return 4.2 + 0.7 * smooth(ramp(t, T.sand, T.sand + 0.7));
  let a = 0.3 + built(t) * 0.86 - 2.2 * straight(t);
  if (t > T.kissen) a += 0.5 * Math.sin((t - T.kissen) * 11) * Math.exp(-(t - T.kissen) * 2.5);
  return a;
}
function sinkCut(t) {
  if (t < T.schon) return 0.08 + 0.12 * smooth(ramp(t, T.sand, T.sand + 0.7));
  return 0.06 + (built(t) / 8) * 0.18 + 0.14 * straight(t);
}

// ---------------------------------------------------------------- render
function renderAt(t) {
  const shot = shotAt(t);
  const inCut = shot.from[2] > 100 || (shot.look && shot.look[2] > 100);

  // the main tower
  setLean(main.pivot, leanMain(t), 0.12);

  // the cut model's tower: rebuilt storey by storey, sinks and tips
  setLean(ct.pivot, leanCut(t), sinkCut(t));
  ct.storeys.forEach((s, i) => {
    const at = STOREY_AT[i];
    const building = t >= T.schon && t < at + 0.8;
    s.visible = !(t >= T.schon && t < at);
    if (building && s.visible) s.scale.copy(squash(t, at, 0.6));
    else s.scale.set(1, 1, 1);
  });
  const xk =
    smooth(ramp(t, T.er2 - 0.05, T.er2 + 0.35)) * (1 - ramp(t, T.wie2 - 0.05, T.wie2)) +
    smooth(ramp(t, T.die - 0.05, T.die + 0.3)) * (1 - ramp(t, T.zurueck + 0.7, T.zurueck + 1.2));
  setXray([xWall, xIn, xCol], xk);

  // mud wobbles (on "Matsch" and as the cushion)
  let wob = 0;
  if (t > T.matsch) wob += 0.06 * Math.sin((t - T.matsch) * 16) * Math.exp(-(t - T.matsch) * 2.5);
  if (t > T.kissen) wob += 0.08 * Math.sin((t - T.kissen) * 13) * Math.exp(-(t - T.kissen) * 1.8);
  mud.scale.y = 1 + wob;
  animateArrows(waves, t, pop(t, T.kissen - 0.05, T.hast));

  // ghost: splits off, tips over the edge, falls
  const gk =
    ramp(t, T.schwer + 0.25, T.schwer + 0.5) * (1 - ramp(t, T.kante + 0.65, T.kante + 0.85));
  let gLean = leanCut(t);
  if (t > T.schwer + 0.25) {
    const a = smooth(ramp(t, T.schwer + 0.25, T.kante + 0.15));
    const fall = ramp(t, T.kante + 0.15, T.kante + 0.8);
    gLean = lerp(gLean, 19, a) + fall * fall * 62;
  }
  ghostMat.opacity = 0.32 * gk;
  ghost.visible = gk > 0.01;
  setLean(ghost, gLean, sinkCut(t));
  showNope(pop(t, T.kante + 0.55, T.wie2), ...CUTW(2.6, 2.6, 0.5), 1.0);

  // centre of gravity + plumb line (on the ghost while it tips, else on the tower)
  const plumbK = pop(t, T.schwer - 0.05, T.wie2, 0.25) + pop(t, T.die + 0.1, T.weg, 0.25);
  const onGhost = t > T.schwer + 0.25 && t < T.kante + 0.85;
  const src = onGhost ? ghost : ct.pivot;
  cut.updateMatrixWorld(true);
  const cg = src.localToWorld(V(0, 2.75, 0));
  ball.position.copy(cg);
  ball.scale.setScalar(
    Math.max(0.001, plumbK * (onGhost ? 1 - ramp(t, T.kante + 0.5, T.kante + 0.8) : 1)) *
      (1 + 0.35 * pop(t, T.zurueck, T.zurueck + 0.6)),
  );
  ball.visible = plumbK > 0.01;
  const st = straight(t);
  const cB = RED.clone().lerp(GREEN, smooth(ramp(t, STRAIGHT[1] - 0.3, T.zurueck)));
  ballMat.color.copy(cB);
  ballMat.emissive.copy(cB);
  const footY = 0.01;
  plumb.visible = foot.visible = ball.visible;
  plumb.scale.set(plumbK, Math.max(0.01, cg.y - footY), plumbK);
  plumb.position.set(cg.x, (cg.y + footY) / 2, cg.z);
  foot.position.set(cg.x, footY, cg.z);
  lineMat.color.copy(YEL.clone().lerp(GREEN, smooth(ramp(t, STRAIGHT[1] - 0.3, T.zurueck))));
  // the edge: the tower's low edge on the ground
  const edgeK = pop(t, T.kante - 0.1, T.wie2, 0.2) + pop(t, T.darum2, T.weg, 0.2);
  edge.visible = edgeK > 0.01;
  const ew = ct.pivot.localToWorld(V(R0, 0, 0));
  edge.position.set(ew.x, 0.03, ew.z);
  edge.scale.setScalar(Math.max(0.001, edgeK));
  edgeMat.color.copy(RED).multiplyScalar(1 + 0.6 * Math.sin(t * 14) * edgeK);
  void st;

  // the drill: grows in, turns, chunks of earth come out, the cavity grows
  const dg = smooth(ramp(t, T.bohrt, T.bohrt + 1.1));
  const drillOn = t >= T.bohrt - 0.05 && t < T.darum2;
  drill.visible = drillOn && dg > 0.01;
  drill.scale.set(1, Math.max(0.01, dg), 1);
  auger.rotation.y = t * 14;
  rig.visible = t >= T.man - 0.3;
  const ext = t >= T.erde - 0.3 && t < T.die + 0.4;
  const mm = new THREE.Matrix4();
  for (let i = 0; i < NCH; i++) {
    const u = (t * 0.6 + i / NCH) % 1;
    let p;
    let s = ext ? Math.min(1, ramp(t, T.erde - 0.3, T.erde)) : 0;
    if (u < 0.78) p = DE.clone().lerp(DS, u / 0.78);
    else {
      const k = (u - 0.78) / 0.22;
      p = DS.clone().lerp(PILE_TOP, k);
      p.y += Math.sin(k * Math.PI) * 0.35;
    }
    s *= Math.min(1, u * 8, (1 - u) * 8);
    mm.compose(
      p,
      new THREE.Quaternion().setFromEuler(new THREE.Euler(i, t * 3 + i, 0)),
      V(s, s, s),
    );
    chunks.setMatrixAt(i, mm);
  }
  chunks.instanceMatrix.needsUpdate = true;
  const removed = smooth(ramp(t, T.erde, T.die + 0.2));
  pile.visible = t >= T.erde && t < T.weg + 1;
  pile.scale.set(0.3 + 0.7 * removed, Math.max(0.01, removed), 0.3 + 0.7 * removed);
  const cav = removed * (1 - straight(t) * 0.85);
  cavity.visible = cav > 0.02 && t < T.weg;
  cavity.scale.set(cav * 1.2, cav * 0.7, cav);

  // the chair rocks back … and goes over
  let ca = 0;
  if (t > T.wie2 - 0.2) ca = 12 + 6 * Math.sin((t - T.wie2) * 7);
  if (t > T.stuhl - 0.1) {
    const k = ramp(t, T.stuhl - 0.1, T.stuhl + 0.3);
    ca = lerp(ca, 96, k * k);
  }
  chairTilt.rotation.x = -ca * DEG;

  // the 4 m: plumb line up from the base and the arrow over to the top
  const dk = pop(t, T.vier - 0.1, T.rate, 0.25);
  dims.visible = dk > 0.01;
  if (dims.visible) {
    dimMat.opacity = dk;
    main.pivot.updateMatrixWorld(true);
    const top = main.pivot.localToWorld(V(0, H, 0));
    const m = new THREE.Matrix4();
    for (let i = 0; i < 22; i++) {
      m.makeTranslation(0, ((i + 0.5) / 22) * top.y, DZ);
      dash.setMatrixAt(i, m);
    }
    dash.instanceMatrix.needsUpdate = true;
    const grow = smooth(ramp(t, T.vier - 0.1, T.vier + 0.4));
    const len = Math.max(0.01, (top.x - 0.12) * grow);
    dimBar.scale.set(1, len, 1);
    dimBar.position.set(len / 2, top.y, DZ);
    dimHead.position.set(len + 0.06, top.y, DZ);
  }
  if (t >= T.vier && t < T.rate) showPanel(pop(t, T.vier, T.rate), "SPITZE", "4 m", LED.yellow);
  else showPanel(0);

  // earthquake: dust, tourists wobble
  const q = t > T.erdbeben && t < T.erdbeben + 1.8 ? Math.exp(-(t - T.erdbeben) * 1.5) : 0;
  for (const tr of tourists) {
    if (tr.walk) continue;
    tr.p.position.x = tr.x + q * 0.03 * Math.sin(t * 41 + tr.seed);
    tr.p.position.z = tr.z + q * 0.03 * Math.cos(t * 37 + tr.seed);
  }
  [
    [1.6, 0.6],
    [-1.4, 1.1],
    [0.4, 1.9],
    [2.4, 2.6],
  ].forEach(([x, z], i) => puff(`q${i}`, t, T.erdbeben + i * 0.09, x, 0.05, z, 0.9));

  // labels (Schwerpunkt follows the ball)
  labels(
    t,
    LABELS.map((l) => (l.text === "Schwerpunkt" ? { ...l, pos: ball.position.clone() } : l)),
  );

  // light follows the action (cut model is turned 180°)
  if (key) {
    if (inCut) {
      key.position.set(-KEY0.x, KEY0.y, CUT_Z - KEY0.z);
      key.target.position.set(0, -1, CUT_Z);
    } else {
      key.position.copy(KEY0);
      key.target.position.set(0, 0, 0);
    }
    key.target.updateMatrixWorld();
  }

  applyCamera(t);
  camera.updateMatrixWorld(true);

  // viewfinder for the photo
  viewfinder(shot.photo ? 1 : 0, { label: "FOTO · PISA", time: "1/250", color: "#ff3b5c" });

  // the viewer's hand, attached to the lens (hook + "Hast du ihn auch schon gestützt?")
  hand.group.visible = !!shot.hand;
  if (shot.hand) {
    hand.pose("open");
    // palm on the tower's leaning (right) flank, as seen from the lens
    const lean = leanMain(t) * DEG;
    const yH = 4.3;
    const ax = V(yH * Math.tan(lean), yH, 0);
    const toAx = ax.clone().sub(camera.position);
    const right = V(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();
    const flank = ax.clone().addScaledVector(right, R0 / Math.cos(lean));
    const dir = flank.sub(camera.position).normalize();
    const push = pop(t, shot.at + 0.2, shot.at + 0.9, 0.2) * 0.03;
    hand.group.position
      .copy(camera.position)
      .addScaledVector(dir, 0.55 - push)
      .addScaledVector(right, -0.006);
    void toAx;
    hand.group.quaternion.copy(camera.quaternion).multiply(HAND_TILT).multiply(HAND_ROT);
  }

  renderFrame();
}
// world point of a point in the cut model's frame (for showNope etc.)
function CUTW(x, y, z) {
  return [-x, y, CUT_Z - z];
}

start(renderAt);
