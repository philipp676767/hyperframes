// #71 "Alle springen gleichzeitig" — a football stadium at night under
// floodlights, a concert crowd on the pitch facing the stage. Ground: striped
// pitch + red running track, an elliptical bowl of stands packed with fans
// (people are built in scene.js from STAND_SPOTS), a glowing roof ring, four
// floodlight masts, the stage with its giant LED screen (hero piece, z < -30),
// a city skyline beyond the rim. Life: sweeping stage beams, twinkling phone
// lights, confetti, the crowd itself.
import { THREE, flat, real, roundedBox, rng, onFrame, scene } from "./world.js";
import { SKIES, setSky, finishSet, F, add } from "./environments.js";

const SEED = 71;
export const STADIUM = { cx: 0, cz: -10, rx: 27, rz: 37 };

// ---------------------------------------------------------------- light
setSky({
  ...SKIES.nacht,
  top: [0.02, 0.03, 0.1],
  mid: [0.06, 0.07, 0.2],
  hor: [0.3, 0.22, 0.42],
  below: [0.05, 0.05, 0.12],
  stars: 0.8,
  clouds: 0,
  noClouds: true,
  birds: false,
  nightWindows: false,
  key: [0xfff0dc, 2.6],
  keyPos: [18, 34, 26],
  rim: [0xff4fa8, 1.4],
  hemi: [0x9aa8ff, 0x1a1626, 0.9],
  fog: [80, 280],
});

// ---------------------------------------------------------------- ground
const groundMat = flat(0x1d2027, { roughness: 0.95 });
const outer = new THREE.Mesh(new THREE.CircleGeometry(260, 64), groundMat);
outer.rotation.x = -Math.PI / 2;
outer.position.y = -0.02;
outer.receiveShadow = true;
scene.add(outer);

// pitch: mown stripes + white lines, drawn once on a canvas
{
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 768;
  const g = c.getContext("2d");
  for (let i = 0; i < 16; i++) {
    g.fillStyle = i % 2 ? "#2f7d36" : "#3a8f3f";
    g.fillRect(0, (i * 768) / 16, 512, 768 / 16);
  }
  g.strokeStyle = "rgba(255,255,255,0.85)";
  g.lineWidth = 5;
  g.strokeRect(20, 20, 472, 728);
  g.beginPath();
  g.moveTo(20, 384);
  g.lineTo(492, 384);
  g.stroke();
  g.beginPath();
  g.arc(256, 384, 70, 0, Math.PI * 2);
  g.stroke();
  g.strokeRect(140, 20, 232, 110);
  g.strokeRect(140, 638, 232, 110);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const pitch = new THREE.Mesh(
    new THREE.PlaneGeometry(46, 70),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }),
  );
  pitch.rotation.x = -Math.PI / 2;
  pitch.position.set(0, 0.0, STADIUM.cz);
  pitch.receiveShadow = true;
  scene.add(pitch);
}
// running track ring (between pitch and stands)
{
  const shape = new THREE.Shape();
  shape.absellipse(0, 0, STADIUM.rx + 0.4, STADIUM.rz + 0.4, 0, Math.PI * 2);
  const hole = new THREE.Path();
  hole.absellipse(0, 0, 24.2, 35.4, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  const m = new THREE.Mesh(new THREE.ShapeGeometry(shape, 96), flat(0xa8443a, { roughness: 0.85 }));
  m.rotation.x = -Math.PI / 2;
  m.position.set(0, 0.01, STADIUM.cz);
  m.receiveShadow = true;
  scene.add(m);
}

// ---------------------------------------------------------------- stands
// stepped elliptical bowl, open behind the stage; every tier holds fans
const TIERS = 16;
const GAP = 0.62; // half-angle (rad) of the opening behind the stage (theta = PI)
const standMat = flat(0x343a4e, { roughness: 0.9, side: THREE.DoubleSide });
const seatMats = [0x1f4fa0, 0xb8323a].map((c) =>
  flat(c, { roughness: 0.7, side: THREE.DoubleSide }),
);
const ell = (r, th) => [Math.sin(th) * r * (STADIUM.rx / STADIUM.rz), Math.cos(th) * r];
function stepRing(r0, r1, y, h, th0, th1, seg = 160) {
  const pos = [];
  const quad = (a, b, c, d) => pos.push(...a, ...b, ...c, ...a, ...c, ...d);
  for (let i = 0; i < seg; i++) {
    const a0 = th0 + ((th1 - th0) * i) / seg;
    const a1 = th0 + ((th1 - th0) * (i + 1)) / seg;
    const [x00, z00] = ell(r0, a0);
    const [x01, z01] = ell(r0, a1);
    const [x10, z10] = ell(r1, a0);
    const [x11, z11] = ell(r1, a1);
    // tread (faces up)
    quad([x00, y, z00], [x01, y, z01], [x11, y, z11], [x10, y, z10]);
    // riser (faces the pitch)
    quad([x00, y - h, z00], [x01, y - h, z01], [x01, y, z01], [x00, y, z00]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}
export const STAND_SPOTS = [];
{
  const r = rng(SEED);
  const th0 = Math.PI + GAP;
  const th1 = Math.PI * 3 - GAP;
  for (let i = 0; i < TIERS; i++) {
    const r0 = STADIUM.rz + 1.2 + i * 1.0;
    const y = 1.3 + i * 0.62;
    const ring = new THREE.Mesh(
      stepRing(r0, r0 + 1.0, y, i === 0 ? 1.3 : 0.62, th0, th1),
      i % 4 === 3 ? seatMats[1] : standMat,
    );
    ring.position.z = STADIUM.cz;
    ring.receiveShadow = true;
    scene.add(ring);
    // fans on this tier, ~0.85 m apart along the ellipse
    const n = Math.round(((th1 - th0) * r0) / 0.85);
    for (let k = 0; k < n; k++) {
      if (r() < 0.06) continue; // a few empty seats
      const th = th0 + ((th1 - th0) * (k + 0.5 + (r() - 0.5) * 0.3)) / n;
      const [x, z] = ell(r0 + 0.5, th);
      STAND_SPOTS.push([x, y, z + STADIUM.cz, Math.atan2(-x, -z) + 0]);
    }
  }
  // outer wall + roof ring with a glowing underside
  const top = STADIUM.rz + 1.2 + TIERS * 1.0;
  const wallH = 1.3 + TIERS * 0.62 + 3.2;
  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(top, top, wallH, 160, 1, true, th0, th1 - th0),
    flat(0x262a38, { side: THREE.DoubleSide }),
  );
  wall.scale.x = STADIUM.rx / STADIUM.rz;
  wall.position.set(0, wallH / 2, STADIUM.cz);
  scene.add(wall);
  const roof = new THREE.Mesh(
    new THREE.CylinderGeometry(top + 0.5, top - 6, 0.6, 160, 1, true, th0, th1 - th0),
    flat(0x1c1f2a, { side: THREE.DoubleSide }),
  );
  roof.scale.x = STADIUM.rx / STADIUM.rz;
  roof.position.set(0, wallH + 0.2, STADIUM.cz);
  scene.add(roof);
  const strip = new THREE.Mesh(
    new THREE.CylinderGeometry(top - 5.6, top - 5.6, 0.35, 160, 1, true, th0, th1 - th0),
    new THREE.MeshBasicMaterial({ color: 0xfff3dd, side: THREE.DoubleSide }),
  );
  strip.scale.x = STADIUM.rx / STADIUM.rz;
  strip.position.set(0, wallH - 0.2, STADIUM.cz);
  scene.add(strip);
}

// ---------------------------------------------------------------- floodlight masts
{
  const panelMat = new THREE.MeshBasicMaterial({ color: 0xfffaf0 });
  const mastMat = real.metal(0x9aa0aa, { roughness: 0.4 });
  [
    [-36, 26],
    [36, 26],
    [-36, -48],
    [36, -48],
  ].forEach(([x, z]) => {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.8, 34, 16), mastMat);
    pole.position.y = 17;
    g.add(pole);
    const head = new THREE.Group();
    head.position.y = 35;
    const frame = new THREE.Mesh(roundedBox(9, 4.6, 0.6, 0.15), real.metal(0x3a3e48));
    head.add(frame);
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 2; j++) {
        const p = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.7), panelMat);
        p.position.set(-3.3 + i * 2.2, -1.0 + j * 2.0, 0.32);
        head.add(p);
      }
    g.add(head);
    g.position.set(x, 0, z);
    g.lookAt(0, 0, STADIUM.cz);
    head.rotation.set(0.5, 0, 0);
    scene.add(g);
  });
}

// ---------------------------------------------------------------- stage (hero piece)
export const STAGE_Z = -37;
export const screen = { mat: null };
{
  const g = new THREE.Group();
  g.position.set(0, 0, STAGE_Z);
  scene.add(g);
  const deck = new THREE.Mesh(roundedBox(26, 1.6, 9, 0.12), real.plastic(0x15161c));
  deck.position.y = 0.8;
  deck.receiveShadow = true;
  g.add(deck);
  // LED screen with "SPRING!"
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 440;
  const x = c.getContext("2d");
  const grd = x.createLinearGradient(0, 0, 1024, 440);
  grd.addColorStop(0, "#ff2e88");
  grd.addColorStop(1, "#5b2bff");
  x.fillStyle = grd;
  x.fillRect(0, 0, 1024, 440);
  x.fillStyle = "#fff";
  x.font = "900 230px Montserrat, Arial Black, sans-serif";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.fillText("SPRING!", 512, 236);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  screen.mat = new THREE.MeshBasicMaterial({ map: tex });
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(24, 10.3), screen.mat);
  scr.position.set(0, 9.5, -3.6);
  g.add(scr);
  const bezel = new THREE.Mesh(roundedBox(25, 11.2, 0.6, 0.2), real.metal(0x22242c));
  bezel.position.set(0, 9.5, -4.0);
  g.add(bezel);
  // truss towers + top truss
  const truss = real.metal(0xc8ccd4, { roughness: 0.35 });
  [-13.5, 13.5].forEach((tx) => {
    const tw = new THREE.Mesh(roundedBox(0.9, 17, 0.9, 0.1), truss);
    tw.position.set(tx, 8.5, -1.5);
    g.add(tw);
    // speaker stacks
    for (let k = 0; k < 3; k++) {
      const sp = new THREE.Mesh(roundedBox(2.2, 1.5, 1.6, 0.08), real.plastic(0x0d0d10));
      sp.position.set(tx + (tx < 0 ? 2.2 : -2.2), 2.4 + k * 1.55, 3.2);
      g.add(sp);
      const cone = new THREE.Mesh(new THREE.CircleGeometry(0.5, 32), real.rubber(0x2a2a30));
      cone.position.set(sp.position.x, sp.position.y, 4.02);
      g.add(cone);
    }
  });
  const top = new THREE.Mesh(roundedBox(28, 0.9, 0.9, 0.1), truss);
  top.position.set(0, 17, -1.5);
  g.add(top);
  // light beams (additive cones) sweeping from the top truss
  const beamMat = (c) =>
    new THREE.MeshBasicMaterial({
      color: c,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: false,
    });
  const cols = [0xff3fa4, 0x6f6bff, 0x3fd9ff, 0xff3fa4, 0x6f6bff, 0x3fd9ff];
  const beams = cols.map((c, i) => {
    const piv = new THREE.Group();
    piv.position.set(-11 + i * 4.4, 16.5, -1.2);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(2.6, 34, 24, 1, true), beamMat(c));
    cone.position.y = -17;
    cone.userData.noAO = true;
    piv.add(cone);
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 16, 12),
      new THREE.MeshBasicMaterial({ color: c }),
    );
    piv.add(lamp);
    g.add(piv);
    return piv;
  });
  onFrame((t) => {
    beams.forEach((b, i) => {
      b.rotation.x = -1.0 + Math.sin(t * 0.9 + i * 1.3) * 0.35;
      b.rotation.z = Math.sin(t * 0.7 + i * 2.1) * 0.55;
    });
  });
}

// ---------------------------------------------------------------- city skyline
{
  const r = rng(SEED + 5);
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 128;
  const x = c.getContext("2d");
  x.fillStyle = "#171a26";
  x.fillRect(0, 0, 64, 128);
  for (let i = 0; i < 8; i++)
    for (let j = 0; j < 20; j++)
      if (r() < 0.45) {
        x.fillStyle = r() < 0.7 ? "#ffd99a" : "#9fd3ff";
        x.fillRect(4 + i * 7.5, 4 + j * 6.2, 4, 3.4);
      }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  for (let k = 0; k < 46; k++) {
    const a = (k / 46) * Math.PI * 2 + r() * 0.08;
    const d = 95 + r() * 60;
    const h = 18 + r() * 50;
    const w = 7 + r() * 9;
    const m = tex.clone();
    m.repeat.set(w / 10, h / 20);
    m.needsUpdate = true;
    const b = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, w),
      new THREE.MeshStandardMaterial({
        color: 0x2a2e3e,
        emissive: 0xffffff,
        emissiveMap: m,
        emissiveIntensity: 0.55,
        roughness: 0.9,
      }),
    );
    b.position.set(Math.sin(a) * d, h / 2, STADIUM.cz + Math.cos(a) * d);
    scene.add(b);
  }
}

// ---------------------------------------------------------------- life: phone lights + confetti
{
  const r = rng(SEED + 9);
  const N = 420;
  const dots = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.07, 8, 6),
    new THREE.MeshBasicMaterial({ color: 0xfff6e0 }),
    N,
  );
  const spots = [];
  for (let i = 0; i < N; i++) {
    const s = STAND_SPOTS[Math.floor(r() * STAND_SPOTS.length)];
    spots.push([s[0] + (r() - 0.5) * 0.3, s[1] + 2.05, s[2], r() * 10]);
  }
  const m4 = new THREE.Matrix4();
  onFrame((t) => {
    spots.forEach(([x, y, z, p], i) => {
      const k = 0.4 + 0.6 * Math.max(0, Math.sin(t * 1.7 + p));
      m4.makeScale(k, k, k).setPosition(x, y + Math.sin(t * 2 + p) * 0.08, z);
      dots.setMatrixAt(i, m4);
    });
    dots.instanceMatrix.needsUpdate = true;
  });
  scene.add(dots);
}
export const confetti = (() => {
  const r = rng(SEED + 11);
  const N = 700;
  const mesh = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(0.16, 0.1),
    new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.6, emissive: 0x222222 }),
    N,
  );
  const cols = [0xff3fa4, 0xffd23f, 0x3fd9ff, 0xffffff, 0x8b6bff];
  const P = [];
  const c = new THREE.Color();
  for (let i = 0; i < N; i++) {
    P.push([(r() - 0.5) * 36, -26 + r() * 34, r(), r() * 6.28, 0.6 + r() * 0.6]);
    mesh.setColorAt(i, c.set(cols[i % cols.length]));
  }
  mesh.frustumCulled = false;
  scene.add(mesh);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const sc = new THREE.Vector3();
  const pos = new THREE.Vector3();
  // k = 0..1 visibility; falls from 18 m over the crowd
  return (t, k) => {
    mesh.visible = k > 0;
    if (!mesh.visible) return;
    P.forEach(([x, z, ph, rot, sp], i) => {
      const y = 18 - ((((t * sp * 2.2 + ph * 18) % 18) + 18) % 18);
      e.set(t * 3 + rot, t * 2.2 + rot * 2, rot);
      q.setFromEuler(e);
      sc.setScalar(k);
      pos.set(x + Math.sin(t * 1.3 + rot) * 0.6, y, z + STADIUM.cz * 0);
      m4.compose(pos, q, sc);
      mesh.setMatrixAt(i, m4);
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
})();

finishSet({ ground: 0x2a3a2c });
void F;
void add;
