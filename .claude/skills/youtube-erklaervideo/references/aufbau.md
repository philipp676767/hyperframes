# Aufbau — the long script (10–12 min)

How the video is **built**; how it **talks** is `sprechstil.md` (read both
before writing — the TikTok `script-formel.md` sentence rules do not apply
here). Research basis (2026): YouTube measures how many viewers are still
there after **30 s** and rewards average view duration; the openings that
hold are the ones that **confirm the click** (the viewer sees and hears at
once what title and thumbnail promised), set the stakes, and then **say
plainly what the video will do** — successful German explainers
(Kurzgesagt, Terra X, Simplicissimus) all do that, in a calm narrator's
voice, without greeting or channel intro. A long-form intro is a short
scene + a promise, not a 3-second TikTok hook.

## Length and pace

- **≈ 1.500–1.600 words** in total at **2.5 words/s** (`prepare-voice.sh`
  RATE 2.5, pauses 0.3 s) → ≈ 10–10:45 min plus the 20-s end screen. The
  binding limit is the **ElevenLabs budget: 9 300–9 800 characters** in
  all `script.txt` (1 character = 1 credit; video total 9 500–10 000,
  `scripts/credits.py`).
- **Intro (chapter 0): 110–170 words, 40–70 s** (archive voices + scene + thesis + questions + framing + subscribe ask). Chapters: **150–220 words
  (60–90 s)**. Finale: 120–180 words.
- One chapter = one composition with its own `script.txt`: **one paragraph
  per line** (3–6 sentences).

## The intro (chapter 0) — the documentary formula

How tatsache, vince and Simplicissimus open every story video (transcripts
2026-11-17, `doku-vorbilder.md`), 40–70 s, in this order:

1. **Archive voices (≈ 0–10 s):** 1–3 short O-Töne that drop the viewer
   into the event before any narration — a news anchor, a radio call, a
   witness („Mindestens 100 Tote und über 200 Verletzte. Das ist die
   vorläufige Schreckensbilanz …“ / „Houston, wir haben ein Problem.“).
   Spoken by the **archive voice** (a second ElevenLabs voice, radio
   filter, `scripts/radio.sh`; lines starting with `»` in `script.txt`).
2. **„Es ist …“ — the scene (≈ 10–35 s):** „Es ist Mittwoch, der 3. Juni
   1998.“ Weekday, date, exact times („Um 10.33 Uhr verlässt der Zug
   Hannover.“), a place, ordinary people with name and age („der
   31-jährige Jörg D.“), an ordinary moment → the disturbance → **cut right
   before the climax** („Und dann geschieht zwei Minuten nach dem Knall das
   Unvorstellbare.“). Present tense, sober, concrete. It shows what the
   thumbnail promised.
   — For „Was passiert, wenn …?“ / „Wie funktioniert …?“ topics instead
   the Kurzgesagt opening: the question stated plainly, calm and a little
   witty („Heute wollen wir eine uralte, sehr wissenschaftliche Frage
   klären: …“).
3. **The thesis (1–2 sentences):** why this moment matters — „Es gibt
   Momente, die alles in ein Vorher und Nachher teilen. Dieser Mittwoch
   wird genau so einer sein.“
4. **2–3 guiding questions** — the threads the video will answer, in one
   breath: „Wie konnte …? Welche Rolle spielte …? Und was hat sich
   seitdem verändert?“ (the only place where several questions in a row
   are right).
5. **„Das ist die Geschichte …“** — one framing sentence with the search
   word („Das ist die Geschichte der ersten Mondlandung — und der zwölf
   Minuten, in denen sie fast gescheitert wäre.“). No title card — the
   picture stays free of text (`bild-16-9.md`).
6. **The subscribe ask (≈ 10 % of the video, see „CTA“)** — one friendly
   sentence right after the framing sentence, then chapter 1 starts with
   the background.

Never: „Hallo“, „Willkommen“, „Ich bin …“, the channel name, a recap of
the title word for word. The search word is spoken in the first ~20 s.

## Chapters (6–9) — story segments, not 60-s TikToks

Shape of each chapter (`sprechstil.md` „Chapter shape“): bridge / context
→ what happens → how it works (the science, one analogy played out) →
what it means → bridge into the next chapter.

- **Open threads instead of question cliffhangers.** The main question of
  the intro stays open until the finale; every chapter opens at least one
  new thread before it closes the old one — mostly as a statement („Was in
  Houston in diesem Moment niemand weiß: Der Computer ist längst
  überlastet.“), sometimes as a question (≤ 2–3 questions per chapter).
- **Escalation:** each chapter raises the stakes; the strongest moment
  goes to the re-hook and the finale.
- **Re-hook at ~50–60 %:** the moment it almost went wrong / the biggest
  surprise, announced with weight („Und jetzt kommen wir zu den zwölf
  Minuten, in denen die Mission fast gescheitert wäre.“).
- **Chapter titles** (`kapitel.js titel`, also the YouTube chapter marks):
  short and concrete, like a documentary's — „Die größte Rakete der Welt“,
  „Ein Computer aus Draht“, „Zwölf-null-zwei“.
- **The viewer's world** a few times per video, not every 30 s: „Dein
  Handy rechnet heute zwei Millionen Mal schneller.“

## CTA — early and in the middle, never only at the very end (user, 2026-11-15/17)

Few viewers are left in the last minute. The big documentary channels
ask early, when most viewers are still there (tatsache, ICE 884: right
after the intro at 2:49 of 24:36 ≈ 11 %), and never close on a long
appeal:

- **Subscribe ask — once, at the end of the intro (≈ 8–12 %)**, right
  after „Das ist die Geschichte …“, one friendly sentence: „Wenn du keine
  dieser Geschichten verpassen willst, abonniere den Kanal.“ / „Wenn ihr
  auch in Zukunft keine Videos verpassen wollt, dann abonniert gerne.“ The
  word is **„abonniere“** — never TikTok's „Folge für mehr Wissen“. (Second-best spot:
  after a payoff at 35–55 %, once.)
- **Comment question — once, at ~50–70 %**, right after the most
  debatable moment (a decision, „what would you have done“): „Hättest du
  an Bales' Stelle abgebrochen? Schreib's in die Kommentare.“
- Never more than once each, never both in one sentence, never in the
  finale.

## Finale — epilogue, not appeal

How the documentary channels end (Simplicissimus, tatsache, Kurzgesagt):

1. **The answer** to the main question, clearly, with calm weight (the
   `antwort` word).
2. **Epilogue — what became of them:** one or two sentences per person
   and per place („Neil Armstrong unterrichtet später als Professor und
   gibt kaum Interviews.“ / „Heute steht an der Stelle ein Denkmal.“).
3. **What remains today / what it means for you** (+ the „Übrigens“ fact,
   said naturally).
4. **A calm closing sentence** — an image or a thought, not a summary
   („Aber immerhin können sie in der Zwischenzeit wunderschöne Ringe am
   Himmel bewundern.“).
5. **The last line = the pointer to the next video** (end screen), then
   ~20 s of calm picture. No subscribe ask, no comment question here.

## Picture rhythm (with `bild-16-9.md`)

- A change in the picture every **8–20 s** (a cut, a camera move, a new
  object); calmer shots are fine while the narrator explains.
- A **money shot every 2–3 min**; let it breathe (slow camera, sound),
  don't cut away after 2 s.
- **No TikTok editing:** no zoom-punch, no whoosh on every cut, **no text on
  the picture** except name tags with arrows (`bild-16-9.md`).

## Word count for `plan.md`

| Part                       | Words           | Speech (2.5 w/s)     |
| -------------------------- | --------------- | -------------------- |
| Intro                      | 110–170         | 40–70 s              |
| 7 chapters                 | 7 × 160–185     | 7 × 64–74 s          |
| Finale (+ 20-s end screen) | 120–180         | 48–72 s + ~12 s      |
| **Sum**                    | **1.500–1.600** | **≈ 10:00–10:45**    |
| **Characters = credits**   | **9 300–9 800** | `scripts/credits.py` |

## Self-check before the voice (every chapter + once for the whole)

- [ ] Whole: 1.500–1.600 words and `credits.py` OK (9 300–9 800 characters); intro 40–70 s; 6–9 chapters of 60–120 s; finale with the 20-s end screen
- [ ] Intro: archive voices → „Es ist <Wochentag>, der <Datum>.“ scene cut before the climax → thesis → 2–3 guiding questions → „Das ist die Geschichte …“ → one subscribe sentence. No greeting or channel intro
- [ ] Search word spoken in the first ~15 s, in the title, first word of the description
- [ ] Sounds like a documentary narrator read aloud (`sprechstil.md` self-check): flowing sentences, paragraphs, few questions, signposting
- [ ] Every chapter: context → event → science (one analogy) → meaning → bridge; threads always open, main question open until the finale
- [ ] Re-hook at ~50–60 % announced with weight
- [ ] CTA: one „abonniere …“ at the end of the intro (≈ 10 %), one comment question + „Schreib's in die Kommentare.“ at ~50–70 %; nothing in the finale; no „Folge für mehr Wissen“
- [ ] Finale: answer → epilogue (what became of the people / places) → what remains today (+ Übrigens) → calm closing sentence → pointer to the next video
- [ ] Facts: ≥ 15 checked facts in `plan.md` with a source; uncertain things phrased safely; quotes marked as quotes
- [ ] ≤ 2 terms per chapter, each explained in the sentence; numbers with a scale
- [ ] 0–2 delivery tags per chapter
