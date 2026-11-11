// #74 Milchschaum — set: the bar of a small coffee roastery, early morning.
// Giant scale (1 unit ≈ 5 cm): the walnut counter is the landscape, the
// cream-enamel espresso machine with its steam wand stands right behind
// the milk jug, a copper drum roaster turns at the back, morning sun
// falls through the side window and lights the dust in the air.
import { THREE, flat, ground, onFrame, real, roundedBox, rng, scene } from "./world.js";
import { SKIES, setSky, finishSet, fireflies, F, add } from "./environments.js";

const SEED = 74;
const r = rng(SEED);

// ---------------------------------------------------------------- light
// morning sun low from the left window, warm; cool fill from the room
setSky({
  ...SKIES.morgen,
  top: [0.55, 0.72, 0.95],
  hor: [1.0, 0.88, 0.7],
  clouds: 6,
  birds: false,
  key: [0xffe2b8, 2.9],
  keyPos: [-9, 12, 7],
  rim: [0xffc890, 0.8],
});
scene.fog = new THREE.Fog(0xe9d7bf, 45, 120);

// ---------------------------------------------------------------- counter
// thick walnut slab (the "ground"), a brass foot rail edge in front
const walnut = real.wood(0x6b4128, { roughness: 0.38, clearcoat: 0.5, clearcoatRoughness: 0.3 });
{
  const slab = new THREE.Mesh(roundedBox(64, 1.6, 30, 0.35, 3), walnut);
  slab.position.set(0, -0.8, -1);
  slab.receiveShadow = true;
  ground.add(slab);
  // plank seams
  const seam = flat(0x2c1a10, { roughness: 0.9 });
  for (let x = -30; x <= 30; x += 4.6) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.02, 30), seam);
    s.position.set(x + (r() - 0.5) * 0.4, 0.005, -1);
    ground.add(s);
  }
  // counter front (customer side) + brass rail, the room floor far below
  const front = new THREE.Mesh(new THREE.BoxGeometry(64, 18, 0.6), real.wood(0x3e2a1e));
  front.position.set(0, -10.4, 13.7);
  ground.add(front);
  const rail = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 64, 24),
    real.metal(0xd6a85a, { roughness: 0.25 }),
  );
  rail.rotation.z = Math.PI / 2;
  rail.position.set(0, -3.2, 14.6);
  ground.add(rail);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), flat(0x8a6d55));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -19;
  ground.add(floor);
}

// ---------------------------------------------------------------- walls
// back wall: old red brick, a shelf with coffee bags, a chalk menu board
{
  const wall = new THREE.Mesh(new THREE.BoxGeometry(90, 60, 0.6), flat(0x8e4a35));
  wall.position.set(0, 10, -17);
  ground.add(wall);
  const bricks = [];
  for (let y = -0.2; y < 34; y += 0.75)
    for (let x = -40; x < 40; x += 1.6) bricks.push([x + ((y / 0.75) % 2 ? 0.8 : 0), y]);
  const brick = new THREE.InstancedMesh(
    roundedBox(1.5, 0.66, 0.3, 0.08, 2),
    new THREE.MeshStandardMaterial({ roughness: 0.85 }),
    bricks.length,
  );
  const m4 = new THREE.Matrix4();
  const c = new THREE.Color();
  bricks.forEach(([x, y], i) => {
    brick.setMatrixAt(i, m4.makeTranslation(x, y, -16.6));
    const v = r();
    brick.setColorAt(i, c.setHSL(0.03 + v * 0.025, 0.45 + r() * 0.15, 0.3 + r() * 0.12));
  });
  brick.receiveShadow = true;
  ground.add(brick);
  // shelf with coffee bags (kraft paper, a colour band each)
  const shelfMat = real.wood(0x9a6a40);
  for (const y of [9.5, 15]) {
    const shelf = new THREE.Mesh(roundedBox(26, 0.5, 3, 0.1), shelfMat);
    shelf.position.set(-9, y, -15);
    shelf.castShadow = shelf.receiveShadow = true;
    ground.add(shelf);
    for (let i = 0; i < 9; i++) {
      const bag = new THREE.Group();
      const body = new THREE.Mesh(
        roundedBox(1.9, 3.2, 1.2, 0.25, 3),
        real.fabric(0xc49a6a, { roughness: 0.9 }),
      );
      body.position.y = 1.6;
      bag.add(body);
      const band = new THREE.Mesh(
        roundedBox(1.92, 0.8, 1.22, 0.2, 2),
        real.plastic([0x2f7d5b, 0xd8453a, 0x1f3f74, 0xe8b23a][i % 4]),
      );
      band.position.y = 1.7;
      bag.add(band);
      const fold = new THREE.Mesh(roundedBox(1.6, 0.35, 0.5, 0.1), real.fabric(0xb38a5c));
      fold.position.y = 3.3;
      bag.add(fold);
      bag.position.set(-20 + i * 2.6 + (r() - 0.5) * 0.3, y + 0.25, -15);
      bag.rotation.y = (r() - 0.5) * 0.3;
      bag.traverse((o) => (o.castShadow = true));
      ground.add(bag);
    }
  }
  // chalk menu board in a wooden frame
  const board = new THREE.Group();
  const slate = new THREE.Mesh(roundedBox(9, 6, 0.3, 0.1), flat(0x1f2422, { roughness: 0.95 }));
  board.add(slate);
  const frm = real.wood(0x7a5232);
  for (const [w, h, x, y] of [
    [9.6, 0.4, 0, 3.1],
    [9.6, 0.4, 0, -3.1],
    [0.4, 6.4, -4.7, 0],
    [0.4, 6.4, 4.7, 0],
  ]) {
    const b = new THREE.Mesh(roundedBox(w, h, 0.5, 0.12), frm);
    b.position.set(x, y, 0.1);
    board.add(b);
  }
  const chalk = flat(0xf3efe6, { roughness: 1 });
  for (let i = 0; i < 6; i++) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(2.5 + r() * 3.5, 0.18, 0.05), chalk);
    line.position.set(-1.2 + r() * 0.6, 2.0 - i * 0.8, 0.2);
    board.add(line);
    const price = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.18, 0.05), chalk);
    price.position.set(3.2, 2.0 - i * 0.8, 0.2);
    board.add(price);
  }
  board.position.set(13, 15, -16.2);
  ground.add(board);
}

// left wall with a tall window: the morning sun comes in from here
{
  const wallMat = flat(0xe9dcc8);
  for (const [w, h, z, y] of [
    [40, 60, -27, 10], // behind the window
    [40, 60, 25, 10], // in front of it
  ]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.6, h, w), wallMat);
    p.position.set(-30, y, z);
    ground.add(p);
  }
  const sill = new THREE.Mesh(new THREE.BoxGeometry(0.6, 6, 14), wallMat);
  sill.position.set(-30, 0, -1);
  ground.add(sill);
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.6, 20, 14), wallMat);
  top.position.set(-30, 32, -1);
  ground.add(top);
  // black steel window bars
  const steel = real.metal(0x26272a, { roughness: 0.5 });
  for (const z of [-8, -3.3, 1.3, 6]) {
    const b = new THREE.Mesh(roundedBox(0.4, 20, 0.35, 0.08), steel);
    b.position.set(-29.7, 13, z);
    ground.add(b);
  }
  for (const y of [3.2, 9, 15, 21.8]) {
    const b = new THREE.Mesh(roundedBox(0.4, 0.35, 14, 0.08), steel);
    b.position.set(-29.7, y, -1);
    ground.add(b);
  }
  // a potted fern on the sill
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 0.9, 2, 32),
    real.ceramic(0xc76d4a, { roughness: 0.6 }),
  );
  pot.position.set(-27.5, 1, -6);
  pot.castShadow = true;
  ground.add(pot);
  const fern = new THREE.Group();
  const leaf = real.plastic(0x3f7d3a, { roughness: 0.7, side: THREE.DoubleSide });
  for (let i = 0; i < 14; i++) {
    const l = new THREE.Mesh(new THREE.ConeGeometry(0.35, 4.2, 6), leaf);
    l.position.y = 1.6;
    const a = (i / 14) * Math.PI * 2;
    const g = new THREE.Group();
    g.rotation.set(0.9 + r() * 0.4, a, 0);
    g.add(l);
    fern.add(g);
  }
  fern.position.set(-27.5, 2, -6);
  ground.add(fern);
  onFrame((t) => (fern.rotation.y = Math.sin(t * 0.7) * 0.05));
}

// ---------------------------------------------------------------- hero piece: drum roaster
// copper drum + hopper + round cooling tray with a turning stirring arm
{
  const roaster = new THREE.Group();
  const copper = real.metal(0xc8794a, { roughness: 0.28 });
  const black = real.gloss(0x1c1c1e);
  const base = new THREE.Mesh(roundedBox(7, 7, 6, 0.4), black);
  base.position.y = 3.5;
  roaster.add(base);
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 6.4, 64), copper);
  drum.rotation.x = Math.PI / 2;
  drum.position.set(0, 9.6, 0.4);
  roaster.add(drum);
  const face = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.3, 0.4, 64), black);
  face.rotation.x = Math.PI / 2;
  face.position.set(0, 9.6, 3.7);
  roaster.add(face);
  const win = new THREE.Mesh(
    new THREE.CircleGeometry(1.1, 48),
    new THREE.MeshStandardMaterial({ color: 0x5a2e14, emissive: 0xff7a2a, emissiveIntensity: 0.6 }),
  );
  win.position.set(0, 9.6, 3.92);
  roaster.add(win);
  const hopper = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 0.6, 3.4, 48, 1, true), copper);
  hopper.position.set(0, 14.6, 0.4);
  hopper.material.side = THREE.DoubleSide;
  roaster.add(hopper);
  const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 30, 32), copper);
  chimney.position.set(-2.4, 26, -1.5);
  roaster.add(chimney);
  // cooling tray in front with beans and a turning arm
  const tray = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, 0.9, 64), real.metal(0xb9bec4));
  tray.position.set(0, 5.6, 6.6);
  roaster.add(tray);
  const beans = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.16, 10, 8),
    real.plastic(0x4a2614, { roughness: 0.35 }),
    260,
  );
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const sc = new THREE.Vector3(1, 0.7, 1.4);
  for (let i = 0; i < 260; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * 3.3;
    q.setFromEuler(new THREE.Euler(0, r() * 6, 0));
    beans.setMatrixAt(
      i,
      m4.compose(
        new THREE.Vector3(Math.cos(a) * d, 6.1 + r() * 0.12, 6.6 + Math.sin(a) * d),
        q,
        sc,
      ),
    );
  }
  roaster.add(beans);
  const arm = new THREE.Mesh(roundedBox(6.6, 0.3, 0.3, 0.1), real.metal(0x8b9096));
  arm.position.set(0, 6.4, 6.6);
  roaster.add(arm);
  onFrame((t) => (arm.rotation.y = t * 0.9));
  roaster.traverse((o) => (o.castShadow = o.receiveShadow = true));
  roaster.position.set(17, 0, -12.5);
  roaster.rotation.y = -0.35;
  ground.add(roaster);
}

// ---------------------------------------------------------------- near props on the counter
// grinder left of the machine, a stack of cups, a tamper, a glass jar of beans
{
  const black = real.gloss(0x202022);
  const g = new THREE.Group();
  const body = new THREE.Mesh(roundedBox(3.2, 6.5, 3.6, 0.35), black);
  body.position.y = 3.25;
  g.add(body);
  const hop = new THREE.Mesh(
    new THREE.CylinderGeometry(1.7, 0.8, 4, 48, 1, true),
    real.glass(0x9a7a5a, { opacity: 0.55 }),
  );
  hop.position.y = 8.5;
  g.add(hop);
  const fill = new THREE.Mesh(
    new THREE.CylinderGeometry(1.35, 0.8, 2.4, 48),
    real.plastic(0x3d1f10, { roughness: 0.5 }),
  );
  fill.position.y = 7.8;
  g.add(fill);
  const spout = new THREE.Mesh(roundedBox(0.8, 0.6, 1.2, 0.15), real.metal());
  spout.position.set(0, 3.0, 2.2);
  g.add(spout);
  g.traverse((o) => (o.castShadow = true));
  g.position.set(-11.5, 0, -7);
  ground.add(g);

  // stacked cups on a tray (right side)
  const cupMat = real.ceramic(0xf5f1ea);
  for (let s = 0; s < 3; s++)
    for (let i = 0; i < 3; i++) {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 0.65, 1.3, 48), cupMat);
      c.position.set(10 + s * 2.4, 0.65 + i * 1.05, -3.5 + (s % 2) * 0.4);
      c.castShadow = true;
      ground.add(c);
    }
  // tamper
  const tamper = new THREE.Group();
  const tb = new THREE.Mesh(
    new THREE.CylinderGeometry(1.0, 1.0, 0.5, 48),
    real.metal(0xd0d4d8, { roughness: 0.2 }),
  );
  tb.position.y = 0.25;
  tamper.add(tb);
  const th = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.55, 2.4, 32), real.wood(0x5a3520));
  th.position.y = 1.7;
  tamper.add(th);
  tamper.traverse((o) => (o.castShadow = true));
  tamper.position.set(-7.5, 0, 4.5);
  ground.add(tamper);
  // glass jar with beans
  const jar = new THREE.Mesh(
    new THREE.CylinderGeometry(1.4, 1.4, 3.6, 48),
    real.glass(0xeaf4f7, { opacity: 0.35 }),
  );
  jar.position.set(13.5, 1.8, 4);
  jar.userData.noAO = true;
  ground.add(jar);
  add(
    new THREE.Mesh(
      new THREE.CylinderGeometry(1.3, 1.3, 2.4, 48),
      real.plastic(0x3b1d0e, { roughness: 0.6 }),
    ),
    13.5,
    1.2,
    4,
  );
  add(
    new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.45, 0.5, 48), real.wood(0x8a5a34)),
    13.5,
    3.85,
    4,
  );
  // a bar towel
  const towel = new THREE.Mesh(roundedBox(4, 0.12, 2.6, 0.05), real.fabric(0xe9e2d4));
  towel.position.set(-5.8, 0.06, 6.5);
  towel.rotation.y = 0.35;
  ground.add(towel);
  for (let i = 0; i < 3; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(4.02, 0.13, 0.18), flat(0x2f5f8f));
    s.position.set(-5.8, 0.06, 6.5 - 0.8 + i * 0.8);
    s.rotation.y = 0.35;
    ground.add(s);
  }
}

// ---------------------------------------------------------------- life
// pendant lamps swinging gently, dust drifting in the sun, roaster smoke
{
  const lamps = [];
  for (const [x, z] of [
    [-8, -4],
    [8, -2],
  ]) {
    const g = new THREE.Group();
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 26, 8), flat(0x1a1a1a));
    cord.position.y = -13;
    g.add(cord);
    const shade = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 2.6, 2.2, 48, 1, true),
      real.gloss(0x2d4a3e, { side: THREE.DoubleSide }),
    );
    shade.position.y = -27;
    g.add(shade);
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 24, 16),
      new THREE.MeshStandardMaterial({
        color: 0xfff1d0,
        emissive: 0xffc070,
        emissiveIntensity: 2.2,
      }),
    );
    bulb.position.y = -27.9;
    g.add(bulb);
    g.position.set(x, 43, z);
    ground.add(g);
    lamps.push(g);
  }
  onFrame((t) =>
    lamps.forEach((g, i) => {
      g.rotation.z = Math.sin(t * 0.8 + i * 1.7) * 0.012;
      g.rotation.x = Math.sin(t * 0.6 + i) * 0.01;
    }),
  );
  fireflies(70, { area: [-24, 22, 1, 18, -14, 10], color: 0xfff1d8, seed: SEED, size: 0.05 });
  // thin smoke from the roaster's chimney
  const smoke = new THREE.Group();
  const sm = new THREE.MeshStandardMaterial({
    color: 0xf2ece4,
    transparent: true,
    opacity: 0.25,
    depthWrite: false,
  });
  const puffs = [];
  for (let i = 0; i < 10; i++) {
    const p = F(new THREE.IcosahedronGeometry(1, 1), sm, 0.05, i);
    smoke.add(p);
    puffs.push(p);
  }
  smoke.position.set(14.5, 41, -12);
  ground.add(smoke);
  onFrame((t) =>
    puffs.forEach((p, i) => {
      const k = (t * 0.12 + i / 10) % 1;
      p.position.set(Math.sin(i * 2.1 + t * 0.3) * 1.2 * k, k * 10, 0);
      p.scale.setScalar(0.6 + k * 2.4);
    }),
  );
}

finishSet({ ground: 0x6b4128 });
