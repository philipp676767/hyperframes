// YouTube #1 "Apollo 11" — the video's world kit (copied into every chapter
// as assets/welt.js by new-chapter.sh / sync-kit.sh). No side effects on
// import: each chapter's set.js calls the builder for its place, and the
// scenes import the vehicles from here.
//
// Places:
//   buildMoon()   the Sea of Tranquility at a low morning sun: dark-grey mare,
//                 craters, a boulder field (the "West crater" rocks), the Earth
//                 high in a black sky — the main world (hook, landing, moonwalk,
//                 finale)
//   buildSpace()  black space with stars, the Earth and the Moon as globes
//                 (flight path, lunar orbit, re-entry)
//   buildPad()    launch pad 39A at dawn: flat Florida scrub, the ocean, the
//                 umbilical tower — the Saturn V chapter
// Vehicles (1 unit = 1 m, true proportions): makeLM() Eagle, makeCSM()
// Columbia, makeSaturnV(), makeAstronaut(), makeEarth(), makeMoonGlobe(),
// makeFlame().
import {
  THREE,
  V,
  flat,
  ground,
  scene,
  onFrame,
  facet,
  facetMat,
  noise2,
  rng,
  jitter,
  real,
  roundedBox,
} from "./world.js";
import { setSky, finishSet, fireflies } from "./environments.js";

const shadowAll = (g) =>
  g.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
const noAO = (o) => {
  o.userData.noAO = true;
  return o;
};

// ---------------------------------------------------------------- materials
export const MAT = {
  gold: new THREE.MeshPhysicalMaterial({
    color: 0xd9a441,
    metalness: 1,
    roughness: 0.3,
    clearcoat: 0.5,
    clearcoatRoughness: 0.2,
  }),
  goldDark: new THREE.MeshPhysicalMaterial({ color: 0x8f6420, metalness: 1, roughness: 0.38 }),
  foilBlack: real.plastic(0x1d1e22, { roughness: 0.55 }),
  lmGrey: real.plastic(0xa9adb1, { roughness: 0.55, clearcoat: 0.1 }),
  lmPanel: real.plastic(0x3a3d42, { roughness: 0.6 }),
  silver: real.metal(0xe6e9ed, { roughness: 0.34 }),
  alu: real.metal(0xd4d8dd, { roughness: 0.5 }),
  white: real.plastic(0xf1f0eb, { roughness: 0.48 }),
  black: real.plastic(0x18191c, { roughness: 0.5 }),
  window: real.gloss(0x0b1220, { roughness: 0.08 }),
  bell: real.metal(0x6c6f74, { roughness: 0.42 }),
  bellDark: real.metal(0x2e2f33, { roughness: 0.5 }),
  red: real.plastic(0xc4322c),
  suit: real.fabric(0xf2f0ea),
  suitGrey: real.fabric(0xb9bcc0),
  visor: new THREE.MeshPhysicalMaterial({
    color: 0xd8a640,
    metalness: 1,
    roughness: 0.06,
    clearcoat: 1,
  }),
};

// ---------------------------------------------------------------- engine flame
// additive cone along -y from its origin; scale.y = length, opacity via k
export function makeFlame({ r = 1, len = 4, color = 0xffb35c, core = 0xfff3d6 } = {}) {
  const g = new THREE.Group();
  const mk = (rad, l, c, op) => {
    const geo = new THREE.ConeGeometry(rad, l, 32, 1, true);
    geo.translate(0, -l / 2, 0);
    geo.rotateX(Math.PI);
    geo.translate(0, 0, 0);
    const m = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({
        color: c,
        transparent: true,
        opacity: op,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        fog: false,
      }),
    );
    // the cone points down: tip at -l
    m.rotation.x = Math.PI;
    return noAO(m);
  };
  const outer = mk(r, len, color, 0.55);
  const inner = mk(r * 0.55, len * 0.6, core, 0.9);
  g.add(outer, inner);
  const light = new THREE.PointLight(color, 0, 30 * r, 1.6);
  light.position.y = -r;
  g.add(light);
  g.userData.set = (k, t = 0) => {
    const fl = 1 + Math.sin(t * 53) * 0.06 + Math.sin(t * 31) * 0.05;
    g.visible = k > 0.01;
    outer.material.opacity = 0.55 * k;
    inner.material.opacity = 0.9 * k;
    g.scale.set(1, Math.max(0.01, k * fl), 1);
    light.intensity = 40 * k * r;
  };
  g.userData.set(0);
  return g;
}

// ---------------------------------------------------------------- Earth
export function makeEarth(R = 26, { clouds = true, spin = 0.025 } = {}) {
  const grp = new THREE.Group();
  const g = new THREE.IcosahedronGeometry(R, 6);
  const ep = g.attributes.position;
  const col = new Float32Array(ep.count * 3);
  const ocean = new THREE.Color(0x1d5bb8);
  const land = [new THREE.Color(0x5b8f45), new THREE.Color(0xa38a58), new THREE.Color(0x3f7a3d)];
  const ice = new THREE.Color(0xf3f7ff);
  const c = new THREE.Color();
  for (let i = 0; i < ep.count; i++) {
    const x = ep.getX(i) / R;
    const y = ep.getY(i) / R;
    const z = ep.getZ(i) / R;
    const n =
      noise2(x * 2.4 + z * 1.4, y * 2.4 - z * 0.8, 5) * 0.7 + noise2(x * 6, y * 6 + z * 3, 6) * 0.3;
    if (Math.abs(y) > 0.86) c.copy(ice);
    else if (n > 0.56) c.copy(land[Math.floor(n * 37) % 3]);
    else c.copy(ocean).multiplyScalar(0.82 + n * 0.32);
    col.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const earth = noAO(
    new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7 })),
  );
  grp.add(earth);
  let cl = null;
  if (clouds) {
    const cg = new THREE.IcosahedronGeometry(R * 1.015, 6);
    const cp = cg.attributes.position;
    const cc = new Float32Array(cp.count * 4);
    for (let i = 0; i < cp.count; i++) {
      const x = cp.getX(i) / R;
      const y = cp.getY(i) / R;
      const z = cp.getZ(i) / R;
      const n =
        noise2(x * 4 - z * 2, y * 4 + z * 2.5, 11) * 0.75 + noise2(x * 11, z * 11, 12) * 0.25;
      cc.set([1, 1, 1, Math.max(0, (n - 0.48) * 2.6)], i * 4);
    }
    cg.setAttribute("color", new THREE.BufferAttribute(cc, 4));
    cl = noAO(
      new THREE.Mesh(
        cg,
        new THREE.MeshStandardMaterial({
          vertexColors: true,
          transparent: true,
          roughness: 1,
          depthWrite: false,
        }),
      ),
    );
    grp.add(cl);
  }
  const atmo = noAO(
    new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.07, 64, 40),
      new THREE.MeshBasicMaterial({
        color: 0x6fb6ff,
        transparent: true,
        opacity: 0.3,
        side: THREE.BackSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        fog: false,
      }),
    ),
  );
  grp.add(atmo);
  onFrame((t) => {
    earth.rotation.y = 0.6 + t * spin;
    if (cl) cl.rotation.y = 0.6 + t * spin * 1.3;
  });
  grp.userData = { earth, atmo };
  return grp;
}

// ---------------------------------------------------------------- Moon globe (space scenes)
export function makeMoonGlobe(R = 7) {
  const g = new THREE.IcosahedronGeometry(R, 6);
  const p = g.attributes.position;
  const col = new Float32Array(p.count * 3);
  const r = rng(77);
  const cr = [];
  for (let i = 0; i < 90; i++) {
    const v = V(r() - 0.5, r() - 0.5, r() - 0.5).normalize();
    cr.push([v, 0.04 + r() ** 2 * 0.22]);
  }
  const base = new THREE.Color(0xb3aea6);
  const mare = new THREE.Color(0x6d6a66);
  const c = new THREE.Color();
  const n = V(0, 0, 0);
  for (let i = 0; i < p.count; i++) {
    n.set(p.getX(i), p.getY(i), p.getZ(i)).normalize();
    let h = 0;
    for (const [cv, rad] of cr) {
      const d = n.angleTo(cv) / rad;
      if (d < 1.4) h += d < 1 ? -0.012 * R * rad * (1 - d * d) * 6 : 0.004 * R * rad * 6;
    }
    p.setXYZ(i, n.x * (R + h), n.y * (R + h), n.z * (R + h));
    const m = noise2(n.x * 2.2 + n.z, n.y * 2.2 - n.z * 0.7, 9);
    c.copy(base).lerp(mare, m > 0.55 ? 0.85 : 0.1);
    c.multiplyScalar(0.9 + noise2(n.x * 9, n.y * 9 + n.z * 4, 3) * 0.2);
    col.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  return noAO(
    new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 })),
  );
}

// ---------------------------------------------------------------- the lunar module "Eagle"
// ~7 m tall, legs 9.4 m across. Origin = ground under the centre. Returns
// { group, descent, ascent, descentFlame, ascentFlame, dsky? }.
export function makeLM() {
  const group = new THREE.Group();
  const descent = new THREE.Group();
  const ascent = new THREE.Group();
  group.add(descent, ascent);

  // descent stage: cross-shaped box in crinkled gold foil, black panels on the quads
  const core = new THREE.Mesh(
    facet(jitter(new THREE.CylinderGeometry(2.15, 2.15, 1.65, 8, 3), 0.035, 2), 0.05, 2),
    MAT.gold,
  );
  core.rotation.y = Math.PI / 8;
  core.position.y = 2.05;
  descent.add(core);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const quad = new THREE.Mesh(roundedBox(1.7, 1.5, 0.5, 0.05), i % 2 ? MAT.foilBlack : MAT.gold);
    quad.position.set(Math.sin(a) * 2.05, 2.05, Math.cos(a) * 2.05);
    quad.rotation.y = a;
    descent.add(quad);
  }
  // descent engine bell
  const dBell = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.78, 1.0, 40, 1, true),
    MAT.bellDark,
  );
  dBell.position.y = 0.85;
  dBell.material.side = THREE.DoubleSide;
  descent.add(dBell);
  const descentFlame = makeFlame({ r: 0.75, len: 5, color: 0xffc27a });
  descentFlame.position.y = 0.38;
  descent.add(descentFlame);
  // four legs with struts, footpads, contact probes (not on the ladder leg)
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const top = V(ca * 2.0, 2.6, sa * 2.0);
    const foot = V(ca * 4.6, 0.32, sa * 4.6);
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, top.distanceTo(foot), 20),
      MAT.goldDark,
    );
    leg.position.copy(top).add(foot).multiplyScalar(0.5);
    leg.quaternion.setFromUnitVectors(V(0, 1, 0), foot.clone().sub(top).normalize());
    descent.add(leg);
    for (const dy of [-1, 1]) {
      const s0 = V(ca * 2.15 - sa * dy * 0.7, 1.4, sa * 2.15 + ca * dy * 0.7);
      const strut = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, s0.distanceTo(foot), 12),
        MAT.alu,
      );
      strut.position.copy(s0).add(foot).multiplyScalar(0.5);
      strut.quaternion.setFromUnitVectors(V(0, 1, 0), foot.clone().sub(s0).normalize());
      descent.add(strut);
    }
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.5, 0.16, 36), MAT.alu);
    pad.position.copy(foot).setY(0.08);
    descent.add(pad);
    if (i !== 1) {
      const probe = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.6, 8), MAT.alu);
      probe.position.copy(foot).setY(-0.7);
      descent.add(probe);
    }
  }
  // ladder + porch on the front (+z) leg
  {
    const lad = new THREE.Group();
    for (const s of [-1, 1]) {
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.9, 10), MAT.alu);
      rail.position.set(s * 0.32, 1.45, 0);
      lad.add(rail);
    }
    for (let i = 0; i < 9; i++) {
      const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.64, 8), MAT.alu);
      rung.rotation.z = Math.PI / 2;
      rung.position.y = 0.3 + i * 0.3;
      lad.add(rung);
    }
    lad.position.set(0, 0.2, 3.25);
    lad.rotation.x = -0.42;
    descent.add(lad);
    const porch = new THREE.Mesh(roundedBox(1.0, 0.06, 0.8, 0.02), MAT.alu);
    porch.position.set(0, 2.95, 2.55);
    descent.add(porch);
  }

  // ascent stage: crew cabin (front, two triangular windows, square hatch),
  // aft equipment bay, docking tunnel, antennas, four RCS quads
  const cabin = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 2.4, 40), MAT.lmGrey);
  cabin.rotation.z = Math.PI / 2;
  cabin.position.set(0, 4.05, 0.25);
  ascent.add(cabin);
  const front = new THREE.Mesh(roundedBox(2.5, 1.9, 1.3, 0.12), MAT.lmGrey);
  front.position.set(0, 4.0, 1.0);
  ascent.add(front);
  // the front face: dark panel, two small slanted windows high up, the hatch below
  const faceBlack = new THREE.Mesh(roundedBox(2.2, 0.75, 0.06, 0.04), MAT.lmPanel);
  faceBlack.position.set(0, 4.62, 1.66);
  faceBlack.rotation.x = -0.35;
  ascent.add(faceBlack);
  const winMat = MAT.window.clone();
  winMat.emissive = new THREE.Color(0xff2a1a);
  winMat.emissiveIntensity = 0;
  for (const s of [-1, 1]) {
    const win = new THREE.Mesh(roundedBox(0.55, 0.32, 0.05, 0.04), winMat);
    win.position.set(s * 0.52, 4.66, 1.74);
    win.rotation.set(-0.35, s * 0.25, s * -0.18);
    ascent.add(win);
  }
  // black thermal blankets on the cabin sides
  for (const s of [-1, 1]) {
    const side = new THREE.Mesh(roundedBox(0.06, 1.3, 1.6, 0.04), MAT.foilBlack);
    side.position.set(s * 1.27, 3.95, 0.6);
    ascent.add(side);
  }
  const hatch = new THREE.Mesh(roundedBox(0.82, 0.82, 0.08, 0.06), MAT.alu);
  hatch.position.set(0, 3.45, 1.7);
  ascent.add(hatch);
  const aft = new THREE.Mesh(roundedBox(2.2, 1.6, 1.4, 0.1), MAT.foilBlack);
  aft.position.set(0, 4.15, -1.3);
  ascent.add(aft);
  const aftGold = new THREE.Mesh(roundedBox(1.8, 0.5, 1.2, 0.08), MAT.gold);
  aftGold.position.set(0, 3.3, -1.25);
  ascent.add(aftGold);
  const tunnel = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.6, 40), MAT.alu);
  tunnel.position.set(0, 5.45, 0.2);
  ascent.add(tunnel);
  // rendezvous radar dish (front top) + S-band dish (side)
  const rr = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 40, 14, 0, Math.PI * 2, 0, 1.0),
    MAT.white,
  );
  rr.material.side = THREE.DoubleSide;
  rr.position.set(0, 5.35, 1.1);
  rr.rotation.x = 1.0;
  ascent.add(rr);
  const sb = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 32, 12, 0, Math.PI * 2, 0, 1.1),
    MAT.white,
  );
  sb.position.set(1.6, 5.15, -0.6);
  sb.rotation.set(0.4, 0, -0.9);
  ascent.add(sb);
  const sbMast = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8), MAT.alu);
  sbMast.position.set(1.3, 4.85, -0.6);
  sbMast.rotation.z = -0.8;
  ascent.add(sbMast);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const q = new THREE.Group();
    q.add(new THREE.Mesh(roundedBox(0.3, 0.3, 0.3, 0.04), MAT.alu));
    for (const [dx, dy, dz, rx, rz] of [
      [0, 0.24, 0, 0, 0],
      [0, -0.24, 0, Math.PI, 0],
      [0.24, 0, 0, 0, -Math.PI / 2],
    ]) {
      const n = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 16, 1, true), MAT.bellDark);
      n.position.set(dx, dy, dz);
      n.rotation.set(rx, 0, rz);
      q.add(n);
    }
    q.position.set(Math.cos(a) * 1.75, 4.3, Math.sin(a) * 1.75 - 0.1);
    q.rotation.y = -a;
    ascent.add(q);
  }
  const ascentFlame = makeFlame({ r: 0.45, len: 3.5, color: 0xffa060 });
  ascentFlame.position.y = 3.0;
  ascent.add(ascentFlame);
  // red warning glow in the cabin windows (the 1202 alarm): setAlarm(k)
  const alarmLight = new THREE.PointLight(0xff3020, 0, 2.2, 2);
  alarmLight.position.set(0, 4.6, 2.2);
  ascent.add(alarmLight);
  const setAlarm = (k) => {
    winMat.emissiveIntensity = 2.2 * k;
    alarmLight.intensity = 1.2 * k;
  };
  shadowAll(group);
  return { group, descent, ascent, descentFlame, ascentFlame, setAlarm };
}

// ---------------------------------------------------------------- the command/service module "Columbia"
// along +y: SPS bell at the bottom (y 0), command module cone on top (~11 m)
export function makeCSM() {
  const group = new THREE.Group();
  const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 1.25, 2.6, 48, 1, true), MAT.bell);
  bell.material.side = THREE.DoubleSide;
  bell.position.y = 1.3;
  group.add(bell);
  const sm = new THREE.Mesh(new THREE.CylinderGeometry(1.95, 1.95, 7.4, 64), MAT.alu);
  sm.position.y = 2.6 + 3.7;
  group.add(sm);
  // radiator stripes + panel seams
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const seam = new THREE.Mesh(new THREE.BoxGeometry(0.04, 7.3, 0.04), MAT.black);
    seam.position.set(Math.cos(a) * 1.96, 6.3, Math.sin(a) * 1.96);
    group.add(seam);
    const rad = new THREE.Mesh(
      new THREE.CylinderGeometry(1.965, 1.965, 2.2, 32, 1, true, a + 0.15, 0.7),
      MAT.white,
    );
    rad.position.y = 7.2;
    group.add(rad);
  }
  // RCS quads
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const q = new THREE.Mesh(roundedBox(0.4, 0.8, 0.4, 0.05), MAT.alu);
    q.position.set(Math.cos(a) * 2.1, 8.3, Math.sin(a) * 2.1);
    group.add(q);
  }
  // high-gain antenna on a boom
  {
    const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 10), MAT.alu);
    boom.position.set(-2.4, 2.9, 0);
    boom.rotation.z = 0.9;
    group.add(boom);
    for (const [dx, dz] of [
      [-0.35, -0.35],
      [0.35, -0.35],
      [-0.35, 0.35],
      [0.35, 0.35],
    ]) {
      const d = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 24, 10, 0, Math.PI * 2, 0, 1.0),
        MAT.white,
      );
      d.material.side = THREE.DoubleSide;
      d.position.set(-3.4 + dx, 2.2, dz);
      d.rotation.z = Math.PI / 2;
      group.add(d);
    }
  }
  // command module: mirror-polished cone, black hatch window, docking probe
  const cm = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 1.95, 3.2, 64), MAT.silver);
  cm.position.y = 10.0 + 1.6;
  group.add(cm);
  const shield = new THREE.Mesh(
    new THREE.CylinderGeometry(1.95, 1.95, 0.1, 64),
    real.metal(0x6f4a2a, { roughness: 0.6 }),
  );
  shield.position.y = 10.0;
  group.add(shield);
  for (const a of [0.4, -0.4, Math.PI - 0.3]) {
    const w = new THREE.Mesh(new THREE.CircleGeometry(0.16, 24), MAT.window);
    const rr = 1.3;
    w.position.set(Math.sin(a) * rr, 11.3, Math.cos(a) * rr);
    w.lookAt(Math.sin(a) * 5, 12.2, Math.cos(a) * 5);
    group.add(w);
  }
  const probe = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 0.9, 16), MAT.alu);
  probe.position.y = 13.6;
  group.add(probe);
  const spsFlame = makeFlame({ r: 1.0, len: 6, color: 0xa8c8ff, core: 0xffffff });
  spsFlame.position.y = 0;
  group.add(spsFlame);
  shadowAll(group);
  return { group, cm, sm, spsFlame, shield };
}

// ---------------------------------------------------------------- Saturn V
// 111 m along +y from y = 0 (bottom of the F-1 bells). Groups per stage so
// a scene can drop them: s1 (0–42 m), s2 (42–67), s3 (67–85 incl. IU),
// top (SLA, CSM, escape tower). Flames: s1Flame (5 engines), s2Flame, s3Flame.
export function makeSaturnV() {
  const group = new THREE.Group();
  const s1 = new THREE.Group();
  const s2 = new THREE.Group();
  const s3 = new THREE.Group();
  const top = new THREE.Group();
  group.add(s1, s2, s3, top);
  const R1 = 5.05;
  const R3 = 3.3;
  // roll pattern: black/white quarters on a cylinder segment
  const quarters = (r, h, y, g, blackFirst = true) => {
    for (let i = 0; i < 4; i++) {
      const m = new THREE.Mesh(
        new THREE.CylinderGeometry(r, r, h, 24, 1, true, (i * Math.PI) / 2, Math.PI / 2),
        (i % 2 === 0) === blackFirst ? MAT.black : MAT.white,
      );
      m.position.y = y;
      g.add(m);
    }
  };
  // S-IC
  const s1body = new THREE.Mesh(new THREE.CylinderGeometry(R1, R1, 30, 64), MAT.white);
  s1body.position.y = 6 + 15 + 5;
  s1.add(s1body);
  quarters(R1 + 0.01, 8, 10, s1);
  quarters(R1 + 0.01, 3, 39, s1, false);
  // black bands
  for (const y of [18.5, 33.5]) {
    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(R1 + 0.02, R1 + 0.02, 0.6, 64),
      MAT.black,
    );
    band.position.y = y;
    s1.add(band);
  }
  const thrust = new THREE.Mesh(new THREE.CylinderGeometry(R1, R1 * 0.9, 3, 64), MAT.black);
  thrust.position.y = 4.5;
  s1.add(thrust);
  // fins + engine fairings
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const fair = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.3, 6.5, 24), MAT.black);
    fair.position.set(Math.cos(a) * (R1 - 0.2), 5.2, Math.sin(a) * (R1 - 0.2));
    s1.add(fair);
    const fs = new THREE.Shape();
    fs.moveTo(0, 0);
    fs.lineTo(3.2, -1.2);
    fs.lineTo(3.2, 1.8);
    fs.lineTo(0, 5);
    fs.lineTo(0, 0);
    const fin = new THREE.Mesh(
      new THREE.ExtrudeGeometry(fs, {
        depth: 0.25,
        bevelEnabled: true,
        bevelSize: 0.05,
        bevelThickness: 0.05,
      }),
      MAT.black,
    );
    fin.position.set(Math.cos(a) * (R1 + 0.6), 3.2, Math.sin(a) * (R1 + 0.6));
    fin.rotation.y = -a;
    s1.add(fin);
  }
  // five F-1 bells
  const f1pos = [[0, 0]];
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    f1pos.push([Math.cos(a) * 3.0, Math.sin(a) * 3.0]);
  }
  const s1Flame = new THREE.Group();
  for (const [x, z] of f1pos) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.85, 3.0, 40, 1, true), MAT.bellDark);
    b.material.side = THREE.DoubleSide;
    b.position.set(x, 1.5, z);
    s1.add(b);
    const f = makeFlame({ r: 1.8, len: 40, color: 0xff9a3c, core: 0xfff1c8 });
    f.position.set(x, 0, z);
    s1Flame.add(f);
  }
  s1.add(s1Flame);
  // S-II
  const s2body = new THREE.Mesh(new THREE.CylinderGeometry(R1, R1, 22, 64), MAT.white);
  s2body.position.y = 42 + 3 + 11;
  s2.add(s2body);
  const inter = new THREE.Mesh(new THREE.CylinderGeometry(R1, R1, 3, 64), MAT.white);
  inter.position.y = 43.5;
  s2.add(inter);
  quarters(R1 + 0.01, 2.6, 66, s2);
  const s2Flame = makeFlame({ r: 2.8, len: 22, color: 0xbfd7ff, core: 0xffffff });
  s2Flame.position.y = 42;
  s2.add(s2Flame);
  // S-IVB: taper 10.1 → 6.6 m, black aft skirt, IU ring
  const taper = new THREE.Mesh(new THREE.CylinderGeometry(R3, R1, 3.5, 64), MAT.white);
  taper.position.y = 67 + 1.75;
  s3.add(taper);
  const s3body = new THREE.Mesh(new THREE.CylinderGeometry(R3, R3, 13, 64), MAT.white);
  s3body.position.y = 70.5 + 6.5;
  s3.add(s3body);
  quarters(R3 + 0.01, 2, 71.5, s3);
  const iu = new THREE.Mesh(new THREE.CylinderGeometry(R3 + 0.02, R3 + 0.02, 1, 64), MAT.lmPanel);
  iu.position.y = 84;
  s3.add(iu);
  const s3Flame = makeFlame({ r: 1.4, len: 14, color: 0xbfd7ff, core: 0xffffff });
  s3Flame.position.y = 67;
  s3.add(s3Flame);
  // SLA (houses the LM), CSM, escape tower
  const sla = new THREE.Mesh(new THREE.CylinderGeometry(1.95, R3, 8.5, 64), MAT.alu);
  sla.position.y = 84.5 + 4.25;
  top.add(sla);
  const sm = new THREE.Mesh(new THREE.CylinderGeometry(1.95, 1.95, 7.4, 64), MAT.alu);
  sm.position.y = 93 + 3.7;
  top.add(sm);
  const cover = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 2.0, 3.4, 64), MAT.white);
  cover.position.y = 100.4 + 1.7;
  top.add(cover);
  const tower = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.5, 6), MAT.red);
    leg.position.set(Math.cos(a) * 0.45, 1.75, Math.sin(a) * 0.45);
    tower.add(leg);
  }
  const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 4.6, 24), MAT.white);
  motor.position.y = 5.8;
  tower.add(motor);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.2, 24), MAT.red);
  nose.position.y = 8.7;
  tower.add(nose);
  tower.position.y = 103.6;
  top.add(tower);
  // "USA"-free: a plain black name band only
  shadowAll(group);
  s1Flame.traverse((o) => o.isMesh && (o.castShadow = false));
  return { group, s1, s2, s3, top, s1Flame, s2Flame, s3Flame, tower };
}

// ---------------------------------------------------------------- astronaut (no face: gold visor)
export function makeAstronaut() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.55, 8, 24), MAT.suit);
  body.position.y = 1.15;
  g.add(body);
  const pack = new THREE.Mesh(roundedBox(0.55, 0.75, 0.3, 0.06), MAT.suit);
  pack.position.set(0, 1.25, -0.3);
  g.add(pack);
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.23, 40, 28), MAT.suit);
  helmet.position.y = 1.72;
  g.add(helmet);
  const visor = new THREE.Mesh(
    new THREE.SphereGeometry(0.235, 40, 20, -0.9, 1.8, 0.7, 1.25),
    MAT.visor,
  );
  visor.position.y = 1.72;
  g.add(visor);
  const limbs = {};
  for (const s of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(s * 0.36, 1.42, 0);
    const a = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.45, 6, 16), MAT.suit);
    a.position.y = -0.3;
    arm.add(a);
    const glove = new THREE.Mesh(new THREE.SphereGeometry(0.09, 20, 14), MAT.suitGrey);
    glove.position.y = -0.62;
    arm.add(glove);
    g.add(arm);
    const leg = new THREE.Group();
    leg.position.set(s * 0.15, 0.82, 0);
    const l = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.5, 6, 16), MAT.suit);
    l.position.y = -0.38;
    leg.add(l);
    const boot = new THREE.Mesh(roundedBox(0.22, 0.14, 0.34, 0.05), MAT.suitGrey);
    boot.position.set(0, -0.76, 0.05);
    leg.add(boot);
    g.add(leg);
    limbs[s < 0 ? "armL" : "armR"] = arm;
    limbs[s < 0 ? "legL" : "legR"] = leg;
  }
  shadowAll(g);
  return { group: g, ...limbs, visor };
}

// ---------------------------------------------------------------- the Moon: Sea of Tranquility
let moonCraters = [];
export function moonHeight(x, z) {
  let y =
    (noise2(x * 0.045, z * 0.045, 3) - 0.5) * 1.0 + (noise2(x * 0.3, z * 0.3, 4) - 0.5) * 0.12;
  for (const [cx, cz, cr] of moonCraters) {
    const q = Math.hypot(x - cx, z - cz) / cr;
    if (q < 1.5) {
      const depth = cr * 0.22;
      y += q < 1 ? -depth * (1 - q * q) : depth * 0.5 * Math.sin(((q - 1) / 0.5) * Math.PI);
    }
  }
  const d = Math.hypot(x, z);
  if (d > 150) y += ((d - 150) / 110) ** 2 * 30 * (0.5 + 0.5 * noise2(x * 0.02, z * 0.02, 7));
  // the landing spot stays flat
  return y * Math.min(1, Math.max(0, (d - 6) / 8));
}

// boulderField = centre of the rock field the autopilot flies into
export const BOULDERS = V(26, 0, -40);
export function buildMoon({ seed = 11, earth = V(-70, 95, -230), sunDir = [-1, 0.16, 0.35] } = {}) {
  const r = rng(seed);
  setSky({
    top: [0.0, 0.0, 0.008],
    mid: [0.006, 0.006, 0.02],
    hor: [0.03, 0.03, 0.05],
    below: [0.02, 0.02, 0.03],
    sun: [1.0, 0.96, 0.88],
    sunDir,
    cloud: [0x000000, 0x000000],
    hemi: [0x8a94b5, 0x2a2725, 0.45],
    key: [0xfff3e0, 3.8],
    keyPos: [sunDir[0] * 12, 7, sunDir[2] * 12],
    rim: [0x7f9cff, 0.8],
    stars: 1.2,
    noClouds: true,
    birds: false,
  });
  scene.fog = null;
  moonCraters = [];
  for (let i = 0; i < 80; i++) {
    const a = r() * Math.PI * 2;
    const d = 14 + r() * 220;
    const cx = Math.cos(a) * d;
    const cz = Math.sin(a) * d - 40;
    const cr = 3 + r() * (d > 80 ? 24 : 8);
    if (Math.hypot(cx, cz) < 14) continue;
    moonCraters.push([cx, cz, cr]);
  }
  // the big crater behind the boulder field ("West crater", ~180 m across in reality)
  moonCraters.push([BOULDERS.x + 14, BOULDERS.z - 22, 22], [-18, -30, 7], [12, 14, 5], [-30, 8, 6]);
  const R = 260;
  const geo = new THREE.PlaneGeometry(R * 2, R * 2, 300, 300);
  geo.rotateX(-Math.PI / 2);
  const gp = geo.attributes.position;
  for (let i = 0; i < gp.count; i++) gp.setY(i, moonHeight(gp.getX(i), gp.getZ(i)));
  geo.computeVertexNormals();
  const gc = new Float32Array(gp.count * 3);
  const base = new THREE.Color(0x6e6b67);
  for (let i = 0; i < gp.count; i++) {
    const x = gp.getX(i);
    const z = gp.getZ(i);
    const v = 0.84 + noise2(x * 0.035, z * 0.035, 21) * 0.2 + noise2(x * 0.28, z * 0.28, 22) * 0.07;
    gc.set([base.r * v, base.g * v, base.b * v * 0.97], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(gc, 3));
  const moonGround = noAO(
    new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.97 })),
  );
  moonGround.receiveShadow = true;
  ground.add(moonGround);

  // rocks everywhere (small) + the boulder field (car-sized)
  const rockGeo = facet(jitter(new THREE.DodecahedronGeometry(1, 1), 0.2, 3), 0.1, 3);
  const rockMat = facetMat(flat(0x77726b));
  const place = (n, fn) => {
    const im = new THREE.InstancedMesh(rockGeo, rockMat, n);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    for (let k = 0; k < n; k++) {
      const [x, z, s] = fn(k);
      e.set(r() * 3, r() * 3, r() * 3);
      q.setFromEuler(e);
      m.compose(V(x, moonHeight(x, z) + s * 0.25, z), q, V(s, s * 0.72, s * 0.9));
      im.setMatrixAt(k, m);
    }
    im.castShadow = true;
    im.receiveShadow = true;
    ground.add(im);
  };
  place(520, () => {
    const a = r() * Math.PI * 2;
    const d = 7 + r() ** 1.5 * 150;
    return [Math.cos(a) * d, Math.sin(a) * d - 20, 0.04 + r() ** 3 * 0.7];
  });
  place(140, () => {
    const a = r() * Math.PI * 2;
    const d = r() ** 0.7 * 18;
    return [BOULDERS.x + Math.cos(a) * d * 1.4, BOULDERS.z + Math.sin(a) * d, 0.4 + r() ** 2 * 2.0];
  });

  const E = makeEarth(24);
  E.position.copy(earth);
  scene.add(E);
  const sunOnEarth = new THREE.DirectionalLight(0xffffff, 2.4);
  sunOnEarth.position.copy(earth).add(V(sunDir[0] * 60, 10, sunDir[2] * 60 + 20));
  sunOnEarth.target = E;
  scene.add(sunOnEarth);

  // fine dust glinting in the low sun near the landing spot
  fireflies(50, { area: [-8, 8, 0.1, 2.0, -8, 6], color: 0xfff1d6, seed, size: 0.014 });
  finishSet({ ground: 0x6c6965 });
  return { earth: E };
}

// ---------------------------------------------------------------- space
export function buildSpace({ stars = 1.6, sunDir = [1, 0.2, 0.4] } = {}) {
  setSky({
    top: [0, 0, 0.004],
    mid: [0.004, 0.004, 0.012],
    hor: [0.01, 0.01, 0.025],
    below: [0.004, 0.004, 0.012],
    sun: [1, 0.97, 0.9],
    sunDir,
    cloud: [0x000000, 0x000000],
    hemi: [0x8090c0, 0x101018, 0.35],
    key: [0xffffff, 3.6],
    keyPos: [sunDir[0] * 20, sunDir[1] * 20 + 6, sunDir[2] * 20],
    rim: [0x6f7dff, 0.9],
    stars,
    noClouds: true,
    birds: false,
  });
  scene.fog = null;
  finishSet({ ground: 0x101014 });
}

// ---------------------------------------------------------------- launch pad 39A at dawn
export function buildPad({ seed = 39 } = {}) {
  const r = rng(seed);
  setSky({
    top: [0.16, 0.24, 0.48],
    mid: [0.55, 0.52, 0.62],
    hor: [1.0, 0.68, 0.42],
    below: [0.3, 0.3, 0.35],
    sun: [1.0, 0.78, 0.5],
    sunDir: [1, 0.12, -0.6],
    cloud: [0xffd2a8, 0xb68c9e],
    hemi: [0xbcc8ff, 0x6a5a48, 0.8],
    key: [0xffd2a0, 3.0],
    keyPos: [40, 18, -25],
    rim: [0xff9f6a, 1.0],
    fog: [160, 900],
    clouds: 10,
    birds: false,
  });
  const R = 600;
  const geo = new THREE.PlaneGeometry(R * 2, R * 2, 160, 160);
  geo.rotateX(-Math.PI / 2);
  const gp = geo.attributes.position;
  const gc = new Float32Array(gp.count * 3);
  const scrub = new THREE.Color(0x6f7a4a);
  const sand = new THREE.Color(0xc9b88f);
  const sea = new THREE.Color(0x2c5876);
  const c = new THREE.Color();
  for (let i = 0; i < gp.count; i++) {
    const x = gp.getX(i);
    const z = gp.getZ(i);
    const d = Math.hypot(x, z);
    let y = d < 70 ? 0 : (noise2(x * 0.02, z * 0.02, 2) - 0.5) * 2;
    if (x > 380) y = -1.2; // the ocean to the east
    gp.setY(i, y);
    if (x > 380) c.copy(sea);
    else if (x > 360 || d < 60) c.copy(sand).multiplyScalar(d < 60 ? 0.92 : 1);
    else c.copy(scrub).multiplyScalar(0.8 + noise2(x * 0.05, z * 0.05, 5) * 0.4);
    gc.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(gc, 3));
  geo.computeVertexNormals();
  const g = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }),
  );
  g.receiveShadow = true;
  ground.add(g);
  // concrete pad + flame trench
  const pad = new THREE.Mesh(
    roundedBox(60, 6, 60, 0.5),
    real.ceramic ? real.ceramic(0xb9b4aa) : flat(0xb9b4aa),
  );
  pad.position.y = 3;
  pad.receiveShadow = true;
  ground.add(pad);
  const trench = new THREE.Mesh(new THREE.BoxGeometry(14, 6.2, 70), flat(0x2a2826));
  trench.position.y = 3.05;
  ground.add(trench);
  // umbilical tower: a red lattice with swing arms
  const tower = new THREE.Group();
  const towerMat = real.metal(0xb4392c, { roughness: 0.55 });
  for (const [x, z] of [
    [-6, -6],
    [6, -6],
    [-6, 6],
    [6, 6],
  ]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.8, 120, 0.8), towerMat);
    p.position.set(x, 60, z);
    tower.add(p);
  }
  for (let y = 4; y < 120; y += 6) {
    for (const [x, z, w, d] of [
      [0, -6, 12.8, 0.5],
      [0, 6, 12.8, 0.5],
      [-6, 0, 0.5, 12.8],
      [6, 0, 0.5, 12.8],
    ]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.4, d), towerMat);
      b.position.set(x, y, z);
      tower.add(b);
    }
  }
  for (const y of [20, 45, 62, 75, 86, 97]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(14, 1.2, 2.2), towerMat);
    arm.position.set(13, y, 0);
    arm.userData.arm = true;
    tower.add(arm);
  }
  const crane = new THREE.Mesh(new THREE.BoxGeometry(22, 1.4, 1.4), towerMat);
  crane.position.set(6, 122, 0);
  tower.add(crane);
  tower.position.set(-26, 6, 0);
  shadowAll(tower);
  ground.add(tower);
  // palms + scrub along the far edge, a water tower, a lightning mast
  for (let i = 0; i < 40; i++) {
    const a = r() * Math.PI * 2;
    const d = 140 + r() * 200;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    if (x > 340) continue;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 12, 8), flat(0x7a6448));
    trunk.position.set(x, 6, z);
    ground.add(trunk);
    const crown = new THREE.Mesh(
      facet(new THREE.IcosahedronGeometry(4, 0), 0.1, i),
      facetMat(flat(0x4f6b3a)),
    );
    crown.position.set(x, 13, z);
    crown.scale.y = 0.5;
    ground.add(crown);
  }
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 140, 8), flat(0xd9d9d9));
  mast.position.set(-40, 70, 30);
  ground.add(mast);
  finishSet({ ground: 0x8e8a72 });
  return { tower };
}

// ---------------------------------------------------------------- DSKY (the computer's keyboard + display)
// ~0.6 m wide. The face is a canvas: warning lamps left, green 7-segment
// numbers right, 19 keys below. dsky.show({ verb, noun, r1, r2, r3, alarm, blink })
// redraws it. Built far above the world (DSKY_POS) with its own light so a
// scene can cut to it like a macro shot against black.
export const DSKY_POS = V(0, 400, 0);
export function makeDSKY() {
  const group = new THREE.Group();
  const cv = document.createElement("canvas");
  cv.width = 1024;
  cv.height = 1100;
  const ctx = cv.getContext("2d");
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const body = new THREE.Mesh(
    roundedBox(0.64, 0.69, 0.18, 0.025),
    real.metal(0x8d9196, { roughness: 0.55 }),
  );
  group.add(body);
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(0.6, 0.645),
    new THREE.MeshStandardMaterial({
      map: tex,
      emissiveMap: tex,
      emissive: 0xffffff,
      emissiveIntensity: 0.55,
      roughness: 0.6,
    }),
  );
  face.position.z = 0.091;
  group.add(face);
  for (const [x, y] of [
    [-0.29, 0.31],
    [0.29, 0.31],
    [-0.29, -0.31],
    [0.29, -0.31],
  ]) {
    const screw = new THREE.Mesh(
      new THREE.CylinderGeometry(0.009, 0.009, 0.01, 16),
      real.metal(0xd0d3d6),
    );
    screw.rotation.x = Math.PI / 2;
    screw.position.set(x, y, 0.092);
    group.add(screw);
  }
  const seg = (txt, x, y, size, on = true) => {
    ctx.font = `700 ${size}px "Courier New", monospace`;
    ctx.fillStyle = on ? "#7dff6a" : "#1c3a1c";
    ctx.shadowColor = on ? "#5dff40" : "transparent";
    ctx.shadowBlur = on ? 18 : 0;
    ctx.fillText(txt, x, y);
    ctx.shadowBlur = 0;
  };
  const lamps = [
    "UPLINK ACTY",
    "TEMP",
    "NO ATT",
    "GIMBAL LOCK",
    "STBY",
    "PROG",
    "KEY REL",
    "RESTART",
    "OPR ERR",
    "TRACKER",
  ];
  let last = "";
  const show = (o = {}) => {
    const key = JSON.stringify(o);
    if (key === last) return;
    last = key;
    ctx.fillStyle = "#7c8086";
    ctx.fillRect(0, 0, 1024, 1100);
    // lamp panel
    ctx.fillStyle = "#222428";
    ctx.fillRect(40, 40, 440, 560);
    lamps.forEach((l, i) => {
      const x = 60 + (i % 2) * 210;
      const y = 60 + Math.floor(i / 2) * 106;
      const lit =
        (o.alarm && (l === "PROG" || l === "RESTART")) || (o.alarm && l === "OPR ERR" && false);
      ctx.fillStyle = lit ? "#ffb52e" : "#d9d6cc";
      if (lit) {
        ctx.shadowColor = "#ffa020";
        ctx.shadowBlur = 30;
      }
      ctx.fillRect(x, y, 190, 86);
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#33302a";
      ctx.font = '700 26px "Montserrat", sans-serif';
      ctx.textAlign = "center";
      ctx.fillText(l, x + 95, y + 52);
      ctx.textAlign = "left";
    });
    // number panel
    ctx.fillStyle = "#0b0d0b";
    ctx.fillRect(520, 40, 464, 560);
    ctx.font = '700 22px "Montserrat", sans-serif';
    ctx.fillStyle = "#7dff6a";
    ctx.fillText("PROG", 840, 78);
    ctx.fillText("VERB", 560, 188);
    ctx.fillText("NOUN", 840, 188);
    seg(o.prog ?? "63", 830, 160, 84);
    seg(o.verb ?? "05", 550, 270, 84);
    seg(o.noun ?? "09", 830, 270, 84);
    const rows = [o.r1 ?? "+01202", o.r2 ?? "+00000", o.r3 ?? "+00000"];
    rows.forEach((r, i) => {
      ctx.fillStyle = "#1d321d";
      ctx.fillRect(545, 300 + i * 98, 414, 4);
      seg(r, 548, 386 + i * 98, 96, !(o.blink && i === 0));
    });
    // keys
    const keys = [
      "VERB",
      "+",
      "7",
      "8",
      "9",
      "CLR",
      "PRO",
      "NOUN",
      "−",
      "4",
      "5",
      "6",
      "ENTR",
      "KEY REL",
      "",
      "0",
      "1",
      "2",
      "3",
      "RSET",
    ];
    keys.forEach((k, i) => {
      if (!k) return;
      const col = i % 7;
      const row = Math.floor(i / 7);
      const x = 40 + col * 136;
      const y = 650 + row * 140;
      ctx.fillStyle = "#2b2d31";
      ctx.beginPath();
      ctx.roundRect(x, y, 120, 120, 14);
      ctx.fill();
      ctx.fillStyle = "#f1efe8";
      ctx.font = `800 ${k.length > 3 ? 24 : 44}px "Montserrat", sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(k, x + 60, y + (k.length > 3 ? 70 : 76));
      ctx.textAlign = "left";
    });
    tex.needsUpdate = true;
  };
  show({});
  const key = new THREE.SpotLight(0xfff2e0, 60, 6, 0.6, 0.6, 1.2);
  key.position.set(0.8, 0.9, 1.6);
  key.target = group;
  group.add(key);
  const fill = new THREE.PointLight(0x9fb4ff, 1.2, 4, 1.5);
  fill.position.set(-1, -0.4, 0.8);
  group.add(fill);
  shadowAll(group);
  return { group, show };
}

// ---------------------------------------------------------------- a phone (the viewer's)
export function makePhone() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    roundedBox(0.075, 0.155, 0.008, 0.012),
    real.metal(0x3b3d42, { roughness: 0.25 }),
  );
  g.add(body);
  const cv = document.createElement("canvas");
  cv.width = 300;
  cv.height = 620;
  const c = cv.getContext("2d");
  const gr = c.createLinearGradient(0, 0, 0, 620);
  gr.addColorStop(0, "#1b2a5a");
  gr.addColorStop(0.55, "#e98a4a");
  gr.addColorStop(1, "#30251f");
  c.fillStyle = gr;
  c.fillRect(0, 0, 300, 620);
  c.fillStyle = "#fff4d8";
  c.beginPath();
  c.arc(210, 200, 40, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#1a1512";
  c.beginPath();
  c.moveTo(0, 470);
  c.lineTo(90, 380);
  c.lineTo(170, 450);
  c.lineTo(240, 400);
  c.lineTo(300, 440);
  c.lineTo(300, 620);
  c.lineTo(0, 620);
  c.fill();
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.069, 0.149),
    new THREE.MeshStandardMaterial({
      map: tex,
      emissiveMap: tex,
      emissive: 0xffffff,
      emissiveIntensity: 0.9,
      roughness: 0.2,
    }),
  );
  screen.position.z = 0.0042;
  g.add(screen);
  shadowAll(g);
  return g;
}

// ---------------------------------------------------------------- the felt-tip pen
export function makePen() {
  const g = new THREE.Group();
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0055, 0.0055, 0.12, 32),
    real.plastic(0xf2f1ec),
  );
  g.add(barrel);
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.006, 0.006, 0.04, 32),
    real.plastic(0x1d1f24),
  );
  cap.position.y = 0.075;
  g.add(cap);
  const clip = new THREE.Mesh(roundedBox(0.003, 0.03, 0.002, 0.001), real.metal(0xd8dadd));
  clip.position.set(0, 0.07, 0.0065);
  g.add(clip);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.0035, 0.012, 24), real.plastic(0x1d1f24));
  tip.position.y = -0.066;
  tip.rotation.x = Math.PI;
  g.add(tip);
  shadowAll(g);
  return g;
}

// ---------------------------------------------------------------- engine dust
// a flat ring of dust blown outward under an engine: dust.set(k, t, x, y, z)
export function makeDust(n = 160, { color = 0xb9b2a6, size = 0.9 } = {}) {
  const geo = new THREE.SphereGeometry(1, 10, 8);
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 1,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
  });
  const im = noAO(new THREE.InstancedMesh(geo, mat, n));
  scene.add(im);
  const r = rng(91);
  const seeds = Array.from({ length: n }, () => [r() * Math.PI * 2, r(), 0.5 + r() * 0.8, r()]);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const set = (k, t, x, y, z) => {
    im.visible = k > 0.01;
    mat.opacity = 0.42 * Math.min(1, k);
    seeds.forEach(([a, ph, sp, h], i) => {
      const u = (t * 0.6 * sp + ph) % 1;
      const d = 1 + u * 14 * Math.min(1.4, k);
      const s = size * (0.4 + u * 1.6) * Math.min(1, k * 1.5);
      m.compose(
        V(x + Math.cos(a) * d, y + 0.2 + h * 0.6 * u, z + Math.sin(a) * d),
        q,
        V(s, s * 0.45, s),
      );
      im.setMatrixAt(i, m);
    });
    im.instanceMatrix.needsUpdate = true;
  };
  set(0, 0, 0, 0, 0);
  return { mesh: im, set };
}
