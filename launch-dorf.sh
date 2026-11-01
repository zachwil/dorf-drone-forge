#!/usr/bin/env bash
set -euo pipefail
dorf_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
unset ELECTRON_RUN_AS_NODE
for runtime in electron43 electron electron45 electron44; do
  if command -v "$runtime" >/dev/null 2>&1; then
    exec "$runtime" "$dorf_dir/desktop" "$@"
  fi
done
printf '%s\n' 'Dorf needs Electron. Install an Electron runtime using your Linux package manager.' >&2
exit 1
