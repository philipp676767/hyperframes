// YouTube #2 "Titanic" — the video's world kit (copied into every chapter as
// assets/welt.js by new-chapter.sh / sync-kit.sh). No side effects on import:
// each chapter's set.js calls the builder for its place, the scenes take the
// ship and the props from here.
//
// Scale: 1 unit = 10 m. The ship lies along x (bow +x, stern -x), waterline
// y = 0, centre line z = 0 (starboard = +z).
//
// Places:
//   buildNight()      the North Atlantic on 14 April 1912: a moonless night, a
//                     sea as smooth as a mirror, a sky full of stars, icebergs
//                     on the horizon — the main world
//   buildDawn()       the same sea at first light, an ice field (chapter 7)
//   buildDeep()       3,800 m down: black water, mud, a searchlight (8, finale)
//   buildShipyard()   Belfast slipway under the steel gantry (chapter 1)
//   buildRadioRoom()  the Marconi room: desk, spark gap, headphones (2, 5)
// Things: makeTitanic(), makeIceberg(), makePerson(), makeLifeboat(),
// makeSmallShip() (Californian / Carpathia), makeFlare().
import {
  THREE,
  V,
  flat,
  ground,
  scene,
  onFrame,
  facet,
  facetMat,
  rng,
  jitter,
  real,
  roundedBox,
} from "./world.js";
import { setSky, finishSet, fireflies } from "./environments.js";

const shadowAll = (g) =>
  g.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
const noAO = (o) => {
  o.userData.noAO = true;
  return o;
};
const sstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
// the scene's key light casts shadows over the whole ship, not just ±11 units
export function widenShadow(r = 18, far = 70) {
  scene.traverse((o) => {
    if (o.isDirectionalLight && o.castShadow) {
      Object.assign(o.shadow.camera, { left: -r, right: r, top: r, bottom: -r, far });
      o.shadow.camera.updateProjectionMatrix();
    }
  });
}

// ---------------------------------------------------------------- materials
export const MAT = {
  hullBlack: real.plastic(0x121315, { roughness: 0.5, clearcoat: 0.35 }),
  hullRed: real.plastic(0x6d2318, { roughness: 0.62 }),
  white: real.plastic(0xf1ede4, { roughness: 0.5, clearcoat: 0.15 }),
  deck: real.wood(0xb39466, { roughness: 0.78 }),
  buff: real.plastic(0xc98f3e, { roughness: 0.5, clearcoat: 0.2 }),
  black: real.plastic(0x141414, { roughness: 0.55 }),
  mast: real.wood(0x9c6f3c, { roughness: 0.6 }),
  bronze: real.metal(0xb98a4a, { roughness: 0.32 }),
  wire: new THREE.MeshBasicMaterial({ color: 0x1a1c22 }),
  cut: real.plastic(0x2a2522, { roughness: 0.9 }),
  rust: real.plastic(0x6b3a1f, { roughness: 0.95 }),
  bulkhead: real.plastic(0xff8a3d, { roughness: 0.45, emissive: 0x401400 }),
  water: new THREE.MeshStandardMaterial({
    color: 0x2f9bff,
    emissive: 0x0b3f80,
    roughness: 0.15,
    transparent: true,
    opacity: 0.82,
  }),
  ice: facetMat(flat(0xe2edf5, { roughness: 0.55, emissive: 0x16222f })),
  iceDark: facetMat(flat(0x9fb6c8, { roughness: 0.6, emissive: 0x0b1420 })),
};
// lit windows / portholes (glow through post.js); k scales them (2:17 the lights die)
export const LIGHT = new THREE.MeshBasicMaterial({ color: 0xffd79a, toneMapped: false });
const LIGHT_BASE = new THREE.Color(0xffd79a).multiplyScalar(1.6);
LIGHT.color.copy(LIGHT_BASE);
export function shipLights(k) {
  LIGHT.color.copy(LIGHT_BASE).multiplyScalar(Math.max(0, k));
  LIGHT.visible = k > 0.01;
}

// ---------------------------------------------------------------- hull shape
export const L2 = 13.45; // half length (269 m)
export const BEAM = 1.4; // half beam (28 m)
export const DRAFT = 1.05; // 10.5 m below the waterline
export const BREAK_X = -2.05; // the hull tore between funnels 3 and 4
export const BULK_TOP = 0.42; // the bulkheads end at E deck
export const BULKHEADS = [
  12.45, 11.15, 9.85, 8.55, 7.2, 5.6, 3.95, 2.3, 0.65, -1.0, -2.65, -4.3, -6.0, -7.8, -9.8,
];
export const FUNNELS = [4.15, 1.7, -0.75, -3.2];

export function halfW(x) {
  let w = BEAM;
  if (x > 3.2) w *= 1 - Math.pow(Math.min(1, (x - 3.2) / (L2 - 3.2)), 2.3);
  if (x < -5) w *= 1 - 0.66 * Math.pow(Math.min(1, (-5 - x) / (L2 - 5)), 2.1);
  return Math.max(0.0005, w);
}
export function keelY(x) {
  let y = -DRAFT;
  if (x < -10) y += 0.82 * Math.pow((-10 - x) / (L2 - 10), 1.6);
  if (x > 12.7) y += 0.3 * Math.pow((x - 12.7) / (L2 - 12.7), 2);
  return y;
}
export function topY(x) {
  return 1.05 + 0.09 * (x / L2) ** 2 + 0.27 * sstep(9.35, 9.55, x) + 0.27 * sstep(-10.6, -10.8, x);
}
export function secZ(x, y) {
  const b = Math.min(1, Math.max(0, (y - keelY(x)) / 0.32));
  const flare = 1 + (0.07 * Math.max(0, (x - 7) / 6.45) * Math.max(0, y)) / 1.3;
  return halfW(x) * (0.12 + 0.88 * Math.sqrt(1 - (1 - b) * (1 - b))) * flare;
}

// one side band of the hull between heights fy0(x) and fy1(x), stations xa..xb
function hullBand(xa, xb, fy0, fy1, nx, ny) {
  const pos = [];
  const idx = [];
  for (const s of [1, -1]) {
    const base = pos.length / 3;
    for (let i = 0; i <= nx; i++) {
      const x = xa + ((xb - xa) * i) / nx;
      const y0 = fy0(x);
      const y1 = fy1(x);
      for (let j = 0; j <= ny; j++) {
        const y = y0 + ((y1 - y0) * j) / ny;
        pos.push(x, y, s * secZ(x, y));
      }
    }
    for (let i = 0; i < nx; i++)
      for (let j = 0; j < ny; j++) {
        const a = base + i * (ny + 1) + j;
        const b = a + ny + 1;
        if (s > 0) idx.push(a, b, a + 1, b, b + 1, a + 1);
        else idx.push(a, a + 1, b, b, a + 1, b + 1);
      }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
function deckGeo(xa, xb, nx, lift = 0) {
  const pos = [];
  const idx = [];
  for (let i = 0; i <= nx; i++) {
    const x = xa + ((xb - xa) * i) / nx;
    const y = topY(x) + lift;
    const w = secZ(x, y);
    pos.push(x, y, -w, x, y, w);
    if (i < nx) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
// a flat cross-section of the hull at x from y0 up to y1 (stern end, break, bulkhead)
export function sectionGeo(x, y0, y1, facing = 1, inset = 0) {
  const n = 18;
  const sh = new THREE.Shape();
  const pts = [];
  for (let j = 0; j <= n; j++) {
    const y = y0 + ((y1 - y0) * j) / n;
    pts.push([Math.max(0, secZ(x, y) - inset), y]);
  }
  sh.moveTo(pts[0][0], pts[0][1]);
  for (const p of pts) sh.lineTo(p[0], p[1]);
  for (let j = pts.length - 1; j >= 0; j--) sh.lineTo(-pts[j][0], pts[j][1]);
  const g = new THREE.ShapeGeometry(sh);
  g.rotateY(facing > 0 ? Math.PI / 2 : -Math.PI / 2);
  g.translate(x, 0, 0);
  return g;
}
// a solid slice of the hull between xa and xb from keel to height y1 (water, x-ray rooms)
function prismGeo(xa, xb, y1, inset = 0.02) {
  const nx = Math.max(2, Math.round((xb - xa) * 3));
  const ny = 8;
  const pos = [];
  const idx = [];
  const ring = (x) => {
    const r = [];
    const k0 = keelY(x) + inset;
    for (let j = 0; j <= ny; j++) {
      const y = k0 + ((y1 - k0) * j) / ny;
      r.push([Math.max(0.001, secZ(x, y) - inset), y]);
    }
    return r;
  };
  const per = (ny + 1) * 2;
  for (let i = 0; i <= nx; i++) {
    const x = xa + ((xb - xa) * i) / nx;
    const r = ring(x);
    for (const [z, y] of r) pos.push(x, y, z);
    for (let j = r.length - 1; j >= 0; j--) pos.push(x, r[j][1], -r[j][0]);
  }
  for (let i = 0; i < nx; i++)
    for (let j = 0; j < per - 1; j++) {
      const a = i * per + j;
      const b = a + per;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  // top lid
  for (let i = 0; i < nx; i++) {
    const a = i * per + ny;
    const b = a + per;
    idx.push(a, a + 1, b, b, a + 1, b + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  const ends = [
    sectionGeo(xa, keelY(xa) + inset, y1, -1, inset),
    sectionGeo(xb, keelY(xb) + inset, y1, 1, inset),
  ];
  return { side: g, ends };
}

// ---------------------------------------------------------------- small parts
export function makeLifeboat({ cover = true } = {}) {
  const g = new THREE.Group();
  const geo = new THREE.BoxGeometry(0.82, 0.11, 0.22, 16, 3, 6);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const e = Math.pow(Math.abs(x) / 0.41, 3);
    const bottom = (0.055 - y) / 0.11;
    p.setZ(i, p.getZ(i) * (1 - 0.85 * e) * (1 - 0.45 * bottom));
    p.setY(i, y + 0.02 * e);
  }
  geo.computeVertexNormals();
  g.add(new THREE.Mesh(geo, MAT.white));
  const rim = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.015, 0.2), real.wood(0x8a5a32));
  rim.position.y = 0.06;
  g.add(rim);
  if (cover) {
    const c = new THREE.Mesh(roundedBox(0.7, 0.03, 0.18, 0.012), real.fabric(0xb9b3a4));
    c.position.y = 0.075;
    g.add(c);
  }
  shadowAll(g);
  return g;
}
// a low figure, no face: coat + head (+ cap), ~1.8 m = 0.18 units
export function makePerson({ coat = 0x1d2433, skin = 0xd9a882, cap = true, scale = 1 } = {}) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.032, 0.085, 6, 16), real.fabric(coat));
  body.position.y = 0.075;
  g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.022, 24, 16), real.skin(skin));
  head.position.y = 0.155;
  g.add(head);
  if (cap) {
    const c = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.024, 0.012, 20),
      real.fabric(0x14161c),
    );
    c.position.y = 0.172;
    g.add(c);
  }
  for (const s of [-1, 1]) {
    const leg = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.013, 0.05, 4, 10),
      real.fabric(0x15171c),
    );
    leg.position.set(0, 0.03, s * 0.014);
    g.add(leg);
  }
  g.scale.setScalar(scale);
  shadowAll(g);
  return g;
}
const tube = (pts, r, mat, segs = 24) =>
  new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), segs, r, 6), mat);
function sag(a, b, d = 0.15, n = 8) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    pts.push(
      V(
        a.x + (b.x - a.x) * f,
        a.y + (b.y - a.y) * f - Math.sin(f * Math.PI) * d,
        a.z + (b.z - a.z) * f,
      ),
    );
  }
  return pts;
}

// ---------------------------------------------------------------- the Titanic
// Returns { group, bow, stern, lights, inside, mats, parts } — bow and stern are
// separate groups (pivot at the origin) so chapter 6 can break the hull at
// BREAK_X. opts.xray: every shell material becomes an x-ray material
// (setXray(ship.mats, k)) and the inside (15 bulkheads + 16 water rooms) is built.
export function makeTitanic({ xray = false, seed = 12 } = {}) {
  const r = rng(seed);
  const group = new THREE.Group();
  const bow = new THREE.Group();
  const stern = new THREE.Group();
  group.add(bow, stern);
  const mats = [];
  const M_ = {};
  const mk = (name, base) => {
    if (!xray) return (M_[name] = base);
    const m = new THREE.MeshStandardMaterial({
      color: base.color,
      roughness: base.roughness ?? 0.5,
      metalness: base.metalness ?? 0,
      transparent: true,
    });
    m.userData.base = base.color.clone();
    mats.push(m);
    return (M_[name] = m);
  };
  for (const k of ["hullBlack", "hullRed", "white", "deck", "buff", "black", "mast", "bronze"])
    mk(k, MAT[k]);
  const side = (x) => (x >= BREAK_X ? bow : stern);
  const add = (mesh, x) => {
    side(x).add(mesh);
    return mesh;
  };
  const part = (xa, xb, fn) => {
    // build fn(xa', xb') once per side of the break
    if (xa < BREAK_X && xb > BREAK_X) {
      stern.add(fn(xa, BREAK_X));
      bow.add(fn(BREAK_X, xb));
    } else side((xa + xb) / 2).add(fn(xa, xb));
  };
  // hull: red below the waterline, black above, wooden deck, closed ends
  part(-L2, L2, (a, b) => {
    const n = Math.max(8, Math.round((b - a) * 7));
    const g = new THREE.Group();
    g.add(
      new THREE.Mesh(
        hullBand(a, b, keelY, () => 0, n, 10),
        M_.hullRed,
      ),
    );
    g.add(
      new THREE.Mesh(
        hullBand(a, b, () => 0, topY, n, 12),
        M_.hullBlack,
      ),
    );
    g.add(new THREE.Mesh(deckGeo(a, b, n), M_.deck));
    // a thin gold line just under the sheer (the "gold band" of the White Star liners)
    const gl = hullBand(
      a,
      b,
      (x) => topY(x) - 0.105,
      (x) => topY(x) - 0.095,
      n,
      1,
    );
    gl.scale(1.0015, 1, 1.004);
    g.add(new THREE.Mesh(gl, real.metal(0xc9a13b, { roughness: 0.4 })));
    return g;
  });
  stern.add(new THREE.Mesh(sectionGeo(-L2, keelY(-L2), topY(-L2), -1), M_.hullBlack));
  // the broken faces (dark, only seen in chapter 6)
  const cutB = new THREE.Mesh(
    sectionGeo(BREAK_X + 0.001, keelY(BREAK_X), topY(BREAK_X), -1),
    MAT.cut,
  );
  const cutS = new THREE.Mesh(
    sectionGeo(BREAK_X - 0.001, keelY(BREAK_X), topY(BREAK_X), 1),
    MAT.cut,
  );
  bow.add(cutB);
  stern.add(cutS);

  // superstructure: two white decks + the boat-deck houses, bridge and wings
  const block = (xa, xb, y0, y1, w, mat = M_.white) =>
    part(xa, xb, (a, b) => {
      const m = new THREE.Mesh(roundedBox(b - a, y1 - y0, w, 0.03), mat);
      m.position.set((a + b) / 2, (y0 + y1) / 2, 0);
      return m;
    });
  block(-9.3, 7.55, 1.03, 1.62, 2.56);
  block(-6.9, 7.2, 1.62, 1.82, 1.25);
  {
    const wings = new THREE.Mesh(roundedBox(0.22, 0.2, 2.86, 0.03), M_.white);
    wings.position.set(7.42, 1.72, 0);
    add(wings, 7.4);
    const wheel = new THREE.Mesh(roundedBox(0.5, 0.26, 0.62, 0.03), M_.white);
    wheel.position.set(7.15, 1.95, 0);
    add(wheel, 7.1);
  }
  // forecastle + poop houses, hatch covers on the well decks
  for (const [x, w, l] of [
    [10.4, 0.5, 0.6],
    [8.6, 0.42, 0.42],
    [-10.1, 0.45, 0.5],
    [-11.7, 0.5, 0.7],
  ]) {
    const h = new THREE.Mesh(roundedBox(l, 0.09, w, 0.02), real.wood(0x8a6844));
    h.position.set(x, topY(x) + 0.045, 0);
    add(h, x);
  }
  // funnels: buff with black tops, raked aft; the 4th one is a dummy
  FUNNELS.forEach((x, i) => {
    const f = new THREE.Group();
    const geo = new THREE.CylinderGeometry(0.36, 0.38, 2.45, 48, 1, true);
    geo.scale(1, 1, 0.8);
    f.add(new THREE.Mesh(geo, M_.buff));
    const topG = new THREE.CylinderGeometry(0.364, 0.364, 0.55, 48, 1, true);
    topG.scale(1, 1, 0.8);
    const top = new THREE.Mesh(topG, M_.black);
    top.position.y = 0.96;
    f.add(top);
    const inner = new THREE.Mesh(new THREE.CircleGeometry(0.35, 32), MAT.black);
    inner.geometry.scale(1, 0.8, 1);
    inner.rotation.x = -Math.PI / 2;
    inner.position.y = 1.1;
    f.add(inner);
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.5, 12), M_.buff);
    pipe.position.set(0.37, 0.05, 0);
    f.add(pipe);
    f.position.set(x, 1.82 + 1.2, 0);
    f.rotation.z = 0.05;
    f.userData.index = i;
    add(f, x);
  });
  // ventilator cowls around the funnels
  for (let i = 0; i < 12; i++) {
    const x = FUNNELS[i % 4] + (i < 4 ? 0.75 : i < 8 ? -0.7 : 0.8);
    const z = (i % 2 ? 1 : -1) * (0.45 + (i % 3) * 0.12);
    const c = new THREE.Group();
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.16, 16), M_.white);
    s.position.y = 0.08;
    c.add(s);
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      M_.white,
    );
    m.rotation.x = Math.PI / 2;
    m.position.set(0, 0.17, 0.02);
    c.add(m);
    c.position.set(x, 1.82, z);
    c.rotation.y = r() * 6;
    add(c, x);
  }
  // masts, crow's nest, wires (the Marconi aerial runs between the mast tops)
  const masts = {};
  for (const [name, x, h] of [
    ["fore", 9.9, 4.25],
    ["main", -10.15, 3.85],
  ]) {
    const y0 = topY(x);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.055, h, 16), M_.mast);
    m.position.set(x - 0.05 * (h / 2), y0 + h / 2, 0);
    m.rotation.z = 0.05;
    add(m, x);
    masts[name] = V(x - 0.05 * h, y0 + h, 0);
  }
  const nest = new THREE.Group();
  {
    const n = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.1, 0.17, 32, 1, true), M_.white);
    n.material = M_.white;
    nest.add(n);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(0.1, 24), M_.deck);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.07;
    nest.add(floor);
    const bell = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 16, 10, 0, Math.PI * 2, 0, Math.PI / 1.7),
      real.metal(0xc8a24a, { roughness: 0.25 }),
    );
    bell.position.set(0.12, 0.08, 0.04);
    nest.add(bell);
    nest.position.set(9.9 - 0.05 * 1.55, 2.9, 0);
    add(nest, 9.9);
  }
  const wires = [
    [masts.fore, masts.main, 0.25],
    [masts.fore.clone().add(V(0, 0, 0.12)), masts.main.clone().add(V(0, 0, 0.12)), 0.25],
    [masts.fore, V(L2 - 0.1, topY(L2) + 0.05, 0), 0.05],
    [masts.main, V(-L2 + 0.3, topY(-L2) + 0.05, 0), 0.05],
    [masts.fore, V(9.0, topY(9) + 0.02, 1.3), 0.02],
    [masts.fore, V(9.0, topY(9) + 0.02, -1.3), 0.02],
    [masts.main, V(-9.6, topY(-9.6) + 0.02, 1.3), 0.02],
    [masts.main, V(-9.6, topY(-9.6) + 0.02, -1.3), 0.02],
  ];
  for (const [a, b, d] of wires) {
    // wires crossing the break are split at it
    if ((a.x - BREAK_X) * (b.x - BREAK_X) < 0) {
      const f = (BREAK_X - a.x) / (b.x - a.x);
      const m = a.clone().lerp(b, f);
      m.y -= d * 4 * f * (1 - f);
      stern.add(tube(sag(a.x < b.x ? a : b, m, d * 0.5), 0.006, MAT.wire));
      bow.add(tube(sag(m, a.x < b.x ? b : a, d * 0.5), 0.006, MAT.wire));
    } else add(tube(sag(a, b, d), 0.006, MAT.wire), (a.x + b.x) / 2);
  }
  // lifeboats on davits along the boat deck (8 a side; only half of all on board fit in)
  const boats = [];
  for (const x of [6.35, 5.55, 4.75, 3.95, -4.55, -5.35, -6.15, -6.95])
    for (const s of [1, -1]) {
      const b = makeLifeboat();
      b.position.set(x, 1.93, s * 1.18);
      add(b, x);
      for (const dx of [-0.36, 0.36]) {
        const dav = tube(
          [V(x + dx, 1.82, s * 0.98), V(x + dx, 2.08, s * 1.06), V(x + dx, 2.1, s * 1.2)],
          0.012,
          M_.black,
          8,
        );
        add(dav, x);
      }
      boats.push(b);
    }
  // propellers + rudder (in the air in chapter 6)
  const props = [];
  for (const [x, y, z, rr] of [
    [-13.15, -0.62, 0, 0.27],
    [-12.3, -0.72, 0.62, 0.36],
    [-12.3, -0.72, -0.62, 0.36],
  ]) {
    const p = new THREE.Group();
    for (let k = 0; k < (z === 0 ? 4 : 3); k++) {
      const bl = new THREE.Mesh(new THREE.SphereGeometry(rr * 0.5, 16, 10), M_.bronze);
      bl.scale.set(0.22, 1, 0.5);
      bl.position.y = rr * 0.48;
      const arm = new THREE.Group();
      arm.add(bl);
      arm.rotation.x = (k / (z === 0 ? 4 : 3)) * Math.PI * 2;
      p.add(arm);
    }
    const hub = new THREE.Mesh(new THREE.SphereGeometry(rr * 0.18, 16, 12), M_.bronze);
    p.add(hub);
    p.position.set(x, y, z);
    add(p, x);
    props.push(p);
  }
  {
    const rud = new THREE.Mesh(roundedBox(0.32, 0.62, 0.05, 0.02), M_.hullRed);
    rud.position.set(-L2 - 0.08, -0.55, 0);
    add(rud, -L2);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 12), M_.hullRed);
    shaft.rotation.z = Math.PI / 2;
    for (const z of [0.62, -0.62]) {
      const sh = shaft.clone();
      sh.position.set(-11.6, -0.72, z * 0.8);
      add(sh, -11.6);
    }
  }
  // anchors at the bow
  for (const s of [1, -1]) {
    const a = new THREE.Mesh(roundedBox(0.2, 0.16, 0.03, 0.02), MAT.black);
    a.position.set(12.25, 0.95, s * (secZ(12.25, 0.95) + 0.012));
    add(a, 12.25);
  }

  // lit portholes + windows (instanced, one mesh per half)
  const holeGeo = new THREE.CircleGeometry(0.022, 10);
  const winGeo = new THREE.PlaneGeometry(0.05, 0.06);
  const inst = { bow: [], stern: [] };
  const dummy = new THREE.Object3D();
  const push = (geoKey, x, y, z, ry) => {
    dummy.position.set(x, y, z);
    dummy.rotation.set(0, ry, 0);
    dummy.updateMatrix();
    inst[x >= BREAK_X ? "bow" : "stern"].push([geoKey, dummy.matrix.clone()]);
  };
  for (const y of [0.3, 0.5, 0.71, 0.9])
    for (let x = -12.0; x < 11.9; x += 0.15) {
      if (r() < 0.32) continue;
      if (y > 0.85 && x > 9.4) continue;
      for (const s of [1, -1]) {
        const dw = (secZ(x + 0.01, y) - secZ(x - 0.01, y)) / 0.02;
        const ry = Math.atan2(-dw * s, s);
        push("hole", x, y, s * (secZ(x, y) + 0.004), ry);
      }
    }
  for (const [y, x0, x1, w] of [
    [1.2, -9.1, 7.4, 1.281],
    [1.44, -9.1, 7.4, 1.281],
    [1.72, -6.7, 7.0, 0.626],
  ])
    for (let x = x0; x < x1; x += 0.13) {
      if (r() < 0.2) continue;
      for (const s of [1, -1]) push("win", x, y, s * (w + 0.003), s > 0 ? 0 : Math.PI);
    }
  for (const half of ["bow", "stern"]) {
    for (const key of ["hole", "win"]) {
      const list = inst[half].filter((e) => e[0] === key);
      if (!list.length) continue;
      const im = noAO(
        new THREE.InstancedMesh(key === "hole" ? holeGeo : winGeo, LIGHT, list.length),
      );
      list.forEach((e, i) => im.setMatrixAt(i, e[1]));
      (half === "bow" ? bow : stern).add(im);
    }
  }
  // deck lamps + the masthead and side lights
  const lampGeo = new THREE.SphereGeometry(0.018, 10, 8);
  for (let x = -9; x < 7.4; x += 0.6)
    for (const s of [1, -1]) {
      const l = noAO(new THREE.Mesh(lampGeo, LIGHT));
      l.position.set(x, 1.86, s * 1.27);
      add(l, x);
    }
  {
    const mh = noAO(new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), LIGHT));
    mh.position.copy(masts.fore).add(V(0.02, -0.6, 0));
    add(mh, 9.9);
    const red = new THREE.MeshBasicMaterial({ color: 0xff3020, toneMapped: false });
    const green = new THREE.MeshBasicMaterial({ color: 0x30ff70, toneMapped: false });
    for (const [s, m] of [
      [-1, red],
      [1, green],
    ]) {
      const sl = noAO(new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 8), m));
      sl.position.set(7.42, 1.75, s * 1.45);
      add(sl, 7.4);
    }
  }

  // the inside (x-ray chapters): bulkheads up to E deck + a water room per compartment
  let inside = null;
  if (xray) {
    inside = { bulkheads: [], water: [] };
    for (const x of BULKHEADS) {
      const bh = new THREE.Mesh(sectionGeo(x, keelY(x) + 0.02, BULK_TOP, 1, 0.025), MAT.bulkhead);
      bh.material.side = THREE.DoubleSide;
      add(bh, x);
      inside.bulkheads.push(bh);
    }
    const edges = [L2 - 0.15, ...BULKHEADS, -L2 + 0.3];
    for (let i = 0; i < edges.length - 1; i++) {
      const xb = edges[i];
      const xa = edges[i + 1];
      const { side: sg, ends } = prismGeo(xa, xb, BULK_TOP - 0.01, 0.035);
      const w = new THREE.Group();
      w.add(new THREE.Mesh(sg, MAT.water));
      for (const e of ends) w.add(new THREE.Mesh(e, MAT.water));
      w.userData.x = [xa, xb];
      w.visible = false;
      add(w, (xa + xb) / 2);
      inside.water.push(w);
    }
  }
  shadowAll(group);
  return { group, bow, stern, inside, mats, boats, props, masts, nest };
}
// fill compartment i (0 = forepeak) to a level 0..1 of its height (keel → BULK_TOP)
export function setWater(ship, i, k) {
  const w = ship.inside.water[i];
  w.visible = k > 0.002;
  const y0 = -DRAFT;
  const s = Math.max(0.002, k);
  w.scale.y = s;
  w.position.y = y0 * (1 - s);
}

// ---------------------------------------------------------------- iceberg
// A tabular-to-pinnacle berg: a few jittered lumps fused, flat-ish shoulders, a
// peak; faceted ice with blue shadows. size = height above water (units).
export function makeIceberg({ seed = 3, size = 2, len = 3, peaks = 3 } = {}) {
  const r = rng(seed);
  const g = new THREE.Group();
  for (let i = 0; i < peaks + 2; i++) {
    const geo = jitter(new THREE.IcosahedronGeometry(1, 2), 0.22, seed * 10 + i);
    const p = geo.attributes.position;
    for (let k = 0; k < p.count; k++) {
      const y = p.getY(k);
      if (y < -0.1) p.setY(k, y * 1.6);
    }
    const peak = i < peaks;
    const s = peak ? size * (0.55 + r() * 0.5) : size * 0.45;
    const m = new THREE.Mesh(facet(geo, 0.09, seed + i), peak ? MAT.ice : MAT.iceDark);
    m.scale.set(len * (0.25 + r() * 0.25), s, len * (0.18 + r() * 0.2));
    m.position.set((r() - 0.5) * len * 0.8, peak ? s * 0.25 : 0, (r() - 0.5) * len * 0.4);
    m.rotation.y = r() * 3;
    g.add(m);
  }
  // the dark part under water
  const under = new THREE.Mesh(
    facet(jitter(new THREE.IcosahedronGeometry(1, 2), 0.25, seed + 50), 0.1, seed),
    MAT.iceDark,
  );
  under.scale.set(len * 0.75, size * 2.6, len * 0.55);
  under.position.y = -size * 2.2;
  g.add(under);
  shadowAll(g);
  return g;
}

// ---------------------------------------------------------------- other ships
// a small steamer far away (Californian / Carpathia): hull, one funnel, lights
export function makeSmallShip({ funnel = 0x1d1d1d, band = null, lights = true } = {}) {
  const g = new THREE.Group();
  const hull = new THREE.Mesh(
    roundedBox(4.4, 0.6, 0.62, 0.12),
    real.plastic(0x16171a, { roughness: 0.5 }),
  );
  hull.position.y = 0.18;
  g.add(hull);
  const bowG = new THREE.Mesh(new THREE.ConeGeometry(0.31, 0.9, 4, 1), hull.material);
  bowG.rotation.z = -Math.PI / 2;
  bowG.rotation.x = Math.PI / 4;
  bowG.scale.set(1, 1, 1);
  bowG.position.set(2.5, 0.18, 0);
  g.add(bowG);
  const house = new THREE.Mesh(roundedBox(1.3, 0.35, 0.5, 0.04), MAT.white);
  house.position.set(0.2, 0.65, 0);
  g.add(house);
  const f = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.14, 0.9, 24), real.plastic(funnel));
  f.position.set(-0.1, 1.2, 0);
  f.rotation.z = 0.06;
  g.add(f);
  if (band !== null) {
    const b = new THREE.Mesh(
      new THREE.CylinderGeometry(0.142, 0.142, 0.25, 24),
      real.plastic(band),
    );
    b.position.copy(f.position).add(V(-0.01, 0.2, 0));
    g.add(b);
  }
  for (const x of [1.6, -1.7]) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 2.2, 8), MAT.mast);
    m.position.set(x, 1.4, 0);
    g.add(m);
  }
  if (lights) {
    const lg = new THREE.SphereGeometry(0.03, 8, 6);
    for (let i = 0; i < 26; i++) {
      const l = noAO(new THREE.Mesh(lg, LIGHT));
      l.position.set(-1.8 + (i % 13) * 0.3, i < 13 ? 0.32 : 0.65, (i % 2 ? 1 : -1) * 0.32);
      g.add(l);
    }
    const mh = noAO(new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), LIGHT));
    mh.position.set(1.6, 2.3, 0);
    g.add(mh);
  }
  shadowAll(g);
  return g;
}

// a white distress rocket: a rising trail + a burst of falling stars (k 0..1 of its life)
export function makeFlare() {
  const g = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    toneMapped: false,
    transparent: true,
  });
  const trail = noAO(new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.02, 1, 8), mat));
  g.add(trail);
  const stars = [];
  const sg = new THREE.SphereGeometry(0.05, 8, 6);
  for (let i = 0; i < 18; i++) {
    const s = noAO(new THREE.Mesh(sg, mat));
    const a = (i / 18) * Math.PI * 2;
    s.userData.d = V(
      Math.cos(a) * (0.6 + (i % 3) * 0.25),
      0.3 + (i % 4) * 0.15,
      Math.sin(a) * (0.6 + (i % 2) * 0.3),
    );
    g.add(s);
    stars.push(s);
  }
  const light = new THREE.PointLight(0xe8eeff, 0, 40, 1.4);
  g.add(light);
  g.userData.set = (k, top = 6) => {
    g.visible = k > 0 && k < 1;
    if (!g.visible) return;
    const rise = Math.min(1, k / 0.3);
    const h = top * (1 - (1 - rise) ** 2);
    trail.scale.y = Math.max(0.01, h * (k < 0.3 ? 1 : Math.max(0, 1 - (k - 0.3) * 3)));
    trail.position.y = trail.scale.y / 2 + (h - trail.scale.y);
    const b = Math.max(0, (k - 0.3) / 0.7);
    mat.opacity = k < 0.3 ? 1 : 1 - b * b;
    for (const s of stars) {
      s.visible = k >= 0.3;
      s.position.set(
        s.userData.d.x * b * 2.2,
        h + s.userData.d.y * b * 2 - b * b * 2.4,
        s.userData.d.z * b * 2.2,
      );
    }
    light.position.set(0, h, 0);
    light.intensity = k < 0.3 ? 2 : 30 * (1 - b) ** 2;
  };
  return g;
}

// ---------------------------------------------------------------- the night sea (main world)
// Moonless, calm, cold. A mirror-dark sea with a slow swell close to the ship,
// stars to the horizon, icebergs as pale shapes far out, a few faint lights
// of the Californian on the horizon (chapters 2, 5).
export function buildNight({ seed = 14, californian = true, bergs = true } = {}) {
  const r = rng(seed);
  setSky({
    top: [0.006, 0.01, 0.035],
    mid: [0.016, 0.026, 0.07],
    hor: [0.05, 0.07, 0.13],
    below: [0.012, 0.018, 0.04],
    sun: [0.0, 0.0, 0.0],
    sunDir: [0, -1, 0],
    cloud: [0x000000, 0x000000],
    hemi: [0x7f95d8, 0x0a0e18, 0.75],
    key: [0xa9bbff, 1.25],
    keyPos: [-8, 16, 10],
    rim: [0x6f8cff, 0.9],
    stars: 1.6,
    noClouds: true,
    birds: false,
    fog: [60, 230],
  });
  widenShadow(18);
  // near water: a slow, very low swell (the sea was "like glass")
  const geo = new THREE.PlaneGeometry(120, 120, 140, 140);
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  const base = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    base[i * 2] = p.getX(i);
    base[i * 2 + 1] = p.getZ(i);
  }
  const seaMat = new THREE.MeshPhysicalMaterial({
    color: 0x03070f,
    roughness: 0.08,
    metalness: 0.0,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    envMapIntensity: 2.2,
  });
  const water = noAO(new THREE.Mesh(geo, seaMat));
  water.receiveShadow = true;
  ground.add(water);
  onFrame((t) => {
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 2];
      const z = base[i * 2 + 1];
      p.setY(
        i,
        (Math.sin(x * 0.21 + t * 0.35) * 0.6 + Math.sin(z * 0.27 - t * 0.28 + x * 0.05) * 0.4) *
          0.012,
      );
    }
    p.needsUpdate = true;
    geo.computeVertexNormals();
  });
  const far = noAO(new THREE.Mesh(new THREE.CircleGeometry(280, 64), seaMat));
  far.rotation.x = -Math.PI / 2;
  far.position.y = -0.03;
  ground.add(far);
  const out = { water };
  if (bergs) {
    out.bergs = [];
    for (let i = 0; i < 9; i++) {
      const a = r() * Math.PI * 2;
      const d = 70 + r() * 90;
      const b = makeIceberg({ seed: seed + i * 7, size: 2 + r() * 4, len: 5 + r() * 9 });
      b.position.set(Math.cos(a) * d, 0, Math.sin(a) * d);
      ground.add(b);
      out.bergs.push(b);
    }
  }
  if (californian) {
    const c = makeSmallShip({ funnel: 0x1d1d1d, band: 0xb8442c });
    c.position.set(-95, 0, -120);
    c.rotation.y = 0.6;
    c.scale.setScalar(1.4);
    ground.add(c);
    out.californian = c;
  }
  // a cold breath of mist low over the water
  fireflies(40, { area: [-30, 30, 0.1, 1.2, -30, 30], color: 0x9fb6ff, seed, size: 0.02 });
  finishSet({ ground: 0x05080f });
  return out;
}

// foam along a moving hull: a bow wave + a fading wake behind (speed 0..1)
export function makeWake(ship, { len = 26 } = {}) {
  const g = new THREE.Group();
  const n = 260;
  const geo = new THREE.CircleGeometry(0.06, 8);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xcfe0ff,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  const im = noAO(new THREE.InstancedMesh(geo, mat, n));
  g.add(im);
  const r = rng(77);
  const seeds = Array.from({ length: n }, () => [r(), r(), r() < 0.5 ? -1 : 1, r()]);
  const d = new THREE.Object3D();
  g.userData.update = (t, speed = 1) => {
    im.visible = speed > 0.02;
    mat.opacity = 0.5 * speed;
    seeds.forEach(([a, b, s, c], i) => {
      const f = (a + t * 0.06 * speed) % 1; // 0 at the bow → 1 far behind
      const x = L2 - 0.2 - f * (2 * L2 + len);
      const hw = x > -L2 ? secZ(x, 0.01) : BEAM * 0.45 + (-L2 - x) * 0.08;
      const spread = x > -L2 ? 0.05 + b * 0.12 : (b - 0.5) * hw * 1.6;
      d.position.set(x, 0.012, x > -L2 ? s * (hw + spread) : spread);
      const sc = (0.6 + c) * (x > 10 ? 1.6 : 1) * (1 - Math.max(0, f - 0.6) / 0.4);
      d.scale.set(sc * 2.2, 1, sc);
      d.updateMatrix();
      im.setMatrixAt(i, d.matrix);
    });
    im.instanceMatrix.needsUpdate = true;
  };
  ship.group.add(g);
  return g;
}

// soft smoke from funnels 1–3 drifting aft (k 0..1 strength)
export function makeSmoke(ship) {
  const g = new THREE.Group();
  const geo = new THREE.IcosahedronGeometry(0.3, 1);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x2a2c33,
    roughness: 1,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });
  const puffs = [];
  for (let f = 0; f < 3; f++)
    for (let i = 0; i < 9; i++) {
      const m = noAO(new THREE.Mesh(geo, mat));
      m.userData = { f, ph: i / 9 };
      g.add(m);
      puffs.push(m);
    }
  g.userData.update = (t, k = 1) => {
    g.visible = k > 0.01;
    mat.opacity = 0.32 * k;
    for (const m of puffs) {
      const u = (m.userData.ph + t * 0.05) % 1;
      const fx = FUNNELS[m.userData.f];
      m.position.set(fx - 0.2 - u * 6, 4.35 + u * 1.1, Math.sin(u * 6 + m.userData.f) * 0.2);
      m.scale.setScalar(0.6 + u * 2.4);
    }
  };
  ship.bow.add(g);
  return g;
}
