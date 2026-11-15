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
  // the intro: cold open + why it matters + road map + title card, 35–55 s
  if (real && (LAST < 30 || LAST > 60))
    warn(`the intro speaks ${LAST.toFixed(1)} s — aim for 35–55 s (90–130 words).`);
  const nrmT = (x) => x.toLowerCase().replace(/[^a-zäöüß0-9-]/g, "");
  if (!K.titelBei || !words.some((w) => nrmT(w.w) === nrmT(K.titelBei)))
    warn("intro: kapitel.js `titelBei` is no spoken word — the title card would not appear.");
} else if (K.ende) {
  if (CTA == null) warn("end chapter: the last line has no „Folge für mehr Wissen.“");
} else if (real && (LAST < 55 || LAST > 125)) {
  warn(`chapter speaks ${LAST.toFixed(1)} s — aim for 60–120 s (≈ 150–300 words).`);
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
// no greeting / channel intro / subscribe ask, and none of the TikTok-isms
// that made YouTube #1 sound like a long TikTok (references/sprechstil.md)
const banned = [
  "uns bauen",
  "du hast gerade",
  "hallo",
  "willkommen",
  "herzlich",
  "bleib dran",
  "abonnier",
  "jetzt der trick",
  "hier kommt der trick",
  "der trick",
  "jetzt wird's verrückt",
  "rate mal",
  "zack",
  "krass",
];
// „in diesem Video“ only as the pointer to the next video in the end chapter
if (!K.ende) banned.push("in diesem video");
for (const bad of banned)
  if (` ${spoken} `.includes(` ${bad} `) || ` ${spoken} `.includes(` ${bad}`))
    warn(`the script says „${bad} …“ — banned in long form, rewrite it.`);
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
// the narrator's voice (sprechstil.md): flowing sentences, paragraphs, few
// questions, few delivery tags
const text = scriptLines.map(plain).join(" ");
const sentences = text.split(/(?<=[.!?…])\s+/).filter((x) => x.trim());
const wps = sentences.map((x) => x.split(/\s+/).filter((w) => w && w !== "–" && w !== "—").length);
const avg = wps.reduce((a, b) => a + b, 0) / Math.max(1, wps.length);
if (avg < 10)
  warn(
    `sentences average ${avg.toFixed(1)} words — that is TikTok rhythm. A narrator averages 12–18: join short ones with „weil“, „während“, „als“, „doch“.`,
  );
const shortRun = wps.some((c, i) => c <= 4 && (wps[i + 1] ?? 9) <= 4);
if (shortRun)
  warn("two very short sentences (≤ 4 words) in a row — at most one punch sentence per paragraph.");
const questions = sentences.filter((x) => /\?\s*$/.test(x.trim())).length;
if (questions > 3)
  warn(
    `${questions} questions in this chapter — max 2–3; turn the rest into statements / signposting.`,
  );
const endsQ = scriptLines.filter((l) => /\?\s*$/.test(plain(l).trim())).length;
if (scriptLines.length >= 3 && endsQ / scriptLines.length > 0.4)
  warn("most paragraphs end on a question — vary the bridges (statements, time markers).");
const shortLines = scriptLines.filter(
  (l) =>
    plain(l)
      .split(/[.!?…]/)
      .filter((x) => x.trim()).length < 2,
).length;
if (scriptLines.length >= 4 && shortLines / scriptLines.length > 0.5)
  warn("most lines hold one sentence — one line = one paragraph of 3–6 sentences.");
const voiceTags = scriptLines.join(" ").match(/\[[^\]\n]*\]/g) ?? [];
if (voiceTags.length > 2)
  warn(`${voiceTags.length} delivery tags — long form keeps a calm base tone: 0–2 per chapter.`);
// keywords: few and quiet (yellow only) — about one per 20–30 s
const hl = words.filter((w) => w.hl).length;
const want = Math.max(1, Math.round(LAST / 25));
if (real && (hl < want - 2 || hl > want + 2))
  warn(`${hl} *keywords* — aim for ~${want} in this chapter (one every 20–30 s).`);

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
