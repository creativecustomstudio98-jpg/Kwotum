#!/usr/bin/env bash
set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${repository_root}"

if ! command -v rg >/dev/null 2>&1; then
  echo "Static security checks require ripgrep (rg)." >&2
  exit 127
fi

scan_globs=(
  --glob '*.{cjs,js,jsx,mjs,ts,tsx}'
  --glob '!node_modules/**'
  --glob '!.git/**'
  --glob '!.next/**'
  --glob '!coverage/**'
  --glob '!scripts/security/**'
  --glob '!security/semgrep/kwotum.ts'
  --glob '!pnpm-lock.yaml'
)

fail_on_pattern() {
  local label="$1"
  local pattern="$2"
  local matches
  matches="$(rg -l --hidden "${scan_globs[@]}" "${pattern}" . || true)"
  if [[ -n "${matches}" ]]; then
    echo "SAST failure: ${label}" >&2
    echo "${matches}" >&2
    exit 1
  fi
}

fail_on_pattern "dynamic code execution" '\beval\s*\(|new\s+Function\s*\('
fail_on_pattern "direct DOM HTML injection" 'document\.write\s*\(|\.innerHTML\s*='
fail_on_pattern "TypeScript or ESLint suppression" '@ts-(ignore|nocheck)|eslint-disable'
fail_on_pattern "explicit any type" '(:|<|as)\s*any\b'

html_escape_files="$(rg -l --hidden "${scan_globs[@]}" 'dangerouslySetInnerHTML' . || true)"
if [[ "${html_escape_files}" != "./apps/web/app/(marketing)/components.tsx" ]]; then
  echo "SAST failure: unreviewed dangerouslySetInnerHTML usage" >&2
  echo "${html_escape_files}" >&2
  exit 1
fi

echo "Static security checks passed."
