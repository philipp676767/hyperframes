// Realistic swimmer / Oma figure (from #65 10-Meter-Turm makeDiver), with
// x-ray-able skin (transparent from the start, setXray fades it), an
// optional dress + sun hat (Oma) and swimming poses.
import { THREE, real, roundedBox, scene } from "./world.js";

const mesh = (geo, mat, parent, x = 0, y = 0, z = 0, shadow = true) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};
export const S = 0.9; // body scale (≈ 1.76 m)
export const FEET = 1.18 * S; // root (navel) above the soles when standing

export function makeDiver({
  skin = 0xf0bf98,
  suit = 0xe8343a,
  hair = 0x3a2618,
  cap = null,
  dress = null,
}) {
  const outer = new THREE.Group(); // position + roll (rotation.z)
  const root = new THREE.Group(); // pitch (rotation.x)
  outer.add(root);
  root.scale.setScalar(S);
  scene.add(outer);
  const skinM = real.skin ? real.skin(skin) : real.plastic(skin, { roughness: 0.6 });
  const bodyM = dress ? real.fabric(dress) : skinM.clone(); // torso + thighs
  const limbM = skinM.clone(); // arms + calves (x-ray, blood tint)
  for (const m of [skinM, bodyM, limbM]) {
    m.transparent = true;
    m.userData.base = m.color.clone();
  }
  const suitM = real.fabric(suit);
  const dark = real.gloss(0x17110e, { roughness: 0.2 });
  // trunks + torso
  mesh(roundedBox(0.34, 0.2, 0.23, 0.07), suitM, root, 0, -0.2, 0);
  const torso = mesh(new THREE.CapsuleGeometry(0.15, 0.36, 10, 32), bodyM, root, 0, 0.12, 0);
  torso.scale.set(1.22, 1, 0.86);
  const sh = mesh(new THREE.CapsuleGeometry(0.075, 0.3, 8, 24), bodyM, root, 0, 0.41, -0.005);
  sh.rotation.z = Math.PI / 2;
  sh.scale.set(1, 1, 0.9);
  // navel + chest hint
  mesh(new THREE.SphereGeometry(0.012, 12, 8), dark, root, 0, 0.0, 0.128, false);
  mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.12, 24), skinM, root, 0, 0.52, 0);
  // head
  const head = new THREE.Group();
  head.position.set(0, 0.67, 0.01);
  root.add(head);
  const skull = mesh(new THREE.SphereGeometry(0.115, 48, 32), skinM, head);
  skull.scale.set(0.92, 1.06, 0.98);
  const hairM = cap ? real.gloss(cap, { roughness: 0.35 }) : real.fabric(hair);
  const hairG = mesh(
    new THREE.SphereGeometry(0.12, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.55),
    hairM,
    head,
    0,
    0.012,
    -0.006,
  );
  hairG.scale.set(0.95, 1.05, 1.0);
  const eyes = [];
  const brows = [];
  for (const sx of [-1, 1]) {
    mesh(
      new THREE.SphereGeometry(0.019, 16, 12),
      real.gloss(0xffffff),
      head,
      sx * 0.04,
      0.02,
      0.098,
      false,
    );
    eyes.push(
      mesh(new THREE.SphereGeometry(0.011, 12, 8), dark, head, sx * 0.04, 0.02, 0.114, false),
    );
    const b = mesh(
      new THREE.BoxGeometry(0.04, 0.008, 0.01),
      real.fabric(cap ? 0x3a2618 : hair),
      head,
      sx * 0.04,
      0.058,
      0.1,
      false,
    );
    brows.push(b);
    const ear = mesh(new THREE.SphereGeometry(0.025, 16, 12), skinM, head, sx * 0.105, 0.0, 0);
    ear.scale.set(0.5, 1, 0.8);
  }
  const nose = mesh(new THREE.SphereGeometry(0.018, 16, 12), skinM, head, 0, -0.01, 0.112);
  nose.scale.set(0.8, 1, 1.1);
  const mouth = mesh(
    new THREE.SphereGeometry(0.02, 16, 12),
    real.gloss(0x5a1a1c),
    head,
    0,
    -0.055,
    0.1,
    false,
  );
  mouth.scale.set(1.3, 0.35, 0.5);
  // arms
  const arms = [];
  for (const sx of [-1, 1]) {
    const shG = new THREE.Group();
    shG.position.set(sx * 0.215, 0.42, 0);
    root.add(shG);
    mesh(new THREE.CapsuleGeometry(0.046, 0.22, 8, 24), limbM, shG, 0, -0.15, 0);
    const el = new THREE.Group();
    el.position.y = -0.3;
    shG.add(el);
    mesh(new THREE.CapsuleGeometry(0.04, 0.2, 8, 24), limbM, el, 0, -0.13, 0);
    const hand = new THREE.Group();
    hand.position.y = -0.27;
    el.add(hand);
    mesh(roundedBox(0.075, 0.1, 0.028, 0.012), skinM, hand, 0, -0.05, 0);
    const th = mesh(
      new THREE.CapsuleGeometry(0.012, 0.04, 6, 12),
      skinM,
      hand,
      sx * -0.04,
      -0.03,
      0.01,
    );
    th.rotation.z = sx * 0.5;
    arms.push({ sx, sh: shG, el, hand });
  }
  // legs
  const legs = [];
  for (const sx of [-1, 1]) {
    const hip = new THREE.Group();
    hip.position.set(sx * 0.09, -0.27, 0);
    root.add(hip);
    mesh(new THREE.CapsuleGeometry(0.072, 0.32, 8, 24), dress ? bodyM : limbM, hip, 0, -0.2, 0);
    const kn = new THREE.Group();
    kn.position.y = -0.43;
    hip.add(kn);
    mesh(new THREE.CapsuleGeometry(0.056, 0.32, 8, 24), limbM, kn, 0, -0.21, 0);
    const foot = new THREE.Group();
    foot.position.y = -0.43;
    kn.add(foot);
    mesh(roundedBox(0.085, 0.06, 0.22, 0.03), skinM, foot, 0, -0.03, 0.05);
    legs.push({ sx, hip, kn, foot });
  }
  const bellyP = new THREE.Object3D();
  bellyP.position.set(0, 0.05, 0.14);
  root.add(bellyP);
  const handP = new THREE.Object3D();
  arms[1].hand.add(handP);
  handP.position.y = -0.1;
  const headP = new THREE.Object3D();
  head.add(headP);
  if (dress) {
    // straw sun hat + a skirt
    const straw = real.fabric(0xe9cf8e);
    const brim = mesh(new THREE.CylinderGeometry(0.26, 0.27, 0.012, 40), straw, head, 0, 0.075, 0);
    brim.rotation.x = -0.12;
    mesh(
      new THREE.SphereGeometry(0.125, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      straw,
      head,
      0,
      0.07,
      0,
    );
    mesh(
      new THREE.TorusGeometry(0.125, 0.014, 8, 32),
      real.fabric(0xd94a7a),
      head,
      0,
      0.085,
      0,
    ).rotation.x = Math.PI / 2;
  }
  return {
    skinM,
    limbM,
    outer,
    root,
    head,
    arms,
    legs,
    eyes,
    brows,
    mouth,
    bodyM,
    skinBase: new THREE.Color(skin),
    bellyP,
    handP,
    headP,
  };
}

// pose: arms {rx, rz, el} (rz = spread outward), legs {rx, rz, kn}
export function pose(d, a, l, ft = 0) {
  d.arms.forEach(({ sx, sh, el, hand }, k) => {
    const A = typeof a === "function" ? a(k) : a;
    sh.rotation.set(A.rx, 0, sx * A.rz);
    el.rotation.x = -(A.el ?? 0);
    hand.rotation.set(A.hx ?? 0, 0, 0);
  });
  d.legs.forEach(({ sx, hip, kn, foot }, k) => {
    const L = typeof l === "function" ? l(k) : l;
    hip.rotation.set(L.rx, 0, sx * L.rz);
    kn.rotation.x = L.kn ?? 0;
    foot.rotation.x = ft;
  });
}
export const P = {
  stand: [
    { rx: 0, rz: 0.08, el: 0.15 },
    { rx: 0, rz: 0.03, kn: 0 },
  ],
  flail: (t) => [
    (k) => ({
      rx: -0.3 + 0.55 * Math.sin(t * 7 + k * 2),
      rz: 1.35 + 0.4 * Math.sin(t * 9 + k * 1.7),
      el: 0.45,
    }),
    (k) => ({
      rx: 0.35 * Math.sin(t * 8 + k * Math.PI),
      rz: 0.28,
      kn: 0.45 + 0.35 * Math.sin(t * 8 + k * Math.PI + 1),
    }),
  ],
  windmill: (t) => [
    (k) => ({ rx: -(t * 11 + k * Math.PI), rz: 0.3, el: 0.1 }),
    (k) => ({ rx: k ? -0.25 : 0.05, rz: 0.06, kn: k ? 0.3 : 0.05 }),
  ],
  splat: [
    { rx: -0.1, rz: 1.5, el: 0.05 },
    { rx: 0, rz: 0.32, kn: 0.05 },
  ],
  float: (t) => [
    (k) => ({ rx: -0.2, rz: 1.15 + 0.08 * Math.sin(t * 1.3 + k), el: 0.35 }),
    (k) => ({ rx: 0.1 * Math.sin(t * 1.1 + k * 2), rz: 0.16, kn: 0.25 }),
  ],
  wave: (t) => [
    (k) =>
      k ? { rx: 0, rz: 2.6 + 0.35 * Math.sin(t * 9), el: 0.6 } : { rx: -0.2, rz: 1.1, el: 0.3 },
    (k) => ({ rx: 0.12 * Math.sin(t * 2 + k * 2), rz: 0.15, kn: 0.3 }),
  ],
  dive: [
    { rx: 0, rz: Math.PI - 0.06, el: 0, hx: -1.2 },
    { rx: 0, rz: 0.0, kn: 0 },
  ],
};
export function face(d, scream) {
  d.mouth.scale.set(1.3 - 0.4 * scream, 0.35 + 1.4 * scream, 0.5 + 0.3 * scream);
  d.brows.forEach((b, k) => (b.rotation.z = (k ? -1 : 1) * 0.4 * scream));
  d.eyes.forEach((e) => e.scale.setScalar(1 - 0.35 * scream));
}
