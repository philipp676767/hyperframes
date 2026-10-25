// #31 "Erdloch" (format B): what happens if you jump into a hole straight
// through the Earth? A perfectly round hole in a back garden (set.js); you
// jump, fall through an endless shaft (the walls race past, you stay put),
// meet the halved Earth in a space bubble (you are the dot on the line),
// guess where you come out (the whole Earth spins: not Australia — the
// Pacific), rise out of a hole on a tiny island, miss the rim and fall back:
// forever back and forth. renderAt(t) is a pure function of t; all timing
// lives in beats.js.
import {
  THREE,
  ramp,
  smooth,
  clamp01,
  lerp,
  pop,
  V,
  scene,
  flat,
  M,
  jitter,
  facet,
  facetMat,
  noise2,
  rng,
  onFrame,
  showNope,
  makeArrowSet,
  animateArrows,
  forceMat,
  showPanel,
  LED,
  labels,
  showLabel,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { lawn } from "./set.js";
import { F, discGeo } from "./environments.js";
import { palm, rock } from "./props.js";
import { createHand } from "./hand.js";
import { gauge, stopwatch, counter } from "./hud.js";
import {
  T,
  shots as SHOTS,
  LABELS,
  HIGHLIGHTS,
  FALL as FALL_A,
  ISLAND as ISLAND_A,
  GLOBE as GLOBE_A,
  GLOBE2 as GLOBE2_A,
} from "./beats.js";

highlights(HIGHLIGHTS);

const FALL = V(...FALL_A);
const ISLAND = V(...ISLAND_A);
const GLOBE = V(...GLOBE_A);
const GLOBE2 = V(...GLOBE2_A);
const followRel = V(0, 0, 0); // the exit shots ride along with you
const applyCamera = shotCamera(
  SHOTS.map((s) => (s.rel ? { ...s, rel: s.follow ? followRel : V(...s.rel) } : s)),
);
const D2R = Math.PI / 180;
const HOLE_R = 1.2;
const col = (hex) => new THREE.Color(hex);

// ---------------------------------------------------------------- helpers
// cut every triangle of a (non-indexed) geometry that has a corner within r
// of the centre — the lawn and the ocean get their round hole this way
function cutHole(geo, r) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const p = g.attributes.position;
  const keep = [];
  for (let i = 0; i < p.count; i += 3) {
    let near = false;
    for (let j = 0; j < 3; j++) if (Math.hypot(p.getX(i + j), p.getZ(i + j)) < r) near = true;
    if (!near) keep.push(i);
  }
  const out = new THREE.BufferGeometry();
  for (const name of Object.keys(g.attributes)) {
    const a = g.attributes[name];
    const arr = new Float32Array(keep.length * 3 * a.itemSize);
    keep.forEach((i, n) => {
      for (let j = 0; j < 3; j++)
        for (let c = 0; c < a.itemSize; c++)
          arr[(n * 3 + j) * a.itemSize + c] = a.array[(i + j) * a.itemSize + c];
    });
    out.setAttribute(name, new THREE.BufferAttribute(arr, a.itemSize));
  }
  return out;
}
// colour a faceted geometry: base colour per vertex (fn(x, y, z) → Color),
// times the facet tint already in its "color" attribute
function paint(geo, fn) {
  const p = geo.attributes.position;
  const c = geo.attributes.color;
  const tmp = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    tmp.copy(fn(p.getX(i), p.getY(i), p.getZ(i)));
    c.setXYZ(i, c.getX(i) * tmp.r, c.getY(i) * tmp.g, c.getZ(i) * tmp.b);
  }
  c.needsUpdate = true;
  return geo;
}
// a raised rim around a hole (lathe), grassy / sandy outside, dirt inside
function rimMesh(pts, inner, outer, split, seed) {
  const geo = facet(
    new THREE.LatheGeometry(
      pts.map(([r, y]) => new THREE.Vector2(r, y)),
      64,
    ),
    0.08,
    seed,
  );
  const a = col(inner);
  const b = col(outer);
  paint(geo, (x, y, z) => {
    const r = Math.hypot(x, z);
    const k = smooth(clamp01((r - split) / 0.8));
    const n = noise2(x * 1.3, z * 1.3, seed) * 0.25 + 0.88;
    return a.clone().lerp(b, k).multiplyScalar(n);
  });
  const m = new THREE.Mesh(geo, flat(0xffffff, { vertexColors: true, side: THREE.DoubleSide }));
  m.receiveShadow = m.castShadow = true;
  return m;
}
// a shaft: open cylinder seen from inside, unlit, colour by depth
function shaft(depth, colorAt, seed) {
  const geo = facet(
    jitter(
      new THREE.CylinderGeometry(HOLE_R, HOLE_R, depth, 18, Math.round(depth / 1.2), true),
      0.05,
      seed,
    ),
    0.12,
    seed,
  );
  geo.translate(0, -depth / 2 + 0.31, 0);
  paint(geo, (x, y) => colorAt(-y));
  return new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false }),
  );
}

// ---------------------------------------------------------------- the hole in the garden
lawn.geometry = cutHole(lawn.geometry, 1.5);
const gardenRim = rimMesh(
  [
    [1.17, 0.26],
    [1.22, 0.38],
    [1.45, 0.47],
    [1.9, 0.45],
    [2.5, 0.33],
    [3.2, 0.17],
    [4.0, 0.06],
    [4.9, -0.06],
  ],
  0x7a4a2c,
  0x74b04c,
  2.3,
  4,
);
scene.add(gardenRim);
const SOIL = col(0x6b4026);
const ROCK = col(0x6f625a);
const DARK = col(0x150e0c);
const GLOW = col(0xff7a20);
scene.add(
  shaft(
    62,
    (d) => {
      if (d < 1.2) return SOIL.clone().multiplyScalar(1 - d * 0.15);
      const band = Math.sin(d * 2.1) > 0.3 ? 0.85 : 1;
      if (d < 3)
        return ROCK.clone()
          .lerp(DARK, smooth(clamp01((d - 1.2) / 1.8)))
          .multiplyScalar(band);
      return DARK.clone()
        .lerp(GLOW, smooth(clamp01((d - 3) / 9)))
        .multiplyScalar(band);
    },
    5,
  ),
);
{
  // the glow at the bottom of the garden shaft
  const cap = new THREE.Mesh(
    new THREE.CircleGeometry(HOLE_R + 0.1, 18),
    new THREE.MeshBasicMaterial({ color: 0xffc060, fog: false }),
  );
  cap.rotation.x = -Math.PI / 2;
  cap.position.y = -61.5;
  scene.add(cap);
}
// dirt clods on the rim + a pile with a spade
{
  const r = rng(12);
  const clodMat = flat(0x6f4228);
  for (let i = 0; i < 22; i++) {
    const a = r() * Math.PI * 2;
    const d = 1.5 + r() * 1.3;
    const m = F(
      jitter(new THREE.IcosahedronGeometry(0.07 + r() * 0.09, 0), 0.02, i),
      clodMat,
      0.12,
      i,
    );
    m.position.set(Math.cos(a) * d, 0.45 - (d - 1.5) * 0.1, Math.sin(a) * d);
    m.castShadow = true;
    scene.add(m);
  }
  const pile = F(
    jitter(new THREE.SphereGeometry(1.5, 12, 7, 0, Math.PI * 2, 0, Math.PI / 2), 0.12, 3),
    flat(0x744528),
    0.12,
    3,
  );
  pile.scale.set(1.2, 0.75, 1);
  pile.position.set(-3.6, 0, -3.3);
  pile.castShadow = pile.receiveShadow = true;
  scene.add(pile);
  const spade = new THREE.Group();
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.3, 6), M.woodDark);
  handle.position.y = 0.65;
  spade.add(handle);
  const grip = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.05), M.woodDark);
  grip.position.y = 1.3;
  spade.add(grip);
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.3, 0.03), M.steel);
  blade.position.y = -0.1;
  spade.add(blade);
  spade.position.set(-3.2, 0.95, -2.6);
  spade.rotation.set(0.2, 0.5, -0.25);
  spade.traverse((o) => o.isMesh && (o.castShadow = true));
  scene.add(spade);
}
// warning tape on red-white posts, torn on the side you run in from
{
  const postMat = flat(0xffffff);
  const redMat = flat(0xe2453c);
  const R0 = 2.75;
  const N = 8;
  const posts = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + 0.2;
    const x = Math.cos(a) * R0;
    const z = Math.sin(a) * R0;
    const y0 = 0.25 - (R0 - 2.5) * 0.2;
    const g = new THREE.Group();
    for (let k = 0; k < 4; k++) {
      const s = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 0.2, 6),
        k % 2 ? redMat : postMat,
      );
      s.position.y = 0.1 + k * 0.2;
      g.add(s);
    }
    g.position.set(x, y0, z);
    g.traverse((o) => o.isMesh && (o.castShadow = true));
    scene.add(g);
    posts.push(V(x, y0 + 0.7, z));
  }
  for (let i = 0; i < N; i++) {
    const a = posts[i];
    const b = posts[(i + 1) % N];
    if (a.x < -1.5 && b.x < -1.5) continue; // torn where you ran through
    const segs = 10;
    for (let k = 0; k < segs; k++) {
      const p0 = a.clone().lerp(b, k / segs);
      const p1 = a.clone().lerp(b, (k + 1) / segs);
      const sag = (f) => -Math.sin(Math.PI * f) * 0.12;
      p0.y += sag(k / segs);
      p1.y += sag((k + 1) / segs);
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(p0.distanceTo(p1), 0.08, 0.01),
        k % 2 ? redMat : postMat,
      );
      m.position.copy(p0).lerp(p1, 0.5);
      m.lookAt(p1);
      m.rotateY(Math.PI / 2);
      scene.add(m);
    }
  }
}
// the gnome, peering into the hole
const gnome = new THREE.Group();
{
  const body = F(new THREE.ConeGeometry(0.2, 0.38, 8), flat(0x3f6fd6), 0.06, 1);
  body.position.y = 0.19;
  gnome.add(body);
  const face = F(new THREE.SphereGeometry(0.11, 8, 6), flat(0xf1c09a), 0.05, 2);
  face.position.y = 0.43;
  gnome.add(face);
  const beard = F(new THREE.ConeGeometry(0.1, 0.2, 7), flat(0xffffff), 0.05, 3);
  beard.position.set(0, 0.33, 0.06);
  beard.rotation.x = Math.PI;
  gnome.add(beard);
  const hat = F(new THREE.ConeGeometry(0.12, 0.32, 8), flat(0xe2453c), 0.05, 4);
  hat.position.set(0, 0.62, -0.02);
  hat.rotation.x = -0.25;
  gnome.add(hat);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 4), flat(0xf0a080));
  nose.position.set(0, 0.42, 0.11);
  gnome.add(nose);
  gnome.traverse((o) => o.isMesh && (o.castShadow = true));
  gnome.scale.setScalar(1.6);
  gnome.position.set(1.15, 0.45, 1.25);
  gnome.lookAt(0, 0.1, 0);
  gnome.rotateX(0.35);
  scene.add(gnome);
}
// a small orange mini digger parked behind the hole
{
  const g = new THREE.Group();
  const yellow = flat(0xffa21f, { roughness: 0.55 });
  const tracks = F(new THREE.BoxGeometry(1.5, 0.35, 1.1), M.rubber, 0.06, 1);
  tracks.position.y = 0.18;
  g.add(tracks);
  const body = F(new THREE.BoxGeometry(1.1, 0.55, 0.9), yellow, 0.05, 2);
  body.position.y = 0.62;
  g.add(body);
  const cab = F(new THREE.BoxGeometry(0.6, 0.65, 0.7), flat(0x9fd0f0, { roughness: 0.2 }), 0.05, 3);
  cab.position.set(-0.15, 1.2, 0);
  g.add(cab);
  const roof = F(new THREE.BoxGeometry(0.7, 0.07, 0.8), yellow, 0.05, 4);
  roof.position.set(-0.15, 1.56, 0);
  g.add(roof);
  const boom = F(new THREE.BoxGeometry(1.4, 0.16, 0.16), yellow, 0.05, 5);
  boom.position.set(0.95, 1.15, 0);
  boom.rotation.z = 0.5;
  g.add(boom);
  const arm = F(new THREE.BoxGeometry(0.9, 0.13, 0.13), yellow, 0.05, 6);
  arm.position.set(1.75, 1.1, 0);
  arm.rotation.z = -0.9;
  g.add(arm);
  const bucket = F(new THREE.BoxGeometry(0.35, 0.3, 0.42), M.steel, 0.05, 7);
  bucket.position.set(2.0, 0.6, 0);
  g.add(bucket);
  g.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  g.position.set(3.4, 0, -3.8);
  g.rotation.y = 2.4;
  scene.add(g);
}

// ---------------------------------------------------------------- you (a low-poly person)
function makePerson() {
  const g = new THREE.Group();
  const hoodie = flat(0x4a7bd6);
  const jeans = flat(0x2f4f7f);
  const skin = flat(0xf1c09a, { roughness: 0.7 });
  const hairMat = flat(0x5a3a22);
  const shoe = flat(0xf6f6f6);
  const mk = (geo, mat, x, y, z, parent, seed) => {
    const m = new THREE.Mesh(facet(geo, 0.07, seed), facetMat(mat));
    m.position.set(x, y, z);
    m.castShadow = true;
    parent.add(m);
    return m;
  };
  const legs = [];
  for (const s of [-1, 1]) {
    const hip = new THREE.Group();
    hip.position.set(s * 0.09, 0.5, 0);
    g.add(hip);
    mk(new THREE.BoxGeometry(0.13, 0.46, 0.14), jeans, 0, -0.23, 0, hip, 3 + s);
    mk(new THREE.BoxGeometry(0.14, 0.08, 0.22), shoe, 0, -0.47, 0.04, hip, 5 + s);
    legs.push(hip);
  }
  const torso = mk(new THREE.BoxGeometry(0.38, 0.44, 0.23), hoodie, 0, 0.72, 0, g, 7);
  torso.geometry.translate(0, 0, 0);
  mk(new THREE.BoxGeometry(0.3, 0.12, 0.12), hoodie, 0, 0.92, -0.1, g, 8); // hood
  const pocket = mk(new THREE.BoxGeometry(0.24, 0.1, 0.02), flat(0x3f6cc0), 0, 0.6, 0.12, g, 9);
  pocket.castShadow = false;
  const head = new THREE.Group();
  head.position.set(0, 1.07, 0);
  g.add(head);
  mk(new THREE.IcosahedronGeometry(0.15, 1), skin, 0, 0, 0, head, 10);
  const hair = mk(
    new THREE.SphereGeometry(0.165, 9, 6, 0, Math.PI * 2, 0, Math.PI * 0.55),
    hairMat,
    0,
    0.02,
    -0.015,
    head,
    11,
  );
  hair.rotation.x = -0.25;
  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 4), flat(0x1c1c22));
    eye.position.set(s * 0.055, 0.01, 0.135);
    head.add(eye);
  }
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), flat(0x8a2a2a));
  mouth.scale.set(1.3, 0.8, 0.5);
  mouth.position.set(0, -0.065, 0.135);
  head.add(mouth);
  // hood strings (they float when you're weightless)
  const strings = [];
  for (const s of [-1, 1]) {
    const piv = new THREE.Group();
    piv.position.set(s * 0.06, 0.9, 0.12);
    g.add(piv);
    const st = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.17, 0.018), flat(0xffffff));
    st.position.y = -0.085;
    piv.add(st);
    strings.push(piv);
  }
  const arms = [];
  for (const s of [-1, 1]) {
    const sh = new THREE.Group();
    sh.position.set(s * 0.23, 0.9, 0);
    g.add(sh);
    mk(new THREE.BoxGeometry(0.1, 0.4, 0.11), hoodie, 0, -0.2, 0, sh, 12 + s);
    mk(new THREE.IcosahedronGeometry(0.055, 0), skin, 0, -0.43, 0, sh, 14 + s);
    arms.push(sh);
  }
  // pose: legs [x rotations], arms {x, z} per side, head tilt
  function pose({
    legL = 0,
    legR = 0,
    armL = [0, 0],
    armR = [0, 0],
    head: h = 0,
    float = 0,
    t = 0,
  }) {
    legs[0].rotation.x = legL;
    legs[1].rotation.x = legR;
    arms[0].rotation.set(armL[0], 0, -armL[1]);
    arms[1].rotation.set(armR[0], 0, armR[1]);
    head.rotation.x = h;
    strings.forEach((p, i) => {
      p.rotation.x = lerp(0, -2.4 + Math.sin(t * 2 + i) * 0.4, float);
      p.rotation.z = lerp(0, (i ? 0.4 : -0.4) + Math.sin(t * 1.7 + i * 2) * 0.3, float);
    });
  }
  return { g, pose };
}
const you = makePerson();
scene.add(you.g);

// the phone that floats out of your pocket
const phone = new THREE.Group();
{
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.16, 0.012),
    flat(0x1c1c22, { roughness: 0.3 }),
  );
  phone.add(body);
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.068, 0.142),
    new THREE.MeshBasicMaterial({ color: 0x8fd0ff }),
  );
  screen.position.z = 0.007;
  phone.add(screen);
  phone.scale.setScalar(1.5);
  scene.add(phone);
}
// the toy plane you overtake in the shaft
const plane = new THREE.Group();
{
  const white = flat(0xf6f6f8, { roughness: 0.4 });
  const fus = F(new THREE.CapsuleGeometry(0.06, 0.42, 3, 8), white, 0.05, 1);
  plane.add(fus);
  const wing = F(new THREE.BoxGeometry(0.62, 0.012, 0.11), white, 0.05, 2);
  wing.position.y = 0.02;
  wing.rotation.x = Math.PI / 2;
  plane.add(wing);
  const tail = F(new THREE.BoxGeometry(0.22, 0.012, 0.06), white, 0.05, 3);
  tail.position.y = 0.22;
  tail.rotation.x = Math.PI / 2;
  plane.add(tail);
  const fin = F(new THREE.BoxGeometry(0.012, 0.1, 0.08), flat(0xe2453c), 0.05, 4);
  fin.position.set(0, 0.24, -0.05);
  plane.add(fin);
  const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.05, 8), flat(0x3f6fd6));
  stripe.position.y = -0.05;
  plane.add(stripe);
  plane.traverse((o) => o.isMesh && (o.castShadow = true));
  plane.scale.setScalar(1.2);
  scene.add(plane);
}

// ---------------------------------------------------------------- the endless shaft
// You stay at FALL, the walls race upwards: identical 6-unit chunks whose
// shape repeats exactly, scrolled by the integrated fall speed.
const CH = 6;
const TR = 2.5; // shaft radius
const NCH = 15;
const chunkGeo = (() => {
  const geo = new THREE.CylinderGeometry(TR, TR, CH, 22, 6, true);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const z = p.getZ(i);
    const y = p.getY(i);
    const a = Math.atan2(z, x);
    const w = (2 * Math.PI * y) / CH;
    const r =
      TR + 0.12 * Math.sin(3 * a + w) * Math.cos(5 * a - 2 * w) + 0.07 * Math.sin(7 * a + 3 * w);
    p.setXYZ(i, Math.cos(a) * r, y, Math.sin(a) * r);
  }
  const g = facet(geo, 0.16, 8);
  paint(g, (x, y) => {
    const b = 0.78 + 0.22 * (Math.sin(((2 * Math.PI * y) / CH) * 2) > 0 ? 1 : 0.55);
    return new THREE.Color(b, b, b);
  });
  return g;
})();
const wallMat = new THREE.MeshBasicMaterial({
  vertexColors: true,
  side: THREE.BackSide,
  fog: false,
});
const walls = new THREE.InstancedMesh(chunkGeo, wallMat, NCH);
walls.frustumCulled = false;
scene.add(walls);
const capMat = (c) => new THREE.MeshBasicMaterial({ color: c, fog: false, side: THREE.DoubleSide });
const topCap = new THREE.Mesh(new THREE.CircleGeometry(TR + 0.3, 22), capMat(0xd8ecff));
topCap.rotation.x = Math.PI / 2;
scene.add(topCap);
const botCap = new THREE.Mesh(new THREE.CircleGeometry(TR + 0.3, 22), capMat(0xff7a20));
botCap.rotation.x = -Math.PI / 2;
botCap.position.set(FALL.x, FALL.y - 42, FALL.z);
scene.add(botCap);
// speed streaks + sparks near the walls
const NSTREAK = 46;
const streaks = new THREE.InstancedMesh(
  new THREE.BoxGeometry(0.014, 1, 0.014),
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.55,
    fog: false,
    depthWrite: false,
  }),
  NSTREAK,
);
streaks.frustumCulled = false;
scene.add(streaks);
const NSPARK = 60;
const sparks = new THREE.InstancedMesh(
  new THREE.OctahedronGeometry(0.035, 0),
  new THREE.MeshBasicMaterial({ color: 0xffd27a, fog: false }),
  NSPARK,
);
sparks.frustumCulled = false;
scene.add(sparks);
const streakSeed = (() => {
  const r = rng(77);
  return Array.from({ length: Math.max(NSTREAK, NSPARK) }, () => [
    r() * Math.PI * 2,
    1.7 + r() * 0.6,
    r() * 60,
    r(),
  ]);
})();
const youLight = new THREE.PointLight(0xff8a3a, 0, 9, 1.6);
scene.add(youLight);

// fall speed (shaft units per second of scene time) and its integral
function speedAt(t) {
  if (t < T.faellst1) return 0;
  if (t < T.nach1) return lerp(7, 34, smooth(ramp(t, T.faellst1, T.seltsame)));
  if (t >= T.um && t < T.heiss) return 46;
  return 30;
}
const SCROLL = (() => {
  const dt = 1 / 120;
  const n = Math.ceil(62 / dt);
  const a = new Float32Array(n + 1);
  for (let i = 1; i <= n; i++) a[i] = a[i - 1] + speedAt((i - 0.5) * dt) * dt;
  return (t) => {
    const x = clamp01(t / 62) * n;
    const i = Math.floor(x);
    return i >= n ? a[n] : lerp(a[i], a[i + 1], x - i);
  };
})();
const WALL_SOIL = col(0x8a6a50);
const WALL_DEEP = col(0x8a3a24);
const WALL_HOT = col(0xfff0c0);
const m4 = new THREE.Matrix4();
const q4 = new THREE.Quaternion();
const s4 = V(1, 1, 1);
function updateShaft(t, on) {
  walls.visible = topCap.visible = botCap.visible = streaks.visible = on;
  if (!on) {
    sparks.visible = false;
    return;
  }
  const sc = SCROLL(t) % CH;
  for (let i = 0; i < NCH; i++) {
    m4.makeTranslation(FALL.x, FALL.y + (i - (NCH - 1) / 2) * CH + sc, FALL.z);
    walls.setMatrixAt(i, m4);
  }
  walls.instanceMatrix.needsUpdate = true;
  // the wall colour: soil → deep red rock → white-hot in the core
  const core = t >= T.um && t < T.heiss;
  const deep = smooth(ramp(t, T.unten, T.folg));
  wallMat.color.copy(WALL_SOIL).lerp(WALL_DEEP, deep);
  if (core) wallMat.color.copy(WALL_HOT);
  topCap.position.set(FALL.x, FALL.y + Math.min(40, 3 + Math.max(0, t - T.faellst1) * 8), FALL.z);
  topCap.material.color.set(0xd8ecff).multiplyScalar(t < T.keine ? 1 : 0.6);
  botCap.material.color.set(core ? 0xffffff : 0xff7a20).multiplyScalar(0.35 + 0.65 * deep);
  const v = speedAt(t);
  const sc2 = SCROLL(t) * 1.35;
  for (let i = 0; i < NSTREAK; i++) {
    const [a, r, y0] = streakSeed[i];
    const y = ((((y0 + sc2) % 60) + 60) % 60) - 30;
    const len = 0.2 + v * 0.06;
    q4.identity();
    s4.set(1, len, 1);
    m4.compose(V(FALL.x + Math.cos(a) * r, FALL.y + y, FALL.z + Math.sin(a) * r), q4, s4);
    streaks.setMatrixAt(i, m4);
  }
  streaks.instanceMatrix.needsUpdate = true;
  sparks.visible = core;
  if (core) {
    for (let i = 0; i < NSPARK; i++) {
      const [a, r, y0, w] = streakSeed[i];
      const y = ((((y0 * 0.4 + SCROLL(t) * (0.8 + w)) % 24) + 24) % 24) - 12;
      const aa = a + Math.sin(t * 3 + i) * 0.2;
      m4.makeTranslation(
        FALL.x + Math.cos(aa) * r * 0.95,
        FALL.y + y,
        FALL.z + Math.sin(aa) * r * 0.95,
      );
      sparks.setMatrixAt(i, m4);
    }
    sparks.instanceMatrix.needsUpdate = true;
  }
  youLight.position.set(FALL.x, FALL.y - 1.5, FALL.z);
  youLight.intensity = core ? 14 : 3.5 * deep;
  youLight.color.set(core ? 0xffc070 : 0xff7a3a);
}

// ---------------------------------------------------------------- the exit: an island in the Pacific
const island = new THREE.Group();
island.position.copy(ISLAND);
scene.add(island);
{
  island.add(
    rimMesh(
      [
        [1.17, 0.26],
        [1.24, 0.36],
        [1.6, 0.4],
        [2.6, 0.34],
        [3.6, 0.2],
        [4.5, 0.04],
        [5.3, -0.35],
      ],
      0xd9b47a,
      0xf2dca4,
      1.9,
      9,
    ),
  );
  const ocean = new THREE.Mesh(
    cutHole(facet(discGeo(62, 2.2, 3), 0.05, 3), 4.6),
    new THREE.MeshStandardMaterial({
      color: 0x2f9be0,
      roughness: 0.18,
      metalness: 0.05,
      flatShading: true,
      vertexColors: true,
    }),
  );
  ocean.receiveShadow = true;
  island.add(ocean);
  const base = Float32Array.from(ocean.geometry.attributes.position.array);
  onFrame((t) => {
    if (!island.visible) return;
    const p = ocean.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 3];
      const z = base[i * 3 + 2];
      p.setY(i, -0.04 + Math.sin(x * 0.45 + t * 1.3) * 0.07 + Math.cos(z * 0.5 - t * 1.1) * 0.06);
    }
    p.needsUpdate = true;
    ocean.geometry.computeVertexNormals();
  });
  const foam = new THREE.Mesh(
    new THREE.TorusGeometry(4.75, 0.12, 4, 48),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6, flatShading: true }),
  );
  foam.rotation.x = Math.PI / 2;
  foam.scale.z = 0.4;
  foam.position.y = 0.02;
  island.add(foam);
  const p1 = palm(3, 0.35);
  p1.position.set(-2.6, 0.3, -1.6);
  p1.scale.setScalar(0.75);
  island.add(p1);
  const p2 = palm(5, -0.25);
  p2.position.set(2.9, 0.2, -2.2);
  p2.rotation.y = 2.2;
  p2.scale.setScalar(0.6);
  island.add(p2);
  for (const [x, z, s, sd] of [
    [3.0, 1.4, 0.35, 1],
    [-3.2, 1.6, 0.28, 2],
    [1.8, -3.4, 0.4, 3],
  ]) {
    const r0 = rock(sd, s);
    r0.position.set(x, 0.18, z);
    island.add(r0);
  }
  // a starfish on the sand
  const star = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.03, 5), flat(0xff7a5a));
  star.position.set(1.6, 0.36, 1.6);
  island.add(star);
  // the exit shaft
  island.add(
    shaft(
      44,
      (d) => {
        if (d < 1) return col(0xd9b47a).multiplyScalar(1 - d * 0.2);
        return ROCK.clone().lerp(DARK, smooth(clamp01((d - 1) / 16)));
      },
      7,
    ),
  );
}

// ---------------------------------------------------------------- space bubble with the Earth
const space = new THREE.Group();
space.position.copy(GLOBE);
scene.add(space);
{
  space.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(110, 32, 16),
      new THREE.MeshBasicMaterial({ color: 0x05060f, side: THREE.BackSide, fog: false }),
    ),
  );
  const r = rng(41);
  const n = 1800;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const u = r() * 2 - 1;
    const a = r() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    pos.set([Math.cos(a) * s * 100, u * 100, Math.sin(a) * s * 100], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  space.add(
    new THREE.Points(
      g,
      new THREE.PointsMaterial({ color: 0xffffff, size: 2.4, sizeAttenuation: false, fog: false }),
    ),
  );
}
// continents (lat/lon blobs, borrowed from #24 Erde-Stopp)
const BLOBS = [
  [50, 12, 9, 16],
  [44, 12, 4, 6],
  [40, -4, 5, 6],
  [61, 15, 7, 9],
  [54, 30, 10, 18],
  [54, -2, 4, 3],
  [55, 70, 12, 30],
  [61, 105, 12, 30],
  [45, 90, 12, 25],
  [33, 105, 10, 15],
  [24, 79, 8, 9],
  [14, 78, 7, 5],
  [15, 102, 8, 6],
  [63, 140, 10, 22],
  [36, 45, 8, 12],
  [24, 47, 8, 9],
  [36, 138, 5, 3],
  [10, 20, 14, 20],
  [24, 10, 8, 22],
  [-5, 22, 14, 13],
  [-20, 25, 10, 9],
  [-30, 23, 5, 7],
  [6, 40, 6, 7],
  [55, -100, 14, 28],
  [45, -90, 10, 20],
  [38, -100, 9, 18],
  [30, -95, 6, 12],
  [20, -102, 7, 8],
  [13, -87, 5, 5],
  [63, -150, 7, 15],
  [68, -100, 7, 30],
  [52, -75, 9, 12],
  [72, -42, 9, 14],
  [0, -62, 12, 14],
  [-15, -55, 12, 12],
  [-30, -62, 10, 8],
  [-45, -68, 8, 4],
  [8, -70, 5, 8],
  [-25, 134, 9, 16],
  [-19, 141, 6, 8],
  [-2, 115, 3, 10],
  [-40, 175, 5, 4],
  [-44, 170, 4, 3.5],
];
const wrap = (d) => ((((d + 180) % 360) + 360) % 360) - 180;
function landMask(lat, lon) {
  if (lat < -68) return 0.4 + (lat + 68) * -0.02;
  let m = -1;
  for (const [a, b, ra, rb] of BLOBS) {
    const qq = Math.hypot((lat - a) / ra, wrap(lon - b) / rb);
    m = Math.max(m, 1 - qq);
  }
  return m + (noise2(lat * 0.09 + 3, lon * 0.09, 4) - 0.5) * 0.3;
}
const latLonOf = (x, y, z) => {
  const r = Math.hypot(x, y, z);
  return [Math.asin(y / r) / D2R, Math.atan2(x, z) / D2R];
};
const onSphere = (lat, lon, r) =>
  V(
    r * Math.cos(lat * D2R) * Math.sin(lon * D2R),
    r * Math.sin(lat * D2R),
    r * Math.cos(lat * D2R) * Math.cos(lon * D2R),
  );
const SEA = col(0x3d8fd6);
function earthColor(la, lo, n) {
  if (landMask(la, lo) <= 0.02) return SEA.clone().multiplyScalar(0.9 + n * 0.2);
  if (la < -62 || (la > 60 && lo > -60 && lo < -20)) return col(0xf4f7ff);
  if ((la > 14 && la < 33 && lo > -18 && lo < 58) || (la < -18 && la > -32 && lo > 120 && lo < 148))
    return col(n > 0.5 ? 0xe8c784 : 0xdcb46e);
  return col(n > 0.55 ? 0x6bb64e : n > 0.3 ? 0x56a144 : 0x7cbf55);
}
// colour a sphere geometry face by face from the land mask
function paintEarth(geo, bump) {
  const g = facet(geo, 0.06, 21);
  const p = g.attributes.position;
  const c = g.attributes.color;
  for (let i = 0; i < p.count; i += 3) {
    const x = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3;
    const y = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3;
    const z = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3;
    const [la, lo] = latLonOf(x, y, z);
    const cc = earthColor(la, lo, noise2(la * 0.2, lo * 0.2, 2));
    for (let j = 0; j < 3; j++)
      c.setXYZ(i + j, c.getX(i + j) * cc.r, c.getY(i + j) * cc.g, c.getZ(i + j) * cc.b);
  }
  if (bump) {
    for (let i = 0; i < p.count; i++) {
      const [la, lo] = latLonOf(p.getX(i), p.getY(i), p.getZ(i));
      const k = 1 + 0.012 * smooth(clamp01((landMask(la, lo) + 0.02) / 0.08));
      p.setXYZ(i, p.getX(i) * k, p.getY(i) * k, p.getZ(i) * k);
    }
    g.computeVertexNormals();
  }
  return g;
}
const R = 4;
const earthMat = new THREE.MeshStandardMaterial({
  vertexColors: true,
  flatShading: true,
  roughness: 0.65,
});

// the halved Earth: back half of the ball + the cut face with its layers
const cut = new THREE.Group();
cut.position.copy(GLOBE);
scene.add(cut);
{
  const back = new THREE.Mesh(
    paintEarth(new THREE.SphereGeometry(R, 72, 36, Math.PI, Math.PI), false),
    earthMat,
  );
  cut.add(back);
  const layers = [
    [3.86, 4.0, 0x7a5236, 0x000000, 0],
    [3.05, 3.86, 0xc4502a, 0x5a1400, 0.35],
    [2.18, 3.05, 0xe2682a, 0x8a2a00, 0.5],
    [0.77, 2.18, 0xffa23a, 0xff6a10, 0.9],
  ];
  layers.forEach(([r0, r1, c, e, ei], i) => {
    const m = F(
      new THREE.RingGeometry(r0, r1, 96, 3),
      flat(c, { emissive: e, emissiveIntensity: ei }),
      0.05,
      30 + i,
    );
    m.position.z = 0.002 * i;
    cut.add(m);
  });
  const inner = F(
    new THREE.CircleGeometry(0.77, 40),
    flat(0xfff2b0, { emissive: 0xffd060, emissiveIntensity: 1.6 }),
    0.04,
    35,
  );
  inner.position.z = 0.01;
  cut.add(inner);
  const glow = new THREE.PointLight(0xffa040, 5, 9, 1.4);
  glow.position.set(0, 0, 1.6);
  cut.add(glow);
}
// the line of the hole: from Austria (48° N) through the centre to the other side
const A = V(-R * Math.cos(48 * D2R), R * Math.sin(48 * D2R), 0.05);
const tunnelLine = new THREE.Mesh(
  new THREE.CylinderGeometry(0.055, 0.055, 2 * R, 8),
  new THREE.MeshBasicMaterial({ color: 0x241510 }),
);
tunnelLine.position.z = 0.05;
tunnelLine.quaternion.setFromUnitVectors(V(0, 1, 0), A.clone().setZ(0).normalize());
cut.add(tunnelLine);
// little markers at both ends: a flag for Austria, a palm dot for the island
{
  const flag = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 5), flat(0xffffff));
  pole.position.y = 0.25;
  flag.add(pole);
  [0xe2453c, 0xffffff, 0xe2453c].forEach((c, i) => {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 0.01), flat(c));
    s.position.set(0.15, 0.46 - i * 0.06, 0);
    flag.add(s);
  });
  flag.position.copy(A).setZ(0.1);
  flag.rotation.z = Math.atan2(A.y, A.x) - Math.PI / 2;
  cut.add(flag);
  const isle = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 5), flat(0x6bb64e));
  isle.position.copy(A).multiplyScalar(-1).setZ(0.1);
  cut.add(isle);
}
// you: a glowing dot (+ a short trail)
const dot = new THREE.Mesh(
  new THREE.SphereGeometry(0.13, 12, 8),
  new THREE.MeshBasicMaterial({ color: 0xffe14a }),
);
cut.add(dot);
const halo = new THREE.Mesh(
  new THREE.CircleGeometry(0.3, 20),
  new THREE.MeshBasicMaterial({
    color: 0xffe14a,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  }),
);
cut.add(halo);
const trail = Array.from({ length: 10 }, (_, i) => {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(0.09 * (1 - i / 12), 8, 5),
    new THREE.MeshBasicMaterial({
      color: 0xffe14a,
      transparent: true,
      opacity: 0.5 * (1 - i / 10),
    }),
  );
  cut.add(m);
  return m;
});
const linePos = (u) => A.clone().multiplyScalar(-u).setZ(0.16); // u = -1 Austria … +1 the other side
// gravity arrows ride with the dot and point to the centre
const gArrows = new THREE.Group();
cut.add(gArrows);
const gravity = makeArrowSet(
  [
    [V(0.25, 0.3, 0), V(1.25, 0.3, 0)],
    [V(0.25, -0.3, 0), V(1.25, -0.3, 0)],
  ],
  { parent: gArrows, mat: forceMat, amp: 0, r: 0.045 },
);
// the deepest hole ever drilled: a tiny rig on the north pole
{
  const rig = new THREE.Group();
  const red = flat(0xe2453c);
  for (const [x, z] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.2, 4), red);
    leg.position.set(x * 0.025, 0.1, z * 0.025);
    leg.rotation.set(z * 0.22, 0, -x * 0.22);
    rig.add(leg);
  }
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.012, 0.03), red);
  top.position.y = 0.2;
  rig.add(top);
  const hut = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.035, 0.04), flat(0xf4f1ea));
  hut.position.set(0.07, 0.018, 0);
  rig.add(hut);
  rig.position.set(0, R, 0.04);
  cut.add(rig);
  const drill = new THREE.Mesh(
    new THREE.BoxGeometry(0.008, 0.03, 0.004),
    flat(0xffe14a, { emissive: 0xffd040, emissiveIntensity: 1 }),
  );
  drill.position.set(0, R - 0.015, 0.012);
  cut.add(drill);
}

// the whole Earth (where do you come out?)
const tilt = new THREE.Group();
tilt.position.copy(GLOBE2);
scene.add(tilt);
const spin = new THREE.Group();
tilt.add(spin);
spin.add(new THREE.Mesh(paintEarth(new THREE.IcosahedronGeometry(R, 22), true), earthMat));
{
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.06, 40, 24),
    new THREE.MeshBasicMaterial({
      color: 0x7fc4ff,
      transparent: true,
      opacity: 0.16,
      side: THREE.BackSide,
      depthWrite: false,
    }),
  );
  tilt.add(atmo);
}
function makePin(color) {
  const g = new THREE.Group();
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.01, 0.6, 6), flat(0xf4f1ea));
  stick.position.y = 0.3;
  g.add(stick);
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 10, 7),
    flat(color, { emissive: color, emissiveIntensity: 0.3 }),
  );
  head.position.y = 0.62;
  g.add(head);
  spin.add(g);
  return g;
}
function pinAt(pin, lat, lon) {
  pin.position.copy(onSphere(lat, lon, R * 1.01));
  pin.quaternion.setFromUnitVectors(V(0, 1, 0), pin.position.clone().normalize());
}
const AT = [48.2, 16.4];
const AU = [-25, 134];
const ANTI = [-48.2, -163.6];
const NZ = [-41, 174];
const pinAT = makePin(0xffe14a);
pinAt(pinAT, ...AT);
const pinOut = makePin(0xffe14a);
pinAt(pinOut, ...ANTI);
const dashed = (() => {
  // a dotted line from Austria to the exit point
  const g = new THREE.Group();
  for (let i = 0; i < 18; i++) {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 6, 4),
      new THREE.MeshBasicMaterial({ color: 0xffe14a }),
    );
    g.add(m);
  }
  spin.add(g);
  return g;
})();
const worldOf = (obj, local) => {
  obj.updateMatrixWorld(true);
  return obj.localToWorld(local.clone());
};

// ---------------------------------------------------------------- hand
const hand = createHand({ scale: 0.7 });

// the sun's shadow box sits on the garden; on the island it moves along
let keyLight = null;
scene.traverse((o) => {
  if (o.isDirectionalLight && o.castShadow) keyLight = o;
});
const KEY_POS = keyLight.position.clone();
scene.add(keyLight.target);
function moveSun(off) {
  keyLight.position.copy(KEY_POS).add(off);
  keyLight.target.position.copy(off);
}

// ---------------------------------------------------------------- dirt crumbs on frame 0
const crumbs = Array.from({ length: 14 }, (_, i) => {
  const m = F(
    jitter(new THREE.IcosahedronGeometry(0.035 + (i % 4) * 0.012, 0), 0.01, i),
    flat(0x6f4228),
    0.1,
    i,
  );
  scene.add(m);
  return m;
});
const crumbR = rng(5);
const crumbSeed = crumbs.map(() => [-0.35 + crumbR() * 0.7, crumbR() * 0.25, crumbR() * 0.3]);

// ---------------------------------------------------------------- your path
// exit: rising in the island shaft, a moment of standstill at the rim, then back down
const APEX = 45.2;
const APEX_Y = -0.45;
function exitY(t) {
  if (t < APEX) {
    const k = clamp01((t - T.bremst) / (APEX - T.bremst));
    return APEX_Y - 16.5 * (1 - k) * (1 - k);
  }
  if (t < T.faellst3) return APEX_Y + Math.sin((t - APEX) * 2) * 0.02;
  return APEX_Y - 6 * (t - T.faellst3) * (t - T.faellst3);
}
// the dot on the halved Earth
function dotU(t) {
  if (t < T.ueber) return lerp(-0.78, -0.04, Math.pow(ramp(t, T.nach1, T.ueber + 0.2), 1.6));
  if (t < T.um) return lerp(-0.04, 0.16, ramp(t, T.ueber, T.um));
  if (t < T.fuer) return lerp(0.18, 0.8, Math.sin((ramp(t, T.ab, T.bremst + 0.6) * Math.PI) / 2));
  return Math.cos(((t - T.fuer) / 1.15) * Math.PI * 2 + Math.PI);
}

function poseFall(t, float = 0) {
  you.pose({
    legL: -0.3 + Math.sin(t * 2.3) * 0.12,
    legR: 0.25 + Math.sin(t * 2.1 + 1) * 0.12,
    armL: [Math.sin(t * 1.9) * 0.2, 2.5 + Math.sin(t * 2.6) * 0.15],
    armR: [Math.sin(t * 2.2 + 1) * 0.2, 2.4 + Math.sin(t * 2.4 + 2) * 0.15],
    head: -0.25,
    float,
    t,
  });
}

// ---------------------------------------------------------------- render
function renderAt(t) {
  const inShaft = t >= T.faellst1 && t < T.nach1;
  const inCore = t >= T.um && t < T.heiss;
  const exitPhase = t >= T.bremst && t < T.fuer;
  updateShaft(t, inShaft || inCore);
  island.visible = exitPhase;
  moveSun(exitPhase ? ISLAND : V(0, 0, 0));

  // ---- you
  you.g.visible = true;
  you.g.rotation.set(0, 0, 0);
  you.g.scale.setScalar(1);
  if (t < 1.2) {
    you.g.visible = false; // frame 0 is your own POV
  } else if (t < T.anlauf) {
    // standing at the rim, looking down
    you.g.position.set(-1.72, 0.44, 0.35);
    you.g.rotation.y = Math.PI / 2 - 0.15;
    you.pose({ armL: [0.1, 0.25], armR: [-0.4, 0.15], head: 0.55 + Math.sin(t * 1.5) * 0.05, t });
  } else if (t < T.springst - 0.25) {
    // the run-up
    const k = ramp(t, T.anlauf, T.springst - 0.25);
    const ph = (t - T.anlauf) * 13;
    you.g.position.set(
      lerp(-5.4, -1.75, k),
      0.0 + clamp01((k - 0.55) / 0.45) * 0.44 + Math.abs(Math.sin(ph)) * 0.06,
      0.25,
    );
    you.g.rotation.y = Math.PI / 2;
    you.g.rotation.x = 0.18;
    you.pose({
      legL: Math.sin(ph) * 0.9,
      legR: -Math.sin(ph) * 0.9,
      armL: [-Math.sin(ph) * 0.9, 0.15],
      armR: [Math.sin(ph) * 0.9, 0.15],
      head: 0.1,
      t,
    });
  } else if (t < T.faellst1) {
    // the jump: over the rim and into the shaft
    const s = t - (T.springst - 0.25);
    you.g.position.set(
      lerp(-1.75, 0, smooth(clamp01(s / 0.55))),
      0.44 + 2.2 * s - 4.9 * s * s,
      0.25 * (1 - clamp01(s / 0.55)),
    );
    you.g.rotation.y = Math.PI / 2;
    you.g.rotation.z = -clamp01(s / 0.5) * 0.4;
    poseFall(t);
  } else if (inShaft || inCore) {
    you.g.position.copy(FALL);
    you.g.rotation.y = t * 0.35;
    const fl = t >= T.seltsame ? smooth(ramp(t, T.seltsame, T.seltsame + 0.8)) : 0;
    poseFall(t, fl);
    you.g.rotation.x = Math.sin(t * 0.7) * 0.15 * fl;
  } else if (exitPhase && t < T.haeltst) {
    you.g.position.set(ISLAND.x, ISLAND.y + exitY(t), ISLAND.z + 0.55);
    const k = smooth(ramp(t, T.genau, APEX));
    you.pose({
      legL: -0.2,
      legR: 0.2,
      armL: [lerp(0, -0.4, k), lerp(2.6, 2.9, k)],
      armR: [lerp(0, -0.4, k), lerp(2.5, 2.9, k)],
      head: lerp(-0.5, 0.15, k),
      float: 1 - k,
      t,
    });
  } else if (exitPhase && t < T.zurueck) {
    // the grab for the rim — fingers a hair short — and the slip
    you.g.position.set(ISLAND.x, ISLAND.y + exitY(t), ISLAND.z + 0.55);
    const reach = smooth(ramp(t, T.haeltst, T.fest));
    const slip = smooth(ramp(t, T.faellst3 - 0.2, T.zurueck));
    you.g.rotation.x = 0.25 * reach;
    you.pose({
      legL: -0.2,
      legR: 0.2,
      armL: [lerp(-0.4, -1.75, reach) - slip * 1.2, lerp(2.9, 0.25, reach)],
      armR: [lerp(-0.4, -1.65, reach) - slip * 1.2, lerp(2.9, 0.2, reach)],
      head: lerp(0.15, 0.35, reach) - slip * 0.6,
      t,
    });
  } else if (exitPhase && t >= T.zurueck) {
    you.g.position.set(ISLAND.x, ISLAND.y + exitY(t), ISLAND.z + 0.55);
    poseFall(t, 0.6);
  } else {
    you.g.visible = false;
  }
  followRel.set(ISLAND.x, ISLAND.y + exitY(t), ISLAND.z);

  // ---- frame 0: your hand slaps the rim, dirt crumbles into the shaft
  if (t < 1.2) {
    hand.track(t, [
      { t: -0.6, pos: [0.32, 0.95, 2.2], rot: [0.3, Math.PI, 0], pose: "open" },
      { t: 0.0, pos: [0.22, 0.7, 1.75], rot: [0.35, Math.PI, 0], pose: "open" },
      { t: 0.42, pos: [0.14, 0.5, 1.28], rot: [0.45, Math.PI, 0], pose: "grab" },
      { t: 0.85, pos: [0.13, 0.48, 1.25], rot: [0.5, Math.PI, 0], pose: "fist" },
      { t: 1.2, pos: [0.13, 0.48, 1.25], rot: [0.5, Math.PI, 0], pose: "fist", out: true },
    ]);
  } else {
    hand.track(t, [{ t: 999, pos: [0, 0, 0], rot: [0, 0, 0], pose: "open", out: true }]);
  }
  crumbs.forEach((c, i) => {
    const [x, dz, d] = crumbSeed[i];
    const s = t - 0.42 - d;
    c.visible = t < 1.25 && s > -0.4;
    const fall = Math.max(0, s);
    c.position.set(x * 0.7, 0.36 - 4.9 * fall * fall, 1.12 - dz - fall * 0.4);
    c.rotation.set(t * 4 + i, t * 3, 0);
  });

  // ---- garden extras: the gnome nods along
  gnome.rotation.z = Math.sin(t * 1.2) * 0.03;

  // ---- the phone floats out of your pocket (weightless)
  phone.visible = inShaft && t >= T.gewicht - 0.4;
  if (phone.visible) {
    const k = smooth(ramp(t, T.gewicht - 0.4, T.folg));
    const off = V(0.32 + k * 0.25, 0.62 + k * 0.35, 0.18 + k * 0.1).applyAxisAngle(
      V(0, 1, 0),
      t * 0.35,
    );
    phone.position.copy(FALL).add(off);
    phone.rotation.set(t * 0.9, t * 1.3, t * 0.4);
  }
  // ---- the plane you overtake
  plane.visible = t >= T.bald && t < T.seltsame;
  if (plane.visible) {
    const k = t - T.bald;
    plane.position.set(FALL.x + 0.75, FALL.y - 1.9 + k * 1.6, FALL.z + 0.25);
    plane.rotation.set(0, Math.PI / 2, Math.sin(t * 6) * 0.08);
  }

  // ---- the halved Earth
  const u = dotU(t);
  const showDot =
    (t >= T.nach1 && t < T.um) || (t >= T.ab && t < T.bremst) || (t >= T.fuer && t < T.uebrigens);
  dot.visible = halo.visible = showDot;
  const dp = linePos(u);
  dot.position.copy(dp);
  halo.position.copy(dp).setZ(0.14);
  halo.scale.setScalar(1 + Math.sin(t * 8) * 0.12);
  const du = dotU(t) - dotU(t - 0.04);
  trail.forEach((m, i) => {
    m.visible = showDot && Math.abs(du) > 0.002;
    m.position.copy(linePos(dotU(t - (i + 1) * 0.035)));
  });
  // gravity arrows point back to the centre once you're past it
  const gk = pop(t, T.ab + 0.3, T.bremst);
  gArrows.position.copy(dp);
  gArrows.rotation.z = Math.atan2(-dp.y, -dp.x);
  animateArrows(gravity, t, gk);
  if (gk > 0)
    showLabel(
      "schwerkraft",
      gk * pop(t, T.schwerkraft, T.bremst),
      "Schwerkraft",
      worldOf(gArrows, V(0.9, 0.35, 0)),
      1,
    );

  // ---- the whole Earth: Austria → Australia? → the Pacific
  let lat = 40;
  let lon = 10 + (t - T.rate) * 3;
  if (t >= T.australien) {
    const k = smooth(ramp(t, T.australien, T.australien + 0.7));
    lat = lerp(40, -18, k);
    lon = lerp(16, 134, k);
  }
  if (t >= T.mitten) {
    const k = smooth(ramp(t, T.mitten, T.mitten + 0.8));
    lat = lerp(-18, -40, k);
    lon = lerp(134, 180, k) + (t - T.mitten) * 1.2;
  }
  tilt.rotation.x = lat * D2R;
  spin.rotation.y = -lon * D2R;
  pinAT.scale.setScalar(Math.max(0.001, pop(t, T.rate + 0.3, 99)));
  pinOut.scale.setScalar(Math.max(0.001, pop(t, T.mitten + 0.25, 99)));
  dashed.children.forEach((m, i) => {
    const f = (i + 1) / (dashed.children.length + 1);
    const p = onSphere(AT[0], AT[1], 1).lerp(onSphere(ANTI[0], ANTI[1], 1), f);
    m.position.copy(p.multiplyScalar(R * 0.995));
    m.visible = false;
  });
  const g2 = t >= T.rate && t < T.ab;
  if (g2) {
    showLabel(
      "du1",
      pop(t, T.rate + 0.4, T.australien),
      "Du",
      worldOf(spin, onSphere(AT[0], AT[1], R * 1.17)),
      1,
    );
    showLabel(
      "au",
      pop(t, T.australien + 0.5, T.mitten),
      "Australien?",
      worldOf(spin, onSphere(AU[0], AU[1], R)),
      -1,
    );
    showLabel(
      "du2",
      pop(t, T.mitten + 0.4, T.neuseeland),
      "Hier kommst du raus",
      worldOf(spin, onSphere(ANTI[0], ANTI[1], R * 1.17)),
      -1,
    );
    showLabel(
      "nz",
      pop(t, T.neuseeland - 0.1, T.ab),
      "Neuseeland",
      worldOf(spin, onSphere(NZ[0], NZ[1], R)),
      1,
    );
    const ap = worldOf(spin, onSphere(AU[0], AU[1], R * 1.02));
    showNope(pop(t, T.falsch, T.mitten), ap.x, ap.y, ap.z + 0.3, 1.2);
  } else {
    showNope(0, 0, 0, 0);
  }

  // ---- HUD: speed, fall time, back-and-forth counter
  const kmh = (uu) => Math.round((34000 * Math.sqrt(Math.max(0, 1 - uu * uu))) / 100) * 100;
  if (t >= T.immer && t < T.folg) {
    gauge("v", pop(t, T.immer, T.folg), {
      label: "TEMPO",
      value: Math.round((300 + (t - T.immer) * 450) / 10) * 10,
      max: 40000,
      unit: "km/h",
      x: 640,
      y: 1170,
    });
  } else if (t >= T.nach1 && t < T.um) {
    gauge("v", pop(t, T.nach1, T.um), {
      label: "TEMPO",
      value: kmh(u),
      max: 40000,
      unit: "km/h",
      x: 640,
      y: 1170,
    });
    stopwatch("fall", pop(t, T.nach1, T.um), {
      seconds: lerp(0, 19 * 60, smooth(ramp(t, T.nach1, T.ueber))),
      max: 38 * 60,
      label: "MINUTEN",
      x: 70,
      y: 1170,
    });
  } else if (t >= T.ab && t < T.haeltst) {
    const uu =
      t < T.bremst ? u : 1 - 0.03 * Math.pow(1 - clamp01((t - T.bremst) / (APEX - T.bremst)), 2);
    gauge("v", pop(t, T.ab, T.haeltst), {
      label: "TEMPO",
      value: t >= T.still ? 0 : kmh(uu),
      max: 40000,
      unit: "km/h",
      x: 640,
      y: 1170,
      color: t >= T.still ? "#3dff7a" : undefined,
    });
    if (t >= T.nach2)
      stopwatch("fall", pop(t, T.nach2, T.haeltst), {
        seconds: lerp(19 * 60, 38 * 60, smooth(ramp(t, T.nach2, T.drueben))),
        max: 38 * 60,
        label: "MINUTEN",
        x: 70,
        y: 1170,
      });
  }
  if (t >= T.fuer && t < T.uebrigens) {
    const n = Math.floor((t - T.fuer) / 0.575) + 1;
    counter("hin", pop(t, T.fuer + 0.2, T.uebrigens), {
      label: "HIN & HER",
      value: n,
      x: 70,
      y: 1180,
    });
  }

  // ---- LED panel: the core's heat, the deepest hole
  if (t >= T.heiss && t < T.rate) showPanel(pop(t, T.heiss, T.rate), "ERDKERN", "≈5000°C", LED.red);
  else if (t >= T.zwoelf - 0.1 && t < T.was2)
    showPanel(pop(t, T.zwoelf - 0.1, T.was2), "TIEFSTES LOCH", "12 km", LED.yellow);
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
