// Set of #39 "Was passiert, wenn du im Flugzeug auf die Spültaste drückst?"
// (SKILL.md 1b): a long-haul night flight over a moonlit cloud sea. The
// airliner itself (scene.js) is the stage; around it: the cloud carpet far
// below, a huge low moon behind the plane (hero piece), moonlit Alpine
// peaks poking through the clouds on the horizon, stars, a shooting star,
// cloud puffs and light streaks racing past.
import { THREE, flat, ground, onFrame, scene, rng, jitter, facet, facetMat } from "./world.js";
import { SKIES, setSky, finishSet, cloudPuffs } from "./environments.js";

const SEED = 39;

// ---------------------------------------------------------------- light
// deep blue night, a cold moonlit band at the horizon; the "sun" is the moon
export const sky = setSky({
  ...SKIES.nacht,
  top: [0.015, 0.025, 0.09],
  mid: [0.05, 0.08, 0.22],
  hor: [0.2, 0.27, 0.5],
  below: [0.1, 0.13, 0.27],
  sun: [0.85, 0.9, 1.0],
  sunDir: [-0.25, 0.32, -1],
  keyPos: [-6, 14, -10],
  key: [0xc9d6ff, 1.9],
  hemi: [0x9fb2ff, 0x262c48, 1.15],
  rim: [0x7f9bff, 1.3],
  cloud: [0x7d8bb8, 0x2f3a6a],
  stars: 1.2,
  clouds: 0,
  birds: false,
  fog: [40, 170],
});

// the plane is ~34 m long: widen the key light's shadow box so all of it gets shadows
scene.traverse((o) => {
  if (o.isDirectionalLight && o.castShadow) {
    Object.assign(o.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, far: 80 });
    o.shadow.camera.updateProjectionMatrix();
  }
});

// ---------------------------------------------------------------- cloud sea (ground)
const cloudMat = facetMat(
  new THREE.MeshStandardMaterial({
    color: 0x8d9ac6,
    emissive: 0x27315e,
    emissiveIntensity: 0.35,
    roughness: 1,
    flatShading: true,
  }),
);
{
  const r = rng(91 + SEED);
  for (let i = 0; i < 190; i++) {
    const a = r() * Math.PI * 2;
    const d = 4 + Math.sqrt(r()) * 85;
    const g = new THREE.Group();
    cloudPuffs(g, 3 + Math.floor(r() * 3), 2.4 + r() * 2.6 + d * 0.025, cloudMat, 200 + i);
    g.position.set(Math.cos(a) * d, -10.5 - r() * 1.6, Math.sin(a) * d);
    g.rotation.y = r() * Math.PI * 2;
    ground.add(g);
  }
  // a few towering cumulus columns far out — depth layers
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * (1.1 + i * 0.12);
    const g = new THREE.Group();
    for (let k = 0; k < 3; k++) {
      const c = new THREE.Group();
      cloudPuffs(c, 4, 5 - k * 0.9, cloudMat, 300 + i * 9 + k);
      c.position.y = k * 4.2;
      g.add(c);
    }
    g.position.set(Math.sin(a) * 80, -10, Math.cos(a) * 80);
    ground.add(g);
  }
}

// ---------------------------------------------------------------- far layer: moonlit Alps
{
  const rock = flat(0x4a4f72);
  const snow = flat(0xdfe6ff, { emissive: 0x3a4a8a, emissiveIntensity: 0.25 });
  const r = rng(400 + SEED);
  for (let i = 0; i < 9; i++) {
    const a = -0.95 + i * 0.24 + (r() - 0.5) * 0.08;
    const d = 95 + r() * 18;
    const h = 14 + r() * 10;
    const g = new THREE.Group();
    const peak = new THREE.Mesh(
      facet(jitter(new THREE.ConeGeometry(h * 0.75, h, 7, 3), 0.5, 40 + i), 0.1, i),
      facetMat(rock),
    );
    g.add(peak);
    const cap = new THREE.Mesh(
      facet(jitter(new THREE.ConeGeometry(h * 0.27, h * 0.36, 7, 1), 0.2, 60 + i), 0.06, i),
      facetMat(snow),
    );
    cap.position.y = h * 0.32;
    g.add(cap);
    g.position.set(Math.sin(a) * d, -12 + h * 0.5, -Math.cos(a) * d);
    ground.add(g);
  }
}

// ---------------------------------------------------------------- hero piece: the big low moon
{
  const moon = new THREE.Group();
  const discMat = new THREE.MeshBasicMaterial({ color: 0xf2f0e4, fog: false });
  const disc = new THREE.Mesh(new THREE.CircleGeometry(15, 40), discMat);
  moon.add(disc);
  const craterMat = new THREE.MeshBasicMaterial({ color: 0xd8d6cc, fog: false });
  const r = rng(77);
  for (let i = 0; i < 9; i++) {
    const c = new THREE.Mesh(new THREE.CircleGeometry(1.2 + r() * 2.6, 9), craterMat);
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * 10;
    c.position.set(Math.cos(a) * d, Math.sin(a) * d, 0.05);
    moon.add(c);
  }
  // soft halo
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0x8fa6ff,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
    fog: false,
  });
  const halo = new THREE.Mesh(new THREE.CircleGeometry(26, 40), haloMat);
  halo.position.z = -0.1;
  moon.add(halo);
  moon.position.set(-38, 26, -150);
  moon.lookAt(0, 2, 0);
  moon.traverse((o) => o.isMesh && (o.userData.noAO = true));
  scene.add(moon);
}

// ---------------------------------------------------------------- life: speed puffs + streaks
// the plane flies towards −x: clouds and streaks race past towards +x
const SPEED = 12;
const speedPuffs = [];
{
  const mat = facetMat(
    new THREE.MeshStandardMaterial({
      color: 0x9aa7d4,
      emissive: 0x334077,
      emissiveIntensity: 0.4,
      roughness: 1,
      flatShading: true,
    }),
  );
  const r = rng(250 + SEED);
  for (let i = 0; i < 24; i++) {
    const g = new THREE.Group();
    cloudPuffs(g, 3 + Math.floor(r() * 3), 0.9 + r() * 1.3, mat, 500 + i);
    let z = (r() - 0.5) * 60;
    if (Math.abs(z) < 6) z += Math.sign(z || 1) * 7;
    const y = r() < 0.75 ? -6.5 + r() * 3.5 : 7 + r() * 4;
    scene.add(g);
    speedPuffs.push({ g, x0: r() * 120, y, z });
  }
}
const STREAKS = 40;
const streaks = new THREE.InstancedMesh(
  new THREE.BoxGeometry(1, 0.014, 0.014),
  new THREE.MeshBasicMaterial({
    color: 0xcfe0ff,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
  }),
  STREAKS,
);
streaks.userData.noAO = true;
streaks.frustumCulled = false;
scene.add(streaks);
const streakSeed = (() => {
  const r = rng(260 + SEED);
  return Array.from({ length: STREAKS }, () => ({
    x0: r() * 50,
    y: -2 + r() * 7,
    z: (r() < 0.5 ? 1 : -1) * (3.2 + r() * 8),
    len: 0.8 + r() * 2,
    v: 28 + r() * 14,
  }));
})();

// shooting star across the upper sky every ~9 s
const shoot = new THREE.Mesh(
  new THREE.BoxGeometry(6, 0.08, 0.08),
  new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, fog: false }),
);
shoot.userData.noAO = true;
scene.add(shoot);

const dm = new THREE.Matrix4();
const dq = new THREE.Quaternion();
const dv = new THREE.Vector3();
const ds = new THREE.Vector3();
onFrame((t) => {
  for (const p of speedPuffs) {
    const x = ((p.x0 + t * SPEED) % 120) - 60;
    p.g.position.set(x, p.y, p.z);
  }
  for (let i = 0; i < STREAKS; i++) {
    const s = streakSeed[i];
    const x = ((s.x0 + t * s.v) % 50) - 25;
    dv.set(x, s.y, s.z);
    ds.set(s.len, 1, 1);
    dm.compose(dv, dq, ds);
    streaks.setMatrixAt(i, dm);
  }
  streaks.instanceMatrix.needsUpdate = true;
  const k = (t % 9) / 9;
  const f = Math.max(0, Math.min(1, (k - 0.1) / 0.12));
  shoot.material.opacity = f > 0 && f < 1 ? Math.sin(f * Math.PI) * 0.9 : 0;
  shoot.position.set(30 - f * 70, 34 - f * 10, -120);
  shoot.rotation.z = 0.14;
});

// ground colour for the sky light: the moonlit cloud tops
finishSet({ ground: 0x5d6a9a });
