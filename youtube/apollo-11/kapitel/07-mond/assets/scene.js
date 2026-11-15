// Chapter 7 "Der Filzstift": the Eagle on the Moon; Armstrong climbs down,
// the first step, hopping in one-sixth gravity, a living room in 1969 at
// 4 a.m., the dust macro, a footprint, the laser mirror, the flag with its
// top rod; inside the cabin a broken circuit breaker, the prepared speech,
// Aldrin's felt-tip pen.
import {
  THREE,
  V,
  scene,
  ramp,
  smooth,
  pop,
  lerp,
  rng,
  real,
  roundedBox,
  facet,
  jitter,
  labels,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import "./set.js";
import { makeLM, makeAstronaut, makePen } from "./welt.js";
import { createHand } from "./hand.js";
import { readout } from "./hud.js";
import { T, LIV, DUST, CAB, DESK, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);
const tex = (w, h, draw) => {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  draw(cv.getContext("2d"));
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

// ---------------------------------------------------------------- the Eagle + two astronauts
const lm = makeLM();
lm.group.rotation.y = 0.2;
scene.add(lm.group);
const a1 = makeAstronaut();
const a2 = makeAstronaut();
scene.add(a1.group, a2.group);
// footprints
const printTex = tex(256, 512, (c) => {
  c.fillStyle = "rgba(0,0,0,0)";
  c.clearRect(0, 0, 256, 512);
  c.fillStyle = "rgba(40,38,35,0.85)";
  c.beginPath();
  c.ellipse(128, 150, 92, 130, 0, 0, Math.PI * 2);
  c.ellipse(128, 390, 78, 110, 0, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "rgba(150,145,138,0.9)";
  c.lineWidth = 12;
  for (let y = 40; y < 500; y += 34) {
    c.beginPath();
    c.moveTo(50, y);
    c.lineTo(206, y);
    c.stroke();
  }
});
const printMat = new THREE.MeshStandardMaterial({
  map: printTex,
  transparent: true,
  roughness: 1,
  depthWrite: false,
});
const mkPrint = (x, z, r, s = 0.32) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(s * 0.5, s), printMat);
  m.rotation.set(-Math.PI / 2, 0, r);
  m.position.set(x, 0.015, z);
  scene.add(m);
  return m;
};
const firstPrint = mkPrint(0.55, 4.7, 0.1);
const bigPrint = mkPrint(2.4, 7.6, 0.3, 0.34);
const trail = [];
for (let i = 0; i < 16; i++)
  trail.push(mkPrint(0.6 + i * 0.12 + (i % 2) * 0.12, 5 + i * 0.22, 0.2));

// ---------------------------------------------------------------- laser mirror (retroreflector) + flag
const mirror = new THREE.Group();
{
  const plate = new THREE.Mesh(
    roundedBox(0.6, 0.06, 0.46, 0.02),
    real.metal(0xc9cdd2, { roughness: 0.4 }),
  );
  mirror.add(plate);
  for (let i = 0; i < 10; i++)
    for (let j = 0; j < 10; j++) {
      const c = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 0.01, 20),
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
  mirror.traverse((o) => o.isMesh && (o.castShadow = true));
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
  const rod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 1.5, 10),
    real.metal(0xd0d3d8),
  );
  rod.rotation.z = Math.PI / 2;
  rod.position.set(0.75, 2.35, 0);
  rod.name = "rod";
  flag.add(rod);
  const cloth = new THREE.PlaneGeometry(1.5, 0.95, 16, 8);
  const cp = cloth.attributes.position;
  for (let i = 0; i < cp.count; i++) cp.setZ(i, Math.sin(cp.getX(i) * 7) * 0.035);
  cloth.computeVertexNormals();
  const flagTex = tex(600, 380, (c) => {
    for (let i = 0; i < 13; i++) {
      c.fillStyle = i % 2 ? "#f4f2ea" : "#b8292f";
      c.fillRect(0, (i * 380) / 13, 600, 380 / 13 + 1);
    }
    c.fillStyle = "#2a3a7a";
    c.fillRect(0, 0, 250, 205);
    c.fillStyle = "#f4f2ea";
    for (let y = 0; y < 9; y++)
      for (let x = 0; x < (y % 2 ? 5 : 6); x++) {
        c.beginPath();
        c.arc(20 + x * 42 + (y % 2) * 21, 16 + y * 21.5, 5.5, 0, Math.PI * 2);
        c.fill();
      }
  });
  const fl = new THREE.Mesh(cloth, real.fabric(0xffffff, { map: flagTex, side: THREE.DoubleSide }));
  fl.position.set(0.75, 1.88, 0);
  fl.name = "cloth";
  flag.add(fl);
  flag.position.set(-6, 0, -1.5);
  flag.rotation.y = 0.5;
  flag.traverse((o) => o.isMesh && (o.castShadow = true));
  scene.add(flag);
}

// ---------------------------------------------------------------- living room, 1969, 3:56 a.m.
const LV = V(...LIV);
const liv = new THREE.Group();
liv.position.copy(LV);
scene.add(liv);
{
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 8),
    real.wood ? real.wood(0x6b4a2e) : real.plastic(0x6b4a2e),
  );
  floor.rotation.x = -Math.PI / 2;
  liv.add(floor);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(8, 4), real.fabric(0x9a8a62));
  wall.position.set(0, 2, -1.2);
  liv.add(wall);
  const cab = new THREE.Mesh(
    roundedBox(1.1, 0.75, 0.6, 0.04),
    real.wood ? real.wood(0x5a3a20) : real.plastic(0x5a3a20),
  );
  cab.position.set(0, 0.62, -0.5);
  liv.add(cab);
  for (const x of [-0.45, 0.45]) {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.015, 0.25, 8),
      real.metal(0x2a2a2a),
    );
    leg.position.set(x, 0.12, -0.5);
    liv.add(leg);
  }
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.62, 0.48),
    new THREE.MeshStandardMaterial({
      emissive: 0xffffff,
      emissiveIntensity: 1.0,
      roughness: 0.2,
      emissiveMap: tex(320, 240, (c) => {
        const r = rng(4);
        c.fillStyle = "#3a3a3a";
        c.fillRect(0, 0, 320, 240);
        c.fillStyle = "#0e0e0e";
        c.fillRect(0, 0, 320, 120);
        c.fillStyle = "#9a9a9a";
        c.fillRect(0, 150, 320, 90);
        c.fillStyle = "#d8d8d8";
        c.fillRect(150, 70, 30, 60);
        c.fillRect(140, 128, 50, 6);
        c.fillRect(165, 40, 14, 30);
        for (let i = 0; i < 2600; i++) {
          c.fillStyle = `rgba(255,255,255,${r() * 0.18})`;
          c.fillRect(r() * 320, r() * 240, 2, 1);
        }
      }),
    }),
  );
  screen.position.set(-0.12, 0.66, -0.195);
  liv.add(screen);
  const knob = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 0.03, 20),
    real.plastic(0xd8c8a0),
  );
  knob.rotation.x = Math.PI / 2;
  knob.position.set(0.38, 0.75, -0.19);
  liv.add(knob);
  const glowL = new THREE.PointLight(0xbcd2ff, 6, 4, 1.5);
  glowL.position.set(0, 0.7, 0.6);
  liv.add(glowL);
  // the clock: 3:56
  const clock = new THREE.Mesh(
    new THREE.CircleGeometry(0.22, 48),
    new THREE.MeshStandardMaterial({
      roughness: 0.4,
      map: tex(256, 256, (c) => {
        c.fillStyle = "#f2ead6";
        c.beginPath();
        c.arc(128, 128, 126, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = "#222";
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          c.fillRect(126 + Math.sin(a) * 105, 126 - Math.cos(a) * 105, 5, 5);
        }
        c.strokeStyle = "#111";
        c.lineCap = "round";
        const hand = (a, l, w) => {
          c.lineWidth = w;
          c.beginPath();
          c.moveTo(128, 128);
          c.lineTo(128 + Math.sin(a) * l, 128 - Math.cos(a) * l);
          c.stroke();
        };
        hand(((3 + 56 / 60) / 12) * Math.PI * 2, 60, 10);
        hand((56 / 60) * Math.PI * 2, 92, 6);
      }),
    }),
  );
  clock.position.set(1.0, 1.75, -1.18);
  liv.add(clock);
  const lamp = new THREE.PointLight(0xffb070, 2.5, 5, 1.6);
  lamp.position.set(1.5, 1.2, 0.5);
  liv.add(lamp);
  liv.traverse((o) => o.isMesh && (o.receiveShadow = true));
}

// ---------------------------------------------------------------- dust macro: sharp grains
const DU = V(...DUST);
const dustG = new THREE.Group();
dustG.position.copy(DU);
scene.add(dustG);
{
  const base = new THREE.Mesh(
    new THREE.CircleGeometry(1.2, 48),
    real.plastic(0x5e5a55, { roughness: 1 }),
  );
  base.rotation.x = -Math.PI / 2;
  dustG.add(base);
  const r = rng(77);
  const grainGeo = facet(jitter(new THREE.TetrahedronGeometry(1, 0), 0.25, 2), 0.1, 2);
  const grainMat = real.glass
    ? real.glass(0x8f8a84, { roughness: 0.25 })
    : real.plastic(0x8f8a84, { roughness: 0.2 });
  for (let i = 0; i < 60; i++) {
    const g = new THREE.Mesh(grainGeo, grainMat);
    const s = 0.004 + r() ** 2 * 0.02;
    g.scale.set(s, s * (1 + r()), s);
    g.position.set((r() - 0.5) * 0.35, s * 0.6, (r() - 0.5) * 0.3);
    g.rotation.set(r() * 3, r() * 3, r() * 3);
    g.castShadow = true;
    dustG.add(g);
  }
  const spot = new THREE.SpotLight(0xfff0dc, 10, 3, 0.6, 0.4, 1.2);
  spot.position.set(0.6, 0.9, 0.5);
  spot.target = dustG;
  dustG.add(spot);
}

// ---------------------------------------------------------------- cabin: circuit-breaker panel, one broken
const CB = V(...CAB);
const cabG = new THREE.Group();
cabG.position.copy(CB);
scene.add(cabG);
const brokenPiece = new THREE.Group();
{
  const panel = new THREE.Mesh(
    roundedBox(0.8, 0.02, 0.45, 0.01),
    real.plastic(0x3c4047, { roughness: 0.55 }),
  );
  cabG.add(panel);
  for (let i = 0; i < 9; i++)
    for (let j = 0; j < 5; j++) {
      if (i === 5 && j === 2) continue;
      const b = new THREE.Group();
      const collar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.014, 0.014, 0.008, 20),
        real.plastic(0xe8e6e0),
      );
      b.add(collar);
      const pin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.03, 16),
        real.plastic(0x16171a),
      );
      pin.position.y = 0.017;
      b.add(pin);
      b.position.set(-0.32 + i * 0.08, 0.012, -0.16 + j * 0.08);
      cabG.add(b);
    }
  // the hole
  const hole = new THREE.Mesh(
    new THREE.CircleGeometry(0.009, 20),
    new THREE.MeshBasicMaterial({ color: 0x050505 }),
  );
  hole.rotation.x = -Math.PI / 2;
  hole.position.set(-0.32 + 5 * 0.08, 0.0115, -0.16 + 2 * 0.08);
  cabG.add(hole);
  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.014, 0.008, 20),
    real.plastic(0xe8e6e0),
  );
  collar.position.set(-0.32 + 5 * 0.08, 0.012, -0.16 + 2 * 0.08);
  cabG.add(collar);
  const pin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.03, 16),
    real.plastic(0x16171a),
  );
  brokenPiece.add(pin);
  brokenPiece.position.set(0.22, 0.02, 0.32);
  brokenPiece.rotation.z = Math.PI / 2;
  cabG.add(brokenPiece);
  const lbl = new THREE.Mesh(
    new THREE.PlaneGeometry(0.14, 0.03),
    new THREE.MeshStandardMaterial({
      map: tex(280, 60, (c) => {
        c.fillStyle = "#3c4047";
        c.fillRect(0, 0, 280, 60);
        c.fillStyle = "#f2f2ee";
        c.font = '800 30px "Montserrat", sans-serif';
        c.fillText("ENG ARM", 60, 42);
      }),
    }),
  );
  lbl.rotation.x = -Math.PI / 2;
  lbl.position.set(-0.32 + 5 * 0.08, 0.0115, -0.16 + 2 * 0.08 + 0.035);
  cabG.add(lbl);
  const spot = new THREE.SpotLight(0xfff0dc, 8, 3, 0.7, 0.5, 1.2);
  spot.position.set(0.3, 0.9, 0.7);
  spot.target = cabG;
  cabG.add(spot);
  cabG.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
}
const pen = makePen();
cabG.add(pen);
const hand = createHand({ scale: 0.12, sleeve: 0xf2f0ea });
const HOLE = CB.clone().add(V(-0.32 + 5 * 0.08, 0.012, -0.16 + 2 * 0.08));

// ---------------------------------------------------------------- the speech on a desk in Washington
const DK = V(...DESK);
const desk = new THREE.Group();
desk.position.copy(DK);
scene.add(desk);
{
  const top = new THREE.Mesh(
    roundedBox(1.6, 0.05, 1.0, 0.02),
    real.wood ? real.wood(0x4a2e1a) : real.plastic(0x4a2e1a),
  );
  top.position.y = -0.03;
  desk.add(top);
  const paper = new THREE.Mesh(
    new THREE.PlaneGeometry(0.42, 0.56),
    new THREE.MeshStandardMaterial({
      roughness: 0.9,
      map: tex(420, 560, (c) => {
        c.fillStyle = "#f4f0e4";
        c.fillRect(0, 0, 420, 560);
        c.fillStyle = "#222";
        c.font = '700 22px "Courier New", monospace';
        c.fillText("IN EVENT OF", 130, 70);
        c.fillText("MOON DISASTER:", 115, 100);
        c.font = '400 15px "Courier New", monospace';
        for (let i = 0; i < 14; i++) c.fillRect(40, 150 + i * 26, 300 + ((i * 37) % 40), 3);
      }),
    }),
  );
  paper.rotation.set(-Math.PI / 2, 0, 0.15);
  paper.position.y = 0.001;
  desk.add(paper);
  const lamp = new THREE.SpotLight(0xffd8a8, 9, 3, 0.7, 0.5, 1.2);
  lamp.position.set(-0.4, 1.0, 0.4);
  lamp.target = desk;
  desk.add(lamp);
}

const applyCamera = shotCamera(shots, 1);

function hop(t, t0, period, h) {
  if (t < t0) return 0;
  return Math.abs(Math.sin(((t - t0) / period) * Math.PI)) * h;
}

function renderAt(t) {
  // Armstrong: porch → down the ladder → first step → hops
  const porch = V(0.5, 3.0, 2.6);
  const foot = V(0.62, 0.32, 3.9);
  const step = V(0.55, 0, 4.6);
  let p1;
  if (t < T.luke) p1 = porch.clone();
  else if (t < T.satz) p1 = porch.clone().lerp(foot, smooth(ramp(t, T.luke + 0.6, T.satz - 0.5)));
  else if (t < T.sechstel)
    p1 = foot.clone().lerp(step, smooth(ramp(t, T.schritt, T.schritt + 1.0)));
  else {
    const u = ramp(t, T.sechstel, T.staub);
    p1 = V(lerp(0.55, 1.2, u), hop(t, T.sechstel, 0.9, 0.5), lerp(4.6, 8.5, u));
  }
  a1.group.position.copy(p1);
  a1.group.rotation.y = t < T.satz ? Math.PI : 0.15;
  a1.group.visible = t >= T.luke - 0.2;
  const sw = Math.sin(t * 6) * 0.4 * (t > T.sechstel ? 1 : 0.2);
  a1.legL.rotation.x = sw;
  a1.legR.rotation.x = -sw;
  a1.armL.rotation.x = -sw * 0.6;
  a1.armR.rotation.x = sw * 0.6;
  // Aldrin joins for the hopping
  a2.group.visible = t >= T.huepfen - 0.5 && t < T.klettern;
  const u2 = ramp(t, T.huepfen - 0.5, T.klettern);
  a2.group.position.set(
    lerp(-1, -3.5, u2),
    hop(t, T.huepfen - 0.5, 0.85, 0.55),
    lerp(5.5, 7.5, u2),
  );
  a2.group.rotation.y = -0.6;
  a1.group.visible = a1.group.visible && t < T.klettern + 0.5;
  // footprints
  firstPrint.visible = t >= T.schritt + 0.9;
  trail.forEach((m, i) => (m.visible = t >= T.sechstel + i * 0.45));
  bigPrint.visible = t >= T.fuss - 0.4;
  mirror.visible = t >= T.spiegel - 0.4;
  flag.visible = t >= T.huepfen;
  // the flag: the top rod gets a nudge, the cloth swings without wind and stops
  flag.getObjectByName("cloth").rotation.y =
    Math.sin((t - T.flagge) * 3) *
    0.08 *
    Math.max(0, 1 - (t - T.flagge) * 0.3) *
    (t > T.flagge ? 1 : 0);

  // the broken breaker piece rolls on the floor; the pen goes in on "steckt", is pressed on "drückt"
  brokenPiece.rotation.x = t * 0.2;
  const ins = smooth(ramp(t, T.steckt, T.steckt + 0.8));
  const press = smooth(ramp(t, T.drueckt, T.drueckt + 0.3));
  pen.visible = t >= T.aldrin3 - 0.2;
  pen.position.set(
    HOLE.x - CB.x + lerp(0.09, 0, ins),
    lerp(0.16, 0.08, ins) - press * 0.012,
    HOLE.z - CB.z + lerp(0.05, 0, ins),
  );
  pen.rotation.set(0, 0, lerp(-0.9, 0, ins));
  const pp = pen.position.clone().add(CB);
  hand.track(t, [
    {
      t: T.aldrin3 - 0.6,
      pos: [pp.x + 0.2, pp.y + 0.12, pp.z + 0.12],
      rot: [0.2, -1.4, 0],
      pose: "open",
    },
    {
      t: T.aldrin3,
      pos: [pp.x + 0.03, pp.y + 0.06, pp.z + 0.02],
      rot: [0.4, -1.4, 0],
      pose: "grab",
    },
    {
      t: T.drueckt + 0.4,
      pos: [HOLE.x + 0.03, HOLE.y + 0.11 - press * 0.012, HOLE.z + 0.02],
      rot: [0.4, -1.4, 0],
      pose: "grab",
    },
  ]);

  // displays
  readout("tv", pop(t, T.mio - 0.1, T.satz - 0.2), {
    label: "Zuschauer",
    value: "600",
    unit: "Mio.",
    x: 110,
    y: 190,
  });
  readout("kg", pop(t, T.anzug + 0.3, T.huepfen), {
    label: t < T.ranzen ? "Anzug auf der Erde" : "Anzug auf dem Mond",
    value: t < T.ranzen ? 90 : 15,
    unit: "kg",
    x: 110,
    y: 190,
  });

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
