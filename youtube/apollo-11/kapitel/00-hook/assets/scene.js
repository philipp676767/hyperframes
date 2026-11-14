// Hook: the Eagle 25 m above the Sea of Tranquility, sinking toward the
// boulder field with the 1202 alarm glowing red; the DSKY with 1202
// blinking; the viewer's phone next to it; the felt-tip pen.
import {
  V,
  scene,
  ramp,
  smooth,
  pop,
  squash,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import "./set.js";
import { makeLM, makeDSKY, makePhone, makePen, makeDust, moonHeight, DSKY_POS } from "./welt.js";
import { meter } from "./hud.js";
import { T, shots, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);

const lm = makeLM();
scene.add(lm.group);
const dust = makeDust(180);
const dsky = makeDSKY();
dsky.group.position.copy(DSKY_POS);
scene.add(dsky.group);
const phone = makePhone();
phone.position.set(0.48, 399.97, 0.15);
phone.rotation.set(0, -0.35, 0.08);
scene.add(phone);
const pen = makePen();
pen.position.set(0, 400, 0.12);
scene.add(pen);

// the Eagle's flight: drifting forward-right and sinking (pure in t)
function lmAt(t) {
  const x = 6 + t * 0.14;
  const z = -18 - t * 0.12;
  const y = moonHeight(x, z) + 24 - t * 0.62;
  return V(x, y, z);
}

const applyCamera = shotCamera(shots, 1);

function renderAt(t) {
  const p = lmAt(t);
  lm.group.position.copy(p);
  lm.group.rotation.set(0.06 + Math.sin(t * 0.9) * 0.025, 0.6, -0.05 + Math.sin(t * 0.7) * 0.02);
  lm.descentFlame.userData.set(1, t);
  // the alarm: red pulses in the cabin windows
  const pulse = t % 0.36 < 0.22 ? 1 : 0.15;
  lm.setAlarm(t < T.trotzdem ? pulse : 0);
  // engine dust once the Eagle is low enough
  const ground = moonHeight(p.x, p.z);
  const h = p.y - ground;
  dust.set(smooth(ramp(-h, -16, -6)), t, p.x, ground, p.z);

  // DSKY: 1202 with PROG + RESTART lit, row 1 blinking
  const blink = Math.floor(t * 3) % 2 === 0;
  dsky.show({
    alarm: t < T.wir,
    blink: t < T.computer && blink,
    r1: "+01202",
    r2: "+00000",
    r3: "−00042",
    prog: "63",
  });
  phone.visible = t >= T.foto - 0.3 && t < T.wir;
  phone.scale.copy(squash(t, T.foto - 0.2));
  pen.visible = t >= T.filz - 0.1 && t < T.warum;
  pen.scale.copy(squash(t, T.filz - 0.05));
  pen.rotation.set(0.25, t * 1.6, 0.9 + Math.sin(t * 1.3) * 0.1);

  // fuel gauge while the Eagle is on screen
  const fuelK = t >= T.treib && t < T.computer ? pop(t, T.treib, T.computer) : 0;
  meter("fuel", fuelK, {
    label: "Treibstoff",
    value: Math.max(0.02, 0.09 - (t - T.treib) * 0.02),
    x: 1440,
    y: 190,
    color: "#ff4b2b",
    text: `${Math.max(2, Math.round(9 - (t - T.treib) * 2))} %`,
  });

  applyCamera(t);
  renderFrame();
}

start(renderAt);
