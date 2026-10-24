// #25 "Was passiert eigentlich, wenn du im Flugzeug die Tür aufmachst?"
// (format B). A toy airliner races over the cloud sea; on frame 0 the
// viewer's hand grabs the lever of the front door from inside. Then: the
// pilot sips his coffee, the plane is higher than Everest, thin air outside
// vs. air pumped into the cabin, that air presses the door into its frame
// with tonnes, a cross-section shows the door is a plug that would have to
// open inwards — so it stays shut even with ten people on a rope.
// Übrigens: frost creeps over the windows (−50 °C). Timing lives in
// beats.js; renderAt(t) is a pure function of t.
import {
  THREE,
  ramp,
  smooth,
  lerp,
  pop,
  V,
  rng,
  jitter,
  facet,
  facetMat,
  scene,
  ground,
  flat,
  M,
  outBack,
  xrayMaterial,
  setXray,
  showNope,
  makeArrowSet,
  animateArrows,
  forceMat,
  coldMat,
  showPanel,
  LED,
  labels,
  squash,
  puff,
  highlights,
  shotCamera,
  renderFrame,
  start,
  roundedRect,
} from "./world.js";
import { createWorld } from "./environments.js";
import { createHand } from "./hand.js";
import { T, AX, SEC, shots, LABELS, HIGHLIGHTS } from "./beats.js";

highlights(HIGHLIGHTS);

// ---------------------------------------------------------------- set (SKILL.md 1b)
// Above the clouds at cruising height, new seed; the airliner is the stage,
// Mount Everest (rising out of the cloud sea) the hero background piece.
createWorld({ env: "wolken", sky: "hoch", seed: 25 });
// the plane is ~25 m long: widen the sun's shadow box so all of it gets shadows
scene.traverse((o) => {
  if (o.isDirectionalLight && o.castShadow) {
    Object.assign(o.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, far: 60 });
    o.shadow.camera.updateProjectionMatrix();
  }
});
// the cloud sea sits deeper, so Everest towers out of it below the plane
ground.position.y = -8;
// the cloud sea doesn't take the plane's shadow (dark blobs far below)
scene.updateMatrixWorld(true);
const wp = new THREE.Vector3();
scene.traverse((o) => {
  if (o.isMesh && o.getWorldPosition(wp).y < -3) o.receiveShadow = false;
});
const D2R = Math.PI / 180;
const F = (geo, mat, amt = 0.06, seed = 1) => {
  const m = new THREE.Mesh(facet(geo, amt, seed), facetMat(mat));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
};

// ---------------------------------------------------------------- fuselage
// A cylinder along x built by hand so the door hole can be left out. Point
// on the shell: (x, AX.y + r·sinφ, r·cosφ) — φ = 0 faces the camera (+z).
const R = AX.R;
function shellGeo(r, x0, x1, nx, p0, p1, np, skip = () => false, inward = false) {
  const pos = [];
  const P = (x, f) => [x, AX.y + r * Math.sin(f), r * Math.cos(f)];
  for (let i = 0; i < nx; i++) {
    const xa = x0 + ((x1 - x0) * i) / nx;
    const xb = x0 + ((x1 - x0) * (i + 1)) / nx;
    for (let j = 0; j < np; j++) {
      const fa = (p0 + ((p1 - p0) * j) / np) * D2R;
      const fb = (p0 + ((p1 - p0) * (j + 1)) / np) * D2R;
      if (skip((xa + xb) / 2, (fa + fb) / 2 / D2R)) continue;
      const a = P(xa, fa);
      const b = P(xb, fa);
      const c = P(xb, fb);
      const d = P(xa, fb);
      // winding chosen so the face points outward (or inward for linings)
      const tris = [
        [a, b, c],
        [a, c, d],
      ];
      for (const [u, v, w] of tris) {
        const n = V(...v)
          .sub(V(...u))
          .cross(V(...w).sub(V(...u)));
        const out = V(0, u[1] - AX.y, u[2]);
        const flip = n.dot(out) < 0 !== inward;
        pos.push(...u, ...(flip ? w : v), ...(flip ? v : w));
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}
const X0 = -9;
const X1 = 7.2;
const NX = 108; // 0.15 m cells: the door edges at ±0.45 sit on the grid
const DOOR_PHI = [-30, 25];
const inDoor = (x, f) => Math.abs(x) < 0.45 && f > DOOR_PHI[0] && f < DOOR_PHI[1];

const paintMat = xrayMaterial(0xf7f9fc, { flatShading: true, roughness: 0.28 });
const tailMat = xrayMaterial(0xf08a3c, { flatShading: true, roughness: 0.35 });
const stripeMat = xrayMaterial(0x2f6fd6, { flatShading: true, roughness: 0.3 });
const doorMat = xrayMaterial(0xf7f9fc, { flatShading: true, roughness: 0.28 });
doorMat.emissive = new THREE.Color(0xffc21a);
doorMat.emissiveIntensity = 0;
const XRAY = [paintMat, tailMat, stripeMat];

const plane = new THREE.Group();
scene.add(plane);
const shell = new THREE.Mesh(shellGeo(R, X0, X1, NX, -180, 180, 72, inDoor), paintMat);
plane.add(shell);
// cheat lines: blue stripe below the windows, an orange pinstripe under it
for (const [p0, p1, mat] of [
  [0.5, 4.5, stripeMat],
  [-2.2, -0.8, tailMat],
]) {
  for (const side of [1, -1]) {
    const a = side > 0 ? p0 : 180 - p1;
    const b = side > 0 ? p1 : 180 - p0;
    const s = new THREE.Mesh(
      shellGeo(R + 0.006, X0, 6.6, NX, a, b, 1, (x) => side > 0 && Math.abs(x) < 0.5),
      mat,
    );
    plane.add(s);
  }
}
// cabin lining (faces inward, only seen from inside)
const lining = new THREE.Mesh(
  shellGeo(R - 0.12, X0, X1, NX, -180, 180, 72, inDoor, true),
  flat(0xf1ebe0, { flatShading: true, roughness: 0.8 }),
);
lining.receiveShadow = true;
plane.add(lining);
// door frame: the jambs between skin and lining
{
  const pos = [];
  const P = (x, f, r) => [x, AX.y + r * Math.sin(f * D2R), r * Math.cos(f * D2R)];
  const quad = (a, b, c, d) => pos.push(...a, ...b, ...c, ...a, ...c, ...d);
  const [fa, fb] = DOOR_PHI;
  const r0 = R - 0.12;
  for (let f = fa; f < fb; f += 5)
    for (const x of [-0.45, 0.45]) quad(P(x, f, r0), P(x, f + 5, r0), P(x, f + 5, R), P(x, f, R));
  for (const f of [fa, fb]) quad(P(-0.45, f, r0), P(0.45, f, r0), P(0.45, f, R), P(-0.45, f, R));
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  plane.add(new THREE.Mesh(g, flat(0x9aa4b2, { side: THREE.DoubleSide })));
}

// the door: outer skin fills the hole exactly; the inner panel is bigger
// than the hole (a plug), with the red lever on it
const door = new THREE.Group();
plane.add(door);
door.add(new THREE.Mesh(shellGeo(R, -0.44, 0.44, 6, -29.5, 24.5, 11), doorMat));
const doorInner = new THREE.Mesh(
  shellGeo(R - 0.2, -0.53, 0.53, 6, -33, 28, 12, () => false, true),
  flat(0xd5dbe3, { flatShading: true, roughness: 0.6 }),
);
door.add(doorInner);
// edge walls of the plug between skin and inner panel (seen in x-ray)
{
  const pos = [];
  const P = (x, f, r) => [x, AX.y + r * Math.sin(f * D2R), r * Math.cos(f * D2R)];
  const quad = (a, b, c, d) => pos.push(...a, ...b, ...c, ...a, ...c, ...d);
  for (let f = -30; f < 25; f += 5)
    for (const s of [-1, 1])
      quad(
        P(0.44 * s, f, R),
        P(0.44 * s, f + 5, R),
        P(0.53 * s, f + 5, R - 0.2),
        P(0.53 * s, f, R - 0.2),
      );
  for (const [f, g2] of [
    [-29.5, -33],
    [24.5, 28],
  ])
    quad(P(-0.44, f, R), P(0.44, f, R), P(0.53, g2, R - 0.2), P(-0.53, g2, R - 0.2));
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  door.add(new THREE.Mesh(g, flat(0xc3cad4, { side: THREE.DoubleSide })));
}
const LEVER_Z = Math.sqrt((R - 0.2) ** 2 - 0.01) - 0.14;
const leverMat = flat(0xe2453c, { roughness: 0.35, emissive: 0xff2a10, emissiveIntensity: 0.12 });
{
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.065, 0.065), leverMat);
  bar.position.set(0, 1.9, LEVER_Z);
  bar.castShadow = true;
  door.add(bar);
  for (const x of [-0.22, 0.22]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.14), M.steel);
    post.position.set(x, 1.9, LEVER_Z + 0.07);
    door.add(post);
  }
  // a porthole in the door, outside and inside
  const glass = flat(0x22324a, { roughness: 0.12, metalness: 0.2 });
  const pane = new THREE.Mesh(new THREE.CircleGeometry(0.12, 18), glass);
  const fp = 15 * D2R;
  pane.position.set(0, AX.y + (R + 0.008) * Math.sin(fp), (R + 0.008) * Math.cos(fp));
  pane.rotation.x = -fp;
  door.add(pane);
  const inPane = new THREE.Mesh(
    new THREE.CircleGeometry(0.12, 18),
    flat(0xbfe4ff, { emissive: 0x8fc8ff, emissiveIntensity: 0.55 }),
  );
  inPane.position.set(0, AX.y + (R - 0.205) * Math.sin(fp), (R - 0.205) * Math.cos(fp));
  inPane.rotation.x = Math.PI - fp;
  door.add(inPane);
}

// EXIT sign above the door, inside
{
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 96;
  const g = c.getContext("2d");
  g.fillStyle = "#e2261c";
  g.fillRect(0, 0, 256, 96);
  g.fillStyle = "#ffffff";
  g.font = "900 70px Montserrat, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("EXIT", 128, 52);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sign = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.19, 0.05), [
    flat(0xdddddd),
    flat(0xdddddd),
    flat(0xdddddd),
    flat(0xdddddd),
    flat(0xdddddd),
    new THREE.MeshBasicMaterial({ map: tex }),
  ]);
  sign.position.set(0, 3.05, 1.42);
  sign.rotation.x = -0.35;
  plane.add(sign);
}

// windows: dark glass outside, bright sky panes inside (instanced)
const WIN = [];
for (let x = -8.5; x <= 6.3; x += 0.75) {
  if (Math.abs(x) > 0.8) WIN.push([x, 1]);
  WIN.push([x, -1]);
}
const winShape = new THREE.ShapeGeometry(roundedRect(0.26, 0.36, 0.11));
// the view out of a window: blue sky, a white cloud sea at the bottom
const viewTex = (() => {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 96;
  const g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 0, 0, 96);
  gr.addColorStop(0, "#3d7fe0");
  gr.addColorStop(0.6, "#a9d2ff");
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 96);
  g.fillStyle = "#ffffff";
  for (const [x, y, r] of [
    [8, 74, 14],
    [28, 78, 16],
    [50, 72, 15],
    [64, 80, 14],
    [0, 86, 12],
  ]) {
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
  g.fillRect(0, 80, 64, 16);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
})();
// ShapeGeometry UVs are in shape units: remap to 0..1
{
  const uv = winShape.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 0.26 + 0.5, uv.getY(i) / 0.36 + 0.5);
}
const winOutMat = flat(0x22324a, { roughness: 0.12, metalness: 0.2, emissive: 0xcfe8ff });
winOutMat.emissiveIntensity = 0;
const winOut = new THREE.InstancedMesh(winShape, winOutMat, WIN.length);
const winIn = new THREE.InstancedMesh(
  winShape,
  new THREE.MeshBasicMaterial({ map: viewTex }),
  WIN.length,
);
{
  const o = new THREE.Object3D();
  WIN.forEach(([x, s], i) => {
    const f = (s > 0 ? 10 : 170) * D2R;
    for (const [mesh, r, flip] of [
      [winOut, R + 0.008, 0],
      [winIn, R - 0.125, Math.PI],
    ]) {
      o.position.set(x, AX.y + r * Math.sin(f), r * Math.cos(f));
      o.rotation.set(-f + flip, 0, 0);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    }
  });
  plane.add(winOut, winIn);
}

// nose with a see-through windshield
const NOSE = new THREE.Group();
plane.add(NOSE);
const glassMat = new THREE.MeshStandardMaterial({
  color: 0x2a5a8a,
  transparent: true,
  opacity: 0.4,
  roughness: 0.05,
  metalness: 0.3,
  depthWrite: false,
});
{
  const g = new THREE.SphereGeometry(R, 36, 18, Math.PI / 2, Math.PI).toNonIndexed();
  const p = g.attributes.position;
  const keep = [];
  const shield = [];
  for (let i = 0; i < p.count; i += 3) {
    let x = 0;
    let y = 0;
    let z = 0;
    for (let k = 0; k < 3; k++) {
      x += p.getX(i + k) / 3;
      y += p.getY(i + k) / 3;
      z += p.getZ(i + k) / 3;
    }
    const tri = [];
    for (let k = 0; k < 3; k++) tri.push(p.getX(i + k), p.getY(i + k), p.getZ(i + k));
    const isShield = x > 0.42 * R && y > 0.12 * R && y < 0.46 * R && Math.abs(z) < 0.62 * R;
    (isShield ? shield : keep).push(...tri);
  }
  const mk = (arr) => {
    const b = new THREE.BufferGeometry();
    b.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
    b.computeVertexNormals();
    return b;
  };
  const cone = new THREE.Mesh(mk(keep), paintMat);
  cone.material.side = THREE.FrontSide;
  NOSE.add(cone);
  const ws = new THREE.Mesh(mk(shield), glassMat);
  ws.userData.noAO = true;
  NOSE.add(ws);
  NOSE.position.set(X1, AX.y, 0);
  NOSE.scale.set(1.6, 1, 1);
}
// cockpit: floor, dashboard with screens, the pilot with sunglasses + coffee
const pilotArm = new THREE.Group();
const cup = new THREE.Group();
const steam = [];
{
  const ck = new THREE.Group();
  plane.add(ck);
  const floorC = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 2.4), flat(0x4a5266));
  floorC.position.set(7.9, 1.2, 0);
  ck.add(floorC);
  const dash = F(new THREE.BoxGeometry(0.5, 0.42, 2.0), flat(0x2c3240), 0.04, 3);
  dash.position.set(8.75, 2.02, 0);
  dash.rotation.z = 0.35;
  ck.add(dash);
  for (const z of [-0.6, -0.2, 0.2, 0.6]) {
    const scr = new THREE.Mesh(
      new THREE.PlaneGeometry(0.28, 0.2),
      flat(0x46d0ff, { emissive: 0x2fb8ff, emissiveIntensity: 1.2 }),
    );
    scr.position.set(8.5, 2.12, z);
    scr.rotation.y = -Math.PI / 2;
    scr.rotation.x = 0.0;
    scr.rotateX(-0.35);
    ck.add(scr);
  }
  const bulk = new THREE.Mesh(
    new THREE.CircleGeometry(R - 0.12, 36),
    flat(0xe9e1d3, { side: THREE.DoubleSide }),
  );
  bulk.position.set(6.4, AX.y, 0);
  bulk.rotation.y = Math.PI / 2;
  ck.add(bulk);
  const cdoor = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.8), flat(0x8a94a6));
  cdoor.position.set(6.39, 1.8, 0);
  cdoor.rotation.y = -Math.PI / 2;
  ck.add(cdoor);
  const rear = new THREE.Mesh(
    new THREE.CircleGeometry(R - 0.12, 36),
    flat(0xe9e1d3, { side: THREE.DoubleSide }),
  );
  rear.position.set(X0 + 0.1, AX.y, 0);
  rear.rotation.y = Math.PI / 2;
  ck.add(rear);
  // the pilot (first officer seat, nearer the camera)
  const pilot = new THREE.Group();
  const skin = flat(0xf1c09a);
  const shirt = flat(0xf4f6fa);
  const navy = flat(0x1f2a44);
  const seat = F(new THREE.BoxGeometry(0.5, 0.9, 0.55), flat(0x3a3f4c), 0.05, 4);
  seat.position.set(-0.32, 0.25, 0);
  pilot.add(seat);
  const torso = F(new THREE.BoxGeometry(0.3, 0.55, 0.44), shirt, 0.04, 5);
  torso.position.set(0, 0.3, 0);
  pilot.add(torso);
  const tie = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.32, 0.07), navy);
  tie.position.set(0.155, 0.36, 0);
  pilot.add(tie);
  for (const s of [-1, 1]) {
    const ep = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.1), flat(0xffd23f));
    ep.position.set(0, 0.58, s * 0.17);
    pilot.add(ep);
  }
  const head = F(new THREE.IcosahedronGeometry(0.15, 1), skin, 0.04, 6);
  head.position.set(0, 0.76, 0);
  pilot.add(head);
  const capB = F(new THREE.CylinderGeometry(0.16, 0.15, 0.1, 12), navy, 0.04, 7);
  capB.position.set(0, 0.9, 0);
  pilot.add(capB);
  const peak = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.02, 0.24), flat(0x111522));
  peak.position.set(0.13, 0.86, 0);
  pilot.add(peak);
  const badge = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.05, 0.07), flat(0xffd23f));
  badge.position.set(0.16, 0.91, 0);
  pilot.add(badge);
  const shades = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.06, 0.24),
    flat(0x111111, { roughness: 0.1, metalness: 0.4 }),
  );
  shades.position.set(0.14, 0.78, 0);
  pilot.add(shades);
  const smile = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.018, 0.08), flat(0x8a3a2a));
  smile.position.set(0.145, 0.68, 0);
  pilot.add(smile);
  // the coffee arm: shoulder pivot, raises the cup to the mouth on "ruhig"
  pilotArm.position.set(0.02, 0.52, 0.2);
  const upper = F(new THREE.BoxGeometry(0.1, 0.32, 0.1), shirt, 0.04, 8);
  upper.position.set(0, -0.16, 0);
  pilotArm.add(upper);
  const fore = F(new THREE.BoxGeometry(0.28, 0.09, 0.09), shirt, 0.04, 9);
  fore.position.set(0.13, -0.31, 0);
  pilotArm.add(fore);
  cup.position.set(0.29, -0.25, 0);
  const mug = F(new THREE.CylinderGeometry(0.045, 0.04, 0.1, 12), flat(0xffffff), 0.03, 10);
  cup.add(mug);
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.04, 12), flat(0x5a3418));
  coffee.rotation.x = -Math.PI / 2;
  coffee.position.y = 0.045;
  cup.add(coffee);
  for (let k = 0; k < 3; k++) {
    const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.03, 0), M.steam);
    cup.add(s);
    steam.push(s);
  }
  pilotArm.add(cup);
  pilot.add(pilotArm);
  pilot.position.set(7.55, 1.72, 0.5);
  pilot.traverse((o) => o.isMesh && (o.castShadow = true));
  ck.add(pilot);
  const lamp = new THREE.PointLight(0xffe2b0, 3, 4, 2);
  lamp.position.set(8.0, 2.8, 0.3);
  ck.add(lamp);
}

// tail cone (swept up), fin, stabilisers
{
  const g = new THREE.CylinderGeometry(0.35, R, 6, 72, 6, true);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const k = (p.getY(i) + 3) / 6; // 0 at the fuselage, 1 at the tail tip
    p.setX(i, p.getX(i) + k * k * 1.4);
  }
  g.computeVertexNormals();
  const cone = new THREE.Mesh(g, paintMat);
  cone.rotation.z = Math.PI / 2;
  cone.position.set(X0 - 3, AX.y, 0);
  plane.add(cone);
  const finShape = new THREE.Shape();
  finShape.moveTo(-10.4, 3.4);
  finShape.lineTo(-13.0, 8.6);
  finShape.lineTo(-14.7, 8.6);
  finShape.lineTo(-15.1, 3.7);
  finShape.closePath();
  const fin = new THREE.Mesh(
    new THREE.ExtrudeGeometry(finShape, { depth: 0.26, bevelEnabled: false }),
    tailMat,
  );
  fin.position.z = -0.13;
  fin.castShadow = true;
  plane.add(fin);
  for (const s of [1, -1]) {
    const st = new THREE.Shape();
    st.moveTo(-12.6, 0.5 * s);
    st.lineTo(-14.5, 4.4 * s);
    st.lineTo(-15.3, 4.4 * s);
    st.lineTo(-14.9, 0.5 * s);
    st.closePath();
    const m = new THREE.Mesh(
      new THREE.ExtrudeGeometry(st, { depth: 0.14, bevelEnabled: false }),
      paintMat,
    );
    m.rotation.x = -Math.PI / 2;
    m.position.y = 3.25;
    m.castShadow = true;
    plane.add(m);
  }
}
// wings, winglets, engines with spinning fans
const fans = [];
{
  for (const s of [1, -1]) {
    const w = new THREE.Shape();
    // shape y = -z (the shape is laid flat with rotation.x = -90°)
    w.moveTo(-2.2, -1.5 * s);
    w.lineTo(-7.4, -14 * s);
    w.lineTo(-8.6, -14 * s);
    w.lineTo(-6.6, -1.5 * s);
    w.closePath();
    const wing = new THREE.Mesh(
      new THREE.ExtrudeGeometry(w, { depth: 0.24, bevelEnabled: false }),
      paintMat,
    );
    wing.rotation.x = -Math.PI / 2;
    wing.position.y = 0.55;
    wing.castShadow = wing.receiveShadow = true;
    plane.add(wing);
    const wl = new THREE.Shape();
    wl.moveTo(0, 0);
    wl.lineTo(-0.6, 1.3);
    wl.lineTo(-1.1, 1.3);
    wl.lineTo(-1.2, 0);
    wl.closePath();
    const winglet = new THREE.Mesh(
      new THREE.ExtrudeGeometry(wl, { depth: 0.08, bevelEnabled: false }),
      tailMat,
    );
    winglet.position.set(-7.4, 0.75, 14 * s - 0.04);
    plane.add(winglet);
    // engine
    const ex = -4.6;
    const ez = 5.2 * s;
    const nac = F(
      new THREE.CylinderGeometry(0.72, 0.6, 3.0, 20, 1, true),
      flat(0xe9edf2, { side: THREE.DoubleSide, roughness: 0.3 }),
      0.04,
      11,
    );
    nac.rotation.z = Math.PI / 2;
    nac.position.set(ex, 0.0, ez);
    plane.add(nac);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.07, 8, 24), M.chrome);
    lip.rotation.y = Math.PI / 2;
    lip.position.set(ex + 1.5, 0.0, ez);
    plane.add(lip);
    const hub = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.35, 12), flat(0x2a2e38));
    hub.rotation.z = -Math.PI / 2;
    hub.position.set(ex + 1.35, 0.0, ez);
    plane.add(hub);
    const fan = new THREE.Group();
    for (let k = 0; k < 14; k++) {
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.6, 0.12),
        flat(0x3a404c, { metalness: 0.5, roughness: 0.3 }),
      );
      blade.position.y = 0.33;
      blade.rotation.y = 0.5;
      const h = new THREE.Group();
      h.rotation.x = (k / 14) * Math.PI * 2;
      h.add(blade);
      fan.add(h);
    }
    fan.position.set(ex + 1.25, 0.0, ez);
    plane.add(fan);
    fans.push(fan);
    const back = new THREE.Mesh(new THREE.CircleGeometry(0.62, 20), flat(0x2a2e38));
    back.rotation.y = Math.PI / 2;
    back.position.set(ex + 1.0, 0.0, ez);
    plane.add(back);
    const pylon = F(new THREE.BoxGeometry(1.8, 0.6, 0.16), paintMat, 0.03, 12);
    pylon.position.set(ex - 0.2, 0.45, ez);
    plane.add(pylon);
  }
}

// ---------------------------------------------------------------- cabin
const FLOOR_Y = 0.85;
{
  const floor = new THREE.Mesh(new THREE.BoxGeometry(X1 - X0 - 0.6, 0.1, 2.98), flat(0x56668a));
  floor.position.set((X0 + X1) / 2 - 0.4, FLOOR_Y - 0.05, 0);
  floor.receiveShadow = true;
  plane.add(floor);
  const aisle = new THREE.Mesh(new THREE.BoxGeometry(X1 - X0 - 0.6, 0.012, 0.5), flat(0x7a88a8));
  aisle.position.set((X0 + X1) / 2 - 0.4, FLOOR_Y + 0.006, 0);
  aisle.receiveShadow = true;
  plane.add(aisle);
  // overhead bins (none over the door)
  const binMat = flat(0xf4f1ea, { roughness: 0.5 });
  for (const s of [1, -1])
    for (const [a, b] of s > 0
      ? [
          [-8.8, -1.0],
          [1.2, 6.3],
        ]
      : [[-8.8, 6.3]]) {
      const bin = F(new THREE.BoxGeometry(b - a, 0.42, 0.5), binMat, 0.02, 13);
      bin.position.set((a + b) / 2, 3.05, s * 1.22);
      plane.add(bin);
    }
  // seats: rows of 3 + 3, blue with white headrest covers
  const ROWS = [];
  for (let k = 0; k < 9; k++) ROWS.push(-1.7 - 0.8 * k);
  for (let k = 0; k < 4; k++) ROWS.push(3.3 + 0.8 * k);
  const ZS = [-1.45, -1.0, -0.55, 0.55, 1.0, 1.45];
  const n = ROWS.length * ZS.length;
  const seatMat = flat(0x2f6fd6, { roughness: 0.7 });
  const cushion = new THREE.InstancedMesh(new THREE.BoxGeometry(0.44, 0.12, 0.42), seatMat, n);
  const back = new THREE.InstancedMesh(new THREE.BoxGeometry(0.1, 0.62, 0.42), seatMat, n);
  const cover = new THREE.InstancedMesh(new THREE.BoxGeometry(0.11, 0.16, 0.36), flat(0xffffff), n);
  const o = new THREE.Object3D();
  let i = 0;
  for (const x of ROWS)
    for (const z of ZS) {
      o.position.set(x, FLOOR_Y + 0.42, z);
      o.updateMatrix();
      cushion.setMatrixAt(i, o.matrix);
      o.position.set(x - 0.24, FLOOR_Y + 0.75, z);
      o.updateMatrix();
      back.setMatrixAt(i, o.matrix);
      o.position.set(x - 0.235, FLOOR_Y + 0.98, z);
      o.updateMatrix();
      cover.setMatrixAt(i, o.matrix);
      i++;
    }
  for (const m of [cushion, back, cover]) {
    m.castShadow = m.receiveShadow = true;
    plane.add(m);
  }
  for (const [x, z] of [
    [-3.5, 0],
    [2.2, 0],
    [-0.6, 0.3],
  ]) {
    const l = new THREE.PointLight(0xfff0d8, 5, 7, 1.6);
    l.position.set(x, 3.1, z);
    plane.add(l);
  }
}

// ---------------------------------------------------------------- speed: clouds + streaks racing past
const SPEED = 11;
const speedPuffs = [];
{
  const mat = facetMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x9fb4d8,
      emissiveIntensity: 0.15,
      roughness: 1,
      flatShading: true,
    }),
  );
  const r = rng(250);
  for (let i = 0; i < 26; i++) {
    const g = new THREE.Group();
    const n = 3 + Math.floor(r() * 3);
    const size = 0.9 + r() * 1.4;
    for (let k = 0; k < n; k++) {
      const geo = jitter(new THREE.IcosahedronGeometry(1, 1), 0.1, 400 + i * 7 + k);
      const pp = geo.attributes.position;
      for (let j = 0; j < pp.count; j++) pp.setY(j, Math.max(pp.getY(j), -0.3));
      geo.computeVertexNormals();
      const m = new THREE.Mesh(facet(geo, 0.05, i + k), mat);
      const s = size * (0.6 + (1 - Math.abs(k - (n - 1) / 2) / n) * 0.6);
      m.scale.set(s * 1.2, s * 0.75, s);
      m.position.set((k - (n - 1) / 2) * size * 1.1, s * 0.3, (r() - 0.5) * size);
      g.add(m);
    }
    let z = (r() - 0.5) * 60;
    if (Math.abs(z) < 4) z += Math.sign(z || 1) * 5;
    const y = r() < 0.75 ? -4.5 + r() * 3.2 : 6 + r() * 4;
    scene.add(g);
    speedPuffs.push({ g, x0: r() * 100, y, z });
  }
}
const STREAKS = 36;
const streakMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.55,
  depthWrite: false,
});
const streaks = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.012, 0.012), streakMat, STREAKS);
streaks.userData.noAO = true;
scene.add(streaks);
const streakSeed = (() => {
  const r = rng(260);
  return Array.from({ length: STREAKS }, () => ({
    x0: r() * 40,
    y: -0.6 + r() * 5.2,
    z: 2.6 + r() * 7,
    len: 0.8 + r() * 1.8,
    v: 26 + r() * 14,
  }));
})();

// ---------------------------------------------------------------- Everest (hero piece)
const everest = new THREE.Group();
{
  const rock = F(jitter(new THREE.ConeGeometry(15, 17, 9, 5), 0.4, 3), flat(0x7d7385), 0.1, 3);
  rock.position.y = -8.5;
  everest.add(rock);
  const snow = F(jitter(new THREE.ConeGeometry(4.8, 5.0, 9, 2), 0.15, 4), flat(0xf6f8ff), 0.06, 4);
  snow.position.y = -2.45;
  everest.add(snow);
  const ridge = F(jitter(new THREE.ConeGeometry(9, 11, 7, 3), 0.7, 5), flat(0x9a92a3), 0.1, 5);
  ridge.position.set(8, -11, 3);
  everest.add(ridge);
  const ridgeSnow = F(
    jitter(new THREE.ConeGeometry(3.6, 4.2, 7, 1), 0.25, 6),
    flat(0xf6f8ff),
    0.06,
    6,
  );
  ridgeSnow.position.set(8, -7.6, 3);
  everest.add(ridgeSnow);
  everest.position.set(0, 0, -30);
  everest.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = false));
  scene.add(everest);
}

// ---------------------------------------------------------------- air particles (Folge 1/2)
const dotGeo = new THREE.IcosahedronGeometry(0.065, 0);
const dotMat = flat(0x58b8ff, { emissive: 0x2f9bff, emissiveIntensity: 0.6 });
const N_IN = 280;
const N_OUT = 34;
const dotsIn = new THREE.InstancedMesh(dotGeo, dotMat, N_IN);
const dotsOut = new THREE.InstancedMesh(dotGeo, dotMat, N_OUT);
dotsIn.userData.noAO = dotsOut.userData.noAO = true;
scene.add(dotsIn, dotsOut);
const inSeed = (() => {
  const r = rng(31);
  return Array.from({ length: N_IN }, () => {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * 1.6;
    return {
      x: -7.6 + r() * 13,
      y: Math.max(FLOOR_Y + 0.15, AX.y + Math.sin(a) * d),
      z: Math.cos(a) * d,
      ph: r() * 6.3,
    };
  });
})();
const outSeed = (() => {
  const r = rng(32);
  return Array.from({ length: N_OUT }, () => {
    const a = (-0.4 + r() * 2.2) * Math.PI * 0.5;
    const d = 2.6 + r() * 3.6;
    return { x0: r() * 18, y: AX.y + Math.sin(a) * d, z: Math.cos(a) * d, ph: r() * 6.3 };
  });
})();
const dm = new THREE.Matrix4();
function updateDots(t, kIn, nIn, kOut) {
  dotsIn.visible = kIn > 0.01;
  dotsOut.visible = kOut > 0.01;
  if (dotsIn.visible) {
    for (let i = 0; i < N_IN; i++) {
      const s = inSeed[i];
      const on = i < nIn ? kIn : 0;
      dm.makeScale(on + 1e-3, on + 1e-3, on + 1e-3);
      dm.setPosition(
        s.x + Math.sin(t * 2.3 + s.ph) * 0.06,
        s.y + Math.sin(t * 2.9 + s.ph * 1.7) * 0.05,
        s.z + Math.sin(t * 2.1 + s.ph * 2.3) * 0.06,
      );
      dotsIn.setMatrixAt(i, dm);
    }
    dotsIn.instanceMatrix.needsUpdate = true;
  }
  if (dotsOut.visible) {
    for (let i = 0; i < N_OUT; i++) {
      const s = outSeed[i];
      dm.makeScale(kOut, kOut, kOut);
      dm.setPosition(9 - ((s.x0 + t * 1.2) % 18), s.y + Math.sin(t * 1.3 + s.ph) * 0.1, s.z);
      dotsOut.setMatrixAt(i, dm);
    }
    dotsOut.instanceMatrix.needsUpdate = true;
  }
}
// the engine pumps air into the cabin
const pumpArrows = makeArrowSet(
  [
    [V(-3.1, 0.5, 4.7), V(-1.6, 1.7, 1.3)],
    [V(-3.6, 0.6, 4.5), V(-2.6, 1.9, 1.2)],
    [V(-4.2, 0.6, 4.4), V(-3.6, 1.8, 1.3)],
  ],
  { mat: coldMat, amp: 0.07, r: 0.055 },
);
// the cabin air presses the door outwards
const doorArrows = makeArrowSet(
  [-0.24, 0.24].flatMap((x) =>
    [1.4, 1.95, 2.5].map((y) => [
      V(x, y, 0.35),
      V(x, y, Math.sqrt((R - 0.2) ** 2 - (y - AX.y) ** 2) - 0.08),
    ]),
  ),
  { mat: forceMat, amp: 0, r: 0.045 },
);
// … and every other square metre of the cabin wall
const wallArrows = makeArrowSet(
  [-3.2, -1.8, 1.6, 3.0].flatMap((x) =>
    [-50, 15, 75, 135, 200].map((f) => {
      const d = (r) => V(x, AX.y + r * Math.sin(f * D2R), r * Math.cos(f * D2R));
      return [d(0.7), d(R + 0.45)];
    }),
  ),
  { mat: forceMat, amp: 0, r: 0.04 },
);

// ---------------------------------------------------------------- the cross-section (Folge 3)
// A cut through the cabin wall at the door, seen from above: the door is a
// wedge, wider on the cabin side (+z) than the hole on the outside (−z).
const sec = new THREE.Group();
sec.position.set(...SEC);
scene.add(sec);
const secDoor = new THREE.Group();
const secDots = new THREE.InstancedMesh(dotGeo, dotMat, 110);
secDots.userData.noAO = true;
const secSeed = (() => {
  const r = rng(41);
  return Array.from({ length: 110 }, (_, i) => {
    const inside = i < 96;
    return {
      x: -2.2 + r() * 4.4,
      y: 0.3 + r() * 1.7,
      z: inside ? 0.45 + r() * 2.0 : -0.45 - r() * 2.0,
      ph: r() * 6.3,
    };
  });
})();
{
  const ext = (pts, h, mats) => {
    const s = new THREE.Shape();
    s.moveTo(pts[0][0], -pts[0][1]);
    for (const [x, z] of pts.slice(1)) s.lineTo(x, -z);
    s.closePath();
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false }), mats);
    m.rotation.x = -Math.PI / 2;
    m.castShadow = m.receiveShadow = true;
    return m;
  };
  const cut = flat(0xff8a6b, { roughness: 0.7 }); // the cut face, top
  const wallSide = flat(0xf1ebe0, { roughness: 0.7 });
  const H = 1.9;
  const ZO = -0.2; // outside face
  const ZI = 0.2; // cabin face
  const wallL = ext(
    [
      [-2.5, ZO],
      [-0.45, ZO],
      [-0.6, ZI],
      [-2.5, ZI],
    ],
    H,
    [cut, wallSide],
  );
  const wallR = ext(
    [
      [0.45, ZO],
      [2.5, ZO],
      [2.5, ZI],
      [0.6, ZI],
    ],
    H,
    [cut, wallSide],
  );
  for (const w of [wallL, wallR]) {
    w.position.y = 0.1;
    sec.add(w);
  }
  // outer paint strip on the outside faces
  for (const x of [-1.475, 1.475]) {
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(2.05, H, 0.02),
      flat(0xf7f9fc, { roughness: 0.3 }),
    );
    strip.position.set(x, 0.1 + H / 2, ZO - 0.011);
    sec.add(strip);
  }
  const plug = ext(
    [
      [-0.45, ZO],
      [0.45, ZO],
      [0.6, ZI],
      [-0.6, ZI],
    ],
    H - 0.1,
    [flat(0xffb02e, { roughness: 0.5 }), flat(0xf7f9fc, { roughness: 0.4 })],
  );
  plug.position.y = 0.15;
  secDoor.add(plug);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.065, 0.065), leverMat);
  bar.position.set(0, 1.05, ZI + 0.14);
  secDoor.add(bar);
  for (const x of [-0.22, 0.22]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.14), M.steel);
    post.position.set(x, 1.05, ZI + 0.07);
    secDoor.add(post);
  }
  sec.add(secDoor);
  // a cloud bank under the slab so it doesn't float in thin air
  const cmat = facetMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x9fb4d8,
      emissiveIntensity: 0.15,
      roughness: 1,
      flatShading: true,
    }),
  );
  const r = rng(77);
  for (let k = 0; k < 7; k++) {
    const geo = jitter(new THREE.IcosahedronGeometry(1, 1), 0.1, 500 + k);
    const m = new THREE.Mesh(facet(geo, 0.05, k), cmat);
    const s = 1.1 + r() * 0.8;
    m.scale.set(s * 1.3, s * 0.6, s);
    m.position.set(-3 + k, -0.45 - r() * 0.3, (r() - 0.5) * 2.4);
    sec.add(m);
  }
  sec.add(secDots);
}
const secArrows = makeArrowSet(
  [-0.28, 0.28].flatMap((x) =>
    [0.7, 1.45].map((y) => [
      V(SEC[0] + x, SEC[1] + y, SEC[2] + 1.9),
      V(SEC[0] + x, SEC[1] + y, SEC[2] + 0.42),
    ]),
  ),
  { mat: forceMat, amp: 0, r: 0.05 },
);
const whiteMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  depthWrite: false,
});
const inArrow = makeArrowSet(
  [[V(SEC[0], SEC[1] + 2.3, SEC[2] + 0.2), V(SEC[0], SEC[1] + 2.3, SEC[2] + 1.4)]],
  {
    mat: whiteMat,
    amp: 0,
    r: 0.05,
  },
);
// door motion in the section: pulled inwards a little, then slammed back
function secDz(t) {
  const out = smooth(ramp(t, T.innen - 0.1, T.innen + 0.6)) * 0.3;
  const back = ramp(t, T.druck - 0.06, T.druck + 0.08);
  return out * (1 - back);
}

// ---------------------------------------------------------------- the ten people on the rope (payoff)
const hoodies = [
  0xe2453c, 0x2f9e6a, 0xf0b429, 0x7b5cd6, 0xff7aa8, 0x2f6fd6, 0x3fb5a8, 0xf08a3c, 0x5a6b8a,
  0xd94f5c,
];
const people = [];
function person(i) {
  const g = new THREE.Group();
  const r = rng(600 + i);
  const hoodie = flat(hoodies[i % hoodies.length]);
  const jeans = flat(0x2c3a5a);
  const skin = flat([0xf1c09a, 0xd9a07a, 0xa8714a, 0xf6d2b0][i % 4]);
  for (const s of [-1, 1]) {
    const leg = F(new THREE.BoxGeometry(0.16, 0.78, 0.15), jeans, 0.04, 20 + i);
    leg.position.set(0.12 * (s > 0 ? 1 : -0.4), 0.39, s * 0.1);
    leg.rotation.z = s > 0 ? -0.25 : 0.1; // one leg braced forward
    g.add(leg);
  }
  const body = F(new THREE.BoxGeometry(0.26, 0.6, 0.42), hoodie, 0.04, 30 + i);
  body.position.set(0, 1.08, 0);
  g.add(body);
  const head = F(new THREE.IcosahedronGeometry(0.13, 1), skin, 0.04, 40 + i);
  head.position.set(0.02, 1.53, 0);
  g.add(head);
  const hair = F(
    new THREE.IcosahedronGeometry(0.135, 1),
    flat([0x4a2e1f, 0x1c1c22, 0xd9a650, 0x8a4a2a][i % 4]),
    0.04,
    50 + i,
  );
  hair.position.set(-0.02, 1.58, 0);
  hair.scale.set(1, 0.75, 1);
  g.add(hair);
  for (const s of [-1, 1]) {
    const arm = F(new THREE.BoxGeometry(0.52, 0.12, 0.12), hoodie, 0.04, 60 + i);
    arm.position.set(0.26, 1.2, s * 0.13);
    arm.rotation.z = -0.25;
    g.add(arm);
  }
  g.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  g.userData.lean = 0.28 + r() * 0.1;
  return g;
}
const PX = (i) => -1.0 - 0.6 * i;
for (let i = 0; i < 10; i++) {
  const p = person(i);
  p.position.set(PX(i), FLOOR_Y, i % 2 ? 0.07 : -0.07);
  plane.add(p);
  people.push(p);
}
const rope = (() => {
  const pts = [V(0, 1.9, LEVER_Z - 0.02), V(-0.45, 1.55, 0.6)];
  for (let i = 0; i < 10; i++) pts.push(V(PX(i) + 0.55, 1.62 - i * 0.012, 0));
  pts.push(V(PX(9) - 0.2, 1.5, 0));
  const m = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, "centripetal"), 120, 0.03, 6),
    flat(0xe9c46a, { roughness: 0.8 }),
  );
  m.castShadow = true;
  plane.add(m);
  return m;
})();

// ---------------------------------------------------------------- frost (Übrigens)
const N_ICE = 360;
const ice = new THREE.InstancedMesh(
  new THREE.TetrahedronGeometry(1, 0),
  flat(0xeaf6ff, { emissive: 0xbfe4ff, emissiveIntensity: 0.35, roughness: 0.2 }),
  N_ICE,
);
ice.userData.noAO = true;
plane.add(ice);
const iceSeed = (() => {
  const r = rng(71);
  const wins = WIN.filter(([x, s]) => s > 0 && x < -0.6 && x > -4.4).map(([x]) => x);
  return Array.from({ length: N_ICE }, () => {
    const wx = wins[Math.floor(r() * wins.length)];
    const a = r() * Math.PI * 2;
    const d = 0.15 + r() * 0.17;
    const x = wx + Math.cos(a) * d * 0.9;
    const f = 10 + (Math.sin(a) * d * 1.2) / (R * D2R);
    return {
      x,
      f,
      s: 0.014 + r() * 0.024,
      delay: (d - 0.15) * 5 + r() * 0.3,
      rot: [r() * 6, r() * 6, r() * 6],
    };
  });
})();
const io = new THREE.Object3D();
function updateIce(t) {
  const t0 = T.kaelter - 0.5;
  ice.visible = t > t0 && t < T.cta + 1.5;
  if (!ice.visible) return;
  iceSeed.forEach((s, i) => {
    const k = smooth(ramp(t, t0 + s.delay, t0 + s.delay + 0.35));
    const f = s.f * D2R;
    io.position.set(s.x, AX.y + (R + 0.015) * Math.sin(f), (R + 0.015) * Math.cos(f));
    io.rotation.set(...s.rot);
    io.scale.setScalar(Math.max(1e-3, s.s * k));
    io.updateMatrix();
    ice.setMatrixAt(i, io.matrix);
  });
  ice.instanceMatrix.needsUpdate = true;
}

// ---------------------------------------------------------------- hands
const hand = createHand({ scale: 0.6 });
const secHand = createHand({ scale: 0.55 });
const applyCamera = shotCamera(shots);
const GRAB = [0.05, 1.99, LEVER_Z - 0.16];

// ---------------------------------------------------------------- render
function renderAt(t) {
  // your hand on the lever: hook (keys before 0 = the loop tail reaching in)
  // and again in the payoff
  hand.track(t, [
    { t: -0.9, pos: [0.4, 1.6, 0.5], rot: [0.1, 0.25, 0], pose: "open" },
    { t: -0.1, pos: [0.1, 1.98, GRAB[2] - 0.18], rot: [0.3, 0.05, 0], pose: "open" },
    { t: T.grab, pos: GRAB, rot: [0.38, 0, 0], pose: "grab" },
    { t: T.gleich - 0.05, pos: GRAB, rot: [0.38, 0, 0], pose: "grab" },
    { t: T.gleich, pos: [0.3, 1.7, 0.6], rot: [0.1, 0.25, 0], pose: "open", out: true },
    { t: T.darum - 0.45, pos: [0.35, 1.65, 0.6], rot: [0.1, 0.25, 0], pose: "open" },
    { t: T.darum + 0.05, pos: GRAB, rot: [0.38, 0, 0], pose: "grab" },
    { t: T.selbst - 0.05, pos: GRAB, rot: [0.38, 0, 0], pose: "grab" },
    { t: T.selbst, pos: GRAB, rot: [0.38, 0, 0], pose: "grab", out: true },
  ]);
  // pulling: the hand strains, the door only trembles
  const strain =
    pop(t, T.grab + 0.1, T.wenn, 0.1) * 0.6 +
    pop(t, T.ziehst, T.gleich, 0.2) +
    pop(t, T.darum + 0.1, T.selbst, 0.2);
  const shiver = Math.sin(t * 47) * 0.006 + Math.sin(t * 31) * 0.004;
  if (strain > 0) hand.group.position.z += shiver * 2 * strain - 0.012 * strain;
  door.position.z = shiver * 0.4 * (strain + pop(t, T.tuer, T.du, 0.1));

  // the plane: engines spin, clouds and streaks race past
  for (const f of fans) f.rotation.x = t * 22;
  // (not in the Everest shot: they would hide the peak)
  const puffsOn = !(t >= T.fliegst && t < T.draussen);
  for (const p of speedPuffs) {
    p.g.visible = puffsOn;
    p.g.position.set(50 - ((p.x0 + t * SPEED) % 100), p.y, p.z);
  }
  for (let i = 0; i < STREAKS; i++) {
    const s = streakSeed[i];
    dm.makeScale(s.len, 1, 1);
    dm.setPosition(20 - ((s.x0 + t * s.v) % 40), s.y, s.z);
    streaks.setMatrixAt(i, dm);
  }
  streaks.instanceMatrix.needsUpdate = true;

  // the pilot: totally calm, sips his coffee on "ruhig"
  const sip = pop(t, T.ruhig - 0.25, T.fliegst + 0.4, 0.35);
  pilotArm.rotation.z = lerp(0.15, 1.25, smooth(sip));
  cup.rotation.z = -lerp(0.15, 1.1, smooth(sip));
  steam.forEach((s, k) => {
    const u = (t * 0.6 + k / 3) % 1;
    s.position.set(Math.sin(u * 6 + k) * 0.02, 0.07 + u * 0.22, Math.cos(u * 5 + k) * 0.02);
    s.scale.setScalar(0.5 + u * 1.2);
    s.visible = u < 0.9;
  });

  // Everest bursts up through the cloud sea
  everest.visible = t >= T.everest - 0.1;
  const rise = outBack(ramp(t, T.everest - 0.1, T.everest + 0.5));
  everest.position.y = -0.6 - 9 * (1 - rise);
  puff("everest", t, T.everest + 0.05, 0, -8, -30, 7);

  // x-ray: thin air + pump (Folge 1), and the pressure on the walls ("Tonnen")
  const xr =
    smooth(ramp(t, T.draussen - 0.05, T.draussen + 0.35)) * (1 - ramp(t, T.genau - 0.05, T.genau)) +
    smooth(ramp(t, T.tonnen - 0.02, T.tonnen + 0.2)) * (1 - ramp(t, T.tuer3 - 0.05, T.tuer3));
  setXray(XRAY, xr);
  setXray([doorMat], xr * 0.55);
  doorMat.emissiveIntensity = pop(t, T.tonnen, T.tuer3, 0.2) * (0.5 + 0.3 * Math.sin(t * 9));
  lining.visible = xr < 0.02;
  winOut.visible = winIn.visible = xr < 0.3;
  glassMat.opacity = 0.4 * (1 - xr);
  const air = pop(t, T.draussen, T.tuer3, 0.3);
  const nIn = Math.round(lerp(130, N_IN, smooth(ramp(t, T.pumpt, T.genau))));
  updateDots(t, air, nIn, pop(t, T.draussen, T.genau, 0.3));
  animateArrows(pumpArrows, t, pop(t, T.pumpt - 0.2, T.genau));
  animateArrows(
    doorArrows,
    t,
    pop(t, T.luft3 - 0.2, T.tuer3) * (1 + 0.35 * pop(t, T.tonnen, T.tuer3, 0.15)),
  );
  animateArrows(wallArrows, t, pop(t, T.tonnen - 0.02, T.tuer3, 0.2));

  // the cross-section: air inside, arrows, the plug pulled in and slammed back
  const dz = secDz(t);
  secDoor.position.z = dz;
  for (let i = 0; i < secSeed.length; i++) {
    const s = secSeed[i];
    dm.makeScale(1, 1, 1);
    dm.setPosition(
      s.x + Math.sin(t * 2.4 + s.ph) * 0.05,
      s.y + Math.sin(t * 3.1 + s.ph * 1.7) * 0.05,
      s.z + Math.sin(t * 2.2 + s.ph * 2.3) * 0.05,
    );
    secDots.setMatrixAt(i, dm);
  }
  secDots.instanceMatrix.needsUpdate = true;
  const slam = pop(t, T.druck - 0.1, T.darum, 0.1);
  animateArrows(secArrows, t, pop(t, T.tuer3 + 0.3, T.darum) * (1 + 0.5 * slam));
  animateArrows(inArrow, t, pop(t, T.innen - 0.05, T.druck));
  showNope(pop(t, T.druck + 0.05, T.darum, 0.2), SEC[0], SEC[1] + 2.5, SEC[2] + 0.7, 0.9);
  secHand.track(t, [
    {
      t: T.zuerst - 0.5,
      pos: [SEC[0] + 0.25, SEC[1] + 1.3, SEC[2] + 1.0],
      rot: [-0.25, Math.PI, 0],
      pose: "open",
    },
    {
      t: T.zuerst,
      pos: [SEC[0] - 0.05, SEC[1] + 1.12, SEC[2] + 0.5],
      rot: [-0.38, Math.PI, 0],
      pose: "grab",
    },
    {
      t: T.darum - 0.05,
      pos: [SEC[0] - 0.05, SEC[1] + 1.12, SEC[2] + 0.5],
      rot: [-0.38, Math.PI, 0],
      pose: "grab",
    },
    {
      t: T.darum,
      pos: [SEC[0] - 0.05, SEC[1] + 1.12, SEC[2] + 0.5],
      rot: [-0.38, Math.PI, 0],
      pose: "grab",
      out: true,
    },
  ]);
  if (t >= T.zuerst) secHand.group.position.z += dz;

  // payoff: ten people heave on the rope — the door doesn't move
  const crew = t >= T.selbst - 0.05 && t < T.fakt;
  rope.visible = crew;
  people.forEach((p, i) => {
    p.visible = crew;
    if (!crew) return;
    const at = T.selbst + 0.04 * i;
    p.scale.copy(squash(t, at, 0.6)).multiplyScalar(t >= at ? 1 : 0.001);
    const heave =
      Math.max(0, Math.sin((t - T.selbst) * 6.5 - i * 0.25)) * 0.07 * pop(t, T.zehn, T.fakt, 0.3);
    p.rotation.z = p.userData.lean + heave;
  });

  // Übrigens: frost creeps over the windows
  const frost =
    smooth(ramp(t, T.kaelter - 0.4, T.kaelter + 1.4)) * (1 - ramp(t, T.cta + 1.5, T.cta + 2.5));
  winOutMat.color.setHex(0x22324a).lerp(new THREE.Color(0xdcefff), frost * 0.85);
  winOutMat.emissiveIntensity = frost * 0.25;
  updateIce(t);

  // LED facts
  if (t >= T.ohnmaechtig && t < T.drinnen)
    showPanel(pop(t, T.ohnmaechtig, T.drinnen), "SAUERSTOFF", "−75 %", LED.red);
  else if (t >= T.tonnen && t < T.tuer3)
    showPanel(pop(t, T.tonnen, T.tuer3), "DRÜCKT AUF DIE TÜR", "~8 t", LED.yellow);
  else if (t >= T.kaelter && t < T.cta) showPanel(pop(t, T.kaelter, T.cta), "", "−50 °C", LED.blue);
  else showPanel(0);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
