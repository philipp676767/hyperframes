// TEMPLATE scene: a tiny working story (candle -> light bulb) that shows the
// pattern. Replace the subject here and the beats (T), shots, labels, mascot
// acts and sounds in beats.js for the new topic; keep the structure. World,
// captions, panel, arrows, labels and camera come from world.js.
// Full-size reference: tiktok/kuehlschrank/assets/scene.js
import {
  THREE,
  ramp,
  smooth,
  outBack,
  inBack,
  pop,
  V,
  scene,
  flat,
  M,
  xrayMaterial,
  xrayEdges,
  setXray,
  addFloor,
  showNope,
  makeArrowSet,
  animateArrows,
  showPanel,
  LED,
  labels,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { createWorld } from "./environments.js";
import { mascot } from "./mascot.js";
import { T, shots, LABELS, MASCOT } from "./beats.js";

// Pick the place + light for this topic: env insel | stadt | strand | winter | land,
// sky sonnenuntergang | morgen | mittag | abend (optional, each env has a default).
createWorld({ env: "insel" });
addFloor(3.2, "#f3e9dc", "#d9c9b6");

// ---------------------------------------------------------------- hook prop
// The primitive version from the hook ("Kerze in einem Glas").
const hook = new THREE.Group();
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
  // hook: the candle burns down, then the "nope" X
  const burn = ramp(t, T.aber, T.aus + 0.3);
  flame.scale.setScalar(Math.max(0.001, 1 - smooth(burn)));
  flame.rotation.z = Math.sin(t * 9) * 0.08;
  showNope(pop(t, T.aus, T.also), 0, 1.4, 0.3);
  const hookOut = inBack(ramp(t, T.also, T.also + 0.35));
  hook.visible = hookOut < 1;
  hook.scale.setScalar(Math.max(0.001, 1 - hookOut));

  // subject pops in when the build starts, x-ray while explaining
  const k = outBack(ramp(t, T.also + 0.15, T.also + 0.75));
  bulb.visible = k > 0;
  bulb.scale.setScalar(Math.max(0.001, k));
  setXray(
    [glassMat],
    smooth(ramp(t, T.draht1 - 0.2, T.draht1 + 0.4)) * (1 - ramp(t, T.schau, T.schau + 0.5)),
  );
  const hot = smooth(ramp(t, T.heiss, T.gluet + 0.4));
  filamentMat.emissiveIntensity = 2.5 * hot;
  glow.intensity = 6 * hot;
  animateArrows(heatOut, t, pop(t, T.gluet, T.schau));

  // LED panel: one fact per beat, max one at a time
  if (t >= T.heiss && t < T.gluehfaden) {
    showPanel(pop(t, T.heiss, T.gluehfaden), "DRAHT", "2500°C", LED.red);
  } else {
    showPanel(0);
  }

  // tags + arrows on the named parts, the Erklärbär's acts
  labels(t, LABELS);
  mascot(t, MASCOT);

  applyCamera(t);
  renderFrame();
}

start(renderAt);
