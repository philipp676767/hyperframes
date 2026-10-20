// TEMPLATE scene: a tiny working story (candle -> light bulb) that shows the
// pattern. Replace the subject, beats (T) and shots for the new topic; keep
// the structure. World, captions, panel, arrows and camera come from world.js.
// Full-size reference: tiktok/kuehlschrank/assets/scene.js
import {
  THREE,
  W,
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
  addTrees,
  showNope,
  makeArrowSet,
  animateArrows,
  showPanel,
  LED,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";

addFloor(3.2, "#f3e9dc", "#d9c9b6");
addTrees();

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

// ---------------------------------------------------------------- beats
// Word anchors: W("word", n) = start of the n-th time that word is spoken.
// Pick distinctive words; common ones ("an", "der") collide.
const T = {
  kerze: W("Kerze"),
  lampe1: W("Lampe", 1),
  aber: W("Aber"),
  aus: W("aus"),
  also: W("Also"),
  draht1: W("Draht", 1),
  heiss: W("heiß"),
  gluet: W("glüht"),
  gluehfaden: W("Glühfaden"),
  schau: W("Schau"),
  gerade: W("gerade"),
};

// ---------------------------------------------------------------- shots
// One shot per beat, hard cut every ~2-4 s, always slowly moving.
const shots = [
  { at: 0, from: [1.6, 1.3, 2.2], to: [1.2, 1.1, 1.8], look: [0, 0.5, 0] },
  { at: T.lampe1, from: [3.2, 2.6, 5.4], to: [2.6, 2.2, 4.5], look: [0, 0.5, 0] },
  { at: T.aber, from: [-1.1, 0.9, 1.4], to: [-0.8, 0.8, 1.1], look: [0, 0.5, 0] },
  { at: T.also, from: [2.2, 2.4, 3.4], to: [1.8, 2.1, 2.9], look: [0, 1.5, 0] },
  { at: T.draht1, from: [0.9, 2.3, 1.7], to: [0.6, 2.15, 1.4], look: [0, 1.95, 0] },
  { at: T.gluehfaden, orbit: { c: [0, 1.7, 0], r: 3.2, y: 2.4, a0: 0.8, a1: -0.6 } },
  { at: T.schau, from: [1.0, 2.0, 3.6], to: [0.6, 1.9, 3.0], look: [0, 1.5, 0] },
  { at: T.gerade, from: [3, 2.5, 5], to: [9.5, 7.5, 15], look: [0, 1.4, 0], lookTo: [0, 0.4, 0] },
];
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

  applyCamera(t);
  renderFrame();
}

start(renderAt);
