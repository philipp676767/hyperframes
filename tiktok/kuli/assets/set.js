// Set of #52 "Kuli-Deckel": the Abi exam in a school gym hall on a sunny
// late-morning — seen at the scale of the pen (1 unit ≈ 5 cm), so the
// viewer's exam desk is a landscape: a birch desktop with the exam sheet,
// an eraser, a calculator, a water bottle, a pencil case, an apple and the
// student ID. Below it the gym: orange sports floor with court lines, rows
// of single desks with their chairs, and far away the hero pieces — the
// basketball board + big hall clock on the back wall, the wall bars, the
// window band with sun shafts falling across the hall, gym mats, a vaulting
// box. Life: dust in the sun, the clock's second hand, swaying climbing
// ropes, paper corners lifting on the other desks.
import { THREE, flat, ground, onFrame, rng, patches, facet, facetMat, V } from "./world.js";
import { setSky, finishSet, F, fireflies } from "./environments.js";

const r = rng(52);
export const FLOOR = -15; // gym floor (the desktop is y = 0)
export const DESK = { x0: -8.5, x1: 8.5, z0: -6.5, z1: 5.5 };

// ---------------------------------------------------------------- light
// warm late-morning sun through the high windows on the left (-x)
setSky({
  top: [0.62, 0.76, 0.95],
  mid: [0.9, 0.88, 0.84],
  hor: [1.0, 0.9, 0.74],
  below: [0.86, 0.74, 0.6],
  sun: [1.0, 0.92, 0.72],
  sunDir: [-0.7, 0.45, -0.3],
  cloud: [0xffffff, 0xffe6cc],
  noClouds: true,
  birds: false,
  hemi: [0xfff2df, 0x9a6a48, 1.35],
  key: [0xfff0d8, 2.6],
  keyPos: [-10, 12, 3],
  rim: [0xbfd8ff, 0.9],
  fog: [130, 420],
});

// ---------------------------------------------------------------- helpers
const box = (w, h, d, mat, x, y, z, amt = 0.04, seed = 1, shadow = true, parent = ground) => {
  const m = F(new THREE.BoxGeometry(w, h, d), mat, amt, seed);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};
const cyl = (rt, rb, h, seg, mat, x, y, z, amt = 0.05, seed = 1, parent = ground) => {
  const m = F(new THREE.CylinderGeometry(rt, rb, h, seg), mat, amt, seed);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
};
const glow = (color, i = 1.6) => flat(0xffffff, { emissive: color, emissiveIntensity: i });

// canvas texture (exam sheets, signs) — plain sans-serif so it never waits for a font
export function paperTex(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  draw(g, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
const lines = (g, w, h, y0, step, col = "#c9d6ea") => {
  g.strokeStyle = col;
  g.lineWidth = 3;
  for (let y = y0; y < h - 40; y += step) {
    g.beginPath();
    g.moveTo(40, y);
    g.lineTo(w - 40, y);
    g.stroke();
  }
};

// ---------------------------------------------------------------- materials
const birch = flat(0xe2c38f, { roughness: 0.55 });
const edgeBand = flat(0x9a7448, { roughness: 0.6 });
const legMat = flat(0x8b97a6, { metalness: 0.55, roughness: 0.35 });
const chairMat = flat(0x2f6fb8, { roughness: 0.5 });
const paperMat = flat(0xf8f6f0, { roughness: 0.9 });

// ---------------------------------------------------------------- the exam desk (our landscape)
{
  const w = DESK.x1 - DESK.x0;
  const d = DESK.z1 - DESK.z0;
  const cx = (DESK.x0 + DESK.x1) / 2;
  const cz = (DESK.z0 + DESK.z1) / 2;
  const top = new THREE.Mesh(
    patches(facet(new THREE.BoxGeometry(w, 0.8, d, 34, 1, 24), 0.025, 3), {
      amt: 0.07,
      scale: 0.25,
      seed: 4,
      warm: 0.5,
    }),
    facetMat(birch),
  );
  top.position.set(cx, -0.4, cz);
  top.receiveShadow = true;
  top.castShadow = true;
  ground.add(top);
  // wood grain streaks
  for (let i = 0; i < 26; i++) {
    const z = DESK.z0 + 0.3 + r() * (d - 0.6);
    const len = 2 + r() * 7;
    const x = DESK.x0 + 0.4 + r() * (w - len - 0.8);
    const s = new THREE.Mesh(
      new THREE.BoxGeometry(len, 0.01, 0.05 + r() * 0.06),
      flat(r() > 0.5 ? 0xd2ad78 : 0xeacf9f),
    );
    s.position.set(x + len / 2, 0.006, z);
    s.receiveShadow = true;
    ground.add(s);
  }
  // dark edge band all round
  box(w + 0.3, 0.86, 0.18, edgeBand, cx, -0.42, DESK.z1 + 0.08, 0.03, 5);
  box(w + 0.3, 0.86, 0.18, edgeBand, cx, -0.42, DESK.z0 - 0.08, 0.03, 6);
  box(0.18, 0.86, d, edgeBand, DESK.x0 - 0.08, -0.42, cz, 0.03, 7);
  box(0.18, 0.86, d, edgeBand, DESK.x1 + 0.08, -0.42, cz, 0.03, 8);
  // metal frame + legs
  for (const [x, z] of [
    [DESK.x0 + 1, DESK.z0 + 1],
    [DESK.x1 - 1, DESK.z0 + 1],
    [DESK.x0 + 1, DESK.z1 - 1],
    [DESK.x1 - 1, DESK.z1 - 1],
  ])
    cyl(0.38, 0.38, -FLOOR - 0.8, 8, legMat, x, (FLOOR - 0.8) / 2, z, 0.03, 9);
  box(w - 2, 0.6, 0.3, legMat, cx, -1.3, DESK.z0 + 1, 0.02, 10);
  box(w - 2, 0.6, 0.3, legMat, cx, -1.3, DESK.z1 - 1, 0.02, 11);
}

// chair behind the desk (the student's side, +z)
function chair(x, z, rotY = 0, parent = ground) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  parent.add(g);
  box(9, 0.7, 8, chairMat, 0, FLOOR + 9, 0, 0.04, 21, true, g);
  box(9, 5, 0.6, chairMat, 0, FLOOR + 15.5, 4.2, 0.04, 22, true, g);
  for (const [a, b] of [
    [-4, -3.5],
    [4, -3.5],
    [-4, 3.5],
    [4, 3.5],
  ])
    cyl(0.3, 0.3, 9, 6, legMat, a, FLOOR + 4.5, b, 0.02, 23, g);
  cyl(0.3, 0.3, 6.5, 6, legMat, -4, FLOOR + 12, 4.2, 0.02, 24, g);
  cyl(0.3, 0.3, 6.5, 6, legMat, 4, FLOOR + 12, 4.2, 0.02, 25, g);
  return g;
}
chair(0, 11.5);

// ---------------------------------------------------------------- on the desk
// the exam sheet under the pen (scene.js lays the pen on it)
export const examTex = paperTex(840, 1180, (g, w, h) => {
  g.fillStyle = "#fbfaf6";
  g.fillRect(0, 0, w, h);
  g.fillStyle = "#1d2a44";
  g.font = "bold 74px sans-serif";
  g.fillText("ABITUR 2026", 48, 110);
  g.font = "bold 46px sans-serif";
  g.fillStyle = "#3a4a66";
  g.fillText("Mathematik · Teil A", 48, 175);
  g.strokeStyle = "#1d2a44";
  g.lineWidth = 4;
  g.strokeRect(48, 215, w - 96, 90);
  g.font = "34px sans-serif";
  g.fillText("Name:", 66, 272);
  lines(g, w, h, 380, 58);
  g.fillStyle = "#e2453c";
  g.font = "bold 40px sans-serif";
  for (const [i, y] of [
    [1, 365],
    [2, 655],
    [3, 945],
  ])
    g.fillText(`Aufgabe ${i}`, 48, y);
  // a few handwritten lines in blue
  g.strokeStyle = "#2650c8";
  g.lineWidth = 5;
  for (let k = 0; k < 4; k++) {
    g.beginPath();
    const y = 430 + k * 58;
    g.moveTo(60, y);
    for (let x = 60; x < 600 - k * 90; x += 18) g.lineTo(x, y - 8 + Math.sin(x * 0.21 + k) * 9);
    g.stroke();
  }
});
{
  const s = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.03, 6.4), [
    paperMat,
    paperMat,
    flat(0xffffff, { map: examTex, roughness: 0.9 }),
    paperMat,
    paperMat,
    paperMat,
  ]);
  s.position.set(0.4, 0.02, 0.4);
  s.rotation.y = 0.1;
  s.receiveShadow = true;
  ground.add(s);
  // scratch paper underneath, skewed
  const tex = paperTex(420, 600, (g, w, h) => {
    g.fillStyle = "#fbfaf6";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#b8cbe6";
    g.lineWidth = 2;
    for (let x = 0; x < w; x += 30) g.strokeRect(x, 0, 30, h);
    for (let y = 0; y < h; y += 30) g.strokeRect(0, y, w, 30);
    g.fillStyle = "#2650c8";
    g.font = "bold 44px sans-serif";
    g.fillText("x² + 2x = ?", 40, 120);
  });
  const s2 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.02, 6.0), [
    paperMat,
    paperMat,
    flat(0xffffff, { map: tex, roughness: 0.9 }),
    paperMat,
    paperMat,
    paperMat,
  ]);
  s2.position.set(-4.6, 0.012, 1.6);
  s2.rotation.y = -0.32;
  s2.receiveShadow = true;
  ground.add(s2);
}
// eraser: white rubber in a blue sleeve
box(1.1, 0.55, 2.2, flat(0xf4efe8, { roughness: 0.8 }), -6.2, 0.28, -3.4, 0.03, 31).rotation.y =
  0.5;
box(1.18, 0.6, 1.2, flat(0x2f6fd6, { roughness: 0.5 }), -6.0, 0.3, -3.1, 0.03, 32).rotation.y = 0.5;
// calculator
{
  const g = new THREE.Group();
  g.position.set(5.9, 0, -2.2);
  g.rotation.y = -0.35;
  ground.add(g);
  box(3.3, 0.42, 6.2, flat(0x2b2f3a, { roughness: 0.45 }), 0, 0.21, 0, 0.03, 33, true, g);
  box(
    2.7,
    0.06,
    1.3,
    flat(0x9fb59a, { emissive: 0x30402c, emissiveIntensity: 0.3 }),
    0,
    0.44,
    -2.1,
    0.01,
    34,
    true,
    g,
  );
  const keyGeo = new THREE.BoxGeometry(0.5, 0.14, 0.42);
  const cols = [0x4a5060, 0x4a5060, 0x4a5060, 0xe2453c];
  for (let i = 0; i < 5; i++)
    for (let j = 0; j < 7; j++) {
      const k = new THREE.Mesh(
        keyGeo,
        flat(j === 0 ? 0x6b7282 : cols[i % 4 === 3 && j === 6 ? 3 : 0]),
      );
      k.position.set(-1.15 + i * 0.58, 0.48, -0.9 + j * 0.56);
      g.add(k);
    }
}
// water bottle (clear blue plastic) + its cap
{
  const bottle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.75, 0.75, 4.6, 18),
    new THREE.MeshStandardMaterial({
      color: 0xbfe2ff,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
    }),
  );
  bottle.position.set(-6.6, 2.3, -4.9);
  ground.add(bottle);
  const water = new THREE.Mesh(
    new THREE.CylinderGeometry(0.68, 0.68, 3.1, 18),
    new THREE.MeshStandardMaterial({
      color: 0x6fc3ff,
      transparent: true,
      opacity: 0.5,
      roughness: 0.1,
    }),
  );
  water.position.set(-6.6, 1.6, -4.9);
  ground.add(water);
  cyl(0.45, 0.6, 0.6, 14, flat(0xbfe2ff, { roughness: 0.2 }), -6.6, 4.9, -4.9, 0.02, 35);
  cyl(0.48, 0.48, 0.55, 14, flat(0x2f9bff, { roughness: 0.4 }), -6.6, 5.45, -4.9, 0.02, 36);
  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(0.77, 0.77, 1.3, 18, 1, true),
    flat(0x3dbd7a, { roughness: 0.6 }),
  );
  label.position.set(-6.6, 2.6, -4.9);
  ground.add(label);
}
// pencil case (soft pouch, zip)
{
  const p = F(
    new THREE.CapsuleGeometry(0.85, 4.2, 4, 10),
    flat(0xff8fb8, { roughness: 0.8 }),
    0.06,
    37,
  );
  p.rotation.z = Math.PI / 2;
  p.rotation.y = 0.2;
  p.scale.set(1, 1, 0.75);
  p.position.set(3.6, 0.65, -5.3);
  p.castShadow = p.receiveShadow = true;
  ground.add(p);
  const zip = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.08, 0.12), flat(0x3a3340));
  zip.position.set(3.6, 1.3, -5.3);
  zip.rotation.y = 0.2;
  ground.add(zip);
  // a pencil and a highlighter sticking out
  const pen1 = cyl(0.14, 0.14, 3.2, 6, flat(0xffd23f), 6.5, 1.0, -5.6, 0.02, 38);
  pen1.rotation.z = Math.PI / 2 - 0.25;
  pen1.rotation.y = 0.2;
  const hl = cyl(0.26, 0.26, 2.6, 8, flat(0x7dff6b, { roughness: 0.4 }), 1.0, 1.0, -5.0, 0.02, 39);
  hl.rotation.z = Math.PI / 2 + 0.2;
}
// apple (snack break)
{
  const a = F(new THREE.IcosahedronGeometry(0.95, 1), flat(0xd8352a, { roughness: 0.4 }), 0.07, 40);
  a.scale.set(1, 0.9, 1);
  a.position.set(-7.0, 0.86, 3.6);
  a.castShadow = true;
  ground.add(a);
  cyl(0.05, 0.07, 0.5, 5, flat(0x5a3a22), -7.0, 1.85, 3.6, 0.02, 41);
  const leaf = F(new THREE.ConeGeometry(0.22, 0.6, 4), flat(0x4ea83a), 0.05, 42);
  leaf.rotation.z = -1.1;
  leaf.position.set(-6.75, 1.9, 3.6);
  ground.add(leaf);
}
// student ID card
{
  const tex = paperTex(400, 260, (g, w, h) => {
    g.fillStyle = "#e9f2ff";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#2f6fd6";
    g.fillRect(0, 0, w, 60);
    g.fillStyle = "#fff";
    g.font = "bold 34px sans-serif";
    g.fillText("SCHÜLERAUSWEIS", 20, 44);
    g.fillStyle = "#c9b28f";
    g.fillRect(24, 84, 110, 140);
    g.fillStyle = "#3a4a66";
    for (let i = 0; i < 4; i++) g.fillRect(160, 96 + i * 34, 200 - i * 30, 14);
  });
  const c = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.04, 1.7), [
    paperMat,
    paperMat,
    flat(0xffffff, { map: tex, roughness: 0.5 }),
    paperMat,
    paperMat,
    paperMat,
  ]);
  c.position.set(6.2, 0.03, 3.1);
  c.rotation.y = 0.35;
  c.receiveShadow = true;
  ground.add(c);
}

// ---------------------------------------------------------------- the gym floor
{
  const floor = new THREE.Mesh(
    patches(facet(new THREE.BoxGeometry(300, 1, 320, 60, 1, 64), 0.035, 51), {
      amt: 0.08,
      scale: 0.03,
      seed: 52,
      warm: 0.6,
    }),
    facetMat(flat(0xd98a48, { roughness: 0.32 })),
  );
  floor.position.set(0, FLOOR - 0.5, -60);
  floor.receiveShadow = true;
  ground.add(floor);
  // court lines
  const line = (w, d, col, x, z, rot = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, d), flat(col, { roughness: 0.4 }));
    m.position.set(x, FLOOR + 0.01, z);
    m.rotation.y = rot;
    m.receiveShadow = true;
    ground.add(m);
  };
  line(260, 1.1, 0xffffff, 0, -60); // centre line
  line(1.1, 290, 0xffffff, -120, -60);
  line(1.1, 290, 0xffffff, 120, -60);
  line(240, 1.1, 0xffffff, 0, -195);
  line(240, 1.1, 0xffffff, 0, 75);
  line(1.1, 200, 0x2f6fd6, -60, -60);
  line(1.1, 200, 0x2f6fd6, 60, -60);
  line(200, 1.1, 0xe2453c, 0, -150);
  line(200, 1.1, 0xe2453c, 0, 30);
  const ring = new THREE.Mesh(new THREE.RingGeometry(22, 23.2, 48), flat(0xffd23f));
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(0, FLOOR + 0.04, -60);
  ground.add(ring);
}

// ---------------------------------------------------------------- the other exam desks
const desks = [];
{
  const deskProto = () => {
    const g = new THREE.Group();
    box(17, 0.8, 12, birch, 0, -0.4, 0, 0.03, 61, true, g);
    for (const [x, z] of [
      [-7.5, -5],
      [7.5, -5],
      [-7.5, 5],
      [7.5, 5],
    ])
      cyl(0.38, 0.38, -FLOOR - 0.8, 6, legMat, x, (FLOOR - 0.8) / 2, z, 0.02, 62, g);
    return g;
  };
  const rows = [-38, -76, -114, -152, 38];
  const cols = [-96, -64, -32, 0, 32, 64, 96];
  let i = 0;
  for (const z of rows)
    for (const x of cols) {
      if (x === 0 && z === 38) continue;
      const g = deskProto();
      g.position.set(x + (r() - 0.5) * 2, 0, z + (r() - 0.5) * 2);
      g.rotation.y = (r() - 0.5) * 0.06;
      ground.add(g);
      chair(0, 11.5, 0, g);
      // an exam sheet with a corner that lifts in the draft
      const sheet = new THREE.Group();
      sheet.position.set((r() - 0.5) * 4, 0.03, (r() - 0.5) * 3);
      sheet.rotation.y = (r() - 0.5) * 0.5;
      g.add(sheet);
      const body = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.03, 6.4), paperMat);
      body.receiveShadow = true;
      sheet.add(body);
      const corner = new THREE.Group();
      corner.position.set(2.3, 0, 3.2);
      sheet.add(corner);
      const flap = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.03, 1.4), paperMat);
      flap.position.set(-0.7, 0.02, -0.7);
      corner.add(flap);
      desks.push({ corner, ph: r() * 6 });
      if (r() > 0.45) {
        const b = new THREE.Mesh(
          new THREE.CylinderGeometry(0.75, 0.75, 4.6, 12),
          flat([0x2f9bff, 0x3dbd7a, 0xff8fb8, 0xffd23f][i % 4], { roughness: 0.3 }),
        );
        b.position.set(-6, 2.3, -4);
        b.castShadow = true;
        g.add(b);
      }
      i++;
    }
  onFrame((t) => {
    for (const d of desks)
      d.corner.rotation.x = -0.12 - 0.18 * Math.max(0, Math.sin(t * 1.3 + d.ph)) ** 2;
  });
}

// ---------------------------------------------------------------- walls + ceiling
const wallMat = flat(0xf0e6d4, { roughness: 0.9 });
const lowWall = flat(0x7fb3a0, { roughness: 0.8 }); // the washable lower band
const CEIL = 110;
{
  // back wall (z -210) and front wall (z +90)
  for (const z of [-210, 90]) {
    box(320, CEIL - FLOOR, 2, wallMat, 0, (CEIL + FLOOR) / 2, z, 0.02, 71);
    box(320, 34, 2.4, lowWall, 0, FLOOR + 17, z + (z < 0 ? 0.3 : -0.3), 0.02, 72);
  }
  // side walls
  for (const x of [-152, 152]) {
    box(2, CEIL - FLOOR, 300, wallMat, x, (CEIL + FLOOR) / 2, -60, 0.02, 73);
    box(2.4, 34, 300, lowWall, x + (x < 0 ? 0.3 : -0.3), FLOOR + 17, -60, 0.02, 74);
  }
  // ceiling with steel beams and long lamps
  box(320, 2, 300, flat(0xd9d4cc), 0, CEIL, -60, 0.02, 75, false);
  for (let z = -200; z <= 80; z += 40) {
    box(
      304,
      3,
      2.4,
      flat(0x8a929c, { metalness: 0.4, roughness: 0.5 }),
      0,
      CEIL - 2.5,
      z,
      0.02,
      76,
      false,
    );
    for (const x of [-90, -30, 30, 90])
      box(26, 1, 4, glow(0xfff6e0, 1.2), x, CEIL - 4.2, z + 20, 0.01, 77, false);
  }
}
// windows: a high band on the left wall (the sun comes in here)
const winGlow = glow(0xe8f4ff, 1.2);
{
  for (let z = -195; z <= 75; z += 30) {
    box(1, 44, 24, winGlow, -150.6, 72, z, 0.0, 81, false);
    // white frames + glazing bars
    box(1.6, 2, 26, flat(0xffffff), -150.2, 50, z, 0.01, 82, false);
    box(1.6, 2, 26, flat(0xffffff), -150.2, 94, z, 0.01, 83, false);
    box(1.6, 46, 1.6, flat(0xffffff), -150.2, 72, z - 12.5, 0.01, 84, false);
    box(1.6, 1.4, 24, flat(0xffffff), -150.2, 72, z, 0.01, 85, false);
  }
  // high windows on the back wall too, so the long views end in light
  for (let x = -120; x <= 120; x += 40) box(28, 18, 1, winGlow, x, 92, -209.2, 0.0, 86, false);
}
// sun shafts: soft additive slabs from the windows down across the hall
{
  const mat = new THREE.MeshBasicMaterial({
    color: 0xfff1cc,
    transparent: true,
    opacity: 0.035,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
  });
  for (let z = -195; z <= 75; z += 30) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(150, 40, 18), mat);
    s.userData.noAO = true;
    s.position.set(-80, 40, z + 4);
    s.rotation.z = -0.55;
    ground.add(s);
  }
}

// ---------------------------------------------------------------- hero: basketball board + hall clock
let clockHands;
{
  const g = new THREE.Group();
  g.position.set(0, 0, -207);
  ground.add(g);
  box(36, 22, 1.2, flat(0xffffff, { roughness: 0.3 }), 0, 52, 3, 0.02, 91, true, g);
  // red frame + target square
  for (const [w, h, x, y] of [
    [36, 1.2, 0, 62.4],
    [36, 1.2, 0, 41.6],
    [1.2, 22, -17.4, 52],
    [1.2, 22, 17.4, 52],
    [13, 0.9, 0, 51],
    [13, 0.9, 0, 43],
    [0.9, 9, -6.1, 47],
    [0.9, 9, 6.1, 47],
  ])
    box(w, h, 0.5, flat(0xe2453c), x, y, 3.8, 0.01, 92, false, g);
  // steel arm
  box(2, 2, 10, flat(0x6b7282, { metalness: 0.5 }), 0, 52, -2, 0.02, 93, true, g);
  const hoop = new THREE.Mesh(
    new THREE.TorusGeometry(4.6, 0.4, 6, 20),
    flat(0xff6b1f, { metalness: 0.3 }),
  );
  hoop.rotation.x = Math.PI / 2;
  hoop.position.set(0, 42, 9.2);
  g.add(hoop);
  // net: lines from the hoop down to a smaller ring
  const netMat = flat(0xffffff);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const a2 = a + 0.4;
    const p0 = V(Math.cos(a) * 4.6, 42, 9.2 + Math.sin(a) * 4.6);
    const p1 = V(Math.cos(a2) * 2.8, 35, 9.2 + Math.sin(a2) * 2.8);
    const len = p0.distanceTo(p1);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, len, 4), netMat);
    m.position.copy(p0).add(p1).multiplyScalar(0.5);
    m.lookAt(p1);
    m.rotateX(Math.PI / 2);
    g.add(m);
  }
  // the big hall clock above it
  const c = new THREE.Group();
  c.position.set(0, 84, 2);
  g.add(c);
  const face = new THREE.Mesh(
    new THREE.CylinderGeometry(9, 9, 1, 32),
    flat(0xffffff, { roughness: 0.4 }),
  );
  face.rotation.x = Math.PI / 2;
  c.add(face);
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(9, 0.8, 6, 32),
    flat(0x2b2f3a, { metalness: 0.4 }),
  );
  c.add(rim);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const tick = new THREE.Mesh(
      new THREE.BoxGeometry(i % 3 ? 0.5 : 0.9, i % 3 ? 1.3 : 2.2, 0.4),
      flat(0x1d2230),
    );
    tick.position.set(Math.sin(a) * 7.5, Math.cos(a) * 7.5, 0.7);
    tick.rotation.z = -a;
    c.add(tick);
  }
  const hand = (len, w, col, z) => {
    const p = new THREE.Group();
    p.position.z = z;
    c.add(p);
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, len, 0.3), flat(col));
    m.position.y = len / 2 - 0.8;
    p.add(m);
    return p;
  };
  clockHands = {
    h: hand(5, 1.0, 0x1d2230, 0.8),
    m: hand(7.2, 0.7, 0x1d2230, 1.0),
    s: hand(7.6, 0.25, 0xe2453c, 1.2),
  };
  // green exit sign right of the board
  box(10, 4, 0.6, glow(0x2fd17a, 1.4), 70, 40, 3, 0.01, 94, false, g);
}
// 10:17 and ticking (an exam hour)
onFrame((t) => {
  const s = 23 + Math.floor(t);
  clockHands.s.rotation.z = -(s / 60) * Math.PI * 2;
  clockHands.m.rotation.z = -((17 + s / 60) / 60) * Math.PI * 2;
  clockHands.h.rotation.z = -((10 + 17 / 60) / 12) * Math.PI * 2;
});

// ---------------------------------------------------------------- wall bars, mats, vaulting box, ropes
{
  // wall bars along the right wall
  const wood = flat(0xc98f52, { roughness: 0.55 });
  for (let k = 0; k < 7; k++) {
    const z = -170 + k * 22;
    for (const dz of [-9, 9]) box(1.6, 50, 2, wood, 149, FLOOR + 25, z + dz, 0.03, 101 + k);
    for (let y = 2; y < 50; y += 3.6) {
      const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 18, 6), wood);
      rung.rotation.x = Math.PI / 2;
      rung.position.set(147.5, FLOOR + y, z);
      rung.castShadow = true;
      ground.add(rung);
    }
  }
  // blue gym mats stacked by the left wall
  for (let i = 0; i < 4; i++)
    box(
      40,
      3.2,
      20,
      flat(i % 2 ? 0x2f5fb0 : 0x3a6fc4, { roughness: 0.9 }),
      -120,
      FLOOR + 1.6 + i * 3.3,
      -130 + i * 0.6,
      0.05,
      111 + i,
    );
  // vaulting box (Kasten) with a leather top
  for (let i = 0; i < 5; i++)
    box(
      22 - i * 1.2,
      4.6,
      12 - i * 0.4,
      flat(0xd8a868, { roughness: 0.7 }),
      100,
      FLOOR + 2.3 + i * 4.8,
      -120,
      0.05,
      121 + i,
    );
  box(16, 2, 10, flat(0x7a4a2a, { roughness: 0.6 }), 100, FLOOR + 25, -120, 0.05, 127);
  // a basketball and two medicine balls on the floor
  const ball = (x, z, rad, col, seed) => {
    const b = F(new THREE.IcosahedronGeometry(rad, 1), flat(col, { roughness: 0.6 }), 0.08, seed);
    b.position.set(x, FLOOR + rad, z);
    b.castShadow = true;
    ground.add(b);
  };
  ball(60, -128, 4.8, 0xff6b1f, 131);
  ball(118, -60, 6, 0x5a3a2a, 132);
  ball(124, -48, 5, 0x2f6fb8, 133);
  // climbing ropes hanging from the ceiling, swaying slowly
  const ropes = [];
  const ropeMat = flat(0xd9c29a, { roughness: 0.9 });
  for (let i = 0; i < 5; i++) {
    const p = new THREE.Group();
    p.position.set(70 + i * 12, CEIL - 4, -95);
    ground.add(p);
    const len = CEIL - 4 - (FLOOR + 10);
    const m = F(new THREE.CylinderGeometry(0.9, 0.9, len, 6, 6), ropeMat, 0.06, 141 + i);
    m.position.y = -len / 2;
    m.castShadow = true;
    p.add(m);
    ropes.push({ p, ph: i * 1.3 });
  }
  onFrame((t) => {
    for (const rp of ropes) {
      rp.p.rotation.z = Math.sin(t * 0.7 + rp.ph) * 0.025;
      rp.p.rotation.x = Math.sin(t * 0.5 + rp.ph * 2) * 0.02;
    }
  });
}

// ---------------------------------------------------------------- life: dust in the sun
fireflies(70, { area: [-16, 16, 0.6, 12, -14, 10], color: 0xfff2cf, seed: 52, size: 0.05 });
fireflies(90, { area: [-140, 40, 5, 90, -200, 60], color: 0xfff2cf, seed: 53, size: 0.35 });

finishSet({ ground: 0xd98a48 });
