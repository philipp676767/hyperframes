// Scene of #50 "Katze schnurrt": an orange tabby purring on the window seat
// of a Vienna living room on a rainy evening. Hand strokes her (frame 0) →
// purr rings from the throat → x-ray: larynx + vocal folds flapping 25×/s →
// the Vienna lab: a larynx alone in a dish still purrs → the yellow pads on
// the folds → guitar string with weights → bandaged paw, calm teal rings →
// a lion that roars but can't purr.
import {
  THREE,
  V,
  ramp,
  smooth,
  pop,
  flat,
  scene,
  setXray,
  showNope,
  showPanel,
  LED,
  labels,
  squash,
  puff,
  highlights,
  shotCamera,
  renderFrame,
  start,
  facet,
  facetMat,
  jitter,
  clamp01,
} from "./world.js";
import { guitar, STRING, lab } from "./set.js";
import { createHand } from "./hand.js";
import { counter } from "./hud.js";
import { makeCat, makeLarynx, makeRings } from "./cat.js";
import { T, shots, LABELS, HIGHLIGHTS, CAT, LION, LION_S, DISH, LAB } from "./beats.js";

highlights(HIGHLIGHTS);
const applyCamera = shotCamera(shots, 1.0);
const between = (t, a, b) => t >= a && t < b;

// ---------------------------------------------------------------- the cat
const cat = makeCat({ seed: 3 });
cat.group.position.set(...CAT);
scene.add(cat.group);
const throatW = new THREE.Vector3();
// bandage on the near front paw (from "Schmerzen")
const bandage = new THREE.Group();
{
  const wrap = flat(0x7fd0f0, { roughness: 0.9 });
  for (let i = 0; i < 3; i++) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.08, 12), wrap);
    b.rotation.z = Math.PI / 2;
    b.position.x = -0.1 + i * 0.09;
    b.rotation.x = (i - 1) * 0.25;
    b.castShadow = true;
    bandage.add(b);
  }
  const plaster = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.16), flat(0xff6f86));
  plaster.position.set(0.0, 0.15, 0);
  bandage.add(plaster);
  bandage.position.set(1.22, 0.13, 0.26);
  cat.group.add(bandage);
}

// ---------------------------------------------------------------- purr rings
const rings = makeRings(5, 0xffd23f);
const labRings = makeRings(4, 0xffd23f);

// ---------------------------------------------------------------- the viewer's hand
const hand = createHand({ scale: 1.0, sleeve: 0x4a7bd6 });

// ---------------------------------------------------------------- lab: larynx alone in a dish
const labLarynx = makeLarynx();
labLarynx.group.position.set(...DISH);
labLarynx.group.scale.setScalar(1.8);
labLarynx.group.rotation.x = 0.55;
scene.add(labLarynx.group);
{
  const glass = new THREE.MeshStandardMaterial({
    color: 0xcfefff,
    roughness: 0.05,
    metalness: 0.1,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });
  const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.8, 0.22, 28, 1, true), glass);
  dish.position.set(DISH[0], DISH[1] - 0.33, DISH[2]);
  dish.userData.noAO = true;
  scene.add(dish);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.02, 28), glass);
  base.position.set(DISH[0], DISH[1] - 0.43, DISH[2]);
  scene.add(base);
  const liquid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.78, 0.78, 0.06, 28),
    flat(0xffd6e0, { roughness: 0.2, transparent: true, opacity: 0.6 }),
  );
  liquid.position.set(DISH[0], DISH[1] - 0.38, DISH[2]);
  scene.add(liquid);
  // air tube from a small pump on the left
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        V(LAB[0] - 2.6, 1.3, LAB[2] - 0.6),
        V(LAB[0] - 1.6, 1.6, LAB[2] - 0.2),
        V(LAB[0] - 0.55, 1.15, LAB[2] - 0.35),
        V(DISH[0] - 0.1, DISH[1] - 0.35, DISH[2]),
      ]),
      30,
      0.04,
      6,
    ),
    new THREE.MeshStandardMaterial({
      color: 0xd8f3ff,
      roughness: 0.1,
      transparent: true,
      opacity: 0.6,
    }),
  );
  scene.add(tube);
  const pump = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.5, 0.6),
    flat(0x3a6fd8, { roughness: 0.4 }),
  );
  pump.position.set(LAB[0] - 2.8, 1.38, LAB[2] - 0.6);
  pump.castShadow = true;
  scene.add(pump);
  const led = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 8, 6),
    flat(0x3dff7a, { emissive: 0x3dff7a, emissiveIntensity: 2 }),
  );
  led.position.set(LAB[0] - 2.6, 1.5, LAB[2] - 0.29);
  scene.add(led);
}
// the brain that is NOT there (crossed out)
const brain = new THREE.Group();
{
  const g = jitter(new THREE.IcosahedronGeometry(1, 2), 0.12, 5);
  const m = new THREE.Mesh(facet(g, 0.08, 4), facetMat(flat(0xf59ab0, { roughness: 0.6 })));
  m.scale.set(0.42, 0.3, 0.34);
  m.castShadow = true;
  brain.add(m);
  const groove = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.2, 0.62), flat(0xc9607a));
  groove.position.y = 0.2;
  brain.add(groove);
  brain.position.set(LAB[0] - 0.95, 1.75, LAB[2] - 0.4);
  scene.add(brain);
}
// monitor showing the purr wave
const waveCanvas = document.createElement("canvas");
waveCanvas.width = 512;
waveCanvas.height = 320;
const waveTex = new THREE.CanvasTexture(waveCanvas);
waveTex.colorSpace = THREE.SRGBColorSpace;
{
  const scr = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 1.4),
    new THREE.MeshBasicMaterial({ map: waveTex }),
  );
  scr.position.set(LAB[0] + 2.6, 2.3, LAB[2] - 1.73);
  scr.userData.noAO = true;
  scene.add(scr);
}
function drawWave(t, k) {
  const g = waveCanvas.getContext("2d");
  g.fillStyle = "#0d1b24";
  g.fillRect(0, 0, 512, 320);
  g.strokeStyle = "rgba(79,209,197,0.25)";
  g.lineWidth = 2;
  for (let x = 0; x < 512; x += 64) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, 320);
    g.stroke();
  }
  g.strokeStyle = "#ffd23f";
  g.lineWidth = 6;
  g.beginPath();
  for (let x = 0; x <= 512; x += 4) {
    const y = 175 + Math.sin(x * 0.11 - t * 14) * 70 * k * (0.7 + 0.3 * Math.sin(x * 0.013));
    if (x === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.stroke();
  g.fillStyle = "#4fd1c5";
  g.font = "800 40px Montserrat, sans-serif";
  g.fillText(k > 0.05 ? "25 Hz" : "—", 20, 52);
  waveTex.needsUpdate = true;
}
void lab;

// ---------------------------------------------------------------- the guitar's low string + weights
const stringMat = flat(0xe8d9b8, { metalness: 0.7, roughness: 0.3, emissive: 0x3a2a10 });
let stringMesh = null;
const SX = -0.1;
const weights = [0.35, 0.5, 0.65].map((f) => {
  const w = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.075, 1),
    flat(0xffd23f, { metalness: 0.6, roughness: 0.3, emissive: 0x6a4a00 }),
  );
  w.castShadow = true;
  guitar.add(w);
  return { w, f };
});
function stringAt(t, amp) {
  const pts = [];
  const N = 40;
  for (let i = 0; i <= N; i++) {
    const f = i / N;
    pts.push(
      V(SX, STRING.y0 + (STRING.y1 + 0.5 - STRING.y0) * f, STRING.z + Math.sin(Math.PI * f) * amp),
    );
  }
  if (stringMesh) {
    stringMesh.geometry.dispose();
    guitar.remove(stringMesh);
  }
  stringMesh = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.014, 5),
    stringMat,
  );
  guitar.add(stringMesh);
  for (const { w, f } of weights)
    w.position.set(
      SX,
      STRING.y0 + (STRING.y1 + 0.5 - STRING.y0) * f,
      STRING.z + Math.sin(Math.PI * f) * amp,
    );
}

// ---------------------------------------------------------------- the lion
const lion = makeCat({
  fur: 0xdba45a,
  stripe: 0,
  cream: 0xf4dfb6,
  mane: 0x9a5426,
  eyeColor: 0xe8b030,
  seed: 9,
});
lion.group.position.set(...LION);
lion.group.rotation.y = Math.PI;
scene.add(lion.group);
setXray(lion.shellMats, 0);
lion.inside.visible = false;

// ---------------------------------------------------------------- render
function renderAt(t) {
  applyCamera(t); // first: the rings face the camera of this frame

  // ---- the cat: purring all the time, x-ray while the inside is explained
  const look =
    smooth(ramp(t, T.cmt - 0.1, T.cmt + 0.5)) *
    (1 - smooth(ramp(t, T.verrueckt - 0.3, T.verrueckt)));
  const eyes = Math.max(look, between(t, T.fakt, T.loewe + 2) ? 1 : 0);
  cat.update(t, { eyes, look, purr: 1, breathe: 1 });
  const xk =
    smooth(ramp(t, T.motor + 0.05, T.motor + 0.4)) * (1 - smooth(ramp(t, T.hand - 0.2, T.hand))) +
    smooth(ramp(t, T.ein, T.ein + 0.35)) * (1 - smooth(ramp(t, T.viel - 0.15, T.viel)));
  setXray(cat.shellMats, xk);
  cat.inside.visible = xk > 0.02;
  for (const e of cat.edges) e.visible = xk > 0.02;
  // macro inside the throat: the fur is gone, only the larynx + windpipe
  const macro = between(t, T.ganz, T.viel);
  cat.body.visible = !macro;
  cat.neckPivot.visible = !macro;
  for (const e of cat.edges) if (macro) e.visible = false;

  // vocal folds flapping (visual 6 Hz; slowmo makes it visible)
  const flap = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * 6);
  cat.larynx.set(flap * 0.9, 0);

  // ---- purr rings out of the throat
  cat.group.updateMatrixWorld();
  throatW.copy(cat.LARYNX);
  cat.group.localToWorld(throatW);
  const calm = smooth(ramp(t, T.beruhigt, T.beruhigt + 0.6)) * (1 - ramp(t, T.fakt, T.fakt + 0.3));
  let rk = 1;
  let rsize = 1.5;
  if (between(t, T.ganz, T.viel)) rk = 0; // macro inside: no rings over the larynx
  if (between(t, T.verrueckt, T.ton)) rk = 0; // lab + guitar
  if (between(t, T.viel, T.cmt)) rsize = 3.2; // wide: huge rings around the small cat
  if (between(t, T.ton, T.warum)) rsize = 3.0; // deep tone
  if (between(t, T.loewe, T.richtig)) rk = 0.35;
  if (t >= T.richtig) rsize = 2.4;
  rings.update(t, rk, throatW, {
    size: rsize,
    speed: between(t, T.ton, T.warum) ? 0.8 : 1.6,
    colorHex: calm > 0.5 ? 0x7fe3d0 : 0xffd23f,
  });

  // ---- the hand: strokes her on frame 0, then holds her throat
  hand.track(t, [
    { t: -0.7, pos: [0.0, 2.85, -0.2], rot: [0.12, -Math.PI / 2, 0], pose: "open" },
    { t: 0.0, pos: [-0.35, 2.7, -0.2], rot: [0.12, -Math.PI / 2, 0], pose: "open" },
    { t: 0.95, pos: [-1.55, 2.6, -0.25], rot: [0.05, -Math.PI / 2, 0], pose: "open" },
    { t: 1.25, pos: [-0.9, 3.05, -0.15], rot: [0.2, -Math.PI / 2, 0], pose: "open" },
    { t: 1.6, pos: [-0.3, 2.72, -0.2], rot: [0.12, -Math.PI / 2, 0], pose: "open" },
    { t: 2.6, pos: [-1.55, 2.6, -0.25], rot: [0.05, -Math.PI / 2, 0], pose: "open" },
    {
      t: T.schnurren2,
      pos: [-0.9, 3.3, 0.6],
      rot: [0.3, -Math.PI / 2, 0],
      pose: "open",
      out: true,
    },
    {
      t: T.hand - 0.25,
      pos: [2.0, 2.2, 0.5],
      rot: [0.1, -Math.PI / 2, -Math.PI / 2],
      pose: "open",
    },
    { t: T.kehle, pos: [1.16, 1.98, 0.0], rot: [0.1, -Math.PI / 2, -Math.PI / 2], pose: "open" },
    {
      t: T.ein - 0.1,
      pos: [1.14, 1.98, 0.0],
      rot: [0.1, -Math.PI / 2, -Math.PI / 2],
      pose: "open",
    },
    {
      t: T.ein + 0.2,
      pos: [2.0, 2.5, 0.5],
      rot: [0.1, -Math.PI / 2, -Math.PI / 2],
      pose: "open",
      out: true,
    },
  ]);
  if (between(t, T.kehle, T.ein)) {
    const tr = 0.012 + 0.02 * pop(t, T.vibriert, T.ein, 0.1);
    hand.group.position.x += Math.sin(t * 151) * tr;
    hand.group.position.y += Math.sin(t * 173 + 1) * tr;
  }

  // ---- counter: "Rate mal, wie oft …" → 25 per second
  const slowEnd = T.rate + (T.mal25 - T.rate) * 0.3;
  const ck = pop(t, T.rate + 0.05, T.viel);
  const n = t < T.mal25 ? Math.floor(24 * smooth(ramp(t, T.rate + 0.1, slowEnd))) : 25;
  counter("schlaege", ck, {
    label: "SCHLÄGE PRO SEKUNDE",
    value: n,
    x: 70,
    y: 1260,
    color: t >= T.mal25 ? "#ffd23f" : "#ffffff",
  });

  // ---- lab
  const labPurr = smooth(ramp(t, T.geschnurrt, T.geschnurrt + 0.3));
  const lf = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * 6 * (t >= T.geschnurrt ? 1 : 0));
  labLarynx.set(
    t >= T.geschnurrt ? lf * 0.9 : 0.1,
    smooth(ramp(t, T.polster + 0.05, T.polster + 0.6)),
  );
  labLarynx.group.position.y = DISH[1] + (t >= T.geschnurrt ? Math.sin(t * 157) * 0.006 : 0);
  labRings.update(t, between(t, T.geschnurrt, T.gewichte) ? labPurr : 0, labLarynx.group.position, {
    size: 1.6,
  });
  if (between(t, T.verrueckt - 0.1, T.gewichte + 0.1)) drawWave(t, labPurr);
  showNope(pop(t, T.gehirn + 0.12, T.geschnurrt), LAB[0] - 0.95, 1.8, LAB[2] - 0.15, 0.55);

  // ---- guitar string: weights clip on, then the heavy string is plucked
  if (between(t, T.gewichte - 0.5, T.warum + 0.5)) {
    const dt = t - T.saite;
    const amp = dt > 0 ? 0.11 * Math.exp(-dt * 0.5) * Math.sin(dt * Math.PI * 2 * 1.6) : 0;
    stringAt(t, amp);
  }
  weights.forEach(({ w }, i) => {
    const at = T.gewichte + 0.35 + i * 0.12;
    w.visible = t >= at;
    if (w.visible) w.scale.copy(squash(t, at, 0.5));
  });

  // ---- pain + calm
  bandage.visible = t >= T.warum + 0.3;
  if (bandage.visible) bandage.scale.copy(squash(t, T.warum + 0.3, 0.6));

  // ---- the lion
  const lk = t >= T.fakt + 0.12;
  lion.group.visible = lk;
  if (lk) {
    lion.group.scale.copy(squash(t, T.fakt + 0.12, 0.7, LION_S));
    lion.group.scale.z *= -1; // mirrored: the head turns to the camera
    puff("lion", t, T.fakt + 0.3, LION[0] - 1, 0.05, LION[2], 2.2);
  }
  const roar =
    smooth(ramp(t, T.loewe, T.loewe + 0.25)) * (1 - smooth(ramp(t, T.loewe + 1.3, T.loewe + 1.7)));
  lion.update(t, { eyes: 1, look: 0.6 * roar, mouth: roar, purr: 0, breathe: 1 + roar });
  showNope(
    pop(t, T.loewe + 0.45, T.richtig),
    LION[0] - 1.0 * LION_S,
    1.12 * LION_S,
    LION[2] + 0.6,
    0.6,
  );

  // ---- LED facts
  if (between(t, T.millimeter, T.gewichte))
    showPanel(pop(t, T.millimeter, T.gewichte), "POLSTER", "BIS 4 mm", LED.yellow);
  else showPanel(0);

  labels(t, LABELS);
  renderFrame();
}

void clamp01;
start(renderAt);
