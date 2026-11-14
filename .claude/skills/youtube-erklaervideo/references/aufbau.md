# Aufbau — the long script (10–12 min, retention first)

The TikTok script formula (`.claude/skills/bau-erklaervideo/references/script-formel.md`)
still holds sentence by sentence: Du-Form, cheeky friend, no filler words,
the banned phrases, keywords, delivery tags, "Simple first", humour rules,
facts checked. This file says what a **10–12-minute YouTube video** adds and
changes. Research basis (YouTube retention, 2026): YouTube measures how
many viewers are still there after **30 s** (aim ≥ 70 %), the typical
drop at **~50–60 %** (the middle sag), and rewards average view duration
more than clicks.

## Length and pace

- **1.700–1.950 words** in total (Jan calmer than on TikTok: **2.7–2.9
  words/s**, `prepare-voice.sh` brings every chapter to 2.8) → 10–12 min
  plus the 20-s end screen.
- **Hook chapter (0:00–0:30): 70–85 words.** Chapters: **170–330 words
  (60–120 s)**. Finale: payoff + Übrigens + CTA, 80–150 words.
- One chapter = one composition with its own `script.txt` (one part per
  line, the last line of a normal chapter = the open question).

## Shape

**„Große Momente“ (the main topic type)** use the same shape as a story:
the hook opens on the most dramatic second, the chapters go in time
order and end on cliffhangers, the re-hook is the moment it almost went
wrong, the finale answers the main question and says what it means for
the viewer today. Every chapter still explains the science (how the
machine worked) — rules in `themen.md` §2 „Große Momente“.

| Part                     | When                         | Job                                                                                                                                                                                                                                                     |
| ------------------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hook** (chapter 0)     | 0:00–0:30                    | 0–10 s: prove the promise of title + thumbnail with a real example — the spectacle in frame 0. 10–20 s: why it concerns **you** (gain / danger). 20–30 s: in one concrete sentence what comes (no "Gleich erfährst du …"). Opens the **main question**. |
| **Chapters 1 … n** (6–9) | 60–120 s each                | Mini-hook (a question) → explanation (one core idea) → mini-resolution → **an open question that pulls into the next chapter** (the last line, ends with "?").                                                                                          |
| **Re-hook**              | ~50–60 % (chapter ≈ n/2 + 1) | The most surprising twist of the whole video, said as a statement about the thing ("Und dann merkst du: Das war erst die harmlose Hälfte."). Opens the biggest loop.                                                                                    |
| **Finale** (`ende`)      | last 1–2 min                 | The answer to the main question (only now!) → "Übrigens: …" bonus fact → last line: comment question + „Schreib's in die Kommentare.“ + pointer to the next video + „Folge für mehr Wissen.“ → 20-s end screen.                                         |

### Hook — the first 30 seconds decide the video

- **No intro, no logo, no greeting, no "Abonniert", no "In diesem Video …",
  no channel name.** Sentence 1 is the claim with the spectacle already
  happening (`sync-html.mjs` warns: first sentence ≤ 3.5 s).
- **0–10 s = the thumbnail come true.** Whatever the title and thumbnail
  promise ("Der Mond kracht in die Erde"), the viewer sees and hears it at
  once — a concrete example, not a summary. The search word is spoken in
  the first 10 s.
- **10–20 s = "dein"**: what the viewer gains or risks (money, safety,
  health, the everyday thing in their hand) — true, never clickbait.
- **20–30 s = the road map in ONE concrete sentence** that names the
  stations as curiosities, not as a table of contents: „Wir gehen von der
  ersten Sekunde bis zum letzten Menschen auf der Erde – und eine Stelle
  davon ist schlimmer als der Einschlag.“ Never "Gleich erfährst du …",
  "Bleib dran", "Am Ende …".
- Hook lab as on TikTok (six hooks, six formulas, score ≥ 10/12), plus:
  _does 0–10 s show exactly what the thumbnail shows?_
- No `[whispers]` in the hook; `[excited]` / `[curious]` / `[surprised]`.

### Chapters — the open-loop chain

- **Every chapter starts with its mini-hook** — a question or a strange
  fact in the first sentence („Warum wird es nach dem Einschlag erst mal
  _dunkel_?“). It goes into `kapitel.js` `frage` (on screen, ≤ 7 words) and
  its answer word into `antwort`.
- **One core idea per chapter, in one sentence** („Der Trick ist: \_\_\_.“),
  explained with an everyday comparison, max **2 technical terms** and ~2–3
  numbers per chapter, each number with a comparison.
- **Mini-resolution** before the chapter ends — the chapter's own question
  is answered (ding + nudge on screen).
- **Last line = the open question** that the next chapter answers — never
  all questions closed at once. The main question stays open until the
  finale. Keep a **loop map** in `plan.md`: which question is open from
  when to when; at every moment at least one loop is open, a new one opens
  _before_ the last one closes.
- **Escalation**: every chapter bigger than the one before; the strongest
  facts go to the re-hook and the finale, the weakest first.
- **The viewer's life** every ~30–40 s ("dein Handy", "wenn du morgen …").
- **"Rate mal" moments**: 2–3 per video, answered 3–5 s later with a
  display + highlight — they drive comments.
- **No end signal** before the finale: no summary, no "fertig", no
  "zusammengefasst".
- **Humour** 1 small moment per 2–3 chapters, as on TikTok.

### Picture rhythm (plan it with the script)

- **Every 8–20 s something changes in the picture**: a cut, a camera move,
  a new object, a slowmo, a display, a label. A shot never stands longer
  than 20 s; most last 5–12 s.
- **Every 2–3 min a big money shot** (the spectacle the chapter promised,
  shown — not told): 4–6 per video, one of them in frame 0, one at the
  re-hook, one in the finale.
- Keywords `*Wort*`: about one every 15–20 s (sync-html checks per chapter).
- Labels: one at a time, 1–3 per chapter.

### Finale

- The **answer to the main question** in one clear, punchy sentence with the
  `antwort` word; then straight to „Übrigens: …“ (the strongest fact you
  have left, true, 10–15 words).
- **The last line** (one line in `script.txt`):
  comment question (new, 1–3-word answer, never a photo request)
  - „Schreib's in die Kommentare.“ + one sentence pointing to the next
    video („Wie X funktioniert, siehst du in diesem Video.“ — it plays on the
    end screen) + **„Folge für mehr Wissen.“** as the very last words (spoken
    quickly). No other word starting with "folg" anywhere in the video
    (write „Konsequenz“, „danach“).
- After the line: **~11–15 s of calm, moving picture without text** (the
  end chapter is long enough that the CTA line plus this picture = the
  last 20 s, `timing.js ENDSCREEN`). YouTube's end-screen elements sit in
  the middle (y 260–760 px): nothing written there.

## Word count, in one table for `plan.md`

| Chapter                    | Words           | Speech (2.8 w/s)  |
| -------------------------- | --------------- | ----------------- |
| Hook                       | 70–85           | 25–30 s           |
| 7 chapters                 | 7 × 210–240     | 7 × 75–86 s       |
| Finale (+ 20-s end screen) | 100–140         | 36–50 s + ~12 s   |
| **Sum**                    | **1.700–1.950** | **≈ 10:15–11:50** |

## Self-check before the voice (every chapter + once for the whole)

- [ ] Whole: 1.700–1.950 words; hook ≤ 30 s; 6–9 chapters of 60–120 s; finale with the 20-s end screen
- [ ] Hook: 0–10 s proves the title/thumbnail promise with a shown example; 10–20 s „dein“ gain / danger; 20–30 s one concrete road-map sentence; no intro, greeting, logo, "Abonniert", "Gleich erfährst du"
- [ ] Search word spoken in the first 10 s, in the title, first word of the description
- [ ] Every chapter: mini-hook question first, one core idea, mini-resolution, last line = open question (ends with "?")
- [ ] Loop map: always ≥ 1 open loop; the main question open until the finale
- [ ] Re-hook at ~50–60 % with the most surprising twist
- [ ] A picture change every 8–20 s planned; a money shot every 2–3 min
- [ ] ≤ 2 terms per chapter, numbers with comparisons, one information per sentence, no filler words, no banned phrases
- [ ] Finale: answer → „Übrigens“ → comment question + „Schreib's in die Kommentare.“ + next-video pointer + „Folge für mehr Wissen.“; no other "folg…" word
- [ ] Facts: ≥ 15 checked facts in `plan.md` with a source; uncertain things phrased safely
- [ ] 3–6 delivery tags per chapter, never two in a row, no `[whispers]` in the hook
