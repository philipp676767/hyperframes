// #99 Airbag gegen Gurt — two crash-test sleds side by side: the left
// dummy only has a three-point belt, the right one only an airbag. Each
// sled: blue chassis on rails, crush nose, seat, dashboard, roll cage. The
// dummies are posed as a pure function of the crash progress p (0 = impact,
// 1 = settled), from CRASH in beats.js.
import {
  THREE,
  V,
  ramp,
  smooth,
  clamp01,
  pop,
  scene,
  camera,
  real,
  roundedBox,
  puff,
  showPanel,
  LED,
  labels,
  highlights,
  shotCamera,
  renderFrame,
  start,
  makeArrowSet,
  animateArrows,
  forceMat,
} from "./world.js";
import { LANE, TOWER, canvasTex, stripeTex, targetTex } from "./set.js";
import { gauge, viewfinder } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS, CRASH, BAG_TESTS } from "./beats.js";

highlights(HIGHLIGHTS);

// ---------------------------------------------------------------- helpers
const add = (parent, geo, mat, x = 0, y = 0, z = 0, shadow = true) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};
const UP = V(0, 1, 0);
function limb(parent, a, b, r, mat, segR = 20) {
  const A = V(...a);
  const B = V(...b);
  const m = add(parent, new THREE.CapsuleGeometry(r, A.distanceTo(B), 8, segR), mat);
  m.position.copy(A).add(B).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(UP, B.clone().sub(A).normalize());
  return m;
}
function tube(parent, a, b, r, mat) {
  const A = V(...a);
  const B = V(...b);
  const m = add(parent, new THREE.CylinderGeometry(r, r, A.distanceTo(B), 20), mat);
  m.position.copy(A).add(B).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(UP, B.clone().sub(A).normalize());
  return m;
}
const bump = (p, a, b, c) =>
  p < a || p > c ? 0 : p < b ? smooth((p - a) / (b - a)) : 1 - smooth((p - b) / (c - b));

// ---------------------------------------------------------------- materials
const yellow = real.plastic(0xf0b81c, { roughness: 0.4, clearcoat: 0.35 });
const joint = real.rubber(0x1d1e21, { roughness: 0.7 });
const chassis = real.gloss(0x1f5fbf, { roughness: 0.28 });
const deck = real.metal(0x9aa1a9, { roughness: 0.42 });
const cage = real.metal(0xb4bcc6, { roughness: 0.22 });
const seatFab = real.fabric(0x2a2c33);
const dashMat = real.plastic(0x2b2d32, { roughness: 0.55, clearcoat: 0.1 });
const beltMat = real.fabric(0x17181b, { side: THREE.DoubleSide });
const chrome = real.metal(0xdfe3e8, { roughness: 0.12 });
const targetMat = new THREE.MeshStandardMaterial({
  map: targetTex,
  roughness: 0.5,
  polygonOffset: true,
  polygonOffsetFactor: -2,
});
const srsTex = canvasTex(512, 320, (g, w, h) => {
  g.fillStyle = "#2b2d32";
  g.fillRect(0, 0, w, h);
  // fine grain of the soft-touch cover
  for (let i = 0; i < 2500; i++) {
    g.fillStyle = `rgba(255,255,255,${0.02 + (i % 7) * 0.004})`;
    g.fillRect((i * 97) % w, (i * 57) % h, 2, 2);
  }
  g.fillStyle = "#c9ccd2";
  g.font = "900 150px Montserrat, Arial, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("SRS", w / 2, h / 2 - 40);
  g.font = "800 64px Montserrat, Arial, sans-serif";
  g.fillText("AIRBAG", w / 2, h / 2 + 80);
});
const srsMat = new THREE.MeshStandardMaterial({
  map: srsTex,
  roughness: 0.6,
  emissive: 0xffffff,
  emissiveMap: srsTex,
  emissiveIntensity: 0,
});

// ---------------------------------------------------------------- dummy
// Hybrid-III-style crash-test dummy, seated, facing -x. Root = hip joint.
function makeDummy() {
  const root = new THREE.Group();
  // pelvis
  add(root, new THREE.SphereGeometry(0.15, 40, 28), yellow, -0.02, 0.0, 0).scale.set(
    0.95,
    0.75,
    1.25,
  );
  // legs
  for (const s of [-1, 1]) {
    add(root, new THREE.SphereGeometry(0.075, 24, 16), joint, 0, -0.01, s * 0.1);
    limb(root, [0, 0, s * 0.1], [-0.42, 0.04, s * 0.12], 0.075, yellow);
    add(root, new THREE.SphereGeometry(0.068, 24, 16), joint, -0.43, 0.04, s * 0.12);
    limb(root, [-0.43, 0.03, s * 0.12], [-0.56, -0.38, s * 0.12], 0.056, yellow);
    add(root, roundedBox(0.24, 0.08, 0.1, 0.035), joint, -0.62, -0.43, s * 0.12);
    add(
      root,
      new THREE.CircleGeometry(0.04, 32),
      targetMat,
      -0.22,
      0.04,
      s * 0.12 + s * 0.076,
    ).rotation.y = s > 0 ? 0 : Math.PI;
  }
  // torso (pivot at the lumbar joint)
  const torso = new THREE.Group();
  torso.position.set(0, 0.07, 0);
  root.add(torso);
  add(torso, new THREE.CylinderGeometry(0.075, 0.09, 0.12, 32), joint, 0, 0.06, 0);
  const chest = add(torso, roundedBox(0.26, 0.34, 0.38, 0.1, 6), yellow, 0, 0.3, 0);
  chest.scale.set(1, 1, 1);
  for (let k = 0; k < 3; k++)
    add(
      torso,
      new THREE.TorusGeometry(0.17, 0.006, 8, 48, Math.PI * 0.9),
      joint,
      -0.06,
      0.2 + k * 0.08,
      0,
    ).rotation.set(0, Math.PI / 2, -Math.PI * 0.45);
  add(torso, new THREE.CircleGeometry(0.035, 32), targetMat, -0.002, 0.33, 0.193);
  add(torso, new THREE.CircleGeometry(0.035, 32), targetMat, -0.002, 0.33, -0.193).rotation.y =
    Math.PI;
  // shoulders + arms
  const arms = [];
  for (const s of [-1, 1]) {
    const sh = new THREE.Group();
    sh.position.set(0, 0.42, s * 0.22);
    torso.add(sh);
    arms.push(sh);
    add(sh, new THREE.SphereGeometry(0.07, 24, 16), joint);
    limb(sh, [0, 0, 0], [-0.05, -0.27, s * 0.03], 0.055, yellow);
    add(sh, new THREE.SphereGeometry(0.05, 20, 14), joint, -0.05, -0.27, s * 0.03);
    limb(sh, [-0.05, -0.27, s * 0.03], [-0.3, -0.32, s * 0.0], 0.045, yellow);
    add(sh, roundedBox(0.12, 0.05, 0.08, 0.025), joint, -0.37, -0.33, 0);
  }
  // neck (rubber discs) + head
  const neck = new THREE.Group();
  neck.position.set(0, 0.49, 0);
  torso.add(neck);
  for (let k = 0; k < 3; k++)
    add(neck, new THREE.CylinderGeometry(0.045, 0.045, 0.025, 28), joint, 0, 0.015 + k * 0.032, 0);
  for (let k = 0; k < 2; k++)
    add(neck, new THREE.CylinderGeometry(0.05, 0.05, 0.008, 28), chrome, 0, 0.032 + k * 0.032, 0);
  const head = new THREE.Group();
  head.position.set(0, 0.1, 0);
  neck.add(head);
  add(head, new THREE.SphereGeometry(0.1, 48, 36), yellow, 0, 0.1, 0).scale.set(1.0, 1.18, 0.88);
  add(head, new THREE.SphereGeometry(0.06, 32, 20), yellow, -0.05, 0.03, 0).scale.set(
    0.9,
    0.8,
    1.1,
  ); // jaw
  add(head, new THREE.SphereGeometry(0.018, 20, 12), yellow, -0.1, 0.1, 0).scale.set(1, 1.4, 0.8); // nose
  add(head, roundedBox(0.02, 0.018, 0.12, 0.008), yellow, -0.088, 0.135, 0); // brow
  for (const s of [-1, 1]) {
    const d = add(head, new THREE.CircleGeometry(0.045, 40), targetMat, 0.0, 0.11, s * 0.089);
    if (s < 0) d.rotation.y = Math.PI;
  }
  return { root, torso, neck, head, arms };
}
const REC = -0.24; // seat recline of the torso
function pose(d, { slide = 0, lift = 0, pitch = 0, headR = 0, arm = 0 }) {
  d.root.position.x = 0.05 - slide;
  d.root.position.y = 0.82 + lift;
  d.torso.rotation.z = REC + pitch;
  d.neck.rotation.z = headR * 0.45;
  d.head.rotation.z = headR * 0.55;
  for (const a of d.arms) a.rotation.z = arm;
}
const restPose = {};
function beltedPose(p) {
  return {
    slide: 0.05 * bump(p, 0.03, 0.3, 0.9),
    pitch: 0.55 * bump(p, 0.05, 0.36, 0.92),
    headR: 0.5 * bump(p, 0.14, 0.42, 0.86) - 0.18 * bump(p, 0.5, 0.68, 0.98),
    arm: 1.1 * bump(p, 0.05, 0.4, 0.92),
  };
}
function unbeltedPose(p) {
  return {
    slide: 0.3 * smooth(ramp(p, 0.03, 0.42)),
    lift: 0.04 * bump(p, 0.1, 0.3, 0.6),
    pitch: 0.42 * smooth(ramp(p, 0.05, 0.27)) + 0.5 * smooth(ramp(p, 0.45, 1)),
    headR: -0.62 * bump(p, 0.25, 0.31, 0.56) + 0.5 * smooth(ramp(p, 0.6, 1)),
    arm: 1.5 * smooth(ramp(p, 0.05, 0.35)) - 0.6 * smooth(ramp(p, 0.5, 1)),
  };
}

// ---------------------------------------------------------------- sled
const signs = [];
function makeSled(kind) {
  const g = new THREE.Group();
  scene.add(g);
  // chassis, deck, wheels, crush nose
  for (const s of [-1, 1])
    add(g, roundedBox(2.4, 0.14, 0.12, 0.03), chassis, -0.15, 0.17, s * 0.38);
  add(g, roundedBox(2.3, 0.05, 1.0, 0.02), deck, -0.15, 0.29, 0);
  for (const x of [-0.95, 0.75])
    for (const s of [-1, 1]) {
      const w = add(
        g,
        new THREE.CylinderGeometry(0.09, 0.09, 0.07, 32),
        real.metal(0x30343a, { roughness: 0.35 }),
        x,
        0.1,
        s * 0.38,
      );
      w.rotation.x = Math.PI / 2;
    }
  add(g, roundedBox(0.26, 0.3, 0.86, 0.04), real.plastic(0x1b1c1f), -1.42, 0.32, 0);
  const ns = add(
    g,
    new THREE.PlaneGeometry(0.86, 0.12),
    new THREE.MeshStandardMaterial({ map: stripeTex(3), roughness: 0.6 }),
    -1.552,
    0.32,
    0,
    false,
  );
  ns.rotation.y = -Math.PI / 2;
  // seat
  for (const [x, z] of [
    [-0.15, -0.2],
    [-0.15, 0.2],
    [0.25, -0.2],
    [0.25, 0.2],
  ])
    add(g, new THREE.CylinderGeometry(0.025, 0.025, 0.36, 12), cage, x, 0.48, z);
  add(g, roundedBox(0.55, 0.14, 0.54, 0.06), seatFab, 0.03, 0.7, 0);
  const back = new THREE.Group();
  back.position.set(0.3, 0.74, 0);
  back.rotation.z = REC;
  g.add(back);
  add(back, roundedBox(0.13, 0.68, 0.52, 0.06), seatFab, 0.02, 0.34, 0);
  add(back, roundedBox(0.11, 0.2, 0.3, 0.05), seatFab, 0.02, 0.84, 0);
  for (const s of [-1, 1])
    add(back, new THREE.CylinderGeometry(0.01, 0.01, 0.12, 10), chrome, 0.02, 0.7, s * 0.07);
  // footrest + dashboard
  add(g, roundedBox(0.3, 0.05, 0.7, 0.02), deck, -0.7, 0.36, 0).rotation.z = 0.35;
  add(g, roundedBox(0.48, 0.44, 1.02, 0.07), dashMat, -0.82, 0.91, 0);
  add(g, roundedBox(0.02, 0.12, 0.4, 0.01), real.plastic(0x1f2024), -0.575, 0.84, -0.15); // glovebox seam
  for (const s of [-1, 1])
    add(g, new THREE.CylinderGeometry(0.035, 0.035, 0.56, 16), cage, -0.82, 0.48, s * 0.42);
  // roll cage: one hoop behind the seat (keeps every camera angle open)
  for (const s of [-1, 1]) tube(g, [0.5, 0.32, s * 0.5], [0.5, 1.98, s * 0.5], 0.026, cage);
  tube(g, [0.5, 1.98, -0.5], [0.5, 1.98, 0.5], 0.026, cage);
  for (const s of [-1, 1]) tube(g, [0.5, 1.3, s * 0.5], [0.85, 0.32, s * 0.5], 0.02, cage);
  // sign on the cage
  const sign = canvasTex(512, 160, (c, w, h) => {
    c.fillStyle = kind === "gurt" ? "#f2c230" : "#ffffff";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#151515";
    c.font = "900 110px Montserrat, Arial, sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(kind === "gurt" ? "GURT" : "AIRBAG", w / 2, h / 2 + 6);
  });
  const sp = add(
    g,
    new THREE.PlaneGeometry(0.8, 0.25),
    new THREE.MeshStandardMaterial({ map: sign, roughness: 0.6, side: THREE.DoubleSide }),
    0.5,
    2.17,
    0,
    false,
  );
  sp.rotation.y = -Math.PI / 4;
  signs.push(sp);
  tube(g, [0.5, 1.98, 0], [0.5, 2.05, 0], 0.012, cage);

  const dummy = makeDummy();
  g.add(dummy.root);
  pose(dummy, restPose);
  return { g, dummy };
}
const sleds = [makeSled("gurt"), makeSled("airbag")];
sleds.forEach((s, i) => (s.g.position.z = LANE[i]));

// ---------------------------------------------------------------- airbag (right sled)
const S1 = sleds[1].g;
const MOD = V(-0.66, 1.135, 0);
const lid = new THREE.Group();
lid.position.set(-0.8, 1.135, 0);
S1.add(lid);
add(lid, roundedBox(0.28, 0.022, 0.34, 0.01), dashMat, 0.14, 0.004, 0);
const srs = add(lid, new THREE.PlaneGeometry(0.26, 0.162), srsMat, 0.14, 0.0165, 0, false);
srs.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
srs.userData.noAO = true;
const bagGeo = new THREE.SphereGeometry(1, 72, 48);
{
  const p = bagGeo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const w =
      1 +
      0.035 * Math.sin(x * 9 + y * 4) * Math.sin(z * 7 - y * 5) +
      0.02 * Math.sin(x * 23 + z * 17);
    const seam = 1 - 0.03 * Math.exp(-((z * 14) ** 2)); // stitched seam around the middle
    p.setXYZ(i, x * w * seam, y * w * seam, z * w * seam);
  }
  bagGeo.computeVertexNormals();
}
const bag = add(S1, bagGeo, real.fabric(0xf1efe9, { sheen: 0.6 }), 0, 0, 0);
const BAG_FULL = V(-0.34, 1.38, 0);
const BAG_R = V(0.27, 0.3, 0.34);
const bagW = V(0, 0, 0);
function setBag(k, def) {
  bag.visible = k > 0.01;
  const s = 1 - 0.42 * def;
  bag.position.copy(MOD).lerp(BAG_FULL, k);
  bag.position.y -= 0.12 * def;
  bag.position.x -= 0.08 * def;
  bag.scale.set(
    Math.max(0.001, BAG_R.x * k * (1 - 0.3 * def)),
    Math.max(0.001, BAG_R.y * k * s),
    Math.max(0.001, BAG_R.z * k * s),
  );
  lid.rotation.z = 2.3 * smooth(clamp01(k * 4));
  bag.getWorldPosition(bagW);
}

// ---------------------------------------------------------------- belt (left sled)
const S0 = sleds[0].g;
const D0 = sleds[0].dummy;
const NB = 64;
const beltGeo = new THREE.BufferGeometry();
beltGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(NB * 2 * 3), 3));
{
  const idx = [];
  for (let i = 0; i < NB - 1; i++) {
    const a = i * 2;
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  beltGeo.setIndex(idx);
}
const belt = add(scene, beltGeo, beltMat, 0, 0, 0);
belt.frustumCulled = false;
add(S0, roundedBox(0.07, 0.04, 0.05, 0.012), chrome, 0.0, 0.83, 0.26);
add(S0, roundedBox(0.06, 0.12, 0.05, 0.015), real.plastic(0x1b1c1f), 0.03, 0.75, 0.27);
add(S0, roundedBox(0.06, 0.1, 0.05, 0.015), real.plastic(0x1b1c1f), 0.47, 1.45, -0.46); // retractor guide
const tmpA = V(0, 0, 0);
const fwdT = V(0, 0, 0);
const qT = new THREE.Quaternion();
function updateBelt() {
  S0.updateMatrixWorld(true);
  const w = (obj, x, y, z) => obj.localToWorld(V(x, y, z));
  const pts = [
    w(S0, 0.46, 1.42, -0.44),
    w(D0.torso, 0.06, 0.47, -0.16),
    w(D0.torso, -0.135, 0.33, -0.05),
    w(D0.torso, -0.14, 0.15, 0.1),
    w(S0, 0.0, 0.83, 0.25),
    w(D0.root, -0.15, 0.02, 0.1),
    w(D0.root, -0.15, 0.02, -0.12),
    w(S0, 0.1, 0.72, -0.31),
  ];
  const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
  D0.torso.getWorldQuaternion(qT);
  fwdT.set(-1, 0, 0).applyQuaternion(qT);
  const pos = beltGeo.attributes.position;
  for (let i = 0; i < NB; i++) {
    const u = i / (NB - 1);
    const p = curve.getPointAt(u);
    const tg = curve.getTangentAt(u);
    const f = u < 0.55 ? fwdT : tmpA.set(-1, 0, 0);
    const side = tg.clone().cross(f).normalize().multiplyScalar(0.026);
    pos.setXYZ(i * 2, p.x + side.x, p.y + side.y, p.z + side.z);
    pos.setXYZ(i * 2 + 1, p.x - side.x, p.y - side.y, p.z - side.z);
  }
  pos.needsUpdate = true;
  beltGeo.computeVertexNormals();
  beltGeo.computeBoundingSphere();
}
// force arrows: the belt holds pelvis and chest back
const holdArrows = makeArrowSet(
  [
    [V(-0.62, 0.86, 0.0), V(-0.22, 0.86, 0.0)],
    [V(-0.72, 1.24, 0.0), V(-0.3, 1.24, 0.0)],
  ],
  { parent: S0, mat: forceMat, amp: 0, r: 0.03 },
);

// ---------------------------------------------------------------- drop-tower dummy
const drop = makeDummy();
const dropG = new THREE.Group();
scene.add(dropG);
dropG.add(drop.root);
const hoistMat = real.metal(0x2b2d31, { roughness: 0.3 });
const cable = add(scene, new THREE.CylinderGeometry(0.008, 0.008, 1, 8), hoistMat, 0, 0, 0, false);
const DROP_X = TOWER.x;
const DROP_Z = TOWER.z + 2.6;

// ---------------------------------------------------------------- crash state
function segAt(t) {
  let s = CRASH[0];
  for (const c of CRASH) if (t >= c.from) s = c;
  return s;
}
function sledState(t, i) {
  const s = segAt(t);
  const imp = s.imp[i];
  if (imp == null) return { x: 0, p: null };
  const p = (t - imp) / s.D[i];
  if (p < 0) return { x: (imp - t) * s.V, p: null };
  return { x: 0.05 * bump(p, 0, 0.08, 0.35), p: Math.min(1, p), imp };
}
function bagState(t, st) {
  if (st.p != null) return [smooth(ramp(st.p, 0.05, 0.3)), smooth(ramp(st.p, 0.45, 1))];
  for (const b of BAG_TESTS)
    if (t >= b.at && t < b.until) {
      const q = (t - b.at) / b.D;
      return [smooth(ramp(q, 0.05, 0.3)), smooth(ramp(q, 0.45, 1)) * 0.7];
    }
  return [0, 0];
}

const applyCamera = shotCamera(shots, 1);
const wp = V(0, 0, 0);

// ---------------------------------------------------------------- render
function renderAt(t) {
  for (let i = 0; i < 2; i++) {
    const st = sledState(t, i);
    const sl = sleds[i];
    sl.g.position.x = st.x;
    if (st.p == null) pose(sl.dummy, restPose);
    else pose(sl.dummy, i === 0 ? beltedPose(st.p) : unbeltedPose(st.p));
    if (i === 1) {
      const [k, def] = bagState(t, st);
      setBag(k, def);
      // white powder that comes out with the bag
      const start =
        st.p != null
          ? st.imp + 0.05 * segAt(t).D[1]
          : BAG_TESTS.find((b) => t >= b.at && t < b.until)?.at;
      if (start != null) {
        S1.localToWorld(wp.copy(BAG_FULL));
        puff("bag" + Math.round(start * 100), t, start + 0.04, wp.x, wp.y, wp.z, 0.55);
      }
    }
    if (st.p != null && st.p < 0.2 && st.x < 0.1 && i === 0) {
      S0.localToWorld(wp.set(-1.5, 0.3, 0));
      puff("nose" + Math.round(st.imp * 100), t, st.imp, wp.x, wp.y, wp.z, 0.7);
    }
  }
  updateBelt();
  for (const sp of signs) sp.visible = t >= T.was; // keep the hook title clear
  srsMat.emissiveIntensity = 0.25 + 0.5 * pop(t, T.srs, T.duell2);

  // force arrows while the belt catches the dummy
  animateArrows(holdArrows, t, pop(t, T.becken, T.fakt));

  // drop tower: hangs on the hoist, falls on "Sturz", lands on "Stock"
  const tLand = T.stock + 0.15;
  const u = clamp01((t - T.sturz) / (tLand - T.sturz));
  const y = t < T.sturz ? 10.35 : 10.35 - 10.25 * u * u;
  dropG.rotation.y = 0.6;
  const landed = t >= tLand;
  pose(
    drop,
    landed
      ? {
          pitch: 0.45 * smooth(ramp(t, tLand, tLand + 0.4)),
          headR: 0.4 * bump(t - tLand, 0, 0.12, 0.6),
          arm: 0.8,
        }
      : { arm: t >= T.sturz ? 1.6 : 0.3, headR: -0.2 },
  );
  // pose() puts the hip at y 0.82 inside the group: shift the group
  const hipY = landed ? 0.1 + 0.36 - 0.05 * bump(t - tLand, 0, 0.06, 0.3) : Math.max(0.46, y);
  dropG.position.set(DROP_X, hipY - 0.82, DROP_Z);
  cable.visible = t < T.sturz;
  cable.position.set(DROP_X, (12.7 + 10.9) / 2, DROP_Z);
  cable.scale.y = 12.7 - 10.9;
  puff("land", t, tLand, DROP_X, 0.2, DROP_Z, 1.3);

  // device displays (one layer at a time)
  viewfinder(t >= T.stell && t < T.fliegst1 ? 1 : 0, {
    label: "CAM 2 · 1000 FPS",
    time: `00:00:${String(Math.max(0, Math.floor((t - T.stell) * 1000)) % 100000).padStart(5, "0")}`,
  });
  const g = pop(t, T.mit, T.gurtQ);
  if (g > 0)
    gauge("bag", g, {
      label: "AIRBAG",
      value: 290 * smooth(ramp(t, T.mit, T.k300 + 0.2)),
      max: 320,
      unit: "km/h",
      x: 560,
      y: 330,
      color: "#ffd23f",
    });
  if (t >= T.gewinnt && t < T.cta + 1.6)
    showPanel(pop(t, T.gewinnt, T.cta + 1.6), "SIEGER", "GURT", LED.green);
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  // the drop-tower shot tilts with the falling dummy
  if (t >= T.fliegst1 && t < T.zwei) {
    camera.lookAt(DROP_X, dropG.position.y + 0.82 + 0.25, DROP_Z);
    camera.updateMatrixWorld();
  }
  renderFrame();
}
start(renderAt);
