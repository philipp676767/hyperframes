// Word timings as plain data: no three.js and no DOM, so the same file runs in
// the page (world.js re-exports it) and in node (scripts/build-sfx.mjs reads
// the beats to place the sound effects).
const WORDS = globalThis.window.HF_WORDS;
const CTA_START = globalThis.window.HF_CTA_START;
const LOOP_START = globalThis.window.HF_LOOP_START;
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
// Loop ending: the last script line "> Und merk dir:" leads straight back into
// the hook. LOOP = its first word; from there the picture shows the moments
// right before frame 0 (world.js start()), and the video ends 0.25 s after
// the last word so the restart lands on the beat. null = no loop line.
export const LOOP = LOOP_START != null ? WORDS[LOOP_START].start : null;
// composition length, same rounding as scripts/sync-html.mjs
export const DURATION = Math.ceil((LAST + (LOOP != null ? 0.25 : 1.2)) * 10) / 10;
export const END = LOOP != null ? DURATION : LAST + 1.0;

// Start times of the words marked *like this* in script.txt (yellow, bigger
// caption + camera punch-in + "punch" sound).
export const HL = WORDS.filter((w) => w.hl).map((w) => w.start);

// CTA moments, the same rules as the button timeline in index.html: the
// comment pill pops when the last script line starts, the follow pill on
// "folg…", tapped 1.0 s later and flipped to "Gefolgt" at +1.12 s.
export function ctaTimes() {
  const words =
    CTA_START != null
      ? WORDS.slice(CTA_START, LOOP_START ?? WORDS.length)
      : WORDS.filter((w) => /^folg/i.test(w.w));
  if (!words.length) return null;
  const cmt = words[0].start;
  const follow = words.find((w) => /^folg/i.test(w.w))?.start ?? cmt + 1.2;
  // with a loop line the tap must land before the buttons fade out at LOOP
  const tap =
    LOOP != null ? Math.min(follow + 1.0, Math.max(follow + 0.5, LOOP - 0.45)) : follow + 1.0;
  return { cmt, follow, tap, flip: tap + 0.12 };
}

// The series line "… gebaut." right before the CTA (payoff "ding").
export function payoffTime() {
  const end = CTA_START ?? WORDS.length;
  for (let i = end - 1; i >= 0; i--) if (/^gebaut/i.test(WORDS[i].w)) return WORDS[i].end;
  return null;
}

// Bonus fact: the line starting with "Übrigens" after the payoff ("WUSSTEST
// DU?" badge + "wow" sound until the CTA starts).
export function factTime() {
  const end = CTA_START ?? WORDS.length;
  for (let i = end - 1; i >= 0; i--) if (/^übrigens$/i.test(WORDS[i].w)) return WORDS[i].start;
  return null;
}
