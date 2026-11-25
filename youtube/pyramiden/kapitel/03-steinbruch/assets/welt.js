// YouTube #5 "Pyramiden" — the video's world kit (copied into every chapter as
// assets/welt.js by new-chapter.sh / sync-kit.sh). No side effects on import:
// each chapter's set.js calls the builders for its places.
//
// Scale outdoors: 1 unit = 10 m (a person = 0.18). x = east, z = south.
// The Great Pyramid (G1) stands at the origin on the Giza plateau (y = 0).
// East of the plateau edge (edgeX(z)) the cliff drops to the Nile valley
// (y ≈ -4), which is a shallow lake during the flood (FLOOD_Y). The harbour
// basin lies at the foot of the cliff (HARBOUR), the quarry south of the
// pyramid (QUARRY), the workers' town south-east on the low desert (TOWN),
// the workers' cemetery on the slope above it (CEMETERY).
//
//   buildGiza({ time, state })   main world
//        time:  "tag" | "abend" | "nacht" | "heute"
//        state: "bau" (construction, flood) | "leer" (empty plateau, levelling)
//               | "fertig" (white casing, flood) | "heute" (ruin, G2 + G3, fields)
//        returns { mood(name, k), g1, ramps, boats, people, ... }
//   buildEarly()                 side world: Djoser's step pyramid, the Bent
//                                and the Red Pyramid in the desert (chapter 1)
//   buildPapyrus(o, {museum})    the logbook: cave floor at Wadi al-Jarf / a
//                                museum case in Cairo
//   buildChamber(o)              a relieving chamber with the gang's red marks
// Things: makePyramid(), makeBoat(), makeSledge(), makePerson(), walk(),
// makeStars(), makeSmoke().
import {
  THREE,
  V,
  flat,
  ground,
  scene,
  renderer,
  onFrame,
  facet,
  facetMat,
  rng,
  real,
  roundedBox,
  noise2,
  xrayMaterial,
} from "./world.js";
import { setSky, finishSet, terrain } from "./environments.js";
import { palm } from "./props.js";

renderer.localClippingEnabled = true;

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
const lerp = (a, b, k) => a + (b - a) * k;
const sm = (x) => {
  x = clamp01(x);
  return x * x * (3 - 2 * x);
};
const C = (c) => new THREE.Color(c);
export function widenShadow(r = 30, far = 140, center = null) {
  scene.traverse((o) => {
    if (o.isDirectionalLight && o.castShadow) {
      Object.assign(o.shadow.camera, { left: -r, right: r, top: r, bottom: -r, far });
      o.shadow.camera.updateProjectionMatrix();
      if (center) {
        const d = o.position.clone().sub(o.target.position);
        o.target.position.copy(center);
        o.position.copy(center).add(d);
        o.target.updateMatrixWorld();
      }
    }
  });
}

// ---------------------------------------------------------------- geography
export const G1 = { half: 11.5, h: 14.66 }; // 230 m base, 146.6 m high
export const FLOOD_Y = -3.55;
export const VALLEY_Y = -4.1;
export const edgeX = (z) => 21 - z * 0.22 + Math.sin(z * 0.13) * 1.6;
export const HARBOUR = { x0: 25, x1: 36, z0: 6, z1: 18 };
export const QUARRY = { x0: -6, x1: 12, z0: 22, z1: 34, d: 2.4 };
export const TOWN = V(24, 0, 46);
export const CEMETERY = V(10, 0, 50);
export const G2 = V(-31, 0.6, 31); // Khafre (later, "heute" only)
export const G3 = V(-52, 1.1, 64); // Menkaure
export const RAMP_FOOT = V(1.5, 0, 22); // where the construction ramp starts

export function heightAt(x, z) {
  const e = edgeX(z);
  // the plateau rises gently to the west, with low rocky swells
  let h = Math.max(0, -x - 14) * 0.035 + (noise2(x * 0.04, z * 0.04, 5) - 0.5) * 0.9;
  h *= clamp01((Math.hypot(x, z) - 26) / 14); // flat building ground at G1
  // the quarry pit south of the pyramid
  if (x > QUARRY.x0 && x < QUARRY.x1 && z > QUARRY.z0 && z < QUARRY.z1) {
    const ix = Math.min(x - QUARRY.x0, QUARRY.x1 - x);
    const iz = Math.min(z - QUARRY.z0, QUARRY.z1 - z);
    const i = Math.min(ix, iz);
    h -= Math.min(QUARRY.d, Math.floor(i / 0.9) * 0.6 + (i > 0.3 ? 0.4 : 0));
  }
  // the cliff down to the valley
  const s = x - e;
  if (s > 0) {
    const k = sm(s / 5.5);
    h = lerp(h, VALLEY_Y + (noise2(x * 0.07, z * 0.07, 9) - 0.5) * 0.25, k);
    // the low desert of the workers' town (a terrace above the flood)
    const dt = Math.hypot((x - TOWN.x) / 14, (z - TOWN.z) / 10);
    if (dt < 1.2) h = Math.max(h, lerp(-3.1, h, sm((dt - 0.8) / 0.4)));
    // the harbour basin
    if (x > HARBOUR.x0 && x < HARBOUR.x1 && z > HARBOUR.z0 && z < HARBOUR.z1)
      h = Math.min(h, VALLEY_Y - 0.6);
    // village mounds in the valley
    for (const [vx, vz, vr] of VILLAGES) {
      const dv = Math.hypot(x - vx, z - vz) / vr;
      if (dv < 1) h = Math.max(h, FLOOD_Y + 0.45 * Math.cos(dv * Math.PI * 0.5));
    }
  }
  return h;
}
export const VILLAGES = [
  [52, -22, 4.5],
  [66, 14, 5.5],
  [48, 34, 3.5],
  [84, -6, 6],
  [74, 44, 4],
  [44, -48, 4],
];

// ---------------------------------------------------------------- light
export const SKY = {
  tag: {
    top: [0.26, 0.48, 0.82],
    mid: [0.58, 0.72, 0.9],
    hor: [0.98, 0.88, 0.72],
    below: [0.9, 0.82, 0.68],
    sun: [1.0, 0.9, 0.7],
    sunDir: [0.55, 0.42, 0.72],
    cloud: [0xfff6ea, 0xf2d8bc],
    clouds: 5,
    hemi: [0xfff1dc, 0x8a6a44, 1.35],
    key: [0xffe6c4, 3.1],
    keyPos: [8, 10, 9],
    rim: [0xbcd4ff, 0.5],
    fog: [80, 330],
  },
  abend: {
    top: [0.22, 0.3, 0.58],
    mid: [0.7, 0.55, 0.55],
    hor: [1.0, 0.64, 0.34],
    below: [0.86, 0.6, 0.42],
    sun: [1.0, 0.7, 0.36],
    sunDir: [-0.85, 0.1, 0.2],
    cloud: [0xffd2a8, 0xd9805a],
    clouds: 6,
    hemi: [0xffd8b0, 0x6a4430, 1.2],
    key: [0xffb070, 2.8],
    keyPos: [-12, 4.5, 3],
    rim: [0x8aa8ff, 0.5],
    fog: [70, 300],
  },
  nacht: {
    top: [0.012, 0.02, 0.06],
    mid: [0.03, 0.05, 0.11],
    hor: [0.1, 0.12, 0.2],
    below: [0.05, 0.05, 0.08],
    sun: [0.25, 0.3, 0.45],
    sunDir: [0.3, 0.5, -0.8],
    cloud: [0x303848, 0x101420],
    noClouds: true,
    birds: false,
    stars: 0.9,
    hemi: [0x6878a8, 0x1a1a22, 0.9],
    key: [0xa8b8e8, 0.7],
    env: 0.12,
    keyPos: [-4, 10, -8],
    rim: [0x6a80c0, 0.5],
    fog: [90, 320],
  },
  heute: {
    top: [0.3, 0.5, 0.82],
    mid: [0.66, 0.74, 0.86],
    hor: [0.96, 0.86, 0.72],
    below: [0.88, 0.8, 0.68],
    sun: [1.0, 0.92, 0.76],
    sunDir: [0.5, 0.36, 0.78],
    cloud: [0xffffff, 0xeae4da],
    clouds: 4,
    hemi: [0xfff3e2, 0x84704e, 1.4],
    key: [0xfff0d8, 3.0],
    keyPos: [8, 10, 9],
    rim: [0xc4d8ff, 0.5],
    fog: [70, 300],
  },
};

// grab the lights / sky / fog setSky() just made, for mood() blending
function captureSky(sky, before) {
  const lights = { hemi: null, key: null, rim: null };
  const dirs = [];
  let skyMesh = null;
  for (const o of scene.children) {
    if (o.isHemisphereLight) lights.hemi = o;
    if (o.isDirectionalLight) dirs.push(o);
    if (o.isMesh && o.material && o.material.uniforms && o.material.uniforms.hor) skyMesh = o;
  }
  lights.key = dirs.find((d) => d.castShadow) ?? dirs[0];
  lights.rim = dirs.find((d) => !d.castShadow) ?? null;
  const extras = scene.children.filter((o) => o.isGroup && o !== ground && !before.has(o));
  return { lights, skyMesh, base: sky, extras };
}
// blend the whole scene's light from the base palette towards another one
function makeMood(cap) {
  const L = cap.lights;
  const U0 = cap.skyMesh.material.uniforms;
  const base = {
    hemiI: L.hemi.intensity,
    keyI: L.key.intensity,
    rimI: L.rim ? L.rim.intensity : 0,
    hemiC: L.hemi.color.clone(),
    hemiG: L.hemi.groundColor.clone(),
    keyC: L.key.color.clone(),
    keyP: L.key.position.clone(),
    rimC: L.rim ? L.rim.color.clone() : C(0),
    fogC: scene.fog.color.clone(),
    fogN: scene.fog.near,
    fogF: scene.fog.far,
    env: scene.environmentIntensity ?? 1,
    stars: U0.stars.value,
    sunDir: U0.sunDir.value.clone(),
    u: Object.fromEntries(
      ["top", "mid", "hor", "below", "sunCol"].map((k) => [k, U0[k].value.clone()]),
    ),
  };
  const ratio = (a, b) => (a > 0 ? b / a : 1);
  return (name, k) => {
    k = clamp01(k);
    const s = SKY[name];
    const b = cap.base;
    L.hemi.intensity = lerp(base.hemiI, (s.hemi[2] / b.hemi[2]) * base.hemiI, k);
    L.hemi.color.copy(base.hemiC).lerp(C(s.hemi[0]), k);
    L.hemi.groundColor.copy(base.hemiG).lerp(C(s.hemi[1]), k);
    L.key.intensity = lerp(base.keyI, base.keyI * ratio(b.key[1], s.key[1]), k);
    L.key.color.copy(base.keyC).lerp(C(s.key[0]), k);
    if (L.rim) {
      L.rim.intensity = lerp(base.rimI, base.rimI * ratio(b.rim[1], s.rim[1]), k);
      L.rim.color.copy(base.rimC).lerp(C(s.rim[0]), k);
    }
    const fc = new THREE.Color().setRGB(...s.below, THREE.SRGBColorSpace);
    scene.fog.color.copy(base.fogC).lerp(fc, k);
    const [fn, ff] = s.fog ?? [30, 95];
    scene.fog.near = lerp(base.fogN, fn, k);
    scene.fog.far = lerp(base.fogF, ff, k);
    const bright = s.env ?? (s.hemi[2] * 0.5 + s.key[1] * 0.2) / (b.hemi[2] * 0.5 + b.key[1] * 0.2);
    scene.environmentIntensity = base.env * lerp(1, bright, k);
    const hide = (s.noClouds || s.birds === false) && k > 0.5;
    for (const o of cap.extras) o.visible = !hide;
    const U = cap.skyMesh.material.uniforms;
    U.top.value.copy(base.u.top).lerp(V(...s.top), k);
    U.mid.value.copy(base.u.mid).lerp(V(...s.mid), k);
    U.hor.value.copy(base.u.hor).lerp(V(...s.hor), k);
    U.below.value.copy(base.u.below).lerp(V(...s.below), k);
    U.sunCol.value.copy(base.u.sunCol).lerp(V(...s.sun), k);
    U.stars.value = lerp(base.stars, s.stars ?? 0, k);
    U.sunDir.value
      .copy(base.sunDir)
      .lerp(V(...s.sunDir).normalize(), k)
      .normalize();
  };
}

// ---------------------------------------------------------------- textures
function canvasTex(w, h, draw, { repeat = true } = {}) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}
// one row of limestone blocks: u = along the course (4 blocks per repeat),
// v = the course height. Warm core stone with darker joints.
function blockTex({ base = "#dcc69c", joint = "#b49a70", n = 4, seed = 3, rough = 1 } = {}) {
  const r = rng(seed);
  return canvasTex(512, 128, (g, w, h) => {
    g.fillStyle = base;
    g.fillRect(0, 0, w, h);
    const bw = w / n;
    for (let i = 0; i < n; i++) {
      const l = 0.93 + r() * 0.12;
      g.fillStyle = `rgba(${l > 1 ? 255 : 0},${l > 1 ? 240 : 0},${l > 1 ? 210 : 0},${Math.abs(l - 1) * 0.9})`;
      g.fillRect(i * bw, 0, bw, h);
      // pits and stains
      for (let k = 0; k < 40 * rough; k++) {
        g.fillStyle = `rgba(70,50,30,${0.05 + r() * 0.1})`;
        g.beginPath();
        g.arc(i * bw + r() * bw, r() * h, 0.6 + r() * 2.6 * rough, 0, Math.PI * 2);
        g.fill();
      }
      g.fillStyle = joint;
      g.fillRect(i * bw, 0, 2 + r() * 2, h);
    }
    g.fillStyle = joint;
    g.fillRect(0, h - 4, w, 4);
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, "rgba(255,245,220,0.18)");
    grd.addColorStop(1, "rgba(60,40,20,0.2)");
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
  });
}
function plainTex(base, dots, seed = 4, alpha = 0.12) {
  const r = rng(seed);
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = base;
    g.fillRect(0, 0, w, h);
    for (let k = 0; k < 900; k++) {
      g.fillStyle = dots[k % dots.length].replace("A", String(r() * alpha));
      g.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 3);
    }
  });
}
function brickTex(seed = 6) {
  const r = rng(seed);
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = "#8a6a4c";
    g.fillRect(0, 0, w, h);
    const bh = 16;
    const bw = 40;
    for (let y = 0; y < h; y += bh)
      for (let x = -((y / bh) % 2) * (bw / 2); x < w; x += bw) {
        const l = 0.85 + r() * 0.25;
        g.fillStyle = `rgb(${154 * l},${118 * l},${84 * l})`;
        g.fillRect(x + 1.5, y + 1.5, bw - 3, bh - 3);
      }
  });
}

// ---------------------------------------------------------------- people
export function makePerson({
  coat = 0xf1ece0,
  skin = 0x9a6a46,
  hair = 0x1c1612,
  scale = 1,
  shirt = false,
  cap = null,
} = {}) {
  const g = new THREE.Group();
  // kilt (short white linen) + bare torso, or a long dress for officials
  const kilt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, shirt ? 0.036 : 0.032, shirt ? 0.1 : 0.05, 16),
    real.fabric(coat),
  );
  kilt.position.y = shirt ? 0.09 : 0.075;
  g.add(kilt);
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.026, 16, 12), real.skin(skin));
  chest.scale.set(1, 1.15, 0.8);
  chest.position.y = 0.128;
  if (shirt) chest.material = real.fabric(coat);
  g.add(chest);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.018, 20, 14), real.skin(skin));
  head.position.y = 0.17;
  g.add(head);
  const hr = new THREE.Mesh(
    new THREE.SphereGeometry(0.019, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
    real.fabric(cap ?? hair),
  );
  hr.position.y = 0.173;
  hr.rotation.x = -0.2;
  g.add(hr);
  for (const s of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.009, 0.05, 4, 10), real.skin(skin));
    leg.position.set(0, 0.03, s * 0.012);
    leg.name = s < 0 ? "legL" : "legR";
    g.add(leg);
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.0075, 0.055, 4, 10), real.skin(skin));
    arm.position.set(0, 0.11, s * 0.032);
    arm.name = s < 0 ? "armL" : "armR";
    g.add(arm);
  }
  g.scale.setScalar(scale);
  shadowAll(g);
  return g;
}
export function walk(p, ph, amt = 1) {
  const s = Math.sin(ph * Math.PI);
  for (const o of p.children) {
    if (o.name === "legL") o.rotation.z = s * 0.45 * amt;
    if (o.name === "legR") o.rotation.z = -s * 0.45 * amt;
    if (o.name === "armL") o.rotation.z = -s * 0.35 * amt;
    if (o.name === "armR") o.rotation.z = s * 0.35 * amt;
  }
}
// leaning into a rope: body tilted forward, arms reaching ahead
export function pull(p, ph, amt = 1) {
  walk(p, ph, 0.6 * amt);
  p.rotation.z = 0.35 * amt;
  for (const o of p.children)
    if (o.name === "armL" || o.name === "armR") o.rotation.z = -1.35 * amt;
}
const SKINS = [0x8f6040, 0x9a6a46, 0x7a5236, 0xa8774f];
export const randomPerson = (r, o = {}) =>
  makePerson({ skin: SKINS[Math.floor(r() * SKINS.length)], ...o });

// ---------------------------------------------------------------- pyramid
// A stepped core of courses (the real thing has ~210; here N courses of
// h/N each) + a smooth white casing clipped at a height + an optional
// capstone. Built at the origin of its group, base on y = 0.
//   p.build(k)     courses up to k·h visible (0..1)
//   p.casing(k)    casing from the bottom up to k·h (0..1)
//   p.weather(on)  today's look: rough, the top courses gone
//   p.mats         [core, casing] materials (x-ray)
export function makePyramid({
  half = G1.half,
  h = G1.h,
  n = 96,
  seed = 1,
  core = "#dcc69c",
  casingColor = 0xefe8da,
  bent = null, // { yb, lower, upper }: steep (lower = run/rise) up to yb, then flatter
  steps = 0, // >0: a step pyramid with that many big steps
  cap = true,
} = {}) {
  const g = new THREE.Group();
  const r = rng(seed);
  const tex = blockTex({ base: core, seed });
  const coreMat = xrayMaterial(0xffffff, { roughness: 0.92, metalness: 0, map: tex });
  coreMat.userData.base = C(0xffffff);
  const courses = [];
  // half-width at height y (bent: steeper below, flatter above)
  const sb = bent ? half - bent.yb * bent.lower : 0;
  if (bent) h = bent.yb + sb / bent.upper;
  const sAt = (y) => {
    if (bent) {
      if (y <= bent.yb) return half - y * bent.lower;
      return Math.max(0, sb - (y - bent.yb) * bent.upper);
    }
    return half * (1 - y / h);
  };
  if (steps) {
    const sh = h / steps;
    for (let i = 0; i < steps; i++) {
      const w = 2 * half * (1 - i / steps) * 0.92 + 0.6;
      const geo = new THREE.BoxGeometry(w * 1.25, sh, w * 0.95);
      scaleUV(geo, w * 1.25, sh, w * 0.95, 0.6, sh / 6);
      const m = new THREE.Mesh(geo, coreMat);
      m.position.y = sh * (i + 0.5);
      m.castShadow = m.receiveShadow = true;
      g.add(m);
      courses.push(m);
    }
  } else {
    const ch = h / n;
    for (let i = 0; i < n; i++) {
      const y = ch * (i + 0.5);
      const w = Math.max(0.12, 2 * sAt(ch * (i + 1)) - 0.02);
      const geo = new THREE.BoxGeometry(w, ch * 1.001, w);
      scaleUV(geo, w, ch, w, 0.16, ch, r() * 4);
      const m = new THREE.Mesh(geo, coreMat);
      m.position.y = y;
      m.castShadow = m.receiveShadow = true;
      g.add(m);
      courses.push(m);
    }
  }
  // casing: one smooth pyramid, clipped from above
  const clip = new THREE.Plane(V(0, -1, 0), h);
  const casingMat = xrayMaterial(casingColor, {
    roughness: 0.6,
    metalness: 0,
    clippingPlanes: [clip],
    side: THREE.DoubleSide,
    map: plainTex("#f3eee2", ["rgba(120,100,70,A)", "rgba(255,255,255,A)"], seed + 7, 0.14),
  });
  let casing = null;
  if (!steps) {
    if (bent) {
      const yb = bent.yb;
      const pts = [
        [half, 0],
        [sAt(yb), yb],
        [0.001, h],
      ];
      const lathe = new THREE.LatheGeometry(
        pts.map(([x, y]) => new THREE.Vector2(x * Math.SQRT2, y)),
        4,
        Math.PI / 4,
      );
      casing = new THREE.Mesh(lathe, casingMat);
    } else {
      const cg = new THREE.ConeGeometry(half * Math.SQRT2 * 1.004, h * 1.004, 4, 1, true);
      cg.rotateY(Math.PI / 4);
      cg.translate(0, (h * 1.004) / 2, 0);
      casing = new THREE.Mesh(cg, casingMat);
    }
    casing.castShadow = casing.receiveShadow = true;
    g.add(casing);
  }
  let capstone = null;
  if (cap && !steps) {
    const cg = new THREE.ConeGeometry(0.42 * Math.SQRT2, 0.55, 4);
    cg.rotateY(Math.PI / 4);
    capstone = new THREE.Mesh(cg, real.plastic(0xf6f0e2, { roughness: 0.3, clearcoat: 0.4 }));
    capstone.castShadow = true;
    g.add(capstone);
  }
  const out = {
    group: g,
    courses,
    casingMesh: casing,
    capstone,
    mats: [coreMat, casingMat],
    h,
    half,
    sAt,
  };
  out.build = (k) => {
    const top = k * h;
    for (const c of courses) c.visible = c.position.y < top;
    if (capstone) {
      capstone.visible = k >= 0.999;
      capstone.position.y = h - 0.27;
    }
    if (casing) casing.visible = top > 0.001;
  };
  out.casing = (k) => {
    clip.constant = k * h * 1.004;
    if (casing) casing.visible = k > 0.001;
  };
  out.weather = (on) => {
    if (!on) return;
    tex.dispose();
    coreMat.map = blockTex({ base: "#cfb282", joint: "#8e7450", seed: seed + 11, rough: 2 });
    coreMat.needsUpdate = true;
    const cut = h * 0.955;
    for (const c of courses) {
      if (c.position.y > cut) c.visible = false;
      // eroded, uneven steps
      const e = 1 - r() * 0.012;
      c.scale.set(e, 1, 1 - r() * 0.012);
    }
    if (capstone) capstone.visible = false;
    if (casing) casing.visible = false;
  };
  out.build(1);
  out.casing(0);
  return out;
}
// box UVs in world units: u along the face / blockLen, v = 1 per course
function scaleUV(geo, w, h, d, blockLen, ch, off = 0) {
  const uv = geo.attributes.uv;
  const nrm = geo.attributes.normal;
  for (let i = 0; i < uv.count; i++) {
    const ny = Math.abs(nrm.getY(i));
    const nx = Math.abs(nrm.getX(i));
    if (ny > 0.5)
      uv.setXY(i, uv.getX(i) * (w / blockLen) * 0.25, uv.getY(i) * (d / blockLen) * 0.25);
    else {
      const len = nx > 0.5 ? d : w;
      uv.setXY(i, uv.getX(i) * (len / blockLen) * 0.25 + off, uv.getY(i) * (h / ch));
    }
  }
}

// ---------------------------------------------------------------- interior
// The passages and chambers of G1 (local coords of the pyramid), for x-ray
// shots: descending passage, ascending passage, Grand Gallery, Queen's and
// King's chamber, relieving chambers, the 2017 void.
export function makeInterior() {
  const g = new THREE.Group();
  const glow = (c, o = 0.95) =>
    noAO(
      new THREE.Mesh(
        new THREE.BufferGeometry(),
        new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, toneMapped: false }),
      ),
    );
  const tube = (a, b, w, hgt, color) => {
    const m = glow(color);
    const len = a.distanceTo(b);
    m.geometry = new THREE.BoxGeometry(w, hgt, len);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.lookAt(b);
    g.add(m);
    return m;
  };
  const A = 0x7fe0ff;
  const parts = {};
  parts.desc = tube(V(0, 1.7, -10.0), V(0, -3.0, 0.4), 0.12, 0.13, A);
  parts.sub = tube(V(0, -3.0, 0.4), V(0, -3.0, 1.4), 0.6, 0.3, A);
  parts.asc = tube(V(0, 0.62, -7.0), V(0, 2.15, -3.9), 0.12, 0.13, A);
  parts.horiz = tube(V(0, 2.15, -3.9), V(0, 2.15, -0.3), 0.12, 0.13, A);
  parts.queen = tube(V(0, 2.4, -0.3), V(0, 2.4, 0.3), 0.57, 0.5, A);
  // the Grand Gallery: tall and narrow
  parts.gallery = tube(V(0, 2.55, -3.9), V(0, 4.6, 0.3), 0.2, 0.86, 0xffe08a);
  // King's chamber (10.5 × 5.2 m, 5.8 m high), red granite
  const kc = glow(0xff9a6a, 1);
  kc.geometry = new THREE.BoxGeometry(1.05, 0.58, 0.52);
  kc.position.set(0, 4.6, 0.9);
  g.add(kc);
  parts.king = kc;
  // the relieving chambers above it + the gabled roof
  parts.relief = [];
  for (let i = 0; i < 5; i++) {
    const m = glow(0xffc49a, 0.85);
    m.geometry = new THREE.BoxGeometry(1.05, 0.12, 0.52);
    m.position.set(0, 5.05 + i * 0.3, 0.9);
    g.add(m);
    parts.relief.push(m);
  }
  const roof = glow(0xffc49a, 0.85);
  roof.geometry = new THREE.ConeGeometry(0.4, 0.4, 4, 1);
  roof.geometry.rotateY(Math.PI / 4);
  roof.scale.set(1.55, 1, 0.8);
  roof.position.set(0, 6.6, 0.9);
  g.add(roof);
  parts.relief.push(roof);
  // the big void found in 2017 (above the gallery, shape unknown)
  const vd = glow(0xd6a8ff, 0.55);
  vd.geometry = new THREE.CapsuleGeometry(0.22, 2.8, 6, 12);
  vd.geometry.rotateX(Math.PI / 2);
  vd.position.set(0, 4.8, -1.75);
  vd.rotation.x = -0.45;
  g.add(vd);
  parts.void = vd;
  g.userData.parts = parts;
  return g;
}

// ---------------------------------------------------------------- ramps
// Three ideas for getting the blocks up (chapter 5): a straight ramp from
// the quarry, a ramp spiralling around the faces, a ramp inside. Each is a
// group with .userData.grow(k) (0..1 built) and fits a pyramid built to hTop.
export function makeRamps(P, { hTop = P.h * 0.78 } = {}) {
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.97,
    map: plainTex("#cbb088", ["rgba(80,60,40,A)", "rgba(240,220,190,A)"], 21, 0.22),
  });
  const out = {};
  // straight: from the south up to hTop
  {
    const g = new THREE.Group();
    const len = 30;
    const z0 = P.half + len * 0.62;
    const segs = 26;
    const pieces = [];
    for (let i = 0; i < segs; i++) {
      const a = (i + 0.5) / segs;
      const z = z0 - len * a;
      const y = hTop * clamp01((z0 - z) / (z0 - P.sAt(hTop)));
      if (z < P.sAt(y) - 0.2) continue;
      const hh = y + 3.2;
      const geo = new THREE.BoxGeometry(2.0 + y * 0.22, hh, len / segs + 0.03);
      geo.translate(0, hh / 2 - 3.2, 0);
      const m = new THREE.Mesh(geo, mat);
      m.position.set(0, 0, z);
      m.castShadow = m.receiveShadow = true;
      pieces.push({ m, a });
      g.add(m);
    }
    g.userData = { z0, zTop: P.sAt(hTop), hTop };
    g.userData.grow = (k) => {
      for (const p of pieces) p.m.visible = p.a <= k + 0.001;
    };
    out.gerade = g;
  }
  // spiral: hugging the faces, one sloped run per face, rising
  // counter-clockwise (south face first, east → west)
  {
    const g = new THREE.Group();
    const w = 0.75;
    const slope = 0.12;
    const pieces = [];
    const pts = [];
    let y = 0;
    let face = 0;
    let i = 0;
    while (y < hTop - 0.05 && i < 40) {
      const s = P.sAt(y) + w * 0.5;
      let L = 2 * s;
      let y1 = y + L * slope;
      if (y1 > hTop) {
        L = (hTop - y) / slope;
        y1 = hTop;
      }
      // local frame of this face: start at u = -s, run towards +u
      const dir = [V(-1, 0, 0), V(0, 0, -1), V(1, 0, 0), V(0, 0, 1)][face];
      const nrm = [V(0, 0, 1), V(-1, 0, 0), V(0, 0, -1), V(1, 0, 0)][face];
      const start = nrm.clone().multiplyScalar(s).add(dir.clone().multiplyScalar(-s));
      start.y = y;
      const end = start.clone().add(dir.clone().multiplyScalar(L));
      end.y = y1;
      const thick = 1.5;
      const geo = new THREE.BoxGeometry(L + w * 0.3, thick, w);
      geo.translate(0, -thick / 2 + 0.06, 0);
      const m = new THREE.Mesh(geo, mat);
      m.position.copy(start).add(end).multiplyScalar(0.5);
      m.rotation.y = -face * (Math.PI / 2);
      m.rotateZ(-Math.atan(slope));
      m.castShadow = m.receiveShadow = true;
      g.add(m);
      pieces.push({ m, a: i });
      for (let k = 0; k <= 12; k++) {
        const pos = start.clone().lerp(end, k / 12);
        pts.push({ pos, face });
      }
      y = y1;
      face = (face + 1) % 4;
      i++;
    }
    const n = pieces.length;
    g.userData.grow = (k) => {
      for (const p of pieces) {
        const u = clamp01(k * n - p.a);
        p.m.visible = u > 0.001;
        p.m.scale.x = Math.max(0.001, u);
      }
    };
    g.userData.path = pts;
    out.spirale = g;
  }
  // inside: a glowing tunnel spiralling inside the core (Houdin's idea)
  {
    const g = new THREE.Group();
    const pts = [];
    const inset = 1.5;
    let y = P.h * 0.3;
    let face = 0;
    let along = 0;
    while (y < hTop && pts.length < 3000) {
      const s = Math.max(0.5, P.sAt(y) - inset);
      if (along > 2 * s) {
        along -= 2 * s;
        face = (face + 1) % 4;
      }
      const u = along - s;
      pts.push([V(-u, y, s), V(-s, y, -u), V(u, y, -s), V(s, y, u)][face]);
      along += 0.25;
      y += 0.25 * 0.08;
    }
    const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.05);
    const segs = pts.length * 2;
    const geo = new THREE.TubeGeometry(curve, segs, 0.14, 6);
    const m = noAO(
      new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xffd27a, toneMapped: false })),
    );
    g.add(m);
    g.userData.grow = (k) => geo.setDrawRange(0, Math.ceil(k * segs) * 6 * 6);
    out.innen = g;
  }
  return out;
}

// ---------------------------------------------------------------- boats
// A Nile cargo boat: long wooden hull with raised ends, a cabin, a tall
// bipod mast with a narrow sail, two steering oars, a cargo of blocks.
export function makeBoat({ cargo = "kalk", sail = true, crew = 6, seed = 2, scale = 1 } = {}) {
  const g = new THREE.Group();
  const r = rng(seed);
  const wood = real.wood(0x8a5a32, { roughness: 0.75 });
  const len = 3.2;
  // hull: lathe-like shape via an extruded profile, scaled in width
  const s = new THREE.Shape();
  s.moveTo(-len / 2 - 0.25, 0.42);
  s.quadraticCurveTo(-len / 2, 0.02, -len / 2 + 0.6, -0.06);
  s.lineTo(len / 2 - 0.6, -0.06);
  s.quadraticCurveTo(len / 2, 0.02, len / 2 + 0.3, 0.5);
  s.lineTo(len / 2 + 0.22, 0.52);
  s.quadraticCurveTo(len / 2 - 0.1, 0.18, len / 2 - 0.7, 0.18);
  s.lineTo(-len / 2 + 0.7, 0.18);
  s.quadraticCurveTo(-len / 2 + 0.1, 0.16, -len / 2 - 0.18, 0.44);
  s.closePath();
  const hg = new THREE.ExtrudeGeometry(s, {
    depth: 0.56,
    bevelEnabled: true,
    bevelSize: 0.08,
    bevelThickness: 0.1,
    bevelSegments: 3,
    curveSegments: 14,
  });
  hg.translate(0, 0, -0.28);
  const hull = new THREE.Mesh(hg, wood);
  g.add(hull);
  const deck = new THREE.Mesh(roundedBox(len - 0.9, 0.05, 0.62, 0.02), real.wood(0xb88a5a));
  deck.position.y = 0.19;
  g.add(deck);
  // a small reed cabin at the stern
  const cab = new THREE.Mesh(roundedBox(0.42, 0.24, 0.42, 0.04), real.fabric(0xc8a868));
  cab.position.set(len / 2 - 0.75, 0.33, 0);
  g.add(cab);
  // steering oars
  for (const sd of [-1, 1]) {
    const o = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 1.1, 6), wood);
    o.position.set(len / 2 - 0.15, 0.25, sd * 0.3);
    o.rotation.z = -0.95;
    o.rotation.x = sd * 0.25;
    g.add(o);
  }
  // bipod mast + sail
  const mastMat = real.wood(0x6a4428);
  for (const sd of [-1, 1]) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.026, 1.9, 8), mastMat);
    m.position.set(-0.55, 1.12, sd * 0.13);
    m.rotation.x = -sd * 0.07;
    g.add(m);
  }
  if (sail) {
    const sg = new THREE.PlaneGeometry(0.9, 1.35, 6, 6);
    const sp = sg.attributes.position;
    for (let i = 0; i < sp.count; i++)
      sp.setZ(i, -0.09 * (1 - Math.pow(sp.getX(i) / 0.45, 2)) * (0.6 + 0.4 * (sp.getY(i) + 0.7)));
    sg.computeVertexNormals();
    const sm_ = new THREE.Mesh(sg, real.fabric(0xeee4cc, { side: THREE.DoubleSide }));
    sm_.rotation.y = Math.PI / 2;
    sm_.position.set(-0.48, 1.22, 0);
    g.add(sm_);
    g.userData.sail = sm_;
    for (const yy of [0.55, 1.9]) {
      const yard = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.0, 6), mastMat);
      yard.rotation.x = Math.PI / 2;
      yard.position.set(-0.5, yy, 0);
      g.add(yard);
    }
  }
  // cargo
  const cargoMat =
    cargo === "granit"
      ? real.plastic(0xb0584a, { roughness: 0.55, clearcoat: 0.15 })
      : real.plastic(0xf0e8d8, { roughness: 0.72, clearcoat: 0 });
  if (cargo === "granit") {
    const b = new THREE.Mesh(roundedBox(1.6, 0.22, 0.26, 0.03), cargoMat);
    b.position.set(-0.1, 0.33, 0);
    g.add(b);
  } else if (cargo) {
    for (let i = 0; i < 6; i++) {
      const b = new THREE.Mesh(roundedBox(0.2 + r() * 0.05, 0.13, 0.17, 0.015), cargoMat);
      b.position.set(
        -0.05 + (i % 3) * 0.27 - 0.27,
        0.28 + Math.floor(i / 3) * 0.135,
        (r() - 0.5) * 0.08 + (i % 2 ? 0.11 : -0.11) * 0.5,
      );
      b.rotation.y = (r() - 0.5) * 0.1;
      g.add(b);
    }
  }
  // crew
  const people = [];
  for (let i = 0; i < crew; i++) {
    const p = randomPerson(r, { scale: 1 / scale });
    p.position.set(-1.0 + r() * 2.0, 0.21, (r() - 0.5) * 0.4);
    p.rotation.y = r() * 6.28;
    g.add(p);
    people.push(p);
  }
  g.userData.people = people;
  g.scale.setScalar(scale);
  shadowAll(g);
  return g;
}

// ---------------------------------------------------------------- sledge
// A wooden sledge with a block, ropes to a team of pullers, and a man pouring
// water in front of the runners. .userData.update(t, { move, pour }) .
export function makeSledge({ team = 12, seed = 5, block = 0xe6dcc6, big = 1 } = {}) {
  const g = new THREE.Group();
  const r = rng(seed);
  const wood = real.wood(0x7a5030);
  for (const sd of [-1, 1]) {
    const runner = new THREE.Mesh(roundedBox(0.34 * big, 0.035, 0.03, 0.012), wood);
    runner.position.set(0, 0.018, sd * 0.07 * big);
    g.add(runner);
    const tip = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.012, 6, 10, Math.PI / 2), wood);
    tip.position.set(-0.17 * big, 0.045, sd * 0.07 * big);
    tip.rotation.y = Math.PI / 2;
    g.add(tip);
  }
  for (let i = 0; i < 4; i++) {
    const cross = new THREE.Mesh(roundedBox(0.03, 0.02, 0.18 * big, 0.008), wood);
    cross.position.set(-0.12 * big + i * 0.08 * big, 0.045, 0);
    g.add(cross);
  }
  const blk = new THREE.Mesh(
    roundedBox(0.24 * big, 0.14 * big, 0.15 * big, 0.012),
    real.plastic(block, { roughness: 0.78, clearcoat: 0 }),
  );
  blk.position.y = 0.055 + 0.07 * big;
  g.add(blk);
  g.userData.block = blk;
  // the team on two ropes ahead (-x)
  const people = [];
  const ropeMat = real.fabric(0xb89a6a);
  for (const sd of [-1, 1]) {
    const rope = new THREE.Mesh(
      new THREE.CylinderGeometry(0.004, 0.004, 0.16 + (team / 2) * 0.09, 5),
      ropeMat,
    );
    rope.rotation.z = Math.PI / 2;
    const L = 0.16 + (team / 2) * 0.09;
    rope.position.set(-0.17 * big - L / 2, 0.09, sd * 0.06);
    g.add(rope);
  }
  for (let i = 0; i < team; i++) {
    const p = randomPerson(r);
    const row = Math.floor(i / 2);
    p.position.set(-0.3 * big - row * 0.09, 0, (i % 2 ? 1 : -1) * 0.085); // facing -x
    g.add(p);
    people.push(p);
  }
  // the water pourer at the front of the runners, with a jar
  const pourer = randomPerson(r, { coat: 0xe6dcc8 });
  pourer.position.set(-0.22 * big, 0, 0);
  g.add(pourer);
  const jar = new THREE.Mesh(
    new THREE.SphereGeometry(0.022, 12, 10),
    real.ceramic(0xa86a44, { roughness: 0.6, clearcoat: 0 }),
  );
  jar.scale.set(1, 1.2, 1);
  jar.position.set(-0.035, 0.13, 0);
  pourer.add(jar);
  // water stream + wet patch in front of the runners
  const stream = noAO(
    new THREE.Mesh(
      new THREE.CylinderGeometry(0.006, 0.012, 0.11, 8, 1, true),
      new THREE.MeshPhysicalMaterial({
        color: 0xbfe6ff,
        roughness: 0.05,
        transparent: true,
        opacity: 0.75,
        envMapIntensity: 2,
      }),
    ),
  );
  stream.position.set(-0.27 * big, 0.07, 0);
  g.add(stream);
  const wet = new THREE.Mesh(
    new THREE.CircleGeometry(0.16, 24),
    new THREE.MeshStandardMaterial({
      color: 0x6a4a2a,
      roughness: 0.25,
      transparent: true,
      opacity: 0.55,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    }),
  );
  wet.rotation.x = -Math.PI / 2;
  wet.scale.set(2.2, 0.9, 1);
  wet.position.set(-0.34 * big, 0.004, 0);
  wet.receiveShadow = true;
  g.add(wet);
  g.userData.update = (t, { move = 1, pour = 1, speed = 1 } = {}) => {
    people.forEach((p, i) => pull(p, t * 2.2 * speed + i * 0.37, move));
    stream.visible = pour > 0.05;
    stream.scale.y = pour;
    wet.material.opacity = 0.55 * pour;
    pourer.rotation.z = 0.25 * pour;
    jar.rotation.z = 1.2 * pour;
  };
  shadowAll(g);
  wet.castShadow = false;
  stream.castShadow = false;
  return g;
}

// ---------------------------------------------------------------- scenery
function mudHouse(r, mat, roofMat) {
  const g = new THREE.Group();
  const w = 0.5 + r() * 0.5;
  const d = 0.4 + r() * 0.4;
  const hh = 0.25 + r() * 0.15;
  const b = new THREE.Mesh(roundedBox(w, hh, d, 0.04), mat);
  b.position.y = hh / 2;
  g.add(b);
  const roof = new THREE.Mesh(roundedBox(w * 1.04, 0.04, d * 1.04, 0.02), roofMat);
  roof.position.y = hh + 0.01;
  g.add(roof);
  return g;
}
export function makeSmoke({
  n = 26,
  seed = 4,
  color = 0xf0ebe2,
  height = 2.4,
  spread = 0.35,
} = {}) {
  const g = new THREE.Group();
  const r = rng(seed);
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 1,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  });
  const puffs = [];
  for (let i = 0; i < n; i++) {
    const m = noAO(new THREE.Mesh(new THREE.IcosahedronGeometry(0.12, 1), mat));
    puffs.push({ m, ph: r(), dx: (r() - 0.5) * spread, dz: (r() - 0.5) * spread });
    g.add(m);
  }
  g.userData.update = (t, k = 1) => {
    for (const p of puffs) {
      const u = (t * 0.07 + p.ph) % 1;
      p.m.position.set(p.dx * (0.3 + u * 2) + u * 0.8, u * height, p.dz * (0.3 + u * 2));
      p.m.scale.setScalar((0.4 + u * 2.4) * k);
      p.m.visible = k > 0.01;
    }
    mat.opacity = 0.22 * k;
  };
  g.userData.update(0);
  return g;
}
// rotating stars around the celestial pole (Giza ≈ 30° N, pole in the north)
export function makeStars({ n = 1400, seed = 9, r = 240 } = {}) {
  const rr = rng(seed);
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const u = rr() * 2 - 1;
    const a = rr() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    pos.set([Math.cos(a) * s * r, u * r, Math.sin(a) * s * r], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xeef2ff,
    size: 1.3,
    sizeAttenuation: false,
    transparent: true,
    fog: false,
    depthWrite: false,
  });
  const pts = noAO(new THREE.Points(geo, mat));
  const pivot = new THREE.Group();
  pivot.rotation.x = -(Math.PI / 2 - (30 * Math.PI) / 180); // pole 30° above the north horizon
  pivot.add(pts);
  pivot.userData.update = (t, k = 1, speed = 0.03) => {
    pts.rotation.y = t * speed;
    mat.opacity = k;
    pivot.visible = k > 0.01;
  };
  return pivot;
}

// ---------------------------------------------------------------- main world
export function buildGiza({ time = "tag", state = "bau", seed = 5, level = 0.72 } = {}) {
  const r = rng(seed);
  const before = new Set(scene.children);
  const sky = setSky(SKY[time]);
  widenShadow(34, 150);
  const cap = captureSky(SKY[time], before);
  const out = { sky, state, time };
  const today = state === "heute";
  const flood = !today;

  // --- land: plateau, cliff, valley, quarry, town terrace (a fine grid,
  // so the cliff and the quarry steps stay clean)
  const land = (() => {
    const geo = facet(new THREE.PlaneGeometry(380, 380, 250, 250).rotateX(-Math.PI / 2), 0.04, 31);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) p.setY(i, heightAt(p.getX(i), p.getZ(i)));
    const c = geo.attributes.color;
    const cc = new THREE.Color();
    for (let i = 0; i + 2 < p.count; i += 3) {
      const x = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3;
      const y = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3;
      const z = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3;
      const s = x - edgeX(z);
      const n1 = noise2(x * 0.05, z * 0.05, 4);
      const n2 = noise2(x * 0.22, z * 0.22, 8);
      const slope = Math.abs(
        heightAt(x + 0.6, z) - heightAt(x - 0.6, z) + heightAt(x, z + 0.6) - heightAt(x, z - 0.6),
      );
      if (s > 4.5 && y < FLOOD_Y + 0.5) {
        if (today) cc.lerpColors(C(0x5f7a34), C(0x7f8a44), n1).lerp(C(0x4f6a2c), n2 * 0.5);
        else cc.lerpColors(C(0x6a5a40), C(0x5a5034), n1);
      } else if (slope > 0.45) {
        cc.lerpColors(C(0xb08e68), C(0x96765a), n2);
        cc.multiplyScalar(0.92 + 0.12 * Math.sin(y * 7.5 + n1 * 2));
      } else if (
        x > QUARRY.x0 - 0.5 &&
        x < QUARRY.x1 + 0.5 &&
        z > QUARRY.z0 - 0.5 &&
        z < QUARRY.z1 + 0.5 &&
        y < -0.2
      )
        cc.lerpColors(C(0xe2cc9e), C(0xd0b282), n2);
      else cc.lerpColors(C(0xdcbc86), C(0xcca672), n1).lerp(C(0xe6cc9c), n2 * 0.4);
      for (let j = 0; j < 3; j++)
        c.setXYZ(i + j, c.getX(i + j) * cc.r, c.getY(i + j) * cc.g, c.getZ(i + j) * cc.b);
    }
    c.needsUpdate = true;
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, facetMat(flat(0xffffff, { roughness: 1 })));
    m.receiveShadow = true;
    ground.add(m);
    return m;
  })();
  out.land = land;

  // --- the paved building ground around G1
  {
    const pad = new THREE.Mesh(
      roundedBox(2 * G1.half + 3, 0.06, 2 * G1.half + 3, 0.03),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.95,
        map: plainTex("#d8bf92", ["rgba(120,90,50,A)", "rgba(255,240,210,A)"], 3, 0.18),
      }),
    );
    pad.position.y = -0.02;
    pad.receiveShadow = true;
    ground.add(pad);
    out.pad = pad;
  }

  // --- water: the flood lake / the river today, the harbour basin
  {
    const wmat = new THREE.MeshPhysicalMaterial({
      color: today ? 0x3e6a6a : 0x5a7a6c,
      roughness: 0.08,
      metalness: 0.05,
      transparent: true,
      opacity: 0.9,
      envMapIntensity: 1.5,
    });
    const geo = new THREE.PlaneGeometry(420, 420, 120, 120);
    geo.rotateX(-Math.PI / 2);
    const p = geo.attributes.position;
    const base = new Float32Array(p.count);
    for (let i = 0; i < p.count; i++) base[i] = p.getX(i);
    const water = new THREE.Mesh(geo, wmat);
    water.position.set(0, flood ? FLOOD_Y : VALLEY_Y + 0.15, 0);
    water.receiveShadow = true;
    if (today) {
      // only the river channel stays: hide the plane east, a band far east
      water.position.x = 160;
      water.scale.set(0.12, 1, 1);
    }
    ground.add(water);
    onFrame((t) => {
      for (let i = 0; i < p.count; i += 1) {
        const x = base[i];
        const z = p.getZ(i);
        p.setY(i, Math.sin(x * 0.35 + t * 0.8) * 0.018 + Math.sin(z * 0.5 - t * 0.6) * 0.014);
      }
      p.needsUpdate = true;
    });
    out.water = water;
  }

  // --- the great pyramid
  const P = makePyramid({ seed: 1 });
  scene.add(P.group);
  out.g1 = P;
  const inside = makeInterior();
  inside.visible = false;
  P.group.add(inside);
  out.inside = inside;
  if (today) {
    P.build(1);
    P.weather(true);
    // the two later pyramids
    const p2 = makePyramid({ half: 10.75, h: 14.35, seed: 2, n: 92 });
    p2.group.position.copy(G2);
    p2.casing(1);
    // only the top keeps its casing
    p2.casingMesh.material.clippingPlanes[0].set(V(0, 1, 0), -14.35 * 0.82);
    p2.weather(true);
    p2.casingMesh.visible = true;
    p2.courses.forEach((c) => (c.visible = c.position.y < 14.35 * 0.86));
    scene.add(p2.group);
    const p3 = makePyramid({ half: 5.2, h: 6.5, seed: 3, n: 48 });
    p3.group.position.copy(G3);
    p3.weather(true);
    scene.add(p3.group);
    out.g2 = p2;
    out.g3 = p3;
  } else if (state === "leer") {
    P.build(0);
    P.casing(0);
  } else if (state === "fertig") {
    P.build(1);
    P.casing(1);
  } else {
    P.build(level);
    P.casing(level * 0.4);
  }

  // --- the ramps (construction only)
  const ramps = makeRamps(P, { hTop: P.h * level });
  for (const k of Object.keys(ramps)) {
    ramps[k].visible = false;
    P.group.add(ramps[k]);
  }
  out.ramps = ramps;
  out.setRamp = (name, k = 1) => {
    for (const key of Object.keys(ramps)) ramps[key].visible = key === name && k > 0.001;
    if (ramps[name]) ramps[name].userData.grow(k);
  };
  if (state === "bau") out.setRamp("spirale", 1);

  // --- the quarry: cut blocks, half-cut blocks, workers
  {
    const g = new THREE.Group();
    const stone = real.plastic(0xdcc59a, { roughness: 0.85, clearcoat: 0 });
    const blocks = [];
    for (let i = 0; i < 46; i++) {
      const x = QUARRY.x0 + 1.2 + r() * (QUARRY.x1 - QUARRY.x0 - 2.4);
      const z = QUARRY.z0 + 1.2 + r() * (QUARRY.z1 - QUARRY.z0 - 2.4);
      const b = new THREE.Mesh(roundedBox(0.24, 0.14, 0.16, 0.015), stone);
      b.position.set(x, heightAt(x, z) + 0.07, z);
      b.rotation.y = Math.floor(r() * 4) * (Math.PI / 2) + (r() - 0.5) * 0.08;
      g.add(b);
      blocks.push(b);
    }
    shadowAll(g);
    if (!today) ground.add(g);
    out.quarryBlocks = blocks;
  }

  // --- workers' town on the terrace + bakery smoke; cemetery above
  {
    const g = new THREE.Group();
    const brick = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.95,
      map: brickTex(7),
    });
    const roofMat = real.fabric(0xb09468);
    // long galleries (barracks) in rows
    for (let row = 0; row < 3; row++)
      for (let i = 0; i < 4; i++) {
        const gal = new THREE.Mesh(roundedBox(0.7, 0.35, 3.4, 0.04), brick);
        gal.position.set(TOWN.x - 6 + i * 1.4 + row * 0.2, -3.1 + 0.17, TOWN.z - 4 + row * 4.2);
        g.add(gal);
      }
    // houses, bakeries with smoke
    out.smokes = [];
    for (let i = 0; i < 28; i++) {
      const h = mudHouse(r, brick, roofMat);
      const x = TOWN.x + 1 + r() * 9;
      const z = TOWN.z - 6 + r() * 12;
      h.position.set(x, -3.1, z);
      h.rotation.y = Math.floor(r() * 2) * (Math.PI / 2);
      g.add(h);
      if (i % 6 === 0) {
        const s = makeSmoke({ seed: 40 + i, height: 2.2 });
        s.position.set(x, -2.7, z);
        g.add(s);
        out.smokes.push(s);
      }
    }
    // the wall between town and pyramids
    const wall = new THREE.Mesh(roundedBox(14, 1.0, 0.8, 0.08), brick);
    wall.position.set(TOWN.x - 2, -2.7, TOWN.z - 9);
    wall.rotation.y = -0.1;
    g.add(wall);
    shadowAll(g);
    if (!today) ground.add(g);
    out.town = g;
    // cemetery: small mudbrick tombs and domes on the slope
    const cem = new THREE.Group();
    for (let i = 0; i < 40; i++) {
      const x = CEMETERY.x + (r() - 0.5) * 8;
      const z = CEMETERY.z + (r() - 0.5) * 6;
      const y = heightAt(x, z);
      const m =
        r() < 0.5
          ? new THREE.Mesh(
              new THREE.SphereGeometry(0.12, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
              brick,
            )
          : new THREE.Mesh(roundedBox(0.28, 0.14, 0.2, 0.03), brick);
      m.position.set(x, y + (m.geometry.type === "SphereGeometry" ? 0 : 0.07), z);
      cem.add(m);
    }
    shadowAll(cem);
    ground.add(cem);
    out.cemetery = cem;
  }

  // --- valley villages: mud houses and palms on the mounds
  {
    const g = new THREE.Group();
    const brick = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.95,
      map: brickTex(9),
    });
    const roofMat = real.fabric(0xa88a5a);
    for (const [vx, vz, vr] of VILLAGES) {
      const nH = Math.round(vr * 2.2);
      for (let i = 0; i < nH; i++) {
        const a = r() * 6.28;
        const d = r() * vr * 0.6;
        const x = vx + Math.cos(a) * d;
        const z = vz + Math.sin(a) * d;
        const h = mudHouse(r, brick, roofMat);
        h.position.set(x, heightAt(x, z) - 0.02, z);
        g.add(h);
      }
      for (let i = 0; i < vr * 2.5; i++) {
        const a = r() * 6.28;
        const d = vr * (0.45 + r() * 0.5);
        const x = vx + Math.cos(a) * d;
        const z = vz + Math.sin(a) * d;
        const p = palm(i + vx, 0.2 + r() * 0.3);
        p.scale.setScalar(0.22 + r() * 0.1);
        p.position.set(x, heightAt(x, z) - 0.05, z);
        p.rotation.y = r() * 6.28;
        g.add(p);
      }
    }
    // palms along the foot of the cliff
    for (let i = 0; i < 40; i++) {
      const z = -60 + i * 3.2 + r() * 1.5;
      const x = edgeX(z) + 6.5 + r() * 3;
      if (x > HARBOUR.x0 - 1 && x < HARBOUR.x1 + 1 && z > HARBOUR.z0 - 1 && z < HARBOUR.z1 + 1)
        continue;
      const p = palm(i + 200, 0.15 + r() * 0.3);
      p.scale.setScalar(0.22 + r() * 0.12);
      p.position.set(x, heightAt(x, z) - 0.05, z);
      p.rotation.y = r() * 6.28;
      g.add(p);
    }
    shadowAll(g);
    ground.add(g);
    out.villages = g;
  }

  // --- harbour quay, the road up to the building site
  {
    const stone = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      map: plainTex("#cdb58a", ["rgba(100,80,50,A)"], 12, 0.2),
    });
    const quay = new THREE.Mesh(roundedBox(1.2, 0.5, HARBOUR.z1 - HARBOUR.z0 + 1, 0.05), stone);
    quay.position.set(HARBOUR.x0 - 0.5, VALLEY_Y + 0.4, (HARBOUR.z0 + HARBOUR.z1) / 2);
    quay.receiveShadow = quay.castShadow = true;
    ground.add(quay);
    // causeway: from the quay up the cliff to the pyramid's east side
    const pts = [];
    for (let i = 0; i <= 30; i++) {
      const k = i / 30;
      const x = lerp(HARBOUR.x0 - 1, G1.half + 1.5, k);
      const z = lerp(11, 2, k);
      pts.push(V(x, Math.max(heightAt(x, z), lerp(VALLEY_Y + 0.6, 0, sm(k * 1.6))) + 0.08, z));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const cw = new THREE.Mesh(new THREE.TubeGeometry(curve, 60, 0.45, 4), stone);
    cw.scale.y = 0.15;
    cw.position.y = 0.0;
    cw.receiveShadow = true;
    ground.add(cw);
    out.causeway = curve;
  }

  // --- boats: some sailing on the flood, some moored in the harbour
  out.boats = [];
  if (flood) {
    const spots = [
      [30, 12, -1.57, "kalk"],
      [31.5, 15.5, -1.57, "kalk"],
      [44, 4, 2.6, "kalk"],
      [58, -10, 2.9, "kalk"],
      [70, 26, 3.3, false],
      [52, 40, 2.2, "kalk"],
    ];
    spots.forEach(([x, z, ry, cargo], i) => {
      const b = makeBoat({ cargo, seed: 10 + i, scale: 0.55 });
      b.position.set(x, FLOOD_Y - 0.02, z);
      b.rotation.y = ry;
      scene.add(b);
      out.boats.push(b);
    });
  }

  // --- people at work around the pyramid (pairs and small teams)
  out.people = [];
  if (state === "bau") {
    for (let i = 0; i < 60; i++) {
      const p = randomPerson(r);
      const a = r() * 6.28;
      const d = G1.half + 1.5 + r() * 5;
      p.position.set(Math.cos(a) * d, 0, Math.sin(a) * d);
      p.rotation.y = r() * 6.28;
      p.userData.ph = r() * 2;
      p.userData.dir = r() < 0.5 ? 1 : -1;
      p.userData.home = p.position.clone();
      scene.add(p);
      out.people.push(p);
    }
    // sledges hauling blocks up the straight ramp
    out.sledges = [];
    for (let i = 0; i < 4; i++) {
      const sl = makeSledge({ team: 8, seed: 60 + i });
      sl.scale.setScalar(1.1);
      sl.rotation.y = -Math.PI / 2; // pulling north (-z)
      scene.add(sl);
      out.sledges.push(sl);
    }
  }
  out.peopleAt = (t, amt = 1) => {
    for (const p of out.people) {
      const ph = t * 0.35 * p.userData.dir + p.userData.ph;
      p.position.x = p.userData.home.x + Math.sin(ph) * 0.4;
      p.position.z = p.userData.home.z + Math.cos(ph * 0.7) * 0.4;
      walk(p, t * 1.6 + p.userData.ph, amt);
    }
  };
  // sledges climb whichever outside ramp is shown (k 0..1 along it)
  out.sledgesAt = (t, speed = 1) => {
    if (!out.sledges) return;
    const sp = ramps.spirale;
    const st = ramps.gerade;
    out.sledges.forEach((sl, i) => {
      const k = (t * 0.008 * speed + i / out.sledges.length) % 1;
      sl.userData.update(t, { pour: 0.6, speed });
      if (sp.visible) {
        const path = sp.userData.path;
        const f = k * (path.length - 1);
        const j = Math.floor(f);
        const a = path[j];
        const b = path[Math.min(path.length - 1, j + 1)];
        sl.visible = true;
        sl.position.copy(a.pos).lerp(b.pos, f - j);
        sl.position.y += 0.1;
        // pulled along the face direction (the path runs +u on every face)
        sl.rotation.set(0, -a.face * (Math.PI / 2), 0);
        sl.rotateZ(-0.085);
      } else if (st.visible) {
        const { z0, zTop, hTop } = st.userData;
        const z = z0 - (z0 - zTop) * k;
        sl.visible = k < 0.94;
        sl.position.set(0.35 * (i % 2 ? 1 : -1), hTop * k + 0.02, z);
        sl.rotation.set(0, -Math.PI / 2, 0);
        sl.rotateZ(-Math.atan(hTop / (z0 - zTop)));
      } else sl.visible = false;
    });
  };

  // --- moods + the sky light
  finishSet({ ground: today ? 0x8a8458 : 0xc8a874 });
  const mood = makeMood(cap);
  out.mood = mood;
  out.boatsAt = (t) => {
    out.boats.forEach((b, i) => {
      b.position.y = FLOOD_Y - 0.02 + Math.sin(t * 0.9 + i) * 0.012;
      b.rotation.z = Math.sin(t * 0.7 + i * 2) * 0.012;
      if (b.userData.sail) b.userData.sail.scale.z = 1 + Math.sin(t * 1.3 + i) * 0.08;
    });
  };
  return out;
}

// ---------------------------------------------------------------- chapter 1
// The early pyramids in the desert: Djoser's step pyramid, the Bent
// Pyramid, the Red Pyramid, two mastabas. Its own world (no Giza).
export const EARLY = {
  mastaba: V(-30, 0, 6),
  djoser: V(-18, 0, -4),
  bent: V(4, 0, -16),
  red: V(26, 0, -6),
};
export function buildEarly({ seed = 11 } = {}) {
  const r = rng(seed);
  const before = new Set(scene.children);
  const sky = setSky({ ...SKY.tag, sunDir: [0.4, 0.4, 0.8], keyPos: [7, 10, 10] });
  widenShadow(46, 160);
  const cap = captureSky(SKY.tag, before);
  const out = { sky };
  const land = terrain(0xffffff, {
    r: 200,
    step: 2.6,
    seed: 41,
    amt: 0.07,
    scale: 0.06,
    warm: 0.3,
    height: (x, z) => {
      const d = Math.hypot(x, z);
      return (
        (noise2(x * 0.03, z * 0.03, 2) - 0.5) * 2.2 * clamp01((d - 40) / 30) +
        Math.sin(x * 0.05) * 0.4 * clamp01((d - 45) / 20)
      );
    },
  });
  {
    const p = land.geometry.attributes.position;
    const c = land.geometry.attributes.color;
    const cc = new THREE.Color();
    for (let i = 0; i < p.count; i += 3) {
      const x = p.getX(i);
      const z = p.getZ(i);
      cc.lerpColors(C(0xdcb57a), C(0xc89a62), noise2(x * 0.06, z * 0.06, 3));
      for (let j = 0; j < 3; j++) c.setXYZ(i + j, cc.r, cc.g, cc.b);
    }
    c.needsUpdate = true;
  }
  // mastaba: the flat mud-brick tomb
  {
    const brick = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.95,
      map: brickTex(3),
    });
    const m = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.4, 1.0, 4, 1), brick);
    m.rotation.y = Math.PI / 4;
    m.scale.set(1.5, 1, 0.8);
    m.position.copy(EARLY.mastaba).add(V(0, 0.5, 0));
    m.castShadow = m.receiveShadow = true;
    scene.add(m);
    out.mastaba = m;
  }
  // Djoser: six steps (~ 62 m high, 121 × 109 m)
  const dj = makePyramid({ half: 5.8, h: 6.2, steps: 6, seed: 4, core: "#d2b282" });
  dj.group.position.copy(EARLY.djoser);
  scene.add(dj.group);
  out.djoser = dj;
  // Bent pyramid (~ 105 m high, 189 m base): steep below, flatter above
  const bent = makePyramid({
    half: 9.45,
    n: 70,
    seed: 5,
    bent: { yb: 4.7, lower: 1 / 1.376, upper: 1.072 },
    cap: false,
  });
  bent.group.position.copy(EARLY.bent);
  bent.casing(1);
  scene.add(bent.group);
  out.bent = bent;
  // Red pyramid (~ 105 m high, 220 m base), a flatter, reddish limestone
  const red = makePyramid({
    half: 11,
    h: 10.5,
    n: 70,
    seed: 6,
    core: "#c48a64",
    casingColor: 0xe8d4c0,
  });
  red.group.position.copy(EARLY.red);
  red.casing(1);
  scene.add(red.group);
  out.red = red;
  // a few people for scale and a line of workers
  out.people = [];
  for (let i = 0; i < 24; i++) {
    const p = randomPerson(r);
    const a = r() * 6.28;
    const base = [EARLY.djoser, EARLY.bent, EARLY.red][i % 3];
    p.position.copy(base).add(V(Math.cos(a) * 12, 0, Math.sin(a) * 12 + 6));
    p.rotation.y = r() * 6.28;
    p.userData.ph = r() * 2;
    scene.add(p);
    out.people.push(p);
  }
  finishSet({ ground: 0xc8a070 });
  out.mood = makeMood(cap);
  return out;
}

// ---------------------------------------------------------------- side rooms
function darkRoom(o, r = 14, color = 0x0c0f16) {
  const room = new THREE.Mesh(
    new THREE.SphereGeometry(r, 24, 16),
    new THREE.MeshBasicMaterial({ color, side: THREE.BackSide, fog: false }),
  );
  room.position.copy(o);
  scene.add(room);
  return room;
}
// a papyrus sheet with lines of ink strokes (hieratic-like, not readable)
function papyrusTex(seed = 3) {
  const r = rng(seed);
  return canvasTex(
    1024,
    512,
    (g, w, h) => {
      g.fillStyle = "#d8c08a";
      g.fillRect(0, 0, w, h);
      // fibres
      for (let i = 0; i < 260; i++) {
        g.strokeStyle = `rgba(${120 + r() * 60},${90 + r() * 40},40,${0.08 + r() * 0.1})`;
        g.lineWidth = 1 + r() * 2;
        const y = r() * h;
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(w, y + (r() - 0.5) * 6);
        g.stroke();
      }
      // columns of strokes in black and a few in red
      for (let col = 0; col < 14; col++) {
        const x0 = 40 + col * 68;
        let y = 40;
        while (y < h - 40) {
          g.strokeStyle = r() < 0.08 ? "rgba(150,40,30,0.85)" : "rgba(30,24,20,0.85)";
          g.lineWidth = 2.5 + r() * 2;
          g.beginPath();
          const kind = Math.floor(r() * 4);
          if (kind === 0) {
            g.moveTo(x0, y);
            g.quadraticCurveTo(x0 + 20, y + 4, x0 + 34, y + 14);
          } else if (kind === 1) {
            g.moveTo(x0 + 6, y);
            g.lineTo(x0 + 10, y + 16);
            g.moveTo(x0 + 18, y + 2);
            g.lineTo(x0 + 30, y + 6);
          } else if (kind === 2) {
            g.arc(x0 + 18, y + 8, 7, 0.3, 5.6);
          } else {
            g.moveTo(x0, y + 10);
            g.bezierCurveTo(x0 + 10, y - 4, x0 + 24, y + 22, x0 + 36, y + 6);
          }
          g.stroke();
          y += 20 + r() * 12;
        }
      }
      // torn edges / darker margins
      const grd = g.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, w * 0.62);
      grd.addColorStop(0, "rgba(0,0,0,0)");
      grd.addColorStop(1, "rgba(80,50,20,0.55)");
      g.fillStyle = grd;
      g.fillRect(0, 0, w, h);
    },
    { repeat: false },
  );
}
// The logbook: a cave floor of sand with storage jars and papyrus rolls (the
// 2013 find), or a museum case in Cairo (museum: true). Built around o.
export function buildPapyrus(o = V(0, -120, 0), { museum = false } = {}) {
  const g = new THREE.Group();
  g.position.copy(o);
  scene.add(g);
  darkRoom(o, 16, museum ? 0x0a0c10 : 0x120c08);
  const floorMat = museum
    ? real.wood(0x2a2420, { roughness: 0.5 })
    : new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 1,
        map: plainTex("#b8a07a", ["rgba(90,70,50,A)", "rgba(240,225,200,A)"], 19, 0.3),
      });
  const floor = new THREE.Mesh(new THREE.CircleGeometry(6, 48), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  g.add(floor);
  // the sheet, slightly curled
  const sg = new THREE.PlaneGeometry(1.6, 0.8, 40, 10);
  const sp = sg.attributes.position;
  for (let i = 0; i < sp.count; i++) {
    const x = sp.getX(i);
    sp.setZ(
      i,
      0.04 * Math.sin((x + 0.8) * 3.2) + (x > 0.6 ? Math.pow((x - 0.6) / 0.2, 2) * 0.05 : 0),
    );
  }
  sg.computeVertexNormals();
  const sheet = new THREE.Mesh(
    sg,
    new THREE.MeshStandardMaterial({ map: papyrusTex(5), roughness: 0.85, side: THREE.DoubleSide }),
  );
  sheet.rotation.x = -Math.PI / 2;
  sheet.position.y = museum ? 0.62 : 0.03;
  sheet.castShadow = sheet.receiveShadow = true;
  g.add(sheet);
  // a rolled-up end
  const roll = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.8, 24),
    new THREE.MeshStandardMaterial({ map: papyrusTex(7), roughness: 0.85 }),
  );
  roll.rotation.x = Math.PI / 2;
  roll.position.set(0.86, sheet.position.y + 0.07, 0);
  roll.castShadow = true;
  g.add(roll);
  const extra = [];
  if (museum) {
    const stand = new THREE.Mesh(roundedBox(2.1, 0.6, 1.2, 0.04), real.wood(0x3a2e26));
    stand.position.y = 0.3;
    g.add(stand);
    const glass = new THREE.Mesh(
      roundedBox(2.0, 0.5, 1.1, 0.02),
      real.glass(0xe8f4ff, { opacity: 0.18 }),
    );
    glass.position.y = 0.86;
    g.add(glass);
    const spot = new THREE.SpotLight(0xfff0d8, 30, 8, 0.5, 0.6, 1.5);
    spot.position.set(o.x + 0.5, o.y + 3.5, o.z + 1.2);
    spot.target.position.copy(o).add(V(0, 0.6, 0));
    spot.castShadow = true;
    scene.add(spot, spot.target);
  } else {
    // jars and more rolls half in the sand; a warm lamp from above
    const r = rng(12);
    for (let i = 0; i < 6; i++) {
      const jar = new THREE.Mesh(
        new THREE.LatheGeometry(
          [
            [0.0, 0],
            [0.12, 0.02],
            [0.2, 0.18],
            [0.18, 0.42],
            [0.08, 0.55],
            [0.09, 0.6],
          ].map(([x, y]) => new THREE.Vector2(x, y)),
          24,
        ),
        real.ceramic(0xa8704a, { roughness: 0.7, clearcoat: 0 }),
      );
      const a = -1.2 + i * 0.55;
      jar.position.set(Math.cos(a) * 2.1 - 0.3, -0.08 - r() * 0.15, -1.7 + Math.sin(a) * 0.4);
      jar.rotation.z = (r() - 0.5) * 0.5;
      jar.castShadow = true;
      g.add(jar);
      extra.push(jar);
    }
    for (let i = 0; i < 4; i++) {
      const rr = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.6, 16),
        new THREE.MeshStandardMaterial({ map: papyrusTex(20 + i), roughness: 0.9 }),
      );
      rr.rotation.set(Math.PI / 2, (r() - 0.5) * 1.5, 0);
      rr.position.set(-1.3 + i * 0.5 + r() * 0.2, 0.02, 0.9 + r() * 0.4);
      rr.castShadow = true;
      g.add(rr);
    }
    const lamp = new THREE.SpotLight(0xffe2c0, 22, 9, 0.6, 0.7, 1.4);
    lamp.position.set(o.x - 1.2, o.y + 3.2, o.z + 1.6);
    lamp.target.position.copy(o);
    lamp.castShadow = true;
    scene.add(lamp, lamp.target);
    // sand dust in the beam
    const dust = new THREE.Points(
      new THREE.BufferGeometry().setAttribute(
        "position",
        new THREE.BufferAttribute(
          Float32Array.from({ length: 600 }, (_, i) => (r() - 0.5) * (i % 3 === 1 ? 3 : 4)),
          3,
        ),
      ),
      new THREE.PointsMaterial({ color: 0xffe2b0, size: 0.012, transparent: true, opacity: 0.6 }),
    );
    dust.position.y = 1.4;
    g.add(noAO(dust));
    onFrame((t) => (dust.rotation.y = t * 0.03));
  }
  const fill = new THREE.PointLight(museum ? 0x9ab4ff : 0xffb070, 3, 6, 1.5);
  fill.position.set(o.x + 1.5, o.y + 1.2, o.z - 1.5);
  scene.add(fill);
  return { group: g, sheet, roll, extra };
}
// A relieving chamber above the King's chamber: granite beams, rough walls,
// the gangs' red marks painted on the stone. Built around o.
export function buildChamber(o = V(0, -160, 0)) {
  const g = new THREE.Group();
  g.position.copy(o);
  scene.add(g);
  darkRoom(o, 12, 0x08070a);
  const granite = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.7,
    map: plainTex("#9a5a4c", ["rgba(30,20,20,A)", "rgba(240,200,190,A)"], 14, 0.35),
  });
  const lime = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.95,
    map: plainTex("#c8b08a", ["rgba(80,60,40,A)"], 15, 0.3),
  });
  // floor = tops of the beams below, ceiling = the next beams, side walls
  for (let i = 0; i < 9; i++) {
    const f = new THREE.Mesh(roundedBox(0.5, 0.4, 3.0, 0.04), granite);
    f.position.set(-2 + i * 0.5, -0.2, 0);
    g.add(f);
    const c = new THREE.Mesh(roundedBox(0.5, 0.4, 3.0, 0.04), granite);
    c.position.set(-2 + i * 0.5, 1.15, 0);
    c.rotation.x = (i % 2 ? 1 : -1) * 0.01;
    g.add(c);
  }
  for (const sd of [-1, 1]) {
    const w = new THREE.Mesh(roundedBox(4.6, 1.4, 0.3, 0.04), lime);
    w.position.set(0, 0.45, sd * 1.45);
    g.add(w);
  }
  // the red marks: an oval cartouche-like ring, strokes, a levelling line
  const paint = canvasTex(
    1024,
    256,
    (cx, w, h) => {
      cx.clearRect(0, 0, w, h);
      cx.strokeStyle = "rgba(170,40,28,0.9)";
      cx.lineWidth = 9;
      cx.beginPath();
      cx.ellipse(300, 130, 120, 60, 0, 0, Math.PI * 2);
      cx.stroke();
      cx.lineWidth = 7;
      for (let i = 0; i < 5; i++) {
        cx.beginPath();
        cx.moveTo(220 + i * 40, 100);
        cx.quadraticCurveTo(232 + i * 40, 130, 222 + i * 40, 162);
        cx.stroke();
      }
      cx.beginPath();
      cx.moveTo(470, 80);
      cx.lineTo(470, 190);
      cx.moveTo(520, 90);
      cx.bezierCurveTo(560, 60, 600, 200, 650, 120);
      cx.moveTo(700, 110);
      cx.lineTo(780, 110);
      cx.moveTo(820, 80);
      cx.lineTo(860, 190);
      cx.stroke();
      cx.setLineDash([22, 14]);
      cx.lineWidth = 5;
      cx.beginPath();
      cx.moveTo(40, 225);
      cx.lineTo(990, 225);
      cx.stroke();
    },
    { repeat: false },
  );
  const marks = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 0.9),
    new THREE.MeshStandardMaterial({
      map: paint,
      transparent: true,
      roughness: 0.9,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    }),
  );
  marks.position.set(0, 0.5, -1.29);
  g.add(marks);
  shadowAll(g);
  const lamp = new THREE.PointLight(0xffc890, 9, 6, 1.4);
  lamp.position.set(o.x + 1.2, o.y + 0.7, o.z + 0.6);
  lamp.castShadow = true;
  scene.add(lamp);
  return { group: g, marks, lamp };
}
