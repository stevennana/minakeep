#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

echo "Current task:"
cat state/current-task.txt
echo ""

echo "Current cycle:"
cat state/current-cycle.json
echo ""

echo "Health summary:"
awk '
  /^- health: / {
    value = substr($0, 11)
  }
  END {
    if (value) {
      print value
    } else {
      print "(no cycles recorded yet)"
    }
  }
' state/run-log.md
echo ""

echo "Latest completed evaluation:"
cat state/evaluation.json
echo ""
echo "Backlog:"
cat state/backlog.md
