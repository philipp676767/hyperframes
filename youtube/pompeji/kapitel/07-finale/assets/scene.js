// Finale: Pompeii today.
import { THREE, shotCamera, renderFrame, start, labels, real, scene, roundedBox } from "./world.js";
import { makePerson, walk } from "./welt.js";
import "./set.js";
import { shots, LABELS } from "./beats.js";

const applyCamera = shotCamera(shots);

// visitors: bright clothes, hats, walking slowly through the forum and the main street
const COL = [
  0xe8484a, 0x2f7fd8, 0xf2c94c, 0x27ae60, 0xffffff, 0x9b51e0, 0xf2994a, 0x56ccf2, 0x333333,
];
const visitors = [];
for (let i = 0; i < 40; i++) {
  const p = makePerson({
    coat: COL[i % COL.length],
    legs: [0x2f3d5a, 0xd8c8a8, 0x333333][i % 3],
    skin: [0xe8b394, 0xc99a74, 0x8a5a3a][i % 3],
  });
  if (i % 3 === 0) {
    const hat = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.006, 16),
      real.fabric(0xf2ead8),
    );
    hat.position.y = 0.19;
    p.add(hat);
  }
  const forum = i < 26;
  p.userData = {
    forum,
    x0: forum ? -1.3 + ((i * 0.37) % 2.6) : 0,
    z0: forum ? -4 + ((i * 1.31) % 8.5) : 0,
    ph: i * 0.61,
    sp: 0.04 + (i % 5) * 0.012,
  };
  scene.add(p);
  visitors.push(p);
}
// Pliny's writing table on the terrace at Misenum
{
  const tb = new THREE.Mesh(roundedBox(0.14, 0.008, 0.08, 0.003), real.wood(0x7a5a3a));
  tb.position.set(-86.62, 3.95 + 0.11, 49.92);
  scene.add(tb);
  for (let i = 0; i < 2; i++) {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.004, 0.004, 0.11, 6),
      real.wood(0x6a4a2e),
    );
    leg.position.set(-86.62 + (i ? 0.05 : -0.05), 3.95 + 0.055, 49.92);
    scene.add(leg);
  }
  const scroll = new THREE.Mesh(
    new THREE.CylinderGeometry(0.006, 0.006, 0.07, 12),
    real.fabric(0xf0e6cc),
  );
  scroll.rotation.z = Math.PI / 2;
  scroll.position.set(-86.62, 3.95 + 0.12, 49.92);
  scene.add(scroll);
}
// a thin steam wisp from the crater (the volcano is still active)
const wisp = new THREE.Group();
{
  const m = new THREE.MeshStandardMaterial({
    color: 0xf2f2f0,
    transparent: true,
    opacity: 0.35,
    roughness: 1,
    depthWrite: false,
  });
  for (let i = 0; i < 8; i++) {
    const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6 + i * 0.25, 1), m);
    s.userData.i = i;
    wisp.add(s);
  }
  wisp.position.set(0.5, 21.4, -62);
  scene.add(wisp);
}

function renderAt(t) {
  visitors.forEach((p) => {
    const u = p.userData;
    if (u.forum) {
      const s = Math.sin((t + u.ph * 7) * u.sp * 1.6) * 1.1;
      p.position.set(u.x0, 0.04, u.z0 + s);
      p.rotation.y = Math.cos((t + u.ph * 7) * u.sp * 1.6) > 0 ? -Math.PI / 2 : Math.PI / 2;
    } else {
      const L = 16;
      const x = 10 - ((((t * u.sp * 3 + u.ph * 4) % L) + L) % L);
      p.position.set(x, 0.04, 2.3 + (u.ph % 0.3));
      p.rotation.y = Math.PI;
    }
    walk(p, (t + u.ph) * 2, 0.8);
  });
  wisp.children.forEach((s) => {
    const k = (s.userData.i / 8 + t * 0.03) % 1;
    s.position.set(k * 3, k * 6, k * 1.5);
    s.material.opacity = 0.3 * (1 - k);
  });
  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}
start(renderAt);
