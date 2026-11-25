// Chapter 6: the workers (main world, construction): a crowd, the cemetery
// with a stumbling horse, a healed bone in the sand, the town with bakeries,
// cattle and sheep, the relieving chamber with the gangs' red marks.
import { THREE, scene, rng, real, roundedBox, V, flat } from "./world.js";
import { cow, sheep } from "./props.js";
import {
  buildGiza,
  buildChamber,
  randomPerson,
  makeSmoke,
  heightAt,
  CEMETERY,
  TOWN,
  shadowAll,
  noAO,
} from "./welt.js";
export const G = buildGiza({ time: "tag", state: "bau", level: 0.66 });
export const CH = buildChamber(V(0, -160, 0));

// --- a crowd hauling at the foot of the pyramid
const r = rng(61);
export const CROWD = [];
for (let i = 0; i < 220; i++) {
  const p = randomPerson(r);
  p.position.set(-12 + r() * 24, 0, 12.5 + r() * 7);
  p.rotation.y = r() * 6.28;
  p.userData.ph = r() * 3;
  scene.add(p);
  CROWD.push(p);
}
// --- a horse at the cemetery wall (1990)
export const HORSE = new THREE.Group();
{
  const coat = real.fabric(0x6a4a30);
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.12, 6, 12), coat);
  body.rotation.z = Math.PI / 2;
  body.position.y = 0.13;
  HORSE.add(body);
  const neck = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.07, 6, 10), coat);
  neck.position.set(-0.1, 0.19, 0);
  neck.rotation.z = -0.6;
  HORSE.add(neck);
  const head = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.05, 6, 10), coat);
  head.position.set(-0.14, 0.22, 0);
  head.rotation.z = 1.1;
  HORSE.add(head);
  HORSE.userData.legs = [];
  for (const [x, z] of [
    [-0.07, -0.03],
    [-0.07, 0.03],
    [0.07, -0.03],
    [0.07, 0.03],
  ]) {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.009, 0.08, 4, 8), coat);
    leg.position.set(x, 0.05, z);
    HORSE.add(leg);
    HORSE.userData.legs.push(leg);
  }
  const rider = randomPerson(r, { coat: 0x4a6a8a, shirt: true });
  rider.position.set(0.0, 0.12, 0);
  rider.scale.setScalar(0.9);
  HORSE.add(rider);
  shadowAll(HORSE);
  const x = CEMETERY.x - 4;
  const z = CEMETERY.z - 4.5;
  HORSE.position.set(x, heightAt(x, z), z);
  HORSE.userData.base = HORSE.position.clone();
  scene.add(HORSE);
  // the low mudbrick wall it stumbles over
  const wall = new THREE.Mesh(
    roundedBox(0.4, 0.035, 0.05, 0.01),
    real.plastic(0xa88c68, { roughness: 1, clearcoat: 0 }),
  );
  wall.position.set(x - 0.2, heightAt(x - 0.2, z) + 0.012, z);
  wall.rotation.y = Math.PI / 2;
  scene.add(wall);
}
// --- a healed bone in the sand, a brush
export const BONE = V(CEMETERY.x - 1, 0, CEMETERY.z + 1.5);
{
  BONE.y = heightAt(BONE.x, BONE.z);
  const pit = new THREE.Mesh(roundedBox(0.5, 0.04, 0.35, 0.01), real.fabric(0xc8a874));
  pit.position.copy(BONE).add(V(0, -0.015, 0));
  scene.add(pit);
  const boneMat = real.ceramic(0xe8dcc0, { roughness: 0.6, clearcoat: 0 });
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.2, 14), boneMat);
  shaft.rotation.z = Math.PI / 2;
  shaft.position.copy(BONE).add(V(0, 0.012, 0));
  scene.add(shaft);
  for (const sd of [-1, 1]) {
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.016, 14, 10), boneMat);
    knob.scale.set(0.8, 0.8, 1.2);
    knob.position.copy(BONE).add(V(sd * 0.1, 0.014, 0));
    scene.add(knob);
  }
  // the healed fracture: a thickened ring
  const callus = new THREE.Mesh(new THREE.TorusGeometry(0.009, 0.004, 8, 16), boneMat);
  callus.rotation.y = Math.PI / 2;
  callus.position.copy(BONE).add(V(0.02, 0.012, 0));
  scene.add(callus);
  const brush = new THREE.Mesh(roundedBox(0.01, 0.006, 0.07, 0.002), real.wood(0x8a5a32));
  brush.position.copy(BONE).add(V(-0.05, 0.01, 0.07));
  brush.rotation.y = 0.6;
  scene.add(brush);
}
export const BONE_TIP = BONE.clone().add(V(0.02, 0.02, 0));
// --- bakery: bell-shaped bread pots in the embers, beer jars, smoke
export const BAKE = V(TOWN.x - 3, -3.1, TOWN.z + 7);
export const BAKERY = new THREE.Group();
{
  const pot = real.ceramic(0xa8603a, { roughness: 0.75, clearcoat: 0 });
  const ember = noAO(
    new THREE.Mesh(
      new THREE.CircleGeometry(0.35, 24),
      new THREE.MeshBasicMaterial({ color: 0xff6a2a, toneMapped: false }),
    ),
  );
  ember.rotation.x = -Math.PI / 2;
  ember.position.copy(BAKE).add(V(0, 0.005, 0));
  BAKERY.add(ember);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const rr = 0.12 + (i % 2) * 0.12;
    const b = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.08, 14), pot);
    b.position.copy(BAKE).add(V(Math.cos(a) * rr, 0.04, Math.sin(a) * rr));
    BAKERY.add(b);
  }
  for (let i = 0; i < 6; i++) {
    const j = new THREE.Mesh(new THREE.SphereGeometry(0.04, 14, 10), pot);
    j.scale.set(1, 1.4, 1);
    j.position.copy(BAKE).add(V(0.6 + (i % 3) * 0.09, 0.05, -0.2 + Math.floor(i / 3) * 0.1));
    BAKERY.add(j);
  }
  const light = new THREE.PointLight(0xff8a3a, 2.2, 2.4, 1.6);
  light.position.copy(BAKE).add(V(0, 0.25, 0));
  BAKERY.add(light);
  const smoke = makeSmoke({ seed: 66, height: 1.6, spread: 0.2 });
  smoke.position.copy(BAKE).add(V(0, 0.1, 0));
  smoke.scale.setScalar(0.6);
  BAKERY.add(smoke);
  BAKERY.userData = { light, smoke, bakers: [] };
  for (let i = 0; i < 4; i++) {
    const p = randomPerson(r, { coat: 0xf2ece0 });
    const a = (i / 4) * Math.PI * 2;
    p.position.copy(BAKE).add(V(Math.cos(a) * 0.48, 0, Math.sin(a) * 0.48));
    p.rotation.y = Math.atan2(Math.sin(a), -Math.cos(a));
    BAKERY.add(p);
    BAKERY.userData.bakers.push(p);
  }
  shadowAll(BAKERY);
  scene.add(BAKERY);
}
// --- cattle and sheep in a pen beside the town
export const PEN = V(TOWN.x + 8, -3.1, TOWN.z + 4);
export const HERD = [];
{
  for (let i = 0; i < 9; i++) {
    const a = i < 4 ? cow(i) : sheep(i);
    a.scale.setScalar(i < 4 ? 0.12 : 0.09);
    a.position.copy(PEN).add(V((r() - 0.5) * 1.6, 0, (r() - 0.5) * 1.2));
    a.rotation.y = r() * 6.28;
    if (i < 4) {
      // Egyptian cattle: brown, not black-and-white
      const brown = flat(0xa86a40);
      const dark = flat(0x6a4028);
      a.traverse((o) => {
        if (!o.isMesh || !o.material.color) return;
        const h = o.material.color.getHex();
        if (h === 0xf7f4ee) o.material = brown;
        else if (h === 0x2e2a2c) o.material = dark;
      });
    }
    scene.add(a);
    HERD.push(a);
  }
  const fenceMat = real.wood(0x8a6a44);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.12, 6), fenceMat);
    post.position.copy(PEN).add(V(Math.cos(a) * 1.0, 0.06, Math.sin(a) * 0.8));
    scene.add(post);
  }
}
// --- the team posing in front of the pyramid (the football joke)
export const TEAM = [];
for (let i = 0; i < 11; i++) {
  const p = randomPerson(r);
  p.position.set(-0.9 + (i % 6) * 0.17 + (i > 5 ? 0.08 : 0), 0, 15.3 + (i > 5 ? 0.18 : 0));
  p.rotation.y = -Math.PI / 2;
  scene.add(p);
  TEAM.push(p);
}
