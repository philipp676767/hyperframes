// Chapter 0: ruin at night (cold open) → intact plant → control room → AZ-5 →
// rods falling (x-ray) → the blast → questions → boar → the story.
import { shotCamera, renderFrame, start, highlights, labels, ramp, smooth } from "./world.js";
import { PLANT, CR, CORE } from "./set.js";
import { makeBlast } from "./welt.js";
import { T, shots, LABELS, HIGHLIGHTS, BOOM } from "./beats.js";

highlights(HIGHLIGHTS);
const applyCamera = shotCamera(shots);
const blast = makeBlast(PLANT);

function renderAt(t) {
  const ruined = t < T.es - 0.2 || t >= BOOM;
  PLANT.setState(ruined ? "explodiert" : "intakt");
  PLANT.setRuin(t, ruined, t >= BOOM ? 0.4 + 0.6 * ramp(t, BOOM, BOOM + 3) : 1);
  blast(t, t - BOOM);
  // control room: power climbs, AZ-5 at T.notaus, alarm
  const press = ramp(t, T.notaus - 0.15, T.notaus);
  CR.azBtn.position.y = 0.03 - press * 0.018 + ramp(t, T.notaus + 0.4, T.notaus + 0.7) * 0.018;
  const rise = smooth(ramp(t, T.leistung, T.notaus));
  CR.setPower(200 + rise * 330 + ramp(t, T.notaus, T.er) * 2400);
  CR.setRods(0.04, ramp(t, T.notaus, T.notaus + 6), t);
  CR.setClock(1, 23, 4 + Math.max(0, t - T.im) * 1.0);
  CR.setAlarm(t > T.notaus + 0.3 ? 1 : 0, t);
  // core x-ray: rods falling, tips glowing at the bottom
  const fall = ramp(t, T.er - 0.3, T.er + 6);
  CORE.setCore(t, {
    power: 1.2 + fall * 6,
    ins: 0.05 + fall * 0.25,
    keep: 0,
    voidK: 0.35 + fall * 0.4,
    tipK: smooth(ramp(t, T.er + 0.2, T.er + 1.5)),
    turbineSpeed: 0.6,
  });
  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
