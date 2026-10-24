// Sync index.html to assets/words.js + assets/voiceover.mp3 (+ assets/bgm.mp3,
// assets/sfx.mp3): root duration, caption timeline length and the voiceover /
// music / sound-effect <audio> clips.
import fs from "node:fs";
import vm from "node:vm";

const root = new URL("..", import.meta.url);
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(new URL("assets/words.js", root), "utf8"), ctx);
const words = ctx.window.HF_WORDS;
// same rule as assets/timing.js DURATION: exactly LENGTH (one minute) when the
// voice was fitted to it, else a loop ending stops 0.25 s after the last word
const LENGTH = 60;
const loop = ctx.window.HF_LOOP_START != null;
const last = words[words.length - 1].end;
const tail = loop ? 0.25 : 1.2;
const natural = Math.ceil((last + tail) * 10) / 10;
const dur = loop && last > LENGTH - 2 && last + 0.15 <= LENGTH ? LENGTH : natural;
if (loop && last > LENGTH - 2 && dur !== LENGTH)
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
