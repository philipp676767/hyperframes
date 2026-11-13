// #88 Türschloss — the world: an old-building stairwell at night, seen at
// the scale of a key (1 unit = 1 cm). The lock cylinder sits at the origin,
// the flat's door front is the plane z = 0, the floor is at y = -105.
// Warm wall lamp upper left (key light), cold moonlight from the stair
// window (rim), a doormat with a shopping bag, the banister going up.
// The door itself (with its x-ray lock stile) is built in scene.js so it
// can swing open.
import { THREE, onFrame, real, roundedBox, rng } from "./world.js";
import { SKIES, setSky, finishSet, fireflies, add } from "./environments.js";

const SEED = 88;
export const FLOOR = -105;

// ---------------------------------------------------------------- light
const sky = setSky({
  ...SKIES.studio,
  top: [0.05, 0.035, 0.03],
  mid: [0.09, 0.06, 0.05],
  hor: [0.14, 0.1, 0.08],
  below: [0.06, 0.045, 0.04],
  sun: [0.9, 0.7, 0.45],
  hemi: [0xffd8b0, 0x2a1d18, 1.0],
  key: [0xffd2a0, 2.6],
  keyPos: [-7, 9, 9],
  rim: [0x7f9cff, 1.1],
  fog: [160, 620],
});

const M = {
  plaster: real.plastic(0xe6d7bd, { roughness: 0.9, clearcoat: 0 }),
  plasterLow: real.plastic(0x7a5b46, { roughness: 0.85, clearcoat: 0 }),
  trim: real.gloss(0xf1ece2, { roughness: 0.35 }),
  floor: real.wood(0x7a4b2c, { roughness: 0.55 }),
  floorDark: real.wood(0x5e3820, { roughness: 0.55 }),
  coir: real.fabric(0x9a7446),
  rail: real.wood(0x4a2a18, { roughness: 0.4, clearcoat: 0.6 }),
  step: real.wood(0x6a3f24, { roughness: 0.5 }),
  brass: real.metal(0xd7b46a, { roughness: 0.32 }),
  paper: real.fabric(0xc9a477),
  bread: real.plastic(0xd99a52, { roughness: 0.8, clearcoat: 0 }),
  leek: real.plastic(0x6fa04a, { roughness: 0.6 }),
  lampGlass: new THREE.MeshStandardMaterial({
    color: 0xfff1d6,
    emissive: 0xffc27a,
    emissiveIntensity: 2.2,
  }),
  moon: new THREE.MeshStandardMaterial({
    color: 0x2b3f78,
    emissive: 0x2a4596,
    emissiveIntensity: 0.9,
  }),
  inside: new THREE.MeshStandardMaterial({
    color: 0xffd9a8,
    emissive: 0xffb36b,
    emissiveIntensity: 1.3,
  }),
};
export { M as SET_MAT };

const box = (w, h, d, mat, x, y, z, r = 0.6) => {
  const m = new THREE.Mesh(roundedBox(w, h, d, r, 2), mat);
  return add(m, x, y, z);
};

// ---------------------------------------------------------------- walls
// wall face at z = -2, a 90 x 205 door opening from x = -84.5 to 5.5
const WZ = -6;
box(220, 400, 8, M.plaster, -84.5 - 8 - 110, 60, WZ, 0.2); // left of the door
box(260, 400, 8, M.plaster, 13.5 + 130, 60, WZ, 0.2); // right of the door
box(110, 160, 8, M.plaster, -39.5, 108 + 80, WZ, 0.2); // above the door
// dado: darker painted lower wall + a picture rail line
box(220, 95, 8.6, M.plasterLow, -84.5 - 8 - 110, FLOOR + 47.5, WZ, 0.2);
box(260, 95, 8.6, M.plasterLow, 13.5 + 130, FLOOR + 47.5, WZ, 0.2);
box(220, 2.4, 10, M.trim, -84.5 - 8 - 110, FLOOR + 95, WZ, 0.8);
box(260, 2.4, 10, M.trim, 13.5 + 130, FLOOR + 95, WZ, 0.8);
// skirting
box(220, 12, 10, M.trim, -84.5 - 8 - 110, FLOOR + 6, WZ, 0.8);
// door casing (Zarge), proud of the wall
box(8, 213, 5, M.trim, -88.5, FLOOR + 106.5, -1.5, 0.9);
box(8, 213, 5, M.trim, 9.5, FLOOR + 106.5, -1.5, 0.9);
box(106, 8, 5, M.trim, -39.5, 104, -1.5, 0.9);
// apartment hallway behind the door: warm light (seen when it opens)
box(100, 210, 2, M.inside, -39.5, 0, -150, 0.2);
box(2, 210, 150, M.inside, -88, 0, -75, 0.2);
box(2, 210, 150, M.inside, 9, 0, -75, 0.2);

// ---------------------------------------------------------------- floor
{
  const g = new THREE.Group();
  const r = rng(SEED);
  for (let i = 0; i < 40; i++) {
    const x = -420 + i * 21;
    const m = new THREE.Mesh(roundedBox(20.4, 3, 640, 0.6, 2), r() < 0.5 ? M.floor : M.floorDark);
    m.position.set(x, FLOOR - 1.5, 200 + (r() - 0.5) * 30);
    m.receiveShadow = true;
    g.add(m);
  }
  add(g, 0, 0, 0);
}
// doormat (coir) + a shopping bag with bread and a leek
box(78, 2.2, 48, M.coir, -40, FLOOR + 1.1, 30, 1);
{
  const bag = new THREE.Group();
  const b = new THREE.Mesh(roundedBox(32, 40, 18, 1.5, 3), M.paper);
  b.position.y = 20;
  bag.add(b);
  const bread = new THREE.Mesh(new THREE.CapsuleGeometry(4, 34, 8, 24), M.bread);
  bread.position.set(-6, 46, 0);
  bread.rotation.z = 0.35;
  bag.add(bread);
  const leek = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.6, 46, 24), M.leek);
  leek.position.set(8, 52, 2);
  leek.rotation.z = -0.25;
  bag.add(leek);
  add(bag, 34, FLOOR, 36);
  bag.rotation.y = -0.4;
}

// ---------------------------------------------------------------- stairs + banister
{
  const g = new THREE.Group();
  for (let i = 0; i < 16; i++) {
    const s = new THREE.Mesh(roundedBox(30, 18, 100, 1, 2), M.step);
    s.position.set(90 + i * 28, FLOOR + 9 + i * 18, 60);
    s.receiveShadow = s.castShadow = true;
    g.add(s);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 90, 16), M.rail);
    post.position.set(90 + i * 28, FLOOR + 18 + i * 18 + 45, 112);
    g.add(post);
  }
  const len = Math.hypot(16 * 28, 16 * 18);
  const rail = new THREE.Mesh(new THREE.CapsuleGeometry(3, len, 8, 24), M.rail);
  rail.rotation.z = Math.PI / 2 - Math.atan2(18, 28);
  rail.position.set(90 + 7.5 * 28, FLOOR + 18 + 7.5 * 18 + 92, 112);
  g.add(rail);
  // newel post
  box(8, 110, 8, M.rail, 70, FLOOR + 55, 112, 1.2);
  add(g, 0, 0, 0);
}
// stair window with moonlight
box(90, 150, 2, M.moon, 250, 140, WZ + 4.5, 0.3);
box(4, 150, 4, M.trim, 250, 140, WZ + 6, 0.6);
box(90, 4, 4, M.trim, 250, 140, WZ + 6, 0.6);

// ---------------------------------------------------------------- practicals
// wall lamp (opal globe on a brass arm), upper left
box(10, 14, 3, M.brass, -150, 120, WZ + 5, 1);
{
  const glow = new THREE.Mesh(new THREE.SphereGeometry(14, 48, 32), M.lampGlass);
  glow.userData.noAO = true;
  add(glow, -150, 102, WZ + 20, false);
}
// stairwell light switch with the glowing orange ring + door bell
box(9, 9, 2, M.trim, 30, 8, WZ + 5, 1);
{
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.2, 0.45, 12, 40),
    new THREE.MeshStandardMaterial({ color: 0xff9a3a, emissive: 0xff7a1a, emissiveIntensity: 1.6 }),
  );
  ring.userData.noAO = true;
  add(ring, 30, 8, WZ + 6.2, false);
  onFrame((t) => (ring.material.emissiveIntensity = 1.2 + 0.5 * Math.sin(t * 2.4)));
}
box(7, 7, 2.4, M.brass, 30, 22, WZ + 5, 1);

// ---------------------------------------------------------------- life
// moths around the lamp, dust drifting in its light near the lock
fireflies(14, { area: [-180, -120, 80, 130, -2, 30], color: 0xffe8c0, seed: SEED, size: 0.9 });
fireflies(60, { area: [-30, 30, -25, 25, 2, 40], color: 0xffe2b0, seed: SEED + 1, size: 0.07 });

finishSet({ ground: 0x6a4026 });
export { sky };
