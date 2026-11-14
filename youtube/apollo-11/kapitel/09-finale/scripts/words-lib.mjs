// Shared by fake-words.mjs (and mirrored in align-words.py): script.txt →
// tokens with caption flags, and the words.js file.
//   hl: *Wort* = keyword (yellow + camera punch-in + sound)
//   br: 2 = sentence end (. ! ?), 1 = phrase end (, : ; –) — the captions
//       break their 2–4-word groups there
const TAG = /\[[^\]\n]*\]/g; // [excited] … are delivery tags for the voice, not words
export function tokenize(script) {
  const raw = script.replace(TAG, " ").split(/\s+/).filter(Boolean);
  const out = [];
  raw.forEach((r) => {
    if (r === "–" || r === "—") {
      if (out.length) out[out.length - 1].br = Math.max(out[out.length - 1].br ?? 0, 1);
      return;
    }
    const hl = /^\*.*\*[.,:;!?…]*$/.test(r);
    const br = /[.!?…]\*?$/.test(r) ? 2 : /[,:;]\*?$/.test(r) ? 1 : 0;
    // keep a dot / comma inside a number ("60.000", "1,5")
    const w = r.replace(/\*/g, "").replace(/(?<!\d)[.,]|[.,](?!\d)|[:;!?…„“"]/g, "");
    if (!w) return;
    const o = { w };
    if (hl) o.hl = true;
    if (br) o.br = br;
    out.push(o);
  });
  return out;
}
// The CTA line exists only in the end chapter: the last line, containing
// „Folge für mehr Wissen.“. The hook = the first line (chapter 0).
export function meta(script, words) {
  const lines = script
    .trim()
    .split("\n")
    .filter((l) => l.trim());
  const last = lines[lines.length - 1];
  const ctaLen = /folge für mehr wissen/i.test(last) ? tokenize(last).length : 0;
  return (
    "window.HF_WORDS = " +
    JSON.stringify(words) +
    ";\nwindow.HF_CTA_START = " +
    (ctaLen ? words.length - ctaLen : "null") +
    ";\nwindow.HF_HOOK_LEN = " +
    tokenize(lines[0]).length +
    ";\n"
  );
}
