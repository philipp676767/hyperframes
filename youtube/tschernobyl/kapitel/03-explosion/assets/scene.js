// Chapter 3: the test starts, bubbles grow, the car analogy, AZ-5, the rods
// with graphite tips, the surge, the core bursts, block 4 explodes.
import {
  shotCamera,
  renderFrame,
  start,
  highlights,
  labels,
  ramp,
  smooth,
  ground,
} from "./world.js";
import { PLANT, CR, CORE } from "./set.js";
import { makeBlast, makeCar } from "./welt.js";
import { T, shots, LABELS, HIGHLIGHTS, BOOM } from "./beats.js";

highlights(HIGHLIGHTS);
const applyCamera = shotCamera(shots);
const blast = makeBlast(PLANT);
const car = makeCar();
car.scale.setScalar(1.4);
ground.add(car);
function renderAt(t) {
  const ruined = t >= BOOM;
  PLANT.setState(ruined ? "explodiert" : "intakt");
  PLANT.setRuin(t, ruined, 0.4 + 0.6 * ramp(t, BOOM, BOOM + 3));
  blast(t, t - BOOM);
  // the car: accelerates while its engine glows hotter
  const tc = Math.max(0, t - (T.es - 0.2));
  const x = 26 + tc * 0.4 + tc * tc * 0.35;
  car.position.set(x, 0.03, -1.6);
  car.userData.heatMat.emissiveIntensity = Math.min(3, tc * 0.6);
  car.userData.wheels.forEach((w) => (w.rotation.y = x * 8));
  // control room
  CR.setClock(1, 23, Math.min(59, 4 + t * 0.6 + (t > T.um2 ? 40 - (4 + T.um2 * 0.6) : 0)));
  const surge = smooth(ramp(t, T.nach, T.brenn));
  CR.setPower(200 + ramp(t, T.notaus, T.nach) * 330 + surge * 32000);
  CR.setRods(0.04, ramp(t, T.notaus, T.notaus + 18), t);
  CR.setAlarm(t > T.notaus + 0.3 ? 1 : 0, t);
  CR.setDust(t, t > T.nach + 1.5 ? 1 : 0);
  // core
  const bub = smooth(ramp(t, T.pumpen, T.es));
  const fall = ramp(t, T.notaus, T.notaus + 18);
  const tip =
    smooth(ramp(t, T.spitze, T.graphit + 0.6)) * 0.5 + smooth(ramp(t, T.fuer, T.fuer + 1.5)) * 0.5;
  CORE.setCore(t, {
    power: 0.25 + bub * 0.8 + tip * 3 + surge * 20,
    ins: 0.03 + fall * 0.32,
    keep: 2,
    voidK: 0.15 + bub * 0.45 + surge * 0.4,
    tipK: tip,
    turbineSpeed: 0.3,
    burst: smooth(ramp(t, T.brenn, T.brenn + 2)),
    lidLift: smooth(ramp(t, T.brenn + 1, T.brenn + 3)),
  });
  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
