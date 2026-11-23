// Chapter 6: rediscovery.
import {
  THREE,
  shotCamera,
  renderFrame,
  start,
  labels,
  ramp,
  smooth,
  real,
  scene,
  roundedBox,
} from "./world.js";
import { makePerson, walk } from "./welt.js";
import { BK, TR } from "./set.js";
import { T, shots, LABELS } from "./beats.js";

const applyCamera = shotCamera(shots);

// canvas helper for painted / carved letters
function tex(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
// the inscription stone of 1763 (lying on the forum floor)
{
  const t = tex(1024, 320, (g, w, h) => {
    g.fillStyle = "#e6dfd0";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 400; i++) {
      g.fillStyle = `rgba(120,110,95,${Math.random() * 0.08})`;
      g.fillRect((i * 97) % w, (i * 53) % h, 6, 6);
    }
    g.fillStyle = "#6a5e4e";
    g.font = "bold 74px serif";
    g.textAlign = "center";
    g.fillText("T SVEDIVS CLEMENS", w / 2, 120);
    g.fillText("REI PVBLICAE POMPEIANORVM", w / 2, 240);
  });
  const slab = new THREE.Mesh(roundedBox(0.62, 0.05, 0.2, 0.01), [
    real.plastic(0xd8d0c0, { roughness: 0.8, clearcoat: 0 }),
    real.plastic(0xd8d0c0, { roughness: 0.8, clearcoat: 0 }),
    new THREE.MeshStandardMaterial({ map: t, roughness: 0.8 }),
    real.plastic(0xd8d0c0, { roughness: 0.8, clearcoat: 0 }),
    real.plastic(0xd8d0c0, { roughness: 0.8, clearcoat: 0 }),
    real.plastic(0xd8d0c0, { roughness: 0.8, clearcoat: 0 }),
  ]);
  slab.position.set(0, 0.08, 0.62);
  slab.rotation.y = 0.15;
  slab.castShadow = true;
  scene.add(slab);
}
// painted election notices + scratched graffiti on the bakery's side wall
{
  const t = tex(1024, 768, (g, w, h) => {
    g.fillStyle = "#d9c7a4";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#a8322a";
    g.font = "bold 120px serif";
    g.fillText("CN HELVIVM", 60, 170);
    g.font = "bold 96px serif";
    g.fillText("SABINVM AED", 60, 290);
    g.font = "bold 80px serif";
    g.fillText("O V F", 60, 390);
    g.fillStyle = "#2a2622";
    g.font = "italic 34px serif";
    const lines = ["SATVRNINVS CVM DISCENTES", "HIC FVIMVS", "VALE", "AMPLIATVS"];
    lines.forEach((l, i) => g.fillText(l, 520 + (i % 2) * 40, 480 + i * 60));
    g.strokeStyle = "#3a342e";
    g.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
      g.beginPath();
      g.moveTo(80 + i * 34, 600);
      g.lineTo(90 + i * 34, 660);
      g.stroke();
    }
  });
  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 1.8),
    new THREE.MeshStandardMaterial({ map: t, roughness: 0.95 }),
  );
  wall.position.set(-3.28, -120 + 1.5, 0.2);
  wall.rotation.y = Math.PI / 2;
  scene.add(wall);
}
// workers in the dig (1748): spades, baskets
const workers = [];
for (let i = 0; i < 6; i++) {
  const p = makePerson({
    coat: [0x6a5a48, 0x4a4a52, 0x7a6a50, 0x5a4a3a, 0x6a6a5a, 0x8a7a5a][i],
    legs: 0x3a3028,
  });
  const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.16, 6), real.wood(0x8a6a44));
  sp.position.set(0.03, 0.1, 0.03);
  sp.rotation.z = 0.6;
  p.add(sp);
  p.position.set(-1.6 + (i % 3) * 1.4, 0.05, -1.5 + Math.floor(i / 3) * 2.6);
  p.rotation.y = i * 1.3;
  p.userData.i = i;
  scene.add(p);
  workers.push(p);
}

function renderAt(t) {
  workers.forEach((p, i) => {
    p.visible = t >= T.erst - 0.2 && t < T.in - 0.2;
    p.rotation.z = Math.sin(t * 2.4 + i) * 0.18;
    walk(p, 0, 0);
  });
  BK.userData.update(t, { fire: 0, charred: 1, ash: 0.4 });
  const pour = smooth(ramp(t, T.er + 0.2, T.heraus - 0.3));
  TR.userData.update(t, {
    pour: t < T.er ? 0 : pour,
    reveal: smooth(ramp(t, T.heraus + 0.2, T.heraus + 3)),
  });
  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
