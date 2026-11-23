// YouTube #4 "Pompeji" — the video's world kit (copied into every chapter as
// assets/welt.js by new-chapter.sh / sync-kit.sh). No side effects on import:
// each chapter's set.js calls the builders for its places.
//
// Scale outdoors: 1 unit = 10 m (a person = 0.18). x = east, z = south.
// The forum sits at the origin, the temple of Jupiter at its north end, the
// Vesuvius straight behind it (north, VES). The bay of Naples lies south and
// west (coast line coastZ(x)); Herculaneum on the coast west of the mountain,
// Stabiae on the coast south-east, Misenum far across the bay to the west.
//
//   buildPompeji({ time, state })  main world: city, mountain, bay
//        time:  "tag" | "dunkel" | "morgen" | "heute" | "felder"
//        state: "79" (living city) | "begraben" (ash plain with fields) |
//               "grabung" (ash plain with the forum dug out) | "heute" (ruins)
//        returns { mood(name, k), column, flow(), pumice, ash, roofs, ... }
//   buildBakery(origin)          a bakery inside: oven, loaves, millstones
//   buildVolcanoXray(origin)     the mountain cut open + magma chamber + bottle
//   buildTrench(origin)          the 1863 excavation: ash wall, cavity, plaster
// Things: makePerson(), walk(), makeShip(), makeColumn(), makeFlow(),
// makePumice(), stonePine(), cypress().
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
import { setSky, finishSet, terrain } from "./environments.js";

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
export function widenShadow(r = 30, far = 120, center = null) {
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
export const VES = V(0, 0, -62); // foot centre of the Vesuvius
export const VES_R = 46;
export const VES_H = 26;
export const CRATER = V(0, 21.2, -62); // vent, on the crater floor
export const HERC = V(-43, 0, -16); // Herculaneum on the coast
export const STAB = V(31, 0, 16.5); // Stabiae, villa by the sea
export const MISENUM = V(-88, 0, 52); // the fleet base, far across the bay
export const coastZ = (x) =>
  (x < 0 ? 21 + x * 0.82 : 21 - x * 0.08) + Math.sin(x * 0.11) * 1.6 + Math.sin(x * 0.37) * 0.5;
export function heightAt(x, z) {
  let h = 0;
  const dc = Math.hypot(x, z * 1.3);
  // gentle countryside outside the city
  if (dc > 19)
    h += Math.max(0.02, (noise2(x * 0.05, z * 0.05, 3) - 0.3) * 1.4) * clamp01((dc - 19) / 12);
  // the mountain: concave cone, radial gullies, a crater
  const dx = x - VES.x;
  const dz = z - VES.z;
  const dv = Math.hypot(dx, dz);
  if (dv < VES_R) {
    const a = Math.atan2(dz, dx);
    const u = 1 - dv / VES_R;
    let m = VES_H * Math.pow(u, 1.55);
    m *=
      1 +
      0.025 * Math.sin(a * 13) * (1 - u) * u * 3 +
      0.015 * Math.sin(a * 29 + 1) * (1 - u) * u * 3;
    m += (noise2(x * 0.12, z * 0.12, 9) - 0.5) * 0.7 * (1 - u);
    if (dv < 5.2) m = Math.min(m, 21.2 + Math.pow(dv / 5.2, 2) * 2.4);
    h = Math.max(h, m);
  }
  // Misenum headland across the bay
  const dm = Math.hypot(x - MISENUM.x, z - MISENUM.z);
  if (dm < 16) h = Math.max(h, 4.5 * Math.pow(1 - dm / 16, 1.3));
  // the sea
  const s = z - coastZ(x);
  if (s > 0 && dm > 9) h = Math.min(h, -Math.min(2.8, 0.4 + s * 0.5));
  else if (s > -1.6 && dm > 9) h = Math.min(h, 0.02 + (-s / 1.6) * 0.06);
  return h;
}

// ---------------------------------------------------------------- textures
function canvasTex(w, h, draw, { repeat = true } = {}) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
// plaster wall, 1 texture unit = 1 world unit (10 m): red dado, doors, small
// high windows, stains. `upper` = plaster colour.
function wallTex(upper, dado, seed) {
  const r = rng(seed);
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = upper;
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) {
      const v = r() < 0.5 ? 0 : 255;
      g.fillStyle = `rgba(${v},${v},${v},${0.02 + r() * 0.04})`;
      g.fillRect(r() * w, r() * h, 4 + r() * 30, 3 + r() * 20);
    }
    // bottom of the texture = ground (v = 0 at the bottom)
    g.fillStyle = dado;
    g.fillRect(0, h - h * 0.11, w, h * 0.11);
    g.fillStyle = "rgba(255,255,255,0.18)";
    g.fillRect(0, h - h * 0.112, w, 2);
    // doors / shop openings
    for (let i = 0; i < 2; i++) {
      const x = (i + 0.25 + r() * 0.3) * (w / 2);
      const dw = w * (0.05 + r() * 0.05);
      g.fillStyle = r() < 0.5 ? "#3a2a1e" : "#4a3322";
      g.fillRect(x, h - h * 0.27, dw, h * 0.27);
      g.fillStyle = "rgba(0,0,0,0.35)";
      g.fillRect(x, h - h * 0.27, dw, 3);
    }
    // small high windows
    for (let i = 0; i < 4; i++) {
      g.fillStyle = "#2e2620";
      g.fillRect(r() * w, h - h * (0.42 + r() * 0.12), 6 + r() * 6, 7 + r() * 5);
    }
    // stains rising from the ground
    for (let i = 0; i < 18; i++) {
      g.fillStyle = `rgba(70,55,40,${0.05 + r() * 0.06})`;
      g.fillRect(r() * w, h - h * (0.12 + r() * 0.2), 2 + r() * 10, h * 0.3);
    }
  });
}
function roofTex(base, seed) {
  const r = rng(seed);
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = base;
    g.fillRect(0, 0, w, h);
    const rows = 16;
    const cols = 12;
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        const v = (r() - 0.5) * 40;
        g.fillStyle = `rgba(${v > 0 ? 255 : 30},${v > 0 ? 200 : 10},${v > 0 ? 150 : 0},${Math.abs(v) / 255})`;
        g.fillRect((i * w) / cols, (j * h) / rows, w / cols, h / rows);
      }
    g.strokeStyle = "rgba(60,25,10,0.55)";
    g.lineWidth = 2;
    for (let i = 0; i <= cols; i++) {
      g.beginPath();
      g.moveTo((i * w) / cols, 0);
      g.lineTo((i * w) / cols, h);
      g.stroke();
    }
    g.strokeStyle = "rgba(40,15,5,0.4)";
    for (let j = 0; j <= rows; j++) {
      g.beginPath();
      g.moveTo(0, (j * h) / rows);
      g.lineTo(w, (j * h) / rows);
      g.stroke();
    }
  });
}
function pavingTex() {
  const r = rng(41);
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#5d5852";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) {
      const x = r() * w;
      const y = r() * h;
      const s = 8 + r() * 14;
      const v = 70 + r() * 35;
      g.fillStyle = `rgb(${v + 4},${v},${v - 6})`;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + s, y + r() * 4);
      g.lineTo(x + s * (0.7 + r() * 0.4), y + s);
      g.lineTo(x - r() * 3, y + s * 0.8);
      g.closePath();
      g.fill();
    }
  });
}
function slabTex(base = "#d8cfbe", line = "#a89f8e", n = 8, seed = 5) {
  const r = rng(seed);
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = base;
    g.fillRect(0, 0, w, h);
    const s = w / n;
    for (let j = 0; j < n; j++)
      for (let i = 0; i < n; i++) {
        const v = (r() - 0.5) * 22;
        g.fillStyle = `rgba(${v > 0 ? 255 : 60},${v > 0 ? 250 : 50},${v > 0 ? 240 : 40},${Math.abs(v) / 255})`;
        g.fillRect(i * s + (j % 2) * s * 0.5, j * s, s, s);
      }
    g.strokeStyle = line;
    g.lineWidth = 1.5;
    for (let j = 0; j <= n; j++) {
      g.beginPath();
      g.moveTo(0, j * s);
      g.lineTo(w, j * s);
      g.stroke();
      for (let i = 0; i <= n; i++) {
        g.beginPath();
        g.moveTo(i * s + (j % 2) * s * 0.5, j * s);
        g.lineTo(i * s + (j % 2) * s * 0.5, (j + 1) * s);
        g.stroke();
      }
    }
  });
}
// box with UVs in world units (so one wall texture fits every size)
function worldBox(w, h, d, r = 0) {
  const g = r > 0 ? roundedBox(w, h, d, r, 2) : new THREE.BoxGeometry(w, h, d);
  const p = g.attributes.position;
  const n = g.attributes.normal;
  const uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) + w / 2;
    const y = p.getY(i) + h / 2;
    const z = p.getZ(i) + d / 2;
    const ax = Math.abs(n.getX(i));
    const ay = Math.abs(n.getY(i));
    if (ay > 0.7) uv.setXY(i, x, z);
    else if (ax > 0.7) uv.setXY(i, z, y);
    else uv.setXY(i, x, y);
  }
  uv.needsUpdate = true;
  return g;
}
// gable prism along x (ridge parallel to x), base at y = 0
function gableGeo(w, d, h) {
  const s = new THREE.Shape();
  s.moveTo(-d / 2, 0);
  s.lineTo(d / 2, 0);
  s.lineTo(0, h);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false });
  g.translate(0, 0, -w / 2);
  g.rotateY(Math.PI / 2);
  // uv: world units along the slope
  const p = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++)
    uv.setXY(i, p.getX(i) * 1.2, (p.getY(i) + Math.abs(p.getZ(i))) * 1.6);
  g.computeVertexNormals();
  return g;
}

// ---------------------------------------------------------------- skies
export const SKY = {
  tag: {
    top: [0.3, 0.52, 0.86],
    mid: [0.6, 0.75, 0.93],
    hor: [0.97, 0.9, 0.78],
    below: [0.86, 0.84, 0.8],
    sun: [1.0, 0.92, 0.75],
    sunDir: [-0.45, 0.32, 0.83],
    cloud: [0xfffaf2, 0xf2dcc8],
    clouds: 10,
    hemi: [0xfff4e6, 0x7d7460, 1.4],
    key: [0xffeed6, 2.9],
    keyPos: [-7, 10, 9],
    rim: [0xc8dcff, 0.55],
    fog: [70, 330],
  },
  dunkel: {
    top: [0.04, 0.035, 0.03],
    mid: [0.09, 0.07, 0.055],
    hor: [0.34, 0.17, 0.08],
    below: [0.1, 0.075, 0.06],
    sun: [0.5, 0.25, 0.1],
    sunDir: [0, 0.05, -1],
    cloud: [0x3a332e, 0x1e1a17],
    noClouds: true,
    birds: false,
    hemi: [0x9a8070, 0x241a14, 1.0],
    key: [0xffa868, 0.6],
    env: 0.08,
    keyPos: [2, 10, -12],
    rim: [0xff7a30, 0.9],
    fog: [22, 170],
    nightWindows: true,
  },
  morgen: {
    top: [0.33, 0.3, 0.28],
    mid: [0.47, 0.42, 0.37],
    hor: [0.66, 0.55, 0.44],
    below: [0.48, 0.43, 0.38],
    sun: [0.9, 0.6, 0.35],
    sunDir: [0.8, 0.12, -0.2],
    cloud: [0x8a7e74, 0x5e554e],
    noClouds: true,
    birds: false,
    hemi: [0xcbb8a4, 0x40362e, 1.0],
    key: [0xffd2a8, 1.1],
    env: 0.45,
    keyPos: [10, 6, -2],
    rim: [0xffb27a, 0.6],
    fog: [14, 120],
  },
  heute: {
    top: [0.24, 0.5, 0.9],
    mid: [0.55, 0.74, 0.95],
    hor: [0.9, 0.93, 0.95],
    below: [0.82, 0.86, 0.88],
    sun: [1.0, 0.97, 0.88],
    sunDir: [-0.4, 0.4, 0.82],
    cloud: [0xffffff, 0xe6eefa],
    clouds: 12,
    hemi: [0xf2f6ff, 0x7c806a, 1.45],
    key: [0xfff6e6, 2.9],
    keyPos: [-7, 11, 9],
    rim: [0xc4dcff, 0.5],
    fog: [80, 340],
  },
  felder: {
    top: [0.36, 0.56, 0.86],
    mid: [0.7, 0.78, 0.9],
    hor: [1.0, 0.86, 0.7],
    below: [0.9, 0.84, 0.78],
    sun: [1.0, 0.86, 0.62],
    sunDir: [0.7, 0.18, 0.6],
    cloud: [0xfff3e6, 0xf0c8a8],
    clouds: 12,
    hemi: [0xfff0e0, 0x7a7055, 1.35],
    key: [0xffdcb0, 2.6],
    keyPos: [9, 7, 8],
    rim: [0xffc89a, 0.6],
    fog: [60, 300],
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
  const extras = scene.children.filter((o) => o.isGroup && o !== ground && !before.has(o));
  lights.rim = dirs.find((d) => !d.castShadow) ?? null;
  return { lights, skyMesh, base: sky, extras };
}
const C = (c) => new THREE.Color(c);
// blend the whole scene's light from the base palette towards another one
function makeMood(cap) {
  const L = cap.lights;
  const base = {
    hemiI: L.hemi.intensity,
    keyI: L.key.intensity,
    rimI: L.rim ? L.rim.intensity : 0,
    hemiC: L.hemi.color.clone(),
    hemiG: L.hemi.groundColor.clone(),
    keyC: L.key.color.clone(),
    rimC: L.rim ? L.rim.color.clone() : C(0),
    fogC: scene.fog.color.clone(),
    fogN: scene.fog.near,
    fogF: scene.fog.far,
    env: scene.environmentIntensity ?? 1,
    u: Object.fromEntries(
      ["top", "mid", "hor", "below", "sunCol"].map((k) => [
        k,
        cap.skyMesh.material.uniforms[k].value.clone(),
      ]),
    ),
  };
  const ratio = (a, b) => (a > 0 ? b / a : 1);
  return (name, k) => {
    k = clamp01(k);
    const s = SKY[name];
    const b = cap.base;
    const hemiTarget = (s.hemi[2] / b.hemi[2]) * base.hemiI;
    L.hemi.intensity = lerp(base.hemiI, hemiTarget, k);
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
  };
}

// ---------------------------------------------------------------- people
const TUNICS = [0xe9e0cc, 0xc9a46a, 0xa8432f, 0x6f7f8c, 0x7d8a52, 0xd8c8a8, 0x8c5a3a, 0x4f5e78];
export function makePerson({
  coat = 0xe9e0cc,
  legs = null,
  skin = 0xc99a74,
  hair = 0x2a211b,
  scale = 1,
  cloak = null,
} = {}) {
  const g = new THREE.Group();
  // tunic: a slightly flared body to the knee
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.036, 0.1, 18), real.fabric(coat));
  body.position.y = 0.09;
  g.add(body);
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.027, 18, 12), real.fabric(coat));
  chest.scale.set(1, 0.8, 0.85);
  chest.position.y = 0.135;
  g.add(chest);
  if (cloak !== null) {
    const c = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.04, 0.08, 18, 1, true, Math.PI * 0.3, Math.PI * 1.4),
      real.fabric(cloak, { side: THREE.DoubleSide }),
    );
    c.position.y = 0.11;
    g.add(c);
  }
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.019, 24, 16), real.skin(skin));
  head.position.y = 0.172;
  g.add(head);
  const hr = new THREE.Mesh(
    new THREE.SphereGeometry(0.02, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
    real.fabric(hair),
  );
  hr.position.y = 0.175;
  hr.rotation.x = -0.25;
  g.add(hr);
  for (const s of [-1, 1]) {
    const leg = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.009, 0.045, 4, 10),
      legs === null ? real.skin(skin) : real.fabric(legs),
    );
    leg.position.set(0, 0.03, s * 0.012);
    leg.name = s < 0 ? "legL" : "legR";
    g.add(leg);
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.008, 0.055, 4, 10), real.skin(skin));
    arm.position.set(0, 0.11, s * 0.034);
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
// a bundle on the back / a torch in the hand for the people leaving the city
export function addBundle(p, color = 0xb8a27a) {
  const b = new THREE.Mesh(roundedBox(0.03, 0.04, 0.05, 0.01), real.fabric(color));
  b.position.set(-0.03, 0.13, 0);
  b.castShadow = true;
  p.add(b);
  return b;
}
export function addTorch(p) {
  const g = new THREE.Group();
  const stick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.003, 0.004, 0.08, 6),
    real.wood(0x5a3a22),
  );
  g.add(stick);
  const fl = noAO(
    new THREE.Mesh(
      new THREE.SphereGeometry(0.012, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0xffb24a, toneMapped: false }),
    ),
  );
  fl.position.y = 0.045;
  fl.scale.set(1, 1.6, 1);
  g.add(fl);
  g.position.set(0.02, 0.17, 0.035);
  p.add(g);
  g.userData.flame = fl;
  return g;
}

// ---------------------------------------------------------------- vegetation
const leafMat = (c) => facetMat(flat(c, { roughness: 0.9 }));
export function stonePine(s = 1, seed = 1) {
  const g = new THREE.Group();
  const r = rng(seed);
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.06, 1.3, 7),
    facetMat(flat(0x5e4532)),
  );
  trunk.position.y = 0.65;
  trunk.rotation.z = (r() - 0.5) * 0.18;
  g.add(trunk);
  const crown = new THREE.Group();
  crown.position.set(Math.sin(trunk.rotation.z) * -0.6, 1.35, 0);
  const lm = leafMat(0x4f6b34);
  for (let i = 0; i < 6; i++) {
    const m = new THREE.Mesh(
      facet(jitter(new THREE.IcosahedronGeometry(0.32, 1), 0.06, seed + i), 0.07, seed + i),
      lm,
    );
    const a = (i / 6) * Math.PI * 2;
    m.position.set(
      Math.cos(a) * 0.32 * (i ? 1 : 0),
      (r() - 0.3) * 0.08,
      Math.sin(a) * 0.32 * (i ? 1 : 0),
    );
    m.scale.set(1.2, 0.45, 1.2);
    crown.add(m);
  }
  g.add(crown);
  g.userData.crown = crown;
  g.scale.setScalar(s);
  shadowAll(g);
  return g;
}
export function cypress(s = 1, seed = 1) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(
    facet(jitter(new THREE.ConeGeometry(0.14, 1.1, 8, 3), 0.03, seed), 0.08, seed),
    leafMat(0x3d5a30),
  );
  m.position.y = 0.6;
  g.add(m);
  g.scale.setScalar(s);
  shadowAll(g);
  return g;
}
function olive(s = 1, seed = 1) {
  const g = new THREE.Group();
  const t = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.05, 0.3, 6),
    facetMat(flat(0x6a5440)),
  );
  t.position.y = 0.15;
  g.add(t);
  const c = new THREE.Mesh(
    facet(jitter(new THREE.IcosahedronGeometry(0.22, 1), 0.05, seed), 0.08, seed),
    leafMat(0x7d8a5a),
  );
  c.position.y = 0.4;
  c.scale.set(1, 0.75, 1);
  g.add(c);
  g.scale.setScalar(s);
  shadowAll(g);
  return g;
}

// ---------------------------------------------------------------- the eruption column
// A dense, opaque, cauliflower column of instanced puffs from the vent, with
// the umbrella ("the pine") spreading at the top and drifting south-east.
// update(t, { grow 0..1, k 0..1, collapse 0..1, glow })
export function makeColumn({ base = CRATER, height = 95, n = 760, seed = 5, scale = 1 } = {}) {
  const g = new THREE.Group();
  g.position.copy(base);
  const geo = facet(new THREE.IcosahedronGeometry(1, 1), 0.06, 4);
  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 1,
    flatShading: true,
    emissive: 0xff5a1a,
    emissiveIntensity: 0,
  });
  const im = new THREE.InstancedMesh(geo, mat, n);
  im.castShadow = true;
  noAO(im);
  g.add(im);
  const r = rng(seed);
  const P = [];
  const col = new THREE.Color();
  for (let i = 0; i < n; i++) {
    const u0 = r();
    P.push({
      u0,
      a: r() * Math.PI * 2,
      rr: 0.35 + Math.sqrt(r()) * 0.65,
      s: 0.5 + r() * 0.9,
      sp: 0.6 + r() * 0.7,
      wob: r() * 6.28,
      jy: (r() - 0.5) * 2,
    });
    const v = 0.27 + r() * 0.22 + u0 * 0.2;
    col.setRGB(v * 1.02, v * 0.96, v * 0.88);
    im.setColorAt(i, col);
  }
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const sc = new THREE.Vector3();
  const pos = new THREE.Vector3();
  const H = height * scale;
  g.userData.update = (t, { grow = 1, k = 1, collapse = 0, drift = 1, glow = 0 } = {}) => {
    g.visible = k > 0.01 && grow > 0.001;
    if (!g.visible) return;
    mat.emissiveIntensity = glow;
    for (let i = 0; i < n; i++) {
      const p = P[i];
      // rising: every puff cycles up the column; the column top grows with `grow`
      const u = (p.u0 + t * 0.012 * p.sp) % 1;
      const top = grow;
      if (u > top) {
        m4.makeScale(0, 0, 0);
        im.setMatrixAt(i, m4);
        continue;
      }
      const h = u * H;
      // the umbrella: above 72 % the puffs spread out sideways
      const um = sm((u - 0.7) / 0.3);
      const w = (2.6 + u * 10 + um * um * 40) * scale;
      const ang = p.a + u * 1.5 + Math.sin(t * 0.2 + p.wob) * 0.1;
      const dr = um * drift * 34 * scale;
      pos.set(
        Math.cos(ang) * w * p.rr + dr * 0.35,
        h + p.jy * 3 * scale - um * um * 6 * scale - collapse * u * H * 0.55,
        Math.sin(ang) * w * p.rr * 0.8 + dr * 0.94,
      );
      // collapse: the lower column slumps outwards (the fountain falling back)
      if (collapse > 0) {
        const fall = collapse * (1 - u);
        pos.x += Math.cos(p.a) * fall * 30 * scale;
        pos.z += Math.sin(p.a) * fall * 30 * scale;
      }
      const s =
        (1.6 + u * 4.5 + um * 3) *
        p.s *
        scale *
        (1 + 0.08 * Math.sin(t * 0.9 + p.wob)) *
        Math.min(1, (top - u) * 25 + 0.3);
      sc.set(s, s * (0.75 + um * 0.1), s);
      q.setFromAxisAngle(V(0, 1, 0), p.wob + t * 0.05);
      m4.compose(pos, q, sc);
      im.setMatrixAt(i, m4);
    }
    im.instanceMatrix.needsUpdate = true;
  };
  return g;
}

// volcanic lightning in the dark column: a few bolts at fixed times
export function makeLightning(base = CRATER, seed = 3) {
  const g = new THREE.Group();
  g.position.copy(base);
  const r = rng(seed);
  const bolts = [];
  for (let b = 0; b < 4; b++) {
    const pts = [];
    let x = (r() - 0.5) * 6;
    let y = 8 + r() * 14;
    let z = (r() - 0.5) * 6;
    for (let i = 0; i < 9; i++) {
      pts.push(V(x, y, z));
      x += (r() - 0.5) * 2.4;
      y -= 1.2 + r() * 1.4;
      z += (r() - 0.5) * 2.4;
    }
    const geo = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.1),
      40,
      0.08,
      4,
    );
    const m = noAO(
      new THREE.Mesh(
        geo,
        new THREE.MeshBasicMaterial({
          color: 0xd8e4ff,
          toneMapped: false,
          transparent: true,
          opacity: 0,
          fog: false,
        }),
      ),
    );
    g.add(m);
    bolts.push(m);
  }
  const light = new THREE.PointLight(0xcfdcff, 0, 160, 1.2);
  light.position.set(0, 10, 0);
  g.add(light);
  const T = [0.3, 2.9, 3.15, 6.4, 9.8, 10.05, 13.7, 17.2, 17.4, 21.6];
  g.userData.update = (t, k = 1) => {
    let f = 0;
    let which = 0;
    for (let i = 0; i < T.length; i++) {
      const x = (t % 24) - T[i];
      if (x >= 0 && x < 0.18) {
        f = Math.max(f, 1 - x / 0.18);
        which = i % bolts.length;
      }
    }
    bolts.forEach((b, i) => (b.material.opacity = i === which ? f * k : 0));
    light.intensity = f * k * 900;
  };
  return g;
}

// ---------------------------------------------------------------- pumice rain
// Instanced pale stones falling in a box around `center` (set per shot).
// update(t, k, center)
export function makePumice({ n = 2600, size = 16, top = 9, seed = 8, scale = 1 } = {}) {
  const geo = facet(new THREE.DodecahedronGeometry(1, 0), 0.12, 3);
  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 1,
    flatShading: true,
  });
  const im = new THREE.InstancedMesh(geo, mat, n);
  noAO(im);
  im.frustumCulled = false;
  const r = rng(seed);
  const P = [];
  const col = new THREE.Color();
  for (let i = 0; i < n; i++) {
    P.push({
      x: r() - 0.5,
      z: r() - 0.5,
      ph: r(),
      v: 0.8 + r() * 0.5,
      s: (0.008 + r() * r() * 0.022) * scale,
      rot: r() * 6,
    });
    const v = 0.72 + r() * 0.2;
    col.setRGB(v, v * 0.97, v * 0.9);
    im.setColorAt(i, col);
  }
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const sc = new THREE.Vector3();
  const pos = new THREE.Vector3();
  im.userData.update = (t, k = 1, center = V(0, 0, 0), floor = 0) => {
    im.visible = k > 0.01;
    if (!im.visible) return;
    const cnt = Math.floor(n * k);
    for (let i = 0; i < n; i++) {
      const p = P[i];
      if (i >= cnt) {
        m4.makeScale(0, 0, 0);
        im.setMatrixAt(i, m4);
        continue;
      }
      const u = (p.ph + t * 0.32 * p.v) % 1;
      pos.set(center.x + p.x * size, center.y + floor + top * (1 - u), center.z + p.z * size);
      e.set(p.rot + t * 3, p.rot * 2 + t * 2, 0);
      q.setFromEuler(e);
      sc.setScalar(p.s);
      m4.compose(pos, q, sc);
      im.setMatrixAt(i, m4);
    }
    im.instanceMatrix.needsUpdate = true;
  };
  return im;
}

// ---------------------------------------------------------------- pyroclastic flow
// A ground-hugging avalanche of dark, hot cloud along a path down the
// mountain. update(t, p 0..1 = front along the path, k = visibility)
export function makeFlow(path, { n = 720, seed = 11, width = 6, scale = 1 } = {}) {
  const curve = new THREE.CatmullRomCurve3(path, false, "centripetal");
  const geo = facet(new THREE.IcosahedronGeometry(1, 1), 0.07, 5);
  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 1,
    flatShading: true,
    emissive: 0xff5a1a,
    emissiveIntensity: 0.06,
  });
  const im = new THREE.InstancedMesh(geo, mat, n);
  im.castShadow = true;
  noAO(im);
  im.frustumCulled = false;
  const r = rng(seed);
  const P = [];
  const col = new THREE.Color();
  for (let i = 0; i < n; i++) {
    P.push({
      b: Math.pow(r(), 1.6),
      side: r() * 2 - 1,
      s: 0.5 + r() * 0.9,
      wob: r() * 6.28,
      up: r(),
    });
    const v = 0.2 + r() * 0.17;
    col.setRGB(v * 1.02, v * 0.98, v * 0.94);
    im.setColorAt(i, col);
  }
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const sc = new THREE.Vector3();
  const pos = new THREE.Vector3();
  const tan = new THREE.Vector3();
  const side = new THREE.Vector3();
  im.userData.curve = curve;
  im.userData.update = (t, p, k = 1, glow = 0.06) => {
    im.visible = k > 0.01 && p > 0.001;
    if (!im.visible) return;
    mat.emissiveIntensity = glow * k;
    for (let i = 0; i < n; i++) {
      const P_ = P[i];
      // puffs trail behind the front over 55 % of the path
      const behind = P_.b * Math.min(p, 0.55);
      const s = clamp01(p - behind);
      curve.getPointAt(s, pos);
      curve.getTangentAt(s, tan);
      side.set(-tan.z, 0, tan.x).normalize();
      const spread = width * scale * (0.3 + s * 0.9) * (0.4 + behind * 1.4);
      pos.addScaledVector(side, P_.side * spread);
      const gy = heightAt(pos.x, pos.z);
      const rise = behind * 7 * scale * P_.up + Math.sin(t * 1.3 + P_.wob) * 0.25 * scale;
      const sz = (0.9 + behind * 3.4) * P_.s * scale * (1 + 0.1 * Math.sin(t * 2 + P_.wob));
      pos.y = Math.max(gy, 0) + sz * 0.55 + rise;
      sc.set(sz, sz * 0.8, sz);
      q.setFromAxisAngle(V(0, 1, 0), P_.wob + t * 0.4);
      m4.compose(pos, q, sc);
      im.setMatrixAt(i, m4);
    }
    im.instanceMatrix.needsUpdate = true;
  };
  return im;
}
// a path straight down the slope from the crater rim to a target point
export function slopePath(to, { from = null, n = 14, bend = 0 } = {}) {
  const a = from ?? V(CRATER.x + (to.x - CRATER.x) * 0.06, 0, CRATER.z + (to.z - CRATER.z) * 0.06);
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const x = lerp(a.x, to.x, u) + Math.sin(u * Math.PI) * bend;
    const z = lerp(a.z, to.z, u);
    pts.push(V(x, heightAt(x, z), z));
  }
  return pts;
}

// ---------------------------------------------------------------- ships
// a Roman warship (~4 units = 40 m): hull, ram, two banks of oars, square sail
export function makeShip({
  sail = 0xe8dcc0,
  hull = 0x5a3a24,
  stripe = 0xa8432f,
  oars = true,
} = {}) {
  const g = new THREE.Group();
  const s = new THREE.Shape();
  s.moveTo(-2, 0.18);
  s.quadraticCurveTo(-2.15, 0.05, -1.7, -0.08);
  s.lineTo(1.6, -0.08);
  s.quadraticCurveTo(2.05, 0.0, 2.25, 0.34);
  s.lineTo(1.9, 0.3);
  s.lineTo(-1.8, 0.3);
  s.closePath();
  const hg = new THREE.ExtrudeGeometry(s, {
    depth: 0.5,
    bevelEnabled: true,
    bevelSize: 0.06,
    bevelThickness: 0.1,
    bevelSegments: 3,
    curveSegments: 12,
  });
  hg.translate(0, 0, -0.25);
  const h = new THREE.Mesh(hg, real.wood(hull, { roughness: 0.7 }));
  g.add(h);
  const band = new THREE.Mesh(
    roundedBox(3.7, 0.05, 0.72, 0.02),
    real.wood(stripe, { roughness: 0.6 }),
  );
  band.position.set(0, 0.24, 0);
  g.add(band);
  const deck = new THREE.Mesh(roundedBox(3.6, 0.04, 0.6, 0.02), real.wood(0x9a7650));
  deck.position.y = 0.31;
  g.add(deck);
  const ram = new THREE.Mesh(
    new THREE.ConeGeometry(0.07, 0.35, 10),
    real.metal(0x8a6a3a, { roughness: 0.4 }),
  );
  ram.rotation.z = Math.PI / 2;
  ram.position.set(-2.25, 0.0, 0);
  g.add(ram);
  const stern = new THREE.Mesh(
    new THREE.TorusGeometry(0.22, 0.04, 8, 16, Math.PI * 0.9),
    real.wood(hull),
  );
  stern.position.set(2.15, 0.5, 0);
  stern.rotation.z = 0.4;
  g.add(stern);
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.03, 1.9, 10),
    real.wood(0x6a4a2e),
  );
  mast.position.set(-0.2, 1.25, 0);
  g.add(mast);
  const yard = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, 1.5, 8),
    real.wood(0x6a4a2e),
  );
  yard.rotation.x = Math.PI / 2;
  yard.position.set(-0.2, 2.05, 0);
  g.add(yard);
  const sg = new THREE.PlaneGeometry(1.4, 1.1, 8, 6);
  const sp = sg.attributes.position;
  for (let i = 0; i < sp.count; i++)
    sp.setZ(i, -0.12 * (1 - Math.pow(sp.getX(i) / 0.7, 2)) * (0.5 + 0.5 * (sp.getY(i) + 0.55)));
  sg.computeVertexNormals();
  const sailM = new THREE.Mesh(sg, real.fabric(sail, { side: THREE.DoubleSide }));
  sailM.rotation.y = Math.PI / 2;
  sailM.position.set(-0.12, 1.48, 0);
  g.add(sailM);
  g.userData.sail = sailM;
  const oarSet = [];
  if (oars) {
    const om = real.wood(0x8a6a44);
    for (const sd of [-1, 1])
      for (let row = 0; row < 2; row++)
        for (let i = 0; i < 13; i++) {
          const piv = new THREE.Group();
          piv.position.set(-1.45 + i * 0.24, 0.1 + row * 0.1, sd * 0.33);
          const o = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.9, 5), om);
          o.rotation.x = sd * (Math.PI / 2 - 0.55 - row * 0.15);
          o.position.set(0, -0.18 - row * 0.05, sd * 0.36);
          piv.add(o);
          piv.userData = { sd, ph: row * 0.3 };
          g.add(piv);
          oarSet.push(piv);
        }
  }
  g.userData.row = (t, speed = 1) => {
    for (const p of oarSet) {
      const a = t * 2.4 * speed + p.userData.ph;
      p.rotation.y = Math.sin(a) * 0.35 * p.userData.sd;
      p.rotation.x = Math.cos(a) * 0.12 * p.userData.sd;
    }
  };
  shadowAll(g);
  return g;
}

// ---------------------------------------------------------------- city parts
function column(h, r, mat, capMat) {
  const g = new THREE.Group();
  const sh = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.88, r, h, 20), mat);
  sh.position.y = h / 2;
  g.add(sh);
  const base = new THREE.Mesh(roundedBox(r * 2.6, r * 0.5, r * 2.6, r * 0.12), capMat);
  base.position.y = r * 0.25;
  g.add(base);
  const cap = new THREE.Mesh(roundedBox(r * 2.5, r * 0.6, r * 2.5, r * 0.12), capMat);
  cap.position.y = h + r * 0.3;
  g.add(cap);
  return g;
}
function temple({
  w = 2.1,
  d = 3.2,
  podium = 0.36,
  colH = 1.0,
  stone = 0xd9cdb4,
  tufa = 0xb8a98c,
  roof,
} = {}) {
  const g = new THREE.Group();
  const sMat = real.plastic(stone, { roughness: 0.85, clearcoat: 0 });
  const tMat = real.plastic(tufa, { roughness: 0.92, clearcoat: 0 });
  const pod = new THREE.Mesh(roundedBox(w, podium, d, 0.03), tMat);
  pod.position.y = podium / 2;
  g.add(pod);
  // stairs in front (+z)
  for (let i = 0; i < 6; i++) {
    const st = new THREE.Mesh(roundedBox(w * 0.62, podium * (1 - i / 6), 0.07, 0.01), sMat);
    st.position.set(0, (podium * (1 - i / 6)) / 2, d / 2 + 0.035 + i * 0.07);
    g.add(st);
  }
  // cella
  const cella = new THREE.Mesh(roundedBox(w * 0.7, colH, d * 0.55, 0.02), sMat);
  cella.position.set(0, podium + colH / 2, -d * 0.2);
  g.add(cella);
  const r = 0.07;
  const cols = [];
  for (let i = 0; i < 6; i++) cols.push([-w / 2 + 0.16 + (i * (w - 0.32)) / 5, d / 2 - 0.15]);
  for (let j = 1; j < 3; j++)
    for (const sx of [-1, 1]) cols.push([sx * (w / 2 - 0.16), d / 2 - 0.15 - j * 0.42]);
  for (const [x, z] of cols) {
    const c = column(colH, r, sMat, sMat);
    c.position.set(x, podium, z);
    g.add(c);
  }
  // entablature + pediment + roof
  const ent = new THREE.Mesh(roundedBox(w, 0.14, d, 0.02), sMat);
  ent.position.y = podium + colH + 0.1;
  g.add(ent);
  const ped = new THREE.Mesh(gableGeo(d + 0.06, w + 0.08, 0.38), roof);
  ped.rotation.y = Math.PI / 2;
  ped.position.y = podium + colH + 0.17;
  g.add(ped);
  const tri = new THREE.Shape();
  tri.moveTo(-w / 2, 0);
  tri.lineTo(w / 2, 0);
  tri.lineTo(0, 0.36);
  tri.closePath();
  const face = new THREE.Mesh(
    new THREE.ExtrudeGeometry(tri, { depth: 0.04, bevelEnabled: false }),
    sMat,
  );
  face.position.set(0, podium + colH + 0.17, d / 2 - 0.01);
  g.add(face);
  shadowAll(g);
  return g;
}
function colonnade(len, h, mat, roofMat, { along = "z", spacing = 0.42, depth = 0.5 } = {}) {
  const g = new THREE.Group();
  const n = Math.floor(len / spacing);
  const geo = new THREE.CylinderGeometry(0.04, 0.046, h, 14);
  geo.translate(0, h / 2, 0);
  const im = new THREE.InstancedMesh(geo, mat, n);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < n; i++) {
    const s = -len / 2 + spacing / 2 + i * spacing;
    m4.makeTranslation(along === "z" ? 0 : s, 0, along === "z" ? s : 0);
    im.setMatrixAt(i, m4);
  }
  im.castShadow = im.receiveShadow = true;
  g.add(im);
  const beam = new THREE.Mesh(
    roundedBox(along === "z" ? 0.12 : len, 0.07, along === "z" ? len : 0.12, 0.02),
    mat,
  );
  beam.position.y = h + 0.035;
  g.add(beam);
  const rg = worldBox(along === "z" ? depth : len, 0.04, along === "z" ? len : depth);
  const roof = new THREE.Mesh(rg, roofMat);
  roof.position.set(along === "z" ? -depth / 2 : 0, h + 0.1, along === "z" ? 0 : -depth / 2);
  roof.rotation[along === "z" ? "z" : "x"] = along === "z" ? -0.18 : 0.18;
  g.add(roof);
  shadowAll(g);
  return g;
}

// ---------------------------------------------------------------- the main world
const FORUM = { x0: -1.7, x1: 1.7, z0: -5.0, z1: 5.2 };
const AMPHI = V(12.4, 0, 6.2);
const inCity = (x, z) => ((x - 1.5) / 16) ** 2 + (z / 11.2) ** 2 < 1;
export const BAKERY = V(3.55, 0, 2.6); // the bakery's street door (east of the forum)
export const THERMO = V(-3.6, 0, 6.2); // the snack bar counter at a street corner

export function buildPompeji({
  time = "tag",
  state = "79",
  seed = 7,
  column: wantColumn = true,
} = {}) {
  const r = rng(seed);
  const before = new Set(scene.children);
  const sky = setSky(SKY[time]);
  widenShadow(30, 140);
  const cap = captureSky(SKY[time], before);
  const out = { sky, state, time };
  const living = state === "79";
  const ruins = state === "heute";
  const buried = state === "begraben" || state === "grabung";

  // --- land: fields, beach, sea floor, the mountain with vineyards / bare top
  const land = terrain(0xffffff, {
    r: 200,
    step: 2.4,
    seed: 21,
    amt: 0.07,
    scale: 0.06,
    warm: 0.4,
    height: (x, z) => heightAt(x, z),
  });
  {
    const p = land.geometry.attributes.position;
    const c = land.geometry.attributes.color;
    const cc = new THREE.Color();
    const fields = [C(0x8a8f4c), C(0x9c8c55), C(0x6f8240), C(0xa39a62)];
    for (let i = 0; i + 2 < p.count; i += 3) {
      const x = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3;
      const y = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3;
      const z = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3;
      const dv = Math.hypot(x - VES.x, z - VES.z);
      const s = z - coastZ(x);
      if (s > 0.2 && y < 0) cc.set(0x6f8e86);
      else if (s > -2.2 && y < 0.3) cc.set(0xcdb88c);
      else if (dv < 7) cc.set(0x5a4f48);
      else if (y > 14) cc.lerpColors(C(0x6e6152), C(0x5a4f48), clamp01((y - 14) / 6));
      else if (y > 6) cc.lerpColors(C(0x56703a), C(0x6e6152), clamp01((y - 9) / 5));
      else {
        const n1 = noise2(x * 0.06, z * 0.06, 4);
        const n2 = noise2(x * 0.17, z * 0.17, 8);
        cc.lerpColors(fields[0], fields[1], n1).lerp(fields[2], n2 * 0.6);
        if (buried && state === "begraben") cc.lerp(C(0x7a9a48), 0.3);
      }
      if (ruins && dv > 12 && dv < 30 && z > VES.z) cc.lerp(C(0x8a8a80), 0.15);
      const kk = 1 + (noise2(x * 0.45, z * 0.45, 17) - 0.5) * 0.1;
      for (let j = 0; j < 3; j++) c.setXYZ(i + j, cc.r * kk, cc.g * kk, cc.b * kk);
    }
    c.needsUpdate = true;
  }
  out.land = land;
  // the summit in fine detail (the coarse land is too rough for close shots)
  {
    const R = 13;
    const geo = facet(
      new THREE.PlaneGeometry(2 * R, 2 * R, 90, 90).rotateX(-Math.PI / 2),
      0.05,
      12,
    );
    const p = geo.attributes.position;
    const c = geo.attributes.color;
    const cc = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i) + VES.x;
      const z = p.getZ(i) + VES.z;
      const d = Math.hypot(x - VES.x, z - VES.z);
      p.setY(i, heightAt(x, z) + 0.09 - Math.max(0, d - R + 1.5) * 0.8);
    }
    for (let i = 0; i + 2 < p.count; i += 3) {
      const x = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3 + VES.x;
      const z = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3 + VES.z;
      const d = Math.hypot(x - VES.x, z - VES.z);
      const n = noise2(x * 0.9, z * 0.9, 31);
      if (d < 4.6) cc.lerpColors(C(0x55573a), C(0x5d6a34), n);
      else
        cc.lerpColors(C(0x6e6152), C(0x5a4f48), n).lerp(C(0x5f6a3a), clamp01((n - 0.55) * 2) * 0.6);
      for (let j = 0; j < 3; j++)
        c.setXYZ(i + j, c.getX(i + j) * cc.r, c.getY(i + j) * cc.g, c.getZ(i + j) * cc.b);
    }
    geo.computeVertexNormals();
    const shape = new THREE.Mesh(geo, facetMat(flat(0xffffff, { roughness: 1 })));
    shape.position.set(VES.x, 0, VES.z);
    shape.receiveShadow = true;
    // clip the square to a disc: drop triangles outside R
    const keep = [];
    for (let i = 0; i + 2 < p.count; i += 3) {
      const x = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3;
      const z = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3;
      if (Math.hypot(x, z) < R - 0.6) keep.push(i, i + 1, i + 2);
    }
    geo.setIndex(keep);
    ground.add(shape);
    // wild vines and shrubs inside the crater and on the rim
    const rr = rng(44);
    const sh = new THREE.InstancedMesh(
      facet(new THREE.IcosahedronGeometry(0.12, 0), 0.1, 3),
      facetMat(flat(0x4f6a2e, { roughness: 1 })),
      220,
    );
    const m4 = new THREE.Matrix4();
    for (let i = 0; i < 220; i++) {
      const a = rr() * Math.PI * 2;
      const d = rr() * 7.5;
      const x = VES.x + Math.cos(a) * d;
      const z = VES.z + Math.sin(a) * d;
      const s = 0.6 + rr() * 1.2;
      m4.compose(V(x, heightAt(x, z) + 0.05, z), new THREE.Quaternion(), V(s, s * 0.6, s));
      sh.setMatrixAt(i, m4);
    }
    sh.castShadow = true;
    ground.add(sh);
    out.summitShrubs = sh;
  }

  // --- the bay: a moving faceted sea south and west of the coast
  {
    const geo = new THREE.PlaneGeometry(420, 420, 110, 110);
    geo.rotateX(-Math.PI / 2);
    const p = geo.attributes.position;
    const base = new Float32Array(p.count * 2);
    const col = new Float32Array(p.count * 3);
    const shallow = C(0x3f8790);
    const deep = C(0x1b4d74);
    const cc = new THREE.Color();
    const rr = rng(77);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i) + (rr() - 0.5) * 1.4;
      const z = p.getZ(i) + (rr() - 0.5) * 1.4;
      p.setX(i, x);
      p.setZ(i, z);
      base[i * 2] = x;
      base[i * 2 + 1] = z;
      cc.lerpColors(shallow, deep, clamp01((z - coastZ(x)) / 18));
      col.set([cc.r, cc.g, cc.b], i * 3);
    }
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const water = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        flatShading: true,
        roughness: 0.15,
        metalness: 0.05,
        envMapIntensity: 1.4,
      }),
    );
    water.position.y = -0.06;
    water.receiveShadow = true;
    ground.add(water);
    out.water = water;
    let rough = 0.35;
    out.setSea = (k) => (rough = k);
    onFrame((t) => {
      for (let i = 0; i < p.count; i++) {
        const x = base[i * 2];
        const z = base[i * 2 + 1];
        p.setY(
          i,
          Math.sin(x * 0.35 + t * 1.1) * 0.06 * rough * 3 +
            Math.cos(z * 0.41 - t * 0.9) * 0.05 * rough * 3,
        );
      }
      p.needsUpdate = true;
      geo.computeVertexNormals();
    });
  }

  // --- materials of the city
  const PLASTER = [
    ["#e6d6b8", "#9c3a2a"],
    ["#d9b98a", "#7a2f22"],
    ["#c98a5a", "#5a2a1e"],
    ["#efe4cc", "#a8432f"],
    ["#d6a77a", "#3d4a3a"],
    ["#e8cfa0", "#8a3a26"],
  ];
  const wallMats = PLASTER.map(
    ([u, d], i) => new THREE.MeshStandardMaterial({ map: wallTex(u, d, 11 + i), roughness: 0.93 }),
  );
  const roofMats = ["#b5573a", "#a84c30", "#c0663f", "#9a4a32"].map(
    (c, i) => new THREE.MeshStandardMaterial({ map: roofTex(c, 3 + i), roughness: 0.8 }),
  );
  out.roofMats = roofMats;
  const stoneMat = real.plastic(0xd9cdb4, { roughness: 0.85, clearcoat: 0 });

  const city = new THREE.Group();
  ground.add(city);
  out.city = city;

  // street paving inside the walls
  {
    const t = pavingTex();
    t.repeat.set(16, 12);
    const pave = new THREE.Mesh(
      new THREE.CircleGeometry(1, 64),
      new THREE.MeshStandardMaterial({
        map: t,
        roughness: 0.82,
        color: ruins ? 0xc8bfb0 : 0xe6d8c4,
      }),
    );
    pave.rotation.x = -Math.PI / 2;
    pave.scale.set(16.3, 11.5, 1);
    pave.position.set(1.5, 0.012, 0);
    pave.receiveShadow = true;
    city.add(pave);
    // the forum's travertine floor
    const ft = slabTex("#c9c0ae", "#9c9280", 10, 9);
    ft.repeat.set(2, 6);
    const fl = new THREE.Mesh(
      worldBox(FORUM.x1 - FORUM.x0, 0.03, FORUM.z1 - FORUM.z0),
      new THREE.MeshStandardMaterial({ map: ft, roughness: 0.7, color: 0xd6cfc2 }),
    );
    fl.position.set(0, 0.03, (FORUM.z0 + FORUM.z1) / 2);
    fl.receiveShadow = true;
    city.add(fl);
  }

  // --- houses on a street grid
  const houses = [];
  const roofs = [];
  const SX = 3.3;
  const SZ = 4.4;
  for (let ix = -6; ix <= 6; ix++)
    for (let iz = -3; iz <= 3; iz++) {
      const bx = 1.5 + ix * SX + (iz % 2 ? 0.4 : 0);
      const bz = iz * SZ + 0.2;
      const bw = SX - 0.58;
      const bd = SZ - 0.58;
      if (!inCity(bx + Math.sign(bx - 1.5) * bw * 0.45, bz + Math.sign(bz) * bd * 0.45)) continue;
      if (
        bx + bw / 2 > FORUM.x0 - 0.5 &&
        bx - bw / 2 < FORUM.x1 + 0.5 &&
        bz + bd / 2 > FORUM.z0 - 2 &&
        bz - bd / 2 < FORUM.z1 + 0.3
      )
        continue;
      if (Math.hypot(bx - AMPHI.x, bz - AMPHI.z) < 4.2) continue;
      // kerb / block base
      const kb = new THREE.Mesh(
        roundedBox(bw + 0.14, 0.05, bd + 0.14, 0.02),
        real.plastic(0xa49c8e, { roughness: 0.9, clearcoat: 0 }),
      );
      kb.position.set(bx, 0.025, bz);
      kb.receiveShadow = true;
      city.add(kb);
      // split the block into 2–4 houses
      const nx = r() < 0.5 ? 1 : 2;
      const nz = 2 + (r() < 0.4 ? 1 : 0);
      for (let a = 0; a < nx; a++)
        for (let b = 0; b < nz; b++) {
          const hw = bw / nx - 0.03;
          const hd = bd / nz - 0.03;
          const hx = bx - bw / 2 + (a + 0.5) * (bw / nx);
          const hz = bz - bd / 2 + (b + 0.5) * (bd / nz);
          const tall = 0.42 + r() * 0.32;
          const h = ruins ? tall * (0.45 + r() * 0.35) : tall;
          const wm = wallMats[Math.floor(r() * wallMats.length)];
          const wall = new THREE.Mesh(worldBox(hw, h, hd, 0.015), wm);
          wall.position.set(hx, 0.05 + h / 2, hz);
          wall.castShadow = wall.receiveShadow = true;
          city.add(wall);
          const house = { x: hx, z: hz, w: hw, d: hd, h, wall, roof: null };
          if (!ruins) {
            const along = hw > hd;
            const rm = roofMats[Math.floor(r() * roofMats.length)];
            const rh = Math.min(hw, hd) * 0.28;
            const rg = along
              ? gableGeo(hw + 0.08, hd + 0.08, rh)
              : gableGeo(hd + 0.08, hw + 0.08, rh);
            const roof = new THREE.Mesh(rg, rm);
            if (!along) roof.rotation.y = Math.PI / 2;
            roof.position.set(hx, 0.05 + h, hz);
            roof.castShadow = roof.receiveShadow = true;
            roof.userData = {
              y0: roof.position.y,
              rx: (r() - 0.5) * 0.5,
              rz: (r() - 0.5) * 0.5,
              at: r(),
            };
            city.add(roof);
            house.roof = roof;
            roofs.push(roof);
          } else if (r() < 0.25) {
            // a few rooms have been roofed again for visitors
            const roof = new THREE.Mesh(gableGeo(hw + 0.06, hd + 0.06, 0.12), roofMats[0]);
            roof.position.set(hx, 0.05 + h, hz);
            roof.castShadow = true;
            city.add(roof);
          }
          houses.push(house);
        }
    }
  out.houses = houses;
  out.roofs = roofs;

  // scaffolding on a few houses still under repair after the quake of 62
  if (living) {
    const near = houses
      .filter((h) => h.z > 0 && h.z < 2.2 && h.x > 2.5 && h.x < 9.5 && h.d < 2.2)
      .slice(0, 3);
    out.scaffold = near;
    const pole = real.wood(0x8a6a44, { roughness: 0.85 });
    for (const h of near) {
      const sg = new THREE.Group();
      for (let i = 0; i < 4; i++) {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, h.h + 0.25, 5), pole);
        p.position.set(-h.w / 2 + (i * h.w) / 3, (h.h + 0.25) / 2, h.d / 2 + 0.08);
        sg.add(p);
      }
      for (let j = 1; j < 3; j++) {
        const b = new THREE.Mesh(roundedBox(h.w, 0.012, 0.1, 0.004), pole);
        b.position.set(0, (j * h.h) / 2.5, h.d / 2 + 0.08);
        sg.add(b);
      }
      sg.position.set(h.x, 0.05, h.z);
      shadowAll(sg);
      city.add(sg);
    }
  }

  // --- the forum: temple of Jupiter (Vesuvius right behind it), colonnades,
  // statue bases, the basilica, the temple of Apollo
  const roofForum = roofMats[1];
  const tj = temple({ roof: roofForum });
  tj.position.set(0, 0.03, FORUM.z0 - 1.25);
  city.add(tj);
  out.temple = tj;
  if (ruins || buried) {
    // today: the temple stands as podium + broken column stumps
    tj.traverse((o) => {
      if (o.isMesh && o.position.y > 0.6) o.visible = false;
    });
  }
  for (const sx of [-1, 1]) {
    const c = colonnade(FORUM.z1 - FORUM.z0 - 0.4, 0.55, stoneMat, roofForum, { along: "z" });
    c.position.set(sx * (FORUM.x1 + 0.05), 0.04, (FORUM.z0 + FORUM.z1) / 2);
    if (sx > 0) c.rotation.y = Math.PI;
    if (ruins || buried) c.children.forEach((o, i) => i > 0 && (o.visible = false));
    city.add(c);
  }
  {
    const c = colonnade(FORUM.x1 - FORUM.x0, 0.55, stoneMat, roofForum, { along: "x" });
    c.position.set(0, 0.04, FORUM.z1 + 0.05);
    c.rotation.y = Math.PI;
    if (ruins || buried) c.children.forEach((o, i) => i > 0 && (o.visible = false));
    city.add(c);
  }
  for (let i = 0; i < 5; i++) {
    const ped = new THREE.Mesh(roundedBox(0.16, 0.22, 0.26, 0.02), stoneMat);
    ped.position.set(-1.0 + (i % 2) * 2.0, 0.14, -2.6 + i * 1.5);
    ped.castShadow = true;
    city.add(ped);
    if (!ruins) {
      const st = makePerson({ coat: 0x6f7a5a, skin: 0x6f7a5a, hair: 0x6f7a5a, scale: 1.5 });
      st.traverse((o) => o.isMesh && (o.material = real.metal(0x5f7058, { roughness: 0.5 })));
      st.position.set(ped.position.x, 0.25, ped.position.z);
      st.rotation.y = (Math.PI / 2) * (i % 2 ? -1 : 1);
      city.add(st);
    }
  }
  // basilica (south-west) and temple of Apollo (west of the forum)
  {
    const bas = new THREE.Mesh(worldBox(2.6, 0.85, 4.2, 0.02), wallMats[3]);
    bas.position.set(-4.2, 0.05 + 0.425, 3.6);
    bas.castShadow = bas.receiveShadow = true;
    city.add(bas);
    if (!ruins) {
      const br = new THREE.Mesh(gableGeo(4.3, 2.7, 0.5), roofMats[2]);
      br.rotation.y = Math.PI / 2;
      br.position.set(-4.2, 0.9, 3.6);
      br.castShadow = true;
      city.add(br);
    }
    const ta = temple({ w: 1.3, d: 2.0, podium: 0.28, colH: 0.75, roof: roofMats[0] });
    ta.position.set(-4.0, 0.03, -2.4);
    ta.rotation.y = Math.PI / 2;
    if (ruins) ta.traverse((o) => o.isMesh && o.position.y > 0.5 && (o.visible = false));
    city.add(ta);
  }

  // --- the amphitheatre (south-east corner)
  {
    const g = new THREE.Group();
    const outer = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 0.8, 64, 1, true),
      new THREE.MeshStandardMaterial({
        map: wallTex("#cdb894", "#9a8a70", 31),
        roughness: 0.92,
        side: THREE.DoubleSide,
      }),
    );
    outer.geometry.translate(0, 0.4, 0);
    const ouv = outer.geometry.attributes.uv;
    for (let i = 0; i < ouv.count; i++) ouv.setXY(i, ouv.getX(i) * 14, ouv.getY(i) * 0.8);
    outer.scale.set(2.9, 1, 2.15);
    g.add(outer);
    const seats = new THREE.Mesh(
      new THREE.CylinderGeometry(0.97, 0.52, 0.72, 64, 8, true),
      real.plastic(0xc9b89a, { roughness: 0.95, clearcoat: 0, side: THREE.DoubleSide }),
    );
    seats.position.y = 0.42;
    seats.scale.set(2.9, 1, 2.15);
    g.add(seats);
    // seat rows: thin rings
    for (let i = 0; i < 7; i++) {
      const k = i / 7;
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.55 + k * 0.42, 0.006, 4, 64),
        real.plastic(0x9a8a70, { roughness: 1, clearcoat: 0 }),
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.08 + k * 0.72;
      ring.scale.set(2.9, 2.15, 1);
      g.add(ring);
    }
    const arena = new THREE.Mesh(
      new THREE.CircleGeometry(1, 48),
      real.plastic(0xd8c49a, { roughness: 1, clearcoat: 0 }),
    );
    arena.rotation.x = -Math.PI / 2;
    arena.scale.set(1.5, 1.1, 1);
    arena.position.y = 0.06;
    g.add(arena);
    // spectators (only on a living day, set visible per chapter)
    const crowdGeo = new THREE.CapsuleGeometry(0.018, 0.03, 2, 6);
    const crowd = new THREE.InstancedMesh(
      crowdGeo,
      new THREE.MeshStandardMaterial({ roughness: 1 }),
      900,
    );
    const m4 = new THREE.Matrix4();
    const cc = new THREE.Color();
    for (let i = 0; i < 900; i++) {
      const k = r();
      const a = r() * Math.PI * 2;
      const rad = 0.58 + k * 0.38;
      m4.makeTranslation(Math.cos(a) * rad * 2.9, 0.14 + k * 0.66, Math.sin(a) * rad * 2.15);
      crowd.setMatrixAt(i, m4);
      crowd.setColorAt(i, cc.set(TUNICS[Math.floor(r() * TUNICS.length)]));
    }
    crowd.visible = false;
    g.add(crowd);
    out.crowd = crowd;
    g.position.copy(AMPHI);
    shadowAll(g);
    city.add(g);
    out.amphi = g;
  }

  // --- the city wall with towers and gates
  {
    const wm = real.plastic(0xb5a688, { roughness: 0.95, clearcoat: 0 });
    const gates = [0.0, 1.55, 3.3, 4.75];
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      if (gates.some((ga) => Math.abs(((a - ga + Math.PI * 3) % (Math.PI * 2)) - Math.PI) < 0.06))
        continue;
      const x = 1.5 + Math.cos(a) * 16.6;
      const z = Math.sin(a) * 11.8;
      const nx = 1.5 + Math.cos(a + 0.09) * 16.6;
      const nz = Math.sin(a + 0.09) * 11.8;
      const len = Math.hypot(nx - x, nz - z);
      const hgt = ruins ? 0.45 : 0.75;
      const seg = new THREE.Mesh(roundedBox(len + 0.05, hgt, 0.32, 0.03), wm);
      seg.position.set((x + nx) / 2, hgt / 2, (z + nz) / 2);
      seg.rotation.y = -Math.atan2(nz - z, nx - x);
      seg.castShadow = seg.receiveShadow = true;
      city.add(seg);
      if (i % 8 === 4) {
        const tw = new THREE.Mesh(roundedBox(0.6, hgt + 0.4, 0.6, 0.04), wm);
        tw.position.set(x, (hgt + 0.4) / 2, z);
        tw.rotation.y = seg.rotation.y;
        tw.castShadow = true;
        city.add(tw);
      }
    }
  }

  // --- the bakery front + oven chimney smoke, the snack-bar counter
  {
    const bk = new THREE.Group();
    const oven = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      real.ceramic
        ? real.ceramic(0xa8603e, { roughness: 0.9 })
        : real.plastic(0xa8603e, { roughness: 0.9, clearcoat: 0 }),
    );
    oven.position.set(0.1, 0.05, 0);
    bk.add(oven);
    for (let i = 0; i < 2; i++) {
      const mill = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.08, 0.16, 16),
        real.plastic(0x4a4642, { roughness: 0.9, clearcoat: 0 }),
      );
      mill.position.set(-0.25 + i * 0.16, 0.13, 0.25);
      bk.add(mill);
      const top = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.05, 0.12, 16), mill.material);
      top.position.set(-0.25 + i * 0.16, 0.27, 0.25);
      bk.add(top);
    }
    bk.position.copy(BAKERY).add(V(0.6, 0, 0));
    shadowAll(bk);
    out.bakeryFront = bk;
  }
  {
    // thermopolium: L-shaped counter with painted front and sunken jars
    const g = new THREE.Group();
    const front = new THREE.MeshStandardMaterial({
      map: canvasTex(
        256,
        128,
        (c, w, h) => {
          const rr = rng(23);
          c.fillStyle = "#e6dccb";
          c.fillRect(0, 0, w, h);
          for (let i = 0; i < 160; i++) {
            c.fillStyle = ["#7a8a6a", "#b86a4a", "#9a9aa8", "#d8c49a", "#5a6a7a", "#c8b8a8"][i % 6];
            c.beginPath();
            const x = rr() * w;
            const y = rr() * h * 0.8;
            const sz = 4 + rr() * 12;
            c.moveTo(x, y);
            c.lineTo(x + sz, y + rr() * 4);
            c.lineTo(x + sz * 0.7, y + sz * 0.8);
            c.lineTo(x - 2, y + sz * 0.6);
            c.fill();
          }
          c.fillStyle = "#8a3a26";
          c.fillRect(0, h * 0.84, w, h * 0.16);
        },
        { repeat: false },
      ),
      roughness: 0.6,
    });
    const top = real.plastic(0xe8e2d6, { roughness: 0.35, clearcoat: 0.3 });
    const a = new THREE.Mesh(roundedBox(0.7, 0.1, 0.16, 0.015), [
      front,
      front,
      top,
      top,
      front,
      front,
    ]);
    a.position.set(0, 0.05, 0);
    g.add(a);
    const b = new THREE.Mesh(roundedBox(0.16, 0.1, 0.4, 0.015), [
      front,
      front,
      top,
      top,
      front,
      front,
    ]);
    b.position.set(0.27, 0.05, -0.2);
    g.add(b);
    for (let i = 0; i < 3; i++) {
      const jar = new THREE.Mesh(
        new THREE.TorusGeometry(0.028, 0.008, 8, 16),
        real.plastic(0x9a4a2a, { roughness: 0.8 }),
      );
      jar.rotation.x = Math.PI / 2;
      jar.position.set(-0.22 + i * 0.18, 0.102, 0);
      g.add(jar);
    }
    if (living) {
      const v = makePerson({ coat: 0xa8432f });
      v.position.set(0.05, 0, -0.22);
      v.rotation.y = -Math.PI / 2;
      g.add(v);
      for (let i = 0; i < 2; i++) {
        const c = makePerson({ coat: [0x6f7f8c, 0xd8c8a8][i] });
        c.position.set(-0.15 + i * 0.25, 0, 0.2);
        c.rotation.y = Math.PI / 2;
        g.add(c);
      }
    }
    g.position.copy(THERMO).add(V(0, 0.05, 0));
    shadowAll(g);
    if (!buried) city.add(g);
    out.thermo = g;
  }

  // --- trees: stone pines and cypresses around the city, olives in the fields
  const swayers = [];
  for (let i = 0; i < 90; i++) {
    const a = r() * Math.PI * 2;
    const d = 19 + r() * 26;
    const x = 1.5 + Math.cos(a) * d * 1.2;
    const z = Math.sin(a) * d * 0.9;
    if (z - coastZ(x) > -2.5) continue;
    const y = heightAt(x, z);
    if (y > 8) continue;
    const tr =
      r() < 0.55
        ? stonePine(0.8 + r() * 0.6, i)
        : r() < 0.5
          ? cypress(0.8 + r() * 0.7, i)
          : olive(1 + r() * 0.5, i);
    tr.position.set(x, y, z);
    tr.rotation.y = r() * 6;
    ground.add(tr);
    swayers.push(tr);
  }
  // a few pines inside the city gardens
  for (let i = 0; i < 10; i++) {
    const h = houses[Math.floor(r() * houses.length)];
    if (!h) continue;
    const tr = stonePine(0.55 + r() * 0.2, 90 + i);
    tr.position.set(h.x + h.w * 0.25, 0.05, h.z + h.d * 0.3);
    if (!buried) city.add(tr);
    swayers.push(tr);
  }
  // vineyards: rows on the lower slopes of the mountain and in the fields
  {
    const n = 320;
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const im = new THREE.InstancedMesh(geo, flat(0x5a7a36, { roughness: 1 }), n);
    const m4 = new THREE.Matrix4();
    let k = 0;
    const rr = rng(55);
    for (let tries = 0; tries < 20000 && k < n; tries++) {
      const a = Math.PI * (0.3 + rr() * 0.4);
      const d = 14 + rr() * 22;
      const x = VES.x + Math.cos(a) * d * (rr() < 0.5 ? 1 : -1);
      const z = VES.z + Math.sin(a) * d;
      const y = heightAt(x, z);
      if (y < 0.4 || y > 9 || z - coastZ(x) > -3) continue;
      if (Math.hypot(x, z) < 22) continue;
      m4.compose(
        V(x, y + 0.08, z),
        new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), -Math.atan2(z - VES.z, x - VES.x)),
        V(0.7, 0.14, 0.08),
      );
      im.setMatrixAt(k++, m4);
    }
    im.count = k;
    im.castShadow = true;
    im.receiveShadow = true;
    ground.add(im);
    out.vines = im;
  }
  onFrame((t) => {
    for (const tr of swayers) {
      const c = tr.userData.crown ?? tr.children[tr.children.length - 1];
      c.rotation.z = Math.sin(t * 0.8 + tr.position.x) * 0.02;
    }
  });

  // --- Herculaneum on the coast + its boat houses, Stabiae villa, Misenum
  {
    const hg = new THREE.Group();
    const hr = rng(91);
    for (let i = 0; i < 26; i++) {
      const x = (hr() - 0.5) * 7;
      const z = -hr() * 4.5;
      const h = 0.4 + hr() * 0.4;
      const w = new THREE.Mesh(
        worldBox(0.9 + hr() * 0.6, h, 0.8 + hr() * 0.5, 0.015),
        wallMats[Math.floor(hr() * 6)],
      );
      w.position.set(x, h / 2, z);
      hg.add(w);
      if (!ruins) {
        const rf = new THREE.Mesh(gableGeo(1.6, 1.4, 0.22), roofMats[Math.floor(hr() * 4)]);
        rf.scale.set(w.geometry.parameters ? 1 : 0.7, 1, 0.7);
        rf.position.set(x, h, z);
        hg.add(rf);
      }
    }
    // sea wall with arched boat houses (fornici)
    const sw = real.plastic(0x9a8c74, { roughness: 0.95, clearcoat: 0 });
    for (let i = 0; i < 9; i++) {
      const pier = new THREE.Mesh(roundedBox(0.18, 0.7, 0.6, 0.03), sw);
      pier.position.set(-3.6 + i * 0.9, 0.35, 1.3);
      hg.add(pier);
      if (i < 8) {
        const arch = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.09, 8, 16, Math.PI), sw);
        arch.position.set(-3.15 + i * 0.9, 0.55, 1.3);
        hg.add(arch);
        const dark = new THREE.Mesh(
          new THREE.PlaneGeometry(0.72, 0.7),
          new THREE.MeshBasicMaterial({ color: 0x1a1612 }),
        );
        dark.position.set(-3.15 + i * 0.9, 0.3, 1.05);
        hg.add(dark);
      }
    }
    const top = new THREE.Mesh(roundedBox(8.4, 0.12, 1.2, 0.03), sw);
    top.position.set(0, 0.95, 1.2);
    hg.add(top);
    const y = heightAt(HERC.x, HERC.z);
    hg.position.set(HERC.x, Math.max(0, y), HERC.z);
    hg.rotation.y = -0.65;
    shadowAll(hg);
    if (!buried) ground.add(hg);
    out.herc = hg;
  }
  {
    const sg = new THREE.Group();
    const v = new THREE.Mesh(worldBox(2.2, 0.5, 1.4, 0.02), wallMats[3]);
    v.position.y = 0.25;
    sg.add(v);
    const vr = new THREE.Mesh(gableGeo(2.3, 1.5, 0.3), roofMats[2]);
    vr.position.y = 0.5;
    sg.add(vr);
    const c = colonnade(2.2, 0.4, stoneMat, roofMats[2], { along: "x", spacing: 0.3, depth: 0.4 });
    c.position.set(0, 0, 0.95);
    sg.add(c);
    sg.position.set(STAB.x, Math.max(0, heightAt(STAB.x, STAB.z)), STAB.z);
    sg.rotation.y = 0.15;
    shadowAll(sg);
    ground.add(sg);
    out.stabiae = sg;
  }
  {
    // Misenum: a villa terrace on the headland, where the young Pliny watches
    const mg = new THREE.Group();
    const terr = new THREE.Mesh(roundedBox(3, 0.25, 2, 0.04), stoneMat);
    terr.position.y = 0.12;
    mg.add(terr);
    const vill = new THREE.Mesh(worldBox(2.2, 0.55, 1.0, 0.02), wallMats[0]);
    vill.position.set(0, 0.52, -0.6);
    mg.add(vill);
    const vr = new THREE.Mesh(gableGeo(2.3, 1.1, 0.25), roofMats[0]);
    vr.position.set(0, 0.8, -0.6);
    mg.add(vr);
    for (let i = 0; i < 7; i++) {
      const bal = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.12, 8), stoneMat);
      bal.position.set(-1.2 + i * 0.4, 0.31, 0.95);
      mg.add(bal);
    }
    const rail = new THREE.Mesh(roundedBox(2.8, 0.03, 0.06, 0.01), stoneMat);
    rail.position.set(0, 0.38, 0.95);
    mg.add(rail);
    const boy = makePerson({ coat: 0xe9e0cc, scale: 1.0 });
    boy.position.set(0.3, 0.25, 0.7);
    boy.rotation.y = 2.4;
    mg.add(boy);
    out.pliny = boy;
    const pine = stonePine(1.1, 7);
    pine.position.set(-1.3, 0.25, 0.3);
    mg.add(pine);
    const top = heightAt(MISENUM.x + 2, MISENUM.z - 2);
    mg.position.set(MISENUM.x + 2, top, MISENUM.z - 2);
    mg.rotation.y = -2.2;
    shadowAll(mg);
    ground.add(mg);
    out.misenum = mg;
  }

  // --- modern towns on the slopes today (the red zone)
  if (ruins) {
    const tg = new THREE.Group();
    const rr = rng(66);
    const mats = [0xeee6d8, 0xe8d8bc, 0xf2efe8, 0xd9c8a8].map((c) =>
      real.plastic(c, { roughness: 0.9, clearcoat: 0 }),
    );
    for (let i = 0; i < 520; i++) {
      const a = Math.PI * (0.05 + rr() * 0.9);
      const d = 20 + rr() * 22;
      const x = VES.x + Math.cos(a) * d * 1.1;
      const z = VES.z + Math.sin(a) * d;
      if (Math.hypot(x - 1.5, z) < 21) continue;
      if (z - coastZ(x) > -1.5) continue;
      const y = heightAt(x, z);
      if (y > 7) continue;
      const h = 0.25 + rr() * 0.4;
      const b = new THREE.Mesh(
        roundedBox(0.35 + rr() * 0.3, h, 0.35 + rr() * 0.3, 0.02),
        mats[i % 4],
      );
      b.position.set(x, y + h / 2, z);
      b.rotation.y = rr() * 3;
      tg.add(b);
    }
    shadowAll(tg);
    ground.add(tg);
    out.towns = tg;
  }

  // --- ash: the pumice layer (rises over the city) and the buried plain
  {
    const geo = new THREE.CircleGeometry(1, 72, 0, Math.PI * 2);
    const g2 = facet(jitter(new THREE.PlaneGeometry(36, 26, 60, 44), 0.04, 3), 0.05, 6);
    g2.rotateX(-Math.PI / 2);
    const p = g2.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const z = p.getZ(i);
      p.setY(i, (noise2(x * 0.8, z * 0.8, 2) - 0.5) * 0.05);
    }
    g2.computeVertexNormals();
    patches(g2, { amt: 0.06, scale: 0.4, seed: 4 });
    const pm = new THREE.Mesh(g2, facetMat(flat(0xc4b496, { roughness: 1 })));
    pm.position.set(1.5, -1, 0);
    pm.receiveShadow = true;
    city.add(pm);
    out.pumiceLayer = pm;
    geo.dispose();
    out.setPumice = (level) => {
      pm.visible = level > 0.005;
      pm.position.y = 0.04 + level;
    };
  }
  if (buried) {
    // the plain over the city: fields, a farmhouse, olive trees — or the
    // forum dug out in "grabung"
    const shape = new THREE.Shape();
    shape.absarc(0, 0, 1, 0, Math.PI * 2, false);
    const sx = 19;
    const sz = 14;
    const sh = new THREE.Shape();
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      const pt = [1.5 + Math.cos(a) * sx, Math.sin(a) * sz];
      if (i === 0) sh.moveTo(...pt);
      else sh.lineTo(...pt);
    }
    if (state === "grabung") {
      const hole = new THREE.Path();
      const pts = [
        [-2.7, -7.6],
        [2.7, -7.6],
        [3.1, 6.1],
        [-2.9, 6.3],
      ];
      hole.moveTo(pts[0][0], -pts[0][1]);
      for (let i = pts.length - 1; i >= 1; i--) hole.lineTo(pts[i][0], -pts[i][1]);
      hole.closePath();
      sh.holes.push(hole);
    }
    const geo = new THREE.ShapeGeometry(sh, 24);
    geo.rotateX(-Math.PI / 2);
    const plain = new THREE.Mesh(
      patches(facet(geo, 0.05, 3), { amt: 0.08, scale: 0.15, seed: 8 }),
      facetMat(flat(0x7f8f4a, { roughness: 1 })),
    );
    plain.position.y = 0.95;
    plain.receiveShadow = true;
    ground.add(plain);
    // the side of the dig: a cut through the layers
    if (state === "grabung") {
      const wallM = real.plastic(0x8f8170, { roughness: 1, clearcoat: 0 });
      const pts = [
        [-2.7, -7.6],
        [2.7, -7.6],
        [3.1, 6.1],
        [-2.9, 6.3],
      ];
      for (let i = 0; i < 4; i++) {
        const [ax, az] = pts[i];
        const [bx, bz] = pts[(i + 1) % 4];
        const len = Math.hypot(bx - ax, bz - az);
        const w = new THREE.Mesh(roundedBox(len, 0.92, 0.12, 0.02), wallM);
        w.position.set((ax + bx) / 2, 0.48, (az + bz) / 2);
        w.rotation.y = -Math.atan2(bz - az, bx - ax);
        w.castShadow = w.receiveShadow = true;
        ground.add(w);
      }
    }
    // fields on top: furrows + a farmhouse + olives
    const rr = rng(13);
    for (let i = 0; i < 26; i++) {
      const x = 1.5 + (rr() - 0.5) * 30;
      const z = (rr() - 0.5) * 20;
      if (state === "grabung" && x > -4 && x < 4.5 && z > -8.5 && z < 7.5) continue;
      if (((x - 1.5) / 18) ** 2 + (z / 13) ** 2 > 1) continue;
      const o = olive(1.1 + rr() * 0.4, 200 + i);
      o.position.set(x, 0.95, z);
      ground.add(o);
    }
    const fh = new THREE.Mesh(worldBox(1.2, 0.5, 0.8, 0.02), wallMats[0]);
    fh.position.set(9, 1.2, -3);
    fh.castShadow = true;
    ground.add(fh);
    const fr = new THREE.Mesh(gableGeo(1.3, 0.9, 0.22), roofMats[3]);
    fr.position.set(9, 1.45, -3);
    ground.add(fr);
    city.visible = state === "grabung";
    if (state === "grabung") {
      // only the dug-out forum shows; the rest of the city stays under the plain
      city.traverse((o) => {
        if (!o.isMesh && !o.isInstancedMesh) return;
        const wp = new THREE.Vector3();
        o.getWorldPosition(wp);
        if (!(wp.x > -2.8 && wp.x < 3.1 && wp.z > -7.6 && wp.z < 6.2)) o.visible = false;
      });
    }
    out.plain = plain;
  }
  if (ruins) {
    // weeds between the stones
    const rr = rng(71);
    for (let i = 0; i < 60; i++) {
      const h = houses[Math.floor(rr() * houses.length)];
      const b = new THREE.Mesh(
        facet(new THREE.IcosahedronGeometry(0.08, 0), 0.1, i),
        leafMat(0x6f8a3a),
      );
      b.position.set(h.x + (rr() - 0.5) * h.w, 0.08, h.z + h.d / 2 + 0.12);
      b.scale.set(1, 0.6, 1);
      city.add(b);
    }
  }

  // --- people in the streets (positions are a function of t, set per chapter)
  const people = [];
  if (living) {
    for (let i = 0; i < 46; i++) {
      const p = makePerson({
        coat: TUNICS[i % TUNICS.length],
        skin: [0xc99a74, 0xb08060, 0xd8ae88][i % 3],
        scale: 1,
      });
      const inForum = i < 26;
      p.userData = {
        inForum,
        x0: inForum ? (r() - 0.5) * 2.6 : 0,
        z0: inForum ? FORUM.z0 + 0.5 + r() * (FORUM.z1 - FORUM.z0 - 1) : 0,
        dir: r() * Math.PI * 2,
        sp: 0.05 + r() * 0.06,
        ph: r() * 10,
        street: r() < 0.55 ? 0 : Math.floor(r() * 5),
      };
      city.add(p);
      people.push(p);
    }
  }
  out.people = people;
  out.peopleAt = (t, k = 1) => {
    for (const p of people) {
      const u = p.userData;
      p.visible = k > 0.5;
      if (!p.visible) continue;
      if (u.inForum) {
        // wander back and forth across the forum
        const s = Math.sin((t + u.ph) * u.sp * 2) * 1.0;
        const x = u.x0 + Math.cos(u.dir) * s;
        const z = u.z0 + Math.sin(u.dir) * s;
        p.position.set(Math.max(-1.5, Math.min(1.5, x)), 0.045, z);
        p.rotation.y = -u.dir + (Math.cos((t + u.ph) * u.sp * 2) > 0 ? 0 : Math.PI) + Math.PI / 2;
        walk(p, (t + u.ph) * 2.2, 0.8);
      } else {
        // along the main east–west street (z ≈ 2.4) and the north–south one (x ≈ 4.4)
        const lane = [2.4 + (((u.ph * 7) % 1) - 0.5) * 0.3, -2.0, 6.8, 2.6, -6.4][u.street];
        const L = 22;
        const s = ((((t * u.sp * 3 + u.ph * 3) % L) + L) % L) - L / 2;
        if (u.street % 2 === 0) {
          p.position.set(1.5 + s * (u.dir > Math.PI ? 1 : -1), 0.045, lane + (u.ph % 1) * 0.2);
          p.rotation.y = u.dir > Math.PI ? 0 : Math.PI;
        } else {
          p.position.set(lane + 2, 0.045, s * 0.45 * (u.dir > Math.PI ? 1 : -1));
          p.rotation.y = u.dir > Math.PI ? -Math.PI / 2 : Math.PI / 2;
        }
        walk(p, (t + u.ph) * 2.2, 1);
      }
    }
  };

  // --- the eruption
  if (wantColumn && living) {
    out.column = makeColumn();
    scene.add(out.column);
    out.lightning = makeLightning();
    scene.add(out.lightning);
    out.pumice = makePumice();
    scene.add(out.pumice);
  }
  out.flow = (to, opts = {}) => {
    const f = makeFlow(slopePath(to, opts), opts);
    scene.add(f);
    return f;
  };
  // roofs give way under the pumice: each roof sinks at its own moment
  out.collapse = (t, t0, t1, center = V(0, 0, 0), radius = 8, share = 0.4) => {
    for (const rf of roofs) {
      const u = rf.userData;
      const d = Math.hypot(rf.position.x - center.x, rf.position.z - center.z);
      if (d > radius || u.at > share) {
        rf.position.y = u.y0;
        rf.rotation.x = rf.rotation.z = 0;
        continue;
      }
      const at = t0 + (u.at / share) * (t1 - t0);
      const k = sm((t - at) / 0.5);
      rf.position.y = u.y0 - k * 0.32;
      rf.rotation.x = u.rx * k;
      rf.rotation.z = u.rz * k;
    }
  };
  // roofs and streets grey over with pumice dust
  const roofBase = roofMats.map((m) => m.color.clone());
  out.dust = (k) => {
    roofMats.forEach((m, i) => m.color.copy(roofBase[i]).lerp(C(0xb8ae9c), k * 0.8));
    wallMats.forEach((m) => m.color.setRGB(1 - k * 0.25, 1 - k * 0.27, 1 - k * 0.3));
  };

  const baseMood = makeMood(cap);
  out.mood = (name, k) => {
    baseMood(name, k);
    if (out.water) {
      const d = name === "dunkel" || name === "morgen" ? clamp01(k) : 0;
      out.water.material.roughness = 0.25 + d * 0.45;
      out.water.material.color.setRGB(1 - d * 0.75, 1 - d * 0.75, 1 - d * 0.72);
      out.water.material.envMapIntensity = 1.4 - d * 1.1;
    }
  };
  finishSet({ ground: time === "dunkel" ? 0x2a2420 : 0x8a8268 });
  out.mood(time, 0);
  return out;
}

// ---------------------------------------------------------------- side sets
// a dark room around a side set (no sky in view, own lights)
function darkRoom(o, r = 14, color = 0x0c0f16) {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(r, 32, 16),
    new THREE.MeshBasicMaterial({ color, side: THREE.BackSide, fog: false }),
  );
  noAO(m);
  m.position.copy(o);
  scene.add(m);
  return m;
}

// the bakery of Modestus: a vaulted brick oven with loaves inside, the mill
// stones, a counter. 1 unit = 1 m. update(t, { fire, charred })
export function buildBakery(o = V(0, -120, 0)) {
  const g = new THREE.Group();
  g.position.copy(o);
  scene.add(g);
  darkRoom(o, 12, 0x120d0a);
  const plaster = new THREE.MeshStandardMaterial({
    map: wallTex("#cdb48e", "#8a3a26", 51),
    roughness: 0.95,
  });
  const floorT = slabTex("#8a7a66", "#5a4c3e", 6, 3);
  floorT.repeat.set(3, 3);
  const floor = new THREE.Mesh(
    worldBox(8, 0.1, 6),
    new THREE.MeshStandardMaterial({ map: floorT, roughness: 0.9 }),
  );
  floor.position.y = -0.05;
  g.add(floor);
  const back = new THREE.Mesh(worldBox(8, 3.2, 0.2), plaster);
  back.position.set(0, 1.6, -2.2);
  g.add(back);
  const side = new THREE.Mesh(worldBox(0.2, 3.2, 6), plaster);
  side.position.set(-3.4, 1.6, 0);
  g.add(side);
  // the oven: a brick block with a domed chamber and an arched mouth
  const brickT = canvasTex(256, 256, (c, w, h) => {
    const rr = rng(17);
    c.fillStyle = "#6a3a26";
    c.fillRect(0, 0, w, h);
    for (let j = 0; j < 16; j++)
      for (let i = 0; i < 8; i++) {
        const v = 120 + rr() * 50;
        c.fillStyle = `rgb(${v + 30},${v * 0.55},${v * 0.38})`;
        c.fillRect(i * 32 + (j % 2) * 16 + 1.5, j * 16 + 1.5, 29, 13);
      }
  });
  brickT.repeat.set(2, 2);
  const brick = new THREE.MeshStandardMaterial({ map: brickT, roughness: 0.92 });
  const block = new THREE.Mesh(roundedBox(2.4, 1.6, 1.8, 0.08), brick);
  block.position.set(0.4, 0.8, -1.3);
  g.add(block);
  const mouth = new THREE.Mesh(
    new THREE.CircleGeometry(0.42, 32, 0, Math.PI),
    new THREE.MeshBasicMaterial({ color: 0x0e0806 }),
  );
  mouth.position.set(0.4, 0.75, -0.39);
  g.add(mouth);
  const mouthLow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.84, 0.0001),
    new THREE.MeshBasicMaterial({ color: 0x0e0806 }),
  );
  mouthLow.position.set(0.4, 0.75, -0.39);
  g.add(mouthLow);
  const arch = new THREE.Mesh(
    new THREE.TorusGeometry(0.46, 0.06, 10, 24, Math.PI),
    real.plastic(0x7a4a30, { roughness: 0.9, clearcoat: 0 }),
  );
  arch.position.set(0.4, 0.75, -0.37);
  g.add(arch);
  const sill = new THREE.Mesh(
    roundedBox(1.2, 0.08, 0.35, 0.02),
    real.plastic(0xb8aa94, { roughness: 0.8, clearcoat: 0 }),
  );
  sill.position.set(0.4, 0.72, -0.25);
  g.add(sill);
  // loaves: round, scored into 8 wedges — on the sill and inside the mouth
  const loafGeo = new THREE.SphereGeometry(0.13, 32, 16);
  loafGeo.scale(1, 0.45, 1);
  const lp = loafGeo.attributes.position;
  for (let i = 0; i < lp.count; i++) {
    const x = lp.getX(i);
    const z = lp.getZ(i);
    const a = Math.atan2(z, x);
    const groove = Math.pow(Math.abs(Math.cos(a * 4)), 18) * 0.012;
    if (lp.getY(i) > 0) lp.setY(i, lp.getY(i) - groove);
  }
  loafGeo.computeVertexNormals();
  const loafMat = real.plastic(0xc8843e, { roughness: 0.75, clearcoat: 0.05 });
  const loaves = [];
  for (let i = 0; i < 7; i++) {
    const l = new THREE.Mesh(loafGeo, loafMat);
    const inOven = i >= 3;
    l.position.set(
      inOven ? 0.12 + (i - 3) * 0.19 : -0.0 + i * 0.3,
      inOven ? 0.82 : 0.82,
      inOven ? -0.58 - (i % 2) * 0.12 : -0.22,
    );
    l.rotation.y = i;
    g.add(l);
    loaves.push(l);
  }
  // fire glow inside the oven
  const glow = noAO(
    new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 16, 8),
      new THREE.MeshBasicMaterial({
        color: 0xff7a2a,
        toneMapped: false,
        transparent: true,
        opacity: 0.8,
      }),
    ),
  );
  glow.scale.set(1.2, 0.35, 1);
  glow.position.set(0.4, 0.8, -0.9);
  g.add(glow);
  const fireL = new THREE.PointLight(0xff8a3a, 6, 6, 1.6);
  fireL.position.set(0.4, 0.95, -0.2);
  g.add(fireL);
  // mill stones (hourglass of grey lava rock)
  const lava = real.plastic(0x55504a, { roughness: 0.95, clearcoat: 0 });
  for (let i = 0; i < 2; i++) {
    const mg = new THREE.Group();
    const meta = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.9, 32), lava);
    meta.position.y = 0.6;
    mg.add(meta);
    const cat = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 0.6, 32, 1, true), lava);
    cat.position.y = 0.95;
    mg.add(cat);
    const cat2 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.3, 0.6, 32, 1, true), lava);
    cat2.position.y = 1.5;
    mg.add(cat2);
    const bse = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.65, 0.2, 32),
      real.plastic(0x8a8070, { roughness: 0.9, clearcoat: 0 }),
    );
    bse.position.y = 0.1;
    mg.add(bse);
    mg.position.set(-1.8 + i * 1.5, 0, 1.4);
    g.add(mg);
  }
  // a window of daylight
  const win = noAO(
    new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.6),
      new THREE.MeshBasicMaterial({ color: 0xffe8c0, toneMapped: false }),
    ),
  );
  win.position.set(-2.2, 2.4, -2.09);
  g.add(win);
  const day = new THREE.PointLight(0xffe2b8, 5, 12, 1.4);
  day.position.set(-1.6, 2.6, 0.6);
  g.add(day);
  const amb = new THREE.HemisphereLight(0xffe2c0, 0x2a1c14, 0.5);
  amb.position.set(0, 3, 0);
  g.add(amb);
  shadowAll(g);
  const raw = C(0xc8843e);
  const black = C(0x1e1612);
  g.userData.update = (t, { fire = 1, charred = 0, ash = 0 } = {}) => {
    glow.material.opacity = 0.8 * fire * (0.85 + 0.15 * Math.sin(t * 9));
    fireL.intensity = 6 * fire * (0.9 + 0.1 * Math.sin(t * 13)) + 0.5;
    loafMat.color.copy(raw).lerp(black, charred);
    loafMat.roughness = lerp(0.75, 0.95, charred);
    day.intensity = 10 * (1 - ash * 0.9);
    amb.intensity = 0.5 * (1 - ash * 0.6);
  };
  g.userData.loaves = loaves;
  return g;
}

// the mountain cut open: strata, the magma chamber, the conduit, gas bubbles;
// beside it the soda-bottle analogy. 1 unit = 100 m (the mountain 1.3 km,
// the chamber a few km down — compressed). update(t, { open, erupt, bottle })
export function buildVolcanoXray(o = V(0, -200, 0)) {
  const g = new THREE.Group();
  g.position.copy(o);
  scene.add(g);
  darkRoom(o.clone().add(V(0, 4, 0)), 60, 0x0a0d14);
  // profile of the mountain (r, y), y = 0 at the surface level
  const prof = [];
  for (let i = 0; i <= 40; i++) {
    const u = i / 40;
    const rr = 0.4 + u * 15;
    const y = 13 * Math.pow(1 - rr / 15.4, 1.5) - (rr < 1.8 ? 0.6 : 0);
    prof.push(new THREE.Vector2(rr, Math.max(0, y)));
  }
  // half mountain (back half) as a lathe, the cut face as a strata shape
  const lat = new THREE.LatheGeometry(prof, 64, Math.PI, Math.PI);
  const mtn = new THREE.Mesh(facet(lat, 0.05, 3), facetMat(flat(0x5e6a3e, { roughness: 1 })));
  g.add(mtn);
  // ground slab under it (the cut through the earth)
  const strata = [0x5a4636, 0x6a5440, 0x4a3a2e, 0x725c46, 0x3e3228];
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Mesh(
      roundedBox(36, 2.4, 0.4, 0.05),
      real.plastic(strata[i], { roughness: 1, clearcoat: 0 }),
    );
    s.position.set(0, -1.2 - i * 2.4, 0.2);
    g.add(s);
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(36, 2.4, 14),
      facetMat(flat(strata[i], { roughness: 1 })),
    );
    top.position.set(0, -1.2 - i * 2.4, -7.2);
    g.add(top);
  }
  // cut face of the cone
  const face = new THREE.Shape();
  face.moveTo(-15.4, 0);
  for (const p of prof.slice().reverse()) face.lineTo(-p.x, p.y);
  for (const p of prof) face.lineTo(p.x, p.y);
  face.lineTo(15.4, 0);
  face.closePath();
  const fg = new THREE.ShapeGeometry(face, 8);
  const fc = new Float32Array(fg.attributes.position.count * 3);
  for (let i = 0; i < fg.attributes.position.count; i++) {
    const y = fg.attributes.position.getY(i);
    const c = C(strata[Math.floor(Math.abs(Math.sin(y * 0.9)) * 4.99)]).multiplyScalar(
      0.85 + 0.15 * Math.sin(y * 3.1),
    );
    fc.set([c.r, c.g, c.b], i * 3);
  }
  fg.setAttribute("color", new THREE.BufferAttribute(fc, 3));
  const faceM = new THREE.Mesh(
    fg,
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, side: THREE.DoubleSide }),
  );
  faceM.position.z = 0.02;
  g.add(faceM);
  // magma chamber + conduit (glowing)
  const magmaMat = new THREE.MeshStandardMaterial({
    color: 0x8a2408,
    emissive: 0xe04a0a,
    emissiveIntensity: 1.0,
    roughness: 0.5,
  });
  const chamber = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), magmaMat);
  chamber.scale.set(5.5, 2.4, 0.5);
  chamber.position.set(0, -8.5, 0.3);
  g.add(chamber);
  const conduitCurve = new THREE.CatmullRomCurve3([
    V(0, -6.4, 0.3),
    V(0.4, -2, 0.3),
    V(-0.2, 4, 0.3),
    V(0, 12.4, 0.3),
  ]);
  const conduit = new THREE.Mesh(new THREE.TubeGeometry(conduitCurve, 48, 0.42, 12), magmaMat);
  conduit.scale.z = 0.4;
  g.add(conduit);
  const glowL = new THREE.PointLight(0xff6a20, 60, 30, 1.6);
  glowL.position.set(0, -6, 4);
  g.add(glowL);
  // gas bubbles inside the magma: rise, grow, burst at the top
  const bubGeo = new THREE.SphereGeometry(1, 16, 10);
  const bubMat = new THREE.MeshStandardMaterial({
    color: 0xffe6b0,
    emissive: 0xffc070,
    emissiveIntensity: 0.8,
    roughness: 0.2,
    transparent: true,
    opacity: 0.9,
  });
  const bubbles = new THREE.InstancedMesh(bubGeo, bubMat, 140);
  noAO(bubbles);
  g.add(bubbles);
  const br = rng(5);
  const B = [];
  for (let i = 0; i < 140; i++)
    B.push({ ph: br(), x: (br() - 0.5) * 9, z: 0.55 + br() * 0.2, s: 0.08 + br() * 0.12 });
  // light key + fill for the cut face
  const key = new THREE.DirectionalLight(0xfff0e0, 2.2);
  key.position.set(8, 20, 24);
  key.target.position.set(0, 0, 0);
  g.add(key);
  g.add(key.target);
  const fill = new THREE.HemisphereLight(0x9ab0ff, 0x2a1a10, 0.8);
  g.add(fill);
  // a column above the crater (small scale)
  const col = makeColumn({ base: V(0, 12.4, 0).add(o), height: 34, n: 320, scale: 0.36 });
  scene.add(col);

  // the soda bottle (analogy) on a little table to the right
  const bt = new THREE.Group();
  bt.position.set(26, 0, 4);
  g.add(bt);
  const table = new THREE.Mesh(
    roundedBox(5, 0.3, 3.2, 0.08),
    real.wood(0x8a6a44, { roughness: 0.6 }),
  );
  table.position.y = 2.8;
  bt.add(table);
  const legM = real.wood(0x6a4a2e);
  for (const [x, z] of [
    [-2.2, -1.3],
    [2.2, -1.3],
    [-2.2, 1.3],
    [2.2, 1.3],
  ]) {
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.8, 12), legM);
    l.position.set(x, 1.4, z);
    bt.add(l);
  }
  const bprof = [];
  const pts = [
    [0, 0],
    [0.55, 0],
    [0.6, 0.1],
    [0.6, 2.0],
    [0.5, 2.5],
    [0.24, 3.1],
    [0.22, 3.5],
    [0.25, 3.55],
    [0.25, 3.62],
  ];
  for (const [x, y] of pts) bprof.push(new THREE.Vector2(x, y));
  const glass = new THREE.Mesh(
    new THREE.LatheGeometry(bprof, 48),
    real.glass
      ? real.glass(0x9fd8b0, { transmission: 0.9, roughness: 0.05, thickness: 0.2 })
      : new THREE.MeshPhysicalMaterial({ color: 0x9fd8b0, transmission: 0.9, roughness: 0.05 }),
  );
  glass.position.y = 2.95;
  bt.add(glass);
  const liquid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.54, 0.54, 2.0, 40),
    new THREE.MeshStandardMaterial({
      color: 0xcfe8d0,
      transparent: true,
      opacity: 0.55,
      roughness: 0.1,
    }),
  );
  liquid.position.y = 2.95 + 1.1;
  bt.add(liquid);
  const capM = new THREE.Mesh(
    new THREE.CylinderGeometry(0.27, 0.27, 0.22, 24),
    real.plastic(0xc8402a, { roughness: 0.4 }),
  );
  capM.position.y = 2.95 + 3.66;
  bt.add(capM);
  const fizz = new THREE.InstancedMesh(
    new THREE.SphereGeometry(1, 10, 8),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      transparent: true,
      opacity: 0.85,
    }),
    220,
  );
  noAO(fizz);
  bt.add(fizz);
  const F = [];
  const fr = rng(9);
  for (let i = 0; i < 220; i++)
    F.push({ ph: fr(), a: fr() * 6.28, rr: fr(), s: 0.03 + fr() * 0.05, v: 0.6 + fr() * 0.8 });
  const spot = new THREE.SpotLight(0xfff4e0, 400, 40, 0.5, 0.6, 1.5);
  spot.position.copy(V(26, 14, 10).add(o));
  spot.target.position.copy(V(26, 4, 4).add(o));
  scene.add(spot);
  scene.add(spot.target);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const sc = new THREE.Vector3();
  const pos = new THREE.Vector3();
  shadowAll(bt);
  g.userData.update = (t, { press = 1, erupt = 0, bottle = 0, colGrow = 0 } = {}) => {
    // bubbles: under pressure few and small; as the pressure drops they grow
    const grow = 1 + erupt * 2.2;
    for (let i = 0; i < 140; i++) {
      const b = B[i];
      const u = (b.ph + t * (0.05 + erupt * 0.25)) % 1;
      // first in the chamber, then up the conduit
      let x;
      let y;
      if (u < 0.45) {
        x = b.x * (1 - (u / 0.45) * 0.9);
        y = -9.5 + (u / 0.45) * 3.2;
      } else {
        const s = (u - 0.45) / 0.55;
        conduitCurve.getPointAt(s, pos);
        x = pos.x + b.x * 0.04;
        y = pos.y;
      }
      const vis = i < 40 + erupt * 100 ? 1 : 0;
      const sz = b.s * (0.6 + u * 1.6 * grow) * vis * (0.4 + press * 0.6);
      pos.set(x, y, b.z);
      sc.setScalar(sz);
      m4.compose(pos, q, sc);
      bubbles.setMatrixAt(i, m4);
    }
    bubbles.instanceMatrix.needsUpdate = true;
    magmaMat.emissiveIntensity = 0.9 + erupt * 0.5 + Math.sin(t * 2) * 0.08;
    col.userData.update(t, { grow: colGrow, k: colGrow > 0 ? 1 : 0, glow: 0.6, drift: 0.4 });
    // bottle: cap pops at bottle > 0.1, foam fountain
    capM.position.y = 2.95 + 3.66 + sm((bottle - 0.05) / 0.2) * 3;
    capM.rotation.z = sm((bottle - 0.05) / 0.2) * 4;
    for (let i = 0; i < 220; i++) {
      const f = F[i];
      const inside = bottle < 0.1;
      const u = (f.ph + t * f.v * (inside ? 0.15 : 0.9)) % 1;
      if (inside) {
        pos.set(Math.cos(f.a) * f.rr * 0.45, 2.95 + 0.2 + u * 1.8, Math.sin(f.a) * f.rr * 0.45);
        sc.setScalar(f.s * 0.5 * (i < 60 ? 1 : 0));
      } else {
        const h = u * 6 * sm(bottle * 3);
        pos.set(
          Math.cos(f.a) * f.rr * (0.2 + u * 1.6),
          2.95 + 3.6 + h - u * u * 2.5,
          Math.sin(f.a) * f.rr * (0.2 + u * 1.6),
        );
        sc.setScalar(f.s * (1.5 + u * 3));
      }
      m4.compose(pos, q, sc);
      fizz.setMatrixAt(i, m4);
    }
    fizz.instanceMatrix.needsUpdate = true;
  };
  g.userData.chamber = chamber;
  g.userData.bottle = bt;
  return g;
}

// the 1863 dig: a cut through the hardened ash with a hollow in it, a
// bucket of plaster, two diggers, a lantern. 1 unit = 1 m.
// update(t, { pour 0..1, reveal 0..1 })
export function buildTrench(o = V(60, -120, 0)) {
  const g = new THREE.Group();
  g.position.copy(o);
  scene.add(g);
  darkRoom(o, 14, 0x16120e);
  const layers = [
    [0xb3a68e, 1.4],
    [0x6e655a, 0.6],
    [0x5a5249, 1.2],
    [0x726858, 0.8],
    [0x4e4438, 0.5],
  ];
  let y = 0;
  for (const [c, h] of layers) {
    const L = new THREE.Mesh(
      roundedBox(9, h, 3, 0.04),
      real.plastic(c, { roughness: 1, clearcoat: 0 }),
    );
    L.position.set(0, y + h / 2, -1.6);
    g.add(L);
    y += h;
  }
  const floor = new THREE.Mesh(
    roundedBox(9, 0.1, 5, 0.03),
    real.plastic(0x6a5e50, { roughness: 1, clearcoat: 0 }),
  );
  floor.position.set(0, -0.05, 1.0);
  g.add(floor);
  // the hollow: a dark, rounded recess in the wall (abstract)
  const hollowGeo = new THREE.SphereGeometry(1, 32, 16);
  hollowGeo.scale(0.95, 0.32, 0.3);
  const hollow = new THREE.Mesh(
    hollowGeo,
    new THREE.MeshStandardMaterial({ color: 0x1c1712, roughness: 1 }),
  );
  hollow.position.set(0.2, 1.55, -0.12);
  g.add(hollow);
  // the plaster filling it (white, rises with `pour`)
  const plasterMat = real.plastic(0xf2eee6, { roughness: 0.9, clearcoat: 0 });
  const fill = new THREE.Mesh(hollowGeo, plasterMat);
  fill.position.copy(hollow.position).add(V(0, 0, 0.01));
  g.add(fill);
  // bucket + pouring stream
  const bucket = new THREE.Group();
  const bk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.16, 0.32, 24, 1, true),
    real.wood(0x7a5a3a, { side: THREE.DoubleSide }),
  );
  bucket.add(bk);
  const bkIn = new THREE.Mesh(new THREE.CircleGeometry(0.19, 24), plasterMat);
  bkIn.rotation.x = -Math.PI / 2;
  bkIn.position.y = 0.1;
  bucket.add(bkIn);
  bucket.position.set(0.9, 2.3, 0.4);
  g.add(bucket);
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.025, 1, 10), plasterMat);
  g.add(stream);
  // diggers
  const d1 = makePerson({ coat: 0x4a4a52, legs: 0x2a2a30, scale: (1 / 0.18) * 0.17 * 1 });
  d1.position.set(2.2, 0, 1.2);
  d1.rotation.y = -2.4;
  g.add(d1);
  const d2 = makePerson({ coat: 0x6a5a48, legs: 0x2e2a26, scale: (1 / 0.18) * 0.17 });
  d2.position.set(-2.4, 0, 1.6);
  d2.rotation.y = 0.4;
  g.add(d2);
  const shovel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 1.4, 8),
    real.wood(0x8a6a44),
  );
  shovel.position.set(-1.8, 0.7, 1.1);
  shovel.rotation.z = 0.5;
  g.add(shovel);
  // lantern + light
  const lan = noAO(
    new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 12, 8),
      new THREE.MeshBasicMaterial({ color: 0xffc070, toneMapped: false }),
    ),
  );
  lan.position.set(-1.0, 0.25, 0.6);
  g.add(lan);
  const ll = new THREE.PointLight(0xffb060, 8, 10, 1.6);
  ll.position.set(-1.0, 0.6, 0.8);
  g.add(ll);
  const key = new THREE.DirectionalLight(0xfff0dc, 1.6);
  key.position.set(4, 8, 8);
  key.target.position.set(0, 1, 0);
  g.add(key);
  g.add(key.target);
  g.add(new THREE.HemisphereLight(0xffe8d0, 0x2a2018, 0.6));
  shadowAll(g);
  g.userData.update = (t, { pour = 0, reveal = 0 } = {}) => {
    const pouring = pour > 0.02 && pour < 0.98;
    bucket.rotation.z = pouring ? 1.1 : 0.2 * pour;
    stream.visible = pouring;
    stream.scale.y = 0.75;
    stream.position.set(0.55, 1.95, 0.1);
    stream.rotation.z = 0.35;
    fill.scale.setScalar(sm(pour) * 0.98 + 0.0001);
    fill.visible = pour > 0.01;
    hollow.visible = reveal < 0.5;
    // reveal: the wall in front falls away, the white shape lies free
    g.children.forEach((c) => {
      if (c.userData.front) c.visible = reveal < 0.5;
    });
    fill.position.z = -0.12 + sm(reveal) * 0.9;
    fill.position.y = 1.55 - sm(reveal) * 1.4;
  };
  return g;
}
