// Environments for the series: same toy low-poly style, different place and
// light per video. createWorld({ env, sky }) builds sky, clouds, lights and
// the landscape around the origin. Every environment keeps the stage clear:
// the subject at the origin (radius ~4) and the analogy spots at x = ±5,
// z = -1…4 stay empty; scenery sits behind (z < -5) and in an outer ring.
// The outro drone flies out along +x/+z (towards x ≈ 0.6·z), so nothing tall
// stands on that line in front of the stage.
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
import {
  place,
  scatter,
  lamp,
  planter,
  bench,
  bin,
  bike,
  awning,
  bush,
  snowman,
  fence,
  cow,
  sheep,
} from "./props.js";

// mesh with per-facet colour variation (world.js facet)
const F = (geo, mat, amt = 0.08, seed = 1) => new THREE.Mesh(facet(geo, amt, seed), facetMat(mat));

// ---------------------------------------------------------------- skies
// top / mid / horizon / below are sRGB 0..1; below doubles as fog colour.
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
function buildSky(sky) {
  const sunDir = V(-0.32, 0.07, -1).normalize();
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
  for (let i = 0; i < (sky.noClouds ? 0 : 16); i++) {
    const g = new THREE.Group();
    const a = (i / 16) * Math.PI * 2 + rand() * 0.3;
    const r = 55 + rand() * 30;
    g.position.set(Math.cos(a) * r, 6 + rand() * 20, Math.sin(a) * r);
    cloudPuffs(g, 4 + Math.floor(rand() * 4), 2.2 + rand() * 1.6, cloudMat, i * 7);
    g.lookAt(0, g.position.y, 0);
    clouds.add(g);
  }
  if (!sky.noClouds && !sky.stars) birds();

  // the sky's image-based light (skyLight) now carries part of the fill
  scene.add(new THREE.HemisphereLight(sky.hemi[0], sky.hemi[1], sky.hemi[2] * HEMI));
  const key = new THREE.DirectionalLight(...sky.key);
  key.position.set(6, 11, 8);
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
}

// Image-based light from this video's own sky plus its ground colour below:
// glossy parts (chrome, glass, paint, water) mirror the real sky, matte
// facets pick up its colour in the shade. Built once (PMREM), after the env.
const HEMI = 0.4; // share of the old hemisphere fill that stays
const ENV_LIGHT = 0.4; // strength of the sky light
function skyLight(groundColor) {
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
function cloudPuffs(g, n, size, mat, seed) {
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
function birds(n = 4) {
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
function meadow({
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
const add = (mesh, x = 0, y = 0, z = 0, shadow = true) => {
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
function discGeo(r, step, seed, height = () => 0) {
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
  for (const [x, z] of pts) pos.push(x, Math.max(0, height(x, z, Math.hypot(x, z))), z);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

// Ground disc as a faceted polar grid: flat where things stand (r < 36),
// rising into soft low hills towards the horizon, every facet tinted a
// little differently.
function bigGround(color, r = 75, seed = 5, look = {}) {
  const geo = discGeo(r, 3.2, seed, (x, z, d) => {
    if (d <= 36) return 0;
    const v = Math.sin(x * 0.21 + seed) * Math.cos(z * 0.17 - seed) * 0.5 + 0.5;
    return ((d - 36) / (r - 36)) * (2 + 4 * v);
  });
  const m = new THREE.Mesh(
    patches(facet(geo, 0.06, seed), { amt: 0.1, scale: 0.12, seed, ...look }),
    facetMat(flat(color)),
  );
  m.receiveShadow = true;
  ground.add(m);
  return m;
}

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
const snowMat = flat(0xf4f8ff);
function pine(x, z, s = 1, seed = 0, snowy = false) {
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

function rocks(n, rMin, rMax, seed, mat = M.rock) {
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
function car(x, z, color, rotY = 0) {
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
function sea({ zFrom = -4, depth = 110, width = 180, y = -0.05, amp = 0.09 } = {}) {
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

// ---------------------------------------------------------------- environments
const ENV_BUILDERS = {
  // The original floating island (fridge video).
  insel(sky, o) {
    // rim as an open cylinder, the top as a faceted polar grid (a cylinder
    // cap would be a fan of long slivers that shows as pie slices)
    const rim = F(
      jitter(new THREE.CylinderGeometry(9, 8.8, 0.7, 40, 1, true), 0.08, 3),
      M.grass,
      0.06,
      3,
    );
    rim.position.y = -0.35;
    rim.receiveShadow = true;
    ground.add(rim);
    const top = new THREE.Mesh(
      patches(facet(discGeo(9, 0.6, 3), 0.06, 3), { amt: 0.12, scale: 0.35, seed: 3 }),
      facetMat(M.grass),
    );
    top.receiveShadow = true;
    ground.add(top);
    const cone = F(jitter(new THREE.ConeGeometry(8.8, 7, 16, 3), 0.45, 4), M.earth, 0.12, 4);
    cone.rotation.x = Math.PI;
    cone.position.y = -0.7 - 3.5;
    ground.add(cone);
    for (let i = 0; i < 26; i++) {
      const a = rand() * Math.PI * 2;
      const r = 1 + rand() * 6.5;
      const y0 = -0.8 - (1 - r / 8.8) * 6.2;
      const pts = [];
      let x = Math.cos(a) * r;
      let z = Math.sin(a) * r;
      let y = y0 + 0.4;
      for (let k = 0; k < 6; k++) {
        pts.push(V(x, y, z));
        x += (rand() - 0.5) * 0.7;
        z += (rand() - 0.5) * 0.7;
        y -= 0.6 + rand() * 0.8;
      }
      ground.add(
        new THREE.Mesh(
          new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.05 + rand() * 0.04, 5),
          M.root,
        ),
      );
    }
    [
      [-3.4, -3.6, 1.1],
      [3.0, -4.4, 1.2],
      [-6.2, -1.2, 1.0],
      [6.3, -2.6, 1.15],
      [0.6, -6.8, 1.3],
      [-2.4, -7.2, 1.0],
      [-7.3, 2.6, 0.9],
      [7.4, 1.4, 0.95],
      [-4.6, 5.4, 0.9],
      [5.6, 5.6, 1.0],
      [4.6, -6.6, 1.0],
      [-6.4, -4.8, 1.1],
    ].forEach(([x, z, s], i) => tree(x, z, s, i + 1));
    for (let i = 0; i < 14; i++) {
      const a = rand() * Math.PI * 2;
      const r = 3 + rand() * 5.2;
      add(
        F(
          jitter(new THREE.DodecahedronGeometry(0.18 + rand() * 0.22, 0), 0.04, i),
          M.rock,
          0.12,
          i,
        ),
        Math.cos(a) * r,
        0.05,
        Math.sin(a) * r,
      );
    }
    for (let i = 0; i < 10; i++) {
      const a = rand() * Math.PI * 2;
      const r = 4 + rand() * 4.5;
      add(
        F(
          jitter(new THREE.IcosahedronGeometry(0.35 + rand() * 0.25, 0), 0.05, 50 + i),
          M.grassDark,
          0.1,
          50 + i,
        ),
        Math.cos(a) * r,
        0.15,
        Math.sin(a) * r,
      );
    }
    meadow({ n: 300, rMin: 2.6, rMax: 8.4, seed: 7 + o.seed });
    scatter((i) => bush(i + 3 + o.seed), 5, {
      rMin: 5.5,
      rMax: 8,
      seed: 31 + o.seed,
      s: [0.6, 0.9],
    });
  },

  // City street: plaza, road with markings behind, pastel houses with window
  // grids, street lamps, parked cars.
  stadt(sky, o) {
    const r = rng(41 + o.seed);
    bigGround(0xbdb6ad);
    // plaza of stone slabs, each a touch different
    const slabs = [];
    for (let x = -20; x <= 20; x += 1.2) for (let z = -5.6; z <= 8.2; z += 1.2) slabs.push([x, z]);
    const slab = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1.14, 0.08, 1.14),
      flat(0xffffff, { roughness: 0.9 }),
      slabs.length,
    );
    const m4 = new THREE.Matrix4();
    const col = new THREE.Color();
    const stone = new THREE.Color(o.palette?.paving ?? 0xc9bfb3);
    slabs.forEach(([x, z], i) => {
      m4.makeTranslation(x, -0.01, z); // top at 0.03: above the ground, under a stage floor (0.04)
      slab.setMatrixAt(i, m4);
      const k = 0.88 + r() * 0.16 + (noise2(x * 0.15, z * 0.15, 3) - 0.5) * 0.16;
      slab.setColorAt(i, col.copy(stone).multiplyScalar(k));
    });
    slab.receiveShadow = true;
    ground.add(slab);
    // road along x behind the stage
    add(new THREE.Mesh(new THREE.BoxGeometry(90, 0.05, 5.4), flat(0x46444f)), 0, 0.02, -9.2, false);
    for (let x = -44; x < 44; x += 3.2)
      add(
        new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.02, 0.14), flat(0xffffff)),
        x,
        0.06,
        -10.5,
        false,
      );
    for (const dz of [-0.07, 0.07])
      add(
        new THREE.Mesh(new THREE.BoxGeometry(90, 0.02, 0.08), flat(0xf2c230)),
        0,
        0.06,
        -9.2 + dz,
        false,
      );
    for (let i = 0; i < 7; i++)
      add(
        new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 5.2), flat(0xffffff)),
        -8 + i * 0.9,
        0.065,
        -9.2,
        false,
      );
    add(new THREE.Mesh(new THREE.BoxGeometry(90, 0.18, 0.3), flat(0xb2aca5)), 0, 0.09, -6.4);
    add(new THREE.Mesh(new THREE.BoxGeometry(90, 0.14, 4), flat(0xcfc8c0)), 0, 0.07, -13.9, false);
    add(new THREE.Mesh(new THREE.BoxGeometry(90, 0.18, 0.3), flat(0xb2aca5)), 0, 0.09, -11.9);

    // houses: back row facing +z (with shops), side rows facing the centre
    const pastel = o.palette?.houses ?? [
      0xe9b8a8, 0xf2d0a4, 0xb8c7e0, 0xc9b3d9, 0xa8d5c2, 0xf0e2b6, 0xe7a9b5,
    ];
    const roofCols = [0xb4553c, 0x8a7f86, 0x6f6470, 0xc0683f];
    const night = !!sky.nightWindows;
    const lit = [];
    const dark = [];
    const frames = [];
    const house = (x, z, w, d, h, rotY, shop) => {
      const g = new THREE.Group();
      const wall = pastel[Math.floor(r() * pastel.length)];
      const body = new THREE.Mesh(
        facet(new THREE.BoxGeometry(w, h, d), 0.03, Math.floor(r() * 99)),
        facetMat(flat(wall)),
      );
      body.position.y = h / 2;
      body.castShadow = body.receiveShadow = true;
      g.add(body);
      const trim = flat(new THREE.Color(wall).multiplyScalar(0.82));
      const band = (y, hh, out) => {
        const b = new THREE.Mesh(new THREE.BoxGeometry(w + out, hh, d + out), trim);
        b.position.y = y;
        b.castShadow = true;
        g.add(b);
      };
      band(0.3, 0.6, 0.06); // plinth
      band(h - 0.12, 0.24, 0.16); // cornice
      if (r() < 0.5) {
        // gable roof
        const rs = new THREE.Shape();
        rs.moveTo(-w / 2 - 0.2, 0);
        rs.lineTo(0, Math.min(2.4, w * 0.4));
        rs.lineTo(w / 2 + 0.2, 0);
        rs.lineTo(-w / 2 - 0.2, 0);
        const roof = new THREE.Mesh(
          facet(new THREE.ExtrudeGeometry(rs, { depth: d + 0.3, bevelEnabled: false }), 0.05, 7),
          facetMat(flat(roofCols[Math.floor(r() * roofCols.length)])),
        );
        roof.position.set(0, h, -d / 2 - 0.15);
        roof.castShadow = true;
        g.add(roof);
      } else {
        // flat roof: parapet + a chimney / vent box
        const pr = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.4, d + 0.1), trim);
        pr.position.y = h + 0.2;
        g.add(pr);
        const ch = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 0.5), flat(0x9a8f88));
        ch.position.set((r() - 0.5) * (w - 1), h + 0.45, (r() - 0.5) * (d - 1));
        ch.castShadow = true;
        g.add(ch);
      }
      const cols = Math.max(1, Math.floor((w - 0.6) / 1.1));
      const rows = Math.max(1, Math.floor((h - 1.6) / 1.3));
      for (let cx = 0; cx < cols; cx++)
        for (let ry = 0; ry < rows; ry++) {
          if (shop && ry === 0) continue;
          const wx = -((cols - 1) * 1.1) / 2 + cx * 1.1;
          const wy = 1.7 + ry * 1.3;
          frames.push({ g, x: wx, y: wy, z: d / 2 + 0.02 });
          (night && r() < 0.68 ? lit : dark).push({ g, x: wx, y: wy, z: d / 2 + 0.05 });
        }
      if (shop) {
        const sw = new THREE.Mesh(
          new THREE.BoxGeometry(w * 0.55, 1.3, 0.06),
          night
            ? flat(0xffe2a8, { emissive: 0xffc46b, emissiveIntensity: 0.8 })
            : flat(0x5a6f99, { roughness: 0.15, metalness: 0.3 }),
        );
        sw.position.set(-w * 0.12, 1.15, d / 2 + 0.04);
        g.add(sw);
        const aw = awning(w * 0.6, [roofCols[Math.floor(r() * 2)], 0xffffff]);
        aw.position.set(-w * 0.12, 2.05, d / 2);
        g.add(aw);
      }
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 0.08), flat(0x6b4a3a));
      door.position.set(shop ? w * 0.32 : 0, 0.7, d / 2 + 0.03);
      g.add(door);
      g.position.set(x, 0, z);
      g.rotation.y = rotY;
      ground.add(g);
    };
    for (let x = -34; x < 34; ) {
      const w = 4 + r() * 3;
      house(x + w / 2, -18.5, w, 5, 4.5 + r() * 9, 0, r() < 0.6);
      x += w + 0.4;
    }
    for (const side of [-1, 1])
      for (let z = -12; z < 10; ) {
        const w = 4 + r() * 2.5;
        house(side * 16, z + w / 2, w, 5, 4 + r() * 7, (-side * Math.PI) / 2, false);
        z += w + 0.5;
      }
    const inst = (list, geo, mat) => {
      const im = new THREE.InstancedMesh(geo, mat, Math.max(1, list.length));
      list.forEach((w, i) => {
        w.g.updateMatrixWorld();
        m4.makeTranslation(w.x, w.y, w.z).premultiply(w.g.matrixWorld);
        im.setMatrixAt(i, m4);
      });
      im.count = list.length;
      ground.add(im);
    };
    inst(frames, new THREE.BoxGeometry(0.74, 0.94, 0.05), flat(0xf6f1ea));
    inst(
      lit,
      new THREE.BoxGeometry(0.6, 0.8, 0.06),
      flat(0xffd27a, { emissive: 0xffb84d, emissiveIntensity: 0.9 }),
    );
    inst(
      dark,
      new THREE.BoxGeometry(0.6, 0.8, 0.06),
      flat(night ? 0x2b3352 : 0x55709c, { roughness: 0.12, metalness: 0.35 }),
    );
    inst(
      frames.map((f) => ({ ...f, y: f.y - 0.52, z: f.z + 0.06 })),
      new THREE.BoxGeometry(0.86, 0.07, 0.16),
      flat(0xf6f1ea),
    );

    // street furniture along the road and on the plaza edge
    for (const x of [-15, -6, 6, 15]) place(lamp({ on: night }), x, -6.9);
    for (const x of [-10, 10]) place(planter(Math.abs(x)), x, -4.8);
    place(bench(), -12.5, -5.3);
    place(bench(), 12.5, -5.3);
    place(bin(), -8.2, -5.6);
    place(bike(0x2f9bff), 8.4, -5.5, 0.2);
    place(bike(0xffd23f), 9.2, -5.6, 0.15);
    car(9, -8.2, 0xe2453c);
    car(-12, -10.3, 0x3c7be2, Math.PI);
    car(20, -10.3, 0xf2c230, Math.PI);
  },

  // Beach: sand in front, turquoise sea behind, palms, umbrella, a boat.
  strand() {
    // wavy shoreline at z ≈ -7: dry sand in front, wet sand along the
    // water, the beach sloping on under the (see-through) shallow sea
    const shore = (x) => -(7 + Math.sin(x * 0.35) * 0.8 + Math.sin(x * 0.11) * 1.2);
    const sandGeo = discGeo(62, 1.1, 9);
    const sp = sandGeo.attributes.position;
    for (let i = 0; i < sp.count; i++) {
      const x = sp.getX(i);
      const z = sp.getZ(i);
      const d = Math.hypot(x, z);
      const below = shore(x) - z; // > 0 = under water
      let y;
      if (below > 0) y = -Math.min(2.5, below * 0.09 + below * below * 0.004);
      else {
        // dunes and ripples away from the stage
        const k = Math.min(1, Math.max(0, (d - 6) / 10));
        y =
          (noise2(x * 0.18, z * 0.18, 4) - 0.35) * 0.9 * k + Math.sin(x * 2.1 + z * 0.7) * 0.02 * k;
        y = Math.max(y, 0) * Math.min(1, -below / 3);
      }
      sp.setY(i, y);
    }
    sandGeo.computeVertexNormals();
    const sand = new THREE.Mesh(
      patches(facet(sandGeo, 0.05, 9), {
        amt: 0.07,
        scale: 0.2,
        seed: 9,
        // wet, darker band along the water line
        fn: (x, z) => {
          const above = z - shore(x);
          return above < 1.6 ? -0.2 * (1 - Math.max(0, above) / 1.6) : 0;
        },
      }),
      facetMat(flat(0xf2dcae)),
    );
    sand.receiveShadow = true;
    ground.add(sand);
    sea({ zFrom: -4.5 });
    // foam: a line that washes in and out
    const foamPts = [];
    for (let x = -60; x <= 60; x += 2) foamPts.push(V(x, 0.0, shore(x) + 0.15));
    const foam = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(foamPts), 240, 0.1, 4),
      new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 }),
    );
    foam.scale.y = 0.4;
    ground.add(foam);
    onFrame((t) => {
      const k = Math.sin(t * 0.9);
      foam.position.z = k * 0.35;
      foam.material.opacity = 0.55 + 0.35 * (0.5 - 0.5 * k);
    });

    const trunkMat = flat(0x9b6b3d);
    const frondMat = flat(0x4caf50);
    const frondMat2 = flat(0x3d9443);
    const palm = (x, z, s, seed) => {
      const g = new THREE.Group();
      const lean = 0.25 + (seed % 3) * 0.1;
      const pts = [];
      for (let k = 0; k <= 6; k++) pts.push(V(Math.sin((k / 6) * 1.2) * lean * 2, k * 0.75, 0));
      const trunk = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 0.16, 6),
        trunkMat,
      );
      trunk.castShadow = true;
      g.add(trunk);
      const top = pts[pts.length - 1];
      for (let k = 0; k < 7; k++) {
        const f = new THREE.Mesh(
          new THREE.ConeGeometry(0.32, 2.2, 4),
          k % 2 ? frondMat : frondMat2,
        );
        f.scale.z = 0.25;
        f.position.copy(top);
        f.rotation.set(0, (k / 7) * Math.PI * 2, 0);
        f.rotateZ(-1.9);
        f.translateY(1.0);
        f.castShadow = true;
        g.add(f);
      }
      for (let k = 0; k < 3; k++) {
        const c = new THREE.Mesh(new THREE.SphereGeometry(0.13, 6, 5), flat(0x6b4a2a));
        c.position.set(top.x + Math.cos(k * 2.1) * 0.18, top.y - 0.2, Math.sin(k * 2.1) * 0.18);
        g.add(c);
      }
      g.position.set(x, 0, z);
      g.scale.setScalar(s);
      g.rotation.y = seed;
      ground.add(g);
    };
    [
      [-8.5, -2, 1.1],
      [-10, 3, 0.95],
      [8.8, -3, 1.15],
      [11, 2.5, 1.0],
      [-14, -4, 1.2],
      [15, -4.5, 1.05],
      [-9, 10, 0.9],
      [13, 7, 1.0],
    ].forEach(([x, z, s], i) => palm(x, z, s, i + 2));

    // umbrella + towel, a few shells/rocks, a sailing boat
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 6), M.chrome), -7.5, 1.1, 5.5);
    const umb = add(
      new THREE.Mesh(new THREE.ConeGeometry(1.4, 0.6, 8), flat(0xff6b6b)),
      -7.5,
      2.3,
      5.5,
    );
    umb.castShadow = true;
    add(
      new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.03, 1.8), flat(0x5ab0ff)),
      -6.6,
      0.02,
      6.2,
      false,
    );
    rocks(18, 7, 20, 78, flat(0xc9b9a3));
    const boat = new THREE.Group();
    const hull = new THREE.Mesh(new THREE.BoxGeometry(3, 0.6, 1.1), flat(0xffffff));
    hull.position.y = 0.2;
    boat.add(hull);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.2, 6), M.wood);
    mast.position.y = 1.9;
    boat.add(mast);
    const sail = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.6, 3), flat(0xffe9c7));
    sail.scale.z = 0.08;
    sail.position.set(0.55, 1.9, 0);
    boat.add(sail);
    boat.position.set(-14, 0, -26);
    ground.add(boat);
    onFrame((t) => {
      boat.position.y = Math.sin(t * 1.3) * 0.08;
      boat.rotation.z = Math.sin(t * 1.1) * 0.04;
    });
    // beach grass on the dunes, away from the water and the stage
    meadow({
      n: 90,
      rMin: 6,
      rMax: 24,
      seed: 23,
      flowers: 0,
      tint: [0x8fae4a, 0xa9bf5e, 0x7d9a3e],
      keep: (x, z) => z > -4 && (Math.abs(x) > 7 || z > 6),
    });
  },

  // Snowy mountain village: snow ground, snowy pines, big peaks, a cabin,
  // gently falling snow.
  winter(sky, o) {
    const r = rng(23 + o.seed);
    // snow with blue-shaded hollows and bright crests
    bigGround(0xeef3fa, 75, 5, { amt: 0.07, scale: 0.18, warm: -0.6 });
    for (let i = 0; i < 18; i++) {
      const a = r() * Math.PI * 2;
      const d = 8 + r() * 20;
      const x = Math.cos(a) * d;
      const z = Math.sin(a) * d;
      const mound = add(
        new THREE.Mesh(jitter(new THREE.SphereGeometry(1, 8, 5), 0.06, i), flat(0xf7faff)),
        x,
        -0.2,
        z,
        false,
      );
      mound.scale.set(1.2 + r() * 1.5, 0.45, 1.0 + r() * 1.2);
    }
    const peakMat = flat(0x9aa3c9);
    for (let i = 0; i < 11; i++) {
      const a = Math.PI * (1.05 + (i / 10) * 0.9) + (r() - 0.5) * 0.15; // behind the stage
      const d = 48 + r() * 18;
      const h = 14 + r() * 14;
      const rad = 10 + r() * 8;
      const g = new THREE.Group();
      g.add(F(jitter(new THREE.ConeGeometry(rad, h, 7, 2), 0.6, 30 + i), peakMat, 0.1, 30 + i));
      const cap = F(
        jitter(new THREE.ConeGeometry(rad * 0.38, h * 0.38, 7), 0.3, 60 + i),
        snowMat,
        0.05,
        60 + i,
      );
      cap.position.y = h * 0.31;
      g.add(cap);
      g.position.set(Math.sin(a) * d, h / 2 - 1, Math.cos(a) * d);
      ground.add(g);
    }
    [
      [-7.5, -2.5, 1.2],
      [-9, 2, 1.0],
      [8, -3, 1.3],
      [9.5, 2.5, 1.0],
      [-4, -8, 1.4],
      [3.5, -9, 1.2],
      [-12, -6, 1.5],
      [13, -7, 1.4],
      [-9, 9, 1.0],
      [12, 6, 1.1],
      [0, -12, 1.6],
      [-16, 1, 1.3],
      [17, 2, 1.2],
    ].forEach(([x, z, s], i) => pine(x, z, s, i + 3, true));
    // cabin
    const cabin = new THREE.Group();
    const walls = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.2, 2.6), M.wood);
    walls.position.y = 1.1;
    walls.castShadow = true;
    cabin.add(walls);
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-1.9, 0);
    roofShape.lineTo(0, 1.4);
    roofShape.lineTo(1.9, 0);
    roofShape.lineTo(-1.9, 0);
    const roof = new THREE.Mesh(
      new THREE.ExtrudeGeometry(roofShape, { depth: 3.0, bevelEnabled: false }),
      snowMat,
    );
    roof.position.set(0, 2.2, -1.5);
    cabin.add(roof);
    const win = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.6, 0.06),
      flat(0xffd27a, { emissive: 0xffb84d, emissiveIntensity: 0.8 }),
    );
    win.position.set(0.7, 1.3, 1.31);
    cabin.add(win);
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.0, 0.4), flat(0x8a7f86));
    chimney.position.set(0.9, 3.0, -0.4);
    cabin.add(chimney);
    cabin.position.set(-11, 0, -11);
    cabin.rotation.y = 0.5;
    ground.add(cabin);
    // chimney smoke: soft puffs rising and fading (deterministic)
    cabin.updateMatrixWorld();
    const smokeAt = chimney.getWorldPosition(V(0, 0, 0)).add(V(0, 0.55, 0));
    const smokeMat = new THREE.MeshStandardMaterial({
      color: 0xf4f2f6,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      flatShading: true,
    });
    const smoke = Array.from({ length: 9 }, (_, i) => {
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.35, 0), smokeMat.clone());
      m.userData.noAO = true;
      ground.add(m);
      return { m, ph: i / 9 };
    });
    onFrame((t) => {
      for (const { m, ph } of smoke) {
        const k = (t * 0.18 + ph) % 1;
        m.position
          .copy(smokeAt)
          .add(V(k * 1.8 + Math.sin(k * 6 + ph * 9) * 0.2, k * 4.2, -k * 0.6));
        m.scale.setScalar(0.5 + k * 1.6);
        m.material.opacity = 0.55 * Math.sin(Math.PI * Math.min(1, k * 1.3));
      }
    });
    // frozen pond, a snowman, a fence half buried in snow
    const ice = new THREE.Mesh(
      patches(facet(discGeo(3.2, 0.5, 8), 0.05, 8), { amt: 0.08, scale: 0.6, seed: 8 }),
      facetMat(
        new THREE.MeshStandardMaterial({
          color: 0xbfe3f5,
          roughness: 0.08,
          metalness: 0.1,
          envMapIntensity: 1.5,
        }),
      ),
    );
    ice.scale.set(1.3, 1, 0.8);
    ice.position.set(9.5, 0.03, 7.5);
    ground.add(ice);
    place(snowman(), -7.2, -5.2, 0.5);
    place(fence(9, 0x8a6a4a), 2, -6.8, 0.05);

    // falling snow (deterministic)
    const N = 260;
    const flakes = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.035, 5, 4),
      flat(0xffffff),
      N,
    );
    flakes.frustumCulled = false;
    ground.add(flakes);
    const seeds = Array.from({ length: N }, () => [r(), r(), r(), r()]);
    const m4 = new THREE.Matrix4();
    onFrame((t) => {
      seeds.forEach(([a, b, c, d], i) => {
        const y = 12 - ((t * (0.6 + d * 0.5) + a * 12) % 12);
        m4.makeTranslation((b - 0.5) * 26 + Math.sin(t * 0.7 + i) * 0.3, y, (c - 0.5) * 26);
        flakes.setMatrixAt(i, m4);
      });
      flakes.instanceMatrix.needsUpdate = true;
    });
  },

  // Countryside: meadow, dirt road, striped fields, red barn + silo, fence,
  // hay bales.
  land(sky, o) {
    bigGround(0x86c45a, 75, 5, { amt: 0.12, scale: 0.1, warm: 0.5 });
    add(new THREE.Mesh(new THREE.BoxGeometry(90, 0.05, 3.2), flat(0xc9a46b)), 0, 0.02, -7.5, false);
    const fieldCols = [0xe9c85a, 0x9b6b45, 0x6db33c, 0xd9b44a, 0x8a5e3c];
    for (let i = 0; i < 9; i++) {
      const f = add(
        new THREE.Mesh(new THREE.BoxGeometry(10, 0.12, 22), flat(fieldCols[i % fieldCols.length])),
        -42 + i * 10.5,
        0.05,
        -22,
        false,
      );
      f.rotation.y = 0.05;
    }
    // fence along the road
    for (let x = -30; x <= 30; x += 2.5) {
      add(new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.0, 0.14), M.woodDark), x, 0.5, -5.6);
    }
    for (const y of [0.45, 0.85])
      add(new THREE.Mesh(new THREE.BoxGeometry(60, 0.08, 0.06), M.wood), 0, y, -5.6, false);
    // barn + silo
    const barn = new THREE.Group();
    const walls = new THREE.Mesh(new THREE.BoxGeometry(5, 3.4, 4), flat(0xc0392b));
    walls.position.y = 1.7;
    walls.castShadow = true;
    barn.add(walls);
    const rs = new THREE.Shape();
    rs.moveTo(-2.8, 0);
    rs.lineTo(0, 2);
    rs.lineTo(2.8, 0);
    rs.lineTo(-2.8, 0);
    const roof = new THREE.Mesh(
      new THREE.ExtrudeGeometry(rs, { depth: 4.4, bevelEnabled: false }),
      flat(0x5b4a46),
    );
    roof.position.set(0, 3.4, -2.2);
    barn.add(roof);
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.2, 0.08), flat(0xf4efe6));
    door.position.set(0, 1.1, 2.03);
    barn.add(door);
    barn.position.set(-13, 0, -13);
    barn.rotation.y = 0.35;
    ground.add(barn);
    const silo = add(
      new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 6, 12), flat(0xd8d2cc)),
      -8.6,
      3,
      -15.5,
    );
    silo.castShadow = true;
    add(
      new THREE.Mesh(
        new THREE.SphereGeometry(1.1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2),
        flat(0x8a96a3),
      ),
      -8.6,
      6,
      -15.5,
    );
    // hay bales
    for (const [x, z] of [
      [9, -9.5],
      [11.2, -10.4],
      [10.1, -12.2],
      [-17, -4],
    ]) {
      const b = add(
        new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 1.2, 12), flat(0xe8c766)),
        x,
        0.75,
        z,
      );
      b.rotation.z = Math.PI / 2;
    }
    [
      [-8, -2, 1.0],
      [8.5, -2.5, 1.1],
      [-10, 4, 0.9],
      [10, 4.5, 1.0],
      [16, -6, 1.3],
      [-20, -6, 1.2],
      [12, 8, 1.0],
      [-8, 12, 1.1],
    ].forEach(([x, z, s], i) => tree(x, z, s, i + 5));
    rocks(10, 7, 18, 58 + o.seed);
    // dirt path from the stage to the road, a paddock with cows, bushes
    const path = new THREE.Mesh(
      patches(facet(new THREE.PlaneGeometry(2.2, 12, 3, 12).rotateX(-Math.PI / 2), 0.08, 4), {
        amt: 0.1,
        scale: 0.6,
        seed: 4,
      }),
      facetMat(flat(0xc9a46b)),
    );
    path.position.set(-2.6, 0.015, -1.5);
    path.rotation.y = 0.12;
    path.receiveShadow = true;
    ground.add(path);
    place(cow(1 + o.seed), -8.6, 6.8, 0.6);
    place(cow(2 + o.seed), -11, 9.2, -0.4);
    place(sheep(3 + o.seed), 13, 7.5, 2.4);
    place(sheep(4 + o.seed), 14.3, 9, 2.0);
    scatter((i) => bush(i + 11 + o.seed), 7, {
      rMin: 9,
      rMax: 22,
      seed: 13 + o.seed,
      keep: (x, z) => z > -5,
    });
    // furrows on the fields
    const furrow = new THREE.InstancedMesh(
      new THREE.BoxGeometry(9.6, 0.08, 0.22),
      flat(0x000000, { transparent: true, opacity: 0.12 }),
      9 * 14,
    );
    let fi = 0;
    for (let i = 0; i < 9; i++)
      for (let k = 0; k < 14; k++) {
        const m4 = new THREE.Matrix4()
          .makeRotationY(0.05)
          .setPosition(-42 + i * 10.5, 0.13, -12 + -k * 1.5);
        furrow.setMatrixAt(fi++, m4);
      }
    furrow.userData.noAO = true;
    ground.add(furrow);
    // meadow in front of the road and fields only
    meadow({
      n: 520,
      rMin: 2.6,
      rMax: 26,
      seed: 11 + o.seed,
      keep: (x, z) => z > -5.4,
      flowers: 0.35,
    });
  },

  // Space: the stage is a small moon-rock island floating in front of the
  // Earth, a ringed planet far off, a satellite passing — for anything in
  // orbit, rockets, "Was passiert, wenn … im Weltall".
  weltall(sky, o) {
    scene.fog = null;
    const r = rng(61 + o.seed);
    const regolith = flat(0xa7a3ad);
    // crater-dented top
    const craters = Array.from({ length: 7 }, () => {
      const a = r() * Math.PI * 2;
      const d = 4.8 + r() * 3.2;
      return [Math.cos(a) * d, Math.sin(a) * d, 0.6 + r() * 0.9];
    });
    const topGeo = discGeo(9.2, 0.55, 61, () => 0);
    const tp = topGeo.attributes.position;
    for (let i = 0; i < tp.count; i++) {
      const x = tp.getX(i);
      const z = tp.getZ(i);
      let y = 0;
      if (Math.hypot(x, z) > 4.6) {
        y += (noise2(x * 0.5, z * 0.5, 2) - 0.5) * 0.25;
        for (const [cx, cz, cr] of craters) {
          const q = Math.hypot(x - cx, z - cz) / cr;
          if (q < 1.4)
            y += q < 1 ? -0.35 * (1 - q * q) : 0.18 * Math.sin(((q - 1) / 0.4) * Math.PI);
        }
      }
      tp.setY(i, y);
    }
    topGeo.computeVertexNormals();
    const top = new THREE.Mesh(
      patches(facet(topGeo, 0.07, 61), { amt: 0.12, scale: 0.3, seed: 6, warm: 0 }),
      facetMat(regolith),
    );
    top.receiveShadow = true;
    ground.add(top);
    const rim = F(
      jitter(new THREE.CylinderGeometry(9.2, 8.6, 1.0, 36, 2, true), 0.15, 62),
      regolith,
      0.1,
      62,
    );
    rim.position.y = -0.5;
    ground.add(rim);
    const under = F(
      jitter(new THREE.ConeGeometry(8.6, 6, 14, 3), 0.6, 63),
      flat(0x7b7682),
      0.14,
      63,
    );
    under.rotation.x = Math.PI;
    under.position.y = -4;
    ground.add(under);
    for (let i = 0; i < 12; i++) {
      const a = r() * Math.PI * 2;
      const d = 5 + r() * 3.6;
      add(
        F(
          jitter(new THREE.DodecahedronGeometry(0.15 + r() * 0.35, 0), 0.05, 70 + i),
          flat(0x8d8893),
          0.14,
          70 + i,
        ),
        Math.cos(a) * d,
        0.08,
        Math.sin(a) * d,
      );
    }
    // the Earth: oceans, continents, ice caps, a thin blue atmosphere
    const earthGeo = facet(new THREE.IcosahedronGeometry(30, 4), 0.04, 9);
    const ep = earthGeo.attributes.position;
    const ec = earthGeo.attributes.color;
    const ocean = new THREE.Color(0x2a6fd1);
    const land = [new THREE.Color(0x4f9a45), new THREE.Color(0x8c7a4a), new THREE.Color(0x3f8040)];
    const ice = new THREE.Color(0xf4f8ff);
    const c = new THREE.Color();
    for (let i = 0; i < ep.count; i += 3) {
      const x = (ep.getX(i) + ep.getX(i + 1) + ep.getX(i + 2)) / 90;
      const y = (ep.getY(i) + ep.getY(i + 1) + ep.getY(i + 2)) / 90;
      const z = (ep.getZ(i) + ep.getZ(i + 1) + ep.getZ(i + 2)) / 90;
      const n =
        noise2(x * 2.2 + z * 1.3, y * 2.2 - z * 0.7, 5) * 0.7 +
        noise2(x * 5, y * 5 + z * 3, 6) * 0.3;
      if (Math.abs(y) > 0.82) c.copy(ice);
      else if (n > 0.56) c.copy(land[Math.floor(n * 37) % 3]);
      else c.copy(ocean).multiplyScalar(0.85 + n * 0.3);
      for (let j = 0; j < 3; j++)
        ec.setXYZ(i + j, ec.getX(i + j) * c.r, ec.getY(i + j) * c.g, ec.getZ(i + j) * c.b);
    }
    const earth = new THREE.Mesh(
      earthGeo,
      new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.7 }),
    );
    earth.position.set(-46, -16, -115);
    ground.add(earth);
    const atmo = new THREE.Mesh(
      new THREE.SphereGeometry(31.6, 48, 32),
      new THREE.MeshBasicMaterial({
        color: 0x6fb6ff,
        transparent: true,
        opacity: 0.22,
        side: THREE.BackSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    atmo.position.copy(earth.position);
    atmo.userData.noAO = true;
    ground.add(atmo);
    onFrame((t) => (earth.rotation.y = t * 0.02));
    // ringed planet far away
    const planet = F(new THREE.IcosahedronGeometry(7, 2), flat(0xe0b27a), 0.08, 12);
    planet.position.set(58, 34, -140);
    ground.add(planet);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(9.5, 14, 48, 1),
      flat(0xf1d9b0, { side: THREE.DoubleSide, transparent: true, opacity: 0.85 }),
    );
    ring.position.copy(planet.position);
    ring.rotation.set(1.2, 0.3, 0.2);
    ring.userData.noAO = true;
    ground.add(ring);
    // satellite drifting across
    const sat = new THREE.Group();
    sat.add(new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.9), M.chrome));
    for (const s of [-1, 1]) {
      const p = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.04, 0.7),
        flat(0x2d4d9a, { metalness: 0.6, roughness: 0.25 }),
      );
      p.position.x = s * 1.15;
      sat.add(p);
    }
    ground.add(sat);
    onFrame((t) => {
      sat.position.set(-30 + ((t * 0.6) % 60), 14 + Math.sin(t * 0.1) * 2, -40);
      sat.rotation.set(t * 0.2, t * 0.13, 0);
    });
  },

  // Deep sea: sandy seabed, rocks, corals, swaying kelp, light shafts from
  // the surface, drifting particles, rising bubbles, a fish school — for
  // Tiefsee, U-Boot, "Was passiert, wenn du ganz tief tauchst".
  tiefsee(sky, o) {
    const r = rng(81 + o.seed);
    bigGround(0xc9b48a, 75, 81, { amt: 0.14, scale: 0.14, warm: 0.2 });
    // seabed dunes
    for (let i = 0; i < 14; i++) {
      const a = r() * Math.PI * 2;
      const d = 9 + r() * 22;
      const m = add(
        new THREE.Mesh(
          facet(jitter(new THREE.SphereGeometry(1, 9, 5), 0.08, i), 0.06, i),
          facetMat(flat(0xbfa87e)),
        ),
        Math.cos(a) * d,
        -0.3,
        Math.sin(a) * d,
        false,
      );
      m.scale.set(2 + r() * 3, 0.6 + r() * 0.5, 1.5 + r() * 2.5);
    }
    // big rocks behind, small rocks around
    const stone = flat(0x6f7f8f);
    for (let i = 0; i < 9; i++) {
      const a = Math.PI * (1.1 + r() * 0.8);
      const d = 12 + r() * 16;
      const m = add(
        F(
          jitter(new THREE.DodecahedronGeometry(1.5 + r() * 2.5, 1), 0.3, 90 + i),
          stone,
          0.12,
          90 + i,
        ),
        Math.sin(a) * d,
        0.4,
        Math.cos(a) * d,
      );
      m.scale.y = 0.7 + r() * 0.6;
    }
    rocks(16, 6, 16, 95 + o.seed, flat(0x7c8a96));
    // corals: branching ones, brain corals, fans
    const coralCols = o.palette?.corals ?? [0xff6f91, 0xff9f5a, 0xb07cff, 0xffd166, 0x4fd1c5];
    const coral = (i) => {
      const g = new THREE.Group();
      const col = flat(coralCols[i % coralCols.length], { roughness: 0.6 });
      const kind = i % 3;
      if (kind === 0) {
        for (let k = 0; k < 5; k++) {
          const b = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.09, 0.7 + r() * 0.6, 5), col);
          b.position.set((r() - 0.5) * 0.3, 0.35, (r() - 0.5) * 0.3);
          b.rotation.set((r() - 0.5) * 0.9, 0, (r() - 0.5) * 0.9);
          g.add(b);
        }
      } else if (kind === 1) {
        const m = F(jitter(new THREE.IcosahedronGeometry(0.45, 1), 0.06, i), col, 0.12, i);
        m.scale.y = 0.65;
        m.position.y = 0.25;
        g.add(m);
      } else {
        const m = new THREE.Mesh(
          new THREE.CircleGeometry(0.6, 7, 0, Math.PI),
          flat(coralCols[(i + 2) % coralCols.length], { side: THREE.DoubleSide }),
        );
        m.position.y = 0.05;
        g.add(m);
      }
      return g;
    };
    scatter(coral, 26, { rMin: 5.5, rMax: 16, seed: 83 + o.seed });
    // kelp: tall strips that sway
    const kelpMat = flat(0x3f8f4f, { side: THREE.DoubleSide });
    const kelps = scatter(
      () => {
        const g = new THREE.Group();
        const h = 2.5 + r() * 3.5;
        const m = new THREE.Mesh(new THREE.PlaneGeometry(0.35, h, 1, 8), kelpMat);
        m.position.y = h / 2;
        g.add(m);
        return g;
      },
      22,
      { rMin: 7, rMax: 20, seed: 85 + o.seed, keep: (x, z) => z < 2 || Math.abs(x) > 10 },
    );
    onFrame((t) => kelps.forEach((k, i) => (k.rotation.z = Math.sin(t * 0.7 + i) * 0.12)));
    // light shafts from the surface
    const shaftMat = new THREE.MeshBasicMaterial({
      color: 0x9fe8ff,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const shafts = [];
    for (let i = 0; i < 7; i++) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 2.2, 26, 6, 1, true), shaftMat);
      m.position.set(-14 + i * 4.6 + r() * 2, 11, -6 - r() * 10);
      m.rotation.z = 0.25;
      m.userData = { noAO: true, ph: r() * 6 };
      ground.add(m);
      shafts.push(m);
    }
    onFrame((t) =>
      shafts.forEach((m) => (m.material.opacity = 0.06 + 0.04 * Math.sin(t * 0.5 + m.userData.ph))),
    );
    // drifting particles + rising bubbles + a fish school circling behind
    const N = 300;
    const snow = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(0.03, 0),
      new THREE.MeshBasicMaterial({ color: 0xdff6ff }),
      N,
    );
    snow.userData.noAO = true;
    snow.frustumCulled = false;
    ground.add(snow);
    const seeds = Array.from({ length: N }, () => [r(), r(), r()]);
    const m4 = new THREE.Matrix4();
    onFrame((t) => {
      seeds.forEach(([a, b, c], i) => {
        m4.makeTranslation(
          (a - 0.5) * 30 + Math.sin(t * 0.3 + i) * 0.4,
          ((b * 12 - t * 0.12 * (0.5 + c)) % 12) + (b * 12 - t * 0.12 * (0.5 + c) < 0 ? 12 : 0),
          (c - 0.5) * 30,
        );
        snow.setMatrixAt(i, m4);
      });
      snow.instanceMatrix.needsUpdate = true;
    });
    const bubbleMat = new THREE.MeshStandardMaterial({
      color: 0xe8fbff,
      transparent: true,
      opacity: 0.55,
      roughness: 0.05,
      depthWrite: false,
    });
    const bubbles = Array.from({ length: 24 }, (_, i) => {
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06 + (i % 4) * 0.03, 1), bubbleMat);
      m.userData.noAO = true;
      ground.add(m);
      return m;
    });
    onFrame((t) =>
      bubbles.forEach((m, i) => {
        const k = (t * 0.25 + i / 24) % 1;
        m.position.set(
          -7.5 + (i % 3) * 0.3 + Math.sin(t * 2 + i) * 0.15,
          k * 12,
          -8 + (i % 2) * 0.4,
        );
      }),
    );
    const fishMat = flat(0xffb347, { roughness: 0.4 });
    const fish = Array.from({ length: 14 }, (_, i) => {
      const f = new THREE.Mesh(
        new THREE.ConeGeometry(0.12, 0.45, 5).rotateZ(-Math.PI / 2),
        fishMat,
      );
      ground.add(f);
      return { f, i };
    });
    onFrame((t) =>
      fish.forEach(({ f, i }) => {
        const a = t * 0.18 + i * 0.09;
        f.position.set(
          Math.cos(a) * 14 + (i % 4) * 0.4,
          4 + (i % 5) * 0.35 + Math.sin(t + i) * 0.1,
          -10 + Math.sin(a) * 5 + (i % 3) * 0.4,
        );
        f.rotation.y = -a - Math.PI / 2;
      }),
    );
  },

  // Above the clouds: no ground, a sea of cumulus below the stage, a few
  // towers on the horizon — for planes, parachutes, weather, birds.
  wolken(sky, o) {
    const r = rng(91 + o.seed);
    const mat = facetMat(
      new THREE.MeshStandardMaterial({
        color: sky.cloud[0],
        emissive: sky.cloud[1],
        emissiveIntensity: 0.12,
        roughness: 1,
        flatShading: true,
      }),
    );
    // carpet: big flattened puffs on a ring grid, top surface about y = -1.6
    for (let i = 0; i < 170; i++) {
      const a = r() * Math.PI * 2;
      const d = 5 + Math.sqrt(r()) * 75;
      const g = new THREE.Group();
      cloudPuffs(g, 3 + Math.floor(r() * 3), 2.2 + r() * 2.4 + d * 0.02, mat, 200 + i);
      g.position.set(Math.cos(a) * d, -9 - r() * 1.5, Math.sin(a) * d);
      g.rotation.y = r() * Math.PI * 2;
      ground.add(g);
    }
    for (let i = 0; i < 6; i++) {
      const a = Math.PI * (1.15 + i * 0.13);
      const g = new THREE.Group();
      for (let k = 0; k < 4; k++) {
        const t = new THREE.Group();
        cloudPuffs(t, 4, 4.5 - k * 0.7, mat, 300 + i * 9 + k);
        t.position.y = k * 4;
        g.add(t);
      }
      g.position.set(Math.sin(a) * 75, -9, Math.cos(a) * 75);
      ground.add(g);
    }
  },

  // Kitchen counter: the stage is a big worktop by the window — tiles,
  // cabinets, jars, a fruit bowl, a plant — for anything in the kitchen.
  // Scale: about 1 unit ≈ 15 cm, so a 2.5-unit subject is appliance size.
  kueche(sky, o) {
    scene.fog = null;
    const r = rng(101 + o.seed);
    const worktop = o.palette?.worktop ?? 0xc49a6c;
    const cab = o.palette?.cabinets ?? 0x8fb8a8;
    // worktop slab and the cabinets below it, the room floor far below
    const top = new THREE.Mesh(
      patches(facet(new THREE.BoxGeometry(40, 0.8, 16, 20, 1, 8), 0.04, 3), {
        amt: 0.08,
        scale: 0.25,
        seed: 3,
      }),
      facetMat(flat(worktop, { roughness: 0.55 })),
    );
    top.position.set(0, -0.4, 1.5);
    top.receiveShadow = true;
    ground.add(top);
    for (let x = -18; x < 18; x += 4.5) {
      const d = new THREE.Mesh(new THREE.BoxGeometry(4.3, 9, 0.3), flat(cab));
      d.position.set(x + 2.25, -5.3, 9.4);
      ground.add(d);
      const h = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.18, 0.2), M.chrome);
      h.position.set(x + 2.25, -1.6, 9.65);
      ground.add(h);
    }
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), flat(0xb08a64));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -9.8;
    ground.add(floor);
    // back wall with tiles, a window with daylight, upper cabinets
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(60, 30, 0.4),
      flat(o.palette?.wall ?? 0xf6efe4),
    );
    wall.position.set(0, 12, -6.7);
    ground.add(wall);
    const tiles = [];
    for (let x = -20; x <= 20; x += 1.0)
      for (let y = 0.5; y < 6; y += 1.0) if (!(Math.abs(x) < 5.5 && y > 2.5)) tiles.push([x, y]);
    const tile = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.94, 0.94, 0.08),
      flat(0xffffff, { roughness: 0.2 }),
      tiles.length,
    );
    const m4 = new THREE.Matrix4();
    const tc = new THREE.Color();
    const tileCol = new THREE.Color(o.palette?.tiles ?? 0xbfe3dc);
    tiles.forEach(([x, y], i) => {
      tile.setMatrixAt(i, m4.makeTranslation(x, y, -6.46));
      tile.setColorAt(i, tc.copy(tileCol).multiplyScalar(0.94 + r() * 0.08));
    });
    tile.receiveShadow = true;
    ground.add(tile);
    const frame = flat(0xffffff);
    const win = new THREE.Group();
    // daylight outside: a bright sky with a soft green treeline
    win.add(
      new THREE.Mesh(
        new THREE.BoxGeometry(10, 8, 0.1),
        new THREE.MeshBasicMaterial({ color: 0xcfe8ff }),
      ),
    );
    const trees = new THREE.Mesh(
      new THREE.BoxGeometry(10, 2.2, 0.05),
      new THREE.MeshBasicMaterial({ color: 0x9fcf8a }),
    );
    trees.position.set(0, -2.9, 0.06);
    win.add(trees);
    for (const [w, h, x, y] of [
      [10.6, 0.5, 0, 4],
      [10.6, 0.5, 0, -4],
      [0.5, 8.5, -5.1, 0],
      [0.5, 8.5, 5.1, 0],
      [0.3, 8, 0, 0],
      [10, 0.3, 0, 0.5],
    ]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.4), frame);
      b.position.set(x, y, 0.2);
      win.add(b);
    }
    const sill = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.3, 1.2), frame);
    sill.position.set(0, -4.3, 0.5);
    win.add(sill);
    win.position.set(0, 7.5, -6.45);
    ground.add(win);
    for (const x of [-13.5, 13.5]) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(8.5, 6, 3.5), flat(cab));
      c.position.set(x, 12, -4.8);
      c.castShadow = true;
      ground.add(c);
      for (const dx of [-2.1, 2.1]) {
        const h = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.2, 0.2), M.chrome);
        h.position.set(x + dx * 0.25, 10, -2.95);
        ground.add(h);
      }
    }
    // things on the counter, all outside the stage
    const glass = new THREE.MeshStandardMaterial({
      color: 0xdff2ff,
      roughness: 0.05,
      transparent: true,
      opacity: 0.4,
    });
    for (const [x, z, h, fill] of [
      [-9.5, -4.6, 2.2, 0xf2e6c9],
      [-8, -4.8, 1.6, 0x9a6a38],
      [-6.8, -4.6, 1.9, 0xffd166],
    ]) {
      const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, h, 14), glass);
      jar.position.set(x, h / 2, z);
      jar.userData.noAO = true;
      ground.add(jar);
      add(
        new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, h * 0.6, 14), flat(fill)),
        x,
        h * 0.3,
        z,
      );
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.25, 14), M.wood), x, h + 0.12, z);
    }
    const bowl = add(
      new THREE.Mesh(
        new THREE.SphereGeometry(1.4, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
        flat(0xf4efe6, { side: THREE.DoubleSide }),
      ),
      9,
      1.4,
      -3.8,
    );
    bowl.scale.y = 0.6;
    for (let i = 0; i < 6; i++)
      add(
        F(
          new THREE.IcosahedronGeometry(0.42, 1),
          flat([0xd8352a, 0xffb347, 0x79c24a][i % 3]),
          0.06,
          i,
        ),
        9 + Math.cos(i) * 0.6,
        0.85 + (i % 2) * 0.35,
        -3.8 + Math.sin(i) * 0.6,
      );
    const board = add(
      new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.18, 2.6), M.wood),
      8.5,
      0.09,
      4.8,
    );
    board.rotation.y = -0.3;
    add(
      new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.6, 1.2, 10), flat(0xc0683f)),
      -9,
      0.6,
      5.5,
    );
    const herb = bush(7, 0x4f9a35);
    herb.position.set(-9, 1.0, 5.5);
    herb.scale.setScalar(0.9);
    ground.add(herb);
  },
};

export const ENVIRONMENTS = Object.keys(ENV_BUILDERS);
// Default light per environment (any SKIES key can be passed instead).
// ground colour each env shows the sky light from below
const GROUND = {
  insel: 0x79c24a,
  stadt: 0xbdb6ad,
  strand: 0x4fb7cf,
  winter: 0xeef3fa,
  land: 0x86c45a,
  weltall: 0x8d8893,
  tiefsee: 0x1c5a7a,
  wolken: 0xf4f8ff,
  kueche: 0xc49a6c,
};
const DEFAULT_SKY = {
  insel: "sonnenuntergang",
  stadt: "abend",
  strand: "mittag",
  winter: "morgen",
  land: "sonnenuntergang",
  weltall: "weltall",
  tiefsee: "tiefsee",
  wolken: "hoch",
  kueche: "morgen",
};

// Build sky + landscape. Call once, first thing in scene.js.
export function createWorld({ env = "insel", sky, seed = 0, palette = {} } = {}) {
  if (!ENV_BUILDERS[env]) throw new Error(`unknown env "${env}" (${ENVIRONMENTS.join(", ")})`);
  const skyName = sky ?? DEFAULT_SKY[env];
  if (!SKIES[skyName])
    throw new Error(`unknown sky "${skyName}" (${Object.keys(SKIES).join(", ")})`);
  buildSky(SKIES[skyName]);
  ENV_BUILDERS[env](SKIES[skyName], { seed, palette });
  skyLight(GROUND[env] ?? 0x808080);
  return { env, sky: skyName };
}
