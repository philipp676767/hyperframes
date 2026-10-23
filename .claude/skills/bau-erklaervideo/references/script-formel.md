# Script-Formel (v2 — retention first)

Feedback on episode 1 (fridge) from an experienced creator: the script was
flat, the hook weak, nothing kept people watching. v2 writes for **watch
time**: a hook that wins the first 2 seconds, an open loop that is only
closed at the end, re-hooks in the middle, and a CTA that makes people
comment. The build-it-yourself frame ("Du hast gerade X gebaut") stays —
it's the series signature.

## Length

**110–122 words including fact, CTA and loop line** (≈ 42–46 s video), never more than
**128** (≈ 49 s) and never fewer than **105** (≈ 40 s).
Expected length = words ÷ 2.7 + 1.2 s (measured with Jan, the house voice). Count before showing the script.

## Shape

| Part                            | Words               | Job                                                                   |
| ------------------------------- | ------------------- | --------------------------------------------------------------------- |
| **Hook** (line 1)               | 15–22               | win the first 2 s, open a loop                                        |
| **Beats** (lines 2–4)           | 3 beats, 18–25 each | build the thing; each beat ends pulling into the next                 |
| **Payoff + signature** (line 5) | ~10–15              | close the hook's loop, then "Schau dich an. Du hast gerade X gebaut." |
| **Bonus fact** (same line 5)    | 10–15               | "Übrigens: …" — one surprising, shareable fact                        |
| **CTA** (line 6)                | 12–18               | comment question + follow                                             |
| **Loop bridge** (last line)     | 2–4                 | `> Und merk dir:` — runs straight back into the hook                  |

### 1. Hook — the first sentence decides everything

Feedback on #10 (Fliegender Tesla, 2026-10-22): _"Warum sollte man das
Video lange schauen? Das sollte am Anfang klar sein."_ "Lass ihn uns
bauen" is not a reason to stay. So the hook has two jobs:

1. **Spektakel / Behauptung** — the most surprising thing about the
   topic, which the first frame _shows_ (the car driving upside down on a
   ceiling, the microwave sparking, the fridge's hot back).
2. **Das Versprechen** — say what the viewer gets by staying:
   "Gleich weißt du, wie." / "Am Ende baust du ihn selbst." / "Und der
   Trick dahinter ist simpel." Then (optionally) "Lass ihn uns bauen."
   **Never name a number of seconds** ("In 40 Sekunden weißt du, wie" —
   the user's rule, 2026-10-23): it reminds people how long they still
   have to watch. Say "gleich" instead.

**The twist in the first 4 words, sentence 1 ≤ 8 words.** By ~1.2 s
the viewer must have heard the surprising part: "Dein Herd wird nie heiß."
not "Wenn du einen Topf auf deinen Herd stellst, …". (Most viewers leave
in the first seconds — 2026-10-23.)

Before showing a hook, ask honestly: _would a stranger scrolling at 1 a.m.
stop for this?_ If the answer needs context ("there's a Tesla that
flies"), the hook has to give it in the first sentence.

Rules:

- **The topic noun in the first 5 words.** No "Wenn du …"-wind-up, no
  greeting, no "Heute zeige ich dir".
- **Sentence 1 ≤ 8 words, the twist within the first 4** and it must do one of: break a belief, state
  an unbelievable fact, ask a question the viewer has _felt_ but never
  answered, or show stakes.
- **Sentence 2 = the promise, with a reason to stay**: "Gleich weißt
  du, wie." / "Am Ende baust du ihn selbst." — never only "Lass ihn uns
  bauen." (that can follow as sentence 3), never a number of seconds.
- **Open a loop** the video closes at the end (a "why", a strange detail,
  a number) — viewers stay to get it.
- The **first frame already shows the strange thing** (subject mid-action,
  the warm back, the falling car) — never an empty establishing shot.

**House favourite: Mythos-Bruch + Versprechen.** The user picked it for the fridge v2
(Hook A, `tiktok/skripte/kuehlschrank-v2.md`): break a belief in sentence
1, name what really happens + the promise in sentence 2 ("Er klaut sie –
und gleich weißt du, wie."), then "Lass ihn uns bauen."
Make it the first (recommended) option every time; the other two hooks
use different formulas so the user can compare.

Hook formulas (write three, pick the strongest, show the other two to the
user as alternatives):

| Formula               | Example                                                               |
| --------------------- | --------------------------------------------------------------------- |
| **Mythos-Bruch**      | "Dein Kühlschrank macht gar keine Kälte. Er klaut sie."               |
| **Alltags-Rätsel**    | "Warum ist die Rückseite von deinem Kühlschrank warm?"                |
| **Unglaubliche Zahl** | "Dein Airbag ist schneller aufgeblasen, als du blinzeln kannst."      |
| **Gefahr / Stakes**   | "Ohne dieses eine Teil würde jeder Aufzug abstürzen."                 |
| **Du-Moment**         | "Du stehst jeden Tag in einer Kiste, die an Seilen hängt."            |
| **Ergebnis zuerst**   | "Gleich baust du einen Kühlschrank – aus einem Rohr und einer Pumpe." |

**Hook title (on screen, 0–3 s):** 3–6 words, same promise in fewer
words, one keyword in `<em>` (yellow). Not a copy of the spoken line.
E.g. spoken "Dein Kühlschrank macht gar keine Kälte." → title
"Dein Kühlschrank <em>lügt</em>".

### 2. Beats — keep them watching

**Data (2026-10-23): on every video most viewers leave at ~13 s.** In the
scripts, 11–15 s was always the same spot: "Jetzt der Trick:" / "Hier
kommt der Trick:" (in almost every episode — it had become the signal
"now comes the boring part"), right after the hook's question had
already been mostly answered, inside the driest part (part names,
numbers). So:

- **The hook's question is answered at the end, not in beat 1.** The
  beats make the question _bigger_ (stakes, a second mystery, "und das
  ist erst Teil 1"), the answer comes with the payoff (last ~25 % before
  the bonus fact). Put the question in `hf-config` (`question`), the word
  that answers it (`answer`) — the banner stays on screen until then.
- **A second, concrete reason to stay before 10 s** — name what's coming,
  not a formula: "Gleich siehst du, warum dein Wasser dabei nicht kocht."
  / "Und das Krasseste kommt bei Teil 3." / "Fälscher kennen diesen Test
  – den dritten aber nicht."
- **Banned stock phrases** (they became the drop-off signal): "Jetzt der
  Trick", "Hier kommt der Trick", "Und jetzt der Trick", "Jetzt wird's
  verrückt", "Aber Achtung". Say the concrete thing instead ("Jetzt
  schießt Luft mit 300 km/h nach unten –").
- **0–15 s = spectacle and mystery, max 1 technical term and no numbers
  before ~15 s;** 10–15 s is the second money shot (visual-style.md).
  Part names and numbers come after that.
- **Steps on screen:** list one spoken word per build step in
  `hf-config` → `steps` (2–3); the progress bar fills while each is
  built.

- **3 beats.** Each beat: problem → fix ("Also …" / "Du brauchst …") →
  the term ("Das ist der X.") — max **3 technical terms** per video.
- **Every beat ends with a pull** into the next: a problem ("Aber jetzt
  ist das Gas warm."), a question, or a teaser.
- **A visual highlight every 5–7 s** (plan it with the script, see
  visual-style.md "Highlights"): each beat needs a moment worth
  rewinding — slow motion, an explosion / flash, a crash zoom, the thing
  failing spectacularly, a size comparison. Write lines that _give_ the
  picture such a moment ("Und dann – zack!", "Stell dir vor, das Ventil
  klemmt …").
- **One re-hook in the middle** (~15–25 s), concrete and different every
  video (never the banned phrases above): "Und jetzt passiert etwas, das
  du nie gesehen hast:", "Der dritte Test ist der, an dem Fälscher
  scheitern:". Max 2 per video.
- **One home moment**: connect to something the viewer can check right
  now — "Fass mal hinter deinen Kühlschrank.", "Hör mal hin, wenn er
  anspringt."
- **One vivid comparison** max per beat, from everyday life ("wie
  Schweiß, der dich kühlt").
- **Rhythm:** mostly ≤ 10 words per sentence, now and then a 1–3-word
  punch ("Falsch." / "Genau hier." / "Zack."). Read it aloud in your head;
  if a sentence needs a breath, split it.
- **Cut** history, definitions, hedges ("eigentlich", "sozusagen",
  "im Prinzip"), double explanations, and anything you can't show.
- **Personality:** one light joke or personification per video ("Die
  Pumpe hat jetzt richtig schlechte Laune.").
- Concrete numbers (each becomes an LED-panel fact). Facts must be right;
  when unsure, phrase safely or check.

### 3. Payoff + signature

Close the hook's loop explicitly ("Und genau deshalb ist die Rückseite
warm."), then the series line **"Schau dich an. Du hast gerade [einen/
eine/ein] X gebaut."**

### 3b. Bonus fact — "Übrigens: …"

Right after the signature, on the same line: **"Übrigens: …"** + one
surprising fact about the topic that people want to repeat to someone
("Übrigens: In deinem Kühlschrank ist es kälter als am Nordpol im
Sommer."). It must start with the word **"Übrigens"** — the "WUSSTEST
DU?" badge and a sparkle sound key on it. Rules: 10–15 words, a number or
a comparison, **true** (check it; phrase safely when unsure), not a
repeat of a beat, one `*keyword*`. It is the last thing before the CTA, so
it should make people want to comment ("Krass!" / "Wusste ich nicht").

### 4. CTA — make them comment

Second-to-last line of `script.txt` (the loop bridge comes after it),
spoken by the same voice in the same take.

- **One comment question** tied to the topic, answerable in 1–3 words:
  yes/no, either/or, a number, or a personal detail. Then **"– und folg
  mir für mehr."** (or a teaser: "– und folg mir, morgen bauen wir einen
  Toaster.").
- The word **"folg"** must appear: the Folgen button is timed on it; the
  Kommentieren button pops when the CTA line starts.
- No generic "Lass ein Like da". No question that needs a paragraph.

### 5. Loop bridge — the video never ends

The **last line starts with `>`**: 2–4 spoken words that flow, sentence
and voice, straight into the hook's first sentence, so the restart
sounds like the video continues — viewers watch a second round without
noticing (rewatches count heavily). The `>` is never spoken (strip it
before ElevenLabs).

- Ends with a colon or an open half-sentence: `> Und merk dir:`,
  `> Denn vergiss nie:`, `> Und jetzt weißt du, warum`, `> Also merk dir:`.
- Read it together with hook sentence 1 out loud: it must make one
  sentence ("Und merk dir: Dein Kühlschrank macht gar keine Kälte.").
- The picture does the rest automatically: at the first bridge word a
  hard cut (+ whoosh) to the opening shot, the buttons clear, the video
  stops 0.25 s after the last word, music doesn't fade out — so the last
  frame matches frame 0.

CTA patterns:

| Pattern              | Example                                                                                   |
| -------------------- | ----------------------------------------------------------------------------------------- |
| **Ja / Nein**        | "Hast du einen Airfryer? Schreib's in die Kommentare – und folg mir für mehr."            |
| **Entweder-oder**    | "Team Treppe oder Team Aufzug? Ab in die Kommentare – und folg mir für mehr."             |
| **Test zu Hause**    | "Fass mal hinter deinen Kühlschrank: Ist er warm? Schreib's mir – und folg mir für mehr." |
| **Zahl / Schätzung** | "Wie viele Seile hat dein Aufzug? Tipp in die Kommentare – und folg mir für mehr."        |
| **Nächstes Thema**   | "Was soll ich als Nächstes bauen? Schreib's in die Kommentare – und folg mir."            |

## Delivery tags — make Jan sound alive

Jan runs on `eleven_v3`, which performs bracketed tags. Use **3–6 per
video** so the voice has highs and lows instead of one flat tone:

| Tag                       | Where                                                     |
| ------------------------- | --------------------------------------------------------- |
| `[excited]`               | the hook's claim, the payoff, the bonus fact              |
| `[whispers]`              | the re-hook / secret ("[whispers] Und jetzt passiert's:") |
| `[curious]`               | a question to the viewer                                  |
| `[laughs]` / `[chuckles]` | after the one joke                                        |
| `[surprised]`             | an unbelievable number                                    |

Put the tag right before the words it colours, never two in a row, never
inside the loop line. Tags are not words: they don't count towards the
word budget, they're removed from the captions automatically, and they
**do** go to ElevenLabs (keep them in the connector text, only `*` and
the leading `>` are stripped).

## Keywords — mark them with `*Wort*`

Mark the word of each sentence the viewer must remember — `*Kompressor*`,
`minus *26* Grad`, `der *Trick*`, the hook's key noun. The caption turns yellow + bigger and pops, the camera punches in
and a soft "punch" sounds. Rules:

- **~1 per sentence, 8–12 per video**, never two in a row (the punches
  must stay a surprise).
- Always: each technical term where it is named (`Das ist der
*Verdampfer*.`), the hook's twist word, the re-hook (`der *Trick*`),
  every number the LED panel shows.
- Never: the CTA line (it has its own buttons), filler words, the series
  line ("gebaut" gets the ding anyway).
- Only around one word, punctuation outside: `*Kompressor*.` The stars
  never reach the voice (strip them before ElevenLabs).

## Other rules

- Du-Form throughout; the viewer builds it.
- Spoken German, short words, no unexplained jargon.
- The scene keys on spoken words: avoid using the same rare word twice
  in a row, vary verbs between beats.
- Numbers as digits only when spoken as a number ("26").

## Example — fridge rewritten in v2, approved by the user (129 words ≈ 47 s)

```text
Dein Kühlschrank macht gar keine *Kälte*. Er *klaut* deiner Milch die Wärme – und schmeißt sie hinten raus. Lass ihn uns bauen.
Du brauchst ein Rohr in der Rückwand, gefüllt mit einer Flüssigkeit, die schon bei minus *26* Grad kocht. Dabei saugt sie die Wärme aus deiner Milch. Das ist der *Verdampfer*.
Jetzt hast du warmes Gas. Und hier kommt der *Trick*: Eine Pumpe quetscht es zusammen, bis es richtig *heiß* wird. Das ist der *Kompressor*.
Das heiße Gas jagst du hinten durch ein *Zickzack-Rohr* – genau da landet die geklaute Wärme. Ein haarfeines Röhrchen macht es wieder *eiskalt*, und alles läuft im Kreis.
Schau dich an. Du hast gerade einen Kühlschrank gebaut.
Fass mal hinter deinen Kühlschrank: Ist er warm? Schreib es in die Kommentare – und folg mir für mehr.
```

Hook title: `Dein Kühlschrank <em>lügt</em>`. (Keyword marks added
afterwards to show the density: 9 in 129 words.)

From now on every script also gets the bonus fact and the loop bridge —
for the fridge they would be (beats trimmed by ~16 words to stay ≤ 130):

```text
Schau dich an. Du hast gerade einen Kühlschrank gebaut. Übrigens: In deinem Kühlschrank ist es *kälter* als am Nordpol im Sommer.
Fass mal hinter deinen Kühlschrank: Ist er warm? Schreib es in die Kommentare – und folg mir für mehr.
> Und merk dir:
```

What changed against v1: belief-breaking first line instead of "Wenn du
Eiswürfel …"; the "Wärme klauen" loop opened in the hook and closed in
beat 3; "Und hier kommt der Trick:" as re-hook; a home test in the CTA.
(Written before the ~13 s drop-off data: today "Und hier kommt der
Trick:" is banned and the loop would only close in the payoff.)

## Self-check before showing the user

- [ ] Hook = spectacle the first frame shows + a reason to stay ("gleich weißt du, wie" — no seconds)
- [ ] Would a stranger stop scrolling for the first sentence alone?
- [ ] Topic noun in the first 5 words, sentence 1 ≤ 12 words, no wind-up
- [ ] A highlight planned every 5–7 s; 3–6 delivery tags
- [ ] An open loop in the hook that only the payoff closes (not beat 1); `hf-config` question + answer word + steps filled in
- [ ] A concrete second reason to stay before 10 s; none of the banned phrases ("Jetzt der Trick" …)
- [ ] 0–15 s: spectacle + mystery, max 1 term, no numbers
- [ ] 3 beats, each ending with a pull; one re-hook; one home moment
- [ ] ≤ 3 technical terms; no sentence that needs a breath
- [ ] Bonus fact starts with "Übrigens", 10–15 words, true, surprising
- [ ] CTA: question answerable in 1–3 words + "folg"
- [ ] Loop line `> …` + hook sentence 1 read as one sentence
- [ ] 8–12 `*keywords*`: every term, the twist, the trick, every panel number
- [ ] 110–122 words incl. fact, CTA and loop line (≤ 128, ≥ 105), expected length stated

## What to show the user for approval

The script (one part per paragraph), word count + expected length, the
hook title, **two alternative hooks**, the **cover title** (see SKILL.md
step 6b), and per beat one line of visual plan, e.g.:

- Hook: Kühlschrank-Rückseite glüht rot, Wärmepfeile strömen aus der Milch nach hinten
- Verdampfer: Kühlschrank wird gläsern, blaues Rohr wächst in die Rückwand (Schild „Verdampfer“), LED „KOCHT BEI −26 °C“, Siedeblasen + Zischen
- Trick: Kompressor brummt los
- …
