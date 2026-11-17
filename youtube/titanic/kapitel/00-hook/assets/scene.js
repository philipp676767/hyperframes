// Chapter 0 "Eisberg voraus": the ship at night, the lookout, the radio room,
// the iceberg growing ahead, the wreck far below, the Californian's lights.
import {
  shotCamera,
  renderFrame,
  start,
  ground,
  highlights,
  labels,
  ramp,
  smooth,
} from "./world.js";
import { RADIO_ROOM } from "./set.js";
import { makeTitanic, makeIceberg, makeWake, makeSmoke, makePerson } from "./welt.js";
import { T, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);
RADIO_ROOM.ops.forEach((o) => (o.visible = false));
const ship = makeTitanic();
ground.add(ship.group);
const wake = makeWake(ship);
const smoke = makeSmoke(ship);
// Fleet in the crow's nest, looking ahead
const fleet = makePerson({ coat: 0x1a1f2b });
fleet.position.set(9.82, 2.83, 0.02);
fleet.rotation.y = Math.PI / 2;
ship.bow.add(fleet);
const lee = makePerson({ coat: 0x232a38 });
lee.position.set(9.78, 2.83, -0.06);
lee.rotation.y = Math.PI / 2 + 0.3;
ship.bow.add(lee);
// the berg: a dark shape ahead that grows as the ship closes in
const berg = makeIceberg({ seed: 5, size: 2.4, len: 3.4 });
ground.add(berg);

const applyCamera = shotCamera(shots);
// C Q D in Morse (the spark gap flashes with the sound)
const MORSE = [3, 1, 3, 1, 0, 3, 3, 1, 3, 0, 3, 1, 1];
function sparkOn(t) {
  let x = t / 0.075;
  for (const m of MORSE) {
    const len = m === 0 ? 2 : m;
    if (x < len) return m !== 0;
    x -= len + 1;
  }
  return false;
}

function renderAt(t) {
  wake.userData.update(t, 1);
  smoke.userData.update(t, 1);
  // closing in: far ahead at first, filling the view over the bow at "Schatten"
  const k = smooth(ramp(t, T.direkt - 0.5, T.an));
  berg.position.set(30 + (1 - k) * 26 - (t > T.an ? 0 : 0), 0, 1.2);
  if (t < T.kommt) berg.position.x = 34;
  // radio room
  const on = t >= T.kommt && t < T.es && sparkOn(t - T.kommt);
  RADIO_ROOM.sparkMat.opacity = on ? 1 : 0;
  RADIO_ROOM.sparkLight.intensity = on ? 3 : 0;
  RADIO_ROOM.keyArm.rotation.z = on ? -0.08 : 0;
  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
