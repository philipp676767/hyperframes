// #41 "Was passiert, wenn du dein Handy ins Wasser fallen lässt?" — the
// phone slips out of your hand into a foam bath (frame 0), sinks to the tub
// floor, still glowing. The macro lab (MAC) shows its bottom edge as a giant
// cut: the gasket holds clean water back, soapy water creeps through every
// gap into the charging port. Back on the towel the plug goes in — zack —
// and inside the port the current eats the pins (green crust in time-lapse).
// The screen counts a few days, then dies. Into the rice bowl: rice dust
// drifts into the port, ✕. The right way: plug out, port down, one day
// (the window runs through a night), the screen comes back. Übrigens: the
// white water indicator inside turns red.
import {
  THREE,
  ramp,
  smooth,
  clamp01,
  lerp,
  pop,
  V,
  scene,
  flat,
  rng,
  facet,
  facetMat,
  roundedRect,
  showNope,
  showPanel,
  LED,
  labels,
  puff,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { FLOOR, BENCH, STOOL, SOCKET, windowVeil } from "./set.js";
import { createHand } from "./hand.js";
import { readout, counter, meter } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS, MAC, HIT1, HIT2, HIT3, SLOW2, PLUG_IN } from "./beats.js";

highlights(HIGHLIGHTS);

// ---------------------------------------------------------------- helpers
function canvasTex(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return { c, g: c.getContext("2d"), tex, key: "" };
}
const shadow = (o) =>
  o.traverse((m) => {
    if (m.isMesh) m.castShadow = m.receiveShadow = true;
  });
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();
const _p = new THREE.Vector3();
const _e = new THREE.Euler();
// rounded rectangle centred on (cx, cy)
function rr(w, h, r, cx = 0, cy = 0, path = false) {
  const s = path ? new THREE.Path() : new THREE.Shape();
  const x0 = cx - w / 2;
  const y0 = cy - h / 2;
  s.moveTo(x0 + r, y0);
  s.lineTo(x0 + w - r, y0);
  s.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + r);
  s.lineTo(x0 + w, y0 + h - r);
  s.quadraticCurveTo(x0 + w, y0 + h, x0 + w - r, y0 + h);
  s.lineTo(x0 + r, y0 + h);
  s.quadraticCurveTo(x0, y0 + h, x0, y0 + h - r);
  s.lineTo(x0, y0 + r);
  s.quadraticCurveTo(x0, y0, x0 + r, y0);
  return s;
}
// extrude a shape (x, y) upwards: shape y → world -z, depth → world +y
function extrudeUp(shape, depth, segs = 10) {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: segs });
  g.rotateX(-Math.PI / 2);
  return g;
}
// inside a rounded rect (centred), for keeping things in the tub
function inRR(x, z, w, d, r) {
  const ax = Math.abs(x) - (w / 2 - r);
  const az = Math.abs(z) - (d / 2 - r);
  if (ax <= 0 || az <= 0) return Math.abs(x) <= w / 2 && Math.abs(z) <= d / 2;
  return ax * ax + az * az <= r * r;
}

// ================================================================ the tub
const TW = 9.0; // outer length (x)
const TD = 4.2; // outer width (z)
const IW = 8.4; // inner
const ID = 3.6;
const WATER = -0.45; // water surface
const TUB_FLOOR = -2.35; // inner floor
const IMPACT = V(0.8, WATER, 0.2);
{
  const navy = flat(0x23466e, { roughness: 0.35 });
  const enamel = flat(0xfbfaf6, { roughness: 0.18 });
  // outer painted skin (thin) and the white enamel body with the rim
  const skin = rr(TW, TD, 1.7);
  skin.holes.push(rr(TW - 0.06, TD - 0.06, 1.67, 0, 0, true));
  const a = new THREE.Mesh(facet(extrudeUp(skin, 2.6), 0.03, 3), facetMat(navy));
  a.position.y = -2.6;
  const body = rr(TW - 0.06, TD - 0.06, 1.67);
  body.holes.push(rr(IW, ID, 1.4, 0, 0, true));
  const b = new THREE.Mesh(facet(extrudeUp(body, 2.62), 0.02, 4), facetMat(enamel));
  b.position.y = -2.6;
  // rolled rim
  const rim = rr(TW + 0.14, TD + 0.14, 1.75);
  rim.holes.push(rr(IW, ID, 1.4, 0, 0, true));
  const c = new THREE.Mesh(facet(extrudeUp(rim, 0.14), 0.02, 5), facetMat(enamel));
  c.position.y = -0.12;
  // inner floor (pale aqua, reads as "under water" through the surface)
  const fl = new THREE.Mesh(
    facet(extrudeUp(rr(IW, ID, 1.4), 0.25), 0.04, 6),
    facetMat(flat(0xbfe6ea, { roughness: 0.3 })),
  );
  fl.position.y = TUB_FLOOR - 0.25;
  for (const m of [a, b, c, fl]) {
    m.castShadow = m.receiveShadow = true;
    scene.add(m);
  }
  // golden claw feet
  const gold = flat(0xd9a441, { metalness: 0.7, roughness: 0.3 });
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const f = new THREE.Mesh(
        facet(new THREE.SphereGeometry(0.32, 7, 5), 0.05, 7),
        facetMat(gold),
      );
      f.scale.set(1, 1.5, 1);
      f.position.set(sx * 3.4, FLOOR + 0.4, sz * 1.35);
      f.castShadow = true;
      scene.add(f);
    }
  // chrome tap on the left end, shampoo bottles on the right end of the rim
  const chrome = new THREE.MeshStandardMaterial({
    color: 0xe8edf2,
    metalness: 0.9,
    roughness: 0.2,
  });
  const tap = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.08, 6, 12, Math.PI), chrome);
  tap.position.set(-4.15, 0.35, -1.7);
  tap.rotation.y = Math.PI / 2;
  scene.add(tap);
  for (const dz of [-0.35, 0.35]) {
    const k = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.2, 8), chrome);
    k.position.set(-4.4, 0.1, -1.7 + dz);
    scene.add(k);
  }
  [
    [3.7, -1.85, 0xff6f7d, 0.8],
    [4.05, -1.8, 0xf2c440, 0.6],
    [3.4, -1.85, 0x8fd3c1, 0.5],
  ].forEach(([x, z, col, h], k) => {
    const bt = new THREE.Mesh(
      facet(new THREE.CylinderGeometry(0.16, 0.18, h, 8), 0.05, 20 + k),
      facetMat(flat(col, { roughness: 0.3 })),
    );
    bt.position.set(x, h / 2 + 0.02, z);
    bt.castShadow = true;
    scene.add(bt);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.14, 8), flat(0xffffff));
    cap.position.set(x, h + 0.09, z);
    scene.add(cap);
  });
}

// ---------------------------------------------------------------- water surface
const waterGeo = new THREE.PlaneGeometry(IW, ID, 84, 36);
waterGeo.rotateX(-Math.PI / 2);
{
  // pull the corners in onto the rounded inner outline
  const p = waterGeo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i);
    let z = p.getZ(i);
    const w = IW - 0.04;
    const d = ID - 0.04;
    const r = 1.38;
    const ax = Math.abs(x) - (w / 2 - r);
    const az = Math.abs(z) - (d / 2 - r);
    if (ax > 0 && az > 0) {
      const len = Math.hypot(ax, az);
      if (len > r) {
        x = Math.sign(x) * (w / 2 - r + (ax / len) * r);
        z = Math.sign(z) * (d / 2 - r + (az / len) * r);
      }
    }
    p.setXYZ(i, x, 0, z);
  }
}
const waterBase = Float32Array.from(waterGeo.attributes.position.array);
const water = new THREE.Mesh(
  waterGeo,
  new THREE.MeshStandardMaterial({
    color: 0x58bfe3,
    roughness: 0.06,
    metalness: 0.15,
    transparent: true,
    opacity: 0.52,
    flatShading: true,
    depthWrite: false,
  }),
);
water.position.y = WATER;
water.userData.noAO = true;
water.renderOrder = 2;
scene.add(water);
// ripple rings from an impact at local time `age`
function ring(x, z, age) {
  if (age < 0 || age > 3) return 0;
  const d = Math.hypot(x - IMPACT.x, z - IMPACT.z);
  const front = age * 2.6;
  const u = d - front;
  return 0.16 * Math.exp(-age * 1.2) * Math.exp(-u * u * 1.4) * Math.cos(u * 4.5);
}
function animateWater(t, age) {
  const p = waterGeo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = waterBase[i * 3];
    const z = waterBase[i * 3 + 2];
    const y =
      Math.sin(x * 1.3 + t * 1.6) * 0.012 +
      Math.sin(z * 2.1 - t * 1.3 + x * 0.4) * 0.01 +
      ring(x, z, age);
    p.setY(i, y);
  }
  p.needsUpdate = true;
  waterGeo.computeVertexNormals();
}

// ---------------------------------------------------------------- foam
const FOAM_N = 340;
const foam = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(1, 1),
  flat(0xffffff, { roughness: 0.7, emissive: 0x6a7080, emissiveIntensity: 0.35 }),
  FOAM_N,
);
foam.castShadow = true;
foam.receiveShadow = true;
const foamSeeds = [];
{
  const rf = rng(141);
  const col = new THREE.Color();
  let i = 0;
  while (i < FOAM_N) {
    const x = (rf() - 0.5) * IW;
    const z = (rf() - 0.5) * ID;
    if (!inRR(x, z, IW - 0.3, ID - 0.3, 1.25)) continue;
    // keep a clear pool where the phone falls, and room for the duck
    if (Math.hypot(x - IMPACT.x, (z - IMPACT.z) * 1.3) < 1.55) continue;
    if (Math.hypot(x + 2.5, z - 0.4) < 0.55) continue;
    // denser and taller towards the walls
    const edge = Math.max(Math.abs(x) / (IW / 2), Math.abs(z) / (ID / 2));
    if (rf() > 0.35 + edge * 0.7) continue;
    const s = 0.09 + rf() * 0.2 + edge * 0.1;
    foamSeeds.push([x, z, s, rf() * 6.28, 0.05 + rf() * 0.25 * (0.5 + edge)]);
    foam.setColorAt(
      i,
      col.setRGB(0.95 + rf() * 0.05, 0.96 + rf() * 0.04, 1.0).multiplyScalar(0.98),
    );
    i++;
  }
}
scene.add(foam);
function animateFoam(t) {
  foamSeeds.forEach(([x, z, s, ph, h], i) => {
    _p.set(x, WATER + h * 0.6 + Math.sin(t * 1.4 + ph) * 0.015, z);
    _s.set(s, s * 0.75, s);
    _q.identity();
    _m.compose(_p, _q, _s);
    foam.setMatrixAt(i, _m);
  });
  foam.instanceMatrix.needsUpdate = true;
}

// ---------------------------------------------------------------- rubber duck
const duck = new THREE.Group();
{
  const yel = flat(0xffd23f, { roughness: 0.4 });
  const b = new THREE.Mesh(facet(new THREE.SphereGeometry(0.42, 9, 7), 0.05, 31), facetMat(yel));
  b.scale.set(1.25, 0.8, 1);
  duck.add(b);
  const h = new THREE.Mesh(facet(new THREE.SphereGeometry(0.26, 8, 6), 0.05, 32), facetMat(yel));
  h.position.set(0.3, 0.42, 0);
  duck.add(h);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.24, 6), flat(0xff7a2f));
  beak.rotation.z = -Math.PI / 2;
  beak.position.set(0.6, 0.38, 0);
  duck.add(beak);
  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 5, 4), flat(0x1c1c22));
    eye.position.set(0.47, 0.5, s * 0.12);
    duck.add(eye);
  }
  shadow(duck);
  duck.position.set(-2.5, WATER + 0.12, 0.4);
  duck.rotation.y = 0.5;
  scene.add(duck);
}

// ---------------------------------------------------------------- splash + bubbles
const DROP_N = 46;
const drops = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(1, 0),
  new THREE.MeshStandardMaterial({
    color: 0xd8f4ff,
    roughness: 0.05,
    metalness: 0.1,
    emissive: 0x3a7a9a,
    emissiveIntensity: 0.25,
  }),
  DROP_N,
);
drops.userData.noAO = true;
const dropSeeds = [];
{
  const rd = rng(77);
  for (let i = 0; i < DROP_N; i++) {
    const a = (i / DROP_N) * Math.PI * 2 + rd() * 0.3;
    const crown = i < 30;
    dropSeeds.push({
      a,
      v: crown ? 1.6 + rd() * 1.4 : 0.3 + rd() * 0.6,
      up: crown ? 3.2 + rd() * 2.2 : 5.5 + rd() * 2.5,
      s: crown ? 0.06 + rd() * 0.07 : 0.08 + rd() * 0.08,
    });
  }
}
scene.add(drops);
function animateSplash(age) {
  drops.visible = age >= 0 && age < 1.4;
  if (!drops.visible) return;
  dropSeeds.forEach((d, i) => {
    const x = IMPACT.x + Math.cos(d.a) * (0.35 + d.v * age);
    const z = IMPACT.z + Math.sin(d.a) * (0.35 + d.v * age) * 0.8;
    const y = WATER + d.up * age - 0.5 * 11 * age * age;
    const s = y < WATER ? 0.0001 : d.s * (1 - age / 1.6);
    _p.set(x, y, z);
    _s.setScalar(s);
    _s.y *= 1.4;
    _q.identity();
    _m.compose(_p, _q, _s);
    drops.setMatrixAt(i, _m);
  });
  drops.instanceMatrix.needsUpdate = true;
}
// white splash sheet: a thin cone ring that rises and opens
const sheet = new THREE.Mesh(
  new THREE.CylinderGeometry(0.75, 0.35, 0.6, 18, 1, true),
  new THREE.MeshStandardMaterial({
    color: 0xd8f2ff,
    roughness: 0.1,
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide,
    depthWrite: false,
  }),
);
sheet.userData.noAO = true;
scene.add(sheet);
function animateSheet(age) {
  sheet.visible = age >= 0 && age < 0.7;
  if (!sheet.visible) return;
  const k = age / 0.7;
  sheet.position.set(IMPACT.x, WATER + 0.25 * Math.sin(k * Math.PI) + 0.05, IMPACT.z);
  sheet.scale.set(0.6 + k * 1.6, 0.3 + Math.sin(k * Math.PI) * 1.3, 0.6 + k * 1.6);
  sheet.material.opacity = 0.75 * (1 - k);
}
const BUB_N = 36;
const bubbles = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(1, 1),
  new THREE.MeshStandardMaterial({
    color: 0xeaffff,
    roughness: 0.05,
    metalness: 0.2,
    transparent: true,
    opacity: 0.8,
    emissive: 0x2a6a8a,
    emissiveIntensity: 0.2,
  }),
  BUB_N,
);
bubbles.userData.noAO = true;
scene.add(bubbles);
const bubSeeds = Array.from({ length: BUB_N }, (_, i) => {
  const r = rng(300 + i);
  return [r() * 1.2 - 0.6, r() * 0.9 - 0.45, 0.4 + r() * 0.7, r(), 0.04 + r() * 0.07];
});
// bubbles rise from the phone (pos) to the surface; strength 0..1
function animateBubbles(t, pos, strength) {
  bubbles.visible = strength > 0.01;
  if (!bubbles.visible) return;
  bubSeeds.forEach(([dx, dz, sp, ph, s], i) => {
    const f = (t * sp + ph) % 1;
    const y = lerp(pos.y + 0.05, WATER - 0.03, f);
    _p.set(
      pos.x + dx * (0.6 + f * 0.6) + Math.sin(t * 4 + i) * 0.04,
      y,
      pos.z + dz * (0.6 + f * 0.5),
    );
    _s.setScalar(s * strength * (0.7 + f * 0.6) * (i / BUB_N < strength ? 1 : 0.0001));
    _q.identity();
    _m.compose(_p, _q, _s);
    bubbles.setMatrixAt(i, _m);
  });
  bubbles.instanceMatrix.needsUpdate = true;
}

// ---------------------------------------------------------------- steam over the water
const STEAM_N = 14;
const steam = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(1, 1),
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.1,
    depthWrite: false,
  }),
  STEAM_N,
);
steam.userData.noAO = true;
scene.add(steam);
const steamSeeds = Array.from({ length: STEAM_N }, (_, i) => {
  const r = rng(500 + i);
  const left = i % 2;
  return [left ? -3.6 + r() * 1.6 : 2.4 + r() * 1.4, r() * 2.4 - 1.2, 0.08 + r() * 0.1, r()];
});
function animateSteam(t) {
  steamSeeds.forEach(([x, z, sp, ph], i) => {
    const f = (t * sp + ph) % 1;
    _p.set(x + Math.sin(t * 0.5 + i) * 0.3, WATER + 0.4 + f * 4.5, z);
    _s.setScalar(0.3 + f * 0.9);
    _s.multiplyScalar(Math.sin(f * Math.PI));
    _q.identity();
    _m.compose(_p, _q, _s);
    steam.setMatrixAt(i, _m);
  });
  steam.instanceMatrix.needsUpdate = true;
}

// ================================================================ the phone
const PW = 1.0;
const PH = 2.04;
const PT = 0.11;
const coral = flat(0xff6f7d, { roughness: 0.32, metalness: 0.15 });
const screenArt = canvasTex(256, 512);
function drawScreen(state, day = "") {
  const key = state + day;
  if (key === screenArt.key) return;
  screenArt.key = key;
  const { g } = screenArt;
  g.fillStyle = "#06070b";
  g.fillRect(0, 0, 256, 512);
  if (state === "off") {
    screenArt.tex.needsUpdate = true;
    return;
  }
  const gr = g.createLinearGradient(0, 0, 0, 512);
  gr.addColorStop(0, "#2f7f9a");
  gr.addColorStop(0.55, "#7a5bb5");
  gr.addColorStop(1, "#ff7a8a");
  g.fillStyle = gr;
  g.fillRect(0, 0, 256, 512);
  // soft wallpaper blobs
  g.fillStyle = "rgba(255,255,255,.12)";
  g.beginPath();
  g.arc(70, 380, 90, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.arc(210, 250, 60, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#fff";
  g.textAlign = "center";
  g.font = '700 26px "Montserrat", sans-serif';
  g.fillText(day || "Sonntag, 29. Oktober", 128, 92);
  g.font = '800 84px "Montserrat", sans-serif';
  g.fillText("19:42", 128, 176);
  if (state === "warn") {
    g.fillStyle = "rgba(255,255,255,.92)";
    g.beginPath();
    g.roundRect(14, 220, 228, 150, 26);
    g.fill();
    g.fillStyle = "#ffb000";
    g.beginPath();
    g.moveTo(128, 236);
    g.lineTo(156, 286);
    g.lineTo(100, 286);
    g.closePath();
    g.fill();
    g.fillStyle = "#1c1c22";
    g.font = '800 34px "Montserrat", sans-serif';
    g.fillText("!", 128, 281);
    g.font = '800 24px "Montserrat", sans-serif';
    g.fillText("Flüssigkeit", 128, 322);
    g.fillText("im Anschluss", 128, 352);
  } else if (state === "ok") {
    g.fillStyle = "#3ddc84";
    g.beginPath();
    g.arc(128, 300, 62, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "#fff";
    g.lineWidth = 16;
    g.lineCap = "round";
    g.lineJoin = "round";
    g.beginPath();
    g.moveTo(98, 300);
    g.lineTo(120, 324);
    g.lineTo(160, 278);
    g.stroke();
    g.fillStyle = "#fff";
    g.font = '800 30px "Montserrat", sans-serif';
    g.fillText("Alles gut!", 128, 410);
  } else if (state === "glitch") {
    for (let k = 0; k < 9; k++) {
      g.fillStyle = k % 2 ? "rgba(0,255,200,.55)" : "rgba(255,0,120,.5)";
      g.fillRect(0, 40 + k * 52 + ((k * 37) % 23), 256, 6 + (k % 3) * 5);
    }
  } else {
    // a message to make it "your" phone
    g.fillStyle = "rgba(255,255,255,.88)";
    g.beginPath();
    g.roundRect(16, 236, 224, 86, 22);
    g.fill();
    g.fillStyle = "#1c1c22";
    g.textAlign = "left";
    g.font = '800 24px "Montserrat", sans-serif';
    g.fillText("Mama", 34, 270);
    g.font = '600 22px "Montserrat", sans-serif';
    g.fillText("Ruf mal zurück 🙂", 34, 302);
  }
  screenArt.tex.needsUpdate = true;
}
drawScreen("lock");
const phone = new THREE.Group();
phone.rotation.order = "YXZ";
const phoneWet = new THREE.Group();
{
  const geo = new THREE.ExtrudeGeometry(rr(PW, PH, 0.17), {
    depth: PT,
    bevelEnabled: false,
    curveSegments: 6,
  });
  geo.translate(0, 0, -PT / 2);
  const body = new THREE.Mesh(geo, coral);
  body.castShadow = body.receiveShadow = true;
  phone.add(body);
  const bezel = new THREE.Mesh(
    new THREE.ShapeGeometry(rr(PW - 0.04, PH - 0.04, 0.15)),
    flat(0x0a0a0e, { roughness: 0.1, metalness: 0.3 }),
  );
  bezel.position.z = PT / 2 + 0.002;
  phone.add(bezel);
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(PW - 0.12, PH - 0.14),
    new THREE.MeshBasicMaterial({ map: screenArt.tex, toneMapped: false }),
  );
  screen.position.z = PT / 2 + 0.004;
  phone.add(screen);
  // camera bump on the back, buttons, the port at the bottom edge
  const bump = new THREE.Mesh(
    new THREE.ExtrudeGeometry(rr(0.42, 0.42, 0.1), { depth: 0.04, bevelEnabled: false }),
    flat(0xe85a6a, { roughness: 0.3 }),
  );
  bump.position.set(-0.22, PH / 2 - 0.5, -PT / 2 - 0.04);
  phone.add(bump);
  for (const [x, y] of [
    [-0.32, PH / 2 - 0.2],
    [-0.12, PH / 2 - 0.4],
  ]) {
    const lens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.075, 0.05, 10),
      flat(0x15161c, { roughness: 0.1 }),
    );
    lens.rotation.x = Math.PI / 2;
    lens.position.set(x, y, -PT / 2 - 0.06);
    phone.add(lens);
  }
  const btn = (y, h) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.03, h, 0.05), coral);
    b.position.set(PW / 2 + 0.012, y, 0);
    phone.add(b);
  };
  btn(0.45, 0.32);
  const port = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.055), flat(0x111114));
  port.position.set(0, -PH / 2 - 0.004, 0);
  phone.add(port);
  // wet drops on the glass
  const dm = new THREE.MeshStandardMaterial({
    color: 0xe8fbff,
    roughness: 0.02,
    metalness: 0.3,
    transparent: true,
    opacity: 0.85,
  });
  const rw = rng(808);
  for (let k = 0; k < 16; k++) {
    const d = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 5), dm);
    const s = 0.025 + rw() * 0.04;
    d.scale.set(s, s, s * 0.45);
    d.position.set((rw() - 0.5) * (PW - 0.2), (rw() - 0.5) * (PH - 0.25), PT / 2 + 0.01);
    phoneWet.add(d);
  }
  phone.add(phoneWet);
  shadow(body);
  scene.add(phone);
}
const phoneLight = new THREE.PointLight(0xb8a8ff, 0, 3.2, 1.6);
scene.add(phoneLight);
// the port in world space (bottom edge centre, a bit outside)
const portLocal = V(0, -PH / 2 - 0.02, 0);
const portWorld = V(0, 0, 0);

// fall into the tub, local time u (HIT1 = water contact)
const REL = -0.15; // released
const BOTTOM = TUB_FLOOR + PT / 2 + 0.01;
function phoneFall(u) {
  const G = 12.6;
  const y0 = 1.62;
  const held = { x: 0.85, y: y0, z: 0.32 };
  if (u < REL) {
    phone.position.set(held.x, held.y, held.z);
    phone.rotation.set(-0.95, 0.35, 0.18);
    return;
  }
  const f = u - REL;
  if (u < HIT1) {
    phone.position.set(
      lerp(held.x, IMPACT.x, f / (HIT1 - REL)),
      y0 - 0.5 * G * f * f,
      lerp(held.z, IMPACT.z, f / (HIT1 - REL)),
    );
    phone.rotation.set(-0.95 - f * 1.2, 0.35 + f * 0.6, 0.18 + f * 1.4);
    return;
  }
  const a = u - HIT1;
  const sink = 1 - Math.exp(-a / 0.9);
  const rx0 = -0.95 - (HIT1 - REL) * 1.2;
  phone.position.set(
    IMPACT.x + Math.sin(a * 2.2) * 0.12 * (1 - sink),
    lerp(WATER - 0.1, BOTTOM, sink),
    IMPACT.z,
  );
  phone.rotation.set(
    lerp(rx0, -Math.PI / 2, smooth(clamp01(a / 1.6))),
    0.35 + (HIT1 - REL) * 0.6 + a * 0.2 * (1 - sink),
    lerp(0.18 + (HIT1 - REL) * 1.4, 0, smooth(clamp01(a / 1.4))),
  );
}
const ON_TOWEL = { x: BENCH[0], y: BENCH[1] + PT / 2, z: BENCH[2] - 0.05 };

// ---------------------------------------------------------------- the rice bowl
const BOWL_TOP = STOOL[1] + 0.95; // rim
const RICE_Y = BOWL_TOP - 0.16; // rice surface
{
  const prof = [
    [0, 0],
    [0.62, 0],
    [0.68, 0.06],
    [1.05, 0.45],
    [1.3, 0.95],
    [1.22, 0.95],
    [0.98, 0.5],
    [0.6, 0.1],
    [0, 0.1],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const bowl = new THREE.Mesh(
    facet(new THREE.LatheGeometry(prof, 22), 0.03, 50),
    facetMat(flat(0xf7f3ea, { roughness: 0.25, side: THREE.DoubleSide })),
  );
  bowl.position.set(STOOL[0], STOOL[1], STOOL[2]);
  bowl.castShadow = bowl.receiveShadow = true;
  scene.add(bowl);
  // blue band
  const band = new THREE.Mesh(
    new THREE.CylinderGeometry(1.215, 1.12, 0.14, 22, 1, true),
    flat(0x3f6fb5, { roughness: 0.3 }),
  );
  band.position.set(STOOL[0], STOOL[1] + 0.72, STOOL[2]);
  scene.add(band);
  const mound = new THREE.Mesh(
    facet(new THREE.SphereGeometry(1.16, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0.04, 51),
    facetMat(flat(0xf4f1e8, { roughness: 0.8 })),
  );
  mound.scale.set(1, 0.2, 1);
  mound.position.set(STOOL[0], RICE_Y - 0.05, STOOL[2]);
  mound.receiveShadow = true;
  scene.add(mound);
}
// rice grains on the mound + grains flying when the phone lands
const GRAIN_N = 1100;
const FLY_N = 70;
const grainGeo = new THREE.SphereGeometry(0.03, 5, 3);
grainGeo.scale(2.2, 0.8, 0.9);
const grains = new THREE.InstancedMesh(
  grainGeo,
  flat(0xffffff, { roughness: 0.6 }),
  GRAIN_N + FLY_N,
);
grains.castShadow = true;
const grainSeeds = [];
{
  const rg = rng(909);
  const col = new THREE.Color();
  for (let i = 0; i < GRAIN_N + FLY_N; i++) {
    const a = rg() * Math.PI * 2;
    const r = Math.sqrt(rg()) * 1.1;
    grainSeeds.push({
      a,
      r,
      rot: [rg() * 3, rg() * 3, rg() * 3],
      up: 2 + rg() * 3,
      v: 0.8 + rg() * 1.6,
    });
    grains.setColorAt(i, col.setRGB(0.96 + rg() * 0.04, 0.95 + rg() * 0.04, 0.88 + rg() * 0.06));
  }
}
scene.add(grains);
function animateGrains(age) {
  grainSeeds.forEach((g, i) => {
    let x = STOOL[0] + Math.cos(g.a) * g.r;
    let z = STOOL[2] + Math.sin(g.a) * g.r;
    let y = RICE_Y - 0.05 + 0.23 * (1 - (g.r / 1.16) ** 2) + 0.02;
    _e.set(...g.rot);
    if (i >= GRAIN_N) {
      // flying grains: out of the crater, then lying on the rice / stool
      if (age < 0) {
        _s.setScalar(0.0001);
      } else {
        const a = Math.min(age, 0.75);
        x = STOOL[0] + Math.cos(g.a) * (0.2 + g.v * a);
        z = STOOL[2] + Math.sin(g.a) * (0.2 + g.v * a);
        y = Math.max(RICE_Y, RICE_Y + 0.2 + g.up * a - 0.5 * 12 * a * a);
        _e.set(g.rot[0] + age * 9, g.rot[1], g.rot[2] + age * 6);
        _s.setScalar(1);
      }
    } else _s.setScalar(1);
    _q.setFromEuler(_e);
    _p.set(x, y, z);
    _m.compose(_p, _q, _s);
    grains.setMatrixAt(i, _m);
  });
  grains.instanceMatrix.needsUpdate = true;
}

// ---------------------------------------------------------------- charging cable + plug
const plug = new THREE.Group();
{
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.12, 0.2),
    flat(0xf4f4f6, { roughness: 0.4 }),
  );
  body.position.x = 0.2;
  plug.add(body);
  const tip = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.045, 0.13),
    flat(0xc8ccd4, { metalness: 0.8, roughness: 0.25 }),
  );
  tip.position.x = -0.03;
  plug.add(tip);
  const relief = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.16, 8), flat(0xf4f4f6));
  relief.rotation.z = Math.PI / 2;
  relief.position.x = 0.44;
  plug.add(relief);
  shadow(plug);
  scene.add(plug);
}
const cableMat = flat(0xf4f4f6, { roughness: 0.5 });
let cable = null;
function drawCable(visible) {
  if (cable) {
    scene.remove(cable);
    cable.geometry.dispose();
    cable = null;
  }
  if (!visible) return;
  const end = V(0.52, 0, 0).applyQuaternion(plug.quaternion).add(plug.position);
  const pts = [
    V(...SOCKET),
    V(SOCKET[0] + 0.2, SOCKET[1] - 0.7, SOCKET[2] + 0.4),
    V(SOCKET[0] + 0.5, BENCH[1] - 0.25, -0.6),
    V(end.x + 0.6, end.y - 0.1, end.z - 0.2),
    end,
  ];
  cable = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.03, 6),
    cableMat,
  );
  cable.castShadow = true;
  scene.add(cable);
}
// sparks at the port ("zack")
const SPARK_N = 16;
const sparks = new THREE.InstancedMesh(
  new THREE.BoxGeometry(1, 0.02, 0.02),
  new THREE.MeshBasicMaterial({ color: 0xfff1a0, toneMapped: false }),
  SPARK_N,
);
sparks.userData.noAO = true;
scene.add(sparks);
const sparkSeeds = Array.from({ length: SPARK_N }, (_, i) => {
  const r = rng(700 + i);
  return [r() * Math.PI * 2, r() * 1.2 - 0.3, 0.6 + r() * 1.2, 0.08 + r() * 0.14];
});
const sparkLight = new THREE.PointLight(0xfff0a0, 0, 4, 1.4);
scene.add(sparkLight);
function animateSparks(at, t, pos) {
  const age = t - at;
  const on = age >= 0 && age < 0.45;
  sparks.visible = on;
  sparkLight.intensity = on ? 14 * (1 - age / 0.45) : 0;
  if (!on) return;
  sparkLight.position.copy(pos);
  sparkSeeds.forEach(([a, up, v, len], i) => {
    const d = 0.05 + v * age;
    _p.set(pos.x + Math.cos(a) * d, pos.y + up * d * 0.6 + 0.04, pos.z + Math.sin(a) * d);
    _e.set(0, -a, up * 0.6);
    _q.setFromEuler(_e);
    _s.set(len * (1 - age / 0.45), 1, 1);
    _m.compose(_p, _q, _s);
    sparks.setMatrixAt(i, _m);
  });
  sparks.instanceMatrix.needsUpdate = true;
}
// drops running out of the port while the phone stands upright
const DRIP_N = 8;
const drips = new THREE.InstancedMesh(
  new THREE.SphereGeometry(0.05, 7, 5),
  new THREE.MeshStandardMaterial({ color: 0xbfeaff, roughness: 0.02, metalness: 0.3 }),
  DRIP_N,
);
drips.userData.noAO = true;
scene.add(drips);
function animateDrips(t, k) {
  drips.visible = k > 0.01;
  if (!drips.visible) return;
  for (let i = 0; i < DRIP_N; i++) {
    const f = (t * 1.3 + i / DRIP_N) % 1;
    const fall = f < 0.35 ? 0 : (f - 0.35) / 0.65;
    _p.set(
      portWorld.x + ((i % 3) - 1) * 0.05,
      portWorld.y - 0.03 - fall * fall * 0.18,
      portWorld.z + 0.02,
    );
    _s.setScalar((f < 0.35 ? 0.4 + f * 1.6 : 1) * k * (fall > 0.95 ? 0.0001 : 1));
    _s.y *= 1.3;
    _q.identity();
    _m.compose(_p, _q, _s);
    drips.setMatrixAt(i, _m);
  }
  drips.instanceMatrix.needsUpdate = true;
}

// the viewer's hand
const hand = createHand({ scale: 1.6, sleeve: 0x2f6f6a });

// ================================================================ MAC: the macro lab
const mac = new THREE.Group();
mac.position.set(...MAC);
scene.add(mac);
const PY = 0.8; // port centre height
const PORT_W = 3.2;
const PORT_H = 1.0;
const DEPTH = 2.8; // port depth
{
  const room = new THREE.Mesh(
    new THREE.BoxGeometry(80, 36, 80),
    new THREE.MeshBasicMaterial({ color: 0x0b0d1c, side: THREE.BackSide, fog: false }),
  );
  room.position.y = 15;
  mac.add(room);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80),
    new THREE.MeshStandardMaterial({ color: 0x141a2e, roughness: 0.4, metalness: 0.25 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  mac.add(floor);
  const grid = new THREE.GridHelper(80, 80, 0x2a4a6a, 0x1a2a40);
  grid.position.y = 0.01;
  mac.add(grid);
  const warm = new THREE.PointLight(0xfff0e0, 130, 34, 1.3);
  warm.position.set(3, 8, 8);
  mac.add(warm);
  const cyan = new THREE.PointLight(0x4fc3ff, 40, 24, 1.4);
  cyan.position.set(-8, 3, 4);
  mac.add(cyan);
  const mag = new THREE.PointLight(0xff5fb0, 34, 24, 1.4);
  mac.add(mag);
  mag.position.set(8, 3, 4);
  // light inside the port so the pins read
  const inner = new THREE.PointLight(0xfff2d8, 6, 4, 1.5);
  inner.position.set(0, PY + 0.25, -0.4);
  mac.add(inner);

  // the giant phone edge: a rounded slab with the port as a through-hole
  const edge = roundedRect(12, 1.6, 0.75);
  edge.holes.push(rr(PORT_W, PORT_H, 0.45, 0, PY, true));
  const slabGeo = new THREE.ExtrudeGeometry(edge, {
    depth: 10,
    bevelEnabled: false,
    curveSegments: 10,
  });
  slabGeo.translate(0, 0, -10);
  const slab = new THREE.Mesh(
    facet(slabGeo, 0.03, 61),
    facetMat(flat(0xff6f7d, { roughness: 0.3, metalness: 0.2 })),
  );
  slab.castShadow = slab.receiveShadow = true;
  mac.add(slab);
  // dark liner inside the port + its back wall
  const liner = rr(PORT_W - 0.02, PORT_H - 0.02, 0.44, 0, PY);
  liner.holes.push(rr(PORT_W - 0.2, PORT_H - 0.16, 0.38, 0, PY, true));
  const lg = new THREE.ExtrudeGeometry(liner, {
    depth: DEPTH,
    bevelEnabled: false,
    curveSegments: 10,
  });
  lg.translate(0, 0, -DEPTH);
  const lm = new THREE.Mesh(lg, flat(0x2a2d36, { roughness: 0.35, metalness: 0.6 }));
  lm.receiveShadow = true;
  mac.add(lm);
  const back = new THREE.Mesh(new THREE.BoxGeometry(PORT_W, PORT_H, 0.1), flat(0x1a1c22));
  back.position.set(0, PY, -DEPTH + 0.02);
  mac.add(back);
  // speaker grilles left and right of the port
  const hole = new THREE.CircleGeometry(0.13, 10);
  const holeMat = flat(0x1a1416);
  for (const s of [-1, 1])
    for (let k = 0; k < 7; k++) {
      const h = new THREE.Mesh(hole, holeMat);
      h.position.set(s * (2.3 + k * 0.42), PY, 0.012);
      mac.add(h);
    }
}
// the gasket: two glowing orange strips along the seams
const gasketMat = flat(0xff9a3a, { emissive: 0xff7a1a, emissiveIntensity: 0.2, roughness: 0.6 });
for (const y of [0.22, 1.38]) {
  const g = new THREE.Mesh(new THREE.BoxGeometry(11.0, 0.07, 0.06), gasketMat);
  g.position.set(0, y, 0.02);
  mac.add(g);
}
// the tongue with the gold pins
const pinMat = flat(0xffc84a, { metalness: 0.85, roughness: 0.25 });
const PINS = [];
{
  const tongue = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 0.14, 2.4),
    flat(0x1c1d24, { roughness: 0.4 }),
  );
  tongue.position.set(0, PY, -1.5);
  tongue.castShadow = tongue.receiveShadow = true;
  mac.add(tongue);
  for (const s of [-1, 1])
    for (let i = 0; i < 12; i++) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 1.4), pinMat);
      const x = -1.1 + i * 0.2;
      p.position.set(x, PY + s * 0.085, -1.3);
      mac.add(p);
      PINS.push([x, PY + s * 0.085]);
    }
}
// water inside the port (level grows)
const portWater = new THREE.Mesh(
  new THREE.BoxGeometry(PORT_W - 0.24, 1, DEPTH - 0.1),
  new THREE.MeshStandardMaterial({
    color: 0x58bfe3,
    roughness: 0.05,
    metalness: 0.1,
    transparent: true,
    opacity: 0.38,
    depthWrite: false,
    emissive: 0x0a3a5a,
    emissiveIntensity: 0.3,
  }),
);
portWater.userData.noAO = true;
portWater.renderOrder = 3;
mac.add(portWater);
const PORT_FLOOR = PY - PORT_H / 2 + 0.08;
function setPortWater(level) {
  portWater.visible = level > 0.01;
  portWater.scale.y = Math.max(0.001, level);
  portWater.position.set(0, PORT_FLOOR + level / 2, -DEPTH / 2 + 0.02);
}
// water beads creeping along the seams into the port (+ a few soap bubbles)
const BEAD_N = 44;
const beads = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(1, 1),
  new THREE.MeshStandardMaterial({
    color: 0x7fd6f5,
    roughness: 0.04,
    metalness: 0.2,
    transparent: true,
    opacity: 0.85,
    emissive: 0x1a5a7a,
    emissiveIntensity: 0.35,
  }),
  BEAD_N,
);
beads.userData.noAO = true;
mac.add(beads);
const beadSeeds = Array.from({ length: BEAD_N }, (_, i) => {
  const r = rng(1000 + i);
  const side = i % 2 ? 1 : -1;
  return {
    side,
    y: i % 4 < 2 ? 0.22 : 1.38,
    x0: side * (2.0 + r() * 3.6),
    delay: r() * 1.6,
    s: 0.09 + r() * 0.1,
    soap: i % 6 === 0,
  };
});
const soapMat = new THREE.MeshStandardMaterial({
  color: 0xffd6f0,
  roughness: 0.02,
  metalness: 0.5,
  transparent: true,
  opacity: 0.55,
  emissive: 0x6a3a8a,
  emissiveIntensity: 0.2,
  depthWrite: false,
});
const soapBubbles = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 2), soapMat, 10);
soapBubbles.userData.noAO = true;
mac.add(soapBubbles);
// t0 = when the creeping starts; before that the beads wait outside the gasket
function animateBeads(t, t0, held) {
  let sb = 0;
  beadSeeds.forEach((b, i) => {
    const p = clamp01((t - t0 - b.delay) / 1.4);
    let x;
    let y;
    let z;
    if (p <= 0) {
      // waiting just outside the seam, pressing (wobble)
      x = b.x0 + Math.sin(t * 2 + i) * 0.04;
      y = b.y + (b.y < 0.8 ? -0.12 : 0.12);
      z = 0.16 + held * 0.03 * Math.sin(t * 5 + i);
    } else if (p < 0.65) {
      const q = smooth(p / 0.65);
      x = lerp(b.x0, b.side * 1.25, q);
      y = lerp(b.y + (b.y < 0.8 ? -0.12 : 0.12), b.y, q);
      z = 0.14 - q * 0.08;
    } else {
      const q = smooth((p - 0.65) / 0.35);
      x = lerp(b.side * 1.25, b.side * 0.9, q);
      y = lerp(b.y, PORT_FLOOR + 0.1, q);
      z = lerp(0.06, -0.6 - (i % 5) * 0.3, q);
    }
    const s = b.s * (p >= 1 ? 0.0001 : 1);
    _p.set(x, y, z);
    _s.set(s * 1.3, s, s);
    _q.identity();
    _m.compose(_p, _q, _s);
    beads.setMatrixAt(i, _m);
    if (b.soap && sb < 10) {
      _s.setScalar(p >= 1 || t < t0 ? 0.0001 : b.s * 1.6);
      _p.y += 0.12;
      _m.compose(_p, _q, _s);
      soapBubbles.setMatrixAt(sb++, _m);
    }
  });
  _s.setScalar(0.0001);
  _m.compose(_p, _q, _s);
  while (sb < 10) soapBubbles.setMatrixAt(sb++, _m);
  beads.instanceMatrix.needsUpdate = true;
  soapBubbles.instanceMatrix.needsUpdate = true;
  soapBubbles.visible = t >= t0;
}
// current: bright bolts between pins + electrolysis bubbles
const BOLT_N = 10;
const bolts = new THREE.InstancedMesh(
  new THREE.BoxGeometry(1, 0.04, 0.04),
  new THREE.MeshBasicMaterial({ color: 0xfff6b0, toneMapped: false }),
  BOLT_N * 3,
);
bolts.userData.noAO = true;
mac.add(bolts);
const boltLight = new THREE.PointLight(0xfff0a0, 0, 5, 1.5);
boltLight.position.set(0, PY, -0.9);
mac.add(boltLight);
function animateBolts(t, k) {
  bolts.visible = k > 0;
  boltLight.intensity = k > 0 ? (3 + 3 * Math.abs(Math.sin(t * 31))) * k : 0;
  if (!bolts.visible) return;
  const step = Math.floor(t * 18);
  for (let i = 0; i < BOLT_N; i++) {
    const r = rng(step * 31 + i);
    const on = r() < 0.6 * k;
    const a = PINS[Math.floor(r() * PINS.length)];
    const zA = -0.7 - r() * 1.2;
    let px = a[0];
    let py = a[1];
    let pz = zA;
    for (let j = 0; j < 3; j++) {
      const nx = px + (r() - 0.5) * 0.5;
      const ny = PY + 0.1 + r() * 0.1;
      const nz = pz + (r() - 0.5) * 0.4;
      const dx = nx - px;
      const dy = ny - py;
      const dz = nz - pz;
      const len = Math.hypot(dx, dy, dz);
      _p.set((px + nx) / 2, (py + ny) / 2, (pz + nz) / 2);
      _q.setFromUnitVectors(V(1, 0, 0), V(dx / len, dy / len, dz / len));
      _s.set(on ? len : 0.0001, 1, 1);
      _m.compose(_p, _q, _s);
      bolts.setMatrixAt(i * 3 + j, _m);
      px = nx;
      py = ny;
      pz = nz;
    }
  }
  bolts.instanceMatrix.needsUpdate = true;
}
const EB_N = 40;
const ebubbles = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(1, 1),
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.05,
    transparent: true,
    opacity: 0.8,
  }),
  EB_N,
);
ebubbles.userData.noAO = true;
mac.add(ebubbles);
function animateEBubbles(t, k, level) {
  ebubbles.visible = k > 0;
  if (!ebubbles.visible) return;
  for (let i = 0; i < EB_N; i++) {
    const r = rng(1500 + i);
    const pin = PINS[Math.floor(r() * PINS.length)];
    const f = (t * (0.6 + r()) + r()) % 1;
    _p.set(pin[0] + (r() - 0.5) * 0.06, lerp(pin[1], PORT_FLOOR + level, f), -0.7 - r() * 1.2);
    _s.setScalar((0.012 + r() * 0.02) * k * (0.6 + f));
    _q.identity();
    _m.compose(_p, _q, _s);
    ebubbles.setMatrixAt(i, _m);
  }
  ebubbles.instanceMatrix.needsUpdate = true;
}
// corrosion: green-white crust growing on the pins
const CR_N = 260;
const crust = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(1, 0),
  flat(0xffffff, { roughness: 0.9 }),
  CR_N,
);
crust.castShadow = true;
mac.add(crust);
const crustSeeds = [];
{
  const rc = rng(1700);
  const col = new THREE.Color();
  for (let i = 0; i < CR_N; i++) {
    const pin = PINS[Math.floor(rc() * PINS.length)];
    const up = pin[1] > PY ? 1 : -1;
    crustSeeds.push([
      pin[0] + (rc() - 0.5) * 0.12,
      pin[1] + up * 0.02,
      -0.65 - rc() * 1.3,
      rc(),
      0.03 + rc() * 0.07,
      rc() * 3,
    ]);
    const c = rc();
    crust.setColorAt(
      i,
      c < 0.6
        ? col.set(0x4fae6a).multiplyScalar(0.8 + rc() * 0.4)
        : c < 0.85
          ? col.set(0x8fd35a)
          : col.set(0xd8efe8),
    );
  }
}
function animateCrust(g) {
  crust.visible = g > 0.001;
  if (!crust.visible) return;
  crustSeeds.forEach(([x, y, z, th, s, rot], i) => {
    const k = clamp01((g - th * 0.8) / 0.25);
    _p.set(x, y, z);
    _e.set(rot, rot * 1.3, rot * 0.7);
    _q.setFromEuler(_e);
    _s.setScalar(Math.max(0.0001, s * smooth(k)));
    _m.compose(_p, _q, _s);
    crust.setMatrixAt(i, _m);
  });
  crust.instanceMatrix.needsUpdate = true;
  pinMat.color.setRGB(lerp(1.0, 0.55, g), lerp(0.78, 0.6, g), lerp(0.29, 0.35, g));
}
// rice dust drifting into the port
const DUST_N = 90;
const dust = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(1, 0),
  flat(0xfffaf0, { roughness: 0.9, emissive: 0x403a30, emissiveIntensity: 0.4 }),
  DUST_N,
);
mac.add(dust);
function animateDust(t, t0) {
  const age = t - t0;
  dust.visible = age >= 0;
  if (!dust.visible) return;
  for (let i = 0; i < DUST_N; i++) {
    const r = rng(1900 + i);
    const start = V((r() - 0.5) * 3.2, 0.4 + r() * 1.2, 0.8 + r() * 1.6);
    const end = V((r() - 0.5) * 2.4, PORT_FLOOR + 0.03 + r() * 0.5, -0.4 - r() * 2.0);
    const f = smooth(clamp01((age - r() * 1.2) / 1.6));
    _p.lerpVectors(start, end, f);
    _p.y += Math.sin(t * 2 + i) * 0.05 * (1 - f);
    _e.set(t * r() * 2, i, t);
    _q.setFromEuler(_e);
    _s.setScalar(0.02 + r() * 0.035);
    if (r() < 0.25) _s.set(0.07, 0.025, 0.03); // broken grain bits
    _m.compose(_p, _q, _s);
    dust.setMatrixAt(i, _m);
  }
  dust.instanceMatrix.needsUpdate = true;
}
// the water indicator: an x-ray window on the slab's top with the board and
// the little white sticker that turns red
const stickerMat = flat(0xffffff, { roughness: 0.6, emissive: 0x000000 });
const IND = V(3.4, 1.6, -2.2);
const touch = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1, 2),
  new THREE.MeshStandardMaterial({
    color: 0x7fd6f5,
    roughness: 0.03,
    metalness: 0.2,
    transparent: true,
    opacity: 0.85,
  }),
);
{
  const boardArt = canvasTex(512, 352);
  const { g } = boardArt;
  g.fillStyle = "#1f6b4a";
  g.fillRect(0, 0, 512, 352);
  g.strokeStyle = "#e8c46a";
  g.lineWidth = 6;
  for (let k = 0; k < 12; k++) {
    g.beginPath();
    g.moveTo(0, 20 + k * 28);
    g.lineTo(140 + (k % 4) * 30, 20 + k * 28);
    g.lineTo(180 + (k % 4) * 30, 40 + k * 26);
    g.lineTo(512, 40 + k * 26);
    g.stroke();
  }
  g.fillStyle = "#15161c";
  g.fillRect(320, 60, 140, 110);
  g.fillRect(40, 230, 110, 80);
  boardArt.tex.needsUpdate = true;
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(2.9, 0.04, 2.1),
    flat(0x1a1c22, { roughness: 0.3 }),
  );
  frame.position.set(IND.x, IND.y + 0.005, IND.z);
  mac.add(frame);
  const board = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 1.8),
    new THREE.MeshStandardMaterial({ map: boardArt.tex, roughness: 0.5 }),
  );
  board.rotation.x = -Math.PI / 2;
  board.position.set(IND.x, IND.y + 0.03, IND.z);
  mac.add(board);
  const sticker = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.02, 0.4), stickerMat);
  sticker.position.set(IND.x, IND.y + 0.045, IND.z + 0.1);
  mac.add(sticker);
  touch.userData.noAO = true;
  mac.add(touch);
}
function animateIndicator(t) {
  const red = smooth(ramp(t, T.rot, T.rot + 0.25));
  stickerMat.color.setRGB(lerp(1, 0.9, red), lerp(1, 0.05, red), lerp(1, 0.08, red));
  stickerMat.emissive.setRGB(red * 0.5, 0, 0);
  const a = ramp(t, T.rot - 0.5, T.rot);
  touch.visible = t > T.rot - 0.5 && t < T.rot + 0.5;
  touch.position.set(IND.x + 0.9 - a * 0.65, IND.y + 0.08, IND.z + 0.1);
  touch.scale.set(
    0.1 + (t > T.rot ? ramp(t, T.rot, T.rot + 0.4) * 0.08 : 0),
    0.06 * (1 - ramp(t, T.rot, T.rot + 0.5)) + 0.001,
    0.1,
  );
}

// ================================================================ render
const applyCamera = shotCamera(shots, 1.0);

function renderAt(t) {
  // ------------------------------------------------ the phone: where is it when?
  let wet = 0;
  let screenState = "lock";
  let day = "";
  let fallAge = -1; // age of the splash in scene time
  let bubbleK = 0;
  plug.visible = false;
  let cableOn = false;
  phoneLight.intensity = 0;

  if (t < SLOW2.at) {
    phoneFall(t);
    fallAge = t - HIT1;
    bubbleK = t > HIT1 ? clamp01(1 - (t - HIT1) / 3.5) : 0;
  } else if (t < T.und1) {
    // the replay on "Platsch"
    const u = t - HIT2 + HIT1;
    phoneFall(u);
    fallAge = u - HIT1;
    bubbleK = u > HIT1 ? 1 : 0;
  } else if (t < T.nur2) {
    phone.position.set(IMPACT.x, BOTTOM, IMPACT.z);
    phone.rotation.set(-Math.PI / 2, 0.35 + (HIT1 - REL) * 0.6, 0);
    bubbleK = t >= T.erst && t < T.dein2 ? 0.35 : 0;
  } else if (t < T.und3 || (t >= T.also && t < T.buchse2)) {
    // flat on the towel, port towards +x
    phone.position.set(ON_TOWEL.x, ON_TOWEL.y, ON_TOWEL.z);
    phone.rotation.set(-Math.PI / 2, Math.PI / 2, 0);
    wet = 1;
  } else if (t < T.also) {
    // into the rice: held upright above the bowl, dropped, stuck
    const top = { x: STOOL[0], y: RICE_Y + PH / 2 + 0.35, z: STOOL[2] };
    const rest = { x: STOOL[0] + 0.05, y: RICE_Y + PH / 2 - 0.55, z: STOOL[2] };
    const rel = T.und3 - 0.02;
    let y = top.y;
    let tilt = 0;
    if (t > rel) {
      const f = t - rel;
      y = Math.max(rest.y, top.y - 0.5 * 30 * f * f);
      if (y <= rest.y) tilt = 0.22 * smooth(clamp01((t - HIT3) / 0.3));
    }
    phone.position.set(lerp(top.x, rest.x, tilt / 0.22), y, top.z);
    phone.rotation.set(0, 2.64, tilt);
  } else {
    // standing up on the towel, port down
    const k = smooth(ramp(t, T.buchse2 + 0.05, T.buchse2 + 0.45));
    phone.position.set(
      ON_TOWEL.x,
      lerp(ON_TOWEL.y, BENCH[1] + PH / 2 + 0.005, k),
      lerp(ON_TOWEL.z, BENCH[2], k),
    );
    phone.rotation.set(lerp(-Math.PI / 2, -0.08, k), lerp(Math.PI / 2, 0.5, k), 0);
    wet = 1 - smooth(ramp(t, T.einen, T.dann2));
  }
  phoneWet.visible = wet > 0.02;
  phoneWet.scale.setScalar(Math.max(0.001, wet));
  phone.updateMatrixWorld();
  portWorld.copy(portLocal).applyMatrix4(phone.matrixWorld);

  // ------------------------------------------------ the screen
  if (t >= PLUG_IN + 0.2 && t < T.rate) screenState = "warn";
  else if (t >= T.rate && t < T.manchmal)
    screenState = Math.floor(t * 9) % 4 === 0 ? "glitch" : "lock";
  else if (t >= T.manchmal && t < T.aus) {
    const n = Math.min(2, Math.floor((t - T.manchmal) / ((T.aus - T.manchmal) / 3)));
    day = ["Montag", "Dienstag", "Mittwoch"][n];
    screenState = "lock";
  } else if (t >= T.aus && t < T.dann2 + 0.1) screenState = "off";
  if (t >= T.also && t < T.einen) screenState = "lock"; // the do-over: still alive, act right
  if (t >= T.einen && t < T.ueberlebt) screenState = "off";
  if (t >= T.ueberlebt && t < T.ueberlebt + 3.2) screenState = "ok";
  drawScreen(screenState, day);
  if (screenState !== "off") {
    phoneLight.intensity = 2.2;
    phoneLight.position.copy(V(0, 0, 0.6).applyMatrix4(phone.matrixWorld));
  }

  // ------------------------------------------------ the hand
  hand.track(t < SLOW2.at ? t : t - HIT2 + HIT1, [
    { t: -0.7, pos: [0.85, 2.3, -0.75], rot: [0.75, 0.15, 0], pose: "grab" },
    { t: REL, pos: [0.85, 2.3, -0.75], rot: [0.75, 0.15, 0], pose: "grab" },
    { t: REL + 0.3, pos: [0.9, 2.6, -0.95], rot: [0.5, 0.15, 0], pose: "open" },
    { t: 1.2, pos: [1.0, 3.2, -1.3], rot: [0.3, 0.15, 0], pose: "open", out: true },
  ]);
  if (t >= T.und1 && t < T.der1) {
    hand.track(t, [
      { t: T.und1 - 0.1, pos: [5.0, 1.5, 2.4], rot: [0.6, -2.3, 0], pose: "open" },
      { t: T.und1 + 0.9, pos: [5.65, 0.85, 1.6], rot: [0.75, -2.3, 0], pose: "grab" },
      { t: T.der1, pos: [5.7, 0.8, 1.55], rot: [0.75, -2.3, 0], pose: "grab", out: true },
    ]);
  }
  // the plug: held, pushed in, sparks
  const plugIn = V(portWorld.x + 0.02, portWorld.y, portWorld.z);
  if (t >= T.nur2 && t < T.rate) {
    const k = smooth(ramp(t, T.nur2 + 0.3, PLUG_IN));
    plug.visible = true;
    cableOn = true;
    plug.position.set(
      lerp(plugIn.x + 1.3, plugIn.x, k),
      lerp(plugIn.y + 0.35, plugIn.y, k),
      lerp(plugIn.z + 0.5, plugIn.z, k),
    );
    plug.rotation.set(0, lerp(-0.5, 0, k), lerp(0.25, 0, k));
    if (t < PLUG_IN + 0.6) {
      hand.track(t, [
        {
          t: T.nur2,
          pos: [plug.position.x + 0.85, plug.position.y + 0.25, plug.position.z + 0.1],
          rot: [0.25, -Math.PI / 2, 0],
          pose: "grab",
        },
        {
          t: PLUG_IN + 0.1,
          pos: [plug.position.x + 0.8, plug.position.y + 0.22, plug.position.z + 0.05],
          rot: [0.25, -Math.PI / 2, 0],
          pose: "grab",
        },
        {
          t: PLUG_IN + 0.6,
          pos: [plug.position.x + 1.4, plug.position.y + 0.5, plug.position.z + 0.3],
          rot: [0.2, -Math.PI / 2, 0],
          pose: "open",
          out: true,
        },
      ]);
    }
  }
  animateSparks(PLUG_IN + 0.25, t, plugIn);
  // rice drop: the hand lets go above the bowl
  if (t >= T.und3 - 0.3 && t < T.zieht) {
    hand.track(t, [
      {
        t: T.und3 - 0.3,
        pos: [STOOL[0] + 0.5, RICE_Y + PH + 0.55, STOOL[2] + 0.55],
        rot: [0.9, -2.6, 0],
        pose: "grab",
      },
      {
        t: T.und3 - 0.02,
        pos: [STOOL[0] + 0.5, RICE_Y + PH + 0.55, STOOL[2] + 0.55],
        rot: [0.9, -2.6, 0],
        pose: "grab",
      },
      {
        t: T.und3 + 0.12,
        pos: [STOOL[0] + 0.6, RICE_Y + PH + 0.75, STOOL[2] + 0.65],
        rot: [0.7, -2.6, 0],
        pose: "open",
      },
      {
        t: T.zieht,
        pos: [STOOL[0] + 0.9, RICE_Y + PH + 1.2, STOOL[2] + 0.9],
        rot: [0.6, -2.6, 0],
        pose: "open",
        out: true,
      },
    ]);
  }
  // "Finger weg": the hand reaches for the rice phone and snaps back
  if (t >= T.sogar && t < T.also) {
    hand.track(t, [
      { t: T.sogar, pos: [8.2, 1.7, 1.5], rot: [0.5, -Math.PI / 2, 0], pose: "open" },
      { t: T.finger - 0.05, pos: [6.95, 1.35, 1.0], rot: [0.6, -Math.PI / 2, 0], pose: "grab" },
      { t: T.finger + 0.3, pos: [8.6, 2.1, 1.7], rot: [0.3, -Math.PI / 2, 0.3], pose: "open" },
      { t: T.also, pos: [8.9, 2.3, 1.9], rot: [0.3, -Math.PI / 2, 0.3], pose: "open", out: true },
    ]);
  }
  // "Kabel weg": the plug is pulled out
  if (t >= T.also && t < T.buchse2) {
    const k = smooth(ramp(t, T.kabel2 + 0.2, T.kabel2 + 0.55));
    plug.visible = true;
    cableOn = true;
    plug.position.set(plugIn.x + k * 1.2, plugIn.y + k * 0.25, plugIn.z + k * 0.35);
    plug.rotation.set(0, -0.4 * k, 0.2 * k);
    hand.track(t, [
      {
        t: T.also + 0.1,
        pos: [plugIn.x + 1.6, plugIn.y + 0.5, plugIn.z + 0.4],
        rot: [0.25, -Math.PI / 2, 0],
        pose: "open",
      },
      {
        t: T.kabel2 + 0.15,
        pos: [plugIn.x + 0.82, plugIn.y + 0.22, plugIn.z + 0.05],
        rot: [0.25, -Math.PI / 2, 0],
        pose: "grab",
      },
      {
        t: T.kabel2 + 0.55,
        pos: [plugIn.x + 2.0, plugIn.y + 0.47, plugIn.z + 0.4],
        rot: [0.25, -Math.PI / 2, 0],
        pose: "grab",
      },
      {
        t: T.buchse2,
        pos: [plugIn.x + 2.2, plugIn.y + 0.5, plugIn.z + 0.5],
        rot: [0.25, -Math.PI / 2, 0],
        pose: "grab",
        out: true,
      },
    ]);
  }
  // stand it up: a quick hand at the top edge
  if (t >= T.buchse2 - 0.05 && t < T.buchse2 + 0.8) {
    hand.track(t, [
      {
        t: T.buchse2 - 0.05,
        pos: [BENCH[0] + 0.9, BENCH[1] + 0.9, BENCH[2] + 0.9],
        rot: [0.5, -2.4, 0],
        pose: "grab",
      },
      {
        t: T.buchse2 + 0.45,
        pos: [BENCH[0] + 0.35, BENCH[1] + 2.2, BENCH[2] + 0.45],
        rot: [0.6, -2.4, 0],
        pose: "grab",
      },
      {
        t: T.buchse2 + 0.8,
        pos: [BENCH[0] + 0.8, BENCH[1] + 2.8, BENCH[2] + 1.0],
        rot: [0.5, -2.4, 0],
        pose: "open",
        out: true,
      },
    ]);
  }
  drawCable(cableOn);
  animateDrips(t, t >= T.buchse2 + 0.4 && t < T.einen + 0.5 ? 1 : 0);

  // ------------------------------------------------ tub life
  animateWater(t, fallAge);
  animateFoam(t);
  animateSplash(fallAge);
  animateSheet(fallAge);
  puff("splash", t, t < SLOW2.at ? HIT1 : HIT2, IMPACT.x, WATER + 0.02, IMPACT.z, 0.9, 0xe8f8ff);
  animateBubbles(t, phone.position, bubbleK);
  animateSteam(t);
  const rock = fallAge > 0 ? Math.exp(-fallAge * 1.5) : 0;
  duck.position.y = WATER + 0.12 + Math.sin(t * 1.7) * 0.02 + Math.sin(fallAge * 9) * 0.08 * rock;
  duck.rotation.z = Math.sin(t * 1.3) * 0.05 + Math.sin(fallAge * 7) * 0.25 * rock;

  // ------------------------------------------------ rice
  animateGrains(t >= T.und3 && t < T.also ? t - HIT3 : -1);
  puff("rice", t, HIT3, STOOL[0], RICE_Y + 0.05, STOOL[2], 0.8, 0xfffaf0);
  showNope(pop(t, T.apple, T.also), STOOL[0] - 1.5, RICE_Y + 1.5, STOOL[2] + 0.6, 0.9);

  // ------------------------------------------------ the time-lapse window
  {
    const f = ramp(t, T.einen, T.dann2);
    const on = t >= T.einen && t < T.dann2 + 0.3;
    windowVeil.material.opacity = on ? Math.sin(Math.PI * clamp01(f * 1.05)) * 0.92 : 0;
    windowVeil.material.color.setRGB(
      lerp(0.04, 1.0, smooth(clamp01((f - 0.5) * 2))),
      lerp(0.06, 0.62, smooth(clamp01((f - 0.5) * 2))),
      lerp(0.2, 0.3, smooth(clamp01((f - 0.5) * 2))),
    );
  }

  // ------------------------------------------------ MAC
  // gasket glows while it is named, the beads wait, then creep in
  gasketMat.emissiveIntensity = 0.2 + 1.6 * pop(t, T.abgedichtet, T.seifenwasser);
  animateBeads(t, T.seifenwasser + 0.1, t < T.seifenwasser ? 1 : 0);
  const level = 0.64 * smooth(ramp(t, T.ritze, T.ladebuchse + 0.6));
  setPortWater(t >= T.seifenwasser ? level : 0);
  const current = t >= T.strom && t < T.rate ? 1 : 0;
  animateBolts(t, current);
  animateEBubbles(t, current, level);
  animateCrust(t >= T.kontakte ? smooth(ramp(t, T.kontakte + 0.2, T.zeitraffer + 0.6)) : 0);
  animateDust(t, t >= T.dafuer && t < T.sogar ? T.dafuer : 1e9);
  animateIndicator(t);

  // ------------------------------------------------ panels + device displays
  if (t >= T.geld - 0.1 && t < T.erst)
    showPanel(pop(t, T.geld - 0.1, T.erst), "REPARATUR", "€€€", LED.red);
  else if (t >= T.sogar && t < T.also)
    showPanel(pop(t, T.apple - 0.1, T.also), "APPLE SAGT", "NEIN", LED.red);
  else showPanel(0);
  readout("test", pop(t, T.sauberes - 0.1, T.seifenwasser), {
    label: "Getestet nur mit",
    value: "Süßwasser",
    x: 60,
    y: 430,
    color: LED.blue,
  });
  counter("zr", pop(t, T.wie, T.rate), {
    label: "Zeitraffer · Stunden",
    value: Math.round(72 * smooth(ramp(t, T.wie, T.rate - 0.1))),
    x: 60,
    y: 1180,
  });
  readout("tage", pop(t, T.manchmal, T.dann1 + 0.4), {
    label: "Lebt noch",
    value: "ein paar Tage",
    x: 60,
    y: 430,
    color: LED.red,
  });
  meter("trocken", pop(t, T.zieht, T.dafuer), {
    label: "Reis zieht raus",
    value: 0.06 + 0.04 * smooth(ramp(t, T.zieht, T.dafuer)),
    x: 60,
    y: 430,
    text: "kaum",
  });
  counter("h", pop(t, T.einen, T.dann2 + 0.2), {
    label: "Stunden warten",
    value: Math.round(24 * smooth(ramp(t, T.einen + 0.1, T.dann2 - 0.15))),
    x: 60,
    y: 430,
  });

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
