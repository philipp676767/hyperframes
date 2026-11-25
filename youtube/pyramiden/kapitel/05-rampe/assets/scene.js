// Chapter 5: wheels sink, sledges, the painting, dry vs wet sand, the three
// ramps (straight, spiral, inside), the 2018 ramp, the crowd.
import {
  shotCamera,
  renderFrame,
  start,
  highlights,
  labels,
  ramp,
  smooth,
  setXray,
} from "./world.js";
import { walk } from "./welt.js";
import { G, CART, HS, DRY, WET, BERM, LAB, HATS, CROWD } from "./set.js";
import { T, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);
for (const s of shots) if (s.follow === "sledge") s.rel = HS.position;
const applyCamera = shotCamera(shots);
const P = G.g1;

function renderAt(t) {
  G.peopleAt(t);
  G.boatsAt(t);
  for (const s of G.smokes) s.userData.update(t);
  // the cart sinks while the wheels try to turn
  const sink = smooth(ramp(t, T.raeder, T.raeder + 2.2));
  CART.position.y = -0.035 * sink;
  CART.rotation.z = 0.06 * sink;
  CART.userData.rim.scale.set(3, 1.8 + sink * 1.4, 1 + sink);
  // hero sledge
  HS.position.x = 19 - (t - T.statt) * 0.04;
  HS.userData.update(t, { pour: 1, speed: 0.8 });
  // experiment: the wet sledge slides twice as far
  const ke = Math.max(0, t - T.mit);
  WET.position.x = LAB.x + 1.0 - Math.min(1.6, ke * 0.16);
  DRY.position.x = LAB.x + 1.0 - Math.min(0.8, ke * 0.08);
  WET.userData.update(t, { pour: 1, speed: 1.1 });
  DRY.userData.update(t, { pour: 0, speed: 0.6 });
  BERM.position.set(DRY.position.x - 0.26, LAB.y - 0.02, DRY.position.z);
  BERM.scale.set(0.5 + Math.min(1, ke * 0.15) * 0.6, 0.4 + Math.min(1, ke * 0.15) * 0.9, 1.4);
  // the ramps on the pyramid
  let name = "spirale";
  let k = 1;
  if (t >= T.gerade - 0.2 && t < T.spirale - 0.15) {
    name = "gerade";
    k = smooth(ramp(t, T.gerade, T.gerade + 1.6));
  } else if (t >= T.spirale - 0.15 && t < T.innen - 0.15) {
    k = smooth(ramp(t, T.spirale, T.spirale + 1.2));
  } else if (t >= T.innen - 0.15 && t < T.y2018 - 0.2) {
    name = "innen";
    k = smooth(ramp(t, T.innen + 0.2, T.innen + 2.4));
  } else if (t >= T.welche - 0.2 && t < T.denn - 0.2) {
    const c = Math.floor((t - T.welche) / 1.4) % 3;
    name = ["gerade", "spirale", "innen"][c];
  }
  G.setRamp(name, k);
  const xr = name === "innen" ? 1 : 0;
  setXray(P.mats, xr * 0.85);
  G.sledgesAt(t, 0.6);
  for (const s of G.sledges) if (name === "innen") s.visible = false;
  // 2018 ramp: a sledge hauled up the steep slope
  const kh = (Math.max(0, t - T.y2018) * 0.05) % 1;
  HATS.position.set(
    HATS.position.x,
    -0.0 + 1.1 + 0.06 + HATS.userData.rise * kh,
    -24 + 1.5 - HATS.userData.len * kh,
  );
  HATS.rotation.set(0, -Math.PI / 2, 0);
  HATS.rotateZ(-Math.atan2(HATS.userData.rise, HATS.userData.len));
  HATS.userData.update(t, { pour: 0, speed: 0.6 });
  // the crowd
  const crowdOn = t >= T.denn - 0.2;
  for (const p of CROWD) {
    p.visible = crowdOn;
    if (crowdOn) walk(p, t * 1.4 + p.userData.ph, 0.7);
  }
  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
