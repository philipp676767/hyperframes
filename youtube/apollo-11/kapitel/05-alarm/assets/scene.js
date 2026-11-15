// Chapter 5 "Alarm 1202": the Eagle in powered descent with the alarm,
// the DSKY, Mission Control with Steve Bales (a faceless figure), the radar
// switch in the wrong position, the overwhelmed cook, the restart, Garman's
// cheat sheet, "Go", and the boulder field ahead.
import {
  THREE,
  V,
  scene,
  ramp,
  smooth,
  pop,
  lerp,
  squash,
  real,
  roundedBox,
  showPanel,
  LED,
  labels,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import "./set.js";
import { makeLM, makeDSKY, makeDust, moonHeight, DSKY_POS } from "./welt.js";
import { stopwatch } from "./hud.js";
import { T, MCC, SW, KIT, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);

// ---------------------------------------------------------------- the Eagle's descent toward the boulder field
const lm = makeLM();
scene.add(lm.group);
const A = V(-20, 70, 12);
const B = V(18, 27, -30);
const LMW = V();
const lmAt = (t) => A.clone().lerp(B, Math.min(1, t / 62));
for (const s of shots) if (s.rel === "lm") s.rel = LMW;
const dust = makeDust(140);

// ---------------------------------------------------------------- DSKY
const dsky = makeDSKY();
dsky.group.position.copy(DSKY_POS);
scene.add(dsky.group);

// canvas helper
const canvasTex = (w, h, draw) => {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  draw(cv.getContext("2d"));
  const tx = new THREE.CanvasTexture(cv);
  tx.colorSpace = THREE.SRGBColorSpace;
  return tx;
};
const screenMat = (tex, i = 0.9) =>
  new THREE.MeshStandardMaterial({
    map: tex,
    emissiveMap: tex,
    emissive: 0xffffff,
    emissiveIntensity: i,
    roughness: 0.3,
  });

// ---------------------------------------------------------------- Mission Control (1969 style)
const M = V(...MCC);
const mcc = new THREE.Group();
mcc.position.copy(M);
scene.add(mcc);
const greenTex = canvasTex(256, 192, (c) => {
  c.fillStyle = "#06120a";
  c.fillRect(0, 0, 256, 192);
  c.fillStyle = "#7dff6a";
  c.font = '700 18px "Courier New", monospace';
  for (let i = 0; i < 8; i++)
    c.fillText(
      `${["ALT", "H-DOT", "FUEL", "PGNS", "AGS", "TGO", "VEL", "RNG"][i]}  ${(1234 + i * 731) % 9999}`,
      14,
      26 + i * 21,
    );
});
const goTex = canvasTex(256, 192, (c) => {
  c.fillStyle = "#0c3a12";
  c.fillRect(0, 0, 256, 192);
  c.fillStyle = "#b8ff9a";
  c.font = '800 110px "Montserrat", sans-serif';
  c.textAlign = "center";
  c.fillText("GO", 128, 140);
});
const consoleScreens = [];
{
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    real.plastic(0x2b2f36, { roughness: 0.8 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  mcc.add(floor);
  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 14),
    real.plastic(0x1c2027, { roughness: 0.9 }),
  );
  wall.position.set(0, 7, -13);
  mcc.add(wall);
  const big = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 6),
    screenMat(
      canvasTex(1024, 440, (c) => {
        c.fillStyle = "#04070c";
        c.fillRect(0, 0, 1024, 440);
        c.strokeStyle = "#e9eef5";
        c.lineWidth = 4;
        c.beginPath();
        c.arc(512, 520, 360, Math.PI * 1.15, Math.PI * 1.85);
        c.stroke();
        c.strokeStyle = "#ffd23f";
        c.setLineDash([14, 10]);
        c.beginPath();
        c.moveTo(150, 120);
        c.quadraticCurveTo(450, 70, 640, 190);
        c.stroke();
        c.setLineDash([]);
        c.fillStyle = "#ffd23f";
        c.font = '800 36px "Montserrat", sans-serif';
        c.fillText("EAGLE", 660, 200);
        c.fillStyle = "#e9eef5";
        c.font = '700 26px "Courier New", monospace';
        c.fillText("LUNAR DESCENT · PDI + 05:12", 40, 410);
      }),
      0.7,
    ),
  );
  big.position.set(0, 6, -12.9);
  mcc.add(big);
  const conMat = real.plastic(0x8f99a5, { roughness: 0.5 });
  const deskMat = real.plastic(0x4d5560, { roughness: 0.55 });
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 5; i++) {
      const g = new THREE.Group();
      const body = new THREE.Mesh(roundedBox(1.8, 1.05, 0.9, 0.05), conMat);
      body.position.y = 0.52;
      g.add(body);
      const desk = new THREE.Mesh(roundedBox(1.9, 0.05, 0.45, 0.02), deskMat);
      desk.position.set(0, 0.8, 0.6);
      g.add(desk);
      const hood = new THREE.Mesh(roundedBox(1.8, 0.7, 0.6, 0.05), conMat);
      hood.position.set(0, 1.35, -0.12);
      hood.rotation.x = -0.25;
      g.add(hood);
      for (const sx of [-0.45, 0.45]) {
        const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.46), screenMat(greenTex));
        scr.position.set(sx, 1.38, 0.2);
        scr.rotation.x = -0.25;
        g.add(scr);
        consoleScreens.push(scr);
      }
      g.position.set((i - 2) * 2.05, row * 0.35, -4 + row * 3.4);
      g.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
      mcc.add(g);
      if (row > 0) {
        const tier = new THREE.Mesh(
          new THREE.BoxGeometry(2.05, row * 0.35, 3.4),
          real.plastic(0x2b2f36),
        );
        tier.position.set((i - 2) * 2.05, (row * 0.35) / 2, -4 + row * 3.4);
        mcc.add(tier);
      }
    }
  }
  for (const [x, z] of [
    [-6, -4],
    [0, -2],
    [6, 2],
    [-3, 6],
  ]) {
    const lamp = new THREE.PointLight(0xffe2b8, 18, 16, 1.6);
    lamp.position.set(x, 6, z);
    mcc.add(lamp);
  }
}
// Steve Bales: a faceless seated figure with a headset, back to the camera, row 2 middle
const bales = new THREE.Group();
{
  const shirt = real.fabric(0xf1f2f4);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.42, 8, 20), shirt);
  torso.position.y = 1.05;
  bales.add(torso);
  const tie = new THREE.Mesh(roundedBox(0.06, 0.32, 0.02, 0.01), real.fabric(0x26324a));
  tie.position.set(0, 1.08, 0.21);
  bales.add(tie);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 32, 24), real.skin(0xe2b08f));
  head.position.y = 1.58;
  bales.add(head);
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.155, 32, 16, 0, Math.PI * 2, 0, 1.4),
    real.fabric(0x3a2a1e),
  );
  hair.position.y = 1.6;
  hair.rotation.x = 0.3;
  bales.add(hair);
  const band = new THREE.Mesh(
    new THREE.TorusGeometry(0.16, 0.012, 8, 32, Math.PI),
    real.plastic(0x222428),
  );
  band.position.y = 1.6;
  band.rotation.y = Math.PI / 2;
  bales.add(band);
  const mic = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.18, 8),
    real.plastic(0x222428),
  );
  mic.position.set(0.1, 1.52, 0.1);
  mic.rotation.z = 1.2;
  bales.add(mic);
  const chair = new THREE.Mesh(roundedBox(0.5, 0.08, 0.5, 0.03), real.fabric(0x30343c));
  chair.position.y = 0.55;
  bales.add(chair);
  const back = new THREE.Mesh(roundedBox(0.5, 0.6, 0.06, 0.03), real.fabric(0x30343c));
  back.position.set(0, 0.95, -0.28);
  bales.add(back);
  bales.traverse((o) => o.isMesh && (o.castShadow = true));
  bales.position.set(0, 0.35, -4 + 3.4 + 1.25);
  bales.rotation.y = Math.PI;
  mcc.add(bales);
}
// Garman's cheat sheet on the desk in front of the camera row
const sheet = new THREE.Mesh(
  new THREE.PlaneGeometry(0.42, 0.56),
  new THREE.MeshStandardMaterial({
    roughness: 0.9,
    map: canvasTex(420, 560, (c) => {
      c.fillStyle = "#f4efe2";
      c.fillRect(0, 0, 420, 560);
      c.strokeStyle = "#b9c6dd";
      for (let y = 60; y < 560; y += 34) {
        c.beginPath();
        c.moveTo(20, y);
        c.lineTo(400, y);
        c.stroke();
      }
      c.fillStyle = "#1f2a6a";
      c.font = 'italic 700 34px "Comic Sans MS", "Segoe Print", cursive';
      [
        "ALARMS",
        "1201  —  GO",
        "1202  —  GO",
        "  (if not",
        "   repeating)",
        "1203  —  ABORT",
      ].forEach((l, i) => c.fillText(l, 36, 52 + i * 68));
      c.strokeStyle = "#d8322c";
      c.lineWidth = 5;
      c.beginPath();
      c.ellipse(170, 188, 150, 36, 0, 0, Math.PI * 2);
      c.stroke();
    }),
  }),
);
sheet.rotation.set(-Math.PI / 2 + 0.06, 0, 0.12);
sheet.position.set(0.5, 0.7 + 0.83, -4 + 3.4 * 2 + 0.6);
mcc.add(sheet);

// ---------------------------------------------------------------- the radar switch panel
const SWP = V(...SW);
const swp = new THREE.Group();
swp.position.copy(SWP);
scene.add(swp);
const lever = new THREE.Group();
{
  const plate = new THREE.Mesh(
    roundedBox(0.8, 0.02, 0.5, 0.01),
    real.metal(0x5a5f66, { roughness: 0.6 }),
  );
  swp.add(plate);
  const lbl = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.08),
    new THREE.MeshStandardMaterial({
      map: canvasTex(400, 64, (c) => {
        c.fillStyle = "#5a5f66";
        c.fillRect(0, 0, 400, 64);
        c.fillStyle = "#f2f2ee";
        c.font = '800 34px "Montserrat", sans-serif';
        c.fillText("RNDZ RADAR", 70, 44);
      }),
    }),
  );
  lbl.rotation.x = -Math.PI / 2;
  lbl.position.set(0, 0.012, 0.17);
  swp.add(lbl);
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.03, 24),
    real.metal(0xd0d3d6, { roughness: 0.3 }),
  );
  base.position.set(0, 0.025, 0);
  swp.add(base);
  const stick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.012, 0.14, 16),
    real.metal(0xe0e3e6, { roughness: 0.2 }),
  );
  stick.position.y = 0.07;
  lever.add(stick);
  const tip = new THREE.Mesh(
    new THREE.SphereGeometry(0.016, 16, 12),
    real.metal(0xe0e3e6, { roughness: 0.2 }),
  );
  tip.position.y = 0.14;
  lever.add(tip);
  lever.position.set(0, 0.03, 0);
  swp.add(lever);
  const spot = new THREE.SpotLight(0xfff0dc, 14, 4, 0.7, 0.5, 1.2);
  spot.position.set(0.4, 1.2, 0.8);
  spot.target = swp;
  swp.add(spot);
  swp.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
}

// ---------------------------------------------------------------- the kitchen: a pot boiling over, questions popping
const KP = V(...KIT);
const kit = new THREE.Group();
kit.position.copy(KP);
scene.add(kit);
const bubbles = [];
{
  const top = new THREE.Mesh(roundedBox(3, 0.9, 1.6, 0.05), real.plastic(0xe9e6df));
  top.position.y = 0.45;
  kit.add(top);
  const hob = new THREE.Mesh(roundedBox(1.2, 0.02, 1.0, 0.02), real.gloss(0x111214));
  hob.position.y = 0.91;
  kit.add(hob);
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.3, 0.36, 48),
    real.metal(0xc9cdd2, { roughness: 0.2 }),
  );
  pot.position.set(0, 1.1, 0);
  kit.add(pot);
  const lid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.33, 0.33, 0.03, 48),
    real.metal(0xc9cdd2, { roughness: 0.2 }),
  );
  lid.position.set(0, 1.3, 0);
  lid.name = "lid";
  kit.add(lid);
  const back = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 4),
    real.ceramic ? real.ceramic(0xd9e2e6) : real.plastic(0xd9e2e6),
  );
  back.position.set(0, 2, -0.85);
  kit.add(back);
  const qTex = canvasTex(256, 256, (c) => {
    c.fillStyle = "#ffffff";
    c.beginPath();
    c.arc(128, 116, 104, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.moveTo(80, 200);
    c.lineTo(60, 250);
    c.lineTo(130, 214);
    c.fill();
    c.fillStyle = "#d8322c";
    c.font = '900 150px "Montserrat", sans-serif';
    c.textAlign = "center";
    c.fillText("?", 128, 168);
  });
  for (let i = 0; i < 7; i++) {
    const b = new THREE.Sprite(new THREE.SpriteMaterial({ map: qTex, transparent: true }));
    const a = -1.2 + i * 0.4;
    b.position.set(Math.sin(a) * 1.3, 1.7 + (i % 3) * 0.35, Math.cos(a) * 0.3 + 0.2);
    b.scale.setScalar(0.42);
    kit.add(b);
    bubbles.push(b);
  }
  const lamp = new THREE.PointLight(0xfff0dc, 16, 8, 1.5);
  lamp.position.set(1, 3, 2);
  kit.add(lamp);
  kit.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
}

const applyCamera = shotCamera(shots, 1);

function renderAt(t) {
  // ---- the Eagle
  const p = lmAt(t);
  LMW.copy(p);
  lm.group.position.copy(p);
  lm.group.rotation.set(0.12 + Math.sin(t * 0.7) * 0.02, -0.7, Math.sin(t * 0.5) * 0.02);
  lm.descentFlame.userData.set(1, t);
  const alarmOn = (t >= T.warnton && t < T.armstrong + 3) || (t >= T.alarm2 && t < T.alarm2 + 2.5);
  lm.setAlarm(alarmOn ? (t % 0.36 < 0.22 ? 1 : 0.15) : 0);
  const h = p.y - moonHeight(p.x, p.z);
  dust.set(smooth(ramp(-h, -24, -10)), t, p.x, moonHeight(p.x, p.z), p.z);

  // ---- DSKY: 1202 → restart (dark) → back, landing only
  const dark = t >= T.startet + 0.4 && t < T.startet + 1.0;
  dsky.show(
    dark
      ? { prog: "", verb: "", noun: "", r1: "", r2: "", r3: "" }
      : t >= T.startet
        ? { prog: "63", verb: "06", noun: "63", r1: "+01650", r2: "−00027", r3: "+05432" }
        : {
            alarm: true,
            blink: Math.floor(t * 3) % 2 === 0,
            prog: "63",
            r1: "+01202",
            r2: "+00000",
            r3: "−00042",
          },
  );

  // ---- Mission Control screens: data → GO
  const go = t >= T.go && t < T.heisst;
  for (const s of consoleScreens) s.material.map = s.material.emissiveMap = go ? goTex : greenTex;

  // ---- the radar switch: flicked to the wrong position
  lever.rotation.z = lerp(-0.5, 0.5, smooth(ramp(t, T.radar + 0.1, T.radar + 0.4)));

  // ---- kitchen: questions pop one after another, the lid rattles
  bubbles.forEach((b, i) => {
    const at = T.stell + 0.8 + i * 0.45;
    b.visible = t >= at && t < T.jetzt;
    const s = squash(t, at).x;
    b.scale.setScalar(0.42 * s);
  });
  const lid = kit.getObjectByName("lid");
  lid.position.y = 1.3 + (t > T.stell && t < T.jetzt ? Math.abs(Math.sin(t * 20)) * 0.03 : 0);

  // ---- displays
  stopwatch("clock", pop(t, T.abbrechen - 0.3, T.was2 - 0.1), {
    seconds: t - T.abbrechen + 2,
    max: 30,
    label: "Entscheidung",
    x: 1440,
    y: 190,
  });
  if (t >= T.wirft && t < T.junger)
    showPanel(pop(t, T.wirft, T.junger), "NUR NOCH", "LANDUNG", LED.green);
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
