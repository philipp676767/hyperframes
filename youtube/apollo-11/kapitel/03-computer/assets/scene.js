// Chapter 3 "Ein Hirn aus Draht" on a dark stage. The rig (computer box,
// DSKY, phone, core rope, priority stack) is modelled in metres and scaled x4.
import {
  THREE,
  V,
  scene,
  ramp,
  smooth,
  pop,
  squash,
  lerp,
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
import { makeDSKY, makePhone, makeMoonGlobe, MAT } from "./welt.js";
import { createHand } from "./hand.js";
import { readout } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);
const S = 4;
const rig = new THREE.Group();
rig.scale.setScalar(S);
scene.add(rig);

// ---------------------------------------------------------------- the computer box (AGC): 61 x 32 x 17 cm
const agc = new THREE.Group();
{
  const box = new THREE.Mesh(roundedBox(0.61, 0.17, 0.32, 0.015), MAT.gold);
  box.position.y = 0.085;
  agc.add(box);
  for (let i = 0; i < 6; i++) {
    const rib = new THREE.Mesh(roundedBox(0.012, 0.172, 0.322, 0.004), MAT.goldDark);
    rib.position.set(-0.26 + i * 0.104, 0.085, 0);
    agc.add(rib);
  }
  for (let i = 0; i < 4; i++) {
    const con = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 0.03, 24),
      real.metal(0x9ea3a8),
    );
    con.rotation.x = Math.PI / 2;
    con.position.set(-0.2 + i * 0.13, 0.09, 0.172);
    agc.add(con);
  }
  agc.position.set(-0.55, 0, 0);
  agc.rotation.y = 0.25;
  agc.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
}
rig.add(agc);

// ---------------------------------------------------------------- DSKY + phone
const dsky = makeDSKY();
dsky.group.position.set(0.15, 0.345, 0);
dsky.group.rotation.x = -0.12;
rig.add(dsky.group);
const phone = makePhone();
phone.position.set(0.64, 0.08, 0.14);
phone.rotation.set(-0.15, -0.3, 0);
rig.add(phone);

// ---------------------------------------------------------------- core rope: 8 iron rings, a copper wire
const RING_Y = 0.12;
const rope = new THREE.Group();
rig.add(rope);
const ringsX = [-0.35, -0.25, -0.15, -0.05, 0.05, 0.15, 0.25, 0.35];
const bits = [1, 0, 1, 1, 0, 1, 0, 1];
const ferrite = real.metal(0x3a3b3f, { roughness: 0.55 });
for (const x of ringsX) {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.012, 20, 48), ferrite);
  ring.position.set(x, RING_Y, 0.6);
  ring.rotation.y = Math.PI / 2;
  ring.castShadow = true;
  rope.add(ring);
}
// the wire: through the ring (1) or dipping under it (0)
const wp = [V(-0.48, RING_Y, 0.6)];
ringsX.forEach((x, i) => {
  wp.push(V(x - 0.04, bits[i] ? RING_Y : RING_Y - 0.065, 0.6));
  wp.push(V(x + 0.04, bits[i] ? RING_Y : RING_Y - 0.065, 0.6));
});
wp.push(V(0.48, RING_Y, 0.6));
const wireCurve = new THREE.CatmullRomCurve3(wp, false, "catmullrom", 0.3);
const WSEG = 300;
const wireGeo = new THREE.TubeGeometry(wireCurve, WSEG, 0.004, 8, false);
const wire = new THREE.Mesh(wireGeo, real.metal(0xd2814a, { roughness: 0.25 }));
rope.add(wire);
const glowMat = new THREE.MeshBasicMaterial({ color: 0x3dff7a, transparent: true, opacity: 0.9 });
const bitGlow = ringsX.map((x) => {
  const g = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.004, 8, 48), glowMat);
  g.position.set(x, RING_Y, 0.6);
  g.rotation.y = Math.PI / 2;
  g.visible = false;
  rig.add(g);
  return g;
});
const hand = createHand({ scale: 0.2, sleeve: 0x6a5a8a });
// the needle
const needle = new THREE.Mesh(
  new THREE.CylinderGeometry(0.0015, 0.0015, 0.08, 8),
  real.metal(0xe0e3e6, { roughness: 0.2 }),
);
needle.rotation.z = Math.PI / 2;
rig.add(needle);

// ---------------------------------------------------------------- the priority list: a stack of tasks
const mkTex = (text, color) => {
  const cv = document.createElement("canvas");
  cv.width = 512;
  cv.height = 128;
  const c = cv.getContext("2d");
  c.fillStyle = color;
  c.fillRect(0, 0, 512, 128);
  c.fillStyle = "#ffffff";
  c.font = '800 64px "Montserrat", sans-serif';
  c.textAlign = "center";
  c.fillText(text, 256, 88);
  const tx = new THREE.CanvasTexture(cv);
  tx.colorSpace = THREE.SRGBColorSpace;
  return tx;
};
const TASKS = [
  ["LANDUNG", "#1f9d55"],
  ["STEUERN", "#2f7fd8"],
  ["HÖHE", "#2f7fd8"],
  ["ANZEIGE", "#7a7f8a"],
  ["RADAR", "#c4322c"],
  ["RADAR", "#c4322c"],
  ["RADAR", "#c4322c"],
];
const STACK = V(0.9, 0, 0.6);
const blocks = TASKS.map(([txt, col]) => {
  const m = new THREE.Mesh(
    roundedBox(0.32, 0.065, 0.12, 0.012),
    [0, 1, 2, 3, 4, 5].map((f) =>
      f === 4
        ? new THREE.MeshStandardMaterial({ map: mkTex(txt, col), roughness: 0.5 })
        : real.plastic(new THREE.Color(col).getHex()),
    ),
  );
  m.castShadow = true;
  rig.add(m);
  return m;
});

// the Moon rising behind the stage at the end
const moon = makeMoonGlobe(3);
scene.add(moon);

const applyCamera = shotCamera(shots, 1);

function renderAt(t) {
  // DSKY numbers: idle → keys typed → "4 KB" mood
  dsky.show({
    verb: t > T.befehle + 1.2 ? "37" : "16",
    noun: t > T.befehle + 0.8 ? "63" : "68",
    prog: "11",
    r1: "+00004",
    r2: "+12345",
    r3: "+00000",
  });
  phone.visible = t >= T.handy - 0.2 && t < T.rate;
  phone.scale.copy(squash(t, T.handy - 0.2));

  // core rope: the wire grows (woven) from "gewebt", bits glow on Eins / Null
  rope.visible = t >= T.rate - 0.2;
  const wk = smooth(ramp(t, T.gewebt - 0.3, T.fehler));
  wireGeo.setDrawRange(0, Math.ceil(wk * WSEG) * 8 * 6);
  const head = wireCurve.getPoint(Math.max(0.001, wk));
  bitGlow.forEach(
    (g, i) => (g.visible = bits[i] === 1 && t >= T.eins - 0.1 && t < T.null && i === 0),
  );
  // the weaving hand with the needle follows the wire's head
  const hp = head.clone().multiplyScalar(S);
  needle.position.copy(head).add(V(0.03, 0, 0));
  needle.visible = t >= T.monate - 0.3 && t < T.software;
  hand.track(t, [
    {
      t: T.monate - 0.6,
      pos: [hp.x + 0.9, hp.y + 0.3, hp.z + 0.5],
      rot: [0.2, -1.6, 0],
      pose: "open",
    },
    { t: T.monate, pos: [hp.x + 0.35, hp.y + 0.06, hp.z + 0.1], rot: [0.2, -1.6, 0], pose: "grab" },
    {
      t: T.fehler,
      pos: [hp.x + 0.35, hp.y + 0.06, hp.z + 0.1],
      rot: [0.2, -1.6, 0.1],
      pose: "grab",
    },
    {
      t: T.software - 0.1,
      pos: [hp.x + 1.0, hp.y + 0.4, hp.z + 0.6],
      rot: [0.2, -1.6, 0],
      pose: "open",
      out: true,
    },
  ]);

  // priority stack: 4 tasks; on "Wird es zu viel" 3 RADAR jobs pile on; on "wirft" the low ones fly off
  blocks.forEach((b, i) => {
    const extra = i >= 4;
    const appear = extra ? T.viel + (i - 4) * 0.25 : T.software + 0.4 + (3 - i) * 0.35;
    b.visible = t >= appear;
    const drop = smooth(ramp(t, appear, appear + 0.35));
    // base stack: ANZEIGE at the bottom, LANDUNG on top; the RADAR jobs pile on top of it all
    const y = 0.035 + (extra ? i : 3 - i) * 0.07;
    const wob = t > T.viel && t < T.wirft ? Math.sin(t * 22 + i) * 0.006 : 0;
    const out = extra || i === 3;
    const k = extra ? i - 4 : 3;
    const thrown = out ? smooth(ramp(t, T.wirft + 0.15 + k * 0.12, T.wirft + 0.9 + k * 0.12)) : 0;
    const settle = i < 3 ? smooth(ramp(t, T.wirft + 0.7, T.wirft + 1.2)) * 0.07 : 0;
    b.position.set(
      STACK.x + wob + thrown * (0.5 + k * 0.15),
      lerp(y + 0.4, y, drop) + thrown * 0.35 - settle,
      STACK.z - thrown * 0.9,
    );
    b.rotation.z = thrown * (2 + k) + wob * 4;
    b.scale.setScalar(Math.max(0.001, 1 - thrown));
    b.visible = b.visible && thrown < 0.99;
  });

  moon.position.set(-6, lerp(-6, 5, smooth(ramp(t, T.doch, T.doch + 3.2))), -16);
  moon.visible = t >= T.doch;
  moon.rotation.y = t * 0.06;

  // displays
  readout("kb", pop(t, T.kb - 0.1, T.bildschirm - 0.2), {
    label: "Arbeitsspeicher",
    value: 4,
    unit: "KB",
    x: 110,
    y: 190,
  });
  readout("weight", pop(t, T.koffer + 0.4, T.speicher - 0.1), {
    label: "Gewicht",
    value: 32,
    unit: "kg",
    x: 110,
    y: 190,
  });
  if (t >= T.handy + 0.9 && t < T.rate)
    showPanel(pop(t, T.handy + 0.9, T.rate), "DEIN HANDY", "×1.000.000", LED.green);
  else if (t >= T.wichtig - 0.4 && t < T.viel)
    showPanel(pop(t, T.wichtig - 0.4, T.viel), "ZUERST", "LANDUNG", LED.green);
  else showPanel(0);

  labels(
    t,
    LABELS.map((l) => ({ ...l, pos: [l.pos[0], l.pos[1], l.pos[2]] })),
  );
  applyCamera(t);
  renderFrame();
}

start(renderAt);
