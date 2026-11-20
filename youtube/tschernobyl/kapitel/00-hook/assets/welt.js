// YouTube #3 "Tschernobyl" — the video's world kit (copied into every chapter
// as assets/welt.js by new-chapter.sh / sync-kit.sh). No side effects on
// import: each chapter's set.js calls the builders for its places.
//
// Scale outdoors: 1 unit = 10 m (a person = 0.18). x = east, z = south.
// Block 4's reactor sits at CORE; the turbine hall runs along x north of it.
//
// Places:
//   buildPlant({ time, state })  the Chernobyl plant by the cooling pond, pine
//        forest, power lines, Prypjat's lights on the horizon — main world.
//        time: "nacht" | "abend" | "tag" | "rauch" (smoky day) | "grau"
//        state: "intakt" | "explodiert" | "sarkophag" | "nsc"
//   buildControlRoom(origin)   block 4's control room (1 unit = 1 m)
//   buildCore(origin)          the reactor core in x-ray (1 unit = 1 m)
//   buildPripyat({ time })     the town: panel blocks, the yellow Ferris wheel
//   buildBasement(origin)      flooded corridor under the reactor (chapter 6)
//   buildForest(origin)        a Bavarian spruce forest in the rain (chapter 7)
// Things: makePerson(), makeBus(), makeFireTruck(), makeHelicopter(),
// makeBoar(), makeHorse(), makeWolf(), makeFerrisWheel(), smokeColumn().
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
  patches,
  noise2,
} from "./world.js";
import { setSky, finishSet, fireflies, terrain, pine, F } from "./environments.js";

export const shadowAll = (g) =>
  g.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
export const noAO = (o) => {
  o.userData.noAO = true;
  return o;
};
const clamp01 = (x) => Math.min(1, Math.max(0, x));
// the scene's key light casts shadows over the whole plant, not just ±11 units
export function widenShadow(r = 30, far = 120) {
  scene.traverse((o) => {
    if (o.isDirectionalLight && o.castShadow) {
      Object.assign(o.shadow.camera, { left: -r, right: r, top: r, bottom: -r, far });
      o.shadow.camera.updateProjectionMatrix();
    }
  });
}
export const CORE = V(3, 2.1, -0.8); // block 4's reactor core (outdoor units)

// ---------------------------------------------------------------- textures
// Facade panels with window bands, painted on a canvas (seeded). Returns
// { map, emissiveMap } — lit windows glow at night.
function facadeTex({
  w = 512,
  h = 256,
  cols = 16,
  rows = 8,
  base = "#c9c6bd",
  line = "#9d9a92",
  win = "#2c3a4a",
  winRows = [],
  winLit = 0,
  stripe = null,
  seed = 1,
  rx = 1,
  ry = 1,
} = {}) {
  const r = rng(seed);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  const e = document.createElement("canvas");
  e.width = w;
  e.height = h;
  const ge = e.getContext("2d");
  ge.fillStyle = "#000";
  ge.fillRect(0, 0, w, h);
  g.fillStyle = base;
  g.fillRect(0, 0, w, h);
  const cw = w / cols;
  const ch = h / rows;
  // panel-by-panel tint: concrete is never one flat colour
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      const v = (r() - 0.5) * 18;
      g.fillStyle = `rgba(${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${Math.abs(v) / 255})`;
      g.fillRect(i * cw, j * ch, cw, ch);
    }
  // rain streaks
  for (let i = 0; i < cols * 3; i++) {
    g.fillStyle = `rgba(60,55,50,${0.05 + r() * 0.08})`;
    g.fillRect(r() * w, r() * h * 0.3, 1 + r() * 2, h * (0.2 + r() * 0.6));
  }
  if (stripe) {
    g.fillStyle = stripe;
    g.fillRect(0, h * 0.06, w, h * 0.05);
  }
  g.strokeStyle = line;
  g.lineWidth = 1.2;
  for (let i = 0; i <= cols; i++) {
    g.beginPath();
    g.moveTo(i * cw, 0);
    g.lineTo(i * cw, h);
    g.stroke();
  }
  for (let j = 0; j <= rows; j++) {
    g.beginPath();
    g.moveTo(0, j * ch);
    g.lineTo(w, j * ch);
    g.stroke();
  }
  for (const wr of winRows) {
    const y0 = wr * ch + ch * 0.25;
    for (let i = 0; i < cols; i++) {
      g.fillStyle = win;
      g.fillRect(i * cw + cw * 0.12, y0, cw * 0.76, ch * 0.5);
      if (r() < winLit) {
        const warm = r() < 0.7;
        ge.fillStyle = warm ? "#ffcf8a" : "#cfe6ff";
        ge.globalAlpha = 0.55 + r() * 0.45;
        ge.fillRect(i * cw + cw * 0.12, y0, cw * 0.76, ch * 0.5);
        ge.globalAlpha = 1;
      }
    }
  }
  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(rx, ry);
  const emissiveMap = new THREE.CanvasTexture(e);
  emissiveMap.colorSpace = THREE.SRGBColorSpace;
  emissiveMap.wrapS = emissiveMap.wrapT = THREE.RepeatWrapping;
  emissiveMap.repeat.set(rx, ry);
  return { map, emissiveMap };
}
function facadeMat(opts, night) {
  const { map, emissiveMap } = facadeTex(opts);
  return new THREE.MeshStandardMaterial({
    map,
    emissiveMap,
    emissive: night ? 0xffffff : 0x000000,
    emissiveIntensity: night ? 1.4 : 0,
    roughness: 0.88,
    metalness: 0,
  });
}
// a box whose 4 sides carry facade textures sized to the wall (uv repeat by size)
function building(w, h, d, mat, roofMat) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(geo, [mat, mat, roofMat, roofMat, mat, mat]);
  m.castShadow = m.receiveShadow = true;
  return m;
}

// ---------------------------------------------------------------- shared things
// a figure without a face: coat + head (+ cap or helmet), ~1.8 m = 0.18 units
export function makePerson({
  coat = 0x1d2433,
  legs = 0x15171c,
  skin = 0xd9a882,
  cap = 0x14161c,
  helmet = false,
  scale = 1,
} = {}) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.032, 0.085, 6, 16), real.fabric(coat));
  body.position.y = 0.085;
  g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.022, 24, 16), real.skin(skin));
  head.position.y = 0.162;
  g.add(head);
  if (helmet) {
    const h = new THREE.Mesh(
      new THREE.SphereGeometry(0.027, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      real.plastic(helmet === true ? 0x2b2f36 : helmet, { roughness: 0.4, clearcoat: 0.5 }),
    );
    h.position.y = 0.166;
    g.add(h);
  } else if (cap !== null) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.014, 20), real.fabric(cap));
    c.position.y = 0.179;
    g.add(c);
  }
  for (const s of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.013, 0.05, 4, 10), real.fabric(legs));
    leg.position.set(0, 0.035, s * 0.014);
    leg.name = s < 0 ? "legL" : "legR";
    g.add(leg);
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.01, 0.06, 4, 10), real.fabric(coat));
    arm.position.set(0, 0.1, s * 0.04);
    arm.name = s < 0 ? "armL" : "armR";
    g.add(arm);
  }
  g.scale.setScalar(scale);
  shadowAll(g);
  return g;
}
// walking cycle for makePerson (call every frame; ph = phase in steps)
export function walk(p, ph, amt = 1) {
  const s = Math.sin(ph * Math.PI);
  for (const o of p.children) {
    if (o.name === "legL") o.rotation.z = s * 0.45 * amt;
    if (o.name === "legR") o.rotation.z = -s * 0.45 * amt;
    if (o.name === "armL") o.rotation.z = -s * 0.35 * amt;
    if (o.name === "armR") o.rotation.z = s * 0.35 * amt;
  }
}

const glowMat = (color, opacity = 1) =>
  new THREE.MeshBasicMaterial({ color, toneMapped: false, transparent: opacity < 1, opacity });

// soft volumetric-ish smoke: billboards of puffs rising from a point.
// Returns a group with update(t, k) — k = strength 0..1.
export function smokeColumn({
  n = 70,
  color = 0x3a3836,
  glow = 0xff7a2a,
  h = 26,
  w = 3,
  drift = [1, 0, 0.3],
  seed = 4,
  size = 1.6,
  speed = 0.035,
} = {}) {
  const g = new THREE.Group();
  const r = rng(seed);
  const geo = new THREE.IcosahedronGeometry(1, 2);
  const puffs = [];
  for (let i = 0; i < n; i++) {
    const mat = new THREE.MeshStandardMaterial({
      color,
      emissive: glow,
      emissiveIntensity: 0,
      roughness: 1,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });
    const m = noAO(new THREE.Mesh(geo, mat));
    m.userData = { ph: r(), a: r() * 6.28, rr: r(), s: 0.6 + r() * 0.8 };
    g.add(m);
    puffs.push(m);
  }
  g.userData.update = (t, k = 1, glowK = 1) => {
    g.visible = k > 0.01;
    for (const m of puffs) {
      const u = (m.userData.ph + t * speed) % 1;
      const spread = w * (0.25 + u * 1.4);
      m.position.set(
        Math.cos(m.userData.a + u * 2) * spread * m.userData.rr + drift[0] * u * u * h * 0.5,
        u * h,
        Math.sin(m.userData.a + u * 2) * spread * m.userData.rr + drift[2] * u * u * h * 0.5,
      );
      m.scale.setScalar(size * m.userData.s * (0.5 + u * 2.2));
      m.material.opacity = 0.55 * k * Math.min(1, u * 6) * (1 - u) ** 0.7;
      m.material.emissiveIntensity = glowK * 1.6 * Math.max(0, 1 - u * 3.5);
    }
  };
  return g;
}

// flickering fire: a cluster of glowing cones + a point light. update(t, k)
export function makeFire({ s = 1, seed = 2, light = true } = {}) {
  const g = new THREE.Group();
  const r = rng(seed);
  const flames = [];
  for (let i = 0; i < 9; i++) {
    const m = noAO(
      new THREE.Mesh(
        new THREE.ConeGeometry(0.12 * s, 0.5 * s, 7),
        glowMat(i % 3 ? 0xff7a1c : 0xffc24a, 0.85),
      ),
    );
    m.position.set((r() - 0.5) * 0.5 * s, 0.2 * s, (r() - 0.5) * 0.5 * s);
    m.userData = { ph: r() * 6.28, f: 5 + r() * 6 };
    g.add(m);
    flames.push(m);
  }
  let pl = null;
  if (light) {
    pl = new THREE.PointLight(0xff8a3a, 0, 6 * s, 1.6);
    pl.position.y = 0.6 * s;
    g.add(pl);
  }
  g.userData.update = (t, k = 1) => {
    g.visible = k > 0.01;
    for (const m of flames) {
      const f = 0.65 + 0.35 * Math.sin(t * m.userData.f + m.userData.ph);
      m.scale.set(k * (0.8 + 0.3 * f), k * (0.6 + 0.8 * f), k * (0.8 + 0.3 * f));
    }
    if (pl) pl.intensity = k * (3 + Math.sin(t * 13) * 0.6 + Math.sin(t * 7.3) * 0.5) * s;
  };
  return g;
}

// ---------------------------------------------------------------- vehicles
export function makeBus(color = 0xe8c64a) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    roundedBox(1.15, 0.32, 0.25, 0.05),
    real.plastic(color, { roughness: 0.4, clearcoat: 0.5 }),
  );
  body.position.y = 0.2;
  g.add(body);
  const glass = new THREE.Mesh(
    roundedBox(1.0, 0.1, 0.252, 0.02),
    real.glass(0x1d2a33, { roughness: 0.1 }),
  );
  glass.position.set(0.02, 0.27, 0);
  g.add(glass);
  const front = new THREE.Mesh(roundedBox(0.02, 0.16, 0.22, 0.01), real.glass(0x1d2a33));
  front.position.set(0.575, 0.26, 0);
  g.add(front);
  const stripe = new THREE.Mesh(roundedBox(1.152, 0.03, 0.254, 0.01), real.plastic(0xf3efe6));
  stripe.position.y = 0.16;
  g.add(stripe);
  for (const x of [-0.35, 0.38])
    for (const z of [-0.12, 0.12]) {
      const w = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.04, 20),
        real.rubber(0x161616),
      );
      w.rotation.x = Math.PI / 2;
      w.position.set(x, 0.06, z);
      g.add(w);
    }
  g.scale.setScalar(1.05);
  shadowAll(g);
  return g;
}
export function makeFireTruck() {
  const g = new THREE.Group();
  const red = real.plastic(0xb3201a, { roughness: 0.35, clearcoat: 0.6 });
  const cab = new THREE.Mesh(roundedBox(0.25, 0.22, 0.24, 0.04), red);
  cab.position.set(0.32, 0.18, 0);
  g.add(cab);
  const ws = new THREE.Mesh(roundedBox(0.02, 0.09, 0.2, 0.01), real.glass(0x1a2530));
  ws.position.set(0.445, 0.23, 0);
  g.add(ws);
  const tank = new THREE.Mesh(roundedBox(0.5, 0.2, 0.24, 0.03), red);
  tank.position.set(-0.08, 0.17, 0);
  g.add(tank);
  const ladder = new THREE.Mesh(
    roundedBox(0.55, 0.02, 0.08, 0.005),
    real.metal(0xc0c4c8, { roughness: 0.3 }),
  );
  ladder.position.set(-0.05, 0.29, 0);
  g.add(ladder);
  for (const x of [-0.22, 0.32])
    for (const z of [-0.12, 0.12]) {
      const w = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.055, 0.04, 18),
        real.rubber(0x141414),
      );
      w.rotation.x = Math.PI / 2;
      w.position.set(x, 0.055, z);
      g.add(w);
    }
  const beacon = noAO(new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 8), glowMat(0x4aa8ff)));
  beacon.position.set(0.32, 0.31, 0);
  g.add(beacon);
  const bl = new THREE.PointLight(0x4aa8ff, 0, 2.5, 1.5);
  bl.position.copy(beacon.position);
  g.add(bl);
  g.userData.update = (t, on = 1) => {
    const f = (Math.sin(t * 9) > 0.2 ? 1 : 0.15) * on;
    beacon.material.color.setHex(f > 0.5 ? 0x8fd0ff : 0x13304d);
    bl.intensity = f * 2.2;
  };
  shadowAll(g);
  return g;
}
// Mi-8-like transport helicopter, ~25 m = 2.5 units. update(t)
export function makeHelicopter(color = 0x55603f) {
  const g = new THREE.Group();
  const paint = real.plastic(color, { roughness: 0.55 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.75, 8, 16), paint);
  body.rotation.z = Math.PI / 2;
  body.position.y = 0;
  g.add(body);
  const nose = new THREE.Mesh(
    new THREE.SphereGeometry(0.21, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2),
    real.glass(0x26323a, { roughness: 0.1 }),
  );
  nose.rotation.z = -Math.PI / 2;
  nose.position.set(0.55, 0.03, 0);
  nose.scale.set(1, 0.8, 1);
  g.add(nose);
  const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.11, 1.0, 12), paint);
  boom.rotation.z = Math.PI / 2;
  boom.position.set(-0.9, 0.08, 0);
  g.add(boom);
  const fin = new THREE.Mesh(roundedBox(0.2, 0.28, 0.03, 0.01), paint);
  fin.position.set(-1.35, 0.2, 0);
  fin.rotation.z = 0.35;
  g.add(fin);
  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.07, 0.12, 12),
    real.metal(0x333333),
  );
  hub.position.y = 0.27;
  g.add(hub);
  const rotor = new THREE.Group();
  rotor.position.y = 0.33;
  for (let i = 0; i < 5; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.008, 0.06), real.plastic(0x1e1e1e));
    b.position.x = 0.52;
    const a = new THREE.Group();
    a.rotation.y = (i / 5) * Math.PI * 2;
    a.add(b);
    rotor.add(a);
  }
  const disc = noAO(
    new THREE.Mesh(
      new THREE.CircleGeometry(1.08, 40),
      new THREE.MeshBasicMaterial({
        color: 0x222222,
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
      }),
    ),
  );
  disc.rotation.x = -Math.PI / 2;
  rotor.add(disc);
  g.add(rotor);
  const tail = new THREE.Group();
  tail.position.set(-1.38, 0.24, 0.04);
  for (let i = 0; i < 3; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.36, 0.008), real.plastic(0x1e1e1e));
    b.rotation.z = (i / 3) * Math.PI * 2;
    tail.add(b);
  }
  g.add(tail);
  for (const z of [-0.18, 0.18]) {
    const w = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.03, 12),
      real.rubber(0x111111),
    );
    w.rotation.x = Math.PI / 2;
    w.position.set(0.2, -0.25, z);
    g.add(w);
  }
  // the load hanging below: a net bag of sand / lead
  const rope = new THREE.Mesh(
    new THREE.CylinderGeometry(0.006, 0.006, 0.9, 6),
    real.fabric(0x2a2a2a),
  );
  rope.position.y = -0.65;
  const bag = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 1), real.fabric(0x8b7a5c));
  bag.position.y = -1.15;
  const load = new THREE.Group();
  load.add(rope, bag);
  g.add(load);
  g.userData = { rotor, tail, load, bag };
  g.userData.update = (t) => {
    rotor.rotation.y = t * 21;
    tail.rotation.z = t * 40;
  };
  shadowAll(g);
  return g;
}

// ---------------------------------------------------------------- animals (outdoor scale)
function quad({
  body = 0x5a4632,
  len = 0.16,
  hgt = 0.09,
  leg = 0.07,
  head = 0.05,
  snout = 0.03,
  mane = null,
  tail = 0.05,
} = {}) {
  const g = new THREE.Group();
  const fur = real.fabric(body, { roughness: 0.95 });
  const b = new THREE.Mesh(new THREE.CapsuleGeometry(hgt * 0.5, len, 8, 16), fur);
  b.rotation.z = Math.PI / 2;
  b.position.y = leg + hgt * 0.45;
  g.add(b);
  const h = new THREE.Mesh(new THREE.SphereGeometry(head * 0.55, 18, 12), fur);
  h.scale.set(1.4, 1, 0.9);
  h.position.set(len * 0.62 + head * 0.3, leg + hgt * 0.65, 0);
  g.add(h);
  const sn = new THREE.Mesh(new THREE.ConeGeometry(snout * 0.55, snout * 1.8, 14), fur);
  sn.rotation.z = -Math.PI / 2 - 0.35;
  sn.position.set(len * 0.62 + head * 0.95, leg + hgt * 0.45, 0);
  g.add(sn);
  const nose = new THREE.Mesh(
    new THREE.SphereGeometry(snout * 0.22, 10, 8),
    real.plastic(0x2a1c18, { roughness: 0.5 }),
  );
  nose.position.set(len * 0.62 + head * 0.95 + snout * 0.85, leg + hgt * 0.45 - snout * 0.33, 0);
  g.add(nose);
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(head * 0.14, head * 0.35, 8), fur);
    ear.position.set(len * 0.62 + head * 0.1, leg + hgt * 0.65 + head * 0.38, s * head * 0.22);
    ear.rotation.x = s * 0.4;
    g.add(ear);
  }
  if (mane) {
    const m = new THREE.Mesh(
      roundedBox(len * 0.45, hgt * 0.3, hgt * 0.15, 0.01),
      real.fabric(mane),
    );
    m.position.set(len * 0.42, leg + hgt * 1.0, 0);
    m.rotation.z = -0.4;
    g.add(m);
  }
  const legs = [];
  for (const x of [-len * 0.45, len * 0.45])
    for (const z of [-hgt * 0.28, hgt * 0.28]) {
      const l = new THREE.Mesh(new THREE.CapsuleGeometry(hgt * 0.1, leg * 0.8, 4, 8), fur);
      l.position.set(x, leg * 0.5, z);
      g.add(l);
      legs.push(l);
    }
  const tl = new THREE.Mesh(new THREE.CapsuleGeometry(hgt * 0.06, tail, 4, 8), fur);
  tl.position.set(-len * 0.62 - tail * 0.3, leg + hgt * 0.55, 0);
  tl.rotation.z = -0.8;
  g.add(tl);
  g.userData = { legs, head: h, snout: sn };
  g.userData.update = (t, walking = 0, sp = 6) => {
    legs.forEach(
      (l, i) =>
        (l.rotation.z =
          walking * 0.5 * Math.sin(t * sp + (i % 2 ? 0 : Math.PI) + (i > 1 ? Math.PI / 2 : 0))),
    );
  };
  shadowAll(g);
  return g;
}
// a wild boar built in metres (scale s: 0.1 = outdoor units, 1 = metres)
export const makeBoar = (s = 1) => {
  const g = new THREE.Group();
  const fur = real.plastic(0x5e4a3a, { roughness: 0.95 });
  const dark = real.plastic(0x3b2e25, { roughness: 0.95 });
  // body: a barrel, high shoulders, lower rump
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.75, 10, 20), fur);
  body.rotation.z = Math.PI / 2;
  body.scale.set(1, 1, 0.82);
  body.position.set(0, 0.56, 0);
  g.add(body);
  const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 14), dark);
  shoulder.scale.set(0.9, 1.0, 0.82);
  shoulder.position.set(0.35, 0.64, 0);
  g.add(shoulder);
  // bristle ridge along the back
  const ridge = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.7, 6, 10), dark);
  ridge.rotation.z = Math.PI / 2 + 0.12;
  ridge.position.set(0.15, 0.94, 0);
  g.add(ridge);
  // head: a long wedge from the shoulders down to the snout disc
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.26, 0.52, 18), dark);
  head.rotation.z = -(Math.PI / 2 + 0.55);
  head.position.set(0.78, 0.5, 0);
  head.scale.set(1, 1, 0.8);
  g.add(head);
  const snout = new THREE.Mesh(
    new THREE.CylinderGeometry(0.095, 0.1, 0.05, 20),
    real.plastic(0x6a5048, { roughness: 0.6 }),
  );
  snout.rotation.z = -(Math.PI / 2 + 0.55);
  snout.position.set(1.0, 0.36, 0);
  g.add(snout);
  for (const z of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 8), dark);
    ear.position.set(0.6, 0.82, z * 0.12);
    ear.rotation.set(z * 0.5, 0, -0.3);
    g.add(ear);
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 10, 8),
      real.plastic(0x0a0a0a, { roughness: 0.2, clearcoat: 1 }),
    );
    eye.position.set(0.8, 0.6, z * 0.13);
    g.add(eye);
    const tusk = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.07, 6), real.ceramic(0xece4d4));
    tusk.position.set(0.94, 0.37, z * 0.07);
    tusk.rotation.z = -0.6;
    g.add(tusk);
  }
  const legs = [];
  for (const x of [-0.42, 0.42])
    for (const z of [-0.14, 0.14]) {
      const l = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.2, 4, 10), dark);
      l.position.set(x, 0.17, z);
      g.add(l);
      legs.push(l);
    }
  const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.015, 0.18, 4, 6), dark);
  tail.position.set(-0.68, 0.62, 0);
  tail.rotation.z = -0.5;
  g.add(tail);
  g.userData = { legs, head, snout };
  g.userData.update = (t, walking = 0, sp = 6, root = 0) => {
    legs.forEach(
      (l, i) => (l.rotation.z = walking * 0.45 * Math.sin(t * sp + (i % 2 ? 0 : Math.PI))),
    );
    // rooting: the head dips into the soil
    head.rotation.z = -(Math.PI / 2 + 0.55) - root * 0.25 * (0.5 + 0.5 * Math.sin(t * 4));
  };
  g.scale.setScalar(s);
  shadowAll(g);
  return g;
};
export const makeHorse = (s = 1) => {
  const g = quad({
    body: 0xb98b54,
    len: 0.17,
    hgt: 0.1,
    leg: 0.11,
    head: 0.065,
    snout: 0.05,
    mane: 0x2a1d12,
    tail: 0.08,
  });
  g.scale.setScalar(s);
  return g;
};
export const makeWolf = (s = 1) => {
  const g = quad({
    body: 0x7d7468,
    len: 0.12,
    hgt: 0.065,
    leg: 0.065,
    head: 0.05,
    snout: 0.04,
    tail: 0.07,
  });
  g.scale.setScalar(s);
  return g;
};

// ---------------------------------------------------------------- the plant
const SKY = {
  nacht: {
    top: [0.008, 0.012, 0.04],
    mid: [0.03, 0.04, 0.09],
    hor: [0.16, 0.12, 0.13],
    below: [0.02, 0.022, 0.04],
    sun: [0, 0, 0],
    sunDir: [0, -1, 0],
    cloud: [0, 0],
    hemi: [0x7f90d0, 0x14100c, 1.15],
    key: [0xaebcff, 1.5],
    keyPos: [-14, 26, 18],
    rim: [0xff9a50, 0.45],
    stars: 1.4,
    noClouds: true,
    birds: false,
    fog: [70, 260],
  },
  abend: {
    top: [0.12, 0.16, 0.38],
    mid: [0.5, 0.42, 0.55],
    hor: [1.0, 0.62, 0.38],
    below: [0.42, 0.34, 0.33],
    sun: [1.0, 0.72, 0.4],
    sunDir: [-1, 0.06, 0.35],
    cloud: [0xffd2b0, 0xc77a6a],
    hemi: [0xffd9c0, 0x403028, 1.0],
    key: [0xffc08a, 2.4],
    keyPos: [-30, 9, 12],
    rim: [0x8fa0ff, 0.5],
    clouds: 10,
    birds: true,
    fog: [80, 280],
  },
  tag: {
    top: [0.3, 0.52, 0.84],
    mid: [0.62, 0.76, 0.92],
    hor: [0.88, 0.9, 0.92],
    below: [0.6, 0.64, 0.6],
    sun: [1, 0.96, 0.88],
    sunDir: [-0.4, 0.5, 0.6],
    cloud: [0xffffff, 0xb6c2d6],
    hemi: [0xeaf2ff, 0x5b5a48, 1.15],
    key: [0xfff2dc, 2.8],
    keyPos: [-16, 24, 20],
    rim: [0xbcd4ff, 0.5],
    clouds: 14,
    birds: true,
    fog: [90, 300],
  },
  rauch: {
    top: [0.42, 0.46, 0.5],
    mid: [0.62, 0.62, 0.6],
    hor: [0.78, 0.72, 0.62],
    below: [0.5, 0.48, 0.44],
    sun: [1, 0.85, 0.6],
    sunDir: [-0.5, 0.35, 0.6],
    cloud: [0xd8d2c8, 0x8a8478],
    hemi: [0xe8e0d0, 0x4a4438, 1.1],
    key: [0xffe6c0, 2.2],
    keyPos: [-18, 22, 16],
    rim: [0xc0c8d8, 0.4],
    clouds: 12,
    birds: false,
    fog: [60, 220],
  },
  grau: {
    top: [0.46, 0.5, 0.56],
    mid: [0.62, 0.66, 0.7],
    hor: [0.78, 0.8, 0.8],
    below: [0.5, 0.52, 0.5],
    sun: [0.9, 0.9, 0.9],
    sunDir: [-0.4, 0.6, 0.6],
    cloud: [0xe6e8ec, 0x9aa0a8],
    hemi: [0xe6ecf4, 0x4c5048, 1.3],
    key: [0xf4f4f0, 1.6],
    keyPos: [-14, 26, 18],
    rim: [0xc8d0e0, 0.4],
    clouds: 18,
    birds: true,
    fog: [70, 260],
  },
};

// one reactor unit's building: lower block + central hall on top. Returns parts.
function reactorBlock(x0, x1, z0, z1, night, seed, hallMat) {
  const g = new THREE.Group();
  const w = x1 - x0;
  const d = z1 - z0;
  const lower = facadeMat(
    {
      cols: 24,
      rows: 10,
      base: "#d4d0c6",
      line: "#a8a59c",
      seed,
      rx: 1,
      ry: 1,
      winRows: [2, 6],
      winLit: night ? 0.35 : 0,
    },
    night,
  );
  const roof = real.plastic(0x6c6a66, { roughness: 0.95 });
  const lb = building(w, 4.4, d, lower, roof);
  lb.position.set((x0 + x1) / 2, 2.2, (z0 + z1) / 2);
  g.add(lb);
  // the central hall (reactor hall) — white panels with a red-brown band
  const hall = new THREE.Group();
  const hb = building(w - 2, 2.7, d - 2, hallMat, roof);
  hb.position.set((x0 + x1) / 2, 4.4 + 1.35, (z0 + z1) / 2);
  hall.add(hb);
  // roof edge + small structures on top
  const rim = new THREE.Mesh(
    new THREE.BoxGeometry(w - 1.9, 0.12, d - 1.9),
    real.plastic(0x8d8a84, { roughness: 0.9 }),
  );
  rim.position.set((x0 + x1) / 2, 7.1, (z0 + z1) / 2);
  hall.add(rim);
  g.add(hall);
  shadowAll(g);
  return { group: g, hall, lower: lb };
}

// the ventilation stack: red-white banded tube inside a tapering steel lattice
function ventStack(x, z, y0, h, night) {
  const g = new THREE.Group();
  const bands = 8;
  for (let i = 0; i < bands; i++) {
    const r0 = 0.32 - (i / bands) * 0.06;
    const r1 = 0.32 - ((i + 1) / bands) * 0.06;
    const m = new THREE.Mesh(
      new THREE.CylinderGeometry(r1, r0, h / bands, 24),
      real.plastic(i % 2 ? 0xf0ece4 : 0xb8302a, { roughness: 0.6 }),
    );
    m.position.y = y0 + (i + 0.5) * (h / bands);
    g.add(m);
  }
  // lattice: 4 legs + cross braces
  const steel = real.metal(0x8f9498, { roughness: 0.5 });
  const legAt = (f) => 1.05 - f * 0.55;
  const legs = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  const segs = 10;
  for (let i = 0; i < segs; i++) {
    const fa = i / segs;
    const fb = (i + 1) / segs;
    const ya = y0 + fa * h * 0.92;
    const yb = y0 + fb * h * 0.92;
    for (const [sx, sz] of legs) {
      const a = V(sx * legAt(fa), ya, sz * legAt(fa));
      const b = V(sx * legAt(fb), yb, sz * legAt(fb));
      const len = a.distanceTo(b);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, len, 6), steel);
      m.position.copy(a).add(b).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize());
      g.add(m);
    }
    // braces on each face
    for (const [s0, s1] of [
      [
        [1, 1],
        [1, -1],
      ],
      [
        [1, -1],
        [-1, -1],
      ],
      [
        [-1, -1],
        [-1, 1],
      ],
      [
        [-1, 1],
        [1, 1],
      ],
    ]) {
      const a = V(s0[0] * legAt(fa), ya, s0[1] * legAt(fa));
      const b = V(s1[0] * legAt(fb), yb, s1[1] * legAt(fb));
      const len = a.distanceTo(b);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, len, 5), steel);
      m.position.copy(a).add(b).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize());
      g.add(m);
    }
  }
  // red aviation lights
  const lamps = [];
  for (const f of [0.5, 0.75, 1.0]) {
    const l = noAO(new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), glowMat(0xff2a1a)));
    l.position.set(0.3, y0 + f * h, 0.05);
    g.add(l);
    lamps.push(l);
  }
  onFrame((t) => {
    const on = night ? (Math.sin(t * 3.1) > -0.2 ? 1 : 0.2) : 0.15;
    lamps.forEach((l) => l.material.color.setRGB(on, on * 0.12, on * 0.06));
  });
  g.position.set(x, 0, z);
  shadowAll(g);
  return g;
}

// the ruin of block 4's central hall: broken walls with jagged tops
function ruinWall(len, h, seed, mat) {
  const r = rng(seed);
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  const n = 9;
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * len;
    const y = h * (0.25 + r() * 0.75) * (i === 0 || i === n ? 0.9 : 1);
    s.lineTo(x, y);
  }
  s.lineTo(len, 0);
  s.lineTo(0, 0);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.18, bevelEnabled: false });
  return new THREE.Mesh(geo, mat);
}

export function buildPlant({
  time = "nacht",
  state = "intakt",
  seed = 7,
  pripyat = true,
  forest = true,
} = {}) {
  const r = rng(seed);
  const night = time === "nacht";
  const sky = setSky(SKY[time]);
  widenShadow(34, 140);
  const out = { sky };

  // --- ground: dry spring grass, sandy patches, the plant's asphalt yard
  const land = terrain(night ? 0x2d3322 : 0x6f7a4a, {
    r: 170,
    step: 2.6,
    flatR: 70,
    hills: 0.4,
    seed: 21,
    amt: 0.1,
    scale: 0.05,
    warm: 0.4,
    height: (x, z, d) =>
      d < 60 ? 0 : (noise2(x * 0.02, z * 0.02, 5) - 0.4) * 2.5 * Math.min(1, (d - 60) / 40),
  });
  out.land = land;
  const yard = new THREE.Mesh(
    new THREE.PlaneGeometry(108, 46),
    real.plastic(night ? 0x2b2a28 : 0x6d6b66, { roughness: 0.95 }),
  );
  yard.rotation.x = -Math.PI / 2;
  yard.position.set(-18, 0.02, -2);
  yard.receiveShadow = true;
  ground.add(yard);
  // road + rail spur leading north and east
  for (const [x, z, w, d] of [
    [22, -2, 26, 1.6],
    [-18, 26, 1.6, 50],
    [-18, -40, 1.6, 30],
  ]) {
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(w, d),
      real.plastic(0x3a3936, { roughness: 0.9 }),
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(x, 0.03, z);
    road.receiveShadow = true;
    ground.add(road);
  }

  // --- turbine hall (all 4 units), long and low
  const thMat = facadeMat(
    {
      cols: 64,
      rows: 6,
      base: "#cfcbc0",
      line: "#a19e96",
      seed: 3,
      rx: 1,
      ry: 1,
      winRows: [1, 3],
      winLit: night ? 0.55 : 0,
      stripe: "#7a8a96",
    },
    night,
  );
  const thRoof = real.plastic(0x5f5d59, { roughness: 0.95 });
  const th = building(80, 3.2, 6.4, thMat, thRoof);
  th.position.set(-26, 1.6, -8.2);
  ground.add(th);
  out.turbineHall = th;
  // roof vents along the turbine hall
  for (let i = 0; i < 16; i++) {
    const v = new THREE.Mesh(
      roundedBox(1.6, 0.25, 1.1, 0.05),
      real.plastic(0x7a7873, { roughness: 0.9 }),
    );
    v.position.set(-64 + i * 5, 3.32, -8.2);
    v.castShadow = true;
    ground.add(v);
  }
  // deaerator gallery between hall and reactor blocks (tall, narrow)
  const daMat = facadeMat(
    {
      cols: 60,
      rows: 8,
      base: "#c8c4b9",
      line: "#9c998f",
      seed: 5,
      winRows: [3, 5],
      winLit: night ? 0.45 : 0,
    },
    night,
  );
  const da = building(70, 4.9, 1.8, daMat, thRoof);
  da.position.set(-22, 2.45, -4.1);
  ground.add(da);

  // --- reactor blocks 1–4 (3 and 4 share one building; 4 is east)
  const hallMat = facadeMat(
    {
      cols: 20,
      rows: 6,
      base: "#e4e1d8",
      line: "#b5b2a9",
      seed: 11,
      stripe: "#8c3a2c",
      winRows: [],
      winLit: 0,
    },
    night,
  );
  const b1 = reactorBlock(-56, -46, -3.2, 4.8, night, 31, hallMat);
  const b2 = reactorBlock(-45, -35, -3.2, 4.8, night, 32, hallMat);
  const b3 = reactorBlock(-10, -1.2, -3.2, 4.8, night, 33, hallMat);
  const b4 = reactorBlock(-1.2, 7.6, -3.2, 4.8, night, 34, hallMat);
  for (const b of [b1, b2, b3, b4]) ground.add(b.group);
  out.block4 = b4;
  // stacks: VT-1 between units 1+2, VT-2 between 3+4
  ground.add(ventStack(-45.5, 0.8, 7.1, 8.3, night));
  ground.add(ventStack(-1.2, 0.8, 7.1, 8.2, night));
  out.stack = V(-1.2, 15.3, 0.8);

  // vertical ribs on the reactor blocks' lower walls (relief instead of flat boxes)
  const ribMat = real.plastic(0xbdb9af, { roughness: 0.9 });
  for (const [x0, x1] of [
    [-56, -35],
    [-10, 7.6],
  ])
    for (let x = x0 + 0.6; x < x1; x += 1.2) {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.12, 4.3, 0.12), ribMat);
      rib.position.set(x, 2.15, 4.86);
      rib.castShadow = true;
      ground.add(rib);
    }
  // pipe bridges from the blocks out to the yard
  const pipeMat = real.metal(0x8a8f92, { roughness: 0.45 });
  for (const [x, z0, z1, y] of [
    [9, -6, 12, 1.2],
    [10.2, -6, 12, 1.2],
    [-20, 5, 18, 0.9],
    [-33, 5, 16, 0.9],
  ]) {
    const len = z1 - z0;
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, len, 14), pipeMat);
    p.rotation.x = Math.PI / 2;
    p.position.set(x, y, (z0 + z1) / 2);
    p.castShadow = true;
    ground.add(p);
    for (let z = z0 + 1; z < z1; z += 3) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, y, 0.08), real.metal(0x55585a));
      leg.position.set(x, y / 2, z);
      ground.add(leg);
    }
  }
  // parked trucks and cars in the yard
  for (let i = 0; i < 7; i++) {
    const v = new THREE.Group();
    const col = [0x6a7b5a, 0x8a8f94, 0x3c5a7a, 0xb8b2a2][i % 4];
    const body = new THREE.Mesh(
      roundedBox(0.5, 0.2, 0.22, 0.04),
      real.plastic(col, { roughness: 0.45, clearcoat: 0.3 }),
    );
    body.position.y = 0.16;
    v.add(body);
    const cab = new THREE.Mesh(roundedBox(0.2, 0.14, 0.2, 0.03), real.glass(0x1d2630));
    cab.position.set(0.12, 0.31, 0);
    v.add(cab);
    shadowAll(v);
    v.position.set(-40 + i * 3.1 + r(), 0, 11 + r() * 2);
    v.rotation.y = (r() - 0.5) * 0.4;
    ground.add(v);
  }
  // floodlights: a warm wash on the reactor blocks (night only)
  if (night) {
    for (const [x, z, tx, ty, tz, c, k] of [
      [8, 18, 2, 4, -1, 0xffc890, 110],
      [-14, 18, -6, 4, -1, 0xffb070, 90],
      [-40, 16, -45, 3, -1, 0xffc890, 80],
      [20, 6, 4, 6, -4, 0xcfe0ff, 60],
    ]) {
      const sp = new THREE.SpotLight(c, k, 60, 0.42, 0.7, 1.5);
      sp.position.set(x, 1.5, z);
      sp.target.position.set(tx, ty, tz);
      ground.add(sp, sp.target);
    }
  }

  // --- the ruin of block 4 (state "explodiert")
  const ruin = new THREE.Group();
  const wallMat = facadeMat(
    { cols: 10, rows: 4, base: "#d8d4ca", line: "#a8a59c", seed: 41, stripe: "#8c3a2c" },
    false,
  );
  const burnt = real.plastic(0x2a2622, { roughness: 1 });
  // west wall stands almost full height, the others are torn
  const ww = ruinWall(6.0, 2.7, 3, wallMat);
  ww.rotation.y = Math.PI / 2;
  ww.position.set(-0.2, 4.4, 3.8);
  ruin.add(ww);
  const sw = ruinWall(8.6, 1.7, 8, wallMat);
  sw.position.set(-0.2, 4.4, 3.6);
  ruin.add(sw);
  const nw = ruinWall(8.6, 0.9, 13, burnt);
  nw.position.set(-0.2, 4.4, -2.2);
  ruin.add(nw);
  const ew = ruinWall(5.8, 1.1, 17, wallMat);
  ew.rotation.y = Math.PI / 2;
  ew.position.set(6.6, 4.4, 3.6);
  ruin.add(ew);
  // twisted roof beams hanging into the shaft
  for (let i = 0; i < 9; i++) {
    const beam = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.12, 2.2 + r() * 2),
      real.metal(0x3b3632, { roughness: 0.7 }),
    );
    beam.position.set(0.6 + r() * 5.5, 5.4 + r() * 1.2, -1 + r() * 4);
    beam.rotation.set((r() - 0.5) * 1.4, r() * 3, (r() - 0.5) * 1.2);
    ruin.add(beam);
  }
  // rubble heaps on the roof and along the north side
  for (let i = 0; i < 26; i++) {
    const b = new THREE.Mesh(
      jitter(new THREE.DodecahedronGeometry(0.25 + r() * 0.45, 0), 0.08, i),
      i % 3 ? burnt : real.plastic(0x77736c, { roughness: 1 }),
    );
    b.position.set(-0.5 + r() * 8.5, 4.5 + r() * 0.3, -3.6 + r() * 1.6);
    b.rotation.set(r() * 3, r() * 3, r() * 3);
    ruin.add(b);
  }
  // the open shaft: the glowing core and the tilted upper lid
  const glowCore = noAO(
    new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.2, 40), glowMat(0xff6a1a)),
  );
  glowCore.position.set(CORE.x, 4.35, CORE.z);
  ruin.add(glowCore);
  const embers = noAO(
    new THREE.Mesh(
      new THREE.CylinderGeometry(1.25, 1.25, 0.05, 40),
      new THREE.MeshBasicMaterial({
        color: 0xffc070,
        transparent: true,
        opacity: 0.6,
        toneMapped: false,
      }),
    ),
  );
  embers.position.set(CORE.x, 4.47, CORE.z);
  ruin.add(embers);
  const lid = new THREE.Mesh(
    new THREE.CylinderGeometry(1.0, 1.0, 0.3, 40),
    real.metal(0x4d4a46, { roughness: 0.6 }),
  );
  lid.position.set(CORE.x - 0.3, 4.9, CORE.z + 0.2);
  lid.rotation.set(0.25, 0, 1.25);
  ruin.add(lid);
  out.lid = lid;
  const coreLight = new THREE.PointLight(0xff7a2a, 0, 40, 1.3);
  coreLight.position.set(CORE.x, 5.5, CORE.z);
  ruin.add(coreLight);
  // the eerie blue glow over the shaft (ionised air)
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0x7fb8ff,
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
    toneMapped: false,
    blending: THREE.AdditiveBlending,
  });
  const beam = noAO(new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.3, 30, 32, 1, true), beamMat));
  beam.position.set(CORE.x, 19.5, CORE.z);
  ruin.add(beam);
  // glowing graphite blocks scattered over roofs and yard
  const chunkMat = new THREE.MeshStandardMaterial({
    color: 0x1a1816,
    emissive: 0xff5a10,
    emissiveIntensity: 1.2,
    roughness: 0.9,
  });
  const chunks = [];
  for (let i = 0; i < 46; i++) {
    const c = new THREE.Mesh(roundedBox(0.25, 0.25, 0.25 + r() * 0.3, 0.03), chunkMat);
    const onRoof = i < 20;
    c.position.set(
      onRoof ? -10 + r() * 9 : -8 + r() * 22,
      onRoof ? 4.55 : 0.15,
      onRoof ? -3 + r() * 7 : 5 + r() * 9,
    );
    if (i >= 34) c.position.set(-6 + r() * 14, 3.35, -10 + r() * 3.5); // turbine hall roof
    c.rotation.set(r(), r() * 3, r());
    ruin.add(c);
    chunks.push(c);
  }
  // fires on the turbine hall roof
  const fires = [];
  for (let i = 0; i < 6; i++) {
    const f = makeFire({ s: 1.4 + r(), seed: i + 3, light: i < 3 });
    f.position.set(-4 + i * 2.6 + r(), 3.3, -9 + r() * 2.5);
    ruin.add(f);
    fires.push(f);
  }
  const smoke = smokeColumn({ n: 80, h: 34, w: 2.2, drift: [0.9, 0, -0.6], seed: 6, size: 1.5 });
  smoke.position.set(CORE.x, 4.6, CORE.z);
  ruin.add(smoke);
  shadowAll(ruin);
  [glowCore, embers, beam].forEach((m) => (m.castShadow = m.receiveShadow = false));
  ruin.visible = false;
  ground.add(ruin);
  out.ruin = ruin;
  out.ruinParts = { glowCore, embers, beam, beamMat, coreLight, chunkMat, chunks, fires, smoke };
  // ruin state: k = 0 (just exploded, bright) … 1 (burnt down)
  out.setRuin = (t, on, k = 1) => {
    ruin.visible = on;
    b4.hall.visible = !on;
    if (!on) return;
    coreLight.intensity = 60 * k * (0.85 + 0.15 * Math.sin(t * 5.3) * Math.sin(t * 2.1));
    glowCore.material.color.setRGB(1, 0.42 + 0.06 * Math.sin(t * 4), 0.1);
    beamMat.opacity = 0.1 * k;
    chunkMat.emissiveIntensity = 1.0 + 0.4 * Math.sin(t * 3);
    fires.forEach((f) => f.userData.update(t, k));
    smoke.userData.update(t, 1, k);
  };

  // --- sarcophagus (state "sarkophag" / "nsc"): stepped concrete over block 4
  const sarc = new THREE.Group();
  const conc = facadeMat({ cols: 12, rows: 6, base: "#7d7a74", line: "#5f5c57", seed: 51 }, false);
  const sroof = real.plastic(0x5a5752, { roughness: 0.9 });
  const sb = building(9.2, 3.2, 8.4, conc, sroof);
  sb.position.set(3.2, 6.0, 0.8);
  sarc.add(sb);
  // the stepped "cascade wall" on the north side
  for (let i = 0; i < 5; i++) {
    const st = building(9.6, 1.4 + i * 0.6, 0.7, conc, sroof);
    st.position.set(3.2, (1.4 + i * 0.6) / 2 + 4.4, -3.6 - (4 - i) * 0.7 + 0.35);
    sarc.add(st);
  }
  // roof of large pipes
  for (let i = 0; i < 12; i++) {
    const p = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 8.4, 14),
      real.metal(0x6b6862, { roughness: 0.7 }),
    );
    p.rotation.x = Math.PI / 2;
    p.position.set(-0.9 + i * 0.75, 7.75, 0.8);
    sarc.add(p);
  }
  shadowAll(sarc);
  sarc.visible = false;
  ground.add(sarc);
  out.sarc = sarc;

  // --- the New Safe Confinement: a steel arch on rails
  const nsc = new THREE.Group();
  const span = 25.7;
  const height = 10.8;
  const len = 16.2;
  const arch = new THREE.Shape();
  const N = 40;
  for (let i = 0; i <= N; i++) {
    const a = Math.PI - (i / N) * Math.PI;
    arch.lineTo((Math.cos(a) * span) / 2, Math.sin(a) * height);
  }
  for (let i = N; i >= 0; i--) {
    const a = Math.PI - (i / N) * Math.PI;
    arch.lineTo(Math.cos(a) * (span / 2 - 0.5), Math.sin(a) * (height - 0.5));
  }
  const archFull = new THREE.Shape();
  for (let i = 0; i <= N; i++) {
    const a = Math.PI - (i / N) * Math.PI;
    archFull.lineTo((Math.cos(a) * span) / 2, Math.sin(a) * height);
  }
  const ageo = new THREE.ExtrudeGeometry(arch, {
    depth: len,
    bevelEnabled: false,
    curveSegments: 1,
  });
  ageo.translate(0, 0, -len / 2);
  // panel lines on the steel skin
  const skin = (() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 512;
    const g = c.getContext("2d");
    g.fillStyle = "#c9ced3";
    g.fillRect(0, 0, 512, 512);
    const rr = rng(3);
    for (let y = 0; y < 512; y += 16) {
      g.fillStyle = `rgba(0,0,0,${0.03 + rr() * 0.05})`;
      g.fillRect(0, y, 512, 16);
      g.fillStyle = "rgba(255,255,255,0.18)";
      g.fillRect(0, y, 512, 1.5);
    }
    for (let x = 0; x < 512; x += 64) {
      g.fillStyle = "rgba(0,0,0,0.12)";
      g.fillRect(x, 0, 2, 512);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(0.08, 0.08);
    return tex;
  })();
  const steelSkin = new THREE.MeshPhysicalMaterial({
    map: skin,
    color: 0xffffff,
    metalness: 0.75,
    roughness: 0.32,
    clearcoat: 0.3,
  });
  const am = new THREE.Mesh(ageo, steelSkin);
  am.rotation.y = Math.PI / 2;
  nsc.add(am);
  // end walls (slightly darker)
  for (const s of [-1, 1]) {
    const ew2 = new THREE.Mesh(
      new THREE.ShapeGeometry(archFull),
      real.metal(0x9aa0a6, { roughness: 0.5 }),
    );
    ew2.rotation.y = Math.PI / 2;
    ew2.position.x = (s * len) / 2;
    nsc.add(ew2);
  }
  // rails
  for (const z of [-span / 2 + 0.3, span / 2 - 0.3]) {
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(70, 0.15, 0.4),
      real.metal(0x6c6f72, { roughness: 0.4 }),
    );
    rail.position.set(-20, 0.08, z);
    ground.add(rail);
    out.rails = out.rails || [];
    out.rails.push(rail);
  }
  shadowAll(nsc);
  nsc.position.set(3.2, 0, 0.8);
  nsc.visible = false;
  ground.add(nsc);
  out.nsc = nsc;
  out.rails.forEach((m) => (m.visible = false));

  out.setState = (s) => {
    b4.hall.visible = s === "intakt";
    ruin.visible = s === "explodiert";
    sarc.visible = s === "sarkophag" || s === "nsc";
    nsc.visible = s === "nsc";
    out.rails.forEach((m) => (m.visible = s === "nsc"));
  };
  out.setState(state);

  // --- small things around the plant: lamps, transformers, fences, tanks
  const sodium = [];
  for (let i = 0; i < 18; i++) {
    const x = -60 + i * 5.2;
    const z = i % 2 ? 7.5 : 8.5;
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.05, 1.3, 8),
      real.metal(0x5a5c5e),
    );
    pole.position.set(x, 0.65, z);
    pole.castShadow = true;
    ground.add(pole);
    const bulb = noAO(
      new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), glowMat(night ? 0xffa040 : 0x8a8478)),
    );
    bulb.position.set(x, 1.32, z);
    ground.add(bulb);
    sodium.push(bulb);
    if (night && i % 4 === 1) {
      const pl = new THREE.PointLight(0xff9a3a, 4, 12, 1.6);
      pl.position.set(x, 1.4, z);
      ground.add(pl);
    }
  }
  // outdoor switchyard / transformers north of the turbine hall
  for (let i = 0; i < 8; i++) {
    const tr = new THREE.Mesh(
      roundedBox(1.0, 0.8, 0.9, 0.06),
      real.metal(0x6c7a6a, { roughness: 0.6 }),
    );
    tr.position.set(-58 + i * 9, 0.4, -14.5);
    tr.castShadow = true;
    ground.add(tr);
  }
  // water tanks + pump house by the pond
  for (const [x, z] of [
    [14, 10],
    [16.5, 10],
  ]) {
    const tk = new THREE.Mesh(
      new THREE.CylinderGeometry(1.1, 1.1, 1.6, 32),
      real.metal(0xb7bab8, { roughness: 0.5 }),
    );
    tk.position.set(x, 0.8, z);
    tk.castShadow = true;
    ground.add(tk);
  }
  // fence line around the yard
  const fenceMat = real.metal(0x6a6d70, { roughness: 0.6 });
  for (let i = 0; i < 46; i++) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.28, 6), fenceMat);
    post.position.set(-70 + i * 2.4, 0.14, 21);
    ground.add(post);
  }
  const fenceNet = new THREE.Mesh(
    new THREE.PlaneGeometry(110, 0.24),
    new THREE.MeshStandardMaterial({
      color: 0x777b80,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    }),
  );
  fenceNet.position.set(-15, 0.14, 21);
  ground.add(fenceNet);

  // --- the cooling pond to the south-east (a lake, 22 km² in reality)
  const pondMat = new THREE.MeshPhysicalMaterial({
    color: night ? 0x03060c : 0x3d5a6a,
    roughness: 0.12,
    metalness: 0,
    envMapIntensity: 1.4,
  });
  const pondGeo = new THREE.PlaneGeometry(230, 120, 1, 1);
  const pondM = noAO(new THREE.Mesh(pondGeo, pondMat));
  pondM.rotation.x = -Math.PI / 2;
  pondM.position.set(30, 0.01, 86);
  ground.add(pondM);
  // dam along the pond
  const dam = new THREE.Mesh(
    new THREE.BoxGeometry(150, 0.25, 1.6),
    real.plastic(0x6e6a5e, { roughness: 1 }),
  );
  dam.position.set(10, 0.12, 26.3);
  ground.add(dam);

  // --- power lines marching north
  const pyl = real.metal(0x8b8f93, { roughness: 0.5 });
  const pylons = [];
  for (let i = 0; i < 6; i++) {
    const p = new THREE.Group();
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.35, 4.2, 4), pyl);
    mast.position.y = 2.1;
    p.add(mast);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 2.6), pyl);
    arm.position.y = 3.9;
    p.add(arm);
    const arm2 = arm.clone();
    arm2.position.y = 3.2;
    arm2.scale.z = 0.8;
    p.add(arm2);
    p.position.set(-30 + i * 1.5, 0, -24 - i * 16);
    p.rotation.y = 0.1;
    shadowAll(p);
    ground.add(p);
    pylons.push(p);
  }
  const wireMat = new THREE.MeshBasicMaterial({ color: night ? 0x1a1c20 : 0x3a3c40 });
  for (let i = 0; i < pylons.length - 1; i++)
    for (const [dz, dy] of [
      [-1.2, 3.9],
      [1.2, 3.9],
      [-1, 3.2],
      [1, 3.2],
    ]) {
      const a = pylons[i].position.clone().add(V(0, dy - 0.05, dz));
      const b = pylons[i + 1].position.clone().add(V(0, dy - 0.05, dz));
      const pts = [];
      for (let k = 0; k <= 10; k++) {
        const f = k / 10;
        pts.push(
          a
            .clone()
            .lerp(b, f)
            .add(V(0, -Math.sin(f * Math.PI) * 0.6, 0)),
        );
      }
      ground.add(
        new THREE.Mesh(
          new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.015, 4),
          wireMat,
        ),
      );
    }

  // --- pine forest all around (not on the yard, not in the pond)
  if (forest) {
    let placed = 0;
    for (let i = 0; i < 900 && placed < 340; i++) {
      const a = r() * Math.PI * 2;
      const d = 34 + r() * 120;
      const x = Math.cos(a) * d - 15;
      const z = Math.sin(a) * d;
      if (z > 24 && x > -85 && x < 145 && z < 150) continue; // pond
      if (x > -76 && x < 40 && z > -30 && z < 24) continue; // plant
      if (Math.abs(x + 18) < 2.5 && (z > 20 || z < -24)) continue; // roads
      pine(x, z, 1.0 + r() * 1.1, i, false);
      placed++;
    }
  }

  // --- Prypjat on the horizon: panel blocks with lit windows
  if (pripyat) {
    const town = new THREE.Group();
    for (let i = 0; i < 46; i++) {
      const tall = r() < 0.35;
      const h = tall ? 3.2 + r() * 1.6 : 1.6 + r() * 0.8;
      const w = tall ? 1.6 : 4 + r() * 3;
      const mat = facadeMat(
        {
          cols: tall ? 4 : 14,
          rows: tall ? 16 : 9,
          base: "#d9d6cd",
          line: "#b6b2a8",
          seed: 100 + i,
          winRows: Array.from({ length: tall ? 16 : 9 }, (_, k) => k),
          winLit: night ? 0.28 : 0,
          win: "#3a4652",
        },
        night,
      );
      const b = building(w, h, 1.4, mat, real.plastic(0x5c5a56));
      b.position.set(-125 + (r() - 0.5) * 70, h / 2, -95 + (r() - 0.5) * 50);
      b.rotation.y = (r() < 0.5 ? 0 : Math.PI / 2) + (r() - 0.5) * 0.2;
      town.add(b);
    }
    ground.add(town);
    out.town = town;
  }

  // life: drifting mist / dust
  fireflies(night ? 50 : 30, {
    area: [-60, 30, 0.2, 2.5, -20, 30],
    color: night ? 0xffb070 : 0xe8e4da,
    seed,
    size: 0.03,
  });
  finishSet({ ground: night ? 0x0b0c0a : 0x55573f });
  return out;
}

// ---------------------------------------------------------------- control room (1 unit = 1 m)
// Block 4's control room: a long instrument wall with the round rod-position
// display in the middle, three slanted desks in front, the AZ-5 button on the
// reactor operator's desk, a power display and a wall clock.
function canvasTex(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.userData = { c, draw };
  return t;
}
export function buildControlRoom(o = V(0, 300, 0)) {
  const g = new THREE.Group();
  g.position.copy(o);
  scene.add(g);
  const r = rng(77);
  // room shell
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 12),
    real.plastic(0x4b4c48, { roughness: 0.55 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = 1;
  floor.receiveShadow = true;
  g.add(floor);
  const ceil = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 12),
    real.plastic(0xb8b6ae, { roughness: 0.9 }),
  );
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(0, 4.2, 1);
  g.add(ceil);
  const sideMat = real.plastic(0x8f9f94, { roughness: 0.8 });
  for (const [x, ry] of [
    [-8, Math.PI / 2],
    [8, -Math.PI / 2],
  ]) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(12, 4.2), sideMat);
    w.position.set(x, 2.1, 1);
    w.rotation.y = ry;
    g.add(w);
  }
  const back = new THREE.Mesh(new THREE.PlaneGeometry(18, 4.2), sideMat);
  back.position.set(0, 2.1, 7);
  back.rotation.y = Math.PI;
  g.add(back);
  // ceiling light strips
  for (let i = -3; i <= 3; i++)
    for (const z of [-1.5, 1.5, 4]) {
      const l = noAO(new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, 0.18), glowMat(0xf2f6ff)));
      l.position.set(i * 2.2, 4.17, z);
      g.add(l);
    }
  const fill = new THREE.PointLight(0xe8f0ff, 14, 22, 1.2);
  fill.position.set(0, 3.8, 1.5);
  g.add(fill);
  const fill2 = new THREE.PointLight(0xe8f0ff, 8, 18, 1.2);
  fill2.position.set(-5, 3.8, 0);
  g.add(fill2);
  // instrument wall: panels with gauges, lamp rows and mimic lines
  const panelTex = (seed) =>
    canvasTex(256, 384, (x, w, h) => {
      const q = rng(seed);
      x.fillStyle = "#a9b8ab";
      x.fillRect(0, 0, w, h);
      x.strokeStyle = "#6f7d72";
      x.lineWidth = 3;
      x.strokeRect(2, 2, w - 4, h - 4);
      // round gauges
      for (let i = 0; i < 6; i++) {
        const cx = 40 + (i % 3) * 88;
        const cy = 60 + Math.floor(i / 3) * 80;
        x.fillStyle = "#f2efe4";
        x.beginPath();
        x.arc(cx, cy, 28, 0, Math.PI * 2);
        x.fill();
        x.strokeStyle = "#2a2a2a";
        x.lineWidth = 2;
        x.stroke();
        x.beginPath();
        x.moveTo(cx, cy);
        const a = -2.4 + q() * 3;
        x.lineTo(cx + Math.cos(a) * 22, cy + Math.sin(a) * 22);
        x.strokeStyle = "#b02a1a";
        x.stroke();
      }
      // lamp grid
      for (let i = 0; i < 40; i++) {
        x.fillStyle = q() < 0.2 ? "#ffd27a" : q() < 0.15 ? "#7fe08a" : "#3d4a40";
        x.fillRect(18 + (i % 8) * 28, 230 + Math.floor(i / 8) * 20, 16, 10);
      }
      // mimic line
      x.strokeStyle = "#2c4a8a";
      x.lineWidth = 5;
      x.beginPath();
      x.moveTo(10, 350);
      x.lineTo(120, 350);
      x.lineTo(120, 330);
      x.lineTo(246, 330);
      x.stroke();
    });
  const panels = new THREE.Group();
  for (let i = -7; i <= 7; i++) {
    if (Math.abs(i) <= 1) continue; // the rod display sits in the middle
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.98, 3.2, 0.3), [
      sideMat,
      sideMat,
      sideMat,
      sideMat,
      new THREE.MeshStandardMaterial({ map: panelTex(i + 20), roughness: 0.6 }),
      sideMat,
    ]);
    m.position.set(i, 1.6, -4);
    panels.add(m);
  }
  g.add(panels);
  // the rod-position display: a big round field of 211 small lamps
  const dispBack = new THREE.Mesh(
    new THREE.BoxGeometry(2.96, 3.2, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x9aab9e, roughness: 0.7 }),
  );
  dispBack.position.set(0, 1.6, -4);
  g.add(dispBack);
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(1.25, 64),
    real.plastic(0x23282a, { roughness: 0.5 }),
  );
  disc.position.set(0, 2.05, -3.84);
  g.add(disc);
  const lampPos = [];
  for (let i = -8; i <= 8; i++)
    for (let j = -8; j <= 8; j++) {
      if (lampPos.length >= 211) break;
      if (i * i + j * j > 64) continue;
      lampPos.push([i * 0.135, j * 0.135]);
    }
  const lampGeo = new THREE.CircleGeometry(0.05, 16);
  const lampMat = new THREE.MeshBasicMaterial({ toneMapped: false });
  const lamps = noAO(new THREE.InstancedMesh(lampGeo, lampMat, lampPos.length));
  const d0 = new THREE.Object3D();
  lampPos.forEach(([x, y], i) => {
    d0.position.set(x, 2.05 + y, -3.83);
    d0.updateMatrix();
    lamps.setMatrixAt(i, d0.matrix);
    lamps.setColorAt(i, new THREE.Color(0xffb040));
  });
  g.add(lamps);
  // which lamps belong to rods that stay in during the test (≈ 8 of 211)
  const keep = new Set([12, 40, 77, 101, 118, 150, 170, 199]);
  const col = new THREE.Color();
  // ins: 0..1 share of rods in the core; az: 0..1 progress of the AZ-5 drop
  const setRods = (ins, az = 0, t = 0) => {
    lampPos.forEach((_, i) => {
      const order = ((i * 37) % lampPos.length) / lampPos.length;
      let on = keep.has(i) || order < ins ? 1 : 0;
      if (az > 0) on = Math.max(on, clamp01(az * 1.6 - order * 0.6));
      const blink = az > 0.05 && az < 0.98 && !keep.has(i) ? 0.7 + 0.3 * Math.sin(t * 20 + i) : 1;
      if (on > 0.5) col.setRGB(1.6 * blink, 0.62 * blink, 0.15 * blink);
      else col.setRGB(0.05, 0.18, 0.08);
      lamps.setColorAt(i, col);
    });
    lamps.instanceColor.needsUpdate = true;
  };
  setRods(1);
  // the power display (digits are part of the room, not an overlay)
  let lastPow = null;
  const powTex = canvasTex(512, 160, (x, w, h) => {
    x.fillStyle = "#101312";
    x.fillRect(0, 0, w, h);
  });
  const drawPow = (mw) => {
    const x = powTex.userData.c.getContext("2d");
    x.fillStyle = "#0c0f0e";
    x.fillRect(0, 0, 512, 160);
    x.font = "bold 112px monospace";
    x.textAlign = "right";
    x.fillStyle = mw > 3200 ? "#ff5a3a" : "#ff9a3a";
    x.shadowColor = x.fillStyle;
    x.shadowBlur = 18;
    x.fillText(String(Math.round(mw)).padStart(5, " "), 470, 120);
    powTex.needsUpdate = true;
  };
  const powBox = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.38, 0.08), [
    sideMat,
    sideMat,
    sideMat,
    sideMat,
    new THREE.MeshBasicMaterial({ map: powTex, toneMapped: false }),
    sideMat,
  ]);
  powBox.position.set(-2.3, 2.9, -3.8);
  g.add(powBox);
  const setPower = (mw) => {
    const v = Math.round(mw);
    if (v !== lastPow) {
      drawPow(v);
      lastPow = v;
    }
  };
  setPower(3200);
  // the wall clock
  const clock = new THREE.Group();
  const face = new THREE.Mesh(
    new THREE.CircleGeometry(0.32, 48),
    real.plastic(0xf4f1e8, { roughness: 0.4 }),
  );
  clock.add(face);
  const rimC = new THREE.Mesh(
    new THREE.TorusGeometry(0.32, 0.025, 10, 48),
    real.metal(0x30343a, { roughness: 0.3 }),
  );
  clock.add(rimC);
  for (let i = 0; i < 12; i++) {
    const tick = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.06, 0.01), real.plastic(0x1a1a1a));
    const a = (i / 12) * Math.PI * 2;
    tick.position.set(Math.sin(a) * 0.26, Math.cos(a) * 0.26, 0.01);
    tick.rotation.z = -a;
    clock.add(tick);
  }
  const hand = (len, w, c) => {
    const h = new THREE.Group();
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, len, 0.01), real.plastic(c));
    m.position.y = len / 2;
    h.add(m);
    h.position.z = 0.02;
    clock.add(h);
    return h;
  };
  const hh = hand(0.16, 0.025, 0x111111);
  const mh = hand(0.24, 0.018, 0x111111);
  const sh = hand(0.27, 0.007, 0xc02a1a);
  clock.position.set(3.0, 3.3, -3.82);
  g.add(clock);
  const setClock = (h, m, s) => {
    sh.rotation.z = -(s / 60) * Math.PI * 2;
    mh.rotation.z = -((m + s / 60) / 60) * Math.PI * 2;
    hh.rotation.z = -(((h % 12) + m / 60) / 12) * Math.PI * 2;
  };
  setClock(1, 22, 30);
  // alarm lamps over the wall
  const alarmMat = new THREE.MeshBasicMaterial({ color: 0x401010, toneMapped: false });
  for (let i = -6; i <= 6; i += 2) {
    const a = noAO(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.05), alarmMat));
    a.position.set(i, 3.35, -3.83);
    g.add(a);
  }
  const alarmLight = new THREE.PointLight(0xff2a1a, 0, 14, 1.4);
  alarmLight.position.set(0, 3.2, -2.5);
  g.add(alarmLight);
  const setAlarm = (k, t) => {
    const f = k * (Math.sin(t * 9) > 0 ? 1 : 0.25);
    alarmMat.color.setRGB(0.25 + 1.6 * f, 0.06 + 0.1 * f, 0.05);
    alarmLight.intensity = 10 * f;
  };
  // desks: three slanted consoles in a gentle arc
  const deskMat = real.plastic(0x9eae9f, { roughness: 0.6 });
  const topMat = real.plastic(0x7f8f82, { roughness: 0.55 });
  const switchGeo = new THREE.BoxGeometry(0.035, 0.05, 0.035);
  const switchMat = real.plastic(0x1a1a1a, { roughness: 0.4 });
  const desks = [];
  for (const [x, ry] of [
    [-2.1, 0.22],
    [0, 0],
    [2.1, -0.22],
  ]) {
    const d = new THREE.Group();
    const base = new THREE.Mesh(roundedBox(1.9, 0.78, 0.8, 0.04), deskMat);
    base.position.y = 0.39;
    d.add(base);
    const top = new THREE.Mesh(roundedBox(1.9, 0.06, 0.62, 0.02), topMat);
    top.position.set(0, 0.86, -0.05);
    top.rotation.x = 0.42;
    d.add(top);
    const sw = noAO(new THREE.InstancedMesh(switchGeo, switchMat, 48));
    for (let i = 0; i < 48; i++) {
      d0.position.set(
        -0.8 + (i % 16) * 0.105,
        0.92 - Math.floor(i / 16) * 0.075,
        -0.2 + Math.floor(i / 16) * 0.165,
      );
      d0.rotation.set(0.42, 0, 0);
      d0.updateMatrix();
      sw.setMatrixAt(i, d0.matrix);
    }
    d.add(sw);
    d.position.set(x, 0, -1.7);
    d.rotation.y = ry;
    g.add(d);
    desks.push(d);
  }
  // the AZ-5 button on the middle desk + its label plate
  const az = new THREE.Group();
  const plate = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.012, 0.16),
    real.metal(0xd8d6cf, { roughness: 0.4 }),
  );
  az.add(plate);
  const azBtn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.05, 0.05, 32),
    real.plastic(0xd0201a, { roughness: 0.25, clearcoat: 0.8 }),
  );
  azBtn.position.y = 0.03;
  az.add(azBtn);
  const lblTex = canvasTex(256, 96, (x, w, h) => {
    x.fillStyle = "#e8e6df";
    x.fillRect(0, 0, w, h);
    x.fillStyle = "#1a1a1a";
    x.font = "bold 64px sans-serif";
    x.textAlign = "center";
    x.fillText("АЗ-5", w / 2, 72);
  });
  const lbl = new THREE.Mesh(
    new THREE.PlaneGeometry(0.16, 0.06),
    new THREE.MeshStandardMaterial({ map: lblTex, roughness: 0.5 }),
  );
  lbl.rotation.x = -Math.PI / 2;
  lbl.position.set(0, 0.008, 0.055);
  az.add(lbl);
  az.position.set(0.62, 0.95, -0.12);
  az.rotation.x = 0.42;
  desks[1].add(az);
  const azWorld = () => azBtn.getWorldPosition(V(0, 0, 0));
  // chairs
  for (const x of [-2.1, 0, 2.1]) {
    const ch = new THREE.Group();
    const seat = new THREE.Mesh(roundedBox(0.5, 0.08, 0.5, 0.03), real.fabric(0x3a3f44));
    seat.position.y = 0.48;
    ch.add(seat);
    const bk = new THREE.Mesh(roundedBox(0.5, 0.55, 0.06, 0.03), real.fabric(0x3a3f44));
    bk.position.set(0, 0.78, 0.24);
    ch.add(bk);
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.46, 8),
      real.metal(0x555555),
    );
    leg.position.y = 0.23;
    ch.add(leg);
    ch.position.set(x + 0.4, 0, -0.6);
    g.add(ch);
  }
  // the people: white coats + caps (operators), Dyatlov in a dark suit
  const toptunov = makePerson({ coat: 0xe9e8e2, legs: 0x2a2d33, cap: 0xf2f1ec, scale: 10 });
  toptunov.position.set(0.25, 0, -0.75);
  toptunov.rotation.y = Math.PI / 2;
  g.add(toptunov);
  const akimov = makePerson({ coat: 0xe2e1da, legs: 0x2a2d33, cap: 0xf2f1ec, scale: 10 });
  akimov.position.set(1.2, 0, -0.9);
  akimov.rotation.y = Math.PI / 2 + 0.3;
  g.add(akimov);
  const dyatlov = makePerson({ coat: 0x3a3c40, legs: 0x26282c, cap: null, scale: 10.4 });
  dyatlov.position.set(-1.2, 0, 0.6);
  dyatlov.rotation.y = Math.PI / 2 - 0.6;
  g.add(dyatlov);
  const others = [];
  for (const [x, z, ry] of [
    [-2.6, -0.9, 1.4],
    [2.9, -0.9, 1.9],
    [-4.5, 1.5, 0.6],
  ]) {
    const p = makePerson({ coat: 0xe6e5de, legs: 0x2a2d33, cap: 0xf2f1ec, scale: 10 });
    p.position.set(x, 0, z);
    p.rotation.y = ry;
    g.add(p);
    others.push(p);
  }
  // dust falling from the ceiling after the blast (k 0..1)
  const dustN = 300;
  const dust = noAO(
    new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(0.012, 0),
      new THREE.MeshBasicMaterial({ color: 0xd8d2c4, transparent: true, opacity: 0.8 }),
      dustN,
    ),
  );
  const ds = Array.from({ length: dustN }, () => [r() * 14 - 7, r() * 6 - 3, r(), r()]);
  dust.visible = false;
  g.add(dust);
  const setDust = (t, k) => {
    dust.visible = k > 0.01;
    if (!dust.visible) return;
    ds.forEach(([x, z, a, b], i) => {
      const y = 4.1 - ((a + t * (0.25 + b * 0.3)) % 1) * 4.1;
      d0.position.set(x, y, z);
      d0.rotation.set(0, 0, 0);
      d0.scale.setScalar(k);
      d0.updateMatrix();
      dust.setMatrixAt(i, d0.matrix);
    });
    dust.instanceMatrix.needsUpdate = true;
  };
  shadowAll(g);
  [floor].forEach((m) => (m.castShadow = false));
  return {
    group: g,
    setRods,
    setPower,
    setClock,
    setAlarm,
    setDust,
    toptunov,
    akimov,
    dyatlov,
    others,
    azBtn,
    azWorld,
    fill,
    desks,
    clock,
    powBox,
    disc,
  };
}

// ---------------------------------------------------------------- reactor core in x-ray (1 unit = 1 m)
// A cut-away of the RBMK core: the back half of the graphite stack, fuel
// channels with glowing fuel, control rods (absorber + graphite tip) that move,
// water rising and turning to steam, neutrons flying, xenon specks, the upper
// lid and the pipes, a small turbine to the side; below: the pool room.
export function buildCore(o = V(0, -300, 0)) {
  const g = new THREE.Group();
  g.position.copy(o);
  scene.add(g);
  const r = rng(91);
  const R = 5.8;
  const H = 7;
  // dark room around
  const room = new THREE.Mesh(
    new THREE.CylinderGeometry(16, 16, 32, 48, 1, true),
    real.plastic(0x15181c, { roughness: 0.95, side: THREE.BackSide }),
  );
  room.position.y = 4;
  g.add(room);
  const fl = new THREE.Mesh(
    new THREE.CircleGeometry(16, 48),
    real.plastic(0x202326, { roughness: 0.9 }),
  );
  fl.rotation.x = -Math.PI / 2;
  fl.position.y = -12;
  g.add(fl);
  // graphite stack: back half-cylinder of stacked blocks (x-ray look)
  const stackMat = new THREE.MeshStandardMaterial({
    color: 0x555a60,
    roughness: 0.8,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const shell = new THREE.Mesh(
    new THREE.CylinderGeometry(R, R, H, 64, 8, true, Math.PI / 2, Math.PI),
    stackMat,
  );
  shell.position.y = H / 2;
  g.add(shell);
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(
      new THREE.CylinderGeometry(R, R, H, 32, 1, true, Math.PI / 2, Math.PI),
      1,
    ),
    new THREE.LineBasicMaterial({ color: 0x9fd4ff, transparent: true, opacity: 0.5 }),
  );
  edges.position.y = H / 2;
  g.add(edges);
  // graphite blocks of the cut face (a grid of squares)
  const blkMat = new THREE.MeshStandardMaterial({
    color: 0x3b3f44,
    roughness: 0.85,
    transparent: true,
    opacity: 0.55,
  });
  const blocks = noAO(
    new THREE.InstancedMesh(new THREE.BoxGeometry(0.23, 0.58, 0.23), blkMat, 1400),
  );
  const d0 = new THREE.Object3D();
  let nb = 0;
  for (let x = -R + 0.13; x < R; x += 0.25)
    for (let y = 0.3; y < H; y += 0.6) {
      if (nb >= 1400) break;
      d0.position.set(x, y, -0.13);
      d0.updateMatrix();
      blocks.setMatrixAt(nb++, d0.matrix);
    }
  blocks.count = nb;
  g.add(blocks);
  // channels: grid in the back half
  const chans = [];
  for (let x = -R + 0.5; x < R - 0.3; x += 0.82)
    for (let z = -0.3; z > -R; z -= 0.82) if (x * x + z * z < (R - 0.35) ** 2) chans.push([x, z]);
  const rods = chans.filter((_, i) => i % 5 === 2);
  const fuel = chans.filter((_, i) => i % 5 !== 2);
  const tubeMat = new THREE.MeshStandardMaterial({
    color: 0x9aa4ac,
    metalness: 0.6,
    roughness: 0.35,
    transparent: true,
    opacity: 0.45,
  });
  const fuelMat = new THREE.MeshStandardMaterial({
    color: 0x3a2618,
    emissive: 0xff6a1a,
    emissiveIntensity: 1,
    roughness: 0.6,
  });
  const tubes = noAO(
    new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.07, 0.07, H + 3.2, 10),
      tubeMat,
      chans.length,
    ),
  );
  const fuels = noAO(
    new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.045, 0.045, H - 0.3, 8),
      fuelMat,
      fuel.length,
    ),
  );
  chans.forEach(([x, z], i) => {
    d0.position.set(x, H / 2 + 1.6, z);
    d0.updateMatrix();
    tubes.setMatrixAt(i, d0.matrix);
  });
  fuel.forEach(([x, z], i) => {
    d0.position.set(x, H / 2, z);
    d0.updateMatrix();
    fuels.setMatrixAt(i, d0.matrix);
  });
  g.add(tubes, fuels);
  // control rods: absorber (silver-blue, 5 m) + graphite tip (4.5 m) below, 1.25 m apart
  const absMat = real.metal(0xb9c7d6, { roughness: 0.25, emissive: 0x0a1a2a });
  const tipMat = new THREE.MeshStandardMaterial({
    color: 0x2b2b2e,
    roughness: 0.7,
    emissive: 0xff3a0a,
    emissiveIntensity: 0,
  });
  const rodGroups = rods.map(([x, z]) => {
    const rg = new THREE.Group();
    const ab = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 5, 12), absMat);
    ab.position.y = 2.5;
    rg.add(ab);
    const link = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 1.25, 6),
      real.metal(0x777777),
    );
    link.position.y = -0.625;
    rg.add(link);
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.5, 12), tipMat);
    tip.position.y = -1.25 - 2.25;
    rg.add(tip);
    rg.position.set(x, 0, z);
    g.add(rg);
    return rg;
  });
  // rod position: ins 0 = pulled out (absorber above the core, tip in the middle), 1 = fully in
  const rodY = (ins) => H + 0.4 - ins * 5.9; // absorber bottom
  // water (blue) rising in the channels, steam bubbles (white) above
  const NW = 900;
  const waterMat = new THREE.MeshBasicMaterial({
    color: 0x3aa0ff,
    transparent: true,
    opacity: 0.85,
    toneMapped: false,
  });
  const steamMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    toneMapped: false,
  });
  const water = noAO(new THREE.InstancedMesh(new THREE.SphereGeometry(0.045, 8, 6), waterMat, NW));
  const steam = noAO(new THREE.InstancedMesh(new THREE.SphereGeometry(0.075, 10, 8), steamMat, NW));
  const ws = Array.from({ length: NW }, () => [Math.floor(r() * fuel.length), r(), r()]);
  g.add(water, steam);
  // neutrons: bright specks darting between channels
  const NN = 260;
  const neutrons = noAO(
    new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.035, 8, 6),
      new THREE.MeshBasicMaterial({ color: 0xfff6c0, toneMapped: false }),
      NN,
    ),
  );
  const ns = Array.from({ length: NN }, () => [
    Math.floor(r() * fuel.length),
    r() * 6.28,
    r() * H,
    r(),
    r(),
  ]);
  g.add(neutrons);
  // xenon specks (violet)
  const NX = 400;
  const xenon = noAO(
    new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(0.09, 1),
      new THREE.MeshBasicMaterial({ color: 0xd28aff, toneMapped: false }),
      NX,
    ),
  );
  const xs = Array.from({ length: NX }, () => [
    (r() - 0.5) * 2 * R * 0.9,
    0.3 + r() * (H - 0.6),
    -r() * R * 0.9,
    r(),
  ]);
  g.add(xenon);
  // the upper lid (Elena) and the lower plate, steel x-ray
  const lidMat = new THREE.MeshStandardMaterial({
    color: 0x8a9096,
    metalness: 0.5,
    roughness: 0.4,
    transparent: true,
    opacity: 0.55,
  });
  const lid = new THREE.Mesh(
    new THREE.CylinderGeometry(R + 0.8, R + 0.8, 3, 64, 1, false, Math.PI / 2, Math.PI),
    lidMat,
  );
  lid.position.y = H + 1.6;
  const lidPivot = new THREE.Group();
  lidPivot.add(lid);
  g.add(lidPivot);
  const lower = new THREE.Mesh(
    new THREE.CylinderGeometry(R + 0.6, R + 0.6, 2, 64, 1, false, Math.PI / 2, Math.PI),
    lidMat,
  );
  lower.position.y = -1.0;
  g.add(lower);
  // steam pipes leading to a small turbine on the right
  const pipeM = real.metal(0xa8b0b6, { roughness: 0.3 });
  const steamPipe = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        V(2, H + 3, -1),
        V(4, H + 5, -1),
        V(9, H + 5, -1),
        V(11, H + 2, -1),
      ]),
      40,
      0.25,
      12,
    ),
    pipeM,
  );
  g.add(steamPipe);
  const turbine = new THREE.Group();
  const casing = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 1.4, 3.2, 32, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0x9aa6b0,
      metalness: 0.6,
      roughness: 0.35,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    }),
  );
  casing.rotation.z = Math.PI / 2;
  turbine.add(casing);
  const shaft = new THREE.Group();
  for (let k = 0; k < 5; k++) {
    const wheel = new THREE.Group();
    for (let b = 0; b < 14; b++) {
      const bl = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.85 + k * 0.08, 0.16),
        real.metal(0xd8c48a, { roughness: 0.25 }),
      );
      bl.position.y = 0.5;
      const a = new THREE.Group();
      a.rotation.x = (b / 14) * Math.PI * 2;
      a.add(bl);
      wheel.add(a);
    }
    wheel.position.x = -1.2 + k * 0.6;
    shaft.add(wheel);
  }
  const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 5, 16), real.metal(0x666c70));
  axle.rotation.z = Math.PI / 2;
  shaft.add(axle);
  turbine.add(shaft);
  turbine.position.set(12, H + 1, -1);
  g.add(turbine);
  // the pool room below (bubbler pool), seen in chapter 6
  const pool = new THREE.Mesh(
    new THREE.BoxGeometry(20, 2.2, 10),
    new THREE.MeshPhysicalMaterial({
      color: 0x1f6a9a,
      roughness: 0.1,
      transmission: 0,
      transparent: true,
      opacity: 0.7,
    }),
  );
  pool.position.set(0, -10.4, -2);
  g.add(pool);
  const poolRim = new THREE.Mesh(
    new THREE.BoxGeometry(20.6, 0.4, 10.6),
    real.plastic(0x5a5c5e, { roughness: 0.9 }),
  );
  poolRim.position.set(0, -11.6, -2);
  g.add(poolRim);
  // corium (lava-like) flowing down through the floors (chapter 6)
  const coriumMat = new THREE.MeshStandardMaterial({
    color: 0x2a1408,
    emissive: 0xff5a10,
    emissiveIntensity: 1.6,
    roughness: 0.6,
  });
  const corium = new THREE.Group();
  for (let i = 0; i < 14; i++) {
    const b = new THREE.Mesh(
      jitter(new THREE.IcosahedronGeometry(0.6 + r() * 0.8, 2), 0.12, i),
      coriumMat,
    );
    b.position.set((r() - 0.5) * 6, -r() * 2, -r() * 3);
    b.scale.y = 0.5;
    corium.add(b);
  }
  corium.visible = false;
  g.add(corium);
  const coreLight = new THREE.PointLight(0xff8a3a, 10, 24, 1.3);
  coreLight.position.set(0, H / 2, -1.5);
  g.add(coreLight);
  const blueLight = new THREE.PointLight(0x7fb8ff, 6, 26, 1.2);
  blueLight.position.set(-4, H + 4, 6);
  g.add(blueLight);
  // state: power (1 = normal, 0.01 = almost off, 100 = runaway), ins (0..1, all
  // rods), keep (n rods stay in when ins is 0), voidK (steam share 0..1),
  // xenonK (0..1), tipK (glow of the graphite tips at the bottom), turbineSpeed
  const setCore = (
    t,
    {
      power = 1,
      ins = 0.3,
      keep = 0,
      voidK = 0.25,
      xenonK = 0,
      tipK = 0,
      turbineSpeed = 1,
      burst = 0,
      lidLift = 0,
    } = {},
  ) => {
    const p = Math.min(power, 3) / 3;
    fuelMat.emissiveIntensity = 0.15 + Math.min(4, power) * 0.9;
    coreLight.intensity = 6 + Math.min(power, 20) * 6;
    rodGroups.forEach((rg, i) => {
      const forced = (i * 3) % rodGroups.length < keep;
      rg.position.y = rodY(forced ? 1 : ins);
    });
    tipMat.emissiveIntensity = tipK * 3;
    // water + steam
    ws.forEach(([fi, a, b], i) => {
      const [x, z] = fuel[fi];
      const u = (a + t * (0.12 + b * 0.08) * (0.4 + p)) % 1;
      const y = u * H;
      const isSteam = u > 1 - voidK * 1.2 - (burst > 0 ? 1 : 0);
      d0.position.set(x + Math.sin(i + t * 3) * 0.03, y, z + 0.08);
      d0.rotation.set(0, 0, 0);
      d0.scale.setScalar(1 + burst * 3 * b);
      d0.updateMatrix();
      if (isSteam) {
        steam.setMatrixAt(i, d0.matrix);
        water.setMatrixAt(i, new THREE.Matrix4().makeScale(0, 0, 0));
      } else {
        water.setMatrixAt(i, d0.matrix);
        steam.setMatrixAt(i, new THREE.Matrix4().makeScale(0, 0, 0));
      }
    });
    water.instanceMatrix.needsUpdate = true;
    steam.instanceMatrix.needsUpdate = true;
    // neutrons: number shown grows with power, flight hops between channels
    const shown = Math.round(NN * Math.min(1, 0.05 + p * 0.65));
    ns.forEach(([fi, ang, y, sp, ph], i) => {
      if (i >= shown) {
        neutrons.setMatrixAt(i, new THREE.Matrix4().makeScale(0, 0, 0));
        return;
      }
      const [x, z] = fuel[fi];
      const u = (ph + t * (1.2 + sp)) % 1;
      const d = u * 1.6;
      const yy = tipK > 0 && i % 3 === 0 ? 0.3 + (y % 2) : y;
      d0.position.set(
        x + Math.cos(ang + Math.floor(t + ph) * 2.1) * d,
        yy,
        z + Math.sin(ang) * d * 0.4 + 0.1,
      );
      d0.scale.setScalar(1 - u * 0.6);
      d0.updateMatrix();
      neutrons.setMatrixAt(i, d0.matrix);
    });
    neutrons.instanceMatrix.needsUpdate = true;
    const nx = Math.round(NX * xenonK);
    xs.forEach(([x, y, z, ph], i) => {
      if (i >= nx) {
        xenon.setMatrixAt(i, new THREE.Matrix4().makeScale(0, 0, 0));
        return;
      }
      d0.position.set(x + Math.sin(t + ph * 6) * 0.05, y, z + 0.1);
      d0.scale.setScalar(1);
      d0.updateMatrix();
      xenon.setMatrixAt(i, d0.matrix);
    });
    xenon.instanceMatrix.needsUpdate = true;
    shaft.rotation.x = t * 8 * turbineSpeed;
    lidPivot.position.y = lidLift * 9;
    lidPivot.rotation.z = lidLift * 1.2;
    lidPivot.position.x = lidLift * 1.5;
  };
  setCore(0);
  shadowAll(g);
  room.castShadow = room.receiveShadow = false;
  return {
    group: g,
    setCore,
    rodGroups,
    fuel,
    rods,
    corium,
    pool,
    lid: lidPivot,
    turbine,
    coreLight,
    H,
    R,
    tipMat,
  };
}

// ---------------------------------------------------------------- Prypjat (outdoor, 1 unit = 10 m)
// Saturday morning / evening light: panel blocks, the amusement park with the
// yellow Ferris wheel and the bumper-car pavilion, spring trees, the road with
// the bus column, and the plant on the horizon (smoke in "rauch" mode).
export function makeFerrisWheel() {
  const g = new THREE.Group();
  const frame = real.metal(0xe9e6de, { roughness: 0.4 });
  const yellow = real.plastic(0xf2c218, { roughness: 0.35, clearcoat: 0.6 });
  const R = 1.3;
  const wheel = new THREE.Group();
  for (const z of [-0.12, 0.12]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(R, 0.025, 8, 64), frame);
    ring.position.z = z;
    wheel.add(ring);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(R * 0.55, 0.018, 8, 48), frame);
    ring2.position.z = z;
    wheel.add(ring2);
    for (let i = 0; i < 16; i++) {
      const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, R, 6), frame);
      const a = (i / 16) * Math.PI * 2;
      sp.position.set((Math.cos(a) * R) / 2, (Math.sin(a) * R) / 2, z);
      sp.rotation.z = a - Math.PI / 2;
      wheel.add(sp);
    }
  }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.34, 16), frame);
  hub.rotation.x = Math.PI / 2;
  wheel.add(hub);
  const gondolas = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const gp = new THREE.Group();
    gp.position.set(Math.cos(a) * R, Math.sin(a) * R, 0);
    const cab = new THREE.Mesh(roundedBox(0.16, 0.14, 0.16, 0.03), yellow);
    cab.position.y = -0.1;
    gp.add(cab);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.06, 6), yellow);
    roof.position.y = -0.01;
    gp.add(roof);
    wheel.add(gp);
    gondolas.push(gp);
  }
  wheel.position.y = R + 0.35;
  g.add(wheel);
  // A-frame legs
  for (const z of [-0.2, 0.2])
    for (const s of [-1, 1]) {
      const a = V(0, R + 0.35, z);
      const b = V(s * 0.75, 0, z * 1.6);
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.045, a.distanceTo(b), 8),
        frame,
      );
      leg.position.copy(a).add(b).multiplyScalar(0.5);
      leg.quaternion.setFromUnitVectors(V(0, 1, 0), a.clone().sub(b).normalize());
      g.add(leg);
    }
  g.userData = { wheel, gondolas };
  g.userData.update = (rot) => {
    wheel.rotation.z = rot;
    gondolas.forEach((gp) => (gp.rotation.z = -rot));
  };
  shadowAll(g);
  return g;
}
export const PRYP_SKY = {
  morgen: {
    top: [0.36, 0.56, 0.86],
    mid: [0.7, 0.78, 0.9],
    hor: [1.0, 0.88, 0.74],
    below: [0.62, 0.66, 0.6],
    sun: [1, 0.9, 0.7],
    sunDir: [0.7, 0.18, -0.6],
    cloud: [0xffffff, 0xd6c8c0],
    hemi: [0xf0f4ff, 0x5a5a40, 1.15],
    key: [0xfff0d6, 2.8],
    keyPos: [22, 12, -16],
    rim: [0xbfd4ff, 0.6],
    clouds: 12,
    birds: true,
    fog: [60, 240],
  },
  abend: SKY.abend,
};
export function buildPripyat({ time = "morgen", seed = 12, plume = true } = {}) {
  const r = rng(seed);
  setSky(PRYP_SKY[time]);
  widenShadow(30, 120);
  terrain(0x6f8a45, {
    r: 170,
    step: 2.4,
    flatR: 80,
    hills: 2,
    seed: 4,
    amt: 0.1,
    scale: 0.06,
    warm: 0.5,
  });
  const asphalt = real.plastic(0x4b4a47, { roughness: 0.92 });
  const road = (x, z, w, d) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), asphalt);
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.03, z);
    m.receiveShadow = true;
    ground.add(m);
  };
  road(0, 9, 160, 1.4); // main road (bus column)
  road(-14, -10, 1.2, 60);
  road(16, -10, 1.2, 60);
  // paths in the park
  const path = new THREE.Mesh(
    new THREE.CircleGeometry(3.4, 40),
    real.plastic(0x9c9486, { roughness: 0.95 }),
  );
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, 0.025, 0);
  ground.add(path);
  // the Ferris wheel and the bumper-car pavilion
  const wheel = makeFerrisWheel();
  wheel.position.set(0, 0, -1);
  ground.add(wheel);
  const pav = new THREE.Group();
  const roofM = real.plastic(0xd8d2c2, { roughness: 0.6 });
  const pr = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 1.4), roofM);
  pr.position.y = 0.55;
  pav.add(pr);
  for (const [x, z] of [
    [-1, -0.6],
    [1, -0.6],
    [-1, 0.6],
    [1, 0.6],
  ]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.55, 8), real.metal(0x8a8f94));
    p.position.set(x, 0.27, z);
    pav.add(p);
  }
  for (let i = 0; i < 7; i++) {
    const car = new THREE.Mesh(
      roundedBox(0.16, 0.07, 0.11, 0.03),
      real.plastic([0xd8312a, 0x2a6ad8, 0xf2c218][i % 3], { clearcoat: 0.6 }),
    );
    car.position.set(-0.8 + (i % 4) * 0.5 + r() * 0.1, 0.05, -0.4 + Math.floor(i / 4) * 0.6);
    car.rotation.y = r() * 3;
    pav.add(car);
  }
  shadowAll(pav);
  pav.position.set(5, 0, -0.5);
  ground.add(pav);
  // panel blocks around the park + the 16-storey towers behind
  const blocks = [];
  const addBlock = (x, z, w, h, d, ry, sd) => {
    const mat = facadeMat(
      {
        cols: Math.round(w * 3),
        rows: Math.round(h * 3.3),
        base: "#e2dfd6",
        line: "#bdb8ad",
        seed: sd,
        winRows: Array.from({ length: Math.round(h * 3.3) }, (_, k) => k),
        winLit: time === "abend" ? 0.25 : 0,
        win: "#4a5660",
      },
      time === "abend",
    );
    const b = building(w, h, d, mat, real.plastic(0x6a6862, { roughness: 0.9 }));
    b.position.set(x, h / 2, z);
    b.rotation.y = ry;
    ground.add(b);
    blocks.push(b);
    // balcony strips
    for (let k = 1; k < Math.round(h * 3.3); k += 1) {
      const bal = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.96, 0.03, 0.12),
        real.plastic(0xcfcac0, { roughness: 0.85 }),
      );
      bal.position.set(0, -h / 2 + k * (h / Math.round(h * 3.3)), d / 2 + 0.06);
      b.add(bal);
    }
  };
  addBlock(-10, -8, 7, 2.9, 1.3, 0, 201);
  addBlock(9.5, -9, 7, 2.9, 1.3, 0, 202);
  addBlock(-20, -2, 1.3, 2.9, 7, 0, 203);
  addBlock(21, -2, 1.3, 2.9, 7, 0, 204);
  addBlock(-6, -18, 2.2, 5, 2.2, 0, 205);
  addBlock(6, -19, 2.2, 5, 2.2, 0, 206);
  addBlock(18, -20, 2.2, 5, 2.2, 0, 207);
  addBlock(-18, -19, 2.2, 5, 2.2, 0, 208);
  for (let i = 0; i < 14; i++)
    addBlock(
      -60 + i * 9 + r() * 3,
      -34 - r() * 10,
      6,
      2.6 + r() * 1.5,
      1.3,
      (r() - 0.5) * 0.2,
      220 + i,
    );
  // spring trees: fresh light green
  const leaf = [0x8fc04a, 0x7ab03c, 0xa3cc5a];
  for (let i = 0; i < 70; i++) {
    const a = r() * Math.PI * 2;
    const d = 4 + r() * 22;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d * 0.7;
    if (Math.abs(z - 9) < 1.5) continue;
    if (Math.abs(x) < 3.5 && Math.abs(z + 1) < 3) continue;
    const t = new THREE.Group();
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.6, 6), real.wood(0x5a4330));
    tr.position.y = 0.3;
    t.add(tr);
    const crown = F(
      jitter(new THREE.IcosahedronGeometry(0.45 + r() * 0.25, 1), 0.08, i),
      flat(leaf[i % 3]),
      0.1,
      i,
    );
    crown.position.y = 0.85;
    crown.scale.y = 1.2;
    t.add(crown);
    t.position.set(x, 0, z);
    shadowAll(t);
    ground.add(t);
  }
  // the bus column on the main road (shown during the evacuation)
  const buses = new THREE.Group();
  for (let i = 0; i < 26; i++) {
    const b = makeBus([0xe8c64a, 0xdedad0, 0x6aa0c8, 0xd86a3a][i % 4]);
    b.position.set(-40 + i * 3.1, 0, 9 + (i % 2 ? -0.25 : 0.25));
    buses.add(b);
  }
  ground.add(buses);
  // people in the park (Saturday)
  const people = [];
  for (let i = 0; i < 26; i++) {
    const kid = i % 3 === 0;
    const p = makePerson({
      coat: [0xc84a3a, 0x3a6ac8, 0xe8d8b8, 0x5a7a4a, 0x8a4a8a][i % 5],
      cap: null,
      scale: kid ? 0.65 : 1,
    });
    const a = r() * Math.PI * 2;
    const d = 2 + r() * 4;
    p.position.set(Math.cos(a) * d, 0, Math.sin(a) * d * 0.8 + 1);
    p.rotation.y = r() * 6;
    p.userData.walk = [r() * 6, (r() - 0.5) * 0.4];
    ground.add(p);
    people.push(p);
  }
  // the plant on the horizon (south-east), with the plume after the explosion
  const plant = new THREE.Group();
  const pm = real.plastic(0xa9a69e, { roughness: 0.9 });
  const b1 = new THREE.Mesh(new THREE.BoxGeometry(30, 3, 5), pm);
  b1.position.y = 1.5;
  plant.add(b1);
  const b2 = new THREE.Mesh(new THREE.BoxGeometry(9, 7, 7), pm);
  b2.position.set(6, 3.5, 5);
  plant.add(b2);
  const st = ventStack(2, 4, 7, 8, false);
  plant.add(st);
  plant.position.set(70, 0, -110);
  plant.rotation.y = -0.5;
  ground.add(plant);
  let smoke = null;
  if (plume) {
    smoke = smokeColumn({
      n: 60,
      h: 70,
      w: 5,
      drift: [1.2, 0, 0.5],
      seed: 9,
      size: 4,
      color: 0x5a5550,
      glow: 0x000000,
      speed: 0.02,
    });
    smoke.position.set(76, 7, -108);
    ground.add(smoke);
  }
  fireflies(30, { area: [-20, 20, 0.3, 3, -15, 12], color: 0xfff6d8, seed: 3, size: 0.02 });
  finishSet({ ground: 0x5d7040 });
  return { wheel, pav, buses, people, blocks, plant, smoke };
}

// ---------------------------------------------------------------- Forsmark entrance (1 unit = 1 m)
// A radiation portal at the staff entrance of the Swedish plant, early morning.
export function buildForsmark(o = V(0, 300, 0)) {
  const g = new THREE.Group();
  g.position.copy(o);
  scene.add(g);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 12),
    real.plastic(0x8d8a84, { roughness: 0.6 }),
  );
  floor.rotation.x = -Math.PI / 2;
  g.add(floor);
  const wallMat = real.plastic(0xdedbd2, { roughness: 0.8 });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(16, 4), wallMat);
  back.position.set(0, 2, -4);
  g.add(back);
  // windows with morning light behind
  for (let i = -3; i <= 3; i++) {
    const w = noAO(new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.8), glowMat(0xdfeaff)));
    w.position.set(i * 2, 2.1, -3.98);
    g.add(w);
  }
  const sun = new THREE.SpotLight(0xfff0d8, 80, 30, 0.6, 0.8, 1.2);
  sun.position.set(-2, 3.5, -5);
  sun.target.position.set(1, 0, 2);
  g.add(sun, sun.target);
  const fill = new THREE.PointLight(0xe8f0ff, 10, 20, 1.2);
  fill.position.set(0, 3.5, 3);
  g.add(fill);
  // the portal monitor: two grey pillars + a top bar with a lamp
  const portal = new THREE.Group();
  const pm = real.plastic(0xb9bec4, { roughness: 0.45 });
  for (const x of [-0.55, 0.55]) {
    const p = new THREE.Mesh(roundedBox(0.28, 2.1, 0.7, 0.05), pm);
    p.position.set(x, 1.05, 0);
    portal.add(p);
    const stripe = new THREE.Mesh(roundedBox(0.285, 0.12, 0.705, 0.02), real.plastic(0xf2c218));
    stripe.position.set(x, 1.5, 0);
    portal.add(stripe);
  }
  const top = new THREE.Mesh(roundedBox(1.4, 0.2, 0.7, 0.05), pm);
  top.position.y = 2.2;
  portal.add(top);
  const lampMat = new THREE.MeshBasicMaterial({ color: 0x401010, toneMapped: false });
  const lamp = noAO(new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), lampMat));
  lamp.position.set(0, 2.38, 0);
  portal.add(lamp);
  const lampLight = new THREE.PointLight(0xff2a1a, 0, 8, 1.5);
  lampLight.position.set(0, 2.4, 0.4);
  portal.add(lampLight);
  portal.position.set(0, 0, 0);
  g.add(portal);
  // turnstile rails, lockers, a plant
  for (const x of [-2.5, 2.5]) {
    const rail = new THREE.Mesh(
      roundedBox(0.06, 1.0, 3.0, 0.02),
      real.metal(0xc8ccd0, { roughness: 0.3 }),
    );
    rail.position.set(x, 0.5, 0.5);
    g.add(rail);
  }
  for (let i = 0; i < 6; i++) {
    const lk = new THREE.Mesh(
      roundedBox(0.5, 1.9, 0.5, 0.02),
      real.plastic(0x5a7a9a, { roughness: 0.5 }),
    );
    lk.position.set(-6 + i * 0.52, 0.95, -3.6);
    g.add(lk);
  }
  const worker = makePerson({ coat: 0x2f4f7a, legs: 0x2a2d33, cap: null, scale: 10 });
  worker.position.set(0, 0, 2.5);
  worker.rotation.y = -Math.PI / 2;
  g.add(worker);
  // his shoes (the parts that set off the alarm)
  const shoes = [];
  for (const s of [-1, 1]) {
    const sh = new THREE.Mesh(roundedBox(0.3, 0.1, 0.12, 0.04), real.rubber(0x1a1a1a));
    sh.position.set(0.05, 0.05, s * 0.14);
    worker.add(sh);
    sh.scale.setScalar(0.1);
    shoes.push(sh);
  }
  const setAlarm = (k, t) => {
    const f = k * (Math.sin(t * 10) > 0 ? 1 : 0.2);
    lampMat.color.setRGB(0.25 + 1.6 * f, 0.05, 0.04);
    lampLight.intensity = f * 12;
  };
  shadowAll(g);
  return { group: g, worker, shoes, portal, setAlarm };
}

// ---------------------------------------------------------------- the flooded basement (1 unit = 1 m)
export function buildBasement(o = V(60, -300, 0)) {
  const g = new THREE.Group();
  g.position.copy(o);
  scene.add(g);
  const r = rng(31);
  const conc = real.plastic(0x5d5e5a, { roughness: 0.95 });
  const L = 30;
  for (const [x, ry] of [
    [-1.6, Math.PI / 2],
    [1.6, -Math.PI / 2],
  ]) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(L, 2.8), conc);
    w.position.set(x, 1.4, -L / 2 + 2);
    w.rotation.y = ry;
    g.add(w);
  }
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(3.2, L), conc);
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(0, 2.8, -L / 2 + 2);
  g.add(ceil);
  const end = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.8), conc);
  end.position.set(0, 1.4, -L + 2);
  g.add(end);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(3.2, L), conc);
  fl.rotation.x = -Math.PI / 2;
  fl.position.set(0, 0, -L / 2 + 2);
  g.add(fl);
  // knee-deep dark water with a slow ripple
  const wgeo = new THREE.PlaneGeometry(3.2, L, 24, 120);
  wgeo.rotateX(-Math.PI / 2);
  const wp = wgeo.attributes.position;
  const wbase = Float32Array.from({ length: wp.count * 2 }, (_, i) =>
    i % 2 ? wp.getZ(i >> 1) : wp.getX(i >> 1),
  );
  const wm = new THREE.MeshPhysicalMaterial({
    color: 0x0a1a1c,
    roughness: 0.08,
    metalness: 0.1,
    transparent: true,
    opacity: 0.88,
  });
  const water = noAO(new THREE.Mesh(wgeo, wm));
  water.position.set(0, 0.55, -L / 2 + 2);
  g.add(water);
  onFrame((t) => {
    for (let i = 0; i < wp.count; i++) {
      const x = wbase[i * 2];
      const z = wbase[i * 2 + 1];
      wp.setY(i, Math.sin(x * 3 + t * 1.3) * 0.008 + Math.sin(z * 1.7 - t * 1.9) * 0.012);
    }
    wp.needsUpdate = true;
    wgeo.computeVertexNormals();
  });
  // pipes along both walls + valves with red hand wheels at the far end
  const pipeM = real.metal(0x7c8286, { roughness: 0.5 });
  for (const [x, y, rr] of [
    [-1.35, 2.3, 0.12],
    [-1.35, 1.9, 0.08],
    [1.35, 2.4, 0.14],
    [1.35, 1.2, 0.1],
  ]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(rr, rr, L, 12), pipeM);
    p.rotation.x = Math.PI / 2;
    p.position.set(x, y, -L / 2 + 2);
    g.add(p);
  }
  const valves = [];
  for (const [x, z] of [
    [-1.25, -22],
    [1.25, -24],
    [-1.25, -26],
  ]) {
    const v = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.4, 16), pipeM);
    body.rotation.z = Math.PI / 2;
    v.add(body);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 8), pipeM);
    stem.position.x = x > 0 ? -0.3 : 0.3;
    stem.rotation.z = Math.PI / 2;
    v.add(stem);
    const wheelG = new THREE.Group();
    const wheel = new THREE.Mesh(
      new THREE.TorusGeometry(0.2, 0.025, 10, 32),
      real.plastic(0xc0201a, { roughness: 0.4 }),
    );
    wheelG.add(wheel);
    for (let k = 0; k < 3; k++) {
      const sp = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.02), real.plastic(0xc0201a));
      sp.rotation.z = (k / 3) * Math.PI;
      wheelG.add(sp);
    }
    wheelG.rotation.y = Math.PI / 2;
    wheelG.position.x = x > 0 ? -0.5 : 0.5;
    v.add(wheelG);
    v.position.set(x, 1.3, z);
    g.add(v);
    valves.push({ v, wheel: wheelG });
  }
  // red glow seeping through cracks in the ceiling (the melt above)
  const crackMat = glowMat(0xff4a10, 0.9);
  for (let i = 0; i < 12; i++) {
    const c = noAO(new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.01, 1 + r() * 2), crackMat));
    c.position.set((r() - 0.5) * 2.4, 2.79, -4 - r() * 22);
    c.rotation.y = (r() - 0.5) * 1.2;
    g.add(c);
  }
  const glowL = new THREE.PointLight(0xff5a1a, 3, 10, 1.4);
  glowL.position.set(0, 2.5, -14);
  g.add(glowL);
  // three men in rubber suits with lamps
  const men = [];
  for (let i = 0; i < 3; i++) {
    const m = makePerson({ coat: 0x3d4a3a, legs: 0x2a3028, helmet: 0x2b2f36, scale: 10 });
    m.position.set((i - 1) * 0.7, 0, 1 - i * 0.8);
    m.rotation.y = Math.PI / 2;
    g.add(m);
    const lamp = new THREE.SpotLight(0xfff2d0, 30, 18, 0.35, 0.5, 1.4);
    lamp.position.set(0.25, 1.4, 0);
    const tgt = new THREE.Object3D();
    tgt.position.set(6, 0.9, 0);
    m.add(lamp, tgt);
    lamp.target = tgt;
    const cone = noAO(
      new THREE.Mesh(
        new THREE.ConeGeometry(0.9, 5, 24, 1, true),
        new THREE.MeshBasicMaterial({
          color: 0xfff0d0,
          transparent: true,
          opacity: 0.06,
          depthWrite: false,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
        }),
      ),
    );
    cone.rotation.z = Math.PI / 2;
    cone.position.set(2.8, 1.25, 0);
    m.add(cone);
    men.push(m);
  }
  const amb = new THREE.AmbientLight(0x30404a, 0.4);
  g.add(amb);
  shadowAll(g);
  water.castShadow = false;
  return { group: g, men, valves, water, L };
}

// ---------------------------------------------------------------- Bavarian forest in the rain (1 unit = 1 m)
export function buildForest(o = V(0, 300, 0)) {
  const g = new THREE.Group();
  g.position.copy(o);
  scene.add(g);
  const r = rng(44);
  // forest floor: moss, needles, small relief
  const geo = new THREE.PlaneGeometry(40, 40, 60, 60);
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++)
    p.setY(i, (noise2(p.getX(i) * 0.2, p.getZ(i) * 0.2, 3) - 0.5) * 0.5);
  geo.computeVertexNormals();
  const floor = new THREE.Mesh(
    patches(facet(geo, 0.06, 2), { amt: 0.18, scale: 0.2, seed: 2, warm: 0.6 }),
    facetMat(flat(0x4a5a2a)),
  );
  floor.receiveShadow = true;
  g.add(floor);
  const fh = (x, z) => (noise2(x * 0.2, z * 0.2, 3) - 0.5) * 0.5;
  // spruce trunks with layered dark crowns
  const bark = real.wood(0x4a3a2c, { roughness: 0.9 });
  const needle = flat(0x23361f);
  for (let i = 0; i < 60; i++) {
    const x = (r() - 0.5) * 38;
    const z = -2 - r() * 18;
    if (Math.abs(x) < 2.5 && z > -5) continue;
    const t = new THREE.Group();
    const h = 9 + r() * 6;
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.25, h, 10), bark);
    tr.position.y = h / 2;
    t.add(tr);
    for (let k = 0; k < 6; k++) {
      const cr = F(
        jitter(new THREE.ConeGeometry(1.6 - k * 0.2, 1.8, 8), 0.1, i * 9 + k),
        needle,
        0.1,
        i + k,
      );
      cr.position.y = h * 0.45 + k * 1.1;
      t.add(cr);
    }
    t.position.set(x, fh(x, z), z);
    shadowAll(t);
    g.add(t);
  }
  // ferns and blueberry bushes
  for (let i = 0; i < 70; i++) {
    const x = (r() - 0.5) * 30;
    const z = 4 - r() * 16;
    const f = F(
      jitter(new THREE.IcosahedronGeometry(0.25 + r() * 0.25, 0), 0.1, i),
      flat(i % 2 ? 0x4f7a2a : 0x3c6a2e),
      0.12,
      i,
    );
    f.position.set(x, fh(x, z) + 0.1, z);
    f.scale.y = 0.5;
    g.add(f);
  }
  // the deer truffle: dug out of the soil next to the boar
  const truffle = new THREE.Mesh(
    jitter(new THREE.IcosahedronGeometry(0.06, 2), 0.01, 3),
    real.plastic(0x8a6a3c, { roughness: 0.9 }),
  );
  truffle.position.set(0.9, fh(0.9, 0.6) + 0.05, 0.6);
  g.add(truffle);
  const hole = new THREE.Mesh(
    new THREE.CircleGeometry(0.35, 20),
    real.plastic(0x3a2a1c, { roughness: 1 }),
  );
  hole.rotation.x = -Math.PI / 2;
  hole.position.set(0.7, fh(0.7, 0.4) + 0.02, 0.4);
  g.add(hole);
  const boar = makeBoar(1);
  boar.position.set(-0.4, fh(-0.4, 0.3), 0.3);
  boar.rotation.y = -0.4;
  g.add(boar);
  // the sandbox at the forest edge (empty, toys left in the rain)
  const sand = new THREE.Group();
  for (const [x, z, w, d] of [
    [0, -1, 2.4, 0.12],
    [0, 1, 2.4, 0.12],
    [-1.2, 0, 0.12, 2.1],
    [1.2, 0, 0.12, 2.1],
  ]) {
    const b = new THREE.Mesh(roundedBox(w, 0.25, d, 0.03), real.wood(0xb08050));
    b.position.set(x, 0.12, z);
    sand.add(b);
  }
  const sf = new THREE.Mesh(
    new THREE.PlaneGeometry(2.3, 2),
    real.plastic(0xd8c08a, { roughness: 1 }),
  );
  sf.rotation.x = -Math.PI / 2;
  sf.position.y = 0.1;
  sand.add(sf);
  const bucket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.07, 0.15, 16),
    real.plastic(0xe0302a, { clearcoat: 0.6 }),
  );
  bucket.position.set(0.4, 0.17, 0.2);
  sand.add(bucket);
  const spade = new THREE.Mesh(roundedBox(0.05, 0.02, 0.3, 0.01), real.plastic(0x2a7ae0));
  spade.position.set(-0.3, 0.12, -0.2);
  spade.rotation.y = 0.6;
  sand.add(spade);
  shadowAll(sand);
  sand.position.set(8, fh(8, 3), 3);
  g.add(sand);
  // rain: falling streaks
  const NR = 900;
  const rain = noAO(
    new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.006, 0.35, 0.006),
      new THREE.MeshBasicMaterial({ color: 0xc8d4e0, transparent: true, opacity: 0.45 }),
      NR,
    ),
  );
  const rs = Array.from({ length: NR }, () => [(r() - 0.5) * 24, -2 - r() * 16, r()]);
  const d0 = new THREE.Object3D();
  g.add(rain);
  onFrame((t) => {
    rs.forEach(([x, z, ph], i) => {
      d0.position.set(x, 8 - ((ph + t * 1.1) % 1) * 9, z);
      d0.rotation.z = 0.08;
      d0.updateMatrix();
      rain.setMatrixAt(i, d0.matrix);
    });
    rain.instanceMatrix.needsUpdate = true;
  });
  const light = new THREE.DirectionalLight(0xcfd8e8, 3.2);
  light.position.set(-4, 12, 6);
  light.target.position.set(0, 0, 0);
  g.add(light, light.target);
  const fill = new THREE.HemisphereLight(0xb8c8d8, 0x2a3020, 2.4);
  g.add(fill);
  shadowAll(g);
  return { group: g, boar, truffle, sand, fh };
}

// ---------------------------------------------------------------- the blast (outdoor)
// Fireball, flash light, burning debris on ballistic paths and the upper lid
// flying up and falling back askew. update(t, tb) with tb = time since the
// first explosion (the second follows 2.2 s later).
export function makeBlast(plant) {
  const r = rng(5);
  const debris = [];
  const hot = new THREE.MeshStandardMaterial({
    color: 0x1c1a18,
    emissive: 0xff5a10,
    emissiveIntensity: 1.4,
    roughness: 0.9,
  });
  const conc = new THREE.MeshStandardMaterial({ color: 0xb8b4aa, roughness: 0.9 });
  for (let i = 0; i < 70; i++) {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(0.2 + r() * 0.3, 0.2 + r() * 0.3, 0.2 + r() * 0.3),
      i % 3 ? hot : conc,
    );
    const a = r() * Math.PI * 2;
    const sp = 3 + r() * 9;
    m.userData = {
      v: V(Math.cos(a) * sp, 10 + r() * 14, Math.sin(a) * sp),
      w: V(r() * 9, r() * 9, r() * 9),
      delay: r() < 0.4 ? 2.2 : 0,
    };
    m.visible = false;
    m.castShadow = true;
    ground.add(m);
    debris.push(m);
  }
  const fireball = noAO(
    new THREE.Mesh(
      new THREE.IcosahedronGeometry(1, 3),
      new THREE.MeshBasicMaterial({
        color: 0xff8a30,
        transparent: true,
        opacity: 0,
        toneMapped: false,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    ),
  );
  fireball.position.set(CORE.x, 7, CORE.z);
  ground.add(fireball);
  const flash = new THREE.PointLight(0xffa050, 0, 80, 1.2);
  flash.position.set(CORE.x, 9, CORE.z);
  ground.add(flash);
  const lidFly = plant.lid.clone();
  ground.add(lidFly);
  return (t, tb) => {
    fireball.visible = tb > 0 && tb < 3.5;
    if (fireball.visible) {
      const s = 1.5 + Math.sqrt(tb) * 4;
      fireball.scale.set(s, s * 1.3, s);
      fireball.material.opacity = Math.max(
        0,
        0.55 * Math.exp(-tb * 1.6) + (tb > 2.2 ? 0.4 * Math.exp(-(tb - 2.2) * 2.5) : 0),
      );
    }
    flash.intensity =
      tb > 0 && tb < 4
        ? 400 * (Math.exp(-tb * 2) + (tb > 2.2 ? Math.exp(-(tb - 2.2) * 2.5) : 0))
        : 0;
    for (const m of debris) {
      const tt = tb - m.userData.delay;
      m.visible = tt > 0 && tt < 4;
      if (!m.visible) continue;
      const { v, w } = m.userData;
      m.position.set(
        CORE.x + v.x * tt,
        Math.max(0.15, 7 + v.y * tt - 4.9 * tt * tt),
        CORE.z + v.z * tt,
      );
      m.rotation.set(w.x * tt, w.y * tt, w.z * tt);
    }
    lidFly.visible = tb > 2.2 && tb < 5.5;
    if (lidFly.visible) {
      const tt = tb - 2.2;
      const up = Math.min(tt, 1.3);
      const y = 4.9 + 9 * up - 4.9 * up * up * 0.9 - Math.max(0, tt - 1.3) * 3;
      lidFly.position.set(plant.lid.position.x, Math.max(4.9, y), plant.lid.position.z);
      lidFly.rotation.set(0.25, 0, Math.min(1.25, tt * 1.4));
      plant.lid.visible = false;
    } else plant.lid.visible = true;
  };
}

// a small car for the analogy (outdoor units): body + glowing engine heat
export function makeCar(color = 0xc8452a) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    roundedBox(0.44, 0.1, 0.19, 0.04),
    real.plastic(color, { roughness: 0.3, clearcoat: 0.8 }),
  );
  body.position.y = 0.09;
  g.add(body);
  const cab = new THREE.Mesh(
    roundedBox(0.22, 0.08, 0.17, 0.04),
    real.glass(0x1a2430, { roughness: 0.1 }),
  );
  cab.position.set(-0.03, 0.17, 0);
  g.add(cab);
  const heatMat = new THREE.MeshStandardMaterial({
    color: 0x2a1a14,
    emissive: 0xff4a10,
    emissiveIntensity: 0,
    roughness: 0.6,
  });
  const hood = new THREE.Mesh(roundedBox(0.12, 0.012, 0.17, 0.005), heatMat);
  hood.position.set(0.15, 0.142, 0);
  g.add(hood);
  const wheels = [];
  for (const x of [-0.14, 0.14])
    for (const z of [-0.09, 0.09]) {
      const w = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 0.03, 18),
        real.rubber(0x151515),
      );
      w.rotation.x = Math.PI / 2;
      w.position.set(x, 0.045, z);
      g.add(w);
      wheels.push(w);
    }
  for (const z of [-0.06, 0.06]) {
    const hl = noAO(new THREE.Mesh(new THREE.SphereGeometry(0.015, 10, 8), glowMat(0xfff2d0)));
    hl.position.set(0.22, 0.1, z);
    g.add(hl);
  }
  const beam = new THREE.SpotLight(0xfff0d0, 6, 8, 0.4, 0.6, 1.2);
  beam.position.set(0.22, 0.1, 0);
  const tgt = new THREE.Object3D();
  tgt.position.set(3, 0, 0);
  g.add(beam, tgt);
  beam.target = tgt;
  g.userData = { heatMat, wheels };
  shadowAll(g);
  return g;
}
