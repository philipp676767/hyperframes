// The set kit: everything a video's own world is built from — sky + light,
// ground and terrain, sea, clouds, vegetation, rocks, cars, life. There are
// no fixed environments: every video designs a new set for its topic in
// assets/set.js (SKILL.md 1b) from these pieces and assets/props.js, and
// copies whole ideas from the example sets (references/set-beispiele.js).
//   setSky({ ...SKIES.morgen, top: [0.4, 0.6, 0.95] });   // or a fully own palette
//   terrain(0x86c45a, { height: (x, z, d) => … });         // the ground
//   … props, buildings, hero piece, life …
//   finishSet({ ground: 0x86c45a });                       // sky light, last
// Stage rules for every set: the subject at the origin (radius ~4) and the
// analogy spots at x = ±5, z = -1…4 stay empty; scenery sits behind
// (z < -5) and in an outer ring. The outro drone flies out along +x/+z
// (towards x ≈ 0.6·z), so nothing tall stands on that line in front of the
// stage.
import {
  THREE,
  V,
  rand,
  rng,
  jitter,
  flat,
  M,
  scene,
  ground,
  onFrame,
  facet,
  facetMat,
  patches,
  noise2,
  renderer,
} from "./world.js";

// mesh with per-facet colour variation (world.js facet)
export const F = (geo, mat, amt = 0.08, seed = 1) =>
  new THREE.Mesh(facet(geo, amt, seed), facetMat(mat));

// ---------------------------------------------------------------- skies
// Starting palettes — mix or tweak them per video (`{ ...SKIES.abend, top: … }`)
// or write a new one. top / mid / horizon / below are sRGB 0..1; below
// doubles as fog colour. Optional: sun (glow colour), sunDir [x, y, z]
// (default low behind the stage), cloud [colour, shade], clouds (count,
// default 16), noClouds, birds (false = none), stars (0..1.5), fog
// [near, far], hemi / key / rim lights [colour(s), intensity], keyPos
// [x, y, z], nightWindows (for lit windows / lamps in the set).
export const SKIES = {
  sonnenuntergang: {
    top: [0.43, 0.36, 0.82],
    mid: [0.93, 0.56, 0.76],
    hor: [1.0, 0.7, 0.47],
    below: [0.91, 0.65, 0.77],
    sun: [1.0, 0.86, 0.6],
    cloud: [0xffe6ef, 0xffb8d2],
    hemi: [0xffe9f2, 0x8a6a7a, 1.35],
    key: [0xffe2c4, 2.6],
    rim: [0xff9ec4, 0.7],
  },
  morgen: {
    top: [0.5, 0.68, 0.92],
    mid: [0.97, 0.78, 0.82],
    hor: [1.0, 0.86, 0.68],
    below: [0.95, 0.83, 0.85],
    sun: [1.0, 0.93, 0.75],
    cloud: [0xfff3f3, 0xffd6dc],
    hemi: [0xf4f0ff, 0x8a7f90, 1.45],
    key: [0xfff0dc, 2.5],
    rim: [0xb9c8ff, 0.6],
  },
  mittag: {
    top: [0.3, 0.58, 0.9],
    mid: [0.6, 0.8, 0.96],
    hor: [0.9, 0.95, 1.0],
    below: [0.82, 0.9, 0.96],
    sun: [1.0, 0.98, 0.9],
    cloud: [0xffffff, 0xe6f0ff],
    hemi: [0xeef6ff, 0x7d8a7a, 1.5],
    key: [0xfffaf0, 2.8],
    rim: [0xbfe0ff, 0.5],
  },
  abend: {
    top: [0.16, 0.16, 0.42],
    mid: [0.42, 0.31, 0.62],
    hor: [1.0, 0.6, 0.42],
    below: [0.55, 0.42, 0.63],
    sun: [1.0, 0.7, 0.45],
    cloud: [0xb9a4d6, 0x7a5fa8],
    hemi: [0xb8b0ff, 0x4a3a5a, 1.15],
    key: [0xffc9a0, 2.1],
    rim: [0x8f7dff, 0.9],
    nightWindows: true,
  },
  // clear night: deep blue, stars, cool moonlight (any env)
  nacht: {
    top: [0.03, 0.05, 0.16],
    mid: [0.08, 0.12, 0.3],
    hor: [0.24, 0.3, 0.52],
    below: [0.12, 0.16, 0.3],
    sun: [0.75, 0.82, 1.0],
    cloud: [0x5c6890, 0x2c3560],
    hemi: [0x8fa4ff, 0x2a2f4a, 1.0],
    key: [0xb9c8ff, 1.4],
    rim: [0x6f8dff, 1.0],
    stars: 1,
    nightWindows: true,
  },
  // black space, dense stars, hard white sunlight (env "weltall")
  weltall: {
    top: [0.0, 0.0, 0.02],
    mid: [0.02, 0.02, 0.07],
    hor: [0.06, 0.05, 0.16],
    below: [0.02, 0.02, 0.06],
    sun: [1.0, 0.97, 0.9],
    cloud: [0x000000, 0x000000],
    hemi: [0x9aa8ff, 0x1a1a2a, 0.7],
    key: [0xffffff, 3.2],
    rim: [0x6f7dff, 1.1],
    stars: 1.4,
    noClouds: true,
  },
  // under water: light from above, deep blue below (env "tiefsee")
  tiefsee: {
    top: [0.35, 0.78, 0.9],
    mid: [0.1, 0.45, 0.66],
    hor: [0.04, 0.24, 0.42],
    below: [0.03, 0.15, 0.3],
    sun: [0.6, 0.95, 1.0],
    cloud: [0x000000, 0x000000],
    hemi: [0x8fe3ff, 0x0b2a44, 1.3],
    key: [0xc9f3ff, 2.0],
    rim: [0x3fb5ff, 0.8],
    noClouds: true,
    fog: [10, 48],
  },
  // dark stage: near-black blue, no clouds or birds — the light does the
  // work (darkStage(): spotlight, neon rim, glossy floor). Moody, cinematic.
  studio: {
    top: [0.02, 0.025, 0.06],
    mid: [0.04, 0.05, 0.11],
    hor: [0.08, 0.09, 0.18],
    below: [0.03, 0.035, 0.08],
    sun: [0.35, 0.45, 0.9],
    sunDir: [0, 0.35, -1],
    cloud: [0x000000, 0x000000],
    noClouds: true,
    birds: false,
    hemi: [0x8a96c8, 0x101018, 0.7],
    key: [0xfff1e0, 0.9],
    keyPos: [3, 12, 7],
    rim: [0x6f8dff, 1.6],
    fog: [16, 48],
  },
  // high up, above the clouds: deep blue zenith, bright haze (env "wolken")
  hoch: {
    top: [0.08, 0.3, 0.78],
    mid: [0.3, 0.56, 0.92],
    hor: [0.7, 0.83, 0.98],
    below: [0.74, 0.83, 0.96],
    sun: [1.0, 0.98, 0.92],
    cloud: [0xffffff, 0x9fb4d8],
    hemi: [0xeef6ff, 0x7f93bd, 1.3],
    key: [0xfffaf0, 3.0],
    rim: [0xbfe0ff, 0.6],
    fog: [45, 160],
  },
};

let skyMesh = null;
// Sky dome, fog, clouds, birds and the sun / fill / rim lights. Call first
// in set.js; returns the palette (pass `sky.nightWindows` etc. on).
export function setSky(sky) {
  if (typeof sky === "string") sky = SKIES[sky];
  const sunDir = V(...(sky.sunDir ?? [-0.32, 0.07, -1])).normalize();
  const vec = (c) => new THREE.Vector3(...c);
  scene.add(
    (skyMesh = new THREE.Mesh(
      new THREE.SphereGeometry(300, 48, 24),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          sunDir: { value: sunDir },
          top: { value: vec(sky.top) },
          mid: { value: vec(sky.mid) },
          hor: { value: vec(sky.hor) },
          below: { value: vec(sky.below) },
          sunCol: { value: vec(sky.sun) },
          stars: { value: sky.stars ?? 0 },
        },
        vertexShader: `varying vec3 vDir;
      void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `uniform vec3 sunDir; uniform vec3 top; uniform vec3 mid; uniform vec3 hor;
      uniform vec3 below; uniform vec3 sunCol; uniform float stars; varying vec3 vDir;
      void main(){
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 c;
        if (h > 0.0) { c = mix(hor, mid, smoothstep(0.0, 0.16, h)); c = mix(c, top, smoothstep(0.14, 0.62, h)); }
        else { c = mix(hor, below, smoothstep(0.0, 0.10, -h)); }
        float s = clamp(dot(d, sunDir), 0.0, 1.0);
        c += sunCol * (pow(s, 90.0) * 0.95 + pow(s, 10.0) * 0.28);
        // stars (night / space skies): sparse fixed dots, fading out at the horizon
        vec3 q = floor(d * 420.0);
        float st = fract(sin(dot(q, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
        c += stars * step(0.9982, st) * (0.5 + 0.5 * fract(st * 97.0)) * smoothstep(0.02, 0.3, h);
        // the gradient is authored in sRGB; hand three a linear colour so it
        // looks the same on the canvas and through post.js
        c = clamp(c, 0.0, 1.0);
        c = mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
      }),
    )),
  );
  const [fogNear, fogFar] = sky.fog ?? [30, 95];
  scene.fog = new THREE.Fog(
    new THREE.Color().setRGB(...sky.below, THREE.SRGBColorSpace),
    fogNear,
    fogFar,
  );

  const cloudMat = facetMat(
    new THREE.MeshStandardMaterial({
      color: sky.cloud[0],
      emissive: sky.cloud[1],
      emissiveIntensity: 0.28,
      roughness: 1,
      flatShading: true,
      fog: false,
    }),
  );
  // clouds drift slowly around the stage
  const clouds = new THREE.Group();
  scene.add(clouds);
  onFrame((t) => (clouds.rotation.y = t * 0.006));
  const nClouds = sky.noClouds ? 0 : (sky.clouds ?? 16);
  for (let i = 0; i < nClouds; i++) {
    const g = new THREE.Group();
    const a = (i / nClouds) * Math.PI * 2 + rand() * 0.3;
    const r = 55 + rand() * 30;
    g.position.set(Math.cos(a) * r, 6 + rand() * 20, Math.sin(a) * r);
    cloudPuffs(g, 4 + Math.floor(rand() * 4), 2.2 + rand() * 1.6, cloudMat, i * 7);
    g.lookAt(0, g.position.y, 0);
    clouds.add(g);
  }
  if (sky.birds ?? (!sky.noClouds && !sky.stars)) birds();

  // the sky's image-based light (skyLight) now carries part of the fill
  scene.add(new THREE.HemisphereLight(sky.hemi[0], sky.hemi[1], sky.hemi[2] * HEMI));
  const key = new THREE.DirectionalLight(...sky.key);
  key.position.set(...(sky.keyPos ?? [6, 11, 8]));
  key.castShadow = true;
  key.shadow.mapSize.set(4096, 4096);
  Object.assign(key.shadow.camera, {
    left: -11,
    right: 11,
    top: 11,
    bottom: -11,
    near: 1,
    far: 40,
  });
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.02;
  scene.add(key);
  const rim = new THREE.DirectionalLight(...sky.rim);
  rim.position.set(-6, 4, -9);
  scene.add(rim);
  return sky;
}

// Image-based light from this video's own sky plus its ground colour below:
// glossy parts (chrome, glass, paint, water) mirror the real sky, matte
// facets pick up its colour in the shade. Built once (PMREM), after the set.
const HEMI = 0.4; // share of the old hemisphere fill that stays
const ENV_LIGHT = 0.4; // strength of the sky light
// Last call in set.js: `ground` = the main ground colour (bounce from below).
export function finishSet({ ground: groundColor = 0x808080 } = {}) {
  const pm = new THREE.PMREMGenerator(renderer);
  const env = new THREE.Scene();
  env.add(skyMesh.clone());
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(280, 32),
    new THREE.MeshBasicMaterial({ color: groundColor, fog: false }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -6;
  env.add(floor);
  scene.environment = pm.fromScene(env, 0.02, 1, 1000).texture;
  scene.environmentIntensity = ENV_LIGHT;
  pm.dispose();
}

// A cumulus: lobes biggest in the middle, a flat underside (like real fair-
// weather clouds), soft per-facet shading. Adds the lobes to group g.
export function cloudPuffs(g, n, size, mat, seed) {
  const r = rng(seed + 3);
  for (let k = 0; k < n; k++) {
    const geo = jitter(new THREE.IcosahedronGeometry(1, 1), 0.09, seed + k);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) p.setY(i, Math.max(p.getY(i), -0.32));
    geo.computeVertexNormals();
    const m = new THREE.Mesh(facet(geo, 0.05, seed + k), mat);
    const mid = 1 - Math.abs(k - (n - 1) / 2) / n;
    const s = size * (0.6 + mid * 0.7) * (0.85 + r() * 0.3);
    m.scale.set(s * 1.2, s * 0.8, s);
    m.position.set((k - (n - 1) / 2) * size * 1.15, s * 0.32 + r() * 0.4, (r() - 0.5) * size);
    g.add(m);
  }
}

// ---------------------------------------------------------------- life
// Small, slow, deterministic motion that makes the set feel alive: trees and
// pines sway, a few birds circle far out, clouds drift (buildSky).
const swaying = [];
onFrame((t) => {
  for (const { g, seed, amp } of swaying) {
    g.rotation.z = Math.sin(t * 1.1 + seed * 1.7) * amp;
    g.rotation.x = Math.sin(t * 0.8 + seed * 2.9) * amp * 0.7;
  }
});

const birdMat = new THREE.MeshBasicMaterial({ color: 0x4a3a5c, side: THREE.DoubleSide });
export function birds(n = 4) {
  const wingGeo = new THREE.BufferGeometry();
  wingGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute([0, 0, -0.18, 0, 0, 0.18, 0.75, 0, 0.05], 3),
  );
  wingGeo.computeVertexNormals();
  const flock = [];
  for (let i = 0; i < n; i++) {
    const b = new THREE.Group();
    const wings = [-1, 1].map((sd) => {
      const w = new THREE.Mesh(wingGeo, birdMat);
      w.scale.x = sd;
      b.add(w);
      return w;
    });
    b.userData = { wings, r: 24 + i * 3.5, y: 9 + (i % 3) * 2.2, a0: i * 1.9, v: 0.07 + i * 0.012 };
    b.scale.setScalar(0.9);
    scene.add(b);
    flock.push(b);
  }
  onFrame((t) => {
    for (const b of flock) {
      const { wings, r, y, a0, v } = b.userData;
      const a = a0 + t * v;
      b.position.set(
        Math.cos(a) * r,
        y + Math.sin(t * 0.9 + a0) * 0.5,
        -Math.abs(Math.sin(a)) * r - 6,
      );
      b.rotation.y = -a;
      const f = Math.sin(t * 9 + a0 * 3) * 0.6;
      wings[0].rotation.z = f;
      wings[1].rotation.z = -f;
    }
  });
}

// Grass tufts and little flowers scattered on the ground (instanced, cheap).
// keep(x, z) says where they may grow; the subject's footprint and the
// analogy spots (x = ±5, z = -1…4) always stay clean.
export function meadow({
  n = 260,
  rMin = 2.6,
  rMax = 9,
  seed = 1,
  keep = () => true,
  flowers = 0.25,
  tint = [0x5f9f37, 0x79c24a, 0x8fd35a],
}) {
  const r = rng(seed);
  const spots = [];
  for (let i = 0; spots.length < n && i < n * 6; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(rMin * rMin + r() * (rMax * rMax - rMin * rMin));
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    if (x * x + z * z < 2.6 * 2.6) continue;
    if ((Math.abs(x) - 5) ** 2 + (z - 1.5) ** 2 < 2.4 * 2.4) continue;
    if (!keep(x, z)) continue;
    spots.push([x, z, r(), r(), r()]);
  }
  const blades = new THREE.InstancedMesh(
    new THREE.ConeGeometry(0.05, 0.34, 4),
    flat(0xffffff),
    spots.length * 3,
  );
  const heads = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.075, 0),
    flat(0xffffff, { roughness: 0.6 }),
    spots.length,
  );
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const c = new THREE.Color();
  const petals = [0xffffff, 0xffd84a, 0xff8fb8, 0xc9a4ff];
  let bi = 0;
  let hi = 0;
  for (const [x, z, a, b, k] of spots) {
    const sc = 0.7 + a * 0.7;
    for (let j = 0; j < 3; j++) {
      e.set((j - 1) * 0.35, a * 6, (j - 1) * 0.25 * (b - 0.5) * 2);
      q.setFromEuler(e);
      m.compose(V(x + (j - 1) * 0.05, 0.15 * sc, z + (b - 0.5) * 0.06), q, V(sc, sc, sc));
      blades.setMatrixAt(bi, m);
      blades.setColorAt(bi++, c.setHex(tint[(j + Math.floor(b * 3)) % tint.length]));
    }
    if (k < flowers) {
      m.compose(V(x, 0.36 * sc, z), q.identity(), V(1, 0.8, 1));
      heads.setMatrixAt(hi, m);
      heads.setColorAt(hi++, c.setHex(petals[Math.floor(a * 97) % petals.length]));
    }
  }
  blades.count = bi;
  heads.count = hi;
  for (const im of [blades, heads]) {
    im.receiveShadow = true;
    ground.add(im);
  }
}

// ---------------------------------------------------------------- shared scenery pieces
export const add = (mesh, x = 0, y = 0, z = 0, shadow = true) => {
  mesh.position.set(x, y, z);
  mesh.castShadow = shadow;
  mesh.receiveShadow = true;
  ground.add(mesh);
  return mesh;
};

// Flat disc (XZ plane, y = 0) triangulated with near-equal triangles: ring k
// has 6k points, so there are no long slivers fanning out from the centre
// (those read as pie slices / sun rays once facets are tinted). Points are
// jittered in-plane; height(x, z, d) may lift them.
export function discGeo(r, step, seed, height = () => 0) {
  const rings = Math.max(2, Math.round(r / step));
  const pts = [[0, 0]];
  const start = [0];
  const count = [1];
  const h = (x, z, k) => {
    const v = Math.sin(x * 129.898 + z * 782.33 + k * 3.1 + seed) * 43758.5453;
    return (v - Math.floor(v)) * 2 - 1;
  };
  for (let k = 1; k <= rings; k++) {
    const n = 6 * k;
    start.push(pts.length);
    count.push(n);
    const rad = (k / rings) * r;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + k * 0.37;
      let x = Math.cos(a) * rad;
      let z = Math.sin(a) * rad;
      if (k < rings) {
        x += h(x, z, 1) * step * 0.32;
        z += h(x, z, 2) * step * 0.32;
      }
      pts.push([x, z]);
    }
  }
  const idx = [];
  for (let k = 0; k < rings; k++) {
    const a0 = start[k];
    const na = count[k];
    const b0 = start[k + 1];
    const nb = count[k + 1];
    if (na === 1) {
      for (let i = 0; i < nb; i++) idx.push(a0, b0 + ((i + 1) % nb), b0 + i);
      continue;
    }
    // walk both rings by angle, always advancing the one that lags
    let i = 0;
    let j = 0;
    while (i < na || j < nb) {
      const ai = a0 + (i % na);
      const bj = b0 + (j % nb);
      if (j < nb && (i >= na || (j + 1) / nb <= (i + 1) / na)) {
        idx.push(ai, b0 + ((j + 1) % nb), bj);
        j++;
      } else {
        idx.push(ai, a0 + ((i + 1) % na), bj);
        i++;
      }
    }
  }
  const pos = [];
  for (const [x, z] of pts) pos.push(x, height(x, z, Math.hypot(x, z)), z);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

// The main ground: a faceted disc of even triangles (no pie-slice fans),
// flat where things stand, rising into soft hills past `flatR` towards the
// horizon, with colour patches. `height(x, z, d)` replaces the default
// relief (may go negative: valleys, a lake bed, a sloping beach) — keep it
// 0 for d < 6 so the stage stays level. `look` = patches() options
// (amt, scale, warm, fn).
export function terrain(
  color,
  { r = 75, seed = 5, step = 3.2, flatR = 36, hills = 6, height, ...look } = {},
) {
  const relief =
    height ??
    ((x, z, d) => {
      if (d <= flatR) return 0;
      const v = Math.sin(x * 0.21 + seed) * Math.cos(z * 0.17 - seed) * 0.5 + 0.5;
      return ((d - flatR) / (r - flatR)) * hills * (0.35 + 0.65 * v);
    });
  const geo = discGeo(r, step, seed, relief);
  const m = new THREE.Mesh(
    patches(facet(geo, 0.06, seed), { amt: 0.1, scale: 0.12, seed, ...look }),
    facetMat(flat(color)),
  );
  m.receiveShadow = true;
  ground.add(m);
  return m;
}
// (old name)
export const bigGround = (color, r = 75, seed = 5, look = {}) =>
  terrain(color, { r, seed, ...look });

export function tree(x, z, s = 1, seed = 0) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.2, 1.9, 6), M.trunk);
  trunk.position.y = 0.95;
  trunk.castShadow = true;
  g.add(trunk);
  const n = 2 + (seed % 2);
  for (let k = 0; k < n; k++) {
    const r = 0.95 - k * 0.18;
    const m = F(
      jitter(new THREE.IcosahedronGeometry(r, 1), 0.07, seed * 13 + k),
      k % 2 ? M.leaf2 : M.leaf,
      0.1,
      seed * 13 + k,
    );
    m.position.set((k % 2 ? 0.35 : -0.15) * (seed % 3 ? 1 : -1), 2.2 + k * 0.85, k * 0.1);
    m.castShadow = true;
    g.add(m);
  }
  g.position.set(x, 0, z);
  g.scale.setScalar(s);
  g.rotation.y = seed;
  ground.add(g);
  swaying.push({ g, seed, amp: 0.022 });
  return g;
}

const pineMat = flat(0x2f6b4a);
const pineMat2 = flat(0x3d7d55);
export const snowMat = flat(0xf4f8ff);
export function pine(x, z, s = 1, seed = 0, snowy = false) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.8, 6), M.trunk);
  trunk.position.y = 0.4;
  g.add(trunk);
  for (let k = 0; k < 3; k++) {
    const r = 1.05 - k * 0.27;
    const cone = F(
      jitter(new THREE.ConeGeometry(r, 1.3, 7), 0.05, seed * 7 + k),
      k % 2 ? pineMat2 : pineMat,
      0.09,
      seed * 7 + k,
    );
    cone.position.y = 1.15 + k * 0.72;
    cone.castShadow = true;
    g.add(cone);
    if (snowy) {
      const cap = new THREE.Mesh(new THREE.ConeGeometry(r * 0.55, 0.55, 7), snowMat);
      cap.position.y = 1.15 + k * 0.72 + 0.4;
      g.add(cap);
    }
  }
  g.position.set(x, 0, z);
  g.scale.setScalar(s);
  g.rotation.y = seed;
  ground.add(g);
  swaying.push({ g, seed, amp: 0.012 });
  return g;
}

export function rocks(n, rMin, rMax, seed, mat = M.rock) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2;
    const d = rMin + r() * (rMax - rMin);
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    if (Math.abs(x) < 6.5 && z > -5 && z < 4.5) continue; // keep the stage clear
    add(
      F(
        jitter(new THREE.DodecahedronGeometry(0.18 + r() * 0.3, 0), 0.04, seed + i),
        mat,
        0.12,
        seed + i,
      ),
      x,
      0.05,
      z,
    );
  }
}

// Low-poly car: body, cabin, wheels. Faces +x.
export function car(x, z, color, rotY = 0) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.5, 1.0),
    flat(color, { roughness: 0.4 }),
  );
  body.position.y = 0.45;
  body.castShadow = true;
  g.add(body);
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.42, 0.9),
    flat(0xcfe6ff, { roughness: 0.2 }),
  );
  cabin.position.set(-0.1, 0.9, 0);
  g.add(cabin);
  for (const sx of [-0.7, 0.7])
    for (const sz of [-0.5, 0.5]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.18, 10), M.rubber);
      w.rotation.x = Math.PI / 2;
      w.position.set(sx, 0.22, sz);
      g.add(w);
    }
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  ground.add(g);
  return g;
}

// Faceted, moving sea: a grid whose points bob on a few overlapping swells
// (flat shading turns every triangle into a little mirror of the sky — the
// low-poly ocean look), turquoise in the shallows, deep blue further out,
// slightly see-through so the sloping sand shows near the shore.
export function sea({ zFrom = -4, depth = 110, width = 180, y = -0.05, amp = 0.09 } = {}) {
  const geo = new THREE.PlaneGeometry(width, depth, 96, 56);
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, y, zFrom - depth / 2);
  const p = geo.attributes.position;
  const r = rng(77);
  const base = new Float32Array(p.count * 2);
  const col = new Float32Array(p.count * 3);
  const shallow = new THREE.Color(0x46d0d8);
  const deepC = new THREE.Color(0x1f7fb5);
  const c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) + (r() - 0.5) * 0.9;
    const z = p.getZ(i) + (r() - 0.5) * 0.9;
    p.setX(i, x);
    p.setZ(i, z);
    base[i * 2] = x;
    base[i * 2 + 1] = z;
    c.lerpColors(shallow, deepC, Math.min(1, Math.max(0, (zFrom - 3 - z) / 22)));
    col.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const water = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({
      vertexColors: true,
      flatShading: true,
      roughness: 0.12,
      metalness: 0.05,
      transparent: true,
      opacity: 0.86,
      envMapIntensity: 1.6,
    }),
  );
  water.receiveShadow = true;
  ground.add(water);
  onFrame((t) => {
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 2];
      const z = base[i * 2 + 1];
      const fade = Math.min(1, (zFrom - z + 1) / 6); // calm right at the beach
      const h =
        Math.sin(x * 0.33 + z * 0.12 + t * 1.15) * 0.6 +
        Math.sin(z * 0.47 - x * 0.08 - t * 0.9) * 0.45 +
        Math.sin((x + z) * 0.9 + t * 1.8) * 0.18;
      p.setY(i, y + h * amp * Math.max(0.15, fade) * (1 + Math.min(1, -z / 60)));
    }
    p.needsUpdate = true;
  });
  // far ocean to the horizon
  const far = new THREE.Mesh(
    new THREE.CircleGeometry(260, 48),
    new THREE.MeshStandardMaterial({ color: 0x1f7fb5, roughness: 0.2, envMapIntensity: 1.2 }),
  );
  far.rotation.x = -Math.PI / 2;
  far.position.y = y - 0.35;
  ground.add(far);
  return water;
}

// ---------------------------------------------------------------- more pieces
// A path / road / stream bed: a faceted ribbon along points [[x, z], …]
// lying on the ground (y = lift), with colour patches.
export function pathStrip(pts, { width = 1.6, color = 0xc9a46b, lift = 0.02, seed = 4 } = {}) {
  const curve = new THREE.CatmullRomCurve3(pts.map(([x, z]) => V(x, 0, z)));
  const n = Math.max(8, Math.round(curve.getLength() / 0.6));
  const pos = [];
  const idx = [];
  for (let i = 0; i <= n; i++) {
    const p = curve.getPointAt(i / n);
    const tng = curve.getTangentAt(i / n);
    const side = V(-tng.z, 0, tng.x).multiplyScalar(width / 2);
    const wob = (noise2(i * 0.4, 0, seed) - 0.5) * width * 0.25;
    pos.push(p.x + side.x * (1 + wob), lift, p.z + side.z * (1 + wob));
    pos.push(p.x - side.x * (1 - wob), lift, p.z - side.z * (1 - wob));
    if (i < n) idx.push(i * 2, i * 2 + 2, i * 2 + 1, i * 2 + 1, i * 2 + 2, i * 2 + 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const m = new THREE.Mesh(
    patches(facet(geo, 0.08, seed), { amt: 0.1, scale: 0.5, seed }),
    facetMat(flat(color)),
  );
  m.receiveShadow = true;
  ground.add(m);
  return m;
}

// A pond: a glossy, faintly rippling water surface with a pebble rim.
export function pond(x, z, { rx = 3, rz = 2, color = 0x4fa9c9, seed = 6 } = {}) {
  const geo = discGeo(1, 0.12, seed);
  const p = geo.attributes.position;
  const water = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({
      color,
      flatShading: true,
      roughness: 0.08,
      metalness: 0.1,
      envMapIntensity: 1.6,
    }),
  );
  water.scale.set(rx, 1, rz);
  water.position.set(x, 0.03, z);
  water.receiveShadow = true;
  ground.add(water);
  const base = Float32Array.from(p.array);
  onFrame((t) => {
    for (let i = 0; i < p.count; i++) {
      const bx = base[i * 3];
      const bz = base[i * 3 + 2];
      const edge = Math.max(0, 1 - Math.hypot(bx, bz));
      p.setY(i, Math.sin(bx * 9 + t * 1.6) * Math.cos(bz * 8 - t * 1.2) * 0.012 * edge);
    }
    p.needsUpdate = true;
  });
  const r = rng(seed);
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2 + r() * 0.1;
    add(
      F(
        jitter(new THREE.DodecahedronGeometry(0.16 + r() * 0.14, 0), 0.03, seed + i),
        M.rock,
        0.12,
        seed + i,
      ),
      x + Math.cos(a) * (rx + 0.1),
      0.06,
      z + Math.sin(a) * (rz + 0.1),
    );
  }
  return water;
}

// Fairy lights / bunting between two points [x, y, z]: n bulbs on a sagging
// wire, glowing (the post glow picks them up). colors cycles per bulb.
export function lightString(
  a,
  b,
  { n = 14, sag = 0.6, colors = [0xffd27a, 0xfff1c2], glow = 1.6 } = {},
) {
  const A = V(...a);
  const B = V(...b);
  const pts = [];
  for (let i = 0; i <= 24; i++) {
    const k = i / 24;
    pts.push(
      A.clone()
        .lerp(B, k)
        .add(V(0, -sag * 4 * k * (1 - k), 0)),
    );
  }
  const wire = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.012, 4),
    flat(0x2f3440),
  );
  ground.add(wire);
  const mats = colors.map((c) => flat(c, { emissive: c, emissiveIntensity: glow }));
  for (let i = 1; i < n; i++) {
    const k = i / n;
    const bulb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.07, 1), mats[i % mats.length]);
    bulb.position.copy(
      A.clone()
        .lerp(B, k)
        .add(V(0, -sag * 4 * k * (1 - k) - 0.08, 0)),
    );
    bulb.userData.noAO = true;
    ground.add(bulb);
  }
  return wire;
}

// Small glowing motes that drift and pulse: fireflies at dusk, sparks,
// dust in a sunbeam, plankton. area = [x0, x1, y0, y1, z0, z1].
export function fireflies(
  n = 40,
  { area = [-14, 14, 0.4, 3, -14, 8], color = 0xfff3a0, seed = 9, size = 0.045 } = {},
) {
  const r = rng(seed);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
  const im = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(size, 0), mat, n);
  im.userData.noAO = true;
  im.frustumCulled = false;
  ground.add(im);
  const [x0, x1, y0, y1, z0, z1] = area;
  const s = Array.from({ length: n }, () => [r(), r(), r(), r() * 6]);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  onFrame((t) => {
    s.forEach(([a, b, c, ph], i) => {
      const x = x0 + (x1 - x0) * a + Math.sin(t * 0.5 + ph) * 0.6;
      const y = y0 + (y1 - y0) * b + Math.sin(t * 0.8 + ph * 2) * 0.3;
      const z = z0 + (z1 - z0) * c + Math.cos(t * 0.4 + ph) * 0.6;
      const k = 0.4 + 0.6 * Math.max(0, Math.sin(t * 2.2 + ph * 3));
      m4.compose(V(x, y, z), q, V(k, k, k));
      im.setMatrixAt(i, m4);
    });
    im.instanceMatrix.needsUpdate = true;
  });
  return im;
}

// Dark, cinematic stage (with setSky(SKIES.studio) or another dark palette):
// a glossy floor that falls off into darkness, a warm spotlight on the
// subject, a coloured neon rim from behind, a thin glowing horizon line and
// fine dust in the light. Quality from light, not from props — one subject,
// two or three objects at most (the speed camera on its gantry, the road).
export function darkStage({
  floor = 0x1b2033,
  accent = 0x6f8dff,
  spot = 0xffe2c0,
  r = 26,
  horizon = true,
  dust = true,
} = {}) {
  const geo = discGeo(r, 0.9, 12);
  const p = geo.attributes.position;
  const col = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const d = Math.hypot(p.getX(i), p.getZ(i)) / r;
    const k = 0.25 + 0.75 * Math.pow(1 - Math.min(1, d), 1.6);
    col.set([k, k, k], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const m = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({
      color: floor,
      vertexColors: true,
      roughness: 0.45,
      metalness: 0.1,
      envMapIntensity: 0.6,
    }),
  );
  m.receiveShadow = true;
  ground.add(m);
  const s = new THREE.SpotLight(spot, 2.0, 0, 0.42, 0.85, 0);
  s.position.set(2.5, 10, 6);
  s.target.position.set(0, 0.8, 0);
  s.castShadow = true;
  s.shadow.mapSize.set(2048, 2048);
  s.shadow.bias = -0.0004;
  ground.add(s, s.target);
  const back = new THREE.PointLight(accent, 30, 18, 1.4);
  back.position.set(-1.5, 3.5, -5);
  ground.add(back);
  if (horizon) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(42, 0.08, 6, 160),
      new THREE.MeshBasicMaterial({ color: accent, fog: false }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.3;
    ring.userData.noAO = true;
    ground.add(ring);
  }
  if (dust) fireflies(70, { area: [-6, 6, 0.3, 5, -5, 4], color: 0xc9d4ff, size: 0.018, seed: 21 });
  return m;
}
