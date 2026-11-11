// #73 "Mit vollem Magen schwimmen" (Format B) — an Alpine lake at midday
// in high summer. Turquoise water you can see the stony bed through, a
// long wooden jetty from the left shore (towel, pizza box, Oma's deck
// chair, a beer, an old book), a 1900s wooden lido with a red-white roof
// on stilts as the hero piece, a diving raft, pine forest on the far shore
// and snowy peaks behind. Life: the water ripples and glitters, a pink
// flamingo float bobs, reeds sway, a sailboat drifts, birds circle.
// Scale: 1 unit = 1 m. Water surface y = 0, jetty deck y = 0.5.
import { THREE, flat, real, roundedBox, ground, onFrame, rng, scene, noise2 } from "./world.js";
import { SKIES, setSky, finishSet, terrain, pine, F, add, fireflies } from "./environments.js";
import { sway } from "./props.js";

const SEED = 73;

// ---------------------------------------------------------------- light
setSky({
  ...SKIES.mittag,
  top: [0.18, 0.47, 0.88],
  mid: [0.5, 0.75, 0.97],
  hor: [0.86, 0.94, 1.0],
  sunDir: [0.45, 0.6, -1],
  keyPos: [9, 15, 7],
  key: [0xfff6e2, 3.0],
  clouds: 7,
  fog: [70, 260],
});

// ---------------------------------------------------------------- ground: lake bed + shores
const smoothstep = (a, b, x) => {
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return k * k * (3 - 2 * k);
};
// land mask: left shore (x < -15), far shore (z < -40), behind the camera
export const landK = (x, z) =>
  Math.max(
    smoothstep(-12, -17, x + 2.5 * Math.sin(z * 0.15)),
    smoothstep(-36, -44, z + 3 * Math.sin(x * 0.11)),
    smoothstep(22, 30, z),
  );
export function groundH(x, z) {
  const bed =
    -2.3 + 0.5 * noise2(x * 0.15, z * 0.15, 3) + 0.25 * Math.sin(x * 0.4) * Math.cos(z * 0.33);
  const d = Math.hypot(x, z);
  const land = 0.45 + 0.6 * noise2(x * 0.08, z * 0.08, 9) + Math.max(0, d - 60) * 0.12;
  return bed + (land - bed) * landK(x, z);
}
terrain(0x6f9a3e, {
  r: 160,
  step: 2.6,
  seed: SEED,
  height: (x, z) => groundH(x, z),
  amt: 0.14,
  scale: 0.08,
  warm: 0.35,
  fn: (x, z) => {
    // sandy-stone lake bed under water, grass on land
    const k = landK(x, z);
    return k < 0.5 ? 0.0 : 0;
  },
});
// stony lake bed colour (a second skin just over the bed, under water only)
{
  const geo = new THREE.PlaneGeometry(70, 70, 70, 70);
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  const col = [];
  const r = rng(SEED + 1);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const z = p.getZ(i) - 6;
    p.setZ(i, z);
    p.setY(i, groundH(x, z) + 0.03);
    const n = noise2(x * 0.3, z * 0.3, 5) * 0.5 + r() * 0.12;
    const c = new THREE.Color(0xc9b48a).lerp(new THREE.Color(0x7d8f6a), n);
    col.push(c.r, c.g, c.b);
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  geo.computeVertexNormals();
  const bed = new THREE.Mesh(geo, flat(0xffffff, { vertexColors: true, roughness: 0.95 }));
  bed.receiveShadow = true;
  ground.add(bed);
  // pebbles on the bed
  const pg = new THREE.DodecahedronGeometry(0.14, 0);
  const im = new THREE.InstancedMesh(pg, flat(0x9a9284, { roughness: 0.9 }), 260);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 260; i++) {
    const x = (r() - 0.5) * 30;
    const z = (r() - 0.5) * 24 - 2;
    const s = 0.4 + r() * 1.4;
    m4.compose(
      new THREE.Vector3(x, groundH(x, z) + 0.05, z),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(r() * 3, r() * 3, 0)),
      new THREE.Vector3(s, s * 0.6, s),
    );
    im.setMatrixAt(i, m4);
  }
  im.receiveShadow = true;
  ground.add(im);
}

// ---------------------------------------------------------------- water
// near: a moving, see-through surface; far: a calm deeper-blue sheet
const WG = new THREE.PlaneGeometry(56, 48, 110, 96);
WG.rotateX(-Math.PI / 2);
WG.translate(2, 0, -6);
const WBASE = Float32Array.from(WG.attributes.position.array);
export const waterMat = new THREE.MeshPhysicalMaterial({
  color: 0x36bccb,
  roughness: 0.05,
  transparent: true,
  opacity: 0.58,
  clearcoat: 1,
  clearcoatRoughness: 0.04,
  side: THREE.DoubleSide,
  depthWrite: false,
});
const water = new THREE.Mesh(WG, waterMat);
water.userData.noAO = true;
water.renderOrder = 2;
scene.add(water);
{
  const far = new THREE.Mesh(
    new THREE.RingGeometry(1, 1, 4, 1),
    new THREE.MeshPhysicalMaterial({ color: 0x1f8fa8, roughness: 0.08, clearcoat: 1 }),
  );
  // a big sheet with a hole where the near water is
  const s = new THREE.Shape();
  s.moveTo(-200, -200);
  s.lineTo(200, -200);
  s.lineTo(200, 200);
  s.lineTo(-200, 200);
  const hole = new THREE.Path();
  hole.moveTo(-25.5, -29.5);
  hole.lineTo(-25.5, 17.5);
  hole.lineTo(29.5, 17.5);
  hole.lineTo(29.5, -29.5);
  s.holes.push(hole);
  far.geometry = new THREE.ShapeGeometry(s);
  far.geometry.rotateX(-Math.PI / 2);
  far.position.y = -0.02;
  far.userData.noAO = true;
  scene.add(far);
}
// waveSources: scene.js adds splash rings ({ x, z, at, amp, speed, life, crater })
export const waveSources = [];
export function waterHeight(x, z, t) {
  let h = 0.03 * Math.sin(x * 1.1 + t * 1.5) + 0.022 * Math.sin(z * 1.6 - t * 1.2 + x * 0.35);
  for (const s of waveSources) {
    const dt = t - s.at;
    if (dt <= 0 || dt > s.life) continue;
    const d = Math.hypot(x - s.x, z - s.z);
    const k = d - dt * s.speed;
    h += s.amp * Math.exp(-dt / (s.life * 0.45)) * Math.exp(-(k * k) / 0.5) * Math.cos(k * 4);
    if (s.crater) h -= s.crater * Math.exp(-(d * d) / 0.4) * Math.exp(-dt * 3.5);
  }
  return h;
}
onFrame((t) => {
  const p = WG.attributes.position;
  for (let i = 0; i < p.count; i++) p.setY(i, waterHeight(WBASE[i * 3], WBASE[i * 3 + 2], t));
  p.needsUpdate = true;
  WG.computeVertexNormals();
});
// sun glitter on the water
{
  const gl = fireflies(70, {
    area: [-14, 18, 0.04, 0.08, -22, 6],
    color: 0xffffff,
    seed: 31,
    size: 0.035,
  });
  void gl;
}

// ---------------------------------------------------------------- jetty
export const DECK = 0.5;
export const JETTY = { x0: -18, x1: -1.4, z: -0.9, w: 1.9 };
const plankM = real.wood(0xb98a5a, { roughness: 0.75 });
const plankM2 = real.wood(0xa67950, { roughness: 0.8 });
const postM = real.wood(0x6e4c32, { roughness: 0.85 });
export const jetty = new THREE.Group();
ground.add(jetty);
{
  const r = rng(SEED + 2);
  for (let x = JETTY.x0; x < JETTY.x1; x += 0.2) {
    const p = new THREE.Mesh(
      roundedBox(0.18, 0.06, JETTY.w, 0.015, 2),
      r() < 0.5 ? plankM : plankM2,
    );
    p.position.set(x + 0.1, DECK - 0.03, JETTY.z + (r() - 0.5) * 0.04);
    p.rotation.y = (r() - 0.5) * 0.015;
    p.castShadow = p.receiveShadow = true;
    jetty.add(p);
  }
  // beams + posts
  for (const dz of [-0.8, 0.8]) {
    const b = new THREE.Mesh(roundedBox(JETTY.x1 - JETTY.x0, 0.16, 0.12, 0.02), postM);
    b.position.set((JETTY.x0 + JETTY.x1) / 2, DECK - 0.14, JETTY.z + dz);
    jetty.add(b);
  }
  for (let x = JETTY.x1 - 0.1; x > JETTY.x0; x -= 2.4)
    for (const dz of [-0.85, 0.85]) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.11, 3.2, 16), postM);
      p.position.set(x, DECK - 1.6, JETTY.z + dz);
      p.castShadow = true;
      jetty.add(p);
    }
  // ladder at the end (into the water)
  const steel = real.metal(0xdfe5ea, { roughness: 0.18 });
  for (const dz of [-0.28, 0.28]) {
    const rail = new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(-1.75, DECK, 0),
          new THREE.Vector3(-1.6, DECK + 0.75, 0),
          new THREE.Vector3(-1.3, DECK + 0.8, 0),
          new THREE.Vector3(-1.25, DECK + 0.2, 0),
          new THREE.Vector3(-1.25, -1.2, 0),
        ]),
        40,
        0.03,
        10,
      ),
      steel,
    );
    rail.position.z = JETTY.z + 0.55 + dz;
    rail.castShadow = true;
    jetty.add(rail);
  }
  for (let y = -0.9; y < 0.4; y += 0.32) {
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.56, 8), steel);
    st.rotation.x = Math.PI / 2;
    st.position.set(-1.25, y, JETTY.z + 0.55);
    jetty.add(st);
  }
}

// ---------------------------------------------------------------- props on the jetty
// (scene.js animates Oma, the pizza box, the beer and the book; set.js
// gives the static dressing)
// striped towel
{
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 64;
  const g = c.getContext("2d");
  const cols = ["#ff6f61", "#ffffff", "#ffc93c", "#ffffff", "#2ec4b6", "#ffffff"];
  for (let i = 0; i < 12; i++) {
    g.fillStyle = cols[i % cols.length];
    g.fillRect(i * 21.3, 0, 22, 64);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const towel = new THREE.Mesh(
    roundedBox(1.7, 0.03, 0.9, 0.012),
    real.fabric(0xffffff, { map: tex }),
  );
  towel.position.set(-3.2, DECK + 0.015, JETTY.z + 0.2);
  towel.rotation.y = 0.06;
  towel.receiveShadow = true;
  jetty.add(towel);
}
// flip-flops
for (const [x, z, ry] of [
  [-2.3, -1.55, 0.3],
  [-2.05, -1.6, 0.1],
]) {
  const f = new THREE.Mesh(roundedBox(0.11, 0.025, 0.27, 0.01), real.rubber(0x2ec4b6));
  f.position.set(x, DECK + 0.012, z);
  f.rotation.y = ry;
  jetty.add(f);
}
// a radio and a sun hat by the deck chair
{
  const radio = new THREE.Mesh(roundedBox(0.34, 0.2, 0.12, 0.03), real.plastic(0xe4473c));
  radio.position.set(-6.1, DECK + 0.1, JETTY.z - 0.5);
  radio.castShadow = true;
  jetty.add(radio);
  const grill = new THREE.Mesh(new THREE.CircleGeometry(0.06, 24), real.metal(0x333333));
  grill.position.set(-6.18, DECK + 0.1, JETTY.z - 0.43);
  jetty.add(grill);
}

// ---------------------------------------------------------------- hero piece: the old lido
const wood = flat(0xf4ead2);
const woodTrim = flat(0x3f7f6a);
const roofR = flat(0xd94a3c);
const roofW = flat(0xfaf6ee);
export const lido = new THREE.Group();
ground.add(lido);
lido.position.set(-13, 0, -17);
lido.rotation.y = 0.35;
{
  const W = 11;
  const D = 4.5;
  // deck on stilts
  const deck = F(new THREE.BoxGeometry(W + 1.4, 0.25, D + 1.6), flat(0xb48a5c), 0.05, 4);
  deck.position.y = 0.8;
  lido.add(deck);
  for (let x = -W / 2; x <= W / 2; x += 1.8)
    for (const z of [-D / 2 - 0.6, D / 2 + 0.6]) {
      const p = F(new THREE.CylinderGeometry(0.13, 0.13, 3, 6), flat(0x6e4c32), 0.05, x * 3);
      p.position.set(x, -0.6, z);
      lido.add(p);
    }
  // cabins: a row of white walls with green doors
  const body = F(new THREE.BoxGeometry(W, 2.6, D), wood, 0.05, 6);
  body.position.y = 2.2;
  body.castShadow = true;
  lido.add(body);
  for (let i = 0; i < 7; i++) {
    const door = F(new THREE.BoxGeometry(0.9, 1.7, 0.08), woodTrim, 0.04, i);
    door.position.set(-W / 2 + 0.9 + i * 1.55, 1.85, D / 2 + 0.04);
    lido.add(door);
    const vent = new THREE.Mesh(new THREE.CircleGeometry(0.16, 12), flat(0xffd23f));
    vent.position.set(-W / 2 + 0.9 + i * 1.55, 2.95, D / 2 + 0.09);
    lido.add(vent);
  }
  // striped hip roof
  const roof = new THREE.Group();
  roof.position.y = 3.5;
  lido.add(roof);
  for (let i = 0; i < 12; i++) {
    const seg = F(
      new THREE.BoxGeometry(W / 12 + 0.02, 0.12, D + 1.8),
      i % 2 ? roofW : roofR,
      0.05,
      i,
    );
    seg.position.set(-W / 2 + (i + 0.5) * (W / 12), 0.55, 0);
    seg.rotation.x = 0;
    roof.add(seg);
    for (const s of [-1, 1]) {
      const slope = F(
        new THREE.BoxGeometry(W / 12 + 0.02, 0.1, (D + 1.8) / 2 + 0.1),
        i % 2 ? roofW : roofR,
        0.05,
        i + 30,
      );
      slope.position.set(-W / 2 + (i + 0.5) * (W / 12), 0.2, (s * (D + 1.8)) / 4);
      slope.rotation.x = s * 0.32;
      roof.add(slope);
    }
  }
  // two flags
  for (const [x, c] of [
    [-W / 2 + 0.5, 0xd94a3c],
    [W / 2 - 0.5, 0xffffff],
  ]) {
    const pole = F(new THREE.CylinderGeometry(0.04, 0.04, 2.6, 6), flat(0xeeeeee), 0.02, 1);
    pole.position.set(x, 5.0, 0);
    lido.add(pole);
    const flag = new THREE.Mesh(
      new THREE.PlaneGeometry(0.9, 0.5, 6, 2),
      flat(c, { side: THREE.DoubleSide }),
    );
    flag.position.set(x + 0.47, 6.0, 0);
    lido.add(flag);
    const base = Float32Array.from(flag.geometry.attributes.position.array);
    onFrame((t) => {
      const p = flag.geometry.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const u = base[i * 3] + 0.45;
        p.setZ(i, Math.sin(t * 5 + u * 6) * 0.08 * u);
      }
      p.needsUpdate = true;
    });
  }
  // lifebuoy on the wall
  const buoy = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.1, 12, 24), flat(0xff6a3d));
  buoy.position.set(W / 2 - 0.4, 2.3, D / 2 + 0.15);
  lido.add(buoy);
}

// ---------------------------------------------------------------- diving raft
export const raft = new THREE.Group();
scene.add(raft);
raft.position.set(8.5, 0, -11);
{
  const deck = new THREE.Mesh(roundedBox(3.2, 0.22, 3.2, 0.05), real.wood(0xc49a68));
  deck.position.y = 0.3;
  deck.castShadow = deck.receiveShadow = true;
  raft.add(deck);
  for (const [x, z] of [
    [-1.2, -1.2],
    [1.2, -1.2],
    [-1.2, 1.2],
    [1.2, 1.2],
  ]) {
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.32, 0.5, 20),
      real.plastic(0x2a6fbd),
    );
    barrel.position.set(x, 0.0, z);
    raft.add(barrel);
  }
  const lad = new THREE.Mesh(
    new THREE.TorusGeometry(0.28, 0.025, 8, 20, Math.PI),
    real.metal(0xdfe5ea),
  );
  lad.position.set(0, 0.6, 1.55);
  raft.add(lad);
}
onFrame((t) => {
  raft.position.y = 0.04 * Math.sin(t * 1.3);
  raft.rotation.z = 0.02 * Math.sin(t * 1.1 + 1);
  raft.rotation.x = 0.015 * Math.sin(t * 0.9);
});

// ---------------------------------------------------------------- flamingo float
export const flamingo = new THREE.Group();
scene.add(flamingo);
flamingo.position.set(5, 0, -5.5);
{
  const pink = real.plastic(0xff7eb6, { roughness: 0.25, clearcoat: 1 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.22, 20, 40), pink);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.12;
  flamingo.add(ring);
  const neck = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.2, -0.55),
        new THREE.Vector3(0, 0.75, -0.65),
        new THREE.Vector3(0, 1.1, -0.45),
        new THREE.Vector3(0, 1.05, -0.2),
      ]),
      30,
      0.1,
      12,
    ),
    pink,
  );
  flamingo.add(neck);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 20, 14), pink);
  head.position.set(0, 1.08, -0.2);
  flamingo.add(head);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 12), real.plastic(0x222222));
  beak.rotation.x = Math.PI / 2 + 0.6;
  beak.position.set(0, 1.0, -0.05);
  flamingo.add(beak);
  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), real.gloss(0x111111));
    eye.position.set(s * 0.12, 1.12, -0.17);
    flamingo.add(eye);
  }
}
onFrame((t) => {
  flamingo.position.y = 0.05 * Math.sin(t * 1.6);
  flamingo.position.x = 5 + 0.4 * Math.sin(t * 0.15);
  flamingo.rotation.y = 0.6 + 0.25 * Math.sin(t * 0.2);
  flamingo.rotation.z = 0.05 * Math.sin(t * 1.3);
});

// ---------------------------------------------------------------- reeds on the left shore
{
  const r = rng(SEED + 4);
  const reedM = flat(0x7d9a3a);
  const reedM2 = flat(0x9cae4c);
  for (let i = 0; i < 26; i++) {
    const g = new THREE.Group();
    const n = 5 + Math.floor(r() * 5);
    for (let k = 0; k < n; k++) {
      const h = 1.0 + r() * 1.1;
      const b = new THREE.Mesh(new THREE.ConeGeometry(0.03, h, 4), k % 2 ? reedM : reedM2);
      b.position.set((r() - 0.5) * 0.5, h / 2 - 0.3, (r() - 0.5) * 0.5);
      b.rotation.z = (r() - 0.5) * 0.3;
      g.add(b);
      if (r() < 0.3) {
        const cob = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.16, 4, 8), flat(0x6b4426));
        cob.position.set(b.position.x, h - 0.3, b.position.z);
        g.add(cob);
      }
    }
    const z = -14 + r() * 22;
    if (z > -3 && z < 1.5) continue; // keep the jetty clear
    g.position.set(-13.5 - r() * 2.5 + 2.5 * Math.sin(z * 0.15), 0, z);
    ground.add(g);
    sway(g, i, 0.05);
  }
}

// ---------------------------------------------------------------- shores: meadow, trees, forest
{
  const r = rng(SEED + 5);
  // left shore: a few pines and birches behind the jetty's root
  for (let i = 0; i < 22; i++) {
    const x = -20 - r() * 22;
    const z = -30 + r() * 46;
    const g = pine(x, z, 1.4 + r() * 1.3, i + 3);
    g.position.y = groundH(x, z) - 0.1;
  }
  // far shore: dense pine forest
  for (let i = 0; i < 90; i++) {
    const x = -70 + r() * 150;
    const z = -46 - r() * 30;
    const g = pine(x, z, 2.2 + r() * 2.2, i + 40);
    g.position.y = groundH(x, z) - 0.1;
  }
  // a few rocks at the waterline
  for (let i = 0; i < 16; i++) {
    const x = -12.5 - r() * 3;
    const z = -20 + r() * 34;
    const m = F(new THREE.DodecahedronGeometry(0.4 + r() * 0.6, 0), flat(0x8f8a80), 0.1, i);
    add(m, x, groundH(x, z) * 0.5, z);
  }
  // a small sailboat drifting on the far water
  const boat = new THREE.Group();
  const hull = F(new THREE.CylinderGeometry(0.0, 0.7, 3.2, 4, 1), flat(0xffffff), 0.04, 2);
  hull.rotation.z = Math.PI / 2;
  hull.scale.set(1, 1, 0.5);
  boat.add(hull);
  const sail = new THREE.Mesh(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.3, 0),
      new THREE.Vector3(0, 4.2, 0),
      new THREE.Vector3(1.8, 0.4, 0),
    ]),
    flat(0xfff7e6, { side: THREE.DoubleSide }),
  );
  sail.geometry.computeVertexNormals();
  boat.add(sail);
  scene.add(boat);
  onFrame((t) => {
    boat.position.set(-20 + t * 0.5, 0.15, -32);
    boat.rotation.z = 0.04 * Math.sin(t * 0.9);
  });
}

// ---------------------------------------------------------------- mountains (far layer)
{
  const rockM = flat(0x7c8496);
  const rockM2 = flat(0x6a7386);
  const snow = flat(0xf6f9ff);
  const peaks = [
    [-95, -150, 42, 58],
    [-45, -165, 48, 75],
    [5, -175, 55, 88],
    [55, -160, 46, 70],
    [100, -140, 40, 55],
    [-130, -110, 38, 46],
    [135, -105, 36, 42],
    [-20, -130, 30, 40],
    [35, -125, 28, 36],
  ];
  peaks.forEach(([x, z, r, h], i) => {
    const m = F(new THREE.ConeGeometry(r, h, 7, 3), i % 2 ? rockM : rockM2, 0.12, i + 60);
    m.position.set(x, h / 2 - 4, z);
    m.rotation.y = i;
    ground.add(m);
    const cap = F(new THREE.ConeGeometry(r * 0.38, h * 0.38, 7, 1), snow, 0.06, i + 80);
    cap.position.set(x, h - 4 - h * 0.19 + 0.3, z);
    cap.rotation.y = i;
    ground.add(cap);
  });
}

finishSet({ ground: 0x5f8f6a });
