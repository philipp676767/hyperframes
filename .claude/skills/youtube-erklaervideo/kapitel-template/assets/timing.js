// Word timings + chapter settings as plain data: no three.js and no DOM, so
// the same file runs in the page (world.js re-exports it) and in node
// (scripts/build-sfx.mjs, scripts/sync-html.mjs read the beats).
//
// One chapter = one composition (skill youtube-erklaervideo). Its settings
// live in assets/kapitel.js (window.HF_KAPITEL), its words in assets/words.js.
const WORDS = globalThis.window.HF_WORDS;
const CTA_START = globalThis.window.HF_CTA_START; // null except in the end chapter
export const KAPITEL = globalThis.window.HF_KAPITEL ?? {};
export { WORDS };
export const FPS = 30;
// YouTube end screen: the last 20 s of the video (end chapter only)
export const ENDSCREEN = 20;

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
// first word of the CTA line (end chapter): comment question + „Folge für mehr Wissen.“
export const CTA = CTA_START != null ? WORDS[CTA_START].start : null;
// Chapter length, frame-exact (the chapters are joined without re-encoding):
// a normal chapter ends `tail` s after its last word (default 0.6 — the
// breath before the next chapter); the end chapter runs until the CTA line
// started ENDSCREEN s ago (calm, moving picture under YouTube's end screen).
// rounded up to 0.1 s = 3 whole frames, a clean number in index.html
const frames = (s) => Math.ceil(s * 10 - 1e-6) / 10;
export const DURATION = KAPITEL.ende
  ? frames(Math.max(LAST + 3, (CTA ?? LAST) + ENDSCREEN))
  : frames(LAST + (KAPITEL.tail ?? 0.6));
export const END = DURATION;
// start of the end screen (null in normal chapters)
export const ENDSCREEN_FROM = KAPITEL.ende ? DURATION - ENDSCREEN : null;
// kept for the shared engine: chapters never loop
export const LOOP = null;

// Start times of the words marked *like this* in script.txt (yellow caption
// word + camera punch-in + "punch" sound).
export const HL = WORDS.filter((w) => w.hl).map((w) => w.start);

// CTA moments (end chapter), the same rules as the pill timeline in
// index.html: the comment pill pops when the CTA line starts; the red
// "Abonnieren" pill pops on "Folge", is tapped 0.7 s later and flips to
// "Abonniert" (+0.12 s); both leave 0.4 s after the line, before the
// quiet end-screen picture.
export function ctaTimes() {
  if (CTA_START == null) return null;
  const words = WORDS.slice(CTA_START);
  const fw = words.find((w) => /^folg/i.test(w.w));
  const follow = fw?.start ?? words[0].start + 1.2;
  const tap = follow + 0.7;
  return {
    cmt: words[0].start,
    follow,
    tap,
    flip: tap + 0.12,
    out: Math.max(tap + 1.4, words[words.length - 1].end + 0.4),
  };
}

// The word that answers this chapter's question (kapitel.js `antwort`) —
// its first use after 3 s: the question on screen nudges, dings and fades.
export function answerTime() {
  if (!KAPITEL.antwort) return null;
  const a = norm(KAPITEL.antwort);
  return WORDS.find((w) => w.start >= 3 && norm(w.w) === a)?.start ?? null;
}
// legacy name used by the shared engine / old scenes
export const payoffTime = answerTime;

// Bonus fact: the word "Übrigens" before the CTA ("WUSSTEST DU?" badge + sound).
export function factTime() {
  const end = CTA_START ?? WORDS.length;
  for (let i = end - 1; i >= 0; i--) if (/^übrigens$/i.test(WORDS[i].w)) return WORDS[i].start;
  return null;
}
