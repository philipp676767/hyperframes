# Themen — Claude picks the topic

The user decided (2026-10-23): **Claude chooses the topic of every video.**
A video chat that starts without a topic ("mach das nächste Video", "neues
Video") picks one from this file; if the user names a topic, use theirs
(still run the duplicate check and say if it was done before).

## 1. Duplicate check — always, before proposing

A topic counts as **used** if any of these matches it (same object, also
under another name: Sodastream = Wassersprudler = Sprudelmaschine):

1. `tiktok/serie.md` (finished episodes),
2. a folder in `tiktok/` (episodes in progress have a folder before they
   are logged — e.g. `tiktok/geldautomat/`),
3. the **Reserviert** list below (a parallel chat already took it),
4. remote branches: `git fetch origin && git branch -r` (an episode left
   on a side branch).

Run `git pull origin main` first, then `ls tiktok/` and read
`tiktok/serie.md` and this file. Never propose a used topic; a remake of
an old episode only when the user asks for one.

## 2. Pick — criteria

### What our numbers say — read this first (user's statistics, 2026-11-17)

| Top                                   | Views     | Why it worked                                                                               |
| ------------------------------------- | --------- | ------------------------------------------------------------------------------------------- |
| #36 UV-Nagellampe (A, Look)           | **230 K** | the viewer's own look, a treatment she knows from the studio, a community that shows itself |
| #46 Blondieren (A, Look)              | **30 K**  | same: own hair, the salon, a shock everyone fears („erst orange“)                           |
| #65 10-Meter-Turm (B, Bauchklatscher) | **30 K**  | a body moment you **feel** while watching („Autsch!“), everyone stood on that tower once    |

| Flop (newest)                      | Why it failed                                                                     |
| ---------------------------------- | --------------------------------------------------------------------------------- |
| #67 Einen Tag nichts trinken (B)   | a health tip everyone has heard a hundred times — no surprise, no picture to feel |
| #73 Mit vollem Magen schwimmen (B) | an old myth („Oma sagt …“) — „kenn ich“, low stakes                               |
| #70 Hundenase (A, Look list)       | a cute fact about the dog, not about **you** — nothing at stake, nothing to feel  |
| #72 Rolltreppe (A, Detail-Rätsel)  | a small detail nobody cares about enough to stop scrolling                        |

**Rules from it (they beat the rest of this file when in doubt).** The
user does **not** want a beauty channel (2026-11-17) — the lesson is not
"beauty", it is **"about YOU"**: all three hits are about something the
viewer has done or felt with their own body or their own things.

0. **Sweet spot stays the first filter** (user, 2026-11-17: „nicht zu
   allgemein, nicht zu nischig“): the topic is **one concrete thing with
   its own name** — a device, product, treatment or place that millions
   in AT/CH/DE used this month (UV-Nagellampe, Blondieren, 10-Meter-Turm,
   Face ID, Taschenwärmer). A body phenomenon or feeling on its own
   („Hirnfrost“, „Musikantenknochen“, „Übelkeit im Auto“) or a whole
   field („Achterbahn“, „Strom“) is **not** a topic — it can only be the
   felt moment inside one.
1. **„Du-Thema“ first:** the topic is about something the viewer
   **personally does, owns or has felt** — their body, their routine,
   their stuff, their hobby (the tower in the pool, the salon chair, the
   gym, the car, the phone in their hand, the kitchen, the club, the
   plane seat). Not a fact about an animal, a machine part or the world
   out there. Mix the fields widely: sport, food, tech, travel, body,
   hobby, money, nature as you experience it. Look & Beauty stays one
   list among many (about every 4th–5th video at most, women's and men's
   topics alternating) — no focus on it.
2. **A felt moment:** the best topics have a moment the viewer feels
   while watching („Autsch“, the stomach drop, the cold, the heat, the
   shock „erst orange“). Format B always picks scenarios with such a
   body moment; format A looks for the feelable part of the thing.
3. **Avoid:** health tips and old myths everyone already knows (drink
   enough, wait after eating, chewing gum …), cute pet / animal facts,
   small machine details (Detail-Rätsel) — unless the topic still scores
   2 on Was?!, Zielgruppen-Schärfe **and** Zeig-Faktor.
4. **Scorecard bonus / malus:** Du-Thema (own body / own routine / own
   stuff) **+2**; a felt body moment **+2**; health tip / old myth, pet
   fact, Detail-Rätsel **−3**. No bonus just for being beauty.
5. **The test question:** „Has the viewer done or felt this themselves —
   or would they feel it while watching?“ If neither, think twice.

**The type comes first** (SKILL.md step 0, random among the types of `themenarten.md`, 2026-11-24): for
format A pick from **Offen — Format A „Bauen“**, **Offen —
Detail-Rätsel** (one small odd detail) or **Offen — Dein Look & dein
Hobby** (the science behind what viewers show off), for format B from
**Offen — Format B „Was passiert, wenn …?“** (its own criteria are
below that list). For format C pick from **Offen — Format C
„Bauwerke“** (criteria in `format-bauwerke.md`). The duplicate check covers both lists: an object that
already had an A episode is used for B too, and the other way round,
unless the question is clearly a different one (Aufzug was built in #3 →
„… wenn das Seil reißt?“ only if the user wants it).

**Audience (TikTok data, 2026-10-23):** over 93 % from AT/CH/DE, **77 %
aged 18–34, 51 % women / 45 % men.** TikTok still shows the account to
broad random scrollers nearby, so a topic must grab a young adult with no
special interest in technology — man or woman.

**Abgefahren-Faktor — first filter for both formats** (user's wish,
2026-10-23: „noch abgefahrenere Themen“): a topic only goes in when its
outcome or number makes a stranger say **„Was?!“** out loud — tonnes,
explosions, space, the deep sea, the Earth stopping, something absurdly
fast / hot / small. "Nice to know" is not enough. Topics marked **🔥**
are the wildest — but a 🔥 topic still needs the sweet spot
(Zielgruppen-Schärfe): a wild fact about a thing everybody knows beats a
wild fact about a thing nobody knows. **Pick by score**; 🔥 and ★ are
tie-breakers. In format B the best
topics are the extreme thought experiments (Weltall, Tiefsee, Erde,
Extrem-Physik): they are impossible, so they're also the safest. Keep at
least half of each list 🔥 and add new ideas the same way. Facts stay
correct — the wilder the claim, the more carefully it's checked.

**Scorecard — every candidate** (user's wish 2026-10-24: „Themen noch
passender und interessanter“). Score the open candidates of the format 0–2
on its six criteria below **plus these four**, and propose the best one
plus two alternatives **with their scores** (max 20; propose nothing under
15 — then come up with better ideas first):

- **Zielgruppen-Schärfe** (2026-10-30 — the sweet spot between too broad
  and too niche): 2 = **one concrete thing with its own name that a huge
  group uses or knows** (UV-Nagellampe, Face ID, Taschenwärmer, Blitzer,
  Glätteisen); 1 = a bit too broad or a bit too small; 0 = an abstract
  field („Licht“, „Strom“, „Chemie im Alltag“) or a mini niche
  (Teilchenbeschleuniger, Fangseil am Flugzeugträger). Test: does it
  have a name people search for — and are there millions in AT/CH/DE
  who used or saw it this month? Topics marked **⚠️ zu nischig** /
  **⚠️ zu allgemein** in the lists score 0–1 here.
- **Zeig-Faktor** (learned from the viral #36 UV-Nagellampe, 2026-10-30:
  viewers posted photos of their own nails in the comments): 2 = the
  viewer has something of their own to show (nails, hair, tattoo,
  coffee, car, sneakers, pet, plants, gym result) — and the comment
  question is about exactly that (without asking for a photo — they come
  on their own, 2026-11-03); 1 = a personal answer in words („Team
  Gel oder Lack?“); 0 = nothing personal. Photo comments are the
  strongest signal TikTok gets.

- **Was?!-Faktor** — 2 = a stranger says "Was?!" out loud (🔥), 1 = "oh,
  interessant", 0 = nice to know.
- **Trägt 45 Sekunden (Fakten-Inventar)** — write down the topic's
  "Was?!" facts _before_ scoring: 2 = **five or more** strong, true,
  showable facts (one per beat, one for the mid twist, the payoff, the
  "Übrigens"), 1 = three or four, 0 = fewer. A video on a two-fact
  topic gets boring at ~20 s — that is where viewers leave.

**What people really ask** (when web search is available): search the
topic the way viewers do ("warum wird …", "was passiert wenn …", "wie
funktioniert …" + the thing) and take the angle of the most asked
question — that is the hook question. Also check `tiktok/lernlog.md` for
which topics did best so far and for topics the comments asked for; a
topic viewers asked for gets +2.

Format A — score each open candidate on these six (+ the two above):

1. **Jeder kennt es** — used weekly by almost everyone in Germany, **or**
   a wild 🔥 machine everyone has seen in films or the news (rocket,
   ejection seat, MRT).
2. **Überraschendes Geheimnis** — the real mechanism contradicts what
   people assume ("ohne Strom", "wird gar nicht heiß", "hat keinen Akku").
3. **Spektakel zum Zeigen** — at least one money shot the 3D style can
   show big (spark, explosion, crystals shooting through, waves, flip).
4. **In 45 s erklärbar** — max 3 parts / terms, but enough to fill 3
   beats + a mid twist.
5. **Weitererzählbar / selbst testbar** — the viewer can try it today or
   tells a friend ("Hand auf den Induktionsherd").
6. **Für 18–34, Männer und Frauen** — part of _their_ day: phone,
   paying, food and coffee, beauty and hair, going out, sport, commuting.
   Prefer these over industry / energy / car-only topics. Topics marked
   ★ in the list fit best — pick those first.

Also: vary the category from the last 2 episodes (kitchen → street →
money/tech → nature …), run the **Trend-Check** (2b — trends are the exception, max one of three candidates you compare) and use the **Saison** column only as a hint (Silvester in late
December, Heizung / Taschenwärmer in winter, Klimaanlage / Ventilator in
summer). Before writing the script, check the key facts and numbers of
the topic (web search if available) and phrase anything uncertain safely.

## 2b. Trend-Check — topical when it fits, never forced

The user's wish (2026-10-26): **whenever it fits, take a topic that is
in the air right now** — like the flying Tesla the day it went viral, or
the Taschenwärmer when it got cold. **But only when it fits:** never dig
up some news item nobody cares about just to be current. An evergreen
topic that scores high always beats a weak trend.

Before every candidate, check two things (2 minutes, not a research
project):

1. **Right now** (web search when available, else what you know of the
   last days): a tech / science / everyday moment people talk about this
   week — a viral clip (Tesla flies, a rocket lands), a launch everyone
   sees (new iPhone, a new Deutschland-Ticket rule), a weather event
   (Hitzewelle, erster Schnee, Sturm, Glatteis), a big event (WM, Wiesn,
   Silvester). Ask: _would a young scroller in AT/CH/DE recognise it
   without context this week?_ If not, it's not a trend for us.
2. **The calendar** — only as an idea source for _real_ moments (the
   first snow, Silvester night), **not as a theme for the whole list**:

| Zeit       | Was alle gerade erleben                                 | Themen-Ideen                                                                  |
| ---------- | ------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Ende Okt   | Zeitumstellung, es wird kalt und früh dunkel, Halloween | Taschenwärmer ✓, Heizkörper-Thermostat, Funkuhr stellt sich um, Nebelmaschine |
| Nov        | Grau, Erkältung, Black Friday, St. Martin               | Fieberthermometer, Paketzustellung / Paketstation, Wärmflasche, Laterne       |
| Dez        | Advent, Glühwein, Schnee, Weihnachten, Silvester        | Lichterkette, Glatteis / Streusalz, Silvesterrakete, Wunderkerze              |
| Jan–Feb    | Kälte, Skiurlaub, Fasching, Vorsätze / Gym              | Schneekanone, Sessellift, Smartwatch-Puls, Eisdiele (Kältemaschine)           |
| März–April | Frühling, Zeitumstellung, Ostern                        | Pollen / Luftfilter, Funkuhr, Rasenmäher-Roboter                              |
| Mai–Aug    | Hitze, Gewitter, Urlaub, Festivals, Freibad             | Klimaanlage, Ventilator, Blitz im Auto, Flugzeug-Themen, 10-Meter-Brett       |
| Sept       | Schulstart, neues iPhone, Wiesn                         | Face ID ✓, Akku / Schnellladen, Bierzapfanlage, Achterbahn                    |

**How it goes into the pick — trends are the exception, not the
theme** (user's correction 2026-10-26: one round proposed only cold
topics; that is exactly what he did _not_ want):

- **"It's getting cold" / "it's summer" is not a trend.** A season gives
  **no bonus**. Only a concrete moment of _this week_ that strangers
  recognise without context (a viral clip, a launch, the first snow
  storm, Silvester night) gets **+2** — and still needs ≥ 12 / 16, the
  duplicate check and the format that is due.
- **At most one** of the three candidates you compare may be a trend or season topic;
  the other two are the best evergreen topics, **from three different
  categories** (never three times Kälte / Küche / Handy).
- **At most one seasonal topic in any three videos in a row**
  (`tiktok/serie.md`): after a cold topic (Taschenwärmer, Heizung …) the
  next two are not about cold — unless a genuinely hot trend comes up.
- No real trend this week → no trend topic, and the reservation line says "Kein
  echter Trend gerade — bestes Dauerthema". That is the normal case.
- A trend that only fits the other format: take the best evergreen
  topic (autopilot: never ask — the trend can go into the next video of
  the other format if it is still hot). A video on a hot
  trend should go out **within 1–3 days**; say so.

## 3. Reserve it right away

As soon as the user says ok: move the topic from its **Offen** list to
**Reserviert** with the date and the format, commit on `main` and push — _before_ the
script — so a parallel video chat can't take the same topic. When the
episode is logged in `tiktok/serie.md`, delete it from **Reserviert**.
When a topic from an **Offen** list is used up, add a new idea so there
are always 10+ open topics per format.

## Offen — Format A „Bauen“

| Thema                                      | Hook-Idee                                                                                                                                                       | Money-Shot                                                                | Kategorie     | Saison               |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------- | -------------------- |
| ★ Saugroboter                              | „Dein Saugroboter kennt deine Wohnung besser als du.“ (Laser-Karte, Fakten prüfen)                                                                              | Laserstrahl tastet das Zimmer ab, Karte entsteht als Gitter               | Haushalt      | –                    |
| ★ AirTag                                   | „Dein AirTag findet deinen Schlüssel ganz ohne GPS.“ (fremde iPhones als Helfer, Fakten prüfen)                                                                 | Signal springt von Handy zu Handy durch die Stadt                         | Handy         | –                    |
| ★ Schallzahnbürste                         | „Deine Zahnbürste wackelt 30.000-mal pro Minute.“ (Fakten prüfen)                                                                                               | Borsten in Zeitlupe, Wasser schäumt zwischen den Zähnen                   | Körper        | –                    |
| ★ Wasserkocher                             | „Dein Wasserkocher rauscht – kurz bevor er kocht, wird er still.“ (Fakten prüfen)                                                                               | Bläschen entstehen und platzen am Boden, dann sprudelt alles              | Küche         | –                    |
| ★ Waschmaschine (Schleudern)               | „Deine Waschmaschine schleudert schneller als ein Automotor.“ (Fakten prüfen)                                                                                   | Trommel im Röntgen, Wasser fliegt durch die Löcher                        | Haushalt      | –                    |
| ★ Supermarkt-Scanner                       | „Der Kassenscanner liest deine Milch in 0,1 Sekunden.“ (Fakten prüfen)                                                                                          | roter Laserfächer, Strichcode wird zu Zahlen                              | Alltag        | –                    |
| ★ Nachtmodus der Handykamera               | „Dein Handy fotografiert im Dunkeln – mit 15 Fotos auf einmal.“ (Fakten prüfen)                                                                                 | viele dunkle Fotos stapeln sich zu einem hellen                           | Handy         | –                    |
| ★ Thermoskanne                             | „Deine Thermoskanne hält Tee 24 Stunden heiß – ohne Strom.“ (Fakten prüfen)                                                                                     | Wärme prallt an der Vakuum-Lücke ab, Röntgen-Schnitt                      | Alltag        | Winter (kein Bonus)  |
| 🔥 Hitzeschild ⚠️ zu nischig               | „Die Raumkapsel wird beim Rückflug über 1.500 Grad heiß – und drinnen schwitzt keiner.“ (Zahl prüfen)                                                           | Kapsel glüht in Zeitlupe, Schild verkohlt Schicht für Schicht, innen grün | Weltall       | –                    |
| 🔥 Fangseil (Flugzeugträger) ⚠️ zu nischig | „Ein Kampfjet wird auf dem Flugzeugträger in 2 Sekunden von 240 km/h auf null gestoppt – von einem Stahlseil.“ (Zahlen prüfen)                                  | Haken fängt das Seil, Seil spannt sich, Jet steht, Pilot ruckt nach vorn  | Extrem        | –                    |
| 🔥 Magnetschwebebahn ⚠️ zu nischig         | „Dieser Zug berührt die Schiene nie – er schwebt knapp über ihr.“ (Abstand prüfen)                                                                              | Magnete ziehen den Zug hoch, Lichtspalt unter dem Zug, er rast los        | Reisen        | –                    |
| 🔥 Blitzableiter                           | „Ein Blitz ist heißer als die Sonnenoberfläche – und ein Draht leitet ihn sicher in die Erde.“                                                                  | Blitz schlägt ins Dach, rast den Draht runter, verpufft im Boden          | Zuhause       | Sommer               |
| 🔥 Teilchenbeschleuniger ⚠️ zu nischig     | „Unter der Grenze zur Schweiz rasen Teilchen fast so schnell wie das Licht im Kreis – 11.000 Runden pro Sekunde.“ (Fakten prüfen)                               | Teilchen rasen durch den Ring, prallen frontal zusammen, Funkenregen      | Extrem        | –                    |
| 🔥 Zeitumstellung / Atomuhr                | „Dein Handy weiß gar nicht, wie spät es ist – und stellt sich trotzdem selbst um.“ (Quarz driftet, Zeitserver, Cäsium 9,19 Mrd. Hz, GPS-Uhren laufen schneller) | Uhr springt 3:00→2:00, Atom schwingt, Zähler rast auf 9.192.631.770       | Handy         | Ende Okt / Ende März |
| ★ Haarspray                                | „Haarspray klebt deine Haare mit winzigen Plastik-Tropfen fest.“ (Fakten prüfen)                                                                                | Sprühnebel trifft Strähnen, Tropfen werden zu Schweißpunkten              | Beauty        | –                    |
| Heizdecke                                  | „Deine Heizdecke ist ein Draht, der sich selbst überwacht.“ (Fakten prüfen)                                                                                     | Draht glüht im Röntgenblick, Sensor-Faden schaltet ab                     | Zuhause       | Winter               |
| Ampel-Kontaktschleife                      | „Die Ampel weiß, dass du wartest. Im Asphalt liegt ein unsichtbarer Draht.“                                                                                     | Röntgenblick in die Straße, Auto fährt drauf, Ampel springt auf Grün      | Straße / Auto | –                    |
| Silvesterrakete                            | „Die Farben im Feuerwerk sind brennende Metalle.“                                                                                                               | Rakete steigt, Explosion, jede Farbe bekommt ein Schild                   | Natur / Fest  | Ende Dezember        |
| Stoßlüften                                 | „Fenster kippen kühlt deine Wände aus – 5 Minuten weit auf nicht.“ (Fakten prüfen)                                                                              | Kipp-Fenster: Wand wird blau; weit offen: Luft tauscht, Wand bleibt warm  | Zuhause       | Winter               |
| Schnellkochtopf                            | „Dein Schnellkochtopf kocht Wasser bei 120 Grad – weil er die Luft einsperrt.“                                                                                  | Ventil zischt, Dampf schießt raus, Thermometer springt über 100           | Küche         | –                    |
| Eiswürfel                                  | „Eiswürfel frieren von außen nach innen – darum ist die Mitte trüb.“                                                                                            | Eis wächst von den Rändern, Luftbläschen werden in die Mitte gedrängt     | Küche         | Sommer               |
| Türklingel                                 | „Deine Klingel hat keinen Lautsprecher – ein Magnet schlägt mit einem Hammer auf eine Glocke.“                                                                  | Spule zieht den Hammer an, Glocke vibriert, Schallwellen in Zeitlupe      | Zuhause       | –                    |
| Reißverschluss                             | „Dein Reißverschluss hält nur, weil jeder Zahn ein winziger Haken ist.“ (Fakten prüfen)                                                                         | Schieber drückt die Zähne zusammen, Haken rastet in Mulde, Zahn für Zahn  | Kleidung      | –                    |
| ★ Sonnencreme                              | „Sonnencreme ist ein Spiegel aus Staub – sie wirft UV-Strahlen zurück oder schluckt sie.“                                                                       | UV-Pfeile prallen an Mineral-Körnchen ab, Haut bleibt hell                | Beauty        | Sommer               |
| Wasserkocher                               | „Dein Wasserkocher weiß, wann das Wasser kocht – ohne Thermometer und ohne Chip.“                                                                               | Dampf trifft ein Bimetall-Plättchen, es biegt sich, _klack_, aus          | Küche         | –                    |

## Offen — Detail-Rätsel (Format A)

A topic type learned from successful videos (2026-10-24): not the whole
machine, but **one small odd detail everyone has seen and never asked
about** — the loose hook on a tape measure, the pallets standing
crosswise. Hook = the detail as a question, shown huge in frame 0;
sentence 2 = the Umdeutung ("Das ist kein Fehler. Das ist Absicht.");
the beats build the reason. Same scorecard — a detail only goes in when
it carries 45 s (≥ 5 facts: the reason, the physics, the history /
an accident, a comparison, the "Übrigens"); else keep it for a later
short format. Counts as type A.

| Detail (Hook-Frage)                                                         | Die Auflösung (nur fürs Payoff!)                                                                     | Money-Shot                                                             | Kategorie |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------- |
| 🔥 Warum haben Flugzeugfenster ein winziges Loch? (schon „Übrigens“ in #32) | Es gleicht den Druck zwischen den Scheiben aus – die äußere trägt die Last, die mittlere ist Reserve | Drei Scheiben im Schnitt, Druckpfeile, Luft zischt durchs Loch         | Reisen    |
| Warum steht auf Flugzeugflügeln „No Step“?                                  | Der Flügel ist dort nur dünnes Blech über Rippen – ein Fuß würde eine Delle treten (Fakten prüfen)   | Riesiger Stiefel auf dem Flügel, Blech beult ein, Röntgen zeigt Rippen | Reisen    |
| ★ Wofür ist der kleine Pfeil an deiner Tankanzeige?                         | Er zeigt, auf welcher Seite der Tankdeckel ist                                                       | Riesige Tankanzeige, Pfeil leuchtet, Auto dreht sich zur Säule         | Auto      |
| ★ Was bedeuten die bunten Striche am Zahnpasta-Ende?                        | Nichts über den Inhalt – Lichtschranken-Marken für die Maschine, die die Tube schneidet              | Tube auf dem Fließband, Laser trifft den Strich, _zack_, Schnitt       | Bad       |
| Warum ist der Boden deiner Dose nach innen gewölbt?                         | Die Kuppel hält den Druck der Kohlensäure – flach würde er sich ausbeulen                            | Druckpfeile drücken, flacher Boden beult aus, Kuppel hält              | Essen     |
| Warum sind Gullideckel rund?                                                | Ein runder Deckel kann nie durch sein eigenes Loch fallen                                            | Eckiger Deckel kippt diagonal ins Loch, runder bleibt liegen           | Stadt     |
| Warum hat ein Vorhängeschloss unten ein kleines Loch?                       | Regenwasser läuft ab und gefriert nicht im Schloss (Fakten prüfen)                                   | Wasser läuft rein, friert, Schloss klemmt – mit Loch läuft es raus     | Zuhause   |
| ★ Wofür ist die Mini-Tasche in deiner Jeans?                                | Ursprünglich für die Taschenuhr (Fakten prüfen)                                                      | Jeans in Röntgensicht, Taschenuhr gleitet hinein                       | Mode      |
| Warum liegen Bahngleise auf Steinen?                                        | Der Schotter verteilt das Gewicht, lässt Wasser ablaufen und hält die Schwellen fest                 | Zug rollt, Gewichtspfeile verteilen sich, Regen versickert             | Reisen    |
| Warum ist der Rand von Münzen geriffelt?                                    | Früher feilten Leute Silber vom Rand ab – die Riffel verrieten es (Fakten prüfen)                    | Feile schabt Silber ab, Riffel verschwinden                            | Geld      |
| Wofür sind die zwei Metallklammern an deiner Steckdose?                     | Der Schutzkontakt: Bei einem Defekt fließt der Strom dort ab statt durch dich                        | Fehlerstrom im Röntgenblick, Strom biegt in die Klammer ab             | Zuhause   |
| ★ Wofür ist das winzige Loch unten an deinem Handy?                         | Ein Mikrofon – meist das zweite, das Störgeräusche herausrechnet (Fakten prüfen)                     | Riesiges Handy, Schall strömt ins Loch, Röntgen zeigt die Membran      | Handy     |

## Offen — Dein Look & dein Hobby (Format A)

Learned from #36 UV-Nagellampe (viral, 2026-10-30): **the science behind
something the viewer is proud of and can show** — their nails, hair,
tattoo, coffee, car, sneakers, cat. Sweet spot by nature (a concrete thing
of a huge community) with a high Zeig-Faktor. The comment question
asks about the viewer's own thing („Gel-Nägel oder lieber normaler
Lack?“) — **never „Zeig mir …“ / „Bild in die Kommentare“**, the photos
come on their own (user, 2026-11-03). Counts as format A. **One list
among many — no beauty focus** (user, 2026-11-17): about every 4th–5th
video at most, women's and men's topics and hobbies (gym, car, sneakers,
coffee, gaming) alternating; pets only when the topic is about the owner
(not a cute fact — #70 Hundenase flopped).

| Thema                         | Hook (≤ 9 Wörter)                                                                         | Zeig-Frage (Kommentar)             | Money-Shot                                                       |
| ----------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------- |
| ✓ Selbstbräuner (#76)         | „Selbstbräuner bräunt dich wie ein Toastbrot.“ (Fakten prüfen)                            | „Schon mal orange geworden?“       | Zucker im Mittel reagiert mit der Hautoberfläche, wird braun     |
| ★ Wimpernlifting / Dauerwelle | „Wimpernlifting bricht deine Wimpern innen auf.“ (Fakten prüfen)                          | „Natur oder geliftet?“             | Bindungen im Haar knacken auf, Form, neu verknüpft               |
| ✓ Haare färben (#86)          | „Haarfarbe muss erst in dein Haar einbrechen.“                                            | „Welche Farbe trägst du gerade?“   | Schuppenschicht klappt auf, Farbe strömt hinein                  |
| ★ Sneaker-Sohle               | „In deinen Sneakern steckt Luft unter Druck.“ (Fakten prüfen)                             | „Welche Sneaker trägst du gerade?“ | Luftkammer im Röntgenblick, Schritt drückt sie zusammen          |
| ★ Keramik-Versiegelung (Auto) | „Wasser perlt ab, weil dein Lack jetzt Glas ist.“ (Fakten prüfen)                         | „Wäschst du dein Auto selbst?“     | Tropfen rollen in Zeitlupe vom Lack, Glas-Schicht im Schnitt     |
| ✓ Katzenzunge (#80)           | „Die Zunge deiner Katze ist eine Bürste aus Haken.“ (Fakten prüfen)                       | „Wie heißt deine Katze?“           | Zunge im Makro, hohle Häkchen ziehen Speichel durchs Fell        |
| ★ Gelnägel ablösen            | „Aceton frisst deine Gelnägel nicht – es lässt sie aufquellen.“ (Fakten prüfen)           | „Team Gel oder Acryl?“             | Lösungsmittel kriecht ins Gel, Netz quillt auf, Schicht hebt ab  |
| ✓ Protein-Shake (#90)         | „Dein Körper zerlegt dein Shake-Eiweiß komplett.“ (Fakten prüfen)                         | „Welcher Shake ist deiner?“        | Eiweißketten zerfallen in Bausteine, wandern in den Muskel       |
| ★ Trockenshampoo              | „Trockenshampoo wäscht nichts – es saugt dein Fett auf.“ (Fakten prüfen)                  | „Wie oft wäschst du deine Haare?“  | Stärke-Körnchen saugen Talg vom Haar, Strähne wird wieder locker |
| ★ Wimperntusche wasserfest    | „Wasserfeste Mascara klebt wie ein Lack auf deinen Wimpern.“ (Fakten prüfen)              | „Wasserfest oder normal?“          | Wimper im Makro, Film zieht sich zusammen, Wasser perlt ab       |
| ★ Lippenstift kussecht        | „Kussechter Lippenstift ist Farbe, die sich in die Haut krallt.“ (Fakten prüfen)          | „Welche Farbe trägst du?“          | Lippe im Makro, Farbstoff zieht ein, Kussabdruck bleibt leer     |
| ★ Glätteisen                  | „Dein Glätteisen kocht das Wasser in deinem Haar.“ (Fakten prüfen)                        | „Glatt oder Locken?“               | Dampf zischt aus der Strähne, Haar richtet sich aus              |
| ★ Laser-Haarentfernung        | „Der Laser zielt nicht aufs Haar – sondern auf seine Farbe.“ (Fakten prüfen)              | „Laser, Wachs oder Rasierer?“      | Lichtblitz, dunkle Wurzel glüht, Haar fällt raus                 |
| ★ Waxing                      | „Beim Waxing reißt du das Haar samt Wurzel raus.“ (Fakten prüfen)                         | „Wachs oder Rasierer?“             | Streifen reißt ab in Zeitlupe, Haare mit Wurzel                  |
| ★ Zahn-Bleaching              | „Bleaching macht deine Zähne nicht weiß – es bleicht die Farbe in ihnen.“ (Fakten prüfen) | „Schon mal gebleacht?“             | Zahn im Schnitt, Farbmoleküle zerfallen                          |
| ★ Acryl-Nägel                 | „Acrylnägel sind Zahnarzt-Kunststoff auf deinen Fingern.“ (Fakten prüfen)                 | „Acryl oder Gel?“                  | Pulver + Flüssigkeit härten zur Spitze                           |
| ★ Ohrloch / Piercing          | „Dein Ohrloch ist ein Tunnel aus neuer Haut.“ (Fakten prüfen)                             | „Wie viele Piercings hast du?“     | Nadel, Haut wächst als Röhre um den Stecker                      |
| ★ Haarausfall (Männer)        | „Deine Haare fallen nicht aus – sie werden immer dünner.“ (Fakten prüfen)                 | „Schon Geheimratsecken?“           | Haarwurzel schrumpft Zyklus für Zyklus                           |
| ★ Bart wächst schneller?      | „Rasieren macht deinen Bart nicht dicker – es täuscht dich.“ (Fakten prüfen)              | „Bart oder glatt?“                 | stumpfe Stoppel vs. spitzes Haar im Makro                        |

## Offen — Format B „Was passiert, wenn …?“

Criteria (instead of A's six, + the two of the scorecard;
`format-was-passiert.md`):

1. **Schon immer gefragt oder sofort neugierig** — a question almost
   everyone has wondered about, a myth everyone has heard („Kaugummi
   bleibt 7 Jahre im Bauch“), or a wild thought experiment you can't not
   click („… wenn die Erde aufhört, sich zu drehen?“).
2. **Überraschender Ausgang** — the outcome is not what people expect.
3. **Die Hand macht es in Bild 0** — the act is one clear movement the
   viewer's low-poly hand can do (pull the lever, drop the spoon, open
   the hatch) — also in space.
4. **3 Folgen + Twist in 45 s** — a chain of three consequences plus a
   surprise or "Rate mal" at the halfway mark, max 3 terms.
5. **Sicher** — impossible, harmless or warning-only (safety rules in
   `format-was-passiert.md`); never a how-to.
6. **Für 18–34, Männer und Frauen** — their day (phone, travel, food,
   sport) or the big „Was wäre, wenn“ everyone talks about at 2 a.m.
   (space, the end of the world, the deep sea). 🔥 first, then ★.

The hook starts straight with the act („Du ziehst mitten im Flug an der
Notausgangstür.“) — the words „Was passiert, wenn …?“ are not spoken
(2026-10-29); the list keeps them only to name the scenario. Topics the comments
ask for go in here.

| Szenario („Was passiert, wenn du …?“)                                | Überraschender Ausgang (nur fürs Payoff!)                                                                         | Money-Shot                                                                   | Sicherheit                   | Kategorie |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------- | --------- |
| ★ … am Leih-E-Scooter nur vorne bremst?                              | Das Vorderrad blockiert, du fliegst über den Lenker – beide Bremsen retten dich (Fakten prüfen)                   | Scooter kippt in Zeitlupe nach vorn, Schwerpunkt-Pfeil                       | Warnung, richtige Bremsung   | Stadt     |
| ★ … eine Silvesterrakete umfällt, kurz bevor sie zündet?             | Sie schießt waagrecht los – darum gehört sie in eine Flasche, nie in die Hand (Fakten prüfen)                     | Rakete kippt, Funkenstrahl zischt flach über den Boden                       | Warnung „nicht nachmachen“   | Fest      |
| ★ … mit der Zunge an einen eiskalten Laternenpfahl gehst?            | Sie friert in Sekunden fest – warmes Wasser löst sie, Ziehen reißt Haut ab (Fakten prüfen)                        | Zunge klebt, Eiskristalle wachsen, LED „−10 °C“                              | Warnung „nicht nachmachen“   | Körper    |
| ★ … an einen Weidezaun fasst?                                        | Der Schlag ist kurz und stark, aber gepulst – darum lässt er dich wieder los (Fakten prüfen)                      | Hand am Draht, Blitz, Muskeln zucken                                         | Warnung                      | Körper    |
| ★ … mit dem kleinen Zeh gegen den Bettpfosten knallst?               | Warum der kleinste Zeh am meisten wehtut (Fakten prüfen)                                                          | Zeitlupe, Nervenbahn leuchtet bis ins Hirn                                   | harmlos                      | Körper    |
| ★ … zu schnell Eis isst (Hirnfrost)?                                 | Es ist nicht dein Hirn – es ist dein Gaumen, der Alarm schlägt (Fakten prüfen)                                    | Eis am Gaumen, Ader zieht sich zusammen, Schmerzwelle zur Stirn              | harmlos                      | Körper    |
| ★ … auf einen Legostein trittst?                                     | Warum das mehr wehtut als ein Stein am Strand (Fakten prüfen)                                                     | Fuß senkt sich in Zeitlupe, Druck-Anzeige schießt hoch                       | harmlos                      | Körper    |
| ★ … dir den Musikantenknochen stößt?                                 | Es ist kein Knochen – du triffst einen Nerv ohne Schutz (Fakten prüfen)                                           | Ellbogen im Röntgen, Nerv blitzt bis in den kleinen Finger                   | harmlos                      | Körper    |
| 🔥 … die Sonne plötzlich ausgeht? ⚠️ zu allgemein                    | Du merkst es erst nach 8 Minuten – und die Erde fliegt geradeaus davon                                            | Sonne erlischt, Licht-Welle rast zur Erde, Countdown 8:00                    | unmöglich                    | Weltall   |
| 🔥 … ein Teelöffel Neutronenstern auf der Erde landet? ⚠️ zu nischig | Er wiegt Milliarden Tonnen und fällt einfach durch die Erde (Fakten prüfen)                                       | Hand lässt den Löffel fallen, er schlägt glatt durch den Boden               | unmöglich                    | Weltall   |
| 🔥 … der Mond verschwindet? ⚠️ zu allgemein                          | Ebbe und Flut werden viel schwächer, die Nächte stockdunkel (Fakten prüfen)                                       | Mond verpufft, Meer flacht ab, Nacht wird schwarz                            | unmöglich                    | Weltall   |
| 🔥 … einen Tropfen Wasser auf die Sonne wirfst? ⚠️ zu nischig        | Er verdampft schon lange vorher (Fakten prüfen)                                                                   | Tropfen fliegt, glüht, zischt weg                                            | unmöglich                    | Weltall   |
| 🔥 … einen Blitz in einer Flasche fangen könntest? ⚠️ zu nischig     | Er würde dein Handy nur ein paar Stunden laden – so wenig Energie steckt drin (Fakten prüfen)                     | Blitz zuckt in die Flasche, LED-Akku füllt sich kläglich                     | unmöglich                    | Natur     |
| 🔥 … in ein Schwarzes Loch fällst? ⚠️ zu allgemein                   | Du wirst zur Spaghetti gezogen (bei kleinen Löchern – Fakten prüfen)                                              | Low-Poly-Astronaut wird lang und länger                                      | unmöglich                    | Weltall   |
| ★ … im abstürzenden Aufzug im letzten Moment hochspringst?           | Bringt nichts – du bist genauso schnell wie die Kabine, der Sprung bremst kaum (Fakten prüfen)                    | Kabine rast runter, Low-Poly-Mensch springt, LED-Tacho zeigt die Differenz   | harmlos, Fangbremse erwähnen | Stadt     |
| ★ … du dir fest die Augen reibst?                                    | Du siehst Lichtblitze ganz ohne Licht: Druck reizt die Sehzellen (Fakten prüfen)                                  | Daumen drücken aufs Lid, bunte Funken explodieren im Dunkeln                 | Phosphene                    | Körper    |
| ★ … im Flugzeug auf dem Klo die Spülung drückst, während du sitzt?   | Mythos „festgesaugt“: Der Sog ist stark, aber dein Po dichtet nie ganz ab – du kommst wieder hoch (Fakten prüfen) | Vakuum-Pfeile ziehen am Klo, LED „VAKUUM“, Low-Poly-Mensch steht lachend auf | harmlos                      | Reisen    |

## Offen — Format C „Bauwerke“

Criteria: `format-bauwerke.md` (famous by name and seen by millions, one
trick in one sentence, a „Was?!“ number, a felt moment, AT/CH/DE first).
The scorecard and "What our numbers say" apply too.

| Bauwerk                            | Hook (Frage im Kopf)                                          | Der Trick (nur fürs Payoff, Fakten prüfen)                             | Money-Shot                                         |
| ---------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------- |
| ★ Eiffelturm                       | „Im Sommer wird der Eiffelturm größer.“                       | Stahl dehnt sich bei Hitze aus (Zentimeter, prüfen)                    | Turm wächst sichtbar, LED „+15 cm“                 |
| ★ Burj Khalifa                     | „Ganz oben im Burj Khalifa schwankt dein Kaffee.“             | Y-Grundriss bricht den Wind, Turm schwingt Meter weit (prüfen)         | Windwirbel reißen ab, Spitze pendelt               |
| ★ Taipei 101                       | „In diesem Hochhaus hängt eine 660-Tonnen-Kugel.“             | Schwingungsdämpfer pendelt gegen den Sturm (prüfen)                    | Riesen-Kugel schwingt gegen das Gebäude            |
| ★ Golden Gate Bridge               | „Die ganze Golden Gate hängt an nur zwei Kabeln.“             | zwei Hauptkabel aus zehntausenden Drähten tragen die Fahrbahn (prüfen) | Kabel im Röntgen, Drähte fächern auf               |
| ★ Gotthard-Basistunnel             | „Unter dir liegen 2.300 Meter Fels.“                          | 57 km, heißer Fels, Kühlung (prüfen)                                   | Zug im Berg-Schnitt, LED „45 °C Fels“              |
| ★ Europabrücke (Brenner)           | „Du fährst 190 Meter über dem Tal – auf Stelzen.“             | hohe Pfeiler, Spannbeton (prüfen)                                      | Lkw über der Brücke, Pfeiler im Schnitt            |
| ★ Stephansdom                      | „Dieses Dach hat 230.000 Ziegel – und keiner fällt runter.“   | steiles Dach, Ziegel gehängt (prüfen)                                  | Ziegeldach im Sturm, Adler-Muster                  |
| ★ Prater-Riesenrad                 | „Das Riesenrad dreht sich – und hängt dabei an Speichen.“     | Speichen ziehen statt drücken (prüfen)                                 | Speichen-Spannung leuchtet, Gondel steigt          |
| ★ Kolosseum                        | „Unter dem Kolosseum war ein Aufzug für Löwen.“               | Hypogäum mit Lastenaufzügen (prüfen)                                   | Boden klappt auf, Löwe fährt hoch                  |
| ★ Pyramiden von Gizeh              | „Die Pyramide wurde ohne Kran gebaut.“                        | Rampen, Schlitten auf nassem Sand (prüfen)                             | Steinblock gleitet, Wasser vor dem Schlitten       |
| ★ Glasboden-Skywalk (Grand Canyon) | „Du stehst auf Glas – 1.200 Meter über dem Nichts.“           | Verbundglas, auskragender Stahlrahmen (prüfen)                         | Blick nach unten durch den Boden                   |
| ★ Hoover Dam                       | „Dieser Damm hält einen ganzen See zurück – mit einem Bogen.“ | Bogenstaumauer drückt die Kraft in den Fels (prüfen)                   | Wasserdruck-Pfeiler, Kraft fließt in die Felswände |
| ★ Elbphilharmonie                  | „In diesem Saal hörst du jedes Husten – überall gleich.“      | 10.000 gefräste Gipsplatten streuen den Schall (prüfen)                | Schallwellen prallen an der Waben-Wand             |

## Offen — D Duell („X gegen Y – was gewinnt?“, themenarten.md)

| Duell                                       | Hook (Frage im Kopf)                                | Antwort (nur Payoff, Fakten prüfen)                     |
| ------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------- |
| ★ Abgefeuerte gegen fallen gelassene Kugel  | „Welche Kugel landet zuerst?“                       | gleichzeitig (Schwerkraft wirkt gleich)                 |
| ★ Dübel in Gipskarton gegen Beton           | „Welcher Dübel hält mehr – und wie viel mehr?“      | Zahlen prüfen                                           |
| ★ Heißes gegen kaltes Wasser im Gefrierfach | „Welches Wasser friert zuerst?“                     | umstritten (Mpemba) — sauber und vorsichtig formulieren |
| ★ Airbag gegen Gurt                         | „Was rettet dich mehr: Gurt oder Airbag?“           | Gurt (prüfen)                                           |
| ★ Treppe gegen Aufzug im Hochhaus           | „Wer ist im 20. Stock zuerst: du oder der Aufzug?“  | prüfen                                                  |
| ★ Handy gegen Klobrille                     | „Was ist dreckiger: dein Handy oder die Klobrille?“ | prüfen                                                  |

## Offen — E Experiment (themenarten.md)

| Experiment                            | Hook                                                  | Ergebnis (nur Payoff, prüfen)              | Sicherheit       |
| ------------------------------------- | ----------------------------------------------------- | ------------------------------------------ | ---------------- |
| ★ Melone mit Zahnseide schneiden      | „Kann Zahnseide eine Melone zerschneiden?“            | ja, der dünne Faden drückt enorm (prüfen)  | harmlos          |
| ★ Ei unter dem Auto                   | „Ein Ei hält ein ganzes Auto aus?“                    | Form verteilt die Last (prüfen)            | harmlos          |
| ★ Papier 42-mal falten                | „Falte dieses Blatt 42-mal – es reicht bis zum Mond.“ | Verdopplung (prüfen)                       | harmlos          |
| ★ Wasser in der Mikrowelle überhitzen | „Dein Wasser kocht nicht – und explodiert trotzdem.“  | Siedeverzug, Warnung                       | Warnung          |
| ★ Elefantenzahnpasta                  | „Dieser Schaum kommt aus einer einzigen Flasche.“     | Katalysator, Schaumberg (prüfen)           | nicht nachmachen |
| ★ Seifenblase im Frost                | „Bei −10 °C gefriert deine Seifenblase in der Luft.“  | Eiskristalle wachsen auf der Haut (prüfen) | harmlos          |

## Offen — F Rätsel zum Mitmachen (themenarten.md)

| Rätsel                            | Hook                                                | Die eine Idee dahinter             |
| --------------------------------- | --------------------------------------------------- | ---------------------------------- |
| ★ Streichholz-Rätsel              | „Leg ein Streichholz um – und die Rechnung stimmt.“ | Umdenken, die Lösung ist kein Plus |
| ★ Seil um die Erde                | „Du verlängerst ein Seil um die Erde um 1 Meter …“  | Umfang wächst nur mit 2π (prüfen)  |
| ★ 9 Kugeln, eine schwerer         | „Finde die schwere Kugel mit nur 2 Wiegungen.“      | Dreiergruppen                      |
| ★ Brücke bei Nacht (Taschenlampe) | „Vier Leute, eine Lampe, 17 Minuten.“               | die Langsamen zusammen schicken    |
| ★ Ziegenproblem                   | „Wechselst du die Tür – oder nicht?“                | Wechseln verdoppelt die Chance     |

## Offen — G Wahre Geschichte (themenarten.md — Fakten immer per Websuche prüfen)

| Geschichte                                      | Hook                                              | Warum überlebt (Kernidee)                    |
| ----------------------------------------------- | ------------------------------------------------- | -------------------------------------------- |
| ★ Vesna Vulović (Sturz aus 10 km, 1972)         | „Sie fiel aus 10 Kilometern – und überlebte.“     | Wrackteil, Schnee, Hang (prüfen, vorsichtig) |
| ★ Pilot aus dem Cockpit gesaugt (BA 5390, 1990) | „Sein Fenster flog weg – und er hing draußen.“    | Druck, Kälte, Crew hielt ihn (prüfen)        |
| ★ Mann in Lawine (Airbag-Rucksack)              | „Er lag 2 Meter unter Schnee – und atmete.“       | Atemhöhle, Lawinenairbag (prüfen)            |
| ★ Blitz trifft Golfer                           | „Ein Blitz traf ihn – und er stand wieder auf.“   | Strom läuft außen über die Haut (prüfen)     |
| ★ Höhlentaucher-Rettung Thailand (2018)         | „13 Menschen saßen 2 Wochen in einer Höhle fest.“ | Luft, Wasser, Rettung unter Wasser (prüfen)  |

## Offen — H Dein Körper verändert sich (themenarten.md — vorsichtig formulieren)

| Thema                     | Hook                                                         | Vorher → Nachher (prüfen)         |
| ------------------------- | ------------------------------------------------------------ | --------------------------------- |
| ★ Mundatmung              | „Mundatmung kann dein Gesicht verändern.“                    | schmaler Kiefer, Gesichtsform     |
| ★ Handy-Nacken            | „Dein Kopf wiegt beim Scrollen wie ein Kind auf dem Nacken.“ | Haltung, Last auf der Wirbelsäule |
| ★ Kaugummi kauen          | „Kaugummi trainiert deinen Kiefer – sichtbar?“               | Kaumuskel (vorsichtig)            |
| ★ Barfußlaufen            | „Barfuß verändert sich dein Fuß.“                            | Hornhaut, Muskeln, Laufstil       |
| ★ Zuckerfrei: deine Zähne | „Was Zucker in 30 Tagen mit deinen Zähnen macht.“            | Zahnschmelz (vorsichtig)          |

## Offen — I So wird's gemacht (themenarten.md)

| Ding                | Hook                                               | Der Trick im Werk (prüfen)     |
| ------------------- | -------------------------------------------------- | ------------------------------ |
| ★ Basketball-Grip   | „Darum rutscht dir ein NBA-Ball nie aus der Hand.“ | Noppen, Leder, Einlauf         |
| ★ Bleistift         | „Wie kommt die Mine in den Bleistift?“             | Holz-Sandwich, zwei Hälften    |
| ★ Schokoladen-Knack | „Darum knackt gute Schokolade.“                    | Temperieren, Kristallform      |
| ★ Gummibärchen      | „Gummibärchen werden in Stärke-Mehl gegossen.“     | Mogul-Anlage, Stärkeformen     |
| ★ Glasflasche       | „Deine Flasche war vor 10 Minuten noch flüssig.“   | Tropfen, Form, Blasen mit Luft |

## Reserviert (in Arbeit)

| Thema                  | Format | Datum      | Chat                               |
| ---------------------- | ------ | ---------- | ---------------------------------- |
| Schiefer Turm von Pisa | C      | 2026-11-20 | TikTok #92: Schiefer Turm von Pisa |

## Verwendet

See `tiktok/serie.md` and the folders in `tiktok/` — the source of truth.
As of 2026-10-23: Kühlschrank, Airfryer, Aufzug, Airbag, Windrad,
Atomkraftwerk, Mikrowelle, Geschirrspüler, Rauchmelder, Fliegender Tesla,
Noise-Cancelling-Kopfhörer, Wassersprudler (Sodastream), Geldautomat,
Taschenwärmer, Popcorn, Kontaktlos bezahlen, Zapfpistole, Feuerzeug, Face ID,
Erde hört auf, sich zu drehen (B), Flugzeugtür (B), MRT, Tiefsee (B), Raketen-Landung, Blitz ins Auto (B),
Schleudersitz, Loch durch die Erde (B), Flugzeugfenster, Ohne Raumanzug ins Weltall (B),
Fettbrand (B), Knicklicht, Treibsand (B), Parfum, Fingerknacken (B).
