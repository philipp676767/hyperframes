#!/usr/bin/env python3
"""Split the finished video into parts that are each under 100 MB — the
user can only download files below that size from the chat.

  python3 -I .claude/skills/youtube-erklaervideo/scripts/split-video.py <slug> [--max-mb 95]

Reads youtube/<slug>/renders/<slug>-final.mp4 (join-chapters.sh) and writes
youtube/<slug>/renders/teile/<slug>-teil-<i>-von-<n>.mp4 plus teile.txt
(start / end / size of each part). Without re-encoding (-c copy): the
picture and sound stay exactly as rendered.

Cuts go at chapter starts whenever possible (each chapter file begins with
a keyframe, so a part ends at a chapter seam); only a chapter that alone is
bigger than the limit is cut inside, at the last keyframe that fits. Every
part is checked after writing; a part over the limit gets an extra cut a
keyframe earlier. Parts play on their own and join back losslessly in
order (any editor, or ffmpeg's concat demuxer).
"""
import argparse
import json
import subprocess
import sys
from bisect import bisect_right
from pathlib import Path


def run(cmd):
    return subprocess.run(cmd, check=True, capture_output=True, text=True).stdout


def duration(f):
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(f)]))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("slug")
    ap.add_argument("--max-mb", type=float, default=95.0, help="limit per part in MB (default 95, safely under 100)")
    ap.add_argument("--input", help="other input file (default renders/<slug>-final.mp4)")
    a = ap.parse_args()
    root = Path(run(["git", "rev-parse", "--show-toplevel"]).strip())
    vid = root / "youtube" / a.slug
    src = Path(a.input) if a.input else vid / "renders" / f"{a.slug}-final.mp4"
    if not src.exists():
        sys.exit(f"error: {src} not found — run join-chapters.sh first")
    limit = a.max_mb * 1_000_000
    total_len = duration(src)
    out_dir = vid / "renders" / "teile"
    out_dir.mkdir(parents=True, exist_ok=True)
    for old in out_dir.glob("*.mp4"):
        old.unlink()

    if src.stat().st_size <= limit:
        print(f"{src.name} is {src.stat().st_size / 1e6:.1f} MB — already under the limit, no split needed")
        return

    # bytes over time (all streams) and the keyframe times of the picture
    pk = json.loads(run(["ffprobe", "-v", "error", "-show_entries", "packet=pts_time,size,flags,stream_index",
                         "-of", "json", str(src)]))["packets"]
    pk = [p for p in pk if p.get("pts_time") not in (None, "N/A")]
    pk.sort(key=lambda p: float(p["pts_time"]))
    times = [float(p["pts_time"]) for p in pk]
    cum, s = [], 0
    for p in pk:
        s += int(p["size"])
        cum.append(s)

    def bytes_between(t0, t1):
        i0, i1 = bisect_right(times, t0 - 1e-6), bisect_right(times, t1 - 1e-6)
        return (cum[i1 - 1] if i1 else 0) - (cum[i0 - 1] if i0 else 0)

    keys = sorted({float(p["pts_time"]) for p in pk if p["stream_index"] == 0 and "K" in p["flags"]})
    # chapter starts = sums of chapter durations, snapped to the nearest keyframe
    chap = []
    t = 0.0
    for d in sorted((vid / "kapitel").glob("*/renders/kapitel.mp4")):
        t += duration(d)
        k = min(keys, key=lambda x: abs(x - t))
        if abs(k - t) < 0.5 and k < total_len - 1:
            chap.append(k)

    budget = limit * 0.97  # mp4 header + interleave overhead
    cuts, start = [], 0.0
    while bytes_between(start, total_len + 1) > budget:
        fit = [c for c in chap if c > start + 1 and bytes_between(start, c) <= budget]
        if not fit:
            fit = [k for k in keys if k > start + 1 and bytes_between(start, k) <= budget]
        if not fit:
            sys.exit(f"error: no keyframe after {start:.1f} s fits into {a.max_mb} MB")
        start = max(fit)
        cuts.append(start)

    mm = lambda x: f"{int(x // 60)}:{int(x % 60):02d}"
    while True:
        n = len(cuts) + 1
        # one pass with the segment muxer: cuts exactly at the keyframes (each
        # time 0.05 s early: the muxer cuts at the first keyframe after it),
        # no frame twice, no frame missing
        pattern = out_dir / f"{a.slug}-teil-%d-von-{n}.mp4"
        cmd = ["ffmpeg", "-v", "error", "-y", "-i", str(src), "-map", "0", "-c", "copy", "-f", "segment",
               "-segment_times", ",".join(f"{c - 0.05:.3f}" for c in cuts), "-segment_start_number", "1",
               "-reset_timestamps", "1", "-segment_format_options", "movflags=+faststart", str(pattern)]
        subprocess.run(cmd, check=True)
        bounds = [0.0, *cuts, total_len]
        parts = [out_dir / f"{a.slug}-teil-{k}-von-{n}.mp4" for k in range(1, n + 1)]
        if not all(p.exists() for p in parts):
            sys.exit(f"error: ffmpeg wrote fewer than {n} parts — check the cut times {cuts}")
        big = [k for k, p in enumerate(parts) if p.stat().st_size > limit]
        if not big:
            break
        k = big[0]
        earlier = [x for x in keys if bounds[k] + 1 < x < bounds[k + 1] - 0.01]
        if not earlier:
            sys.exit(f"error: part {k + 1} is {parts[k].stat().st_size / 1e6:.1f} MB and cannot be cut smaller")
        cuts = sorted([*cuts, earlier[-1]])  # an extra cut a keyframe earlier, then again
        for old in out_dir.glob("*.mp4"):
            old.unlink()
    lines, t = [], 0.0
    for k, p in enumerate(parts):  # real start / end from the written parts
        d = duration(p)
        lines.append(f"Teil {k + 1}/{n}: {mm(t)}–{mm(t + d)} · {p.stat().st_size / 1e6:.1f} MB · {p.name}")
        t += d

    (out_dir / "teile.txt").write_text(
        "\n".join(lines)
        + "\n\nWieder zusammenfügen (verlustfrei, Reihenfolge 1…n):\n"
        + "  printf \"file '%s'\\n\" " + " ".join(f"{a.slug}-teil-{k}-von-{n}.mp4" for k in range(1, n + 1))
        + " > liste.txt && ffmpeg -f concat -safe 0 -i liste.txt -c copy video.mp4\n",
        encoding="utf8",
    )
    print("\n".join(lines))
    print(f"-> {out_dir}")


if __name__ == "__main__":
    main()
