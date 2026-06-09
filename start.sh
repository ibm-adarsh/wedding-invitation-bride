#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PORT="${PORT:-8001}"
echo "Bride invitation → http://localhost:${PORT}"
python3 -m http.server "$PORT"
