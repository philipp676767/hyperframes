# Format B — „Was passiert, wenn …?“ (the idea, not the spoken words)

The series' second format (user's idea, 2026-10-23): instead of building an
everyday thing, the video **plays out a scenario people have always
wondered about** — the flight door opened mid-air, lightning hitting the
car, the swallowed chewing gum — and follows its chain of consequences to
a surprising outcome. **The formats always alternate** (SKILL.md step 0).

Everything else stays the house standard: Jan, the look, captions,
keywords, labels, highlights, the first-3-seconds rules, the open question
on screen, payoff, "Übrigens", the CTA (never cut, shortened or moved),
the clean ending (no loop), cover, short keyword description, learning log. This file only
lists what is **different** from `script-formel.md` and `visual-style.md`.

## Why it works

- The scenario itself is the hook — you are doing something you always
  wondered about, a curiosity gap that needs no interest in technology
  (the account's random 18–34 scrollers, 2026-10-23).
- Every consequence triggers the next ("… und dann?"), so the middle of
  the video pulls forward instead of explaining parts — the ~13 s drop-off
  spot gets an escalation, not a term.
- The viewer's hand does the act from frame 0 — _du_ opens the door.
- The scenario gives the comment question a personal angle: "Würdest du
  dich jetzt noch an den Notausgang setzen?" — viewers answer for
  themselves.

## Script shape (same length: exactly 45 s, 130–142 words)

| Part                  | When     | Words | Job                                                                                                            |
| --------------------- | -------- | ----- | -------------------------------------------------------------------------------------------------------------- |
| **Hook** (line 1)     | 0–4 s    | 14–22 | Straight in: the act already happening ("Du ziehst mitten im Flug an der Notausgangstür.") + the Haken / stake |
| **Folge 1**           | 4–11 s   | 20–25 | The first consequence / the condition that makes it strange; ends on the second money shot                     |
| **Follow line**       | ~11–13 s | 4     | „Folge für mehr Wissen.“ (script-formel.md §4)                                                                 |
| **Folge 2**           | 13–21 s  | 18–24 | It escalates                                                                                                   |
| **Mid twist**         | ~21–25 s | 10–14 | A "Rate mal" ("Was glaubst du, wie viele Leute …?") or the surprise that changes everything                    |
| **Folge 3**           | 25–34 s  | 20–26 | The decisive consequence: the real mechanism, max 1–2 terms                                                    |
| **Payoff + Übrigens** | 34–40 s  | 16–22 | The outcome in one punchy line (the question on screen fades) + "Übrigens: …"                                  |
| **CTA**               | 40–44 s  | 8–12  | a **new comment question that fits this scenario** every time (see "Payoff, Übrigens, CTA, ending"), no "folg" |

The retention engine of script-formel.md (open-loop chain, escalation,
mid twist, "Rate mal", hook lab) applies here too.

### Hook — the differences

**No "Was passiert, wenn …?" in the spoken hook any more** (user's rule,
2026-10-29). The format is still the scenario + its chain of
consequences, but the video starts **directly with the hook** — the act
already happening, plus the reason to watch — with the same hook rules
as script-formel.md (twist in the first 4 words, sentence 1 ≤ 8 words,
hook lab, gain / danger for the viewer when it is real).

- **Sentence 1 = the act, already happening, in the Du-Form** — the
  picture has the viewer's hand doing it on frame 0: "Du ziehst mitten
  im Flug an der Notausgangstür." / "Du kippst Wasser ins brennende
  Fett." / "Du schluckst deinen Kaugummi runter."
- **Sentence 2 = the Haken or the stake** — a strange fact about the
  scenario or what the viewer risks, never an announcement ("Gleich
  siehst du …", "Am Ende …") and never a number of seconds: "Und der
  Pilot? Bleibt völlig ruhig." / "Mach das nie: Das kann deine ganze
  Küche abfackeln." / "Angeblich bleibt er jetzt sieben Jahre in dir."
- Or **start with the warning / the gain** (script-formel.md "Nutzen /
  Warnung zuerst"): "Deshalb darfst du niemals Wasser ins heiße Fett
  schütten." — then the act.
- **Never reveal the outcome in the hook.** Not "Spoiler: sie geht nicht
  auf" — the outcome is the payoff; the open question stays on screen
  (`hf-config` question, e.g. "Geht die <em>Tür</em> auf?") until then.
- Hook lab: the six hooks use the act, the warning, the myth ("Alle
  sagen, er bleibt sieben Jahre in dir.") and the stake as openings.

**Hook title (2–3 words, ≤ 18 chars):** the act as a shocked question —
"<em>Tür</em> auf?!", "<em>Blitz</em> ins Auto?!", "Kaugummi <em>weg</em>?!".

### Consequences — the differences

- **3 Folgen instead of 3 build beats.** Each one ends with a pull ("… und
  genau das wird jetzt dein Problem."), each one is bigger than the one
  before.
- The **real mechanism** comes in Folge 3, not earlier (max 3 terms in
  total, still none before ~15 s, no numbers before ~15 s — the
  "höher als der Everest"-kind of comparison is fine).
- The banned phrases of script-formel.md apply here too; also never
  "Und jetzt wird's krass" — say the concrete thing.

### Payoff, Übrigens, CTA, ending

- **Payoff = the outcome**, answering the hook's question in one line with
  the `answer` word: "Darum bleibt sie _zu_, selbst wenn zehn Leute
  ziehen." The answer word must not be spoken earlier in the script (the
  on-screen question is answered on its first use after 6 s).
- "Übrigens: …" exactly as in script-formel.md.
- Follow line after Folge 1 (as in script-formel.md §4).
- **The closing line is new every time** (user's rule, 2026-10-27) — never
  the stock "Was sollen wir als Nächstes passieren lassen?". Think of the
  line that fits _this_ scenario best: a personal, slightly cheeky
  question the viewer can answer in 1–3 words, + „Schreib's in die
  Kommentare.“ (or a variant). Examples:
  - Flugzeugtür: "Würdest du dich jetzt noch an den Notausgang setzen?"
  - Blitz im Auto: "Wo bist du bei Gewitter lieber – im Auto oder im Zelt?"
  - Kaugummi: "Wie viele hast du schon verschluckt? Ehrlich."
  - Erde hört auf, sich zu drehen: "Was würdest du in der letzten Sekunde
    noch festhalten?"
    Write three, take the best, never repeat the previous video's line
    (check its `script.txt`). Scenario wishes the comments bring up still
    go into `themen.md` (Format B).
- No loop line: the comment question is the last line, the video ends on
  the outcome shot.

## Safety — non-negotiable

TikTok throttles or removes videos that show dangerous acts people could
copy, and a wrong "harmless" claim can hurt someone. So:

- **Pick scenarios that are impossible, harmless, or only a warning.**
  Impossible / not doable: the flight door, lightning, a black hole.
  Harmless: chewing gum, the phone in water, a shaken cola can.
- **Warnings stay warnings.** A dangerous scenario (water on burning
  fat) only with "Mach das nie" in the hook or Folge 1, the right thing
  to do in the payoff ("Deckel drauf, Herd aus"), shown only in 3D —
  never amounts, steps or how-to.
- **Never:** self-harm, drugs, weapons, challenges, pranks on others,
  anything illegal, medical advice ("dann musst du nicht zum Arzt").
- **Facts are checked before the script** (web search when available).
  Body / health outcomes are phrased carefully ("meistens", "in der
  Regel") and never tell someone they're safe when they might not be.

## Picture — the differences

- **Frame 0: the act, with the viewer's hand** (`hand.js`) — the hand
  grabs the door handle, drops the phone, unwraps the gum. Sound of the
  act on frame 0 (an own sound when it fits, else `klack` / `whoosh`).
- **No build-up from parts.** The scenario plays out in one diorama;
  every Folge is a visible change in it (the air streams in, the arrows
  of force grow, the door pushes back). Labels and LED panels as usual.
- **Cutaway / x-ray only after ~3 s** and only when a Folge needs a look
  inside (pressure in the cabin, the current in the car body).
- **The payoff shot** shows the outcome big: the door that doesn't move,
  the car standing there, the passenger unharmed. Then the usual "Übrigens" and CTA shots; the video ends there.
- **World:** built new for the scenario like every video (SKILL.md 1b) —
  the act happens _in_ a place (the plane cabin with the window over the
  clouds, the car on a stormy road, the kitchen at night), so that place
  is the set, with its own light, props and hero piece.
- The **cover** shows the act at its most tense moment with a question
  title ("<em>Tür</em> auf im Flug?").

## Example — Flugzeugtür (138 words → 45 s)

```text
[curious] Du ziehst mitten im Flug an der *Notausgangstür*. Mit aller Kraft. Und der Pilot? Bleibt völlig *ruhig*. Dabei hängt dein Leben an genau dieser Tür.
Du fliegst höher als der *Everest*. Draußen ist die Luft so dünn, dass du *ohnmächtig* würdest. Darum pumpt das Flugzeug Luft rein – und genau die wird dein Problem.
Folge für mehr Wissen.
[whispers] Sie drückt von innen gegen die Tür. Auf jedem Quadratmeter lastet so viel wie ein *Elefant*.
Was glaubst du: Wie viele Leute müssten ziehen? [surprised] Rund *hundert*. Viel Spaß im Gang.
Und selbst die hätten keine Chance: Die Tür ist ein *Stöpsel*, größer als das Loch. Sie geht zuerst nach *innen* auf – gegen den Druck.
[excited] Darum bleibt sie oben *zu*. Übrigens: Draußen ist es kälter als minus *50* Grad.
Würdest du dich jetzt noch an den Notausgang setzen? Schreib's in die Kommentare.
```

- Hook title `<em>Tür</em> auf?!`; `hf-config`: question
  `Geht die <em>Tür</em> auf?`, answer `zu`.
- Facts: cruise ~10–12 km (Everest 8,8 km); cabin ~0,75–0,8 bar vs.
  ~0,2–0,25 bar outside → ~0,55 bar ≈ 5,5 t per m², a door of ~1,5 m² →
  several tonnes, ~5,5 t per m² ≈ an adult elephant (~8 t ÷ ~80 kg pull per person ≈ 100 people); passenger doors are plug doors that first move inward;
  ~−50 to −56 °C at 11 km.
- Loop map: 0–36 s Geht die Tür auf? · 9–15 s Warum ist die Luft dein Problem? ·
  20–23 s Wie viele Leute? · 23–34 s Warum hätten selbst die keine Chance?
- Visual plan: frame 0 the hand on the door lever inside a sunny cabin,
  window with clouds → Folge 1 cutaway of the plane over the clouds, thin
  air outside (few particles), air pumped in (many) → Folge 2 yellow force
  arrows press the door into the frame, LED "MEHRERE TONNEN", slowmo →
  Folge 3 x-ray of the door as a plug, ✕ when it tries to move inward →
  payoff the hand pulls, door doesn't move, the question fades →
  Übrigens: frost on the outside of the window, LED "−50 °C".

## Self-check (in addition to script-formel.md's)

- [ ] No spoken "Was passiert, wenn …?" — sentence 1 is the act already happening (≤ 8 words) or the warning
- [ ] Sentence 2 starts the act; the outcome is **not** revealed before the payoff
- [ ] 3 Folgen, each bigger than the last, each ending with a pull
- [ ] The `answer` word is spoken only in the payoff
- [ ] Safe: impossible / harmless / warning-only, no how-to, facts checked
- [ ] Frame 0: the viewer's hand doing the act, with sound
