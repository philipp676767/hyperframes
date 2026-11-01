// #44 Smartwatch-Puls — "Deine Smartwatch blitzt dir gerade Licht ins Blut."
// STUDIO (origin): your forearm resting on a stone pillar of the Donaukanal
// balustrade, a smartwatch on the wrist (live screen: pulse curve + BPM).
// Hook: the watch hovers just above the skin and fires green beams into it;
// it flips to show its belly (green LEDs, light sensor), then sits back.
// JOG: a little jogger runs along the promenade, the watch glowing green.
// HAUT (under the floor): a cut through the wrist — the giant watch on the
// skin roof, green photons diving into the dermis and coming back to the
// sensor, the artery bulging with every beat and swallowing photons, a
// tattoo's ink eating the light, the payoff macro (green swallowed, red
// bounces), and a big beating heart for the bonus fact.
import {
  THREE,
  ramp,
  smooth,
  clamp01,
  lerp,
  outBack,
  pop,
  V,
  rng,
  scene,
  flat,
  facet,
  facetMat,
  patches,
  jitter,
  roundedRect,
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
import { readout, counter } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS, HAUT, AY, WRIST, HEART, JOG, LEDPOS } from "./beats.js";

highlights(HIGHLIGHTS);
const PI = Math.PI;
const _c = new THREE.Color();
const _v = V(0, 0, 0);
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = V(1, 1, 1);
const _e = new THREE.Euler();
const between = (t, a, b) => t >= a && t < b;
const hash = (a, b) => {
  const v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

// ---------------------------------------------------------------- heartbeat
// one clock for everything that pulses; faster while you jog
const bpmAt = (t) =>
  between(t, T.stell, T.rate) ? 138 : between(t, T.uhr, T.darum) ? 74 : t >= T.was ? 62 : 72;
// phase integrated piecewise (deterministic): beats/second * time
function beatPhase(t) {
  const segs = [
    [0, T.stell, 72],
    [T.stell, T.rate, 138],
    [T.rate, T.uhr, 72],
    [T.uhr, T.darum, 74],
    [T.darum, T.was, 72],
    [T.was, 1e9, 62],
  ];
  let ph = 0;
  for (const [a, b, bpm] of segs) {
    if (t <= a) break;
    ph += ((Math.min(t, b) - a) * bpm) / 60;
  }
  return ph;
}
// pulse shape 0..1 (systolic peak + a small notch bump)
function pulse(t) {
  const f = beatPhase(t) % 1;
  return Math.exp(-(((f - 0.08) / 0.07) ** 2)) + 0.35 * Math.exp(-(((f - 0.33) / 0.09) ** 2));
}

// ================================================================ STUDIO
const SKIN = 0xf2bb9a;
const skinMat = flat(SKIN, { roughness: 0.62 });
const skinSmooth = new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.55 });
const SLEEVE = 0xff6b6b; // your coral running jacket (also the jogger's)
const studio = new THREE.Group();
scene.add(studio);
// stone pillar of the balustrade under the forearm
{
  const stone = flat(0xd9d0c4, { roughness: 0.85 });
  const p = new THREE.Mesh(
    facet(new THREE.BoxGeometry(0.95, 1.0, 0.95, 2, 2, 2), 0.04, 3),
    facetMat(stone),
  );
  p.position.set(-0.55, 0.5, 0);
  const cap = new THREE.Mesh(
    facet(new THREE.BoxGeometry(1.15, 0.14, 1.15, 2, 1, 2), 0.04, 4),
    facetMat(flat(0xe6ded2)),
  );
  cap.position.set(-0.55, 1.07, 0);
  for (const m of [p, cap]) {
    m.castShadow = m.receiveShadow = true;
    studio.add(m);
  }
}
const armG = new THREE.Group();
studio.add(armG);
const rAt = (X) => 0.32 + ((1.3 - X) / 3.0) * 0.1;
{
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.32, 3.0, 40, 6), skinSmooth);
  arm.rotation.z = PI / 2;
  arm.scale.x = 0.88;
  arm.position.set(-0.2, AY, 0);
  arm.castShadow = arm.receiveShadow = true;
  armG.add(arm);
  const fist = new THREE.Mesh(
    facet(jitter(new THREE.BoxGeometry(0.62, 0.5, 0.6, 2, 2, 2), 0.04, 5), 0.05, 5),
    facetMat(skinMat),
  );
  fist.position.set(1.55, AY - 0.02, 0.02);
  fist.castShadow = true;
  armG.add(fist);
  for (let i = 0; i < 4; i++) {
    const k = new THREE.Mesh(new THREE.SphereGeometry(0.1, 7, 5), skinMat);
    k.position.set(1.84, AY + 0.14, -0.22 + i * 0.15);
    armG.add(k);
  }
  const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.26, 3, 6), skinMat);
  thumb.rotation.z = PI / 2.4;
  thumb.position.set(1.6, AY + 0.12, 0.33);
  armG.add(thumb);
  const sleeve = new THREE.Mesh(
    facet(jitter(new THREE.CylinderGeometry(0.55, 0.5, 0.9, 12, 2), 0.04, 6), 0.08, 6),
    facetMat(flat(SLEEVE, { roughness: 0.8 })),
  );
  sleeve.rotation.z = PI / 2;
  sleeve.position.set(-1.95, AY + 0.02, 0);
  sleeve.castShadow = true;
  armG.add(sleeve);
}
function canvasTex(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  if (draw) draw(c.getContext("2d"), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
// the tattoo on the wrist: a black blackwork band (triangles + dots), under the watch
const tatMat = new THREE.MeshStandardMaterial({
  map: canvasTex(1024, 256, (g, w) => {
    g.fillStyle = "#121018";
    g.fillRect(0, 70, w, 116);
    g.fillStyle = "rgba(0,0,0,0)";
    g.clearRect(0, 0, w, 70);
    g.clearRect(0, 186, w, 70);
    g.fillStyle = "#121018";
    for (let x = 0; x < w; x += 64) {
      g.beginPath();
      g.moveTo(x, 70);
      g.lineTo(x + 32, 18);
      g.lineTo(x + 64, 70);
      g.fill();
      g.beginPath();
      g.moveTo(x, 186);
      g.lineTo(x + 32, 238);
      g.lineTo(x + 64, 186);
      g.fill();
      g.beginPath();
      g.arc(x + 32, 8, 6, 0, 7);
      g.arc(x + 32, 248, 6, 0, 7);
      g.fill();
    }
    g.fillStyle = "#f2bb9a";
    for (let x = 32; x < w; x += 64) {
      g.beginPath();
      g.moveTo(x - 14, 128);
      g.lineTo(x, 100);
      g.lineTo(x + 14, 128);
      g.lineTo(x, 156);
      g.fill();
    }
  }),
  transparent: true,
  alphaTest: 0.05,
  roughness: 0.45,
  polygonOffset: true,
  polygonOffsetFactor: -2,
});
const tattoo = (() => {
  // a ring band around the wrist from X 0.45 to 1.25 (under and beside the watch)
  const g = new THREE.CylinderGeometry(rAt(0.45) * 1.008, rAt(1.25) * 1.008, 0.8, 48, 1, true);
  const m = new THREE.Mesh(g, tatMat);
  m.rotation.z = PI / 2;
  m.scale.x = 0.88;
  m.position.set(0.85, AY, 0);
  tatMat.map.wrapS = THREE.RepeatWrapping;
  tatMat.map.repeat.set(4, 1);
  armG.add(m);
  return m;
})();
// green glow spot on the skin under the hovering watch
const glowSpot = new THREE.Mesh(
  new THREE.CircleGeometry(0.13, 24),
  new THREE.MeshBasicMaterial({
    color: 0x3dff7a,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  }),
);
glowSpot.rotation.x = -PI / 2;
glowSpot.position.set(WRIST[0], AY + 0.88 * rAt(WRIST[0]) + 0.006, 0);
glowSpot.userData.noAO = true;
armG.add(glowSpot);

// ---------------------------------------------------------------- the watch
const watch = new THREE.Group();
studio.add(watch);
const watchBody = new THREE.Group(); // tilts / flips around its own centre
watch.add(watchBody);
const WW = 0.4; // across the arm (z)
const WL = 0.48; // along the arm (x)
const WH = 0.12;
{
  const caseMat = flat(0x23252c, { metalness: 0.7, roughness: 0.22 });
  const shape = roundedRect(WL, WW, 0.11);
  const body = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, {
      depth: WH,
      bevelEnabled: true,
      bevelSize: 0.02,
      bevelThickness: 0.02,
      bevelSegments: 2,
    }),
    caseMat,
  );
  body.rotation.x = PI / 2; // extrude goes down (-y), shape y → +z
  body.position.set(0, WH / 2, -WW / 2);
  body.castShadow = true;
  watchBody.add(body);
  // crown + button on the +z side
  const crown = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.05, 12),
    flat(0xb8bcc6, { metalness: 0.9, roughness: 0.2 }),
  );
  crown.rotation.x = PI / 2;
  crown.position.set(0.08, 0, WW / 2 + 0.03);
  watchBody.add(crown);
}
// the live screen
const SCR = { w: 300, h: 250 };
const scrCanvas = document.createElement("canvas");
scrCanvas.width = SCR.w;
scrCanvas.height = SCR.h;
const scrTex = new THREE.CanvasTexture(scrCanvas);
scrTex.colorSpace = THREE.SRGBColorSpace;
const screen = new THREE.Mesh(
  new THREE.PlaneGeometry(WL - 0.07, WW - 0.07),
  new THREE.MeshBasicMaterial({ map: scrTex, toneMapped: false }),
);
screen.rotation.x = -PI / 2;
screen.position.y = WH / 2 + 0.024;
screen.userData.noAO = true;
watchBody.add(screen);
// the belly: dark glass dome, 2 green LEDs, 4 sensor windows, red/IR LEDs
const belly = new THREE.Group();
belly.position.y = -WH / 2 - 0.02;
watchBody.add(belly);
{
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 24, 8, 0, 2 * PI, PI * 0.72, PI * 0.28),
    flat(0x10141c, { roughness: 0.08, metalness: 0.5 }),
  );
  dome.position.y = 0.11;
  belly.add(dome);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.152, 0.008, 6, 32),
    flat(0x9aa2b0, { metalness: 0.9, roughness: 0.2 }),
  );
  ring.rotation.x = PI / 2;
  ring.position.y = -0.0;
  belly.add(ring);
  for (const [x, z] of [
    [0, 0.085],
    [0, -0.085],
    [0.085, 0],
    [-0.085, 0],
  ]) {
    const d = new THREE.Mesh(
      new THREE.BoxGeometry(0.035, 0.008, 0.035),
      flat(0x1c2a48, { roughness: 0.1, metalness: 0.6 }),
    );
    d.position.set(x * 1.05, -0.032, z * 1.05);
    belly.add(d);
  }
}
const ledMat = new THREE.MeshBasicMaterial({ color: 0x3dff7a, toneMapped: false });
const leds = [-0.035, 0.035].map((x) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.01, 0.022), ledMat);
  m.position.set(x, -0.056, 0);
  belly.add(m);
  return m;
});
// beams from the belly into the skin (only while hovering)
const beamMat = new THREE.MeshBasicMaterial({
  color: 0x5cff8e,
  transparent: true,
  opacity: 0.6,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  toneMapped: false,
});
const beams = Array.from({ length: 5 }, (_, i) => {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.04, 1, 8, 1, true), beamMat);
  m.userData = { x: (i - 2) * 0.05, z: ((i * 37) % 5) * 0.025 - 0.05 };
  m.userData.noAO = true;
  watch.add(m);
  return m;
});
// strap: a band around the wrist, only when the watch sits on it
const strap = new THREE.Mesh(
  new THREE.CylinderGeometry(rAt(WRIST[0]) + 0.025, rAt(WRIST[0]) + 0.025, 0.3, 32, 1, true),
  flat(0x1c1e24, { roughness: 0.55, side: THREE.DoubleSide }),
);
strap.rotation.z = PI / 2;
strap.scale.x = 0.88;
strap.position.set(WRIST[0], AY, 0);
strap.castShadow = true;
studio.add(strap);

function drawScreen(t) {
  const g = scrCanvas.getContext("2d");
  const { w, h } = SCR;
  g.fillStyle = "#000";
  g.fillRect(0, 0, w, h);
  const stumble = between(t, T.merkt, T.stell);
  const lies = between(t, T.uhr, T.darum);
  const cta = t >= T.was;
  // top line: time
  g.fillStyle = "#9aa0aa";
  g.font = '700 26px "Montserrat", sans-serif';
  g.textAlign = "left";
  g.fillText(cta ? "07:46" : "07:42", 18, 34);
  // heart icon
  const hb = pulse(t);
  const hs = 1 + 0.18 * hb;
  g.save();
  g.translate(w - 44, 26);
  g.scale(hs, hs);
  g.fillStyle = stumble ? "#ffb020" : lies ? "#ff3b3b" : "#ff4b5c";
  g.beginPath();
  g.moveTo(0, 12);
  g.bezierCurveTo(-22, -2, -12, -20, 0, -8);
  g.bezierCurveTo(12, -20, 22, -2, 0, 12);
  g.fill();
  g.restore();
  // big value
  let val;
  let col = "#ffffff";
  let unit = "BPM";
  if (lies) {
    const seq = [61, 194, 38, 152, 0, 211, 47, 194];
    val = String(seq[Math.floor((t - T.uhr) * 5) % seq.length]);
    if (val === "0") val = "???";
    col = "#ff4b4b";
  } else if (stumble) {
    val = "!";
    col = "#ffb020";
    unit = "UNREGELMÄSSIG";
  } else {
    val = String(Math.round(bpmAt(t) + Math.sin(t * 0.7) * 1.5));
    if (cta) unit = "RUHEPULS";
  }
  g.fillStyle = col;
  g.font = '800 92px "Montserrat", sans-serif';
  g.fillText(val, 18, 128);
  g.fillStyle = "#9aa0aa";
  g.font = `700 ${unit.length > 6 ? 20 : 26}px "Montserrat", sans-serif`;
  g.fillText(unit, val === "!" ? 70 : 22 + g.measureText(val).width * 0 + val.length * 54, 128);
  // the curve: the light coming back, scrolling
  g.strokeStyle = stumble ? "#ffb020" : lies ? "#ff4b4b" : "#3dff7a";
  g.lineWidth = 5;
  g.lineJoin = "round";
  g.beginPath();
  for (let i = 0; i <= 80; i++) {
    const tt = t - (80 - i) * 0.025;
    let y = pulse(tt);
    if (stumble) {
      const f = beatPhase(tt) % 3;
      if (f > 1 && f < 2) y = pulse(tt - 0.25) * 0.4; // a skipped, early beat
    }
    if (lies) y = hash(Math.floor(tt * 30), 3) * 1.1;
    const x = 14 + (i / 80) * (w - 28);
    const yy = h - 22 - y * 80;
    if (i === 0) g.moveTo(x, yy);
    else g.lineTo(x, yy);
  }
  g.stroke();
  scrTex.needsUpdate = true;
}

// ================================================================ JOGGER
const jogger = new THREE.Group();
scene.add(jogger);
const jog = {};
{
  const jacket = flat(SLEEVE, { roughness: 0.75 });
  const tights = flat(0x23242e, { roughness: 0.7 });
  const skin = flat(SKIN, { roughness: 0.7 });
  const shoe = flat(0xffffff, { roughness: 0.5 });
  const body = new THREE.Group();
  body.position.y = 1.0;
  jogger.add(body);
  jog.body = body;
  const torso = new THREE.Mesh(
    facet(new THREE.CapsuleGeometry(0.2, 0.45, 3, 8), 0.05, 2),
    facetMat(jacket),
  );
  torso.position.y = 0.42;
  torso.castShadow = true;
  body.add(torso);
  const head = new THREE.Mesh(
    facet(new THREE.IcosahedronGeometry(0.17, 1), 0.04, 3),
    facetMat(skin),
  );
  head.position.y = 0.95;
  head.castShadow = true;
  body.add(head);
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 10, 6, 0, 2 * PI, 0, PI * 0.55),
    flat(0x5a3a24),
  );
  hair.position.y = 0.97;
  body.add(hair);
  const bun = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), flat(0x5a3a24));
  bun.position.set(0, 1.08, -0.14);
  body.add(bun);
  const limb = (len, r, mat, parent, x, y) => {
    const piv = new THREE.Group();
    piv.position.set(x, y, 0);
    parent.add(piv);
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 3, 6), mat);
    m.position.y = -len / 2 - r * 0.5;
    m.castShadow = true;
    piv.add(m);
    return piv;
  };
  jog.legL = limb(0.72, 0.085, tights, body, -0.1, 0.05);
  jog.legR = limb(0.72, 0.085, tights, body, 0.1, 0.05);
  for (const l of [jog.legL, jog.legR]) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.09, 0.26), shoe);
    s.position.set(0, -0.92, 0.05);
    l.add(s);
  }
  jog.armL = limb(0.5, 0.06, jacket, body, -0.26, 0.68);
  jog.armR = limb(0.5, 0.06, jacket, body, 0.26, 0.68);
  const jw = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.05, 0.1),
    new THREE.MeshBasicMaterial({ color: 0x3dff7a, toneMapped: false }),
  );
  jw.position.set(-0.02, -0.55, 0.03);
  jog.armL.add(jw);
  jog.watch = jw;
}
const JOG_Z = 1.9;
function jogPos(t) {
  return lerp(6.5, -8.5, ramp(t, T.stell - 0.2, T.herzschlag));
}

// ================================================================ HAUT
const haut = new THREE.Group();
haut.position.set(...HAUT);
scene.add(haut);
const hr = rng(4444);
{
  const g = new THREE.SphereGeometry(42, 32, 16);
  const p = g.attributes.position;
  const col = new Float32Array(p.count * 3);
  const a = new THREE.Color(0x5a1224);
  const b = new THREE.Color(0x0e0307);
  for (let i = 0; i < p.count; i++) {
    _c.copy(b).lerp(a, clamp01((p.getY(i) / 42) * 0.7 + 0.5));
    col.set([_c.r, _c.g, _c.b], i * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const m = new THREE.Mesh(
    g,
    new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false }),
  );
  m.userData.noAO = true;
  haut.add(m);
}
[
  [0xff9aa8, 34, [0, 7, 6]],
  [0xffc0a0, 22, [-6, 3, 6]],
  [0xffb0d0, 22, [7, 3, 6]],
  [0xfff0c8, 30, [HEART[0], 5, 5]],
].map(([c, i, p]) => {
  const l = new THREE.PointLight(c, i, 30, 1.2);
  l.position.set(...p);
  haut.add(l);
  return l;
});
// green light from the LEDs into the skin (a real light, so the tissue glows)
const greenLight = new THREE.PointLight(0x3dff7a, 0, 6, 1.4);
greenLight.position.set(0, 3.6, 1.2);
haut.add(greenLight);
const hAdd = (mesh, x, y, z) => {
  mesh.position.set(x, y, z);
  mesh.receiveShadow = true;
  haut.add(mesh);
  return mesh;
};
// fat floor
hAdd(
  new THREE.Mesh(
    patches(facet(new THREE.BoxGeometry(34, 0.8, 10, 34, 1, 10), 0.05, 1), { amt: 0.08, seed: 2 }),
    facetMat(flat(0xb8823e, { roughness: 0.6 })),
  ),
  4,
  -0.3,
  -2.5,
);
{
  const N = 140;
  const fat = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.5, 1),
    flat(0xffffff, { roughness: 0.25, flatShading: true }),
    N,
  );
  for (let i = 0; i < N; i++) {
    const s = 0.35 + hr() * 0.45;
    _m.compose(
      V(-9 + hr() * 26, 0.05 + hr() * 0.1, -6.5 + hr() * 8.2),
      _q.identity(),
      _s.set(s, s * 0.8, s),
    );
    fat.setMatrixAt(i, _m);
    fat.setColorAt(i, _c.setRGB(0.82, 0.6 + hr() * 0.08, 0.28 + hr() * 0.1));
  }
  haut.add(fat);
}
// dermis back wall
hAdd(
  new THREE.Mesh(
    patches(facet(new THREE.BoxGeometry(34, 3.4, 0.6, 34, 4, 1), 0.06, 3), { amt: 0.1, seed: 5 }),
    facetMat(flat(0xc0505e, { roughness: 0.7 })),
  ),
  4,
  1.5,
  -4.6,
);
// collagen fibres (behind)
const fibreMat = flat(0xf3b3ba, { roughness: 0.5 });
for (let i = 0; i < 12; i++) {
  const y = 0.6 + hr() * 2.0;
  const z = -4 + hr() * 2.6;
  const ph = hr() * 6;
  const pts = [];
  for (let k = 0; k <= 30; k++) {
    const x = -9 + (k / 30) * 18;
    pts.push(V(x, y + Math.sin(x * 1.3 + ph) * 0.18, z + Math.cos(x * 0.9 + ph) * 0.25));
  }
  haut.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 90, 0.06 + hr() * 0.04, 6),
      fibreMat,
    ),
  );
}
// the artery: a glassy red tube along x that bulges with every beat
const VES = { y: 1.75, z: 0.0, r: 0.52 };
const vessel = new THREE.Mesh(
  new THREE.CylinderGeometry(1, 1, 22, 24, 1, true),
  new THREE.MeshStandardMaterial({
    color: 0xd0303f,
    roughness: 0.22,
    transparent: true,
    opacity: 0.42,
    side: THREE.DoubleSide,
    depthWrite: false,
  }),
);
vessel.rotation.z = PI / 2;
hAdd(vessel, 2, VES.y, VES.z);
const NBLOOD = 70;
const bloodMat = flat(0xe0283a, { roughness: 0.4, emissive: 0x000000 });
const blood = new THREE.InstancedMesh(
  new THREE.CylinderGeometry(0.14, 0.14, 0.055, 12),
  bloodMat,
  NBLOOD,
);
blood.frustumCulled = false;
haut.add(blood);
const bloodPh = Array.from({ length: NBLOOD }, () => [hr(), hr() * 6, hr() * 6, 0.3 + hr() * 0.6]);
// epidermis roof (opaque cells), skin base, from z -4.2 to the cut at z ≈ 1.75
const EPI = [];
const epi = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.3, 1),
  flat(0xffffff, { roughness: 0.55, flatShading: true }),
  32 * 12 * 3,
);
epi.frustumCulled = false;
haut.add(epi);
for (let row = 0; row < 3; row++)
  for (let ix = 0; ix < 32; ix++)
    for (let iz = 0; iz < 12; iz++) {
      const x = -8 + ix * 0.5 + (row % 2) * 0.25 + (hr() - 0.5) * 0.06;
      const z = -4 + iz * 0.5 + (row % 2) * 0.25 + (hr() - 0.5) * 0.06;
      const y = 3.0 + row * 0.2;
      const i = EPI.length;
      EPI.push(1);
      _m.compose(
        V(x, y, z),
        _q.setFromEuler(_e.set(0, hr() * 6, 0)),
        _s.set(0.9, 0.42, 0.9).multiplyScalar(0.92 + hr() * 0.14),
      );
      epi.setMatrixAt(i, _m);
      const k = row / 2;
      epi.setColorAt(i, _c.setRGB(lerp(0.86, 0.95, k), lerp(0.46, 0.72, k), lerp(0.48, 0.6, k)));
    }
hAdd(
  new THREE.Mesh(new THREE.BoxGeometry(17, 0.2, 6.0), flat(0xd8737a, { roughness: 0.6 })),
  0,
  2.84,
  -1.25,
);

// the giant watch on the skin roof
const bigWatch = new THREE.Group();
haut.add(bigWatch);
const LIFT = 0.45; // gap between skin and watch, so the light is seen in the air
bigWatch.position.y = LIFT;
const H_LED = [
  [-0.8, 3.76 + LIFT, 0.95],
  [0.8, 3.76 + LIFT, 0.95],
];
const H_SENSOR = [0, 3.76 + LIFT, 0.95];
{
  const caseMat = flat(0x23252c, { metalness: 0.7, roughness: 0.22 });
  const body = new THREE.Mesh(
    new THREE.ExtrudeGeometry(roundedRect(6.2, 4.2, 1.0), {
      depth: 0.6,
      bevelEnabled: true,
      bevelSize: 0.12,
      bevelThickness: 0.12,
      bevelSegments: 2,
    }),
    caseMat,
  );
  body.rotation.x = PI / 2;
  body.position.set(0, 4.55, -2.3);
  bigWatch.add(body);
  const strapM = flat(0x1c1e24, { roughness: 0.55 });
  for (const sx of [-1, 1]) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(5, 0.3, 3.4), strapM);
    s.position.set(sx * 5.4, 3.75, -0.4);
    bigWatch.add(s);
  }
  // sensor dome
  const dome = new THREE.Mesh(
    new THREE.CylinderGeometry(1.7, 1.85, 0.16, 40),
    flat(0x10141c, { roughness: 0.08, metalness: 0.5 }),
  );
  dome.position.set(0, 3.88, 0.2);
  bigWatch.add(dome);
}
const bigLedMat = new THREE.MeshBasicMaterial({ color: 0x3dff7a, toneMapped: false });
const bigLeds = H_LED.map(([x, y, z]) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.3), bigLedMat);
  m.position.set(x, y - LIFT, z);
  bigWatch.add(m);
  return m;
});
const sensorMat = flat(0x1c2a58, {
  roughness: 0.1,
  metalness: 0.6,
  emissive: 0x3dff7a,
  emissiveIntensity: 0,
});
const bigSensor = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.06, 0.5), sensorMat);
bigSensor.position.set(H_SENSOR[0], H_SENSOR[1] - LIFT, H_SENSOR[2]);
bigWatch.add(bigSensor);
// glowing cones under the LEDs
const coneMat = new THREE.MeshBasicMaterial({
  color: 0x3dff7a,
  transparent: true,
  opacity: 0.18,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  toneMapped: false,
  side: THREE.DoubleSide,
});
const cones = H_LED.map(([x, , z]) => {
  const m = new THREE.Mesh(new THREE.ConeGeometry(0.75, 2.0, 20, 1, true), coneMat);
  m.position.set(x, 3.2, z - 0.1);
  m.userData.noAO = true;
  haut.add(m);
  return m;
});
// photons: LED → down into the dermis → back up to the sensor
const NPH = 110;
const phMat = new THREE.MeshBasicMaterial({ color: 0x7dff9e, toneMapped: false });
const photons = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.055, 1), phMat, NPH);
photons.frustumCulled = false;
haut.add(photons);
const PH = Array.from({ length: NPH }, (_, i) => ({
  led: i % 2,
  depth: 2.2 + hr() * 0.75, // lowest point of the path
  dx: (hr() - 0.5) * 0.9,
  z: 0.95 + (hr() - 0.5) * 1.2,
  ph: hr(),
  deep: hr() < 0.45, // reaches the artery
}));
// the tattoo's ink in the upper dermis
const NINK = 26;
const inks = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(1, 1),
  new THREE.MeshStandardMaterial({ color: 0x15121c, roughness: 0.25, flatShading: true }),
  NINK,
);
inks.frustumCulled = false;
haut.add(inks);
const INK = [];
while (INK.length < NINK) {
  const p = V(-2.3 + hr() * 4.6, 2.45 + hr() * 0.35, -0.6 + hr() * 2.1);
  if (INK.some((b) => b.p.distanceTo(p) < 0.42)) continue;
  INK.push({ p, r: 0.13 + hr() * 0.1, rot: hr() * 6, d: hr() * 0.5 });
}
// payoff photons: green dive into the blood and vanish, red bounce away
const NPAY = 36;
const payG = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.04, 1), phMat, NPAY);
const payR = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.04, 1),
  new THREE.MeshBasicMaterial({ color: 0xff5a4a, toneMapped: false }),
  NPAY,
);
for (const m of [payG, payR]) {
  m.frustumCulled = false;
  haut.add(m);
}
const PAY = Array.from({ length: NPAY }, () => ({
  x: -1.6 + hr() * 3.2,
  z: 0.15 + hr() * 0.5,
  ph: hr(),
  ang: hr() * 6,
}));
const absorbFlash = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.12, 1),
  new THREE.MeshBasicMaterial({
    color: 0xb6ffc8,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    toneMapped: false,
  }),
  NPH,
);
absorbFlash.frustumCulled = false;
haut.add(absorbFlash);

// the heart (bonus fact)
const heart = new THREE.Group();
heart.position.set(...HEART);
haut.add(heart);
{
  const red = flat(0xd8263a, { roughness: 0.35 });
  const lobeGeo = facet(jitter(new THREE.IcosahedronGeometry(1, 2), 0.05, 4), 0.06, 4);
  for (const sx of [-1, 1]) {
    const l = new THREE.Mesh(lobeGeo, facetMat(red));
    l.position.set(sx * 0.62, 0.35, 0);
    l.scale.set(1, 1.05, 0.85);
    heart.add(l);
  }
  const tip = new THREE.Mesh(
    facet(new THREE.ConeGeometry(1.45, 2.0, 10, 2), 0.06, 5),
    facetMat(red),
  );
  tip.rotation.z = PI;
  tip.position.y = -0.85;
  tip.scale.z = 0.62;
  heart.add(tip);
  const aorta = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([V(0.2, 0.9, 0), V(0.3, 1.8, 0), V(0.9, 2.2, 0), V(1.5, 1.7, 0)]),
      20,
      0.24,
      8,
    ),
    flat(0xe8475a, { roughness: 0.35 }),
  );
  heart.add(aorta);
  const vein = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([V(-0.4, 0.9, 0.2), V(-0.5, 1.8, 0.2), V(-0.9, 2.3, 0.2)]),
      16,
      0.2,
      8,
    ),
    flat(0x5a6fd8, { roughness: 0.35 }),
  );
  heart.add(vein);
  heart.traverse((o) => o.isMesh && (o.castShadow = true));
}

const applyCamera = shotCamera(shots);

// ================================================================ render
function renderAt(t) {
  const inStudio =
    t < T.licht1 ||
    between(t, T.dreh, T.stell) ||
    between(t, T.puls, T.rate) ||
    between(t, T.nur, T.dunkle) ||
    between(t, T.uhr, T.darum) ||
    t >= T.was;
  const inJog = between(t, T.stell, T.herzschlag);
  const inHaut = !inStudio && !inJog;
  studio.visible = inStudio;
  jogger.visible = inJog;
  haut.visible = inHaut;
  const hb = pulse(t);
  const blink = 0.55 + 0.45 * Math.abs(Math.sin(t * 60)); // strobe (looks steady at speed)

  // ------------------------------------------------ STUDIO
  if (inStudio) {
    // watch: hover (hook) → flip (Dreh) → back on the wrist (merkt)
    const flip = smooth(ramp(t, T.dreh, T.dreh + 0.45));
    const back = smooth(ramp(t, T.merkt - 0.35, T.merkt + 0.05));
    const hover = t < T.licht1 ? 0.3 : 0.42 * flip * (1 - back);
    watch.position.set(WRIST[0], WRIST[1] + hover, 0);
    watchBody.rotation.set(
      -PI * 0.78 * flip * (1 - back) + (t < T.licht1 ? 0.08 : 0),
      0,
      Math.sin(t * 2) * 0.03 * (1 - back),
    );
    strap.visible = t >= T.merkt + 0.05;
    // LED colour: green, briefly red / white with an ✕ on "Nicht rot, nicht weiß"
    const isRed = between(t, T.rot1, T.weiss);
    const isWhite = between(t, T.weiss, T.gruen2);
    ledMat.color.setHex(isRed ? 0xff3b3b : isWhite ? 0xffffff : 0x3dff7a);
    leds.forEach((l) => l.scale.setScalar(t < T.merkt ? 0.85 + 0.3 * blink : 0.001));
    // label point on the flipped LED (world)
    leds[1].getWorldPosition(_v);
    LEDPOS.splice(0, 3, _v.x, _v.y, _v.z);
    // beams + glow spot during the hook hover
    const bk = t < T.licht1 ? 1 : 0;
    beams.forEach((b, i) => {
      b.visible = bk > 0;
      const len = 0.3;
      b.position.set(b.userData.x * 0.6, -len / 2 - 0.07, b.userData.z);
      b.scale.set(1, len, 1);
      b.material.opacity = 0.6 + 0.3 * Math.sin(t * 40 + i);
    });
    glowSpot.material.opacity = bk * (0.55 + 0.25 * Math.sin(t * 30));
    glowSpot.scale.setScalar(1 + 0.15 * hb);
    // tattoo: appears on "Tattoos" (also in the lying-watch shot)
    tattoo.visible = t >= T.tattoos - 0.1 && t < T.was;
    tatMat.opacity = smooth(ramp(t, T.tattoos - 0.1, T.tattoos + 0.35));
    drawScreen(t);
    // ✕ next to the red / white LED
    showNope(
      pop(t, T.rot1 + 0.1, T.weiss, 0.15) + pop(t, T.weiss + 0.1, T.gruen2, 0.15),
      WRIST[0] - 0.2,
      WRIST[1] + 0.62,
      0.15,
      0.12,
    );
  } else showNope(0, 0, 0, 0);
  if (inHaut) showNope(pop(t, T.schlecht, T.darum, 0.2), 0, 3.0 + HAUT[1], 1.6, 0.6);

  // ------------------------------------------------ JOGGER
  if (inJog) {
    const x = jogPos(t);
    jogger.position.set(x, 0, JOG_Z);
    jogger.rotation.y = -PI / 2;
    JOG.x = x;
    JOG.y = 0;
    JOG.z = JOG_Z;
    const s = t * 9.5;
    jog.legL.rotation.x = Math.sin(s) * 0.8;
    jog.legR.rotation.x = -Math.sin(s) * 0.8;
    jog.armL.rotation.x = -Math.sin(s) * 0.9 - 0.4;
    jog.armR.rotation.x = Math.sin(s) * 0.9 - 0.4;
    jog.body.position.y = 1.0 + Math.abs(Math.sin(s)) * 0.08;
    jog.body.rotation.x = 0.12;
    jog.watch.material.color.setHex(0x3dff7a).multiplyScalar(0.6 + 0.4 * blink);
  }

  // ------------------------------------------------ HAUT
  if (inHaut) {
    // artery bulges with each beat, blood rushes
    const sw = 1 + 0.32 * hb + (between(t, T.schwall - 0.4, T.mehr) ? 0.1 * hb : 0);
    vessel.scale.set(VES.r * sw, 1, VES.r * sw);
    const flowT = beatPhase(t) * 1.2 + t * 0.4;
    bloodPh.forEach(([a, b, c, rr], i) => {
      const x = -9 + ((flowT * 1.6 + a * 22) % 22);
      _m.compose(
        _v.set(
          x,
          VES.y + Math.sin(b + t) * VES.r * sw * rr * 0.75,
          VES.z + Math.cos(c + t) * VES.r * sw * rr * 0.75,
        ),
        _q.setFromEuler(_e.set(b, 0, PI / 2 + Math.sin(t + b))),
        _s.set(1, 1, 1),
      );
      blood.setMatrixAt(i, _m);
    });
    blood.instanceMatrix.needsUpdate = true;
    const payoff = t >= T.darum;
    bloodMat.emissive
      .setHex(0x1a6a2a)
      .multiplyScalar(payoff ? 0.4 * pop(t, T.schluckt - 0.1, T.fakt, 0.2) : 0);

    // LEDs fire; the strobe slows into a visible blink during "Rate mal"
    const slowBlink = between(t, T.rate, T.hunderte)
      ? Math.sin((t - T.rate) * PI * 5) > 0
        ? 1
        : 0.05
      : blink;
    bigLeds.forEach((l) => l.scale.setScalar(Math.max(0.001, slowBlink)));
    bigLedMat.color.setHex(0x3dff7a);
    cones.forEach((c) => (c.visible = !payoff && slowBlink > 0.5));
    coneMat.opacity = 0.16 + 0.06 * Math.sin(t * 50);
    greenLight.intensity = payoff ? 6 : 14 * slowBlink;

    // tattoo ink (from Dunkle to Darum)
    const inkOn = between(t, T.dunkle - 0.1, T.darum);
    inks.visible = inkOn;
    if (inkOn) {
      INK.forEach((b, i) => {
        const g = outBack(ramp(t, T.dunkle - 0.1 + b.d * 0.4, T.dunkle + 0.4 + b.d * 0.4));
        _m.compose(
          b.p,
          _q.setFromEuler(_e.set(b.rot, b.rot * 2 + t * 0.2, 0)),
          _s.setScalar(Math.max(0.001, b.r * g)),
        );
        inks.setMatrixAt(i, _m);
      });
      inks.instanceMatrix.needsUpdate = true;
    }

    // photons: each runs LED → bottom → sensor in 1.1 s; deep ones may die in the
    // blood (more blood = more die), with ink most die in the ink
    let back = 0;
    const absorbP = 0.25 + 0.6 * hb;
    PH.forEach((p, i) => {
      const cyc = t / 1.1 + p.ph;
      const k = cyc % 1;
      const n = Math.floor(cyc);
      const L = H_LED[p.led];
      const bottomY = p.deep ? VES.y + VES.r * (1 + 0.32 * hb) + 0.05 : p.depth + 0.25;
      const mid = V((L[0] + H_SENSOR[0]) / 2 + p.dx, bottomY, p.z);
      // where it dies (0..1 along the path) or 2 = it gets back
      let die = 2;
      if (inkOn && hash(i, n + 7) < 0.85) die = 0.3;
      else if (p.deep && hash(i, n) < absorbP) die = 0.5;
      const vis = !payoff && t >= -0.5;
      let x;
      let y;
      let z;
      if (k < 0.5) {
        const u = k / 0.5;
        x = lerp(L[0], mid.x, u);
        y = lerp(L[1], mid.y, Math.sin((u * PI) / 2));
        z = lerp(L[2], p.z, u);
      } else {
        const u = (k - 0.5) / 0.5;
        x = lerp(mid.x, H_SENSOR[0] + p.dx * 0.3, u);
        y = lerp(mid.y, H_SENSOR[1], 1 - Math.cos((u * PI) / 2));
        z = lerp(p.z, H_SENSOR[2] + (p.z - 0.95) * 0.3, u);
      }
      const alive = vis && k < die;
      if (!alive) {
        _m.compose(_v.set(0, -999, 0), _q.identity(), _s.setScalar(0.001));
        photons.setMatrixAt(i, _m);
      } else {
        _m.compose(_v.set(x, y, z), _q.identity(), _s.setScalar(1));
        photons.setMatrixAt(i, _m);
        if (k > 0.85) back++;
      }
      // a little flash where it died
      const fk = (k - die) / 0.15;
      if (vis && die < 2 && fk >= 0 && fk < 1) {
        _m.compose(_v.set(x, y, z), _q.identity(), _s.setScalar(0.4 + fk * 0.9));
        absorbFlash.setMatrixAt(i, _m);
      } else {
        _m.compose(_v.set(0, -999, 0), _q.identity(), _s.setScalar(0.001));
        absorbFlash.setMatrixAt(i, _m);
      }
    });
    photons.instanceMatrix.needsUpdate = true;
    absorbFlash.instanceMatrix.needsUpdate = true;
    absorbFlash.material.color.setHex(inkOn ? 0x6a5a8a : 0xb6ffc8);
    sensorMat.emissiveIntensity = payoff
      ? 0
      : clamp01(back / 10) * 1.6 * (between(t, T.dunkle, T.darum) ? 0.2 : 1);

    // payoff: green dives in and vanishes, red bounces back to you
    const payVis = between(t, T.darum - 0.1, T.fakt);
    payG.visible = payR.visible = payVis;
    if (payVis) {
      PAY.forEach((p, i) => {
        const k = (t * 0.9 + p.ph) % 1;
        const top = V(p.x + 0.6, 3.1, p.z + 1.6);
        const hit = V(p.x, VES.y + VES.r * (1 + 0.32 * hb) * 0.9, p.z + 0.35);
        // green: top → hit, gone
        const g = k < 0.6 ? k / 0.6 : -1;
        if (g >= 0) _m.compose(_v.copy(top).lerp(hit, g), _q.identity(), _s.setScalar(1));
        else _m.compose(_v.set(0, -999, 0), _q.identity(), _s.setScalar(0.001));
        payG.setMatrixAt(i, _m);
        // red: top (shifted) → hit → bounces out towards the camera
        const k2 = (k + 0.5) % 1;
        const top2 = V(p.x - 0.6, 3.1, p.z + 1.6);
        const out = V(p.x + Math.sin(p.ang) * 0.9, 2.9, p.z + 2.6);
        if (k2 < 0.45) _v.copy(top2).lerp(hit, k2 / 0.45);
        else _v.copy(hit).lerp(out, (k2 - 0.45) / 0.55);
        _m.compose(_v, _q.identity(), _s.setScalar(1));
        payR.setMatrixAt(i, _m);
      });
      payG.instanceMatrix.needsUpdate = true;
      payR.instanceMatrix.needsUpdate = true;
    }
    // the heart beats
    const hs = 1 + 0.12 * hb;
    heart.scale.set(hs, hs * (1 - 0.04 * hb), hs);
    heart.rotation.y = -0.35 + Math.sin(t * 0.6) * 0.1;
  }

  // ------------------------------------------------ HUD / LED facts
  if (between(t, T.rate, T.hunderte)) {
    counter("blitze", pop(t, T.rate + 0.2, T.hunderte, 0.2), {
      label: "Blitze",
      value: Math.floor(Math.max(0, t - T.rate - 0.2) * 7),
      x: 70,
      y: 1170,
      color: LED.green,
    });
  }
  if (between(t, T.hunderte, T.nur))
    showPanel(pop(t, T.hunderte, T.nur), "PRO SEKUNDE", "100+", LED.green);
  else showPanel(0);
  if (between(t, T.luegt, T.darum))
    readout("bpm", pop(t, T.luegt, T.darum, 0.2), {
      label: "Puls",
      value: [61, 194, 38, 152, 211, 47, 194][Math.floor((t - T.luegt) * 5) % 7],
      unit: "bpm",
      note: "geraten",
      x: 60,
      y: 1170,
      color: LED.red,
    });
  if (t >= T.fakt && t < T.was) {
    const k = smooth(ramp(t, T.fakt + 0.3, T.milliarden + 0.4));
    readout("leben", pop(t, T.fakt + 0.2, T.was, 0.25), {
      label: "Herzschläge im Leben",
      value: Math.round(3e9 * k * k),
      x: 60,
      y: 1170,
      color: LED.yellow,
    });
  }

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
