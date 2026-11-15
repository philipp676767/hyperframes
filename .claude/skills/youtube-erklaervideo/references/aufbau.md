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

- **1.500–1.750 words** in total at **2.5 words/s** (`prepare-voice.sh`
  RATE 2.5, pauses 0.3 s) → 10–12 min plus the 20-s end screen.
- **Intro (chapter 0): 90–130 words, 35–55 s.** Chapters: **150–300 words
  (60–120 s)**. Finale: 120–180 words.
- One chapter = one composition with its own `script.txt`: **one paragraph
  per line** (3–6 sentences).

## The intro (chapter 0) — cold open, promise, title

Three parts, 35–55 s together:

1. **Cold open (≈ 0–25 s):** drop the viewer into the most tense / most
   spectacular moment of the story — a place, a time, people, what happens
   right now — told in the present tense, with concrete detail. It _is_ the
   thumbnail come true (confirm the click in the first seconds). It ends on
   the open tension, not on the answer. (Simplicissimus: the plant, the
   broken centrifuges, „unmöglich, hier reinzukommen — oder vielleicht doch
   nicht?“)
   — or, for „Was passiert, wenn …?“ / „Wie funktioniert …?“: the
   **question stated plainly** in a calm, witty way (Kurzgesagt: „Heute
   wollen wir eine uralte, sehr wissenschaftliche und superwichtige Frage
   klären: …“).
2. **Why it matters + the promise (≈ 25–45 s):** one or two sentences on
   why this is bigger than it looks / what it has to do with the viewer,
   then **say what the video does** — concretely, naming 2–3 stations as
   curiosities: „Genau diese acht Jahre schauen wir uns heute an: von der
   größten Rakete, die je gebaut wurde, über einen Computer aus gewebtem
   Kupferdraht bis zu den letzten Sekunden Treibstoff.“ / „Hier kommen die
   Gründe, warum …“. This road map is wanted on YouTube (it tells the
   viewer the video is worth 10 minutes) — it is not a TikTok "promise
   phrase".
3. **Title + „Aber mal von vorne.“ (≈ 45–55 s):** a short bridge
   sentence, then the **title card** (the video title calm and centred for
   ~3 s, `kapitel.js titelBei` = the word where it appears, a soft sound),
   and chapter 1 starts with the context.

Never: „Hallo“, „Willkommen“, „Ich bin …“, channel name, „Abonniert“ /
„Lass ein Like da“ at the start, a sponsor before the promise, a recap of
the title word for word. The search word is spoken in the first ~15 s.

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

## CTA — in the middle, never only at the very end (user, 2026-11-15)

Few viewers are still there in the last minute (the TikTok data showed
the same: ~20 % before the end CTA, 5 % after it), so the asks go where
most viewers still watch, **right after a payoff** — when the viewer has
just got something and the next thread is already open:

- **Subscribe ask — once, at ~35–55 %**, at the end of a chapter after its
  mini-resolution, in one or two natural sentences in the narrator's
  voice, keeping the open thread alive: „Bevor wir zum Mond fliegen: Wenn
  dir solche Geschichten gefallen, abonniere den Kanal — die zwölf Minuten
  über dem Mond kommen gleich.“ The word is **„abonniere“** (YouTube's
  button says „Abonnieren“) — never TikTok's „Folge für mehr Wissen“. The
  red „Abonnieren“ pill pops on „abonniere“ and flips to „Abonniert“.
- **Comment question — once, at ~50–70 %**, right after the most
  debatable moment (a decision, a „what would you do“): „Hättest du an
  Bales' Stelle abgebrochen? Schreib's in die Kommentare.“ — the question
  directly before „Schreib's in die Kommentare.“ (the „Kommentieren“ pill
  pops with the question). An opinion or the viewer's own experience,
  answerable in a few words.
- Never in the intro (no „Abonniert“ before the viewer got anything),
  never more than once each, never both in the same sentence.
- The finale only points to the next video (end screen).

## Finale

1. **The answer to the main question** — the moment resolved, clearly and
   with calm weight (the `antwort` word).
2. **Outlook: what it means today** (1 paragraph) — for history topics the
   line to the viewer's life; the „Übrigens“ bonus fact fits here as one
   surprising last fact, said naturally („Übrigens: Die Fußabdrücke sind
   heute noch da.“) — keep the badge or drop it, but not as a TikTok punch.
3. **The last line = the pointer to the next video** on the end screen
   („Wie Apollo 13 trotzdem heimkam, siehst du in diesem Video.“). No
   subscribe ask and no comment question here — they came in the middle.
4. **20-s end screen:** calm, moving picture without text in the middle.

## Picture rhythm (with `bild-16-9.md`)

- A change in the picture every **8–20 s** (a cut, a camera move, a new
  object); calmer shots are fine while the narrator explains.
- A **money shot every 2–3 min**; let it breathe (slow camera, sound),
  don't cut away after 2 s.
- **No TikTok editing:** no zoom-punch on keywords, no whoosh on every cut,
  no big text pops. Keywords stay yellow in the captions, quietly.

## Word count for `plan.md`

| Part                       | Words           | Speech (2.5 w/s)  |
| -------------------------- | --------------- | ----------------- |
| Intro                      | 90–130          | 35–55 s           |
| 7 chapters                 | 7 × 170–200     | 7 × 68–80 s       |
| Finale (+ 20-s end screen) | 120–180         | 48–72 s + ~12 s   |
| **Sum**                    | **1.500–1.750** | **≈ 10:15–11:45** |

## Self-check before the voice (every chapter + once for the whole)

- [ ] Whole: 1.500–1.750 words; intro 35–55 s; 6–9 chapters of 60–120 s; finale with the 20-s end screen
- [ ] Intro: cold open in the present tense (or the plain question) that shows the thumbnail promise at once → why it matters → a concrete road map with 2–3 stations → „Aber mal von vorne.“ + title card. No greeting, channel intro or subscribe ask
- [ ] Search word spoken in the first ~15 s, in the title, first word of the description
- [ ] Sounds like a documentary narrator read aloud (`sprechstil.md` self-check): flowing sentences, paragraphs, few questions, signposting
- [ ] Every chapter: context → event → science (one analogy) → meaning → bridge; threads always open, main question open until the finale
- [ ] Re-hook at ~50–60 % announced with weight
- [ ] CTA in the middle: one „abonniere …“ at ~35–55 % after a payoff, one comment question + „Schreib's in die Kommentare.“ at ~50–70 %; none in the intro; no „Folge für mehr Wissen“
- [ ] Finale: answer → what it means today (+ Übrigens) → pointer to the next video (end screen)
- [ ] Facts: ≥ 15 checked facts in `plan.md` with a source; uncertain things phrased safely; quotes marked as quotes
- [ ] ≤ 2 terms per chapter, each explained in the sentence; numbers with a scale
- [ ] 0–2 delivery tags per chapter
