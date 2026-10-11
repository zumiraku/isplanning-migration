#!/bin/sh
set -e
cd "$(dirname "$0")/.."

CSV=package/url-bulk/categories-url.csv
[ -f "$CSV" ] || { echo "missing $CSV" >&2; exit 1; }

echo "書き換え前:"
for k in "/shopbrand/" "/shopdetail/" "/html/"; do
  n=$(grep -rohE "href=\"?[^\" >]*$k[^\" >]*" templates/creator/freepages/ templates/creator/mode/ 2>/dev/null | wc -l | tr -d ' ')
  printf "  %-14s %4s 本\n" "$k" "$n"
done

echo ""
echo "書き換え:"
perl tools/_rewrite-links.pl "$CSV" templates/creator/freepages/*.html templates/creator/mode/*.tpl

echo ""
echo "書き換え後:"
rest=0
for k in "/shopbrand/" "/shopdetail/" "/html/"; do
  n=$(grep -rohE "href=\"?[^\" >]*$k[^\" >]*" templates/creator/freepages/ templates/creator/mode/ 2>/dev/null | wc -l | tr -d ' ')
  printf "  %-14s %4s 本\n" "$k" "$n"
  rest=$((rest + n))
done

if [ "$rest" -ne 0 ]; then
  echo ""
  echo "  残っているもの:"
  grep -roh 'href="[^"]*\(/shopbrand/\|/shopdetail/\|/html/\)[^"]*"' templates/creator/freepages/ 2>/dev/null \
    | sort | uniq -c | sort -rn | head -20
  exit 1
fi

echo ""
echo "旧URLの残り 0 本"

