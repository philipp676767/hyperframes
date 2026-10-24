// #29 "Schleudersitz": a pilot is shot out of his jet over the Alps.
// Story: hook — the seat bursts through the closed canopy, a rocket under it
// → you in the cockpit, bang, the engine burns → you pull the yellow handle
// → a detonating cord in the glass fires, the canopy bursts before your head
// hits it → x-ray replay: the charge, then the rocket (guess the weight: over
// a tonne) → zack, out → mid twist: it even works standing on the runway →
// mini chute, the seat lets you go, the main chute bangs open → two-seater:
// the rear seat goes first (else the front rocket grills it) → payoff: he
// pulls once, the seat does the rest alone in 3 s → bonus: 2 cm shorter →
// drone pull-back over the valley.
import {
  THREE,
  ramp,
  smooth,
  clamp01,
  lerp,
  outBack,
  pop,
  V,
  rng,
  scene,
  flat,
  facet,
  facetMat,
  xrayMaterial,
  setXray,
  showNope,
  labels,
  squash,
  puff,
  highlights,
  shotCamera,
  renderFrame,
  start,
} from "./world.js";
import "./set.js";
import { cloudPuffs } from "./environments.js";
import { createHand } from "./hand.js";
import { gauge, readout, meter, counter, stopwatch } from "./hud.js";
import { T, shots as SHOTS, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);

// reference points the shots / labels follow (updated every frame)
const JP = V(0, 50, 0); // the jet (in the air; on the runway in the mid twist)
const SP = V(0, 50, 0); // the seat / the pilot
const KP = V(-10, 52, -30); // the two-seater
const DP = V(0, 0, 0); // the mini chute
const REL = { J: JP, S: SP, K: KP, D: DP };
const shots = SHOTS.map((s) => (s.rel ? { ...s, rel: REL[s.rel] } : s));
const applyCamera = shotCamera(shots, 1);

const SEAT_S = 0.64; // seat + pilot scale in jet units
const AIR = V(0, 50, 0);
const GROUND = V(0, 0.86, 0);

// ---------------------------------------------------------------- materials
const fireCore = new THREE.MeshBasicMaterial({
  color: 0xfff1c2,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  fog: false,
});
const fireOuter = new THREE.MeshBasicMaterial({
  color: 0xff7a26,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  fog: false,
});
const coneDown = (r, h) => {
  const g = new THREE.ConeGeometry(r, h, 14, 1, true);
  g.rotateX(Math.PI);
  g.translate(0, -h / 2, 0);
  return g;
};
const glassMat = new THREE.MeshStandardMaterial({
  color: 0xa8dcff,
  transparent: true,
  opacity: 0.28,
  roughness: 0.04,
  metalness: 0.2,
  depthWrite: false,
  side: THREE.DoubleSide,
});
const shardMat = new THREE.MeshStandardMaterial({
  color: 0xd2efff,
  transparent: true,
  opacity: 0.75,
  roughness: 0.05,
  metalness: 0.3,
  emissive: 0x7fc8ff,
  emissiveIntensity: 0.35,
  side: THREE.DoubleSide,
});
const smokeMat = new THREE.MeshStandardMaterial({
  color: 0x34323a,
  roughness: 1,
  flatShading: true,
  transparent: true,
  depthWrite: false,
});

// ---------------------------------------------------------------- pilot
// Seated pilot in an olive flight suit, white helmet with a dark visor.
// Origin = seat origin (seat pan bottom), facing +x. Poses: sit / hang / stand.
function makePilot() {
  const g = new THREE.Group();
  const suit = flat(0x6b7a45, { roughness: 0.8 });
  const vest = flat(0x3b4230, { roughness: 0.8 });
  const glove = flat(0x3a3028, { roughness: 0.7 });
  const boot = flat(0x1e1e22, { roughness: 0.6 });
  const mats = [suit, vest, glove, boot];
  const torso = new THREE.Mesh(
    facet(new THREE.BoxGeometry(0.3, 0.52, 0.42), 0.05, 3),
    facetMat(suit),
  );
  torso.position.set(-0.12, 0.64, 0);
  torso.rotation.z = 0.12;
  g.add(torso);
  const vestM = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.3, 0.44), vest);
  vestM.position.set(-0.1, 0.72, 0);
  vestM.rotation.z = 0.12;
  g.add(vestM);
  // yellow life-vest collar
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.045, 6, 12), flat(0xf2c230));
  collar.rotation.x = Math.PI / 2;
  collar.position.set(-0.1, 0.93, 0);
  g.add(collar);
  const head = new THREE.Group();
  head.position.set(-0.1, 1.08, 0);
  const helmet = new THREE.Mesh(
    new THREE.SphereGeometry(0.17, 14, 10),
    flat(0xf2f2f0, { roughness: 0.35 }),
  );
  head.add(helmet);
  const visor = new THREE.Mesh(
    new THREE.SphereGeometry(0.172, 14, 8, Math.PI - 0.95, 1.9, 1.05, 0.75),
    flat(0x253040, { roughness: 0.08, metalness: 0.6 }),
  );
  visor.rotation.y = 0;
  head.add(visor);
  const mask = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.1, 8), flat(0x6d7178));
  mask.rotation.z = Math.PI / 2;
  mask.position.set(0.17, -0.07, 0);
  head.add(mask);
  const stripe = new THREE.Mesh(
    new THREE.TorusGeometry(0.171, 0.012, 4, 20, Math.PI),
    flat(0xff6a1a),
  );
  stripe.rotation.y = Math.PI / 2;
  head.add(stripe);
  g.add(head);
  const legs = [-1, 1].map((s) => {
    const hip = new THREE.Group();
    hip.position.set(-0.02, 0.38, s * 0.11);
    const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.15, 0.15), suit);
    thigh.position.x = 0.21;
    hip.add(thigh);
    const knee = new THREE.Group();
    knee.position.x = 0.42;
    hip.add(knee);
    const shin = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.42, 0.13), suit);
    shin.position.y = -0.21;
    knee.add(shin);
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.09, 0.14), boot);
    shoe.position.set(0.05, -0.44, 0);
    knee.add(shoe);
    g.add(hip);
    return { hip, knee };
  });
  const arms = [-1, 1].map((s) => {
    const sh = new THREE.Group();
    sh.position.set(-0.1, 0.86, s * 0.25);
    const up = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.3, 0.11), suit);
    up.position.y = -0.15;
    sh.add(up);
    const el = new THREE.Group();
    el.position.y = -0.3;
    sh.add(el);
    const fo = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.28, 0.1), suit);
    fo.position.y = -0.14;
    el.add(fo);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), glove);
    hand.position.y = -0.3;
    el.add(hand);
    g.add(sh);
    return { sh, el, s };
  });
  // the pulled ejection handle, kept in the right hand after the jump
  const kept = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.025, 6, 14, Math.PI), flat(0xffd21f));
  kept.position.y = -0.36;
  kept.rotation.x = Math.PI;
  kept.visible = false;
  arms[1].el.add(kept);
  g.traverse((o) => o.isMesh && (o.castShadow = true));
  const p = { g, legs, arms, head, mats, glow: 0, kept };
  p.pose = (name, k = 0) => {
    if (name === "sit") {
      legs.forEach((l) => {
        l.hip.rotation.z = 0;
        l.knee.rotation.z = 0;
      });
      arms.forEach((a) => {
        a.sh.rotation.set(0, 0, 0.25);
        a.el.rotation.set(0, 0, 0.9);
      });
    } else if (name === "hang") {
      // legs dangling, a little forward; hands up on the risers
      legs.forEach((l, i) => {
        l.hip.rotation.z = -1.3 + Math.sin(k * 1.3 + i) * 0.08;
        l.knee.rotation.z = 1.2;
      });
      arms.forEach((a) => {
        a.sh.rotation.set(a.s * -0.25, 0, 2.85);
        a.el.rotation.set(0, 0, 0.35);
      });
    } else {
      // stand (k = wave 0..1)
      legs.forEach((l) => {
        l.hip.rotation.z = -Math.PI / 2;
        l.knee.rotation.z = Math.PI / 2;
      });
      arms.forEach((a) => {
        const w = a.s > 0 ? k : 0;
        a.sh.rotation.set(a.s * -(0.12 + w * 2.2), 0, 0.05);
        a.el.rotation.set(a.s * -w * 0.4 * Math.sin(k * 0 + 1), 0, 0.15 + w * 0.3);
      });
    }
  };
  p.heat = (k) => {
    for (const m of [suit, vest]) {
      m.emissive = m.emissive || new THREE.Color();
      m.emissive.setHex(0xff3a0a);
      m.emissiveIntensity = 1.6 * k;
    }
  };
  p.pose("sit");
  return p;
}

// ---------------------------------------------------------------- seat
// Origin = seat pan bottom, facing +x. Back + headbox are x-ray shells; the
// catapult tube runs up the back, the rocket pack sits under the pan.
function makeSeat() {
  const g = new THREE.Group();
  const frame = flat(0x2d3036, { roughness: 0.5, metalness: 0.3 });
  const backMat = xrayMaterial(0x4f5866, { roughness: 0.55 });
  const headMat = xrayMaterial(0x30343b, { roughness: 0.5 });
  const pan = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.12, 0.58), frame);
  pan.position.set(0.0, 0.3, 0);
  g.add(pan);
  const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.06, 0.52), flat(0x5d6a3c));
  cushion.position.set(0.0, 0.38, 0);
  g.add(cushion);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.05, 0.6), backMat);
  back.position.set(-0.34, 0.8, 0);
  back.rotation.z = 0.1;
  g.add(back);
  const headbox = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.52), headMat);
  headbox.position.set(-0.38, 1.44, 0);
  g.add(headbox);
  // canopy breakers on top of the headbox
  for (const z of [-0.14, 0.14]) {
    const b = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.14, 5), frame);
    b.position.set(-0.32, 1.65, z);
    g.add(b);
  }
  // guide rails
  for (const z of [-0.26, 0.26]) {
    const r = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.45, 0.05), frame);
    r.position.set(-0.44, 0.78, z);
    g.add(r);
  }
  // catapult tube (seen in x-ray) + its charge at the bottom
  const tubeMat = flat(0x8b8f96, { emissive: 0xff7a1a, emissiveIntensity: 0, metalness: 0.5 });
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.25, 10), tubeMat);
  tube.position.set(-0.36, 0.72, 0);
  g.add(tube);
  // rocket pack under the pan + its nozzle
  const pack = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.16, 0.44),
    flat(0x3a3e45, { roughness: 0.45, metalness: 0.3 }),
  );
  pack.position.set(-0.04, 0.16, 0);
  g.add(pack);
  const nozMat = flat(0x2a2c30, { emissive: 0xff5a1a, emissiveIntensity: 0, metalness: 0.6 });
  const noz = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.1, 0.12, 10, 1, true), nozMat);
  noz.position.set(-0.04, 0.03, 0);
  g.add(noz);
  // yellow-black ejection handle between the legs
  const handle = new THREE.Group();
  handle.position.set(0.3, 0.42, 0);
  const yel = flat(0xffd21f, { roughness: 0.4 });
  const blk = flat(0x18181a);
  const loop = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 6, 14, Math.PI), yel);
  loop.rotation.y = Math.PI / 2;
  handle.add(loop);
  for (const a of [0.5, 1.57, 2.64]) {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.035, 8), blk);
    s.position.set(0, Math.sin(a) * 0.08, Math.cos(a) * 0.08);
    s.rotation.x = a;
    handle.add(s);
  }
  g.add(handle);
  // flame under the seat
  const flame = new THREE.Group();
  flame.position.set(-0.04, -0.02, 0);
  const outer = new THREE.Mesh(coneDown(0.17, 1), fireOuter);
  const core = new THREE.Mesh(coneDown(0.085, 1), fireCore);
  flame.add(outer, core);
  g.add(flame);
  const light = new THREE.PointLight(0xff9a40, 0, 14, 1.5);
  light.position.set(0, -0.3, 0);
  g.add(light);
  // mini chute (drogue): lines from the headbox to a small cone above-behind
  const drogue = new THREE.Group();
  drogue.position.set(-0.4, 1.55, 0);
  const dCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.32, 0.34, 10, 1, true),
    flat(0xff6a1a, { side: THREE.DoubleSide, roughness: 0.8 }),
  );
  dCone.position.set(-0.9, 1.3, 0);
  dCone.rotation.z = 0.6;
  drogue.add(dCone);
  const dLines = new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints([
      V(0, 0, 0),
      V(-0.95, 1.05, 0.25),
      V(0, 0, 0),
      V(-0.75, 1.2, -0.25),
      V(0, 0, 0),
      V(-1.1, 1.25, 0),
    ]),
    new THREE.LineBasicMaterial({ color: 0xf2f2f2 }),
  );
  drogue.add(dLines);
  g.add(drogue);
  g.traverse((o) => o.isMesh && (o.castShadow = true));
  g.scale.setScalar(SEAT_S);
  scene.add(g);
  return {
    g,
    xray: [backMat, headMat],
    tubeMat,
    nozMat,
    flame,
    outer,
    core,
    light,
    handle,
    drogue,
    dCone,
  };
}

// ---------------------------------------------------------------- jet
// Nose +x, ~7.4 long. Canopy over the cockpit; a sill keeps the pilot's
// lower body inside; two-seater: longer canopy, rear + front seat.
function makeJet(twin) {
  const g = new THREE.Group();
  const body = flat(0x9aa7b4, { roughness: 0.38, metalness: 0.25 });
  const dark = flat(0x535c68, { roughness: 0.4, metalness: 0.3 });
  const pts = [];
  const prof = [
    [3.9, 0],
    [3.5, 0.18],
    [3.0, 0.34],
    [2.3, 0.5],
    [1.4, 0.58],
    [0, 0.6],
    [-1.6, 0.58],
    [-2.8, 0.5],
    [-3.4, 0.44],
  ];
  for (const [x, r] of prof.slice().reverse()) pts.push(new THREE.Vector2(r, x));
  const fus = new THREE.Mesh(facet(new THREE.LatheGeometry(pts, 14), 0.04, 2), facetMat(body));
  fus.rotation.z = -Math.PI / 2;
  fus.rotation.y = 0;
  // lathe axis is y; turning by -90° about z puts it along +x
  g.add(fus);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.42, 12), dark);
  nose.rotation.z = -Math.PI / 2;
  nose.position.x = 3.92;
  g.add(nose);
  // cockpit sill + canopy
  const cx = twin ? 1.3 : 1.85;
  const cl = twin ? 1.55 : 1.0;
  const ch = twin ? 1.0 : 0.9;
  // hollow sill: four walls, a dark tub inside (you can look in from above)
  for (const [w, d, x, z] of [
    [cl * 2.05, 0.06, cx, 0.45],
    [cl * 2.05, 0.06, cx, -0.45],
    [0.06, 0.96, cx - cl * 1.0, 0],
    [0.06, 0.96, cx + cl * 1.0, 0],
  ]) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, 0.3, d), body);
    wall.position.set(x, 0.38, z);
    g.add(wall);
  }

  const canopyGeo = new THREE.SphereGeometry(1, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  canopyGeo.scale(cl, ch, 0.48);
  const canopy = new THREE.Mesh(canopyGeo, glassMat);
  canopy.position.set(cx, 0.53, 0);
  canopy.renderOrder = 2;
  g.add(canopy);
  const bow = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.025, 4, 24, Math.PI),
    flat(0x2a2d33, { roughness: 0.4 }),
  );
  bow.scale.set(0.48, ch, 1);
  bow.rotation.y = Math.PI / 2;
  bow.position.set(cx - cl * 0.55, 0.53, 0);
  g.add(bow);
  // instrument panel with screens and a red warning lamp
  const panel = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.26, 0.66), flat(0x22252b));
  panel.position.set(cx + cl * 0.72, 0.62, 0);
  panel.rotation.z = 0.5;
  g.add(panel);
  const scr = flat(0x58e08a, { emissive: 0x2fd46a, emissiveIntensity: 1.1 });
  for (const z of [-0.16, 0.16]) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.13, 0.2), scr);
    s.position.set(cx + cl * 0.72 - 0.06, 0.64, z);
    s.rotation.z = 0.5;
    g.add(s);
  }
  const warnMat = flat(0x5a1010, { emissive: 0xff2010, emissiveIntensity: 0 });
  const warn = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), warnMat);
  warn.position.set(cx + cl * 0.72 - 0.07, 0.78, 0);
  g.add(warn);
  // wings (delta), tail fin, stabilisers
  const wingShape = new THREE.Shape();
  wingShape.moveTo(1.2, 0);
  wingShape.lineTo(-1.9, 2.9);
  wingShape.lineTo(-2.6, 2.9);
  wingShape.lineTo(-2.6, 0);
  wingShape.lineTo(1.2, 0);
  for (const s of [-1, 1]) {
    const geo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.1, bevelEnabled: false });
    const w = new THREE.Mesh(facet(geo, 0.04, 5 + s), facetMat(body));
    w.rotation.x = s * (Math.PI / 2);
    w.position.set(0, s > 0 ? -0.05 : -0.15, 0);
    g.add(w);
    // orange wing tip
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.11, 0.12), flat(0xff6a1a));
    tip.position.set(-2.25, -0.1, s * 2.86);
    g.add(tip);
  }
  const finShape = new THREE.Shape();
  finShape.moveTo(-1.8, 0);
  finShape.lineTo(-3.1, 1.6);
  finShape.lineTo(-3.6, 1.6);
  finShape.lineTo(-3.4, 0);
  finShape.lineTo(-1.8, 0);
  const fin = new THREE.Mesh(
    facet(new THREE.ExtrudeGeometry(finShape, { depth: 0.09, bevelEnabled: false }), 0.04, 9),
    facetMat(body),
  );
  fin.position.set(0, 0.35, -0.045);
  g.add(fin);
  const finStripe = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.22, 0.1), flat(0xff6a1a));
  finStripe.position.set(-3.25, 1.6, 0);
  finStripe.rotation.z = -0.9;
  g.add(finStripe);
  // red warning triangle under the canopy (rescue sign)
  for (const s of [-1, 1]) {
    const tri = new THREE.Mesh(new THREE.CircleGeometry(0.16, 3), flat(0xe8202a));
    tri.position.set(cx - cl * 0.65, 0.2, s * 0.6);
    tri.rotation.set(0, s > 0 ? 0 : Math.PI, Math.PI / 2);
    g.add(tri);
  }
  // intakes
  for (const s of [-1, 1]) {
    const ia = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.42, 0.26), dark);
    ia.position.set(0.6, -0.05, s * 0.58);
    g.add(ia);
  }
  // engine nozzle + afterburner + fire
  const nozMat = flat(0x3c3f45, { emissive: 0xff5a1a, emissiveIntensity: 0, metalness: 0.6 });
  const noz = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.36, 0.5, 14, 1, true), nozMat);
  noz.rotation.z = Math.PI / 2;
  noz.position.x = -3.55;
  g.add(noz);
  const burner = new THREE.Group();
  burner.position.x = -3.8;
  burner.rotation.z = -Math.PI / 2; // cones point down → along -x
  const bOuter = new THREE.Mesh(
    coneDown(0.3, 1),
    new THREE.MeshBasicMaterial({
      color: 0x6fb8ff,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    }),
  );
  const bCore = new THREE.Mesh(coneDown(0.16, 1), fireCore);
  burner.add(bOuter, bCore);
  g.add(burner);
  // landing gear (only on the runway)
  const gear = new THREE.Group();
  const tyre = flat(0x1c1c20, { roughness: 0.8 });
  for (const [x, z] of [
    [2.6, 0],
    [-0.9, 0.7],
    [-0.9, -0.7],
  ]) {
    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6), dark);
    strut.position.set(x, -0.5, z);
    gear.add(strut);
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.12, 12), tyre);
    w.rotation.x = Math.PI / 2;
    w.position.set(x, -0.69, z);
    gear.add(w);
  }
  g.add(gear);
  g.traverse((o) => o.isMesh && o !== canopy && (o.castShadow = true));
  scene.add(g);
  return { g, canopy, bow, cx, cl, ch, warnMat, nozMat, burner, bOuter, gear };
}

// ---------------------------------------------------------------- the cast
const jet = makeJet(false);
const twin = makeJet(true);
const seat = makeSeat();
const pilot = makePilot();
pilot.g.scale.setScalar(SEAT_S);
scene.add(pilot.g);
const seatR = makeSeat(); // two-seater: rear
const seatF = makeSeat(); // two-seater: front
const pilotR = makePilot();
const pilotF = makePilot();
for (const p of [pilotR, pilotF]) {
  p.g.scale.setScalar(SEAT_S);
  scene.add(p.g);
}
const HOME = V(jet.cx, 0.3, 0); // seat origin in the jet (jet units)
const HOME_R = V(twin.cx - 0.55, 0.3, 0);
const HOME_F = V(twin.cx + 0.75, 0.3, 0);

// ---------------------------------------------------------------- detonating cord
// A zig-zag cord on the canopy (jet-local); the burn runs rear → front.
const CORD_N = 260;
const cordPts = [];
for (let k = 0; k <= CORD_N; k++) {
  const s = k / CORD_N;
  const sx = (s * 2 - 1) * 0.86;
  const phi = 0.78 * Math.sin(s * Math.PI * 9);
  const rr = Math.sqrt(1 - sx * sx);
  cordPts.push(
    V(
      jet.cx + jet.cl * sx,
      0.53 + jet.ch * rr * Math.cos(phi) * 1.012,
      0.48 * rr * Math.sin(phi) * 1.012,
    ),
  );
}
const cordCurve = new THREE.CatmullRomCurve3(cordPts);
const cordGeo = new THREE.TubeGeometry(cordCurve, CORD_N * 2, 0.006, 5);
const cordBase = new THREE.Mesh(cordGeo, flat(0xd9b27a, { roughness: 0.6 }));
jet.g.add(cordBase);
const cordBurnMat = new THREE.MeshBasicMaterial({ color: 0xffe08a, fog: false });
const cordBurn = new THREE.Mesh(
  new THREE.TubeGeometry(cordCurve, CORD_N * 2, 0.016, 5),
  cordBurnMat,
);
jet.g.add(cordBurn);
const spark = new THREE.Mesh(
  new THREE.SphereGeometry(0.06, 10, 8),
  new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }),
);
jet.g.add(spark);
const sparkLight = new THREE.PointLight(0xffc060, 0, 4, 1.6);
spark.add(sparkLight);

// ---------------------------------------------------------------- glass shards
// Triangles cut from the canopy surface; they burst outward + up, the
// airstream sweeps them back (in the air) or they fall (on the runway).
function makeShards(j, n, seed) {
  const r = rng(seed);
  const list = [];
  for (let i = 0; i < n; i++) {
    const sx = (r() * 2 - 1) * 0.9;
    const phi = (r() * 2 - 1) * 1.3;
    const rr = Math.sqrt(1 - sx * sx);
    const p0 = V(j.cx + j.cl * sx, 0.53 + j.ch * rr * Math.cos(phi), 0.48 * rr * Math.sin(phi));
    const s = 0.08 + r() * 0.16;
    const geo = new THREE.BufferGeometry().setFromPoints([
      V(0, 0, 0),
      V(s, r() * s * 0.4, s * 0.3),
      V(s * 0.3, s * (0.6 + r() * 0.5), -s * 0.2),
    ]);
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, shardMat);
    const out = V(sx * 0.4, Math.cos(phi) * 1.0 + 0.3, Math.sin(phi) * 1.1).normalize();
    m.userData = {
      p0,
      v: out.multiplyScalar(2 + r() * 4),
      spin: V(r() * 9, r() * 9, r() * 9),
    };
    m.visible = false;
    j.g.add(m);
    list.push(m);
  }
  return list;
}
const shards = makeShards(jet, 46, 5);
const shardsR = makeShards(twin, 30, 9);
function animShards(list, k, air) {
  for (const m of list) {
    m.visible = k > 0 && k < 3.2;
    if (!m.visible) continue;
    const u = m.userData;
    m.position.copy(u.p0).addScaledVector(u.v, k);
    if (air) m.position.x -= 4.5 * k * k;
    else m.position.y -= 4.9 * k * k;
    m.rotation.set(u.spin.x * k, u.spin.y * k, u.spin.z * k);
  }
}

// ---------------------------------------------------------------- engine fire + smoke
const fireGroup = new THREE.Group();
jet.g.add(fireGroup);
fireGroup.position.set(-3.75, 0, 0);
const fireBalls = [];
{
  const r = rng(31);
  const geo = new THREE.IcosahedronGeometry(1, 0);
  const cols = [0xfff0b0, 0xffb040, 0xff6a1a, 0xff3a10];
  for (let i = 0; i < 14; i++) {
    const m = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({ color: cols[i % 4], transparent: true, depthWrite: false }),
    );
    m.userData = { ph: i / 14, y: (r() - 0.5) * 0.5, z: (r() - 0.5) * 0.5 };
    fireGroup.add(m);
    fireBalls.push(m);
  }
}
const smoke = [];
for (let i = 0; i < 26; i++) {
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), smokeMat);
  m.userData.ph = i / 26;
  jet.g.add(m);
  smoke.push(m);
}
const fireLight = new THREE.PointLight(0xff7a30, 0, 18, 1.4);
fireLight.position.set(-4, 0.4, 0);
jet.g.add(fireLight);
function engineFire(k, t) {
  fireGroup.visible = k > 0.01;
  fireLight.intensity = 30 * k;
  for (const m of fireBalls) {
    const u = m.userData;
    const ph = (t * 1.6 + u.ph) % 1;
    m.position.set(-ph * 2.6, u.y + ph * 0.5, u.z * (1 + ph));
    m.scale.setScalar(Math.max(0.001, k * (0.25 + ph * 0.45) * (1 - ph * 0.6)));
    m.material.opacity = 0.9 * (1 - ph);
  }
  smokeMat.opacity = 0.75 * k;
  for (const m of smoke) {
    m.visible = k > 0.01;
    if (!m.visible) continue;
    const ph = (t * 0.55 + m.userData.ph) % 1;
    const a = m.userData.ph * 23;
    m.position.set(-4.3 - ph * 14, 0.3 + ph * 1.6 + Math.sin(a) * 0.3, Math.cos(a) * (0.3 + ph));
    m.scale.setScalar(Math.max(0.001, k * (0.35 + ph * 1.6)));
  }
}

// ---------------------------------------------------------------- speed: streaks + clouds rushing past
const streakMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.4,
  depthWrite: false,
  fog: false,
});
const streaks = [];
{
  const r = rng(44);
  for (let i = 0; i < 22; i++) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(2.6 + r() * 2, 0.016, 0.016), streakMat);
    m.userData = { y: (r() - 0.5) * 7, z: -2 - r() * 6, ph: r() };
    scene.add(m);
    streaks.push(m);
  }
}
const wisps = [];
{
  const mat = facetMat(
    new THREE.MeshStandardMaterial({
      color: 0xfff4ee,
      emissive: 0xffc8b8,
      emissiveIntensity: 0.3,
      roughness: 1,
      flatShading: true,
      transparent: true,
      opacity: 0.85,
    }),
  );
  [
    [-7, -14, 0],
    [5, -22, 0.4],
    [-11, 6, 0.75],
  ].forEach(([y, z, ph], i) => {
    const g = new THREE.Group();
    cloudPuffs(g, 4, 1.8, mat, 70 + i * 3);
    g.userData = { y, z, ph };
    scene.add(g);
    wisps.push(g);
  });
}
function speed(k, t, ref) {
  for (const m of streaks) {
    m.visible = k > 0.01;
    if (!m.visible) continue;
    const u = m.userData;
    const ph = (t * 1.6 + u.ph) % 1;
    m.position.set(ref.x + 16 - ph * 32, ref.y + u.y, ref.z + u.z);
  }
  streakMat.opacity = 0.4 * k;
  for (const g of wisps) {
    g.visible = k > 0.01;
    if (!g.visible) continue;
    const u = g.userData;
    const ph = (t * 0.22 + u.ph) % 1;
    g.position.set(ref.x + 70 - ph * 140, ref.y + u.y, ref.z + u.z);
  }
}

// ---------------------------------------------------------------- main chute
// Orange-white canopy (12 gores) on lines to the pilot's shoulders.
const CH_H = 3.0;
const CH_R = 1.9;
const chute = new THREE.Group();
scene.add(chute);
const canopyG = new THREE.Group();
canopyG.position.y = CH_H;
chute.add(canopyG);
{
  const n = 12;
  for (let i = 0; i < n; i++) {
    const geo = new THREE.SphereGeometry(
      1,
      4,
      6,
      (i / n) * Math.PI * 2,
      (Math.PI * 2) / n,
      0,
      Math.PI / 2.3,
    );
    geo.scale(CH_R, CH_R * 0.62, CH_R);
    const m = new THREE.Mesh(
      geo,
      flat(i % 2 ? 0xffffff : 0xff6a1a, {
        side: THREE.DoubleSide,
        roughness: 0.85,
        emissive: i % 2 ? 0xfff4ea : 0xff6a1a,
        emissiveIntensity: 0.28,
      }),
    );
    m.castShadow = true;
    canopyG.add(m);
  }
}
const chuteLineGeo = new THREE.BufferGeometry();
chuteLineGeo.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(new Float32Array(12 * 6), 3),
);
const chuteLines = new THREE.LineSegments(
  chuteLineGeo,
  new THREE.LineBasicMaterial({ color: 0xf0eee8 }),
);
chute.add(chuteLines);
function setChute(k, pos, sway) {
  chute.visible = k > 0.001;
  if (!chute.visible) return;
  chute.position.copy(pos);
  chute.rotation.z = sway;
  const open = Math.max(0.05, k);
  canopyG.scale.set(open, Math.max(0.3, Math.min(1.15, k * 1.1)), open);
  canopyG.position.y = CH_H * (0.55 + 0.45 * Math.min(1, k));
  const a = chuteLineGeo.attributes.position;
  const rimY = canopyG.position.y + CH_R * 0.62 * Math.cos(Math.PI / 2.3) * canopyG.scale.y;
  const rimR = CH_R * Math.sin(Math.PI / 2.3) * open;
  for (let i = 0; i < 12; i++) {
    const ang = (i / 12) * Math.PI * 2;
    const sz = i < 6 ? -0.18 : 0.18;
    a.setXYZ(i * 2, -0.07, 0.62, sz);
    a.setXYZ(i * 2 + 1, Math.cos(ang) * rimR, rimY, Math.sin(ang) * rimR);
  }
  a.needsUpdate = true;
}

// ---------------------------------------------------------------- ghost car ("über eine Tonne")
const ghostCar = new THREE.Group();
scene.add(ghostCar);
{
  const gm = new THREE.MeshStandardMaterial({
    color: 0x8fd3ff,
    transparent: true,
    opacity: 0.5,
    roughness: 0.2,
    depthWrite: false,
    emissive: 0x3a8fd0,
    emissiveIntensity: 0.4,
  });
  const lm = new THREE.LineBasicMaterial({ color: 0xe0f4ff });
  const add = (geo, x, y, z) => {
    const m = new THREE.Mesh(geo, gm);
    m.position.set(x, y, z);
    ghostCar.add(m);
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo), lm);
    e.position.copy(m.position);
    ghostCar.add(e);
  };
  add(new THREE.BoxGeometry(1.5, 0.32, 0.72), 0, 0.3, 0);
  add(new THREE.BoxGeometry(0.8, 0.28, 0.66), -0.08, 0.6, 0);
  for (const [x, z] of [
    [0.48, 0.36],
    [0.48, -0.36],
    [-0.48, 0.36],
    [-0.48, -0.36],
  ]) {
    const w = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 12);
    w.rotateX(Math.PI / 2);
    add(w, x, 0.15, z);
  }
}

// ---------------------------------------------------------------- measuring stick (bonus fact)
const STAND = V(0.4, 0, 5.4); // where the pilot stands after landing
const stick = new THREE.Group();
scene.add(stick);
{
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 1.5, 0.04),
    flat(0xf6f2e8, { roughness: 0.6 }),
  );
  board.position.y = 0.75;
  stick.add(board);
  for (let k = 1; k < 15; k++) {
    const mk = new THREE.Mesh(
      new THREE.BoxGeometry(k % 5 ? 0.06 : 0.12, 0.012, 0.045),
      flat(k % 5 ? 0x222222 : 0xe8202a),
    );
    mk.position.set(-0.04 + (k % 5 ? 0 : 0.03), k * 0.1, 0.002);
    stick.add(mk);
  }
  stick.traverse((o) => o.isMesh && (o.castShadow = true));
  stick.position.set(STAND.x + 0.45, 0, STAND.z - 0.05);
}
const oldHead = new THREE.Mesh(
  new THREE.BoxGeometry(0.42, 0.02, 0.06),
  new THREE.MeshBasicMaterial({ color: 0xff3a2a }),
);
scene.add(oldHead);
// the chute lying on the meadow behind him
const flatChute = new THREE.Mesh(
  new THREE.SphereGeometry(1, 12, 4, 0, Math.PI * 2, 0, Math.PI / 2),
  flat(0xff6a1a, { roughness: 0.9 }),
);
flatChute.scale.set(1.5, 0.14, 1.0);
flatChute.position.set(STAND.x - 2.4, 0.02, STAND.z - 1.4);
scene.add(flatChute);

// the viewer's hand (gloved) pulls the yellow handle
const hand = createHand({ skin: 0x3a3028, sleeve: 0x6b7a45, scale: 0.32 });

// ---------------------------------------------------------------- ejection profile
// Height of the seat above its home for u seconds after the catapult fires:
// catapult (0.15 s up the rails), then the rocket; drag pulls it back.
const yEj = (u) =>
  u <= 0 ? 0 : u < 0.15 ? 0.8 * (u / 0.15) ** 2 : 0.8 + 9 * (1 - Math.exp(-2.2 * (u - 0.15)));
const xEj = (u, air) => (air ? -6 * (1 - Math.exp(-0.3 * Math.max(0, u - 0.08) ** 2)) : 0);
const pitch = (u) => -0.35 * (1 - Math.exp(-1.5 * Math.max(0, u)));
const burnOf = (u) => (u > 0.15 && u < 0.62 ? smooth(clamp01((u - 0.15) / 0.04)) : 0);

// ---------------------------------------------------------------- the story as a pure function of time
// Returns what happens to the single-seat jet, the seat and the pilot.
function story(t) {
  const s = {
    jetVis: true,
    jetPos: AIR,
    gear: false,
    flying: true,
    canopy: true,
    shardK: -1,
    shardAir: true,
    cord: 0,
    cordBurn: -1,
    fire: 0,
    warn: 0,
    u: -1, // ejection time (seat), -1 = at home
    air: true,
    xray: 0,
    catGlow: 0,
    seatFree: null, // world position when the seat flies on its own
    seatVis: true,
    pilotOn: true, // pilot sits in the seat
    pilotPos: null,
    chute: 0,
    drogue: 0,
    speed: 1,
  };
  if (t < T.stell) {
    // hook: the ejection in slow motion (the canopy has just burst)
    s.u = 0.02 + t * 0.12;
    s.canopy = false;
    s.shardK = (s.u + 0.05) * 1.6;
    s.fire = 1;
    s.cord = 1;
    if (t >= T.und) s.u = 0.6 + (t - T.und) * 0.35; // wide: the seat high above
  } else if (t < T.verrueckte) {
    s.fire = smooth(ramp(t, T.knall1, T.knall1 + 0.3));
    s.warn = t >= T.knall1 ? (Math.sin(t * 14) > 0 ? 1 : 0.15) : 0;
    s.cord = 1;
    if (t >= T.zuendet2 + 0.1 && t < T.shatter)
      s.cordBurn = ramp(t, T.zuendet2 + 0.1, T.zuendet2 + 1.3);
    if (t >= T.shatter && t < T.unter2) {
      s.canopy = false;
      const slow = 0.16;
      s.shardK = (t - T.shatter) * slow * 2.2;
      s.u = t < T.eject ? -1 : (t - T.eject) * slow;
      if (t >= T.folg) s.u = (T.folg - T.eject) * slow + (t - T.folg) * 0.06;
    } else if (t >= T.unter2 && t < T.zack) {
      // x-ray replay: the charge, then the rocket — slow
      s.canopy = false;
      s.shardK = -1;
      s.xray = smooth(ramp(t, T.unter2, T.unter2 + 0.4));
      s.u = t < T.cat ? -0.001 : (t - T.cat) * 0.13;
      s.catGlow = t >= T.cat ? Math.max(0, 1 - (t - T.cat) / 1.2) : 0;
    } else if (t >= T.zack) {
      // zack: out, the jet falls away below
      s.canopy = false;
      s.xray = 0;
      s.u = 0.62 + (t - T.zack) * 1.3;
    }
  } else if (t < T.ein2) {
    // mid twist: zero-zero on the runway
    s.jetPos = GROUND;
    s.gear = true;
    s.flying = false;
    s.air = false;
    s.fire = 0;
    s.cord = 1;
    if (t >= T.groundEject) {
      s.canopy = false;
      s.shardAir = false;
      s.shardK = t - T.groundEject;
      s.u = t - T.groundEject - 0.05;
      // the chute opens high up; seat + pilot hang under it
      const ch = ramp(t, T.groundEject + 0.95, T.groundEject + 1.35);
      if (ch > 0) {
        const top = HOME.y + yEj(1.0);
        s.u = 1.0;
        s.seatFree = V(HOME.x, top - 0.55 * (t - T.groundEject - 0.95), 0).add(GROUND);
        s.chute = outBack(ch);
      }
    }
  } else {
    // back in the air: mini chute, release, main chute — the jet is gone
    s.jetVis = false;
    s.canopy = false;
    s.u = 3;
  }
  return s;
}

// where the seat / pilot hang in the air after "Zack" (world)
const HANG = V(-4, 59, 0);

const tmpLabels = LABELS.map((l) => ({ ...l }));
const v1 = V(0, 0, 0);

// ---------------------------------------------------------------- render
function renderAt(t) {
  const s = story(t);
  const bob = s.flying ? Math.sin(t * 1.1) * 0.06 : 0;

  // ---- jet
  jet.g.visible = s.jetVis && !(t >= T.im2 && t < T.fakt);
  JP.copy(s.jetPos);
  JP.y += bob;
  // after "zack" the jet drops away below the seat
  if (t >= T.zack && t < T.verrueckte) JP.y -= 2.2 * (t - T.zack) ** 2;
  jet.g.position.copy(JP);
  jet.g.rotation.x = s.flying ? Math.sin(t * 0.7) * 0.03 : 0;
  jet.gear.visible = s.gear;
  jet.canopy.visible = s.canopy;
  jet.bow.visible = s.canopy;
  jet.warnMat.emissiveIntensity = 2.2 * s.warn;
  jet.burner.visible = s.flying && s.jetVis;
  jet.burner.scale.set(1, 0.9 + 0.15 * Math.sin(t * 40), 1);
  engineFire(s.jetVis && s.flying ? s.fire : 0, t);
  jet.nozMat.emissiveIntensity = 1.2 * s.fire;
  animShards(shards, s.jetVis ? s.shardK : -1, s.shardAir);

  // the cord: dull before, burning front during "zündet", gone with the glass
  cordBase.visible = s.canopy && s.jetVis;
  cordBurn.visible = s.cordBurn > 0 && s.canopy;
  spark.visible = cordBurn.visible;
  if (cordBurn.visible) {
    const segs = Math.ceil(s.cordBurn * CORD_N * 2);
    cordBurn.geometry.setDrawRange(0, segs * 5 * 6);
    spark.position.copy(cordCurve.getPointAt(Math.min(1, s.cordBurn)));
    spark.scale.setScalar(1 + 0.4 * Math.sin(t * 60));
    sparkLight.intensity = 6;
  }

  // ---- seat + pilot (single seat)
  let seatPos;
  const u = s.u;
  if (s.seatFree) {
    seatPos = s.seatFree;
  } else if (t >= T.ein2) {
    seatPos = HANG.clone();
  } else {
    seatPos = V(HOME.x + xEj(u, s.air), HOME.y + yEj(u), 0)
      .multiplyScalar(1)
      .add(JP);
    if (t >= T.zack && t < T.verrueckte) seatPos.y += 2.2 * (t - T.zack) ** 2; // undo the jet drop
  }
  seat.g.visible = s.seatVis && s.jetVis !== false;
  seat.g.position.copy(seatPos);
  seat.g.rotation.set(0, 0, u > 0 && !s.seatFree ? pitch(u) : 0);
  const burn = s.seatFree ? 0 : burnOf(u);
  seat.flame.visible = burn > 0.01;
  const fl = 0.85 + 0.15 * Math.sin(t * 47) * Math.sin(t * 31.7);
  seat.flame.scale.set(burn, burn * 1.5 * fl, burn);
  seat.light.intensity = 25 * burn;
  seat.nozMat.emissiveIntensity = 1.5 * burn;
  seat.tubeMat.emissiveIntensity = 2.5 * s.catGlow;
  setXray(seat.xray, s.xray);
  seat.drogue.visible = false;
  seat.handle.position.y =
    0.42 + (t >= T.griff && t < T.stell + 30 ? 0.12 * smooth(ramp(t, T.griff, T.griff + 0.25)) : 0);
  if (t < T.stell) seat.handle.position.y = 0.54;
  puff("cat", t, T.cat, seatPos.x - 0.3, seatPos.y - 0.1, 0, 0.7);

  // after "Zack": the seat in the air with the mini chute, release, main chute
  let pilotPos = seatPos;
  let pilotRot = seat.g.rotation.z;
  let chuteK = s.chute;
  if (t >= T.ein2) {
    const hang = HANG.clone();
    hang.y += Math.sin(t * 0.9) * 0.05;
    const dr = outBack(ramp(t, T.drogue, T.drogue + 0.35));
    seat.drogue.visible = dr > 0 && t < T.dein3 + 0.6;
    seat.drogue.scale.setScalar(Math.max(0.001, dr));
    seat.dCone.rotation.y = Math.sin(t * 7) * 0.2;
    // release: the seat falls away and tumbles
    const fall = Math.max(0, t - T.release);
    const seatAt = hang.clone();
    seatAt.y -= 4.9 * 0.5 * fall * fall;
    seatAt.x -= fall * 0.6;
    seat.g.position.copy(seatAt);
    seat.g.rotation.set(fall * 1.3, 0, -0.2 - fall * 2.2 + Math.sin(t * 3) * 0.05);
    seat.g.visible = t < T.im2 && seatAt.y > HANG.y - 25;
    // the pilot: stays, the chute opens, then drifts down
    const ck = ramp(t, T.chute, T.chute + 0.45);
    chuteK = t >= T.chute ? outBack(ck) : 0;
    pilotPos = hang.clone();
    if (fall > 0) pilotPos.y -= 0.6 * Math.min(fall, 1) ** 2 + Math.max(0, t - T.chute) * 0.32;
    pilotRot = t < T.release ? seat.g.rotation.z : Math.sin(t * 0.9) * 0.08;
    if (t < T.release) seat.g.rotation.set(0, 0, -0.15 + Math.sin(t * 2) * 0.05);
  }
  SP.copy(t >= T.release ? pilotPos : seat.g.position);
  pilot.g.visible = seat.g.visible || (t >= T.release && t < T.im2) || (t >= T.so && t < T.fakt);
  pilot.g.position.copy(pilotPos);
  pilot.g.rotation.set(0, 0, pilotRot);
  if (t >= T.release || s.chute > 0) pilot.pose("hang", t);
  else pilot.pose("sit");
  if (s.chute > 0 && t < T.ein2) {
    pilot.g.position.copy(seatPos);
    pilot.pose("sit");
  }

  // payoff: hanging under the chute over the valley
  if (t >= T.so && t < T.fakt) {
    const pp = HANG.clone();
    pp.y -= 3 + (t - T.so) * 0.3;
    pp.x += (t - T.so) * 0.15;
    pilot.g.position.copy(pp);
    pilot.g.rotation.set(0, Math.sin(t * 0.4) * 0.2, Math.sin(t * 0.9) * 0.06);
    pilot.pose("hang", t);
    SP.copy(pp);
    pilot.kept.visible = true;
    chuteK = 1;
  }
  if (t >= T.im2 && t < T.so) chuteK = 0;
  if (t >= T.fakt) chuteK = 0;
  setChute(chuteK, t >= T.release || t >= T.so ? pilot.g.position : seatPos, pilot.g.rotation.z);
  if (s.chute > 0 && t < T.ein2) setChute(s.chute, seatPos, 0);

  if (!(t >= T.so && t < T.fakt)) pilot.kept.visible = false;
  // ---- bonus fact + CTA: standing on the meadow
  const onGround = t >= T.fakt;
  stick.visible = onGround;
  flatChute.visible = onGround;
  oldHead.visible = onGround && t >= T.zentimeter - 0.2 && t < T.cta;
  if (onGround) {
    pilot.g.visible = true;
    pilot.g.position.copy(STAND);
    pilot.g.rotation.set(0, -0.45, 0);
    const wave =
      t >= T.cta
        ? Math.min(1, ramp(t, T.cta + 0.2, T.cta + 0.6)) * (0.75 + 0.25 * Math.sin((t - T.cta) * 7))
        : 0;
    pilot.pose("stand", wave);
    // stand pose: hips at y 0.38 local → lift so the boots touch the ground
    pilot.g.position.y = (0.42 + 0.44 - 0.38) * SEAT_S;
    const shrink = 1 - 0.022 * smooth(ramp(t, T.zentimeter, T.zentimeter + 0.5));
    pilot.g.scale.set(SEAT_S, SEAT_S * shrink, SEAT_S);
    oldHead.position.set(stick.position.x - 0.12, 1.25 * SEAT_S + pilot.g.position.y, STAND.z);
    SP.copy(pilot.g.position);
  } else {
    pilot.g.scale.setScalar(SEAT_S);
  }

  // ---- the viewer's hand pulls the handle
  v1.set(HOME.x + 0.3 * SEAT_S, HOME.y + 0.45 * SEAT_S, 0).add(JP);
  hand.track(t, [
    { t: T.ziehst - 0.4, pos: [v1.x + 0.5, v1.y + 0.25, 0.55], rot: [0.4, -2.3, 0], pose: "open" },
    { t: T.griff - 0.1, pos: [v1.x + 0.08, v1.y + 0.02, 0.08], rot: [0.5, -2.3, 0], pose: "grab" },
    { t: T.griff + 0.25, pos: [v1.x + 0.08, v1.y + 0.12, 0.08], rot: [0.3, -2.3, 0], pose: "fist" },
    {
      t: T.kein - 0.05,
      pos: [v1.x + 0.08, v1.y + 0.13, 0.08],
      rot: [0.3, -2.3, 0],
      pose: "fist",
      out: true,
    },
  ]);

  // ---- two-seater: rear first, then front; then the wrong order
  const twinOn = t >= T.im2 && t < T.so;
  twin.g.visible = twinOn;
  for (const o of [seatR, seatF, pilotR, pilotF]) o.g.visible = twinOn;
  if (twinOn) {
    KP.set(-10, 52 + Math.sin(t * 1.1) * 0.06, -30);
    twin.g.position.copy(KP);
    twin.burner.visible = true;
    const wrong = t >= T.sonst;
    const rearAt = wrong ? T.wrong + 0.55 : T.rear;
    const frontAt = wrong ? T.wrong : T.front;
    const sp = wrong ? 0.32 : 0.6;
    const uR = (t - rearAt) * sp;
    const uF = (t - frontAt) * sp;
    twin.canopy.visible = !(t >= Math.min(rearAt, frontAt) - 0.05);
    twin.bow.visible = twin.canopy.visible;
    animShards(shardsR, t - Math.min(rearAt, frontAt) + 0.05, true);
    const place = (st, p, home, uu, side) => {
      const pos = V(
        home.x + xEj(uu, true) * 0.6,
        home.y + yEj(uu),
        side * 1.3 * Math.max(0, uu) ** 0.7,
      ).add(KP);
      st.g.position.copy(pos);
      st.g.rotation.set(-side * 0.25 * clamp01(uu * 3), 0, uu > 0 ? pitch(uu) : 0);
      const b = burnOf(uu);
      st.flame.visible = b > 0.01;
      st.flame.scale.set(b, b * 1.5 * fl, b);
      st.light.intensity = 25 * b;
      st.drogue.visible = false;
      setXray(st.xray, 0);
      p.g.position.copy(pos);
      p.g.rotation.copy(st.g.rotation);
      p.pose("sit");
    };
    place(seatR, pilotR, HOME_R, uR, -1);
    place(seatF, pilotF, HOME_F, uF, 1);
    // the wrong order: the front rocket's flame sweeps back over the rear pilot
    const grill = wrong ? smooth(ramp(t, T.wrong + 0.05, T.wrong + 0.35)) : 0;
    pilotR.heat(grill * (0.6 + 0.4 * Math.sin(t * 30)));
    if (wrong) {
      seatF.flame.rotation.z = -1.1 * grill;
      seatF.flame.scale.y *= 1 + 1.6 * grill;
    } else seatF.flame.rotation.z = 0;
    showNope(wrong ? pop(t, T.wrong + 0.5, T.so) : 0, KP.x + HOME_R.x, KP.y + 1.9, KP.z + 0.6, 0.8);
  } else {
    pilotR.heat(0);
  }

  // ---- speed streaks + clouds rushing past while flying
  const fly = (t < T.verrueckte && s.jetVis) || (t >= T.im2 && t < T.so);
  speed(fly ? 1 : 0, t, t >= T.im2 && t < T.so ? KP : JP);

  // ---- ghost car on your lap ("über eine Tonne")
  ghostCar.visible = t >= T.tonne - 0.1 && t < T.zack;
  if (ghostCar.visible) {
    ghostCar.position.set(seatPos.x + 0.05, seatPos.y + 0.75, seatPos.z);
    ghostCar.rotation.set(0, 0, seat.g.rotation.z);
    ghostCar.scale.copy(squash(t, T.tonne - 0.1)).multiplyScalar(0.62);
  }

  // ---- device displays (max two at once)
  if (t >= T.knall1 + 0.3 && t < T.ziehst) {
    readout("warn", pop(t, T.knall1 + 0.3, T.ziehst), {
      label: "Triebwerk",
      value: "FEUER",
      color: "#ff4a3a",
      x: 60,
      y: 1130,
    });
  }
  if (t >= T.rate && t < T.zack) {
    const g = lerp(1, 15, smooth(ramp(t, T.rate + 0.2, T.tonne + 0.1)));
    gauge("g", pop(t, T.rate + 0.1, T.zack), {
      label: "Beschleunigung",
      value: Math.round(g),
      max: 20,
      unit: "g",
      x: 640,
      y: 1080,
    });
    counter("kg", pop(t, T.rate + 0.3, T.zack), {
      label: "Du wiegst",
      value: `${Math.round(lerp(80, 1200, smooth(ramp(t, T.rate + 0.4, T.tonne + 0.1))) / 10) * 10} kg`,
      x: 60,
      y: 1110,
    });
  }
  if (t >= T.groundEject + 0.1 && t < T.ein2) {
    const h = smooth(ramp(t, T.groundEject + 0.1, T.groundEject + 1.0));
    meter("hoch", pop(t, T.groundEject + 0.1, T.ein2), {
      label: "Höhe für den Schirm",
      value: h,
      color: h >= 1 ? "#4cd964" : "#ffd23f",
      text: h >= 1 ? "reicht ✓" : "",
      x: 60,
      y: 1130,
    });
  }
  if (t >= T.den2 && t < T.fakt) {
    stopwatch("sw", pop(t, T.den2, T.fakt), {
      seconds: 3 * smooth(ramp(t, T.den2 + 0.3, T.sekunden ?? T.drei + 0.5)),
      max: 3,
      label: "Vom Griff bis zum Schirm",
      x: 640,
      y: 1110,
    });
  }
  if (t >= T.fakt + 0.6 && t < T.cta) {
    const cm = t >= T.zentimeter ? 178 : 180;
    readout("gr", pop(t, T.fakt + 0.6, T.cta), {
      label: "Deine Größe",
      value: `1,${cm - 100}`,
      unit: "m",
      note: t >= T.zentimeter ? "− 2 cm" : "",
      color: t >= T.zentimeter ? "#ff6a4a" : "#ffd23f",
      x: 60,
      y: 1130,
    });
  }

  // ---- labels (relative ones follow their object)
  if (seat.drogue.visible) {
    seat.drogue.updateWorldMatrix(true, true);
    seat.dCone.getWorldPosition(DP);
  } else DP.copy(SP);
  tmpLabels.forEach((l, i) => {
    const src = LABELS[i];
    const r = src.rel ? REL[src.rel] : null;
    l.pos = r ? [src.pos[0] + r.x, src.pos[1] + r.y, src.pos[2] + r.z] : src.pos;
  });
  labels(t, tmpLabels);

  applyCamera(t);
  renderFrame();
}

start(renderAt);
