#!/usr/bin/env bash
# Old call style, kept for chapters built before 2026-11-19 — the real tool is
# scripts/make-thumbnail.py (styles, grades, labels, arrows; references/thumbnail.md).
#   bash scripts/make-thumbnail.sh <seconds> "<TEXT>" <links|rechts|oben|unten> <name> ['<cam json>']
set -euo pipefail
cd "$(dirname "$0")/.."
POS=${3:-rechts}
case "$POS" in links) POS=links ;; rechts) POS=rechts ;; oben) POS=oben ;; unten) POS=unten ;; esac
exec python3 -I scripts/make-thumbnail.py --at "${1:?seconds}" --text "${2:-}" --pos "$POS" --name "${4:-a}" --cam "${5:-}"
