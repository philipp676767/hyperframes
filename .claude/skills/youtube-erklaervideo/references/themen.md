# Themen — Claude picks the topic of every long video

Same rule as the TikTok series: **Claude chooses the topic** (autopilot);
if the user names one, take theirs (still run the duplicate check and say
if it was done before). A long video lives **10–12 minutes** — the topic
must carry **at least 15 real, showable facts**, not three stretched ones.

**Main type since 2026-11-14 (user's wish): „Große Momente“** — the story
of a real moment of science and technology history everybody has heard of
(the first Moon landing, the atomic bomb, the Titanic …), told as a thriller
and explained: what really happened, how the technology worked, the
moment it almost went wrong. Pick from **Offen — Große Momente** first;
the other types (list below it) are the reserve, at most every third video.

## 0. Where topics come from: US hit, no German version (user, 2026-11-25)

**Rule: take topics that already work in the USA (English YouTube) in our
niche, but have no good German version yet — and that matter to German
viewers (step 3).** The US numbers prove the
demand, the gap means a German viewer who searches it finds us — not
twenty others. This is the first filter for every pick; the scorecard
(§3) comes after.

**Our niche** (where to look): big moments of science / technology
history and engineering disasters, told as a story and explained with 3D
— dam breaks, collapses, shipwrecks, air and space accidents, reactor
accidents, record machines, „the moment it almost went wrong“. US
reference channels: Plainly Difficult, Fascinating Horror, Jared Owen and
Mike Bell (3D cut-aways), Brick Immortar, Mentour Pilot / Black Box, Real
Engineering, Kyle Hill, Brew („minute by minute“), Mustard, Sabin Civil
Engineering, The Infographics Show, Real Stories, LEMMiNO, Veritasium.

**1. Find US hits** (Tube_Alfred, each call costs 1 TubeAlfred credit —
budget ≈ 8–10 calls per pick):

- 2–3 `youtube_search_query` in English, `sort: popularity`,
  `type: video` (e.g. „what really happened disaster explained 3d“,
  „engineering disaster minute by minute“, „<niche word> explained“; add
  `upload_date: year` once for what is hot now).
- A **US hit** = one English video **≥ 1 Mio. views**, or **2+ channels
  ≥ 300 K** on the same story (several channels = the topic itself pulls,
  not one channel's audience).

**2. Check the German gap** — `youtube_search_query` with the German
search word (relevance), once per candidate:

- Count only **German-speaking channels**. Careful: YouTube shows English
  videos with an auto-translated title („Was geschah mit dem Hindenburg?“
  is Jared Owen, English) — the channel name / description language
  decides.
- **Lücke (gap)** = no German-original video **≥ 100 K views** on exactly
  this story, and none better than ours could be (3D, 10 min, explained).
- **Halbe Lücke** = one or two German videos 50–300 K, old (> 4 years),
  short (< 8 min) or without explanation / 3D → still possible, scores
  lower.
- **Keine Lücke** = a German video ≥ 300 K or a big German channel
  (Terra X, Ridddle DE, MrWissen2go …) covered it in the last 3 years →
  don't pick it as the main video.

**3. Check that it matters to Germans** (user, 2026-11-25: „die Themen
sollten auch für Deutsche relevant sein“). A US hit is not enough — many
US hits are US stories (a Californian dam, the Big Dig in Boston, a US
court case) that nobody here cares about. Score the **Deutschland-Bezug**:

- **2 = clearly relevant** — at least one of: a name every German knows
  (Titanic, Tschernobyl, Apollo, Pompeji); it happened in Germany / Austria /
  Switzerland or right next door (the Alps, the North Sea, Northern Italy,
  holiday regions Germans know); Germans were involved (engineers,
  victims, the machine was built here — Zeppelin, Rhine, Autobahn); or it
  could happen here tomorrow and the viewer sees why (a dam, a bridge, a
  mall, a nuclear plant, a train like the ICE).
- **1 = universal, but far away** — nobody here knows the name, yet the
  „Was hat das mit dir zu tun?“ line works (a building that could stand in
  any German city, a technique everyone uses).
- **0 = a US / foreign story without a bridge to here** — don't pick it,
  however big it is in the USA.

Write the bridge in one sentence into the row (it becomes the hook's
„warum geht dich das an“ line), e.g. Vajont: „Mitten in den Alpen, keine
Tagesreise von München — und auch bei uns stehen Hunderte Talsperren.“

**4. Write it down** in the candidate's table row (column „US / DE“):
the US proof (title, channel, views) and the German result (best German
video + views, or „keine“), with the date. Re-check when you actually pick
it — the gap can close.

Checked 2026-11-25 (example of the method):

| Story                                                      | US proof                                                                                       | German result                                   | Verdict         | Deutschland-Bezug                                    |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------- | --------------- | ---------------------------------------------------- |
| Vajont-Staudamm 1963 (die Welle, die über den Damm schlug) | Sabin Civil Engineering 2,9 Mio., Fascinating Horror 1,7 Mio., Eclesso 1,0 Mio., Mentour 441 K | the German search shows only English videos     | **Lücke**       | 2 — Alpen, Nachbarland, Talsperren gibt es auch hier |
| Sampoong-Kaufhaus 1995                                     | Brick Immortar 2,0 Mio., Brew 1,9 Mio., Plainly Difficult 1,7 Mio.                             | „Überleben“ 59 K (Nov 2026, 19 min), rest < 2 K | **halbe Lücke** | 1 — fern (Seoul), aber „dein Einkaufszentrum“ trägt  |
| Hindenburg 1937                                            | Jared Owen 11 Mio.                                                                             | Ridddle DE 133 K, Deconstructed (DE) 3,2 Mio.   | **keine Lücke** | 2 — deutsches Luftschiff                             |

## 1. Duplicate check — always, before picking

A topic counts as **used for YouTube** if any of these matches it (same
object or scenario, also under another name):

1. `youtube/serie.md` (finished long videos),
2. a folder in `youtube/` (videos in progress),
3. the **Reserviert** table below (a parallel chat already took it),
4. remote branches: `git fetch origin && git branch -r`.

A topic that was a **TikTok** (`tiktok/serie.md`) is **not** used for
YouTube — it is a candidate for the long version (bonus below), as long as
the long video goes much deeper than the 45 s.

## 2. What works for long explainers (research: "Dinge Erklärt – Kurzgesagt" DE, 2026)

**Große Momente (main type, story + science):** a real historic moment
of science / technology, told chronologically like a thriller — the
countdown, the people, the machine explained in x-ray, the second where
it almost failed, what it changed for you today. It carries 10 min by
itself (a story with stakes keeps people longer than a list of facts),
the 3D diorama can rebuild the place and the machine, and the search word
is a famous name („Apollo 11“, „Titanic“, „Tschernobyl“). Rules:

- **Story frame:** hook = the most dramatic second (the alarm in the lunar
  module, the flash in the desert), then back to how it came to that;
  chapters in time order, each ending on a cliffhanger („Und dann geht im
  Cockpit ein Alarm los, den keiner kennt.“). The re-hook is the moment it
  almost went wrong.
- **Explain the science in every chapter** — this is an explainer, not a
  history lesson: how the rocket, the reactor, the bomb, the hull worked,
  with everyday comparisons. Max 2 terms per chapter.
- **„Was hat das mit dir zu tun?“** in the hook (10–20 s) and the finale:
  what is in your phone, your kitchen, your life today because of it.
- **Facts are checked** (dates, numbers, names); legends are called legends
  („Angeblich …“, „Ob er das wirklich gesagt hat, ist umstritten.“).
- **Serious topics with respect:** victims (Hiroshima, Tschernobyl,
  Titanic, Challenger) are named with respect, no jokes, no gore, no
  spectacle on people's suffering; the 3D shows machines, places and
  scale, never dying people. Never a how-to (no bomb design, no
  instructions) — the physics in plain principle only.
- People appear as low-poly figures / silhouettes, never as a likeness of
  a real person's face; no real logos.

| Type                                                 | Examples with views                                                                                                                         | Why it carries 10 min                                                     |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **„Was passiert, wenn …?“ — catastrophe / scenario** | „… der Mond in die Erde kracht?“ (5,1 Mio.), „… alle Atombomben gleichzeitig zünden?“ (8,6 Mio.), „… ein Supervulkan ausbricht?“ (2,2 Mio.) | a timeline of consequences, each chapter one stage, the end is the payoff |
| **Extreme places**                                   | „Was verbirgt sich am tiefsten Punkt des Ozeans?“ (5,8 Mio.), „… im tiefsten Loch der Welt?“, „Der furchtbarste Ort im Universum“           | a journey downwards / outwards, one stop per chapter                      |
| **Dein Körper**                                      | „Dein Gehirn ist Wahnsinn!“, „Das Immunsystem erklärt“, Tattoos im Immunsystem, Mückenstich (1,2 Mio.)                                      | it concerns everyone personally; a fight / a process in stages            |
| **„Wie funktioniert X wirklich?“ — everyday tech**   | „So funktioniert das Internet wirklich!“ (1,3 Mio.), „Kupplung, wie funktioniert sie?“ (4,8 Mio.), Waschprogramme (264 K in 6 Monaten)      | a thing in your hand, the inside revealed layer by layer                  |
| **„Minute für Minute“ timelines**                    | „Was passiert in deinem Körper, wenn du … Minute für Minute“                                                                                | the clock is the open loop — viewers stay for the next stage              |
| **„Die Wahrheit über …“ — provocative**              | „Alkohol ist GROSSARTIG“, „Die unbequeme Wahrheit über Ozempic“                                                                             | a strong claim, then the twist; comments argue                            |

Our strongest TikTok topics (`tiktok/lernlog.md` — Taschenwärmer 13K,
Face ID 6.1K, UV-Nagellampe viral) are **long versions with a proven
hook**: the TikTok / Short then works as a trailer and links to the long
video (YouTube Shorts: „Ähnliches Video“ → the long one).

## 3. Scorecard — score the candidates (max 22), take the best

1. **Suchinteresse** — 2 = people search it in German (YouTube search
   suggestions / `youtube_search_suggest` when Tube_Alfred is available,
   big videos on the topic exist), 1 = some, 0 = nobody types it.
2. **„Was?!“-Faktor** — 2 = a stranger says "Was?!" out loud (tonnes,
   explosions, space, the deep sea, your own body doing something absurd),
   1 = "interessant", 0 = nice to know.
3. **Trägt 10 Minuten** — write the **fact inventory first**: 2 = **15+**
   true, showable facts that escalate (one per ~40 s), 1 = 10–14, 0 = fewer.
4. **Thumbnail-tauglich** — 2 = one object / face big, a clear contrast,
   2–5 words that name the topic make you curious (the Moon an inch above the Earth; a hand
   with a glowing nail), 1 = needs explaining, 0 = no single picture.
5. **Kapitel-Struktur von selbst** — 2 = it has natural stages (timeline,
   journey, layers, a fight in rounds), 1 = has to be invented, 0 = one
   idea only.
6. **Für 18–34, Männer und Frauen** — their day or the big 2-a.m.
   "Was wäre, wenn" (space, end of the world, deep sea, your body).
7. **Zeig-/Kommentar-Faktor** — 2 = viewers answer about themselves
   (their habit, their guess, their side), 1 = an opinion, 0 = nothing.
8. **3D-Spektakel** — 2 = at least 4 money shots the diorama style can show
   big (impact, eruption, flood, x-ray inside the body), 1 = 2–3, 0 = talk.
9. **US-Hit, keine deutsche Version** (§0, **counts double: 0–4**) — 4 =
   US hit + Lücke, 2 = US hit + halbe Lücke, or Lücke without a clear US
   hit, 0 = keine Lücke or no US proof.
10. **Deutschland-Bezug** (§0 step 3) — 2 = clearly relevant for Germans,
    1 = universal but far away, **0 = never pick** (whatever the other
    scores).

Criteria 1–8 and 10 score 0–2 each (max 22).

Bonus: **+2** a TikTok of ours on it did well (lernlog), **+2** viewers asked
for it in comments, **+1** a real trend of this week (never just a season).
Pick nothing under **17 / 22** and nothing with 0 in criterion 10; prefer a topic with 4 in criterion 9 **and** 2 in criterion 10 whenever one reaches 17. Vary the type from the last 2 long videos.
Check the key facts and numbers before writing (web search when available)
and phrase anything uncertain safely („Forscher schätzen …“).

## 4. Reserve it right away — the first commit of the chat

Add the row to **Reserviert** (topic, type, date, chat title
`YouTube #<Nr>: <Thema>` — Nr = the YouTube count, SKILL.md step 0a), commit +
push on `main` immediately; on a rejected push: pull, re-check nobody took
it, push again. When the video is logged in `youtube/serie.md`, delete the
row here and move the topic out of **Offen**; keep **10+ open topics**.

## Offen — Große Momente (main type, pick from here first)

Scores: the 8 criteria of §3 (max 16) + bonus, estimated 2026-11-14 —
**before 2026-11-25, without criterion 9**: run the US / DE check of §0
for each before you pick it (it can add up to 4 or kill it). Check the
search interest and the facts again when you pick.

**Checked with §0 (pick from these first):**

| Thema (Arbeitstitel)                                                               | Was?!-Fakten (Auswahl, prüfen)                                                                                                                                                                   | Der Fast-schiefgegangen-Moment (Re-Hook)                                                         | Thumbnail-Idee                                            | US / DE (2026-11-25)                                                                                                                                              |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vajont — die Welle, die über den Damm schlug                                       | 1963; einer der höchsten Staudämme der Welt (262 m); 270 Mio. m³ Berg rutschen in den See; Welle ~250 m über die Dammkrone; Longarone in Minuten zerstört, ~2.000 Tote; der Damm steht bis heute | Monate vorher bewegte sich der Hang schon — Messungen, Warnungen, und man staute trotzdem weiter | Damm intakt, riesige Welle schlägt darüber, Dorf darunter | US-Hit (2,9 Mio. / 1,7 Mio. / 1,0 Mio.) · **Lücke** · DE-Bezug 2 („Mitten in den Alpen, keine Tagesreise von München — auch bei uns stehen Hunderte Talsperren.“) |
| Sampoong — das Kaufhaus, das in 20 Sekunden einstürzte                             | 1995 Seoul; aus Bürohaus wurde Kaufhaus; Säulen dünner, Klimaanlagen aufs Dach geschleift; Risse am Morgen; 502 Tote                                                                             | Die Chefs sahen die Risse und ließen offen — und gingen selbst raus                              | Kaufhaus, ein Flügel knickt ein, Risse leuchten           | US-Hit (2,0 / 1,9 / 1,7 Mio.) · halbe Lücke („Überleben“ 59 K) · DE-Bezug 1 (Seoul — Brücke: „Das könnte dein Einkaufszentrum sein.“)                             |
| Thema (Arbeitstitel)                                                               | Was?!-Fakten (Auswahl, prüfen)                                                                                                                                                                   | Der Fast-schiefgegangen-Moment (Re-Hook)                                                         | Thumbnail-Idee                                            | Score                                                                                                                                                             |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------                                                            | -----------------------------------------------------------------------------------              | --------------------------------------------              | ----------------------------------                                                                                                                                |
| Die Atombombe — wie aus einer Formel eine Waffe wurde                              | E = mc²; Uran-Kettenreaktion (nur Prinzip); Trinity-Test 1945 in der Wüste; heller als die Sonne; Hiroshima und Nagasaki                                                                         | Die Forscher wetteten, ob der Test die Atmosphäre in Brand setzt                                 | greller Blitz über der Wüste, winzige Bunker              | 15                                                                                                                                                                |
| Apollo 13 — „Houston, wir haben ein Problem“                                       | Sauerstofftank explodiert 330.000 km von der Erde; Mondfähre als Rettungsboot; CO₂-Filter aus Klebeband gebaut; Kälte in der Kapsel                                                              | Der Wiedereintritt: 4 Minuten Funkstille, keiner weiß, ob sie leben                              | beschädigte Kapsel im All, Erde weit weg                  | 15                                                                                                                                                                |
| Wie wurden die Pyramiden gebaut?                                                   | 2,3 Mio. Blöcke; ~20 Jahre; Rampen-Theorien; Arbeiter, keine Sklaven; früher glatt und weiß                                                                                                      | Ein Block alle paar Minuten — 20 Jahre lang (Rechnung prüfen)                                    | Riesen-Pyramide im Bau, winzige Arbeiter                  | 15                                                                                                                                                                |
| Der erste Mensch im All — Juri Gagarin                                             | 1961; 108 Minuten; landete per Fallschirm neben der Kapsel; Bauern auf dem Feld; Raumkapsel kleiner als ein Auto                                                                                 | Die Bremsrakete versagt halb, die Kapsel taumelt beim Wiedereintritt                             | Kugel-Kapsel glüht über der Erde                          | 14                                                                                                                                                                |
| Der erste Flug — die Gebrüder Wright                                               | 1903; 12 Sekunden, 37 m — kürzer als ein Airbus A380 lang ist; Fahrradmechaniker; selbstgebauter Windkanal                                                                                       | Die ersten Versuche krachen — und dann hebt er ab                                                | Holzflieger über Dünen, Mensch läuft daneben              | 14                                                                                                                                                                |
| Pompeji — der Tag, an dem der Vesuv ausbrach                                       | 79 n. Chr.; Aschewolke 30 km hoch; Glutlawine mit über 100 km/h; Stadt 1.700 Jahre verschüttet; Brot im Ofen erhalten                                                                            | Die Leute hatten Stunden Zeit — und viele blieben                                                | Vulkan über der antiken Stadt, Aschesäule                 | 14                                                                                                                                                                |
| Penicillin — der schmutzige Teller, der Millionen rettete                          | 1928 Fleming; Schimmel tötet Bakterien; vorher starb man an einem Kratzer; Massenproduktion im Krieg; heute: resistente Keime                                                                    | Fast vergessen: 10 Jahre lang tat niemand etwas damit                                            | Petrischale mit Schimmel-Kreis im Makro                   | 14                                                                                                                                                                |
| Das Hindenburg-Unglück (US/DE: **keine Lücke**, 2026-11-25 — nicht als Hauptvideo) | 1937; 245 m lang — größer als die Titanic war breit (prüfen); mit Wasserstoff gefüllt; in 34 Sekunden verbrannt; Ende der Luftschiffe                                                            | 62 von 97 Menschen überlebten — wie?                                                             | brennendes Luftschiff über dem Mast                       | 13                                                                                                                                                                |
| Die Concorde — Überschall für alle, und warum es sie nicht mehr gibt               | 2× Schallgeschwindigkeit; London–New York in 3,5 h; Rumpf wurde 20 cm länger vor Hitze; Überschallknall; Absturz 2000                                                                            | Ein Metallstreifen auf der Piste brachte sie zum Absturz                                         | weiße Concorde, Hitzeflimmern                             | 13                                                                                                                                                                |
| Das erste iPhone — der Tag, der dein Leben verändert hat                           | 2007; Prototypen stürzten auf der Bühne fast ab; Steve Jobs' festgelegte Reihenfolge; vorher Tasten-Handys                                                                                       | Die Demo funktionierte nur, wenn er alles genau in der richtigen Reihenfolge machte              | Handy aus Licht über Tasten-Handys                        | 13 (Logos/Personen nur angedeutet)                                                                                                                                |

## Offen — weitere Typen (Reserve, höchstens jedes dritte Video)

| Thema (Arbeitstitel)                                                                   | Typ                | Was?!-Fakten (Auswahl, prüfen)                                                                                               | Thumbnail-Idee                                | Score |
| -------------------------------------------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ----- |
| Was passiert, wenn der Mond in die Erde kracht?                                        | Szenario           | Roche-Grenze ~18.000 km: der Mond zerbricht vorher; Ring um die Erde; Gezeiten-Monsterfluten; Trümmerregen; Tag wird kürzer  | Mond riesig über einer Stadt, Risse           | –     |
| Was verbirgt sich am tiefsten Punkt des Ozeans?                                        | Extremer Ort       | Marianengraben ~11 km; 1.000 bar; Licht endet bei ~1.000 m; Anglerfisch; Mount Everest passt hinein; Mikroplastik ganz unten | U-Boot-Scheinwerfer im Schwarz, Anglerfisch   | –     |
| Was passiert, wenn ein Supervulkan ausbricht?                                          | Szenario           | Yellowstone; Ascheschicht über halb USA; vulkanischer Winter; Toba vor 74.000 Jahren                                         | glühender Krater von oben, Ascheschirm        | –     |
| Was passiert in deinem Körper bei einem Mückenstich?                                   | Dein Körper        | 6 Stechborsten; Speichel betäubt; Histamin; warum es juckt; warum manche öfter gestochen werden                              | Riesige Mücke auf Haut im Makro               | –     |
| Taschenwärmer — die ganze Chemie (lange Version, TikTok #18 13K)                       | Wie funktioniert X | Natriumacetat; unterkühlte Schmelze; Kristallfront rast durch die Flüssigkeit; 54 °C; wieder aufkochen; Wärme aus Ordnung    | Hand knickt das Plättchen, Kristalle schießen | –     |
| Face ID — wie dein Handy dein Gesicht kennt (lange Version, TikTok #23 6.1K)           | Wie funktioniert X | 30.000 Punkte; Infrarot; 1 zu 1 Mio.; Zwillinge; Masken-Tests; Neural Engine                                                 | Gesicht voller roter Punkte                   | –     |
| UV-Nagellampe — was dabei mit deinen Nägeln passiert (lange Version, TikTok #36 viral) | Dein Look          | Photoinitiator; Polymerisation in Sekunden; warum es heiß wird; UV-Dosis vs. Sonne; Allergien                                | Hand unter violettem Licht, glänzende Nägel   | –     |
| So funktioniert das Internet wirklich                                                  | Wie funktioniert X | Seekabel; Lichtpulse; Pakete; 99 % über Kabel, nicht Satellit; Haie beißen Kabel                                             | Seekabel am Meeresgrund, leuchtende Daten     | –     |
| Was passiert, wenn du 3 Tage nicht schläfst — Stunde für Stunde                        | Minute für Minute  | Mikroschlaf; Halluzinationen; Rekord 11 Tage; Gehirn räumt nachts auf                                                        | Gesicht mit aufgerissenen Augen, Uhr          | –     |
| Was passiert, wenn alle Atombomben gleichzeitig zünden?                                | Szenario           | ~12.000 Sprengköpfe; nuklearer Winter; Ruß in der Stratosphäre; Ernteausfälle                                                | Erde mit Lichtblitzen von oben                | –     |
| Die Wahrheit über Energy Drinks                                                        | Wahrheit über      | Koffein vs. Kaffee; Taurin-Mythos; Zucker; Herz; Crash                                                                       | Dose, die wie eine Batterie glüht             | –     |
| Was ist im tiefsten Loch der Welt? (Kola-Bohrung)                                      | Extremer Ort       | 12,2 km; 180 °C; Gestein wie Plastik; Mikrofossilien; Wasser in 10 km Tiefe                                                  | Bohrloch-Schnitt durch die Erde               | –     |

## Reserviert (in Arbeit)

| Thema                                        | Typ           | Datum      | Chat                  |
| -------------------------------------------- | ------------- | ---------- | --------------------- |
| Pompeji — der Tag, an dem der Vesuv ausbrach | Große Momente | 2026-11-23 | YouTube #4: Pompeji   |
| Wie wurden die Pyramiden gebaut?             | Große Momente | 2026-11-25 | YouTube #5: Pyramiden |
