// #62 Sneaker-Sohle — a basketball court on a city rooftop at sunset.
// Deep-teal court with an orange centre circle and white lines (the giant
// sneaker stands on the centre circle), a chain-link fence, the hoop at the
// back, a water tower on stilts as the hero piece, AC boxes with spinning
// fans, a steaming vent, fairy lights on the fence, and the skyline glowing
// in the low sun far below and behind.
import { THREE, flat, ground, onFrame, rng, facet, facetMat, M } from "./world.js";
import { SKIES, setSky, finishSet, birds, lightString, F, add, discGeo } from "./environments.js";
import { place, bench, cone } from "./props.js";

const SEED = 62;
const r = rng(SEED);

// ---------------------------------------------------------------- light
const sky = setSky({
  ...SKIES.sonnenuntergang,
  top: [0.27, 0.3, 0.66],
  mid: [0.95, 0.55, 0.55],
  hor: [1.0, 0.72, 0.42],
  below: [0.86, 0.6, 0.62],
  sunDir: [-0.55, 0.16, -0.82],
  keyPos: [-14, 13, -9],
  key: [0xffd2a0, 2.7],
  rim: [0xff8fb0, 0.9],
  clouds: 9,
  birds: false,
  fog: [40, 190],
});

// ---------------------------------------------------------------- roof
// the roof deck: bitumen-grey gravel with patches, larger than the court
const COURT_X = 11;
const COURT_Z0 = -17;
const COURT_Z1 = 10;
{
  const geo = facet(new THREE.PlaneGeometry(64, 54, 32, 27), 0.07, SEED);
  geo.rotateX(-Math.PI / 2);
  const deck = new THREE.Mesh(geo, facetMat(flat(0x55525c, { roughness: 0.95 })));
  deck.position.set(0, -0.02, -6);
  deck.receiveShadow = true;
  ground.add(deck);
  // parapet around the roof edge
  const wall = flat(0xb98a72, { roughness: 0.9 });
  const capM = flat(0xe0cbb8);
  const seg = (x, z, w, d) => {
    add(F(new THREE.BoxGeometry(w, 1.1, d), wall, 0.05, x * 3 + z), x, 0.55, z);
    add(new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 0.18, d + 0.2), capM), x, 1.18, z);
  };
  seg(0, -33, 64, 0.6);
  seg(-32, -6, 0.6, 54);
  seg(32, -6, 0.6, 54);
}

// ---------------------------------------------------------------- court
{
  const w = COURT_X * 2;
  const d = COURT_Z1 - COURT_Z0;
  const cz = (COURT_Z0 + COURT_Z1) / 2;
  const geo = facet(new THREE.PlaneGeometry(w, d, 22, 27), 0.045, SEED + 1);
  geo.rotateX(-Math.PI / 2);
  const court = new THREE.Mesh(geo, facetMat(flat(0x1d6a76, { roughness: 0.88 })));
  court.position.set(0, 0.0, cz);
  court.receiveShadow = true;
  ground.add(court);
  // orange key under the hoop + the centre circle the shoe stands on
  const orange = facetMat(flat(0xe8742c, { roughness: 0.85 }));
  const key = new THREE.Mesh(
    facet(new THREE.PlaneGeometry(7, 9, 7, 9).rotateX(-Math.PI / 2), 0.04, SEED + 2),
    orange,
  );
  key.position.set(0, 0.012, COURT_Z0 + 4.5);
  key.receiveShadow = true;
  ground.add(key);
  const circle = new THREE.Mesh(facet(discGeo(4.2, 0.7, 4), 0.03, 4), orange);
  circle.position.set(0, 0.012, 0);
  circle.receiveShadow = true;
  ground.add(circle);
  // white lines
  const lineM = flat(0xf6f3ee, { roughness: 0.6 });
  const line = (x, z, lw, ld) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(lw, 0.03, ld), lineM);
    m.position.set(x, 0.02, z);
    m.receiveShadow = true;
    ground.add(m);
  };
  line(-COURT_X + 0.1, cz, 0.18, d);
  line(COURT_X - 0.1, cz, 0.18, d);
  line(0, COURT_Z0 + 0.1, w, 0.18);
  line(0, COURT_Z1 - 0.1, w, 0.18);
  line(-3.5, COURT_Z0 + 4.5, 0.15, 9);
  line(3.5, COURT_Z0 + 4.5, 0.15, 9);
  line(0, COURT_Z0 + 9, 7, 0.15);
  for (const rad of [4.2]) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(rad - 0.09, rad + 0.09, 64).rotateX(-Math.PI / 2),
      lineM,
    );
    ring.position.y = 0.022;
    ground.add(ring);
  }
  // three-point arc
  const arc = new THREE.Mesh(
    new THREE.RingGeometry(8.6, 8.78, 64, 1, 0, Math.PI).rotateX(-Math.PI / 2),
    lineM,
  );
  arc.rotation.y = Math.PI;
  arc.position.set(0, 0.022, COURT_Z0 + 1.6);
  ground.add(arc);
}

// ---------------------------------------------------------------- fence
// chain-link: posts + rails + a diamond-mesh texture on see-through panels
{
  const cv = document.createElement("canvas");
  cv.width = cv.height = 64;
  const g = cv.getContext("2d");
  g.strokeStyle = "rgba(220,226,232,0.95)";
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(0, 32);
  g.lineTo(32, 0);
  g.lineTo(64, 32);
  g.lineTo(32, 64);
  g.closePath();
  g.stroke();
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  const H = 5.2;
  const postM = flat(0x8d949c, { metalness: 0.5, roughness: 0.4 });
  const panel = (x0, z0, x1, z1) => {
    const len = Math.hypot(x1 - x0, z1 - z0);
    const t = tex.clone();
    t.needsUpdate = true;
    t.repeat.set(len / 0.7, H / 0.7);
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(len, H),
      new THREE.MeshStandardMaterial({
        map: t,
        transparent: true,
        alphaTest: 0.3,
        side: THREE.DoubleSide,
        roughness: 0.5,
        metalness: 0.4,
      }),
    );
    m.position.set((x0 + x1) / 2, H / 2, (z0 + z1) / 2);
    m.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
    m.userData.noAO = true;
    ground.add(m);
    const n = Math.max(1, Math.round(len / 3.5));
    for (let i = 0; i <= n; i++) {
      const k = i / n;
      add(
        new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, H + 0.2, 6), postM),
        x0 + (x1 - x0) * k,
        (H + 0.2) / 2,
        z0 + (z1 - z0) * k,
      );
    }
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, len, 6), postM);
    rail.rotation.z = Math.PI / 2;
    rail.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
    rail.position.set((x0 + x1) / 2, H + 0.05, (z0 + z1) / 2);
    ground.add(rail);
  };
  const FX = COURT_X + 1.6;
  const FZ = COURT_Z0 - 1.6;
  panel(-FX, FZ, FX, FZ);
  panel(-FX, FZ, -FX, 6);
  panel(FX, FZ, FX, 6);
  // fairy lights along the fence top
  const warm = [0xffd27a, 0xffe7b0, 0xffb85c];
  lightString([-FX, H, FZ], [0, H - 0.2, FZ], { n: 16, sag: 0.6, colors: warm });
  lightString([0, H - 0.2, FZ], [FX, H, FZ], { n: 16, sag: 0.6, colors: warm });
  lightString([-FX, H, FZ], [-FX, H, 4], { n: 18, sag: 0.7, colors: warm });
  lightString([FX, H, FZ], [FX, H, 4], { n: 18, sag: 0.7, colors: warm });
}

// ---------------------------------------------------------------- the hoop
// (back of the court; the player dunks here in scene.js)
export const HOOP = [0, 10.0, COURT_Z0 + 1.6];
{
  const g = new THREE.Group();
  const pole = flat(0x2b2f36, { metalness: 0.4, roughness: 0.45 });
  const base = F(new THREE.BoxGeometry(1.6, 0.6, 1.6), flat(0x3a3f47), 0.05, 7);
  base.position.set(0, 0.3, -1.4);
  g.add(base);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 11, 8), pole);
  post.position.set(0, 5.5, -1.4);
  g.add(post);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 1.6), pole);
  arm.position.set(0, 10.9, -0.75);
  g.add(arm);
  // backboard: white glass with an orange frame + square
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 2.8, 0.14),
    flat(0xf4f6f8, { roughness: 0.2 }),
  );
  board.position.set(0, 11.0, 0);
  g.add(board);
  const fr = flat(0xe8742c);
  for (const [w, h, x, y] of [
    [4.3, 0.14, 0, 12.4],
    [4.3, 0.14, 0, 9.6],
    [0.14, 2.9, -2.1, 11],
    [0.14, 2.9, 2.1, 11],
    [1.4, 0.1, 0, 11.4],
    [1.4, 0.1, 0, 10.35],
    [0.1, 1.1, -0.7, 10.88],
    [0.1, 1.1, 0.7, 10.88],
  ]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.18), fr);
    b.position.set(x, y, 0.02);
    g.add(b);
  }
  // rim + net
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.05, 6, 20), fr);
  rim.rotation.x = Math.PI / 2;
  rim.position.set(0, 10.0, 0.75);
  g.add(rim);
  const net = new THREE.Mesh(
    new THREE.CylinderGeometry(0.62, 0.4, 0.9, 12, 3, true),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    }),
  );
  net.position.set(0, 9.55, 0.75);
  net.userData.noAO = true;
  g.add(net);
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = o.receiveShadow = true;
  });
  g.position.set(HOOP[0], 0, HOOP[2] - 0.75);
  ground.add(g);
}

// ---------------------------------------------------------------- near ring props
// ball rack, benches with a gym bag, cones, a boombox, a shoe box, loose balls
export const ballMat = facetMat(flat(0xe2672a, { roughness: 0.7 }));
export function ball(s = 0.62, seed = 1) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(facet(new THREE.IcosahedronGeometry(s, 2), 0.05, seed), ballMat);
  b.castShadow = true;
  g.add(b);
  const seamM = flat(0x2a1a14);
  for (const [rx, ry] of [
    [0, 0],
    [Math.PI / 2, 0],
    [0, Math.PI / 2],
  ]) {
    const sm = new THREE.Mesh(new THREE.TorusGeometry(s * 1.005, s * 0.035, 4, 24), seamM);
    sm.rotation.set(rx, ry, 0);
    g.add(sm);
  }
  return g;
}
{
  // ball rack
  const g = new THREE.Group();
  const frame = flat(0x9aa2ab, { metalness: 0.6, roughness: 0.35 });
  for (const x of [-1.4, 1.4])
    for (const z of [-0.5, 0.5]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.6, 6), frame);
      leg.position.set(x, 0.8, z);
      g.add(leg);
    }
  for (const y of [0.6, 1.5])
    for (const z of [-0.5, 0.5]) {
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.9, 6), frame);
      bar.rotation.z = Math.PI / 2;
      bar.position.set(0, y, z);
      g.add(bar);
    }
  for (let i = 0; i < 4; i++) {
    const b = ball(0.42, i + 1);
    b.position.set(-1.05 + i * 0.7, 1.95, 0);
    b.rotation.set(i, i * 2, 0);
    g.add(b);
    const b2 = ball(0.42, i + 7);
    b2.position.set(-1.05 + i * 0.7, 1.05, 0);
    b2.rotation.set(i * 3, i, 0);
    g.add(b2);
  }
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = o.receiveShadow = true;
  });
  place(g, -9.2, -3.2, 0.5);
}
place(bench(0x2f6fd6), 9.4, -7.5, -Math.PI / 2);
place(bench(0x2f6fd6), -9.4, -10, Math.PI / 2);
{
  // gym bag on the bench
  const bag = F(new THREE.CapsuleGeometry(0.45, 1.3, 3, 8), flat(0x1d1f26), 0.06, 3);
  bag.rotation.z = Math.PI / 2;
  bag.rotation.y = Math.PI / 2;
  add(bag, 9.4, 1.55, -8.2);
  const strap = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 5, 12, Math.PI), flat(0xe8742c));
  strap.rotation.y = Math.PI / 2;
  add(strap, 9.4, 1.9, -8.2);
}
place(cone(), 10.5, 6.5);
place(cone(), -7.6, 6.2, 0.4);
place(cone(), -6.8, 8.6, 1);
{
  // boombox with pulsing speakers
  const g = new THREE.Group();
  const body = F(new THREE.BoxGeometry(1.8, 1.0, 0.6), flat(0xd8d2c8), 0.04, 9);
  body.position.y = 0.5;
  g.add(body);
  const spk = [];
  for (const x of [-0.5, 0.5]) {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.08, 14), flat(0x23252b));
    s.rotation.x = Math.PI / 2;
    s.position.set(x, 0.5, 0.31);
    g.add(s);
    spk.push(s);
  }
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.05, 5, 12, Math.PI), flat(0x2b2f36));
  handle.position.y = 1.0;
  g.add(handle);
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = o.receiveShadow = true;
  });
  place(g, 10.2, 1.8, -1.1);
  onFrame((t) => spk.forEach((s) => s.scale.setScalar(1 + 0.08 * Math.abs(Math.sin(t * 6.4)))));
}
{
  // the orange shoe box with its lid leaning against it
  const g = new THREE.Group();
  const box = F(new THREE.BoxGeometry(2.2, 0.9, 1.3), flat(0xf0802f), 0.05, 11);
  box.position.y = 0.45;
  g.add(box);
  const lid = F(new THREE.BoxGeometry(2.3, 0.18, 1.4), flat(0xf0802f), 0.05, 12);
  lid.position.set(0, 0.55, 0.95);
  lid.rotation.x = 1.15;
  g.add(lid);
  const paper = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.05, 1.1), flat(0xfaf6ee));
  paper.position.y = 0.92;
  g.add(paper);
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = o.receiveShadow = true;
  });
  place(g, -8.6, 3.4, 0.35);
}
for (const [x, z, s] of [
  [-7.2, -7.8, 1],
  [7.6, -9.6, 2],
  [-10.5, 7.5, 3],
]) {
  const b = ball(0.62, s + 20);
  b.position.set(x, 0.62, z);
  b.rotation.set(s, s * 2, 0);
  ground.add(b);
}

// ---------------------------------------------------------------- roof machinery
// AC boxes with spinning fans, a steaming vent stack, a roof door hut
const fans = [];
for (const [x, z, ry] of [
  [-17, -6, 0.2],
  [-17.5, 1.5, -0.1],
  [17.5, -12, 0.1],
]) {
  const g = new THREE.Group();
  const body = F(
    new THREE.BoxGeometry(3.0, 2.0, 2.6),
    flat(0xc9ccd2, { roughness: 0.55 }),
    0.05,
    x,
  );
  body.position.y = 1.0;
  g.add(body);
  const grill = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.1, 18), flat(0x55595f));
  grill.position.y = 2.05;
  g.add(grill);
  const fan = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.04, 0.22), flat(0x2b2f36));
    blade.position.x = 0.42;
    const b = new THREE.Group();
    b.add(blade);
    b.rotation.y = (i * Math.PI) / 2;
    fan.add(b);
  }
  fan.position.y = 2.12;
  g.add(fan);
  fans.push(fan);
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = o.receiveShadow = true;
  });
  g.rotation.y = ry;
  g.position.set(x, 0, z);
  ground.add(g);
}
onFrame((t) => fans.forEach((f, i) => (f.rotation.y = t * (7 + i))));
// vent stack + steam puffs
const steam = [];
{
  const x = 18,
    z = 3;
  add(F(new THREE.CylinderGeometry(0.5, 0.6, 3.4, 10), M.steel, 0.04, 5), x, 1.7, z);
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.25, 10), M.steel), x, 3.5, z);
  const stM = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.55,
    roughness: 1,
    depthWrite: false,
  });
  for (let i = 0; i < 9; i++) {
    const p = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6, 0), stM.clone());
    p.userData.noAO = true;
    ground.add(p);
    steam.push(p);
  }
  onFrame((t) =>
    steam.forEach((p, i) => {
      const k = (t * 0.22 + i / steam.length) % 1;
      p.position.set(x + k * 2.2, 3.8 + k * 6, z - k * 1.2);
      p.scale.setScalar(0.5 + k * 2.2);
      p.material.opacity = 0.5 * (1 - k);
    }),
  );
}
{
  // stair hut with a door
  const hut = F(new THREE.BoxGeometry(5, 4, 4), flat(0xc69a7e), 0.05, 31);
  add(hut, -19, 2, -20);
  add(new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.3, 4.4), flat(0x6b5a50)), -19, 4.15, -20);
  add(new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.6, 0.1), flat(0x2f6fd6)), -18, 1.3, -17.95);
  // a planter row along the parapet
  for (let i = 0; i < 6; i++) {
    const x = -26 + i * 2.2;
    add(F(new THREE.BoxGeometry(1.8, 0.9, 1.1), flat(0x8a5a3c), 0.05, 40 + i), x, 0.45, -30.5);
    const bush = F(new THREE.IcosahedronGeometry(0.8, 1), flat(0x4f9a3a), 0.12, 50 + i);
    bush.scale.set(1.1, 0.9, 0.8);
    add(bush, x, 1.35, -30.5);
  }
}

// ---------------------------------------------------------------- hero piece: water tower
const flag = new THREE.Group();
{
  const g = new THREE.Group();
  const wood = flat(0x8a5634, { roughness: 0.85 });
  const legM = flat(0x3a3a40, { metalness: 0.4, roughness: 0.5 });
  for (const [x, z] of [
    [-2, -2],
    [2, -2],
    [-2, 2],
    [2, 2],
  ]) {
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 8, 6), legM);
    l.position.set(x, 4, z);
    g.add(l);
  }
  for (const y of [2.5, 5.5]) {
    const brace = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.14, 0.14), legM);
    brace.position.set(0, y, 2);
    g.add(brace);
    const b2 = brace.clone();
    b2.position.z = -2;
    g.add(b2);
  }
  const tank = F(new THREE.CylinderGeometry(3.0, 3.0, 4.8, 14, 3), wood, 0.07, 61);
  tank.position.y = 10.4;
  g.add(tank);
  for (const y of [8.6, 10.4, 12.2]) {
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(3.05, 0.07, 5, 28), legM);
    hoop.rotation.x = Math.PI / 2;
    hoop.position.y = y;
    g.add(hoop);
  }
  const roof = F(new THREE.ConeGeometry(3.4, 2.2, 14), flat(0x4a3a34), 0.07, 62);
  roof.position.y = 13.9;
  g.add(roof);
  // flag pole on top
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 5), legM);
  pole.position.y = 16.2;
  g.add(pole);
  flag.position.set(0, 16.9, 0);
  g.add(flag);
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = o.receiveShadow = true;
  });
  g.position.set(15, 0, -24);
  ground.add(g);
  // flag: a few strips that wave
  const fm = flat(0xe8742c, { side: THREE.DoubleSide });
  for (let i = 0; i < 6; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.9, 0.03), fm);
    s.position.x = 0.15 + i * 0.3;
    flag.add(s);
  }
  onFrame((t) =>
    flag.children.forEach((s, i) => {
      s.position.z = Math.sin(t * 5 - i * 0.9) * 0.08 * i;
      s.rotation.y = Math.cos(t * 5 - i * 0.9) * 0.25;
    }),
  );
}

// ---------------------------------------------------------------- far layer: the city
{
  const cols = [0x6d5a7e, 0x8a6a86, 0x5b5470, 0x9a7690, 0x7b6488, 0xb08890, 0x4f4a66];
  const winOn = flat(0xffd89a, { emissive: 0xffb860, emissiveIntensity: 1.1 });
  const winOff = flat(0x3b3550, { roughness: 0.3 });
  const placeTower = (x, z, w, d, h, i) => {
    const y0 = -40;
    const b = F(new THREE.BoxGeometry(w, h + 40, d), flat(cols[i % cols.length]), 0.05, i);
    b.position.set(x, y0 + (h + 40) / 2, z);
    ground.add(b);
    // windows on the face towards the court
    const rows = Math.floor((h + 20) / 2.2);
    const colsN = Math.max(2, Math.floor(w / 1.6));
    for (let rr = 0; rr < rows; rr++)
      for (let c = 0; c < colsN; c++) {
        const lit = r() < 0.32;
        const m = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.0, 0.05), lit ? winOn : winOff);
        m.position.set(x - w / 2 + (c + 0.5) * (w / colsN), h - 1.6 - rr * 2.2, z + d / 2 + 0.03);
        ground.add(m);
      }
    if (i % 5 === 0) {
      const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 7, 5), M.steel);
      ant.position.set(x, h + 3.5, z);
      ground.add(ant);
      const blink = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 6, 5),
        new THREE.MeshBasicMaterial({ color: 0xff3b3b }),
      );
      blink.position.set(x, h + 7.1, z);
      ground.add(blink);
      onFrame((t) => (blink.visible = Math.floor(t * 1.4 + i) % 2 === 0));
    }
  };
  let i = 0;
  for (let k = 0; k < 26; k++, i++) {
    const x = -70 + k * 5.6 + r() * 3;
    const z = -48 - r() * 22;
    placeTower(x, z, 4 + r() * 5, 4 + r() * 4, -6 + r() * 26, i);
  }
  for (let k = 0; k < 18; k++, i++) {
    const x = -90 + k * 10 + r() * 4;
    const z = -85 - r() * 25;
    placeTower(x, z, 6 + r() * 7, 6 + r() * 5, 6 + r() * 40, i);
  }
  // side blocks, lower, so the left and right horizons are never empty
  for (let k = 0; k < 10; k++, i++) {
    const z = -40 + k * 7;
    placeTower(-44 - r() * 10, z, 6, 6, -12 + r() * 14, i);
    placeTower(44 + r() * 10, z, 6, 6, -12 + r() * 14, i + 100);
  }
  // hazy far hills
  const hills = new THREE.Mesh(
    new THREE.CylinderGeometry(170, 170, 22, 48, 1, true, -1.4, 2.8),
    new THREE.MeshBasicMaterial({ color: 0xa47c98, side: THREE.BackSide, fog: false }),
  );
  hills.position.set(0, -30, 0);
  ground.add(hills);
}

// ---------------------------------------------------------------- life
birds(5); // pigeons circling over the roofs

finishSet({ ground: 0x1d6a76 });
export { sky };
