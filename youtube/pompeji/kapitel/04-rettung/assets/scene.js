// Chapter 4: Pliny's rescue voyage and the first flow (Herculaneum).
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
} from "./world.js";
import { makePerson, makeShip, makePumice, HERC, makeFlow, slopePath } from "./welt.js";
import { P } from "./set.js";
import { T, shots, LABELS, HIGHLIGHTS, COLLAPSE } from "./beats.js";

highlights(HIGHLIGHTS);
const applyCamera = shotCamera(shots);
for (const p of P.people) p.visible = false;

// the fleet: moored at Misenum, then rowing across the bay
const ships = [0, 1, 2].map(() => makeShip());
ships.forEach((s) => scene.add(s));
// Pliny (red cloak) + helmsman on the lead ship's stern
const pliny = makePerson({ coat: 0xe9e0cc, cloak: 0xa8432f, hair: 0xcfcac0 });
const helm = makePerson({ coat: 0x8c5a3a });
pliny.position.set(1.4, 0.32, 0.05);
pliny.rotation.y = Math.PI;
helm.position.set(1.8, 0.32, -0.1);
helm.rotation.y = 0;
ships[0].add(pliny, helm);
// Pliny at the pier before boarding
const onPier = makePerson({ coat: 0xe9e0cc, cloak: 0xa8432f, hair: 0xcfcac0 });
onPier.position.set(-72.3, 0.2, 42.3);
onPier.rotation.y = 2.2;
scene.add(onPier);
const pier = new THREE.Mesh(
  new THREE.BoxGeometry(1.2, 0.2, 5),
  real.plastic(0x9a8c74, { roughness: 0.95, clearcoat: 0 }),
);
pier.position.set(-72.6, 0.06, 43.2);
pier.rotation.y = 0.6;
scene.add(pier);
const rain = makePumice({ n: 2000, size: 14, top: 6, scale: 1.4, seed: 5 });
scene.add(rain);
// a lit window at Stabiae
const win = new THREE.PointLight(0xffb060, 0, 4, 1.5);
win.position.set(31, 0.4, 17.4);
scene.add(win);
// torches in the boat houses (small warm lights, no figures)
const torches = [];
for (let i = 0; i < 4; i++) {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(0.02, 8, 6),
    new THREE.MeshBasicMaterial({ color: 0xffb04a, toneMapped: false }),
  );
  P.herc.add(m);
  m.position.set(-2.7 + i * 1.8, 0.25, 1.1);
  torches.push(m);
}
const flow = makeFlow(slopePath(HERC.clone().add(V(1, 0, 1))), { width: 5 });
scene.add(flow);

function shipAt(t, i) {
  // moored → crossing (Misenum → Herculaneum coast) → Stabiae
  if (t < T.er - 0.2) return { p: V(-74.5 + i * 2.2, -0.06, 41 - i * 1.6), r: 0.6, row: 0 };
  if (t < T.kueste - 0.2) {
    const u = t - (T.er - 0.2);
    return { p: V(-41.5 + u * 0.25 - i * 2.6, -0.06, 22.5 - u * 0.12 + i * 2.4), r: 0.45, row: 1 };
  }
  const u = t - (T.kueste - 0.2);
  return { p: V(26.5 - i * 3 + u * 0.15, -0.06, 22.5 + i * 1.5 - u * 0.1), r: -0.3, row: 0.6 };
}

function renderAt(t) {
  // light: afternoon at Misenum, dark from the crossing on
  const dark = t < T.er - 0.2 ? 0.25 : t < T.jetzt ? 0.85 : 0.9;
  P.mood("dunkel", dark);
  P.column.userData.update(t + 260, {
    grow: 1,
    k: 1,
    drift: 1.2,
    collapse: t >= COLLAPSE - 0.3 ? smooth(ramp(t, COLLAPSE - 0.3, COLLAPSE + 5)) * 0.8 : 0,
    glow: t >= T.jetzt - 0.2 ? 0.22 : 0.05,
  });
  P.lightning.userData.update(t * 1.3, dark > 0.5 ? 1 : 0);
  P.setPumice(0.1);
  P.dust(0.8);
  ships.forEach((s, i) => {
    const st = shipAt(t, i);
    s.position.copy(st.p);
    s.rotation.y = st.r;
    s.userData.row(t + i * 0.3, st.row);
  });
  onPier.visible = t < T.kurz;
  // stone rain over the crossing
  const shipC = ships[0].position;
  rain.userData.update(
    t,
    t >= T.er - 0.2 && t < T.kueste - 0.2 ? 1 : 0,
    V(shipC.x, 0, shipC.z),
    -0.1,
  );
  P.pumice.userData.update(t, t >= T.denn - 0.2 ? 0.8 : 0, V(3, 0, 3));
  win.intensity = t >= T.dort - 0.2 && t < T.jetzt ? 2.5 : 0;
  // the flow: from the collapse down to Herculaneum
  flow.userData.update(
    t,
    t >= T.was - 0.3 ? smooth(ramp(t, T.was - 0.3, T.dort2 + 2)) * 0.92 : 0,
    1,
  );
  torches.forEach((m, i) => m.scale.setScalar(1 + Math.sin(t * 11 + i) * 0.2));
  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
