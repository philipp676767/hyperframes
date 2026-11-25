// Chapter 5: the construction site (main world), a cart sinking into sand,
// the tomb painting, the 2014 sand experiment (dry vs wet), the three ramp
// ideas on the pyramid, the steep ramp found in 2018 (Hatnub).
import { THREE, scene, rng, real, roundedBox, V } from "./world.js";
import { buildGiza, makeSledge, randomPerson, shadowAll, noAO } from "./welt.js";
export const G = buildGiza({ time: "tag", state: "bau", level: 0.55 });
G.g1.casing(0.12);

// --- a cart with wheels sinking into soft sand (plateau east)
export const CART = new THREE.Group();
{
  const wood = real.wood(0x8a5a32);
  const bed = new THREE.Mesh(roundedBox(0.3, 0.03, 0.16, 0.01), wood);
  bed.position.y = 0.06;
  CART.add(bed);
  for (const sd of [-1, 1]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 20), wood);
    w.rotation.x = Math.PI / 2;
    w.position.set(0, 0.05, sd * 0.1);
    CART.add(w);
  }
  const blk = new THREE.Mesh(
    roundedBox(0.13, 0.1, 0.09, 0.008),
    real.plastic(0xe6dcc6, { roughness: 0.8, clearcoat: 0 }),
  );
  blk.position.y = 0.125;
  CART.add(blk);
  CART.position.set(17, 0, -6);
  shadowAll(CART);
  scene.add(CART);
  // a ring of pushed-up sand around the wheels
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.02, 8, 20), real.fabric(0xd8b880));
  rim.rotation.x = Math.PI / 2;
  rim.position.set(17, 0.0, -6);
  rim.scale.set(3, 1.8, 1);
  scene.add(rim);
  CART.userData.rim = rim;
}
// --- the hero sledge on the plateau
export const HS = makeSledge({ team: 16, seed: 91 });
HS.position.set(19, 0.01, 6);
scene.add(HS);

// --- the tomb painting (Djehutihotep's colossus) in a dark room
export const PAINT = V(60, -120, 0);
{
  const room = new THREE.Mesh(
    new THREE.SphereGeometry(12, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0x0e0a08, side: THREE.BackSide, fog: false }),
  );
  room.position.copy(PAINT);
  scene.add(room);
  const c = document.createElement("canvas");
  c.width = 2048;
  c.height = 768;
  const g = c.getContext("2d");
  g.fillStyle = "#d8c49a";
  g.fillRect(0, 0, 2048, 768);
  const r = rng(5);
  for (let i = 0; i < 3000; i++) {
    g.fillStyle = `rgba(120,90,50,${r() * 0.08})`;
    g.fillRect(r() * 2048, r() * 768, 2 + r() * 6, 2 + r() * 6);
  }
  // band lines
  g.fillStyle = "#3a5a7a";
  g.fillRect(0, 40, 2048, 10);
  g.fillRect(0, 718, 2048, 10);
  // the colossus on its sledge (right)
  g.fillStyle = "#c8b48c";
  g.fillRect(1500, 160, 300, 470);
  g.fillStyle = "#2a2018";
  g.fillRect(1530, 120, 90, 120);
  g.fillStyle = "#7a5030";
  g.fillRect(1440, 630, 420, 34);
  // figure helper: an Egyptian profile figure walking left, pulling
  const fig = (x, y, s, col) => {
    g.fillStyle = col;
    g.beginPath();
    g.arc(x, y, 14 * s, 0, Math.PI * 2);
    g.fill();
    g.fillRect(x - 10 * s, y + 12 * s, 20 * s, 60 * s);
    g.fillStyle = "#f2ece0";
    g.fillRect(x - 13 * s, y + 66 * s, 26 * s, 28 * s);
    g.strokeStyle = col;
    g.lineWidth = 8 * s;
    g.beginPath();
    g.moveTo(x, y + 92 * s);
    g.lineTo(x - 18 * s, y + 140 * s);
    g.moveTo(x, y + 92 * s);
    g.lineTo(x + 16 * s, y + 140 * s);
    g.moveTo(x, y + 25 * s);
    g.lineTo(x - 34 * s, y + 38 * s);
    g.stroke();
  };
  // four rows of pullers on ropes
  g.strokeStyle = "#5a3a20";
  g.lineWidth = 4;
  for (let row = 0; row < 4; row++) {
    const y = 150 + row * 130;
    g.beginPath();
    g.moveTo(80, y + 40);
    g.lineTo(1500, y + 40 + (row - 1.5) * 20);
    g.stroke();
    for (let i = 0; i < 11; i++) fig(120 + i * 110, y, 0.8, row % 2 ? "#8a4a2a" : "#9a5a34");
  }
  // the water pourer on the sledge's front
  fig(1420, 470, 0.9, "#8a4a2a");
  g.strokeStyle = "#3a7ab8";
  g.lineWidth = 8;
  g.beginPath();
  g.moveTo(1392, 510);
  g.quadraticCurveTo(1380, 590, 1400, 640);
  g.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 3),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }),
  );
  wall.position.copy(PAINT).add(V(0, 1.5, -2));
  scene.add(wall);
  const lamp = new THREE.SpotLight(0xffd8a8, 40, 12, 0.7, 0.6, 1.2);
  lamp.position.copy(PAINT).add(V(1, 3, 3));
  lamp.target.position.copy(PAINT).add(V(0, 1.5, -2));
  scene.add(lamp, lamp.target);
}

// --- the 2014 experiment: two sledges on a sand bed, dry vs wet
export const LAB = V(-32, 1.1, 2);
export const DRY = makeSledge({ team: 6, seed: 12 });
export const WET = makeSledge({ team: 6, seed: 13 });
export const BERM = new THREE.Mesh(
  new THREE.SphereGeometry(0.1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
  real.fabric(0xe2c48e),
);
{
  const bed = new THREE.Mesh(roundedBox(4, 1.2, 2.2, 0.05), real.fabric(0xe0c08a));
  bed.position.copy(LAB).add(V(0, -0.6, 0));
  bed.receiveShadow = true;
  scene.add(bed);
  DRY.position.copy(LAB).add(V(1.0, 0, -0.45));
  WET.position.copy(LAB).add(V(1.0, 0, 0.45));
  scene.add(DRY, WET);
  BERM.scale.set(0.6, 0.6, 1.4);
  scene.add(BERM);
  shadowAll(BERM);
}

// --- the steep ramp of 2018: stairs either side, post holes with posts
export const HAT = V(-34, 1.1, -24);
export const HATS = makeSledge({ team: 10, seed: 44 });
{
  const g = new THREE.Group();
  const stone = real.plastic(0xd2b88c, { roughness: 0.95, clearcoat: 0 });
  const len = 3;
  const rise = 1.2;
  const ramp = new THREE.Mesh(roundedBox(0.5, 0.06, len, 0.02), stone);
  ramp.rotation.x = Math.atan2(rise, len);
  ramp.position.set(0, rise / 2, 0);
  g.add(ramp);
  for (const sd of [-1, 1]) {
    for (let i = 0; i < 14; i++) {
      const st = new THREE.Mesh(roundedBox(0.22, (rise / 14) * (i + 1), len / 14, 0.01), stone);
      st.position.set(sd * 0.38, ((rise / 14) * (i + 1)) / 2, len / 2 - (len / 14) * (i + 0.5));
      g.add(st);
    }
    for (let i = 0; i < 5; i++) {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.02, 0.2, 10),
        real.wood(0x6a4428),
      );
      const z = len / 2 - (len / 5) * (i + 0.5);
      post.position.set(sd * 0.3, rise * ((len / 2 - z) / len) + 0.1, z);
      g.add(post);
    }
  }
  const floor = new THREE.Mesh(roundedBox(3, 1.2, 5, 0.05), stone);
  floor.position.set(0, -0.6, 0.5);
  g.add(floor);
  g.position.copy(HAT);
  shadowAll(g);
  scene.add(g);
  HATS.position.copy(HAT).add(V(0, 0.05, 1.2));
  HATS.rotation.y = -Math.PI / 2;
  scene.add(HATS);
  HATS.userData.rise = rise;
  HATS.userData.len = len;
}
// a crowd at the foot of the pyramid for the last line
export const CROWD = [];
{
  const r = rng(77);
  for (let i = 0; i < 140; i++) {
    const p = randomPerson(r);
    p.position.set(-8 + r() * 16, 0, 12.6 + r() * 5);
    p.rotation.y = r() * 6.28;
    p.userData.ph = r() * 3;
    p.visible = false;
    scene.add(p);
    CROWD.push(p);
  }
}
export { noAO };
