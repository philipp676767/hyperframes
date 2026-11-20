// Chapter 1: the plant at sunset, then the core: water rising, fuel glowing,
// neutrons flying, rods sliding in and calming the core.
import { shotCamera, renderFrame, start, highlights, labels, ramp, smooth } from "./world.js";
import { PLANT, CORE } from "./set.js";
import { T, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);
const applyCamera = shotCamera(shots);
function renderAt(t) {
  PLANT.setState("intakt");
  // rods: half in at first; they slide in on "fahren", out again a little
  const inK =
    smooth(ramp(t, T.damit + 1.5, T.schlucken)) * 0.6 +
    smooth(ramp(t, T.tiefer, T.tiefer + 2.5)) * 0.35;
  const ins = 0.2 + inK - smooth(ramp(t, T.tiefer + 3, T.doch)) * 0.25;
  const calm = 1 - inK * 0.85;
  CORE.setCore(t, {
    power: (t < T.wird ? 0.8 : 1.4) * calm + 0.15,
    ins,
    voidK: 0.25 * calm + 0.05,
    turbineSpeed: t > T.sie ? 1 : 0.3,
  });
  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
