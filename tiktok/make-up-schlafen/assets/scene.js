// #87 Mit Make-up schlafen (Format B). Three places:
// 1. the living room at dawn (set.js): the made-up sleeper drops onto the
//    throw pillow, presses her face in, the pillow shows the stains; later
//    the mascara crumbles into the eye, the lid swells, she wakes up fine,
//    pimples pop up when it's every night;
// 2. far away at SKIN a giant skin cross-section: three pores, oil and old
//    cells pushing up, a lid of powder closing them;
// 3. at LIDSET a giant eye + lid cross-section: lumps of old mascara grow in
//    the lid over 25 years, tweezers pull one out (the "Übrigens").
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
  rng,
  real,
  roundedBox,
  squash,
  puff,
  showNope,
  showPanel,
  LED,
  labels,
  highlights,
  shotCamera,
  renderFrame,
  start,
  outBack,
} from "./world.js";
import "./set.js";
import { counter } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS, HEAD, PILLOW, SKIN, LIDSET, CHEEK_UP } from "./beats.js";

highlights(HIGHLIGHTS);
const applyCamera = shotCamera(shots);
const put = (geo, mat, x, y, z, parent = scene, shadow = true) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};
const canvasTex = (w, h, draw) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};
const Zup = V(0, 0, 1);
const Yup = V(0, 1, 0);

// ================================================================ the pillow
const pillow = new THREE.Group();
pillow.position.set(...PILLOW);
scene.add(pillow);
{
  const g = new THREE.BoxGeometry(3.4, 1.0, 2.8, 28, 6, 24);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const e = Math.max(Math.abs(x) / 1.7, Math.abs(z) / 1.4);
    const k = 1 - 0.7 * e ** 5;
    const pinch = 1 - 0.05 * (Math.abs(y) / 0.5);
    p.setXYZ(i, x * pinch, y * k, z * pinch);
  }
  g.computeVertexNormals();
  const linen = canvasTex(512, 512, (c, w, h) => {
    c.fillStyle = "#f3ebdf";
    c.fillRect(0, 0, w, h);
    const r = rng(3);
    for (let i = 0; i < 900; i++) {
      c.strokeStyle = `rgba(${170 + r() * 40},${150 + r() * 30},${120 + r() * 30},.12)`;
      c.lineWidth = 1;
      const y = r() * h;
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(w, y + (r() - 0.5) * 4);
      c.stroke();
    }
    // piping along the edges
    c.strokeStyle = "rgba(190,160,130,.5)";
    c.lineWidth = 6;
    c.strokeRect(8, 8, w - 16, h - 16);
  });
  linen.wrapS = linen.wrapT = THREE.RepeatWrapping;
  const body = put(g, real.fabric(0xffffff, { map: linen }), 0, 0, 0, pillow);
  body.name = "pillow";
}
// the stains: one decal per make-up, appearing on the word (top of pillow, y 0.5)
const STAIN = [-0.05, 0.506, 0.85];
function stainTex(draw) {
  return canvasTex(1024, 768, (c, w, h) => {
    c.clearRect(0, 0, w, h);
    draw(c, w, h, rng(w + h));
  });
}
const blob = (c, x, y, rx, ry, col, a = 0) => {
  c.save();
  c.translate(x, y);
  c.rotate(a);
  c.scale(1, ry / rx);
  const g = c.createRadialGradient(0, 0, 0, 0, 0, rx);
  g.addColorStop(0, col);
  g.addColorStop(
    0.65,
    col.replace(/[\d.]+\)$/, (m) => `${parseFloat(m) * 0.6})`),
  );
  g.addColorStop(1, col.replace(/[\d.]+\)$/, "0)"));
  c.fillStyle = g;
  c.beginPath();
  c.arc(0, 0, rx, 0, Math.PI * 2);
  c.fill();
  c.restore();
};
const stains = [
  // foundation: a big tan smear where the cheek pressed
  stainTex((c, w, h, r) => {
    blob(c, 520, 380, 330, 210, "rgba(196,138,98,.78)", -0.2);
    for (let i = 0; i < 9; i++)
      blob(
        c,
        330 + r() * 380,
        240 + r() * 260,
        70 + r() * 90,
        40 + r() * 50,
        "rgba(186,128,90,.45)",
        r(),
      );
    blob(c, 760, 300, 160, 60, "rgba(196,138,98,.5)", -0.5);
  }),
  // rouge: pink cheek blush
  stainTex((c) => {
    blob(c, 640, 470, 140, 95, "rgba(226,88,118,.7)", 0.3);
    blob(c, 590, 500, 80, 50, "rgba(236,100,128,.55)", 0.1);
  }),
  // eyeshadow: violet shimmer + glitter
  stainTex((c, w, h, r) => {
    blob(c, 400, 250, 150, 70, "rgba(128,70,170,.75)", -0.4);
    blob(c, 470, 230, 90, 40, "rgba(170,110,200,.55)", -0.3);
    for (let i = 0; i < 90; i++) {
      c.fillStyle = `rgba(255,${220 + r() * 35},255,${0.5 + r() * 0.5})`;
      c.fillRect(300 + r() * 220, 180 + r() * 130, 3, 3);
    }
  }),
  // lipstick kiss + mascara streaks
  stainTex((c, w, h, r) => {
    c.save();
    c.translate(330, 560);
    c.rotate(-0.25);
    c.fillStyle = "rgba(178,18,42,.92)";
    // upper lip: two lobes, lower lip: one
    c.beginPath();
    c.moveTo(-110, 0);
    c.bezierCurveTo(-80, -55, -30, -50, 0, -22);
    c.bezierCurveTo(30, -50, 80, -55, 110, 0);
    c.bezierCurveTo(60, -8, -60, -8, -110, 0);
    c.fill();
    c.beginPath();
    c.moveTo(-105, 8);
    c.bezierCurveTo(-60, 70, 60, 70, 105, 8);
    c.bezierCurveTo(50, 18, -50, 18, -105, 8);
    c.fill();
    c.strokeStyle = "rgba(120,10,30,.5)";
    c.lineWidth = 2;
    for (let i = 0; i < 14; i++) {
      c.beginPath();
      c.moveTo(-90 + i * 13, -10);
      c.lineTo(-92 + i * 13, 40);
      c.stroke();
    }
    c.restore();
    c.strokeStyle = "rgba(18,14,20,.88)";
    c.lineCap = "round";
    for (let i = 0; i < 9; i++) {
      c.lineWidth = 3 + r() * 5;
      const x = 360 + i * 14 + r() * 10;
      c.beginPath();
      c.moveTo(x, 300);
      c.quadraticCurveTo(x + 20, 330, x + 10 + r() * 30, 360 + r() * 30);
      c.stroke();
    }
  }),
].map((map, i) => {
  const m = put(
    new THREE.PlaneGeometry(2.0, 1.5),
    new THREE.MeshPhysicalMaterial({
      map,
      transparent: true,
      opacity: 0,
      roughness: i === 3 ? 0.35 : 0.95,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2 - i,
    }),
    STAIN[0],
    STAIN[1] + i * 0.002,
    STAIN[2],
    scene,
    false,
  );
  m.rotation.x = -Math.PI / 2;
  m.userData.noAO = true;
  return m;
});
const stainTimes = [T.found1, T.rouge, T.lidschatten, T.bezug];

// ================================================================ the sleeper
const head = new THREE.Group(); // built at identity, posed in renderAt
scene.add(head);
const R = [0.68, 0.84, 0.76]; // skull semi-axes
const ePt = (d, out = 0) => {
  const n = V(...d).normalize();
  return V(n.x * R[0], n.y * R[1], n.z * R[2]).multiplyScalar(1 + out);
};
const dirQ = (d) => new THREE.Quaternion().setFromUnitVectors(Zup, V(...d).normalize());
const EYES = [
  [0.36, 0.13, 0.92],
  [-0.36, 0.13, 0.92],
];
// face paint: foundation, blush, eyeshadow, brows on an equirect map of the skull
const faceMap = canvasTex(1024, 512, (c, W, H) => {
  const uv = (d) => {
    const n = V(...d).normalize();
    let ph = Math.atan2(n.z, -n.x);
    if (ph < 0) ph += Math.PI * 2;
    return [(ph / (Math.PI * 2)) * W, (Math.acos(n.y) / Math.PI) * H];
  };
  c.fillStyle = "#e7ad8c";
  c.fillRect(0, 0, W, H);
  const r = rng(9);
  for (let i = 0; i < 4000; i++) {
    c.fillStyle = `rgba(${200 + r() * 40},${130 + r() * 30},${110 + r() * 30},.08)`;
    c.fillRect(r() * W, r() * H, 2, 2);
  }
  // foundation: slightly lighter, even over the face
  const [fx, fy] = uv([0, -0.05, 1]);
  blob(c, fx, fy, 150, 120, "rgba(240,190,160,.55)");
  for (const s of [1, -1]) {
    const [bx, by] = uv([s * 0.55, -0.2, 0.81]);
    blob(c, bx, by, 46, 30, "rgba(226,92,112,.62)", s * 0.3); // rouge
    const [ex, ey] = uv([s * 0.36, 0.2, 0.9]);
    blob(c, ex, ey, 40, 20, "rgba(122,66,160,.85)"); // eyeshadow
    blob(c, ex + s * 10, ey - 6, 28, 12, "rgba(190,130,215,.55)");
    for (let i = 0; i < 40; i++) {
      c.fillStyle = "rgba(255,240,255,.8)";
      c.fillRect(ex - 30 + r() * 60, ey - 14 + r() * 24, 2, 2);
    }
    // brow
    const [wx, wy] = uv([s * 0.36, 0.34, 0.86]);
    c.strokeStyle = "rgba(58,36,24,.95)";
    c.lineWidth = 9;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(wx - 34, wy + 6);
    c.quadraticCurveTo(wx, wy - 8, wx + 34, wy + 2);
    c.stroke();
  }
});
const skinMat = real.skin(0xffffff, { map: faceMap });
const skinPlain = real.skin(0xe7ad8c);
{
  const skull = put(new THREE.SphereGeometry(0.8, 64, 48), skinMat, 0, 0, 0, head);
  skull.scale.set(R[0] / 0.8, R[1] / 0.8, R[2] / 0.8);
  // jaw / chin
  const jaw = put(new THREE.SphereGeometry(0.42, 40, 28), skinPlain, 0, -0.42, 0.18, head);
  jaw.scale.set(1.0, 0.82, 1.05);
  // nose: a soft wedge
  const nose = put(new THREE.SphereGeometry(0.1, 28, 20), skinPlain, 0, -0.04, 0.69, head);
  nose.scale.set(0.55, 1.5, 0.8);
  put(new THREE.SphereGeometry(0.07, 24, 18), skinPlain, 0, -0.17, 0.75, head).scale.set(
    1.15,
    0.9,
    0.85,
  );
  // ears
  for (const s of [-1, 1]) {
    const ear = put(new THREE.SphereGeometry(0.15, 24, 18), skinPlain, s * 0.68, 0.02, -0.02, head);
    ear.scale.set(0.35, 1, 0.65);
    // a small gold hoop
    const hoop = put(
      new THREE.TorusGeometry(0.06, 0.012, 10, 24),
      real.metal(0xe2bd63, { roughness: 0.15 }),
      s * 0.7,
      -0.17,
      0.02,
      head,
    );
    hoop.rotation.y = Math.PI / 2;
  }
  // lips: glossy red
  const lipMat = real.gloss(0xb3182f, { roughness: 0.22 });
  const lp = ePt([0, -0.5, 0.866], -0.01);
  const up = put(
    new THREE.SphereGeometry(0.1, 32, 16),
    lipMat,
    lp.x,
    lp.y + 0.022,
    lp.z + 0.03,
    head,
  );
  up.scale.set(1.45, 0.3, 0.26);
  const lo = put(
    new THREE.SphereGeometry(0.1, 32, 16),
    lipMat,
    lp.x,
    lp.y - 0.02,
    lp.z + 0.025,
    head,
  );
  lo.scale.set(1.3, 0.36, 0.3);
  // hair: a dark brown cap + long strands spilling over the pillow (head-local +y → toward the armrest)
  const hairMat = real.fabric(0x3a2318, {
    sheenRoughness: 0.3,
    sheenColor: new THREE.Color(0x8a5a3a),
  });
  const cap = put(
    new THREE.SphereGeometry(0.83, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.52),
    hairMat,
    0,
    0.02,
    -0.04,
    head,
  );
  cap.scale.set(R[0] / 0.78, R[1] / 0.78, R[2] / 0.78);
  cap.rotation.x = -0.42;
  const back = put(new THREE.SphereGeometry(0.66, 40, 28), hairMat, 0, 0.05, -0.3, head);
  back.scale.set(1.05, 1.1, 0.8);
  const r = rng(14);
  for (let i = 0; i < 9; i++) {
    const x0 = -0.4 + i * 0.1;
    const pts = [
      V(x0, 0.75, -0.15 + r() * 0.2),
      V(x0 - 0.2, 1.1, -0.1 + r() * 0.3),
      V(-0.45 - r() * 0.1, 1.45 + r() * 0.2, -0.3 + r() * 0.6),
      V(-0.58, 1.75 + r() * 0.35, -0.5 + r() * 0.9),
    ];
    put(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.07 + r() * 0.03, 10),
      hairMat,
      0,
      0,
      0,
      head,
    );
  }
  // neck + shoulder in a gold sequin top (under the blanket further on)
  const neck = put(
    new THREE.CylinderGeometry(0.26, 0.3, 0.8, 24),
    skinPlain,
    0.02,
    -0.82,
    -0.12,
    head,
  );
  neck.rotation.x = 0.12;
  const sh = put(
    new THREE.SphereGeometry(0.6, 40, 28),
    real.gloss(0xc9a24a, { metalness: 0.7, roughness: 0.25 }),
    -0.1,
    -1.4,
    -0.35,
    head,
  );
  sh.scale.set(0.9, 0.8, 0.7);
}
// eyes: white ball, iris, pupil, red veins; upper lid with mascara lashes, lower lid
const eyeWhite = real.ceramic(0xfbf8f4, { emissive: 0xff2030, emissiveIntensity: 0 });
const veinMat = flat(0xd23038, { emissive: 0xff1a2a, emissiveIntensity: 0 });
const lidMat = real.skin(0xc694a8, { sheen: 0.9, sheenColor: new THREE.Color(0xe8c8ff) }); // eyeshadow on the lid
const lidBase = new THREE.Color(0xc694a8);
const lidRed = new THREE.Color(0xd4645e);
const lashMat = real.gloss(0x0a0a0d, { roughness: 0.2 });
const lashWet = new THREE.Color(0x0a0a0d);
const lashDry = new THREE.Color(0x45434a);
const eyes = EYES.map((d, ei) => {
  const g = new THREE.Group();
  g.position.copy(ePt(d, -0.075));
  g.quaternion.copy(dirQ(d));
  head.add(g);
  const ball = put(new THREE.SphereGeometry(0.11, 32, 24), eyeWhite, 0, 0, 0, g, false);
  ball.scale.z = 0.8;
  const iris = put(
    new THREE.CircleGeometry(0.05, 32),
    real.gloss(0x5a3a22, { roughness: 0.2 }),
    0,
    0,
    0.0885,
    g,
    false,
  );
  put(new THREE.CircleGeometry(0.021, 24), flat(0x08080a), 0, 0, 0.089, g, false);
  put(
    new THREE.CircleGeometry(0.007, 12),
    flat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.8 }),
    0.015,
    0.015,
    0.0895,
    g,
    false,
  );
  iris.userData.noAO = true;
  const veins = new THREE.Group();
  g.add(veins);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    const pts = [];
    for (let k = 0; k <= 6; k++) {
      const rr = 0.106 - k * 0.008;
      const aa = a + Math.sin(k * 1.7 + i) * 0.14;
      pts.push(
        V(
          Math.cos(aa) * rr,
          Math.sin(aa) * rr,
          Math.sqrt(Math.max(0, 0.11 ** 2 - rr * rr)) * 0.8 + 0.002,
        ),
      );
    }
    veins.add(
      new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.0022, 4),
        veinMat,
      ),
    );
  }
  const lid = new THREE.Group();
  g.add(lid);
  const shell = put(
    new THREE.SphereGeometry(0.12, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    lidMat,
    0,
    0,
    0,
    lid,
  );
  shell.scale.z = 0.86;
  // lash line + lashes along the front rim, curling outwards
  const tips = [];
  for (let i = 0; i < 18; i++) {
    const b = Math.PI * (0.12 + (i / 17) * 0.76);
    const base = V(Math.cos(b) * 0.119, 0, Math.sin(b) * 0.103);
    const dir = V(Math.cos(b) * 0.15, 0.35, Math.sin(b)).normalize();
    const len = 0.055 + 0.02 * Math.sin((i / 17) * Math.PI);
    const cone = new THREE.ConeGeometry(0.0055, len, 6);
    cone.translate(0, len / 2, 0);
    const lash = put(cone, lashMat, base.x, base.y, base.z, lid, false);
    lash.quaternion.setFromUnitVectors(Yup, dir);
    if (i % 3 === 1)
      put(
        new THREE.SphereGeometry(0.008, 10, 8),
        lashMat,
        ...base
          .clone()
          .addScaledVector(dir, len * 0.6)
          .toArray(),
        lid,
        false,
      ); // clumps
    tips.push(base.clone().addScaledVector(dir, len));
  }
  const liner = put(
    new THREE.TorusGeometry(0.118, 0.007, 8, 40, Math.PI * 0.8),
    lashMat,
    0,
    0,
    0,
    lid,
    false,
  );
  liner.rotation.set(Math.PI / 2, 0, Math.PI * 0.1);
  liner.scale.y = 0.87;
  const lower = put(
    new THREE.SphereGeometry(0.117, 32, 12, 0, Math.PI * 2, Math.PI * 0.66, Math.PI * 0.34),
    skinPlain,
    0,
    0,
    0,
    g,
  );
  lower.scale.z = 0.86;
  lower.rotation.x = -0.15;
  return { g, lid, veins, tips, ei };
});
const LID_CLOSED = 1.3;
const LID_OPEN = -0.25;
function closedAt(t) {
  if (t < T.kruemel) return 1;
  if (t < T.morgens) return 0.8 - 0.1 * Math.max(0, Math.sin((t - T.kruemel) * 14)); // twitching
  if (t < T.also)
    return (
      lerp(1, 0.45, smooth(ramp(t, T.morgens, T.morgens + 0.4))) +
      0.5 * pop(t, T.entzuenden + 0.7, T.entzuenden + 0.9, 0.06)
    );
  const blink = pop(t, T.harmlos + 0.5, T.harmlos + 0.68, 0.06);
  if (t < T.ehrlich) return lerp(0.45, 0.08, smooth(ramp(t, T.also, T.also + 0.5))) + 0.9 * blink;
  return 0.15;
}
// mascara crumbs (head-local; "down" on screen = head-local −x while she lies on her side)
const crumbs = (() => {
  const e = eyes[0];
  head.updateMatrixWorld(true);
  e.lid.rotation.x = LID_CLOSED;
  e.g.updateMatrixWorld(true);
  const tips = e.tips.map((p) => head.worldToLocal(e.lid.localToWorld(p.clone())));
  const center = e.g.position.clone();
  const out = V(...EYES[0]).normalize();
  const r = rng(41);
  const N = 34;
  const list = [];
  for (let i = 0; i < N; i++) {
    const second = i >= 22;
    const tip = tips[Math.floor(r() * tips.length)]
      .clone()
      .add(V((r() - 0.5) * 0.02, (r() - 0.5) * 0.02, 0));
    const end = second
      ? center
          .clone()
          .addScaledVector(out, 0.095)
          .add(V(-0.02 + r() * 0.045, (r() - 0.5) * 0.05, 0))
      : tip.clone().add(V(-0.06 - r() * 0.16, (r() - 0.5) * 0.04, -0.01 - r() * 0.02));
    list.push({
      tip,
      end,
      at: second ? T.kruemel + (i - 22) * 0.06 : T.broeselt + i * 0.035,
      s: 0.006 + r() * 0.006,
      spin: V(r() * 6, r() * 6, r() * 6),
    });
  }
  const im = new THREE.InstancedMesh(
    new THREE.DodecahedronGeometry(1, 0),
    real.plastic(0x141216, { roughness: 0.85, clearcoat: 0 }),
    N,
  );
  im.frustumCulled = false;
  im.castShadow = false;
  head.add(im);
  return { im, list };
})();
const m4 = new THREE.Matrix4();
const q4 = new THREE.Quaternion();
const e4 = new THREE.Euler();
function updateCrumbs(t) {
  const { im, list } = crumbs;
  list.forEach((c, i) => {
    const k = clamp01((t - c.at) / 0.7);
    const vis = t >= c.at && t < T.also ? 1 : 0;
    const p = c.tip.clone().lerp(c.end, smooth(k));
    p.x -= 0.03 * Math.sin(k * Math.PI); // a little hop off the lash
    e4.set(c.spin.x * k, c.spin.y * k, c.spin.z * k);
    q4.setFromEuler(e4);
    m4.compose(p, q4, V(1, 1, 1).multiplyScalar(c.s * vis + 1e-5));
    im.setMatrixAt(i, m4);
  });
  im.instanceMatrix.needsUpdate = true;
}
// pimples on the upper cheek (every night)
const pimples = [
  [0.5, -0.12, 0.86],
  [0.6, -0.26, 0.76],
  [0.44, -0.3, 0.85],
].map((d, i) => {
  const g = new THREE.Group();
  g.position.copy(ePt(d, -0.005));
  g.quaternion.copy(dirQ(d));
  head.add(g);
  const b = put(
    new THREE.SphereGeometry(0.04, 24, 16),
    real.skin(0xd2655c, { roughness: 0.4 }),
    0,
    0,
    0,
    g,
    false,
  );
  b.scale.z = 0.6;
  put(new THREE.SphereGeometry(0.014, 16, 12), real.ceramic(0xfff6e0), 0, 0, 0.022, g, false);
  return { g, at: T.pickel + i * 0.18 };
});
// soft warm fill on the face from the room side (the dawn comes from behind)
const faceFill = new THREE.PointLight(0xffd8c8, 7, 7, 1.3);
faceFill.position.set(1.6, 2.8, 3.2);
scene.add(faceFill);

// ================================================================ cut-away stages: shared backdrop
function cutStage(pos, col, glow) {
  const g = new THREE.Group();
  g.position.set(...pos);
  scene.add(g);
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(16, 32, 16),
    new THREE.MeshBasicMaterial({ color: col, side: THREE.BackSide, fog: false }),
  );
  g.add(dome);
  const halo = new THREE.Mesh(
    new THREE.CircleGeometry(9, 48),
    new THREE.MeshBasicMaterial({
      map: canvasTex(256, 256, (c, w, h) => {
        const gr = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
        gr.addColorStop(0, glow);
        gr.addColorStop(1, "rgba(0,0,0,0)");
        c.fillStyle = gr;
        c.fillRect(0, 0, w, h);
      }),
      transparent: true,
      depthWrite: false,
      fog: false,
    }),
  );
  halo.position.set(-1, 0, -7);
  g.add(halo);
  const key = new THREE.PointLight(0xfff0e6, 60, 22, 1.2);
  key.position.set(3, 5, 7);
  g.add(key);
  const rim = new THREE.PointLight(0xb07aff, 30, 16, 1.2);
  rim.position.set(-5, 3, -3);
  g.add(rim);
  const fill = new THREE.PointLight(0xff9ec0, 14, 14, 1.4);
  fill.position.set(4, -2, 4);
  g.add(fill);
  return g;
}

// ================================================================ the skin cross-section
const skinSet = cutStage(SKIN, 0x241430, "rgba(255,150,190,.55)");
const PX = [-2.4, 0, 2.4];
const hwAt = (y) => (y >= -0.5 ? 0.12 + 0.26 * ((y + 0.5) / 0.5) : y >= -1.9 ? 0.12 : 0);
function band(y0, y1, mat) {
  const ys = [];
  for (let k = 0; k <= 12; k++) ys.push(y1 + ((y0 - y1) * k) / 12);
  for (const b of [-0.5, -1.9, -1.9001]) if (b < y0 && b > y1) ys.push(b);
  ys.sort((a, b) => a - b);
  const walls = [
    (_y) => -4,
    ...PX.flatMap((px) => [(y) => px - hwAt(y), (y) => px + hwAt(y)]),
    (_y) => 4,
  ];
  for (let i = 0; i < walls.length; i += 2) {
    const L = walls[i];
    const Rw = walls[i + 1];
    const s = new THREE.Shape();
    s.moveTo(L(ys[0]), ys[0]);
    for (const y of ys) s.lineTo(Rw(y), y);
    for (const y of [...ys].reverse()) s.lineTo(L(y), y);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 2.6, bevelEnabled: false, curveSegments: 1 });
    geo.translate(0, 0, -1.3);
    put(geo, mat, 0, 0, 0, skinSet);
  }
}
band(0, -0.45, real.skin(0xf0c3a6));
band(-0.45, -2.5, real.skin(0xdc8f86, { roughness: 0.5 }));
put(roundedBox(8, 0.9, 2.6, 0.05), real.skin(0xf1d488, { roughness: 0.35 }), 0, -2.95, 0, skinSet);
{
  // fat lobules on the cut face + tiny blood vessels in the dermis
  const r = rng(5);
  for (let i = 0; i < 26; i++)
    put(
      new THREE.SphereGeometry(0.16 + r() * 0.1, 20, 14),
      real.skin(0xf6dd92, { roughness: 0.3 }),
      -3.7 + r() * 7.4,
      -2.95 + (r() - 0.5) * 0.6,
      1.3,
      skinSet,
    ).scale.z = 0.25;
  const vMat = real.gloss(0xb8202c, { roughness: 0.3 });
  for (let i = 0; i < 6; i++) {
    const y = -1.4 - r() * 0.9;
    const pts = [
      V(-4, y, 1.31),
      V(-1.5, y + (r() - 0.5) * 0.4, 1.31),
      V(1.5, y + (r() - 0.5) * 0.4, 1.31),
      V(4, y + (r() - 0.5) * 0.3, 1.31),
    ];
    put(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.035, 8),
      vMat,
      0,
      0,
      0,
      skinSet,
      false,
    );
  }
}
// hairs, oil glands, the oil plug (stacked slabs), powder layer + powder lids
const sebumMat = real.gloss(0xf0d77e, { roughness: 0.25, transmission: 0 });
const plugs = [];
const lids = [];
for (const px of PX) {
  const hair = put(
    new THREE.CylinderGeometry(0.025, 0.03, 3.4, 10),
    real.gloss(0x2e1e16),
    0,
    0,
    0,
    skinSet,
  );
  hair.position.set(px + 0.22, -0.2, 0.2);
  hair.rotation.z = -0.16;
  const gland = put(
    new THREE.SphereGeometry(0.24, 24, 18),
    sebumMat,
    px + 0.38,
    -1.25,
    1.25,
    skinSet,
  );
  gland.scale.set(1, 1.3, 0.35);
  const slabs = [];
  const N = 22;
  for (let i = 0; i < N; i++) {
    const y = -1.9 + (1.9 * (i + 0.5)) / N;
    const w = 2 * hwAt(y) * 0.94;
    slabs.push({
      m: put(new THREE.BoxGeometry(w, 1.9 / N + 0.005, 2.5), sebumMat, px, y, 0, skinSet, false),
      y,
    });
  }
  plugs.push(slabs);
  const lid = put(
    roundedBox(0.98, 0.17, 2.6, 0.07),
    real.plastic(0xdcab84, { roughness: 0.95, clearcoat: 0 }),
    px,
    1.6,
    0,
    skinSet,
  );
  lids.push(lid);
}
{
  const powder = real.plastic(0xdcab84, { roughness: 0.95, clearcoat: 0 });
  const edges = [-4, ...PX.flatMap((p) => [p - 0.38, p + 0.38]), 4];
  for (let i = 0; i < edges.length; i += 2) {
    const w = edges[i + 1] - edges[i];
    put(
      new THREE.BoxGeometry(w, 0.14, 2.6),
      powder,
      (edges[i] + edges[i + 1]) / 2,
      0.07,
      0,
      skinSet,
    );
  }
  const r = rng(8);
  const N = 320;
  const im = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(1, 1),
    real.plastic(0xffffff, { roughness: 0.9, clearcoat: 0 }),
    N,
  );
  const pal = [0xe2b38c, 0xd7a47c, 0xebc29e, 0xcf9a72].map((c) => new THREE.Color(c));
  for (let i = 0; i < N; i++) {
    let x = -3.9 + r() * 7.8;
    if (PX.some((p) => Math.abs(x - p) < 0.42)) x += 0.9;
    const s = 0.035 + r() * 0.03;
    m4.compose(V(x, 0.15 + s * 0.5, -1.25 + r() * 2.5), q4.identity(), V(s, s, s));
    im.setMatrixAt(i, m4);
    im.setColorAt(i, pal[i % 4]);
  }
  skinSet.add(im);
}
// dead skin cells peeling off the pore walls + oil droplets rising
const flakes = (() => {
  const r = rng(19);
  const N = 36;
  const im = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(1, 1, 0.18, 6),
    real.plastic(0xfbf3e6, { roughness: 0.8 }),
    N,
  );
  im.frustumCulled = false;
  skinSet.add(im);
  const list = Array.from({ length: N }, (_, i) => {
    const px = PX[i % 3];
    const y = -0.2 - r() * 1.4;
    const side = r() < 0.5 ? -1 : 1;
    return {
      px,
      y,
      side,
      z: -1 + r() * 2.2,
      at: T.zellen + r() * 0.8,
      s: 0.05 + r() * 0.03,
      sp: r() * 6,
    };
  });
  return { im, list };
})();
const drops = (() => {
  const N = 18;
  const im = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 16, 12), sebumMat, N);
  im.frustumCulled = false;
  skinSet.add(im);
  return { im, N };
})();
function oilLevel(t) {
  return -1.9 + 1.98 * smooth(ramp(t, T.fett, T.puder + 1.3));
}
function updateSkin(t) {
  const lvl = oilLevel(t);
  plugs.forEach((slabs, j) =>
    slabs.forEach(({ m, y }) => {
      m.visible = y < lvl - j * 0.05;
    }),
  );
  lids.forEach((lid, j) => {
    const a = T.puder - 0.1 + j * 0.12;
    const k = smooth(ramp(t, a, a + 0.45));
    const bulge = 0.09 * smooth(ramp(t, T.puder + 0.8, T.rate));
    lid.position.y = t < T.obendrauf ? 3 : lerp(1.6, 0.075, k) + bulge;
    lid.visible = t >= T.obendrauf;
  });
  const { im, list } = flakes;
  list.forEach((f, i) => {
    const k = smooth(clamp01((t - f.at) / 1.4));
    const x = f.px + f.side * lerp(hwAt(f.y), 0.03, k);
    const y = f.y + 0.25 * k;
    e4.set(f.sp + k * 2, 0, (Math.PI / 2) * f.side * (1 - k));
    q4.setFromEuler(e4);
    const vis = t >= f.at - 0.01 ? 1 : 0;
    m4.compose(V(x, y, f.z), q4, V(f.s, 1, f.s).multiplyScalar(vis + 1e-5));
    im.setMatrixAt(i, m4);
  });
  im.instanceMatrix.needsUpdate = true;
  // droplets: gland → pore centre → up to the oil level
  for (let i = 0; i < drops.N; i++) {
    const px = PX[i % 3];
    const ph = ((((t - T.fett) * 0.55 + i / drops.N) % 1) + 1) % 1;
    const on = t > T.fett && t < T.rate ? 1 : 0;
    const p =
      ph < 0.35
        ? V(lerp(px + 0.38, px, ph / 0.35), -1.25, lerp(1.1, 0.6, ph / 0.35))
        : V(px, lerp(-1.25, Math.min(lvl, 0.2), (ph - 0.35) / 0.65), 0.6);
    m4.compose(
      p,
      q4.identity(),
      V(1, 1, 1).multiplyScalar(0.07 * on * Math.sin(Math.PI * Math.min(1, ph * 1.2)) + 1e-5),
    );
    drops.im.setMatrixAt(i, m4);
  }
  drops.im.instanceMatrix.needsUpdate = true;
}

// ================================================================ the giant eye + lid cross-section
const lidSet = cutStage(LIDSET, 0x161a34, "rgba(140,170,255,.45)");
{
  // eyeball: the far half + the cut face (x = 0) with sclera, lens, iris
  const half = put(
    new THREE.SphereGeometry(1.6, 64, 48, -Math.PI / 2, Math.PI),
    real.ceramic(0xfbf8f2),
    0,
    0,
    0,
    lidSet,
  );
  half.rotation.y = 0;
  const cutTex = canvasTex(512, 512, (c) => {
    c.fillStyle = "#f6f1ea";
    c.beginPath();
    c.arc(256, 256, 256, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#b2484a";
    c.beginPath();
    c.arc(256, 256, 236, 0, Math.PI * 2);
    c.fill();
    const g = c.createRadialGradient(300, 256, 20, 256, 256, 228);
    g.addColorStop(0, "#e8f1f8");
    g.addColorStop(1, "#c7d7e6");
    c.fillStyle = g;
    c.beginPath();
    c.arc(256, 256, 228, 0, Math.PI * 2);
    c.fill();
    // front (canvas left = +z): iris + lens
    c.fillStyle = "#6b4426";
    c.fillRect(30, 150, 18, 212);
    c.fillStyle = "rgba(235,225,180,.9)";
    c.beginPath();
    c.ellipse(80, 256, 34, 82, 0, 0, Math.PI * 2);
    c.fill();
  });
  const disk = put(
    new THREE.CircleGeometry(1.6, 64),
    real.ceramic(0xffffff, { map: cutTex, roughness: 0.3 }),
    0,
    0,
    0,
    lidSet,
    false,
  );
  disk.rotation.y = Math.PI / 2;
  disk.position.x = 0.001;
}
// lid crescents (profile in z/y, extruded to −x), lumps, lashes
function crescent(rIn, rOut, a0, a1, colOut, colIn) {
  const s = new THREE.Shape();
  const n = 40;
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    const p = [Math.cos(a) * rOut, Math.sin(a) * rOut];
    if (i === 0) s.moveTo(...p);
    else s.lineTo(...p);
  }
  for (let i = n; i >= 0; i--) {
    const a = a0 + ((a1 - a0) * i) / n;
    s.lineTo(Math.cos(a) * rIn, Math.sin(a) * rIn);
  }
  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 1.7,
    bevelEnabled: true,
    bevelSize: 0.04,
    bevelThickness: 0.04,
    bevelSegments: 3,
    curveSegments: 1,
  });
  const m = put(geo, [real.skin(colOut), real.skin(colIn, { roughness: 0.35 })], 0, 0, 0.0, lidSet);
  m.rotation.y = -Math.PI / 2;
  return m;
}
const deg = Math.PI / 180;
crescent(1.66, 2.0, 12 * deg, 108 * deg, 0xe2a487, 0xd06a70);
crescent(1.66, 1.88, -62 * deg, -14 * deg, 0xe2a487, 0xd06a70);
// pink inner lining (conjunctiva) visible on the cut face
{
  const s = new THREE.Shape();
  for (let i = 0; i <= 40; i++) {
    const a = (12 + (96 * i) / 40) * deg;
    const p = [Math.cos(a) * 1.75, Math.sin(a) * 1.75];
    if (i === 0) s.moveTo(...p);
    else s.lineTo(...p);
  }
  for (let i = 40; i >= 0; i--) {
    const a = (12 + (96 * i) / 40) * deg;
    s.lineTo(Math.cos(a) * 1.665, Math.sin(a) * 1.665);
  }
  const m = put(
    new THREE.ShapeGeometry(s),
    real.skin(0xc8525e, { roughness: 0.3 }),
    0.045,
    0,
    0,
    lidSet,
    false,
  );
  m.rotation.y = -Math.PI / 2;
  m.position.x = 0.046;
}
const bigLash = real.gloss(0x0b0b0e, { roughness: 0.3 });
for (let i = 0; i < 9; i++) {
  const x = -0.1 - i * 0.18;
  const base = V(x, Math.sin(13 * deg) * 1.92, Math.cos(13 * deg) * 1.92);
  const len = 0.9 + 0.2 * Math.sin(i);
  const pts = [base, base.clone().add(V(0, -0.05, 0.4)), base.clone().add(V(0, 0.2, len))];
  put(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.035, 8),
    bigLash,
    0,
    0,
    0,
    lidSet,
  );
}
// the lumps: hard, black-grey, glinting — embedded in the lid's inner side
const lumpDefs = (() => {
  const r = rng(25);
  return Array.from({ length: 9 }, (_, i) => {
    const a = (30 + r() * 62) * deg;
    const rad = 1.7 + r() * 0.03;
    const x = i === 0 ? -0.12 : -0.18 - r() * 1.3;
    return {
      p: V(x, Math.sin(a) * rad, Math.cos(a) * rad),
      s: 0.08 + r() * 0.06,
      rot: V(r() * 6, r() * 6, r() * 6),
    };
  });
})();
const lumpMat = real.gloss(0x1b1a1f, { roughness: 0.35, metalness: 0.3 });
const lumps = lumpDefs.map((d, i) => {
  const m = put(new THREE.DodecahedronGeometry(1, 1), lumpMat, d.p.x, d.p.y, d.p.z, lidSet, false);
  m.rotation.set(d.rot.x, d.rot.y, d.rot.z);
  m.userData.d = d;
  // jitter the shape so each lump is a rough rock
  const pos = m.geometry.attributes.position;
  const rr = rng(60 + i);
  for (let k = 0; k < pos.count; k++)
    pos.setXYZ(
      k,
      pos.getX(k) * (0.8 + rr() * 0.35),
      pos.getY(k) * (0.75 + rr() * 0.35),
      pos.getZ(k) * (0.8 + rr() * 0.35),
    );
  m.geometry.computeVertexNormals();
  return m;
});
// tweezers (two steel arms meeting at the back)
const tweezers = new THREE.Group();
lidSet.add(tweezers);
const arms = [-1, 1].map((s) => {
  const a = new THREE.Group();
  tweezers.add(a);
  put(roundedBox(0.06, 2.6, 0.035, 0.015), real.metal(0xd9dde3, { roughness: 0.18 }), 0, 1.3, 0, a);
  a.userData.s = s;
  return a;
});
const TWZ_OUT = V(1.3, 1.35, 1.45).normalize();
const grabbed = lumps[0];
function updateLid(t) {
  const years = 25 * smooth(ramp(t, T.frau, T.aerzte - 0.2));
  lumps.forEach((m, i) => {
    const appear = (i / lumps.length) * 25;
    const k = clamp01((years - appear) / 3);
    m.scale.setScalar(m.userData.d.s * Math.max(1e-4, outBack(k)));
  });
  // tweezers: in, grab lump 0, pull it out
  const tip0 = grabbed.userData.d.p.clone();
  const tGrab = T.aerzte + 0.55;
  const inK = smooth(ramp(t, T.aerzte, tGrab));
  const outK = smooth(ramp(t, tGrab + 0.25, T.klumpen + 0.8));
  const tip = tip0.clone().addScaledVector(TWZ_OUT, lerp(2.4, 0, inK) + 1.4 * outK);
  tweezers.visible = t >= T.aerzte && t < T.ehrlich;
  tweezers.position.copy(tip);
  tweezers.quaternion.setFromUnitVectors(Yup, TWZ_OUT);
  const open = t < tGrab ? 0.09 : 0.03;
  arms.forEach((a) => (a.position.x = a.userData.s * open));
  if (t >= tGrab + 0.25) grabbed.position.copy(tip);
  else grabbed.position.copy(tip0);
  return years;
}

// ================================================================ render
function poseHead(t) {
  const fall = clamp01((t + 0.12) / 0.5);
  const land = t >= 0.38 ? Math.exp(-(t - 0.38) * 7) * Math.sin((t - 0.38) * 22) : 0;
  let y = HEAD[1] + 0.95 * (1 - fall * fall) - 0.05 * land;
  let rx = 0.08;
  const press = smooth(ramp(t, T.drueckst, T.kissen2 + 0.3)) * (t < T.found1 ? 1 : 0);
  rx += 0.7 * press;
  y -= 0.12 * press;
  head.position.set(HEAD[0], y, HEAD[2] - 0.08 * press);
  head.rotation.set(rx, 0, Math.PI / 2, "XYZ");
  head.visible = !(t >= T.found1 && t < T.doch);
  // pillow squash on landing + under the press
  const sq =
    (t >= 0.38 ? Math.exp(-(t - 0.38) * 6) * Math.abs(Math.cos((t - 0.38) * 18)) * 0.14 : 0) +
    0.05 * press;
  pillow.scale.set(1 + sq * 0.4, 1 - sq, 1 + sq * 0.4);
  pillow.position.y = PILLOW[1] - sq * 0.5 * 0.5;
}

function renderAt(t) {
  poseHead(t);
  puff("land", t, 0.4, 0.2, 0.75, 0.9, 0.9);

  // eyes: lids, redness, swelling, mascara drying
  const closed = closedAt(t);
  const redK =
    smooth(ramp(t, T.kratzen, T.kratzen + 0.5)) * (1 - smooth(ramp(t, T.also, T.also + 0.8)));
  const swell =
    smooth(ramp(t, T.entzuenden, T.entzuenden + 0.6)) * (1 - smooth(ramp(t, T.also, T.also + 0.8)));
  eyes.forEach((e) => {
    e.lid.rotation.x = lerp(LID_OPEN, LID_CLOSED, closed);
    const s = 1 + (e.ei === 0 ? 0.28 * swell : 0);
    e.lid.scale.set(s, s, s);
    e.veins.visible = redK > 0.02;
    e.veins.scale.setScalar(0.4 + 0.6 * redK);
  });
  eyeWhite.emissiveIntensity = 0.35 * redK;
  veinMat.emissiveIntensity = 0.8 * redK;
  lidMat.color.copy(lidBase).lerp(lidRed, 0.55 * swell);
  const dry = smooth(ramp(t, T.trocknet, T.trocknet + 0.9)) * (t < T.also ? 1 : 0.6);
  lashMat.color.copy(lashWet).lerp(lashDry, dry);
  lashMat.roughness = lerp(0.2, 0.95, dry);
  lashMat.clearcoat = 1 - dry;
  updateCrumbs(t);

  // pimples (stay once they're there)
  pimples.forEach((p) => {
    p.g.visible = t >= p.at;
    if (p.g.visible) p.g.scale.copy(squash(t, p.at, 0.5));
  });

  // pillow stains
  stains.forEach((m, i) => {
    m.material.opacity = smooth(ramp(t, stainTimes[i] + 0.05, stainTimes[i] + 0.35));
  });

  updateSkin(t);
  const years = updateLid(t);

  // ✕ over the foundation ("Nicht die Foundation")
  const nk = pop(t, T.found2, T.wimper, 0.2);
  showNope(nk, CHEEK_UP[0] + 0.1, CHEEK_UP[1] + 0.05, CHEEK_UP[2] + 0.25, 0.32);

  // LED panels: one at a time
  if (t >= T.rate && t < T.wimper)
    showPanel(pop(t, T.rate, T.wimper), "RATE MAL", "???", LED.yellow);
  else if (t >= T.harmlos && t < T.jede)
    showPanel(pop(t, T.harmlos, T.jede), "1 NACHT", "HARMLOS", LED.green);
  else showPanel(0);
  // counters
  const nk2 = pop(t, T.jede, T.fakt);
  counter("nacht", nk2, {
    label: "NÄCHTE",
    value: Math.max(1, Math.min(7, 1 + Math.floor(((t - T.jede) / (T.pickel + 0.4 - T.jede)) * 6))),
  });
  counter("jahre", pop(t, T.frau, T.klumpen), { label: "JAHRE", value: Math.round(years) });

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
