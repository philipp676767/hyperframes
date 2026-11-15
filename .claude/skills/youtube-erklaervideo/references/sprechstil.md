# Sprechstil — how a YouTube explainer talks (not a long TikTok)

**Why this file exists** (user, 2026-11-15, after YouTube #1 Apollo 11):
_„Es wirkt viel zu sehr wie ein langes TikTok-Video.“_ The Apollo script
used the TikTok sentence rules for 10 minutes: one fact per short sentence,
a question every few lines, `[curious]`/`[excited]` on almost every line,
punch words („Der Trick:“, „Zack.“). On TikTok that holds a scroller for
45 s; over 10 minutes it sounds breathless and choppy, like a list of
captions read aloud. **The TikTok `script-formel.md` sentence rules do NOT
apply to this skill** — this file replaces them. (Kept from TikTok: Du-Form
where the viewer is addressed, facts checked, no filler words, one idea at
a time, everyday comparisons.)

Research basis — transcripts of successful German long-form explainers on
the same kind of topics (2026-11-15):

- **Dinge Erklärt – Kurzgesagt**, „Was passiert, wenn der Mond in die Erde
  kracht?“ (5,1 Mio., 12 min): opens „Heute wollen wir eine uralte, sehr
  wissenschaftliche und superwichtige Frage klären: Was würde passieren,
  wenn …? Die Antwort ist sogar noch spannender, als du vielleicht denkst
  — aber mal von vorne: Warum stürzt der Mond eigentlich nicht ab?“ Then
  calm, connected explanation with one long analogy (throwing a ball →
  orbit), time markers as structure („Nach zwei Monaten …“, „Dritter
  Monat.“), dry humour („Jetzt noch am Leben zu sein, macht keinen
  Spaß.“), very few questions, no CTA at all, a closing image.
- **Terra X History**, „5 Gründe, warum die Mondlandung fast gescheitert
  wäre“ (430 K, 15 min): thesis + „Aber …“ + an explicit promise („Hier
  kommen die Gründe, warum …“), then archive sound of the countdown,
  narration in the historic present („Als am 16. Juli 1969 die Rakete …
  startet, ist die ganze Welt in Aufruhr.“), signposting between parts
  („Doch damit kommen wir direkt zu Problem Nummer 2: die Technik.“),
  quotes of witnesses, at the end an outlook to today + a question to the
  viewers + the end-screen videos + „Danke fürs Zuschauen“.
- **Simplicissimus**, „Stuxnet: Der krasseste Hack aller Zeiten“ (2,7 Mio.,
  18 min): **cold open** — a place described in the present tense (the
  underground plant, the centrifuges), a mystery („… stehen vor einem
  Rätsel“), the stakes, a turn („Es ist unmöglich, hier reinzukommen. Oder
  vielleicht doch nicht?“) → title + music sting → the story starts from
  the beginning with people and places. Terms explained inline („so nennt
  man …“). ~2,1 words/s.

## The voice

- **A narrator, not a buddy on the phone.** Calm, warm, curious, a little
  dry humour — someone who knows the story and enjoys telling it. Not
  cheeky-loud. „wir“ for the journey („Schauen wir uns an …“, „Um das zu
  verstehen, müssen wir kurz zurück ins Jahr 1961.“), „du“ when the viewer
  is addressed directly („Dein Handy hat heute zwei Millionen Mal mehr
  Speicher.“).
- **Sentences that flow.** Average **12–18 words**, mixed lengths, joined
  with „weil“, „während“, „als“, „doch“, „dadurch“, „sodass“. **Paragraphs
  of 3–6 sentences** around one thought (one paragraph = one line in
  `script.txt`). A short punch sentence (≤ 5 words) is a spice: at most one
  per paragraph, and never several in a row.
- **Few questions.** A question is a turning point, not punctuation: **at
  most 2–3 per chapter**, and when you ask, answer in the same paragraph or
  the next one. Never a question at the end of every paragraph, never
  „Rate mal“.
- **Signposting instead of cliffhanger-questions.** The viewer always knows
  where we are: „Doch damit fängt das eigentliche Problem erst an.“, „Bevor
  wir zur Landung kommen, müssen wir verstehen, wie dieser Computer
  denkt.“, „Vier Tage später …“. Chapter transitions are spoken bridges
  (a statement that opens the next question), varied — not „Aber was
  passiert dann?“ every time.
- **Story beats for history topics:** historic present tense („Am 16. Juli
  1969 startet …“), concrete time and place, real people with name and role
  („Steve Bales, 26 Jahre alt, sitzt im Kontrollzentrum.“), what they see,
  hear and decide, short quotes (spoken by Jan, introduced: „Armstrong funkt
  nach Houston: …“), time markers as structure.
- **Explain inside the story, with room.** A term is introduced in the
  sentence: „… ein sogenannter Zero-Day — eine Schwachstelle, die noch
  niemand kennt.“ An analogy may take **2–4 sentences** and be played out
  (Kurzgesagt's ball throw). Numbers get a scale („74 Kilobyte — weniger
  als ein einziges Foto auf deinem Handy“), but not every sentence needs a
  number.
- **Humour:** dry understatement, after a fact has landed, 1–2 per video
  („Die letzten Monate lassen sich leicht zusammenfassen: Jetzt noch am
  Leben zu sein, macht keinen Spaß.“). Never in serious moments.
- **Delivery tags:** the base tone is calm; **0–2 tags per chapter**, only
  where the moment changes (`[serious]` / `[whispers]` before a tense
  moment, `[excited]` at the landing, `[laughs softly]` after a joke). No
  `[curious]` before every question.
- **Pace:** **2.4–2.6 words/s** (`prepare-voice.sh` RATE 2.5, pauses 0.3 s
  — documentary narrators speak ~2.1–2.5 incl. breaths; TikTok 3.1).

## Banned TikTok-isms in long form (`sync-html.mjs` warns)

„Folge für mehr Wissen“ (say „abonniere“), „Rate mal“, „Zack“, „Krass“, „Der Trick:“ / „Hier kommt der Trick“, „Stell
dir vor“ more than once per video, chains of 1–4-word sentences, a question
as the last sentence of most paragraphs, `[excited]` on line 1 of every
chapter, keywords in every second sentence.

## Before / after (Apollo 11, hook)

TikTok style (what YouTube #1 had):

```text
[excited] *Apollo 11* – kurz vor dem Mond schrillt ein *Alarm*.
Code Zwölf-null-zwei. Den kennt keiner an Bord. Und der Treibstoff reicht nur noch für Sekunden.
Der Computer, der hier steuert, hat weniger Speicher als ein einziges Foto auf deinem *Handy*.
```

YouTube style:

```text
Es ist der 20. Juli 1969, und die Mondfähre Eagle sinkt dem Mond entgegen. Noch rund zehn Kilometer. Neil Armstrong und Buzz Aldrin stehen dicht nebeneinander in einer Kabine, die kaum größer ist als eine Telefonzelle, als plötzlich ein Warnton losgeht. Auf dem kleinen Display erscheint eine Zahl, die keiner der beiden je gesehen hat: Zwölf-null-zwei.
In Houston verfolgen hunderte Ingenieure jede Sekunde dieses Landeanflugs, und keiner von ihnen weiß in diesem Moment, ob die Landung abgebrochen werden muss. Dabei ist der Computer, an dem gerade alles hängt, schwächer als jeder Taschenrechner, den du heute kaufen kannst.
Dass die beiden trotzdem landen, ist kein Zufall — es ist das Ergebnis von acht Jahren, in denen fast alles schiefgehen konnte. Genau diese acht Jahre schauen wir uns heute an: von der größten Rakete, die je gebaut wurde, über einen Computer, der aus Kupferdraht gewebt war, bis zu den letzten Sekunden Treibstoff.
Aber mal von vorne.
```

## Chapter shape (YouTube style)

1. **Bridge / context** (1 paragraph): where and when we are, who acts,
   what is at stake now.
2. **What happens** (1–3 paragraphs): the event, told with detail.
3. **How it works** (1–2 paragraphs): the science in plain words, one
   analogy played out, ≤ 2 terms.
4. **What it means** (1 paragraph): consequence, a number with scale, maybe
   a dry remark.
5. **Bridge into the next chapter** (1–2 sentences): a statement that opens
   the next thread — sometimes a question, mostly not.

## Self-check (in addition to `aufbau.md`)

- [ ] Read one chapter aloud: does it sound like a documentary narrator, or like captions? Average sentence 12–18 words, paragraphs of 3–6 sentences
- [ ] ≤ 2–3 questions per chapter, each answered; no question at the end of most paragraphs
- [ ] Signposting at every chapter start and end; transitions varied
- [ ] History topics: historic present, dates, places, names + roles, 1–3 short quotes per video
- [ ] 0–2 delivery tags per chapter; no `[curious]` before every question
- [ ] None of the banned TikTok-isms
