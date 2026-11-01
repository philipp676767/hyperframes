// #46 Blondieren — "Beim Blondieren wird dunkles Haar immer erst orange."
// SALON (origin): you in the styling chair, a black cape, dark brown hair
// full of silver foils; one foil open with a glowing orange strand, your
// hand holding it. A wet strand that stretches like chewing gum, a brush
// with fizzing paste, the peroxide bottle on the trolley, the colour fan,
// purple shampoo. HAAR (under the floor): one giant hair — cuticle scales
// like roof tiles, the cortex cut open with keratin fibres + yellow bridges,
// dark-brown and red-yellow pigment granules, peroxide molecules streaming
// in. GRAU (deeper): a cut through the scalp, a follicle full of peroxide
// bubbles, the hair growing out silver.
import {
  THREE,
  ramp,
  smooth,
  clamp01,
  lerp,
  outBack,
  pop,
  V,
  rng,
  scene,
  ground,
  flat,
  facet,
  facetMat,
  patches,
  jitter,
  showPanel,
  LED,
  labels,
  squash,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import "./set.js";
import { createHand } from "./hand.js";
import { readout } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS, HAAR, GRAU, HEAD, HB, HR, HRUNG } from "./beats.js";

highlights(HIGHLIGHTS);
const PI = Math.PI;
const _c = new THREE.Color();
const _c2 = new THREE.Color();
const _v = V(0, 0, 0);
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = V(1, 1, 1);
const between = (t, a, b) => t >= a && t < b;
const R = rng(4646);

// hair colours along the story
const C = {
  brown: new THREE.Color(0x3b2416),
  orange: new THREE.Color(0xff7a1a),
  yellow: new THREE.Color(0xf6cf4a),
  plat: new THREE.Color(0xf1eee6),
  wet: new THREE.Color(0xf0d48a),
  grey: new THREE.Color(0xc9c9cf),
};
// colour of the viewer's hair (cap, back, foil strands) at time t
function hairColor(t, out) {
  out.copy(C.brown);
  if (t >= T.orange2) {
    out.lerp(C.orange, smooth(ramp(t, T.orange2 - 0.05, T.orange2 + 0.25)));
    out.lerp(C.yellow, smooth(ramp(t, T.darum + 0.2, T.lila1)));
    out.lerp(C.plat, smooth(ramp(t, T.schluckt + 0.1, T.schluckt + 0.6)));
  }
  return out;
}
const canvasTex = (w, h, draw) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};
const glow = (color, i = 2) => flat(0xffffff, { emissive: color, emissiveIntensity: i });

// ================================================================ SALON
const salon = new THREE.Group();
scene.add(salon);
const chrome = flat(0xe2e6ec, { metalness: 0.9, roughness: 0.16 });
const SKIN = 0xf1c4a2;
const skinMat = flat(SKIN, { roughness: 0.6 });
const hairMat = flat(0x3b2416, { roughness: 0.55, emissive: 0x000000 });
const foilMat = flat(0xeef0f4, { metalness: 0.45, roughness: 0.3 });
const sadd = (mesh, x, y, z, parent = salon) => {
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
};
// ---- chair
{
  const leather = flat(0x1c1a20, { roughness: 0.35 });
  sadd(new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.72, 0.12, 16), chrome), 0, 0.06, 0);
  sadd(new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.8, 10), chrome), 0, 0.5, 0);
  sadd(
    new THREE.Mesh(
      facet(new THREE.BoxGeometry(1.25, 0.3, 1.15, 2, 1, 2), 0.03, 4),
      facetMat(leather),
    ),
    0,
    1.05,
    0.05,
  );
  const back = sadd(
    new THREE.Mesh(
      facet(new THREE.BoxGeometry(1.2, 1.5, 0.25, 2, 2, 1), 0.03, 5),
      facetMat(leather),
    ),
    0,
    1.95,
    -0.52,
  );
  back.rotation.x = -0.12;
  for (const sx of [-1, 1]) {
    sadd(
      new THREE.Mesh(facet(new THREE.BoxGeometry(0.16, 0.12, 0.95), 0.02, 6), facetMat(chrome)),
      sx * 0.68,
      1.48,
      0.0,
    );
    sadd(
      new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 6), chrome),
      sx * 0.68,
      1.27,
      0.35,
    );
  }
  sadd(
    new THREE.Mesh(facet(new THREE.BoxGeometry(0.9, 0.06, 0.35), 0.02, 7), facetMat(chrome)),
    0,
    0.42,
    0.85,
  );
}
// ---- the viewer: cape, neck, head, face
{
  // salon cape: a wide black cone with pink trim, covering the body
  const cape = sadd(
    new THREE.Mesh(
      facet(jitter(new THREE.CylinderGeometry(0.3, 1.05, 1.55, 18, 3), 0.03, 3), 0.06, 3),
      facetMat(flat(0x24222a, { roughness: 0.5 })),
    ),
    0,
    1.75,
    0.12,
  );
  cape.scale.z = 0.8;
  const trim = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.04, 6, 18), flat(0xf2a7b8));
  trim.rotation.x = PI / 2;
  sadd(trim, 0, 2.5, 0.12);
  // knees + shoes poking out under the cape
  for (const sx of [-1, 1]) {
    sadd(
      new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.5, 3, 8), flat(0x3b4a6a)),
      sx * 0.22,
      0.75,
      0.75,
    ).rotation.x = 0.1;
    sadd(
      new THREE.Mesh(
        facet(new THREE.BoxGeometry(0.2, 0.14, 0.36), 0.05, 8 + sx),
        facetMat(flat(0xffffff)),
      ),
      sx * 0.22,
      0.47,
      0.98,
    );
  }
  sadd(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.35, 10), skinMat), 0, 2.55, 0.08);
}
const head = new THREE.Group();
head.position.set(...HEAD);
salon.add(head);
{
  const skull = new THREE.Mesh(
    facet(new THREE.SphereGeometry(0.45, 20, 16), 0.025, 3),
    facetMat(skinMat),
  );
  skull.scale.set(0.93, 1.05, 0.98);
  skull.castShadow = true;
  head.add(skull);
  const white = flat(0xffffff, { roughness: 0.3 });
  const dark = flat(0x2a1a12, { roughness: 0.2 });
  for (const sx of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), white);
    e.position.set(sx * 0.15, 0.02, 0.39);
    e.scale.set(1, 1.15, 0.6);
    head.add(e);
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 6), dark);
    p.position.set(sx * 0.15 + 0.012, 0.015, 0.43);
    head.add(p);
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 4), glow(0xffffff, 1));
    hl.position.set(sx * 0.15 + 0.03, 0.04, 0.455);
    head.add(hl);
    const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.1, 2, 6), flat(0x3b2416));
    brow.rotation.z = PI / 2 + sx * 0.18;
    brow.position.set(sx * 0.15, 0.13, 0.4);
    head.add(brow);
    const cheek = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 8, 6),
      flat(0xf29a9a, { roughness: 0.8 }),
    );
    cheek.scale.set(1, 0.6, 0.3);
    cheek.position.set(sx * 0.24, -0.1, 0.36);
    head.add(cheek);
    const ear = new THREE.Mesh(
      facet(new THREE.SphereGeometry(0.09, 8, 6), 0.04, 4),
      facetMat(skinMat),
    );
    ear.scale.set(0.5, 1, 0.8);
    ear.position.set(sx * 0.42, 0.0, 0.02);
    head.add(ear);
  }
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.12, 6), skinMat);
  nose.rotation.x = PI / 2.4;
  nose.position.set(0, -0.06, 0.46);
  head.add(nose);
  // a big grin
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.022, 6, 14, PI), flat(0x8a2a2a));
  mouth.rotation.z = PI;
  mouth.position.set(0, -0.17, 0.4);
  head.add(mouth);
  // hair: cap over the top and the back + a short bob at the back
  const cap = new THREE.Mesh(
    facet(jitter(new THREE.SphereGeometry(0.5, 18, 12, 0, PI * 2, 0, PI * 0.56), 0.02, 9), 0.05, 9),
    facetMat(hairMat),
  );
  cap.rotation.x = -0.32;
  cap.scale.set(0.98, 1.0, 1.02);
  cap.castShadow = true;
  head.add(cap);
  const bob = new THREE.Mesh(
    facet(
      jitter(
        new THREE.SphereGeometry(0.52, 16, 10, PI * 0.55, PI * 0.9, PI * 0.3, PI * 0.42),
        0.02,
        10,
      ),
      0.05,
      10,
    ),
    facetMat(hairMat),
  );
  bob.material.side = THREE.DoubleSide;
  bob.castShadow = true;
  head.add(bob);
}
// direction on the head (azimuth a from +z towards +x, elevation e)
const headDir = (a, e) => V(Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e));
// ---- foils all over the head (fly off at "Orange")
const FOILS = [];
{
  const spots = [];
  for (const [e, n] of [
    [1.25, 3],
    [0.95, 6],
    [0.65, 7],
    [0.35, 6],
  ])
    for (let i = 0; i < n; i++) {
      const a = -2.2 + (4.4 * (i + 0.5)) / n + (e > 1 ? 0 : 0.12 * ((i % 2) - 0.5));
      if (Math.abs(a - 1.38) < 0.4 && e < 0.5) continue; // the hook foil's place
      if (Math.abs(a) < 0.55 && e < 0.7) continue; // keep the face free
      spots.push([a, e]);
    }
  spots.forEach(([a, e], i) => {
    const n = headDir(a - 0.0, e)
      .applyAxisAngle(V(1, 0, 0), -0.12)
      .normalize();
    let d = V(0, -0.35, -1).addScaledVector(n, -V(0, -0.35, -1).dot(n));
    if (d.lengthSq() < 0.01) d = V(0, -1, 0);
    d.normalize();
    const w = V().crossVectors(n, d).normalize();
    const g = new THREE.Group();
    const sheet = new THREE.Mesh(
      facet(new THREE.BoxGeometry(0.28, 0.025, 0.62, 2, 1, 3), 0.05, 20 + i),
      facetMat(foilMat),
    );
    sheet.position.set(0, 0, 0.26);
    sheet.rotation.x = 0.12;
    sheet.castShadow = true;
    g.add(sheet);
    const fold = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.02, 0.05), foilMat);
    fold.position.set(0, 0.03, 0.56);
    g.add(fold);
    const base = V(...HEAD).addScaledVector(n, 0.5);
    _m.makeBasis(w, n, d);
    g.quaternion.setFromRotationMatrix(_m);
    g.position.copy(base);
    g.userData = {
      base,
      q0: g.quaternion.clone(),
      n,
      spin: V(R() - 0.5, R() - 0.5, R() - 0.5).normalize(),
      d: R() * 0.12,
    };
    salon.add(g);
    FOILS.push(g);
  });
}
// ---- the hook foil: base sheet, strand, lid that opens like a book
const HF = new THREE.Group();
salon.add(HF);
const hfN = V(0.85, 0.2, 1).normalize();
let hfD = V(0.45, -1, 0.15);
hfD.addScaledVector(hfN, -hfD.dot(hfN)).normalize();
const hfW = V().crossVectors(hfN, hfD).normalize();
const HF0 = V(...HEAD)
  .addScaledVector(headDir(1.38, 0.25), 0.5)
  .addScaledVector(hfN, 0.06);
_m.makeBasis(hfW, hfN, hfD);
HF.quaternion.setFromRotationMatrix(_m);
HF.position.copy(HF0);
const hfLocal = (x, y, z) => V(x, y, z).applyQuaternion(HF.quaternion).add(HF0);
const strandMat = flat(0x3b2416, { roughness: 0.4, emissive: 0x000000 });
{
  const base = new THREE.Mesh(
    facet(new THREE.BoxGeometry(0.5, 0.018, 1.0, 2, 1, 4), 0.04, 31),
    facetMat(foilMat),
  );
  base.position.set(0, 0, 0.5);
  base.castShadow = true;
  HF.add(base);
  // the strand: a bundle of thin hairs
  for (let i = 0; i < 16; i++) {
    const h = new THREE.Mesh(
      new THREE.CylinderGeometry(0.013, 0.008, 0.95 - (i % 3) * 0.04, 4),
      strandMat,
    );
    h.rotation.x = PI / 2;
    h.rotation.y = ((i % 5) - 2) * 0.02;
    h.position.set(-0.1 + i * 0.0133, 0.025 + (i % 3) * 0.01, 0.5 + (i % 4) * 0.01);
    HF.add(h);
  }
}
const lidPivot = new THREE.Group();
lidPivot.position.set(0.25, 0.012, 0);
HF.add(lidPivot);
{
  const lid = new THREE.Mesh(
    facet(new THREE.BoxGeometry(0.5, 0.018, 1.0, 2, 1, 4), 0.04, 32),
    facetMat(foilMat),
  );
  lid.position.set(-0.25, 0.02, 0.5);
  lid.castShadow = true;
  lidPivot.add(lid);
}
// paste on the strand + its fizz bubbles + the brush
const pasteMat = flat(0xe4ecff, { roughness: 0.35, emissive: 0x2a3a5a, emissiveIntensity: 0.2 });
const paste = new THREE.Mesh(
  facet(jitter(new THREE.BoxGeometry(0.26, 0.05, 1, 3, 1, 8), 0.008, 3), 0.04, 3),
  facetMat(pasteMat),
);
HF.add(paste);
const fizz = Array.from({ length: 16 }, () => {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(0.018, 6, 4),
    flat(0xffffff, { roughness: 0.1, emissive: 0x6fb8ff, emissiveIntensity: 0.4 }),
  );
  m.userData = { x: (R() - 0.5) * 0.22, z: 0.08 + R() * 0.84, ph: R() };
  HF.add(m);
  return m;
});
const brush = new THREE.Group();
{
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.02, 0.7, 6),
    flat(0x1c1a20, { roughness: 0.3 }),
  );
  handle.position.y = 0.42;
  brush.add(handle);
  const head2 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.05), flat(0x1c1a20));
  head2.position.y = 0.06;
  brush.add(head2);
  const bristles = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 0.04), flat(0xf6efe6));
  bristles.position.y = -0.01;
  brush.add(bristles);
  const dab = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.04, 0.05), pasteMat);
  dab.position.y = -0.05;
  brush.add(dab);
}
brush.scale.setScalar(0.6);
HF.add(brush);
// sparkles + glow around the strand
const sparkMat = glow(0xfff3c0, 3);
const sparks = Array.from({ length: 12 }, (_, i) => {
  const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.035, 0), sparkMat);
  m.userData = { a: (i / 12) * PI * 2, r: 0.18 + R() * 0.2, z: 0.1 + R() * 0.8, ph: R() * 6 };
  HF.add(m);
  return m;
});
const strandLight = new THREE.PointLight(0xff8a2a, 0, 3, 1.5);
strandLight.position.set(0, 0.25, 0.5);
HF.add(strandLight);
// ---- the chewing-gum strand on the left
const GUM_ROOT = V(...HEAD).addScaledVector(headDir(-1.15, -0.1), 0.47);
const gumGeo = new THREE.CylinderGeometry(0.045, 0.045, 1, 10, 32);
const gumBase = gumGeo.attributes.position.array.slice();
const gumMat = flat(0xf0d48a, { roughness: 0.12, metalness: 0.05 });
const gum = new THREE.Mesh(gumGeo, gumMat);
gum.castShadow = true;
salon.add(gum);
const gumTip = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), gumMat);
salon.add(gumTip);
const drips = Array.from({ length: 4 }, (_, i) => {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(0.025, 6, 5),
    flat(0xbfe6ff, { roughness: 0.05, emissive: 0x3a6a9a, emissiveIntensity: 0.3 }),
  );
  m.userData.ph = i / 4;
  salon.add(m);
  return m;
});
const gumEnd = (t) => {
  const k = smooth(ramp(t, T.wartet, T.stell - 0.1));
  return V(
    GUM_ROOT.x + lerp(-0.12, -0.55, k),
    GUM_ROOT.y + lerp(-0.45, -1.55, k),
    GUM_ROOT.z + lerp(0.25, 0.75, k),
  );
};
// ---- trolley with bowl, foil roll and the peroxide bottle
const TROL = [1.85, 0, 1.45];
{
  const g = new THREE.Group();
  g.position.set(...TROL);
  g.rotation.y = -0.5;
  salon.add(g);
  const top = flat(0xf6efe6, { roughness: 0.35 });
  for (const y of [0.55, 1.5])
    sadd(
      new THREE.Mesh(facet(new THREE.BoxGeometry(0.9, 0.06, 0.65), 0.03, y * 10), facetMat(top)),
      0,
      y,
      0,
      g,
    );
  for (const [x, z] of [
    [-0.4, -0.28],
    [0.4, -0.28],
    [-0.4, 0.28],
    [0.4, 0.28],
  ]) {
    sadd(new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.5, 6), chrome), x, 0.78, z, g);
    sadd(new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), flat(0x222222)), x, 0.05, z, g);
  }
  // colour bowl with blue-white paste + tint brush
  const bowl = sadd(
    new THREE.Mesh(
      facet(new THREE.SphereGeometry(0.2, 12, 8, 0, PI * 2, PI / 2, PI / 2), 0.04, 3),
      facetMat(flat(0x1c1a20, { roughness: 0.3 })),
    ),
    -0.2,
    1.73,
    0.05,
    g,
  );
  bowl.material.side = THREE.DoubleSide;
  sadd(
    new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.03, 12), pasteMat),
    -0.2,
    1.68,
    0.05,
    g,
  );
  // foil roll box
  sadd(
    new THREE.Mesh(
      facet(new THREE.BoxGeometry(0.5, 0.12, 0.16), 0.04, 5),
      facetMat(flat(0xf2a7b8)),
    ),
    0.15,
    1.59,
    -0.18,
    g,
  );
  // a stack of cut foil sheets
  for (let i = 0; i < 4; i++)
    sadd(
      new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.012, 0.42), foilMat),
      0.62 - 0.4,
      0.6 + i * 0.015,
      0,
      g,
    );
}
const bottle = new THREE.Group();
bottle.position.set(TROL[0] - 0.15, 1.53, TROL[2] + 0.22);
salon.add(bottle);
{
  const bodyM = new THREE.MeshStandardMaterial({
    color: 0x6a3a12,
    roughness: 0.12,
    metalness: 0.1,
    transparent: true,
    opacity: 0.92,
  });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.5, 14), bodyM);
  body.position.y = 0.25;
  body.castShadow = true;
  bottle.add(body);
  const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.17, 0.14, 14), bodyM);
  shoulder.position.y = 0.57;
  bottle.add(shoulder);
  const cap2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.075, 0.1, 10),
    flat(0xffffff, { roughness: 0.4 }),
  );
  cap2.position.y = 0.69;
  bottle.add(cap2);
  const tex = canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#d8262f";
    g.fillRect(0, 0, w, 40);
    g.fillStyle = "#1c1a20";
    g.font = "800 92px Montserrat, sans-serif";
    g.textAlign = "center";
    g.fillText("H₂O₂", w / 2, 150);
    g.font = "800 52px Montserrat, sans-serif";
    g.fillText("3 %", w / 2, 222);
  });
  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(0.173, 0.173, 0.3, 20, 1, true, -PI / 2, PI),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 }),
  );
  label.position.y = 0.25;
  label.rotation.y = PI * 0.0;
  bottle.add(label);
}
const bubbles = Array.from({ length: 14 }, (_, i) => {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(0.025 + R() * 0.02, 6, 5),
    flat(0xffffff, { roughness: 0.1, transparent: true, opacity: 0.85 }),
  );
  m.userData = { ph: i / 14, x: (R() - 0.5) * 0.12, z: (R() - 0.5) * 0.12 };
  salon.add(m);
  return m;
});
// ---- the colour fan (Farbkarte)
const FAN = [0.0, 1.78, 1.3];
const fan = new THREE.Group();
fan.position.set(...FAN);
salon.add(fan);
const FAN_COLS = [
  0x141414, 0x3b2214, 0x6b3e22, 0xa0522d, 0xc0392b, 0xff7a1a, 0xe8c25a, 0xf4ecd8, 0xf6a5c0,
  0x9b6ad6, 0x4a7bd6,
];
const blades = FAN_COLS.map((col, i) => {
  const g = new THREE.Group();
  g.position.z = i * 0.012;
  const strip = new THREE.Mesh(
    facet(jitter(new THREE.CylinderGeometry(0.045, 0.075, 0.95, 6, 4), 0.01, i), 0.06, i),
    facetMat(flat(col, { roughness: 0.45 })),
  );
  strip.scale.z = 0.45;
  strip.position.y = 0.6;
  g.add(strip);
  const tag = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.13, 0.02),
    flat(0xffffff, { roughness: 0.6 }),
  );
  tag.position.y = 0.1;
  g.add(tag);
  g.traverse((o) => o.isMesh && (o.castShadow = true));
  fan.add(g);
  return g;
});
{
  const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.2, 8), chrome);
  screw.rotation.x = PI / 2;
  screw.position.set(0, 0.04, 0.06);
  fan.add(screw);
}
// ---- purple shampoo bottle + foam
const lila = new THREE.Group();
lila.position.set(0.55, 4.0, 0.45);
lila.rotation.set(0.2, 0, 2.55);
salon.add(lila);
{
  const m = flat(0x8a4fd8, { roughness: 0.25 });
  const body = new THREE.Mesh(
    facet(new THREE.CylinderGeometry(0.17, 0.2, 0.62, 12), 0.03, 4),
    facetMat(m),
  );
  lila.add(body);
  const capL = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.13, 0.14, 10),
    flat(0xffffff, { roughness: 0.3 }),
  );
  capL.position.y = 0.38;
  lila.add(capL);
  const nozzle = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 8), flat(0xffffff));
  nozzle.position.y = 0.5;
  lila.add(nozzle);
  const band = new THREE.Mesh(
    new THREE.CylinderGeometry(0.175, 0.19, 0.22, 12, 1, true),
    flat(0xffffff, { roughness: 0.5 }),
  );
  band.position.y = -0.02;
  lila.add(band);
}
const NOZ = V(0, 0.56, 0);
const lilaDrops = Array.from({ length: 8 }, (_, i) => {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 8, 6),
    flat(0xb07cff, { roughness: 0.15, emissive: 0x4a1a8a, emissiveIntensity: 0.3 }),
  );
  m.userData.ph = i / 8;
  salon.add(m);
  return m;
});
const foamMat = flat(0xcdb2ff, { roughness: 0.6, emissive: 0x3a1a6a, emissiveIntensity: 0.15 });
const foam = Array.from({ length: 22 }, (_, i) => {
  const a = -1.6 + R() * 3.2;
  const e = 0.25 + R() * 1.1;
  const n = headDir(a, e).applyAxisAngle(V(1, 0, 0), -0.12);
  const m = new THREE.Mesh(
    facet(new THREE.IcosahedronGeometry(0.09 + R() * 0.06, 1), 0.05, i),
    facetMat(foamMat),
  );
  m.position.copy(V(...HEAD).addScaledVector(n, 0.5));
  m.userData.d = R() * 0.5;
  salon.add(m);
  return m;
});
// sparkles around the head at the end (platinum)
const headSparks = Array.from({ length: 14 }, (_, i) => {
  const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.05, 0), sparkMat);
  const n = headDir(-1.8 + (3.6 * i) / 13, 0.2 + R() * 1.1);
  m.userData = { p: V(...HEAD).addScaledVector(n, 0.62 + R() * 0.15), ph: R() * 6 };
  salon.add(m);
  return m;
});
const headLight = new THREE.PointLight(0xff8a2a, 0, 4, 1.5);
headLight.position.set(0.4, 3.6, 1.2);
salon.add(headLight);
// the viewer's hand
const hand = createHand({ scale: 0.62, sleeve: 0x2f6e5a });

// ================================================================ HAAR
const haar = new THREE.Group();
haar.position.set(...HAAR);
scene.add(haar);
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
function bokeh(parent, n, color, seed) {
  const r = rng(seed);
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  });
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.4 + r() * 1.2, 10, 8), mat);
    const a = r() * PI * 2;
    const d = 16 + r() * 18;
    m.position.set(Math.cos(a) * d, -6 + r() * 16, -Math.abs(Math.sin(a)) * d - 6);
    m.userData.noAO = true;
    parent.add(m);
  }
}
backdrop(haar, 42, 0x5a2a62, 0x140a1c);
bokeh(haar, 26, 0xffb0d8, 7);
const haarLights = [
  [0xfff0e6, 46, [2, 7, 7]],
  [0xffb0c8, 26, [-7, 2, 5]],
  [0xc0a0ff, 26, [7, -2, 5]],
  [0xffd8a0, 20, [0, -5, -4]],
].map(([c, i, p]) => {
  const l = new THREE.PointLight(c, i, 30, 1.2);
  l.position.set(...p);
  l.userData.base = i;
  haar.add(l);
  return l;
});
const hair = new THREE.Group(); // the hair along x (stretches at "Gummi")
haar.add(hair);
const HR0 = 1.5; // outer radius
// cortex: back half opaque, front half see-through when we go inside
const cortexBackMat = flat(0x3b2416, { roughness: 0.55, side: THREE.DoubleSide });
const cortexFrontMat = new THREE.MeshStandardMaterial({
  color: 0x3b2416,
  roughness: 0.4,
  transparent: true,
  opacity: 1,
  side: THREE.DoubleSide,
  flatShading: true,
});
{
  const back = new THREE.Mesh(
    new THREE.CylinderGeometry(HR0 - 0.1, HR0 - 0.1, 36, 36, 1, true, PI / 2, PI),
    cortexBackMat,
  );
  back.rotation.z = PI / 2;
  hair.add(back);
  const front = new THREE.Mesh(
    new THREE.CylinderGeometry(HR0 - 0.1, HR0 - 0.1, 36, 36, 1, true, -PI / 2, PI),
    cortexFrontMat,
  );
  front.rotation.z = PI / 2;
  front.renderOrder = 2;
  front.userData.noAO = true;
  hair.add(front);
}
// keratin fibres: centre + ring of six
const FR = 0.72;
const FIB = [
  [0, 0],
  ...Array.from({ length: 6 }, (_, k) => [
    FR * Math.sin((k * PI) / 3),
    FR * Math.cos((k * PI) / 3),
  ]),
];
const fibreMat = flat(0xf6c8b8, { roughness: 0.45, emissive: 0x3a1a10, emissiveIntensity: 0.15 });
FIB.forEach(([y, z], i) => {
  const pts = [];
  for (let k = 0; k <= 40; k++) {
    const x = -18 + (k / 40) * 36;
    pts.push(V(x, y + Math.sin(x * 0.9 + i) * 0.04, z + Math.cos(x * 0.7 + i) * 0.04));
  }
  hair.add(
    new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.08, 7), fibreMat),
  );
});
// bridges between neighbouring ring fibres
const RUNGS = [];
for (let s = 0; s < 28; s++) {
  const x = -11 + s * 0.8;
  for (let k = 0; k < 6; k++) {
    const a = FIB[1 + k];
    const b = FIB[1 + ((k + 1) % 6)];
    const p = V(x, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
    const dir = V(0, b[0] - a[0], b[1] - a[1]).normalize();
    RUNGS.push({
      p,
      q: new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), dir),
      tb: T.knackt2 + 0.05 + R() * 1.6,
      v: V((R() - 0.5) * 0.6, R() - 0.5, R() - 0.5).normalize(),
      spin: R() * 6,
    });
  }
}
// the hero rung (label "Brücken"): nearest to HRUNG, breaks a bit later
{
  let best = 0;
  RUNGS.forEach((r, i) => {
    if (r.p.distanceTo(V(...HRUNG).setZ(0.36)) < RUNGS[best].p.distanceTo(V(...HRUNG).setZ(0.36)))
      best = i;
  });
  RUNGS[best].tb = T.bruecken + 0.35;
  RUNGS.forEach((r) => {
    if (r !== RUNGS[best] && r.p.distanceTo(RUNGS[best].p) < 1.0)
      r.tb = Math.max(r.tb, T.bruecken + 0.1 + R() * 0.3);
  });
}
const rungMat = flat(0xffffff, { roughness: 0.3, emissive: 0xffc030, emissiveIntensity: 0.35 });
const rungs = new THREE.InstancedMesh(
  new THREE.CylinderGeometry(0.045, 0.045, FR, 6),
  rungMat,
  RUNGS.length,
);
rungs.frustumCulled = false;
hair.add(rungs);
// cuticle scales like roof tiles
const SC = [];
const RINGS = 58;
const AROUND = 16;
for (let i = 0; i < RINGS; i++)
  for (let k = 0; k < AROUND; k++) {
    const x = -17.4 + i * 0.6;
    const th = ((k + (i % 2) * 0.5) / AROUND) * PI * 2;
    const n = V(0, Math.sin(th), Math.cos(th));
    const tng = V(0, Math.cos(th), -Math.sin(th));
    _m.makeBasis(V(1, 0, 0), n, tng);
    SC.push({
      x,
      th,
      n,
      q: new THREE.Quaternion().setFromRotationMatrix(_m),
      var: 0.82 + R() * 0.25,
      d: R() * 0.15,
    });
  }
const scaleGeo = new THREE.BoxGeometry(0.88, 0.05, 0.66);
scaleGeo.translate(0.44, 0.025, 0);
const scaleMat = flat(0xffffff, { roughness: 0.32, metalness: 0.05 });
const scales = new THREE.InstancedMesh(facet(scaleGeo, 0.04, 7), facetMat(scaleMat), SC.length);
scales.frustumCulled = false;
hair.add(scales);
// pigment granules: dark brown (eumelanin) + red / yellow (pheomelanin)
const insideP = () => {
  for (;;) {
    const y = (R() - 0.5) * 2.4;
    const z = (R() - 0.5) * 2.4;
    if (y * y + z * z < 1.15 * 1.15) return [y, z];
  }
};
const BROWN = [{ p: V(...HB), tb: T.zerplatzt + 0.1, hero: true }];
for (let i = 1; i < 64; i++) {
  const [y, z] = insideP();
  const x = -10 + R() * 20;
  BROWN.push({ p: V(x, y, z), tb: 0, rot: R() * 6 });
}
// the first victims at "zerstört" are the ones closest to that shot's view
{
  const c = V(0.6, 0.1, 0.4);
  const order = BROWN.slice(1).sort((a, b) => a.p.distanceTo(c) - b.p.distanceTo(c));
  order.forEach((b, k) => {
    b.tb = k < 4 ? T.zerstoert + 0.25 + k * 0.13 : T.zerplatzt + 0.05 + R() * 0.75;
  });
}
const brownGeo = facet(jitter(new THREE.IcosahedronGeometry(0.22, 1), 0.02, 3), 0.06, 3);
const brownMat = flat(0xffffff, { roughness: 0.35 });
const browns = new THREE.InstancedMesh(brownGeo, facetMat(brownMat), BROWN.length);
browns.frustumCulled = false;
hair.add(browns);
const RY = [{ p: V(...HR), red: true }];
for (let i = 1; i < 46; i++) {
  const [y, z] = insideP();
  RY.push({ p: V(-10 + R() * 20, y, z), red: i % 2 === 0, ph: R() * 6 });
}
const ryMat = flat(0xffffff, { roughness: 0.3, emissive: 0x000000 });
const rys = new THREE.InstancedMesh(
  facet(new THREE.IcosahedronGeometry(0.13, 1), 0.05, 4),
  facetMat(ryMat),
  RY.length,
);
rys.frustumCulled = false;
hair.add(rys);
// shards of the bursting brown granules
const NSH = BROWN.length * 4;
const shards = new THREE.InstancedMesh(
  new THREE.TetrahedronGeometry(0.06, 0),
  flat(0x6a3a1a, { roughness: 0.4, emissive: 0xff8a2a, emissiveIntensity: 0.5 }),
  NSH,
);
shards.frustumCulled = false;
hair.add(shards);
const SHV = Array.from({ length: NSH }, () =>
  V(R() - 0.5, R() - 0.5, R() - 0.5)
    .normalize()
    .multiplyScalar(0.5 + R() * 0.6),
);
// peroxide molecules: a glowing blue core with two white H
const NM = 54;
const MOL = Array.from({ length: NM }, (_, i) => {
  const x = -6 + R() * 12;
  const [y, z] = insideP();
  return {
    s: V(x + (R() - 0.5) * 2, 2.6 + R() * 2.6, -0.6 + R() * 2.4),
    e: V(x, y * 0.95, z * 0.95),
    t0: T.dann - 0.1 + (i / NM) * 1.7,
    ph: R() * 6,
  };
});
// molecule i < 4 attacks the 4 first victims, 4..15 the rest of the hero browns
BROWN.forEach((b, k) => {
  if (k < NM && b.tb < T.zerplatzt) MOL[k].target = b;
});
const molCore = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.1, 1),
  flat(0x1f6aff, { roughness: 0.2, emissive: 0x1a5aff, emissiveIntensity: 0.7 }),
  NM,
);
const molH = new THREE.InstancedMesh(
  new THREE.SphereGeometry(0.055, 8, 6),
  flat(0xe8f4ff, { roughness: 0.3 }),
  NM * 2,
);
molCore.frustumCulled = molH.frustumCulled = false;
hair.add(molCore, molH);
function molPos(m, t, out) {
  const k = smooth(ramp(t, m.t0, m.t0 + 1.0));
  out.copy(m.s).lerp(m.e, k);
  out.y += Math.sin(t * 2.3 + m.ph) * 0.08 * k;
  out.z += Math.cos(t * 1.9 + m.ph) * 0.08 * k;
  if (m.target && t > m.target.tb - 0.9) {
    const a = smooth(ramp(t, m.target.tb - 0.9, m.target.tb - 0.1));
    out.lerp(_v.copy(m.target.p).add(V(0.12, 0.1, 0.12)), a);
  }
  return out;
}
const hairLight = new THREE.PointLight(0xff7a1a, 0, 8, 1.4);
hairLight.position.set(0, 0.2, 1.4);
haar.add(hairLight);

// ================================================================ GRAU
const grau = new THREE.Group();
grau.position.set(...GRAU);
scene.add(grau);
backdrop(grau, 42, 0x3a3a6a, 0x0e0c1a);
bokeh(grau, 22, 0xb0c8ff, 11);
[
  [0xfff0e6, 44, [3, 8, 8]],
  [0xffb0c8, 22, [-7, 0, 5]],
  [0xa0c0ff, 26, [6, -3, 5]],
].forEach(([c, i, p]) => {
  const l = new THREE.PointLight(c, i, 30, 1.2);
  l.position.set(...p);
  grau.add(l);
});
{
  // skin block: top epidermis, dermis below, cut face towards +z
  const derm = new THREE.Mesh(
    patches(facet(new THREE.BoxGeometry(16, 4.4, 6, 32, 8, 6), 0.05, 2), { amt: 0.08, seed: 3 }),
    facetMat(flat(0xd98a8a, { roughness: 0.7 })),
  );
  derm.position.set(0, -2.6, -1.2);
  grau.add(derm);
  const epi = new THREE.Mesh(
    facet(jitter(new THREE.BoxGeometry(16, 0.4, 6, 32, 1, 6), 0.03, 4), 0.05, 4),
    facetMat(flat(0xf3c2a6, { roughness: 0.6 })),
  );
  epi.position.set(0, -0.2, -1.2);
  grau.add(epi);
  const fatL = new THREE.Mesh(
    patches(facet(new THREE.BoxGeometry(16, 1.2, 6, 32, 2, 6), 0.05, 5), { amt: 0.08, seed: 6 }),
    facetMat(flat(0xf0c060, { roughness: 0.5 })),
  );
  fatL.position.set(0, -5.4, -1.2);
  grau.add(fatL);
}
// the follicle: a dark pocket from the surface down to the bulb (cut open)
{
  const pocket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.62, 3.4, 18, 1, true, PI / 2, PI),
    flat(0x8a3a4a, { roughness: 0.6, side: THREE.DoubleSide }),
  );
  pocket.position.set(0, -1.75, 1.8);
  grau.add(pocket);
  const bulb = new THREE.Mesh(
    facet(new THREE.SphereGeometry(0.85, 16, 12, PI / 2, PI), 0.05, 7),
    facetMat(flat(0xc8505e, { roughness: 0.5, side: THREE.DoubleSide })),
  );
  bulb.position.set(0, -3.55, 1.8);
  grau.add(bulb);
}
const greyMat = flat(0xc9c9cf, { roughness: 0.35, metalness: 0.1 });
const oldMat = flat(0x3b2416, { roughness: 0.45 });
const greyHair = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 1, 12), greyMat);
const oldHair = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1, 12), oldMat);
greyHair.castShadow = oldHair.castShadow = true;
grau.add(greyHair, oldHair);
const bulbCore = new THREE.Mesh(
  new THREE.SphereGeometry(0.45, 12, 10),
  flat(0xe8d0c8, { roughness: 0.5 }),
);
bulbCore.position.set(0, -3.45, 1.8);
grau.add(bulbCore);
// neighbouring hairs for context
for (const [x, z, col, h] of [
  [-3.2, 0.6, 0x3b2416, 5.5],
  [-5.6, -0.4, 0xc9c9cf, 4.8],
  [3.0, 0.2, 0x3b2416, 5.2],
  [5.4, -0.8, 0x3b2416, 4.4],
]) {
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.28, h, 10),
    flat(col, { roughness: 0.45 }),
  );
  m.position.set(x, h / 2 - 0.3, z);
  m.rotation.z = (x > 0 ? -1 : 1) * 0.12;
  grau.add(m);
}
const melanin = Array.from({ length: 14 }, () => {
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.07, 0), flat(0x3b2214));
  const a = R() * PI * 2;
  m.position.set(Math.cos(a) * 0.35, -3.5 + (R() - 0.5) * 0.5, 1.8 + Math.abs(Math.sin(a)) * 0.4);
  grau.add(m);
  return m;
});
const NBB = 34;
const gBub = Array.from({ length: NBB }, (_, i) => {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(0.06 + R() * 0.07, 8, 6),
    flat(0xffffff, { roughness: 0.1, emissive: 0x2a8aff, emissiveIntensity: 1.0 }),
  );
  m.userData = {
    a: R() * PI * 2,
    r: 0.15 + R() * 0.4,
    y: -3.9 + R() * 1.6,
    t0: T.fakt - 0.3 + (i / NBB) * 3.2,
    ph: R() * 6,
  };
  grau.add(m);
  return m;
});
const gSparks = Array.from({ length: 12 }, (_, i) => {
  const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), sparkMat);
  m.userData = { a: (i / 12) * PI * 2, y: 0.8 + R() * 4.8, ph: R() * 6 };
  grau.add(m);
  return m;
});

const applyCamera = shotCamera(shots);

// ================================================================ render
function renderAt(t) {
  const inHaar =
    between(t, T.haar1, T.da) || between(t, T.erst, T.dasselbe) || between(t, T.nur, T.orange2);
  const inGrau = t >= T.fakt;
  const inSalon = !inHaar && !inGrau;
  salon.visible = inSalon;
  ground.visible = inSalon;
  haar.visible = inHaar;
  grau.visible = inGrau;
  const hc = hairColor(t, _c2);

  // ------------------------------------------------ SALON
  if (inSalon) {
    hairMat.color.copy(hc);
    facetMat(hairMat).color.copy(hc);
    const orangeGlow = t >= T.orange2 ? pop(t, T.orange2, T.darum + 0.4, 0.15) : 0;
    hairMat.emissive.setHex(0xff5a00).multiplyScalar(orangeGlow * 0.35);
    facetMat(hairMat).emissive.copy(hairMat.emissive);
    headLight.intensity = 6 * orangeGlow;
    // foils: on the head, fly off at "Orange"
    FOILS.forEach((f) => {
      const u = f.userData;
      const k = clamp01((t - T.orange2 - u.d) / 0.7);
      f.visible = k < 1;
      if (!f.visible) return;
      f.position
        .copy(u.base)
        .addScaledVector(u.n, k * 2.2)
        .add(_v.set(0, k * 1.2 - k * k * 2.5, 0));
      f.quaternion.copy(u.q0).multiply(_q.setFromAxisAngle(u.spin, k * 9));
      f.scale.setScalar(Math.max(0.001, 1 - k * 0.5));
    });
    // hook foil: open at the hook, at the paste and after "Orange"
    const open =
      t < T.da ? lerp(-1.2, -2.85, smooth(ramp(t, 0, 0.3))) : t >= T.paste - 0.1 ? -2.85 : 0;
    lidPivot.rotation.z = open;
    const hfK = t >= T.orange2 ? clamp01((t - T.orange2 - 0.05) / 0.7) : 0;
    HF.visible = hfK < 1;
    HF.position
      .copy(HF0)
      .addScaledVector(hfN, hfK * 2.4)
      .add(_v.set(0, hfK * 1.0 - hfK * hfK * 2.6, 0));
    const hookOrange = t < T.da;
    strandMat.color.copy(hookOrange ? C.orange : hc);
    strandMat.emissive
      .setHex(0xff6a10)
      .multiplyScalar(hookOrange ? 0.45 + 0.15 * Math.sin(t * 9) : 0);
    strandLight.intensity = hookOrange ? 3.5 * smooth(ramp(t, 0, 0.25)) : 0;
    sparks.forEach((s, i) => {
      const u = s.userData;
      const k = hookOrange ? pop(t, 0.05 + i * 0.03, T.da, 0.2) : 0;
      s.visible = k > 0.01;
      s.position.set(Math.cos(u.a + t * 1.5) * u.r, 0.12 + Math.sin(t * 3 + u.ph) * 0.06, u.z);
      s.scale.setScalar(Math.max(0.001, k * (0.7 + 0.5 * Math.sin(t * 14 + u.ph))));
      s.rotation.y = t * 5 + i;
    });
    // paste + brush + fizz
    const pK = smooth(ramp(t, T.paste - 0.05, T.kribbelt + 0.2));
    paste.visible = between(t, T.paste - 0.05, T.orange2);
    paste.scale.set(1, 1, Math.max(0.001, pK));
    paste.position.set(0, 0.07, (pK * 0.95) / 2 + 0.02);
    brush.visible = between(t, T.paste - 0.3, T.erst);
    brush.position.set(0.0, 0.14 + 0.04 * Math.abs(Math.sin(t * 14)), 0.05 + pK * 0.9);
    brush.rotation.set(-0.5, 0, 0.15);
    fizz.forEach((b) => {
      const u = b.userData;
      const on = between(t, T.kribbelt - 0.1, T.orange2) && u.z < pK * 0.95;
      b.visible = on;
      if (!on) return;
      const k = (t * 1.6 + u.ph) % 1;
      b.position.set(u.x, 0.1 + k * 0.05, u.z);
      b.scale.setScalar(Math.max(0.001, Math.sin(k * PI) * 1.4));
    });
    // gum strand: hangs from the left side, stretched by the hand
    const gumOn = between(t, T.und1, T.stell);
    gum.visible = gumTip.visible = gumOn;
    drips.forEach((d) => (d.visible = gumOn));
    if (gumOn) {
      const P = gumEnd(t);
      const dir = _v.copy(P).sub(GUM_ROOT);
      const L = dir.length();
      dir.normalize();
      const neck = 0.78 * smooth(ramp(t, T.haare1, T.kaugummi + 0.4));
      const pos = gumGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const y = gumBase[i * 3 + 1];
        const u = y + 0.5;
        const f =
          1 - neck * Math.pow(Math.sin(PI * u), 1.6) + 0.06 * Math.sin(u * 18 + t * 6) * neck;
        pos.setXYZ(i, gumBase[i * 3] * f, y, gumBase[i * 3 + 2] * f);
      }
      pos.needsUpdate = true;
      gumGeo.computeVertexNormals();
      gum.position.copy(GUM_ROOT).addScaledVector(dir, L / 2);
      gum.quaternion.setFromUnitVectors(V(0, 1, 0), dir);
      gum.scale.set(1, L, 1);
      gumTip.position.copy(P);
      drips.forEach((d) => {
        const k = (t * 0.9 + d.userData.ph) % 1;
        d.position
          .copy(GUM_ROOT)
          .addScaledVector(dir, L * 0.5)
          .add(_v.set(0.02, -k * 0.9, 0.04));
        d.scale.setScalar(Math.max(0.001, 1 - k));
      });
    }
    // hand: holds the hook foil open, then pulls the gum strand
    const E = hfLocal(0.66, 0.16, 0.5);
    const P1 = gumEnd(T.wartet);
    const P2 = gumEnd(T.stell);
    hand.track(t, [
      { t: 0, pos: [E.x + 0.26, E.y + 0.1, E.z + 0.18], rot: [0.35, -2.1, 0.2], pose: "grab" },
      { t: 0.3, pos: [E.x + 0.17, E.y + 0.05, E.z + 0.1], rot: [0.35, -2.1, 0.2], pose: "grab" },
      {
        t: T.da - 0.01,
        pos: [E.x + 0.18, E.y + 0.05, E.z + 0.11],
        rot: [0.35, -2.1, 0.2],
        pose: "grab",
        out: true,
      },
      { t: T.und1, pos: [P1.x, P1.y - 0.14, P1.z + 0.02], rot: [-1.45, 0.3, 0], pose: "grab" },
      { t: T.wartet, pos: [P1.x, P1.y - 0.14, P1.z + 0.02], rot: [-1.45, 0.3, 0], pose: "fist" },
      {
        t: T.stell - 0.1,
        pos: [P2.x, P2.y - 0.14, P2.z + 0.02],
        rot: [-1.45, 0.3, 0],
        pose: "fist",
      },
      {
        t: T.stell,
        pos: [P2.x, P2.y - 0.14, P2.z + 0.02],
        rot: [-1.45, 0.3, 0],
        pose: "fist",
        out: true,
      },
      {
        t: T.welche - 0.2,
        pos: [FAN[0] + 0.12, FAN[1] - 0.12, FAN[2] + 0.18],
        rot: [-1.2, 0, 0],
        pose: "grab",
      },
      {
        t: T.nur - 0.01,
        pos: [FAN[0] + 0.12, FAN[1] - 0.12, FAN[2] + 0.18],
        rot: [-1.2, 0, 0],
        pose: "grab",
        out: true,
      },
    ]);
    // the peroxide bottle pops in, fizzes
    const bK = t >= T.dasselbe ? 1 : 0;
    bottle.visible = bK > 0 && t < T.welche;
    if (bottle.visible) bottle.scale.copy(squash(t, T.dasselbe));
    bubbles.forEach((b) => {
      const u = b.userData;
      b.visible = bottle.visible && t > T.dasselbe + 0.3;
      const k = (t * 0.8 + u.ph) % 1;
      b.position.set(
        bottle.position.x + u.x * (1 + k),
        bottle.position.y + 0.78 + k * 0.7,
        bottle.position.z + u.z * (1 + k),
      );
      b.scale.setScalar(Math.max(0.001, 1 - k * 0.7));
    });
    // colour fan opens
    fan.visible = between(t, T.welche - 0.2, T.nur);
    const fo = outBack(ramp(t, T.welche + 0.05, T.haarfarbe + 0.55));
    blades.forEach((b, i) => {
      const a0 = -1.3 + (2.6 * i) / (blades.length - 1);
      b.rotation.z = -a0 * fo + Math.sin(t * 2 + i) * 0.015 * fo;
    });
    fan.rotation.z = Math.sin(t * 1.3) * 0.04;
    // purple shampoo
    lila.visible = between(t, T.darum - 0.2, T.lila2);
    const sq = pop(t, T.lila1 - 0.05, T.lila1 + 0.5, 0.1);
    lila.scale.set(1 - 0.18 * sq, 1, 1 - 0.18 * sq);
    lila.position.y = 4.0 - 0.3 * smooth(ramp(t, T.darum - 0.2, T.darum + 0.3));
    const noz = lila.localToWorld(_v.copy(NOZ));
    lilaDrops.forEach((d) => {
      const u = d.userData;
      const on = between(t, T.lila1, T.lila2);
      d.visible = on;
      if (!on) return;
      const k = (t * 2.2 + u.ph) % 1;
      d.position.set(
        lerp(noz.x, 0.15 + (u.ph - 0.5) * 0.4, k),
        lerp(noz.y, HEAD[1] + 0.45, k),
        lerp(noz.z, HEAD[2] + 0.1, k),
      );
    });
    foam.forEach((f) => {
      const u = f.userData;
      const k =
        outBack(ramp(t, T.lila1 + 0.1 + u.d * 0.6, T.lila1 + 0.4 + u.d * 0.6)) *
        (1 - smooth(ramp(t, T.schluckt + u.d * 0.3, T.schluckt + 0.4 + u.d * 0.3)));
      f.visible = k > 0.01;
      f.scale.setScalar(Math.max(0.001, k));
      f.rotation.y = t + u.d * 9;
    });
    headSparks.forEach((s, i) => {
      const u = s.userData;
      const k = pop(t, T.schluckt + 0.3 + i * 0.03, T.fakt, 0.2);
      s.visible = k > 0.01;
      s.position.copy(u.p);
      s.scale.setScalar(Math.max(0.001, k * (0.7 + 0.5 * Math.sin(t * 12 + u.ph))));
      s.rotation.y = t * 4 + i;
    });
  } else {
    hand.track(t, [{ t: 0, pos: [0, -10, 0], rot: [0, 0, 0], pose: "open", out: true }]);
  }

  // ------------------------------------------------ HAAR
  if (inHaar) {
    const inside = t >= T.nur;
    // cortex colour: brown → (wave) orange in the hook; brown → orange after the burst
    _c.copy(C.brown);
    if (t < T.da) _c.lerp(C.orange, smooth(ramp(t, T.haar1 + 0.1, T.orange1 + 0.3)));
    else if (t >= T.zerplatzt)
      _c.lerp(_c2.setHex(0xd8641e), smooth(ramp(t, T.zerplatzt + 0.2, T.zaeh)));
    const dim = between(t, T.rate, T.rot) ? 0.55 : 1;
    if (inside) cortexBackMat.color.setHex(0xf0d2c0).lerp(_c, 0.35).multiplyScalar(dim);
    else cortexBackMat.color.copy(_c);
    cortexFrontMat.color.copy(_c).multiplyScalar(dim);
    cortexFrontMat.opacity = inside ? 0.14 : 1;
    cortexFrontMat.depthWrite = !inside;
    haarLights.forEach(
      (l) => (l.intensity = l.userData.base * (between(t, T.rate, T.rot) ? 0.6 : 1)),
    );
    hairLight.intensity =
      t < T.da
        ? 8 * smooth(ramp(t, T.haar1 + 0.3, T.orange1 + 0.3))
        : between(t, T.rot, T.orange2)
          ? 6 * smooth(ramp(t, T.gelb1, T.gelb1 + 0.4))
          : 0;

    // stretch like rubber
    const st = between(t, T.nass, T.rate) ? smooth(ramp(t, T.nass + 0.15, T.gummi + 0.25)) : 0;
    const sx = 1 + 0.75 * st + 0.05 * st * Math.sin(t * 16);
    hair.scale.set(sx, 1 / Math.sqrt(sx), 1 / Math.sqrt(sx));

    // scales: colour wave in the hook, crack open at "knackt", front ones cut away inside
    const wave = lerp(-14, 16, smooth(ramp(t, T.haar1, T.orange1 + 0.35)));
    SC.forEach((s, i) => {
      let tilt = 0.1;
      if (t >= T.erst)
        tilt =
          0.1 +
          0.42 *
            outBack(
              ramp(
                t,
                T.knackt1 + 0.1 + Math.abs(s.x) * 0.04 + s.d,
                T.knackt1 + 0.5 + Math.abs(s.x) * 0.04 + s.d,
              ),
            );
      let sc = 1;
      if (inside && Math.abs(s.x) < 11 && s.n.z > -0.25) sc = 0;
      _m.compose(
        _v.set(s.x, s.n.y * (HR0 - 0.04), s.n.z * (HR0 - 0.04)),
        _q.copy(s.q).multiply(new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), tilt)),
        _s.set(sc, sc, sc),
      );
      scales.setMatrixAt(i, _m);
      if (t < T.da) _c2.copy(C.brown).lerp(C.orange, smooth(clamp01((wave - s.x) / 3)));
      else _c2.copy(_c);
      _c2.multiplyScalar(s.var * 1.25 * dim);
      scales.setColorAt(i, _c2);
    });
    scales.instanceMatrix.needsUpdate = true;
    scales.instanceColor.needsUpdate = true;

    // bridges
    RUNGS.forEach((r, i) => {
      let k = 0;
      if (t >= r.tb) k = clamp01((t - r.tb) / 0.55);
      const s = inside ? Math.max(0.001, 1 - k) : 0.001;
      _v.copy(r.p).addScaledVector(r.v, k * 0.9);
      _q.copy(r.q).multiply(new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), k * r.spin));
      _m.compose(_v, _q, _s.set(s, Math.max(0.001, s * (1 - 0.5 * k)), s));
      rungs.setMatrixAt(i, _m);
      rungs.setColorAt(i, _c2.setHex(k > 0 ? 0xff5a3a : 0xffe08a));
    });
    rungs.instanceMatrix.needsUpdate = true;
    rungs.instanceColor.needsUpdate = true;

    // brown granules: burst one by one; shards fly
    BROWN.forEach((b, i) => {
      let s = inside ? 1 : 0.001;
      const fl = clamp01(1 - Math.abs(t - b.tb) / 0.12);
      if (t >= b.tb - 0.12)
        s *=
          t < b.tb ? 1 + 0.5 * ramp(t, b.tb - 0.12, b.tb) : Math.max(0.001, 1.5 - (t - b.tb) / 0.1);
      if (t >= b.tb + 0.15) s = 0.001;
      const wob = 1 + 0.06 * Math.sin(t * 7 + i);
      _m.compose(
        b.p,
        _q.setFromEuler(new THREE.Euler(i, i * 2 + t * 0.3, 0)),
        _s.set(s * wob * 1.15, s * 0.8, s),
      );
      browns.setMatrixAt(i, _m);
      browns.setColorAt(i, _c2.setHex(0x3a2014).lerp(_c.setHex(0xffa040), fl));
      for (let j = 0; j < 4; j++) {
        const n = i * 4 + j;
        const k = (t - b.tb) / 0.6;
        const on = inside && k > 0 && k < 1;
        const ss = on ? 1 - k : 0.001;
        _m.compose(
          _v.copy(b.p).addScaledVector(SHV[n], on ? k : 0),
          _q.setFromEuler(new THREE.Euler(k * 6 + n, k * 4, 0)),
          _s.set(ss, ss, ss),
        );
        shards.setMatrixAt(n, _m);
      }
    });
    browns.instanceMatrix.needsUpdate = true;
    browns.instanceColor.needsUpdate = true;
    shards.instanceMatrix.needsUpdate = true;

    // red / yellow granules: tough — they wobble but stay; glow at "Rot" / "Gelb"
    const zaeh =
      t >= T.rotgelb ? Math.sin((t - T.rotgelb) * 16) * Math.exp(-(t - T.rotgelb) * 2.2) : 0;
    const zaeh2 = t >= T.zaeh ? Math.sin((t - T.zaeh) * 16) * Math.exp(-(t - T.zaeh) * 2.4) : 0;
    RY.forEach((g, i) => {
      const red = g.red;
      const flash = red ? pop(t, T.rot, T.orange2, 0.15) : pop(t, T.gelb1, T.orange2, 0.15);
      const rate = between(t, T.rate, T.rot) ? 0.12 * Math.sin(t * 4 + i) : 0;
      const s = inside
        ? (1 + 0.28 * (zaeh + zaeh2) + rate + 0.35 * flash) * (i === 0 ? 1.4 : 1)
        : 0.001;
      _m.compose(g.p, _q.setFromEuler(new THREE.Euler(i, t * 0.4 + i, 0)), _s.set(s, s, s));
      rys.setMatrixAt(i, _m);
      _c2.setHex(red ? 0xe0402a : 0xf6c02a).multiplyScalar(1 + 0.8 * flash);
      rys.setColorAt(i, _c2);
    });
    facetMat(ryMat)
      .emissive.setHex(0xff6a20)
      .multiplyScalar(between(t, T.rate, T.orange2) ? 0.25 + 0.2 * Math.sin(t * 5) : 0.05);
    rys.instanceMatrix.needsUpdate = true;
    rys.instanceColor.needsUpdate = true;

    // peroxide molecules
    const molOn = t >= T.dann - 0.1 && t < T.rate;
    MOL.forEach((m, i) => {
      const p = molPos(m, t, _v);
      // bounce off the tough red-yellow granules
      if (t >= T.rotgelb - 0.3 && i >= 30 && i < 42) {
        const g = RY[(i - 30) * 3].p;
        const k = Math.abs(Math.sin((t - T.rotgelb) * 5 + i));
        p.lerp(g, 0.55 * smooth(ramp(t, T.rotgelb - 0.3, T.rotgelb + 0.2))).add(
          V(0.2 + 0.3 * k, 0.15 * k, 0.2 * k),
        );
      }
      let s = molOn && t >= m.t0 - 0.05 ? 1 : 0.001;
      if (m.target && t > m.target.tb) s = 0.001;
      const rot = _q.setFromEuler(new THREE.Euler(t * 2 + m.ph, t * 1.3, 0));
      _m.compose(p, rot, _s.set(s, s, s));
      molCore.setMatrixAt(i, _m);
      for (let j = 0; j < 2; j++) {
        const off = V(j ? 0.11 : -0.11, 0.06, 0).applyQuaternion(rot);
        _m.compose(V(p.x + off.x, p.y + off.y, p.z + off.z), rot, _s.set(s, s, s));
        molH.setMatrixAt(i * 2 + j, _m);
      }
    });
    molCore.instanceMatrix.needsUpdate = true;
    molH.instanceMatrix.needsUpdate = true;
  }

  // ------------------------------------------------ GRAU
  if (inGrau) {
    const g = (t - T.fakt) * 0.32;
    const split = 0.2 + g; // where grey turns into old brown
    greyHair.position.set(0, (-3.4 + split) / 2, 1.8);
    greyHair.scale.set(1, split + 3.4, 1);
    oldHair.position.set(0, split + 2.6, 1.8);
    oldHair.scale.set(1, 5.2, 1);
    oldMat.color.setHex(0x3b2416).lerp(C.grey, smooth(ramp(t, T.bleicht, T.bleicht + 0.8)));
    greyMat.emissive
      .setHex(0x8a9ab8)
      .multiplyScalar(0.2 * smooth(ramp(t, T.bleicht, T.bleicht + 0.8)));
    melanin.forEach((m, i) => {
      const k = 1 - smooth(ramp(t, T.graue + i * 0.08, T.h2o2b + 0.6 + i * 0.05));
      m.visible = k > 0.01;
      m.scale.setScalar(Math.max(0.001, k));
    });
    gBub.forEach((b) => {
      const u = b.userData;
      const k = outBack(ramp(t, u.t0, u.t0 + 0.4));
      b.visible = k > 0.01;
      const yy = u.y + ((t * 0.25 + u.ph) % 1) * 0.6;
      b.position.set(
        Math.cos(u.a + t * 0.6) * u.r,
        yy,
        1.8 + Math.abs(Math.sin(u.a)) * u.r * 0.8 + 0.25,
      );
      b.scale.setScalar(Math.max(0.001, k * (1 + 0.1 * Math.sin(t * 6 + u.ph))));
    });
    gSparks.forEach((s, i) => {
      const u = s.userData;
      const k = pop(t, T.bleicht + 0.1 + i * 0.04, 46, 0.2);
      s.visible = k > 0.01;
      s.position.set(Math.cos(u.a + t) * 0.55, u.y + g, 1.8 + Math.sin(u.a + t) * 0.55);
      s.scale.setScalar(Math.max(0.001, k * (0.7 + 0.5 * Math.sin(t * 12 + u.ph))));
      s.rotation.y = t * 4 + i;
    });
  }

  // ------------------------------------------------ facts + displays
  if (between(t, T.dasselbe + 0.4, T.welche))
    showPanel(pop(t, T.dasselbe + 0.4, T.welche), "BLONDIERUNG: BIS", "12 %", LED.blue);
  else showPanel(0);
  const ez = pop(t, T.bleibt1, T.nass, 0.2);
  if (ez > 0) {
    const min = Math.round(lerp(20, 60, smooth(ramp(t, T.bleibt1, T.gummi - 0.9))));
    readout("ez", ez, {
      label: "EINWIRKZEIT",
      value: String(min),
      unit: "MIN",
      note: min > 45 ? "ZU LANG!" : "",
      x: 60,
      y: 1220,
      color: min > 45 ? "#ff4b2b" : "#ffd23f",
    });
  }

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
