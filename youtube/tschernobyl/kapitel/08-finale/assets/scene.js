// Finale: the core recap; empty Prypjat at dusk with a memorial; the yellow
// Ferris wheel; a calm end-screen orbit.
import {
  THREE,
  shotCamera,
  renderFrame,
  start,
  highlights,
  labels,
  ramp,
  smooth,
  ground,
  real,
  roundedBox,
  rng,
} from "./world.js";
import { P, CORE } from "./set.js";
import { shadowAll } from "./welt.js";
import { T, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);
const applyCamera = shotCamera(shots);
// nobody lives here any more
P.people.forEach((p) => (p.visible = false));
P.buses.visible = false;
// a memorial stone with red carnations on the square
const mem = new THREE.Group();
const stone = new THREE.Mesh(
  roundedBox(0.12, 0.3, 0.05, 0.01),
  real.plastic(0x2e3032, { roughness: 0.35, clearcoat: 0.4 }),
);
stone.position.y = 0.15;
mem.add(stone);
const plate = new THREE.Mesh(
  roundedBox(0.12, 0.06, 0.004, 0.002),
  real.metal(0xb89a5a, { roughness: 0.3 }),
);
plate.position.set(0, 0.2, 0.026);
mem.add(plate);
const r = rng(4);
for (let i = 0; i < 14; i++) {
  const st = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0015, 0.0015, 0.05, 4),
    real.plastic(0x3a6a2a),
  );
  const x = (r() - 0.5) * 0.12;
  st.position.set(x, 0.025, 0.06 + r() * 0.02);
  st.rotation.z = (r() - 0.5) * 0.8;
  mem.add(st);
  const fl = new THREE.Mesh(new THREE.IcosahedronGeometry(0.007, 1), real.fabric(0xc81a1a));
  fl.position.set(x + st.rotation.z * -0.02, 0.05, st.position.z);
  mem.add(fl);
}
shadowAll(mem);
mem.scale.setScalar(1.6);
mem.position.set(2.5, 0, 5);
ground.add(mem);
function renderAt(t) {
  P.wheel.userData.update(0);
  // the core recap: steam, brake released, tips glowing
  const steam = smooth(ramp(t, T.der, T.seine));
  const out = smooth(ramp(t, T.seine, T.und));
  const tip = smooth(ramp(t, T.und, T.und + 1.5));
  CORE.setCore(t, {
    power: 0.6 + steam * 0.8 + tip * 3 * (1 - ramp(t, T.fach, T.akimow)),
    ins: 0.6 - out * 0.55 + tip * 0.2,
    voidK: 0.2 + steam * 0.5,
    tipK: tip,
    turbineSpeed: 0.5,
  });
  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
