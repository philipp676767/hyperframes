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
} from "./world.js";

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
};

function buildSky(sky) {
  const sunDir = V(-0.32, 0.07, -1).normalize();
  const vec = (c) => new THREE.Vector3(...c);
  scene.add(
    new THREE.Mesh(
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
        },
        vertexShader: `varying vec3 vDir;
      void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `uniform vec3 sunDir; uniform vec3 top; uniform vec3 mid; uniform vec3 hor;
      uniform vec3 below; uniform vec3 sunCol; varying vec3 vDir;
      void main(){
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 c;
        if (h > 0.0) { c = mix(hor, mid, smoothstep(0.0, 0.16, h)); c = mix(c, top, smoothstep(0.14, 0.62, h)); }
        else { c = mix(hor, below, smoothstep(0.0, 0.10, -h)); }
        float s = clamp(dot(d, sunDir), 0.0, 1.0);
        c += sunCol * (pow(s, 90.0) * 0.95 + pow(s, 10.0) * 0.28);
        // the gradient is authored in sRGB; hand three a linear colour so it
        // looks the same on the canvas and through post.js
        c = clamp(c, 0.0, 1.0);
        c = mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
      }),
    ),
  );
  scene.fog = new THREE.Fog(new THREE.Color().setRGB(...sky.below, THREE.SRGBColorSpace), 30, 95);

  const cloudMat = new THREE.MeshLambertMaterial({
    color: sky.cloud[0],
    emissive: sky.cloud[1],
    emissiveIntensity: 0.35,
    flatShading: true,
    fog: false,
  });
  // clouds drift slowly around the stage
  const clouds = new THREE.Group();
  scene.add(clouds);
  onFrame((t) => (clouds.rotation.y = t * 0.006));
  for (let i = 0; i < 16; i++) {
    const g = new THREE.Group();
    const a = (i / 16) * Math.PI * 2 + rand() * 0.3;
    const r = 55 + rand() * 30;
    g.position.set(Math.cos(a) * r, 6 + rand() * 20, Math.sin(a) * r);
    const n = 3 + Math.floor(rand() * 3);
    for (let k = 0; k < n; k++) {
      const m = new THREE.Mesh(
        jitter(new THREE.IcosahedronGeometry(1, 1), 0.08, i * 7 + k),
        cloudMat,
      );
      const s = 2.4 + rand() * 2.4;
      m.scale.set(s * 1.25, s * 0.75, s);
      m.position.set((k - n / 2) * 3 + rand(), rand() * 1.2, rand() * 1.5);
      g.add(m);
    }
    g.lookAt(0, g.position.y, 0);
    clouds.add(g);
  }
  birds();

  scene.add(new THREE.HemisphereLight(...sky.hemi));
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
function bigGround(color, r = 75, seed = 5) {
  const geo = discGeo(r, 3.2, seed, (x, z, d) => {
    if (d <= 36) return 0;
    const v = Math.sin(x * 0.21 + seed) * Math.cos(z * 0.17 - seed) * 0.5 + 0.5;
    return ((d - 36) / (r - 36)) * (2 + 4 * v);
  });
  const m = new THREE.Mesh(facet(geo, 0.06, seed), facetMat(flat(color)));
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

// ---------------------------------------------------------------- environments
const ENV_BUILDERS = {
  // The original floating island (fridge video).
  insel() {
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
    const capGeo = discGeo(9, 0.75, 3);
    const top = F(capGeo, M.grass, 0.06, 3);
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
    meadow({ n: 240, rMin: 2.6, rMax: 8.4, seed: 7 });
  },

  // City street: plaza, road with markings behind, pastel houses with window
  // grids, street lamps, parked cars.
  stadt(sky) {
    const r = rng(41);
    bigGround(0xbdb6ad);
    add(new THREE.Mesh(new THREE.BoxGeometry(40, 0.06, 15), flat(0xd9d3cc)), 0, 0.0, 0.5, false);
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
        -9.2 + dz - 0.0,
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
    add(new THREE.Mesh(new THREE.BoxGeometry(90, 0.12, 4), flat(0xcfc8c0)), 0, 0.06, -13.9, false);

    // houses: back row facing +z, side rows facing the centre
    const pastel = [0xe9b8a8, 0xf2d0a4, 0xb8c7e0, 0xc9b3d9, 0xa8d5c2, 0xf0e2b6, 0xe7a9b5];
    const winMat = sky.nightWindows
      ? flat(0xffd27a, { emissive: 0xffb84d, emissiveIntensity: 0.9 })
      : flat(0x5a6f99, { roughness: 0.25 });
    const wins = [];
    const house = (x, z, w, d, h, rotY) => {
      const g = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        flat(pastel[Math.floor(r() * pastel.length)]),
      );
      body.position.y = h / 2;
      body.castShadow = true;
      body.receiveShadow = true;
      g.add(body);
      const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, 0.3, d + 0.3), flat(0x8a7f86));
      roof.position.y = h + 0.15;
      g.add(roof);
      const cols = Math.max(1, Math.floor((w - 0.6) / 1.1));
      const rows = Math.max(1, Math.floor((h - 1.4) / 1.3));
      for (let cx = 0; cx < cols; cx++)
        for (let ry = 0; ry < rows; ry++)
          wins.push({
            g,
            x: -((cols - 1) * 1.1) / 2 + cx * 1.1,
            y: 1.6 + ry * 1.3,
            z: d / 2 + 0.03,
          });
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.3, 0.08), flat(0x6b4a3a));
      door.position.set(0, 0.65, d / 2 + 0.03);
      g.add(door);
      g.position.set(x, 0, z);
      g.rotation.y = rotY;
      ground.add(g);
    };
    for (let x = -34; x < 34; ) {
      const w = 4 + r() * 3;
      house(x + w / 2, -18.5, w, 5, 4 + r() * 9, 0);
      x += w + 0.4;
    }
    for (const side of [-1, 1])
      for (let z = -12; z < 10; ) {
        const w = 4 + r() * 2.5;
        house(side * 16, z + w / 2, w, 5, 4 + r() * 7, (-side * Math.PI) / 2);
        z += w + 0.5;
      }
    const winGeo = new THREE.BoxGeometry(0.6, 0.8, 0.06);
    const wm = new THREE.InstancedMesh(winGeo, winMat, wins.length);
    const m4 = new THREE.Matrix4();
    wins.forEach((w, i) => {
      w.g.updateMatrixWorld();
      m4.makeTranslation(w.x, w.y, w.z).premultiply(w.g.matrixWorld);
      wm.setMatrixAt(i, m4);
    });
    ground.add(wm);

    // street lamps along the road, planters, parked cars
    const lampMat = sky.nightWindows
      ? flat(0xfff1c2, { emissive: 0xffd27a, emissiveIntensity: 1.2 })
      : flat(0xfff6dc);
    for (const x of [-15, -6, 6, 15]) {
      const pole = add(
        new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 4.2, 6), M.steel),
        x,
        2.1,
        -6.9,
      );
      pole.castShadow = true;
      add(new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.12), M.steel), x, 4.15, -7.3);
      add(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.3), lampMat), x, 4.05, -7.7, false);
    }
    for (const x of [-10, 10]) {
      add(
        new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.6, 0.6, 10), flat(0xc9c1b8)),
        x,
        0.3,
        -4.8,
      );
      tree(x, -4.8, 0.85, Math.abs(x));
    }
    car(9, -8.2, 0xe2453c);
    car(-12, -10.3, 0x3c7be2, Math.PI);
    car(20, -10.3, 0xf2c230, Math.PI);
  },

  // Beach: sand in front, turquoise sea behind, palms, umbrella, a boat.
  strand() {
    const sea = new THREE.Mesh(
      new THREE.CircleGeometry(80, 48),
      new THREE.MeshStandardMaterial({ color: 0x3fb8d0, roughness: 0.25, metalness: 0.1 }),
    );
    sea.rotation.x = -Math.PI / 2;
    sea.position.y = -0.04;
    ground.add(sea);
    // sand with a wavy shoreline at z ≈ -7
    const shape = new THREE.Shape();
    shape.moveTo(-60, -60);
    shape.lineTo(60, -60);
    shape.lineTo(60, 7);
    for (let x = 60; x >= -60; x -= 2)
      shape.lineTo(x, 7 + Math.sin(x * 0.35) * 0.8 + Math.sin(x * 0.11) * 1.2);
    shape.lineTo(-60, -60);
    const sand = new THREE.Mesh(new THREE.ShapeGeometry(shape, 4), flat(0xf2dcae));
    sand.rotation.x = -Math.PI / 2;
    sand.receiveShadow = true;
    ground.add(sand);
    const foamPts = [];
    for (let x = -60; x <= 60; x += 2)
      foamPts.push(V(x, 0.0, -(7 + Math.sin(x * 0.35) * 0.8 + Math.sin(x * 0.11) * 1.2) - 0.3));
    const foam = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(foamPts), 240, 0.12, 4),
      flat(0xffffff),
    );
    ground.add(foam);
    onFrame((t) => {
      foam.position.z = Math.sin(t * 0.9) * 0.25;
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
  winter() {
    const r = rng(23);
    bigGround(0xeef3fa);
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
    cabin.position.set(-11, 0, -11);
    cabin.rotation.y = 0.5;
    ground.add(cabin);

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
  land() {
    bigGround(0x86c45a);
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
    rocks(10, 7, 18, 58);
    // meadow in front of the road and fields only
    meadow({ n: 420, rMin: 2.6, rMax: 26, seed: 11, keep: (x, z) => z > -5.4, flowers: 0.35 });
  },
};

export const ENVIRONMENTS = Object.keys(ENV_BUILDERS);
// Default light per environment (any SKIES key can be passed instead).
const DEFAULT_SKY = {
  insel: "sonnenuntergang",
  stadt: "abend",
  strand: "mittag",
  winter: "morgen",
  land: "sonnenuntergang",
};

// Build sky + landscape. Call once, first thing in scene.js.
export function createWorld({ env = "insel", sky } = {}) {
  if (!ENV_BUILDERS[env]) throw new Error(`unknown env "${env}" (${ENVIRONMENTS.join(", ")})`);
  const skyName = sky ?? DEFAULT_SKY[env];
  if (!SKIES[skyName])
    throw new Error(`unknown sky "${skyName}" (${Object.keys(SKIES).join(", ")})`);
  buildSky(SKIES[skyName]);
  ENV_BUILDERS[env](SKIES[skyName]);
  return { env, sky: skyName };
}
