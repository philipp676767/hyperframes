// Chapter 4: Tura, the logbook, Merer's crossing, the flood rising, the
// harbour, the buried branch, the arrival.
import { shotCamera, renderFrame, start, highlights, labels, ramp, smooth, V } from "./world.js";
import { FLOOD_Y, VALLEY_Y } from "./welt.js";
import { G, BOAT, MERER, FLEET, BRANCH } from "./set.js";
import { T, shots, LABELS, HIGHLIGHTS, CROSS } from "./beats.js";

highlights(HIGHLIGHTS);
for (const s of shots) if (s.follow === "boat") s.rel = BOAT.position;
const applyCamera = shotCamera(shots);
const A = V(CROSS.from[0], FLOOD_Y - 0.02, CROSS.from[1]);
const B = V(CROSS.to[0], FLOOD_Y - 0.02, CROSS.to[1]);
const head = Math.atan2(B.z - A.z, -(B.x - A.x));

function renderAt(t) {
  // the flood: low water during "Jeden Sommer …", then it rises
  const rise = smooth(ramp(t, T.jeden + 0.6, T.ueber - 0.4));
  const inRise = t >= T.jeden - 0.2 && t < T.ueber - 0.2;
  G.water.position.y = inRise ? VALLEY_Y + 0.05 + (FLOOD_Y - VALLEY_Y - 0.05) * rise : FLOOD_Y;
  // Merer's boat
  const k = smooth(ramp(t, CROSS.t0, CROSS.t1));
  BOAT.position.lerpVectors(A, B, k);
  BOAT.position.y = G.water.position.y - 0.02 + Math.sin(t * 0.9) * 0.01;
  BOAT.rotation.y = head;
  MERER.rotation.y = Math.sin(t * 0.25) * 0.2;
  BOAT.visible = !inRise || rise > 0.85;
  // the fleet shuttles (half loaded towards Giza, half empty back)
  FLEET.forEach((b, i) => {
    const u = (t * 0.012 + b.userData.off) % 1;
    const back = i % 2 === 1;
    const f = back ? 1 - u : u;
    b.position.set(88 - 54 * f, G.water.position.y - 0.02, -10 + 22 * f + (i - 2) * 3);
    b.rotation.y = head + (back ? Math.PI : 0);
    b.visible = !inRise || rise > 0.85;
  });
  for (const bb of G.boats) bb.visible = !inRise || rise > 0.85;
  G.boatsAt(t);
  G.peopleAt(t);
  G.sledgesAt(t, 0.6);
  for (const s of G.smokes) s.userData.update(t);
  // the buried branch lights up from the satellite view
  const kb = smooth(ramp(t, T.auf + 0.5, T.auf + 4.5));
  BRANCH.visible = t >= T.wie - 0.2 && t < T.laut - 0.2;
  BRANCH.geometry.setDrawRange(0, Math.ceil(kb * BRANCH.userData.segs) * 6 * 6);
  if (window.HF_THUMB) for (const k of Object.keys(G.ramps)) G.ramps[k].visible = false;
  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
