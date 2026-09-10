#!/bin/sh
# check-tax-display.sh — 税抜価格を「税込」と書いて出していないか
set -e
cd "$(dirname "$0")/.."

files="templates/creator/mode/category.tpl templates/creator/mode/search.tpl
templates/creator/mode/top-body.tpl templates/creator/mode/detail.tpl
templates/creator/mode/cart-body.tpl"

hits=""
for f in $files; do
  [ -f "$f" ] || continue
  h=$(grep -n 'price_excluded_tax' "$f" | grep -v '<{\*' | grep -v '^\s*[0-9]*: *#' | grep -v '税別' | grep -v '税抜' || true)
  [ -n "$h" ] && hits="$hits$f
$h
"
done

for f in package/templates/*.tpl package/modules/*.tpl; do
  [ -f "$f" ] || continue
  h=$(grep -n 'price_excluded_tax' "$f" | grep -v '<{\*' | grep -v '税別' | grep -v '税抜' || true)
  [ -n "$h" ] && hits="$hits$f
$h
"
done

if [ -n "$(printf '%s' "$hits" | tr -d '[:space:]')" ]; then
  echo "※ 税抜の価格タグが使われています"
  echo "   C36 と同じ間違いです。「（税込）」の見出しの下に税抜が出ます。"
  printf '%s\n' "$hits" | sed 's/^/   /'
  exit 1
fi

echo "OK  税抜の価格タグはどこにも使われていません"

LIST="templates/creator/mode/category.tpl templates/creator/mode/search.tpl
templates/creator/mode/top-body.tpl templates/creator/mode/cart-body.tpl"

bad=""
for f in $LIST; do
  [ -f "$f" ] || continue
  h=$(grep -n 'card__price' "$f" | grep '<{\$' | grep -v '円' || true)
  [ -n "$h" ] && bad="$bad$f
$h
"
  h=$(grep -n 'card__price' "$f" | grep '<{\$' | grep -v '（税込）' || true)
  [ -n "$h" ] && bad="$bad$f
$h
"
done

if [ -n "$(printf '%s' "$bad" | tr -d '[:space:]')" ]; then
  echo ""
  echo "※ 一覧の価格に「円」または「（税込）」が付いていません"
  echo "   タグが返すのは 44572 のような生の整数です。単位はこちらで書きます。"
  printf '%s\n' "$bad" | sed 's/^/   /'
  exit 1
fi

n=0
for f in $LIST; do
  [ -f "$f" ] || continue
  c=$(grep -c 'card__price.*<{\$' "$f" || true)
  n=$((n + c))
done
echo "OK  一覧の価格 $n 箇所すべてに 円（税込） が付いています"
exit 0
