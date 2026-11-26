// #96 Eiswürfel angeln — Après-Ski on a mountain-hut terrace at alpenglow.
// Giant-scale world: 1 unit ≈ 5 cm. The wooden hut table is the "ground"
// (top at y = 0); the terrace floor lies 75 cm below (y = -15), beyond the
// snowy railing the slope drops away to pink-lit peaks, a chairlift creeps
// along its cable, the hut glows warm on the left, snow drifts in the low sun.
import { THREE, flat, real, roundedBox, ground, onFrame, rng, V } from "./world.js";
import {
  SKIES,
  setSky,
  finishSet,
  terrain,
  pine,
  lightString,
  fireflies,
  F,
  snowMat,
} from "./environments.js";

const SEED = 96;
const r = rng(SEED);

// ---------------------------------------------------------------- light
const sky = setSky({
  ...SKIES.sonnenuntergang,
  top: [0.2, 0.3, 0.62],
  mid: [0.72, 0.6, 0.86],
  hor: [1.0, 0.72, 0.6],
  below: [0.86, 0.74, 0.82],
  sun: [1.0, 0.82, 0.55],
  sunDir: [-0.75, 0.1, -1],
  keyPos: [-8, 9, 3],
  key: [0xffd2a6, 2.7],
  rim: [0xffa8c8, 0.9],
  hemi: [0xeaf0ff, 0x8f7a88, 1.3],
  fog: [70, 280],
  noClouds: true,
  birds: false,
});

// ---------------------------------------------------------------- the table (near, realistic)
const woodA = real.wood(0x8a5a36, { roughness: 0.62 });
const woodB = real.wood(0x7a4c2c, { roughness: 0.66 });
{
  // planks along x with dark gaps, rounded edges catch the low sun
  for (let i = 0; i < 9; i++) {
    const z = -8 + i * 2.05;
    const p = new THREE.Mesh(roundedBox(19, 0.9, 1.95, 0.12, 3), i % 2 ? woodA : woodB);
    p.position.set(0, -0.45, z);
    p.receiveShadow = p.castShadow = true;
    ground.add(p);
  }
  // knots + rings painted as darker ovals on a few planks
  const knot = real.wood(0x4a2c18, { roughness: 0.7 });
  for (let i = 0; i < 9; i++) {
    const k = new THREE.Mesh(new THREE.CircleGeometry(0.22 + r() * 0.15, 20), knot);
    k.rotation.x = -Math.PI / 2;
    k.scale.set(2.2, 1, 1);
    k.position.set(-8 + r() * 16, 0.005, -7.5 + r() * 15);
    if (Math.hypot(k.position.x, k.position.z) > 2.2) ground.add(k);
  }
  // legs + cross beam down to the terrace
  for (const [x, z] of [
    [-8, -7],
    [8, -7],
    [-8, 9],
    [8, 9],
  ]) {
    const leg = new THREE.Mesh(roundedBox(1.3, 15, 1.3, 0.15, 2), woodB);
    leg.position.set(x, -7.5, z);
    leg.castShadow = true;
    ground.add(leg);
  }
}

// ---------------------------------------------------------------- terrace floor + snow
{
  const deck = flat(0x6b4a33);
  for (let i = 0; i < 26; i++) {
    const p = F(new THREE.BoxGeometry(70, 0.6, 2.6), i % 2 ? deck : flat(0x5f4230), 0.05, i);
    p.position.set(0, -15.3, -24 + i * 2.75);
    p.receiveShadow = true;
    ground.add(p);
  }
}
// slope below the railing: snowfield falling away into the valley
terrain(0xf2f5fb, {
  r: 280,
  step: 9,
  seed: SEED,
  amt: 0.08,
  warm: 0.15,
  height: (x, z) => {
    if (z > -22 && Math.abs(x) < 36) return -16;
    const fall = Math.max(0, -z - 22) * 0.55;
    return -16 - fall + Math.sin(x * 0.05 + 1) * 4 + Math.cos(z * 0.04) * 3;
  },
});

// ---------------------------------------------------------------- railing with snow + skis
{
  const rail = flat(0x5a3b26);
  const g = new THREE.Group();
  for (let x = -34; x <= 34; x += 5) {
    const post = F(new THREE.BoxGeometry(1.0, 20, 1.0), rail, 0.05, x);
    post.position.set(x, -5, -21);
    g.add(post);
  }
  for (const y of [4.6, -3]) {
    const beam = F(new THREE.BoxGeometry(70, 1.2, 1.1), rail, 0.05, y);
    beam.position.set(0, y, -21);
    g.add(beam);
  }
  // snow cushion on the top rail
  const cushion = F(new THREE.CylinderGeometry(0.75, 0.9, 70, 8, 1), snowMat, 0.06, 4);
  cushion.rotation.z = Math.PI / 2;
  cushion.scale.set(1, 0.7, 1);
  cushion.position.set(0, 5.5, -21);
  g.add(cushion);
  g.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  ground.add(g);
  // skis + poles leaning on the railing
  const skiCols = [0xe8412f, 0x1f6fd6, 0xf2c230, 0x2a2a2e];
  [
    [-22, 0.12],
    [-19, -0.1],
    [15, 0.15],
    [18.5, -0.08],
  ].forEach(([x, lean], i) => {
    const s = new THREE.Group();
    for (const dx of [0, 1.3]) {
      const ski = new THREE.Mesh(roundedBox(1.0, 34, 0.3, 0.12, 2), real.gloss(skiCols[i]));
      ski.position.set(dx, 17, 0);
      s.add(ski);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 8), real.gloss(skiCols[i]));
      tip.scale.set(1, 1, 0.6);
      tip.position.set(dx, 34, 0.2);
      s.add(tip);
    }
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 26, 8),
      real.metal(0x9aa3ad),
    );
    pole.position.set(2.8, 13, 0.4);
    s.add(pole);
    s.position.set(x, -15, -19.6);
    s.rotation.x = -0.18;
    s.rotation.z = lean;
    s.traverse((o) => o.isMesh && (o.castShadow = true));
    ground.add(s);
  });
}

// ---------------------------------------------------------------- other tables + benches (mid layer)
{
  const wood = flat(0x7d5233);
  const sheep = flat(0xf3ece0);
  [
    [-30, 4],
    [30, 2],
    [-28, 30],
    [32, 28],
  ].forEach(([x, z], i) => {
    const t = F(new THREE.BoxGeometry(18, 1, 14), wood, 0.05, i);
    t.position.set(x, -0.5, z);
    ground.add(t);
    for (const dz of [-10, 10]) {
      const b = F(new THREE.BoxGeometry(18, 0.9, 4), wood, 0.05, i + dz);
      b.position.set(x, -6, z + dz);
      ground.add(b);
      const fur = F(new THREE.BoxGeometry(5, 0.9, 3.6), sheep, 0.12, i * 3 + dz);
      fur.position.set(x - 4 + i, -5.2, z + dz);
      ground.add(fur);
    }
    // a beer mug + a red cap on each table
    const mug = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.4, 3.6, 16),
      flat(0xf0b43c, { roughness: 0.3 }),
    );
    mug.position.set(x + 2, 1.8, z - 2);
    ground.add(mug);
    const foam = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.45, 0.6, 16), flat(0xfffaf0));
    foam.position.set(x + 2, 3.8, z - 2);
    ground.add(foam);
  });
}

// ---------------------------------------------------------------- hero piece: the hut
{
  const g = new THREE.Group();
  const logs = flat(0x6a4127);
  const body = F(new THREE.BoxGeometry(90, 55, 50), logs, 0.04, 3);
  body.position.y = 27.5;
  g.add(body);
  // log lines
  for (let y = 4; y < 55; y += 4.5) {
    const l = F(new THREE.CylinderGeometry(1.2, 1.2, 92, 6), flat(0x5c381f), 0.05, y);
    l.rotation.z = Math.PI / 2;
    l.position.set(0, y, 25.4);
    g.add(l);
  }
  // roof with a thick snow layer
  const roofMat = flat(0x4a3324);
  for (const s of [-1, 1]) {
    const roof = F(new THREE.BoxGeometry(100, 2.5, 38), roofMat, 0.04, s + 5);
    roof.rotation.x = s * 0.55;
    roof.position.set(0, 64, s * 13.5);
    g.add(roof);
    const snow = F(new THREE.BoxGeometry(101, 3.5, 38), snowMat, 0.08, s + 9);
    snow.rotation.x = s * 0.55;
    snow.position.set(0, 66.6, s * 13.8);
    g.add(snow);
  }
  // warm windows with crossbars + flower boxes
  const glow = flat(0xffc874, { emissive: 0xffa040, emissiveIntensity: 1.5 });
  glow.userData = {};
  for (const [x, y] of [
    [-30, 18],
    [-8, 18],
    [14, 18],
    [-30, 40],
    [-8, 40],
    [14, 40],
    [32, 40],
  ]) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(11, 13), glow);
    w.position.set(x, y, 25.6);
    w.userData.noAO = true;
    g.add(w);
    for (const [bw, bh] of [
      [11.8, 1],
      [1, 13.8],
    ]) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.6), flat(0x3b2416));
      bar.position.set(x, y, 25.9);
      g.add(bar);
    }
    const box = F(new THREE.BoxGeometry(12, 2.2, 2.5), flat(0x3b2416), 0.05, x + y);
    box.position.set(x, y - 7.8, 26.8);
    g.add(box);
  }
  // door
  const door = new THREE.Mesh(new THREE.PlaneGeometry(12, 22), flat(0x3a2112));
  door.position.set(34, 11, 25.7);
  g.add(door);
  // chimney
  const ch = F(new THREE.BoxGeometry(7, 22, 7), flat(0x8a8580), 0.08, 11);
  ch.position.set(22, 72, -6);
  g.add(ch);
  g.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  g.position.set(-82, -15, -40);
  g.rotation.y = 0.75;
  ground.add(g);
  // chimney smoke
  const smokeMat = new THREE.MeshStandardMaterial({
    color: 0xe8e2ee,
    transparent: true,
    opacity: 0.5,
    roughness: 1,
  });
  const puffs = Array.from({ length: 9 }, () => {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(4, 1), smokeMat);
    m.userData.noAO = true;
    ground.add(m);
    return m;
  });
  const chimney = V(22, 72 + 11, -6)
    .applyAxisAngle(V(0, 1, 0), 0.75)
    .add(V(-82, -15, -40));
  onFrame((t) =>
    puffs.forEach((m, i) => {
      const k = (t * 0.07 + i / puffs.length) % 1;
      m.position.set(
        chimney.x + k * 26 + Math.sin(k * 6 + i) * 2,
        chimney.y + k * 40,
        chimney.z - k * 8,
      );
      m.scale.setScalar(0.5 + k * 2.2);
    }),
  );
  // fairy lights from the hut along the terrace
  lightString([-50, 22, -20], [-20, 20, -20.5], { n: 14, sag: 3, glow: 2 });
  lightString([-20, 20, -20.5], [20, 21, -20.5], { n: 18, sag: 3.5, glow: 2 });
}

// ---------------------------------------------------------------- far: peaks in alpenglow + forests
{
  const rock = flat(0x8f7f8c);
  const peaks = [
    [-150, -240, 70, 120],
    [-60, -270, 85, 150],
    [40, -255, 70, 125],
    [140, -230, 80, 135],
    [230, -200, 70, 110],
    [-240, -190, 70, 100],
  ];
  peaks.forEach(([x, z, rr, h], i) => {
    const m = F(new THREE.ConeGeometry(rr, h, 7, 3), rock, 0.12, i + 20);
    m.position.set(x, -60 + h / 2, z);
    m.rotation.y = i * 1.3;
    ground.add(m);
    const cap = F(new THREE.ConeGeometry(rr * 0.52, h * 0.52, 7, 2), flat(0xfff0f2), 0.08, i + 40);
    cap.position.set(x, -60 + h - h * 0.26 + 0.5, z);
    cap.rotation.y = i * 1.3;
    ground.add(cap);
  });
  // snowy pines down the slope
  for (let i = 0; i < 46; i++) {
    const x = -160 + r() * 320;
    const z = -40 - r() * 120;
    const y =
      -16 - Math.max(0, -z - 22) * 0.55 + Math.sin(x * 0.05 + 1) * 4 + Math.cos(z * 0.04) * 3;
    const p = pine(x, z, 5 + r() * 4, SEED + i, true);
    p.position.y = y;
  }
}

// ---------------------------------------------------------------- life: chairlift on its cable
{
  const A = V(-200, 10, -110);
  const B = V(160, 90, -200);
  const cable = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.25, A.distanceTo(B), 4),
    flat(0x2a2a2e),
  );
  cable.position.copy(A.clone().add(B).multiplyScalar(0.5));
  cable.quaternion.setFromUnitVectors(V(0, 1, 0), B.clone().sub(A).normalize());
  ground.add(cable);
  for (let k = 0.15; k < 1; k += 0.28) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.8, 40, 6), flat(0x5a5f66));
    const p = A.clone().lerp(B, k);
    m.position.set(p.x, p.y - 20, p.z);
    ground.add(m);
  }
  const chairMat = flat(0xd23b2e);
  const chairs = Array.from({ length: 9 }, () => {
    const c = new THREE.Group();
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 7, 4), flat(0x2a2a2e));
    bar.position.y = -3.5;
    c.add(bar);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(6, 1.2, 3.5), chairMat);
    seat.position.y = -7;
    c.add(seat);
    ground.add(c);
    return c;
  });
  onFrame((t) =>
    chairs.forEach((c, i) => {
      const k = (t * 0.012 + i / chairs.length) % 1;
      c.position.copy(A.clone().lerp(B, k));
      c.rotation.z = Math.sin(t * 1.3 + i) * 0.04;
    }),
  );
}

// ---------------------------------------------------------------- life: drifting snowflakes in the low sun
fireflies(70, { area: [-14, 14, -2, 12, -16, 8], color: 0xffffff, seed: SEED, size: 0.06 });
fireflies(50, { area: [-60, 60, 0, 40, -90, -24], color: 0xfff4f8, seed: SEED + 1, size: 0.35 });

finishSet({ ground: 0xf2f5fb });
export { sky };
