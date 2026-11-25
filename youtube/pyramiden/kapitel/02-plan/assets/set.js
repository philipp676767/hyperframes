// Chapter 2: the empty plateau during the flood (main world, state "leer"):
// the planned pyramid as a glass ghost, seven football pitches on its
// footprint, levelling trenches filled with water, the cardinal axes, stars.
import { THREE, scene, rng, real, V } from "./world.js";
import { buildGiza, makeStars, randomPerson, G1, noAO } from "./welt.js";
export const G = buildGiza({ time: "tag", state: "leer" });
export const STARS = makeStars({ n: 1600 });
scene.add(STARS);

// seven football pitches on the footprint (4 + 3), a little above the ground
function pitchTex() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 512;
  const g = c.getContext("2d");
  for (let i = 0; i < 8; i++) {
    g.fillStyle = i % 2 ? "#4f9a3e" : "#5aa846";
    g.fillRect(0, (i * 512) / 8, 256, 512 / 8);
  }
  g.strokeStyle = "rgba(255,255,255,0.95)";
  g.lineWidth = 6;
  g.strokeRect(10, 10, 236, 492);
  g.beginPath();
  g.moveTo(10, 256);
  g.lineTo(246, 256);
  g.stroke();
  g.beginPath();
  g.arc(128, 256, 42, 0, Math.PI * 2);
  g.stroke();
  g.strokeRect(68, 10, 120, 70);
  g.strokeRect(68, 432, 120, 70);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
export const PITCHES = new THREE.Group();
{
  const mat = new THREE.MeshStandardMaterial({
    map: pitchTex(),
    roughness: 0.9,
    transparent: true,
  });
  const H = G1.half;
  const rows = [
    { n: 4, z0: -H, z1: -H + 11.3 },
    { n: 3, z0: -H + 11.7, z1: H },
  ];
  for (const row of rows) {
    const w = (2 * H - (row.n - 1) * 0.35) / row.n;
    for (let i = 0; i < row.n; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, row.z1 - row.z0), mat);
      m.rotation.x = -Math.PI / 2;
      m.position.set(-H + w / 2 + i * (w + 0.35), 0.06, (row.z0 + row.z1) / 2);
      m.receiveShadow = true;
      m.userData.order = PITCHES.children.length;
      PITCHES.add(m);
    }
  }
  scene.add(PITCHES);
  PITCHES.userData.mat = mat;
}

// levelling trenches: a grid of narrow channels in the rock, water rising
export const TRENCH = new THREE.Group();
{
  const rock = real.plastic(0xc8ac80, { roughness: 0.95, clearcoat: 0 });
  const water = new THREE.MeshPhysicalMaterial({
    color: 0x6a9aa8,
    roughness: 0.04,
    transparent: true,
    opacity: 0.85,
    envMapIntensity: 1.8,
  });
  const H = G1.half - 0.5;
  const lines = [];
  for (let i = 0; i < 5; i++) {
    const u = -H + (i / 4) * 2 * H;
    lines.push({ x: u, z: 0, len: 2 * H, along: "z" });
    lines.push({ x: 0, z: u, len: 2 * H, along: "x" });
  }
  TRENCH.userData.waters = [];
  for (const l of lines) {
    const g = new THREE.Group();
    const w = 0.12;
    // the two lips of the channel and the water inside
    for (const sd of [-1, 1]) {
      const lip = new THREE.Mesh(
        new THREE.BoxGeometry(l.along === "z" ? 0.05 : l.len, 0.05, l.along === "z" ? l.len : 0.05),
        rock,
      );
      lip.position.set(
        l.along === "z" ? sd * (w / 2 + 0.025) : 0,
        0.05,
        l.along === "z" ? 0 : sd * (w / 2 + 0.025),
      );
      lip.castShadow = lip.receiveShadow = true;
      g.add(lip);
    }
    const wm = noAO(
      new THREE.Mesh(
        new THREE.BoxGeometry(l.along === "z" ? w : l.len, 0.06, l.along === "z" ? l.len : w),
        water,
      ),
    );
    wm.position.y = 0.03;
    g.add(wm);
    TRENCH.userData.waters.push(wm);
    g.position.set(l.x, 0, l.z);
    TRENCH.add(g);
  }
  scene.add(TRENCH);
}
// workers along the trenches, a few with water jars
export const WORKERS = [];
{
  const r = rng(22);
  for (let i = 0; i < 26; i++) {
    const p = randomPerson(r);
    const H = G1.half - 0.5;
    const k = Math.floor(r() * 5);
    const u = -H + (k / 4) * 2 * H;
    const a = -H + r() * 2 * H;
    if (r() < 0.5) p.position.set(u + 0.22, 0.02, a);
    else p.position.set(a, 0.02, u + 0.22);
    p.rotation.y = r() * 6.28;
    p.userData.ph = r() * 2;
    scene.add(p);
    WORKERS.push(p);
  }
}
// the cardinal axes: two glowing lines crossing the footprint
export const AXES = new THREE.Group();
{
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffd24a,
    transparent: true,
    toneMapped: false,
  });
  const ns = noAO(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 34), mat));
  const ew = noAO(new THREE.Mesh(new THREE.BoxGeometry(34, 0.02, 0.08), mat));
  ns.position.y = ew.position.y = 0.12;
  AXES.add(ns, ew);
  AXES.userData.mat = mat;
  scene.add(AXES);
}
export const NORTH = V(0, 0.3, -17);
