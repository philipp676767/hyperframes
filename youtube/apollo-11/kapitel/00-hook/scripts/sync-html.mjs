// Sync index.html to assets/words.js + assets/kapitel.js + the audio files:
// root duration, timeline length and the voiceover / sound-effect <audio>
// clips (no music: voice + sound effects only). Also checks the chapter
// against the house rules of skill youtube-erklaervideo and warns.
import fs from "node:fs";
import vm from "node:vm";

const root = new URL("..", import.meta.url);
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(new URL("assets/words.js", root), "utf8"), ctx);
vm.runInNewContext(fs.readFileSync(new URL("assets/kapitel.js", root), "utf8"), ctx);
globalThis.window = ctx.window;
const {
  WORDS: words,
  DURATION: dur,
  KAPITEL: K,
  LAST,
  CTA,
} = await import(new URL("assets/timing.js", root));
const warn = (m) => console.warn(`WARNING: ${m}`);
const real = fs.existsSync(new URL("assets/voiceover.mp3", root));

const scriptLines = fs
  .readFileSync(new URL("script.txt", root), "utf8")
  .split("\n")
  .filter((l) => l.trim());
const spoken = words.map((w) => w.w.toLowerCase()).join(" ");
const plain = (l) => l.replace(/\[[^\]\n]*\]/g, " ").replace(/\*/g, "");

// ---------------------------------------------------------------- length
const n = words.length;
if (K.nr === 0) {
  // the hook: 0:00–0:30; its first sentence (the claim / the spectacle) ≤ 3.5 s
  const first = words.find((w) => w.br === 2) ?? words[n - 1];
  if (first.end > 3.5)
    warn(
      `the first sentence of the hook ends at ${first.end.toFixed(2)} s — max 3.5 s (≤ 9 words): shorten it.`,
    );
  if (real && (LAST < 22 || LAST > 34))
    warn(`the hook chapter speaks ${LAST.toFixed(1)} s — aim for 25–32 s (0:00–0:30).`);
} else if (K.ende) {
  if (CTA == null) warn("end chapter: the last line has no „Folge für mehr Wissen.“");
} else if (real && (LAST < 55 || LAST > 125)) {
  warn(`chapter speaks ${LAST.toFixed(1)} s — aim for 60–120 s (≈ 170–330 words).`);
}
console.log(`chapter ${K.nr} „${K.titel}“: ${n} words, speech ${LAST.toFixed(1)} s`);

// ---------------------------------------------------------------- rules
// „Folge für mehr Wissen.“ only in the last line of the end chapter; no
// other "folg…" word anywhere (the subscribe pill keys on it)
const ctaStart = ctx.window.HF_CTA_START ?? n;
const early = words.slice(0, ctaStart).find((w) => /^folg/i.test(w.w));
if (early)
  warn(
    `„${early.w}“ at ${early.start.toFixed(1)} s — no "folg…" word outside the end chapter's last line (write „Konsequenz“, „danach“ …).`,
  );
// no intro, no greeting, no subscribe ask at the start, no promise phrases
const banned = [
  "uns bauen",
  "du hast gerade",
  "hallo",
  "willkommen",
  "herzlich",
  "gleich erfährst du",
  "gleich siehst du",
  "gleich weißt du",
  "bleib dran",
  "abonnier",
  "jetzt der trick",
  "hier kommt der trick",
  "jetzt wird's verrückt",
];
// „in diesem Video“ only as the pointer to the next video in the end chapter
if (!K.ende) banned.push("in diesem video");
for (const bad of banned)
  if (` ${spoken} `.includes(` ${bad}`))
    warn(`the script says „${bad} …“ — banned phrase, cut it.`);
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
if (found.length) warn(`filler words: ${found.map((f) => `„${f}“`).join(", ")} — cut them.`);
// no whispering in the hook: chapter 0, line 1 and the first sentence of line 2
if (K.nr === 0) {
  const hookText = (scriptLines[0] ?? "") + " " + (scriptLines[1] ?? "").split(/[.!?]/)[0];
  if (/\[whisper/i.test(hookText))
    warn(
      "[whispers] in the hook — the first seconds must be loud: [excited] / [curious] or no tag.",
    );
}
// every chapter but the last ends on an open question (the open-loop chain)
if (!K.ende) {
  const last = plain(scriptLines[scriptLines.length - 1] ?? "").trim();
  if (!/\?\s*$/.test(last))
    warn(
      "the chapter's last sentence is no question — end on the open question that pulls into the next chapter.",
    );
}
// keywords: about one every 15–20 s
const hl = words.filter((w) => w.hl).length;
const want = Math.max(2, Math.round(LAST / 18));
if (real && (hl < want - 2 || hl > want + 3))
  warn(`${hl} *keywords* — aim for ~${want} in this chapter (one every 15–20 s).`);

// ---------------------------------------------------------------- html
const htmlUrl = new URL("index.html", root);
let html = fs.readFileSync(htmlUrl, "utf8");
html = html.replace(/(data-composition-id="main"[\s\S]*?data-duration=")[\d.]+"/, `$1${dur}"`);
html = html.replace(/tl\.set\(\{\}, \{\}, [\d.]+\);/, `tl.set({}, {}, ${dur});`);
const audioTag = `<audio id="vo" src="assets/voiceover.mp3" data-start="0" data-duration="${dur}" data-track-index="2" data-volume="1"></audio>`;
const sfxTag = `<audio id="sfx" src="assets/sfx.mp3" data-start="0" data-duration="${dur}" data-track-index="4" data-volume="1"></audio>`;
// Drop every existing voiceover / music / sfx tag (formatters may have wrapped them), then add one each.
html = html.replace(/\n?[ \t]*<audio\b[^>]*\bid="(vo|bgm|sfx)"[^>]*>\s*<\/audio>/g, "");
const tags = [];
if (real) tags.push(audioTag);
if (fs.existsSync(new URL("assets/sfx.mp3", root))) tags.push(sfxTag);
if (tags.length) {
  html = html.replace(
    '<div id="captions"></div>',
    `<div id="captions"></div>${tags.map((t) => `\n      ${t}`).join("")}`,
  );
}
fs.writeFileSync(htmlUrl, html);
console.log(`composition ${dur} s${K.ende ? " (incl. 20 s end screen)" : ""}`);
