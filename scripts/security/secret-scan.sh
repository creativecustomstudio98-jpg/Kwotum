#!/usr/bin/env bash
set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${repository_root}"

if ! command -v rg >/dev/null 2>&1; then
  echo "Working-tree secret checks require ripgrep (rg)." >&2
  exit 127
fi

matches="$(
  rg -l --hidden \
    --glob '!node_modules/**' \
    --glob '!.git/**' \
    --glob '!.next/**' \
    --glob '!coverage/**' \
    --glob '!playwright-report/**' \
    --glob '!test-results/**' \
    --glob '!scripts/security/**' \
    --glob '!pnpm-lock.yaml' \
    --glob '!.env.example' \
    '(-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----|AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9_]{36,}|sk-(proj-)?[A-Za-z0-9_-]{32,}|sb_secret_[A-Za-z0-9_-]{20,})' \
    . || true
)"

if [[ -n "${matches}" ]]; then
  echo "Secret scan failure. Potential secret material found in:" >&2
  echo "${matches}" >&2
  exit 1
fi

echo "Working-tree secret checks passed."
