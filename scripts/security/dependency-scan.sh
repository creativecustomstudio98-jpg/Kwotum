#!/usr/bin/env bash
set -euo pipefail

# pnpm sends the dependency graph to the configured registry audit endpoint.
# Run in CI, or locally only after the repository owner accepts that disclosure.
pnpm audit --audit-level high
