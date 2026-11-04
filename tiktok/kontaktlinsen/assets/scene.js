// #59 Kontaktlinsen (Format B: „Was passiert, wenn du mit Linsen einschläfst?“)
// Two places: the bedroom at night (set.js) with the sleeper's head on the
// pillow, and far away at CUT a giant cross-section of the eye's front — the
// clear cornea dome on the white eyeball, oxygen bubbles raining in from the
// air, the eyelid sliding over, the lens, swelling, sleepy immune cells,
// germs, the amoeba, and finally 27 forgotten lenses under the lid.
import {
  THREE,
  ramp,
  smooth,
  pop,
  lerp,
  clamp01,
  V,
  scene,
  flat,
  jitter,
  facet,
  facetMat,
  rng,
  squash,
  showPanel,
  labels,
  highlights,
  shotCamera,
  renderFrame,
  start,
  outBack,
} from "./world.js";
import "./set.js";
import { createHand } from "./hand.js";
import { meter, counter } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS, HEAD, CUT, LAMP, CASE } from "./beats.js";

highlights(HIGHLIGHTS);
const win = (t, a, b, d = 0.3) => pop(t, a, b, d);
const hash = (a, b = 0) => {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ================================================================ bedroom
// ---------------------------------------------------------------- the sleeper's head
const skin = 0xf0bf98;
const skinMat = flat(skin, { roughness: 0.75 });
const head = new THREE.Group();
head.position.set(...HEAD);
head.rotation.set(-Math.PI / 2, Math.PI / 2, 0, "YXZ"); // on the back: face up, top of the head → −x (headboard)
scene.add(head);
const hm = (geo, mat, x, y, z, parent = head) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  parent.add(m);
  return m;
};
{
  const skull = hm(
    facet(jitter(new THREE.SphereGeometry(0.42, 16, 12), 0.01, 3), 0.04, 3),
    facetMat(skinMat),
    0,
    0,
    0,
  );
  skull.scale.set(0.88, 1.08, 0.95);
  const jaw = hm(jitter(new THREE.SphereGeometry(0.3, 12, 8), 0.01, 4), skinMat, 0, -0.2, 0.06);
  jaw.scale.set(0.95, 0.75, 0.95);
  const nose = hm(new THREE.ConeGeometry(0.07, 0.15, 5), skinMat, 0, -0.03, 0.41);
  nose.rotation.x = Math.PI / 2;
  nose.scale.set(1, 1, 0.75);
  for (const sx of [-1, 1]) {
    const ear = hm(new THREE.SphereGeometry(0.09, 7, 6), skinMat, sx * 0.37, 0, -0.02);
    ear.scale.set(0.5, 1, 0.8);
  }
  const lips = hm(new THREE.BoxGeometry(0.12, 0.028, 0.04), flat(0xa8504c), 0, -0.21, 0.335);
  lips.rotation.z = 0.05;
  // hair: dark brown cap + a messy fringe spilling over the pillow
  const hairMat = flat(0x3b2418, { roughness: 0.85 });
  const cap = hm(
    facet(
      jitter(new THREE.SphereGeometry(0.455, 14, 9, 0, Math.PI * 2, 0, Math.PI * 0.47), 0.014, 5),
      0.06,
      5,
    ),
    facetMat(hairMat),
    0,
    0.04,
    -0.03,
  );
  cap.scale.set(0.93, 1.1, 1.0);
  cap.rotation.x = -0.24;
  const back = hm(jitter(new THREE.SphereGeometry(0.4, 10, 8), 0.02, 6), hairMat, 0, 0.2, -0.2);
  back.scale.set(0.88, 0.8, 0.7);
  for (let i = 0; i < 6; i++) {
    const s = hm(new THREE.ConeGeometry(0.06, 0.26, 4), hairMat, -0.22 + i * 0.09, 0.36, 0.3);
    s.rotation.set(1.9, 0, (i - 2.5) * 0.18);
  }
  // long strands over the pillow (towards the headboard = local +y, then down)
  for (let i = 0; i < 5; i++) {
    const s = hm(
      jitter(new THREE.BoxGeometry(0.14, 0.55, 0.08, 1, 3, 1), 0.02, 7 + i),
      hairMat,
      -0.32 + i * 0.05,
      0.42,
      -0.15 + i * 0.07,
    );
    s.rotation.set(-0.4, 0, -0.9 - i * 0.12);
  }
}
// eyes: white, iris, pupil, a contact lens (glinting dome + edge ring),
// red veins that swell up, and upper lids that close
const eyeWhite = flat(0xffffff, { roughness: 0.35, emissive: 0xff2030, emissiveIntensity: 0 });
const irisMat = flat(0x3f8fc9, { roughness: 0.3 });
const pupilMat = flat(0x101018, { roughness: 0.2 });
const veinMat = flat(0xd8303a, { emissive: 0xff1a2a, emissiveIntensity: 0 });
const faceLensMat = new THREE.MeshStandardMaterial({
  color: 0xbfe6ff,
  roughness: 0.02,
  metalness: 0.1,
  transparent: true,
  opacity: 0.45,
  envMapIntensity: 2.5,
});
const faceEyes = [];
for (const sx of [-1, 1]) {
  const g = new THREE.Group();
  g.position.set(sx * 0.145, 0.07, 0.345);
  head.add(g);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.064, 14, 10), eyeWhite);
  ball.scale.z = 0.6;
  g.add(ball);
  const iris = new THREE.Mesh(new THREE.CircleGeometry(0.03, 14), irisMat);
  iris.position.z = 0.04;
  g.add(iris);
  const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.013, 10), pupilMat);
  pupil.position.z = 0.0405;
  g.add(pupil);
  const lens = new THREE.Mesh(
    new THREE.SphereGeometry(0.042, 14, 6, 0, Math.PI * 2, 0, 0.9),
    faceLensMat,
  );
  lens.rotation.x = Math.PI / 2;
  lens.position.z = 0.006;
  lens.scale.set(1, 1.0, 1);
  g.add(lens);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.033, 0.0022, 4, 24),
    flat(0xe8f8ff, { emissive: 0x9fdcff, emissiveIntensity: 0.9 }),
  );
  ring.position.z = 0.04;
  g.add(ring);
  // little red veins on the white, from the corners towards the iris
  const veins = new THREE.Group();
  g.add(veins);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.3;
    const pts = [];
    for (let k = 0; k <= 6; k++) {
      const rr = 0.062 - k * 0.0045;
      const aa = a + Math.sin(k * 1.7 + i) * 0.12;
      pts.push(
        V(
          Math.cos(aa) * rr,
          Math.sin(aa) * rr,
          Math.sqrt(Math.max(0, 0.064 ** 2 - rr * rr)) * 0.6 + 0.002,
        ),
      );
    }
    veins.add(
      new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.0016, 4),
        veinMat,
      ),
    );
  }
  // upper lid: skin half shell rotating over the ball, lashes on its edge
  const lid = new THREE.Group();
  g.add(lid);
  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(0.069, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    flat(0xe5ae88),
  );
  shell.scale.z = 0.66;
  lid.add(shell);
  for (let i = 0; i < 9; i++) {
    const a = Math.PI * (0.15 + (i / 8) * 0.7);
    const lash = new THREE.Mesh(new THREE.ConeGeometry(0.0035, 0.03, 3), flat(0x1c120c));
    lash.position.set(Math.cos(a) * 0.066, 0, Math.sin(a) * 0.045);
    lash.rotation.set(Math.PI / 2 - 0.5, 0, 0);
    lid.add(lash);
  }
  faceEyes.push({ g, lid, lens, ring, veins });
}
// the eye's lid: 0 = open, 1 = shut
function lidAt(t) {
  if (t < T.klingt) return lerp(0.45, 0.75, ramp(t, 0, T.erstickt)); // drifting off
  if (t >= T.brennen - 0.26 && t < T.linse - 0.08) {
    // the red eye blinks open, squints
    return (
      1 -
      smooth(ramp(t, T.brennen - 0.1, T.brennen + 0.25)) * 0.8 +
      0.25 * pop(t, T.knallrot + 0.35, T.knallrot + 0.6, 0.08)
    );
  }
  return 1;
}

// ---------------------------------------------------------------- bedside lamp
const lamp = new THREE.Group();
lamp.position.set(...LAMP);
scene.add(lamp);
const shadeMat = flat(0xf7e3c0, {
  emissive: 0xffb054,
  emissiveIntensity: 1.4,
  side: THREE.DoubleSide,
});
{
  const base = new THREE.Mesh(
    facet(new THREE.CylinderGeometry(0.2, 0.28, 0.16, 10), 0.06, 1),
    facetMat(flat(0x3f6a5c)),
  );
  base.position.y = 0.08;
  lamp.add(base);
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.9, 6),
    flat(0xd4b070, { metalness: 0.6, roughness: 0.3 }),
  );
  stem.position.y = 0.6;
  lamp.add(stem);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.45, 0.5, 12, 1, true), shadeMat);
  shade.position.y = 1.1;
  lamp.add(shade);
  const sw = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.14), flat(0xe9e2d6));
  sw.position.set(0.16, 0.18, 0.18);
  lamp.add(sw);
  lamp.traverse((o) => o.isMesh && (o.castShadow = true));
}
// soft fill on the sleeper's face from the chest side (keeps the chin out of the dark)
const faceFill = new THREE.PointLight(0xffd6c0, 5, 4.5, 1.2);
faceFill.position.set(HEAD[0] + 1.3, HEAD[1] + 1.4, HEAD[2] + 0.5);
scene.add(faceFill);
const lampLight = new THREE.PointLight(0xffb45e, 14, 10, 1.4);
lampLight.position.set(LAMP[0], LAMP[1] + 1.05, LAMP[2] + 0.2);
scene.add(lampLight);

// ---------------------------------------------------------------- phone (glowing, face up)
const phoneScreen = flat(0x4a7bff, { emissive: 0x6a9bff, emissiveIntensity: 0.6 });
{
  const ph = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.04, 0.82),
    flat(0x1d1d24, { roughness: 0.3 }),
  );
  ph.add(body);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.37, 0.76), phoneScreen);
  scr.rotation.x = -Math.PI / 2;
  scr.position.y = 0.022;
  ph.add(scr);
  ph.position.set(-1.1, 2.33, -3.45);
  ph.rotation.y = 0.4;
  scene.add(ph);
}

// ---------------------------------------------------------------- lens case (two cups, lids)
const caseG = new THREE.Group();
caseG.position.set(...CASE);
scene.add(caseG);
const caseLids = [];
{
  const body = new THREE.Mesh(
    facet(new THREE.BoxGeometry(0.55, 0.1, 0.24, 2, 1, 1), 0.05, 2),
    facetMat(flat(0x69c3ff)),
  );
  body.position.y = 0.05;
  caseG.add(body);
  for (const [sx, col, letter] of [
    [-1, 0xffffff, "L"],
    [1, 0x2f7fe0, "R"],
  ]) {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.1, 0.14, 12), flat(0x8fd4ff));
    cup.position.set(sx * 0.15, 0.12, 0);
    caseG.add(cup);
    const pivot = new THREE.Group();
    pivot.position.set(sx * 0.15, 0.2, -0.11);
    caseG.add(pivot);
    const lidm = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.125, 0.06, 12), flat(col));
    lidm.position.set(0, 0.03, 0.11);
    pivot.add(lidm);
    caseLids.push({ pivot, letter });
  }
  caseG.traverse((o) => o.isMesh && (o.castShadow = true));
}
const tinyLens = new THREE.Mesh(
  new THREE.SphereGeometry(0.05, 12, 5, 0, Math.PI * 2, 0, 0.9),
  faceLensMat,
);
scene.add(tinyLens);

// ---------------------------------------------------------------- dice for "Glücksspiel"
const dice = [];
{
  const pipMat = flat(0x1b1b28);
  const faces = [
    [V(0, 0, 1), [[0, 0]]],
    [
      V(0, 0, -1),
      [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [1, -1],
        [1, 0],
        [1, 1],
      ],
    ],
    [
      V(1, 0, 0),
      [
        [-1, -1],
        [1, 1],
      ],
    ],
    [
      V(-1, 0, 0),
      [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
        [0, 0],
      ],
    ],
    [
      V(0, 1, 0),
      [
        [-1, -1],
        [0, 0],
        [1, 1],
      ],
    ],
    [
      V(0, -1, 0),
      [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ],
    ],
  ];
  for (let d = 0; d < 2; d++) {
    const g = new THREE.Group();
    const cube = new THREE.Mesh(
      facet(new THREE.BoxGeometry(0.5, 0.5, 0.5, 1, 1, 1), 0.04, d),
      facetMat(flat(d ? 0xff4d5e : 0xfafafa, { roughness: 0.35 })),
    );
    cube.castShadow = true;
    g.add(cube);
    for (const [n, pips] of faces) {
      const u = Math.abs(n.y) > 0.5 ? V(1, 0, 0) : V(0, 1, 0);
      const w = n.clone().cross(u);
      for (const [a, b] of pips) {
        const p = new THREE.Mesh(
          new THREE.SphereGeometry(0.042, 6, 4),
          d ? flat(0xffffff) : pipMat,
        );
        p.position.copy(
          n
            .clone()
            .multiplyScalar(0.245)
            .addScaledVector(u, a * 0.13)
            .addScaledVector(w, b * 0.13),
        );
        p.scale.setScalar(1);
        g.add(p);
      }
    }
    scene.add(g);
    dice.push(g);
  }
}

// ---------------------------------------------------------------- the viewer's hand
const hand = createHand({ sleeve: 0x8c6bd6, scale: 0.9 });

// ================================================================ the eye cross-section (CUT)
const cut = new THREE.Group();
cut.position.set(...CUT);
scene.add(cut);
// backdrop: a deep violet bubble with a soft glow behind the eye
{
  const geo = new THREE.SphereGeometry(18, 32, 16);
  const p = geo.attributes.position;
  const col = new Float32Array(p.count * 3);
  const top = new THREE.Color(0x1a1340);
  const mid = new THREE.Color(0x4a2a6e);
  const low = new THREE.Color(0x12102a);
  const tmp = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i) / 18;
    if (y > 0) tmp.copy(mid).lerp(top, Math.min(1, y * 1.6));
    else tmp.copy(mid).lerp(low, Math.min(1, -y * 2));
    col.set([tmp.r, tmp.g, tmp.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const bg = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false }),
  );
  bg.userData.noAO = true;
  cut.add(bg);
  // soft floating specks (tear-film shimmer)
  const r = rng(77);
  const specks = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.05, 0),
    new THREE.MeshBasicMaterial({ color: 0xcdb8ff, transparent: true, opacity: 0.7, fog: false }),
    80,
  );
  specks.userData.noAO = true;
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 80; i++) {
    const a = r() * Math.PI * 2;
    const rr = 7 + r() * 8;
    m4.makeTranslation(Math.cos(a) * rr, -2 + r() * 12, Math.sin(a) * rr - 2);
    specks.setMatrixAt(i, m4);
  }
  cut.add(specks);
}
// lights of the cut stage (short range, they never reach the bedroom)
{
  const key = new THREE.PointLight(0xfff1e0, 120, 40, 1.2);
  key.position.set(5, 11, 9);
  cut.add(key);
  const fill = new THREE.PointLight(0x8fb4ff, 50, 40, 1.2);
  fill.position.set(-9, 4, 6);
  cut.add(fill);
  const back = new THREE.PointLight(0xff6fb0, 60, 30, 1.3);
  back.position.set(0, 5, -9);
  cut.add(back);
}

const R = 4.2; // cornea outer radius
const RI = 3.78; // cornea inner radius
const CY = -3.16; // cornea sphere centre (base ring at y = 0)
const TH = 0.72; // cornea cap angle
const RS = 6; // eyeball (sclera) radius
const SY = -5.32; // eyeball centre
// eyeball: white sphere with a hole where the cornea sits
const scleraMat = flat(0xfbf3ee, { roughness: 0.5, emissive: 0xff3040, emissiveIntensity: 0 });
const scleraF = facetMat(scleraMat);
{
  const geo = new THREE.SphereGeometry(
    RS,
    64,
    32,
    0,
    Math.PI * 2,
    Math.asin(2.77 / RS),
    Math.PI * 0.6,
  );
  const sclera = new THREE.Mesh(facet(geo, 0.025, 8), scleraF);
  sclera.position.y = SY;
  sclera.receiveShadow = true;
  cut.add(sclera);
}
// iris + pupil under the dome
{
  const ring = new THREE.RingGeometry(1.0, 2.8, 48, 3);
  const p = ring.attributes.position;
  const col = new Float32Array(p.count * 3);
  const a = new THREE.Color(0x1c5f9e);
  const b = new THREE.Color(0x5fc0a0);
  const tmp = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const rr = Math.hypot(x, y);
    const ang = Math.atan2(y, x);
    tmp.copy(a).lerp(b, 0.5 + (0.5 * Math.sin(ang * 23) * (rr - 1)) / 1.8);
    col.set([tmp.r, tmp.g, tmp.b], i * 3);
  }
  ring.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const iris = new THREE.Mesh(
    ring,
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6 }),
  );
  iris.rotation.x = -Math.PI / 2;
  iris.position.y = 0.04;
  cut.add(iris);
  const pupil = new THREE.Mesh(
    new THREE.CircleGeometry(1.02, 32),
    flat(0x07070d, { roughness: 0.2 }),
  );
  pupil.rotation.x = -Math.PI / 2;
  pupil.position.y = 0.035;
  cut.add(pupil);
}
// the "front" group (cornea + lens + lid + spots + germs) scales when it swells
const front = new THREE.Group();
front.position.y = CY;
cut.add(front);
// cornea: a crescent turned on a lathe — clear blue glass, bright rim
const corneaMat = new THREE.MeshStandardMaterial({
  color: 0x8fdcff,
  roughness: 0.04,
  metalness: 0.0,
  transparent: true,
  opacity: 0.24,
  emissive: 0x2f9fff,
  emissiveIntensity: 0.08,
  depthWrite: false,
  side: THREE.DoubleSide,
  envMapIntensity: 2.0,
});
{
  const pts = [];
  for (let i = 0; i <= 16; i++) {
    const a = (i / 16) * TH;
    pts.push(new THREE.Vector2(Math.sin(a) * RI, Math.cos(a) * RI));
  }
  for (let i = 16; i >= 0; i--) {
    const a = (i / 16) * TH;
    pts.push(new THREE.Vector2(Math.sin(a) * R, Math.cos(a) * R));
  }
  pts.reverse();
  const geo = new THREE.LatheGeometry(pts, 64);
  const cornea = new THREE.Mesh(geo, corneaMat);
  cornea.renderOrder = 2;
  cornea.userData.noAO = true;
  front.add(cornea);
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(Math.sin(TH) * R, 0.05, 6, 80),
    new THREE.MeshBasicMaterial({ color: 0xbff0ff, transparent: true, opacity: 0.8 }),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = Math.cos(TH) * R;
  front.add(rim);
}
// cornea "breathing" glow: a thin shell just under the surface
const breathMat = new THREE.MeshBasicMaterial({
  color: 0x8fe0ff,
  transparent: true,
  opacity: 0,
  depthWrite: false,
});
{
  const g = new THREE.Mesh(
    new THREE.SphereGeometry(R - 0.05, 48, 12, 0, Math.PI * 2, 0, TH - 0.02),
    breathMat,
  );
  g.userData.noAO = true;
  front.add(g);
}
// veins on the eyeball: red tubes that run towards the cornea and stop
const cutVeinMat = flat(0xd23642, { emissive: 0xff1a30, emissiveIntensity: 0 });
const cutVeins = [];
{
  const r = rng(31);
  for (let i = 0; i < 18; i++) {
    const phi = (i / 18) * Math.PI * 2 + r() * 0.2;
    const pts = [];
    for (let k = 0; k <= 10; k++) {
      const pol = lerp(1.25, 0.52, k / 10) + Math.sin(k * 1.3 + i) * 0.015;
      const ph = phi + Math.sin(k * 0.9 + i * 2.1) * 0.09;
      const rr = RS + 0.03;
      pts.push(
        V(
          Math.sin(pol) * Math.cos(ph) * rr,
          SY + Math.cos(pol) * rr,
          Math.sin(pol) * Math.sin(ph) * rr,
        ),
      );
    }
    const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.045 + r() * 0.03, 5);
    const m = new THREE.Mesh(geo, cutVeinMat);
    cut.add(m);
    cutVeins.push(m);
    // a side branch
    const j = 4 + Math.floor(r() * 4);
    const b0 = pts[j];
    const bpts = [b0];
    for (let k = 1; k <= 4; k++) {
      const pol = lerp(1.25, 0.52, j / 10) - k * 0.04;
      const ph = phi + (r() > 0.5 ? 1 : -1) * k * 0.06;
      const rr = RS + 0.03;
      bpts.push(
        V(
          Math.sin(pol) * Math.cos(ph) * rr,
          SY + Math.cos(pol) * rr,
          Math.sin(pol) * Math.sin(ph) * rr,
        ),
      );
    }
    const bm = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(bpts), 12, 0.03, 4),
      cutVeinMat,
    );
    cut.add(bm);
  }
}
// the contact lens: a thin glossy shell over the cornea, bright edge
const RL = R + 0.13;
const lensMat = new THREE.MeshStandardMaterial({
  color: 0x9fd8ff,
  roughness: 0.03,
  metalness: 0.1,
  transparent: true,
  opacity: 0.5,
  emissive: 0x3fa0ff,
  emissiveIntensity: 0.18,
  depthWrite: false,
  side: THREE.DoubleSide,
  envMapIntensity: 3,
});
const lens = new THREE.Group();
front.add(lens);
{
  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(RL, 64, 14, 0, Math.PI * 2, 0, 0.8),
    lensMat,
  );
  shell.renderOrder = 3;
  shell.userData.noAO = true;
  lens.add(shell);
  const edge = new THREE.Mesh(
    new THREE.TorusGeometry(Math.sin(0.8) * RL, 0.07, 6, 90),
    new THREE.MeshStandardMaterial({
      color: 0xdff4ff,
      emissive: 0x6fc4ff,
      emissiveIntensity: 0.9,
      roughness: 0.2,
    }),
  );
  edge.rotation.x = Math.PI / 2;
  edge.position.y = Math.cos(0.8) * RL;
  lens.add(edge);
}
// dry white crust on the lens edge ("klebt fest")
const crust = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.09, 0),
  flat(0xffffff, { roughness: 1, emissive: 0xffffff, emissiveIntensity: 0.25 }),
  60,
);
{
  const r = rng(12);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 60; i++) {
    const ph = r() * Math.PI * 2;
    const pol = 0.68 + r() * 0.12;
    const rr = RL + 0.04;
    m4.compose(
      V(Math.sin(pol) * Math.cos(ph) * rr, Math.cos(pol) * rr, Math.sin(pol) * Math.sin(ph) * rr),
      new THREE.Quaternion(),
      V(1, 0.5 + r(), 1),
    );
    crust.setMatrixAt(i, m4);
  }
  crust.userData.noAO = true;
  lens.add(crust);
}
// the eyelid: a skin shell (concentric) that rotates over the dome, lashes
const RLID = R + 0.5;
const lidPivot = new THREE.Group();
front.add(lidPivot);
const lidSkin = new THREE.MeshStandardMaterial({
  color: 0xe7a985,
  roughness: 0.7,
  flatShading: true,
  transparent: true,
  opacity: 1,
  side: THREE.DoubleSide,
});
const lidF = facetMat(lidSkin);
{
  const geo = facet(
    jitter(new THREE.SphereGeometry(RLID, 64, 18, 0, Math.PI * 2, 0, 1.02), 0.02, 9),
    0.05,
    9,
  );
  const shell = new THREE.Mesh(geo, lidF);
  shell.castShadow = true;
  lidPivot.add(shell);
  // lashes along the leading half of the rim (+x side)
  const lashMat = flat(0x24160f);
  for (let i = 0; i < 26; i++) {
    const ph = -1.2 + (i / 25) * 2.4;
    const pol = 1.02;
    const pos = V(
      Math.sin(pol) * Math.cos(ph) * RLID,
      Math.cos(pol) * RLID,
      Math.sin(pol) * Math.sin(ph) * RLID,
    );
    const lash = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.75, 4), lashMat);
    lash.position.copy(pos);
    const out = pos.clone().normalize();
    lash.quaternion.setFromUnitVectors(V(0, 1, 0), V(out.x * 0.7, 0.9, out.z * 0.7).normalize());
    lash.position.addScaledVector(out, 0.2);
    lidPivot.add(lash);
  }
}
// oxygen bubbles raining onto the eye
const NB = 64;
const bubbleMat = new THREE.MeshStandardMaterial({
  color: 0x8ff0ff,
  emissive: 0x3fd6ff,
  emissiveIntensity: 1.1,
  roughness: 0.2,
});
const bubbles = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.16, 1), bubbleMat, NB);
bubbles.userData.noAO = true;
bubbles.frustumCulled = false;
cut.add(bubbles);
const bub = Array.from({ length: NB }, (_, i) => {
  const a = hash(i, 1) * Math.PI * 2;
  const rr = Math.sqrt(hash(i, 2)) * 2.5;
  return { x: Math.cos(a) * rr, z: Math.sin(a) * rr, ph: hash(i, 3), sp: 0.8 + hash(i, 4) * 0.5 };
});
// immune cells near the edge of the cornea (sleepy little white blobs)
const cells = [];
{
  const cellMat = flat(0xf6f4ff, { roughness: 0.6, emissive: 0xd8d0ff, emissiveIntensity: 0.15 });
  const eyeMat = flat(0x15151f);
  const lidM = flat(0xdcd6f2);
  for (let i = 0; i < 5; i++) {
    const g = new THREE.Group();
    const ph = 1.15 + (i - 2) * 0.32;
    const pol = 0.55;
    const rr = RS + 0.2;
    g.position.set(
      Math.sin(pol) * Math.cos(ph) * rr,
      SY + Math.cos(pol) * rr,
      Math.sin(pol) * Math.sin(ph) * rr,
    );
    const body = new THREE.Mesh(
      facet(jitter(new THREE.IcosahedronGeometry(0.34, 2), 0.04, 40 + i), 0.05, 40 + i),
      facetMat(cellMat),
    );
    body.scale.set(1, 0.85, 1);
    g.add(body);
    const face = new THREE.Group();
    g.add(face);
    const lidsC = [];
    for (const sx of [-1, 1]) {
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), eyeMat);
      e.position.set(sx * 0.11, 0.06, 0.28);
      face.add(e);
      const l = new THREE.Mesh(
        new THREE.SphereGeometry(0.068, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2),
        lidM,
      );
      l.position.copy(e.position);
      face.add(l);
      lidsC.push(l);
    }
    g.lookAt(V(0, SY, 9).add(V(0, 6, 0)));
    cut.add(g);
    cells.push({ g, lidsC, body, i });
  }
}
// "Z" sprites floating up from the sleepy cells
const zTex = (() => {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 128;
  const x = cv.getContext("2d");
  x.font = "900 110px Montserrat, sans-serif";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.lineWidth = 12;
  x.strokeStyle = "#2a1a4a";
  x.strokeText("Z", 64, 70);
  x.fillStyle = "#ffffff";
  x.fillText("Z", 64, 70);
  const tx = new THREE.CanvasTexture(cv);
  tx.colorSpace = THREE.SRGBColorSpace;
  return tx;
})();
const zs = Array.from({ length: 9 }, (_, i) => {
  const s = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: zTex, transparent: true, depthWrite: false }),
  );
  s.userData.noAO = true;
  cut.add(s);
  return { s, i };
});
// germs: green spiky blobs, multiply on the lens, then dive into the cornea
const NG = 40;
const germMat = flat(0x7fe04a, { roughness: 0.5, emissive: 0x4fb020, emissiveIntensity: 0.35 });
const germGeo = (() => {
  const g = new THREE.IcosahedronGeometry(0.2, 1);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const v = V(p.getX(i), p.getY(i), p.getZ(i));
    const k = 1 + 0.35 * Math.max(0, Math.sin(v.x * 40) * Math.sin(v.y * 37) * Math.sin(v.z * 31));
    v.multiplyScalar(k);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
})();
const germs = new THREE.InstancedMesh(germGeo, germMat, NG);
germs.frustumCulled = false;
front.add(germs);
const germInfo = Array.from({ length: NG }, (_, i) => ({
  ph: 0.3 + hash(i, 7) * 5.9,
  pol: 0.08 + Math.sqrt(hash(i, 8)) * 0.6,
  order: hash(i, 9),
}));
// cloudy spots where germs got into the cornea (Keratitis)
const spots = new THREE.InstancedMesh(
  new THREE.SphereGeometry(0.3, 10, 6),
  new THREE.MeshStandardMaterial({
    color: 0xe8d36a,
    roughness: 0.9,
    emissive: 0xb09020,
    emissiveIntensity: 0.35,
  }),
  NG,
);
spots.frustumCulled = false;
spots.userData.noAO = true;
front.add(spots);
// the amoeba: a translucent wobbly blob with a nucleus, crawling + eating
const amoeba = new THREE.Group();
front.add(amoeba);
const amGeo = new THREE.IcosahedronGeometry(0.7, 3);
const amBase = amGeo.attributes.position.array.slice();
const amMat = new THREE.MeshStandardMaterial({
  color: 0xff9ad0,
  roughness: 0.35,
  transparent: true,
  opacity: 0.82,
  emissive: 0xff4fa0,
  emissiveIntensity: 0.25,
  flatShading: true,
});
{
  const body = new THREE.Mesh(amGeo, amMat);
  body.castShadow = true;
  amoeba.add(body);
  const nuc = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.25, 1),
    flat(0x8a2a7a, { emissive: 0x5a1050, emissiveIntensity: 0.3 }),
  );
  nuc.position.set(0.05, 0.1, 0.1);
  amoeba.add(nuc);
  const mouthM = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.05, 6, 12), flat(0x5a1040));
  mouthM.position.set(0, 0.0, 0.6);
  amoeba.add(mouthM);
  amoeba.userData.mouth = mouthM;
}
// bite marks left behind the amoeba
const bites = new THREE.InstancedMesh(
  new THREE.SphereGeometry(0.3, 10, 6),
  new THREE.MeshStandardMaterial({
    color: 0x8a3a3a,
    roughness: 0.9,
    emissive: 0x501018,
    emissiveIntensity: 0.3,
  }),
  14,
);
bites.frustumCulled = false;
front.add(bites);
// 27 forgotten lenses sliding out from under the lid (the "Übrigens")
const NL = 27;
const stackMat = new THREE.MeshStandardMaterial({
  color: 0x7fd0ff,
  roughness: 0.1,
  transparent: true,
  opacity: 0.85,
  emissive: 0x2f8fff,
  emissiveIntensity: 0.3,
  side: THREE.DoubleSide,
});
const stack = [];
for (let i = 0; i < NL; i++) {
  const g = new THREE.Mesh(new THREE.SphereGeometry(1.1, 24, 6, 0, Math.PI * 2, 0, 0.75), stackMat);
  const edge = new THREE.Mesh(
    new THREE.TorusGeometry(Math.sin(0.75) * 1.1, 0.04, 4, 32),
    new THREE.MeshStandardMaterial({ color: 0xdff4ff, emissive: 0x6fc4ff, emissiveIntensity: 0.9 }),
  );
  edge.rotation.x = Math.PI / 2;
  edge.position.y = Math.cos(0.75) * 1.1;
  g.add(edge);
  g.renderOrder = 4;
  cut.add(g);
  stack.push(g);
}

// ================================================================ timing helpers
const inCut = (t) => {
  // which place the camera is in: the cut stage or the bedroom
  for (let i = shots.length - 1; i >= 0; i--)
    if (t >= shots[i].at) return (shots[i].orbit ? shots[i].orbit.c : shots[i].look)[2] > 40;
  return false;
};
// lid angle: 0 = shut over the cornea, -1.95 = tucked away (open)
function cutLidAngle(t) {
  if (t < T.klingt) return -1.95; // hook: open eye, lens on
  if (t < T.augenzu) return -1.95;
  if (t < T.quillt - 0.62)
    return lerp(-1.95, 0, smooth(ramp(t, T.augenzu + 0.05, T.augenzu + 0.95)));
  if (t < T.fakt) return -1.95; // lid out of the way so the cornea stays readable
  return lerp(-1.95, -0.75, smooth(ramp(t, T.fakt - 0.1, T.fakt + 0.4))); // half shut, lenses come out
}
function lidGlass(t) {
  // the lid turns see-through so the lens + cornea stay visible
  if (t < T.klingt) return 0.75;
  if (t < T.und1) return 0;
  if (t < T.fakt) return 0.85 * ramp(t, T.und1, T.und1 + 0.4);
  return 0;
}
const lensOn = (t) => (t < T.klingt ? 1 : t < T.und1 + 0.5 ? 0 : t < T.fakt ? 1 : 0);
// oxygen let through: 1 open, ~1/3 under the lid, a trickle with the lens
function passRate(t) {
  if (t < T.klingt) return 0.03;
  if (t < T.augenzu + 0.6) return 1;
  if (t < T.plastik) return 0.33;
  return 0.08;
}
const redness = (t) => {
  if (t < T.klingt) return 1;
  if (t < T.quillt) return 0;
  if (t < T.meistens) return smooth(ramp(t, T.quillt, T.knallrot + 0.2));
  if (t < T.also) return 0.35;
  return 0.35 * (1 - ramp(t, T.raus + 0.6, T.einpennst + 0.5));
};

// ================================================================ render
const applyCamera = shotCamera(shots, 1);
const m4 = new THREE.Matrix4();
const q = new THREE.Quaternion();
const qa = new THREE.Quaternion();
const up = V(0, 1, 0);
const tmpV = V(0, 0, 0);
const onSphere = (pol, ph, rr) =>
  V(Math.sin(pol) * Math.cos(ph) * rr, Math.cos(pol) * rr, Math.sin(pol) * Math.sin(ph) * rr);

function renderAt(t) {
  const red = redness(t);
  const isCut = inCut(t);

  // ---------------------------------------------------------- bedroom
  // lamp: on at frame 0, the hand clicks it off
  const lampOn = t < T.click ? 1 : 0;
  lampLight.intensity = 14 * lampOn;
  shadeMat.emissiveIntensity = 0.12 + 1.3 * lampOn;
  phoneScreen.emissiveIntensity = 0.45 + 0.25 * Math.sin(t * 1.3);
  // face eyes
  const shut = lidAt(t);
  for (const fe of faceEyes) {
    fe.lid.rotation.x = lerp(-1.25, 1.5, shut);
    const lensVisible = t < T.raus + 0.4 ? 1 : 0;
    fe.lens.visible = fe.ring.visible = lensVisible > 0;
  }
  eyeWhite.color.setRGB(1, lerp(1, 0.62, red), lerp(1, 0.6, red));
  eyeWhite.emissiveIntensity = 0.25 * red;
  veinMat.emissiveIntensity = 1.4 * red;
  faceEyes.forEach((fe) => fe.veins.scale.setScalar(lerp(0.6, 1.0, red)));
  // the sleeper breathes
  head.rotation.y = Math.PI / 2 + Math.sin(t * 1.1) * 0.012;
  head.position.y = HEAD[1] + Math.sin(t * 1.1) * 0.004;

  // hand: switches the lamp off (shot 1), later puts the lens into its case
  const sw = V(LAMP[0] + 0.16, LAMP[1] + 0.24, LAMP[2] + 0.2);
  hand.track(t, [
    {
      t: T.ein - 0.25,
      pos: [sw.x + 1.0, sw.y + 0.6, sw.z + 1.4],
      rot: [0.5, -2.4, 0],
      pose: "open",
    },
    {
      t: T.click - 0.12,
      pos: [sw.x + 0.18, sw.y + 0.14, sw.z + 0.28],
      rot: [0.6, -2.4, 0],
      pose: "point",
    },
    { t: T.click, pos: [sw.x + 0.1, sw.y + 0.07, sw.z + 0.18], rot: [0.6, -2.4, 0], pose: "press" },
    {
      t: T.click + 0.35,
      pos: [sw.x + 0.5, sw.y + 0.35, sw.z + 0.8],
      rot: [0.5, -2.4, 0],
      pose: "point",
    },
    {
      t: T.erstickt,
      pos: [sw.x + 1.2, sw.y + 0.6, sw.z + 1.6],
      rot: [0.4, -2.4, 0],
      pose: "open",
      out: true,
    },
    {
      t: T.also - 0.3,
      pos: [CASE[0] + 1.3, CASE[1] + 0.9, CASE[2] + 1.2],
      rot: [0.5, -2.2, 0],
      pose: "grab",
    },
    {
      t: T.raus + 0.1,
      pos: [CASE[0] + 0.45, CASE[1] + 0.45, CASE[2] + 0.35],
      rot: [0.6, -2.2, 0],
      pose: "grab",
    },
    {
      t: T.raus + 0.55,
      pos: [CASE[0] + 0.32, CASE[1] + 0.32, CASE[2] + 0.25],
      rot: [0.6, -2.2, 0],
      pose: "open",
    },
    {
      t: T.raus + 0.8,
      pos: [CASE[0] + 0.3, CASE[1] + 0.36, CASE[2] + 0.1],
      rot: [0.7, -2.2, 0],
      pose: "press",
    },
    {
      t: T.einpennst + 0.2,
      pos: [CASE[0] + 1.3, CASE[1] + 0.9, CASE[2] + 1.2],
      rot: [0.5, -2.2, 0],
      pose: "open",
      out: true,
    },
  ]);
  // the little lens: held in the fingertips, dropped into the right cup
  if (t >= T.also - 0.3 && t < T.raus + 0.85) {
    tinyLens.visible = true;
    const k = smooth(ramp(t, T.raus + 0.3, T.raus + 0.55));
    hand.group.updateMatrixWorld();
    const tip = V(0.0, -0.05, 0.42).applyMatrix4(hand.group.children[0].matrixWorld);
    tmpV.set(CASE[0] + 0.15, CASE[1] + 0.2, CASE[2]);
    tinyLens.position.copy(tip).lerp(tmpV, k);
    tinyLens.rotation.set(Math.PI, 0, 0);
  } else tinyLens.visible = false;
  // case lids: open until the lens is in, then snap shut
  const shutK = t < T.also - 0.4 ? 1 : outBack(clamp01((t - (T.raus + 0.75)) / 0.15));
  caseLids.forEach(({ pivot }) => (pivot.rotation.x = lerp(-1.9, 0, shutK)));

  // dice: tumble in over the duvet on "Glücksspiel"
  dice.forEach((d, i) => {
    const t0 = T.gluecksspiel - 0.15 + i * 0.08;
    const vis = t >= t0 && t < T.also;
    d.visible = vis;
    if (!vis) return;
    const u = clamp01((t - t0) / 0.5);
    const land = V(1.3 + i * 0.75, 3.05 + i * 0.05, 1.0 + i * 0.45);
    const startP = V(2.8 + i * 0.4, 4.8, 2.6);
    const p = startP.clone().lerp(land, u);
    p.y += Math.sin(u * Math.PI) * 0.4 * (1 - u);
    const settle = clamp01((t - t0 - 0.5) / 0.4);
    if (u >= 1) p.y = land.y + Math.abs(Math.sin(settle * Math.PI * 2)) * 0.12 * (1 - settle);
    d.position.copy(p);
    const spin = (1 - smooth(clamp01((t - t0) / 0.9))) * 9;
    d.rotation.set(spin * 1.3 + i, spin * 0.7, spin + i * 2);
    if (t - t0 > 0.9) d.rotation.set(i ? Math.PI / 2 : 0, 0.4 + i * 0.6, 0);
  });

  // ---------------------------------------------------------- cut stage
  cut.visible = isCut;
  if (isCut) {
    // swelling (Folge 2) + its wobble
    const swell =
      t >= T.quillt && t < T.meistens
        ? smooth(ramp(t, T.quillt, T.quillt + 0.6))
        : t < T.klingt
          ? 0.4
          : 0;
    const wob =
      t >= T.quillt && t < T.quillt + 0.8
        ? Math.sin((t - T.quillt) * 30) * 0.02 * (1 - (t - T.quillt) / 0.8)
        : 0;
    front.scale.set(1 + 0.05 * swell + wob, 1 + 0.08 * swell - wob, 1 + 0.05 * swell + wob);
    corneaMat.color.setRGB(
      lerp(0.56, 0.95, red * 0.6),
      lerp(0.86, 0.7, red * 0.6),
      lerp(1, 0.85, red * 0.6),
    );
    corneaMat.opacity = 0.24 + 0.2 * swell;
    // eyeball redness
    scleraF.color.setRGB(1, lerp(1, 0.42, red), lerp(1, 0.42, red));
    scleraF.emissiveIntensity = 0.3 * red;
    cutVeinMat.emissiveIntensity = 0.1 + 1.2 * red;

    // lid
    lidPivot.rotation.z = cutLidAngle(t);
    lidPivot.visible = lidPivot.rotation.z > -1.9;
    const glass = clamp01(lidGlass(t));
    lidF.opacity = lerp(1, 0.22, glass);
    lidF.depthWrite = glass < 0.05;
    // lens: drops onto the eye on "Plastik" (squash), sits until the fact
    const lensK = lensOn(t);
    lens.visible = lensK > 0 || (t >= T.und1 + 0.5 && t < T.fakt);
    if (t >= T.und1 + 0.5 && t < T.plastik + 0.6) {
      const drop = smooth(ramp(t, T.plastik - 0.45, T.plastik + 0.02));
      lens.position.y = lerp(3.5, 0, drop);
      lens.visible = t >= T.plastik - 0.45;
      if (t > T.plastik) lens.scale.copy(squash(t, T.plastik, 0.6));
      else lens.scale.setScalar(1);
    } else {
      lens.position.y = 0;
      lens.scale.setScalar(1);
    }
    crust.visible = t >= T.fest - 0.2 && t < T.rate;
    crust.scale.setScalar(t >= T.fest - 0.2 ? smooth(ramp(t, T.fest - 0.2, T.fest + 0.3)) : 0);

    // breathing glow while the eye is open
    breathMat.opacity = t >= T.klingt && t < T.augenzu + 0.9 ? 0.18 + 0.14 * Math.sin(t * 5) : 0;

    // oxygen bubbles
    const bubVis = t < T.quillt ? 1 : 0;
    const surfBase = (x, z) => {
      const rr = Math.hypot(x, z);
      let s = CY + Math.sqrt(Math.max(0, R * R - rr * rr));
      if (lens.visible && t >= T.plastik) s = CY + Math.sqrt(Math.max(0, RL * RL - rr * rr));
      if (cutLidAngle(t) > -0.3) s = CY + Math.sqrt(Math.max(0, RLID * RLID - rr * rr));
      return s + 0.16;
    };
    for (let i = 0; i < NB; i++) {
      const b = bub[i];
      const P = 1.6 / b.sp;
      const cyc = t / P + b.ph;
      const n = Math.floor(cyc);
      const u = cyc - n;
      const hitT = (n + 0.55 - b.ph) * P;
      const pass = hash(i, n * 13 + 5) < passRate(hitT);
      const ys = surfBase(b.x, b.z);
      let x = b.x;
      let z = b.z;
      let y;
      let s = 1;
      if (u < 0.55) y = lerp(8.5, ys, smooth(u / 0.55) * 0.3 + (u / 0.55) * 0.7);
      else if (pass) {
        const k = (u - 0.55) / 0.3;
        y = ys - 0.4 * Math.min(1, k);
        s = Math.max(0, 1 - k);
      } else {
        const k = (u - 0.55) / 0.45;
        y = ys + Math.sin(k * Math.PI * 0.9) * 2.2 + k * 1.5;
        x = b.x * (1 + k * 0.9);
        z = b.z * (1 + k * 0.9);
        s = 1 - k * 0.6;
      }
      if (!bubVis || s <= 0.01) s = 0.0001;
      m4.compose(V(x, y, z), q, V(s, s, s));
      bubbles.setMatrixAt(i, m4);
    }
    bubbles.instanceMatrix.needsUpdate = true;

    // sleepy immune cells
    cells.forEach(({ g, lidsC, body, i }) => {
      const vis = t >= T.quillt && t < T.folge;
      g.visible = vis;
      if (!vis) return;
      const sleepy = smooth(ramp(t, T.schlaeft - 0.1, T.schlaeft + 0.4));
      lidsC.forEach((l) => (l.rotation.x = lerp(-1.2, 0.1, 0.35 + 0.65 * sleepy)));
      const sway = Math.sin(t * 2 + i) * 0.08 + sleepy * 0.35 * (i % 2 ? 1 : -1);
      body.rotation.z = sway;
      body.scale.set(1 + 0.04 * Math.sin(t * 3 + i), 0.85 - 0.04 * Math.sin(t * 3 + i), 1);
    });
    zs.forEach(({ s, i }) => {
      const cell = cells[i % cells.length];
      const t0 = T.schlaeft + 0.1 + (i % 3) * 0.3;
      const u = ((t - t0) / 1.4) % 1;
      const vis = t >= t0 && t < T.folge;
      s.visible = vis;
      if (!vis) return;
      s.position.copy(cell.g.position).add(V(0.25 + u * 0.4, 0.4 + u * 1.3, 0.1));
      const sz = 0.25 + u * 0.25;
      s.scale.set(sz, sz, sz);
      s.material.opacity = Math.sin(u * Math.PI);
    });

    // germs: multiply on the lens (Rate mal), dive in (Keime), stay as spots
    const nShow =
      t < T.rate
        ? 0
        : Math.round(lerp(1, NG, clamp01((t - T.rate - 0.4) / (T.keime - T.rate - 0.6))));
    for (let i = 0; i < NG; i++) {
      const gi = germInfo[i];
      const born = i < nShow && t >= T.rate && t < T.meistens;
      const dive = smooth(ramp(t, T.keime + gi.order * 0.8, T.keime + 0.6 + gi.order * 0.8));
      const rr = lerp(RL + 0.18, R - 0.18, dive);
      const wob = Math.sin(t * 6 + i) * 0.03;
      const p = onSphere(gi.pol + wob, gi.ph + Math.sin(t * 0.8 + i) * 0.04, rr);
      let s = born
        ? outBack(clamp01((t - (T.rate + 0.4 + (i / NG) * (T.keime - T.rate - 0.6))) / 0.3))
        : 0;
      if (t > T.keratitis + 0.5) s *= 1 - ramp(t, T.keratitis + 0.5, T.keratitis + 1.2);
      qa.setFromUnitVectors(up, p.clone().normalize());
      q.setFromAxisAngle(up, t * 2 + i).premultiply(qa);
      m4.compose(p, q, V(s + 0.0001, s + 0.0001, s + 0.0001));
      germs.setMatrixAt(i, m4);
      // the spot it leaves
      const sk = t >= T.keime && t < T.meistens ? dive * (0.7 + 0.3 * hash(i, 11)) : 0;
      const sp = onSphere(gi.pol, gi.ph, R - 0.12);
      qa.setFromUnitVectors(up, sp.clone().normalize());
      m4.compose(sp, qa, V(sk, sk * 0.25, sk));
      spots.setMatrixAt(i, m4);
      q.identity();
    }
    germs.instanceMatrix.needsUpdate = true;
    spots.instanceMatrix.needsUpdate = true;

    // the amoeba
    const amVis = t >= T.amoeben - 0.14 && t < T.meistens;
    amoeba.visible = amVis;
    if (amVis) {
      const u = clamp01((t - (T.amoeben - 0.14)) / (T.meistens - T.amoeben + 0.14));
      const pol = lerp(0.42, 0.22, u);
      const ph = lerp(0.35, 0.95, u);
      const p = onSphere(pol, ph, R + 0.25);
      amoeba.position.copy(p);
      qa.setFromUnitVectors(up, p.clone().normalize());
      amoeba.quaternion.copy(qa);
      amoeba.rotateY(-1.2);
      const pa = amGeo.attributes.position;
      for (let i = 0; i < pa.count; i++) {
        const x = amBase[i * 3];
        const y = amBase[i * 3 + 1];
        const z = amBase[i * 3 + 2];
        const k =
          1 +
          0.22 * Math.sin(x * 5 + t * 3.1) * Math.sin(z * 4 - t * 2.3) +
          0.35 *
            Math.max(0, Math.sin(Math.atan2(z, x) * 3 + t * 1.6)) *
            Math.max(0, 1 - Math.abs(y) * 1.6);
        pa.setXYZ(i, x * k, y * k * 0.62, z * k);
      }
      pa.needsUpdate = true;
      amGeo.computeVertexNormals();
      const chew = Math.abs(Math.sin(t * 7));
      amoeba.userData.mouth.scale.set(1, 0.4 + chew, 1);
      amoeba.scale.setScalar(squash(t, T.amoeben - 0.05, 0.6).x);
      for (let i = 0; i < 14; i++) {
        const bu = i / 14;
        const vis = u > bu + 0.04;
        const bp = onSphere(lerp(0.42, 0.22, bu), lerp(0.35, 0.95, bu), R - 0.05);
        qa.setFromUnitVectors(up, bp.clone().normalize());
        const sk = vis ? 1 : 0.0001;
        m4.compose(bp, qa, V(sk, sk * 0.3, sk));
        bites.setMatrixAt(i, m4);
      }
      bites.instanceMatrix.needsUpdate = true;
      bites.visible = true;
    } else bites.visible = t >= T.amoeben && t < T.meistens;

    // the 27 forgotten lenses (Übrigens): out from under the shut lid
    for (let i = 0; i < NL; i++) {
      const g = stack[i];
      const t0 = T.fakt + 0.35 + i * 0.09;
      const vis = t >= t0;
      g.visible = vis;
      if (!vis) continue;
      const k = smooth(clamp01((t - t0) / 0.45));
      const from = onSphere(0.95, 0.4, RLID - 0.3).add(V(0, CY, 0));
      const to = V(3.6 + Math.sin(i * 0.7) * 0.06, 0.2 + i * 0.17, 2.2);
      g.position.copy(from).lerp(to, k);
      g.position.y += Math.sin(k * Math.PI) * 1.2;
      g.rotation.set(lerp(1.4, 0.12 * Math.sin(i), k), i * 0.3, lerp(0.8, 0.05 * Math.cos(i), k));
    }
  }

  // ---------------------------------------------------------- HUD
  // oxygen meter while it breathes / suffocates
  {
    const k = win(t, T.atmet, T.quillt - 0.62);
    const ox =
      t < T.augenzu
        ? 1
        : t < T.plastik
          ? lerp(1, 0.33, smooth(ramp(t, T.augenzu + 0.1, T.weniger + 0.6)))
          : lerp(0.33, 0.1, smooth(ramp(t, T.plastik, T.plastik + 0.6)));
    meter("o2", k, {
      label: "SAUERSTOFF",
      value: ox,
      x: 300,
      y: 430,
      width: 480,
      color: ox > 0.5 ? "#4fd6ff" : ox > 0.2 ? "#ffb02e" : "#ff3b5c",
    });
  }
  // infection risk ×1 → ×8
  {
    const k = win(t, T.rate + 0.3, T.keime);
    const v = Math.max(
      1,
      Math.min(8, Math.floor(1 + 7 * clamp01((t - T.rate - 0.4) / (T.achtmal - T.rate - 0.4)))),
    );
    counter("risk", k, {
      label: "INFEKTIONSRISIKO",
      value: `×${v}`,
      x: 300,
      y: 1260,
      color: v >= 8 ? "#ff3b5c" : "#ffd23f",
    });
  }
  // LED facts
  // forgotten lenses count up while they slide out from under the lid
  {
    const k = win(t, T.fakt + 0.3, T.ehrlich);
    const n = Math.max(0, Math.min(NL, Math.floor((t - (T.fakt + 0.35)) / 0.09) + 1));
    counter("lenses", k, {
      label: "VERGESSENE LINSEN",
      value: String(n),
      x: 120,
      y: 1260,
      color: n >= 27 ? "#4fd6ff" : "#ffffff",
    });
  }
  showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
