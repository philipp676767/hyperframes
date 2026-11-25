# Beispiel-Skript — Apollo 11 im YouTube-Stil (2026-11-15)

The reference for `sprechstil.md` and `aufbau.md`: the whole script of a
10–12-min video, written after the user's feedback on YouTube #1 („wirkt
wie ein langes TikTok“). Read it before writing a new script — for the
voice, the intro formula, the chapter shape, the CTA (subscribe at the end
of the intro, comment question in chapter 5) and the epilogue finale. Do not copy sentences
into other topics. Facts checked against NASA sources (2026-11-15); the
remaining fuel at touchdown is phrased as the crew saw it, because later
analyses found a little more.

## Verpackung

- **Titel:** Apollo 11: Warum die Mondlandung fast gescheitert wäre (55 Zeichen)
- **Thumbnail A:** Mondfähre wenige Meter über dem Mond, Staub, Erde am Himmel — „MONDLANDUNG <em>FAST GESCHEITERT</em>“ (links)
- **Thumbnail B:** Helmvisier, in dem sich die Mondoberfläche spiegelt — „APOLLO 11: <em>DER ALARM</em>“
- **Thumbnail C:** winzige Mondfähre neben einem riesigen Smartphone — „MONDLANDUNG MIT <em>4 KB</em>“
- **Ein-Sekunden-Test:** A „Mondlandung, die fast schiefging“ ✓ · B „Apollo 11, ein Alarm“ ✓ · C „Mondlandung mit wenig Computer“ ✓
- **Hauptfrage:** Wie konnte die Landung trotzdem gelingen?
- **Suchwort:** Mondlandung / Apollo 11

## Skript (1 Zeile = 1 Absatz = 1 Zeile in `script.txt`)

### 00 — Intro

The documentary formula (`aufbau.md` „The intro“): archive quote (only
because it fits here) → „Es ist …“ scene cut before the climax → thesis →
three guiding questions → „Das ist die Geschichte …“ → the subscribe
sentence. The `»` lines are the archive voice with `radio.sh funk` — they
fit because they are the **real radio calls** of 20 July 1969, word for
word, heard over the radio. A topic without such recorded radio / phone /
broadcast words starts directly with „Es ist …“.

```text
»Programmalarm.« »Es ist ein Zwölf-null-zwei.«
»Noch sechzig Sekunden.«
Es ist Sonntag, der 20. Juli 1969. Die Mondfähre Eagle sinkt der Oberfläche des Mondes entgegen. An Bord stehen Neil Armstrong, 38 Jahre alt, und Buzz Aldrin, 39, in einer Kabine, die kaum größer ist als eine Telefonzelle. Bis eben lief alles nach Plan. Dann leuchtet eine Warnlampe auf, und auf dem Display erscheint eine Zahl, die keiner der beiden aus dem Training kennt.
In Houston weiß in diesem Moment niemand, ob die erste *Mondlandung* abgebrochen werden muss. Dabei hängt alles an einem Computer, der weniger Arbeitsspeicher hat als ein einziges Foto auf deinem Handy.
Es gibt Momente, nach denen die Welt eine andere ist. Dieser Sonntag im Juli 1969 ist so einer. Wie konnte eine Mission mit so wenig Rechenleistung überhaupt bis zum Mond kommen? Was bedeutete der Alarm, den niemand kannte? Und wie knapp war es am Ende wirklich?
Das ist die Geschichte der ersten Mondlandung und der zwölf Minuten, in denen sie fast gescheitert wäre. Wenn du keine dieser Geschichten verpassen willst, abonniere den Kanal.
```

### 01 — Ein Versprechen ohne Plan

```text
Im Oktober 1957 piept ein kleiner Metallball über Amerika hinweg. Sputnik, der erste künstliche Satellit, stammt aus der Sowjetunion, und für viele Amerikaner ist das ein Schock: Mitten im Kalten Krieg ist der Gegner im Weltall angekommen.
Vier Jahre später kommt es noch schlimmer. Im April 1961 umkreist Juri Gagarin als erster Mensch die Erde, und wieder sind die Sowjets zuerst da. Wenige Wochen danach tritt Präsident John F. Kennedy vor den Kongress und verspricht etwas, das damals fast verrückt klingt: noch vor dem Ende des Jahrzehnts einen Menschen auf dem Mond zu landen und sicher zurückzubringen.
Das Problem ist nur, dass zu diesem Zeitpunkt ein einziger Amerikaner im All war, und auch das nur für eine Viertelstunde. Niemand weiß, wie man zum Mond fliegt, wie man dort landet oder wie man wieder wegkommt.
Also beginnt das größte Technikprojekt, das es bis dahin gegeben hat, mit rund 400.000 Menschen in Fabriken und Laboren im ganzen Land. Doch bevor irgendjemand landen kann, braucht es etwas, das stark genug ist, um überhaupt dorthin zu kommen.
```

### 02 — Das stärkste Ding, das je gebaut wurde

```text
Am Morgen des 16. Juli 1969 steht in Florida die Saturn V auf der Startrampe, eine Rakete, die mit 110 Metern höher ist als die Freiheitsstatue samt Sockel. Ganz oben, in einer kleinen Kapsel, liegen drei Männer auf dem Rücken: Neil Armstrong, Buzz Aldrin und Michael Collins.
Wie so ein Koloss abhebt, kennst du von einem Luftballon. Lässt du ihn los, schießt die Luft nach hinten heraus, und der Ballon fliegt in die andere Richtung. Die Saturn V macht genau das, nur dass statt Luft brennendes Gas aus fünf riesigen Triebwerken strömt, und zwar rund 13 Tonnen Treibstoff in jeder Sekunde.
Der eigentliche Kniff steckt aber in ihrem Aufbau. Die Rakete besteht aus drei Stufen, die übereinander gestapelt sind, und jede wird abgeworfen, sobald ihr Tank leer ist. Nach knapp drei Minuten fällt die erste Stufe ins Meer, und von dem gewaltigen Turm vom Start ist nach zwölf Minuten im Erdorbit nur noch ein kleiner Teil übrig.
Was die wenigsten der Zuschauer an den Fernsehern wissen: Gesteuert wird der Flug nicht von den Astronauten allein, sondern von einem Computer, der für seine Zeit ein kleines Wunder ist.
```

### 03 — Ein Computer aus Draht

```text
Computer sind in den Sechzigern so groß wie ganze Räume. Für Apollo aber muss einer in ein Raumschiff passen, kaum größer als ein Aktenkoffer, und er muss zuverlässiger sein als alles, was es bis dahin gab. Gebaut wird er am MIT in Boston, und die Software dafür entwickelt ein Team unter der Leitung einer jungen Programmiererin namens Margaret Hamilton.
Der Apollo Guidance Computer hat einen Arbeitsspeicher von rund 4 Kilobyte. Dein Handy hat heute ungefähr eine Million Mal so viel. Sein Programm steckt nicht auf einer Festplatte, sondern in sogenanntem Seilspeicher: Kupferdrähte, die von Hand durch winzige Magnetringe gefädelt werden.
Gewebt wird das monatelang von Frauen, die vorher oft in Textilfabriken gearbeitet haben, und jeder falsch gefädelte Draht wäre ein Fehler, der sich nie mehr löschen lässt.
Hamiltons Team denkt deshalb an etwas, das damals kaum jemand für nötig hält: Was passiert, wenn der Computer mehr Arbeit bekommt, als er schaffen kann? Ihre Antwort ist eine feste Rangordnung. Wird es zu viel, wirft er alles Unwichtige weg und macht nur noch, was das Leben der Crew sichert. Genau diese Entscheidung wird vier Tage nach dem Start alles retten.
```

### 04 — Drei Tage durch die Leere

```text
Nach anderthalb Erdumrundungen zündet die dritte Stufe noch einmal und schießt das Raumschiff mit fast 40.000 Kilometern pro Stunde aus der Erdumlaufbahn. Vor den Astronauten liegen jetzt rund 384.000 Kilometer, eine Strecke, für die ein Auto mit Autobahntempo ohne Pause mehr als vier Monate bräuchte.
Unterwegs löst Michael Collins die Kapsel Columbia von der Rakete, dreht sie um und dockt an die Mondfähre an, die zusammengefaltet in der letzten Stufe steckt.
Den Mond trifft man dabei nicht, indem man auf ihn zielt. Die Crew fliegt dorthin, wo er in drei Tagen sein wird, ungefähr so, wie ein Fußballer den Pass nicht zum Mitspieler spielt, sondern dorthin, wo der Mitspieler gleich sein wird. Ein paar kleine Kurskorrekturen reichen, und am vierten Tag schwenkt Apollo 11 auf der Rückseite des Mondes in die Umlaufbahn ein, ohne Funkkontakt zur Erde.
Am 20. Juli steigen Armstrong und Aldrin in die Eagle um. Die Wände der Fähre sind an manchen Stellen dünner als ein Fingernagel, denn jedes Kilo zählt. Dann trennen sich die beiden Raumschiffe, und Eagle beginnt den Abstieg zur Oberfläche.
```

### 05 — Zwölf-null-zwei (re-hook ~55 %, comment question ~62 %)

```text
[serious] Jetzt kommen wir zu den zwölf Minuten, in denen die Mission fast gescheitert wäre. Eagle ist noch rund zehn Kilometer über dem Mond, als der Alarm losgeht, mit dem diese Geschichte begonnen hat. Armstrong fragt nach Houston, was der Alarm Zwölf-null-zwei bedeutet.
Im Kontrollzentrum sitzt Steve Bales, 26 Jahre alt, verantwortlich für die Navigation. Er hat Sekunden, um zu entscheiden, ob die Landung abgebrochen wird. In einem Raum dahinter blättert ein noch jüngerer Ingenieur, Jack Garman, durch seine handgeschriebene Liste aller Alarmcodes und findet die Zeile, die er braucht.
Was passiert ist: Ein Radar, das nur für den Rückflug gedacht war, ist eingeschaltet geblieben und stiehlt dem Computer ständig Rechenzeit. Der Computer ist überlastet, startet in Sekundenbruchteilen neu und tut genau das, wofür Hamiltons Team ihn gebaut hat: Er wirft alles Unwichtige weg und rechnet nur noch die Landung.
Garmans Urteil ist knapp. Solange der Alarm nicht ununterbrochen kommt, darf Eagle weiterfliegen. Bales gibt das Go, und in den nächsten Minuten kommen noch weitere Alarme, jedes Mal mit derselben Antwort.
Hättest du an Bales' Stelle abgebrochen oder weitergemacht? Schreib's in die Kommentare. Denn kaum ist das Problem mit dem Computer gelöst, sieht Armstrong aus dem Fenster etwas, das deutlich gefährlicher ist.
```

### 06 — Die letzten Sekunden

```text
Der Autopilot steuert Eagle direkt auf einen Krater zu, um den herum Felsbrocken liegen, manche so groß wie Autos. Auf solchem Boden könnte die Fähre umkippen, und dann gäbe es keinen Weg zurück. Armstrong übernimmt deshalb teilweise die Steuerung von Hand und fliegt flach über das Geröllfeld hinweg, auf der Suche nach einem ebenen Platz.
Das kostet Treibstoff, und davon ist ohnehin kaum noch etwas übrig. Aus Houston kommen die Ansagen in nüchternem Ton: noch sechzig Sekunden, dann noch dreißig. Erreicht der Zähler null, muss die Landung abgebrochen werden, ganz gleich, wie nah der Boden ist.
Unter Eagle wirbelt das Triebwerk inzwischen so viel Mondstaub auf, dass Armstrong die Oberfläche kaum noch erkennt. Er setzt trotzdem weiter ab, Meter für Meter, bis eine der Sonden an den Landebeinen den Boden berührt und eine Lampe im Cockpit aufleuchtet.
[relieved] Dann funkt Armstrong den Satz, auf den die ganze Welt gewartet hat: „Houston, hier ist der Stützpunkt Tranquility. Der Adler ist gelandet.“ In Houston antwortet der Sprecher, dass hier gerade eine ganze Menge Leute blau angelaufen seien, und jetzt endlich wieder atmen.
```

### 07 — Ein kleiner Schritt

```text
Gut sechs Stunden nach der Landung klettert Armstrong die Leiter hinunter, und eine Kamera überträgt das grobe Schwarz-Weiß-Bild zu schätzungsweise 600 Millionen Menschen auf der Erde.
„Das ist ein kleiner Schritt für einen Menschen, aber ein riesiger Sprung für die Menschheit.“ Kurz darauf steht auch Aldrin auf dem Mond. Die beiden merken schnell, dass Gehen hier anders funktioniert: Bei einem Sechstel der Erdanziehung ist Hüpfen bequemer als Laufen.
Rund zweieinhalb Stunden bleiben sie draußen. Sie sammeln gut 21 Kilogramm Gestein, stellen eine Flagge, ein Messgerät für Mondbeben und eine Platte voller kleiner Spiegel auf, die Licht genau dorthin zurückwerfen, woher es kommt.
Währenddessen kreist Michael Collins allein in Columbia um den Mond, hinter dem er jedes Mal ohne Funkkontakt verschwindet. Er weiß: Wenn Eagle nicht wieder startet, muss er ohne die beiden nach Hause fliegen.
```

### 08 — Ein Filzstift rettet den Rückflug

```text
Zurück in der Fähre entdeckt Aldrin auf dem Boden ein abgebrochenes Stück Plastik. Es gehört zu einem Sicherungsschalter, und zwar ausgerechnet zu dem, der den Motor für den Rückstart scharf schaltet.
Ohne diesen Schalter würde Eagle den Mond nie wieder verlassen. Aldrin steckt deshalb einen Filzstift in die kleine Öffnung, drückt den Kontakt damit hinein, und der Schalter rastet ein. Ein Stift für ein paar Cent entscheidet in diesem Moment über die Heimkehr zweier Menschen.
Der Start gelingt. Der Unterteil der Fähre bleibt als Startrampe auf dem Mond zurück, der Oberteil fliegt hinauf zu Columbia und dockt an. Danach wird auch Eagle zurückgelassen, und die drei machen sich auf den dreitägigen Weg zur Erde.
Am 24. Juli tritt die Kapsel mit fast 40.000 Kilometern pro Stunde in die Atmosphäre ein. Ihr Hitzeschild wird dabei rund 2.700 Grad heiß, etwa halb so heiß wie die Oberfläche der Sonne, bis drei Fallschirme die Kapsel über dem Pazifik abbremsen.
```

### 09 — Finale (`ende`) — answer, epilogue, closing image

```text
Wie also konnte die Landung gelingen, obwohl so viel schiefging? Nicht, weil alles perfekt lief, sondern weil hunderttausende Menschen vorher an genau diese Fehler gedacht hatten: an einen überlasteten Computer, an einen Piloten, der im letzten Moment selbst steuern muss, und an Ansagen, die jede Sekunde Treibstoff mitzählen.
Neil Armstrong fliegt nie wieder ins All. Er unterrichtet später als Professor für Luft- und Raumfahrttechnik in Cincinnati, gibt kaum Interviews und stirbt 2012. Und Margaret Hamilton erhält 2016 die Freiheitsmedaille, die höchste zivile Auszeichnung der USA, für die Software, die an diesem Tag die Landung gerettet hat.
Der Unterteil der Eagle steht bis heute im Meer der Ruhe. Daneben liegt die Platte mit den kleinen Spiegeln, die bis heute mit Lasern von der Erde angepeilt wird. So wissen wir übrigens, dass sich der Mond jedes Jahr um knapp vier Zentimeter von uns entfernt.
Wenn du heute Nacht zum Mond hinaufschaust: Irgendwo dort, im Meer der Ruhe, sind die Spuren dieses Sonntags noch immer da.
Und wie Apollo 13 nach einer Explosion mitten im All trotzdem heimkam, siehst du in diesem Video.
```

## What the self-check caught in the first draft (now fixed above)

| Where | Problem                                                                              | Fix                                                               |
| ----- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| 01    | „in den folgenden Jahren“ — fine now, but a "folg…" word was the TikTok pill trigger | „in den Jahren danach“                                            |
| 08    | „heißer als die Oberfläche der Sonne“ — wrong (shield ~2.700 °C, Sun ~5.500 °C)      | „rund 2.700 Grad, etwa halb so heiß wie die Oberfläche der Sonne“ |
| 04    | „ein halbes Jahr mit dem Auto“ — 384.000 km at 120 km/h ≈ 4½ months                  | „mehr als vier Monate“                                            |
| 04    | quarterback — a US picture                                                           | the football pass into the run                                    |
| 02    | „eigentlich“ — filler                                                                | cut                                                               |

## Numbers

1753 words → at 2.5 words/s ≈ 11:41 + the 20-s end screen. Sentences median ~14 words. Questions: the 3 guiding questions of the intro, then 0–2 per chapter. Delivery tags: 2 in the whole video. 3 archive quotes. Subscribe sentence at the end of the intro (≈ 9 %), comment question in chapter 5 (≈ 62 %), the finale is an epilogue and points to the next video.
