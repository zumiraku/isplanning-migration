#!/bin/sh
# build-freepage-package.sh — the 86 free pages, ready for フリーページ管理
#
# The console's フリーページ管理 takes one page at a time: a name, a URL and an
# HTML body. 86 of those is a long sitting, and the way it goes wrong is not
# dramatic - it is pasting page47 into page74's box at eleven at night.
#
# So this produces a package that removes every decision from that sitting:
#
#   package/freepages/<slug>.html   exactly what goes in the HTML box, nothing
#                                   to trim, no <html> or <head> around it
#   package/freepages/MANIFEST.csv  slug, title, current URL, byte count, and
#                                   the order to work through
#   package/freepages/README.md     the procedure
#
# Titles come from inventory/freepages-admin-list.csv, which is the admin's own
# list, not our guesses.
#
# Needs Git Bash. Run from the repository root.

src="templates/creator/freepages"
list="inventory/freepages-admin-list.csv"
out="package/freepages"

[ -d "$src" ]  || { echo "no $src"; exit 1; }
[ -f "$list" ] || { echo "no $list"; exit 1; }

rm -rf "$out"; mkdir -p "$out"

echo '"order","slug","title","current_url","bytes","note"' > "$out/MANIFEST.csv"

n=0
# Order: the pages with the most inbound internal links first. If the sitting is
# interrupted, what exists is the part the rest of the site points at.
for f in $(ls "$src"/*.html); do
  slug=$(basename "$f" .html)
  cp "$f" "$out/$slug.html"
  bytes=$(wc -c < "$f")
  title=$(sed 's/^"//; s/"$//' "$list" | awk -F'","' -v s="$slug" '$1==s{print $2}' | head -1)
  [ -z "$title" ] && title="(admin list に無し)"
  inbound=$(grep -l "$slug\.html" "$src"/*.html 2>/dev/null | wc -l)
  note=""
  case "$slug" in
    company|info|ordercontract|privacy)
      note="独自ページではなく専用画面。フリーページではなく該当ページのHTML欄へ" ;;
    page82) note="スマホ用カレンダー。公開リンクなし - 検証はこのページで" ;;
    page83) note="カテゴリーバナー。公開リンクなし" ;;
  esac
  n=$((n + 1))
  printf '"%s","%s","%s","%s","%s","%s"\n' \
    "$inbound" "$slug" "$title" "/html/$slug.html" "$bytes" "$note" >> "$out/MANIFEST.csv"
done

# Re-sort by inbound link count, descending, keeping the header.
{ head -1 "$out/MANIFEST.csv"; tail -n +2 "$out/MANIFEST.csv" | sort -t'"' -k2 -rn; } > "$out/_m.csv"
mv "$out/_m.csv" "$out/MANIFEST.csv"

echo ""
echo "pages packaged : $n"
echo "package        : $out"
echo ""
echo "most-linked-to pages, which is the order to work through:"
sed 's/"//g' "$out/MANIFEST.csv" | awk -F, 'NR>1 && NR<=9{printf "  %2s 本のリンク先  %-8s %s\n", $1, $2, substr($3,1,40)}'
