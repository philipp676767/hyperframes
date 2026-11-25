// Chapter 3: the quarry, the chisel, the smiths, the balance, the granite boat.
import {
  shotCamera,
  renderFrame,
  start,
  highlights,
  labels,
  showLabel,
  pop,
  puff,
  ramp,
  smooth,
  V,
} from "./world.js";
import { walk, FLOOD_Y } from "./welt.js";
import { G, CUTTER, CHISEL, MALLET, FIRE, BALANCE, GBOAT } from "./set.js";
import { T, shots, LABELS, HIGHLIGHTS, STRIKE } from "./beats.js";

highlights(HIGHLIGHTS);
for (const s of shots) if (s.follow === "gboat") s.rel = GBOAT.position;
const applyCamera = shotCamera(shots);
const tagLabels = LABELS.filter((l) => !l.follow);
const boatLabel = LABELS.find((l) => l.follow === "gboat");
const G0 = V(64, FLOOD_Y - 0.02, 40);
const G1p = V(36, FLOOD_Y - 0.02, 16);

function renderAt(t) {
  G.peopleAt(t);
  G.sledgesAt(t, 0.6);
  G.boatsAt(t);
  for (const s of G.smokes) s.userData.update(t);
  // the stone-cutter: mallet up, strike, chisel bites
  const ph = (t % STRIKE) / STRIKE;
  const hit = ph < 0.12 ? 1 - ph / 0.12 : 0;
  const lift = ph < 0.12 ? 0 : Math.sin(((ph - 0.12) / 0.88) * Math.PI) * 0.03;
  const tip = V(-1.4, -2.0, 30.06);
  CHISEL.position.copy(tip).add(V(0.004, 0.024, 0.004));
  CHISEL.rotation.set(0.15, 0, -0.15);
  MALLET.position.copy(tip).add(V(0.01, 0.062 + lift, 0.008));
  MALLET.rotation.set(0, 0, 0.4 + lift * 8);
  CUTTER.rotation.z = 0.25 + hit * 0.06;
  if (t > T.ihr - 0.3 && t < T.auf) {
    const k = Math.floor(t / STRIKE);
    puff("chip" + (k % 3), t, k * STRIKE, tip.x, tip.y, tip.z, 0.035, 0xf0e6d2);
  }
  // fire
  const f = FIRE.userData;
  f.light.intensity = 2.5 + Math.sin(t * 13) * 0.4 + Math.sin(t * 29) * 0.25;
  f.coals.scale.y = 0.35 + Math.sin(t * 9) * 0.03;
  f.smoke.userData.update(t);
  f.smiths.forEach((p, i) => walk(p, t * 0.8 + i, 0.15));
  // balance: settles level after a small swing (2.5 t = two small cars)
  const sw = ramp(t, T.ein - 0.2, T.ein + 4);
  const tilt = (1 - smooth(sw)) * 0.22 * Math.cos(sw * 9);
  BALANCE.userData.beam.rotation.z = tilt;
  for (const p of BALANCE.userData.pans) p.rotation.z = -tilt;
  // granite boat: from the south towards the harbour
  const kb = ramp(t, T.fuer - 6, T.end);
  GBOAT.position.lerpVectors(G0, G1p, kb);
  GBOAT.position.y = FLOOD_Y - 0.02 + Math.sin(t * 0.8) * 0.01;
  GBOAT.rotation.y = Math.atan2(G1p.z - G0.z, -(G1p.x - G0.x));
  labels(t, tagLabels);
  const kl = pop(t, boatLabel.at, boatLabel.until);
  if (kl > 0) showLabel("granit", kl, boatLabel.text, GBOAT.position.clone().add(V(0, 0.22, 0)), 1);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
