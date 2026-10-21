// The Erklärbär — the channel mascot from the profile picture
// (tiktok/branding/erklaerbaer-profilbild.html): brown low-poly bear with a
// yellow hard hat and round glasses. It lives in the HUD overlay (world.js
// `hud`), glued to the lower-left of the frame, and plays short acts:
//   peek  — leans in from the left edge, curious head tilt (hook)
//   wow   — pops up, eyes wide, mouth "O", arms up, hops (the trick / re-hook)
//   nod   — slides in and nods along (any "genau" / payoff moment)
//   wave  — slides in and waves until the end (outro / CTA)
// mascot(t, acts) with acts = [{ act, at, until }] (beats.js MASCOT), once per frame.
import { THREE, hud, flat, jitter, ramp, smooth, outBack, inBack, clamp01, END } from "./world.js";

const fur = flat(0xa8693a);
const furDark = flat(0x8a5430);
const light = flat(0xecc49a);
const black = flat(0x231a1c, { roughness: 0.35 });
const white = new THREE.MeshBasicMaterial({ color: 0xffffff });
const blush = flat(0xff8fa3, { transparent: true, opacity: 0.85 });
const frameMat = flat(0x2b2440, { roughness: 0.3, metalness: 0.3 });
const hatMat = flat(0xffc928, { roughness: 0.45 });
const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffd23f });

const mesh = (geo, mat, x, y, z, parent) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  parent.add(m);
  return m;
};

const bear = new THREE.Group();
bear.visible = false;
hud.scene.add(bear);
const rig = new THREE.Group(); // act offsets (hop, lean) on top of the placement
bear.add(rig);

// body / bust
mesh(jitter(new THREE.IcosahedronGeometry(1.25, 2), 0.04, 3), fur, 0, -0.25, 0, rig).scale.set(
  1.15,
  1.0,
  0.9,
);
mesh(jitter(new THREE.IcosahedronGeometry(0.75, 2), 0.03, 4), light, 0, -0.45, 0.55, rig).scale.set(
  1.0,
  1.0,
  0.55,
);

// arms: pivot at the shoulder, rotation.z = s * angle (0.3 = resting, ~2.7 = up)
const arms = [-1, 1].map((s) => {
  const g = new THREE.Group();
  g.position.set(s * 0.95, 0.25, 0.3);
  rig.add(g);
  mesh(jitter(new THREE.CapsuleGeometry(0.3, 0.55, 3, 8), 0.03, 6 + s), furDark, 0, -0.5, 0, g);
  mesh(
    jitter(new THREE.IcosahedronGeometry(0.3, 1), 0.02, 8 + s),
    light,
    0,
    -0.98,
    0.05,
    g,
  ).scale.set(1, 0.85, 0.9);
  g.userData.s = s;
  return g;
});

// head
const head = new THREE.Group();
head.position.set(0, 1.45, 0.15);
rig.add(head);
mesh(jitter(new THREE.IcosahedronGeometry(1.0, 2), 0.035, 11), fur, 0, 0, 0, head).scale.set(
  1.12,
  0.98,
  0.95,
);
for (const s of [-1, 1]) {
  mesh(
    jitter(new THREE.IcosahedronGeometry(0.33, 1), 0.02, 12 + s),
    fur,
    s * 0.78,
    0.7,
    -0.05,
    head,
  ).scale.set(1, 1, 0.6);
  mesh(new THREE.IcosahedronGeometry(0.19, 1), light, s * 0.78, 0.69, 0.1, head).scale.set(
    1,
    1,
    0.4,
  );
  mesh(new THREE.CircleGeometry(0.15, 10), blush, s * 0.62, -0.22, 0.86, head).rotation.y =
    s * 0.55;
}
mesh(
  jitter(new THREE.IcosahedronGeometry(0.45, 2), 0.02, 14),
  light,
  0,
  -0.28,
  0.78,
  head,
).scale.set(1.15, 0.8, 0.75);
mesh(new THREE.IcosahedronGeometry(0.15, 1), black, 0, -0.14, 1.12, head).scale.set(
  1.35,
  0.85,
  0.8,
);
mesh(new THREE.SphereGeometry(0.045, 8, 6), white, -0.06, -0.08, 1.24, head);
const smile = mesh(
  new THREE.TorusGeometry(0.13, 0.025, 6, 16, Math.PI),
  black,
  0,
  -0.38,
  1.08,
  head,
);
smile.rotation.set(0.2, 0, Math.PI);
const mouthO = mesh(new THREE.TorusGeometry(0.09, 0.032, 6, 16), black, 0, -0.4, 1.13, head);
mouthO.scale.set(1, 1.25, 1);
const eyes = [-1, 1].map((s) => {
  const e = new THREE.Group();
  e.position.set(s * 0.36, 0.12, 0.86);
  head.add(e);
  mesh(new THREE.SphereGeometry(0.11, 14, 10), black, 0, 0, 0, e).scale.set(1, 1.15, 0.7);
  mesh(new THREE.SphereGeometry(0.035, 8, 6), white, 0.035, 0.05, 0.09, e);
  return e;
});
for (const s of [-1, 1]) {
  mesh(
    new THREE.TorusGeometry(0.24, 0.035, 8, 28),
    frameMat,
    s * 0.36,
    0.12,
    0.98,
    head,
  ).rotation.y = s * 0.12;
  mesh(
    new THREE.CircleGeometry(0.23, 24),
    new THREE.MeshStandardMaterial({
      color: 0xcfeaff,
      transparent: true,
      opacity: 0.22,
      roughness: 0.05,
    }),
    s * 0.36,
    0.12,
    0.985,
    head,
  );
}
mesh(new THREE.TorusGeometry(0.1, 0.03, 6, 12, Math.PI), frameMat, 0, 0.13, 1.0, head);

// yellow hard hat
const hat = new THREE.Group();
hat.position.set(0, 0.62, -0.02);
hat.rotation.set(-0.12, 0, -0.08);
head.add(hat);
mesh(
  jitter(new THREE.SphereGeometry(0.86, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), 0.015, 21),
  hatMat,
  0,
  0,
  0,
  hat,
).scale.set(1.08, 0.82, 1.0);
mesh(new THREE.CylinderGeometry(1.02, 1.06, 0.07, 24), hatMat, 0, 0.02, 0.1, hat).scale.set(
  1.0,
  1,
  1.05,
);
const ridge = mesh(
  new THREE.TorusGeometry(0.88, 0.075, 6, 28, Math.PI),
  flat(0xffe27a, { roughness: 0.45 }),
  0,
  0,
  0.02,
  hat,
);
ridge.rotation.y = Math.PI / 2;
ridge.scale.set(1.0, 0.83, 1.02);

// "wow" sparkles around the head
const sparks = [0, 1, 2, 3, 4].map((i) => {
  const m = mesh(new THREE.OctahedronGeometry(0.26, 0), sparkMat, 0, 0, 0, rig);
  m.userData.a = 0.5 + i * 0.55;
  return m;
});

// Placement in the HUD frame (x ±1.51, y ±2.68 at z = 0): lower-left corner,
// head at ≈ y 1330-1450 px — above TikTok's description text, clear of the
// captions (y 900-1020) and of the right-hand button column.
const SCALE = 0.42;
const HOME = { x: -0.92, y: -2.0 };

function blink(t) {
  const c = (t + 0.4) % 3.3;
  return c < 0.12 ? 0.15 : 1;
}

// x offscreen -> home, slide eased in over 0.45 s and out over 0.35 s
function slide(t, a, b) {
  const kin = outBack(ramp(t, a, a + 0.45));
  const kout = b >= END ? 0 : inBack(ramp(t, b - 0.35, b));
  return kin * (1 - kout);
}

export function mascot(t, acts) {
  const a = acts.find((x) => t >= x.at && t < (x.until ?? END));
  bear.visible = !!a;
  if (!a) return;
  const until = a.until ?? END;
  const u = t - a.at;
  // reset pose
  rig.position.set(0, 0, 0);
  rig.rotation.set(0, 0, 0);
  head.rotation.set(-0.06, 0.1, 0.05);
  for (const g of arms) g.rotation.set(-0.5, 0, g.userData.s * 0.3);
  smile.visible = true;
  mouthO.visible = false;
  for (const e of eyes) e.scale.set(1, blink(t), 1);
  for (const s of sparks) s.visible = false;
  bear.scale.setScalar(SCALE);
  bear.rotation.set(0, 0.42, 0);

  const k = slide(t, a.at, until);
  if (a.act === "peek") {
    // leaning in from the left edge, half hidden
    bear.position.set(-2.5 + (HOME.x - 0.45 + 2.5) * k, HOME.y + 0.55, 0);
    rig.rotation.z = -0.32;
    head.rotation.z = 0.05 + 0.18 * Math.sin(u * 2.4);
    head.rotation.y = 0.25;
    for (const g of arms) g.rotation.z = g.userData.s * 0.3;
    arms[1].rotation.z = 1.2 + 0.1 * Math.sin(u * 3); // paw on the frame edge
  } else if (a.act === "wow") {
    const p = outBack(ramp(t, a.at, a.at + 0.35)) * (1 - inBack(ramp(t, until - 0.3, until)));
    bear.position.set(HOME.x, HOME.y - 1.6 * (1 - p), 0);
    rig.position.y = 0.35 * Math.abs(Math.sin(u * 7)) * Math.exp(-u * 1.2);
    smile.visible = false;
    mouthO.visible = true;
    for (const e of eyes) e.scale.set(1.3, 1.3 * blink(t + 1.7), 1);
    head.rotation.x = -0.18;
    for (const g of arms) g.rotation.set(0, 0, g.userData.s * (2.5 + 0.15 * Math.sin(u * 10)));
    for (const s of sparks) {
      const r = 1.9 + 0.25 * Math.sin(u * 4 + s.userData.a);
      const ang = s.userData.a + u * 1.3;
      s.visible = u > 0.1;
      s.position.set(Math.cos(ang) * r, 1.45 + Math.sin(ang) * r * 0.75, 0.6);
      s.rotation.set(u * 3, u * 2 + s.userData.a, 0);
      s.scale.setScalar(clamp01(u * 5) * (0.7 + 0.3 * Math.sin(u * 9 + s.userData.a)));
    }
  } else if (a.act === "nod") {
    bear.position.set(-2.6 + (HOME.x + 2.6) * k, HOME.y, 0);
    head.rotation.x = -0.06 + 0.2 * Math.max(0, Math.sin(u * 6));
  } else {
    // wave
    bear.position.set(-2.6 + (HOME.x + 2.6) * k, HOME.y, 0);
    const w = smooth(ramp(t, a.at + 0.25, a.at + 0.6));
    arms[1].rotation.set(-0.2, 0, 0.3 + w * (2.15 + 0.35 * Math.sin(u * 9)));
    head.rotation.z = 0.05 + 0.08 * Math.sin(u * 4.5);
  }
}
