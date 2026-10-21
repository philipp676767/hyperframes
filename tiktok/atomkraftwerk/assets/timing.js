// Word timings as plain data: no three.js and no DOM, so the same file runs in
// the page (world.js re-exports it) and in node (scripts/build-sfx.mjs reads
// the beats to place the sound effects).
const WORDS = globalThis.window.HF_WORDS;
const CTA_START = globalThis.window.HF_CTA_START;
export { WORDS };

const norm = (s) => s.toLowerCase().replace(/[^a-zäöüß0-9-]/g, "");
// Start (or end) time of the n-th occurrence of a spoken word. Throws if the
// script no longer contains it, so a reworded script fails loudly.
export function W(word, n = 1, end = false) {
  let c = 0;
  for (const x of WORDS) {
    if (norm(x.w) === norm(word) && ++c === n) return end ? x.end : x.start;
  }
  throw new Error(`anchor not found: ${word} #${n}`);
}
export const LAST = WORDS[WORDS.length - 1].end;
export const END = LAST + 1.0;
// composition length, same rounding as scripts/sync-html.mjs
export const DURATION = Math.ceil((LAST + 1.2) * 10) / 10;

// Start times of the words marked *like this* in script.txt (yellow, bigger
// caption + camera punch-in + "punch" sound).
export const HL = WORDS.filter((w) => w.hl).map((w) => w.start);

// CTA moments, the same rules as the button timeline in index.html: the
// comment pill pops when the last script line starts, the follow pill on
// "folg…", tapped 1.0 s later and flipped to "Gefolgt" at +1.12 s.
export function ctaTimes() {
  const words =
    CTA_START != null ? WORDS.slice(CTA_START) : WORDS.filter((w) => /^folg/i.test(w.w));
  if (!words.length) return null;
  const cmt = words[0].start;
  const follow = words.find((w) => /^folg/i.test(w.w))?.start ?? cmt + 1.2;
  return { cmt, follow, tap: follow + 1.0, flip: follow + 1.12 };
}

// The series line "… gebaut." right before the CTA (payoff "ding").
export function payoffTime() {
  const end = CTA_START ?? WORDS.length;
  for (let i = end - 1; i >= 0; i--) if (/^gebaut/i.test(WORDS[i].w)) return WORDS[i].end;
  return null;
}
