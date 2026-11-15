# Verpackung — title, thumbnails, description (they decide the clicks)

On YouTube the click comes from **title + thumbnail**, the watch time from
**the hook keeping their promise**. So they are fixed **before the script**
(SKILL.md step 2), and the hook proves exactly this promise in 0–10 s.

## Titel

- **≤ 60 characters**, German, **search word first** (the name people type:
  „Mond“, „Marianengraben“, „Mückenstich“, „Taschenwärmer“).
- **Curiosity without clickbait:** a question or a strong claim the video
  really answers — „Was passiert, wenn der Mond in die Erde kracht?“,
  „Marianengraben: Was ganz unten wirklich lebt“, „Mückenstich: Darum juckt
  es wirklich“. Max one word in capitals for stress (`GROSSARTIG`), max one
  emoji, no "#shorts", no hashtags in the title.
- Write **five**, score them (search word first? ≤ 60? curiosity? true?
  fits the thumbnail without repeating it?) and take the best. The
  thumbnail text and the title **complement** each other — never the same
  words twice.

## Thumbnails — always 3 variants (YouTube "Test & Compare")

YouTube tests up to three thumbnails against each other and keeps the one
with the most watch time — so every video ships **3 really different
variants**, not three colourings of one picture.

### Rule 1 — a stranger knows the topic in one second (user, 2026-11-15)

YouTube #1 Apollo 11 had „NOCH 30 SEK.“, „WAS IST 1202?“ and „111 METER“:
details that only mean something **after** watching the video. A viewer in
the feed saw a lander, a keypad, a rocket — and no word saying _Mondlandung_.
The user: _„Die Sprüche auf den Titelbildern sagen überhaupt nichts aus und
sagen dem Zuschauer überhaupt nicht, um was es geht.“_ Thumbnail guides say
the same: viewers should never have to guess what a video covers;
**clarity about the subject, curiosity only in the angle**.

- **The thumbnail text names the topic or the claim in words everyone
  knows** — the famous name or event + what is surprising about it:
  „MONDLANDUNG FAST GESCHEITERT“, „DIE TITANIC SANK ANDERS“,
  „DER MOND STÜRZT AB“, „WARUM MÜCKENSTICHE JUCKEN“. Never an
  insider detail from inside the video (a code, a time, a measurement) on
  its own — „1202“, „30 SEK.“, „111 METER“ are only allowed **next to** the
  known name („MONDLANDUNG: NOCH 30 SEKUNDEN“).
- **The picture shows the iconic, recognisable subject** — the thing
  people picture when they hear the name (the lunar module on the Moon with
  the Earth in the sky, the Titanic tilting, the mushroom cloud), big and
  clear. A detail (a keypad, a valve, a cell) only as variant B, and then
  the text must name the topic.
- **The one-second test** (do it for each variant, write the result in
  `plan.md`): cover the title, look at the thumbnail at 246×138 for one
  second, and finish the sentence „Das Video handelt von \_\_\_.“ — if the
  answer is not the topic, change text or picture.
- **Text + title = one message from two sides**, never the same words, but
  both understandable alone: title „Apollo 11: Die Mondlandung wäre fast
  gescheitert“ + thumbnail „FAST ABGESTÜRZT“ over the lander on the Moon —
  or title „Warum die Mondlandung fast scheiterte“ + thumbnail „APOLLO 11:
  12 MINUTEN PANIK“.
- **2–5 words** (was „max 3“ — clarity beats shortness), huge, max 2
  lines, keyword yellow in `<em>`.

### Rule 2 — readable on a phone

- **1280×720** (`scripts/make-thumbnail.sh` in any chapter: renders the 3D
  scene at one moment, optional camera override, text + dark gradient,
  hides captions, labels and the LED panel).
- **One object or face, big** (≥ ⅓ of the frame), **strong contrast**
  (bright subject on dark, warm on cold), one accent colour.
- Text on the side away from the subject (`links` / `rechts`) or across
  `oben` / `unten`.
- **Phone test:** scale it to 246×138 (the size in the mobile feed) —
  readable? subject clear? topic clear (rule 1)?

### The three variants — same topic, three angles

All three say what the video is about (rule 1); they differ in **one big
decision** each:

| Variant                                      | Idea                                                                           | Apollo 11 (how it should have been)                                                         |
| -------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| **A — the iconic subject + the claim**       | the famous picture of the topic, in its most dramatic moment, + the main claim | lander a few metres above the Moon, dust, Earth in the sky — „MONDLANDUNG FAST GESCHEITERT“ |
| **B — the human / the detail + the name**    | a face, a hand or the key detail big, the topic named in the text              | astronaut's visor reflecting the Moon — „APOLLO 11: DER ALARM“                              |
| **C — the number / the contrast + the name** | a size or number comparison, the topic named                                   | tiny lander vs. the computer of a phone — „MONDLANDUNG MIT 4 KB“                            |

Save them as `youtube/<slug>/thumb-a.png`, `-b.png`, `-c.png` (commit; LFS).

## Beschreibung

The first ~150 characters show in search and above "mehr" — they carry
the search words.

```text
<Satz 1: Suchwort + was das Video beantwortet — ohne den Payoff zu verraten.>
<Satz 2: zweites Suchwort / die überraschendste Station, als Neugier.>

0:00 <Hook-Kapitel-Titel>
0:31 <Kapitel 1>
…
11:02 <Finale>

Abonniere den Kanal für mehr Geschichten wie diese.

#<thema> #<feld> #wissen
```

- **Chapters** (`kapitelmarken.txt`, written by `join-chapters.sh` from the
  real chapter lengths): the first at **0:00**, at least 3, each ≥ 10 s —
  then YouTube shows them as chapters in the progress bar. Titles **short
  and curious** (2–5 words, from `kapitel.js titel`): „Der erste Riss“,
  „Die Monster-Flut“, „Die Antwort“ — never „Kapitel 3“ or „Einleitung“.
- „Abonniere den Kanal für mehr Geschichten wie diese.“ — the channel's ask (YouTube wording, never „Folge …“).
- **3–5 hashtags**: topic first, a field tag, `#wissen` or `#wissenschaft`;
  never `#fyp`, `#viral`; no `#shorts` (this is long form).
- If there is a matching Short / TikTok: one line „Kurzversion: <Titel>“.

## Tags

8–12 comma-separated search words: the names and spellings people type
(incl. without umlauts and English names), the "was passiert wenn …"
phrase, the field. Max 500 characters. YouTube says they matter little —
quick, but done.

## Einstellungen (same as the Shorts in the TikTok skill, step 6d)

- **Thumbnail:** variant A as the main one; **Test & Compare** with A, B, C.
- **Zielgruppe:** „Nein, nicht speziell für Kinder“ · **Altersbeschränkung:** nein
- **Bezahlte Werbung:** nein · **Veränderte oder synthetische Inhalte: ja**
  (AI voice)
- **Sprache:** Deutsch · **Untertitel:** Deutsch (YouTube automatisch; the
  burned-in captions stay)
- **Kategorie:** Bildung · **Kommentare:** an, „Top“ · **Lizenz:** Standard
- **Endbildschirm** (last 20 s, the picture is free of text there): left an
  element „Video — am besten für den Zuschauer“ or the named next video,
  right „Abonnieren“; both in the middle band (y ≈ 260–760 px of 1080).
- **Karten:** at the re-hook a card to the matching Short / older video
  (optional).
- **Kapitel:** automatic from the time stamps in the description (on).
- **Sichtbarkeit:** Öffentlich (or scheduled when the user wants).
- **Kommentar anpinnen:** one ready comment (the comment question in other
  words or Jan's own answer) — post and pin it right after the upload.

## `upload.txt` — one file, one copy block per field in the delivery message

```text
TITEL
…

BESCHREIBUNG
…

TAGS
…

KOMMENTAR (anpinnen)
…

EINSTELLUNGEN
Thumbnail: thumb-a.png (Test & Compare: a, b, c) · Nicht für Kinder · Altersbeschränkung: nein · Bezahlte Werbung: nein · Synthetische Inhalte: ja · Sprache: Deutsch · Kategorie: Bildung · Kommentare: an · Endbildschirm: Video links, Abonnieren rechts · Kapitel: an · Öffentlich
```

In the delivery message every field is **its own code block** holding only
the text that goes into that field (one tap = one field, as in the TikTok
skill): Titel, Beschreibung (incl. chapter marks + hashtags), Tags,
Kommentar zum Anpinnen; the settings as a short bullet list.
