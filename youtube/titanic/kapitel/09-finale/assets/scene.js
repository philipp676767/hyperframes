// Finale: the causes in a row (bow at speed, a sea without waves, the x-ray
// bulkheads, the boats, the Californian), then the epilogue at dawn: the
// upturned boat, the Carpathia, a tiny boat with a baby's blanket, a wreath on
// the water — and the bow in the dark below for the end screen.
import {
  THREE,
  ground,
  real,
  setXray,
  pop,
  ramp,
  smooth,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import "./set.js";
import {
  makeTitanic,
  makeWake,
  makeIceberg,
  makeLifeboat,
  makePerson,
  makeSmallShip,
  setWater,
  shipLights,
} from "./welt.js";
import { T, CAL, WREATH, shots } from "./beats.js";

const ship = makeTitanic();
ground.add(ship.group);
const wake = makeWake(ship);
const xr = makeTitanic({ xray: true });
ground.add(xr.group);
const berg = makeIceberg({ seed: 5, size: 2.2, len: 3.2 });
berg.position.set(30, 0, 1);
ground.add(berg);
const cal = makeSmallShip({ funnel: 0x1d1d1d, band: 0xb8442c });
cal.position.set(...CAL);
ground.add(cal);
// epilogue props on the dawn sea
const upturned = makeLifeboat({ cover: false });
upturned.rotation.z = Math.PI;
upturned.position.set(-8, 0.06, 20);
ground.add(upturned);
for (let i = 0; i < 4; i++) {
  const p = makePerson({ coat: 0x1a1f2b, cap: false, scale: 0.8 });
  p.position.set(-8.3 + i * 0.18, 0.12, 20);
  ground.add(p);
}
const carp = makeSmallShip({ funnel: 0xc8462a, band: 0x151515 });
carp.scale.setScalar(1.5);
carp.position.set(-26, 0, 24);
ground.add(carp);
const small = makeLifeboat({ cover: false });
small.position.set(-3.5, 0.03, 26);
ground.add(small);
const blanket = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), real.fabric(0xf2e8d8));
blanket.position.set(0, 0.08, 0);
small.add(blanket);
// the wreath: an evergreen ring with white flowers, set down on the water
const wreath = new THREE.Group();
{
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.09, 12, 48), real.fabric(0x2f5a2c));
  ring.rotation.x = Math.PI / 2;
  wreath.add(ring);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const f = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 12, 8),
      real.fabric(i % 3 ? 0xf6f2ea : 0xc9302c),
    );
    f.position.set(Math.cos(a) * 0.35, 0.07, Math.sin(a) * 0.35);
    wreath.add(f);
  }
  ground.add(wreath);
}

const applyCamera = shotCamera(shots);
function renderAt(t) {
  wake.userData.update(t, 1.2);
  shipLights(0.4);
  const xk = pop(t, T.schotten - 0.2, T.regeln, 0.5);
  setXray(xr.mats, xk);
  xr.group.visible = xk > 0.02;
  ship.group.visible = t < T.kapitaen && xk < 0.98;
  for (let i = 0; i < xr.inside.water.length; i++) setWater(xr, i, i < 6 ? 0.8 : 0);
  // the wreath comes down onto the water and drifts
  const w = smooth(ramp(t, T.kranz - 1.2, T.kranz + 0.6));
  wreath.position.set(WREATH[0] + Math.sin(t * 0.2) * 0.1, 3 * (1 - w) + 0.04, WREATH[2]);
  wreath.rotation.y = t * 0.05;
  applyCamera(t);
  renderFrame();
}
start(renderAt);
