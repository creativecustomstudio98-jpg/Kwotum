#!/usr/bin/env bash
set -euo pipefail

plugin_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if ! command -v rg >/dev/null 2>&1; then
  echo "WordPress connector checks require ripgrep (rg)." >&2
  exit 127
fi

php_minor="$(php -r 'echo PHP_MAJOR_VERSION . "." . PHP_MINOR_VERSION;')"

find "${plugin_root}" -type f -name '*.php' -print0 |
  while IFS= read -r -d '' file; do
    php -l "${file}" >/dev/null
  done

case "${php_minor}" in
  8.3|8.4)
    wordpress_versions=(6.8.3 6.9.2 7.0.2)
    ;;
  8.5)
    wordpress_versions=(6.9.2 7.0.2)
    ;;
  *)
    echo "Unsupported PHP ${php_minor}; expected 8.3, 8.4 or 8.5." >&2
    exit 1
    ;;
esac

for wordpress_version in "${wordpress_versions[@]}"; do
  WYCENO_TEST_WP_VERSION="${wordpress_version}" php "${plugin_root}/tests/unit.php"
done

if rg -n \
  'define\([[:space:]]*['"'"'"](?!WYCENO_CONNECTOR_)' \
  "${plugin_root}/wyceno-connector.php" --pcre2; then
  echo "Unprefixed plugin global detected." >&2
  exit 1
fi

for class_file in "${plugin_root}"/includes/*.php; do
  if ! rg -q '^namespace Wyceno\\Connector;' "${class_file}"; then
    echo "Plugin class is outside the Wyceno namespace: ${class_file}" >&2
    exit 1
  fi
done

if rg -n \
  'credential[^[:alnum:]_].*(console\.|data-|public-id=)|localStorage|sessionStorage' \
  "${plugin_root}/assets" "${plugin_root}/includes/class-embed.php" --ignore-case; then
  echo "Potential frontend secret storage or exposure detected." >&2
  exit 1
fi

echo "WordPress connector checks passed on PHP ${php_minor}."
