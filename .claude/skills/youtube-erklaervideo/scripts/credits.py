#!/usr/bin/env python3
"""ElevenLabs credit budget of a YouTube video (user, 2026-11-24: every video
uses about 9 500 and at most 10 000 credits).

  python3 -I .claude/skills/youtube-erklaervideo/scripts/credits.py <slug> [--verbraucht N]

eleven_v3 charges 1 credit per character sent — spaces, punctuation and
[tags] included (measured: 303 characters = 303 credits). This counts
exactly what step 5.2 sends: per chapter the narrator lines of script.txt
joined to one paragraph with `*` removed, plus every archive quote (`»`
line) as its own piece without the `»`. Prints characters per chapter, the
total and whether the script fits the budget:

  9 300–9 800 characters in the script  → OK (leaves ≤ 200–700 for one
                                           repaired piece; total 9 500–10 000)
  more than 9 800                        → shorten before voicing
  less than 9 300                        → the video gets too short / cheap
                                           (budget is meant to be used)

--verbraucht N: credits already spent on this video (from fortschritt.md);
prints what is left of the 10 000.
"""
import argparse
import subprocess
import sys
from pathlib import Path

LOW, HIGH, CAP = 9300, 9800, 10000


def pieces(script):
    narr, quotes = [], []
    for line in script.read_text(encoding="utf8").splitlines():
        line = line.strip()
        if not line:
            continue
        if line.startswith("»"):
            quotes.append(line.lstrip("»").strip())
        else:
            narr.append(line.replace("*", ""))
    return " ".join(narr), quotes


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("slug")
    ap.add_argument("--verbraucht", type=int, default=0, help="credits already spent on this video")
    a = ap.parse_args()
    root = Path(subprocess.run(["git", "rev-parse", "--show-toplevel"], capture_output=True, text=True).stdout.strip())
    vid = root / "youtube" / a.slug
    scripts = sorted(vid.glob("kapitel/*/script.txt"))
    if not scripts:
        sys.exit(f"error: no kapitel/*/script.txt in {vid}")
    total = 0
    for s in scripts:
        narr, quotes = pieces(s)
        n, q = len(narr), sum(len(x) for x in quotes)
        total += n + q
        print(f"{s.parent.name:<20} {n:>6} Sprecher  {q:>5} Archiv ({len(quotes)} O-Töne)  {len(narr.split()):>4} Wörter")
    print(f"{'Summe':<20} {total:>6} Zeichen = Credits")
    if total > HIGH:
        print(f"ZU LANG: {total - HIGH} Zeichen kürzen (Ziel {LOW}–{HIGH}, Obergrenze des Videos {CAP} Credits)")
        code = 1
    elif total < LOW:
        print(f"ZU KURZ: {LOW - total} Zeichen fehlen bis {LOW} (Budget 9 500–10 000 Credits pro Video ausnutzen)")
        code = 1
    else:
        print(f"OK: im Budget ({LOW}–{HIGH}); Reserve für eine Reparatur: {CAP - total} Credits")
        code = 0
    if a.verbraucht:
        print(f"verbraucht: {a.verbraucht} · übrig vom Video-Budget: {CAP - a.verbraucht}")
    sys.exit(code)


if __name__ == "__main__":
    main()
