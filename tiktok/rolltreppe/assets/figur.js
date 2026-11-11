// #72 Rolltreppe — a real-scale sneaker and a simple smooth figure (1.75 m,
// facing -z = up the escalator, right side = +x). Used by scene.js (the
// rider and the passengers) and set.js (people waiting on the platform).
import { THREE, real, roundedBox, lerp, smooth, clamp01, V } from "./world.js";

const keyed = (keys, t) => {
  let i = 0;
  while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
  const [a, va] = keys[i];
  const [b, vb] = keys[i + 1];
  return lerp(va, vb, smooth(clamp01((t - a) / (b - a))));
};
// foot outline: half width and upper height along the length (0 heel → 1 toe)
const halfW = (t) =>
  0.053 *
  Math.pow(Math.sin(Math.PI * (0.012 + 0.976 * clamp01(t))), 0.5) *
  lerp(0.84, 1, smooth(clamp01(t * 1.7)));
const upperH = (t) =>
  keyed(
    [
      [0, 0.078],
      [0.12, 0.1],
      [0.3, 0.102],
      [0.5, 0.086],
      [0.72, 0.06],
      [0.9, 0.047],
      [1, 0.022],
    ],
    t,
  ) * Math.pow(Math.sin(Math.PI * (0.04 + 0.92 * clamp01(t))), 0.3);
const LEN = 0.29;
const zAt = (t) => LEN / 2 - t * LEN;

function upperGeo() {
  const NZ = 44;
  const NA = 22;
  const pos = [];
  const idx = [];
  for (let i = 0; i <= NZ; i++) {
    const t = i / NZ;
    const w = halfW(t) * 0.95;
    const h = upperH(t);
    for (let j = 0; j <= NA; j++) {
      const a = (Math.PI * j) / NA;
      const c = Math.cos(a);
      pos.push(
        w * Math.sign(c) * Math.pow(Math.abs(c), 0.72),
        0.026 + h * Math.pow(Math.sin(a), 0.62),
        zAt(t),
      );
    }
  }
  for (let i = 0; i < NZ; i++)
    for (let j = 0; j < NA; j++) {
      const a = i * (NA + 1) + j;
      const b = a + NA + 1;
      idx.push(a, a + 1, b, a + 1, b + 1, b);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
function soleGeo(grow, depth) {
  const s = new THREE.Shape();
  const N = 40;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const p = [halfW(t) + grow, -zAt(t)];
    if (i === 0) s.moveTo(...p);
    else s.lineTo(...p);
  }
  for (let i = N; i >= 0; i--) s.lineTo(-(halfW(i / N) + grow), -zAt(i / N));
  const g = new THREE.ExtrudeGeometry(s, {
    depth,
    bevelEnabled: true,
    bevelSize: 0.004,
    bevelThickness: 0.004,
    bevelSegments: 3,
  });
  g.rotateX(-Math.PI / 2);
  return g;
}
let shared;
// origin on the floor under the middle of the foot, toe towards -z
export function makeSneaker({ upper = 0xf3f1ec, accent = 0xd8352a, sole = 0xf6f4ee } = {}) {
  shared ??= { up: upperGeo(), mid: soleGeo(0.004, 0.02), out: soleGeo(0.002, 0.006) };
  const g = new THREE.Group();
  const add = (geo, mat, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    g.add(m);
    return m;
  };
  const upM = real.plastic(upper, { roughness: 0.6, clearcoat: 0.1, side: THREE.DoubleSide });
  const acM = real.plastic(accent, { roughness: 0.5 });
  add(shared.out, real.rubber(0xb98a58), 0, 0.004, 0);
  add(shared.mid, real.rubber(sole, { roughness: 0.7 }), 0, 0.012, 0);
  add(shared.up, upM);
  // padded collar + sock
  const collar = add(new THREE.TorusGeometry(0.031, 0.008, 12, 32), upM, 0, 0.126, 0.078);
  collar.rotation.x = Math.PI / 2 - 0.12;
  collar.scale.set(1, 1.35, 1);
  add(new THREE.CylinderGeometry(0.028, 0.03, 0.16, 28), real.fabric(0xf7f7f5), 0, 0.19, 0.08);
  // laces, heel tab, side stripes
  const laceM = real.fabric(accent);
  for (let i = 0; i < 5; i++) {
    const t = 0.44 + i * 0.065;
    const l = add(
      new THREE.CapsuleGeometry(0.0034, halfW(t) * 0.62, 4, 10),
      laceM,
      0,
      0.027 + upperH(t) + 0.002,
      zAt(t),
    );
    l.rotation.z = Math.PI / 2;
    l.rotation.y = i % 2 ? 0.25 : -0.25;
  }
  add(roundedBox(0.03, 0.045, 0.008, 0.003), acM, 0, 0.09, LEN / 2 - 0.004);
  for (const sx of [-1, 1])
    for (let i = 0; i < 2; i++) {
      const t = 0.4 + i * 0.07;
      const st = add(
        new THREE.CapsuleGeometry(0.0034, 0.042, 4, 10),
        acM,
        sx * (halfW(t) * 0.95 - 0.0025),
        0.065,
        zAt(t),
      );
      st.rotation.x = -0.6;
      st.rotation.z = sx * 0.16;
    }
  return g;
}

const UP = V(0, 1, 0);
function between(mesh, a, b) {
  const d = b.clone().sub(a);
  mesh.position.copy(a).addScaledVector(d, 0.5);
  mesh.quaternion.setFromUnitVectors(UP, d.clone().normalize());
  mesh.scale.set(1, d.length(), 1);
}

export function makeFigure({
  top = 0x2c7a82,
  legs = 0x5a7fb5,
  skin = 0xe2ad8c,
  hair = 0x2a2018,
  pack = 0x23262c,
  shoe = {},
} = {}) {
  const g = new THREE.Group();
  const cast = (m) => {
    m.castShadow = m.receiveShadow = true;
    return m;
  };
  const topM = real.fabric(top);
  const legM = real.fabric(legs);
  const skinM = real.skin(skin);
  const leg = (sx) => {
    const l = new THREE.Group();
    l.position.set(sx * 0.1, 0.9, 0);
    const c = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.086, 0.05, 0.62, 28), legM));
    c.position.y = -0.34;
    l.add(c);
    const hipB = cast(new THREE.Mesh(new THREE.SphereGeometry(0.088, 24, 16), legM));
    hipB.position.y = -0.03;
    l.add(hipB);
    const cuff = cast(new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.008, 10, 28), legM));
    cuff.rotation.x = Math.PI / 2;
    cuff.position.y = -0.648;
    l.add(cuff);
    const s = makeSneaker(shoe);
    s.position.set(0, -0.9, -0.03);
    l.add(s);
    l.userData.shoe = s;
    g.add(l);
    return l;
  };
  const legL = leg(-1);
  const legR = leg(1);
  const body = new THREE.Group();
  g.add(body);
  const torso = cast(new THREE.Mesh(new THREE.CapsuleGeometry(0.165, 0.34, 10, 32), topM));
  torso.position.y = 1.2;
  torso.scale.set(1.22, 1, 0.8);
  body.add(torso);
  const hood = cast(new THREE.Mesh(new THREE.SphereGeometry(0.13, 28, 20), topM));
  hood.position.set(0, 1.5, 0.075);
  hood.scale.set(1.1, 0.8, 0.75);
  body.add(hood);
  if (pack != null) {
    const p = cast(new THREE.Mesh(roundedBox(0.3, 0.4, 0.15, 0.05), real.fabric(pack)));
    p.position.set(0, 1.24, 0.19);
    body.add(p);
    const zip = new THREE.Mesh(roundedBox(0.2, 0.012, 0.012, 0.004), real.plastic(0xffd23f));
    zip.position.set(0, 1.33, 0.268);
    body.add(zip);
  }
  const head = cast(new THREE.Mesh(new THREE.SphereGeometry(0.105, 36, 24), skinM));
  head.position.y = 1.63;
  head.scale.set(0.92, 1.08, 1);
  body.add(head);
  const hr = cast(new THREE.Mesh(new THREE.SphereGeometry(0.112, 32, 20), real.fabric(hair)));
  hr.position.set(0, 1.655, 0.022);
  hr.scale.set(0.95, 0.98, 1);
  body.add(hr);
  const arm = (sx) => {
    const up = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.047, 1, 20), topM));
    const fo = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.047, 0.04, 1, 20), topM));
    const el = cast(new THREE.Mesh(new THREE.SphereGeometry(0.049, 20, 14), topM));
    const sh = cast(new THREE.Mesh(new THREE.SphereGeometry(0.06, 20, 14), topM));
    const hand = new THREE.Group();
    const palm = cast(new THREE.Mesh(roundedBox(0.085, 0.032, 0.1, 0.014), skinM));
    hand.add(palm);
    for (let i = 0; i < 4; i++) {
      const f = cast(new THREE.Mesh(new THREE.CapsuleGeometry(0.0095, 0.045, 4, 10), skinM));
      f.position.set(-0.03 + i * 0.02, -0.014, -0.062);
      f.rotation.x = 0.9;
      hand.add(f);
    }
    body.add(up, fo, el, sh, hand);
    const S = V(sx * 0.215, 1.4, 0);
    sh.position.copy(S);
    return (target) => {
      const E = S.clone()
        .lerp(target, 0.5)
        .add(V(sx * 0.05, -0.1, 0.1));
      between(up, S, E);
      between(fo, E, target);
      el.position.copy(E);
      hand.position.copy(target);
    };
  };
  const reachL = arm(-1);
  const reachR = arm(1);
  reachL(V(-0.26, 0.86, -0.02));
  reachR(V(0.26, 0.86, -0.02));
  return { group: g, body, legL, legR, reachL, reachR };
}
