// This chapter's settings (skill youtube-erklaervideo). Read by index.html
// (chapter tag, question, hook title), assets/timing.js (length) and the
// scripts (sounds, checks). Plain data, no DOM.
window.HF_KAPITEL = {
  nr: 0, // 0 = the hook (0:00–0:30), 1 … n = chapters; the end chapter has `ende: true`
  titel: "Alarm über dem Mond", // short + curious, also the YouTube chapter name in the description
  // hook chapter only: the 2–3 huge words on frame 0 (keyword in <em>)
  hookTitel: "<em>Alarm</em> am Mond",
  // the chapter's open question on screen (≤ 7 words, keyword in <em>) and the
  // spoken word that answers it (its first use after 3 s)
  frage: "Warum sind sie nicht <em>abgestürzt</em>?",
  antwort: "abgestürzt",
  ende: false, // true = end chapter: CTA pills + 20 s end-screen picture
  tail: 0.6, // seconds after the last word (normal chapters)
};
