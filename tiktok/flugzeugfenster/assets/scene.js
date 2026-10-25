// #32 "Warum sind Flugzeugfenster rund?" (format A, Detail-Rätsel).
// Hook: a 1950s silver jet at night tears apart from a window corner.
// Beat 1: the same jet climbs; outside the air thins, inside air is pumped
// in, the fuselage blows up like a balloon — every flight. Beat 2: a big
// window panel on a stand in the test hangar: half a tonne pushes on the
// glass, the force flows around the window like water around a stone and
// jams at the corners; the metal holds… for 100 flights. Beat 3: the water
// tank rises around the parked jet, the pump strokes 3000 times — zack, a
// crack at a window corner; metal fatigue = a paperclip bent until it snaps.
// Payoff: the window turns round, the force glides around it, the jet's
// windows pop round. Übrigens: the tiny hole in the middle pane.
// Timing lives in beats.js; renderAt(t) is a pure function of t.
import {
  THREE,
  ramp,
  smooth,
  lerp,
  clamp01,
  pop,
  V,
  rng,
  jitter,
  facet,
  facetMat,
  scene,
  flat,
  M,
  outBack,
  xrayMaterial,
  setXray,
  makeArrowSet,
  animateArrows,
  showPanel,
  LED,
  labels,
  puff,
  highlights,
  shotCamera,
  renderFrame,
  start,
  forceMat,
} from "./world.js";
import "./set.js";
import { cloudPuffs } from "./environments.js";
import { createHand } from "./hand.js";
import { counter, meter } from "./hud.js";
import { T, FLY, MOD, CLIP, PUMP, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);
const r0 = rng(3201);
const D2R = Math.PI / 180;
// rounded rectangle centred on the origin (world.js roundedRect starts at y = 0)
function rrect(w, h, r) {
  const s = new THREE.Shape();
  const x0 = -w / 2;
  const y0 = -h / 2;
  r = Math.min(r, w / 2, h / 2);
  s.moveTo(x0 + r, y0);
  s.lineTo(x0 + w - r, y0);
  s.absarc(x0 + w - r, y0 + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x0 + w, y0 + h - r);
  s.absarc(x0 + w - r, y0 + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x0 + r, y0 + h);
  s.absarc(x0 + r, y0 + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x0, y0 + r);
  s.absarc(x0 + r, y0 + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}
const Fm = (geo, mat, amt = 0.05, seed = 1) => {
  const m = new THREE.Mesh(facet(geo, amt, seed), facetMat(mat));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
};

// ================================================================ the jet
// A de Havilland Comet-like airliner, nose at -x. Built around its own
// fuselage axis (y = 0); the group sits at y = AXY. Two pieces (front /
// rear, split at SPLIT) so the hook can tear it apart. Window rows hold a
// square set and a round set (instanced) so the payoff can swap them.
const R = 0.55;
const AXY = 1.62;
const X_NOSE = -4.6;
const X_TAIL = 4.6;
const SPLIT = -1.55;
const WIN_Y = 0.12;
const WINX = [];
for (let x = -3.15; x <= 2.7; x += 0.42) WINX.push(+x.toFixed(2));

function radiusAt(x) {
  if (x < -3.3) {
    const k = (x - X_NOSE) / (-3.3 - X_NOSE);
    return R * Math.pow(Math.sin((k * Math.PI) / 2), 0.62);
  }
  if (x > 2.4) {
    const k = (x - 2.4) / (X_TAIL - 2.4);
    return lerp(R, 0.12, Math.pow(k, 1.25));
  }
  return R;
}
// colour bands: white roof, blue cheat line through the windows, bare
// polished metal below
const WHITE = new THREE.Color(0xf4f6fa);
const BLUE = new THREE.Color(0x1f4fa8);
const SILVER = new THREE.Color(0xc5ccd6);
function fuselageGeo(x0, x1, seed) {
  const pts = [];
  const n = Math.max(4, Math.round((x1 - x0) / 0.09));
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    pts.push(new THREE.Vector2(Math.max(0.001, radiusAt(x)), x));
  }
  const g = new THREE.LatheGeometry(pts, 40);
  g.rotateZ(-Math.PI / 2); // lathe axis y -> x
  const f = facet(g, 0.035, seed);
  const p = f.attributes.position;
  const c = f.attributes.color;
  for (let i = 0; i < p.count; i += 3) {
    let y = 0;
    let rr = 0;
    for (let j = 0; j < 3; j++) {
      y += p.getY(i + j) / 3;
      rr += Math.hypot(p.getY(i + j), p.getZ(i + j)) / 3;
    }
    const v = y / Math.max(0.05, rr);
    const col = v > 0.42 ? WHITE : v > -0.06 ? BLUE : SILVER;
    for (let j = 0; j < 3; j++)
      c.setXYZ(i + j, c.getX(i + j) * col.r, c.getY(i + j) * col.g, c.getZ(i + j) * col.b);
  }
  return f;
}
const winGeoSq = new THREE.BoxGeometry(0.2, 0.22, 0.03);
const winGeoFrame = new THREE.BoxGeometry(0.26, 0.28, 0.02);
const winGeoRound = new THREE.CylinderGeometry(0.095, 0.095, 0.03, 18);
winGeoRound.rotateX(Math.PI / 2);
winGeoRound.scale(1, 1.25, 1);
const glassMat = flat(0x18233a, { roughness: 0.1, metalness: 0.3 });
const frameMat = flat(0x8e98a8, { roughness: 0.35, metalness: 0.6 });

function windowRow(xs) {
  // returns { sq, frame, rd, list } instanced meshes with matrices per window
  const list = [];
  for (const x of xs)
    for (const s of [1, -1]) {
      const z = s * Math.sqrt(R * R - WIN_Y * WIN_Y);
      const nrm = V(0, WIN_Y, z).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), nrm);
      list.push({ x, s, pos: V(x, WIN_Y, z).addScaledVector(nrm, 0.012), q });
    }
  const mk = (geo, mat) => {
    const im = new THREE.InstancedMesh(geo, mat, list.length);
    im.userData.noAO = true;
    return im;
  };
  return {
    list,
    sq: mk(winGeoSq, glassMat),
    frame: mk(winGeoFrame, frameMat),
    rd: mk(winGeoRound, glassMat),
  };
}
const m4 = new THREE.Matrix4();
function setWindows(w, roundK) {
  // roundK: function(i, x) -> 0 (square) … 1 (round)
  w.list.forEach((o, i) => {
    const k = roundK(i, o.x);
    const ks = Math.max(0.0001, 1 - smooth(clamp01(k * 2)));
    const kr = Math.max(0.0001, outBack(clamp01(k * 2 - 1)));
    m4.compose(o.pos, o.q, V(ks, ks, 1));
    w.sq.setMatrixAt(i, m4);
    m4.compose(
      o.pos.clone().addScaledVector(V(0, 0, 1).applyQuaternion(o.q), -0.006),
      o.q,
      V(ks, ks, 1),
    );
    w.frame.setMatrixAt(i, m4);
    m4.compose(o.pos, o.q, V(kr, kr, kr));
    w.rd.setMatrixAt(i, m4);
  });
  w.sq.instanceMatrix.needsUpdate =
    w.frame.instanceMatrix.needsUpdate =
    w.rd.instanceMatrix.needsUpdate =
      true;
}

function trapezoid(rootX0, rootX1, tipX0, tipX1, span, thick) {
  // wing / tailplane outline in the x–z plane, extruded in y
  const s = new THREE.Shape();
  s.moveTo(rootX0, 0);
  s.lineTo(tipX0, span);
  s.lineTo(tipX1, span);
  s.lineTo(rootX1, 0);
  s.lineTo(rootX0, 0);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: thick,
    bevelEnabled: true,
    bevelThickness: thick * 0.4,
    bevelSize: thick * 0.4,
    bevelSegments: 1,
  });
  g.rotateX(Math.PI / 2); // shape y -> -z, depth -> -y… fix sign below
  return g;
}

function makeJet({ xray = false, gear = true, seed = 1 } = {}) {
  const body = (c, extra) =>
    xray
      ? xrayMaterial(c, { flatShading: true, vertexColors: true, ...extra })
      : flat(c, { vertexColors: true, ...extra });
  const skin = body(0xffffff, { roughness: 0.3, metalness: 0.35 });
  const wingMat = xray
    ? xrayMaterial(0xc9d0da, {
        flatShading: true,
        roughness: 0.3,
        metalness: 0.4,
        side: THREE.DoubleSide,
      })
    : flat(0xc9d0da, { roughness: 0.3, metalness: 0.4, side: THREE.DoubleSide });
  const group = new THREE.Group();
  group.position.y = AXY;
  const pieces = {};
  for (const [name, x0, x1] of [
    ["front", X_NOSE, SPLIT],
    ["rear", SPLIT, X_TAIL],
  ]) {
    const piece = new THREE.Group();
    group.add(piece);
    const bodyG = new THREE.Group(); // fuselage + windows: the part that inflates
    piece.add(bodyG);
    const f = new THREE.Mesh(fuselageGeo(x0, x1, seed + (name === "front" ? 0 : 7)), skin);
    f.castShadow = f.receiveShadow = true;
    bodyG.add(f);
    const w = windowRow(WINX.filter((x) => x < SPLIT === (name === "front")));
    bodyG.add(w.frame, w.sq, w.rd);
    setWindows(w, () => 0);
    // the torn edge: a dark ring inside the break (only seen when apart)
    const edge = new THREE.Mesh(
      new THREE.CylinderGeometry(R * 0.98, R * 0.98, 0.02, 40, 1, true),
      flat(0x2a2f3a, { side: THREE.DoubleSide }),
    );
    edge.rotation.z = Math.PI / 2;
    edge.position.x = name === "front" ? x1 - 0.01 : x0 + 0.01;
    bodyG.add(edge);
    pieces[name] = { piece, bodyG, win: w, edge };
  }
  const front = pieces.front.piece;
  const rear = pieces.rear.piece;
  // cockpit windows
  for (let i = 0; i < 4; i++) {
    const a = (i - 1.5) * 0.32;
    const cw = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.02), glassMat);
    const x = -3.55;
    const rr = radiusAt(x) + 0.005;
    cw.position.set(x, rr * Math.cos(a) * 0.62, rr * Math.sin(a));
    cw.lookAt(V(x - 1.2, rr * Math.cos(a) * 2.2, rr * Math.sin(a) * 2.2));
    pieces.front.bodyG.add(cw);
  }
  // wings: low, swept, engines buried in the roots (intakes at the leading edge)
  const wings = new THREE.Group();
  rear.add(wings);
  for (const s of [1, -1]) {
    const g = trapezoid(-1.05, 1.15, 0.6, 1.25, 4.6, 0.09);
    const wm = Fm(g, wingMat, 0.04, seed + (s > 0 ? 3 : 4));
    wm.scale.z = -s; // rotateX put the span on +z; mirror per side
    wm.position.y = -0.32;
    wings.add(wm);
    // engine pod blended into the root
    const pod = Fm(new THREE.CylinderGeometry(0.2, 0.22, 1.8, 12), wingMat, 0.03, seed + 9);
    pod.rotation.z = Math.PI / 2;
    pod.position.set(0.05, -0.28, -s * 0.72);
    wings.add(pod);
    for (const dz of [-0.16, 0.16]) {
      const intake = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.11, 0.04, 14),
        flat(0x12161f),
      );
      intake.rotation.z = Math.PI / 2;
      intake.position.set(-0.86, -0.28, -s * 0.72 + dz * 0.6);
      wings.add(intake);
    }
    // wingtip nav light: red left (-z… port), green right
    const nav = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 8, 6),
      flat(s > 0 ? 0x5dff8a : 0xff4040, {
        emissive: s > 0 ? 0x2bff6a : 0xff2020,
        emissiveIntensity: 3,
      }),
    );
    nav.position.set(1.0, -0.3, -s * 4.62);
    nav.userData.noAO = true;
    wings.add(nav);
  }
  // tailplane + fin
  for (const s of [1, -1]) {
    const tp = Fm(trapezoid(3.55, 4.35, 4.05, 4.5, 1.55, 0.05), wingMat, 0.04, seed + 11);
    tp.scale.z = -s;
    tp.position.y = 0.12;
    rear.add(tp);
  }
  {
    const s = new THREE.Shape();
    s.moveTo(3.2, 0.3);
    s.lineTo(4.15, 1.75);
    s.lineTo(4.6, 1.75);
    s.lineTo(4.55, 0.1);
    s.lineTo(3.2, 0.3);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.07, bevelEnabled: false });
    g.translate(0, 0, -0.035);
    const fin = Fm(g, body(0xffffff, { roughness: 0.3 }), 0.04, seed + 12);
    // fin colours: white with a blue top band via vertex colours
    const p = fin.geometry.attributes.position;
    const c = fin.geometry.attributes.color;
    for (let i = 0; i < p.count; i++)
      if (p.getY(i) > 1.2) c.setXYZ(i, c.getX(i) * BLUE.r, c.getY(i) * BLUE.g, c.getZ(i) * BLUE.b);
    rear.add(fin);
    // red beacon on the fin
    const bc = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 8, 6),
      flat(0xff3030, { emissive: 0xff1010, emissiveIntensity: 2 }),
    );
    bc.position.set(4.35, 1.8, 0);
    bc.userData.noAO = true;
    rear.add(bc);
    pieces.beacon = bc;
  }
  // landing gear (parked jet only)
  if (gear) {
    const leg = (x, z, h) => {
      const l = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, h, 6), M.steel);
      l.position.set(x, -AXY + h / 2 + 0.2, z);
      l.castShadow = true;
      return l;
    };
    const wheel = (x, z) => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.14, 14), M.rubber);
      w.rotation.x = Math.PI / 2;
      w.position.set(x, -AXY + 0.2, z);
      w.castShadow = true;
      return w;
    };
    front.add(leg(-3.3, 0, 1.0), wheel(-3.3, 0.08), wheel(-3.3, -0.08));
    for (const s of [1, -1])
      rear.add(leg(0.5, s * 1.6, 1.2), wheel(0.5, s * 1.52), wheel(0.5, s * 1.72));
  }
  const mats = xray ? [skin, wingMat] : [];
  return { group, front, rear, pieces, wings, skin, mats };
}

// ---------------------------------------------------------------- the parked jet (stage)
const jet = makeJet({ seed: 32 });
scene.add(jet.group);

// ---------------------------------------------------------------- the flying jet (hook + beat 1)
const fly = makeJet({ xray: true, gear: false, seed: 33 });
fly.group.position.set(FLY[0], FLY[1], FLY[2]);
fly.group.position.y = FLY[1];
scene.add(fly.group);
// a big moon behind the jet in the hook view
{
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(14, 28, 18),
    new THREE.MeshBasicMaterial({ color: 0xfff4d6, fog: false }),
  );
  const dir = V(10.1, 4.6, -2.2).normalize();
  moon.position.set(FLY[0], FLY[1], FLY[2]).addScaledVector(dir, 210);
  moon.userData.noAO = true;
  scene.add(moon);
}
// a fill light that keeps the silver readable at night
{
  const l = new THREE.PointLight(0xdfe6ff, 40, 30, 1.3);
  l.position.set(FLY[0] - 3, FLY[1] + 5, FLY[2] + 8);
  scene.add(l);
  const l2 = new THREE.PointLight(0xffb070, 10, 14, 1.5);
  l2.position.set(FLY[0] + 4, FLY[1] - 3, FLY[2] + 3);
  scene.add(l2);
}
// the glowing crack on the flying jet: from the top corner of a window by
// the split, jagged up over the roof and down the far side
const crackMat = new THREE.MeshBasicMaterial({ color: 0xff8a1a });
const crackGlowMat = new THREE.MeshBasicMaterial({
  color: 0xff4a10,
  transparent: true,
  opacity: 0.6,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
function crackOnFuselage(x0, a0, a1, seed, rr = R + 0.012) {
  const r = rng(seed);
  const pts = [];
  const n = 26;
  for (let i = 0; i <= n; i++) {
    const a = lerp(a0, a1, i / n);
    const x = x0 + (r() - 0.5) * 0.09 + Math.sin(i * 1.7) * 0.03;
    pts.push(V(x, rr * Math.sin(a), rr * Math.cos(a)));
  }
  const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.1);
  const core = new THREE.Mesh(new THREE.TubeGeometry(curve, 120, 0.016, 5), crackMat);
  const glow = new THREE.Mesh(new THREE.TubeGeometry(curve, 120, 0.05, 6), crackGlowMat);
  core.userData.noAO = glow.userData.noAO = true;
  const g = new THREE.Group();
  g.add(glow, core);
  return { g, core, glow, segs: 120 };
}
const flyCrack = crackOnFuselage(SPLIT + 0.06, -45 * D2R, 200 * D2R, 7);
fly.pieces.rear.bodyG.add(flyCrack.g);
const crackLight = new THREE.PointLight(0xff8a2a, 0, 6, 1.5);
crackLight.position.set(SPLIT, 0.7, 0.4);
fly.group.add(crackLight);
function growCrack(c, k) {
  const n = Math.ceil(clamp01(k) * c.segs) * 6 * 5;
  c.core.geometry.setDrawRange(0, n);
  c.glow.geometry.setDrawRange(0, Math.ceil(clamp01(k) * c.segs) * 6 * 6);
  c.g.visible = k > 0.001;
}
// sparks spraying from the crack tip (hook)
const SPARK_N = 40;
const sparks = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.025, 0),
  new THREE.MeshBasicMaterial({ color: 0xffd27a }),
  SPARK_N,
);
sparks.userData.noAO = true;
sparks.frustumCulled = false;
fly.pieces.rear.bodyG.add(sparks);
const sparkSeed = Array.from({ length: SPARK_N }, () => [r0(), r0(), r0(), r0()]);
// debris plates flung out of the break
const debris = [];
{
  const r = rng(77);
  for (let i = 0; i < 18; i++) {
    const m = Fm(
      jitter(new THREE.BoxGeometry(0.16 + r() * 0.2, 0.02, 0.12 + r() * 0.16), 0.02, i),
      r() > 0.4 ? flat(0xd8dde5, { metalness: 0.5, roughness: 0.3 }) : flat(0x1f4fa8),
      0.06,
      i,
    );
    const a = r() * Math.PI * 2;
    debris.push({
      m,
      v: V((r() - 0.5) * 2.5, Math.sin(a) * (1.5 + r() * 2.5), Math.cos(a) * (1.5 + r() * 2.5)),
      w: V(r() * 9, r() * 9, r() * 9),
    });
    fly.group.add(m);
  }
}
// a passenger at the lit window (beat 1): a warm window and a head
const paxWin = new THREE.Mesh(
  new THREE.BoxGeometry(0.205, 0.225, 0.03),
  flat(0xffd890, { emissive: 0xffb860, emissiveIntensity: 1.6 }),
);
{
  const o =
    fly.pieces.front.win.list.find((w) => w.s === 1 && Math.abs(w.x - -2.31) < 0.05) ??
    fly.pieces.front.win.list[2];
  paxWin.position.copy(o.pos).addScaledVector(V(0, WIN_Y, 0.54).normalize(), 0.004);
  paxWin.quaternion.copy(o.q);
  paxWin.userData.noAO = true;
  fly.pieces.front.bodyG.add(paxWin);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 8), flat(0x2a1c18));
  head.position.copy(paxWin.position).addScaledVector(V(0, WIN_Y, 0.54).normalize(), 0.006);
  head.position.y -= 0.03;
  head.scale.set(0.8, 1, 0.15);
  head.quaternion.copy(o.q);
  fly.pieces.front.bodyG.add(head);
}
// air streaming into the cabin (x-ray): blue beads from the engine intakes
// along the floor of the cabin
const AIR_N = 90;
const air = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.035, 0),
  new THREE.MeshBasicMaterial({ color: 0x5fd0ff }),
  AIR_N,
);
air.userData.noAO = true;
air.frustumCulled = false;
fly.group.add(air);
const airSeed = Array.from({ length: AIR_N }, () => [r0(), r0(), r0(), r0()]);
// pressure arrows from the axis outwards (balloon)
const pressArrows = makeArrowSet(
  Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2;
    const x = -2.6 + (i % 5) * 1.25;
    return [
      V(x, Math.sin(a) * 0.12, Math.cos(a) * 0.12),
      V(x, Math.sin(a) * 0.95, Math.cos(a) * 0.95),
    ];
  }),
  { parent: fly.group, amp: 0, r: 0.05, mat: forceMat },
);
// clouds racing past the flying jet
const flyClouds = new THREE.Group();
scene.add(flyClouds);
{
  const mat = facetMat(
    new THREE.MeshStandardMaterial({
      color: 0x6f7cb0,
      emissive: 0x2a3466,
      emissiveIntensity: 0.4,
      roughness: 1,
      flatShading: true,
    }),
  );
  const r = rng(91);
  for (let i = 0; i < 9; i++) {
    const g = new THREE.Group();
    cloudPuffs(g, 4 + Math.floor(r() * 3), 1.4 + r() * 1.2, mat, i * 5);
    g.userData.base = [(r() - 0.5) * 60, -6 - r() * 9, -6 - r() * 24];
    flyClouds.add(g);
  }
}

// ================================================================ the window panel (beat 2)
// A big piece of fuselage skin (slightly curved) on a steel stand: rivet
// rows, frames behind, a window that can morph from square to round.
const PW = 2.7;
const PH = 2.3;
const PCY = 1.6; // panel centre height
const WW = 0.74;
const WH = 0.92;
const mod = new THREE.Group();
mod.position.set(MOD[0], 0, MOD[2]);
scene.add(mod);
const panelMat = flat(0xd2d8e0, { roughness: 0.3, metalness: 0.45, side: THREE.DoubleSide });
const panelBack = flat(0xe9e1d0, { roughness: 0.7 }); // cabin lining inside
let panelMesh = null;
let panelR = -1;
const glassG = new THREE.Group();
mod.add(glassG);
function panelGeo(rad) {
  const s = new THREE.Shape();
  s.moveTo(-PW / 2, -PH / 2);
  s.lineTo(PW / 2, -PH / 2);
  s.lineTo(PW / 2, PH / 2);
  s.lineTo(-PW / 2, PH / 2);
  s.lineTo(-PW / 2, -PH / 2);
  s.holes.push(rrect(WW, WH, rad));
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: false, curveSegments: 10 });
  g.translate(0, 0, -0.05);
  return facet(g, 0.035, 5);
}
// window radius: 0.03 (sharp, square) → WW/2 (fully round)
const RSQ = 0.03;
const RRD = WW / 2 - 0.001;
function setPanelShape(rad) {
  if (Math.abs(rad - panelR) < 0.002) return;
  panelR = rad;
  if (panelMesh) {
    mod.remove(panelMesh);
    panelMesh.geometry.dispose();
  }
  panelMesh = new THREE.Mesh(panelGeo(rad), [facetMat(panelMat), facetMat(panelBack)]);
  panelMesh.position.y = PCY;
  panelMesh.castShadow = panelMesh.receiveShadow = true;
  mod.add(panelMesh);
  // window frame ring + three panes follow the shape
  glassG.clear();
  const ring = rrect(WW + 0.12, WH + 0.12, rad + 0.06);
  ring.holes.push(rrect(WW, WH, rad));
  const rg = new THREE.ExtrudeGeometry(ring, {
    depth: 0.03,
    bevelEnabled: false,
    curveSegments: 10,
  });
  const rm = new THREE.Mesh(rg, frameMat);
  rm.position.set(0, PCY, 0.0);
  glassG.add(rm);
  const paneShape = rrect(WW - 0.02, WH - 0.02, Math.max(0.005, rad - 0.01));
  for (const [z, op, col] of [
    [0.0, 0.55, 0x1c2a46], // outer pane (the strong one)
    [-0.09, 0.32, 0x5c7aa8], // middle pane (with the hole)
    [-0.2, 0.22, 0xa8c4e8], // inner pane (cabin)
  ]) {
    const pg = new THREE.ShapeGeometry(paneShape, 10);
    const pm = new THREE.Mesh(
      pg,
      new THREE.MeshStandardMaterial({
        color: col,
        transparent: true,
        opacity: op,
        roughness: 0.05,
        metalness: 0.1,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    pm.position.set(0, PCY, z);
    pm.userData.noAO = true;
    glassG.add(pm);
  }
}
setPanelShape(RSQ);
// white plastic cabin bezel around the window (cabin side)
{
  const bz = rrect(WW + 0.34, WH + 0.34, WW / 2 + 0.17);
  bz.holes.push(rrect(WW + 0.04, WH + 0.04, WW / 2 + 0.02));
  const m = new THREE.Mesh(
    new THREE.ExtrudeGeometry(bz, {
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
    }),
    flat(0xf6f3ec, { roughness: 0.5 }),
  );
  m.position.set(0, PCY, -0.27);
  mod.add(m);
}
glassG.position.z = 0;
// the tiny hole in the middle pane (with a dark ring so it reads)
const hole = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.01, 6, 16), flat(0x10141c));
hole.position.set(0, PCY - WH / 2 + 0.16, -0.09);
mod.add(hole);
// rivet rows along the panel edges and around the window
{
  const pts = [];
  for (let x = -PW / 2 + 0.08; x <= PW / 2 - 0.05; x += 0.11)
    pts.push([x, PH / 2 - 0.08], [x, -PH / 2 + 0.08]);
  for (let y = -PH / 2 + 0.19; y <= PH / 2 - 0.15; y += 0.11)
    pts.push([PW / 2 - 0.08, y], [-PW / 2 + 0.08, y]);
  const im = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.014, 6, 4),
    flat(0xe8edf3, { metalness: 0.6, roughness: 0.25 }),
    pts.length,
  );
  pts.forEach(([x, y], i) => {
    m4.makeTranslation(x, PCY + y, 0.008);
    im.setMatrixAt(i, m4);
  });
  im.userData.noAO = true;
  mod.add(im);
}
// frames (ribs) behind the skin + the stand
{
  const fm = flat(0x7d8b6a, { roughness: 0.6 });
  for (const x of [-PW / 2 + 0.25, PW / 2 - 0.25]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.06, PH, 0.14), fm);
    b.position.set(x, PCY, -0.13);
    b.castShadow = true;
    mod.add(b);
  }
  for (const y of [-PH / 2 + 0.2, PH / 2 - 0.2]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(PW - 0.4, 0.05, 0.1), fm);
    b.position.set(0, PCY + y, -0.11);
    mod.add(b);
  }
  const stand = flat(0x2f6fd6, { roughness: 0.45, metalness: 0.3 });
  for (const x of [-PW / 2 + 0.25, PW / 2 - 0.25]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, PCY - PH / 2 + 0.25, 0.1), stand);
    post.position.set(x, (PCY - PH / 2 + 0.25) / 2, -0.15);
    post.castShadow = true;
    mod.add(post);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.9), stand);
    foot.position.set(x, 0.04, -0.15);
    foot.castShadow = true;
    mod.add(foot);
  }
  // a tag on the stand: "PRÜFSTÜCK 7"
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 80;
  const g = c.getContext("2d");
  g.fillStyle = "#ffd23f";
  g.fillRect(0, 0, 256, 80);
  g.fillStyle = "#1c1c22";
  g.font = "900 34px Montserrat, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("PRÜFSTÜCK 7", 128, 42);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const tag = new THREE.Mesh(
    new THREE.PlaneGeometry(0.6, 0.19),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }),
  );
  tag.position.set(-PW / 2 + 0.55, PCY - PH / 2 + 0.16, 0.012);
  mod.add(tag);
}
// red glow at the four window corners (stress jam)
const cornerGlow = [];
for (const [sx, sy] of [
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
]) {
  const g = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 12, 8),
    new THREE.MeshBasicMaterial({
      color: 0xff3a1a,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  g.position.set(sx * (WW / 2 - 0.01), PCY + sy * (WH / 2 - 0.01), 0.03);
  g.userData.noAO = true;
  mod.add(g);
  cornerGlow.push(g);
}
// force flow: beads streaming across the skin, around the window
const LANES = 15;
const PER = 16;
const flow = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.026, 0),
  new THREE.MeshBasicMaterial({ color: 0xffffff }),
  LANES * PER,
);
flow.userData.noAO = true;
flow.frustumCulled = false;
mod.add(flow);
const cBlue = new THREE.Color(0x4fc3ff);
const cRed = new THREE.Color(0xff3a1a);
const cGreen = new THREE.Color(0x3dff7a);
const tmpC = new THREE.Color();
// lane path: y(x) for lane y0, roundness rk (0 square … 1 round)
function laneY(x, y0, rk) {
  const hw = WW / 2 + 0.06;
  const hh = WH / 2 + 0.06;
  const inside = Math.abs(y0) < hh;
  const e = lerp(10, 2.2, rk); // square: abrupt detour, round: smooth
  const b = Math.exp(-Math.pow(Math.abs(x) / (hw + 0.12), e));
  if (inside) {
    const target = Math.sign(y0 || 0.001) * (hh + 0.03 + Math.abs(y0) * 0.25);
    return lerp(y0, target, b);
  }
  // outside lanes get squeezed a little
  return y0 + Math.sign(y0) * 0.12 * b * (hh / Math.abs(y0));
}
function updateFlow(t, k, rk, green) {
  flow.visible = k > 0.001;
  if (!flow.visible) return;
  const q = new THREE.Quaternion();
  for (let l = 0; l < LANES; l++) {
    const y0 = lerp(-PH / 2 + 0.22, PH / 2 - 0.22, l / (LANES - 1));
    for (let j = 0; j < PER; j++) {
      const i = l * PER + j;
      const s = (j / PER + t * 0.16 + l * 0.037) % 1;
      // beads dwell (bunch) near the corners for square windows
      let x = -PW / 2 + 0.08 + s * (PW - 0.16);
      const y = laneY(x, y0, rk);
      let d = 9;
      for (const sx of [-1, 1])
        for (const sy of [-1, 1]) d = Math.min(d, Math.hypot(x - sx * WW * 0.5, y - sy * WH * 0.5));
      const jam = (1 - rk) * clamp01(1 - d / 0.32);
      tmpC.copy(green > 0 ? cBlue.clone().lerp(cGreen, green) : cBlue).lerp(cRed, jam);
      const sc = k * (1 + jam * 0.9);
      m4.compose(V(x, PCY + y, 0.03), q, V(sc, sc, sc));
      flow.setMatrixAt(i, m4);
      flow.setColorAt(i, tmpC);
    }
  }
  flow.instanceMatrix.needsUpdate = true;
  flow.instanceColor.needsUpdate = true;
}
// half a tonne: force arrows pushing the glass outwards
const winArrows = makeArrowSet(
  [
    [-0.18, 0.22],
    [0.18, 0.22],
    [0, -0.02],
    [-0.18, -0.26],
    [0.18, -0.26],
  ].map(([x, y]) => [V(x, PCY + y, -0.1), V(x, PCY + y, 1.0)]),
  { parent: mod, amp: 0, r: 0.03, mat: forceMat },
);
// the crack at the top-right window corner (beat 3)
const modCrack = (() => {
  const r = rng(12);
  const pts = [V(WW / 2 - 0.02, PCY + WH / 2 - 0.02, 0.012)];
  let p = pts[0].clone();
  for (let i = 0; i < 14; i++) {
    p = p.clone().add(V(0.05 + r() * 0.05, 0.035 + r() * 0.05, 0));
    p.x += (r() - 0.5) * 0.05;
    pts.push(p);
  }
  const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.05);
  const core = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 90, 0.012, 5),
    new THREE.MeshBasicMaterial({ color: 0x1a0a06 }),
  );
  const glow = new THREE.Mesh(new THREE.TubeGeometry(curve, 90, 0.04, 6), crackGlowMat);
  core.userData.noAO = glow.userData.noAO = true;
  const g = new THREE.Group();
  g.add(glow, core);
  mod.add(g);
  return { g, core, glow, segs: 90 };
})();
// air through the tiny hole (Übrigens): beads passing the middle pane
const HOLE_N = 30;
const holeAir = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.012, 0),
  new THREE.MeshBasicMaterial({ color: 0xdff4ff }),
  HOLE_N,
);
holeAir.userData.noAO = true;
holeAir.frustumCulled = false;
mod.add(holeAir);

// ================================================================ the water tank (beat 3)
const TANK = { x: 5.3, z: 1.75, h: 3.0 };
const tank = new THREE.Group();
scene.add(tank);
const tankWalls = [];
{
  const glass = new THREE.MeshStandardMaterial({
    color: 0x9fd8ff,
    transparent: true,
    opacity: 0.22,
    roughness: 0.05,
    metalness: 0.1,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const steel = flat(0x3b4452, { roughness: 0.45, metalness: 0.5 });
  const yel = flat(0xffc12a, { roughness: 0.45 });
  const wall = (w, rotY, x, z, i) => {
    const g = new THREE.Group();
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(w, TANK.h), glass);
    pane.position.y = TANK.h / 2;
    pane.userData.noAO = true;
    g.add(pane);
    // steel frame: posts + top and bottom rails
    for (const s of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, TANK.h + 0.1, 0.16), steel);
      post.position.set((s * w) / 2, TANK.h / 2, 0);
      post.castShadow = true;
      g.add(post);
    }
    for (const y of [0.08, TANK.h]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(w + 0.16, 0.16, 0.18), y > 1 ? yel : steel);
      rail.position.y = y;
      rail.castShadow = true;
      g.add(rail);
    }
    for (let k = 1; k < 4; k++) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.08, TANK.h, 0.1), steel);
      b.position.set(-w / 2 + (k * w) / 4, TANK.h / 2, 0);
      g.add(b);
    }
    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    tank.add(g);
    tankWalls.push({ g, i });
  };
  wall(2 * TANK.x, 0, 0, TANK.z, 0);
  wall(2 * TANK.x, Math.PI, 0, -TANK.z, 1);
  wall(2 * TANK.z, Math.PI / 2, TANK.x, 0, 2);
  wall(2 * TANK.z, -Math.PI / 2, -TANK.x, 0, 3);
}
const waterMat = new THREE.MeshStandardMaterial({
  color: 0x2f8fd8,
  transparent: true,
  opacity: 0.42,
  roughness: 0.08,
  metalness: 0.1,
  depthWrite: false,
});
const water = new THREE.Mesh(
  new THREE.BoxGeometry(2 * TANK.x - 0.1, 1, 2 * TANK.z - 0.1),
  waterMat,
);
water.userData.noAO = true;
tank.add(water);
// the jet's own crack (beat 3): on the roof, from a window corner
const jetCrack = crackOnFuselage(-0.88, 25 * D2R, 120 * D2R, 21, R + 0.015);
jet.pieces.rear.bodyG.add(jetCrack.g);
// the geyser: water beads blasting up out of the tank
const GEY_N = 120;
const geyser = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.075, 1),
  new THREE.MeshStandardMaterial({
    color: 0x7cc8ff,
    emissive: 0x2a7fd0,
    emissiveIntensity: 0.35,
    roughness: 0.05,
    transparent: true,
    opacity: 0.8,
  }),
  GEY_N,
);
geyser.userData.noAO = true;
geyser.frustumCulled = false;
scene.add(geyser);
const geySeed = Array.from({ length: GEY_N }, () => [r0(), r0(), r0(), r0()]);
// bubbles rising in the tank while it pumps
const BUB_N = 40;
const bubbles = new THREE.InstancedMesh(
  new THREE.IcosahedronGeometry(0.05, 0),
  new THREE.MeshStandardMaterial({
    color: 0xe6f6ff,
    transparent: true,
    opacity: 0.7,
    roughness: 0.1,
  }),
  BUB_N,
);
bubbles.userData.noAO = true;
bubbles.frustumCulled = false;
scene.add(bubbles);
const bubSeed = Array.from({ length: BUB_N }, () => [r0(), r0(), r0()]);

// the pump: a red machine with a piston and a flywheel, a pipe into the tank
const pump = new THREE.Group();
pump.position.set(...PUMP);
scene.add(pump);
let piston;
let flywheel;
{
  const red = flat(0xc8352a, { roughness: 0.4, metalness: 0.25 });
  const steel = flat(0x3b4452, { roughness: 0.4, metalness: 0.5 });
  const base = Fm(new THREE.BoxGeometry(1.4, 0.8, 1.0), red, 0.05, 41);
  base.position.y = 0.4;
  pump.add(base);
  const cyl = Fm(new THREE.CylinderGeometry(0.28, 0.28, 0.9, 14), steel, 0.04, 42);
  cyl.position.set(0.25, 1.25, 0);
  pump.add(cyl);
  piston = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.9, 8), M.chrome);
  piston.position.set(0.25, 1.9, 0);
  pump.add(piston);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.1, 12), red);
  piston.add(cap);
  cap.position.y = 0.45;
  flywheel = new THREE.Group();
  flywheel.position.set(-0.45, 1.0, 0.56);
  pump.add(flywheel);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.06, 6, 20), steel);
  flywheel.add(rim);
  for (let k = 0; k < 4; k++) {
    const sp = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.05, 0.04), steel);
    sp.rotation.z = (k * Math.PI) / 4;
    flywheel.add(sp);
  }
  // gauge on the pump
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.04, 18), flat(0xf4f1e8));
  dial.rotation.x = Math.PI / 2;
  dial.position.set(0.35, 0.55, 0.52);
  pump.add(dial);
  pump.traverse((o) => o.isMesh && (o.castShadow = true));
  // pipe from the pump into the tank
  const pts = [
    V(0.25, 0.3, 0.5),
    V(0.9, 0.2, 0.9),
    V(2.6, 0.2, 0.4),
    V(3.3, 0.5, 0.0),
    V(3.35, 1.2, -0.6),
  ];
  const pipe = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.08, 8),
    flat(0x2b2f38, { roughness: 0.6 }),
  );
  pipe.castShadow = true;
  pump.add(pipe);
}

// ================================================================ the paperclip (metal fatigue)
const clip = new THREE.Group();
clip.position.set(...CLIP);
scene.add(clip);
const CLIP_S = 1.5;
const CLIP_Y = 1.05; // standing in the vice on the little table
const BEND_Y = 0.52; // local height of the bend line (unscaled)
const clipMat = flat(0xeef2f8, {
  metalness: 0.35,
  roughness: 0.25,
  emissive: 0x8a96b0,
  emissiveIntensity: 0.25,
});
const clipLower = new THREE.Group();
const clipPivot = new THREE.Group();
const clipUpper = new THREE.Group();
{
  // a Gem clip: three U-turns, drawn in x–y, cut at the bend line
  const P = [];
  const arc = (cx, cy, rr, a0, a1) => {
    for (let i = 0; i <= 10; i++) {
      const a = lerp(a0, a1, i / 10);
      P.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
    }
  };
  P.push([0.12, 0.36]);
  arc(0.2, 0.78, 0.08, Math.PI, 0); // inner top U
  arc(0.14, 0.1, 0.14, 0, -Math.PI); // bottom U
  arc(0.2, 0.92, 0.2, Math.PI, 0); // outer top U
  P.push([0.4, 0.26]);
  // split the polyline at y = BEND_Y into runs below / above
  const runs = { lo: [], hi: [] };
  let cur = null;
  let side = null;
  for (let i = 0; i < P.length; i++) {
    const [x, y] = P[i];
    const s = y < BEND_Y ? "lo" : "hi";
    if (s !== side) {
      if (cur && i > 0) {
        const [px, py] = P[i - 1];
        const k = (BEND_Y - py) / (y - py);
        const cut = [lerp(px, x, k), BEND_Y];
        cur.push(cut);
        runs[side].push(cur);
        cur = [cut];
      } else cur = [];
      side = s;
    }
    cur.push([x, y]);
  }
  runs[side].push(cur);
  const tube = (run, parent, dy) => {
    if (run.length < 2) return;
    const pts = run.map(([x, y]) => V((x - 0.2) * CLIP_S, (y - dy) * CLIP_S, 0));
    const m = new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.2),
        pts.length * 4,
        0.03,
        8,
      ),
      clipMat,
    );
    m.castShadow = true;
    parent.add(m);
  };
  for (const run of runs.lo) tube(run, clipLower, 0);
  for (const run of runs.hi) tube(run, clipUpper, BEND_Y);
  clipLower.position.y = CLIP_Y;
  clipPivot.position.y = CLIP_Y + BEND_Y * CLIP_S;
  clipPivot.add(clipUpper);
  clip.add(clipLower, clipPivot);
  // little table + vice
  const wood = flat(0x9a6a3a, { roughness: 0.8 });
  const top = Fm(new THREE.BoxGeometry(1.4, 0.1, 0.9), wood, 0.08, 51);
  top.position.y = 0.75;
  clip.add(top);
  for (const [x, z] of [
    [-0.6, -0.35],
    [0.6, -0.35],
    [-0.6, 0.35],
    [0.6, 0.35],
  ]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.75, 0.08), flat(0x3b4452));
    leg.position.set(x, 0.375, z);
    leg.castShadow = true;
    clip.add(leg);
  }
  const vice = Fm(
    new THREE.BoxGeometry(0.75, 0.32, 0.4),
    flat(0x2f6fd6, { roughness: 0.4, metalness: 0.3 }),
    0.05,
    52,
  );
  vice.position.y = 0.96;
  clip.add(vice);
}
// the glowing bend line (gets hotter with every bend)
const bendGlow = new THREE.Mesh(
  new THREE.BoxGeometry(0.75, 0.07, 0.09),
  new THREE.MeshBasicMaterial({
    color: 0xff7a1a,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }),
);
bendGlow.position.y = CLIP_Y + BEND_Y * CLIP_S;
bendGlow.userData.noAO = true;
clip.add(bendGlow);
const hand = createHand({ scale: 0.55 });
clipPivot.add(hand.group);

// ================================================================ camera
const applyCamera = shotCamera(shots, 1);
// warm red "danger" glow on one window of the parked jet (hook)
const dangerGlow = new THREE.Mesh(
  new THREE.SphereGeometry(0.2, 12, 8),
  new THREE.MeshBasicMaterial({
    color: 0xff3a1a,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }),
);
dangerGlow.position.set(-1.05, AXY + WIN_Y, R + 0.05);
dangerGlow.userData.noAO = true;
scene.add(dangerGlow);

// ================================================================ render
const q0 = new THREE.Quaternion();
function renderAt(t) {
  // ------------------------------------------------ the flying jet
  const inAir = t < T.denn || (t >= T.stell && t < T.rate);
  fly.group.visible = inAir;
  flyClouds.visible = inAir;
  // hook: crack grows from frame 0, the jet tears apart from "mitten"
  const hook = t < T.denn;
  const crackK = hook ? 0.32 + 0.68 * smooth(ramp(t, 0, T.zwei)) : 0;
  growCrack(flyCrack, crackK);
  crackLight.intensity = hook ? 2.2 * crackK * (0.8 + 0.2 * Math.sin(t * 40)) : 0;
  sparks.visible = hook && t < T.mitten + 0.4;
  if (sparks.visible) {
    // the tip of the growing crack
    const curve = flyCrack.core.geometry.parameters.path;
    const tip = curve.getPointAt(clamp01(crackK));
    sparkSeed.forEach(([a, b, c, d], i) => {
      const s = (a + t * (1.6 + b)) % 1;
      const dir = V(c - 0.5, 0.6 + b, d - 0.2).normalize();
      m4.compose(
        tip
          .clone()
          .addScaledVector(dir, s * 0.7)
          .add(V(0, -s * s * 0.5, 0)),
        q0,
        V(1, 1, 1).multiplyScalar((1 - s) * 1.4),
      );
      sparks.setMatrixAt(i, m4);
    });
    sparks.instanceMatrix.needsUpdate = true;
  }
  const br = hook ? ramp(t, T.mitten, T.mitten + 0.85) : 0; // break progress (slowmo)
  const be = smooth(br);
  fly.front.position.set(-be * 1.4, -be * 2.2 - be * be * 2, 0);
  fly.front.rotation.set(be * 0.3, 0, be * 0.9);
  fly.rear.position.set(be * 0.7, -be * 0.9, 0);
  fly.rear.rotation.set(-be * 0.15, be * 0.15, -be * 0.35);
  for (const p of [fly.pieces.front.edge, fly.pieces.rear.edge]) p.visible = br > 0.001;
  debris.forEach((d) => {
    const k = br * 3.2;
    d.m.visible = br > 0.001;
    d.m.position.set(SPLIT + d.v.x * k * 0.4, 0.4 + d.v.y * k * 0.5 - k * k * 0.6, d.v.z * k * 0.5);
    d.m.rotation.set(d.w.x * k, d.w.y * k, d.w.z * k);
    d.m.scale.setScalar(br > 0.001 ? 1 : 0.001);
  });
  // flight: climbing pitch, slight bank, the sweep past on the follow line
  const climb =
    smooth(ramp(t, T.steigt, T.steigt + 1.2)) * (1 - smooth(ramp(t, T.jeden + 0.6, T.folg)));
  const sweep = t >= T.folg && t < T.rate ? ramp(t, T.folg, T.rate) : 0;
  fly.group.position.set(FLY[0] - sweep * 24, FLY[1] + Math.sin(t * 0.9) * 0.08, FLY[2]);
  fly.group.rotation.set(
    hook ? 0 : 0.05 * Math.sin(t * 0.7),
    0,
    -climb * 0.16 - (hook ? 0 : 0) + sweep * 0.05,
  );
  // the balloon: the fuselage blows up, then breathes with every flight
  const inflate = smooth(ramp(t, T.blaest, T.ballon + 0.25));
  const breathe =
    t >= T.jeden && t < T.folg ? Math.pow(Math.max(0, Math.sin((t - T.jeden) * 7.5)), 2) : 0;
  const deflate = 1 - smooth(ramp(t, T.jeden, T.jeden + 0.3));
  const wob =
    t > T.ballon && t < T.ballon + 1
      ? Math.sin((t - T.ballon) * 30) * 0.03 * (1 - (t - T.ballon))
      : 0;
  const swell = 1 + 0.26 * inflate * deflate + 0.2 * breathe + wob;
  for (const p of [fly.pieces.front.bodyG, fly.pieces.rear.bodyG]) p.scale.set(1, swell, swell);
  animateArrows(pressArrows, t, pop(t, T.blaest, T.folg));
  // x-ray while the air is pumped in
  const xk =
    smooth(ramp(t, T.pumpt - 0.1, T.pumpt + 0.35)) *
    (1 - smooth(ramp(t, T.ballon - 0.1, T.ballon + 0.2)));
  setXray(fly.mats, xk);
  air.visible = t >= T.pumpt && t < T.folg;
  if (air.visible) {
    const ak = pop(t, T.pumpt, T.folg);
    airSeed.forEach(([a, b, c, d], i) => {
      const s = (a + (t - T.pumpt) * (0.35 + b * 0.25)) % 1;
      // from the wing root intakes along the cabin
      const x = lerp(-0.4, -3.2 + c * 6, s);
      const yy = lerp(-0.25, (b - 0.5) * 0.7, smooth(s));
      const zz = lerp((d > 0.5 ? 1 : -1) * 0.72, (c - 0.5) * 0.7, smooth(s));
      m4.compose(V(x, yy * swell, zz * swell), q0, V(ak, ak, ak));
      air.setMatrixAt(i, m4);
    });
    air.instanceMatrix.needsUpdate = true;
  }
  // clouds rushing past (+x, the jet flies towards -x)
  flyClouds.children.forEach((g, i) => {
    const [bx, by, bz] = g.userData.base;
    const x = ((((bx + t * 9 * (1 + (i % 3) * 0.3)) % 60) + 90) % 60) - 30;
    g.position.set(FLY[0] + x - sweep * 24, FLY[1] + by, FLY[2] + bz);
  });
  fly.pieces.beacon.material.emissiveIntensity = Math.sin(t * 7) > 0.6 ? 4 : 0.3;
  paxWin.visible = !hook;

  // ------------------------------------------------ the parked jet
  dangerGlow.material.opacity =
    0.9 * pop(t, T.gefaehr - 0.1, T.stell) * (0.75 + 0.25 * Math.sin(t * 12));
  const rk = (i, x) =>
    ramp(t, T.darum + 0.35 + (x + 3.2) * 0.07, T.darum + 0.75 + (x + 3.2) * 0.07);
  setWindows(jet.pieces.front.win, rk);
  setWindows(jet.pieces.rear.win, rk);
  jet.pieces.beacon.material.emissiveIntensity = Math.sin(t * 7) > 0.6 ? 4 : 0.3;
  // the jet breathes in the tank with every pump stroke
  const pumping = t >= T.immer && t < T.zack;
  const strokes = pumping ? Math.pow(t - T.immer, 1.6) * 3.2 : 0;
  const tb = pumping ? 1 + 0.035 * Math.pow(Math.max(0, Math.sin(strokes * Math.PI * 2)), 2) : 1;
  for (const p of [jet.pieces.front.bodyG, jet.pieces.rear.bodyG]) p.scale.set(1, tb, tb);
  growCrack(jetCrack, smooth(ramp(t, T.zack, T.zack + 0.5)) * (1 - ramp(t, T.ohne, T.ohne + 0.01)));

  // ------------------------------------------------ the tank
  const tankOn = t >= T.ingenieure && t < T.klammer;
  tank.visible = tankOn;
  tankWalls.forEach(({ g, i }) => {
    const k = ramp(t, T.ingenieure + 0.1 + i * 0.12, T.ingenieure + 0.6 + i * 0.12);
    g.scale.set(1, Math.max(0.001, outBack(k)), 1);
  });
  const lvl = smooth(ramp(t, T.ingenieure + 0.6, T.becken + 0.8)) * (TANK.h - 0.25);
  water.visible = lvl > 0.02;
  water.scale.y = Math.max(0.01, lvl);
  water.position.y = lvl / 2 + Math.sin(t * 3) * 0.01;
  // piston + flywheel
  piston.position.y = 1.9 + (pumping ? 0.3 * Math.sin(strokes * Math.PI * 2) : 0);
  flywheel.rotation.z = -strokes * Math.PI * 2;
  // bubbles while pumping
  bubbles.visible = pumping;
  if (pumping)
    bubSeed.forEach(([a, b, c], i) => {
      const s = (a + t * (0.4 + b * 0.4)) % 1;
      m4.compose(
        V((c - 0.5) * 2 * TANK.x * 0.9, 0.2 + s * (lvl - 0.2), (b - 0.5) * 2 * TANK.z * 0.8),
        q0,
        V(1, 1, 1).multiplyScalar(0.6 + b),
      );
      bubbles.setMatrixAt(i, m4);
    });
  bubbles.instanceMatrix.needsUpdate = true;
  // zack: the geyser
  const gk = t >= T.zack && t < T.riss + 0.3 ? (t - T.zack) / 0.55 : -1;
  geyser.visible = gk >= 0;
  if (geyser.visible)
    geySeed.forEach(([a, b, c, d], i) => {
      const s = gk * (1.2 + a) - d * 0.25;
      if (s <= 0) {
        m4.makeScale(0.001, 0.001, 0.001);
      } else {
        const vy = 11 + b * 7;
        const y = 2.1 + vy * s * 0.6 - 9.8 * s * s * 0.6;
        const sp = (c - 0.5) * 2.4;
        m4.compose(
          V(-0.88 + sp * s * 2, Math.max(0, y), (a - 0.5) * 2 * s + 0.2),
          q0,
          V(1, 1, 1).multiplyScalar(0.7 + d),
        );
      }
      geyser.setMatrixAt(i, m4);
    });
  geyser.instanceMatrix.needsUpdate = true;

  // ------------------------------------------------ the window panel
  mod.visible =
    (t >= T.rate && t < T.ingenieure) ||
    (t >= T.riss && t < T.klammer) ||
    (t >= T.ohne && t < T.darum) ||
    (t >= T.fakt && t < T.cta);
  // morph square → round on "Ohne"
  const round = smooth(ramp(t, T.ohne, T.ohne + 0.8));
  setPanelShape(lerp(RSQ, RRD, round));
  const bulge = t >= T.rate && t < T.kraft1 ? smooth(ramp(t, T.rate + 0.3, T.tonne)) : 0;
  const flights =
    t >= T.trotzdem && t < T.ingenieure
      ? Math.pow(Math.max(0, Math.sin((t - T.trotzdem) * 9)), 2)
      : 0;
  glassG.scale.set(1, 1, 1);
  glassG.position.z = 0.06 * bulge + 0.03 * flights;
  if (panelMesh) panelMesh.scale.z = 1;
  animateArrows(winArrows, t, pop(t, T.rate + 0.2, T.kraft1));
  const flowK = pop(t, T.kraft1, T.ingenieure) + pop(t, T.ohne, T.darum);
  updateFlow(t, Math.min(1, flowK), round, smooth(ramp(t, T.drumherum - 0.2, T.drumherum + 0.4)));
  const jamK =
    (pop(t, T.nur, T.ingenieure) * (0.75 + 0.25 * Math.sin(t * 10)) +
      0.45 * pop(t, T.riss, T.klammer)) *
    (1 - round);
  cornerGlow.forEach((g, i) => {
    const s = Math.max(0.001, jamK * (i === 0 ? 1.25 : 0.85));
    g.scale.setScalar(s);
    g.visible = jamK > 0.01;
  });
  growCrack(
    modCrack,
    smooth(ramp(t, T.riss + 0.05, T.riss + 0.9)) * (1 - ramp(t, T.ohne - 0.05, T.ohne)),
  );
  modCrack.g.visible = t >= T.riss && t < T.ohne;
  // air through the hole
  holeAir.visible = t >= T.fakt && t < T.cta;
  if (holeAir.visible)
    for (let i = 0; i < HOLE_N; i++) {
      const s = (i / HOLE_N + t * 0.6) % 1;
      const a = i * 2.39;
      const spread = Math.abs(s - 0.5) * 0.25;
      m4.makeTranslation(
        Math.cos(a) * spread,
        PCY - WH / 2 + 0.16 + Math.sin(a) * spread,
        lerp(-0.19, 0.0, s),
      );
      holeAir.setMatrixAt(i, m4);
    }
  holeAir.instanceMatrix.needsUpdate = true;

  // ------------------------------------------------ the paperclip
  const clipOn = t >= T.klammer - 0.3 && t < T.ohne;
  clip.visible = clipOn;
  const bendT = clamp01((t - T.biegst + 0.3) / Math.max(0.5, T.bricht - T.biegst + 0.5));
  const bends = t < T.biegst - 0.3 ? 0 : Math.sin(bendT * Math.PI * 2 * 2.5) * 0.9;
  const snap = ramp(t, T.bricht + 0.05, T.bricht + 0.65);
  clipPivot.rotation.x = snap > 0 ? 0.9 + snap * 1.2 : bends;
  clipPivot.position.set(
    snap * 0.4,
    CLIP_Y + BEND_Y * CLIP_S + snap * 0.5 - snap * snap * 1.6,
    snap * 0.6,
  );
  clipPivot.rotation.z = snap * 2.5;
  bendGlow.material.opacity = clipOn ? clamp01(bendT * 1.1) * (snap > 0 ? 1 - snap : 1) * 0.85 : 0;
  bendGlow.material.color.setHex(bendT > 0.75 ? 0xffd27a : 0xff7a1a);
  puff("snap", t, T.bricht + 0.05, CLIP[0], CLIP_Y + BEND_Y * CLIP_S, CLIP[2], 0.6);
  hand.track(t, [
    { t: T.klammer - 0.4, pos: [1.2, 0.5, 0.3], rot: [0, -Math.PI / 2, 0.2], pose: "open" },
    { t: T.klammer + 0.2, pos: [0.62, 0.38, 0.04], rot: [0, -Math.PI / 2, 0.15], pose: "grab" },
    { t: T.bricht + 0.15, pos: [0.62, 0.38, 0.04], rot: [0, -Math.PI / 2, 0.15], pose: "fist" },
    {
      t: T.bricht + 0.45,
      pos: [1.3, 0.6, 0.3],
      rot: [0, -Math.PI / 2, 0.2],
      pose: "open",
      out: true,
    },
  ]);

  // ------------------------------------------------ displays
  // beat 1: outside air thins, inside air stays
  if (t >= T.draussen && t < T.blaest) {
    const k = pop(t, T.draussen, T.blaest);
    const thin = 1 - 0.78 * smooth(ramp(t, T.draussen, T.draussen + 1.2));
    meter("aussen", k, {
      label: "Luft draußen",
      value: thin,
      x: 60,
      y: 1140,
      width: 520,
      color: thin < 0.4 ? "#ff4b2b" : "#4fc3ff",
      text: thin < 0.4 ? "dünn" : "",
    });
    if (t >= T.pumpt)
      meter("innen", pop(t, T.pumpt, T.blaest), {
        label: "Luft drinnen",
        value: smooth(ramp(t, T.pumpt, T.pumpt + 0.8)),
        x: 60,
        y: 1300,
        width: 520,
        color: "#3dff7a",
      });
  }
  // the guess: the force on the window ticks up
  if (t >= T.rate && t < T.kraft1) {
    const v = Math.round(480 * Math.pow(smooth(ramp(t, T.rate + 0.4, T.tonne)), 1.4));
    counter("kg", pop(t, T.rate + 0.6, T.kraft1), {
      label: "Druck aufs Fenster",
      value: `${v} kg`,
      x: 70,
      y: 1170,
    });
  }
  if (t >= T.tonne && t < T.kraft1)
    showPanel(pop(t, T.tonne, T.kraft1), "FAST", "½ TONNE", LED.yellow);
  else showPanel(0);
  // the mid twist: flights 1 → 100
  if (t >= T.trotzdem && t < T.ingenieure) {
    const n = Math.max(1, Math.round(100 * smooth(ramp(t, T.trotzdem + 0.3, T.hundert + 0.4))));
    counter("fluege", pop(t, T.trotzdem + 0.1, T.ingenieure), {
      label: "Flug Nr.",
      value: n,
      x: 70,
      y: 1170,
      color: n >= 100 ? "#3dff7a" : "#ffd23f",
    });
  }
  // the tank test: cycles
  if (t >= T.immer && t < T.riss) {
    const n =
      t >= T.zack ? 3057 : Math.round(3000 * Math.pow(ramp(t, T.immer, T.n3000 + 0.4), 1.7));
    counter("zyklen", pop(t, T.immer, T.riss), {
      label: "Druck-Tests",
      value: n,
      x: 70,
      y: 1170,
      color: t >= T.zack ? "#ff4b2b" : "#ffd23f",
    });
  }

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
