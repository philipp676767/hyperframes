// A low-poly cat (and, with a mane, a lion) lying in the sphinx pose.
// Local axes: +x = towards the head, +y up, +z = the near side (camera).
// The head turns towards +z. The fur shell uses x-ray materials, so the
// throat (larynx + vocal folds), windpipe and lungs show through.
//   const cat = makeCat({ fur, stripe, cream });
//   cat.update(t, { eyes: 0..1 open, look: 0..1 (head up, into camera), breathe, mouth })
import {
  THREE,
  V,
  flat,
  facet,
  facetMat,
  patches,
  xrayMaterial,
  xrayEdges,
  scene,
  camera,
  clamp01,
} from "./world.js";

const ico = (r, d = 2) => new THREE.IcosahedronGeometry(r, d);

export function makeCat({
  fur = 0xe58a3c,
  stripe = 0.22,
  cream = 0xfbe9cf,
  mane = null,
  eyeColor = 0x7ed957,
  seed = 1,
} = {}) {
  const group = new THREE.Group();
  const furMat = xrayMaterial(fur, { vertexColors: true, roughness: 0.85 });
  const creamMat = xrayMaterial(cream, { vertexColors: true, roughness: 0.9 });
  const shellMats = [furMat, creamMat];
  const edges = [];
  // fur piece: faceted, striped by a band function along the given axis
  const piece = (geo, mat, x, y, z, sx, sy, sz, parent = group, bands = 0, s2 = seed) => {
    const g = facet(geo, 0.05, s2);
    if (bands)
      patches(g, {
        amt: 0.04,
        scale: 1.2,
        seed: s2,
        fn: (px) => (Math.sin(px * bands) > 0.35 ? -stripe : 0),
      });
    const m = new THREE.Mesh(g, mat);
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    const e = xrayEdges(g);
    e.position.copy(m.position);
    e.scale.copy(m.scale);
    parent.add(e);
    edges.push(e);
    return m;
  };
  const B = stripe > 0 ? 1 : 0;

  // ---------------------------------------------------------------- body
  const body = new THREE.Group();
  group.add(body);
  piece(ico(1), furMat, -0.25, 0.6, 0, 1.3, 0.62, 0.68, body, 11 * B, seed + 1);
  piece(ico(1), furMat, -0.95, 0.55, 0.12, 0.62, 0.56, 0.62, body, 13 * B, seed + 2); // haunch
  piece(ico(1), creamMat, 0.72, 0.68, 0.04, 0.52, 0.6, 0.52, body, 0, seed + 3); // chest
  piece(ico(1), furMat, 0.92, 1.02, 0.06, 0.4, 0.42, 0.42, body, 0, seed + 4); // neck
  // paws
  piece(ico(1, 1), creamMat, 1.22, 0.13, 0.26, 0.34, 0.14, 0.17, body, 0, seed + 5);
  const pawNear = piece(
    ico(1, 1),
    creamMat,
    1.24,
    0.13,
    -0.24,
    0.34,
    0.14,
    0.17,
    body,
    0,
    seed + 6,
  );
  piece(ico(1, 1), creamMat, -0.5, 0.12, 0.62, 0.36, 0.13, 0.2, body, 0, seed + 7); // hind paw
  void pawNear;
  // tail wrapped round the near side
  const tailCurve = new THREE.CatmullRomCurve3([
    V(-1.45, 0.45, -0.05),
    V(-1.75, 0.25, 0.35),
    V(-1.2, 0.13, 0.78),
    V(-0.2, 0.12, 0.88),
    V(0.55, 0.16, 0.78),
  ]);
  const tailGeo = facet(new THREE.TubeGeometry(tailCurve, 30, 0.12, 7), 0.05, seed + 8);
  if (B)
    patches(tailGeo, {
      amt: 0.03,
      scale: 1,
      seed,
      fn: (x) => (Math.sin(x * 9) > 0.3 ? -stripe : 0),
    });
  const tail = new THREE.Mesh(tailGeo, furMat);
  tail.castShadow = true;
  body.add(tail);
  const tip = piece(ico(0.13, 1), furMat, 0.55, 0.16, 0.78, 1, 1, 1, body, 0, seed + 9);

  // ---------------------------------------------------------------- head
  const neckPivot = new THREE.Group(); // lifts the head for the "look"
  neckPivot.position.set(0.9, 1.05, 0.05);
  group.add(neckPivot);
  const head = new THREE.Group();
  head.position.set(0.22, 0.37, 0.07);
  head.rotation.y = 0.55;
  neckPivot.add(head);
  piece(ico(0.5, 2), furMat, 0, 0, 0, 1.08, 0.9, 0.95, head, 0, seed + 10);
  // forehead stripes ("M")
  if (B)
    for (const [x, rz] of [
      [-0.12, 0.25],
      [0, 0],
      [0.12, -0.25],
    ]) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, 0.04), furMat.clone());
      s.material = flat(new THREE.Color(fur).multiplyScalar(0.62).getHex(), { roughness: 0.9 });
      s.position.set(x, 0.26, 0.4);
      s.rotation.set(-0.5, 0, rz);
      head.add(s);
      shellMats.push(s.material);
      s.material.transparent = true;
      s.material.userData.base = s.material.color.clone();
    }
  piece(ico(0.26, 1), furMat, 0.27, -0.12, 0.16, 1, 0.85, 0.9, head, 0, seed + 11); // cheeks
  piece(ico(0.26, 1), furMat, -0.27, -0.12, 0.16, 1, 0.85, 0.9, head, 0, seed + 12);
  piece(ico(0.24, 1), creamMat, 0, -0.17, 0.36, 0.95, 0.62, 0.7, head, 0, seed + 13); // muzzle
  piece(ico(0.2, 1), creamMat, 0, -0.32, 0.25, 0.8, 0.5, 0.7, head, 0, seed + 14); // chin
  const pink = flat(0xf28b9a, { roughness: 0.6 });
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.07, 3), pink);
  nose.rotation.set(Math.PI / 2 + 0.2, 0, Math.PI);
  nose.position.set(0, -0.06, 0.5);
  head.add(nose);
  // mouth (open for the lion's roar)
  const mouth = new THREE.Mesh(ico(0.12, 1), flat(0x5a1a22, { roughness: 0.8 }));
  mouth.position.set(0, -0.27, 0.42);
  mouth.scale.set(1, 0.05, 0.6);
  head.add(mouth);
  // ears
  for (const sx of [-1, 1]) {
    const ear = new THREE.Group();
    ear.position.set(0.26 * sx, 0.36, -0.02);
    ear.rotation.z = -0.32 * sx;
    head.add(ear);
    piece(
      new THREE.ConeGeometry(0.19, 0.4, 4),
      furMat,
      0,
      0.12,
      0,
      1,
      1,
      0.6,
      ear,
      0,
      seed + 15 + sx,
    );
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.26, 4), pink);
    inner.position.set(0, 0.08, 0.07);
    inner.scale.set(1, 1, 0.4);
    ear.add(inner);
  }
  // eyes: closed arcs + open eyes (scaled by `eyes`)
  const lid = flat(0x3a2418, { roughness: 0.6 });
  const closed = [];
  const open = [];
  for (const sx of [-1, 1]) {
    const arc = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.016, 4, 10, Math.PI), lid);
    arc.position.set(0.19 * sx, 0.05, 0.43);
    arc.rotation.set(0.2, 0.25 * sx, Math.PI);
    head.add(arc);
    closed.push(arc);
    const eye = new THREE.Group();
    eye.position.set(0.19 * sx, 0.06, 0.41);
    eye.rotation.y = 0.25 * sx;
    head.add(eye);
    const ball = new THREE.Mesh(
      ico(0.095, 1),
      flat(eyeColor, { emissive: eyeColor, emissiveIntensity: 0.25, roughness: 0.2 }),
    );
    ball.scale.set(1, 1, 0.55);
    eye.add(ball);
    const pupil = new THREE.Mesh(ico(0.05, 1), flat(0x111111, { roughness: 0.2 }));
    pupil.scale.set(0.45, 1.5, 0.4);
    pupil.position.z = 0.045;
    eye.add(pupil);
    const glint = new THREE.Mesh(
      ico(0.018, 0),
      flat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 1 }),
    );
    glint.position.set(0.03, 0.04, 0.06);
    eye.add(glint);
    open.push(eye);
  }
  // whiskers
  const wMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
  const wp = [];
  for (const sx of [-1, 1])
    for (let i = 0; i < 3; i++) {
      wp.push(V(0.12 * sx, -0.16 + i * 0.03, 0.5), V(0.62 * sx, -0.08 + i * 0.09 - 0.05, 0.42));
    }
  head.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(wp), wMat));
  // lion mane
  if (mane != null) {
    const mm = xrayMaterial(mane, { vertexColors: true, roughness: 0.9 });
    shellMats.push(mm);
    const rr = (i) => Math.sin(i * 12.9898) * 0.5 + 0.5;
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const m = piece(
        new THREE.ConeGeometry(0.22, 0.6, 5),
        mm,
        Math.cos(a) * 0.48,
        Math.sin(a) * 0.45 - 0.02,
        -0.12,
        1,
        1 + rr(i) * 0.4,
        0.8,
        head,
        0,
        seed + 30 + i,
      );
      m.rotation.z = a - Math.PI / 2;
    }
    piece(ico(0.55, 1), mm, 0, 0.02, -0.25, 1.1, 1.05, 0.7, head, 0, seed + 50);
  }

  // ---------------------------------------------------------------- inside (x-ray)
  const inside = new THREE.Group();
  group.add(inside);
  const lungMat = flat(0xff9fb2, { emissive: 0xd04a6a, emissiveIntensity: 0.3, roughness: 0.6 });
  // windpipe from the larynx down into the chest
  const LARYNX = V(1.0, 1.12, 0.1);
  const pipe = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([LARYNX.clone(), V(0.9, 0.9, 0.06), V(0.6, 0.72, 0)]),
      16,
      0.045,
      8,
    ),
    flat(0xf5c0c8, { roughness: 0.5 }),
  );
  inside.add(pipe);
  const lungs = [];
  for (const sz of [-1, 1]) {
    const l = new THREE.Mesh(facet(ico(1, 1), 0.05, seed + 60 + sz), facetMat(lungMat));
    l.position.set(0.3, 0.7, 0.2 * sz);
    l.scale.set(0.42, 0.3, 0.17);
    inside.add(l);
    lungs.push(l);
  }
  // the larynx: an open ring with two vocal folds inside, axis vertical
  const larynx = makeLarynx();
  larynx.group.position.copy(LARYNX);
  larynx.group.scale.setScalar(0.62);
  larynx.group.rotation.x = 0.95; // opening towards the front
  inside.add(larynx.group);

  // ---------------------------------------------------------------- update
  const baseScale = body.scale.clone();
  return {
    group,
    body,
    head,
    neckPivot,
    shellMats,
    edges,
    inside,
    larynx,
    LARYNX,
    tip,
    tail,
    mouth,
    paw: pawNear,
    update(t, { eyes = 0, look = 0, breathe = 1, purr = 0, mouth: mo = 0, tailWag = 1 } = {}) {
      const b = Math.sin(t * 2.2) * 0.5 + 0.5;
      body.scale.set(
        baseScale.x,
        baseScale.y * (1 + 0.025 * b * breathe),
        baseScale.z * (1 + 0.03 * b * breathe),
      );
      for (const l of lungs)
        l.scale.set(0.42 + 0.06 * b * breathe, 0.3 + 0.05 * b * breathe, 0.17 + 0.03 * b * breathe);
      // purr: a fine tremble of the whole body
      const j = purr * 0.006;
      group.position.y =
        (group.userData.y0 ?? (group.userData.y0 = group.position.y)) + Math.sin(t * 157) * j;
      // look up into the camera
      neckPivot.rotation.z = 0.12 * look;
      head.rotation.y = 0.55 - 0.35 * look;
      head.rotation.x = -0.1 * look + Math.sin(t * 1.3) * 0.02;
      head.rotation.z = Math.sin(t * 0.9) * 0.02;
      for (const c of closed) c.visible = eyes < 0.5;
      for (const o of open) {
        o.visible = eyes >= 0.5;
        o.scale.set(1, clamp01((eyes - 0.5) * 2) * 0.9 + 0.1, 1);
      }
      mouth.visible = mo > 0.03;
      mouth.scale.set(1, 0.05 + mo * 0.9, 0.6 + mo * 0.3);
      tail.rotation.y = Math.sin(t * 1.7) * 0.03 * tailWag;
      tip.position.y = 0.16 + Math.max(0, Math.sin(t * 2.6)) * 0.06 * tailWag;
    },
  };
}

// An enlarged larynx: open ring (cartilage) with two vocal folds that meet
// in the middle and flap open; optional yellow pads (Polster) on the folds.
export function makeLarynx() {
  const group = new THREE.Group();
  const cart = flat(0xf7cdd6, {
    roughness: 0.5,
    side: THREE.DoubleSide,
    emissive: 0x7a3040,
    emissiveIntensity: 0.55,
  });
  const ring = new THREE.Mesh(
    facet(new THREE.CylinderGeometry(0.2, 0.17, 0.26, 14, 1, true), 0.04, 3),
    facetMat(cart),
  );
  group.add(ring);
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.2, 0.025, 6, 20),
    flat(0xe8a7b4, { roughness: 0.5 }),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.13;
  group.add(rim);
  // epiglottis flap
  const epi = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 8, 6, 0, Math.PI, 0, Math.PI / 2),
    cart,
  );
  epi.position.set(0, 0.13, -0.16);
  epi.rotation.x = -0.6;
  group.add(epi);
  const foldMat = flat(0xff6f86, { emissive: 0xd03050, emissiveIntensity: 0.45, roughness: 0.35 });
  const padMat = flat(0xffd23f, { emissive: 0xffa800, emissiveIntensity: 0.6, roughness: 0.4 });
  const folds = [];
  const pads = [];
  for (const sx of [-1, 1]) {
    const f = new THREE.Group();
    group.add(f);
    const lip = new THREE.Mesh(
      facet(new THREE.IcosahedronGeometry(1, 1), 0.04, 5 + sx),
      facetMat(foldMat),
    );
    lip.scale.set(0.09, 0.05, 0.17);
    f.add(lip);
    const pad = new THREE.Mesh(
      facet(new THREE.IcosahedronGeometry(1, 1), 0.04, 9 + sx),
      facetMat(padMat),
    );
    pad.scale.set(0.055, 0.045, 0.1);
    pad.position.set(-0.01 * sx, 0.035, 0);
    f.add(pad);
    folds.push({ g: f, sx });
    pads.push(pad);
  }
  return {
    group,
    folds,
    pads,
    // gap 0 = closed (folds touch), 1 = wide open; pad 0..1 = pad size
    set(gap, pad = 0) {
      for (const { g, sx } of folds) g.position.set(sx * (0.08 + gap * 0.07), 0.02, 0);
      for (const p of pads) {
        p.visible = pad > 0.01;
        p.scale.set(0.068 * pad, 0.06 * pad, 0.13 * pad);
      }
    },
  };
}

// Purr rings: yellow (or any colour) rings that swell out of a point and
// fade, facing the camera. rings.update(t, k, centre, { color, size, speed })
export function makeRings(n = 4, color = 0xffd23f) {
  const mats = [];
  const meshes = [];
  for (let i = 0; i < n; i++) {
    const m = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      fog: false,
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.035, 6, 48), m);
    ring.userData.noAO = true;
    ring.renderOrder = 5;
    scene.add(ring);
    mats.push(m);
    meshes.push(ring);
  }
  const col = new THREE.Color();
  return {
    update(t, k, c, { size = 1.4, speed = 1.6, colorHex = color, width = 1 } = {}) {
      col.setHex(colorHex);
      meshes.forEach((ring, i) => {
        const ph = (t * speed + i / n) % 1;
        ring.visible = k > 0.01;
        ring.position.copy(c);
        ring.lookAt(camera.position);
        const s = 0.12 + ph * size;
        ring.scale.set(s, s, s * width);
        mats[i].color.copy(col);
        mats[i].opacity = k * (1 - ph) * 0.9;
      });
    },
  };
}
