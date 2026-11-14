// This chapter's settings (skill youtube-erklaervideo). Read by index.html
// (chapter tag, question, hook title), assets/timing.js (length) and the
// scripts (sounds, checks). Plain data, no DOM.
window.HF_KAPITEL = {
  nr: 4, // 0 = the hook (0:00–0:30), 1 … n = chapters; the end chapter has `ende: true`
  titel: "Allein hinterm Mond", // short + curious, also the YouTube chapter name in the description
  // the chapter's open question on screen (≤ 7 words, keyword in <em>) and the
  // spoken word that answers it (its first use after 3 s)
  frage: "Wer bleibt <em>allein</em> zurück?",
  antwort: "Collins",
  ende: false, // true = end chapter: CTA pills + 20 s end-screen picture
  tail: 0.6, // seconds after the last word (normal chapters)
};
