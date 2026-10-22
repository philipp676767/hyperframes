// Build assets/sfx.mp3: every sound effect of the video on one track, placed
// from the same beats the picture uses (assets/beats.js + words.js).
// Automatic cues: whoosh on each camera cut, hit on the hook title, punch on
// each *highlighted* word, blip per label, ding on the payoff line, wow on
// the bonus fact ("Übrigens"), CTA pops + click + ding, whoosh on the loop
// cut back to the opening shot. Plus beats.js SFX.
// Writes assets/sfx-cues.json (what landed where) for checking.
// Run after align-words.py (real timings), before sync-html.mjs.
//   node scripts/build-sfx.mjs            SFX_DB=-2 shifts every level
import fs from "node:fs";
import vm from "node:vm";
import { execFileSync } from "node:child_process";

const root = new URL("..", import.meta.url);
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(new URL("assets/words.js", root), "utf8"), ctx);
globalThis.window = ctx.window;
const { DURATION, HL, LOOP, ctaTimes, payoffTime, factTime } = await import(
  new URL("assets/timing.js", root)
);
const {
  shots,
  LABELS = [],
  SFX = [],
  HIGHLIGHTS = [],
} = await import(new URL("assets/beats.js", root));

const kit = new URL("assets/sfx/", root);
if (!fs.existsSync(new URL("whoosh.wav", kit))) {
  execFileSync("python3", [new URL("scripts/make-sfx.py", root).pathname, kit.pathname], {
    stdio: "inherit",
  });
}

// default level per sound (dB on the -3 dBFS kit); the voice sits at -14 LUFS
const LEVEL = {
  whoosh: -10,
  hit: -6,
  punch: -9,
  blip: -14,
  pop: -10,
  click: -6,
  klack: -8,
  ding: -12,
  boing: -12,
  wow: -11,
  zisch: -17,
  brumm: -15,
  surr: -19,
  rauschen: -17,
  slowmo: -9,
};
// where the audible "moment" sits inside each file (whoosh peaks at 0.22 s)
const LEAD = { whoosh: 0.22 };

const cues = [];
const add = (s, at, why, extra = {}) => {
  if (at == null || !Number.isFinite(at)) return;
  cues.push({ s, at: Math.max(0, at - (LEAD[s] ?? 0)), why, ...extra });
};

let lastCut = -9;
for (const sh of shots.slice(1)) {
  if (sh.sfx === false || sh.at - lastCut < 0.8) continue;
  add("whoosh", sh.at, "cut");
  lastCut = sh.at;
}
add("hit", 0.05, "hook title");
if (LOOP != null) add("whoosh", LOOP, "loop cut");
add("wow", factTime(), "bonus fact");
for (const h of HL) add("punch", h, "highlight");
for (const l of LABELS) add("blip", l.at + 0.05, `label ${l.text}`);
add("ding", payoffTime(), "payoff");
const cta = ctaTimes();
if (cta) {
  add("pop", cta.cmt, "comment pill");
  add("pop", cta.follow, "follow pill");
  add("click", cta.tap + 0.08, "follow tap");
  add("ding", cta.flip, "gefolgt", { db: -16 });
}
const FX_SOUND = { shake: "hit", flash: "hit", zoom: "whoosh", slowmo: "slowmo" };
for (const h of HIGHLIGHTS) add(FX_SOUND[h.kind] ?? "hit", h.at, `highlight ${h.kind}`);
for (const c of SFX) add(c.s, c.at, "beats.js", { dur: c.dur, db: c.db });

cues.sort((a, b) => a.at - b.at);
// an older kit may miss a newer sound: rebuild the kit once
if (cues.some((c) => !fs.existsSync(new URL(`${c.s}.wav`, kit)))) {
  execFileSync("python3", [new URL("scripts/make-sfx.py", root).pathname, kit.pathname], {
    stdio: "inherit",
  });
}
for (const c of cues) {
  if (!fs.existsSync(new URL(`${c.s}.wav`, kit)))
    throw new Error(`unknown sound "${c.s}" (kit: ${Object.keys(LEVEL).join(" ")})`);
}

const shift = Number(process.env.SFX_DB ?? 0);
const args = ["-v", "error", "-y"];
const parts = [];
cues.forEach((c, i) => {
  args.push("-i", new URL(`${c.s}.wav`, kit).pathname);
  const db = (c.db ?? LEVEL[c.s] ?? -14) + shift;
  const ms = Math.round(c.at * 1000);
  let f = `[${i}:a]`;
  if (c.dur) {
    const d = Math.max(0.2, c.dur);
    f += `aloop=loop=-1:size=176400,atrim=0:${d.toFixed(3)},afade=t=in:d=0.15,afade=t=out:st=${Math.max(0, d - 0.3).toFixed(3)}:d=0.3,`;
  }
  f += `volume=${db}dB,adelay=${ms}:all=1[c${i}]`;
  parts.push(f);
});
const mix = cues.map((_, i) => `[c${i}]`).join("");
parts.push(
  `${mix}amix=inputs=${cues.length}:normalize=0:duration=longest,apad,atrim=0:${DURATION}[out]`,
);
args.push(
  "-filter_complex",
  parts.join(";"),
  "-map",
  "[out]",
  "-ac",
  "2",
  "-ar",
  "44100",
  "-b:a",
  "192k",
  new URL("assets/sfx.mp3", root).pathname,
);
execFileSync("ffmpeg", args, { stdio: "inherit" });

fs.writeFileSync(
  new URL("assets/sfx-cues.json", root),
  JSON.stringify(
    cues.map((c) => ({ ...c, at: +c.at.toFixed(3) })),
    null,
    1,
  ) + "\n",
);
const counts = {};
for (const c of cues) counts[c.s] = (counts[c.s] ?? 0) + 1;
console.log(`assets/sfx.mp3: ${cues.length} cues over ${DURATION}s`, counts);
