// #78 Heizkörper-Thermostat — the subject: a radiator thermostat head on its
// valve (axis +z at the origin). Number ring 1–5, wax capsule, pin, valve
// disc, hot water flowing into the radiator; the viewer's hand cranks it to
// 5; an AA battery + plug get the ✕; a bowl of yeast dough rises; the
// curtain closes over the radiator in the "Übrigens".
import {
  THREE,
  ramp,
  smooth,
  pop,
  V,
  scene,
  real,
  roundedBox,
  xrayMaterial,
  xrayEdges,
  setXray,
  showNope,
  makeArrowSet,
  animateArrows,
  heatMat,
  coldMat,
  forceMat,
  showPanel,
  LED,
  labels,
  squash,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { FLOOR, RAD, curtain, radMat, frostMat, put, tex } from "./set.js";
import { createHand } from "./hand.js";
import { T, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);
const PI = Math.PI;

// ---------------------------------------------------------------- materials
const shellMat = xrayMaterial(0xf3f2ee, { roughness: 0.38 });
const ringMat = xrayMaterial(0xc9cbce, { roughness: 0.4 });
const brassMat = xrayMaterial(0xcfd3d8, { roughness: 0.18, metalness: 0.9 });
const pipeMat = xrayMaterial(0xe2e4e7, { roughness: 0.15, metalness: 0.9 });
const XRAY = [shellMat, ringMat, brassMat, pipeMat];

// ---------------------------------------------------------------- head
const head = new THREE.Group();
scene.add(head);
const knob = new THREE.Group(); // the turning part
head.add(knob);
{
  const prof = [
    [0.55, -0.74],
    [0.6, -0.7],
    [0.6, 0.3],
    [0.635, 0.36],
    [0.635, 0.82],
    [0.6, 0.9],
    [0.5, 0.97],
    [0.3, 1.0],
    [0.001, 1.01],
  ].map(([r, z]) => new THREE.Vector2(r, z));
  const g = new THREE.LatheGeometry(prof, 96).rotateX(PI / 2);
  const shell = put(g, shellMat, 0, 0, 0, knob);
  const e = xrayEdges(g);
  knob.add(e);
  // grip ribs
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * PI * 2;
    const r = put(
      roundedBox(0.08, 0.06, 0.44, 0.025, 2),
      shellMat,
      Math.cos(a) * 0.64,
      Math.sin(a) * 0.64,
      0.59,
      knob,
    );
    r.rotation.z = a;
  }
  shell.castShadow = true;
}
// number ring: ❄ 1 2 3 4 5 printed around the body
const U0 = 0.5;
const DU = 0.085;
const numTex = tex(2048, 256, (g, w, h) => {
  g.fillStyle = "#f3f2ee";
  g.fillRect(0, 0, w, h);
  // drawn turned by 180° so the digits read upright from the front-top
  g.translate(w, h);
  g.rotate(PI);
  g.fillStyle = "#2c2c2e";
  g.strokeStyle = "#2c2c2e";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = "900 215px Montserrat, Arial, sans-serif";
  const labelsTxt = ["*", "1", "2", "3", "4", "5"];
  labelsTxt.forEach((s, i) => {
    const x = (U0 + (i - 3) * DU) * w;
    if (s === "*") {
      g.lineWidth = 14;
      for (let k = 0; k < 3; k++) {
        const a = (k * PI) / 3;
        g.beginPath();
        g.moveTo(x - Math.cos(a) * 62, h / 2 - Math.sin(a) * 62);
        g.lineTo(x + Math.cos(a) * 62, h / 2 + Math.sin(a) * 62);
        g.stroke();
      }
    } else g.fillText(s, x, h / 2 + 8);
    // detent dots between the numbers
    if (i < 5)
      for (let d = 1; d < 3; d++) {
        g.beginPath();
        g.arc(x + (d * DU * w) / 3, h / 2, 9, 0, 7);
        g.fill();
      }
  });
});
numTex.wrapS = THREE.ClampToEdgeWrapping;
numTex.repeat.set(1, 1);
const bandMat = xrayMaterial(0xffffff, { map: numTex, roughness: 0.38 });
XRAY.push(bandMat);
put(
  new THREE.CylinderGeometry(0.606, 0.606, 0.42, 128, 1, true).rotateX(PI / 2),
  bandMat,
  0,
  0,
  -0.48,
  knob,
);
// front cap disc
put(new THREE.CylinderGeometry(0.3, 0.3, 0.02, 64).rotateX(PI / 2), ringMat, 0, 0, 1.0, knob);

// fixed ring with the index mark, union nut, valve stem
put(new THREE.CylinderGeometry(0.58, 0.6, 0.26, 96).rotateX(PI / 2), ringMat, 0, 0, -0.87, head);
put(roundedBox(0.07, 0.06, 0.2, 0.02), real.plastic(0xd2232a), 0, 0.6, -0.86, head);
put(new THREE.CylinderGeometry(0.52, 0.52, 0.34, 6).rotateX(PI / 2), brassMat, 0, 0, -1.17, head);
put(new THREE.CylinderGeometry(0.36, 0.36, 0.6, 48).rotateX(PI / 2), brassMat, 0, 0, -1.6, head);

// ---------------------------------------------------------------- valve body + pipes
const VZ = RAD.z;
const valveGeo = new THREE.SphereGeometry(0.58, 64, 32);
put(valveGeo, brassMat, 0, 0, VZ, head);
put(new THREE.CylinderGeometry(0.4, 0.4, 0.9, 48), brassMat, 0, -0.5, VZ, head);
put(new THREE.CylinderGeometry(0.4, 0.4, 1.7, 48).rotateZ(PI / 2), brassMat, -0.9, 0, VZ, head);
put(
  new THREE.CylinderGeometry(0.3, 0.3, -0.9 - FLOOR, 48),
  pipeMat,
  0,
  (FLOOR - 0.9) / 2,
  VZ,
  head,
);
const valveEdges = xrayEdges(valveGeo);
valveEdges.position.set(0, 0, VZ);
head.add(valveEdges);
// seat ring inside the valve
put(
  new THREE.TorusGeometry(0.24, 0.05, 16, 48),
  real.metal(0xb08a3a, { roughness: 0.3 }),
  0,
  0,
  -1.79,
  head,
);

// ---------------------------------------------------------------- inside: wax capsule, pin, disc
const inside = new THREE.Group();
head.add(inside);
const WAX_FRONT = 0.62;
const WAX_LEN = 0.72;
const waxMat = real.plastic(0xf0b23a, {
  roughness: 0.35,
  emissive: 0xff6a10,
  emissiveIntensity: 0.2,
});
const wax = put(
  new THREE.CylinderGeometry(0.26, 0.26, WAX_LEN, 64).rotateX(PI / 2).translate(0, 0, -WAX_LEN / 2),
  waxMat,
  0,
  0,
  WAX_FRONT,
  inside,
);
const copper = real.metal(0xc4774a, { roughness: 0.28 });
put(
  new THREE.CylinderGeometry(0.3, 0.3, 0.1, 64).rotateX(PI / 2),
  copper,
  0,
  0,
  WAX_FRONT + 0.05,
  inside,
);
const backPlate = put(
  new THREE.CylinderGeometry(0.3, 0.3, 0.08, 64).rotateX(PI / 2),
  copper,
  0,
  0,
  0,
  inside,
);
const pin = put(
  new THREE.CylinderGeometry(0.055, 0.055, 1.35, 24).rotateX(PI / 2).translate(0, 0, -0.675),
  real.metal(0xe8e8ea, { roughness: 0.15 }),
  0,
  0,
  0,
  inside,
);
const disc = put(
  new THREE.CylinderGeometry(0.25, 0.25, 0.08, 48).rotateX(PI / 2),
  real.rubber(0x1d1d20),
  0,
  0,
  0,
  inside,
);
const waxLight = new THREE.PointLight(0xff8a2a, 0, 3, 1.6);
waxLight.position.set(0, 0, 0.3);
inside.add(waxLight);
const pushArrow = makeArrowSet([[V(0, 0.42, -0.25), V(0, 0.42, -1.45)]], {
  mat: forceMat,
  amp: 0,
  r: 0.045,
});

// wax expansion 1 … 1.35 (1.35 = valve shut)
function waxScale(t) {
  if (t < T.stift2 - 0.05)
    return (
      1 +
      0.15 * smooth(ramp(t, T.dehnt, T.aufgeht)) +
      0.12 * smooth(ramp(t, T.schiebt, T.stift1 + 0.5))
    );
  return 1 + 0.35 * smooth(ramp(t, T.warm2, T.zu + 0.05));
}
function placeInside(sz) {
  wax.scale.z = sz;
  const back = WAX_FRONT - WAX_LEN * sz;
  backPlate.position.z = back - 0.04;
  pin.position.z = back - 0.08;
  disc.position.z = back - 0.08 - 1.35;
}

// ---------------------------------------------------------------- hot water beads
const PATH = [V(0, FLOOR, VZ), V(0, -0.35, VZ), V(-0.3, 0, VZ), V(-1.7, 0, VZ), V(-7, 0, VZ)];
const segL = [];
let totalL = 0;
for (let i = 1; i < PATH.length; i++) {
  const l = PATH[i].distanceTo(PATH[i - 1]);
  segL.push(l);
  totalL += l;
}
function along(d) {
  for (let i = 0; i < segL.length; i++) {
    if (d <= segL[i]) return PATH[i].clone().lerp(PATH[i + 1], d / segL[i]);
    d -= segL[i];
  }
  return PATH[PATH.length - 1].clone();
}
const flow = (t) =>
  smooth(ramp(t, T.zimmer + 0.1, T.offen)) * (1 - smooth(ramp(t, T.drueckt, T.zu + 0.05)));
const DT = 1 / 60;
const phaseTab = [0];
for (let i = 1; i <= 60 * 50; i++) phaseTab.push(phaseTab[i - 1] + flow(i * DT) * 4.5 * DT);
const phaseAt = (t) => phaseTab[Math.max(0, Math.min(phaseTab.length - 1, Math.round(t / DT)))];
const NB = 70;
const beads = new THREE.InstancedMesh(
  new THREE.SphereGeometry(0.12, 16, 12),
  new THREE.MeshBasicMaterial({ color: 0xff4a1f }),
  NB,
);
beads.userData.noAO = true;
beads.frustumCulled = false;
scene.add(beads);
const m4 = new THREE.Matrix4();

// ---------------------------------------------------------------- radiator heat
const heatUp = makeArrowSet(
  [-3.5, -6.5, -9.5, -12.5].map((x) => [
    V(x, RAD.top + 0.6, RAD.z),
    V(x + 0.4, RAD.top + 7, RAD.z + 2),
  ]),
  { mat: heatMat, amp: 0.25, r: 0.12 },
);
const trapped = makeArrowSet(
  [
    [V(-5, RAD.top + 0.5, -0.8), V(-0.9, 0.5, 1.6)],
    [V(-3, -2.5, -0.6), V(-0.8, -0.3, 1.5)],
    [V(-7, -0.5, 0.4), V(-1.0, 0.1, 1.7)],
  ],
  { mat: heatMat, amp: 0.18, r: 0.09 },
);
const coldIn = makeArrowSet(
  [
    [V(-6, 9, -4), V(-3, 2.5, 2)],
    [V(-10, 8, -4), V(-7, 2.2, 2.5)],
    [V(-14, 9, -4), V(-11, 2.5, 2)],
  ],
  { mat: coldMat, amp: 0.25, r: 0.12 },
);

// ---------------------------------------------------------------- props: plug + battery
const plug = new THREE.Group();
put(roundedBox(0.5, 0.42, 0.42, 0.1), real.plastic(0xf4f4f4), 0, 0, 0, plug);
for (const dx of [-0.11, 0.11])
  put(
    new THREE.CylinderGeometry(0.03, 0.03, 0.3, 16).rotateX(PI / 2),
    real.metal(0xd8d8d8, { roughness: 0.2 }),
    dx,
    0,
    -0.33,
    plug,
  );
put(
  new THREE.CylinderGeometry(0.06, 0.06, 0.6, 16).rotateX(PI / 2),
  real.rubber(0xf0f0f0),
  0,
  0,
  0.5,
  plug,
);
plug.position.set(1.65, 0.55, 0.7);
plug.rotation.y = -0.6;
scene.add(plug);
const battery = new THREE.Group();
put(new THREE.CylinderGeometry(0.17, 0.17, 0.62, 48), real.gloss(0x1b1b1d), 0, -0.08, 0, battery);
put(
  new THREE.CylinderGeometry(0.171, 0.171, 0.2, 48),
  real.metal(0xc8843f, { roughness: 0.25 }),
  0,
  0.3,
  0,
  battery,
);
put(
  new THREE.CylinderGeometry(0.06, 0.06, 0.06, 24),
  real.metal(0xdddddd, { roughness: 0.2 }),
  0,
  0.43,
  0,
  battery,
);
battery.position.set(1.65, -0.35, 0.7);
battery.rotation.z = -0.25;
scene.add(battery);

// ---------------------------------------------------------------- yeast dough analogy
const DOUGH = V(12.5, FLOOR, 3);
const bowl = new THREE.Group();
{
  const prof = [
    [0.001, 0],
    [1.3, 0],
    [1.5, 0.12],
    [2.2, 0.9],
    [2.5, 1.9],
    [2.42, 1.95],
    [2.1, 0.95],
    [1.3, 0.2],
    [0.001, 0.18],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  put(new THREE.LatheGeometry(prof, 96), real.ceramic(0xf5f1ea), 0, 0, 0, bowl).material.side =
    THREE.DoubleSide;
}
const doughMat = real.plastic(0xf2ddb0, { roughness: 0.75, clearcoat: 0 });
const dough = put(
  new THREE.SphereGeometry(2.1, 64, 32, 0, PI * 2, 0, PI / 2),
  doughMat,
  0,
  1.0,
  0,
  bowl,
);
const towel = put(roundedBox(3.2, 0.08, 1.4, 0.04), real.fabric(0xc8463d), 2.6, 0.04, 1.2, bowl);
towel.rotation.y = 0.5;
bowl.position.copy(DOUGH);
scene.add(bowl);

// ---------------------------------------------------------------- the hand
const handPivot = new THREE.Group();
scene.add(handPivot);
const hand = createHand({ scale: 2.4, sleeve: 0x6f8196, skin: 0xe9b998 });
scene.remove(hand.group);
handPivot.add(hand.group);

// knob setting → rotation (setting 0 = ❄, 3 = top at rest)
const knobRot = (s) => 2 * PI * (s - 3) * DU;
function setting(t) {
  if (t < T.stell) return 3 + 2 * smooth(ramp(t, 0.02, T.fuenf1 - 0.2));
  if (t < T.rate) return 3 + 2 * smooth(ramp(t, T.drehst + 0.05, T.drehst + 0.75));
  if (t < T.genauso) return 5 - 2 * smooth(ramp(t, T.rate + 0.25, T.drei1));
  if (t < T.cta) return 3 + 2 * smooth(ramp(t, T.genauso + 0.1, T.fuenf2 + 0.1));
  return 5 - 2 * smooth(ramp(t, T.cta + 0.2, T.cta + 2.6));
}

const applyCamera = shotCamera(shots);

// ---------------------------------------------------------------- render
function renderAt(t) {
  const s = setting(t);
  const rot = knobRot(s);
  knob.rotation.z = rot;
  handPivot.rotation.z = rot - PI / 2;
  // the hand grips the front cap and turns with it (hook + "drehst")
  const grip = [0, 0.95, 1.5];
  const away = [0, 2.6, 2.6];
  const R = [PI / 2 - 0.35, 0, 0];
  if (t < T.stell)
    hand.track(t, [
      { t: -0.6, pos: away, rot: R, pose: "open" },
      { t: -0.05, pos: grip, rot: R, pose: "grab" },
      { t: T.fuenf1 - 0.15, pos: grip, rot: R, pose: "grab" },
      { t: T.fuenf1 + 0.2, pos: away, rot: R, pose: "open", out: true },
    ]);
  else
    hand.track(t, [
      { t: T.drehst - 0.35, pos: away, rot: R, pose: "open" },
      { t: T.drehst, pos: grip, rot: R, pose: "grab" },
      { t: T.drehst + 0.85, pos: grip, rot: R, pose: "grab" },
      { t: T.dabei, pos: away, rot: R, pose: "open", out: true },
    ]);

  // no power, no battery → ✕
  plug.visible = t >= T.strom && t < T.denkt;
  plug.scale.copy(squash(t, T.strom + 0.05));
  battery.visible = t >= T.batterie - 0.1 && t < T.denkt;
  battery.scale.copy(squash(t, T.batterie - 0.05));

  // x-ray: the wax stretch and the valve stretch
  const xr =
    smooth(ramp(t, T.wachs1 - 0.25, T.wachs1 + 0.25)) * (1 - ramp(t, T.rate - 0.1, T.rate + 0.15)) +
    smooth(ramp(t, T.stift2 - 0.1, T.stift2 + 0.3)) *
      (1 - ramp(t, T.payoff - 0.05, T.payoff + 0.3));
  setXray(XRAY, xr);
  inside.visible = xr > 0.02;
  const sz = waxScale(t);
  placeInside(sz);
  const glow = 0.25 + (1.6 * (sz - 1)) / 0.35 + 0.6 * pop(t, T.wachs1, T.drehkopf);
  waxMat.emissiveIntensity = glow;
  waxLight.intensity = 1.5 * glow * xr;
  animateArrows(pushArrow, t, pop(t, T.schiebt, T.rate) + pop(t, T.drueckt, T.payoff));

  // hot water
  const showBeads = t >= T.zimmer && t < T.payoff && xr > 0.5;
  beads.visible = showBeads;
  if (showBeads) {
    const ph = phaseAt(t);
    for (let i = 0; i < NB; i++) {
      const d = ((i / NB) * totalL + ph) % totalL;
      m4.makeTranslation(along(d));
      beads.setMatrixAt(i, m4);
    }
    beads.instanceMatrix.needsUpdate = true;
  }

  // radiator warms up, frost melts
  radMat.emissiveIntensity =
    0.035 * smooth(ramp(t, T.offen, T.drueckt)) * (t < T.payoff ? 1 : 0) +
    0.07 * smooth(ramp(t, T.payoff, T.payoff + 2));
  frostMat.opacity = 0.9 - 0.65 * smooth(ramp(t, T.payoff, T.schwitzt + 0.5));
  animateArrows(heatUp, t, pop(t, T.payoff + 0.3, T.fakt));
  animateArrows(trapped, t, pop(t, T.staut, T.cta));
  animateArrows(coldIn, t, pop(t, T.bude - 0.2, T.drehst));

  // the curtain: gathered on the right, sweeps across in the "Übrigens"
  const close = smooth(ramp(t, T.vorhang - 0.2, T.vorhang + 1.1));
  curtain.scale.x = 0.42 + 0.58 * close;
  curtain.position.x = 7.2 - 8.4 * close + Math.sin(t * 0.7) * 0.08;

  // dough rises
  bowl.visible = t >= T.hefeteig - 0.6 && t < T.schiebt;
  const rise = smooth(ramp(t, T.hefeteig + 0.1, T.aufgeht + 0.7));
  dough.scale.set(1 + 0.12 * rise, 0.5 + 0.9 * rise, 1 + 0.12 * rise);

  // ✕: "kein bisschen schneller", "keine Batterie", "keine Stärke"
  if (t < T.stell) showNope(pop(t, T.schneller1 + 0.15, T.stell), -2.2, 2.2, 0.4, 1.4);
  else if (t < T.denkt) showNope(pop(t, T.batterie + 0.3, T.denkt), 1.65, 0.1, 1.0, 1.1);
  else showNope(pop(t, T.staerke, T.rund), 0, 1.05, -0.45, 0.55);

  // LED: what the 3 really means
  if (t >= T.rund && t < T.stift2)
    showPanel(pop(t, T.rund, T.stift2), "STUFE 3", "20 °C", LED.yellow);
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
