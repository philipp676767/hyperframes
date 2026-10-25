// #32 "Warum sind Flugzeugfenster rund?" — a 1950s test hangar at night.
// A cutaway diorama: concrete floor with yellow safety lines, corrugated
// walls with ribs, arched roof trusses with hanging enamel lamps; the
// giant back doors stand open onto the night apron (runway lights chasing,
// a tower with a sweeping beacon, hills with town lights, a big moon).
// Around the stage: boarding stairs, workbench, toolbox, gas bottles,
// drums, crates, a tug, a chalkboard with the test log. Life: the gantry
// crane's trolley creeps along, the beacon sweeps, runway lights chase,
// dust and moths drift in the lamp light. The hook plane flies outside at
// y ≈ 42 (scene.js); the stage is the hangar floor at the origin.
import {
  THREE,
  flat,
  ground,
  scene,
  onFrame,
  facet,
  facetMat,
  patches,
  noise2,
  rng,
  M,
  V,
} from "./world.js";
import { SKIES, setSky, finishSet, discGeo, pathStrip, F, fireflies } from "./environments.js";
import { place, barrel, crate, cone } from "./props.js";

const SEED = 32;
const r = rng(SEED);

// ---------------------------------------------------------------- light
// deep blue night with a last teal-violet glow at the horizon, cool moon
// key from the front-left so the silver plane reads; stars
const sky = setSky({
  ...SKIES.nacht,
  top: [0.03, 0.05, 0.17],
  mid: [0.09, 0.13, 0.34],
  hor: [0.34, 0.33, 0.56],
  below: [0.1, 0.12, 0.24],
  sunDir: [-0.3, 0.35, -1],
  sun: [0.55, 0.62, 0.95],
  hemi: [0x9fb0ff, 0x2a2638, 1.15],
  key: [0xc8d4ff, 1.7],
  keyPos: [-5, 12, 9],
  rim: [0x7f9cff, 1.1],
  stars: 1.1,
  clouds: 12,
  fog: [40, 190],
});
// the hangar is ~30 m wide: widen the moon's shadow box
const key = (() => {
  let k = null;
  scene.traverse((o) => {
    if (o.isDirectionalLight && o.castShadow) k = o;
  });
  return k;
})();
if (key) {
  Object.assign(key.shadow.camera, { left: -17, right: 17, top: 17, bottom: -17, far: 60 });
  key.shadow.camera.updateProjectionMatrix();
}

const mesh = (geo, mat, x, y, z, { amt = 0.06, seed = 1, shadow = true, recv = true } = {}) => {
  const m = new THREE.Mesh(facet(geo, amt, seed), facetMat(mat));
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = recv;
  ground.add(m);
  return m;
};

// ---------------------------------------------------------------- outside ground
// dark asphalt apron with colour patches; hills rise far behind the doors
export function height() {
  return 0;
}
{
  const geo = discGeo(150, 3.0, SEED);
  const g = patches(facet(geo, 0.07, SEED), { amt: 0.14, scale: 0.05, seed: SEED, warm: 0.2 });
  const p = g.attributes.position;
  const c = g.attributes.color;
  // hills fade from asphalt to dark meadow
  for (let i = 0; i < p.count; i++) {
    const h = p.getY(i);
    if (h > 0.5) {
      const k = Math.min(1, h / 4);
      c.setXYZ(
        i,
        c.getX(i) * (1 - 0.35 * k),
        c.getY(i) * (1 + 0.25 * k),
        c.getZ(i) * (1 - 0.1 * k),
      );
    }
  }
  const m = new THREE.Mesh(g, facetMat(flat(0x3a3f4f, { roughness: 0.9 })));
  m.position.y = -0.02;
  m.receiveShadow = true;
  ground.add(m);
}
// taxiway from the doors out to the runway, yellow centre line
pathStrip(
  [
    [0, -12],
    [0, -30],
    [6, -44],
    [20, -52],
  ],
  { width: 7, color: 0x4a4f5e, seed: SEED, lift: 0.01 },
);
{
  const dash = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.18, 0.02, 1.2),
    flat(0xffc83a, { emissive: 0x7a5200, emissiveIntensity: 0.4 }),
    14,
  );
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 14; i++) {
    m4.makeTranslation(0, 0.03, -13 - i * 2.2);
    dash.setMatrixAt(i, m4);
  }
  ground.add(dash);
}
// the runway far behind, across x, with edge lights that chase
const RUNWAY_Z = -58;
mesh(new THREE.BoxGeometry(260, 0.04, 9), flat(0x2e3240), 0, 0.02, RUNWAY_Z, { shadow: false });
const runLights = [];
{
  const n = 60;
  const mat = flat(0xfff0c0, { emissive: 0xffd27a, emissiveIntensity: 2 });
  const im = new THREE.InstancedMesh(new THREE.SphereGeometry(0.16, 8, 6), mat, n * 2);
  im.userData.noAO = true;
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < n; i++)
    for (const s of [0, 1]) {
      m4.makeTranslation(-120 + i * 4, 0.2, RUNWAY_Z + (s ? 4.8 : -4.8));
      im.setMatrixAt(i * 2 + s, m4);
      runLights.push([-120 + i * 4, RUNWAY_Z + (s ? 4.8 : -4.8)]);
    }
  ground.add(im);
  // the chasing "rabbit": a brighter strobe running along the centre
  const rabbit = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 10, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
  );
  rabbit.userData.noAO = true;
  ground.add(rabbit);
  onFrame((t) => {
    const k = (t * 0.9) % 1;
    rabbit.position.set(-110 + k * 220, 0.3, RUNWAY_Z);
    rabbit.scale.setScalar(0.6 + 0.4 * Math.abs(Math.sin(t * 14)));
  });
}
// green threshold bar and blue taxi lights along the taxiway
{
  const mat = flat(0x7dffb0, { emissive: 0x2bff8a, emissiveIntensity: 2 });
  for (let i = 0; i < 9; i++)
    mesh(new THREE.SphereGeometry(0.15, 6, 4), mat, -118, 0.2, RUNWAY_Z - 4 + i, { shadow: false });
  const blue = flat(0x8fb4ff, { emissive: 0x3f6bff, emissiveIntensity: 2.2 });
  for (let i = 0; i < 9; i++)
    for (const s of [-1, 1]) {
      const m = mesh(new THREE.SphereGeometry(0.12, 6, 4), blue, s * 4, 0.2, -14 - i * 4, {
        shadow: false,
      });
      m.userData.noAO = true;
    }
}

// ---------------------------------------------------------------- tower (far, through the doors)
const beacon = new THREE.Group();
{
  const TX = -24;
  const TZ = -50;
  const concrete = flat(0xd9d2c4);
  mesh(new THREE.CylinderGeometry(1.4, 1.8, 14, 8), concrete, TX, 7, TZ, { seed: 3 });
  mesh(new THREE.CylinderGeometry(3.0, 2.2, 1.0, 8), concrete, TX, 14.5, TZ, { seed: 4 });
  // the cab: glowing green-ish windows all round
  const glass = flat(0x9fe8ff, { emissive: 0x5fd0ff, emissiveIntensity: 1.2, roughness: 0.2 });
  mesh(new THREE.CylinderGeometry(2.7, 2.9, 2.2, 8), glass, TX, 16.1, TZ, {
    shadow: false,
    seed: 5,
  });
  mesh(new THREE.CylinderGeometry(3.2, 2.8, 0.5, 8), flat(0x2f3644), TX, 17.4, TZ, { seed: 6 });
  // lit windows down the shaft
  for (let i = 0; i < 5; i++)
    mesh(
      new THREE.BoxGeometry(0.5, 0.7, 0.1),
      flat(0xffe2a0, { emissive: 0xffc060, emissiveIntensity: 1.4 }),
      TX,
      3 + i * 2.2,
      TZ + 1.7,
      { shadow: false },
    );
  // rotating beacon with a sweeping beam
  beacon.position.set(TX, 18.4, TZ);
  ground.add(beacon);
  beacon.add(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.8, 10), flat(0x2f3644)));
  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 10, 8),
    flat(0xfff6d0, { emissive: 0xfff0a0, emissiveIntensity: 3 }),
  );
  lamp.position.y = 0.6;
  beacon.add(lamp);
  const beamGeo = new THREE.ConeGeometry(2.2, 34, 18, 1, true);
  beamGeo.translate(0, -17, 0);
  beamGeo.rotateZ(Math.PI / 2);
  const beam = new THREE.Mesh(
    beamGeo,
    new THREE.MeshBasicMaterial({
      color: 0xfff1b8,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    }),
  );
  beam.position.y = 0.6;
  beam.userData.noAO = true;
  beacon.add(beam);
  onFrame((t) => (beacon.rotation.y = t * 1.3));
}

// ---------------------------------------------------------------- far layer: hills, town lights, moon
// low-poly hills as clear silhouettes far behind the runway
const hillMat = flat(0x232a44, { roughness: 1 });
for (let i = 0; i < 14; i++) {
  const x = -150 + i * 23 + (r() - 0.5) * 10;
  const z = -105 - r() * 35;
  const h = 10 + r() * 16;
  const geo = new THREE.ConeGeometry(18 + r() * 12, h, 7, 2);
  const m = mesh(geo, hillMat, x, h / 2 - 0.5, z, { amt: 0.1, seed: 40 + i, shadow: false });
  m.rotation.y = r() * 3;
  m.scale.z = 0.6;
}
{
  const n = 260;
  const im = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.22, 6, 4),
    flat(0xffd890, { emissive: 0xffb84a, emissiveIntensity: 2.2 }),
    n,
  );
  im.userData.noAO = true;
  const m4 = new THREE.Matrix4();
  let k = 0;
  while (k < n) {
    const x = (r() - 0.5) * 260;
    const z = -66 - r() * 26;
    const cluster = noise2(x * 0.05, z * 0.05, SEED + 9);
    if (cluster < 0.45 || Math.abs(z - RUNWAY_Z) < 7) continue;
    m4.makeTranslation(x, 0.4 + r() * 2.5, z);
    im.setMatrixAt(k++, m4);
  }
  ground.add(im);
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(9, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0xfff6dc, fog: false }),
  );
  moon.position.set(-36, 96, -230);
  moon.userData.noAO = true;
  ground.add(moon);
}

// ---------------------------------------------------------------- the hangar
const HW = 15; // half width
const ZB = -11; // back wall
const ZF = 4; // front edge of the side walls (cutaway: open front)
const HH = 10; // wall height
const wallMat = flat(0x6f8a9a, { roughness: 0.7 });
const wallIn = flat(0x8ea3ae, { roughness: 0.75 });
const steel = flat(0x3b4452, { roughness: 0.5, metalness: 0.4 });
{
  // floor slab: polished concrete, worn patches, slight sheen
  const geo = new THREE.PlaneGeometry(2 * HW, ZF - ZB + 4, 30, 18);
  geo.rotateX(-Math.PI / 2);
  const g = patches(facet(geo, 0.05, SEED + 1), { amt: 0.12, scale: 0.18, seed: SEED, warm: 0.25 });
  const floor = new THREE.Mesh(g, facetMat(flat(0x8a8780, { roughness: 0.5, metalness: 0.05 })));
  floor.position.set(0, 0.012, (ZF + ZB) / 2 + 2);
  floor.receiveShadow = true;
  ground.add(floor);
  // yellow safety lines: a box around the test bay and a centre line
  const yel = flat(0xffc83a, { roughness: 0.6 });
  const line = (w, d, x, z) =>
    mesh(new THREE.BoxGeometry(w, 0.012, d), yel, x, 0.022, z, { shadow: false, amt: 0.1 });
  line(13, 0.18, 0, -6.2);
  line(13, 0.18, 0, 5.5);
  line(0.18, 11.7, -6.5, -0.35);
  line(0.18, 11.7, 6.5, -0.35);
  // hazard stripes at the doors
  for (let i = 0; i < 16; i++)
    mesh(
      new THREE.BoxGeometry(0.5, 0.012, 0.9),
      i % 2 ? yel : flat(0x22242a),
      -7.5 + i + 0.5,
      0.024,
      ZB + 0.9,
      { shadow: false },
    );
}
// back wall with the big door opening (x -7.5..7.5, up to y 8)
mesh(new THREE.BoxGeometry(HW - 7.5, HH, 0.4), wallMat, -(HW + 7.5) / 2, HH / 2, ZB, { seed: 11 });
mesh(new THREE.BoxGeometry(HW - 7.5, HH, 0.4), wallMat, (HW + 7.5) / 2, HH / 2, ZB, { seed: 12 });
mesh(new THREE.BoxGeometry(15, HH - 8, 0.4), wallMat, 0, 8 + (HH - 8) / 2, ZB, { seed: 13 });
// the sliding doors, pushed aside (inside the wall), with big panel lines
for (const s of [-1, 1]) {
  mesh(new THREE.BoxGeometry(7.2, 8, 0.25), flat(0x5c7584), s * 11.2, 4, ZB + 0.45, {
    seed: 14 + s,
  });
  for (let i = 0; i < 4; i++)
    mesh(new THREE.BoxGeometry(7.2, 0.12, 0.08), steel, s * 11.2, 1.2 + i * 1.9, ZB + 0.62, {
      shadow: false,
    });
}
// door track at the top
mesh(new THREE.BoxGeometry(30, 0.3, 0.4), steel, 0, 8.15, ZB + 0.5);
// side walls (left full, right with a band of square windows)
for (const s of [-1, 1]) {
  mesh(
    new THREE.BoxGeometry(0.4, HH, ZF - ZB),
    s < 0 ? wallMat : wallIn,
    s * HW,
    HH / 2,
    (ZF + ZB) / 2,
    { seed: 20 + s },
  );
}
// vertical ribs: corrugated look, inside faces
{
  const ribGeo = new THREE.BoxGeometry(0.12, HH, 0.14);
  const ribs = [];
  for (let x = -HW + 0.5; x <= HW - 0.5; x += 0.9) ribs.push([x, ZB + 0.24, 0]);
  for (let z = ZB + 0.6; z <= ZF - 0.3; z += 0.9)
    for (const s of [-1, 1]) ribs.push([s * (HW - 0.24), z, 1]);
  const im = new THREE.InstancedMesh(ribGeo, flat(0x5a7282, { roughness: 0.6 }), ribs.length);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  ribs.forEach(([a, b, side], i) => {
    const y = side === 0 && Math.abs(a) < 7.5 ? 8 + (HH - 8) / 2 : HH / 2;
    const sy = side === 0 && Math.abs(a) < 7.5 ? (HH - 8) / HH : 1;
    m4.compose(side ? V(a, y, b) : V(a, y, b), q, V(1, sy, 1));
    im.setMatrixAt(i, m4);
  });
  im.castShadow = true;
  ground.add(im);
}
// square windows high in the right wall, glowing cold blue (night outside)
for (let z = ZB + 2; z < ZF - 1; z += 2.4) {
  mesh(
    new THREE.BoxGeometry(0.1, 1.3, 1.5),
    flat(0x9fc2ff, { emissive: 0x5c86ff, emissiveIntensity: 0.9, roughness: 0.2 }),
    HW - 0.26,
    7.6,
    z,
    { shadow: false },
  );
  mesh(new THREE.BoxGeometry(0.14, 0.1, 1.6), steel, HW - 0.28, 7.6, z, { shadow: false });
}
// arched roof trusses, a roof skin only over the back third
const trussMat = flat(0x46505e, { roughness: 0.5, metalness: 0.5 });
for (const z of [-9.5, -5.5, -1.5, 2.5]) {
  const pts = [];
  for (let i = 0; i <= 24; i++) {
    const k = i / 24;
    pts.push(V(-HW + 2 * HW * k, HH + Math.sin(k * Math.PI) * 3, z));
  }
  const top = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.12, 6),
    trussMat,
  );
  top.castShadow = false;
  ground.add(top);
  const chord = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2 * HW, 6), trussMat);
  chord.rotation.z = Math.PI / 2;
  chord.position.set(0, HH - 0.3, z);
  ground.add(chord);
  // lattice diagonals
  for (let i = 0; i < 12; i++) {
    const x0 = -HW + 1.25 + i * 2.5;
    const x1 = x0 + 1.25;
    const k1 = (x1 + HW) / (2 * HW);
    const a = V(x0, HH - 0.3, z);
    const b = V(x1, HH + Math.sin(k1 * Math.PI) * 3, z);
    const len = a.distanceTo(b);
    const d = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, len, 5), trussMat);
    d.position.copy(a).add(b).multiplyScalar(0.5);
    d.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize());
    ground.add(d);
  }
}
{
  // roof skin (no shadow so the moon still reaches the floor)
  const pts = [];
  for (let i = 0; i <= 24; i++) {
    const k = i / 24;
    pts.push(new THREE.Vector2(-HW + 2 * HW * k, HH + Math.sin(k * Math.PI) * 3 + 0.14));
  }
  const shape = new THREE.Shape();
  shape.moveTo(pts[0].x, pts[0].y);
  for (const p of pts) shape.lineTo(p.x, p.y);
  for (let i = pts.length - 1; i >= 0; i--) shape.lineTo(pts[i].x, pts[i].y + 0.18);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 3.5, bevelEnabled: false });
  const roof = new THREE.Mesh(facet(geo, 0.05, 31), facetMat(wallMat));
  roof.position.z = ZB;
  ground.add(roof);
}
// gantry crane rail along the back, the trolley creeps back and forth
const trolley = new THREE.Group();
{
  for (const z of [-9.8, -8.2])
    mesh(new THREE.BoxGeometry(2 * HW, 0.35, 0.3), flat(0xe0a020, { roughness: 0.5 }), 0, 9.2, z, {
      shadow: false,
    });
  ground.add(trolley);
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.6, 2.0),
    flat(0xffc12a, { roughness: 0.45 }),
  );
  trolley.add(body);
  const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 3.2, 4), steel);
  cable.position.y = -1.9;
  trolley.add(cable);
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.07, 6, 10, Math.PI * 1.4), steel);
  hook.position.y = -3.6;
  trolley.add(hook);
  const block = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.3), flat(0xe2453c));
  block.position.y = -3.3;
  trolley.add(block);
  onFrame((t) => trolley.position.set(-9 + Math.sin(t * 0.18) * 3.5, 9.2, -9));
}
// big painted sign over the doors
{
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 160;
  const g = c.getContext("2d");
  g.fillStyle = "#f2ead6";
  g.fillRect(0, 0, 1024, 160);
  g.fillStyle = "#c2352b";
  g.fillRect(0, 128, 1024, 32);
  g.fillStyle = "#1e2a3a";
  g.font = "900 96px Montserrat, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("TESTHALLE 3", 512, 66);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 1.1),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 }),
  );
  s.position.set(0, 9.0, ZB + 0.24);
  ground.add(s);
}

// ---------------------------------------------------------------- hanging lamps
// green enamel shades with warm bulbs; four carry real light
const shadeMat = flat(0x2f6b4f, { roughness: 0.4, metalness: 0.3, side: THREE.DoubleSide });
const bulbMat = flat(0xfff3d0, { emissive: 0xffd88a, emissiveIntensity: 3 });
const LAMPS = [
  [-8, -7.5],
  [0, -8.6],
  [8, -7.5],
  [-9.5, -1.5],
  [9.5, -1.5],
  [-8.5, 2.5],
  [8.5, 2.5],
];
LAMPS.forEach(([x, z], i) => {
  const y = 7.2;
  const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, HH - y, 4), steel);
  wire.position.set(x, y + (HH - y) / 2, z);
  ground.add(wire);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.45, 14, 1, true), shadeMat);
  shade.position.set(x, y, z);
  ground.add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), bulbMat);
  bulb.position.set(x, y - 0.22, z);
  bulb.userData.noAO = true;
  ground.add(bulb);
  if (i < 5) {
    const pl = new THREE.PointLight(0xffd29a, 26, 16, 1.6);
    pl.position.set(x, y - 0.4, z);
    ground.add(pl);
  }
  // a soft light cone under the shade
  const cone2 = new THREE.Mesh(
    new THREE.ConeGeometry(2.6, 6.6, 18, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xffe0a8,
      transparent: true,
      opacity: 0.045,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    }),
  );
  cone2.position.set(x, y - 3.5, z);
  cone2.userData.noAO = true;
  ground.add(cone2);
});
// one big warm work light from the front-right onto the test bay
{
  const s = new THREE.SpotLight(0xffe4c0, 60, 0, 0.5, 0.7, 1.2);
  s.position.set(6, 9, 9);
  s.target.position.set(0, 1, -0.5);
  s.castShadow = true;
  s.shadow.mapSize.set(2048, 2048);
  s.shadow.bias = -0.0004;
  ground.add(s, s.target);
}

// ---------------------------------------------------------------- props (near ring)
// boarding stairs on wheels, rolled up to the plane's door (left of the nose)
{
  const g = new THREE.Group();
  const red = flat(0xd8402f, { roughness: 0.5 });
  const frame = flat(0xe9e4d8, { roughness: 0.6 });
  for (let i = 0; i < 9; i++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.08, 0.36), frame);
    step.position.set(0, 0.35 + i * 0.2, -i * 0.3);
    g.add(step);
  }
  for (const s of [-0.58, 0.58]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 3.4), red);
    rail.position.set(s, 1.35, -1.25);
    rail.rotation.x = Math.atan2(1.6, 2.4);
    g.add(rail);
    const hand = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 3.3, 5), red);
    hand.position.set(s, 2.1, -1.2);
    hand.rotation.x = Math.PI / 2 - Math.atan2(1.6, 2.4);
    g.add(hand);
  }
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.25, 3.0), red);
  base.position.set(0, 0.25, -1.1);
  g.add(base);
  for (const [x, z] of [
    [-0.55, 0.2],
    [0.55, 0.2],
    [-0.55, -2.4],
    [0.55, -2.4],
  ]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 10), M.rubber);
    w.rotation.z = Math.PI / 2;
    w.position.set(x, 0.16, z);
    g.add(w);
  }
  g.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  place(g, -9.2, -3.2, Math.PI * 0.62);
}
// workbench with tools along the left wall
{
  const g = new THREE.Group();
  const wood = flat(0x9a6a3a, { roughness: 0.8 });
  const top = F(new THREE.BoxGeometry(3.2, 0.12, 1.0), wood, 0.08, 5);
  top.position.y = 0.95;
  g.add(top);
  for (const [x, z] of [
    [-1.5, -0.4],
    [1.5, -0.4],
    [-1.5, 0.4],
    [1.5, 0.4],
  ]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.95, 0.1), steel);
    leg.position.set(x, 0.47, z);
    g.add(leg);
  }
  const vice = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.3, 0.3),
    flat(0x2f6fd6, { roughness: 0.4 }),
  );
  vice.position.set(1.1, 1.15, 0.2);
  g.add(vice);
  const board = F(new THREE.BoxGeometry(3.2, 1.6, 0.08), flat(0xc9b48a), 0.06, 6);
  board.position.set(0, 2.2, -0.5);
  g.add(board);
  // tool silhouettes on the board
  const toolMat = flat(0x3b4452, { metalness: 0.5, roughness: 0.4 });
  for (let i = 0; i < 6; i++) {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5 + (i % 3) * 0.15, 0.05), toolMat);
    tl.position.set(-1.3 + i * 0.5, 2.2, -0.44);
    tl.rotation.z = (i % 2 ? 1 : -1) * 0.2;
    g.add(tl);
  }
  g.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  place(g, -13.6, -6.5, Math.PI / 2);
}
// red rolling toolbox, gas bottles, drums, crates, cones, chocks
{
  const g = new THREE.Group();
  const red = flat(0xc8352a, { roughness: 0.35, metalness: 0.2 });
  const body = F(new THREE.BoxGeometry(1.0, 1.1, 0.6), red, 0.05, 7);
  body.position.y = 0.65;
  g.add(body);
  for (let i = 0; i < 4; i++) {
    const h = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.04), M.chrome);
    h.position.set(0, 0.35 + i * 0.25, 0.32);
    g.add(h);
  }
  g.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  place(g, -11.6, -8.6, 0.2);
}
for (let i = 0; i < 3; i++) {
  const b = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 1.6, 10),
    flat([0x2f9e6a, 0x2f9e6a, 0x3a6fd6][i], { roughness: 0.4, metalness: 0.2 }),
  );
  b.position.set(12.8 + i * 0.5, 0.8, -9.6);
  b.castShadow = true;
  ground.add(b);
  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2),
    b.material,
  );
  cap.position.set(12.8 + i * 0.5, 1.6, -9.6);
  ground.add(cap);
}
place(barrel(), 12.6, -7.6);
place(barrel(), 13.4, -7.2, 0.6);
place(barrel(), 13.0, -6.4, 1.2);
place(crate(), 11.6, 1.5, 0.3, 1.3);
place(crate(), 12.8, 2.2, -0.2, 1.1);
place(crate(), 12.2, 1.9, 0.5, 0.9, 1.15);
place(cone(), 8.4, 6.2);
place(cone(), -8.2, 6.4);
// a little tug tractor parked by the right wall
{
  const g = new THREE.Group();
  const yel = flat(0xf2b81f, { roughness: 0.45 });
  const body = F(new THREE.BoxGeometry(2.0, 0.7, 1.2), yel, 0.06, 8);
  body.position.y = 0.6;
  g.add(body);
  const cab = F(new THREE.BoxGeometry(0.8, 0.7, 1.0), yel, 0.06, 9);
  cab.position.set(-0.5, 1.3, 0);
  g.add(cab);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.5), flat(0x22242a));
  seat.position.set(0.3, 1.0, 0);
  g.add(seat);
  for (const [x, z] of [
    [-0.7, 0.62],
    [0.7, 0.62],
    [-0.7, -0.62],
    [0.7, -0.62],
  ]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.25, 12), M.rubber);
    w.rotation.x = Math.PI / 2;
    w.position.set(x, 0.32, z);
    g.add(w);
  }
  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 8, 6),
    flat(0xffa040, { emissive: 0xff8a20, emissiveIntensity: 2 }),
  );
  lamp.position.set(-0.5, 1.75, 0);
  lamp.userData.noAO = true;
  g.add(lamp);
  onFrame((t) => (lamp.material.emissiveIntensity = Math.sin(t * 6) > 0 ? 2.4 : 0.2));
  g.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  place(g, 11.4, -3.6, -Math.PI / 2 + 0.3);
}
// chalkboard with the test log on an easel (back right)
{
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 384;
  const g = c.getContext("2d");
  g.fillStyle = "#24362c";
  g.fillRect(0, 0, 512, 384);
  g.strokeStyle = "rgba(255,255,255,.85)";
  g.fillStyle = "rgba(255,255,255,.9)";
  g.lineWidth = 5;
  g.font = "800 46px Montserrat, sans-serif";
  g.fillText("DRUCKTEST", 30, 64);
  g.font = "800 34px Montserrat, sans-serif";
  for (let i = 0; i < 5; i++) {
    g.fillText(`${i + 1}  ▮▮▮▮▮`, 34, 130 + i * 50);
  }
  g.beginPath();
  g.moveTo(300, 330);
  for (let i = 0; i < 8; i++) g.lineTo(300 + i * 26, 330 - i * i * 4);
  g.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const board = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.5, 0.06), [
    steel,
    steel,
    steel,
    steel,
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }),
    steel,
  ]);
  board.position.set(9.4, 1.9, -9.2);
  board.rotation.set(-0.12, -0.35, 0);
  board.castShadow = true;
  ground.add(board);
  for (const s of [-0.7, 0.7]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 2.6, 0.07), flat(0x9a6a3a));
    leg.position.set(9.4 + s * 0.94, 1.3, -9.0 + s * 0.33);
    leg.rotation.z = -s * 0.12;
    ground.add(leg);
  }
}

// ---------------------------------------------------------------- life
// dust in the lamp light, a few moths around the bulbs
fireflies(80, { area: [-12, 12, 0.5, 7, -10, 5], color: 0xffe9c0, size: 0.02, seed: SEED });
for (const [x, z] of LAMPS.slice(0, 4))
  fireflies(5, {
    area: [x - 0.7, x + 0.7, 6.4, 7.0, z - 0.7, z + 0.7],
    color: 0xfff4d8,
    size: 0.035,
    seed: SEED + x,
  });

finishSet({ ground: 0x3a3f4f });
export { sky, HW, ZB };
