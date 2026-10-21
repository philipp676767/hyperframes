// Placeholder word timings (estimated) until the real ElevenLabs alignment exists.
import fs from "node:fs";
const text = fs.readFileSync(new URL("../script.txt", import.meta.url), "utf8");
// "–" is not spoken; a line starting with ">" is the loop bridge (marker not spoken)
const isWord = (w) => w && w !== "–" && w !== ">";
const toks = text.split(/\s+/).filter(isWord);
let t = 0.3;
const words = toks.map((raw) => {
  // *Wort* = highlighted keyword (yellow caption + punch-in + sound)
  const hl = /^\*.*\*[.,:!?]*$/.test(raw);
  const w = raw.replace(/[.,:!?*]/g, "");
  const d = 0.1 + 0.037 * w.length;
  const o = { w, start: +t.toFixed(3), end: +(t + d).toFixed(3) };
  if (hl) o.hl = true;
  t += d + (/[.!?]\*?$/.test(raw) ? 0.3 : /[,:]$/.test(raw) ? 0.14 : 0.02);
  return o;
});
// The CTA is the last line (its first word drives the CTA buttons); an
// optional final "> …" line is the loop bridge into the hook.
const lines = text
  .trim()
  .split("\n")
  .filter((l) => l.trim());
const count = (l) => l.split(/\s+/).filter(isWord).length;
const loop = lines[lines.length - 1].trim().startsWith(">");
const loopLen = loop ? count(lines[lines.length - 1]) : 0;
const ctaLen = count(lines[lines.length - (loop ? 2 : 1)]);
fs.writeFileSync(
  new URL("../assets/words.js", import.meta.url),
  "window.HF_WORDS = " +
    JSON.stringify(words) +
    ";\nwindow.HF_CTA_START = " +
    (words.length - loopLen - ctaLen) +
    ";\nwindow.HF_LOOP_START = " +
    (loop ? words.length - loopLen : "null") +
    ";\n",
);
console.log(words.length, "words, ends at", words.at(-1).end);
