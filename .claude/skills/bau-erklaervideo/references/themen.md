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

Score each open candidate on these five; propose the best one plus two
alternatives:

1. **Jeder kennt es** — used weekly by almost everyone in Germany.
2. **Überraschendes Geheimnis** — the real mechanism contradicts what
   people assume ("ohne Strom", "wird gar nicht heiß", "hat keinen Akku").
3. **Spektakel zum Zeigen** — at least one money shot the 3D style can
   show big (spark, explosion, crystals shooting through, waves, flip).
4. **In 40 s erklärbar** — max 3 parts / terms.
5. **Weitererzählbar / selbst testbar** — the viewer can try it today or
   tells a friend ("Hand auf den Induktionsherd").

Also: vary the category from the last 2 episodes (kitchen → street →
money/tech → nature …), and use the **Saison** column (Silvester in late
December, Heizung / Taschenwärmer in winter, Klimaanlage / Ventilator in
summer). Before writing the script, check the key facts and numbers of
the topic (web search if available) and phrase anything uncertain safely.

## 3. Reserve it right away

As soon as the user says ok: move the topic from **Offen** to
**Reserviert** with the date, commit on `main` and push — _before_ the
script — so a parallel video chat can't take the same topic. When the
episode is logged in `tiktok/serie.md`, delete it from **Reserviert**.
When a topic from **Offen** is used up, add a new idea so there are
always 10+ open topics.

## Offen

| Thema                 | Hook-Idee                                                                                                                       | Money-Shot                                                           | Kategorie     | Saison        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------- | ------------- |
| Zapfpistole           | „Die Zapfpistole stoppt von allein – ganz ohne Strom und Elektronik.“                                                           | Benzin verschließt ein winziges Röhrchen, _klack_, der Hebel springt | Straße / Auto | –             |
| Feuerzeug             | „Dein Feuerzeug macht bei jedem Klick einen Mini-Blitz mit über 10.000 Volt.“                                                   | Hammer trifft Kristall, Funke springt, Flamme                        | Alltag        | –             |
| Induktionsherd        | „Dein Herd wird gar nicht heiß – der Topf heizt sich selbst.“                                                                   | Hand auf der kalten Platte, daneben kocht das Wasser                 | Küche         | –             |
| Blitzer               | „Der Blitzer weiß in Sekundenbruchteilen, wie schnell du bist.“                                                                 | Funkwellen prallen vom Auto ab, werden gestaucht, BLITZ              | Straße / Auto | –             |
| Ampel-Kontaktschleife | „Die Ampel weiß, dass du wartest. Im Asphalt liegt ein unsichtbarer Draht.“                                                     | Röntgenblick in die Straße, Auto fährt drauf, Ampel springt auf Grün | Straße / Auto | –             |
| Türschloss            | „Nur dein Schlüssel passt – weil fünf winzige Stifte genau in einer Linie stehen müssen.“                                       | Schlüssel schiebt die Stifte hoch, alle rasten ein, Zylinder dreht   | Zuhause       | –             |
| Silvesterrakete       | „Die Farben im Feuerwerk sind brennende Metalle.“                                                                               | Rakete steigt, Explosion, jede Farbe bekommt ein Schild              | Natur / Fest  | Ende Dezember |
| Kabellos laden        | „Dein Handy lädt ohne Kabel – zwei Spulen reden durch die Luft.“                                                                | Magnetfeld-Linien springen von Spule zu Spule, Akku füllt sich       | Geld / Tech   | –             |
| Heizkörper-Thermostat | „Dein Heizungsregler hat keinen Strom – er denkt mit Wachs.“                                                                    | Wachs dehnt sich aus, drückt den Stift, Ventil schließt              | Zuhause       | Herbst/Winter |
| Rolltreppe            | „Die Stufen der Rolltreppe verschwinden nicht – sie fahren unten kopfüber zurück.“                                              | Röntgenblick: Stufen klappen flach und laufen unter dem Boden zurück | Stadt         | –             |
| Schnellkochtopf       | „Dein Schnellkochtopf kocht Wasser bei 120 Grad – weil er die Luft einsperrt.“                                                  | Ventil zischt, Dampf schießt raus, Thermometer springt über 100      | Küche         | –             |
| Kaffeevollautomat     | „Deine Kaffeemaschine drückt das Wasser mit mehr Druck durchs Pulver als in deinem Autoreifen.“ (~9 bar Brühdruck, Zahl prüfen) | Wasser presst durch das Kaffeepulver, Crema schäumt in Zeitlupe      | Küche         | –             |
| Wasserkocher          | „Dein Wasserkocher weiß, wann das Wasser kocht – ohne Thermometer und ohne Chip.“                                               | Dampf trifft ein Bimetall-Plättchen, es biegt sich, _klack_, aus     | Küche         | –             |

## Reserviert (in Arbeit)

| Thema | Datum | Chat |
| ----- | ----- | ---- |

## Verwendet

See `tiktok/serie.md` and the folders in `tiktok/` — the source of truth.
As of 2026-10-23: Kühlschrank, Airfryer, Aufzug, Airbag, Windrad,
Atomkraftwerk, Mikrowelle, Geschirrspüler, Rauchmelder, Fliegender Tesla,
Noise-Cancelling-Kopfhörer, Wassersprudler (Sodastream), Geldautomat,
Taschenwärmer, Popcorn, Kontaktlos bezahlen.
