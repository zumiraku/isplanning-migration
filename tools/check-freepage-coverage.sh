#!/bin/sh
set -e
cd "$(dirname "$0")/.."

LIST=inventory/freepages-admin-list.csv
DIR=package/freepages
[ -f "$LIST" ] || { echo "missing $LIST" >&2; exit 1; }

work="${TMPDIR:-.}/.freepage-coverage.$$"
mkdir -p "$work"
trap 'rm -rf "$work"' EXIT

tail -n +2 "$LIST" | sed 's/^"//; s/".*//; s/\.html$//' | grep . | sort -u > "$work/admin"
ls "$DIR"/*.html 2>/dev/null | sed 's#.*/##; s/\.html$//' | sort -u > "$work/held"

comm -23 "$work/admin" "$work/held" > "$work/missing"
comm -13 "$work/admin" "$work/held" > "$work/extra"

printf "管理画面の一覧 %s ページ / 配信するもの %s ページ\n\n" \
  "$(wc -l < "$work/admin" | tr -d ' ')" "$(wc -l < "$work/held" | tr -d ' ')"

fail=0

if [ -s "$work/missing" ]; then
  echo "※ 管理画面にあるのに、こちらに無いページ"
  sed 's/^/   /' "$work/missing"
  echo ""
  fail=1
fi

if [ -s "$work/extra" ]; then
  echo "※ こちらにあるのに、管理画面の一覧に無いページ"
  echo "   （ページ番号を取り違えている可能性があります）"
  sed 's/^/   /' "$work/extra"
  echo ""
  fail=1
fi

[ "$fail" -eq 0 ] && echo "OK  両方向で一致。落としているページはありません"
echo ""

if grep -l -E '調査中|準備中|仮置き|あとで差し替え|TODO' "$DIR"/*.html >/dev/null 2>&1; then
  echo "※ 仮置きの文言が本文に残っています（そのままお客様に出ます）"
  grep -l -E '調査中|準備中|仮置き|あとで差し替え|TODO' "$DIR"/*.html | sed 's#.*/#   #'
  echo ""
  fail=1
else
  echo "OK  仮置きの文言は残っていません"
fi
echo ""

echo "本文の短いページ（元から短いものもあります。目視用）"
for f in "$DIR"/*.html; do
  n=$(sed -n '/<main/,/<\/main>/p' "$f" \
      | sed '/<nav class="breadcrumb"/,/<\/nav>/d' \
      | sed 's/<[^>]*>//g; s/<{[^}]*}>//g' \
      | tr -d ' 	' | grep -v '^$' | wc -c | tr -d ' ')
  printf "%6s  %s\n" "$n" "$(basename "$f")"
done | sort -n | head -6 | sed 's/^/   /'

exit "$fail"

