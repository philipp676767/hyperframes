// Scene of #29 "Blitz ins Auto" (format B): you sit in a parked car on a
// country road in a thunderstorm and the lightning hits your roof. The
// current wants into the ground — straight through you? No: it runs over
// the sheet metal around you and jumps the tyres into the wet road (the
// Faraday cage). Analogy sets: the bolt next to the sun (VS), the roofless
// convertible (CAB), the plane above the clouds (PL).
import {
  THREE,
  ramp,
  smooth,
  pop,
  V,
  rng,
  scene,
  flat,
  M,
  xrayMaterial,
  xrayEdges,
  setXray,
  edgeMat,
  showNope,
  makeArrowSet,
  animateArrows,
  forceMat,
  labels,
  puff,
  highlights,
  shotCamera,
  renderFrame,
  start,
  clamp01,
} from "./world.js";
import { storm, CAB, OAK } from "./set.js";
import { cloudPuffs } from "./environments.js";
import { createHand } from "./hand.js";
import { readout } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS, STRIKES, HOLDS } from "./beats.js";

highlights(HIGHLIGHTS);

const VS = [0, 46, 30]; // bolt vs. sun, high above the storm
const PL = [-34, 38, -10]; // the airliner above the cloud deck
const REL = { VS: V(...VS), CAB: V(...CAB), PL: V(...PL) };

const bar = (parent, a, b, r, mat) => {
  const d = b.clone().sub(a);
  const m = new THREE.Mesh(new THREE.BoxGeometry(r, d.length(), r), mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
  m.castShadow = true;
  parent.add(m);
  return m;
};
const extrude = (pts, depth, mat, bevel = 0.05) => {
  const s = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  const g = new THREE.ExtrudeGeometry(s, {
    depth,
    bevelEnabled: bevel > 0,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelSegments: 2,
    curveSegments: 6,
  });
  g.translate(0, 0, -depth / 2);
  const m = new THREE.Mesh(g, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
};

// ---------------------------------------------------------------- the car
// front = +x, driver on the left (−z), wheels at x ±1.3, roof at y ≈ 1.55
function makeCar({ color, roof = true, interior = true }) {
  const g = new THREE.Group();
  const bodyMat = xrayMaterial(color, { roughness: 0.2, metalness: 0.3 });
  const dark = flat(0x1e2028, { roughness: 0.5 });
  const trim = flat(0x2a2d36, { roughness: 0.4, metalness: 0.4 });
  const edges = [];
  const shell = (m) => {
    g.add(m);
    const e = xrayEdges(m.geometry);
    e.position.copy(m.position);
    e.quaternion.copy(m.quaternion);
    g.add(e);
    edges.push(e);
    return m;
  };
  // lower body (side profile, extruded across the width)
  shell(
    extrude(
      [
        [-2.02, 0.3],
        [2.0, 0.3],
        [2.12, 0.42],
        [2.12, 0.7],
        [1.95, 0.86],
        [0.95, 0.97],
        [0.9, 0.55],
        [-1.6, 0.55],
        [-1.65, 0.98],
        [-2.02, 0.92],
        [-2.12, 0.72],
        [-2.12, 0.42],
      ],
      1.66,
      bodyMat,
    ),
  );
  // door panels: the cabin is an open tub between hood and boot
  for (const sz of [-1, 1]) {
    const d = new THREE.Mesh(new THREE.BoxGeometry(2.62, 0.46, 0.07), bodyMat);
    d.position.set(-0.35, 0.76, sz * 0.84);
    d.castShadow = true;
    shell(d);
  }
  // glass greenhouse (windows) — see-through so you see who sits inside
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x8fb6e0,
    roughness: 0.04,
    metalness: 0.2,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
  });
  if (roof) {
    const glass = extrude(
      [
        [0.92, 0.98],
        [0.14, 1.47],
        [-1.12, 1.49],
        [-1.72, 0.99],
      ],
      1.5,
      glassMat,
      0.02,
    );
    glass.castShadow = false;
    g.add(glass);
    // roof panel + pillars (sheet metal = part of the shell)
    shell(
      extrude(
        [
          [0.2, 1.46],
          [0.12, 1.53],
          [-1.15, 1.55],
          [-1.22, 1.48],
        ],
        1.58,
        bodyMat,
        0.03,
      ),
    );
    for (const s of [-1, 1]) {
      const z = s * 0.77;
      bar(g, V(0.93, 0.98, z), V(0.14, 1.5, z), 0.07, bodyMat);
      bar(g, V(-0.42, 0.98, z), V(-0.42, 1.52, z), 0.09, bodyMat);
      bar(g, V(-1.72, 0.99, z), V(-1.14, 1.52, z), 0.11, bodyMat);
    }
  } else {
    // convertible: only the windscreen frame
    const ws = extrude(
      [
        [0.92, 0.98],
        [0.62, 1.3],
        [0.55, 1.3],
        [0.85, 0.98],
      ],
      1.5,
      glassMat,
      0.01,
    );
    g.add(ws);
    bar(g, V(0.92, 0.98, 0.76), V(0.6, 1.32, 0.76), 0.05, bodyMat);
    bar(g, V(0.92, 0.98, -0.76), V(0.6, 1.32, -0.76), 0.05, bodyMat);
    bar(g, V(0.6, 1.32, -0.76), V(0.6, 1.32, 0.76), 0.05, bodyMat);
  }
  // bumpers, grille, sills, mirrors
  const bump = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 1.7), trim);
  bump.position.set(2.14, 0.4, 0);
  g.add(bump);
  const bump2 = bump.clone();
  bump2.position.x = -2.14;
  g.add(bump2);
  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.7), dark);
  grille.position.set(2.15, 0.6, 0);
  g.add(grille);
  for (const s of [-1, 1]) {
    const sill = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.1, 0.06), trim);
    sill.position.set(0, 0.34, s * 0.9);
    g.add(sill);
    const mir = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.2), bodyMat);
    mir.position.set(0.8, 1.06, s * 0.97);
    g.add(mir);
  }
  // wheels
  const wheels = [];
  const tyreGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.28, 16);
  tyreGeo.rotateX(Math.PI / 2);
  const rimGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.3, 10);
  rimGeo.rotateX(Math.PI / 2);
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xd8dde4,
    metalness: 0.85,
    roughness: 0.25,
  });
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const w = new THREE.Group();
      const ty = new THREE.Mesh(tyreGeo, M.rubber);
      ty.castShadow = true;
      w.add(ty);
      w.add(new THREE.Mesh(rimGeo, rimMat));
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.018, 4, 18), flat(0x55585f));
      ring.position.z = 0.145 * sz;
      w.add(ring);
      w.position.set(sx * 1.3, 0.36, sz * 0.8);
      g.add(w);
      wheels.push(w);
    }
  // lights
  const headMat = flat(0xfff6dc, { emissive: 0xfff0c8, emissiveIntensity: 2.2 });
  const tailMat = flat(0xff3a2a, { emissive: 0xff2010, emissiveIntensity: 1.6 });
  for (const s of [-1, 1]) {
    const h = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.34), headMat);
    h.position.set(2.12, 0.66, s * 0.58);
    g.add(h);
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.3), tailMat);
    tl.position.set(-2.12, 0.72, s * 0.6);
    g.add(tl);
  }
  const car = { g, bodyMat, glassMat, edges, wheels, headMat, tailMat };
  if (!interior) return car;

  // ---- interior: dashboard, wheel, radio, seats, the driver (you)
  const dash = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.2, 1.5), flat(0x2b2e38));
  dash.position.set(0.74, 0.96, 0);
  g.add(dash);
  const cluster = new THREE.Mesh(
    new THREE.PlaneGeometry(0.2, 0.065),
    new THREE.MeshBasicMaterial({ color: 0xffa646, toneMapped: false }),
  );
  cluster.rotation.y = -Math.PI / 2;
  cluster.rotation.x = 0;
  cluster.position.set(0.555, 1.075, -0.38);
  g.add(cluster);
  // radio screen with a canvas: station text, static, black
  const rc = document.createElement("canvas");
  rc.width = 256;
  rc.height = 128;
  const rtex = new THREE.CanvasTexture(rc);
  rtex.colorSpace = THREE.SRGBColorSpace;
  const radioMat = new THREE.MeshBasicMaterial({ map: rtex, toneMapped: false });
  const radio = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.15), radioMat);
  radio.rotation.y = -Math.PI / 2;
  radio.position.set(0.555, 1.0, 0.0);
  g.add(radio);
  const wheel = new THREE.Group();
  wheel.add(new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.025, 6, 20), flat(0x22242c)));
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 8), flat(0x33363f));
  hub.rotation.x = Math.PI / 2;
  wheel.add(hub);
  for (const a of [0, 2.2, -2.2]) {
    const sp = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.17, 0.02), flat(0x22242c));
    sp.position.set(Math.sin(a) * 0.085, -Math.cos(a) * 0.085, 0);
    sp.rotation.z = a;
    wheel.add(sp);
  }
  wheel.position.set(0.44, 1.07, -0.38);
  wheel.rotation.y = -Math.PI / 2;
  wheel.rotateX(-0.45);
  g.add(wheel);
  const seatMat = flat(0x3a3d48);
  for (const s of [-1, 1]) {
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.46), seatMat);
    base.position.set(-0.3, 0.68, s * 0.38);
    g.add(base);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.62, 0.46), seatMat);
    back.position.set(-0.6, 1.0, s * 0.38);
    back.rotation.z = 0.18;
    g.add(back);
  }
  // you: a toy driver in the same blue hoodie as the hand
  const you = new THREE.Group();
  const hoodie = flat(0x4a7bd6, { emissive: 0x3dff7a, emissiveIntensity: 0 });
  const skin = flat(0xf1c09a, { emissive: 0x3dff7a, emissiveIntensity: 0 });
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.42, 0.34), hoodie);
  torso.position.set(-0.42, 0.96, 0);
  torso.rotation.z = 0.15;
  you.add(torso);
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.13, 1), skin);
  head.position.set(-0.4, 1.3, 0);
  you.add(head);
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.135, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2),
    flat(0x4a2e1e),
  );
  hair.position.set(-0.42, 1.32, 0);
  hair.rotation.z = 0.3;
  you.add(hair);
  for (const s of [-1, 1]) {
    bar(you, V(-0.38, 1.1, s * 0.15), V(0.4, 1.12, s * 0.15), 0.08, hoodie);
    const fist = new THREE.Mesh(new THREE.IcosahedronGeometry(0.045, 0), skin);
    fist.position.set(0.42, 1.12, s * 0.15);
    you.add(fist);
  }
  you.position.z = -0.38;
  g.add(you);
  // headlight beams (soft cones in the rain) + real spot lights
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xfff0c8,
    transparent: true,
    opacity: 0.08,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const beams = [];
  const spots = [];
  for (const s of [-1, 1]) {
    const cg = new THREE.ConeGeometry(1.4, 9, 16, 1, true);
    cg.translate(0, -4.5, 0);
    cg.rotateZ(Math.PI / 2);
    const b = new THREE.Mesh(cg, beamMat);
    b.position.set(2.15, 0.66, s * 0.58);
    b.rotation.z = -0.08;
    b.userData.noAO = true;
    g.add(b);
    beams.push(b);
    const sp = new THREE.SpotLight(0xfff0d0, 22, 22, 0.42, 0.5, 1.2);
    sp.position.set(2.15, 0.66, s * 0.58);
    sp.target.position.set(9, 0, s * 0.58);
    g.add(sp);
    g.add(sp.target);
    spots.push(sp);
  }
  // wipers
  const wipers = [];
  for (const z of [-0.5, 0.15]) {
    const pv = new THREE.Group();
    pv.position.set(0.9, 1.0, z);
    // lies on the windscreen slope
    pv.rotation.z = 0.56;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.025, 0.55), flat(0x15161b));
    arm.position.z = 0.27;
    pv.add(arm);
    g.add(pv);
    wipers.push(pv);
  }
  return Object.assign(car, {
    rc,
    rtex,
    radioMat,
    cluster,
    you,
    hoodie,
    skin,
    beams,
    beamMat,
    spots,
    wipers,
    head,
    hair,
    torso,
  });
}

const car = makeCar({ color: 0xe8412f });
scene.add(car.g);

// ---------------------------------------------------------------- lightning
// A jagged bolt: core (white, unlit) + glow (blue, additive) + a few
// branches. Revealed top-down by drawRange (the leader), k = brightness.
const coreMat = () =>
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
    toneMapped: false,
    transparent: true,
    depthWrite: false,
  });
const glowMat = () =>
  new THREE.MeshBasicMaterial({
    color: 0xa8c0ff,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
function jag(a, b, n, amp, r) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    const p = a.clone().lerp(b, k);
    if (i > 0 && i < n) {
      const s = amp * (0.4 + 0.6 * Math.sin(k * Math.PI));
      p.x += (r() - 0.5) * s;
      p.z += (r() - 0.5) * s;
      p.y += (r() - 0.5) * s * 0.3;
    }
    pts.push(p);
  }
  return pts;
}
function makeBolt(from, to, { seed = 1, size = 1, branches = 3, n = 26 } = {}) {
  const r = rng(seed);
  const a = V(...from);
  const b = V(...to);
  const g = new THREE.Group();
  const cm = coreMat();
  const gm = glowMat();
  const parts = [];
  const tube = (pts, rad, startK) => {
    const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.05);
    const segs = pts.length * 3;
    const core = new THREE.Mesh(new THREE.TubeGeometry(curve, segs, rad * size, 5), cm);
    const glow = new THREE.Mesh(new THREE.TubeGeometry(curve, segs, rad * size * 5, 6), gm);
    for (const m of [core, glow]) {
      m.frustumCulled = false;
      m.userData.noAO = true;
      g.add(m);
    }
    parts.push({ core, glow, segs, startK });
  };
  const main = jag(a, b, n, a.distanceTo(b) * 0.09, r);
  tube(main, 0.085, 0);
  for (let i = 0; i < branches; i++) {
    const j = 3 + Math.floor(r() * (n * 0.6));
    const p = main[j];
    const dir = b.clone().sub(a).normalize();
    const side = V(r() - 0.5, 0, r() - 0.5).normalize();
    const end = p
      .clone()
      .addScaledVector(dir, a.distanceTo(b) * (0.12 + r() * 0.15))
      .addScaledVector(side, a.distanceTo(b) * (0.1 + r() * 0.12));
    tube(jag(p, end, 8, a.distanceTo(b) * 0.04, r), 0.025, j / n);
  }
  // impact glow where it lands
  const hitMat = new THREE.MeshBasicMaterial({
    color: 0xe8eeff,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
  const hit = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 8), hitMat);
  hit.position.copy(b);
  g.add(hit);
  g.visible = false;
  scene.add(g);
  return {
    g,
    end: b,
    set(reveal, k) {
      g.visible = k > 0.003;
      if (!g.visible) return;
      for (const p of parts) {
        const rr = clamp01((reveal - p.startK) / Math.max(0.05, 1 - p.startK));
        const cnt = Math.ceil(rr * p.segs) * 5 * 6;
        p.core.geometry.setDrawRange(0, cnt);
        p.glow.geometry.setDrawRange(0, Math.ceil(rr * p.segs) * 6 * 6);
      }
      cm.opacity = Math.min(1, k * 1.3);
      gm.opacity = 0.6 * Math.min(1, k);
      hit.visible = reveal >= 1;
      hit.scale.setScalar(size * (0.25 + 0.4 * k));
      hitMat.opacity = 0.75 * k;
    },
  };
}
const ROOF_HIT = [-0.25, 1.56, 0.05];
const BOLTS = {
  roof: makeBolt([7, 24, -7], ROOF_HIT, { seed: 3, branches: 4 }),
  oak: makeBolt([18, 24, -16], [OAK[0], 6.6, OAK[2]], { seed: 5, branches: 3 }),
  cabrio: makeBolt([CAB[0] + 4, 22, CAB[2] - 5], [CAB[0] - 0.3, 0.75, CAB[2]], {
    seed: 7,
    branches: 3,
  }),
  plane: makeBolt([PL[0] + 6, PL[1] - 12, PL[2] + 3], [PL[0] + 2.9, PL[1] - 0.1, PL[2]], {
    seed: 9,
    branches: 2,
    n: 16,
  }),
  plane2: makeBolt([PL[0] - 2.8, PL[1] + 0.6, PL[2]], [PL[0] - 9, PL[1] - 13, PL[2] - 3], {
    seed: 10,
    branches: 2,
    n: 16,
  }),
  far1: makeBolt([-30, 24, -42], [-30, 0, -42], { seed: 11, size: 2.2, branches: 3 }),
  far2: makeBolt([28, 24, -46], [26, 2, -46], { seed: 13, size: 2.2, branches: 3 }),
  vs: makeBolt([VS[0] + 1.9, VS[1] + 4.6, VS[2]], [VS[0] + 1.3, VS[1] - 4.6, VS[2]], {
    seed: 15,
    branches: 3,
    n: 18,
  }),
  // the small arc jumping from the sill over the tyre into the wet road
  arc: makeBolt([1.3, 0.32, 0.93], [1.5, 0.02, 1.22], { seed: 17, size: 0.55, branches: 2, n: 8 }),
};
const strikeLight = new THREE.PointLight(0xdfe6ff, 0, 18, 1.4);
scene.add(strikeLight);

// leader 0.08 s, then the main stroke and two return strokes
function strike(t, at) {
  const d = t - at;
  if (d < -0.08 || d > 0.8) return null;
  const reveal = clamp01((d + 0.08) / 0.08);
  if (d < 0) return { reveal, k: 0.35 };
  const p = (x) => (x < 0 ? 0 : Math.exp(-x * 15));
  const k = Math.min(1, Math.exp(-d * 8) + 0.9 * p(d - 0.15) + 0.65 * p(d - 0.32));
  return { reveal: 1, k };
}
// held ("frozen") bolt while the voice explains: bright, crackling
const flick = (t) =>
  0.62 + 0.22 * Math.sin(t * 37) * Math.sin(t * 11.3) + 0.16 * Math.sin(t * 73.1);

// ---------------------------------------------------------------- current
// Folge 2: the path the current WANTS — straight down through you
const throughMat = forceMat.clone();
throughMat.depthTest = false;
const through = makeArrowSet([[V(-0.4, 2.6, -0.38), V(-0.4, -0.25, -0.38)]], {
  amp: 0,
  r: 0.045,
  mat: throughMat,
});
through.forEach((a) => (a.renderOrder = 20));
// Folge 3: the real path — over the metal, around you, down to each wheel
const PATHS = [];
for (const sx of [1, -1])
  for (const sz of [1, -1]) {
    const z = sz;
    PATHS.push([
      V(ROOF_HIT[0], 1.58, ROOF_HIT[2]),
      V(sx > 0 ? 0.12 : -1.12, 1.56, z * 0.6),
      V(sx > 0 ? 0.16 : -1.15, 1.52, z * 0.8),
      V(sx > 0 ? 0.92 : -1.72, 1.0, z * 0.8),
      V(sx * 1.3, 0.85, z * 0.88),
      V(sx * 1.3, 0.5, z * 0.92),
      V(sx * 1.3, 0.3, z * 0.95),
      V(sx * 1.3 + 0.1, 0.03, z * 1.1),
    ]);
  }
const flowMat = new THREE.MeshBasicMaterial({
  color: 0xffe36a,
  transparent: true,
  opacity: 0,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  toneMapped: false,
});
const beadMat = new THREE.MeshBasicMaterial({ color: 0xfff6c0, toneMapped: false });
const curves = PATHS.map((pts) => new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.1));
for (const c of curves) {
  const m = new THREE.Mesh(new THREE.TubeGeometry(c, 60, 0.03, 5), flowMat);
  m.userData.noAO = true;
  scene.add(m);
}
const NB = 16;
const beads = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.045, 0),
  beadMat,
  curves.length * NB,
);
beads.userData.noAO = true;
beads.frustumCulled = false;
scene.add(beads);
const tmpO = new THREE.Object3D();

// ---------------------------------------------------------------- analogy: bolt vs sun
const vs = new THREE.Group();
vs.position.set(...VS);
scene.add(vs);
const sunMat = new THREE.MeshBasicMaterial({ color: 0xffa23a, toneMapped: false });
const sun = new THREE.Mesh(new THREE.IcosahedronGeometry(1.25, 2), sunMat);
sun.position.set(-1.5, 0.6, 0);
vs.add(sun);
const halo = new THREE.Mesh(
  new THREE.SphereGeometry(1.8, 20, 14),
  new THREE.MeshBasicMaterial({
    color: 0xffb050,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }),
);
halo.position.copy(sun.position);
vs.add(halo);

// ---------------------------------------------------------------- analogy: convertible
const cab = makeCar({ color: 0x2f9bff, roof: false, interior: false });
cab.g.position.set(...CAB);
cab.g.rotation.y = 0.5;
scene.add(cab.g);
{
  // muddy lane under it
  const mud = new THREE.Mesh(
    new THREE.CircleGeometry(4.5, 14).rotateX(-Math.PI / 2),
    flat(0x4a3a2c, { roughness: 0.3 }),
  );
  mud.position.set(CAB[0], 0.04, CAB[2]);
  scene.add(mud);
  const seatMat = flat(0x3a3d48);
  for (const s of [-1, 1]) {
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.46), seatMat);
    base.position.set(-0.3, 0.68, s * 0.38);
    cab.g.add(base);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.62, 0.46), seatMat);
    back.position.set(-0.6, 1.0, s * 0.38);
    back.rotation.z = 0.18;
    cab.g.add(back);
  }
}

// ---------------------------------------------------------------- analogy: airliner above the clouds
const plane = new THREE.Group();
plane.position.set(...PL);
scene.add(plane);
{
  const white = flat(0xf2f4f8, { roughness: 0.35, metalness: 0.2 });
  const blue = flat(0x2f6fd6, { roughness: 0.4 });
  const fus = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.45, 5.0, 16).rotateZ(Math.PI / 2),
    white,
  );
  plane.add(fus);
  const nose = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2).rotateZ(-Math.PI / 2),
    white,
  );
  nose.scale.set(1.5, 1, 1);
  nose.position.x = 2.5;
  plane.add(nose);
  const tailc = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.4, 16).rotateZ(Math.PI / 2), white);
  tailc.position.x = -3.2;
  plane.add(tailc);
  const stripe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.455, 0.455, 4.6, 16, 1, true, -0.5, 1.0).rotateZ(Math.PI / 2),
    blue,
  );
  plane.add(stripe);
  const wing = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 5.6), white);
  wing.position.set(0.1, -0.15, 0);
  wing.rotation.y = 0.25;
  plane.add(wing);
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, 0.08), blue);
  fin.position.set(-3.1, 0.75, 0);
  fin.rotation.z = -0.4;
  plane.add(fin);
  const stab = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.06, 2.0), white);
  stab.position.set(-3.2, 0.1, 0);
  plane.add(stab);
  for (const s of [-1, 1]) {
    const eng = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.22, 0.7, 10).rotateZ(Math.PI / 2),
      flat(0xb9c0cc, { metalness: 0.5 }),
    );
    eng.position.set(0.5, -0.42, s * 1.4);
    plane.add(eng);
  }
  const winMat = flat(0xfff1c8, { emissive: 0xffd27a, emissiveIntensity: 1.4 });
  for (let i = 0; i < 14; i++)
    for (const s of [-1, 1]) {
      const w = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.02), winMat);
      w.position.set(1.8 - i * 0.3, 0.12, s * 0.45);
      plane.add(w);
    }
  plane.traverse((o) => o.isMesh && (o.castShadow = true));
  // a few cloud tops right under the plane
  const cm = new THREE.MeshStandardMaterial({
    color: 0x5a6080,
    emissive: 0x9aa8ff,
    emissiveIntensity: 0.2,
    roughness: 1,
    flatShading: true,
  });
  for (let i = 0; i < 5; i++) {
    const c = new THREE.Group();
    c.position.set(-8 + i * 4, -9 - (i % 2), -4 + (i % 3) * 3);
    cloudPuffs(c, 4, 3.5, cm, 80 + i);
    plane.add(c);
  }
  plane.userData.cm = cm;
}
// current along the fuselage when it's hit
const planeFlow = new THREE.Mesh(
  new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([V(2.9, 0, 0), V(0, 0.48, 0), V(-2.8, 0.6, 0)]),
    30,
    0.05,
    5,
  ),
  flowMat.clone(),
);
plane.add(planeFlow);

// ---------------------------------------------------------------- the hand (POV shots)
const hand = createHand({ scale: 0.45 });
const POV = [[T.du1, T.es]];
const inPOV = (t) => POV.some(([a, b]) => t >= a && t < b);

// camera shots: resolve rel = "VS" / "CAB" / "PL"
const applyCamera = shotCamera(
  shots.map((s) => {
    if (!s.rel) return s;
    const r = REL[s.rel];
    if (s.orbit) {
      const o = s.orbit;
      return {
        ...s,
        rel: undefined,
        orbit: { ...o, c: [o.c[0] + r.x, o.c[1] + r.y, o.c[2] + r.z], y: o.y + r.y },
      };
    }
    return { ...s, rel: r };
  }),
);
const LBL = LABELS.map((l) => (l.rel ? { ...l, pos: V(...l.pos).add(REL[l.rel]) } : l));

// radio screen
let radioKey = "";
function drawRadio(mode, t) {
  const key = mode === "static" ? `s${Math.floor(t * 20)}` : mode;
  if (key === radioKey) return;
  radioKey = key;
  const g = car.rc.getContext("2d");
  if (mode === "off") {
    g.fillStyle = "#050507";
    g.fillRect(0, 0, 256, 128);
  } else if (mode === "on") {
    g.fillStyle = "#0b1a2e";
    g.fillRect(0, 0, 256, 128);
    g.fillStyle = "#5fd0ff";
    g.font = '800 44px "Montserrat", sans-serif';
    g.textBaseline = "middle";
    g.fillText("FM 98,4", 22, 52);
    g.font = '800 22px "Montserrat", sans-serif';
    g.fillStyle = "#9fdcff";
    g.fillText("♪ Radio Donnerbach", 22, 98);
  } else {
    const r = rng(Math.floor(t * 20) + 1);
    g.fillStyle = "#0b1a2e";
    g.fillRect(0, 0, 256, 128);
    for (let i = 0; i < 70; i++) {
      g.fillStyle = r() < 0.5 ? "#9fdcff" : "#ffffff";
      g.fillRect(r() * 256, r() * 128, 4 + r() * 60, 2 + r() * 4);
    }
  }
  car.rtex.needsUpdate = true;
}

// ---------------------------------------------------------------- render
function renderAt(t) {
  // ---- lightning: strikes + held bolts
  let world = 0;
  let best = null;
  const lit = {};
  for (const s of STRIKES) {
    const e = strike(t, s.at);
    if (!e) continue;
    const w = s.soft ? 0.35 : s.bolt.startsWith("plane") ? 0.75 : 1;
    const prev = lit[s.bolt];
    if (!prev || e.k > prev.k) lit[s.bolt] = e;
    if (e.k * w > world) {
      world = e.k * w;
      best = s.bolt;
    }
  }
  if (lit.plane) lit.plane2 = lit.plane;
  const holdK = HOLDS.some(([a, b]) => t >= a && t < b) ? flick(t) : 0;
  if (holdK > 0 && !(lit.roof && lit.roof.k > holdK)) lit.roof = { reveal: 1, k: holdK };
  if (t >= T.der2 && t < T.und1) lit.vs = { reveal: 1, k: flick(t + 3) };
  if (t >= T.bisschen - 0.2 && t < T.fliesst - 0.08)
    lit.arc = { reveal: 1, k: flick(t * 1.7) * (Math.sin(t * 23) > -0.3 ? 1 : 0.2) };
  for (const [name, b] of Object.entries(BOLTS)) {
    const e = lit[name];
    b.set(e ? e.reveal : 0, e ? e.k : 0);
  }
  // sheet lightning inside the clouds: seeded blips + the "Gewitter" shot
  let sheet = 0;
  for (let i = 0; i < 26; i++) {
    const at = i * 2.31 + ((i * 7) % 5) * 0.37;
    const d = t - at;
    if (d > 0 && d < 0.5) sheet = Math.max(sheet, Math.exp(-d * 10) * (0.4 + ((i * 3) % 4) * 0.15));
  }
  for (const at of [T.gewitter + 0.25, T.gewitter + 0.75]) {
    const d = t - at;
    if (d > 0 && d < 0.6) sheet = Math.max(sheet, Math.exp(-d * 7));
  }
  storm.flash(Math.max(world, holdK * 0.3, lit.vs ? 0 : 0), sheet);
  // light at the strongest strike point (or the held roof bolt)
  const sb = best ? BOLTS[best] : holdK > 0 ? BOLTS.roof : null;
  if (sb) {
    strikeLight.position.copy(sb.end).add(V(0, 1.2, 0));
    strikeLight.intensity = 40 * Math.max(world, holdK * 0.8);
  } else strikeLight.intensity = 0;

  // ---- the car: lights die on "schwarz", come back on "retten" (payoff)
  const dead = t >= T.schwarz + 0.02 && t < T.retten3 + 0.1;
  const crackle = t >= T.knackt - 0.05 && t < T.schwarz ? (Math.sin(t * 90) > 0 ? 1 : 0.25) : 1;
  const lightsOn = dead ? 0 : crackle;
  car.headMat.emissiveIntensity = 2.2 * lightsOn;
  car.tailMat.emissiveIntensity = 1.6 * lightsOn;
  car.beamMat.opacity = 0.08 * lightsOn;
  car.spots.forEach((s) => (s.intensity = 22 * lightsOn));
  car.cluster.material.color.setHex(dead ? 0x050507 : crackle < 1 ? 0x7a4a1a : 0xffa646);
  drawRadio(dead ? "off" : t >= T.knackt - 0.05 ? "static" : "on", t);
  // wipers sweep while the engine runs
  const wa = dead ? 0 : 0.5 - 0.5 * Math.cos(t * 2.8);
  car.wipers.forEach((w) => (w.rotation.x = -wa * 1.3));
  // the tyre makes a fool of itself on "Witz"
  const fr = car.wheels[0];
  const wz = t - T.witz;
  if (wz > 0 && wz < 1.2) {
    const e = Math.sin(wz * 18) * Math.exp(-wz * 3.5);
    fr.scale.set(1 + e * 0.25, 1 - e * 0.35, 1 + e * 0.15);
  } else fr.scale.set(1, 1, 1);
  showNope(pop(t, T.witz + 0.05, T.kilometerweit - 0.12), 1.7, 0.55, 1.55, 0.4);
  // ✕ over the convertible on "Pech"
  if (t >= T.nur) showNope(pop(t, T.pech, T.nicht), CAB[0], CAB[1] + 1.7, CAB[2], 0.8);

  // the driver: hidden in POV (the camera is their head), glows green when safe
  const pov = inPOV(t);
  car.you.visible = !pov;
  const safe =
    smooth(ramp(t, T.fliesst + 0.6, T.fliesst + 1.2)) * (1 - ramp(t, T.nur - 0.1, T.nur));
  car.hoodie.emissiveIntensity = 0.5 * safe;
  car.skin.emissiveIntensity = 0.4 * safe;
  // the viewer's hand on the wheel; it clenches when the bolt hits
  if (pov) {
    const jolt = Math.max(strike(t, T.knallt - 0.04)?.k ?? 0, strike(t, T.knallt - 0.04)?.k ?? 0);
    hand.track(t, [
      { t: -1, pos: [0.3, 1.04, -0.12], rot: [0.9, Math.PI / 2, 0.4], pose: "grab" },
      { t: 60, pos: [0.3, 1.04, -0.12], rot: [0.9, Math.PI / 2, 0.4], pose: "grab" },
    ]);
    hand.group.position.y += jolt * 0.02;
    if (jolt > 0.3) hand.pose("fist");
  } else hand.track(t, [{ t: 100, pos: [0, -10, 0], rot: [0, 0, 0], pose: "open" }]);

  // ---- x-ray: light while the current wants through you, full while it
  // flows over the shell; the cage edges turn yellow on "Faradaysche"
  const x2 =
    0.55 *
    smooth(ramp(t, T.strom - 0.1, T.strom + 0.3)) *
    (1 - ramp(t, T.radio - 0.2, T.radio - 0.08));
  const x3 = smooth(ramp(t, T.fliesst - 0.1, T.fliesst + 0.35)) * (1 - ramp(t, T.nur - 0.1, T.nur));
  setXray([car.bodyMat], Math.max(x2, x3));
  edgeMat.color.setHex(t >= T.faraday && t < T.nur ? 0xffd23f : 0x9fdcff);
  if (t >= T.faraday && t < T.nur) edgeMat.opacity = 0.95;
  animateArrows(through, t, pop(t, T.strom, T.radio - 0.08));
  // flow beads
  const flowK = pop(t, T.fliesst + 0.15, T.nur, 0.3);
  flowMat.opacity = 0.55 * flowK;
  beads.visible = flowK > 0.01;
  if (beads.visible) {
    let i = 0;
    curves.forEach((c, ci) => {
      for (let j = 0; j < NB; j++) {
        const u = (j / NB + t * 0.55 + ci * 0.13) % 1;
        tmpO.position.copy(c.getPointAt(u));
        tmpO.scale.setScalar(flowK * (0.8 + 0.4 * Math.sin(u * 30 + t * 9)));
        tmpO.updateMatrix();
        beads.setMatrixAt(i++, tmpO.matrix);
      }
    });
    beads.instanceMatrix.needsUpdate = true;
  }
  // sparks where it jumps into the road (Gummi) and on the roof hit
  puff("arc", t, T.gummi, 1.45, 0.05, 1.15, 0.5, 0xfff1a0);
  puff("roofhit", t, T.dachStrike, ROOF_HIT[0], ROOF_HIT[1] + 0.05, ROOF_HIT[2], 0.9, 0xfff1a0);
  puff("radio", t, T.knackt + 0.1, 0.55, 1.0, 0.05, 0.25, 0xbfe6ff);
  puff("cab", t, T.cabrio + 0.95, CAB[0] - 0.3, 0.8, CAB[2], 1.0, 0xfff1a0);

  // ---- analogies
  vs.visible = t >= T.der2 - 0.5 && t < T.und1 + 0.5;
  sun.rotation.y = t * 0.3;
  halo.scale.setScalar(1 + 0.05 * Math.sin(t * 5));
  plane.visible = t >= T.fakt - 0.5 && t < T.cta;
  plane.position.y = PL[1] + Math.sin(t * 1.3) * 0.12;
  plane.rotation.z = Math.sin(t * 0.9) * 0.03;
  const pk = lit.plane ? lit.plane.k : 0;
  planeFlow.material.opacity = 0.9 * pk;
  plane.userData.cm.emissiveIntensity = 0.2 + 1.2 * pk + 0.5 * sheet;

  // ---- device displays
  if (t >= T.heisser && t < T.und1) {
    const k = pop(t, T.heisser, T.und1);
    readout("blitz", k, {
      label: "Blitz",
      value: "30.000",
      unit: "°C",
      x: 60,
      y: 1180,
      color: "#bcd0ff",
    });
    readout("sonne", pop(t, T.sonne, T.und1), {
      label: "Sonne außen",
      value: "5.500",
      unit: "°C",
      x: 580,
      y: 1180,
      color: "#ffa23a",
    });
  }
  if (t >= T.spannung && t < T.reifen2 - 0.18) {
    const n = Math.round(300 * smooth(ramp(t, T.hunderte, T.hunderte + 0.9)));
    readout("volt", pop(t, T.spannung, T.reifen2 - 0.18), {
      label: "Spannung",
      value: t < T.hunderte ? "???" : n,
      unit: "Mio. Volt",
      x: 60,
      y: 420,
    });
  }
  if (t >= T.einmal && t < T.cta) {
    readout("jahr", pop(t, T.einmal, T.cta), {
      label: "Blitztreffer pro Flugzeug",
      value: "1×",
      unit: "pro Jahr",
      x: 60,
      y: 1180,
    });
  }

  labels(t, LBL);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
