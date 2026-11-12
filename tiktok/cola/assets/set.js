// #79 Geschüttelte Cola — the world: an evening U-Bahn wagon seen at can
// scale (1 unit ≈ 5 cm). The can stands on the patterned bench seat next
// to your phone; behind it the window shows the dark tunnel with lamps
// streaking past, above it the line map. Cool ceiling light, warm tunnel
// flashes, yellow grab poles in the foreground, hanging straps swinging.
import { THREE, scene, flat, real, roundedBox, rng, onFrame } from "./world.js";
import { setSky, finishSet, add, F } from "./environments.js";

// ---------------------------------------------------------------- helpers
export const tex = (w, h, draw) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};
const mesh = (geo, mat, x, y, z, shadow = true) => add(new THREE.Mesh(geo, mat), x, y, z, shadow);

// ---------------------------------------------------------------- light
setSky({
  top: [0.02, 0.025, 0.05],
  mid: [0.04, 0.05, 0.08],
  hor: [0.09, 0.08, 0.1],
  below: [0.05, 0.05, 0.07],
  sun: [0.2, 0.2, 0.25],
  sunDir: [0.2, 0.5, -1],
  cloud: [0x222230, 0x111118],
  clouds: 0,
  noClouds: true,
  birds: false,
  stars: 0,
  hemi: [0xdfe8ff, 0x3a3440, 1.25],
  key: [0xf2f6ff, 2.4],
  keyPos: [4, 30, 12],
  rim: [0xffb46b, 1.1],
  fog: [45, 150],
});
// fluorescent wash from the ceiling + warm fill from the aisle
const fill = new THREE.PointLight(0xffe2c0, 30, 40, 1.6);
fill.position.set(-6, 14, 18);
scene.add(fill);
const cool = new THREE.PointLight(0xbcd4ff, 26, 34, 1.5);
cool.position.set(8, 30, -2);
scene.add(cool);
// a tunnel lamp passing outside: warm flash that sweeps over the window side
const passing = new THREE.PointLight(0xffa64d, 0, 30, 1.6);
passing.position.set(0, 18, -16);
scene.add(passing);

// ---------------------------------------------------------------- materials
const moquette = tex(512, 512, (c, w, h) => {
  c.fillStyle = "#1d2c5e";
  c.fillRect(0, 0, w, h);
  const r = rng(79);
  const cols = ["#f2b632", "#e2483d", "#3fb4c9", "#e9e4d8", "#7a5bd0"];
  for (let i = 0; i < 420; i++) {
    c.fillStyle = cols[i % cols.length];
    c.save();
    c.translate(r() * w, r() * h);
    c.rotate(r() * 6.3);
    const k = i % 3;
    if (k === 0) c.fillRect(-9, -2, 18, 4);
    else if (k === 1) {
      c.beginPath();
      c.arc(0, 0, 3 + r() * 3, 0, 6.3);
      c.fill();
    } else {
      c.beginPath();
      c.moveTo(-6, 5);
      c.lineTo(0, -6);
      c.lineTo(6, 5);
      c.fill();
    }
    c.restore();
  }
  // woven grain
  for (let y = 0; y < h; y += 3) {
    c.fillStyle = `rgba(0,0,0,${0.06 + (y % 6 ? 0 : 0.05)})`;
    c.fillRect(0, y, w, 1);
  }
});
moquette.wrapS = moquette.wrapT = THREE.RepeatWrapping;
const seatMat = (rx, ry) => {
  const t = moquette.clone();
  t.repeat.set(rx, ry);
  t.needsUpdate = true;
  return real.fabric(0xffffff, { map: t });
};
const shellMat = real.plastic(0xe8e4dc, { roughness: 0.5 });
const darkMat = real.plastic(0x2c3038, { roughness: 0.6 });
const poleMat = real.gloss(0xf2c21b, { roughness: 0.25 });
const steelMat = real.metal(0xb8bec6, { roughness: 0.3 });
const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0x0c1016,
  roughness: 0.05,
  metalness: 0.2,
  transparent: true,
  opacity: 0.35,
  clearcoat: 1,
});

// ---------------------------------------------------------------- floor
const floorTex = tex(512, 512, (c, w, h) => {
  c.fillStyle = "#5b6470";
  c.fillRect(0, 0, w, h);
  const r = rng(5);
  for (let i = 0; i < 5000; i++) {
    c.fillStyle = ["#7c8692", "#454c56", "#9aa3ad", "#3a404a"][i % 4];
    c.fillRect(r() * w, r() * h, 2 + r() * 3, 2 + r() * 3);
  }
});
floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
floorTex.repeat.set(12, 6);
{
  const f = mesh(
    new THREE.PlaneGeometry(240, 120),
    real.plastic(0xffffff, { map: floorTex, roughness: 0.55 }),
    0,
    -9,
    20,
    false,
  );
  f.rotation.x = -Math.PI / 2;
  // yellow safety line along the door zone
  const line = mesh(new THREE.PlaneGeometry(240, 1.2), flat(0xf2c21b), 0, -8.98, 6, false);
  line.rotation.x = -Math.PI / 2;
}

// ---------------------------------------------------------------- the bench (seats along the wall)
export const SEAT_Y = 0; // cushion top
const SEAT_W = 9.2;
for (let i = -6; i <= 6; i++) {
  const x = i * (SEAT_W + 0.5) + 0.0;
  // cushion (the can stands on the one at i = 0)
  mesh(roundedBox(SEAT_W, 2.4, 9.4, 0.9, 5), seatMat(3.4, 3.4), x, -1.2, -4.2);
  // backrest, tilted back
  const back = mesh(roundedBox(SEAT_W, 8.5, 2.4, 0.9, 5), seatMat(3.4, 3.1), x, 4.6, -9.6);
  back.rotation.x = -0.1;
  // hard shell behind the backrest
  const sh = mesh(roundedBox(SEAT_W + 0.2, 9, 0.8, 0.35, 3), shellMat, x, 4.4, -11.1);
  sh.rotation.x = -0.1;
}
// base under the seats with a heater grille
mesh(roundedBox(130, 7, 8.4, 0.5, 2), darkMat, 0, -5.9, -4.6);
for (let k = -40; k <= 40; k++)
  mesh(new THREE.BoxGeometry(0.3, 4, 0.2), steelMat, k * 1.5, -6, -0.3, false);
// armrests between some seats
for (const i of [-3, 0.5, 3.5]) {
  const x = i * (SEAT_W + 0.5) + (i === 0.5 ? 0 : 0);
  if (i === 0.5) continue;
  mesh(roundedBox(1.2, 1.2, 9, 0.5, 3), steelMat, x + (SEAT_W + 0.5) / 2, 4.2, -4.6);
}

// ---------------------------------------------------------------- wall + windows
const WALL_Z = -12.5;
mesh(roundedBox(140, 19, 1.2, 0.3, 2), shellMat, 0, 0.5, WALL_Z); // below the windows
mesh(roundedBox(140, 14, 1.2, 0.3, 2), shellMat, 0, 37, WALL_Z); // above
const WIN_W = 17;
for (let i = -4; i <= 4; i++) {
  const x = i * 21;
  // pillar between windows
  mesh(roundedBox(4, 22, 1.4, 0.4, 3), shellMat, x + 10.5, 20, WALL_Z);
  // black rubber frame + glass
  const fr = new THREE.Shape();
  const w2 = WIN_W / 2 + 0.6;
  fr.moveTo(-w2, 9.4);
  fr.lineTo(w2, 9.4);
  fr.lineTo(w2, 30.6);
  fr.lineTo(-w2, 30.6);
  fr.lineTo(-w2, 9.4);
  const hole = new THREE.Path();
  const h2 = WIN_W / 2;
  hole.moveTo(-h2, 10);
  hole.lineTo(-h2, 30);
  hole.lineTo(h2, 30);
  hole.lineTo(h2, 10);
  hole.lineTo(-h2, 10);
  fr.holes.push(hole);
  mesh(
    new THREE.ExtrudeGeometry(fr, { depth: 0.6, bevelEnabled: false }),
    darkMat,
    x,
    0,
    WALL_Z - 0.2,
  );
  mesh(new THREE.PlaneGeometry(WIN_W, 20), glassMat, x, 20, WALL_Z, false);
}
// ---------------------------------------------------------------- tunnel outside
{
  const tunTex = tex(1024, 512, (c, w, h) => {
    c.fillStyle = "#2a2a2e";
    c.fillRect(0, 0, w, h);
    const r = rng(9);
    for (let i = 0; i < 2600; i++) {
      c.fillStyle = `rgba(${90 + r() * 40},${90 + r() * 40},${95 + r() * 40},${0.15 + r() * 0.2})`;
      c.fillRect(r() * w, r() * h, 3 + r() * 10, 2 + r() * 6);
    }
    // cable bundles
    for (const y of [0.3, 0.34, 0.37, 0.72]) {
      c.fillStyle = "#121214";
      c.fillRect(0, y * h, w, 7);
    }
  });
  tunTex.wrapS = THREE.RepeatWrapping;
  tunTex.repeat.set(6, 1);
  const tw = mesh(
    new THREE.PlaneGeometry(260, 60),
    flat(0xffffff, { map: tunTex, roughness: 0.9 }),
    0,
    22,
    -26,
    false,
  );
  onFrame((t) => (tunTex.offset.x = (t * 1.6) % 1));
  tw.receiveShadow = false;
  // tunnel lamps streaking past
  const N = 9;
  const lampMat = new THREE.MeshBasicMaterial({ color: 0xffd9a0 });
  const lamps = [];
  for (let i = 0; i < N; i++) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(7, 0.9, 0.3), lampMat);
    l.position.set(0, 23, -25.5);
    scene.add(l);
    lamps.push(l);
  }
  const L = 270;
  onFrame((t) => {
    let near = 1e9;
    for (let i = 0; i < N; i++) {
      const x = L / 2 - ((((t * 140 + i * (L / N)) % L) + L) % L);
      lamps[i].position.x = x;
      near = Math.min(near, Math.abs(x));
    }
    passing.position.x = 0;
    passing.intensity = 26 * Math.exp(-near / 9);
  });
}

// ---------------------------------------------------------------- line map above the windows (hero piece)
{
  const map = tex(2048, 256, (c, w, h) => {
    c.fillStyle = "#f5f3ee";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#e5322d";
    c.fillRect(60, h * 0.42, w - 120, 22);
    const stops = ["Hbf", "Markt", "Uni", "Zoo", "Bahnhof Süd", "Ring", "Park", "Messe", "Stadion"];
    c.font = "700 34px Montserrat, sans-serif";
    c.textAlign = "center";
    stops.forEach((s, i) => {
      const x = 120 + (i * (w - 240)) / (stops.length - 1);
      c.fillStyle = i === 4 ? "#e5322d" : "#ffffff";
      c.strokeStyle = "#e5322d";
      c.lineWidth = 8;
      c.beginPath();
      c.arc(x, h * 0.42 + 11, i === 4 ? 26 : 18, 0, 6.3);
      c.fill();
      c.stroke();
      c.fillStyle = "#1b1f2a";
      c.fillText(s, x, h * 0.85);
    });
    c.fillStyle = "#e5322d";
    c.fillRect(20, 30, 90, 70);
    c.fillStyle = "#fff";
    c.font = "900 54px Montserrat, sans-serif";
    c.fillText("U4", 65, 86);
  });
  mesh(
    new THREE.PlaneGeometry(60, 7.5),
    flat(0xffffff, { map, roughness: 0.6 }),
    0,
    34.5,
    WALL_Z + 0.75,
    false,
  );
  // ad panels left and right
  const ad = (txt, col) =>
    tex(512, 256, (c, w, h) => {
      c.fillStyle = col;
      c.fillRect(0, 0, w, h);
      c.fillStyle = "#fff";
      c.font = "900 64px Montserrat, sans-serif";
      c.fillText(txt, 30, 150);
    });
  mesh(
    new THREE.PlaneGeometry(30, 7.5),
    flat(0xffffff, { map: ad("WISSEN?", "#2f6fd6") }),
    -50,
    34.5,
    WALL_Z + 0.75,
    false,
  );
  mesh(
    new THREE.PlaneGeometry(30, 7.5),
    flat(0xffffff, { map: ad("SALE %", "#e88a1a") }),
    50,
    34.5,
    WALL_Z + 0.75,
    false,
  );
}

// ---------------------------------------------------------------- ceiling, light strips, rails, straps
mesh(new THREE.BoxGeometry(260, 1, 80), shellMat, 0, 45, 20, false);
for (const z of [-4, 22]) {
  mesh(
    new THREE.BoxGeometry(220, 0.6, 3),
    new THREE.MeshBasicMaterial({ color: 0xf4f8ff }),
    0,
    44.3,
    z,
    false,
  );
}
mesh(new THREE.CylinderGeometry(0.45, 0.45, 220, 16), steelMat, 0, 36, 1, false).rotation.z =
  Math.PI / 2;
{
  const straps = [];
  for (let i = -8; i <= 8; i++) {
    const g = new THREE.Group();
    const band = new THREE.Mesh(roundedBox(0.9, 6, 0.25, 0.1, 2), darkMat);
    band.position.y = -3;
    g.add(band);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.28, 10, 24), real.plastic(0xf2c21b));
    ring.position.y = -7;
    g.add(ring);
    g.position.set(i * 7 + 2, 36, 1);
    g.traverse((o) => (o.castShadow = true));
    scene.add(g);
    straps.push(g);
  }
  onFrame((t) =>
    straps.forEach((g, i) => {
      g.rotation.z = Math.sin(t * 1.7 + i * 0.4) * 0.12;
      g.rotation.x = Math.sin(t * 1.1 + i) * 0.06;
    }),
  );
}
// grab poles (foreground + down the wagon)
for (const [x, z] of [
  [-7.5, 7],
  [16, 7],
  [-40, 7],
  [42, 7],
  [-12, 30],
  [24, 30],
]) {
  mesh(new THREE.CylinderGeometry(0.75, 0.75, 54, 24), poleMat, x, 18, z);
}
// door further down the wagon with its button
{
  const door = mesh(
    roundedBox(20, 40, 1, 0.6, 3),
    real.metal(0x9aa2ab, { roughness: 0.35 }),
    62,
    11,
    WALL_Z + 0.4,
  );
  door.material = steelMat;
  mesh(new THREE.PlaneGeometry(6, 22), glassMat, 57, 20, WALL_Z + 1.1, false);
  mesh(new THREE.PlaneGeometry(6, 22), glassMat, 67, 20, WALL_Z + 1.1, false);
  mesh(
    new THREE.CylinderGeometry(1, 1, 0.4, 24),
    flat(0x3dbb5c, { emissive: 0x2a9a40, emissiveIntensity: 0.8 }),
    50,
    12,
    WALL_Z + 1.1,
  ).rotation.x = Math.PI / 2;
}

// ---------------------------------------------------------------- props on the bench
// your phone, lying on the seat next to the can (scene.js wets it)
export const phone = new THREE.Group();
{
  const body = new THREE.Mesh(roundedBox(1.55, 0.16, 3.2, 0.2, 5), real.gloss(0x15171c));
  body.castShadow = body.receiveShadow = true;
  phone.add(body);
  const scr = tex(310, 640, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#6a4cff");
    g.addColorStop(1, "#ff6aa8");
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#fff";
    c.textAlign = "center";
    c.font = "300 110px Montserrat, sans-serif";
    c.fillText("19:42", w / 2, 190);
    c.font = "600 26px Montserrat, sans-serif";
    c.fillText("Donnerstag, 12. November", w / 2, 240);
    c.fillStyle = "rgba(255,255,255,0.85)";
    c.beginPath();
    c.roundRect(24, 330, w - 48, 90, 22);
    c.fill();
    c.fillStyle = "#222";
    c.textAlign = "left";
    c.font = "700 22px Montserrat, sans-serif";
    c.fillText("Lena", 44, 365);
    c.font = "500 20px Montserrat, sans-serif";
    c.fillText("Bin gleich da 😊", 44, 397);
  });
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(1.42, 3.04),
    new THREE.MeshStandardMaterial({
      map: scr,
      emissive: 0xffffff,
      emissiveMap: scr,
      emissiveIntensity: 0.9,
      roughness: 0.15,
    }),
  );
  screen.rotation.x = -Math.PI / 2;
  screen.position.y = 0.085;
  phone.add(screen);
  phone.position.set(2.4, 0.08, 0.6);
  phone.rotation.y = -0.35;
  scene.add(phone);
}
// backpack on the seat to the left
{
  const g = new THREE.Group();
  const bag = new THREE.Mesh(roundedBox(6, 8, 3.6, 1.6, 6), real.fabric(0x2f6b5a));
  bag.position.y = 4;
  g.add(bag);
  const pocket = new THREE.Mesh(roundedBox(4.2, 3.6, 1, 0.8, 4), real.fabric(0x285c4d));
  pocket.position.set(0, 2.8, 1.9);
  g.add(pocket);
  const zip = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.15, 0.2), steelMat);
  zip.position.set(0, 4.5, 2.4);
  g.add(zip);
  g.traverse((o) => (o.castShadow = o.receiveShadow = true));
  g.position.set(-12.5, 0, -5);
  g.rotation.set(-0.25, 0.3, 0);
  scene.add(g);
}
// a paper bakery bag and an earbud case on the seat to the right
{
  const bag = mesh(roundedBox(3.2, 4.4, 1.6, 0.3, 3), real.fabric(0xd7b98a), 9.5, 2.2, -3.5);
  bag.rotation.set(0, -0.4, 0.15);
  const ec = mesh(
    roundedBox(1.2, 0.6, 1.0, 0.28, 4),
    real.plastic(0xf6f6f2, { roughness: 0.25 }),
    -3.2,
    0.3,
    1.0,
  );
  ec.rotation.y = 0.5;
}
// a folded free newspaper on the far seat
{
  const np = tex(512, 512, (c, w, h) => {
    c.fillStyle = "#efece4";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#c41a1a";
    c.fillRect(0, 0, w, 70);
    c.fillStyle = "#fff";
    c.font = "900 52px Montserrat, sans-serif";
    c.fillText("HEUTE", 20, 52);
    c.fillStyle = "#555";
    for (let y = 120; y < h; y += 18) c.fillRect(20, y, w - 40 - ((y * 7) % 120), 7);
  });
  const p = mesh(new THREE.BoxGeometry(6, 0.3, 8), flat(0xffffff, { map: np }), -22, 0.15, -3);
  p.rotation.y = 0.2;
}
// far end of the wagon: the gangway (faceted, far away)
for (const s of [-1, 1]) {
  const g = F(new THREE.BoxGeometry(4, 44, 60), flat(0x3a3f48), 0.06, 7 + s);
  add(g, s * 118, 13, 10, false);
}

finishSet({ ground: 0x4a5058 });
