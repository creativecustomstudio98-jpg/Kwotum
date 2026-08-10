#!/usr/bin/env bash
set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
semgrep_image="semgrep/semgrep@sha256:207983631beecdbe7fa29196c7f4a7a5f29033933cdb76c687ce4a672e07618d"
semgrep_rules_repository_url="https://github.com/semgrep/semgrep-rules.git"
semgrep_rules_commit="40b8c63f75dc7c22c8a77482d73bfb864b146f7e"
semgrep_rules_manifest="${repository_root}/security/semgrep/upstream-owasp-rules.txt"
expected_upstream_config_count=551

if ! command -v git >/dev/null 2>&1; then
  echo "Semgrep CE requires git to retrieve the pinned upstream rules." >&2
  exit 127
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Semgrep CE requires Docker." >&2
  exit 127
fi

if [[ ! -f "${semgrep_rules_manifest}" ]]; then
  echo "Semgrep CE rules manifest is missing." >&2
  exit 1
fi

temporary_directory="$(mktemp -d "${TMPDIR:-/tmp}/kwotum-semgrep.XXXXXX")"
trap 'rm -rf -- "${temporary_directory}"' EXIT
rules_repository="${temporary_directory}/semgrep-rules"

run_isolated_git() {
  GIT_CONFIG_GLOBAL=/dev/null \
    GIT_CONFIG_NOSYSTEM=1 \
    GIT_TERMINAL_PROMPT=0 \
    git \
    -c protocol.allow=never \
    -c protocol.https.allow=always \
    "$@"
}

run_isolated_git init --quiet "${rules_repository}"
run_isolated_git -C "${rules_repository}" remote add origin "${semgrep_rules_repository_url}"
run_isolated_git -C "${rules_repository}" fetch \
  --depth 1 \
  --filter=blob:none \
  --quiet \
  origin \
  "${semgrep_rules_commit}"

actual_rules_commit="$(run_isolated_git -C "${rules_repository}" rev-parse FETCH_HEAD)"

if [[ "${actual_rules_commit}" != "${semgrep_rules_commit}" ]]; then
  echo "Semgrep rules commit mismatch; refusing to scan with unreviewed rules." >&2
  exit 1
fi

run_isolated_git -C "${rules_repository}" checkout --detach --quiet "${actual_rules_commit}"
echo "Semgrep rules commit ${actual_rules_commit} verified."

semgrep_config_arguments=(--config security/semgrep/kwotum.yml)
upstream_config_count=0

while IFS= read -r relative_rule_file || [[ -n "${relative_rule_file}" ]]; do
  if [[ -z "${relative_rule_file}" || "${relative_rule_file}" == \#* ]]; then
    continue
  fi

  if [[ "${relative_rule_file}" == /* || "/${relative_rule_file}/" == *"/../"* ]]; then
    echo "Unsafe path in Semgrep rules manifest: ${relative_rule_file}" >&2
    exit 1
  fi

  if [[ ! "${relative_rule_file}" =~ \.ya?ml$ ]]; then
    echo "Non-YAML path in Semgrep rules manifest: ${relative_rule_file}" >&2
    exit 1
  fi

  if [[ ! -f "${rules_repository}/${relative_rule_file}" ]]; then
    echo "Pinned Semgrep rule is missing: ${relative_rule_file}" >&2
    exit 1
  fi

  semgrep_config_arguments+=(--config "/opt/semgrep-rules/${relative_rule_file}")
  upstream_config_count=$((upstream_config_count + 1))
done < "${semgrep_rules_manifest}"

if [[ "${upstream_config_count}" -ne "${expected_upstream_config_count}" ]]; then
  echo "Semgrep rules manifest contains ${upstream_config_count} configs; expected ${expected_upstream_config_count}." >&2
  exit 1
fi

echo "Selected ${upstream_config_count} pinned upstream rule configuration files."

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
    -v "${rules_repository}:/opt/semgrep-rules:ro" \
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

echo "Scanning the repository with pinned upstream and repository-specific rules offline..."
run_semgrep scan \
  "${semgrep_config_arguments[@]}" \
  --disable-version-check \
  --error \
  --no-git-ignore \
  --exclude .git \
  --exclude .next \
  --exclude artifacts \
  --exclude coverage \
  --exclude node_modules \
  --exclude security/semgrep/kwotum.ts \
  --metrics=off \
  --strict
