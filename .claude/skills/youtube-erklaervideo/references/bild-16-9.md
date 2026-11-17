# Bild — the TikTok look in 16:9

The look is the TikTok series' look, unchanged:
`.claude/skills/bau-erklaervideo/references/visual-style.md` (realistic
diorama, `real.*` materials, rounded edges, lens depth of field, a new
world per topic, layers, life, sound effects, highlights, "Simple to look
at", "Realism") and the scene API
`.claude/skills/bau-erklaervideo/references/scene-api.md` (world.js,
environments.js, props.js, hud.js, hand.js — the same functions in the
16:9 kit). Read those once for the step that needs them; never read
`set-beispiele.js` whole (grep the piece you need). This file lists only
what is different in landscape and in long form.

## Frame and safe areas (1920 × 1080, 30 fps)

```text
 0 ┌──────────────────────────────────────────────────────────────┐
   │ [KAPITEL 3] Titel        Frage / Hook-Titel / WUSSTEST DU?   [Abonnieren]│  y 54–150: top line
150│                                                              │
   │   tags + hud panels            SUBJECT           LED panel   │  y 150–840: the picture
   │   (left / right third)        (middle)          (upper right)│  end chapter, last 20 s:
   │                                                              │  y 260–760 free of text
840│                                                              │  (YouTube end screen)
   │                 Untertitel: 2–4 Wörter, Mitte                │  y 872–968: captions
1026└──────────────────────────────────────────────────────────────┘
     title-safe x 96–1824
```

- **Captions:** 2–4 words per line, bottom centre (Montserrat 800, 64 px,
  keyword yellow 74 px — quietly: no pop, no camera punch, no punch sound;
  long form, 2026-11-15). Groups break at a sentence /
  phrase end, after 4 words, at ~24 characters or before a pause — the
  one-word TikTok style is too hectic for 16:9.
- **Title card** (chapter 0 only): the video title, calm and centred, after
  the intro's framing sentence (`kapitel.js titelBei`, a word of „Das ist die
  Geschichte …“), fades in, ~3.2 s, a soft whoosh. **No text on frame 0**
  — the cold open is a picture, like a documentary.
- **Chapter tag** (chapters 1 …): „KAPITEL n“ + the chapter title, top left,
  0.25–3.6 s; the finale says „FINALE“.
- **Question** (`kapitel.js frage`, optional, mostly empty in long form): top centre, ~6.5 s after the tag, back
  for a moment with a ding when its `antwort` word is spoken.
- **WUSSTEST DU?** badge top centre on „Übrigens“.
- **CTA pills** (mid-video, wherever they are spoken): white „Kommentieren“
  top left with the question before „Schreib's in die Kommentare.“; red
  „Abonnieren“ top right on „abonniere“ → tapped → „Abonniert“; each leaves
  after its sentence.
- **End screen** (finale): from its last line (the next-video pointer) on,
  ~20 s of calm, moving picture with nothing written in y 260–760
  (end-screen elements go there).
- **Labels:** the tag sits beside the part (±280 px), never below y 800 or
  above y 170. **HUD panels** in the left or right third (`hud.js` header).
  **LED panel** upper right.
- One text layer at a time on top, as on TikTok.

## Camera

- `FOV` 30° vertical (≈ 51° across) and shots pulled back ×2.0 by default
  (`shotCamera(shots)`): a shot written like a TikTok shot frames the
  subject with air left and right. Use `zoom: 1.2–1.5` for a macro.
- **Use the width:** the subject on a third line, the comparison object /
  analogy mini-set or the display on the other third; slow lateral dollies
  and orbits read better in 16:9 than pushes.
- **Rhythm (long form):** a change in the picture every **8–20 s**; most
  shots 5–15 s, slow camera moves while the narrator explains; let money
  shots breathe. **No TikTok editing** (2026-11-15): no zoom-punch on
  keywords (`PUNCH = 0` in world.js), **whoosh only on shots marked
  `whoosh: true`** (a jump to another place / time) or whip pans, not on
  every cut; the intro's cold open moves calmly into the scene, no
  1.5-s first cut rule. A **money shot every 2–3 min** (4–6 per video),
  highlights sparingly.
- X-ray at most ⅓ of each chapter; frame 0 of the hook never x-ray.

## Worlds — one main world + side scenes

- **Main world** (`youtube/<slug>/welt.js`): built like a TikTok world
  (bau-erklaervideo SKILL.md step 1b: concept, own light, ground, near ring,
  hero piece, far layer, life, quality bar, the 4-camera set check). It is
  copied into every chapter (`assets/welt.js`, `scripts/sync-kit.sh`) and
  carries most chapters, seen from different places and heights so it
  never looks the same twice in a row.
- **Side scenes** per chapter where the topic travels (inside the body,
  the deep sea, space, a lab): the chapter's own `assets/set.js` builds it
  instead of `import "./welt.js"`. 2–4 per video. Reuse kit pieces and
  props, and the TikTok episodes' sets as a cookbook
  (`tiktok/<slug>/assets/set.js`).
- A useful new piece (a building, a vehicle, an organ) goes into the kit
  (`kapitel-template/assets/props.js`) in the skill chat.

## Thumbnails

`scripts/make-thumbnail.sh` (see `verpackung.md`): moment + text + layout +
optional camera `'{"p":[x,y,z],"l":[x,y,z]}'`; the 3D look is the video's
own, so thumbnail and video match.
