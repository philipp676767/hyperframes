// Chapter 6 "Noch 60 Sekunden": Armstrong flies the Eagle by hand over the
// boulders to the landing site, the fuel call-outs, a ghost Eagle shows what
// an abort would mean, dust, the contact light, touchdown, and the re-hook:
// the one ascent engine (descent stage in x-ray).
import {
  THREE,
  V,
  scene,
  ramp,
  smooth,
  pop,
  real,
  roundedBox,
  showNope,
  showPanel,
  LED,
  labels,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import "./set.js";
import { makeLM, makeDust, moonHeight } from "./welt.js";
import { readout, counter, meter } from "./hud.js";
import { T, PANEL, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);

const lm = makeLM();
scene.add(lm.group);
const LMW = V();
for (const s of shots) if (s.rel === "lm") s.rel = LMW;
const path = new THREE.CatmullRomCurve3([
  V(44, 25, -62),
  V(27, 16, -41),
  V(13, 9, -18),
  V(4, 4, -5),
  V(0.6, 1.2, -0.8),
  V(0, 0, 0),
]);
const lmAt = (t) => {
  const u = Math.pow(ramp(t, 0, T.kontakt), 0.85);
  return path.getPoint(u);
};
const dust = makeDust(220, { size: 1.1 });

// x-ray of the descent stage for the re-hook (the ascent engine sits inside it)
const descentMats = [];
lm.descent.traverse((o) => {
  if (o.isMesh && o.material && !o.material.transparent) {
    o.material = o.material.clone();
    o.material.transparent = true;
    descentMats.push(o.material);
  }
});
const engineGlow = new THREE.PointLight(0xffb040, 0, 4, 1.5);
engineGlow.position.set(0, 2.9, 0);
lm.group.add(engineGlow);
const bell = new THREE.Mesh(
  new THREE.CylinderGeometry(0.25, 0.48, 0.7, 40, 1, true),
  real.metal(0xd0a050, {
    roughness: 0.35,
    side: THREE.DoubleSide,
    emissive: 0x6a3a00,
    emissiveIntensity: 0,
  }),
);
bell.position.set(0, 2.85, 0);
lm.group.add(bell);

// "what if we abort": a ghost Eagle splits apart
const ghost = makeLM();
ghost.group.traverse((o) => {
  if (o.isMesh) {
    o.material = new THREE.MeshStandardMaterial({
      color: 0x9fd0ff,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    o.castShadow = false;
  }
});
scene.add(ghost.group);

// the contact-light panel
const PN = V(...PANEL);
const panel = new THREE.Group();
panel.position.copy(PN);
scene.add(panel);
const lampMat = new THREE.MeshStandardMaterial({
  color: 0x1a2a4a,
  emissive: 0x4aa8ff,
  emissiveIntensity: 0,
  roughness: 0.3,
});
{
  const plate = new THREE.Mesh(
    roundedBox(0.5, 0.02, 0.3, 0.01),
    real.plastic(0x3a3d42, { roughness: 0.6 }),
  );
  panel.add(plate);
  const lamp = new THREE.Mesh(roundedBox(0.14, 0.03, 0.09, 0.01), lampMat);
  lamp.position.set(0, 0.02, -0.02);
  panel.add(lamp);
  const cv = document.createElement("canvas");
  cv.width = 512;
  cv.height = 96;
  const c = cv.getContext("2d");
  c.fillStyle = "#3a3d42";
  c.fillRect(0, 0, 512, 96);
  c.fillStyle = "#f2f2ee";
  c.font = '800 44px "Montserrat", sans-serif';
  c.textAlign = "center";
  c.fillText("LUNAR CONTACT", 256, 64);
  const tx = new THREE.CanvasTexture(cv);
  tx.colorSpace = THREE.SRGBColorSpace;
  const lbl = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 0.056),
    new THREE.MeshStandardMaterial({ map: tx }),
  );
  lbl.rotation.x = -Math.PI / 2;
  lbl.position.set(0, 0.012, 0.08);
  panel.add(lbl);
  const glow = new THREE.PointLight(0x4aa8ff, 0, 1.2, 2);
  glow.position.set(0, 0.1, -0.02);
  glow.name = "glow";
  panel.add(glow);
  const spot = new THREE.SpotLight(0xfff0dc, 8, 3, 0.7, 0.5, 1.2);
  spot.position.set(0.4, 1.0, 0.8);
  spot.target = panel;
  panel.add(spot);
}

const applyCamera = shotCamera(shots, 1);

function renderAt(t) {
  const p = lmAt(t);
  const landed = t >= T.kontakt;
  LMW.copy(p);
  lm.group.position.copy(p).setY(p.y + moonHeight(p.x, p.z));
  const sway = landed ? 0 : 1;
  lm.group.rotation.set(
    0.08 * sway + Math.sin(t * 0.9) * 0.025 * sway,
    0.4 - 0.2 * ramp(t, 0, T.kontakt),
    Math.sin(t * 0.6) * 0.03 * sway,
  );
  const engineOn = t < T.aus + 0.1;
  lm.descentFlame.userData.set(engineOn ? 1 : 0, t);
  const h = p.y;
  dust.set(
    engineOn ? smooth(ramp(-h, -14, -3)) * 1.3 : Math.max(0, 1.3 - (t - T.aus) * 0.6),
    t,
    p.x,
    moonHeight(p.x, p.z),
    p.z,
  );

  // ghost: the abort — ascent stage blasts off, descent stage falls away
  const gOn = t >= T.abbruch && t < T.s30;
  ghost.group.visible = gOn;
  ghost.group.position.copy(lm.group.position);
  ghost.group.rotation.copy(lm.group.rotation);
  const ab = Math.max(0, t - T.sprengt);
  ghost.ascent.position.y = ab * ab * 1.6;
  ghost.descent.position.y = -ab * 1.2;
  ghost.ascentFlame.userData.set(ab > 0 ? 1 : 0, t);
  showNope(gOn ? pop(t, T.verloren - 0.2, T.s30) : 0, p.x, p.y + 6, p.z, 3);

  // contact light
  const lit = t >= T.kontakt - 0.05;
  lampMat.emissiveIntensity = lit ? 3 : 0;
  panel.getObjectByName("glow").intensity = lit ? 2 : 0;

  // re-hook: descent stage goes x-ray, the ascent engine glows
  const xr = smooth(ramp(t, T.merkst + 0.8, T.einem));
  descentMats.forEach((m) => {
    m.opacity = 1 - 0.75 * xr;
    m.depthWrite = xr < 0.02;
  });
  bell.material.emissiveIntensity = 2 * xr;
  engineGlow.intensity = 3 * xr;

  // displays (one at a time)
  const realAlt = Math.max(0, Math.round(h * 6));
  readout("alt", pop(t, T.aldrin, T.funk - 0.1), {
    label: "Höhe",
    value: realAlt,
    unit: "m",
    x: 110,
    y: 190,
  });
  const left = Math.max(0, Math.ceil(60 - (t - T.s60) * (30 / (T.s30 - T.s60))));
  counter("fuel", pop(t, T.s60, T.staub), {
    label: "Sekunden Treibstoff",
    value: left,
    x: 110,
    y: 190,
    color: "#ff4b2b",
  });
  meter("rest", pop(t, T.knapp, T.merkst - 0.2), {
    label: "Rest im Tank",
    value: 0.04,
    text: "20–45 s",
    x: 110,
    y: 190,
    color: "#ff4b2b",
  });
  if (t >= T.ziel + 0.5 && t < T.aldrin)
    showPanel(pop(t, T.ziel + 0.5, T.aldrin), "MEER DER RUHE", "0 % WASSER", LED.blue);
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
