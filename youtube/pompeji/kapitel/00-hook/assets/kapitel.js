// This chapter's settings (skill youtube-erklaervideo). Read by assets/timing.js
// (length) and the scripts (checks, chapter marks). Plain data, no DOM.
// No text is shown on the picture (2026-11-17) — `titel` is only the YouTube
// chapter name in the description.
window.HF_KAPITEL = {
  nr: 0, // 0 = the intro, 1 … n = chapters; the end chapter has `ende: true`
  titel: "Der Berg reißt auf", // short + curious, also the YouTube chapter name in the description
  ende: false, // true = end chapter: its last line opens the 20-s end-screen picture
  tail: 0.6, // seconds after the last word (normal chapters)
};
