// Camera look on top of the plain three.js render — the "expensive toy
// diorama" finish, without touching the low-poly style itself:
//   tilt-shift  top and bottom of the frame melt into a soft blur, the band
//               around the subject stays sharp (the miniature-photo effect)
//   glow        bright and emissive things (sun, glowing wire, LEDs, hot
//               arrows) get a soft halo
//   vignette    slightly darker corners pull the eye to the centre
//   dither      tiny ordered noise so sky gradients don't band
// All passes after the scene run at quarter resolution, so the cost is a
// few ms per frame. world.js renderFrame() calls post.render().
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.181.2/+esm";

// Tweak per video (scene.js: `LOOK.tilt = 0.6`) or per shot (`{ tilt: 0 }`).
export const LOOK = {
  tilt: 1, // 0 = everything sharp, 1 = full miniature blur at the frame edges
  focus: 0.5, // sharp band centre, 0 = bottom, 1 = top of the frame
  band: 0.2, // half height of the fully sharp band
  glow: 0.35, // glow strength
  glowFrom: 0.95, // brightness (linear) where glow starts
  vignette: 0.22,
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

const FINAL = /* glsl */ `uniform sampler2D tScene; uniform sampler2D tSoft; uniform sampler2D tGlow;
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
  const final = mat(FINAL, {
    tScene: { value: main },
    tSoft: { value: q[2].texture },
    tGlow: { value: g[0].texture },
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
  const blurPass = (src, tmp, dst, step) => {
    blur.uniforms.tSrc.value = src.texture;
    blur.uniforms.dir.value.set(step / qw, 0);
    pass(blur, tmp);
    blur.uniforms.tSrc.value = tmp.texture;
    blur.uniforms.dir.value.set(0, step / qh);
    pass(blur, dst);
  };

  return {
    // scene → look → canvas; `overlay` (LED panel …) is drawn sharp on top
    render(scene, camera, overlay, shotTilt = 1) {
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
