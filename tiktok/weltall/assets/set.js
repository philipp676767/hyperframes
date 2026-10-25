// #33 "Weltall" (format B): what happens if you go out into space without a
// spacesuit? The world: a space station in orbit over the night side of
// the Earth, right as the sun comes up over the limb. The airlock points at
// the camera (its outer hatch is the stage's back wall, scene.js opens it),
// behind it the node and the long lab module, a truss with four big solar
// wings, radiators, gold foil, handrails, blinking nav lights. Below: the
// huge faceted Earth — dark oceans, city lights, an orange-blue sunrise
// band on the horizon. Life: the Earth turns, the wings track, ice crystals
// drift, shooting stars, a satellite crosses.
import { THREE, V, flat, scene, ground, onFrame, rng, jitter, noise2 } from "./world.js";
import { SKIES, setSky, finishSet, F } from "./environments.js";

const SEED = 33;
const r = rng(SEED);

// ---------------------------------------------------------------- light
// black space, the sun just over the Earth's limb behind the station: a cool
// key from the front for the figure, a warm sunrise rim from behind
export const SUN_DIR = V(-0.32, 0.1, -1).normalize();
setSky({
  ...SKIES.weltall,
  top: [0.0, 0.0, 0.015],
  mid: [0.01, 0.012, 0.05],
  hor: [0.03, 0.04, 0.12],
  below: [0.02, 0.03, 0.08],
  sun: [1.0, 0.86, 0.62],
  sunDir: SUN_DIR.toArray(),
  stars: 1.5,
  hemi: [0x8fa6ff, 0x0b1430, 0.9],
  key: [0xf2f6ff, 3.0],
  keyPos: [-5, 9, 10],
  rim: [0xffa25a, 2.2],
});
scene.fog = null;

// ---------------------------------------------------------------- materials
const hull = flat(0xe9edf2, { roughness: 0.55, metalness: 0.15 });
const hullDark = flat(0xbcc4cf, { roughness: 0.6, metalness: 0.2 });
const gold = new THREE.MeshStandardMaterial({
  color: 0xd9a441,
  metalness: 0.85,
  roughness: 0.32,
  flatShading: true,
});
const rail = flat(0xffc83a, { roughness: 0.5 });
const truss = flat(0x9aa3ad, { roughness: 0.45, metalness: 0.6 });
const cellMat = new THREE.MeshStandardMaterial({
  color: 0x1f3f9a,
  metalness: 0.7,
  roughness: 0.22,
  emissive: 0x0a1a55,
  emissiveIntensity: 0.4,
  flatShading: true,
});
const cellLine = flat(0xc9a95a, { metalness: 0.6, roughness: 0.4 });

// ---------------------------------------------------------------- the station
const station = new THREE.Group();
ground.add(station);
const mesh = (geo, mat, x, y, z, seed = 1, amt = 0.06) => {
  const m = F(geo, mat, amt, seed);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  station.add(m);
  return m;
};
export const HATCH_Z = -2.2; // the outer hatch ring (faces +z)
export const LOCK_Y = 1.15; // the airlock's axis height
export const LOCK_R = 1.35;

// panel seams: thin dark rings round a cylinder along its axis
function seams(len, rad, n, axis, x, y, z) {
  for (let i = 0; i <= n; i++) {
    const g = new THREE.TorusGeometry(rad + 0.02, 0.035, 4, 28);
    const m = new THREE.Mesh(g, hullDark);
    const u = -len / 2 + (i / n) * len;
    if (axis === "z") m.position.set(x, y, z + u);
    else {
      m.rotation.y = Math.PI / 2;
      m.position.set(x + u, y, z);
    }
    station.add(m);
  }
}
// handrail: yellow bar on two stand-offs
function handrail(a, b, out) {
  const d = b.clone().sub(a);
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, d.length(), 6), rail);
  bar.position.copy(a).add(b).multiplyScalar(0.5).add(out);
  bar.quaternion.setFromUnitVectors(V(0, 1, 0), d.clone().normalize());
  bar.castShadow = true;
  station.add(bar);
  for (const p of [a, b]) {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, out.length(), 5), rail);
    s.position.copy(p).add(out.clone().multiplyScalar(0.5));
    s.quaternion.setFromUnitVectors(V(0, 1, 0), out.clone().normalize());
    station.add(s);
  }
}

// airlock: a short tube along z, its outside white, inside lit red
{
  const len = 3.8;
  const zc = HATCH_Z - len / 2;
  const outer = new THREE.CylinderGeometry(LOCK_R, LOCK_R, len, 24, 4, true);
  outer.rotateX(Math.PI / 2);
  mesh(outer, hull, 0, LOCK_Y, zc, 3);
  const inner = new THREE.CylinderGeometry(LOCK_R - 0.08, LOCK_R - 0.08, len, 24, 4, true);
  inner.rotateX(Math.PI / 2);
  const innerM = mesh(
    inner,
    flat(0xd6dbe2, { side: THREE.BackSide, roughness: 0.7 }),
    0,
    LOCK_Y,
    zc,
    4,
  );
  innerM.castShadow = false;
  seams(len, LOCK_R, 3, "z", 0, LOCK_Y, zc);
  // outer hatch ring (the door itself is in scene.js)
  const ring = new THREE.TorusGeometry(LOCK_R - 0.05, 0.16, 6, 28);
  mesh(ring, hullDark, 0, LOCK_Y, HATCH_Z, 5);
  // the inner bulkhead with panels and a little window into the station
  const wall = new THREE.CircleGeometry(LOCK_R - 0.06, 24);
  mesh(wall, flat(0xc9ced6, { roughness: 0.7 }), 0, LOCK_Y, HATCH_Z - len + 0.02, 6);
  const panelMat = flat(0x2b3442);
  for (const [px, py, w, h] of [
    [-0.55, 0.35, 0.5, 0.36],
    [0.5, -0.45, 0.42, 0.5],
    [-0.4, -0.5, 0.36, 0.28],
  ]) {
    mesh(new THREE.BoxGeometry(w, h, 0.06), panelMat, px, LOCK_Y + py, HATCH_Z - len + 0.06, 7);
  }
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.38, 0.24),
    new THREE.MeshBasicMaterial({ color: 0x5ad1ff }),
  );
  screen.position.set(-0.55, LOCK_Y + 0.35, HATCH_Z - len + 0.1);
  station.add(screen);
  // handrails inside, along the tube
  for (const a of [0.8, 2.35, 3.9]) {
    const ca = Math.cos(a) * (LOCK_R - 0.08);
    const sa = Math.sin(a) * (LOCK_R - 0.08);
    const out = V(-Math.cos(a), -Math.sin(a), 0).multiplyScalar(0.12);
    handrail(V(ca, LOCK_Y + sa, HATCH_Z - 3.3), V(ca, LOCK_Y + sa, HATCH_Z - 0.6), out);
  }
  // outside rails round the hatch
  for (const a of [0.4, 2.7]) {
    const ca = Math.cos(a) * LOCK_R;
    const sa = Math.sin(a) * LOCK_R;
    const out = V(Math.cos(a), Math.sin(a), 0).multiplyScalar(0.14);
    handrail(V(ca, LOCK_Y + sa, HATCH_Z - 2.9), V(ca, LOCK_Y + sa, HATCH_Z - 0.5), out);
  }
  // gold foil blanket on top of the airlock
  const foil = new THREE.CylinderGeometry(
    LOCK_R + 0.04,
    LOCK_R + 0.04,
    1.6,
    24,
    3,
    true,
    -0.9,
    1.8,
  );
  foil.rotateX(Math.PI / 2);
  mesh(jitter(foil, 0.02, 9), gold, 0, LOCK_Y, zc - 0.6, 9, 0.12);
}

// node: a faceted ball where the airlock meets the lab
mesh(jitter(new THREE.IcosahedronGeometry(2.3, 1), 0.04, 11), hull, 0, LOCK_Y, -7.2, 11, 0.07);
// the long lab module along x, with seams, rails and a foil band
{
  const len = 26;
  const lab = new THREE.CylinderGeometry(2.1, 2.1, len, 28, 6, true);
  lab.rotateZ(Math.PI / 2);
  mesh(lab, hull, 0, LOCK_Y, -8.6, 12);
  seams(len, 2.1, 8, "x", 0, LOCK_Y, -8.6);
  for (const s of [-1, 1]) {
    const cap = new THREE.SphereGeometry(2.1, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2);
    cap.rotateZ((-s * Math.PI) / 2);
    mesh(cap, hullDark, (s * len) / 2, LOCK_Y, -8.6, 13 + s);
  }
  for (const xx of [-8.5, 7.5]) {
    const band = new THREE.CylinderGeometry(2.16, 2.16, 2.2, 28, 2, true);
    band.rotateZ(Math.PI / 2);
    mesh(jitter(band, 0.03, 15), gold, xx, LOCK_Y, -8.6, 15, 0.12);
  }
  for (const [x0, x1] of [
    [-11, -3],
    [3, 11],
  ]) {
    handrail(V(x0, LOCK_Y + 1.5, -7.1), V(x1, LOCK_Y + 1.5, -7.1), V(0, 0.1, 0.12));
  }
  // windows of the lab, lit warm from inside
  const win = new THREE.MeshBasicMaterial({ color: 0xffd9a0 });
  for (const xx of [-5.5, -4.6, 4.4, 5.3]) {
    const w = new THREE.Mesh(new THREE.CircleGeometry(0.22, 10), win);
    w.position.set(xx, LOCK_Y + 0.4, -6.47);
    station.add(w);
  }
}

// truss above the lab, four solar wings, radiators
export const wings = [];
{
  const TY = 5.4;
  const TZ = -10;
  const L = 56;
  for (const [dy, dz] of [
    [0.45, 0.45],
    [-0.45, 0.45],
    [0.45, -0.45],
    [-0.45, -0.45],
  ]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(L, 0.09, 0.09), truss);
    b.position.set(0, TY + dy, TZ + dz);
    station.add(b);
  }
  for (let i = 0; i <= 40; i++) {
    const x = -L / 2 + (i / 40) * L;
    const d = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.27, 0.06), truss);
    d.position.set(x, TY, TZ);
    d.rotation.x = i % 2 ? 0.785 : -0.785;
    station.add(d);
    const d2 = d.clone();
    d2.rotation.set(0, 0, i % 2 ? 0.6 : -0.6);
    d2.position.z = TZ + 0.45;
    station.add(d2);
  }
  // the stand-off from the lab up to the truss
  mesh(new THREE.CylinderGeometry(0.35, 0.45, 3.2, 8), hullDark, 0, 3.6, -9.2, 16);
  // wings: a frame with a blue cell grid, a mast in the middle
  const cellGeo = new THREE.BoxGeometry(5.2, 15, 0.06);
  for (const [x, flip] of [
    [-24, 1],
    [-16, 1],
    [16, -1],
    [24, -1],
  ]) {
    const wing = new THREE.Group();
    wing.position.set(x, TY, TZ);
    station.add(wing);
    for (const s of [-1, 1]) {
      const panel = new THREE.Mesh(cellGeo, cellMat);
      panel.position.y = s * 8.2;
      panel.castShadow = true;
      wing.add(panel);
      for (let k = -7; k <= 7; k++) {
        const ln = new THREE.Mesh(new THREE.BoxGeometry(5.24, 0.05, 0.08), cellLine);
        ln.position.set(0, s * 8.2 + k, 0);
        wing.add(ln);
      }
      const ln = new THREE.Mesh(new THREE.BoxGeometry(0.06, 15, 0.08), cellLine);
      ln.position.y = s * 8.2;
      wing.add(ln);
    }
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 32, 6), truss);
    wing.add(mast);
    wing.userData.flip = flip;
    wings.push(wing);
  }
  // radiators: white ribbed panels hanging below the truss
  for (const x of [-8, 8]) {
    const g = new THREE.Group();
    g.position.set(x, TY - 0.6, TZ - 1.2);
    station.add(g);
    for (let k = 0; k < 5; k++) {
      const p = F(new THREE.BoxGeometry(3.4, 0.05, 1.6), hull, 0.05, 20 + k);
      p.position.set(0, -k * 0.1, -k * 1.65);
      g.add(p);
    }
    g.rotation.x = -0.3;
  }
}
onFrame((t) => wings.forEach((w, i) => (w.rotation.x = 0.35 + Math.sin(t * 0.05 + i) * 0.04)));

// antenna dish on the lab, pointing up-left
{
  const dish = new THREE.SphereGeometry(0.9, 14, 6, 0, Math.PI * 2, 0, 0.9);
  const d = mesh(dish, flat(0xf2f2f2, { side: THREE.DoubleSide }), -10, LOCK_Y + 3.0, -8.2, 22);
  d.rotation.set(-0.9, 0, 0.6);
  mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 5), truss, -10, LOCK_Y + 2.3, -8.3, 23);
}

// blinking nav lights: red port, green starboard, white strobe on the truss
{
  const lights = [
    [0xff2a2a, -13.1, LOCK_Y, -8.6, 0],
    [0x2aff6a, 13.1, LOCK_Y, -8.6, 0.5],
    [0xffffff, 0, 6, -9.5, 0.25],
    [0xff2a2a, -1.25, LOCK_Y + 0.9, HATCH_Z + 0.05, 0.75],
  ];
  for (const [c, x, y, z, ph] of lights) {
    const mat = new THREE.MeshBasicMaterial({ color: c, transparent: true });
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.09, 1), mat);
    b.position.set(x, y, z);
    b.userData.noAO = true;
    station.add(b);
    onFrame((t) => {
      const k = (t * 0.9 + ph) % 1 < 0.12 ? 1 : 0.15;
      mat.opacity = k;
      b.scale.setScalar(0.6 + k * 0.8);
    });
  }
}

// ---------------------------------------------------------------- the Earth
// A big faceted sphere below the station. Colours are baked per face: the
// side facing the camera is night (dark ocean, warm city lights, moonlit
// clouds), the far limb is day, with an orange band at the terminator.
export const EARTH_R = 120;
export const EARTH_C = V(0, -135, -22);
const earth = new THREE.Group();
earth.position.copy(EARTH_C);
ground.add(earth);
{
  const geo = new THREE.IcosahedronGeometry(EARTH_R, 48).toNonIndexed();
  const p = geo.attributes.position;
  const cols = new Float32Array(p.count * 3);
  // the sun as seen from the Earth's frame (it turns with the Earth group,
  // so bake against a fixed direction and keep the turn small)
  const S = V(-0.3, -0.04, -1).normalize();
  const ocean = new THREE.Color(0x1f5fb8);
  const oceanDeep = new THREE.Color(0x15448f);
  const land = [new THREE.Color(0x4f8f3e), new THREE.Color(0x9b8350), new THREE.Color(0x3b7a3a)];
  const cloud = new THREE.Color(0xf4f7ff);
  const nightOcean = new THREE.Color(0x0b1c44);
  const nightLand = new THREE.Color(0x182436);
  const nightCloud = new THREE.Color(0x46557c);
  const city = [new THREE.Color(0xffc45a), new THREE.Color(0xffe39a), new THREE.Color(0xff9a3a)];
  const dusk = new THREE.Color(0xff8a3a);
  const c = new THREE.Color();
  const day = new THREE.Color();
  const night = new THREE.Color();
  const n = V(0, 0, 0);
  const cr = rng(SEED + 5);
  for (let i = 0; i < p.count; i += 3) {
    n.set(
      p.getX(i) + p.getX(i + 1) + p.getX(i + 2),
      p.getY(i) + p.getY(i + 1) + p.getY(i + 2),
      p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2),
    ).normalize();
    const lat = n.z; // poles off to the sides, so the cap under the station is open ocean + land
    const ln = noise2(n.x * 4 + 1, n.z * 4 + 2, 5) * 0.65 + noise2(n.x * 10, n.z * 10, 6) * 0.35;
    const cl =
      noise2(n.x * 9 + 4, n.z * 9 + n.y * 3, 8) * 0.7 + noise2(n.x * 20, n.z * 20, 9) * 0.3;
    const isLand = ln > 0.46 && Math.abs(lat) < 0.86;
    const isIce = Math.abs(lat) > 0.88;
    const isCloud = cl > 0.6 && !isIce;
    // day colour
    if (isIce) day.set(0xf2f6ff);
    else if (isCloud) day.copy(cloud);
    else if (isLand) day.copy(land[Math.floor(ln * 41) % 3]);
    else day.copy(ocean).lerp(oceanDeep, cr() * 0.6);
    // night colour, cities on land
    if (isCloud) night.copy(nightCloud);
    else if (isLand) {
      night.copy(nightLand);
    } else night.copy(nightOcean);
    const d = n.dot(S);
    const k = THREE.MathUtils.smoothstep(d, -0.02, 0.08);
    c.copy(night).lerp(day, k);
    // orange glow along the terminator
    const band = Math.exp(-Math.pow((d - 0.01) / 0.03, 2));
    c.lerp(dusk, band * 0.55);
    const shade = 0.92 + cr() * 0.16;
    for (let j = 0; j < 3; j++) {
      cols[(i + j) * 3] = c.r * shade;
      cols[(i + j) * 3 + 1] = c.g * shade;
      cols[(i + j) * 3 + 2] = c.b * shade;
    }
  }
  // city lights: small glowing dots on the land of the night side (in clusters)
  {
    const pts = [];
    const q = V(0, 0, 0);
    const lr = rng(SEED + 9);
    for (let k = 0; k < 90000 && pts.length < 4000; k++) {
      const th = lr() * 0.6;
      const ph = lr() * Math.PI * 2;
      q.set(Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph));
      const ln = noise2(q.x * 4 + 1, q.z * 4 + 2, 5) * 0.65 + noise2(q.x * 10, q.z * 10, 6) * 0.35;
      const cn = noise2(q.x * 26 + 5, q.z * 26 + 1, 12);
      if (ln < 0.48 || cn < 0.52 || q.dot(S) > -0.01) continue;
      pts.push([q.clone(), 0.07 + lr() * 0.12, Math.floor(lr() * 3)]);
    }
    const dot = new THREE.IcosahedronGeometry(1, 0);
    const im = new THREE.InstancedMesh(
      dot,
      new THREE.MeshBasicMaterial({ fog: false }),
      pts.length,
    );
    const m4 = new THREE.Matrix4();
    pts.forEach(([q, sz, ci], i) => {
      m4.makeScale(sz, sz, sz).setPosition(q.clone().multiplyScalar(EARTH_R + 0.05));
      im.setMatrixAt(i, m4);
      im.setColorAt(i, city[ci]);
    });
    im.userData.noAO = true;
    earth.add(im);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
  const em = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, fog: false }));
  em.userData.noAO = true;
  earth.add(em);
  // atmosphere: a thin glowing shell, brightest at the limb, warm on the sun side
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_R * 1.025, 96, 48),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      fog: false,
      uniforms: { sun: { value: S } },
      vertexShader: `varying vec3 vN; varying vec3 vV; varying vec3 vW;
        void main(){ vN = normalize(normalMatrix * normal); vW = normalize(position);
        vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform vec3 sun; varying vec3 vN; varying vec3 vV; varying vec3 vW;
        void main(){
          float rim = pow(1.0 - abs(dot(vN, vV)), 3.0);
          float lit = smoothstep(-0.25, 0.35, dot(vW, sun));
          vec3 blue = vec3(0.25, 0.55, 1.0);
          vec3 warm = vec3(1.0, 0.55, 0.22);
          vec3 c = mix(blue * 0.35, mix(warm, blue, smoothstep(0.0, 0.5, dot(vW, sun))), lit);
          gl_FragColor = vec4(c * rim * 1.6, 1.0);
          #include <colorspace_fragment>
        }`,
    }),
  );
  atmo.userData.noAO = true;
  earth.add(atmo);
}
onFrame((t) => (earth.rotation.x = t * 0.0025));

// ---------------------------------------------------------------- life
// drifting ice crystals round the station (catch the light, twinkle)
{
  const N = 70;
  const mat = new THREE.MeshBasicMaterial({ color: 0xdff2ff, transparent: true, opacity: 0.85 });
  const im = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.03, 0), mat, N);
  im.userData.noAO = true;
  im.frustumCulled = false;
  ground.add(im);
  const s = Array.from({ length: N }, () => [r() * 30 - 15, r() * 12 - 3, r() * 20 - 14, r() * 6]);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  onFrame((t) => {
    s.forEach(([x, y, z, ph], i) => {
      const k = 0.5 + 0.5 * Math.max(0, Math.sin(t * 1.6 + ph * 3));
      m4.compose(V(x + t * 0.05, y + Math.sin(t * 0.3 + ph) * 0.3, z), q, V(k, k, k));
      im.setMatrixAt(i, m4);
    });
    im.instanceMatrix.needsUpdate = true;
  });
}
// shooting stars far behind (meteors burning up below)
{
  const mat = new THREE.MeshBasicMaterial({ color: 0xfff1d0, transparent: true, opacity: 0 });
  const streak = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.0, 9, 4), mat);
  streak.userData.noAO = true;
  ground.add(streak);
  onFrame((t) => {
    const per = 7.3;
    const u = (t % per) / 1.1;
    const n = Math.floor(t / per);
    const rr = rng(100 + n);
    const a = V(-60 + rr() * 120, 6 + rr() * 30, -120 - rr() * 40);
    const dir = V(0.8, -0.45, 0.1).normalize();
    streak.visible = u < 1;
    streak.position.copy(a).addScaledVector(dir, u * 40);
    streak.quaternion.setFromUnitVectors(V(0, 1, 0), dir);
    mat.opacity = Math.sin(Math.min(1, u) * Math.PI) * 0.9;
  });
}
// a satellite crossing high above
{
  const sat = new THREE.Group();
  sat.add(new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 1.2), gold));
  for (const s of [-1, 1]) {
    const pnl = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.05, 0.9), cellMat);
    pnl.position.x = s * 1.7;
    sat.add(pnl);
  }
  ground.add(sat);
  onFrame((t) => {
    sat.position.set(-45 + t * 1.5, 26 + Math.sin(t * 0.05) * 2, -48);
    sat.rotation.set(t * 0.1, t * 0.17, 0.2);
  });
}

finishSet({ ground: 0x0a1838 });
