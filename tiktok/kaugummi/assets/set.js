// Set of #37 "Was passiert, wenn du einen Kaugummi verschluckst?":
// the Wiener Prater at dusk. A bench on a little plaza in front of the
// Riesenrad, the wheel turning with its lit rim, a swing carousel spinning
// on the right, a roller coaster on the far hill, a candy-floss stall,
// lamps and fairy lights coming on, balloons bobbing, the WC booth for the
// payoff. Warm fairground lights against a violet sky.
import { THREE, flat, ground, onFrame, rng, V } from "./world.js";
import {
  SKIES,
  setSky,
  finishSet,
  terrain,
  discGeo,
  pathStrip,
  lightString,
  fireflies,
  meadow,
  tree,
  F,
  add,
} from "./environments.js";
import { place, scatter, lamp, bush, flowerBed, bin, stall, awning } from "./props.js";

const SEED = 37;

// ---------------------------------------------------------------- light
// dusk over the Prater: violet zenith, a hot pink-orange band at the horizon
// behind the wheel, the first stars; warm key from the low sun on the left.
const sky = setSky({
  ...SKIES.sonnenuntergang,
  top: [0.2, 0.18, 0.52],
  mid: [0.62, 0.38, 0.7],
  hor: [1.0, 0.62, 0.42],
  below: [0.6, 0.45, 0.62],
  sun: [1.0, 0.72, 0.45],
  sunDir: [-0.55, 0.12, -1],
  hemi: [0xffd9e8, 0x5a4a6a, 1.25],
  key: [0xffd2a8, 2.4],
  keyPos: [-9, 9, 8],
  rim: [0xb48cff, 1.0],
  clouds: 9,
  stars: 0.25,
  fog: [26, 95],
});

// ---------------------------------------------------------------- ground
// worn Prater lawn, a gravel plaza around the bench, the Hauptallee towards
// the wheel
terrain(0x79a64c, { seed: SEED, amt: 0.12, warm: 0.45, hills: 6 });
{
  const plaza = F(discGeo(8.5, 0.9, SEED), flat(0xd6c3a2), 0.06, SEED);
  plaza.position.y = 0.025;
  plaza.receiveShadow = true;
  ground.add(plaza);
}
pathStrip(
  [
    [0, -7.5],
    [-1.5, -13],
    [-4, -19],
    [-6, -26],
  ],
  { width: 3.2, color: 0xd6c3a2, seed: SEED },
);
pathStrip(
  [
    [7.5, -4],
    [12, -9],
    [13, -14],
  ],
  { width: 2.2, color: 0xd1bd9a, seed: SEED + 1 },
);
meadow({
  n: 320,
  rMin: 9,
  rMax: 24,
  seed: SEED,
  keep: (x, z) => !(Math.abs(x + 2.5) < 3 && z < -7),
});

// ---------------------------------------------------------------- hero: Riesenrad
const WHEEL = { x: -7, z: -27, y: 12.5, r: 10.5 };
const wheel = new THREE.Group();
{
  const red = flat(0xc8323a, { roughness: 0.55 });
  const steel = flat(0xe9e2d6, { roughness: 0.5, metalness: 0.3 });
  const frame = new THREE.Group();
  frame.position.set(WHEEL.x, 0, WHEEL.z);
  ground.add(frame);
  // A-frame legs, front and back
  for (const dz of [-1.1, 1.1])
    for (const dx of [-1, 1]) {
      const len = Math.hypot(6.8, WHEEL.y);
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.45, len, 0.45), steel);
      leg.position.set(dx * 3.4, WHEEL.y / 2, dz);
      leg.rotation.z = dx * Math.atan2(6.8, WHEEL.y) * 0.5;
      leg.castShadow = true;
      frame.add(leg);
    }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 2.6, 12), steel);
  hub.rotation.x = Math.PI / 2;
  hub.position.y = WHEEL.y;
  frame.add(hub);
  // base house
  const house = F(new THREE.BoxGeometry(5, 2.2, 3.4), flat(0xf1e4cf), 0.05, SEED + 5);
  house.position.y = 1.1;
  frame.add(house);
  const roof = F(new THREE.BoxGeometry(5.4, 0.35, 3.8), red, 0.05, SEED + 6);
  roof.position.y = 2.35;
  frame.add(roof);

  wheel.position.set(WHEEL.x, WHEEL.y, WHEEL.z);
  ground.add(wheel);
  for (const dz of [-0.9, 0.9]) {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(WHEEL.r, 0.18, 6, 48), red);
    rim.position.z = dz;
    wheel.add(rim);
    const inner = new THREE.Mesh(new THREE.TorusGeometry(WHEEL.r * 0.55, 0.1, 6, 36), red);
    inner.position.z = dz;
    wheel.add(inner);
  }
  const N = 30;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    for (const dz of [-0.9, 0.9]) {
      const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, WHEEL.r, 4), steel);
      spoke.position.set((Math.cos(a) * WHEEL.r) / 2, (Math.sin(a) * WHEEL.r) / 2, dz);
      spoke.rotation.z = a - Math.PI / 2;
      wheel.add(spoke);
    }
  }
  // bulbs on the rim
  const bulbMat = flat(0xffe2a0, { emissive: 0xffc45a, emissiveIntensity: 2.2 });
  const bulbs = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.13, 0), bulbMat, 96);
  bulbs.userData.noAO = true;
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 96; i++) {
    const a = (i / 48) * Math.PI * 2;
    m4.makeTranslation(
      Math.cos(a) * (WHEEL.r + 0.25),
      Math.sin(a) * (WHEEL.r + 0.25),
      i < 48 ? 1.05 : -1.05,
    );
    bulbs.setMatrixAt(i, m4);
  }
  wheel.add(bulbs);
}
// the red cabins hang level while the wheel turns
const cabins = [];
{
  const colors = [0xc8323a, 0xc8323a, 0xe8b23a];
  const winMat = flat(0xffe9b8, { emissive: 0xffc46b, emissiveIntensity: 0.9 });
  for (let i = 0; i < 15; i++) {
    const c = new THREE.Group();
    const body = F(
      new THREE.BoxGeometry(1.5, 1.1, 1.0),
      flat(colors[i % 3], { roughness: 0.5 }),
      0.05,
      i,
    );
    body.castShadow = true;
    c.add(body);
    const win = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.45, 1.04), winMat);
    win.position.y = 0.12;
    c.add(win);
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.14, 1.2), flat(0xf1e4cf));
    top.position.y = 0.62;
    c.add(top);
    ground.add(c);
    cabins.push(c);
  }
}
onFrame((t) => {
  const rot = t * 0.06;
  wheel.rotation.z = rot;
  cabins.forEach((c, i) => {
    const a = rot + (i / 15) * Math.PI * 2;
    c.position.set(WHEEL.x + Math.cos(a) * WHEEL.r, WHEEL.y + Math.sin(a) * WHEEL.r - 0.8, WHEEL.z);
  });
});

// ---------------------------------------------------------------- swing carousel (right)
{
  const C = { x: 13.5, z: -15 };
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.45, 7, 10),
    flat(0xf1e4cf, { metalness: 0.2 }),
  );
  add(pole, C.x, 3.5, C.z);
  const base = F(new THREE.CylinderGeometry(2.4, 2.6, 0.5, 14), flat(0x3f6fb8), 0.05, SEED + 9);
  add(base, C.x, 0.25, C.z);
  const spin = new THREE.Group();
  spin.position.set(C.x, 7, C.z);
  ground.add(spin);
  const crown = F(new THREE.ConeGeometry(3.4, 1.4, 14), flat(0xe8b23a), 0.06, SEED + 10);
  crown.position.y = 0.6;
  crown.castShadow = true;
  spin.add(crown);
  const stripe = new THREE.Mesh(
    new THREE.CylinderGeometry(3.4, 3.4, 0.45, 14),
    flat(0xc8323a, { emissive: 0x401010 }),
  );
  spin.add(stripe);
  const chainMat = flat(0x3b3f47, { metalness: 0.5, roughness: 0.4 });
  const seatColors = [0x3fb5ff, 0xff6fae, 0xffd23f, 0x5fd17a];
  const swings = [];
  for (let i = 0; i < 12; i++) {
    const s = new THREE.Group();
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 3.2, 4), chainMat);
    chain.position.y = -1.6;
    s.add(chain);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.5), flat(seatColors[i % 4]));
    seat.position.y = -3.2;
    seat.castShadow = true;
    s.add(seat);
    spin.add(s);
    swings.push(s);
  }
  onFrame((t) => {
    spin.rotation.y = t * 0.9;
    swings.forEach((s, i) => {
      const a = (i / 12) * Math.PI * 2;
      s.position.set(Math.cos(a) * 3.1, 0, Math.sin(a) * 3.1);
      s.rotation.set(0, -a, 0);
      s.rotateZ(0.55); // flung outward
    });
  });
}

// ---------------------------------------------------------------- roller coaster (far right)
{
  const pts = [];
  for (let i = 0; i <= 80; i++) {
    const k = i / 80;
    const x = 16 + k * 26;
    const z = -34 - Math.sin(k * Math.PI) * 6;
    const y = 3 + Math.abs(Math.sin(k * Math.PI * 3)) * 6 + (k < 0.2 ? k * 20 : 0);
    pts.push(V(x, y, z));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  const rail = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 240, 0.22, 6),
    flat(0x2f8fd8, { roughness: 0.45 }),
  );
  rail.castShadow = true;
  ground.add(rail);
  const postMat = flat(0xf1e4cf);
  for (let i = 0; i <= 80; i += 5) {
    const p = pts[i];
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, p.y, 5), postMat);
    post.position.set(p.x, p.y / 2, p.z);
    ground.add(post);
  }
  // a little train racing over it
  const car = new THREE.Group();
  for (let j = 0; j < 3; j++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.7), flat(0xffd23f));
    b.position.x = -j * 1.0;
    car.add(b);
  }
  ground.add(car);
  onFrame((t) => {
    const k = (t * 0.07) % 1;
    const p = curve.getPointAt(k);
    const q = curve.getPointAt(Math.min(1, k + 0.01));
    car.position.copy(p).add(V(0, 0.45, 0));
    car.lookAt(q.x, q.y + 0.45, q.z);
    car.rotateY(-Math.PI / 2);
  });
}

// ---------------------------------------------------------------- near ring
// candy floss + Langos stalls on the left, lamps with fairy lights behind
// the bench, balloons, the WC booth on the right (payoff)
place(stall([0xff8fc8, 0xffffff], [0xffb3d9, 0xffe6f2, 0xff8fc8]), -8.2, -3.2, 0.5);
place(stall([0x3fb5ff, 0xffffff], [0xffd27a, 0xe8a24a]), -9.4, 1.8, 1.2);
place(awning(2.4, [0xe8b23a, 0xffffff]), 9.6, 2.6, -1.3);
const LAMPS = [
  [-5.2, -6.2],
  [0.4, -7.6],
  [5.8, -6.4],
];
for (const [x, z] of LAMPS) place(lamp({ on: true, h: 3.4 }), x, z);
lightString([-5.2, 3.75, -6.2], [0.4, 3.75, -7.6], {
  n: 14,
  sag: 0.6,
  colors: [0xff6f8f, 0xffd27a, 0x7fd8ff],
});
lightString([0.4, 3.75, -7.6], [5.8, 3.75, -6.4], {
  n: 14,
  sag: 0.6,
  colors: [0xffd27a, 0x7fd8ff, 0xff6f8f],
});
place(bin(0x2f7d4a), -3.6, -5.6);
place(flowerBed(SEED, [0xff8fb8, 0xffd84a, 0xffffff]), 3.4, -6.2, 0, 0.8);
scatter((i) => bush(SEED + i, 0x4f9a35), 7, {
  rMin: 9,
  rMax: 15,
  seed: SEED + 3,
  keep: (x, z) => !(Math.abs(x + 2.5) < 3 && z < -7) && !(x > 6 && x < 12 && z > -10 && z < -3),
});

// WC booth (the payoff: "Ganz normal, auf dem Klo.") — its door swings
export const WC = { x: 8.4, z: -6.2 };
export const wcDoor = new THREE.Group();
{
  const g = new THREE.Group();
  const wall = F(new THREE.BoxGeometry(1.8, 2.5, 1.8), flat(0x2f8f6a), 0.05, SEED + 20);
  wall.position.y = 1.25;
  wall.castShadow = wall.receiveShadow = true;
  g.add(wall);
  const roof = F(new THREE.BoxGeometry(2.1, 0.25, 2.1), flat(0xf1e4cf), 0.05, SEED + 21);
  roof.position.y = 2.62;
  g.add(roof);
  // "WC" sign: a canvas texture
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const x = c.getContext("2d");
  x.fillStyle = "#1f3f8f";
  x.fillRect(0, 0, 256, 128);
  x.fillStyle = "#ffffff";
  x.font = "bold 92px Montserrat, Arial, sans-serif";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.fillText("WC", 128, 70);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(0.9, 0.45),
    new THREE.MeshBasicMaterial({ map: tex }),
  );
  sign.position.set(0, 2.95, 0.6);
  g.add(sign);
  const signPost = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.4, 0.06), flat(0x3b3f47));
  signPost.position.set(0, 2.85, 0.55);
  g.add(signPost);
  // door on a hinge at its left edge, front +z
  wcDoor.position.set(-0.5, 0, 0.91);
  const door = F(new THREE.BoxGeometry(1.0, 2.0, 0.08), flat(0xf1e4cf), 0.04, SEED + 22);
  door.position.set(0.5, 1.05, 0);
  door.castShadow = true;
  wcDoor.add(door);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 5), flat(0xe8b23a));
  knob.position.set(0.88, 1.05, 0.06);
  wcDoor.add(knob);
  g.add(wcDoor);
  place(g, WC.x, WC.z, -0.35);
}

// balloons bobbing on strings, tied to the candy-floss stall
{
  const r = rng(SEED + 30);
  const cols = [0xff4f8b, 0xffd23f, 0x3fb5ff, 0x5fd17a, 0xff8a3d];
  const base = V(-6.6, 1.2, -2.2);
  const bs = [];
  for (let i = 0; i < 5; i++) {
    const b = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 10, 8),
      flat(cols[i], { roughness: 0.25 }),
    );
    b.scale.y = 1.2;
    b.castShadow = true;
    ground.add(b);
    const str = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1, 3), flat(0xffffff));
    ground.add(str);
    bs.push({ b, str, ph: r() * 6, dx: (r() - 0.5) * 1.2, h: 2.2 + r() * 0.8 });
  }
  onFrame((t) => {
    for (const { b, str, ph, dx, h } of bs) {
      const top = V(
        base.x + dx + Math.sin(t * 0.9 + ph) * 0.12,
        base.y + h + Math.sin(t * 1.3 + ph) * 0.06,
        base.z + Math.cos(t * 0.7 + ph) * 0.1,
      );
      b.position.copy(top);
      const mid = top.clone().add(base).multiplyScalar(0.5);
      str.position.copy(mid);
      str.scale.y = top.distanceTo(base);
      str.lookAt(top);
      str.rotateX(Math.PI / 2);
    }
  });
}

// ---------------------------------------------------------------- far layer
// the Prater's chestnut trees around everything, a band of city behind
[
  [-14, -9, 1.3],
  [-17, -2, 1.2],
  [-15, 6, 1.1],
  [16, -4, 1.25],
  [18, 4, 1.15],
  [-20, -16, 1.4],
  [4, -18, 1.3],
  [9, -21, 1.25],
  [-21, 12, 1.0],
  [21, 12, 1.1],
].forEach(([x, z, s], i) => tree(x, z, s, SEED + 40 + i));
{
  // low skyline silhouette (Leopoldstadt roofs), windows lit
  const r = rng(SEED + 50);
  const wall = flat(0x6a5a8a);
  const lit = flat(0xffe2a0, { emissive: 0xffc46b, emissiveIntensity: 1.2 });
  for (let i = 0; i < 26; i++) {
    const x = -48 + i * 3.8 + r() * 1.5;
    const h = 5 + r() * 9;
    const z = -48 - r() * 6;
    const b = F(new THREE.BoxGeometry(3.4, h, 3), wall, 0.06, i);
    b.position.set(x, h / 2, z);
    ground.add(b);
    for (let k = 0; k < 4; k++) {
      if (r() < 0.45) continue;
      const w = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.7), lit);
      w.position.set(x - 1 + (k % 2) * 2, 2 + r() * (h - 3), z + 1.52);
      ground.add(w);
    }
  }
}

// ---------------------------------------------------------------- life
// warm motes drifting in the air (fairground glow)
fireflies(30, { area: [-12, 12, 1, 4.5, -12, 6], color: 0xffd9a0, seed: SEED });

finishSet({ ground: 0x79a64c });
export { sky };
