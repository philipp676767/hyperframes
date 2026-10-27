// #39 "Was passiert, wenn du im Flugzeug auf die Spültaste drückst?"
// (format B). A toy airliner on a night flight over the moonlit cloud sea,
// cut open at the lavatory. Frame 0: the viewer's hand hits FLUSH, the bowl
// roars and sucks empty. Then: home flushes with half a bucket, up here a
// glass is enough (or the plane sags under the water), a flap opens under
// the bowl, cabin air rushes into the low-pressure pipe at 480 km/h —
// faster than an F1 car in the aisle — the thin air outside does the
// sucking, a pump only on the ground; everything lands in the tank at the
// tail. Übrigens: a leak freezes into blue ice that drops into the clouds.
// Timing lives in beats.js; renderAt(t) is a pure function of t.
import {
  THREE,
  ramp,
  smooth,
  clamp01,
  lerp,
  pop,
  V,
  rng,
  jitter,
  facet,
  facetMat,
  scene,
  flat,
  M,
  xrayMaterial,
  setXray,
  roundedRect,
  showNope,
  makeArrowSet,
  coldMat,
  animateArrows,
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
import "./set.js";
import { createHand } from "./hand.js";
import { gauge } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS, BUTTON, TANK, VENT, TROLLEY, HOME, ICE } from "./beats.js";

highlights(HIGHLIGHTS);

const D2R = Math.PI / 180;
const Fm = (geo, mat, amt = 0.06, seed = 1) => {
  const m = new THREE.Mesh(facet(geo, amt, seed), facetMat(mat));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
};
const at = (m, x, y, z, parent) => {
  m.position.set(x, y, z);
  parent.add(m);
  return m;
};

// ---------------------------------------------------------------- the plane
// Everything that flies lives in `plane` (it bobs, banks and sags as one).
const plane = new THREE.Group();
scene.add(plane);
const AY = 1.1; // fuselage axis height
const R = 2.4;
const X0 = -15;
const X1 = 15;

const paintMat = xrayMaterial(0xf4f6fb, { flatShading: true, roughness: 0.3 });
const stripeMat = xrayMaterial(0x2a5fd0, { flatShading: true, roughness: 0.3 });
const tailMat = xrayMaterial(0x1e3f8f, { flatShading: true, roughness: 0.35 });
const floorMat = xrayMaterial(0x5c6478, { flatShading: true, roughness: 0.6 });
const shroudMat = xrayMaterial(0xd8d3ca, { flatShading: true, roughness: 0.6 });
const bowlMat = xrayMaterial(0x7d899c, {
  metalness: 0.3,
  roughness: 0.5,
  side: THREE.DoubleSide,
});
const XRAY = [paintMat, stripeMat, tailMat, floorMat];
const XRAY_LAV = [shroudMat, bowlMat];

// shell: an open cylinder along x; the front (+z) gets a cut-out at the
// lavatory so the camera can look in from outside (a dollhouse cut)
function shellGeo(r, x0, x1, nx, np, skip) {
  const pos = [];
  const cell = (x, f) => [x, AY + r * Math.sin(f), r * Math.cos(f)];
  for (let i = 0; i < nx; i++) {
    const xa = x0 + ((x1 - x0) * i) / nx;
    const xb = x0 + ((x1 - x0) * (i + 1)) / nx;
    for (let j = 0; j < np; j++) {
      const fa = (j / np) * Math.PI * 2;
      const fb = ((j + 1) / np) * Math.PI * 2;
      if (skip((xa + xb) / 2, (fa + fb) / 2)) continue;
      const a = cell(xa, fa);
      const b = cell(xb, fa);
      const c = cell(xb, fb);
      const d = cell(xa, fb);
      pos.push(...a, ...b, ...c, ...a, ...c, ...d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}
// cut: x −1.6…1.6, the upper front quarter (angles −35°…80° from +z)
const inCut = (x, f) => {
  let a = f > Math.PI ? f - Math.PI * 2 : f;
  a = a / D2R;
  return Math.abs(x) < 1.6 && a > -38 && a < 85;
};
const shell = new THREE.Mesh(shellGeo(R, X0, X1, 120, 48, inCut), paintMat);
shell.material.side = THREE.DoubleSide;
shell.castShadow = true;
shell.receiveShadow = true;
plane.add(shell);
// cheat line below the windows (outside, slightly bigger radius)
{
  const s = new THREE.Mesh(
    shellGeo(R + 0.012, X0, X1, 120, 96, (x, f) => {
      const a = (f > Math.PI ? f - Math.PI * 2 : f) / D2R;
      return Math.abs(Math.abs(a) - 14) > 3 || (Math.abs(x) < 1.6 && a > -38 && a < 85);
    }),
    stripeMat,
  );
  plane.add(s);
  const back = new THREE.Mesh(
    shellGeo(R + 0.012, X0, X1, 120, 96, (x, f) => {
      const a = (f > Math.PI ? f - Math.PI * 2 : f) / D2R;
      return Math.abs(a - 166) > 3 && Math.abs(a + 166) > 3;
    }),
    stripeMat,
  );
  plane.add(back);
}
// nose (front, −x) and tail cone (+x) as lathed caps
{
  const nosePts = [];
  for (let i = 0; i <= 10; i++) {
    const k = i / 10;
    nosePts.push(new THREE.Vector2(R * Math.sqrt(1 - k * k) + 0.001, -k * 4.2));
  }
  const nose = new THREE.Mesh(
    facet(new THREE.LatheGeometry(nosePts, 24), 0.03, 2),
    facetMat(paintMat),
  );
  nose.rotation.z = -Math.PI / 2;
  nose.position.set(X0, AY, 0);
  nose.castShadow = true;
  plane.add(nose);
  // cockpit windows: dark band on the nose
  const cw = new THREE.Mesh(
    new THREE.SphereGeometry(R * 0.98, 16, 6, -0.9, 1.8, 0.95, 0.35),
    flat(0x1b2440, {
      roughness: 0.15,
      metalness: 0.3,
      emissive: 0x334a88,
      emissiveIntensity: 0.25,
    }),
  );
  cw.scale.set(1.75, 1, 1);
  cw.rotation.y = -Math.PI / 2;
  cw.position.set(X0 - 0.4, AY, 0);
  plane.add(cw);
  const tailPts = [];
  for (let i = 0; i <= 10; i++) {
    const k = i / 10;
    tailPts.push(new THREE.Vector2(lerp(R, 0.35, Math.pow(k, 1.3)), k * 7));
  }
  const tail = new THREE.Mesh(
    facet(new THREE.LatheGeometry(tailPts, 24), 0.03, 3),
    facetMat(paintMat),
  );
  tail.rotation.z = -Math.PI / 2;
  tail.scale.set(1, 1, 1);
  tail.position.set(X1, AY, 0);
  // tail sweeps up: shear by moving the lathe slightly up along its length
  tail.geometry.translate(0, 0, 0);
  const p = tail.geometry.attributes.position;
  for (let i = 0; i < p.count; i++) p.setX(i, p.getX(i) - Math.pow(p.getY(i) / 7, 1.6) * 1.1);
  tail.geometry.computeVertexNormals();
  tail.castShadow = true;
  plane.add(tail);
  // fin
  const finShape = new THREE.Shape();
  finShape.moveTo(0, 0);
  finShape.lineTo(4.6, 0);
  finShape.lineTo(6.0, 5.2);
  finShape.lineTo(4.4, 5.2);
  finShape.lineTo(0, 0);
  const fin = Fm(
    new THREE.ExtrudeGeometry(finShape, {
      depth: 0.3,
      bevelEnabled: true,
      bevelSize: 0.06,
      bevelThickness: 0.06,
      bevelSegments: 1,
    }),
    tailMat,
    0.03,
    5,
  );
  fin.position.set(X1 + 0.3, AY + 1.9, -0.15);
  plane.add(fin);
  // stabilisers
  for (const s of [1, -1]) {
    const st = new THREE.Shape();
    st.moveTo(0, 0);
    st.lineTo(2.6, 0);
    st.lineTo(3.6, 4.2 * s);
    st.lineTo(2.4, 4.2 * s);
    st.lineTo(0, 0);
    const m = Fm(
      new THREE.ExtrudeGeometry(st, { depth: 0.16, bevelEnabled: false }),
      paintMat,
      0.03,
      6,
    );
    m.rotation.x = Math.PI / 2;
    m.position.set(X1 + 3.0, AY + 0.9, 0);
    plane.add(m);
  }
}
// wings + engines (low wing, swept back towards +x)
const fans = [];
for (const s of [1, -1]) {
  const w = new THREE.Shape();
  w.moveTo(0, 0);
  w.lineTo(5.5, 0);
  w.lineTo(9.5, 15 * s);
  w.lineTo(8.2, 15 * s);
  w.lineTo(0, 0);
  const wing = Fm(
    new THREE.ExtrudeGeometry(w, {
      depth: 0.24,
      bevelEnabled: true,
      bevelSize: 0.05,
      bevelThickness: 0.05,
      bevelSegments: 1,
    }),
    paintMat,
    0.03,
    7,
  );
  wing.rotation.x = Math.PI / 2;
  wing.position.set(-2.2, AY - 1.98, 0);
  plane.add(wing);
  // winglet
  const wl = Fm(new THREE.BoxGeometry(1.2, 1.4, 0.12), tailMat, 0.03, 8);
  wl.position.set(-2.2 + 9.1, AY - 1.35, 15 * s);
  wl.rotation.z = -0.4;
  plane.add(wl);
  // engine nacelle with spinning fan
  const eng = new THREE.Group();
  const nac = Fm(new THREE.CylinderGeometry(0.85, 0.75, 3.0, 16, 1, true), paintMat, 0.03, 9);
  nac.rotation.z = Math.PI / 2;
  nac.material.side = THREE.DoubleSide;
  eng.add(nac);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.1, 6, 18), M.chrome);
  lip.rotation.y = Math.PI / 2;
  lip.position.x = -1.5;
  eng.add(lip);
  const fan = new THREE.Group();
  for (let k = 0; k < 9; k++) {
    const b = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.72, 0.18),
      flat(0x9aa2b5, { metalness: 0.5, roughness: 0.3 }),
    );
    b.position.y = 0.38;
    const piv = new THREE.Group();
    piv.rotation.x = (k / 9) * Math.PI * 2;
    b.rotation.y = 0.5;
    piv.add(b);
    fan.add(piv);
  }
  const hub = new THREE.Mesh(
    new THREE.ConeGeometry(0.22, 0.4, 10),
    flat(0xdfe4ef, { metalness: 0.4, roughness: 0.3 }),
  );
  hub.rotation.z = Math.PI / 2;
  fan.add(hub);
  fan.position.x = -1.2;
  eng.add(fan);
  fans.push(fan);
  eng.position.set(1.0, AY - 2.8, 5.6 * s);
  plane.add(eng);
}
// nav lights: red left (+z), green right (−z), white strobes, red beacon
const navMats = [];
function navLight(color, x, y, z) {
  const m = new THREE.MeshBasicMaterial({ color, transparent: true });
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), m);
  b.position.set(x, y, z);
  b.userData.noAO = true;
  plane.add(b);
  navMats.push(m);
  return m;
}
const redNav = navLight(0xff3344, 7.3, AY - 1.85, 15.1);
const greenNav = navLight(0x33ff77, 7.3, AY - 1.85, -15.1);
const strobeA = navLight(0xffffff, 7.6, AY - 1.75, 15.3);
const strobeB = navLight(0xffffff, 7.6, AY - 1.75, -15.3);
const beacon = navLight(0xff2222, 2, AY + R + 0.05, 0);

// ---------------------------------------------------------------- cabin
// floor (x-ray so the pipe below can be seen)
const floor = Fm(new THREE.BoxGeometry(X1 - X0, 0.1, 4.3), floorMat, 0.02, 11);
floor.position.set(0, -0.05, 0);
plane.add(floor);
// aisle carpet
const carpet = new THREE.Mesh(
  new THREE.PlaneGeometry(X1 - X0, 1.0),
  flat(0x3a2f6a, { roughness: 1 }),
);
carpet.rotation.x = -Math.PI / 2;
carpet.position.set(0, 0.006, 0);
plane.add(carpet);
// windows: warm cabin light seen from outside, the moonlit sky from inside
const WIN = [];
for (let x = X0 + 0.8; x < X1 - 0.5; x += 0.95) {
  if (Math.abs(x) < 1.8) continue;
  WIN.push(x);
}
const winGeo = new THREE.ShapeGeometry(roundedRect(0.26, 0.38, 0.12));
const winOut = new THREE.InstancedMesh(
  winGeo,
  flat(0x2a2a3a, { emissive: 0xffc77a, emissiveIntensity: 0.9, roughness: 0.2 }),
  WIN.length * 2,
);
winOut.userData.noAO = true;
{
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const sc = V(1, 1, 1);
  let i = 0;
  for (const side of [1, -1]) {
    const f = 22 * D2R;
    for (const x of WIN) {
      const p = V(x, AY + (R + 0.014) * Math.sin(f), side * (R + 0.014) * Math.cos(f));
      e.set(0, side > 0 ? 0 : Math.PI, 0);
      q.setFromEuler(e);
      m4.compose(p, q, sc);
      winOut.setMatrixAt(i++, m4);
    }
  }
}
plane.add(winOut);
// seats: instanced cushions + backs, two seats each side per row
const seatRows = [];
for (let x = X0 + 1.4; x < X1 - 1.6; x += 0.95) if (Math.abs(x) > 1.4) seatRows.push(x);
const SEATZ = [-1.6, -1.0, 1.0, 1.6];
const nSeats = seatRows.length * SEATZ.length;
const seatMat = flat(0x24357a, { roughness: 0.85 });
const cushions = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 0.16, 0.5), seatMat, nSeats);
const backs = new THREE.InstancedMesh(new THREE.BoxGeometry(0.14, 0.8, 0.5), seatMat, nSeats);
const heads = new THREE.InstancedMesh(
  new THREE.BoxGeometry(0.06, 0.22, 0.44),
  flat(0xeef1f8),
  nSeats,
);
cushions.castShadow = backs.castShadow = true;
{
  const m4 = new THREE.Matrix4();
  let i = 0;
  for (const x of seatRows) {
    for (const z of SEATZ) {
      m4.makeTranslation(x, 0.45, z);
      cushions.setMatrixAt(i, m4);
      m4.makeTranslation(x + 0.26, 0.85, z);
      backs.setMatrixAt(i, m4);
      m4.makeTranslation(x + 0.18, 1.13, z);
      heads.setMatrixAt(i, m4);
      i++;
    }
  }
}
plane.add(cushions, backs, heads);
// sleeping passengers: a few heads + blankets (seeded)
{
  const r = rng(39);
  const skins = [0xf1c09a, 0xc98e66, 0x8d5a3b, 0xf6d2b5];
  const hair = [0x2b1d14, 0x6b4a2a, 0xd9b26a, 0x1a1a1a];
  for (const x of seatRows) {
    for (const z of SEATZ) {
      if (r() > 0.45) continue;
      const g = new THREE.Group();
      const head = Fm(
        new THREE.IcosahedronGeometry(0.15, 1),
        flat(skins[Math.floor(r() * 4)]),
        0.05,
        1,
      );
      head.position.set(0.05, 1.0, 0);
      g.add(head);
      const hr = Fm(
        new THREE.IcosahedronGeometry(0.155, 1),
        flat(hair[Math.floor(r() * 4)]),
        0.05,
        2,
      );
      hr.scale.set(1, 0.7, 1);
      hr.position.set(0.1, 1.06, 0);
      g.add(hr);
      const body = Fm(
        new THREE.BoxGeometry(0.34, 0.42, 0.42),
        flat([0xd94f4f, 0x4fa36b, 0xe0a33a, 0x7a5fc9][Math.floor(r() * 4)]),
        0.05,
        3,
      );
      body.position.set(0.05, 0.72, 0);
      g.add(body);
      g.rotation.z = (r() - 0.5) * 0.2;
      g.position.set(x, 0, z);
      plane.add(g);
    }
  }
}
// overhead bins + blue mood light strip
for (const s of [1, -1]) {
  const bin = Fm(new THREE.BoxGeometry(X1 - X0 - 0.4, 0.42, 0.62), flat(0xe9ecf3), 0.02, 12 + s);
  bin.position.set(0, 2.55, s * 1.42);
  plane.add(bin);
  const strip = new THREE.Mesh(
    new THREE.BoxGeometry(X1 - X0 - 0.4, 0.03, 0.03),
    new THREE.MeshBasicMaterial({ color: 0x6f7dff }),
  );
  strip.position.set(0, 2.32, s * 1.12);
  strip.userData.noAO = true;
  plane.add(strip);
}
const cabinGlow = new THREE.PointLight(0x8f98ff, 6, 9, 1.6);
cabinGlow.position.set(-4, 2.0, 0);
plane.add(cabinGlow);
const cabinGlow2 = new THREE.PointLight(0x8f98ff, 6, 9, 1.6);
cabinGlow2.position.set(5, 2.0, 0);
plane.add(cabinGlow2);

// ---------------------------------------------------------------- lavatory
const lav = new THREE.Group();
plane.add(lav);
const panelMat = flat(0x7d8398, { roughness: 0.55 });
const panelMat2 = flat(0x6a7086, { roughness: 0.55 });
{
  // side walls, back wall, ceiling (the front stays open: we look in)
  for (const s of [1, -1])
    at(
      Fm(new THREE.BoxGeometry(0.06, 2.3, 2.3), panelMat, 0.02, 20 + s),
      0.64 * s,
      1.15,
      -0.62,
      lav,
    );
  at(Fm(new THREE.BoxGeometry(1.34, 2.3, 0.06), panelMat2, 0.02, 22), 0, 1.15, -1.78, lav);
  at(Fm(new THREE.BoxGeometry(1.34, 0.06, 2.3), panelMat, 0.02, 23), 0, 2.3, -0.62, lav);
  // dark floor tiles
  at(
    new THREE.Mesh(new THREE.BoxGeometry(1.26, 0.02, 2.24), flat(0x2f3445, { roughness: 0.4 })),
    0,
    0.01,
    -0.62,
    lav,
  );
  // blue LED strip along the ceiling edge + a ceiling light
  const led = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.03, 0.03),
    new THREE.MeshBasicMaterial({ color: 0x5fc8ff }),
  );
  led.position.set(0, 2.25, -1.72);
  led.userData.noAO = true;
  lav.add(led);
  const lamp = new THREE.SpotLight(0xf2f6ff, 9, 5, 0.6, 0.5, 1.2);
  lamp.position.set(0, 2.2, -0.7);
  lamp.target.position.set(0, 0.3, -1.1);
  lav.add(lamp.target);
  lav.add(lamp);
  // mirror on the left wall
  const mirror = new THREE.Mesh(
    new THREE.PlaneGeometry(0.9, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x9fb7d8, metalness: 0.9, roughness: 0.05 }),
  );
  mirror.rotation.y = Math.PI / 2;
  mirror.position.set(-0.6, 1.55, -0.55);
  lav.add(mirror);
  // "no smoking" sign
  const sign = new THREE.Mesh(
    new THREE.CircleGeometry(0.07, 16),
    new THREE.MeshBasicMaterial({ color: 0xff4d4d }),
  );
  sign.position.set(-0.15, 1.85, -1.745);
  lav.add(sign);
}
// walls etc. vanish in the cut-away (x-ray) part of the video
const lavWalls = lav.children.filter((o) => !o.isLight);
// the toilet: grey shroud, steel bowl, black seat, lid up
const BOWL = V(0, 0.45, -1.1);
{
  const shroud = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.6), shroudMat);
  shroud.position.set(0, 0.1, -1.2);
  lav.add(shroud);
  const pts = [];
  for (let i = 0; i <= 8; i++) {
    const k = i / 8;
    pts.push(new THREE.Vector2(0.05 + 0.18 * Math.sin((k * Math.PI) / 2), -0.25 + k * 0.25));
  }
  const bowl = new THREE.Mesh(new THREE.LatheGeometry(pts, 24), bowlMat);
  bowl.position.copy(BOWL);
  lav.add(bowl);
  const seat = new THREE.Mesh(
    new THREE.TorusGeometry(0.2, 0.035, 6, 20),
    flat(0x22252d, { roughness: 0.4 }),
  );
  seat.rotation.x = Math.PI / 2;
  seat.scale.set(1, 1.15, 1);
  seat.position.set(0, 0.46, -1.1);
  lav.add(seat);
  const lid = Fm(
    new THREE.CylinderGeometry(0.22, 0.22, 0.03, 18),
    flat(0x22252d, { roughness: 0.4 }),
    0.02,
    31,
  );
  lid.scale.set(1, 1, 1.15);
  lid.rotation.x = Math.PI / 2 - 0.15;
  lid.position.set(0, 0.7, -1.4);
  lav.add(lid);
}
// FLUSH button: a glowing blue plate with the word on it
const flushMat = (() => {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const g = c.getContext("2d");
  g.fillStyle = "#1d6fff";
  g.fillRect(0, 0, 256, 128);
  g.fillStyle = "#ffffff";
  g.font = "bold 64px Montserrat, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("FLUSH", 128, 68);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({
    map: tex,
    emissive: 0xffffff,
    emissiveMap: tex,
    emissiveIntensity: 0.9,
  });
})();
const button = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.03), flushMat);
button.position.set(...BUTTON);
lav.add(button);
const buttonRim = at(
  new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.02), M.chrome),
  BUTTON[0],
  BUTTON[1],
  BUTTON[2] - 0.01,
  lav,
);
buttonRim.castShadow = false;

// flap valve at the bottom of the bowl (hinged at its back edge)
const flapPivot = new THREE.Group();
flapPivot.position.set(0, 0.2, -1.15);
lav.add(flapPivot);
const flap = new THREE.Mesh(
  new THREE.CylinderGeometry(0.055, 0.055, 0.015, 14),
  flat(0x3d4250, { metalness: 0.6, roughness: 0.3 }),
);
flap.position.z = 0.055;
flapPivot.add(flap);

// swirl: a glowing cyan funnel of water + air spinning down into the drain
const swirlMat = new THREE.MeshBasicMaterial({
  color: 0x7fe8ff,
  transparent: true,
  opacity: 0.0,
  depthWrite: false,
  side: THREE.DoubleSide,
});
const swirl = new THREE.Group();
const bowlGlow = new THREE.PointLight(0x5fe0ff, 0, 2.2, 1.4);
bowlGlow.position.set(0, 0.55, -1.05);
lav.add(bowlGlow);
{
  for (let k = 0; k < 3; k++) {
    const pts = [];
    for (let i = 0; i <= 60; i++) {
      const f = i / 60;
      const a = f * Math.PI * 5 + (k * Math.PI * 2) / 3;
      const r = 0.19 * (1 - f) + 0.03;
      pts.push(V(Math.cos(a) * r, -f * 0.26, Math.sin(a) * r));
    }
    const m = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 90, 0.018, 6),
      swirlMat,
    );
    m.userData.noAO = true;
    swirl.add(m);
  }
  swirl.position.set(0, 0.45, -1.1);
  lav.add(swirl);
}
// droplets / spray thrown off the swirl
const SPRAY = 40;
const sprayMat = new THREE.MeshBasicMaterial({ color: 0xc9f6ff, transparent: true, opacity: 0.9 });
const spray = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.014, 0), sprayMat, SPRAY);
spray.userData.noAO = true;
spray.frustumCulled = false;
lav.add(spray);
const sprayData = (() => {
  const r = rng(71);
  return Array.from({ length: SPRAY }, () => ({
    a: r() * Math.PI * 2,
    p: r(),
    v: 0.6 + r() * 0.8,
  }));
})();
// a tiny puddle of blue water at the bottom (the "glass")
const water = new THREE.Mesh(
  new THREE.CircleGeometry(0.1, 16),
  new THREE.MeshStandardMaterial({
    color: 0x3fb4ff,
    emissive: 0x1a6fd0,
    emissiveIntensity: 0.5,
    roughness: 0.1,
    transparent: true,
    opacity: 0.85,
  }),
);
water.rotation.x = -Math.PI / 2;
water.position.set(0, 0.235, -1.1);
lav.add(water);
// the paper ball (what gets flushed)
const paper = Fm(jitter(new THREE.IcosahedronGeometry(0.07, 1), 0.02, 9), flat(0xfbfbf6), 0.06, 9);
plane.add(paper);

// ---------------------------------------------------------------- the pipe to the tail
const pipePts = [
  V(0, 0.22, -1.12),
  V(0, -0.15, -1.12),
  V(0.15, -0.5, -1.05),
  V(0.7, -0.62, -0.95),
  V(4, -0.62, -0.9),
  V(8, -0.62, -0.9),
  V(11.6, -0.62, -0.9),
  V(TANK[0] - 1.3, TANK[1], TANK[2]),
];
const pipeCurve = new THREE.CatmullRomCurve3(pipePts, false, "centripetal", 0.2);
const pipeMat = flat(0x9aa6bd, {
  metalness: 0.6,
  roughness: 0.3,
  emissive: 0x2f9bff,
  emissiveIntensity: 0,
});
const pipe = new THREE.Mesh(new THREE.TubeGeometry(pipeCurve, 240, 0.085, 10), pipeMat);
pipe.castShadow = true;
plane.add(pipe);
// the tank: a steel drum under the floor at the back, with a blue fill level
const tank = new THREE.Group();
tank.position.set(...TANK);
plane.add(tank);
const tankMat = new THREE.MeshStandardMaterial({
  color: 0xb7c2d6,
  emissive: 0x2a3a66,
  metalness: 0.7,
  roughness: 0.25,
  transparent: true,
  opacity: 0.8,
  depthWrite: false,
});
{
  const shellT = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 2.6, 20, 1, true), tankMat);
  shellT.rotation.z = Math.PI / 2;
  tank.add(shellT);
  for (const s of [1, -1]) {
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      tankMat,
    );
    cap.rotation.z = (-s * Math.PI) / 2;
    cap.scale.set(1, 0.35, 1);
    cap.position.x = 1.3 * s;
    tank.add(cap);
  }
  for (const x of [-0.8, 0.8]) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.03, 6, 20), M.steel);
    band.rotation.y = Math.PI / 2;
    band.position.x = x;
    tank.add(band);
  }
}
const fillMat = flat(0x2f86ff, { emissive: 0x1a5fd8, emissiveIntensity: 0.55, roughness: 0.2 });
const fill = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1, 0.9), fillMat);
tank.add(fill);
// vent from the tank out through the belly (the sky does the sucking)
const ventCurve = new THREE.CatmullRomCurve3([
  V(TANK[0] + 0.9, TANK[1] + 0.4, TANK[2]),
  V(VENT[0], TANK[1] + 0.3, VENT[2]),
  V(VENT[0], VENT[1] + 0.05, VENT[2]),
]);
const vent = new THREE.Mesh(new THREE.TubeGeometry(ventCurve, 40, 0.06, 8), pipeMat);
plane.add(vent);
const nozzle = at(
  new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.12, 12), M.chrome),
  VENT[0],
  VENT[1],
  VENT[2],
  plane,
);
nozzle.castShadow = false;
// the ground pump next to the tank (a blower with a spinning fan)
const pump = new THREE.Group();
pump.position.set(11.0, -0.75, -0.3);
plane.add(pump);
{
  pump.add(Fm(new THREE.BoxGeometry(0.55, 0.45, 0.45), flat(0x3f8f6a), 0.04, 40));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.03, 6, 16), M.steel);
  ring.position.z = 0.24;
  pump.add(ring);
}
const pumpFan = new THREE.Group();
for (let k = 0; k < 5; k++) {
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.15, 0.02), M.steel);
  b.position.y = 0.08;
  const piv = new THREE.Group();
  piv.rotation.z = (k / 5) * Math.PI * 2;
  piv.add(b);
  pumpFan.add(piv);
}
pumpFan.position.z = 0.25;
pump.add(pumpFan);

// ---------------------------------------------------------------- air particles
// dense blue dots in the cabin air, a few inside the pipe, very few outside
const dotGeo = new THREE.IcosahedronGeometry(0.022, 0);
const dotMat = new THREE.MeshBasicMaterial({ color: 0x7fd0ff, transparent: true, opacity: 0 });
const N_CABIN = 160;
const cabinDots = new THREE.InstancedMesh(dotGeo, dotMat, N_CABIN);
cabinDots.userData.noAO = true;
cabinDots.frustumCulled = false;
plane.add(cabinDots);
const cabinSeed = (() => {
  const r = rng(81);
  return Array.from({ length: N_CABIN }, () => ({
    x: -1.3 + r() * 2.6,
    y: 0.3 + r() * 1.8,
    z: -1.6 + r() * 2.0,
    ph: r() * 6.28,
    s: r(),
  }));
})();
const outMat = new THREE.MeshBasicMaterial({ color: 0x9fdcff, transparent: true, opacity: 0 });
const N_OUT = 14;
const outDots = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.1, 0), outMat, N_OUT);
outDots.userData.noAO = true;
outDots.frustumCulled = false;
plane.add(outDots);
const outSeed = (() => {
  const r = rng(82);
  return Array.from({ length: N_OUT }, () => ({
    x: 10 + r() * 7,
    y: -4.5 + r() * 3,
    z: -3 + r() * 6,
    ph: r() * 6.28,
  }));
})();
// air streaming down the pipe (beads along the curve)
const N_FLOW = 40;
const flowMat = new THREE.MeshBasicMaterial({ color: 0x9fe6ff, transparent: true, opacity: 0 });
const flowDots = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.03, 0), flowMat, N_FLOW);
flowDots.userData.noAO = true;
flowDots.frustumCulled = false;
plane.add(flowDots);

// suction arrows: into the bowl, and out of the vent into the sky
const suckArrows = makeArrowSet(
  [
    [V(0.45, 1.05, -0.5), V(0.08, 0.5, -1.05)],
    [V(-0.45, 1.05, -0.6), V(-0.08, 0.5, -1.1)],
    [V(0.0, 1.25, -0.4), V(0.0, 0.55, -1.0)],
  ],
  { parent: plane, amp: 0.04, mat: coldMat },
);
const skyArrows = makeArrowSet(
  [
    [V(VENT[0], VENT[1] - 0.1, VENT[2]), V(VENT[0] + 0.6, VENT[1] - 2.2, VENT[2] + 0.4)],
    [V(VENT[0] - 0.2, VENT[1] - 0.1, VENT[2]), V(VENT[0] - 0.9, VENT[1] - 2.0, VENT[2] + 0.8)],
    [V(VENT[0] + 0.2, VENT[1] - 0.1, VENT[2]), V(VENT[0] + 1.5, VENT[1] - 1.6, VENT[2] - 0.3)],
  ],
  { parent: plane, amp: 0.06, mat: coldMat },
);

// ---------------------------------------------------------------- analogy props in the aisle
// trolley with a bucket (home flush) and a glass (plane flush)
const trolley = new THREE.Group();
trolley.position.set(...TROLLEY);
plane.add(trolley);
{
  trolley.add(
    at(
      Fm(
        new THREE.BoxGeometry(0.75, 0.95, 0.42),
        flat(0xc9ced8, { metalness: 0.5, roughness: 0.35 }),
        0.03,
        50,
      ),
      0,
      0.5,
      0,
      trolley,
    ),
  );
  for (const x of [-0.3, 0.3])
    for (const z of [-0.16, 0.16])
      at(
        new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 8), M.rubber),
        x,
        0.03,
        z,
        trolley,
      );
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.06, 0.43), flat(0x2a5fd0));
  stripe.position.y = 0.85;
  trolley.add(stripe);
}
const bucket = new THREE.Group();
{
  const b = Fm(new THREE.CylinderGeometry(0.2, 0.15, 0.3, 14, 1, true), flat(0x3f7fe0), 0.04, 51);
  b.material.side = THREE.DoubleSide;
  bucket.add(b);
  const wb = new THREE.Mesh(
    new THREE.CircleGeometry(0.19, 14),
    flat(0x5fc0ff, { emissive: 0x1a6fd0, emissiveIntensity: 0.35 }),
  );
  wb.rotation.x = -Math.PI / 2;
  wb.position.y = 0.11;
  bucket.add(wb);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.01, 4, 16, Math.PI), M.steel);
  handle.position.y = 0.15;
  bucket.add(handle);
  bucket.position.set(-0.15, 1.13, 0);
  trolley.add(bucket);
}
const glass = new THREE.Group();
{
  const gm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.05, 0.16, 12, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0xe8f6ff,
      transparent: true,
      opacity: 0.45,
      roughness: 0.05,
      side: THREE.DoubleSide,
    }),
  );
  glass.add(gm);
  const wg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.048, 0.07, 12),
    flat(0x5fc0ff, { emissive: 0x1a6fd0, emissiveIntensity: 0.35 }),
  );
  wg.position.y = -0.04;
  glass.add(wg);
  glass.position.set(0.24, 1.06, 0);
  trolley.add(glass);
}
// the home toilet (white ceramic) with a snail on the rim
const home = new THREE.Group();
home.position.set(...HOME);
plane.add(home);
{
  const cer = flat(0xf7f7f4, { roughness: 0.25 });
  const base = Fm(new THREE.CylinderGeometry(0.16, 0.2, 0.34, 14), cer, 0.03, 60);
  base.position.y = 0.17;
  home.add(base);
  const bowlPts = [];
  for (let i = 0; i <= 8; i++) {
    const k = i / 8;
    bowlPts.push(new THREE.Vector2(0.06 + 0.2 * Math.sin((k * Math.PI) / 2), k * 0.18));
  }
  const hb = new THREE.Mesh(
    new THREE.LatheGeometry(bowlPts, 20),
    new THREE.MeshStandardMaterial({ color: 0xf7f7f4, roughness: 0.25, side: THREE.DoubleSide }),
  );
  hb.scale.set(1, 1, 1.2);
  hb.position.y = 0.3;
  home.add(hb);
  const cistern = Fm(new THREE.BoxGeometry(0.42, 0.42, 0.16), cer, 0.03, 61);
  cistern.position.set(0, 0.65, -0.28);
  home.add(cistern);
  const hw = new THREE.Mesh(
    new THREE.CircleGeometry(0.17, 18),
    flat(0x6fd0ff, { emissive: 0x1a6fd0, emissiveIntensity: 0.3 }),
  );
  hw.rotation.x = -Math.PI / 2;
  hw.scale.set(1, 1.2, 1);
  hw.position.y = 0.42;
  home.add(hw);
}
const snail = new THREE.Group();
{
  const shellS = Fm(new THREE.IcosahedronGeometry(0.05, 1), flat(0xd9873a), 0.06, 70);
  shellS.position.y = 0.055;
  snail.add(shellS);
  const bodyS = Fm(new THREE.CapsuleGeometry(0.018, 0.08, 3, 6), flat(0xc9b48a), 0.04, 71);
  bodyS.rotation.z = Math.PI / 2;
  bodyS.position.y = 0.02;
  snail.add(bodyS);
  for (const z of [-0.012, 0.012]) {
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.05, 4), flat(0xc9b48a));
    st.position.set(-0.055, 0.05, z);
    st.rotation.z = 0.4;
    snail.add(st);
  }
  home.add(snail);
}
// the F1 car racing along the aisle
const car = new THREE.Group();
plane.add(car);
{
  const red = flat(0xe0242c, { roughness: 0.3, metalness: 0.2 });
  const body = Fm(new THREE.BoxGeometry(0.62, 0.08, 0.16), red, 0.03, 80);
  body.position.y = 0.09;
  car.add(body);
  const nose = Fm(new THREE.ConeGeometry(0.06, 0.26, 6), red, 0.03, 81);
  nose.rotation.z = Math.PI / 2;
  nose.position.set(-0.42, 0.08, 0);
  car.add(nose);
  car.add(
    at(Fm(new THREE.BoxGeometry(0.06, 0.02, 0.34), flat(0x1a1a1a), 0.02, 82), -0.5, 0.06, 0, car),
  );
  car.add(
    at(Fm(new THREE.BoxGeometry(0.08, 0.12, 0.3), flat(0x1a1a1a), 0.02, 83), 0.32, 0.2, 0, car),
  );
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), flat(0xffd23f));
  helmet.position.set(0.05, 0.17, 0);
  car.add(helmet);
  for (const x of [-0.28, 0.24])
    for (const z of [-0.12, 0.12]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.06, 12), M.rubber);
      w.rotation.x = Math.PI / 2;
      w.position.set(x, 0.055, z);
      car.add(w);
    }
}

// ---------------------------------------------------------------- blue ice
const iceMat = flat(0x5fc8ff, {
  emissive: 0x1f7fe0,
  emissiveIntensity: 0.55,
  roughness: 0.1,
  metalness: 0.1,
});
const ice = Fm(jitter(new THREE.IcosahedronGeometry(0.19, 1), 0.05, 90), iceMat, 0.08, 90);
plane.add(ice);
const icePos = V(0, 0, 0);
const iceDrip = Fm(new THREE.ConeGeometry(0.12, 0.5, 6), iceMat, 0.05, 91);
iceDrip.rotation.x = Math.PI;
plane.add(iceDrip);

// ---------------------------------------------------------------- hand + camera
const HR = Math.PI + 0.45; // fingers to the back wall, coming in from the right
const hand = createHand({ sleeve: 0x2f2f3a, scale: 0.42 });
const applyCamera = shotCamera(shots);
const carPos = V(0, 0, 0);
const liveLabels = LABELS.map((l) =>
  l.pos === "car" ? { ...l, pos: carPos } : l.pos === "ice" ? { ...l, pos: icePos } : l,
);
const m4 = new THREE.Matrix4();
const qI = new THREE.Quaternion();
const vS = V(1, 1, 1);
const tmp = V(0, 0, 0);

// flush strength 0..1 over time: the frame-0 flush, the repeat on
// "brüllt", the slow-motion flush on "Aber", the x-ray flushes in Folge 2
function flushK(t) {
  const one = (a, d) => (t >= a && t < a + d ? Math.sin(((t - a) / d) * Math.PI) : 0);
  return Math.max(
    one(-0.25, 1.35),
    one(T.bruellt - 0.1, 1.5),
    one(T.aber + 0.35, T.folg - T.aber - 0.35),
    one(T.kabinenluft, 1.8),
  );
}
// where the paper ball is: in the bowl, then shot down the pipe
function paperAt(t) {
  // runs: [start, duration] of the trip from the bowl to the tank
  const runs = [
    [T.aber + 0.6, 1.4, 0.08], // slow-motion vanish (only the first bit of the pipe)
    [T.kabinenluft + 0.25, 1.4, 0.35],
    [T.zahl - 0.15, T.schneller - T.zahl + 0.15, 1.0],
  ];
  for (const [a, d, part] of runs) {
    if (t >= a - 0.6 && t < a + d) {
      if (t < a) return { p: null, bowl: true };
      const k = (t - a) / d;
      return {
        p: pipeCurve.getPointAt(Math.min(0.999, smooth(k) * part + (part === 1 ? 0 : 0))),
        bowl: false,
      };
    }
  }
  return null;
}

// ---------------------------------------------------------------- render
function renderAt(t) {
  // the viewer's hand hits FLUSH on frame 0, again on "Du drückst"
  hand.track(t, [
    { t: -0.6, pos: [0.4, 0.98, -1.58], rot: [-0.2, HR, 0.1], pose: "press" },
    { t: 0.0, pos: [0.4, 0.98, -1.58], rot: [-0.2, HR, 0.1], pose: "press" },
    { t: 0.6, pos: [0.46, 1.02, -1.45], rot: [-0.2, HR, 0.1], pose: "point" },
    { t: 1.15, pos: [0.75, 1.1, -0.9], rot: [-0.3, HR, 0.2], pose: "open", out: true },
    { t: T.spueltaste1 - 0.2, pos: [0.62, 1.05, -1.1], rot: [-0.25, HR, 0.1], pose: "point" },
    { t: T.druecken, pos: [0.46, 1.0, -1.45], rot: [-0.2, HR, 0.1], pose: "point" },
    { t: T.druecken + 0.15, pos: [0.4, 0.98, -1.58], rot: [-0.2, HR, 0.1], pose: "press" },
    { t: T.bruellt - 0.1, pos: [0.6, 1.05, -1.0], rot: [-0.3, HR, 0.2], pose: "open", out: true },
  ]);
  // button lights up while pressed
  const pressed = (t < 0.75 ? 1 : 0) + pop(t, T.druecken + 0.15, T.bruellt + 0.4, 0.1);
  flushMat.emissiveIntensity = 0.9 + 1.6 * Math.min(1, pressed);
  button.position.z = BUTTON[2] - 0.012 * Math.min(1, pressed);

  // the flush: swirl + spray + flap, the puddle drains and refills
  const f = flushK(t);
  swirlMat.opacity = 0.9 * Math.min(1, f * 1.6);
  bowlGlow.intensity = 5 * f;
  swirl.rotation.y = -t * 14;
  swirl.scale.setScalar(0.6 + 0.4 * f);
  for (let i = 0; i < SPRAY; i++) {
    const s = sprayData[i];
    const k = (s.p + t * s.v * 1.6) % 1;
    const r = 0.06 + k * 0.32 * f;
    tmp.set(
      BOWL.x + Math.cos(s.a + t * 6) * r,
      BOWL.y - 0.1 + Math.sin(k * Math.PI) * 0.35 * f,
      BOWL.z + Math.sin(s.a + t * 6) * r,
    );
    vS.setScalar(f > 0.05 ? 1 - k * 0.6 : 0.0001);
    m4.compose(tmp, qI, vS);
    spray.setMatrixAt(i, m4);
  }
  spray.instanceMatrix.needsUpdate = true;
  const flapOpen = Math.max(Math.min(1, f * 2.2), pop(t, T.klappe, T.kabinenluft + 1.8, 0.25));
  flapPivot.rotation.x = -flapOpen * 1.25;
  water.scale.setScalar(Math.max(0.0001, 1 - Math.min(1, f * 2.5)));

  // pipe glows while air rushes through; x-ray from Folge 2 to the payoff
  pipeMat.emissiveIntensity =
    1.4 * Math.max(pop(t, T.dahinter, T.kabinenluft + 1.8), pop(t, T.zahl - 0.15, T.dein1)) +
    0.25 * f +
    0.7 * pop(t, T.dahinter, T.fakt, 0.4);
  const xr =
    smooth(ramp(t, T.dahinter - 0.3, T.dahinter + 0.2)) *
    (1 - ramp(t, T.ehrlich - 0.4, T.ehrlich)) *
    (1 - pop(t, T.wer, T.draussen, 0.2) * 0.6) *
    (1 - pop(t, T.fakt, T.ehrlich, 0.3));
  setXray(XRAY, xr);
  const cutK = pop(t, T.unten - 0.15, T.landet, 0.25);
  setXray(XRAY_LAV, cutK);
  for (const o of lavWalls) o.visible = cutK < 0.5;

  // paper ball: sits in the bowl, then shoots down the pipe
  const pa = paperAt(t);
  paper.visible = !!pa;
  if (pa) {
    if (pa.bowl) paper.position.set(0.02, 0.27 + Math.sin(t * 9) * 0.01, -1.1);
    else paper.position.copy(pa.p);
    paper.rotation.set(t * 7, t * 5, 0);
  }

  // cabin air dots (Folge 2 + Folge 3): dense; they get pulled into the bowl
  const airK = Math.max(pop(t, T.dahinter, T.unterdruck + 1.2), pop(t, T.draussen, T.pumpe));
  dotMat.opacity = 0.85 * airK;
  const pull = ramp(t, T.kabinenluft, T.kabinenluft + 1.6);
  for (let i = 0; i < N_CABIN; i++) {
    const s = cabinSeed[i];
    const base = tmp.set(
      s.x + Math.sin(t * 1.3 + s.ph) * 0.05,
      s.y + Math.cos(t * 1.1 + s.ph) * 0.05,
      s.z,
    );
    const k = clamp01(pull * 1.6 - s.s * 0.6);
    base.lerp(V(0, 0.2, -1.12), smooth(k));
    vS.setScalar(airK > 0.02 && k < 0.98 ? 1 : 0.0001);
    m4.compose(base, qI, vS);
    cabinDots.setMatrixAt(i, m4);
  }
  cabinDots.instanceMatrix.needsUpdate = true;
  // flow beads down the pipe
  const flowK = Math.max(
    pop(t, T.kabinenluft, T.rate),
    pop(t, T.zahl - 0.15, T.dein1),
    pop(t, T.staubsauger, T.pumpe),
  );
  flowMat.opacity = flowK;
  const speed = t > T.zahl - 0.2 && t < T.dein1 ? 0.9 : 0.35;
  for (let i = 0; i < N_FLOW; i++) {
    const u = (i / N_FLOW + t * speed) % 1;
    pipeCurve.getPointAt(u, tmp);
    vS.setScalar(flowK > 0.02 ? 1 : 0.0001);
    m4.compose(tmp, qI, vS);
    flowDots.setMatrixAt(i, m4);
  }
  flowDots.instanceMatrix.needsUpdate = true;
  // thin air outside: a few dots under the belly
  const outK = pop(t, T.draussen, T.boden - 0.2);
  outMat.opacity = 0.9 * outK;
  for (let i = 0; i < N_OUT; i++) {
    const s = outSeed[i];
    tmp.set(s.x + Math.sin(t + s.ph) * 0.2, s.y + Math.cos(t * 0.8 + s.ph) * 0.2, s.z);
    vS.setScalar(outK > 0.02 ? 1 : 0.0001);
    m4.compose(tmp, qI, vS);
    outDots.setMatrixAt(i, m4);
  }
  outDots.instanceMatrix.needsUpdate = true;
  animateArrows(suckArrows, t, pop(t, T.kabinenluft, T.unterdruck + 0.8));
  animateArrows(skyArrows, t, pop(t, T.duenn, T.boden - 0.2));

  // pump spins on "Pumpe"
  const pumpOn = pop(t, T.pumpe - 0.1, T.landet);
  pumpFan.rotation.z = t * 30 * pumpOn;
  pump.position.y = -0.75 + Math.sin(t * 90) * 0.006 * pumpOn;
  pump.scale.copy(squash(t, T.boden - 0.1, 0.6));

  // tank fills on the payoff
  const lvl = 0.12 + 0.5 * smooth(ramp(t, T.landet, T.tank + 0.8));
  fill.scale.y = lvl;
  fill.position.y = -0.45 + lvl / 2;

  // analogy props: trolley with bucket + glass in Folge 1, home toilet in the mid twist
  const trolleyK = pop(t, T.hause1, T.schwer - 0.6, 0.3);
  trolley.visible = trolleyK > 0.01;
  trolley.scale.copy(squash(t, T.hause1 - 0.05)).multiplyScalar(Math.max(0.001, trolleyK));
  bucket.scale.copy(squash(t, T.hause1 + 0.15));
  glass.scale.copy(squash(t, T.glas));
  glass.visible = t >= T.glas - 0.05;
  const homeK = pop(t, T.dein1 - 0.1, T.wer, 0.3);
  home.visible = homeK > 0.01;
  home.scale.copy(squash(t, T.dein1)).multiplyScalar(Math.max(0.001, homeK));
  snail.position.set(
    0.24 * Math.cos(-1.2 + (t - T.dein1) * 0.08),
    0.48,
    0.28 * Math.sin(-1.2 + (t - T.dein1) * 0.08),
  );
  snail.rotation.y = 1.2 - (t - T.dein1) * 0.08;
  // F1 car: races along the aisle — and gets overtaken
  const carK = pop(t, T.schneller - 0.1, T.dein1);
  car.visible = carK > 0.01;
  const cx = lerp(-1.5, 7.0, (t - T.schneller) / (T.dein1 - T.schneller + 0.4));
  car.position.set(cx, 0.01, 0.0);
  car.rotation.y = Math.PI; // nose towards +x
  carPos.set(cx, 0.35, 0).applyMatrix4(plane.matrixWorld);

  // blue ice under the belly: grows on "Leitung", breaks off on "runter"
  const iceGrow = smooth(ramp(t, T.fakt, T.leitung + 0.6));
  const fall = Math.max(0, t - T.blaues - 0.3);
  ice.visible = iceGrow > 0.01 && t < T.ehrlich + 0.5;
  iceDrip.visible = ice.visible && fall === 0;
  ice.scale.setScalar(Math.max(0.001, iceGrow));
  ice.position.set(ICE[0], ICE[1] - 0.28 - 2.4 * fall * fall, ICE[2]);
  ice.rotation.set(fall * 4, fall * 3, 0);
  iceDrip.scale.setScalar(Math.max(0.001, iceGrow));
  iceDrip.position.set(ICE[0] + 0.25, ICE[1] - 0.25, ICE[2] + 0.1);
  icePos.copy(ice.position).applyMatrix4(plane.matrixWorld);

  // plane life: bob, bank, nav lights; it sags under the water on "schwer"
  const sag = pop(t, T.schwer - 0.2, T.aber, 0.4);
  plane.position.y = Math.sin(t * 0.7) * 0.05 - sag * 1.2;
  plane.rotation.z = -sag * 0.12 + Math.sin(t * 0.5) * 0.005;
  plane.rotation.x = Math.sin(t * 0.4) * 0.008;
  plane.updateMatrixWorld(true);
  fans.forEach((fn) => (fn.rotation.x = t * 40));
  const blink = (period, on) => (t % period < on ? 1 : 0.08);
  strobeA.opacity = strobeB.opacity = blink(1.2, 0.08);
  beacon.opacity = blink(1.0, 0.15);
  redNav.opacity = greenNav.opacity = 1;
  showNope(pop(t, T.schwer + 0.15, T.aber), -2, 4.2, 3, 1.6);
  showNope(pop(t, T.nichts + 0.1, T.landung), 12.5, -2.6, 1.0, 0.8);

  // LED / device facts (one at a time)
  const g480 = pop(t, T.zahl - 0.1, T.dein1);
  gauge("speed", g480, {
    label: "IM ROHR",
    value: 480 * smooth(ramp(t, T.zahl - 0.1, T.zahl + 0.6)),
    max: 520,
    unit: "km/h",
    x: 540,
    y: 560,
    color: "#4fc3ff",
  });
  if (t >= T.schwer - 0.2 && t < T.aber)
    showPanel(pop(t, T.schwer - 0.2, T.aber), "WASSER", "ZU VIEL", LED.red);
  else if (t >= T.unterdruck && t < T.rate)
    showPanel(pop(t, T.unterdruck, T.rate), "IM ROHR", "SOG!", LED.blue);
  else if (t >= T.boden - 0.2 && t < T.landet)
    showPanel(pop(t, T.boden - 0.2, T.landet), "AM BODEN", "PUMPE", LED.yellow);
  else if (t >= T.friert && t < T.ehrlich)
    showPanel(pop(t, T.friert, T.ehrlich), "AUSSEN", "−50 °C", LED.blue);
  else showPanel(0);

  puff("trolley", t, T.hause1, TROLLEY[0], 0.05, TROLLEY[2], 1.0);
  puff("home", t, T.dein1, HOME[0], 0.05, HOME[2], 0.9);

  labels(t, liveLabels);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
