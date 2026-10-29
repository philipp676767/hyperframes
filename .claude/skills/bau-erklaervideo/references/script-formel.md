# Script-Formel (v2 — retention first)

Feedback on episode 1 (fridge) from an experienced creator: the script was
flat, the hook weak, nothing kept people watching. v2 writes for **watch
time**: a hook that wins the first 2 seconds, an open loop that is only
closed at the end, re-hooks in the middle, and a CTA that makes people
comment. The build-it-yourself frame stays in the Du-Form ("Du brauchst
…", "Lass ihn uns bauen") — but the spoken line **"Schau dich an. Du hast
gerade X gebaut." is gone for good** (user's rule, 2026-10-23): it told
viewers "fertig" right before the bonus fact and the CTA.

**Format B „Was passiert, wenn …?“** (alternates with this
one, SKILL.md step 0) uses this file too, with the differences in
`format-was-passiert.md` — the hook starts straight with the act already
happening (no spoken "Was passiert, wenn …?"), 3 Folgen instead of 3 build
beats, the outcome as payoff.

## Length — exactly 45 seconds

Every video is **exactly 45.0 s** (user's rule, 2026-10-28; 60 s from
2026-10-24 to -27). Write **130–142 words including fact, follow line and
CTA** (Jan at **3.1 words/s**, sped up by `prepare-voice.sh`), never more
than **148** or fewer than **124** — `prepare-voice.sh` fits that range to
exactly 45 s (≤ 6 % faster or slightly longer pauses). Count before
showing the script.

45 s only holds if **every 6–8 s something new and stronger happens** —
no sentence is there just to fill time.

## Shape (45 s)

| Part                         | When     | Words | Job                                                                                         |
| ---------------------------- | -------- | ----- | ------------------------------------------------------------------------------------------- |
| **Hook** (line 1)            | 0–4 s    | 14–22 | the **reason to watch for _you_** (gain / danger) + twist; open loop 1 (the big question)   |
| **Beat 1**                   | 4–11 s   | 20–25 | first part; ends on the **second money shot** (~10 s) and opens loop 2                      |
| **Follow line**              | ~11–13 s | 4     | „Folge für mehr Wissen.“ — own line, straight on after it                                   |
| **Beat 2**                   | 13–21 s  | 22–26 | second part, bigger than beat 1; closes loop 2, opens loop 3                                |
| **Mid twist** (re-hook)      | ~21–25 s | 10–14 | at the halfway mark: the obvious explanation is wrong / it's even crazier — or a "Rate mal" |
| **Beat 3**                   | 25–34 s  | 22–28 | the decisive part (the real trick), the biggest money shot so far                           |
| **Payoff + Übrigens** (line) | 34–40 s  | 18–24 | answer the hook's question (the question text fades) + "Übrigens: …"                        |
| **CTA** (last line)          | 40–44 s  | 8–12  | comment question — then the video ends (~1.2 s on the last shot, no loop)                   |

## Retention engine — how 45 seconds hold

1. **Open-loop chain.** There is always at least one open question. Open
   the next one _before_ you close the current one: hook question (open
   until the payoff) → beat 1 ends on a new "but why …?" → beat 2 answers
   it and opens the next → the mid twist opens the biggest one → beat 3 +
   payoff close everything. Write the **loop map** (which question is
   open from when to when) and show it with the script.
2. **Escalation.** Every 6–8 s a new "Was?!" — a fact, a number, a
   consequence — each stronger than the one before. Order the facts by
   strength, weakest first; the strongest goes into beat 3 / the payoff,
   the second strongest into the mid twist. Never put the best fact
   first and coast.
3. **Mid twist at ~22 s.** The halfway mark is the second drop-off point:
   break the viewer's new understanding ("Nur: Das allein würde nie
   reichen.", "Und das Verrückte: Er macht das 50-mal pro Sekunde.") — a
   statement about the thing, never an announcement.
4. **One "Rate mal" moment** (after ~13 s, often the mid twist): ask the
   viewer to guess a number or an outcome — "Was glaubst du, wie heiß der
   Draht wird?" — and answer 2–3 s later with an LED panel and a
   highlight. A guess makes people wait for the answer, and it drives
   comments.
5. **The viewer's life every ~10 s** — "dein Handy", "deine Küche",
   "wenn du morgen …": it keeps the topic personal.
6. **No signal of the end** before the payoff: no summary, no "fertig",
   no "zusammengefasst", no slowing down. The payoff comes late (≥ 34 s).
7. **Picture keeps pace** (visual-style.md): a cut every 2–3 s (≈ 16–20
   shots), a highlight every 5–7 s (7–9), **4 money shots** (the hook,
   ~10 s, the mid twist, beat 3 / payoff).

### 1. Hook — the first sentence decides everything

Feedback on #10 (Fliegender Tesla, 2026-10-22): _"Warum sollte man das
Video lange schauen? Das sollte am Anfang klar sein."_ "Lass ihn uns
bauen" is not a reason to stay. So the hook has two jobs:

1. **Spektakel / Behauptung** — the most surprising thing about the
   topic, which the first frame _shows_ (the car driving upside down on a
   ceiling, the microwave sparking, the fridge's hot back).
2. **Der Haken** — a second strange detail, a consequence or the stakes,
   said as a fact or a question _about the thing itself_: "Er klaut sie –
   und schmeißt sie hinten raus." / "Und das Verrückte: Er braucht dafür
   nicht mal Strom." / "Trotzdem verbrennst du dich nie." The open
   question is the reason to stay — not an announcement. Then
   (optionally) "Lass ihn uns bauen."
   **No promise phrases about the video** (user's rule, 2026-10-24): never
   "Gleich weißt du / erfährst du / siehst du …", "Am Ende …", "Bleib
   dran", "Pass auf", "Du wirst nicht glauben …" — and never a number of
   seconds ("In 40 Sekunden …", 2026-10-23). They talk _about_ the video
   instead of being interesting, and they remind people that there is
   still a lot to watch.

**Say right away why _you_ must keep watching** (user's rule,
2026-10-28 — the strongest lever for the first second). Sentence 1 (or
at the latest 2) names a concrete **gain or danger for the viewer** —
money, safety, health, time, everyday annoyance:

- „Deshalb darfst du niemals Wasser ins heiße Fett schütten.“
- „Dieser Trick spart dir jedes Jahr Geld.“
- „Das kostet dich gerade richtig viel Geld.“
- „So verbrennst du dir nie wieder die Finger.“
- „Darum geht dein Handy-Akku schneller kaputt.“

The video then delivers exactly that — the gain or the danger is real
and explained, never clickbait (if a topic has no true gain / danger,
use the strongest curiosity hook instead and say so). This is not a
"promise phrase about the video" (those stay banned): it talks about the
viewer's life, not about what the video will show. The hook title says
the same in 2–3 words („Nie Wasser!“, „Spart Geld“, „Kostet dich!“).

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
- **Sentence 2 = the hook's Haken**: a second strange detail or the
  stakes ("Er klaut sie – und schmeißt sie hinten raus.") — never only
  "Lass ihn uns bauen." (that can follow as sentence 3), never a promise
  phrase ("Gleich …", "Am Ende …") or a number of seconds.
- **Open a loop** the video closes at the end (a "why", a strange detail,
  a number) — viewers stay to get it.
- The **first frame already shows the strange thing** (subject mid-action,
  the warm back, the falling car) — never an empty establishing shot.
- **The Umdeutung by ~10 s** (learned from successful videos,
  2026-10-24): in sentence 2–4 say what the thing _really_ is, as a
  reframe "Es ist nicht X – es ist Y": "Er misst gar nicht deine
  Geschwindigkeit. Er stoppt deine Zeit." / "Er ist nicht kaputt. Er ist
  absichtlich locker." / "Dein Kühlschrank macht keine Kälte. Er klaut
  sie." It names the idea early — the _how_ stays open and is what the
  rest of the video proves (the hook question is still answered only in
  the payoff).

**New first choice (2026-10-28): Nutzen / Warnung zuerst** — the gain
or danger for the viewer as sentence 1 (examples above), the twist in
sentence 2. Always write it first in the hook lab when the topic has a
real gain or danger.

**House favourite before that: Mythos-Bruch + Haken.** The user picked it for the fridge v2
(Hook A, `tiktok/skripte/kuehlschrank-v2.md`): break a belief in sentence
1, name what really happens in sentence 2 ("Er klaut sie – und schmeißt
sie hinten raus."), then "Lass ihn uns bauen."
Make it the first (recommended) option every time; the other two hooks
use different formulas so the user can compare. **Equally strong
(2026-10-24): Deine Handlung + Folge** — a thing the viewer does, and why
it doesn't work: "Vor dem Blitzer bremsen rettet dich nicht." Always try
it in the hook lab when the topic has an action people do.

Hook formulas (the hook lab below writes six with them):

| Formula                     | Example                                                                                                                     |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Nutzen / Warnung zuerst** | "Deshalb darfst du niemals Wasser ins heiße Fett schütten." / "Dieser Trick spart dir Geld." / "Das kostet dich viel Geld." |
| **Mythos-Bruch**            | "Dein Kühlschrank macht gar keine Kälte. Er klaut sie."                                                                     |
| **Alltags-Rätsel**          | "Warum ist die Rückseite von deinem Kühlschrank warm?"                                                                      |
| **Unglaubliche Zahl**       | "Dein Airbag ist schneller aufgeblasen, als du blinzeln kannst."                                                            |
| **Gefahr / Stakes**         | "Ohne dieses eine Teil würde jeder Aufzug abstürzen."                                                                       |
| **Du-Moment**               | "Du stehst jeden Tag in einer Kiste, die an Seilen hängt."                                                                  |
| **Ergebnis zuerst**         | "Ein Kühlschrank ist nur ein Rohr und eine Pumpe."                                                                          |
| **Du machst es falsch**     | "Du lädst dein Handy falsch – jede Nacht."                                                                                  |
| **Gefahr im Alltag**        | "Das Gefährlichste in deiner Küche steht neben dem Herd."                                                                   |
| **Identitäts-Twist**        | "Dein Airbag ist eigentlich eine Bombe."                                                                                    |
| **Körper / Ekel**           | "In deinem Kopfkissen leben gerade Millionen Tiere."                                                                        |
| **Unmöglich, aber wahr**    | "Diese Rakete landet rückwärts."                                                                                            |
| **Deine Handlung + Folge**  | "Vor dem Blitzer bremsen rettet dich nicht." / "Handy auf 100 % laden macht den Akku kaputt."                               |
| **Detail-Rätsel**           | "Warum hat dein Kugelschreiber-Deckel ein Loch?" — a small odd detail everyone has seen                                     |

**Hook lab — every script** (user's wish 2026-10-24: "die Hook noch
stärker"). Write **six** hooks with six different formulas, score each
0–2 on these six points and keep the best (≥ 10 of 12):

| Point                          | 2 = …                                                                                                    |
| ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| **Twist fast**                 | the surprising part is in the first 4 words, sentence 1 ≤ 8 words                                        |
| **Bild 0 zeigt es**            | frame 0 can _show_ exactly this (spoken line, 2–3-word title and picture say one thing)                  |
| **Dein Nutzen / deine Gefahr** | sentence 1 or 2 names what the viewer gains or risks — money, safety, health, time (true, not clickbait) |
| **Dein Alltag**                | "dein / du" + a thing the viewer touched today                                                           |
| **Keine Vorkenntnis**          | a stranger at 1 a.m. gets it without context or a technical word                                         |
| **Offene Frage**               | it raises a "Warum?! / Wie?!" the viewer can't answer — and the hook doesn't answer it                   |

Show the user the winner and the next two **with their scores**. A
winner under 10 is a sign the topic is weak — say so and offer another
topic rather than a weak hook.
**Hook title (on screen, 0–3 s):** **2–3 words, ≤ 18 characters**, shown
huge in capitals — readable in the 0.1 s a scroller gives it. The hook's
twist in fewer words, one keyword in `<em>` (yellow). Not a copy of the spoken
line. E.g. spoken "Dein Kühlschrank macht gar keine Kälte." → title
"Er <em>lügt</em>!" / "<em>Keine</em> Kälte?!".

**Tone for the audience (2026-10-23: 77 % are 18–34, half women, mostly
random scrollers):** talk like a cheeky friend, not a teacher. Everyday
references from _their_ life (Handy, Kaffee, Party, Gym, Pendeln), a bit
of attitude and provocation — "Dein Handy belauscht dich gar nicht – es
macht was Schlimmeres." Never kid-like or school-like ("Heute lernen
wir …", "Weißt du eigentlich …", "Ganz einfach erklärt"), never
clickbait that the video doesn't deliver, facts stay correct.

### 2. Beats — keep them watching

**Story frame — "Stell dir vor, du …"** (learned from successful videos,
2026-10-24). Wherever the topic allows, beat 1 drops the viewer into a
concrete scene with something at stake, and the explanation happens
_inside_ that scene: "Stell dir vor, du fährst nachts allein auf der
Autobahn. Am ersten Blitzer bist du brav. Dann gibst du Gas. Am
zweiten bremst du rechtzeitig runter. Zwei perfekte Durchfahrten – und
trotzdem liegt drei Wochen später ein Brief im Briefkasten." Rules: a
time and place, an action of the viewer, a consequence to lose (Strafe,
Geld, verbrannte Finger, leerer Akku), told in the present tense; the
picture plays the scene (the set is that place). Later beats can step
back into the scene ("Zurück auf die Autobahn: …") — it is the thread
that holds the video together.

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
  that answers it (`answer`) — the question stays on screen until then.
- **A second, concrete reason to stay before 10 s** — a new strange fact
  or a bigger question, said about the thing, never an announcement:
  "Und dein Wasser kocht dabei nicht mal." / "Fälscher kennen diesen Test
  – den dritten aber nicht." Not "Gleich siehst du …", not "Das Krasseste
  kommt noch"
- **Banned stock phrases** (they became the drop-off signal): "Jetzt der
  Trick", "Hier kommt der Trick", "Und jetzt der Trick", "Jetzt wird's
  verrückt", "Aber Achtung". Say the concrete thing instead ("Jetzt
  schießt Luft mit 300 km/h nach unten –").
- **0–15 s = spectacle and mystery, max 1 technical term and no numbers
  before ~15 s;** 10–15 s is the second money shot (visual-style.md).
  Part names and numbers come after that.

- **3 beats + the mid twist.** Each beat: problem → fix ("Also …" / "Du brauchst …") →
  the term ("Das ist der X.") — max **3 technical terms** per video.
- **Every beat ends with a pull** into the next: a problem ("Aber jetzt
  ist das Gas warm."), a question, or a teaser.
- **A visual highlight every 5–7 s** (plan it with the script, see
  visual-style.md "Highlights"): each beat needs a moment worth
  rewinding — slow motion, an explosion / flash, a crash zoom, the thing
  failing spectacularly, a size comparison. Write lines that _give_ the
  picture such a moment ("Und dann – zack!", "Stell dir vor, das Ventil
  klemmt …").
- **The re-hook is the mid twist at ~22 s** (see "Retention engine"):
  concrete, a statement about the thing, never an announcement —
  "Der dritte Test ist der, an dem Fälscher scheitern." / "Nur: Das allein
  würde nie reichen." Max 2 re-hooks per video.
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
- **Humor — a little, and only where it fits** (user's wish
  2026-10-26). Jan is the cheeky friend who grins while explaining, not a
  comedian. **1–2 small moments per video**, never forced:
  - _Where they come from:_ the situation itself — a dry understatement
    ("Rund hundert Leute. Viel Spaß im Gang."), a personification ("Die
    Pumpe hat jetzt richtig schlechte Laune."), an everyday pain everyone
    knows ("Darum ist dein Kaffee immer genau dann kalt, wenn du ihn
    trinken willst."), a tiny self-aware aside ("Ja, wirklich.").
  - _Where they go:_ after a fact has landed, in a beat or right after the
    payoff — never in hook sentence 1 (unless the twist itself is funny),
    never in the middle of the explanation that has to be understood.
  - _Never:_ memes, cringe slang, forced puns, jokes about people or groups,
    humor in serious or dangerous topics (Fettbrand, Krankheit, Unfälle),
    anything that makes a fact less clear or less true.
  - Test: would a friend say it while explaining this over a beer? If you
    have to think about whether it's funny, cut it — no humor is better
    than forced humor. `[chuckles]` at most once, after the line.
- Concrete numbers (each becomes an LED-panel fact). Facts must be right;
  when unsure, phrase safely or check.

### 3. Payoff

Close the hook's loop explicitly and with punch — this is the moment the
on-screen question is answered and fades, so the `answer` word in `hf-config` sits
here: "Und genau deshalb ist die Rückseite _warm_." / "Darum bleibt echtes
Geld _dunkel_." **Never** "Schau dich an. Du hast gerade X gebaut." (or
any other "fertig"-line) — go straight on to "Übrigens".

### 3b. Bonus fact — "Übrigens: …"

Right after the payoff, on the same line: **"Übrigens: …"** + one
surprising fact about the topic that people want to repeat to someone
("Übrigens: In deinem Kühlschrank ist es kälter als am Nordpol im
Sommer."). It must start with the word **"Übrigens"** — the "WUSSTEST
DU?" badge and a sparkle sound key on it. Rules: 10–15 words, a number or
a comparison, **true** (check it; phrase safely when unsure), not a
repeat of a beat, one `*keyword*`. It is the last thing before the CTA, so
it should make people want to comment ("Krass!" / "Wusste ich nicht").

### 4. CTA — follow in the middle, comment at the end

The user moved the follow ask into the middle (2026-10-24): fewer than
10 % watch to the end, so at the end almost nobody heard it. Both parts
are spoken by the same voice in the same take; neither may be dropped or
shortened.

**Follow line (middle)** — its own line in `script.txt`, **right after
beat 1 / the second money shot (≈ 11–13 s)**, never in the first 10 s:
exactly **„Folge für mehr Wissen.“** (the user's wording, 2026-10-28 —
no variants). It contains "Folge": the Folgen pill pops on it, gets
tapped, says "Gefolgt", leaves after 2.5 s. No pause around it — the next
beat goes straight on with a strange fact, so it feels like a quick
aside, not a break. No LED panel or label during it (the pill sits under
the captions).

**Comment question (end)** — the last line of the script:

- **A new question every video** (2026-10-27): think of the one that fits
  _this_ topic best — personal, a bit cheeky — write three, take the
  best, never repeat the previous video's line.
- **One comment question** tied to the topic, answerable in 1–3 words:
  yes/no, either/or, a number, or a personal detail, + „Schreib's in die
  Kommentare.“ (or „Ab in die Kommentare.“). No "folg" here any more.
- The Kommentieren button pops when this line starts.
- No generic "Lass ein Like da". No question that needs a paragraph.

### 5. Ending — no loop

**No loop bridge** (user's rule, 2026-10-24; before, a `> Und merk dir:`
line ran back into the hook). The comment question is the last line;
after it the picture holds ~1.2 s on a strong last shot (the subject big
and finished, or the drone pull-back over the world) and the video ends.
No summary, no "Tschüss", nothing after the question.

CTA patterns:

| Pattern              | Example                                                           |
| -------------------- | ----------------------------------------------------------------- |
| **Ja / Nein**        | "Hast du einen Airfryer? Schreib's in die Kommentare."            |
| **Entweder-oder**    | "Team Treppe oder Team Aufzug? Ab in die Kommentare."             |
| **Test zu Hause**    | "Fass mal hinter deinen Kühlschrank: Ist er warm? Schreib's mir." |
| **Zahl / Schätzung** | "Wie viele Seile hat dein Aufzug? Tipp in die Kommentare."        |
| **Nächstes Thema**   | "Was soll ich als Nächstes bauen? Schreib's in die Kommentare."   |

## Delivery tags — make Jan sound alive

Jan runs on `eleven_v3`, which performs bracketed tags. Use **3–6 per
video** so the voice has highs and lows instead of one flat tone:

| Tag                       | Where                                                     |
| ------------------------- | --------------------------------------------------------- |
| `[excited]`               | the hook's claim, the payoff, the bonus fact              |
| `[whispers]`              | the re-hook / secret ("[whispers] Und jetzt passiert's:") |
| `[curious]`               | a question to the viewer                                  |
| `[laughs]` / `[chuckles]` | after a joke — at most once per video                     |
| `[surprised]`             | an unbelievable number                                    |

Put the tag right before the words it colours, never two in a row. Tags are not words: they don't count towards the
word budget, they're removed from the captions automatically, and they
**do** go to ElevenLabs (keep them in the connector text, only `*` is
stripped).

## Keywords — mark them with `*Wort*`

Mark the word of each sentence the viewer must remember — `*Kompressor*`,
`minus *26* Grad`, `der *Trick*`, the hook's key noun. The caption turns yellow + bigger and pops, the camera punches in
and a soft "punch" sounds. Rules:

- **~1 per sentence, 8–12 per video**, never two in a row (the punches
  must stay a surprise).
- Always: each technical term where it is named (`Das ist der
*Verdampfer*.`), the hook's twist word, the re-hook (`der *Trick*`),
  every number the LED panel shows.
- Never: the CTA line (it has its own buttons), filler words.
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
Und genau deshalb ist er hinten *warm*.
Fass mal hinter deinen Kühlschrank: Ist er warm? Schreib es in die Kommentare – und folg mir für mehr.
```

Hook title: `Dein Kühlschrank <em>lügt</em>`. (Keyword marks added
afterwards to show the density: 9 in 129 words.)

(Since 2026-10-24 the follow ask is its own line in the middle — today
„Folge für mehr Wissen.“ after beat 1 — and the end keeps only the
comment question.)

Every script also gets the bonus fact (since 2026-10-24 without a loop
bridge) — for the fridge the end would be:

```text
Und genau deshalb ist er hinten *warm*. Übrigens: In deinem Kühlschrank ist es *kälter* als am Nordpol im Sommer.
Fass mal hinter deinen Kühlschrank: Ist er warm? Schreib es in die Kommentare.
```

What changed against v1: belief-breaking first line instead of "Wenn du
Eiswürfel …"; the "Wärme klauen" loop opened in the hook and closed in
beat 3; "Und hier kommt der Trick:" as re-hook; a home test in the CTA.
(Written before the ~13 s drop-off data: today "Und hier kommt der
Trick:" is banned and the loop would only close in the payoff.)

## Self-check before showing the user

- [ ] Hook = spectacle the first frame shows + a Haken (second strange detail / stakes) — no "Gleich …", "Am Ende …", "Bleib dran", no seconds
- [ ] Would a stranger stop scrolling for the first sentence alone?
- [ ] Tone: cheeky friend for 18–34 (men and women), nothing school-like; hook title 2–3 words
- [ ] Topic noun in the first 5 words, sentence 1 ≤ 12 words, no wind-up
- [ ] A highlight planned every 5–7 s; 3–6 delivery tags
- [ ] An open loop in the hook that only the payoff closes (not beat 1); `hf-config` question + answer word filled in
- [ ] A concrete second reason to stay before 10 s; none of the banned phrases ("Jetzt der Trick" …)
- [ ] 0–15 s: spectacle + mystery, max 1 term, no numbers
- [ ] 3 beats, each ending with a pull; one re-hook; one home moment
- [ ] ≤ 3 technical terms; no sentence that needs a breath
- [ ] No "Schau dich an. Du hast gerade X gebaut." — the payoff answers the question, then straight to "Übrigens"
- [ ] Bonus fact starts with "Übrigens", 10–15 words, true, surprising
- [ ] Humor: 0–2 small, situational moments that fit — none forced, none in serious topics
- [ ] Follow line in the middle (after beat 2, ≈ 12–20 s, 6–9 words, "folg"); comment question at the end, answerable in 1–3 words, no "folg"
- [ ] 8–12 `*keywords*`: every term, the twist, the trick, every panel number
- [ ] 130–142 words incl. fact, follow line and CTA (≤ 148, ≥ 124) → exactly 45 s; no `> …` loop line
- [ ] Sentence 1 (or 2) says what the viewer gains or risks — true, not clickbait
- [ ] Hook lab done: six hooks scored, winner ≥ 10/12, top 3 with scores
- [ ] 45-s shape: beat 1 → „Folge für mehr Wissen.“ (~11–13 s) → beat 2 → mid twist (~22 s) → beat 3 → payoff (≥ 34 s)
- [ ] Loop map: always ≥ 1 open question, the next opened before the last one closes
- [ ] Escalation: a new "Was?!" every 6–8 s, weakest first, strongest in beat 3 / payoff; one "Rate mal" moment after ~13 s

## What to show the user for approval

The script (one part per paragraph), word count (→ exactly 45 s), the
**loop map** (e.g. "0–47 s: Warum ist er hinten warm? · 13–24 s: Wohin
mit der Wärme? · 30–41 s: Warum kocht es bei −26 °C?"), the hook title,
the winning hook + **two alternative hooks with their scores**, the
**cover title** (see SKILL.md
step 6b), and per beat one line of visual plan, e.g.:

- Hook: Kühlschrank-Rückseite glüht rot, Wärmepfeile strömen aus der Milch nach hinten
- Verdampfer: Kühlschrank wird gläsern, blaues Rohr wächst in die Rückwand (Schild „Verdampfer“), LED „KOCHT BEI −26 °C“, Siedeblasen + Zischen
- Eigene Sounds dieses Videos: „Kühlschrank-Brummen beim Anspringen“, „Gluckern im Rohr“
- Trick: Kompressor brummt los
- …
