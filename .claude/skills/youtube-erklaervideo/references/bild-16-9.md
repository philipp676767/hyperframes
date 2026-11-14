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
  keyword yellow 74 px, it pops when spoken). Groups break at a sentence /
  phrase end, after 4 words, at ~24 characters or before a pause — the
  one-word TikTok style is too hectic for 16:9.
- **Hook title** (chapter 0 only): 2–3 huge words top centre, on frame 0,
  gone at 3 s.
- **Chapter tag** (chapters 1 …): „KAPITEL n“ + the chapter title, top left,
  0.25–3.6 s; the finale says „FINALE“.
- **Question** (`kapitel.js frage`): top centre, ~6.5 s after the tag, back
  for a moment with a ding when its `antwort` word is spoken.
- **WUSSTEST DU?** badge top centre on „Übrigens“.
- **CTA pills** (end chapter): white „Kommentieren“ top left when the CTA
  line starts, red „Abonnieren“ top right on „Folge“ → tapped → „Abonniert“;
  both leave after the line. Then ~11–15 s of calm, moving picture with
  nothing written in y 260–760 (end-screen elements go there).
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
  shots 5–12 s, never > 20 s; the hook chapter cuts like TikTok (first cut
  ≤ 1.5 s, spectacle in frame 0, a highlight before 1.5 s). A **money shot
  every 2–3 min** (4–6 per video), highlights every ~20–30 s.
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
