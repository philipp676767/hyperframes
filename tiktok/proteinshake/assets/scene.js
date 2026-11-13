// #90 Protein-Shake — the subject: a giant protein shaker on the Alm, the
// protein chain that comes out of it, the muscle fibre it ends up in, and
// the leftovers that go down the outhouse. World: set.js.
import {
  THREE,
  ramp,
  smooth,
  clamp01,
  outBack,
  pop,
  V,
  rng,
  scene,
  flat,
  real,
  roundedBox,
  showNope,
  showPanel,
  LED,
  labels,
  squash,
  puff,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import { milkMat, curds, pig, pigParts, kloDoor, KLO } from "./set.js";
import { createHand } from "./hand.js";
import { T, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);

const VAN = new THREE.Color(0xeedcb6); // vanilla shake
const CHOC = new THREE.Color(0x6b3f26); // chocolate shake
const PAL = [
  0xe74c3c, 0xf39c12, 0xf1c40f, 0x2ecc71, 0x1abc9c, 0x3498db, 0x9b59b6, 0xe84393, 0xff7f50,
  0x6c5ce7, 0x00b894, 0xfdcb6e, 0xd63031, 0x0984e3, 0xa29bfe, 0x55efc4, 0xfab1a0, 0x81ecec,
  0xffeaa7, 0xb2bec3,
];

// ---------------------------------------------------------------- the shaker
const shaker = new THREE.Group();
scene.add(shaker);
const tilt = new THREE.Group(); // tips over for pouring
shaker.add(tilt);
const bodyMat = new THREE.MeshPhysicalMaterial({
  color: 0x4a525c,
  roughness: 0.12,
  clearcoat: 1,
  clearcoatRoughness: 0.05,
  transparent: true,
  opacity: 0.36,
  depthWrite: false,
  side: THREE.DoubleSide,
  envMapIntensity: 1.4,
});
{
  const prof = [new THREE.Vector2(0, 0.06)];
  for (let i = 0; i <= 20; i++) {
    const f = i / 20;
    prof.push(new THREE.Vector2(0.66 + f * 0.08, 0.06 + f * 1.94));
  }
  const body = new THREE.Mesh(new THREE.LatheGeometry(prof, 72), bodyMat);
  body.userData.noAO = true;
  tilt.add(body);
  const foot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.67, 0.68, 0.08, 72),
    real.rubber(0x1b1c20),
  );
  foot.position.y = 0.04;
  foot.castShadow = true;
  tilt.add(foot);
  // measuring marks on the left side
  const markMat = flat(0xffffff, { roughness: 0.4 });
  for (let i = 0; i < 7; i++) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(i % 2 ? 0.1 : 0.18, 0.018, 0.01), markMat);
    const y = 0.45 + i * 0.2;
    const r = 0.67 + (y / 2) * 0.08 + 0.008;
    m.position.set(-Math.sin(0.9) * r, y, Math.cos(0.9) * r);
    m.rotation.y = -0.9;
    tilt.add(m);
  }
  // the brand label: an orange band printed on the front
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 384;
  const g = c.getContext("2d");
  g.fillStyle = "#ff7a1a";
  g.fillRect(0, 0, 1024, 384);
  g.fillStyle = "#1b1b1f";
  g.fillRect(0, 300, 1024, 84);
  g.fillStyle = "#ffffff";
  g.font = "900 190px Montserrat, Arial Black, sans-serif";
  g.textAlign = "center";
  g.fillText("WHEY", 512, 220);
  g.font = "800 58px Montserrat, Arial, sans-serif";
  g.fillText("PROTEIN · 100 %", 512, 362);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const band = new THREE.Mesh(
    new THREE.CylinderGeometry(0.722, 0.712, 0.62, 72, 1, true, -0.95, 1.9),
    real.plastic(0xffffff, { map: tex, roughness: 0.35 }),
  );
  band.position.y = 1.0;
  tilt.add(band);
}
// liquid inside
const liquidMat = real.plastic(VAN.getHex(), { roughness: 0.3, clearcoat: 0.6 });
const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.62, 1, 64), liquidMat);
tilt.add(liquid);
// whisk ball: three crossed wire rings
const ball = new THREE.Group();
for (let i = 0; i < 3; i++) {
  const r = new THREE.Mesh(
    new THREE.TorusGeometry(0.2, 0.014, 8, 40),
    real.metal(0xd9dde3, { roughness: 0.2 }),
  );
  r.rotation.set(i === 1 ? Math.PI / 2 : 0, i === 2 ? Math.PI / 2 : 0, 0);
  ball.add(r);
}
tilt.add(ball);
// screw lid + flip cap + carry loop
const lid = new THREE.Group();
lid.position.y = 2.0;
tilt.add(lid);
const lidMat = real.plastic(0x18191c, { roughness: 0.38 });
{
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.79, 0.78, 0.34, 72), lidMat);
  ring.position.y = 0.17;
  ring.castShadow = true;
  lid.add(ring);
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.28, 0.03), lidMat);
    rib.position.set(Math.cos(a) * 0.795, 0.17, Math.sin(a) * 0.795);
    rib.rotation.y = -a;
    lid.add(rib);
  }
  const dome = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.76, 0.14, 72), lidMat);
  dome.position.y = 0.41;
  lid.add(dome);
  const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.2, 40), lidMat);
  spout.position.set(0.32, 0.56, 0.12);
  lid.add(spout);
  const cap = new THREE.Mesh(
    roundedBox(0.42, 0.08, 0.42, 0.04),
    real.plastic(0xff7a1a, { roughness: 0.4 }),
  );
  cap.position.set(0.32, 0.7, 0.12);
  lid.add(cap);
  const loop = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.06, 16, 48, Math.PI), lidMat);
  loop.position.set(-0.3, 0.48, -0.2);
  loop.rotation.y = 0.6;
  lid.add(loop);
}
const SPOUT = V(0.32, 2.66, 0.12); // in tilt space

// droplets (hook): splash out of the spout while shaking
const dropMat = real.plastic(VAN.getHex(), { roughness: 0.2, clearcoat: 1 });
const drops = [];
{
  const r = rng(9001);
  for (let i = 0; i < 18; i++) {
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.05 + r() * 0.05, 16, 12), dropMat);
    d.userData = { ph: r(), vx: (r() - 0.3) * 2.6, vy: 2.2 + r() * 1.8, vz: (r() - 0.3) * 1.8 };
    scene.add(d);
    drops.push(d);
  }
}

// coins pouring out
const coinMat = real.metal(0xf0c04a, { roughness: 0.22 });
const coins = [];
{
  const r = rng(77);
  for (let i = 0; i < 14; i++) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.035, 40), coinMat);
    c.castShadow = true;
    c.userData = {
      land: V(1.5 + r() * 1.3, 0.02 + i * 0.006, -0.3 + r() * 1.6),
      spin: (r() - 0.5) * 12,
      d: i * 0.07,
    };
    scene.add(c);
    coins.push(c);
  }
}

// the viewer's hand, holding the shaker from the right (moves with it)
const hand = createHand({ scale: 2.1, sleeve: 0x2f3542 });
shaker.add(hand.group);

// scoop + falling powder
const powderMat = real.plastic(0xf3e6c9, { roughness: 0.95, clearcoat: 0 });
const scoop = new THREE.Group();
{
  const cup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.26, 0.38, 48, 1, true),
    real.plastic(0xffffff, { side: THREE.DoubleSide, roughness: 0.35 }),
  );
  scoop.add(cup);
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(0.26, 48), real.plastic(0xffffff));
  bottom.rotation.x = Math.PI / 2;
  bottom.position.y = -0.19;
  scoop.add(bottom);
  const handle = new THREE.Mesh(roundedBox(0.7, 0.06, 0.12, 0.03), real.plastic(0xffffff));
  handle.position.set(0.62, 0.12, 0);
  scoop.add(handle);
  const heap = new THREE.Mesh(
    new THREE.SphereGeometry(0.29, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    powderMat,
  );
  heap.position.y = 0.1;
  scoop.add(heap);
}
scene.add(scoop);
const grains = [];
{
  const r = rng(55);
  for (let i = 0; i < 30; i++) {
    const g = new THREE.Mesh(new THREE.IcosahedronGeometry(0.045 + r() * 0.04, 1), powderMat);
    g.userData = { ph: r(), dx: (r() - 0.5) * 0.4, dz: (r() - 0.5) * 0.4, noAO: true };
    scene.add(g);
    grains.push(g);
  }
}
// powder heap overflowing (Übrigens)
const mound = new THREE.Mesh(new THREE.ConeGeometry(1.15, 1, 64, 4), powderMat);
mound.castShadow = true;
scene.add(mound);
const spill = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.83, 1, 64, 1, true), powderMat);
scene.add(spill);

// a powder ball that bounces off the muscle
const blob = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 24), powderMat);
scene.add(blob);

// ---------------------------------------------------------------- the muscle model
const MUS = V(4.6, 1.3, 1.6);
const muscle = new THREE.Group();
muscle.position.copy(MUS);
muscle.rotation.y = 0.35;
scene.add(muscle);
const fiberMat = real.skin(0xc1323b, {
  sheenColor: new THREE.Color(0xff8a8a),
  emissive: 0xff5a3a,
  emissiveIntensity: 0,
});
const fibers = [];
const tears = [];
const tearMat = new THREE.MeshBasicMaterial({ color: 0xfff1b0, transparent: true, opacity: 1 });
{
  const spots = [[0, 0]];
  for (let i = 0; i < 6; i++)
    spots.push([Math.cos((i / 6) * Math.PI * 2) * 0.36, Math.sin((i / 6) * Math.PI * 2) * 0.36]);
  const r = rng(31);
  spots.forEach(([y, z]) => {
    const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 2.5, 12, 32), fiberMat);
    f.rotation.z = Math.PI / 2;
    f.position.set(0, y, z);
    f.castShadow = true;
    muscle.add(f);
    fibers.push(f);
    for (let k = 0; k < 2; k++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.175, 0.022, 8, 32), tearMat);
      ring.rotation.y = Math.PI / 2;
      ring.position.set(-0.9 + r() * 1.8, y, z);
      ring.userData.noAO = true;
      muscle.add(ring);
      tears.push(ring);
    }
  });
  // white tendons at both ends
  for (const s of [-1, 1]) {
    const tendon = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.7, 48), real.skin(0xf2e6dc));
    tendon.rotation.z = (s * Math.PI) / 2;
    tendon.position.x = s * 1.75;
    muscle.add(tendon);
  }
}
// dumbbell in front of the muscle
const dumbbell = new THREE.Group();
{
  const iron = real.metal(0x34363c, { roughness: 0.35 });
  const bar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 1.3, 24),
    real.metal(0xc9ced6, { roughness: 0.2 }),
  );
  bar.rotation.z = Math.PI / 2;
  dumbbell.add(bar);
  for (const s of [-1, 1]) {
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.16, 40), iron);
    plate.rotation.z = Math.PI / 2;
    plate.position.x = s * 0.5;
    plate.castShadow = true;
    dumbbell.add(plate);
  }
}
scene.add(dumbbell);

// ---------------------------------------------------------------- the protein chain
const N = 16;
const beads = [];
const chainPos = [];
const beadGeo = new THREE.SphereGeometry(0.13, 32, 20);
for (let i = 0; i < N; i++) {
  const b = new THREE.Mesh(beadGeo, real.gloss(PAL[(i * 7) % 20]));
  b.castShadow = true;
  scene.add(b);
  beads.push(b);
  chainPos.push(V(-1.9 + i * 0.253, 3.55 + Math.sin(i * 0.9) * 0.22, Math.sin(i * 0.6) * 0.25));
}
const thread = new THREE.Mesh(
  new THREE.TubeGeometry(new THREE.CatmullRomCurve3(chainPos), 96, 0.025, 8),
  real.plastic(0xffffff, { roughness: 0.5 }),
);
scene.add(thread);
const drift = chainPos.map((p, i) => {
  const r = rng(400 + i);
  return V((r() - 0.5) * 0.5, (r() - 0.5) * 0.6, (r() - 0.5) * 0.7);
});
// scissors
const scissors = new THREE.Group();
const blades = [];
{
  const steel = real.metal(0xdfe3e8, { roughness: 0.15 });
  for (const s of [-1, 1]) {
    const arm = new THREE.Group();
    const blade = new THREE.Mesh(roundedBox(0.9, 0.05, 0.11, 0.02), steel);
    blade.position.x = 0.45;
    arm.add(blade);
    const grip = new THREE.Mesh(
      new THREE.TorusGeometry(0.14, 0.04, 12, 32),
      real.plastic(0xff7a1a),
    );
    grip.position.x = -0.3;
    arm.add(grip);
    scissors.add(arm);
    blades.push([arm, s]);
  }
  const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.16, 16), steel);
  pin.rotation.x = Math.PI / 2;
  scissors.add(pin);
}
scene.add(scissors);
// blood vessel from the shaker to the muscle
const vessel = new THREE.CatmullRomCurve3([
  V(0, 3.4, 0),
  V(1.4, 4.4, 0.6),
  V(3.2, 4.0, 1.2),
  V(4.6, 2.0, 1.6),
]);
const vesselMat = real.glass(0xd8323c, { opacity: 0.3 });
const vesselMesh = new THREE.Mesh(new THREE.TubeGeometry(vessel, 80, 0.22, 20), vesselMat);
vesselMesh.userData.noAO = true;
scene.add(vesselMesh);
// path of the leftovers: muscle -> outhouse
const toKlo = new THREE.CatmullRomCurve3([
  V(4.6, 2.1, 1.6),
  V(0.5, 5.6, 1.2),
  V(-5.5, 4.0, -0.8),
  V(KLO.x + 0.6, 1.3, KLO.z + 0.9),
]);
// ring of the 20 kinds
const ring20 = [];
for (let j = 0; j < 20; j++) {
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.17, 32, 20), real.gloss(PAL[j]));
  scene.add(b);
  ring20.push(b);
}

const applyCamera = shotCamera(shots);

const show = (o, v) => {
  o.visible = v;
  return v;
};
// the shake: fast up/down + wobble, during the hook and the CTA
const shaking = (t) =>
  Math.max(
    1 - ramp(t, T.kaeserei + 0.25, T.kaeserei + 0.6),
    ramp(t, T.schoko - 0.1, T.schoko + 0.2),
  );

// ---------------------------------------------------------------- render
function renderAt(t) {
  // ---- shaker motion
  const sk = shaking(t);
  const ph = t * 17;
  shaker.position.set(0, sk * Math.abs(Math.sin(ph)) * 0.32, 0);
  shaker.rotation.set(sk * Math.sin(ph * 0.5) * 0.06, 0, sk * Math.sin(ph) * 0.13);
  // pouring the coins: tip towards +x
  const pour =
    smooth(ramp(t, T.pinkelst - 0.05, T.pinkelst + 0.35)) *
    (1 - smooth(ramp(t, T.kessel - 0.5, T.kessel)));
  tilt.rotation.z = -pour * 0.95;
  tilt.position.set(Math.sin(pour * 0.95) * 0.7, (1 - Math.cos(pour * 0.95)) * 0.3, 0);
  // liquid level + colour (Schoko / Vanille in the CTA)
  const level = 1.25;
  liquid.scale.y = level;
  liquid.position.y = 0.08 + level / 2;
  liquid.rotation.z = sk * Math.sin(ph + 1) * 0.12;
  const choc = t >= T.schoko - 0.05 && t < T.vanille ? 1 : 0;
  liquidMat.color.copy(VAN).lerp(CHOC, choc);
  dropMat.color.copy(liquidMat.color);
  ball.position.set(Math.sin(ph * 1.3) * 0.25 * sk, 0.4 + Math.abs(Math.sin(ph)) * 0.8 * sk, 0);
  // lid lifts off while powder goes in and while it overflows
  const lidOff = Math.max(
    smooth(ramp(t, T.pulver - 0.35, T.pulver)) * (1 - smooth(ramp(t, T.nur1 - 0.2, T.nur1))),
    smooth(ramp(t, T.fakt - 0.1, T.fakt + 0.2)) * (1 - ramp(t, T.schoko - 0.15, T.schoko - 0.05)),
  );
  lid.position.set(lidOff * 1.4, 2.0 + lidOff * 0.9, -lidOff * 0.6);
  lid.rotation.z = -lidOff * 0.7;
  lid.visible = lidOff < 0.98;

  // ---- hand (holds the shaker during the hook and the CTA)
  const grip = { pos: [0.95, 1.25, 0.05], rot: [0, 0, -1.57], pose: "grab" };
  const away = { pos: [2.4, 1.6, 0.6], rot: [0, 0, -1.57], pose: "open" };
  hand.track(t, [
    { t: -0.6, ...grip },
    { t: T.kaeserei + 0.3, ...grip },
    { t: T.kaeserei + 0.6, ...away, out: true },
    { t: T.schoko - 0.4, ...away },
    { t: T.schoko - 0.05, ...grip },
    { t: T.end + 1, ...grip },
  ]);

  // ---- droplets
  shaker.updateMatrixWorld(true);
  const sp = tilt.localToWorld(SPOUT.clone());
  drops.forEach((d) => {
    const u = d.userData;
    const f = (t * 1.6 + u.ph) % 1;
    const tt = f * 0.6;
    show(d, sk > 0.2 && f < 0.97);
    d.position.set(sp.x + u.vx * tt, sp.y + u.vy * tt - 4.9 * tt * tt, sp.z + u.vz * tt);
    d.scale.setScalar(0.6 + (1 - f) * 0.6);
  });

  // ---- coins
  coins.forEach((c) => {
    const u = c.userData;
    const a = T.pinkelst + 0.25 + u.d;
    if (!show(c, t >= a && t < T.kessel)) return;
    const f = clamp01((t - a) / 0.55);
    const p = sp.clone().lerp(u.land, f);
    p.y += Math.sin(f * Math.PI) * 0.9;
    c.position.copy(p);
    c.rotation.set(f < 1 ? (t - a) * u.spin : 0, 0, f < 1 ? (t - a) * u.spin * 0.7 : 0);
  });

  // ---- kettle: curds form, the rest turns yellow (Molke)
  milkMat.color
    .setHex(0xfbfaf4)
    .lerp(new THREE.Color(0xe6d97a), smooth(ramp(t, T.kaese + 0.3, T.molke + 0.4)));
  curds.forEach((c, i) => {
    const at = T.kaese + i * 0.035;
    if (!show(c, t >= at)) return;
    c.scale.copy(squash(t, at, 0.5));
    c.position.y = 1.88 + Math.sin(t * 2 + c.userData.ph) * 0.02;
  });

  // ---- pig drinks (head dips, ears wiggle, tail spins)
  const drink = pop(t, T.schweine - 0.2, T.pulver + 0.3);
  pigParts.head.rotation.x = 0.35 * drink * (0.6 + 0.4 * Math.abs(Math.sin(t * 6)));
  pigParts.ears.forEach((e, i) => (e.rotation.y = Math.sin(t * 9 + i * 2) * 0.25));
  pigParts.tail.rotation.z = Math.sin(t * 5) * 0.4;
  pig.position.y = Math.abs(Math.sin(t * 6)) * 0.02 * drink;

  // ---- scoop + powder into the shaker
  const sv = pop(t, T.pulver - 0.4, T.nur1);
  const sv2 = pop(t, T.fakt - 0.1, T.schoko - 0.1);
  const sAny = Math.max(sv, sv2);
  if (show(scoop, sAny > 0.01)) {
    const tip =
      sv > 0
        ? smooth(ramp(t, T.pulver - 0.1, T.pulver + 0.3))
        : 0.5 + 0.5 * Math.abs(Math.sin((t - T.fakt) * 3.2));
    scoop.position.set(-0.2, 3.5 + (1 - sAny) * 1.5 + (sv2 > 0 ? 0.9 : 0), 0.2);
    scoop.rotation.z = -tip * 2.1;
    scoop.scale.setScalar(Math.max(0.001, sAny));
  }
  const pourOn = Math.max(pop(t, T.pulver, T.nur1), pop(t, T.fakt + 0.1, T.schoko - 0.15));
  grains.forEach((g) => {
    const u = g.userData;
    const f = (t * 1.8 + u.ph) % 1;
    show(g, pourOn > 0.2);
    g.position.set(
      -0.05 + u.dx * (0.4 + f),
      (sv2 > 0 ? 4.2 : 3.3) - f * 1.3,
      0.2 + u.dz * (0.4 + f),
    );
  });
  // overflowing heap
  const grow = smooth(ramp(t, T.fakt + 0.2, T.gramm + 1.2));
  show(mound, grow > 0.01 && t < T.schoko - 0.1);
  show(spill, grow > 0.3 && t < T.schoko - 0.1);
  mound.scale.set(0.66 + grow * 0.14, 0.2 + grow * 0.85, 0.66 + grow * 0.14);
  mound.position.y = 2.02 + mound.scale.y / 2;
  const sp2 = clamp01((grow - 0.3) / 0.7);
  spill.scale.set(1, 0.05 + sp2 * 0.9, 1);
  spill.position.y = 2.05 - spill.scale.y / 2;

  // ---- muscle model
  const musIn = t >= T.nur1 + 0.05;
  show(muscle, musIn);
  show(dumbbell, t >= T.training && t < T.nimmt);
  if (musIn) {
    const s = squash(t, T.nur1 + 0.05, 0.6);
    const reps =
      t >= T.training && t < T.risse + 0.8 ? Math.abs(Math.sin((t - T.training) * 3.9)) : 0;
    const thick = 1 + 0.38 * smooth(ramp(t, T.dicker - 0.2, T.dicker + 0.5));
    muscle.scale.set(s.x * (1 - reps * 0.08), s.y, s.z);
    fibers.forEach((f) => f.scale.set(thick * (1 + reps * 0.12), 1, thick * (1 + reps * 0.12)));
    const glow =
      pop(t, T.dicker, T.nimmt + 0.2) * 0.5 +
      pop(t, T.nimmt, T.rest) * (0.4 + 0.3 * Math.sin(t * 8));
    fiberMat.emissiveIntensity = glow * 0.15;
    dumbbell.position.set(MUS.x + 0.4, 0.4 + reps * 1.0, MUS.z + 1.3);
    dumbbell.rotation.y = 0.35;
  }
  // tears glow from "Risse", fade while the beads fill them
  const tearK =
    smooth(ramp(t, T.risse, T.risse + 0.3)) * (1 - smooth(ramp(t, T.flicken + 0.3, T.dicker)));
  tears.forEach((r, i) => {
    show(r, tearK > 0.02);
    r.scale.setScalar(0.6 + 0.4 * tearK + Math.sin(t * 10 + i) * 0.05 * tearK);
  });
  tearMat.opacity = tearK;
  // powder ball bounces off + the X
  const bk = ramp(t, T.muskel1, T.muskel1 + 0.6);
  if (show(blob, t >= T.muskel1 && t < T.eiweiss)) {
    const hit = V(MUS.x - 1.0, MUS.y + 0.4, MUS.z);
    const from = V(0.3, 2.7, 0.2);
    const k = Math.min(bk / 0.6, 1);
    const p = from.clone().lerp(hit, k);
    p.y += Math.sin(k * Math.PI) * 0.8;
    if (bk > 0.6) p.add(V(-(bk - 0.6) * 2.2, -((bk - 0.6) ** 2) * 6, (bk - 0.6) * 1.5));
    blob.position.copy(p);
  }
  showNope(pop(t, T.muskel1 + 0.45, T.eiweiss), MUS.x, MUS.y + 1.2, MUS.z + 0.4, 0.8);

  // ---- the protein chain, cut, carried to the muscle, leftovers to the Klo
  const CUT = T.zerschneidet + 0.1;
  beads.forEach((b, i) => {
    let p = null;
    let s = 1;
    if (t >= T.eiweiss && t < T.blut) {
      const rise = smooth(ramp(t, T.eiweiss + i * 0.035, T.eiweiss + 0.6 + i * 0.035));
      p = V(0, 2.6, 0).lerp(chainPos[i], rise);
      // snip: the scissors run left -> right, each bead drifts free after it
      p.add(
        drift[i].clone().multiplyScalar(smooth(ramp(t, CUT + i * 0.035, CUT + i * 0.035 + 0.5))),
      );
      p.y += Math.sin(t * 2 + i) * 0.03;
      s = Math.max(0.02, rise);
    } else if (t >= T.blut && t < T.rate) {
      const f = clamp01((t - T.blut - 0.05 - i * 0.075) / 1.3);
      p = chainPos[i]
        .clone()
        .add(drift[i])
        .lerp(vessel.getPoint(f), smooth(clamp01(f / 0.15)));
      if (f >= 1) s = 0;
    } else if (t >= T.flicken - 0.2 && t < T.klo + 0.2) {
      if (i >= 10 && t >= T.rest - 0.1) {
        // the leftovers: off to the outhouse
        const f = clamp01(
          (t - T.rest + 0.1 - (i - 10) * 0.07) / Math.max(0.6, T.klo - T.rest + 0.1),
        );
        p = toKlo.getPoint(f);
        if (f >= 1) s = 0;
      } else if (t < T.nimmt) {
        const f = clamp01((t - T.flicken + 0.2 - i * 0.07) / 1.1);
        p = vessel.getPoint(f);
        if (f >= 1) s = 0;
      } else {
        // payoff wave: 10 go in, the rest wait next to the full muscle
        const f = clamp01((t - T.nimmt - i * 0.06) / 1.0);
        p = vessel.getPoint(f);
        if (f >= 1) {
          if (i < 10) s = 0;
          else p = V(3.7 + (i - 10) * 0.3, 2.7 + Math.sin(t * 4 + i) * 0.1, 1.9);
        }
      }
    }
    if (!p || s <= 0.01) return show(b, false);
    show(b, true);
    b.position.copy(p);
    b.scale.setScalar(s);
  });
  show(thread, t >= T.perlenkette - 0.1 && t < CUT + 0.25);
  // scissors
  const scV = pop(t, T.zerschneidet - 0.25, T.blut - 0.1);
  if (show(scissors, scV > 0.01)) {
    const run = smooth(ramp(t, CUT - 0.05, CUT + 0.75));
    scissors.position.set(-2.1 + run * 4.2, 3.62, 0.45);
    scissors.rotation.set(0.25, -0.3, -0.9);
    scissors.scale.setScalar(scV);
    const snip = 0.45 * Math.abs(Math.cos((t - CUT) * 14));
    blades.forEach(([arm, s]) => (arm.rotation.z = s * snip));
  }
  // vessel visible while the beads travel
  const vk = Math.max(pop(t, T.blut - 0.1, T.rate), pop(t, T.flicken - 0.3, T.rest + 0.2));
  show(vesselMesh, vk > 0.01);
  vesselMat.opacity = 0.3 * vk;
  // the 20 kinds on a ring
  ring20.forEach((b, j) => {
    const at = T.rate + 0.2 + j * 0.06;
    if (!show(b, t >= at && t < T.training)) return;
    const a = (j / 20) * Math.PI * 2 + t * 0.4;
    b.position.set(Math.cos(a) * 1.5, 3.4 + Math.sin(a) * 1.5, 0);
    b.scale.copy(squash(t, at, 0.45)).multiplyScalar(1 + 0.25 * pop(t, T.zwanzig, T.zwanzig + 0.5));
  });

  // ---- outhouse door: opens for the leftovers, slams shut
  const open =
    smooth(ramp(t, T.rest, T.rest + 0.4)) * (1 - outBack(ramp(t, T.klo + 0.1, T.klo + 0.3)));
  kloDoor.rotation.y = -1.9 * open;

  // ---- LED panel: one fact at a time
  if (t >= T.zwanzig && t < T.training)
    showPanel(pop(t, T.zwanzig, T.training), "SORTEN", "20", LED.green);
  else if (t >= T.gramm && t < T.schoko)
    showPanel(pop(t, T.gramm, T.schoko), "SINNVOLL BIS", "1,6 g/kg", LED.yellow);
  else showPanel(0);

  labels(t, LABELS);
  puff("musc", t, T.nur1 + 0.25, MUS.x, 0.1, MUS.z, 1.2);
  puff("klo", t, T.klo + 0.3, KLO.x + 0.6, 0.4, KLO.z + 1.0, 1.0);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
