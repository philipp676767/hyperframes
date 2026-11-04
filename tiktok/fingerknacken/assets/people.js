// Toy low-poly people (from #54 Parfum). Local frame: facing +z, origin on the
// seat top (seated) or the floor (standing).
import { THREE, flat, facet, facetMat, jitter, lerp, scene } from "./world.js";

export const glowMat = (color, i = 1.4, extra = {}) =>
  flat(0xffffff, { emissive: color, emissiveIntensity: i, ...extra });
export const mesh = (geo, mat, parent, x = 0, y = 0, z = 0, amt = 0.05, seed = 1) => {
  const m = new THREE.Mesh(facet(geo, amt, seed), facetMat(mat));
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};

// ================================================================ people
// Toy low-poly people. Local frame: facing +z, origin on the seat top
// (seated) or on the floor (standing).
export function person({
  skin = 0xf1c09a,
  top = 0x4a7bd6,
  legs = 0x2f3a4f,
  hair = 0x3a2a20,
  style = "short",
  stand = false,
  seed = 1,
  hood = false,
}) {
  const g = new THREE.Group();
  const body = new THREE.Group();
  g.add(body);
  const hip = stand ? 3.7 : 0;
  const skinM = flat(skin, { roughness: 0.7 });
  const topM = flat(top, { roughness: 0.9 });
  const legM = flat(legs, { roughness: 0.9 });
  const hairM = flat(hair, { roughness: 0.8 });
  // torso (slightly tapered), leaning back a touch when seated
  const torso = new THREE.Group();
  torso.position.y = hip;
  torso.rotation.x = stand ? 0 : -0.06;
  body.add(torso);
  mesh(
    jitter(new THREE.CylinderGeometry(0.72, 0.62, 2.2, 8), 0.02, seed),
    topM,
    torso,
    0,
    1.15,
    0,
    0.06,
    seed,
  ).scale.set(1.08, 1, 0.62);
  if (hood)
    mesh(
      new THREE.TorusGeometry(0.42, 0.18, 6, 10),
      topM,
      torso,
      0,
      2.28,
      -0.25,
      0.06,
      seed + 2,
    ).rotation.x = Math.PI / 2 - 0.4;
  // neck + head
  mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.45, 7), skinM, torso, 0, 2.4, 0, 0.04, seed + 3);
  const head = new THREE.Group();
  head.position.set(0, 2.85, 0.04);
  head.scale.setScalar(1.22);
  torso.add(head);
  const skull = mesh(
    jitter(new THREE.IcosahedronGeometry(0.5, 1), 0.02, seed + 4),
    skinM,
    head,
    0,
    0,
    0,
    0.05,
    seed + 4,
  );
  skull.scale.set(0.95, 1.08, 1);
  const dark = flat(0x1d1a22, { roughness: 0.5 });
  const eyes = [];
  for (const sx of [-1, 1]) {
    const e = mesh(new THREE.SphereGeometry(0.065, 6, 5), dark, head, sx * 0.17, 0.06, 0.44, 0, 1);
    e.castShadow = false;
    eyes.push(e);
  }
  const brows = [];
  for (const sx of [-1, 1]) {
    const b = mesh(
      new THREE.BoxGeometry(0.2, 0.045, 0.05),
      hairM,
      head,
      sx * 0.17,
      0.2,
      0.45,
      0,
      1,
    );
    b.castShadow = false;
    brows.push(b);
  }
  const nose = mesh(
    new THREE.ConeGeometry(0.075, 0.2, 5),
    skinM,
    head,
    0,
    -0.03,
    0.5,
    0.04,
    seed + 5,
  );
  nose.rotation.x = Math.PI / 2 + 0.3;
  const mouth = mesh(
    new THREE.BoxGeometry(0.2, 0.04, 0.04),
    flat(0x9a3f45),
    head,
    0,
    -0.22,
    0.44,
    0,
    1,
  );
  mouth.castShadow = false;
  // hair
  const cap = mesh(
    new THREE.SphereGeometry(0.54, 10, 7, 0, Math.PI * 2, 0, Math.PI * 0.55),
    hairM,
    head,
    0,
    0.04,
    -0.04,
    0.06,
    seed + 6,
  );
  cap.rotation.x = -0.35;
  if (style === "long")
    mesh(new THREE.BoxGeometry(0.98, 1.1, 0.4), hairM, head, 0, -0.45, -0.3, 0.06, seed + 7);
  if (style === "bun")
    mesh(new THREE.IcosahedronGeometry(0.26, 1), hairM, head, 0, 0.5, -0.3, 0.06, seed + 8);
  if (style === "cap") {
    const c = mesh(
      new THREE.SphereGeometry(0.56, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.45),
      flat(0xe2453c),
      head,
      0,
      0.08,
      0,
      0.04,
      seed + 9,
    );
    c.rotation.x = -0.15;
    mesh(
      new THREE.BoxGeometry(0.62, 0.05, 0.42),
      flat(0xe2453c),
      head,
      0,
      0.26,
      0.5,
      0.03,
      seed + 10,
    ).rotation.x = 0.15;
  }
  // arms: shoulder pivot → upper arm → elbow pivot → forearm + hand
  const arm = (sx) => {
    const sh = new THREE.Group();
    sh.position.set(sx * 0.82, 2.0, 0);
    torso.add(sh);
    mesh(new THREE.CapsuleGeometry(0.2, 0.85, 2, 7), topM, sh, 0, -0.55, 0, 0.05, seed + 11);
    const el = new THREE.Group();
    el.position.y = -1.1;
    sh.add(el);
    mesh(new THREE.CapsuleGeometry(0.18, 0.75, 2, 7), topM, el, 0, -0.5, 0, 0.05, seed + 12);
    mesh(new THREE.IcosahedronGeometry(0.2, 0), skinM, el, 0, -1.05, 0, 0.05, seed + 13);
    return { sh, el };
  };
  const armL = arm(1);
  const armR = arm(-1);
  // legs
  for (const sx of [-1, 1]) {
    if (stand) {
      mesh(
        new THREE.CapsuleGeometry(0.27, 2.9, 2, 7),
        legM,
        body,
        sx * 0.36,
        2.05,
        0,
        0.05,
        seed + 14,
      );
      mesh(
        new THREE.BoxGeometry(0.4, 0.3, 0.8),
        dark,
        body,
        sx * 0.36,
        0.15,
        0.15,
        0.03,
        seed + 15,
      );
    } else {
      const th = mesh(
        new THREE.CapsuleGeometry(0.3, 1.45, 2, 7),
        legM,
        body,
        sx * 0.38,
        0.25,
        0.95,
        0.05,
        seed + 14,
      );
      th.rotation.x = Math.PI / 2;
      mesh(
        new THREE.CapsuleGeometry(0.25, 1.4, 2, 7),
        legM,
        body,
        sx * 0.38,
        -0.75,
        1.85,
        0.05,
        seed + 15,
      );
      mesh(
        new THREE.BoxGeometry(0.4, 0.3, 0.8),
        dark,
        body,
        sx * 0.38,
        -1.65,
        2.1,
        0.03,
        seed + 16,
      );
    }
  }
  scene.add(g);
  const P = { g, torso, head, eyes, brows, nose, mouth, armL, armR, hip };
  // pose helpers ------------------------------------------------------
  P.rest = (a, s = 1) => {
    a.sh.rotation.set(-0.35, 0, s * 0.1);
    a.el.rotation.set(-1.15, 0, 0);
  };
  P.fan = (a, t, k, s = 1) => {
    // forearm up in front of the face, waving
    a.sh.rotation.set(
      lerp(-0.35, -1.25, k),
      0,
      s * lerp(0.1, 0.5, k) + k * Math.sin(t * 15) * 0.16,
    );
    a.el.rotation.set(lerp(-1.15, -1.75, k), 0, 0);
  };
  P.face = (k) => {
    // k 0..1: wrinkled nose, brows down, mouth pinched
    P.brows[0].rotation.z = -0.45 * k;
    P.brows[1].rotation.z = 0.45 * k;
    P.brows[0].position.y = P.brows[1].position.y = 0.2 - 0.05 * k;
    P.nose.scale.set(1 + 0.25 * k, 1 - 0.3 * k, 1);
    P.mouth.scale.set(1 - 0.45 * k, 1 + 0.6 * k, 1);
    for (const e of P.eyes) e.scale.y = 1 - 0.55 * k;
  };
  P.smile = (k) => {
    P.mouth.scale.set(1 + 0.5 * k, 1, 1);
    P.mouth.position.y = -0.22 + 0.02 * k;
    for (const e of P.eyes) e.scale.y = Math.max(0.2, 1 - 0.8 * k);
  };
  P.rest(armL, 1);
  P.rest(armR, -1);
  return P;
}
export const face = (p, yaw) => (p.g.rotation.y = yaw);
export const FACE_PX = Math.PI / 2; // facing +x
export const FACE_NX = -Math.PI / 2;
