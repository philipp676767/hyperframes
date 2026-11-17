import { shotCamera, renderFrame, start, ground } from "./world.js";
import { NIGHT } from "./set.js";
import { makeTitanic, makeIceberg, makeWake, makeSmoke } from "./welt.js";
import { shots } from "./beats.js";
const ship = makeTitanic();
ground.add(ship.group);
const wake = makeWake(ship);
const smoke = makeSmoke(ship);
const berg = makeIceberg({ seed: 5, size: 2.2, len: 3.2 });
berg.position.set(24, 0, 1.5);
ground.add(berg);
const applyCamera = shotCamera(shots);
function renderAt(t) {
  wake.userData.update(t, 1);
  smoke.userData.update(t, 1);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
void NIGHT;
