// #74 Milchschaum — the jug under the steam wand, the bubbles "inside the
// milk" with their protein cages, oat vs cow milk, the latte-art heart.
import {
  THREE,
  ramp,
  smooth,
  clamp01,
  lerp,
  pop,
  V,
  rng,
  scene,
  flat,
  real,
  roundedBox,
  xrayMaterial,
  setXray,
  showNope,
  makeArrowSet,
  animateArrows,
  coldMat,
  forceMat,
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
import { gauge, meter } from "./hud.js";
import { T, shots, LABELS, HIGHLIGHTS, CUP, MAC, COW, OAT } from "./beats.js";

highlights(HIGHLIGHTS);

const TIP = V(0.45, 2.3, 0.2); // steam-wand nozzle (world)
const steel = new THREE.MeshPhysicalMaterial({
  color: 0xcfd4da,
  metalness: 0.55,
  roughness: 0.28,
  clearcoat: 0.6,
  clearcoatRoughness: 0.15,
});
const chrome = new THREE.MeshPhysicalMaterial({
  color: 0xe4e8ec,
  metalness: 0.6,
  roughness: 0.18,
  clearcoat: 0.8,
  clearcoatRoughness: 0.1,
});

// ---------------------------------------------------------------- espresso machine
{
  const m = new THREE.Group();
  const enamel = real.gloss(0xece2cf);
  const dark = real.plastic(0x1d1d1f, { roughness: 0.5 });
  const body = new THREE.Mesh(roundedBox(12, 6.6, 6, 0.55, 5), enamel);
  body.position.y = 4.6;
  m.add(body);
  const base = new THREE.Mesh(roundedBox(12.4, 1.2, 6.4, 0.3), steel);
  base.position.y = 0.6;
  m.add(base);
  const tray = new THREE.Mesh(roundedBox(9.6, 0.45, 2.6, 0.12), steel);
  tray.position.set(-1, 1.3, 3.6);
  m.add(tray);
  for (let i = 0; i < 18; i++) {
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 2.0), dark);
    slot.position.set(-5.2 + i * 0.5, 1.55, 3.6);
    m.add(slot);
  }
  // top rail + cups warming on top
  const rail = new THREE.Mesh(new THREE.TorusGeometry(5.2, 0.12, 12, 64), chrome);
  rail.rotation.x = Math.PI / 2;
  rail.scale.set(1.12, 0.55, 1);
  rail.position.y = 8.6;
  m.add(rail);
  const cupMat = real.ceramic(0xf6f2ea);
  for (let i = 0; i < 5; i++) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.95, 1.1, 40), cupMat);
    c.position.set(-4 + i * 1.9, 8.5, 0.3 + (i % 2) * 0.6);
    m.add(c);
  }
  // two group heads + portafilters
  for (const x of [-4.2, 0.6]) {
    const gh = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.05, 1.1, 48), chrome);
    gh.position.set(x, 3.0, 3.4);
    m.add(gh);
    const pf = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 0.85, 0.7, 48), chrome);
    pf.position.set(x, 2.2, 3.4);
    m.add(pf);
    const handle = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 2.4, 8, 24), dark);
    handle.rotation.x = Math.PI / 2 - 0.15;
    handle.position.set(x, 2.1, 5.3);
    m.add(handle);
  }
  // pressure gauge + logo plate + steam knob
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.3, 48), chrome);
  dial.rotation.x = Math.PI / 2;
  dial.position.set(-1.8, 6.1, 3.05);
  m.add(dial);
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.75, 48), flat(0xfaf6ee));
  face.position.set(-1.8, 6.1, 3.21);
  m.add(face);
  const needle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.6, 0.02), flat(0xc0392b));
  needle.position.set(-1.8, 6.1, 3.23);
  needle.rotation.z = -0.6;
  m.add(needle);
  const plate = new THREE.Mesh(
    roundedBox(3.2, 0.7, 0.1, 0.05),
    real.metal(0xc89a52, { roughness: 0.25 }),
  );
  plate.position.set(-1.8, 7.3, 3.02);
  m.add(plate);
  const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.6, 32), dark);
  knob.rotation.x = Math.PI / 2;
  knob.position.set(4.7, 6.0, 3.3);
  m.add(knob);
  for (const x of [-5.6, 5.6])
    for (const z of [-2.6, 2.6]) {
      const f = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.3, 24), dark);
      f.position.set(x, 0.15 - 0.3, z);
      m.add(f);
    }
  m.traverse((o) => (o.castShadow = o.receiveShadow = true));
  m.position.set(-1.5, 0.3, -7.6);
  scene.add(m);
  // the steam wand: chrome tube from the machine's right side down to the jug
  const path = new THREE.CatmullRomCurve3([
    V(3.5, 5.9, -4.5),
    V(3.0, 5.6, -2.6),
    V(1.2, 4.6, -0.6),
    V(0.55, 3.0, 0.12),
    TIP.clone(),
  ]);
  const wand = new THREE.Mesh(new THREE.TubeGeometry(path, 80, 0.13, 24), chrome);
  wand.castShadow = true;
  scene.add(wand);
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.35, 24), chrome);
  nozzle.position.copy(TIP);
  nozzle.lookAt(path.getPoint(0.97));
  nozzle.rotateX(Math.PI / 2);
  scene.add(nozzle);
  const joint = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 16), chrome);
  joint.position.set(3.5, 5.9, -4.5);
  scene.add(joint);
}

// ---------------------------------------------------------------- milk jug
// stainless steel pitcher, pivot at the base centre, spout on +x, handle on -x
const H = 2.6;
const outerR = (h) => 1.1 - 0.15 * (h / H) + 0.05 * Math.sin((h / H) * Math.PI);
const innerR = (h) => outerR(h) - 0.05;
const jug = new THREE.Group();
scene.add(jug);
let jugGeo;
{
  const pts = [new THREE.Vector2(0, 0)];
  for (let i = 0; i <= 24; i++) {
    const h = (i / 24) * H;
    pts.push(new THREE.Vector2(outerR(h), h));
  }
  pts.push(new THREE.Vector2(outerR(H) - 0.025, H + 0.02));
  for (let i = 24; i >= 0; i--) {
    const h = 0.08 + (i / 24) * (H - 0.08);
    pts.push(new THREE.Vector2(innerR(h), h));
  }
  pts.push(new THREE.Vector2(0, 0.08));
  jugGeo = new THREE.LatheGeometry(pts, 96);
  // pull a spout out of the rim on +x
  const p = jugGeo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const a = Math.atan2(z, x);
    const k = Math.exp(-((a / 0.42) ** 2)) * smooth(ramp(y, 1.7, H + 0.02));
    const s = 1 + 0.32 * k;
    p.setXYZ(i, x * s, y + 0.12 * k, z * (1 - 0.15 * k));
  }
  jugGeo.computeVertexNormals();
}
const jugShell = new THREE.Mesh(jugGeo, steel);
jugShell.castShadow = true;
jug.add(jugShell);
const jugXrayMat = xrayMaterial(0xdfe3e7);
const jugXray = new THREE.Mesh(jugGeo, jugXrayMat);
jug.add(jugXray);
{
  const hc = new THREE.CatmullRomCurve3([
    V(-0.98, 2.3, 0),
    V(-1.65, 2.2, 0),
    V(-1.75, 1.3, 0),
    V(-1.02, 0.6, 0),
  ]);
  const handle = new THREE.Mesh(new THREE.TubeGeometry(hc, 48, 0.12, 20), steel);
  handle.scale.z = 1.6;
  handle.castShadow = true;
  jug.add(handle);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(outerR(H) - 0.02, 0.025, 10, 96), steel);
  lip.rotation.x = Math.PI / 2;
  lip.position.y = H + 0.01;
  jug.add(lip);
}
// milk + foam surface
const milkMat = new THREE.MeshPhysicalMaterial({
  color: 0xfbf7ef,
  roughness: 0.5,
  sheen: 0.6,
  sheenColor: new THREE.Color(0xffffff),
  clearcoat: 0,
  transparent: true,
});
const milk = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 96), milkMat);
jug.add(milk);
const NB = 220;
const bubMat = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  roughness: 0.05,
  clearcoat: 1,
  transparent: true,
  opacity: 0.75,
  iridescence: 0.5,
});
const bubbles = new THREE.InstancedMesh(
  new THREE.SphereGeometry(1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2),
  bubMat,
  NB,
);
bubbles.frustumCulled = false;
jug.add(bubbles);
const bub = [];
{
  const r = rng(7401);
  for (let i = 0; i < NB; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r());
    bub.push({
      a,
      d,
      big: 0.06 + r() * 0.11,
      small: 0.012 + r() * 0.02,
      tp: 0.15 + r() * 2.2,
      on: r(),
      s: r(),
    });
  }
}
// whirlpool beads inside (x-ray)
const NS = 140;
const swirl = new THREE.InstancedMesh(
  new THREE.SphereGeometry(0.035, 10, 8),
  new THREE.MeshBasicMaterial({ color: 0xffffff }),
  NS,
);
swirl.frustumCulled = false;
jug.add(swirl);

// the viewer's hand on the handle (left hand, child of the jug)
const hand = createHand({ scale: 3.7, left: true, sleeve: 0x8a5a3c });
jug.add(hand.group);

// steam
const NSt = 60;
const steamMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.32,
  depthWrite: false,
  roughness: 1,
});
const steam = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 2), steamMat, NSt);
steam.frustumCulled = false;
scene.add(steam);
// air arrows into the nozzle
const airIn = makeArrowSet(
  [
    [V(1.6, 3.4, 1.0), V(0.62, 2.45, 0.3)],
    [V(-0.5, 3.5, 0.9), V(0.32, 2.45, 0.28)],
    [V(0.9, 3.6, -0.6), V(0.48, 2.5, 0.08)],
  ],
  { mat: coldMat, r: 0.045, amp: 0.06 },
);

// ---------------------------------------------------------------- inside the milk (macro)
const mac = new THREE.Group();
mac.position.set(...MAC);
scene.add(mac);
{
  const g = new THREE.SphereGeometry(18, 48, 32);
  const col = [];
  const p = g.attributes.position;
  const c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i) / 18;
    c.setRGB(0.87, 0.8, 0.69).lerp(
      new THREE.Color(0.55, 0.43, 0.32),
      smooth(clamp01(-y * 0.9 + 0.1)),
    );
    col.push(c.r, c.g, c.b);
  }
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  const dome = new THREE.Mesh(
    g,
    new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false }),
  );
  dome.userData.noAO = true;
  mac.add(dome);
  const l = new THREE.PointLight(0xfff4e2, 60, 30, 1.6);
  l.position.set(-3, 6, 6);
  mac.add(l);
}
const fresnel = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  uniforms: { tint: { value: new THREE.Color(0.75, 0.88, 1.0) }, alpha: { value: 1 } },
  vertexShader: `varying vec3 vN; varying vec3 vV;
    void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0);
      vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `uniform vec3 tint; uniform float alpha; varying vec3 vN; varying vec3 vV;
    void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2);
      vec3 col = mix(tint * 0.95, vec3(1.0), f);
      float rim = smoothstep(0.55, 1.0, f);
      gl_FragColor = vec4(col, (0.07 + 0.8 * f + 0.4 * rim) * alpha);
      #include <colorspace_fragment>
    }`,
});
const BUBS = [
  [0, 0, 0, 1.3],
  [2.9, 0.9, -1.5, 0.8],
  [-2.7, -0.7, -1.0, 0.9],
  [1.7, -1.9, 0.9, 0.62],
  [-1.5, 1.95, 0.5, 0.66],
  [3.8, -1.3, -3.2, 1.0],
  [-4.0, 1.7, -3.4, 1.1],
  [0.6, 2.6, -4.5, 0.9],
];
const macBubbles = BUBS.map(([x, y, z, R], i) => {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const s = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 48), fresnel);
  s.userData.noAO = true;
  g.add(s);
  const glint = new THREE.Mesh(
    new THREE.SphereGeometry(R * 0.13, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }),
  );
  glint.position.set(-R * 0.45, R * 0.55, R * 0.62);
  glint.scale.set(1, 0.6, 0.4);
  g.add(glint);
  mac.add(g);
  return { g, R, i };
});
// protein chains: beads that go from a folded ball → a straight string → a ring on the bubble
const CH = 6;
const NBD = 42;
const PROT = 5; // bubbles that get cages
const beadMat = real.plastic(0xffffff, {
  roughness: 0.35,
  emissive: 0x4a2a00,
  emissiveIntensity: 0.25,
});
const beads = new THREE.InstancedMesh(
  new THREE.SphereGeometry(1, 12, 10),
  beadMat,
  PROT * CH * NBD,
);
beads.frustumCulled = false;
mac.add(beads);
const chains = [];
{
  const r = rng(7402);
  const up = V(0, 1, 0);
  for (let b = 0; b < PROT; b++) {
    const [bx, by, bz, R] = BUBS[b];
    const centre = V(bx, by, bz);
    for (let j = 0; j < CH; j++) {
      // ring normal (fibonacci on a sphere); chain 0 of bubble 0 points up
      const fy = 1 - (2 * (j + 0.5)) / CH;
      const fa = j * 2.399 + b;
      const n =
        j === 0 && b === 0
          ? V(1, 0, 0)
          : V(
              Math.cos(fa) * Math.sqrt(1 - fy * fy),
              fy,
              Math.sin(fa) * Math.sqrt(1 - fy * fy),
            ).normalize();
      const u =
        Math.abs(n.dot(up)) > 0.9
          ? V(1, 0, 0).cross(n).normalize()
          : up.clone().cross(n).normalize();
      const v = n.clone().cross(u).normalize();
      // folded ball sits outside the bubble
      const dir =
        j === 0 && b === 0 ? V(0, 1, 0) : u.clone().multiplyScalar(0.6).add(n).normalize();
      const ballC = centre.clone().add(dir.clone().multiplyScalar(R + 0.95));
      const ball = [];
      let w = V(0, 0, 0);
      for (let k = 0; k < NBD; k++) {
        w.add(V(r() - 0.5, r() - 0.5, r() - 0.5).multiplyScalar(0.22));
        if (w.length() > 0.32) w.multiplyScalar(0.32 / w.length());
        ball.push(ballC.clone().add(w));
      }
      const line = [];
      const tang = dir.clone().cross(n).normalize();
      if (tang.length() < 0.1) tang.copy(u);
      for (let k = 0; k < NBD; k++)
        line.push(ballC.clone().add(tang.clone().multiplyScalar((k / (NBD - 1) - 0.5) * 2.6)));
      const ring = [];
      for (let k = 0; k < NBD; k++) {
        const a = (k / NBD) * Math.PI * 2;
        ring.push(
          centre
            .clone()
            .add(u.clone().multiplyScalar(Math.cos(a) * R * 1.05))
            .add(v.clone().multiplyScalar(Math.sin(a) * R * 1.05)),
        );
      }
      const flyDir = V(r() - 0.5, r() - 0.5, r() - 0.5).normalize();
      chains.push({ b, j, ball, line, ring, centre, flyDir, seed: r() * 10 });
    }
  }
}

// ---------------------------------------------------------------- the cup
const cup = new THREE.Group();
cup.position.set(CUP[0], CUP[1] + 0.12, CUP[2]);
scene.add(cup);
const cupMat = real.ceramic(0xf7f3ec, { roughness: 0.18, clearcoat: 0.6 });
const cupXrayMat = xrayMaterial(0xf7f3ec);
let cupGeo;
{
  const pts = [
    [0, 0],
    [0.95, 0],
    [1.1, 0.12],
    [1.55, 0.6],
    [1.82, 1.15],
    [1.95, 1.55],
    [1.92, 1.62],
    [1.84, 1.58],
    [1.73, 1.2],
    [1.48, 0.7],
    [0.95, 0.2],
    [0, 0.2],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  cupGeo = new THREE.LatheGeometry(pts, 96);
}
const cupShell = new THREE.Mesh(cupGeo, cupMat);
cupShell.castShadow = true;
cup.add(cupShell);
const cupXray = new THREE.Mesh(cupGeo, cupXrayMat);
cup.add(cupXray);
{
  const hc = new THREE.CatmullRomCurve3([
    V(0, 1.38, 1.8),
    V(0, 1.45, 2.45),
    V(0, 0.95, 2.62),
    V(0, 0.55, 1.62),
  ]);
  const hnd = new THREE.Mesh(new THREE.TubeGeometry(hc, 40, 0.13, 16), cupMat);
  hnd.castShadow = true;
  cup.add(hnd);
  const saucer = new THREE.Mesh(
    new THREE.LatheGeometry(
      [
        [0, 0],
        [2.2, 0],
        [3.2, 0.22],
        [3.25, 0.3],
        [3.1, 0.3],
        [2.0, 0.12],
        [0, 0.12],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
      96,
    ),
    cupMat,
  );
  saucer.position.y = -0.1;
  saucer.receiveShadow = true;
  cup.add(saucer);
  const spoon = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.1, 2.4, 6, 16),
    real.metal(0xd9dde2, { roughness: 0.15 }),
  );
  spoon.rotation.set(Math.PI / 2, 0, 0.9);
  spoon.position.set(1.9, 0.08, 1.6);
  cup.add(spoon);
}
cup.rotation.y = 0.4; // handle towards the camera's right
const espresso = new THREE.Mesh(
  new THREE.CylinderGeometry(1.7, 1.0, 1.1, 64),
  real.plastic(0x2a140a, { roughness: 0.3 }),
);
espresso.position.y = 0.74;
cup.add(espresso);
function cremaTexture() {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 512;
  const g = cv.getContext("2d");
  const gr = g.createRadialGradient(256, 256, 10, 256, 256, 256);
  gr.addColorStop(0, "#c98f55");
  gr.addColorStop(0.55, "#a8652f");
  gr.addColorStop(0.9, "#6e3918");
  gr.addColorStop(1, "#4a240f");
  g.fillStyle = gr;
  g.fillRect(0, 0, 512, 512);
  const r = rng(7403);
  for (let i = 0; i < 900; i++) {
    g.fillStyle = r() < 0.5 ? "rgba(90,40,15,0.35)" : "rgba(230,180,120,0.3)";
    const a = r() * 6.28;
    const d = r() * 240;
    g.fillRect(256 + Math.cos(a) * d, 256 + Math.sin(a) * d, 2 + r() * 5, 1 + r() * 2);
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const crema = new THREE.Mesh(
  new THREE.CircleGeometry(1.74, 96),
  new THREE.MeshPhysicalMaterial({ map: cremaTexture(), roughness: 0.35, clearcoat: 0.6 }),
);
crema.rotation.x = -Math.PI / 2;
crema.position.y = 1.3;
cup.add(crema);
const foamWhite = new THREE.MeshPhysicalMaterial({
  color: 0xfdf9f1,
  roughness: 0.3,
  clearcoat: 0.7,
  sheen: 0.5,
});
const blob = new THREE.Mesh(new THREE.CircleGeometry(1, 64), foamWhite);
blob.rotation.x = -Math.PI / 2;
blob.position.y = 1.315;
cup.add(blob);
const floatFoam = new THREE.Mesh(new THREE.SphereGeometry(0.55, 40, 24), foamWhite);
floatFoam.scale.y = 0.35;
cup.add(floatFoam);
const cloud = new THREE.Mesh(
  new THREE.SphereGeometry(0.8, 40, 24),
  new THREE.MeshStandardMaterial({ color: 0xf5ead8, transparent: true, opacity: 0.85 }),
);
cup.add(cloud);
const heart = new THREE.Group();
{
  const s = new THREE.Shape();
  s.moveTo(0, -0.95);
  s.bezierCurveTo(0.25, -0.65, 1.15, -0.15, 1.1, 0.35);
  s.bezierCurveTo(1.05, 0.85, 0.35, 1.0, 0, 0.55);
  s.bezierCurveTo(-0.35, 1.0, -1.05, 0.85, -1.1, 0.35);
  s.bezierCurveTo(-1.15, -0.15, -0.25, -0.65, 0, -0.95);
  const geo = new THREE.ShapeGeometry(s, 48);
  const edge = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({ color: 0xe6c9a2, roughness: 0.4 }),
  );
  edge.scale.setScalar(1.05);
  heart.add(edge);
  const top = new THREE.Mesh(geo, foamWhite);
  top.position.z = 0.004;
  heart.add(top);
  const line = new THREE.Mesh(
    new THREE.PlaneGeometry(0.05, 1.3),
    new THREE.MeshStandardMaterial({ color: 0xd9b48a }),
  );
  line.position.set(0, -0.05, 0.008);
}
heart.rotation.set(-Math.PI / 2, 0, -0.4);
heart.position.y = 1.318;
cup.add(heart);
const floatUp = makeArrowSet(
  [
    [V(-0.5, 0.5, 0), V(-0.5, 2.1, 0)],
    [V(0.5, 0.5, 0), V(0.5, 2.1, 0)],
  ],
  { parent: cup, mat: forceMat, r: 0.05, amp: 0 },
);
const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.15, 1, 24), foamWhite);
scene.add(stream);

// ---------------------------------------------------------------- milk cartons
function labelTexture(lines, bg, fg) {
  const cv = document.createElement("canvas");
  cv.width = 256;
  cv.height = 512;
  const g = cv.getContext("2d");
  g.fillStyle = bg;
  g.fillRect(0, 0, 256, 512);
  g.fillStyle = fg;
  g.textAlign = "center";
  lines.forEach(([txt, y, size]) => {
    g.font = `900 ${size}px Inter, Arial, sans-serif`;
    g.fillText(txt, 128, y);
  });
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function carton(body, band, text, sub) {
  const g = new THREE.Group();
  const box = new THREE.Mesh(
    roundedBox(1.5, 3.3, 1.5, 0.07, 3),
    real.plastic(body, { roughness: 0.55 }),
  );
  box.position.y = 1.65;
  g.add(box);
  const front = new THREE.Mesh(
    new THREE.PlaneGeometry(1.36, 2.72),
    new THREE.MeshStandardMaterial({
      map: labelTexture(
        [
          [text, 300, 44],
          [sub, 360, 30],
        ],
        body === 0xf6f6f2 ? "#f6f6f2" : "#ead6ad",
        band,
      ),
      roughness: 0.6,
    }),
  );
  front.position.set(0, 1.6, 0.755);
  g.add(front);
  const tri = new THREE.Shape();
  tri.moveTo(-0.75, 0);
  tri.lineTo(0.75, 0);
  tri.lineTo(0, 0.6);
  tri.lineTo(-0.75, 0);
  const roof = new THREE.Mesh(
    new THREE.ExtrudeGeometry(tri, { depth: 1.5, bevelEnabled: false }),
    real.plastic(body, { roughness: 0.55 }),
  );
  roof.rotation.y = Math.PI / 2;
  roof.position.set(-0.75, 3.3, 0);
  g.add(roof);
  const fin = new THREE.Mesh(roundedBox(0.08, 0.3, 1.5, 0.03), real.plastic(body));
  fin.position.y = 4.0;
  g.add(fin);
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 0.22, 24),
    real.plastic(band === "#1f4f9a" ? 0x2a6fd6 : 0xc2652a),
  );
  cap.position.set(0.38, 3.55, 0.3);
  cap.rotation.z = -0.68;
  g.add(cap);
  g.traverse((o) => (o.castShadow = true));
  return g;
}
const cow = carton(0xf6f6f2, "#1f4f9a", "VOLLMILCH", "3,5 % Fett");
cow.position.set(...COW);
cow.rotation.y = 0.25;
scene.add(cow);
const oat = carton(0xead6ad, "#6b4a22", "HAFER", "Drink");
oat.position.set(...OAT);
oat.rotation.y = -0.2;
scene.add(oat);
const baristaBand = new THREE.Mesh(
  roundedBox(1.56, 0.6, 1.56, 0.05),
  new THREE.MeshStandardMaterial({
    color: 0x2b1a0e,
    emissive: 0x7a4a10,
    emissiveIntensity: 0.25,
    roughness: 0.4,
  }),
);
baristaBand.position.y = 2.75;
oat.add(baristaBand);
const bandText = new THREE.Mesh(
  new THREE.PlaneGeometry(1.4, 0.5),
  new THREE.MeshBasicMaterial({
    map: labelTexture([["BARISTA", 300, 52]], "#2b1a0e", "#ffd23f"),
    transparent: false,
  }),
);
bandText.scale.set(1, 1, 1);
bandText.material.map.repeat.set(1, 0.25);
bandText.material.map.offset.set(0, 0.32);
bandText.position.set(0, 0, 0.785);
baristaBand.add(bandText);
const oil = [];
for (let i = 0; i < 6; i++) {
  const d = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 24, 16),
    real.gloss(i < 3 ? 0xe6b52e : [0x7ad3ff, 0xff8fb1, 0xb8f07a][i - 3], { roughness: 0.1 }),
  );
  d.scale.y = 1.3;
  scene.add(d);
  oil.push(d);
}

// ---------------------------------------------------------------- state over time
const applyCamera = shotCamera(shots);
const m4 = new THREE.Matrix4();
const q = new THREE.Quaternion();
const sv = V(1, 1, 1);
const pv = V(0, 0, 0);
const hidden = new THREE.Matrix4().makeScale(0, 0, 0);

function foam(t) {
  // level = milk height in the jug; amount = share of bubbles; fine = micro-foam; gloss; pop = bursting
  if (t < T.duese)
    return {
      level: 2.05 - 0.45 * smooth(ramp(t, 0.2, 2.4)),
      amount: 1,
      fine: 0,
      gloss: 0,
      burst: t,
      flat: 0,
    };
  if (t < T.zuheiss) {
    const level =
      lerp(1.15, 1.72, smooth(ramp(t, T.luft, T.tiefer))) +
      0.25 * smooth(ramp(t, T.tiefer, T.lack));
    return {
      level,
      amount: smooth(ramp(t, T.luft, T.luft + 3.5)),
      fine: smooth(ramp(t, T.strudel, T.glaenzt)),
      gloss: smooth(ramp(t, T.glaenzt, T.lack)),
      burst: -1,
      flat: 0,
    };
  }
  if (t < T.fakt) {
    const dying = ramp(t, T.stirbt - 0.6, T.siebzig + 0.4);
    return {
      level: 1.97 - 0.2 * dying,
      amount: 1,
      fine: 1 - smooth(dying),
      gloss: 1 - dying,
      burst: dying > 0.5 ? t - T.stirbt : -1,
      flat: 0,
    };
  }
  return { level: 1.3, amount: 0, fine: 1, gloss: 0, burst: -1, flat: 1 };
}

function steamOn(t) {
  if (t < T.duese) return 1.4;
  if (t < T.hafer) return 0.8;
  if (t >= T.zuheiss && t < T.siebzig + 0.5) return 1.2;
  if (t >= T.fakt && t < T.kriegst) return 0.9;
  return 0;
}

function renderAt(t) {
  const f = foam(t);
  // ---- jug placement
  const atWand = t < T.hafer || (t >= T.zuheiss && t < T.kriegst);
  const pouring = t >= T.hoch && t < T.zack + 0.3;
  jug.visible = atWand || (pouring && t < T.zack + 0.05);
  const surfOff = 0.08 + f.level;
  let deep = 0.1;
  if (t >= T.tiefer - 0.2 && t < T.zuheiss)
    deep = lerp(0.1, 0.55, smooth(ramp(t, T.tiefer - 0.2, T.tiefer + 0.3)));
  if (t >= T.zuheiss) deep = 0.5;
  if (t < T.duese) deep = 0.25;
  jug.rotation.set(0, 0, 0);
  jug.position.set(0, TIP.y + deep - surfOff, 0);
  if (t < T.duese) jug.position.y = 0.6;
  if (pouring) {
    const near = smooth(ramp(t, T.nah - 0.1, T.nah + 0.5));
    const away = smooth(ramp(t, T.zack - 0.1, T.zack + 0.3));
    jug.position.set(
      CUP[0] - lerp(2.6, 2.75, near),
      lerp(4.3, 1.75, near) + away * 4,
      CUP[2] - 0.1,
    );
    jug.rotation.z = -lerp(0.95, 1.28, near);
  }
  // shell / x-ray
  const xr =
    smooth(ramp(t, T.tiefer - 0.1, T.tiefer + 0.3)) *
    (1 - smooth(ramp(t, T.glaenzt - 0.25, T.glaenzt)));
  jugShell.visible = xr < 0.02;
  jugXray.visible = xr >= 0.02;
  setXray([jugXrayMat], xr);
  // milk
  const rTop = innerR(f.level) - 0.01;
  milk.scale.set(rTop, f.level, rTop);
  milk.position.y = 0.08 + f.level / 2;
  milkMat.opacity = 1 - 0.5 * xr;
  milkMat.roughness = lerp(0.55, 0.12, f.gloss);
  milkMat.clearcoat = f.gloss;
  milkMat.color.setHex(f.flat ? 0xf3e7cc : 0xfbf7ef);
  // foam bubbles on top (they spin with the whirlpool)
  const spin = (t >= T.tiefer && t < T.zuheiss ? 2.6 * Math.max(0, t - T.tiefer) : 0) + 0.15 * t;
  for (let i = 0; i < NB; i++) {
    const b = bub[i];
    let s = lerp(b.big, b.small, f.fine) * (b.on < f.amount ? 1 : 0);
    if (f.burst >= 0) {
      const tp = f.burst < 3 && t < T.duese ? b.tp : b.tp * 0.5;
      const k = f.burst - tp;
      if (k > 0) s *= k < 0.12 ? 1 + k * 2.5 : 0;
    }
    if (s <= 0.001) {
      bubbles.setMatrixAt(i, hidden);
      continue;
    }
    const rr = b.d * (rTop - s - 0.02);
    const a = b.a + spin * (1.2 - b.d * 0.6);
    pv.set(Math.cos(a) * rr, 0.08 + f.level - s * 0.25, Math.sin(a) * rr);
    sv.set(s, s, s);
    bubbles.setMatrixAt(i, m4.compose(pv, q.identity(), sv));
  }
  bubbles.instanceMatrix.needsUpdate = true;
  bubMat.opacity = lerp(0.8, 0.95, f.fine);
  // whirlpool beads
  for (let i = 0; i < NS; i++) {
    if (xr < 0.05) {
      swirl.setMatrixAt(i, hidden);
      continue;
    }
    const k = i / NS;
    const y = 0.25 + k * (f.level - 0.2);
    const a = k * 18 + spin * 2.2;
    const rr = lerp(0.2, innerR(y) - 0.12, (Math.sin(i * 1.7) + 1) / 2);
    pv.set(Math.cos(a) * rr, y, Math.sin(a) * rr);
    sv.setScalar(0.6 + ((0.6 * ((i * 7) % 5)) / 5) * (1 - f.fine));
    swirl.setMatrixAt(i, m4.compose(pv, q.identity(), sv));
  }
  swirl.instanceMatrix.needsUpdate = true;
  // hand on the handle
  hand.track(t, [
    { t: -1, pos: [-3.05, 1.75, 0.1], rot: [0, Math.PI / 2, 0.15], pose: "grab" },
    { t: 1e6, pos: [-3.05, 1.75, 0.1], rot: [0, Math.PI / 2, 0.15], pose: "grab" },
  ]);
  hand.group.visible = jug.visible && !(t >= T.tiefer && t < T.glaenzt);

  // ---- steam around the nozzle
  const st = jug.visible && !pouring ? steamOn(t) : 0;
  const surfY = jug.position.y + surfOff;
  for (let i = 0; i < NSt; i++) {
    if (st <= 0) {
      steam.setMatrixAt(i, hidden);
      continue;
    }
    const k = (t * (0.9 + (i % 5) * 0.12) + i / NSt) % 1;
    const a = i * 2.39 + t * 0.4;
    pv.set(
      TIP.x + Math.cos(a) * (0.3 + k * 1.1),
      surfY + 0.05 + k * 2.2 * st,
      TIP.z + Math.sin(a) * (0.3 + k * 1.1),
    );
    sv.setScalar((0.05 + k * 0.24) * st * (1 - k * 0.3));
    steam.setMatrixAt(i, m4.compose(pv, q.identity(), sv));
  }
  steam.instanceMatrix.needsUpdate = true;
  steamMat.opacity = 0.16;
  animateArrows(airIn, t, pop(t, T.luft, T.keine));

  // ---- macro world: bubbles + protein cages
  const inMac = (t >= T.keine && t < T.tiefer) || (t >= T.siebzig && t < T.fakt);
  mac.visible = inMac;
  if (inMac) {
    const hot = smooth(ramp(t, T.siebzig, T.siebzig + 0.6));
    const clump = smooth(ramp(t, T.hart, T.hart + 0.7));
    const tear = ramp(t, T.reissen, T.reissen + 1.4);
    macBubbles.forEach(({ g, i }) => {
      const appear = t < T.tiefer ? squash(t, T.keine + 0.1 + i * 0.12, 0.6).x : 1;
      const burstAt = T.reissen + 0.15 + i * 0.09;
      const bk = t >= T.siebzig ? ramp(t, burstAt, burstAt + 0.18) : 0;
      const s = Math.max(0.001, appear * (bk < 1 ? 1 + bk * 0.25 : 0));
      g.scale.setScalar(s);
      g.position.y = BUBS[i][1] + Math.sin(t * 0.8 + i) * 0.08;
      if (t >= T.siebzig)
        puff(
          `mb${i}`,
          t,
          burstAt + 0.18,
          MAC[0] + BUBS[i][0],
          MAC[1] + BUBS[i][1],
          MAC[2] + BUBS[i][2],
          BUBS[i][3] * 1.1,
        );
    });
    fresnel.uniforms.tint.value.setRGB(0.75, 0.88, 1.0).lerp(new THREE.Color(1.0, 0.75, 0.6), hot);
    // chain stage: 0 = cage preview (Käfigen), then folded → line → ring
    const preview =
      t >= T.kaefigen && t < T.wer + 0.3 ? 1 - smooth(ramp(t, T.wer, T.wer + 0.3)) : 0;
    const showBall = smooth(ramp(t, T.eiweiss - 0.05, T.eiweiss + 0.4));
    const unfold = smooth(ramp(t, T.faltet, T.faltet + 1.0));
    const wrap = smooth(ramp(t, T.legt, T.haut + 0.7));
    const col = new THREE.Color();
    const yellow = new THREE.Color(0xffb52e);
    const burnt = new THREE.Color(0xb3471c);
    let idx = 0;
    for (const c of chains) {
      const bubbleOut =
        t >= T.siebzig ? ramp(t, T.reissen + 0.15 + c.b * 0.09, T.reissen + 0.4 + c.b * 0.09) : 0;
      for (let k = 0; k < NBD; k++, idx++) {
        let p;
        let vis;
        if (t >= T.siebzig) {
          // hard cage: ring, slightly clumped, then torn apart
          p = c.ring[k].clone().lerp(c.ball[k], clump * 0.35);
          p.add(c.flyDir.clone().multiplyScalar(tear * (2 + (k % 7) * 0.4)));
          p.add(
            c.ring[k]
              .clone()
              .sub(c.centre)
              .multiplyScalar(bubbleOut * 0.9),
          );
          vis = 1 - smooth(ramp(t, T.reissen + 0.25, T.fakt));
        } else if (preview > 0) {
          p = c.ring[k].clone();
          vis = preview;
        } else {
          const a = c.ball[k].clone().lerp(c.line[k], unfold);
          p = a.lerp(c.ring[k], wrap);
          const wig = (1 - wrap) * 0.05;
          p.x += Math.sin(t * 3 + k * 0.7 + c.seed) * wig;
          p.y += Math.cos(t * 2.6 + k * 0.9 + c.seed) * wig;
          vis = showBall;
        }
        const bs = c.b < 5 ? macBubbles[c.b].g.scale.x : 1;
        const sz = 0.058 * vis * (t < T.siebzig ? Math.min(1, bs) : 1);
        if (sz <= 0.002) {
          beads.setMatrixAt(idx, hidden);
          continue;
        }
        sv.setScalar(sz);
        beads.setMatrixAt(idx, m4.compose(p, q.identity(), sv));
        col
          .copy(preview > 0 && t < T.eiweiss ? new THREE.Color(0xfff6e0) : yellow)
          .lerp(burnt, hot);
        beads.setColorAt(idx, col);
      }
    }
    beads.instanceMatrix.needsUpdate = true;
    if (beads.instanceColor) beads.instanceColor.needsUpdate = true;
  }

  // ---- cartons + barista
  const cartK = t >= T.hafer ? 1 : 0;
  cow.visible = oat.visible = cartK > 0;
  cow.scale.copy(squash(t, T.hafer + 0.15));
  oat.scale.copy(squash(t, T.hafer + 0.45));
  baristaBand.visible = t >= T.darum + 0.6;
  baristaBand.scale.copy(squash(t, T.darum + 0.6, 0.6));
  oil.forEach((d, i) => {
    const at = (i < 3 ? T.oel : T.zusaetze) + (i % 3) * 0.18;
    const k = ramp(t, at, at + 0.55);
    d.visible = t >= at && k < 1 && t < T.herz;
    d.position.set(OAT[0] + 0.0 + ((i % 3) - 1) * 0.12, lerp(7.5, 3.9, k * k), OAT[2] + 0.3);
  });

  // ---- cup: x-ray, float, pour, heart
  const cx =
    smooth(ramp(t, T.leichter - 0.1, T.leichter + 0.3)) *
    (1 - smooth(ramp(t, T.nah - 0.2, T.nah + 0.2)));
  cupShell.visible = cx < 0.02;
  cupXray.visible = cx >= 0.02;
  setXray([cupXrayMat], cx);
  cup.visible = t >= T.herz;
  if (t >= T.herz && t < T.kriegst) cup.scale.copy(squash(t, T.herz + 0.1));
  else cup.scale.set(1, 1, 1);
  floatFoam.visible = t >= T.leichter && t < T.hoch;
  floatFoam.position.set(0, 1.35 + Math.sin(t * 3) * 0.05, 0);
  animateArrows(floatUp, t, pop(t, T.leichter + 0.2, T.hoch));
  const dive = smooth(ramp(t, T.hoch + 0.3, T.nah));
  cloud.visible = dive > 0.01 && t < T.zack;
  cloud.scale.set(dive * 1.6, dive * 0.7, dive * 1.6);
  cloud.position.y = 0.7;
  const spread = smooth(ramp(t, T.nah + 0.2, T.zack));
  const isHeart = t >= T.zack;
  blob.visible = spread > 0.01 && !isHeart;
  blob.scale.setScalar(Math.max(0.001, spread * 0.95));
  heart.visible = isHeart;
  if (isHeart) heart.scale.copy(squash(t, T.zack, 0.6, 0.78));
  // pour stream: from the spout into the cup (below the crema, then on top)
  stream.visible = pouring && t < T.zack + 0.15 && t >= T.hoch + 0.15;
  if (stream.visible) {
    const sp = jug.localToWorld(V(1.38, H + 0.1, 0));
    const tgt = V(CUP[0] + 0.15, CUP[1] + (t < T.nah ? 0.8 : 1.32), CUP[2]);
    const len = sp.distanceTo(tgt);
    stream.position.copy(sp).add(tgt).multiplyScalar(0.5);
    stream.scale.set(1 + Math.sin(t * 20) * 0.08, len, 1);
    stream.quaternion.setFromUnitVectors(V(0, 1, 0), sp.clone().sub(tgt).normalize());
  }

  // ---- displays
  const hookK = pop(t, 0, T.duese);
  if (hookK > 0)
    gauge("temp", hookK, {
      label: "MILCH",
      value: 78,
      max: 100,
      unit: "°C",
      x: 700,
      y: 520,
      color: LED.red,
    });
  const rateK = pop(t, T.rate, T.reissen);
  if (rateK > 0) {
    const v = lerp(35, 70, smooth(ramp(t, T.rate, T.siebzig)));
    gauge("temp", rateK, {
      label: "MILCH",
      value: v,
      max: 100,
      unit: "°C",
      x: 700,
      y: 520,
      color: v >= 69.5 ? LED.red : LED.yellow,
    });
  }
  const mk = pop(t, T.hafer + 0.3, T.darum);
  if (mk > 0) {
    meter("kuh", mk, {
      label: "EIWEISS KUHMILCH",
      value: 1,
      y: 1380,
      color: LED.blue,
      text: "3,4 g",
    });
    const hv = lerp(1, 0.3, smooth(ramp(t, T.dreimal, T.dreimal + 0.6)));
    meter("hafer", mk, {
      label: "EIWEISS HAFERMILCH",
      value: hv,
      y: 1530,
      color: LED.yellow,
      text: t >= T.dreimal ? "1 g" : "?",
    });
  }
  if (t >= T.zweites && t < T.kriegst)
    showPanel(pop(t, T.zweites, T.kriegst), "ZWEITES MAL", "FLACH", LED.blue);
  else if (t >= T.lack && t < T.folge)
    showPanel(pop(t, T.lack, T.folge), "MIKROSCHAUM", "GLÄNZT", LED.green);
  else showPanel(0);
  showNope(pop(t, T.zweites + 0.2, T.kriegst), 0, 4.6, 0.6, 0.9);

  labels(t, LABELS);
  applyCamera(t);
  renderFrame();
}

start(renderAt);
