// #68 Kabellos laden — inside a car on the Autobahn at golden hour, seen
// from just above the centre console (1 unit = 5 cm). The low sun shines
// through the windshield straight onto the console: graphite soft-touch
// plastic, piano-black trim, brushed-aluminium strips. The charging tray
// (the subject, scene.js) sits at the origin; behind it a coin cubby full of
// euro coins, the gear selector, two cup holders with a to-go coffee.
// Hero piece: the dashboard with the glowing navigation screen, the
// steering wheel on the left and the windshield. Outside: the Autobahn
// rushing towards the camera — lane dashes, guard rails, poplars, hills,
// the sun low above the road. Life: road + trees streaming past, the
// air freshener swinging under the mirror, dust in the sunbeam, the map
// scrolling on the screen.
import { THREE, ground, onFrame, rng, real, roundedBox, scene, flat } from "./world.js";
import { setSky, finishSet, fireflies, F } from "./environments.js";

const R = rng(68);
const PI = Math.PI;

// ---------------------------------------------------------------- light
setSky({
  top: [0.32, 0.42, 0.66],
  mid: [0.88, 0.62, 0.52],
  hor: [1.0, 0.72, 0.42],
  below: [0.5, 0.42, 0.38],
  sun: [1.0, 0.8, 0.5],
  sunDir: [-0.18, 0.1, -1],
  cloud: [0xffe2c8, 0xffa070],
  clouds: 12,
  birds: false,
  stars: 0,
  hemi: [0xffe0c8, 0x40363a, 1.2],
  key: [0xffc98a, 3.0],
  keyPos: [-5, 15, -20],
  rim: [0xff9a5a, 0.6],
  fog: [140, 520],
});

const add = (mesh, x, y, z, parent = ground, shadow = true) => {
  mesh.position.set(x, y, z);
  mesh.castShadow = shadow;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
};
export const canvasTex = (w, h, draw) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
};

// ---------------------------------------------------------------- materials
const soft = real.plastic(0x2b2d31, { roughness: 0.62, clearcoat: 0.1 });
const softLight = real.plastic(0x3a3c41, { roughness: 0.6, clearcoat: 0.1 });
export const piano = real.gloss(0x0b0b0d, { roughness: 0.12 });
const alu = real.metal(0xc4c8cf, { roughness: 0.32 });
const leather = real.fabric(0x5a4334, { roughness: 0.9 });
const leatherDark = real.fabric(0x3e2f26, { roughness: 0.9 });

// ---------------------------------------------------------------- centre console
// top surface at y = 0 (the charging tray sits on it at the origin)
{
  // body: from the dashboard (z -6) back to the armrest (z 16)
  add(new THREE.Mesh(roundedBox(10, 12, 22, 0.5, 6), soft), 0, -6.05, 5);
  // piano-black top plate around the tray + gear selector
  add(new THREE.Mesh(roundedBox(8.6, 0.16, 15, 0.08, 4), piano), 0, 0.02, 3.2);
  // brushed aluminium strips along both sides
  for (const sx of [-1, 1])
    add(new THREE.Mesh(roundedBox(0.18, 0.22, 21, 0.06, 3), alu), sx * 4.6, -0.05, 5);
  // armrest (leather) at the back
  add(new THREE.Mesh(roundedBox(9.4, 2.2, 7, 0.9, 6), leather), 0, 1.0, 14.6);
  // stitching line on the armrest
  add(new THREE.Mesh(roundedBox(9.0, 0.04, 0.05, 0.02), flat(0xd8b48a)), 0, 2.12, 12.2);
}

// coin cubby right behind the tray: a recessed rubber-lined box
export const CUBBY = { x: 0, y: 0.1, z: 3.6, w: 3.6, d: 2.0 };
{
  const rim = real.gloss(0x111114, { roughness: 0.18 });
  add(new THREE.Mesh(roundedBox(CUBBY.w + 0.5, 0.28, 0.25, 0.08), rim), 0, 0.2, CUBBY.z - 1.12);
  add(new THREE.Mesh(roundedBox(CUBBY.w + 0.5, 0.28, 0.25, 0.08), rim), 0, 0.2, CUBBY.z + 1.12);
  for (const sx of [-1, 1])
    add(
      new THREE.Mesh(roundedBox(0.25, 0.28, 2.4, 0.08), rim),
      sx * (CUBBY.w / 2 + 0.12),
      0.2,
      CUBBY.z,
    );
  add(
    new THREE.Mesh(roundedBox(CUBBY.w, 0.06, CUBBY.d, 0.03), real.rubber(0x1d1e21)),
    0,
    0.1,
    CUBBY.z,
  );
}

// euro coins in the cubby (the hook coin lives in scene.js)
export const coinMats = {
  gold: real.metal(0xd9b25a, { roughness: 0.4 }),
  silver: real.metal(0xd0d3d8, { roughness: 0.38 }),
  copper: real.metal(0xc0703e, { roughness: 0.42 }),
};
export function makeCoin(kind, r = 0.6) {
  const g = new THREE.Group();
  const th = r * 0.19;
  const rim = new THREE.CylinderGeometry(r, r, th, 64);
  if (kind === "zwei" || kind === "eins") {
    // bimetal: outer ring + inner disc in the other metal
    const outer = new THREE.Mesh(rim, kind === "zwei" ? coinMats.silver : coinMats.gold);
    const inner = new THREE.Mesh(
      new THREE.CylinderGeometry(r * 0.66, r * 0.66, th * 1.06, 64),
      kind === "zwei" ? coinMats.gold : coinMats.silver,
    );
    g.add(outer, inner);
  } else {
    g.add(new THREE.Mesh(rim, kind === "cent" ? coinMats.copper : coinMats.gold));
  }
  // raised rim ring on both faces
  for (const s of [-1, 1]) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r * 0.93, th * 0.12, 8, 64),
      g.children[0].material,
    );
    ring.rotation.x = PI / 2;
    ring.position.y = (s * th) / 2;
    g.add(ring);
  }
  // a tiny relief stroke on the face
  const relief = new THREE.Mesh(
    new THREE.BoxGeometry(r * 0.12, th * 0.25, r * 0.55),
    g.children[g.children.length > 3 ? 1 : 0].material,
  );
  relief.position.y = th * 0.55;
  g.add(relief);
  g.traverse((m) => {
    if (m.isMesh) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
  });
  return g;
}
{
  const kinds = [
    "zwei",
    "eins",
    "fuenfzig",
    "cent",
    "zwei",
    "zwanzig",
    "cent",
    "eins",
    "fuenfzig",
    "zwanzig",
    "eins",
    "cent",
    "zwei",
    "fuenfzig",
  ];
  const radius = { zwei: 0.26, eins: 0.23, fuenfzig: 0.24, zwanzig: 0.22, cent: 0.16 };
  kinds.forEach((k, i) => {
    const c = makeCoin(k, radius[k]);
    c.position.set(
      CUBBY.x - 1.2 + (i % 5) * 0.6 + (R() - 0.5) * 0.15,
      0.16 + Math.floor(i / 10) * 0.05,
      CUBBY.z - 0.55 + (Math.floor(i / 5) % 3) * 0.55 + (R() - 0.5) * 0.15,
    );
    c.rotation.set((R() - 0.5) * 0.25, R() * PI, (R() - 0.5) * 0.25);
    ground.add(c);
  });
}

// gear selector (automatic, short stubby lever) + P R N D strip
{
  add(new THREE.Mesh(roundedBox(3.2, 0.18, 4.2, 0.1), piano), 0, 0.14, 8.0);
  const boot = add(
    new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.0, 0.8, 48), leatherDark),
    0,
    0.6,
    8.2,
  );
  boot.castShadow = true;
  const lever = add(new THREE.Mesh(roundedBox(1.1, 2.2, 1.7, 0.45, 6), leather), 0, 1.9, 8.2);
  lever.rotation.x = -0.12;
  add(new THREE.Mesh(roundedBox(0.9, 0.08, 1.4, 0.04), alu), 0, 3.02, 8.05);
  const prnd = canvasTex(128, 32, (g, w, h) => {
    g.fillStyle = "#0b0b0d";
    g.fillRect(0, 0, w, h);
    g.font = "bold 24px Montserrat, Arial";
    g.textAlign = "center";
    ["P", "R", "N", "D"].forEach((s, i) => {
      g.fillStyle = s === "D" ? "#ffffff" : "#6c6f76";
      g.fillText(s, 16 + i * 32, 25);
    });
  });
  const strip = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 0.6),
    new THREE.MeshStandardMaterial({
      map: prnd,
      emissive: 0xffffff,
      emissiveMap: prnd,
      emissiveIntensity: 0.5,
    }),
  );
  strip.rotation.x = -PI / 2;
  strip.position.set(0, 0.24, 6.4);
  ground.add(strip);
}

// cup holders with a to-go coffee
{
  for (const sx of [-1, 1]) {
    const ring = add(
      new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.12, 12, 48), piano),
      sx * 1.9,
      0.12,
      11.0,
    );
    ring.rotation.x = PI / 2;
  }
  const cup = new THREE.Group();
  const pts = [];
  for (let i = 0; i <= 20; i++) pts.push(new THREE.Vector2(0.95 + (i / 20) * 0.3, -1 + i * 0.22));
  cup.add(
    new THREE.Mesh(new THREE.LatheGeometry(pts, 64), real.plastic(0xf2ece2, { roughness: 0.6 })),
  );
  const sleeve = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.08, 1.4, 64, 1, true),
    real.fabric(0x9b6b43, { side: THREE.DoubleSide }),
  );
  sleeve.position.y = 1.4;
  cup.add(sleeve);
  const lid = new THREE.Mesh(
    new THREE.CylinderGeometry(1.32, 1.3, 0.35, 64),
    real.plastic(0x1c1c1e),
  );
  lid.position.y = 3.5;
  cup.add(lid);
  cup.traverse((m) => m.isMesh && (m.castShadow = m.receiveShadow = true));
  cup.position.set(1.9, 0.2, 11.0);
  ground.add(cup);
}

// ---------------------------------------------------------------- centre stack + dashboard (hero piece)
export const SCREEN = { x: 0, y: 7.4, z: -11.2 };
const screenTex = canvasTex(512, 320, (g, w, h) => {
  g.fillStyle = "#1f2a33";
  g.fillRect(0, 0, w, h);
  // map: blocks + a blue route
  for (let i = 0; i < 60; i++) {
    g.fillStyle = `rgba(${60 + R() * 30},${80 + R() * 30},${90 + R() * 30},0.8)`;
    g.fillRect(R() * w, R() * h, 20 + R() * 60, 14 + R() * 40);
  }
  g.strokeStyle = "#3aa0ff";
  g.lineWidth = 10;
  g.beginPath();
  g.moveTo(w * 0.5, h);
  g.bezierCurveTo(w * 0.52, h * 0.6, w * 0.4, h * 0.4, w * 0.55, 0);
  g.stroke();
  g.fillStyle = "#ffffff";
  g.beginPath();
  g.moveTo(w * 0.5, h * 0.78);
  g.lineTo(w * 0.47, h * 0.86);
  g.lineTo(w * 0.53, h * 0.86);
  g.fill();
  g.fillStyle = "rgba(0,0,0,0.55)";
  g.fillRect(0, 0, w, 44);
  g.fillStyle = "#ffffff";
  g.font = "bold 28px Montserrat, Arial";
  g.fillText("A9  ·  München 212 km", 18, 31);
  g.fillText("18:42", w - 96, 31);
});
screenTex.wrapT = THREE.RepeatWrapping;
{
  // the stack rises from the console front up into the dash
  const stack = add(new THREE.Mesh(roundedBox(9, 9, 2.6, 0.5, 6), soft), 0, -0.5, -7.2);
  stack.rotation.x = -0.25;
  // climate knobs + buttons on the stack
  for (const sx of [-1, 1]) {
    const k = add(
      new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.8, 0.6, 48), alu),
      sx * 2.6,
      0.6,
      -5.75,
    );
    k.rotation.x = PI / 2 - 0.25;
  }
  for (let i = 0; i < 4; i++)
    add(
      new THREE.Mesh(roundedBox(0.9, 0.5, 0.3, 0.12), piano),
      -1.35 + i * 0.9,
      2.0,
      -6.05,
    ).rotation.x = -0.25;
  // hazard button (red triangle)
  const hz = add(
    new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 3), real.plastic(0xd12b1f)),
    0,
    0.6,
    -5.85,
  );
  hz.rotation.x = PI / 2 - 0.25;
  // dashboard: a long soft slab across the car
  add(new THREE.Mesh(roundedBox(60, 5, 9, 1.6, 6), soft), 0, 6.2, -15.5);
  add(new THREE.Mesh(roundedBox(60, 1.6, 5, 0.7, 6), softLight), 0, 9.2, -17.5);
  // wood-look trim strip along the dash
  add(
    new THREE.Mesh(
      roundedBox(58, 0.7, 0.4, 0.2),
      real.wood(0x5b3a24, { roughness: 0.35, clearcoat: 0.8 }),
    ),
    0,
    4.8,
    -10.9,
  );
  // air vents: chrome-rimmed slats
  for (const vx of [-4.2, 4.2, -18, 18]) {
    add(new THREE.Mesh(roundedBox(3.2, 1.4, 0.5, 0.25), alu), vx, 3.8, -10.9);
    for (let s = 0; s < 4; s++)
      add(new THREE.Mesh(roundedBox(2.8, 0.1, 0.5, 0.04), piano), vx, 3.35 + s * 0.3, -10.75);
  }
  // the screen: glass slab, glowing map, slightly tilted
  const frame = add(
    new THREE.Mesh(roundedBox(9.2, 5.6, 0.5, 0.3), piano),
    SCREEN.x,
    SCREEN.y,
    SCREEN.z - 0.2,
  );
  frame.rotation.x = -0.12;
  const scr = new THREE.Mesh(
    new THREE.PlaneGeometry(8.6, 5.0),
    new THREE.MeshStandardMaterial({
      map: screenTex,
      emissive: 0xffffff,
      emissiveMap: screenTex,
      emissiveIntensity: 0.9,
      roughness: 0.15,
    }),
  );
  scr.rotation.x = -0.12;
  scr.position.set(SCREEN.x, SCREEN.y, SCREEN.z + 0.07);
  ground.add(scr);
  onFrame((t) => (screenTex.offset.y = -t * 0.01));
}

// steering wheel + instrument hood on the driver's side (left)
{
  const wheel = new THREE.Group();
  wheel.position.set(-14, 6.5, -8);
  wheel.rotation.x = -0.45;
  ground.add(wheel);
  const rimMesh = new THREE.Mesh(new THREE.TorusGeometry(4.6, 0.55, 24, 96), leatherDark);
  rimMesh.castShadow = true;
  wheel.add(rimMesh);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 1.0, 48), soft);
  hub.rotation.x = PI / 2;
  wheel.add(hub);
  for (const a of [PI / 2 + 0.0, -0.25, PI + 0.25]) {
    const sp = new THREE.Mesh(roundedBox(4.2, 0.9, 0.5, 0.2), softLight);
    sp.position.set(Math.cos(a) * 2.6, Math.sin(a) * 2.6, 0);
    sp.rotation.z = a;
    sp.castShadow = true;
    wheel.add(sp);
  }
  add(new THREE.Mesh(roundedBox(14, 3, 6, 1.2, 6), soft), -14, 9.4, -13.5);
}

// seats (only the inner edges show)
for (const sx of [-1, 1]) {
  add(new THREE.Mesh(roundedBox(13, 3.5, 14, 1.6, 6), leather), sx * 13.5, -2.5, 6);
  add(new THREE.Mesh(roundedBox(1.6, 2.5, 13, 0.7, 6), leatherDark), sx * 7.6, -0.9, 6); // bolster
  const back = add(new THREE.Mesh(roundedBox(13, 18, 3.5, 1.6, 6), leather), sx * 13.5, 7, 14);
  back.rotation.x = -0.2;
}

// doors + floor + roof
{
  for (const sx of [-1, 1]) {
    add(new THREE.Mesh(roundedBox(1.2, 16, 40, 0.5, 6), softLight), sx * 23, -2, 2);
    // a-pillars
    const p = add(
      new THREE.Mesh(roundedBox(2.4, 22, 2, 0.8), softLight),
      sx * 25,
      18,
      -12,
      ground,
      false,
    );
    p.rotation.x = 0.85;
  }
  add(
    new THREE.Mesh(new THREE.PlaneGeometry(60, 60), real.fabric(0x26262a)),
    0,
    -12,
    4,
  ).rotation.x = -PI / 2;
  // headliner, far up behind the windshield top edge; no shadow so it never darkens the console
  const roof = add(
    new THREE.Mesh(new THREE.PlaneGeometry(60, 34), real.fabric(0xb9b2a8)),
    0,
    26,
    14,
    ground,
    false,
  );
  roof.rotation.x = PI / 2;
  // rear-view mirror + air freshener tree (life)
  const mirror = add(new THREE.Mesh(roundedBox(6, 2, 0.8, 0.5), soft), 0, 22.5, -9, ground, false);
  mirror.rotation.x = 0.2;
  const tree = new THREE.Group();
  tree.position.set(0.8, 21.4, -8.6);
  ground.add(tree);
  const string = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.6, 6), flat(0xeeeeee));
  string.position.y = -1.3;
  tree.add(string);
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0.9, -1.2);
  shape.lineTo(0.5, -1.2);
  shape.lineTo(1.1, -2.2);
  shape.lineTo(-1.1, -2.2);
  shape.lineTo(-0.5, -1.2);
  shape.lineTo(-0.9, -1.2);
  shape.closePath();
  const leaf = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: 0.04, bevelEnabled: false }),
    real.plastic(0x2f9e5a, { roughness: 0.8 }),
  );
  leaf.position.y = -2.4;
  tree.add(leaf);
  onFrame((t) => {
    tree.rotation.z = Math.sin(t * 1.7) * 0.18 + Math.sin(t * 4.3) * 0.05;
    tree.rotation.y = Math.sin(t * 0.9) * 0.6;
  });
}

// windshield (no shadow, barely visible glass)
{
  const ws = new THREE.Mesh(
    new THREE.PlaneGeometry(52, 22),
    real.glass(0xcfe3ee, { opacity: 0.08 }),
  );
  ws.position.set(0, 17, -14.5);
  ws.rotation.x = -0.85;
  ws.castShadow = false;
  ground.add(ws);
}

// ---------------------------------------------------------------- outside: the Autobahn
const ROAD_Y = -16;
const SPEED = 160; // units per second the world rushes past
{
  // asphalt with lane dashes, scrolling
  const tex = canvasTex(512, 1024, (g, w, h) => {
    g.fillStyle = "#4a4a50";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 6000; i++) {
      const v = 60 + R() * 40;
      g.fillStyle = `rgba(${v},${v},${v + 4},0.5)`;
      g.fillRect(R() * w, R() * h, 2, 2);
    }
    g.fillStyle = "#f2efe6";
    g.fillRect(40, 0, 10, h); // solid edge lines
    g.fillRect(w - 50, 0, 10, h);
    for (let y = 0; y < h; y += 256) g.fillRect(w / 2 - 6, y, 12, 120); // dashes
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 14);
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 1400),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 }),
  );
  road.rotation.x = -PI / 2;
  road.position.set(-6, ROAD_Y, -680);
  road.receiveShadow = false;
  ground.add(road);
  onFrame((t) => (tex.offset.y = -((t * SPEED) / 100) % 1));
  // verges
  const grass = new THREE.Mesh(
    new THREE.PlaneGeometry(1200, 1400),
    new THREE.MeshStandardMaterial({ color: 0x46543a, roughness: 1 }),
  );
  grass.rotation.x = -PI / 2;
  grass.position.set(0, ROAD_Y - 0.2, -680);
  ground.add(grass);
}
// guard rails + poplars streaming past (positions wrap)
{
  const LEN = 700;
  const movers = [];
  const railMat = real.metal(0xb8bcc2, { roughness: 0.35 });
  for (const sx of [-1, 1]) {
    for (let i = 0; i < 40; i++) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4, 0.5), railMat);
      post.position.set(-6 + sx * 34, ROAD_Y + 2, 0);
      ground.add(post);
      movers.push({ m: post, z0: -i * (LEN / 40) });
    }
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.4, LEN), railMat);
    rail.position.set(-6 + sx * 34, ROAD_Y + 3.6, -LEN / 2 - 20);
    ground.add(rail);
  }
  const leafMat = flat(0x6f8a3a);
  const trunkMat = flat(0x5a4130);
  for (let i = 0; i < 46; i++) {
    const tr = new THREE.Group();
    const s = 1 + R() * 0.6;
    const crown = F(new THREE.ConeGeometry(5 * s, 26 * s, 7), leafMat, 0.1, i);
    crown.position.y = 16 * s;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1, 6, 6), trunkMat);
    trunk.position.y = 3;
    tr.add(crown, trunk);
    const sx = i % 2 ? 1 : -1;
    tr.position.set(-6 + sx * (52 + R() * 50), ROAD_Y, 0);
    ground.add(tr);
    movers.push({ m: tr, z0: -R() * LEN });
  }
  onFrame((t) => {
    for (const { m, z0 } of movers) {
      let z = (z0 + t * SPEED) % LEN;
      if (z > 0) z -= LEN;
      m.position.z = z - 20;
    }
  });
  // a car ahead on the right lane, slowly getting closer
  const ahead = new THREE.Group();
  const body = new THREE.Mesh(roundedBox(9, 4, 18, 1.5, 4), real.gloss(0x2d5fa8));
  body.position.y = 3;
  const cab = new THREE.Mesh(roundedBox(8, 3, 9, 1.2, 4), real.glass(0x223344, { opacity: 0.85 }));
  cab.position.set(0, 6.2, 1);
  ahead.add(body, cab);
  for (const sx of [-1, 1]) {
    const tl = new THREE.Mesh(
      roundedBox(2, 0.8, 0.3, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x400000, emissive: 0xff2a1a, emissiveIntensity: 2 }),
    );
    tl.position.set(sx * 3.4, 4, 9.1);
    ahead.add(tl);
  }
  ahead.position.set(8, ROAD_Y, -220);
  ground.add(ahead);
  onFrame((t) => (ahead.position.z = -260 + t * 1.2));
}
// hills on the horizon
{
  const hillMat = flat(0x7a7a5a);
  for (let i = 0; i < 14; i++) {
    const h = F(
      new THREE.SphereGeometry(60 + R() * 60, 10, 6, 0, PI * 2, 0, PI / 2),
      hillMat,
      0.1,
      i,
    );
    h.scale.y = 0.25 + R() * 0.2;
    h.position.set(-500 + i * 80 + R() * 40, ROAD_Y - 2, -420 - R() * 60);
    ground.add(h);
  }
}

// dust in the sunbeam over the console
fireflies(60, { area: [-9, 9, 1, 12, -8, 10], color: 0xffe0b0, seed: 68, size: 0.05 });

finishSet({ ground: 0x5a4a40 });

// a warm bounce + the screen glow so the shaded side of the console is never pitch black
{
  const fill = new THREE.PointLight(0xffb27a, 30, 40, 1.6);
  fill.position.set(6, 8, 6);
  scene.add(fill);
  const scr = new THREE.PointLight(0x7fb8ff, 12, 18, 1.6);
  scr.position.set(0, 7, -9);
  scene.add(scr);
}
