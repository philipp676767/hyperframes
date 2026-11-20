// Chapter 2: the test is delayed into the night shift; power falls, xenon
// builds up, the operators pull the rods until only about eight remain.
import { shotCamera, renderFrame, start, highlights, labels, ramp, smooth } from "./world.js";
import { PLANT, CR, CORE } from "./set.js";
import { T, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);
const applyCamera = shotCamera(shots);
function renderAt(t) {
  PLANT.setState("intakt");
  // power: 1600 MW → falls to ~30 after midnight → crawls back to ~200
  const fall = smooth(ramp(t, T.kurz + 0.5, T.schuld));
  const back = smooth(ramp(t, T.ziehen, T.der));
  const mw = 1600 - fall * 1570 + back * 170;
  CR.setPower(mw);
  CR.setClock(
    t < T.kurz ? 23 : 0,
    t < T.kurz ? 10 + t * 0.05 : 28 + (t - T.kurz) * 0.5,
    (t * 7) % 60,
  );
  // rods: ~1 = most rods in; pulled out from "ziehen" to "Ende" → 8 left
  const out = smooth(ramp(t, T.ziehen - 0.3, T.ende));
  CR.setRods(1 - out, 0, t);
  CORE.setCore(t, {
    power: t < T.kurz ? 1 : Math.max(0.05, 1 - fall * 0.95 + back * 0.2),
    ins: 0.75 - out * 0.75,
    keep: t > T.ende ? 2 : 0,
    voidK: 0.15,
    xenonK: smooth(ramp(t, T.schuld + 0.5, T.xenon + 1.5)),
    turbineSpeed: t < T.koennen ? 1 : Math.max(0.05, 1 - (t - T.koennen) * 0.25),
  });
  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
