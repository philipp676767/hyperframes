// Build assets/sfx.mp3: every sound effect of the video on one track, placed
// from the same beats the picture uses (assets/beats.js + words.js).
// Automatic cues (long form, calm): whoosh only on shots marked `whoosh: true`
// / whip pans, a whoosh on the title card (chapter 0) and on each chapter
// cut, blip per label, ding when the chapter's question is
// answered, wow on the bonus fact ("Übrigens"), CTA pops + click + ding (wherever
// „abonniere“ / „Kommentare“ is spoken — the middle of the video). Plus beats.js SFX.
// Writes assets/sfx-cues.json (what landed where) for checking.
// Run after align-words.py (real timings), before sync-html.mjs.
//   node scripts/build-sfx.mjs            SFX_DB=-2 shifts every level
import fs from "node:fs";
import vm from "node:vm";
import { execFileSync } from "node:child_process";

const root = new URL("..", import.meta.url);
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(new URL("assets/words.js", root), "utf8"), ctx);
vm.runInNewContext(fs.readFileSync(new URL("assets/kapitel.js", root), "utf8"), ctx);
globalThis.window = ctx.window;
const { WORDS, DURATION, HL, KAPITEL, ctaTimes, answerTime, factTime } = await import(
  new URL("assets/timing.js", root)
);
const {
  shots,
  LABELS = [],
  SFX = [],
  HIGHLIGHTS = [],
} = await import(new URL("assets/beats.js", root));

const kit = new URL("assets/sfx/", root);
// this video's own sounds (scripts/sfx-extra.py and/or scripts/add-sfx.sh)
const extra = new URL("assets/sfx-extra/", root);
if (fs.existsSync(new URL("scripts/sfx-extra.py", root))) {
  execFileSync("python3", [new URL("scripts/make-sfx.py", root).pathname, "--extra"], {
    stdio: "inherit",
  });
}
const extraFile = (s) =>
  ["wav", "mp3"].map((e) => new URL(`${s}.${e}`, extra)).find((u) => fs.existsSync(u));
const soundFile = (s) => extraFile(s) ?? new URL(`${s}.wav`, kit);
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
// long form (2026-11-15): no whoosh on every cut — only on shots marked
// `whoosh: true` (a jump to another place / time) and on whip pans
for (const sh of shots.slice(1)) {
  if (!(sh.whoosh || sh.whip) || sh.sfx === false || sh.at - lastCut < 0.8) continue;
  add("whoosh", sh.at, "cut");
  lastCut = sh.at;
}
if (!KAPITEL.nr) {
  // the title card after the cold open (kapitel.js titelBei)
  const nrm = (x) => x.toLowerCase().replace(/[^a-zäöüß0-9-]/g, "");
  const tw = KAPITEL.titelBei && WORDS.find((w) => nrm(w.w) === nrm(KAPITEL.titelBei));
  if (tw) add("whoosh", tw.start, "title card", { db: -12 });
} else {
  // the cut into a new chapter + its tag (index.html): one soft whoosh
  add("whoosh", 0.22, "chapter cut", { db: -14 });
}
add("wow", factTime(), "bonus fact");
// keywords: no punch sound in long form (HL kept for the captions only)
void HL;
for (const l of LABELS) add("blip", l.at + 0.05, `label ${l.text}`);
add("ding", answerTime(), "question answered");
const cta = ctaTimes();
if (cta?.cmt != null) add("pop", cta.cmt, "comment pill");
if (cta?.sub != null) {
  add("pop", cta.sub, "subscribe pill");
  add("click", cta.tap + 0.08, "subscribe tap");
  add("ding", cta.flip, "abonniert", { db: -16 });
}
const FX_SOUND = { shake: "hit", flash: "hit", zoom: "whoosh", slowmo: "slowmo" };
for (const h of HIGHLIGHTS) add(FX_SOUND[h.kind] ?? "hit", h.at, `highlight ${h.kind}`);
for (const c of SFX) add(c.s, c.at, "beats.js", { dur: c.dur, db: c.db });

cues.sort((a, b) => a.at - b.at);
// an older kit may miss a newer sound: rebuild the kit once
if (cues.some((c) => !fs.existsSync(soundFile(c.s)))) {
  execFileSync("python3", [new URL("scripts/make-sfx.py", root).pathname, kit.pathname], {
    stdio: "inherit",
  });
}
for (const c of cues) {
  if (extraFile(c.s) && fs.existsSync(new URL(`${c.s}.wav`, kit)))
    throw new Error(`assets/sfx-extra/${c.s} has the name of a house sound — rename it`);
  if (!fs.existsSync(soundFile(c.s)))
    throw new Error(`unknown sound "${c.s}" (kit: ${Object.keys(LEVEL).join(" ")})`);
}

const shift = Number(process.env.SFX_DB ?? 0);
const args = ["-v", "error", "-y"];
const parts = [];
cues.forEach((c, i) => {
  args.push("-i", soundFile(c.s).pathname);
  const db = (c.db ?? LEVEL[c.s] ?? (extraFile(c.s) ? -12 : -14)) + shift;
  const ms = Math.round(c.at * 1000);
  let f = `[${i}:a]`;
  if (c.dur) {
    const d = Math.max(0.2, c.dur);
    f += `aloop=loop=-1:size=1323000,atrim=0:${d.toFixed(3)},afade=t=in:d=0.15,afade=t=out:st=${Math.max(0, d - 0.3).toFixed(3)}:d=0.3,`;
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
