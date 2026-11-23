// A low-poly "Du" hand: the viewer's own hand reaching into the diorama —
// pressing the button, holding the card, touching the plate. Faces and
// hands stop the scroll; this one stays in the toy style (faceted, flat
// colours, a hoodie sleeve). Use it in the first frame whenever a person
// would touch the thing.
//   const hand = createHand();               // right hand, palm down, fingers along +z
//   hand.track(t, [
//     { t: 0,   pos: [1.4, 1.0, 0.9], rot: [0.2, -1.6, 0], pose: "open" },
//     { t: 0.6, pos: [0.5, 0.8, 0.3], rot: [0.3, -1.6, 0], pose: "point" },
//     { t: 1.4, pos: [1.6, 1.1, 1.0], rot: [0.2, -1.6, 0], pose: "point", out: true },
//   ]);
// Poses: open, point, press (point + fingertip pushed), grab, fist. Keys are
// interpolated smoothly; the hand is hidden before the first key and after a
// key with `out: true`. rot = Euler XYZ in radians.
import { THREE, V, flat, jitter, facet, facetMat, scene, smooth, clamp01, lerp } from "./world.js";

const POSES = {
  open: { index: 0.1, middle: 0.12, ring: 0.15, pinky: 0.2, thumb: 0.1 },
  point: { index: 0, middle: 1.5, ring: 1.6, pinky: 1.6, thumb: 0.9 },
  press: { index: 0.25, middle: 1.5, ring: 1.6, pinky: 1.6, thumb: 0.9 },
  grab: { index: 0.9, middle: 0.95, ring: 1.0, pinky: 1.05, thumb: 0.7 },
  fist: { index: 1.7, middle: 1.7, ring: 1.7, pinky: 1.7, thumb: 1.1 },
};

export function createHand({ skin = 0xf1c09a, sleeve = 0x4a7bd6, left = false, scale = 1 } = {}) {
  const skinMat = flat(skin, { roughness: 0.7 });
  const group = new THREE.Group();
  const root = new THREE.Group();
  root.scale.set(left ? -scale : scale, scale, scale);
  group.add(root);
  const add = (geo, mat, x, y, z, parent, amt = 0.08, seed = 1) => {
    const m = new THREE.Mesh(facet(geo, amt, seed), facetMat(mat));
    m.position.set(x, y, z);
    m.castShadow = true;
    parent.add(m);
    return m;
  };

  // hoodie sleeve + cuff behind the wrist
  const sl = add(
    jitter(new THREE.CylinderGeometry(0.2, 0.23, 0.6, 9, 1, true), 0.015, 3),
    flat(sleeve),
    0,
    0.01,
    -0.36,
    root,
    0.1,
    3,
  );
  sl.rotation.x = Math.PI / 2;
  sl.material.side = THREE.DoubleSide;
  add(new THREE.TorusGeometry(0.19, 0.04, 6, 12), flat(sleeve), 0, 0.01, -0.07, root, 0.1, 4);
  // palm + wrist
  add(
    jitter(new THREE.CylinderGeometry(0.13, 0.15, 0.16, 8), 0.01, 5),
    skinMat,
    0,
    0,
    -0.02,
    root,
    0.06,
    5,
  ).rotation.x = Math.PI / 2;
  add(
    jitter(new THREE.BoxGeometry(0.44, 0.14, 0.42, 2, 1, 2), 0.012, 6),
    skinMat,
    0,
    0,
    0.2,
    root,
    0.06,
    6,
  );

  // fingers: knuckle pivot → two segments; curl rotates both joints toward the palm
  const finger = (x, len, seed) => {
    const k = new THREE.Group();
    k.position.set(x, 0.01, 0.41);
    root.add(k);
    add(
      new THREE.CapsuleGeometry(0.05, len * 0.55, 2, 6),
      skinMat,
      0,
      0,
      len * 0.3,
      k,
      0.06,
      seed,
    ).rotation.x = Math.PI / 2;
    const j = new THREE.Group();
    j.position.z = len * 0.6;
    k.add(j);
    add(
      new THREE.CapsuleGeometry(0.046, len * 0.4, 2, 6),
      skinMat,
      0,
      0,
      len * 0.24,
      j,
      0.06,
      seed + 1,
    ).rotation.x = Math.PI / 2;
    return { k, j };
  };
  const f = {
    index: finger(0.155, 0.3, 11),
    middle: finger(0.052, 0.33, 13),
    ring: finger(-0.052, 0.31, 15),
    pinky: finger(-0.155, 0.24, 17),
  };
  // thumb from the side of the palm
  const tb = new THREE.Group();
  tb.position.set(0.21, -0.02, 0.1);
  tb.rotation.set(0, 0.75, -0.3);
  root.add(tb);
  add(new THREE.CapsuleGeometry(0.055, 0.14, 2, 6), skinMat, 0, 0, 0.1, tb, 0.06, 21).rotation.x =
    Math.PI / 2;
  const tj = new THREE.Group();
  tj.position.z = 0.2;
  tb.add(tj);
  add(new THREE.CapsuleGeometry(0.05, 0.1, 2, 6), skinMat, 0, 0, 0.08, tj, 0.06, 22).rotation.x =
    Math.PI / 2;
  f.thumb = { k: tb, j: tj, thumb: true };

  group.visible = false;
  scene.add(group);

  const curls = { index: 0, middle: 0, ring: 0, pinky: 0, thumb: 0 };
  const applyPose = (p) => {
    for (const n of Object.keys(curls)) {
      const c = p[n] ?? 0;
      const fg = f[n];
      if (fg.thumb) {
        fg.k.rotation.y = 0.75 - c * 0.6;
        fg.j.rotation.x = c * 0.9;
      } else {
        fg.k.rotation.x = c * 0.85;
        fg.j.rotation.x = c * 1.0;
      }
    }
  };
  applyPose(POSES.open);

  const mix = (a, b, k) => {
    const pa = typeof a === "string" ? POSES[a] : a;
    const pb = typeof b === "string" ? POSES[b] : b;
    const out = {};
    for (const n of Object.keys(curls)) out[n] = lerp(pa[n] ?? 0, pb[n] ?? 0, k);
    return out;
  };

  const pos = V(0, 0, 0);
  const rot = new THREE.Euler();
  return {
    group,
    pose: (p) => applyPose(typeof p === "string" ? POSES[p] : p),
    // place + pose the hand at time t from keyframes (call every frame)
    track(t, keys) {
      if (!keys.length || t < keys[0].t) {
        group.visible = false;
        return;
      }
      let i = 0;
      while (i < keys.length - 1 && keys[i + 1].t <= t) i++;
      const a = keys[i];
      if (a.out && t >= a.t) {
        group.visible = false;
        return;
      }
      const b = keys[Math.min(i + 1, keys.length - 1)];
      const k = b === a ? 1 : smooth(clamp01((t - a.t) / Math.max(0.01, b.t - a.t)));
      group.visible = true;
      pos.set(
        lerp(a.pos[0], b.pos[0], k),
        lerp(a.pos[1], b.pos[1], k),
        lerp(a.pos[2], b.pos[2], k),
      );
      const ra = a.rot ?? [0, 0, 0];
      const rb = b.rot ?? ra;
      rot.set(lerp(ra[0], rb[0], k), lerp(ra[1], rb[1], k), lerp(ra[2], rb[2], k));
      group.position.copy(pos);
      group.rotation.copy(rot);
      applyPose(mix(a.pose ?? "open", b.pose ?? a.pose ?? "open", k));
      // a press pushes the fingertip forward a little
      if ((b.pose === "press" || a.pose === "press") && k > 0.5)
        group.translateZ(0.04 * Math.sin((k - 0.5) * Math.PI));
    },
  };
}
