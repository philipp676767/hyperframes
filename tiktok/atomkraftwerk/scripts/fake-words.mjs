// Placeholder word timings (estimated) until the real ElevenLabs alignment exists.
import fs from "node:fs";
const text = fs.readFileSync(new URL("../script.txt", import.meta.url), "utf8");
const toks = text.split(/\s+/).filter((w) => w && w !== "–");
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
// the last line of script.txt is the CTA; its first word drives the CTA buttons
const lines = text
  .trim()
  .split("\n")
  .filter((l) => l.trim());
const ctaLen = lines[lines.length - 1].split(/\s+/).filter((w) => w && w !== "–").length;
fs.writeFileSync(
  new URL("../assets/words.js", import.meta.url),
  "window.HF_WORDS = " +
    JSON.stringify(words) +
    ";\nwindow.HF_CTA_START = " +
    (words.length - ctaLen) +
    ";\n",
);
console.log(words.length, "words, ends at", words.at(-1).end);
