// Sync index.html to assets/words.js + assets/voiceover.mp3 (+ assets/bgm.mp3,
// assets/sfx.mp3): root duration, caption timeline length and the voiceover /
// music / sound-effect <audio> clips.
import fs from "node:fs";
import vm from "node:vm";

const root = new URL("..", import.meta.url);
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(new URL("assets/words.js", root), "utf8"), ctx);
const words = ctx.window.HF_WORDS;
// same rule as assets/timing.js DURATION: exactly LENGTH (45 s) when the
// voice was fitted to it, else 1.2 s after the last word (0.25 s with an old
// loop line)
const LENGTH = 45;
const loop = ctx.window.HF_LOOP_START != null;
const last = words[words.length - 1].end;
const tail = loop ? 0.25 : 1.2;
const natural = Math.ceil((last + tail) * 10) / 10;
const fitted = last > LENGTH - 3 && last + (loop ? 0.15 : 0.4) <= LENGTH;
const dur = fitted ? LENGTH : natural;
// house rule (2026-10-29): the hook — the first script line — is spoken in ≤ 3 s
const hookLen = ctx.window.HF_HOOK_LEN;
if (hookLen) {
  const hookEnd = words[Math.min(hookLen, words.length) - 1].end;
  if (hookEnd > 3.0)
    console.warn(
      `WARNING: the hook (line 1, ${hookLen} words) ends at ${hookEnd.toFixed(2)} s — max 3.0 s. Shorten it to ≤ 9 words and regenerate the voice.`,
    );
  else console.log(`hook ends at ${hookEnd.toFixed(2)} s (≤ 3 s)`);
}
// house rule (2026-11-12): the whole CTA is the last line — comment question
// + „Folge für mehr Wissen.“; no "folg…" word anywhere before it
const ctaStart = ctx.window.HF_CTA_START ?? words.length;
const early = words.slice(0, ctaStart).find((w) => /^folg/i.test(w.w));
const inCta = words.slice(ctaStart).some((w) => /^folg/i.test(w.w));
if (early)
  console.warn(
    `WARNING: „${early.w}“ at ${early.start.toFixed(1)} s — „Folge für mehr Wissen.“ belongs only in the last line, and no other "folg…" word may come before it.`,
  );
if (!inCta) console.warn("WARNING: the last line has no „Folge für mehr Wissen.“");
// banned old-style lines (2026-11-02 / 2026-10-23)
const spoken = words.map((w) => w.w.toLowerCase()).join(" ");
for (const bad of ["uns bauen", "du hast gerade"])
  if (spoken.includes(bad))
    console.warn(`WARNING: the script says „${bad} …“ — old style, cut that sentence.`);
// filler words (2026-11-11): every word must carry something
const fillers = [
  "und genau",
  "eigentlich",
  "sozusagen",
  "quasi",
  "halt",
  "und zwar",
  "es ist so dass",
  "das ding ist",
];
const found = fillers.filter((f) => ` ${spoken} `.includes(` ${f} `));
if (found.length)
  console.warn(`WARNING: filler words: ${found.map((f) => `„${f}“`).join(", ")} — cut them.`);
// no whispering in the hook (2026-11-07): line 1 and the first sentence of line 2
const scriptLines = fs
  .readFileSync(new URL("script.txt", root), "utf8")
  .split("\n")
  .filter((l) => l.trim());
const hookText = (scriptLines[0] ?? "") + " " + (scriptLines[1] ?? "").split(/[.!?]/)[0];
if (/\[whisper/i.test(hookText))
  console.warn(
    "WARNING: [whispers] in the hook — the first seconds must be loud: use [excited] / [curious] or no tag.",
  );
if (last > LENGTH - 3 && !fitted)
  console.warn(
    `WARNING: speech ends at ${last}s — too long for exactly ${LENGTH}s; rerun prepare-voice.sh`,
  );
const htmlUrl = new URL("index.html", root);
let html = fs.readFileSync(htmlUrl, "utf8");
html = html.replace(/(data-composition-id="main"[\s\S]*?data-duration=")[\d.]+"/, `$1${dur}"`);
html = html.replace(/tl\.set\(\{\}, \{\}, [\d.]+\);/, `tl.set({}, {}, ${dur});`);
const audioTag = `<audio id="vo" src="assets/voiceover.mp3" data-start="0" data-duration="${dur}" data-track-index="2" data-volume="1"></audio>`;
const bgmTag = `<audio id="bgm" src="assets/bgm.mp3" data-start="0" data-duration="${dur}" data-track-index="3" data-volume="1"></audio>`;
const sfxTag = `<audio id="sfx" src="assets/sfx.mp3" data-start="0" data-duration="${dur}" data-track-index="4" data-volume="1"></audio>`;
// Drop every existing voiceover / music / sfx tag (formatters may have wrapped them), then add one each.
html = html.replace(/\n?[ \t]*<audio\b[^>]*\bid="(vo|bgm|sfx)"[^>]*>\s*<\/audio>/g, "");
const tags = [];
if (fs.existsSync(new URL("assets/voiceover.mp3", root))) tags.push(audioTag);
if (fs.existsSync(new URL("assets/bgm.mp3", root))) tags.push(bgmTag);
if (fs.existsSync(new URL("assets/sfx.mp3", root))) tags.push(sfxTag);
if (tags.length) {
  html = html.replace(
    '<div id="captions"></div>',
    `<div id="captions"></div>${tags.map((t) => `\n      ${t}`).join("")}`,
  );
}
fs.writeFileSync(htmlUrl, html);
console.log(`composition ${dur}s`);
