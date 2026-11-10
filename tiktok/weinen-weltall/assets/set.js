// #69 "Weinen im Weltall" (format B): an astronaut on a spacewalk gets soap
// in the eye and starts to cry. The world: the end of the station's robot
// arm in full, hard orbital daylight, high over the DAY side of the Earth
// (deep blue ocean, swirling white cloud bands, a desert coast) — not the
// night side of #33. Behind the astronaut: the station's main truss with
// eight golden-blue solar wings (hero piece), a white module with gold foil
// bands, radiators. The long white robot arm reaches from the module to the
// foot restraint the astronaut stands in. Life: the clouds drift faster than
// the Earth turns, the wings track the sun, glinting ice crystals, a cargo
// capsule approaching with blinking lights, a tethered tool floating.
import { THREE, V, flat, scene, ground, onFrame, rng, noise2, real, roundedBox } from "./world.js";
import { SKIES, setSky, finishSet, F } from "./environments.js";

const SEED = 69;
const r = rng(SEED);

// ---------------------------------------------------------------- light
// black sky, a white-hot sun high from the upper left in front (hard key on
// the visor), the bright Earth below fills from underneath (blue bounce)
export const SUN_DIR = V(-0.55, 0.62, 0.55).normalize();
setSky({
  ...SKIES.weltall,
  top: [0.0, 0.0, 0.01],
  mid: [0.005, 0.008, 0.03],
  hor: [0.04, 0.09, 0.22],
  below: [0.12, 0.3, 0.6],
  sun: [1.0, 0.98, 0.94],
  sunDir: SUN_DIR.toArray(),
  stars: 0.5,
  hemi: [0x6f8fd0, 0x3f7fd8, 1.1],
  key: [0xfffaf0, 3.6],
  keyPos: [-7, 9, 8],
  rim: [0x7fb4ff, 1.6],
});
scene.fog = null;

// ---------------------------------------------------------------- materials
const hull = real.plastic(0xeef0f2, { roughness: 0.5 });
const hullDark = flat(0xc3cad3, { roughness: 0.55, metalness: 0.2 });
const gold = new THREE.MeshStandardMaterial({
  color: 0xd8a33c,
  metalness: 0.9,
  roughness: 0.3,
  flatShading: true,
});
const truss = flat(0xa3abb5, { roughness: 0.4, metalness: 0.65 });
const cellMat = new THREE.MeshStandardMaterial({
  color: 0x22336e,
  metalness: 0.75,
  roughness: 0.2,
  emissive: 0x081438,
  emissiveIntensity: 0.4,
});
const cellFoil = new THREE.MeshStandardMaterial({
  color: 0xc58f2c,
  metalness: 0.85,
  roughness: 0.35,
});
const cellLine = flat(0xd6b46a, { metalness: 0.6, roughness: 0.4 });
const rail = real.plastic(0xffc42e, { roughness: 0.45 });

const station = new THREE.Group();
ground.add(station);
const add = (geo, mat, x, y, z, parent = station) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};

// ---------------------------------------------------------------- the module
// a big white cylinder lying across behind-left, gold foil bands, a hatch
// ring, handrails, small round windows lit from inside
export const MOD = V(-7, -1.5, -11);
{
  const len = 16;
  const body = new THREE.CylinderGeometry(2.1, 2.1, len, 64, 6, true);
  body.rotateZ(Math.PI / 2);
  add(body, hull, MOD.x, MOD.y, MOD.z);
  for (const s of [-1, 1]) {
    const cap = new THREE.SphereGeometry(2.1, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    cap.scale(1, 0.35, 1);
    cap.rotateZ((-s * Math.PI) / 2);
    add(cap, hull, MOD.x + (s * len) / 2, MOD.y, MOD.z);
  }
  for (const dx of [-6.5, -2, 2.5, 6.2]) {
    const band = new THREE.CylinderGeometry(2.14, 2.14, 0.9, 64, 1, true);
    band.rotateZ(Math.PI / 2);
    add(band, gold, MOD.x + dx, MOD.y, MOD.z);
  }
  // seams: thin dark rings
  const seam = flat(0x8a929c);
  for (let k = -7; k <= 7; k += 1.15) {
    const ring = new THREE.TorusGeometry(2.105, 0.015, 4, 64);
    ring.rotateY(Math.PI / 2);
    add(ring, seam, MOD.x + k, MOD.y, MOD.z);
  }
  // handrails along the top
  for (const z of [-1.0, 1.0]) {
    const rr = add(
      new THREE.CylinderGeometry(0.03, 0.03, 12, 10),
      rail,
      MOD.x,
      MOD.y + 2.25,
      MOD.z + z,
    );
    rr.rotation.z = Math.PI / 2;
    for (let k = -5.5; k <= 5.5; k += 1.8)
      add(
        new THREE.CylinderGeometry(0.025, 0.025, 0.18, 8),
        rail,
        MOD.x + k,
        MOD.y + 2.16,
        MOD.z + z,
      );
  }
  const win = new THREE.MeshBasicMaterial({ color: 0xfff0c8 });
  for (const dx of [-4.2, -3.5, 4.3]) {
    const w = new THREE.Mesh(new THREE.CircleGeometry(0.16, 24), win);
    w.position.set(MOD.x + dx, MOD.y + 0.7, MOD.z + 2.03);
    w.userData.noAO = true;
    station.add(w);
  }
}

// ---------------------------------------------------------------- truss + wings (hero piece)
export const wings = [];
{
  const TY = 7.5;
  const TZ = -22;
  const L = 80;
  for (const [dy, dz] of [
    [0.6, 0.6],
    [-0.6, 0.6],
    [0.6, -0.6],
    [-0.6, -0.6],
  ]) {
    add(new THREE.BoxGeometry(L, 0.12, 0.12), truss, 0, TY + dy, TZ + dz);
  }
  for (let i = 0; i <= 50; i++) {
    const x = -L / 2 + (i / 50) * L;
    const d = add(new THREE.BoxGeometry(0.08, 1.7, 0.08), truss, x, TY, TZ + 0.6);
    d.rotation.z = i % 2 ? 0.62 : -0.62;
    const d2 = add(new THREE.BoxGeometry(0.08, 1.7, 0.08), truss, x, TY, TZ - 0.6);
    d2.rotation.z = i % 2 ? -0.62 : 0.62;
  }
  // stand-off down to the module
  const so = add(new THREE.CylinderGeometry(0.5, 0.6, 9, 24), hullDark, MOD.x + 3, 2.6, -16);
  so.rotation.x = 0.55;
  // eight wings: gold-orange frame + dark blue cells, a mast in the middle
  const cellGeo = new THREE.BoxGeometry(6, 18, 0.06);
  const xs = [-36, -28, -20, -12, 12, 20, 28, 36];
  for (const x of xs) {
    const wing = new THREE.Group();
    wing.position.set(x, TY, TZ);
    station.add(wing);
    for (const s of [-1, 1]) {
      const panel = new THREE.Mesh(cellGeo, cellMat);
      panel.position.y = s * 9.6;
      wing.add(panel);
      const back = new THREE.Mesh(new THREE.BoxGeometry(6.04, 18.04, 0.02), cellFoil);
      back.position.set(0, s * 9.6, -0.05);
      wing.add(back);
      for (let k = -8; k <= 8; k++) {
        const ln = new THREE.Mesh(new THREE.BoxGeometry(6.04, 0.05, 0.08), cellLine);
        ln.position.set(0, s * 9.6 + k, 0);
        wing.add(ln);
      }
      for (const xx of [-1.5, 0, 1.5]) {
        const ln = new THREE.Mesh(new THREE.BoxGeometry(0.04, 18, 0.08), cellLine);
        ln.position.set(xx, s * 9.6, 0);
        wing.add(ln);
      }
    }
    wing.add(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 38, 8), truss));
    wings.push(wing);
  }
  // radiators: white ribbed panels
  for (const x of [-6, 6]) {
    const g = new THREE.Group();
    g.position.set(x, TY - 1, TZ + 1.5);
    station.add(g);
    for (let k = 0; k < 6; k++) {
      const p = F(new THREE.BoxGeometry(4, 0.06, 2), hullDark, 0.04, 20 + k);
      p.position.set(0, -k * 0.12, k * 2.05);
      g.add(p);
    }
    g.rotation.x = 0.25;
  }
}
onFrame((t) => wings.forEach((w, i) => (w.rotation.x = -0.25 + Math.sin(t * 0.06 + i) * 0.03)));

// ---------------------------------------------------------------- the robot arm
// from a grapple fixture on the module up to the foot restraint under the
// astronaut (origin): shoulder joint, two long booms, elbow, wrist, the
// foot plate. White booms with a dark seam, grey joint drums, a camera.
export const FOOT = V(0, -0.08, 0);
{
  const boom = real.plastic(0xf3f3f1, { roughness: 0.35 });
  const joint = real.metal(0xb9c0c8, { roughness: 0.35 });
  const dark = real.rubber(0x2c2f35);
  const base = V(MOD.x + 4.5, MOD.y + 2.1, MOD.z + 0.6);
  const elbow = V(-2.6, 3.4, -6.5);
  const wrist = V(-0.15, -1.1, -0.55);
  const seg = (a, b, rad) => {
    const d = b.clone().sub(a);
    const m = add(new THREE.CylinderGeometry(rad, rad, d.length(), 40), boom, 0, 0, 0);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(V(0, 1, 0), d.clone().normalize());
    const band = new THREE.Mesh(new THREE.CylinderGeometry(rad * 1.01, rad * 1.01, 0.08, 40), dark);
    for (const f of [0.18, 0.5, 0.82]) {
      const b2 = band.clone();
      b2.position.copy(a).addScaledVector(d, f);
      b2.quaternion.copy(m.quaternion);
      station.add(b2);
    }
  };
  const drum = (p, rad, len, axis) => {
    const g = new THREE.CylinderGeometry(rad, rad, len, 40);
    const m = add(g, joint, p.x, p.y, p.z);
    m.quaternion.setFromUnitVectors(V(0, 1, 0), axis.clone().normalize());
    const cap = add(
      new THREE.CylinderGeometry(rad * 0.7, rad * 0.7, len + 0.04, 32),
      dark,
      p.x,
      p.y,
      p.z,
    );
    cap.quaternion.copy(m.quaternion);
  };
  seg(base, elbow, 0.2);
  seg(elbow, wrist, 0.18);
  drum(base, 0.34, 0.6, V(1, 0, 0.2));
  drum(elbow, 0.32, 0.62, V(1, 0, 0.3));
  drum(wrist, 0.26, 0.5, V(1, 0, 0));
  // wrist down to the foot plate
  const w2 = V(0, -0.35, -0.2);
  seg(wrist, w2, 0.12);
  // foot plate with two yellow toe loops
  add(roundedBox(0.75, 0.08, 0.6, 0.03), joint, 0, -0.12, 0);
  for (const x of [-0.13, 0.13]) {
    const loop = new THREE.TorusGeometry(0.1, 0.022, 10, 24, Math.PI);
    add(loop, rail, x, -0.08, 0.1);
  }
  // arm camera with a little red light
  add(roundedBox(0.2, 0.16, 0.26, 0.03), dark, elbow.x + 0.3, elbow.y + 0.35, elbow.z);
  const led = new THREE.MeshBasicMaterial({ color: 0xff3a2a, transparent: true });
  const l = add(
    new THREE.SphereGeometry(0.025, 12, 8),
    led,
    elbow.x + 0.3,
    elbow.y + 0.35,
    elbow.z + 0.14,
  );
  l.userData.noAO = true;
  onFrame((t) => (led.opacity = (t * 0.8) % 1 < 0.15 ? 1 : 0.2));
}

// ---------------------------------------------------------------- the Earth (day side)
export const EARTH_R = 110;
export const EARTH_C = V(8, -118, -55);
const earth = new THREE.Group();
earth.position.copy(EARTH_C);
ground.add(earth);
function earthColors(geo, fn) {
  const p = geo.attributes.position;
  const cols = new Float32Array(p.count * 3);
  const n = V(0, 0, 0);
  const c = new THREE.Color();
  const cr = rng(SEED + 3);
  for (let i = 0; i < p.count; i += 3) {
    n.set(
      p.getX(i) + p.getX(i + 1) + p.getX(i + 2),
      p.getY(i) + p.getY(i + 1) + p.getY(i + 2),
      p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2),
    ).normalize();
    fn(n, c, cr);
    for (let j = 0; j < 3; j++) {
      cols[(i + j) * 3] = c.r;
      cols[(i + j) * 3 + 1] = c.g;
      cols[(i + j) * 3 + 2] = c.b;
    }
  }
  geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
}
{
  const geo = new THREE.IcosahedronGeometry(EARTH_R, 64).toNonIndexed();
  const ocean = new THREE.Color(0x1b5fb5);
  const oceanDeep = new THREE.Color(0x0f3f88);
  const shallow = new THREE.Color(0x2fa6c4);
  const desert = [new THREE.Color(0xd8a666), new THREE.Color(0xc58a4e), new THREE.Color(0xe6c088)];
  const green = new THREE.Color(0x5d8a45);
  earthColors(geo, (n, c, cr) => {
    const ln = noise2(n.x * 3 + 7, n.z * 3 + 1, 15) * 0.6 + noise2(n.x * 9, n.z * 9, 16) * 0.4;
    if (ln > 0.56) {
      c.copy(desert[Math.floor(ln * 37) % 3]);
      if (noise2(n.x * 14, n.z * 14, 17) > 0.62) c.lerp(green, 0.6);
    } else if (ln > 0.52) c.copy(shallow);
    else c.copy(ocean).lerp(oceanDeep, cr() * 0.5 + (0.5 - ln) * 0.6);
    const shade = 0.94 + cr() * 0.1;
    c.multiplyScalar(shade);
  });
  const em = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, fog: false }));
  em.userData.noAO = true;
  earth.add(em);
}
// clouds: a separate shell of swirling white bands, drifts on its own
const clouds = new THREE.Group();
earth.add(clouds);
{
  const geo = new THREE.IcosahedronGeometry(EARTH_R * 1.004, 64).toNonIndexed();
  const p = geo.attributes.position;
  const alpha = [];
  const n = V(0, 0, 0);
  const keep = [];
  for (let i = 0; i < p.count; i += 3) {
    n.set(
      p.getX(i) + p.getX(i + 1) + p.getX(i + 2),
      p.getY(i) + p.getY(i + 1) + p.getY(i + 2),
      p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2),
    ).normalize();
    // swirl: rotate the noise lookup around a centre so the bands curl
    const ang = Math.atan2(n.z - 0.15, n.x + 0.1) * 0.8;
    const rr = Math.hypot(n.x + 0.1, n.z - 0.15);
    const q = noise2(Math.cos(ang + rr * 9) * rr * 7 + 3, Math.sin(ang + rr * 9) * rr * 7, 21);
    const v = q * 0.65 + noise2(n.x * 22, n.z * 22, 22) * 0.35;
    if (v > 0.5) keep.push(i);
    alpha.push(v);
  }
  const pos = [];
  const col = [];
  const cr = rng(SEED + 7);
  for (const i of keep) {
    for (let j = 0; j < 3; j++) {
      pos.push(p.getX(i + j), p.getY(i + j), p.getZ(i + j));
    }
    const w = 0.72 + cr() * 0.12;
    for (let j = 0; j < 3; j++) col.push(w, w * 1.01, w * 1.05);
  }
  const g2 = new THREE.BufferGeometry();
  g2.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g2.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  const cm = new THREE.Mesh(
    g2,
    new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      fog: false,
    }),
  );
  cm.userData.noAO = true;
  clouds.add(cm);
}
// atmosphere: thin glowing blue limb
{
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_R * 1.03, 128, 64),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      fog: false,
      vertexShader: `varying vec3 vN; varying vec3 vV;
        void main(){ vN = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `varying vec3 vN; varying vec3 vV;
        void main(){
          float rim = pow(1.0 - abs(dot(vN, vV)), 2.5);
          gl_FragColor = vec4(vec3(0.3, 0.6, 1.0) * rim * 1.8, 1.0);
          #include <colorspace_fragment>
        }`,
    }),
  );
  atmo.userData.noAO = true;
  earth.add(atmo);
}
onFrame((t) => {
  earth.rotation.x = t * 0.002;
  clouds.rotation.y = t * 0.0015;
});

// ---------------------------------------------------------------- life
// glinting ice crystals drifting round the astronaut
{
  const N = 80;
  const mat = new THREE.MeshBasicMaterial({ color: 0xeaf6ff, transparent: true, opacity: 0.9 });
  const im = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.012, 0), mat, N);
  im.userData.noAO = true;
  im.frustumCulled = false;
  ground.add(im);
  const s = Array.from({ length: N }, () => [r() * 12 - 6, r() * 6 - 1.5, r() * 10 - 6, r() * 6]);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  onFrame((t) => {
    s.forEach(([x, y, z, ph], i) => {
      const k = 0.4 + 1.2 * Math.max(0, Math.sin(t * 1.8 + ph * 3));
      m4.compose(V(x + t * 0.04, y + Math.sin(t * 0.3 + ph) * 0.2, z), q, V(k, k, k));
      im.setMatrixAt(i, m4);
    });
    im.instanceMatrix.needsUpdate = true;
  });
}
// a cargo capsule approaching far off to the right, blinking
{
  const cap = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(1.0, 1.9, 3.2, 32),
    real.plastic(0xf1f1ef),
  );
  cap.add(body);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, 2.6, 32), hullDark);
  trunk.position.y = -2.9;
  cap.add(trunk);
  for (const s of [-1, 1]) {
    const pnl = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.4, 3.6), cellMat);
    pnl.position.set(s * 2, -2.9, 0);
    cap.add(pnl);
  }
  const led = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
  const l = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), led);
  l.position.y = 1.7;
  cap.add(l);
  cap.rotation.set(0.3, 0, -1.2);
  ground.add(cap);
  onFrame((t) => {
    cap.position.set(34 - t * 0.12, 9 + Math.sin(t * 0.1) * 0.3, -46);
    led.opacity = (t * 1.1) % 1 < 0.12 ? 1 : 0.1;
  });
}
// a tethered tool bag floating on its line near the foot restraint
export const toolBag = new THREE.Group();
{
  const bag = new THREE.Mesh(roundedBox(0.22, 0.28, 0.12, 0.04), real.fabric(0xe9e6dc));
  toolBag.add(bag);
  const strap = new THREE.Mesh(roundedBox(0.23, 0.04, 0.125, 0.01), real.fabric(0x2f6fd0));
  strap.position.y = 0.06;
  toolBag.add(strap);
  ground.add(toolBag);
  const line = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 1, 6), rail);
  ground.add(line);
  const a = V(0.3, -0.1, 0.05);
  onFrame((t) => {
    toolBag.position.set(
      0.85 + Math.sin(t * 0.4) * 0.12,
      0.25 + Math.sin(t * 0.31 + 1) * 0.1,
      -0.3,
    );
    toolBag.rotation.set(Math.sin(t * 0.5) * 0.4, t * 0.2, Math.sin(t * 0.37) * 0.3);
    const d = toolBag.position.clone().sub(a);
    line.scale.y = d.length();
    line.position.copy(a).addScaledVector(d, 0.5);
    line.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
  });
}

finishSet({ ground: 0x1d4f9a });
