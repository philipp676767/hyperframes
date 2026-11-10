// #64 Blitzer — a country road at night (Landstraße, late autumn): wet
// asphalt that catches the headlights, white reflector posts, a guard rail on
// the far side, a harvested field with white-wrapped bales behind the speed
// camera, a ridge of wind turbines with their red lights blinking in sync
// (hero piece), a village with a lit church tower far off, a pine forest
// behind the camera, low ground fog drifting over the field, the moon.
//
// Layout (1 unit = 1 m): the road runs along x, centre line at z = ROAD_Z.
// The near lane (z ≈ 2.6) is the one the viewer drives in, towards -x — the
// speed camera stands on its right verge at the origin, the field lies
// behind it (z < 0).
import { THREE, flat, ground, onFrame, real, roundedBox, rng, V, scene } from "./world.js";
import {
  SKIES,
  setSky,
  finishSet,
  terrain,
  pine,
  tree,
  F,
  add,
  fireflies,
} from "./environments.js";
import { place, bush } from "./props.js";

const SEED = 64;
export const ROAD_Z = 4.2;
export const LANE_NEAR = 2.55; // the viewer's lane (driving towards -x)
export const LANE_FAR = 5.85;
const ROAD_W = 6.6;

// ---------------------------------------------------------------- light
// late-autumn night: deep blue, a faint warm glow of the town at the horizon,
// a cool moon high on the left
setSky({
  ...SKIES.nacht,
  top: [0.02, 0.035, 0.11],
  mid: [0.06, 0.09, 0.22],
  hor: [0.3, 0.27, 0.4],
  below: [0.07, 0.09, 0.17],
  sun: [0.85, 0.9, 1.0],
  sunDir: [-0.45, 0.42, -1],
  hemi: [0x8ea2ff, 0x1c2236, 1.05],
  key: [0xc4d2ff, 1.55],
  keyPos: [-7, 13, 5],
  rim: [0x7f96ff, 1.1],
  stars: 1.1,
  clouds: 7,
  birds: false,
  fog: [26, 105],
});

// the moon (a soft disc in the sky towards the key light) + halo
{
  const dir = V(-0.45, 0.42, -1).normalize();
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(4.2, 32, 16),
    new THREE.MeshBasicMaterial({ color: 0xf2f0ff, fog: false }),
  );
  moon.position.copy(dir.clone().multiplyScalar(260));
  scene.add(moon);
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(11, 24, 12),
    new THREE.MeshBasicMaterial({
      color: 0x8fa0ff,
      transparent: true,
      opacity: 0.12,
      fog: false,
      depthWrite: false,
    }),
  );
  halo.position.copy(moon.position);
  scene.add(halo);
}

// ---------------------------------------------------------------- ground
// dark meadow / field, rising to a ridge behind (turbines) and to a forest edge in front
terrain(0x3c5232, {
  seed: SEED,
  amt: 0.14,
  warm: 0.25,
  height: (x, z, d) => {
    if (d < 30) return 0;
    const ridge = z < 0 ? Math.min(1, (-z - 30) / 25) : 0.25 * Math.min(1, (z - 30) / 20);
    return Math.max(0, ridge) * (9 + 4 * Math.sin(x * 0.05 + 1.3)) * Math.min(1, (d - 30) / 15);
  },
});

// the field behind the camera box: harvested, brown stubble rows
{
  const geo = new THREE.PlaneGeometry(150, 26, 75, 13);
  geo.rotateX(-Math.PI / 2);
  const m = F(geo, flat(0x5b4a33), 0.12, SEED);
  m.position.set(0, 0.015, -16);
  m.receiveShadow = true;
  ground.add(m);
  // stubble rows: tiny instanced stalks
  const r = rng(SEED + 3);
  const n = 2600;
  const stalk = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.012, 0.018, 0.22, 4),
    flat(0xb39a63),
    n,
  );
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  for (let i = 0; i < n; i++) {
    const row = Math.floor(r() * 30);
    const x = -55 + r() * 110;
    const z = -3.6 - row * 0.8 - r() * 0.15;
    q.setFromAxisAngle(V(1, 0, 0), (r() - 0.5) * 0.4);
    m4.compose(V(x, 0.1, z), q, V(1, 0.6 + r() * 0.8, 1));
    stalk.setMatrixAt(i, m4);
  }
  stalk.receiveShadow = true;
  ground.add(stalk);
}

// ---------------------------------------------------------------- the road
// wet asphalt: a long smooth strip (catches the headlights and the moon)
const asphalt = real.plastic(0x222428, {
  roughness: 0.82,
  clearcoat: 0.08,
  clearcoatRoughness: 0.5,
});
{
  const road = new THREE.Mesh(new THREE.PlaneGeometry(220, ROAD_W, 110, 6), asphalt);
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0.025, ROAD_Z);
  road.receiveShadow = true;
  ground.add(road);
  // gravel shoulders
  for (const s of [-1, 1]) {
    const sh = F(
      new THREE.PlaneGeometry(220, 0.9, 110, 1).rotateX(-Math.PI / 2),
      flat(0x6e6658),
      0.14,
      SEED + s,
    );
    sh.position.set(0, 0.02, ROAD_Z + s * (ROAD_W / 2 + 0.45));
    sh.receiveShadow = true;
    ground.add(sh);
  }
  // markings: solid edge lines + dashed centre line (4 m dash, 8 m gap)
  const paint = real.plastic(0xe9ebee, { roughness: 0.5, emissive: 0x15171c });
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.PlaneGeometry(220, 0.15), paint);
    e.rotation.x = -Math.PI / 2;
    e.position.set(0, 0.03, ROAD_Z + s * (ROAD_W / 2 - 0.25));
    ground.add(e);
  }
  for (let x = -110; x < 110; x += 12) {
    const d = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.13), paint);
    d.rotation.x = -Math.PI / 2;
    d.position.set(x, 0.031, ROAD_Z);
    ground.add(d);
  }
}

// ---------------------------------------------------------------- reflector posts
// German / Austrian Leitpfosten: white post, black band, reflector
const postWhite = real.plastic(0xf1f1ee, { roughness: 0.5 });
const postBlack = real.plastic(0x16171a, { roughness: 0.5 });
const reflAmber = new THREE.MeshStandardMaterial({
  color: 0xffa21a,
  emissive: 0xff8a00,
  emissiveIntensity: 1.6,
});
const reflWhite = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  emissive: 0xdfe8ff,
  emissiveIntensity: 1.2,
});
function leitpfosten(right) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(roundedBox(0.12, 1.0, 0.1, 0.025), postWhite);
  body.position.y = 0.5;
  body.castShadow = true;
  g.add(body);
  const band = new THREE.Mesh(roundedBox(0.125, 0.25, 0.105, 0.02), postBlack);
  band.position.y = 0.86;
  g.add(band);
  const refl = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.16, 0.02),
    right ? reflAmber : reflWhite,
  );
  refl.position.set(0, 0.86, 0.06);
  g.add(refl);
  return g;
}
for (let x = -96; x <= 96; x += 16) {
  if (Math.abs(x) > 7) place(leitpfosten(true), x, ROAD_Z - ROAD_W / 2 - 0.75, -Math.PI / 2);
  place(leitpfosten(false), x + 8, ROAD_Z + ROAD_W / 2 + 0.75, Math.PI / 2);
}

// ---------------------------------------------------------------- guard rail (far side)
{
  const steel = real.metal(0xb7bec6, { roughness: 0.35 });
  const zR = ROAD_Z + ROAD_W / 2 + 1.25;
  const beam = new THREE.Mesh(roundedBox(120, 0.32, 0.07, 0.03), steel);
  beam.position.set(-6, 0.62, zR);
  beam.castShadow = true;
  ground.add(beam);
  for (let x = -64; x <= 52; x += 4) {
    const p = new THREE.Mesh(roundedBox(0.1, 0.75, 0.1, 0.02), steel);
    p.position.set(x, 0.37, zR + 0.12);
    p.castShadow = true;
    ground.add(p);
  }
}

// ---------------------------------------------------------------- speed limit sign "70"
function signTexture(text) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = "#ffffff";
  g.beginPath();
  g.arc(128, 128, 124, 0, Math.PI * 2);
  g.fill();
  g.lineWidth = 30;
  g.strokeStyle = "#d4161c";
  g.beginPath();
  g.arc(128, 128, 106, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = "#111";
  g.font = "bold 112px Arial, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, 128, 136);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
export function speedSign(text = "70") {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 2.4, 16),
    real.metal(0xaab0b6, { roughness: 0.4 }),
  );
  pole.position.y = 1.2;
  pole.castShadow = true;
  g.add(pole);
  const face = new THREE.Mesh(
    new THREE.CircleGeometry(0.42, 48),
    new THREE.MeshStandardMaterial({
      map: signTexture(text),
      roughness: 0.4,
      emissive: 0xffffff,
      emissiveMap: signTexture(text),
      emissiveIntensity: 0.18,
    }),
  );
  face.position.set(0, 2.15, 0.045);
  g.add(face);
  const back = new THREE.Mesh(
    new THREE.CylinderGeometry(0.43, 0.43, 0.04, 48),
    real.metal(0x9aa0a6, { roughness: 0.5 }),
  );
  back.rotation.x = Math.PI / 2;
  back.position.set(0, 2.15, 0.02);
  g.add(back);
  return g;
}
// facing the viewer's car (which comes from +x)
place(speedSign("70"), 48, ROAD_Z - ROAD_W / 2 - 1.0, Math.PI / 2);
place(speedSign("70"), -34, ROAD_Z + ROAD_W / 2 + 1.0, -Math.PI / 2);

// ---------------------------------------------------------------- field: wrapped bales
{
  const wrap = real.plastic(0xeceee9, { roughness: 0.3, clearcoat: 0.6 });
  const wrapDark = real.plastic(0x2f3a2c, { roughness: 0.3, clearcoat: 0.6 });
  const r = rng(SEED + 9);
  [
    [-9, -9],
    [-7.6, -9.4],
    [-12, -14],
    [11, -10],
    [12.4, -10.3],
    [16, -16],
    [-20, -11],
    [3.5, -19],
    [24, -12],
  ].forEach(([x, z], i) => {
    const b = new THREE.Mesh(
      new THREE.CylinderGeometry(0.62, 0.62, 1.2, 40, 1),
      i % 4 === 3 ? wrapDark : wrap,
    );
    b.rotation.z = Math.PI / 2;
    b.rotation.y = r() * Math.PI;
    b.position.set(x, 0.62, z);
    b.castShadow = true;
    b.receiveShadow = true;
    ground.add(b);
  });
}

// ---------------------------------------------------------------- hedges, trees, forest
[
  [-15, -2.6],
  [15.5, -2.4],
  [-26, -3],
  [22, -3.2],
  [-40, 12],
  [38, 13],
].forEach(([x, z], i) => place(bush(SEED + i, 0x2f4a2a), x, z, i, 1.4));
[
  [-18, -6, 1.6],
  [19, -7, 1.5],
  [-33, -9, 1.8],
  [34, -6, 1.7],
].forEach(([x, z, s], i) => tree(x, z, s, SEED + i));
// forest behind the camera side of the road
{
  const r = rng(SEED + 21);
  for (let i = 0; i < 70; i++) {
    const x = -70 + r() * 140;
    const z = 31 + r() * 16;
    pine(x, z, 2.2 + r() * 1.6, SEED + 30 + i);
  }
  for (let i = 0; i < 40; i++) {
    const x = -90 + r() * 180;
    const z = -40 - r() * 20;
    pine(x, z, 2.6 + r() * 1.6, SEED + 120 + i);
  }
}

// ---------------------------------------------------------------- hero: wind turbines
const BLADE_SPEED = 1.1;
const turbineMat = real.plastic(0xd8dde4, { roughness: 0.45 });
const redLight = new THREE.MeshBasicMaterial({ color: 0xff2a1a, fog: false });
const turbines = [];
function turbine(x, z, h, phase) {
  const g = new THREE.Group();
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 1.4, h, 24), turbineMat);
  tower.position.y = h / 2;
  g.add(tower);
  const nac = new THREE.Mesh(roundedBox(1.4, 1.4, 3.6, 0.4), turbineMat);
  nac.position.set(0, h + 0.4, 0.4);
  g.add(nac);
  const hub = new THREE.Group();
  hub.position.set(0, h + 0.4, 2.4);
  g.add(hub);
  const cone = new THREE.Mesh(new THREE.SphereGeometry(0.75, 24, 16), turbineMat);
  hub.add(cone);
  for (let k = 0; k < 3; k++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.9, 17, 0.2), turbineMat);
    blade.geometry.translate(0, 8.5, 0);
    blade.rotation.z = (k / 3) * Math.PI * 2;
    hub.add(blade);
  }
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 8), redLight);
  lamp.position.set(0, h + 1.3, 0.4);
  g.add(lamp);
  g.position.set(x, 0, z);
  g.rotation.y = 0.35;
  ground.add(g);
  turbines.push({ hub, lamp, phase });
}
turbine(-34, -62, 34, 0);
turbine(-6, -70, 36, 1.7);
turbine(24, -64, 33, 3.1);
turbine(52, -76, 35, 4.4);
onFrame((t) => {
  // all lights blink in sync (they really do): 1 s on, 1 s off
  const on = Math.floor(t / 1.0) % 2 === 0;
  for (const tb of turbines) {
    tb.hub.rotation.z = t * BLADE_SPEED + tb.phase;
    tb.lamp.visible = on;
  }
});

// ---------------------------------------------------------------- village far off
{
  const wall = flat(0xc9c2b8);
  const roof = flat(0x5a3a33);
  const win = new THREE.MeshBasicMaterial({ color: 0xffc46a, fog: false });
  const r = rng(SEED + 40);
  const vx = 58;
  const vz = -52;
  for (let i = 0; i < 9; i++) {
    const x = vx + (r() - 0.5) * 22;
    const z = vz + (r() - 0.5) * 10;
    const w = 3 + r() * 2;
    const h = 2.6 + r() * 1.5;
    add(F(new THREE.BoxGeometry(w, h, 3.4), wall, 0.08, i), x, h / 2 + 7, z);
    const rf = F(new THREE.ConeGeometry(w * 0.78, 1.8, 4), roof, 0.08, i);
    rf.rotation.y = Math.PI / 4;
    add(rf, x, h + 7.9, z);
    for (let k = 0; k < 2; k++)
      if (r() > 0.35)
        add(
          new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.6), win),
          x - 0.8 + k * 1.6,
          7 + h * 0.55,
          z + 1.72,
          false,
        );
  }
  // church tower with a lit clock
  add(F(new THREE.BoxGeometry(2.4, 11, 2.4), wall, 0.08, 99), vx - 2, 12.5, vz + 1);
  add(F(new THREE.ConeGeometry(1.9, 5, 4), flat(0x3d4f45), 0.08, 98), vx - 2, 20.5, vz + 1);
  add(new THREE.Mesh(new THREE.CircleGeometry(0.55, 24), win), vx - 2, 16, vz + 2.21, false);
}

// ---------------------------------------------------------------- life
// distant cars on a far road behind the field: pairs of headlights / taillights
{
  const head = new THREE.MeshBasicMaterial({ color: 0xfff3d6, fog: false });
  const tail = new THREE.MeshBasicMaterial({ color: 0xff2a1a, fog: false });
  const cars = [];
  for (let i = 0; i < 4; i++) {
    const g = new THREE.Group();
    const mat = i % 2 ? tail : head;
    for (const s of [-0.7, 0.7]) {
      const l = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), mat);
      l.position.set(0, 1.0, s);
      g.add(l);
    }
    g.rotation.y = Math.PI / 2;
    ground.add(g);
    cars.push({ g, dir: i % 2 ? 1 : -1, off: i * 41 });
  }
  onFrame((t) => {
    for (const c of cars) {
      const u = (((t * 9 + c.off) % 160) + 160) % 160;
      c.g.position.set(c.dir * (u - 80), 4.2, -36);
    }
  });
}
// low ground fog drifting over the field (soft translucent sheets)
{
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(64, 64, 4, 64, 64, 62);
  grd.addColorStop(0, "rgba(255,255,255,0.55)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    color: 0x9aa8d8,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
  });
  const r = rng(SEED + 55);
  const sheets = [];
  for (let i = 0; i < 26; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(14, 5), mat);
    m.rotation.x = -Math.PI / 2 + 0.12;
    m.userData.noAO = true;
    const base = [-60 + r() * 120, 0.35 + r() * 0.5, -6 - r() * 26];
    ground.add(m);
    sheets.push({ m, base, sp: 0.25 + r() * 0.35 });
  }
  onFrame((t) => {
    for (const s of sheets) {
      const x = ((((s.base[0] + t * s.sp + 60) % 120) + 120) % 120) - 60;
      s.m.position.set(x, s.base[1], s.base[2]);
    }
  });
}
// moths / dust drifting in the air near the road
fireflies(26, { area: [-30, 30, 0.6, 3.2, -14, -5], color: 0xdfe6ff, seed: SEED, size: 0.02 });

finishSet({ ground: 0x2c3a2a });
