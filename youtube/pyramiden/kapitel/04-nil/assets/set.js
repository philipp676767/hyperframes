// Chapter 4: the flood (main world, construction), the white cliffs of Tura
// on the east bank, Merer's boat between Tura and the harbour, the logbook,
// the buried Nile branch seen from a satellite.
import { THREE, scene, rng, real, roundedBox, V, facet, facetMat, flat, noise2 } from "./world.js";
import {
  buildGiza,
  buildPapyrus,
  makeBoat,
  makePerson,
  randomPerson,
  FLOOD_Y,
  edgeX,
  shadowAll,
  noAO,
} from "./welt.js";
export const G = buildGiza({ time: "tag", state: "bau", level: 0.62 });
export const PAP = buildPapyrus(V(0, -120, 0));

// Tura: a white limestone cliff across the flood, a quay with blocks
export const TURA = V(96, FLOOD_Y, -8);
{
  const geo = facet(new THREE.BoxGeometry(14, 6, 40, 10, 6, 24), 0.05, 4);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      y = p.getY(i),
      z = p.getZ(i);
    if (x < 6.9) p.setX(i, x + (noise2(y * 0.6, z * 0.3, 3) - 0.5) * 1.6 - (y + 3) * 0.12);
  }
  geo.computeVertexNormals();
  const cliff = new THREE.Mesh(geo, facetMat(flat(0xefe6d2, { roughness: 0.95 })));
  cliff.position.set(TURA.x + 7, FLOOD_Y + 2.4, TURA.z);
  cliff.castShadow = cliff.receiveShadow = true;
  scene.add(cliff);
  const quay = new THREE.Mesh(
    roundedBox(2.2, 0.5, 8, 0.05),
    real.plastic(0xe6dcc6, { roughness: 0.9, clearcoat: 0 }),
  );
  quay.position.set(TURA.x + 0.6, FLOOD_Y + 0.15, TURA.z);
  scene.add(quay);
  const stone = real.plastic(0xf2ecdf, { roughness: 0.8, clearcoat: 0 });
  const r = rng(8);
  for (let i = 0; i < 18; i++) {
    const b = new THREE.Mesh(roundedBox(0.13, 0.1, 0.1, 0.01), stone);
    b.position.set(
      TURA.x + 0.2 + r() * 1.3,
      FLOOD_Y + 0.45 + (i > 12 ? 0.1 : 0),
      TURA.z - 3 + r() * 6,
    );
    b.rotation.y = r() * 0.3;
    scene.add(b);
  }
  for (let i = 0; i < 14; i++) {
    const p2 = randomPerson(r);
    p2.position.set(TURA.x + 0.1 + r() * 1.4, FLOOD_Y + 0.4, TURA.z - 3.5 + r() * 7);
    p2.rotation.y = r() * 6.28;
    p2.userData.ph = r() * 3;
    scene.add(p2);
    G.people.push(p2);
    p2.userData.home = p2.position.clone();
    p2.userData.dir = 1;
  }
  shadowAll(quay);
}
// Merer's boat (white blocks, Merer at the bow)
export const BOAT = makeBoat({ cargo: "kalk", seed: 77, crew: 7, scale: 0.55 });
export const MERER = makePerson({ shirt: true, coat: 0xf6f0e2, skin: 0x8f6040, scale: 1 / 0.55 });
MERER.position.set(-1.15, 0.21, 0);
BOAT.add(MERER);
scene.add(BOAT);
// a fleet shuttling between Tura and the harbour
export const FLEET = [];
for (let i = 0; i < 5; i++) {
  const b = makeBoat({ cargo: i % 2 ? "kalk" : "kalk", seed: 120 + i, crew: 5, scale: 0.5 });
  b.userData.off = i / 5;
  scene.add(b);
  FLEET.push(b);
}
// the buried Nile branch: a glowing line along the desert edge (satellite view)
export const BRANCH = (() => {
  const pts = [];
  for (let z = -170; z <= 170; z += 6)
    pts.push(V(edgeX(z) + 7 + Math.sin(z * 0.03) * 5, FLOOD_Y + 0.08, z));
  const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 140, 0.9, 6);
  const m = noAO(
    new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({ color: 0x4fd8ff, toneMapped: false, transparent: true }),
    ),
  );
  m.scale.y = 0.2;
  scene.add(m);
  m.userData.segs = 140;
  return m;
})();
