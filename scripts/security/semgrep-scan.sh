#!/usr/bin/env bash
set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
semgrep_image="semgrep/semgrep@sha256:207983631beecdbe7fa29196c7f4a7a5f29033933cdb76c687ce4a672e07618d"
semgrep_rules_url="https://semgrep.dev/c/p/owasp-top-ten"
semgrep_rules_sha256="4edd262b86fee3840cde879037d52a87299cbb47df55e3e0c049eddd13831024"

if ! command -v curl >/dev/null 2>&1; then
  echo "Semgrep CE requires curl to retrieve the checksummed OWASP ruleset." >&2
  exit 127
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Semgrep CE requires Docker." >&2
  exit 127
fi

temporary_directory="$(mktemp -d "${TMPDIR:-/tmp}/kwotum-semgrep.XXXXXX")"
trap 'rm -rf -- "${temporary_directory}"' EXIT
rules_file="${temporary_directory}/owasp-top-ten.yml"

curl \
  --fail \
  --location \
  --proto '=https' \
  --retry 3 \
  --retry-all-errors \
  --silent \
  --show-error \
  --tlsv1.2 \
  "${semgrep_rules_url}" \
  --output "${rules_file}"

if command -v shasum >/dev/null 2>&1; then
  actual_rules_sha256="$(shasum -a 256 "${rules_file}" | awk '{print $1}')"
elif command -v sha256sum >/dev/null 2>&1; then
  actual_rules_sha256="$(sha256sum "${rules_file}" | awk '{print $1}')"
else
  echo "Semgrep CE requires shasum or sha256sum to verify the ruleset." >&2
  exit 127
fi

if [[ "${actual_rules_sha256}" != "${semgrep_rules_sha256}" ]]; then
  echo "Semgrep ruleset checksum mismatch; review upstream changes before updating the pin." >&2
  exit 1
fi

echo "Semgrep OWASP ruleset checksum verified."

run_semgrep() {
  docker run --rm \
    --cap-drop ALL \
    --network none \
    --pids-limit 512 \
    --read-only \
    --security-opt no-new-privileges \
    --tmpfs /tmp:rw,nosuid,nodev,size=512m,mode=1777 \
    -e HOME=/tmp \
    -e SEMGREP_SEND_METRICS=off \
    -v "${repository_root}:/src:ro" \
    -v "${rules_file}:/opt/semgrep/owasp-top-ten.yml:ro" \
    --workdir /src \
    "${semgrep_image}" \
    semgrep "$@"
}

echo "Testing repository-specific Semgrep rules offline..."
run_semgrep \
  --disable-version-check \
  --metrics=off \
  --test \
  --config security/semgrep/kwotum.yml \
  security/semgrep/kwotum.ts

echo "Scanning the repository with OWASP and repository-specific rules offline..."
run_semgrep scan \
  --config /opt/semgrep/owasp-top-ten.yml \
  --config security/semgrep/kwotum.yml \
  --disable-version-check \
  --error \
  --exclude .next \
  --exclude artifacts \
  --exclude coverage \
  --exclude node_modules \
  --exclude security/semgrep/kwotum.ts \
  --metrics=off \
  --strict
