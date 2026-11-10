// A yellow Labrador, smooth and realistic, standing at the origin facing +z.
// The hero is the nose (rhinarium): a wet, cobbled leather texture with a
// unique Voronoi pattern (canvas), two comma nostrils with side slits.
// The head shell is x-ray-able; inside sit the turbinates (scroll bones).
//   const dog = makeDog();
//   dog.pose(t, { pos, head, turn, tilt, walk, wag, sniff, lick })
import { THREE, V, real, xrayEdges } from "./world.js";

// ---------------------------------------------------------------- nose texture
// Voronoi cobbles: domed cells with dark grooves, wrapping in u. Returns
// { color, bump, glow } canvases. glow = groove mask (for the "fingerprint").
export function noseCanvases(seed = 1, W = 1024, H = 512, cells = 72, philtrum = true) {
  let s = seed * 9301 + 49297;
  const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const gx = cells;
  const gy = Math.round((cells * H) / W);
  const cw = W / gx;
  const ch = H / gy;
  const px = new Float32Array(gx * gy);
  const py = new Float32Array(gx * gy);
  const tone = new Float32Array(gx * gy);
  for (let j = 0; j < gy; j++)
    for (let i = 0; i < gx; i++) {
      const k = j * gx + i;
      px[k] = (i + 0.15 + r() * 0.7) * cw;
      py[k] = (j + 0.15 + r() * 0.7) * ch;
      tone[k] = r();
    }
  const mk = () => {
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    return c;
  };
  const cc = mk();
  const cb = mk();
  const cg = mk();
  const dc = cc.getContext("2d").createImageData(W, H);
  const db = cb.getContext("2d").createImageData(W, H);
  const dg = cg.getContext("2d").createImageData(W, H);
  for (let y = 0; y < H; y++) {
    const cj = Math.floor(y / ch);
    for (let x = 0; x < W; x++) {
      const ci = Math.floor(x / cw);
      let d1 = 1e9;
      let d2 = 1e9;
      let best = 0;
      for (let dj = -1; dj <= 1; dj++) {
        const j = cj + dj;
        if (j < 0 || j >= gy) continue;
        for (let di = -1; di <= 1; di++) {
          let i = ci + di;
          let off = 0;
          if (i < 0) {
            i += gx;
            off = -W;
          } else if (i >= gx) {
            i -= gx;
            off = W;
          }
          const k = j * gx + i;
          const dx = px[k] + off - x;
          const dy = py[k] - y;
          const d = dx * dx + dy * dy;
          if (d < d1) {
            d2 = d1;
            d1 = d;
            best = k;
          } else if (d < d2) d2 = d;
        }
      }
      const e = Math.sqrt(d2) - Math.sqrt(d1); // distance to the cell edge (px)
      const groove = Math.max(0, 1 - e / 2.6);
      const dome = Math.min(1, e / (cw * 0.45));
      let g = groove;
      // philtrum: the vertical groove down the middle of the front (u = 0.25)
      if (philtrum) {
        const u = x / W;
        const v = y / H;
        if (v > 0.5 && v < 0.82) g = Math.max(g, Math.max(0, 1 - (Math.abs(u - 0.25) * W) / 4));
      }
      const o = (y * W + x) * 4;
      const base = 34 + tone[best] * 16 + dome * 22;
      const c = base * (1 - 0.82 * g);
      dc.data[o] = c * 1.05;
      dc.data[o + 1] = c * 0.95;
      dc.data[o + 2] = c * 0.92;
      dc.data[o + 3] = 255;
      const b = 255 * (0.35 + 0.65 * dome) * (1 - g);
      db.data[o] = db.data[o + 1] = db.data[o + 2] = b;
      db.data[o + 3] = 255;
      const gl = 255 * groove;
      dg.data[o] = dg.data[o + 1] = dg.data[o + 2] = gl;
      dg.data[o + 3] = 255;
    }
  }
  cc.getContext("2d").putImageData(dc, 0, 0);
  cb.getContext("2d").putImageData(db, 0, 0);
  cg.getContext("2d").putImageData(dg, 0, 0);
  return { color: cc, bump: cb, glow: cg };
}

// An ink nose print on a white card (for "Jedes Muster gibt's nur einmal").
export function printTexture(seed) {
  const { glow } = noseCanvases(seed, 512, 512, 30, false);
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 640;
  const x = c.getContext("2d");
  x.fillStyle = "#f7f3ea";
  x.fillRect(0, 0, 512, 640);
  // the stamp: an ink oval with the pattern left white in the grooves
  x.save();
  x.beginPath();
  x.ellipse(256, 300, 200, 150 + (seed % 3) * 12, 0, 0, Math.PI * 2);
  x.clip();
  x.fillStyle = "#1d1a24";
  x.fillRect(0, 0, 512, 640);
  x.globalCompositeOperation = "lighter";
  x.drawImage(glow, 0, 60);
  x.restore();
  // the two nostrils = blank commas
  x.fillStyle = "#f7f3ea";
  for (const sx of [-1, 1]) {
    x.beginPath();
    x.ellipse(256 + sx * 82, 312, 44, 32, sx * 0.5, 0, Math.PI * 2);
    x.fill();
  }
  x.fillStyle = "#3a3440";
  x.font = "700 40px Montserrat, sans-serif";
  x.textAlign = "center";
  x.fillText(["BELLO", "LUNA", "MAX"][seed % 3], 256, 560);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// ---------------------------------------------------------------- dog
export function makeDog({ fur = 0xd8a35e, furDark = 0xb67f3e, seed = 7 } = {}) {
  const group = new THREE.Group();
  const furMat = real.fabric(fur, { roughness: 0.95 });
  const darkMat = real.fabric(furDark, { roughness: 0.95 });
  // head shell: x-ray-able (transparent fixed from the start)
  const headMat = real.fabric(fur, { roughness: 0.95, transparent: true });
  headMat.userData.base = new THREE.Color(fur);
  const earMat = real.fabric(furDark, { roughness: 0.95, transparent: true });
  earMat.userData.base = new THREE.Color(furDark);
  const shellMats = [headMat, earMat];
  const add = (geo, mat, x, y, z, parent, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };
  const sph = (r) => new THREE.SphereGeometry(r, 48, 32);
  const cap = (r, l) => new THREE.CapsuleGeometry(r, l, 12, 32);

  // ---- body
  const body = new THREE.Group();
  group.add(body);
  const torso = add(cap(0.55, 1.25), furMat, 0, 1.18, -0.12, body, 0.92, 1, 1);
  torso.rotation.x = Math.PI / 2;
  add(sph(0.6), furMat, 0, 1.22, 0.58, body, 0.88, 1.0, 0.9); // chest
  add(sph(0.56), furMat, 0, 1.2, -0.86, body, 0.95, 0.95, 0.95); // rump
  // legs (pivot at the shoulder / hip so they can swing)
  const legs = [];
  for (const [x, z, front] of [
    [0.3, 0.62, 1],
    [-0.3, 0.62, 1],
    [0.32, -0.92, 0],
    [-0.32, -0.92, 0],
  ]) {
    const pivot = new THREE.Group();
    pivot.position.set(x, 1.0, z);
    body.add(pivot);
    if (!front) add(sph(0.3), furMat, 0, 0.12, 0, pivot, 0.9, 1.2, 1.1); // thigh
    add(cap(0.14, 0.62), furMat, 0, -0.42, 0, pivot);
    add(sph(0.16), furMat, 0, -0.9, 0.07, pivot, 1, 0.6, 1.3); // paw
    legs.push({ pivot, front, x });
  }
  // tail
  const tailPivot = new THREE.Group();
  tailPivot.position.set(0, 1.42, -1.35);
  body.add(tailPivot);
  const tailCurve = new THREE.CatmullRomCurve3([
    V(0, 0, 0),
    V(0, 0.1, -0.35),
    V(0, 0.05, -0.8),
    V(0, -0.15, -1.1),
  ]);
  add(new THREE.TubeGeometry(tailCurve, 40, 0.1, 16), furMat, 0, 0, 0, tailPivot);
  add(sph(0.1), furMat, 0, -0.15, -1.1, tailPivot);
  // collar (red) + tag

  // ---- head: pivot at the shoulders (rotation.x > 0 = nose down)
  const head = new THREE.Group();
  head.position.set(0, 1.45, 0.75);
  group.add(head);
  const collarMat = real.plastic(0xd12a2a, { roughness: 0.5 });
  const neck = add(cap(0.31, 0.45), furMat, 0, 0.24, 0.16, head);
  neck.rotation.x = -0.9;
  const collar = add(new THREE.TorusGeometry(0.325, 0.05, 16, 48), collarMat, 0, -0.12, 0, neck);
  collar.rotation.x = Math.PI / 2;
  const tag = add(
    new THREE.CylinderGeometry(0.07, 0.07, 0.02, 32),
    real.metal(0xe8c45a, { roughness: 0.25 }),
    0,
    -0.2,
    0.37,
    neck,
  );
  tag.rotation.x = Math.PI / 2;
  const skullGeo = sph(0.42);
  add(skullGeo, headMat, 0, 0.52, 0.42, head, 0.92, 0.8, 1.08);
  add(sph(0.3), headMat, 0, 0.44, 0.72, head, 1.05, 0.82, 1.0); // stop / cheeks
  const muzzleGeo = cap(0.235, 0.4);
  const muzzle = add(muzzleGeo, headMat, 0, 0.38, 0.97, head, 1, 0.84, 1);
  muzzle.rotation.x = Math.PI / 2;
  add(cap(0.15, 0.32), headMat, 0, 0.23, 0.9, head, 1, 0.7, 1).rotation.x = Math.PI / 2; // lower jaw
  const edges = [];
  for (const [g, pos, sc, rx] of [
    [skullGeo, [0, 0.52, 0.42], [0.92, 0.8, 1.08], 0],
    [muzzleGeo, [0, 0.38, 0.97], [1, 0.84, 1], Math.PI / 2],
  ]) {
    const e = xrayEdges(g);
    e.position.set(...pos);
    e.scale.set(...sc);
    e.rotation.x = rx;
    head.add(e);
    edges.push(e);
  }
  // ears: floppy, darker
  const ears = [];
  for (const sx of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(sx * 0.36, 0.68, 0.36);
    head.add(pivot);
    const ear = add(sph(0.26), earMat, sx * 0.07, -0.24, 0, pivot, 0.3, 1, 0.72);
    ear.rotation.z = sx * 0.12;
    ears.push(pivot);
  }
  // eyes: glossy dark brown with a catch light
  const eyeMat = real.gloss(0x2a160c, { roughness: 0.05 });
  for (const sx of [-1, 1]) {
    add(sph(0.072), eyeMat, sx * 0.2, 0.6, 0.79, head);
    const cl = add(
      new THREE.SphereGeometry(0.016, 12, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
      sx * 0.2 + 0.02,
      0.63,
      0.855,
      head,
    );
    cl.castShadow = false;
    add(sph(0.085), darkMat, sx * 0.2, 0.6, 0.77, head, 1.1, 1.0, 0.6); // dark eye rim
  }

  // ---- the nose
  const nose = new THREE.Group();
  nose.position.set(0, 0.43, 1.33);
  head.add(nose);
  const cv = noseCanvases(seed);
  const tx = (c, srgb) => {
    const t = new THREE.CanvasTexture(c);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  };
  const noseMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    map: tx(cv.color, true),
    bumpMap: tx(cv.bump),
    bumpScale: 2.2,
    roughness: 0.42,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    emissive: 0xffd23f,
    emissiveMap: tx(cv.glow),
    emissiveIntensity: 0,
  });
  const noseMesh = add(
    new THREE.SphereGeometry(0.17, 96, 64),
    noseMat,
    0,
    0,
    0,
    nose,
    1.18,
    0.82,
    0.62,
  );
  noseMesh.rotation.x = 0.12;
  // nostrils (comma shapes) + the side slits
  const holeMat = new THREE.MeshStandardMaterial({ color: 0x050303, roughness: 0.9 });
  const nostrils = [];
  const nostrilGlow = [];
  for (const sx of [-1, 1]) {
    const n = add(
      new THREE.SphereGeometry(0.046, 32, 20),
      holeMat,
      sx * 0.075,
      -0.012,
      0.088,
      nose,
      1.05,
      0.72,
      0.4,
    );
    n.rotation.z = sx * -0.5;
    const slit = add(
      new THREE.TorusGeometry(0.06, 0.009, 10, 32, 1.7),
      holeMat,
      sx * 0.088,
      -0.012,
      0.07,
      nose,
    );
    slit.rotation.set(0, sx * 0.55, sx > 0 ? -1.35 : Math.PI + 1.35);
    nostrils.push(n);
    // glow disc in the nostril (stereo colours)
    const gm = new THREE.MeshBasicMaterial({
      color: sx < 0 ? 0x4fc3ff : 0xffa83a,
      transparent: true,
      opacity: 0,
    });
    const gd = add(
      new THREE.SphereGeometry(0.05, 24, 16),
      gm,
      sx * 0.075,
      -0.012,
      0.09,
      nose,
      1.05,
      0.72,
      0.42,
    );
    gd.castShadow = false;
    nostrilGlow.push(gm);
  }
  // world-space points of the nostrils / slits (call nostrilWorld after pose)
  const tmp = new THREE.Vector3();
  const nostrilWorld = (sx, out = new THREE.Vector3()) =>
    nose.localToWorld(out.set(sx * 0.075, -0.012, 0.11));
  const slitWorld = (sx, out = new THREE.Vector3()) =>
    nose.localToWorld(out.set(sx * 0.15, -0.035, 0.03));
  const noseWorld = (out = new THREE.Vector3()) => nose.localToWorld(out.set(0, 0, 0.1));

  // ---- tongue (licks up over the nose)
  const tonguePivot = new THREE.Group();
  tonguePivot.position.set(0, 0.2, 1.1);
  head.add(tonguePivot);
  const tongueMat = real.skin(0xe0607a, {
    roughness: 0.35,
    clearcoat: 0.6,
    clearcoatRoughness: 0.1,
  });
  const tongue = add(cap(0.075, 0.22), tongueMat, 0, 0, 0.14, tonguePivot, 1.25, 0.45, 1);
  tongue.rotation.x = Math.PI / 2;
  tonguePivot.visible = false;

  // ---- inside (x-ray): turbinates = rolled scroll bones in the muzzle
  const inside = new THREE.Group();
  head.add(inside);
  const turbMat = new THREE.MeshStandardMaterial({
    color: 0xff7f9e,
    emissive: 0xff4f7a,
    emissiveIntensity: 0.35,
    roughness: 0.5,
  });
  const turbs = [];
  for (let k = 0; k < 7; k++) {
    for (const sx of [-1, 1]) {
      const pts = [];
      for (let a = 0; a <= 1; a += 1 / 60) {
        const th = a * Math.PI * 4.2;
        const rr = 0.085 * (1 - a * 0.75);
        pts.push(
          V(
            sx * 0.08 + Math.cos(th) * rr * sx,
            0.4 + Math.sin(th) * rr,
            0.62 + k * 0.095 + a * 0.05,
          ),
        );
      }
      const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 90, 0.009, 8);
      const m = add(geo, turbMat, 0, 0, 0, inside);
      m.castShadow = false;
      turbs.push(m);
    }
  }
  // the airway: from the nostrils back to the scrolls (top) and down to the throat
  const airMat = new THREE.MeshBasicMaterial({ color: 0x8fd8ff, transparent: true, opacity: 0.55 });
  const airTop = new THREE.CatmullRomCurve3([
    V(0, 0.41, 1.36),
    V(0, 0.46, 1.15),
    V(0, 0.47, 0.9),
    V(0, 0.44, 0.62),
  ]);
  const airLow = new THREE.CatmullRomCurve3([
    V(0, 0.41, 1.36),
    V(0, 0.3, 1.1),
    V(0, 0.22, 0.7),
    V(0, 0.05, 0.25),
  ]);
  for (const c of [airTop, airLow]) {
    const m = add(new THREE.TubeGeometry(c, 40, 0.03, 10), airMat, 0, 0, 0, inside);
    m.castShadow = false;
  }
  // olfactory bulb in the brain (lights up when the smell arrives)
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xffd23f,
    emissive: 0xffb02e,
    emissiveIntensity: 0,
  });
  add(sph(0.09), bulbMat, 0, 0.5, 0.48, inside, 1.2, 0.8, 1.4);
  inside.visible = false;

  // ---------------------------------------------------------------- pose
  function pose(t, o = {}) {
    const {
      pos = [0, 0, 0],
      rotY = 0,
      head: hx = 0.1,
      turn = 0,
      tilt = 0,
      walk = 0,
      wag = 0.5,
      sniff = 0,
      lick = -1,
      ear = 0,
    } = o;
    group.position.set(...pos);
    group.rotation.y = rotY;
    // sniffing: quick 5 Hz bobs of the head + nostrils flaring
    const sn = sniff * Math.max(0, Math.sin(t * Math.PI * 2 * 5));
    head.rotation.set(hx + sn * 0.03, turn, tilt);
    for (const n of nostrils) n.scale.set(1.05 + sn * 0.25, 0.72 + sn * 0.18, 0.4);
    // breathing
    body.scale.set(1, 1 + Math.sin(t * 2.4) * 0.008, 1);
    // legs
    for (const l of legs) {
      const ph = (l.front ? 0 : Math.PI) + (l.x > 0 ? 0 : Math.PI);
      l.pivot.rotation.x = walk * Math.sin(t * 7 + ph) * 0.45;
    }
    body.position.y = walk * Math.abs(Math.sin(t * 7)) * 0.03;
    tailPivot.rotation.set(0.6 + wag * 0.2, Math.sin(t * (6 + wag * 8)) * (0.2 + wag * 0.6), 0);
    ears.forEach(
      (e, i) => (e.rotation.z = (i ? 1 : -1) * (ear * 0.25 + Math.sin(t * 7) * walk * 0.06)),
    );
    // lick: 0..1 = tongue out, sweeps up across the nose, back in
    tonguePivot.visible = lick >= 0 && lick <= 1;
    if (tonguePivot.visible) {
      const out = Math.sin(lick * Math.PI);
      tonguePivot.position.z = 1.1 + out * 0.18;
      tonguePivot.rotation.x = -0.2 - Math.sin(Math.min(1, lick * 1.4) * Math.PI) * 1.5;
      tonguePivot.scale.setScalar(0.5 + out * 1.3);
    }
    group.updateMatrixWorld(true);
  }

  return {
    group,
    head,
    nose,
    noseMat,
    nostrilGlow,
    shellMats,
    edges,
    inside,
    turbMat,
    bulbMat,
    airTop,
    airLow,
    pose,
    nostrilWorld,
    slitWorld,
    noseWorld,
    tmp,
  };
}
