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

**The format comes first** (SKILL.md step 0, always alternating): for
format A pick from **Offen — Format A „Bauen“**, for format B from
**Offen — Format B „Was passiert, wenn …?“** (its own criteria are
below that list). The duplicate check covers both lists: an object that
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
are the wildest — **pick 🔥 first, then ★**. In format B the best
topics are the extreme thought experiments (Weltall, Tiefsee, Erde,
Extrem-Physik): they are impossible, so they're also the safest. Keep at
least half of each list 🔥 and add new ideas the same way. Facts stay
correct — the wilder the claim, the more carefully it's checked.

Format A — score each open candidate on these six; propose the best one plus two
alternatives:

1. **Jeder kennt es** — used weekly by almost everyone in Germany, **or**
   a wild 🔥 machine everyone has seen in films or the news (rocket,
   ejection seat, MRT).
2. **Überraschendes Geheimnis** — the real mechanism contradicts what
   people assume ("ohne Strom", "wird gar nicht heiß", "hat keinen Akku").
3. **Spektakel zum Zeigen** — at least one money shot the 3D style can
   show big (spark, explosion, crystals shooting through, waves, flip).
4. **In 40 s erklärbar** — max 3 parts / terms.
5. **Weitererzählbar / selbst testbar** — the viewer can try it today or
   tells a friend ("Hand auf den Induktionsherd").
6. **Für 18–34, Männer und Frauen** — part of _their_ day: phone,
   paying, food and coffee, beauty and hair, going out, sport, commuting.
   Prefer these over industry / energy / car-only topics. Topics marked
   ★ in the list fit best — pick those first.

Also: vary the category from the last 2 episodes (kitchen → street →
money/tech → nature …), and use the **Saison** column (Silvester in late
December, Heizung / Taschenwärmer in winter, Klimaanlage / Ventilator in
summer). Before writing the script, check the key facts and numbers of
the topic (web search if available) and phrase anything uncertain safely.

## 3. Reserve it right away

As soon as the user says ok: move the topic from its **Offen** list to
**Reserviert** with the date and the format, commit on `main` and push — _before_ the
script — so a parallel video chat can't take the same topic. When the
episode is logged in `tiktok/serie.md`, delete it from **Reserviert**.
When a topic from an **Offen** list is used up, add a new idea so there
are always 10+ open topics per format.

## Offen — Format A „Bauen“

| Thema                       | Hook-Idee                                                                                                                         | Money-Shot                                                                  | Kategorie     | Saison        |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------- | ------------- |
| 🔥 Raketen-Landung          | „Diese Rakete fliegt ins All – und landet dann rückwärts wieder auf dem Boden.“                                                   | Booster fällt, zündet kurz vor dem Boden, Beine klappen aus, Stand          | Weltall       | –             |
| 🔥 Magnetschwebebahn        | „Dieser Zug berührt die Schiene nie – er schwebt knapp über ihr.“ (Abstand prüfen)                                                | Magnete ziehen den Zug hoch, Lichtspalt unter dem Zug, er rast los          | Reisen        | –             |
| 🔥 Schleudersitz            | „Der Schleudersitz schießt dich mit einer Rakete aus dem Jet.“ (g-Werte prüfen)                                                   | Kanzel fliegt weg, Raketenflamme unter dem Sitz, Fallschirm ploppt          | Extrem        | –             |
| 🔥 Blitzableiter            | „Ein Blitz ist heißer als die Sonnenoberfläche – und ein Draht leitet ihn sicher in die Erde.“                                    | Blitz schlägt ins Dach, rast den Draht runter, verpufft im Boden            | Zuhause       | Sommer        |
| 🔥 Teilchenbeschleuniger    | „Unter der Grenze zur Schweiz rasen Teilchen fast so schnell wie das Licht im Kreis – 11.000 Runden pro Sekunde.“ (Fakten prüfen) | Teilchen rasen durch den Ring, prallen frontal zusammen, Funkenregen        | Extrem        | –             |
| ★ Handy-Akku / Schnellladen | „Dein Handy lädt in 30 Minuten halb voll – und wird danach absichtlich langsam.“                                                  | Ionen strömen in Zeitlupe von einer Seite zur anderen, Ladebalken bremst ab | Handy         | –             |
| ★ Touchscreen               | „Dein Bildschirm spürt deinen Finger, ohne dass du drückst.“                                                                      | Finger nähert sich, das Feld im Glas verbiegt sich, Tipp leuchtet           | Handy         | –             |
| ★ Pfandautomat              | „Der Pfandautomat prüft deine Flasche dreimal – Form, Strichcode und ein geheimes Pfand-Zeichen.“ (Fakten prüfen)                 | Flasche rollt rein, Laser tastet sie rundum ab, _Zack_, Bon kommt raus      | Einkaufen     | –             |
| ★ Glätteisen                | „Dein Glätteisen bricht die Wasser-Brücken in deinen Haaren.“                                                                     | Haarsträhne in Nahaufnahme, Brücken zwischen den Ketten knacken auf         | Beauty        | –             |
| ★ UV-Nagellampe             | „Gel-Nägel trocknen nicht – sie werden in Sekunden zu Plastik.“                                                                   | UV-Licht trifft das Gel, Moleküle verketten sich zu einem Netz              | Beauty        | –             |
| ★ Smartwatch-Puls           | „Deine Uhr misst deinen Puls mit grünem Licht – sie schaut in dein Blut.“                                                         | Grünes Licht dringt in die Haut, Blut pumpt, Kurve springt mit              | Sport         | –             |
| ★ Haartrockner              | „Dein Föhn schaltet sich selbst ab, bevor deine Haare brennen.“                                                                   | Heizdraht glüht, Bimetall biegt sich, _klack_, aus                          | Beauty        | –             |
| Induktionsherd              | „Dein Herd wird gar nicht heiß – der Topf heizt sich selbst.“                                                                     | Hand auf der kalten Platte, daneben kocht das Wasser                        | Küche         | –             |
| Blitzer                     | „Der Blitzer weiß in Sekundenbruchteilen, wie schnell du bist.“                                                                   | Funkwellen prallen vom Auto ab, werden gestaucht, BLITZ                     | Straße / Auto | –             |
| Ampel-Kontaktschleife       | „Die Ampel weiß, dass du wartest. Im Asphalt liegt ein unsichtbarer Draht.“                                                       | Röntgenblick in die Straße, Auto fährt drauf, Ampel springt auf Grün        | Straße / Auto | –             |
| Türschloss                  | „Nur dein Schlüssel passt – weil fünf winzige Stifte genau in einer Linie stehen müssen.“                                         | Schlüssel schiebt die Stifte hoch, alle rasten ein, Zylinder dreht          | Zuhause       | –             |
| Silvesterrakete             | „Die Farben im Feuerwerk sind brennende Metalle.“                                                                                 | Rakete steigt, Explosion, jede Farbe bekommt ein Schild                     | Natur / Fest  | Ende Dezember |
| ★ Kabellos laden            | „Dein Handy lädt ohne Kabel – zwei Spulen reden durch die Luft.“                                                                  | Magnetfeld-Linien springen von Spule zu Spule, Akku füllt sich              | Geld / Tech   | –             |
| Heizkörper-Thermostat       | „Dein Heizungsregler hat keinen Strom – er denkt mit Wachs.“                                                                      | Wachs dehnt sich aus, drückt den Stift, Ventil schließt                     | Zuhause       | Herbst/Winter |
| Rolltreppe                  | „Die Stufen der Rolltreppe verschwinden nicht – sie fahren unten kopfüber zurück.“                                                | Röntgenblick: Stufen klappen flach und laufen unter dem Boden zurück        | Stadt         | –             |
| Schnellkochtopf             | „Dein Schnellkochtopf kocht Wasser bei 120 Grad – weil er die Luft einsperrt.“                                                    | Ventil zischt, Dampf schießt raus, Thermometer springt über 100             | Küche         | –             |
| ★ Kaffeevollautomat         | „Deine Kaffeemaschine drückt das Wasser mit mehr Druck durchs Pulver als in deinem Autoreifen.“ (~9 bar Brühdruck, Zahl prüfen)   | Wasser presst durch das Kaffeepulver, Crema schäumt in Zeitlupe             | Küche         | –             |
| Eiswürfel                   | „Eiswürfel frieren von außen nach innen – darum ist die Mitte trüb.“                                                              | Eis wächst von den Rändern, Luftbläschen werden in die Mitte gedrängt       | Küche         | Sommer        |
| Türklingel                  | „Deine Klingel hat keinen Lautsprecher – ein Magnet schlägt mit einem Hammer auf eine Glocke.“                                    | Spule zieht den Hammer an, Glocke vibriert, Schallwellen in Zeitlupe        | Zuhause       | –             |
| ★ Sonnencreme               | „Sonnencreme ist ein Spiegel aus Staub – sie wirft UV-Strahlen zurück oder schluckt sie.“                                         | UV-Pfeile prallen an Mineral-Körnchen ab, Haut bleibt hell                  | Beauty        | Sommer        |
| Wasserkocher                | „Dein Wasserkocher weiß, wann das Wasser kocht – ohne Thermometer und ohne Chip.“                                                 | Dampf trifft ein Bimetall-Plättchen, es biegt sich, _klack_, aus            | Küche         | –             |

## Offen — Format B „Was passiert, wenn …?“

Criteria (instead of A's six; `format-was-passiert.md`):

1. **Schon immer gefragt oder sofort neugierig** — a question almost
   everyone has wondered about, a myth everyone has heard („Kaugummi
   bleibt 7 Jahre im Bauch“), or a wild thought experiment you can't not
   click („… wenn die Erde aufhört, sich zu drehen?“).
2. **Überraschender Ausgang** — the outcome is not what people expect.
3. **Die Hand macht es in Bild 0** — the act is one clear movement the
   viewer's low-poly hand can do (pull the lever, drop the spoon, open
   the hatch) — also in space.
4. **3 Folgen in 40 s** — a chain of three consequences, max 3 terms.
5. **Sicher** — impossible, harmless or warning-only (safety rules in
   `format-was-passiert.md`); never a how-to.
6. **Für 18–34, Männer und Frauen** — their day (phone, travel, food,
   sport) or the big „Was wäre, wenn“ everyone talks about at 2 a.m.
   (space, the end of the world, the deep sea). 🔥 first, then ★.

Hook = always „Was passiert eigentlich, wenn du …?“. Topics the comments
ask for (CTA „Was sollen wir als Nächstes passieren lassen?“) go in here.

| Szenario („Was passiert eigentlich, wenn du …?“)          | Überraschender Ausgang (nur fürs Payoff!)                                                     | Money-Shot                                                                  | Sicherheit                          | Kategorie |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------- | --------- |
| 🔥 … ohne Raumanzug ins Weltall gehst?                    | Du explodierst nicht – du bleibst rund 15 Sekunden wach, dein Speichel fängt an zu kochen     | Hand öffnet die Luke, Luft schießt raus, Low-Poly-Du schwebt, LED-Countdown | unmöglich                           | Weltall   |
| 🔥 … in ein Loch springst, das durch die ganze Erde geht? | Du fällst rund 40 Minuten – und kommst im Pazifik bei Neuseeland wieder raus (Fakten prüfen)  | Röntgen-Schnitt durch die Erde, du rast am glühenden Kern vorbei            | unmöglich                           | Erde      |
| 🔥 … die Sonne plötzlich ausgeht?                         | Du merkst es erst nach 8 Minuten – und die Erde fliegt geradeaus davon                        | Sonne erlischt, Licht-Welle rast zur Erde, Countdown 8:00                   | unmöglich                           | Weltall   |
| 🔥 … ein Teelöffel Neutronenstern auf der Erde landet?    | Er wiegt Milliarden Tonnen und fällt einfach durch die Erde (Fakten prüfen)                   | Hand lässt den Löffel fallen, er schlägt glatt durch den Boden              | unmöglich                           | Weltall   |
| 🔥 … alle Menschen gleichzeitig hochspringen?             | Gar nichts – die Erde bewegt sich weniger als ein Atom                                        | 8 Milliarden Low-Poly-Menschen springen, LED „0,00000…“                     | harmlos                             | Erde      |
| 🔥 … zum tiefsten Punkt im Meer tauchst?                  | Auf jedem Fingernagel drückt das Gewicht eines Autos (~1.100 bar, Fakten prüfen)              | U-Boot sinkt ins Dunkel, Druck-Pfeile, Dose wird zerquetscht                | unmöglich (ohne U-Boot)             | Tiefsee   |
| 🔥 … der Mond verschwindet?                               | Ebbe und Flut werden viel schwächer, die Nächte stockdunkel (Fakten prüfen)                   | Mond verpufft, Meer flacht ab, Nacht wird schwarz                           | unmöglich                           | Weltall   |
| 🔥 … im Weltall weinst?                                   | Die Träne fällt nicht – sie klebt als Wasserkugel auf deinem Auge                             | Träne wächst zur wackelnden Kugel vor dem Auge                              | unmöglich                           | Weltall   |
| 🔥 … in Treibsand fällst?                                 | Du gehst nicht unter – du bleibst ungefähr bis zur Hüfte stecken (Studie prüfen)              | Beine sinken, Sandkörner in Röntgensicht, Stopp an der Hüfte                | Hinweis, harmlos erklärt            | Natur     |
| 🔥 … im Auto sitzt und der Blitz einschlägt?              | Dir passiert nichts – aber nicht wegen der Reifen: Der Strom fließt außen um dich herum       | Blitz kracht aufs Dach, Strom läuft als Leuchtband über die Karosse         | nicht machbar; Cabrio-Hinweis       | Auto      |
| ★ … einen Kaugummi verschluckst?                          | Er bleibt keine 7 Jahre – er wandert in ein paar Tagen ganz normal durch                      | Kaugummi rutscht in Röntgensicht durch den Bauch, Kalender fliegt           | harmlos (Fakten prüfen)             | Essen     |
| ★ … dein Handy ins Wasser fallen lässt?                   | Reis hilft nicht – sogar Apple rät davon ab (Fakten prüfen)                                   | Handy platscht in Zeitlupe ins Wasser, Tropfen dringen ein                  | harmlos                             | Handy     |
| ★ … eine geschüttelte Cola aufmachst?                     | Draufklopfen bringt nichts (Studie prüfen) – nur Warten hilft                                 | Bläschen wachsen in Zeitlupe, Fontäne schießt raus                          | harmlos                             | Essen     |
| ★ … im Flugzeug aufs Klo gehst und spülst?                | Es wird nicht gespült, sondern gesaugt – mit dem Unterdruck von draußen                       | Röntgen ins Rohr, alles schießt mit Zisch nach hinten                       | harmlos                             | Reisen    |
| … vom 10-Meter-Brett springst?                            | Du knallst mit rund 50 km/h aufs Wasser                                                       | Sprung in Zeitlupe, LED-Tacho springt hoch, Wasser spritzt                  | Hinweis „nur mit Aufsicht“          | Sport     |
| 🔥 … Wasser in brennendes Fett kippst?                    | Eine Stichflamme bis zur Decke – das Wasser verdampft schlagartig und reißt das Fett mit      | Tropfen fällt, Dampf explodiert, Feuerball (nur 3D)                         | **nur als Warnung**, „Deckel drauf“ | Küche     |
| … eine Münze vom Hochhaus fallen lässt?                   | Sie tötet niemanden – sie wird nie schnell genug (Fakten prüfen); trotzdem nie machen         | Münze trudelt, Luftwiderstand-Pfeile bremsen sie                            | Warnung „nie machen“                | Stadt     |
| … mit offenen Augen niest?                                | Deine Augen fliegen nicht raus – sie gehen per Reflex zu (Fakten prüfen)                      | Nies-Wolke in Zeitlupe, Augenlider klappen zu                               | harmlos                             | Körper    |
| … Mentos in Cola wirfst?                                  | Keine Chemie-Explosion – Millionen winziger Krater lassen die Kohlensäure auf einmal raus     | Mentos sinkt, Krater-Nahaufnahme, Fontäne meterhoch                         | nur draußen, Hinweis                | Essen     |
| 🔥 … einen Blitz in einer Flasche fangen könntest?        | Er würde dein Handy nur ein paar Stunden laden – so wenig Energie steckt drin (Fakten prüfen) | Blitz zuckt in die Flasche, LED-Akku füllt sich kläglich                    | unmöglich                           | Natur     |
| 🔥 … in ein Schwarzes Loch fällst?                        | Du wirst zur Spaghetti gezogen (bei kleinen Löchern – Fakten prüfen)                          | Low-Poly-Astronaut wird lang und länger                                     | unmöglich                           | Weltall   |

## Reserviert (in Arbeit)

| Thema  | Format | Datum      | Chat       |
| ------ | ------ | ---------- | ---------- |
| 🔥 MRT | A      | 2026-10-24 | Video: MRT |

## Verwendet

See `tiktok/serie.md` and the folders in `tiktok/` — the source of truth.
As of 2026-10-23: Kühlschrank, Airfryer, Aufzug, Airbag, Windrad,
Atomkraftwerk, Mikrowelle, Geschirrspüler, Rauchmelder, Fliegender Tesla,
Noise-Cancelling-Kopfhörer, Wassersprudler (Sodastream), Geldautomat,
Taschenwärmer, Popcorn, Kontaktlos bezahlen, Zapfpistole, Feuerzeug, Face ID,
Erde hört auf, sich zu drehen (B), Flugzeugtür (B).
