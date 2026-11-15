// Word timings + chapter settings as plain data: no three.js and no DOM, so
// the same file runs in the page (world.js re-exports it) and in node
// (scripts/build-sfx.mjs, scripts/sync-html.mjs read the beats).
//
// One chapter = one composition (skill youtube-erklaervideo). Its settings
// live in assets/kapitel.js (window.HF_KAPITEL), its words in assets/words.js.
function KAPITEL_RAW() {
  return globalThis.window.HF_KAPITEL ?? {};
}
const WORDS = globalThis.window.HF_WORDS;
// start of the last script line; in the end chapter = the end-screen line
// (pointer to the next video), whose start opens the 20-s end screen
const CTA_START = KAPITEL_RAW().ende ? globalThis.window.HF_CTA_START : null;
export const KAPITEL = KAPITEL_RAW();
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
// first word of the end-screen line (end chapter only)
export const CTA = CTA_START != null ? WORDS[CTA_START].start : null;
// Chapter length, frame-exact (the chapters are joined without re-encoding):
// a normal chapter ends `tail` s after its last word (default 0.6 — the
// breath before the next chapter); the end chapter runs until the CTA line
// started ENDSCREEN s ago (calm, moving picture under YouTube's end screen).
// rounded up to 0.1 s = 3 whole frames, a clean number in index.html
const frames = (s) => Math.ceil(s * 10 - 1e-6) / 10;
// the intro's title card (kapitel.js titelBei) stays ~3.2 s and fades out
const normT = (x) => x.toLowerCase().replace(/[^a-zäöüß0-9-]/g, "");
export const TITLE =
  !KAPITEL.nr && KAPITEL.titelBei
    ? (WORDS.find((w) => normT(w.w) === normT(KAPITEL.titelBei))?.start ?? null)
    : null;
export const DURATION = KAPITEL.ende
  ? frames(Math.max(LAST + 3, (CTA ?? LAST) + ENDSCREEN))
  : frames(Math.max(LAST + (KAPITEL.tail ?? 0.6), TITLE != null ? TITLE + 4 : 0));
export const END = DURATION;
// start of the end screen (null in normal chapters)
export const ENDSCREEN_FROM = KAPITEL.ende ? DURATION - ENDSCREEN : null;
// kept for the shared engine: chapters never loop
export const LOOP = null;

// Start times of the words marked *like this* in script.txt (yellow caption
// word + camera punch-in + "punch" sound).
export const HL = WORDS.filter((w) => w.hl).map((w) => w.start);

// CTA moments (2026-11-15: in the MIDDLE of the video, never at the very end
// — few viewers are left there). Any chapter may hold them; the same rules
// as the pill timeline in index.html:
//   - subscribe: the red "Abonnieren" pill pops on the first word starting
//     with "abonnier", is tapped 0.7 s later, flips to "Abonniert" (+0.12 s)
//     and leaves 0.6 s after that sentence (at least 1.6 s after the tap);
//   - comment: the white "Kommentieren" pill pops when the question before
//     „Schreib's in die Kommentare.“ starts and leaves 1.2 s after that sentence.
function sentenceOf(i) {
  let a = i;
  while (a > 0 && WORDS[a - 1].br !== 2) a--;
  let b = i;
  while (b < WORDS.length - 1 && WORDS[b].br !== 2) b++;
  return [WORDS[a].start, WORDS[b].end];
}
export function ctaTimes() {
  const si = WORDS.findIndex((w) => /^abonnier/i.test(w.w));
  const ci = WORDS.findIndex((w) => /^kommentar/i.test(w.w));
  if (si < 0 && ci < 0) return null;
  const out = {};
  if (si >= 0) {
    const [, e] = sentenceOf(si);
    out.sub = WORDS[si].start;
    out.tap = out.sub + 0.7;
    out.flip = out.tap + 0.12;
    out.subOut = Math.max(out.tap + 1.6, e + 0.6);
  }
  if (ci >= 0) {
    // the pill pops with the question right before „Schreib's in die Kommentare.“
    const [a0, e] = sentenceOf(ci);
    const k = WORDS.findIndex((w) => w.start >= a0);
    const a = k > 0 ? sentenceOf(k - 1)[0] : a0;
    out.cmt = a;
    out.cmtOut = Math.max(a + 2.5, e + 1.2);
  }
  return out;
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

// Bonus fact: the word "Übrigens" ("WUSSTEST DU?" badge + sound), before the
// end-screen line in the end chapter.
export function factTime() {
  const end = CTA_START ?? WORDS.length;
  for (let i = end - 1; i >= 0; i--) if (/^übrigens$/i.test(WORDS[i].w)) return WORDS[i].start;
  return null;
}
