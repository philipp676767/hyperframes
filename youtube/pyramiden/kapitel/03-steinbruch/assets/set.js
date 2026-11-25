// Chapter 3: the quarry south of the pyramid (main world, early stage), a
// stone-cutter at a half-cut block, the smiths' fire, copper bars, a balance
// with a block against two small cars, a granite boat on the flood.
import { THREE, scene, rng, real, roundedBox, V } from "./world.js";
import { car } from "./environments.js";
import {
  buildGiza,
  makePerson,
  makeBoat,
  makeSmoke,
  randomPerson,
  heightAt,
  FLOOD_Y,
  noAO,
  shadowAll,
} from "./welt.js";
export const G = buildGiza({ time: "tag", state: "bau", level: 0.4 });

// --- the stone-cutter: a rock bench with a block half cut free
export const CUT = V(-1.5, -2.4, 30);
export const CUTTER = makePerson({ skin: 0x8f6040 });
{
  const rock = real.plastic(0xdcc59a, { roughness: 0.9, clearcoat: 0 });
  const bench = new THREE.Mesh(roundedBox(1.2, 0.3, 0.6, 0.03), rock);
  bench.position.copy(CUT).add(V(0, 0.15, -0.2));
  scene.add(bench);
  const blk = new THREE.Mesh(roundedBox(0.13, 0.1, 0.09, 0.008), rock);
  blk.position.copy(CUT).add(V(0.1, 0.35, 0.02));
  scene.add(blk);
  // the trench around the block (dark gap)
  const gap = new THREE.Mesh(
    new THREE.BoxGeometry(0.17, 0.04, 0.13),
    new THREE.MeshStandardMaterial({ color: 0x5a4632, roughness: 1 }),
  );
  gap.position.copy(CUT).add(V(0.1, 0.3, 0.02));
  scene.add(gap);
  shadowAll(bench);
  bench.castShadow = blk.castShadow = true;
  CUTTER.position.copy(CUT).add(V(0.1, 0.3, 0.15));
  CUTTER.rotation.y = Math.PI / 2;
  scene.add(CUTTER);
}
// chisel (copper) + mallet (wood) in his hands
export const CHISEL = new THREE.Mesh(
  new THREE.CylinderGeometry(0.0035, 0.002, 0.05, 10),
  real.metal(0xc46a3a, { roughness: 0.35 }),
);
export const MALLET = new THREE.Group();
{
  const head = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.014, 0.03, 12),
    real.wood(0x8a5a32),
  );
  head.rotation.z = Math.PI / 2;
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.003, 0.003, 0.05, 8),
    real.wood(0x6a4428),
  );
  handle.position.y = -0.025;
  MALLET.add(head, handle);
  scene.add(CHISEL, MALLET);
  CHISEL.castShadow = true;
  shadowAll(MALLET);
}

// --- the smiths' fire with copper bars, near the quarry edge
export const FORGE = V(14, 0, 27);
export const FIRE = new THREE.Group();
{
  const y = heightAt(FORGE.x, FORGE.z);
  FORGE.y = y;
  const pit = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.2, 0.06, 20),
    real.plastic(0x6a5038, { roughness: 1, clearcoat: 0 }),
  );
  pit.position.copy(FORGE).add(V(0, 0.03, 0));
  scene.add(pit);
  const coals = noAO(
    new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0xff7a2a, toneMapped: false }),
    ),
  );
  coals.scale.y = 0.35;
  coals.position.copy(FORGE).add(V(0, 0.05, 0));
  FIRE.add(coals);
  const light = new THREE.PointLight(0xff8a3a, 2.5, 2.5, 1.6);
  light.position.copy(FORGE).add(V(0, 0.3, 0));
  FIRE.add(light);
  FIRE.userData = { coals, light };
  scene.add(FIRE);
  const smoke = makeSmoke({ seed: 8, height: 1.4, spread: 0.15 });
  smoke.position.copy(FORGE).add(V(0, 0.1, 0));
  smoke.scale.setScalar(0.5);
  scene.add(smoke);
  FIRE.userData.smoke = smoke;
  // smiths kneeling round it, one with a blowpipe
  const r = rng(31);
  FIRE.userData.smiths = [];
  for (let i = 0; i < 4; i++) {
    const p = randomPerson(r);
    const a = (i / 4) * Math.PI * 2 + 0.4;
    p.position.copy(FORGE).add(V(Math.cos(a) * 0.32, 0, Math.sin(a) * 0.32));
    p.rotation.y = Math.atan2(Math.sin(a), -Math.cos(a));
    p.scale.y = 0.75;
    scene.add(p);
    FIRE.userData.smiths.push(p);
  }
  // copper bars stacked beside the fire
  const cu = real.metal(0xc8743e, { roughness: 0.3 });
  for (let i = 0; i < 9; i++) {
    const b = new THREE.Mesh(roundedBox(0.09, 0.015, 0.025, 0.005), cu);
    b.position
      .copy(FORGE)
      .add(V(0.55 + (i % 3) * 0.004, 0.01 + Math.floor(i / 3) * 0.016, -0.05 + (i % 3) * 0.03));
    b.castShadow = true;
    scene.add(b);
  }
}
export const COPPER = FORGE.clone().add(V(0.56, 0.05, -0.02));

// --- the balance: one block against two small cars (an analogy set on a slab)
export const BAL = V(-36, 1.4, 6);
export const BALANCE = new THREE.Group();
{
  const slab = new THREE.Mesh(
    roundedBox(2.4, 1.4, 1.4, 0.05),
    real.plastic(0xd8c4a0, { roughness: 0.9, clearcoat: 0 }),
  );
  slab.position.copy(BAL).add(V(0, -0.7, 0));
  scene.add(slab);
  const wood = real.wood(0x7a5030);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.5, 12), wood);
  post.position.copy(BAL).add(V(0, 0.25, 0));
  scene.add(post);
  const beam = new THREE.Group();
  beam.position.copy(BAL).add(V(0, 0.52, 0));
  const bar = new THREE.Mesh(roundedBox(1.6, 0.04, 0.05, 0.015), wood);
  beam.add(bar);
  const pans = [];
  for (const sd of [-1, 1]) {
    const pan = new THREE.Group();
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.02, 24), wood);
    pan.add(plate);
    for (const a of [0, 2.1, 4.2]) {
      const rope = new THREE.Mesh(
        new THREE.CylinderGeometry(0.003, 0.003, 0.34, 4),
        real.fabric(0xb89a6a),
      );
      rope.position.set(Math.cos(a) * 0.12, 0.17, Math.sin(a) * 0.12);
      rope.rotation.z = Math.cos(a) * 0.32;
      rope.rotation.x = -Math.sin(a) * 0.32;
      pan.add(rope);
    }
    pan.position.set(sd * 0.75, -0.34, 0);
    beam.add(pan);
    pans.push(pan);
  }
  scene.add(beam);
  // left: the limestone block (≈ 1.3 × 1.0 × 0.9 m), right: two small cars
  const blk = new THREE.Mesh(
    roundedBox(0.13, 0.1, 0.09, 0.008),
    real.plastic(0xe6dcc6, { roughness: 0.8, clearcoat: 0 }),
  );
  blk.position.y = 0.06;
  pans[0].add(blk);
  const c1 = car(0, 0, 0xd8402e);
  const c2 = car(0, 0, 0x2e6ad8);
  for (const [c, dz] of [
    [c1, -0.09],
    [c2, 0.09],
  ]) {
    c.parent.remove(c);
    c.scale.setScalar(0.16);
    c.position.set(0, 0.01, dz);
    pans[1].add(c);
  }
  shadowAll(beam);
  shadowAll(slab);
  BALANCE.userData = { beam, pans };
}

// --- the granite boat on the flood, sailing down from the south
export const GBOAT = makeBoat({ cargo: "granit", seed: 51, crew: 8, scale: 0.6 });
GBOAT.position.set(60, FLOOD_Y - 0.02, 60);
scene.add(GBOAT);
