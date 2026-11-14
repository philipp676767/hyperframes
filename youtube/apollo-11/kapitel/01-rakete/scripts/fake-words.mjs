// Placeholder word timings (estimated, ~2.8 words/s) until the real voice
// exists: node scripts/fake-words.mjs → assets/words.js
import fs from "node:fs";
import { tokenize, meta } from "./words-lib.mjs";

const script = fs.readFileSync(new URL("../script.txt", import.meta.url), "utf8");
const toks = tokenize(script);
let t = 0.3;
const words = toks.map((tk) => {
  const d = 0.12 + 0.04 * tk.w.length;
  const o = { w: tk.w, start: +t.toFixed(3), end: +(t + d).toFixed(3) };
  if (tk.hl) o.hl = true;
  if (tk.br) o.br = tk.br;
  t += d + (tk.br === 2 ? 0.32 : tk.br === 1 ? 0.16 : 0.03);
  return o;
});
fs.writeFileSync(new URL("../assets/words.js", import.meta.url), meta(script, words));
console.log(words.length, "words, ends at", words.at(-1).end);
