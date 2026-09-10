#!/bin/sh
# build-category-titles.sh — restore the 606 per-category page titles
set -e
cd "$(dirname "$0")/.."

SEO=inventory/categories-seo-backup.csv
URLC=package/url-bulk/categories-url.csv
MODULE=contingency/category_title.tpl
REF=contingency/_category-title-ref.tpl
OVERRIDE=inventory/category-code-overrides.csv
REPORT=inventory/category-titles-report.csv

for f in "$SEO" "$URLC" "$OVERRIDE"; do
  [ -f "$f" ] || { echo "missing $f" >&2; exit 1; }
done
mkdir -p package/modules

perl tools/_category-title.pl "$SEO" "$URLC" "$OVERRIDE" "$MODULE" "$REF" "$REPORT"

echo ""
printf "  %-42s %8s bytes\n" "$MODULE" "$(wc -c < "$MODULE")"
printf "  %-42s %8s bytes\n" "$REF"    "$(wc -c < "$REF")"
printf "  %-42s %8s bytes\n" "$REPORT" "$(wc -c < "$REPORT")"

