// #34 Handy-Akku: why your phone brakes while charging.
// The phone stands on the hallway dresser (origin), the cable runs to the
// wall socket. The battery's inside (CELL) is a dark lab box under the
// floor: a red lattice (+), a thin glowing film, and a parking garage of
// carbon decks (−). The ions are little glowing cars: they leave the
// lattice, shoot through the film and park in the garage — fast while it is
// empty, slower and slower when it fills up. Squeezed in anyway, they park
// outside as metal, grow needles, one pierces the film: short circuit.
// Outside (OUT) the cold phone dies at 20 %.
import {
  THREE,
  ramp,
  smooth,
  easeInOut,
  pop,
  lerp,
  clamp01,
  V,
  rng,
  scene,
  flat,
  M,
  roundedRect,
  xrayMaterial,
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
} from "./world.js";
import "./set.js";
import { createHand } from "./hand.js";
import { meter, gauge } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS, CELL, OUT } from "./beats.js";

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
function slab(w, h, d, r, mat) {
  const g = new THREE.ExtrudeGeometry(roundedRect(w, h, r), {
    depth: d,
    bevelEnabled: true,
    bevelSize: 0.02,
    bevelThickness: 0.02,
    bevelSegments: 2,
    curveSegments: 8,
  });
  g.translate(0, -h / 2, -d / 2);
  const m = new THREE.Mesh(g, mat);
  m.castShadow = m.receiveShadow = true;
  return m;
}
const keyed = (t, keys) => {
  // [[t, v], …] eased between keys
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++)
    if (t < keys[i][0]) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1] = keys[i];
      return lerp(v0, v1, easeInOut((t - t0) / (t1 - t0)));
    }
  return keys[keys.length - 1][1];
};

// ---------------------------------------------------------------- phone state
// battery % on the dresser phone, and what the screen says
function phonePct(t) {
  if (t < T.erst)
    return keyed(t, [
      [-0.2, 3],
      [0.72, 79],
      [0.95, 80],
      [T.erst, 80],
    ]);
  if (t < T.kriecht)
    return keyed(t, [
      [T.erst, 5],
      [T.kriecht - 0.15, 80],
    ]);
  if (t < T.wuerde)
    return keyed(t, [
      [T.kriecht, 80],
      [T.wuerde, 81],
    ]);
  if (t < T.stell)
    return keyed(t, [
      [T.wuerde, 81],
      [T.wuerde + 1.0, 100],
    ]);
  if (t < T.darum1)
    return keyed(t, [
      [T.rein1 + 0.2, 3],
      [T.schichten1, 9],
    ]);
  if (t < T.es)
    return keyed(t, [
      [T.darum1, 80],
      [T.kaelte, 82],
    ]);
  return 100;
}
function phoneMode(t) {
  if (t < 0.72) return "fast";
  if (t < T.erst) return "slow";
  if (t < T.kriecht - 0.15) return "fast";
  if (t < T.wuerde) return "slow";
  if (t < T.stell) return t > T.wuerde + 0.9 ? "hot" : "fast";
  if (t < T.rein1 + 0.15) return "low";
  if (t < T.darum1) return "fast";
  if (t < T.es) return "slow";
  return "full";
}

// ---------------------------------------------------------------- screen art
const MODE_COL = {
  fast: ["#06301c", "#0b5a33", "#3dff7a"],
  slow: ["#2b2406", "#5a4a0b", "#ffd23f"],
  hot: ["#3a0606", "#7a0d0d", "#ff4b2b"],
  low: ["#1a0b10", "#2a0f16", "#ff4b2b"],
  full: ["#06301c", "#0b5a33", "#3dff7a"],
  cold: ["#071a33", "#0d2f5a", "#4fc3ff"],
  off: ["#000", "#000", "#000"],
};
const MODE_TEXT = {
  fast: "SCHNELLLADEN",
  slow: "LÄDT LANGSAM",
  hot: "ZU HEISS!",
  low: "AKKU FAST LEER",
  full: "VOLL",
  cold: "KALT",
  off: "",
};
const FONT_OK = () => document.fonts.check('800 60px "Montserrat"');
function drawScreen(art, pct, mode, time = "7:41") {
  const p = Math.round(pct);
  const key = `${p}|${mode}|${time}|${FONT_OK()}`;
  if (key === art.key) return;
  art.key = key;
  const { g, c } = art;
  const W = c.width;
  const H = c.height;
  const [a, b, acc] = MODE_COL[mode];
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, a);
  gr.addColorStop(1, b);
  g.fillStyle = gr;
  g.fillRect(0, 0, W, H);
  if (mode !== "off") {
    g.textAlign = "center";
    g.fillStyle = "rgba(255,255,255,.9)";
    g.font = '800 92px "Montserrat", sans-serif';
    g.fillText(time, W / 2, 170);
    // glowing ring with the %
    g.save();
    g.shadowColor = acc;
    g.shadowBlur = 40;
    g.strokeStyle = "rgba(255,255,255,.14)";
    g.lineWidth = 26;
    g.beginPath();
    g.arc(W / 2, 520, 190, 0, Math.PI * 2);
    g.stroke();
    g.strokeStyle = acc;
    g.lineCap = "round";
    g.beginPath();
    g.arc(W / 2, 520, 190, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * p) / 100);
    g.stroke();
    g.restore();
    g.fillStyle = "#fff";
    g.font = '800 150px "Montserrat", sans-serif';
    g.fillText(`${p}`, W / 2 - 18, 572);
    g.font = '800 64px "Montserrat", sans-serif';
    g.fillText("%", W / 2 + 112 + (p > 99 ? 40 : 0), 572);
    // lightning bolt when charging
    if (mode === "fast" || mode === "slow" || mode === "hot") {
      g.save();
      g.translate(W / 2, 800);
      g.fillStyle = acc;
      g.shadowColor = acc;
      g.shadowBlur = 30;
      g.beginPath();
      g.moveTo(14, -70);
      g.lineTo(-40, 8);
      g.lineTo(-4, 8);
      g.lineTo(-16, 70);
      g.lineTo(40, -10);
      g.lineTo(4, -10);
      g.closePath();
      g.fill();
      g.restore();
    }
    g.fillStyle = acc;
    g.font = '800 44px "Montserrat", sans-serif';
    g.fillText(MODE_TEXT[mode], W / 2, 920);
  }
  art.tex.needsUpdate = true;
}

// ---------------------------------------------------------------- the phone
function buildPhone(art, scale = 1) {
  const g = new THREE.Group();
  const bodyMat = xrayMaterial(0x23262f, { roughness: 0.3, metalness: 0.4 });
  const body = slab(1.3, 2.6, 0.12, 0.2, bodyMat);
  g.add(body);
  const rimMat = flat(0xb8bcc6, { metalness: 0.85, roughness: 0.25 });
  const rim = slab(1.34, 2.64, 0.06, 0.21, rimMat);
  g.add(rim);
  const scrMat = new THREE.MeshStandardMaterial({
    map: art.tex,
    emissive: 0xffffff,
    emissiveMap: art.tex,
    emissiveIntensity: 0.9,
    roughness: 0.2,
    transparent: true,
  });
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.48), scrMat);
  scr.position.z = 0.085;
  g.add(scr);
  // camera bump on the back
  const cam = slab(0.5, 0.5, 0.05, 0.1, flat(0x1b1d24, { roughness: 0.3 }));
  cam.position.set(-0.32, 0.95, -0.09);
  g.add(cam);
  // the battery inside (shows through the x-ray)
  const batt = new THREE.Group();
  const cellMat = flat(0x3a4a66, {
    metalness: 0.5,
    roughness: 0.35,
    emissive: 0x1a6a3a,
    emissiveIntensity: 0,
  });
  const cell = slab(1.0, 1.75, 0.06, 0.06, cellMat);
  batt.add(cell);
  const strip = new THREE.Mesh(
    new THREE.BoxGeometry(0.98, 0.25, 0.07),
    flat(0x3dff7a, { emissive: 0x3dff7a, emissiveIntensity: 0.6 }),
  );
  strip.position.y = 0.55;
  batt.add(strip);
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 0.05), flat(0x1f7a4a));
  board.position.y = 1.05;
  batt.add(board);
  batt.position.set(0, -0.2, 0);
  batt.visible = false;
  g.add(batt);
  g.scale.setScalar(scale);
  return { g, bodyMat, scrMat, batt, cellMat };
}

const screenA = canvasTex(512, 1024);
const PH = buildPhone(screenA);
const phone = PH.g;
const PHONE_Y = 1.58;
phone.position.set(0, PHONE_Y, 0);
phone.rotation.x = -0.14;
scene.add(phone);
// stand: a small walnut wedge with a lip
{
  const st = new THREE.Group();
  const base = slab(1.6, 0.25, 1.4, 0.08, flat(0x6b4426, { roughness: 0.5 }));
  base.rotation.x = -Math.PI / 2;
  base.position.set(0, 0.0, -0.1);
  st.add(base);
  const back = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 1.6, 0.16),
    flat(0x6b4426, { roughness: 0.5 }),
  );
  back.position.set(0, 0.9, -0.42);
  back.rotation.x = -0.14;
  back.castShadow = true;
  st.add(back);
  const lip = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.16, 0.2), flat(0x6b4426));
  lip.position.set(0, 0.2, 0.22);
  st.add(lip);
  scene.add(st);
}
// heat glow + flames for "könnte brennen"
const hotGlow = new THREE.PointLight(0xff4020, 0, 6, 1.6);
hotGlow.position.set(0, 1.4, 0.6);
scene.add(hotGlow);
const flameMat = new THREE.MeshBasicMaterial({ color: 0xffa020, transparent: true, opacity: 0.9 });
const flames = [];
for (let i = 0; i < 9; i++) {
  const f = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.7, 6), flameMat.clone());
  f.userData.noAO = true;
  scene.add(f);
  flames.push(f);
}
// charging glow at the port
const chargeGlow = new THREE.PointLight(0x3dff7a, 0, 4, 1.6);
chargeGlow.position.set(0, 0.5, 0.7);
scene.add(chargeGlow);

// ---------------------------------------------------------------- the cable
const PORT = V(0, 0.33, 0.12); // phone bottom edge, world
const LOOSE = V(1.1, 0.07, 1.25); // plug lying on the dresser
const HOOKSTART = V(0.35, 0.05, 0.9); // the hand brings it in on frame 0
const cableMat = flat(0xf4f4f4, { roughness: 0.5 });
let cableMesh = null;
let cableKey = "";
const plug = new THREE.Mesh(
  new THREE.BoxGeometry(0.16, 0.34, 0.1),
  flat(0xf4f4f4, { roughness: 0.4 }),
);
plug.castShadow = true;
scene.add(plug);
const charger = new THREE.Mesh(
  new THREE.BoxGeometry(0.62, 0.62, 0.4),
  flat(0xf6f6f6, { roughness: 0.4 }),
);
charger.position.set(-6.0, 1.0, -4.92);
charger.castShadow = true;
scene.add(charger);
const plugPos = V(0, 0, 0);
function plugK(t) {
  if (t < T.stell) return smooth(ramp(t, -0.3, 0.12));
  if (t < T.kabel) return 0;
  return smooth(ramp(t, T.kabel + 0.15, T.rein1 + 0.05));
}
function updateCable(t) {
  const k = plugK(t);
  const from = t < T.stell ? HOOKSTART : LOOSE;
  plugPos.copy(from).lerp(PORT, k);
  const key = `${plugPos.x.toFixed(3)},${plugPos.y.toFixed(3)},${plugPos.z.toFixed(3)}`;
  if (key !== cableKey) {
    cableKey = key;
    const tail = plugPos.clone().add(V(0, -0.2, 0.25).multiplyScalar(k > 0.5 ? 1 : 0.4));
    const curve = new THREE.CatmullRomCurve3([
      plugPos.clone().add(V(0, -0.15, 0)),
      tail,
      V(0.6, 0.05, 1.6),
      V(-2.6, 0.05, 1.4),
      V(-4.8, 0.05, -2.6),
      V(-5.7, 0.08, -4.6),
      V(-6.0, 0.7, -4.9),
    ]);
    if (cableMesh) {
      cableMesh.geometry.dispose();
      scene.remove(cableMesh);
    }
    cableMesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 90, 0.045, 6), cableMat);
    cableMesh.castShadow = true;
    cableMesh.userData.curve = curve;
    scene.add(cableMesh);
  }
  plug.position.copy(plugPos);
  plug.rotation.x = k > 0.5 ? 0 : 0.6 * (1 - k);
}
// current beads along the cable, flowing into the phone while it charges
const NB = 34;
const beads = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.06, 0),
  new THREE.MeshBasicMaterial({ color: 0x3dff7a }),
  NB,
);
beads.userData.noAO = true;
scene.add(beads);
// integrated flow phase (speed follows fast / slow charging): table at 30 fps
const FLOW = [];
{
  let ph = 0;
  for (let i = 0; i <= 62 * 30; i++) {
    const t = i / 30;
    const m = phoneMode(t);
    ph += (m === "fast" || m === "hot" ? 0.9 : m === "slow" ? 0.12 : 0) / 30;
    FLOW.push(ph);
  }
}
const flowAt = (t) => FLOW[Math.max(0, Math.min(FLOW.length - 1, Math.round(t * 30)))];
const _m = new THREE.Matrix4();

// ---------------------------------------------------------------- medal (Übrigens)
const medalArt = canvasTex(256, 256);
{
  const { g } = medalArt;
  const gr = g.createRadialGradient(110, 100, 10, 128, 128, 128);
  gr.addColorStop(0, "#fff3b0");
  gr.addColorStop(0.5, "#f2c440");
  gr.addColorStop(1, "#b27f12");
  g.fillStyle = gr;
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = "rgba(120,80,10,.6)";
  g.lineWidth = 8;
  g.beginPath();
  g.arc(128, 128, 112, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = "#6b4a08";
  g.textAlign = "center";
  g.font = '800 120px "Montserrat", sans-serif';
  g.fillText("97", 128, 170);
  medalArt.tex.needsUpdate = true;
}
const medal = new THREE.Group();
{
  const goldM = flat(0xf2c440, { metalness: 0.85, roughness: 0.25 });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.08, 32), goldM);
  disc.rotation.x = Math.PI / 2;
  disc.castShadow = true;
  const face = new THREE.Mesh(
    new THREE.CircleGeometry(0.53, 32),
    new THREE.MeshStandardMaterial({ map: medalArt.tex, metalness: 0.6, roughness: 0.3 }),
  );
  face.position.z = 0.045;
  medal.add(face);
  medal.add(disc);
  const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.9, 0.03), flat(0x2f6fd6));
  ribbon.position.y = 0.85;
  medal.add(ribbon);
  medal.position.set(1.55, 0.75, 1.0);
  medal.scale.setScalar(0.75);
  scene.add(medal);
}

// ---------------------------------------------------------------- the battery's inside (CELL)
const cellW = new THREE.Group();
cellW.position.set(...CELL);
scene.add(cellW);
{
  const room = new THREE.Mesh(
    new THREE.BoxGeometry(60, 30, 60),
    new THREE.MeshBasicMaterial({ color: 0x0a0f22, side: THREE.BackSide, fog: false }),
  );
  room.position.y = 12;
  cellW.add(room);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshStandardMaterial({ color: 0x141a30, roughness: 0.22, metalness: 0.4 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  cellW.add(floor);
  const grid = new THREE.GridHelper(60, 60, 0x2a4a8a, 0x1a2a55);
  grid.position.y = 0.01;
  cellW.add(grid);
  // the battery's aluminium tray
  const tray = new THREE.Mesh(
    new THREE.BoxGeometry(12.4, 0.3, 6.2),
    flat(0x9aa3b4, { metalness: 0.7, roughness: 0.3 }),
  );
  tray.position.y = 0.15;
  tray.castShadow = tray.receiveShadow = true;
  cellW.add(tray);
  const warm = new THREE.PointLight(0xffe2c0, 60, 30, 1.4);
  warm.position.set(0, 9, 5);
  cellW.add(warm);
  const cyan = new THREE.PointLight(0x4fc3ff, 30, 22, 1.5);
  cyan.position.set(-8, 4, -2);
  cellW.add(cyan);
  const mag = new THREE.PointLight(0xc65bff, 25, 22, 1.5);
  mag.position.set(9, 4, -2);
  cellW.add(mag);
}
// the (+) side: a red lattice of metal-oxide balls
const LAT = [];
{
  for (let ix = 0; ix < 6; ix++)
    for (let iy = 0; iy < 6; iy++)
      for (let iz = 0; iz < 8; iz++)
        LAT.push([-4.6 + ix * 0.62, 0.55 + iy * 0.56, -2.0 + iz * 0.57]);
  const balls = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.21, 1),
    flat(0xe0533a, { roughness: 0.4, metalness: 0.2 }),
    LAT.length,
  );
  const col = new THREE.Color();
  const rr = rng(5);
  LAT.forEach(([x, y, z], i) => {
    balls.setMatrixAt(i, _m.makeTranslation(x, y, z));
    balls.setColorAt(i, col.setHex(0xe0533a).multiplyScalar(0.85 + rr() * 0.3));
  });
  balls.castShadow = true;
  cellW.add(balls);
}
// the film between the sides
const filmMat = new THREE.MeshStandardMaterial({
  color: 0x9fe6ff,
  emissive: 0x2fa8ff,
  emissiveIntensity: 0.5,
  transparent: true,
  opacity: 0.42,
  roughness: 0.1,
  depthWrite: false,
  side: THREE.DoubleSide,
});
const film = new THREE.Mesh(new THREE.BoxGeometry(0.04, 3.7, 4.9), filmMat);
film.position.set(0, 2.15, 0);
film.userData.noAO = true;
cellW.add(film);
const filmEdge = new THREE.LineSegments(
  new THREE.EdgesGeometry(new THREE.BoxGeometry(0.05, 3.7, 4.9)),
  new THREE.LineBasicMaterial({ color: 0x8fe8ff }),
);
filmEdge.position.copy(film.position);
cellW.add(filmEdge);
// the hair, for scale
const hair = new THREE.Mesh(
  new THREE.CylinderGeometry(0.16, 0.16, 4.2, 10),
  flat(0x5a3a22, { roughness: 0.6 }),
);
hair.position.set(-0.9, 2.3, 2.3);
hair.rotation.z = 0.05;
hair.castShadow = true;
cellW.add(hair);

// the (−) side: a parking garage of carbon decks
const DECK_Y = [0.45, 1.3, 2.15, 3.0];
const ROOF_Y = 3.85;
const SLOTS = [];
{
  const deckMat = flat(0x3b4150, { roughness: 0.45, metalness: 0.25 });
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xffd23f });
  for (const y of [...DECK_Y, ROOF_Y]) {
    const d = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.12, 4.9), deckMat);
    d.position.set(3.05, y - 0.08, 0);
    d.castShadow = d.receiveShadow = true;
    cellW.add(d);
  }
  for (const x of [1.15, 3.05, 4.95])
    for (const z of [-2.35, 0, 2.35]) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(0.16, ROOF_Y - 0.3, 0.16), deckMat);
      c.position.set(x, (ROOF_Y + 0.3) / 2, z);
      c.castShadow = true;
      cellW.add(c);
    }
  DECK_Y.forEach((y, f) => {
    for (const rx of [1.95, 4.05])
      for (let j = 0; j < 8; j++) {
        const z = -2.1 + j * 0.6;
        SLOTS.push([rx, y + 0.11, z, f]);
        const ln = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.01, 0.03), lineMat);
        ln.position.set(rx, y + 0.0, z + 0.3);
        cellW.add(ln);
      }
  });
  // blue "P" sign on the roof
  const pArt = canvasTex(128, 128);
  pArt.g.fillStyle = "#1f5fd6";
  pArt.g.fillRect(0, 0, 128, 128);
  pArt.g.fillStyle = "#fff";
  pArt.g.font = '800 104px "Montserrat", sans-serif';
  pArt.g.textAlign = "center";
  pArt.g.fillText("P", 64, 104);
  pArt.tex.needsUpdate = true;
  const sign = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.08), [
    flat(0x1f5fd6),
    flat(0x1f5fd6),
    flat(0x1f5fd6),
    flat(0x1f5fd6),
    new THREE.MeshStandardMaterial({
      map: pArt.tex,
      emissive: 0xffffff,
      emissiveMap: pArt.tex,
      emissiveIntensity: 0.5,
    }),
    flat(0x1f5fd6),
  ]);
  sign.position.set(4.6, ROOF_Y + 0.75, -2.0);
  cellW.add(sign);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 6), M.chrome);
  pole.position.set(4.6, ROOF_Y + 0.15, -2.0);
  cellW.add(pole);
}
// slot order: bottom deck first, near row before far row
const NS = SLOTS.length; // 64

// ---------------------------------------------------------------- the ions (little glowing cars)
const carGeo = new THREE.BoxGeometry(0.46, 0.14, 0.26);
const cabGeo = new THREE.BoxGeometry(0.24, 0.11, 0.22);
cabGeo.translate(-0.02, 0.12, 0);
const NX = 6; // extra "searching" cars + outside metal cars
const NCAR = NS + NX;
const carMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const cars = new THREE.InstancedMesh(carGeo, carMat, NCAR);
const cabs = new THREE.InstancedMesh(
  cabGeo,
  new THREE.MeshBasicMaterial({ color: 0xffffff }),
  NCAR,
);
cars.userData.noAO = cabs.userData.noAO = true;
cellW.add(cars, cabs);
// lattice start spots for the 64 cars (gaps of the red lattice)
const START = [];
{
  const rr = rng(9);
  const gaps = [];
  for (let ix = 0; ix < 5; ix++)
    for (let iy = 0; iy < 5; iy++)
      for (let iz = 0; iz < 7; iz++)
        gaps.push([-4.3 + ix * 0.62, 0.83 + iy * 0.56, -1.72 + iz * 0.57]);
  // pick 64 gaps, the ones nearest the film leave first
  gaps.sort((a, b) => b[0] - a[0] + (rr() - 0.5) * 0.9);
  for (let i = 0; i < NS; i++) START.push(gaps[i]);
}
// fill level of the garage over time (0..1 of NS)
function fill(t) {
  return keyed(t, [
    [T.schiessen - 0.05, 0],
    [T.ionen1, 0.28],
    [T.anfang, 0.31],
    [T.rein2, 0.31],
    [T.zack + 0.1, 0.33],
    [T.halb, 0.4],
    [T.aber, 0.5],
    [T.trotzdem, 0.7],
    [T.rate, 0.9],
    [T.kurzschluss + 0.5, 0.92],
    [T.darum1, 0.8],
    [T.es, 0.93],
    [T.parkplaetze + 0.4, 1.0],
  ]);
}
const BAND = 5; // cars in flight at once
// path of car i at progress p: lattice → film crossing → garage mouth → slot
function carPath(i, p, out) {
  const s = START[i];
  const g = SLOTS[i];
  const c = [0, g[1] * 0.85 + 0.35, g[2] * 0.8];
  const e = [1.0, g[1], g[2]];
  if (p < 0.55) {
    const k = p / 0.55;
    out.set(
      lerp(s[0], c[0], k),
      lerp(s[1], c[1], k) + Math.sin(k * Math.PI) * 0.35,
      lerp(s[2], c[2], k),
    );
  } else if (p < 0.75) {
    const k = (p - 0.55) / 0.2;
    out.set(lerp(c[0], e[0], k), lerp(c[1], e[1], k), lerp(c[2], e[2], k));
  } else {
    const k = smooth((p - 0.75) / 0.25);
    out.set(lerp(e[0], g[0], k), lerp(e[1], g[1], k), lerp(e[2], g[2], k));
  }
  return out;
}
const _p = V(0, 0, 0);
const _q = V(0, 0, 0);
const _col = new THREE.Color();
const _quat = new THREE.Quaternion();
const _scale = V(1, 1, 1);
const UP = V(0, 1, 0);
// the six extra cars: circling while searching, then parked outside as metal
const OUTSIDE = [
  [1.04, 2.0, 0.4],
  [1.04, 2.65, -0.9],
  [1.04, 1.45, 1.3],
  [1.04, 2.9, 1.0],
  [1.04, 1.2, -1.6],
  [1.04, 3.3, -0.2],
];
// needles growing from the outside cars toward the film; #0 pierces it
const NEEDLE_REACH = [1.25, 0.6, 0.75, 0.45, 0.55, 0.35];
const needleMat = flat(0xe8f0ff, {
  metalness: 0.8,
  roughness: 0.2,
  emissive: 0xbfd4ff,
  emissiveIntensity: 0.6,
});
const needles = OUTSIDE.map(([x, y, z]) => {
  const g = new THREE.Group();
  const main = new THREE.Mesh(new THREE.ConeGeometry(0.13, 1, 6), needleMat);
  main.rotation.z = Math.PI / 2; // tip along -x
  main.position.x = -0.5;
  g.add(main);
  for (let b = 0; b < 3; b++) {
    const br = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.45, 5), needleMat);
    br.rotation.z = Math.PI / 2 + (b % 2 ? 0.7 : -0.7);
    br.position.set(-0.25 - b * 0.25, (b % 2 ? 1 : -1) * 0.08, 0);
    g.add(br);
  }
  g.position.set(x - 0.05, y, z);
  cellW.add(g);
  return g;
});
// sparks of the short circuit
const NSP = 60;
const sparks = new THREE.InstancedMesh(
  new THREE.BoxGeometry(0.06, 0.06, 0.06),
  new THREE.MeshBasicMaterial({ color: 0xffc04a }),
  NSP,
);
sparks.userData.noAO = true;
cellW.add(sparks);
const SPARK = Array.from({ length: NSP }, (_, i) => {
  const r = rng(200 + i);
  const a = r() * Math.PI * 2;
  const b = r() * Math.PI - Math.PI / 2;
  const s = 2 + r() * 4;
  return [Math.cos(a) * Math.cos(b) * s, Math.sin(b) * s + 2, Math.sin(a) * Math.cos(b) * s, r()];
});
const shortLight = new THREE.PointLight(0xff3a1a, 0, 14, 1.4);
shortLight.position.set(0, 2.0, 0.4);
cellW.add(shortLight);

// ---------------------------------------------------------------- outside: the cold phone
const screenB = canvasTex(512, 1024);
const PB = buildPhone(screenB, 0.42);
scene.add(PB.g);
const handOut = createHand({ scale: 0.8, sleeve: 0x2f6fd6 });
const frostMat = new THREE.MeshBasicMaterial({
  color: 0xcfeaff,
  transparent: true,
  opacity: 0,
  depthWrite: false,
});
const frost = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 1.06), frostMat);
scene.add(frost);

// ---------------------------------------------------------------- hands
const hand = createHand({ scale: 1.5, sleeve: 0x2f8a6a });

const applyCamera = shotCamera(shots);

// ---------------------------------------------------------------- render
function renderAt(t) {
  // ---- phone on the dresser
  const pct = phonePct(t);
  const mode = phoneMode(t);
  drawScreen(screenA, pct, mode);
  phone.visible = true;
  // x-ray: the battery inside (only in the medium orbit)
  const xr = smooth(ramp(t, T.deinem + 0.1, T.deinem + 0.5)) * (t < T.schichten1 ? 1 : 0);
  setXray([PH.bodyMat], xr);
  PH.batt.visible = xr > 0.01;
  PH.scrMat.opacity = 1 - xr;
  PH.scrMat.visible = xr < 0.98;
  PH.cellMat.emissiveIntensity = 1.6 * xr * (0.6 + 0.4 * Math.sin(t * 9));
  // brake jolt at 0.72 s and overheating shiver
  const jolt = Math.exp(-Math.max(0, t - 0.72) * 9) * (t > 0.72 ? 1 : 0);
  const hot = t > T.wuerde + 0.6 && t < T.stell ? smooth(ramp(t, T.wuerde + 0.6, T.brennen)) : 0;
  phone.position.y = PHONE_Y + jolt * 0.03 * Math.sin(t * 80);
  phone.position.x = hot * Math.sin(t * 70) * 0.012;
  phone.rotation.z = jolt * 0.04 * Math.sin(t * 60);
  hotGlow.intensity = hot * (12 + Math.sin(t * 31) * 3);
  // flames + smoke on "brennen", then the ✕ (it would — but it doesn't)
  const fl =
    t > T.brennen - 0.1 && t < T.stell ? smooth(ramp(t, T.brennen - 0.1, T.brennen + 0.15)) : 0;
  flames.forEach((f, i) => {
    const ph = (t * 2.6 + i * 0.37) % 1;
    f.visible = fl > 0.01;
    const a = (i / flames.length) * Math.PI * 2;
    f.position.set(Math.cos(a) * 0.55, 0.5 + ph * 1.6 + (i % 3) * 0.3, -0.25 + Math.sin(a) * 0.25);
    f.scale.setScalar(fl * (1.2 - ph) * (0.8 + 0.3 * Math.sin(t * 13 + i)));
    f.material.color.setHex(ph < 0.4 ? 0xffd04a : 0xff5a1f);
  });
  for (let i = 0; i < 3; i++)
    puff(`smoke${i}`, t, T.brennen + i * 0.18, (i - 1) * 0.4, 2.6, -0.1, 0.9, 0x6a6470);
  showNope(pop(t, T.brennen + 0.25, T.stell), 0, 1.6, 0.6, 0.9);
  // ---- cable, plug, current
  updateCable(t);
  const charging = mode === "fast" || mode === "slow" || mode === "hot";
  chargeGlow.intensity = charging && plugK(t) > 0.9 ? (mode === "slow" ? 1.5 : 4) : 0;
  const curve = cableMesh.userData.curve;
  const fph = flowAt(t);
  for (let i = 0; i < NB; i++) {
    const u = 1 - ((i / NB + fph) % 1);
    if (!charging || plugK(t) < 0.9 || u < 0.02) {
      beads.setMatrixAt(i, _m.makeScale(0, 0, 0));
      continue;
    }
    curve.getPointAt(u, _p);
    _m.makeTranslation(_p.x, _p.y + 0.02, _p.z);
    beads.setMatrixAt(i, _m);
  }
  beads.instanceMatrix.needsUpdate = true;
  // the hook hand pushes the plug in, the story hand later plugs it in again
  if (t < T.stell) {
    const R = [0.2, -Math.PI / 2, 0];
    hand.track(t, [
      { t: -0.6, pos: [HOOKSTART.x + 0.75, HOOKSTART.y + 0.18, HOOKSTART.z], rot: R, pose: "grab" },
      { t: 0.12, pos: [PORT.x + 0.62, PORT.y + 0.05, PORT.z + 0.1], rot: R, pose: "grab" },
      { t: 0.5, pos: [PORT.x + 0.8, PORT.y + 0.1, PORT.z + 0.2], rot: R, pose: "open" },
      { t: 1.0, pos: [2.2, 0.5, 0.6], rot: R, pose: "open", out: true },
    ]);
  } else {
    hand.track(t, [
      { t: T.kabel - 0.4, pos: [2.4, 0.5, 1.4], rot: [0.2, -Math.PI / 2, 0], pose: "open" },
      {
        t: T.kabel + 0.15,
        pos: [LOOSE.x + 0.7, LOOSE.y + 0.15, LOOSE.z],
        rot: [0.2, -Math.PI / 2, 0],
        pose: "grab",
      },
      {
        t: T.rein1 + 0.05,
        pos: [PORT.x + 0.62, PORT.y + 0.05, PORT.z + 0.1],
        rot: [0.2, -Math.PI / 2, 0],
        pose: "grab",
      },
      { t: T.deinem, pos: [2.2, 0.5, 0.8], rot: [0.2, -Math.PI / 2, 0], pose: "open", out: true },
    ]);
  }
  // ---- the medal
  medal.visible = t >= T.fakt + 0.15;
  medal.scale.copy(squash(t, T.fakt + 0.15)).multiplyScalar(0.75);
  medal.rotation.y = 0.15 + Math.sin(t * 1.2) * 0.2;
  medal.position.y = 0.72 + Math.sin(t * 2) * 0.04;
  puff("medal", t, T.fakt + 0.25, 1.55, 0.05, 1.0, 0.6);

  // ---- the battery's inside
  const F = fill(t);
  const parked = F * NS;
  const cold = t >= T.kaelte && t < T.es ? 1 : 0;
  const shortK =
    t >= T.kurzschluss && t < T.darum1 ? 1 - ramp(t, T.kurzschluss, T.darum1) * 0.6 : 0;
  const full = smooth(ramp(t, T.parkplaetze - 0.2, T.parkplaetze + 0.4));
  for (let i = 0; i < NS; i++) {
    const p = clamp01((parked - i) / BAND + 1);
    // p: 0 = still in the lattice, 1 = parked
    const pp = clamp01((parked - i + BAND) / BAND);
    carPath(i, pp, _p);
    // heading: along the path
    carPath(i, Math.min(1, pp + 0.02), _q);
    const dx = _q.x - _p.x;
    const dz = _q.z - _p.z;
    const yaw = pp >= 0.99 ? (SLOTS[i][0] < 3 ? 0 : 0) : Math.atan2(-dz, dx);
    _quat.setFromAxisAngle(UP, yaw);
    const bob = pp > 0 && pp < 0.99 ? 1.15 : 1;
    _scale.set(bob, bob, bob);
    _m.compose(_p, _quat, _scale);
    cars.setMatrixAt(i, _m);
    cabs.setMatrixAt(i, _m);
    // colour: green ions; icy blue in the cold; brighter when all parked
    if (cold) _col.setHex(0x8fd8ff);
    else _col.setHex(pp >= 0.99 ? 0x3dff7a : 0x9dffb8);
    if (full > 0 && pp >= 0.99) _col.lerp(new THREE.Color(0xc8ffd8), full * 0.5);
    cars.setColorAt(i, _col);
    cabs.setColorAt(i, _col.clone().multiplyScalar(0.45));
    void p;
  }
  // six extra cars: circle while searching (aber … rate), then park outside as metal
  for (let k = 0; k < NX; k++) {
    const i = NS + k;
    const vis = t >= T.aber && t < T.darum1;
    if (!vis) {
      cars.setMatrixAt(i, _m.makeScale(0, 0, 0));
      cabs.setMatrixAt(i, _m.makeScale(0, 0, 0));
      continue;
    }
    const o = OUTSIDE[k];
    const land = smooth(ramp(t, T.draussen1 - 0.3 + k * 0.08, T.draussen1 + 0.25 + k * 0.08));
    const a = t * (1.2 + k * 0.15) + k;
    const cx = 0.55 + Math.cos(a) * 0.3;
    const cy = 1.0 + k * 0.45 + Math.sin(a * 0.7) * 0.15;
    const cz = Math.sin(a) * 1.8;
    _p.set(lerp(cx, o[0], land), lerp(cy, o[1], land), lerp(cz, o[2], land));
    const yaw = land > 0.9 ? Math.PI / 2 : -a;
    _quat.setFromAxisAngle(UP, yaw);
    // parked outside: stood upright against the deck face
    const tilt = new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), land * Math.PI * 0.5);
    _quat.multiply(tilt);
    _m.compose(_p, _quat, V(1, 1, 1));
    cars.setMatrixAt(i, _m);
    cabs.setMatrixAt(i, _m);
    const metal = smooth(ramp(t, T.metall, T.metall + 0.4));
    _col.setHex(cold ? 0x8fd8ff : 0x9dffb8).lerp(new THREE.Color(0xc9d2de), metal);
    cars.setColorAt(i, _col);
    cabs.setColorAt(i, _col.clone().multiplyScalar(0.8));
  }
  cars.instanceMatrix.needsUpdate = cabs.instanceMatrix.needsUpdate = true;
  cars.instanceColor.needsUpdate = cabs.instanceColor.needsUpdate = true;
  // needles
  needles.forEach((g, k) => {
    const grow =
      k === 0
        ? ramp(t, T.wachsen, T.sticht + 0.35)
        : ramp(t, T.wachsen, T.wachsen + 0.4 + k * 0.05);
    const L = NEEDLE_REACH[k] * smooth(grow);
    g.visible = L > 0.01 && t < T.darum1;
    g.scale.set(Math.max(0.01, L), 1, 1);
  });
  // short circuit: the film burns red, sparks fly
  filmMat.emissive.setHex(shortK > 0 ? 0xff3a1a : cold ? 0x6fd0ff : 0x2fa8ff);
  filmMat.emissiveIntensity = shortK > 0 ? 1.4 * shortK + Math.sin(t * 40) * 0.3 : 0.5;
  shortLight.intensity = shortK * (30 + Math.sin(t * 47) * 10);
  for (let i = 0; i < NSP; i++) {
    const x = t - T.kurzschluss;
    if (x < 0 || x > 0.9) {
      sparks.setMatrixAt(i, _m.makeScale(0, 0, 0));
      continue;
    }
    const [vx, vy, vz] = SPARK[i];
    const tt = x * 0.9;
    _m.makeTranslation(vx * tt * 0.6, 2.0 + vy * tt * 0.6 - 4 * tt * tt, 0.4 + vz * tt * 0.6);
    sparks.setMatrixAt(i, _m);
  }
  sparks.instanceMatrix.needsUpdate = true;
  // hair for scale
  const hairK = pop(t, T.duenner, T.jetzt);
  hair.visible = hairK > 0.01;
  hair.scale.set(1, Math.max(0.01, hairK), 1);

  // ---- outside: the cold phone in your hand
  const outVis = (t >= T.kaelte && t < T.traege) || (t >= T.darum2 && t < T.es);
  PB.g.visible = outVis;
  handOut.track(
    t,
    outVis
      ? [
          {
            t: T.kaelte - 0.1,
            pos: [OUT[0], OUT[1] + 1.85, OUT[2] - 0.3],
            rot: [-1.35, 0, 0],
            pose: "grab",
          },
          { t: T.es, pos: [OUT[0], OUT[1] + 1.83, OUT[2] - 0.3], rot: [-1.35, 0, 0], pose: "grab" },
        ]
      : [{ t: -5, pos: [0, -50, 0], rot: [0, 0, 0], pose: "open", out: true }],
  );
  PB.g.position.set(OUT[0], OUT[1] + 2.6 + Math.sin(t * 1.3) * 0.01, OUT[2]);
  PB.g.rotation.set(-0.25, 0, 0);
  const outPct = keyed(t, [
    [T.kaelte, 31],
    [T.traege, 27],
    [T.darum2, 24],
    [T.zwanzig + 0.1, 20],
  ]);
  const dead = t >= T.aus2;
  drawScreen(screenB, outPct, dead ? "off" : "cold", "7:52");
  frost.position.set(OUT[0], OUT[1] + 2.6, OUT[2] + 0.06);
  frost.rotation.copy(PB.g.rotation);
  frost.visible = outVis;
  frostMat.opacity = outVis ? 0.18 + 0.1 * Math.sin(t * 2) : 0;

  // ---- displays
  if (t >= T.erst && t < T.wuerde) {
    const k = pop(t, T.erst + 0.1, T.wuerde);
    meter("akku", k, {
      label: t < T.kriecht ? "Laden · schnell" : "Laden · langsam",
      value: pct / 100,
      text: `${Math.round(pct)} %`,
      x: 60,
      y: 1150,
      color: t < T.kriecht ? LED.green : LED.yellow,
    });
  }
  if (t >= T.darum1 && t < T.kaelte) {
    const w = keyed(t, [
      [T.darum1, 27],
      [T.runter, 24],
      [T.runter + 0.6, 6],
    ]);
    gauge("watt", pop(t, T.darum1 + 0.1, T.kaelte), {
      label: "Ladestrom",
      value: w,
      max: 30,
      unit: "W",
      x: 60,
      y: 1120,
    });
  }
  if (t >= T.halb && t < T.aber)
    showPanel(pop(t, T.halb, T.aber), "HALB VOLL IN", "30 MIN", LED.green);
  else if (t >= T.kurzschluss && t < T.darum1)
    showPanel(pop(t, T.kurzschluss, T.darum1), "FOLIE", "DURCH", LED.red);
  else if (t >= T.achtzig && t < T.kaelte)
    showPanel(pop(t, T.achtzig, T.kaelte), "LANGSAM AB", "80 %", LED.yellow);
  else if (t >= T.zwanzig && t < T.es)
    showPanel(pop(t, T.zwanzig, T.es), "KALT · AUS BEI", "20 %", LED.blue);
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
