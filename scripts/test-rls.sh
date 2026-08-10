#!/usr/bin/env bash
set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
temporary_root=""
postgres_url="${RLS_TEST_DATABASE_URL:-}"

cleanup() {
  if [[ -n "${temporary_root}" && -d "${temporary_root}" ]]; then
    pg_ctl -D "${temporary_root}/data" -m fast -w stop >/dev/null 2>&1 || true
    rm -rf "${temporary_root}"
  fi
}

trap cleanup EXIT

if [[ -z "${postgres_url}" ]]; then
  for required_command in initdb pg_ctl createdb psql; do
    if ! command -v "${required_command}" >/dev/null 2>&1; then
      echo "Missing ${required_command}. Set RLS_TEST_DATABASE_URL or install PostgreSQL." >&2
      exit 1
    fi
  done

  temporary_root="$(mktemp -d "${TMPDIR:-/tmp}/wyceno-rls.XXXXXX")"
  mkdir -p "${temporary_root}/socket"
  initdb -D "${temporary_root}/data" --auth=trust --no-locale --encoding=UTF8 >/dev/null
  pg_ctl -D "${temporary_root}/data" \
    -o "-F -k ${temporary_root}/socket -p 55439" \
    -w start >/dev/null
  createdb -h "${temporary_root}/socket" -p 55439 wyceno_rls
  postgres_url="postgresql://localhost:55439/wyceno_rls?host=${temporary_root}/socket"
fi

psql "${postgres_url}" -v ON_ERROR_STOP=1 -f "${repository_root}/supabase/tests/000_bootstrap.sql"
for migration in "${repository_root}"/supabase/migrations/*.sql; do
  psql "${postgres_url}" -v ON_ERROR_STOP=1 -f "${migration}"
done
psql "${postgres_url}" -v ON_ERROR_STOP=1 -f "${repository_root}/supabase/tests/tenant_isolation.sql"
psql "${postgres_url}" -v ON_ERROR_STOP=1 -f "${repository_root}/supabase/tests/flow_domain.sql"
psql "${postgres_url}" -v ON_ERROR_STOP=1 -f "${repository_root}/supabase/tests/widget_sessions.sql"
psql "${postgres_url}" -v ON_ERROR_STOP=1 -f "${repository_root}/supabase/tests/estimation.sql"
psql "${postgres_url}" -v ON_ERROR_STOP=1 -f "${repository_root}/supabase/tests/lead_pipeline.sql"
psql "${postgres_url}" -v ON_ERROR_STOP=1 -f "${repository_root}/supabase/tests/lead_operations.sql"
psql "${postgres_url}" -v ON_ERROR_STOP=1 -f "${repository_root}/supabase/tests/runtime_readiness.sql"
psql "${postgres_url}" -v ON_ERROR_STOP=1 -f "${repository_root}/supabase/tests/notification_delivery.sql"
psql "${postgres_url}" -v ON_ERROR_STOP=1 -f "${repository_root}/supabase/tests/webhook_delivery.sql"
psql "${postgres_url}" -v ON_ERROR_STOP=1 -f "${repository_root}/supabase/tests/flow_invitations.sql"
psql "${postgres_url}" -v ON_ERROR_STOP=1 -f "${repository_root}/supabase/tests/analytics.sql"
psql "${postgres_url}" -v ON_ERROR_STOP=1 -f "${repository_root}/supabase/tests/wordpress_connector.sql"
psql "${postgres_url}" -v ON_ERROR_STOP=1 -f "${repository_root}/supabase/tests/data_governance.sql"
