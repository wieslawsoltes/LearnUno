#!/usr/bin/env bash
# Preserve compiler failure through logging. A successful tee is not a successful build.
set -euo pipefail
if [[ $# -ne 3 ]]; then
  printf 'Usage: %s <runner-metadata.dll> <lessons.json> <report.log>\n' "$0" >&2
  exit 64
fi
metadata=$1
lessons=$2
report=$3
mkdir -p -- "$(dirname "$report")"
dotnet run --project tests/CompilerTests -c Release -- "$metadata" "$lessons" 2>&1 | tee "$report"
