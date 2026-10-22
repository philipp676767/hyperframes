// Camera look on top of the plain three.js render — the "expensive toy
// diorama" finish, without touching the low-poly style itself:
//   tilt-shift  top and bottom of the frame melt into a soft blur, the band
//               around the subject stays sharp (the miniature-photo effect)
//   glow        bright and emissive things (sun, glowing wire, LEDs, hot
//               arrows) get a soft halo
//   AO          ambient occlusion: soft contact shadows where surfaces meet
//               (under parts, in corners, between pipes) — the depth cue of
//               a real miniature photo; computed at half res from a quick
//               normal + depth pass of the scene
//   vignette    slightly darker corners pull the eye to the centre
//   dither      tiny ordered noise so sky gradients don't band
// Blur and glow run at quarter resolution, AO at half. world.js renderFrame()
// calls post.render().
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.181.2/+esm";

// Tweak per video (scene.js: `LOOK.tilt = 0.6`) or per shot (`{ tilt: 0 }`).
export const LOOK = {
  // kept gentle: a strong miniature blur makes the picture look smeared on a phone
  tilt: 0.45, // 0 = everything sharp, 1 = full miniature blur at the frame edges
  focus: 0.5, // sharp band centre, 0 = bottom, 1 = top of the frame
  band: 0.28, // half height of the fully sharp band
  glow: 0.35, // glow strength
  glowFrom: 0.95, // brightness (linear) where glow starts
  vignette: 0.22,
  ao: 0.75, // ambient occlusion strength (0 = off)
  aoRadius: 0.45, // world units around a point that can shade it
};

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

// The scene is drawn straight into the (antialiased) canvas — cheap MSAA even
// in software GL — and copied into a texture; it holds sRGB, so decode first.
// Gamma 2 (square / square root) instead of the exact sRGB curve: much cheaper
// per pixel, and a pixel the effects don't touch comes back bit-identical.
const DECODE = `vec3 lin(vec3 c){ return c * c; }`;

const COPY = `uniform sampler2D tSrc; uniform vec2 texel; varying vec2 vUv;
${DECODE}
void main(){
  vec3 c = lin(texture2D(tSrc, vUv + texel * vec2(-1.0, -1.0)).rgb);
  c += lin(texture2D(tSrc, vUv + texel * vec2(1.0, -1.0)).rgb);
  c += lin(texture2D(tSrc, vUv + texel * vec2(-1.0, 1.0)).rgb);
  c += lin(texture2D(tSrc, vUv + texel * vec2(1.0, 1.0)).rgb);
  gl_FragColor = vec4(c * 0.25, 1.0);
}`;

const BRIGHT = `uniform sampler2D tSrc; uniform float from; varying vec2 vUv;
void main(){
  vec3 c = texture2D(tSrc, vUv).rgb;
  float l = max(c.r, max(c.g, c.b));
  float k = smoothstep(from, from + 0.35, l);
  gl_FragColor = vec4(c * k, 1.0);
}`;

const BLUR = `uniform sampler2D tSrc; uniform vec2 dir; varying vec2 vUv;
void main(){
  vec4 c = texture2D(tSrc, vUv) * 0.2270270;
  c += (texture2D(tSrc, vUv + dir * 1.3846154) + texture2D(tSrc, vUv - dir * 1.3846154)) * 0.3162162;
  c += (texture2D(tSrc, vUv + dir * 3.2307692) + texture2D(tSrc, vUv - dir * 3.2307692)) * 0.0702703;
  gl_FragColor = c;
}`;

// Normal + view depth of every opaque surface (face normals from screen
// derivatives = exactly the facets of the low-poly look).
const GEO_V = `varying vec3 vPos;
#include <common>
void main(){
  #include <begin_vertex>
  #include <project_vertex>
  vPos = mvPosition.xyz;
}`;
const GEO_F = `varying vec3 vPos;
void main(){
  vec3 n = normalize(cross(dFdx(vPos), dFdy(vPos)));
  if (dot(n, vPos) > 0.0) n = -n;
  gl_FragColor = vec4(n, -vPos.z);
}`;

// Scalable ambient obscurance from that pass: 14 spiral samples per pixel,
// rotated by a fixed per-pixel noise (deterministic), cosine-weighted.
const AO = `uniform sampler2D tGeo; uniform vec2 tanHalf; uniform vec2 res;
uniform float radius; varying vec2 vUv;
vec3 viewPos(vec2 uv, float z){ return vec3((uv * 2.0 - 1.0) * tanHalf * z, -z); }
void main(){
  vec4 g = texture2D(tGeo, vUv);
  if (g.a <= 0.0) { gl_FragColor = vec4(1.0); return; }
  vec3 P = viewPos(vUv, g.a);
  vec3 N = g.xyz;
  float rUv = min(radius / (g.a * tanHalf.y * 2.0), 0.1);
  float noise = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  float occ = 0.0;
  for (int i = 0; i < 14; i++) {
    float fi = float(i);
    float a = fi * 2.399963 + noise * 6.2831853;
    vec2 off = vec2(cos(a) * res.y / res.x, sin(a)) * ((fi + 0.5) / 14.0) * rUv;
    vec4 sg = texture2D(tGeo, vUv + off);
    if (sg.a <= 0.0) continue;
    vec3 v = viewPos(vUv + off, sg.a) - P;
    float dist = length(v);
    float cosT = dot(v, N) / max(dist, 1e-4);
    occ += max(0.0, cosT - 0.12) * (1.0 - smoothstep(radius * 0.5, radius * 1.6, dist));
  }
  float ao = clamp(1.0 - occ / 14.0 * 2.2, 0.0, 1.0);
  gl_FragColor = vec4(vec3(ao), 1.0);
}`;

const FINAL = /* glsl */ `uniform sampler2D tScene; uniform sampler2D tSoft; uniform sampler2D tGlow;
uniform sampler2D tAO; uniform float aoAmt;
uniform float tilt; uniform float focus; uniform float band; uniform float glow;
uniform float vignette; varying vec2 vUv;
${DECODE}
vec3 toSRGB(vec3 c){ return sqrt(clamp(c, 0.0, 1.0)); }
void main(){
  vec3 c = lin(texture2D(tScene, vUv).rgb);
  vec3 soft = texture2D(tSoft, vUv).rgb;
  float d = abs(vUv.y - focus);
  float k = smoothstep(band, band + 0.28, d) * tilt;
  c = mix(c, soft, k * 0.8);
  c *= mix(1.0, texture2D(tAO, vUv).r, aoAmt);
  c += texture2D(tGlow, vUv).rgb * glow;
  vec2 q = vUv - 0.5;
  c *= 1.0 - vignette * smoothstep(0.25, 0.75, length(q * vec2(1.25, 1.0)));
  vec3 o = toSRGB(c);
  // 4x4 ordered dither, ±0.5 of an 8-bit step
  vec2 p = mod(floor(gl_FragCoord.xy), 4.0);
  float b = mod(p.x * 4.0 + p.y * 11.0, 16.0) / 16.0 - 0.5;
  gl_FragColor = vec4(o + b / 255.0, 1.0);
}`;

export function createPost(renderer, width, height) {
  const opts = { type: THREE.HalfFloatType, depthBuffer: false };
  const main = new THREE.FramebufferTexture(width, height);
  const qw = Math.round(width / 4);
  const qh = Math.round(height / 4);
  const q = [0, 1, 2].map(() => new THREE.WebGLRenderTarget(qw, qh, opts));
  const g = [0, 1].map(() => new THREE.WebGLRenderTarget(qw, qh, opts));
  const hw = Math.round(width / 2);
  const hh = Math.round(height / 2);
  const geo = new THREE.WebGLRenderTarget(hw, hh, { type: THREE.FloatType });
  const ao = [0, 1].map(() => new THREE.WebGLRenderTarget(hw, hh, opts));
  const geoMat = new THREE.ShaderMaterial({
    vertexShader: GEO_V,
    fragmentShader: GEO_F,
    side: THREE.DoubleSide,
  });

  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
  const fsScene = new THREE.Scene();
  fsScene.add(quad);
  const mat = (frag, uniforms) =>
    new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: frag,
      uniforms,
      depthTest: false,
      depthWrite: false,
    });
  const copy = mat(COPY, {
    tSrc: { value: null },
    texel: { value: new THREE.Vector2(1 / width, 1 / height) },
  });
  const bright = mat(BRIGHT, { tSrc: { value: null }, from: { value: LOOK.glowFrom } });
  const blur = mat(BLUR, { tSrc: { value: null }, dir: { value: new THREE.Vector2() } });
  const aoMat = mat(AO, {
    tGeo: { value: geo.texture },
    tanHalf: { value: new THREE.Vector2() },
    res: { value: new THREE.Vector2(hw, hh) },
    radius: { value: LOOK.aoRadius },
  });
  const final = mat(FINAL, {
    tScene: { value: main },
    tSoft: { value: q[2].texture },
    tGlow: { value: g[0].texture },
    tAO: { value: ao[0].texture },
    aoAmt: { value: 0 },
    tilt: { value: 1 },
    focus: { value: 0.5 },
    band: { value: 0.17 },
    glow: { value: 0.45 },
    vignette: { value: 0.22 },
  });

  const pass = (m, target) => {
    quad.material = m;
    renderer.setRenderTarget(target);
    renderer.render(fsScene, cam);
  };
  const blurPass = (src, tmp, dst, step, w = qw, h = qh) => {
    blur.uniforms.tSrc.value = src.texture;
    blur.uniforms.dir.value.set(step / w, 0);
    pass(blur, tmp);
    blur.uniforms.tSrc.value = tmp.texture;
    blur.uniforms.dir.value.set(0, step / h);
    pass(blur, dst);
  };

  // Normal/depth pass over the opaque scene only: glass that is see-through
  // right now, sky, fog cards, arrows, puffs, lines and points stay out.
  const hidden = [];
  const clear = new THREE.Color(0, 0, 0);
  const prevClear = new THREE.Color();
  function geoPass(scene, camera) {
    scene.traverse((o) => {
      if (!o.visible) return;
      let hide = o.isLine || o.isPoints || o.isSprite;
      if (o.isMesh) {
        const m = Array.isArray(o.material) ? o.material[0] : o.material;
        hide = o.userData.noAO || m.depthWrite === false || (m.transparent && m.opacity < 0.9);
      }
      if (hide) {
        o.visible = false;
        hidden.push(o);
      }
    });
    const fog = scene.fog;
    const bg = scene.background;
    scene.fog = null;
    scene.background = null;
    scene.overrideMaterial = geoMat;
    const prevAlpha = renderer.getClearAlpha();
    renderer.getClearColor(prevClear);
    renderer.setClearColor(clear, 0);
    renderer.setRenderTarget(geo);
    renderer.clear();
    renderer.render(scene, camera);
    renderer.setClearColor(prevClear, prevAlpha);
    scene.overrideMaterial = null;
    scene.fog = fog;
    scene.background = bg;
    for (const o of hidden) o.visible = true;
    hidden.length = 0;
  }

  return {
    // scene → look → canvas; `overlay` (LED panel …) is drawn sharp on top
    render(scene, camera, overlay, shotTilt = 1) {
      if (LOOK.ao > 0) {
        geoPass(scene, camera);
        const th = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
        aoMat.uniforms.tanHalf.value.set(th * camera.aspect, th);
        aoMat.uniforms.radius.value = LOOK.aoRadius;
        pass(aoMat, ao[0]);
        blurPass(ao[0], ao[1], ao[0], 1.0, hw, hh);
      }
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);
      renderer.copyFramebufferToTexture(main);
      // quarter-res copy, blurred twice: the out-of-focus image
      copy.uniforms.tSrc.value = main;
      pass(copy, q[0]);
      blurPass(q[0], q[1], q[2], 1.0);
      blurPass(q[2], q[1], q[2], 2.0);
      // glow: bright parts only, blurred wide
      bright.uniforms.tSrc.value = q[0].texture;
      bright.uniforms.from.value = LOOK.glowFrom;
      pass(bright, g[0]);
      blurPass(g[0], g[1], g[0], 1.5);
      blurPass(g[0], g[1], g[0], 3.0);

      const u = final.uniforms;
      u.tilt.value = LOOK.tilt * shotTilt;
      u.focus.value = LOOK.focus;
      u.band.value = LOOK.band;
      u.glow.value = LOOK.glow;
      u.vignette.value = LOOK.vignette;
      u.aoAmt.value = LOOK.ao;
      pass(final, null);

      if (overlay.children.some((c) => c.visible && !c.isLight)) {
        renderer.autoClear = false;
        renderer.clearDepth();
        renderer.render(overlay, camera);
        renderer.autoClear = true;
      }
    },
  };
}
