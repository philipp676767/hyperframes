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
// House length (user's rule, 2026-10-28; 60 s from 2026-10-24 to -27):
// every video is exactly 45 s,
// and it simply ends — no loop line any more (2026-10-24). scripts/prepare-
// voice.sh fits the speech to end ~1.2 s before 45 s; then the composition
// is exactly LENGTH. Anything else (the short template demo, old episodes)
// keeps its natural length — same rule as scripts/sync-html.mjs.
export const LENGTH = 45;
const natural = Math.ceil((LAST + (LOOP != null ? 0.25 : 1.2)) * 10) / 10;
const fitted = LAST > LENGTH - 3 && LAST + (LOOP != null ? 0.15 : 0.6) <= LENGTH;
export const DURATION = fitted ? LENGTH : natural;
export const END = LOOP != null ? DURATION : LAST + 1.0;

// Start times of the words marked *like this* in script.txt (yellow, bigger
// caption + camera punch-in + "punch" sound).
export const HL = WORDS.filter((w) => w.hl).map((w) => w.start);

// CTA moments, the same rules as the button timeline in index.html: the
// comment pill pops when the last script line starts; the follow pill on the
// first "folg…" — since 2026-10-24 a line in the MIDDLE of the video
// (2026-10-24 to -29; since -30 it is back at the end), so most viewers still see
// it — tapped 1.0 s later, flipped to "Gefolgt" at +1.12 s, gone at +2.4 s
// (`mid`). A "folg" inside the last line (older scripts) keeps the old
// end-of-video behaviour.
export function ctaTimes() {
  const words =
    CTA_START != null
      ? WORDS.slice(CTA_START, LOOP_START ?? WORDS.length)
      : WORDS.filter((w) => /^folg/i.test(w.w));
  if (!words.length) return null;
  const cmt = words[0].start;
  const fw = WORDS.slice(0, LOOP_START ?? WORDS.length).find((w) => /^folg/i.test(w.w));
  const follow = fw?.start ?? cmt + 1.2;
  const mid = follow < cmt;
  // at the end with a loop line the tap must land before the buttons fade out at LOOP
  const tap =
    !mid && LOOP != null
      ? Math.min(follow + 1.0, Math.max(follow + 0.5, LOOP - 0.45))
      : follow + 1.0;
  return { cmt, follow, tap, flip: tap + 0.12, mid, out: mid ? tap + 1.4 : null };
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
