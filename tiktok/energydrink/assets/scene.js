// #51 Energydrinks (Format B): "Du kippst heute zehn Energydrinks. Wirst du
// wacher?" — one diorama (the WG desk at night, set.js); every Folge is a
// visible change in it: the can cracks open, the heart pops, the cape, the
// mailbox gets taped shut (caffeine hides the sleep signal), the bull → lab
// flask, the letters pile up and burst at 4 a.m., the beetle on the coffee
// plant.
import {
  THREE,
  ramp,
  smooth,
  inBack,
  outBack,
  pop,
  clamp01,
  lerp,
  rng,
  V,
  scene,
  flat,
  facet,
  facetMat,
  xrayMaterial,
  xrayEdges,
  setXray,
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
import "./set.js";
import { createHand } from "./hand.js";
import { gauge, counter } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS, MAILBOX, BULL, PYR, CLOCK, PLANT_LEAF } from "./beats.js";

highlights(HIGHLIGHTS);

const LIME = 0x9dff2e;
const mesh = (geo, mat, x = 0, y = 0, z = 0, parent = scene) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};

// ---------------------------------------------------------------- the hero can
// a big can on the desk at the origin: lime body, black band with a white
// bolt, alu top + bottom, pull tab. Body + band turn to x-ray glass for the
// caffeine beat.
const can = new THREE.Group();
scene.add(can);
const R = 0.78;
const bodyMat = xrayMaterial(LIME, {
  roughness: 0.25,
  metalness: 0.2,
  emissive: 0x4f9a00,
  emissiveIntensity: 0.35,
});
const bandMat = xrayMaterial(0x15151c, { roughness: 0.3, metalness: 0.3 });
const bodyGeo = new THREE.CylinderGeometry(R, R, 2.1, 40, 1, true);
mesh(bodyGeo, bodyMat, 0, 1.3, 0, can);
const bandGeo = new THREE.CylinderGeometry(R + 0.006, R + 0.006, 0.62, 40, 1, true);
mesh(bandGeo, bandMat, 0, 1.45, 0, can);
const canEdges = xrayEdges(bodyGeo);
canEdges.position.y = 1.3;
can.add(canEdges);
const alu = flat(0xd9dde6, { roughness: 0.2, metalness: 0.85 });
const lathe = (pts) =>
  new THREE.LatheGeometry(
    pts.map(([x, y]) => new THREE.Vector2(x, y)),
    40,
  );
mesh(
  lathe([
    [0.0, 0.02],
    [0.55, 0.0],
    [0.68, 0.06],
    [0.76, 0.18],
    [R, 0.25],
  ]),
  alu,
  0,
  0,
  0,
  can,
);
mesh(
  lathe([
    [R, 2.35],
    [0.72, 2.52],
    [0.62, 2.66],
    [0.63, 2.74],
    [0.58, 2.76],
    [0.0, 2.72],
  ]),
  alu,
  0,
  0,
  0,
  can,
);
// white lightning bolt on the band (front)
{
  const s = new THREE.Shape();
  s.moveTo(0.05, 0.3);
  s.lineTo(-0.16, -0.02);
  s.lineTo(-0.01, -0.02);
  s.lineTo(-0.08, -0.3);
  s.lineTo(0.17, 0.06);
  s.lineTo(0.02, 0.06);
  s.closePath();
  const bolt = mesh(
    new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: false }),
    flat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.25 }),
    0,
    1.45,
    R + 0.004,
    can,
  );
  bolt.userData.noAO = true;
}
// pull tab on a pivot at the lid centre; the opening appears when it lifts
const tabPivot = new THREE.Group();
tabPivot.position.set(0, 2.76, 0.05);
can.add(tabPivot);
mesh(
  new THREE.BoxGeometry(0.2, 0.025, 0.3),
  flat(0xeef1f6, { roughness: 0.25, metalness: 0.6, emissive: 0x666a72, emissiveIntensity: 0.4 }),
  0,
  0.015,
  0.12,
  tabPivot,
);
const hole = mesh(new THREE.CircleGeometry(0.15, 14), flat(0x0b0b10), 0, 2.745, 0.28, can);
hole.rotation.x = -Math.PI / 2;
hole.scale.set(1, 0.7, 1);
// liquid inside (visible only in x-ray) + caffeine molecules
const liquid = mesh(
  new THREE.CylinderGeometry(R - 0.06, R - 0.06, 1.7, 24),
  new THREE.MeshStandardMaterial({
    color: 0xd6ff6a,
    emissive: 0x6fb81a,
    emissiveIntensity: 0.4,
    transparent: true,
    opacity: 0.35,
    roughness: 0.2,
  }),
  0,
  1.15,
  0,
  can,
);
liquid.userData.noAO = true;
const NMOL = 26;
const molGeo = new THREE.IcosahedronGeometry(0.075, 0);
const molMat = flat(0xffe14a, { emissive: 0xffc400, emissiveIntensity: 1.2 });
const mols = new THREE.InstancedMesh(molGeo, molMat, NMOL);
mols.frustumCulled = false;
can.add(mols);
const molR = rng(5);
const molSeed = Array.from({ length: NMOL }, () => [molR(), molR(), molR()]);
// condensation drops on the body
{
  const r = rng(9);
  const g = new THREE.SphereGeometry(0.018, 6, 4);
  const m = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xbfe8ff,
    emissiveIntensity: 0.5,
    roughness: 0.05,
    transparent: true,
    opacity: 0.8,
  });
  for (let i = 0; i < 40; i++) {
    const a = r() * Math.PI * 2;
    const d = mesh(g, m, Math.sin(a) * (R + 0.01), 0.4 + r() * 1.9, Math.cos(a) * (R + 0.01), can);
    d.scale.y = 1.4;
    d.castShadow = false;
  }
}

// spray of fizz when the tab cracks (and again on "zischt")
const NSPRAY = 60;
const spray = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.05, 0),
  new THREE.MeshStandardMaterial({
    color: 0xeaffc4,
    emissive: 0xb6ff5a,
    emissiveIntensity: 0.9,
    roughness: 0.2,
  }),
  NSPRAY,
);
spray.userData.noAO = true;
spray.frustumCulled = false;
scene.add(spray);
const sprR = rng(17);
const sprSeed = Array.from({ length: NSPRAY }, () => [sprR(), sprR(), sprR(), sprR()]);
const m4 = new THREE.Matrix4();
const q = new THREE.Quaternion();
const sV = V(1, 1, 1);
const pV = V(0, 0, 0);
const hideM = new THREE.Matrix4().makeScale(0, 0, 0);
function burstSpray(t) {
  // two bursts: the hook (0.18) and "zischt"
  const bursts = [0.18, T.wirst - 0.15, T.zischt];
  let any = false;
  for (let i = 0; i < NSPRAY; i++) {
    const [a, b, c, d] = sprSeed[i];
    let set = false;
    for (const t0 of bursts) {
      const life = 1.0 + d * 0.5;
      const u = (t - t0 - a * 0.25) / life;
      if (u < 0 || u > 1) continue;
      const ang = b * Math.PI * 2;
      const sp = 1.2 + c * 1.8;
      const x = Math.cos(ang) * sp * 0.35 * u;
      const z = 0.28 + Math.sin(ang) * sp * 0.35 * u;
      const y = 2.8 + sp * u * 1.6 - 2.2 * u * u;
      pV.set(x, y, z);
      sV.setScalar((1 - u) * (0.6 + d));
      spray.setMatrixAt(i, m4.compose(pV, q, sV));
      set = any = true;
      break;
    }
    if (!set) spray.setMatrixAt(i, hideM);
  }
  spray.instanceMatrix.needsUpdate = true;
  spray.visible = any;
}

// ---------------------------------------------------------------- the heart
const heartShape = new THREE.Shape();
heartShape.moveTo(0, -0.55);
heartShape.bezierCurveTo(-0.15, -0.38, -0.62, -0.12, -0.62, 0.18);
heartShape.bezierCurveTo(-0.62, 0.48, -0.3, 0.6, 0, 0.36);
heartShape.bezierCurveTo(0.3, 0.6, 0.62, 0.48, 0.62, 0.18);
heartShape.bezierCurveTo(0.62, -0.12, 0.15, -0.38, 0, -0.55);
const heartMat = flat(0xff2d55, { emissive: 0xff1040, emissiveIntensity: 0.7, roughness: 0.3 });
const heart = mesh(
  new THREE.ExtrudeGeometry(heartShape, {
    depth: 0.22,
    bevelEnabled: true,
    bevelSize: 0.1,
    bevelThickness: 0.1,
    bevelSegments: 2,
    curveSegments: 10,
  }),
  heartMat,
  -1.5,
  3.4,
  0.2,
);
heart.geometry.center();
const heartLight = new THREE.PointLight(0xff2d55, 0, 5, 1.5);
heart.add(heartLight);
// pulse rings around the heart
const rings = [0, 1, 2].map(() => {
  const m = new THREE.Mesh(
    new THREE.RingGeometry(0.75, 0.82, 32),
    new THREE.MeshBasicMaterial({
      color: 0xff5a7a,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    }),
  );
  m.userData.noAO = true;
  scene.add(m);
  return m;
});

// ---------------------------------------------------------------- sparks (kribbeln)
const NSPK = 14;
const sparks = new THREE.InstancedMesh(
  new THREE.BoxGeometry(0.035, 0.32, 0.035),
  new THREE.MeshBasicMaterial({ color: 0xfff27a }),
  NSPK * 3,
);
sparks.userData.noAO = true;
sparks.frustumCulled = false;
scene.add(sparks);
const spkR = rng(23);
const spkSeed = Array.from({ length: NSPK }, () => [spkR(), spkR(), spkR()]);

// ---------------------------------------------------------------- the cape
const capeGeo = new THREE.PlaneGeometry(2.0, 2.3, 8, 10);
const capeBase = capeGeo.attributes.position.array.slice();
const cape = mesh(
  capeGeo,
  flat(0xe8233b, { side: THREE.DoubleSide, roughness: 0.6 }),
  0,
  1.45,
  -0.86,
);
const capePivot = new THREE.Group();
capePivot.position.set(0, 2.5, -0.6);
scene.add(capePivot);
capePivot.add(cape);
cape.position.set(0, -1.05, -0.2);

// ---------------------------------------------------------------- mailbox (the analogy)
// a yellow post box: letters = the sleep signal (adenosine), the lime tape
// over its slot = caffeine. The letters can't get in, pile up, and burst.
const mb = new THREE.Group();
mb.position.set(...MAILBOX);
scene.add(mb);
const yellow = flat(0xffc61a, { roughness: 0.4 });
mesh(facet(new THREE.BoxGeometry(1.5, 1.6, 1.0), 0.04, 3), facetMat(yellow), 0, 0.8, 0, mb);
const mbTop = mesh(
  new THREE.CylinderGeometry(0.5, 0.5, 1.5, 16, 1, false, 0, Math.PI),
  yellow,
  0,
  1.6,
  0,
  mb,
);
mbTop.rotation.z = Math.PI / 2;
mbTop.rotation.y = Math.PI / 2;
mbTop.scale.set(1, 1, 1);
// the lid (front flap) on a hinge at the top front
const flapPivot = new THREE.Group();
flapPivot.position.set(0, 1.38, 0.5);
mb.add(flapPivot);
mesh(new THREE.BoxGeometry(1.2, 0.36, 0.06), flat(0xf0b000), 0, -0.18, 0.03, flapPivot);
mesh(new THREE.BoxGeometry(1.0, 0.09, 0.02), flat(0x1a1a1a), 0, 1.12, 0.51, mb);
// post horn emblem
const horn = mesh(
  new THREE.TorusGeometry(0.2, 0.05, 6, 18, Math.PI * 1.6),
  flat(0x111111),
  0,
  0.6,
  0.52,
  mb,
);
horn.rotation.z = 0.6;
// caffeine tape: two lime strips crossing the slot
const tapeMat = flat(LIME, { roughness: 0.5, emissive: 0x4a8a00, emissiveIntensity: 0.25 });
const tapes = [0.32, -0.32].map((rz, i) => {
  const s = mesh(new THREE.BoxGeometry(1.5, 0.24, 0.025), tapeMat, 0, 1.12, 0.54 + i * 0.006, mb);
  s.rotation.z = rz;
  return s;
});
// letters (instanced): fly in, bounce off the taped slot, pile up in front
const NLET = 84;
const letters = new THREE.InstancedMesh(
  new THREE.BoxGeometry(0.58, 0.035, 0.4),
  flat(0xf4f7ff, { emissive: 0x4f8dff, emissiveIntensity: 0.75, roughness: 0.6 }),
  NLET,
);
letters.castShadow = true;
letters.frustumCulled = false;
scene.add(letters);
const letR = rng(31);
const letterData = Array.from({ length: NLET }, (_, i) => {
  // arrival: 6 in the first beat, the rest from "blockiert" to "quillt"
  const arrive =
    i < 6
      ? T.versteckt + 0.15 + i * 0.22
      : lerp(T.blockiert + 0.1, T.quillt - 0.25, Math.pow((i - 6) / (NLET - 7), 0.85));
  // pile spot in front of the box: a heap that grows upward
  const ang = letR() * Math.PI - Math.PI / 2;
  const rad = 0.15 + letR() * 0.95;
  const h = (i / NLET) * 1.9 * (1 - rad / 1.3) + letR() * 0.05;
  return {
    arrive,
    px: MAILBOX[0] + Math.sin(ang) * rad * 1.1,
    pz: MAILBOX[2] + 0.75 + Math.cos(ang) * rad * 0.55,
    py: 0.03 + Math.max(0, h),
    ry: letR() * Math.PI,
    rx: (letR() - 0.5) * 0.5,
    // burst velocity
    vx: (letR() - 0.3) * 3.6,
    vy: 3.0 + letR() * 3.0,
    vz: 0.6 + letR() * (letR() < 0.2 ? 6.0 : 2.6),
    spin: (letR() - 0.5) * 10,
  };
});
const eul = new THREE.Euler();
function animateLetters(t) {
  const tB = T.quillt + 0.05;
  for (let i = 0; i < NLET; i++) {
    const d = letterData[i];
    if (t < d.arrive) {
      letters.setMatrixAt(i, hideM);
      continue;
    }
    let x, y, z, rx, ry, rz;
    const fly = clamp01((t - d.arrive) / 0.55);
    if (t < tB) {
      // arc in from the upper left, hit the slot, drop onto the heap
      const sx = MAILBOX[0] - 3.5,
        sy = 3.6,
        sz = MAILBOX[2] + 2.5;
      const hitK = 0.55;
      if (fly < hitK) {
        const u = fly / hitK;
        x = lerp(sx, MAILBOX[0], u);
        y = lerp(sy, 1.12, u) + Math.sin(u * Math.PI) * 0.6;
        z = lerp(sz, MAILBOX[2] + 0.6, u);
        rx = 1.4;
        ry = u * 2;
        rz = 0;
      } else {
        const u = smooth((fly - hitK) / (1 - hitK));
        x = lerp(MAILBOX[0], d.px, u);
        y = lerp(1.12, d.py, u) + Math.sin(u * Math.PI) * 0.25;
        z = lerp(MAILBOX[2] + 0.6, d.pz, u);
        rx = lerp(1.4, d.rx, u);
        ry = lerp(2, d.ry, u);
        rz = 0;
      }
      // the heap trembles right before the burst
      const trem = ramp(t, T.nachts, tB) * 0.025;
      x += Math.sin(t * 61 + i) * trem;
    } else {
      const u = t - tB;
      x = d.px + d.vx * u;
      z = d.pz + d.vz * u;
      y = Math.max(0.03, d.py + d.vy * u - 6 * u * u);
      const landed = d.py + d.vy * u - 6 * u * u <= 0.03;
      rx = landed ? 0 : d.rx + d.spin * u;
      ry = d.ry + (landed ? 0 : d.spin * 0.6 * u);
      rz = landed ? 0 : d.spin * 0.4 * u;
    }
    pV.set(x, y, z);
    q.setFromEuler(eul.set(rx, ry, rz));
    sV.setScalar(1);
    letters.setMatrixAt(i, m4.compose(pV, q, sV));
  }
  letters.instanceMatrix.needsUpdate = true;
}

// ---------------------------------------------------------------- the pyramid of ten
const canColors = [
  0x3d7bff, 0xff3fa8, 0xffd23f, 0x7c5cff, 0xff6b2d, 0x2fe0c8, 0xff3b3b, 0x9dff2e, 0xffffff,
  0x1d1d26,
];
const pyr = [];
{
  const g = new THREE.Group();
  g.position.set(...PYR);
  scene.add(g);
  const r = 0.36,
    h = 1.12;
  const rows = [4, 3, 2, 1];
  let idx = 0;
  rows.forEach((n, row) => {
    for (let k = 0; k < n; k++) {
      const c = new THREE.Group();
      c.position.set((k - (n - 1) / 2) * (2 * r + 0.04), row * (h + 0.02), 0);
      const body = mesh(
        new THREE.CylinderGeometry(r, r, h * 0.84, 20),
        flat(canColors[idx], { roughness: 0.3, metalness: 0.35 }),
        0,
        h / 2,
        0,
        c,
      );
      mesh(new THREE.CylinderGeometry(r * 0.88, r, h * 0.08, 20), alu, 0, h * 0.04, 0, c);
      mesh(new THREE.CylinderGeometry(r * 0.82, r, h * 0.08, 20), alu, 0, h * 0.96, 0, c);
      const stripe = mesh(
        new THREE.CylinderGeometry(r + 0.004, r + 0.004, 0.16, 20, 1, true),
        flat(idx === 8 ? 0x3d7bff : 0xffffff),
        0,
        h * 0.55,
        0,
        c,
      );
      stripe.userData.noAO = true;
      body.userData.k = idx;
      g.add(c);
      pyr.push(c);
      idx++;
    }
  });
}
// order the pyramid is emptied: from the top down
const pyrOrder = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
// empties: crushed cans lying around the hero can
const empties = [];
{
  const r = rng(41);
  const spots = [
    [-1.7, -1.4],
    [-2.4, -0.4],
    [1.9, -1.2],
    [-1.2, 2.2],
    [2.3, 0.4],
    [-2.9, -2.2],
    [1.2, -2.6],
    [-0.4, -2.4],
    [3.0, -0.9],
  ];
  spots.forEach(([x, z], i) => {
    const c = new THREE.Group();
    c.position.set(x, 0.3, z);
    c.rotation.set(Math.PI / 2, r() * Math.PI, (r() - 0.5) * 0.6);
    const b = mesh(
      jitter2(new THREE.CylinderGeometry(0.36, 0.33, 1.0, 12), 0.06, 50 + i),
      flat(canColors[pyrOrder[i]], { roughness: 0.35, metalness: 0.3 }),
      0,
      0,
      0,
      c,
    );
    b.scale.set(1, 0.75, 0.6);
    scene.add(c);
    empties.push(c);
  });
}
function jitter2(geo, amt, seed) {
  const r = rng(seed);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    const k = 1 - Math.abs(y) * 0.8;
    p.setX(i, p.getX(i) * (1 - r() * amt * 2 * k));
    p.setZ(i, p.getZ(i) * (1 - r() * amt * 2 * k));
  }
  geo.computeVertexNormals();
  return geo;
}
// how many cans are done at time t (the hero can = the current one)
function drunk(t) {
  if (t < T.dose1) return 0;
  if (t < T.dose5) return 1 + Math.floor(clamp01((t - T.dose1 - 1.0) / 6) * 0);
  if (t < T.dose10) return 5;
  return 10;
}

function F2(geo) {
  return facet(geo, 0.08, 3);
}
// ---------------------------------------------------------------- the bull + lab flask
const bull = new THREE.Group();
bull.position.set(...BULL);
scene.add(bull);
{
  const brown = flat(0x9a5f36, { roughness: 0.6 });
  const head = mesh(
    facet(new THREE.BoxGeometry(1.15, 1.0, 1.0), 0.06, 4),
    facetMat(brown),
    0,
    1.1,
    0,
    bull,
  );
  head.scale.set(1, 1, 1);
  mesh(
    facet(new THREE.BoxGeometry(0.95, 0.55, 0.5), 0.05, 5),
    facetMat(flat(0xf2a6a0)),
    0,
    0.82,
    0.62,
    bull,
  );
  // tuft of hair between the horns
  mesh(F2(new THREE.IcosahedronGeometry(0.3, 0)), flat(0x5a341c), 0, 1.62, 0.15, bull);
  for (const sx of [-1, 1]) {
    const h = mesh(
      new THREE.ConeGeometry(0.14, 0.85, 8),
      flat(0xfff3dc),
      sx * 0.8,
      1.72,
      0.05,
      bull,
    );
    h.rotation.z = -sx * 0.85;
    const e = mesh(new THREE.BoxGeometry(0.42, 0.16, 0.24), brown, sx * 0.74, 1.28, -0.05, bull);
    e.rotation.z = sx * 0.35;
    mesh(new THREE.SphereGeometry(0.13, 10, 8), flat(0xffffff), sx * 0.3, 1.3, 0.47, bull);
    mesh(new THREE.SphereGeometry(0.07, 8, 6), flat(0x111111), sx * 0.3, 1.31, 0.58, bull);
    mesh(new THREE.SphereGeometry(0.07, 6, 4), flat(0x6a2a2a), sx * 0.2, 0.86, 0.88, bull);
  }
  const ring = mesh(
    new THREE.TorusGeometry(0.16, 0.04, 6, 16),
    flat(0xffd23f, { metalness: 0.7, roughness: 0.2 }),
    0,
    0.6,
    0.88,
    bull,
  );
  ring.rotation.x = 0.2;
  mesh(facet(new THREE.BoxGeometry(1.3, 0.65, 1.1), 0.06, 6), facetMat(brown), 0, 0.33, -0.5, bull);
}
const flask = new THREE.Group();
flask.position.set(...BULL);
scene.add(flask);
const glassMat = new THREE.MeshStandardMaterial({
  color: 0xdff4ff,
  roughness: 0.05,
  transparent: true,
  opacity: 0.5,
  emissive: 0x6fa8c8,
  emissiveIntensity: 0.25,
});
{
  const g = mesh(
    lathe([
      [0.0, 0.0],
      [0.75, 0.02],
      [0.8, 0.12],
      [0.25, 1.25],
      [0.22, 1.7],
      [0.27, 1.75],
    ]),
    glassMat,
    0,
    0,
    0,
    flask,
  );
  g.userData.noAO = true;
  g.castShadow = false;
  const liq = mesh(
    lathe([
      [0.0, 0.03],
      [0.72, 0.05],
      [0.76, 0.12],
      [0.45, 0.75],
      [0.0, 0.75],
    ]),
    flat(0x3dff7a, { emissive: 0x1fb85a, emissiveIntensity: 0.8, roughness: 0.2 }),
    0,
    0,
    0,
    flask,
  );
  liq.userData.noAO = true;
}
const bubbles = Array.from({ length: 8 }, () =>
  mesh(
    new THREE.SphereGeometry(0.06, 8, 6),
    new THREE.MeshBasicMaterial({ color: 0xc9ffe0 }),
    0,
    0,
    0,
    flask,
  ),
);
const flaskLight = new THREE.PointLight(0x3dff7a, 0, 4, 1.5);
flaskLight.position.set(0, 0.8, 0.5);
flask.add(flaskLight);

// ---------------------------------------------------------------- the clock
const clock = new THREE.Group();
clock.position.set(...CLOCK);
clock.rotation.y = -0.45;
scene.add(clock);
mesh(
  facet(new THREE.BoxGeometry(1.5, 0.85, 0.6), 0.04, 8),
  facetMat(flat(0x2a2b38, { roughness: 0.35 })),
  0,
  0.45,
  0,
  clock,
);
const clkCanvas = document.createElement("canvas");
clkCanvas.width = 256;
clkCanvas.height = 128;
const clkTex = new THREE.CanvasTexture(clkCanvas);
clkTex.colorSpace = THREE.SRGBColorSpace;
const clkFace = new THREE.Mesh(
  new THREE.PlaneGeometry(1.3, 0.62),
  new THREE.MeshBasicMaterial({ map: clkTex }),
);
clkFace.position.set(0, 0.46, 0.305);
clkFace.userData.noAO = true;
clock.add(clkFace);
let clkLast = "";
function drawClock(str, red) {
  const key = str + red;
  if (key === clkLast) return;
  clkLast = key;
  const g = clkCanvas.getContext("2d");
  g.fillStyle = "#07080d";
  g.fillRect(0, 0, 256, 128);
  g.fillStyle = red ? "#ff3b3b" : "#47e6ff";
  g.font = "bold 92px Montserrat, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(str, 128, 68);
  clkTex.needsUpdate = true;
}
function clockTime(t) {
  if (t < T.viertel) return "16:00";
  if (t < T.dose5) return "16:15";
  if (t < T.dose10) return "22:30";
  if (t < T.nachts) return "03:58";
  if (t < T.du) return "04:00";
  return "04:12";
}

// ---------------------------------------------------------------- beetle on the coffee plant
const beetle = new THREE.Group();
beetle.position.set(...PLANT_LEAF);
scene.add(beetle);
const beetleBody = new THREE.Group();
beetleBody.scale.setScalar(2.0);
beetle.add(beetleBody);
{
  const shell = flat(0x2fd06a, {
    roughness: 0.12,
    metalness: 0.5,
    emissive: 0x0d4a22,
    emissiveIntensity: 0.5,
  });
  const b = mesh(new THREE.SphereGeometry(0.2, 12, 8), shell, 0, 0.1, 0, beetleBody);
  b.scale.set(0.85, 0.55, 1.15);
  mesh(new THREE.SphereGeometry(0.09, 8, 6), flat(0x101010), 0, 0.08, 0.24, beetleBody);
  const line = mesh(
    new THREE.BoxGeometry(0.01, 0.02, 0.4),
    flat(0x0a2a1a),
    0,
    0.2,
    -0.02,
    beetleBody,
  );
  line.castShadow = false;
  for (const sx of [-1, 1])
    for (const z of [-0.12, 0, 0.12]) {
      const leg = mesh(
        new THREE.BoxGeometry(0.16, 0.02, 0.02),
        flat(0x101010),
        sx * 0.2,
        0.03,
        z,
        beetleBody,
      );
      leg.userData.leg = sx;
    }
}

// ---------------------------------------------------------------- hand
const hand = createHand({ scale: 1.7, sleeve: 0x3a3f5c });

// ---------------------------------------------------------------- camera
const applyCamera = shotCamera(shots);

// ---------------------------------------------------------------- render
function renderAt(t) {
  // ---- hand: rips the tab (hook), holds the trembling can, slumps (payoff)
  hand.track(t, [
    { t: -0.6, pos: [1.9, 3.5, 1.5], rot: [-0.35, -2.2, 0], pose: "open" },
    { t: 0.0, pos: [1.25, 3.25, 1.05], rot: [-0.3, -2.2, 0], pose: "point" },
    { t: 0.18, pos: [1.12, 3.05, 0.95], rot: [-0.2, -2.2, 0], pose: "press" },
    { t: 0.55, pos: [1.2, 3.35, 1.05], rot: [-0.45, -2.2, 0], pose: "point" },
    { t: T.energy, pos: [2.0, 3.8, 1.6], rot: [-0.4, -2.2, 0], pose: "open", out: true },
    // holds the can on "Hände zittern" (right side, wrapped around)
    { t: T.haende - 0.5, pos: [2.6, 1.6, 0.9], rot: [0, -1.75, 0], pose: "open" },
    { t: T.haende, pos: [1.75, 1.55, 0.55], rot: [0, -1.75, 0], pose: "grab" },
    { t: T.herz2 + 0.2, pos: [1.75, 1.55, 0.55], rot: [0, -1.75, 0], pose: "grab" },
    { t: T.herz2 + 0.8, pos: [2.6, 1.7, 1.0], rot: [0, -1.75, 0], pose: "open", out: true },
    // payoff: the hand drops onto the desk next to the tipped can
    { t: T.du - 0.4, pos: [1.6, 1.4, 1.9], rot: [0.2, -2.4, 0], pose: "open" },
    { t: T.du + 0.2, pos: [1.25, 0.12, 1.55], rot: [0.05, -2.5, 0.1], pose: "open" },
    { t: T.fakt, pos: [1.25, 0.12, 1.55], rot: [0.05, -2.5, 0.1], pose: "open", out: true },
  ]);
  // tremble on "zittern … hämmert"
  const shakeK =
    ramp(t, T.zittern - 0.1, T.zittern + 0.2) * (1 - ramp(t, T.welcher - 0.4, T.welcher));
  if (shakeK > 0) {
    hand.group.position.x += Math.sin(t * 73) * 0.03 * shakeK;
    hand.group.position.y += Math.sin(t * 59 + 1) * 0.03 * shakeK;
  }

  // ---- the hero can: pop-wobble on the crack, gulps, trembles, tips over at the end
  can.position.set(0, 0, 0);
  can.rotation.set(0, 0, 0);
  const crack = pop(t, 0.18, 0.7, 0.12);
  can.scale.set(1 + crack * 0.03, 1 - crack * 0.04, 1 + crack * 0.03);
  // Dose eins: a gulp — the can tilts back and forth
  const gulp = ramp(t, T.dose1, T.dose1 + 1.0);
  can.rotation.x = -Math.sin(gulp * Math.PI) * 0.18;
  if (shakeK > 0) {
    can.position.x += Math.sin(t * 73) * 0.025 * shakeK;
    can.rotation.z = Math.sin(t * 67) * 0.02 * shakeK;
  }
  // payoff: tipped over onto its side, rolled towards the front-left
  const tip = smooth(ramp(t, T.kracht, T.kracht + 0.6));
  if (tip > 0) {
    can.rotation.z = tip * (Math.PI / 2 - 0.02);
    can.position.set(-tip * 0.2, tip * R, tip * 0.6);
  }
  // tab lifts at 0.18 s
  tabPivot.rotation.x = -smooth(ramp(t, 0.1, 0.3)) * 0.75;
  hole.visible = t >= 0.2;
  // x-ray for the caffeine beat
  const xr =
    smooth(ramp(t, T.wach - 0.1, T.wach + 0.4)) *
    (1 - ramp(t, T.blockiert - 0.1, T.blockiert + 0.2));
  setXray([bodyMat, bandMat], xr);
  liquid.visible = xr > 0.02;
  mols.visible = xr > 0.02;
  if (mols.visible) {
    for (let i = 0; i < NMOL; i++) {
      const [a, b, c] = molSeed[i];
      const ang = a * Math.PI * 2 + t * (0.8 + b * 1.4);
      const rr = 0.15 + c * 0.5;
      pV.set(
        Math.cos(ang) * rr,
        0.45 + ((b * 1.6 + t * 0.25 * (0.5 + c)) % 1.55),
        Math.sin(ang) * rr,
      );
      sV.setScalar(0.7 + c * 0.8);
      q.setFromEuler(eul.set(t * 2 + a * 6, t * 3 + b * 6, 0));
      mols.setMatrixAt(i, m4.compose(pV, q, sV));
    }
    mols.instanceMatrix.needsUpdate = true;
  }
  burstSpray(t);

  // ---- heart: pops on "Herz", pounds on "hämmert", races at the end
  const hk = Math.max(
    pop(t, T.herz1, T.dose1, 0.3),
    pop(t, T.herz2, T.welcher, 0.3),
    pop(t, T.herzrasen - 0.2, T.fakt, 0.3),
  );
  heart.visible = hk > 0.01;
  if (heart.visible) {
    const rate = t > T.herz2 - 0.5 ? 2.4 : 1.25; // beats per second
    const ph = (t * rate) % 1;
    const beat =
      Math.exp(-ph * 9) + 0.6 * Math.exp(-Math.max(0, ph - 0.17) * 9) * (ph > 0.17 ? 1 : 0);
    const big = t > T.herz2 - 0.5 && t < T.welcher ? 1.35 : 1;
    heart.scale.setScalar(hk * big * (1 + beat * 0.16));
    heart.rotation.y = Math.sin(t * 1.3) * 0.25;
    if (t > T.herzrasen - 0.5) heart.position.set(0.9, 2.1, 1.3);
    else heart.position.set(-1.5, 3.4, 0.2);
    heartMat.emissiveIntensity = 0.5 + beat * 1.2;
    heartLight.intensity = hk * (2 + beat * 6);
    rings.forEach((rg, i) => {
      const u = (t * rate + i / 3) % 1;
      rg.position.copy(heart.position);
      rg.position.z += 0.05;
      rg.scale.setScalar(hk * big * (0.9 + u * 1.3));
      rg.material.opacity = hk * (1 - u) * 0.55;
      rg.visible = true;
    });
  } else rings.forEach((rg) => (rg.visible = false));

  // ---- sparks around the can while it "kribbelt"
  const spk = pop(t, T.kribbelt - 0.2, T.superheld + 0.3, 0.15);
  sparks.visible = spk > 0.01;
  if (sparks.visible) {
    for (let i = 0; i < NSPK; i++) {
      const [a, b, c] = spkSeed[i];
      const flick = Math.sin(t * (17 + a * 20) + c * 30) > 0.1 ? 1 : 0;
      const ang = a * Math.PI * 2 + Math.floor(t * 6 + c * 4) * 1.3;
      const rr = 1.0 + b * 0.5;
      const y = 0.5 + ((c * 2.2 + Math.floor(t * 5) * 0.37) % 2.3);
      for (let s = 0; s < 3; s++) {
        pV.set(Math.cos(ang) * rr + (s - 1) * 0.07, y + s * 0.27, Math.sin(ang) * rr);
        q.setFromEuler(eul.set(0, 0, (s % 2 ? 0.7 : -0.7) * (a > 0.5 ? 1 : -1)));
        sV.setScalar(flick * spk);
        sparks.setMatrixAt(i * 3 + s, m4.compose(pV, q, sV));
      }
    }
    sparks.instanceMatrix.needsUpdate = true;
  }

  // ---- cape: pops on "Superheld", waves, falls off on "keine"
  const capeIn = t >= T.superheld - 0.05 && t < T.keine + 0.6;
  cape.visible = capeIn;
  if (capeIn) {
    const s = squash(t, T.superheld - 0.05);
    const off = inBack(ramp(t, T.keine, T.keine + 0.5));
    capePivot.scale.set(s.x * (1 - off), s.y * (1 - off), s.z);
    capePivot.position.y = 2.5 - off * 1.5;
    capePivot.rotation.y = -0.55;
    const p = capeGeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const bx = capeBase[i * 3],
        by = capeBase[i * 3 + 1];
      const down = (1.05 - by) / 2.1; // 0 top … 1 bottom
      p.setZ(i, Math.sin(bx * 2.2 + t * 7 + by * 1.5) * 0.12 * down - down * 0.55);
      p.setX(i, bx * (1 + down * 0.35));
    }
    p.needsUpdate = true;
    capeGeo.computeVertexNormals();
  }

  // ---- mailbox: pops on "versteckt", tape slaps on, letters, the burst
  const mbIn = t >= T.versteckt - 0.1;
  mb.visible = mbIn;
  if (mbIn) {
    mb.scale.copy(squash(t, T.versteckt - 0.1));
    puff("mb", t, T.versteckt + 0.05, MAILBOX[0], 0.05, MAILBOX[2], 1.1);
    // bulges + trembles before the burst
    const bulge = ramp(t, T.nachts, T.quillt + 0.05);
    const burst = t >= T.quillt + 0.05;
    if (!burst && bulge > 0) {
      mb.scale.x *= 1 + bulge * 0.08 + Math.sin(t * 50) * 0.015 * bulge;
      mb.scale.y *= 1 + bulge * 0.05;
      mb.position.x = MAILBOX[0] + Math.sin(t * 63) * 0.02 * bulge;
    } else mb.position.x = MAILBOX[0];
    flapPivot.rotation.x = burst ? -outBack(clamp01((t - T.quillt - 0.05) / 0.3)) * 1.9 : 0;
  }
  tapes.forEach((s, i) => {
    const at = T.versteckt + 0.3 + i * 0.45;
    s.visible = t >= at;
    if (s.visible) {
      const k = outBack(clamp01((t - at) / 0.22));
      s.scale.set(k, 1, 1);
      // ripped off by the burst
      if (t >= T.quillt + 0.05) {
        const u = t - T.quillt - 0.05;
        s.position.set(i ? 0.4 * u * 3 : -0.4 * u * 3, 1.12 + 3 * u - 5 * u * u, 0.54 + 2.5 * u);
        s.rotation.z = (i ? -0.32 : 0.32) + u * 6;
      } else {
        s.position.set(0, 1.12, 0.54 + i * 0.006);
        s.rotation.z = i ? -0.32 : 0.32;
      }
    }
  });
  animateLetters(t);

  // ---- pyramid + empties
  const n = drunk(t);
  pyr.forEach((c, idx) => {
    const order = pyrOrder.indexOf(idx);
    const goneAt =
      order < 1 ? T.dose1 : order < 5 ? T.dose5 + (order - 1) * 0.1 : T.dose10 + (order - 5) * 0.08;
    const gone = inBack(ramp(t, goneAt, goneAt + 0.25));
    c.visible = gone < 1;
    c.scale.setScalar(Math.max(0.001, 1 - gone));
  });
  empties.forEach((c, i) => {
    // empty i appears when can i+2 is opened
    const at = i < 4 ? T.dose5 + 0.15 + i * 0.12 : T.dose10 + 0.15 + (i - 4) * 0.1;
    c.visible = t >= at && n > 0;
    if (c.visible) c.scale.copy(squash(t, at, 0.5));
  });

  // ---- bull → flask
  const bullK = t >= T.taurin - 0.05 && t < T.labor + 0.1;
  bull.visible = bullK;
  if (bullK) {
    const out = inBack(ramp(t, T.labor - 0.3, T.labor));
    const s = squash(t, T.taurin - 0.05);
    bull.scale.set(s.x * (1 - out), s.y * (1 - out), s.z * (1 - out));
    bull.rotation.y = -0.4 + Math.sin(t * 2) * 0.05;
  }
  if (t < T.rate) showNope(pop(t, T.keine, T.versteckt - 0.1), 0, 1.6, 1.0, 0.9);
  else showNope(pop(t, T.falsch, T.labor - 0.2), BULL[0], 1.2, BULL[2] + 0.8, 1.1);
  flask.visible = t >= T.labor - 0.05 && t < T.blockiert;
  if (flask.visible) {
    flask.scale.copy(squash(t, T.labor - 0.05));
    flaskLight.intensity = 3;
    bubbles.forEach((b, i) => {
      const u = (t * 0.9 + i / 8) % 1;
      b.position.set(
        Math.sin(i * 2.3) * 0.3 * (1 - u),
        0.1 + u * 0.65,
        Math.cos(i * 2.3) * 0.3 * (1 - u),
      );
      b.scale.setScalar(0.6 + u);
    });
  }
  puff("flask", t, T.labor + 0.1, BULL[0], 0.05, BULL[2], 0.9);

  // ---- clock
  drawClock(clockTime(t), t >= T.nachts);

  // ---- beetle: walks on the leaf, nibbles, falls over on "fressen"
  const kill = smooth(ramp(t, T.kaefer + 0.35, T.kaefer + 0.7));
  beetle.position.set(
    PLANT_LEAF[0] + Math.sin(t * 0.8) * 0.08 * (1 - kill),
    PLANT_LEAF[1] + 0.02,
    PLANT_LEAF[2],
  );
  beetle.rotation.y = 0.6 + Math.sin(t * 0.8) * 0.2;
  beetleBody.rotation.z = kill * Math.PI;
  beetleBody.position.y = kill * 0.42;
  beetleBody.children.forEach((c) => {
    if (c.userData.leg)
      c.rotation.y = Math.sin(t * (kill > 0.5 ? 30 : 12) + c.position.z * 20) * 0.4;
  });

  // ---- HUD: the pulse gauge + can counter
  const pulseK = Math.max(
    pop(t, T.herz1, T.dose1 + 0.6),
    pop(t, T.zittern, T.welcher - 0.1),
    pop(t, T.herzrasen - 0.2, T.fakt),
  );
  const bpm =
    t < T.dose1 ? 78 : t < T.welcher ? lerp(96, 128, ramp(t, T.zittern, T.haemmert + 0.6)) : 134;
  gauge("puls", pulseK, {
    label: "Puls",
    value: Math.round(bpm + Math.sin(t * 9) * 1.5),
    max: 180,
    unit: "bpm",
    x: 650,
    y: 470,
    color: bpm > 110 ? "#ff4b5c" : "#ffd23f",
  });
  const cntK = Math.max(
    pop(t, T.dose1, T.viertel + 0.2),
    pop(t, T.dose5, T.experten + 0.3),
    pop(t, T.dose10, T.nachts),
  );
  counter("dose", cntK, {
    label: "Dose",
    value: t < T.dose5 ? 1 : t < T.dose10 ? 5 : 10,
    x: 60,
    y: 470,
  });

  // ---- LED panel: one fact at a time
  if (t >= T.experten && t < T.haende)
    showPanel(pop(t, T.experten, T.haende), "5 DOSEN", "400 mg", LED.yellow);
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
