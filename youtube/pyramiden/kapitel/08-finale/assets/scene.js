// TEMPLATE scene of the END chapter (demo, 16:9): the finished bulb glows while
// the payoff, the CTA and the 20-s end screen run. Pattern from the demo chapter (candle -> light
// bulb) that shows the pattern. Replace the subject here and the beats (T), shots, labels and
// sounds in beats.js for the new topic; keep the structure. World,
// captions, panel, arrows, labels and camera come from world.js.
// Full-size reference: tiktok/kuehlschrank/assets/scene.js
import {
  THREE,
  V,
  scene,
  flat,
  M,
  xrayMaterial,
  xrayEdges,
  setXray,
  makeArrowSet,
  animateArrows,
  showPanel,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import "./set.js";
import { shots, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);

// The world of this video (sky, ground, props, hero piece, life) is built
// in set.js — new for every video (SKILL.md 1b). Optional floor pad under
// the subject:

// ---------------------------------------------------------------- hook prop
// The primitive version from the hook ("Kerze in einem Glas").
const hook = new THREE.Group();
hook.visible = false;
scene.add(hook);
const flameMat = flat(0xffb02e, { emissive: 0xff7a10, emissiveIntensity: 1 });
const flame = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 8), flameMat);
{
  const jar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 0.9, 20, 1, true),
    new THREE.MeshStandardMaterial({ color: 0xdff4ff, transparent: true, opacity: 0.35 }),
  );
  jar.position.y = 0.49;
  hook.add(jar);
  const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.5, 14), flat(0xfff3dc));
  candle.position.y = 0.29;
  candle.castShadow = true;
  hook.add(candle);
  flame.position.y = 0.66;
  hook.add(flame);
}

// ---------------------------------------------------------------- subject
// Big, readable, centred at the origin, ~2-3 units tall. Shell uses
// xrayMaterial so the inside can be revealed.
const bulb = new THREE.Group();
scene.add(bulb);
const glassMat = xrayMaterial(0xfff8e8);
const glassGeo = new THREE.SphereGeometry(0.9, 24, 16);
const glass = new THREE.Mesh(glassGeo, glassMat);
glass.position.y = 1.9;
bulb.add(glass);
const glassEdges = xrayEdges(glassGeo);
glassEdges.position.copy(glass.position);
bulb.add(glassEdges);
const base = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.36, 0.7, 16), M.alu);
base.position.y = 0.75;
base.castShadow = true;
bulb.add(base);
const filamentMat = flat(0x6b6b6b, { emissive: 0xffa22e, emissiveIntensity: 0 });
const coil = [];
for (let k = 0; k <= 120; k++) {
  const f = k / 120;
  const a = f * Math.PI * 2 * 9;
  coil.push(V(-0.35 + f * 0.7, 1.95 + Math.sin(a) * 0.06, Math.cos(a) * 0.06));
}
const filament = new THREE.Mesh(
  new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coil), 240, 0.012, 6),
  filamentMat,
);
bulb.add(filament);
const glow = new THREE.PointLight(0xffc46b, 0, 6, 1.5);
glow.position.set(0, 1.95, 0);
bulb.add(glow);
const heatOut = makeArrowSet(
  [
    [V(0.3, 2.1, 0.3), V(1.4, 2.6, 0.9)],
    [V(-0.3, 2.1, 0.3), V(-1.4, 2.6, 0.9)],
    [V(0, 2.3, 0.4), V(0.1, 3.3, 1.0)],
  ],
  { parent: bulb },
);

const applyCamera = shotCamera(shots);

// ---------------------------------------------------------------- render
function renderAt(t) {
  hook.visible = false;
  bulb.visible = true;
  bulb.scale.setScalar(1);
  setXray([glassMat], 0);
  filamentMat.emissiveIntensity = 2.5;
  glow.intensity = 6;
  animateArrows(heatOut, t, 1);
  showPanel(0);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
