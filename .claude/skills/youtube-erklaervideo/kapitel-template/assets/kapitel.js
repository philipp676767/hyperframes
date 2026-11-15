// This chapter's settings (skill youtube-erklaervideo). Read by index.html
// (chapter tag, question, hook title), assets/timing.js (length) and the
// scripts (sounds, checks). Plain data, no DOM.
window.HF_KAPITEL = {
  nr: 0, // 0 = the hook (0:00–0:30), 1 … n = chapters; the end chapter has `ende: true`
  titel: "Licht aus Draht", // short + curious, also the YouTube chapter name in the description
  // chapter 0 only: the title card (video title, keyword in <em>) and the
  // spoken word it appears on — after the cold open + promise, usually „von“
  // in „Aber mal von vorne.“ (references/aufbau.md „The intro“)
  hookTitel: "Licht aus <em>Draht</em>",
  titelBei: "vorne",
  // optional: an open question shown at the top (≤ 7 words, keyword in <em>)
  // and the spoken word that answers it — long form mostly leaves it empty
  frage: "",
  antwort: "",
  ende: false, // true = end chapter: CTA pills + 20 s end-screen picture
  tail: 0.6, // seconds after the last word (normal chapters)
};
