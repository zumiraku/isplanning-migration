#!/bin/sh
# check-css-fresh.sh — 配信するCSSが、手元のCSSから作り直されているか
set -e
cd "$(dirname "$0")/.."

live=templates/creator/mode/all-pages.css
tmp="${TMPDIR:-.}/all-pages-fresh.css"

sh tools/build-all-pages-css.sh "$tmp" > /dev/null 2>&1

if [ ! -f "$live" ]; then
  echo "※ $live がありません"
  rm -f "$tmp"; exit 1
fi

if cmp -s "$live" "$tmp"; then
  printf "OK  all-pages.css は最新です（%s バイト）\n" "$(wc -c < "$live" | tr -d ' ')"
  rm -f "$tmp"
  exit 0
fi

echo "※ all-pages.css が古いです。tokens.css / components.css の変更が入っていません。"
printf "    手元 %s バイト / 作り直すと %s バイト\n" \
  "$(wc -c < "$live" | tr -d ' ')" "$(wc -c < "$tmp" | tr -d ' ')"
echo ""
echo "    差分の先頭:"
diff "$live" "$tmp" | head -12 | sed 's/^/      /'
echo ""
echo "    直し方:  sh tools/build-all-pages-css.sh"
rm -f "$tmp"
exit 1

