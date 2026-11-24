// Chapter 5: the pyroclastic flows.
import {
  THREE,
  shotCamera,
  renderFrame,
  start,
  highlights,
  labels,
  ramp,
  smooth,
  V,
  real,
  scene,
  roundedBox,
} from "./world.js";
import { makeFlow, slopePath, makePerson, walk, makeShip, makePumice, coastZ } from "./welt.js";
import { P } from "./set.js";
import { T, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);
const applyCamera = shotCamera(shots);
for (const p of P.people) p.visible = false;

// flows: down the south flank to the north wall, then through the streets
const flowM = makeFlow(slopePath(V(1.5, 0, -11)), { width: 7, n: 760 });
scene.add(flowM);
const flowC = makeFlow([V(20, 0, 2.4), V(12, 0, 2.4), V(5, 0, 2.4), V(-2, 0, 2.4)], {
  width: 3,
  n: 500,
  scale: 0.55,
  seed: 4,
});
scene.add(flowC);
const flowW = makeFlow(slopePath(V(-6, 0, 6), { bend: 6 }), { width: 10, n: 760, seed: 9 });
scene.add(flowW);
const ash = makePumice({ n: 1600, size: 10, top: 5, scale: 0.4, seed: 6 });
scene.add(ash);

// the fountain (side set): a basin, a jet that loses its pressure
const fo = new THREE.Group();
fo.position.set(0, -120, 0);
scene.add(fo);
{
  const room = new THREE.Mesh(
    new THREE.SphereGeometry(14, 24, 12),
    new THREE.MeshBasicMaterial({ color: 0x14110f, side: THREE.BackSide, fog: false }),
  );
  fo.add(room);
  const stone = real.plastic(0xb8ac96, { roughness: 0.9, clearcoat: 0 });
  const floor = new THREE.Mesh(
    roundedBox(9, 0.1, 9, 0.03),
    real.plastic(0x6a625a, { roughness: 0.95, clearcoat: 0 }),
  );
  floor.position.y = -0.05;
  fo.add(floor);
  for (let i = 0; i < 4; i++) {
    const w = new THREE.Mesh(roundedBox(1.7, 0.42, 0.18, 0.04), stone);
    w.position.set(Math.sin((i * Math.PI) / 2) * 0.76, 0.21, Math.cos((i * Math.PI) / 2) * 0.76);
    w.rotation.y = (i * Math.PI) / 2;
    fo.add(w);
  }
  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(1.4, 1.4),
    new THREE.MeshStandardMaterial({ color: 0x3a6a78, roughness: 0.1 }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.3;
  fo.add(water);
  const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.5, 16), stone);
  spout.position.y = 0.45;
  fo.add(spout);
  const key = new THREE.SpotLight(0xfff0dc, 60, 20, 0.6, 0.5, 1.4);
  key.position.set(3, 6, 4);
  key.target.position.set(0, -120, 0);
  fo.add(key);
  scene.add(key.target);
  fo.add(new THREE.HemisphereLight(0xd8e4ff, 0x302820, 0.8));
}
const N = 600;
const drops = new THREE.InstancedMesh(
  new THREE.SphereGeometry(1, 8, 6),
  new THREE.MeshStandardMaterial({
    color: 0xcfe8f0,
    roughness: 0.1,
    transparent: true,
    opacity: 0.85,
  }),
  N,
);
fo.add(drops);
const D = [];
for (let i = 0; i < N; i++)
  D.push({ ph: i / N, a: (i * 2.39996) % 6.283, s: 0.012 + ((i * 7) % 10) * 0.002 });
const m4 = new THREE.Matrix4();
const q = new THREE.Quaternion();

// people
const walker = makePerson({ coat: 0x8a7a5a });
const cloth = new THREE.Mesh(
  new THREE.SphereGeometry(0.024, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.7),
  new THREE.MeshStandardMaterial({ color: 0xd8d0c0, roughness: 1, side: THREE.DoubleSide }),
);
cloth.position.y = 0.174;
walker.add(cloth);
scene.add(walker);
const stab = [];
for (let i = 0; i < 6; i++) {
  const p = makePerson({ coat: [0xe9e0cc, 0xc9a46a, 0x6f7f8c, 0x8c5a3a, 0xd8c8a8, 0x7d8a52][i] });
  const pillow = new THREE.Mesh(roundedBox(0.05, 0.016, 0.05, 0.007), real.fabric(0xe8dcc8));
  pillow.position.y = 0.2;
  p.add(pillow);
  p.userData.i = i;
  scene.add(p);
  stab.push(p);
}
const pliny = makePerson({ coat: 0xe9e0cc, cloak: 0xa8432f, hair: 0xcfcac0 });
scene.add(pliny);
const ships = [0, 1].map((i) => {
  const s = makeShip();
  s.position.set(30 + i * 5, -0.06, 25 + i);
  s.rotation.y = 0.4;
  scene.add(s);
  return s;
});

function renderAt(t) {
  const morning = t >= T.am - 0.2;
  P.mood(morning ? "morgen" : "dunkel", morning ? 0.95 : 0);
  P.setPumice(t >= T.weitere - 0.2 ? 0.28 + smooth(ramp(t, T.weitere, T.danach + 1)) * 0.6 : 0.28);
  P.dust(1);
  P.column.userData.update(t + 300, {
    grow: 1,
    k: t < T.am - 0.2 ? 1 : 0.6,
    drift: 1.3,
    collapse: t >= T.sie - 0.2 ? Math.min(0.9, 0.3 + smooth(ramp(t, T.sie, T.man)) * 0.6) : 0.3,
    glow: morning ? 0.05 : 0.22,
  });
  P.lightning.userData.update(t, morning ? 0 : 1);
  // the mountain flow: 0–23 s descending, then again on the "Weil" shots
  const pM =
    t < T.man
      ? 0.15 + smooth(ramp(t, 0, T.man)) * 0.45
      : t < T.am
        ? 0.3 + smooth(ramp(t, T.weil, T.weg)) * 0.55
        : smooth(ramp(t, T.am, T.erreicht + 3)) * 0.98;
  const glow = morning ? 0.12 : 0.34;
  flowM.userData.update(
    t,
    pM,
    (t >= T.man - 0.2 && t < T.weil - 0.2) || t >= T.danach - 0.2 ? 0 : 1,
    glow,
  );
  flowC.userData.update(
    t,
    t >= T.weg - 0.2 && t < T.am
      ? smooth(ramp(t, T.weg, T.am)) * 0.9
      : t >= T.fuer - 0.2 && t < T.stabiae
        ? 1
        : 0,
    1,
    glow,
  );
  flowW.userData.update(
    t,
    t >= T.fuer - 0.2 && t < T.stabiae
      ? 0.6 + smooth(ramp(t, T.fuer, T.stabiae)) * 0.4
      : t >= T.weitere - 0.2 && t < T.danach - 0.2
        ? 0.5 + smooth(ramp(t, T.weitere, T.danach)) * 0.5
        : 0,
    1,
    glow,
  );
  ash.userData.update(t, morning ? 0.8 : 0.4, t >= T.stabiae ? V(32, 0, 19) : V(4.5, 0.28, 4));
  // fountain: full jet, the pressure drops at "Druck", water spreads out at "schießt"
  const press = 1 - smooth(ramp(t, T.druck, T.druck + 1.4));
  const spread = smooth(ramp(t, T.druck + 0.6, T.schiesst + 1.5));
  for (let i = 0; i < N; i++) {
    const d = D[i];
    const u = (d.ph + t * 0.6) % 1;
    const h = 1.6 * press + 0.12;
    let x;
    let y;
    let z;
    if (u < 0.5) {
      const k = u / 0.5;
      x = Math.cos(d.a) * 0.04 * k;
      z = Math.sin(d.a) * 0.04 * k;
      y = 0.7 + h * (1 - (1 - k) * (1 - k));
    } else {
      const k = (u - 0.5) / 0.5;
      const r = 0.05 + k * (0.15 + spread * 3.2);
      x = Math.cos(d.a) * r;
      z = Math.sin(d.a) * r;
      y = Math.max(0.04 + (spread > 0.3 ? 0 : 0.3), 0.7 + h - h * k * k * 1.3);
    }
    m4.compose(V(x, y, z), q, V(d.s, d.s, d.s));
    drops.setMatrixAt(i, m4);
  }
  drops.instanceMatrix.needsUpdate = true;
  // the walker (from behind) in the morning street
  walker.visible = t >= T.wer - 0.2 && t < T.fuer - 0.2;
  walker.position.set(6.0 - (t - T.wer) * 0.07, 0.33, 2.4);
  walker.rotation.y = Math.PI;
  walk(walker, t * 1.6, 0.8);
  // Stabiae: people to the beach, the sea rough
  P.setSea(t >= T.stabiae ? 1.4 : 0.35);
  stab.forEach((p, i) => {
    p.visible = t >= T.stabiae && t < T.dort - 0.2;
    const px = 30 + i * 0.35;
    p.position.set(px, 0.03, coastZ(px) - 1.6 + (((t - T.stabiae) * 0.08 + i * 0.13) % 1.2));
    p.rotation.y = -Math.PI / 2;
    walk(p, t * 2 + i, 1);
  });
  ships.forEach((s, i) => {
    s.rotation.z = Math.sin(t * 1.3 + i) * 0.12;
    s.rotation.x = Math.sin(t * 0.9 + i) * 0.08;
    s.position.y = -0.06 + Math.sin(t * 1.1 + i) * 0.08;
  });
  pliny.visible = t >= T.dort - 0.2 && t < T.weitere - 0.2;
  pliny.position.set(32.2, 0.03, coastZ(32.2) - 0.5);
  pliny.rotation.set(0, -2.4, t > T.dort + 1.5 ? -0.25 : 0);
  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
