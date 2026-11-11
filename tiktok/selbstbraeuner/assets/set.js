// #76 Selbstbräuner — "Hotel-Poolterrasse in der Dämmerung": a travertine
// deck with an infinity pool that runs into the sea, lit turquoise from
// below; festoon lights on posts, palms, a parasol, two loungers (the
// subject lies on the front one, scene.js), a breakfast trolley with a
// toaster and the self-tanner bottle. Far layer: the dark sea and hills
// with villa lights. Life: palms sway, pool shimmer, moths at the lights,
// a boat light crossing the bay. Light: blue hour after sunset, can fade
// to full night (setNight, driven by scene.js) — "ohne Sonnenstrahl".
import { THREE, flat, ground, onFrame, scene, rng, real, roundedBox } from "./world.js";
import { SKIES, setSky, finishSet, lightString, fireflies, F } from "./environments.js";
import { place, palm, parasol, sway, bush } from "./props.js";

const SEED = 76;
const rand = rng(SEED);

// ---------------------------------------------------------------- light
const DUSK = {
  ...SKIES.abend,
  top: [0.13, 0.15, 0.4],
  mid: [0.46, 0.32, 0.62],
  hor: [1.0, 0.56, 0.5],
  below: [0.2, 0.2, 0.36],
  sun: [1.0, 0.55, 0.4],
  sunDir: [0.5, 0.02, -1],
  keyPos: [-6, 9, 9],
  key: [0xffc896, 2.7],
  rim: [0x9a7dff, 0.7],
  hemi: [0xffe0c8, 0x5a4a5a, 1.0],
  fog: [40, 190],
  clouds: 7,
  birds: false,
  stars: 0.25,
};
const NIGHT = {
  top: [0.02, 0.03, 0.12],
  mid: [0.05, 0.08, 0.24],
  hor: [0.16, 0.18, 0.38],
  below: [0.06, 0.08, 0.18],
  sun: [0.06, 0.06, 0.12],
};
setSky(DUSK);

// ---------------------------------------------------------------- deck
// travertine tiles (canvas texture) with a hole for the pool
function tileTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d");
  const r = rng(7);
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      const v = 214 + Math.floor(r() * 22);
      g.fillStyle = `rgb(${v},${v - 14},${v - 34})`;
      g.fillRect(i * 128, j * 128, 128, 128);
      for (let k = 0; k < 40; k++) {
        const w = v - 10 - Math.floor(r() * 18);
        g.fillStyle = `rgba(${w},${w - 16},${w - 36},0.5)`;
        g.fillRect(i * 128 + r() * 120, j * 128 + r() * 124, 4 + r() * 30, 1 + r() * 3);
      }
    }
  g.strokeStyle = "rgb(150,138,118)";
  g.lineWidth = 4;
  for (let k = 0; k <= 4; k++) {
    g.beginPath();
    g.moveTo(k * 128, 0);
    g.lineTo(k * 128, 512);
    g.moveTo(0, k * 128);
    g.lineTo(512, k * 128);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1 / 8, 1 / 8); // one 4×4 sheet = 8 units → tile = 2 units
  t.anisotropy = 8;
  return t;
}
export const POOL = { x0: -11, x1: 7, z0: -12.5, z1: -4.2 };
{
  const outer = new THREE.Shape();
  outer.moveTo(-40, -12.5);
  outer.lineTo(40, -12.5);
  outer.lineTo(40, 40);
  outer.lineTo(-40, 40);
  outer.lineTo(-40, -12.5);
  const hole = new THREE.Path();
  hole.moveTo(POOL.x0, -POOL.z1);
  hole.lineTo(POOL.x1, -POOL.z1);
  hole.lineTo(POOL.x1, -POOL.z0 + 0.01);
  hole.lineTo(POOL.x0, -POOL.z0 + 0.01);
  outer.holes.push(hole);
  // shape lives in x/y; rotate so y → -z
  const geo = new THREE.ShapeGeometry(outer);
  geo.rotateX(-Math.PI / 2);
  const deck = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({ map: tileTexture(), roughness: 0.62 }),
  );
  deck.receiveShadow = true;
  ground.add(deck);
  // coping stones round the pool (rounded, slightly raised)
  const cope = real.ceramic(0xf1ead8, { roughness: 0.5, clearcoat: 0.1 });
  const W = POOL.x1 - POOL.x0;
  const addCope = (w, d, x, z) => {
    const m = new THREE.Mesh(roundedBox(w, 0.16, d, 0.05), cope);
    m.position.set(x, 0.04, z);
    m.receiveShadow = true;
    ground.add(m);
  };
  addCope(W + 0.8, 0.5, (POOL.x0 + POOL.x1) / 2, POOL.z1 + 0.2);
  addCope(0.5, POOL.z1 - POOL.z0, POOL.x0 - 0.2, (POOL.z0 + POOL.z1) / 2);
  addCope(0.5, POOL.z1 - POOL.z0, POOL.x1 + 0.2, (POOL.z0 + POOL.z1) / 2);
  // the infinity edge: a thin dark lip at the back, the water spills over
  const lip = new THREE.Mesh(roundedBox(W + 0.9, 0.12, 0.25, 0.04), flat(0x2a3f55));
  lip.position.set((POOL.x0 + POOL.x1) / 2, -0.14, POOL.z0 - 0.05);
  ground.add(lip);
}

// ---------------------------------------------------------------- pool
// basin (lit turquoise from below) + a glossy water surface that shimmers
let water;
{
  const W = POOL.x1 - POOL.x0;
  const D = POOL.z1 - POOL.z0;
  const cx = (POOL.x0 + POOL.x1) / 2;
  const cz = (POOL.z0 + POOL.z1) / 2;
  const basinMat = new THREE.MeshStandardMaterial({
    color: 0x3fd0d8,
    emissive: 0x1aa7c4,
    emissiveIntensity: 0.9,
    roughness: 0.5,
    side: THREE.BackSide,
  });
  const basin = new THREE.Mesh(new THREE.BoxGeometry(W, 1.6, D), basinMat);
  basin.position.set(cx, -0.85, cz);
  ground.add(basin);
  // pool lights in the wall
  for (let i = 0; i < 4; i++) {
    const l = new THREE.Mesh(
      new THREE.CircleGeometry(0.22, 24),
      flat(0xeaffff, { emissive: 0xbff8ff, emissiveIntensity: 2.2 }),
    );
    l.position.set(POOL.x0 + 2 + i * ((W - 4) / 3), -0.75, POOL.z1 - 0.02);
    l.rotation.y = Math.PI;
    l.userData.noAO = true;
    ground.add(l);
  }
  // ripple texture (caustic lines), scrolled in onFrame
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = "#2bb7c9";
  g.fillRect(0, 0, 256, 256);
  const r = rng(11);
  g.strokeStyle = "rgba(210,255,255,0.55)";
  for (let k = 0; k < 46; k++) {
    g.lineWidth = 1 + r() * 2.5;
    g.beginPath();
    const x = r() * 256;
    const y = r() * 256;
    g.ellipse(x, y, 10 + r() * 26, 6 + r() * 14, r() * 3, 0, Math.PI * (1 + r()));
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(W / 3, D / 3);
  water = new THREE.Mesh(
    new THREE.PlaneGeometry(W, D),
    new THREE.MeshPhysicalMaterial({
      color: 0x7fe9f2,
      map: tex,
      emissive: 0x18b8cc,
      emissiveMap: tex,
      emissiveIntensity: 0.75,
      roughness: 0.06,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      transparent: true,
      opacity: 0.88,
    }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.set(cx, -0.12, cz);
  water.userData.noAO = true;
  ground.add(water);
  onFrame((t) => {
    tex.offset.set(Math.sin(t * 0.35) * 0.08 + t * 0.012, Math.cos(t * 0.27) * 0.06);
  });
}

// ---------------------------------------------------------------- sea + hills
{
  const sea = new THREE.Mesh(
    new THREE.PlaneGeometry(600, 400),
    new THREE.MeshStandardMaterial({ color: 0x24305e, roughness: 0.18, metalness: 0.3 }),
  );
  sea.rotation.x = -Math.PI / 2;
  sea.position.set(0, -7, -215);
  ground.add(sea);
  // cliff face under the terrace edge
  const cliff = F(new THREE.BoxGeometry(90, 8, 3, 12, 3, 1), flat(0xb59a7c), 0.12, 3);
  cliff.position.set(0, -4.1, -14.2);
  ground.add(cliff);
  // hills on both sides of the bay with villa lights
  const hillMat = flat(0x2f2f52);
  const winMat = flat(0xffd79a, { emissive: 0xffc070, emissiveIntensity: 2.2 });
  const hill = (x, z, sx, sy, seed) => {
    const h = F(new THREE.IcosahedronGeometry(1, 2), hillMat, 0.12, seed);
    h.scale.set(sx, sy, sx * 0.6);
    h.position.set(x, -7, z);
    ground.add(h);
    const r = rng(seed);
    for (let i = 0; i < 14; i++) {
      const a = (r() - 0.5) * 1.8;
      const yy = 0.15 + r() * 0.55;
      const w = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.2), winMat);
      w.position.set(x + Math.sin(a) * sx * 0.75, -7 + yy * sy, z + sx * 0.35);
      w.userData.noAO = true;
      ground.add(w);
    }
  };
  hill(-95, -170, 70, 26, 5);
  hill(-30, -230, 55, 16, 6);
  hill(110, -160, 80, 30, 8);
  hill(55, -240, 50, 13, 9);
}

// a boat light crossing the bay
{
  const boat = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.BoxGeometry(3, 0.8, 1), flat(0xf2f2f2));
  boat.add(hull);
  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 12, 8),
    flat(0xfff2c8, { emissive: 0xffe6a0, emissiveIntensity: 3 }),
  );
  lamp.position.y = 1.2;
  boat.add(lamp);
  boat.position.set(-60, -6.6, -120);
  ground.add(boat);
  onFrame((t) => {
    boat.position.x = -60 + t * 2.4;
  });
}

// ---------------------------------------------------------------- near ring
// palms (scaled to the 1 unit ≈ 30 cm world), swaying
const palms = [
  [-14, -15.5, 3.4, 0.35],
  [-17.5, -6, 3.0, -0.3],
  [10.5, -15, 3.6, -0.4],
  [13.5, -4, 3.1, 0.3],
  [-9, 12, 2.6, 0.2],
];
palms.forEach(([x, z, s, lean], i) => {
  const p = palm(i + 3, lean);
  place(p, x, z, rand() * 6, s);
  sway(p, i + 1, 0.02);
});
// planters with bushes along the deck edge
for (const [x, z] of [
  [-13, 2],
  [12, 3],
  [-12.5, 8],
  [10.5, 10],
]) {
  const pot = new THREE.Mesh(
    roundedBox(2.2, 1.4, 2.2, 0.12),
    real.ceramic(0xe9e1d0, { roughness: 0.6, clearcoat: 0 }),
  );
  pot.position.set(x, 0.7, z);
  pot.castShadow = true;
  ground.add(pot);
  const b = bush(Math.floor(x * 3 + z), 0x3f7d4a);
  place(b, x, z, 0, 1.6, 1.3);
}

// parasol over the head end of the loungers
{
  const p = parasol(0xf3efe6, 0xf3efe6, 2.6);
  place(p, -4.6, -2.2, 0.3, 2.6);
}

// second lounger (empty), left and slightly back — the subject's lounger
// is built in scene.js (same builder)
export function lounger() {
  const g = new THREE.Group();
  const frameMat = real.plastic(0xf4f2ee, { roughness: 0.35 });
  const cushMat = real.fabric(0xe9e2d2);
  // base frame + legs
  const base = new THREE.Mesh(roundedBox(6.6, 0.16, 2.1, 0.06), frameMat);
  base.position.set(-0.3, 0.55, 0);
  g.add(base);
  for (const x of [-3.3, 2.7])
    for (const z of [-0.9, 0.9]) {
      const leg = new THREE.Mesh(roundedBox(0.18, 0.5, 0.18, 0.05), frameMat);
      leg.position.set(x, 0.25, z);
      g.add(leg);
    }
  // flat seat cushion
  const seat = new THREE.Mesh(roundedBox(4.4, 0.26, 1.9, 0.12, 5), cushMat);
  seat.position.set(0.8, 0.76, 0);
  g.add(seat);
  // raised back rest (35°) with its cushion
  const back = new THREE.Group();
  back.position.set(-1.4, 0.7, 0);
  back.rotation.z = -0.62;
  const bc = new THREE.Mesh(roundedBox(2.4, 0.26, 1.9, 0.12, 5), cushMat);
  bc.position.set(-1.2, 0.08, 0);
  back.add(bc);
  const bf = new THREE.Mesh(roundedBox(2.5, 0.1, 2.0, 0.04), frameMat);
  bf.position.set(-1.2, -0.1, 0);
  back.add(bf);
  g.add(back);
  g.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return g;
}
{
  const l2 = lounger();
  l2.position.set(-2.4, 0, -3.6);
  l2.rotation.y = 0.05;
  ground.add(l2);
  // folded towel on it
  const tw = new THREE.Mesh(roundedBox(1.2, 0.22, 1.5, 0.1), real.fabric(0x2bb3b8));
  tw.position.set(-1.0, 1.0, -3.6);
  tw.castShadow = true;
  ground.add(tw);
}

// festoon lights on four posts round the deck
{
  const postMat = real.wood(0x6b4a33);
  const posts = [
    [-11, 5],
    [9, 5.5],
    [-11, -3],
    [9, -3],
  ];
  posts.forEach(([x, z]) => {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 7, 12), postMat);
    p.position.set(x, 3.5, z);
    p.castShadow = true;
    ground.add(p);
  });
  const glow = 2.4;
  lightString([-11, 6.9, 5], [9, 6.9, 5.5], { n: 22, sag: 0.9, glow });
  lightString([-11, 6.9, -3], [9, 6.9, -3], { n: 22, sag: 0.8, glow });
  lightString([-11, 6.9, -3], [-11, 6.9, 5], { n: 10, sag: 0.5, glow });
  lightString([9, 6.9, -3], [9, 6.9, 5.5], { n: 10, sag: 0.5, glow });
}

// moths round the lights
fireflies(26, { area: [-11, 9, 4.5, 7.4, -3.5, 6], color: 0xfff2c4, seed: 76, size: 0.035 });

// ---------------------------------------------------------------- night switch
// k = 0 dusk, 1 night (moon up, stars, warmer festoon glow carries the light)
let skyMesh = null;
const lights = {};
scene.traverse((o) => {
  if (o.isMesh && o.material?.uniforms?.hor) skyMesh = o;
  if (o.isDirectionalLight && o.castShadow) lights.key = o;
  if (o.isHemisphereLight) lights.hemi = o;
});
const c3 = (a) => new THREE.Vector3(...a);
const SK = {
  d: {
    top: c3(DUSK.top),
    mid: c3(DUSK.mid),
    hor: c3(DUSK.hor),
    below: c3(DUSK.below),
    sun: c3(DUSK.sun),
  },
  n: {
    top: c3(NIGHT.top),
    mid: c3(NIGHT.mid),
    hor: c3(NIGHT.hor),
    below: c3(NIGHT.below),
    sun: c3(NIGHT.sun),
  },
};
const base = {
  key: lights.key?.intensity ?? 2,
  keyCol: lights.key?.color.clone(),
  hemi: lights.hemi?.intensity ?? 1.2,
};
const moonKey = new THREE.Color(0xa9bcff);
const moon = new THREE.Mesh(
  new THREE.SphereGeometry(4, 32, 16),
  new THREE.MeshBasicMaterial({ color: 0xfff6e0, fog: false }),
);
scene.add(moon);
export function setNight(k) {
  if (skyMesh) {
    const u = skyMesh.material.uniforms;
    for (const key of ["top", "mid", "hor", "below"])
      u[key].value.lerpVectors(SK.d[key], SK.n[key], k);
    u.sunCol.value.lerpVectors(SK.d.sun, SK.n.sun, k);
    u.stars.value = 0.25 + 0.9 * k;
  }
  if (lights.key) {
    lights.key.intensity = base.key * (1 - 0.45 * k);
    lights.key.color.copy(base.keyCol).lerp(moonKey, k);
  }
  if (lights.hemi) lights.hemi.intensity = base.hemi * (1 - 0.35 * k);
  moon.position.set(-60 + 40 * k, 18 + 52 * k, -170);
  moon.visible = k > 0.02;
}
setNight(0);

finishSet({ ground: 0xd8cbb0 });
