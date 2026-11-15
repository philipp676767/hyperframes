// Finale "Die Antwort": the Eagle on the Moon; the DSKY, the pen; what is
// left today (the descent stage, footprints, the fallen flag, the mirror);
// a laser from the Earth hits the mirror (Übrigens); a fingertip; then the
// calm, slowly moving end-screen shot (nothing written in the middle band).
import {
  THREE,
  V,
  scene,
  real,
  ramp,
  smooth,
  pop,
  squash,
  showPanel,
  LED,
  labels,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import "./set.js";
import { makeLM, makeDSKY, makePhone, makePen, DSKY_POS } from "./welt.js";
import { createHand } from "./hand.js";
import { readout } from "./hud.js";
import { T, HAND, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);
const lm = makeLM();
lm.group.rotation.y = 0.2;
scene.add(lm.group);
const dsky = makeDSKY();
dsky.group.position.copy(DSKY_POS);
scene.add(dsky.group);
const pen = makePen();
pen.position.copy(DSKY_POS).add(V(0.3, 0, 0.12));
scene.add(pen);
const phone = makePhone();
phone.position.copy(DSKY_POS).add(V(0.75, -0.02, 0.15));
phone.rotation.set(0, -0.3, 0);
scene.add(phone);

// what is left: footprints, the fallen flag, the mirror
const tex = (w, hh, draw) => {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = hh;
  draw(cv.getContext("2d"));
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};
const printMat = new THREE.MeshStandardMaterial({
  transparent: true,
  depthWrite: false,
  roughness: 1,
  map: tex(128, 256, (c) => {
    c.fillStyle = "rgba(40,38,35,0.8)";
    c.beginPath();
    c.ellipse(64, 75, 46, 65, 0, 0, Math.PI * 2);
    c.ellipse(64, 195, 39, 55, 0, 0, Math.PI * 2);
    c.fill();
  }),
});
for (let i = 0; i < 60; i++) {
  const a = i * 0.37;
  const r = 4.5 + (i % 7) * 0.9;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.32), printMat);
  m.rotation.set(-Math.PI / 2, 0, a + 1.5);
  m.position.set(Math.cos(a) * r, 0.015, Math.sin(a) * r + 2);
  scene.add(m);
}
const mirror = new THREE.Group();
{
  const plate = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.06, 0.46),
    real.metal(0xc9cdd2, { roughness: 0.4 }),
  );
  mirror.add(plate);
  for (let i = 0; i < 10; i++)
    for (let j = 0; j < 10; j++) {
      const c = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 0.01, 16),
        real.metal(0xeef3ff, { roughness: 0.05 }),
      );
      c.position.set(-0.24 + i * 0.053, 0.035, -0.18 + j * 0.04);
      mirror.add(c);
    }
  for (const [x, z] of [
    [-0.25, -0.18],
    [0.25, -0.18],
    [-0.25, 0.18],
    [0.25, 0.18],
  ]) {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.4, 8),
      real.metal(0xb0b4b9),
    );
    leg.position.set(x, -0.2, z);
    mirror.add(leg);
  }
  mirror.position.set(-5, 0.42, 7);
  mirror.rotation.set(-0.35, 0.4, 0);
  scene.add(mirror);
}
const flag = new THREE.Group();
{
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 2.4, 12),
    real.metal(0xd0d3d8),
  );
  pole.position.y = 1.2;
  flag.add(pole);
  const cloth = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 0.95),
    real.fabric(0xe9e6de, { side: THREE.DoubleSide }),
  );
  cloth.position.set(0.75, 1.88, 0);
  flag.add(cloth);
  flag.position.set(2.6, 0.05, 7.4);
  flag.rotation.z = -1.45;
  scene.add(flag);
}
// the laser from the Earth (-70, 95, -230) to the mirror
const EARTH = V(-70, 95, -230);
const MIR = V(-5, 0.5, 7);
const beamMat = new THREE.MeshBasicMaterial({
  color: 0x3dff7a,
  transparent: true,
  opacity: 0.85,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  fog: false,
});
const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1, 8), beamMat);
beam.userData.noAO = true;
scene.add(beam);
const spot = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), beamMat);
spot.position.copy(MIR);
scene.add(spot);
const laserLight = new THREE.PointLight(0x3dff7a, 0, 3, 1.5);
laserLight.position.copy(MIR).add(V(0, 0.3, 0));
scene.add(laserLight);

// a fingertip with its nail
const hand = createHand({ scale: 0.25 });
const HP = V(...HAND);
{
  const l = new THREE.PointLight(0xfff0dc, 6, 3, 1.5);
  l.position.copy(HP).add(V(0.4, 0.6, 0.6));
  scene.add(l);
}

const applyCamera = shotCamera(shots, 1);

function renderAt(t) {
  // today: only the descent stage stays (the cabin left)
  const today = t >= T.nach;
  lm.ascent.visible = !today;
  flag.visible = today;
  dsky.show({ prog: "68", verb: "06", noun: "43", r1: "+00000", r2: "+00000", r3: "+00000" });
  pen.visible = t >= T.filz - 0.2 && t < T.nach;
  pen.scale.copy(squash(t, T.filz - 0.15));
  pen.rotation.set(0.25, t * 1.5, 0.9);
  phone.visible = t >= T.handy - 0.2 && t < T.fakt;
  phone.scale.copy(squash(t, T.handy - 0.2));

  // the laser shot: a pulse travels from the Earth to the mirror
  const k = smooth(ramp(t, T.laser, T.laser + 1.2));
  const on = t >= T.laser && t < T.naegel;
  beam.visible = on;
  const head = EARTH.clone().lerp(MIR, k);
  beam.position.copy(EARTH).add(head).multiplyScalar(0.5);
  beam.scale.set(1, Math.max(0.01, EARTH.distanceTo(head)), 1);
  beam.quaternion.setFromUnitVectors(V(0, 1, 0), MIR.clone().sub(EARTH).normalize());
  spot.visible = on && k > 0.98;
  spot.scale.setScalar(1 + Math.sin(t * 20) * 0.15);
  laserLight.intensity = on && k > 0.98 ? 4 : 0;

  hand.track(t, [
    {
      t: T.naegel - 0.5,
      pos: [HP.x + 0.3, HP.y + 0.1, HP.z + 0.2],
      rot: [0.3, -1.8, 0],
      pose: "point",
    },
    { t: T.naegel, pos: [HP.x, HP.y, HP.z], rot: [0.3, -1.8, 0], pose: "point" },
    { t: T.cta, pos: [HP.x, HP.y, HP.z], rot: [0.3, -1.8, 0.05], pose: "point", out: true },
  ]);

  readout("cm", pop(t, T.mond2 + 0.6, T.cta - 0.2), {
    label: "Pro Jahr",
    value: "3,8",
    unit: "cm",
    x: 110,
    y: 190,
  });
  if (t >= T.weil + 1.8 && t < T.computer)
    showPanel(pop(t, T.weil + 1.8, T.computer), "ALLE WUSSTEN", "WAS ZÄHLT", LED.green);
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
