// "So funktionieren Noise-Cancelling-Kopfhörer". A mannequin head on a city
// plaza wears big headphones; the red street noise from a bus runs into the
// right ear cup, the chip mirrors it (oscilloscope screen), the speaker plays
// the anti-noise and the wave goes flat. World, captions, panel, labels and
// camera come from world.js; all timing lives in beats.js.
import {
  THREE,
  ramp,
  lerp,
  smooth,
  outBack,
  inBack,
  pop,
  rng,
  V,
  scene,
  camera,
  flat,
  M,
  xrayMaterial,
  xrayEdges,
  setXray,
  roundedRect,
  makeArrowSet,
  animateArrows,
  forceMat,
  showPanel,
  LED,
  labels,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { createWorld } from "./environments.js";
import { T, shots, LABELS } from "./beats.js";

createWorld({ env: "stadt", sky: "morgen" });

const TAU = Math.PI * 2;
const waveMat = (color) => new THREE.MeshBasicMaterial({ color });
const RED = waveMat(0xff3d1f);
const BLUE = waveMat(0x2f9bff);
const GREEN = waveMat(0x3dff7a);

// ---------------------------------------------------------------- waves
// A wave is a tube rebuilt every frame from a pure function of time.
function makeWave(mat, r, parent = scene) {
  const mesh = new THREE.Mesh(new THREE.BufferGeometry(), mat);
  mesh.userData.r = r;
  mesh.visible = false;
  parent.add(mesh);
  return mesh;
}
// points from a to b, displaced along +y by amp * env(f) * sin(cycles·f − phase)
function setWave(mesh, a, b, amp, cycles, phase, env = () => 1, f0 = 0, f1 = 1) {
  const pts = [];
  const n = 90;
  for (let i = 0; i <= n; i++) {
    const f = lerp(f0, f1, i / n);
    const p = a.clone().lerp(b, f);
    p.y += amp * env(f) * Math.sin(TAU * cycles * f - phase);
    pts.push(p);
  }
  mesh.geometry.dispose();
  mesh.geometry = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(pts),
    180,
    mesh.userData.r,
    6,
  );
  mesh.visible = true;
}

// ---------------------------------------------------------------- mannequin
const skin = flat(0xeedfd3, { roughness: 0.6 });
{
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.8, 0.5, 18), flat(0x5b6b7a));
  ped.position.y = 0.25;
  ped.castShadow = true;
  ped.receiveShadow = true;
  scene.add(ped);
  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.62, 18, 12), skin);
  torso.scale.set(1.25, 0.55, 0.75);
  torso.position.y = 0.85;
  torso.castShadow = true;
  scene.add(torso);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.22, 0.45, 12), skin);
  neck.position.y = 1.28;
  scene.add(neck);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.6, 20, 14), skin);
  head.scale.set(0.88, 1.05, 0.95);
  head.position.y = 1.75;
  head.castShadow = true;
  scene.add(head);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.18, 6), skin);
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 1.72, 0.6);
  scene.add(nose);
}

// ---------------------------------------------------------------- headphones
const phones = new THREE.Group();
scene.add(phones);
const CUP_Y = 1.72;
const cupMats = [xrayMaterial(0xf5f2ec), xrayMaterial(0xf5f2ec)];
const dark = flat(0x2c2b33, { roughness: 0.5 });
const accent = flat(0xff6f61, { roughness: 0.4 });
const cushionMat = flat(0x3a3740, { roughness: 0.9, emissive: 0xffc23d, emissiveIntensity: 0 });
const cushions = [];
{
  const cupGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.3, 28);
  cupGeo.rotateZ(Math.PI / 2);
  [-1, 1].forEach((s, i) => {
    const cup = new THREE.Mesh(cupGeo, cupMats[i]);
    cup.position.set(s * 0.9, CUP_Y, 0);
    cup.castShadow = true;
    phones.add(cup);
    const edges = xrayEdges(cupGeo);
    edges.position.copy(cup.position);
    phones.add(edges);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.035, 6, 32), accent);
    rim.rotation.y = Math.PI / 2;
    rim.position.set(s * 1.05, CUP_Y, 0);
    phones.add(rim);
    const cushion = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.1, 10, 28), cushionMat);
    cushion.rotation.y = Math.PI / 2;
    cushion.position.set(s * 0.68, CUP_Y, 0);
    phones.add(cushion);
    cushions.push(cushion);
    const yoke = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.32, 0.12), dark);
    yoke.position.set(s * 0.92, CUP_Y + 0.5, 0);
    phones.add(yoke);
  });
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.07, 8, 40, Math.PI), dark);
  band.position.y = CUP_Y + 0.62;
  band.scale.y = 0.75;
  band.castShadow = true;
  phones.add(band);
  const pad = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.06, 8, 24, Math.PI * 0.5), accent);
  pad.position.y = CUP_Y + 0.62;
  pad.scale.y = 0.75;
  pad.rotation.z = Math.PI * 0.25;
  phones.add(pad);
}

// microphone on the outer face of the right cup
const MIC = V(1.08, 1.92, 0.14);
const mic = new THREE.Group();
const micDot = flat(0x1c1c22, { emissive: 0xff3d1f, emissiveIntensity: 0 });
{
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.07, 12), dark);
  body.rotation.z = Math.PI / 2;
  mic.add(body);
  const grill = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 12), micDot);
  grill.rotation.z = Math.PI / 2;
  grill.position.x = 0.04;
  mic.add(grill);
  mic.position.copy(MIC).setX(1.05);
  phones.add(mic);
}

// chip inside the right cup
const chip = new THREE.Group();
const chipMat = flat(0x2f9e5a, { emissive: 0x3dff7a, emissiveIntensity: 0 });
{
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.2, 0.26), chipMat);
  chip.add(board);
  const die = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.1), flat(0x1c1c22));
  die.position.x = 0.02;
  chip.add(die);
  chip.position.set(0.93, 1.58, 0.1);
  phones.add(chip);
}

// speaker facing the ear
const speaker = new THREE.Group();
const ringMat = new THREE.MeshBasicMaterial({ color: 0x2f9bff, transparent: true, depthWrite: false, depthTest: false });
const rings = [];
{
  const cone = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.12, 0.1, 20, 1, true),
    flat(0xc9d2dc, { side: THREE.DoubleSide, emissive: 0x2f9bff, emissiveIntensity: 0.25 }),
  );
  cone.rotation.z = Math.PI / 2;
  speaker.add(cone);
  const magnet = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 14), M.chrome);
  magnet.rotation.z = Math.PI / 2;
  magnet.position.x = 0.08;
  speaker.add(magnet);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 6), accent);
  cap.scale.x = 0.4;
  cap.position.x = -0.03;
  speaker.add(cap);
  speaker.position.set(0.8, CUP_Y, 0);
  phones.add(speaker);
  for (let i = 0; i < 3; i++) {
    const r = new THREE.Mesh(new THREE.TorusGeometry(1, 0.025, 6, 28), ringMat);
    r.rotation.y = Math.PI / 2;
    phones.add(r);
    rings.push(r);
  }
}

// ---------------------------------------------------------------- bus
const bus = new THREE.Group();
const puffs = [];
{
  const body = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.5, 1.3), flat(0xf2b630, { roughness: 0.4 }));
  body.position.y = 1.05;
  body.castShadow = true;
  bus.add(body);
  const win = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.5, 1.32), flat(0x5a6f99, { roughness: 0.2 }));
  win.position.y = 1.35;
  bus.add(win);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.1, 1.2), flat(0xffffff));
  roof.position.y = 1.85;
  bus.add(roof);
  for (const sx of [-1.5, 1.5])
    for (const sz of [-0.62, 0.62]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 10), M.rubber);
      w.rotation.x = Math.PI / 2;
      w.position.set(sx, 0.3, sz);
      bus.add(w);
    }
  const pm = new THREE.MeshStandardMaterial({ color: 0x9a9aa6, transparent: true, opacity: 0.7, flatShading: true });
  for (let i = 0; i < 6; i++) {
    const p = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 0), pm);
    bus.add(p);
    puffs.push(p);
  }
  bus.position.set(3.6, 0, -8.0);
  scene.add(bus);
}
const NOISE_FROM = V(3.9, 1.5, -7.25);

// ---------------------------------------------------------------- plane
const plane = new THREE.Group();
{
  const white = flat(0xffffff, { roughness: 0.4 });
  const fus = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 3.4, 10), white);
  fus.rotation.z = Math.PI / 2;
  plane.add(fus);
  const wing = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 4.2), white);
  plane.add(wing);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 0.08), accent);
  tail.position.set(-1.5, 0.45, 0);
  plane.add(tail);
  const stab = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.06, 1.4), white);
  stab.position.set(-1.5, 0.1, 0);
  plane.add(stab);
  for (const z of [-1.0, 1.0]) {
    const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.5, 8), M.steel);
    eng.rotation.z = Math.PI / 2;
    eng.position.set(0.2, -0.18, z);
    plane.add(eng);
  }
  plane.visible = false;
  scene.add(plane);
}

// ---------------------------------------------------------------- speech bubbles
const bubbles = [];
{
  const bubbleGeo = new THREE.ExtrudeGeometry(roundedRect(0.46, 0.32, 0.12), {
    depth: 0.05,
    bevelEnabled: false,
  });
  bubbleGeo.center();
  const white = flat(0xffffff);
  const dotMat = flat(0x2c2b33);
  const r = rng(7);
  for (let i = 0; i < 3; i++) {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(bubbleGeo, white));
    const tailM = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 4), white);
    tailM.position.set(-0.12, -0.2, 0);
    tailM.rotation.z = Math.PI + 0.4;
    g.add(tailM);
    for (const dx of [-0.11, 0, 0.11]) {
      const d = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), dotMat);
      d.position.set(dx, 0, 0.04);
      g.add(d);
    }
    g.userData.from = V(2.0 + r() * 0.5, 1.5 + i * 0.35, 1.0 + r() * 0.6);
    g.userData.at = T.stimmen + 0.15 + i * 0.4;
    g.visible = false;
    scene.add(g);
    bubbles.push(g);
  }
}
const CUSHION_HIT = V(0.86, 1.75, 0.38);

// ---------------------------------------------------------------- oscilloscope
const SCREEN_POS = V(-4.4, 0, 1.2);
const scope = new THREE.Group();
scope.position.copy(SCREEN_POS);
scope.rotation.y = 0.35;
const screen = new THREE.Group(); // local origin = screen centre
screen.position.y = 2.3;
scope.add(screen);
{
  const frame = new THREE.Mesh(
    new THREE.ExtrudeGeometry(roundedRect(3.1, 2.5, 0.25), { depth: 0.2, bevelEnabled: false }),
    flat(0x2c2b33, { roughness: 0.5 }),
  );
  frame.position.set(0, 2.3, -0.2);
  frame.castShadow = true;
  scope.add(frame);
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(2.8, 2.2),
    flat(0x0f2230, { emissive: 0x0b2a3a, emissiveIntensity: 0.6 }),
  );
  face.position.z = 0.01;
  screen.add(face);
  const gridMat = new THREE.MeshBasicMaterial({ color: 0x2b5468 });
  for (let i = -3; i <= 3; i++) {
    const v = new THREE.Mesh(new THREE.PlaneGeometry(0.012, 2.2), gridMat);
    v.position.set(i * 0.4, 0, 0.02);
    screen.add(v);
  }
  for (let i = -2; i <= 2; i++) {
    const h = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 0.012), gridMat);
    h.position.set(0, i * 0.45, 0.02);
    screen.add(h);
  }
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.1, 8), M.steel);
  pole.position.y = 0.55;
  scope.add(pole);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 0.12, 14), M.steel);
  foot.position.y = 0.06;
  scope.add(foot);
  scene.add(scope);
}
const scopeRed = makeWave(RED, 0.03, screen);
const scopeBlue = makeWave(BLUE, 0.03, screen);
const scopeSum = makeWave(GREEN, 0.035, screen);
const flipArrow = makeArrowSet([[V(0, 0.82, 0.12), V(0, -0.34, 0.12)]], {
  parent: screen,
  mat: forceMat,
  amp: 0,
  r: 0.035,
});

const streetRed = makeWave(RED, 0.04);
const streetBlue = makeWave(BLUE, 0.03);
const planeWave = makeWave(RED, 0.05);

const applyCamera = shotCamera(shots);

// ---------------------------------------------------------------- render
function renderAt(t) {
  applyCamera(t);

  // headphones: on in the hook, fly off on "bauen", back on "Außen"
  const off = inBack(ramp(t, T.bauen, T.bauen + 0.35));
  const on = outBack(ramp(t, T.aussen + 0.1, T.aussen + 0.6));
  const k = t < T.aussen ? 1 - off : on;
  phones.visible = k > 0.001;
  phones.scale.setScalar(Math.max(0.001, k));
  phones.position.y = (1 - k) * 0.8;

  const xr =
    smooth(ramp(t, T.trick - 0.1, T.trick + 0.4)) * (1 - ramp(t, T.schau, T.schau + 0.5));
  setXray(cupMats, xr);

  const built = (a) => (t < T.bauen ? 1 : outBack(ramp(t, a, a + 0.35)));
  mic.scale.setScalar(Math.max(0.001, built(T.mikrofon)));
  const phase = t * 4.2;
  micDot.emissiveIntensity = t >= T.mikrofon || t < T.bauen ? 1.2 + Math.sin(phase * 2) : 0;
  const ck = t < T.bauen ? 0 : outBack(ramp(t, T.chip, T.chip + 0.35));
  chip.visible = ck > 0.001;
  chip.scale.setScalar(Math.max(0.001, ck));
  chipMat.emissiveIntensity =
    t >= T.aefft && t < T.antischall + 0.4 ? 0.6 + 0.6 * Math.abs(Math.sin(t * 9)) : 0.15;
  const sk = t < T.bauen ? 0 : outBack(ramp(t, T.lautsprecher, T.lautsprecher + 0.35));
  speaker.visible = sk > 0.001;
  speaker.scale.setScalar(Math.max(0.001, sk));
  const playing = t >= T.lautsprecher && t < T.schau;
  speaker.position.x = 0.8 + (playing ? Math.sin(t * 38) * 0.014 : 0);
  const rk = pop(t, T.lautsprecher + 0.3, T.berg2 + 0.2);
  rings.forEach((r, i) => {
    const c = (t * 1.4 + i / 3) % 1;
    r.visible = rk > 0.001;
    r.scale.setScalar(Math.max(0.001, (0.12 + c * 0.22) * rk));
    r.position.set(0.74 - c * 0.12, CUP_Y, 0);
  });
  ringMat.opacity = 0.9;

  // cushion glows when it is named; it swallows the voices
  const ck2 = pop(t, T.polster, T.laerm4);
  cushionMat.emissiveIntensity = 0.6 * ck2;
  cushions[1].scale.setScalar(1 + 0.12 * ck2);

  // street noise: always running into the right cup, flat near it while cancelled
  const cancel =
    smooth(ramp(t, T.still1 - 0.15, T.still1 + 0.35)) * (1 - ramp(t, T.bauen, T.bauen + 0.3)) +
    smooth(ramp(t, T.zack - 0.15, T.zack + 0.3));
  const envStreet = (f) =>
    smooth(ramp(f, 0, 0.08)) * (1 - Math.min(1, cancel) * smooth(ramp(f, 0.62, 0.9)));
  setWave(streetRed, NOISE_FROM, MIC, 0.22, 7, phase * TAU * 0.25, envStreet);
  const blueK = pop(t, T.extra, T.bauen) + pop(t, T.lautsprecher + 0.4, T.zack + 0.6);
  if (blueK > 0.01) {
    setWave(streetBlue, NOISE_FROM, MIC, -0.22 * blueK, 7, phase * TAU * 0.25, envStreet, 0.6, 1);
  } else streetBlue.visible = false;

  // bus idling, exhaust puffs
  bus.position.y = Math.abs(Math.sin(t * 31)) * 0.02;
  puffs.forEach((p, i) => {
    const c = (t * 0.6 + i / puffs.length) % 1;
    p.position.set(-2.4 - c * 0.8, 0.4 + c * 1.2, 0.3);
    p.scale.setScalar(0.4 + c * 1.4);
  });

  // plane: passes over the head on "Flugzeug", again in the drone shot
  const pa = ramp(t, T.aber, T.stimmen + 0.2);
  const pb = ramp(t, T.uebrigens - 0.8, T.uebrigens + 5);
  if (pa > 0 && pa < 1) {
    plane.visible = true;
    plane.position.set(lerp(-9, 9, pa), 7.2, -6);
    const env = (f) => 1 - smooth(ramp(f, 0.6, 0.88));
    setWave(planeWave, plane.position.clone().add(V(0, -0.4, 0)), V(1.06, 1.85, 0), 0.38, 3.5, phase * TAU * 0.12, env);
  } else if (pb > 0 && pb < 1) {
    plane.visible = true;
    plane.position.set(lerp(-18, 18, pb), 6.5, -5);
    planeWave.visible = false;
  } else {
    plane.visible = false;
    planeWave.visible = false;
  }

  // voices fly at the cushion and get squashed
  bubbles.forEach((b) => {
    const a = b.userData.at;
    const fly = ramp(t, a, a + 0.5);
    const squash = ramp(t, a + 0.5, a + 0.7);
    b.visible = t >= a && squash < 1;
    if (!b.visible) return;
    b.position.copy(b.userData.from).lerp(CUSHION_HIT, smooth(fly));
    b.quaternion.copy(camera.quaternion);
    const s = outBack(ramp(t, a, a + 0.25)) * (1 - squash);
    b.scale.set(Math.max(0.001, s * (1 + squash)), Math.max(0.001, s), Math.max(0.001, s));
  });

  // oscilloscope: copy, mirror, add → zero
  const sc = outBack(ramp(t, T.aefft - 0.1, T.aefft + 0.4));
  scope.visible = sc > 0.001;
  scope.scale.setScalar(Math.max(0.001, sc));
  if (scope.visible) {
    const draw = ramp(t, T.aefft, T.aefft + 0.7);
    const merge = smooth(ramp(t, T.berg2, T.nul));
    const zero = smooth(ramp(t, T.nul, T.nul + 0.4));
    const flip = smooth(ramp(t, T.spiegel + 0.2, T.spiegel + 0.7));
    const ph = 0; // standing waves: the crest/trough arrow stays on them
    const yRed = lerp(0.6, 0.25, merge);
    const yBlue = lerp(lerp(0.6, -0.1, smooth(ramp(t, T.spiegel, T.spiegel + 0.5))), 0.25, merge);
    const left = V(-1.3, 0, 0.05);
    const right = V(1.3, 0, 0.05);
    if (draw > 0.01)
      setWave(scopeRed, left.clone().setY(yRed), right.clone().setY(yRed), 0.28 * (1 - zero), 2.5, ph, () => 1, 0, draw);
    if (t >= T.spiegel && zero < 1)
      setWave(scopeBlue, left.clone().setY(yBlue).setZ(0.07), right.clone().setY(yBlue).setZ(0.07), 0.28 * Math.cos(Math.PI * flip) * (1 - zero), 2.5, ph);
    else scopeBlue.visible = false;
    if (zero >= 1) scopeRed.visible = false;
    if (zero > 0.01)
      setWave(scopeSum, left.clone().setY(0.25).setZ(0.09), right.clone().setY(0.25).setZ(0.09), 0, 1, 0, () => 1, 0.5 - zero / 2, 0.5 + zero / 2);
    else scopeSum.visible = false;
  }
  animateArrows(flipArrow, t, pop(t, T.berg1, T.antischall));

  if (t >= T.nul && t < T.aber) showPanel(pop(t, T.nul, T.aber), "BERG + TAL", "= 0", LED.green);
  else showPanel(0);

  labels(t, LABELS);
  renderFrame();
}

start(renderAt);
