// Chapter 0: the logbook, Merer's boat on the flood, the pyramid at three
// quarters, the people, the logbook in the sand, the framing line.
import {
  shotCamera,
  renderFrame,
  start,
  highlights,
  labels,
  showLabel,
  pop,
  smooth,
  ramp,
  V,
} from "./world.js";
import { G, BOAT, MERER, HS } from "./set.js";
import { T, shots, LABELS, HIGHLIGHTS, BOAT_PATH } from "./beats.js";
import { FLOOD_Y } from "./welt.js";

highlights(HIGHLIGHTS);
for (const s of shots) {
  if (s.follow === "boat") s.rel = BOAT.position;
  if (s.follow === "sledge") s.rel = HS.position;
}
const applyCamera = shotCamera(shots);
const P0 = V(BOAT_PATH.from[0], FLOOD_Y - 0.02, BOAT_PATH.from[1]);
const P1 = V(BOAT_PATH.to[0], FLOOD_Y - 0.02, BOAT_PATH.to[1]);
const heading = Math.atan2(-(P1.z - P0.z), P1.x - P0.x);

function renderAt(t) {
  // the boat glides on, slowing towards the harbour
  const k = smooth(ramp(t, BOAT_PATH.t0, BOAT_PATH.t1)) * 0.92 + ramp(t, 0, BOAT_PATH.t1) * 0.08;
  BOAT.position.lerpVectors(P0, P1, k);
  BOAT.rotation.y = heading + Math.PI;
  G.boatsAt(t);
  BOAT.position.x = P0.x + (P1.x - P0.x) * k;
  G.peopleAt(t);
  G.sledgesAt(t);
  // the hero sledge: slowly across the plateau towards the pyramid
  HS.position.x = 19 - t * 0.04;
  HS.userData.update(t, { pour: 1, speed: 0.8 });
  for (const s of G.smokes) s.userData.update(t);
  // the crew: small movements, Merer looks ahead
  BOAT.userData.people.forEach((p, i) => (p.rotation.y = Math.sin(t * 0.3 + i) * 0.6 + i));
  MERER.rotation.y = Math.PI + Math.sin(t * 0.2) * 0.15;
  labels(t, LABELS);
  const km = pop(t, T.an + 1.2, T.vor - 0.4);
  if (km > 0)
    showLabel("merer", km, "Merer", MERER.getWorldPosition(V(0, 0, 0)).add(V(0, 0.12, 0)), 1);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
