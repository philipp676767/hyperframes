// TEMPLATE set: this video's own world (SKILL.md 1b). Rewrite it for every
// video — a new place that tells the topic at a glance, built from the kit
// (environments.js), the props (props.js) and whatever the topic needs on
// top, in the same toy low-poly style. Never reuse the last video's set;
// ideas and code to borrow: references/set-beispiele.js.
//
// Demo topic "Licht aus Draht" (candle → light bulb): a town park at blue
// hour, the first lamps on, fairy lights over the path, fireflies — a
// world that is all about light.
import { THREE, flat, ground, onFrame } from "./world.js";
import {
  SKIES,
  setSky,
  finishSet,
  terrain,
  pathStrip,
  pond,
  lightString,
  fireflies,
  meadow,
  tree,
  pine,
  F,
} from "./environments.js";
import { place, scatter, bench, lamp, bush, flowerBed, bin } from "./props.js";

const SEED = 1; // new per video (e.g. the episode number)

// ---------------------------------------------------------------- light
// own palette: blue hour, a warm band at the horizon, the first stars
const sky = setSky({
  ...SKIES.abend,
  top: [0.12, 0.14, 0.38],
  mid: [0.36, 0.3, 0.6],
  hor: [1.0, 0.66, 0.46],
  stars: 0.35,
  clouds: 10,
});

// ---------------------------------------------------------------- ground
terrain(0x6fae4a, { seed: SEED, amt: 0.12, warm: 0.4, hills: 7 });
pathStrip(
  [
    [-34, -10],
    [-14, -7.2],
    [0, -6.6],
    [13, -7.4],
    [34, -10.5],
  ],
  { width: 2.2, color: 0xcdb892, seed: SEED },
);
pathStrip(
  [
    [10, 9],
    [9.2, 2],
    [10.5, -6.8],
  ],
  { width: 1.4, color: 0xcdb892, seed: SEED + 1 },
);
pond(-10.5, 3.2, { rx: 3.0, rz: 1.9, seed: SEED });
meadow({ n: 380, rMin: 2.6, rMax: 22, seed: SEED, keep: (x, z) => z > -5.6 || z < -8.6 });

// ---------------------------------------------------------------- planting
[
  [-7.5, -11, 1.15],
  [-3, -13.5, 1.3],
  [3.5, -12.5, 1.2],
  [-13, -4.5, 1.0],
  [14.5, -3.5, 1.1],
  [-16, 4, 1.0],
  [17, 6, 1.05],
  [-11, 11, 0.95],
].forEach(([x, z, s], i) => tree(x, z, s, SEED + i));
[
  [-19, -14],
  [20, -15],
  [-24, -6],
].forEach(([x, z], i) => pine(x, z, 1.4, SEED + 20 + i));
scatter((i) => bush(SEED + i), 8, {
  rMin: 9,
  rMax: 19,
  seed: SEED + 3,
  keep: (x, z) => z > -5.5 || z < -9,
});
place(flowerBed(SEED), 6.8, -4.6);
place(flowerBed(SEED + 1, [0xffd84a, 0xffffff]), -6.6, -4.4, 0.4, 0.8);

// ---------------------------------------------------------------- street furniture
for (const x of [-13, -6, 6, 13]) place(lamp({ on: true }), x, -5.3);
place(bench(), -9.5, -5.2);
place(bench(), 2.5, -8.4, Math.PI);
place(bin(), -11.2, -5.4);

// ---------------------------------------------------------------- hero piece
// A bandstand with fairy lights behind the stage — the place people know
// from their own town park, glowing at dusk.
{
  const g = new THREE.Group();
  const white = flat(0xf6f1ea);
  const roofMat = flat(0x3f6f8f);
  const base = F(new THREE.CylinderGeometry(3.2, 3.4, 0.6, 8), flat(0xd8d2cc), 0.05, 2);
  base.position.y = 0.3;
  g.add(base);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 2.8, 6), white);
    post.position.set(Math.cos(a) * 2.9, 2.0, Math.sin(a) * 2.9);
    g.add(post);
  }
  const roof = F(new THREE.ConeGeometry(3.8, 1.8, 8), roofMat, 0.06, 3);
  roof.position.y = 4.3;
  g.add(roof);
  const tip = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 8, 6),
    flat(0xffd23f, { metalness: 0.6, roughness: 0.3 }),
  );
  tip.position.y = 5.3;
  g.add(tip);
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = o.receiveShadow = true;
  });
  g.position.set(9.5, 0, -15);
  ground.add(g);
  for (let i = 0; i < 8; i++) {
    const a0 = (i / 8) * Math.PI * 2;
    const a1 = ((i + 1) / 8) * Math.PI * 2;
    lightString(
      [9.5 + Math.cos(a0) * 3.3, 3.4, -15 + Math.sin(a0) * 3.3],
      [9.5 + Math.cos(a1) * 3.3, 3.4, -15 + Math.sin(a1) * 3.3],
      { n: 5, sag: 0.25 },
    );
  }
}
// fairy lights across the path, from tree to tree
lightString([-7.2, 3.3, -10.6], [3.3, 3.4, -12.1], { n: 18, sag: 0.7 });

// ---------------------------------------------------------------- life
fireflies(36, { area: [-14, 14, 0.4, 2.6, -12, 8], seed: SEED });
// the pond's ducks paddle slowly in circles
{
  const duck = (c) => {
    const d = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), flat(c));
    body.scale.set(1.3, 0.8, 1);
    d.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), flat(0x2f6b4a));
    head.position.set(0.24, 0.2, 0);
    d.add(head);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 5), flat(0xffb347));
    beak.rotation.z = -Math.PI / 2;
    beak.position.set(0.38, 0.18, 0);
    d.add(beak);
    ground.add(d);
    return d;
  };
  const ducks = [duck(0x9a7a5a), duck(0xf4efe6)];
  onFrame((t) =>
    ducks.forEach((d, i) => {
      const a = t * 0.12 + i * 2.6;
      d.position.set(-10.5 + Math.cos(a) * 1.8, 0.08, 3.2 + Math.sin(a) * 1.1);
      d.rotation.y = -a - Math.PI / 2;
    }),
  );
}

finishSet({ ground: 0x6fae4a });
export { sky };
