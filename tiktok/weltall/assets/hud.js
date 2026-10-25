// Device-style displays: information shown the way real machines show it —
// a camera viewfinder ("CAM A · INFRARED", corner brackets, REC dot), a
// speedometer, a stopwatch, a counter that ticks up, a small readout, a
// meter. Use them instead of (or next to) the LED panel whenever the topic
// has a "screen" of its own: the speed camera's viewfinder, the coffee
// machine's pressure gauge, the pallet count, the charging %.
// Call the functions every frame from renderAt(t) with k = visibility 0..1
// (pop() / ramp()); anything not called in a frame is hidden. Positions are
// frame pixels (1080 × 1920). Keep clear of the captions (y ≈ 900–1020), the
// question text (y ≈ 250–330), TikTok's buttons (x > 960, y 900–1500) and
// the bottom (y > 1500).
//   readout("speed", k, { label: "Tempo", value: 59, unit: "km/h", x: 60, y: 420 });
//   counter("pal", k, { label: "Paletten", value: n, x: 60, y: 1180 });
//   gauge("bar", k, { label: "Druck", value: 9, max: 15, unit: "bar", x: 640, y: 420 });
//   stopwatch("sw", k, { seconds: t - T.start, max: 360, x: 640, y: 420 });
//   meter("akku", k, { label: "Akku", value: 0.8, x: 60, y: 420 });
//   viewfinder(k, { label: "CAM A · INFRARED", time: "23:42:07" });
import { onFrame, clamp01 } from "./world.js";

const ACCENT = "#ffd23f";
const layer = document.createElement("div");
layer.id = "hud";
layer.style.cssText = "position:absolute;inset:0;pointer-events:none;";
document.getElementById("root").insertBefore(layer, document.getElementById("captions"));

const pool = new Map();
// every frame starts with everything hidden; the calls in renderAt show theirs
onFrame(() => {
  for (const n of pool.values()) n.el.style.opacity = "0";
});

const FONT = '"Montserrat",sans-serif';
const panelCss =
  "position:absolute;left:0;top:0;padding:18px 26px;border-radius:20px;" +
  "background:rgba(12,14,26,.62);border:2px solid rgba(255,255,255,.16);" +
  "box-shadow:0 12px 36px rgba(0,0,0,.35);color:#fff;opacity:0;white-space:nowrap;" +
  `font-family:${FONT};font-weight:800;`;
const labelCss = "font-size:24px;letter-spacing:4px;text-transform:uppercase;opacity:.72;";

function node(id, build) {
  let n = pool.get(id);
  if (!n) {
    n = build();
    layer.appendChild(n.el);
    pool.set(id, n);
  }
  return n;
}
function place(n, k, x, y, scaleFrom = 0.85) {
  const kk = clamp01(k);
  n.el.style.opacity = String(kk);
  n.el.style.transform = `translate(${x}px, ${y + (1 - kk) * 18}px) scale(${scaleFrom + (1 - scaleFrom) * kk})`;
  n.el.style.transformOrigin = "left top";
}
const fmt = (v, digits = 0) =>
  typeof v === "number"
    ? v.toLocaleString("de-DE", { minimumFractionDigits: digits, maximumFractionDigits: digits })
    : String(v);

// Small panel: LABEL above, big value + unit — "59 km/h · Bremse an".
export function readout(
  id,
  k,
  {
    label = "",
    value = "",
    unit = "",
    note = "",
    x = 60,
    y = 420,
    color = ACCENT,
    digits = 0,
  } = {},
) {
  if (k <= 0) return;
  const n = node(`r:${id}`, () => {
    const el = document.createElement("div");
    el.style.cssText = panelCss;
    el.innerHTML = `<div style="${labelCss}"></div><div><span style="font-size:76px;line-height:1.05;font-variant-numeric:tabular-nums"></span><span style="font-size:34px;margin-left:10px;opacity:.85"></span><span style="font-size:26px;margin-left:16px;opacity:.6"></span></div>`;
    return {
      el,
      l: el.children[0],
      v: el.children[1].children[0],
      u: el.children[1].children[1],
      nt: el.children[1].children[2],
    };
  });
  n.l.textContent = label;
  n.l.style.display = label ? "" : "none";
  n.v.textContent = fmt(value, digits);
  n.v.style.color = color;
  n.u.textContent = unit;
  n.nt.textContent = note;
  place(n, k, x, y);
}

// Big counter that punches on every change — "Paletten 33".
export function counter(id, k, { label = "", value = 0, x = 60, y = 1180, color = ACCENT } = {}) {
  if (k <= 0) return;
  const n = node(`c:${id}`, () => {
    const el = document.createElement("div");
    el.style.cssText = `position:absolute;left:0;top:0;opacity:0;color:#fff;font-family:${FONT};font-weight:800;text-shadow:0 4px 18px rgba(0,0,0,.45);`;
    el.innerHTML = `<div style="font-size:44px"></div><div style="font-size:150px;line-height:1;font-variant-numeric:tabular-nums;-webkit-text-stroke:6px rgba(20,12,30,.55);paint-order:stroke fill"></div>`;
    return { el, l: el.children[0], v: el.children[1] };
  });
  n.l.textContent = label;
  n.v.textContent = fmt(value);
  n.v.style.color = color;
  place(n, k, x, y, 0.7);
}

// Speedometer / pressure gauge: a 240° arc with a needle.
export function gauge(
  id,
  k,
  {
    label = "",
    value = 0,
    max = 100,
    unit = "",
    x = 640,
    y = 420,
    color = ACCENT,
    digits = 0,
  } = {},
) {
  if (k <= 0) return;
  const n = node(`g:${id}`, () => {
    const el = document.createElement("div");
    el.style.cssText = panelCss + "padding:16px 18px 12px;text-align:center;";
    el.innerHTML = `<svg width="340" height="250" viewBox="0 0 340 250">
      <path d="${arc(170, 175, 140, -120, 120)}" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="22" stroke-linecap="round"/>
      <path class="v" fill="none" stroke-width="22" stroke-linecap="round"/>
      <line class="n" x1="170" y1="175" x2="170" y2="60" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
      <circle cx="170" cy="175" r="14" fill="#fff"/>
      <text class="t" x="170" y="238" text-anchor="middle" fill="#fff" font-family='Montserrat' font-weight="800" font-size="52"></text>
    </svg><div style="${labelCss}"></div>`;
    const s = el.children[0];
    return {
      el,
      v: s.querySelector(".v"),
      n: s.querySelector(".n"),
      t: s.querySelector(".t"),
      l: el.children[1],
    };
  });
  const f = clamp01(value / max);
  const a = -120 + 240 * f;
  n.v.setAttribute("d", arc(170, 175, 140, -120, Math.max(-119.5, a)));
  n.v.setAttribute("stroke", color);
  n.n.setAttribute("transform", `rotate(${a} 170 175)`);
  n.t.textContent = `${fmt(value, digits)} ${unit}`.trim();
  n.l.textContent = label;
  place(n, k, x, y);
}
function arc(cx, cy, r, a0, a1) {
  const p = (a) => {
    const rad = ((a - 90) * Math.PI) / 180;
    return `${(cx + r * Math.cos(rad)).toFixed(1)} ${(cy + r * Math.sin(rad)).toFixed(1)}`;
  };
  return `M ${p(a0)} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${p(a1)}`;
}

// Stopwatch: ring that fills over `max` seconds + m:ss,s.
export function stopwatch(
  id,
  k,
  { seconds = 0, max = 60, label = "", x = 640, y = 420, color = ACCENT } = {},
) {
  if (k <= 0) return;
  const n = node(`s:${id}`, () => {
    const el = document.createElement("div");
    el.style.cssText = panelCss + "text-align:center;padding:18px 22px;";
    el.innerHTML = `<svg width="230" height="230" viewBox="0 0 230 230">
      <circle cx="115" cy="122" r="92" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="16"/>
      <path class="v" fill="none" stroke-width="16" stroke-linecap="round"/>
      <rect x="103" y="6" width="24" height="16" rx="5" fill="#fff"/>
      <text class="t" x="115" y="140" text-anchor="middle" fill="#fff" font-family='Montserrat' font-weight="800" font-size="46"></text>
    </svg><div style="${labelCss}"></div>`;
    const s = el.children[0];
    return { el, v: s.querySelector(".v"), t: s.querySelector(".t"), l: el.children[1] };
  });
  const sec = Math.max(0, seconds);
  const f = clamp01(sec / max);
  n.v.setAttribute("d", f > 0.001 ? arc(115, 122, 92, 0, Math.min(359.4, 360 * f)) : "");
  n.v.setAttribute("stroke", color);
  const m = Math.floor(sec / 60);
  const s = (sec - m * 60).toFixed(1).padStart(4, "0").replace(".", ",");
  n.t.textContent = `${m}:${s}`;
  n.l.textContent = label;
  n.l.style.display = label ? "" : "none";
  place(n, k, x, y);
}

// Horizontal meter 0..1 — battery, fill level, pressure, signal.
export function meter(
  id,
  k,
  { label = "", value = 0, x = 60, y = 420, width = 420, color = ACCENT, text } = {},
) {
  if (k <= 0) return;
  const n = node(`m:${id}`, () => {
    const el = document.createElement("div");
    el.style.cssText = panelCss;
    el.innerHTML = `<div style="display:flex;justify-content:space-between;gap:30px"><span style="${labelCss}"></span><span style="font-size:30px"></span></div>
      <div style="margin-top:12px;height:26px;border-radius:13px;background:rgba(255,255,255,.16);overflow:hidden"><div style="height:100%;border-radius:13px"></div></div>`;
    const top = el.children[0];
    return {
      el,
      l: top.children[0],
      t: top.children[1],
      bar: el.children[1],
      f: el.children[1].children[0],
    };
  });
  n.l.textContent = label;
  n.t.textContent = text ?? `${Math.round(clamp01(value) * 100)} %`;
  n.bar.style.width = `${width}px`;
  n.f.style.width = `${clamp01(value) * 100}%`;
  n.f.style.background = color;
  place(n, k, x, y);
}

// Camera viewfinder over the whole frame: corner brackets, a red REC dot +
// label top left, a time code top right, a faint scanline tint.
export function viewfinder(k, { label = "CAM A", time = "", color = "#ff3b5c" } = {}) {
  if (k <= 0) return;
  const n = node("vf", () => {
    const el = document.createElement("div");
    el.style.cssText = `position:absolute;inset:0;opacity:0;font-family:${FONT};font-weight:800;color:#fff;`;
    const c = (pos) =>
      `<div style="position:absolute;width:90px;height:90px;border-color:rgba(255,255,255,.85);border-style:solid;border-width:0;${pos}"></div>`;
    el.innerHTML =
      c("left:50px;top:400px;border-left-width:6px;border-top-width:6px") +
      c("right:50px;top:400px;border-right-width:6px;border-top-width:6px") +
      c("left:50px;top:1420px;border-left-width:6px;border-bottom-width:6px") +
      c("right:50px;top:1420px;border-right-width:6px;border-bottom-width:6px") +
      `<div style="position:absolute;left:62px;top:356px;font-size:28px;letter-spacing:4px"><span class="dot" style="display:inline-block;width:20px;height:20px;border-radius:50%;margin-right:14px"></span><span class="l"></span></div>` +
      `<div class="tm" style="position:absolute;right:62px;top:356px;font-size:28px;letter-spacing:3px;font-variant-numeric:tabular-nums"></div>` +
      `<div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,.035) 0 2px,transparent 2px 6px)"></div>`;
    return {
      el,
      dot: el.querySelector(".dot"),
      l: el.querySelector(".l"),
      tm: el.querySelector(".tm"),
    };
  });
  n.dot.style.background = color;
  n.l.textContent = label;
  n.tm.textContent = time;
  n.el.style.opacity = String(clamp01(k));
}
