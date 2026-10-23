// TEMPLATE scene: a tiny working story (candle -> light bulb) that shows the
// pattern. Replace the subject here and the beats (T), shots, labels and
// sounds in beats.js for the new topic; keep the structure. World,
// captions, panel, arrows, labels and camera come from world.js.
// Full-size reference: tiktok/kuehlschrank/assets/scene.js
import {
  THREE,
  ramp,
  smooth,
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
  squash,
  puff,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { createWorld } from "./environments.js";
import { createHand } from "./hand.js";
import { place, bench, lamp, flowerBed } from "./props.js";
import { T, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);

// ---------------------------------------------------------------- set (SKILL.md 1b)
// New for every video: env insel | stadt | strand | winter | land | weltall |
// tiefsee | wolken | kueche, a sky (optional, each env has a default), a new
// seed (reshuffles every random placement) and an optional palette.
createWorld({ env: "insel", seed: 1 });
addFloor(3.2, "#f3e9dc", "#d9c9b6");
// Set dressing for the topic (props.js), outside the stage — here a cosy
// evening in the park for "light": a bench, a lamp, flowers. The hero
// background piece of a real video gets built here too.
place(bench(), -6.6, -4.4, 0.55);
place(lamp(), -4.6, -6.2);
place(flowerBed(2), 6.6, -4.2);

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

// the viewer's hand reaches in on frame 0 and taps the jar (visual-style.md
// "The first 3 seconds": a hand doing something stops the scroll)
const hand = createHand({ scale: 0.7 });

// ---------------------------------------------------------------- render
function renderAt(t) {
  hand.track(t, [
    // starts before 0 so the loop tail (t < 0) already shows it reaching in
    { t: -0.6, pos: [1.7, 1.0, 1.4], rot: [0.2, -2.1, 0], pose: "open" },
    { t: 0, pos: [1.2, 0.78, 0.98], rot: [0.25, -2.1, 0], pose: "open" },
    { t: 0.45, pos: [0.86, 0.64, 0.7], rot: [0.3, -2.1, 0], pose: "press" },
    { t: 0.9, pos: [0.94, 0.66, 0.76], rot: [0.3, -2.1, 0], pose: "point" },
    { t: T.lampe1, pos: [1.7, 0.95, 1.4], rot: [0.2, -2.1, 0], pose: "open", out: true },
  ]);
  // hook: the candle burns down, then the "nope" X
  const burn = ramp(t, T.aber, T.aus + 0.3);
  flame.scale.setScalar(Math.max(0.001, 1 - smooth(burn)));
  flame.rotation.z = Math.sin(t * 9) * 0.08;
  showNope(pop(t, T.aus, T.also), 0, 1.4, 0.3);
  const hookOut = inBack(ramp(t, T.also, T.also + 0.35));
  hook.visible = hookOut < 1;
  hook.scale.setScalar(Math.max(0.001, 1 - hookOut));

  // subject pops in when the build starts, x-ray while explaining
  // pop-ins: squash() for rubbery growth + a dust puff where it lands
  bulb.visible = t >= T.also + 0.15;
  bulb.scale.copy(squash(t, T.also + 0.15));
  puff("bulb", t, T.also + 0.3, 0, 0.05, 0, 1.3);
  setXray(
    [glassMat],
    smooth(ramp(t, T.draht1 - 0.2, T.draht1 + 0.4)) * (1 - ramp(t, T.payoff, T.payoff + 0.5)),
  );
  const hot = smooth(ramp(t, T.heiss, T.gluet + 0.4));
  filamentMat.emissiveIntensity = 2.5 * hot;
  glow.intensity = 6 * hot;
  animateArrows(heatOut, t, pop(t, T.gluet, T.payoff));

  // LED panel: one fact per beat, max one at a time
  if (t >= T.heiss && t < T.gluehfaden) {
    showPanel(pop(t, T.heiss, T.gluehfaden), "DRAHT", "2500°C", LED.red);
  } else {
    showPanel(0);
  }

  // tags + arrows on the named parts
  labels(t, LABELS);

  applyCamera(t);
  renderFrame();
}

start(renderAt);
