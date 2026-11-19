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

**No text on the picture** (user's rule, 2026-11-17): no captions, no
title card, no chapter tag, no question, no „WUSSTEST DU?“ badge, no
subscribe / comment pills, no LED panel, no HUD displays — like the
documentary channels, the picture tells the story and the narrator
speaks. YouTube's own subtitles (automatic, switchable) cover deaf and
sound-off viewers; the chapters live in the description.

The **one exception: a name tag with an arrow** that points at something
and names or explains it (`LABELS` in beats.js → `labels()`): „Saturn V“,
„Bordcomputer“, „Radreifen gebrochen“. 1–3 per chapter, one at a time,
~2.5 s, the arrow touching its part.

- **Numbers and readings** belong **in the 3D world**: the display of the
  machine itself (the DSKY showing 1202, a speedometer in the cab, a clock
  on the wall), built as part of the scene — never an overlay panel
  (`showPanel()` and `hud.js` are switched off: `HF_NO_PANEL`, `HF_NO_HUD`
  in index.html).
- Name tags stay inside the title-safe area (x 96–1824, y 170–800), beside
  the part (±280 px), never on the subject.
- **End screen** (finale): from its last line (the next-video pointer) on,
  ~20 s of calm, moving picture; no tag in y 260–760 (end-screen elements
  go there).
- Thumbnails are the exception to the exception: they keep their 0–5 words
  (`verpackung.md`, `thumbnail.md`), because they are not part of the video.

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

`scripts/make-thumbnail.py` (see `thumbnail.md`): moment + own camera
`'{"p":[x,y,z],"l":[x,y,z]}'` + poster light + grade + crop + text / label;
the 3D look is the video's own, so thumbnail and video match — but lit and
framed like a film poster, not like the scene.
